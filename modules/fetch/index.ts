import { HttpMethod, HeaderGroup, ParsedResponse } from "./types";
// import { parseUrl } from "./url_parsing";
// import { makeHttpRequest, parseHttpResponse } from "./http";
// import { getDataBySocket } from "./sockets";

export type FakeRequest = {
    method: HttpMethod,
    url: string,
    headers?: HeaderGroup,
    /**
     * There are a heck of a lot more!
     * https://fetch.spec.whatwg.org/#request-class
     */
}

export type FakeResponse = {
    body: string,
    headers: HeaderGroup,
    status: number,
}

/**
 * NATIVE
 * @param url the same thing that comes out of a browser's URL bar!
 * @returns the plain string body of the request
 */
// export async function fakeFetch(options:FakeRequest):Promise<FakeResponse> {
//     // 1. get the parts of the URL
//     let pu = parseUrl(options.url);

//     // 2. turn that into an HTTP request
//     let req;
//     if (options.headers) req = makeHttpRequest(options.method, pu);
//     else req = makeHttpRequest(options.method, pu, options.headers);

//     // 3. make the request
//     let buff = await getDataBySocket({
//         host: pu.host,
//         port: pu.port,
//         tls: pu.scheme == "https",
//         value: req,
//     })

//     // 4. get the parts of the serialized response
//     const res = parseHttpResponse(buff);

//     // 5. return it!
//     return {
//         body: res.body,
//         headers: res.headers,
//         status: res.status.code,
//     }
// }

/**
 * BROWSER COMPATIBLE
 * This is just for the frontend, building all of our parsing tools in the browser.
 * 
 */
export async function fakeFetch(options:FakeRequest):Promise<FakeResponse> {


    let res = await fetch(options.url, {
        method: options.method,
        headers: options.headers,
    });
    
    let body = await res.text();

    return {
        body: body,
        status: res.status,
        headers: res.headers as unknown as HeaderGroup,
    }

}