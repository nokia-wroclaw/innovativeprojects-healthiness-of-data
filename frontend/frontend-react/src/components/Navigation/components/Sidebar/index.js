import React from 'react';
import styled from 'styled-components';
import './style.css';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const Side = styled.div`
    display: inline-block;
    width: 200px;
    position: fixed;
    height: 100%;
    border-right: solid 2px #0099cc;
    color: #0099cc;
    
    .hide{
    transition
`;

const SidebarButton = styled.div`
    margin: 0;
    padding: 0;
    width: 100%;
    height: 50px;    
    line-height: 30px;
    border: none;   
    display:inline-block;
    text-align: center;
    border-bottom: solid 2px #0099cc;
    &:hover{
            cursor: pointer;
    }
    h1{
        user-select: none;
        font-size: 20px;
        text-align:left;
        margin: 0;
        display: inline-block;
        padding-top: 10px;
        &:after{
            content: "";
            display: block;
            border-bottom: solid 2px #0099cc;
            transform: scaleX(0);      
            transition: transform 500ms linear; 
        }
        
        &:hover:after{
            transform: scaleX(1);
        }
        
        &:hover{
            cursor: pointer;
            transition: transform 500 linear;
        }  
    }    
`;

const SidebarButtonSub = styled.a`
    margin: 0;
    padding: 0;
    width: 100%;
    height: 50px;    
    line-height: 30px;
    border: none;   
    display:inline-block;
    text-align: right;
    border-bottom: solid 2px #0099cc;
    
    &:visited{
        color: #0099cc;
    }
    
    &:hover{
            cursor: pointer;
    }
    
    h1{
        user-select: none;
        font-size: 20px;
        text-align:left;
        margin: 0;
        display: inline-block;
        padding-top: 10px;
        text-align: right;  
        padding-right: 2%;
        &:before{
            content: "\\2022";
        }
    
        &:after{
            content: "";
            display: block;
            border-bottom: solid 2px #0099cc;    
            transform: scaleX(0);
            transition: transform 500ms linear; 
        }
            &:hover:after{
            transform: scaleX(1);
        }
        &:hover{
            cursor: pointer;
            transition: transform 500 linear;
        }
     }
`;

export const Sidebar = ({toggle_api_children, api_children_visibility}) => {
    return (

        <Side>
            <ReactCSSTransitionGroup transitionName="sidebar_button"
                                     transitionAppear={true}
                                     transitionAppearTimeout={500}
                                     transitionEnterTimeout={700}
                                     transitionLeaveTimeout={700}>
            <SidebarButton
                onClick = {toggle_api_children}
            >
                <h1>API</h1>
            </SidebarButton>
            { api_children_visibility ?
                <SidebarButtonSub href='/api/operators'>
                    <h1>Operators</h1>
                </SidebarButtonSub>
            : null }
            </ReactCSSTransitionGroup>
        </Side>

    );
}