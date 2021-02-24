/**
 * @file  
  Renderer is used to link the json data, camera, webGl engine

*/

import Base from '../base/Base';

import WebpackPool from '../worker/pool';
import { sort } from '../utils/common';
import GLContext from './GLContext';
import CollisionManager from './manager/CollisionManager';
import TextureManager from './manager/TextureManager';
import GlyphManager from './manager/GlyphManager';
import Camera from '../camera/Camera';
import { parseColor } from '../utils/style';

export default class Renderer extends Base {
  /**
     * Create a Renderer.
     * @param {HTMLDivElement} container - div containerer of the indoor map.
     * @param {HTMLCanvasElement} mapCanvas - canvas that the map is renderer
     * @param {Object} options - options
     * @return {Renderer} The Renderer.
  */
  constructor(container, {
    mapId,
    mapCanvas,
    glyphCanvas,
    textureCanvas,
  }, options) {
    super();
    this._mapId = mapId;
    this._layers = [];
    this._lightPos = [1, -1, 1];
    this._ambientColor = [0.8, 0.8, 0.8];
    this._ambientMaterial = [1, 1, 1];
    this._diffuseColor = [0.1, 0.1, 0.1];
    this._diffuseMaterial = [1, 1, 1];
    if (!window.indoorWorkerPool) {
      window.indoorWorkerPool = new WebpackPool(mapId);
    } else {
      window.indoorWorkerPool.addMapInsId(mapId);
    }
    this._workerPool = window.indoorWorkerPool;
    this._normalResult = { data: {}, opacity: 1 };
    this._renderQueue = [];
    this._container = container;
    this._canvas = mapCanvas;
    const { clientWidth, clientHeight } = mapCanvas;
    const glOptions = {
      antialias: true,
      depth: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      alpha: true,
      failIfMajorPerformanceCaveat: true,
    };
    this._setupLight(options);
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
      mapId,
      workerPool: window.indoorWorkerPool,
    });
    this._collisionMng.getWorkerPool().listen(mapId, this._onCollisionChange.bind(this));
    this._textureMng = new TextureManager(this._gl, textureCanvas);
    this._glyphMng = new GlyphManager(this._gl, {
      fontWeight: options.fontWeight,
      fontFamily: options.localFontFamily,
      buffer: 3,
      textMaxWidth: options.maxTextSize,
      textSplit: options.textSplit,
    }, glyphCanvas);
    this._glContext = new GLContext(this._gl, {
      width: this._canvas.width,
      height: this._canvas.height,
    });
  }
  getWorkerPool() {
    return this._workerPool;
  }
  getCollisionMng() {
    return this._collisionMng;
  }
  getGlyphMng() {
    return this._glyphMng;
  }
  getTextureMng() {
    return this._textureMng;
  }
  _onCollisionChange(data) {
    const { hideResult, showResult, normalResult } = data;
    this._hideResult = { data: hideResult, opacity: 1 };
    this._showResult = { data: showResult, opacity: 0 };
    this._normalResult = { data: normalResult, opacity: 1 };
    if (data.isForce) this.render();
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
  _drawLayers() {
    this._glContext.clear();
    for (let i = 0; i < this._layers.length; i += 1) {
      const type = this._layers[i].getType();
      switch (type) {
        case "Frame":
          this._drawFrame(this._layers[i]);
          break
        case "Room":
          this._drawRoom(this._layers[i]);
          break
        case "Icon":
          this._drawIcon(this._layers[i]);
          break
        case "Heatmap":
          this._drawHeatmap(this._layers[i]);
          break
        case "Line":
          this._drawLine(this._layers[i]);
          break
      }
    }
  }
  _drawFrame(frame) {
    this._glContext.use(frame.getShaderName());
    this._glContext.disableDepthTest();
    this._glContext.enableAlpha();
    // color(RGBA) = (sourceColor * SRC_ALPHA) + (destinationColor * (1 - SRC_ALPHA))
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    const geometryRenderList = frame.getGeometryRenderList();
    const program = this._glContext.getActiveProgram();
    if (!program) return;
    this._initViewProjectionMatrix(program);
    const a_position = program.getAttribLocation('a_position');
    const u_color = program.getUniformLocation('u_color');
    const u_base = program.getUniformLocation('u_base');
    const u_opacity = program.getUniformLocation('u_opacity');
    for (let i = 0; i < geometryRenderList.length; i += 1) {
      const { outlineColor, fillColor, buffer, base, opacity } = geometryRenderList[i];
      buffer.bindData(a_position);
      this._gl.uniform1f(u_base, base);
      this._gl.uniform1f(u_opacity, opacity);
      this._gl.uniform4fv(u_color, fillColor);
      buffer.bindIndices('fill');
      this._gl.drawElements(this._gl.TRIANGLES, buffer.fillIndicesNum, this._gl.UNSIGNED_SHORT, 0);
      this._gl.uniform4fv(u_color, outlineColor);
      buffer.bindIndices('outline');
      this._gl.drawElements(this._gl.LINES, buffer.outlineIndicesNum, this._gl.UNSIGNED_SHORT, 0);
    }
  }
  _drawRoom(room) {
    this._glContext.use(room.getShaderName());
    this._glContext.enableAlpha();
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    this._glContext.enableDepthTest();
    const program = this._glContext.getActiveProgram();
    if (!program) return;
    this._initViewProjectionMatrix(program);
    this._setLight(program);
    const u_color = program.getUniformLocation('u_color');
    const u_height = program.getUniformLocation('u_height');
    const u_base = program.getUniformLocation('u_base');
    const u_opacity = program.getUniformLocation('u_opacity');
    const a_position = program.getAttribLocation('a_position');
    const a_normal = program.getAttribLocation('a_normal');
    const u_drawLine = program.getUniformLocation('u_drawLine');
    const geometryRenderList = room.getGeometryRenderList();
    const zoom = this._camera.getZoom();
    for (let i = 0; i < geometryRenderList.length; i += 1) {
      const { fillColor, base, buffer, height, outlineColor, opacity, zoomRange } = geometryRenderList[i];
      this._gl.uniform1f(u_base, base);
      buffer.bindData(a_position, a_normal);
      this._gl.uniform1f(u_height, height);
      let zoomOpacity = 1;
      if (zoomRange) {
        const num = 1 - (zoom - zoomRange[0]) / (zoomRange[1] - zoomRange[0]);
        zoomOpacity = num > 1 ? 1 : (num > 0 ? num : 0);
      }
      this._gl.uniform1f(u_opacity, opacity * zoomOpacity);
      this._gl.uniform4fv(u_color, outlineColor);
      this._gl.uniform1i(u_drawLine, 1);
      buffer.bindIndices('outline');
      this._gl.drawElements(this._gl.LINES, buffer.outlineIndicesNum, this._gl.UNSIGNED_SHORT, 0);
      this._gl.uniform4fv(u_color, this._hoveredRoomId === '0' ? '#111' : fillColor);
      this._gl.uniform1i(u_drawLine, 0);
      buffer.bindIndices('fill');
      this._gl.drawElements(this._gl.TRIANGLES, buffer.fillIndicesNum, this._gl.UNSIGNED_SHORT, 0);
    }
  }
  _drawIcon(icon) {
    this._glContext.use(icon.getShaderName());
    this._glContext.enableAlpha();
    this._gl.blendFuncSeparate(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA);
    this._glContext.disableDepthTest();
    const program = this._glContext.getActiveProgram();
    if (!program) return;
    this._initViewProjectionMatrix(program);
    const u_modelMatrix = program.getUniformLocation('u_modelMatrix');
    this._gl.uniformMatrix4fv(u_modelMatrix, false, this._camera.textureMatrix);
    const u_resolution = program.getUniformLocation('u_resolution');
    this._gl.uniform2fv(u_resolution, [this._camera.getWidth(), this._camera.getHeight()]);
    const u_position = program.getUniformLocation('u_position');
    const u_offset = program.getUniformLocation('u_offset');
    const u_opacity = program.getUniformLocation('u_opacity');
    const u_sampler = program.getUniformLocation('u_sampler');
    this._gl.uniform1i(u_sampler, 0);
    const u_base = program.getUniformLocation('u_base');
    const a_position = program.getAttribLocation('a_position');
    const a_texCoord = program.getAttribLocation('a_texCoord');
    const geometryRenderList = icon.getGeometryRenderList();
    for (let i = 0; i < geometryRenderList.length; i += 1) {
      for (let j = 0; j < geometryRenderList[i].length; j += 1) {
        const { buffer, point, offset, base, opacity } = geometryRenderList[i][j];
        this._gl.uniform2fv(u_position, point);
        this._gl.uniform2fv(u_offset, offset);
        this._gl.uniform1f(u_base, base);
        this._gl.uniform1f(u_opacity, opacity);
        buffer.bind(a_position, a_texCoord);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, buffer.verticesNum);
      }
    }
    const data = {
      u_position,
      u_offset,
      u_base,
      u_opacity,
      a_position,
      a_texCoord,
    };
    if (this._hideResult) this._drawCollisionResult(this._hideResult, icon, data);
    if (this._showResult) this._drawCollisionResult(this._showResult, icon, data);
    this._drawCollisionResult(this._normalResult, icon, data);
  }
  _drawHeatmap(layer) {
    this._glContext.use(layer.getShaderName());
    this._glContext.disableDepthTest();
    this._glContext.enableAlpha();
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE);
    const buffer = layer.getBuffer();
    const program = this._glContext.getActiveProgram();
    if (!buffer || !program) return;
    this._initViewProjectionMatrix(program);
    const u_radius = program.getUniformLocation('u_radius');
    const a_normal = program.getAttribLocation('a_normal');
    const u_resolution = program.getUniformLocation('u_resolution');
    this._gl.uniform2fv(u_resolution, [this._camera.getWidth(), this._camera.getHeight()]);
    const u_position = program.getUniformLocation('u_position');
    buffer.bind(a_normal);
    this._glContext.enableFrameBuffer();
    const geometryRenderList = layer.getGeometryRenderList();
    for (let i = 0; i < geometryRenderList.length; i += 1) {
      const _a = geometryRenderList[i], point = _a.point, radius = _a.radius;
      this._gl.uniform2fv(u_position, point);
      this._gl.uniform1f(u_radius, radius);
      this._gl.drawArrays(this._gl.TRIANGLE_FAN, 0, buffer.verticesNum);
    }
    this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    this._drawHeatMapTexture(layer);
  }
  _drawHeatMapTexture(layer) {
    this._glContext.use('heatmapTexture');
    this._glContext.enableAlpha();
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    this._glContext.disableDepthTest();
    const program = this._glContext.getActiveProgram();
    if (!program) return;
    const a_position = program.getAttribLocation('a_position');
    const u_resolution = program.getUniformLocation('u_resolution');
    const u_opacity = program.getUniformLocation('u_opacity');
    const opacity = layer.getLayout().opacity;
    this._gl.uniform1f(u_opacity, opacity);
    const { width, height } = this._glContext.getViewRect();
    this._gl.uniform2fv(u_resolution, [width, height]);
    const vertices = [-1, -1, -1, 1, 1, -1, 1, 1];
    this._glContext.initArrayBuffer(a_position, new Float32Array(vertices), 2);
    this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
  }
  _drawLine(line) {
    const geometryRenderList = line.getGeometryRenderList();
    this._glContext.use(line.getShaderName());
    this._glContext.disableDepthTest();
    this._glContext.enableAlpha();
    this._gl.blendFunc(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA);
    const program = this._glContext.getActiveProgram();
    if (!program) return;
    this._initViewProjectionMatrix(program);
    const a_position = program.getAttribLocation('a_position');
    const a_normal = program.getAttribLocation('a_normal');
    const a_texCoord = program.getAttribLocation('a_texCoord');
    const a_deviation = program.getAttribLocation('a_deviation');
    const u_color = program.getUniformLocation('u_color');
    const u_onePixelToWorld = program.getUniformLocation('u_onePixelToWorld');
    const u_sampler = program.getUniformLocation('u_sampler');
    this._gl.uniform1i(u_sampler, 0);
    const u_lineWidth = program.getUniformLocation('u_lineWidth');
    const u_imgSize = program.getUniformLocation('u_imgSize');
    const u_opacity = program.getUniformLocation('u_opacity');
    const u_useTexture = program.getUniformLocation('u_useTexture');
    const u_base = program.getUniformLocation('u_base');
    this._gl.uniform1f(u_onePixelToWorld, this._camera.getOnePixelToWorld());
    for (let i = 0; i < geometryRenderList.length; i += 1) {
      const { lineColor, buffer, useTexture, imgSize, lineWidth, base, opacity } = geometryRenderList[i];
      this._gl.uniform1i(u_useTexture, useTexture ? 1 : 0);
      this._gl.uniform1f(u_lineWidth, lineWidth);
      this._gl.uniform1f(u_base, base);
      this._gl.uniform1f(u_opacity, opacity);
      this._gl.uniform2fv(u_imgSize, imgSize);
      this._gl.uniform4fv(u_color, lineColor);
      buffer.bind({ a_position, a_normal, a_deviation, a_texCoord });
      this._gl.drawElements(this._gl.TRIANGLES, buffer.indicesNum, this._gl.UNSIGNED_SHORT, 0);
    }
  }
  _drawCollisionResult(result, layer, locations) {
    const arr = result.data[layer.id];
    if (!arr) return;
    const renderList = layer.getCollisionRenderList();
    for (let i = 0; i < arr.length; i += 1) {
      const list = renderList[arr[i]] || [];
      for (let j = 0; j < list.length; j += 1) {
        const { buffer, point, offset, base, opacity } = list[j];
        this._gl.uniform2fv(locations.u_position, point);
        this._gl.uniform2fv(locations.u_offset, offset);
        this._gl.uniform1f(locations.u_base, base);
        this._gl.uniform1f(locations.u_opacity, opacity * result.opacity);
        buffer.bind(locations.a_position, locations.a_texCoord);
        this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, buffer.verticesNum);
      }
    }
  }
  destroy() {
    this._canvas.remove();
    this._collisionMng.clear();
    window.indoorWorkerPool.destroy(this._mapId);
    this._glContext.destroy();
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
  _setLight(program) {
    const u_normalMatrix = program.getUniformLocation('u_normalMatrix');
    this._gl.uniformMatrix4fv(u_normalMatrix, false, this._camera.normalMatrix);
    const u_lightPos = program.getUniformLocation('u_lightPos');
    this._gl.uniform3fv(u_lightPos, this._lightPos);
    const u_ambientColor = program.getUniformLocation('u_ambientColor');
    this._gl.uniform3fv(u_ambientColor, this._ambientColor);
    const u_ambientMaterial = program.getUniformLocation('u_ambientMaterial');
    this._gl.uniform3fv(u_ambientMaterial, this._ambientMaterial);
    const u_diffuseColor = program.getUniformLocation('u_diffuseColor');
    this._gl.uniform3fv(u_diffuseColor, this._diffuseColor);
    const u_diffuseMaterial = program.getUniformLocation('u_diffuseMaterial');
    this._gl.uniform3fv(u_diffuseMaterial, this._diffuseMaterial);
  }
  _setupLight(options) {
    const { lightPos, ambientColor, ambientMaterial, diffuseColor, diffuseMaterial } = options;
    if (lightPos) {
      this._lightPos = [lightPos.x, lightPos.y, lightPos.z];
    }
    if (ambientColor) {
      this._ambientColor = parseColor(ambientColor);
    }
    if (ambientMaterial) {
      this._ambientMaterial = parseColor(ambientMaterial);
    }
    if (diffuseColor) {
      this._diffuseColor = parseColor(diffuseColor);
    }
    if (diffuseMaterial) {
      this._diffuseMaterial = parseColor(diffuseMaterial);
    }
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
    const u_projectionMatrix = program.getUniformLocation('u_projectionMatrix');
    const u_viewMatrix = program.getUniformLocation('u_viewMatrix');
    this._gl.uniformMatrix4fv(u_projectionMatrix, false, this._camera.projectionMatrix);
    this._gl.uniformMatrix4fv(u_viewMatrix, false, this._camera.viewMatrix);
  }
  setHoveredRoomId(id) {
    this._hoveredRoomId = id;
  }
  getHoveredRoomId() {
    return this._hoveredRoomId
  }
}
