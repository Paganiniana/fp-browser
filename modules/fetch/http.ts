import { ParsedUrl, HttpMethod, ParsedResponse, Status, HeaderGroup, } from "./types";

const CLIENT_HTTP_VERSION = "HTTP/1.0";

/**
 * Takes a ParsedUrl and returns a 
 * UTF-8 encoded HTTP request, ready for the socket
 */
export function makeHttpRequest(method:HttpMethod = "GET", pu: ParsedUrl): Uint8Array {
    let newLine ="\r\n" 
    // 0. starts as a string
    let req = "";
    // HTTP requires return characters
    req += `${method} ${pu.resource} ${CLIENT_HTTP_VERSION}\r\n`; 
    // the first new line ends the Host header, the second creates a request-terminating line
    req += `Host: ${pu.host}${newLine}${newLine}\r\n\r\n` 

    // 1. encode it!
    const encoder = new TextEncoder();
    let encodedReq = encoder.encode(req);
    return encodedReq;
}

/**
 * Takes a fresh-off-the-socket string and parses it into...
 * 1. HEADERS
 * 2. The response body
 */
export function parseHttpResponse(httpResponse:Buffer): ParsedResponse {
    let res = httpResponse.toString(); // this is too easy in JS
    let lines = res.split("\r\n");

    // -1. http and status
    let statParts = lines[0].split(" "); // there should be a simple space between first line parts
    let http = statParts[0];
    let status: Status = { code: Number(statParts[1]), description: statParts[2] }

    // 0. headers

    const headers: HeaderGroup = {};

    let i = 1;
    let nextLine = lines[i]
    while (nextLine && nextLine.length) { // an empty line marks the end of the headers
        let hParts = nextLine.split(": ") // the assumed delineator for each header
        headers[hParts[0]] = hParts[1];
        i++
        nextLine = lines[i]
    }

    // 1. body
    let body = lines.slice(i).join("")

    return {
        httpVersion: http,
        status: status,
        headers: headers,
        body: body
    }
}