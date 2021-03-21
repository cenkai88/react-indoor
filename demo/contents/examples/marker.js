import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorData from '../../../data/floor';
import styleData from '../../../data/style';

import ReactIndoor from '../../../src/index.js';

const codeStr = `<ReactIndoor
floorData={floorData}
floorId="RJ00201010001"
styleData={defaultStyle}
markerData={markerData}
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

const codeStr2 = `<ReactIndoor
floorData={floorData}
floorId="RJ00201010001"
styleData={defaultStyle}
markerData={markerData}
onEnterMarker={e => { setHoveredMarkerId(e.id); setTooltipPos(e.point) }}
onLeaveMarker={e => { setHoveredMarkerId() }}
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
  maxTextSize: 100
}}
/>
{hoveredMarkerId ? <div
  style={{ position: 'absolute', borderRadius: 4, background: 'white', zIndex: 1, padding: '16px 24px', left: tooltipPos.x, top: tooltipPos.y, boxShadow: '0 8px 10px -4px rgba(67,90,111,0.47), 0 0 1px 0 rgba(67,90,111,0.30)' }}
>
  test
  </div> : null}
`;

const jsStr = `defaultStyle.roomIcon.visible = false;
const markerData = [
  { x: 0.1, y: 0.1, iconUrl: 'https://static.yingxuys.com/icons/A.png', iconSize: 0.1, properties: {name: 'testA'} },
  { x: 0.7, y: 0.7, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], properties: {name: 'testB'} },
];`

const jsStr2 = `defaultStyle.roomIcon.visible = false;
const markerData = [
  { x: 0.1, y: 0.1, iconUrl: 'https://static.yingxuys.com/icons/A.png', iconSize: 0.1, properties: {name: 'testA'} },
  { x: 0.7, y: 0.7, iconUrl: 'https://static.yingxuys.com/icons/C.png', textOffset: [0, -16], properties: {name: 'testBBBBBBBBBB'} },
];`


export default () => {
  const defaultStyle = JSON.parse(JSON.stringify(styleData));
  defaultStyle.roomIcon.visible = false;
  const [hoveredMarkerId, setHoveredMarkerId] = useState();
  const [tooltipPos, setTooltipPos] = useState({});
  const markerData = [
    { x: 0.1, y: 0.1, iconUrl: 'https://static.yingxuys.com/icons/A.png', iconSize: 0.1, properties: { name: 'testA' } },
    { x: 0.7, y: 0.7, iconUrl: 'https://static.yingxuys.com/icons/C.png', iconSize: 0.1, textOffset: [0, -16], properties: { name: 'testB' } },
  ];

  const markerData2 = [
    { x: 0.1, y: 0.1, iconUrl: 'https://static.yingxuys.com/icons/A.png', iconSize: 0.1, properties: { name: 'testA' } },
    { x: 0.7, y: 0.7, iconUrl: 'https://static.yingxuys.com/icons/C.png', iconSize: 0.1, textOffset: [0, -16], properties: { name: 'testBBBBBBBBBB' } },
  ];
  return <div className="content-body">
    <div className="content-body-title" >
      Map with markers
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Indoor map with markers
      </div>
      <div className="content-item-description">
        Load the markers with coordinates, icon and text.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="jsx" showLineNumbers>
            {jsStr}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              styleData={defaultStyle}
              markerData={markerData}
              onEnterMarker={e => { setHoveredMarkerId(e.id); setTooltipPos(e.point) }}
              onLeaveMarker={e => { setHoveredMarkerId() }}
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
        Markers with hover tooltip
      </div>
      <div className="content-item-description">
        Trigger tooltip by hovering the markers.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="jsx" showLineNumbers>
            {jsStr2}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              styleData={defaultStyle}
              markerData={markerData2}
              onEnterMarker={e => { setHoveredMarkerId(e.id); setTooltipPos(e.point) }}
              onLeaveMarker={e => { setHoveredMarkerId() }}
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
                maxTextSize: 100
              }}
            />
            {hoveredMarkerId ? <div
              style={{ position: 'absolute', borderRadius: 4, background: 'white', zIndex: 1, padding: '16px 24px', left: tooltipPos.x, top: tooltipPos.y, boxShadow: '0 8px 10px -4px rgba(67,90,111,0.47), 0 0 1px 0 rgba(67,90,111,0.30)' }}
            >
              test
              </div> : null}
          </div>
          <div className="content-item-map-code">
            <SyntaxHighlighter language="jsx" showLineNumbers>
              {codeStr2}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  </div>
}