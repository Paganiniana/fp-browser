import { Browser } from "@/index";
let url = "http://browser.engineering/index.html";


const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    let B = new Browser(browserWrapper);
    B.load(url);
}
main();