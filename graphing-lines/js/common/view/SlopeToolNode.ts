// Copyright 2013-2023, University of Colorado Boulder

/**
 * Slope indicator that the design team referred to as the 'slope tool'.
 * It displays the rise and run values of the slope.
 * Drawn in the global coordinate frame of the view.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import GLColors from '../GLColors.js';
import Line from '../model/Line.js';
import DimensionalArrowNode from './DimensionalArrowNode.js';
import NumberBackgroundNode from './NumberBackgroundNode.js';

// constants
const VALUE_X_SPACING = 6;
const VALUE_Y_SPACING = 6;
const NUMBER_BACKGROUND_NODE_OPTIONS = {
  font: new PhetFont( { size: 16, weight: 'bold' } ),
  decimalPlaces: 0,
  textFill: 'black',
  backgroundFill: GLColors.SLOPE,
  xMargin: 6,
  yMargin: 6,
  cornerRadius: 5
};

export default class SlopeToolNode extends Node {

  private readonly riseProperty: Property<number>;
  private readonly runProperty: Property<number>;
  private readonly riseValueNode: NumberBackgroundNode;
  private readonly runValueNode: NumberBackgroundNode;
  private readonly riseArrowNode: DimensionalArrowNode;
  private readonly runArrowNode: DimensionalArrowNode;
  private readonly parentNode: Node;

  private readonly disposeSlopeToolNode: () => void;

  public constructor( lineProperty: TReadOnlyProperty<Line>, modelViewTransform: ModelViewTransform2 ) {

    super();

    this.runProperty = new NumberProperty( lineProperty.value.run );
    this.riseProperty = new NumberProperty( lineProperty.value.rise );

    this.riseValueNode = new NumberBackgroundNode( this.riseProperty, NUMBER_BACKGROUND_NODE_OPTIONS );
    this.runValueNode = new NumberBackgroundNode( this.runProperty, NUMBER_BACKGROUND_NODE_OPTIONS );

    // Arrows
    const arrowNodeOptions = {
      lineWidth: 1.75,
      stroke: GLColors.SLOPE_TOOL_DIMENSIONAL_LINES,
      arrowTipSize: new Dimension2( 10, 10 ),
      delimiterLength: 0.5 * modelViewTransform.modelToViewDeltaX( 1 ) // half of one cell in the graph
    };
    this.riseArrowNode = new DimensionalArrowNode( 0, 0, 0, 50, arrowNodeOptions );
    this.runArrowNode = new DimensionalArrowNode( 0, 0, 0, 50, arrowNodeOptions );

    // Put all nodes under a common parent, so we can hide for zero or undefined slopes
    this.parentNode = new Node( {
      children: [
        this.riseArrowNode,
        this.riseValueNode,
        this.runArrowNode,
        this.runValueNode
      ]
    } );
    this.addChild( this.parentNode );

    const lineObserver = ( line: Line ) => this.update( line, modelViewTransform );
    lineProperty.link( lineObserver ); // unlink in dispose

    // Update when this Node becomes visible
    this.visibleProperty.link( visible => visible && this.update( lineProperty.value, modelViewTransform ) );

    this.disposeSlopeToolNode = () => {
      this.riseValueNode.dispose();
      this.runValueNode.dispose();
      lineProperty.unlink( lineObserver );
    };
  }

  public override dispose(): void {
    this.disposeSlopeToolNode();
    super.dispose();
  }

  private update( line: Line, modelViewTransform: ModelViewTransform2 ): void {

    // update only if visible
    if ( !this.visible ) { return; }

    // Show nothing for horizontal or vertical lines.
    this.parentNode.visible = ( line.rise !== 0 && line.run !== 0 );
    if ( !this.parentNode.visible ) {
      return;
    }

    // update internal properties before doing any layout
    this.riseProperty.value = line.rise;
    this.runProperty.value = line.run;

    // compute view coordinates
    const gridXSpacing = modelViewTransform.modelToViewDeltaX( 1 );
    const gridYSpacing = modelViewTransform.modelToViewDeltaY( 1 );
    const x1 = modelViewTransform.modelToViewX( line.x1 );
    const y1 = modelViewTransform.modelToViewY( line.y1 );
    const x2 = modelViewTransform.modelToViewX( line.x2 );
    const y2 = modelViewTransform.modelToViewY( line.y2 );

    // rise
    const offsetFactor = 0.6;
    const xOffset = offsetFactor * gridXSpacing;
    if ( line.run > 0 ) {
      // vertical arrow to left of point
      this.riseArrowNode.setTailAndTip( x1 - xOffset, y1, x1 - xOffset, y2 );
      // value to left of arrow
      this.riseValueNode.right = this.riseArrowNode.left - VALUE_X_SPACING;
      this.riseValueNode.centerY = this.riseArrowNode.centerY;
    }
    else {
      // vertical arrow to right of point
      this.riseArrowNode.setTailAndTip( x1 + xOffset, y1, x1 + xOffset, y2 );
      // value to right of arrow
      this.riseValueNode.left = this.riseArrowNode.right + VALUE_X_SPACING;
      this.riseValueNode.centerY = this.riseArrowNode.centerY;
    }

    // run
    const yOffset = offsetFactor * gridYSpacing;
    if ( line.rise > 0 ) {
      // horizontal arrow below point
      this.runArrowNode.setTailAndTip( x1, y2 + yOffset, x2, y2 + yOffset );
      // value above arrow
      this.runValueNode.centerX = this.runArrowNode.centerX;
      this.runValueNode.bottom = this.runArrowNode.top - VALUE_Y_SPACING;
    }
    else {
      // horizontal arrow above point
      this.runArrowNode.setTailAndTip( x1, y2 - yOffset, x2, y2 - yOffset );
      // value below arrow
      this.runValueNode.centerX = this.runArrowNode.centerX;
      this.runValueNode.top = this.runArrowNode.bottom + VALUE_Y_SPACING;
    }
  }
}

graphingLines.register( 'SlopeToolNode', SlopeToolNode );