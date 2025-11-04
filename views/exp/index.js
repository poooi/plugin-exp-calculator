"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _lodash = require("lodash");

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _reactEditInplace = _interopRequireDefault(require("react-edit-inplace"));

var _core = require("@blueprintjs/core");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reactI18next = require("react-i18next");

var _redux = require("redux");

var _selectors = require("views/utils/selectors");

var _selectors2 = require("../../selectors");

var _ship = _interopRequireDefault(require("../select/ship"));

var _level = _interopRequireDefault(require("../select/level"));

var _result = _interopRequireDefault(require("./result"));

var _constants = require("../../constants");

var _class, _temp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const LevelSection = _styledComponents["default"].div.withConfig({
  displayName: "exp__LevelSection",
  componentId: "k6san3-0"
})(["font-size:200%;display:flex;align-items:center;div:nth-child(2){flex:1;text-align:center;}div:last-child{text-align:right;}"]);

const ExpProgress = _styledComponents["default"].div.attrs(props => ({
  background: `linear-gradient(90deg, ${props.theme.BLUE5} ${props.percentage}%, rgba(0, 0, 0, 0) 0%)`
})).withConfig({
  displayName: "exp__ExpProgress",
  componentId: "k6san3-1"
})(["display:flex;margin:1ex 1em;padding:0 4px;border:1px solid ", ";transform:skewX(-15deg);background:", ";span{flex:1;}span:last-child{text-align:right;}"], props => props.theme.BLUE5, props => props.background);

const ExpCalc = (0, _redux.compose)((0, _reactI18next.withTranslation)('poi-plugin-exp-calc'), (0, _reactRedux.connect)(state => {
  const id = (0, _lodash.get)((0, _selectors.extensionSelectorFactory)('poi-plugin-exp-calc')(state), 'id');
  return {
    id,
    horizontal: (0, _selectors.configLayoutSelector)(state),
    doubleTabbed: (0, _selectors.configDoubleTabbedSelector)(state),
    ship: (0, _selectors2.expInfoSelectorFactory)(id)(state),
    remodelLvs: (0, _selectors2.remodelLvSelector)(state)
  };
}))((_temp = _class = class ExpCalc extends _react.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      startLevel: 1,
      nextExp: _constants.exp[2] - _constants.exp[1],
      endLevel: _constants.MAX_LEVEL,
      lockGoal: false,
      id: 0
    };

    this.handleShipSelect = (id, startLevel, nextExp) => {
      this.props.dispatch({
        type: '@@poi-plugin-exp-calc@select',
        id
      });

      if (id === 0) {
        this.setState({
          startLevel,
          nextExp
        });
      }
    };

    this.handleRankChange = rank => () => {
      this.setState({
        rank
      });
    };

    this.handleMapSelect = (mapId, mapExp = 100) => {
      this.setState({
        mapId,
        mapExp
      });
    };

    this.handleStartLevelChange = e => {
      this.setState({
        startLevel: e.target.value
      });
    };

    this.handleEndLevelChange = ({
      endLevel
    }) => {
      this.setState({
        endLevel: parseInt(endLevel, 10)
      });
    };

    this.handleEndLevelSelect = endLevel => {
      this.setState({
        endLevel
      });
    };

    this.handleNextExpChange = e => {
      this.setState({
        nextExp: e.target.value
      });
    };

    this.handleLockChange = () => {
      this.setState(prevState => ({
        lockGoal: !prevState.lockGoal
      }));
    };
  }

  render() {
    const {
      endLevel,
      lockGoal
    } = this.state;
    const {
      ship = {},
      id,
      remodelLvs,
      t
    } = this.props;
    const startLevel = id > 0 ? ship.api_lv : this.state.startLevel;
    const nextExp = id > 0 ? (0, _lodash.get)(ship, ['api_exp', 1], 0) : this.state.nextExp;
    const totalExp = id > 0 ? _constants.exp[endLevel] - (0, _lodash.get)(ship, ['api_exp', 0], 0) : _constants.exp[endLevel] - _constants.exp[startLevel + 1] + nextExp;
    const percentage = Math.round((_constants.exp[endLevel] - totalExp) / _constants.exp[endLevel] * 100);
    const levels = id > 0 ? (0, _lodash.filter)(remodelLvs[ship.api_ship_id], lv => lv > ship.api_lv) : [99, _constants.MAX_LEVEL];
    return _react["default"].createElement("div", null, _react["default"].createElement("div", null, _react["default"].createElement("div", null, _react["default"].createElement(_ship["default"], {
      onSelect: this.handleShipSelect,
      text: id > 0 ? t(ship.api_name || 'Unknown', {
        ns: 'resources'
      }) : t('Custom')
    })), _react["default"].createElement(LevelSection, null, _react["default"].createElement("div", null, "Lv.", startLevel || 1), _react["default"].createElement("div", null, _react["default"].createElement(_reactFontawesome["default"], {
      name: "arrow-right"
    })), _react["default"].createElement("div", null, "Lv.", _react["default"].createElement(_reactEditInplace["default"], {
      validate: text => +text > 0 && +text <= _constants.MAX_LEVEL,
      text: String(endLevel),
      paramName: "endLevel",
      className: "end-level",
      activeClassName: "end-level-active",
      change: this.handleEndLevelChange,
      stopPropagation: true
    }), _react["default"].createElement(_level["default"], {
      onSelect: this.handleEndLevelSelect,
      levels: levels
    }), _react["default"].createElement(_core.Button, {
      intent: lockGoal ? _core.Intent.SUCCESS : _core.Intent.PRIMARY,
      onClick: this.handleLockChange,
      minimal: true
    }, _react["default"].createElement(_reactFontawesome["default"], {
      name: lockGoal ? 'lock' : 'unlock'
    })))), _react["default"].createElement(ExpProgress, {
      percentage: percentage
    }, _react["default"].createElement("span", null, t('Next'), " ", nextExp), _react["default"].createElement("span", null, t('Remaining'), " ", totalExp))), _react["default"].createElement("div", null, _react["default"].createElement(_result["default"], {
      totalExp: totalExp
    })));
  }

}, _class.propTypes = {
  id: _propTypes["default"].number.isRequired,
  ship: _propTypes["default"].object,
  remodelLvs: _propTypes["default"].objectOf(_propTypes["default"].array),
  dispatch: _propTypes["default"].func,
  t: _propTypes["default"].func
}, _class.getDerivedStateFromProps = (nextProps, prevState) => {
  const {
    id,
    ship,
    remodelLvs
  } = nextProps;

  if (prevState.id !== id) {
    const level = (0, _lodash.get)(ship, ['api_lv'], 0);
    const shipId = (0, _lodash.get)(ship, ['api_ship_id'], 0);
    const endLevel = prevState.lockGoal ? prevState.endLevel : (0, _lodash.find)(remodelLvs[shipId], lv => lv > level) || _constants.MAX_LEVEL;
    return {
      startLevel: level,
      endLevel,
      id
    };
  }

  return {
    id
  };
}, _temp));
var _default = ExpCalc;
exports["default"] = _default;
module.exports = exports.default;