// Copyright 2016-2023, University of Colorado Boulder

/**
 * A scene in the 'Shopping' screen. A scene has:
 * - 1 type of item
 * - N sets of questions
 * - a double number line
 * - a scale
 * - a shelf
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import DoubleNumberLine from '../../common/model/DoubleNumberLine.js';
import Marker from '../../common/model/Marker.js';
import MarkerEditor from '../../common/model/MarkerEditor.js';
import Rate from '../../common/model/Rate.js';
import URColors from '../../common/URColors.js';
import URConstants from '../../common/URConstants.js';
import URQueryParameters from '../../common/URQueryParameters.js';
import unitRates from '../../unitRates.js';
import UnitRatesStrings from '../../UnitRatesStrings.js';
import Bag from './Bag.js';
import Scale from './Scale.js';
import Shelf from './Shelf.js';
import ShoppingItem from './ShoppingItem.js';
import ShoppingItemData from './ShoppingItemData.js';
import ShoppingQuestionFactory from './ShoppingQuestionFactory.js';

// constants
const SHARED_OPTIONS = {
  maxDigits: 4,
  // {number} number of digits that can be entered via the keypad
  maxDecimals: 2,
  // {number} maximum number of decimal places
  pickerColor: 'black' // {Color|string} color of the number picker for the numerator in the Rate accordion box
};

export default class ShoppingScene {
  /**
   * @param {Object} itemData - data structure that describes the item, see ShoppingItemData.
   *   Using a data structure like this is an alternative to having a large number of constructor parameters.
   * @param {Object} [options]
   */
  constructor(itemData, options) {
    // verify that itemData has all required properties
    assert && ShoppingItemData.assertIsItemData(itemData);
    assert && assert(itemData.questionQuantities.length > 1, 'more than 1 set of questions is required');

    // default option values apply to Fruit items
    options = merge({
      rate: null,
      // {Rate|null} if null, will be initialized to unit rate

      // range of the denominator (quantity) is fixed
      fixedAxis: 'denominator',
      fixedAxisRange: new Range(0, 16),
      numeratorOptions: null,
      // {*} options specific to the rate's numerator, see below
      denominatorOptions: null,
      // {*} options specific to the rate's denominator, see below

      // questions
      quantitySingularUnits: itemData.singularName,
      // {string} units for questions with singular quantities
      quantityPluralUnits: itemData.pluralName,
      // {string} units for questions with plural quantities
      amountOfQuestionUnits: itemData.pluralName,
      // {string} units used for "Apples for $10.00?" type questions

      // scale
      scaleQuantityIsDisplayed: false,
      // {boolean} whether quantity is displayed on the scale
      scaleQuantityUnits: '',
      // {string} units for quantity on scale
      bagsOpen: false,
      // {boolean} do bags open to display individual items?

      // Major markers have integer denominators
      isMajorMarker: (numerator, denominator) => Number.isInteger(denominator)
    }, options);

    // @public (read-only) options specific to the rate's numerator
    this.numeratorOptions = merge({
      axisLabel: UnitRatesStrings.dollars,
      // {string} label for the axis on the double number line
      valueFormat: UnitRatesStrings.pattern_0cost,
      // {string} format with placeholder for value
      trimZeros: false // {boolean} whether to trim trailing zeros from decimal places
    }, SHARED_OPTIONS, options.numeratorOptions);

    // @public (read-only) options specific to the rate's denominator
    this.denominatorOptions = merge({
      axisLabel: itemData.pluralName,
      // {string} label for the axis on the double number line
      valueFormat: SunConstants.VALUE_NUMBERED_PLACEHOLDER,
      // {string} format with placeholder for value
      trimZeros: true // {boolean} whether to trim trailing zeros from decimal places
    }, SHARED_OPTIONS, options.denominatorOptions);

    // @public {Rate}
    this.rate = options.rate || Rate.withUnitRate(itemData.unitRate);

    // @public (read-only) unpack itemData
    this.numberOfBags = itemData.numberOfBags;
    this.quantityPerBag = itemData.quantityPerBag;
    this.singularName = itemData.singularName;
    this.pluralName = itemData.pluralName;
    this.itemImage = itemData.itemImage;
    this.itemRowOverlap = itemData.itemRowOverlap;
    this.bagImage = itemData.bagImage;

    // @public (read-only) unpack options
    this.scaleQuantityIsDisplayed = options.scaleQuantityIsDisplayed;

    // @public
    this.doubleNumberLine = new DoubleNumberLine(this.rate.unitRateProperty, {
      fixedAxis: options.fixedAxis,
      fixedAxisRange: options.fixedAxisRange,
      numeratorOptions: this.numeratorOptions,
      denominatorOptions: this.denominatorOptions,
      isMajorMarker: options.isMajorMarker
    });

    // @public
    this.markerEditor = new MarkerEditor(this.rate.unitRateProperty, {
      numeratorMaxDecimals: this.numeratorOptions.maxDecimals,
      denominatorMaxDecimals: this.denominatorOptions.maxDecimals
    });

    // Does not work for mipmap, bagImage.width is undefined.
    // If considering a switch to mipmaps, see https://github.com/phetsims/unit-rates/issues/157
    assert && assert(this.bagImage.width && this.bagImage.height, 'Are you using the image plugin?');
    const bagSize = new Dimension2(URConstants.BAG_IMAGE_SCALE * this.bagImage.width, URConstants.BAG_IMAGE_SCALE * this.bagImage.height);
    assert && assert(this.itemImage.width && this.itemImage.height, 'Are you using the image plugin?');
    const itemSize = new Dimension2(URConstants.SHOPPING_ITEM_IMAGE_SCALE * this.itemImage.width, URConstants.SHOPPING_ITEM_IMAGE_SCALE * this.itemImage.height);

    // @public
    this.shelf = new Shelf({
      position: new Vector2(512, 560),
      numberOfBags: this.numberOfBags,
      bagSize: bagSize,
      bagRowYOffset: options.bagsOpen ? 0 : 10,
      numberOfItems: this.numberOfBags * this.quantityPerBag,
      itemSize: itemSize,
      itemRowOverlap: this.itemRowOverlap
    });

    // @public
    this.scale = new Scale(this.rate.unitRateProperty, {
      position: this.shelf.position.minusXY(0, 220),
      // centered above the shelf
      numberOfBags: this.numberOfBags,
      bagSize: bagSize,
      numberOfItems: this.numberOfBags * this.quantityPerBag,
      itemSize: itemSize,
      itemRowOverlap: this.itemRowOverlap,
      quantityPerBag: this.quantityPerBag,
      quantityUnits: options.scaleQuantityUnits
    });

    // The marker that corresponds to what's currently on the scale
    let scaleMarker = null;

    // @private flag to disable creation of spurious markers during reset
    this.createMarkerEnabled = true;

    // Create a marker when what's on the scale changes
    this.scale.quantityProperty.lazyLink(quantity => {
      // the marker for what was previously on the scale becomes erasable
      if (scaleMarker) {
        scaleMarker.colorProperty.value = URColors.majorMarker;
        scaleMarker.erasable = true;
      }

      // the new marker for what's on the scale
      if (quantity > 0 && this.createMarkerEnabled) {
        scaleMarker = new Marker(this.scale.costProperty.value, quantity, 'scale', {
          isMajor: true,
          // all scale markers are major, per the design document
          color: URColors.scaleMarker,
          erasable: false
        });
        this.doubleNumberLine.addMarker(scaleMarker);
      }
    });

    // @public {ShoppingQuestion} 'Unit Rate?'
    this.unitRateQuestion = ShoppingQuestionFactory.createUnitRateQuestion(this.rate.unitRateProperty.value, options.quantitySingularUnits, this.numeratorOptions, this.denominatorOptions);

    // @private {ShoppingQuestion[][]} instantiate ShoppingQuestions, grouped into sets
    this.questionSets = ShoppingQuestionFactory.createQuestionSets(itemData.questionQuantities, this.rate.unitRateProperty.value, options.quantitySingularUnits, options.quantityPluralUnits, options.amountOfQuestionUnits, this.numeratorOptions, this.denominatorOptions);

    // Randomize the order of the question sets
    if (URQueryParameters.randomEnabled) {
      this.questionSets = dotRandom.shuffle(this.questionSets);
    }

    // @private index of the question set that's being shown
    this.questionSetsIndexProperty = new NumberProperty(0);

    // @public (read-only) {Property.<ShoppingQuestion[]>} the current set of questions
    this.questionSetProperty = new Property(this.questionSets[this.questionSetsIndexProperty.value]);
    this.questionSetsIndexProperty.lazyLink(questionSetsIndex => {
      // no unlink required
      this.questionSetProperty.value = this.questionSets[questionSetsIndex];
    });

    // When the unit rate changes, cancel any marker edit that is in progress, unlink not needed
    this.rate.unitRateProperty.lazyLink(unitRate => {
      this.markerEditor.reset();
    });

    /**
     * When a question is answered correctly, create a corresponding marker on the double number line.
     * @param {ShoppingQuestion} question
     */
    const questionCorrectListener = question => {
      const marker = new Marker(question.numerator, question.denominator, 'question', {
        isMajor: true,
        // all question markers are major, per the design document
        color: URColors.questionMarker,
        erasable: false
      });
      this.doubleNumberLine.addMarker(marker);
    };
    this.unitRateQuestion.correctEmitter.addListener(questionCorrectListener); // no removeListener required
    this.questionSets.forEach(questionSet => {
      questionSet.forEach(question => {
        question.correctEmitter.addListener(questionCorrectListener); // no removeListener required
      });
    });

    // @public (read-only) create bags and items
    this.bags = [];
    for (let i = 0; i < this.numberOfBags; i++) {
      // the bag's position on the shelf
      const bagCellIndex = this.shelf.bagRow.getFirstUnoccupiedCell();
      assert && assert(bagCellIndex !== -1, 'shelf is full');
      const bagPosition = this.shelf.bagRow.getCellPosition(bagCellIndex);

      // create items if the bag opens when placed on the scale
      let items = null;
      if (options.bagsOpen) {
        items = [];
        for (let j = 0; j < this.quantityPerBag; j++) {
          // create item, initially invisible and not on shelf or scale
          const item = new ShoppingItem(this.pluralName, this.itemImage, {
            visible: false
          });
          items.push(item);
        }
      }

      // create bag
      const bag = new Bag(this.pluralName, this.bagImage, {
        position: bagPosition,
        items: items
      });
      this.bags.push(bag);

      // put bag on shelf
      this.shelf.bagRow.put(bag, bagCellIndex);
    }
  }

  /**
   * Updates time-dependent parts of the model.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step(dt) {
    // animate bags
    for (let i = 0; i < this.bags.length; i++) {
      this.bags[i].step(dt);

      // animate items
      const items = this.bags[i].items;
      if (items) {
        for (let j = 0; j < items.length; j++) {
          items[j].step(dt);
        }
      }
    }
  }

  // @public
  reset() {
    this.rate.reset();

    // reset questions
    this.unitRateQuestion.reset();
    this.questionSets.forEach(questionSet => {
      questionSet.forEach(question => question.reset());
    });
    this.questionSetsIndexProperty.reset();
    this.resetShelfAndScale();

    // reset these last, since moving bags and items can create markers
    this.doubleNumberLine.reset();
    this.markerEditor.reset();
  }

  /**
   * Resets the shelf and scale.
   * All items are put back into bags, and all bags are returned to the shelf.
   * @public
   */
  resetShelfAndScale() {
    // clear all cells on the shelf
    this.shelf.reset();

    // clear all cells on the scale
    this.createMarkerEnabled = false; // prevent creation of spurious markers
    this.scale.reset();
    this.createMarkerEnabled = true;
    for (let i = 0; i < this.bags.length; i++) {
      // return bag to shelf
      const bagCellIndex = this.shelf.bagRow.getFirstUnoccupiedCell();
      assert && assert(bagCellIndex !== -1, 'shelf is full');
      this.shelf.bagRow.put(this.bags[i], bagCellIndex);
      this.bags[i].visibleProperty.value = true;

      // reset items, making them invisible
      const items = this.bags[i].items;
      if (items) {
        for (let j = 0; j < items.length; j++) {
          items[j].reset();
        }
      }
    }
  }

  /**
   * Gets the next set of questions.
   * While the order of the sets is random, we cycle through the sets in the same order each time.
   * @public
   */
  nextQuestionSet() {
    assert && assert(this.questionSets.length > 1, 'this implementation requires more than 1 question set');

    // adjust the index to point to the next question set
    if (this.questionSetsIndexProperty.value < this.questionSets.length - 1) {
      this.questionSetsIndexProperty.value = this.questionSetsIndexProperty.value + 1;
    } else {
      this.questionSetsIndexProperty.value = 0;
    }
  }
}
unitRates.register('ShoppingScene', ShoppingScene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiRGltZW5zaW9uMiIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiU3VuQ29uc3RhbnRzIiwiRG91YmxlTnVtYmVyTGluZSIsIk1hcmtlciIsIk1hcmtlckVkaXRvciIsIlJhdGUiLCJVUkNvbG9ycyIsIlVSQ29uc3RhbnRzIiwiVVJRdWVyeVBhcmFtZXRlcnMiLCJ1bml0UmF0ZXMiLCJVbml0UmF0ZXNTdHJpbmdzIiwiQmFnIiwiU2NhbGUiLCJTaGVsZiIsIlNob3BwaW5nSXRlbSIsIlNob3BwaW5nSXRlbURhdGEiLCJTaG9wcGluZ1F1ZXN0aW9uRmFjdG9yeSIsIlNIQVJFRF9PUFRJT05TIiwibWF4RGlnaXRzIiwibWF4RGVjaW1hbHMiLCJwaWNrZXJDb2xvciIsIlNob3BwaW5nU2NlbmUiLCJjb25zdHJ1Y3RvciIsIml0ZW1EYXRhIiwib3B0aW9ucyIsImFzc2VydCIsImFzc2VydElzSXRlbURhdGEiLCJxdWVzdGlvblF1YW50aXRpZXMiLCJsZW5ndGgiLCJyYXRlIiwiZml4ZWRBeGlzIiwiZml4ZWRBeGlzUmFuZ2UiLCJudW1lcmF0b3JPcHRpb25zIiwiZGVub21pbmF0b3JPcHRpb25zIiwicXVhbnRpdHlTaW5ndWxhclVuaXRzIiwic2luZ3VsYXJOYW1lIiwicXVhbnRpdHlQbHVyYWxVbml0cyIsInBsdXJhbE5hbWUiLCJhbW91bnRPZlF1ZXN0aW9uVW5pdHMiLCJzY2FsZVF1YW50aXR5SXNEaXNwbGF5ZWQiLCJzY2FsZVF1YW50aXR5VW5pdHMiLCJiYWdzT3BlbiIsImlzTWFqb3JNYXJrZXIiLCJudW1lcmF0b3IiLCJkZW5vbWluYXRvciIsIk51bWJlciIsImlzSW50ZWdlciIsImF4aXNMYWJlbCIsImRvbGxhcnMiLCJ2YWx1ZUZvcm1hdCIsInBhdHRlcm5fMGNvc3QiLCJ0cmltWmVyb3MiLCJWQUxVRV9OVU1CRVJFRF9QTEFDRUhPTERFUiIsIndpdGhVbml0UmF0ZSIsInVuaXRSYXRlIiwibnVtYmVyT2ZCYWdzIiwicXVhbnRpdHlQZXJCYWciLCJpdGVtSW1hZ2UiLCJpdGVtUm93T3ZlcmxhcCIsImJhZ0ltYWdlIiwiZG91YmxlTnVtYmVyTGluZSIsInVuaXRSYXRlUHJvcGVydHkiLCJtYXJrZXJFZGl0b3IiLCJudW1lcmF0b3JNYXhEZWNpbWFscyIsImRlbm9taW5hdG9yTWF4RGVjaW1hbHMiLCJ3aWR0aCIsImhlaWdodCIsImJhZ1NpemUiLCJCQUdfSU1BR0VfU0NBTEUiLCJpdGVtU2l6ZSIsIlNIT1BQSU5HX0lURU1fSU1BR0VfU0NBTEUiLCJzaGVsZiIsInBvc2l0aW9uIiwiYmFnUm93WU9mZnNldCIsIm51bWJlck9mSXRlbXMiLCJzY2FsZSIsIm1pbnVzWFkiLCJxdWFudGl0eVVuaXRzIiwic2NhbGVNYXJrZXIiLCJjcmVhdGVNYXJrZXJFbmFibGVkIiwicXVhbnRpdHlQcm9wZXJ0eSIsImxhenlMaW5rIiwicXVhbnRpdHkiLCJjb2xvclByb3BlcnR5IiwidmFsdWUiLCJtYWpvck1hcmtlciIsImVyYXNhYmxlIiwiY29zdFByb3BlcnR5IiwiaXNNYWpvciIsImNvbG9yIiwiYWRkTWFya2VyIiwidW5pdFJhdGVRdWVzdGlvbiIsImNyZWF0ZVVuaXRSYXRlUXVlc3Rpb24iLCJxdWVzdGlvblNldHMiLCJjcmVhdGVRdWVzdGlvblNldHMiLCJyYW5kb21FbmFibGVkIiwic2h1ZmZsZSIsInF1ZXN0aW9uU2V0c0luZGV4UHJvcGVydHkiLCJxdWVzdGlvblNldFByb3BlcnR5IiwicXVlc3Rpb25TZXRzSW5kZXgiLCJyZXNldCIsInF1ZXN0aW9uQ29ycmVjdExpc3RlbmVyIiwicXVlc3Rpb24iLCJtYXJrZXIiLCJxdWVzdGlvbk1hcmtlciIsImNvcnJlY3RFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJmb3JFYWNoIiwicXVlc3Rpb25TZXQiLCJiYWdzIiwiaSIsImJhZ0NlbGxJbmRleCIsImJhZ1JvdyIsImdldEZpcnN0VW5vY2N1cGllZENlbGwiLCJiYWdQb3NpdGlvbiIsImdldENlbGxQb3NpdGlvbiIsIml0ZW1zIiwiaiIsIml0ZW0iLCJ2aXNpYmxlIiwicHVzaCIsImJhZyIsInB1dCIsInN0ZXAiLCJkdCIsInJlc2V0U2hlbGZBbmRTY2FsZSIsInZpc2libGVQcm9wZXJ0eSIsIm5leHRRdWVzdGlvblNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2hvcHBpbmdTY2VuZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIHNjZW5lIGluIHRoZSAnU2hvcHBpbmcnIHNjcmVlbi4gQSBzY2VuZSBoYXM6XHJcbiAqIC0gMSB0eXBlIG9mIGl0ZW1cclxuICogLSBOIHNldHMgb2YgcXVlc3Rpb25zXHJcbiAqIC0gYSBkb3VibGUgbnVtYmVyIGxpbmVcclxuICogLSBhIHNjYWxlXHJcbiAqIC0gYSBzaGVsZlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgU3VuQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9TdW5Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgRG91YmxlTnVtYmVyTGluZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRG91YmxlTnVtYmVyTGluZS5qcyc7XHJcbmltcG9ydCBNYXJrZXIgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL01hcmtlci5qcyc7XHJcbmltcG9ydCBNYXJrZXJFZGl0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL01hcmtlckVkaXRvci5qcyc7XHJcbmltcG9ydCBSYXRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9SYXRlLmpzJztcclxuaW1wb3J0IFVSQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9VUkNvbG9ycy5qcyc7XHJcbmltcG9ydCBVUkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vVVJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgVVJRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL1VSUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IHVuaXRSYXRlcyBmcm9tICcuLi8uLi91bml0UmF0ZXMuanMnO1xyXG5pbXBvcnQgVW5pdFJhdGVzU3RyaW5ncyBmcm9tICcuLi8uLi9Vbml0UmF0ZXNTdHJpbmdzLmpzJztcclxuaW1wb3J0IEJhZyBmcm9tICcuL0JhZy5qcyc7XHJcbmltcG9ydCBTY2FsZSBmcm9tICcuL1NjYWxlLmpzJztcclxuaW1wb3J0IFNoZWxmIGZyb20gJy4vU2hlbGYuanMnO1xyXG5pbXBvcnQgU2hvcHBpbmdJdGVtIGZyb20gJy4vU2hvcHBpbmdJdGVtLmpzJztcclxuaW1wb3J0IFNob3BwaW5nSXRlbURhdGEgZnJvbSAnLi9TaG9wcGluZ0l0ZW1EYXRhLmpzJztcclxuaW1wb3J0IFNob3BwaW5nUXVlc3Rpb25GYWN0b3J5IGZyb20gJy4vU2hvcHBpbmdRdWVzdGlvbkZhY3RvcnkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNIQVJFRF9PUFRJT05TID0ge1xyXG4gIG1heERpZ2l0czogNCwgLy8ge251bWJlcn0gbnVtYmVyIG9mIGRpZ2l0cyB0aGF0IGNhbiBiZSBlbnRlcmVkIHZpYSB0aGUga2V5cGFkXHJcbiAgbWF4RGVjaW1hbHM6IDIsIC8vIHtudW1iZXJ9IG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzXHJcbiAgcGlja2VyQ29sb3I6ICdibGFjaycgLy8ge0NvbG9yfHN0cmluZ30gY29sb3Igb2YgdGhlIG51bWJlciBwaWNrZXIgZm9yIHRoZSBudW1lcmF0b3IgaW4gdGhlIFJhdGUgYWNjb3JkaW9uIGJveFxyXG59O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hvcHBpbmdTY2VuZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtRGF0YSAtIGRhdGEgc3RydWN0dXJlIHRoYXQgZGVzY3JpYmVzIHRoZSBpdGVtLCBzZWUgU2hvcHBpbmdJdGVtRGF0YS5cclxuICAgKiAgIFVzaW5nIGEgZGF0YSBzdHJ1Y3R1cmUgbGlrZSB0aGlzIGlzIGFuIGFsdGVybmF0aXZlIHRvIGhhdmluZyBhIGxhcmdlIG51bWJlciBvZiBjb25zdHJ1Y3RvciBwYXJhbWV0ZXJzLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaXRlbURhdGEsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gdmVyaWZ5IHRoYXQgaXRlbURhdGEgaGFzIGFsbCByZXF1aXJlZCBwcm9wZXJ0aWVzXHJcbiAgICBhc3NlcnQgJiYgU2hvcHBpbmdJdGVtRGF0YS5hc3NlcnRJc0l0ZW1EYXRhKCBpdGVtRGF0YSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaXRlbURhdGEucXVlc3Rpb25RdWFudGl0aWVzLmxlbmd0aCA+IDEsICdtb3JlIHRoYW4gMSBzZXQgb2YgcXVlc3Rpb25zIGlzIHJlcXVpcmVkJyApO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgb3B0aW9uIHZhbHVlcyBhcHBseSB0byBGcnVpdCBpdGVtc1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICByYXRlOiBudWxsLCAvLyB7UmF0ZXxudWxsfSBpZiBudWxsLCB3aWxsIGJlIGluaXRpYWxpemVkIHRvIHVuaXQgcmF0ZVxyXG5cclxuICAgICAgLy8gcmFuZ2Ugb2YgdGhlIGRlbm9taW5hdG9yIChxdWFudGl0eSkgaXMgZml4ZWRcclxuICAgICAgZml4ZWRBeGlzOiAnZGVub21pbmF0b3InLFxyXG4gICAgICBmaXhlZEF4aXNSYW5nZTogbmV3IFJhbmdlKCAwLCAxNiApLFxyXG5cclxuICAgICAgbnVtZXJhdG9yT3B0aW9uczogbnVsbCwgLy8geyp9IG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhlIHJhdGUncyBudW1lcmF0b3IsIHNlZSBiZWxvd1xyXG4gICAgICBkZW5vbWluYXRvck9wdGlvbnM6IG51bGwsIC8vIHsqfSBvcHRpb25zIHNwZWNpZmljIHRvIHRoZSByYXRlJ3MgZGVub21pbmF0b3IsIHNlZSBiZWxvd1xyXG5cclxuICAgICAgLy8gcXVlc3Rpb25zXHJcbiAgICAgIHF1YW50aXR5U2luZ3VsYXJVbml0czogaXRlbURhdGEuc2luZ3VsYXJOYW1lLCAvLyB7c3RyaW5nfSB1bml0cyBmb3IgcXVlc3Rpb25zIHdpdGggc2luZ3VsYXIgcXVhbnRpdGllc1xyXG4gICAgICBxdWFudGl0eVBsdXJhbFVuaXRzOiBpdGVtRGF0YS5wbHVyYWxOYW1lLCAgLy8ge3N0cmluZ30gdW5pdHMgZm9yIHF1ZXN0aW9ucyB3aXRoIHBsdXJhbCBxdWFudGl0aWVzXHJcbiAgICAgIGFtb3VudE9mUXVlc3Rpb25Vbml0czogaXRlbURhdGEucGx1cmFsTmFtZSwgIC8vIHtzdHJpbmd9IHVuaXRzIHVzZWQgZm9yIFwiQXBwbGVzIGZvciAkMTAuMDA/XCIgdHlwZSBxdWVzdGlvbnNcclxuXHJcbiAgICAgIC8vIHNjYWxlXHJcbiAgICAgIHNjYWxlUXVhbnRpdHlJc0Rpc3BsYXllZDogZmFsc2UsIC8vIHtib29sZWFufSB3aGV0aGVyIHF1YW50aXR5IGlzIGRpc3BsYXllZCBvbiB0aGUgc2NhbGVcclxuICAgICAgc2NhbGVRdWFudGl0eVVuaXRzOiAnJywgLy8ge3N0cmluZ30gdW5pdHMgZm9yIHF1YW50aXR5IG9uIHNjYWxlXHJcbiAgICAgIGJhZ3NPcGVuOiBmYWxzZSwgLy8ge2Jvb2xlYW59IGRvIGJhZ3Mgb3BlbiB0byBkaXNwbGF5IGluZGl2aWR1YWwgaXRlbXM/XHJcblxyXG4gICAgICAvLyBNYWpvciBtYXJrZXJzIGhhdmUgaW50ZWdlciBkZW5vbWluYXRvcnNcclxuICAgICAgaXNNYWpvck1hcmtlcjogKCBudW1lcmF0b3IsIGRlbm9taW5hdG9yICkgPT4gTnVtYmVyLmlzSW50ZWdlciggZGVub21pbmF0b3IgKVxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhlIHJhdGUncyBudW1lcmF0b3JcclxuICAgIHRoaXMubnVtZXJhdG9yT3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGF4aXNMYWJlbDogVW5pdFJhdGVzU3RyaW5ncy5kb2xsYXJzLCAvLyB7c3RyaW5nfSBsYWJlbCBmb3IgdGhlIGF4aXMgb24gdGhlIGRvdWJsZSBudW1iZXIgbGluZVxyXG4gICAgICB2YWx1ZUZvcm1hdDogVW5pdFJhdGVzU3RyaW5ncy5wYXR0ZXJuXzBjb3N0LCAvLyB7c3RyaW5nfSBmb3JtYXQgd2l0aCBwbGFjZWhvbGRlciBmb3IgdmFsdWVcclxuICAgICAgdHJpbVplcm9zOiBmYWxzZSAvLyB7Ym9vbGVhbn0gd2hldGhlciB0byB0cmltIHRyYWlsaW5nIHplcm9zIGZyb20gZGVjaW1hbCBwbGFjZXNcclxuICAgIH0sIFNIQVJFRF9PUFRJT05TLCBvcHRpb25zLm51bWVyYXRvck9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIG9wdGlvbnMgc3BlY2lmaWMgdG8gdGhlIHJhdGUncyBkZW5vbWluYXRvclxyXG4gICAgdGhpcy5kZW5vbWluYXRvck9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBheGlzTGFiZWw6IGl0ZW1EYXRhLnBsdXJhbE5hbWUsIC8vIHtzdHJpbmd9IGxhYmVsIGZvciB0aGUgYXhpcyBvbiB0aGUgZG91YmxlIG51bWJlciBsaW5lXHJcbiAgICAgIHZhbHVlRm9ybWF0OiBTdW5Db25zdGFudHMuVkFMVUVfTlVNQkVSRURfUExBQ0VIT0xERVIsIC8vIHtzdHJpbmd9IGZvcm1hdCB3aXRoIHBsYWNlaG9sZGVyIGZvciB2YWx1ZVxyXG4gICAgICB0cmltWmVyb3M6IHRydWUgLy8ge2Jvb2xlYW59IHdoZXRoZXIgdG8gdHJpbSB0cmFpbGluZyB6ZXJvcyBmcm9tIGRlY2ltYWwgcGxhY2VzXHJcbiAgICB9LCBTSEFSRURfT1BUSU9OUywgb3B0aW9ucy5kZW5vbWluYXRvck9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtSYXRlfVxyXG4gICAgdGhpcy5yYXRlID0gb3B0aW9ucy5yYXRlIHx8IFJhdGUud2l0aFVuaXRSYXRlKCBpdGVtRGF0YS51bml0UmF0ZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgdW5wYWNrIGl0ZW1EYXRhXHJcbiAgICB0aGlzLm51bWJlck9mQmFncyA9IGl0ZW1EYXRhLm51bWJlck9mQmFncztcclxuICAgIHRoaXMucXVhbnRpdHlQZXJCYWcgPSBpdGVtRGF0YS5xdWFudGl0eVBlckJhZztcclxuICAgIHRoaXMuc2luZ3VsYXJOYW1lID0gaXRlbURhdGEuc2luZ3VsYXJOYW1lO1xyXG4gICAgdGhpcy5wbHVyYWxOYW1lID0gaXRlbURhdGEucGx1cmFsTmFtZTtcclxuICAgIHRoaXMuaXRlbUltYWdlID0gaXRlbURhdGEuaXRlbUltYWdlO1xyXG4gICAgdGhpcy5pdGVtUm93T3ZlcmxhcCA9IGl0ZW1EYXRhLml0ZW1Sb3dPdmVybGFwO1xyXG4gICAgdGhpcy5iYWdJbWFnZSA9IGl0ZW1EYXRhLmJhZ0ltYWdlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgdW5wYWNrIG9wdGlvbnNcclxuICAgIHRoaXMuc2NhbGVRdWFudGl0eUlzRGlzcGxheWVkID0gb3B0aW9ucy5zY2FsZVF1YW50aXR5SXNEaXNwbGF5ZWQ7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5kb3VibGVOdW1iZXJMaW5lID0gbmV3IERvdWJsZU51bWJlckxpbmUoIHRoaXMucmF0ZS51bml0UmF0ZVByb3BlcnR5LCB7XHJcbiAgICAgIGZpeGVkQXhpczogb3B0aW9ucy5maXhlZEF4aXMsXHJcbiAgICAgIGZpeGVkQXhpc1JhbmdlOiBvcHRpb25zLmZpeGVkQXhpc1JhbmdlLFxyXG4gICAgICBudW1lcmF0b3JPcHRpb25zOiB0aGlzLm51bWVyYXRvck9wdGlvbnMsXHJcbiAgICAgIGRlbm9taW5hdG9yT3B0aW9uczogdGhpcy5kZW5vbWluYXRvck9wdGlvbnMsXHJcbiAgICAgIGlzTWFqb3JNYXJrZXI6IG9wdGlvbnMuaXNNYWpvck1hcmtlclxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubWFya2VyRWRpdG9yID0gbmV3IE1hcmtlckVkaXRvciggdGhpcy5yYXRlLnVuaXRSYXRlUHJvcGVydHksIHtcclxuICAgICAgbnVtZXJhdG9yTWF4RGVjaW1hbHM6IHRoaXMubnVtZXJhdG9yT3B0aW9ucy5tYXhEZWNpbWFscyxcclxuICAgICAgZGVub21pbmF0b3JNYXhEZWNpbWFsczogdGhpcy5kZW5vbWluYXRvck9wdGlvbnMubWF4RGVjaW1hbHNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEb2VzIG5vdCB3b3JrIGZvciBtaXBtYXAsIGJhZ0ltYWdlLndpZHRoIGlzIHVuZGVmaW5lZC5cclxuICAgIC8vIElmIGNvbnNpZGVyaW5nIGEgc3dpdGNoIHRvIG1pcG1hcHMsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdW5pdC1yYXRlcy9pc3N1ZXMvMTU3XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmJhZ0ltYWdlLndpZHRoICYmIHRoaXMuYmFnSW1hZ2UuaGVpZ2h0LCAnQXJlIHlvdSB1c2luZyB0aGUgaW1hZ2UgcGx1Z2luPycgKTtcclxuICAgIGNvbnN0IGJhZ1NpemUgPSBuZXcgRGltZW5zaW9uMihcclxuICAgICAgVVJDb25zdGFudHMuQkFHX0lNQUdFX1NDQUxFICogdGhpcy5iYWdJbWFnZS53aWR0aCxcclxuICAgICAgVVJDb25zdGFudHMuQkFHX0lNQUdFX1NDQUxFICogdGhpcy5iYWdJbWFnZS5oZWlnaHQgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLml0ZW1JbWFnZS53aWR0aCAmJiB0aGlzLml0ZW1JbWFnZS5oZWlnaHQsICdBcmUgeW91IHVzaW5nIHRoZSBpbWFnZSBwbHVnaW4/JyApO1xyXG4gICAgY29uc3QgaXRlbVNpemUgPSBuZXcgRGltZW5zaW9uMihcclxuICAgICAgVVJDb25zdGFudHMuU0hPUFBJTkdfSVRFTV9JTUFHRV9TQ0FMRSAqIHRoaXMuaXRlbUltYWdlLndpZHRoLFxyXG4gICAgICBVUkNvbnN0YW50cy5TSE9QUElOR19JVEVNX0lNQUdFX1NDQUxFICogdGhpcy5pdGVtSW1hZ2UuaGVpZ2h0ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5zaGVsZiA9IG5ldyBTaGVsZigge1xyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDUxMiwgNTYwICksXHJcbiAgICAgIG51bWJlck9mQmFnczogdGhpcy5udW1iZXJPZkJhZ3MsXHJcbiAgICAgIGJhZ1NpemU6IGJhZ1NpemUsXHJcbiAgICAgIGJhZ1Jvd1lPZmZzZXQ6ICggb3B0aW9ucy5iYWdzT3BlbiA/IDAgOiAxMCApLFxyXG4gICAgICBudW1iZXJPZkl0ZW1zOiB0aGlzLm51bWJlck9mQmFncyAqIHRoaXMucXVhbnRpdHlQZXJCYWcsXHJcbiAgICAgIGl0ZW1TaXplOiBpdGVtU2l6ZSxcclxuICAgICAgaXRlbVJvd092ZXJsYXA6IHRoaXMuaXRlbVJvd092ZXJsYXBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLnNjYWxlID0gbmV3IFNjYWxlKCB0aGlzLnJhdGUudW5pdFJhdGVQcm9wZXJ0eSwge1xyXG4gICAgICBwb3NpdGlvbjogdGhpcy5zaGVsZi5wb3NpdGlvbi5taW51c1hZKCAwLCAyMjAgKSwgLy8gY2VudGVyZWQgYWJvdmUgdGhlIHNoZWxmXHJcbiAgICAgIG51bWJlck9mQmFnczogdGhpcy5udW1iZXJPZkJhZ3MsXHJcbiAgICAgIGJhZ1NpemU6IGJhZ1NpemUsXHJcbiAgICAgIG51bWJlck9mSXRlbXM6IHRoaXMubnVtYmVyT2ZCYWdzICogdGhpcy5xdWFudGl0eVBlckJhZyxcclxuICAgICAgaXRlbVNpemU6IGl0ZW1TaXplLFxyXG4gICAgICBpdGVtUm93T3ZlcmxhcDogdGhpcy5pdGVtUm93T3ZlcmxhcCxcclxuICAgICAgcXVhbnRpdHlQZXJCYWc6IHRoaXMucXVhbnRpdHlQZXJCYWcsXHJcbiAgICAgIHF1YW50aXR5VW5pdHM6IG9wdGlvbnMuc2NhbGVRdWFudGl0eVVuaXRzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIG1hcmtlciB0aGF0IGNvcnJlc3BvbmRzIHRvIHdoYXQncyBjdXJyZW50bHkgb24gdGhlIHNjYWxlXHJcbiAgICBsZXQgc2NhbGVNYXJrZXIgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIGZsYWcgdG8gZGlzYWJsZSBjcmVhdGlvbiBvZiBzcHVyaW91cyBtYXJrZXJzIGR1cmluZyByZXNldFxyXG4gICAgdGhpcy5jcmVhdGVNYXJrZXJFbmFibGVkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBtYXJrZXIgd2hlbiB3aGF0J3Mgb24gdGhlIHNjYWxlIGNoYW5nZXNcclxuICAgIHRoaXMuc2NhbGUucXVhbnRpdHlQcm9wZXJ0eS5sYXp5TGluayggcXVhbnRpdHkgPT4ge1xyXG5cclxuICAgICAgLy8gdGhlIG1hcmtlciBmb3Igd2hhdCB3YXMgcHJldmlvdXNseSBvbiB0aGUgc2NhbGUgYmVjb21lcyBlcmFzYWJsZVxyXG4gICAgICBpZiAoIHNjYWxlTWFya2VyICkge1xyXG4gICAgICAgIHNjYWxlTWFya2VyLmNvbG9yUHJvcGVydHkudmFsdWUgPSBVUkNvbG9ycy5tYWpvck1hcmtlcjtcclxuICAgICAgICBzY2FsZU1hcmtlci5lcmFzYWJsZSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRoZSBuZXcgbWFya2VyIGZvciB3aGF0J3Mgb24gdGhlIHNjYWxlXHJcbiAgICAgIGlmICggcXVhbnRpdHkgPiAwICYmIHRoaXMuY3JlYXRlTWFya2VyRW5hYmxlZCApIHtcclxuICAgICAgICBzY2FsZU1hcmtlciA9IG5ldyBNYXJrZXIoIHRoaXMuc2NhbGUuY29zdFByb3BlcnR5LnZhbHVlLCBxdWFudGl0eSwgJ3NjYWxlJywge1xyXG4gICAgICAgICAgaXNNYWpvcjogdHJ1ZSwgLy8gYWxsIHNjYWxlIG1hcmtlcnMgYXJlIG1ham9yLCBwZXIgdGhlIGRlc2lnbiBkb2N1bWVudFxyXG4gICAgICAgICAgY29sb3I6IFVSQ29sb3JzLnNjYWxlTWFya2VyLFxyXG4gICAgICAgICAgZXJhc2FibGU6IGZhbHNlXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRoaXMuZG91YmxlTnVtYmVyTGluZS5hZGRNYXJrZXIoIHNjYWxlTWFya2VyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtTaG9wcGluZ1F1ZXN0aW9ufSAnVW5pdCBSYXRlPydcclxuICAgIHRoaXMudW5pdFJhdGVRdWVzdGlvbiA9IFNob3BwaW5nUXVlc3Rpb25GYWN0b3J5LmNyZWF0ZVVuaXRSYXRlUXVlc3Rpb24oIHRoaXMucmF0ZS51bml0UmF0ZVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBvcHRpb25zLnF1YW50aXR5U2luZ3VsYXJVbml0cywgdGhpcy5udW1lcmF0b3JPcHRpb25zLCB0aGlzLmRlbm9taW5hdG9yT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtTaG9wcGluZ1F1ZXN0aW9uW11bXX0gaW5zdGFudGlhdGUgU2hvcHBpbmdRdWVzdGlvbnMsIGdyb3VwZWQgaW50byBzZXRzXHJcbiAgICB0aGlzLnF1ZXN0aW9uU2V0cyA9IFNob3BwaW5nUXVlc3Rpb25GYWN0b3J5LmNyZWF0ZVF1ZXN0aW9uU2V0cyggaXRlbURhdGEucXVlc3Rpb25RdWFudGl0aWVzLCB0aGlzLnJhdGUudW5pdFJhdGVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgb3B0aW9ucy5xdWFudGl0eVNpbmd1bGFyVW5pdHMsIG9wdGlvbnMucXVhbnRpdHlQbHVyYWxVbml0cywgb3B0aW9ucy5hbW91bnRPZlF1ZXN0aW9uVW5pdHMsXHJcbiAgICAgIHRoaXMubnVtZXJhdG9yT3B0aW9ucywgdGhpcy5kZW5vbWluYXRvck9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBSYW5kb21pemUgdGhlIG9yZGVyIG9mIHRoZSBxdWVzdGlvbiBzZXRzXHJcbiAgICBpZiAoIFVSUXVlcnlQYXJhbWV0ZXJzLnJhbmRvbUVuYWJsZWQgKSB7XHJcbiAgICAgIHRoaXMucXVlc3Rpb25TZXRzID0gZG90UmFuZG9tLnNodWZmbGUoIHRoaXMucXVlc3Rpb25TZXRzICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUgaW5kZXggb2YgdGhlIHF1ZXN0aW9uIHNldCB0aGF0J3MgYmVpbmcgc2hvd25cclxuICAgIHRoaXMucXVlc3Rpb25TZXRzSW5kZXhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge1Byb3BlcnR5LjxTaG9wcGluZ1F1ZXN0aW9uW10+fSB0aGUgY3VycmVudCBzZXQgb2YgcXVlc3Rpb25zXHJcbiAgICB0aGlzLnF1ZXN0aW9uU2V0UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXMucXVlc3Rpb25TZXRzWyB0aGlzLnF1ZXN0aW9uU2V0c0luZGV4UHJvcGVydHkudmFsdWUgXSApO1xyXG5cclxuICAgIHRoaXMucXVlc3Rpb25TZXRzSW5kZXhQcm9wZXJ0eS5sYXp5TGluayggcXVlc3Rpb25TZXRzSW5kZXggPT4geyAvLyBubyB1bmxpbmsgcmVxdWlyZWRcclxuICAgICAgdGhpcy5xdWVzdGlvblNldFByb3BlcnR5LnZhbHVlID0gdGhpcy5xdWVzdGlvblNldHNbIHF1ZXN0aW9uU2V0c0luZGV4IF07XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdW5pdCByYXRlIGNoYW5nZXMsIGNhbmNlbCBhbnkgbWFya2VyIGVkaXQgdGhhdCBpcyBpbiBwcm9ncmVzcywgdW5saW5rIG5vdCBuZWVkZWRcclxuICAgIHRoaXMucmF0ZS51bml0UmF0ZVByb3BlcnR5LmxhenlMaW5rKCB1bml0UmF0ZSA9PiB7XHJcbiAgICAgIHRoaXMubWFya2VyRWRpdG9yLnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGVuIGEgcXVlc3Rpb24gaXMgYW5zd2VyZWQgY29ycmVjdGx5LCBjcmVhdGUgYSBjb3JyZXNwb25kaW5nIG1hcmtlciBvbiB0aGUgZG91YmxlIG51bWJlciBsaW5lLlxyXG4gICAgICogQHBhcmFtIHtTaG9wcGluZ1F1ZXN0aW9ufSBxdWVzdGlvblxyXG4gICAgICovXHJcbiAgICBjb25zdCBxdWVzdGlvbkNvcnJlY3RMaXN0ZW5lciA9IHF1ZXN0aW9uID0+IHtcclxuICAgICAgY29uc3QgbWFya2VyID0gbmV3IE1hcmtlciggcXVlc3Rpb24ubnVtZXJhdG9yLCBxdWVzdGlvbi5kZW5vbWluYXRvciwgJ3F1ZXN0aW9uJywge1xyXG4gICAgICAgIGlzTWFqb3I6IHRydWUsIC8vIGFsbCBxdWVzdGlvbiBtYXJrZXJzIGFyZSBtYWpvciwgcGVyIHRoZSBkZXNpZ24gZG9jdW1lbnRcclxuICAgICAgICBjb2xvcjogVVJDb2xvcnMucXVlc3Rpb25NYXJrZXIsXHJcbiAgICAgICAgZXJhc2FibGU6IGZhbHNlXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5kb3VibGVOdW1iZXJMaW5lLmFkZE1hcmtlciggbWFya2VyICk7XHJcbiAgICB9O1xyXG4gICAgdGhpcy51bml0UmF0ZVF1ZXN0aW9uLmNvcnJlY3RFbWl0dGVyLmFkZExpc3RlbmVyKCBxdWVzdGlvbkNvcnJlY3RMaXN0ZW5lciApOyAvLyBubyByZW1vdmVMaXN0ZW5lciByZXF1aXJlZFxyXG4gICAgdGhpcy5xdWVzdGlvblNldHMuZm9yRWFjaCggcXVlc3Rpb25TZXQgPT4ge1xyXG4gICAgICBxdWVzdGlvblNldC5mb3JFYWNoKCBxdWVzdGlvbiA9PiB7XHJcbiAgICAgICAgcXVlc3Rpb24uY29ycmVjdEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHF1ZXN0aW9uQ29ycmVjdExpc3RlbmVyICk7IC8vIG5vIHJlbW92ZUxpc3RlbmVyIHJlcXVpcmVkXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGNyZWF0ZSBiYWdzIGFuZCBpdGVtc1xyXG4gICAgdGhpcy5iYWdzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mQmFnczsgaSsrICkge1xyXG5cclxuICAgICAgLy8gdGhlIGJhZydzIHBvc2l0aW9uIG9uIHRoZSBzaGVsZlxyXG4gICAgICBjb25zdCBiYWdDZWxsSW5kZXggPSB0aGlzLnNoZWxmLmJhZ1Jvdy5nZXRGaXJzdFVub2NjdXBpZWRDZWxsKCk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhZ0NlbGxJbmRleCAhPT0gLTEsICdzaGVsZiBpcyBmdWxsJyApO1xyXG4gICAgICBjb25zdCBiYWdQb3NpdGlvbiA9IHRoaXMuc2hlbGYuYmFnUm93LmdldENlbGxQb3NpdGlvbiggYmFnQ2VsbEluZGV4ICk7XHJcblxyXG4gICAgICAvLyBjcmVhdGUgaXRlbXMgaWYgdGhlIGJhZyBvcGVucyB3aGVuIHBsYWNlZCBvbiB0aGUgc2NhbGVcclxuICAgICAgbGV0IGl0ZW1zID0gbnVsbDtcclxuICAgICAgaWYgKCBvcHRpb25zLmJhZ3NPcGVuICkge1xyXG5cclxuICAgICAgICBpdGVtcyA9IFtdO1xyXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHRoaXMucXVhbnRpdHlQZXJCYWc7IGorKyApIHtcclxuXHJcbiAgICAgICAgICAvLyBjcmVhdGUgaXRlbSwgaW5pdGlhbGx5IGludmlzaWJsZSBhbmQgbm90IG9uIHNoZWxmIG9yIHNjYWxlXHJcbiAgICAgICAgICBjb25zdCBpdGVtID0gbmV3IFNob3BwaW5nSXRlbSggdGhpcy5wbHVyYWxOYW1lLCB0aGlzLml0ZW1JbWFnZSwge1xyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgaXRlbXMucHVzaCggaXRlbSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gY3JlYXRlIGJhZ1xyXG4gICAgICBjb25zdCBiYWcgPSBuZXcgQmFnKCB0aGlzLnBsdXJhbE5hbWUsIHRoaXMuYmFnSW1hZ2UsIHtcclxuICAgICAgICBwb3NpdGlvbjogYmFnUG9zaXRpb24sXHJcbiAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5iYWdzLnB1c2goIGJhZyApO1xyXG5cclxuICAgICAgLy8gcHV0IGJhZyBvbiBzaGVsZlxyXG4gICAgICB0aGlzLnNoZWxmLmJhZ1Jvdy5wdXQoIGJhZywgYmFnQ2VsbEluZGV4ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGVzIHRpbWUtZGVwZW5kZW50IHBhcnRzIG9mIHRoZSBtb2RlbC5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSB0aW1lIHNpbmNlIHRoZSBwcmV2aW91cyBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIGFuaW1hdGUgYmFnc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYWdzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzLmJhZ3NbIGkgXS5zdGVwKCBkdCApO1xyXG5cclxuICAgICAgLy8gYW5pbWF0ZSBpdGVtc1xyXG4gICAgICBjb25zdCBpdGVtcyA9IHRoaXMuYmFnc1sgaSBdLml0ZW1zO1xyXG4gICAgICBpZiAoIGl0ZW1zICkge1xyXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGl0ZW1zLmxlbmd0aDsgaisrICkge1xyXG4gICAgICAgICAgaXRlbXNbIGogXS5zdGVwKCBkdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG5cclxuICAgIHRoaXMucmF0ZS5yZXNldCgpO1xyXG5cclxuICAgIC8vIHJlc2V0IHF1ZXN0aW9uc1xyXG4gICAgdGhpcy51bml0UmF0ZVF1ZXN0aW9uLnJlc2V0KCk7XHJcbiAgICB0aGlzLnF1ZXN0aW9uU2V0cy5mb3JFYWNoKCBxdWVzdGlvblNldCA9PiB7XHJcbiAgICAgIHF1ZXN0aW9uU2V0LmZvckVhY2goIHF1ZXN0aW9uID0+IHF1ZXN0aW9uLnJlc2V0KCkgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMucXVlc3Rpb25TZXRzSW5kZXhQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMucmVzZXRTaGVsZkFuZFNjYWxlKCk7XHJcblxyXG4gICAgLy8gcmVzZXQgdGhlc2UgbGFzdCwgc2luY2UgbW92aW5nIGJhZ3MgYW5kIGl0ZW1zIGNhbiBjcmVhdGUgbWFya2Vyc1xyXG4gICAgdGhpcy5kb3VibGVOdW1iZXJMaW5lLnJlc2V0KCk7XHJcbiAgICB0aGlzLm1hcmtlckVkaXRvci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBzaGVsZiBhbmQgc2NhbGUuXHJcbiAgICogQWxsIGl0ZW1zIGFyZSBwdXQgYmFjayBpbnRvIGJhZ3MsIGFuZCBhbGwgYmFncyBhcmUgcmV0dXJuZWQgdG8gdGhlIHNoZWxmLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldFNoZWxmQW5kU2NhbGUoKSB7XHJcblxyXG4gICAgLy8gY2xlYXIgYWxsIGNlbGxzIG9uIHRoZSBzaGVsZlxyXG4gICAgdGhpcy5zaGVsZi5yZXNldCgpO1xyXG5cclxuICAgIC8vIGNsZWFyIGFsbCBjZWxscyBvbiB0aGUgc2NhbGVcclxuICAgIHRoaXMuY3JlYXRlTWFya2VyRW5hYmxlZCA9IGZhbHNlOyAvLyBwcmV2ZW50IGNyZWF0aW9uIG9mIHNwdXJpb3VzIG1hcmtlcnNcclxuICAgIHRoaXMuc2NhbGUucmVzZXQoKTtcclxuICAgIHRoaXMuY3JlYXRlTWFya2VyRW5hYmxlZCA9IHRydWU7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5iYWdzLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgLy8gcmV0dXJuIGJhZyB0byBzaGVsZlxyXG4gICAgICBjb25zdCBiYWdDZWxsSW5kZXggPSB0aGlzLnNoZWxmLmJhZ1Jvdy5nZXRGaXJzdFVub2NjdXBpZWRDZWxsKCk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGJhZ0NlbGxJbmRleCAhPT0gLTEsICdzaGVsZiBpcyBmdWxsJyApO1xyXG4gICAgICB0aGlzLnNoZWxmLmJhZ1Jvdy5wdXQoIHRoaXMuYmFnc1sgaSBdLCBiYWdDZWxsSW5kZXggKTtcclxuICAgICAgdGhpcy5iYWdzWyBpIF0udmlzaWJsZVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIHJlc2V0IGl0ZW1zLCBtYWtpbmcgdGhlbSBpbnZpc2libGVcclxuICAgICAgY29uc3QgaXRlbXMgPSB0aGlzLmJhZ3NbIGkgXS5pdGVtcztcclxuICAgICAgaWYgKCBpdGVtcyApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCBpdGVtcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIGl0ZW1zWyBqIF0ucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG5leHQgc2V0IG9mIHF1ZXN0aW9ucy5cclxuICAgKiBXaGlsZSB0aGUgb3JkZXIgb2YgdGhlIHNldHMgaXMgcmFuZG9tLCB3ZSBjeWNsZSB0aHJvdWdoIHRoZSBzZXRzIGluIHRoZSBzYW1lIG9yZGVyIGVhY2ggdGltZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbmV4dFF1ZXN0aW9uU2V0KCkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucXVlc3Rpb25TZXRzLmxlbmd0aCA+IDEsICd0aGlzIGltcGxlbWVudGF0aW9uIHJlcXVpcmVzIG1vcmUgdGhhbiAxIHF1ZXN0aW9uIHNldCcgKTtcclxuXHJcbiAgICAvLyBhZGp1c3QgdGhlIGluZGV4IHRvIHBvaW50IHRvIHRoZSBuZXh0IHF1ZXN0aW9uIHNldFxyXG4gICAgaWYgKCB0aGlzLnF1ZXN0aW9uU2V0c0luZGV4UHJvcGVydHkudmFsdWUgPCB0aGlzLnF1ZXN0aW9uU2V0cy5sZW5ndGggLSAxICkge1xyXG4gICAgICB0aGlzLnF1ZXN0aW9uU2V0c0luZGV4UHJvcGVydHkudmFsdWUgPSB0aGlzLnF1ZXN0aW9uU2V0c0luZGV4UHJvcGVydHkudmFsdWUgKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMucXVlc3Rpb25TZXRzSW5kZXhQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG51bml0UmF0ZXMucmVnaXN0ZXIoICdTaG9wcGluZ1NjZW5lJywgU2hvcHBpbmdTY2VuZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxP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