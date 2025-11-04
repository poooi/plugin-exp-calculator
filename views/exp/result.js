"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _lodash = require("lodash");

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _map = _interopRequireDefault(require("../select/map"));

var _table = _interopRequireDefault(require("./table"));

var _constants = require("../../constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const Selection = _styledComponents["default"].div.withConfig({
  displayName: "result__Selection",
  componentId: "f8qe6p-0"
})(["display:flex;justify-content:center;align-items:center;"]);

const SelectionItem = _styledComponents["default"].div.withConfig({
  displayName: "result__SelectionItem",
  componentId: "f8qe6p-1"
})(["font-size:150%;width:30px;height:30px;text-align:center;line-height:30px;transition:0.3s;font-weight:", ";background:", ";"], props => props.checked && 500, props => props.checked && props.theme.BLUE5);

const Divider = _styledComponents["default"].div.withConfig({
  displayName: "result__Divider",
  componentId: "f8qe6p-2"
})(["margin:0 1em;"]);

const ResultSelection = ({
  totalExp
}) => {
  const [mapId, setMapId] = (0, _react.useState)(0);
  const [mapExp, setMapExp] = (0, _react.useState)(100);
  const [rank, setRank] = (0, _react.useState)(0); // S victory

  const mapPercent = _constants.expPercent[rank];
  return _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement(Selection, null, _react["default"].createElement(_map["default"], {
    onSelect: (id, exp = 100) => {
      setMapId(id);

      if (!id) {
        setMapExp(exp);
      }
    },
    mapId: mapId,
    mapExp: mapExp
  }), _react["default"].createElement(Divider, null, _react["default"].createElement(_reactFontawesome["default"], {
    name: "times"
  })), (0, _lodash.range)(_constants.expLevel.length).map(idx => _react["default"].createElement(SelectionItem, {
    checked: rank === idx,
    role: "button",
    tabIndex: "0",
    value: idx,
    key: idx,
    onClick: () => setRank(idx)
  }, _constants.expLevel[idx]))), _react["default"].createElement(_table["default"], {
    mapExp: mapId > 0 ? _constants.EXP_BY_POI_DB[mapId] || 100 : mapExp,
    mapPercent: mapPercent,
    totalExp: totalExp,
    mapId: mapId
  }));
};

ResultSelection.propTypes = {
  totalExp: _propTypes["default"].number.isRequired
};
var _default = ResultSelection;
exports["default"] = _default;
module.exports = exports.default;