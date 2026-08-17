import type { APIShip } from 'kcsapi/api_port/port/response'
import type { APIMstShip } from 'kcsapi/api_start2/getData/response'

/**
 * A ship's master data merged with the player's instance of it, as poi's
 * `shipDataSelectorFactory` hands the two out, plus a romanised reading so the
 * ship list can be searched by keyboard.
 */
export type ShipExpData = APIMstShip &
  APIShip & {
    romaji: string
  }
