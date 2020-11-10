import AbstractBuffer from '../AbstractBuffer';

export default class LineBuffer extends AbstractBuffer {
    constructor(gl) {
        super(gl);
        this.indicesNum = 0;
        this._texture = this._gl.createTexture();
        this._indicesBuffer = this._gl.createBuffer();
        this._normalsBuffer = this._gl.createBuffer();
        this._verticesBuffer = this._gl.createBuffer();
        this._deviationBuffer = this._gl.createBuffer();
        this._texCoordsBuffer = this._gl.createBuffer();
    }
    update(data) {
        const { vertices, normals, indices, texture, texCoords, deviation } = data;
        this._texture = texture;
        this._initArrayBuffer(this._texCoordsBuffer, texCoords);
        this._initIndexBuffer(this._indicesBuffer, indices);
        this._initArrayBuffer(this._verticesBuffer, vertices);
        this._initArrayBuffer(this._normalsBuffer, normals);
        this._initArrayBuffer(this._deviationBuffer, deviation);
        this.indicesNum = indices.length;
    };
    bind(params) {
        const { a_position, a_normal, a_texCoord, a_deviation } = params;
        this._vertexAttribPointer(a_position, this._verticesBuffer, 2);
        this._vertexAttribPointer(a_normal, this._normalsBuffer, 2);
        this._vertexAttribPointer(a_deviation, this._deviationBuffer, 3);
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
        this._vertexAttribPointer(a_texCoord, this._texCoordsBuffer, 2);
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._indicesBuffer);
    };
}
