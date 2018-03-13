import React, {Component} from 'react';
import Navigation from './components/Navigation';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { ApiOperators } from './scenes/API/Operators/';
import { ApiPage } from './scenes/API';

export class Main extends Component {

    render(){
        return(
            <div>
                <Navigation />
                <Router>
                    <div>
                        <Route path="/api" component={ApiPage} />
                        <Route path="/api/operators" component={ApiOperators} />
                    </div>
                </Router>
            </div>
        );
    }
}
