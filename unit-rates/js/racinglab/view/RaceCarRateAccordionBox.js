// Copyright 2017-2023, University of Colorado Boulder

/**
 * Control for setting the rate of the race car.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import URConstants from '../../common/URConstants.js';
import RateAccordionBox from '../../common/view/RateAccordionBox.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';

export default class RaceCarRateAccordionBox extends RateAccordionBox {

  /**
   * @param {RaceCar} car
   * @param {Object} [options]
   */
  constructor( car, options ) {

    options = merge( {
      numeratorUnits: UnitRatesStrings.miles,
      denominatorUnits: UnitRatesStrings.hours,
      numeratorRange: URConstants.MILES_RANGE,
      denominatorRange: URConstants.HOURS_RANGE,
      numeratorPickerColor: car.color,
      denominatorPickerColor: car.color,
      numeratorPickerIncrementFunction: miles => ( miles + URConstants.MILES_DELTA ),
      numeratorPickerDecrementFunction: miles => ( miles - URConstants.MILES_DELTA ),
      denominatorPickerIncrementFunction: value => ( value + URConstants.HOURS_DELTA ),
      denominatorPickerDecrementFunction: value => ( value - URConstants.HOURS_DELTA ),
      denominatorDecimals: URConstants.HOURS_DECIMALS,
      pickerFont: new PhetFont( 20 )
    }, options );

    super( car.rate, options );
  }
}

unitRates.register( 'RaceCarRateAccordionBox', RaceCarRateAccordionBox );