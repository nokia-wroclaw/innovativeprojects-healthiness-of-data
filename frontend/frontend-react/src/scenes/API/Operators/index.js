import React from 'react';
import styled from 'styled-components';
const Div = styled.div`
    display: inline-block;
    text-align: center;
    margin-left: 200px;
    margin-top: 75px;
    width: 100%;
`;

const Article = styled.article`
    display: inline-block;
    width: 50%;
    height: 100%;
    border: 2px solid #0099cc;
    border-radius: 5px;
    
    h1{
        margin: 0;
        padding: 0;
        margin-top: 1%;
        margin-left: 5%;
        margin-right: 5%;
        text-align: left;
        font-size: 30px;
        border-bottom: 1px solid #0099cc;
        color: #0099cc;
    }
    h2{
        margin: 0;
        padding: 0;
        margin-top: 1%;
        margin-left: 5%;
        margin-right: 5%;
        text-align: left;
        font-size: 24px;
        border-bottom: 1px solid #0099cc;
        color: #0099cc;
    }   
    p{
        text-align: left;
        margin-left: 5%;
        color: #0099cc;
        line-height: 25px;
    }
`;


export const ApiOperators = () => {
    return (
        <Div>
            <Article>
                <a href="/api"><h1>API</h1></a>
                <h2>Operators</h2>
                <p>
                    <b>Type:</b> GET<br />
                    <b>URL:</b> /api/operators/:cord_id?query_params<br />
                    <b>QUERY PARAMS: </b>
                    date_start,
                    date_end,
                    kpi_basename<br />

                    <b>Example call:</b> /api/operators/117?date_start=2017-10-01&date_end=2018-03-01&kpi_basename=SGSN_2012<br />
                </p>
            </Article>
        </Div>
    );
}