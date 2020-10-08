import React from 'react';
import { render } from 'react-dom';
import "core-js/stable";
import "regenerator-runtime/runtime";

import ReactIndoor from './src/index.js';

export default render(
  <div style={{ height: 800, width: 800, border: '1px solid black', background: 'wheat' }}><ReactIndoor /></div>,
  document.getElementById('root')
)