import { mountBrowser } from "@/drawing";

const browserWrapper = document.getElementById("browser-target") as HTMLDivElement;

function main() {
    // 1. get the browser and append a canvas
    const C = document.createElement("canvas");
    let bb = browserWrapper.getBoundingClientRect();
    C.width = bb.width;
    C.height = bb.height;
    C.style.width = "100%";
    C.style.height = "100%";
    browserWrapper.appendChild(C);

    // 2. start the browser with a reference to our new canvas context
    let ctx = C.getContext("2d");
    if (!ctx) throw new Error("Cannot mount without a context!");
    mountBrowser(ctx);
    
}
main();