import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  Popover,
  Button,
  InputGroup,
  Tabs,
  Tab,
  FormGroup,
  NumericInput,
  Tag,
  Classes,
  Intent,
  Position,
} from '@blueprintjs/core'
import { connect } from 'react-redux'
import cls from 'classnames'
import _, { get, values, padEnd, map } from 'lodash'
import Fuse from 'fuse.js'
import FA from 'react-fontawesome'
import styled from 'styled-components'

import { shipCat, exp } from '../../constants'
import { shipExpDataSelector, shipFleetMapSelector } from '../../selectors'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const catMap = _(shipCat)
  .map(({ name, id }) => [name, id])
  .fromPairs()
  .value()

const searchOptions = [
  {
    name: 'Fleet',
    value: 'fleet',
  },
  {
    name: 'All',
    value: 'all',
  },
  ..._(shipCat)
    .map(({ name }) => ({ name, value: name }))
    .value(),
]

const Wrapper = styled.div`
  .bp3-tab-panel {
    margin-top: 0;
  }
`

const CustomShip = styled.div`
  width: 20em;
  height: 30em;
`

const ShipList = styled.ul`
  padding: 0;
  margin: 0;
  height: 30em;
  overflow: scroll;
  width: 20em;

  ::-webkit-scrollbar {
    width: 1em;
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.BLUE1};
    width: 1em;
  }

  span {
    cursor: pointer;
  }
`

const ShipItem = styled.li`
  display: flex;
  padding: 0.5em 1em;
`

const ShipLv = styled.span`
  width: 3em;
`

const ShipName = styled.span`
  flex: 1;
`

const Menu = connect(state => ({
  ships: shipExpDataSelector(state),
  fleetMap: shipFleetMapSelector(state),
}))(
  class Menu extends Component {
    static propTypes = {
      ships: PropTypes.objectOf(PropTypes.object).isRequired,
      fleetMap: PropTypes.objectOf(PropTypes.number).isRequired,
      onSelect: PropTypes.func.isRequired,
    }

    constructor(props) {
      super(props)

      const options = {
        keys: ['api_name', 'api_yomi', 'romaji'],
        id: 'api_id',
        shouldSort: true,
      }
      this.fuse = new Fuse(values(props.ships), options)
    }

    state = {
      query: '',
      type: 'all',
      startLevel: 1,
      nextExp: exp[2] - exp[1],
    }

    componentDidUpdate = prevProps => {
      if (values(this.props.ships).length !== values(prevProps.ships).length) {
        this.fuse.list = values(this.Props.ships)
        this.forceUpdate()
      }
    }

    handleQueryChange = e => {
      this.setState({
        query: e.target.value,
      })
    }

    handleClear = () => {
      this.setState({
        query: '',
      })
    }

    handleSelect = id => async () => {
      this.props.onSelect(id)
    }

    handleStartLevelChange = startLevel => {
      this.setState({
        startLevel,
        nextExp: (exp[startLevel + 1] || 0) - exp[startLevel],
      })
    }

    handleNextExpChange = value => {
      this.setState({
        nextExp: value,
      })
    }

    handleConfirmCustom = () => {
      const { startLevel, nextExp } = this.state
      this.props.onSelect(0, startLevel, nextExp)
    }

    render() {
      const { query, startLevel, nextExp } = this.state
      const { ships, fleetMap } = this.props

      const filtered = _(this.fuse.search(query))
        .map(Number)
        .value()
      return (
        <Wrapper>
          <InputGroup
            value={query}
            placeholder={__('Search')}
            onChange={this.handleQueryChange}
            rightElement={
              <Button
                minimal
                onClick={this.handleClear}
                intent={Intent.WARNING}
              >
                <FA name="times" />
              </Button>
            }
          />

          <Tabs vertical id="ship-selection" renderActiveTabPanelOnly>
            <Tab
              id="custom"
              title={__('Custom')}
              panel={
                <CustomShip>
                  <FormGroup label={__('Starting level')}>
                    <NumericInput
                      value={startLevel}
                      onValueChange={this.handleStartLevelChange}
                    />
                  </FormGroup>
                  <FormGroup label={__('To next')}>
                    <NumericInput
                      value={nextExp}
                      onValueChange={this.handleNextExpChange}
                    />
                  </FormGroup>
                  <Button
                    intent={Intent.PRIMARY}
                    onClick={this.handleConfirmCustom}
                    className={Classes.POPOVER_DISMISS}
                  >
                    {__('Confirm')}
                  </Button>
                </CustomShip>
              }
            />
            {map(searchOptions, ({ name, value: type }) => (
              <Tab
                id={type}
                title={__(name)}
                panel={
                  <ShipList>
                    {_(ships)
                      .filter(
                        ship => type !== 'fleet' || ship.api_id in fleetMap,
                      )
                      .filter(
                        ship =>
                          !catMap[type] ||
                          (catMap[type] || []).includes(ship.api_stype),
                      )
                      .filter(
                        ship =>
                          !query || (filtered || []).includes(ship.api_id),
                      )
                      .sortBy([
                        ship => (filtered || []).indexOf(ship.api_id),
                        ship => type !== 'fleet' || fleetMap[ship.api_id] || 0,
                        ship => -ship.api_lv,
                        ship => -get(ship, ['api_exp', 0], 0),
                      ])
                      .map(ship => (
                        <ShipItem
                          key={ship.api_id}
                          onClick={this.handleSelect(ship.api_id)}
                          className={cls(
                            Classes.POPOVER_DISMISS,
                            Classes.MENU_ITEM,
                          )}
                        >
                          <ShipLv>Lv.{padEnd(ship.api_lv, 4)}</ShipLv>
                          <ShipName>
                            {window.i18n.resources.__(ship.api_name || '')}
                          </ShipName>
                          {ship.api_id in fleetMap && (
                            <Tag intent={Intent.PRIMARY}>
                              {fleetMap[ship.api_id]}
                            </Tag>
                          )}
                        </ShipItem>
                      ))
                      .value()}
                  </ShipList>
                }
              />
            ))}
          </Tabs>
        </Wrapper>
      )
    }
  },
)

// separate menu from popover component to prevent unnecessary updates
const ShipDropdown = ({ text, ...props }) => (
  <Popover position={Position.BOTTOM} minimal>
    <Button>
      <FA name="list" /> {text}
    </Button>
    <Menu {...props} />
  </Popover>
)

ShipDropdown.propTypes = {
  text: PropTypes.node.isRequired,
}

export default ShipDropdown