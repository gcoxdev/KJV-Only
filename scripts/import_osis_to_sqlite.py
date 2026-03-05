#!/usr/bin/env python3
"""Import OSIS XML into SQLite and reader JSON.

This script expects an OSIS source file (for example, from a CrossWire/SWORD
OSIS package) and produces:
1) A normalized SQLite database for advanced search.
2) A JSON file optimized for the basic reader UI.
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path
from typing import Any


BOOK_ORDER = [
    "Gen",
    "Exod",
    "Lev",
    "Num",
    "Deut",
    "Josh",
    "Judg",
    "Ruth",
    "1Sam",
    "2Sam",
    "1Kgs",
    "2Kgs",
    "1Chr",
    "2Chr",
    "Ezra",
    "Neh",
    "Esth",
    "Job",
    "Ps",
    "Prov",
    "Eccl",
    "Song",
    "Isa",
    "Jer",
    "Lam",
    "Ezek",
    "Dan",
    "Hos",
    "Joel",
    "Amos",
    "Obad",
    "Jonah",
    "Mic",
    "Nah",
    "Hab",
    "Zeph",
    "Hag",
    "Zech",
    "Mal",
    "Matt",
    "Mark",
    "Luke",
    "John",
    "Acts",
    "Rom",
    "1Cor",
    "2Cor",
    "Gal",
    "Eph",
    "Phil",
    "Col",
    "1Thess",
    "2Thess",
    "1Tim",
    "2Tim",
    "Titus",
    "Phlm",
    "Heb",
    "Jas",
    "1Pet",
    "2Pet",
    "1John",
    "2John",
    "3John",
    "Jude",
    "Rev",
]

BOOK_NAMES = {
    "Gen": "Genesis",
    "Exod": "Exodus",
    "Lev": "Leviticus",
    "Num": "Numbers",
    "Deut": "Deuteronomy",
    "Josh": "Joshua",
    "Judg": "Judges",
    "Ruth": "Ruth",
    "1Sam": "1 Samuel",
    "2Sam": "2 Samuel",
    "1Kgs": "1 Kings",
    "2Kgs": "2 Kings",
    "1Chr": "1 Chronicles",
    "2Chr": "2 Chronicles",
    "Ezra": "Ezra",
    "Neh": "Nehemiah",
    "Esth": "Esther",
    "Job": "Job",
    "Ps": "Psalms",
    "Prov": "Proverbs",
    "Eccl": "Ecclesiastes",
    "Song": "Song of Solomon",
    "Isa": "Isaiah",
    "Jer": "Jeremiah",
    "Lam": "Lamentations",
    "Ezek": "Ezekiel",
    "Dan": "Daniel",
    "Hos": "Hosea",
    "Joel": "Joel",
    "Amos": "Amos",
    "Obad": "Obadiah",
    "Jonah": "Jonah",
    "Mic": "Micah",
    "Nah": "Nahum",
    "Hab": "Habakkuk",
    "Zeph": "Zephaniah",
    "Hag": "Haggai",
    "Zech": "Zechariah",
    "Mal": "Malachi",
    "Matt": "Matthew",
    "Mark": "Mark",
    "Luke": "Luke",
    "John": "John",
    "Acts": "Acts",
    "Rom": "Romans",
    "1Cor": "1 Corinthians",
    "2Cor": "2 Corinthians",
    "Gal": "Galatians",
    "Eph": "Ephesians",
    "Phil": "Philippians",
    "Col": "Colossians",
    "1Thess": "1 Thessalonians",
    "2Thess": "2 Thessalonians",
    "1Tim": "1 Timothy",
    "2Tim": "2 Timothy",
    "Titus": "Titus",
    "Phlm": "Philemon",
    "Heb": "Hebrews",
    "Jas": "James",
    "1Pet": "1 Peter",
    "2Pet": "2 Peter",
    "1John": "1 John",
    "2John": "2 John",
    "3John": "3 John",
    "Jude": "Jude",
    "Rev": "Revelation",
}

BOOK_INDEX = {code: i + 1 for i, code in enumerate(BOOK_ORDER)}


@dataclass
class Token:
    text: str
    strong: str | None
    red_letter: bool


def local_tag(tag: str) -> str:
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def parse_int_suffix(value: str) -> int | None:
    match = re.search(r"(\d+)", value)
    return int(match.group(1)) if match else None


def extract_strong(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.replace("strong:", "").replace("x-Strongs:", "")
    match = re.search(r"([HG]\d{1,5})", normalized, flags=re.IGNORECASE)
    if not match:
        return None
    strong = match.group(1).upper()
    if strong[1:].isdigit():
        return f"{strong[0]}{int(strong[1:])}"
    return strong


def is_red_quote(elem: ET.Element) -> bool:
    if local_tag(elem.tag) != "q":
        return False
    who = (elem.attrib.get("who") or "").lower()
    return "jesus" in who or "christ" in who or "messiah" in who


def tokenize(text: str | None, strong: str | None, red_letter: bool) -> list[Token]:
    if not text:
        return []
    tokens: list[Token] = []
    for part in re.split(r"\s+", text.strip()):
        if not part:
            continue
        tokens.append(Token(text=part, strong=strong, red_letter=red_letter))
    return tokens


def parse_osis_ref(osis_id: str) -> tuple[str, int, int] | None:
    parts = osis_id.split(".")
    if len(parts) < 3:
        return None
    chapter_num = parse_int_suffix(parts[1])
    verse_num = parse_int_suffix(parts[2])
    if not chapter_num or not verse_num:
        return None
    return parts[0], chapter_num, verse_num


SKIP_TAGS = {"note", "header"}


def collect_chapter_tokens(
    chapter_elem: ET.Element, osis_book: str, chapter_num: int
) -> dict[int, list[Token]]:
    verses: dict[int, list[Token]] = {}
    state = {"current_verse": None}

    def push_text(text: str | None, strong: str | None, red: bool) -> None:
        current_verse = state["current_verse"]
        if current_verse is None:
            return
        for token in tokenize(text, strong, red):
            verses.setdefault(current_verse, []).append(token)

    def visit(elem: ET.Element, red_context: bool, strong_hint: str | None) -> None:
        tag = local_tag(elem.tag)

        if tag in SKIP_TAGS:
            return

        container_verse = False
        restore_verse = None

        if tag == "verse":
            e_id = elem.attrib.get("eID")
            if e_id:
                state["current_verse"] = None
                return

            osis_id = elem.attrib.get("osisID") or elem.attrib.get("sID")
            if osis_id:
                parsed = parse_osis_ref(osis_id)
                if parsed:
                    parsed_book, parsed_chapter, parsed_verse = parsed
                    if parsed_book == osis_book and parsed_chapter == chapter_num:
                        restore_verse = state["current_verse"]
                        state["current_verse"] = parsed_verse
                        has_sid = "sID" in elem.attrib
                        has_direct_text = bool(elem.text and elem.text.strip())
                        has_children = len(list(elem)) > 0
                        # Non-milestone verse container: close when element ends.
                        container_verse = not has_sid or has_direct_text or has_children

        current_red = red_context or is_red_quote(elem)
        current_strong = strong_hint

        if tag == "w":
            current_strong = extract_strong(elem.attrib.get("lemma"))

        push_text(elem.text, current_strong, current_red)

        for child in list(elem):
            visit(child, current_red, current_strong)
            push_text(child.tail, current_strong, current_red)

        if container_verse:
            state["current_verse"] = restore_verse

    visit(chapter_elem, False, None)
    return verses


def parse_osis(input_path: Path) -> list[dict[str, Any]]:
    tree = ET.parse(input_path)
    root = tree.getroot()

    books: list[dict[str, Any]] = []

    for div in root.iter():
        if local_tag(div.tag) != "div":
            continue
        if div.attrib.get("type") != "book":
            continue

        osis_book = div.attrib.get("osisID") or div.attrib.get("n") or ""
        osis_book = osis_book.strip()
        if osis_book not in BOOK_INDEX:
            continue

        chapters_by_number: dict[int, dict[str, Any]] = {}

        for chapter in div.iter():
            if local_tag(chapter.tag) != "chapter":
                continue

            chapter_osis = chapter.attrib.get("osisID") or ""
            if "." not in chapter_osis:
                continue
            chapter_num = parse_int_suffix(chapter_osis.split(".", 1)[1])
            if not chapter_num:
                continue

            verses_by_number: dict[int, dict[str, Any]] = {}
            chapter_tokens = collect_chapter_tokens(chapter, osis_book, chapter_num)

            for verse_num, tokens in chapter_tokens.items():
                if not tokens:
                    continue
                red_letter = any(token.red_letter for token in tokens)
                verses_by_number[verse_num] = {
                    "verse": verse_num,
                    "redLetter": red_letter,
                    "tokens": [
                        {"text": token.text, **({"strong": token.strong} if token.strong else {})}
                        for token in tokens
                    ],
                    "text": " ".join(token.text for token in tokens),
                    "tokenRows": [
                        {
                            "text": token.text,
                            "strong": token.strong,
                            "redLetter": token.red_letter,
                        }
                        for token in tokens
                    ],
                }

            if verses_by_number:
                chapters_by_number[chapter_num] = {
                    "chapter": chapter_num,
                    "verses": [verses_by_number[n] for n in sorted(verses_by_number)],
                }

        if chapters_by_number:
            books.append(
                {
                    "osisID": osis_book,
                    "name": BOOK_NAMES.get(osis_book, osis_book),
                    "order": BOOK_INDEX[osis_book],
                    "testament": "ot" if BOOK_INDEX[osis_book] <= 39 else "nt",
                    "chapters": [
                        chapters_by_number[n] for n in sorted(chapters_by_number)
                    ],
                }
            )

    books.sort(key=lambda book: book["order"])
    return books


def write_sqlite(db_path: Path, books: list[dict[str, Any]]) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")

    conn.executescript(
        """
        DROP TABLE IF EXISTS verse_fts;
        DROP TABLE IF EXISTS tokens;
        DROP TABLE IF EXISTS verses;
        DROP TABLE IF EXISTS chapters;
        DROP TABLE IF EXISTS books;

        CREATE TABLE books (
          id INTEGER PRIMARY KEY,
          osis_id TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          testament TEXT NOT NULL,
          book_order INTEGER NOT NULL
        );

        CREATE TABLE chapters (
          id INTEGER PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          chapter_num INTEGER NOT NULL,
          UNIQUE(book_id, chapter_num)
        );

        CREATE TABLE verses (
          id INTEGER PRIMARY KEY,
          chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
          verse_num INTEGER NOT NULL,
          text TEXT NOT NULL,
          red_letter INTEGER NOT NULL DEFAULT 0,
          UNIQUE(chapter_id, verse_num)
        );

        CREATE TABLE tokens (
          id INTEGER PRIMARY KEY,
          verse_id INTEGER NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
          token_index INTEGER NOT NULL,
          token_text TEXT NOT NULL,
          strong TEXT,
          red_letter INTEGER NOT NULL DEFAULT 0
        );

        CREATE VIRTUAL TABLE verse_fts USING fts5(
          reference,
          text
        );

        CREATE INDEX idx_books_order ON books(book_order);
        CREATE INDEX idx_chapters_book_chapter ON chapters(book_id, chapter_num);
        CREATE INDEX idx_verses_chapter_verse ON verses(chapter_id, verse_num);
        CREATE INDEX idx_tokens_verse_token ON tokens(verse_id, token_index);
        CREATE INDEX idx_tokens_strong ON tokens(strong);
        """
    )

    for book in books:
        book_cur = conn.execute(
            "INSERT INTO books (osis_id, name, testament, book_order) VALUES (?, ?, ?, ?)",
            (book["osisID"], book["name"], book["testament"], book["order"]),
        )
        book_id = int(book_cur.lastrowid)

        for chapter in book["chapters"]:
            chapter_cur = conn.execute(
                "INSERT INTO chapters (book_id, chapter_num) VALUES (?, ?)",
                (book_id, chapter["chapter"]),
            )
            chapter_id = int(chapter_cur.lastrowid)

            for verse in chapter["verses"]:
                verse_cur = conn.execute(
                    "INSERT INTO verses (chapter_id, verse_num, text, red_letter) VALUES (?, ?, ?, ?)",
                    (
                        chapter_id,
                        verse["verse"],
                        verse["text"],
                        1 if verse["redLetter"] else 0,
                    ),
                )
                verse_id = int(verse_cur.lastrowid)

                reference = f"{book['name']} {chapter['chapter']}:{verse['verse']}"
                conn.execute(
                    "INSERT INTO verse_fts(rowid, reference, text) VALUES (?, ?, ?)",
                    (verse_id, reference, verse["text"]),
                )

                for token_idx, token in enumerate(verse["tokenRows"]):
                    conn.execute(
                        """
                        INSERT INTO tokens (verse_id, token_index, token_text, strong, red_letter)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            verse_id,
                            token_idx,
                            token["text"],
                            token["strong"],
                            1 if token["redLetter"] else 0,
                        ),
                    )

    conn.commit()
    conn.close()


def write_reader_json(json_path: Path, books: list[dict[str, Any]], source: str) -> None:
    json_path.parent.mkdir(parents=True, exist_ok=True)

    reader_books = []
    for book in books:
        reader_books.append(
            {
                "name": book["name"],
                "chapters": [
                    {
                        "chapter": chapter["chapter"],
                        "verses": [
                            {
                                "verse": verse["verse"],
                                "redLetter": verse["redLetter"],
                                "tokens": verse["tokens"],
                            }
                            for verse in chapter["verses"]
                        ],
                    }
                    for chapter in book["chapters"]
                ],
            }
        )

    payload = {
        "metadata": {
            "source": source,
            "bookCount": len(reader_books),
            "chapterCount": sum(len(book["chapters"]) for book in reader_books),
            "verseCount": sum(
                len(chapter["verses"])
                for book in reader_books
                for chapter in book["chapters"]
            ),
        },
        "books": reader_books,
    }

    json_path.write_text(json.dumps(payload, ensure_ascii=True), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Import OSIS XML into SQLite and reader JSON")
    parser.add_argument("--input", required=True, help="Path to OSIS XML")
    parser.add_argument("--db", required=True, help="Output SQLite path")
    parser.add_argument("--json", required=True, help="Output reader JSON path")
    parser.add_argument(
        "--source-label",
        default="SWORD/OSIS",
        help="Metadata label stored in generated JSON",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print(
            f"Input file not found: {input_path}. Place a SWORD OSIS file there and run again.")
        return 1

    books = parse_osis(input_path)
    if not books:
        print(
            "No canonical book/chapter/verse content found in OSIS source. Verify the file format.")
        return 1

    write_sqlite(Path(args.db), books)
    write_reader_json(Path(args.json), books, args.source_label)

    verse_count = sum(
        len(chapter["verses"]) for book in books for chapter in book["chapters"]
    )
    print(
        "Built data artifacts:",
        f"books={len(books)}",
        f"verses={verse_count}",
        f"sqlite={args.db}",
        f"json={args.json}",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
