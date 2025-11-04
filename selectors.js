"use strict";

exports.__esModule = true;
exports.shipFleetMapSelector = exports.mapDataSelctor = exports.shipExpDataSelector = exports.expInfoSelectorFactory = exports.remodelLvSelector = void 0;

var _lodash = _interopRequireWildcard(require("lodash"));

var _reselect = require("reselect");

var _fastMemoize = _interopRequireDefault(require("fast-memoize"));

var _wanakana = require("wanakana");

var _selectors = require("views/utils/selectors");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const MAX_LEVEL = Object.keys(_constants.exp).length;
const remodelLvSelector = (0, _reselect.createSelector)([_selectors.constSelector], ({
  $ships = {}
}) => (0, _lodash["default"])($ships).filter(ship => typeof ship.api_aftershipid !== 'undefined') // filter enemies
.map(ship => {
  let remodelLvs = [ship.api_afterlv];
  let nextShipId = +ship.api_aftershipid;

  while (nextShipId !== 0 && (0, _lodash.last)(remodelLvs) < $ships[nextShipId].api_afterlv) {
    remodelLvs = [...remodelLvs, $ships[nextShipId].api_afterlv];
    nextShipId = +(0, _lodash.get)($ships, [nextShipId, 'api_aftershipid'], 0);
  }

  remodelLvs = (0, _lodash.last)(remodelLvs) < 100 ? [...remodelLvs, 99, MAX_LEVEL] : [...remodelLvs, MAX_LEVEL];
  return [ship.api_id, remodelLvs];
}).fromPairs().value()); // const toRomaji = kana => wanakana.toRomaji(kana)

exports.remodelLvSelector = remodelLvSelector;
const expInfoSelectorFactory = (0, _fastMemoize["default"])(shipId => (0, _reselect.createSelector)([(0, _selectors.shipDataSelectorFactory)(shipId)], ([ship, $ship] = []) => typeof ship !== 'undefined' && typeof $ship !== 'undefined' ? { ...$ship,
  ...ship,
  romaji: (0, _wanakana.toRomaji)($ship.api_yomi)
} : undefined));
exports.expInfoSelectorFactory = expInfoSelectorFactory;
const shipExpDataSelector = (0, _reselect.createSelector)([_selectors.stateSelector, _selectors.shipsSelector], (state, ships) => (0, _lodash["default"])(ships).mapValues(ship => expInfoSelectorFactory(ship.api_id)(state)).value());
exports.shipExpDataSelector = shipExpDataSelector;
const mapDataSelctor = (0, _reselect.createSelector)([_selectors.constSelector], ({
  $maps = {}
} = {}) => $maps);
exports.mapDataSelctor = mapDataSelctor;

const fleetsSelector = state => state.info.fleets;

const shipFleetMapSelector = (0, _reselect.createSelector)([fleetsSelector], fleets => (0, _lodash["default"])(fleets).filter(Boolean).flatMap(fleet => (0, _lodash["default"])(fleet.api_ship).filter(id => id > 0).map(id => [id, fleet.api_id]).value()).fromPairs().value());
exports.shipFleetMapSelector = shipFleetMapSelector;