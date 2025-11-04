"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _core = require("@blueprintjs/core");

var _reactRedux = require("react-redux");

var _lodash = require("lodash");

var _reactI18next = require("react-i18next");

var _selectors = require("views/utils/selectors");

var _selectors2 = require("../selectors");

var _constants = require("../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const PluginContainer = _styledComponents["default"].div.withConfig({
  displayName: "data__PluginContainer",
  componentId: "sc-41192f-0"
})(["max-height:80vh;overflow:scroll;::-webkit-scrollbar{height:16px;width:16px;}::-webkit-scrollbar-thumb{background:", ";height:16px;width:16px;}"], props => props.theme.BLUE1);

const Table = (0, _styledComponents["default"])(_core.HTMLTable).withConfig({
  displayName: "data__Table",
  componentId: "sc-41192f-1"
})(["margin:0 auto;white-space:nowrap;thead th{color:#fff;position:sticky;top:0;:nth-child(1){background:", ";}:nth-child(2){background:", ";}:nth-child(3),:nth-child(4){background:", ";}:nth-child(5){background:", ";}}"], props => props.theme.BLUE5, props => props.theme.BLUE4, props => props.theme.BLUE3, props => props.theme.BLUE2);
const CustomExpInput = (0, _reactRedux.connect)((state, {
  mapId
}) => ({
  exp: (0, _lodash.get)((0, _selectors.extensionSelectorFactory)('poi-plugin-exp-calc')(state), ['override', mapId], '')
}))(({
  exp,
  dispatch,
  mapId
}) => {
  const [expValue, setValue] = (0, _react.useState)(exp);
  const {
    t
  } = (0, _reactI18next.useTranslation)('poi-plugin-exp-calc');
  const onConfirm = (0, _react.useCallback)(value => {
    const num = +value;

    if (Number.isNaN(num) || num < 0) {
      setValue(exp);
      return;
    }

    dispatch({
      type: '@@poi-plugin-exp-calc@override-exp',
      mapId,
      value
    });
  }, [dispatch, setValue, mapId, exp]);
  return _react["default"].createElement(_core.EditableText, {
    selectAllOnFocus: true,
    onConfirm: onConfirm,
    onChange: value => setValue(value),
    value: expValue,
    placeholder: t('Click to edit')
  });
});
const ExpTable = (0, _reactRedux.connect)(state => ({
  maps: (0, _selectors2.mapDataSelctor)(state),
  stats: (0, _lodash.get)((0, _selectors.extensionSelectorFactory)('poi-plugin-exp-calc')(state), 'stats'),
  enablePernsonalStat: (0, _lodash.get)(state.config, 'plugin.expCalc.enablePersonalStat', true)
}))(({
  maps,
  stats,
  enablePernsonalStat
}) => {
  const {
    t
  } = (0, _reactI18next.useTranslation)('poi-plugin-exp-calc');
  return _react["default"].createElement("div", null, _react["default"].createElement(_core.Switch, {
    checked: enablePernsonalStat,
    onChange: () => config.set('plugin.expCalc.enablePersonalStat', !enablePernsonalStat)
  }, t('Use personal statistics data (if samples are more than 30)')), _react["default"].createElement(Table, {
    interactive: true
  }, _react["default"].createElement("thead", null, _react["default"].createElement("tr", null, _react["default"].createElement("th", null, t('Map')), _react["default"].createElement("th", null, t('Poi DB')), _react["default"].createElement("th", null, t('Stat')), _react["default"].createElement("th", null, t('Samples')), _react["default"].createElement("th", null, t('Custom')))), _react["default"].createElement("tbody", null, (0, _lodash.map)(maps, world => {
    var _stats$mapId, _stats$mapId2;

    const mapId = `${world.api_maparea_id}${world.api_no}`;
    return _react["default"].createElement("tr", {
      key: world.api_id
    }, _react["default"].createElement("td", null, world.api_maparea_id, "-", world.api_no, " ", world.api_name), _react["default"].createElement("td", null, _constants.EXP_BY_POI_DB[mapId]), _react["default"].createElement("td", null, Math.floor(((_stats$mapId = stats[mapId]) === null || _stats$mapId === void 0 ? void 0 : _stats$mapId.average) || 0)), _react["default"].createElement("td", null, ((_stats$mapId2 = stats[mapId]) === null || _stats$mapId2 === void 0 ? void 0 : _stats$mapId2.count) || 0), _react["default"].createElement("td", null, _react["default"].createElement(CustomExpInput, {
      mapId: mapId
    })));
  }))));
});

const Data = () => {
  return _react["default"].createElement(PluginContainer, null, _react["default"].createElement(ExpTable, null));
};

var _default = Data;
exports["default"] = _default;
module.exports = exports.default;