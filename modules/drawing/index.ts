
export function mountBrowser(ctx:CanvasRenderingContext2D) {
    GLOBAL_CANVAS_CONTEXT = ctx;
    // start the draw loop
    drawLoop();
}

let GLOBAL_CANVAS_CONTEXT: CanvasRenderingContext2D | undefined = undefined;
export function getCanvasContext() {
    return GLOBAL_CANVAS_CONTEXT;
}

function drawLoop() {
    let ctx = getCanvasContext();
    // draw for as long as we have a canvas to draw!
    if (ctx) {
        draw(ctx);
        requestAnimationFrame(drawLoop);
    }
}

function draw(ctx: CanvasRenderingContext2D) {
    // todo
}