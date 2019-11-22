import React from 'react'
import {LggReactContext} from "./Context";

export default function lggConnect(fn) {
    return function (Components) {
        class NewComponent extends React.PureComponent {
            constructor(props, context) {
                super(props, context);
                this.unSubscribe = context.store.onSubscription(this.lggSubscribe);
                const lastState = fn(context.store.getState());
                // const {forwardedRef, ...rest} = this.props;
                const userProps = {
                    lggDispatch: context.store.dispatch,
                    ...lastState,
                    // ...rest,
                };
                this.state = {...userProps};
            }

            componentWillUnmount() {
                this.unSubscribe();
            }

            lggSubscribe = (store, coerceRender) => {
                const newState = fn(this.context.store.getState());
                let modify = coerceRender || false;
                if (!modify) {
                    for (let k in newState) {
                        if (newState[k] !== this.state[k]) {
                            modify = true;
                            break;
                        }
                    }
                }
                if (modify) {
                    this.setState({...newState});
                }
            };

            render() {
                const {...userProps} = this.state;
                const {forwardedRef, ...rest} = this.props;
                return (
                    <Components {...userProps} {...rest} ref={forwardedRef}/>
                )
            }
        }

        const name = Components.displayName || Components.name;
        NewComponent.displayName = `lggConnect(${name})`;
        NewComponent.contextType = LggReactContext;
        return React.forwardRef(function (props, ref) {
            return <NewComponent {...props} forwardedRef={ref}/>;
        });
    }
}
