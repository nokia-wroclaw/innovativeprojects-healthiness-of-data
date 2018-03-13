import React from 'react';
import styled from 'styled-components';
import collapse_icon from './collapse_icon.png';

const Head = styled.div`
    height: 50px;
    width: 100%;
    border-bottom: solid 2px #0099cc;      
`;

const CollapseButton = styled.div`
    border-radius: 50%;
    height: 50px;
    width: 50px;
    background-color: transparent;
    background-image: url(${collapse_icon});
    background-size: contain;
    &:active{
         border: 0;
    }
    &:hover{
         cursor: pointer;
    }
`;

export const Header = ({toggle_sidebar}) => {
    return(
      <Head>
          <CollapseButton
          onClick={toggle_sidebar}
          >
          </CollapseButton>
      </Head>
    );
}