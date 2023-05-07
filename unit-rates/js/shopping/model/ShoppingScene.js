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
  maxDigits: 4, // {number} number of digits that can be entered via the keypad
  maxDecimals: 2, // {number} maximum number of decimal places
  pickerColor: 'black' // {Color|string} color of the number picker for the numerator in the Rate accordion box
};

export default class ShoppingScene {

  /**
   * @param {Object} itemData - data structure that describes the item, see ShoppingItemData.
   *   Using a data structure like this is an alternative to having a large number of constructor parameters.
   * @param {Object} [options]
   */
  constructor( itemData, options ) {

    // verify that itemData has all required properties
    assert && ShoppingItemData.assertIsItemData( itemData );
    assert && assert( itemData.questionQuantities.length > 1, 'more than 1 set of questions is required' );

    // default option values apply to Fruit items
    options = merge( {

      rate: null, // {Rate|null} if null, will be initialized to unit rate

      // range of the denominator (quantity) is fixed
      fixedAxis: 'denominator',
      fixedAxisRange: new Range( 0, 16 ),

      numeratorOptions: null, // {*} options specific to the rate's numerator, see below
      denominatorOptions: null, // {*} options specific to the rate's denominator, see below

      // questions
      quantitySingularUnits: itemData.singularName, // {string} units for questions with singular quantities
      quantityPluralUnits: itemData.pluralName,  // {string} units for questions with plural quantities
      amountOfQuestionUnits: itemData.pluralName,  // {string} units used for "Apples for $10.00?" type questions

      // scale
      scaleQuantityIsDisplayed: false, // {boolean} whether quantity is displayed on the scale
      scaleQuantityUnits: '', // {string} units for quantity on scale
      bagsOpen: false, // {boolean} do bags open to display individual items?

      // Major markers have integer denominators
      isMajorMarker: ( numerator, denominator ) => Number.isInteger( denominator )

    }, options );

    // @public (read-only) options specific to the rate's numerator
    this.numeratorOptions = merge( {
      axisLabel: UnitRatesStrings.dollars, // {string} label for the axis on the double number line
      valueFormat: UnitRatesStrings.pattern_0cost, // {string} format with placeholder for value
      trimZeros: false // {boolean} whether to trim trailing zeros from decimal places
    }, SHARED_OPTIONS, options.numeratorOptions );

    // @public (read-only) options specific to the rate's denominator
    this.denominatorOptions = merge( {
      axisLabel: itemData.pluralName, // {string} label for the axis on the double number line
      valueFormat: SunConstants.VALUE_NUMBERED_PLACEHOLDER, // {string} format with placeholder for value
      trimZeros: true // {boolean} whether to trim trailing zeros from decimal places
    }, SHARED_OPTIONS, options.denominatorOptions );

    // @public {Rate}
    this.rate = options.rate || Rate.withUnitRate( itemData.unitRate );

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
    this.doubleNumberLine = new DoubleNumberLine( this.rate.unitRateProperty, {
      fixedAxis: options.fixedAxis,
      fixedAxisRange: options.fixedAxisRange,
      numeratorOptions: this.numeratorOptions,
      denominatorOptions: this.denominatorOptions,
      isMajorMarker: options.isMajorMarker
    } );

    // @public
    this.markerEditor = new MarkerEditor( this.rate.unitRateProperty, {
      numeratorMaxDecimals: this.numeratorOptions.maxDecimals,
      denominatorMaxDecimals: this.denominatorOptions.maxDecimals
    } );

    // Does not work for mipmap, bagImage.width is undefined.
    // If considering a switch to mipmaps, see https://github.com/phetsims/unit-rates/issues/157
    assert && assert( this.bagImage.width && this.bagImage.height, 'Are you using the image plugin?' );
    const bagSize = new Dimension2(
      URConstants.BAG_IMAGE_SCALE * this.bagImage.width,
      URConstants.BAG_IMAGE_SCALE * this.bagImage.height );

    assert && assert( this.itemImage.width && this.itemImage.height, 'Are you using the image plugin?' );
    const itemSize = new Dimension2(
      URConstants.SHOPPING_ITEM_IMAGE_SCALE * this.itemImage.width,
      URConstants.SHOPPING_ITEM_IMAGE_SCALE * this.itemImage.height );

    // @public
    this.shelf = new Shelf( {
      position: new Vector2( 512, 560 ),
      numberOfBags: this.numberOfBags,
      bagSize: bagSize,
      bagRowYOffset: ( options.bagsOpen ? 0 : 10 ),
      numberOfItems: this.numberOfBags * this.quantityPerBag,
      itemSize: itemSize,
      itemRowOverlap: this.itemRowOverlap
    } );

    // @public
    this.scale = new Scale( this.rate.unitRateProperty, {
      position: this.shelf.position.minusXY( 0, 220 ), // centered above the shelf
      numberOfBags: this.numberOfBags,
      bagSize: bagSize,
      numberOfItems: this.numberOfBags * this.quantityPerBag,
      itemSize: itemSize,
      itemRowOverlap: this.itemRowOverlap,
      quantityPerBag: this.quantityPerBag,
      quantityUnits: options.scaleQuantityUnits
    } );

    // The marker that corresponds to what's currently on the scale
    let scaleMarker = null;

    // @private flag to disable creation of spurious markers during reset
    this.createMarkerEnabled = true;

    // Create a marker when what's on the scale changes
    this.scale.quantityProperty.lazyLink( quantity => {

      // the marker for what was previously on the scale becomes erasable
      if ( scaleMarker ) {
        scaleMarker.colorProperty.value = URColors.majorMarker;
        scaleMarker.erasable = true;
      }

      // the new marker for what's on the scale
      if ( quantity > 0 && this.createMarkerEnabled ) {
        scaleMarker = new Marker( this.scale.costProperty.value, quantity, 'scale', {
          isMajor: true, // all scale markers are major, per the design document
          color: URColors.scaleMarker,
          erasable: false
        } );
        this.doubleNumberLine.addMarker( scaleMarker );
      }
    } );

    // @public {ShoppingQuestion} 'Unit Rate?'
    this.unitRateQuestion = ShoppingQuestionFactory.createUnitRateQuestion( this.rate.unitRateProperty.value,
      options.quantitySingularUnits, this.numeratorOptions, this.denominatorOptions );

    // @private {ShoppingQuestion[][]} instantiate ShoppingQuestions, grouped into sets
    this.questionSets = ShoppingQuestionFactory.createQuestionSets( itemData.questionQuantities, this.rate.unitRateProperty.value,
      options.quantitySingularUnits, options.quantityPluralUnits, options.amountOfQuestionUnits,
      this.numeratorOptions, this.denominatorOptions );

    // Randomize the order of the question sets
    if ( URQueryParameters.randomEnabled ) {
      this.questionSets = dotRandom.shuffle( this.questionSets );
    }

    // @private index of the question set that's being shown
    this.questionSetsIndexProperty = new NumberProperty( 0 );

    // @public (read-only) {Property.<ShoppingQuestion[]>} the current set of questions
    this.questionSetProperty = new Property( this.questionSets[ this.questionSetsIndexProperty.value ] );

    this.questionSetsIndexProperty.lazyLink( questionSetsIndex => { // no unlink required
      this.questionSetProperty.value = this.questionSets[ questionSetsIndex ];
    } );

    // When the unit rate changes, cancel any marker edit that is in progress, unlink not needed
    this.rate.unitRateProperty.lazyLink( unitRate => {
      this.markerEditor.reset();
    } );

    /**
     * When a question is answered correctly, create a corresponding marker on the double number line.
     * @param {ShoppingQuestion} question
     */
    const questionCorrectListener = question => {
      const marker = new Marker( question.numerator, question.denominator, 'question', {
        isMajor: true, // all question markers are major, per the design document
        color: URColors.questionMarker,
        erasable: false
      } );
      this.doubleNumberLine.addMarker( marker );
    };
    this.unitRateQuestion.correctEmitter.addListener( questionCorrectListener ); // no removeListener required
    this.questionSets.forEach( questionSet => {
      questionSet.forEach( question => {
        question.correctEmitter.addListener( questionCorrectListener ); // no removeListener required
      } );
    } );

    // @public (read-only) create bags and items
    this.bags = [];
    for ( let i = 0; i < this.numberOfBags; i++ ) {

      // the bag's position on the shelf
      const bagCellIndex = this.shelf.bagRow.getFirstUnoccupiedCell();
      assert && assert( bagCellIndex !== -1, 'shelf is full' );
      const bagPosition = this.shelf.bagRow.getCellPosition( bagCellIndex );

      // create items if the bag opens when placed on the scale
      let items = null;
      if ( options.bagsOpen ) {

        items = [];
        for ( let j = 0; j < this.quantityPerBag; j++ ) {

          // create item, initially invisible and not on shelf or scale
          const item = new ShoppingItem( this.pluralName, this.itemImage, {
            visible: false
          } );
          items.push( item );
        }
      }

      // create bag
      const bag = new Bag( this.pluralName, this.bagImage, {
        position: bagPosition,
        items: items
      } );
      this.bags.push( bag );

      // put bag on shelf
      this.shelf.bagRow.put( bag, bagCellIndex );
    }
  }

  /**
   * Updates time-dependent parts of the model.
   * @param {number} dt - time since the previous step, in seconds
   * @public
   */
  step( dt ) {

    // animate bags
    for ( let i = 0; i < this.bags.length; i++ ) {
      this.bags[ i ].step( dt );

      // animate items
      const items = this.bags[ i ].items;
      if ( items ) {
        for ( let j = 0; j < items.length; j++ ) {
          items[ j ].step( dt );
        }
      }
    }
  }

  // @public
  reset() {

    this.rate.reset();

    // reset questions
    this.unitRateQuestion.reset();
    this.questionSets.forEach( questionSet => {
      questionSet.forEach( question => question.reset() );
    } );
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

    for ( let i = 0; i < this.bags.length; i++ ) {

      // return bag to shelf
      const bagCellIndex = this.shelf.bagRow.getFirstUnoccupiedCell();
      assert && assert( bagCellIndex !== -1, 'shelf is full' );
      this.shelf.bagRow.put( this.bags[ i ], bagCellIndex );
      this.bags[ i ].visibleProperty.value = true;

      // reset items, making them invisible
      const items = this.bags[ i ].items;
      if ( items ) {
        for ( let j = 0; j < items.length; j++ ) {
          items[ j ].reset();
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

    assert && assert( this.questionSets.length > 1, 'this implementation requires more than 1 question set' );

    // adjust the index to point to the next question set
    if ( this.questionSetsIndexProperty.value < this.questionSets.length - 1 ) {
      this.questionSetsIndexProperty.value = this.questionSetsIndexProperty.value + 1;
    }
    else {
      this.questionSetsIndexProperty.value = 0;
    }
  }
}

unitRates.register( 'ShoppingScene', ShoppingScene );