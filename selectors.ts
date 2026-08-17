import type { PoiState } from 'views/utils/selectors'

import memoize from 'fast-memoize'
import { last } from 'lodash'
import { createSelector } from 'reselect'
import {
  constSelector,
  extensionSelectorFactory,
  shipDataSelectorFactory,
  shipsSelector,
  stateSelector,
} from 'views/utils/selectors'
import { toRomaji } from 'wanakana'

import type { ShipExpData } from './poi-types'
import type { ExpCalcState } from './state'

import { MAX_LEVEL } from './constants'
import { PLUGIN_KEY, initialState } from './state'

const extSelector = extensionSelectorFactory<ExpCalcState | undefined>(
  PLUGIN_KEY,
)

/**
 * This plugin's own slice of poi's store, defaulted for the render that happens
 * before poi has mounted the reducer. Deliberately not a `createSelector`: it
 * returns its input untouched, so there is nothing to memoize.
 */
export const expCalcStateSelector = (state: PoiState): ExpCalcState =>
  extSelector(state) ?? initialState

export const selectedShipIdSelector = createSelector(
  [expCalcStateSelector],
  ({ id }) => id,
)

export const statsSelector = createSelector(
  [expCalcStateSelector],
  ({ stats }) => stats,
)

export const overrideSelector = createSelector(
  [expCalcStateSelector],
  ({ override }) => override,
)

export const enablePersonalStatSelector = (state: PoiState): boolean =>
  state.config?.plugin?.expCalc?.enablePersonalStat ?? true

/**
 * Every level at which a ship can remodel, keyed by master ship id, with 99 and
 * the level cap appended as the goals worth aiming at once remodels run out.
 */
export const remodelLvSelector = createSelector(
  [constSelector],
  ({ $ships = {} }): Record<number, number[]> =>
    Object.fromEntries(
      Object.values($ships)
        // enemies carry no remodel chain
        .filter((ship) => typeof ship.api_aftershipid !== 'undefined')
        .map((ship) => {
          const remodelLvs = [ship.api_afterlv ?? 0]
          let nextShip = $ships[Number(ship.api_aftershipid)]

          while (nextShip && last(remodelLvs)! < (nextShip.api_afterlv ?? 0)) {
            remodelLvs.push(nextShip.api_afterlv ?? 0)
            nextShip = $ships[Number(nextShip.api_aftershipid ?? 0)]
          }

          if (last(remodelLvs)! < 100) {
            remodelLvs.push(99)
          }
          remodelLvs.push(MAX_LEVEL)

          return [ship.api_id, remodelLvs]
        }),
    ),
)

export const expInfoSelectorFactory = memoize((shipId: number) =>
  createSelector(
    [shipDataSelectorFactory(shipId)],
    (shipData): ShipExpData | undefined => {
      const [ship, $ship] = shipData ?? []
      return ship && $ship
        ? {
            ...$ship,
            ...ship,
            romaji: toRomaji($ship.api_yomi ?? ''),
          }
        : undefined
    },
  ),
)

export const shipExpDataSelector = createSelector(
  [stateSelector, shipsSelector],
  (state, ships): Record<number, ShipExpData | undefined> =>
    Object.fromEntries(
      Object.values(ships).map((ship) => [
        ship.api_id,
        expInfoSelectorFactory(ship.api_id)(state),
      ]),
    ),
)

export const mapDataSelector = createSelector(
  [constSelector],
  ({ $maps = {} }) => $maps,
)

const fleetsSelector = (state: PoiState) => state.info.fleets

/** Maps a ship's api_id to the fleet it currently sits in. */
export const shipFleetMapSelector = createSelector(
  [fleetsSelector],
  (fleets): Record<number, number> =>
    Object.fromEntries(
      (fleets ?? [])
        .filter(Boolean)
        .flatMap((fleet) =>
          fleet.api_ship.filter((id) => id > 0).map((id) => [id, fleet.api_id]),
        ),
    ),
)
