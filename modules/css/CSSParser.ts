import { TagSelector, DescendantSelector } from "./selectors";

const alphaNumeric = new RegExp(/^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/);
const SPECIAL_CHARS = ["#", "-", ".", "%"];

type CSSPair = { [key:string]: string }

export class CSSParser {
    s:string;
    i:number = 0;

    constructor(s:string) {
        this.s = s;
    }

    /**
     * Increment i past an arbitrarily long set of whitespace characters
     */
    whitespace() {
        while (this.i < this.s.length && this.s[this.i] == " ") {
            this.i ++;
        }
    }

    word() {
        let start = this.i;
        while (this.i < this.s.length) {
            // finish incrementing after we encounter a non-alphanumeric char
            if (alphaNumeric.test(this.s[this.i]) 
                || SPECIAL_CHARS.includes(this.s[this.i])) {
                    this.i += 1;
            } else {
                break;
            }
        }

        // account for edge case
        if (!(this.i > start)) {
            debugger
            throw new Error("Parsing Error");
        }

        // return the word we've sliced
        return this.s.slice(start, this.i);
    }

    literal(literal:string) {
        if (
            !(this.i < this.s.length && this.s[this.i] == literal)
        ) {
            throw new Error("the literal at i did not match our anticipated literal")
        }
        this.i++;
    }

    pair(): [string, string] {
        let prop = this.word();
        this.whitespace();
        this.literal(":");
        this.whitespace();
        let val = this.word();
        return [prop, val];
    }

    body(): CSSPair {
        let pairs: { [key:string]: string } = {};
        while (this.i < this.s.length) {
            // 1. normal css prop parsing
            try {
                // a. get the prop/value
                let p = this.pair();
                let prop = p[0];
                let val = p[1];
                pairs[prop.toLowerCase()] = val;

                // b. skip past any ;
                this.whitespace();
                this.literal(";")
                this.whitespace();
            }
            // 2. fail silently
            catch (err) {
                console.error("Encountered an error while parsing CSS", err);
                let why = this.ignoreUntil([";"]);
                if (why == ";") {
                    this.literal(";")
                    this.whitespace();
                } else {
                    break;
                }
            }
        }

        return pairs;
    }

    ignoreUntil(chars:string[]) {
        while (this.i < this.s.length) {
            if (chars.includes(this.s[this.i])) 
                return this.s[this.i];
            else 
                this.i++;
        }
    }

    /** --------------------------- Used for CSS files --------------------- */
    selector() {
        let out: TagSelector | DescendantSelector = new TagSelector(this.word().toLowerCase());
        this.whitespace();
        while (this.i < this.s.length && this.s[this.i] != "{") {
            let tag = this.word();
            let descendant = new TagSelector(tag.toLowerCase());
            out = new DescendantSelector(out, descendant);
            this.whitespace();
        }
        return out;
    }
    
    parse() {
        let rules: [ TagSelector| DescendantSelector, CSSPair][] = [];
        while (this.i < this.s.length) {
            try {
                this.whitespace();
                let selector = this.selector();
                this.literal("{");
                this.whitespace();
                let body = this.body();
                this.literal("}");
                rules.push([selector, body]);
            } catch (err) {
                let why = this.ignoreUntil(["}"]);
                if (why == "}") {
                    this.literal("}");
                    this.whitespace()
                } else {
                    break;
                }
            }
        }
        return rules;
    }
}