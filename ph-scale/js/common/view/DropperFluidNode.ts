// Copyright 2013-2023, University of Colorado Boulder

/**
 * Fluid (stock solution) coming out of the dropper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import { Rectangle, RectangleOptions } from '../../../../scenery/js/imports.js';
import phScale from '../../phScale.js';
import Beaker from '../model/Beaker.js';
import Dropper from '../model/Dropper.js';

type SelfOptions = EmptySelfOptions;

type DropperFluidNodeOptions = SelfOptions & PickRequired<RectangleOptions, 'visibleProperty'>;

export default class DropperFluidNode extends Rectangle {

  public constructor( dropper: Dropper, beaker: Beaker, tipWidth: number, modelViewTransform: ModelViewTransform2,
                      providedOptions: DropperFluidNodeOptions ) {

    super( 0, 0, 0, 0, providedOptions );

    const updateShapeAndPosition = () => {

      // shape
      if ( dropper.flowRateProperty.value > 0 ) {
        this.setRect( -tipWidth / 2, 0, tipWidth, beaker.position.y - dropper.position.y );
      }
      else {
        this.setRect( 0, 0, 0, 0 );
      }

      // move this node to the dropper's position
      this.translation = modelViewTransform.modelToViewPosition( dropper.position );
    };
    dropper.flowRateProperty.link( updateShapeAndPosition );

    // set color to match solute
    dropper.soluteProperty.link( solute => {
      this.fill = solute.stockColor;
      this.stroke = solute.stockColor.darkerColor();
    } );
  }
}

phScale.register( 'DropperFluidNode', DropperFluidNode );