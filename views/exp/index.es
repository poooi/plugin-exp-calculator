import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { get, find, filter } from 'lodash'
import FA from 'react-fontawesome'
import InplaceEdit from 'react-edit-inplace'
import { Button, Intent } from '@blueprintjs/core'
import styled from 'styled-components'
import { withTranslation } from 'react-i18next'
import { compose } from 'redux'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  extensionSelectorFactory,
} from 'views/utils/selectors'

import { remodelLvSelector, expInfoSelectorFactory } from '../../selectors'

import ShipSelect from '../select/ship'
import LevelSelect from '../select/level'
import Result from './result'

import { exp, MAX_LEVEL } from '../../constants'

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

const ExpCalc = compose(
  withTranslation('poi-plugin-exp-calc'),
  connect(state => {
    const id = get(extensionSelectorFactory('poi-plugin-exp-calc')(state), 'id')
    return {
      id,
      horizontal: configLayoutSelector(state),
      doubleTabbed: configDoubleTabbedSelector(state),
      ship: expInfoSelectorFactory(id)(state),
      remodelLvs: remodelLvSelector(state),
    }
  }),
)(
  class ExpCalc extends Component {
    static propTypes = {
      id: PropTypes.number.isRequired,
      ship: PropTypes.object,
      remodelLvs: PropTypes.objectOf(PropTypes.array),
      dispatch: PropTypes.func,
      t: PropTypes.func,
    }

    state = {
      startLevel: 1,
      nextExp: exp[2] - exp[1],
      endLevel: MAX_LEVEL,
      lockGoal: false,
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

    handleRankChange = rank => () => {
      this.setState({
        rank,
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
      const { endLevel, lockGoal } = this.state
      const { ship = {}, id, remodelLvs, t } = this.props

      const startLevel = id > 0 ? ship.api_lv : this.state.startLevel
      const nextExp = id > 0 ? get(ship, ['api_exp', 1], 0) : this.state.nextExp
      const totalExp =
        id > 0
          ? exp[endLevel] - get(ship, ['api_exp', 0], 0)
          : exp[endLevel] - exp[startLevel + 1] + nextExp

      const percentage = Math.round(
        ((exp[endLevel] - totalExp) / exp[endLevel]) * 100,
      )

      const levels =
        id > 0
          ? filter(remodelLvs[ship.api_ship_id], lv => lv > ship.api_lv)
          : [99, MAX_LEVEL]

      return (
        <div>
          <div>
            <div>
              <ShipSelect
                onSelect={this.handleShipSelect}
                text={
                  id > 0
                    ? t(ship.api_name || 'Unknown', { ns: 'resources' })
                    : t('Custom')
                }
              />
            </div>
            <LevelSection>
              <div>Lv.{startLevel || 1}</div>
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
                  intent={lockGoal ? Intent.SUCCESS : Intent.PRIMARY}
                  onClick={this.handleLockChange}
                  minimal
                >
                  <FA name={lockGoal ? 'lock' : 'unlock'} />
                </Button>
              </div>
            </LevelSection>
            <ExpProgress percentage={percentage}>
              <span>
                {t('Next')} {nextExp}
              </span>
              <span>
                {t('Remaining')} {totalExp}
              </span>
            </ExpProgress>
          </div>
          <div>
            <Result totalExp={totalExp} />
          </div>
        </div>
      )
    }
  },
)

export default ExpCalc
