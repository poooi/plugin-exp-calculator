import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { get, range, find, each, filter } from 'lodash'
import FA from 'react-fontawesome'
import InplaceEdit from 'react-edit-inplace'
import { Button, HTMLTable, Intent } from '@blueprintjs/core'
import styled from 'styled-components'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  fleetShipsIdSelectorFactory,
  extensionSelectorFactory,
} from 'views/utils/selectors'

import {
  remodelLvSelector,
  expInfoSelectorFactory,
  shipExpDataSelector,
  mapDataSelctor,
} from './selectors'

import ShipDropdown from './ship-dropdown'
import LevelDropdown from './level-dropdown'
import MapDropdown from './map-dropdown'

import { exp, expMap } from './constants'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

const MAX_LEVEL = Object.keys(exp).length

// battle result
const expLevel = ['S', 'A', 'B', 'C', 'D']

// exp effect for battle results
const expPercent = [1.2, 1.0, 1.0, 0.8, 0.7]

// bonus for training crusier as flagship
const bonusExpScaleFlagship = [[5, 8, 11, 15, 20], [10, 13, 16, 20, 25]]

// bonus for training crusier as flagship
const bonusExpScaleNonFlagship = [[3, 5, 7, 10, 15], [4, 6, 8, 12, 17.5]]

const getBonusType = lv => {
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

const expClass = ['Basic', 'Flagship', 'MVP', 'MVP and flagship']

const handleResponse = e => {
  const { path, body } = e.detail
  if (path === '/kcsapi/api_req_member/get_practice_enemyinfo') {
    const enemyShips = body.api_deck.api_ships
    let baseExp =
      exp[enemyShips[0].api_level] / 100 +
      exp[get(enemyShips, [1, 'api_level'], 1)] / 300
    baseExp =
      baseExp <= 500 ? baseExp : 500 + Math.floor(Math.sqrt(baseExp - 500))
    const bonusStr = []
    let bonusFlag = false
    const state = window.getStore()
    const fleets = range(4).map(fleetId =>
      fleetShipsIdSelectorFactory(fleetId)(state),
    )
    const ships = shipExpDataSelector(state)

    each(fleets, fleet => {
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

    let message = `${__('Exp')}: [A/B] ${Math.floor(baseExp)}, [S] ${Math.floor(
      baseExp * 1.2,
    )}`
    if (bonusFlag) {
      message = `${message}, ${__('+ %s for each fleet', bonusStr.join(' '))}`
    }
    window.success(message, {
      priority: 2,
      stickyFor: 1000,
    })
  }
}

const PluginContainer = styled.div`
  padding: 1ex 1em;
`

const LevelSection = styled.div`
  font-size: 200%;
  display: flex;
  align-items: center;

  div:nth-child(2) {
    flex: 1;
    text-align: center;
  }

  div:last-child {
    text-align: right;
  }
`

const ExpProgress = styled.div.attrs(props => ({
  background: `linear-gradient(90deg, ${props.theme.BLUE5} ${
    props.percentage
  }%, rgba(0, 0, 0, 0) 0%)`,
}))`
  display: flex;
  margin: 1ex 1em;
  padding: 0 4px;
  border: 1px solid ${props => props.theme.BLUE5};
  transform: skewX(-15deg);
  background: ${props => props.background};

  span {
    flex: 1;
  }

  span:last-child {
    text-align: right;
  }
`

const RankSelection = styled.div`
  display: flex;
  justify-content: center;
`

const RankSelectionItem = styled.div`
  font-size: 150%;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  transition: 0.3s;
  font-weight: ${props => props.checked && 500};
  background: ${props => props.checked && props.theme.BLUE5};
`

const ResultTable = ({ perBattle, counts }) => (
  <HTMLTable>
    <thead>
      <tr>
        <th />
        <th>{__('Per attack')}</th>
        <th>{__('Remainder')}</th>
      </tr>
    </thead>
    <tbody>
      {range(expClass.length).map(idx => (
        <tr key={idx}>
          <td>{__(expClass[idx])}</td>
          <td>{perBattle[idx]}</td>
          <td>{counts[idx]}</td>
        </tr>
      ))}
    </tbody>
  </HTMLTable>
)

ResultTable.propTypes = {
  perBattle: PropTypes.arrayOf(PropTypes.number).isRequired,
  counts: PropTypes.arrayOf(PropTypes.number).isRequired,
}

const ExpCalc = connect(state => {
  const id = get(extensionSelectorFactory('poi-plugin-exp-calc')(state), 'id')
  return {
    id,
    horizontal: configLayoutSelector(state),
    doubleTabbed: configDoubleTabbedSelector(state),
    ship: expInfoSelectorFactory(id)(state),
    remodelLvs: remodelLvSelector(state),
    maps: mapDataSelctor(state),
  }
})(
  class ExpCalc extends Component {
    static propTypes = {
      id: PropTypes.number.isRequired,
      ship: PropTypes.object,
      remodelLvs: PropTypes.objectOf(PropTypes.array),
      maps: PropTypes.objectOf(PropTypes.object),
      dispatch: PropTypes.func,
    }

    state = {
      mapId: 11,
      result: 0, // 'S'
      startLevel: 1,
      nextExp: exp[2] - exp[1],
      endLevel: MAX_LEVEL,
      lockGoal: false,
      mapExp: 100,
      id: 0,
    }

    componentDidMount = () => {
      window.addEventListener('game.response', handleResponse)
    }

    static getDerivedStateFromProps = (nextProps, prevState) => {
      const { id, ship, remodelLvs } = nextProps
      if (prevState.id !== id) {
        const level = get(ship, ['api_lv'], 0)
        const shipId = get(ship, ['api_ship_id'], 0)
        const endLevel = prevState.lockGoal
          ? prevState.endLevel
          : find(remodelLvs[shipId], lv => lv > level) || MAX_LEVEL
        return {
          startLevel: level,
          endLevel,
          id,
        }
      }
      return { id }
    }

    componentWillUnmount = () => {
      window.removeEventListener('game.response', handleResponse)
    }

    handleShipSelect = (id, startLevel, nextExp) => {
      this.props.dispatch({
        type: '@@poi-plugin-exp-calc@select',
        id,
      })
      if (id === 0) {
        this.setState({
          startLevel,
          nextExp,
        })
      }
    }

    handleResultChange = result => () => {
      this.setState({
        result,
      })
    }

    handleMapSelect = (mapId, mapExp = 100) => {
      this.setState({
        mapId,
        mapExp,
      })
    }

    handleStartLevelChange = e => {
      this.setState({
        startLevel: e.target.value,
      })
    }

    handleEndLevelChange = ({ endLevel }) => {
      this.setState({
        endLevel: parseInt(endLevel, 10),
      })
    }

    handleEndLevelSelect = endLevel => {
      this.setState({
        endLevel,
      })
    }

    handleNextExpChange = e => {
      this.setState({
        nextExp: e.target.value,
      })
    }

    handleLockChange = () => {
      this.setState(prevState => ({
        lockGoal: !prevState.lockGoal,
      }))
    }

    render() {
      const { endLevel, mapId, result, lockGoal } = this.state
      const { maps, ship = {}, id, remodelLvs } = this.props

      const startLevel = id > 0 ? ship.api_lv : this.state.startLevel
      const nextExp = id > 0 ? get(ship, ['api_exp', 1], 0) : this.state.nextExp
      const totalExp =
        id > 0
          ? exp[endLevel] - get(ship, ['api_exp', 0], 0)
          : exp[endLevel] - exp[startLevel + 1] + nextExp

      const percentage = Math.round(
        ((exp[endLevel] - totalExp) / exp[endLevel]) * 100,
      )

      const mapExp = mapId > 0 ? expMap[mapId] || 100 : this.state.mapExp
      const mapPercent = expPercent[result]

      const baseExp = mapExp * mapPercent
      const baseCount = Math.max(totalExp / baseExp, 0)
      const counts = [
        baseCount,
        baseCount / 1.5,
        baseCount / 2.0,
        baseCount / 3.0,
      ].map(Math.ceil)
      const perBattle = [
        baseExp,
        baseExp * 1.5,
        baseExp * 2.0,
        baseExp * 3.0,
      ].map(Math.floor)

      const levels =
        id > 0
          ? filter(remodelLvs[ship.api_ship_id], lv => lv > ship.api_lv)
          : [99, MAX_LEVEL]

      const world = maps[mapId] || {}

      return (
        <PluginContainer>
          <div>
            <div>
              <ShipDropdown
                onSelect={this.handleShipSelect}
                text={
                  id > 0
                    ? window.i18n.resources.__(ship.api_name || '')
                    : __('Custom')
                }
              />
              <MapDropdown
                onSelect={this.handleMapSelect}
                text={
                  mapId > 0
                    ? `${world.api_maparea_id}-${world.api_no} ${
                        world.api_name
                      }`
                    : `${__('Custom')}: ${mapExp}`
                }
              />
            </div>
            <LevelSection>
              <div>Lv.{startLevel}</div>
              <div>
                <FA name="arrow-right" />
              </div>

              <div>
                Lv.
                <InplaceEdit
                  validate={text => +text > 0 && +text <= MAX_LEVEL}
                  text={String(endLevel)}
                  paramName="endLevel"
                  className="end-level"
                  activeClassName="end-level-active"
                  change={this.handleEndLevelChange}
                  stopPropagation
                />
                <LevelDropdown
                  onSelect={this.handleEndLevelSelect}
                  levels={levels}
                />
                <Button
                  intent={lockGoal ? Intent.PRIMARY : Intent.NONE}
                  onClick={this.handleLockChange}
                >
                  <FA name="lock" />
                </Button>
              </div>
            </LevelSection>
            <ExpProgress percentage={percentage}>
              <span>
                {__('Next')} {nextExp}
              </span>
              <span>
                {__('Remaining')} {totalExp}
              </span>
            </ExpProgress>
          </div>
          <div>
            <RankSelection>
              {range(expLevel.length).map(idx => (
                <RankSelectionItem
                  checked={result === idx}
                  role="button"
                  tabIndex="0"
                  value={idx}
                  key={idx}
                  onClick={this.handleResultChange(idx)}
                >
                  {expLevel[idx]}
                </RankSelectionItem>
              ))}
            </RankSelection>
          </div>
          <ResultTable perBattle={perBattle} counts={counts} />
        </PluginContainer>
      )
    }
  },
)

export const reactClass = ExpCalc

// reducer
// FIXME: we store selected ship id in store to reduce unnecessary updates
const initState = {
  id: 0,
}

export const reducer = (state = initState, action) => {
  const { type, id } = action
  if (type === '@@poi-plugin-exp-calc@select') {
    return {
      ...state,
      id,
    }
  }
  return state
}
