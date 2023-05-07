// Copyright 2022, University of Colorado Boulder

/**
 * PHSpinnerNode is the spinner used to change the pH value, on the pH meter in the 'My Solution' screen.
 */

import Property from '../../../../axon/js/Property.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import NumberSpinner, { NumberSpinnerOptions } from '../../../../sun/js/NumberSpinner.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Utils from '../../../../dot/js/Utils.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';

type SelfOptions = EmptySelfOptions;

type PHSpinnerNodeOptions = SelfOptions & PickRequired<NumberSpinnerOptions, 'tandem'>;

export class PHSpinnerNode extends NumberSpinner {

  public constructor( pHProperty: Property<number>, providedOptions: PHSpinnerNodeOptions ) {

    const pHDelta = 1 / Math.pow( 10, PHScaleConstants.PH_METER_DECIMAL_PLACES );

    // When using the spinner to change pH, constrain pHProperty to be exactly the value displayed by the spinner.
    // See https://github.com/phetsims/ph-scale/issues/143
    const incrementFunction = ( value: number ) => {
      value = Utils.toFixedNumber( value, PHScaleConstants.PH_METER_DECIMAL_PLACES );
      return Utils.toFixedNumber( value + pHDelta, PHScaleConstants.PH_METER_DECIMAL_PLACES );
    };

    const decrementFunction = ( value: number ) => {
      value = Utils.toFixedNumber( value, PHScaleConstants.PH_METER_DECIMAL_PLACES );
      return Utils.toFixedNumber( value - pHDelta, PHScaleConstants.PH_METER_DECIMAL_PLACES );
    };

    const options = optionize<PHSpinnerNodeOptions, SelfOptions, NumberSpinnerOptions>()( {

      // NumberSpinnerOptions
      incrementFunction: incrementFunction,
      decrementFunction: decrementFunction,
      numberDisplayOptions: {
        decimalPlaces: PHScaleConstants.PH_METER_DECIMAL_PLACES,
        xMargin: 10,
        yMargin: 4,
        cornerRadius: 8,
        backgroundStroke: 'darkGray',
        textOptions: {
          font: new PhetFont( 28 ),
          stringPropertyOptions: { phetioHighFrequency: true }
        }
      },
      arrowsScale: 1.5,
      xSpacing: 6,
      ySpacing: 4,
      touchAreaXDilation: 15,
      touchAreaYDilation: 2
    }, providedOptions );

    super( pHProperty, new Property( PHScaleConstants.PH_RANGE ), options );
  }
}