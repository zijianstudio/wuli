// Copyright 2019-2023, University of Colorado Boulder

/**
 * The model for a DraggableTenFrameNode
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2Property from '../../../../dot/js/Vector2Property.js';
import TenFrameNode from '../../common/view/TenFrameNode.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import Disposable from '../../../../axon/js/Disposable.js';

// constants
const SQUARE_SIDE_LENGTH = 60;
const LINE_WIDTH = 1;
const NUMBER_OF_SPOTS = 10;
const PUSH_AWAY_MARGIN = 10;

class TenFrame extends Disposable {
  public readonly countingObjects: ObservableArray<CountingObject>;
  public readonly spotCenters: Vector2[];
  public readonly positionProperty: Vector2Property;
  public readonly scaleProperty: NumberProperty;
  public readonly localBounds: Bounds2;
  private readonly originBounds: Bounds2;

  // the side length of the squares that make up the ten frame
  public static readonly SQUARE_SIDE_LENGTH = SQUARE_SIDE_LENGTH;

  public constructor( initialPosition: Vector2 ) {
    super();

    this.countingObjects = createObservableArray();

    this.spotCenters = TenFrameNode.getSpotCenters( {
      sideLength: SQUARE_SIDE_LENGTH,
      lineWidth: LINE_WIDTH
    } );

    this.localBounds = TenFrameNode.getTenFramePath( {
      sideLength: SQUARE_SIDE_LENGTH,
      lineWidth: LINE_WIDTH
    } ).localBounds;

    this.positionProperty = new Vector2Property( initialPosition );
    this.scaleProperty = new NumberProperty( 1, {
      range: new Range( 0, 1 )
    } );

    this.originBounds = new Bounds2( 0, 0, 0, 0 );
  }

  public isFull(): boolean {
    return this.countingObjects.length === NUMBER_OF_SPOTS;
  }

  public addCountingObject( countingObject: CountingObject ): void {
    assert && assert( !this.containsCountingObject( countingObject ) );
    assert && assert( this.countingObjects.length < NUMBER_OF_SPOTS, 'cannot add countingObject to full tenFrame' );
    this.countingObjects.add( countingObject );
  }

  /**
   * Sends the provided countingObject outside the nearest border of this ten frame
   */
  public pushAwayCountingObject( countingObject: CountingObject, countingAreaBounds: Bounds2 ): void {
    assert && assert( this.isCountingObjectOnTopOf( countingObject ),
      'attempted to push away countingObject that was not over ten frame' );

    // Bounds of this tenFrame in countingArea view coords, offset to the center of the provided countingObject.
    const tenFrameBounds = this.localBounds.shifted( this.positionProperty.value )

      // BIG NOTE HERE: We want to compare based on the visual center, so shift the whole tenFrame to account for it.
      // When trying to instead handle this by shifting the countingObject position, there were too many cases to
      // adjust for each potential destination (or MK isn't talented enough to figure out how).
      .shiftedXY( -countingObject.localBounds.center.x, -countingObject.localBounds.center.y );

    const countingObjectBounds = countingObject.localBounds;
    const countingObjectCenter = countingObjectBounds.center;

    // Adjust bounds based on the actual bounds of the provided countingObject, plus a bit of a margin.
    const containingBounds = new Bounds2( tenFrameBounds.minX, tenFrameBounds.minY, tenFrameBounds.maxX, tenFrameBounds.maxY )
      .dilatedXY( countingObjectBounds.width / 2 + PUSH_AWAY_MARGIN, countingObjectBounds.height / 2 + PUSH_AWAY_MARGIN );

    const countingAreaBoundsErodedHalfOfCountingObject = countingAreaBounds.erodedXY( countingObjectBounds.width / 2, countingObjectBounds.height / 2 );

    // find the shortest distance to the edge of the tenFrame
    const countingObjectCenterPosition = countingObject.positionProperty.value;

    // Get a list of all possible destinations, which will always be in cardinal direction, because of Euclidean geometry.
    const potentialDestinations = this.getCardinalPointsFromBounds( countingObjectCenterPosition, containingBounds );

    // sort it by distance, smallest first
    const sorted = _.sortBy( potentialDestinations, a => a.distance( countingObjectCenterPosition ) );

    // iterate through the other three to see which are in bounds
    for ( let i = 0; i < sorted.length; i++ ) {
      const potentialDestination = sorted[ i ];

      // BIG NOTE HERE: add back the center for comparison to ensure that the bounds works as expected. Shrugging over here. . .
      if ( countingAreaBoundsErodedHalfOfCountingObject.containsPoint( potentialDestination.plus( countingObjectCenter ) ) ) {

        // send the countingObject to the closest destination
        countingObject.setConstrainedDestination( countingAreaBounds, potentialDestination, true );
        break; // we found our next closest point
      }
    }
  }

  // Too manual and unhelpful to put in Bounds2 directly
  private getCardinalPointsFromBounds( point: Vector2, bounds: Bounds2 ): [ Vector2, Vector2, Vector2, Vector2 ] {
    return [
      new Vector2( bounds.minX, point.y ),
      new Vector2( bounds.maxX, point.y ),
      new Vector2( point.x, bounds.minY ),
      new Vector2( point.x, bounds.maxY )
    ];
  }

  public removeCountingObject(): void {
    this.countingObjects.pop();
  }

  public containsCountingObject( countingObject: CountingObject ): boolean {
    return this.countingObjects.includes( countingObject );
  }

  /**
   * Is the center of the provided countingObject over this tenFrame.
   */
  public isCountingObjectOnTopOf( countingObject: CountingObject ): boolean {

    // bounds of this tenFrame with respect to the center of the provided countingObject
    const globalBounds = this.localBounds.shifted( this.positionProperty.value )
      .shiftedXY( -countingObject.localBounds.center.x, -countingObject.localBounds.center.y );
    const countingObjectPosition = countingObject.positionProperty.value;

    return globalBounds.containsPoint( countingObjectPosition );
  }

  /**
   * Determine how this ten frame's origin can be placed in the provided bounds.
   */
  public getOriginBounds( viewBounds: Bounds2 ): Bounds2 {
    this.originBounds.minX = viewBounds.left - this.localBounds.left;
    this.originBounds.minY = viewBounds.top - this.localBounds.top;
    this.originBounds.maxX = viewBounds.right - this.localBounds.right;
    this.originBounds.maxY = viewBounds.bottom - this.localBounds.bottom;
    return this.originBounds.erode( CountingCommonConstants.COUNTING_AREA_MARGIN );
  }

  /**
   * If this ten frame outside the available view bounds, move in inside those bounds. Also move any countingObjects
   * that it contains.
   */
  public setConstrainedDestination( viewBounds: Bounds2, newDestination: Vector2 ): void {
    const originBounds = this.getOriginBounds( viewBounds );
    this.positionProperty.value = originBounds.closestPointTo( newDestination );

    this.countingObjects.forEach( countingObject => {
      countingObject.setDestination( this.getCountingObjectSpot( countingObject ), false );
    } );
  }

  /**
   * Calculates the position of the given paper number in the ten frame based on its index in the array
   */
  public getCountingObjectSpot( countingObject: CountingObject ): Vector2 {
    const countingObjectSpotLocalPosition = this.spotCenters[ this.countingObjects.indexOf( countingObject ) ];
    const countingObjectSpotCenter = this.positionProperty.value.plus( countingObjectSpotLocalPosition );

    const countingObjectOffset = countingObject.localBounds.center;
    return countingObjectSpotCenter.minus( countingObjectOffset );
  }

  public override dispose(): void {
    this.countingObjects.dispose();
    this.positionProperty.dispose();
    this.scaleProperty.dispose();
    super.dispose();
  }
}

numberSuiteCommon.register( 'TenFrame', TenFrame );
export default TenFrame;