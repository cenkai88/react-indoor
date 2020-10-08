/* 

TextureManager 目前只是初始化用

*/

import Canvas2d from '../core/Canvas2d';

export default class TextureManager extends Canvas2d {
    constructor(gl) {
        super();
        this._textureMap = new Map();
        this._hasRequestTextureMap = new Map();
        this._gl = gl;
        this._emptyTexture = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._emptyTexture);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        const pixels = document.querySelector('#canvas1');
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
    }
    getTexture(url, options) {
        const key = `${url}-${options.xRepeat}-${options.yRepeat}`;
        return this._textureMap.get(key);
    }
    getEmptyTexture() {
        return this._emptyTexture;
    }
    loadTexture(url, options) {
        const key = `${url}-${options.xRepeat}-${options.yRepeat}`;
        let loadPromise = this._hasRequestTextureMap.get(key);
        if (!loadPromise) {
            loadPromise = this._loadTexture(url, options);
            this._hasRequestTextureMap.set(key, loadPromise);
            loadPromise.then(() => {
                this._hasRequestTextureMap.delete(key);
            });
        }
        return loadPromise;
    }
    async _loadTexture(url, options) {
        const key = `${url}-${options.xRepeat}-${options.yRepeat}`;
        const imgData = await this._loadImage(url, options);
        const texture = this._initTexture(imgData, options);
        const { width, height } = imgData;
        const tempTexture = { texture, width, height };
        this._textureMap.set(key, tempTexture);
        return tempTexture
    }
    _initTexture(pixels, options) {
        const texture = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        const xParam = options.xRepeat ? this._gl.REPEAT : this._gl.CLAMP_TO_EDGE;
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, xParam);
        const yParam = options.yRepeat ? this._gl.REPEAT : this._gl.CLAMP_TO_EDGE;
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, yParam);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, pixels);
        return texture;
    }
    async _loadImage(url, options) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            img.onload = () => {
                let { width, height } = img;
                if (options.xRepeat) {
                    width = Math.pow(2, Math.ceil(Math.log2(img.width)));
                }
                if (options.yRepeat) {
                    height = Math.pow(2, Math.ceil(Math.log2(img.height)));
                }
                this._ctx.clearRect(0, 0, width, height);
                this._ctx.drawImage(img, 0, 0, width, height);
                const pixels = this._ctx.getImageData(0, 0, width, height);
                resolve(pixels);
            };
            img.onerror = err => {
                reject(err);
            };
        });
    }
    destroy() {
        this._textureMap.clear();
    }
}
