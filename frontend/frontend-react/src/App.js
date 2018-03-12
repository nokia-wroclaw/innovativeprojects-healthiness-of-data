import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

//const is_searched = search_term => item => item.acronym.toLowerCase().includes(search_term.toLowerCase());

class App extends Component {


     constructor(props) {
        super(props);
        this.state = {
            sidebar_visible: true,
            api_children_visible: false,
            operators_page_visible: false,
        };
        this.toggle_sidebar = this.toggle_sidebar.bind(this);
        this.toggle_api_children = this.toggle_api_children.bind(this);
        this.toggle_api_operators_page = this.toggle_api_operators_page.bind(this);
     }

    toggle_sidebar() {
         const {
             sidebar_visible,
         } = this.state;
        this.setState({
            sidebar_visible: !sidebar_visible,
        });
    }

    toggle_api_children() {
         const {
             api_children_visible,
         } = this.state;
         this.setState({
             api_children_visible: !api_children_visible,
         });
    }
    toggle_api_operators_page() {
        const {
            operators_page_visible,
        } = this.state;
        this.setState({
            operators_page_visible: !operators_page_visible,
        });
    }
    //
    // on_search_change(event) {
    //     this.setState({
    //         search_term: event.target.value
    //     });
    // }
    //
    // set_search_db_data(result) {
    //     this.setState({ result });
    // }
    //
    // componentDidMount() {
    //     const { search_term } = this.state;
    //     fetch('http://localhost:5000/api/operators/117?date_start=2016-10-01&date_end=2018-03-01&kpi_basename=SGSN_2012')
    //         .then(response => response.json())
    //         .then(result => this.set_search_db_data(result))
    //         .catch(error => error)
    // }

    render() {

        const {
            sidebar_visible,
            api_children_visible,
            operators_page_visible,
        } = this.state;
        //
        // if (!result) return null;
        return (
            <div className="App">
                <Navigation
                    sidebar_collapse = {this.toggle_sidebar}
                    is_sidebar_collapsed = {sidebar_visible}
                    api_children_visible = {api_children_visible}
                    toggle_api_children = {this.toggle_api_children}
                    toggle_operators_page = {this.toggle_api_operators_page}
                    operators_page = {operators_page_visible}

                />
                {/*<Search*/}
                    {/*value = {search_term}*/}
                    {/*on_change = {this.on_search_change}*/}
                {/*>*/}
                    {/*Search*/}
                {/*</Search>*/}
                {/*<Table*/}
                    {/*list = {result}*/}
                    {/*pattern = {search_term}*/}
                    {/*on_dismiss = {this.on_dismiss}*/}
                {/*/>*/}
            </div>
        );
    }
}

class Navigation extends Component{
    render() {
        const {
            sidebar_collapse,
            is_sidebar_collapsed,
            api_children_visible,
            toggle_api_children,
            toggle_operators_page,
            operators_page,
        } = this.props;

        return (
            <div key="content">
                <header>
                    <button
                    onClick={() => sidebar_collapse()}
                    type="button"
                    >
                    </button>
                </header>
                { is_sidebar_collapsed ?
                    <div className="sidebar">
                        <button
                        onClick={() => toggle_api_children()}
                        type="button"
                        >
                            <h1>API</h1>
                        </button>
                        { api_children_visible ?
                        <button className="sub"
                        onClick={() => toggle_operators_page()}
                        >
                            <h2>OPERATORS</h2>
                        </button>
                            : null }
                    </div>
                : null }
                { operators_page ?
                    <article>
                        <h1>API</h1>
                        <h2>Operators</h2>
                    </article>
                : null }
            </div>
        );
    }
}
//
// function Search({value, on_change, children}) {
//     return (
//         <form>
//             {children}
//             <input
//                 type="text"
//                 value={value}
//                 onChange={on_change}
//             />
//         </form>
//     );
// }
//
// function Table({list, pattern, on_dismiss}) {
//     return (
//         <div>
//         {list.filter(is_searched(pattern)).map(item =>
//             <ul key={item.acronym}>
//                 <h2>{item.acronym}</h2>
//                 <li>Mean: {item.mean}</li>
//                 <li>Max Value: {item.max_val}</li>
//                 <li>Min Value: {item.min_val}</li>
//                 <li>Standard Deviation: {item.std_deviation}</li>
//                 <li>Coverage: {item.coverage}</li>
//                 <li>Distribution: {item.distribution}</li>
//                 <span>
//                     <Button
//                         on_click = {() => on_dismiss(item.acronym)}
//                     >
//                         Dismiss
//                     </Button>
//                 </span>
//             </ul>
//         )}
//         </div>
//     );
// }
//
function Button({on_click, class_name, children}){
    return (
        <button
            onClick = {on_click}
            className = {class_name}
            type = "button"
        >
            {children}
        </button>
    );
}

export default App;
