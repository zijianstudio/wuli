// Copyright 2019-2023, University of Colorado Boulder

/**
 * Vector is the model for a vector that can be directly manipulated.  It can be translated and (optionally)
 * scaled and rotated.
 *
 * Extends RootVector but adds the following functionality (annotated in the file):
 *  1. update the tail when the origin moves (modelViewTransformProperty)
 *  2. instantiate x and y component vectors
 *  3. ability to correctly drag the vector by the tail and the tip in both polar and Cartesian mode
 *  4. methods to drop a vector, to animate a vector, and to pop a vector off the graph
 *
 * @author Brandon Li
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import VectorAdditionQueryParameters from '../VectorAdditionQueryParameters.js';
import ComponentVector from './ComponentVector.js';
import ComponentVectorTypes from './ComponentVectorTypes.js';
import CoordinateSnapModes from './CoordinateSnapModes.js';
import GraphOrientations from './GraphOrientations.js';
import RootVector from './RootVector.js';

//----------------------------------------------------------------------------------------
// constants
const AVERAGE_ANIMATION_SPEED = 1600; // in model coordinates
const MIN_ANIMATION_TIME = 0.9; // in seconds

// interval spacing of vector angle (in degrees) when vector is in polar mode
const POLAR_ANGLE_INTERVAL = VectorAdditionConstants.POLAR_ANGLE_INTERVAL;

// fall back symbol for the vector model if a symbol isn't provided. The reason this isn't translatable is:
// https://github.com/phetsims/vector-addition/issues/10.
const VECTOR_FALL_BACK_SYMBOL = 'v';

// maximum amount of dragging before the vector will be removed from the graph when attempting to drag a vector.
// See https://github.com/phetsims/vector-addition/issues/46 for more context.
const VECTOR_DRAG_THRESHOLD = VectorAdditionQueryParameters.vectorDragThreshold;

// distance between a vector's tail or tip to another vector/s tail or tip to snap to the other vectors in polar mode.
const POLAR_SNAP_DISTANCE = VectorAdditionQueryParameters.polarSnapDistance;
export default class Vector extends RootVector {
  /**
   * @param {Vector2} initialTailPosition - starting tail position of the vector
   * @param {Vector2} initialComponents - starting components of the vector
   * @param {Graph} graph - the graph the vector belongs to
   * @param {VectorSet} vectorSet - the vector set the vector belongs to
   * @param {string|null} symbol - the symbol for the vector (i.e. 'a', 'b', 'c', ...)
   * @param {Object} [options] - not propagated to super
   */
  constructor(initialTailPosition, initialComponents, graph, vectorSet, symbol, options) {
    options = merge({
      isTipDraggable: true,
      // {boolean} - flag indicating if the tip can be dragged
      isRemovable: true,
      // {boolean} - flag indicating if the vector can be removed from the graph
      isOnGraphInitially: false // {boolean} - flag indicating if the vector is on the graph upon initialization
    }, options);
    super(initialTailPosition, initialComponents, vectorSet.vectorColorPalette, symbol);

    // @public (read-only) {boolean} indicates if the tip can be dragged
    this.isTipDraggable = options.isTipDraggable;

    // @public (read-only) {boolean} indicates if the vector can be removed
    this.isRemovable = options.isRemovable;

    // @public (read-only) {string} fallBackSymbol (see declaration of VECTOR_FALL_BACK_SYMBOL for documentation)
    this.fallBackSymbol = VECTOR_FALL_BACK_SYMBOL;

    // @protected {Graph} the graph that the vector model belongs to
    this.graph = graph;

    // @protected {VectorSet} the vector set that the vector belongs to
    this.vectorSet = vectorSet;

    // @public (read-only) indicates whether the vector is in on the graph
    this.isOnGraphProperty = new BooleanProperty(options.isOnGraphInitially);

    // @public (read-only) {Animation|null} reference to any animation that is currently in progress
    this.inProgressAnimation = null;

    // @public (read-only) indicates if the vector should be animated back to the toolbox
    this.animateBackProperty = new BooleanProperty(false);

    // @public (read only) the vector's x component vector
    this.xComponentVector = new ComponentVector(this, vectorSet.componentStyleProperty, graph.activeVectorProperty, ComponentVectorTypes.X_COMPONENT);

    // @public (read only) the vector's y component vector
    this.yComponentVector = new ComponentVector(this, vectorSet.componentStyleProperty, graph.activeVectorProperty, ComponentVectorTypes.Y_COMPONENT);

    // When the graph's origin changes, update the tail position. unlink is required on dispose.
    const updateTailPosition = (newModelViewTransform, oldModelViewTransform) => {
      const tailPositionView = oldModelViewTransform.modelToViewPosition(this.tail);
      this.moveToTailPosition(newModelViewTransform.viewToModelPosition(tailPositionView));
    };
    this.graph.modelViewTransformProperty.lazyLink(updateTailPosition);

    // @private
    this.disposeVector = () => {
      this.graph.modelViewTransformProperty.unlink(updateTailPosition);
      this.xComponentVector.dispose();
      this.yComponentVector.dispose();
      this.inProgressAnimation && this.inProgressAnimation.stop();
    };
  }

  /**
   * @public
   */
  dispose() {
    this.disposeVector();
  }

  /**
   * Gets the label content information to be displayed on the vector.
   * See RootVector.getLabelContent for details.
   * @override
   * @public
   * @param {boolean} valuesVisible - whether the values are visible
   * @returns {Object} see RootVector.getLabelContent
   */
  getLabelContent(valuesVisible) {
    // Get the rounded magnitude
    const roundedMagnitude = Utils.toFixed(this.magnitude, VectorAdditionConstants.VECTOR_VALUE_DECIMAL_PLACES);

    // Create flags to indicate the symbol and the value
    let symbol = null;
    let value = null;

    // If the vector has a symbol or is active, the vector always displays a symbol.
    if (this.symbol || this.graph.activeVectorProperty.value === this) {
      symbol = this.symbol || this.fallBackSymbol;
    }

    // If the values are on, the vector always displays a value.
    if (valuesVisible) {
      value = roundedMagnitude;
    }
    return {
      coefficient: null,
      // vector models don't have coefficients
      symbol: symbol,
      value: value,
      includeAbsoluteValueBars: value !== null && symbol !== null // absolute value bars if there is a value
    };
  }

  /**
   * Sets the tip of the vector but ensures the vector satisfies invariants for polar/Cartesian mode.
   * @protected
   *
   * ## Common Invariants (for both Cartesian and polar mode):
   *  - Vector must not be set to the tail (0 magnitude)
   *
   * ## Invariants for Cartesian mode:
   *  - Vector tip must be on an exact model coordinate
   *
   * ## Invariants for polar mode:
   *  - Vector tip must be rounded to ensure the magnitude of the vector is a integer
   *  - Vector tip must be rounded to ensure the vector angle is a multiple of POLAR_ANGLE_INTERVAL
   *
   * @param {Vector2} tipPosition
   */
  setTipWithInvariants(tipPosition) {
    assert && assert(tipPosition instanceof Vector2, `invalid tipPosition: ${tipPosition}`);
    assert && assert(!this.inProgressAnimation, 'this.inProgressAnimation must be false');

    // Flag to get the tip point that satisfies invariants (to be calculated below)
    let tipPositionWithInvariants;
    if (this.graph.coordinateSnapMode === CoordinateSnapModes.CARTESIAN) {
      // Ensure that the tipPosition is on the graph
      const tipPositionOnGraph = this.graph.graphModelBounds.closestPointTo(tipPosition);

      // Round the tip to integer grid values
      tipPositionWithInvariants = tipPositionOnGraph.roundedSymmetric();
    } else if (this.graph.coordinateSnapMode === CoordinateSnapModes.POLAR) {
      const vectorComponents = tipPosition.minus(this.tail);
      const roundedMagnitude = Utils.roundSymmetric(vectorComponents.magnitude);
      const angleInRadians = Utils.toRadians(POLAR_ANGLE_INTERVAL);
      const roundedAngle = angleInRadians * Utils.roundSymmetric(vectorComponents.angle / angleInRadians);

      // Calculate the rounded polar vector
      const polarVector = vectorComponents.setPolar(roundedMagnitude, roundedAngle);

      // Ensure that the new polar vector is in the bounds. Subtract one from the magnitude until the vector is inside
      while (!this.graph.graphModelBounds.containsPoint(this.tail.plus(polarVector))) {
        polarVector.setMagnitude(polarVector.magnitude - 1);
      }
      tipPositionWithInvariants = this.tail.plus(polarVector);
    }

    // Based on the vector orientation, constrain the dragging components
    if (this.graph.orientation === GraphOrientations.HORIZONTAL) {
      tipPositionWithInvariants.setY(this.tailY);
    } else if (this.graph.orientation === GraphOrientations.VERTICAL) {
      tipPositionWithInvariants.setX(this.tailX);
    }

    // Ensure vector tip must not be set to the tail (0 magnitude)
    if (!tipPositionWithInvariants.equals(this.tail)) {
      // Update the model tip
      this.tip = tipPositionWithInvariants;
    }
  }

  /**
   * Sets the tail of the vector but ensures the vector satisfies invariants for polar/Cartesian mode.
   * @private
   *
   * ## Invariants for Cartesian mode:
   *  - Vector tail must be on an exact model coordinate
   *
   * ## Invariants for polar mode:
   *  - Vector's must snap to other vectors to allow tip to tail sum comparisons.
   *    See https://docs.google.com/document/d/1opnDgqIqIroo8VK0CbOyQ5608_g11MSGZXnFlI8k5Ds/edit?ts=5ced51e9#
   *  - Vector tail doesn't have to be on an exact model coordinate, but should when not snapping to other vectors
   *
   * @param {Vector2} tailPosition
   */
  setTailWithInvariants(tailPosition) {
    assert && assert(tailPosition instanceof Vector2, `invalid tailPosition: ${tailPosition}`);
    assert && assert(!this.inProgressAnimation, 'this.inProgressAnimation must be false');
    const constrainedTailBounds = this.getConstrainedTailBounds();

    // Ensure the tail is set in a position so the tail and the tip are on the graph
    const tailPositionOnGraph = constrainedTailBounds.closestPointTo(tailPosition);
    if (this.graph.coordinateSnapMode === CoordinateSnapModes.POLAR) {
      // Get the tip of this vector
      const tipPositionOnGraph = tailPositionOnGraph.plus(this.vectorComponents);

      // Get all the vectors in the vector including the sum and excluding this vector
      const vectorsInVectorSet = this.vectorSet.vectors.filter(vector => {
        return vector !== this;
      });
      vectorsInVectorSet.push(this.vectorSet.sumVector);

      //----------------------------------------------------------------------------------------
      // Vector's must snap to other vectors to allow tip to tail sum comparisons.
      for (let i = 0; i < vectorsInVectorSet.length; i++) {
        const vector = vectorsInVectorSet[i];

        // Snap tail to other vector's tails
        if (vector.tail.distance(tailPositionOnGraph) < POLAR_SNAP_DISTANCE) {
          this.moveToTailPosition(vector.tail);
          return;
        }

        // Snap tail to other vector's tip
        if (vector.tip.distance(tailPositionOnGraph) < POLAR_SNAP_DISTANCE) {
          this.moveToTailPosition(vector.tip);
          return;
        }

        // Snap tip to other vector's tail
        if (vector.tail.distance(tipPositionOnGraph) < POLAR_SNAP_DISTANCE) {
          this.moveToTailPosition(vector.tail.minus(this.vectorComponents));
          return;
        }
      }
    }
    this.moveToTailPosition(tailPositionOnGraph.roundedSymmetric());
  }

  /**
   * Moves the tip to this position but ensures it satisfies invariants for polar and Cartesian mode.
   * @public
   * @param {Vector2} tipPosition
   */
  moveTipToPosition(tipPosition) {
    this.setTipWithInvariants(tipPosition);
  }

  /**
   * Moves the tail to this position but ensures it satisfies invariants for polar and Cartesian mode.
   * @public
   * @param {Vector2} tailPosition
   */
  moveTailToPosition(tailPosition) {
    // Ensure that the tail satisfies invariants for polar/Cartesian mode
    this.setTailWithInvariants(tailPosition);

    // Add ability to remove vectors
    if (this.isRemovable) {
      const constrainedTailBounds = this.getConstrainedTailBounds();

      // Offset of the cursor to the vector. This allows users to remove vectors based on the displacement of the
      // cursor. See https://github.com/phetsims/vector-addition/issues/46#issuecomment-506726262
      const dragOffset = constrainedTailBounds.closestPointTo(tailPosition).minus(tailPosition);
      if (Math.abs(dragOffset.x) > VECTOR_DRAG_THRESHOLD || Math.abs(dragOffset.y) > VECTOR_DRAG_THRESHOLD) {
        this.popOffOfGraph();
      }
    }
  }

  /**
   * Gets the constrained bounds of the tail. The tail must be within VECTOR_TAIL_DRAG_MARGIN units of the edges
   * of the graph. See https://github.com/phetsims/vector-addition/issues/152
   * @private
   */
  getConstrainedTailBounds() {
    return this.graph.graphModelBounds.eroded(VectorAdditionConstants.VECTOR_TAIL_DRAG_MARGIN);
  }

  /**
   * Animates the vector to a specific point. Called when the user fails to drop the vector in the graph.
   * @public
   *
   * @param {Vector2} point - animates the center of the vector to this point
   * @param {Vector2} finalComponents - animates the components to the final components
   * @param {function} finishCallback - callback when the animation finishes naturally, not when stopped
   */
  animateToPoint(point, finalComponents, finishCallback) {
    assert && assert(!this.inProgressAnimation, 'Can\'t animate to position when we are in animation currently');
    assert && assert(!this.isOnGraphProperty.value, 'Can\'t animate when the vector is on the graph');
    assert && assert(point instanceof Vector2, `invalid point: ${point}`);
    assert && assert(finalComponents instanceof Vector2, `invalid finalComponents: ${finalComponents}`);
    assert && assert(typeof finishCallback === 'function', `invalid finishCallback: ${finishCallback}`);

    // Calculate the tail position to animate to
    const tailPosition = point.minus(finalComponents.timesScalar(0.5));
    this.inProgressAnimation = new Animation({
      duration: _.max([MIN_ANIMATION_TIME, this.tail.distance(tailPosition) / AVERAGE_ANIMATION_SPEED]),
      targets: [{
        property: this.tailPositionProperty,
        easing: Easing.QUADRATIC_IN_OUT,
        to: tailPosition
      }, {
        property: this.vectorComponentsProperty,
        easing: Easing.QUADRATIC_IN_OUT,
        to: finalComponents
      }]
    }).start();

    // Called when the animation finishes naturally
    const finishListener = () => {
      this.inProgressAnimation.finishEmitter.removeListener(finishListener);
      this.inProgressAnimation = null;
      finishCallback();
    };
    this.inProgressAnimation.finishEmitter.addListener(finishListener);
  }

  /**
   * Drops the vector onto the graph.
   * @public
   * @param {Vector2} tailPosition - the tail position to drop the vector onto
   */
  dropOntoGraph(tailPosition) {
    assert && assert(!this.isOnGraphProperty.value, 'vector is already on the graph');
    assert && assert(!this.inProgressAnimation, 'cannot drop vector when it\'s animating');
    this.isOnGraphProperty.value = true;

    // Ensure dropped tail position satisfies invariants
    this.setTailWithInvariants(tailPosition);

    // When the vector is first dropped, it is active
    this.graph.activeVectorProperty.value = this;
  }

  /**
   * Pops the vector off of the graph.
   * @public
   */
  popOffOfGraph() {
    assert && assert(this.isOnGraphProperty.value === true, 'attempted pop off graph when vector was already off');
    assert && assert(!this.inProgressAnimation, 'cannot pop vector off when it\'s animating');
    this.isOnGraphProperty.value = false;
    this.graph.activeVectorProperty.value = null;
  }

  /**
   * Sets the offset from the x and y axis that is used for PROJECTION style for component vectors.
   * @param projectionXOffset - x offset, in model coordinates
   * @param projectionYOffset - y offset, in model coordinates
   * @public
   */
  setProjectionOffsets(projectionXOffset, projectionYOffset) {
    this.xComponentVector.setProjectionOffsets(projectionXOffset, projectionYOffset);
    this.yComponentVector.setProjectionOffsets(projectionXOffset, projectionYOffset);
  }
}
vectorAddition.register('Vector', Vector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJVdGlscyIsIlZlY3RvcjIiLCJtZXJnZSIsIkFuaW1hdGlvbiIsIkVhc2luZyIsInZlY3RvckFkZGl0aW9uIiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJWZWN0b3JBZGRpdGlvblF1ZXJ5UGFyYW1ldGVycyIsIkNvbXBvbmVudFZlY3RvciIsIkNvbXBvbmVudFZlY3RvclR5cGVzIiwiQ29vcmRpbmF0ZVNuYXBNb2RlcyIsIkdyYXBoT3JpZW50YXRpb25zIiwiUm9vdFZlY3RvciIsIkFWRVJBR0VfQU5JTUFUSU9OX1NQRUVEIiwiTUlOX0FOSU1BVElPTl9USU1FIiwiUE9MQVJfQU5HTEVfSU5URVJWQUwiLCJWRUNUT1JfRkFMTF9CQUNLX1NZTUJPTCIsIlZFQ1RPUl9EUkFHX1RIUkVTSE9MRCIsInZlY3RvckRyYWdUaHJlc2hvbGQiLCJQT0xBUl9TTkFQX0RJU1RBTkNFIiwicG9sYXJTbmFwRGlzdGFuY2UiLCJWZWN0b3IiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxUYWlsUG9zaXRpb24iLCJpbml0aWFsQ29tcG9uZW50cyIsImdyYXBoIiwidmVjdG9yU2V0Iiwic3ltYm9sIiwib3B0aW9ucyIsImlzVGlwRHJhZ2dhYmxlIiwiaXNSZW1vdmFibGUiLCJpc09uR3JhcGhJbml0aWFsbHkiLCJ2ZWN0b3JDb2xvclBhbGV0dGUiLCJmYWxsQmFja1N5bWJvbCIsImlzT25HcmFwaFByb3BlcnR5IiwiaW5Qcm9ncmVzc0FuaW1hdGlvbiIsImFuaW1hdGVCYWNrUHJvcGVydHkiLCJ4Q29tcG9uZW50VmVjdG9yIiwiY29tcG9uZW50U3R5bGVQcm9wZXJ0eSIsImFjdGl2ZVZlY3RvclByb3BlcnR5IiwiWF9DT01QT05FTlQiLCJ5Q29tcG9uZW50VmVjdG9yIiwiWV9DT01QT05FTlQiLCJ1cGRhdGVUYWlsUG9zaXRpb24iLCJuZXdNb2RlbFZpZXdUcmFuc2Zvcm0iLCJvbGRNb2RlbFZpZXdUcmFuc2Zvcm0iLCJ0YWlsUG9zaXRpb25WaWV3IiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInRhaWwiLCJtb3ZlVG9UYWlsUG9zaXRpb24iLCJ2aWV3VG9Nb2RlbFBvc2l0aW9uIiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJsYXp5TGluayIsImRpc3Bvc2VWZWN0b3IiLCJ1bmxpbmsiLCJkaXNwb3NlIiwic3RvcCIsImdldExhYmVsQ29udGVudCIsInZhbHVlc1Zpc2libGUiLCJyb3VuZGVkTWFnbml0dWRlIiwidG9GaXhlZCIsIm1hZ25pdHVkZSIsIlZFQ1RPUl9WQUxVRV9ERUNJTUFMX1BMQUNFUyIsInZhbHVlIiwiY29lZmZpY2llbnQiLCJpbmNsdWRlQWJzb2x1dGVWYWx1ZUJhcnMiLCJzZXRUaXBXaXRoSW52YXJpYW50cyIsInRpcFBvc2l0aW9uIiwiYXNzZXJ0IiwidGlwUG9zaXRpb25XaXRoSW52YXJpYW50cyIsImNvb3JkaW5hdGVTbmFwTW9kZSIsIkNBUlRFU0lBTiIsInRpcFBvc2l0aW9uT25HcmFwaCIsImdyYXBoTW9kZWxCb3VuZHMiLCJjbG9zZXN0UG9pbnRUbyIsInJvdW5kZWRTeW1tZXRyaWMiLCJQT0xBUiIsInZlY3RvckNvbXBvbmVudHMiLCJtaW51cyIsInJvdW5kU3ltbWV0cmljIiwiYW5nbGVJblJhZGlhbnMiLCJ0b1JhZGlhbnMiLCJyb3VuZGVkQW5nbGUiLCJhbmdsZSIsInBvbGFyVmVjdG9yIiwic2V0UG9sYXIiLCJjb250YWluc1BvaW50IiwicGx1cyIsInNldE1hZ25pdHVkZSIsIm9yaWVudGF0aW9uIiwiSE9SSVpPTlRBTCIsInNldFkiLCJ0YWlsWSIsIlZFUlRJQ0FMIiwic2V0WCIsInRhaWxYIiwiZXF1YWxzIiwidGlwIiwic2V0VGFpbFdpdGhJbnZhcmlhbnRzIiwidGFpbFBvc2l0aW9uIiwiY29uc3RyYWluZWRUYWlsQm91bmRzIiwiZ2V0Q29uc3RyYWluZWRUYWlsQm91bmRzIiwidGFpbFBvc2l0aW9uT25HcmFwaCIsInZlY3RvcnNJblZlY3RvclNldCIsInZlY3RvcnMiLCJmaWx0ZXIiLCJ2ZWN0b3IiLCJwdXNoIiwic3VtVmVjdG9yIiwiaSIsImxlbmd0aCIsImRpc3RhbmNlIiwibW92ZVRpcFRvUG9zaXRpb24iLCJtb3ZlVGFpbFRvUG9zaXRpb24iLCJkcmFnT2Zmc2V0IiwiTWF0aCIsImFicyIsIngiLCJ5IiwicG9wT2ZmT2ZHcmFwaCIsImVyb2RlZCIsIlZFQ1RPUl9UQUlMX0RSQUdfTUFSR0lOIiwiYW5pbWF0ZVRvUG9pbnQiLCJwb2ludCIsImZpbmFsQ29tcG9uZW50cyIsImZpbmlzaENhbGxiYWNrIiwidGltZXNTY2FsYXIiLCJkdXJhdGlvbiIsIl8iLCJtYXgiLCJ0YXJnZXRzIiwicHJvcGVydHkiLCJ0YWlsUG9zaXRpb25Qcm9wZXJ0eSIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJ0byIsInZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eSIsInN0YXJ0IiwiZmluaXNoTGlzdGVuZXIiLCJmaW5pc2hFbWl0dGVyIiwicmVtb3ZlTGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsImRyb3BPbnRvR3JhcGgiLCJzZXRQcm9qZWN0aW9uT2Zmc2V0cyIsInByb2plY3Rpb25YT2Zmc2V0IiwicHJvamVjdGlvbllPZmZzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlY3Rvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWZWN0b3IgaXMgdGhlIG1vZGVsIGZvciBhIHZlY3RvciB0aGF0IGNhbiBiZSBkaXJlY3RseSBtYW5pcHVsYXRlZC4gIEl0IGNhbiBiZSB0cmFuc2xhdGVkIGFuZCAob3B0aW9uYWxseSlcclxuICogc2NhbGVkIGFuZCByb3RhdGVkLlxyXG4gKlxyXG4gKiBFeHRlbmRzIFJvb3RWZWN0b3IgYnV0IGFkZHMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbmFsaXR5IChhbm5vdGF0ZWQgaW4gdGhlIGZpbGUpOlxyXG4gKiAgMS4gdXBkYXRlIHRoZSB0YWlsIHdoZW4gdGhlIG9yaWdpbiBtb3ZlcyAobW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkpXHJcbiAqICAyLiBpbnN0YW50aWF0ZSB4IGFuZCB5IGNvbXBvbmVudCB2ZWN0b3JzXHJcbiAqICAzLiBhYmlsaXR5IHRvIGNvcnJlY3RseSBkcmFnIHRoZSB2ZWN0b3IgYnkgdGhlIHRhaWwgYW5kIHRoZSB0aXAgaW4gYm90aCBwb2xhciBhbmQgQ2FydGVzaWFuIG1vZGVcclxuICogIDQuIG1ldGhvZHMgdG8gZHJvcCBhIHZlY3RvciwgdG8gYW5pbWF0ZSBhIHZlY3RvciwgYW5kIHRvIHBvcCBhIHZlY3RvciBvZmYgdGhlIGdyYXBoXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBbmltYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvQW5pbWF0aW9uLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgdmVjdG9yQWRkaXRpb24gZnJvbSAnLi4vLi4vdmVjdG9yQWRkaXRpb24uanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25Db25zdGFudHMgZnJvbSAnLi4vVmVjdG9yQWRkaXRpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25RdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vVmVjdG9yQWRkaXRpb25RdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgQ29tcG9uZW50VmVjdG9yIGZyb20gJy4vQ29tcG9uZW50VmVjdG9yLmpzJztcclxuaW1wb3J0IENvbXBvbmVudFZlY3RvclR5cGVzIGZyb20gJy4vQ29tcG9uZW50VmVjdG9yVHlwZXMuanMnO1xyXG5pbXBvcnQgQ29vcmRpbmF0ZVNuYXBNb2RlcyBmcm9tICcuL0Nvb3JkaW5hdGVTbmFwTW9kZXMuanMnO1xyXG5pbXBvcnQgR3JhcGhPcmllbnRhdGlvbnMgZnJvbSAnLi9HcmFwaE9yaWVudGF0aW9ucy5qcyc7XHJcbmltcG9ydCBSb290VmVjdG9yIGZyb20gJy4vUm9vdFZlY3Rvci5qcyc7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEFWRVJBR0VfQU5JTUFUSU9OX1NQRUVEID0gMTYwMDsgLy8gaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuY29uc3QgTUlOX0FOSU1BVElPTl9USU1FID0gMC45OyAvLyBpbiBzZWNvbmRzXHJcblxyXG4vLyBpbnRlcnZhbCBzcGFjaW5nIG9mIHZlY3RvciBhbmdsZSAoaW4gZGVncmVlcykgd2hlbiB2ZWN0b3IgaXMgaW4gcG9sYXIgbW9kZVxyXG5jb25zdCBQT0xBUl9BTkdMRV9JTlRFUlZBTCA9IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlBPTEFSX0FOR0xFX0lOVEVSVkFMO1xyXG5cclxuLy8gZmFsbCBiYWNrIHN5bWJvbCBmb3IgdGhlIHZlY3RvciBtb2RlbCBpZiBhIHN5bWJvbCBpc24ndCBwcm92aWRlZC4gVGhlIHJlYXNvbiB0aGlzIGlzbid0IHRyYW5zbGF0YWJsZSBpczpcclxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvMTAuXHJcbmNvbnN0IFZFQ1RPUl9GQUxMX0JBQ0tfU1lNQk9MID0gJ3YnO1xyXG5cclxuLy8gbWF4aW11bSBhbW91bnQgb2YgZHJhZ2dpbmcgYmVmb3JlIHRoZSB2ZWN0b3Igd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGdyYXBoIHdoZW4gYXR0ZW1wdGluZyB0byBkcmFnIGEgdmVjdG9yLlxyXG4vLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvNDYgZm9yIG1vcmUgY29udGV4dC5cclxuY29uc3QgVkVDVE9SX0RSQUdfVEhSRVNIT0xEID0gVmVjdG9yQWRkaXRpb25RdWVyeVBhcmFtZXRlcnMudmVjdG9yRHJhZ1RocmVzaG9sZDtcclxuXHJcbi8vIGRpc3RhbmNlIGJldHdlZW4gYSB2ZWN0b3IncyB0YWlsIG9yIHRpcCB0byBhbm90aGVyIHZlY3Rvci9zIHRhaWwgb3IgdGlwIHRvIHNuYXAgdG8gdGhlIG90aGVyIHZlY3RvcnMgaW4gcG9sYXIgbW9kZS5cclxuY29uc3QgUE9MQVJfU05BUF9ESVNUQU5DRSA9IFZlY3RvckFkZGl0aW9uUXVlcnlQYXJhbWV0ZXJzLnBvbGFyU25hcERpc3RhbmNlO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVjdG9yIGV4dGVuZHMgUm9vdFZlY3RvciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbFRhaWxQb3NpdGlvbiAtIHN0YXJ0aW5nIHRhaWwgcG9zaXRpb24gb2YgdGhlIHZlY3RvclxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gaW5pdGlhbENvbXBvbmVudHMgLSBzdGFydGluZyBjb21wb25lbnRzIG9mIHRoZSB2ZWN0b3JcclxuICAgKiBAcGFyYW0ge0dyYXBofSBncmFwaCAtIHRoZSBncmFwaCB0aGUgdmVjdG9yIGJlbG9uZ3MgdG9cclxuICAgKiBAcGFyYW0ge1ZlY3RvclNldH0gdmVjdG9yU2V0IC0gdGhlIHZlY3RvciBzZXQgdGhlIHZlY3RvciBiZWxvbmdzIHRvXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc3ltYm9sIC0gdGhlIHN5bWJvbCBmb3IgdGhlIHZlY3RvciAoaS5lLiAnYScsICdiJywgJ2MnLCAuLi4pXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIG5vdCBwcm9wYWdhdGVkIHRvIHN1cGVyXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxUYWlsUG9zaXRpb24sIGluaXRpYWxDb21wb25lbnRzLCBncmFwaCwgdmVjdG9yU2V0LCBzeW1ib2wsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGlzVGlwRHJhZ2dhYmxlOiB0cnVlLCAvLyB7Ym9vbGVhbn0gLSBmbGFnIGluZGljYXRpbmcgaWYgdGhlIHRpcCBjYW4gYmUgZHJhZ2dlZFxyXG4gICAgICBpc1JlbW92YWJsZTogdHJ1ZSwgLy8ge2Jvb2xlYW59IC0gZmxhZyBpbmRpY2F0aW5nIGlmIHRoZSB2ZWN0b3IgY2FuIGJlIHJlbW92ZWQgZnJvbSB0aGUgZ3JhcGhcclxuICAgICAgaXNPbkdyYXBoSW5pdGlhbGx5OiBmYWxzZSAvLyB7Ym9vbGVhbn0gLSBmbGFnIGluZGljYXRpbmcgaWYgdGhlIHZlY3RvciBpcyBvbiB0aGUgZ3JhcGggdXBvbiBpbml0aWFsaXphdGlvblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBpbml0aWFsVGFpbFBvc2l0aW9uLCBpbml0aWFsQ29tcG9uZW50cywgdmVjdG9yU2V0LnZlY3RvckNvbG9yUGFsZXR0ZSwgc3ltYm9sICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Ym9vbGVhbn0gaW5kaWNhdGVzIGlmIHRoZSB0aXAgY2FuIGJlIGRyYWdnZWRcclxuICAgIHRoaXMuaXNUaXBEcmFnZ2FibGUgPSBvcHRpb25zLmlzVGlwRHJhZ2dhYmxlO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge2Jvb2xlYW59IGluZGljYXRlcyBpZiB0aGUgdmVjdG9yIGNhbiBiZSByZW1vdmVkXHJcbiAgICB0aGlzLmlzUmVtb3ZhYmxlID0gb3B0aW9ucy5pc1JlbW92YWJsZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtzdHJpbmd9IGZhbGxCYWNrU3ltYm9sIChzZWUgZGVjbGFyYXRpb24gb2YgVkVDVE9SX0ZBTExfQkFDS19TWU1CT0wgZm9yIGRvY3VtZW50YXRpb24pXHJcbiAgICB0aGlzLmZhbGxCYWNrU3ltYm9sID0gVkVDVE9SX0ZBTExfQkFDS19TWU1CT0w7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCB7R3JhcGh9IHRoZSBncmFwaCB0aGF0IHRoZSB2ZWN0b3IgbW9kZWwgYmVsb25ncyB0b1xyXG4gICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge1ZlY3RvclNldH0gdGhlIHZlY3RvciBzZXQgdGhhdCB0aGUgdmVjdG9yIGJlbG9uZ3MgdG9cclxuICAgIHRoaXMudmVjdG9yU2V0ID0gdmVjdG9yU2V0O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgaW5kaWNhdGVzIHdoZXRoZXIgdGhlIHZlY3RvciBpcyBpbiBvbiB0aGUgZ3JhcGhcclxuICAgIHRoaXMuaXNPbkdyYXBoUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLmlzT25HcmFwaEluaXRpYWxseSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0FuaW1hdGlvbnxudWxsfSByZWZlcmVuY2UgdG8gYW55IGFuaW1hdGlvbiB0aGF0IGlzIGN1cnJlbnRseSBpbiBwcm9ncmVzc1xyXG4gICAgdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGluZGljYXRlcyBpZiB0aGUgdmVjdG9yIHNob3VsZCBiZSBhbmltYXRlZCBiYWNrIHRvIHRoZSB0b29sYm94XHJcbiAgICB0aGlzLmFuaW1hdGVCYWNrUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQgb25seSkgdGhlIHZlY3RvcidzIHggY29tcG9uZW50IHZlY3RvclxyXG4gICAgdGhpcy54Q29tcG9uZW50VmVjdG9yID0gbmV3IENvbXBvbmVudFZlY3RvciggdGhpcyxcclxuICAgICAgdmVjdG9yU2V0LmNvbXBvbmVudFN0eWxlUHJvcGVydHksXHJcbiAgICAgIGdyYXBoLmFjdGl2ZVZlY3RvclByb3BlcnR5LFxyXG4gICAgICBDb21wb25lbnRWZWN0b3JUeXBlcy5YX0NPTVBPTkVOVFxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkIG9ubHkpIHRoZSB2ZWN0b3IncyB5IGNvbXBvbmVudCB2ZWN0b3JcclxuICAgIHRoaXMueUNvbXBvbmVudFZlY3RvciA9IG5ldyBDb21wb25lbnRWZWN0b3IoIHRoaXMsXHJcbiAgICAgIHZlY3RvclNldC5jb21wb25lbnRTdHlsZVByb3BlcnR5LFxyXG4gICAgICBncmFwaC5hY3RpdmVWZWN0b3JQcm9wZXJ0eSxcclxuICAgICAgQ29tcG9uZW50VmVjdG9yVHlwZXMuWV9DT01QT05FTlRcclxuICAgICk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgZ3JhcGgncyBvcmlnaW4gY2hhbmdlcywgdXBkYXRlIHRoZSB0YWlsIHBvc2l0aW9uLiB1bmxpbmsgaXMgcmVxdWlyZWQgb24gZGlzcG9zZS5cclxuICAgIGNvbnN0IHVwZGF0ZVRhaWxQb3NpdGlvbiA9ICggbmV3TW9kZWxWaWV3VHJhbnNmb3JtLCBvbGRNb2RlbFZpZXdUcmFuc2Zvcm0gKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRhaWxQb3NpdGlvblZpZXcgPSBvbGRNb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGhpcy50YWlsICk7XHJcbiAgICAgIHRoaXMubW92ZVRvVGFpbFBvc2l0aW9uKCBuZXdNb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdGFpbFBvc2l0aW9uVmlldyApICk7XHJcbiAgICB9O1xyXG4gICAgdGhpcy5ncmFwaC5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlVGFpbFBvc2l0aW9uICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZVZlY3RvciA9ICgpID0+IHtcclxuICAgICAgdGhpcy5ncmFwaC5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZVRhaWxQb3NpdGlvbiApO1xyXG4gICAgICB0aGlzLnhDb21wb25lbnRWZWN0b3IuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLnlDb21wb25lbnRWZWN0b3IuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb24gJiYgdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZVZlY3RvcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbGFiZWwgY29udGVudCBpbmZvcm1hdGlvbiB0byBiZSBkaXNwbGF5ZWQgb24gdGhlIHZlY3Rvci5cclxuICAgKiBTZWUgUm9vdFZlY3Rvci5nZXRMYWJlbENvbnRlbnQgZm9yIGRldGFpbHMuXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWVzVmlzaWJsZSAtIHdoZXRoZXIgdGhlIHZhbHVlcyBhcmUgdmlzaWJsZVxyXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHNlZSBSb290VmVjdG9yLmdldExhYmVsQ29udGVudFxyXG4gICAqL1xyXG4gIGdldExhYmVsQ29udGVudCggdmFsdWVzVmlzaWJsZSApIHtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHJvdW5kZWQgbWFnbml0dWRlXHJcbiAgICBjb25zdCByb3VuZGVkTWFnbml0dWRlID0gVXRpbHMudG9GaXhlZCggdGhpcy5tYWduaXR1ZGUsIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlZFQ1RPUl9WQUxVRV9ERUNJTUFMX1BMQUNFUyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBmbGFncyB0byBpbmRpY2F0ZSB0aGUgc3ltYm9sIGFuZCB0aGUgdmFsdWVcclxuICAgIGxldCBzeW1ib2wgPSBudWxsO1xyXG4gICAgbGV0IHZhbHVlID0gbnVsbDtcclxuXHJcbiAgICAvLyBJZiB0aGUgdmVjdG9yIGhhcyBhIHN5bWJvbCBvciBpcyBhY3RpdmUsIHRoZSB2ZWN0b3IgYWx3YXlzIGRpc3BsYXlzIGEgc3ltYm9sLlxyXG4gICAgaWYgKCB0aGlzLnN5bWJvbCB8fCB0aGlzLmdyYXBoLmFjdGl2ZVZlY3RvclByb3BlcnR5LnZhbHVlID09PSB0aGlzICkge1xyXG4gICAgICBzeW1ib2wgPSAoIHRoaXMuc3ltYm9sIHx8IHRoaXMuZmFsbEJhY2tTeW1ib2wgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiB0aGUgdmFsdWVzIGFyZSBvbiwgdGhlIHZlY3RvciBhbHdheXMgZGlzcGxheXMgYSB2YWx1ZS5cclxuICAgIGlmICggdmFsdWVzVmlzaWJsZSApIHtcclxuICAgICAgdmFsdWUgPSByb3VuZGVkTWFnbml0dWRlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvZWZmaWNpZW50OiBudWxsLCAvLyB2ZWN0b3IgbW9kZWxzIGRvbid0IGhhdmUgY29lZmZpY2llbnRzXHJcbiAgICAgIHN5bWJvbDogc3ltYm9sLFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIGluY2x1ZGVBYnNvbHV0ZVZhbHVlQmFyczogKCB2YWx1ZSAhPT0gbnVsbCAmJiBzeW1ib2wgIT09IG51bGwgKSAvLyBhYnNvbHV0ZSB2YWx1ZSBiYXJzIGlmIHRoZXJlIGlzIGEgdmFsdWVcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSB0aXAgb2YgdGhlIHZlY3RvciBidXQgZW5zdXJlcyB0aGUgdmVjdG9yIHNhdGlzZmllcyBpbnZhcmlhbnRzIGZvciBwb2xhci9DYXJ0ZXNpYW4gbW9kZS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICpcclxuICAgKiAjIyBDb21tb24gSW52YXJpYW50cyAoZm9yIGJvdGggQ2FydGVzaWFuIGFuZCBwb2xhciBtb2RlKTpcclxuICAgKiAgLSBWZWN0b3IgbXVzdCBub3QgYmUgc2V0IHRvIHRoZSB0YWlsICgwIG1hZ25pdHVkZSlcclxuICAgKlxyXG4gICAqICMjIEludmFyaWFudHMgZm9yIENhcnRlc2lhbiBtb2RlOlxyXG4gICAqICAtIFZlY3RvciB0aXAgbXVzdCBiZSBvbiBhbiBleGFjdCBtb2RlbCBjb29yZGluYXRlXHJcbiAgICpcclxuICAgKiAjIyBJbnZhcmlhbnRzIGZvciBwb2xhciBtb2RlOlxyXG4gICAqICAtIFZlY3RvciB0aXAgbXVzdCBiZSByb3VuZGVkIHRvIGVuc3VyZSB0aGUgbWFnbml0dWRlIG9mIHRoZSB2ZWN0b3IgaXMgYSBpbnRlZ2VyXHJcbiAgICogIC0gVmVjdG9yIHRpcCBtdXN0IGJlIHJvdW5kZWQgdG8gZW5zdXJlIHRoZSB2ZWN0b3IgYW5nbGUgaXMgYSBtdWx0aXBsZSBvZiBQT0xBUl9BTkdMRV9JTlRFUlZBTFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB0aXBQb3NpdGlvblxyXG4gICAqL1xyXG4gIHNldFRpcFdpdGhJbnZhcmlhbnRzKCB0aXBQb3NpdGlvbiApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aXBQb3NpdGlvbiBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIHRpcFBvc2l0aW9uOiAke3RpcFBvc2l0aW9ufWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb24sICd0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb24gbXVzdCBiZSBmYWxzZScgKTtcclxuXHJcbiAgICAvLyBGbGFnIHRvIGdldCB0aGUgdGlwIHBvaW50IHRoYXQgc2F0aXNmaWVzIGludmFyaWFudHMgKHRvIGJlIGNhbGN1bGF0ZWQgYmVsb3cpXHJcbiAgICBsZXQgdGlwUG9zaXRpb25XaXRoSW52YXJpYW50cztcclxuXHJcbiAgICBpZiAoIHRoaXMuZ3JhcGguY29vcmRpbmF0ZVNuYXBNb2RlID09PSBDb29yZGluYXRlU25hcE1vZGVzLkNBUlRFU0lBTiApIHtcclxuXHJcbiAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSB0aXBQb3NpdGlvbiBpcyBvbiB0aGUgZ3JhcGhcclxuICAgICAgY29uc3QgdGlwUG9zaXRpb25PbkdyYXBoID0gdGhpcy5ncmFwaC5ncmFwaE1vZGVsQm91bmRzLmNsb3Nlc3RQb2ludFRvKCB0aXBQb3NpdGlvbiApO1xyXG5cclxuICAgICAgLy8gUm91bmQgdGhlIHRpcCB0byBpbnRlZ2VyIGdyaWQgdmFsdWVzXHJcbiAgICAgIHRpcFBvc2l0aW9uV2l0aEludmFyaWFudHMgPSB0aXBQb3NpdGlvbk9uR3JhcGgucm91bmRlZFN5bW1ldHJpYygpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuZ3JhcGguY29vcmRpbmF0ZVNuYXBNb2RlID09PSBDb29yZGluYXRlU25hcE1vZGVzLlBPTEFSICkge1xyXG5cclxuICAgICAgY29uc3QgdmVjdG9yQ29tcG9uZW50cyA9IHRpcFBvc2l0aW9uLm1pbnVzKCB0aGlzLnRhaWwgKTtcclxuXHJcbiAgICAgIGNvbnN0IHJvdW5kZWRNYWduaXR1ZGUgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmVjdG9yQ29tcG9uZW50cy5tYWduaXR1ZGUgKTtcclxuXHJcbiAgICAgIGNvbnN0IGFuZ2xlSW5SYWRpYW5zID0gVXRpbHMudG9SYWRpYW5zKCBQT0xBUl9BTkdMRV9JTlRFUlZBTCApO1xyXG4gICAgICBjb25zdCByb3VuZGVkQW5nbGUgPSBhbmdsZUluUmFkaWFucyAqIFV0aWxzLnJvdW5kU3ltbWV0cmljKCB2ZWN0b3JDb21wb25lbnRzLmFuZ2xlIC8gYW5nbGVJblJhZGlhbnMgKTtcclxuXHJcbiAgICAgIC8vIENhbGN1bGF0ZSB0aGUgcm91bmRlZCBwb2xhciB2ZWN0b3JcclxuICAgICAgY29uc3QgcG9sYXJWZWN0b3IgPSB2ZWN0b3JDb21wb25lbnRzLnNldFBvbGFyKCByb3VuZGVkTWFnbml0dWRlLCByb3VuZGVkQW5nbGUgKTtcclxuXHJcbiAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBuZXcgcG9sYXIgdmVjdG9yIGlzIGluIHRoZSBib3VuZHMuIFN1YnRyYWN0IG9uZSBmcm9tIHRoZSBtYWduaXR1ZGUgdW50aWwgdGhlIHZlY3RvciBpcyBpbnNpZGVcclxuICAgICAgd2hpbGUgKCAhdGhpcy5ncmFwaC5ncmFwaE1vZGVsQm91bmRzLmNvbnRhaW5zUG9pbnQoIHRoaXMudGFpbC5wbHVzKCBwb2xhclZlY3RvciApICkgKSB7XHJcbiAgICAgICAgcG9sYXJWZWN0b3Iuc2V0TWFnbml0dWRlKCBwb2xhclZlY3Rvci5tYWduaXR1ZGUgLSAxICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRpcFBvc2l0aW9uV2l0aEludmFyaWFudHMgPSB0aGlzLnRhaWwucGx1cyggcG9sYXJWZWN0b3IgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBCYXNlZCBvbiB0aGUgdmVjdG9yIG9yaWVudGF0aW9uLCBjb25zdHJhaW4gdGhlIGRyYWdnaW5nIGNvbXBvbmVudHNcclxuICAgIGlmICggdGhpcy5ncmFwaC5vcmllbnRhdGlvbiA9PT0gR3JhcGhPcmllbnRhdGlvbnMuSE9SSVpPTlRBTCApIHtcclxuICAgICAgdGlwUG9zaXRpb25XaXRoSW52YXJpYW50cy5zZXRZKCB0aGlzLnRhaWxZICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5ncmFwaC5vcmllbnRhdGlvbiA9PT0gR3JhcGhPcmllbnRhdGlvbnMuVkVSVElDQUwgKSB7XHJcbiAgICAgIHRpcFBvc2l0aW9uV2l0aEludmFyaWFudHMuc2V0WCggdGhpcy50YWlsWCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEVuc3VyZSB2ZWN0b3IgdGlwIG11c3Qgbm90IGJlIHNldCB0byB0aGUgdGFpbCAoMCBtYWduaXR1ZGUpXHJcbiAgICBpZiAoICF0aXBQb3NpdGlvbldpdGhJbnZhcmlhbnRzLmVxdWFscyggdGhpcy50YWlsICkgKSB7XHJcbiAgICAgIC8vIFVwZGF0ZSB0aGUgbW9kZWwgdGlwXHJcbiAgICAgIHRoaXMudGlwID0gdGlwUG9zaXRpb25XaXRoSW52YXJpYW50cztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIHRhaWwgb2YgdGhlIHZlY3RvciBidXQgZW5zdXJlcyB0aGUgdmVjdG9yIHNhdGlzZmllcyBpbnZhcmlhbnRzIGZvciBwb2xhci9DYXJ0ZXNpYW4gbW9kZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogIyMgSW52YXJpYW50cyBmb3IgQ2FydGVzaWFuIG1vZGU6XHJcbiAgICogIC0gVmVjdG9yIHRhaWwgbXVzdCBiZSBvbiBhbiBleGFjdCBtb2RlbCBjb29yZGluYXRlXHJcbiAgICpcclxuICAgKiAjIyBJbnZhcmlhbnRzIGZvciBwb2xhciBtb2RlOlxyXG4gICAqICAtIFZlY3RvcidzIG11c3Qgc25hcCB0byBvdGhlciB2ZWN0b3JzIHRvIGFsbG93IHRpcCB0byB0YWlsIHN1bSBjb21wYXJpc29ucy5cclxuICAgKiAgICBTZWUgaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vZG9jdW1lbnQvZC8xb3BuRGdxSXFJcm9vOFZLMENiT3lRNTYwOF9nMTFNU0daWG5GbEk4azVEcy9lZGl0P3RzPTVjZWQ1MWU5I1xyXG4gICAqICAtIFZlY3RvciB0YWlsIGRvZXNuJ3QgaGF2ZSB0byBiZSBvbiBhbiBleGFjdCBtb2RlbCBjb29yZGluYXRlLCBidXQgc2hvdWxkIHdoZW4gbm90IHNuYXBwaW5nIHRvIG90aGVyIHZlY3RvcnNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gdGFpbFBvc2l0aW9uXHJcbiAgICovXHJcbiAgc2V0VGFpbFdpdGhJbnZhcmlhbnRzKCB0YWlsUG9zaXRpb24gKSB7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFpbFBvc2l0aW9uIGluc3RhbmNlb2YgVmVjdG9yMiwgYGludmFsaWQgdGFpbFBvc2l0aW9uOiAke3RhaWxQb3NpdGlvbn1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uLCAndGhpcy5pblByb2dyZXNzQW5pbWF0aW9uIG11c3QgYmUgZmFsc2UnICk7XHJcblxyXG4gICAgY29uc3QgY29uc3RyYWluZWRUYWlsQm91bmRzID0gdGhpcy5nZXRDb25zdHJhaW5lZFRhaWxCb3VuZHMoKTtcclxuXHJcbiAgICAvLyBFbnN1cmUgdGhlIHRhaWwgaXMgc2V0IGluIGEgcG9zaXRpb24gc28gdGhlIHRhaWwgYW5kIHRoZSB0aXAgYXJlIG9uIHRoZSBncmFwaFxyXG4gICAgY29uc3QgdGFpbFBvc2l0aW9uT25HcmFwaCA9IGNvbnN0cmFpbmVkVGFpbEJvdW5kcy5jbG9zZXN0UG9pbnRUbyggdGFpbFBvc2l0aW9uICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLmdyYXBoLmNvb3JkaW5hdGVTbmFwTW9kZSA9PT0gQ29vcmRpbmF0ZVNuYXBNb2Rlcy5QT0xBUiApIHtcclxuXHJcbiAgICAgIC8vIEdldCB0aGUgdGlwIG9mIHRoaXMgdmVjdG9yXHJcbiAgICAgIGNvbnN0IHRpcFBvc2l0aW9uT25HcmFwaCA9IHRhaWxQb3NpdGlvbk9uR3JhcGgucGx1cyggdGhpcy52ZWN0b3JDb21wb25lbnRzICk7XHJcblxyXG4gICAgICAvLyBHZXQgYWxsIHRoZSB2ZWN0b3JzIGluIHRoZSB2ZWN0b3IgaW5jbHVkaW5nIHRoZSBzdW0gYW5kIGV4Y2x1ZGluZyB0aGlzIHZlY3RvclxyXG4gICAgICBjb25zdCB2ZWN0b3JzSW5WZWN0b3JTZXQgPSB0aGlzLnZlY3RvclNldC52ZWN0b3JzLmZpbHRlciggdmVjdG9yID0+IHtcclxuICAgICAgICByZXR1cm4gdmVjdG9yICE9PSB0aGlzO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHZlY3RvcnNJblZlY3RvclNldC5wdXNoKCB0aGlzLnZlY3RvclNldC5zdW1WZWN0b3IgKTtcclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBWZWN0b3IncyBtdXN0IHNuYXAgdG8gb3RoZXIgdmVjdG9ycyB0byBhbGxvdyB0aXAgdG8gdGFpbCBzdW0gY29tcGFyaXNvbnMuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHZlY3RvcnNJblZlY3RvclNldC5sZW5ndGg7IGkrKyApIHtcclxuXHJcbiAgICAgICAgY29uc3QgdmVjdG9yID0gdmVjdG9yc0luVmVjdG9yU2V0WyBpIF07XHJcblxyXG4gICAgICAgIC8vIFNuYXAgdGFpbCB0byBvdGhlciB2ZWN0b3IncyB0YWlsc1xyXG4gICAgICAgIGlmICggdmVjdG9yLnRhaWwuZGlzdGFuY2UoIHRhaWxQb3NpdGlvbk9uR3JhcGggKSA8IFBPTEFSX1NOQVBfRElTVEFOQ0UgKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdmVUb1RhaWxQb3NpdGlvbiggdmVjdG9yLnRhaWwgKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNuYXAgdGFpbCB0byBvdGhlciB2ZWN0b3IncyB0aXBcclxuICAgICAgICBpZiAoIHZlY3Rvci50aXAuZGlzdGFuY2UoIHRhaWxQb3NpdGlvbk9uR3JhcGggKSA8IFBPTEFSX1NOQVBfRElTVEFOQ0UgKSB7XHJcbiAgICAgICAgICB0aGlzLm1vdmVUb1RhaWxQb3NpdGlvbiggdmVjdG9yLnRpcCApO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU25hcCB0aXAgdG8gb3RoZXIgdmVjdG9yJ3MgdGFpbFxyXG4gICAgICAgIGlmICggdmVjdG9yLnRhaWwuZGlzdGFuY2UoIHRpcFBvc2l0aW9uT25HcmFwaCApIDwgUE9MQVJfU05BUF9ESVNUQU5DRSApIHtcclxuICAgICAgICAgIHRoaXMubW92ZVRvVGFpbFBvc2l0aW9uKCB2ZWN0b3IudGFpbC5taW51cyggdGhpcy52ZWN0b3JDb21wb25lbnRzICkgKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLm1vdmVUb1RhaWxQb3NpdGlvbiggdGFpbFBvc2l0aW9uT25HcmFwaC5yb3VuZGVkU3ltbWV0cmljKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSB0aXAgdG8gdGhpcyBwb3NpdGlvbiBidXQgZW5zdXJlcyBpdCBzYXRpc2ZpZXMgaW52YXJpYW50cyBmb3IgcG9sYXIgYW5kIENhcnRlc2lhbiBtb2RlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHRpcFBvc2l0aW9uXHJcbiAgICovXHJcbiAgbW92ZVRpcFRvUG9zaXRpb24oIHRpcFBvc2l0aW9uICkge1xyXG4gICAgdGhpcy5zZXRUaXBXaXRoSW52YXJpYW50cyggdGlwUG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSB0YWlsIHRvIHRoaXMgcG9zaXRpb24gYnV0IGVuc3VyZXMgaXQgc2F0aXNmaWVzIGludmFyaWFudHMgZm9yIHBvbGFyIGFuZCBDYXJ0ZXNpYW4gbW9kZS5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB0YWlsUG9zaXRpb25cclxuICAgKi9cclxuICBtb3ZlVGFpbFRvUG9zaXRpb24oIHRhaWxQb3NpdGlvbiApIHtcclxuXHJcbiAgICAvLyBFbnN1cmUgdGhhdCB0aGUgdGFpbCBzYXRpc2ZpZXMgaW52YXJpYW50cyBmb3IgcG9sYXIvQ2FydGVzaWFuIG1vZGVcclxuICAgIHRoaXMuc2V0VGFpbFdpdGhJbnZhcmlhbnRzKCB0YWlsUG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBBZGQgYWJpbGl0eSB0byByZW1vdmUgdmVjdG9yc1xyXG4gICAgaWYgKCB0aGlzLmlzUmVtb3ZhYmxlICkge1xyXG4gICAgICBjb25zdCBjb25zdHJhaW5lZFRhaWxCb3VuZHMgPSB0aGlzLmdldENvbnN0cmFpbmVkVGFpbEJvdW5kcygpO1xyXG5cclxuICAgICAgLy8gT2Zmc2V0IG9mIHRoZSBjdXJzb3IgdG8gdGhlIHZlY3Rvci4gVGhpcyBhbGxvd3MgdXNlcnMgdG8gcmVtb3ZlIHZlY3RvcnMgYmFzZWQgb24gdGhlIGRpc3BsYWNlbWVudCBvZiB0aGVcclxuICAgICAgLy8gY3Vyc29yLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvNDYjaXNzdWVjb21tZW50LTUwNjcyNjI2MlxyXG4gICAgICBjb25zdCBkcmFnT2Zmc2V0ID0gY29uc3RyYWluZWRUYWlsQm91bmRzLmNsb3Nlc3RQb2ludFRvKCB0YWlsUG9zaXRpb24gKS5taW51cyggdGFpbFBvc2l0aW9uICk7XHJcblxyXG4gICAgICBpZiAoIE1hdGguYWJzKCBkcmFnT2Zmc2V0LnggKSA+IFZFQ1RPUl9EUkFHX1RIUkVTSE9MRCB8fCBNYXRoLmFicyggZHJhZ09mZnNldC55ICkgPiBWRUNUT1JfRFJBR19USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgdGhpcy5wb3BPZmZPZkdyYXBoKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIGNvbnN0cmFpbmVkIGJvdW5kcyBvZiB0aGUgdGFpbC4gVGhlIHRhaWwgbXVzdCBiZSB3aXRoaW4gVkVDVE9SX1RBSUxfRFJBR19NQVJHSU4gdW5pdHMgb2YgdGhlIGVkZ2VzXHJcbiAgICogb2YgdGhlIGdyYXBoLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3ZlY3Rvci1hZGRpdGlvbi9pc3N1ZXMvMTUyXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRDb25zdHJhaW5lZFRhaWxCb3VuZHMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ncmFwaC5ncmFwaE1vZGVsQm91bmRzLmVyb2RlZCggVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVkVDVE9SX1RBSUxfRFJBR19NQVJHSU4gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFuaW1hdGVzIHRoZSB2ZWN0b3IgdG8gYSBzcGVjaWZpYyBwb2ludC4gQ2FsbGVkIHdoZW4gdGhlIHVzZXIgZmFpbHMgdG8gZHJvcCB0aGUgdmVjdG9yIGluIHRoZSBncmFwaC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHBvaW50IC0gYW5pbWF0ZXMgdGhlIGNlbnRlciBvZiB0aGUgdmVjdG9yIHRvIHRoaXMgcG9pbnRcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGZpbmFsQ29tcG9uZW50cyAtIGFuaW1hdGVzIHRoZSBjb21wb25lbnRzIHRvIHRoZSBmaW5hbCBjb21wb25lbnRzXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gZmluaXNoQ2FsbGJhY2sgLSBjYWxsYmFjayB3aGVuIHRoZSBhbmltYXRpb24gZmluaXNoZXMgbmF0dXJhbGx5LCBub3Qgd2hlbiBzdG9wcGVkXHJcbiAgICovXHJcbiAgYW5pbWF0ZVRvUG9pbnQoIHBvaW50LCBmaW5hbENvbXBvbmVudHMsIGZpbmlzaENhbGxiYWNrICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb24sICdDYW5cXCd0IGFuaW1hdGUgdG8gcG9zaXRpb24gd2hlbiB3ZSBhcmUgaW4gYW5pbWF0aW9uIGN1cnJlbnRseScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmlzT25HcmFwaFByb3BlcnR5LnZhbHVlLCAnQ2FuXFwndCBhbmltYXRlIHdoZW4gdGhlIHZlY3RvciBpcyBvbiB0aGUgZ3JhcGgnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb2ludCBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIHBvaW50OiAke3BvaW50fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZpbmFsQ29tcG9uZW50cyBpbnN0YW5jZW9mIFZlY3RvcjIsIGBpbnZhbGlkIGZpbmFsQ29tcG9uZW50czogJHtmaW5hbENvbXBvbmVudHN9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIGZpbmlzaENhbGxiYWNrID09PSAnZnVuY3Rpb24nLCBgaW52YWxpZCBmaW5pc2hDYWxsYmFjazogJHtmaW5pc2hDYWxsYmFja31gICk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSB0YWlsIHBvc2l0aW9uIHRvIGFuaW1hdGUgdG9cclxuICAgIGNvbnN0IHRhaWxQb3NpdGlvbiA9IHBvaW50Lm1pbnVzKCBmaW5hbENvbXBvbmVudHMudGltZXNTY2FsYXIoIDAuNSApICk7XHJcblxyXG4gICAgdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBkdXJhdGlvbjogXy5tYXgoIFsgTUlOX0FOSU1BVElPTl9USU1FLCB0aGlzLnRhaWwuZGlzdGFuY2UoIHRhaWxQb3NpdGlvbiApIC8gQVZFUkFHRV9BTklNQVRJT05fU1BFRUQgXSApLFxyXG4gICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICBwcm9wZXJ0eTogdGhpcy50YWlsUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VULFxyXG4gICAgICAgIHRvOiB0YWlsUG9zaXRpb25cclxuICAgICAgfSwge1xyXG4gICAgICAgIHByb3BlcnR5OiB0aGlzLnZlY3RvckNvbXBvbmVudHNQcm9wZXJ0eSxcclxuICAgICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VULFxyXG4gICAgICAgIHRvOiBmaW5hbENvbXBvbmVudHNcclxuICAgICAgfSBdXHJcbiAgICB9ICkuc3RhcnQoKTtcclxuXHJcbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzIG5hdHVyYWxseVxyXG4gICAgY29uc3QgZmluaXNoTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvbi5maW5pc2hFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBmaW5pc2hMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICBmaW5pc2hDYWxsYmFjaygpO1xyXG4gICAgfTtcclxuICAgIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCBmaW5pc2hMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHJvcHMgdGhlIHZlY3RvciBvbnRvIHRoZSBncmFwaC5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSB0YWlsUG9zaXRpb24gLSB0aGUgdGFpbCBwb3NpdGlvbiB0byBkcm9wIHRoZSB2ZWN0b3Igb250b1xyXG4gICAqL1xyXG4gIGRyb3BPbnRvR3JhcGgoIHRhaWxQb3NpdGlvbiApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc09uR3JhcGhQcm9wZXJ0eS52YWx1ZSwgJ3ZlY3RvciBpcyBhbHJlYWR5IG9uIHRoZSBncmFwaCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb24sICdjYW5ub3QgZHJvcCB2ZWN0b3Igd2hlbiBpdFxcJ3MgYW5pbWF0aW5nJyApO1xyXG5cclxuICAgIHRoaXMuaXNPbkdyYXBoUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG5cclxuICAgIC8vIEVuc3VyZSBkcm9wcGVkIHRhaWwgcG9zaXRpb24gc2F0aXNmaWVzIGludmFyaWFudHNcclxuICAgIHRoaXMuc2V0VGFpbFdpdGhJbnZhcmlhbnRzKCB0YWlsUG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB2ZWN0b3IgaXMgZmlyc3QgZHJvcHBlZCwgaXQgaXMgYWN0aXZlXHJcbiAgICB0aGlzLmdyYXBoLmFjdGl2ZVZlY3RvclByb3BlcnR5LnZhbHVlID0gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBvcHMgdGhlIHZlY3RvciBvZmYgb2YgdGhlIGdyYXBoLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBwb3BPZmZPZkdyYXBoKCkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNPbkdyYXBoUHJvcGVydHkudmFsdWUgPT09IHRydWUsICdhdHRlbXB0ZWQgcG9wIG9mZiBncmFwaCB3aGVuIHZlY3RvciB3YXMgYWxyZWFkeSBvZmYnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uLCAnY2Fubm90IHBvcCB2ZWN0b3Igb2ZmIHdoZW4gaXRcXCdzIGFuaW1hdGluZycgKTtcclxuXHJcbiAgICB0aGlzLmlzT25HcmFwaFByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB0aGlzLmdyYXBoLmFjdGl2ZVZlY3RvclByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIG9mZnNldCBmcm9tIHRoZSB4IGFuZCB5IGF4aXMgdGhhdCBpcyB1c2VkIGZvciBQUk9KRUNUSU9OIHN0eWxlIGZvciBjb21wb25lbnQgdmVjdG9ycy5cclxuICAgKiBAcGFyYW0gcHJvamVjdGlvblhPZmZzZXQgLSB4IG9mZnNldCwgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0gcHJvamVjdGlvbllPZmZzZXQgLSB5IG9mZnNldCwgaW4gbW9kZWwgY29vcmRpbmF0ZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0UHJvamVjdGlvbk9mZnNldHMoIHByb2plY3Rpb25YT2Zmc2V0LCBwcm9qZWN0aW9uWU9mZnNldCApIHtcclxuICAgIHRoaXMueENvbXBvbmVudFZlY3Rvci5zZXRQcm9qZWN0aW9uT2Zmc2V0cyggcHJvamVjdGlvblhPZmZzZXQsIHByb2plY3Rpb25ZT2Zmc2V0ICk7XHJcbiAgICB0aGlzLnlDb21wb25lbnRWZWN0b3Iuc2V0UHJvamVjdGlvbk9mZnNldHMoIHByb2plY3Rpb25YT2Zmc2V0LCBwcm9qZWN0aW9uWU9mZnNldCApO1xyXG4gIH1cclxufVxyXG5cclxudmVjdG9yQWRkaXRpb24ucmVnaXN0ZXIoICdWZWN0b3InLCBWZWN0b3IgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxTQUFTLE1BQU0sbUNBQW1DO0FBQ3pELE9BQU9DLE1BQU0sTUFBTSxnQ0FBZ0M7QUFDbkQsT0FBT0MsY0FBYyxNQUFNLHlCQUF5QjtBQUNwRCxPQUFPQyx1QkFBdUIsTUFBTSwrQkFBK0I7QUFDbkUsT0FBT0MsNkJBQTZCLE1BQU0scUNBQXFDO0FBQy9FLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0Msb0JBQW9CLE1BQU0sMkJBQTJCO0FBQzVELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjs7QUFFeEM7QUFDQTtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ3RDLE1BQU1DLGtC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