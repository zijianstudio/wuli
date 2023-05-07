// Copyright 2017-2022, University of Colorado Boulder

/**
 * Grid that shows the possible positions of where the objects can be in the play area. For several
 * sims that use inverse-square-law-common, objects are constrained to positions along a 2D grid.
 * This node should only be used for debugging and will be hidden behind query parameter "showGrid".
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import { Path } from '../../../scenery/js/imports.js';
import inverseSquareLawCommon from '../inverseSquareLawCommon.js';

class ISLCGridNode extends Path {

  /**
   * @param {number} deltaX - position step for the object in model coordinates
   * @param {Bounds2} layoutBounds - layout bounds of the ScreenView
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( deltaX, layoutBounds, modelViewTransform, options ) {

    options = merge( {
      stroke: 'rgba( 0, 0, 0, 0.6 )'
    }, options );

    const gridShape = new Shape();

    // subtract 1 so grid aligns with model, see https://github.com/phetsims/inverse-square-law-common/issues/49
    let gridPosition = modelViewTransform.viewToModelX( layoutBounds.minX - 1 );
    const rightBoundary = modelViewTransform.viewToModelX( layoutBounds.maxX );
    while ( gridPosition <= rightBoundary ) {

      // grid position in view coords
      const viewPosition = modelViewTransform.modelToViewX( gridPosition );

      // draw the grid line
      gridShape.moveTo( viewPosition, layoutBounds.top );
      gridShape.lineTo( viewPosition, layoutBounds.bottom );

      // move to the next position
      gridPosition += deltaX;
    }

    super( gridShape, {
      stroke: options.stroke,
      lineWidth: 1
    } );
  }
}

inverseSquareLawCommon.register( 'ISLCGridNode', ISLCGridNode );

export default ISLCGridNode;