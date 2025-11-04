"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _lodash = require("lodash");

var _core = require("@blueprintjs/core");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _classnames = _interopRequireDefault(require("classnames"));

var _reactI18next = require("react-i18next");

var _redux = require("redux");

var _selectors = require("../../selectors");

var _constants = require("../../constants");

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const MapList = _styledComponents["default"].ul.withConfig({
  displayName: "map__MapList",
  componentId: "sc-16hnvz9-0"
})(["padding:0;margin:0;max-height:20em;overflow:scroll;::-webkit-scrollbar{width:1em;}::-webkit-scrollbar-thumb{background:", ";width:1em;}span{cursor:pointer;}"], props => props.theme.BLUE1);

const MapItem = _styledComponents["default"].li.withConfig({
  displayName: "map__MapItem",
  componentId: "sc-16hnvz9-1"
})(["display:flex;padding:0.5em 1em;"]);

const MapId = _styledComponents["default"].span.withConfig({
  displayName: "map__MapId",
  componentId: "sc-16hnvz9-2"
})(["width:3em;"]);

const MapName = _styledComponents["default"].span.withConfig({
  displayName: "map__MapName",
  componentId: "sc-16hnvz9-3"
})(["flex:1;"]);

const MapDropdown = (0, _redux.compose)((0, _reactI18next.withTranslation)('poi-plugin-exp-calc'), (0, _reactRedux.connect)(state => ({
  maps: (0, _selectors.mapDataSelctor)(state)
})))((_temp = _class = class MapDropdown extends _react.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      exp: 100
    };

    this.handleSelect = mapId => () => this.props.onSelect(mapId);

    this.handleCustomExpChange = value => this.setState({
      exp: value
    });

    this.handleSetCustomExp = () => this.props.onSelect(0, this.state.exp);
  }

  render() {
    const {
      maps,
      t,
      mapId,
      mapExp
    } = this.props;
    const {
      exp
    } = this.state;
    const current = maps[mapId] || {};
    const text = mapId > 0 ? `${current.api_maparea_id}-${current.api_no} ${current.api_name}` : `${t('Custom')}: ${mapExp}`;
    return _react["default"].createElement(_core.Popover, {
      position: _core.Position.BOTTOM,
      minimal: true,
      content: _react["default"].createElement("div", null, _react["default"].createElement(_core.FormGroup, {
        inline: true,
        label: t('Custom Exp')
      }, _react["default"].createElement(_core.ControlGroup, {
        fill: true
      }, _react["default"].createElement(_core.NumericInput, {
        value: exp,
        onValueChange: this.handleCustomExpChange
      }), _react["default"].createElement(_core.Button, {
        onClick: this.handleSetCustomExp,
        intent: _core.Intent.PRIMARY,
        className: _core.Classes.POPOVER_DISMISS
      }, t('Confirm')))), _react["default"].createElement(_core.ButtonGroup, {
        minimal: true
      }, (0, _lodash.map)(_constants.frequentMaps, id => _react["default"].createElement(_core.Button, {
        intent: _core.Intent.PRIMARY,
        key: id,
        onClick: this.handleSelect(id),
        className: _core.Classes.POPOVER_DISMISS
      }, Math.floor(id / 10), "-", id % 10))), _react["default"].createElement(MapList, null, (0, _lodash.map)(maps, world => _react["default"].createElement(MapItem, {
        role: "button",
        tabIndex: "0",
        key: world.api_id,
        onClick: this.handleSelect(world.api_id),
        className: (0, _classnames["default"])(_core.Classes.POPOVER_DISMISS, _core.Classes.MENU_ITEM)
      }, _react["default"].createElement(MapId, null, world.api_maparea_id, "-", world.api_no), _react["default"].createElement(MapName, null, world.api_name), world.api_no > 4 && _react["default"].createElement(_core.Tag, {
        intent: _core.Intent.PRIMARY
      }, "EO")))))
    }, _react["default"].createElement(_core.Button, {
      minimal: true,
      intent: _core.Intent.PRIMARY
    }, _react["default"].createElement(_reactFontawesome["default"], {
      name: "map"
    }), " ", text));
  }

}, _class.propTypes = {
  maps: _propTypes["default"].objectOf(_propTypes["default"].object).isRequired,
  onSelect: _propTypes["default"].func.isRequired,
  t: _propTypes["default"].func.isRequired,
  mapId: _propTypes["default"].number.isRequired,
  mapExp: _propTypes["default"].number.isRequired
}, _temp));
var _default = MapDropdown;
exports["default"] = _default;
module.exports = exports.default;