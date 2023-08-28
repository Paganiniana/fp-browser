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

const BLOCK_ELEMENTS = [
    "html", "body", "article", "section", "nav", "aside",
    "h1", "h2", "h3", "h4", "h5", "h6", "hgroup", "header",
    "footer", "address", "p", "hr", "pre", "blockquote",
    "ol", "ul", "menu", "li", "dl", "dt", "dd", "figure",
    "figcaption", "main", "div", "table", "form", "fieldset",
    "legend", "details", "summary"
]

export {
    HEAD_TAGS,
    SELF_CLOSING_TAGS,
    BLOCK_ELEMENTS,
    Node,
    Element, 
    Text
}