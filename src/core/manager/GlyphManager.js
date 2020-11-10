/* 

GlyphManager renders the image and text in Icon Layer

*/

export default class GlyphManager {
    constructor(gl, options, glyphCanvas) {
        this._ctx = glyphCanvas.getContext('2d');
        this._baseSize = 14;
        this._gl = gl;
        this._options = options;
        this._ctx.textAlign = 'left';
        this._ctx.textBaseline = 'middle';
        this._ctx.lineWidth = 3;
        const size = this._baseSize * devicePixelRatio;
        this._ctx.font = `${this._options.fontWeight || 400} ${size}px ${this._options.fontFamily || 'PingFang SC'}`;
    }
    getBaseSize() {
        return this._baseSize;
    }
    getPixels(options) {
        const buffer = this._options.buffer;
        const { fillColor, strokeColor, textArr, width: w, height: h } = options;
        const width = w * devicePixelRatio;
        const height = h * devicePixelRatio;
        this._ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < textArr.length; i += 1) {
            const y = (this._baseSize / 2 + i * this._baseSize + (i + 1) * buffer) * devicePixelRatio;
            if (strokeColor) {
                this._ctx.strokeStyle = strokeColor;
                this._ctx.strokeText(textArr[i], buffer, y);
            }
            if (fillColor) {
                this._ctx.fillStyle = fillColor;
                this._ctx.fillText(textArr[i], buffer, y);
            }
        }
        return this._ctx.getImageData(0, 0, width, height);
    };
    getTexture(textOptions) {
        const pixels = this.getPixels(textOptions);
        const texture = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
        return texture;
    }
    getTextBound(text) {
        const { buffer, textMaxWidth = 10, textSplit } = this._options;
        let textArr = [];
        if (textSplit && text.indexOf(textSplit) !== -1) {
            textArr = text.split(textSplit);
        } else {
            const num = Math.ceil(text.length / textMaxWidth);
            const step = Math.ceil(text.length / num);
            for (let i = 0; i < num; i += 1) {
                textArr.push(text.slice(i * step, (i + 1) * step));
            }
        }
        let { width } = this._ctx.measureText(textArr[0]);
        for (let i = 1; i < textArr.length; i += 1) {
            const itemWidth = this._ctx.measureText(textArr[i]).width;
            if (itemWidth > width) {
                width = itemWidth;
            }
        }
        return {
            width: Math.round(width + buffer * 2) / devicePixelRatio,
            height: Math.round(this._baseSize * textArr.length + buffer * (textArr.length + 1)),
            textArr,
        };
    };
}
