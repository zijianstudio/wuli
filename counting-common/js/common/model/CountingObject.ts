// Copyright 2021-2023, University of Colorado Boulder

/**
 * Represents a number ranging from 1 to 9999, that the user can interact with. Contains multiple "base numbers"
 * for each non-zero digit.
 *
 * @author Sharfudeen Ashraf
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import countingCommon from '../../countingCommon.js';
import CountingCommonConstants from '../CountingCommonConstants.js';
import CountingCommonUtils from '../CountingCommonUtils.js';
import BaseNumber, { SingleDigit } from './BaseNumber.js';
import Easing from '../../../../twixt/js/Easing.js';
import Animation from '../../../../twixt/js/Animation.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import TProperty from '../../../../axon/js/TProperty.js';

type CountingObjectOptions = {
  groupingEnabledProperty?: TReadOnlyProperty<boolean>;
};
type SetDestinationOptions = {
  targetScale?: number;
  targetHandleOpacity?: number;
  useStandardAnimationSpeed?: boolean;
  animationDuration?: number;
};

// Incremented for CountingObject IDs
let nextCountingObjectId = 1;

class CountingObject {

  // IDs required for map-like lookup, see https://github.com/phetsims/make-a-ten/issues/199
  public readonly id: number;

  // The number that this model represents, e.g. 324
  public readonly numberValueProperty: TProperty<number>;

  // Property that indicates where in model space the upper left corner of this shape is. In general, this should not
  // be set directly outside of this type, and should be manipulated through the methods defined below.
  public readonly positionProperty: TProperty<Vector2>;

  // Flag that tracks whether the user is dragging this number around. Should be set externally, generally by the
  // view node.
  public readonly userControlledProperty: TProperty<boolean>;

  // If we are animating, this is the animation destination. null if not animating.
  private _destination: Vector2 | null;

  // Whether this element is animating from one position to another, do not set externally.
  private animating: boolean;

  // Represents the non-zero place values in this number. 1034 will have three place values, 4, 30 and 1000, which
  // when summed will equal our number. Smallest place values are first in the array.
  public baseNumbers: BaseNumber[];

  // Fires when the animation towards our destination ends (we hit our destination).
  public readonly endAnimationEmitter: TEmitter<[ CountingObject ]>;

  // our scale, used for animations
  public readonly scaleProperty: TProperty<number>;

  // the opacity of the handle, if one exists. used for animations
  public readonly handleOpacityProperty: TProperty<number>;

  // whether the value of this paper number should be included in the sum of the model
  public readonly includeInSumProperty: TProperty<boolean>;

  // store any animations so we can check if one is still running
  private animation: Animation | null;

  // whether grouping is enabled, which determines if this paper number is allowed to combine with others. groupable
  // objects also have a background, non-groupable objects do not.
  public readonly groupingEnabledProperty: TReadOnlyProperty<boolean>;

  // local bounds, also set later by the view
  public localBounds: Bounds2;

  // bounds that should be used when animating. updated when the view is created
  public returnAnimationBounds: Bounds2;

  // Emitter that can notify the view for this CountingObject that it should move to the front of its Node layer.
  public readonly moveToFrontEmitter: TEmitter;

  /**
   * @param numberValue - Numeric value, e.g. 123
   * @param initialPosition
   * @param [providedOptions]
   */
  public constructor( numberValue: number, initialPosition: Vector2, providedOptions?: CountingObjectOptions ) {

    const options = optionize<CountingObjectOptions, CountingObjectOptions>()( {
      groupingEnabledProperty: new BooleanProperty( true )
    }, providedOptions );

    this.id = nextCountingObjectId++;
    this.numberValueProperty = new NumberProperty( numberValue );
    this.positionProperty = new Vector2Property( initialPosition.copy() );
    this.userControlledProperty = new BooleanProperty( false );
    this.scaleProperty = new NumberProperty( 1 );
    this.handleOpacityProperty = new NumberProperty( 1 );
    this.groupingEnabledProperty = options.groupingEnabledProperty;
    this.includeInSumProperty = new BooleanProperty( true );
    this._destination = null;
    this.animating = false;
    this.animation = null;
    this.baseNumbers = CountingObject.getBaseNumbers( this.numberValueProperty.value );
    this.endAnimationEmitter = new Emitter( { parameters: [ { valueType: CountingObject } ] } );
    this.localBounds = this.baseNumbers[ this.baseNumbers.length - 1 ].bounds;
    this.returnAnimationBounds = this.localBounds;
    this.moveToFrontEmitter = new Emitter();
  }

  /**
   * The number of digits in the number, including zeros, e.g. 1204 has 4 digits.
   */
  public get digitLength(): number {
    assert && assert( this.numberValueProperty.value > 0 );

    return CountingCommonUtils.digitsInNumber( this.numberValueProperty.value );
  }

  /**
   * Getter for our animating state.
   */
  public get isAnimating(): boolean {
    return this.animating;
  }

  /**
   * Getter for our animation destination, null if not animating.
   */
  public get destination(): Vector2 | null {
    assert && assert( !!this._destination === this.animating, 'we only have a destination if we are animating' );
    return this._destination;
  }

  /**
   * Locate the boundary between the "move" input area and "split" input area, in the number's local bounds or provided
   * bounds.
   */
  public getBoundaryY(): number {
    const moveToSplitRatio = CountingCommonConstants.SPLIT_BOUNDARY_HEIGHT_PROPORTION;
    return this.localBounds.maxY * ( 1 - moveToSplitRatio ) + this.localBounds.minY * moveToSplitRatio;
  }

  /**
   * Returns the ideal spot to "drag" a number from (near the center of its move target) relative to its origin.
   */
  public getDragTargetOffset(): Vector2 {
    return this.localBounds.center.plusXY( 0, 0.15 * this.localBounds.height );
  }

  /**
   * Changes the number that this paper number represents.
   */
  public changeNumber( numberValue: number ): void {
    this.baseNumbers = CountingObject.getBaseNumbers( numberValue );
    this.numberValueProperty.value = numberValue;
  }

  /**
   * Sets the destination of the number. If animate is false, it also sets the position.
   *
   * @param destination
   * @param animate - Whether to animate. If true, it will slide towards the destination. If false, it will immediately
   *                  set the position to be the same as the destination.
   * @param [providedOptions]
   */
  public setDestination( destination: Vector2, animate: boolean, providedOptions?: SetDestinationOptions ): void {
    assert && assert( destination.isFinite() );

    const options = optionize<SetDestinationOptions>()( {
      targetScale: 1,
      targetHandleOpacity: 1,
      useStandardAnimationSpeed: true,
      animationDuration: 0.5
    }, providedOptions );

    if ( animate ) {
      this.animating = true;
      this._destination = destination;

      this.animation && this.animation.stop();
      const distance = this.positionProperty.value.distance( destination );
      const standardSpeedAnimationDuration =
        CountingCommonConstants.ANIMATION_TIME_RANGE.constrainValue( distance / CountingCommonConstants.ANIMATION_SPEED );

      // calculate the time needed to get to the destination
      const animationDuration = options.useStandardAnimationSpeed ? standardSpeedAnimationDuration : options.animationDuration;

      this.animation = new Animation( {
        duration: animationDuration,
        targets: [ {
          property: this.positionProperty,
          to: destination,
          easing: Easing.QUADRATIC_IN_OUT
        }, {
          property: this.scaleProperty,
          to: options.targetScale,
          from: this.scaleProperty.value
        }, {
          property: this.handleOpacityProperty,
          to: options.targetHandleOpacity,
          from: this.handleOpacityProperty.value
        } ]
      } );

      this.animation.start();
      this.animation.finishEmitter.addListener( () => {
        this.animating = false;
        this._destination = null;
        this.endAnimationEmitter.emit( this );
        this.animation = null;
      } );
    }
    else {
      this.positionProperty.value = destination;
      this.scaleProperty.value = options.targetScale;
    }
  }

  /**
   * If our paper number is outside the available view bounds, move it inside those bounds.
   *
   * @param viewBounds
   * @param newDestination
   * @param [animate] - Indicates if the new constrained position should be directly set or animated
   */
  public setConstrainedDestination( viewBounds: Bounds2, newDestination: Vector2, animate = false ): void {
    const originBounds = this.getOriginBounds( viewBounds );
    this.setDestination( originBounds.closestPointTo( newDestination ), animate );
  }

  /**
   * Determine how our number's origin can be placed in the provided bounds.
   */
  public getOriginBounds( viewBounds: Bounds2 ): Bounds2 {
    return new Bounds2(
      viewBounds.left - this.localBounds.left,
      viewBounds.top - this.localBounds.top,
      viewBounds.right - this.localBounds.right,
      viewBounds.bottom - this.localBounds.bottom
    ).eroded( CountingCommonConstants.COUNTING_AREA_MARGIN );
  }

  /**
   * Returns the lowest place number whose bounds include the position.
   *
   * @param position - Position relative to this number's origin.
   */
  public getBaseNumberAt( position: Vector2 ): BaseNumber {
    for ( let i = 0; i < this.baseNumbers.length; i++ ) {
      assert && assert( i === 0 || this.baseNumbers[ i ].place > this.baseNumbers[ i - 1 ].place,
        'Ensure that we start at lower places, required for this to work properly' );

      const baseNumber = this.baseNumbers[ i ];

      if ( baseNumber.bounds.containsPoint( position ) ) {
        return baseNumber;
      }
    }

    // Outside of the bounds, so we need to check each and determine the closest.
    for ( let i = 0; i < this.baseNumbers.length; i++ ) {
      const baseNumber = this.baseNumbers[ i ];
      if ( position.x > baseNumber.bounds.left ) {
        return baseNumber;
      }
    }

    // Default the largest one.
    return this.baseNumbers[ this.baseNumbers.length - 1 ];
  }

  /**
   * Given a number, returns an array of BaseNumbers that will represent the digit places.
   *
   * @param number - The number we want to break into digit places.
   */
  public static getBaseNumbers( number: number ): BaseNumber[] {
    assert && assert( number > 0 && number % 1 === 0 );

    const result = [];

    // Divide by 10 each loop, using the remainder and place index to create the place numbers.
    let remainder = number;
    let place = 0;
    while ( remainder !== 0 ) {
      const digit = remainder % 10;
      if ( digit !== 0 ) {
        result.push( new BaseNumber( digit as SingleDigit, place ) );
      }

      remainder = ( remainder - digit ) / 10;
      place++;
    }

    return result;
  }

  public dispose(): void {
    this.numberValueProperty.dispose();
    this.positionProperty.dispose();
    this.userControlledProperty.dispose();
    this.scaleProperty.dispose();
    this.handleOpacityProperty.dispose();
    this.includeInSumProperty.dispose();
    this.moveToFrontEmitter.dispose();
  }

}

countingCommon.register( 'CountingObject', CountingObject );

export default CountingObject;
