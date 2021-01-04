import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { get } from 'dot-prop';

import floorData from '../../../data/floor';
import styleData from '../../../data/style';

import ReactIndoor from '../../../src/index.js';

const codeStr = `<ReactIndoor
  floorData={floorFrame}
  floorId="RJ00201010001"
  onDrop={e => setText(formatDropText(e))}
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
  }}
/>`;

const codeDotStr = `<ReactIndoor
  floorData={floorFrame}
  floorId="RJ00201010001"
  markerData={markerData}
  onDrop={e => setText(formatDropText(e))}
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
  }}
/>`;

export default () => {
  const defaultStyle = JSON.parse(JSON.stringify(styleData));
  defaultStyle.roomIcon.visible = false;

  const [text, setText] = useState('');
  const [markerData, setMarkerData] = useState([]);
  const formatDropText = e => `x: ${e.point.x}, y: ${e.point.y}, room name: ${get(e, 'room.properties.name')},  room id: ${get(e, 'room.properties.id')}, `
  const placeDot = e => {
    setMarkerData([{ x: e.point.x, y: e.point.y, iconUrl: '/icons/C.png', text: 'testIcon', iconOffset: [0,20] }])
  }

  return <div className="content-body">
    <div className="content-body-title" >
      Map with drop event
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Catch the drop event
      </div>
      <div className="content-item-description">
        Try to drag the dot into map
      </div>
      <p>
        <img className="dragImage" draggable="true" src="/icons/A.png" />
        <div style={{ fontSize: 13, marginLeft: 8 }}>{text}</div>
      </p>
      <div className="content-item-map">
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              onDrop={e => setText(formatDropText(e))}
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
        Place the dot into map
      </div>
      <div className="content-item-description">
        Try to drag the dot into map
      </div>
      <p>
        <img className="dragImage" draggable="true" src="/icons/C.png" />
        testIcon
      </p>
      <div className="content-item-map">
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              markerData={markerData}
              onDrop={e => placeDot(e)}
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
              }}
            />
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeDotStr}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  </div>
}