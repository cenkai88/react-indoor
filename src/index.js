import React, { useState, useRef, useEffect } from 'react';
import Indoor from './Indoor';

import defaultstyleData from '../data/style';
import HeatmapLayer from './layers/Heatmap/HeatmapLayer';
import { convertPercentToWorld } from './utils/common';
import Marker from './overlay/Marker';
import LineLayer from './layers/Line/LineLayer';

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
};

export default ({
  floorId,
  floorData,
  heatmapData,
  lineData,
  markerData,
  styleData = defaultstyleData,
  options,
  onInit,
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
      line = new LineLayer({
        lineWidth: 8,
        lineImage: 'https://static.yingxuys.com/indoor_sdk/facility/ic_line.png',
        lineColor: '#0548A0',
      });
      setLineLayer(line);
      mapIns.addLayer(line);
    } else {
      line = LineLayer;
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

  const updateMarkers = (data) => {
    if (!mapIns) return
    if (markersOverlay) markersOverlay.forEach(item => item.remove());

    const { bbox } = mapIns.getFloorData().frame.features[0];
    const deltaX = bbox[1][0] - bbox[0][0];
    const deltaY = bbox[1][1] - bbox[0][1];

    const markers = data.map(item => {
      const [x, y] = convertPercentToWorld(item, bbox, deltaX, deltaY);
      return new Marker({
        iconImage: item.iconUrl,
        iconAnchor: 'bottom',
        iconSize: 0.1,
        x,
        y,
        properties: {
          name: item.text
        } 
      }, mapIns.getFloorData().id)
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
      map.destroy();
    }
  }, []);

  useEffect(() => {
    if (mapIns) mapIns.setCurrentFloorId(floorId);
  }, [floorId]);

  useEffect(() => {
    if (mapIns) mapIns.destroy();
    if (domReady) mapIns.init({ floorData, floorId });
  }, [floorData]);

  useEffect(() => {
    if (mapIns && domReady) updateHeatmap(heatmapData);
  }, [heatmapData]);

  useEffect(() => {
    if (mapIns && domReady) updateMarkers(markerData);
  }, [markerData]);

  useEffect(() => {
    if (domReady) {
      mapIns.init({ floorData, floorId });
      if (typeof onInit === 'function') onInit();
      if (heatmapData) updateHeatmap(heatmapData)
      if (markerData) updateMarkers(markerData)
      if (lineData) updateLine(lineData)
    }
  }, [domReady]);

  return <div ref={container} style={{ width: '100%', height: '100%', fontSize: 0 }}>
    <canvas style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }} width={canvasWidth * devicePixelRatio} height={canvasHeight * devicePixelRatio} ref={mapCanvas} />
    <canvas style={{ display: 'none', width: canvas2dStyleWidth, height: canvas2dStyleHeight }} width={canvas2dWidth} height={canvas2dHeight} ref={textureCanvas} />
    <canvas style={{ display: 'none', width: canvas2dStyleWidth, height: canvas2dStyleHeight }} width={canvas2dWidth} height={canvas2dHeight} ref={glyphCanvas} />
  </div>
}