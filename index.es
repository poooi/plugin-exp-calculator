import React, { Component } from 'react'
import { join } from 'path-extra'
import { connect } from 'react-redux'
import _, { get, last, range, find, each } from 'lodash'
import { createSelector } from 'reselect'
import memoize from 'fast-memoize'

import { FormControl, FormGroup, ControlLabel, Grid, Col, Table, InputGroup } from 'react-bootstrap'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  fleetShipsIdSelectorFactory,
  shipDataSelectorFactory,
  constSelector,
  shipsSelector,
  stateSelector,
} from 'views/utils/selectors'

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

const remodelLvSelector = createSelector([
  constSelector,
], ({ $ships = {} }) => _($ships)
  .filter(ship => typeof ship.api_aftershipid !== 'undefined') // filter enemies
  .map((ship) => {
    let remodelLvs = [ship.api_afterlv]
    let nextShipId = +ship.api_aftershipid
    while (nextShipId !== 0 && last(remodelLvs) < $ships[nextShipId].api_afterlv) {
      remodelLvs = [...remodelLvs, $ships[nextShipId].api_afterlv]
      nextShipId = +(get($ships, [nextShipId, 'api_aftershipid'], 0))
    }
    remodelLvs = last(remodelLvs) < 100
      ? [...remodelLvs, 99, MAX_LEVEL]
      : [...remodelLvs, MAX_LEVEL]
    return [ship.api_id, remodelLvs]
  })
  .fromPairs()
  .value())

const expInfoSelectorFactory = memoize(shipId =>
  createSelector(
    [shipDataSelectorFactory(shipId)],
    ([ship, $ship] = []) =>
      typeof ship !== 'undefined' && typeof $ship !== 'undefined' ?
        {
          ...$ship,
          ...ship,
        }
        : undefined
  ))

const shipExpDataSelector = createSelector(
  [
    stateSelector,
    shipsSelector,
  ], (state, ships) => _(ships)
    .mapValues(ship => expInfoSelectorFactory(ship.api_id)(state))
    .value()
)

const mapDataSelctor = createSelector(
  [
    constSelector,
  ], ({ $maps = {} } = {}) => $maps
)

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
  state => ({
    horizontal: configLayoutSelector(state),
    doubleTabbed: configDoubleTabbedSelector(state),
    ships: shipExpDataSelector(state),
    fleets: [...Array(4).keys()].map(fleetId => fleetShipsIdSelectorFactory(fleetId)(state)),
    remodelLvs: remodelLvSelector(state),
    maps: mapDataSelctor(state),
  }),
)(class ExpCalc extends Component {
  state = {
    id: 0,
    mapId: 11,
    result: 0, // 'S'
    startLevel: 0,
    endLevel: MAX_LEVEL,
    lockGoal: false,
  }

  componentDidMount = () => {
    window.addEventListener('game.response', handleResponse)
  }

  componentWillUnmount = () => {
    window.removeEventListener('game.response', handleResponse)
  }

  handleShipChange = (e) => {
    const id = e.target.value
    const level = get(this.props.ships, [id, 'api_lv'], 0)
    const shipId = get(this.props.ships, [id, 'api_ship_id'], 0)
    const endLevel = find(this.props.remodelLvs[shipId], lv => lv > level) || MAX_LEVEL
    this.setState({
      id,
      startLevel: level,
      endLevel,
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
      id, startLevel, endLevel, mapId, result,
    } = this.state
    const {
      horizontal, doubleTabbed, ships, maps,
    } = this.props

    const nextExp = get(ships, [id, 'api_exp', 1], 0)
    const totalExp = exp[endLevel] - get(ships, [id, 'api_exp', 0], 0)

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
        <Grid>
          <Col xs={shipRowSize}>
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
                    .map(ship => (
                      <option value={ship.api_id} key={ship.api_id}>
                        Lv.{ship.api_lv} - {window.i18n.resources.__(ship.api_name || '')}
                      </option>
                    ))
                    .value()
                  }
                </FormControl>
              </InputGroup>
            </FormGroup>
          </Col>
          <Col xs={mapRowSize}>
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
          </Col>
          <Col xs={rankRowSize}>
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

          </Col>
          <Col xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('Starting level')}</ControlLabel>
              <FormControl
                type="number"
                value={startLevel || get(ships, [id, 'api_level'], 1)}
                onChange={this.handleStartLevelChange}
              />
            </FormGroup>
          </Col>
          <Col xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('To next')}</ControlLabel>
              <FormControl
                type="number"
                value={nextExp}
                onChange={this.handleNextExpChange}
              />
            </FormGroup>
          </Col>
          <Col xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('Goal')}</ControlLabel>
              <FormControl
                type="number"
                value={endLevel}
                onChange={this.handleEndLevelChange}
              />
            </FormGroup>
          </Col>
          <Col xs={rowSize}>
            <FormGroup>
              <ControlLabel>{__('Total exp')}</ControlLabel>
              <FormControl
                type="number"
                value={totalExp}
                readOnly
              />

            </FormGroup>
          </Col>
        </Grid>
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

/* eslint-disable import/prefer-default-export */
export const reactClass = ExpCalc
