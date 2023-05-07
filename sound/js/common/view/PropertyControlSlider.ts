// Copyright 2022-2023, University of Colorado Boulder
/**
 * Slider that controls a given property, can display the current value and a title.
 *
 * @author Piet Goris (University of Leuven)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { NodeOptions, Text, VBox } from '../../../../scenery/js/imports.js';
import SoundSlider from '../../common/view/SoundSlider.js';
import sound from '../../sound.js';

type SelfOptions = { valueToText?: ( null | ( ( value: number ) => string ) ) };
type PropertyControlSliderOptions = SelfOptions & NodeOptions;

export default class PropertyControlSlider extends VBox {
  public constructor( titleString: TReadOnlyProperty<string>, property: NumberProperty, providedOptions?: PropertyControlSliderOptions ) {
    const options = optionize<PropertyControlSliderOptions, SelfOptions, NodeOptions>()( {
      valueToText: null
    }, providedOptions );

    const title = new Text( titleString );
    const valueDisplay = new Text( '' );

    const soundSlider = new SoundSlider( property );

    if ( options.valueToText ) {
      property.link( value => {
        valueDisplay.setString( options.valueToText!( value ) );
        valueDisplay.right = soundSlider.right;
      } );
    }

    super( {
      children: [ title,
        ...( options.valueToText ? [ valueDisplay ] : [] ),
        soundSlider ]
    } );
  }
}

sound.register( 'PropertyControlSlider', PropertyControlSlider );