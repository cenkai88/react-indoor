import React, { useState, useRef, useEffect } from 'react';
import Indoor from './Indoor';

import floorData from '../example/floor';
import buildingData from '../example/building';
import styleJson from '../example/style';

const canvas2dStyleWidth = 1080;
const canvas2dStyleHeight = 960;
const canvas2dWidth = canvas2dStyleWidth * devicePixelRatio;
const canvas2dHeight = canvas2dStyleHeight * devicePixelRatio;

export default () => {
  const container = useRef();
  const mapCanvas = useRef();
  const textureCanvas = useRef();
  const glyphCanvas = useRef();

  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [domReady, setDomReady] = useState(false);

  useEffect(() => {
    setCanvasWidth(container.current.clientWidth);
    setCanvasHeight(container.current.clientHeight);
    setDomReady(true);
  }, []);

  useEffect(() => {
    const map = new Indoor({
      container: container.current,
      mapCanvas: mapCanvas.current,
      textureCanvas: textureCanvas.current,
      glyphCanvas: glyphCanvas.current,
      styleJson,
      maxZoom: 23,
      minZoom: 16,
      zoom: 19,
      rotate: 0,
      pitch: 30,
      center: {
        x: 1254.8271713616455,
        y: 117.50345301174428,
      },
    });
    if (domReady) {
      map.init({ floorData, buildingData });
      // console.log(map.layers);
      setTimeout(() => {
        // map.pitch = 30;
      }, 2000)
    }
  }, [domReady])

  return <div ref={container} style={{ width: '100%', height: '100%', fontSize: 0 }}>
    <canvas style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }} width={canvasWidth * devicePixelRatio} height={canvasHeight * devicePixelRatio} ref={mapCanvas} />
    <canvas style={{ display: 'none', width: canvas2dStyleWidth, height: canvas2dStyleHeight }} width={canvas2dWidth} height={canvas2dHeight} ref={textureCanvas} />
    <canvas style={{ display: 'none', width: canvas2dStyleWidth, height: canvas2dStyleHeight }} width={canvas2dWidth} height={canvas2dHeight} ref={glyphCanvas} />
  </div>
}