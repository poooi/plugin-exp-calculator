import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { get, range, find, filter } from 'lodash'
import FA from 'react-fontawesome'
import InplaceEdit from 'react-edit-inplace'
import { Button, HTMLTable, Intent } from '@blueprintjs/core'
import styled from 'styled-components'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  extensionSelectorFactory,
} from 'views/utils/selectors'

import {
  remodelLvSelector,
  expInfoSelectorFactory,
  mapDataSelctor,
} from '../selectors'

import ShipSelect from './select/ship'
import LevelSelect from './select/level'
import MapSelect from './select/map'

import {
  exp,
  expMap,
  MAX_LEVEL,
  expClass,
  expPercent,
  expLevel,
} from '../constants'

const { i18n } = window
const __ = i18n['poi-plugin-exp-calc'].__.bind(i18n['poi-plugin-exp-calc'])

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
              <ShipSelect
                onSelect={this.handleShipSelect}
                text={
                  id > 0
                    ? window.i18n.resources.__(ship.api_name || '')
                    : __('Custom')
                }
              />
              <MapSelect
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
                <LevelSelect
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

export default ExpCalc
