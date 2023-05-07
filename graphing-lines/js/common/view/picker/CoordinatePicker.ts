// Copyright 2013-2023, University of Colorado Boulder

/**
 * Picker for one coordinate of a 2D point.
 * It prevents the point from having the same value as some other point,
 * so that we don't end up with with an undefined line because (x1,y1) == (x2,y2).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../../../dot/js/Range.js';
import Property from '../../../../../axon/js/Property.js';
import NumberPicker, { NumberPickerOptions } from '../../../../../sun/js/NumberPicker.js';
import graphingLines from '../../../graphingLines.js';
import GLConstants from '../../GLConstants.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import { EmptySelfOptions, optionize3 } from '../../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../../phet-core/js/types/PickRequired.js';

type SelfOptions = EmptySelfOptions;

type CoordinatePickerOptions = SelfOptions & PickRequired<NumberPickerOptions, 'font' | 'color'>;

export default class CoordinatePicker extends NumberPicker {

  /**
   * @param a1Property - the coordinate that this picker changes
   * @param b1Property - the other coordinate of the point that has coordinate a1Property
   * @param a2Property - the coordinate in the second point that is on the same axis as a1Property
   * @param b2Property - the coordinate in the second point that is on the same axis as b1Property
   * @param rangeProperty - the range of a1Property
   * @param providedOptions
   */
  public constructor( a1Property: Property<number>, b1Property: TReadOnlyProperty<number>,
                      a2Property: TReadOnlyProperty<number>, b2Property: TReadOnlyProperty<number>,
                      rangeProperty: TReadOnlyProperty<Range>, providedOptions: CoordinatePickerOptions ) {

    const options = optionize3<CoordinatePickerOptions, SelfOptions, NumberPickerOptions>()( {}, GLConstants.NUMBER_PICKER_OPTIONS, providedOptions );

    // computes value when 'up' button is pressed
    options.incrementFunction = a1 => {
      let x1New = a1 + 1;
      if ( x1New === a2Property.value && b1Property.value === b2Property.value ) { // will points be the same?
        x1New++;
        if ( x1New > rangeProperty.value.max ) { // did we skip too far?
          x1New = a1;
        }
      }
      return x1New;
    };

    // computes value when 'down' button is pressed
    options.decrementFunction = a1 => {
      let x1New = a1 - 1;
      if ( x1New === a2Property.value && b1Property.value === b2Property.value ) { // will points be the same?
        x1New--;
        if ( x1New < rangeProperty.value.min ) { // did we skip too far?
          x1New = a1;
        }
      }
      return x1New;
    };

    super( a1Property, rangeProperty, options );
  }
}

graphingLines.register( 'CoordinatePicker', CoordinatePicker );