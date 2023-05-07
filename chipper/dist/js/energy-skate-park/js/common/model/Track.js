// Copyright 2013-2023, University of Colorado Boulder

/**
 * Model for one track in Energy Skate Park, which contains the control points and cubic splines for
 * interpolating between them.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import dot from '../../../../dot/js/dot.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { SceneryEvent } from '../../../../scenery/js/imports.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energySkatePark from '../../energySkatePark.js';
import SplineEvaluation from '../SplineEvaluation.js';
import ControlPoint from './ControlPoint.js';

// constants
const FastArray = dot.FastArray;
const ControlPointReferenceIO = ReferenceIO(ControlPoint.ControlPointIO);

// options for a track that is fully interactive - it can be dragged, control points can be moved, broken into
// different tracks, and combined with another track
const FULLY_INTERACTIVE_OPTIONS = {
  draggable: true,
  configurable: true,
  splittable: true,
  attachable: true
};
class Track extends PhetioObject {
  /**
   * Model for a track, which has a fixed number of points.  If you added a point to a Track, you need a new track.
   *
   * @param {EnergySkateParkModel} model
   * @param {Array.<ControlPoint>} controlPoints
   * @param {Array.<Track>} parents the original tracks that were used to make this track (if any) so they can be
   *                            broken apart when dragged back to control panel adjusted control point from going
   *                            offscreen, see #195
   * @param {Object} [options] - required for tandem
   */
  constructor(model, controlPoints, parents, options) {
    assert && assert(Array.isArray(parents), 'parents must be array');
    options = merge({
      // {boolean} - can this track be dragged and moved in the play area?
      draggable: false,
      // {boolean} - can this track be changed by dragging control points? Some tracks can have their
      // control points moved but cannot be dragged as a whole.
      configurable: false,
      // {boolean} - can this track be changed or broken by removing control points? I so, clicking on a control
      // point will create a UI to split the track or delete the control point.
      splittable: false,
      // {boolean} - can this track be attached with another track by dragging track or control points? When a track
      // is attachable control points at the end of the track have a different visualization to indicate that
      // the track can be attached to another.
      attachable: false,
      // {boolean} - whether the skater transitions from the right edge of this track directly to the ground, see
      // this._slopeToGround for more information
      slopeToGround: false,
      tandem: Tandem.REQUIRED,
      phetioType: Track.TrackIO,
      phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState
    }, options);
    super(options);
    const tandem = options.tandem;

    // @private
    this.parents = parents;
    this.trackTandem = tandem;

    // @public (read-only) - see options
    this.model = model;
    this.draggable = options.draggable;
    this.configurable = options.configurable;
    this.splittable = options.splittable;
    this.attachable = options.attachable;

    // @public
    this.translatedEmitter = new Emitter();
    this.resetEmitter = new Emitter();
    this.smoothedEmitter = new Emitter();
    this.updateEmitter = new Emitter();
    this.removeEmitter = new Emitter();
    this.forwardingDragStartEmitter = new Emitter({
      parameters: [{
        valueType: SceneryEvent
      }]
    });

    // @public {DragListener} Keep track of what component (control point or track body) is dragging the track, so
    // that it can't be dragged by
    // two sources, which causes a flicker, see #282
    this.dragSource = null;

    // @private {boolean} - Flag to indicate whether the skater transitions from the right edge of this track directly to the
    // ground, if set to true, additional corrections to skater energy will be applied so that energy is conserved in
    // this case - see phetsims/energy-skate-park-basics#164. Also see the getters/setters for this below.
    this._slopeToGround = false;

    // @private {boolean} - if slopeToGround is set, and we will set slopeToGround to false if the Track is configurable
    // and a control point moves because the track presumably no longer slopes to the ground perfectly. But
    // the track should slope to ground again on reset.
    this._restoreSlopeToGroundOnReset = false;

    // @private - Use an arbitrary position for translating the track during dragging.  Only used for deltas in relative
    // positioning and translation, so an exact "position" is irrelevant, see #260
    this._position = new Vector2(0, 0);

    // @public {boolean} - True if the track can be interacted with.  For screens 1-2 only one track will be physical
    // (and hence visible). For screen 3, tracks in the control panel are visible but non-physical until dragged to
    // the play area
    this.physicalProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('physicalProperty'),
      phetioState: options.phetioState // Participate in state only if parent track is too
    });

    // @private {boolean} - Flag that shows whether the track has been dragged fully out of the panel
    this.leftThePanelProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('leftThePanelProperty'),
      phetioState: options.phetioState // Participate in state only if parent track is too
    });

    // @public - Keep track of whether the track is dragging, so performance can be optimized while dragging -
    // only true while track is in the Play Area (physical)
    this.draggingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('draggingProperty'),
      phetioState: options.phetioState // Participate in state only if parent track is too
    });

    // @public {boolean} - Flag to indicate whether the user has dragged the track out of the toolbox.  If dragging from the toolbox,
    // then dragging translates the entire track instead of just a point.
    this.droppedProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('droppedProperty'),
      phetioState: options.phetioState // Participate in state only if parent track is too
    });

    const trackChangedListener = () => {
      model.trackChangedEmitter.emit();
    };
    this.physicalProperty.link(trackChangedListener);
    this.controlPoints = controlPoints;
    assert && assert(this.controlPoints, 'control points should be defined');

    // @public - boolean value that is true if any control point on this track is being dragged
    this.controlPointDraggingProperty = new DerivedProperty(_.map(controlPoints, point => point.draggingProperty), (...args) => {
      return _.reduce(args, (collapsed, value) => collapsed || value);
    }, {
      valueType: 'boolean'
    });

    // @public {FastArray.<number>}
    this.parametricPosition = new FastArray(this.controlPoints.length);
    this.x = new FastArray(this.controlPoints.length);
    this.y = new FastArray(this.controlPoints.length);

    // Sampling points, which will be initialized and updated in updateLinSpace.  These points are evenly spaced
    // in the track parametric coordinates from just before the track parameter space to just after. See updateLinSpace
    // @private
    this.searchLinSpace = null;
    this.distanceBetweenSamplePoints = null;
    this.updateLinSpace();
    this.updateSplines();

    // set fields that correct energy when skater transitions directly to ground, if defined on the track
    this.setSlopeToGround(options.slopeToGround);

    // In the state wrapper, when the state changes, we must update the skater node
    const stateListener = () => {
      this.updateLinSpace();
      this.updateSplines();
      model.trackChangedEmitter.emit();
      model.updateEmitter.emit();
    };
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(stateListener);

    // when available bounds change, make sure that control points are within - must be disposed
    const boundsListener = bounds => {
      if (this.droppedProperty.get()) {
        this.containControlPointsInAvailableBounds(bounds);
      }
    };
    this.model.availableModelBoundsProperty.link(boundsListener);

    // @private - make the Track eligible for garbage collection
    this.disposeTrack = () => {
      Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.removeListener(stateListener);
      this.parents.length = 0;
      this.physicalProperty.dispose();
      this.leftThePanelProperty.dispose();
      this.draggingProperty.dispose();
      this.droppedProperty.dispose();
      this.controlPointDraggingProperty.dispose();
      this.model.availableModelBoundsProperty.unlink(boundsListener);
    };
  }

  // @public (phet-io)
  toStateObject() {
    return {
      controlPoints: this.controlPoints.map(ControlPointReferenceIO.toStateObject),
      parents: this.parents.map(Track.TrackIO.toStateObject),
      draggable: this.draggable,
      configurable: this.configurable
    };
  }

  /**
   * When points change, update the spline instance.
   * @public
   */
  updateSplines() {
    // Arrays are fixed length, so just overwrite values, see #38
    for (let i = 0; i < this.controlPoints.length; i++) {
      this.parametricPosition[i] = i / this.controlPoints.length;
      this.x[i] = this.controlPoints[i].positionProperty.value.x;
      this.y[i] = this.controlPoints[i].positionProperty.value.y;
    }
    this.xSpline = numeric.spline(this.parametricPosition, this.x);
    this.ySpline = numeric.spline(this.parametricPosition, this.y);

    // Mark search points as dirty
    this.xSearchPoints = null;
    this.ySearchPoints = null;

    // Mark derivatives as dirty
    this.xSplineDiff = null;
    this.ySplineDiff = null;
    this.xSplineDiffDiff = null;
    this.ySplineDiffDiff = null;
  }

  /**
   * Reset the track.
   * @public
   */
  reset() {
    this.physicalProperty.reset();
    this.leftThePanelProperty.reset();
    this.draggingProperty.reset();
    this.droppedProperty.reset();
    for (let i = 0; i < this.controlPoints.length; i++) {
      this.controlPoints[i].reset();
    }

    // if track is configurable, "slope to ground" energy corrections are disabled when control points move - on reset
    // reapply those corrections
    if (this._restoreSlopeToGroundOnReset) {
      this.slopeToGround = true;
    }

    // Broadcast message so that TrackNode can update the shape
    this.updateSplines();
    this.resetEmitter.emit();
  }

  /**
   * Returns the closest point (Euclidean) and position (parametric) on the track, as an object with {u,point}
   * also checks 1E-6 beyond each side of the track to see if the skater is beyond the edge of the track
   * This currently does a flat search, but if more precision is needed, a finer-grained binary search could be done
   * afterwards. This code is used when dragging the skater (to see if he is dragged near the track) and while the
   * skater is falling toward the track (to see if he should bounce/attach).
   * @public
   *
   * @param {Vector2} point
   * @returns {{parametricPosition: number, point: Vector2, distance: Number}}
   */
  getClosestPositionAndParameter(point) {
    // Compute the spline points for purposes of getting closest points.
    // keep these points around and invalidate only when necessary
    if (!this.xSearchPoints) {
      this.xSearchPoints = SplineEvaluation.atArray(this.xSpline, this.searchLinSpace);
      this.ySearchPoints = SplineEvaluation.atArray(this.ySpline, this.searchLinSpace);
    }
    let bestU = 0;
    let bestDistanceSquared = Number.POSITIVE_INFINITY;
    const bestPoint = new Vector2(0, 0);
    for (let i = 0; i < this.xSearchPoints.length; i++) {
      const distanceSquared = point.distanceSquaredXY(this.xSearchPoints[i], this.ySearchPoints[i]);
      if (distanceSquared < bestDistanceSquared) {
        bestDistanceSquared = distanceSquared;
        bestU = this.searchLinSpace[i];
        bestPoint.x = this.xSearchPoints[i];
        bestPoint.y = this.ySearchPoints[i];
      }
    }

    // Binary search in the neighborhood of the best point, to refine the search
    const distanceBetweenSearchPoints = Math.abs(this.searchLinSpace[1] - this.searchLinSpace[0]);
    let topU = bestU + distanceBetweenSearchPoints / 2;
    let bottomU = bestU - distanceBetweenSearchPoints / 2;
    let topX = SplineEvaluation.atNumber(this.xSpline, topU);
    let topY = SplineEvaluation.atNumber(this.ySpline, topU);
    let bottomX = SplineEvaluation.atNumber(this.xSpline, bottomU);
    let bottomY = SplineEvaluation.atNumber(this.ySpline, bottomU);

    // Even at 400 binary search iterations, performance is smooth on iPad3, so this loop doesn't seem too invasive
    const maxBinarySearchIterations = 40;
    for (let i = 0; i < maxBinarySearchIterations; i++) {
      const topDistanceSquared = point.distanceSquaredXY(topX, topY);
      const bottomDistanceSquared = point.distanceSquaredXY(bottomX, bottomY);
      if (topDistanceSquared < bottomDistanceSquared) {
        bottomU = bottomU + (topU - bottomU) / 4; // move halfway up
        bottomX = SplineEvaluation.atNumber(this.xSpline, bottomU);
        bottomY = SplineEvaluation.atNumber(this.ySpline, bottomU);
        bestDistanceSquared = topDistanceSquared;
      } else {
        topU = topU - (topU - bottomU) / 4; // move halfway down
        topX = SplineEvaluation.atNumber(this.xSpline, topU);
        topY = SplineEvaluation.atNumber(this.ySpline, topU);
        bestDistanceSquared = bottomDistanceSquared;
      }
    }
    bestU = (topU + bottomU) / 2;
    bestPoint.x = SplineEvaluation.atNumber(this.xSpline, bestU);
    bestPoint.y = SplineEvaluation.atNumber(this.ySpline, bestU);
    return {
      parametricPosition: bestU,
      point: bestPoint,
      distance: bestDistanceSquared
    };
  }

  /**
   * Get x position at the parametric position.
   * @public
   *
   * @param {number} parametricPosition
   * @returns {number}
   */
  getX(parametricPosition) {
    return SplineEvaluation.atNumber(this.xSpline, parametricPosition);
  }

  /**
   * Get y position at the parametric position.
   * @public
   *
   * @param {number} parametricPosition
   * @returns {number}
   */
  getY(parametricPosition) {
    return SplineEvaluation.atNumber(this.ySpline, parametricPosition);
  }

  /**
   * Get the model position at the parametric position.
   * @public
   *
   * @param {number} parametricPosition
   * @returns {Vector2}
   */
  getPoint(parametricPosition) {
    const x = SplineEvaluation.atNumber(this.xSpline, parametricPosition);
    const y = SplineEvaluation.atNumber(this.ySpline, parametricPosition);
    return new Vector2(x, y);
  }

  /**
   * Translate the track by moving all control points by dx and dy.
   * @private
   *
   * @param {number} dx
   * @param {number} dy
   */
  translate(dx, dy) {
    this._position = this._position.plusXY(dx, dy);

    // move all the control points
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      point.sourcePositionProperty.value = point.sourcePositionProperty.value.plusXY(dx, dy);
    }
    this.updateSplines();

    // Just observing the control points individually would lead to N expensive callbacks (instead of 1)
    // for each of the N points, So we use this broadcast mechanism instead
    this.translatedEmitter.emit();
  }

  /**
   * Set whether or not this Track slopes to the ground, and corrects energy on the transition from track to ground.
   * If the track is configurable, we do NOT want to maintain this correction when the control points move. But when
   * this track is reset, we should reapply this correction.
   * @public
   *
   * @param {boolean} slopeToGround
   */
  setSlopeToGround(slopeToGround) {
    this._slopeToGround = slopeToGround;
    if (slopeToGround) {
      this._restoreSlopeToGroundOnReset = true;
    }
  }

  /**
   * @public
   * @param slopeToGround
   */
  set slopeToGround(slopeToGround) {
    this.setSlopeToGround(slopeToGround);
  }

  /**
   * Get whether or not the track "slopes to the ground", and skater energy state should apply additional corrections.
   * @public
   *
   * @returns {boolean}
   */
  getSlopeToGround() {
    return this._slopeToGround;
  }
  get slopeToGround() {
    return this.getSlopeToGround();
  }

  /**
   * For purposes of showing the skater angle, get the view angle of the track here. Note this means inverting the y
   * values, this is called every step while animating on the track, so it was optimized to avoid new allocations.
   * @public
   *
   * @param {number} parametricPosition
   * @returns {number}
   */
  getViewAngleAt(parametricPosition) {
    if (this.xSplineDiff === null) {
      this.xSplineDiff = this.xSpline.diff();
      this.ySplineDiff = this.ySpline.diff();
    }
    return Math.atan2(-SplineEvaluation.atNumber(this.ySplineDiff, parametricPosition), SplineEvaluation.atNumber(this.xSplineDiff, parametricPosition));
  }

  /**
   * Get the model angle at the specified position on the track.
   * @public
   *
   * @param {number} parametricPosition
   * @returns {number}
   */
  getModelAngleAt(parametricPosition) {
    // load xSplineDiff, ySplineDiff here if not already loaded
    if (this.xSplineDiff === null) {
      this.xSplineDiff = this.xSpline.diff();
      this.ySplineDiff = this.ySpline.diff();
    }
    return Math.atan2(SplineEvaluation.atNumber(this.ySplineDiff, parametricPosition), SplineEvaluation.atNumber(this.xSplineDiff, parametricPosition));
  }

  /**
   * Get the model unit vector at the specified position on the track.
   * @public
   *
   * @param {number} parametricPosition
   * @returns {number}
   */
  getUnitNormalVector(parametricPosition) {
    // load xSplineDiff, ySplineDiff here if not already loaded
    if (this.xSplineDiff === null) {
      this.xSplineDiff = this.xSpline.diff();
      this.ySplineDiff = this.ySpline.diff();
    }
    return new Vector2(-SplineEvaluation.atNumber(this.ySplineDiff, parametricPosition), SplineEvaluation.atNumber(this.xSplineDiff, parametricPosition)).normalize();
  }

  /**
   * Get the model parallel vector at the specified position on the track.
   * @public
   *
   * @param parametricPosition
   * @returns {Vector2|Vector3|Vector4}
   */
  getUnitParallelVector(parametricPosition) {
    // load xSplineDiff, ySplineDiff here if not already loaded
    if (this.xSplineDiff === null) {
      this.xSplineDiff = this.xSpline.diff();
      this.ySplineDiff = this.ySpline.diff();
    }
    return new Vector2(SplineEvaluation.atNumber(this.xSplineDiff, parametricPosition), SplineEvaluation.atNumber(this.ySplineDiff, parametricPosition)).normalize();
  }

  /**
   * Update the linspace, the evenly spaced vectors between the number of control points in the track.
   * @private
   */
  updateLinSpace() {
    this.minPoint = 0;
    this.maxPoint = (this.controlPoints.length - 1) / this.controlPoints.length;
    const prePoint = this.minPoint - 1E-6;
    const postPoint = this.maxPoint + 1E-6;

    // Store for performance
    // made number of sample points depend on the length of the track, to make it smooth enough no matter how long it is
    const n = 20 * (this.controlPoints.length - 1);
    this.searchLinSpace = numeric.linspace(prePoint, postPoint, n);
    this.distanceBetweenSamplePoints = (postPoint - prePoint) / n;
  }

  /**
   * Detect whether a parametric point is in bounds of this track, for purposes of telling whether the skater fell
   * past the edge of the track.
   * @public
   *
   * @param {Vector2} parametricPosition
   * @returns {boolean}
   */
  isParameterInBounds(parametricPosition) {
    return parametricPosition >= this.minPoint && parametricPosition <= this.maxPoint;
  }

  /**
   * Track information as a string for debugging purposes.
   * @public
   *
   * @returns {string}
   */
  toString() {
    let string = '';
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      string = `${string}(${point.positionProperty.value.x},${point.positionProperty.value.y})`;
    }
    return string;
  }

  /**
   * Get the snap target for a control point, if one is specified.
   * @public
   *
   * @returns {null|ControlPoint}
   */
  getSnapTarget() {
    for (let i = 0; i < this.controlPoints.length; i++) {
      const o = this.controlPoints[i];
      if (o.snapTargetProperty.value) {
        return o.snapTargetProperty.value;
      }
    }
    return null;
  }

  /**
   * Get the y position in meters of the bottom most control point.
   * @public
   *
   * @returns {number}
   */
  getBottomControlPointY() {
    let best = Number.POSITIVE_INFINITY;
    const length = this.controlPoints.length;
    for (let i = 0; i < length; i++) {
      if (this.controlPoints[i].sourcePositionProperty.value.y < best) {
        best = this.controlPoints[i].sourcePositionProperty.value.y;
      }
    }
    return best;
  }

  /**
   * Get the y position in meters of the top most control point.
   * @public
   *
   * @returns {number}
   */
  getTopControlPointY() {
    let best = Number.NEGATIVE_INFINITY;
    const length = this.controlPoints.length;
    for (let i = 0; i < length; i++) {
      if (this.controlPoints[i].sourcePositionProperty.value.y > best) {
        best = this.controlPoints[i].sourcePositionProperty.value.y;
      }
    }
    return best;
  }

  /**
   * Get the x position of the left most control point, in meters.
   * @public
   *
   * @returns {number}
   */
  getLeftControlPointX() {
    let best = Number.POSITIVE_INFINITY;
    const length = this.controlPoints.length;
    for (let i = 0; i < length; i++) {
      if (this.controlPoints[i].sourcePositionProperty.value.x < best) {
        best = this.controlPoints[i].sourcePositionProperty.value.x;
      }
    }
    return best;
  }

  /**
   * Get the x position of the right most control point, in meters.
   * @public
   *
   * @returns {number}
   */
  getRightControlPointX() {
    let best = Number.NEGATIVE_INFINITY;
    const length = this.controlPoints.length;
    for (let i = 0; i < length; i++) {
      if (this.controlPoints[i].sourcePositionProperty.value.x > best) {
        best = this.controlPoints[i].sourcePositionProperty.value.x;
      }
    }
    return best;
  }

  /**
   * Returns true if this track contains the provided control point.
   * @public
   *
   * @param {ControlPoint} controlPoint
   * @returns {boolean}
   */
  containsControlPoint(controlPoint) {
    for (let i = 0; i < this.controlPoints.length; i++) {
      if (this.controlPoints[i] === controlPoint) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns an array which contains all of the Tracks that would need to be reset if this Track was reset.
   * @public
   *
   * @returns {Track[]}
   */
  getParentsOrSelf() {
    return this.parents.length > 0 ? this.parents : [this];
  }

  /**
   * Return this track to its control panel by resetting it to its initial state.
   * @public
   */
  returnToControlPanel() {
    if (this.parents.length > 0) {
      this.model.removeAndDisposeTrack(this);
      for (let i = 0; i < this.parents.length; i++) {
        const parent = this.parents[i];
        parent.reset();
        this.model.tracks.add(parent);
      }
    } else {
      this.reset();
    }
  }

  /**
   * Returns the arc length (in meters) between two points on a parametric curve.
   * This function is at the heart of many nested loops, so it must be heavily optimized
   * @public
   *
   * @param {number} u0
   * @param {number} u1
   * @returns {number}
   */
  getArcLength(u0, u1) {
    if (u1 === u0) {
      return 0;
    }
    if (u1 < u0) {
      return -this.getArcLength(u1, u0);
    }

    // Discrepancy with original version: original version had 10 subdivisions here.  We have reduced it to improve
    // performance at the cost of numerical precision
    const numSegments = 4;
    const da = (u1 - u0) / (numSegments - 1);
    let prevX = SplineEvaluation.atNumber(this.xSpline, u0);
    let prevY = SplineEvaluation.atNumber(this.ySpline, u0);
    let sum = 0;
    for (let i = 1; i < numSegments; i++) {
      const a = u0 + i * da;
      const ptX = SplineEvaluation.atNumber(this.xSpline, a);
      const ptY = SplineEvaluation.atNumber(this.ySpline, a);
      const dx = prevX - ptX;
      const dy = prevY - ptY;
      sum += Math.sqrt(dx * dx + dy * dy);
      prevX = ptX;
      prevY = ptY;
    }
    return sum;
  }

  /**
   * Find the parametric distance along the track, starting at u0 and moving ds meters
   * @public
   *
   * @param {number} u0 the starting point along the track in parametric coordinates
   * @param {number} ds meters to traverse along the track
   * @returns {number}
   */
  getParametricDistance(u0, ds) {
    let lowerBound = -1;
    let upperBound = 2;
    let guess = (upperBound + lowerBound) / 2.0;
    let metricDelta = this.getArcLength(u0, guess);
    const epsilon = 1E-8; // ORIGINAL ENERGY SKATE PARK BASICS HAD VALUE 1E-8

    let count = 0;
    while (Math.abs(metricDelta - ds) > epsilon) {
      if (metricDelta > ds) {
        upperBound = guess;
      } else {
        lowerBound = guess;
      }
      guess = (upperBound + lowerBound) / 2.0;
      metricDelta = this.getArcLength(u0, guess);
      count++;
      if (count > 100) {
        assert && assert(count <= 100, 'binary search failed');
        break;
      }
    }
    return guess - u0;
  }

  /**
   * Compute the signed curvature as defined here: http://en.wikipedia.org/wiki/Curvature#Local_expressions
   * Used for centripetal force and determining whether the skater flies off the track
   * Curvature parameter is for storing the result as pass-by-reference.
   * Please see #50 regarding GC
   * @public
   *
   * @param {number} parametricPosition
   * @param {Object} curvature - object literal with { r: {number}, x: {number}, y: {number} }
   */
  getCurvature(parametricPosition, curvature) {
    if (this.xSplineDiff === null) {
      this.xSplineDiff = this.xSpline.diff();
      this.ySplineDiff = this.ySpline.diff();
    }
    if (this.xSplineDiffDiff === null) {
      this.xSplineDiffDiff = this.xSplineDiff.diff();
      this.ySplineDiffDiff = this.ySplineDiff.diff();
    }
    const xP = SplineEvaluation.atNumber(this.xSplineDiff, parametricPosition);
    const xPP = SplineEvaluation.atNumber(this.xSplineDiffDiff, parametricPosition);
    const yP = SplineEvaluation.atNumber(this.ySplineDiff, parametricPosition);
    const yPP = SplineEvaluation.atNumber(this.ySplineDiffDiff, parametricPosition);
    const k = (xP * yPP - yP * xPP) / Math.pow(xP * xP + yP * yP, 3 / 2);

    // Using component-wise math to avoid allocations, see #50
    const centerX = this.getX(parametricPosition);
    const centerY = this.getY(parametricPosition);
    const unitNormalVector = this.getUnitNormalVector(parametricPosition);
    const vectorX = unitNormalVector.x / k + centerX;
    const vectorY = unitNormalVector.y / k + centerY;
    curvature.r = 1 / k;
    curvature.x = vectorX;
    curvature.y = vectorY;
  }

  /**
   * Find the lowest y-point on the spline by sampling, used when dropping the track or a control point to ensure
   * it won't go below y=0.
   * @public
   *
   * @returns {number}
   */
  getLowestY() {
    if (!this.xSearchPoints) {
      this.xSearchPoints = SplineEvaluation.atArray(this.xSpline, this.searchLinSpace);
      this.ySearchPoints = SplineEvaluation.atArray(this.ySpline, this.searchLinSpace);
    }
    let min = Number.POSITIVE_INFINITY;
    let minIndex = -1;
    let y;
    for (let i = 0; i < this.ySearchPoints.length; i++) {
      y = this.ySearchPoints[i];
      if (y < min) {
        min = y;
        minIndex = i;
      }
    }

    // Increase resolution in the neighborhood of y
    const foundU = this.searchLinSpace[minIndex];
    const minBound = foundU - this.distanceBetweenSamplePoints;
    const maxBound = foundU + this.distanceBetweenSamplePoints;
    const smallerSpace = numeric.linspace(minBound, maxBound, 200);
    const refinedSearchPoints = SplineEvaluation.atArray(this.ySpline, smallerSpace);
    min = Number.POSITIVE_INFINITY;
    for (let i = 0; i < refinedSearchPoints.length; i++) {
      y = refinedSearchPoints[i];
      if (y < min) {
        min = y;
      }
    }
    return min;
  }

  /**
   * If any part of the track is below ground, move the whole track up so it rests at y=0 at its minimum, see #71
   * Called when user releases track or a control point after dragging.
   *
   * @public
   */
  bumpAboveGround() {
    const lowestY = this.getLowestY();
    if (lowestY < 0) {
      this.translate(0, -lowestY);
    }

    // contain control points in limiting drag bounds (if control points have them specified) so that bumping above
    // ground doesn't push control points out of these bounds - do this without updating splines since we will
    // do that anyway in containControlPointsInAvailableBounds
    this.containControlPointsInLimitBounds(false);
    this.containControlPointsInAvailableBounds(this.model.availableModelBoundsProperty.get());
  }

  /**
   * If any control points are out of the model available bounds (bounds of the entire simulation play area),
   * bump them back in. Useful when the model bounds change, or when bumping the track above ground.
   *
   * @private
   */
  containControlPointsInAvailableBounds(bounds) {
    for (let i = 0; i < this.controlPoints.length; i++) {
      const currentPosition = this.controlPoints[i].positionProperty.get();
      if (!bounds.containsPoint(currentPosition)) {
        const newPoint = bounds.getClosestPoint(currentPosition.x, currentPosition.y);

        // set the control point "source" position to the new point - this is the unsnapped position, see
        // ControlPoint.js
        this.controlPoints[i].sourcePositionProperty.value = newPoint;
      }
    }
    this.updateSplines();

    // It is possible that containing the control points has pushed a portion of the spline back
    // underground, if that is the case bump them back above ground. But only do this if no control points
    // are "snapping" as the spline *could* be underground  temporarily in this case
    const anyControlPointsSnapping = _.some(this.controlPoints, point => point.snapTargetProperty.get());
    if (!anyControlPointsSnapping) {
      const lowestY = this.getLowestY();
      if (lowestY < 0) {
        // push the track above ground by an amount that isn't prone to precision errors, see
        // https://github.com/phetsims/energy-skate-park/issues/191
        const correction = lowestY - 0.001;

        // translate updates splines for us
        this.translate(0, -correction);
        assert && assert(this.getLowestY() >= 0, 'track should be above ground');
      }
    }

    // assert && assert( this.getLowestY() >= 0, 'track should be above ground' );
    this.updateEmitter.emit();
  }

  /**
   * Make sure that all control points are contained within their limiting draggable bounds. The algorithm for keeping
   * the track above ground might push all control points up, so this will make sure that limiting bounds are
   * respected. Not all control points have limiting bounds for dragging.
   * @private
   *
   * @param {boolean} [updateSplines] optional, whether or not to update splines and redraw after this operation
   *                                  (for performance, you might chose to wait and do this later)
   */
  containControlPointsInLimitBounds(updateSplines) {
    for (let i = 0; i < this.controlPoints.length; i++) {
      const controlPoint = this.controlPoints[i];
      const limitBounds = controlPoint.limitBounds;
      const currentPosition = controlPoint.positionProperty.get();
      if (limitBounds) {
        if (!limitBounds.containsPoint(currentPosition)) {
          const newPoint = limitBounds.getClosestPoint(currentPosition.x, currentPosition.y);
          controlPoint.sourcePositionProperty.set(newPoint);
        }
      }
      if (updateSplines) {
        this.updateSplines();
        this.updateEmitter.emit();
      }
    }
  }

  /**
   * Smooth out the track so it doesn't have any sharp turns, see #177
   * @public
   *
   * @param {number} i - the index of the control point to adjust
   */
  smooth(i) {
    assert && assert(i >= 0 && i < this.controlPoints.length);
    assert && assert(this.model.availableModelBoundsProperty);
    const availableModelBounds = this.model.availableModelBoundsProperty.value;
    assert && assert(availableModelBounds);
    let success = false;
    let numTries = 0;

    // Record the original control point position
    const originalX = this.controlPoints[i].sourcePositionProperty.value.x;
    const originalY = this.controlPoints[i].sourcePositionProperty.value.y;

    // Spiral outward, searching for a point that gives a smooth enough track.
    let distance = 0.01;
    let angle = 0;
    const MAX_TRIES = 80;
    const MAXIMUM_ACCEPTABLE_RADIUS_OF_CURVATURE = 0.03;
    while (this.getMinimumRadiusOfCurvature() < MAXIMUM_ACCEPTABLE_RADIUS_OF_CURVATURE && numTries < MAX_TRIES) {
      const delta = Vector2.createPolar(distance, angle);
      const proposedPosition = delta.plusXY(originalX, originalY);

      // Only search within the visible model bounds, see #195
      const containsPoint = availableModelBounds.containsPoint(proposedPosition);
      if (containsPoint) {
        this.controlPoints[i].sourcePositionProperty.value = proposedPosition;
        this.updateSplines();
      }
      angle = angle + Math.PI / 9;
      distance = distance + 0.07;
      numTries++;
    }

    // Could not find a better solution, leave the control point where it started.
    if (numTries >= MAX_TRIES) {
      this.controlPoints[i].sourcePositionProperty.value = new Vector2(originalX, originalY);
      this.updateSplines();
    } else {
      success = true;
    }
    this.smoothedEmitter.emit();
    return success;
  }

  /**
   * The user just released a control point with index (indexToIgnore) and the spline needs to be smoothed.
   * Choose the point closest to the sharpest turn and adjust it.
   * @public
   *
   * @param {Array} indicesToIgnore indices which should not be adjusted (perhaps because the user just released them)
   */
  smoothPointOfHighestCurvature(indicesToIgnore) {
    // Find the sharpest turn on the track
    const highestCurvatureU = this.getUWithHighestCurvature();

    // find the point closest (in parametric coordinates) to the sharpest turn, but not including the indexToIgnore
    // it looks like the control points are equally spaced in parametric coordinates (see the constructor)
    let bestDistance = Number.POSITIVE_INFINITY;
    let bestIndex = -1;
    for (let i = 0; i < this.controlPoints.length; i++) {
      if (indicesToIgnore.indexOf(i) === -1) {
        const controlPointU = i / this.controlPoints.length;
        const distanceFromHighestCurvature = Math.abs(highestCurvatureU - controlPointU);
        if (distanceFromHighestCurvature < bestDistance) {
          bestDistance = distanceFromHighestCurvature;
          bestIndex = i;
        }
      }
    }

    // If smoothing succeeded, all is well, otherwise try smoothing based on another point, see #198
    const success = this.smooth(bestIndex);
    if (success) {
      return true;
    } else {
      indicesToIgnore.push(bestIndex);
      if (indicesToIgnore.length === this.controlPoints.length) {
        return false;
      } else {
        return this.smoothPointOfHighestCurvature(indicesToIgnore);
      }
    }
  }

  /**
   * Get the spline position at the point of highest curvature.
   * @private
   *
   * @returns {number}
   */
  getUWithHighestCurvature() {
    // Below implementation copied from getMinimumRadiusOfCurvature.  It is a CPU demanding task, so kept separate to
    // keep the other one fast. Should be kept in sync manually
    const curvature = {
      r: 0,
      x: 0,
      y: 0
    };
    let minRadius = Number.POSITIVE_INFINITY;
    let bestU = 0;

    // Search the entire space of the spline.  Larger number of divisions was chosen to prevent large curvatures at a
    // single sampling point.
    const numDivisions = 400;
    const du = (this.maxPoint - this.minPoint) / numDivisions;
    for (let parametricPosition = this.minPoint; parametricPosition < this.maxPoint; parametricPosition += du) {
      this.getCurvature(parametricPosition, curvature);
      const r = Math.abs(curvature.r);
      if (r < minRadius) {
        minRadius = r;
        bestU = parametricPosition;
      }
    }
    return bestU;
  }

  /**
   * Find the minimum radius of curvature along the track, in meters
   * @public
   *
   * @returns {number} the minimum radius of curvature along the track, in meters.
   */
  getMinimumRadiusOfCurvature() {
    const curvature = {
      r: 0,
      x: 0,
      y: 0
    };
    let minRadius = Number.POSITIVE_INFINITY;

    // Search the entire space of the spline.  Larger number of divisions was chosen to prevent large curvatures at a
    // single sampling point.
    const numDivisions = 400;
    const du = (this.maxPoint - this.minPoint) / numDivisions;
    for (let parametricPosition = this.minPoint; parametricPosition < this.maxPoint; parametricPosition += du) {
      this.getCurvature(parametricPosition, curvature);
      const r = Math.abs(curvature.r);
      if (r < minRadius) {
        minRadius = r;
      }
    }
    return minRadius;
  }

  /**
   * Use an arbitrary position for translating the track during dragging. Only used for deltas in relative positioning
   * and translation, so an exact "position" is irrelevant.
   * @public
   *
   * @returns {Vector2}
   */
  get position() {
    return this._position.copy();
  }

  /**
   * Set the position of this Track.
   * @public
   *
   * @param {Vector2} newPosition
   */
  set position(newPosition) {
    const delta = newPosition.minus(this.position);
    this.translate(delta.x, delta.y);
  }

  /**
   * Get an array of all control point sourcePositions - this is the position of all ControlPoint's if none had
   * snapped to a position in attempt to combine with another track.
   * @public
   *
   * @returns {Vector2[]}
   */
  copyControlPointSources() {
    return this.controlPoints.map(controlPoint => controlPoint.sourcePositionProperty.value.copy());
  }

  /**
   * Debugging info.
   * @public
   */
  getDebugString() {
    let string = 'var controlPoints = [';
    for (let i = 0; i < this.controlPoints.length; i++) {
      const controlPoint = this.controlPoints[i];
      string += `new ControlPoint(${controlPoint.positionProperty.value.x},${controlPoint.positionProperty.value.y})`;
      if (i < this.controlPoints.length - 1) {
        string += ',';
      }
    }
    return `${string}];`;
  }

  /**
   * Disposal for garbage collection.
   * @public
   */
  dispose() {
    this.disposeTrack();
    super.dispose();
  }

  /**
   * Dispose all of the control points of the track when they will not be reused in another track
   * @public
   */
  disposeControlPoints() {
    this.controlPoints.forEach(controlPoint => this.model.controlPointGroup.disposeElement(controlPoint));
  }
}

// @public @public
Track.FULLY_INTERACTIVE_OPTIONS = FULLY_INTERACTIVE_OPTIONS;
Track.TrackIO = new IOType('TrackIO', {
  valueType: Track,
  documentation: 'A skate track',
  toStateObject: track => track.toStateObject(),
  stateObjectToCreateElementArguments: stateObject => {
    const controlPoints = stateObject.controlPoints.map(ControlPointReferenceIO.fromStateObject);
    const parents = stateObject.parents.map(Track.TrackIO.fromStateObject);
    return [controlPoints, parents, {
      draggable: stateObject.draggable,
      configurable: stateObject.configurable
    }];
  },
  stateSchema: TrackIO => ({
    controlPoints: ArrayIO(ControlPointReferenceIO),
    parents: ArrayIO(TrackIO),
    draggable: BooleanIO,
    configurable: BooleanIO
  })
});
energySkatePark.register('Track', Track);
export default Track;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiZG90IiwiVmVjdG9yMiIsIm1lcmdlIiwiU2NlbmVyeUV2ZW50IiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiQXJyYXlJTyIsIkJvb2xlYW5JTyIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwiZW5lcmd5U2thdGVQYXJrIiwiU3BsaW5lRXZhbHVhdGlvbiIsIkNvbnRyb2xQb2ludCIsIkZhc3RBcnJheSIsIkNvbnRyb2xQb2ludFJlZmVyZW5jZUlPIiwiQ29udHJvbFBvaW50SU8iLCJGVUxMWV9JTlRFUkFDVElWRV9PUFRJT05TIiwiZHJhZ2dhYmxlIiwiY29uZmlndXJhYmxlIiwic3BsaXR0YWJsZSIsImF0dGFjaGFibGUiLCJUcmFjayIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJjb250cm9sUG9pbnRzIiwicGFyZW50cyIsIm9wdGlvbnMiLCJhc3NlcnQiLCJBcnJheSIsImlzQXJyYXkiLCJzbG9wZVRvR3JvdW5kIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJwaGV0aW9UeXBlIiwiVHJhY2tJTyIsInBoZXRpb1N0YXRlIiwiREVGQVVMVF9PUFRJT05TIiwidHJhY2tUYW5kZW0iLCJ0cmFuc2xhdGVkRW1pdHRlciIsInJlc2V0RW1pdHRlciIsInNtb290aGVkRW1pdHRlciIsInVwZGF0ZUVtaXR0ZXIiLCJyZW1vdmVFbWl0dGVyIiwiZm9yd2FyZGluZ0RyYWdTdGFydEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiZHJhZ1NvdXJjZSIsIl9zbG9wZVRvR3JvdW5kIiwiX3Jlc3RvcmVTbG9wZVRvR3JvdW5kT25SZXNldCIsIl9wb3NpdGlvbiIsInBoeXNpY2FsUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJsZWZ0VGhlUGFuZWxQcm9wZXJ0eSIsImRyYWdnaW5nUHJvcGVydHkiLCJkcm9wcGVkUHJvcGVydHkiLCJ0cmFja0NoYW5nZWRMaXN0ZW5lciIsInRyYWNrQ2hhbmdlZEVtaXR0ZXIiLCJlbWl0IiwibGluayIsImNvbnRyb2xQb2ludERyYWdnaW5nUHJvcGVydHkiLCJfIiwibWFwIiwicG9pbnQiLCJhcmdzIiwicmVkdWNlIiwiY29sbGFwc2VkIiwidmFsdWUiLCJwYXJhbWV0cmljUG9zaXRpb24iLCJsZW5ndGgiLCJ4IiwieSIsInNlYXJjaExpblNwYWNlIiwiZGlzdGFuY2VCZXR3ZWVuU2FtcGxlUG9pbnRzIiwidXBkYXRlTGluU3BhY2UiLCJ1cGRhdGVTcGxpbmVzIiwic2V0U2xvcGVUb0dyb3VuZCIsInN0YXRlTGlzdGVuZXIiLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0IiwicGhldGlvIiwicGhldGlvRW5naW5lIiwicGhldGlvU3RhdGVFbmdpbmUiLCJzdGF0ZVNldEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImJvdW5kc0xpc3RlbmVyIiwiYm91bmRzIiwiZ2V0IiwiY29udGFpbkNvbnRyb2xQb2ludHNJbkF2YWlsYWJsZUJvdW5kcyIsImF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkiLCJkaXNwb3NlVHJhY2siLCJyZW1vdmVMaXN0ZW5lciIsImRpc3Bvc2UiLCJ1bmxpbmsiLCJ0b1N0YXRlT2JqZWN0IiwiaSIsInBvc2l0aW9uUHJvcGVydHkiLCJ4U3BsaW5lIiwibnVtZXJpYyIsInNwbGluZSIsInlTcGxpbmUiLCJ4U2VhcmNoUG9pbnRzIiwieVNlYXJjaFBvaW50cyIsInhTcGxpbmVEaWZmIiwieVNwbGluZURpZmYiLCJ4U3BsaW5lRGlmZkRpZmYiLCJ5U3BsaW5lRGlmZkRpZmYiLCJyZXNldCIsImdldENsb3Nlc3RQb3NpdGlvbkFuZFBhcmFtZXRlciIsImF0QXJyYXkiLCJiZXN0VSIsImJlc3REaXN0YW5jZVNxdWFyZWQiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsImJlc3RQb2ludCIsImRpc3RhbmNlU3F1YXJlZCIsImRpc3RhbmNlU3F1YXJlZFhZIiwiZGlzdGFuY2VCZXR3ZWVuU2VhcmNoUG9pbnRzIiwiTWF0aCIsImFicyIsInRvcFUiLCJib3R0b21VIiwidG9wWCIsImF0TnVtYmVyIiwidG9wWSIsImJvdHRvbVgiLCJib3R0b21ZIiwibWF4QmluYXJ5U2VhcmNoSXRlcmF0aW9ucyIsInRvcERpc3RhbmNlU3F1YXJlZCIsImJvdHRvbURpc3RhbmNlU3F1YXJlZCIsImRpc3RhbmNlIiwiZ2V0WCIsImdldFkiLCJnZXRQb2ludCIsInRyYW5zbGF0ZSIsImR4IiwiZHkiLCJwbHVzWFkiLCJzb3VyY2VQb3NpdGlvblByb3BlcnR5IiwiZ2V0U2xvcGVUb0dyb3VuZCIsImdldFZpZXdBbmdsZUF0IiwiZGlmZiIsImF0YW4yIiwiZ2V0TW9kZWxBbmdsZUF0IiwiZ2V0VW5pdE5vcm1hbFZlY3RvciIsIm5vcm1hbGl6ZSIsImdldFVuaXRQYXJhbGxlbFZlY3RvciIsIm1pblBvaW50IiwibWF4UG9pbnQiLCJwcmVQb2ludCIsInBvc3RQb2ludCIsIm4iLCJsaW5zcGFjZSIsImlzUGFyYW1ldGVySW5Cb3VuZHMiLCJ0b1N0cmluZyIsInN0cmluZyIsImdldFNuYXBUYXJnZXQiLCJvIiwic25hcFRhcmdldFByb3BlcnR5IiwiZ2V0Qm90dG9tQ29udHJvbFBvaW50WSIsImJlc3QiLCJnZXRUb3BDb250cm9sUG9pbnRZIiwiTkVHQVRJVkVfSU5GSU5JVFkiLCJnZXRMZWZ0Q29udHJvbFBvaW50WCIsImdldFJpZ2h0Q29udHJvbFBvaW50WCIsImNvbnRhaW5zQ29udHJvbFBvaW50IiwiY29udHJvbFBvaW50IiwiZ2V0UGFyZW50c09yU2VsZiIsInJldHVyblRvQ29udHJvbFBhbmVsIiwicmVtb3ZlQW5kRGlzcG9zZVRyYWNrIiwicGFyZW50IiwidHJhY2tzIiwiYWRkIiwiZ2V0QXJjTGVuZ3RoIiwidTAiLCJ1MSIsIm51bVNlZ21lbnRzIiwiZGEiLCJwcmV2WCIsInByZXZZIiwic3VtIiwiYSIsInB0WCIsInB0WSIsInNxcnQiLCJnZXRQYXJhbWV0cmljRGlzdGFuY2UiLCJkcyIsImxvd2VyQm91bmQiLCJ1cHBlckJvdW5kIiwiZ3Vlc3MiLCJtZXRyaWNEZWx0YSIsImVwc2lsb24iLCJjb3VudCIsImdldEN1cnZhdHVyZSIsImN1cnZhdHVyZSIsInhQIiwieFBQIiwieVAiLCJ5UFAiLCJrIiwicG93IiwiY2VudGVyWCIsImNlbnRlclkiLCJ1bml0Tm9ybWFsVmVjdG9yIiwidmVjdG9yWCIsInZlY3RvclkiLCJyIiwiZ2V0TG93ZXN0WSIsIm1pbiIsIm1pbkluZGV4IiwiZm91bmRVIiwibWluQm91bmQiLCJtYXhCb3VuZCIsInNtYWxsZXJTcGFjZSIsInJlZmluZWRTZWFyY2hQb2ludHMiLCJidW1wQWJvdmVHcm91bmQiLCJsb3dlc3RZIiwiY29udGFpbkNvbnRyb2xQb2ludHNJbkxpbWl0Qm91bmRzIiwiY3VycmVudFBvc2l0aW9uIiwiY29udGFpbnNQb2ludCIsIm5ld1BvaW50IiwiZ2V0Q2xvc2VzdFBvaW50IiwiYW55Q29udHJvbFBvaW50c1NuYXBwaW5nIiwic29tZSIsImNvcnJlY3Rpb24iLCJsaW1pdEJvdW5kcyIsInNldCIsInNtb290aCIsImF2YWlsYWJsZU1vZGVsQm91bmRzIiwic3VjY2VzcyIsIm51bVRyaWVzIiwib3JpZ2luYWxYIiwib3JpZ2luYWxZIiwiYW5nbGUiLCJNQVhfVFJJRVMiLCJNQVhJTVVNX0FDQ0VQVEFCTEVfUkFESVVTX09GX0NVUlZBVFVSRSIsImdldE1pbmltdW1SYWRpdXNPZkN1cnZhdHVyZSIsImRlbHRhIiwiY3JlYXRlUG9sYXIiLCJwcm9wb3NlZFBvc2l0aW9uIiwiUEkiLCJzbW9vdGhQb2ludE9mSGlnaGVzdEN1cnZhdHVyZSIsImluZGljZXNUb0lnbm9yZSIsImhpZ2hlc3RDdXJ2YXR1cmVVIiwiZ2V0VVdpdGhIaWdoZXN0Q3VydmF0dXJlIiwiYmVzdERpc3RhbmNlIiwiYmVzdEluZGV4IiwiaW5kZXhPZiIsImNvbnRyb2xQb2ludFUiLCJkaXN0YW5jZUZyb21IaWdoZXN0Q3VydmF0dXJlIiwicHVzaCIsIm1pblJhZGl1cyIsIm51bURpdmlzaW9ucyIsImR1IiwicG9zaXRpb24iLCJjb3B5IiwibmV3UG9zaXRpb24iLCJtaW51cyIsImNvcHlDb250cm9sUG9pbnRTb3VyY2VzIiwiZ2V0RGVidWdTdHJpbmciLCJkaXNwb3NlQ29udHJvbFBvaW50cyIsImZvckVhY2giLCJjb250cm9sUG9pbnRHcm91cCIsImRpc3Bvc2VFbGVtZW50IiwiZG9jdW1lbnRhdGlvbiIsInRyYWNrIiwic3RhdGVPYmplY3RUb0NyZWF0ZUVsZW1lbnRBcmd1bWVudHMiLCJzdGF0ZU9iamVjdCIsImZyb21TdGF0ZU9iamVjdCIsInN0YXRlU2NoZW1hIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUcmFjay5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3Igb25lIHRyYWNrIGluIEVuZXJneSBTa2F0ZSBQYXJrLCB3aGljaCBjb250YWlucyB0aGUgY29udHJvbCBwb2ludHMgYW5kIGN1YmljIHNwbGluZXMgZm9yXHJcbiAqIGludGVycG9sYXRpbmcgYmV0d2VlbiB0aGVtLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IGRvdCBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5pbXBvcnQgU3BsaW5lRXZhbHVhdGlvbiBmcm9tICcuLi9TcGxpbmVFdmFsdWF0aW9uLmpzJztcclxuaW1wb3J0IENvbnRyb2xQb2ludCBmcm9tICcuL0NvbnRyb2xQb2ludC5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRmFzdEFycmF5ID0gZG90LkZhc3RBcnJheTtcclxuXHJcbmNvbnN0IENvbnRyb2xQb2ludFJlZmVyZW5jZUlPID0gUmVmZXJlbmNlSU8oIENvbnRyb2xQb2ludC5Db250cm9sUG9pbnRJTyApO1xyXG5cclxuLy8gb3B0aW9ucyBmb3IgYSB0cmFjayB0aGF0IGlzIGZ1bGx5IGludGVyYWN0aXZlIC0gaXQgY2FuIGJlIGRyYWdnZWQsIGNvbnRyb2wgcG9pbnRzIGNhbiBiZSBtb3ZlZCwgYnJva2VuIGludG9cclxuLy8gZGlmZmVyZW50IHRyYWNrcywgYW5kIGNvbWJpbmVkIHdpdGggYW5vdGhlciB0cmFja1xyXG5jb25zdCBGVUxMWV9JTlRFUkFDVElWRV9PUFRJT05TID0ge1xyXG4gIGRyYWdnYWJsZTogdHJ1ZSxcclxuICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgc3BsaXR0YWJsZTogdHJ1ZSxcclxuICBhdHRhY2hhYmxlOiB0cnVlXHJcbn07XHJcblxyXG5jbGFzcyBUcmFjayBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGVsIGZvciBhIHRyYWNrLCB3aGljaCBoYXMgYSBmaXhlZCBudW1iZXIgb2YgcG9pbnRzLiAgSWYgeW91IGFkZGVkIGEgcG9pbnQgdG8gYSBUcmFjaywgeW91IG5lZWQgYSBuZXcgdHJhY2suXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya01vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPENvbnRyb2xQb2ludD59IGNvbnRyb2xQb2ludHNcclxuICAgKiBAcGFyYW0ge0FycmF5LjxUcmFjaz59IHBhcmVudHMgdGhlIG9yaWdpbmFsIHRyYWNrcyB0aGF0IHdlcmUgdXNlZCB0byBtYWtlIHRoaXMgdHJhY2sgKGlmIGFueSkgc28gdGhleSBjYW4gYmVcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm9rZW4gYXBhcnQgd2hlbiBkcmFnZ2VkIGJhY2sgdG8gY29udHJvbCBwYW5lbCBhZGp1c3RlZCBjb250cm9sIHBvaW50IGZyb20gZ29pbmdcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZmZzY3JlZW4sIHNlZSAjMTk1XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIHJlcXVpcmVkIGZvciB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIGNvbnRyb2xQb2ludHMsIHBhcmVudHMsIG9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBBcnJheS5pc0FycmF5KCBwYXJlbnRzICksICdwYXJlbnRzIG11c3QgYmUgYXJyYXknICk7XHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGNhbiB0aGlzIHRyYWNrIGJlIGRyYWdnZWQgYW5kIG1vdmVkIGluIHRoZSBwbGF5IGFyZWE/XHJcbiAgICAgIGRyYWdnYWJsZTogZmFsc2UsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSBjYW4gdGhpcyB0cmFjayBiZSBjaGFuZ2VkIGJ5IGRyYWdnaW5nIGNvbnRyb2wgcG9pbnRzPyBTb21lIHRyYWNrcyBjYW4gaGF2ZSB0aGVpclxyXG4gICAgICAvLyBjb250cm9sIHBvaW50cyBtb3ZlZCBidXQgY2Fubm90IGJlIGRyYWdnZWQgYXMgYSB3aG9sZS5cclxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGNhbiB0aGlzIHRyYWNrIGJlIGNoYW5nZWQgb3IgYnJva2VuIGJ5IHJlbW92aW5nIGNvbnRyb2wgcG9pbnRzPyBJIHNvLCBjbGlja2luZyBvbiBhIGNvbnRyb2xcclxuICAgICAgLy8gcG9pbnQgd2lsbCBjcmVhdGUgYSBVSSB0byBzcGxpdCB0aGUgdHJhY2sgb3IgZGVsZXRlIHRoZSBjb250cm9sIHBvaW50LlxyXG4gICAgICBzcGxpdHRhYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIGNhbiB0aGlzIHRyYWNrIGJlIGF0dGFjaGVkIHdpdGggYW5vdGhlciB0cmFjayBieSBkcmFnZ2luZyB0cmFjayBvciBjb250cm9sIHBvaW50cz8gV2hlbiBhIHRyYWNrXHJcbiAgICAgIC8vIGlzIGF0dGFjaGFibGUgY29udHJvbCBwb2ludHMgYXQgdGhlIGVuZCBvZiB0aGUgdHJhY2sgaGF2ZSBhIGRpZmZlcmVudCB2aXN1YWxpemF0aW9uIHRvIGluZGljYXRlIHRoYXRcclxuICAgICAgLy8gdGhlIHRyYWNrIGNhbiBiZSBhdHRhY2hlZCB0byBhbm90aGVyLlxyXG4gICAgICBhdHRhY2hhYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIHNrYXRlciB0cmFuc2l0aW9ucyBmcm9tIHRoZSByaWdodCBlZGdlIG9mIHRoaXMgdHJhY2sgZGlyZWN0bHkgdG8gdGhlIGdyb3VuZCwgc2VlXHJcbiAgICAgIC8vIHRoaXMuX3Nsb3BlVG9Hcm91bmQgZm9yIG1vcmUgaW5mb3JtYXRpb25cclxuICAgICAgc2xvcGVUb0dyb3VuZDogZmFsc2UsXHJcblxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgcGhldGlvVHlwZTogVHJhY2suVHJhY2tJTyxcclxuICAgICAgcGhldGlvU3RhdGU6IFBoZXRpb09iamVjdC5ERUZBVUxUX09QVElPTlMucGhldGlvU3RhdGVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRhbmRlbSA9IG9wdGlvbnMudGFuZGVtO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnBhcmVudHMgPSBwYXJlbnRzO1xyXG4gICAgdGhpcy50cmFja1RhbmRlbSA9IHRhbmRlbTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gc2VlIG9wdGlvbnNcclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIHRoaXMuZHJhZ2dhYmxlID0gb3B0aW9ucy5kcmFnZ2FibGU7XHJcbiAgICB0aGlzLmNvbmZpZ3VyYWJsZSA9IG9wdGlvbnMuY29uZmlndXJhYmxlO1xyXG4gICAgdGhpcy5zcGxpdHRhYmxlID0gb3B0aW9ucy5zcGxpdHRhYmxlO1xyXG4gICAgdGhpcy5hdHRhY2hhYmxlID0gb3B0aW9ucy5hdHRhY2hhYmxlO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMudHJhbnNsYXRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5yZXNldEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy5zbW9vdGhlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgdGhpcy51cGRhdGVFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuICAgIHRoaXMucmVtb3ZlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmZvcndhcmRpbmdEcmFnU3RhcnRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHsgcGFyYW1ldGVyczogWyB7IHZhbHVlVHlwZTogU2NlbmVyeUV2ZW50IH0gXSB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7RHJhZ0xpc3RlbmVyfSBLZWVwIHRyYWNrIG9mIHdoYXQgY29tcG9uZW50IChjb250cm9sIHBvaW50IG9yIHRyYWNrIGJvZHkpIGlzIGRyYWdnaW5nIHRoZSB0cmFjaywgc29cclxuICAgIC8vIHRoYXQgaXQgY2FuJ3QgYmUgZHJhZ2dlZCBieVxyXG4gICAgLy8gdHdvIHNvdXJjZXMsIHdoaWNoIGNhdXNlcyBhIGZsaWNrZXIsIHNlZSAjMjgyXHJcbiAgICB0aGlzLmRyYWdTb3VyY2UgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufSAtIEZsYWcgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgc2thdGVyIHRyYW5zaXRpb25zIGZyb20gdGhlIHJpZ2h0IGVkZ2Ugb2YgdGhpcyB0cmFjayBkaXJlY3RseSB0byB0aGVcclxuICAgIC8vIGdyb3VuZCwgaWYgc2V0IHRvIHRydWUsIGFkZGl0aW9uYWwgY29ycmVjdGlvbnMgdG8gc2thdGVyIGVuZXJneSB3aWxsIGJlIGFwcGxpZWQgc28gdGhhdCBlbmVyZ3kgaXMgY29uc2VydmVkIGluXHJcbiAgICAvLyB0aGlzIGNhc2UgLSBzZWUgcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmstYmFzaWNzIzE2NC4gQWxzbyBzZWUgdGhlIGdldHRlcnMvc2V0dGVycyBmb3IgdGhpcyBiZWxvdy5cclxuICAgIHRoaXMuX3Nsb3BlVG9Hcm91bmQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBpZiBzbG9wZVRvR3JvdW5kIGlzIHNldCwgYW5kIHdlIHdpbGwgc2V0IHNsb3BlVG9Hcm91bmQgdG8gZmFsc2UgaWYgdGhlIFRyYWNrIGlzIGNvbmZpZ3VyYWJsZVxyXG4gICAgLy8gYW5kIGEgY29udHJvbCBwb2ludCBtb3ZlcyBiZWNhdXNlIHRoZSB0cmFjayBwcmVzdW1hYmx5IG5vIGxvbmdlciBzbG9wZXMgdG8gdGhlIGdyb3VuZCBwZXJmZWN0bHkuIEJ1dFxyXG4gICAgLy8gdGhlIHRyYWNrIHNob3VsZCBzbG9wZSB0byBncm91bmQgYWdhaW4gb24gcmVzZXQuXHJcbiAgICB0aGlzLl9yZXN0b3JlU2xvcGVUb0dyb3VuZE9uUmVzZXQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIFVzZSBhbiBhcmJpdHJhcnkgcG9zaXRpb24gZm9yIHRyYW5zbGF0aW5nIHRoZSB0cmFjayBkdXJpbmcgZHJhZ2dpbmcuICBPbmx5IHVzZWQgZm9yIGRlbHRhcyBpbiByZWxhdGl2ZVxyXG4gICAgLy8gcG9zaXRpb25pbmcgYW5kIHRyYW5zbGF0aW9uLCBzbyBhbiBleGFjdCBcInBvc2l0aW9uXCIgaXMgaXJyZWxldmFudCwgc2VlICMyNjBcclxuICAgIHRoaXMuX3Bvc2l0aW9uID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtib29sZWFufSAtIFRydWUgaWYgdGhlIHRyYWNrIGNhbiBiZSBpbnRlcmFjdGVkIHdpdGguICBGb3Igc2NyZWVucyAxLTIgb25seSBvbmUgdHJhY2sgd2lsbCBiZSBwaHlzaWNhbFxyXG4gICAgLy8gKGFuZCBoZW5jZSB2aXNpYmxlKS4gRm9yIHNjcmVlbiAzLCB0cmFja3MgaW4gdGhlIGNvbnRyb2wgcGFuZWwgYXJlIHZpc2libGUgYnV0IG5vbi1waHlzaWNhbCB1bnRpbCBkcmFnZ2VkIHRvXHJcbiAgICAvLyB0aGUgcGxheSBhcmVhXHJcbiAgICB0aGlzLnBoeXNpY2FsUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaHlzaWNhbFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogb3B0aW9ucy5waGV0aW9TdGF0ZSAvLyBQYXJ0aWNpcGF0ZSBpbiBzdGF0ZSBvbmx5IGlmIHBhcmVudCB0cmFjayBpcyB0b29cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSBGbGFnIHRoYXQgc2hvd3Mgd2hldGhlciB0aGUgdHJhY2sgaGFzIGJlZW4gZHJhZ2dlZCBmdWxseSBvdXQgb2YgdGhlIHBhbmVsXHJcbiAgICB0aGlzLmxlZnRUaGVQYW5lbFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVmdFRoZVBhbmVsUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlIC8vIFBhcnRpY2lwYXRlIGluIHN0YXRlIG9ubHkgaWYgcGFyZW50IHRyYWNrIGlzIHRvb1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBLZWVwIHRyYWNrIG9mIHdoZXRoZXIgdGhlIHRyYWNrIGlzIGRyYWdnaW5nLCBzbyBwZXJmb3JtYW5jZSBjYW4gYmUgb3B0aW1pemVkIHdoaWxlIGRyYWdnaW5nIC1cclxuICAgIC8vIG9ubHkgdHJ1ZSB3aGlsZSB0cmFjayBpcyBpbiB0aGUgUGxheSBBcmVhIChwaHlzaWNhbClcclxuICAgIHRoaXMuZHJhZ2dpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWdnaW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlIC8vIFBhcnRpY2lwYXRlIGluIHN0YXRlIG9ubHkgaWYgcGFyZW50IHRyYWNrIGlzIHRvb1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Jvb2xlYW59IC0gRmxhZyB0byBpbmRpY2F0ZSB3aGV0aGVyIHRoZSB1c2VyIGhhcyBkcmFnZ2VkIHRoZSB0cmFjayBvdXQgb2YgdGhlIHRvb2xib3guICBJZiBkcmFnZ2luZyBmcm9tIHRoZSB0b29sYm94LFxyXG4gICAgLy8gdGhlbiBkcmFnZ2luZyB0cmFuc2xhdGVzIHRoZSBlbnRpcmUgdHJhY2sgaW5zdGVhZCBvZiBqdXN0IGEgcG9pbnQuXHJcbiAgICB0aGlzLmRyb3BwZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Ryb3BwZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IG9wdGlvbnMucGhldGlvU3RhdGUgLy8gUGFydGljaXBhdGUgaW4gc3RhdGUgb25seSBpZiBwYXJlbnQgdHJhY2sgaXMgdG9vXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdHJhY2tDaGFuZ2VkTGlzdGVuZXIgPSAoKSA9PiB7IG1vZGVsLnRyYWNrQ2hhbmdlZEVtaXR0ZXIuZW1pdCgpOyB9O1xyXG4gICAgdGhpcy5waHlzaWNhbFByb3BlcnR5LmxpbmsoIHRyYWNrQ2hhbmdlZExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5jb250cm9sUG9pbnRzID0gY29udHJvbFBvaW50cztcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29udHJvbFBvaW50cywgJ2NvbnRyb2wgcG9pbnRzIHNob3VsZCBiZSBkZWZpbmVkJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSBib29sZWFuIHZhbHVlIHRoYXQgaXMgdHJ1ZSBpZiBhbnkgY29udHJvbCBwb2ludCBvbiB0aGlzIHRyYWNrIGlzIGJlaW5nIGRyYWdnZWRcclxuICAgIHRoaXMuY29udHJvbFBvaW50RHJhZ2dpbmdQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIF8ubWFwKCBjb250cm9sUG9pbnRzLCBwb2ludCA9PiBwb2ludC5kcmFnZ2luZ1Byb3BlcnR5ICksICggLi4uYXJncyApID0+IHtcclxuICAgICAgcmV0dXJuIF8ucmVkdWNlKCBhcmdzLCAoIGNvbGxhcHNlZCwgdmFsdWUgKSA9PiBjb2xsYXBzZWQgfHwgdmFsdWUgKTtcclxuICAgIH0sIHtcclxuICAgICAgdmFsdWVUeXBlOiAnYm9vbGVhbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtGYXN0QXJyYXkuPG51bWJlcj59XHJcbiAgICB0aGlzLnBhcmFtZXRyaWNQb3NpdGlvbiA9IG5ldyBGYXN0QXJyYXkoIHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGggKTtcclxuICAgIHRoaXMueCA9IG5ldyBGYXN0QXJyYXkoIHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGggKTtcclxuICAgIHRoaXMueSA9IG5ldyBGYXN0QXJyYXkoIHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGggKTtcclxuXHJcbiAgICAvLyBTYW1wbGluZyBwb2ludHMsIHdoaWNoIHdpbGwgYmUgaW5pdGlhbGl6ZWQgYW5kIHVwZGF0ZWQgaW4gdXBkYXRlTGluU3BhY2UuICBUaGVzZSBwb2ludHMgYXJlIGV2ZW5seSBzcGFjZWRcclxuICAgIC8vIGluIHRoZSB0cmFjayBwYXJhbWV0cmljIGNvb3JkaW5hdGVzIGZyb20ganVzdCBiZWZvcmUgdGhlIHRyYWNrIHBhcmFtZXRlciBzcGFjZSB0byBqdXN0IGFmdGVyLiBTZWUgdXBkYXRlTGluU3BhY2VcclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnNlYXJjaExpblNwYWNlID0gbnVsbDtcclxuICAgIHRoaXMuZGlzdGFuY2VCZXR3ZWVuU2FtcGxlUG9pbnRzID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZUxpblNwYWNlKCk7XHJcbiAgICB0aGlzLnVwZGF0ZVNwbGluZXMoKTtcclxuXHJcbiAgICAvLyBzZXQgZmllbGRzIHRoYXQgY29ycmVjdCBlbmVyZ3kgd2hlbiBza2F0ZXIgdHJhbnNpdGlvbnMgZGlyZWN0bHkgdG8gZ3JvdW5kLCBpZiBkZWZpbmVkIG9uIHRoZSB0cmFja1xyXG4gICAgdGhpcy5zZXRTbG9wZVRvR3JvdW5kKCBvcHRpb25zLnNsb3BlVG9Hcm91bmQgKTtcclxuXHJcbiAgICAvLyBJbiB0aGUgc3RhdGUgd3JhcHBlciwgd2hlbiB0aGUgc3RhdGUgY2hhbmdlcywgd2UgbXVzdCB1cGRhdGUgdGhlIHNrYXRlciBub2RlXHJcbiAgICBjb25zdCBzdGF0ZUxpc3RlbmVyID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZUxpblNwYWNlKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlU3BsaW5lcygpO1xyXG4gICAgICBtb2RlbC50cmFja0NoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgbW9kZWwudXBkYXRlRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9O1xyXG4gICAgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUuc3RhdGVTZXRFbWl0dGVyLmFkZExpc3RlbmVyKCBzdGF0ZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gd2hlbiBhdmFpbGFibGUgYm91bmRzIGNoYW5nZSwgbWFrZSBzdXJlIHRoYXQgY29udHJvbCBwb2ludHMgYXJlIHdpdGhpbiAtIG11c3QgYmUgZGlzcG9zZWRcclxuICAgIGNvbnN0IGJvdW5kc0xpc3RlbmVyID0gYm91bmRzID0+IHtcclxuICAgICAgaWYgKCB0aGlzLmRyb3BwZWRQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICB0aGlzLmNvbnRhaW5Db250cm9sUG9pbnRzSW5BdmFpbGFibGVCb3VuZHMoIGJvdW5kcyApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5tb2RlbC5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kc0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtYWtlIHRoZSBUcmFjayBlbGlnaWJsZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uXHJcbiAgICB0aGlzLmRpc3Bvc2VUcmFjayA9ICgpID0+IHtcclxuICAgICAgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUucGhldGlvU3RhdGVFbmdpbmUuc3RhdGVTZXRFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBzdGF0ZUxpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMucGFyZW50cy5sZW5ndGggPSAwO1xyXG4gICAgICB0aGlzLnBoeXNpY2FsUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmxlZnRUaGVQYW5lbFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5kcmFnZ2luZ1Byb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5kcm9wcGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgICB0aGlzLmNvbnRyb2xQb2ludERyYWdnaW5nUHJvcGVydHkuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgdGhpcy5tb2RlbC5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LnVubGluayggYm91bmRzTGlzdGVuZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIChwaGV0LWlvKVxyXG4gIHRvU3RhdGVPYmplY3QoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBjb250cm9sUG9pbnRzOiB0aGlzLmNvbnRyb2xQb2ludHMubWFwKCBDb250cm9sUG9pbnRSZWZlcmVuY2VJTy50b1N0YXRlT2JqZWN0ICksXHJcbiAgICAgIHBhcmVudHM6IHRoaXMucGFyZW50cy5tYXAoIFRyYWNrLlRyYWNrSU8udG9TdGF0ZU9iamVjdCApLFxyXG4gICAgICBkcmFnZ2FibGU6IHRoaXMuZHJhZ2dhYmxlLFxyXG4gICAgICBjb25maWd1cmFibGU6IHRoaXMuY29uZmlndXJhYmxlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBwb2ludHMgY2hhbmdlLCB1cGRhdGUgdGhlIHNwbGluZSBpbnN0YW5jZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlU3BsaW5lcygpIHtcclxuXHJcbiAgICAvLyBBcnJheXMgYXJlIGZpeGVkIGxlbmd0aCwgc28ganVzdCBvdmVyd3JpdGUgdmFsdWVzLCBzZWUgIzM4XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMucGFyYW1ldHJpY1Bvc2l0aW9uWyBpIF0gPSBpIC8gdGhpcy5jb250cm9sUG9pbnRzLmxlbmd0aDtcclxuICAgICAgdGhpcy54WyBpIF0gPSB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICAgIHRoaXMueVsgaSBdID0gdGhpcy5jb250cm9sUG9pbnRzWyBpIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMueFNwbGluZSA9IG51bWVyaWMuc3BsaW5lKCB0aGlzLnBhcmFtZXRyaWNQb3NpdGlvbiwgdGhpcy54ICk7XHJcbiAgICB0aGlzLnlTcGxpbmUgPSBudW1lcmljLnNwbGluZSggdGhpcy5wYXJhbWV0cmljUG9zaXRpb24sIHRoaXMueSApO1xyXG5cclxuICAgIC8vIE1hcmsgc2VhcmNoIHBvaW50cyBhcyBkaXJ0eVxyXG4gICAgdGhpcy54U2VhcmNoUG9pbnRzID0gbnVsbDtcclxuICAgIHRoaXMueVNlYXJjaFBvaW50cyA9IG51bGw7XHJcblxyXG4gICAgLy8gTWFyayBkZXJpdmF0aXZlcyBhcyBkaXJ0eVxyXG4gICAgdGhpcy54U3BsaW5lRGlmZiA9IG51bGw7XHJcbiAgICB0aGlzLnlTcGxpbmVEaWZmID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnhTcGxpbmVEaWZmRGlmZiA9IG51bGw7XHJcbiAgICB0aGlzLnlTcGxpbmVEaWZmRGlmZiA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgdHJhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5waHlzaWNhbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmxlZnRUaGVQYW5lbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmRyYWdnaW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZHJvcHBlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gaWYgdHJhY2sgaXMgY29uZmlndXJhYmxlLCBcInNsb3BlIHRvIGdyb3VuZFwiIGVuZXJneSBjb3JyZWN0aW9ucyBhcmUgZGlzYWJsZWQgd2hlbiBjb250cm9sIHBvaW50cyBtb3ZlIC0gb24gcmVzZXRcclxuICAgIC8vIHJlYXBwbHkgdGhvc2UgY29ycmVjdGlvbnNcclxuICAgIGlmICggdGhpcy5fcmVzdG9yZVNsb3BlVG9Hcm91bmRPblJlc2V0ICkge1xyXG4gICAgICB0aGlzLnNsb3BlVG9Hcm91bmQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJyb2FkY2FzdCBtZXNzYWdlIHNvIHRoYXQgVHJhY2tOb2RlIGNhbiB1cGRhdGUgdGhlIHNoYXBlXHJcbiAgICB0aGlzLnVwZGF0ZVNwbGluZXMoKTtcclxuICAgIHRoaXMucmVzZXRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNsb3Nlc3QgcG9pbnQgKEV1Y2xpZGVhbikgYW5kIHBvc2l0aW9uIChwYXJhbWV0cmljKSBvbiB0aGUgdHJhY2ssIGFzIGFuIG9iamVjdCB3aXRoIHt1LHBvaW50fVxyXG4gICAqIGFsc28gY2hlY2tzIDFFLTYgYmV5b25kIGVhY2ggc2lkZSBvZiB0aGUgdHJhY2sgdG8gc2VlIGlmIHRoZSBza2F0ZXIgaXMgYmV5b25kIHRoZSBlZGdlIG9mIHRoZSB0cmFja1xyXG4gICAqIFRoaXMgY3VycmVudGx5IGRvZXMgYSBmbGF0IHNlYXJjaCwgYnV0IGlmIG1vcmUgcHJlY2lzaW9uIGlzIG5lZWRlZCwgYSBmaW5lci1ncmFpbmVkIGJpbmFyeSBzZWFyY2ggY291bGQgYmUgZG9uZVxyXG4gICAqIGFmdGVyd2FyZHMuIFRoaXMgY29kZSBpcyB1c2VkIHdoZW4gZHJhZ2dpbmcgdGhlIHNrYXRlciAodG8gc2VlIGlmIGhlIGlzIGRyYWdnZWQgbmVhciB0aGUgdHJhY2spIGFuZCB3aGlsZSB0aGVcclxuICAgKiBza2F0ZXIgaXMgZmFsbGluZyB0b3dhcmQgdGhlIHRyYWNrICh0byBzZWUgaWYgaGUgc2hvdWxkIGJvdW5jZS9hdHRhY2gpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9pbnRcclxuICAgKiBAcmV0dXJucyB7e3BhcmFtZXRyaWNQb3NpdGlvbjogbnVtYmVyLCBwb2ludDogVmVjdG9yMiwgZGlzdGFuY2U6IE51bWJlcn19XHJcbiAgICovXHJcbiAgZ2V0Q2xvc2VzdFBvc2l0aW9uQW5kUGFyYW1ldGVyKCBwb2ludCApIHtcclxuXHJcbiAgICAvLyBDb21wdXRlIHRoZSBzcGxpbmUgcG9pbnRzIGZvciBwdXJwb3NlcyBvZiBnZXR0aW5nIGNsb3Nlc3QgcG9pbnRzLlxyXG4gICAgLy8ga2VlcCB0aGVzZSBwb2ludHMgYXJvdW5kIGFuZCBpbnZhbGlkYXRlIG9ubHkgd2hlbiBuZWNlc3NhcnlcclxuICAgIGlmICggIXRoaXMueFNlYXJjaFBvaW50cyApIHtcclxuICAgICAgdGhpcy54U2VhcmNoUG9pbnRzID0gU3BsaW5lRXZhbHVhdGlvbi5hdEFycmF5KCB0aGlzLnhTcGxpbmUsIHRoaXMuc2VhcmNoTGluU3BhY2UgKTtcclxuICAgICAgdGhpcy55U2VhcmNoUG9pbnRzID0gU3BsaW5lRXZhbHVhdGlvbi5hdEFycmF5KCB0aGlzLnlTcGxpbmUsIHRoaXMuc2VhcmNoTGluU3BhY2UgKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgYmVzdFUgPSAwO1xyXG4gICAgbGV0IGJlc3REaXN0YW5jZVNxdWFyZWQgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBjb25zdCBiZXN0UG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy54U2VhcmNoUG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBkaXN0YW5jZVNxdWFyZWQgPSBwb2ludC5kaXN0YW5jZVNxdWFyZWRYWSggdGhpcy54U2VhcmNoUG9pbnRzWyBpIF0sIHRoaXMueVNlYXJjaFBvaW50c1sgaSBdICk7XHJcbiAgICAgIGlmICggZGlzdGFuY2VTcXVhcmVkIDwgYmVzdERpc3RhbmNlU3F1YXJlZCApIHtcclxuICAgICAgICBiZXN0RGlzdGFuY2VTcXVhcmVkID0gZGlzdGFuY2VTcXVhcmVkO1xyXG4gICAgICAgIGJlc3RVID0gdGhpcy5zZWFyY2hMaW5TcGFjZVsgaSBdO1xyXG4gICAgICAgIGJlc3RQb2ludC54ID0gdGhpcy54U2VhcmNoUG9pbnRzWyBpIF07XHJcbiAgICAgICAgYmVzdFBvaW50LnkgPSB0aGlzLnlTZWFyY2hQb2ludHNbIGkgXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJpbmFyeSBzZWFyY2ggaW4gdGhlIG5laWdoYm9yaG9vZCBvZiB0aGUgYmVzdCBwb2ludCwgdG8gcmVmaW5lIHRoZSBzZWFyY2hcclxuICAgIGNvbnN0IGRpc3RhbmNlQmV0d2VlblNlYXJjaFBvaW50cyA9IE1hdGguYWJzKCB0aGlzLnNlYXJjaExpblNwYWNlWyAxIF0gLSB0aGlzLnNlYXJjaExpblNwYWNlWyAwIF0gKTtcclxuICAgIGxldCB0b3BVID0gYmVzdFUgKyBkaXN0YW5jZUJldHdlZW5TZWFyY2hQb2ludHMgLyAyO1xyXG4gICAgbGV0IGJvdHRvbVUgPSBiZXN0VSAtIGRpc3RhbmNlQmV0d2VlblNlYXJjaFBvaW50cyAvIDI7XHJcblxyXG4gICAgbGV0IHRvcFggPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmUsIHRvcFUgKTtcclxuICAgIGxldCB0b3BZID0gU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lLCB0b3BVICk7XHJcblxyXG4gICAgbGV0IGJvdHRvbVggPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmUsIGJvdHRvbVUgKTtcclxuICAgIGxldCBib3R0b21ZID0gU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lLCBib3R0b21VICk7XHJcblxyXG4gICAgLy8gRXZlbiBhdCA0MDAgYmluYXJ5IHNlYXJjaCBpdGVyYXRpb25zLCBwZXJmb3JtYW5jZSBpcyBzbW9vdGggb24gaVBhZDMsIHNvIHRoaXMgbG9vcCBkb2Vzbid0IHNlZW0gdG9vIGludmFzaXZlXHJcbiAgICBjb25zdCBtYXhCaW5hcnlTZWFyY2hJdGVyYXRpb25zID0gNDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtYXhCaW5hcnlTZWFyY2hJdGVyYXRpb25zOyBpKysgKSB7XHJcblxyXG4gICAgICBjb25zdCB0b3BEaXN0YW5jZVNxdWFyZWQgPSBwb2ludC5kaXN0YW5jZVNxdWFyZWRYWSggdG9wWCwgdG9wWSApO1xyXG4gICAgICBjb25zdCBib3R0b21EaXN0YW5jZVNxdWFyZWQgPSBwb2ludC5kaXN0YW5jZVNxdWFyZWRYWSggYm90dG9tWCwgYm90dG9tWSApO1xyXG5cclxuICAgICAgaWYgKCB0b3BEaXN0YW5jZVNxdWFyZWQgPCBib3R0b21EaXN0YW5jZVNxdWFyZWQgKSB7XHJcbiAgICAgICAgYm90dG9tVSA9IGJvdHRvbVUgKyAoIHRvcFUgLSBib3R0b21VICkgLyA0OyAgLy8gbW92ZSBoYWxmd2F5IHVwXHJcbiAgICAgICAgYm90dG9tWCA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueFNwbGluZSwgYm90dG9tVSApO1xyXG4gICAgICAgIGJvdHRvbVkgPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnlTcGxpbmUsIGJvdHRvbVUgKTtcclxuICAgICAgICBiZXN0RGlzdGFuY2VTcXVhcmVkID0gdG9wRGlzdGFuY2VTcXVhcmVkO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRvcFUgPSB0b3BVIC0gKCB0b3BVIC0gYm90dG9tVSApIC8gNDsgIC8vIG1vdmUgaGFsZndheSBkb3duXHJcbiAgICAgICAgdG9wWCA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueFNwbGluZSwgdG9wVSApO1xyXG4gICAgICAgIHRvcFkgPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnlTcGxpbmUsIHRvcFUgKTtcclxuICAgICAgICBiZXN0RGlzdGFuY2VTcXVhcmVkID0gYm90dG9tRGlzdGFuY2VTcXVhcmVkO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBiZXN0VSA9ICggdG9wVSArIGJvdHRvbVUgKSAvIDI7XHJcbiAgICBiZXN0UG9pbnQueCA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueFNwbGluZSwgYmVzdFUgKTtcclxuICAgIGJlc3RQb2ludC55ID0gU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lLCBiZXN0VSApO1xyXG5cclxuICAgIHJldHVybiB7IHBhcmFtZXRyaWNQb3NpdGlvbjogYmVzdFUsIHBvaW50OiBiZXN0UG9pbnQsIGRpc3RhbmNlOiBiZXN0RGlzdGFuY2VTcXVhcmVkIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgeCBwb3NpdGlvbiBhdCB0aGUgcGFyYW1ldHJpYyBwb3NpdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRYKCBwYXJhbWV0cmljUG9zaXRpb24gKSB7IHJldHVybiBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmUsIHBhcmFtZXRyaWNQb3NpdGlvbiApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB5IHBvc2l0aW9uIGF0IHRoZSBwYXJhbWV0cmljIHBvc2l0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbWV0cmljUG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFkoIHBhcmFtZXRyaWNQb3NpdGlvbiApIHsgcmV0dXJuIFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueVNwbGluZSwgcGFyYW1ldHJpY1Bvc2l0aW9uICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBtb2RlbCBwb3NpdGlvbiBhdCB0aGUgcGFyYW1ldHJpYyBwb3NpdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICovXHJcbiAgZ2V0UG9pbnQoIHBhcmFtZXRyaWNQb3NpdGlvbiApIHtcclxuICAgIGNvbnN0IHggPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmUsIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgeSA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueVNwbGluZSwgcGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIHgsIHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyYW5zbGF0ZSB0aGUgdHJhY2sgYnkgbW92aW5nIGFsbCBjb250cm9sIHBvaW50cyBieSBkeCBhbmQgZHkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkeFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkeVxyXG4gICAqL1xyXG4gIHRyYW5zbGF0ZSggZHgsIGR5ICkge1xyXG4gICAgdGhpcy5fcG9zaXRpb24gPSB0aGlzLl9wb3NpdGlvbi5wbHVzWFkoIGR4LCBkeSApO1xyXG5cclxuICAgIC8vIG1vdmUgYWxsIHRoZSBjb250cm9sIHBvaW50c1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb250cm9sUG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuY29udHJvbFBvaW50c1sgaSBdO1xyXG4gICAgICBwb2ludC5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9pbnQuc291cmNlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzWFkoIGR4LCBkeSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlU3BsaW5lcygpO1xyXG5cclxuICAgIC8vIEp1c3Qgb2JzZXJ2aW5nIHRoZSBjb250cm9sIHBvaW50cyBpbmRpdmlkdWFsbHkgd291bGQgbGVhZCB0byBOIGV4cGVuc2l2ZSBjYWxsYmFja3MgKGluc3RlYWQgb2YgMSlcclxuICAgIC8vIGZvciBlYWNoIG9mIHRoZSBOIHBvaW50cywgU28gd2UgdXNlIHRoaXMgYnJvYWRjYXN0IG1lY2hhbmlzbSBpbnN0ZWFkXHJcbiAgICB0aGlzLnRyYW5zbGF0ZWRFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB3aGV0aGVyIG9yIG5vdCB0aGlzIFRyYWNrIHNsb3BlcyB0byB0aGUgZ3JvdW5kLCBhbmQgY29ycmVjdHMgZW5lcmd5IG9uIHRoZSB0cmFuc2l0aW9uIGZyb20gdHJhY2sgdG8gZ3JvdW5kLlxyXG4gICAqIElmIHRoZSB0cmFjayBpcyBjb25maWd1cmFibGUsIHdlIGRvIE5PVCB3YW50IHRvIG1haW50YWluIHRoaXMgY29ycmVjdGlvbiB3aGVuIHRoZSBjb250cm9sIHBvaW50cyBtb3ZlLiBCdXQgd2hlblxyXG4gICAqIHRoaXMgdHJhY2sgaXMgcmVzZXQsIHdlIHNob3VsZCByZWFwcGx5IHRoaXMgY29ycmVjdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNsb3BlVG9Hcm91bmRcclxuICAgKi9cclxuICBzZXRTbG9wZVRvR3JvdW5kKCBzbG9wZVRvR3JvdW5kICkge1xyXG4gICAgdGhpcy5fc2xvcGVUb0dyb3VuZCA9IHNsb3BlVG9Hcm91bmQ7XHJcblxyXG4gICAgaWYgKCBzbG9wZVRvR3JvdW5kICkge1xyXG4gICAgICB0aGlzLl9yZXN0b3JlU2xvcGVUb0dyb3VuZE9uUmVzZXQgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSBzbG9wZVRvR3JvdW5kXHJcbiAgICovXHJcbiAgc2V0IHNsb3BlVG9Hcm91bmQoIHNsb3BlVG9Hcm91bmQgKSB7IHRoaXMuc2V0U2xvcGVUb0dyb3VuZCggc2xvcGVUb0dyb3VuZCApOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB3aGV0aGVyIG9yIG5vdCB0aGUgdHJhY2sgXCJzbG9wZXMgdG8gdGhlIGdyb3VuZFwiLCBhbmQgc2thdGVyIGVuZXJneSBzdGF0ZSBzaG91bGQgYXBwbHkgYWRkaXRpb25hbCBjb3JyZWN0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKi9cclxuICBnZXRTbG9wZVRvR3JvdW5kKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Nsb3BlVG9Hcm91bmQ7XHJcbiAgfVxyXG5cclxuICBnZXQgc2xvcGVUb0dyb3VuZCgpIHsgcmV0dXJuIHRoaXMuZ2V0U2xvcGVUb0dyb3VuZCgpOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciBwdXJwb3NlcyBvZiBzaG93aW5nIHRoZSBza2F0ZXIgYW5nbGUsIGdldCB0aGUgdmlldyBhbmdsZSBvZiB0aGUgdHJhY2sgaGVyZS4gTm90ZSB0aGlzIG1lYW5zIGludmVydGluZyB0aGUgeVxyXG4gICAqIHZhbHVlcywgdGhpcyBpcyBjYWxsZWQgZXZlcnkgc3RlcCB3aGlsZSBhbmltYXRpbmcgb24gdGhlIHRyYWNrLCBzbyBpdCB3YXMgb3B0aW1pemVkIHRvIGF2b2lkIG5ldyBhbGxvY2F0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRWaWV3QW5nbGVBdCggcGFyYW1ldHJpY1Bvc2l0aW9uICkge1xyXG4gICAgaWYgKCB0aGlzLnhTcGxpbmVEaWZmID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLnhTcGxpbmVEaWZmID0gdGhpcy54U3BsaW5lLmRpZmYoKTtcclxuICAgICAgdGhpcy55U3BsaW5lRGlmZiA9IHRoaXMueVNwbGluZS5kaWZmKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMiggLVNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueVNwbGluZURpZmYsIHBhcmFtZXRyaWNQb3NpdGlvbiApLCBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmVEaWZmLCBwYXJhbWV0cmljUG9zaXRpb24gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBtb2RlbCBhbmdsZSBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIG9uIHRoZSB0cmFjay5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRNb2RlbEFuZ2xlQXQoIHBhcmFtZXRyaWNQb3NpdGlvbiApIHtcclxuXHJcbiAgICAvLyBsb2FkIHhTcGxpbmVEaWZmLCB5U3BsaW5lRGlmZiBoZXJlIGlmIG5vdCBhbHJlYWR5IGxvYWRlZFxyXG4gICAgaWYgKCB0aGlzLnhTcGxpbmVEaWZmID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLnhTcGxpbmVEaWZmID0gdGhpcy54U3BsaW5lLmRpZmYoKTtcclxuICAgICAgdGhpcy55U3BsaW5lRGlmZiA9IHRoaXMueVNwbGluZS5kaWZmKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gTWF0aC5hdGFuMiggU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lRGlmZiwgcGFyYW1ldHJpY1Bvc2l0aW9uICksIFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueFNwbGluZURpZmYsIHBhcmFtZXRyaWNQb3NpdGlvbiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIG1vZGVsIHVuaXQgdmVjdG9yIGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gb24gdGhlIHRyYWNrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwYXJhbWV0cmljUG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFVuaXROb3JtYWxWZWN0b3IoIHBhcmFtZXRyaWNQb3NpdGlvbiApIHtcclxuXHJcbiAgICAvLyBsb2FkIHhTcGxpbmVEaWZmLCB5U3BsaW5lRGlmZiBoZXJlIGlmIG5vdCBhbHJlYWR5IGxvYWRlZFxyXG4gICAgaWYgKCB0aGlzLnhTcGxpbmVEaWZmID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLnhTcGxpbmVEaWZmID0gdGhpcy54U3BsaW5lLmRpZmYoKTtcclxuICAgICAgdGhpcy55U3BsaW5lRGlmZiA9IHRoaXMueVNwbGluZS5kaWZmKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFZlY3RvcjIoIC1TcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnlTcGxpbmVEaWZmLCBwYXJhbWV0cmljUG9zaXRpb24gKSwgU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy54U3BsaW5lRGlmZiwgcGFyYW1ldHJpY1Bvc2l0aW9uICkgKS5ub3JtYWxpemUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgbW9kZWwgcGFyYWxsZWwgdmVjdG9yIGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gb24gdGhlIHRyYWNrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXJhbWV0cmljUG9zaXRpb25cclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMnxWZWN0b3IzfFZlY3RvcjR9XHJcbiAgICovXHJcbiAgZ2V0VW5pdFBhcmFsbGVsVmVjdG9yKCBwYXJhbWV0cmljUG9zaXRpb24gKSB7XHJcblxyXG4gICAgLy8gbG9hZCB4U3BsaW5lRGlmZiwgeVNwbGluZURpZmYgaGVyZSBpZiBub3QgYWxyZWFkeSBsb2FkZWRcclxuICAgIGlmICggdGhpcy54U3BsaW5lRGlmZiA9PT0gbnVsbCApIHtcclxuICAgICAgdGhpcy54U3BsaW5lRGlmZiA9IHRoaXMueFNwbGluZS5kaWZmKCk7XHJcbiAgICAgIHRoaXMueVNwbGluZURpZmYgPSB0aGlzLnlTcGxpbmUuZGlmZigpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmVEaWZmLCBwYXJhbWV0cmljUG9zaXRpb24gKSwgU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lRGlmZiwgcGFyYW1ldHJpY1Bvc2l0aW9uICkgKS5ub3JtYWxpemUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgbGluc3BhY2UsIHRoZSBldmVubHkgc3BhY2VkIHZlY3RvcnMgYmV0d2VlbiB0aGUgbnVtYmVyIG9mIGNvbnRyb2wgcG9pbnRzIGluIHRoZSB0cmFjay5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUxpblNwYWNlKCkge1xyXG4gICAgdGhpcy5taW5Qb2ludCA9IDA7XHJcbiAgICB0aGlzLm1heFBvaW50ID0gKCB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoIC0gMSApIC8gdGhpcy5jb250cm9sUG9pbnRzLmxlbmd0aDtcclxuICAgIGNvbnN0IHByZVBvaW50ID0gdGhpcy5taW5Qb2ludCAtIDFFLTY7XHJcbiAgICBjb25zdCBwb3N0UG9pbnQgPSB0aGlzLm1heFBvaW50ICsgMUUtNjtcclxuXHJcbiAgICAvLyBTdG9yZSBmb3IgcGVyZm9ybWFuY2VcclxuICAgIC8vIG1hZGUgbnVtYmVyIG9mIHNhbXBsZSBwb2ludHMgZGVwZW5kIG9uIHRoZSBsZW5ndGggb2YgdGhlIHRyYWNrLCB0byBtYWtlIGl0IHNtb290aCBlbm91Z2ggbm8gbWF0dGVyIGhvdyBsb25nIGl0IGlzXHJcbiAgICBjb25zdCBuID0gMjAgKiAoIHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGggLSAxICk7XHJcbiAgICB0aGlzLnNlYXJjaExpblNwYWNlID0gbnVtZXJpYy5saW5zcGFjZSggcHJlUG9pbnQsIHBvc3RQb2ludCwgbiApO1xyXG4gICAgdGhpcy5kaXN0YW5jZUJldHdlZW5TYW1wbGVQb2ludHMgPSAoIHBvc3RQb2ludCAtIHByZVBvaW50ICkgLyBuO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZWN0IHdoZXRoZXIgYSBwYXJhbWV0cmljIHBvaW50IGlzIGluIGJvdW5kcyBvZiB0aGlzIHRyYWNrLCBmb3IgcHVycG9zZXMgb2YgdGVsbGluZyB3aGV0aGVyIHRoZSBza2F0ZXIgZmVsbFxyXG4gICAqIHBhc3QgdGhlIGVkZ2Ugb2YgdGhlIHRyYWNrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcGFyYW1ldHJpY1Bvc2l0aW9uXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgaXNQYXJhbWV0ZXJJbkJvdW5kcyggcGFyYW1ldHJpY1Bvc2l0aW9uICkge1xyXG4gICAgcmV0dXJuIHBhcmFtZXRyaWNQb3NpdGlvbiA+PSB0aGlzLm1pblBvaW50ICYmIHBhcmFtZXRyaWNQb3NpdGlvbiA8PSB0aGlzLm1heFBvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJhY2sgaW5mb3JtYXRpb24gYXMgYSBzdHJpbmcgZm9yIGRlYnVnZ2luZyBwdXJwb3Nlcy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgbGV0IHN0cmluZyA9ICcnO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb250cm9sUG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwb2ludCA9IHRoaXMuY29udHJvbFBvaW50c1sgaSBdO1xyXG4gICAgICBzdHJpbmcgPSBgJHtzdHJpbmd9KCR7cG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54fSwke3BvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueX0pYDtcclxuICAgIH1cclxuICAgIHJldHVybiBzdHJpbmc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHNuYXAgdGFyZ2V0IGZvciBhIGNvbnRyb2wgcG9pbnQsIGlmIG9uZSBpcyBzcGVjaWZpZWQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bGx8Q29udHJvbFBvaW50fVxyXG4gICAqL1xyXG4gIGdldFNuYXBUYXJnZXQoKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG8gPSB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXTtcclxuICAgICAgaWYgKCBvLnNuYXBUYXJnZXRQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICByZXR1cm4gby5zbmFwVGFyZ2V0UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB5IHBvc2l0aW9uIGluIG1ldGVycyBvZiB0aGUgYm90dG9tIG1vc3QgY29udHJvbCBwb2ludC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEJvdHRvbUNvbnRyb2xQb2ludFkoKSB7XHJcbiAgICBsZXQgYmVzdCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPCBiZXN0ICkge1xyXG4gICAgICAgIGJlc3QgPSB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBiZXN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB5IHBvc2l0aW9uIGluIG1ldGVycyBvZiB0aGUgdG9wIG1vc3QgY29udHJvbCBwb2ludC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFRvcENvbnRyb2xQb2ludFkoKSB7XHJcbiAgICBsZXQgYmVzdCA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnkgPiBiZXN0ICkge1xyXG4gICAgICAgIGJlc3QgPSB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBiZXN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB4IHBvc2l0aW9uIG9mIHRoZSBsZWZ0IG1vc3QgY29udHJvbCBwb2ludCwgaW4gbWV0ZXJzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0TGVmdENvbnRyb2xQb2ludFgoKSB7XHJcbiAgICBsZXQgYmVzdCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLnggPCBiZXN0ICkge1xyXG4gICAgICAgIGJlc3QgPSB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBiZXN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB4IHBvc2l0aW9uIG9mIHRoZSByaWdodCBtb3N0IGNvbnRyb2wgcG9pbnQsIGluIG1ldGVycy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldFJpZ2h0Q29udHJvbFBvaW50WCgpIHtcclxuICAgIGxldCBiZXN0ID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xyXG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5jb250cm9sUG9pbnRzLmxlbmd0aDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueCA+IGJlc3QgKSB7XHJcbiAgICAgICAgYmVzdCA9IHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGJlc3Q7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyB0cmFjayBjb250YWlucyB0aGUgcHJvdmlkZWQgY29udHJvbCBwb2ludC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NvbnRyb2xQb2ludH0gY29udHJvbFBvaW50XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICovXHJcbiAgY29udGFpbnNDb250cm9sUG9pbnQoIGNvbnRyb2xQb2ludCApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXSA9PT0gY29udHJvbFBvaW50ICkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IHdoaWNoIGNvbnRhaW5zIGFsbCBvZiB0aGUgVHJhY2tzIHRoYXQgd291bGQgbmVlZCB0byBiZSByZXNldCBpZiB0aGlzIFRyYWNrIHdhcyByZXNldC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7VHJhY2tbXX1cclxuICAgKi9cclxuICBnZXRQYXJlbnRzT3JTZWxmKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50cy5sZW5ndGggPiAwID8gdGhpcy5wYXJlbnRzIDogWyB0aGlzIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gdGhpcyB0cmFjayB0byBpdHMgY29udHJvbCBwYW5lbCBieSByZXNldHRpbmcgaXQgdG8gaXRzIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJldHVyblRvQ29udHJvbFBhbmVsKCkge1xyXG4gICAgaWYgKCB0aGlzLnBhcmVudHMubGVuZ3RoID4gMCApIHtcclxuICAgICAgdGhpcy5tb2RlbC5yZW1vdmVBbmREaXNwb3NlVHJhY2soIHRoaXMgKTtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMucGFyZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudHNbIGkgXTtcclxuICAgICAgICBwYXJlbnQucmVzZXQoKTtcclxuICAgICAgICB0aGlzLm1vZGVsLnRyYWNrcy5hZGQoIHBhcmVudCApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgYXJjIGxlbmd0aCAoaW4gbWV0ZXJzKSBiZXR3ZWVuIHR3byBwb2ludHMgb24gYSBwYXJhbWV0cmljIGN1cnZlLlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gaXMgYXQgdGhlIGhlYXJ0IG9mIG1hbnkgbmVzdGVkIGxvb3BzLCBzbyBpdCBtdXN0IGJlIGhlYXZpbHkgb3B0aW1pemVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHUwXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHUxXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRBcmNMZW5ndGgoIHUwLCB1MSApIHtcclxuICAgIGlmICggdTEgPT09IHUwICkge1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmICggdTEgPCB1MCApIHtcclxuICAgICAgcmV0dXJuIC10aGlzLmdldEFyY0xlbmd0aCggdTEsIHUwICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGlzY3JlcGFuY3kgd2l0aCBvcmlnaW5hbCB2ZXJzaW9uOiBvcmlnaW5hbCB2ZXJzaW9uIGhhZCAxMCBzdWJkaXZpc2lvbnMgaGVyZS4gIFdlIGhhdmUgcmVkdWNlZCBpdCB0byBpbXByb3ZlXHJcbiAgICAvLyBwZXJmb3JtYW5jZSBhdCB0aGUgY29zdCBvZiBudW1lcmljYWwgcHJlY2lzaW9uXHJcbiAgICBjb25zdCBudW1TZWdtZW50cyA9IDQ7XHJcbiAgICBjb25zdCBkYSA9ICggdTEgLSB1MCApIC8gKCBudW1TZWdtZW50cyAtIDEgKTtcclxuICAgIGxldCBwcmV2WCA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueFNwbGluZSwgdTAgKTtcclxuICAgIGxldCBwcmV2WSA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueVNwbGluZSwgdTAgKTtcclxuICAgIGxldCBzdW0gPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgbnVtU2VnbWVudHM7IGkrKyApIHtcclxuICAgICAgY29uc3QgYSA9IHUwICsgaSAqIGRhO1xyXG4gICAgICBjb25zdCBwdFggPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmUsIGEgKTtcclxuICAgICAgY29uc3QgcHRZID0gU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lLCBhICk7XHJcblxyXG4gICAgICBjb25zdCBkeCA9IHByZXZYIC0gcHRYO1xyXG4gICAgICBjb25zdCBkeSA9IHByZXZZIC0gcHRZO1xyXG5cclxuICAgICAgc3VtICs9IE1hdGguc3FydCggZHggKiBkeCArIGR5ICogZHkgKTtcclxuICAgICAgcHJldlggPSBwdFg7XHJcbiAgICAgIHByZXZZID0gcHRZO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgdGhlIHBhcmFtZXRyaWMgZGlzdGFuY2UgYWxvbmcgdGhlIHRyYWNrLCBzdGFydGluZyBhdCB1MCBhbmQgbW92aW5nIGRzIG1ldGVyc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB1MCB0aGUgc3RhcnRpbmcgcG9pbnQgYWxvbmcgdGhlIHRyYWNrIGluIHBhcmFtZXRyaWMgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHMgbWV0ZXJzIHRvIHRyYXZlcnNlIGFsb25nIHRoZSB0cmFja1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICovXHJcbiAgZ2V0UGFyYW1ldHJpY0Rpc3RhbmNlKCB1MCwgZHMgKSB7XHJcbiAgICBsZXQgbG93ZXJCb3VuZCA9IC0xO1xyXG4gICAgbGV0IHVwcGVyQm91bmQgPSAyO1xyXG5cclxuICAgIGxldCBndWVzcyA9ICggdXBwZXJCb3VuZCArIGxvd2VyQm91bmQgKSAvIDIuMDtcclxuXHJcbiAgICBsZXQgbWV0cmljRGVsdGEgPSB0aGlzLmdldEFyY0xlbmd0aCggdTAsIGd1ZXNzICk7XHJcbiAgICBjb25zdCBlcHNpbG9uID0gMUUtODsgLy8gT1JJR0lOQUwgRU5FUkdZIFNLQVRFIFBBUksgQkFTSUNTIEhBRCBWQUxVRSAxRS04XHJcblxyXG4gICAgbGV0IGNvdW50ID0gMDtcclxuICAgIHdoaWxlICggTWF0aC5hYnMoIG1ldHJpY0RlbHRhIC0gZHMgKSA+IGVwc2lsb24gKSB7XHJcbiAgICAgIGlmICggbWV0cmljRGVsdGEgPiBkcyApIHtcclxuICAgICAgICB1cHBlckJvdW5kID0gZ3Vlc3M7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbG93ZXJCb3VuZCA9IGd1ZXNzO1xyXG4gICAgICB9XHJcbiAgICAgIGd1ZXNzID0gKCB1cHBlckJvdW5kICsgbG93ZXJCb3VuZCApIC8gMi4wO1xyXG4gICAgICBtZXRyaWNEZWx0YSA9IHRoaXMuZ2V0QXJjTGVuZ3RoKCB1MCwgZ3Vlc3MgKTtcclxuICAgICAgY291bnQrKztcclxuICAgICAgaWYgKCBjb3VudCA+IDEwMCApIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3VudCA8PSAxMDAsICdiaW5hcnkgc2VhcmNoIGZhaWxlZCcgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGd1ZXNzIC0gdTA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlIHRoZSBzaWduZWQgY3VydmF0dXJlIGFzIGRlZmluZWQgaGVyZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DdXJ2YXR1cmUjTG9jYWxfZXhwcmVzc2lvbnNcclxuICAgKiBVc2VkIGZvciBjZW50cmlwZXRhbCBmb3JjZSBhbmQgZGV0ZXJtaW5pbmcgd2hldGhlciB0aGUgc2thdGVyIGZsaWVzIG9mZiB0aGUgdHJhY2tcclxuICAgKiBDdXJ2YXR1cmUgcGFyYW1ldGVyIGlzIGZvciBzdG9yaW5nIHRoZSByZXN1bHQgYXMgcGFzcy1ieS1yZWZlcmVuY2UuXHJcbiAgICogUGxlYXNlIHNlZSAjNTAgcmVnYXJkaW5nIEdDXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBhcmFtZXRyaWNQb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjdXJ2YXR1cmUgLSBvYmplY3QgbGl0ZXJhbCB3aXRoIHsgcjoge251bWJlcn0sIHg6IHtudW1iZXJ9LCB5OiB7bnVtYmVyfSB9XHJcbiAgICovXHJcbiAgZ2V0Q3VydmF0dXJlKCBwYXJhbWV0cmljUG9zaXRpb24sIGN1cnZhdHVyZSApIHtcclxuXHJcbiAgICBpZiAoIHRoaXMueFNwbGluZURpZmYgPT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMueFNwbGluZURpZmYgPSB0aGlzLnhTcGxpbmUuZGlmZigpO1xyXG4gICAgICB0aGlzLnlTcGxpbmVEaWZmID0gdGhpcy55U3BsaW5lLmRpZmYoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMueFNwbGluZURpZmZEaWZmID09PSBudWxsICkge1xyXG4gICAgICB0aGlzLnhTcGxpbmVEaWZmRGlmZiA9IHRoaXMueFNwbGluZURpZmYuZGlmZigpO1xyXG4gICAgICB0aGlzLnlTcGxpbmVEaWZmRGlmZiA9IHRoaXMueVNwbGluZURpZmYuZGlmZigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHhQID0gU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy54U3BsaW5lRGlmZiwgcGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICBjb25zdCB4UFAgPSBTcGxpbmVFdmFsdWF0aW9uLmF0TnVtYmVyKCB0aGlzLnhTcGxpbmVEaWZmRGlmZiwgcGFyYW1ldHJpY1Bvc2l0aW9uICk7XHJcbiAgICBjb25zdCB5UCA9IFNwbGluZUV2YWx1YXRpb24uYXROdW1iZXIoIHRoaXMueVNwbGluZURpZmYsIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgeVBQID0gU3BsaW5lRXZhbHVhdGlvbi5hdE51bWJlciggdGhpcy55U3BsaW5lRGlmZkRpZmYsIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG5cclxuICAgIGNvbnN0IGsgPSAoIHhQICogeVBQIC0geVAgKiB4UFAgKSAvXHJcbiAgICAgICAgICAgICAgTWF0aC5wb3coICggeFAgKiB4UCArIHlQICogeVAgKSwgMyAvIDIgKTtcclxuXHJcbiAgICAvLyBVc2luZyBjb21wb25lbnQtd2lzZSBtYXRoIHRvIGF2b2lkIGFsbG9jYXRpb25zLCBzZWUgIzUwXHJcbiAgICBjb25zdCBjZW50ZXJYID0gdGhpcy5nZXRYKCBwYXJhbWV0cmljUG9zaXRpb24gKTtcclxuICAgIGNvbnN0IGNlbnRlclkgPSB0aGlzLmdldFkoIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG5cclxuICAgIGNvbnN0IHVuaXROb3JtYWxWZWN0b3IgPSB0aGlzLmdldFVuaXROb3JtYWxWZWN0b3IoIHBhcmFtZXRyaWNQb3NpdGlvbiApO1xyXG4gICAgY29uc3QgdmVjdG9yWCA9IHVuaXROb3JtYWxWZWN0b3IueCAvIGsgKyBjZW50ZXJYO1xyXG4gICAgY29uc3QgdmVjdG9yWSA9IHVuaXROb3JtYWxWZWN0b3IueSAvIGsgKyBjZW50ZXJZO1xyXG5cclxuICAgIGN1cnZhdHVyZS5yID0gMSAvIGs7XHJcbiAgICBjdXJ2YXR1cmUueCA9IHZlY3Rvclg7XHJcbiAgICBjdXJ2YXR1cmUueSA9IHZlY3Rvclk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaW5kIHRoZSBsb3dlc3QgeS1wb2ludCBvbiB0aGUgc3BsaW5lIGJ5IHNhbXBsaW5nLCB1c2VkIHdoZW4gZHJvcHBpbmcgdGhlIHRyYWNrIG9yIGEgY29udHJvbCBwb2ludCB0byBlbnN1cmVcclxuICAgKiBpdCB3b24ndCBnbyBiZWxvdyB5PTAuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRMb3dlc3RZKCkge1xyXG4gICAgaWYgKCAhdGhpcy54U2VhcmNoUG9pbnRzICkge1xyXG4gICAgICB0aGlzLnhTZWFyY2hQb2ludHMgPSBTcGxpbmVFdmFsdWF0aW9uLmF0QXJyYXkoIHRoaXMueFNwbGluZSwgdGhpcy5zZWFyY2hMaW5TcGFjZSApO1xyXG4gICAgICB0aGlzLnlTZWFyY2hQb2ludHMgPSBTcGxpbmVFdmFsdWF0aW9uLmF0QXJyYXkoIHRoaXMueVNwbGluZSwgdGhpcy5zZWFyY2hMaW5TcGFjZSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBtaW4gPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XHJcbiAgICBsZXQgbWluSW5kZXggPSAtMTtcclxuICAgIGxldCB5O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy55U2VhcmNoUG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB5ID0gdGhpcy55U2VhcmNoUG9pbnRzWyBpIF07XHJcbiAgICAgIGlmICggeSA8IG1pbiApIHtcclxuICAgICAgICBtaW4gPSB5O1xyXG4gICAgICAgIG1pbkluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEluY3JlYXNlIHJlc29sdXRpb24gaW4gdGhlIG5laWdoYm9yaG9vZCBvZiB5XHJcbiAgICBjb25zdCBmb3VuZFUgPSB0aGlzLnNlYXJjaExpblNwYWNlWyBtaW5JbmRleCBdO1xyXG5cclxuICAgIGNvbnN0IG1pbkJvdW5kID0gZm91bmRVIC0gdGhpcy5kaXN0YW5jZUJldHdlZW5TYW1wbGVQb2ludHM7XHJcbiAgICBjb25zdCBtYXhCb3VuZCA9IGZvdW5kVSArIHRoaXMuZGlzdGFuY2VCZXR3ZWVuU2FtcGxlUG9pbnRzO1xyXG5cclxuICAgIGNvbnN0IHNtYWxsZXJTcGFjZSA9IG51bWVyaWMubGluc3BhY2UoIG1pbkJvdW5kLCBtYXhCb3VuZCwgMjAwICk7XHJcbiAgICBjb25zdCByZWZpbmVkU2VhcmNoUG9pbnRzID0gU3BsaW5lRXZhbHVhdGlvbi5hdEFycmF5KCB0aGlzLnlTcGxpbmUsIHNtYWxsZXJTcGFjZSApO1xyXG5cclxuICAgIG1pbiA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlZmluZWRTZWFyY2hQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHkgPSByZWZpbmVkU2VhcmNoUG9pbnRzWyBpIF07XHJcbiAgICAgIGlmICggeSA8IG1pbiApIHtcclxuICAgICAgICBtaW4gPSB5O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG1pbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIGFueSBwYXJ0IG9mIHRoZSB0cmFjayBpcyBiZWxvdyBncm91bmQsIG1vdmUgdGhlIHdob2xlIHRyYWNrIHVwIHNvIGl0IHJlc3RzIGF0IHk9MCBhdCBpdHMgbWluaW11bSwgc2VlICM3MVxyXG4gICAqIENhbGxlZCB3aGVuIHVzZXIgcmVsZWFzZXMgdHJhY2sgb3IgYSBjb250cm9sIHBvaW50IGFmdGVyIGRyYWdnaW5nLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGJ1bXBBYm92ZUdyb3VuZCgpIHtcclxuICAgIGNvbnN0IGxvd2VzdFkgPSB0aGlzLmdldExvd2VzdFkoKTtcclxuICAgIGlmICggbG93ZXN0WSA8IDAgKSB7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRlKCAwLCAtbG93ZXN0WSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvbnRhaW4gY29udHJvbCBwb2ludHMgaW4gbGltaXRpbmcgZHJhZyBib3VuZHMgKGlmIGNvbnRyb2wgcG9pbnRzIGhhdmUgdGhlbSBzcGVjaWZpZWQpIHNvIHRoYXQgYnVtcGluZyBhYm92ZVxyXG4gICAgLy8gZ3JvdW5kIGRvZXNuJ3QgcHVzaCBjb250cm9sIHBvaW50cyBvdXQgb2YgdGhlc2UgYm91bmRzIC0gZG8gdGhpcyB3aXRob3V0IHVwZGF0aW5nIHNwbGluZXMgc2luY2Ugd2Ugd2lsbFxyXG4gICAgLy8gZG8gdGhhdCBhbnl3YXkgaW4gY29udGFpbkNvbnRyb2xQb2ludHNJbkF2YWlsYWJsZUJvdW5kc1xyXG4gICAgdGhpcy5jb250YWluQ29udHJvbFBvaW50c0luTGltaXRCb3VuZHMoIGZhbHNlICk7XHJcbiAgICB0aGlzLmNvbnRhaW5Db250cm9sUG9pbnRzSW5BdmFpbGFibGVCb3VuZHMoIHRoaXMubW9kZWwuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eS5nZXQoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgYW55IGNvbnRyb2wgcG9pbnRzIGFyZSBvdXQgb2YgdGhlIG1vZGVsIGF2YWlsYWJsZSBib3VuZHMgKGJvdW5kcyBvZiB0aGUgZW50aXJlIHNpbXVsYXRpb24gcGxheSBhcmVhKSxcclxuICAgKiBidW1wIHRoZW0gYmFjayBpbi4gVXNlZnVsIHdoZW4gdGhlIG1vZGVsIGJvdW5kcyBjaGFuZ2UsIG9yIHdoZW4gYnVtcGluZyB0aGUgdHJhY2sgYWJvdmUgZ3JvdW5kLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjb250YWluQ29udHJvbFBvaW50c0luQXZhaWxhYmxlQm91bmRzKCBib3VuZHMgKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGlmICggIWJvdW5kcy5jb250YWluc1BvaW50KCBjdXJyZW50UG9zaXRpb24gKSApIHtcclxuICAgICAgICBjb25zdCBuZXdQb2ludCA9IGJvdW5kcy5nZXRDbG9zZXN0UG9pbnQoIGN1cnJlbnRQb3NpdGlvbi54LCBjdXJyZW50UG9zaXRpb24ueSApO1xyXG5cclxuICAgICAgICAvLyBzZXQgdGhlIGNvbnRyb2wgcG9pbnQgXCJzb3VyY2VcIiBwb3NpdGlvbiB0byB0aGUgbmV3IHBvaW50IC0gdGhpcyBpcyB0aGUgdW5zbmFwcGVkIHBvc2l0aW9uLCBzZWVcclxuICAgICAgICAvLyBDb250cm9sUG9pbnQuanNcclxuICAgICAgICB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3UG9pbnQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudXBkYXRlU3BsaW5lcygpO1xyXG5cclxuICAgIC8vIEl0IGlzIHBvc3NpYmxlIHRoYXQgY29udGFpbmluZyB0aGUgY29udHJvbCBwb2ludHMgaGFzIHB1c2hlZCBhIHBvcnRpb24gb2YgdGhlIHNwbGluZSBiYWNrXHJcbiAgICAvLyB1bmRlcmdyb3VuZCwgaWYgdGhhdCBpcyB0aGUgY2FzZSBidW1wIHRoZW0gYmFjayBhYm92ZSBncm91bmQuIEJ1dCBvbmx5IGRvIHRoaXMgaWYgbm8gY29udHJvbCBwb2ludHNcclxuICAgIC8vIGFyZSBcInNuYXBwaW5nXCIgYXMgdGhlIHNwbGluZSAqY291bGQqIGJlIHVuZGVyZ3JvdW5kICB0ZW1wb3JhcmlseSBpbiB0aGlzIGNhc2VcclxuICAgIGNvbnN0IGFueUNvbnRyb2xQb2ludHNTbmFwcGluZyA9IF8uc29tZSggdGhpcy5jb250cm9sUG9pbnRzLCBwb2ludCA9PiBwb2ludC5zbmFwVGFyZ2V0UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIGlmICggIWFueUNvbnRyb2xQb2ludHNTbmFwcGluZyApIHtcclxuXHJcbiAgICAgIGNvbnN0IGxvd2VzdFkgPSB0aGlzLmdldExvd2VzdFkoKTtcclxuICAgICAgaWYgKCBsb3dlc3RZIDwgMCApIHtcclxuXHJcbiAgICAgICAgLy8gcHVzaCB0aGUgdHJhY2sgYWJvdmUgZ3JvdW5kIGJ5IGFuIGFtb3VudCB0aGF0IGlzbid0IHByb25lIHRvIHByZWNpc2lvbiBlcnJvcnMsIHNlZVxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lbmVyZ3ktc2thdGUtcGFyay9pc3N1ZXMvMTkxXHJcbiAgICAgICAgY29uc3QgY29ycmVjdGlvbiA9IGxvd2VzdFkgLSAwLjAwMTtcclxuXHJcbiAgICAgICAgLy8gdHJhbnNsYXRlIHVwZGF0ZXMgc3BsaW5lcyBmb3IgdXNcclxuICAgICAgICB0aGlzLnRyYW5zbGF0ZSggMCwgLWNvcnJlY3Rpb24gKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmdldExvd2VzdFkoKSA+PSAwLCAndHJhY2sgc2hvdWxkIGJlIGFib3ZlIGdyb3VuZCcgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZ2V0TG93ZXN0WSgpID49IDAsICd0cmFjayBzaG91bGQgYmUgYWJvdmUgZ3JvdW5kJyApO1xyXG4gICAgdGhpcy51cGRhdGVFbWl0dGVyLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2Ugc3VyZSB0aGF0IGFsbCBjb250cm9sIHBvaW50cyBhcmUgY29udGFpbmVkIHdpdGhpbiB0aGVpciBsaW1pdGluZyBkcmFnZ2FibGUgYm91bmRzLiBUaGUgYWxnb3JpdGhtIGZvciBrZWVwaW5nXHJcbiAgICogdGhlIHRyYWNrIGFib3ZlIGdyb3VuZCBtaWdodCBwdXNoIGFsbCBjb250cm9sIHBvaW50cyB1cCwgc28gdGhpcyB3aWxsIG1ha2Ugc3VyZSB0aGF0IGxpbWl0aW5nIGJvdW5kcyBhcmVcclxuICAgKiByZXNwZWN0ZWQuIE5vdCBhbGwgY29udHJvbCBwb2ludHMgaGF2ZSBsaW1pdGluZyBib3VuZHMgZm9yIGRyYWdnaW5nLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt1cGRhdGVTcGxpbmVzXSBvcHRpb25hbCwgd2hldGhlciBvciBub3QgdG8gdXBkYXRlIHNwbGluZXMgYW5kIHJlZHJhdyBhZnRlciB0aGlzIG9wZXJhdGlvblxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChmb3IgcGVyZm9ybWFuY2UsIHlvdSBtaWdodCBjaG9zZSB0byB3YWl0IGFuZCBkbyB0aGlzIGxhdGVyKVxyXG4gICAqL1xyXG4gIGNvbnRhaW5Db250cm9sUG9pbnRzSW5MaW1pdEJvdW5kcyggdXBkYXRlU3BsaW5lcyApIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgY29udHJvbFBvaW50ID0gdGhpcy5jb250cm9sUG9pbnRzWyBpIF07XHJcbiAgICAgIGNvbnN0IGxpbWl0Qm91bmRzID0gY29udHJvbFBvaW50LmxpbWl0Qm91bmRzO1xyXG4gICAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBjb250cm9sUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAgIGlmICggbGltaXRCb3VuZHMgKSB7XHJcbiAgICAgICAgaWYgKCAhbGltaXRCb3VuZHMuY29udGFpbnNQb2ludCggY3VycmVudFBvc2l0aW9uICkgKSB7XHJcbiAgICAgICAgICBjb25zdCBuZXdQb2ludCA9IGxpbWl0Qm91bmRzLmdldENsb3Nlc3RQb2ludCggY3VycmVudFBvc2l0aW9uLngsIGN1cnJlbnRQb3NpdGlvbi55ICk7XHJcbiAgICAgICAgICBjb250cm9sUG9pbnQuc291cmNlUG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG5ld1BvaW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHVwZGF0ZVNwbGluZXMgKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTcGxpbmVzKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVFbWl0dGVyLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU21vb3RoIG91dCB0aGUgdHJhY2sgc28gaXQgZG9lc24ndCBoYXZlIGFueSBzaGFycCB0dXJucywgc2VlICMxNzdcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaSAtIHRoZSBpbmRleCBvZiB0aGUgY29udHJvbCBwb2ludCB0byBhZGp1c3RcclxuICAgKi9cclxuICBzbW9vdGgoIGkgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBpID49IDAgJiYgaSA8IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubW9kZWwuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eSApO1xyXG5cclxuICAgIGNvbnN0IGF2YWlsYWJsZU1vZGVsQm91bmRzID0gdGhpcy5tb2RlbC5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYXZhaWxhYmxlTW9kZWxCb3VuZHMgKTtcclxuXHJcbiAgICBsZXQgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgbGV0IG51bVRyaWVzID0gMDtcclxuXHJcbiAgICAvLyBSZWNvcmQgdGhlIG9yaWdpbmFsIGNvbnRyb2wgcG9pbnQgcG9zaXRpb25cclxuICAgIGNvbnN0IG9yaWdpbmFsWCA9IHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueDtcclxuICAgIGNvbnN0IG9yaWdpbmFsWSA9IHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUueTtcclxuXHJcbiAgICAvLyBTcGlyYWwgb3V0d2FyZCwgc2VhcmNoaW5nIGZvciBhIHBvaW50IHRoYXQgZ2l2ZXMgYSBzbW9vdGggZW5vdWdoIHRyYWNrLlxyXG4gICAgbGV0IGRpc3RhbmNlID0gMC4wMTtcclxuICAgIGxldCBhbmdsZSA9IDA7XHJcbiAgICBjb25zdCBNQVhfVFJJRVMgPSA4MDtcclxuICAgIGNvbnN0IE1BWElNVU1fQUNDRVBUQUJMRV9SQURJVVNfT0ZfQ1VSVkFUVVJFID0gMC4wMztcclxuXHJcbiAgICB3aGlsZSAoIHRoaXMuZ2V0TWluaW11bVJhZGl1c09mQ3VydmF0dXJlKCkgPCBNQVhJTVVNX0FDQ0VQVEFCTEVfUkFESVVTX09GX0NVUlZBVFVSRSAmJiBudW1UcmllcyA8IE1BWF9UUklFUyApIHtcclxuICAgICAgY29uc3QgZGVsdGEgPSBWZWN0b3IyLmNyZWF0ZVBvbGFyKCBkaXN0YW5jZSwgYW5nbGUgKTtcclxuICAgICAgY29uc3QgcHJvcG9zZWRQb3NpdGlvbiA9IGRlbHRhLnBsdXNYWSggb3JpZ2luYWxYLCBvcmlnaW5hbFkgKTtcclxuXHJcbiAgICAgIC8vIE9ubHkgc2VhcmNoIHdpdGhpbiB0aGUgdmlzaWJsZSBtb2RlbCBib3VuZHMsIHNlZSAjMTk1XHJcbiAgICAgIGNvbnN0IGNvbnRhaW5zUG9pbnQgPSBhdmFpbGFibGVNb2RlbEJvdW5kcy5jb250YWluc1BvaW50KCBwcm9wb3NlZFBvc2l0aW9uICk7XHJcbiAgICAgIGlmICggY29udGFpbnNQb2ludCApIHtcclxuICAgICAgICB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXS5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcHJvcG9zZWRQb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNwbGluZXMoKTtcclxuICAgICAgfVxyXG4gICAgICBhbmdsZSA9IGFuZ2xlICsgTWF0aC5QSSAvIDk7XHJcbiAgICAgIGRpc3RhbmNlID0gZGlzdGFuY2UgKyAwLjA3O1xyXG4gICAgICBudW1UcmllcysrO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvdWxkIG5vdCBmaW5kIGEgYmV0dGVyIHNvbHV0aW9uLCBsZWF2ZSB0aGUgY29udHJvbCBwb2ludCB3aGVyZSBpdCBzdGFydGVkLlxyXG4gICAgaWYgKCBudW1UcmllcyA+PSBNQVhfVFJJRVMgKSB7XHJcbiAgICAgIHRoaXMuY29udHJvbFBvaW50c1sgaSBdLnNvdXJjZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggb3JpZ2luYWxYLCBvcmlnaW5hbFkgKTtcclxuICAgICAgdGhpcy51cGRhdGVTcGxpbmVzKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zbW9vdGhlZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgcmV0dXJuIHN1Y2Nlc3M7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGUgdXNlciBqdXN0IHJlbGVhc2VkIGEgY29udHJvbCBwb2ludCB3aXRoIGluZGV4IChpbmRleFRvSWdub3JlKSBhbmQgdGhlIHNwbGluZSBuZWVkcyB0byBiZSBzbW9vdGhlZC5cclxuICAgKiBDaG9vc2UgdGhlIHBvaW50IGNsb3Nlc3QgdG8gdGhlIHNoYXJwZXN0IHR1cm4gYW5kIGFkanVzdCBpdC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5fSBpbmRpY2VzVG9JZ25vcmUgaW5kaWNlcyB3aGljaCBzaG91bGQgbm90IGJlIGFkanVzdGVkIChwZXJoYXBzIGJlY2F1c2UgdGhlIHVzZXIganVzdCByZWxlYXNlZCB0aGVtKVxyXG4gICAqL1xyXG4gIHNtb290aFBvaW50T2ZIaWdoZXN0Q3VydmF0dXJlKCBpbmRpY2VzVG9JZ25vcmUgKSB7XHJcblxyXG4gICAgLy8gRmluZCB0aGUgc2hhcnBlc3QgdHVybiBvbiB0aGUgdHJhY2tcclxuICAgIGNvbnN0IGhpZ2hlc3RDdXJ2YXR1cmVVID0gdGhpcy5nZXRVV2l0aEhpZ2hlc3RDdXJ2YXR1cmUoKTtcclxuXHJcbiAgICAvLyBmaW5kIHRoZSBwb2ludCBjbG9zZXN0IChpbiBwYXJhbWV0cmljIGNvb3JkaW5hdGVzKSB0byB0aGUgc2hhcnBlc3QgdHVybiwgYnV0IG5vdCBpbmNsdWRpbmcgdGhlIGluZGV4VG9JZ25vcmVcclxuICAgIC8vIGl0IGxvb2tzIGxpa2UgdGhlIGNvbnRyb2wgcG9pbnRzIGFyZSBlcXVhbGx5IHNwYWNlZCBpbiBwYXJhbWV0cmljIGNvb3JkaW5hdGVzIChzZWUgdGhlIGNvbnN0cnVjdG9yKVxyXG4gICAgbGV0IGJlc3REaXN0YW5jZSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBiZXN0SW5kZXggPSAtMTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBpbmRpY2VzVG9JZ25vcmUuaW5kZXhPZiggaSApID09PSAtMSApIHtcclxuICAgICAgICBjb25zdCBjb250cm9sUG9pbnRVID0gaSAvIHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGg7XHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2VGcm9tSGlnaGVzdEN1cnZhdHVyZSA9IE1hdGguYWJzKCBoaWdoZXN0Q3VydmF0dXJlVSAtIGNvbnRyb2xQb2ludFUgKTtcclxuICAgICAgICBpZiAoIGRpc3RhbmNlRnJvbUhpZ2hlc3RDdXJ2YXR1cmUgPCBiZXN0RGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICBiZXN0RGlzdGFuY2UgPSBkaXN0YW5jZUZyb21IaWdoZXN0Q3VydmF0dXJlO1xyXG4gICAgICAgICAgYmVzdEluZGV4ID0gaTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBzbW9vdGhpbmcgc3VjY2VlZGVkLCBhbGwgaXMgd2VsbCwgb3RoZXJ3aXNlIHRyeSBzbW9vdGhpbmcgYmFzZWQgb24gYW5vdGhlciBwb2ludCwgc2VlICMxOThcclxuICAgIGNvbnN0IHN1Y2Nlc3MgPSB0aGlzLnNtb290aCggYmVzdEluZGV4ICk7XHJcbiAgICBpZiAoIHN1Y2Nlc3MgKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGluZGljZXNUb0lnbm9yZS5wdXNoKCBiZXN0SW5kZXggKTtcclxuICAgICAgaWYgKCBpbmRpY2VzVG9JZ25vcmUubGVuZ3RoID09PSB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoICkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zbW9vdGhQb2ludE9mSGlnaGVzdEN1cnZhdHVyZSggaW5kaWNlc1RvSWdub3JlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgc3BsaW5lIHBvc2l0aW9uIGF0IHRoZSBwb2ludCBvZiBoaWdoZXN0IGN1cnZhdHVyZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKi9cclxuICBnZXRVV2l0aEhpZ2hlc3RDdXJ2YXR1cmUoKSB7XHJcbiAgICAvLyBCZWxvdyBpbXBsZW1lbnRhdGlvbiBjb3BpZWQgZnJvbSBnZXRNaW5pbXVtUmFkaXVzT2ZDdXJ2YXR1cmUuICBJdCBpcyBhIENQVSBkZW1hbmRpbmcgdGFzaywgc28ga2VwdCBzZXBhcmF0ZSB0b1xyXG4gICAgLy8ga2VlcCB0aGUgb3RoZXIgb25lIGZhc3QuIFNob3VsZCBiZSBrZXB0IGluIHN5bmMgbWFudWFsbHlcclxuICAgIGNvbnN0IGN1cnZhdHVyZSA9IHsgcjogMCwgeDogMCwgeTogMCB9O1xyXG4gICAgbGV0IG1pblJhZGl1cyA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBiZXN0VSA9IDA7XHJcblxyXG4gICAgLy8gU2VhcmNoIHRoZSBlbnRpcmUgc3BhY2Ugb2YgdGhlIHNwbGluZS4gIExhcmdlciBudW1iZXIgb2YgZGl2aXNpb25zIHdhcyBjaG9zZW4gdG8gcHJldmVudCBsYXJnZSBjdXJ2YXR1cmVzIGF0IGFcclxuICAgIC8vIHNpbmdsZSBzYW1wbGluZyBwb2ludC5cclxuICAgIGNvbnN0IG51bURpdmlzaW9ucyA9IDQwMDtcclxuICAgIGNvbnN0IGR1ID0gKCB0aGlzLm1heFBvaW50IC0gdGhpcy5taW5Qb2ludCApIC8gbnVtRGl2aXNpb25zO1xyXG4gICAgZm9yICggbGV0IHBhcmFtZXRyaWNQb3NpdGlvbiA9IHRoaXMubWluUG9pbnQ7IHBhcmFtZXRyaWNQb3NpdGlvbiA8IHRoaXMubWF4UG9pbnQ7IHBhcmFtZXRyaWNQb3NpdGlvbiArPSBkdSApIHtcclxuICAgICAgdGhpcy5nZXRDdXJ2YXR1cmUoIHBhcmFtZXRyaWNQb3NpdGlvbiwgY3VydmF0dXJlICk7XHJcbiAgICAgIGNvbnN0IHIgPSBNYXRoLmFicyggY3VydmF0dXJlLnIgKTtcclxuICAgICAgaWYgKCByIDwgbWluUmFkaXVzICkge1xyXG4gICAgICAgIG1pblJhZGl1cyA9IHI7XHJcbiAgICAgICAgYmVzdFUgPSBwYXJhbWV0cmljUG9zaXRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBiZXN0VTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmQgdGhlIG1pbmltdW0gcmFkaXVzIG9mIGN1cnZhdHVyZSBhbG9uZyB0aGUgdHJhY2ssIGluIG1ldGVyc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBtaW5pbXVtIHJhZGl1cyBvZiBjdXJ2YXR1cmUgYWxvbmcgdGhlIHRyYWNrLCBpbiBtZXRlcnMuXHJcbiAgICovXHJcbiAgZ2V0TWluaW11bVJhZGl1c09mQ3VydmF0dXJlKCkge1xyXG4gICAgY29uc3QgY3VydmF0dXJlID0geyByOiAwLCB4OiAwLCB5OiAwIH07XHJcbiAgICBsZXQgbWluUmFkaXVzID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xyXG5cclxuICAgIC8vIFNlYXJjaCB0aGUgZW50aXJlIHNwYWNlIG9mIHRoZSBzcGxpbmUuICBMYXJnZXIgbnVtYmVyIG9mIGRpdmlzaW9ucyB3YXMgY2hvc2VuIHRvIHByZXZlbnQgbGFyZ2UgY3VydmF0dXJlcyBhdCBhXHJcbiAgICAvLyBzaW5nbGUgc2FtcGxpbmcgcG9pbnQuXHJcbiAgICBjb25zdCBudW1EaXZpc2lvbnMgPSA0MDA7XHJcbiAgICBjb25zdCBkdSA9ICggdGhpcy5tYXhQb2ludCAtIHRoaXMubWluUG9pbnQgKSAvIG51bURpdmlzaW9ucztcclxuICAgIGZvciAoIGxldCBwYXJhbWV0cmljUG9zaXRpb24gPSB0aGlzLm1pblBvaW50OyBwYXJhbWV0cmljUG9zaXRpb24gPCB0aGlzLm1heFBvaW50OyBwYXJhbWV0cmljUG9zaXRpb24gKz0gZHUgKSB7XHJcbiAgICAgIHRoaXMuZ2V0Q3VydmF0dXJlKCBwYXJhbWV0cmljUG9zaXRpb24sIGN1cnZhdHVyZSApO1xyXG4gICAgICBjb25zdCByID0gTWF0aC5hYnMoIGN1cnZhdHVyZS5yICk7XHJcbiAgICAgIGlmICggciA8IG1pblJhZGl1cyApIHtcclxuICAgICAgICBtaW5SYWRpdXMgPSByO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWluUmFkaXVzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXNlIGFuIGFyYml0cmFyeSBwb3NpdGlvbiBmb3IgdHJhbnNsYXRpbmcgdGhlIHRyYWNrIGR1cmluZyBkcmFnZ2luZy4gT25seSB1c2VkIGZvciBkZWx0YXMgaW4gcmVsYXRpdmUgcG9zaXRpb25pbmdcclxuICAgKiBhbmQgdHJhbnNsYXRpb24sIHNvIGFuIGV4YWN0IFwicG9zaXRpb25cIiBpcyBpcnJlbGV2YW50LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAqL1xyXG4gIGdldCBwb3NpdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbi5jb3B5KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHBvc2l0aW9uIG9mIHRoaXMgVHJhY2suXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBuZXdQb3NpdGlvblxyXG4gICAqL1xyXG4gIHNldCBwb3NpdGlvbiggbmV3UG9zaXRpb24gKSB7XHJcbiAgICBjb25zdCBkZWx0YSA9IG5ld1Bvc2l0aW9uLm1pbnVzKCB0aGlzLnBvc2l0aW9uICk7XHJcbiAgICB0aGlzLnRyYW5zbGF0ZSggZGVsdGEueCwgZGVsdGEueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIGFycmF5IG9mIGFsbCBjb250cm9sIHBvaW50IHNvdXJjZVBvc2l0aW9ucyAtIHRoaXMgaXMgdGhlIHBvc2l0aW9uIG9mIGFsbCBDb250cm9sUG9pbnQncyBpZiBub25lIGhhZFxyXG4gICAqIHNuYXBwZWQgdG8gYSBwb3NpdGlvbiBpbiBhdHRlbXB0IHRvIGNvbWJpbmUgd2l0aCBhbm90aGVyIHRyYWNrLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyW119XHJcbiAgICovXHJcbiAgY29weUNvbnRyb2xQb2ludFNvdXJjZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb250cm9sUG9pbnRzLm1hcCggY29udHJvbFBvaW50ID0+IGNvbnRyb2xQb2ludC5zb3VyY2VQb3NpdGlvblByb3BlcnR5LnZhbHVlLmNvcHkoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGVidWdnaW5nIGluZm8uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldERlYnVnU3RyaW5nKCkge1xyXG4gICAgbGV0IHN0cmluZyA9ICd2YXIgY29udHJvbFBvaW50cyA9IFsnO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5jb250cm9sUG9pbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBjb250cm9sUG9pbnQgPSB0aGlzLmNvbnRyb2xQb2ludHNbIGkgXTtcclxuICAgICAgc3RyaW5nICs9IGBuZXcgQ29udHJvbFBvaW50KCR7Y29udHJvbFBvaW50LnBvc2l0aW9uUHJvcGVydHkudmFsdWUueH0sJHtjb250cm9sUG9pbnQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55fSlgO1xyXG4gICAgICBpZiAoIGkgPCB0aGlzLmNvbnRyb2xQb2ludHMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgICBzdHJpbmcgKz0gJywnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYCR7c3RyaW5nfV07YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2FsIGZvciBnYXJiYWdlIGNvbGxlY3Rpb24uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLmRpc3Bvc2VUcmFjaygpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZSBhbGwgb2YgdGhlIGNvbnRyb2wgcG9pbnRzIG9mIHRoZSB0cmFjayB3aGVuIHRoZXkgd2lsbCBub3QgYmUgcmV1c2VkIGluIGFub3RoZXIgdHJhY2tcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZUNvbnRyb2xQb2ludHMoKSB7XHJcbiAgICB0aGlzLmNvbnRyb2xQb2ludHMuZm9yRWFjaCggY29udHJvbFBvaW50ID0+IHRoaXMubW9kZWwuY29udHJvbFBvaW50R3JvdXAuZGlzcG9zZUVsZW1lbnQoIGNvbnRyb2xQb2ludCApICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBAcHVibGljIEBwdWJsaWNcclxuVHJhY2suRlVMTFlfSU5URVJBQ1RJVkVfT1BUSU9OUyA9IEZVTExZX0lOVEVSQUNUSVZFX09QVElPTlM7XHJcblxyXG5UcmFjay5UcmFja0lPID0gbmV3IElPVHlwZSggJ1RyYWNrSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBUcmFjayxcclxuICBkb2N1bWVudGF0aW9uOiAnQSBza2F0ZSB0cmFjaycsXHJcbiAgdG9TdGF0ZU9iamVjdDogdHJhY2sgPT4gdHJhY2sudG9TdGF0ZU9iamVjdCgpLFxyXG4gIHN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzOiBzdGF0ZU9iamVjdCA9PiB7XHJcbiAgICBjb25zdCBjb250cm9sUG9pbnRzID0gc3RhdGVPYmplY3QuY29udHJvbFBvaW50cy5tYXAoIENvbnRyb2xQb2ludFJlZmVyZW5jZUlPLmZyb21TdGF0ZU9iamVjdCApO1xyXG4gICAgY29uc3QgcGFyZW50cyA9IHN0YXRlT2JqZWN0LnBhcmVudHMubWFwKCBUcmFjay5UcmFja0lPLmZyb21TdGF0ZU9iamVjdCApO1xyXG4gICAgcmV0dXJuIFsgY29udHJvbFBvaW50cywgcGFyZW50cywge1xyXG4gICAgICBkcmFnZ2FibGU6IHN0YXRlT2JqZWN0LmRyYWdnYWJsZSxcclxuICAgICAgY29uZmlndXJhYmxlOiBzdGF0ZU9iamVjdC5jb25maWd1cmFibGVcclxuICAgIH0gXTtcclxuICB9LFxyXG4gIHN0YXRlU2NoZW1hOiBUcmFja0lPID0+ICgge1xyXG4gICAgY29udHJvbFBvaW50czogQXJyYXlJTyggQ29udHJvbFBvaW50UmVmZXJlbmNlSU8gKSxcclxuICAgIHBhcmVudHM6IEFycmF5SU8oIFRyYWNrSU8gKSxcclxuICAgIGRyYWdnYWJsZTogQm9vbGVhbklPLFxyXG4gICAgY29uZmlndXJhYmxlOiBCb29sZWFuSU9cclxuICB9IClcclxufSApO1xyXG5cclxuZW5lcmd5U2thdGVQYXJrLnJlZ2lzdGVyKCAnVHJhY2snLCBUcmFjayApO1xyXG5leHBvcnQgZGVmYXVsdCBUcmFjazsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxHQUFHLE1BQU0sMkJBQTJCO0FBQzNDLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxZQUFZLFFBQVEsbUNBQW1DO0FBQ2hFLE9BQU9DLFlBQVksTUFBTSx1Q0FBdUM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxPQUFPLE1BQU0sd0NBQXdDO0FBQzVELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxXQUFXLE1BQU0sNENBQTRDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsZ0JBQWdCLE1BQU0sd0JBQXdCO0FBQ3JELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7O0FBRTVDO0FBQ0EsTUFBTUMs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