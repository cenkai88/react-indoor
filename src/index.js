import React, { useState, useRef, useEffect } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect'
import Indoor from './Indoor';

import defaultstyleData from '../data/style';
import HeatmapLayer from './layers/Heatmap/HeatmapLayer';
import { convertPercentToWorld } from './utils/common';
import Marker from './overlay/Marker';
import LineLayer from './layers/Line/LineLayer';
import PolygonLayer from './layers/Polygon/PolygonLayer';

const canvas2dStyleWidth = 1080;
const canvas2dStyleHeight = 960;
const canvas2dWidth = canvas2dStyleWidth * devicePixelRatio;
const canvas2dHeight = canvas2dStyleHeight * devicePixelRatio;

const defaultOption = {
  maxZoom: 23,
  minZoom: 11,
  zoom: 15,
  rotate: 0,
  pitch: 0,
  center: {
    x: 0,
    y: 0,
  },
  heatmapRadius: 20,
  line: {}
};

export default ({
  floorId,
  floorData = [],
  heatmapData = [],
  lineData = [],
  polygonData = [],
  markerData = [],
  styleData = defaultstyleData,
  options,
  onInit,
  onDrop,
  onClick,
  onEnterMarker,
  onLeaveMarker,
  onMouseDown
}) => {

  const container = useRef();
  const mapCanvas = useRef();
  const textureCanvas = useRef();
  const glyphCanvas = useRef();

  const mergedOptions = {
    ...defaultOption,
    ...options,
  };

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [domReady, setDomReady] = useState(false);
  const [mapIns, setMapIns] = useState();
  const [heatmapLayer, setHeatmapLayer] = useState();
  const [lineLayer, setLineLayer] = useState();
  const [polygonLayer, setPolygonLayer] = useState();
  const [markersOverlay, setMarkersOverlay] = useState();

  const updateHeatmap = (data) => {
    if (!mapIns) return
    let heatmap
    if (!heatmapLayer) {
      heatmap = new HeatmapLayer({ radius: mergedOptions.heatmapRadius });
      setHeatmapLayer(heatmap);
      mapIns.addLayer(heatmap);
    } else {
      heatmap = heatmapLayer;
    }
    heatmap.setFloorId(mapIns.getFloorData().id);
    const { bbox } = mapIns.getFloorData().frame.features[0];
    const deltaX = bbox[1][0] - bbox[0][0];
    const deltaY = bbox[1][1] - bbox[0][1];

    const features = data.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: convertPercentToWorld(item, bbox, deltaX, deltaY),
      },
    }));
    heatmap.setFeatures(features);
    mapIns.updateLayer(heatmap);
  }

  const updateLine = (data) => {
    if (!mapIns) return
    let line
    if (!lineLayer) {
      line = new LineLayer(mergedOptions.line);
      setLineLayer(line);
      mapIns.addLayer(line);
    } else {
      line = lineLayer;
    }
    line.setFloorId(mapIns.getFloorData().id);
    const { bbox } = mapIns.getFloorData().frame.features[0];
    const deltaX = bbox[1][0] - bbox[0][0];
    const deltaY = bbox[1][1] - bbox[0][1];

    const features = [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: data.map(item => convertPercentToWorld(item, bbox, deltaX, deltaY)),
      },
    }];
    line.setFeatures(features);
    mapIns.updateLayer(line);
  }

  const updatePolygon = data => {
    if (!mapIns) return
    let polygon
    if (!polygonLayer) {
      polygon = new PolygonLayer(mergedOptions.polygon);
      setPolygonLayer(polygon);
      mapIns.addLayer(polygon);
    } else {
      polygon = polygonLayer;
    }
    polygon.setFloorId(mapIns.getFloorData().id);
    const { bbox } = mapIns.getFloorData().frame.features[0];
    const deltaX = bbox[1][0] - bbox[0][0];
    const deltaY = bbox[1][1] - bbox[0][1];

    const features = [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: data.map(item => item.map(jtem => convertPercentToWorld(jtem, bbox, deltaX, deltaY))),
      },
    }];
    polygon.setFeatures(features);
    mapIns.updateLayer(polygon);
  }

  const updateMarkers = (data) => {
    if (!mapIns) return
    if (markersOverlay) markersOverlay.forEach(item => item.remove());

    const { bbox } = mapIns.getFloorData().frame.features[0];
    const deltaX = bbox[1][0] - bbox[0][0];
    const deltaY = bbox[1][1] - bbox[0][1];

    const markers = data.map(item => {
      const [x, y] = convertPercentToWorld(item, bbox, deltaX, deltaY);
      return new Marker({ ...item, x, y }, mapIns.getFloorData().id)
    });
    markers.forEach(item => item.addTo(mapIns));
    setMarkersOverlay(markers);
  }

  useEffect(() => {
    setCanvasWidth(container.current.clientWidth);
    setCanvasHeight(container.current.clientHeight);
    const map = new Indoor({
      ...mergedOptions,
      container: container.current,
      mapCanvas: mapCanvas.current,
      textureCanvas: textureCanvas.current,
      glyphCanvas: glyphCanvas.current,
      styleData,
    })
    setMapIns(map);
    setDomReady(true);
    return () => {
      if (map) map.destroy();
    }
  }, []);

  useEffect(() => {
    if (mapIns) mapIns.setCurrentFloorId(floorId);
  }, [floorId]);

  useDeepCompareEffect(() => {
    if (mapIns) mapIns.destroy();
    if (domReady) mapIns.init({ floorData, floorId });
  }, [floorData]);

  useDeepCompareEffect(() => {
    if (mapIns && domReady) updateHeatmap(heatmapData);
  }, [heatmapData]);

  useDeepCompareEffect(() => {
    if (mapIns && domReady) updateMarkers(markerData);
  }, [markerData]);

  useDeepCompareEffect(() => {
    if (mapIns && domReady) updateLine(lineData);
  }, [lineData]);

  useDeepCompareEffect(() => {
    if (mapIns && domReady) updatePolygon(polygonData);
  }, [polygonData]);

  useEffect(() => {
    if (domReady) {
      mapIns.init({ floorData, floorId });
      if (typeof onInit === 'function') onInit();
      if (heatmapData && heatmapData.length) updateHeatmap(heatmapData)
      if (markerData && markerData.length) updateMarkers(markerData)
      if (lineData && lineData.length) updateLine(lineData)
      if (polygonData && polygonData.length) updatePolygon(polygonData)
      if (typeof onEnterMarker === 'function') mapIns.on('enterMarker', onEnterMarker);
      if (typeof onLeaveMarker === 'function') mapIns.on('leaveMarker', onLeaveMarker);
    }
  }, [domReady]);

  return <div ref={container} style={{ width: '100%', height: '100%', fontSize: 0 }}
    onClick={e => mapIns.gestureManager._onClick(e.nativeEvent, onClick)}
    onDrop={e => mapIns.gestureManager._onDrop(e.nativeEvent, onDrop)}
    onMouseDown={e => mapIns.gestureManager._onMousedown(e.nativeEvent, onMouseDown)}
  >
    <canvas style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }} width={canvasWidth * devicePixelRatio} height={canvasHeight * devicePixelRatio} ref={mapCanvas} />
    <canvas style={{ display: 'none', width: canvas2dStyleWidth, height: canvas2dStyleHeight }} width={canvas2dWidth} height={canvas2dHeight} ref={textureCanvas} />
    <canvas style={{ display: 'none', width: canvas2dStyleWidth, height: canvas2dStyleHeight }} width={canvas2dWidth} height={canvas2dHeight} ref={glyphCanvas} />
  </div>
}