/* 

AbstractBuffer 所有buffer的基础类，Buffer是基于webgl的buffer进行了简单封装

*/

export default class AbstractBuffer {
    constructor(gl) {
        this._gl = gl;
    }
    _initArrayBuffer(buffer, data) { // 顶点信息（位置和颜色）
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer); // 把WebGLBuffer对象绑定为ARRAY_BUFFER
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(data), this._gl.STATIC_DRAW); // 向buffer中存入数据
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
    _initIndexBuffer(buffer, indices) { // 索引信息（绘制顺序）
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, buffer); // 把WebGLBuffer对象绑定为ELEMENT_ARRAY_BUFFER
        this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this._gl.STATIC_DRAW);
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
    }
    _vertexAttribPointer(location, buffer, size) {
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        const FSIZE = Float32Array.BYTES_PER_ELEMENT;
        this._gl.vertexAttribPointer(location, size, this._gl.FLOAT, false, FSIZE * size, 0);
        this._gl.enableVertexAttribArray(location);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
}
