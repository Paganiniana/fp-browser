import { Browser } from "@/index";
let fontTest = `${location.href}/misc/font_test.html`;
let url = `${location.href}/chapter_1/wbe.html`;


const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    let B = new Browser(browserWrapper);
    B.load(url);
}
main();