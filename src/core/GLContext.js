/**
 * @file GLContext
 * GLContext is used to maintain the state machine of WebGL and to bind buffer. Only available in renderer

*/

import Program from './Program';
import { ShaderSource } from './shaders/index';

export default class GLContext {
    constructor(gl, options) {
        this._programMap = new Map();
        this._isEnableDepthTest = false;
        this._isEnableAlpha = false;
        this._gl = gl;
        this._options = options;
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, 1);
    }
    resize(width, height) {
        this._options.width = width;
        this._options.height = height;
        if (this._frameBuffer && this._frameTexture) {
            this._initFrameBuffer();
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
        }
    }
    _initFrameBuffer() {
        const gl = this._gl;
        this._frameBuffer = this._gl.createFramebuffer();
        this._frameTexture = this._gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);
        const { width, height } = this._options;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const renderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._frameTexture, 0);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
    enableFrameBuffer() {
        if (!this._frameBuffer || !this._frameTexture) {
            this._initFrameBuffer();
        }
        else {
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._frameTexture);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
        }
    }
    /**
     * set different shader according to different layer type
     * @param {Stirng} name - name of layer
    */
    use(name) {
        if (this._activeProgramName === name) return;
        this._activeProgramName = name;
        let program = this._programMap.get(name);
        if (!program) {
            program = new Program(this._gl, ShaderSource[name]);
            this._programMap.set(name, program);
        }
        this._gl.useProgram(program.getProgram());
    }
    getActiveProgram() {
        if (this._activeProgramName) return this._programMap.get(this._activeProgramName);
        return null;
    }
    clear() {
        if (this._frameBuffer) {
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._frameBuffer);
            this._gl.clear(this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        }
        this._gl.clear(this._gl.DEPTH_BUFFER_BIT | this._gl.COLOR_BUFFER_BIT);
    }
    destroy(){
        this._gl.getExtension('WEBGL_lose_context').loseContext();
    }
    enableAlpha() {
        if (!this._isEnableAlpha) this._gl.enable(this._gl.BLEND);
        this._isEnableAlpha = true;
    }
    disableAlpha() {
        if (!this._isEnableAlpha)
            return;
        this._isEnableAlpha = false;
        this._gl.disable(this._gl.BLEND);
    }
    initArrayBuffer(location, data, size) {
        if (location === -1)
            return;
        const buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, data, this._gl.STATIC_DRAW);
        const FSIZE = data.BYTES_PER_ELEMENT;
        this._gl.vertexAttribPointer(location, size, this._gl.FLOAT, false, size * FSIZE, 0);
        this._gl.enableVertexAttribArray(location);
    }
    initIndexBuffer(indices) {
        const uint16 = new Uint16Array(indices);
        const buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, uint16, this._gl.STATIC_DRAW);
    }
    enableDepthTest() {
        if (this._isEnableDepthTest) return;
        this._isEnableDepthTest = true;
        this._gl.enable(this._gl.DEPTH_TEST);
    }
    disableDepthTest() {
        if (!this._isEnableDepthTest)
            return;
        this._isEnableDepthTest = false;
        this._gl.disable(this._gl.DEPTH_TEST);
    }
    getViewRect() {
        return {
            width: this._options.width,
            height: this._options.height,
        }
    }
}
