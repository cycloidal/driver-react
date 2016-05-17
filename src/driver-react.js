import React, { createElement, Component, Children, PropTypes } from 'react'
import ReactDOM from 'react-dom'

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

class RxConnect extends Component {

    static childContextTypes = {
        events: PropTypes.func
    }

    getChildContext() {
        return {
            events: this.props.events
        }
    }

    render() {
        return Children.only(this.props.children)
    }

}

function createReactDriver(domTarget, events) {
    return function(vtree$) {

        const _events = {}
        const _callbacks = {}

        const events = function(type) {
            if (!_events[type]) {
                const event$ = new Rx.Subject()
                _events[type] = event$
                _callbacks[type] = (e) => event$.onNext(e)
            }
            return _events[type]
        }

        const getCallback = function(type) {
            if (!type) {
                return _callbacks
            }
            return _callbacks[type]
        }

        vtree$.subscribe(element => {
            ReactDOM.render(
                createElement(RxConnect, { events: getCallback }, element),
                document.querySelector(domTarget)
            )
        })

        return { events }
    }

}

function connect(...intents) {

    return (WrappedComponent) => {

        return class RxConnected extends Component {

            static displayName = `RxConnected(${getDisplayName(WrappedComponent)})`

            static contextTypes = {
                events: PropTypes.func
            }

            render() {

                const events = {}
                intents.forEach(i => events[i] = this.context.events(i))

                const mergedProps = {
                    events,
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
