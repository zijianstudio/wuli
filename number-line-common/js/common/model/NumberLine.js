// Copyright 2020-2021, University of Colorado Boulder

/**
 * NumberLine is a simple model of a number line.  It tracks points that are on the line, and those points can be added
 * and removed.  Since the line is one-dimensional, the points have only a single value.  This model is a somewhat
 * "pure" representation of a number line in the sense that it is not projected into space, nor is it limited in its
 * span.  Other subclasses add that functionality.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import numberLineCommon from '../../numberLineCommon.js';
import NumberLinePoint from './NumberLinePoint.js';

class NumberLine {

  /**
   * {Object} [options]
   * @public
   */
  constructor( options ) {

    options = merge( {

      // {{initialValue:number, color:Color}[]} - array of point specifications that describe what points should exist
      // on the number line when constructed and after a reset
      initialPointSpecs: [],

      // {function(number):number} - constraint for values that points can take on, integer values by default
      constrainPointValue: proposedValue => Utils.roundSymmetric( proposedValue ),

      preventOverlap: true
    }, options );

    // @private {Object{ initialValue, color}[]} - array of point specifications that describe what points should
    // exist on the number line when constructed and after a reset
    this.initialPointSpecs = options.initialPointSpecs;

    // @private {function(number):number}
    this.constrainPointValue = options.constrainPointValue;

    // @public (read-only) {ObservableArrayDef.<NumberLinePoint>} - array of points on this number line
    this.residentPoints = createObservableArray();

    // Hook up a listener to make sure that the points don't land on top of one another.
    this.residentPoints.addItemAddedListener( addedPoint => {

      // listener to make sure point lands in a good point when released
      const pointIsDraggingListener = dragging => {

        // Do nothing if dragging, or if this is the only point at this position, or if overlap is allowed.
        if ( dragging || !options.preventOverlap || this.getPointsAt( addedPoint.valueProperty.value ).length <= 1 ) {
          return;
        }

        // There is already a point at this position, so we have to choose another.
        let beginningValue = addedPoint.mostRecentlyProposedValue;
        if ( beginningValue === null ) {
          beginningValue = addedPoint.valueProperty.value;
        }
        addedPoint.valueProperty.value = this.getNearestUnoccupiedValue( beginningValue );
      };
      addedPoint.isDraggingProperty.link( pointIsDraggingListener );

      // Remove the listener when the point is removed from the number line.
      const pointRemovalListener = removedPoint => {
        if ( removedPoint === addedPoint ) {
          removedPoint.isDraggingProperty.unlink( pointIsDraggingListener );
          this.residentPoints.removeItemRemovedListener( pointRemovalListener );
        }
      };
      this.residentPoints.addItemRemovedListener( pointRemovalListener );
    } );

    // Add the initial points.
    this.addInitialPoints();
  }

  /**
   * Add the initial set of points to the number line, used during construction and reset/
   * @private
   */
  addInitialPoints() {
    this.initialPointSpecs.forEach( pointSpec => {
      assert && assert( !this.hasPointAt( pointSpec.initialValue ), 'a point already exists at the specified location' );
      this.addPoint( new NumberLinePoint( this, {
        initialValue: pointSpec.initialValue,
        initialColor: pointSpec.color
      } ) );
    } );
  }

  /**
   * Add a point to the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  addPoint( numberLinePoint ) {
    this.residentPoints.add( numberLinePoint );
  }

  /**
   * Remove a point from the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  removePoint( numberLinePoint ) {
    this.residentPoints.remove( numberLinePoint );
  }

  /**
   * Check whether a specific instance of a number line point is on this number line.
   * @param {NumberLinePoint} numberLinePoint
   * @returns {boolean}
   * @public
   */
  hasPoint( numberLinePoint ) {
    return this.residentPoints.includes( numberLinePoint );
  }

  /**
   * Remove all points from the number line.
   * @public
   */
  removeAllPoints() {
    this.residentPoints.clear();
  }

  /**
   * Given a floating point number, return the closest integer value that is allowed on the number line.
   * @param {number} proposedValue
   * @returns {number}
   * @public
   */
  getConstrainedValue( proposedValue ) {
    return this.constrainPointValue( proposedValue );
  }

  /**
   * Returns true if any of the resident points on the number line are at the provided value.
   * @param {number} value
   * @returns {boolean}
   * @public
   */
  hasPointAt( value ) {
    return this.residentPoints.some( point => point.valueProperty.value === value );
  }

  /**
   * Get a list of all points at the provided value.
   * @param {number} value
   * @returns {NumberLinePoint[]}
   * @private
   */
  getPointsAt( value ) {
    return this.residentPoints.filter( point => point.valueProperty.value === value );
  }

  /**
   * Get the closest valid value that isn't already occupied by a point.
   * @param {number} value
   * @public
   */
  getNearestUnoccupiedValue( value ) {
    const roundedValue = Utils.roundSymmetric( value );
    let currentDistance = 0;
    const getValidValuesAtDistance = distance => {
      return [ roundedValue - distance, roundedValue + distance ]
        .filter( newValue => !this.hasPointAt( newValue ) && this.displayedRangeProperty.value.contains( newValue ) );
    };
    let validValues = getValidValuesAtDistance( currentDistance );
    while ( validValues.length === 0 ) {
      currentDistance++;
      validValues = getValidValuesAtDistance( currentDistance );
    }
    return _.sortBy( validValues, [ validValue => Math.abs( validValue - value ) ] )[ 0 ];
  }

  /**
   * Reset to initial state.
   * @public
   */
  reset() {
    this.removeAllPoints();
    this.addInitialPoints();
  }
}

numberLineCommon.register( 'NumberLine', NumberLine );
export default NumberLine;
