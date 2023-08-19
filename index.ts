import { fakeFetch, FakeRequest } from "./modules/fetch";
let url = "http://browser.engineering/index.html";


async function main() {
    let res = await fakeFetch({
        url: url,
        method: "GET"
    })
    console.log(res.body);
}

main();

// function printBody(htmlBody:string) {
//     let in_angle = false;
//     let textRes = ""
//     for (let c of htmlBody) {
//         if (c == "<")
//             in_angle = true;
//         else if (c == ">")
//             in_angle = false;
//         else if (!in_angle)
//             textRes+=c;
//     }
//     console.log(textRes);
// }

// // test socket

// function handlePage(url:string) {
//     let useTls = url.startsWith("https");

//     // 0. get the destination
//     let P = parseUrl(url);
//     const port = P.port;
//     const host = P.host;

//     // 1. create socket with listeners
//     const client = useTls ? new TLSSocket(new Socket()) : new Socket();

//     client.on("connect", () => {
//         console.log("Connected!");
//         let req = getRequest(P.host, P.resource);
//         client.write(req);
//     })

//     client.on("data", (data) => {
//         let res =  parseResponse(data.toString());
//         printBody(res.body);
//         // console.log(res.body);
//     })

//     client.on("error", (error) => {
//         console.log(`There was an error ${error}`);
//     })

//     client.on("close", () => {
//         console.log("Connection closed");
//     })   

//     client.connect({ host: host, port: port })
// }

// // Run!
// let args = process.argv;
// let site = url;
// if (args.length > 2) {
//     site = args[2];
// }
// handlePage(site);