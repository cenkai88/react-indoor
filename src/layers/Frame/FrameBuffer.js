import AbstractBuffer from '../AbstractBuffer';
export default class FrameBuffer extends AbstractBuffer {
    constructor(gl) {
        super(gl);
        this.fillIndicesNum = 0;
        this.outlineIndicesNum = 0;
        this._verticesBuffer = this._gl.createBuffer(); // 创建 WebGLBuffer 对象，来保存顶点、颜色等数据
        this._fillIndicesBuffer = this._gl.createBuffer(); // 创建 WebGLBuffer 对象保存填充色的绘制顺序信息（每个数字都是索引，每三个点组成一个三角形）
        this._outlineIndicesBuffer = this._gl.createBuffer(); // 创建 WebGLBuffer 对象保存轮廓的绘制顺序信息
    }
    update(data) {
        const { vertices, fillIndices, outlineIndices } = data;
        this._initArrayBuffer(this._verticesBuffer, vertices);
        this.fillIndicesNum = fillIndices.length;
        this.outlineIndicesNum = outlineIndices.length;
        this._initIndexBuffer(this._fillIndicesBuffer, fillIndices);
        this._initIndexBuffer(this._outlineIndicesBuffer, outlineIndices);
    }
    bindData(a_position) {
        this._vertexAttribPointer(a_position, this._verticesBuffer, 2);
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
