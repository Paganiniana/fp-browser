import { ParsedUrl } from "./types";

export function parseUrl(url:string):ParsedUrl {
    const prefixes = ["http://", "https://"];
    // 1. prefix
    if (!prefixes.map(p => url.startsWith(p)).some(Boolean)) throw new Error("We don't support any urls that aren't HTTP");

    let prefix = url.startsWith(prefixes[0]) ? prefixes[0] : prefixes[1];

    // 2. host and resource
    let scheme = url.split("://", 1)[0];
    url = url.slice(prefix.length);
    let host = url.slice(0, url.indexOf("/"));
    let resource = url.slice(url.indexOf("/"));
    
    // 3. check for a port
    let port:string = url.startsWith(prefixes[0]) ? "443" : "80";
    if (host.includes(":")) {
        let hostParts = host.split(":");
        host = hostParts[0];
        port = hostParts[1];
    }

    return {
        scheme: scheme,
        host: host,
        port: port,
        resource: resource,
    }
}