import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { JSX } from "react";
import { $createTextNode, $isTextNode, TextNode } from "lexical";

import {
  $createKjvInternalLinkNode,
  KjvInternalLinkNode,
} from "@/components/editor/nodes/kjv-internal-link-node";
import {
  buildNoteLinkHref,
  parseTypedBibleReference,
  typedBibleReferenceMatches,
} from "@/lib/note-links";
import type { Book } from "@/types/bible";

export function NoteLinkAutoLinkPlugin({
  books,
}: {
  books: Book[];
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      if (!$isTextNode(node) || !node.isSimpleText()) {
        return;
      }
      const parent = node.getParent();
      if (!parent) {
        return;
      }

      if (parent.getType() === "kjv-link") {
        const nextTarget = parseTypedBibleReference(parent.getTextContent(), books);
        if (!nextTarget) {
          return;
        }
        const nextHref = buildNoteLinkHref(nextTarget);
        const linkParent = parent as KjvInternalLinkNode;
        if (linkParent.getURL() !== nextHref) {
          linkParent.setURL(nextHref);
        }
        return;
      }

      if (parent.getType() === "link" || parent.getType() === "autolink") {
        return;
      }

      const text = node.getTextContent();
      const matches = typedBibleReferenceMatches(text, books);
      const match = matches[matches.length - 1];
      if (!match) {
        return;
      }

      const href = buildNoteLinkHref(match.target);
      let matchedNode: TextNode | null = null;
      if (match.index === 0 && match.length === text.length) {
        matchedNode = node;
      } else if (match.index === 0) {
        [matchedNode] = node.splitText(match.length);
      } else if (match.index + match.length === text.length) {
        [, matchedNode] = node.splitText(match.index);
      } else {
        [, matchedNode] = node.splitText(match.index, match.index + match.length);
      }

      if (!matchedNode) {
        return;
      }

      const linkNode = $createKjvInternalLinkNode(href);
      const linkText = $createTextNode(matchedNode.getTextContent());
      linkText.setFormat(matchedNode.getFormat());
      linkText.setDetail(matchedNode.getDetail());
      linkText.setStyle(matchedNode.getStyle());
      linkNode.append(linkText);
      matchedNode.replace(linkNode);
    });
  }, [books, editor]);

  return null;
}
