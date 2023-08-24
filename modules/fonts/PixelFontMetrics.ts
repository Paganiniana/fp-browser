
/**
 * Taken from
 * https://github.com/soulwire/FontMetrics ...
 * this is an attempt to perform pixel-level analysis of a given 
 * piece of text.
 */

type ReferenceCharacters = {
    capHeight: string, // the height of a capital letter?
    baseline: string, // establishes the 'center' horizontal line?
    xHeight: string, // is x singled out because it's the smallest char?
    descent: string, // a 'tail' character that descends further than the baseline?
    ascent: string, // a 'reaching' character that ascends further than the baseline?
    tittle: string, // no clue...
}

const defaultChars: ReferenceCharacters = {
    capHeight: 'S',
    baseline: 'n',
    xHeight: 'x',
    descent: 'p',
    ascent: 'h',
    tittle: 'i'
  }

type Metrics = {
    capHeight: number,
    baseline: number,
    xHeight: number,
    descent: number,
    bottom: number, // same as "linespace" in TK ?
    ascent: number,
    tittle: number,
    top: 0,
}

// no other options at the moment, but it can be anything returned by metrics
type Origin = "baseline"; 

type Config = {
    fontFamily: string,
    fontWeight: string,
    fontSize: number,
    origin?:Origin,
}

export default class PixelFontMetrics {
    canvas:HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    padding: number = 0;


    constructor(config:Config) {
        // 1. setup canvas
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d")!; // ignore failure

        // 2. setup font and metrics
        this.setFont(config.fontFamily, config.fontSize, config.fontWeight);
    }

    setFont(family:string, size:number, weight:string) {
        this.padding = size * 0.5;
        this.canvas.width = size * 2;
        this.canvas.height = size * 2;
        this.ctx.font = `${weight} ${size}px ${family}`
        this.ctx.textBaseline = 'top'
        this.ctx.textAlign = 'center'
    }

    setAlignment(baseline:CanvasTextBaseline="top") {
        const ty = baseline === 'bottom' ? this.canvas.height : 0
        this.ctx.setTransform(1, 0, 0, 1, 0, ty)
        this.ctx.textBaseline = baseline;
    }

    updateText(text:string) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillText(text, this.canvas.width / 2, this.padding, this.canvas.width);
    }

    computeLineHeight() {
        const letter = "A"; // default for line height
        this.setAlignment("bottom");
        const gutter = this.canvas.height - this.measureBottom(letter);
        this.setAlignment("top"); // return to default
        return this.measureBottom(letter) + gutter;
    }

    getPixels(text:string): ImageData["data"] {
        this.updateText(text);
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    }

    getFirstIndex(pixels: ImageData["data"]) {
        for (let i = 3, n = pixels.length; i < n; i += 4) {
            if (pixels[i] > 0) return (i - 3) / 4;
        } 
        return pixels.length;
    }

    getLastIndex(pixels: ImageData["data"]) {
        for (let i = pixels.length - 1; i >=3; i -= 4) {
            if (pixels[i] > 0) return i / 4;
        }
        return 0;
    }

    normalize(metrics:Metrics, fontSize:number, origin:Origin) {
        // ??
        const result: Metrics = {} as Metrics;
        const offset = metrics[origin];
        // @ts-ignore
        for (let key of Object.keys(metrics)) { result[key] = (metrics[key] - offset) / fontSize }
        return result
    }

    measureTop(text:string) {
        let i = this.getFirstIndex(this.getPixels(text)) / this.canvas.width;
        return Math.round(i) - this.padding;
    }

    measureBottom(text:string) {
        let i = this.getLastIndex(this.getPixels(text)) / this.canvas.width;
        return Math.round(i) - this.padding;
    }

    /**
     * These are the default characters used to establish Metrics
     */
    getMetrics(chars:ReferenceCharacters = defaultChars): Metrics {
        return {
            capHeight: this.measureTop(chars.capHeight),
            baseline: this.measureBottom(chars.baseline),
            xHeight: this.measureTop(chars.xHeight),
            descent: this.measureBottom(chars.descent),
            bottom: this.computeLineHeight(),
            ascent: this.measureTop(chars.ascent),
            tittle: this.measureTop(chars.tittle),
            top: 0, // no offset
        }
    }
}