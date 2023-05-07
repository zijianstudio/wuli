// Copyright 2023, University of Colorado Boulder

/**
 * Transforms the model space to view space. The view space is a rectangular area within the ScreenView
 * and has predetermined dimensions. This transform is a rectangular, inverted mapping with the model origin
 * in the center of the view rectangle.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import quadrilateral from '../../quadrilateral.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';

// dimensions of the view space, relative to ScreenView layoutBounds
const VIEW_DIMENSION = new Dimension2( 790, 530 );

export default class QuadrilateralModelViewTransform2 extends ModelViewTransform2 {
  public constructor( modelBounds: Bounds2, layoutBounds: Bounds2 ) {
    super();

    // produce square bounds for the transform so that the transform is the same in both X and Y dimensions
    const minViewX = QuadrilateralConstants.SCREEN_VIEW_X_MARGIN;
    const maxViewX = minViewX + VIEW_DIMENSION.width;
    const maxViewY = layoutBounds.maxY - QuadrilateralConstants.SCREEN_VIEW_Y_MARGIN;
    const minViewY = maxViewY - VIEW_DIMENSION.height;
    const viewCenterX = ( minViewX + maxViewX ) / 2;
    const viewCenterY = ( minViewY + maxViewY ) / 2;

    // Height is used to produce square bounds for the transform because bounds are wider than they are tall. We need
    // square bounds so that scale for X and Y dimensions are the same.
    const availableViewHeight = maxViewY - minViewY;
    const availableModelHeight = modelBounds.height;

    const viewBoundsForTransform = new Bounds2(
      viewCenterX - availableViewHeight / 2,
      viewCenterY - availableViewHeight / 2,
      viewCenterX + availableViewHeight / 2,
      viewCenterY + availableViewHeight / 2
    );

    const modelBoundsForTransform = new Bounds2(
      -availableModelHeight / 2,
      -availableModelHeight / 2,
      availableModelHeight / 2,
      availableModelHeight / 2
    );

    this.setToRectangleInvertedYMapping( modelBoundsForTransform, viewBoundsForTransform );
  }
}

quadrilateral.register( 'QuadrilateralModelViewTransform2', QuadrilateralModelViewTransform2 );
