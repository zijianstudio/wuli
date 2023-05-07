// Copyright 2020-2022, University of Colorado Boulder

/**
 * A PointController is a model element that is used to control points on a number line, but can exist independently
 * too. In some use cases, it will create a point on a number line when it gets within a certain distance of it.  In
 * other use cases, it is permanently locked to a number line and a point that it is controlling.
 *
 * One implication of the fact that point controllers can attach to and detach from number lines is that sometimes,
 * despite the name, an instance can be in a state where it isn't controlling any points.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Saurabh Totey
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import NumberLinePoint from '../../../../number-line-common/js/common/model/NumberLinePoint.js';
import merge from '../../../../phet-core/js/merge.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import numberLineCommon from '../../numberLineCommon.js';
import LockToNumberLine from './LockToNumberLine.js';

// constants
const AVERAGE_ANIMATION_SPEED = 1000; // screen coordinates per second
const MIN_ANIMATION_TIME = 0.3; // in seconds

class PointController {
  /**
   * @param {Object} [options]
   * @public
   */
  constructor(options) {
    options = merge({
      // color used when represented in the view
      color: 'black',
      // {number} - offset in model coords from a horizontal number line when controlling a point
      offsetFromHorizontalNumberLine: 50,
      // {number} - offset in model coords from a vertical number line when controlling a point
      offsetFromVerticalNumberLine: 52,
      // {number} - scale of controller node when animated back into box
      scaleInBox: 1.0,
      // {LockToNumberLine} - Controls whether this point controller is, or can, lock to the number line.
      lockToNumberLine: LockToNumberLine.WHEN_CLOSE,
      // {NumberLine[]} - the number lines on which this controller can add points, can be empty if this controller
      // never adds or removes points from the number line
      numberLines: [],
      // {NumberLinePoint[]} - the points on the number line that are currently being controlled, can be empty
      numberLinePoints: [],
      // {boolean} - controls whether movements of the controlled number line point(s) should cause this point
      // controller to also move
      bidirectionalAssociation: true
    }, options);

    // @private
    this.offsetFromHorizontalNumberLine = options.offsetFromHorizontalNumberLine;
    this.offsetFromVerticalNumberLine = options.offsetFromVerticalNumberLine;
    this.lockToNumberLine = options.lockToNumberLine;
    this.bidirectionalAssociation = options.bidirectionalAssociation;

    // @public (read-only) {NumberLine[]}
    this.numberLines = options.numberLines;

    // @public (read-only) {Vector2Property} - position of this point in model space
    this.positionProperty = new Vector2Property(Vector2.ZERO, {
      // Allowing reentry is necessary because of two-way position relationship with number line points.
      reentrant: true
    });

    // @private - the scale of this point controller when stored away
    this.scaleInBox = options.scaleInBox;

    // @public (read-only) {NumberProperty} - scale of this point
    this.scaleProperty = new NumberProperty(this.scaleInBox);

    // @public {BooleanProperty} - indicates whether this is being dragged by the user
    this.isDraggingProperty = new BooleanProperty(false);

    // @public (read-only) {Animation|null} - tracks any animation that is currently in progress
    this.inProgressAnimationProperty = new Property(null);

    // @public (read-only) {ObservableArrayDef.<NumberLinePoint>} - points on the number line that this controls
    this.numberLinePoints = createObservableArray();

    // Add the initial number line points.
    options.numberLinePoints.forEach(point => {
      this.associateWithNumberLinePoint(point);
    });

    // @public (read-only) {Color}
    this.color = options.color;

    // Monitor the number line(s) with which this point controller is associated for changes that require an update to
    // the point controller's position.
    const positionChangeUpdaters = []; // {Multilink}
    options.numberLines.forEach(numberLine => {
      const multilink = Multilink.multilink([numberLine.displayedRangeProperty, numberLine.centerPositionProperty], () => {
        if (this.lockToNumberLine !== LockToNumberLine.NEVER && this.numberLinePoints.length === 1) {
          const relevantPoint = this.numberLinePoints.find(point => point.numberLine === numberLine);
          relevantPoint && this.setPositionRelativeToPoint(relevantPoint);
        }
      });
      positionChangeUpdaters.push(multilink);
    });
    assert && assert(positionChangeUpdaters.length === options.numberLines.length);

    // Set our number line points to match this point controller's dragging state.
    this.isDraggingProperty.link(isDragging => {
      this.numberLinePoints.forEach(point => {
        point.isDraggingProperty.value = isDragging;
      });
    });

    // @private - clean up links to avoid memory leaks
    this.disposePointController = () => {
      positionChangeUpdaters.forEach(positionChangeUpdater => {
        positionChangeUpdater.dispose();
      });
    };
  }

  /**
   * Clean up any linkages or other associations that could cause memory leaks.
   * @public
   */
  dispose() {
    // Disassociate with all number line points.  This will remove any listeners that are observing these points.
    this.clearNumberLinePoints();

    // Remove the linkages created in the constructor.
    this.disposePointController();
  }

  /**
   * Returns whether this point controller is controlling one or more number line points.
   * @returns {boolean}
   * @public
   */
  isControllingNumberLinePoint() {
    return this.numberLinePoints.length > 0;
  }

  /**
   * Associate this controller with a point on the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  associateWithNumberLinePoint(numberLinePoint) {
    this.numberLinePoints.add(numberLinePoint);
    if (this.bidirectionalAssociation) {
      const positionUpdater = () => {
        this.setPositionRelativeToPoint(numberLinePoint);
      };
      numberLinePoint.valueProperty.link(positionUpdater);
      const pointRemovedListener = removedNumberLinePoint => {
        if (removedNumberLinePoint === numberLinePoint) {
          this.numberLinePoints.removeItemRemovedListener(pointRemovedListener);
          numberLinePoint.valueProperty.unlink(positionUpdater);
        }
      };
      this.numberLinePoints.addItemRemovedListener(pointRemovedListener);
    }

    // Set initial drag state, there is a link elsewhere that will make subsequent updates.
    numberLinePoint.isDraggingProperty.value = this.isDraggingProperty.value;
    assert && assert(this.numberLinePoints.length === _.uniq(this.numberLinePoints.map(point => point.numberLine)).length, 'There shouldn\'t be more than one associated point from the same number line');
  }

  /**
   * Remove the association between this point controller and a number line point.  This does not remove the point
   * from the number line.
   * @param {NumberLinePoint} numberLinePoint
   * @public
   */
  dissociateFromNumberLinePoint(numberLinePoint) {
    // Verify that the point is being controlled.
    assert && assert(this.numberLinePoints.indexOf(numberLinePoint) >= 0, 'point is not controlled by this point controller');

    // Since the point will no longer be controlled, it can't be dragging.
    numberLinePoint.isDraggingProperty.value = false;

    // Remove the point from the list of controlled points.
    this.numberLinePoints.remove(numberLinePoint);
  }

  /**
   * Remove the association between this controller and number line points that it was controlling.  Note that this
   * does NOT remove the points from the number line(s) - there is a different method for that.
   * @public
   */
  clearNumberLinePoints() {
    const controlledPoints = [...this.numberLinePoints];
    controlledPoints.forEach(point => {
      this.dissociateFromNumberLinePoint(point);
    });
  }

  /**
   * Remove all controlled points from the number line on which each one resides.
   * @public
   */
  removePointsFromNumberLines() {
    this.numberLinePoints.forEach(numberLinePoint => {
      numberLinePoint.numberLine.removePoint(numberLinePoint);
    });
  }

  /**
   * The name for this method is essentially a list of actions, i.e. "remove, clear, and dispose the points".  It is a
   * convenience method that removes the points associated with this controller from any number lines that they are on,
   * clears the point from this point controller's observable array, and disposes the points.  These actions can happen
   * independently, but often go together, so this method just does the whole shebang.
   * @public
   */
  removeClearAndDisposePoints() {
    const controlledPoints = this.numberLinePoints.getArrayCopy();
    this.removePointsFromNumberLines();
    this.clearNumberLinePoints();
    controlledPoints.forEach(point => {
      point.dispose();
    });
  }

  /**
   * Propose a new position to this point controller, may or may not actually update the position depending on whether
   * a point on the number line is being controlled and how that point moves.
   * @param {Vector2} proposedPosition
   * @public
   */
  proposePosition(proposedPosition) {
    if (this.isControllingNumberLinePoint()) {
      this.numberLinePoints.forEach(point => {
        // Map the proposed position to a value on the number line.
        const proposedNumberLineValue = point.numberLine.modelPositionToValue(proposedPosition);
        if (this.lockToNumberLine === LockToNumberLine.ALWAYS) {
          point.proposeValue(proposedNumberLineValue);
        } else if (this.lockToNumberLine === LockToNumberLine.NEVER) {
          // This will update the number line point and move it in the orientation of the number line.
          point.proposeValue(proposedNumberLineValue);

          // Move the point controller in the direction perpendicular to the number line.
          if (point.numberLine.isHorizontal) {
            this.positionProperty.value = new Vector2(this.positionProperty.value.x, proposedPosition.y);
          } else {
            this.positionProperty.value = new Vector2(proposedPosition.x, this.positionProperty.value.y);
          }
        } else if (this.lockToNumberLine === LockToNumberLine.WHEN_CLOSE) {
          // Determine whether to propose a new value for the point or to detach and remove the point.
          if (point.numberLine.isWithinPointRemovalDistance(proposedPosition)) {
            point.proposeValue(proposedNumberLineValue);
          } else {
            point.numberLine.removePoint(point);
            this.dissociateFromNumberLinePoint(point);
          }
        }
      });
    } else {
      assert && assert(this.lockToNumberLine !== LockToNumberLine.ALWAYS, 'should not be in this situation if controller is always locked to a point');
      if (this.lockToNumberLine === LockToNumberLine.WHEN_CLOSE) {
        // Check if a point should be created and added based on the proposed position.
        const numberLinesInRange = this.numberLines.filter(numberLine => numberLine.isWithinPointCreationDistance(proposedPosition));
        const constrainedValues = numberLinesInRange.map(numberLine => numberLine.getConstrainedValue(numberLine.modelPositionToValue(proposedPosition)));
        if (numberLinesInRange.length > 0) {
          numberLinesInRange.forEach((numberLine, i) => {
            const numberLinePoint = new NumberLinePoint(numberLine, {
              initialValue: constrainedValues[i],
              initialColor: this.color,
              controller: this
            });
            numberLine.addPoint(numberLinePoint);
            this.associateWithNumberLinePoint(numberLinePoint);
          });
        } else {
          // Just accept the proposed position, no other action is necessary.
          this.goToPosition(proposedPosition);
        }
      } else {
        // No restraint is needed, be free and go wherever you want.
        this.goToPosition(proposedPosition);
      }
    }
  }

  /**
   * Go to the specified position, either immediately or via an animation.
   * @param {Vector2} position
   * @param {boolean} [animate]
   * @public
   */
  goToPosition(position, animate = false) {
    // If there is an active animation, stop it.
    this.stopAnimation();
    if (animate) {
      // Animate the point controller's journey to the provided position.
      const animation = new Animation({
        duration: Math.max(MIN_ANIMATION_TIME, this.positionProperty.value.distance(position) / AVERAGE_ANIMATION_SPEED),
        targets: [
        // scale
        {
          to: this.scaleInBox,
          property: this.scaleProperty,
          easing: Easing.CUBIC_IN_OUT
        },
        // position
        {
          property: this.positionProperty,
          easing: Easing.CUBIC_IN_OUT,
          to: position
        }]
      });
      this.inProgressAnimationProperty.value = animation;
      animation.start();

      // When the animation is finished, clear the Property that is keeping track of it.
      animation.finishEmitter.addListener(() => {
        this.inProgressAnimationProperty.value = null;
      });
      animation.stopEmitter.addListener(() => {
        this.inProgressAnimationProperty.value = null;
      });
    } else {
      // Go straight to the specified position.
      this.positionProperty.value = position;
    }
  }

  /**
   * Given a number line point's position in model space, set this point controller to that value, but offset from the
   * number line.
   * @param {NumberLinePoint} point
   * @public
   */
  setPositionRelativeToPoint(point) {
    const pointPosition = point.getPositionInModelSpace();
    let x;
    let y;
    const lockedAlwaysOrWhenClose = this.lockToNumberLine === LockToNumberLine.ALWAYS || this.lockToNumberLine === LockToNumberLine.WHEN_CLOSE;
    if (point.numberLine.isHorizontal) {
      x = pointPosition.x;
      if (lockedAlwaysOrWhenClose) {
        y = pointPosition.y + this.offsetFromHorizontalNumberLine;
      } else {
        y = this.positionProperty.value.y;
      }
    } else {
      y = pointPosition.y;
      if (lockedAlwaysOrWhenClose) {
        x = pointPosition.x + this.offsetFromVerticalNumberLine;
      } else {
        x = this.positionProperty.value.x;
      }
    }
    this.goToPosition(new Vector2(x, y));
  }

  /**
   * Stop the current animation if one is happening, do nothing if not.
   * @public
   */
  stopAnimation() {
    if (this.inProgressAnimationProperty.value) {
      this.inProgressAnimationProperty.value.stop();
      this.inProgressAnimationProperty.value = null;
    }
  }

  /**
   * Restore initial state.
   * @public
   */
  reset() {
    this.clearNumberLinePoints();
    this.stopAnimation();
    this.positionProperty.reset();
    this.scaleProperty.reset();
  }
}
numberLineCommon.register('PointController', PointController);
export default PointController;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIk51bWJlckxpbmVQb2ludCIsIm1lcmdlIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwibnVtYmVyTGluZUNvbW1vbiIsIkxvY2tUb051bWJlckxpbmUiLCJBVkVSQUdFX0FOSU1BVElPTl9TUEVFRCIsIk1JTl9BTklNQVRJT05fVElNRSIsIlBvaW50Q29udHJvbGxlciIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImNvbG9yIiwib2Zmc2V0RnJvbUhvcml6b250YWxOdW1iZXJMaW5lIiwib2Zmc2V0RnJvbVZlcnRpY2FsTnVtYmVyTGluZSIsInNjYWxlSW5Cb3giLCJsb2NrVG9OdW1iZXJMaW5lIiwiV0hFTl9DTE9TRSIsIm51bWJlckxpbmVzIiwibnVtYmVyTGluZVBvaW50cyIsImJpZGlyZWN0aW9uYWxBc3NvY2lhdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJaRVJPIiwicmVlbnRyYW50Iiwic2NhbGVQcm9wZXJ0eSIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsImluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eSIsImZvckVhY2giLCJwb2ludCIsImFzc29jaWF0ZVdpdGhOdW1iZXJMaW5lUG9pbnQiLCJwb3NpdGlvbkNoYW5nZVVwZGF0ZXJzIiwibnVtYmVyTGluZSIsIm11bHRpbGluayIsImRpc3BsYXllZFJhbmdlUHJvcGVydHkiLCJjZW50ZXJQb3NpdGlvblByb3BlcnR5IiwiTkVWRVIiLCJsZW5ndGgiLCJyZWxldmFudFBvaW50IiwiZmluZCIsInNldFBvc2l0aW9uUmVsYXRpdmVUb1BvaW50IiwicHVzaCIsImFzc2VydCIsImxpbmsiLCJpc0RyYWdnaW5nIiwidmFsdWUiLCJkaXNwb3NlUG9pbnRDb250cm9sbGVyIiwicG9zaXRpb25DaGFuZ2VVcGRhdGVyIiwiZGlzcG9zZSIsImNsZWFyTnVtYmVyTGluZVBvaW50cyIsImlzQ29udHJvbGxpbmdOdW1iZXJMaW5lUG9pbnQiLCJudW1iZXJMaW5lUG9pbnQiLCJhZGQiLCJwb3NpdGlvblVwZGF0ZXIiLCJ2YWx1ZVByb3BlcnR5IiwicG9pbnRSZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVkTnVtYmVyTGluZVBvaW50IiwicmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciIsInVubGluayIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJfIiwidW5pcSIsIm1hcCIsImRpc3NvY2lhdGVGcm9tTnVtYmVyTGluZVBvaW50IiwiaW5kZXhPZiIsInJlbW92ZSIsImNvbnRyb2xsZWRQb2ludHMiLCJyZW1vdmVQb2ludHNGcm9tTnVtYmVyTGluZXMiLCJyZW1vdmVQb2ludCIsInJlbW92ZUNsZWFyQW5kRGlzcG9zZVBvaW50cyIsImdldEFycmF5Q29weSIsInByb3Bvc2VQb3NpdGlvbiIsInByb3Bvc2VkUG9zaXRpb24iLCJwcm9wb3NlZE51bWJlckxpbmVWYWx1ZSIsIm1vZGVsUG9zaXRpb25Ub1ZhbHVlIiwiQUxXQVlTIiwicHJvcG9zZVZhbHVlIiwiaXNIb3Jpem9udGFsIiwieCIsInkiLCJpc1dpdGhpblBvaW50UmVtb3ZhbERpc3RhbmNlIiwibnVtYmVyTGluZXNJblJhbmdlIiwiZmlsdGVyIiwiaXNXaXRoaW5Qb2ludENyZWF0aW9uRGlzdGFuY2UiLCJjb25zdHJhaW5lZFZhbHVlcyIsImdldENvbnN0cmFpbmVkVmFsdWUiLCJpIiwiaW5pdGlhbFZhbHVlIiwiaW5pdGlhbENvbG9yIiwiY29udHJvbGxlciIsImFkZFBvaW50IiwiZ29Ub1Bvc2l0aW9uIiwicG9zaXRpb24iLCJhbmltYXRlIiwic3RvcEFuaW1hdGlvbiIsImFuaW1hdGlvbiIsImR1cmF0aW9uIiwiTWF0aCIsIm1heCIsImRpc3RhbmNlIiwidGFyZ2V0cyIsInRvIiwicHJvcGVydHkiLCJlYXNpbmciLCJDVUJJQ19JTl9PVVQiLCJzdGFydCIsImZpbmlzaEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInN0b3BFbWl0dGVyIiwicG9pbnRQb3NpdGlvbiIsImdldFBvc2l0aW9uSW5Nb2RlbFNwYWNlIiwibG9ja2VkQWx3YXlzT3JXaGVuQ2xvc2UiLCJzdG9wIiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBvaW50Q29udHJvbGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIFBvaW50Q29udHJvbGxlciBpcyBhIG1vZGVsIGVsZW1lbnQgdGhhdCBpcyB1c2VkIHRvIGNvbnRyb2wgcG9pbnRzIG9uIGEgbnVtYmVyIGxpbmUsIGJ1dCBjYW4gZXhpc3QgaW5kZXBlbmRlbnRseVxyXG4gKiB0b28uIEluIHNvbWUgdXNlIGNhc2VzLCBpdCB3aWxsIGNyZWF0ZSBhIHBvaW50IG9uIGEgbnVtYmVyIGxpbmUgd2hlbiBpdCBnZXRzIHdpdGhpbiBhIGNlcnRhaW4gZGlzdGFuY2Ugb2YgaXQuICBJblxyXG4gKiBvdGhlciB1c2UgY2FzZXMsIGl0IGlzIHBlcm1hbmVudGx5IGxvY2tlZCB0byBhIG51bWJlciBsaW5lIGFuZCBhIHBvaW50IHRoYXQgaXQgaXMgY29udHJvbGxpbmcuXHJcbiAqXHJcbiAqIE9uZSBpbXBsaWNhdGlvbiBvZiB0aGUgZmFjdCB0aGF0IHBvaW50IGNvbnRyb2xsZXJzIGNhbiBhdHRhY2ggdG8gYW5kIGRldGFjaCBmcm9tIG51bWJlciBsaW5lcyBpcyB0aGF0IHNvbWV0aW1lcyxcclxuICogZGVzcGl0ZSB0aGUgbmFtZSwgYW4gaW5zdGFuY2UgY2FuIGJlIGluIGEgc3RhdGUgd2hlcmUgaXQgaXNuJ3QgY29udHJvbGxpbmcgYW55IHBvaW50cy5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlckxpbmVQb2ludCBmcm9tICcuLi8uLi8uLi8uLi9udW1iZXItbGluZS1jb21tb24vanMvY29tbW9uL21vZGVsL051bWJlckxpbmVQb2ludC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IG51bWJlckxpbmVDb21tb24gZnJvbSAnLi4vLi4vbnVtYmVyTGluZUNvbW1vbi5qcyc7XHJcbmltcG9ydCBMb2NrVG9OdW1iZXJMaW5lIGZyb20gJy4vTG9ja1RvTnVtYmVyTGluZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQVZFUkFHRV9BTklNQVRJT05fU1BFRUQgPSAxMDAwOyAvLyBzY3JlZW4gY29vcmRpbmF0ZXMgcGVyIHNlY29uZFxyXG5jb25zdCBNSU5fQU5JTUFUSU9OX1RJTUUgPSAwLjM7IC8vIGluIHNlY29uZHNcclxuXHJcbmNsYXNzIFBvaW50Q29udHJvbGxlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBjb2xvciB1c2VkIHdoZW4gcmVwcmVzZW50ZWQgaW4gdGhlIHZpZXdcclxuICAgICAgY29sb3I6ICdibGFjaycsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIG9mZnNldCBpbiBtb2RlbCBjb29yZHMgZnJvbSBhIGhvcml6b250YWwgbnVtYmVyIGxpbmUgd2hlbiBjb250cm9sbGluZyBhIHBvaW50XHJcbiAgICAgIG9mZnNldEZyb21Ib3Jpem9udGFsTnVtYmVyTGluZTogNTAsXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfSAtIG9mZnNldCBpbiBtb2RlbCBjb29yZHMgZnJvbSBhIHZlcnRpY2FsIG51bWJlciBsaW5lIHdoZW4gY29udHJvbGxpbmcgYSBwb2ludFxyXG4gICAgICBvZmZzZXRGcm9tVmVydGljYWxOdW1iZXJMaW5lOiA1MixcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gc2NhbGUgb2YgY29udHJvbGxlciBub2RlIHdoZW4gYW5pbWF0ZWQgYmFjayBpbnRvIGJveFxyXG4gICAgICBzY2FsZUluQm94OiAxLjAsXHJcblxyXG4gICAgICAvLyB7TG9ja1RvTnVtYmVyTGluZX0gLSBDb250cm9scyB3aGV0aGVyIHRoaXMgcG9pbnQgY29udHJvbGxlciBpcywgb3IgY2FuLCBsb2NrIHRvIHRoZSBudW1iZXIgbGluZS5cclxuICAgICAgbG9ja1RvTnVtYmVyTGluZTogTG9ja1RvTnVtYmVyTGluZS5XSEVOX0NMT1NFLFxyXG5cclxuICAgICAgLy8ge051bWJlckxpbmVbXX0gLSB0aGUgbnVtYmVyIGxpbmVzIG9uIHdoaWNoIHRoaXMgY29udHJvbGxlciBjYW4gYWRkIHBvaW50cywgY2FuIGJlIGVtcHR5IGlmIHRoaXMgY29udHJvbGxlclxyXG4gICAgICAvLyBuZXZlciBhZGRzIG9yIHJlbW92ZXMgcG9pbnRzIGZyb20gdGhlIG51bWJlciBsaW5lXHJcbiAgICAgIG51bWJlckxpbmVzOiBbXSxcclxuXHJcbiAgICAgIC8vIHtOdW1iZXJMaW5lUG9pbnRbXX0gLSB0aGUgcG9pbnRzIG9uIHRoZSBudW1iZXIgbGluZSB0aGF0IGFyZSBjdXJyZW50bHkgYmVpbmcgY29udHJvbGxlZCwgY2FuIGJlIGVtcHR5XHJcbiAgICAgIG51bWJlckxpbmVQb2ludHM6IFtdLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gY29udHJvbHMgd2hldGhlciBtb3ZlbWVudHMgb2YgdGhlIGNvbnRyb2xsZWQgbnVtYmVyIGxpbmUgcG9pbnQocykgc2hvdWxkIGNhdXNlIHRoaXMgcG9pbnRcclxuICAgICAgLy8gY29udHJvbGxlciB0byBhbHNvIG1vdmVcclxuICAgICAgYmlkaXJlY3Rpb25hbEFzc29jaWF0aW9uOiB0cnVlXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm9mZnNldEZyb21Ib3Jpem9udGFsTnVtYmVyTGluZSA9IG9wdGlvbnMub2Zmc2V0RnJvbUhvcml6b250YWxOdW1iZXJMaW5lO1xyXG4gICAgdGhpcy5vZmZzZXRGcm9tVmVydGljYWxOdW1iZXJMaW5lID0gb3B0aW9ucy5vZmZzZXRGcm9tVmVydGljYWxOdW1iZXJMaW5lO1xyXG4gICAgdGhpcy5sb2NrVG9OdW1iZXJMaW5lID0gb3B0aW9ucy5sb2NrVG9OdW1iZXJMaW5lO1xyXG4gICAgdGhpcy5iaWRpcmVjdGlvbmFsQXNzb2NpYXRpb24gPSBvcHRpb25zLmJpZGlyZWN0aW9uYWxBc3NvY2lhdGlvbjtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtOdW1iZXJMaW5lW119XHJcbiAgICB0aGlzLm51bWJlckxpbmVzID0gb3B0aW9ucy5udW1iZXJMaW5lcztcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtWZWN0b3IyUHJvcGVydHl9IC0gcG9zaXRpb24gb2YgdGhpcyBwb2ludCBpbiBtb2RlbCBzcGFjZVxyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcblxyXG4gICAgICAvLyBBbGxvd2luZyByZWVudHJ5IGlzIG5lY2Vzc2FyeSBiZWNhdXNlIG9mIHR3by13YXkgcG9zaXRpb24gcmVsYXRpb25zaGlwIHdpdGggbnVtYmVyIGxpbmUgcG9pbnRzLlxyXG4gICAgICByZWVudHJhbnQ6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHRoZSBzY2FsZSBvZiB0aGlzIHBvaW50IGNvbnRyb2xsZXIgd2hlbiBzdG9yZWQgYXdheVxyXG4gICAgdGhpcy5zY2FsZUluQm94ID0gb3B0aW9ucy5zY2FsZUluQm94O1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fSAtIHNjYWxlIG9mIHRoaXMgcG9pbnRcclxuICAgIHRoaXMuc2NhbGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggdGhpcy5zY2FsZUluQm94ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Qm9vbGVhblByb3BlcnR5fSAtIGluZGljYXRlcyB3aGV0aGVyIHRoaXMgaXMgYmVpbmcgZHJhZ2dlZCBieSB0aGUgdXNlclxyXG4gICAgdGhpcy5pc0RyYWdnaW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0FuaW1hdGlvbnxudWxsfSAtIHRyYWNrcyBhbnkgYW5pbWF0aW9uIHRoYXQgaXMgY3VycmVudGx5IGluIHByb2dyZXNzXHJcbiAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge09ic2VydmFibGVBcnJheURlZi48TnVtYmVyTGluZVBvaW50Pn0gLSBwb2ludHMgb24gdGhlIG51bWJlciBsaW5lIHRoYXQgdGhpcyBjb250cm9sc1xyXG4gICAgdGhpcy5udW1iZXJMaW5lUG9pbnRzID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBpbml0aWFsIG51bWJlciBsaW5lIHBvaW50cy5cclxuICAgIG9wdGlvbnMubnVtYmVyTGluZVBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiB7IHRoaXMuYXNzb2NpYXRlV2l0aE51bWJlckxpbmVQb2ludCggcG9pbnQgKTsgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0NvbG9yfVxyXG4gICAgdGhpcy5jb2xvciA9IG9wdGlvbnMuY29sb3I7XHJcblxyXG4gICAgLy8gTW9uaXRvciB0aGUgbnVtYmVyIGxpbmUocykgd2l0aCB3aGljaCB0aGlzIHBvaW50IGNvbnRyb2xsZXIgaXMgYXNzb2NpYXRlZCBmb3IgY2hhbmdlcyB0aGF0IHJlcXVpcmUgYW4gdXBkYXRlIHRvXHJcbiAgICAvLyB0aGUgcG9pbnQgY29udHJvbGxlcidzIHBvc2l0aW9uLlxyXG4gICAgY29uc3QgcG9zaXRpb25DaGFuZ2VVcGRhdGVycyA9IFtdOyAvLyB7TXVsdGlsaW5rfVxyXG4gICAgb3B0aW9ucy5udW1iZXJMaW5lcy5mb3JFYWNoKCBudW1iZXJMaW5lID0+IHtcclxuICAgICAgY29uc3QgbXVsdGlsaW5rID0gTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgICBbIG51bWJlckxpbmUuZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSwgbnVtYmVyTGluZS5jZW50ZXJQb3NpdGlvblByb3BlcnR5IF0sXHJcbiAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLmxvY2tUb051bWJlckxpbmUgIT09IExvY2tUb051bWJlckxpbmUuTkVWRVIgJiYgdGhpcy5udW1iZXJMaW5lUG9pbnRzLmxlbmd0aCA9PT0gMSApIHtcclxuICAgICAgICAgICAgY29uc3QgcmVsZXZhbnRQb2ludCA9IHRoaXMubnVtYmVyTGluZVBvaW50cy5maW5kKCBwb2ludCA9PiBwb2ludC5udW1iZXJMaW5lID09PSBudW1iZXJMaW5lICk7XHJcbiAgICAgICAgICAgIHJlbGV2YW50UG9pbnQgJiYgdGhpcy5zZXRQb3NpdGlvblJlbGF0aXZlVG9Qb2ludCggcmVsZXZhbnRQb2ludCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgcG9zaXRpb25DaGFuZ2VVcGRhdGVycy5wdXNoKCBtdWx0aWxpbmsgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbkNoYW5nZVVwZGF0ZXJzLmxlbmd0aCA9PT0gb3B0aW9ucy5udW1iZXJMaW5lcy5sZW5ndGggKTtcclxuXHJcbiAgICAvLyBTZXQgb3VyIG51bWJlciBsaW5lIHBvaW50cyB0byBtYXRjaCB0aGlzIHBvaW50IGNvbnRyb2xsZXIncyBkcmFnZ2luZyBzdGF0ZS5cclxuICAgIHRoaXMuaXNEcmFnZ2luZ1Byb3BlcnR5LmxpbmsoIGlzRHJhZ2dpbmcgPT4ge1xyXG4gICAgICB0aGlzLm51bWJlckxpbmVQb2ludHMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG4gICAgICAgIHBvaW50LmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSA9IGlzRHJhZ2dpbmc7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGNsZWFuIHVwIGxpbmtzIHRvIGF2b2lkIG1lbW9yeSBsZWFrc1xyXG4gICAgdGhpcy5kaXNwb3NlUG9pbnRDb250cm9sbGVyID0gKCkgPT4ge1xyXG4gICAgICBwb3NpdGlvbkNoYW5nZVVwZGF0ZXJzLmZvckVhY2goIHBvc2l0aW9uQ2hhbmdlVXBkYXRlciA9PiB7XHJcbiAgICAgICAgcG9zaXRpb25DaGFuZ2VVcGRhdGVyLmRpc3Bvc2UoKTtcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFuIHVwIGFueSBsaW5rYWdlcyBvciBvdGhlciBhc3NvY2lhdGlvbnMgdGhhdCBjb3VsZCBjYXVzZSBtZW1vcnkgbGVha3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcblxyXG4gICAgLy8gRGlzYXNzb2NpYXRlIHdpdGggYWxsIG51bWJlciBsaW5lIHBvaW50cy4gIFRoaXMgd2lsbCByZW1vdmUgYW55IGxpc3RlbmVycyB0aGF0IGFyZSBvYnNlcnZpbmcgdGhlc2UgcG9pbnRzLlxyXG4gICAgdGhpcy5jbGVhck51bWJlckxpbmVQb2ludHMoKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgdGhlIGxpbmthZ2VzIGNyZWF0ZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlxyXG4gICAgdGhpcy5kaXNwb3NlUG9pbnRDb250cm9sbGVyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyBwb2ludCBjb250cm9sbGVyIGlzIGNvbnRyb2xsaW5nIG9uZSBvciBtb3JlIG51bWJlciBsaW5lIHBvaW50cy5cclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaXNDb250cm9sbGluZ051bWJlckxpbmVQb2ludCgpIHtcclxuICAgIHJldHVybiB0aGlzLm51bWJlckxpbmVQb2ludHMubGVuZ3RoID4gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc29jaWF0ZSB0aGlzIGNvbnRyb2xsZXIgd2l0aCBhIHBvaW50IG9uIHRoZSBudW1iZXIgbGluZS5cclxuICAgKiBAcGFyYW0ge051bWJlckxpbmVQb2ludH0gbnVtYmVyTGluZVBvaW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFzc29jaWF0ZVdpdGhOdW1iZXJMaW5lUG9pbnQoIG51bWJlckxpbmVQb2ludCApIHtcclxuICAgIHRoaXMubnVtYmVyTGluZVBvaW50cy5hZGQoIG51bWJlckxpbmVQb2ludCApO1xyXG5cclxuICAgIGlmICggdGhpcy5iaWRpcmVjdGlvbmFsQXNzb2NpYXRpb24gKSB7XHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uVXBkYXRlciA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uUmVsYXRpdmVUb1BvaW50KCBudW1iZXJMaW5lUG9pbnQgKTtcclxuICAgICAgfTtcclxuICAgICAgbnVtYmVyTGluZVBvaW50LnZhbHVlUHJvcGVydHkubGluayggcG9zaXRpb25VcGRhdGVyICk7XHJcbiAgICAgIGNvbnN0IHBvaW50UmVtb3ZlZExpc3RlbmVyID0gcmVtb3ZlZE51bWJlckxpbmVQb2ludCA9PiB7XHJcbiAgICAgICAgaWYgKCByZW1vdmVkTnVtYmVyTGluZVBvaW50ID09PSBudW1iZXJMaW5lUG9pbnQgKSB7XHJcbiAgICAgICAgICB0aGlzLm51bWJlckxpbmVQb2ludHMucmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciggcG9pbnRSZW1vdmVkTGlzdGVuZXIgKTtcclxuICAgICAgICAgIG51bWJlckxpbmVQb2ludC52YWx1ZVByb3BlcnR5LnVubGluayggcG9zaXRpb25VcGRhdGVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICB0aGlzLm51bWJlckxpbmVQb2ludHMuYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciggcG9pbnRSZW1vdmVkTGlzdGVuZXIgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZXQgaW5pdGlhbCBkcmFnIHN0YXRlLCB0aGVyZSBpcyBhIGxpbmsgZWxzZXdoZXJlIHRoYXQgd2lsbCBtYWtlIHN1YnNlcXVlbnQgdXBkYXRlcy5cclxuICAgIG51bWJlckxpbmVQb2ludC5pc0RyYWdnaW5nUHJvcGVydHkudmFsdWUgPSB0aGlzLmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICB0aGlzLm51bWJlckxpbmVQb2ludHMubGVuZ3RoID09PSBfLnVuaXEoIHRoaXMubnVtYmVyTGluZVBvaW50cy5tYXAoIHBvaW50ID0+IHBvaW50Lm51bWJlckxpbmUgKSApLmxlbmd0aCxcclxuICAgICAgJ1RoZXJlIHNob3VsZG5cXCd0IGJlIG1vcmUgdGhhbiBvbmUgYXNzb2NpYXRlZCBwb2ludCBmcm9tIHRoZSBzYW1lIG51bWJlciBsaW5lJ1xyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGUgYXNzb2NpYXRpb24gYmV0d2VlbiB0aGlzIHBvaW50IGNvbnRyb2xsZXIgYW5kIGEgbnVtYmVyIGxpbmUgcG9pbnQuICBUaGlzIGRvZXMgbm90IHJlbW92ZSB0aGUgcG9pbnRcclxuICAgKiBmcm9tIHRoZSBudW1iZXIgbGluZS5cclxuICAgKiBAcGFyYW0ge051bWJlckxpbmVQb2ludH0gbnVtYmVyTGluZVBvaW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3NvY2lhdGVGcm9tTnVtYmVyTGluZVBvaW50KCBudW1iZXJMaW5lUG9pbnQgKSB7XHJcblxyXG4gICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHBvaW50IGlzIGJlaW5nIGNvbnRyb2xsZWQuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICB0aGlzLm51bWJlckxpbmVQb2ludHMuaW5kZXhPZiggbnVtYmVyTGluZVBvaW50ICkgPj0gMCxcclxuICAgICAgJ3BvaW50IGlzIG5vdCBjb250cm9sbGVkIGJ5IHRoaXMgcG9pbnQgY29udHJvbGxlcidcclxuICAgICk7XHJcblxyXG4gICAgLy8gU2luY2UgdGhlIHBvaW50IHdpbGwgbm8gbG9uZ2VyIGJlIGNvbnRyb2xsZWQsIGl0IGNhbid0IGJlIGRyYWdnaW5nLlxyXG4gICAgbnVtYmVyTGluZVBvaW50LmlzRHJhZ2dpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgIC8vIFJlbW92ZSB0aGUgcG9pbnQgZnJvbSB0aGUgbGlzdCBvZiBjb250cm9sbGVkIHBvaW50cy5cclxuICAgIHRoaXMubnVtYmVyTGluZVBvaW50cy5yZW1vdmUoIG51bWJlckxpbmVQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHRoZSBhc3NvY2lhdGlvbiBiZXR3ZWVuIHRoaXMgY29udHJvbGxlciBhbmQgbnVtYmVyIGxpbmUgcG9pbnRzIHRoYXQgaXQgd2FzIGNvbnRyb2xsaW5nLiAgTm90ZSB0aGF0IHRoaXNcclxuICAgKiBkb2VzIE5PVCByZW1vdmUgdGhlIHBvaW50cyBmcm9tIHRoZSBudW1iZXIgbGluZShzKSAtIHRoZXJlIGlzIGEgZGlmZmVyZW50IG1ldGhvZCBmb3IgdGhhdC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY2xlYXJOdW1iZXJMaW5lUG9pbnRzKCkge1xyXG4gICAgY29uc3QgY29udHJvbGxlZFBvaW50cyA9IFsgLi4udGhpcy5udW1iZXJMaW5lUG9pbnRzIF07XHJcbiAgICBjb250cm9sbGVkUG9pbnRzLmZvckVhY2goIHBvaW50ID0+IHtcclxuICAgICAgdGhpcy5kaXNzb2NpYXRlRnJvbU51bWJlckxpbmVQb2ludCggcG9pbnQgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbGwgY29udHJvbGxlZCBwb2ludHMgZnJvbSB0aGUgbnVtYmVyIGxpbmUgb24gd2hpY2ggZWFjaCBvbmUgcmVzaWRlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlUG9pbnRzRnJvbU51bWJlckxpbmVzKCkge1xyXG4gICAgdGhpcy5udW1iZXJMaW5lUG9pbnRzLmZvckVhY2goIG51bWJlckxpbmVQb2ludCA9PiB7XHJcbiAgICAgIG51bWJlckxpbmVQb2ludC5udW1iZXJMaW5lLnJlbW92ZVBvaW50KCBudW1iZXJMaW5lUG9pbnQgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBuYW1lIGZvciB0aGlzIG1ldGhvZCBpcyBlc3NlbnRpYWxseSBhIGxpc3Qgb2YgYWN0aW9ucywgaS5lLiBcInJlbW92ZSwgY2xlYXIsIGFuZCBkaXNwb3NlIHRoZSBwb2ludHNcIi4gIEl0IGlzIGFcclxuICAgKiBjb252ZW5pZW5jZSBtZXRob2QgdGhhdCByZW1vdmVzIHRoZSBwb2ludHMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgY29udHJvbGxlciBmcm9tIGFueSBudW1iZXIgbGluZXMgdGhhdCB0aGV5IGFyZSBvbixcclxuICAgKiBjbGVhcnMgdGhlIHBvaW50IGZyb20gdGhpcyBwb2ludCBjb250cm9sbGVyJ3Mgb2JzZXJ2YWJsZSBhcnJheSwgYW5kIGRpc3Bvc2VzIHRoZSBwb2ludHMuICBUaGVzZSBhY3Rpb25zIGNhbiBoYXBwZW5cclxuICAgKiBpbmRlcGVuZGVudGx5LCBidXQgb2Z0ZW4gZ28gdG9nZXRoZXIsIHNvIHRoaXMgbWV0aG9kIGp1c3QgZG9lcyB0aGUgd2hvbGUgc2hlYmFuZy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlQ2xlYXJBbmREaXNwb3NlUG9pbnRzKCkge1xyXG4gICAgY29uc3QgY29udHJvbGxlZFBvaW50cyA9IHRoaXMubnVtYmVyTGluZVBvaW50cy5nZXRBcnJheUNvcHkoKTtcclxuICAgIHRoaXMucmVtb3ZlUG9pbnRzRnJvbU51bWJlckxpbmVzKCk7XHJcbiAgICB0aGlzLmNsZWFyTnVtYmVyTGluZVBvaW50cygpO1xyXG4gICAgY29udHJvbGxlZFBvaW50cy5mb3JFYWNoKCBwb2ludCA9PiB7XHJcbiAgICAgIHBvaW50LmRpc3Bvc2UoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb3Bvc2UgYSBuZXcgcG9zaXRpb24gdG8gdGhpcyBwb2ludCBjb250cm9sbGVyLCBtYXkgb3IgbWF5IG5vdCBhY3R1YWxseSB1cGRhdGUgdGhlIHBvc2l0aW9uIGRlcGVuZGluZyBvbiB3aGV0aGVyXHJcbiAgICogYSBwb2ludCBvbiB0aGUgbnVtYmVyIGxpbmUgaXMgYmVpbmcgY29udHJvbGxlZCBhbmQgaG93IHRoYXQgcG9pbnQgbW92ZXMuXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwcm9wb3NlZFBvc2l0aW9uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHByb3Bvc2VQb3NpdGlvbiggcHJvcG9zZWRQb3NpdGlvbiApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNDb250cm9sbGluZ051bWJlckxpbmVQb2ludCgpICkge1xyXG4gICAgICB0aGlzLm51bWJlckxpbmVQb2ludHMuZm9yRWFjaCggcG9pbnQgPT4ge1xyXG5cclxuICAgICAgICAvLyBNYXAgdGhlIHByb3Bvc2VkIHBvc2l0aW9uIHRvIGEgdmFsdWUgb24gdGhlIG51bWJlciBsaW5lLlxyXG4gICAgICAgIGNvbnN0IHByb3Bvc2VkTnVtYmVyTGluZVZhbHVlID0gcG9pbnQubnVtYmVyTGluZS5tb2RlbFBvc2l0aW9uVG9WYWx1ZSggcHJvcG9zZWRQb3NpdGlvbiApO1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMubG9ja1RvTnVtYmVyTGluZSA9PT0gTG9ja1RvTnVtYmVyTGluZS5BTFdBWVMgKSB7XHJcbiAgICAgICAgICBwb2ludC5wcm9wb3NlVmFsdWUoIHByb3Bvc2VkTnVtYmVyTGluZVZhbHVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmxvY2tUb051bWJlckxpbmUgPT09IExvY2tUb051bWJlckxpbmUuTkVWRVIgKSB7XHJcblxyXG4gICAgICAgICAgLy8gVGhpcyB3aWxsIHVwZGF0ZSB0aGUgbnVtYmVyIGxpbmUgcG9pbnQgYW5kIG1vdmUgaXQgaW4gdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBudW1iZXIgbGluZS5cclxuICAgICAgICAgIHBvaW50LnByb3Bvc2VWYWx1ZSggcHJvcG9zZWROdW1iZXJMaW5lVmFsdWUgKTtcclxuXHJcbiAgICAgICAgICAvLyBNb3ZlIHRoZSBwb2ludCBjb250cm9sbGVyIGluIHRoZSBkaXJlY3Rpb24gcGVycGVuZGljdWxhciB0byB0aGUgbnVtYmVyIGxpbmUuXHJcbiAgICAgICAgICBpZiAoIHBvaW50Lm51bWJlckxpbmUuaXNIb3Jpem9udGFsICkge1xyXG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLngsIHByb3Bvc2VkUG9zaXRpb24ueSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IyKCBwcm9wb3NlZFBvc2l0aW9uLngsIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmxvY2tUb051bWJlckxpbmUgPT09IExvY2tUb051bWJlckxpbmUuV0hFTl9DTE9TRSApIHtcclxuXHJcbiAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBwcm9wb3NlIGEgbmV3IHZhbHVlIGZvciB0aGUgcG9pbnQgb3IgdG8gZGV0YWNoIGFuZCByZW1vdmUgdGhlIHBvaW50LlxyXG4gICAgICAgICAgaWYgKCBwb2ludC5udW1iZXJMaW5lLmlzV2l0aGluUG9pbnRSZW1vdmFsRGlzdGFuY2UoIHByb3Bvc2VkUG9zaXRpb24gKSApIHtcclxuICAgICAgICAgICAgcG9pbnQucHJvcG9zZVZhbHVlKCBwcm9wb3NlZE51bWJlckxpbmVWYWx1ZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBvaW50Lm51bWJlckxpbmUucmVtb3ZlUG9pbnQoIHBvaW50ICk7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzc29jaWF0ZUZyb21OdW1iZXJMaW5lUG9pbnQoIHBvaW50ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgdGhpcy5sb2NrVG9OdW1iZXJMaW5lICE9PSBMb2NrVG9OdW1iZXJMaW5lLkFMV0FZUyxcclxuICAgICAgICAnc2hvdWxkIG5vdCBiZSBpbiB0aGlzIHNpdHVhdGlvbiBpZiBjb250cm9sbGVyIGlzIGFsd2F5cyBsb2NrZWQgdG8gYSBwb2ludCdcclxuICAgICAgKTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5sb2NrVG9OdW1iZXJMaW5lID09PSBMb2NrVG9OdW1iZXJMaW5lLldIRU5fQ0xPU0UgKSB7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIGEgcG9pbnQgc2hvdWxkIGJlIGNyZWF0ZWQgYW5kIGFkZGVkIGJhc2VkIG9uIHRoZSBwcm9wb3NlZCBwb3NpdGlvbi5cclxuICAgICAgICBjb25zdCBudW1iZXJMaW5lc0luUmFuZ2UgPSB0aGlzLm51bWJlckxpbmVzLmZpbHRlciggbnVtYmVyTGluZSA9PiBudW1iZXJMaW5lLmlzV2l0aGluUG9pbnRDcmVhdGlvbkRpc3RhbmNlKCBwcm9wb3NlZFBvc2l0aW9uICkgKTtcclxuXHJcbiAgICAgICAgY29uc3QgY29uc3RyYWluZWRWYWx1ZXMgPSBudW1iZXJMaW5lc0luUmFuZ2UubWFwKFxyXG4gICAgICAgICAgbnVtYmVyTGluZSA9PiBudW1iZXJMaW5lLmdldENvbnN0cmFpbmVkVmFsdWUoIG51bWJlckxpbmUubW9kZWxQb3NpdGlvblRvVmFsdWUoIHByb3Bvc2VkUG9zaXRpb24gKSApXHJcbiAgICAgICAgKTtcclxuICAgICAgICBpZiAoIG51bWJlckxpbmVzSW5SYW5nZS5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgbnVtYmVyTGluZXNJblJhbmdlLmZvckVhY2goICggbnVtYmVyTGluZSwgaSApID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbnVtYmVyTGluZVBvaW50ID0gbmV3IE51bWJlckxpbmVQb2ludCggbnVtYmVyTGluZSwge1xyXG4gICAgICAgICAgICAgIGluaXRpYWxWYWx1ZTogY29uc3RyYWluZWRWYWx1ZXNbIGkgXSxcclxuICAgICAgICAgICAgICBpbml0aWFsQ29sb3I6IHRoaXMuY29sb3IsXHJcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogdGhpc1xyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIG51bWJlckxpbmUuYWRkUG9pbnQoIG51bWJlckxpbmVQb2ludCApO1xyXG4gICAgICAgICAgICB0aGlzLmFzc29jaWF0ZVdpdGhOdW1iZXJMaW5lUG9pbnQoIG51bWJlckxpbmVQb2ludCApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBKdXN0IGFjY2VwdCB0aGUgcHJvcG9zZWQgcG9zaXRpb24sIG5vIG90aGVyIGFjdGlvbiBpcyBuZWNlc3NhcnkuXHJcbiAgICAgICAgICB0aGlzLmdvVG9Qb3NpdGlvbiggcHJvcG9zZWRQb3NpdGlvbiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gTm8gcmVzdHJhaW50IGlzIG5lZWRlZCwgYmUgZnJlZSBhbmQgZ28gd2hlcmV2ZXIgeW91IHdhbnQuXHJcbiAgICAgICAgdGhpcy5nb1RvUG9zaXRpb24oIHByb3Bvc2VkUG9zaXRpb24gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR28gdG8gdGhlIHNwZWNpZmllZCBwb3NpdGlvbiwgZWl0aGVyIGltbWVkaWF0ZWx5IG9yIHZpYSBhbiBhbmltYXRpb24uXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FuaW1hdGVdXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdvVG9Qb3NpdGlvbiggcG9zaXRpb24sIGFuaW1hdGUgPSBmYWxzZSApIHtcclxuXHJcbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBhY3RpdmUgYW5pbWF0aW9uLCBzdG9wIGl0LlxyXG4gICAgdGhpcy5zdG9wQW5pbWF0aW9uKCk7XHJcblxyXG4gICAgaWYgKCBhbmltYXRlICkge1xyXG5cclxuICAgICAgLy8gQW5pbWF0ZSB0aGUgcG9pbnQgY29udHJvbGxlcidzIGpvdXJuZXkgdG8gdGhlIHByb3ZpZGVkIHBvc2l0aW9uLlxyXG4gICAgICBjb25zdCBhbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgZHVyYXRpb246IE1hdGgubWF4KFxyXG4gICAgICAgICAgTUlOX0FOSU1BVElPTl9USU1FLFxyXG4gICAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBwb3NpdGlvbiApIC8gQVZFUkFHRV9BTklNQVRJT05fU1BFRURcclxuICAgICAgICApLFxyXG4gICAgICAgIHRhcmdldHM6IFtcclxuXHJcbiAgICAgICAgICAvLyBzY2FsZVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB0bzogdGhpcy5zY2FsZUluQm94LFxyXG4gICAgICAgICAgICBwcm9wZXJ0eTogdGhpcy5zY2FsZVByb3BlcnR5LFxyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgLy8gcG9zaXRpb25cclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcHJvcGVydHk6IHRoaXMucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICAgICAgZWFzaW5nOiBFYXNpbmcuQ1VCSUNfSU5fT1VULFxyXG4gICAgICAgICAgICB0bzogcG9zaXRpb25cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5pblByb2dyZXNzQW5pbWF0aW9uUHJvcGVydHkudmFsdWUgPSBhbmltYXRpb247XHJcbiAgICAgIGFuaW1hdGlvbi5zdGFydCgpO1xyXG5cclxuICAgICAgLy8gV2hlbiB0aGUgYW5pbWF0aW9uIGlzIGZpbmlzaGVkLCBjbGVhciB0aGUgUHJvcGVydHkgdGhhdCBpcyBrZWVwaW5nIHRyYWNrIG9mIGl0LlxyXG4gICAgICBhbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgfSApO1xyXG4gICAgICBhbmltYXRpb24uc3RvcEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG51bGw7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gR28gc3RyYWlnaHQgdG8gdGhlIHNwZWNpZmllZCBwb3NpdGlvbi5cclxuICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9zaXRpb247XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIG51bWJlciBsaW5lIHBvaW50J3MgcG9zaXRpb24gaW4gbW9kZWwgc3BhY2UsIHNldCB0aGlzIHBvaW50IGNvbnRyb2xsZXIgdG8gdGhhdCB2YWx1ZSwgYnV0IG9mZnNldCBmcm9tIHRoZVxyXG4gICAqIG51bWJlciBsaW5lLlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyTGluZVBvaW50fSBwb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRQb3NpdGlvblJlbGF0aXZlVG9Qb2ludCggcG9pbnQgKSB7XHJcbiAgICBjb25zdCBwb2ludFBvc2l0aW9uID0gcG9pbnQuZ2V0UG9zaXRpb25Jbk1vZGVsU3BhY2UoKTtcclxuICAgIGxldCB4O1xyXG4gICAgbGV0IHk7XHJcbiAgICBjb25zdCBsb2NrZWRBbHdheXNPcldoZW5DbG9zZSA9IHRoaXMubG9ja1RvTnVtYmVyTGluZSA9PT0gTG9ja1RvTnVtYmVyTGluZS5BTFdBWVMgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NrVG9OdW1iZXJMaW5lID09PSBMb2NrVG9OdW1iZXJMaW5lLldIRU5fQ0xPU0U7XHJcbiAgICBpZiAoIHBvaW50Lm51bWJlckxpbmUuaXNIb3Jpem9udGFsICkge1xyXG4gICAgICB4ID0gcG9pbnRQb3NpdGlvbi54O1xyXG4gICAgICBpZiAoIGxvY2tlZEFsd2F5c09yV2hlbkNsb3NlICkge1xyXG4gICAgICAgIHkgPSBwb2ludFBvc2l0aW9uLnkgKyB0aGlzLm9mZnNldEZyb21Ib3Jpem9udGFsTnVtYmVyTGluZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB5ID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB5ID0gcG9pbnRQb3NpdGlvbi55O1xyXG4gICAgICBpZiAoIGxvY2tlZEFsd2F5c09yV2hlbkNsb3NlICkge1xyXG4gICAgICAgIHggPSBwb2ludFBvc2l0aW9uLnggKyB0aGlzLm9mZnNldEZyb21WZXJ0aWNhbE51bWJlckxpbmU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgeCA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLmdvVG9Qb3NpdGlvbiggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcCB0aGUgY3VycmVudCBhbmltYXRpb24gaWYgb25lIGlzIGhhcHBlbmluZywgZG8gbm90aGluZyBpZiBub3QuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0b3BBbmltYXRpb24oKSB7XHJcbiAgICBpZiAoIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLmluUHJvZ3Jlc3NBbmltYXRpb25Qcm9wZXJ0eS52YWx1ZS5zdG9wKCk7XHJcbiAgICAgIHRoaXMuaW5Qcm9ncmVzc0FuaW1hdGlvblByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc3RvcmUgaW5pdGlhbCBzdGF0ZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmNsZWFyTnVtYmVyTGluZVBvaW50cygpO1xyXG4gICAgdGhpcy5zdG9wQW5pbWF0aW9uKCk7XHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2NhbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyTGluZUNvbW1vbi5yZWdpc3RlciggJ1BvaW50Q29udHJvbGxlcicsIFBvaW50Q29udHJvbGxlciApO1xyXG5leHBvcnQgZGVmYXVsdCBQb2ludENvbnRyb2xsZXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLHFCQUFxQixNQUFNLDhDQUE4QztBQUNoRixPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7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