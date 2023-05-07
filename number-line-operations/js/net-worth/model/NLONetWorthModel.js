// Copyright 2020-2021, University of Colorado Boulder

/**
 * NLONetWorthModel is the primary model for the "Net Worth" screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import HoldingBag from '../../common/model/HoldingBag.js';
import HoldingBox from '../../common/model/HoldingBox.js';
import Operation from '../../common/model/Operation.js';
import OperationTrackingNumberLine from '../../common/model/OperationTrackingNumberLine.js';
import ValueItem from '../../common/model/ValueItem.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const HOLDING_BOX_SIZE = new Dimension2( 122, 300 ); // empirically determined to fit the items that will go in it

class NLONetWorthModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public (read-write) - total net worth, which is total assets minus total liabilities
    this.netWorthProperty = new NumberProperty( 0 );

    // @public (read-write)
    this.netWorthAccordionBoxExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'netWorthAccordionBoxExpandedProperty' )
    } );

    // @public (read-only) - the number line upon which the net worth and the various operation will be portrayed
    this.numberLine = new OperationTrackingNumberLine(
      NLOConstants.LAYOUT_BOUNDS.center.minusXY( 0, 110 ),
      {
        initialDisplayedRange: NLOConstants.NET_WORTH_RANGE,
        tickMarksInitiallyVisible: true,
        preventOverlap: false,
        automaticallyDeactivateOperations: true,

        // width of the number line in model space, number empirically determined to match design
        widthInModelSpace: NLOConstants.NUMBER_LINE_WIDTH
      }
    );

    // convenience variable (note that there is only one operation shown on this number line)
    const operation = this.numberLine.operations[ 0 ];

    // @public (read-only) - list of balance sheet items (i.e. assets and debts) that the user can manipulate
    this.balanceSheetItems = [
      new ValueItem( -400 ),
      new ValueItem( -300 ),
      new ValueItem( -200 ),
      new ValueItem( -100 ),
      new ValueItem( 100 ),
      new ValueItem( 200 ),
      new ValueItem( 300 ),
      new ValueItem( 400 )
    ];

    // Add the storage areas for the balance sheet items - this is where they reside when not in use.
    const balanceItemBoxesTop = 310;
    this.debtsBox = new HoldingBox(
      new Vector2( 105, balanceItemBoxesTop ),
      HOLDING_BOX_SIZE,
      this.balanceSheetItems.filter( item => item.value < 0 ).sort( ( a, b ) => b.value - a.value )
    );
    this.assetsBox = new HoldingBox(
      new Vector2( 800, balanceItemBoxesTop ),
      HOLDING_BOX_SIZE,
      this.balanceSheetItems.filter( item => item.value > 0 ).sort()
    );
    this.storageBoxes = [ this.assetsBox, this.debtsBox ];

    // Add the asset and debt bags.
    const balanceItemBagsCenterY = 475;
    this.debtsBag = new HoldingBag( new Vector2( 380, balanceItemBagsCenterY ), {
      itemAcceptanceTest: HoldingBag.ACCEPT_ONLY_NEGATIVE_VALUES
    } );
    this.assetsBag = new HoldingBag( new Vector2( 645, balanceItemBagsCenterY ), {
      itemAcceptanceTest: HoldingBag.ACCEPT_ONLY_POSITIVE_VALUES
    } );
    this.bags = [ this.debtsBag, this.assetsBag ];

    // Monitor the isDragging state of each balance sheet item and, when it transitions to false, either add it to a
    // bag or return it to a storage box based on where it was dropped.  No unlink is necessary.
    this.balanceSheetItems.forEach( balanceSheetItem => {
      balanceSheetItem.isDraggingProperty.lazyLink( isDragging => {
        if ( isDragging ) {

          // If the item was in one of the bags, remove it.
          this.bags.forEach( bag => {
            if ( bag.containsItem( balanceSheetItem ) ) {
              bag.removeItem( balanceSheetItem );

              // Update the operation on the number line to reflect this latest transaction.  Cycle the inactive state
              // to trigger the animation in the view.
              operation.isActiveProperty.set( false );
              this.numberLine.startingValueProperty.set( this.netWorthProperty.value );
              operation.operationTypeProperty.set( Operation.SUBTRACTION );
              operation.amountProperty.set( balanceSheetItem.value );
              operation.isActiveProperty.set( true );
            }
          } );
        }
        else {

          // The item was released by the user.  Add it to a bag or return it to the appropriate storage area.
          let addedToBag = false;
          this.bags.forEach( bag => {
            if ( bag.acceptsItem( balanceSheetItem ) && bag.isWithinCaptureRange( balanceSheetItem ) ) {
              bag.addItem( balanceSheetItem );
              addedToBag = true;

              // Update the starting value.
              this.numberLine.startingValueProperty.set( this.netWorthProperty.value );

              // Update the operation.  The "active" state is cycled in order to trigger animation in the view.
              operation.isActiveProperty.set( false );
              operation.operationTypeProperty.set( Operation.ADDITION );
              operation.amountProperty.set( balanceSheetItem.value );
              operation.isActiveProperty.set( true );
            }
          } );
          if ( !addedToBag ) {
            this.returnItemToStorage( balanceSheetItem );
          }
        }
        this.netWorthProperty.set( this.assetsBag.getTotalValue() + this.debtsBag.getTotalValue() );
      } );
    } );
  }

  /**
   * Resets the model.
   * @public
   */
  reset() {

    // Reset initial state of all balance sheet items.
    this.balanceSheetItems.forEach( balanceSheetItem => {

      // See if this item is in a bag and remove it if so.
      let itemRemovedFromBag = false;
      this.bags.forEach( bag => {
        if ( bag.containsItem( balanceSheetItem ) ) {
          bag.removeItem( balanceSheetItem );
          itemRemovedFromBag = true;
        }
      } );

      // If it was removed from a bag, add it back to its storage box.
      if ( itemRemovedFromBag ) {
        this.returnItemToStorage( balanceSheetItem );
      }
    } );

    this.netWorthAccordionBoxExpandedProperty.reset();
    this.numberLine.reset();
    this.netWorthProperty.reset();
  }

  /**
   * @param {ValueItem} item
   * @private
   */
  returnItemToStorage( item ) {
    this.storageBoxes.forEach( storageBox => {
      if ( storageBox.holdsItem( item ) ) {
        storageBox.returnItem( item, true );
      }
    } );
  }

  /**
   * @public
   */
  step() {
    this.numberLine.step();
  }
}

numberLineOperations.register( 'NLONetWorthModel', NLONetWorthModel );
export default NLONetWorthModel;