'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = exports.createReactDriver = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

var RxConnect = function (_Component) {
    _inherits(RxConnect, _Component);

    function RxConnect() {
        _classCallCheck(this, RxConnect);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RxConnect).apply(this, arguments));
    }

    _createClass(RxConnect, [{
        key: 'getChildContext',
        value: function getChildContext() {
            return {
                events: this.props.events
            };
        }
    }, {
        key: 'render',
        value: function render() {
            return _react.Children.only(this.props.children);
        }
    }]);

    return RxConnect;
}(_react.Component);

RxConnect.childContextTypes = {
    events: _react.PropTypes.func
};


function createReactDriver(domTarget) {
    return function (vtree$) {

        var _events = {};
        var _callbacks = {};

        var events = function events(type) {
            if (!_events[type]) {
                (function () {
                    var event$ = new Rx.Subject();
                    _events[type] = event$;
                    _callbacks[type] = function (e) {
                        return event$.onNext(e);
                    };
                })();
            }
            return _events[type];
        };

        var getCallback = function getCallback(type) {
            if (!type) {
                return _callbacks;
            }
            return _callbacks[type];
        };

        vtree$.subscribe(function (element) {
            _reactDom2.default.render((0, _react.createElement)(RxConnect, { events: getCallback }, element), document.querySelector(domTarget));
        });

        return { events: events };
    };
}

function connect() {
    for (var _len = arguments.length, intents = Array(_len), _key = 0; _key < _len; _key++) {
        intents[_key] = arguments[_key];
    }

    return function (WrappedComponent) {
        var _class, _temp;

        return _temp = _class = function (_Component2) {
            _inherits(RxConnected, _Component2);

            function RxConnected() {
                _classCallCheck(this, RxConnected);

                return _possibleConstructorReturn(this, Object.getPrototypeOf(RxConnected).apply(this, arguments));
            }

            _createClass(RxConnected, [{
                key: 'render',
                value: function render() {
                    var _this3 = this;

                    var events = {};
                    intents.forEach(function (i) {
                        return events[i] = _this3.context.events(i);
                    });

                    var mergedProps = _extends({
                        events: events
                    }, this.props);

                    return (0, _react.createElement)(WrappedComponent, mergedProps);
                }
            }]);

            return RxConnected;
        }(_react.Component), _class.displayName = 'RxConnected(' + getDisplayName(WrappedComponent) + ')', _class.contextTypes = {
            events: _react.PropTypes.func
        }, _temp;
    };
}

exports.createReactDriver = createReactDriver;
exports.connect = connect;