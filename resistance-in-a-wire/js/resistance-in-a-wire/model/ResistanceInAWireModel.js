// Copyright 2013-2022, University of Colorado Boulder

/**
 * Model which includes resistivity, length, area and resistance.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';

class ResistanceInAWireModel {
  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public {Property.<number>} in Ohm*cm
    this.resistivityProperty = new NumberProperty( ResistanceInAWireConstants.RESISTIVITY_RANGE.defaultValue, {
      tandem: tandem.createTandem( 'resistivityProperty' ),
      units: '\u2126\u00b7cm', // Ohm-centimeters
      range: ResistanceInAWireConstants.RESISTIVITY_RANGE
    } );

    // @public {Property.<number>} in cm
    this.lengthProperty = new NumberProperty( ResistanceInAWireConstants.LENGTH_RANGE.defaultValue, {
      tandem: tandem.createTandem( 'lengthProperty' ),
      units: 'cm',
      range: ResistanceInAWireConstants.LENGTH_RANGE
    } );

    // @public {Property.<number>} in cm^2
    this.areaProperty = new NumberProperty( ResistanceInAWireConstants.AREA_RANGE.defaultValue, {
      tandem: tandem.createTandem( 'areaProperty' ),
      units: 'cm^2',
      range: ResistanceInAWireConstants.AREA_RANGE
    } );

    // Derived property that tracks the resistance of the wire
    // @public {Property.<number>} in Ohms
    this.resistanceProperty = new DerivedProperty( [ this.resistivityProperty, this.lengthProperty, this.areaProperty ],
      ( resistivity, length, area ) => resistivity * length / area, {
        tandem: tandem.createTandem( 'resistanceProperty' ),
        units: '\u2126', // ohms
        phetioValueType: NumberIO
      }
    );

    // @public {BooleanProperty} - indicates when a reset is in progress
    this.resetInProgressProperty = new BooleanProperty( false );
  }


  /**
   * resets the properties of the model
   * @public
   */
  reset() {
    this.resetInProgressProperty.set( true );
    this.resistivityProperty.reset();
    this.lengthProperty.reset();
    this.areaProperty.reset();
    this.resetInProgressProperty.set( false );
  }


  /**
   * Get the total range of the derived resistance from the independent Properties of this model.
   *
   * @returns {Range}
   * @public
   */
  static getResistanceRange() {
    const minResistance = ResistanceInAWireConstants.RESISTIVITY_RANGE.min * ResistanceInAWireConstants.LENGTH_RANGE.min / ResistanceInAWireConstants.AREA_RANGE.min;
    const maxResistance = ResistanceInAWireConstants.RESISTIVITY_RANGE.max * ResistanceInAWireConstants.LENGTH_RANGE.max / ResistanceInAWireConstants.AREA_RANGE.max;
    return new Range( minResistance, maxResistance );
  }
}

resistanceInAWire.register( 'ResistanceInAWireModel', ResistanceInAWireModel );

export default ResistanceInAWireModel;