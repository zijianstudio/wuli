// Copyright 2021-2022, University of Colorado Boulder

/**
 * NormalModesModel is the base class for the model in both screens.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import normalModes from '../../normalModes.js';
import NormalModesConstants from '../NormalModesConstants.js';
import AmplitudeDirection from './AmplitudeDirection.js';

class NormalModesModel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      numberOfMasses: 3,
      tandem: Tandem.REQUIRED
    }, options );

    // @public {number} Accumulated delta-time
    this.dt = 0;

    // @public {Property.<number>} the current time
    this.timeProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'timeProperty' )
    } );

    // @public {Property.<boolean>} determines whether the sim is in a play/pause state
    this.playingProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'playingProperty' )
    } );

    // @public used by the time control to select a speed
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.NORMAL, TimeSpeed.SLOW ]
    } );

    // @private {DerivedProperty.<number>} multiplier for dt used in step
    this.timeScaleProperty = new DerivedProperty(
      [ this.timeSpeedProperty ],
      timeSpeed => ( timeSpeed === TimeSpeed.NORMAL ) ? NormalModesConstants.NORMAL_SPEED : NormalModesConstants.SLOW_SPEED
    );

    // @public {Property.<boolean>} determines visibility of the springs
    this.springsVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'springsVisibleProperty' )
    } );

    // @public {Property.<number>} the current number of visible masses
    //TODO this is actually the number of masses per row. In the 'Two Dimensions' screen, the number of masses is this value squared.
    this.numberOfMassesProperty = new NumberProperty( options.numberOfMasses, {
      numberType: 'Integer',
      range: NormalModesConstants.NUMBER_OF_MASSES_RANGE,
      tandem: options.tandem.createTandem( 'numberOfMassesProperty' )
    } );

    // @public the current direction of motion of the visible masses
    this.amplitudeDirectionProperty = new EnumerationProperty( AmplitudeDirection.VERTICAL, {
      tandem: options.tandem.createTandem( 'amplitudeDirectionProperty' )
    } );

    // @public {Property.<boolean>} determines visibility of the arrows on the masses
    this.arrowsVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'arrowsVisibleProperty' )
    } );
  }

  /**
   * @public
   */
  reset() {
    this.dt = 0;
    this.playingProperty.reset();
    this.timeSpeedProperty.reset();
    this.springsVisibleProperty.reset();
    this.numberOfMassesProperty.reset();
    this.amplitudeDirectionProperty.reset();
    this.arrowsVisibleProperty.reset();
  }
}

normalModes.register( 'NormalModesModel', NormalModesModel );
export default NormalModesModel;