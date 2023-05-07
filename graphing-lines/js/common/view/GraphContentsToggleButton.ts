// Copyright 2018-2023, University of Colorado Boulder

/**
 * Button used to show/hide the contents of the graph.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';
import EyeToggleButton, { EyeToggleButtonOptions } from '../../../../scenery-phet/js/buttons/EyeToggleButton.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import { NodeTranslationOptions, TColor } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';

type SelfOptions = {
  trueColor?: TColor; // button color when property.value === true
  falseColor?: TColor;  // button color when property.value === false
};

type GraphContentsToggleButtonOptions = SelfOptions & NodeTranslationOptions &
  PickOptional<EyeToggleButtonOptions, 'tandem' | 'phetioDocumentation'>;

export default class GraphContentsToggleButton extends EyeToggleButton {

  public constructor( property: Property<boolean>, providedOptions?: GraphContentsToggleButtonOptions ) {

    const options = optionize<GraphContentsToggleButtonOptions, SelfOptions, EyeToggleButtonOptions>()( {

      // SelfOptions
      trueColor: 'white',
      falseColor: PhetColorScheme.BUTTON_YELLOW,

      // EyeToggleButtonOptions
      scale: 0.75
    }, providedOptions );

    super( property, options );

    // Change the button color to emphasize when the graph contents are hidden.
    property.link( visible => {
      this.setBaseColor( visible ? options.trueColor : options.falseColor );
    } );
  }
}

graphingLines.register( 'GraphContentsToggleButton', GraphContentsToggleButton );