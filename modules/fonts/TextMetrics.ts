
/**
 * A simple wrapper for HTML Canvas's 
 * text measuring capacities
 */

type Config = {
    family: string,
    size: number,
    weight: string,
}

type Metrics = {
    ascent: number, // distance it rises above the baseline
    descent: number, // distance it rises below the baseline
    linespace: number, // total line space
}

export default class TextMetrics {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    constructor(config:Config) {
        // 1. setup canvas
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d")!; // ignore failure

        // 2. setup fonts and such
        this.setFont(config.family, config.size, config.weight);
    }

    setFont(family:string, size:number, weight: string) {
        this.canvas.width = size * 2;
        this.canvas.height = size * 2;
        this.ctx.font = `${weight} ${size}px ${family}`;
        // set baseline? 
    }

    /**
     * Metrics for the whole font library
     */
    metrics():Metrics {
        let capital = "A"
        let lowers = "abcdefghijklmnopqrstuvwxyz";
        let testCase = capital + lowers;
        let M = this.ctx.measureText(testCase);

        // extract useful props
        let ascent = M.fontBoundingBoxAscent;
        let descent = M.fontBoundingBoxDescent;

        return {
            ascent: ascent,
            descent: descent,
            linespace: ascent + descent
        }
    }   

    /**
     * Returns the width of a piece of text
     */
    measure(text:string):number {
        let M = this.ctx.measureText(text);
        return M.width;
    }
}