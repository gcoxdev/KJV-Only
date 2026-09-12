"""Extract canonical headings from the project's KJV source; preserve their words."""
import json
from pathlib import Path
import xml.etree.ElementTree as ET

root = ET.parse('data-sources/kjv.osis.xml').getroot()
headings = {}
for chapter in root.iter():
    if chapter.tag.endswith('}chapter') and chapter.get('osisID', '').startswith('Ps.'):
        for title in chapter:
            if title.tag.endswith('}title') and title.get('type') == 'psalm' and title.get('canonical') == 'true':
                headings[chapter.get('osisID').split('.')[1]] = ''.join(title.itertext())
Path('.generated').mkdir(exist_ok=True)
Path('.generated/timeline-psalm-headings.json').write_text(json.dumps(headings, ensure_ascii=False) + '\n', encoding='utf8')
