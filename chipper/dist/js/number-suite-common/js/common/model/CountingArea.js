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
import optionize from '../../../../phet-core/js/optionize.js';
import Property from '../../../../axon/js/Property.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import GroupAndLinkType from './GroupAndLinkType.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
// constants
const GROUP_DIVISORS = [2, 5, 10]; // specified by designer
const ORGANIZED_COUNTING_OBJECT_MARGIN = 3;
const NUMBER_OF_ORGANIZE_ROWS = 5; // to match ten frames, which are 5x2

// the minimum distance that a countingObject added to the countingArea via animation can be to another countingObject
// in the countingArea, in screen coordinates
const MIN_DISTANCE_BETWEEN_ADDED_COUNTING_OBJECTS = 60;
class CountingArea extends CountingCommonModel {
  // Positions point to the top and left of the spot it should take up.
  // true when this.getCountingObjectOrigin() and this.boundsProperty have been set
  // contains any ten frames that are in the countingArea
  constructor(highestCount, groupingEnabledProperty, providedOptions) {
    super(highestCount);
    const options = optionize()({
      tenFrames: null
    }, providedOptions);
    this.groupingEnabledProperty = groupingEnabledProperty;

    // set later by the view
    this.getCountingObjectOrigin = () => Vector2.ZERO;
    this.countingObjectCreatorNodeHeight = 0;
    this.boundsProperty = new Property(new Bounds2(0, 0, 0, 0));
    this.organizedObjectSpots = [Vector2.ZERO];
    this.initialized = false;
    this.tenFrames = options.tenFrames;
    this.countingObjects.addItemRemovedListener(countingObject => {
      countingObject.dispose();
    });
  }

  /**
   * Setup the origin and bounds needed from the view
   */
  initialize(getCountingObjectOrigin, countingObjectCreatorNodeHeight, boundsProperty) {
    assert && assert(!this.initialized, 'CountingArea already initialized');

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
  createAllObjects(currentNumber, setAllObjectsAsGrouped) {
    this.removeAllCountingObjects();
    const objectShouldAnimate = false;
    if (setAllObjectsAsGrouped) {
      const divisor = dotRandom.sample(GROUP_DIVISORS);
      const numberOfCards = Math.floor(currentNumber / divisor);
      const remainderCardValue = currentNumber % divisor;
      _.times(numberOfCards, () => {
        this.createCountingObjectFromCreatorNode({
          shouldAnimate: objectShouldAnimate,
          value: divisor
        });
      });
      if (remainderCardValue) {
        this.createCountingObjectFromCreatorNode({
          shouldAnimate: objectShouldAnimate,
          value: remainderCardValue,
          remainder: true
        });
      }
    } else {
      _.times(currentNumber, () => {
        this.createCountingObjectFromCreatorNode({
          shouldAnimate: objectShouldAnimate
        });
      });
    }
    this.calculateTotal();
  }

  /**
   * Creates a countingObject and animates it to a random open place in the countingArea.
   */
  createCountingObjectFromCreatorNode(providedOptions) {
    assert && assert(this.initialized, 'createCountingObjectFromCreatorNode called before initialization');
    const options = optionize()({
      shouldAnimate: true,
      value: NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE,
      remainder: false
    }, providedOptions);
    let destinationPosition;
    let findCount = 0;
    const countingObject = new CountingObject(options.value, Vector2.ZERO, {
      groupingEnabledProperty: this.groupingEnabledProperty
    });
    const origin = this.getCountingObjectOrigin().minus(countingObject.localBounds.center);
    const scale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE : NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
    countingObject.setDestination(origin, false, {
      targetScale: scale
    });

    // Add the new countingObject BEFORE calculating the countingObjectOriginBounds so the bounds of the countingObject
    // match the view state of whether grouping is enabled or not, which changes the countingObject's bounds.
    this.addCountingObject(countingObject);

    // The bounds of the countingArea, adjusted so remove space where created countingOObject should not go. NOTE: The
    // calculation below assumes that the countingObjectCreatorNode is positioned along the bottom of the
    // countingArea bounds, see positioning in CountingAreaNode.
    const countingAreaBounds = this.boundsProperty.value.withMaxY(this.boundsProperty.value.maxY - this.countingObjectCreatorNodeHeight - CountingCommonConstants.COUNTING_AREA_MARGIN);
    const countingObjectOriginBounds = countingObject.getOriginBounds(countingAreaBounds);

    // Looks for positions that are not overlapping with other countingObjects in the countingArea
    while (!destinationPosition) {
      const possibleDestinationPoint = dotRandom.nextPointInBounds(countingObjectOriginBounds);

      // Initialized to no available until we check against every other countingObject.
      let randomSpotIsAvailable = true;

      // No need to check countingObjects that are on their way back to their creator.
      const countingObjectsToCheck = this.getCountingObjectsIncludedInSum();

      // Compare the proposed destination to the position of every countingObject in the countingArea. use c-style loop for
      // best performance, since this loop is nested
      for (let i = 0; i < countingObjectsToCheck.length; i++) {
        const countingObject = countingObjectsToCheck[i];
        const position = countingObject.destination || countingObject.positionProperty.value;
        if (position.distance(possibleDestinationPoint) < MIN_DISTANCE_BETWEEN_ADDED_COUNTING_OBJECTS) {
          randomSpotIsAvailable = false;
        }
      }

      // Bail if taking a while to find a spot. 1000 empirically determined by printing the number of attempts when 19
      // countingObjects are spaced pretty evenly in the countingArea.
      if (++findCount > 1000) {
        randomSpotIsAvailable = true;
      }
      destinationPosition = randomSpotIsAvailable ? possibleDestinationPoint : null;
    }
    countingObject.setDestination(destinationPosition, options.shouldAnimate, {
      targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE
    });
    this.calculateTotal();
  }

  /**
   * Finds the best matching countingObject or countingObjects and animates them back to the creatorNode.
   */
  returnCountingObjectToCreatorNode(valueToReturn = NumberSuiteCommonConstants.PAPER_NUMBER_INITIAL_VALUE) {
    assert && assert(this.getCountingObjectsIncludedInSum().length > 0, 'countingObjects should exist in countingArea');
    assert && assert(this.initialized, 'returnCountingObjectToCreatorNode called before initialization');

    // Sort by not in a ten frame, then by proximity to the creatorNode.
    const sortedCountingObjects = _.sortBy(this.getCountingObjectsIncludedInSum(), [countingObject => {
      return this.countingObjectContainedByTenFrame(countingObject) ? 1 : 0;
    }, countingObject => {
      return countingObject.positionProperty.value.distance(this.getCountingObjectOrigin());
    }]);

    /**
     * Recursively search for the best countingObjects to return to the creatorNode for the given value. The criteria
     * for the best matches is described below in the parts of this function.
     */
    const recursivelyFindBestMatches = (value, sortedCountingObjects) => {
      let bestMatches = [];

      // Our base case is value === 0, when value is greater than zero, there is still work to be done.
      if (value > 0) {
        // First, see if there are any countingObjects with the same value. If so, we are done.
        for (let i = 0; i < sortedCountingObjects.length; i++) {
          const countingObject = sortedCountingObjects[i];

          // We want to grab the first countingObject that matches to also get the closest.
          if (countingObject.numberValueProperty.value === value && bestMatches.length === 0) {
            bestMatches = [countingObject];
          }
        }

        // If there are none of the same value, find the largest countingObject.
        const largestCountingObject = _.maxBy(sortedCountingObjects, x => x.numberValueProperty.value);

        // If the value we're looking for is larger than the largest countingObject, then we're going to need to send
        // more than one countingObject back to the creatorNode. So include the largest, and then start the search over
        // for the next best match.
        if (value > largestCountingObject.numberValueProperty.value) {
          const nextValueToReturn = value - largestCountingObject.numberValueProperty.value;
          assert && assert(nextValueToReturn >= 0, 'The next value to return cannot be less than zero. nextValueToReturn = ' + nextValueToReturn);

          // Before starting the search again for the next countingObject, remove the one we know we want, so it's not
          // a part of the next search.
          _.remove(sortedCountingObjects, largestCountingObject);
          bestMatches = [largestCountingObject, ...recursivelyFindBestMatches(nextValueToReturn, sortedCountingObjects)];
        }

        // If the value we're looking for is smaller than the largestCountingObject, create a new countingObject by
        // breaking off the value we need from the largest one.
        else if (value < largestCountingObject.numberValueProperty.value) {
          bestMatches = [this.splitCountingObject(largestCountingObject, value)];
        }
      }
      return bestMatches;
    };
    const countingObjectsToReturn = recursivelyFindBestMatches(valueToReturn, sortedCountingObjects);

    // Send all of our matches back to the creator node.
    countingObjectsToReturn.forEach(countingObjectToReturn => {
      if (this.countingObjectContainedByTenFrame(countingObjectToReturn)) {
        const tenFrame = this.getContainingTenFrame(countingObjectToReturn);
        tenFrame.removeCountingObject();
      } else {
        this.sendCountingObjectToCreatorNode(countingObjectToReturn);
      }
    });
  }

  /**
   * Animates the given countingObject back to its creator node.
   */
  sendCountingObjectToCreatorNode(countingObject) {
    assert && assert(this.countingObjects.lengthProperty.value > 0, 'countingObjects should exist in countingArea');
    assert && assert(this.initialized, 'returnCountingObjectToCreatorNode called before initialization');
    assert && assert(countingObject.includeInSumProperty.value, 'countingObject already removed from sum');

    // Remove it from counting towards the sum and send it back to its origin. countingObjects aren't removed from the
    // countingArea until they get back to the creatorNode, but we don't want them to count towards the sum while they're on
    // their way to the creatorNode.
    if (countingObject.includeInSumProperty.value) {
      countingObject.includeInSumProperty.value = false;
      this.calculateTotal();
      const origin = this.getCountingObjectOrigin().minus(countingObject.localBounds.center);
      const scale = countingObject.groupingEnabledProperty.value ? NumberSuiteCommonConstants.GROUPED_STORED_COUNTING_OBJECT_SCALE : NumberSuiteCommonConstants.UNGROUPED_STORED_COUNTING_OBJECT_SCALE;
      countingObject.setDestination(origin, true, {
        targetScale: scale
      });
    }
  }

  /**
   * Returns true if the provided countingObject is contained by a tenFrame
   */
  countingObjectContainedByTenFrame(countingObject) {
    if (this.tenFrames) {
      let foundInTenFrame = false;
      this.tenFrames.forEach(tenFrame => {
        if (tenFrame.countingObjects.includes(countingObject)) {
          foundInTenFrame = true;
        }
      });
      return foundInTenFrame;
    } else {
      return false;
    }
  }

  /**
   * Returns the tenFrame that the countingObject is contained by. Should only be called if the countingObject is known to be
   * contained by a tenFrame.
   */
  getContainingTenFrame(countingObject) {
    assert && assert(this.tenFrames, 'should not be called if there are no ten frames');
    let containingTenFrame;
    this.tenFrames.forEach(tenFrame => {
      if (tenFrame.countingObjects.includes(countingObject)) {
        containingTenFrame = tenFrame;
      }
    });
    assert && assert(containingTenFrame, 'no containing tenFrame found for countingObject');
    return containingTenFrame;
  }

  /**
   * Calculates the spots for organized countingObjects.
   */
  calculateOrganizedObjectSpots() {
    assert && assert(this.initialized, 'calculateOrganizedObjectSpots called before initialization');
    const countingObjectWidth = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.width;
    const countingObjectHeight = CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.height;
    const numberOfRows = this.sumProperty.range.max / NUMBER_OF_ORGANIZE_ROWS;

    // N countingObjects across + margins to the right for all columns except the last one.
    const contentWidth = NUMBER_OF_ORGANIZE_ROWS * (countingObjectWidth + ORGANIZED_COUNTING_OBJECT_MARGIN) - ORGANIZED_COUNTING_OBJECT_MARGIN;

    // The calculated spots correspond to the countingObjects' top left corner, so adjust by the x-amount of the bounds
    // to get us to the left edge. The y-position of countingObjects is already at the top.
    const xMargin = (this.boundsProperty.value.width - contentWidth) / 2 - CountingCommonConstants.SINGLE_COUNTING_OBJECT_BOUNDS.minX;
    const yMargin = CountingCommonConstants.COUNTING_AREA_MARGIN;
    const spots = [];
    for (let i = 0; i < numberOfRows; i++) {
      for (let j = 0; j < NUMBER_OF_ORGANIZE_ROWS; j++) {
        spots.push(new Vector2(this.boundsProperty.value.minX + xMargin + (countingObjectWidth + ORGANIZED_COUNTING_OBJECT_MARGIN) * j, this.boundsProperty.value.minY + yMargin + (countingObjectHeight + ORGANIZED_COUNTING_OBJECT_MARGIN) * i));
      }
    }
    return spots;
  }

  /**
   * Returns all countingObjects not included in the sum of this countingArea.
   */
  getCountingObjectsIncludedInSum() {
    return [...this.countingObjects].filter(countingObject => countingObject.includeInSumProperty.value);
  }

  /**
   * Organizes the countingObjects in a grid pattern, but first breaks all down into singles.
   */
  organizeObjects() {
    assert && assert(this.organizedObjectSpots, 'this.organizedObjectSpots must exist to call this function');
    this.breakApartCountingObjects();

    // Copy the current countingObjects in the countingArea so we can mutate them.
    let countingObjectsToOrganize = this.getCountingObjectsIncludedInSum();
    const numberOfObjectsToOrganize = countingObjectsToOrganize.length;
    for (let i = 0; i < numberOfObjectsToOrganize; i++) {
      const spot = this.organizedObjectSpots[i];

      // Sort the countingObjects by closest to the destination.
      countingObjectsToOrganize = _.sortBy(countingObjectsToOrganize, countingObject => {
        return countingObject.positionProperty.value.distance(spot);
      });
      const countingObjectToOrganize = countingObjectsToOrganize.shift();
      countingObjectToOrganize.setDestination(spot, true, {
        targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE
      });
    }
    assert && assert(countingObjectsToOrganize.length === 0, 'should have handled all countingObjects');
  }

  /**
   * @param countingObjectSerializations
   * @param linkStatusChangedEmitter
   * @param areObjectsLinkedToOnes - if we want to link the countingAreas, or unlink them.
   * @param groupAndLinkType
   */
  matchCountingObjectsToLinkedCountingArea(countingObjectSerializations, linkStatusChangedEmitter, areObjectsLinkedToOnes, groupAndLinkType) {
    if (areObjectsLinkedToOnes) {
      this.linkToSerializedCountingObjects(countingObjectSerializations, linkStatusChangedEmitter, areObjectsLinkedToOnes);
    } else {
      // If not linking, it is without animation. This part is really simple. Just clear out all the counting objects in
      // the objectsCountingArea, and add new ones that match the serialization from the onesCountingArea (position and numberValue
      // matching).

      const objectsToOrganize = this.getCountingObjectsIncludedInSum();
      objectsToOrganize.forEach(countingObject => this.removeCountingObject(countingObject));
      _.sortBy(countingObjectSerializations, 'zIndex').forEach(serialization => {
        const newCountingObject = new CountingObject(serialization.numberValue, serialization.position, {
          groupingEnabledProperty: this.groupingEnabledProperty
        });
        this.addCountingObject(newCountingObject);
      });

      // If the groupAndLinkType was set to ungrouped, break apart the counting objects. This is needed to avoid an order
      // dependency problem when switching to an ungrouped state where the existing countingObjects are broken apart before
      // we clear them out and re-add them above.
      groupAndLinkType === GroupAndLinkType.UNGROUPED && this.breakApartCountingObjects(true);

      // Since there is no animation, fire this immediately
      linkStatusChangedEmitter.emit(areObjectsLinkedToOnes);
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
  linkToSerializedCountingObjects(targetCountingObjectSerializations, linkStatusChangedEmitter, areObjectsLinkedToOnes) {
    const objectsToOrganize = this.getCountingObjectsIncludedInSum();

    // Starting length, but could increase if Counting Objects are broken apart
    let numberOfObjectsToOrganize = objectsToOrganize.length;
    const numberOfAnimationsFinishedProperty = new NumberProperty(0);

    // Sort by highest value first. Before we use these to move or breakup our countingObjects so they match the
    // serializations, we will remove any serializations that already match existing countingObjects below.
    const inputSerializationsSortedByValue = _.sortBy(targetCountingObjectSerializations, countingObjectSerialization => countingObjectSerialization.numberValue).reverse();

    // Only animate if we are linking to the onesCountingArea
    const animate = areObjectsLinkedToOnes;
    const countingObjectsSortedByValue = this.getCountingObjectsByValue();

    // Iterate through each input and try to mutate the current countingObjects list to support that target
    for (let j = inputSerializationsSortedByValue.length - 1; j >= 0; j--) {
      const targetSerialization = inputSerializationsSortedByValue[j];
      const targetValue = targetSerialization.numberValue;

      // First see if there are any exact position/value matches, and keep those where they are.
      // Use a forEach because we may mutate the list inline.
      for (let i = 0; i < countingObjectsSortedByValue.length; i++) {
        const currentCountingObject = countingObjectsSortedByValue[i];

        // If there is a match with the same value and position, then we don't need to call sendTo because this
        // countingObject is already in the correct spot.
        if (currentCountingObject.numberValueProperty.value === targetValue && currentCountingObject.positionProperty.value.equals(targetSerialization.position)) {
          arrayRemove(countingObjectsSortedByValue, currentCountingObject);
          arrayRemove(inputSerializationsSortedByValue, targetSerialization);
          numberOfAnimationsFinishedProperty.value += 1;
          break;
        }
      }
    }
    for (let i = 0; i < inputSerializationsSortedByValue.length; i++) {
      assert && assert(countingObjectsSortedByValue.length > 0, 'still have serializations, but no CountingObjects left');
      const targetSerialization = inputSerializationsSortedByValue[i];
      const desiredValue = targetSerialization.numberValue;
      let currentNumberValueCount = 0;
      let targetHandled = false;

      // Then, move or split the remaining countingObjects to match the serializations.
      while (!targetHandled) {
        const currentCountingObject = countingObjectsSortedByValue[0];
        assert && assert(this.countingObjects.includes(currentCountingObject), 'old, removed countingObject still at play here');
        const nextNeededValue = desiredValue - currentNumberValueCount;

        // If the currentCountingObject has a matching or smaller value than the target serialization, send it to the
        // location of the target.
        if (currentCountingObject.numberValueProperty.value <= nextNeededValue) {
          this.sendCountingObjectTo(currentCountingObject, targetSerialization.position, numberOfAnimationsFinishedProperty, animate);
          arrayRemove(countingObjectsSortedByValue, currentCountingObject);
          currentNumberValueCount += currentCountingObject.numberValueProperty.value;

          // We are done when we've reached the desired value.
          targetHandled = currentNumberValueCount === desiredValue;
        } else if (currentCountingObject.numberValueProperty.value > nextNeededValue) {
          // If the currentCountingObject has a greater value than the target, split it up and then try this loop again.

          // split off the value we need to be used in the next iteration
          const newCountingObject = this.splitCountingObject(currentCountingObject, nextNeededValue);
          numberOfObjectsToOrganize += 1;
          countingObjectsSortedByValue.push(newCountingObject);
        }
      }
    }

    // Wait to proceed until all animations have completed
    numberOfAnimationsFinishedProperty.link(function numberOfAnimationsFinishedListener(numberOfAnimationsFinished) {
      if (numberOfAnimationsFinished === numberOfObjectsToOrganize) {
        linkStatusChangedEmitter.emit(areObjectsLinkedToOnes);
        numberOfAnimationsFinishedProperty.unlink(numberOfAnimationsFinishedListener);
      }
    });
  }

  /**
   * Only meant to be used for "mass exodus" where we want to keep track of when all are finished animated to destination
   */
  sendCountingObjectTo(countingObject, position, numberOfAnimationsFinishedProperty, animate) {
    countingObject.setDestination(position, animate, {
      targetScale: NumberSuiteCommonConstants.COUNTING_OBJECT_SCALE,
      useStandardAnimationSpeed: false
    });
    countingObject.endAnimationEmitter.addListener(function toRemove() {
      numberOfAnimationsFinishedProperty.value += 1;
      countingObject.endAnimationEmitter.removeListener(toRemove);
    });
  }

  /**
   * Returns a list with the largest value counting objects first (only included in sum).
   */
  getCountingObjectsByValue() {
    return _.sortBy(this.getCountingObjectsIncludedInSum(), countingObject => countingObject.numberValueProperty.value).reverse();
  }

  /**
   * Splits the provided countingObject into two countingObjects. This is a function for the model to use for automated
   * actions, and does not relate to the USER splitting a countingObject when grabbing the handle of countingObject.
   */
  splitCountingObject(countingObject, valueToSplit) {
    assert && assert(countingObject.includeInSumProperty.value, 'attempted to split countingObject that has already been removed from the total');
    const startingCount = _.sum(this.getCountingObjectsIncludedInSum().map(x => x.numberValueProperty.value));
    const totalValue = countingObject.numberValueProperty.value;
    assert && assert(valueToSplit < totalValue, `desired split value (${valueToSplit}) is the same or greater than the countingObject to split's value (${totalValue})`);
    const newCountingObject = new CountingObject(valueToSplit, countingObject.positionProperty.value, {
      groupingEnabledProperty: this.groupingEnabledProperty
    });
    this.addCountingObject(newCountingObject);
    countingObject.changeNumber(totalValue - valueToSplit);
    const endingCount = _.sum(this.getCountingObjectsIncludedInSum().map(x => x.numberValueProperty.value));
    assert && assert(startingCount === endingCount, 'total doesn\'t match after splitting counting object');
    return newCountingObject;
  }

  /**
   * Breaks apart all counting objects into counting objects with a value of 1. By default, it creates all new counting
   * objects in the position of the original counting object. If stack=true, it arranges them according to the
   * background shape of the original counting object. Any newly created countingObjects are added in front of the
   * existing countingObjects (z-index).
   */
  breakApartCountingObjects(stack = false) {
    const objectsToBreakDown = this.getCountingObjectsIncludedInSum();
    const startingCount = _.sum(objectsToBreakDown.map(x => x.numberValueProperty.value));
    objectsToBreakDown.forEach(countingObject => {
      if (countingObject.numberValueProperty.value > 1) {
        const countingObjectPosition = countingObject.positionProperty.value;
        const countingObjectValue = countingObject.numberValueProperty.value;
        const numberOfSets = countingObjectValue < NumberSuiteCommonConstants.TEN ? 1 : 2;
        const numberOfRows = NumberSuiteCommonConstants.TEN;
        const offsetYSegment = stack ? CountingCommonConstants.BREAK_APART_Y_OFFSET : 0;

        // The movable bounds with respect to positionProperty and to how much space our countingObject bounds takes up.
        const adjustedOriginBounds = countingObject.getOriginBounds(this.boundsProperty.value);

        // Each extra single that needs to be stacked will take up extra space, so use that in the calculation of if we
        // stack up or down. Will be 0 if not stacking.
        const neededSpace = offsetYSegment * (Math.min(countingObject.numberValueProperty.value, NumberSuiteCommonConstants.TEN) - 1);

        // If there isn't enough space below the current countingObject for a visual stack, place the stack above the
        // countingObject instead.
        const shouldStackUpwards = adjustedOriginBounds.maxY <= countingObjectPosition.y + neededSpace;

        // position of the first new CountingObject, respecting that if stacking upwards, we still create from the top
        // down.
        const origin = shouldStackUpwards ? countingObjectPosition.plusXY(0, -neededSpace) : countingObjectPosition;
        let currentOffsetY = 0;
        let reAddedCountingObjects = 0;
        const xShift = countingObjectValue >= NumberSuiteCommonConstants.TEN && stack ? -CountingCommonConstants.COUNTING_OBJECT_SIZE.width : 0;

        // We are about to add a bunch of ones to equal this countingObject's value
        this.removeCountingObject(countingObject);

        // Nested looping to account for 10s place and 1s place stacks
        for (let i = numberOfSets - 1; i >= 0; i--) {
          for (let j = 0; j < numberOfRows; j++) {
            if (reAddedCountingObjects < countingObjectValue) {
              const newCountingObject = new CountingObject(1, origin.plusXY(i * xShift, currentOffsetY), {
                groupingEnabledProperty: this.groupingEnabledProperty
              });
              this.addCountingObject(newCountingObject);
              currentOffsetY += offsetYSegment;
              reAddedCountingObjects++;
            }
          }
          currentOffsetY = 0;
        }
      }
    });

    // total the value of all counting objects after they have been broken up and re-created
    const newCount = _.sum(this.getCountingObjectsIncludedInSum().map(x => x.numberValueProperty.value));
    assert && assert(startingCount === newCount, 'The value of all counting objects does not match their original value after breaking them apart');
  }
}
numberSuiteCommon.register('CountingArea', CountingArea);
export default CountingArea;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb3VudGluZ0NvbW1vbkNvbnN0YW50cyIsIkNvdW50aW5nQ29tbW9uTW9kZWwiLCJDb3VudGluZ09iamVjdCIsIkJvdW5kczIiLCJkb3RSYW5kb20iLCJWZWN0b3IyIiwibnVtYmVyU3VpdGVDb21tb24iLCJOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyIsIm9wdGlvbml6ZSIsIlByb3BlcnR5IiwiTnVtYmVyUHJvcGVydHkiLCJHcm91cEFuZExpbmtUeXBlIiwiYXJyYXlSZW1vdmUiLCJHUk9VUF9ESVZJU09SUyIsIk9SR0FOSVpFRF9DT1VOVElOR19PQkpFQ1RfTUFSR0lOIiwiTlVNQkVSX09GX09SR0FOSVpFX1JPV1MiLCJNSU5fRElTVEFOQ0VfQkVUV0VFTl9BRERFRF9DT1VOVElOR19PQkpFQ1RTIiwiQ291bnRpbmdBcmVhIiwiY29uc3RydWN0b3IiLCJoaWdoZXN0Q291bnQiLCJncm91cGluZ0VuYWJsZWRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0ZW5GcmFtZXMiLCJnZXRDb3VudGluZ09iamVjdE9yaWdpbiIsIlpFUk8iLCJjb3VudGluZ09iamVjdENyZWF0b3JOb2RlSGVpZ2h0IiwiYm91bmRzUHJvcGVydHkiLCJvcmdhbml6ZWRPYmplY3RTcG90cyIsImluaXRpYWxpemVkIiwiY291bnRpbmdPYmplY3RzIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsImNvdW50aW5nT2JqZWN0IiwiZGlzcG9zZSIsImluaXRpYWxpemUiLCJhc3NlcnQiLCJjYWxjdWxhdGVPcmdhbml6ZWRPYmplY3RTcG90cyIsImNyZWF0ZUFsbE9iamVjdHMiLCJjdXJyZW50TnVtYmVyIiwic2V0QWxsT2JqZWN0c0FzR3JvdXBlZCIsInJlbW92ZUFsbENvdW50aW5nT2JqZWN0cyIsIm9iamVjdFNob3VsZEFuaW1hdGUiLCJkaXZpc29yIiwic2FtcGxlIiwibnVtYmVyT2ZDYXJkcyIsIk1hdGgiLCJmbG9vciIsInJlbWFpbmRlckNhcmRWYWx1ZSIsIl8iLCJ0aW1lcyIsImNyZWF0ZUNvdW50aW5nT2JqZWN0RnJvbUNyZWF0b3JOb2RlIiwic2hvdWxkQW5pbWF0ZSIsInZhbHVlIiwicmVtYWluZGVyIiwiY2FsY3VsYXRlVG90YWwiLCJQQVBFUl9OVU1CRVJfSU5JVElBTF9WQUxVRSIsImRlc3RpbmF0aW9uUG9zaXRpb24iLCJmaW5kQ291bnQiLCJvcmlnaW4iLCJtaW51cyIsImxvY2FsQm91bmRzIiwiY2VudGVyIiwic2NhbGUiLCJHUk9VUEVEX1NUT1JFRF9DT1VOVElOR19PQkpFQ1RfU0NBTEUiLCJVTkdST1VQRURfU1RPUkVEX0NPVU5USU5HX09CSkVDVF9TQ0FMRSIsInNldERlc3RpbmF0aW9uIiwidGFyZ2V0U2NhbGUiLCJhZGRDb3VudGluZ09iamVjdCIsImNvdW50aW5nQXJlYUJvdW5kcyIsIndpdGhNYXhZIiwibWF4WSIsIkNPVU5USU5HX0FSRUFfTUFSR0lOIiwiY291bnRpbmdPYmplY3RPcmlnaW5Cb3VuZHMiLCJnZXRPcmlnaW5Cb3VuZHMiLCJwb3NzaWJsZURlc3RpbmF0aW9uUG9pbnQiLCJuZXh0UG9pbnRJbkJvdW5kcyIsInJhbmRvbVNwb3RJc0F2YWlsYWJsZSIsImNvdW50aW5nT2JqZWN0c1RvQ2hlY2siLCJnZXRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtIiwiaSIsImxlbmd0aCIsInBvc2l0aW9uIiwiZGVzdGluYXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwiZGlzdGFuY2UiLCJDT1VOVElOR19PQkpFQ1RfU0NBTEUiLCJyZXR1cm5Db3VudGluZ09iamVjdFRvQ3JlYXRvck5vZGUiLCJ2YWx1ZVRvUmV0dXJuIiwic29ydGVkQ291bnRpbmdPYmplY3RzIiwic29ydEJ5IiwiY291bnRpbmdPYmplY3RDb250YWluZWRCeVRlbkZyYW1lIiwicmVjdXJzaXZlbHlGaW5kQmVzdE1hdGNoZXMiLCJiZXN0TWF0Y2hlcyIsIm51bWJlclZhbHVlUHJvcGVydHkiLCJsYXJnZXN0Q291bnRpbmdPYmplY3QiLCJtYXhCeSIsIngiLCJuZXh0VmFsdWVUb1JldHVybiIsInJlbW92ZSIsInNwbGl0Q291bnRpbmdPYmplY3QiLCJjb3VudGluZ09iamVjdHNUb1JldHVybiIsImZvckVhY2giLCJjb3VudGluZ09iamVjdFRvUmV0dXJuIiwidGVuRnJhbWUiLCJnZXRDb250YWluaW5nVGVuRnJhbWUiLCJyZW1vdmVDb3VudGluZ09iamVjdCIsInNlbmRDb3VudGluZ09iamVjdFRvQ3JlYXRvck5vZGUiLCJsZW5ndGhQcm9wZXJ0eSIsImluY2x1ZGVJblN1bVByb3BlcnR5IiwiZm91bmRJblRlbkZyYW1lIiwiaW5jbHVkZXMiLCJjb250YWluaW5nVGVuRnJhbWUiLCJjb3VudGluZ09iamVjdFdpZHRoIiwiU0lOR0xFX0NPVU5USU5HX09CSkVDVF9CT1VORFMiLCJ3aWR0aCIsImNvdW50aW5nT2JqZWN0SGVpZ2h0IiwiaGVpZ2h0IiwibnVtYmVyT2ZSb3dzIiwic3VtUHJvcGVydHkiLCJyYW5nZSIsIm1heCIsImNvbnRlbnRXaWR0aCIsInhNYXJnaW4iLCJtaW5YIiwieU1hcmdpbiIsInNwb3RzIiwiaiIsInB1c2giLCJtaW5ZIiwiZmlsdGVyIiwib3JnYW5pemVPYmplY3RzIiwiYnJlYWtBcGFydENvdW50aW5nT2JqZWN0cyIsImNvdW50aW5nT2JqZWN0c1RvT3JnYW5pemUiLCJudW1iZXJPZk9iamVjdHNUb09yZ2FuaXplIiwic3BvdCIsImNvdW50aW5nT2JqZWN0VG9Pcmdhbml6ZSIsInNoaWZ0IiwibWF0Y2hDb3VudGluZ09iamVjdHNUb0xpbmtlZENvdW50aW5nQXJlYSIsImNvdW50aW5nT2JqZWN0U2VyaWFsaXphdGlvbnMiLCJsaW5rU3RhdHVzQ2hhbmdlZEVtaXR0ZXIiLCJhcmVPYmplY3RzTGlua2VkVG9PbmVzIiwiZ3JvdXBBbmRMaW5rVHlwZSIsImxpbmtUb1NlcmlhbGl6ZWRDb3VudGluZ09iamVjdHMiLCJvYmplY3RzVG9Pcmdhbml6ZSIsInNlcmlhbGl6YXRpb24iLCJuZXdDb3VudGluZ09iamVjdCIsIm51bWJlclZhbHVlIiwiVU5HUk9VUEVEIiwiZW1pdCIsInRhcmdldENvdW50aW5nT2JqZWN0U2VyaWFsaXphdGlvbnMiLCJudW1iZXJPZkFuaW1hdGlvbnNGaW5pc2hlZFByb3BlcnR5IiwiaW5wdXRTZXJpYWxpemF0aW9uc1NvcnRlZEJ5VmFsdWUiLCJjb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb24iLCJyZXZlcnNlIiwiYW5pbWF0ZSIsImNvdW50aW5nT2JqZWN0c1NvcnRlZEJ5VmFsdWUiLCJnZXRDb3VudGluZ09iamVjdHNCeVZhbHVlIiwidGFyZ2V0U2VyaWFsaXphdGlvbiIsInRhcmdldFZhbHVlIiwiY3VycmVudENvdW50aW5nT2JqZWN0IiwiZXF1YWxzIiwiZGVzaXJlZFZhbHVlIiwiY3VycmVudE51bWJlclZhbHVlQ291bnQiLCJ0YXJnZXRIYW5kbGVkIiwibmV4dE5lZWRlZFZhbHVlIiwic2VuZENvdW50aW5nT2JqZWN0VG8iLCJsaW5rIiwibnVtYmVyT2ZBbmltYXRpb25zRmluaXNoZWRMaXN0ZW5lciIsIm51bWJlck9mQW5pbWF0aW9uc0ZpbmlzaGVkIiwidW5saW5rIiwidXNlU3RhbmRhcmRBbmltYXRpb25TcGVlZCIsImVuZEFuaW1hdGlvbkVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInRvUmVtb3ZlIiwicmVtb3ZlTGlzdGVuZXIiLCJ2YWx1ZVRvU3BsaXQiLCJzdGFydGluZ0NvdW50Iiwic3VtIiwibWFwIiwidG90YWxWYWx1ZSIsImNoYW5nZU51bWJlciIsImVuZGluZ0NvdW50Iiwic3RhY2siLCJvYmplY3RzVG9CcmVha0Rvd24iLCJjb3VudGluZ09iamVjdFBvc2l0aW9uIiwiY291bnRpbmdPYmplY3RWYWx1ZSIsIm51bWJlck9mU2V0cyIsIlRFTiIsIm9mZnNldFlTZWdtZW50IiwiQlJFQUtfQVBBUlRfWV9PRkZTRVQiLCJhZGp1c3RlZE9yaWdpbkJvdW5kcyIsIm5lZWRlZFNwYWNlIiwibWluIiwic2hvdWxkU3RhY2tVcHdhcmRzIiwieSIsInBsdXNYWSIsImN1cnJlbnRPZmZzZXRZIiwicmVBZGRlZENvdW50aW5nT2JqZWN0cyIsInhTaGlmdCIsIkNPVU5USU5HX09CSkVDVF9TSVpFIiwibmV3Q291bnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvdW50aW5nQXJlYS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgbWFuYWdpbmcgY291bnRpbmdPYmplY3RzIGFuZCB0ZW5GcmFtZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQ291bnRpbmdDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vY291bnRpbmctY29tbW9uL2pzL2NvbW1vbi9Db3VudGluZ0NvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb3VudGluZ0NvbW1vbk1vZGVsIGZyb20gJy4uLy4uLy4uLy4uL2NvdW50aW5nLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvQ291bnRpbmdDb21tb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBDb3VudGluZ09iamVjdCBmcm9tICcuLi8uLi8uLi8uLi9jb3VudGluZy1jb21tb24vanMvY29tbW9uL21vZGVsL0NvdW50aW5nT2JqZWN0LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBudW1iZXJTdWl0ZUNvbW1vbiBmcm9tICcuLi8uLi9udW1iZXJTdWl0ZUNvbW1vbi5qcyc7XHJcbmltcG9ydCBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyBmcm9tICcuLi9OdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVGVuRnJhbWUgZnJvbSAnLi4vLi4vbGFiL21vZGVsL1RlbkZyYW1lLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEdyb3VwQW5kTGlua1R5cGUgZnJvbSAnLi9Hcm91cEFuZExpbmtUeXBlLmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICB0ZW5GcmFtZXM/OiBudWxsIHwgT2JzZXJ2YWJsZUFycmF5PFRlbkZyYW1lPjtcclxufTtcclxuZXhwb3J0IHR5cGUgQ291bnRpbmdBcmVhT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBjcmVhdGVDb3VudGluZ09iamVjdEZyb21DcmVhdG9yTm9kZU9wdGlvbnMgPSB7XHJcbiAgc2hvdWxkQW5pbWF0ZT86IGJvb2xlYW47XHJcbiAgdmFsdWU/OiBudW1iZXI7XHJcbiAgcmVtYWluZGVyPzogYm9vbGVhbjtcclxufTtcclxuZXhwb3J0IHR5cGUgQ291bnRpbmdPYmplY3RTZXJpYWxpemF0aW9uID0ge1xyXG4gIHBvc2l0aW9uOiBWZWN0b3IyO1xyXG4gIG51bWJlclZhbHVlOiBudW1iZXI7XHJcbiAgekluZGV4OiBudW1iZXI7XHJcbn07XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgR1JPVVBfRElWSVNPUlMgPSBbIDIsIDUsIDEwIF07IC8vIHNwZWNpZmllZCBieSBkZXNpZ25lclxyXG5jb25zdCBPUkdBTklaRURfQ09VTlRJTkdfT0JKRUNUX01BUkdJTiA9IDM7XHJcbmNvbnN0IE5VTUJFUl9PRl9PUkdBTklaRV9ST1dTID0gNTsgLy8gdG8gbWF0Y2ggdGVuIGZyYW1lcywgd2hpY2ggYXJlIDV4MlxyXG5cclxuLy8gdGhlIG1pbmltdW0gZGlzdGFuY2UgdGhhdCBhIGNvdW50aW5nT2JqZWN0IGFkZGVkIHRvIHRoZSBjb3VudGluZ0FyZWEgdmlhIGFuaW1hdGlvbiBjYW4gYmUgdG8gYW5vdGhlciBjb3VudGluZ09iamVjdFxyXG4vLyBpbiB0aGUgY291bnRpbmdBcmVhLCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuY29uc3QgTUlOX0RJU1RBTkNFX0JFVFdFRU5fQURERURfQ09VTlRJTkdfT0JKRUNUUyA9IDYwO1xyXG5cclxuY2xhc3MgQ291bnRpbmdBcmVhIGV4dGVuZHMgQ291bnRpbmdDb21tb25Nb2RlbCB7XHJcbiAgcHJpdmF0ZSBnZXRDb3VudGluZ09iamVjdE9yaWdpbjogKCkgPT4gVmVjdG9yMjtcclxuXHJcbiAgcHJpdmF0ZSBib3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj47XHJcbiAgcHJpdmF0ZSBvcmdhbml6ZWRPYmplY3RTcG90czogVmVjdG9yMltdOyAvLyBQb3NpdGlvbnMgcG9pbnQgdG8gdGhlIHRvcCBhbmQgbGVmdCBvZiB0aGUgc3BvdCBpdCBzaG91bGQgdGFrZSB1cC5cclxuXHJcbiAgLy8gdHJ1ZSB3aGVuIHRoaXMuZ2V0Q291bnRpbmdPYmplY3RPcmlnaW4oKSBhbmQgdGhpcy5ib3VuZHNQcm9wZXJ0eSBoYXZlIGJlZW4gc2V0XHJcbiAgcHJpdmF0ZSBpbml0aWFsaXplZDogYm9vbGVhbjtcclxuICBwcml2YXRlIGNvdW50aW5nT2JqZWN0Q3JlYXRvck5vZGVIZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgLy8gY29udGFpbnMgYW55IHRlbiBmcmFtZXMgdGhhdCBhcmUgaW4gdGhlIGNvdW50aW5nQXJlYVxyXG4gIHB1YmxpYyByZWFkb25seSB0ZW5GcmFtZXM6IE9ic2VydmFibGVBcnJheTxUZW5GcmFtZT4gfCBudWxsO1xyXG4gIHB1YmxpYyByZWFkb25seSBncm91cGluZ0VuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaGlnaGVzdENvdW50OiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBncm91cGluZ0VuYWJsZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM/OiBDb3VudGluZ0FyZWFPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIGhpZ2hlc3RDb3VudCApO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q291bnRpbmdBcmVhT3B0aW9ucywgU2VsZk9wdGlvbnM+KCkoIHtcclxuICAgICAgdGVuRnJhbWVzOiBudWxsXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5ID0gZ3JvdXBpbmdFbmFibGVkUHJvcGVydHk7XHJcblxyXG4gICAgLy8gc2V0IGxhdGVyIGJ5IHRoZSB2aWV3XHJcbiAgICB0aGlzLmdldENvdW50aW5nT2JqZWN0T3JpZ2luID0gKCkgPT4gVmVjdG9yMi5aRVJPO1xyXG4gICAgdGhpcy5jb3VudGluZ09iamVjdENyZWF0b3JOb2RlSGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuYm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBCb3VuZHMyKCAwLCAwLCAwLCAwICkgKTtcclxuICAgIHRoaXMub3JnYW5pemVkT2JqZWN0U3BvdHMgPSBbIFZlY3RvcjIuWkVSTyBdO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnRlbkZyYW1lcyA9IG9wdGlvbnMudGVuRnJhbWVzO1xyXG5cclxuICAgIHRoaXMuY291bnRpbmdPYmplY3RzLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGNvdW50aW5nT2JqZWN0ID0+IHsgY291bnRpbmdPYmplY3QuZGlzcG9zZSgpOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXR1cCB0aGUgb3JpZ2luIGFuZCBib3VuZHMgbmVlZGVkIGZyb20gdGhlIHZpZXdcclxuICAgKi9cclxuICBwdWJsaWMgaW5pdGlhbGl6ZSggZ2V0Q291bnRpbmdPYmplY3RPcmlnaW46ICgpID0+IFZlY3RvcjIsIGNvdW50aW5nT2JqZWN0Q3JlYXRvck5vZGVIZWlnaHQ6IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgYm91bmRzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PEJvdW5kczI+ICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuaW5pdGlhbGl6ZWQsICdDb3VudGluZ0FyZWEgYWxyZWFkeSBpbml0aWFsaXplZCcgKTtcclxuXHJcbiAgICAvLyB1c2UgYSBmdW5jdGlvbiBmb3IgZ2V0dGluZyB0aGUgcGFwZXIgbnVtYmVyIG9yaWdpbiBiZWNhdXNlIGl0cyBwb3NpdGlvbiBjaGFuZ2VzIGluIHRoZSB2aWV3XHJcbiAgICB0aGlzLmdldENvdW50aW5nT2JqZWN0T3JpZ2luID0gZ2V0Q291bnRpbmdPYmplY3RPcmlnaW47XHJcbiAgICB0aGlzLmNvdW50aW5nT2JqZWN0Q3JlYXRvck5vZGVIZWlnaHQgPSBjb3VudGluZ09iamVjdENyZWF0b3JOb2RlSGVpZ2h0O1xyXG4gICAgdGhpcy5ib3VuZHNQcm9wZXJ0eSA9IGJvdW5kc1Byb3BlcnR5O1xyXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5vcmdhbml6ZWRPYmplY3RTcG90cyA9IHRoaXMuY2FsY3VsYXRlT3JnYW5pemVkT2JqZWN0U3BvdHMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbmQgcmFuZG9tbHkgcG9zaXRpb24gYSBncm91cCBvZiBvYmplY3RzIHdob3NlIHN1bSBpcyB0aGUgY3VycmVudCBudW1iZXIuXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZUFsbE9iamVjdHMoIGN1cnJlbnROdW1iZXI6IG51bWJlciwgc2V0QWxsT2JqZWN0c0FzR3JvdXBlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHRoaXMucmVtb3ZlQWxsQ291bnRpbmdPYmplY3RzKCk7XHJcbiAgICBjb25zdCBvYmplY3RTaG91bGRBbmltYXRlID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCBzZXRBbGxPYmplY3RzQXNHcm91cGVkICkge1xyXG4gICAgICBjb25zdCBkaXZpc29yID0gZG90UmFuZG9tLnNhbXBsZSggR1JPVVBfRElWSVNPUlMgKTtcclxuICAgICAgY29uc3QgbnVtYmVyT2ZDYXJkcyA9IE1hdGguZmxvb3IoIGN1cnJlbnROdW1iZXIgLyBkaXZpc29yICk7XHJcbiAgICAgIGNvbnN0IHJlbWFpbmRlckNhcmRWYWx1ZSA9IGN1cnJlbnROdW1iZXIgJSBkaXZpc29yO1xyXG5cclxuICAgICAgXy50aW1lcyggbnVtYmVyT2ZDYXJkcywgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY3JlYXRlQ291bnRpbmdPYmplY3RGcm9tQ3JlYXRvck5vZGUoIHtcclxuICAgICAgICAgIHNob3VsZEFuaW1hdGU6IG9iamVjdFNob3VsZEFuaW1hdGUsXHJcbiAgICAgICAgICB2YWx1ZTogZGl2aXNvclxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgaWYgKCByZW1haW5kZXJDYXJkVmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVDb3VudGluZ09iamVjdEZyb21DcmVhdG9yTm9kZSgge1xyXG4gICAgICAgICAgc2hvdWxkQW5pbWF0ZTogb2JqZWN0U2hvdWxkQW5pbWF0ZSxcclxuICAgICAgICAgIHZhbHVlOiByZW1haW5kZXJDYXJkVmFsdWUsXHJcbiAgICAgICAgICByZW1haW5kZXI6IHRydWVcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBfLnRpbWVzKCBjdXJyZW50TnVtYmVyLCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVDb3VudGluZ09iamVjdEZyb21DcmVhdG9yTm9kZSgge1xyXG4gICAgICAgICAgc2hvdWxkQW5pbWF0ZTogb2JqZWN0U2hvdWxkQW5pbWF0ZVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2FsY3VsYXRlVG90YWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBjb3VudGluZ09iamVjdCBhbmQgYW5pbWF0ZXMgaXQgdG8gYSByYW5kb20gb3BlbiBwbGFjZSBpbiB0aGUgY291bnRpbmdBcmVhLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVDb3VudGluZ09iamVjdEZyb21DcmVhdG9yTm9kZSggcHJvdmlkZWRPcHRpb25zPzogY3JlYXRlQ291bnRpbmdPYmplY3RGcm9tQ3JlYXRvck5vZGVPcHRpb25zICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pbml0aWFsaXplZCwgJ2NyZWF0ZUNvdW50aW5nT2JqZWN0RnJvbUNyZWF0b3JOb2RlIGNhbGxlZCBiZWZvcmUgaW5pdGlhbGl6YXRpb24nICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxjcmVhdGVDb3VudGluZ09iamVjdEZyb21DcmVhdG9yTm9kZU9wdGlvbnM+KCkoIHtcclxuICAgICAgc2hvdWxkQW5pbWF0ZTogdHJ1ZSxcclxuICAgICAgdmFsdWU6IE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLlBBUEVSX05VTUJFUl9JTklUSUFMX1ZBTFVFLFxyXG4gICAgICByZW1haW5kZXI6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBsZXQgZGVzdGluYXRpb25Qb3NpdGlvbjtcclxuICAgIGxldCBmaW5kQ291bnQgPSAwO1xyXG5cclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0ID0gbmV3IENvdW50aW5nT2JqZWN0KCBvcHRpb25zLnZhbHVlLCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgZ3JvdXBpbmdFbmFibGVkUHJvcGVydHk6IHRoaXMuZ3JvdXBpbmdFbmFibGVkUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG9yaWdpbiA9IHRoaXMuZ2V0Q291bnRpbmdPYmplY3RPcmlnaW4oKS5taW51cyggY291bnRpbmdPYmplY3QubG9jYWxCb3VuZHMuY2VudGVyICk7XHJcbiAgICBjb25zdCBzY2FsZSA9IGNvdW50aW5nT2JqZWN0Lmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5LnZhbHVlID8gTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuR1JPVVBFRF9TVE9SRURfQ09VTlRJTkdfT0JKRUNUX1NDQUxFIDpcclxuICAgICAgICAgICAgICAgICAgTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuVU5HUk9VUEVEX1NUT1JFRF9DT1VOVElOR19PQkpFQ1RfU0NBTEU7XHJcbiAgICBjb3VudGluZ09iamVjdC5zZXREZXN0aW5hdGlvbiggb3JpZ2luLCBmYWxzZSwge1xyXG4gICAgICB0YXJnZXRTY2FsZTogc2NhbGVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG5ldyBjb3VudGluZ09iamVjdCBCRUZPUkUgY2FsY3VsYXRpbmcgdGhlIGNvdW50aW5nT2JqZWN0T3JpZ2luQm91bmRzIHNvIHRoZSBib3VuZHMgb2YgdGhlIGNvdW50aW5nT2JqZWN0XHJcbiAgICAvLyBtYXRjaCB0aGUgdmlldyBzdGF0ZSBvZiB3aGV0aGVyIGdyb3VwaW5nIGlzIGVuYWJsZWQgb3Igbm90LCB3aGljaCBjaGFuZ2VzIHRoZSBjb3VudGluZ09iamVjdCdzIGJvdW5kcy5cclxuICAgIHRoaXMuYWRkQ291bnRpbmdPYmplY3QoIGNvdW50aW5nT2JqZWN0ICk7XHJcblxyXG4gICAgLy8gVGhlIGJvdW5kcyBvZiB0aGUgY291bnRpbmdBcmVhLCBhZGp1c3RlZCBzbyByZW1vdmUgc3BhY2Ugd2hlcmUgY3JlYXRlZCBjb3VudGluZ09PYmplY3Qgc2hvdWxkIG5vdCBnby4gTk9URTogVGhlXHJcbiAgICAvLyBjYWxjdWxhdGlvbiBiZWxvdyBhc3N1bWVzIHRoYXQgdGhlIGNvdW50aW5nT2JqZWN0Q3JlYXRvck5vZGUgaXMgcG9zaXRpb25lZCBhbG9uZyB0aGUgYm90dG9tIG9mIHRoZVxyXG4gICAgLy8gY291bnRpbmdBcmVhIGJvdW5kcywgc2VlIHBvc2l0aW9uaW5nIGluIENvdW50aW5nQXJlYU5vZGUuXHJcbiAgICBjb25zdCBjb3VudGluZ0FyZWFCb3VuZHMgPSB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlLndpdGhNYXhZKFxyXG4gICAgICB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlLm1heFkgLSB0aGlzLmNvdW50aW5nT2JqZWN0Q3JlYXRvck5vZGVIZWlnaHQgLSBDb3VudGluZ0NvbW1vbkNvbnN0YW50cy5DT1VOVElOR19BUkVBX01BUkdJTiApO1xyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3RPcmlnaW5Cb3VuZHMgPSBjb3VudGluZ09iamVjdC5nZXRPcmlnaW5Cb3VuZHMoIGNvdW50aW5nQXJlYUJvdW5kcyApO1xyXG5cclxuICAgIC8vIExvb2tzIGZvciBwb3NpdGlvbnMgdGhhdCBhcmUgbm90IG92ZXJsYXBwaW5nIHdpdGggb3RoZXIgY291bnRpbmdPYmplY3RzIGluIHRoZSBjb3VudGluZ0FyZWFcclxuICAgIHdoaWxlICggIWRlc3RpbmF0aW9uUG9zaXRpb24gKSB7XHJcbiAgICAgIGNvbnN0IHBvc3NpYmxlRGVzdGluYXRpb25Qb2ludCA9IGRvdFJhbmRvbS5uZXh0UG9pbnRJbkJvdW5kcyggY291bnRpbmdPYmplY3RPcmlnaW5Cb3VuZHMgKTtcclxuXHJcbiAgICAgIC8vIEluaXRpYWxpemVkIHRvIG5vIGF2YWlsYWJsZSB1bnRpbCB3ZSBjaGVjayBhZ2FpbnN0IGV2ZXJ5IG90aGVyIGNvdW50aW5nT2JqZWN0LlxyXG4gICAgICBsZXQgcmFuZG9tU3BvdElzQXZhaWxhYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgY291bnRpbmdPYmplY3RzIHRoYXQgYXJlIG9uIHRoZWlyIHdheSBiYWNrIHRvIHRoZWlyIGNyZWF0b3IuXHJcbiAgICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0c1RvQ2hlY2sgPSB0aGlzLmdldENvdW50aW5nT2JqZWN0c0luY2x1ZGVkSW5TdW0oKTtcclxuXHJcbiAgICAgIC8vIENvbXBhcmUgdGhlIHByb3Bvc2VkIGRlc3RpbmF0aW9uIHRvIHRoZSBwb3NpdGlvbiBvZiBldmVyeSBjb3VudGluZ09iamVjdCBpbiB0aGUgY291bnRpbmdBcmVhLiB1c2UgYy1zdHlsZSBsb29wIGZvclxyXG4gICAgICAvLyBiZXN0IHBlcmZvcm1hbmNlLCBzaW5jZSB0aGlzIGxvb3AgaXMgbmVzdGVkXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvdW50aW5nT2JqZWN0c1RvQ2hlY2subGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgY291bnRpbmdPYmplY3QgPSBjb3VudGluZ09iamVjdHNUb0NoZWNrWyBpIF07XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBjb3VudGluZ09iamVjdC5kZXN0aW5hdGlvbiB8fCBjb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAoIHBvc2l0aW9uLmRpc3RhbmNlKCBwb3NzaWJsZURlc3RpbmF0aW9uUG9pbnQgKSA8IE1JTl9ESVNUQU5DRV9CRVRXRUVOX0FEREVEX0NPVU5USU5HX09CSkVDVFMgKSB7XHJcbiAgICAgICAgICByYW5kb21TcG90SXNBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEJhaWwgaWYgdGFraW5nIGEgd2hpbGUgdG8gZmluZCBhIHNwb3QuIDEwMDAgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCBieSBwcmludGluZyB0aGUgbnVtYmVyIG9mIGF0dGVtcHRzIHdoZW4gMTlcclxuICAgICAgLy8gY291bnRpbmdPYmplY3RzIGFyZSBzcGFjZWQgcHJldHR5IGV2ZW5seSBpbiB0aGUgY291bnRpbmdBcmVhLlxyXG4gICAgICBpZiAoICsrZmluZENvdW50ID4gMTAwMCApIHtcclxuICAgICAgICByYW5kb21TcG90SXNBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGRlc3RpbmF0aW9uUG9zaXRpb24gPSByYW5kb21TcG90SXNBdmFpbGFibGUgPyBwb3NzaWJsZURlc3RpbmF0aW9uUG9pbnQgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvdW50aW5nT2JqZWN0LnNldERlc3RpbmF0aW9uKCBkZXN0aW5hdGlvblBvc2l0aW9uLCBvcHRpb25zLnNob3VsZEFuaW1hdGUsIHtcclxuICAgICAgdGFyZ2V0U2NhbGU6IE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLkNPVU5USU5HX09CSkVDVF9TQ0FMRVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2FsY3VsYXRlVG90YWwoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBiZXN0IG1hdGNoaW5nIGNvdW50aW5nT2JqZWN0IG9yIGNvdW50aW5nT2JqZWN0cyBhbmQgYW5pbWF0ZXMgdGhlbSBiYWNrIHRvIHRoZSBjcmVhdG9yTm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgcmV0dXJuQ291bnRpbmdPYmplY3RUb0NyZWF0b3JOb2RlKCB2YWx1ZVRvUmV0dXJuOiBudW1iZXIgPSBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5QQVBFUl9OVU1CRVJfSU5JVElBTF9WQUxVRSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ2V0Q291bnRpbmdPYmplY3RzSW5jbHVkZWRJblN1bSgpLmxlbmd0aCA+IDAsICdjb3VudGluZ09iamVjdHMgc2hvdWxkIGV4aXN0IGluIGNvdW50aW5nQXJlYScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaW5pdGlhbGl6ZWQsICdyZXR1cm5Db3VudGluZ09iamVjdFRvQ3JlYXRvck5vZGUgY2FsbGVkIGJlZm9yZSBpbml0aWFsaXphdGlvbicgKTtcclxuXHJcbiAgICAvLyBTb3J0IGJ5IG5vdCBpbiBhIHRlbiBmcmFtZSwgdGhlbiBieSBwcm94aW1pdHkgdG8gdGhlIGNyZWF0b3JOb2RlLlxyXG4gICAgY29uc3Qgc29ydGVkQ291bnRpbmdPYmplY3RzID0gXy5zb3J0QnkoIHRoaXMuZ2V0Q291bnRpbmdPYmplY3RzSW5jbHVkZWRJblN1bSgpLCBbXHJcbiAgICAgIGNvdW50aW5nT2JqZWN0ID0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb3VudGluZ09iamVjdENvbnRhaW5lZEJ5VGVuRnJhbWUoIGNvdW50aW5nT2JqZWN0ICkgPyAxIDogMDtcclxuICAgICAgfSxcclxuICAgICAgY291bnRpbmdPYmplY3QgPT4ge1xyXG4gICAgICAgIHJldHVybiBjb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCB0aGlzLmdldENvdW50aW5nT2JqZWN0T3JpZ2luKCkgKTtcclxuICAgICAgfVxyXG4gICAgXSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVjdXJzaXZlbHkgc2VhcmNoIGZvciB0aGUgYmVzdCBjb3VudGluZ09iamVjdHMgdG8gcmV0dXJuIHRvIHRoZSBjcmVhdG9yTm9kZSBmb3IgdGhlIGdpdmVuIHZhbHVlLiBUaGUgY3JpdGVyaWFcclxuICAgICAqIGZvciB0aGUgYmVzdCBtYXRjaGVzIGlzIGRlc2NyaWJlZCBiZWxvdyBpbiB0aGUgcGFydHMgb2YgdGhpcyBmdW5jdGlvbi5cclxuICAgICAqL1xyXG4gICAgY29uc3QgcmVjdXJzaXZlbHlGaW5kQmVzdE1hdGNoZXMgPSAoIHZhbHVlOiBudW1iZXIsIHNvcnRlZENvdW50aW5nT2JqZWN0czogQ291bnRpbmdPYmplY3RbXSApOiBDb3VudGluZ09iamVjdFtdID0+IHtcclxuXHJcbiAgICAgIGxldCBiZXN0TWF0Y2hlczogQ291bnRpbmdPYmplY3RbXSA9IFtdO1xyXG5cclxuICAgICAgLy8gT3VyIGJhc2UgY2FzZSBpcyB2YWx1ZSA9PT0gMCwgd2hlbiB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gemVybywgdGhlcmUgaXMgc3RpbGwgd29yayB0byBiZSBkb25lLlxyXG4gICAgICBpZiAoIHZhbHVlID4gMCApIHtcclxuXHJcbiAgICAgICAgLy8gRmlyc3QsIHNlZSBpZiB0aGVyZSBhcmUgYW55IGNvdW50aW5nT2JqZWN0cyB3aXRoIHRoZSBzYW1lIHZhbHVlLiBJZiBzbywgd2UgYXJlIGRvbmUuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc29ydGVkQ291bnRpbmdPYmplY3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgY291bnRpbmdPYmplY3QgPSBzb3J0ZWRDb3VudGluZ09iamVjdHNbIGkgXTtcclxuXHJcbiAgICAgICAgICAvLyBXZSB3YW50IHRvIGdyYWIgdGhlIGZpcnN0IGNvdW50aW5nT2JqZWN0IHRoYXQgbWF0Y2hlcyB0byBhbHNvIGdldCB0aGUgY2xvc2VzdC5cclxuICAgICAgICAgIGlmICggY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZSA9PT0gdmFsdWUgJiYgYmVzdE1hdGNoZXMubGVuZ3RoID09PSAwICkge1xyXG4gICAgICAgICAgICBiZXN0TWF0Y2hlcyA9IFsgY291bnRpbmdPYmplY3QgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBub25lIG9mIHRoZSBzYW1lIHZhbHVlLCBmaW5kIHRoZSBsYXJnZXN0IGNvdW50aW5nT2JqZWN0LlxyXG4gICAgICAgIGNvbnN0IGxhcmdlc3RDb3VudGluZ09iamVjdCA9IF8ubWF4QnkoIHNvcnRlZENvdW50aW5nT2JqZWN0cywgeCA9PiB4Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUgKSE7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSB3ZSdyZSBsb29raW5nIGZvciBpcyBsYXJnZXIgdGhhbiB0aGUgbGFyZ2VzdCBjb3VudGluZ09iamVjdCwgdGhlbiB3ZSdyZSBnb2luZyB0byBuZWVkIHRvIHNlbmRcclxuICAgICAgICAvLyBtb3JlIHRoYW4gb25lIGNvdW50aW5nT2JqZWN0IGJhY2sgdG8gdGhlIGNyZWF0b3JOb2RlLiBTbyBpbmNsdWRlIHRoZSBsYXJnZXN0LCBhbmQgdGhlbiBzdGFydCB0aGUgc2VhcmNoIG92ZXJcclxuICAgICAgICAvLyBmb3IgdGhlIG5leHQgYmVzdCBtYXRjaC5cclxuICAgICAgICBpZiAoIHZhbHVlID4gbGFyZ2VzdENvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBjb25zdCBuZXh0VmFsdWVUb1JldHVybiA9IHZhbHVlIC0gbGFyZ2VzdENvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBuZXh0VmFsdWVUb1JldHVybiA+PSAwLCAnVGhlIG5leHQgdmFsdWUgdG8gcmV0dXJuIGNhbm5vdCBiZSBsZXNzIHRoYW4gemVyby4gbmV4dFZhbHVlVG9SZXR1cm4gPSAnICsgbmV4dFZhbHVlVG9SZXR1cm4gKTtcclxuXHJcbiAgICAgICAgICAvLyBCZWZvcmUgc3RhcnRpbmcgdGhlIHNlYXJjaCBhZ2FpbiBmb3IgdGhlIG5leHQgY291bnRpbmdPYmplY3QsIHJlbW92ZSB0aGUgb25lIHdlIGtub3cgd2Ugd2FudCwgc28gaXQncyBub3RcclxuICAgICAgICAgIC8vIGEgcGFydCBvZiB0aGUgbmV4dCBzZWFyY2guXHJcbiAgICAgICAgICBfLnJlbW92ZSggc29ydGVkQ291bnRpbmdPYmplY3RzLCBsYXJnZXN0Q291bnRpbmdPYmplY3QgKTtcclxuXHJcbiAgICAgICAgICBiZXN0TWF0Y2hlcyA9IFsgbGFyZ2VzdENvdW50aW5nT2JqZWN0LCAuLi5yZWN1cnNpdmVseUZpbmRCZXN0TWF0Y2hlcyggbmV4dFZhbHVlVG9SZXR1cm4sIHNvcnRlZENvdW50aW5nT2JqZWN0cyApIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIElmIHRoZSB2YWx1ZSB3ZSdyZSBsb29raW5nIGZvciBpcyBzbWFsbGVyIHRoYW4gdGhlIGxhcmdlc3RDb3VudGluZ09iamVjdCwgY3JlYXRlIGEgbmV3IGNvdW50aW5nT2JqZWN0IGJ5XHJcbiAgICAgICAgLy8gYnJlYWtpbmcgb2ZmIHRoZSB2YWx1ZSB3ZSBuZWVkIGZyb20gdGhlIGxhcmdlc3Qgb25lLlxyXG4gICAgICAgIGVsc2UgaWYgKCB2YWx1ZSA8IGxhcmdlc3RDb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgYmVzdE1hdGNoZXMgPSBbIHRoaXMuc3BsaXRDb3VudGluZ09iamVjdCggbGFyZ2VzdENvdW50aW5nT2JqZWN0LCB2YWx1ZSApIF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gYmVzdE1hdGNoZXM7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0c1RvUmV0dXJuID0gcmVjdXJzaXZlbHlGaW5kQmVzdE1hdGNoZXMoIHZhbHVlVG9SZXR1cm4sIHNvcnRlZENvdW50aW5nT2JqZWN0cyApO1xyXG5cclxuICAgIC8vIFNlbmQgYWxsIG9mIG91ciBtYXRjaGVzIGJhY2sgdG8gdGhlIGNyZWF0b3Igbm9kZS5cclxuICAgIGNvdW50aW5nT2JqZWN0c1RvUmV0dXJuLmZvckVhY2goIGNvdW50aW5nT2JqZWN0VG9SZXR1cm4gPT4ge1xyXG4gICAgICBpZiAoIHRoaXMuY291bnRpbmdPYmplY3RDb250YWluZWRCeVRlbkZyYW1lKCBjb3VudGluZ09iamVjdFRvUmV0dXJuICkgKSB7XHJcbiAgICAgICAgY29uc3QgdGVuRnJhbWUgPSB0aGlzLmdldENvbnRhaW5pbmdUZW5GcmFtZSggY291bnRpbmdPYmplY3RUb1JldHVybiApO1xyXG4gICAgICAgIHRlbkZyYW1lLnJlbW92ZUNvdW50aW5nT2JqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zZW5kQ291bnRpbmdPYmplY3RUb0NyZWF0b3JOb2RlKCBjb3VudGluZ09iamVjdFRvUmV0dXJuICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGVzIHRoZSBnaXZlbiBjb3VudGluZ09iamVjdCBiYWNrIHRvIGl0cyBjcmVhdG9yIG5vZGUuXHJcbiAgICovXHJcbiAgcHVibGljIHNlbmRDb3VudGluZ09iamVjdFRvQ3JlYXRvck5vZGUoIGNvdW50aW5nT2JqZWN0OiBDb3VudGluZ09iamVjdCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY291bnRpbmdPYmplY3RzLmxlbmd0aFByb3BlcnR5LnZhbHVlID4gMCwgJ2NvdW50aW5nT2JqZWN0cyBzaG91bGQgZXhpc3QgaW4gY291bnRpbmdBcmVhJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pbml0aWFsaXplZCwgJ3JldHVybkNvdW50aW5nT2JqZWN0VG9DcmVhdG9yTm9kZSBjYWxsZWQgYmVmb3JlIGluaXRpYWxpemF0aW9uJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY291bnRpbmdPYmplY3QuaW5jbHVkZUluU3VtUHJvcGVydHkudmFsdWUsICdjb3VudGluZ09iamVjdCBhbHJlYWR5IHJlbW92ZWQgZnJvbSBzdW0nICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGl0IGZyb20gY291bnRpbmcgdG93YXJkcyB0aGUgc3VtIGFuZCBzZW5kIGl0IGJhY2sgdG8gaXRzIG9yaWdpbi4gY291bnRpbmdPYmplY3RzIGFyZW4ndCByZW1vdmVkIGZyb20gdGhlXHJcbiAgICAvLyBjb3VudGluZ0FyZWEgdW50aWwgdGhleSBnZXQgYmFjayB0byB0aGUgY3JlYXRvck5vZGUsIGJ1dCB3ZSBkb24ndCB3YW50IHRoZW0gdG8gY291bnQgdG93YXJkcyB0aGUgc3VtIHdoaWxlIHRoZXkncmUgb25cclxuICAgIC8vIHRoZWlyIHdheSB0byB0aGUgY3JlYXRvck5vZGUuXHJcbiAgICBpZiAoIGNvdW50aW5nT2JqZWN0LmluY2x1ZGVJblN1bVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICBjb3VudGluZ09iamVjdC5pbmNsdWRlSW5TdW1Qcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsKCk7XHJcblxyXG4gICAgICBjb25zdCBvcmlnaW4gPSB0aGlzLmdldENvdW50aW5nT2JqZWN0T3JpZ2luKCkubWludXMoIGNvdW50aW5nT2JqZWN0LmxvY2FsQm91bmRzLmNlbnRlciApO1xyXG4gICAgICBjb25zdCBzY2FsZSA9IGNvdW50aW5nT2JqZWN0Lmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5LnZhbHVlID8gTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuR1JPVVBFRF9TVE9SRURfQ09VTlRJTkdfT0JKRUNUX1NDQUxFIDpcclxuICAgICAgICAgICAgICAgICAgICBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5VTkdST1VQRURfU1RPUkVEX0NPVU5USU5HX09CSkVDVF9TQ0FMRTtcclxuXHJcbiAgICAgIGNvdW50aW5nT2JqZWN0LnNldERlc3RpbmF0aW9uKCBvcmlnaW4sIHRydWUsIHtcclxuICAgICAgICB0YXJnZXRTY2FsZTogc2NhbGVcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwcm92aWRlZCBjb3VudGluZ09iamVjdCBpcyBjb250YWluZWQgYnkgYSB0ZW5GcmFtZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgY291bnRpbmdPYmplY3RDb250YWluZWRCeVRlbkZyYW1lKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIHRoaXMudGVuRnJhbWVzICkge1xyXG4gICAgICBsZXQgZm91bmRJblRlbkZyYW1lID0gZmFsc2U7XHJcblxyXG4gICAgICB0aGlzLnRlbkZyYW1lcy5mb3JFYWNoKCB0ZW5GcmFtZSA9PiB7XHJcbiAgICAgICAgaWYgKCB0ZW5GcmFtZS5jb3VudGluZ09iamVjdHMuaW5jbHVkZXMoIGNvdW50aW5nT2JqZWN0ICkgKSB7XHJcbiAgICAgICAgICBmb3VuZEluVGVuRnJhbWUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICByZXR1cm4gZm91bmRJblRlbkZyYW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHRlbkZyYW1lIHRoYXQgdGhlIGNvdW50aW5nT2JqZWN0IGlzIGNvbnRhaW5lZCBieS4gU2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHRoZSBjb3VudGluZ09iamVjdCBpcyBrbm93biB0byBiZVxyXG4gICAqIGNvbnRhaW5lZCBieSBhIHRlbkZyYW1lLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0Q29udGFpbmluZ1RlbkZyYW1lKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QgKTogVGVuRnJhbWUge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50ZW5GcmFtZXMsICdzaG91bGQgbm90IGJlIGNhbGxlZCBpZiB0aGVyZSBhcmUgbm8gdGVuIGZyYW1lcycgKTtcclxuXHJcbiAgICBsZXQgY29udGFpbmluZ1RlbkZyYW1lOiBUZW5GcmFtZTtcclxuXHJcbiAgICB0aGlzLnRlbkZyYW1lcyEuZm9yRWFjaCggdGVuRnJhbWUgPT4ge1xyXG4gICAgICBpZiAoIHRlbkZyYW1lLmNvdW50aW5nT2JqZWN0cy5pbmNsdWRlcyggY291bnRpbmdPYmplY3QgKSApIHtcclxuICAgICAgICBjb250YWluaW5nVGVuRnJhbWUgPSB0ZW5GcmFtZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRhaW5pbmdUZW5GcmFtZSEsICdubyBjb250YWluaW5nIHRlbkZyYW1lIGZvdW5kIGZvciBjb3VudGluZ09iamVjdCcgKTtcclxuXHJcbiAgICByZXR1cm4gY29udGFpbmluZ1RlbkZyYW1lITtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGN1bGF0ZXMgdGhlIHNwb3RzIGZvciBvcmdhbml6ZWQgY291bnRpbmdPYmplY3RzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FsY3VsYXRlT3JnYW5pemVkT2JqZWN0U3BvdHMoKTogVmVjdG9yMltdIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaW5pdGlhbGl6ZWQsICdjYWxjdWxhdGVPcmdhbml6ZWRPYmplY3RTcG90cyBjYWxsZWQgYmVmb3JlIGluaXRpYWxpemF0aW9uJyApO1xyXG5cclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0V2lkdGggPSBDb3VudGluZ0NvbW1vbkNvbnN0YW50cy5TSU5HTEVfQ09VTlRJTkdfT0JKRUNUX0JPVU5EUy53aWR0aDtcclxuICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0SGVpZ2h0ID0gQ291bnRpbmdDb21tb25Db25zdGFudHMuU0lOR0xFX0NPVU5USU5HX09CSkVDVF9CT1VORFMuaGVpZ2h0O1xyXG4gICAgY29uc3QgbnVtYmVyT2ZSb3dzID0gdGhpcy5zdW1Qcm9wZXJ0eS5yYW5nZS5tYXggLyBOVU1CRVJfT0ZfT1JHQU5JWkVfUk9XUztcclxuXHJcbiAgICAvLyBOIGNvdW50aW5nT2JqZWN0cyBhY3Jvc3MgKyBtYXJnaW5zIHRvIHRoZSByaWdodCBmb3IgYWxsIGNvbHVtbnMgZXhjZXB0IHRoZSBsYXN0IG9uZS5cclxuICAgIGNvbnN0IGNvbnRlbnRXaWR0aCA9IE5VTUJFUl9PRl9PUkdBTklaRV9ST1dTICogKCBjb3VudGluZ09iamVjdFdpZHRoICsgT1JHQU5JWkVEX0NPVU5USU5HX09CSkVDVF9NQVJHSU4gKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBPUkdBTklaRURfQ09VTlRJTkdfT0JKRUNUX01BUkdJTjtcclxuXHJcbiAgICAvLyBUaGUgY2FsY3VsYXRlZCBzcG90cyBjb3JyZXNwb25kIHRvIHRoZSBjb3VudGluZ09iamVjdHMnIHRvcCBsZWZ0IGNvcm5lciwgc28gYWRqdXN0IGJ5IHRoZSB4LWFtb3VudCBvZiB0aGUgYm91bmRzXHJcbiAgICAvLyB0byBnZXQgdXMgdG8gdGhlIGxlZnQgZWRnZS4gVGhlIHktcG9zaXRpb24gb2YgY291bnRpbmdPYmplY3RzIGlzIGFscmVhZHkgYXQgdGhlIHRvcC5cclxuICAgIGNvbnN0IHhNYXJnaW4gPSAoIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUud2lkdGggLSBjb250ZW50V2lkdGggKSAvIDIgLVxyXG4gICAgICAgICAgICAgICAgICAgIENvdW50aW5nQ29tbW9uQ29uc3RhbnRzLlNJTkdMRV9DT1VOVElOR19PQkpFQ1RfQk9VTkRTLm1pblg7XHJcbiAgICBjb25zdCB5TWFyZ2luID0gQ291bnRpbmdDb21tb25Db25zdGFudHMuQ09VTlRJTkdfQVJFQV9NQVJHSU47XHJcblxyXG4gICAgY29uc3Qgc3BvdHMgPSBbXTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJPZlJvd3M7IGkrKyApIHtcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgTlVNQkVSX09GX09SR0FOSVpFX1JPV1M7IGorKyApIHtcclxuICAgICAgICBzcG90cy5wdXNoKCBuZXcgVmVjdG9yMihcclxuICAgICAgICAgIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUubWluWCArIHhNYXJnaW4gKyAoICggY291bnRpbmdPYmplY3RXaWR0aCArIE9SR0FOSVpFRF9DT1VOVElOR19PQkpFQ1RfTUFSR0lOICkgKiBqICksXHJcbiAgICAgICAgICB0aGlzLmJvdW5kc1Byb3BlcnR5LnZhbHVlLm1pblkgKyB5TWFyZ2luICsgKCAoIGNvdW50aW5nT2JqZWN0SGVpZ2h0ICsgT1JHQU5JWkVEX0NPVU5USU5HX09CSkVDVF9NQVJHSU4gKSAqIGkgKVxyXG4gICAgICAgICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNwb3RzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbGwgY291bnRpbmdPYmplY3RzIG5vdCBpbmNsdWRlZCBpbiB0aGUgc3VtIG9mIHRoaXMgY291bnRpbmdBcmVhLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtKCk6IENvdW50aW5nT2JqZWN0W10ge1xyXG4gICAgcmV0dXJuIFsgLi4udGhpcy5jb3VudGluZ09iamVjdHMgXS5maWx0ZXIoIGNvdW50aW5nT2JqZWN0ID0+IGNvdW50aW5nT2JqZWN0LmluY2x1ZGVJblN1bVByb3BlcnR5LnZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPcmdhbml6ZXMgdGhlIGNvdW50aW5nT2JqZWN0cyBpbiBhIGdyaWQgcGF0dGVybiwgYnV0IGZpcnN0IGJyZWFrcyBhbGwgZG93biBpbnRvIHNpbmdsZXMuXHJcbiAgICovXHJcbiAgcHVibGljIG9yZ2FuaXplT2JqZWN0cygpOiB2b2lkIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm9yZ2FuaXplZE9iamVjdFNwb3RzLCAndGhpcy5vcmdhbml6ZWRPYmplY3RTcG90cyBtdXN0IGV4aXN0IHRvIGNhbGwgdGhpcyBmdW5jdGlvbicgKTtcclxuXHJcbiAgICB0aGlzLmJyZWFrQXBhcnRDb3VudGluZ09iamVjdHMoKTtcclxuXHJcbiAgICAvLyBDb3B5IHRoZSBjdXJyZW50IGNvdW50aW5nT2JqZWN0cyBpbiB0aGUgY291bnRpbmdBcmVhIHNvIHdlIGNhbiBtdXRhdGUgdGhlbS5cclxuICAgIGxldCBjb3VudGluZ09iamVjdHNUb09yZ2FuaXplID0gdGhpcy5nZXRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtKCk7XHJcbiAgICBjb25zdCBudW1iZXJPZk9iamVjdHNUb09yZ2FuaXplID0gY291bnRpbmdPYmplY3RzVG9Pcmdhbml6ZS5sZW5ndGg7XHJcblxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZPYmplY3RzVG9Pcmdhbml6ZTsgaSsrICkge1xyXG4gICAgICBjb25zdCBzcG90ID0gdGhpcy5vcmdhbml6ZWRPYmplY3RTcG90c1sgaSBdO1xyXG5cclxuICAgICAgLy8gU29ydCB0aGUgY291bnRpbmdPYmplY3RzIGJ5IGNsb3Nlc3QgdG8gdGhlIGRlc3RpbmF0aW9uLlxyXG4gICAgICBjb3VudGluZ09iamVjdHNUb09yZ2FuaXplID0gXy5zb3J0QnkoIGNvdW50aW5nT2JqZWN0c1RvT3JnYW5pemUsIGNvdW50aW5nT2JqZWN0ID0+IHtcclxuICAgICAgICByZXR1cm4gY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggc3BvdCApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0VG9Pcmdhbml6ZSA9IGNvdW50aW5nT2JqZWN0c1RvT3JnYW5pemUuc2hpZnQoKSE7XHJcblxyXG4gICAgICBjb3VudGluZ09iamVjdFRvT3JnYW5pemUuc2V0RGVzdGluYXRpb24oIHNwb3QsIHRydWUsIHtcclxuICAgICAgICB0YXJnZXRTY2FsZTogTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuQ09VTlRJTkdfT0JKRUNUX1NDQUxFXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3VudGluZ09iamVjdHNUb09yZ2FuaXplLmxlbmd0aCA9PT0gMCwgJ3Nob3VsZCBoYXZlIGhhbmRsZWQgYWxsIGNvdW50aW5nT2JqZWN0cycgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBjb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb25zXHJcbiAgICogQHBhcmFtIGxpbmtTdGF0dXNDaGFuZ2VkRW1pdHRlclxyXG4gICAqIEBwYXJhbSBhcmVPYmplY3RzTGlua2VkVG9PbmVzIC0gaWYgd2Ugd2FudCB0byBsaW5rIHRoZSBjb3VudGluZ0FyZWFzLCBvciB1bmxpbmsgdGhlbS5cclxuICAgKiBAcGFyYW0gZ3JvdXBBbmRMaW5rVHlwZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBtYXRjaENvdW50aW5nT2JqZWN0c1RvTGlua2VkQ291bnRpbmdBcmVhKCBjb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb25zOiBDb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb25bXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlua1N0YXR1c0NoYW5nZWRFbWl0dGVyOiBURW1pdHRlcjxbIGJvb2xlYW4gXT4sIGFyZU9iamVjdHNMaW5rZWRUb09uZXM6IGJvb2xlYW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwQW5kTGlua1R5cGU6IEdyb3VwQW5kTGlua1R5cGUgKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCBhcmVPYmplY3RzTGlua2VkVG9PbmVzICkge1xyXG4gICAgICB0aGlzLmxpbmtUb1NlcmlhbGl6ZWRDb3VudGluZ09iamVjdHMoIGNvdW50aW5nT2JqZWN0U2VyaWFsaXphdGlvbnMsIGxpbmtTdGF0dXNDaGFuZ2VkRW1pdHRlciwgYXJlT2JqZWN0c0xpbmtlZFRvT25lcyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIC8vIElmIG5vdCBsaW5raW5nLCBpdCBpcyB3aXRob3V0IGFuaW1hdGlvbi4gVGhpcyBwYXJ0IGlzIHJlYWxseSBzaW1wbGUuIEp1c3QgY2xlYXIgb3V0IGFsbCB0aGUgY291bnRpbmcgb2JqZWN0cyBpblxyXG4gICAgICAvLyB0aGUgb2JqZWN0c0NvdW50aW5nQXJlYSwgYW5kIGFkZCBuZXcgb25lcyB0aGF0IG1hdGNoIHRoZSBzZXJpYWxpemF0aW9uIGZyb20gdGhlIG9uZXNDb3VudGluZ0FyZWEgKHBvc2l0aW9uIGFuZCBudW1iZXJWYWx1ZVxyXG4gICAgICAvLyBtYXRjaGluZykuXHJcblxyXG4gICAgICBjb25zdCBvYmplY3RzVG9Pcmdhbml6ZSA9IHRoaXMuZ2V0Q291bnRpbmdPYmplY3RzSW5jbHVkZWRJblN1bSgpO1xyXG4gICAgICBvYmplY3RzVG9Pcmdhbml6ZS5mb3JFYWNoKCBjb3VudGluZ09iamVjdCA9PiB0aGlzLnJlbW92ZUNvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdCApICk7XHJcblxyXG4gICAgICBfLnNvcnRCeSggY291bnRpbmdPYmplY3RTZXJpYWxpemF0aW9ucywgJ3pJbmRleCcgKS5mb3JFYWNoKCBzZXJpYWxpemF0aW9uID0+IHtcclxuICAgICAgICBjb25zdCBuZXdDb3VudGluZ09iamVjdCA9IG5ldyBDb3VudGluZ09iamVjdCggc2VyaWFsaXphdGlvbi5udW1iZXJWYWx1ZSwgc2VyaWFsaXphdGlvbi5wb3NpdGlvbiwge1xyXG4gICAgICAgICAgZ3JvdXBpbmdFbmFibGVkUHJvcGVydHk6IHRoaXMuZ3JvdXBpbmdFbmFibGVkUHJvcGVydHlcclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgdGhpcy5hZGRDb3VudGluZ09iamVjdCggbmV3Q291bnRpbmdPYmplY3QgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGdyb3VwQW5kTGlua1R5cGUgd2FzIHNldCB0byB1bmdyb3VwZWQsIGJyZWFrIGFwYXJ0IHRoZSBjb3VudGluZyBvYmplY3RzLiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCBhbiBvcmRlclxyXG4gICAgICAvLyBkZXBlbmRlbmN5IHByb2JsZW0gd2hlbiBzd2l0Y2hpbmcgdG8gYW4gdW5ncm91cGVkIHN0YXRlIHdoZXJlIHRoZSBleGlzdGluZyBjb3VudGluZ09iamVjdHMgYXJlIGJyb2tlbiBhcGFydCBiZWZvcmVcclxuICAgICAgLy8gd2UgY2xlYXIgdGhlbSBvdXQgYW5kIHJlLWFkZCB0aGVtIGFib3ZlLlxyXG4gICAgICBncm91cEFuZExpbmtUeXBlID09PSBHcm91cEFuZExpbmtUeXBlLlVOR1JPVVBFRCAmJiB0aGlzLmJyZWFrQXBhcnRDb3VudGluZ09iamVjdHMoIHRydWUgKTtcclxuXHJcbiAgICAgIC8vIFNpbmNlIHRoZXJlIGlzIG5vIGFuaW1hdGlvbiwgZmlyZSB0aGlzIGltbWVkaWF0ZWx5XHJcbiAgICAgIGxpbmtTdGF0dXNDaGFuZ2VkRW1pdHRlci5lbWl0KCBhcmVPYmplY3RzTGlua2VkVG9PbmVzICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBcIkxpbmtcIiBjdXJyZW50IENvdW50aW5nT2JqZWN0cyB0byB0aGUgcHJvdmlkZWQgc2VyaWFsaXphdGlvbiBzdGF0ZSAocHJlc3VtYWJseSBmcm9tIGFub3RoZXIgY291bnRpbmdBcmVhKS4gSGVyZSBsaW5rXHJcbiAgICogbWVhbnMgdGhhdCBpdCBpcyBtYXRjaGVkLlxyXG4gICAqXHJcbiAgICogSWYgbGlua2luZywgd2UgbWF5IHdhbnQgdG8gYnJlYWsgYXBhcnQgc28gdGhhdCBoYWxmIG9mIGEgZ3JvdXAgY2FuIGFuaW1hdGVcclxuICAgKiB0byBvbmUgc3BvdCBhbmQgdGhlIG90aGVyIGhhbGYgYW5vdGhlci4gV2UgZG9uJ3QgdXNlIGJyZWFrQXBhcnRPYmplY3RzIGJlY2F1c2UgdGhhdCBpc1xyXG4gICAqIG92ZXJraWxsIGFuZCBiYWQgVVggKGltYWdpbmUgYm90aCBtb2RlbHMgaGF2ZSBhIGdyb3VwIG9mIDQsIGRvbid0IHNwbGl0IHRoYXQgdXAgdG8gYW5pbWF0ZSBpbiBvbmUgbW9kZWwpLiBUaGVuXHJcbiAgICogYW5pbWF0ZSB0byB0aGUgcmlnaHQgc3BvdHMuXHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGlzIGZ1bmN0aW9uIG5ldmVyIGNvbWJpbmVzIG9iamVjdHMgd2hlbiBsaW5raW5nLCBidXQganVzdCBhbmltYXRlcyBjYXJkcyB0byB0aGUgc2FtZSBsb2NhdGlvbiB0byBnaXZlIHRoZVxyXG4gICAqIGlsbHVzaW9uIG9mIGNvbWJpbmluZy4gMiBpdGVtcyBhcmUgYXNzdW1lZCB0byBlbnN1cmUgdGhpcyBiZWhhdmlvcjpcclxuICAgKiAxLiBCZWNhdXNlIHRoZSBhY3R1YWwgXCJsaW5rZWRcIiBzdGF0ZSBpcyBqdXN0IGEgbWltaWMgb2YgdGhlIG90aGVyIGNvdW50aW5nQXJlYSwgYW5kIHRoaXMgY291bnRpbmdBcmVhIGlzIGhpZGRlbi5cclxuICAgKiAyLiBCZWNhdXNlIGl0IGFzc3VtZXMgdGhhdCB3aGVuIHVubGlua2luZyAocmVzaG93aW5nIHRoaXMgdW5kZXJseWluZyBjb3VudGluZ0FyZWEsIHNlZSB0aGUgb3RoZXIgaGFsZiBvZlxyXG4gICAqICBgbWF0Y2hDb3VudGluZ09iamVjdHNUb0xpbmtlZENvdW50aW5nQXJlYSgpYCksIHRoYXQgdGhlIHN0YXRlIHdpbGwgYmUgYXV0by11cGRhdGVkICh3aXRob3V0IGFuaW1hdGlvbikgdG8gbWF0Y2hcclxuICAgKiAgdGhlIGFwcHJvcHJpYXRlIGFuZCBleGFjdCBjb3VudHkgb2JqZWN0IHN0YXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgbGlua1RvU2VyaWFsaXplZENvdW50aW5nT2JqZWN0cyggdGFyZ2V0Q291bnRpbmdPYmplY3RTZXJpYWxpemF0aW9uczogQ291bnRpbmdPYmplY3RTZXJpYWxpemF0aW9uW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rU3RhdHVzQ2hhbmdlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgYm9vbGVhbiBdPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZU9iamVjdHNMaW5rZWRUb09uZXM6IGJvb2xlYW4gKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0c1RvT3JnYW5pemUgPSB0aGlzLmdldENvdW50aW5nT2JqZWN0c0luY2x1ZGVkSW5TdW0oKTtcclxuXHJcbiAgICAvLyBTdGFydGluZyBsZW5ndGgsIGJ1dCBjb3VsZCBpbmNyZWFzZSBpZiBDb3VudGluZyBPYmplY3RzIGFyZSBicm9rZW4gYXBhcnRcclxuICAgIGxldCBudW1iZXJPZk9iamVjdHNUb09yZ2FuaXplID0gb2JqZWN0c1RvT3JnYW5pemUubGVuZ3RoO1xyXG5cclxuICAgIGNvbnN0IG51bWJlck9mQW5pbWF0aW9uc0ZpbmlzaGVkUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICAvLyBTb3J0IGJ5IGhpZ2hlc3QgdmFsdWUgZmlyc3QuIEJlZm9yZSB3ZSB1c2UgdGhlc2UgdG8gbW92ZSBvciBicmVha3VwIG91ciBjb3VudGluZ09iamVjdHMgc28gdGhleSBtYXRjaCB0aGVcclxuICAgIC8vIHNlcmlhbGl6YXRpb25zLCB3ZSB3aWxsIHJlbW92ZSBhbnkgc2VyaWFsaXphdGlvbnMgdGhhdCBhbHJlYWR5IG1hdGNoIGV4aXN0aW5nIGNvdW50aW5nT2JqZWN0cyBiZWxvdy5cclxuICAgIGNvbnN0IGlucHV0U2VyaWFsaXphdGlvbnNTb3J0ZWRCeVZhbHVlOiBDb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb25bXSA9IF8uc29ydEJ5KCB0YXJnZXRDb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb25zLFxyXG4gICAgICBjb3VudGluZ09iamVjdFNlcmlhbGl6YXRpb24gPT4gY291bnRpbmdPYmplY3RTZXJpYWxpemF0aW9uLm51bWJlclZhbHVlICkucmV2ZXJzZSgpO1xyXG5cclxuICAgIC8vIE9ubHkgYW5pbWF0ZSBpZiB3ZSBhcmUgbGlua2luZyB0byB0aGUgb25lc0NvdW50aW5nQXJlYVxyXG4gICAgY29uc3QgYW5pbWF0ZSA9IGFyZU9iamVjdHNMaW5rZWRUb09uZXM7XHJcblxyXG4gICAgY29uc3QgY291bnRpbmdPYmplY3RzU29ydGVkQnlWYWx1ZSA9IHRoaXMuZ2V0Q291bnRpbmdPYmplY3RzQnlWYWx1ZSgpO1xyXG5cclxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIGlucHV0IGFuZCB0cnkgdG8gbXV0YXRlIHRoZSBjdXJyZW50IGNvdW50aW5nT2JqZWN0cyBsaXN0IHRvIHN1cHBvcnQgdGhhdCB0YXJnZXRcclxuICAgIGZvciAoIGxldCBqID0gaW5wdXRTZXJpYWxpemF0aW9uc1NvcnRlZEJ5VmFsdWUubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0gKSB7XHJcbiAgICAgIGNvbnN0IHRhcmdldFNlcmlhbGl6YXRpb24gPSBpbnB1dFNlcmlhbGl6YXRpb25zU29ydGVkQnlWYWx1ZVsgaiBdO1xyXG4gICAgICBjb25zdCB0YXJnZXRWYWx1ZSA9IHRhcmdldFNlcmlhbGl6YXRpb24ubnVtYmVyVmFsdWU7XHJcblxyXG4gICAgICAvLyBGaXJzdCBzZWUgaWYgdGhlcmUgYXJlIGFueSBleGFjdCBwb3NpdGlvbi92YWx1ZSBtYXRjaGVzLCBhbmQga2VlcCB0aG9zZSB3aGVyZSB0aGV5IGFyZS5cclxuICAgICAgLy8gVXNlIGEgZm9yRWFjaCBiZWNhdXNlIHdlIG1heSBtdXRhdGUgdGhlIGxpc3QgaW5saW5lLlxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjb3VudGluZ09iamVjdHNTb3J0ZWRCeVZhbHVlLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb3VudGluZ09iamVjdCA9IGNvdW50aW5nT2JqZWN0c1NvcnRlZEJ5VmFsdWVbIGkgXTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBtYXRjaCB3aXRoIHRoZSBzYW1lIHZhbHVlIGFuZCBwb3NpdGlvbiwgdGhlbiB3ZSBkb24ndCBuZWVkIHRvIGNhbGwgc2VuZFRvIGJlY2F1c2UgdGhpc1xyXG4gICAgICAgIC8vIGNvdW50aW5nT2JqZWN0IGlzIGFscmVhZHkgaW4gdGhlIGNvcnJlY3Qgc3BvdC5cclxuICAgICAgICBpZiAoIGN1cnJlbnRDb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlID09PSB0YXJnZXRWYWx1ZSAmJlxyXG4gICAgICAgICAgICAgY3VycmVudENvdW50aW5nT2JqZWN0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZXF1YWxzKCB0YXJnZXRTZXJpYWxpemF0aW9uLnBvc2l0aW9uICkgKSB7XHJcblxyXG4gICAgICAgICAgYXJyYXlSZW1vdmUoIGNvdW50aW5nT2JqZWN0c1NvcnRlZEJ5VmFsdWUsIGN1cnJlbnRDb3VudGluZ09iamVjdCApO1xyXG4gICAgICAgICAgYXJyYXlSZW1vdmUoIGlucHV0U2VyaWFsaXphdGlvbnNTb3J0ZWRCeVZhbHVlLCB0YXJnZXRTZXJpYWxpemF0aW9uICk7XHJcbiAgICAgICAgICBudW1iZXJPZkFuaW1hdGlvbnNGaW5pc2hlZFByb3BlcnR5LnZhbHVlICs9IDE7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBpbnB1dFNlcmlhbGl6YXRpb25zU29ydGVkQnlWYWx1ZS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY291bnRpbmdPYmplY3RzU29ydGVkQnlWYWx1ZS5sZW5ndGggPiAwLCAnc3RpbGwgaGF2ZSBzZXJpYWxpemF0aW9ucywgYnV0IG5vIENvdW50aW5nT2JqZWN0cyBsZWZ0JyApO1xyXG5cclxuICAgICAgY29uc3QgdGFyZ2V0U2VyaWFsaXphdGlvbiA9IGlucHV0U2VyaWFsaXphdGlvbnNTb3J0ZWRCeVZhbHVlWyBpIF07XHJcblxyXG4gICAgICBjb25zdCBkZXNpcmVkVmFsdWUgPSB0YXJnZXRTZXJpYWxpemF0aW9uLm51bWJlclZhbHVlO1xyXG4gICAgICBsZXQgY3VycmVudE51bWJlclZhbHVlQ291bnQgPSAwO1xyXG4gICAgICBsZXQgdGFyZ2V0SGFuZGxlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgLy8gVGhlbiwgbW92ZSBvciBzcGxpdCB0aGUgcmVtYWluaW5nIGNvdW50aW5nT2JqZWN0cyB0byBtYXRjaCB0aGUgc2VyaWFsaXphdGlvbnMuXHJcbiAgICAgIHdoaWxlICggIXRhcmdldEhhbmRsZWQgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb3VudGluZ09iamVjdCA9IGNvdW50aW5nT2JqZWN0c1NvcnRlZEJ5VmFsdWVbIDAgXTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvdW50aW5nT2JqZWN0cy5pbmNsdWRlcyggY3VycmVudENvdW50aW5nT2JqZWN0ICksXHJcbiAgICAgICAgICAnb2xkLCByZW1vdmVkIGNvdW50aW5nT2JqZWN0IHN0aWxsIGF0IHBsYXkgaGVyZScgKTtcclxuXHJcbiAgICAgICAgY29uc3QgbmV4dE5lZWRlZFZhbHVlID0gZGVzaXJlZFZhbHVlIC0gY3VycmVudE51bWJlclZhbHVlQ291bnQ7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBjdXJyZW50Q291bnRpbmdPYmplY3QgaGFzIGEgbWF0Y2hpbmcgb3Igc21hbGxlciB2YWx1ZSB0aGFuIHRoZSB0YXJnZXQgc2VyaWFsaXphdGlvbiwgc2VuZCBpdCB0byB0aGVcclxuICAgICAgICAvLyBsb2NhdGlvbiBvZiB0aGUgdGFyZ2V0LlxyXG4gICAgICAgIGlmICggY3VycmVudENvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUgPD0gbmV4dE5lZWRlZFZhbHVlICkge1xyXG4gICAgICAgICAgdGhpcy5zZW5kQ291bnRpbmdPYmplY3RUbyggY3VycmVudENvdW50aW5nT2JqZWN0LCB0YXJnZXRTZXJpYWxpemF0aW9uLnBvc2l0aW9uLCBudW1iZXJPZkFuaW1hdGlvbnNGaW5pc2hlZFByb3BlcnR5LCBhbmltYXRlICk7XHJcbiAgICAgICAgICBhcnJheVJlbW92ZSggY291bnRpbmdPYmplY3RzU29ydGVkQnlWYWx1ZSwgY3VycmVudENvdW50aW5nT2JqZWN0ICk7XHJcbiAgICAgICAgICBjdXJyZW50TnVtYmVyVmFsdWVDb3VudCArPSBjdXJyZW50Q291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgICAvLyBXZSBhcmUgZG9uZSB3aGVuIHdlJ3ZlIHJlYWNoZWQgdGhlIGRlc2lyZWQgdmFsdWUuXHJcbiAgICAgICAgICB0YXJnZXRIYW5kbGVkID0gY3VycmVudE51bWJlclZhbHVlQ291bnQgPT09IGRlc2lyZWRWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGN1cnJlbnRDb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlID4gbmV4dE5lZWRlZFZhbHVlICkge1xyXG4gICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnRDb3VudGluZ09iamVjdCBoYXMgYSBncmVhdGVyIHZhbHVlIHRoYW4gdGhlIHRhcmdldCwgc3BsaXQgaXQgdXAgYW5kIHRoZW4gdHJ5IHRoaXMgbG9vcCBhZ2Fpbi5cclxuXHJcbiAgICAgICAgICAvLyBzcGxpdCBvZmYgdGhlIHZhbHVlIHdlIG5lZWQgdG8gYmUgdXNlZCBpbiB0aGUgbmV4dCBpdGVyYXRpb25cclxuICAgICAgICAgIGNvbnN0IG5ld0NvdW50aW5nT2JqZWN0ID0gdGhpcy5zcGxpdENvdW50aW5nT2JqZWN0KCBjdXJyZW50Q291bnRpbmdPYmplY3QsIG5leHROZWVkZWRWYWx1ZSApO1xyXG5cclxuICAgICAgICAgIG51bWJlck9mT2JqZWN0c1RvT3JnYW5pemUgKz0gMTtcclxuICAgICAgICAgIGNvdW50aW5nT2JqZWN0c1NvcnRlZEJ5VmFsdWUucHVzaCggbmV3Q291bnRpbmdPYmplY3QgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBXYWl0IHRvIHByb2NlZWQgdW50aWwgYWxsIGFuaW1hdGlvbnMgaGF2ZSBjb21wbGV0ZWRcclxuICAgIG51bWJlck9mQW5pbWF0aW9uc0ZpbmlzaGVkUHJvcGVydHkubGluayggZnVuY3Rpb24gbnVtYmVyT2ZBbmltYXRpb25zRmluaXNoZWRMaXN0ZW5lciggbnVtYmVyT2ZBbmltYXRpb25zRmluaXNoZWQ6IG51bWJlciApIHtcclxuICAgICAgaWYgKCBudW1iZXJPZkFuaW1hdGlvbnNGaW5pc2hlZCA9PT0gbnVtYmVyT2ZPYmplY3RzVG9Pcmdhbml6ZSApIHtcclxuICAgICAgICBsaW5rU3RhdHVzQ2hhbmdlZEVtaXR0ZXIuZW1pdCggYXJlT2JqZWN0c0xpbmtlZFRvT25lcyApO1xyXG4gICAgICAgIG51bWJlck9mQW5pbWF0aW9uc0ZpbmlzaGVkUHJvcGVydHkudW5saW5rKCBudW1iZXJPZkFuaW1hdGlvbnNGaW5pc2hlZExpc3RlbmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ubHkgbWVhbnQgdG8gYmUgdXNlZCBmb3IgXCJtYXNzIGV4b2R1c1wiIHdoZXJlIHdlIHdhbnQgdG8ga2VlcCB0cmFjayBvZiB3aGVuIGFsbCBhcmUgZmluaXNoZWQgYW5pbWF0ZWQgdG8gZGVzdGluYXRpb25cclxuICAgKi9cclxuICBwcml2YXRlIHNlbmRDb3VudGluZ09iamVjdFRvKCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IFZlY3RvcjIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtYmVyT2ZBbmltYXRpb25zRmluaXNoZWRQcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZTogYm9vbGVhbiApOiB2b2lkIHtcclxuXHJcbiAgICBjb3VudGluZ09iamVjdC5zZXREZXN0aW5hdGlvbiggcG9zaXRpb24sIGFuaW1hdGUsIHtcclxuICAgICAgdGFyZ2V0U2NhbGU6IE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLkNPVU5USU5HX09CSkVDVF9TQ0FMRSxcclxuICAgICAgdXNlU3RhbmRhcmRBbmltYXRpb25TcGVlZDogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIGNvdW50aW5nT2JqZWN0LmVuZEFuaW1hdGlvbkVtaXR0ZXIuYWRkTGlzdGVuZXIoIGZ1bmN0aW9uIHRvUmVtb3ZlKCkge1xyXG4gICAgICBudW1iZXJPZkFuaW1hdGlvbnNGaW5pc2hlZFByb3BlcnR5LnZhbHVlICs9IDE7XHJcbiAgICAgIGNvdW50aW5nT2JqZWN0LmVuZEFuaW1hdGlvbkVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRvUmVtb3ZlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgbGlzdCB3aXRoIHRoZSBsYXJnZXN0IHZhbHVlIGNvdW50aW5nIG9iamVjdHMgZmlyc3QgKG9ubHkgaW5jbHVkZWQgaW4gc3VtKS5cclxuICAgKi9cclxuICBwcml2YXRlIGdldENvdW50aW5nT2JqZWN0c0J5VmFsdWUoKTogQ291bnRpbmdPYmplY3RbXSB7XHJcbiAgICByZXR1cm4gXy5zb3J0QnkoIHRoaXMuZ2V0Q291bnRpbmdPYmplY3RzSW5jbHVkZWRJblN1bSgpLCBjb3VudGluZ09iamVjdCA9PiBjb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlICkucmV2ZXJzZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3BsaXRzIHRoZSBwcm92aWRlZCBjb3VudGluZ09iamVjdCBpbnRvIHR3byBjb3VudGluZ09iamVjdHMuIFRoaXMgaXMgYSBmdW5jdGlvbiBmb3IgdGhlIG1vZGVsIHRvIHVzZSBmb3IgYXV0b21hdGVkXHJcbiAgICogYWN0aW9ucywgYW5kIGRvZXMgbm90IHJlbGF0ZSB0byB0aGUgVVNFUiBzcGxpdHRpbmcgYSBjb3VudGluZ09iamVjdCB3aGVuIGdyYWJiaW5nIHRoZSBoYW5kbGUgb2YgY291bnRpbmdPYmplY3QuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzcGxpdENvdW50aW5nT2JqZWN0KCBjb3VudGluZ09iamVjdDogQ291bnRpbmdPYmplY3QsIHZhbHVlVG9TcGxpdDogbnVtYmVyICk6IENvdW50aW5nT2JqZWN0IHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvdW50aW5nT2JqZWN0LmluY2x1ZGVJblN1bVByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAnYXR0ZW1wdGVkIHRvIHNwbGl0IGNvdW50aW5nT2JqZWN0IHRoYXQgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIGZyb20gdGhlIHRvdGFsJyApO1xyXG4gICAgY29uc3Qgc3RhcnRpbmdDb3VudCA9IF8uc3VtKCB0aGlzLmdldENvdW50aW5nT2JqZWN0c0luY2x1ZGVkSW5TdW0oKS5tYXAoIHggPT4geC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlICkgKTtcclxuXHJcbiAgICBjb25zdCB0b3RhbFZhbHVlID0gY291bnRpbmdPYmplY3QubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhbHVlVG9TcGxpdCA8IHRvdGFsVmFsdWUsXHJcbiAgICAgIGBkZXNpcmVkIHNwbGl0IHZhbHVlICgke3ZhbHVlVG9TcGxpdH0pIGlzIHRoZSBzYW1lIG9yIGdyZWF0ZXIgdGhhbiB0aGUgY291bnRpbmdPYmplY3QgdG8gc3BsaXQncyB2YWx1ZSAoJHt0b3RhbFZhbHVlfSlgICk7XHJcblxyXG4gICAgY29uc3QgbmV3Q291bnRpbmdPYmplY3QgPSBuZXcgQ291bnRpbmdPYmplY3QoIHZhbHVlVG9TcGxpdCwgY291bnRpbmdPYmplY3QucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICBncm91cGluZ0VuYWJsZWRQcm9wZXJ0eTogdGhpcy5ncm91cGluZ0VuYWJsZWRQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDb3VudGluZ09iamVjdCggbmV3Q291bnRpbmdPYmplY3QgKTtcclxuXHJcbiAgICBjb3VudGluZ09iamVjdC5jaGFuZ2VOdW1iZXIoIHRvdGFsVmFsdWUgLSB2YWx1ZVRvU3BsaXQgKTtcclxuXHJcbiAgICBjb25zdCBlbmRpbmdDb3VudCA9IF8uc3VtKCB0aGlzLmdldENvdW50aW5nT2JqZWN0c0luY2x1ZGVkSW5TdW0oKS5tYXAoIHggPT4geC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlICkgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHN0YXJ0aW5nQ291bnQgPT09IGVuZGluZ0NvdW50LCAndG90YWwgZG9lc25cXCd0IG1hdGNoIGFmdGVyIHNwbGl0dGluZyBjb3VudGluZyBvYmplY3QnICk7XHJcblxyXG4gICAgcmV0dXJuIG5ld0NvdW50aW5nT2JqZWN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQnJlYWtzIGFwYXJ0IGFsbCBjb3VudGluZyBvYmplY3RzIGludG8gY291bnRpbmcgb2JqZWN0cyB3aXRoIGEgdmFsdWUgb2YgMS4gQnkgZGVmYXVsdCwgaXQgY3JlYXRlcyBhbGwgbmV3IGNvdW50aW5nXHJcbiAgICogb2JqZWN0cyBpbiB0aGUgcG9zaXRpb24gb2YgdGhlIG9yaWdpbmFsIGNvdW50aW5nIG9iamVjdC4gSWYgc3RhY2s9dHJ1ZSwgaXQgYXJyYW5nZXMgdGhlbSBhY2NvcmRpbmcgdG8gdGhlXHJcbiAgICogYmFja2dyb3VuZCBzaGFwZSBvZiB0aGUgb3JpZ2luYWwgY291bnRpbmcgb2JqZWN0LiBBbnkgbmV3bHkgY3JlYXRlZCBjb3VudGluZ09iamVjdHMgYXJlIGFkZGVkIGluIGZyb250IG9mIHRoZVxyXG4gICAqIGV4aXN0aW5nIGNvdW50aW5nT2JqZWN0cyAoei1pbmRleCkuXHJcbiAgICovXHJcbiAgcHVibGljIGJyZWFrQXBhcnRDb3VudGluZ09iamVjdHMoIHN0YWNrID0gZmFsc2UgKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3Qgb2JqZWN0c1RvQnJlYWtEb3duID0gdGhpcy5nZXRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtKCk7XHJcbiAgICBjb25zdCBzdGFydGluZ0NvdW50ID0gXy5zdW0oIG9iamVjdHNUb0JyZWFrRG93bi5tYXAoIHggPT4geC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlICkgKTtcclxuXHJcbiAgICBvYmplY3RzVG9CcmVha0Rvd24uZm9yRWFjaCggY291bnRpbmdPYmplY3QgPT4ge1xyXG4gICAgICBpZiAoIGNvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUgPiAxICkge1xyXG4gICAgICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0UG9zaXRpb24gPSBjb3VudGluZ09iamVjdC5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGNvdW50aW5nT2JqZWN0VmFsdWUgPSBjb3VudGluZ09iamVjdC5udW1iZXJWYWx1ZVByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICBjb25zdCBudW1iZXJPZlNldHMgPSBjb3VudGluZ09iamVjdFZhbHVlIDwgTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuVEVOID8gMSA6IDI7XHJcbiAgICAgICAgY29uc3QgbnVtYmVyT2ZSb3dzID0gTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuVEVOO1xyXG5cclxuICAgICAgICBjb25zdCBvZmZzZXRZU2VnbWVudCA9IHN0YWNrID8gQ291bnRpbmdDb21tb25Db25zdGFudHMuQlJFQUtfQVBBUlRfWV9PRkZTRVQgOiAwO1xyXG5cclxuICAgICAgICAvLyBUaGUgbW92YWJsZSBib3VuZHMgd2l0aCByZXNwZWN0IHRvIHBvc2l0aW9uUHJvcGVydHkgYW5kIHRvIGhvdyBtdWNoIHNwYWNlIG91ciBjb3VudGluZ09iamVjdCBib3VuZHMgdGFrZXMgdXAuXHJcbiAgICAgICAgY29uc3QgYWRqdXN0ZWRPcmlnaW5Cb3VuZHMgPSBjb3VudGluZ09iamVjdC5nZXRPcmlnaW5Cb3VuZHMoIHRoaXMuYm91bmRzUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAgICAgLy8gRWFjaCBleHRyYSBzaW5nbGUgdGhhdCBuZWVkcyB0byBiZSBzdGFja2VkIHdpbGwgdGFrZSB1cCBleHRyYSBzcGFjZSwgc28gdXNlIHRoYXQgaW4gdGhlIGNhbGN1bGF0aW9uIG9mIGlmIHdlXHJcbiAgICAgICAgLy8gc3RhY2sgdXAgb3IgZG93bi4gV2lsbCBiZSAwIGlmIG5vdCBzdGFja2luZy5cclxuICAgICAgICBjb25zdCBuZWVkZWRTcGFjZSA9IG9mZnNldFlTZWdtZW50ICpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICggTWF0aC5taW4oIGNvdW50aW5nT2JqZWN0Lm51bWJlclZhbHVlUHJvcGVydHkudmFsdWUsIE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLlRFTiApIC0gMSApO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSBpc24ndCBlbm91Z2ggc3BhY2UgYmVsb3cgdGhlIGN1cnJlbnQgY291bnRpbmdPYmplY3QgZm9yIGEgdmlzdWFsIHN0YWNrLCBwbGFjZSB0aGUgc3RhY2sgYWJvdmUgdGhlXHJcbiAgICAgICAgLy8gY291bnRpbmdPYmplY3QgaW5zdGVhZC5cclxuICAgICAgICBjb25zdCBzaG91bGRTdGFja1Vwd2FyZHMgPSBhZGp1c3RlZE9yaWdpbkJvdW5kcy5tYXhZIDw9IGNvdW50aW5nT2JqZWN0UG9zaXRpb24ueSArIG5lZWRlZFNwYWNlO1xyXG5cclxuICAgICAgICAvLyBwb3NpdGlvbiBvZiB0aGUgZmlyc3QgbmV3IENvdW50aW5nT2JqZWN0LCByZXNwZWN0aW5nIHRoYXQgaWYgc3RhY2tpbmcgdXB3YXJkcywgd2Ugc3RpbGwgY3JlYXRlIGZyb20gdGhlIHRvcFxyXG4gICAgICAgIC8vIGRvd24uXHJcbiAgICAgICAgY29uc3Qgb3JpZ2luID0gc2hvdWxkU3RhY2tVcHdhcmRzID8gY291bnRpbmdPYmplY3RQb3NpdGlvbi5wbHVzWFkoIDAsIC1uZWVkZWRTcGFjZSApIDogY291bnRpbmdPYmplY3RQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgbGV0IGN1cnJlbnRPZmZzZXRZID0gMDtcclxuXHJcbiAgICAgICAgbGV0IHJlQWRkZWRDb3VudGluZ09iamVjdHMgPSAwO1xyXG4gICAgICAgIGNvbnN0IHhTaGlmdCA9IGNvdW50aW5nT2JqZWN0VmFsdWUgPj0gTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuVEVOICYmIHN0YWNrID8gLUNvdW50aW5nQ29tbW9uQ29uc3RhbnRzLkNPVU5USU5HX09CSkVDVF9TSVpFLndpZHRoIDogMDtcclxuXHJcbiAgICAgICAgLy8gV2UgYXJlIGFib3V0IHRvIGFkZCBhIGJ1bmNoIG9mIG9uZXMgdG8gZXF1YWwgdGhpcyBjb3VudGluZ09iamVjdCdzIHZhbHVlXHJcbiAgICAgICAgdGhpcy5yZW1vdmVDb3VudGluZ09iamVjdCggY291bnRpbmdPYmplY3QgKTtcclxuXHJcbiAgICAgICAgLy8gTmVzdGVkIGxvb3BpbmcgdG8gYWNjb3VudCBmb3IgMTBzIHBsYWNlIGFuZCAxcyBwbGFjZSBzdGFja3NcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IG51bWJlck9mU2V0cyAtIDE7IGkgPj0gMDsgaS0tICkge1xyXG4gICAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgbnVtYmVyT2ZSb3dzOyBqKysgKSB7XHJcbiAgICAgICAgICAgIGlmICggcmVBZGRlZENvdW50aW5nT2JqZWN0cyA8IGNvdW50aW5nT2JqZWN0VmFsdWUgKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbmV3Q291bnRpbmdPYmplY3QgPSBuZXcgQ291bnRpbmdPYmplY3QoIDEsIG9yaWdpbi5wbHVzWFkoIGkgKiB4U2hpZnQsIGN1cnJlbnRPZmZzZXRZICksIHtcclxuICAgICAgICAgICAgICAgIGdyb3VwaW5nRW5hYmxlZFByb3BlcnR5OiB0aGlzLmdyb3VwaW5nRW5hYmxlZFByb3BlcnR5XHJcbiAgICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgICAgIHRoaXMuYWRkQ291bnRpbmdPYmplY3QoIG5ld0NvdW50aW5nT2JqZWN0ICk7XHJcbiAgICAgICAgICAgICAgY3VycmVudE9mZnNldFkgKz0gb2Zmc2V0WVNlZ21lbnQ7XHJcbiAgICAgICAgICAgICAgcmVBZGRlZENvdW50aW5nT2JqZWN0cysrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjdXJyZW50T2Zmc2V0WSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdG90YWwgdGhlIHZhbHVlIG9mIGFsbCBjb3VudGluZyBvYmplY3RzIGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGJyb2tlbiB1cCBhbmQgcmUtY3JlYXRlZFxyXG4gICAgY29uc3QgbmV3Q291bnQgPSBfLnN1bSggdGhpcy5nZXRDb3VudGluZ09iamVjdHNJbmNsdWRlZEluU3VtKCkubWFwKCB4ID0+IHgubnVtYmVyVmFsdWVQcm9wZXJ0eS52YWx1ZSApICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3RhcnRpbmdDb3VudCA9PT0gbmV3Q291bnQsXHJcbiAgICAgICdUaGUgdmFsdWUgb2YgYWxsIGNvdW50aW5nIG9iamVjdHMgZG9lcyBub3QgbWF0Y2ggdGhlaXIgb3JpZ2luYWwgdmFsdWUgYWZ0ZXIgYnJlYWtpbmcgdGhlbSBhcGFydCcgKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclN1aXRlQ29tbW9uLnJlZ2lzdGVyKCAnQ291bnRpbmdBcmVhJywgQ291bnRpbmdBcmVhICk7XHJc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