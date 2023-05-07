// Copyright 2013-2023, University of Colorado Boulder

/**
 * LineNode is the visual representation of a line.
 * By default, a line is not labeled with an equation. Clients are responsible for decorating the line
 * with an equation of the correct form (slope, slope-intercept, point-slope.) The line's equation is
 * positioned towards the tip, parallel with the line.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Line as SceneryLine, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import NotALine from '../../linegame/model/NotALine.js';
import Line from '../model/Line.js';
import Graph from '../model/Graph.js';

// constants
const HEAD_SIZE = new Dimension2( 10, 10 );
const TAIL_WIDTH = 3;
const LINE_EXTENT = 25; // how far the line extends past the grid
const EQUATION_FONT_SIZE = 18;

// Options for SCENERY_PHET/ArrowNode
const ARROW_NODE_OPTIONS = {
  doubleHead: true,
  tailWidth: TAIL_WIDTH,
  headWidth: HEAD_SIZE.width,
  headHeight: HEAD_SIZE.height,
  stroke: null
};

// Options for SCENERY/Line
const SCENERY_LINE_OPTIONS = {
  lineWidth: TAIL_WIDTH
};

// Options for SelfOptions.createDynamicLabel
export type CreateDynamicLabelOptions = {
  pickable?: boolean;
  interactivePoint?: boolean;
  interactiveSlope?: boolean;
  interactiveIntercept?: boolean;
  fontSize?: number;
  maxWidth?: number | null;
  slopeUndefinedVisible?: boolean;
};

export type CreateDynamicLabelFunction = ( lineProperty: Property<Line>, providedOptions?: CreateDynamicLabelOptions ) => Node;

type SelfOptions = {

  // Function for creating a dynamic label that updates as the line changes.
  createDynamicLabel?: CreateDynamicLabelFunction;

  // Whether the line has arrows on its ends.
  hasArrows?: boolean;
};

type LineNodeOptions = SelfOptions;

export default class LineNode extends Node {

  public readonly lineProperty: Property<Line>;
  private readonly graph: Graph;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly xExtent: number;
  private readonly yExtent: number;
  private readonly parentNode: Node; // parent of all children

  // One of these will be instantiated, based on the value of SelfOptions.hasArrows.
  private readonly arrowNode?: ArrowNode;
  private readonly lineNode?: SceneryLine;

  // optional equationNode and its parent.
  private readonly equationNode?: Node;
  private readonly equationParentNode?: Node;

  private readonly disposeLineNode: () => void;

  public constructor( lineProperty: Property<Line>,
                      graph: Graph,
                      modelViewTransform: ModelViewTransform2,
                      providedOptions?: LineNodeOptions ) {

    const options = optionize<LineNodeOptions, StrictOmit<SelfOptions, 'createDynamicLabel'>, NodeOptions>()( {

      // SelfOptions
      hasArrows: true
    }, providedOptions );

    super();

    this.lineProperty = lineProperty;
    this.graph = graph;
    this.modelViewTransform = modelViewTransform;
    this.xExtent = modelViewTransform.viewToModelDeltaX( LINE_EXTENT );
    this.yExtent = Math.abs( modelViewTransform.viewToModelDeltaY( LINE_EXTENT ) );

    this.parentNode = new Node();

    if ( options.hasArrows ) {
      this.arrowNode = new ArrowNode( 0, 0, 0, 1, ARROW_NODE_OPTIONS );
      this.parentNode.addChild( this.arrowNode );
    }
    else {
      this.lineNode = new SceneryLine( 0, 0, 0, 0, SCENERY_LINE_OPTIONS );
      this.parentNode.addChild( this.lineNode );
    }

    if ( options.createDynamicLabel ) {
      this.equationNode = options.createDynamicLabel( lineProperty, {
        fontSize: EQUATION_FONT_SIZE
      } );

      // Rotation is applied to equationParentNode. This makes positioning the equation a little easier to grok.
      this.equationParentNode = new Node( {
        children: [ this.equationNode ]
      } );
      this.parentNode.addChild( this.equationParentNode );
    }

    this.addChild( this.parentNode );

    const lineObserver = ( line: Line | NotALine ) => this.update( line );
    lineProperty.link( lineObserver ); // unlink in dispose

    this.disposeLineNode = () => {
      this.equationNode && this.equationNode.dispose();
      lineProperty.unlink( lineObserver );
    };
  }

  public override dispose(): void {
    this.disposeLineNode();
    super.dispose();
  }

  public setEquationVisible( visible: boolean ): void {
    assert && assert( this.equationParentNode );
    if ( this.equationParentNode ) {
      this.equationParentNode.visible = visible;
    }
  }

  // Updates the line and equation.
  private update( line: Line | NotALine ): void {

    // line may be NotALine, for example the user's guess in 'Place The Points' challenge
    const isALine = ( line instanceof Line );
    this.parentNode.visible = isALine;
    if ( !isALine ) { return; }

    // compute the new tip and tail for the line
    const xRange = this.graph.xRange;
    const yRange = this.graph.yRange;
    let tailX;
    let tailY;
    let tipX;
    let tipY;

    if ( line.run === 0 ) {
      // x = 0
      tailX = line.x1;
      tailY = yRange.max + this.yExtent;
      tipX = line.x1;
      tipY = yRange.min - this.yExtent;
    }
    else if ( line.rise === 0 ) {
      // y = b
      tailX = xRange.min - this.xExtent;
      tailY = line.y1;
      tipX = xRange.max + this.yExtent;
      tipY = line.y1;
    }
    else {
      // tail is the left-most end point. Compute x such that the point is inside the grid.
      tailX = xRange.min - this.xExtent;
      tailY = line.solveY( tailX );
      if ( tailY < yRange.min - this.yExtent ) {
        tailX = line.solveX( yRange.min - this.yExtent );
        tailY = line.solveY( tailX );
      }
      else if ( tailY > yRange.max + this.yExtent ) {
        tailX = line.solveX( yRange.max + this.yExtent );
        tailY = line.solveY( tailX );
      }

      // tip is the right-most end point. Compute x such that the point is inside the grid.
      tipX = xRange.max + this.xExtent;
      tipY = line.solveY( tipX );
      if ( tipY < yRange.min - this.yExtent ) {
        tipX = line.solveX( yRange.min - this.yExtent );
        tipY = line.solveY( tipX );
      }
      else if ( tipY > yRange.max + this.yExtent ) {
        tipX = line.solveX( yRange.max + this.yExtent );
        tipY = line.solveY( tipX );
      }
    }

    // line
    const tailPosition = this.modelViewTransform.modelToViewXY( tailX, tailY );
    const tipPosition = this.modelViewTransform.modelToViewXY( tipX, tipY );
    if ( this.arrowNode ) {
      this.arrowNode.setTailAndTip( tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y );
      this.arrowNode.fill = line.color;
    }
    else {
      const lineNode = this.lineNode!;
      assert && assert( lineNode );
      lineNode.setLine( tailPosition.x, tailPosition.y, tipPosition.x, tipPosition.y );
      lineNode.stroke = line.color;
    }

    /*
     * If this line has an equation, update its orientation and position.
     * Rotation is applied to equationParentNode.
     * Translation is applied to equationNode, relative to a horizontal line whose tip points right.
     */
    if ( this.equationNode ) {

      const equationParentNode = this.equationParentNode!;
      assert && assert( equationParentNode );

      equationParentNode.rotation = line.undefinedSlope() ? Math.PI / 2 : -Math.atan( line.getSlope() );

      // Equations have some invisible nodes. Compensate so that layout is for visible nodes.
      const equationBounds = this.equationNode.bounds;
      const equationVisibleBounds = this.equationNode.visibleBounds;
      const leftOffset = equationVisibleBounds.left - equationBounds.left;
      const rightOffset = equationBounds.right - equationVisibleBounds.right;
      const topOffset = equationVisibleBounds.top - equationBounds.top;
      const bottomOffset = equationBounds.bottom - equationVisibleBounds.bottom;

      // Put the equation where it won't interfere with slope tool or y-axis, at the end of the line that would have the slope manipulator.
      const X_OFFSET = 60;
      const Y_OFFSET = 12;
      if ( line.undefinedSlope() ) {

        // This puts the 'undefined slope' label to the right of the y-axis, at the same end of the line as the slope manipulator.
        if ( line.rise < 0 ) {
          equationParentNode.translation = tipPosition;
          this.equationNode.right = -X_OFFSET + rightOffset;
          this.equationNode.bottom = -Y_OFFSET + bottomOffset;
        }
        else {
          equationParentNode.translation = tailPosition;
          this.equationNode.left = X_OFFSET - leftOffset;
          this.equationNode.bottom = -Y_OFFSET + bottomOffset;
        }
      }
      else if ( line.rise <= 0 ) {
        if ( line.run >= 0 ) {

          // quadrant 4: equation above the line, at tip (right)
          equationParentNode.translation = tipPosition;
          this.equationNode.right = -X_OFFSET + rightOffset;
          this.equationNode.bottom = -Y_OFFSET + bottomOffset;
        }
        else {

          // quadrant 3: equation above the line, at tail (left)
          equationParentNode.translation = tailPosition;
          this.equationNode.left = X_OFFSET - leftOffset;
          this.equationNode.bottom = -Y_OFFSET + bottomOffset;
        }
      }
      else {
        if ( line.run > 0 ) {

          // quadrant 1: equation below the line, at tip (right)
          equationParentNode.translation = tipPosition;
          this.equationNode.right = -X_OFFSET + rightOffset;
          this.equationNode.top = Y_OFFSET - topOffset;
        }
        else {

          // quadrant 2: equation below the line, at tail (left)
          equationParentNode.translation = tailPosition;
          this.equationNode.left = X_OFFSET - leftOffset;
          this.equationNode.top = Y_OFFSET - topOffset;
        }
      }
    }
  }
}

graphingLines.register( 'LineNode', LineNode );