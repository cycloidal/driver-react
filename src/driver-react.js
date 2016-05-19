import React, {
    createElement,
    Component,
    Children,
    PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import jsonQuery from 'json-query'

/**
 * Root component providing context.
 *
 * This component keeps reference to callbacks, which in this context are
 * called intents. Each callbacks corresponds to one observable streams.
 * These observables are called intent-streams.
 *
 * @class RxConnect
 */
class RxConnect extends Component {

    static childContextTypes = {
        intents: PropTypes.func,
        props: PropTypes.object
    }

    getChildContext() {
        return {
            intents: this.props._intents,
            props: this.props._props
        }
    }

    render() {
        return Children.only(this.props.children)
    }

}

/**
 * Create a driver that connects to React components.
 *
 * @param {string} domTarget Selector where the app should be rendered to.
 * @return {function} The driver function.
 */
function createReactDriver(domTarget) {

    /**
     * This callback makes the driver.
     *
     * @param {Rx.Observable} state$ The stream characterizing the app state.
     * @return {object} Interface to interact with thie driver.
     */
    return function(state$) {

        const _intents$ = {}
        const _callbacks = {}

        /**
         * Get/create the intent denoted by name param.
         *
         * @param {string} name The name of the intent.
         * @return Rx.Subject
         */
        const intent = function(name) {
            if (!_intents$[name]) {
                const intent$ = new Rx.Subject()
                _intents$[name] = intent$
                _callbacks[name] = (e) => intent$.onNext(e)
            }
            return _intents$[name]
        }

        /**
         * Get the callback attached to the intent name.
         *
         * @param {string} name The name of the intent.
         * @return {function} Returns the attached callback function.
         */
        const getCallback = function(name) {
            if (!name) {
                return _callbacks
            }
            return _callbacks[name]
        }

        // subscribe to state updates
        state$.subscribe(element => {
            ReactDOM.render(
                createElement(RxConnect, {
                    _intents: getCallback,
                    _props: element.props
                }, element),
                document.querySelector(domTarget)
            )
        })

        // return the driver's interface
        return {
            intent
        }
    }

}

/**
 * Context connect decorator.
 *
 * This decorater is used to provide a React.Component with the
 * needed elements from a parent's context.
 *
 * @param {array} intents List of intents to connect through the context.
 * @return {function} Decorator function.
 */
function connect(...args) {

    const intentsArgs = args.filter(val => !val.match(/^\w+\!/))
    const propsArgs = args.filter(val => val.match(/^props\!/))
        .map(val => val.replace(/^props\!/, ''))

    return (WrappedComponent) => {

        // helper to select displayName of a React.Component
        const _dn = (comp) => comp.displayName || comp.name || 'Component'

        /**
         * Component decorator that connects to context.
         *
         * @class RxConnected
         */
        return class RxConnected extends Component {

            static displayName = `RxConnected(${_dn(WrappedComponent)})`

            static contextTypes = {
                intents: PropTypes.func,
                props: PropTypes.object
            }

            render() {

                // transfer intents
                const intents = {}
                intentsArgs.forEach(i => intents[i] = this.context.intents(i))

                // transfer other props
                const props = {}
                const locals = {
                    prop: (input, target) => {
                        props[target] = input
                    }
                }
                propsArgs.forEach(prop => {

                    jsonQuery(prop, {
                        data: this.context.props,
                        locals
                    })

                })

                const mergedProps = {
                    intents,
                    ...props,
                    ...this.props
                }

                return createElement(WrappedComponent, mergedProps)
            }

        }

    }
}

export {
    createReactDriver,
    connect
}
