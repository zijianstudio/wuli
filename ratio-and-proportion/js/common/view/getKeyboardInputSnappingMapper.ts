// Copyright 2020-2022, University of Colorado Boulder

/**
 * Handle keyboard input in a consistent way across all usages of keyboard input to the ratio. This function creates and returns a
 * function that is responsible for making sure that keyboard input snaps to the in-proportion value if it would pass over it.
 * In some cases of targetProperty, the default keyboard steps are not granular enough to achieve the in-proportion state with keyboard
 * input. This function will map those keyboard steps to exact, in-proportion values while conserving the same number keypresses to get
 * in between tick marks for consistent UX.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import ratioAndProportion from '../../ratioAndProportion.js';
import rapConstants from '../rapConstants.js';

// a function that returns the snap/conserved value
type KeyboardInputMapper = {
  ( newValue: number, oldVaue: number, useShiftKeyStep: boolean, alreadyInProportion: boolean ): number;
  reset: () => void;
};


/**
 * @param getIdealValue - get the ideal target value
 * @param keyboardStep
 * @param shiftKeyboardStep
 */
function getKeyboardInputSnappingMapper( getIdealValue: () => number, keyboardStep: number, shiftKeyboardStep: number ): KeyboardInputMapper {

  // keep track of the remainder for next input post-process
  let remainder = 0;

  const snappingFunction: KeyboardInputMapper = ( newValue, oldValue, useShiftKeyStep, alreadyInProportion ) => {
    // Don't conserve the snap for page up/down or home/end keys, just basic movement changes.
    const applyConservationSnap = rapConstants.toFixed( Math.abs( newValue - oldValue ) ) <= shiftKeyboardStep && // eslint-disable-line bad-sim-text
                                  newValue > rapConstants.NO_SUCCESS_VALUE_THRESHOLD &&
                                  oldValue > rapConstants.NO_SUCCESS_VALUE_THRESHOLD;


    // Default case if there is no saved remainder, then just step normally.
    if ( remainder === 0 ) {
      const snapToKeyboardStep = useShiftKeyStep ? shiftKeyboardStep : keyboardStep;
      newValue = rapConstants.toFixed( // eslint-disable-line bad-sim-text
        Utils.roundSymmetric( newValue / snapToKeyboardStep ) * snapToKeyboardStep );
    }

    // If we are in the case where we want to potentially snap to the value that would yield the in-proportion state.
    // No need to do this if we are already in Proportion. Skip if already in proportion without a snapped remainder.
    if ( applyConservationSnap && !( alreadyInProportion && remainder === 0 ) ) {

      let returnValue = newValue;
      const target = getIdealValue();
      if ( newValue > target !== oldValue > target && oldValue !== target ) {
        remainder = newValue - target;
        returnValue = target;
      }

      else if ( remainder !== 0 ) {
        newValue = newValue + remainder;
        remainder = 0;
        returnValue = newValue;
      }

      assert && assert( !isNaN( returnValue ) );

      return returnValue;
    }
    return newValue;
  };

  snappingFunction.reset = () => { remainder = 0; };

  return snappingFunction;
}

ratioAndProportion.register( 'getKeyboardInputSnappingMapper', getKeyboardInputSnappingMapper );
export type { KeyboardInputMapper };
export default getKeyboardInputSnappingMapper;