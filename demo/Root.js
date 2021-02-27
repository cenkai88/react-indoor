import React, { useState } from 'react';

import Header from './components/Header';
import SideMenu from './components/SideMenu';
import Content from './contents/index';

const MENU_DATA = {
  EXAMPLE: [
    {
      name: 'Overview',
    },
    {
      name: 'Basic Map with Frame',
    },
    {
      name: 'Basic Map with Rooms',
    },
    {
      name: 'Map with Heatmap',
    }, 
    {
      name: 'Change Floor',
    },
    {
      name: 'Map with Marker',
    },
    {
      name: 'Map with Line',
    },
    {
      name: 'Drag Event of Map',
    },
    {
      name: 'Hover Room',
    },
    {
      name: 'Room Maintainance',
    },
  ],
}


export default () => {

  const [app, setApp] = useState('EXAMPLE');
  const [activeMenuIdx, setActiveMenuIdx] = useState(7);

  return <>
    <Header app={app} onSetApp={setApp}></Header>
    {(app === 'EXAMPLE') ?
      <div style={{ maxWidth: 1300, margin: '24px auto', width: '90%', display: 'flex', background: 'white', boxShadow: '0 2px 4px -2px rgba(67,90,111,0.3), 0 0 0 1px rgba(67,90,111,0.12)' }}>
        <SideMenu menuList={MENU_DATA[app]} activeMenuIdx={activeMenuIdx} setActiveMenuIdx={setActiveMenuIdx}></SideMenu>
        <Content mode={app} activeIdx={activeMenuIdx}></Content>
      </div> : null
    }
  </>
};