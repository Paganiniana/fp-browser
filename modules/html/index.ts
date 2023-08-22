import { lex } from "./lex";

export function parseHtml(html:string) {
    return lex(html);
}