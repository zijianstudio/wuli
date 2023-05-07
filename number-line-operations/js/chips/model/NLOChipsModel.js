// Copyright 2020-2021, University of Colorado Boulder

/**
 * NLOChipsModel is the primary model for the "Chips" screen.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import HoldingBag from '../../common/model/HoldingBag.js';
import HoldingBox from '../../common/model/HoldingBox.js';
import Operation from '../../common/model/Operation.js';
import OperationTrackingNumberLine from '../../common/model/OperationTrackingNumberLine.js';
import ValueItem from '../../common/model/ValueItem.js';
import NLOConstants from '../../common/NLOConstants.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const CHIPS_NUMBER_LINE_RANGE = new Range( -15, 15 );
const HOLDING_BOX_SIZE = new Dimension2( 122, 320 ); // empirically determined to fit the items that will go in it
const NUMBER_OF_POSITIVE_CHIPS = 5;
const NUMBER_OF_NEGATIVE_CHIPS = 5;

class NLOChipsModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // @public (read-write) - total value of the chips that have been placed into bags
    this.totalInBagsProperty = new NumberProperty( 0 );

    // @public (read-write)
    this.netWorthAccordionBoxExpandedProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'netWorthAccordionBoxExpandedProperty' )
    } );

    // @public (read-only) - the number line upon which the total value and the various operation will be portrayed
    this.numberLine = new OperationTrackingNumberLine(
      NLOConstants.LAYOUT_BOUNDS.center.minusXY( 0, 110 ),
      {
        initialDisplayedRange: CHIPS_NUMBER_LINE_RANGE,
        tickMarksInitiallyVisible: true,
        preventOverlap: false,
        automaticallyDeactivateOperations: true,

        // width of the number line in model space, number empirically determined to match design
        widthInModelSpace: NLOConstants.NUMBER_LINE_WIDTH
      }
    );

    // convenience variable (note that there is only one operation shown on this number line)
    const operation = this.numberLine.operations[ 0 ];

    // @public (read-only) {ValueItem[]} - list of the chips that the user can manipulate
    this.chips = [];
    _.times( NUMBER_OF_POSITIVE_CHIPS, index => { this.chips.push( new ValueItem( index + 1 ) ); } );
    _.times( NUMBER_OF_NEGATIVE_CHIPS, index => { this.chips.push( new ValueItem( -( index + 1 ) ) ); } );

    // Add the storage areas for the chips - this is where they reside when not in use.
    const chipHoldingBox = 290;
    this.negativeChipsBox = new HoldingBox(
      new Vector2( 105, chipHoldingBox ),
      HOLDING_BOX_SIZE,
      this.chips.filter( item => item.value < 0 ).sort( ( a, b ) => b.value - a.value )
    );
    this.positiveChipsBox = new HoldingBox(
      new Vector2( 800, chipHoldingBox ),
      HOLDING_BOX_SIZE,
      this.chips.filter( item => item.value > 0 ).sort()
    );
    this.storageBoxes = [ this.positiveChipsBox, this.negativeChipsBox ];

    // Add the positive and negative chip bags.
    const holdingBagsCenterY = 475;
    this.negativeChipsBag = new HoldingBag( new Vector2( 380, holdingBagsCenterY ), {
      itemAcceptanceTest: HoldingBag.ACCEPT_ONLY_NEGATIVE_VALUES,
      capacity: NUMBER_OF_NEGATIVE_CHIPS
    } );
    this.positiveChipsBag = new HoldingBag( new Vector2( 645, holdingBagsCenterY ), {
      itemAcceptanceTest: HoldingBag.ACCEPT_ONLY_POSITIVE_VALUES,
      capacity: NUMBER_OF_POSITIVE_CHIPS
    } );
    this.bags = [ this.negativeChipsBag, this.positiveChipsBag ];

    // Monitor the isDragging state of each chip and, when it transitions to false, either add it to a bag or return it
    // to a storage box based on where it was dropped.  No unlink is necessary.
    this.chips.forEach( chip => {
      chip.isDraggingProperty.lazyLink( isDragging => {
        if ( isDragging ) {

          // If the item was in one of the bags, remove it.
          this.bags.forEach( bag => {
            if ( bag.containsItem( chip ) ) {
              bag.removeItem( chip );

              // Update the operation on the number line to reflect this latest transaction.  Cycle the inactive state
              // to trigger the animation in the view.
              operation.isActiveProperty.set( false );
              this.numberLine.startingValueProperty.set( this.totalInBagsProperty.value );
              operation.operationTypeProperty.set( Operation.SUBTRACTION );
              operation.amountProperty.set( chip.value );
              operation.isActiveProperty.set( true );
            }
          } );
        }
        else {

          // The item was released by the user.  Add it to a bag or return it to the appropriate storage area.
          let addedToBag = false;
          this.bags.forEach( bag => {
            if ( bag.acceptsItem( chip ) && bag.isWithinCaptureRange( chip ) ) {
              bag.addItem( chip );
              addedToBag = true;

              this.numberLine.startingValueProperty.set( this.totalInBagsProperty.value );

              // Update the operation.  The "active" state is cycled in order to trigger animation in the view.
              operation.isActiveProperty.set( false );
              operation.operationTypeProperty.set( Operation.ADDITION );
              operation.amountProperty.set( chip.value );
              operation.isActiveProperty.set( true );
            }
          } );
          if ( !addedToBag ) {
            this.returnItemToStorage( chip );
          }
        }
        this.totalInBagsProperty.set( this.positiveChipsBag.getTotalValue() + this.negativeChipsBag.getTotalValue() );
      } );
    } );
  }

  /**
   * Reset the model.
   * @public
   */
  reset() {

    // Reset initial state of all chips.
    this.chips.forEach( chip => {

      // See if this chip is in a bag and remove it if so.
      let itemRemovedFromBag = false;
      this.bags.forEach( bag => {
        if ( bag.containsItem( chip ) ) {
          bag.removeItem( chip );
          itemRemovedFromBag = true;
        }
      } );

      // If it was removed from a bag, add it back to its storage box.
      if ( itemRemovedFromBag ) {
        this.returnItemToStorage( chip );
      }
    } );

    this.netWorthAccordionBoxExpandedProperty.reset();
    this.numberLine.reset();
    this.totalInBagsProperty.reset();
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

// statics
NLOChipsModel.CHIPS_NUMBER_LINE_RANGE = CHIPS_NUMBER_LINE_RANGE;

numberLineOperations.register( 'NLOChipsModel', NLOChipsModel );
export default NLOChipsModel;