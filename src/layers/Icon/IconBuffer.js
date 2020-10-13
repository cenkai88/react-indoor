import AbstractBuffer from '../AbstractBuffer';

export default class IconBuffer extends AbstractBuffer {
    constructor(gl) {
        super(gl);
        this.verticesNum = 0;
        this._verticesBuffer = this._gl.createBuffer();
        this._texCoordBuffer = this._gl.createBuffer();
    }
    setGlyphMng(glyphMng) {
        this._glyphMng = glyphMng;
    }
    update(data) {
        const { texture, vertices, texCoords, textOptions } = data;
        this.verticesNum = vertices.length / 2;
        this._texture = texture;
        this._textOptions = textOptions;
        this._initArrayBuffer(this._verticesBuffer, vertices);
        this._initArrayBuffer(this._texCoordBuffer, texCoords);
    }
    bind(a_position, a_texCoord) {
        this._vertexAttribPointer(a_position, this._verticesBuffer, 2);
        this._vertexAttribPointer(a_texCoord, this._texCoordBuffer, 2);
        if (this._texture) {
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
        }
        else if (this._glyphMng && this._textOptions) {
            this._texture = this._glyphMng.getTexture(this._textOptions);
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
        }
    }
}
