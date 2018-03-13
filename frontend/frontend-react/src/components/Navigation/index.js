import React, { Component } from 'react';
import {Header} from './components/Header';
import {Sidebar} from './components/Sidebar';

export default class Navigation extends Component {

    constructor(props){
        super(props);
        this.state = {
            sidebar_visibility: true,
            api_children_visibility: false,
        }
        this.toggle_api_children = this.toggle_api_children.bind(this);
        this.toggle_sidebar = this.toggle_sidebar.bind(this);
    }

    toggle_sidebar() {
        const {
            sidebar_visibility,
        } = this.state;
        this.setState({
            sidebar_visibility: !sidebar_visibility,
        });
    }

    toggle_api_children() {
        const {
            api_children_visibility,
        } = this.state;
        this.setState({
            api_children_visibility: !api_children_visibility,
        });
    }

    render() {
        const {
            sidebar_visibility,
            api_children_visibility,
        } = this.state;
        return(
            <div>
                <Header
                    toggle_sidebar = {this.toggle_sidebar}
                >
                </Header>
                { sidebar_visibility ?
                    <Sidebar
                        api_children_visibility = {api_children_visibility}
                        toggle_api_children = {this.toggle_api_children}
                    >
                    </Sidebar>
                : null }
            </div>
        );
    }
}