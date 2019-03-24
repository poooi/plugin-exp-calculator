import React, { useState } from 'react'
import { Navbar, Tabs, Tab, Alignment } from '@blueprintjs/core'
import styled from 'styled-components'

import ShipExp from './ship-exp'

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

const ExpCalc = () => {
  const [activeTab, setActiveTab] = useState('ship-exp')

  return (
    <div>
      <Navbar>
        <Navbar.Group align={Alignment.RIGHT}>
          <Tabs
            selectedTabId={activeTab}
            onChange={tabId => setActiveTab(tabId)}
            id="exp-calc-navs"
            renderActiveTabPanelOnly
          >
            <Tab id="ship-exp" title="Exp" />
            <Tab id="data" title="Data" />
          </Tabs>
        </Navbar.Group>
      </Navbar>
      <PluginContainer>
        {activeTab === 'ship-exp' && <ShipExp />}
        {activeTab === 'data' && <div />}
      </PluginContainer>
    </div>
  )
}

export default ExpCalc
