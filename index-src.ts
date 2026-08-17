import type { PoiState } from 'views/utils/selectors'

import { range } from 'lodash'
import i18next from 'views/env-parts/i18next'
import { fleetShipsIdSelectorFactory } from 'views/utils/selectors'

import {
  TRAINING_CRUISER_STYPE,
  bonusExpScaleFlagship,
  bonusExpScaleNonFlagship,
  exp,
} from './constants'
import { shipExpDataSelector } from './selectors'
import { PLUGIN_KEY } from './state'
import ExpCalc from './views'

const t = i18next.getFixedT(null, PLUGIN_KEY)

interface PracticeEnemyInfoBody {
  api_deck: {
    api_ships: Array<{ api_level: number }>
  }
}

interface GameResponseEvent extends CustomEvent {
  detail: {
    path: string
    body: unknown
  }
}

/**
 * Training cruiser bonuses are banded by the cruiser's level; the index picks
 * the band's column out of the bonus scale tables.
 */
const getBonusType = (lv: number): number => {
  if (lv < 10) {
    return 0
  }
  if (lv < 30) {
    return 1
  }
  if (lv < 60) {
    return 2
  }
  if (lv < 100) {
    return 3
  }
  return 4
}

/**
 * Exp handed out by a PvP match, derived from the two lead enemy ships' levels
 * and then compressed above 500.
 */
const getPracticeBaseExp = (
  enemyShips: Array<{ api_level: number }>,
): number => {
  const baseExp =
    (exp[enemyShips[0]?.api_level ?? 1] ?? 0) / 100 +
    (exp[enemyShips[1]?.api_level ?? 1] ?? 0) / 300

  return baseExp <= 500 ? baseExp : 500 + Math.floor(Math.sqrt(baseExp - 500))
}

/**
 * Percentage bonus each of the player's fleets would earn from the training
 * cruisers it carries, as a display string per fleet.
 */
const getFleetBonuses = (state: PoiState): string[] => {
  const ships = shipExpDataSelector(state)

  return range(4).map((fleetId) => {
    const fleet = fleetShipsIdSelectorFactory(fleetId)(state)
    if (!fleet) {
      return '0%'
    }

    let flagshipFlag = false
    let trainingLv = 0
    let trainingCount = 0

    fleet.forEach((id, idx) => {
      const ship = ships[id]
      if (ship?.api_stype !== TRAINING_CRUISER_STYPE) {
        return
      }
      trainingCount += 1
      if (!flagshipFlag && ship.api_lv > trainingLv) {
        trainingLv = ship.api_lv
      }
      if (idx === 0) {
        flagshipFlag = true
      }
    })

    if (trainingCount === 0) {
      return '0%'
    }

    // only the first two training cruisers count
    const scales = flagshipFlag
      ? bonusExpScaleFlagship
      : bonusExpScaleNonFlagship
    const bonusScale =
      scales[Math.min(trainingCount, 2) - 1][getBonusType(trainingLv)]

    return `${bonusScale}%`
  })
}

const handleResponse = (e: Event) => {
  const { path, body } = (e as GameResponseEvent).detail

  if (path !== '/kcsapi/api_req_member/get_practice_enemyinfo') {
    return
  }

  const enemyShips = (body as PracticeEnemyInfoBody).api_deck.api_ships
  const baseExp = getPracticeBaseExp(enemyShips)

  const bonuses = getFleetBonuses(window.getStore<PoiState>())

  let message = `${t('Exp')}: [A/B] ${Math.floor(baseExp)}, [S] ${Math.floor(
    baseExp * 1.2,
  )}`

  if (bonuses.some((bonus) => bonus !== '0%')) {
    message = `${message}, ${t('+ {{bonus}} for each fleet', {
      bonus: bonuses.join(' '),
    })}`
  }

  window.success(message, {
    priority: 2,
    stickyFor: 1000,
  })
}

export const reactClass = ExpCalc

export const pluginDidLoad = (): void =>
  window.addEventListener('game.response', handleResponse)

export const pluginWillUnload = (): void =>
  window.removeEventListener('game.response', handleResponse)

export { default as reducer } from './reducer'
