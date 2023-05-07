// Copyright 2017-2023, University of Colorado Boulder

/**
 * Display for the partition lines in proportional screens.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import validate from '../../../../axon/js/validate.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { DragListener, FocusHighlightPath, Line, Node, Path } from '../../../../scenery/js/imports.js';
import AccessibleSlider from '../../../../sun/js/accessibility/AccessibleSlider.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';

const horizontalPartitionHandleString = AreaModelCommonStrings.a11y.horizontalPartitionHandle;
const horizontalPartitionHandleDescriptionString = AreaModelCommonStrings.a11y.horizontalPartitionHandleDescription;
const verticalPartitionHandleString = AreaModelCommonStrings.a11y.verticalPartitionHandle;
const verticalPartitionHandleDescriptionString = AreaModelCommonStrings.a11y.verticalPartitionHandleDescription;

class ProportionalPartitionLineNode extends AccessibleSlider( Node, 0 ) {
  /**
   * @mixes AccessibleSlider
   *
   * @param {ProportionalAreaDisplay} areaDisplay
   * @param {Property.<ModelViewTransform2>} modelViewTransformProperty
   * @param {Orientation} orientation
   */
  constructor( areaDisplay, modelViewTransformProperty, orientation ) {
    validate( orientation, { validValues: Orientation.enumeration.values } );

    // Relevant properties
    const partitionSplitProperty = areaDisplay.partitionSplitProperties.get( orientation );
    const oppositeActiveTotalProperty = areaDisplay.activeTotalProperties.get( orientation.opposite );
    const activeTotalProperty = areaDisplay.activeTotalProperties.get( orientation );

    // We need to reverse the accessible property for the vertical case.
    // See https://github.com/phetsims/area-model-introduction/issues/2
    const accessibleProperty = orientation === Orientation.HORIZONTAL
                               ? partitionSplitProperty
                               : new DynamicProperty( new Property( partitionSplitProperty ), {
        bidirectional: true,
        map: v => -v,
        inverseMap: v => -v
      }, {
        valueType: 'number' // AccessibleSlider doesn't want anything besides a number
      } );
    const enabledRangeProperty = new DerivedProperty(
      [ activeTotalProperty, areaDisplay.snapSizeProperty ],
      ( total, snapSize ) => {
        const size = total - snapSize;
        return orientation === Orientation.HORIZONTAL ? new Range( 0, size ) : new Range( -size, 0 );
      } );

    super( {
      valueProperty: accessibleProperty,
      enabledRangeProperty: enabledRangeProperty,
      constrainValue: value => Utils.roundSymmetric( value / areaDisplay.partitionSnapSizeProperty.value ) *
                      areaDisplay.partitionSnapSizeProperty.value,
      keyboardStep: 1,
      shiftKeyboardStep: 1,
      pageKeyboardStep: 5,
      ariaOrientation: orientation,
      a11yMapPDOMValue: v => ( orientation === Orientation.HORIZONTAL ? 1 : -1 ) * v,
      roundToStepSize: true
    } );

    // @private {ProportionalAreaDisplay}
    this.areaDisplay = areaDisplay;

    const showHintArrowsProperty = areaDisplay.hasHintArrows.get( orientation );

    let minHintArrow;
    let maxHintArrow;
    const hintOffset = 15;
    const hintLength = 20;
    const arrowOptions = {
      fill: 'yellow',
      pickable: false
    };
    if ( orientation === Orientation.HORIZONTAL ) {
      minHintArrow = new ArrowNode( -hintOffset, 0, -( hintLength + hintOffset ), 0, arrowOptions );
      maxHintArrow = new ArrowNode( hintOffset, 0, hintLength + hintOffset, 0, arrowOptions );
    }
    else {
      minHintArrow = new ArrowNode( 0, -hintOffset, 0, -( hintLength + hintOffset ), arrowOptions );
      maxHintArrow = new ArrowNode( 0, hintOffset, 0, hintLength + hintOffset, arrowOptions );
    }
    showHintArrowsProperty.linkAttribute( minHintArrow, 'visible' );
    showHintArrowsProperty.linkAttribute( maxHintArrow, 'visible' );

    const handleShape = ProportionalPartitionLineNode.HANDLE_ARROW_SHAPES.get( orientation );
    const handleMouseBounds = handleShape.bounds;
    const handleTouchBounds = handleMouseBounds.dilated( 5 );

    // We need to cut off the corners that would overlap between the two partition line handles, so we create a clipping
    // area and intersect with that. See https://github.com/phetsims/area-model-common/issues/80.
    let handleClipShape = new Shape().moveToPoint( handleTouchBounds.leftTop )
      .lineToPoint( handleTouchBounds.leftBottom )
      .lineToPoint( handleTouchBounds.rightBottom )
      .lineToPoint( handleTouchBounds.rightTop.blend( handleTouchBounds.rightBottom, 0.4 ) )
      .lineToPoint( handleTouchBounds.rightTop.blend( handleTouchBounds.leftTop, 0.4 ) )
      .close();
    if ( orientation === Orientation.VERTICAL ) {
      handleClipShape = handleClipShape.transformed( Matrix3.rotation2( Math.PI ) );
    }

    const handle = new Path( handleShape, {
      mouseArea: Shape.bounds( handleMouseBounds ).shapeIntersection( handleClipShape ),
      touchArea: Shape.bounds( handleTouchBounds ).shapeIntersection( handleClipShape ),
      fill: areaDisplay.colorProperties.get( orientation ),
      stroke: AreaModelCommonColors.partitionLineBorderProperty,
      cursor: 'pointer',
      children: [
        minHintArrow,
        maxHintArrow
      ]
    } );

    const line = new Line( {
      stroke: AreaModelCommonColors.partitionLineStrokeProperty,
      lineWidth: 2,
      cursor: 'pointer'
    } );

    this.children = [
      line,
      handle
    ];


    this.labelTagName = 'label';
    this.labelContent = orientation === Orientation.HORIZONTAL ? verticalPartitionHandleString : horizontalPartitionHandleString;
    this.descriptionContent = orientation === Orientation.HORIZONTAL ? verticalPartitionHandleDescriptionString : horizontalPartitionHandleDescriptionString;

    this.focusHighlight = new FocusHighlightPath( handleShape.getOffsetShape( 5 ) );
    handle.addChild( this.focusHighlight );
    this.focusHighlightLayerable = true;

    // Main coordinate (when dragging)
    Multilink.multilink( [ partitionSplitProperty, modelViewTransformProperty ], ( split, modelViewTransform ) => {
      this[ orientation.coordinate ] = orientation.modelToView( modelViewTransform, split );
    } );

    // Opposite coordinate (how wide the area is in the other direction)
    Multilink.multilink(
      [ oppositeActiveTotalProperty, modelViewTransformProperty ],
      ( oppositeTotal, modelViewTransform ) => {
        const offsetValue = orientation.opposite.modelToView( modelViewTransform, oppositeTotal ) +
                            AreaModelCommonConstants.PARTITION_HANDLE_OFFSET;
        handle[ orientation.opposite.coordinate ] = offsetValue;
        line[ `${orientation.opposite.coordinate}2` ] = offsetValue;
        line.mouseArea = line.localBounds.dilated( 4 );
        line.touchArea = line.localBounds.dilated( 8 );
      } );

    // Visibility
    areaDisplay.partitionSplitVisibleProperties.get( orientation ).linkAttribute( this, 'visible' );

    areaDisplay.partitionSnapSizeProperty.link( snapSize => {
      this.setKeyboardStep( snapSize );
    } );

    let dragHandler;
    modelViewTransformProperty.link( modelViewTransform => {
      if ( dragHandler ) {
        this.removeInputListener( dragHandler );
        dragHandler.dispose();
      }
      dragHandler = new DragListener( {
        transform: modelViewTransform,
        drag: ( event, listener ) => {
          let value = listener.modelPoint[ orientation.coordinate ];

          value = Utils.roundSymmetric( value / areaDisplay.partitionSnapSizeProperty.value ) *
                  areaDisplay.partitionSnapSizeProperty.value;
          value = Utils.clamp( value, 0, activeTotalProperty.value );

          // Hint arrows disappear when the actual split changes during a drag, see
          // https://github.com/phetsims/area-model-common/issues/68
          const currentSplitValue = partitionSplitProperty.value;
          if ( value !== currentSplitValue && value !== 0 ) {
            showHintArrowsProperty.value = false;
          }

          partitionSplitProperty.value = value;
        },

        end: () => {
          if ( partitionSplitProperty.value === activeTotalProperty.value ) {
            partitionSplitProperty.value = 0;
          }
        }
      } );
      dragHandler.isUserControlledProperty.link( controlled => {
        areaDisplay.partitionSplitUserControlledProperties.get( orientation ).value = controlled;
      } );
      this.addInputListener( dragHandler );
    } );
  }
}

areaModelCommon.register( 'ProportionalPartitionLineNode', ProportionalPartitionLineNode );

// Handle arrows
const arrowHalfLength = 10;
const arrowHalfWidth = 10;
const verticalArrowShape = new Shape()
  .moveTo( -arrowHalfLength, 0 )
  .lineTo( arrowHalfLength, arrowHalfWidth )
  .lineTo( arrowHalfLength, -arrowHalfWidth )
  .close();
const horizontalArrowShape = verticalArrowShape.transformed( Matrix3.rotation2( Math.PI / 2 ) );

ProportionalPartitionLineNode.HANDLE_ARROW_SHAPES = new OrientationPair( horizontalArrowShape, verticalArrowShape );

export default ProportionalPartitionLineNode;