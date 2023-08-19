
/** ---------------- URL -------------- */

export type ParsedUrl = {
    scheme: string, // usually http or https
    host: string, // IP address or a domain name
    port: string,  // default is "80"
    resource: string, // a path, e.g. /index.html or /imgs/cat.jpg
}


/** ------------------ HTTP ---------------- */

export type Status = {
    code: number, // eg. 200
    description: string, // eg. OK
}

export type HeaderGroup = { [key:string]: string } // Cache: no-cache

export type ParsedResponse = {
    httpVersion: string, // 1.1 or something
    status: Status,
    headers: HeaderGroup,
    body: string, // raw body
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";