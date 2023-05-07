// Copyright 2021-2022, University of Colorado Boulder

/**
 * Constants used throughout this simulation. This is a singleton to support PhET-iO instrumentation. On startup, the
 * state of this object is emitted to the PhET-iO data stream.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Range, { RangeStateObject } from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../tandem/js/types/ObjectLiteralIO.js';
import ratioAndProportion from '../ratioAndProportion.js';
import RAPQueryParameters from './RAPQueryParameters.js';

type RAPConstantsState = {
  SCREEN_VIEW_X_MARGIN: number;
  SCREEN_VIEW_Y_MARGIN: number;
  RATIO_FITNESS_RANGE: RangeStateObject;
  IN_PROPORTION_FITNESS_THRESHOLD: number;
  MOVING_IN_PROPORTION_FITNESS_THRESHOLD: number;
  SHIFT_KEY_MULTIPLIER: number;
  TOTAL_RATIO_TERM_VALUE_RANGE: RangeStateObject;
  NO_SUCCESS_VALUE_THRESHOLD: number;
  QUERY_PARAMETERS: Record<string, unknown>;
};


class RAPConstants extends PhetioObject {

  public SCREEN_VIEW_X_MARGIN = 15;
  public SCREEN_VIEW_Y_MARGIN = 15;
  public RATIO_FITNESS_RANGE = new Range( 0, 1 );

  // distance (in fitness) from max fitness that still indicates a successful proportion
  public IN_PROPORTION_FITNESS_THRESHOLD = 0.025;

  // distance (in fitness) from max fitness that still indicates a successful proportion when both hands moving in the
  // same direction. See RAPRatio.movingInDirectionProperty
  public MOVING_IN_PROPORTION_FITNESS_THRESHOLD = 0.3;

  // distance (in fitness) from max fitness that still indicates a successful proportion when interacting via MediaPipe.
  public MEDIA_PIPE_IN_PROPORTION_FITNESS_THRESHOLD = RAPQueryParameters.cameraInputInProportionThreshold;

  // The value to multiple the keyboard step size by to get the shift + keydown step size
  public SHIFT_KEY_MULTIPLIER = 1 / 5;

  // The range that each ratio component (antecedent/consequent) value can be
  public TOTAL_RATIO_TERM_VALUE_RANGE = new Range( 0, 1 );

  // Consistent way to fix numbers. This should only be used in the view for comparison and display, not in the model, see https://github.com/phetsims/ratio-and-proportion/issues/243
  public toFixed = ( x: number ) => Utils.toFixedNumber( x, 6 );

  // The value in which when either the antecedent or consequent is less than this, the ratio cannot be "in proportion".
  // Add .001 to support two keyboard nav motions above 0 (counting the min range being >0).
  public NO_SUCCESS_VALUE_THRESHOLD = 0.01 - Number.EPSILON;

  public QUERY_PARAMETERS = RAPQueryParameters;

  public constructor() {
    super( {
        tandem: Tandem.GLOBAL_MODEL.createTandem( 'rapConstants' ),
        phetioType: new IOType<RAPConstants, RAPConstantsState>( 'RAPConstantsIO', {
          isValidValue: _.stubTrue,
          toStateObject: ( object: RAPConstants ) => object.toStateObject(),
          stateSchema: {
            SCREEN_VIEW_X_MARGIN: NumberIO,
            SCREEN_VIEW_Y_MARGIN: NumberIO,
            RATIO_FITNESS_RANGE: Range.RangeIO,
            IN_PROPORTION_FITNESS_THRESHOLD: NumberIO,
            MOVING_IN_PROPORTION_FITNESS_THRESHOLD: NumberIO,
            SHIFT_KEY_MULTIPLIER: NumberIO,
            TOTAL_RATIO_TERM_VALUE_RANGE: Range.RangeIO,
            NO_SUCCESS_VALUE_THRESHOLD: NumberIO,
            QUERY_PARAMETERS: ObjectLiteralIO
          }
        } ),
        phetioState: true
      }
    );
  }

  public toStateObject(): RAPConstantsState {
    return {
      SCREEN_VIEW_X_MARGIN: this.SCREEN_VIEW_X_MARGIN,
      SCREEN_VIEW_Y_MARGIN: this.SCREEN_VIEW_Y_MARGIN,
      RATIO_FITNESS_RANGE: Range.RangeIO.toStateObject( this.RATIO_FITNESS_RANGE ),
      IN_PROPORTION_FITNESS_THRESHOLD: this.IN_PROPORTION_FITNESS_THRESHOLD,
      MOVING_IN_PROPORTION_FITNESS_THRESHOLD: this.MOVING_IN_PROPORTION_FITNESS_THRESHOLD,
      SHIFT_KEY_MULTIPLIER: this.SHIFT_KEY_MULTIPLIER,
      TOTAL_RATIO_TERM_VALUE_RANGE: Range.RangeIO.toStateObject( this.TOTAL_RATIO_TERM_VALUE_RANGE ),
      NO_SUCCESS_VALUE_THRESHOLD: this.NO_SUCCESS_VALUE_THRESHOLD,
      QUERY_PARAMETERS: this.QUERY_PARAMETERS
    };
  }
}

const rapConstants = new RAPConstants();

assert && assert( rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.min === 0 && rapConstants.TOTAL_RATIO_TERM_VALUE_RANGE.max === 1,
  'There are assumptions in the model about ratio terms being normalized, see RAPModel.calculateFitness() before changing and proceed with caution' );

ratioAndProportion.register( 'rapConstants', rapConstants );
export default rapConstants;