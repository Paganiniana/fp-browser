import { Browser } from "@/index";
// let url = `${location.href}/chapter_1/wbe.html`;
let url = `${location.href}/chapter_4/simple.html`;
// let url = `${location.href}/misc/sherlock_holmes.html`;


const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    let B = new Browser(browserWrapper);
    B.load(url);
}
main();