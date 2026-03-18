import { LinkNode, type LinkAttributes, type SerializedLinkNode } from "@lexical/link";
import { $applyNodeReplacement } from "lexical";

function isKjvInternalUrl(url: string) {
  return url.startsWith("kjv://");
}

export class KjvInternalLinkNode extends LinkNode {
  static override getType() {
    return "kjv-link";
  }

  static override clone(node: KjvInternalLinkNode) {
    return new KjvInternalLinkNode(
      node.__url,
      {
        rel: node.__rel,
        target: node.__target,
        title: node.__title,
      },
      node.__key,
    );
  }

  static override importJSON(serializedNode: SerializedLinkNode) {
    return new KjvInternalLinkNode().updateFromJSON(serializedNode);
  }

  override sanitizeUrl(url: string) {
    if (isKjvInternalUrl(url)) {
      return url;
    }
    return super.sanitizeUrl(url);
  }
}

export function $createKjvInternalLinkNode(
  url = "",
  attributes?: LinkAttributes,
) {
  return $applyNodeReplacement(new KjvInternalLinkNode(url, attributes));
}
