declare module 'views/env-parts/i18next' {
  import type { i18n } from 'i18next'

  const i18nextInstance: i18n
  export default i18nextInstance
}

declare module 'views/components/etc/overlay' {
  export { Dialog, Popover, Tooltip } from '@blueprintjs/core'
}

declare module 'views/create-store' {
  export const store: {
    dispatch: (action: unknown) => unknown
    getState: () => unknown
    subscribe: (listener: () => void) => () => void
  }
}

// An ambient module declaration may not import through a relative path, so the
// store's shape lives here rather than alongside the plugin's own types.
declare module 'views/utils/selectors' {
  import type { APIDeckPort, APIShip } from 'kcsapi/api_port/port/response'
  import type {
    APIMstMapinfo,
    APIMstShip,
  } from 'kcsapi/api_start2/getData/response'
  import type { Selector } from 'reselect'

  export interface PoiConstState {
    $maps?: Record<number, APIMstMapinfo>
    $ships?: Record<number, APIMstShip>
  }

  export interface PoiConfigState extends Record<string, unknown> {
    plugin?: {
      expCalc?: {
        enablePersonalStat?: boolean
      }
    }
  }

  /** poi's store, narrowed to the slices this plugin reads. */
  export interface PoiState {
    config: PoiConfigState
    const: PoiConstState
    ext: Record<string, unknown>
    info: {
      fleets: APIDeckPort[]
      ships: Record<number, APIShip>
    }
  }

  export type ShipData = [APIShip?, APIMstShip?]

  export const configSelector: Selector<PoiState, PoiConfigState>
  export const configLayoutSelector: Selector<PoiState, boolean>
  export const configDoubleTabbedSelector: Selector<PoiState, boolean>
  export const constSelector: Selector<PoiState, PoiConstState>
  export const stateSelector: Selector<PoiState, PoiState>
  export const shipsSelector: Selector<PoiState, Record<number, APIShip>>
  export const shipDataSelectorFactory: (
    id: number,
  ) => Selector<PoiState, ShipData | undefined>
  export const fleetShipsIdSelectorFactory: (
    fleetId: number,
  ) => Selector<PoiState, number[] | undefined>
  export const extensionSelectorFactory: <T = unknown>(
    key: string,
  ) => Selector<PoiState, T>
}
