// Copyright 2021-2022, University of Colorado Boulder

/**
 * Class responsible for changing the background color based on fitness. It also contains the associated description
 * logic for describing the color.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ratioAndProportion from '../../ratioAndProportion.js';
import RatioAndProportionStrings from '../../RatioAndProportionStrings.js';
import Property from '../../../../axon/js/Property.js';
import rapConstants from '../rapConstants.js';
import RAPColors from './RAPColors.js';
import { Color } from '../../../../scenery/js/imports.js';
import Utils from '../../../../dot/js/Utils.js';
import RAPModel from '../model/RAPModel.js';
import Multilink from '../../../../axon/js/Multilink.js';

// constants
const BACKGROUND_COLOR_STRINGS = [
  RatioAndProportionStrings.a11y.backgroundColor.notGreenStringProperty,
  RatioAndProportionStrings.a11y.backgroundColor.lightestGreenStringProperty,
  RatioAndProportionStrings.a11y.backgroundColor.veryLightGreenStringProperty,
  RatioAndProportionStrings.a11y.backgroundColor.lightGreenStringProperty,
  RatioAndProportionStrings.a11y.backgroundColor.darkestGreenStringProperty
];

class BackgroundColorHandler {

  public constructor( model: RAPModel, backgroundColorProperty: Property<Color> ) {

    // adjust the background color based on the current ratio fitness
    Multilink.multilink( [
      model.ratioFitnessProperty,
      model.inProportionProperty
    ], ( fitness, inProportion ) => {
      let color = null;
      if ( inProportion ) {
        color = RAPColors.backgroundInFitnessProperty.value;
      }
      else {
        const interpolatedDistance = ( fitness - rapConstants.RATIO_FITNESS_RANGE.min ) / ( 1 - model.getInProportionThreshold() );
        color = Color.interpolateRGBA(
          RAPColors.backgroundOutOfFitnessProperty.value,
          RAPColors.backgroundInterpolationToFitnessProperty.value,
          Utils.clamp( interpolatedDistance, 0, 1 )
        );
      }

      backgroundColorProperty.value = color;
    } );

  }

  public static getCurrentColorRegion( fitness: number, inProportion: boolean ): string {
    if ( fitness === rapConstants.RATIO_FITNESS_RANGE.min ) {
      return BACKGROUND_COLOR_STRINGS[ 0 ].value;
    }
    if ( inProportion ) {
      return BACKGROUND_COLOR_STRINGS[ 4 ].value;
    }
    const numberOfRegionsLeft = ( BACKGROUND_COLOR_STRINGS.length - 2 );
    const interpolatedIndex = ( rapConstants.RATIO_FITNESS_RANGE.getLength() / numberOfRegionsLeft + fitness ) * numberOfRegionsLeft;
    const regionProperty = BACKGROUND_COLOR_STRINGS[ Math.floor( interpolatedIndex ) ];
    assert && assert( regionProperty, 'region expected' );
    return regionProperty.value;
  }
}

ratioAndProportion.register( 'BackgroundColorHandler', BackgroundColorHandler );
export default BackgroundColorHandler;