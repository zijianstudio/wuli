// Copyright 2013-2022, University of Colorado Boulder

/**
 * Fluid coming out of a faucet.
 * Origin is at the top center, to simplify alignment with the center of the faucet's spout.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Color, Rectangle } from '../../../../scenery/js/imports.js';
import phScale from '../../phScale.js';
import Faucet from '../model/Faucet.js';

export default class FaucetFluidNode extends Rectangle {

  public constructor( faucet: Faucet, colorProperty: TReadOnlyProperty<Color>, height: number, modelViewTransform: ModelViewTransform2 ) {

    const options = {

      // RectangleOptions
      pickable: false

      // Do not instrument FaucetFluidNode, see https://github.com/phetsims/ph-scale/issues/107
    };

    super( 0, 0, 0, 0, options );

    // Set the color of the fluid coming out of the spout.
    colorProperty.link( color => {
      this.fill = color;
      this.stroke = color.darkerColor();
    } );

    // Set the width of the shape to match the flow rate.
    const viewPosition = modelViewTransform.modelToViewPosition( faucet.position );
    const viewHeight = modelViewTransform.modelToViewDeltaY( height );
    faucet.flowRateProperty.link( flowRate => {
      if ( flowRate === 0 ) {
        this.setRect( -1, -1, 0, 0 ); // empty rectangle, at a position where we won't intersect with it
      }
      else {
        const viewWidth = modelViewTransform.modelToViewDeltaX( faucet.spoutWidth * flowRate / faucet.maxFlowRate );
        this.setRect( viewPosition.x - ( viewWidth / 2 ), viewPosition.y, viewWidth, viewHeight );
      }
    } );
  }
}

phScale.register( 'FaucetFluidNode', FaucetFluidNode );