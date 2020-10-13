import AbstractBuffer from '../AbstractBuffer';

export default class RoomBuffer extends AbstractBuffer {
    constructor(gl) {
        super(gl);
        this.fillIndicesNum = 0;
        this.outlineIndicesNum = 0;
        this._verticesBuffer = this._gl.createBuffer();
        this._normalsBuffer = this._gl.createBuffer();
        this._fillIndicesBuffer = this._gl.createBuffer();
        this._outlineIndicesBuffer = this._gl.createBuffer();
    }
    update(data) {
        const { vertices, normals, fillIndices, outlineIndices } = data;
        this._initArrayBuffer(this._verticesBuffer, vertices);
        this._initArrayBuffer(this._normalsBuffer, normals);
        this.fillIndicesNum = fillIndices.length;
        this.outlineIndicesNum = outlineIndices.length;
        this._initIndexBuffer(this._fillIndicesBuffer, fillIndices);
        this._initIndexBuffer(this._outlineIndicesBuffer, outlineIndices);
    }
    bindData(a_position, a_normal) {
        this._vertexAttribPointer(a_position, this._verticesBuffer, 2);
        this._vertexAttribPointer(a_normal, this._normalsBuffer, 3);
    }
    bindIndices(indicesType) {
        if (indicesType === 'fill') {
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._fillIndicesBuffer);
        }
        else if (indicesType === 'outline') {
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._outlineIndicesBuffer);
        }
    }
}
