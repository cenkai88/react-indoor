import React from 'react';
import { render } from 'react-dom';
import "core-js/stable";
import "regenerator-runtime/runtime";
import Root from './demo/root';

export default render(
 <Root></Root>,
  document.getElementById('root')
)