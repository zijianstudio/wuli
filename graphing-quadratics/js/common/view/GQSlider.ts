// Copyright 2018-2023, University of Colorado Boulder

/**
 * GQSlider is the base type for sliders in this sim. It adds the following features to VSlider:
 *
 * - snap to interval (see interval)
 * - snap to zero (see snapToZero)
 * - skip zero (see skipZero)
 * - change the taper (see map and inverseMap)
 * - a label about the slider
 *
 * @author Andrea Lin
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import { RichText, TColor, Text } from '../../../../scenery/js/imports.js';
import VSlider, { VSliderOptions } from '../../../../sun/js/VSlider.js';
import graphingQuadratics from '../../graphingQuadratics.js';
import GQConstants from '../GQConstants.js';

type TransformFunction = ( value: number ) => number;

const IDENTITY_FUNCTION: TransformFunction = value => value;
const DEFAULT_TICK_VALUES = [ 0 ];
const DEFAULT_TRACK_SIZE = new Dimension2( 1, 130 );
const DEFAULT_THUMB_SIZE = new Dimension2( 40, 20 );

type SelfOptions = {

  // maps from model to view (coefficientProperty to sliderProperty)
  map?: TransformFunction;

  // maps from view to model (sliderProperty to coefficientProperty)
  inverseMap?: TransformFunction;

  // coefficientProperty.value will be set to a multiple of this value, in model coordinates
  interval?: number;

  // whether to skip zero value
  skipZero?: boolean;

  // whether to snap to zero when the drag ends
  snapToZero?: boolean;

  // Snap to zero when this close to zero. Ignored if snapToZero:false.
  // Must be >= options.interval, and defaults to options.interval
  snapToZeroEpsilon?: number;

  // model values where major tick marks will be placed
  tickValues?: number[] | null;

  // color of the label that appears above the slider
  labelColor?: TColor;
};

export type GQSliderOptions = SelfOptions &
  StrictOmit<VSliderOptions, 'majorTickLength' | 'constrainValue' | 'endDrag'> &
  PickRequired<VSliderOptions, 'tandem'>;

export default class GQSlider extends VSlider {

  /**
   * @param symbol - the coefficient's symbol
   * @param coefficientProperty - the coefficient's value
   * @param [providedOptions]
   */
  public constructor( symbol: string, coefficientProperty: NumberProperty, providedOptions: GQSliderOptions ) {

    const options = optionize<GQSliderOptions, StrictOmit<SelfOptions, 'snapToZeroEpsilon'>, VSliderOptions>()( {

      // SelfOptions
      map: IDENTITY_FUNCTION,
      inverseMap: IDENTITY_FUNCTION,
      interval: 1,
      skipZero: false,
      snapToZero: true,
      tickValues: DEFAULT_TICK_VALUES,
      labelColor: 'black',

      // SliderOptions
      trackSize: DEFAULT_TRACK_SIZE,
      thumbSize: DEFAULT_THUMB_SIZE,
      thumbTouchAreaXDilation: 8,

      // The slider controls an intermediate DynamicProperty, so link to the relevant model Property.
      phetioLinkedProperty: coefficientProperty
    }, providedOptions );

    assert && assert( options.interval > 0, `invalid interval: ${options.interval}` );

    // default and validation for snapToZeroEpsilon
    let snapToZeroEpsilon: number;
    if ( options.snapToZero ) {
      if ( options.snapToZeroEpsilon === undefined ) {
        snapToZeroEpsilon = options.interval;
      }
      else {
        snapToZeroEpsilon = options.snapToZeroEpsilon;
      }
      assert && assert( ( snapToZeroEpsilon >= 0 ) && ( snapToZeroEpsilon >= options.interval ),
        `invalid snapToZeroEpsilon: ${snapToZeroEpsilon}` );
    }

    // make tick mark lines extend past the thumb
    const thumbSize = options.thumbSize!;
    assert && assert( thumbSize );
    options.majorTickLength = ( thumbSize.width / 2 ) + 3;

    // apply constrains to the view value
    options.constrainValue = viewValue => {

      if ( options.skipZero ) {

        // map from view to model
        const newModelValue = options.inverseMap( viewValue );

        // skip zero
        if ( Math.abs( newModelValue ) < options.interval ) {
          return options.map( ( newModelValue > 0 ) ? options.interval : -options.interval );
        }
      }

      // no constraint applied
      return viewValue;
    };

    // snap to zero when the drag ends
    if ( !options.skipZero && options.snapToZero ) {
      options.endDrag = () => {
        if ( ( Math.abs( coefficientProperty.value ) < snapToZeroEpsilon ) ) {
          coefficientProperty.value = 0;
        }
      };
    }

    // Map between model and view domains, determines how the slider responds.
    // Do not instrument for PhET-iO, see https://github.com/phetsims/phet-io/issues/1374
    const sliderProperty = new DynamicProperty( new Property( coefficientProperty ), {

      bidirectional: true,

      // map from model to view (coefficientProperty to sliderProperty)
      map: ( value: number ) => options.map( value ),

      // map from view to model (sliderProperty to coefficientProperty), apply options.interval to model value
      inverseMap: ( value: number ) => Utils.roundToInterval( options.inverseMap( value ), options.interval )
    } );

    // Convert the range from model to view
    const sliderRange = new Range(
      options.map( coefficientProperty.range.min ),
      options.map( coefficientProperty.range.max )
    );

    super( sliderProperty, sliderRange, options );

    // Create the tick labels
    if ( options.tickValues ) {
      options.tickValues.forEach( tickValue => {
        this.addMajorTick( options.map( tickValue ), new Text( tickValue, {
          font: GQConstants.SLIDER_TICK_LABEL_FONT
        } ) );
      } );
    }

    // Label that appears above the slider.
    const label = new RichText( symbol, {
      font: GQConstants.SLIDER_LABEL_FONT,
      fill: options.labelColor,
      centerX: this.x,
      bottom: this.top - 2,
      maxWidth: 20, // determined empirically
      tandem: options.tandem.createTandem( 'labelText' ),
      phetioDocumentation: 'the label above this slider'
    } );
    this.addChild( label );
  }
}

graphingQuadratics.register( 'GQSlider', GQSlider );