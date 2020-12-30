import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorData from '../../../data/floor';
import styleData from '../../../data/style';

import ReactIndoor from '../../../src/index.js';

const codeStr = `<ReactIndoor
  floorData={floorFrame}
  floorId="RJ00201010001"
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


const codeStrWithStyle = `<ReactIndoor
  floorData={floorFrame}
  floorId="RJ00201010001"
  styleData={defaultStyle}
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

  return <div className="content-body">
    <div className="content-body-title" >
      Basic Map with Room
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Indoor map with just Frame and Room layer
      </div>
      <div className="content-item-description">
        Load the floor data, and set the initial zoom, zotate, pitch value.
      </div>
      <p draggable="true">拖动我!</p>
      <div className="content-item-map">
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
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
        Hide room icon for room layer
      </div>
      <div className="content-item-description">
        Set visible as false in style data to hide room icon
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            defaultStyle.roomIcon.visible = false;
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              styleData={defaultStyle}
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
              {codeStrWithStyle}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  </div>
}