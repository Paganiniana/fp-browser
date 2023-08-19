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