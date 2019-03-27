import { observer } from 'redux-observers'
import { extensionSelectorFactory } from 'views/utils/selectors'
import path from 'path'
import { readJsonSync } from 'fs-extra'
import { size } from 'lodash'

import FileWriter from './file-writer'

export const PLUGIN_KEY = 'poi-plugin-exp-calc'
const { APPDATA_PATH } = window
export const DATA_PATH = path.join(APPDATA_PATH, `${PLUGIN_KEY}.json`)

// reducer
// FIXME: we store selected ship id in store to reduce unnecessary updates
let initState = {
  id: 0,
  staging: {
    mapId: '',
  },
  stats: {},
  override: {},
}

try {
  const persistence = readJsonSync(DATA_PATH)
  initState = {
    ...initState,
    ...persistence,
    staging: {
      mapId: '',
    },
  }
} catch (e) {
  /* do nothing */
}

const reducer = (state = initState, action) => {
  const { type, id, body, mapId, value } = action
  if (type === '@@poi-plugin-exp-calc@select') {
    return {
      ...state,
      id,
    }
  }

  if (type === '@@poi-plugin-exp-calc@override-exp') {
    return {
      ...state,
      override: {
        ...state.override,
        [mapId]: value,
      },
    }
  }

  // single fleet and combine fleet results
  if (type.startsWith('@@') && type.includes('battleresult')) {
    const { api_get_base_exp: baseExp } = body

    const { stats } = state

    const count = (stats[state.staging.mapId]?.count || 0) + 1
    const average =
      ((stats[state.staging.mapId]?.average || 0) * (count - 1) + baseExp) /
      count

    if (baseExp && state.staging.mapId) {
      return {
        ...state,
        stats: {
          ...stats,
          [state.staging.mapId]: {
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
    const { api_maparea_id: worldId, api_mapinfo_no: currentMapId } = body
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
  extensionSelectorFactory(PLUGIN_KEY),
  (dispatch, current) => {
    if (size(current)) {
      fileWriter.write(DATA_PATH, current)
    }
  },
)
