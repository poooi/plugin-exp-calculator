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

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const MAX_LEVEL = 165

const exp = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
  5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000,
  21000, 23100, 25300, 27600, 30000, 32500, 35100, 37800, 40600, 43500,
  46500, 49600, 52800, 56100, 59500, 63000, 66600, 70300, 74100, 78000,
  82000, 86100, 90300, 94600, 99000, 103500, 108100, 112800, 117600, 122500,
  127500, 132700, 138100, 143700, 149500, 155500, 161700, 168100, 174700, 181500,
  188500, 195800, 203400, 211300, 219500, 228000, 236800, 245900, 255300, 265000,
  275000, 285400, 296200, 307400, 319000, 331000, 343400, 356200, 369400, 383000,
  397000, 411500, 426500, 442000, 458000, 474500, 491500, 509000, 527000, 545500,
  564500, 584500, 606500, 631500, 661500, 701500, 761500, 851500, 1000000, 1000000,
  1010000, 1011000, 1013000, 1016000, 1020000, 1025000, 1031000, 1038000, 1046000, 1055000,
  1065000, 1077000, 1091000, 1107000, 1125000, 1145000, 1168000, 1194000, 1223000, 1255000,
  1290000, 1329000, 1372000, 1419000, 1470000, 1525000, 1584000, 1647000, 1714000, 1785000,
  1860000, 1940000, 2025000, 2115000, 2210000, 2310000, 2415000, 2525000, 2640000, 2760000,
  2887000, 3021000, 3162000, 3310000, 3465000, 3628000, 3799000, 3978000, 4165000, 4360000,
  4564000, 4777000, 4999000, 5230000, 5470000, 5720000, 5780000, 5860000, 5970000, 6120000,
  6320000, 6580000, 6910000, 7320000, 7820000,
]

exp.unshift(exp[0])
exp.push(exp[exp.length - 1])

const expMap = {
  11: 30,
  12: 50,
  13: 80,
  14: 100,
  15: 150,
  16: 50,
  21: 120,
  22: 150,
  23: 200,
  24: 300,
  25: 250,
  31: 310,
  32: 320,
  33: 330,
  34: 350,
  35: 400,
  41: 310,
  42: 320,
  43: 330,
  44: 340,
  45: 200,
  51: 360,
  52: 380,
  53: 400,
  54: 420,
  55: 450,
  61: 380,
  62: 420,
}

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
                      value={expPercent[idx]}
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
                  <td>{counts[idx]}</td>
                  <td>{perBattle[idx]}</td>
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
