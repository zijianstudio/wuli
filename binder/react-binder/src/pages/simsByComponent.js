// Copyright 2019, University of Colorado Boulder

/**
 * Displays a list of common components, each of which can be expanded to list the sims that the component uses.
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './common.css';
import Panel from './panel';

export default class SimsByComponent extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      // eslint-disable-next-line react/prop-types
      components: props.components,
      simsPanel: null
    };
  }

  createComponentList() {
    const components = this.state.components;
    const componentList = [];

    components.forEach( component => {
      const componentName = <button className='link-button' onClick={() => this.loadSimsForComponent( component.name )}>
        {component.name}
      </button>;

      componentList.push( componentName );
    } );

    return componentList;
  }

  loadSimsForComponent( componentName ) {
    const components = this.state.components;

    components.forEach( component => {
      if ( component.name === componentName ) {
        this.setState( {
          simsPanel: <Panel title={componentName} elements={component.sims}/>
        } );
      }
    } );
  }

  render() {
    return (
      <div className='page'>
        <div className='list'>
          {this.createComponentList()}
        </div>
        {this.state.simsPanel}
      </div>
    );
  }
}