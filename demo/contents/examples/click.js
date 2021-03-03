import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorData from '../../../data/floor';

import ReactIndoor from '../../../src/index.js';

const dataStr = `const [roomInfo, setRoomInfo] = useState({});
const onClick = ({ _room }) => {
  setRoomInfo(_room.properties)
}`;

const codeStr = `<ReactIndoor
floorData={floorData}
floorId="RJ00201010001"
onClick={onClick}
options={{
  enableRoomHover: true,
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
  const [roomInfo, setRoomInfo] = useState({});
  const onClick = ({ _room }) => {
    setRoomInfo(_room ? _room.properties : {});
  }
  return <div className="content-body">
    <div className="content-body-title" >
      Room Maintainance
    </div>
    <div className="content-item">
      <div className="content-item-title">
        Click event of room
      </div>
      <div className="content-item-description">
        You can maintain room information with click on the room.
      </div>
      <div className="content-item-map">
        <div className="content-item-map-js">
          <SyntaxHighlighter language="javascript" showLineNumbers>
            {dataStr}
          </SyntaxHighlighter>
        </div>
        <div className="content-item-map-info">
          <div>ID: {roomInfo.id}</div>
          <div>中心点坐标: {(roomInfo.center || []).join(', ')}</div>
          <div>名称: {roomInfo.name}</div>
          <div>颜色类型: {roomInfo.iconId}</div>
        </div>
        <div className="content-item-map-row">
          <div className="content-item-map-component">
            <ReactIndoor
              floorData={floorData}
              floorId="RJ00201010001"
              onClick={onClick}
              options={{
                enableRoomHover: true,
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
  </div>
}