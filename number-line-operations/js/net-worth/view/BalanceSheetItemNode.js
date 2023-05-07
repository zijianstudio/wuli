// Copyright 2020-2022, University of Colorado Boulder

/**
 * BalanceSheetItemNode is the view representation of a ValueItem, which is the general term being used in this
 * sim for assets and debts.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, DragListener, HBox, Image, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import asset100_png from '../../../images/asset100_png.js';
import asset100Value_png from '../../../images/asset100Value_png.js';
import asset200_png from '../../../images/asset200_png.js';
import asset200Value_png from '../../../images/asset200Value_png.js';
import asset300_png from '../../../images/asset300_png.js';
import asset300Value_png from '../../../images/asset300Value_png.js';
import asset400_png from '../../../images/asset400_png.js';
import asset400Value_png from '../../../images/asset400Value_png.js';
import debt100_png from '../../../images/debt100_png.js';
import debt100Value_png from '../../../images/debt100Value_png.js';
import debt200_png from '../../../images/debt200_png.js';
import debt200Value_png from '../../../images/debt200Value_png.js';
import debt300_png from '../../../images/debt300_png.js';
import debt300Value_png from '../../../images/debt300Value_png.js';
import debt400_png from '../../../images/debt400_png.js';
import debt400Value_png from '../../../images/debt400Value_png.js';
import numberLineOperations from '../../numberLineOperations.js';
import NumberLineOperationsStrings from '../../NumberLineOperationsStrings.js';

//---------------------------------------------------------------------------------------------------------------------
// constants
//---------------------------------------------------------------------------------------------------------------------

// Dimensions of the icons used for the in-bag representations.  The images will be fit to this size.  This is done so
// that the in-bag items align well in the bags.
const IN_BAG_ICON_DIMENSIONS = new Dimension2( 50, 37 );

// Create a map of asset/debt values to the images, sizes, and other information necessary to create the node for a
// particular value.  Note that the width is the only size provided, and the aspect ratio of the image ends up defining
// the height in the view.
const MAP_OF_VALUES_TO_IMAGE_INFO = new Map( [
  [
    100,
    {
      outOfBagImage: asset100Value_png,
      outOfBagWidth: 80,
      inBagImage: asset100_png
    }
  ],
  [
    200,
    {
      outOfBagImage: asset200Value_png,
      outOfBagWidth: 85,
      outOfBagLabelOffset: new Vector2( 0, -3 ),
      inBagImage: asset200_png
    }
  ],
  [
    300,
    {
      outOfBagImage: asset300Value_png,
      outOfBagWidth: 100,
      outOfBagLabelOffset: new Vector2( 0, 5 ),
      inBagImage: asset300_png
    }
  ],
  [
    400,
    {
      outOfBagImage: asset400Value_png,
      outOfBagWidth: 50,
      outOfBagLabelOffset: new Vector2( 0, 7 ),
      inBagImage: asset400_png
    }
  ],
  [
    -100,
    {
      outOfBagImage: debt100Value_png,
      outOfBagWidth: 65,
      outOfBagLabelOffset: new Vector2( 0, 2 ),
      inBagImage: debt100_png
    }
  ],
  [
    -200,
    {
      outOfBagImage: debt200Value_png,
      outOfBagWidth: 70,
      outOfBagLabelOffset: new Vector2( 8, -2 ),
      inBagImage: debt200_png
    }
  ],
  [
    -300,
    {
      outOfBagImage: debt300Value_png,
      outOfBagWidth: 65,
      inBagImage: debt300_png
    }
  ],
  [
    -400,
    {
      outOfBagImage: debt400Value_png,
      outOfBagWidth: 70,
      outOfBagLabelOffset: new Vector2( 8, -2 ),
      inBagImage: debt400_png
    }
  ]
] );

class BalanceSheetItemNode extends Node {

  /**
   * @param {ValueItem} balanceSheetItem
   */
  constructor( balanceSheetItem ) {

    // Get the imageInfo that is associated with this balance sheet item's value.
    const imageInfo = MAP_OF_VALUES_TO_IMAGE_INFO.get( balanceSheetItem.value );
    assert && assert( imageInfo, `no imageInfo found for value ${balanceSheetItem.value}` );

    // out-of-bag image - shown when the balance sheet item is not in a balance sheet item bag
    const outOfBagImageNode = new Image( imageInfo.outOfBagImage, {
      cursor: 'pointer',
      maxWidth: imageInfo.outOfBagWidth,
      center: Vector2.ZERO
    } );

    // in-bag image - shown when the balance sheet item is in a balance sheet item bag
    const inBagImageNode = new Image( imageInfo.inBagImage, {
      cursor: 'pointer',
      maxWidth: IN_BAG_ICON_DIMENSIONS.width,
      maxHeight: IN_BAG_ICON_DIMENSIONS.height,
      centerX: IN_BAG_ICON_DIMENSIONS.width / 2,
      centerY: IN_BAG_ICON_DIMENSIONS.height / 2
    } );

    // background for the in-bag icon, this keeps the icons the same size in the layout
    const inBagIconBackground = Rectangle.dimension( IN_BAG_ICON_DIMENSIONS, {
      fill: Color.TRANSPARENT,
      children: [ inBagImageNode ]
    } );

    const currencyString = StringUtils.fillIn( NumberLineOperationsStrings.currencyValuePattern, {
      sign: '', // don't show minus sign for debts, since that would be a sort of double negative
      currencyUnits: NumberLineOperationsStrings.currencyUnits,
      value: Math.abs( balanceSheetItem.value )
    } );

    const outOfBagLabelNode = new Text( currencyString, {
      font: new PhetFont( 18 ),
      center: imageInfo.outOfBagLabelOffset || Vector2.ZERO,
      maxWidth: outOfBagImageNode.width * 0.75 // empirically determined such that the label fits on all artwork
    } );
    const outOfBagRepresentationNode = new Node( { children: [ outOfBagImageNode, outOfBagLabelNode ] } );

    const inBagLabelNode = new Text( currencyString, {
      font: new PhetFont( 20 ),
      maxWidth: 60
    } );

    const inBagRepresentationNode = new HBox( {
      children: [ inBagIconBackground, inBagLabelNode ],
      spacing: 10,
      center: outOfBagImageNode.center
    } );

    // Special Case: There are two values that are loans, and the word "loan" appeared on the original artwork.  We
    // realized fairly late in the game that this word should be translatable, so the following code handles that case.
    // It's specific to the loan images, and is thus fairly fragile, but it was the most expedient way to handle the
    // situation.  If other labels are ever needed, this should be generalized instead of continuing to follow this
    // approach.
    if ( balanceSheetItem.value === -100 || balanceSheetItem.value === -300 ) {

      // out-of-bag representation
      const outOfBagTextLabelNode = new Text( NumberLineOperationsStrings.loan, {
        font: new PhetFont( { size: 11, family: 'serif', style: 'italic' } ),
        centerX: 0,
        centerY: outOfBagImageNode.bottom - 15, // offset empirically determined
        maxWidth: outOfBagImageNode.width * 0.65
      } );
      outOfBagRepresentationNode.addChild( outOfBagTextLabelNode );

      // in-bag representation
      const inBagTextLabelNode = new Text( NumberLineOperationsStrings.loan, {
        font: new PhetFont( { size: 8, family: 'serif', style: 'italic' } ),
        centerX: inBagImageNode.centerX,
        centerY: inBagImageNode.bottom - 8, // offset empirically determined
        maxWidth: inBagImageNode.width * 0.65
      } );
      inBagIconBackground.addChild( inBagTextLabelNode );
    }

    super( {
      children: [ outOfBagRepresentationNode, inBagRepresentationNode ],
      cursor: 'pointer'
    } );

    // Prevent from being grabbed when animating, unlink not needed.
    balanceSheetItem.inProgressAnimationProperty.link( inProgressAnimation => {
      this.pickable = inProgressAnimation === null;
    } );

    // Update the visibility of the representations based on whether this item is in a balance sheet item bag.  No
    // unlink is needed.
    balanceSheetItem.inBagProperty.link( inBag => {

      // adjust node visibility
      outOfBagRepresentationNode.visible = !inBag;
      inBagRepresentationNode.visible = inBag;

      // adjust touch and mouse areas, dilation amounts empirically determined, check for overlap if changed
      if ( inBag ) {
        this.touchArea = inBagRepresentationNode.bounds.dilatedXY( 10, 4 );
        this.mouseArea = inBagRepresentationNode.bounds;
      }
      else {
        this.touchArea = outOfBagRepresentationNode.bounds.dilatedXY( 10, 6 );
        this.mouseArea = outOfBagRepresentationNode.bounds;
      }
    } );

    // drag handler
    let dragOffset = Vector2.ZERO;
    this.addInputListener( new DragListener( {

      dragBoundsProperty: new Property( this.layoutBounds ),

      start: event => {
        balanceSheetItem.isDraggingProperty.value = true;
        const dragStartPoint = this.globalToParentPoint( event.pointer.point ); // point in parent frame
        dragOffset = balanceSheetItem.positionProperty.value.minus( dragStartPoint );
        this.moveToFront(); // move to the front of the z-order in whatever layer this node is in
      },

      drag: event => {
        const dragPoint = this.globalToParentPoint( event.pointer.point );
        balanceSheetItem.teleportTo( dragPoint.plus( dragOffset ) );
      },

      end: () => {
        balanceSheetItem.isDraggingProperty.value = false;
      }
    } ) );

    // Position this node based on the model element position.  Note that there is no model-view transform, since we are
    // using the same coordinate system in both the model and view.  No unlink is needed.
    balanceSheetItem.positionProperty.link( position => {
      this.center = position;
    } );
  }
}

numberLineOperations.register( 'BalanceSheetItemNode', BalanceSheetItemNode );
export default BalanceSheetItemNode;