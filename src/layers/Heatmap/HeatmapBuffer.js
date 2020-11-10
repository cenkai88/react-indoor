import AbstractBuffer from '../AbstractBuffer';

export default class HeatmapBuffer extends AbstractBuffer {
  constructor(gl) {
    super(gl);
    this.verticesNum = 0;
    this._normalsBuffer = this._gl.createBuffer();
  }
  update(data) {
    const { normals } = data;
    this.verticesNum = normals.length / 2;
    this._initArrayBuffer(this._normalsBuffer, normals);
  }
  bind(a_normal) {
    this._vertexAttribPointer(a_normal, this._normalsBuffer, 2);
  }
}
