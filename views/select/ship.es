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
import { withTranslation } from 'react-i18next'
import { compose } from 'redux'

import { shipCat, exp } from '../../constants'
import { shipExpDataSelector, shipFleetMapSelector } from '../../selectors'

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
  padding: 0.5em 1em;
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

const Menu = compose(
  withTranslation('poi-plugin-exp-calc'),
  connect(state => ({
    ships: shipExpDataSelector(state),
    fleetMap: shipFleetMapSelector(state),
  })),
)(
  class Menu extends Component {
    static propTypes = {
      ships: PropTypes.objectOf(PropTypes.object).isRequired,
      fleetMap: PropTypes.objectOf(PropTypes.number).isRequired,
      onSelect: PropTypes.func.isRequired,
      t: PropTypes.func.isRequired,
    }

    constructor(props) {
      super(props)

      const options = {
        keys: ['api_name', 'api_yomi', 'romaji'],
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
      const { ships, fleetMap, t } = this.props

      const filtered = _(this.fuse.search(query)).map(ship => ship.item.api_id)
      return (
        <Wrapper>
          <InputGroup
            value={query}
            placeholder={t('Search')}
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
              title={t('Custom')}
              panel={
                <CustomShip>
                  <FormGroup label={t('Starting Level')}>
                    <NumericInput
                      value={startLevel}
                      onValueChange={this.handleStartLevelChange}
                    />
                  </FormGroup>
                  <FormGroup label={t('To next')}>
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
                    {t('Confirm')}
                  </Button>
                </CustomShip>
              }
            />
            {map(searchOptions, ({ name, value: type }) => (
              <Tab
                key={type}
                id={type}
                title={t(name)}
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
                            {t(ship.api_name || '', { ns: 'resources' })}
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
    <Button minimal intent={Intent.PRIMARY}>
      <FA name="list" /> {text}
    </Button>
    <Menu {...props} />
  </Popover>
)

ShipDropdown.propTypes = {
  text: PropTypes.node.isRequired,
}

export default ShipDropdown
