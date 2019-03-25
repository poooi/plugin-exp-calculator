// reducer
// FIXME: we store selected ship id in store to reduce unnecessary updates
const initState = {
  id: 0,
  staging: {
    mapId: '',
  },
  stats: {},
}

const reducer = (state = initState, action) => {
  const { type, id, body } = action
  if (type === '@@poi-plugin-exp-calc@select') {
    return {
      ...state,
      id,
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
    const { api_maparea_id: worldId, api_mapinfo_no: mapId } = body
    return {
      ...state,
      staging: {
        ...state.staging,
        mapId: `${worldId}${mapId}`,
      },
    }
  }
  return state
}

export default reducer
