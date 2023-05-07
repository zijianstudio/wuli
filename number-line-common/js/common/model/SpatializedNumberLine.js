// Copyright 2020-2022, University of Colorado Boulder

/**
 * SpatializedNumberLine is a model of a number line that is projected into 2D space.  It also tracks a number of other
 * pieces of information that control how the number line is displayed when presented to the user.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Line } from '../../../../kite/js/imports.js';
import NumberLine from '../../../../number-line-common/js/common/model/NumberLine.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import numberLineCommon from '../../numberLineCommon.js';

class SpatializedNumberLine extends NumberLine {

  /**
   * {Vector2} initialZeroPosition - the position in model space of the zero point on the number line
   * {Object} [options]
   * @public
   */
  constructor( initialZeroPosition, options ) {

    super( options );

    options = merge( {

      // {Orientation} - whether the number line is initially oriented in the horizontal or vertical direction
      initialOrientation: Orientation.HORIZONTAL,

      // {Range} - range of values to be displayed
      initialDisplayedRange: new Range( -10, 10 ),

      // {boolean} - whether point labels should initially be shown
      labelsInitiallyVisible: false,

      // {boolean} - whether tick marks should be initially displayed
      tickMarksInitiallyVisible: false,

      // {boolean} - whether absolute value indicators should be initially displayed
      absoluteValuesInitiallyVisible: false,

      // {number} - The width and height values used when projecting the number line into model space. The default
      // values are pretty arbitrary and at least one of these will generally need to be set. However, if the number
      // line is only ever shown in one orientation, the value corresponding to the other orientation can be left at
      // the default value.
      widthInModelSpace: 100,
      heightInModelSpace: 100,

      // {number} perpendicular distance from number line in model/view coords where points get created
      pointCreationPerpendicularDistance: 60,

      // {number} distance from the end of the number line in model/view coords where points get created
      pointCreationEndDistance: 20,

      // {number} perpendicular distance from number line in model/view coords where points get removed
      pointRemovalPerpendicularDistance: 120,

      // {number} distance from the end of the number line in model/view coords where points get removed
      pointRemovalEndDistance: 25
    }, options );

    // @public {Vector2Property} - center in model space where this number line exists
    this.centerPositionProperty = new Vector2Property( initialZeroPosition );

    // @public {Property} - the value used to scale from model coordinates to number line distance
    this.orientationProperty = new EnumerationProperty( options.initialOrientation );

    // @public {Property.<Range>} - the range of values that should be displayed to the user
    this.displayedRangeProperty = new Property( options.initialDisplayedRange, { valueType: Range } );

    // @public {BooleanProperty} - controls whether point labels are displayed to the user
    this.showPointLabelsProperty = new BooleanProperty( options.labelsInitiallyVisible );

    // @public {BooleanProperty} - controls whether tick marks should be displayed to the user
    this.showTickMarksProperty = new BooleanProperty( options.tickMarksInitiallyVisible );

    // @public {BooleanProperty} - controls whether tick marks should be displayed to the user
    this.showAbsoluteValuesProperty = new BooleanProperty( options.absoluteValuesInitiallyVisible );

    // @public {BooleanProperty} - controls whether tick marks should be displayed to the user
    this.showOppositesProperty = new BooleanProperty( false );

    // @private - 2D scale for transforming between model coordinates and number line position
    this.modelToPositonScale = Vector2.ZERO.copy();
    this.displayedRangeProperty.link( displayedRange => {
      this.modelToPositonScale = new Vector2(
        displayedRange.getLength() / options.widthInModelSpace,
        displayedRange.getLength() / options.heightInModelSpace
      );
    } );

    // @public (read-only) {Property.<Line>} - The line into which the number line is projected in model space. This only
    // includes the displayed range and nothing beyond that.
    this.modelProjectedLineProperty = new DerivedProperty(
      [ this.centerPositionProperty, this.orientationProperty, this.displayedRangeProperty ],
      ( centerPosition, orientation, displayedRange ) => {
        let x1;
        let y1;
        let x2;
        let y2;
        if ( orientation === Orientation.HORIZONTAL ) {
          x1 = centerPosition.x + displayedRange.min / this.modelToPositonScale.x;
          x2 = centerPosition.x + displayedRange.max / this.modelToPositonScale.x;
          y1 = centerPosition.y;
          y2 = centerPosition.y;
        }
        else {
          x1 = centerPosition.x;
          x2 = centerPosition.x;
          y1 = centerPosition.y + displayedRange.min / this.modelToPositonScale.y;
          y2 = centerPosition.y + displayedRange.max / this.modelToPositonScale.y;
        }
        return new Line( new Vector2( x1, y1 ), new Vector2( x2, y2 ) );
      }
    );

    // @private
    this.pointCreationPerpendicularDistance = options.pointCreationPerpendicularDistance;
    this.pointCreationEndDistance = options.pointCreationEndDistance;
    this.pointRemovalPerpendicularDistance = options.pointRemovalPerpendicularDistance;
    this.pointRemovalEndDistance = options.pointRemovalEndDistance;
  }

  /**
   * whether this number line is in the horizontal orientation
   * @returns {boolean}
   * @public
   */
  get isHorizontal() {
    return this.orientationProperty.value === Orientation.HORIZONTAL;
  }

  /**
   * whether this number line is in the horizontal orientation
   * @returns {boolean}
   * @public
   */
  get isVertical() {
    return this.orientationProperty.value === Orientation.VERTICAL;
  }

  /**
   * Project a position in model space into a 1D value on the number line.
   * @param {Vector2} modelPosition
   * @returns {number}
   * @public
   */
  modelPositionToValue( modelPosition ) {
    assert && assert(
      !this.modelToPositonScale.equals( Vector2.ZERO ),
      'must set model display bounds if using this method'
    );
    let numberLineValue;
    if ( this.isHorizontal ) {
      numberLineValue = ( modelPosition.x - this.centerPositionProperty.value.x ) * this.modelToPositonScale.x;
    }
    else {
      numberLineValue = ( modelPosition.y - this.centerPositionProperty.value.y ) * -this.modelToPositonScale.y;
    }

    return numberLineValue;
  }

  /**
   * Convert a value on the number line to a position in 2D model space.
   * @param {number} numberLineValue
   * @returns {Vector2}
   * @public
   */
  valueToModelPosition( numberLineValue ) {

    let modelPosition;
    if ( this.isHorizontal ) {
      modelPosition = new Vector2(
        numberLineValue / this.modelToPositonScale.x + this.centerPositionProperty.value.x,
        this.centerPositionProperty.value.y
      );
    }
    else {
      modelPosition = new Vector2(
        this.centerPositionProperty.value.x,
        numberLineValue / -this.modelToPositonScale.y + this.centerPositionProperty.value.y
      );
    }
    return modelPosition;
  }

  /**
   * Get the positive or negative distance in model space from the zero point on the number line to the provided value.
   * @param numberLineValue
   * @returns {number}
   * @public
   */
  getScaledOffsetFromZero( numberLineValue ) {
    let scaledOffsetFromZero;
    if ( this.isHorizontal ) {
      scaledOffsetFromZero = numberLineValue / this.modelToPositonScale.x;
    }
    else {
      scaledOffsetFromZero = numberLineValue / -this.modelToPositonScale.y;
    }
    return scaledOffsetFromZero;
  }

  /**
   * Whether the provided point controller position is within range for a number line point to be created.
   * @param {Vector2} pointControllerPosition
   * @returns {boolean}
   * @public
   */
  isWithinPointCreationDistance( pointControllerPosition ) {
    return this.isWithinDistance( pointControllerPosition, this.pointCreationPerpendicularDistance, this.pointCreationEndDistance );
  }

  /**
   * Whether the provided point controller position is within range for a number line point to be removed.
   * @param {Vector2} pointControllerPosition
   * @returns {boolean}
   * @public
   */
  isWithinPointRemovalDistance( pointControllerPosition ) {
    return this.isWithinDistance( pointControllerPosition, this.pointRemovalPerpendicularDistance, this.pointRemovalEndDistance );
  }

  /**
   * Check whether the provided point is within the current displayed range of the number line.  The point does not have
   * to be resident on the number line.
   * @param {NumberLinePoint} point
   * @public
   */
  isPointInDisplayedRange( point ) {
    return this.displayedRangeProperty.value.contains( point.valueProperty.value );
  }

  /**
   * Return true if the provided position is within range of the provided distance, false if not.
   * @param {Vector2} pointControllerPosition
   * @param {number} perpendicularDistance
   * @param {number} endDistance
   * @returns {boolean}
   * @public
   */
  isWithinDistance( pointControllerPosition, perpendicularDistance, endDistance ) {
    let testBounds;
    const projectedLine = this.modelProjectedLineProperty.value;
    const lineStart = projectedLine.getStart();
    const lineEnd = projectedLine.getEnd();
    if ( this.isHorizontal ) {
      assert && assert( lineStart.x < lineEnd.x && lineStart.y === lineEnd.y, 'line not as expected' );
      testBounds = new Bounds2(
        lineStart.x - endDistance,
        lineStart.y - perpendicularDistance,
        lineEnd.x + endDistance,
        lineStart.y + perpendicularDistance
      );
    }
    else {
      assert && assert( lineStart.y < lineEnd.y && lineStart.x === lineEnd.x, 'line not as expected' );
      testBounds = new Bounds2(
        lineStart.x - perpendicularDistance,
        lineStart.y - endDistance,
        lineEnd.x + perpendicularDistance,
        lineEnd.y + endDistance
      );
    }
    return testBounds.containsPoint( pointControllerPosition );
  }

  /**
   * See docs in base class.
   * @param {number} proposedValue
   * @returns {number}
   * @override
   * @public
   */
  getConstrainedValue( proposedValue ) {

    // Get the value allowed by the resolution constraint.
    const initiallyConstrainedValue = super.getConstrainedValue( proposedValue );

    // Further constrain the value to the displayed range.
    const displayedRange = this.displayedRangeProperty.value;
    return Utils.clamp( Utils.roundSymmetric( initiallyConstrainedValue ), displayedRange.min, displayedRange.max );
  }

  /**
   * Reset to initial state.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.showAbsoluteValuesProperty.reset();
    this.orientationProperty.reset();
    this.displayedRangeProperty.reset();
    this.showPointLabelsProperty.reset();
    this.showTickMarksProperty.reset();
    this.showOppositesProperty.reset();
  }
}

numberLineCommon.register( 'SpatializedNumberLine', SpatializedNumberLine );
export default SpatializedNumberLine;
