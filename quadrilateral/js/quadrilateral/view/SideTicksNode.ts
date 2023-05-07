// Copyright 2022-2023, University of Colorado Boulder

/**
 * The major and minor tick marks for the QuadrilateralSideNode, which make it easier to view relative side lengths.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../quadrilateral.js';
import { Path } from '../../../../scenery/js/imports.js';
import QuadrilateralSide from '../model/QuadrilateralSide.js';
import { Line, Shape } from '../../../../kite/js/imports.js';
import QuadrilateralColors from '../../QuadrilateralColors.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Vector2 from '../../../../dot/js/Vector2.js';

const TICKS_PER_SEGMENT = 4;

// relative to the full width of a QuadrilateralSide (normalized)
const PARAMETRIC_MINOR_TICK_LENGTH = 0.25;
const PARAMETRIC_MAJOR_TICK_LENGTH = 0.5;

// A line reused for drawing and finding points along a line at a parametric position. Avoids instantiating many Lines
// as we draw each tick mark.
const SCRATCH_LINE = new Line( new Vector2( 0, 0 ), new Vector2( 0, 0 ) );

export default class SideTicksNode extends Path {
  private readonly side: QuadrilateralSide;
  private readonly modelViewTransform: ModelViewTransform2;

  public constructor( side: QuadrilateralSide, modelViewTransform: ModelViewTransform2 ) {
    super( null, {
      stroke: QuadrilateralColors.quadrilateralShapeStrokeColorProperty
    } );

    this.side = side;
    this.modelViewTransform = modelViewTransform;
  }

  /**
   * Redraws tick marks along the outer edge of the QuadrilateralSide between its vertices.
   */
  public redraw(): void {
    const shape = new Shape();

    const fullLine = this.side.modelLineProperty.value;

    const segmentCount = this.side.lengthProperty.value / QuadrilateralSide.SIDE_SEGMENT_LENGTH;
    const parametricTickSeparation = 1 / ( segmentCount * TICKS_PER_SEGMENT );

    const outerLine = fullLine.strokeLeft( QuadrilateralSide.SIDE_WIDTH )[ 0 ];
    const innerLine = fullLine.strokeRight( QuadrilateralSide.SIDE_WIDTH )[ 0 ];

    // alternating major/minor tick marks, starting with major so they are on the segment end points and half
    let isMajor = true;

    for ( let t = 0; t < 1; t += parametricTickSeparation ) {
      SCRATCH_LINE.setStart( outerLine.positionAt( t ) );
      SCRATCH_LINE.setEnd( innerLine.positionAt( 1 - t ) ); // strokeRight swaps start and end position

      const parametricLength = isMajor ? PARAMETRIC_MAJOR_TICK_LENGTH : PARAMETRIC_MINOR_TICK_LENGTH;
      isMajor = !isMajor;

      shape.moveToPoint( SCRATCH_LINE.start );
      shape.lineToPoint( SCRATCH_LINE.positionAt( parametricLength ) );
    }

    this.shape = this.modelViewTransform.modelToViewShape( shape );
  }
}

quadrilateral.register( 'SideTicksNode', SideTicksNode );
