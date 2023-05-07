// Copyright 2019, University of Colorado Boulder

/**
 * Displays a list of sims, each of which can be expanded to list the common components that the sim uses.
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import './common.css';
import Panel from './panel';

export default class ComponentsBySim extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      // eslint-disable-next-line react/prop-types
      sims: props.sims
    };
  }

  createSimList() {
    const sims = this.state.sims;
    const simList = [];

    for ( const key in sims ) {
      const sim = sims[ key ];
      const simName = <button className='link-button' onClick={() => this.loadComponentsForSim( sim.name )}>
        {sim.name}
      </button>;

      simList.push( simName );
    }

    return simList;
  }

  loadComponentsForSim( simName ) {
    const sims = this.state.sims;

    for ( const key in sims ) {
      const sim = sims[ key ];
      if ( sim.name === simName ) {
        this.setState( {
          simsPanel: <Panel title={simName} elements={sim.components}/>
        } );
      }
    }
  }

  render() {
    return (
      <div className='page'>
        <div className='list'>
          {this.createSimList()}
        </div>
        {this.state.simsPanel}
      </div>
    );
  }
}