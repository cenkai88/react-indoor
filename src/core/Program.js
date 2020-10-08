/**
 * @file Program
 * Program is a Class to manage WebGLProgram which is part of WebGL API. Program mainly load vertex shader and fragment shader with `attachShader` function,
 * and get real attribute value / uniform location(WebGLUniformLocation) based on its name.

*/

export default class Program {
    constructor(gl, shaderSource) {
        this._attributes = new Map();
        this._uniforms = new Map();
        this._gl = gl;
        const program = gl.createProgram();
        if (!program) {
            throw new Error('gl: createProgram failed');
        }
        this._program = program;
        const vertex = shaderSource.vertex, fragment = shaderSource.fragment;
        this._initShader(this._gl.VERTEX_SHADER, vertex);
        this._initShader(this._gl.FRAGMENT_SHADER, fragment);
        this._gl.linkProgram(this._program);
    }
    _initShader(type, source) {
        const shader = this._gl.createShader(type);
        if (!shader) {
            console.error('Shader: createShader failed');
            return;
        }
        this._gl.shaderSource(shader, source);
        this._gl.compileShader(shader);
        this._gl.attachShader(this._program, shader);
    }
    /**
     * Get the location of a attribute (variable sent from js to vertex shader)
     * @param {String} locationName 
     * @return {Number} a number indicating the index of vertex attribute
    */
    getAttribLocation(locationName) {
        if (this._attributes.has(locationName)) {
            return this._attributes.get(locationName);
        }
        const locationValue = this._gl.getAttribLocation(this._program, locationName);
        this._attributes.set(locationName, locationValue);
        return locationValue;
    }
    /**
     * Get the location of a uniform (variable sent from js to fragment shader)
     * @param {String} locationName 
     * @return {WebGLUniformLocation}
    */
    getUniformLocation(locationName) {
        if (this._uniforms.has(locationName)) {
            return this._uniforms.get(locationName);
        }
        const locationValue = this._gl.getUniformLocation(this._program, locationName);
        locationValue && this._uniforms.set(locationName, locationValue);
        return locationValue;
    }
    getProgram() {
        return this._program;
    }
}

