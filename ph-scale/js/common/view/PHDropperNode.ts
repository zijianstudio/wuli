// Copyright 2013-2023, University of Colorado Boulder

/**
 * Dropper that contains a solute in solution form.
 * Origin is at the center of the hole where solution comes out of the dropper (bottom center).
 * Optionally displays the pH value on the dropper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import EyeDropperNode, { EyeDropperNodeOptions } from '../../../../scenery-phet/js/EyeDropperNode.js';
import phScale from '../../phScale.js';
import Dropper from '../model/Dropper.js';

type SelfOptions = EmptySelfOptions;

type PHDropperNodeOptions = SelfOptions & PickRequired<EyeDropperNodeOptions, 'tandem' | 'visibleProperty'>;

export default class PHDropperNode extends EyeDropperNode {

  public constructor( dropper: Dropper, modelViewTransform: ModelViewTransform2, providedOptions: PHDropperNodeOptions ) {

    const options = optionize<PHDropperNodeOptions, SelfOptions, EyeDropperNodeOptions>()( {

      // EyeDropperNodeOptions
      isDispensingProperty: dropper.isDispensingProperty,
      buttonOptions: {
        enabledProperty: dropper.enabledProperty
      },
      cursor: null,
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions );

    super( options );

    // position
    this.translation = modelViewTransform.modelToViewPosition( dropper.position );

    // change fluid color when the solute changes
    dropper.soluteProperty.link( solute => {
      this.setFluidColor( solute.stockColor );
    } );
  }
}

phScale.register( 'PHDropperNode', PHDropperNode );