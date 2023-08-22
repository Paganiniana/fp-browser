import { Browser } from "@/index";
let url = "http://localhost:5173/chapter_1/wbe.html";


const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    let B = new Browser(browserWrapper);
    B.load(url);
}
main();