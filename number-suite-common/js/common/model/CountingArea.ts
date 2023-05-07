// Copyright 2019-2023, University of Colorado Boulder

/**
 * Model for managing countingObjects and tenFrames.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import CountingCommonModel from '../../../../counting-common/js/common/model/CountingCommonModel.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonConstants from '../NumberSuiteCommonConstants.js';
import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import TenFrame from '../../lab/model/TenFrame.js';
import Property from '../../../../axon/js/Property.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import GroupAndLinkType from './GroupAndLinkType.js';
import TProperty from '../../../../axon/js/TProperty.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';

type SelfOptions = {
  tenFrames?: null | ObservableArray<TenFrame>;
};
export type CountingAreaOptions = SelfOptions;

type createCountingObjectFromCreatorNodeOptions = {
  shouldAnimate?: boolean;
  value?: number;
  remainder?: boolean;
};
export type CountingObjectSerialization = {
  position: Vector2;
  numberValue: number;
  zIndex: number;
};

// constants
const GROUP_DIVISORS = [ 2, 5, 10 ]; // specified by designer
const ORGANIZED_COUNTING_OBJECT_MARGIN = 3;
const NUMBER_OF_ORGANIZE_ROWS = 5; // to match ten frames, which are 5x2

// the minimum distance that a countingObject added to the countingArea via animation can be to another countingObject
// in the countingArea, in screen coordinates
const MIN_DISTANCE_BETWEEN_ADDED_COUNTING_OBJECTS = 60;

class CountingArea extends CountingCommonModel {
  private getCountingObjectOrigin: () => Vector2;

  private boundsProperty: TReadOnlyProperty<Bounds2>;
  private organizedObjectSpots: Vector2[]; // Positions point to the top and left of the spot it should take up.

  // true when this.getCountingObjectOrigin() and this.boundsProperty have been set
  private initialized: boolean;
  private countingObjectCreatorNodeHeight: number;

  // contains any ten frames that are in the countingArea
  public readonly tenFrames: ObservableArray<TenFrame> | null;
  public readonly groupingEnabledProperty: TReadOnlyProperty<boolean>;

  public constructor( highestCount: number,
                      groupingEnabledProperty: TReadOnlyProperty<boolean>,
                      providedOptions?: CountingAreaOptions ) {
    super( highestCount );

    const options = optionize<CountingAreaOptions, SelfOptions>()( {
      tenFrames: null
    }, providedOptions );

    this.groupingEnabledProperty = groupingEnabledProperty;

    // set later by the view
    this.getCountingObjectOrigin = () => Vector2.ZERO;
    this.countingObjectCreatorNodeHeight = 0;
    this.boundsProperty = new Property( new Bounds2( 0, 0, 0, 0 ) );
    this.organizedObjectSpots = [ Vector2.ZERO ];

    this.initialized = false;

    this.tenFrames = options.tenFrames;

    this.countingObjects.addItemRemovedListener( countingObject => { countingObject.dispose(); } );
  }

  /**
   * Setup the origin and bounds needed from the view
   */
  public initialize( getCountingObjectOrigin: () => Vector2, countingObjectCreatorNodeHeight: number,
                     boundsProperty: TReadOnlyProperty<Bounds2> ): void {
    assert && assert( !this.initialized, 'CountingArea already initialized' );

    // use a function for getting the paper number origin because its position changes in the view
    this.getCountingObjectOrigin = getCountingObjectOrigin;
    this.countingObjectCreatorNodeHeight = countingObjectCreatorNodeHeight;
    this.boundsProperty = boundsProperty;
    this.initialized = true;

    this.organizedObjectSpots = this.calculateOrganizedObjectSpots();
  }

  /**
   * Create and randomly position a group of objects whose sum is the current number.
   */
  public createAllObjects( currentNumber: number, setAllObjectsAsGrouped: boolean ): void {
    this.removeAllCountingObjects();
    const objectShouldAnimate = false;

    if ( setAllObjectsAsGrouped ) {
      const divisor = dotRandom.sample( GROUP_DIVISORS );
      const numberOfCards = Math.floor( currentNumber / divisor );
      const remainderCardValue = currentNumber % divisor;

      _.times( numberOfCards, () => {
        this.createCountingObjectFromCreatorNode( {
          shouldAnimate: objectShouldAnimate,
          value: divisor
        } );
      } );

      if ( remainderCardValue ) {
        this.createCountingObjectFromCreatorNode( {
          shouldAnimate: objectShouldAnimate,
          value: remainderCardValue,
          remainder: true
        } );
      }
    }
    else {
      _.times( currentNumber, () => {
        this.createCountingObjectFromCreatorNode( {
          shouldAnimate: objectShouldAnimate
        } );
      } );
    }

    this.calculateTotal();
  }

  /**
   * Creates a countingObject and animates it to a random open place in the countingArea.
   */
  public createCountingObjectFromCreatorNode( providedOptions?: createCountingObjectFromCreatorNodeOptions ): void {
    assert && assert( this.initialized, 'createCountingObjectFromCreatorNode called before initialization' );

    const options = optionize<createCountingObjectFromCreatorNodeOptions>()( {
      shouldAnimate: true,
      value: NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE,
      remainder: false
    }, providedOptions );

    let destinationPosition;
    let findCount = 0;

    const countingObject = new CountingObject( options.value, Vector2.ZERO, {
      groupingEnabledProperty: this.groupingEnabledProperty
    } );
    const origin = this.getCountingObjectOrigin().minus( countingObject.localBounds.center );
    const scale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE :
                  NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
    countingObject.setDestination( origin, false, {
      targetScale: scale
    } );

    // Add the new countingObject BEFORE calculating the countingObjectOriginBounds so the bounds of the countingObject
    // match the view state of whether grouping is enabled or not, which changes the countingObject's bounds.
    this.addCountingObject( countingObject );

    // The bounds of the countingArea, adjusted so remove space where created countingOObject should not go. NOTE: The
    // calculation below assumes that the countingObjectCreatorNode is positioned along the bottom of the
    // countingArea bounds, see positioning in CountingAreaNode.
    const countingAreaBounds = this.boundsProperty.value.withMaxY(
      this.boundsProperty.value.maxY - this.countingObjectCreatorNodeHeight - CountingCommonConstants.COUNTING_AREA_MARGIN );
    const countingObjectOriginBounds = countingObject.getOriginBounds( countingAreaBounds );

    // Looks for positions that are not overlapping with other countingObjects in the countingArea
    while ( !destinationPosition ) {
      const possibleDestinationPoint = dotRandom.nextPointInBounds( countingObjectOriginBounds );

      // Initialized to no available until we check against every other countingObject.
      let randomSpotIsAvailable = true;

      // No need to check countingObjects that are on their way back to their creator.
      const countingObjectsToCheck = this.getCountingObjectsIncludedInSum();

      // Compare the proposed destination to the position of every countingObject in the countingArea. use c-style loop for
      // best performance, since this loop is nested
      for ( let i = 0; i < countingObjectsToCheck.length; i++ ) {
        const countingObject = countingObjectsToCheck[ i ];
        const position = countingObject.destination || countingObject.positionProperty.value;

        if ( position.distance( possibleDestinationPoint ) < MIN_DISTANCE_BETWEEN_ADDED_COUNTING_OBJECTS ) {
          randomSpotIsAvailable = false;
        }
      }

      // Bail if taking a while to find a spot. 1000 empirically determined by printing the number of attempts when 19
      // countingObjects are spaced pretty evenly in the countingArea.
      if ( ++findCount > 1000 ) {
        randomSpotIsAvailable = true;
      }
      destinationPosition = randomSpotIsAvailable ? possibleDestinationPoint : null;
    }

    countingObject.setDestination( destinationPosition, options.shouldAnimate, {
      targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE
    } );

    this.calculateTotal();
  }

  /**
   * Finds the best matching countingObject or countingObjects and animates them back to the creatorNode.
   */
  public returnCountingObjectToCreatorNode( valueToReturn: number = NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE ): void {
    assert && assert( this.getCountingObjectsIncludedInSum().length > 0, 'countingObjects should exist in countingArea' );
    assert && assert( this.initialized, 'returnCountingObjectToCreatorNode called before initialization' );

    // Sort by not in a ten frame, then by proximity to the creatorNode.
    const sortedCountingObjects = _.sortBy( this.getCountingObjectsIncludedInSum(), [
      countingObject => {
        return this.countingObjectContainedByTenFrame( countingObject ) ? 1 : 0;
      },
      countingObject => {
        return countingObject.positionProperty.value.distance( this.getCountingObjectOrigin() );
      }
    ] );

    /**
     * Recursively search for the best countingObjects to return to the creatorNode for the given value. The criteria
     * for the best matches is described below in the parts of this function.
     */
    const recursivelyFindBestMatches = ( value: number, sortedCountingObjects: CountingObject[] ): CountingObject[] => {

      let bestMatches: CountingObject[] = [];

      // Our base case is value === 0, when value is greater than zero, there is still work to be done.
      if ( value > 0 ) {

        // First, see if there are any countingObjects with the same value. If so, we are done.
        for ( let i = 0; i < sortedCountingObjects.length; i++ ) {
          const countingObject = sortedCountingObjects[ i ];

          // We want to grab the first countingObject that matches to also get the closest.
          if ( countingObject.numberValueProperty.value === value && bestMatches.length === 0 ) {
            bestMatches = [ countingObject ];
          }
        }

        // If there are none of the same value, find the largest countingObject.
        const largestCountingObject = _.maxBy( sortedCountingObjects, x => x.numberValueProperty.value )!;

        // If the value we're looking for is larger than the largest countingObject, then we're going to need to send
        // more than one countingObject back to the creatorNode. So include the largest, and then start the search over
        // for the next best match.
        if ( value > largestCountingObject.numberValueProperty.value ) {
          const nextValueToReturn = value - largestCountingObject.numberValueProperty.value;
          assert && assert( nextValueToReturn >= 0, 'The next value to return cannot be less than zero. nextValueToReturn = ' + nextValueToReturn );

          // Before starting the search again for the next countingObject, remove the one we know we want, so it's not
          // a part of the next search.
          _.remove( sortedCountingObjects, largestCountingObject );

          bestMatches = [ largestCountingObject, ...recursivelyFindBestMatches( nextValueToReturn, sortedCountingObjects ) ];
        }

          // If the value we're looking for is smaller than the largestCountingObject, create a new countingObject by
        // breaking off the value we need from the largest one.
        else if ( value < largestCountingObject.numberValueProperty.value ) {
          bestMatches = [ this.splitCountingObject( largestCountingObject, value ) ];
        }
      }

      return bestMatches;
    };

    const countingObjectsToReturn = recursivelyFindBestMatches( valueToReturn, sortedCountingObjects );

    // Send all of our matches back to the creator node.
    countingObjectsToReturn.forEach( countingObjectToReturn => {
      if ( this.countingObjectContainedByTenFrame( countingObjectToReturn ) ) {
        const tenFrame = this.getContainingTenFrame( countingObjectToReturn );
        tenFrame.removeCountingObject();
      }
      else {
        this.sendCountingObjectToCreatorNode( countingObjectToReturn );
      }
    } );
  }

  /**
   * Animates the given countingObject back to its creator node.
   */
  public sendCountingObjectToCreatorNode( countingObject: CountingObject ): void {
    assert && assert( this.countingObjects.lengthProperty.value > 0, 'countingObjects should exist in countingArea' );
    assert && assert( this.initialized, 'returnCountingObjectToCreatorNode called before initialization' );
    assert && assert( countingObject.includeInSumProperty.value, 'countingObject already removed from sum' );

    // Remove it from counting towards the sum and send it back to its origin. countingObjects aren't removed from the
    // countingArea until they get back to the creatorNode, but we don't want them to count towards the sum while they're on
    // their way to the creatorNode.
    if ( countingObject.includeInSumProperty.value ) {
      countingObject.includeInSumProperty.value = false;
      this.calculateTotal();

      const origin = this.getCountingObjectOrigin().minus( countingObject.localBounds.center );
      const scale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE :
                    NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;

      countingObject.setDestination( origin, true, {
        targetScale: scale
      } );
    }
  }

  /**
   * Returns true if the provided countingObject is contained by a tenFrame
   */
  private countingObjectContainedByTenFrame( countingObject: CountingObject ): boolean {
    if ( this.tenFrames ) {
      let foundInTenFrame = false;

      this.tenFrames.forEach( tenFrame => {
        if ( tenFrame.countingObjects.includes( countingObject ) ) {
          foundInTenFrame = true;
        }
      } );
      return foundInTenFrame;
    }
    else {
      return false;
    }
  }

  /**
   * Returns the tenFrame that the countingObject is contained by. Should only be called if the countingObject is known to be
   * contained by a tenFrame.
   */
  private getContainingTenFrame( countingObject: CountingObject ): TenFrame {
    assert && assert( this.tenFrames, 'should not be called if there are no ten frames' );

    let containingTenFrame: TenFrame;

    this.tenFrames!.forEach( tenFrame => {
      if ( tenFrame.countingObjects.includes( countingObject ) ) {
        containingTenFrame = tenFrame;
      }
    } );

    assert && assert( containingTenFrame!, 'no containing tenFrame found for countingObject' );

    return containingTenFrame!;
  }

  /**
   * Calculates the spots for organized countingObjects.
   */
  private calculateOrganizedObjectSpots(): Vector2[] {
    assert && assert( this.initialized, 'calculateOrganizedObjectSpots called before initialization' );

    const countingObjectWidth = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.width;
    const countingObjectHeight = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.height;
    const numberOfRows = this.sumProperty.range.max / NUMBER_OF_ORGANIZE_ROWS;

    // N countingObjects across + margins to the right for all columns except the last one.
    const contentWidth = NUMBER_OF_ORGANIZE_ROWS * ( countingObjectWidth + ORGANIZED_COUNTING_OBJECT_MARGIN ) -
                         ORGANIZED_COUNTING_OBJECT_MARGIN;

    // The calculated spots correspond to the countingObjects' top left corner, so adjust by the x-amount of the bounds
    // to get us to the left edge. The y-position of countingObjects is already at the top.
    const xMargin = ( this.boundsProperty.value.width - contentWidth ) / 2 -
                    CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.minX;
    const yMargin = CountingCommonConstants.COUNTING_AREA_MARGIN;

    const spots = [];

    for ( let i = 0; i < numberOfRows; i++ ) {
      for ( let j = 0; j < NUMBER_OF_ORGANIZE_ROWS; j++ ) {
        spots.push( new Vector2(
          this.boundsProperty.value.minX + xMargin + ( ( countingObjectWidth + ORGANIZED_COUNTING_OBJECT_MARGIN ) * j ),
          this.boundsProperty.value.minY + yMargin + ( ( countingObjectHeight + ORGANIZED_COUNTING_OBJECT_MARGIN ) * i )
        ) );
      }
    }
    return spots;
  }

  /**
   * Returns all countingObjects not included in the sum of this countingArea.
   */
  public getCountingObjectsIncludedInSum(): CountingObject[] {
    return [ ...this.countingObjects ].filter( countingObject => countingObject.includeInSumProperty.value );
  }

  /**
   * Organizes the countingObjects in a grid pattern, but first breaks all down into singles.
   */
  public organizeObjects(): void {

    assert && assert( this.organizedObjectSpots, 'this.organizedObjectSpots must exist to call this function' );

    this.breakApartCountingObjects();

    // Copy the current countingObjects in the countingArea so we can mutate them.
    let countingObjectsToOrganize = this.getCountingObjectsIncludedInSum();
    const numberOfObjectsToOrganize = countingObjectsToOrganize.length;

    for ( let i = 0; i < numberOfObjectsToOrganize; i++ ) {
      const spot = this.organizedObjectSpots[ i ];

      // Sort the countingObjects by closest to the destination.
      countingObjectsToOrganize = _.sortBy( countingObjectsToOrganize, countingObject => {
        return countingObject.positionProperty.value.distance( spot );
      } );
      const countingObjectToOrganize = countingObjectsToOrganize.shift()!;

      countingObjectToOrganize.setDestination( spot, true, {
        targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE
      } );
    }

    assert && assert( countingObjectsToOrganize.length === 0, 'should have handled all countingObjects' );
  }

  /**
   * @param countingObjectSerializations
   * @param linkStatusChangedEmitter
   * @param areObjectsLinkedToOnes - if we want to link the countingAreas, or unlink them.
   * @param groupAndLinkType
   */
  public matchCountingObjectsToLinkedCountingArea( countingObjectSerializations: CountingObjectSerialization[],
                                                   linkStatusChangedEmitter: TEmitter<[ boolean ]>, areObjectsLinkedToOnes: boolean,
                                                   groupAndLinkType: GroupAndLinkType ): void {

    if ( areObjectsLinkedToOnes ) {
      this.linkToSerializedCountingObjects( countingObjectSerializations, linkStatusChangedEmitter, areObjectsLinkedToOnes );
    }
    else {
      // If not linking, it is without animation. This part is really simple. Just clear out all the counting objects in
      // the objectsCountingArea, and add new ones that match the serialization from the onesCountingArea (position and numberValue
      // matching).

      const objectsToOrganize = this.getCountingObjectsIncludedInSum();
      objectsToOrganize.forEach( countingObject => this.removeCountingObject( countingObject ) );

      _.sortBy( countingObjectSerializations, 'zIndex' ).forEach( serialization => {
        const newCountingObject = new CountingObject( serialization.numberValue, serialization.position, {
          groupingEnabledProperty: this.groupingEnabledProperty
        } );
        this.addCountingObject( newCountingObject );
      } );

      // If the groupAndLinkType was set to ungrouped, break apart the counting objects. This is needed to avoid an order
      // dependency problem when switching to an ungrouped state where the existing countingObjects are broken apart before
      // we clear them out and re-add them above.
      groupAndLinkType === GroupAndLinkType.UNGROUPED && this.breakApartCountingObjects( true );

      // Since there is no animation, fire this immediately
      linkStatusChangedEmitter.emit( areObjectsLinkedToOnes );
    }
  }

  /**
   * "Link" current CountingObjects to the provided serialization state (presumably from another countingArea). Here link
   * means that it is matched.
   *
   * If linking, we may want to break apart so that half of a group can animate
   * to one spot and the other half another. We don't use breakApartObjects because that is
   * overkill and bad UX (imagine both models have a group of 4, don't split that up to animate in one model). Then
   * animate to the right spots.
   *
   * NOTE: This function never combines objects when linking, but just animates cards to the same location to give the
   * illusion of combining. 2 items are assumed to ensure this behavior:
   * 1. Because the actual "linked" state is just a mimic of the other countingArea, and this countingArea is hidden.
   * 2. Because it assumes that when unlinking (reshowing this underlying countingArea, see the other half of
   *  `matchCountingObjectsToLinkedCountingArea()`), that the state will be auto-updated (without animation) to match
   *  the appropriate and exact county object state.
   */
  private linkToSerializedCountingObjects( targetCountingObjectSerializations: CountingObjectSerialization[],
                                           linkStatusChangedEmitter: TEmitter<[ boolean ]>,
                                           areObjectsLinkedToOnes: boolean ): void {

    const objectsToOrganize = this.getCountingObjectsIncludedInSum();

    // Starting length, but could increase if Counting Objects are broken apart
    let numberOfObjectsToOrganize = objectsToOrganize.length;

    const numberOfAnimationsFinishedProperty = new NumberProperty( 0 );

    // Sort by highest value first. Before we use these to move or breakup our countingObjects so they match the
    // serializations, we will remove any serializations that already match existing countingObjects below.
    const inputSerializationsSortedByValue: CountingObjectSerialization[] = _.sortBy( targetCountingObjectSerializations,
      countingObjectSerialization => countingObjectSerialization.numberValue ).reverse();

    // Only animate if we are linking to the onesCountingArea
    const animate = areObjectsLinkedToOnes;

    const countingObjectsSortedByValue = this.getCountingObjectsByValue();

    // Iterate through each input and try to mutate the current countingObjects list to support that target
    for ( let j = inputSerializationsSortedByValue.length - 1; j >= 0; j-- ) {
      const targetSerialization = inputSerializationsSortedByValue[ j ];
      const targetValue = targetSerialization.numberValue;

      // First see if there are any exact position/value matches, and keep those where they are.
      // Use a forEach because we may mutate the list inline.
      for ( let i = 0; i < countingObjectsSortedByValue.length; i++ ) {
        const currentCountingObject = countingObjectsSortedByValue[ i ];

        // If there is a match with the same value and position, then we don't need to call sendTo because this
        // countingObject is already in the correct spot.
        if ( currentCountingObject.numberValueProperty.value === targetValue &&
             currentCountingObject.positionProperty.value.equals( targetSerialization.position ) ) {

          arrayRemove( countingObjectsSortedByValue, currentCountingObject );
          arrayRemove( inputSerializationsSortedByValue, targetSerialization );
          numberOfAnimationsFinishedProperty.value += 1;
          break;
        }
      }
    }

    for ( let i = 0; i < inputSerializationsSortedByValue.length; i++ ) {
      assert && assert( countingObjectsSortedByValue.length > 0, 'still have serializations, but no CountingObjects left' );

      const targetSerialization = inputSerializationsSortedByValue[ i ];

      const desiredValue = targetSerialization.numberValue;
      let currentNumberValueCount = 0;
      let targetHandled = false;

      // Then, move or split the remaining countingObjects to match the serializations.
      while ( !targetHandled ) {

        const currentCountingObject = countingObjectsSortedByValue[ 0 ];
        assert && assert( this.countingObjects.includes( currentCountingObject ),
          'old, removed countingObject still at play here' );

        const nextNeededValue = desiredValue - currentNumberValueCount;

        // If the currentCountingObject has a matching or smaller value than the target serialization, send it to the
        // location of the target.
        if ( currentCountingObject.numberValueProperty.value <= nextNeededValue ) {
          this.sendCountingObjectTo( currentCountingObject, targetSerialization.position, numberOfAnimationsFinishedProperty, animate );
          arrayRemove( countingObjectsSortedByValue, currentCountingObject );
          currentNumberValueCount += currentCountingObject.numberValueProperty.value;

          // We are done when we've reached the desired value.
          targetHandled = currentNumberValueCount === desiredValue;
        }
        else if ( currentCountingObject.numberValueProperty.value > nextNeededValue ) {
          // If the currentCountingObject has a greater value than the target, split it up and then try this loop again.

          // split off the value we need to be used in the next iteration
          const newCountingObject = this.splitCountingObject( currentCountingObject, nextNeededValue );

          numberOfObjectsToOrganize += 1;
          countingObjectsSortedByValue.push( newCountingObject );
        }
      }
    }

    // Wait to proceed until all animations have completed
    numberOfAnimationsFinishedProperty.link( function numberOfAnimationsFinishedListener( numberOfAnimationsFinished: number ) {
      if ( numberOfAnimationsFinished === numberOfObjectsToOrganize ) {
        linkStatusChangedEmitter.emit( areObjectsLinkedToOnes );
        numberOfAnimationsFinishedProperty.unlink( numberOfAnimationsFinishedListener );
      }
    } );
  }

  /**
   * Only meant to be used for "mass exodus" where we want to keep track of when all are finished animated to destination
   */
  private sendCountingObjectTo( countingObject: CountingObject,
                                position: Vector2,
                                numberOfAnimationsFinishedProperty: TProperty<number>,
                                animate: boolean ): void {

    countingObject.setDestination( position, animate, {
      targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE,
      useStandardAnimationSpeed: false
    } );
    countingObject.endAnimationEmitter.addListener( function toRemove() {
      numberOfAnimationsFinishedProperty.value += 1;
      countingObject.endAnimationEmitter.removeListener( toRemove );
    } );
  }

  /**
   * Returns a list with the largest value counting objects first (only included in sum).
   */
  private getCountingObjectsByValue(): CountingObject[] {
    return _.sortBy( this.getCountingObjectsIncludedInSum(), countingObject => countingObject.numberValueProperty.value ).reverse();
  }

  /**
   * Splits the provided countingObject into two countingObjects. This is a function for the model to use for automated
   * actions, and does not relate to the USER splitting a countingObject when grabbing the handle of countingObject.
   */
  private splitCountingObject( countingObject: CountingObject, valueToSplit: number ): CountingObject {
    assert && assert( countingObject.includeInSumProperty.value,
      'attempted to split countingObject that has already been removed from the total' );
    const startingCount = _.sum( this.getCountingObjectsIncludedInSum().map( x => x.numberValueProperty.value ) );

    const totalValue = countingObject.numberValueProperty.value;
    assert && assert( valueToSplit < totalValue,
      `desired split value (${valueToSplit}) is the same or greater than the countingObject to split's value (${totalValue})` );

    const newCountingObject = new CountingObject( valueToSplit, countingObject.positionProperty.value, {
      groupingEnabledProperty: this.groupingEnabledProperty
    } );
    this.addCountingObject( newCountingObject );

    countingObject.changeNumber( totalValue - valueToSplit );

    const endingCount = _.sum( this.getCountingObjectsIncludedInSum().map( x => x.numberValueProperty.value ) );
    assert && assert( startingCount === endingCount, 'total doesn\'t match after splitting counting object' );

    return newCountingObject;
  }

  /**
   * Breaks apart all counting objects into counting objects with a value of 1. By default, it creates all new counting
   * objects in the position of the original counting object. If stack=true, it arranges them according to the
   * background shape of the original counting object. Any newly created countingObjects are added in front of the
   * existing countingObjects (z-index).
   */
  public breakApartCountingObjects( stack = false ): void {

    const objectsToBreakDown = this.getCountingObjectsIncludedInSum();
    const startingCount = _.sum( objectsToBreakDown.map( x => x.numberValueProperty.value ) );

    objectsToBreakDown.forEach( countingObject => {
      if ( countingObject.numberValueProperty.value > 1 ) {
        const countingObjectPosition = countingObject.positionProperty.value;
        const countingObjectValue = countingObject.numberValueProperty.value;

        const numberOfSets = countingObjectValue < NumberSuiteCommonConstants.TEN ? 1 : 2;
        const numberOfRows = NumberSuiteCommonConstants.TEN;

        const offsetYSegment = stack ? CountingCommonConstants.BREAK_APART_Y_OFFSET : 0;

        // The movable bounds with respect to positionProperty and to how much space our countingObject bounds takes up.
        const adjustedOriginBounds = countingObject.getOriginBounds( this.boundsProperty.value );

        // Each extra single that needs to be stacked will take up extra space, so use that in the calculation of if we
        // stack up or down. Will be 0 if not stacking.
        const neededSpace = offsetYSegment *
                            ( Math.min( countingObject.numberValueProperty.value, NumberSuiteCommonConstants.TEN ) - 1 );

        // If there isn't enough space below the current countingObject for a visual stack, place the stack above the
        // countingObject instead.
        const shouldStackUpwards = adjustedOriginBounds.maxY <= countingObjectPosition.y + neededSpace;

        // position of the first new CountingObject, respecting that if stacking upwards, we still create from the top
        // down.
        const origin = shouldStackUpwards ? countingObjectPosition.plusXY( 0, -neededSpace ) : countingObjectPosition;

        let currentOffsetY = 0;

        let reAddedCountingObjects = 0;
        const xShift = countingObjectValue >= NumberSuiteCommonConstants.TEN && stack ? -CountingCommonConstants.COUNTING_OBJECT_SIZE.width : 0;

        // We are about to add a bunch of ones to equal this countingObject's value
        this.removeCountingObject( countingObject );

        // Nested looping to account for 10s place and 1s place stacks
        for ( let i = numberOfSets - 1; i >= 0; i-- ) {
          for ( let j = 0; j < numberOfRows; j++ ) {
            if ( reAddedCountingObjects < countingObjectValue ) {
              const newCountingObject = new CountingObject( 1, origin.plusXY( i * xShift, currentOffsetY ), {
                groupingEnabledProperty: this.groupingEnabledProperty
              } );
              this.addCountingObject( newCountingObject );
              currentOffsetY += offsetYSegment;
              reAddedCountingObjects++;
            }
          }
          currentOffsetY = 0;
        }
      }
    } );

    // total the value of all counting objects after they have been broken up and re-created
    const newCount = _.sum( this.getCountingObjectsIncludedInSum().map( x => x.numberValueProperty.value ) );

    assert && assert( startingCount === newCount,
      'The value of all counting objects does not match their original value after breaking them apart' );
  }
}

numberSuiteCommon.register( 'CountingArea', CountingArea );
export default CountingArea;
