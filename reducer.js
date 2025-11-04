"use strict";

exports.__esModule = true;
exports.dataObserver = exports["default"] = exports.DATA_PATH = exports.PLUGIN_KEY = void 0;

var _reduxObservers = require("redux-observers");

var _selectors = require("views/utils/selectors");

var _path = _interopRequireDefault(require("path"));

var _fsExtra = require("fs-extra");

var _lodash = require("lodash");

var _fileWriter = _interopRequireDefault(require("./file-writer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

const PLUGIN_KEY = 'poi-plugin-exp-calc';
exports.PLUGIN_KEY = PLUGIN_KEY;
const {
  APPDATA_PATH
} = window;

const DATA_PATH = _path["default"].join(APPDATA_PATH, `${PLUGIN_KEY}.json`); // reducer
// FIXME: we store selected ship id in store to reduce unnecessary updates


exports.DATA_PATH = DATA_PATH;
let initState = {
  id: 0,
  staging: {
    mapId: ''
  },
  stats: {},
  override: {}
};

try {
  const persistence = (0, _fsExtra.readJsonSync)(DATA_PATH);
  initState = { ...initState,
    ...persistence,
    staging: {
      mapId: ''
    }
  };
} catch (e) {
  /* do nothing */
}

const reducer = (state = initState, action) => {
  const {
    type,
    id,
    body,
    mapId,
    value
  } = action;

  if (type === '@@poi-plugin-exp-calc@select') {
    return { ...state,
      id
    };
  }

  if (type === '@@poi-plugin-exp-calc@override-exp') {
    return { ...state,
      override: { ...state.override,
        [mapId]: value
      }
    };
  } // single fleet and combine fleet results


  if (type.startsWith('@@') && type.includes('battleresult')) {
    var _stats$state$staging$, _stats$state$staging$2;

    const {
      api_get_base_exp: baseExp
    } = body;
    const {
      stats
    } = state;
    const count = (((_stats$state$staging$ = stats[state.staging.mapId]) === null || _stats$state$staging$ === void 0 ? void 0 : _stats$state$staging$.count) || 0) + 1;
    const average = ((((_stats$state$staging$2 = stats[state.staging.mapId]) === null || _stats$state$staging$2 === void 0 ? void 0 : _stats$state$staging$2.average) || 0) * (count - 1) + baseExp) / count;

    if (baseExp && state.staging.mapId) {
      return { ...state,
        stats: { ...stats,
          [state.staging.mapId]: {
            count,
            average
          }
        }
      };
    }
  }

  if (type === '@@Response/kcsapi/api_port/port') {
    return { ...state,
      staging: { ...state.staging,
        mapId: ''
      }
    };
  }

  if (type === '@@Response/kcsapi/api_req_map/start') {
    const {
      api_maparea_id: worldId,
      api_mapinfo_no: currentMapId
    } = body;
    return { ...state,
      staging: { ...state.staging,
        mapId: `${worldId}${currentMapId}`
      }
    };
  }

  return state;
};

var _default = reducer;
exports["default"] = _default;
const fileWriter = new _fileWriter["default"]();
const dataObserver = (0, _reduxObservers.observer)((0, _selectors.extensionSelectorFactory)(PLUGIN_KEY), (dispatch, current) => {
  if ((0, _lodash.size)(current)) {
    fileWriter.write(DATA_PATH, current);
  }
});
exports.dataObserver = dataObserver;