// Copyright 2014-2023, University of Colorado Boulder

/**
 * A Scenery node that represents a shape that is defined by lists of perimeter points.  The perimeter points are
 * supplied in terms of external and internal perimeters.  This node also allows specification of a unit length that is
 * used to depict a grid on the shape, and can also show dimensions of the shape.
 *
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, Text } from '../../../../scenery/js/imports.js';
import areaBuilder from '../../areaBuilder.js';
import Grid from './Grid.js';

// constants
const DIMENSION_LABEL_FONT = new PhetFont( { size: 14 } );
const COMPARISON_TOLERANCE = 1E-6;

class PerimeterShapeNode extends Node {

  /**
   * @param {Property.<PerimeterShape>} perimeterShapeProperty
   * @param {Bounds2} maxBounds
   * @param {number} unitSquareLength
   * @param {boolean} showDimensionsProperty
   * @param {boolean} showGridProperty
   * @param {Object} [options]
   */
  constructor( perimeterShapeProperty, maxBounds, unitSquareLength, showDimensionsProperty, showGridProperty, options ) {

    super();

    const perimeterDefinesViableShapeProperty = new Property( false );

    // Set up the shape, edge, and grid, which will be updated as the perimeter changes.  The order in which these
    // are added is important for proper layering.
    const perimeterShapeNode = new Path( null );
    this.addChild( perimeterShapeNode );
    const grid = new Grid( maxBounds, unitSquareLength, {
      lineDash: [ 0, 3, 1, 0 ], // Tweaked to work well with unit size
      stroke: 'black'
    } );
    this.addChild( grid );
    const perimeterNode = new Path( null, { lineWidth: 2 } );
    this.addChild( perimeterNode );
    const dimensionsLayer = new Node();
    this.addChild( dimensionsLayer );

    // Create a pool of text nodes that will be used to portray the dimension values.  This is done as a performance
    // optimization, since changing text nodes is more efficient that recreating them on each update.
    const textNodePool = [];

    function addDimensionLabelNode() {
      const textNode = new Text( '', {
        font: DIMENSION_LABEL_FONT,
        centerX: maxBounds.centerX,
        centerY: maxBounds.centerY
      } );
      textNode.visible = false;
      textNodePool.push( textNode );
      dimensionsLayer.addChild( textNode );
    }

    _.times( 16, addDimensionLabelNode ); // Initial size empirically chosen, can be adjusted if needed.

    // Define function for updating the appearance of the perimeter shape.
    function update() {
      let i;

      // Update the colors
      assert && assert( perimeterShapeProperty.value.fillColor || perimeterShapeProperty.value.edgeColor,
        'PerimeterShape can\'t have null values for both the fill and the edge.' );
      perimeterShapeNode.fill = perimeterShapeProperty.value.fillColor;
      perimeterNode.stroke = perimeterShapeProperty.value.edgeColor;

      // Define the shape of the outer perimeter.
      const mainShape = new Shape();
      perimeterShapeProperty.value.exteriorPerimeters.forEach( exteriorPerimeters => {
        mainShape.moveToPoint( exteriorPerimeters[ 0 ] );
        for ( i = 1; i < exteriorPerimeters.length; i++ ) {
          mainShape.lineToPoint( exteriorPerimeters[ i ] );
        }
        mainShape.lineToPoint( exteriorPerimeters[ 0 ] );
        mainShape.close();
      } );

      // Hide all dimension labels in the pool, they will be shown later if used.
      textNodePool.forEach( textNode => { textNode.visible = false; } );

      // The resulting shape will be empty if there are no points in the external perimeter, so we need to check for that.
      if ( !mainShape.bounds.isEmpty() ) {

        // Make sure the shape fits within its specified bounds.
        assert && assert( maxBounds.containsBounds( mainShape.bounds ) );

        // Turn on visibility of the perimeter and the interior fill.
        perimeterShapeNode.visible = true;
        perimeterNode.visible = true;

        // Handling any interior perimeters, a.k.a. holes, in the shape.
        perimeterShapeProperty.value.interiorPerimeters.forEach( interiorPerimeter => {
          mainShape.moveToPoint( interiorPerimeter[ 0 ] );
          for ( i = 1; i < interiorPerimeter.length; i++ ) {
            mainShape.lineToPoint( interiorPerimeter[ i ] );
          }
          mainShape.lineToPoint( interiorPerimeter[ 0 ] );
          mainShape.close();
        } );

        perimeterShapeNode.setShape( mainShape );
        perimeterNode.setShape( mainShape );

        grid.clipArea = mainShape;

        // Add the dimension labels for the perimeters, but only if there is only 1 exterior perimeter (multiple
        // interior perimeters if fine).
        if ( perimeterShapeProperty.value.exteriorPerimeters.length === 1 ) {

          // Create a list of the perimeters to be labeled.
          const perimetersToLabel = [];
          perimetersToLabel.push( perimeterShapeProperty.value.exteriorPerimeters[ 0 ] );
          perimeterShapeProperty.value.interiorPerimeters.forEach( interiorPerimeter => {
            perimetersToLabel.push( interiorPerimeter );
          } );

          // Identify the segments in each of the perimeters, exterior and interior, to be labeled.
          const segmentLabelsInfo = [];
          perimetersToLabel.forEach( perimeterToLabel => {
            let segment = { startIndex: 0, endIndex: 0 };
            do {
              segment = identifySegment( perimeterToLabel, segment.endIndex );
              // Only put labels on segments that have integer lengths.
              const segmentLabelInfo = {
                unitLength: perimeterToLabel[ segment.startIndex ].distance( perimeterToLabel[ segment.endIndex ] ) / unitSquareLength,
                position: new Vector2( ( perimeterToLabel[ segment.startIndex ].x + perimeterToLabel[ segment.endIndex ].x ) / 2,
                  ( perimeterToLabel[ segment.startIndex ].y + perimeterToLabel[ segment.endIndex ].y ) / 2 ),
                edgeAngle: Math.atan2( perimeterToLabel[ segment.endIndex ].y - perimeterToLabel[ segment.startIndex ].y,
                  perimeterToLabel[ segment.endIndex ].x - perimeterToLabel[ segment.startIndex ].x
                )
              };

              // Only include the labels that are integer values.
              if ( Math.abs( Utils.roundSymmetric( segmentLabelInfo.unitLength ) - segmentLabelInfo.unitLength ) < COMPARISON_TOLERANCE ) {
                segmentLabelInfo.unitLength = Utils.roundSymmetric( segmentLabelInfo.unitLength );
                segmentLabelsInfo.push( segmentLabelInfo );
              }
            } while ( segment.endIndex !== 0 );
          } );

          // Make sure that there are enough labels in the pool.
          if ( segmentLabelsInfo.length > textNodePool.length ) {
            _.times( segmentLabelsInfo.length - textNodePool.length, addDimensionLabelNode );
          }

          // Get labels from the pool and place them on each segment, just outside of the shape.
          segmentLabelsInfo.forEach( ( segmentLabelInfo, segmentIndex ) => {
            const dimensionLabel = textNodePool[ segmentIndex ];
            dimensionLabel.visible = true;
            dimensionLabel.string = segmentLabelInfo.unitLength;
            const labelPositionOffset = new Vector2( 0, 0 );
            // TODO: At the time of this writing there is an issue with Shape.containsPoint() that can make
            // containment testing unreliable if there is an edge on the same line as the containment test.  As a
            // workaround, the containment test offset is tweaked a little below.  Once this issue is fixed, the
            // label offset itself can be used for the test.  See https://github.com/phetsims/kite/issues/3.
            let containmentTestOffset;
            if ( segmentLabelInfo.edgeAngle === 0 || segmentLabelInfo.edgeAngle === Math.PI ) {
              // Label is on horizontal edge, so use height to determine offset.
              labelPositionOffset.setXY( 0, dimensionLabel.height / 2 );
              containmentTestOffset = labelPositionOffset.plusXY( 1, 0 );
            }
            else { // NOTE: Angled edges are not currently supported.
              // Label is on a vertical edge
              labelPositionOffset.setXY( dimensionLabel.width * 0.8, 0 );
              containmentTestOffset = labelPositionOffset.plusXY( 0, 1 );
            }
            if ( mainShape.containsPoint( segmentLabelInfo.position.plus( containmentTestOffset ) ) ) {
              // Flip the offset vector to keep the label outside of the shape.
              labelPositionOffset.rotate( Math.PI );
            }
            dimensionLabel.center = segmentLabelInfo.position.plus( labelPositionOffset );
          } );
        }
        perimeterDefinesViableShapeProperty.value = true;
      }
      else {
        perimeterShapeNode.visible = false;
        perimeterNode.visible = false;
        perimeterDefinesViableShapeProperty.value = false;
      }
    }

    // Control visibility of the dimension indicators.
    showDimensionsProperty.linkAttribute( dimensionsLayer, 'visible' );

    // Control visibility of the grid.
    Multilink.multilink( [ showGridProperty, perimeterDefinesViableShapeProperty ], ( showGrid, perimeterDefinesViableShape ) => {
      grid.visible = showGrid && perimeterDefinesViableShape;
    } );

    // Update the shape, grid, and dimensions if the perimeter shape itself changes.
    perimeterShapeProperty.link( () => {
      update();
    } );

    // Pass options through to parent class.
    this.mutate( options );
  }
}

// Utility function for identifying a perimeter segment with no bends.
function identifySegment( perimeterPoints, startIndex ) {

  // Parameter checking.
  if ( startIndex >= perimeterPoints.length ) {
    throw new Error( 'Illegal use of function for identifying perimeter segments.' );
  }

  // Set up initial portion of segment.
  const segmentStartPoint = perimeterPoints[ startIndex ];
  let endIndex = ( startIndex + 1 ) % perimeterPoints.length;
  let segmentEndPoint = perimeterPoints[ endIndex ];
  const previousAngle = Math.atan2( segmentEndPoint.y - segmentStartPoint.y, segmentEndPoint.x - segmentStartPoint.x );
  let segmentComplete = false;

  while ( !segmentComplete && endIndex !== 0 ) {
    const candidatePoint = perimeterPoints[ ( endIndex + 1 ) % perimeterPoints.length ];
    const angleToCandidatePoint = Math.atan2( candidatePoint.y - segmentEndPoint.y, candidatePoint.x - segmentEndPoint.x );
    if ( previousAngle === angleToCandidatePoint ) {
      // This point is an extension of the current segment.
      segmentEndPoint = candidatePoint;
      endIndex = ( endIndex + 1 ) % perimeterPoints.length;
    }
    else {
      // This point isn't part of this segment.
      segmentComplete = true;
    }
  }

  return {
    startIndex: startIndex,
    endIndex: endIndex
  };
}

areaBuilder.register( 'PerimeterShapeNode', PerimeterShapeNode );
export default PerimeterShapeNode;