import { AutoLinkNode, LinkNode } from "@lexical/link"
import { ListItemNode, ListNode } from "@lexical/list"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import {
  ParagraphNode,
  TextNode,
} from "lexical"
import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical"
import { KjvInternalLinkNode } from "@/components/editor/nodes/kjv-internal-link-node"

export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> =
  [
    HeadingNode,
    ParagraphNode,
    TextNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    KjvInternalLinkNode,
  ]
