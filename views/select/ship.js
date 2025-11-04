"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _core = require("@blueprintjs/core");

var _reactRedux = require("react-redux");

var _classnames = _interopRequireDefault(require("classnames"));

var _lodash = _interopRequireWildcard(require("lodash"));

var _fuse = _interopRequireDefault(require("fuse.js"));

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactI18next = require("react-i18next");

var _redux = require("redux");

var _constants = require("../../constants");

var _selectors = require("../../selectors");

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const catMap = (0, _lodash["default"])(_constants.shipCat).map(({
  name,
  id
}) => [name, id]).fromPairs().value();
const searchOptions = [{
  name: 'Fleet',
  value: 'fleet'
}, {
  name: 'All',
  value: 'all'
}, ...(0, _lodash["default"])(_constants.shipCat).map(({
  name
}) => ({
  name,
  value: name
})).value()];

const Wrapper = _styledComponents["default"].div.withConfig({
  displayName: "ship__Wrapper",
  componentId: "scsry5-0"
})([".bp3-tab-panel{margin-top:0;}"]);

const CustomShip = _styledComponents["default"].div.withConfig({
  displayName: "ship__CustomShip",
  componentId: "scsry5-1"
})(["width:20em;height:30em;padding:0.5em 1em;"]);

const ShipList = _styledComponents["default"].ul.withConfig({
  displayName: "ship__ShipList",
  componentId: "scsry5-2"
})(["padding:0;margin:0;height:30em;overflow:scroll;width:20em;::-webkit-scrollbar{width:1em;}::-webkit-scrollbar-thumb{background:", ";width:1em;}span{cursor:pointer;}"], props => props.theme.BLUE1);

const ShipItem = _styledComponents["default"].li.withConfig({
  displayName: "ship__ShipItem",
  componentId: "scsry5-3"
})(["display:flex;padding:0.5em 1em;"]);

const ShipLv = _styledComponents["default"].span.withConfig({
  displayName: "ship__ShipLv",
  componentId: "scsry5-4"
})(["width:3em;"]);

const ShipName = _styledComponents["default"].span.withConfig({
  displayName: "ship__ShipName",
  componentId: "scsry5-5"
})(["flex:1;"]);

const Menu = (0, _redux.compose)((0, _reactI18next.withTranslation)('poi-plugin-exp-calc'), (0, _reactRedux.connect)(state => ({
  ships: (0, _selectors.shipExpDataSelector)(state),
  fleetMap: (0, _selectors.shipFleetMapSelector)(state)
})))((_temp = _class = class Menu extends _react.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
      type: 'all',
      startLevel: 1,
      nextExp: _constants.exp[2] - _constants.exp[1]
    };

    this.componentDidUpdate = prevProps => {
      if ((0, _lodash.values)(this.props.ships).length !== (0, _lodash.values)(prevProps.ships).length) {
        this.fuse.list = (0, _lodash.values)(this.Props.ships);
        this.forceUpdate();
      }
    };

    this.handleQueryChange = e => {
      this.setState({
        query: e.target.value
      });
    };

    this.handleClear = () => {
      this.setState({
        query: ''
      });
    };

    this.handleSelect = id => async () => {
      this.props.onSelect(id);
    };

    this.handleStartLevelChange = startLevel => {
      this.setState({
        startLevel,
        nextExp: (_constants.exp[startLevel + 1] || 0) - _constants.exp[startLevel]
      });
    };

    this.handleNextExpChange = value => {
      this.setState({
        nextExp: value
      });
    };

    this.handleConfirmCustom = () => {
      const {
        startLevel,
        nextExp
      } = this.state;
      this.props.onSelect(0, startLevel, nextExp);
    };

    const options = {
      keys: ['api_name', 'api_yomi', 'romaji'],
      shouldSort: true
    };
    this.fuse = new _fuse["default"]((0, _lodash.values)(props.ships), options);
  }

  render() {
    const {
      query,
      startLevel,
      nextExp
    } = this.state;
    const {
      ships,
      fleetMap,
      t
    } = this.props;
    const filtered = (0, _lodash["default"])(this.fuse.search(query)).map(ship => ship.item.api_id);
    return _react["default"].createElement(Wrapper, null, _react["default"].createElement(_core.InputGroup, {
      value: query,
      placeholder: t('Search'),
      onChange: this.handleQueryChange,
      rightElement: _react["default"].createElement(_core.Button, {
        minimal: true,
        onClick: this.handleClear,
        intent: _core.Intent.WARNING
      }, _react["default"].createElement(_reactFontawesome["default"], {
        name: "times"
      }))
    }), _react["default"].createElement(_core.Tabs, {
      vertical: true,
      id: "ship-selection",
      renderActiveTabPanelOnly: true
    }, _react["default"].createElement(_core.Tab, {
      id: "custom",
      title: t('Custom'),
      panel: _react["default"].createElement(CustomShip, null, _react["default"].createElement(_core.FormGroup, {
        label: t('Starting Level')
      }, _react["default"].createElement(_core.NumericInput, {
        value: startLevel,
        onValueChange: this.handleStartLevelChange
      })), _react["default"].createElement(_core.FormGroup, {
        label: t('To next')
      }, _react["default"].createElement(_core.NumericInput, {
        value: nextExp,
        onValueChange: this.handleNextExpChange
      })), _react["default"].createElement(_core.Button, {
        intent: _core.Intent.PRIMARY,
        onClick: this.handleConfirmCustom,
        className: _core.Classes.POPOVER_DISMISS
      }, t('Confirm')))
    }), (0, _lodash.map)(searchOptions, ({
      name,
      value: type
    }) => _react["default"].createElement(_core.Tab, {
      key: type,
      id: type,
      title: t(name),
      panel: _react["default"].createElement(ShipList, null, (0, _lodash["default"])(ships).filter(ship => type !== 'fleet' || ship.api_id in fleetMap).filter(ship => !catMap[type] || (catMap[type] || []).includes(ship.api_stype)).filter(ship => !query || (filtered || []).includes(ship.api_id)).sortBy([ship => (filtered || []).indexOf(ship.api_id), ship => type !== 'fleet' || fleetMap[ship.api_id] || 0, ship => -ship.api_lv, ship => -(0, _lodash.get)(ship, ['api_exp', 0], 0)]).map(ship => _react["default"].createElement(ShipItem, {
        key: ship.api_id,
        onClick: this.handleSelect(ship.api_id),
        className: (0, _classnames["default"])(_core.Classes.POPOVER_DISMISS, _core.Classes.MENU_ITEM)
      }, _react["default"].createElement(ShipLv, null, "Lv.", (0, _lodash.padEnd)(ship.api_lv, 4)), _react["default"].createElement(ShipName, null, t(ship.api_name || '', {
        ns: 'resources'
      })), ship.api_id in fleetMap && _react["default"].createElement(_core.Tag, {
        intent: _core.Intent.PRIMARY
      }, fleetMap[ship.api_id]))).value())
    }))));
  }

}, _class.propTypes = {
  ships: _propTypes["default"].objectOf(_propTypes["default"].object).isRequired,
  fleetMap: _propTypes["default"].objectOf(_propTypes["default"].number).isRequired,
  onSelect: _propTypes["default"].func.isRequired,
  t: _propTypes["default"].func.isRequired
}, _temp)); // separate menu from popover component to prevent unnecessary updates

const ShipDropdown = ({
  text,
  ...props
}) => _react["default"].createElement(_core.Popover, {
  position: _core.Position.BOTTOM,
  minimal: true,
  content: _react["default"].createElement(Menu, props)
}, _react["default"].createElement(_core.Button, {
  minimal: true,
  intent: _core.Intent.PRIMARY
}, _react["default"].createElement(_reactFontawesome["default"], {
  name: "list"
}), " ", text));

ShipDropdown.propTypes = {
  text: _propTypes["default"].node.isRequired
};
var _default = ShipDropdown;
exports["default"] = _default;
module.exports = exports.default;