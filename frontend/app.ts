import { Browser } from "@/index";
// let url = `${location.href}/chapter_1/wbe.html`;
// let url = `${location.href}/chapter_4/simple.html`;
// let url = `${location.href}/misc/sherlock_holmes.html`;
// let url = `${location.href}/chapter_5/simple_with_pre.html`;
let url = `${location.href}/chapter_6/simple_with_style.html`;
// let url = "https://browser.engineering/styles.html";


const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    let B = new Browser(browserWrapper);
    B.load(url);
}
main();