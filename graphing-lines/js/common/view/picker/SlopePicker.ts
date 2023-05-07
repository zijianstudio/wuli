// Copyright 2013-2023, University of Colorado Boulder

/**
 * Picker for changing a component of slope.
 * Avoids creating an undefined line with slope=0/0.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../../dot/js/Range.js';
import Property from '../../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import PickOptional from '../../../../../phet-core/js/types/PickOptional.js';
import NumberPicker, { NumberPickerOptions } from '../../../../../sun/js/NumberPicker.js';
import graphingLines from '../../../graphingLines.js';
import GLColors from '../../GLColors.js';
import GLConstants from '../../GLConstants.js';
import { EmptySelfOptions, optionize4 } from '../../../../../phet-core/js/optionize.js';

type SelfOptions = EmptySelfOptions;

type SlopePickerOptions = SelfOptions & PickOptional<NumberPickerOptions, 'font' | 'color' | 'decimalPlaces'>;

export default class SlopePicker extends NumberPicker {

  /**
   * @param variableComponentProperty - the part of the slope we're manipulating
   * @param fixedComponentProperty - the part of the slope we're not manipulating
   * @param variableRangeProperty - the range of variableComponentProperty
   * @param [providedOptions]
   */
  public constructor( variableComponentProperty: Property<number>,
                      fixedComponentProperty: TReadOnlyProperty<number>,
                      variableRangeProperty: TReadOnlyProperty<Range>,
                      providedOptions?: SlopePickerOptions ) {

    const options = optionize4<SlopePickerOptions, SelfOptions, NumberPickerOptions>()( {}, GLConstants.NUMBER_PICKER_OPTIONS, {

      // NumberPickerOptions
      color: GLColors.SLOPE
    }, providedOptions );

    // increment function, skips over undefined line condition (slope=0/0) - not changeable by clients
    options.incrementFunction = variable => {
      return ( variable === -1 && fixedComponentProperty.value === 0 ) ? 1 : variable + 1;
    };

    // decrement function, skips over undefined line condition (slope=0/0) - not changeable by clients
    options.decrementFunction = variable => {
      return ( variable === 1 && fixedComponentProperty.value === 0 ) ? -1 : variable - 1;
    };

    super( variableComponentProperty, variableRangeProperty, options );
  }
}

graphingLines.register( 'SlopePicker', SlopePicker );