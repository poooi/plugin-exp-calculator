import { get, range, each } from 'lodash'
import { fleetShipsIdSelectorFactory } from 'views/utils/selectors'
import i18next from 'views/env-parts/i18next'

import { shipExpDataSelector } from './selectors'
import ExpCalc from './views'
import {
  exp,
  bonusExpScaleFlagship,
  bonusExpScaleNonFlagship,
} from './constants'

const t = i18next.getFixedT(null, 'poi-plugin-exp-calc')

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

    let message = `${t('Exp')}: [A/B] ${Math.floor(baseExp)}, [S] ${Math.floor(
      baseExp * 1.2,
    )}`
    if (bonusFlag) {
      message = `${message}, ${t('+ {{bonus}} for each fleet', {
        bonus: bonusStr.join(' '),
      })}`
    }
    window.success(message, {
      priority: 2,
      stickyFor: 1000,
    })
  }
}

export const reactClass = ExpCalc

export const pluginDidLoad = () =>
  window.addEventListener('game.response', handleResponse)

export const pluginWillUnload = () =>
  window.removeEventListener('game.response', handleResponse)

export reducer from './reducer'
