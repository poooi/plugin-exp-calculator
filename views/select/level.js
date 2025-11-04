"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _lodash = _interopRequireDefault(require("lodash"));

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _core = require("@blueprintjs/core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

class LevelDropdown extends _react.PureComponent {
  constructor(...args) {
    super(...args);

    this.handleSelect = lv => () => this.props.onSelect(lv);
  }

  render() {
    const {
      levels
    } = this.props;
    return _react["default"].createElement(_core.Popover, {
      minimal: true,
      position: _core.Position.BOTTOM,
      content: _react["default"].createElement("div", null, _react["default"].createElement(_core.ButtonGroup, {
        minimal: true
      }), (0, _lodash["default"])(levels).map(level => _react["default"].createElement(_core.Button, {
        minimal: true,
        key: level,
        onClick: this.handleSelect(level),
        className: _core.Classes.POPOVER_DISMISS
      }, level)).value())
    }, _react["default"].createElement(_core.Button, {
      minimal: true,
      intent: _core.Intent.PRIMARY
    }, _react["default"].createElement(_reactFontawesome["default"], {
      name: "star"
    })));
  }

}

LevelDropdown.propTypes = {
  onSelect: _propTypes["default"].func.isRequired,
  levels: _propTypes["default"].arrayOf(_propTypes["default"].number).isRequired
};
var _default = LevelDropdown;
exports["default"] = _default;
module.exports = exports.default;