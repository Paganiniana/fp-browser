import { lex } from "./lex";
import HTMLParser from "./parsing/HTMLParser";

export function parseHtml(html:string) {
    let P = new HTMLParser(html);
    return P;
}