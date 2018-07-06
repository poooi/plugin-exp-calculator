import _, { get, last } from 'lodash'
import { createSelector } from 'reselect'
import memoize from 'fast-memoize'
import { toRomaji } from 'wanakana'

import {
  shipDataSelectorFactory,
  constSelector,
  shipsSelector,
  stateSelector,
} from 'views/utils/selectors'

import { exp } from './constants'

const MAX_LEVEL = Object.keys(exp).length

export const remodelLvSelector = createSelector(
  [constSelector],
  ({ $ships = {} }) =>
    _($ships)
      .filter(ship => typeof ship.api_aftershipid !== 'undefined') // filter enemies
      .map(ship => {
        let remodelLvs = [ship.api_afterlv]
        let nextShipId = +ship.api_aftershipid
        while (
          nextShipId !== 0 &&
          last(remodelLvs) < $ships[nextShipId].api_afterlv
        ) {
          remodelLvs = [...remodelLvs, $ships[nextShipId].api_afterlv]
          nextShipId = +get($ships, [nextShipId, 'api_aftershipid'], 0)
        }
        remodelLvs =
          last(remodelLvs) < 100
            ? [...remodelLvs, 99, MAX_LEVEL]
            : [...remodelLvs, MAX_LEVEL]
        return [ship.api_id, remodelLvs]
      })
      .fromPairs()
      .value(),
)

// const toRomaji = kana => wanakana.toRomaji(kana)

export const expInfoSelectorFactory = memoize(shipId =>
  createSelector(
    [shipDataSelectorFactory(shipId)],
    ([ship, $ship] = []) =>
      typeof ship !== 'undefined' && typeof $ship !== 'undefined'
        ? {
            ...$ship,
            ...ship,
            romaji: toRomaji($ship.api_yomi),
          }
        : undefined,
  ),
)

export const shipExpDataSelector = createSelector(
  [stateSelector, shipsSelector],
  (state, ships) =>
    _(ships)
      .mapValues(ship => expInfoSelectorFactory(ship.api_id)(state))
      .value(),
)

export const mapDataSelctor = createSelector(
  [constSelector],
  ({ $maps = {} } = {}) => $maps,
)

const fleetsSelector = state => state.info.fleets

export const shipFleetMapSelector = createSelector([fleetsSelector], fleets =>
  _(fleets)
    .filter(Boolean)
    .flatMap(fleet =>
      _(fleet.api_ship)
        .filter(id => id > 0)
        .map(id => [id, fleet.api_id])
        .value(),
    )
    .fromPairs()
    .value(),
)
