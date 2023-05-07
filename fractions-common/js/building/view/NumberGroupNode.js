// Copyright 2018-2023, University of Colorado Boulder

/**
 * View for a NumberGroup.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import { Line, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import NumberGroup from '../model/NumberGroup.js';
import NumberSpotType from '../model/NumberSpotType.js';
import GroupNode from './GroupNode.js';

class NumberGroupNode extends GroupNode {
  /**
   * @param {NumberGroup} numberGroup
   * @param {Object} [options]
   */
  constructor( numberGroup, options ) {
    assert && assert( numberGroup instanceof NumberGroup );

    options = merge( {
      hasCardBackground: true,
      dragBoundsProperty: null,
      removeLastListener: null,

      // node options
      cursor: 'pointer'
    }, options );

    super( numberGroup, options );

    // @public {NumberGroup}
    this.numberGroup = numberGroup;

    const createSpot = spot => {
      const outline = Rectangle.bounds( spot.bounds, {
        stroke: FractionsCommonColors.numberOutlineProperty,
        lineDash: [ 10, 5 ],
        lineWidth: 2,
        lineJoin: 'round'
      } );
      const text = new Text( ' ', {
        fill: FractionsCommonColors.numberTextFillProperty,
        font: spot.type === NumberSpotType.WHOLE ? FractionsCommonConstants.NUMBER_WHOLE_FONT : FractionsCommonConstants.NUMBER_FRACTIONAL_FONT,
        center: outline.center
      } );
      const notAllowedSize = spot.bounds.width * 0.6; // Find the right ratio?
      const notAllowedShape = new Shape().circle( 0, 0, notAllowedSize )
        .moveToPoint( Vector2.createPolar( notAllowedSize, -0.25 * Math.PI ) )
        .lineToPoint( Vector2.createPolar( notAllowedSize, 0.75 * Math.PI ) );
      const notAllowedNode = new Path( notAllowedShape, {
        stroke: FractionsCommonColors.numberNotAllowedProperty,
        lineWidth: 3,
        center: outline.center
      } );
      this.itemsToDispose.push( Multilink.multilink( [ spot.pieceProperty, spot.showNotAllowedProperty ], ( piece, notAllowed ) => {
        if ( piece !== null ) {
          text.string = piece.number;
          text.center = outline.center;
        }
        text.visible = piece !== null;
        outline.visible = !text.visible && !notAllowed;
        notAllowedNode.visible = !text.visible && notAllowed;
      } ) );
      return new Node( { children: [ outline, notAllowedNode, text ] } );
    };

    const numeratorSpot = createSpot( numberGroup.numeratorSpot );
    const denominatorSpot = createSpot( numberGroup.denominatorSpot );
    let wholeSpot;
    if ( numberGroup.isMixedNumber ) {
      wholeSpot = createSpot( numberGroup.wholeSpot );
    }

    const cardBackground = new Rectangle( {
      fill: FractionsCommonColors.numberFillProperty,
      stroke: FractionsCommonColors.numberStrokeProperty,
      cornerRadius: FractionsCommonConstants.NUMBER_CORNER_RADIUS
    } );

    // @private {function}
    this.completeVisibilityListener = isComplete => {
      cardBackground.visible = isComplete;
    };
    this.numberGroup.isCompleteProperty.link( this.completeVisibilityListener );

    const fractionLine = new Line( {
      lineCap: 'round',
      lineWidth: 4,
      stroke: FractionsCommonColors.numberFractionLineProperty
    } );

    // @private {Node}
    this.returnButton = new ReturnButton( options.removeLastListener );
    this.returnButton.touchArea = this.returnButton.localBounds.dilated( 10 );
    this.itemsToDispose.push( this.returnButton );

    // @private {function}
    this.allSpotsBoundsListener = allSpotsBounds => {
      const expandedBounds = allSpotsBounds.dilatedX( 5 );
      this.displayLayer.mouseArea = expandedBounds;
      this.displayLayer.touchArea = expandedBounds;
      cardBackground.rectBounds = allSpotsBounds.dilatedXY( 20, 15 );
      this.returnButton.rightCenter = cardBackground.leftCenter.plusXY( 5, 0 ); // Some slight overlap shown in mockups
    };
    this.numberGroup.allSpotsBoundsProperty.link( this.allSpotsBoundsListener );

    // @private {function}
    this.fractionLineLengthListener = hasDoubleDigits => {
      const lineWidth = hasDoubleDigits ? 60 : 40;
      fractionLine.x1 = -lineWidth / 2 + numberGroup.numeratorSpot.bounds.centerX;
      fractionLine.x2 = lineWidth / 2 + numberGroup.numeratorSpot.bounds.centerX;
    };
    this.numberGroup.hasDoubleDigitsProperty.link( this.fractionLineLengthListener );

    // @private {function}
    this.undoVisibilityListener = Multilink.multilink( [ numberGroup.hasPiecesProperty, this.isSelectedProperty ], ( hasPieces, isSelected ) => {
      this.returnButton.visible = hasPieces && isSelected;
    } );
    this.itemsToDispose.push( this.undoVisibilityListener );

    this.controlLayer.children = [
      ...( this.isIcon ? [] : [ this.returnButton ] )
    ];

    this.displayLayer.children = [
      ...( options.hasCardBackground ? [ cardBackground ] : [] ),
      fractionLine,
      numeratorSpot,
      denominatorSpot,
      ...( numberGroup.isMixedNumber ? [ wholeSpot ] : [] )
    ];

    if ( !this.isIcon ) {
      // @private {Property.<Bounds2>}
      this.dragBoundsProperty = new DerivedProperty( [ options.dragBoundsProperty, this.numberGroup.allSpotsBoundsProperty ], ( dragBounds, allSpotsBounds ) => {
        return dragBounds.withOffsets( cardBackground.left, cardBackground.top, -cardBackground.right, -cardBackground.bottom );
      } );
      this.itemsToDispose.push( this.dragBoundsProperty );

      // Keep the group in the drag bounds (when they change)
      // No need to unlink, as we own the given Property
      this.dragBoundsProperty.lazyLink( dragBounds => {
        numberGroup.positionProperty.value = dragBounds.closestPointTo( numberGroup.positionProperty.value );
      } );

      this.attachDragListener( this.dragBoundsProperty, options );
    }

    this.mutate( options );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.numberGroup.isCompleteProperty.unlink( this.completeVisibilityListener );
    this.numberGroup.hasDoubleDigitsProperty.unlink( this.fractionLineLengthListener );
    this.numberGroup.allSpotsBoundsProperty.unlink( this.allSpotsBoundsListener );

    super.dispose();
  }

  /**
   * Creates an icon for the number group node.
   * @public
   *
   * @param {boolean} isMixedNumber
   * @returns {Node}
   */
  static createIcon( isMixedNumber ) {
    return new NumberGroupNode( new NumberGroup( isMixedNumber ), {
      isIcon: true,
      scale: FractionsCommonConstants.NUMBER_BUILD_SCALE,
      pickable: false
    } );
  }
}

fractionsCommon.register( 'NumberGroupNode', NumberGroupNode );
export default NumberGroupNode;