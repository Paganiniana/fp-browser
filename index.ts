let url = "http://example.org/index.html";

function parseUrl(url:string) {
    const prefix = "http://";
    // 1. prefix
    if (!url.startsWith(prefix)) throw new Error("We don't support any urls that aren't HTTP");

    // 2. host and resource
    let scheme = url.split("://", 1)[0];
    url = url.slice(prefix.length);
    let host = url.slice(0, url.indexOf("/"));
    let resource = url.slice(url.indexOf("/"));
    
    return {
        scheme: scheme,
        host: host,
        resource: resource,
    }
}

console.log(parseUrl(url));