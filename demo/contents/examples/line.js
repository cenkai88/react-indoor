import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorData from '../../../data/floor';

import ReactIndoor from '../../../src/index.js';

const lineData = [[
  { x: 0.5, y: 0.95 },
  { x: 0.47, y: 0.6 },
  { x: 0.48, y: 0.3 },
  { x: 0.46, y: 0.15 },
  { x: 0.66, y: 0.12 },
  { x: 0.7, y: 0.2 },
  { x: 0.68, y: 0.23 },
  { x: 0.66, y: 0.24 },
  { x: 0.6, y: 0.235 },
  { x: 0.6, y: 0.96 },
]];

const polygonData = [[
  { x: 0.5, y: 0.95 },
  { x: 0.47, y: 0.6 },
  { x: 0.48, y: 0.3 },
  { x: 0.46, y: 0.15 },
  { x: 0.66, y: 0.12 },
  { x: 0.7, y: 0.2 },
  { x: 0.68, y: 0.23 },
  { x: 0.66, y: 0.24 },
  { x: 0.6, y: 0.235 },
  { x: 0.6, y: 0.96 },
  { x: 0.5, y: 0.95 },
]];

const dataStr = `const lineData = [[
  { x: 0.5, y: 0.95 },
  { x: 0.47, y: 0.6 },
  { x: 0.48, y: 0.3 },
  { x: 0.46, y: 0.15 },
  { x: 0.66, y: 0.12 },
  { x: 0.7, y: 0.2 },
  { x: 0.68, y: 0.23 },
  { x: 0.66, y: 0.24 },
  { x: 0.6, y: 0.235 },
  { x: 0.6, y: 0.96 },
]]`;

const dataStr2 = `const polygonData = [[
  { x: 0.5, y: 0.95 },
  { x: 0.47, y: 0.6 },
  { x: 0.48, y: 0.3 },
  { x: 0.46, y: 0.15 },
  { x: 0.66, y: 0.12 },
  { x: 0.7, y: 0.2 },
  { x: 0.68, y: 0.23 },
  { x: 0.66, y: 0.24 },
  { x: 0.6, y: 0.235 },
  { x: 0.6, y: 0.96 },
  { x: 0.5, y: 0.95 },
]]`;

const codeStr = `<ReactIndoor
floorData={floorData}
floorId="RJ00201010001"
lineData={lineData}
options={{
  maxZoom: 23,
  minZoom: 16,
  zoom: 17,
  rotate: 0,
  pitch: 60,
  center: {
    x: 1250.8271713616455,
    y: 117.50345301174428,
  },
  line: {
    lineWidth: 8,
    lineImage: 'https://static.yingxuys.com/indoor_sdk/facility/ic_line.png',
    lineColor: '#0548A0',
  }
}}
/>`;


const codeStr2 = `<ReactIndoor
floorData={floorData}
floorId="RJ00201010001"
polygonData={polygonData}
options={{
  maxZoom: 23,
  minZoom: 16,
  zoom: 17,
  rotate: 0,
  pitch: 60,
  center: {
    x: 1250.8271713616455,
    y: 117.50345301174428,
  },
  polygon: {
    opacity: 0.6
  }
}}
/>`;

const codeStr3 = `<ReactIndoor
floorData={floorData}
floorId="RJ00201010001"
polygonData={[geoFence]}
onClick={addPointToFence}
onMouseDown={onRightClick}
options={{
  maxZoom: 23,
  minZoom: 16,
  zoom: 17,
  rotate: 0,
  pitch: 60,
  center: {
    x: 1250.8271713616455,
    y: 117.50345301174428,
  },
  line: {
    lineWidth: 1.5,
    lineColor: '#0548A0',
  },
  polygon: {
    opacity: 0.7
  }
}}
/>
<div style={{ position: 'absolute', right: 10, top: 10 }}>{finishEditing ? 'Finished' : geoFence.length ? (geoFence.length === 1 ? 'Pls continue...' : \`\${geoFence.length} points\`) : ''} </div>
`;

const jsStr = `const [geoFence, setGeoFence] = useState([]);
const [finishEditing, setFinishEditing] = useState(false);

const addPointToFence = e => {
  if (finishEditing) return
  const startPoint = geoFence[0];
  const newPoint = e._percent;
  if (geoFence.length > 1) {
    const distance = Math.sqrt(Math.pow((startPoint.x - newPoint.x), 2) + Math.pow((startPoint.y - newPoint.y), 2));
    if (distance < 1e-2) {
      setFinishEditing(true);
      setGeoFence([...geoFence, startPoint]);
      return
    }
  }
  setGeoFence([...geoFence, newPoint]);
}

const onRightClick = e => {
  if (e?._originEvent?.button !== 2 || geoFence.length === 0) return
  if (finishEditing) {
    setFinishEditing(false);
    setGeoFence([]);
  } else {
    setGeoFence(geoFence.splice(0, geoFence.length - 1));
  }
}`;

export default () => {
  const [geoFence, setGeoFence] = useState([]);
  const [finishEditing, setFinishEditing] = useState(false);

  const addPointToFence = e => {
    if (finishEditing) return
    const startPoint = geoFence[0];
    const newPoint = e._percent;
    if (geoFence.length > 1) {
      const distance = Math.sqrt(Math.pow((startPoint.x - newPoint.x), 2) + Math.pow((startPoint.y - newPoint.y), 2));
      if (distance < 1e-2) {
        setFinishEditing(true);
        setGeoFence([...geoFence, startPoint]);
        return
      }
    }
    setGeoFence([...geoFence, newPoint]);
  }

  const onRightClick = e => {
    if (e?._originEvent?.button !== 2 || geoFence.length === 0) return
    if (finishEditing) {
      setFinishEditing(false);
      setGeoFence([]);
    } else {
      setGeoFence(geoFence.splice(0, geoFence.length - 1));
    }
  }

  return <div className="content-body">
    <div className="content-body-title" >
      Map with Line & Polygon
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Indoor map with line layer
      </div>
      <div className="content-item-description">
        You can draw a line to indicate a path in a floor.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            {dataStr}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              lineData={lineData}
              options={{
                maxZoom: 23,
                minZoom: 16,
                zoom: 17,
                rotate: 0,
                pitch: 60,
                center: {
                  x: 1250.8271713616455,
                  y: 117.50345301174428,
                },
                line: {
                  lineWidth: 8,
                  lineImage: 'https://static.yingxuys.com/indoor_sdk/facility/ic_line.png',
                  lineColor: '#0548A0',
                }
              }}
            />
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeStr}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>

    <div className="content-item">
      <div className="content-item-title">
        Indoor map with polygon layer
      </div>
      <div className="content-item-description">
        You can draw a polygon to indicate an area in a floor.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            {dataStr2}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              polygonData={polygonData}
              options={{
                maxZoom: 23,
                minZoom: 16,
                zoom: 17,
                rotate: 0,
                pitch: 60,
                center: {
                  x: 1250.8271713616455,
                  y: 117.50345301174428,
                },
                polygon: {
                  opacity: 0.6
                }
              }}
            />
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeStr2}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Define a geofence
      </div>
      <div className="content-item-description" onClick={onRightClick}>
        You can define a geofence using lines and polygon.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            {jsStr}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              polygonData={[geoFence]}
              onClick={addPointToFence}
              onMouseDown={onRightClick}
              options={{
                maxZoom: 23,
                minZoom: 16,
                zoom: 17,
                rotate: 0,
                pitch: 60,
                center: {
                  x: 1250.8271713616455,
                  y: 117.50345301174428,
                },
                line: {
                  lineWidth: 1.5,
                  lineColor: '#0548A0',
                },
                polygon: {
                  opacity: 0.7
                }
              }}
            />
            <div style={{ position: 'absolute', right: 10, top: 10 }}>{finishEditing ? 'Finished' : geoFence.length ? (geoFence.length === 1 ? 'Pls continue...' : `${geoFence.length} points`) : ''} </div>
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeStr3}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  </div>
}