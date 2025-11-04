"use strict";

exports.__esModule = true;
exports.pluginWillUnload = exports.pluginDidLoad = exports.reactClass = void 0;

var _lodash = require("lodash");

var _selectors = require("views/utils/selectors");

var _i18next = _interopRequireDefault(require("views/env-parts/i18next"));

var _selectors2 = require("./selectors");

var _views = _interopRequireDefault(require("./views"));

var _constants = require("./constants");

var _reducer2 = _interopRequireDefault(require("./reducer"));

exports.reducer = _reducer2["default"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

const t = _i18next["default"].getFixedT(null, 'poi-plugin-exp-calc');

const getBonusType = lv => {
  if (lv < 10) {
    return 0;
  }

  if (lv >= 10 && lv < 30) {
    return 1;
  }

  if (lv >= 30 && lv < 60) {
    return 2;
  }

  if (lv >= 60 && lv < 100) {
    return 3;
  }

  return 4;
};

const handleResponse = e => {
  const {
    path,
    body
  } = e.detail;

  if (path === '/kcsapi/api_req_member/get_practice_enemyinfo') {
    const enemyShips = body.api_deck.api_ships;
    let baseExp = _constants.exp[enemyShips[0].api_level] / 100 + _constants.exp[(0, _lodash.get)(enemyShips, [1, 'api_level'], 1)] / 300;
    baseExp = baseExp <= 500 ? baseExp : 500 + Math.floor(Math.sqrt(baseExp - 500));
    const bonusStr = [];
    let bonusFlag = false;
    const state = window.getStore();
    const fleets = (0, _lodash.range)(4).map(fleetId => (0, _selectors.fleetShipsIdSelectorFactory)(fleetId)(state));
    const ships = (0, _selectors2.shipExpDataSelector)(state);
    (0, _lodash.each)(fleets, fleet => {
      if (!fleet) {
        return;
      }

      let flagshipFlag = false;
      let trainingLv = 0;
      let trainingCount = 0;
      (0, _lodash.each)(fleet, (id, idx) => {
        const ship = ships[id];

        if (ship.api_stype === 21) {
          trainingCount += 1;

          if (!flagshipFlag) {
            if (ship.api_lv > trainingLv) {
              trainingLv = ship.api_lv;
            }
          }

          if (idx === 0) {
            flagshipFlag = true;
          }
        }
      });

      if (trainingCount >= 2) {
        trainingCount = 2;
      }

      if (trainingCount !== 0) {
        bonusFlag = true;
        const bonusType = getBonusType(trainingLv);
        const bonusScale = flagshipFlag ? _constants.bonusExpScaleFlagship[trainingCount - 1][bonusType] : _constants.bonusExpScaleNonFlagship[trainingCount - 1][bonusType];
        bonusStr.push(`${bonusScale}%`);
      } else {
        bonusStr.push('0%');
      }
    });
    let message = `${t('Exp')}: [A/B] ${Math.floor(baseExp)}, [S] ${Math.floor(baseExp * 1.2)}`;

    if (bonusFlag) {
      message = `${message}, ${t('+ {{bonus}} for each fleet', {
        bonus: bonusStr.join(' ')
      })}`;
    }

    window.success(message, {
      priority: 2,
      stickyFor: 1000
    });
  }
};

const reactClass = _views["default"];
exports.reactClass = reactClass;

const pluginDidLoad = () => window.addEventListener('game.response', handleResponse);

exports.pluginDidLoad = pluginDidLoad;

const pluginWillUnload = () => window.removeEventListener('game.response', handleResponse);

exports.pluginWillUnload = pluginWillUnload;