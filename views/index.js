"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _overlay = require("views/components/etc/overlay");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _reduxObservers = require("redux-observers");

var _createStore = require("views/create-store");

var _core = require("@blueprintjs/core");

var _reactI18next = require("react-i18next");

var _reducer = require("../reducer");

var _exp = _interopRequireDefault(require("./exp"));

var _data = _interopRequireDefault(require("./data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj["default"] = obj; return newObj; } }

const PluginContainer = _styledComponents["default"].div.withConfig({
  displayName: "views__PluginContainer",
  componentId: "sc-1eoh3px-0"
})(["padding:1ex 1em;"]);

const DataDialog = (0, _styledComponents["default"])(_overlay.Dialog).withConfig({
  displayName: "views__DataDialog",
  componentId: "sc-1eoh3px-1"
})(["width:fit-content;height:fit-content;max-height:90vh;"]);
let unsubscribe;

const ExpCalc = () => {
  const [isOpen, setIsOpen] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    unsubscribe = (0, _reduxObservers.observe)(_createStore.store, [_reducer.dataObserver]);
    return () => unsubscribe();
  }, []);
  const {
    t
  } = (0, _reactI18next.useTranslation)('poi-plugin-exp-calc');
  return _react["default"].createElement("div", null, _react["default"].createElement(PluginContainer, null, _react["default"].createElement(_exp["default"], null), _react["default"].createElement(_core.Button, {
    minimal: true,
    intent: _core.Intent.PRIMARY,
    onClick: () => setIsOpen(true)
  }, t('View Data')), _react["default"].createElement(DataDialog, {
    isOpen: isOpen,
    autoFocus: true,
    canOutsideClickClose: true,
    onClose: () => setIsOpen(false),
    title: t('Data')
  }, _react["default"].createElement("div", {
    className: _core.Classes.DIALOG_BODY
  }, _react["default"].createElement(_data["default"], null)))));
};

var _default = ExpCalc;
exports["default"] = _default;
module.exports = exports.default;