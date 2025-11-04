"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireDefault(require("react"));

var _core = require("@blueprintjs/core");

var _reactI18next = require("react-i18next");

var _lodash = require("lodash");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactRedux = require("react-redux");

var _selectors = require("views/utils/selectors");

var _constants = require("../../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

const Wrapper = _styledComponents["default"].div.withConfig({
  displayName: "table__Wrapper",
  componentId: "sc-171g2sn-0"
})(["display:flex;justify-content:center;"]);

const emptyStat = {
  count: 0,
  average: 0
};
const ResultTable = (0, _reactRedux.connect)((state, {
  mapId
}) => ({
  enablePernsonalStat: (0, _lodash.get)(state.config, 'plugin.expCalc.enablePersonalStat', true),
  override: (0, _lodash.get)((0, _selectors.extensionSelectorFactory)('poi-plugin-exp-calc')(state), ['override', mapId], ''),
  personalStat: (0, _lodash.get)((0, _selectors.extensionSelectorFactory)('poi-plugin-exp-calc')(state), ['stats', mapId], emptyStat)
}))(({
  mapExp,
  mapPercent,
  totalExp,
  enablePernsonalStat,
  override,
  personalStat,
  mapId
}) => {
  let finalMapExp = mapExp;
  let signal = 'Poi DB';

  if (mapId) {
    if (override && +override) {
      finalMapExp = +override;
      signal = 'Custom';
    } else if (enablePernsonalStat && personalStat.count > 30) {
      finalMapExp = personalStat.average;
      signal = 'Personal';
    }
  } else {
    signal = 'Fixed';
  }

  const baseExp = finalMapExp * mapPercent;
  const baseCount = Math.max(totalExp / baseExp, 0);
  const counts = [baseCount, baseCount / 1.5, baseCount / 2.0, baseCount / 3.0].map(Math.ceil);
  const perBattle = [baseExp, baseExp * 1.5, baseExp * 2.0, baseExp * 3.0].map(Math.floor);
  const {
    t
  } = (0, _reactI18next.useTranslation)('poi-plugin-exp-calc');
  return _react["default"].createElement(Wrapper, null, _react["default"].createElement(_core.HTMLTable, {
    interactive: true
  }, _react["default"].createElement("thead", null, _react["default"].createElement("tr", null, _react["default"].createElement("th", null, _react["default"].createElement(_core.Tag, {
    intent: _core.Intent.PRIMARY,
    minimal: true
  }, t(signal))), _react["default"].createElement("th", null, t('Per attack')), _react["default"].createElement("th", null, t('Remainder')))), _react["default"].createElement("tbody", null, (0, _lodash.range)(_constants.expClass.length).map(idx => _react["default"].createElement("tr", {
    key: idx
  }, _react["default"].createElement("td", null, t(_constants.expClass[idx])), _react["default"].createElement("td", null, perBattle[idx]), _react["default"].createElement("td", null, counts[idx]))))));
});
var _default = ResultTable;
exports["default"] = _default;
module.exports = exports.default;