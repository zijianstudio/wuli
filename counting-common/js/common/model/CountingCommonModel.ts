// Copyright 2021-2023, University of Colorado Boulder

/**
 * Base model for counting screens.
 *
 * @author Sharfudeen Ashraf
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import countingCommon from '../../countingCommon.js';
import CountingObject from './CountingObject.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import TModel from '../../../../joist/js/TModel.js';

class CountingCommonModel implements TModel {

  // Numbers in play that can be interacted with.
  public countingObjects: ObservableArray<CountingObject>;

  // the sum of all paper numbers
  public sumProperty: NumberProperty;

  // used to notify view sub-components that reset is being called
  public readonly resetEmitter: TEmitter;

  protected constructor( highestCount: number ) {
    this.countingObjects = createObservableArray();
    this.sumProperty = new NumberProperty( 0, {
      range: new Range( 0, highestCount )
    } );
    this.resetEmitter = new Emitter();
  }

  /**
   * Given two paper numbers, combine them (set one's value to the sum of their previous values, and remove the
   * other).
   */
  public collapseNumberModels( availableModelBounds: Bounds2, draggedCountingObject: CountingObject, droppedCountingObject: CountingObject ): void {
    const dropTargetNumberValue = droppedCountingObject.numberValueProperty.value;
    const draggedNumberValue = draggedCountingObject.numberValueProperty.value;
    const newValue = dropTargetNumberValue + draggedNumberValue;

    let numberToRemove;
    let numberToChange;

    // See https://github.com/phetsims/make-a-ten/issues/260
    if ( draggedCountingObject.digitLength === droppedCountingObject.digitLength ) {
      numberToRemove = draggedCountingObject;
      numberToChange = droppedCountingObject;
    }
    else {
      // The larger number gets changed, the smaller one gets removed.
      const droppingOnLarger = dropTargetNumberValue > draggedNumberValue;
      numberToRemove = droppingOnLarger ? draggedCountingObject : droppedCountingObject;
      numberToChange = droppingOnLarger ? droppedCountingObject : draggedCountingObject;
    }

    // Apply changes
    this.removeCountingObject( numberToRemove );
    numberToChange.changeNumber( newValue );

    numberToChange.setConstrainedDestination( availableModelBounds, numberToChange.positionProperty.value, false );
    numberToChange.moveToFrontEmitter.emit();
  }

  /**
   * Add a CountingObject to the model
   */
  public addCountingObject( countingObject: CountingObject ): void {
    this.countingObjects.push( countingObject );
  }

  /**
   * Remove a CountingObject from the model
   */
  public removeCountingObject( countingObject: CountingObject ): void {
    this.countingObjects.remove( countingObject );
  }

  /**
   * Remove all CountingObjects from the model.
   */
  public removeAllCountingObjects(): void {
    this.countingObjects.clear();
  }

  /**
   * Given an array of integers, create and add paper numbers for each that are evenly distributed across the screen.
   */
  public addMultipleNumbers( numbers: number[] ): void {
    for ( let i = 0; i < numbers.length; i++ ) {
      const number = numbers[ i ];

      // Ingore 0s
      if ( !number ) { continue; }

      // evenly distribute across the screen
      const x = ScreenView.DEFAULT_LAYOUT_BOUNDS.width * ( 1 + i ) / ( numbers.length + 1 );
      const initialNumberPosition = new Vector2( x, ScreenView.DEFAULT_LAYOUT_BOUNDS.height / 2.5 );
      const countingObject = new CountingObject( number, initialNumberPosition );
      this.addCountingObject( countingObject );
    }
  }

  /**
   * @param availableModelBounds - Constrain the position to be inside these bounds
   * @param countingObject1
   * @param countingObject2
   * @param getRepelOffsets
   */
  public repelAway( availableModelBounds: Bounds2, countingObject1: CountingObject, countingObject2: CountingObject,
                    getRepelOffsets: ( leftCountingObject: CountingObject, rightCountingObject: CountingObject ) => { left: number; right: number } ): void {
    // Determine which are 'left' and 'right'
    const isPaper1Left = countingObject1.positionProperty.value.x < countingObject2.positionProperty.value.x;
    const leftCountingObject = isPaper1Left ? countingObject1 : countingObject2;
    const rightCountingObject = isPaper1Left ? countingObject2 : countingObject1;

    // Determine offsets
    const repelOffsets = getRepelOffsets( leftCountingObject, rightCountingObject );
    const repelLeftOffset = repelOffsets.left;
    const repelRightOffset = repelOffsets.right;
    const leftPosition = leftCountingObject.positionProperty.value.plusXY( repelLeftOffset, 0 );
    const rightPosition = rightCountingObject.positionProperty.value.plusXY( repelRightOffset, 0 );

    // Kick off the animation to the destination
    const animateToDestination = true;
    leftCountingObject.setConstrainedDestination( availableModelBounds, leftPosition, animateToDestination );
    rightCountingObject.setConstrainedDestination( availableModelBounds, rightPosition, animateToDestination );
  }

  /**
   * Updates the total sum of the paper numbers.
   */
  public calculateTotal(): void {
    let total = 0;
    this.countingObjects.filter( countingObject => countingObject.includeInSumProperty.value ).forEach( countingObject => {
      total += countingObject.numberValueProperty.value;
    } );
    this.sumProperty.value = total;
  }

  /**
   * Reset the model
   */
  public reset(): void {
    this.removeAllCountingObjects();
    this.calculateTotal();
    this.resetEmitter.emit();
  }
}

countingCommon.register( 'CountingCommonModel', CountingCommonModel );

export default CountingCommonModel;
