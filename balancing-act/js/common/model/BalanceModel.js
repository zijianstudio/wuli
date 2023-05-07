// Copyright 2013-2022, University of Colorado Boulder

/**
 * Basic model for depicting masses on a balance, meant to be used as a base
 * type.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import balancingAct from '../../balancingAct.js';
import ColumnState from './ColumnState.js';
import Fulcrum from './Fulcrum.js';
import LevelSupportColumn from './LevelSupportColumn.js';
import Plank from './Plank.js';

// constants
const FULCRUM_HEIGHT = 0.85; // In meters.
const PLANK_HEIGHT = 0.75; // In meters.

class BalanceModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {


    // Model elements
    this.fulcrum = new Fulcrum( new Dimension2( 1, FULCRUM_HEIGHT ) );
    this.massList = createObservableArray();
    this.userControlledMasses = []; // Masses being controlled by user(s), potentially more than one in touch environment.

    this.columnStateProperty = new EnumerationDeprecatedProperty( ColumnState, ColumnState.DOUBLE_COLUMNS, {
      tandem: tandem.createTandem( 'columnStateProperty' ),
      phetioReadOnly: true
    } );
    this.plank = new Plank(
      new Vector2( 0, PLANK_HEIGHT ),
      new Vector2( 0, FULCRUM_HEIGHT ),
      this.columnStateProperty,
      this.userControlledMasses,
      tandem.createTandem( 'plank' )
    );
    this.supportColumns = [
      new LevelSupportColumn( PLANK_HEIGHT, -1.625 ),
      new LevelSupportColumn( PLANK_HEIGHT, 1.625 )
    ];
  }

  /**
   * Step function, called by the framework, clocks time-dependent behavior.
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.plank.step( dt );
    this.massList.forEach( mass => {
      mass.step( dt );
    } );
  }

  /**
   * Add a mass to the model.  Subclasses generally do additional things.
   * @param mass
   * @public
   */
  addMass( mass ) {
    this.massList.push( mass );
    // Add a listener that will update the list of user controlled masses
    // that is used by the plank to update the active drop positions.
    const userControlledMassesUpdater = userControlled => {
      if ( userControlled ) {
        this.userControlledMasses.push( mass );
      }
      else {
        this.userControlledMasses.splice( this.userControlledMasses.indexOf( mass ), 1 );
      }
    };
    mass.userControlledProperty.link( userControlledMassesUpdater );

    // Attach a reference for this listener to the mass so that it can be removed later.
    mass.userControlledMassesUpdater = userControlledMassesUpdater;
  }

  /**
   * Remove a mass from the model.  Sub-types often do additional things.
   * @param mass
   * @public
   */
  removeMass( mass ) {
    this.massList.remove( mass );
    if ( mass.userControlledMassesUpdater ) {
      mass.userControlledProperty.unlink( mass.userControlledMassesUpdater );
      mass.userControlledMassesUpdater = null;
    }
  }

  /**
   * @public
   */
  reset() {
    this.plank.removeAllMasses();
    this.columnStateProperty.reset();
  }
}

balancingAct.register( 'BalanceModel', BalanceModel );

export default BalanceModel;
