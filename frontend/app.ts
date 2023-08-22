import { Browser } from "@/index";
let url = "http://localhost:5173/chapter_2/journey_to_the_west.html";


const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    let B = new Browser(browserWrapper);
    B.load(url);
}
main();