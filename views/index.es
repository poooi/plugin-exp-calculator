import React, { useState, useEffect } from 'react'
import { Navbar, Tabs, Tab, Alignment } from '@blueprintjs/core'
import styled from 'styled-components'
import { observe } from 'redux-observers'
import { store } from 'views/create-store'

import { dataObserver } from '../reducer'
import ShipExp from './ship-exp'

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

let unsubscribe

const ExpCalc = () => {
  const [activeTab, setActiveTab] = useState('ship-exp')

  useEffect(() => {
    unsubscribe = observe(store, [dataObserver])

    return () => unsubscribe()
  }, [])

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
