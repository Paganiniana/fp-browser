export function lex(html:string):string {
    let res = "";
    let in_angle = false;
    for (let char of html) {
        if (char == "<") in_angle = true;
        else if (char == ">") in_angle = false;
        else if (!in_angle) res += char;
    }
    return res;
}