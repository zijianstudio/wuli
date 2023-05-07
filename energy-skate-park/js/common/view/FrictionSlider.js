// Copyright 2019-2022, University of Colorado Boulder

/**
 * A slider that controls the friction Property of energy skate park.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Range from '../../../../dot/js/Range.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import PhysicalSlider from './PhysicalSlider.js';

const controlsFrictionTitleString = EnergySkateParkStrings.physicalControls.frictionStringProperty;

class FrictionSlider extends PhysicalSlider {

  /**
   * @param {NumberProperty} property - Property for friction
   * @param {BooleanProperty} userControlledProperty - is the user actively controlling friction?
   * @param {Tandem} tandem
   */
  constructor( property, userControlledProperty, tandem ) {
    super( controlsFrictionTitleString, property, new Range( EnergySkateParkConstants.MIN_FRICTION, EnergySkateParkConstants.MAX_FRICTION ), userControlledProperty, tandem );
  }
}

energySkatePark.register( 'FrictionSlider', FrictionSlider );
export default FrictionSlider;