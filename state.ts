import path from 'path'

export const PLUGIN_KEY = 'poi-plugin-exp-calc'

export const DATA_PATH = path.join(window.APPDATA_PATH, `${PLUGIN_KEY}.json`)

export const SELECT_SHIP = `@@${PLUGIN_KEY}@select` as const
export const OVERRIDE_EXP = `@@${PLUGIN_KEY}@override-exp` as const

/** Running average of the base exp actually awarded by a map. */
export interface MapStat {
  count: number
  average: number
}

export interface ExpCalcState {
  /**
   * Selected ship's api_id, `0` meaning the hand-entered custom ship.
   * FIXME: we store selected ship id in store to reduce unnecessary updates
   */
  id: number
  /** Sortie in progress, tracked so battle results can be attributed to a map. */
  staging: {
    mapId: string
  }
  stats: Record<string, MapStat>
  /** Per-map exp entered by hand, which wins over both stats and the poi DB. */
  override: Record<string, string | number>
}

export const initialState: ExpCalcState = {
  id: 0,
  staging: {
    mapId: '',
  },
  stats: {},
  override: {},
}

export interface SelectShipAction {
  type: typeof SELECT_SHIP
  id: number
}

export interface OverrideExpAction {
  type: typeof OVERRIDE_EXP
  mapId: string
  value: string
}
