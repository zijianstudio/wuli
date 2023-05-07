// Copyright 2022-2023, University of Colorado Boulder

/**
 * A grid for the play area, to make it easier to place Vertices in reproducible positions.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// constants
const MAJOR_GRID_LINE_OPTIONS = {
  stroke: QuadrilateralColors.gridLinesColorProperty,
  lineWidth: 2
};

const MINOR_GRID_LINE_OPTIONS = {
  stroke: QuadrilateralColors.gridLinesColorProperty,
  lineWidth: 0.5
};

const BORDER_RECTANGLE_LINE_WIDTH = 4;

export default class QuadrilateralGridNode extends Node {
  public constructor( visibleProperty: TReadOnlyProperty<boolean>, modelViewTransform: ModelViewTransform2 ) {
    super();

    // Rectangle showing available model bounds
    const boundsRectangle = new Rectangle( 0, 0, 0, 0, 5, 5, {
      stroke: QuadrilateralColors.gridStrokeColorProperty,
      fill: QuadrilateralColors.gridFillColorProperty,
      lineWidth: BORDER_RECTANGLE_LINE_WIDTH
    } );
    this.addChild( boundsRectangle );

    const majorGridLinePath = new Path( null, MAJOR_GRID_LINE_OPTIONS );
    const minorGridLinePath = new Path( null, MINOR_GRID_LINE_OPTIONS );

    const gridLines = new Node( {
      children: [ majorGridLinePath, minorGridLinePath ]
    } );
    this.addChild( gridLines );

    const lineShape = new Shape();

    // dilate just enough for the quadrilateral shape to never overlap the stroke
    const modelLineWidth = modelViewTransform.viewToModelDeltaX( BORDER_RECTANGLE_LINE_WIDTH );
    const dilatedBackgroundBounds = QuadrilateralConstants.MODEL_BOUNDS.dilated( modelLineWidth );

    // The grid lines are a different color so they cannot overlap the background rectangle stroke (but should
    // be flush up against it).
    const dilatedGridBounds = QuadrilateralConstants.MODEL_BOUNDS.dilated( modelLineWidth / 2 );

    boundsRectangle.setRectBounds( modelViewTransform.modelToViewBounds( dilatedBackgroundBounds ) );

    this.drawVerticalLines( lineShape, dilatedGridBounds, QuadrilateralConstants.GRID_SPACING );
    this.drawHorizontalLines( lineShape, dilatedGridBounds, QuadrilateralConstants.GRID_SPACING );
    majorGridLinePath.shape = modelViewTransform.modelToViewShape( lineShape );

    const minorDebugShape = new Shape();
    this.drawVerticalLines( minorDebugShape, dilatedGridBounds, QuadrilateralQueryParameters.minorVertexInterval );
    this.drawHorizontalLines( minorDebugShape, dilatedGridBounds, QuadrilateralQueryParameters.minorVertexInterval );
    minorGridLinePath.shape = modelViewTransform.modelToViewShape( minorDebugShape );

    visibleProperty.link( visible => { gridLines.visible = visible; } );
  }

  /**
   * Draw vertical grid lines for this grid.
   * @param shape - lines will be drawn on this shape
   * @param bounds - bounds for the grid lines
   * @param spacing
   */
  private drawVerticalLines( shape: Shape, bounds: Bounds2, spacing: number ): void {

    // Starting at the origin draw horizontal lines up and down the bounds
    let y = 0;
    shape.moveTo( -bounds.width / 2, y ).lineTo( bounds.width / 2, y );
    while ( y < bounds.height / 2 ) {
      shape.moveTo( -bounds.width / 2, y ).lineTo( bounds.width / 2, y );
      shape.moveTo( -bounds.width / 2, -y ).lineTo( bounds.width / 2, -y );
      y = y + spacing;
    }
  }

  /**
   * Draw horizontal grid lines for this grid.
   * @param shape - lines will be drawn on this shape
   * @param bounds - bounds for the grid lines
   * @param spacing
   */
  private drawHorizontalLines( shape: Shape, bounds: Bounds2, spacing: number ): void {

    // Starting at the origin draw vertical lines across the bounds
    let x = 0;
    shape.moveTo( x, -bounds.height / 2 ).lineTo( x, bounds.height / 2 );
    while ( x < bounds.width / 2 ) {
      shape.moveTo( x, -bounds.height / 2 ).lineTo( x, bounds.height / 2 );
      shape.moveTo( -x, -bounds.height / 2 ).lineTo( -x, bounds.height / 2 );
      x = x + spacing;
    }
  }
}

quadrilateral.register( 'QuadrilateralGridNode', QuadrilateralGridNode );
