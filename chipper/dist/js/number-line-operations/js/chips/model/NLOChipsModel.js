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
const CHIPS_NUMBER_LINE_RANGE = new Range(-15, 15);
const HOLDING_BOX_SIZE = new Dimension2(122, 320); // empirically determined to fit the items that will go in it
const NUMBER_OF_POSITIVE_CHIPS = 5;
const NUMBER_OF_NEGATIVE_CHIPS = 5;
class NLOChipsModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    // @public (read-write) - total value of the chips that have been placed into bags
    this.totalInBagsProperty = new NumberProperty(0);

    // @public (read-write)
    this.netWorthAccordionBoxExpandedProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('netWorthAccordionBoxExpandedProperty')
    });

    // @public (read-only) - the number line upon which the total value and the various operation will be portrayed
    this.numberLine = new OperationTrackingNumberLine(NLOConstants.LAYOUT_BOUNDS.center.minusXY(0, 110), {
      initialDisplayedRange: CHIPS_NUMBER_LINE_RANGE,
      tickMarksInitiallyVisible: true,
      preventOverlap: false,
      automaticallyDeactivateOperations: true,
      // width of the number line in model space, number empirically determined to match design
      widthInModelSpace: NLOConstants.NUMBER_LINE_WIDTH
    });

    // convenience variable (note that there is only one operation shown on this number line)
    const operation = this.numberLine.operations[0];

    // @public (read-only) {ValueItem[]} - list of the chips that the user can manipulate
    this.chips = [];
    _.times(NUMBER_OF_POSITIVE_CHIPS, index => {
      this.chips.push(new ValueItem(index + 1));
    });
    _.times(NUMBER_OF_NEGATIVE_CHIPS, index => {
      this.chips.push(new ValueItem(-(index + 1)));
    });

    // Add the storage areas for the chips - this is where they reside when not in use.
    const chipHoldingBox = 290;
    this.negativeChipsBox = new HoldingBox(new Vector2(105, chipHoldingBox), HOLDING_BOX_SIZE, this.chips.filter(item => item.value < 0).sort((a, b) => b.value - a.value));
    this.positiveChipsBox = new HoldingBox(new Vector2(800, chipHoldingBox), HOLDING_BOX_SIZE, this.chips.filter(item => item.value > 0).sort());
    this.storageBoxes = [this.positiveChipsBox, this.negativeChipsBox];

    // Add the positive and negative chip bags.
    const holdingBagsCenterY = 475;
    this.negativeChipsBag = new HoldingBag(new Vector2(380, holdingBagsCenterY), {
      itemAcceptanceTest: HoldingBag.ACCEPT_ONLY_NEGATIVE_VALUES,
      capacity: NUMBER_OF_NEGATIVE_CHIPS
    });
    this.positiveChipsBag = new HoldingBag(new Vector2(645, holdingBagsCenterY), {
      itemAcceptanceTest: HoldingBag.ACCEPT_ONLY_POSITIVE_VALUES,
      capacity: NUMBER_OF_POSITIVE_CHIPS
    });
    this.bags = [this.negativeChipsBag, this.positiveChipsBag];

    // Monitor the isDragging state of each chip and, when it transitions to false, either add it to a bag or return it
    // to a storage box based on where it was dropped.  No unlink is necessary.
    this.chips.forEach(chip => {
      chip.isDraggingProperty.lazyLink(isDragging => {
        if (isDragging) {
          // If the item was in one of the bags, remove it.
          this.bags.forEach(bag => {
            if (bag.containsItem(chip)) {
              bag.removeItem(chip);

              // Update the operation on the number line to reflect this latest transaction.  Cycle the inactive state
              // to trigger the animation in the view.
              operation.isActiveProperty.set(false);
              this.numberLine.startingValueProperty.set(this.totalInBagsProperty.value);
              operation.operationTypeProperty.set(Operation.SUBTRACTION);
              operation.amountProperty.set(chip.value);
              operation.isActiveProperty.set(true);
            }
          });
        } else {
          // The item was released by the user.  Add it to a bag or return it to the appropriate storage area.
          let addedToBag = false;
          this.bags.forEach(bag => {
            if (bag.acceptsItem(chip) && bag.isWithinCaptureRange(chip)) {
              bag.addItem(chip);
              addedToBag = true;
              this.numberLine.startingValueProperty.set(this.totalInBagsProperty.value);

              // Update the operation.  The "active" state is cycled in order to trigger animation in the view.
              operation.isActiveProperty.set(false);
              operation.operationTypeProperty.set(Operation.ADDITION);
              operation.amountProperty.set(chip.value);
              operation.isActiveProperty.set(true);
            }
          });
          if (!addedToBag) {
            this.returnItemToStorage(chip);
          }
        }
        this.totalInBagsProperty.set(this.positiveChipsBag.getTotalValue() + this.negativeChipsBag.getTotalValue());
      });
    });
  }

  /**
   * Reset the model.
   * @public
   */
  reset() {
    // Reset initial state of all chips.
    this.chips.forEach(chip => {
      // See if this chip is in a bag and remove it if so.
      let itemRemovedFromBag = false;
      this.bags.forEach(bag => {
        if (bag.containsItem(chip)) {
          bag.removeItem(chip);
          itemRemovedFromBag = true;
        }
      });

      // If it was removed from a bag, add it back to its storage box.
      if (itemRemovedFromBag) {
        this.returnItemToStorage(chip);
      }
    });
    this.netWorthAccordionBoxExpandedProperty.reset();
    this.numberLine.reset();
    this.totalInBagsProperty.reset();
  }

  /**
   * @param {ValueItem} item
   * @private
   */
  returnItemToStorage(item) {
    this.storageBoxes.forEach(storageBox => {
      if (storageBox.holdsItem(item)) {
        storageBox.returnItem(item, true);
      }
    });
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
numberLineOperations.register('NLOChipsModel', NLOChipsModel);
export default NLOChipsModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlZlY3RvcjIiLCJIb2xkaW5nQmFnIiwiSG9sZGluZ0JveCIsIk9wZXJhdGlvbiIsIk9wZXJhdGlvblRyYWNraW5nTnVtYmVyTGluZSIsIlZhbHVlSXRlbSIsIk5MT0NvbnN0YW50cyIsIm51bWJlckxpbmVPcGVyYXRpb25zIiwiQ0hJUFNfTlVNQkVSX0xJTkVfUkFOR0UiLCJIT0xESU5HX0JPWF9TSVpFIiwiTlVNQkVSX09GX1BPU0lUSVZFX0NISVBTIiwiTlVNQkVSX09GX05FR0FUSVZFX0NISVBTIiwiTkxPQ2hpcHNNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwidG90YWxJbkJhZ3NQcm9wZXJ0eSIsIm5ldFdvcnRoQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsIm51bWJlckxpbmUiLCJMQVlPVVRfQk9VTkRTIiwiY2VudGVyIiwibWludXNYWSIsImluaXRpYWxEaXNwbGF5ZWRSYW5nZSIsInRpY2tNYXJrc0luaXRpYWxseVZpc2libGUiLCJwcmV2ZW50T3ZlcmxhcCIsImF1dG9tYXRpY2FsbHlEZWFjdGl2YXRlT3BlcmF0aW9ucyIsIndpZHRoSW5Nb2RlbFNwYWNlIiwiTlVNQkVSX0xJTkVfV0lEVEgiLCJvcGVyYXRpb24iLCJvcGVyYXRpb25zIiwiY2hpcHMiLCJfIiwidGltZXMiLCJpbmRleCIsInB1c2giLCJjaGlwSG9sZGluZ0JveCIsIm5lZ2F0aXZlQ2hpcHNCb3giLCJmaWx0ZXIiLCJpdGVtIiwidmFsdWUiLCJzb3J0IiwiYSIsImIiLCJwb3NpdGl2ZUNoaXBzQm94Iiwic3RvcmFnZUJveGVzIiwiaG9sZGluZ0JhZ3NDZW50ZXJZIiwibmVnYXRpdmVDaGlwc0JhZyIsIml0ZW1BY2NlcHRhbmNlVGVzdCIsIkFDQ0VQVF9PTkxZX05FR0FUSVZFX1ZBTFVFUyIsImNhcGFjaXR5IiwicG9zaXRpdmVDaGlwc0JhZyIsIkFDQ0VQVF9PTkxZX1BPU0lUSVZFX1ZBTFVFUyIsImJhZ3MiLCJmb3JFYWNoIiwiY2hpcCIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsImxhenlMaW5rIiwiaXNEcmFnZ2luZyIsImJhZyIsImNvbnRhaW5zSXRlbSIsInJlbW92ZUl0ZW0iLCJpc0FjdGl2ZVByb3BlcnR5Iiwic2V0Iiwic3RhcnRpbmdWYWx1ZVByb3BlcnR5Iiwib3BlcmF0aW9uVHlwZVByb3BlcnR5IiwiU1VCVFJBQ1RJT04iLCJhbW91bnRQcm9wZXJ0eSIsImFkZGVkVG9CYWciLCJhY2NlcHRzSXRlbSIsImlzV2l0aGluQ2FwdHVyZVJhbmdlIiwiYWRkSXRlbSIsIkFERElUSU9OIiwicmV0dXJuSXRlbVRvU3RvcmFnZSIsImdldFRvdGFsVmFsdWUiLCJyZXNldCIsIml0ZW1SZW1vdmVkRnJvbUJhZyIsInN0b3JhZ2VCb3giLCJob2xkc0l0ZW0iLCJyZXR1cm5JdGVtIiwic3RlcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTkxPQ2hpcHNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOTE9DaGlwc01vZGVsIGlzIHRoZSBwcmltYXJ5IG1vZGVsIGZvciB0aGUgXCJDaGlwc1wiIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBIb2xkaW5nQmFnIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Ib2xkaW5nQmFnLmpzJztcclxuaW1wb3J0IEhvbGRpbmdCb3ggZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0hvbGRpbmdCb3guanMnO1xyXG5pbXBvcnQgT3BlcmF0aW9uIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9PcGVyYXRpb24uanMnO1xyXG5pbXBvcnQgT3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9PcGVyYXRpb25UcmFja2luZ051bWJlckxpbmUuanMnO1xyXG5pbXBvcnQgVmFsdWVJdGVtIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9WYWx1ZUl0ZW0uanMnO1xyXG5pbXBvcnQgTkxPQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9OTE9Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZU9wZXJhdGlvbnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZU9wZXJhdGlvbnMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENISVBTX05VTUJFUl9MSU5FX1JBTkdFID0gbmV3IFJhbmdlKCAtMTUsIDE1ICk7XHJcbmNvbnN0IEhPTERJTkdfQk9YX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTIyLCAzMjAgKTsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBmaXQgdGhlIGl0ZW1zIHRoYXQgd2lsbCBnbyBpbiBpdFxyXG5jb25zdCBOVU1CRVJfT0ZfUE9TSVRJVkVfQ0hJUFMgPSA1O1xyXG5jb25zdCBOVU1CRVJfT0ZfTkVHQVRJVkVfQ0hJUFMgPSA1O1xyXG5cclxuY2xhc3MgTkxPQ2hpcHNNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpIC0gdG90YWwgdmFsdWUgb2YgdGhlIGNoaXBzIHRoYXQgaGF2ZSBiZWVuIHBsYWNlZCBpbnRvIGJhZ3NcclxuICAgIHRoaXMudG90YWxJbkJhZ3NQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtd3JpdGUpXHJcbiAgICB0aGlzLm5ldFdvcnRoQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmV0V29ydGhBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIHRoZSBudW1iZXIgbGluZSB1cG9uIHdoaWNoIHRoZSB0b3RhbCB2YWx1ZSBhbmQgdGhlIHZhcmlvdXMgb3BlcmF0aW9uIHdpbGwgYmUgcG9ydHJheWVkXHJcbiAgICB0aGlzLm51bWJlckxpbmUgPSBuZXcgT3BlcmF0aW9uVHJhY2tpbmdOdW1iZXJMaW5lKFxyXG4gICAgICBOTE9Db25zdGFudHMuTEFZT1VUX0JPVU5EUy5jZW50ZXIubWludXNYWSggMCwgMTEwICksXHJcbiAgICAgIHtcclxuICAgICAgICBpbml0aWFsRGlzcGxheWVkUmFuZ2U6IENISVBTX05VTUJFUl9MSU5FX1JBTkdFLFxyXG4gICAgICAgIHRpY2tNYXJrc0luaXRpYWxseVZpc2libGU6IHRydWUsXHJcbiAgICAgICAgcHJldmVudE92ZXJsYXA6IGZhbHNlLFxyXG4gICAgICAgIGF1dG9tYXRpY2FsbHlEZWFjdGl2YXRlT3BlcmF0aW9uczogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gd2lkdGggb2YgdGhlIG51bWJlciBsaW5lIGluIG1vZGVsIHNwYWNlLCBudW1iZXIgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBtYXRjaCBkZXNpZ25cclxuICAgICAgICB3aWR0aEluTW9kZWxTcGFjZTogTkxPQ29uc3RhbnRzLk5VTUJFUl9MSU5FX1dJRFRIXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gY29udmVuaWVuY2UgdmFyaWFibGUgKG5vdGUgdGhhdCB0aGVyZSBpcyBvbmx5IG9uZSBvcGVyYXRpb24gc2hvd24gb24gdGhpcyBudW1iZXIgbGluZSlcclxuICAgIGNvbnN0IG9wZXJhdGlvbiA9IHRoaXMubnVtYmVyTGluZS5vcGVyYXRpb25zWyAwIF07XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7VmFsdWVJdGVtW119IC0gbGlzdCBvZiB0aGUgY2hpcHMgdGhhdCB0aGUgdXNlciBjYW4gbWFuaXB1bGF0ZVxyXG4gICAgdGhpcy5jaGlwcyA9IFtdO1xyXG4gICAgXy50aW1lcyggTlVNQkVSX09GX1BPU0lUSVZFX0NISVBTLCBpbmRleCA9PiB7IHRoaXMuY2hpcHMucHVzaCggbmV3IFZhbHVlSXRlbSggaW5kZXggKyAxICkgKTsgfSApO1xyXG4gICAgXy50aW1lcyggTlVNQkVSX09GX05FR0FUSVZFX0NISVBTLCBpbmRleCA9PiB7IHRoaXMuY2hpcHMucHVzaCggbmV3IFZhbHVlSXRlbSggLSggaW5kZXggKyAxICkgKSApOyB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBzdG9yYWdlIGFyZWFzIGZvciB0aGUgY2hpcHMgLSB0aGlzIGlzIHdoZXJlIHRoZXkgcmVzaWRlIHdoZW4gbm90IGluIHVzZS5cclxuICAgIGNvbnN0IGNoaXBIb2xkaW5nQm94ID0gMjkwO1xyXG4gICAgdGhpcy5uZWdhdGl2ZUNoaXBzQm94ID0gbmV3IEhvbGRpbmdCb3goXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAxMDUsIGNoaXBIb2xkaW5nQm94ICksXHJcbiAgICAgIEhPTERJTkdfQk9YX1NJWkUsXHJcbiAgICAgIHRoaXMuY2hpcHMuZmlsdGVyKCBpdGVtID0+IGl0ZW0udmFsdWUgPCAwICkuc29ydCggKCBhLCBiICkgPT4gYi52YWx1ZSAtIGEudmFsdWUgKVxyXG4gICAgKTtcclxuICAgIHRoaXMucG9zaXRpdmVDaGlwc0JveCA9IG5ldyBIb2xkaW5nQm94KFxyXG4gICAgICBuZXcgVmVjdG9yMiggODAwLCBjaGlwSG9sZGluZ0JveCApLFxyXG4gICAgICBIT0xESU5HX0JPWF9TSVpFLFxyXG4gICAgICB0aGlzLmNoaXBzLmZpbHRlciggaXRlbSA9PiBpdGVtLnZhbHVlID4gMCApLnNvcnQoKVxyXG4gICAgKTtcclxuICAgIHRoaXMuc3RvcmFnZUJveGVzID0gWyB0aGlzLnBvc2l0aXZlQ2hpcHNCb3gsIHRoaXMubmVnYXRpdmVDaGlwc0JveCBdO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIGNoaXAgYmFncy5cclxuICAgIGNvbnN0IGhvbGRpbmdCYWdzQ2VudGVyWSA9IDQ3NTtcclxuICAgIHRoaXMubmVnYXRpdmVDaGlwc0JhZyA9IG5ldyBIb2xkaW5nQmFnKCBuZXcgVmVjdG9yMiggMzgwLCBob2xkaW5nQmFnc0NlbnRlclkgKSwge1xyXG4gICAgICBpdGVtQWNjZXB0YW5jZVRlc3Q6IEhvbGRpbmdCYWcuQUNDRVBUX09OTFlfTkVHQVRJVkVfVkFMVUVTLFxyXG4gICAgICBjYXBhY2l0eTogTlVNQkVSX09GX05FR0FUSVZFX0NISVBTXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBvc2l0aXZlQ2hpcHNCYWcgPSBuZXcgSG9sZGluZ0JhZyggbmV3IFZlY3RvcjIoIDY0NSwgaG9sZGluZ0JhZ3NDZW50ZXJZICksIHtcclxuICAgICAgaXRlbUFjY2VwdGFuY2VUZXN0OiBIb2xkaW5nQmFnLkFDQ0VQVF9PTkxZX1BPU0lUSVZFX1ZBTFVFUyxcclxuICAgICAgY2FwYWNpdHk6IE5VTUJFUl9PRl9QT1NJVElWRV9DSElQU1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5iYWdzID0gWyB0aGlzLm5lZ2F0aXZlQ2hpcHNCYWcsIHRoaXMucG9zaXRpdmVDaGlwc0JhZyBdO1xyXG5cclxuICAgIC8vIE1vbml0b3IgdGhlIGlzRHJhZ2dpbmcgc3RhdGUgb2YgZWFjaCBjaGlwIGFuZCwgd2hlbiBpdCB0cmFuc2l0aW9ucyB0byBmYWxzZSwgZWl0aGVyIGFkZCBpdCB0byBhIGJhZyBvciByZXR1cm4gaXRcclxuICAgIC8vIHRvIGEgc3RvcmFnZSBib3ggYmFzZWQgb24gd2hlcmUgaXQgd2FzIGRyb3BwZWQuICBObyB1bmxpbmsgaXMgbmVjZXNzYXJ5LlxyXG4gICAgdGhpcy5jaGlwcy5mb3JFYWNoKCBjaGlwID0+IHtcclxuICAgICAgY2hpcC5pc0RyYWdnaW5nUHJvcGVydHkubGF6eUxpbmsoIGlzRHJhZ2dpbmcgPT4ge1xyXG4gICAgICAgIGlmICggaXNEcmFnZ2luZyApIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgaXRlbSB3YXMgaW4gb25lIG9mIHRoZSBiYWdzLCByZW1vdmUgaXQuXHJcbiAgICAgICAgICB0aGlzLmJhZ3MuZm9yRWFjaCggYmFnID0+IHtcclxuICAgICAgICAgICAgaWYgKCBiYWcuY29udGFpbnNJdGVtKCBjaGlwICkgKSB7XHJcbiAgICAgICAgICAgICAgYmFnLnJlbW92ZUl0ZW0oIGNoaXAgKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBvcGVyYXRpb24gb24gdGhlIG51bWJlciBsaW5lIHRvIHJlZmxlY3QgdGhpcyBsYXRlc3QgdHJhbnNhY3Rpb24uICBDeWNsZSB0aGUgaW5hY3RpdmUgc3RhdGVcclxuICAgICAgICAgICAgICAvLyB0byB0cmlnZ2VyIHRoZSBhbmltYXRpb24gaW4gdGhlIHZpZXcuXHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uLmlzQWN0aXZlUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgICAgICAgIHRoaXMubnVtYmVyTGluZS5zdGFydGluZ1ZhbHVlUHJvcGVydHkuc2V0KCB0aGlzLnRvdGFsSW5CYWdzUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICAgICAgICBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LnNldCggT3BlcmF0aW9uLlNVQlRSQUNUSU9OICk7XHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LnNldCggY2hpcC52YWx1ZSApO1xyXG4gICAgICAgICAgICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFRoZSBpdGVtIHdhcyByZWxlYXNlZCBieSB0aGUgdXNlci4gIEFkZCBpdCB0byBhIGJhZyBvciByZXR1cm4gaXQgdG8gdGhlIGFwcHJvcHJpYXRlIHN0b3JhZ2UgYXJlYS5cclxuICAgICAgICAgIGxldCBhZGRlZFRvQmFnID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLmJhZ3MuZm9yRWFjaCggYmFnID0+IHtcclxuICAgICAgICAgICAgaWYgKCBiYWcuYWNjZXB0c0l0ZW0oIGNoaXAgKSAmJiBiYWcuaXNXaXRoaW5DYXB0dXJlUmFuZ2UoIGNoaXAgKSApIHtcclxuICAgICAgICAgICAgICBiYWcuYWRkSXRlbSggY2hpcCApO1xyXG4gICAgICAgICAgICAgIGFkZGVkVG9CYWcgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICB0aGlzLm51bWJlckxpbmUuc3RhcnRpbmdWYWx1ZVByb3BlcnR5LnNldCggdGhpcy50b3RhbEluQmFnc1Byb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgb3BlcmF0aW9uLiAgVGhlIFwiYWN0aXZlXCIgc3RhdGUgaXMgY3ljbGVkIGluIG9yZGVyIHRvIHRyaWdnZXIgYW5pbWF0aW9uIGluIHRoZSB2aWV3LlxyXG4gICAgICAgICAgICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgICAgICAgICBvcGVyYXRpb24ub3BlcmF0aW9uVHlwZVByb3BlcnR5LnNldCggT3BlcmF0aW9uLkFERElUSU9OICk7XHJcbiAgICAgICAgICAgICAgb3BlcmF0aW9uLmFtb3VudFByb3BlcnR5LnNldCggY2hpcC52YWx1ZSApO1xyXG4gICAgICAgICAgICAgIG9wZXJhdGlvbi5pc0FjdGl2ZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBpZiAoICFhZGRlZFRvQmFnICkge1xyXG4gICAgICAgICAgICB0aGlzLnJldHVybkl0ZW1Ub1N0b3JhZ2UoIGNoaXAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50b3RhbEluQmFnc1Byb3BlcnR5LnNldCggdGhpcy5wb3NpdGl2ZUNoaXBzQmFnLmdldFRvdGFsVmFsdWUoKSArIHRoaXMubmVnYXRpdmVDaGlwc0JhZy5nZXRUb3RhbFZhbHVlKCkgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIG1vZGVsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuXHJcbiAgICAvLyBSZXNldCBpbml0aWFsIHN0YXRlIG9mIGFsbCBjaGlwcy5cclxuICAgIHRoaXMuY2hpcHMuZm9yRWFjaCggY2hpcCA9PiB7XHJcblxyXG4gICAgICAvLyBTZWUgaWYgdGhpcyBjaGlwIGlzIGluIGEgYmFnIGFuZCByZW1vdmUgaXQgaWYgc28uXHJcbiAgICAgIGxldCBpdGVtUmVtb3ZlZEZyb21CYWcgPSBmYWxzZTtcclxuICAgICAgdGhpcy5iYWdzLmZvckVhY2goIGJhZyA9PiB7XHJcbiAgICAgICAgaWYgKCBiYWcuY29udGFpbnNJdGVtKCBjaGlwICkgKSB7XHJcbiAgICAgICAgICBiYWcucmVtb3ZlSXRlbSggY2hpcCApO1xyXG4gICAgICAgICAgaXRlbVJlbW92ZWRGcm9tQmFnID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIElmIGl0IHdhcyByZW1vdmVkIGZyb20gYSBiYWcsIGFkZCBpdCBiYWNrIHRvIGl0cyBzdG9yYWdlIGJveC5cclxuICAgICAgaWYgKCBpdGVtUmVtb3ZlZEZyb21CYWcgKSB7XHJcbiAgICAgICAgdGhpcy5yZXR1cm5JdGVtVG9TdG9yYWdlKCBjaGlwICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm5ldFdvcnRoQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5udW1iZXJMaW5lLnJlc2V0KCk7XHJcbiAgICB0aGlzLnRvdGFsSW5CYWdzUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmFsdWVJdGVtfSBpdGVtXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZXR1cm5JdGVtVG9TdG9yYWdlKCBpdGVtICkge1xyXG4gICAgdGhpcy5zdG9yYWdlQm94ZXMuZm9yRWFjaCggc3RvcmFnZUJveCA9PiB7XHJcbiAgICAgIGlmICggc3RvcmFnZUJveC5ob2xkc0l0ZW0oIGl0ZW0gKSApIHtcclxuICAgICAgICBzdG9yYWdlQm94LnJldHVybkl0ZW0oIGl0ZW0sIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoKSB7XHJcbiAgICB0aGlzLm51bWJlckxpbmUuc3RlcCgpO1xyXG4gIH1cclxufVxyXG5cclxuLy8gc3RhdGljc1xyXG5OTE9DaGlwc01vZGVsLkNISVBTX05VTUJFUl9MSU5FX1JBTkdFID0gQ0hJUFNfTlVNQkVSX0xJTkVfUkFOR0U7XHJcblxyXG5udW1iZXJMaW5lT3BlcmF0aW9ucy5yZWdpc3RlciggJ05MT0NoaXBzTW9kZWwnLCBOTE9DaGlwc01vZGVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IE5MT0NoaXBzTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQywyQkFBMkIsTUFBTSxtREFBbUQ7QUFDM0YsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjs7QUFFaEU7QUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxJQUFJVCxLQUFLLENBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRyxDQUFDO0FBQ3BELE1BQU1VLGdCQUFnQixHQUFHLElBQUlYLFVBQVUsQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDLENBQUMsQ0FBQztBQUNyRCxNQUFNWSx3QkFBd0IsR0FBRyxDQUFDO0FBQ2xDLE1BQU1DLHdCQUF3QixHQUFHLENBQUM7QUFFbEMsTUFBTUMsYUFBYSxDQUFDO0VBRWxCO0FBQ0Y7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFFcEI7SUFDQSxJQUFJLENBQUNDLG1CQUFtQixHQUFHLElBQUlsQixjQUFjLENBQUUsQ0FBRSxDQUFDOztJQUVsRDtJQUNBLElBQUksQ0FBQ21CLG9DQUFvQyxHQUFHLElBQUlwQixlQUFlLENBQUUsSUFBSSxFQUFFO01BQ3JFa0IsTUFBTSxFQUFFQSxNQUFNLENBQUNHLFlBQVksQ0FBRSxzQ0FBdUM7SUFDdEUsQ0FB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