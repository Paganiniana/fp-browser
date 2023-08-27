import Element from "./Element";
import Text from "./Text";
import Node from "./Node";

const HEAD_TAGS = [
    "base", "basefont", "bgsound", "noscript",
    "link", "meta", "title", "style", "script",
]
/**
 * Void tags, we shouldn't be left waiting for a closing
 * tag if we encounter one of these...
 */
const SELF_CLOSING_TAGS = [
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
]

export {
    HEAD_TAGS,
    SELF_CLOSING_TAGS,
    Node,
    Element, 
    Text
}