// Copyright 2014-2022, University of Colorado Boulder

/**
 * FlashlightWithButtonNode - for Single Bulb Screen flashlight
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import { Image, Node } from '../../../../scenery/js/imports.js';
import BooleanRoundStickyToggleButton from '../../../../sun/js/buttons/BooleanRoundStickyToggleButton.js';
import flashlight0Deg_png from '../../../images/flashlight0Deg_png.js';
import colorVision from '../../colorVision.js';

class FlashlightWithButtonNode extends Node {

  /**
   * @param {Property.<boolean>} onProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( onProperty, tandem, options ) {

    super();

    const flashlightNode = new Image( flashlight0Deg_png, { scale: 0.85 } );

    const button = new BooleanRoundStickyToggleButton( onProperty, {
      centerY: flashlightNode.centerY,
      centerX: flashlightNode.centerX + 15,
      baseColor: 'red',
      radius: 15,
      tandem: tandem.createTandem( 'button' )
    } );

    this.addChild( flashlightNode );
    this.addChild( button );
    this.mutate( options );
  }
}

colorVision.register( 'FlashlightWithButtonNode', FlashlightWithButtonNode );

export default FlashlightWithButtonNode;