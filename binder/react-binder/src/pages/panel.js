// Copyright 2019, University of Colorado Boulder

/**
 * Displays a title and list of elements
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './common.css';

export default class Panel extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      // eslint-disable-next-line react/prop-types
      title: props.title,
      // eslint-disable-next-line react/prop-types
      elements: props.elements
    };
  }

  componentWillReceiveProps( newProps ) {
    if ( newProps.title !== this.state.title ) {
      this.setState( {
        title: newProps.title,
        elements: newProps.elements
      } );
    }
  }

  createPanel() {
    const elements = this.state.elements;
    const elementsToRender = [];

    elementsToRender.push( <h3>{this.state.title}</h3> );
    elements.forEach( element => {
      elementsToRender.push( <p>{element}</p> );
    } );

    return elementsToRender;
  }

  render() {
    return (
      <div className='panel'>
        {this.createPanel()}
      </div>
    );
  }
}