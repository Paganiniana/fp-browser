import { Tag, Text } from "./elements";

export type LexResult = Array<Tag | Text>;

export function lex(html:string):LexResult {
    let res = [];
    let text = "";
    let in_angle = false;
    for (let char of html) {
        if (char == "<") {
            // 1. add the text we've collected and start the tag
            in_angle = true;
            if (text) res.push(new Text(text));
            text = "";
        } else if (char == ">") {
            // 2. finish the tag
            in_angle = false;
            res.push(new Tag(text));
            text = "";
        } else {
            // 3. collect the text
            text += char;
        }
    }
    
    // collect any left-over text
    if (!in_angle && text) res.push(new Text(text));
    return res;
}