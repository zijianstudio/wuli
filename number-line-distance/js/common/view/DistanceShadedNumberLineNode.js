// Copyright 2020-2023, University of Colorado Boulder

/**
 * A node that is a number line and that also shades the distance between number line points. The space between number
 * line points is only shaded when both point controllers are on the number line. No unlinking is required because all
 * instances of this number line are present for the lifetime of the simulation.
 *
 * @author Saurabh Totey
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import NLCConstants from '../../../../number-line-common/js/common/NLCConstants.js';
import SpatializedNumberLineNode from '../../../../number-line-common/js/common/view/SpatializedNumberLineNode.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import BackgroundNode from '../../../../scenery-phet/js/BackgroundNode.js';
import MathSymbolFont from '../../../../scenery-phet/js/MathSymbolFont.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import numberLineDistance from '../../numberLineDistance.js';
import DistanceRepresentation from '../model/DistanceRepresentation.js';
import NLDConstants from '../NLDConstants.js';

const SHADING_COLOR = 'gray';
const SHADING_WIDTH = 8;
const ARROW_SHAPE_OPTIONS = {
  tailWidth: SHADING_WIDTH,
  headWidth: 20,
  headHeight: 20
};
const MAX_ARROW_HEAD_TO_ARROW_PROPORTION = 0.5;
const POINT_NAME_TEXT_OPTIONS = { maxWidth: 38, font: new MathSymbolFont( 20 ), boundsMethod: 'accurate' };

class DistanceShadedNumberLineNode extends SpatializedNumberLineNode {

  /**
   * @param {AbstractNLDBaseModel} model
   * @param {Object} [options]
   */
  constructor( model, options ) {
    options = merge( {
      offScaleIndicatorVerticalOffset: -120,
      offScaleIndicatorHorizontalOffset: -150,
      pointNameLabelOffsetFromHorizontalNumberLine: 37,
      pointNameLabelOffsetFromVerticalNumberLine: 45,
      distanceTextPadding: 50
    }, options );
    super( model.numberLine, options );

    // Create the Path that is the shading for the distance between point controllers.
    const distanceShadingPath = new Path( null, { stroke: null, fill: SHADING_COLOR, lineWidth: SHADING_WIDTH } );
    this.addChild( distanceShadingPath );
    distanceShadingPath.moveToBack();

    // Create the distance label. maxWidth and font size determined empirically.
    const distanceText = new Text( '', {
      maxWidth: 50,
      font: new PhetFont( 28 )
    } );
    const distanceTextBackground = new BackgroundNode( distanceText, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( distanceTextBackground );

    // Create text labels for the number line points that label them as x1, x2, y1, or y2.
    const pointNameText0 = new RichText( NLDConstants.X_1_STRING, POINT_NAME_TEXT_OPTIONS );
    const pointNameText1 = new RichText( NLDConstants.X_2_STRING, POINT_NAME_TEXT_OPTIONS );
    const pointNameBackground0 = new BackgroundNode( pointNameText0, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    const pointNameBackground1 = new BackgroundNode( pointNameText1, NLCConstants.LABEL_BACKGROUND_OPTIONS );
    this.addChild( new Node( {
      children: [ pointNameBackground0, pointNameBackground1 ]
    } ) );
    model.pointControllerOne.isDraggingProperty.link( () => { pointNameBackground0.moveToFront(); } );
    model.pointControllerTwo.isDraggingProperty.link( () => { pointNameBackground1.moveToFront(); } );

    // Most of the number line's behaviour is handled in this multilink.
    Multilink.multilink(
      [
        model.distanceLabelsVisibleProperty,
        model.numberLine.displayedRangeProperty,
        model.distanceRepresentationProperty,
        model.isPrimaryControllerSwappedProperty,
        model.numberLine.orientationProperty,
        model.pointValuesProperty,
        model.numberLine.centerPositionProperty // is only necessary for when listeners are shuffled
      ],
      ( distanceLabelsVisible, displayedRange, distanceRepresentation, isPrimaryControllerSwapped, orientation, pointValues ) => {

        // Get which strings to use for point names based on the number line orientation.
        // The strings are ordered based on isPrimaryControllerSwapped.
        const labelStrings = ( orientation === Orientation.VERTICAL ) ?
          [ NLDConstants.Y_1_STRING, NLDConstants.Y_2_STRING ] : [ NLDConstants.X_1_STRING, NLDConstants.X_2_STRING ];
        if ( isPrimaryControllerSwapped ) {
          const temp = labelStrings[ 0 ];
          labelStrings[ 0 ] = labelStrings[ 1 ];
          labelStrings[ 1 ] = temp;
        }

        pointNameText0.string = labelStrings[ 0 ];
        pointNameText1.string = labelStrings[ 1 ];
        pointNameBackground0.visible = pointValues[ 0 ] !== null && displayedRange.contains( pointValues[ 0 ] );
        pointNameBackground1.visible = pointValues[ 1 ] !== null && displayedRange.contains( pointValues[ 1 ] );

        // Position the texts.
        if ( orientation === Orientation.HORIZONTAL ) {
          pointNameBackground0.centerTop = model.numberLine.valueToModelPosition(
            pointValues[ 0 ] ? pointValues[ 0 ] : 0
          ).plus( new Vector2( 0, options.pointNameLabelOffsetFromHorizontalNumberLine ) );
          pointNameBackground1.centerTop = model.numberLine.valueToModelPosition(
            pointValues[ 1 ] ? pointValues[ 1 ] : 0
          ).plus( new Vector2( 0, options.pointNameLabelOffsetFromHorizontalNumberLine ) );
        }
        else {
          pointNameBackground0.leftCenter = model.numberLine.valueToModelPosition(
            pointValues[ 0 ] ? pointValues[ 0 ] : 0
          ).plus( new Vector2( options.pointNameLabelOffsetFromVerticalNumberLine, 0 ) );
          pointNameBackground1.leftCenter = model.numberLine.valueToModelPosition(
            pointValues[ 1 ] ? pointValues[ 1 ] : 0
          ).plus( new Vector2( options.pointNameLabelOffsetFromVerticalNumberLine, 0 ) );
        }

        // Stop here if both points aren't the number line: we cannot put any shading or distance label.
        if ( !model.areBothPointControllersControllingOnNumberLine() ) {
          distanceTextBackground.visible = false;
          distanceShadingPath.visible = false;
          return;
        }
        distanceTextBackground.visible = distanceLabelsVisible;
        distanceShadingPath.visible = true;

        // Get the endpoint positions in model-space of where the tips of the number line are.
        // This usually extends past the min and max values allowed on the number line because of the inset and arrows
        // on each end. The endpoint positions are needed in case a point is off the scale of the number line and the
        // shading needs to go all the way to the end of the number line.
        const insetSize = this.options.displayedRangeInset - this.options.arrowSize;
        const insetVector = ( model.numberLine.orientationProperty.value === Orientation.HORIZONTAL ) ?
                            new Vector2( insetSize, 0 ) :
                            new Vector2( 0, -insetSize );
        const endPointPositionMin = model.numberLine.valueToModelPosition( displayedRange.min ).minus( insetVector );
        const endPointPositionMax = model.numberLine.valueToModelPosition( displayedRange.max ).plus( insetVector );

        // Get where on the number line the point controllers are.
        // We need both the number line values and their model positions for clamping purposes.
        const value0 = pointValues[ 0 ];
        const value1 = pointValues[ 1 ];
        let endPointPosition0 = model.numberLine.valueToModelPosition( value0 );
        let endPointPosition1 = model.numberLine.valueToModelPosition( value1 );

        // Clamp endPointPositions to be between endPointPositionMin and endPointPositionMax.
        // We cannot use Util.clamp because we are clamping when the values are out of the displayed range, but we are
        // clamping to the end point positions. For example, value0 can be greater than displayedRange.max while at the
        // same time endPointPosition0 can be less than endPointPositionMax thanks to the inset.
        if ( value0 < displayedRange.min ) {
          endPointPosition0 = endPointPositionMin;
        }
        else if ( value0 > displayedRange.max ) {
          endPointPosition0 = endPointPositionMax;
        }
        if ( value1 < displayedRange.min ) {
          endPointPosition1 = endPointPositionMin;
        }
        else if ( value1 > displayedRange.max ) {
          endPointPosition1 = endPointPositionMax;
        }

        // Make the shading shape between nodes.
        let shape = new Shape().moveToPoint( endPointPosition0 ).lineToPoint( endPointPosition1 );
        distanceShadingPath.stroke = SHADING_COLOR;

        // Change the shading shape to an arrow if the distance type is directed and the arrow is pointing to a point
        // that is on the number line.
        if ( distanceRepresentation === DistanceRepresentation.DIRECTED ) {

          // Scale the arrow based on how close the point controllers are.
          // If the point controllers are too close, then the arrow might be too big and be distorted.
          // If the width of the arrow head is greater than MAX_ARROW_HEAD_TO_ARROW_PROPORTION, then the arrow is
          //  scaled down.
          // see #7
          let scale = 1;
          const arrowValueLength = Math.abs(
            model.numberLine.modelPositionToValue( endPointPosition1 ) - model.numberLine.modelPositionToValue( endPointPosition0 )
          );
          let arrowHeadValueLength = Math.abs(
            model.numberLine.modelPositionToValue( endPointPosition0 )
              - model.numberLine.modelPositionToValue( new Vector2( endPointPosition0.x - ARROW_SHAPE_OPTIONS.headHeight, 0 ) )
          );
          if ( orientation === Orientation.VERTICAL ) {
            arrowHeadValueLength = Math.abs(
              model.numberLine.modelPositionToValue( endPointPosition0 )
              - model.numberLine.modelPositionToValue( new Vector2( 0, endPointPosition0.y - ARROW_SHAPE_OPTIONS.headHeight ) )
            );
          }
          const headLengthToArrowLengthProportion = arrowHeadValueLength / arrowValueLength;
          if ( headLengthToArrowLengthProportion > MAX_ARROW_HEAD_TO_ARROW_PROPORTION ) {
            scale = MAX_ARROW_HEAD_TO_ARROW_PROPORTION / headLengthToArrowLengthProportion;
          }
          const scaledArrowShapeOptions = merge( {}, ARROW_SHAPE_OPTIONS, {
            headHeight: ARROW_SHAPE_OPTIONS.headHeight * scale,
            headWidth: ARROW_SHAPE_OPTIONS.headWidth * scale,
            tailWidth: ARROW_SHAPE_OPTIONS.tailWidth * scale
          } );

          // Only set the shape to the arrow shape if the point that the arrow points to is in the number line's range.
          // The stroke is removed so the tail of the arrow can have the correct width.
          if ( isPrimaryControllerSwapped && displayedRange.min <= value0 && value0 <= displayedRange.max ) {
            shape = new ArrowShape( endPointPosition1.x, endPointPosition1.y, endPointPosition0.x, endPointPosition0.y, scaledArrowShapeOptions );
            distanceShadingPath.stroke = null;
          }
          else if ( !isPrimaryControllerSwapped && displayedRange.min <= value1 && value1 <= displayedRange.max ) {
            shape = new ArrowShape( endPointPosition0.x, endPointPosition0.y, endPointPosition1.x, endPointPosition1.y, scaledArrowShapeOptions );
            distanceShadingPath.stroke = null;
          }
        }

        distanceShadingPath.shape = shape;

        // Calculates the difference to display.
        let displayedDifference = value1 - value0;
        if ( isPrimaryControllerSwapped ) {
          displayedDifference = -displayedDifference;
        }
        if ( distanceRepresentation === DistanceRepresentation.ABSOLUTE ) {
          displayedDifference = Math.abs( displayedDifference );
        }

        distanceText.string = `${Utils.roundSymmetric( displayedDifference )}`;

        // Position distance text.
        if ( orientation === Orientation.HORIZONTAL ) {
          distanceTextBackground.bottom = endPointPosition0.y - options.distanceTextPadding;
          distanceTextBackground.centerX = ( endPointPosition1.x + endPointPosition0.x ) / 2;
        }
        else {
          distanceTextBackground.right = endPointPosition0.x - options.distanceTextPadding;
          distanceTextBackground.centerY = ( endPointPosition1.y + endPointPosition0.y ) / 2;
        }

      }
    );
  }

}

numberLineDistance.register( 'DistanceShadedNumberLineNode', DistanceShadedNumberLineNode );
export default DistanceShadedNumberLineNode;
