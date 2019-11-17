import React from 'react';
import LggReactContext from "./Context";

export default class Provider extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            store: this.props.store
        }
    }

    componentDidMount() {
    }

    render() {
        const Context = this.props.context || LggReactContext;
        return (
            <Context.Provider value={this.state}>
                {this.props.children}
            </Context.Provider>
        )
    }
}