import React from 'react';

import Overview from './examples/overview';
import ExampleOutline from './examples/frame';
import ExampleRooms from './examples/rooms';
import ExampleHeatmap from './examples/heatmap';
import ExampleChangeFloor from './examples/changeFloor';
import ExampleMarker from './examples/marker';
import ExampleLine from './examples/line';
import ExampleDrag from './examples/drag';
import ExampleHover from './examples/hover';
import ExampleMaintaince from './examples/click';


import './index.scss'

const CONTENT_MAPPING = {
  EXAMPLE: [
    <Overview />,
    <ExampleOutline />,
    <ExampleRooms />,
    <ExampleHeatmap />,
    <ExampleChangeFloor />,
    <ExampleMarker />,
    <ExampleLine />,
    <ExampleDrag />,
    <ExampleHover />,
    <ExampleMaintaince />,
  ],
};

export default ({ mode, activeIdx }) => {
  return <div className="content">
    {CONTENT_MAPPING[mode][activeIdx]}
  </div>
}