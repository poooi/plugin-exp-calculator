import { readFileSync } from 'fs'
import { size } from 'lodash'
import { observer } from 'redux-observers'
import { extensionSelectorFactory } from 'views/utils/selectors'

import type { ExpCalcState } from './state'

import FileWriter from './file-writer'
import {
  DATA_PATH,
  OVERRIDE_EXP,
  PLUGIN_KEY,
  SELECT_SHIP,
  initialState,
} from './state'

export { DATA_PATH, PLUGIN_KEY } from './state'

interface BattleResultBody {
  api_get_base_exp?: number
}

interface MapStartBody {
  api_maparea_id: number
  api_mapinfo_no: number
}

/**
 * poi dispatches every API response into the store, so this reducer sees far
 * more than its own actions and has to narrow by `type` before trusting `body`.
 */
interface PluginAction {
  type: string
  id?: number
  mapId?: string
  value?: string
  body?: unknown
}

const readPersistedState = (): ExpCalcState => {
  try {
    const persistence = JSON.parse(
      readFileSync(DATA_PATH, 'utf8'),
    ) as Partial<ExpCalcState>
    return {
      ...initialState,
      ...persistence,
      // a sortie never survives a restart
      staging: {
        mapId: '',
      },
    }
  } catch {
    return initialState
  }
}

const initState = readPersistedState()

const reducer = (
  state: ExpCalcState = initState,
  action: PluginAction,
): ExpCalcState => {
  const { type } = action

  if (type === SELECT_SHIP) {
    return {
      ...state,
      id: action.id ?? 0,
    }
  }

  if (type === OVERRIDE_EXP) {
    return {
      ...state,
      override: {
        ...state.override,
        [action.mapId!]: action.value!,
      },
    }
  }

  // single fleet and combine fleet results
  if (type.startsWith('@@') && type.includes('battleresult')) {
    const { api_get_base_exp: baseExp } = (action.body ??
      {}) as BattleResultBody

    const { stats, staging } = state

    if (baseExp && staging.mapId) {
      const count = (stats[staging.mapId]?.count || 0) + 1
      const average =
        ((stats[staging.mapId]?.average || 0) * (count - 1) + baseExp) / count

      return {
        ...state,
        stats: {
          ...stats,
          [staging.mapId]: {
            count,
            average,
          },
        },
      }
    }
  }

  if (type === '@@Response/kcsapi/api_port/port') {
    return {
      ...state,
      staging: {
        ...state.staging,
        mapId: '',
      },
    }
  }

  if (type === '@@Response/kcsapi/api_req_map/start') {
    const { api_maparea_id: worldId, api_mapinfo_no: currentMapId } =
      action.body as MapStartBody
    return {
      ...state,
      staging: {
        ...state.staging,
        mapId: `${worldId}${currentMapId}`,
      },
    }
  }

  return state
}

export default reducer

const fileWriter = new FileWriter()

export const dataObserver = observer(
  extensionSelectorFactory<ExpCalcState | undefined>(PLUGIN_KEY),
  (_dispatch, current) => {
    if (size(current)) {
      fileWriter.write(DATA_PATH, current)
    }
  },
)
