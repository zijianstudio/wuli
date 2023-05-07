// Copyright 2019, University of Colorado Boulder

/**
 * PhET Binder Index Page
 *
 * @author Chris Klusendorf
 **/

// imports
import React from 'react';
import ComponentsBySim from '../componentsBySim';
import SimsByComponent from '../simsByComponent';
import './index.css';

export default class IndexPage extends React.Component {
  constructor( props ) {
    super( props );

    this.state = {
      selectedButtonId: null,
      selectedPage: null
    };

    fetch( process.env.PUBLIC_URL + '/binderjson.json' )
      .then( response => response.json() )
      .then( data => {
        const components = data.components;
        const sims = data.sims;

        // organize the data for the "sims by component" view
        const simsByComponent = Object.keys( components ).map( component => {
          return { name: component, sims: Object.keys( components[ component ] ) };
        } );

        this.setState( {
          simsByComponent: <SimsByComponent components={simsByComponent}/>,
          componentsBySim: <ComponentsBySim sims={sims} />
        } );

        const firstButtonToSelect = this.state.selectedButtonId || 'simsByComponent';
        this.selectPage( firstButtonToSelect );
      } );
  }

  selectClass( buttonId ) {
    return this.state.selectedButtonId === buttonId ? 'selected' : '';
  }

  selectPage( buttonId ) {
    this.setState( {
      selectedButtonId: buttonId,
      selectedPage: this.state[ buttonId ]
    } );
  }

  render() {

    const NavButton = props => {
      return <button className={`nav-button ${this.selectClass( props.id )}`}
                     onClick={() => this.selectPage( props.id )}>
        {props.label}
      </button>
    };

    return (
      <div id='index-page'>

        <div id='side-nav'>

          <div className='title-container'>
            <img src={process.env.PUBLIC_URL + '/img/phet.png'} className='title-image' alt='PhET'/>
            <h1 className='title-text'>Binder</h1>
          </div>

          <div className='nav-buttons'>
            <NavButton id='simsByComponent' label='SIMS BY COMPONENT'/>
            <NavButton id='componentsBySim' label='COMPONENTS BY SIM'/>
          </div>

        </div>

        <div id='selected-page'>
          {this.state.selectedPage}
        </div>

      </div>
    );
  }
}