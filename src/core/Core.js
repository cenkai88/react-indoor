/**
 * @file  
  Renderer用于绘制图像，将抽象好的数据传给webGL，是绘图的核心

*/

import Base from '../base/Base';

import { sort } from '../utils/common';
import GLContext from './GLContext';
import CollisionManager from './manager/CollisionManager';
import Camera from '../camera/Camera';
import BucketManager from '../layers/BucketManager';

export default class Core extends Base {
  /**
     * Create a Renderer.
     * @param {HTMLDivElement} container - div containerer of the indoor map.
     * @param {HTMLCanvasElement} mapCanvas - canvas that the map is renderer
     * @param {Object} options - options
     * @return {Renderer} The Renderer.
  */
  constructor(container, mapCanvas, options) {
    super();
    this._layers = [];
    this._lightPos = [1, -1, 1];
    this._bucketMng = new BucketManager();
    this._normalResult = { data: {}, opacity: 1 };
    this._renderQueue = [];
    this._container = container;
    this._canvas = mapCanvas;
    const { clientWidth, clientHeight } = mapCanvas;
    // 获取webgl renderer
    const glOptions = {
      antialias: true,
      depth: true, // 绘图缓冲区的深度缓冲区至少为16位
      premultipliedAlpha: true, // 表示页面合成器将假定绘图缓冲区包含具有预乘alpha的颜色
      preserveDrawingBuffer: false, // 会清除缓冲区
      alpha: true, // 包含alpha缓冲区
      failIfMajorPerformanceCaveat: true, // 如果系统性能较低，是否创建上下文
    };
    this._gl = this._canvas.getContext('webgl', glOptions) || this._canvas.getContext('experimental-webgl', glOptions);
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    this._camera = new Camera(clientWidth, clientHeight, {
      zoom: options.zoom,
      rotate: options.rotate,
      pitch: options.pitch,
    });
    this._collisionMng = new CollisionManager(this._camera, {
      viewWidth: clientWidth,
      viewHeight: clientHeight,
      animateDuration: 300,
      collisionDuration: 600,
    });
    this._glContext = new GLContext(this._gl, {
      width: this._canvas.width,
      height: this._canvas.height,
    });
  }
  getBucketMng() {
    return this._bucketMng;
  }
  getCollisionMng() {
    return this._collisionMng;
  }
  _onCollisionChange(data) {
    const { hideResult, showResult, normalResult } = data;
    this._hideResult = { data: hideResult, opacity: 1 };
    this._showResult = { data: showResult, opacity: 0 };
    this._normalResult = { data: normalResult, opacity: 1 };
    if (data.isForce && !this._bucketMng.isInNormalize()) this.render();
  }
  _startRenderQueue() {
    if (!this._renderTimer) this._frameRender();
  }
  _frameRender() {
    const isNeedCollisionRender = Boolean(this._showResult || this._hideResult);
    if (this._renderQueue.length !== 0 || isNeedCollisionRender) {
      this._renderQueue.pop();
      this._draw();
      this._renderTimer = requestAnimationFrame(this._frameRender.bind(this));
    }
    else {
      this._stopRenderQueue();
    }
  }
  _stopRenderQueue() {
    if (this._renderTimer) {
      cancelAnimationFrame(this._renderTimer);
      delete this._renderTimer;
    }
  }
  resize() {
    const { clientWidth, clientHeight } = this._container;
    if (clientWidth === 0 || clientHeight === 0)
      return;
    this._canvas.width = clientWidth * window.devicePixelRatio;
    this._canvas.height = clientHeight * window.devicePixelRatio;
    this._canvas.style.width = clientWidth + "px";
    this._canvas.style.height = clientHeight + "px";
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    this._glContext.resize(this._canvas.width, this._canvas.height);
    this._camera.resize(clientWidth, clientHeight);
    this._collisionMng.resize(clientWidth, clientHeight);
    this.updateCollision();
  }
  setOffset(offsetX, offsetY) {
    this._camera.setOffset([offsetX, offsetY]);
  }
  getOffset() {
    return this._camera.getOffset();
  }
  addLayer(layer) {
    this._layers.push(layer);
    layer.onAdd(this);
  }
  removeLayer(layer, isDestroy = true) {
    const index = this._layers.findIndex((item) => item.id === layer.id);
    if (index === -1) return;
    layer.unbind();
    this._layers.splice(index, 1);
    isDestroy && layer.onRemove();
  }
  updateCollision(isForce = true) {
    this._collisionMng.update(isForce);
  }
  // 决定z轴上渲染时哪一层在上哪一层在下
  sortLayer() {
    const map = new Map();
    for (let i = 0; i < this._layers.length; i += 1) {
      const groupId = this._layers[i].getGroupId();
      if (groupId) {
        const item = map.get(groupId);
        item ? item.push(this._layers[i]) : map.set(groupId, [this._layers[i]]);
      }
    }
    this._layers.length = [];
    map.forEach(item => {
      sort(item, (a, b) => a.getOrder() - b.getOrder());
      this._layers = this._layers.concat(item);
    });
  }
  clear() {
    for (let i = 0; i < this._layers.length; i += 1) {
      this._layers[i].unbind();
    }
    this._layers.length = 0;
    this._collisionMng.clear();
  }
  render() {
    if (this._renderQueue.length !== 0) return;
    this._renderQueue.push('render');
    this._startRenderQueue();
  }
  _draw() {
    if (this._showResult) {
      this._showResult.opacity += this._collisionMng.getStep();
      if (this._showResult.opacity >= 1) {
        for (const key in this._showResult.data) {
          const value = this._showResult.data[key];
          const item = this._normalResult.data[key];
          if (item) {
            item.push.apply(item, value);
          }
          else {
            this._normalResult.data[key] = value;
          }
        }
        delete this._showResult;
      }
    }
    if (this._hideResult) {
      this._hideResult.opacity -= this._collisionMng.getStep();
      if (this._hideResult.opacity <= 0) {
        delete this._hideResult;
      }
    }
    this._drawLayers();
  }
  // 分各种类型渲染
  _drawLayers() {
    this._glContext.clear();
    for (let i = 0; i < this._layers.length; i += 1) {
      const type = this._layers[i].getType();
      if (type === 'Fill') {
        this._drawFill(this._layers[i]);
      }
    }
  }
  _drawFill(fill) {
    this._glContext.use(fill.getShaderName());
    // 关闭deptTest，因为z轴的管理由外面的框架完成
    this._glContext.disableDepthTest();
    // 开启半透明
    this._glContext.enableAlpha();
    // 半透明的计算color(RGBA) = (sourceColor * SRC_ALPHA) + (destinationColor * (1 - SRC_ALPHA))
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    const geometryRenderList = fill.getGeometryRenderList();
    const program = this._glContext.getActiveProgram();
    if (!program) return;
    this._initViewProjectionMatrix(program);
    const a_position = program.getAttribLocation('a_position');
    const u_color = program.getUniformLocation('u_color');
    const u_base = program.getUniformLocation('u_base');
    const u_opacity = program.getUniformLocation('u_opacity');
    for (let i = 0; i < geometryRenderList.length; i += 1) { // 画每一个geometry元素，获取其fillColor填充色、outlineColor轮廓色，buffer，base，和透明度
      const { outlineColor, fillColor, buffer, base, opacity } = geometryRenderList[i];
      buffer.bindData(a_position);
      this._gl.uniform1f(u_base, base);
      this._gl.uniform1f(u_opacity, opacity);
      this._gl.uniform4fv(u_color, fillColor);
      buffer.bindIndices('fill');
      this._gl.drawElements(this._gl.TRIANGLES, buffer.fillIndicesNum, this._gl.UNSIGNED_SHORT, 0); // 填充内部颜色
      this._gl.uniform4fv(u_color, outlineColor);
      buffer.bindIndices('outline');
      this._gl.drawElements(this._gl.LINES, buffer.outlineIndicesNum, this._gl.UNSIGNED_SHORT, 0); // 画外轮廓
    }
  }
  destroy() {
    this._canvas.remove();
    this._collisionMng.off('change', this._onCollisionChange.bind(this));
    this._collisionMng.destroy();
    this._bucketMng.destroy();
  }
  getCamera() {
    return this._camera;
  }
  getCanvas() {
    return this._canvas;
  }
  getLayers() {
    return this._layers;
  }
  /**
     * Check if a layer is in renderer's layer list.
     * @param {Layer} layer
     * @return {Boolean} .
  */
  contains(layer) {
    for (let i = 0; i < this._layers.length; i += 1) {
      if (this._layers[i].id === layer.id) {
        return true;
      }
    }
    return false;
  }
  getGl() {
    return this._gl;
  }
  _initViewProjectionMatrix(program) {
    // 获取视图矩阵、投影矩阵
    const u_projectionMatrix = program.getUniformLocation('u_projectionMatrix'); // 获取u_projectionMatrix在GPU内存的位置，是一个WebGLUniformLocation对象
    const u_viewMatrix = program.getUniformLocation('u_viewMatrix'); // 获取u_viewMatrix在GPU内存的位置，是一个WebGLUniformLocation对象
    this._gl.uniformMatrix4fv(u_projectionMatrix, false, this._camera.projectionMatrix); // 将4*4的矩阵传给shader中的变量，供GPU渲染
    this._gl.uniformMatrix4fv(u_viewMatrix, false, this._camera.viewMatrix);
  }
}
