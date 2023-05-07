// Copyright 2017-2023, University of Colorado Boulder

/**
 * MultiListener is responsible for monitoring the mouse, touch, and other presses on the screen and determines the
 * operations to apply to a target Node from this input. Single touch dragging on the screen will initiate
 * panning. Multi-touch gestures will initiate scaling, translation, and potentially rotation depending on
 * the gesture.
 *
 * MultiListener will keep track of all "background" presses on the screen. When certain conditions are met, the
 * "background" presses become active and attached listeners may be interrupted so that the MultiListener
 * gestures take precedence. MultiListener uses the Intent feature of Pointer, so that the default behavior of this
 * listener can be prevented if necessary. Generally, you would use Pointer.reserveForDrag() to indicate
 * that your Node is intended for other input that should not be interrupted by this listener.
 *
 * For example usage, see scenery/examples/input.html. A typical "simple" MultiListener usage
 * would be something like:
 *
 *    display.addInputListener( new PressListener( targetNode ) );
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Jesse Greenberg
 */

import Property from '../../../axon/js/Property.js';
import Matrix from '../../../dot/js/Matrix.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import SingularValueDecomposition from '../../../dot/js/SingularValueDecomposition.js';
import Vector2 from '../../../dot/js/Vector2.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Intent, Mouse, scenery } from '../imports.js';

// constants
// pointer must move this much to initiate a move interruption for panning, in the global coordinate frame
const MOVE_INTERRUPT_MAGNITUDE = 25;
class MultiListener {
  /**
   * @constructor
   *
   * @param {Node} targetNode - The Node that should be transformed by this MultiListener.
   * @param {Object} [options] - See the constructor body (below) for documented options.
   */
  constructor(targetNode, options) {
    options = merge({
      // {number} - Restricts input to the specified mouse button (but allows any touch). Only one mouse button is
      // allowed at a time. The button numbers are defined in https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button,
      // where typically:
      //   0: Left mouse button
      //   1: Middle mouse button (or wheel press)
      //   2: Right mouse button
      //   3+: other specific numbered buttons that are more rare
      mouseButton: 0,
      // {string} - Sets the Pointer cursor to this cursor when the listener is "pressed".
      pressCursor: 'pointer',
      // {boolean} - If true, the listener will scale the targetNode from input
      allowScale: true,
      // {boolean} - If true, the listener will rotate the targetNode from input
      allowRotation: true,
      // {boolean} - if true, multitouch will interrupt any active pointer listeners and initiate translation
      // and scale from multitouch gestures
      allowMultitouchInterruption: false,
      // {private} - if true, a certain amount of movement in the global coordinate frame will interrupt any pointer
      // listeners and initiate translation from the pointer, unless default behavior has been prevented by
      // setting Intent on the Pointer.
      allowMoveInterruption: true,
      // {number} - magnitude limits for scaling in both x and y
      minScale: 1,
      maxScale: 4,
      // {Tandem}
      tandem: Tandem.REQUIRED
    }, options);

    // @private {Node} - the Node that will be transformed by this listener
    this._targetNode = targetNode;

    // @protected (read-only)
    this._minScale = options.minScale;
    this._maxScale = options.maxScale;

    // @private - see options
    this._mouseButton = options.mouseButton;
    this._pressCursor = options.pressCursor;
    this._allowScale = options.allowScale;
    this._allowRotation = options.allowRotation;
    this._allowMultitouchInterruption = options.allowMultitouchInterruption;
    this._allowMoveInterruption = options.allowMoveInterruption;

    // @private {Array.<Press>} - List of "active" Presses down from Pointer input which are actively changing
    // the transformation of the target Node
    this._presses = [];

    // @private {Array.<Press>} - List of "background" presses which are saved but not yet doing anything
    // for the target Node transformation. If the Pointer already has listeners, Presses are added to
    // the background and wait to be converted to "active" presses until we are allowed to interrupt
    // the other listeners. Related to options "allowMoveInterrupt" and "allowMultitouchInterrupt", where
    // other Pointer listeners are interrupted in these cases.
    this._backgroundPresses = [];

    // @protected {Property.<Matrix3>} - The matrix applied to the targetNode in response to various
    // input for the MultiListener
    this.matrixProperty = new Property(targetNode.matrix.copy(), {
      phetioValueType: Matrix3.Matrix3IO,
      tandem: options.tandem.createTandem('matrixProperty'),
      phetioReadOnly: true
    });

    // assign the matrix to the targetNode whenever it changes
    this.matrixProperty.link(matrix => {
      this._targetNode.matrix = matrix;
    });

    // @private {boolean} - Whether the listener was interrupted, in which case we may need to prevent certain
    // behavior. If the listener was interrupted, pointer listeners might still be called since input is dispatched to
    // a defensive copy of the Pointer's listeners. But presses will have been cleared in this case so we won't try
    // to do any work on them.
    this._interrupted = false;

    // @private - attached to the Pointer when a Press is added
    this._pressListener = {
      move: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer move');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.movePress(this.findPress(event.pointer));
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      up: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer up');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.removePress(this.findPress(event.pointer));
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      cancel: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer cancel');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        const press = this.findPress(event.pointer);
        press.interrupted = true;
        this.removePress(press);
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      interrupt: () => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener pointer interrupt');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();

        // For the future, we could figure out how to track the pointer that calls this
        this.interrupt();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      }
    };
    this._backgroundListener = {
      up: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener background up');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        if (!this._interrupted) {
          this.removeBackgroundPress(this.findBackgroundPress(event.pointer));
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      move: event => {
        // Any background press needs to meet certain conditions to be promoted to an actual press that pans/zooms
        const candidateBackgroundPresses = this._backgroundPresses.filter(press => {
          // Dragged pointers and pointers that haven't moved a certain distance are not candidates, and should not be
          // interrupted. We don't want to interrupt taps that might move a little bit
          return !press.pointer.hasIntent(Intent.DRAG) && press.initialPoint.distance(press.pointer.point) > MOVE_INTERRUPT_MAGNITUDE;
        });

        // If we are already zoomed in, we should promote any number of background presses to actual presses.
        // Otherwise, we'll need at least two presses to zoom
        // It is nice to allow down pointers to move around freely without interruption when there isn't any zoom,
        // but we still allow interruption if the number of background presses indicate the user is trying to
        // zoom in
        if (this.getCurrentScale() !== 1 || candidateBackgroundPresses.length >= 2) {
          sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener attached, interrupting for press');

          // Convert all candidate background presses to actual presses
          candidateBackgroundPresses.forEach(press => {
            this.removeBackgroundPress(press);
            this.interruptOtherListeners(press.pointer);
            this.addPress(press);
          });
        }
      },
      cancel: event => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener background cancel');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        if (!this._interrupted) {
          this.removeBackgroundPress(this.findBackgroundPress(event.pointer));
        }
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      },
      interrupt: () => {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener background interrupt');
        sceneryLog && sceneryLog.InputListener && sceneryLog.push();
        this.interrupt();
        sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
      }
    };
  }

  /**
   * Finds a Press by searching for the one with the provided Pointer.
   * @private
   * @param {Pointer} pointer
   * @returns {null|Press}
   */
  findPress(pointer) {
    for (let i = 0; i < this._presses.length; i++) {
      if (this._presses[i].pointer === pointer) {
        return this._presses[i];
      }
    }
    return null;
  }

  /**
   * Find a background Press by searching for one with the provided Pointer. A background Press is one created
   * when we receive an event while a Pointer is already attached.
   * @private
   *
   * @param {Pointer} pointer
   * @returns {null|Press}
   */
  findBackgroundPress(pointer) {
    for (let i = 0; i < this._backgroundPresses.length; i++) {
      if (this._backgroundPresses[i].pointer === pointer) {
        return this._backgroundPresses[i];
      }
    }
    return null;
  }

  /**
   * Returns true if the press is already contained in one of this._backgroundPresses or this._presses. There are cases
   * where we may try to add the same pointer twice (user opened context menu, using a mouse during fuzz testing), and
   * we want to avoid adding a press again in those cases.
   * @private
   *
   * @param {Press} press
   * @returns {boolean}
   */
  hasPress(press) {
    return _.some(this._presses.concat(this._backgroundPresses), existingPress => {
      return existingPress.pointer === press.pointer;
    });
  }

  /**
   * Interrupt all listeners on the pointer, except for background listeners that
   * were added by this MultiListener. Useful when it is time for this listener to
   * "take over" and interrupt any other listeners on the pointer.
   * @private
   *
   * @param {Pointer} pointer
   */
  interruptOtherListeners(pointer) {
    const listeners = pointer._listeners.slice();
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      if (listener !== this._backgroundListener) {
        listener.interrupt && listener.interrupt();
      }
    }
  }

  /**
   * Part of the scenery event API.
   * @public (scenery-internal)
   * @param event
   */
  down(event) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener down');
    if (event.pointer instanceof Mouse && event.domEvent.button !== this._mouseButton) {
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener abort: wrong mouse button');
      return;
    }

    // clears the flag for MultiListener behavior
    this._interrupted = false;
    let pressTrail;
    if (!_.includes(event.trail.nodes, this._targetNode)) {
      // if the target Node is not in the event trail, we assume that the event went to the
      // Display or the root Node of the scene graph - this will throw an assertion if
      // there are more than one trails found
      pressTrail = this._targetNode.getUniqueTrailTo(event.target);
    } else {
      pressTrail = event.trail.subtrailTo(this._targetNode, false);
    }
    assert && assert(_.includes(pressTrail.nodes, this._targetNode), 'targetNode must be in the Trail for Press');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    const press = new Press(event.pointer, pressTrail);
    if (!this._allowMoveInterruption && !this._allowMultitouchInterruption) {
      // most restrictive case, only allow presses if the pointer is not attached - Presses
      // are never added as background presses in this case because interruption is never allowed
      if (!event.pointer.isAttached()) {
        sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener unattached, using press');
        this.addPress(press);
      }
    } else {
      // we allow some form of interruption, add as background presses, and we will decide if they
      // should be converted to presses and interrupt other listeners on move event
      sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener attached, adding background press');
      this.addBackgroundPress(press);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Add a Press to this listener when a new Pointer is down.
   * @protected
   *
   * @param {Press} press
   */
  addPress(press) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener addPress');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    if (!this.hasPress(press)) {
      this._presses.push(press);
      press.pointer.cursor = this._pressCursor;
      press.pointer.addInputListener(this._pressListener, true);
      this.recomputeLocals();
      this.reposition();
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Reposition in response to movement of any Presses.
   * @private
   * @param press
   */
  movePress(press) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener movePress');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.reposition();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Remove a Press from this listener.
   * @protected
   *
   * @param {Press} press
   */
  removePress(press) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener removePress');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    press.pointer.removeInputListener(this._pressListener);
    press.pointer.cursor = null;
    arrayRemove(this._presses, press);
    this.recomputeLocals();
    this.reposition();
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Add a background Press, a Press that we receive while a Pointer is already attached. Depending on background
   * Presses, we may interrupt the attached pointer to begin zoom operations.
   * @private
   *
   * @param {Press} press
   */
  addBackgroundPress(press) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener addBackgroundPress');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();

    // It's possible that the press pointer already has the listener - for instance in Chrome we fail to get
    // "up" events once the context menu is open (like after a right click), so only add to the Pointer
    // if it isn't already added
    if (!this.hasPress(press)) {
      this._backgroundPresses.push(press);
      press.pointer.addInputListener(this._backgroundListener, false);
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Remove a background Press from this listener.
   * @private
   *
   * @param press
   */
  removeBackgroundPress(press) {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener removeBackgroundPress');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    press.pointer.removeInputListener(this._backgroundListener);
    arrayRemove(this._backgroundPresses, press);
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Reposition the target Node (including all apsects of transformation) of this listener's target Node.
   * @protected
   */
  reposition() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener reposition');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    this.matrixProperty.set(this.computeMatrix());
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Recompute the local points of the Presses for this listener, relative to the target Node.
   * @private
   */
  recomputeLocals() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener recomputeLocals');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    for (let i = 0; i < this._presses.length; i++) {
      this._presses[i].recomputeLocalPoint();
    }
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Interrupt this listener.
   * @public
   */
  interrupt() {
    sceneryLog && sceneryLog.InputListener && sceneryLog.InputListener('MultiListener interrupt');
    sceneryLog && sceneryLog.InputListener && sceneryLog.push();
    while (this._presses.length) {
      this.removePress(this._presses[this._presses.length - 1]);
    }
    while (this._backgroundPresses.length) {
      this.removeBackgroundPress(this._backgroundPresses[this._backgroundPresses.length - 1]);
    }
    this._interrupted = true;
    sceneryLog && sceneryLog.InputListener && sceneryLog.pop();
  }

  /**
   * Compute the transformation matrix for the target Node based on Presses.
   * @private
   *
   * @returns {Matrix3}
   */
  computeMatrix() {
    if (this._presses.length === 0) {
      return this._targetNode.getMatrix();
    } else if (this._presses.length === 1) {
      return this.computeSinglePressMatrix();
    } else if (this._allowScale && this._allowRotation) {
      return this.computeTranslationRotationScaleMatrix();
    } else if (this._allowScale) {
      return this.computeTranslationScaleMatrix();
    } else if (this._allowRotation) {
      return this.computeTranslationRotationMatrix();
    } else {
      return this.computeTranslationMatrix();
    }
  }

  /**
   * Compute a transformation matrix from a single press. Single press indicates translation (panning) for the
   * target Node.
   * @private
   *
   * @returns {Matrix3}
   */
  computeSinglePressMatrix() {
    const singleTargetPoint = this._presses[0].targetPoint;
    const singleMappedPoint = this._targetNode.localToParentPoint(this._presses[0].localPoint);
    const delta = singleTargetPoint.minus(singleMappedPoint);
    return Matrix3.translationFromVector(delta).timesMatrix(this._targetNode.getMatrix());
  }

  // @private
  /**
   * Compute a translation matrix from multiple presses. Usually multiple presses will have some scale or rotation
   * as well, but this is to be used if rotation and scale are not enabled for this listener.
   * @public
   *
   * @returns {Matrix3}
   */
  computeTranslationMatrix() {
    // translation only. linear least-squares simplifies to sum of differences
    const sum = new Vector2(0, 0);
    for (let i = 0; i < this._presses.length; i++) {
      sum.add(this._presses[i].targetPoint);
      sum.subtract(this._presses[i].localPoint);
    }
    return Matrix3.translationFromVector(sum.dividedScalar(this._presses.length));
  }

  /**
   * A transformation matrix from multiple Presses that will translate and scale the target Node.
   * @private
   *
   * @returns {Matrix3}
   */
  computeTranslationScaleMatrix() {
    const localPoints = this._presses.map(press => press.localPoint);
    const targetPoints = this._presses.map(press => press.targetPoint);
    const localCentroid = new Vector2(0, 0);
    const targetCentroid = new Vector2(0, 0);
    localPoints.forEach(localPoint => {
      localCentroid.add(localPoint);
    });
    targetPoints.forEach(targetPoint => {
      targetCentroid.add(targetPoint);
    });
    localCentroid.divideScalar(this._presses.length);
    targetCentroid.divideScalar(this._presses.length);
    let localSquaredDistance = 0;
    let targetSquaredDistance = 0;
    localPoints.forEach(localPoint => {
      localSquaredDistance += localPoint.distanceSquared(localCentroid);
    });
    targetPoints.forEach(targetPoint => {
      targetSquaredDistance += targetPoint.distanceSquared(targetCentroid);
    });

    // while fuzz testing, it is possible that the Press points are
    // exactly the same resulting in undefined scale - if that is the case
    // we will not adjust
    let scale = this.getCurrentScale();
    if (targetSquaredDistance !== 0) {
      scale = this.limitScale(Math.sqrt(targetSquaredDistance / localSquaredDistance));
    }
    const translateToTarget = Matrix3.translation(targetCentroid.x, targetCentroid.y);
    const translateFromLocal = Matrix3.translation(-localCentroid.x, -localCentroid.y);
    return translateToTarget.timesMatrix(Matrix3.scaling(scale)).timesMatrix(translateFromLocal);
  }

  /**
   * Limit the provided scale by constraints of this MultiListener.
   * @protected
   *
   * @param {number} scale
   * @returns {number}
   */
  limitScale(scale) {
    let correctedScale = Math.max(scale, this._minScale);
    correctedScale = Math.min(correctedScale, this._maxScale);
    return correctedScale;
  }

  /**
   * Compute a transformation matrix that will translate and scale the target Node from multiple presses. Should
   * be used when scaling is not enabled for this listener.
   * @private
   *
   * @returns {Matrix3}
   */
  computeTranslationRotationMatrix() {
    let i;
    const localMatrix = new Matrix(2, this._presses.length);
    const targetMatrix = new Matrix(2, this._presses.length);
    const localCentroid = new Vector2(0, 0);
    const targetCentroid = new Vector2(0, 0);
    for (i = 0; i < this._presses.length; i++) {
      const localPoint = this._presses[i].localPoint;
      const targetPoint = this._presses[i].targetPoint;
      localCentroid.add(localPoint);
      targetCentroid.add(targetPoint);
      localMatrix.set(0, i, localPoint.x);
      localMatrix.set(1, i, localPoint.y);
      targetMatrix.set(0, i, targetPoint.x);
      targetMatrix.set(1, i, targetPoint.y);
    }
    localCentroid.divideScalar(this._presses.length);
    targetCentroid.divideScalar(this._presses.length);

    // determine offsets from the centroids
    for (i = 0; i < this._presses.length; i++) {
      localMatrix.set(0, i, localMatrix.get(0, i) - localCentroid.x);
      localMatrix.set(1, i, localMatrix.get(1, i) - localCentroid.y);
      targetMatrix.set(0, i, targetMatrix.get(0, i) - targetCentroid.x);
      targetMatrix.set(1, i, targetMatrix.get(1, i) - targetCentroid.y);
    }
    const covarianceMatrix = localMatrix.times(targetMatrix.transpose());
    const svd = new SingularValueDecomposition(covarianceMatrix);
    let rotation = svd.getV().times(svd.getU().transpose());
    if (rotation.det() < 0) {
      rotation = svd.getV().times(Matrix.diagonalMatrix([1, -1])).times(svd.getU().transpose());
    }
    const rotation3 = new Matrix3().rowMajor(rotation.get(0, 0), rotation.get(0, 1), 0, rotation.get(1, 0), rotation.get(1, 1), 0, 0, 0, 1);
    const translation = targetCentroid.minus(rotation3.timesVector2(localCentroid));
    rotation3.set02(translation.x);
    rotation3.set12(translation.y);
    return rotation3;
  }

  /**
   * Compute a transformation matrix that will translate, scale, and rotate the target Node from multiple Presses.
   * @private
   *
   * @returns {Matrix3}
   */
  computeTranslationRotationScaleMatrix() {
    let i;
    const localMatrix = new Matrix(this._presses.length * 2, 4);
    for (i = 0; i < this._presses.length; i++) {
      // [ x  y 1 0 ]
      // [ y -x 0 1 ]
      const localPoint = this._presses[i].localPoint;
      localMatrix.set(2 * i + 0, 0, localPoint.x);
      localMatrix.set(2 * i + 0, 1, localPoint.y);
      localMatrix.set(2 * i + 0, 2, 1);
      localMatrix.set(2 * i + 1, 0, localPoint.y);
      localMatrix.set(2 * i + 1, 1, -localPoint.x);
      localMatrix.set(2 * i + 1, 3, 1);
    }
    const targetMatrix = new Matrix(this._presses.length * 2, 1);
    for (i = 0; i < this._presses.length; i++) {
      const targetPoint = this._presses[i].targetPoint;
      targetMatrix.set(2 * i + 0, 0, targetPoint.x);
      targetMatrix.set(2 * i + 1, 0, targetPoint.y);
    }
    const coefficientMatrix = SingularValueDecomposition.pseudoinverse(localMatrix).times(targetMatrix);
    const m11 = coefficientMatrix.get(0, 0);
    const m12 = coefficientMatrix.get(1, 0);
    const m13 = coefficientMatrix.get(2, 0);
    const m23 = coefficientMatrix.get(3, 0);
    return new Matrix3().rowMajor(m11, m12, m13, -m12, m11, m23, 0, 0, 1);
  }

  /**
   * Get the current scale on the target Node, assumes that there is isometric scaling in both x and y.
   *
   * @public
   * @returns {number}
   */
  getCurrentScale() {
    return this._targetNode.getScaleVector().x;
  }

  /**
   * Reset transform on the target Node.
   *
   * @public
   */
  resetTransform() {
    this._targetNode.resetTransform();
    this.matrixProperty.set(this._targetNode.matrix.copy());
  }
}
scenery.register('MultiListener', MultiListener);

/**
 * A logical "press" for the MultiListener, capturing information when a Pointer goes down on the screen.
 */
class Press {
  constructor(pointer, trail) {
    this.pointer = pointer;
    this.trail = trail;
    this.interrupted = false;

    // @public (read-only) {Vector2} - down point for the new press, in the global coordinate frame
    this.initialPoint = pointer.point;
    this.localPoint = null;
    this.recomputeLocalPoint();
  }

  /**
   * Compute the local point for this Press, which is the local point for the leaf Node of this Press's Trail.
   * @public
   */
  recomputeLocalPoint() {
    this.localPoint = this.trail.globalToLocalPoint(this.pointer.point);
  }

  /**
   * The parent point of this press, relative to the leaf Node of this Press's Trail.
   * @public
   * @returns {Vector2}
   */
  get targetPoint() {
    return this.trail.globalToParentPoint(this.pointer.point);
  }
}
export default MultiListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIk1hdHJpeCIsIk1hdHJpeDMiLCJTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbiIsIlZlY3RvcjIiLCJhcnJheVJlbW92ZSIsIm1lcmdlIiwiVGFuZGVtIiwiSW50ZW50IiwiTW91c2UiLCJzY2VuZXJ5IiwiTU9WRV9JTlRFUlJVUFRfTUFHTklUVURFIiwiTXVsdGlMaXN0ZW5lciIsImNvbnN0cnVjdG9yIiwidGFyZ2V0Tm9kZSIsIm9wdGlvbnMiLCJtb3VzZUJ1dHRvbiIsInByZXNzQ3Vyc29yIiwiYWxsb3dTY2FsZSIsImFsbG93Um90YXRpb24iLCJhbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRpb24iLCJhbGxvd01vdmVJbnRlcnJ1cHRpb24iLCJtaW5TY2FsZSIsIm1heFNjYWxlIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJfdGFyZ2V0Tm9kZSIsIl9taW5TY2FsZSIsIl9tYXhTY2FsZSIsIl9tb3VzZUJ1dHRvbiIsIl9wcmVzc0N1cnNvciIsIl9hbGxvd1NjYWxlIiwiX2FsbG93Um90YXRpb24iLCJfYWxsb3dNdWx0aXRvdWNoSW50ZXJydXB0aW9uIiwiX2FsbG93TW92ZUludGVycnVwdGlvbiIsIl9wcmVzc2VzIiwiX2JhY2tncm91bmRQcmVzc2VzIiwibWF0cml4UHJvcGVydHkiLCJtYXRyaXgiLCJjb3B5IiwicGhldGlvVmFsdWVUeXBlIiwiTWF0cml4M0lPIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJsaW5rIiwiX2ludGVycnVwdGVkIiwiX3ByZXNzTGlzdGVuZXIiLCJtb3ZlIiwiZXZlbnQiLCJzY2VuZXJ5TG9nIiwiSW5wdXRMaXN0ZW5lciIsInB1c2giLCJtb3ZlUHJlc3MiLCJmaW5kUHJlc3MiLCJwb2ludGVyIiwicG9wIiwidXAiLCJyZW1vdmVQcmVzcyIsImNhbmNlbCIsInByZXNzIiwiaW50ZXJydXB0ZWQiLCJpbnRlcnJ1cHQiLCJfYmFja2dyb3VuZExpc3RlbmVyIiwicmVtb3ZlQmFja2dyb3VuZFByZXNzIiwiZmluZEJhY2tncm91bmRQcmVzcyIsImNhbmRpZGF0ZUJhY2tncm91bmRQcmVzc2VzIiwiZmlsdGVyIiwiaGFzSW50ZW50IiwiRFJBRyIsImluaXRpYWxQb2ludCIsImRpc3RhbmNlIiwicG9pbnQiLCJnZXRDdXJyZW50U2NhbGUiLCJsZW5ndGgiLCJmb3JFYWNoIiwiaW50ZXJydXB0T3RoZXJMaXN0ZW5lcnMiLCJhZGRQcmVzcyIsImkiLCJoYXNQcmVzcyIsIl8iLCJzb21lIiwiY29uY2F0IiwiZXhpc3RpbmdQcmVzcyIsImxpc3RlbmVycyIsIl9saXN0ZW5lcnMiLCJzbGljZSIsImxpc3RlbmVyIiwiZG93biIsImRvbUV2ZW50IiwiYnV0dG9uIiwicHJlc3NUcmFpbCIsImluY2x1ZGVzIiwidHJhaWwiLCJub2RlcyIsImdldFVuaXF1ZVRyYWlsVG8iLCJ0YXJnZXQiLCJzdWJ0cmFpbFRvIiwiYXNzZXJ0IiwiUHJlc3MiLCJpc0F0dGFjaGVkIiwiYWRkQmFja2dyb3VuZFByZXNzIiwiY3Vyc29yIiwiYWRkSW5wdXRMaXN0ZW5lciIsInJlY29tcHV0ZUxvY2FscyIsInJlcG9zaXRpb24iLCJyZW1vdmVJbnB1dExpc3RlbmVyIiwic2V0IiwiY29tcHV0ZU1hdHJpeCIsInJlY29tcHV0ZUxvY2FsUG9pbnQiLCJnZXRNYXRyaXgiLCJjb21wdXRlU2luZ2xlUHJlc3NNYXRyaXgiLCJjb21wdXRlVHJhbnNsYXRpb25Sb3RhdGlvblNjYWxlTWF0cml4IiwiY29tcHV0ZVRyYW5zbGF0aW9uU2NhbGVNYXRyaXgiLCJjb21wdXRlVHJhbnNsYXRpb25Sb3RhdGlvbk1hdHJpeCIsImNvbXB1dGVUcmFuc2xhdGlvbk1hdHJpeCIsInNpbmdsZVRhcmdldFBvaW50IiwidGFyZ2V0UG9pbnQiLCJzaW5nbGVNYXBwZWRQb2ludCIsImxvY2FsVG9QYXJlbnRQb2ludCIsImxvY2FsUG9pbnQiLCJkZWx0YSIsIm1pbnVzIiwidHJhbnNsYXRpb25Gcm9tVmVjdG9yIiwidGltZXNNYXRyaXgiLCJzdW0iLCJhZGQiLCJzdWJ0cmFjdCIsImRpdmlkZWRTY2FsYXIiLCJsb2NhbFBvaW50cyIsIm1hcCIsInRhcmdldFBvaW50cyIsImxvY2FsQ2VudHJvaWQiLCJ0YXJnZXRDZW50cm9pZCIsImRpdmlkZVNjYWxhciIsImxvY2FsU3F1YXJlZERpc3RhbmNlIiwidGFyZ2V0U3F1YXJlZERpc3RhbmNlIiwiZGlzdGFuY2VTcXVhcmVkIiwic2NhbGUiLCJsaW1pdFNjYWxlIiwiTWF0aCIsInNxcnQiLCJ0cmFuc2xhdGVUb1RhcmdldCIsInRyYW5zbGF0aW9uIiwieCIsInkiLCJ0cmFuc2xhdGVGcm9tTG9jYWwiLCJzY2FsaW5nIiwiY29ycmVjdGVkU2NhbGUiLCJtYXgiLCJtaW4iLCJsb2NhbE1hdHJpeCIsInRhcmdldE1hdHJpeCIsImdldCIsImNvdmFyaWFuY2VNYXRyaXgiLCJ0aW1lcyIsInRyYW5zcG9zZSIsInN2ZCIsInJvdGF0aW9uIiwiZ2V0ViIsImdldFUiLCJkZXQiLCJkaWFnb25hbE1hdHJpeCIsInJvdGF0aW9uMyIsInJvd01ham9yIiwidGltZXNWZWN0b3IyIiwic2V0MDIiLCJzZXQxMiIsImNvZWZmaWNpZW50TWF0cml4IiwicHNldWRvaW52ZXJzZSIsIm0xMSIsIm0xMiIsIm0xMyIsIm0yMyIsImdldFNjYWxlVmVjdG9yIiwicmVzZXRUcmFuc2Zvcm0iLCJyZWdpc3RlciIsImdsb2JhbFRvTG9jYWxQb2ludCIsImdsb2JhbFRvUGFyZW50UG9pbnQiXSwic291cmNlcyI6WyJNdWx0aUxpc3RlbmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE11bHRpTGlzdGVuZXIgaXMgcmVzcG9uc2libGUgZm9yIG1vbml0b3JpbmcgdGhlIG1vdXNlLCB0b3VjaCwgYW5kIG90aGVyIHByZXNzZXMgb24gdGhlIHNjcmVlbiBhbmQgZGV0ZXJtaW5lcyB0aGVcclxuICogb3BlcmF0aW9ucyB0byBhcHBseSB0byBhIHRhcmdldCBOb2RlIGZyb20gdGhpcyBpbnB1dC4gU2luZ2xlIHRvdWNoIGRyYWdnaW5nIG9uIHRoZSBzY3JlZW4gd2lsbCBpbml0aWF0ZVxyXG4gKiBwYW5uaW5nLiBNdWx0aS10b3VjaCBnZXN0dXJlcyB3aWxsIGluaXRpYXRlIHNjYWxpbmcsIHRyYW5zbGF0aW9uLCBhbmQgcG90ZW50aWFsbHkgcm90YXRpb24gZGVwZW5kaW5nIG9uXHJcbiAqIHRoZSBnZXN0dXJlLlxyXG4gKlxyXG4gKiBNdWx0aUxpc3RlbmVyIHdpbGwga2VlcCB0cmFjayBvZiBhbGwgXCJiYWNrZ3JvdW5kXCIgcHJlc3NlcyBvbiB0aGUgc2NyZWVuLiBXaGVuIGNlcnRhaW4gY29uZGl0aW9ucyBhcmUgbWV0LCB0aGVcclxuICogXCJiYWNrZ3JvdW5kXCIgcHJlc3NlcyBiZWNvbWUgYWN0aXZlIGFuZCBhdHRhY2hlZCBsaXN0ZW5lcnMgbWF5IGJlIGludGVycnVwdGVkIHNvIHRoYXQgdGhlIE11bHRpTGlzdGVuZXJcclxuICogZ2VzdHVyZXMgdGFrZSBwcmVjZWRlbmNlLiBNdWx0aUxpc3RlbmVyIHVzZXMgdGhlIEludGVudCBmZWF0dXJlIG9mIFBvaW50ZXIsIHNvIHRoYXQgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhpc1xyXG4gKiBsaXN0ZW5lciBjYW4gYmUgcHJldmVudGVkIGlmIG5lY2Vzc2FyeS4gR2VuZXJhbGx5LCB5b3Ugd291bGQgdXNlIFBvaW50ZXIucmVzZXJ2ZUZvckRyYWcoKSB0byBpbmRpY2F0ZVxyXG4gKiB0aGF0IHlvdXIgTm9kZSBpcyBpbnRlbmRlZCBmb3Igb3RoZXIgaW5wdXQgdGhhdCBzaG91bGQgbm90IGJlIGludGVycnVwdGVkIGJ5IHRoaXMgbGlzdGVuZXIuXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlIHVzYWdlLCBzZWUgc2NlbmVyeS9leGFtcGxlcy9pbnB1dC5odG1sLiBBIHR5cGljYWwgXCJzaW1wbGVcIiBNdWx0aUxpc3RlbmVyIHVzYWdlXHJcbiAqIHdvdWxkIGJlIHNvbWV0aGluZyBsaWtlOlxyXG4gKlxyXG4gKiAgICBkaXNwbGF5LmFkZElucHV0TGlzdGVuZXIoIG5ldyBQcmVzc0xpc3RlbmVyKCB0YXJnZXROb2RlICkgKTtcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeCBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgU2luZ3VsYXJWYWx1ZURlY29tcG9zaXRpb24gZnJvbSAnLi4vLi4vLi4vZG90L2pzL1Npbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCB7IEludGVudCwgTW91c2UsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBwb2ludGVyIG11c3QgbW92ZSB0aGlzIG11Y2ggdG8gaW5pdGlhdGUgYSBtb3ZlIGludGVycnVwdGlvbiBmb3IgcGFubmluZywgaW4gdGhlIGdsb2JhbCBjb29yZGluYXRlIGZyYW1lXHJcbmNvbnN0IE1PVkVfSU5URVJSVVBUX01BR05JVFVERSA9IDI1O1xyXG5cclxuY2xhc3MgTXVsdGlMaXN0ZW5lciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjb25zdHJ1Y3RvclxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSB0YXJnZXROb2RlIC0gVGhlIE5vZGUgdGhhdCBzaG91bGQgYmUgdHJhbnNmb3JtZWQgYnkgdGhpcyBNdWx0aUxpc3RlbmVyLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSBTZWUgdGhlIGNvbnN0cnVjdG9yIGJvZHkgKGJlbG93KSBmb3IgZG9jdW1lbnRlZCBvcHRpb25zLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YXJnZXROb2RlLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSBSZXN0cmljdHMgaW5wdXQgdG8gdGhlIHNwZWNpZmllZCBtb3VzZSBidXR0b24gKGJ1dCBhbGxvd3MgYW55IHRvdWNoKS4gT25seSBvbmUgbW91c2UgYnV0dG9uIGlzXHJcbiAgICAgIC8vIGFsbG93ZWQgYXQgYSB0aW1lLiBUaGUgYnV0dG9uIG51bWJlcnMgYXJlIGRlZmluZWQgaW4gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL01vdXNlRXZlbnQvYnV0dG9uLFxyXG4gICAgICAvLyB3aGVyZSB0eXBpY2FsbHk6XHJcbiAgICAgIC8vICAgMDogTGVmdCBtb3VzZSBidXR0b25cclxuICAgICAgLy8gICAxOiBNaWRkbGUgbW91c2UgYnV0dG9uIChvciB3aGVlbCBwcmVzcylcclxuICAgICAgLy8gICAyOiBSaWdodCBtb3VzZSBidXR0b25cclxuICAgICAgLy8gICAzKzogb3RoZXIgc3BlY2lmaWMgbnVtYmVyZWQgYnV0dG9ucyB0aGF0IGFyZSBtb3JlIHJhcmVcclxuICAgICAgbW91c2VCdXR0b246IDAsXHJcblxyXG4gICAgICAvLyB7c3RyaW5nfSAtIFNldHMgdGhlIFBvaW50ZXIgY3Vyc29yIHRvIHRoaXMgY3Vyc29yIHdoZW4gdGhlIGxpc3RlbmVyIGlzIFwicHJlc3NlZFwiLlxyXG4gICAgICBwcmVzc0N1cnNvcjogJ3BvaW50ZXInLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhlIGxpc3RlbmVyIHdpbGwgc2NhbGUgdGhlIHRhcmdldE5vZGUgZnJvbSBpbnB1dFxyXG4gICAgICBhbGxvd1NjYWxlOiB0cnVlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gSWYgdHJ1ZSwgdGhlIGxpc3RlbmVyIHdpbGwgcm90YXRlIHRoZSB0YXJnZXROb2RlIGZyb20gaW5wdXRcclxuICAgICAgYWxsb3dSb3RhdGlvbjogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGlmIHRydWUsIG11bHRpdG91Y2ggd2lsbCBpbnRlcnJ1cHQgYW55IGFjdGl2ZSBwb2ludGVyIGxpc3RlbmVycyBhbmQgaW5pdGlhdGUgdHJhbnNsYXRpb25cclxuICAgICAgLy8gYW5kIHNjYWxlIGZyb20gbXVsdGl0b3VjaCBnZXN0dXJlc1xyXG4gICAgICBhbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRpb246IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge3ByaXZhdGV9IC0gaWYgdHJ1ZSwgYSBjZXJ0YWluIGFtb3VudCBvZiBtb3ZlbWVudCBpbiB0aGUgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgd2lsbCBpbnRlcnJ1cHQgYW55IHBvaW50ZXJcclxuICAgICAgLy8gbGlzdGVuZXJzIGFuZCBpbml0aWF0ZSB0cmFuc2xhdGlvbiBmcm9tIHRoZSBwb2ludGVyLCB1bmxlc3MgZGVmYXVsdCBiZWhhdmlvciBoYXMgYmVlbiBwcmV2ZW50ZWQgYnlcclxuICAgICAgLy8gc2V0dGluZyBJbnRlbnQgb24gdGhlIFBvaW50ZXIuXHJcbiAgICAgIGFsbG93TW92ZUludGVycnVwdGlvbjogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIHtudW1iZXJ9IC0gbWFnbml0dWRlIGxpbWl0cyBmb3Igc2NhbGluZyBpbiBib3RoIHggYW5kIHlcclxuICAgICAgbWluU2NhbGU6IDEsXHJcbiAgICAgIG1heFNjYWxlOiA0LFxyXG5cclxuICAgICAgLy8ge1RhbmRlbX1cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Tm9kZX0gLSB0aGUgTm9kZSB0aGF0IHdpbGwgYmUgdHJhbnNmb3JtZWQgYnkgdGhpcyBsaXN0ZW5lclxyXG4gICAgdGhpcy5fdGFyZ2V0Tm9kZSA9IHRhcmdldE5vZGU7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5fbWluU2NhbGUgPSBvcHRpb25zLm1pblNjYWxlO1xyXG4gICAgdGhpcy5fbWF4U2NhbGUgPSBvcHRpb25zLm1heFNjYWxlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gc2VlIG9wdGlvbnNcclxuICAgIHRoaXMuX21vdXNlQnV0dG9uID0gb3B0aW9ucy5tb3VzZUJ1dHRvbjtcclxuICAgIHRoaXMuX3ByZXNzQ3Vyc29yID0gb3B0aW9ucy5wcmVzc0N1cnNvcjtcclxuICAgIHRoaXMuX2FsbG93U2NhbGUgPSBvcHRpb25zLmFsbG93U2NhbGU7XHJcbiAgICB0aGlzLl9hbGxvd1JvdGF0aW9uID0gb3B0aW9ucy5hbGxvd1JvdGF0aW9uO1xyXG4gICAgdGhpcy5fYWxsb3dNdWx0aXRvdWNoSW50ZXJydXB0aW9uID0gb3B0aW9ucy5hbGxvd011bHRpdG91Y2hJbnRlcnJ1cHRpb247XHJcbiAgICB0aGlzLl9hbGxvd01vdmVJbnRlcnJ1cHRpb24gPSBvcHRpb25zLmFsbG93TW92ZUludGVycnVwdGlvbjtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFByZXNzPn0gLSBMaXN0IG9mIFwiYWN0aXZlXCIgUHJlc3NlcyBkb3duIGZyb20gUG9pbnRlciBpbnB1dCB3aGljaCBhcmUgYWN0aXZlbHkgY2hhbmdpbmdcclxuICAgIC8vIHRoZSB0cmFuc2Zvcm1hdGlvbiBvZiB0aGUgdGFyZ2V0IE5vZGVcclxuICAgIHRoaXMuX3ByZXNzZXMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPFByZXNzPn0gLSBMaXN0IG9mIFwiYmFja2dyb3VuZFwiIHByZXNzZXMgd2hpY2ggYXJlIHNhdmVkIGJ1dCBub3QgeWV0IGRvaW5nIGFueXRoaW5nXHJcbiAgICAvLyBmb3IgdGhlIHRhcmdldCBOb2RlIHRyYW5zZm9ybWF0aW9uLiBJZiB0aGUgUG9pbnRlciBhbHJlYWR5IGhhcyBsaXN0ZW5lcnMsIFByZXNzZXMgYXJlIGFkZGVkIHRvXHJcbiAgICAvLyB0aGUgYmFja2dyb3VuZCBhbmQgd2FpdCB0byBiZSBjb252ZXJ0ZWQgdG8gXCJhY3RpdmVcIiBwcmVzc2VzIHVudGlsIHdlIGFyZSBhbGxvd2VkIHRvIGludGVycnVwdFxyXG4gICAgLy8gdGhlIG90aGVyIGxpc3RlbmVycy4gUmVsYXRlZCB0byBvcHRpb25zIFwiYWxsb3dNb3ZlSW50ZXJydXB0XCIgYW5kIFwiYWxsb3dNdWx0aXRvdWNoSW50ZXJydXB0XCIsIHdoZXJlXHJcbiAgICAvLyBvdGhlciBQb2ludGVyIGxpc3RlbmVycyBhcmUgaW50ZXJydXB0ZWQgaW4gdGhlc2UgY2FzZXMuXHJcbiAgICB0aGlzLl9iYWNrZ3JvdW5kUHJlc3NlcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQge1Byb3BlcnR5LjxNYXRyaXgzPn0gLSBUaGUgbWF0cml4IGFwcGxpZWQgdG8gdGhlIHRhcmdldE5vZGUgaW4gcmVzcG9uc2UgdG8gdmFyaW91c1xyXG4gICAgLy8gaW5wdXQgZm9yIHRoZSBNdWx0aUxpc3RlbmVyXHJcbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB0YXJnZXROb2RlLm1hdHJpeC5jb3B5KCksIHtcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBNYXRyaXgzLk1hdHJpeDNJTyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXRyaXhQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhc3NpZ24gdGhlIG1hdHJpeCB0byB0aGUgdGFyZ2V0Tm9kZSB3aGVuZXZlciBpdCBjaGFuZ2VzXHJcbiAgICB0aGlzLm1hdHJpeFByb3BlcnR5LmxpbmsoIG1hdHJpeCA9PiB7XHJcbiAgICAgIHRoaXMuX3RhcmdldE5vZGUubWF0cml4ID0gbWF0cml4O1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIGxpc3RlbmVyIHdhcyBpbnRlcnJ1cHRlZCwgaW4gd2hpY2ggY2FzZSB3ZSBtYXkgbmVlZCB0byBwcmV2ZW50IGNlcnRhaW5cclxuICAgIC8vIGJlaGF2aW9yLiBJZiB0aGUgbGlzdGVuZXIgd2FzIGludGVycnVwdGVkLCBwb2ludGVyIGxpc3RlbmVycyBtaWdodCBzdGlsbCBiZSBjYWxsZWQgc2luY2UgaW5wdXQgaXMgZGlzcGF0Y2hlZCB0b1xyXG4gICAgLy8gYSBkZWZlbnNpdmUgY29weSBvZiB0aGUgUG9pbnRlcidzIGxpc3RlbmVycy4gQnV0IHByZXNzZXMgd2lsbCBoYXZlIGJlZW4gY2xlYXJlZCBpbiB0aGlzIGNhc2Ugc28gd2Ugd29uJ3QgdHJ5XHJcbiAgICAvLyB0byBkbyBhbnkgd29yayBvbiB0aGVtLlxyXG4gICAgdGhpcy5faW50ZXJydXB0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGF0dGFjaGVkIHRvIHRoZSBQb2ludGVyIHdoZW4gYSBQcmVzcyBpcyBhZGRlZFxyXG4gICAgdGhpcy5fcHJlc3NMaXN0ZW5lciA9IHtcclxuICAgICAgbW92ZTogZXZlbnQgPT4ge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcG9pbnRlciBtb3ZlJyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmVQcmVzcyggdGhpcy5maW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKSApO1xyXG5cclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgdXA6IGV2ZW50ID0+IHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHBvaW50ZXIgdXAnICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlUHJlc3MoIHRoaXMuZmluZFByZXNzKCBldmVudC5wb2ludGVyICkgKTtcclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGNhbmNlbDogZXZlbnQgPT4ge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcG9pbnRlciBjYW5jZWwnICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHByZXNzID0gdGhpcy5maW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKTtcclxuICAgICAgICBwcmVzcy5pbnRlcnJ1cHRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlUHJlc3MoIHByZXNzICk7XHJcblxyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBpbnRlcnJ1cHQ6ICgpID0+IHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHBvaW50ZXIgaW50ZXJydXB0JyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICAvLyBGb3IgdGhlIGZ1dHVyZSwgd2UgY291bGQgZmlndXJlIG91dCBob3cgdG8gdHJhY2sgdGhlIHBvaW50ZXIgdGhhdCBjYWxscyB0aGlzXHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHQoKTtcclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9iYWNrZ3JvdW5kTGlzdGVuZXIgPSB7XHJcbiAgICAgIHVwOiBldmVudCA9PiB7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciBiYWNrZ3JvdW5kIHVwJyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICBpZiAoICF0aGlzLl9pbnRlcnJ1cHRlZCApIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlQmFja2dyb3VuZFByZXNzKCB0aGlzLmZpbmRCYWNrZ3JvdW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIG1vdmU6IGV2ZW50ID0+IHtcclxuXHJcbiAgICAgICAgLy8gQW55IGJhY2tncm91bmQgcHJlc3MgbmVlZHMgdG8gbWVldCBjZXJ0YWluIGNvbmRpdGlvbnMgdG8gYmUgcHJvbW90ZWQgdG8gYW4gYWN0dWFsIHByZXNzIHRoYXQgcGFucy96b29tc1xyXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZUJhY2tncm91bmRQcmVzc2VzID0gdGhpcy5fYmFja2dyb3VuZFByZXNzZXMuZmlsdGVyKCBwcmVzcyA9PiB7XHJcblxyXG4gICAgICAgICAgLy8gRHJhZ2dlZCBwb2ludGVycyBhbmQgcG9pbnRlcnMgdGhhdCBoYXZlbid0IG1vdmVkIGEgY2VydGFpbiBkaXN0YW5jZSBhcmUgbm90IGNhbmRpZGF0ZXMsIGFuZCBzaG91bGQgbm90IGJlXHJcbiAgICAgICAgICAvLyBpbnRlcnJ1cHRlZC4gV2UgZG9uJ3Qgd2FudCB0byBpbnRlcnJ1cHQgdGFwcyB0aGF0IG1pZ2h0IG1vdmUgYSBsaXR0bGUgYml0XHJcbiAgICAgICAgICByZXR1cm4gIXByZXNzLnBvaW50ZXIuaGFzSW50ZW50KCBJbnRlbnQuRFJBRyApICYmIHByZXNzLmluaXRpYWxQb2ludC5kaXN0YW5jZSggcHJlc3MucG9pbnRlci5wb2ludCApID4gTU9WRV9JTlRFUlJVUFRfTUFHTklUVURFO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gSWYgd2UgYXJlIGFscmVhZHkgem9vbWVkIGluLCB3ZSBzaG91bGQgcHJvbW90ZSBhbnkgbnVtYmVyIG9mIGJhY2tncm91bmQgcHJlc3NlcyB0byBhY3R1YWwgcHJlc3Nlcy5cclxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlJ2xsIG5lZWQgYXQgbGVhc3QgdHdvIHByZXNzZXMgdG8gem9vbVxyXG4gICAgICAgIC8vIEl0IGlzIG5pY2UgdG8gYWxsb3cgZG93biBwb2ludGVycyB0byBtb3ZlIGFyb3VuZCBmcmVlbHkgd2l0aG91dCBpbnRlcnJ1cHRpb24gd2hlbiB0aGVyZSBpc24ndCBhbnkgem9vbSxcclxuICAgICAgICAvLyBidXQgd2Ugc3RpbGwgYWxsb3cgaW50ZXJydXB0aW9uIGlmIHRoZSBudW1iZXIgb2YgYmFja2dyb3VuZCBwcmVzc2VzIGluZGljYXRlIHRoZSB1c2VyIGlzIHRyeWluZyB0b1xyXG4gICAgICAgIC8vIHpvb20gaW5cclxuICAgICAgICBpZiAoIHRoaXMuZ2V0Q3VycmVudFNjYWxlKCkgIT09IDEgfHwgY2FuZGlkYXRlQmFja2dyb3VuZFByZXNzZXMubGVuZ3RoID49IDIgKSB7XHJcbiAgICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGF0dGFjaGVkLCBpbnRlcnJ1cHRpbmcgZm9yIHByZXNzJyApO1xyXG5cclxuICAgICAgICAgIC8vIENvbnZlcnQgYWxsIGNhbmRpZGF0ZSBiYWNrZ3JvdW5kIHByZXNzZXMgdG8gYWN0dWFsIHByZXNzZXNcclxuICAgICAgICAgIGNhbmRpZGF0ZUJhY2tncm91bmRQcmVzc2VzLmZvckVhY2goIHByZXNzID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVCYWNrZ3JvdW5kUHJlc3MoIHByZXNzICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJydXB0T3RoZXJMaXN0ZW5lcnMoIHByZXNzLnBvaW50ZXIgKTtcclxuICAgICAgICAgICAgdGhpcy5hZGRQcmVzcyggcHJlc3MgKTtcclxuICAgICAgICAgIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBjYW5jZWw6IGV2ZW50ID0+IHtcclxuICAgICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGJhY2tncm91bmQgY2FuY2VsJyApO1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgICAgICBpZiAoICF0aGlzLl9pbnRlcnJ1cHRlZCApIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlQmFja2dyb3VuZFByZXNzKCB0aGlzLmZpbmRCYWNrZ3JvdW5kUHJlc3MoIGV2ZW50LnBvaW50ZXIgKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGludGVycnVwdDogKCkgPT4ge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgYmFja2dyb3VuZCBpbnRlcnJ1cHQnICk7XHJcbiAgICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0KCk7XHJcblxyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kcyBhIFByZXNzIGJ5IHNlYXJjaGluZyBmb3IgdGhlIG9uZSB3aXRoIHRoZSBwcm92aWRlZCBQb2ludGVyLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtQb2ludGVyfSBwb2ludGVyXHJcbiAgICogQHJldHVybnMge251bGx8UHJlc3N9XHJcbiAgICovXHJcbiAgZmluZFByZXNzKCBwb2ludGVyICkge1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLl9wcmVzc2VzWyBpIF0ucG9pbnRlciA9PT0gcG9pbnRlciApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcHJlc3Nlc1sgaSBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgYSBiYWNrZ3JvdW5kIFByZXNzIGJ5IHNlYXJjaGluZyBmb3Igb25lIHdpdGggdGhlIHByb3ZpZGVkIFBvaW50ZXIuIEEgYmFja2dyb3VuZCBQcmVzcyBpcyBvbmUgY3JlYXRlZFxyXG4gICAqIHdoZW4gd2UgcmVjZWl2ZSBhbiBldmVudCB3aGlsZSBhIFBvaW50ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQb2ludGVyfSBwb2ludGVyXHJcbiAgICogQHJldHVybnMge251bGx8UHJlc3N9XHJcbiAgICovXHJcbiAgZmluZEJhY2tncm91bmRQcmVzcyggcG9pbnRlciApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuX2JhY2tncm91bmRQcmVzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzWyBpIF0ucG9pbnRlciA9PT0gcG9pbnRlciApIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZFByZXNzZXNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHByZXNzIGlzIGFscmVhZHkgY29udGFpbmVkIGluIG9uZSBvZiB0aGlzLl9iYWNrZ3JvdW5kUHJlc3NlcyBvciB0aGlzLl9wcmVzc2VzLiBUaGVyZSBhcmUgY2FzZXNcclxuICAgKiB3aGVyZSB3ZSBtYXkgdHJ5IHRvIGFkZCB0aGUgc2FtZSBwb2ludGVyIHR3aWNlICh1c2VyIG9wZW5lZCBjb250ZXh0IG1lbnUsIHVzaW5nIGEgbW91c2UgZHVyaW5nIGZ1enogdGVzdGluZyksIGFuZFxyXG4gICAqIHdlIHdhbnQgdG8gYXZvaWQgYWRkaW5nIGEgcHJlc3MgYWdhaW4gaW4gdGhvc2UgY2FzZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UHJlc3N9IHByZXNzXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaGFzUHJlc3MoIHByZXNzICkge1xyXG4gICAgcmV0dXJuIF8uc29tZSggdGhpcy5fcHJlc3Nlcy5jb25jYXQoIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzICksIGV4aXN0aW5nUHJlc3MgPT4ge1xyXG4gICAgICByZXR1cm4gZXhpc3RpbmdQcmVzcy5wb2ludGVyID09PSBwcmVzcy5wb2ludGVyO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW50ZXJydXB0IGFsbCBsaXN0ZW5lcnMgb24gdGhlIHBvaW50ZXIsIGV4Y2VwdCBmb3IgYmFja2dyb3VuZCBsaXN0ZW5lcnMgdGhhdFxyXG4gICAqIHdlcmUgYWRkZWQgYnkgdGhpcyBNdWx0aUxpc3RlbmVyLiBVc2VmdWwgd2hlbiBpdCBpcyB0aW1lIGZvciB0aGlzIGxpc3RlbmVyIHRvXHJcbiAgICogXCJ0YWtlIG92ZXJcIiBhbmQgaW50ZXJydXB0IGFueSBvdGhlciBsaXN0ZW5lcnMgb24gdGhlIHBvaW50ZXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UG9pbnRlcn0gcG9pbnRlclxyXG4gICAqL1xyXG4gIGludGVycnVwdE90aGVyTGlzdGVuZXJzKCBwb2ludGVyICkge1xyXG4gICAgY29uc3QgbGlzdGVuZXJzID0gcG9pbnRlci5fbGlzdGVuZXJzLnNsaWNlKCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gbGlzdGVuZXJzWyBpIF07XHJcbiAgICAgIGlmICggbGlzdGVuZXIgIT09IHRoaXMuX2JhY2tncm91bmRMaXN0ZW5lciApIHtcclxuICAgICAgICBsaXN0ZW5lci5pbnRlcnJ1cHQgJiYgbGlzdGVuZXIuaW50ZXJydXB0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBhcnQgb2YgdGhlIHNjZW5lcnkgZXZlbnQgQVBJLlxyXG4gICAqIEBwdWJsaWMgKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICogQHBhcmFtIGV2ZW50XHJcbiAgICovXHJcbiAgZG93biggZXZlbnQgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGRvd24nICk7XHJcblxyXG4gICAgaWYgKCBldmVudC5wb2ludGVyIGluc3RhbmNlb2YgTW91c2UgJiYgZXZlbnQuZG9tRXZlbnQuYnV0dG9uICE9PSB0aGlzLl9tb3VzZUJ1dHRvbiApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciBhYm9ydDogd3JvbmcgbW91c2UgYnV0dG9uJyApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXJzIHRoZSBmbGFnIGZvciBNdWx0aUxpc3RlbmVyIGJlaGF2aW9yXHJcbiAgICB0aGlzLl9pbnRlcnJ1cHRlZCA9IGZhbHNlO1xyXG5cclxuICAgIGxldCBwcmVzc1RyYWlsO1xyXG4gICAgaWYgKCAhXy5pbmNsdWRlcyggZXZlbnQudHJhaWwubm9kZXMsIHRoaXMuX3RhcmdldE5vZGUgKSApIHtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSB0YXJnZXQgTm9kZSBpcyBub3QgaW4gdGhlIGV2ZW50IHRyYWlsLCB3ZSBhc3N1bWUgdGhhdCB0aGUgZXZlbnQgd2VudCB0byB0aGVcclxuICAgICAgLy8gRGlzcGxheSBvciB0aGUgcm9vdCBOb2RlIG9mIHRoZSBzY2VuZSBncmFwaCAtIHRoaXMgd2lsbCB0aHJvdyBhbiBhc3NlcnRpb24gaWZcclxuICAgICAgLy8gdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgdHJhaWxzIGZvdW5kXHJcbiAgICAgIHByZXNzVHJhaWwgPSB0aGlzLl90YXJnZXROb2RlLmdldFVuaXF1ZVRyYWlsVG8oIGV2ZW50LnRhcmdldCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHByZXNzVHJhaWwgPSBldmVudC50cmFpbC5zdWJ0cmFpbFRvKCB0aGlzLl90YXJnZXROb2RlLCBmYWxzZSApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5pbmNsdWRlcyggcHJlc3NUcmFpbC5ub2RlcywgdGhpcy5fdGFyZ2V0Tm9kZSApLCAndGFyZ2V0Tm9kZSBtdXN0IGJlIGluIHRoZSBUcmFpbCBmb3IgUHJlc3MnICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICBjb25zdCBwcmVzcyA9IG5ldyBQcmVzcyggZXZlbnQucG9pbnRlciwgcHJlc3NUcmFpbCApO1xyXG5cclxuICAgIGlmICggIXRoaXMuX2FsbG93TW92ZUludGVycnVwdGlvbiAmJiAhdGhpcy5fYWxsb3dNdWx0aXRvdWNoSW50ZXJydXB0aW9uICkge1xyXG5cclxuICAgICAgLy8gbW9zdCByZXN0cmljdGl2ZSBjYXNlLCBvbmx5IGFsbG93IHByZXNzZXMgaWYgdGhlIHBvaW50ZXIgaXMgbm90IGF0dGFjaGVkIC0gUHJlc3Nlc1xyXG4gICAgICAvLyBhcmUgbmV2ZXIgYWRkZWQgYXMgYmFja2dyb3VuZCBwcmVzc2VzIGluIHRoaXMgY2FzZSBiZWNhdXNlIGludGVycnVwdGlvbiBpcyBuZXZlciBhbGxvd2VkXHJcbiAgICAgIGlmICggIWV2ZW50LnBvaW50ZXIuaXNBdHRhY2hlZCgpICkge1xyXG4gICAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgdW5hdHRhY2hlZCwgdXNpbmcgcHJlc3MnICk7XHJcbiAgICAgICAgdGhpcy5hZGRQcmVzcyggcHJlc3MgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyB3ZSBhbGxvdyBzb21lIGZvcm0gb2YgaW50ZXJydXB0aW9uLCBhZGQgYXMgYmFja2dyb3VuZCBwcmVzc2VzLCBhbmQgd2Ugd2lsbCBkZWNpZGUgaWYgdGhleVxyXG4gICAgICAvLyBzaG91bGQgYmUgY29udmVydGVkIHRvIHByZXNzZXMgYW5kIGludGVycnVwdCBvdGhlciBsaXN0ZW5lcnMgb24gbW92ZSBldmVudFxyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGF0dGFjaGVkLCBhZGRpbmcgYmFja2dyb3VuZCBwcmVzcycgKTtcclxuICAgICAgdGhpcy5hZGRCYWNrZ3JvdW5kUHJlc3MoIHByZXNzICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIFByZXNzIHRvIHRoaXMgbGlzdGVuZXIgd2hlbiBhIG5ldyBQb2ludGVyIGlzIGRvd24uXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcmVzc30gcHJlc3NcclxuICAgKi9cclxuICBhZGRQcmVzcyggcHJlc3MgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIGFkZFByZXNzJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5oYXNQcmVzcyggcHJlc3MgKSApIHtcclxuICAgICAgdGhpcy5fcHJlc3Nlcy5wdXNoKCBwcmVzcyApO1xyXG5cclxuICAgICAgcHJlc3MucG9pbnRlci5jdXJzb3IgPSB0aGlzLl9wcmVzc0N1cnNvcjtcclxuICAgICAgcHJlc3MucG9pbnRlci5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLl9wcmVzc0xpc3RlbmVyLCB0cnVlICk7XHJcblxyXG4gICAgICB0aGlzLnJlY29tcHV0ZUxvY2FscygpO1xyXG4gICAgICB0aGlzLnJlcG9zaXRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVwb3NpdGlvbiBpbiByZXNwb25zZSB0byBtb3ZlbWVudCBvZiBhbnkgUHJlc3Nlcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEBwYXJhbSBwcmVzc1xyXG4gICAqL1xyXG4gIG1vdmVQcmVzcyggcHJlc3MgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIG1vdmVQcmVzcycgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMucmVwb3NpdGlvbigpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBQcmVzcyBmcm9tIHRoaXMgbGlzdGVuZXIuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcmVzc30gcHJlc3NcclxuICAgKi9cclxuICByZW1vdmVQcmVzcyggcHJlc3MgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIoICdNdWx0aUxpc3RlbmVyIHJlbW92ZVByZXNzJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgcHJlc3MucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9wcmVzc0xpc3RlbmVyICk7XHJcbiAgICBwcmVzcy5wb2ludGVyLmN1cnNvciA9IG51bGw7XHJcblxyXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMuX3ByZXNzZXMsIHByZXNzICk7XHJcblxyXG4gICAgdGhpcy5yZWNvbXB1dGVMb2NhbHMoKTtcclxuICAgIHRoaXMucmVwb3NpdGlvbigpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBiYWNrZ3JvdW5kIFByZXNzLCBhIFByZXNzIHRoYXQgd2UgcmVjZWl2ZSB3aGlsZSBhIFBvaW50ZXIgaXMgYWxyZWFkeSBhdHRhY2hlZC4gRGVwZW5kaW5nIG9uIGJhY2tncm91bmRcclxuICAgKiBQcmVzc2VzLCB3ZSBtYXkgaW50ZXJydXB0IHRoZSBhdHRhY2hlZCBwb2ludGVyIHRvIGJlZ2luIHpvb20gb3BlcmF0aW9ucy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcmVzc30gcHJlc3NcclxuICAgKi9cclxuICBhZGRCYWNrZ3JvdW5kUHJlc3MoIHByZXNzICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciBhZGRCYWNrZ3JvdW5kUHJlc3MnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgdGhlIHByZXNzIHBvaW50ZXIgYWxyZWFkeSBoYXMgdGhlIGxpc3RlbmVyIC0gZm9yIGluc3RhbmNlIGluIENocm9tZSB3ZSBmYWlsIHRvIGdldFxyXG4gICAgLy8gXCJ1cFwiIGV2ZW50cyBvbmNlIHRoZSBjb250ZXh0IG1lbnUgaXMgb3BlbiAobGlrZSBhZnRlciBhIHJpZ2h0IGNsaWNrKSwgc28gb25seSBhZGQgdG8gdGhlIFBvaW50ZXJcclxuICAgIC8vIGlmIGl0IGlzbid0IGFscmVhZHkgYWRkZWRcclxuICAgIGlmICggIXRoaXMuaGFzUHJlc3MoIHByZXNzICkgKSB7XHJcbiAgICAgIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzLnB1c2goIHByZXNzICk7XHJcbiAgICAgIHByZXNzLnBvaW50ZXIuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy5fYmFja2dyb3VuZExpc3RlbmVyLCBmYWxzZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBiYWNrZ3JvdW5kIFByZXNzIGZyb20gdGhpcyBsaXN0ZW5lci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHByZXNzXHJcbiAgICovXHJcbiAgcmVtb3ZlQmFja2dyb3VuZFByZXNzKCBwcmVzcyApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcmVtb3ZlQmFja2dyb3VuZFByZXNzJyApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgcHJlc3MucG9pbnRlci5yZW1vdmVJbnB1dExpc3RlbmVyKCB0aGlzLl9iYWNrZ3JvdW5kTGlzdGVuZXIgKTtcclxuXHJcbiAgICBhcnJheVJlbW92ZSggdGhpcy5fYmFja2dyb3VuZFByZXNzZXMsIHByZXNzICk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcG9zaXRpb24gdGhlIHRhcmdldCBOb2RlIChpbmNsdWRpbmcgYWxsIGFwc2VjdHMgb2YgdHJhbnNmb3JtYXRpb24pIG9mIHRoaXMgbGlzdGVuZXIncyB0YXJnZXQgTm9kZS5cclxuICAgKiBAcHJvdGVjdGVkXHJcbiAgICovXHJcbiAgcmVwb3NpdGlvbigpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciggJ011bHRpTGlzdGVuZXIgcmVwb3NpdGlvbicgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIHRoaXMubWF0cml4UHJvcGVydHkuc2V0KCB0aGlzLmNvbXB1dGVNYXRyaXgoKSApO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWNvbXB1dGUgdGhlIGxvY2FsIHBvaW50cyBvZiB0aGUgUHJlc3NlcyBmb3IgdGhpcyBsaXN0ZW5lciwgcmVsYXRpdmUgdG8gdGhlIHRhcmdldCBOb2RlLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVjb21wdXRlTG9jYWxzKCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciByZWNvbXB1dGVMb2NhbHMnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzLl9wcmVzc2VzWyBpIF0ucmVjb21wdXRlTG9jYWxQb2ludCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcnJ1cHQgdGhpcyBsaXN0ZW5lci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaW50ZXJydXB0KCkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLklucHV0TGlzdGVuZXIgJiYgc2NlbmVyeUxvZy5JbnB1dExpc3RlbmVyKCAnTXVsdGlMaXN0ZW5lciBpbnRlcnJ1cHQnICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICB3aGlsZSAoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVByZXNzKCB0aGlzLl9wcmVzc2VzWyB0aGlzLl9wcmVzc2VzLmxlbmd0aCAtIDEgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIHdoaWxlICggdGhpcy5fYmFja2dyb3VuZFByZXNzZXMubGVuZ3RoICkge1xyXG4gICAgICB0aGlzLnJlbW92ZUJhY2tncm91bmRQcmVzcyggdGhpcy5fYmFja2dyb3VuZFByZXNzZXNbIHRoaXMuX2JhY2tncm91bmRQcmVzc2VzLmxlbmd0aCAtIDEgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2ludGVycnVwdGVkID0gdHJ1ZTtcclxuXHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuSW5wdXRMaXN0ZW5lciAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSB0aGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZvciB0aGUgdGFyZ2V0IE5vZGUgYmFzZWQgb24gUHJlc3Nlcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9XHJcbiAgICovXHJcbiAgY29tcHV0ZU1hdHJpeCgpIHtcclxuICAgIGlmICggdGhpcy5fcHJlc3Nlcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl90YXJnZXROb2RlLmdldE1hdHJpeCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX3ByZXNzZXMubGVuZ3RoID09PSAxICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb21wdXRlU2luZ2xlUHJlc3NNYXRyaXgoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9hbGxvd1NjYWxlICYmIHRoaXMuX2FsbG93Um90YXRpb24gKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbXB1dGVUcmFuc2xhdGlvblJvdGF0aW9uU2NhbGVNYXRyaXgoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLl9hbGxvd1NjYWxlICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jb21wdXRlVHJhbnNsYXRpb25TY2FsZU1hdHJpeCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuX2FsbG93Um90YXRpb24gKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNvbXB1dGVUcmFuc2xhdGlvblJvdGF0aW9uTWF0cml4KCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY29tcHV0ZVRyYW5zbGF0aW9uTWF0cml4KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZyb20gYSBzaW5nbGUgcHJlc3MuIFNpbmdsZSBwcmVzcyBpbmRpY2F0ZXMgdHJhbnNsYXRpb24gKHBhbm5pbmcpIGZvciB0aGVcclxuICAgKiB0YXJnZXQgTm9kZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9XHJcbiAgICovXHJcbiAgY29tcHV0ZVNpbmdsZVByZXNzTWF0cml4KCkge1xyXG4gICAgY29uc3Qgc2luZ2xlVGFyZ2V0UG9pbnQgPSB0aGlzLl9wcmVzc2VzWyAwIF0udGFyZ2V0UG9pbnQ7XHJcbiAgICBjb25zdCBzaW5nbGVNYXBwZWRQb2ludCA9IHRoaXMuX3RhcmdldE5vZGUubG9jYWxUb1BhcmVudFBvaW50KCB0aGlzLl9wcmVzc2VzWyAwIF0ubG9jYWxQb2ludCApO1xyXG4gICAgY29uc3QgZGVsdGEgPSBzaW5nbGVUYXJnZXRQb2ludC5taW51cyggc2luZ2xlTWFwcGVkUG9pbnQgKTtcclxuICAgIHJldHVybiBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3RvciggZGVsdGEgKS50aW1lc01hdHJpeCggdGhpcy5fdGFyZ2V0Tm9kZS5nZXRNYXRyaXgoKSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICAvKipcclxuICAgKiBDb21wdXRlIGEgdHJhbnNsYXRpb24gbWF0cml4IGZyb20gbXVsdGlwbGUgcHJlc3Nlcy4gVXN1YWxseSBtdWx0aXBsZSBwcmVzc2VzIHdpbGwgaGF2ZSBzb21lIHNjYWxlIG9yIHJvdGF0aW9uXHJcbiAgICogYXMgd2VsbCwgYnV0IHRoaXMgaXMgdG8gYmUgdXNlZCBpZiByb3RhdGlvbiBhbmQgc2NhbGUgYXJlIG5vdCBlbmFibGVkIGZvciB0aGlzIGxpc3RlbmVyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxyXG4gICAqL1xyXG4gIGNvbXB1dGVUcmFuc2xhdGlvbk1hdHJpeCgpIHtcclxuICAgIC8vIHRyYW5zbGF0aW9uIG9ubHkuIGxpbmVhciBsZWFzdC1zcXVhcmVzIHNpbXBsaWZpZXMgdG8gc3VtIG9mIGRpZmZlcmVuY2VzXHJcbiAgICBjb25zdCBzdW0gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5fcHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgc3VtLmFkZCggdGhpcy5fcHJlc3Nlc1sgaSBdLnRhcmdldFBvaW50ICk7XHJcbiAgICAgIHN1bS5zdWJ0cmFjdCggdGhpcy5fcHJlc3Nlc1sgaSBdLmxvY2FsUG9pbnQgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3Rvciggc3VtLmRpdmlkZWRTY2FsYXIoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgdHJhbnNmb3JtYXRpb24gbWF0cml4IGZyb20gbXVsdGlwbGUgUHJlc3NlcyB0aGF0IHdpbGwgdHJhbnNsYXRlIGFuZCBzY2FsZSB0aGUgdGFyZ2V0IE5vZGUuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtNYXRyaXgzfVxyXG4gICAqL1xyXG4gIGNvbXB1dGVUcmFuc2xhdGlvblNjYWxlTWF0cml4KCkge1xyXG4gICAgY29uc3QgbG9jYWxQb2ludHMgPSB0aGlzLl9wcmVzc2VzLm1hcCggcHJlc3MgPT4gcHJlc3MubG9jYWxQb2ludCApO1xyXG4gICAgY29uc3QgdGFyZ2V0UG9pbnRzID0gdGhpcy5fcHJlc3Nlcy5tYXAoIHByZXNzID0+IHByZXNzLnRhcmdldFBvaW50ICk7XHJcblxyXG4gICAgY29uc3QgbG9jYWxDZW50cm9pZCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICBjb25zdCB0YXJnZXRDZW50cm9pZCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgbG9jYWxQb2ludHMuZm9yRWFjaCggbG9jYWxQb2ludCA9PiB7IGxvY2FsQ2VudHJvaWQuYWRkKCBsb2NhbFBvaW50ICk7IH0gKTtcclxuICAgIHRhcmdldFBvaW50cy5mb3JFYWNoKCB0YXJnZXRQb2ludCA9PiB7IHRhcmdldENlbnRyb2lkLmFkZCggdGFyZ2V0UG9pbnQgKTsgfSApO1xyXG5cclxuICAgIGxvY2FsQ2VudHJvaWQuZGl2aWRlU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xyXG4gICAgdGFyZ2V0Q2VudHJvaWQuZGl2aWRlU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xyXG5cclxuICAgIGxldCBsb2NhbFNxdWFyZWREaXN0YW5jZSA9IDA7XHJcbiAgICBsZXQgdGFyZ2V0U3F1YXJlZERpc3RhbmNlID0gMDtcclxuXHJcbiAgICBsb2NhbFBvaW50cy5mb3JFYWNoKCBsb2NhbFBvaW50ID0+IHsgbG9jYWxTcXVhcmVkRGlzdGFuY2UgKz0gbG9jYWxQb2ludC5kaXN0YW5jZVNxdWFyZWQoIGxvY2FsQ2VudHJvaWQgKTsgfSApO1xyXG4gICAgdGFyZ2V0UG9pbnRzLmZvckVhY2goIHRhcmdldFBvaW50ID0+IHsgdGFyZ2V0U3F1YXJlZERpc3RhbmNlICs9IHRhcmdldFBvaW50LmRpc3RhbmNlU3F1YXJlZCggdGFyZ2V0Q2VudHJvaWQgKTsgfSApO1xyXG5cclxuICAgIC8vIHdoaWxlIGZ1enogdGVzdGluZywgaXQgaXMgcG9zc2libGUgdGhhdCB0aGUgUHJlc3MgcG9pbnRzIGFyZVxyXG4gICAgLy8gZXhhY3RseSB0aGUgc2FtZSByZXN1bHRpbmcgaW4gdW5kZWZpbmVkIHNjYWxlIC0gaWYgdGhhdCBpcyB0aGUgY2FzZVxyXG4gICAgLy8gd2Ugd2lsbCBub3QgYWRqdXN0XHJcbiAgICBsZXQgc2NhbGUgPSB0aGlzLmdldEN1cnJlbnRTY2FsZSgpO1xyXG4gICAgaWYgKCB0YXJnZXRTcXVhcmVkRGlzdGFuY2UgIT09IDAgKSB7XHJcbiAgICAgIHNjYWxlID0gdGhpcy5saW1pdFNjYWxlKCBNYXRoLnNxcnQoIHRhcmdldFNxdWFyZWREaXN0YW5jZSAvIGxvY2FsU3F1YXJlZERpc3RhbmNlICkgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0cmFuc2xhdGVUb1RhcmdldCA9IE1hdHJpeDMudHJhbnNsYXRpb24oIHRhcmdldENlbnRyb2lkLngsIHRhcmdldENlbnRyb2lkLnkgKTtcclxuICAgIGNvbnN0IHRyYW5zbGF0ZUZyb21Mb2NhbCA9IE1hdHJpeDMudHJhbnNsYXRpb24oIC1sb2NhbENlbnRyb2lkLngsIC1sb2NhbENlbnRyb2lkLnkgKTtcclxuXHJcbiAgICByZXR1cm4gdHJhbnNsYXRlVG9UYXJnZXQudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggc2NhbGUgKSApLnRpbWVzTWF0cml4KCB0cmFuc2xhdGVGcm9tTG9jYWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpbWl0IHRoZSBwcm92aWRlZCBzY2FsZSBieSBjb25zdHJhaW50cyBvZiB0aGlzIE11bHRpTGlzdGVuZXIuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNjYWxlXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBsaW1pdFNjYWxlKCBzY2FsZSApIHtcclxuICAgIGxldCBjb3JyZWN0ZWRTY2FsZSA9IE1hdGgubWF4KCBzY2FsZSwgdGhpcy5fbWluU2NhbGUgKTtcclxuICAgIGNvcnJlY3RlZFNjYWxlID0gTWF0aC5taW4oIGNvcnJlY3RlZFNjYWxlLCB0aGlzLl9tYXhTY2FsZSApO1xyXG4gICAgcmV0dXJuIGNvcnJlY3RlZFNjYWxlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCB0aGF0IHdpbGwgdHJhbnNsYXRlIGFuZCBzY2FsZSB0aGUgdGFyZ2V0IE5vZGUgZnJvbSBtdWx0aXBsZSBwcmVzc2VzLiBTaG91bGRcclxuICAgKiBiZSB1c2VkIHdoZW4gc2NhbGluZyBpcyBub3QgZW5hYmxlZCBmb3IgdGhpcyBsaXN0ZW5lci5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge01hdHJpeDN9XHJcbiAgICovXHJcbiAgY29tcHV0ZVRyYW5zbGF0aW9uUm90YXRpb25NYXRyaXgoKSB7XHJcbiAgICBsZXQgaTtcclxuICAgIGNvbnN0IGxvY2FsTWF0cml4ID0gbmV3IE1hdHJpeCggMiwgdGhpcy5fcHJlc3Nlcy5sZW5ndGggKTtcclxuICAgIGNvbnN0IHRhcmdldE1hdHJpeCA9IG5ldyBNYXRyaXgoIDIsIHRoaXMuX3ByZXNzZXMubGVuZ3RoICk7XHJcbiAgICBjb25zdCBsb2NhbENlbnRyb2lkID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIGNvbnN0IHRhcmdldENlbnRyb2lkID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIGZvciAoIGkgPSAwOyBpIDwgdGhpcy5fcHJlc3Nlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMuX3ByZXNzZXNbIGkgXS5sb2NhbFBvaW50O1xyXG4gICAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMuX3ByZXNzZXNbIGkgXS50YXJnZXRQb2ludDtcclxuICAgICAgbG9jYWxDZW50cm9pZC5hZGQoIGxvY2FsUG9pbnQgKTtcclxuICAgICAgdGFyZ2V0Q2VudHJvaWQuYWRkKCB0YXJnZXRQb2ludCApO1xyXG4gICAgICBsb2NhbE1hdHJpeC5zZXQoIDAsIGksIGxvY2FsUG9pbnQueCApO1xyXG4gICAgICBsb2NhbE1hdHJpeC5zZXQoIDEsIGksIGxvY2FsUG9pbnQueSApO1xyXG4gICAgICB0YXJnZXRNYXRyaXguc2V0KCAwLCBpLCB0YXJnZXRQb2ludC54ICk7XHJcbiAgICAgIHRhcmdldE1hdHJpeC5zZXQoIDEsIGksIHRhcmdldFBvaW50LnkgKTtcclxuICAgIH1cclxuICAgIGxvY2FsQ2VudHJvaWQuZGl2aWRlU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xyXG4gICAgdGFyZ2V0Q2VudHJvaWQuZGl2aWRlU2NhbGFyKCB0aGlzLl9wcmVzc2VzLmxlbmd0aCApO1xyXG5cclxuICAgIC8vIGRldGVybWluZSBvZmZzZXRzIGZyb20gdGhlIGNlbnRyb2lkc1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBsb2NhbE1hdHJpeC5zZXQoIDAsIGksIGxvY2FsTWF0cml4LmdldCggMCwgaSApIC0gbG9jYWxDZW50cm9pZC54ICk7XHJcbiAgICAgIGxvY2FsTWF0cml4LnNldCggMSwgaSwgbG9jYWxNYXRyaXguZ2V0KCAxLCBpICkgLSBsb2NhbENlbnRyb2lkLnkgKTtcclxuICAgICAgdGFyZ2V0TWF0cml4LnNldCggMCwgaSwgdGFyZ2V0TWF0cml4LmdldCggMCwgaSApIC0gdGFyZ2V0Q2VudHJvaWQueCApO1xyXG4gICAgICB0YXJnZXRNYXRyaXguc2V0KCAxLCBpLCB0YXJnZXRNYXRyaXguZ2V0KCAxLCBpICkgLSB0YXJnZXRDZW50cm9pZC55ICk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjb3ZhcmlhbmNlTWF0cml4ID0gbG9jYWxNYXRyaXgudGltZXMoIHRhcmdldE1hdHJpeC50cmFuc3Bvc2UoKSApO1xyXG4gICAgY29uc3Qgc3ZkID0gbmV3IFNpbmd1bGFyVmFsdWVEZWNvbXBvc2l0aW9uKCBjb3ZhcmlhbmNlTWF0cml4ICk7XHJcbiAgICBsZXQgcm90YXRpb24gPSBzdmQuZ2V0VigpLnRpbWVzKCBzdmQuZ2V0VSgpLnRyYW5zcG9zZSgpICk7XHJcbiAgICBpZiAoIHJvdGF0aW9uLmRldCgpIDwgMCApIHtcclxuICAgICAgcm90YXRpb24gPSBzdmQuZ2V0VigpLnRpbWVzKCBNYXRyaXguZGlhZ29uYWxNYXRyaXgoIFsgMSwgLTEgXSApICkudGltZXMoIHN2ZC5nZXRVKCkudHJhbnNwb3NlKCkgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHJvdGF0aW9uMyA9IG5ldyBNYXRyaXgzKCkucm93TWFqb3IoIHJvdGF0aW9uLmdldCggMCwgMCApLCByb3RhdGlvbi5nZXQoIDAsIDEgKSwgMCxcclxuICAgICAgcm90YXRpb24uZ2V0KCAxLCAwICksIHJvdGF0aW9uLmdldCggMSwgMSApLCAwLFxyXG4gICAgICAwLCAwLCAxICk7XHJcbiAgICBjb25zdCB0cmFuc2xhdGlvbiA9IHRhcmdldENlbnRyb2lkLm1pbnVzKCByb3RhdGlvbjMudGltZXNWZWN0b3IyKCBsb2NhbENlbnRyb2lkICkgKTtcclxuICAgIHJvdGF0aW9uMy5zZXQwMiggdHJhbnNsYXRpb24ueCApO1xyXG4gICAgcm90YXRpb24zLnNldDEyKCB0cmFuc2xhdGlvbi55ICk7XHJcbiAgICByZXR1cm4gcm90YXRpb24zO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSBhIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCB0aGF0IHdpbGwgdHJhbnNsYXRlLCBzY2FsZSwgYW5kIHJvdGF0ZSB0aGUgdGFyZ2V0IE5vZGUgZnJvbSBtdWx0aXBsZSBQcmVzc2VzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7TWF0cml4M31cclxuICAgKi9cclxuICBjb21wdXRlVHJhbnNsYXRpb25Sb3RhdGlvblNjYWxlTWF0cml4KCkge1xyXG4gICAgbGV0IGk7XHJcbiAgICBjb25zdCBsb2NhbE1hdHJpeCA9IG5ldyBNYXRyaXgoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICogMiwgNCApO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAvLyBbIHggIHkgMSAwIF1cclxuICAgICAgLy8gWyB5IC14IDAgMSBdXHJcbiAgICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLl9wcmVzc2VzWyBpIF0ubG9jYWxQb2ludDtcclxuICAgICAgbG9jYWxNYXRyaXguc2V0KCAyICogaSArIDAsIDAsIGxvY2FsUG9pbnQueCApO1xyXG4gICAgICBsb2NhbE1hdHJpeC5zZXQoIDIgKiBpICsgMCwgMSwgbG9jYWxQb2ludC55ICk7XHJcbiAgICAgIGxvY2FsTWF0cml4LnNldCggMiAqIGkgKyAwLCAyLCAxICk7XHJcbiAgICAgIGxvY2FsTWF0cml4LnNldCggMiAqIGkgKyAxLCAwLCBsb2NhbFBvaW50LnkgKTtcclxuICAgICAgbG9jYWxNYXRyaXguc2V0KCAyICogaSArIDEsIDEsIC1sb2NhbFBvaW50LnggKTtcclxuICAgICAgbG9jYWxNYXRyaXguc2V0KCAyICogaSArIDEsIDMsIDEgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHRhcmdldE1hdHJpeCA9IG5ldyBNYXRyaXgoIHRoaXMuX3ByZXNzZXMubGVuZ3RoICogMiwgMSApO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLl9wcmVzc2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB0YXJnZXRQb2ludCA9IHRoaXMuX3ByZXNzZXNbIGkgXS50YXJnZXRQb2ludDtcclxuICAgICAgdGFyZ2V0TWF0cml4LnNldCggMiAqIGkgKyAwLCAwLCB0YXJnZXRQb2ludC54ICk7XHJcbiAgICAgIHRhcmdldE1hdHJpeC5zZXQoIDIgKiBpICsgMSwgMCwgdGFyZ2V0UG9pbnQueSApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY29lZmZpY2llbnRNYXRyaXggPSBTaW5ndWxhclZhbHVlRGVjb21wb3NpdGlvbi5wc2V1ZG9pbnZlcnNlKCBsb2NhbE1hdHJpeCApLnRpbWVzKCB0YXJnZXRNYXRyaXggKTtcclxuICAgIGNvbnN0IG0xMSA9IGNvZWZmaWNpZW50TWF0cml4LmdldCggMCwgMCApO1xyXG4gICAgY29uc3QgbTEyID0gY29lZmZpY2llbnRNYXRyaXguZ2V0KCAxLCAwICk7XHJcbiAgICBjb25zdCBtMTMgPSBjb2VmZmljaWVudE1hdHJpeC5nZXQoIDIsIDAgKTtcclxuICAgIGNvbnN0IG0yMyA9IGNvZWZmaWNpZW50TWF0cml4LmdldCggMywgMCApO1xyXG4gICAgcmV0dXJuIG5ldyBNYXRyaXgzKCkucm93TWFqb3IoIG0xMSwgbTEyLCBtMTMsXHJcbiAgICAgIC1tMTIsIG0xMSwgbTIzLFxyXG4gICAgICAwLCAwLCAxICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGN1cnJlbnQgc2NhbGUgb24gdGhlIHRhcmdldCBOb2RlLCBhc3N1bWVzIHRoYXQgdGhlcmUgaXMgaXNvbWV0cmljIHNjYWxpbmcgaW4gYm90aCB4IGFuZCB5LlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0Q3VycmVudFNjYWxlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldE5vZGUuZ2V0U2NhbGVWZWN0b3IoKS54O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdHJhbnNmb3JtIG9uIHRoZSB0YXJnZXQgTm9kZS5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldFRyYW5zZm9ybSgpIHtcclxuICAgIHRoaXMuX3RhcmdldE5vZGUucmVzZXRUcmFuc2Zvcm0oKTtcclxuICAgIHRoaXMubWF0cml4UHJvcGVydHkuc2V0KCB0aGlzLl90YXJnZXROb2RlLm1hdHJpeC5jb3B5KCkgKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdNdWx0aUxpc3RlbmVyJywgTXVsdGlMaXN0ZW5lciApO1xyXG5cclxuLyoqXHJcbiAqIEEgbG9naWNhbCBcInByZXNzXCIgZm9yIHRoZSBNdWx0aUxpc3RlbmVyLCBjYXB0dXJpbmcgaW5mb3JtYXRpb24gd2hlbiBhIFBvaW50ZXIgZ29lcyBkb3duIG9uIHRoZSBzY3JlZW4uXHJcbiAqL1xyXG5jbGFzcyBQcmVzcyB7XHJcbiAgY29uc3RydWN0b3IoIHBvaW50ZXIsIHRyYWlsICkge1xyXG4gICAgdGhpcy5wb2ludGVyID0gcG9pbnRlcjtcclxuICAgIHRoaXMudHJhaWwgPSB0cmFpbDtcclxuICAgIHRoaXMuaW50ZXJydXB0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtWZWN0b3IyfSAtIGRvd24gcG9pbnQgZm9yIHRoZSBuZXcgcHJlc3MsIGluIHRoZSBnbG9iYWwgY29vcmRpbmF0ZSBmcmFtZVxyXG4gICAgdGhpcy5pbml0aWFsUG9pbnQgPSBwb2ludGVyLnBvaW50O1xyXG5cclxuICAgIHRoaXMubG9jYWxQb2ludCA9IG51bGw7XHJcbiAgICB0aGlzLnJlY29tcHV0ZUxvY2FsUG9pbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbXB1dGUgdGhlIGxvY2FsIHBvaW50IGZvciB0aGlzIFByZXNzLCB3aGljaCBpcyB0aGUgbG9jYWwgcG9pbnQgZm9yIHRoZSBsZWFmIE5vZGUgb2YgdGhpcyBQcmVzcydzIFRyYWlsLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZWNvbXB1dGVMb2NhbFBvaW50KCkge1xyXG4gICAgdGhpcy5sb2NhbFBvaW50ID0gdGhpcy50cmFpbC5nbG9iYWxUb0xvY2FsUG9pbnQoIHRoaXMucG9pbnRlci5wb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGhlIHBhcmVudCBwb2ludCBvZiB0aGlzIHByZXNzLCByZWxhdGl2ZSB0byB0aGUgbGVhZiBOb2RlIG9mIHRoaXMgUHJlc3MncyBUcmFpbC5cclxuICAgKiBAcHVibGljXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0IHRhcmdldFBvaW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhaWwuZ2xvYmFsVG9QYXJlbnRQb2ludCggdGhpcy5wb2ludGVyLnBvaW50ICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNdWx0aUxpc3RlbmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQywwQkFBMEIsTUFBTSwrQ0FBK0M7QUFDdEYsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxTQUFTQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxRQUFRLGVBQWU7O0FBRXREO0FBQ0E7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxFQUFFO0FBRW5DLE1BQU1DLGFBQWEsQ0FBQztFQUVsQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsVUFBVSxFQUFFQyxPQUFPLEVBQUc7SUFFakNBLE9BQU8sR0FBR1QsS0FBSyxDQUFFO01BRWY7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQVUsV0FBVyxFQUFFLENBQUM7TUFFZDtNQUNBQyxXQUFXLEVBQUUsU0FBUztNQUV0QjtNQUNBQyxVQUFVLEVBQUUsSUFBSTtNQUVoQjtNQUNBQyxhQUFhLEVBQUUsSUFBSTtNQUVuQjtNQUNBO01B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