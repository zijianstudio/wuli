// Copyright 2013-2022, University of Colorado Boulder

/**
 * View representation for the plank.
 *
 * @author John Blanco
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import balancingAct from '../../balancingAct.js';
import Plank from '../model/Plank.js';

// constants
const NORMAL_TICK_MARK_LINE_WIDTH = 1;
const BOLD_TICK_MARK_LINE_WIDTH = 3;
const HIGHLIGHT_COLOR = 'white';
const HIGHLIGHT_WIDTH = 12;

class PlankNode extends Node {

  /**
   * @param modelViewTransform
   * @param plank
   */
  constructor( modelViewTransform, plank ) {
    super();
    const self = this;

    // Create and position the plank.
    const plankViewBounds = modelViewTransform.modelToViewShape( plank.unrotatedShape ).bounds;
    const plankNode = new Rectangle( plankViewBounds.minX, plankViewBounds.minY, plankViewBounds.width, plankViewBounds.height,
      {
        fill: 'rgb( 243, 203, 127 )',
        stroke: 'black',
        lineThickness: 1
      } );
    this.addChild( plankNode );

    // Function for mapping plank distance relative to the center point to a highlight.
    function mapPositionToHighlightIndex( distanceFromCenter ) {
      return Utils.roundSymmetric(
        ( distanceFromCenter + Plank.LENGTH / 2 ) * ( ( Plank.NUM_SNAP_TO_POSITIONS + 1 ) / Plank.LENGTH )
      ) - 1;
    }

    // Function for updating the highlights
    function updateHighlights() {
      self.highlights.forEach( highlight => {
        highlight.visible = false;
      } );
      plank.activeDropPositions.forEach( position => {
        self.highlights[ mapPositionToHighlightIndex( position ) ].visible = true;
      } );
    }

    // Update the tick mark highlights as the active drop positions change.
    plank.activeDropPositions.addItemAddedListener( updateHighlights );
    plank.activeDropPositions.addItemRemovedListener( updateHighlights );

    // Create and add the tick mark layer.
    const tickMarkLayer = new Node();
    const tickMarkShape = Shape.lineSegment( 0, 0, 0, modelViewTransform.modelToViewDeltaY( Plank.THICKNESS ) );
    const plankLeftEdge = new Vector2( modelViewTransform.modelToViewX( plank.getPlankSurfaceCenter().x - Plank.LENGTH / 2 ),
      modelViewTransform.modelToViewY( plank.getPlankSurfaceCenter().y ) );
    const tickMarkDeltaX = modelViewTransform.modelToViewDeltaX( Plank.INTER_SNAP_TO_MARKER_DISTANCE );
    this.highlights = [];
    for ( let i = 0; i < Plank.NUM_SNAP_TO_POSITIONS; i++ ) {
      let tickMarkStroke = NORMAL_TICK_MARK_LINE_WIDTH;
      if ( i % 2 === 0 ) {
        // Make some marks bold for easier placement of masses.
        // The 'if' clause can be tweaked to put marks in
        // different places.
        tickMarkStroke = BOLD_TICK_MARK_LINE_WIDTH;
      }
      const tickMark = new Path( tickMarkShape,
        {
          centerX: plankLeftEdge.x + ( i + 1 ) * tickMarkDeltaX,
          top: plankLeftEdge.y,
          lineWidth: tickMarkStroke,
          stroke: 'black'
        } );
      const highlight = new Rectangle(
        tickMark.centerX - HIGHLIGHT_WIDTH / 2,
        tickMark.top,
        HIGHLIGHT_WIDTH,
        tickMark.bounds.height,
        0,
        0,
        { fill: HIGHLIGHT_COLOR, visible: false }
      );
      tickMarkLayer.addChild( highlight );
      this.highlights.push( highlight );
      tickMarkLayer.addChild( tickMark );
    }
    plankNode.addChild( tickMarkLayer );

    // Track the rotational angle of the plank and update this node accordingly.
    let nodeRotation = 0;
    const rotationPoint = modelViewTransform.modelToViewPosition( plank.pivotPoint );
    plank.tiltAngleProperty.link( tiltAngle => {
      plankNode.rotateAround( rotationPoint, nodeRotation - tiltAngle );
      nodeRotation = tiltAngle;
    } );
  }
}

balancingAct.register( 'PlankNode', PlankNode );

export default PlankNode;
