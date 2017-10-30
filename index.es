import React, { Component } from 'react'
import { join } from 'path-extra'
import { connect } from 'react-redux'
import _, { get, range, find, each } from 'lodash'

import { FormControl, FormGroup, ControlLabel, Table, InputGroup } from 'react-bootstrap'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  fleetShipsIdSelectorFactory,
  extensionSelectorFactory,
} from 'views/utils/selectors'

import { remodelLvSelector, expInfoSelectorFactory, shipExpDataSelector, mapDataSelctor } from './selectors'

import ShipDropdown from './ship-dropdown'

import { exp, expMap } from './constants'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const MAX_LEVEL = Object.keys(exp).length

// battle result
const expLevel = [
  'S', 'A', 'B', 'C', 'D',
]

// exp effect for battle results
const expPercent = [
  1.2, 1.0, 1.0, 0.8, 0.7,
]

// bonus for training crusier as flagship
const bonusExpScaleFlagship = [
  [5, 8, 11, 15, 20],
  [10, 13, 16, 20, 25],
]

// bonus for training crusier as flagship
const bonusExpScaleNonFlagship = [
  [3, 5, 7, 10, 15],
  [4, 6, 8, 12, 17.5],
]

const getBonusType = (lv) => {
  if (lv < 10) {
    return 0
  }
  if (lv >= 10 && lv < 30) {
    return 1
  }
  if (lv >= 30 && lv < 60) {
    return 2
  }
  if (lv >= 60 && lv < 100) {
    return 3
  }
  return 4
}

const nullShip = { api_id: 0, api_name: __('NULL') }

const expClass = [
  'Basic',
  'Flagship',
  'MVP',
  'MVP and flagship',
]

const handleResponse = (e) => {
  const { path, body } = e.detail
  if (path === '/kcsapi/api_req_member/get_practice_enemyinfo') {
    const enemyShips = body.api_deck.api_ships
    let baseExp = (exp[enemyShips[0].api_level] / 100) + (exp[get(enemyShips, [1, 'api_level'], 0)] / 300)
    baseExp = baseExp <= 500 ? baseExp : 500 + Math.floor(Math.sqrt(baseExp - 500))
    const bonusStr = []
    let bonusFlag = false
    const state = window.getStore()
    const fleets = range(4).map(fleetId => fleetShipsIdSelectorFactory(fleetId)(state))
    const ships = shipExpDataSelector(state)


    each(fleets, (fleet) => {
      if (!fleet) {
        return
      }
      let flagshipFlag = false
      let trainingLv = 0
      let trainingCount = 0
      each(fleet, (id, idx) => {
        const ship = ships[id]
        if (ship.api_stype === 21) {
          trainingCount += 1
          if (!flagshipFlag) {
            if (ship.api_lv > trainingLv) {
              trainingLv = ship.api_lv
            }
          }
          if (idx === 0) {
            flagshipFlag = true
          }
        }
      })
      if (trainingCount >= 2) {
        trainingCount = 2
      }
      if (trainingCount !== 0) {
        bonusFlag = true
        const bonusType = getBonusType(trainingLv)
        const bonusScale = flagshipFlag
          ? bonusExpScaleFlagship[trainingCount - 1][bonusType]
          : bonusExpScaleNonFlagship[trainingCount - 1][bonusType]
        bonusStr.push(`${bonusScale}%`)
      } else {
        bonusStr.push('0%')
      }
    })

    let message = `${__('Exp')}: [A/B] ${Math.floor(baseExp)}, [S] ${Math.floor(baseExp * 1.2)}`
    if (bonusFlag) {
      message = `${message}, ${__('+ %s for each fleet', bonusStr.join(' '))}`
    }
    window.success(message, {
      priority: 2,
      stickyFor: 1000,
    })
  }
}

const ExpCalc = connect(
  (state) => {
    const id = get(extensionSelectorFactory('poi-plugin-exp-calc')(state), 'id')
    return ({
      id,
      horizontal: configLayoutSelector(state),
      doubleTabbed: configDoubleTabbedSelector(state),
      ship: expInfoSelectorFactory(id)(state),
      ships: shipExpDataSelector(state),
      fleets: [...Array(4).keys()].map(fleetId => fleetShipsIdSelectorFactory(fleetId)(state)),
      remodelLvs: remodelLvSelector(state),
      maps: mapDataSelctor(state),
    })
  },
)(class ExpCalc extends Component {
  state = {
    mapId: 11,
    result: 0, // 'S'
    startLevel: 0,
    endLevel: MAX_LEVEL,
    lockGoal: false,
  }

  componentDidMount = () => {
    window.addEventListener('game.response', handleResponse)
  }

  componentWillReceiveProps = (nextProps) => {
    const { id, ship, remodelLvs } = nextProps
    if (this.props.id !== id) {
      const level = get(ship, ['api_lv'], 0)
      const shipId = get(ship, ['api_ship_id'], 0)
      const endLevel = find(remodelLvs[shipId], lv => lv > level) || MAX_LEVEL
      this.setState({
        startLevel: level,
        endLevel,
      })
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener('game.response', handleResponse)
  }

  handleShipChange = (e) => {
    const id = e.target.value
    this.props.dispatch({
      type: '@@poi-plugin-exp-calc@select',
      id,
    })
  }

  handleResultChange = (e) => {
    this.setState({
      result: e.target.value,
    })
  }

  handleMapChange = (e) => {
    this.setState({
      mapId: e.target.value,
    })
  }

  handleStartLevelChange = (e) => {
    this.setState({
      startLevel: e.target.value,
    })
  }

  handleEndLevelChange = (e) => {
    this.setState({
      endLevel: e.target.value,
    })
  }

  handleNextExpChange = (e) => {
    this.setState({
      nextExp: e.target.value,
    })
  }

  render() {
    const {
      startLevel, endLevel, mapId, result,
    } = this.state
    const {
      horizontal, doubleTabbed, ships, maps, ship, id,
    } = this.props

    const nextExp = get(ship, ['api_exp', 1], 0)
    const totalExp = exp[endLevel] - get(ship, ['api_exp', 0], 0)

    const mapExp = expMap[mapId] || 100
    const mapPercent = expPercent[result]

    const baseExp = mapExp * mapPercent
    const baseCount = totalExp / baseExp
    const counts = [
      Math.ceil(baseCount),
      Math.ceil(baseCount / 1.5),
      Math.ceil(baseCount / 2.0),
      Math.ceil(baseCount / 3.0),
    ]
    const perBattle = [
      baseExp,
      baseExp * 1.5,
      baseExp * 2.0,
      baseExp * 3.0,
    ]

    const rowSize = (horizontal === 'horizontal' || doubleTabbed) ? 6 : 3
    const shipRowSize = (horizontal === 'horizontal' || doubleTabbed) ? 12 : 5
    const mapRowSize = (horizontal === 'horizontal' || doubleTabbed) ? 7 : 4
    const rankRowSize = (horizontal === 'horizontal' || doubleTabbed) ? 5 : 3
    return (
      <div id="exp-calc" className="exp-calc">
        <link rel="stylesheet" href={join(__dirname, 'assets', 'exp-calc.css')} />
        <div>
          <div xs={shipRowSize}>
            <FormGroup>
              <ControlLabel>{__('Ship')}</ControlLabel>
              <InputGroup>
                <FormControl
                  componentClass="select"
                  value={id}
                  onChange={this.handleShipChange}
                >
                  <option value={nullShip.api_id}>{nullShip.api_name}</option>
                  {
                    _(ships)
                    .map(_ship => (
                      <option value={_ship.api_id} key={_ship.api_id}>
                        Lv.{_ship.api_lv} - {window.i18n.resources.__(_ship.api_name || '')}
                      </option>
                    ))
                    .value()
                  }
                </FormControl>
              </InputGroup>
            </FormGroup>
            <ShipDropdown />
          </div>
          <div xs={mapRowSize}>
            <FormGroup>
              <ControlLabel>{__('Map')}</ControlLabel>
              <FormControl
                componentClass="select"
                value={mapId}
                onChange={this.handleMapChange}
              >
                {
                  _(maps)
                  .filter(world => world.api_id < 63)
                  .map(world => (
                    <option
                      value={world.api_id}
                      key={world.api_id}
                    >
                      {`${world.api_maparea_id}-${world.api_no} ${world.api_no > 4 ? '[EO] ' : ''}${world.api_name}`}
                    </option>
                  ))
                  .value()
                }
              </FormControl>
            </FormGroup>
          </div>
          <div xs={rankRowSize}>
            <FormGroup>
              <ControlLabel>
                {__('Result')}
              </ControlLabel>
              <FormControl
                componentClass="select"
                value={result}
                onChange={this.handleResultChange}
              >
                {
                  range(expLevel.length).map(idx => (
                    <option
                      value={idx}
                      key={idx}
                    >
                      {expLevel[idx]}
                    </option>
                  ))
                }
              </FormControl>
            </FormGroup>

          </div>
          <div xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('Starting level')}</ControlLabel>
              <FormControl
                type="number"
                value={startLevel || get(ship, ['api_lv'], 1)}
                onChange={this.handleStartLevelChange}
              />
            </FormGroup>
          </div>
          <div xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('To next')}</ControlLabel>
              <FormControl
                type="number"
                value={nextExp}
                onChange={this.handleNextExpChange}
              />
            </FormGroup>
          </div>
          <div xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('Goal')}</ControlLabel>
              <FormControl
                type="number"
                value={endLevel}
                onChange={this.handleEndLevelChange}
              />
            </FormGroup>
          </div>
          <div xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('Total exp')}</ControlLabel>
              <FormControl
                type="number"
                value={totalExp}
                readOnly
              />

            </FormGroup>
          </div>
        </div>
        <Table>
          <tbody>
            <tr key={0}>
              <td />
              <td>{__('Per attack')}</td>
              <td>{__('Remainder')}</td>
            </tr>
            {
              range(expClass.length).map(idx => (
                <tr key={idx}>
                  <td>{__(expClass[idx])}</td>
                  <td>{perBattle[idx]}</td>
                  <td>{counts[idx]}</td>
                </tr>
                ))
            }
          </tbody>
        </Table>
      </div>
    )
  }
})

export const reactClass = ExpCalc

// reducer part
const initState = {
  id: 0,
  active: '',
}

export const reducer = (state = initState, action) => {
  const { type, id, active } = action
  if (type === '@@poi-plugin-exp-calc@select') {
    return {
      ...state,
      id,
    }
  }
  if (type === '@@poi-plugin-exp-calc@active-dropdown') {
    return {
      ...state,
      active,
    }
  }
  return state
}
