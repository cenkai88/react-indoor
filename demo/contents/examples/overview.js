import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import floorSimple from '../../../data/floorSimple';

export default () => {
  return <div className="content-overview">
    <h2 style={{ marginTop: 4 }}>React Indoor</h2>
    <p>React Indoor is a react component based on WebGl to render indoor map based on map data in GeoJson format.</p>
    <h4>Map Data Required</h4>

    <div className="content-overview-item">
      <h5>1. Floor Data</h5>
      <p>Floor data describes <strong>frame, rooms, facility(devices)</strong> in a single floor.</p>
      <h6>· Frame </h6>
      <p>Frame is the outline of a floor.</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>features.geometry.coordinates</td>
            <td>☑️</td>
            <td>The coordinates array that describe the floor frame.</td>
          </tr>
        </tbody>
      </table>
      <h6>· Room </h6>
      <p>Room describes the rooms and small closed areas in a single floor.</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>features.properties.id</td>
            <td>☑️</td>
            <td>The unique identifier of room</td>
          </tr>
          <tr>
            <td>features.properties.name</td>
            <td></td>
            <td>Name of room, will be rendered as text on map.</td>
          </tr>
          <tr>
            <td>features.properties.center</td>
            <td>☑️</td>
            <td>Center point of room, decides the position of room icon and room name on map.</td>
          </tr>
          <tr>
            <td>features.properties.hasFacility</td>
            <td></td>
            <td>Whether there is any facility bond to this room. You can specify how room looks depends on this field.</td>
          </tr> 
          <tr>
            <td>features.properties.iconId</td>
            <td></td>
            <td>The iconId is used to specify the style of this room in style data.</td>
          </tr>
          <tr>
            <td>features.geometry.coordinates</td>
            <td>☑️</td>
            <td>The coordinates array that describe the room.</td>
          </tr>
        </tbody>
      </table>
      <h6>· Facility </h6>
      <p>Facility describes the devices and small POIs in a single floor.</p>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>features.properties.id</td>
            <td>☑️</td>
            <td>The unique identifier of facility</td>
          </tr>
          <tr>
            <td>features.properties.name</td>
            <td></td>
            <td>Name of facility, will be rendered as text on map.</td>
          </tr>
          <tr>
            <td>features.properties.center</td>
            <td>☑️</td>
            <td>Center point of facility, decides the position of facility icon and facility name on map.</td>
          </tr>
          <tr>
            <td>features.properties.iconId</td>
            <td></td>
            <td>The iconId is used to specify the style of this facility in style data.</td>
          </tr>
        </tbody>
      </table>
      <div className="content-overview-code">
        <SyntaxHighlighter language="json" showLineNumbers>
          {JSON.stringify(floorSimple, ' ', 2)}
        </SyntaxHighlighter>
      </div>
    </div>

    <div className="content-overview-item">
      <h5>2. Style Data</h5>
    </div>

  </div>
}