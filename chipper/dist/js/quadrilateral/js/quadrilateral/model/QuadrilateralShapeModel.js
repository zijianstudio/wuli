// Copyright 2021-2023, University of Colorado Boulder

/**
 * A model component for the components of the actual quadrilateral geometry/shape. This includes subcomponents
 * for vertices and sides. It also holds state for geometric properties such as shape area, pairs of equal side
 * lengths, vertex angles, and parallel sides.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import quadrilateral from '../../quadrilateral.js';
import NamedQuadrilateral from './NamedQuadrilateral.js';
import QuadrilateralSide from './QuadrilateralSide.js';
import QuadrilateralVertex from './QuadrilateralVertex.js';
import Utils from '../../../../dot/js/Utils.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import QuadrilateralQueryParameters from '../QuadrilateralQueryParameters.js';
import QuadrilateralVertexLabel from './QuadrilateralVertexLabel.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ParallelSideChecker from './ParallelSideChecker.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import QuadrilateralShapeDetector from './QuadrilateralShapeDetector.js';
import QuadrilateralSidePair from './QuadrilateralSidePair.js';
import QuadrilateralVertexPair from './QuadrilateralVertexPair.js';
import QuadrilateralUtils from './QuadrilateralUtils.js';
import QuadrilateralSideLabel from './QuadrilateralSideLabel.js';
import QuadrilateralConstants from '../../QuadrilateralConstants.js';

// Used when verifying that QuadrilateralVertex positions are valid before setting to the model.

export default class QuadrilateralShapeModel {
  // Vertices of the quadrilateral.

  // Sides of the quadrilateral.

  // Monitors angles of the shape to determine when pairs of opposite sides are parallel.

  // Whether the quadrilateral is a parallelogram.

  // True when all angles of the quadrilateral are right angles within interAngleToleranceInterval.

  // True when all lengths of the quadrilateral are equal within the lengthToleranceInterval.

  // The area of the quadrilateral. Updated in "deferred" Properties, only after positions of all four vertices are
  // determined.
  // The tolerance intervals for angle and length comparisons when comparing two angle/lengths with one another.
  // These values are generally larger than "static" angle tolerance intervals to account for compounding error
  // when comparing angles. For example, we want a bit more flexibility when comparing angles of a trapezoid or else
  // it would be incredibly difficult to find that shape.
  // The tolerance interval for angle comparisons when comparing a vertex angle with a static value. This
  // tolerance interval will generally be smaller than the "inter" intervals because we don't want much wiggle room
  // when detecting critical angles. For example, the angle needs to be very close to Math.PI / 2 to be considered
  // a "right angle" and make the "right angle indicators" appear.
  // Emits an event whenever the shape of the Quadrilateral changes
  // The name of the quadrilateral (like square/rhombus/trapezoid, etc). Will be null if it is a random
  // unnamed shape.
  // A map that provides the adjacent vertices to the provided QuadrilateralVertex.
  // A map that provides the opposite vertex from a give vertex.
  // A map that provides the adjacent sides to the provided QuadrilateralSide.
  // A map that provides the opposite side from the provided QuadrilateralSide.
  // An array of all the adjacent VertexPairs that currently have equal angles.
  // An array of all the opposite VertexPairs that currently have equal angles.
  // An array of all the adjacent SidePairs that have equal lengths.
  // An array of all the opposite SidePairs that have equal side lengths.
  // An array of all the (opposite) SidePairs that currently parallel with each other.
  // Is the simulation *not* being reset?
  // True when the Properties of the shape are currently being deferred, preventing listeners from being called and
  // new values from being set.
  // If true, the shape is tested to make sure it is valid (no overlapping vertices or crossed sides).
  constructor(resetNotInProgressProperty, smoothingLengthProperty, providedOptions) {
    const options = optionize()({
      validateShape: true,
      tandem: Tandem.OPTIONAL
    }, providedOptions);
    this.validateShape = options.validateShape;
    this._isParallelogram = false;
    this._areAllAnglesRight = false;
    this._areAllLengthsEqual = false;
    this.vertexA = new QuadrilateralVertex(new Vector2(-0.25, 0.25), QuadrilateralVertexLabel.VERTEX_A, smoothingLengthProperty, options.tandem.createTandem('vertexA'));
    this.vertexB = new QuadrilateralVertex(new Vector2(0.25, 0.25), QuadrilateralVertexLabel.VERTEX_B, smoothingLengthProperty, options.tandem.createTandem('vertexB'));
    this.vertexC = new QuadrilateralVertex(new Vector2(0.25, -0.25), QuadrilateralVertexLabel.VERTEX_C, smoothingLengthProperty, options.tandem.createTandem('vertexC'));
    this.vertexD = new QuadrilateralVertex(new Vector2(-0.25, -0.25), QuadrilateralVertexLabel.VERTEX_D, smoothingLengthProperty, options.tandem.createTandem('vertexD'));
    this.vertices = [this.vertexA, this.vertexB, this.vertexC, this.vertexD];
    this.oppositeVertexMap = new Map([[this.vertexA, this.vertexC], [this.vertexB, this.vertexD], [this.vertexC, this.vertexA], [this.vertexD, this.vertexB]]);
    this.adjacentVertexMap = new Map([[this.vertexA, [this.vertexB, this.vertexD]], [this.vertexB, [this.vertexA, this.vertexC]], [this.vertexC, [this.vertexB, this.vertexD]], [this.vertexD, [this.vertexA, this.vertexC]]]);
    this.sideAB = new QuadrilateralSide(this.vertexA, this.vertexB, QuadrilateralSideLabel.SIDE_AB, options.tandem.createTandem('sideAB'));
    this.sideBC = new QuadrilateralSide(this.vertexB, this.vertexC, QuadrilateralSideLabel.SIDE_BC, options.tandem.createTandem('sideBC'));
    this.sideCD = new QuadrilateralSide(this.vertexC, this.vertexD, QuadrilateralSideLabel.SIDE_CD, options.tandem.createTandem('sideCD'));
    this.sideDA = new QuadrilateralSide(this.vertexD, this.vertexA, QuadrilateralSideLabel.SIDE_DA, options.tandem.createTandem('sideDA'));
    this.sides = [this.sideAB, this.sideBC, this.sideCD, this.sideDA];
    this.oppositeSideMap = new Map([[this.sideAB, this.sideCD], [this.sideBC, this.sideDA], [this.sideCD, this.sideAB], [this.sideDA, this.sideBC]]);
    this.adjacentSideMap = new Map([[this.sideAB, [this.sideDA, this.sideBC]], [this.sideBC, [this.sideAB, this.sideCD]], [this.sideCD, [this.sideBC, this.sideDA]], [this.sideDA, [this.sideCD, this.sideAB]]]);
    this.adjacentEqualVertexPairsProperty = new Property([]);
    this.oppositeEqualVertexPairsProperty = new Property([]);
    this.adjacentEqualSidePairsProperty = new Property([]);
    this.oppositeEqualSidePairsProperty = new Property([]);
    this.parallelSidePairsProperty = new Property([]);

    // Connect the sides, creating the shape and giving vertices the information they need to calculate angles.
    this.sideBC.connectToSide(this.sideAB);
    this.sideCD.connectToSide(this.sideBC);
    this.sideDA.connectToSide(this.sideCD);
    this.sideAB.connectToSide(this.sideDA);
    this.shapeNameProperty = new EnumerationProperty(NamedQuadrilateral.CONVEX_QUADRILATERAL, {
      tandem: options.tandem.createTandem('shapeNameProperty')
    });
    this.areaProperty = new NumberProperty(0, {
      tandem: options.tandem.createTandem('areaProperty')
    });
    this.shapeChangedEmitter = new Emitter({
      tandem: options.tandem.createTandem('shapeChangedEmitter')
    });
    this.interAngleToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval(QuadrilateralQueryParameters.interAngleToleranceInterval);
    this.staticAngleToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval(QuadrilateralQueryParameters.staticAngleToleranceInterval);
    this.interLengthToleranceInterval = QuadrilateralShapeModel.getWidenedToleranceInterval(QuadrilateralQueryParameters.interLengthToleranceInterval);
    this.sideABSideCDParallelSideChecker = new ParallelSideChecker(new QuadrilateralSidePair(this.sideAB, this.sideCD), this.shapeChangedEmitter, options.tandem.createTandem('sideABSideCDParallelSideChecker'));
    this.sideBCSideDAParallelSideChecker = new ParallelSideChecker(new QuadrilateralSidePair(this.sideBC, this.sideDA), this.shapeChangedEmitter, options.tandem.createTandem('sideBCSideDAParallelSideChecker'));
    this.parallelSideCheckers = [this.sideABSideCDParallelSideChecker, this.sideBCSideDAParallelSideChecker];
    this.resetNotInProgressProperty = resetNotInProgressProperty;
    this.propertiesDeferred = false;
    Multilink.multilink([this.vertexA.positionProperty, this.vertexB.positionProperty, this.vertexC.positionProperty, this.vertexD.positionProperty], (position1, position2, position3, position4) => {
      // Update geometric attributes after QuadrilateralVertex positions have changed.
      this.updateOrderDependentProperties();

      // notify a change in shape, after updating geometric attributes
      this.shapeChangedEmitter.emit();

      // After the shape has changed, update the areas of allowed motion for each QuadrilateralVertex.
      this.setVertexDragAreas();
    });
    this.vertices.forEach(vertex => {
      vertex.modelBoundsProperty.link(vertexBounds => {
        // smallest possible interval for controlling the vertex positions, over two so that we know when the vertex
        // touches model bounds.
        const halfSmallestInterval = QuadrilateralConstants.MINOR_REDUCED_SIZE_VERTEX_INTERVAL / 2;
        vertex.topConstrainedProperty.value = Utils.equalsEpsilon(vertexBounds.maxY, QuadrilateralConstants.MODEL_BOUNDS.maxY, halfSmallestInterval);
        vertex.rightConstrainedProperty.value = Utils.equalsEpsilon(vertexBounds.maxX, QuadrilateralConstants.MODEL_BOUNDS.maxX, halfSmallestInterval);
        vertex.bottomConstrainedProperty.value = Utils.equalsEpsilon(vertexBounds.minY, QuadrilateralConstants.MODEL_BOUNDS.minY, halfSmallestInterval);
        vertex.leftConstrainedProperty.value = Utils.equalsEpsilon(vertexBounds.minX, QuadrilateralConstants.MODEL_BOUNDS.minX, halfSmallestInterval);
      });
    });
  }

  /**
   * Returns true when all angles are right (within staticAngleToleranceInterval).
   */
  getAreAllAnglesRight() {
    return this._areAllAnglesRight;
  }

  /**
   * Update value tracking when all angles are equal. To be called in updateOrderDependentProperties.
   */
  updateAreAllAnglesRight() {
    this._areAllAnglesRight = _.every(this.vertices, vertex => this.isRightAngle(vertex.angleProperty.value));
  }

  /**
   * Returns true when all lengths are equal.
   */
  getAreAllLengthsEqual() {
    return this._areAllLengthsEqual;
  }

  /**
   * Update value tracking all equal side lengths. To be called in updateOrderDependentProperties.
   */
  updateAreAllLengthsEqual() {
    this._areAllLengthsEqual = this.isInterLengthEqualToOther(this.sideAB.lengthProperty.value, this.sideBC.lengthProperty.value) && this.isInterLengthEqualToOther(this.sideBC.lengthProperty.value, this.sideCD.lengthProperty.value) && this.isInterLengthEqualToOther(this.sideCD.lengthProperty.value, this.sideDA.lengthProperty.value) && this.isInterLengthEqualToOther(this.sideDA.lengthProperty.value, this.sideAB.lengthProperty.value);
  }

  /**
   * Returns the area of the quadrilateral. Uses Bretschneider's formula for the area of a general quadrilateral,
   * see https://en.wikipedia.org/wiki/Bretschneider%27s_formula.
   *
   * Requires side lengths and vertex angles to be up-to-date, must be used in updateOrderDependentProperties.
   */
  getArea() {
    const a = this.sideAB.lengthProperty.value;
    const b = this.sideBC.lengthProperty.value;
    const c = this.sideCD.lengthProperty.value;
    const d = this.sideDA.lengthProperty.value;

    // can be any two opposite angles
    const firstAngle = this.vertexA.angleProperty.value;
    const secondAngle = this.vertexC.angleProperty.value;

    // semiperimeter
    const s = (a + b + c + d) / 2;
    const cosArg = Math.cos((firstAngle + secondAngle) / 2);
    const area = Math.sqrt((s - a) * (s - b) * (s - c) * (s - d) - a * b * c * d * cosArg * cosArg);
    const isAreaNaN = isNaN(area);

    // A vertex might be overlapped with a side or another QuadrilateralVertex in the "test" shape while we are trying to find
    // a good vertex position. Gracefully handle this by returning an area of zero (area is NaN/undefined otherwise).
    if (this.validateShape) {
      assert && assert(!isAreaNaN, 'Area is not defined for the quadrilateral shape');
    }
    return isAreaNaN ? 0 : area;
  }

  /**
   * Returns true if the two angles are equal withing angleToleranceInterval.
   */
  isInterAngleEqualToOther(angle1, angle2) {
    return Utils.equalsEpsilon(angle1, angle2, this.interAngleToleranceInterval);
  }

  /**
   * Returns true if the lengths are equal to each other within interLengthToleranceInterval.
   */
  isInterLengthEqualToOther(length1, length2) {
    return Utils.equalsEpsilon(length1, length2, this.interLengthToleranceInterval);
  }

  /**
   * Returns true if the angle is a right angle, within staticAngleToleranceInterval.
   */
  isRightAngle(angle) {
    return Utils.equalsEpsilon(angle, Math.PI / 2, this.staticAngleToleranceInterval);
  }

  /**
   * Returns true when the shape is a parallelogram.
   */
  isParallelogram() {
    return this._isParallelogram;
  }

  /**
   * Returns true if two angles are equal within staticAngleToleranceInterval. See that value for more
   * information.
   */
  isStaticAngleEqualToOther(angle, otherAngle) {
    return Utils.equalsEpsilon(angle, otherAngle, this.staticAngleToleranceInterval);
  }

  /**
   * Returns true if the angle is equal to PI within staticAngleToleranceInterval.
   */
  isFlatAngle(angle) {
    return this.isStaticAngleEqualToOther(angle, Math.PI);
  }

  /**
   * Set multiple vertex positions at once, updating each and then calling relevant Property listeners after
   * all are set. This way you can safely set multiple at a time without transient states where the shape is
   * not valid.
   */
  setVertexPositions(labelToPositionMap) {
    this.setPropertiesDeferred(true);
    labelToPositionMap.forEach((positionValue, labelKey) => {
      const vertex = this.getLabelledVertex(labelKey);

      // this is a new Vector2 instance so even if x,y values are the same as the old value it will trigger
      // listeners without this check
      if (!positionValue.equals(vertex.positionProperty.value)) {
        vertex.positionProperty.value = positionValue;
      }
    });

    // un-defer all so that all Properties and calls callbacks
    this.setPropertiesDeferred(false);
  }

  /**
   * Update Properties that need to be calculated in sequence to have correct values. Positions need to update,
   * then angles and lengths, then Properties tracking pairs of equal lengths and angles, then parallelogram state,
   * and finally shape name. If shape name or parallelogram state is calculated before shape properties, their values
   * will be incorrect.
   */
  updateOrderDependentProperties() {
    // update angles
    this.vertices.forEach(vertex => {
      vertex.updateAngle();
    });

    // update lengths
    this.sides.forEach(side => {
      side.updateLengthAndShape();
    });

    // pairs of parallel sides
    this.updateParallelSideProperties();

    // pairs of equal vertex angles and side lengths
    this.updateVertexAngleComparisons();
    this.updateSideLengthComparisons();

    // other shape attributes
    this.areaProperty.set(this.getArea());
    this.updateAreAllAnglesRight();
    this.updateAreAllLengthsEqual();

    // the detected shape name
    this.shapeNameProperty.set(QuadrilateralShapeDetector.getShapeName(this));
  }

  /**
   * Update Properties for angle comparisons - pairs of equal opposite and equal adjacent angles.
   */
  updateVertexAngleComparisons() {
    this.updateEqualVertexPairs(this.adjacentEqualVertexPairsProperty, this.adjacentVertexMap);
    this.updateEqualVertexPairs(this.oppositeEqualVertexPairsProperty, this.oppositeVertexMap);
  }

  /**
   * Update a provided Property that holds a list of equal angles (either opposite or adjacent).
   */
  updateEqualVertexPairs(equalVertexPairsProperty, vertexMap) {
    const currentVertexPairs = equalVertexPairsProperty.value;
    vertexMap.forEach((relatedVertices, keyVertex, map) => {
      const relatedVerticesArray = Array.isArray(relatedVertices) ? relatedVertices : [relatedVertices];
      relatedVerticesArray.forEach(relatedVertex => {
        const vertexPair = new QuadrilateralVertexPair(keyVertex, relatedVertex);
        const firstAngle = vertexPair.component1.angleProperty.value;
        const secondAngle = vertexPair.component2.angleProperty.value;
        const areAnglesEqual = this.isInterAngleEqualToOther(firstAngle, secondAngle);
        const indexOfVertexPair = _.findIndex(currentVertexPairs, currentVertexPair => currentVertexPair.equals(vertexPair));
        const currentlyIncludesVertexPair = indexOfVertexPair > -1;
        if (currentlyIncludesVertexPair && !areAnglesEqual) {
          // the QuadrilateralVertexPair needs to be removed because angles are no longer equal
          currentVertexPairs.splice(indexOfVertexPair, 1);
          equalVertexPairsProperty.notifyListenersStatic();
        } else if (!currentlyIncludesVertexPair && areAnglesEqual) {
          // the QuadrilateralVertexPair needs to be added because they just became equal
          currentVertexPairs.push(vertexPair);
          equalVertexPairsProperty.notifyListenersStatic();
        }
      });
    });
  }

  /**
   * Update Properties for side length comparisons - either opposite or adjacent sides.
   */
  updateSideLengthComparisons() {
    this.updateEqualSidePairs(this.adjacentEqualSidePairsProperty, this.adjacentSideMap);
    this.updateEqualSidePairs(this.oppositeEqualSidePairsProperty, this.oppositeSideMap);
  }

  /**
   * Update a provided Property holding a list of sides that are equal in length (either opposite or adjacent).
   */
  updateEqualSidePairs(equalSidePairsProperty, sideMap) {
    const currentSidePairs = equalSidePairsProperty.value;
    sideMap.forEach((relatedSides, keySide) => {
      const relatedSidesArray = Array.isArray(relatedSides) ? relatedSides : [relatedSides];
      relatedSidesArray.forEach(relatedSide => {
        const sidePair = new QuadrilateralSidePair(keySide, relatedSide);
        const firstLength = sidePair.component1.lengthProperty.value;
        const secondLength = sidePair.component2.lengthProperty.value;
        const areLengthsEqual = this.isInterLengthEqualToOther(firstLength, secondLength);
        const indexOfSidePair = _.findIndex(currentSidePairs, currentSidePair => currentSidePair.equals(sidePair));
        const currentlyIncludesSidePair = indexOfSidePair > -1;
        if (currentlyIncludesSidePair && !areLengthsEqual) {
          // the QuadrilateralVertexPair needs to be removed because angles are no longer equal
          currentSidePairs.splice(indexOfSidePair, 1);
          equalSidePairsProperty.notifyListenersStatic();
        } else if (!currentlyIncludesSidePair && areLengthsEqual) {
          // the QuadrilateralVertexPair needs to be added because they just became equal
          currentSidePairs.push(sidePair);
          equalSidePairsProperty.notifyListenersStatic();
        }
      });
    });
  }

  /**
   * Updates Properties related to opposite sides that are parallel, and whether this shape is a parallelogram. To be
   * used in updateOrderDependentProperties.
   */
  updateParallelSideProperties() {
    const sideABSideCDParallel = this.sideABSideCDParallelSideChecker.areSidesParallel();
    const sideBCSideDAParallel = this.sideBCSideDAParallelSideChecker.areSidesParallel();
    this._isParallelogram = sideABSideCDParallel && sideBCSideDAParallel;
    const previousParallelSidePairs = this.parallelSidePairsProperty.value;
    const currentParallelSidePairs = [];
    if (sideABSideCDParallel) {
      currentParallelSidePairs.push(this.sideABSideCDParallelSideChecker.sidePair);
    }
    if (sideBCSideDAParallel) {
      currentParallelSidePairs.push(this.sideBCSideDAParallelSideChecker.sidePair);
    }
    if (!_.isEqual(previousParallelSidePairs, currentParallelSidePairs)) {
      this.parallelSidePairsProperty.value = currentParallelSidePairs;
    }
  }

  /**
   * Sets this model to be the same as the provided QuadrilateralShapeModel by setting QuadrilateralVertex positions.
   */
  setFromShape(other) {
    // Since we are updating many vertices at once, we need to defer callbacks until all positions are set. Otherwise,
    // callbacks will be called for a potentially disallowed shape.
    this.setPropertiesDeferred(true);
    this.vertexA.positionProperty.set(other.vertexA.positionProperty.value);
    this.vertexB.positionProperty.set(other.vertexB.positionProperty.value);
    this.vertexC.positionProperty.set(other.vertexC.positionProperty.value);
    this.vertexD.positionProperty.set(other.vertexD.positionProperty.value);
    this.setPropertiesDeferred(false);
  }

  /**
   * Get the vertex of this shape model with the provided vertexLabel.
   */
  getLabelledVertex(vertexLabel) {
    const labelledVertex = _.find(this.vertices, vertex => vertex.vertexLabel === vertexLabel);
    assert && assert(labelledVertex, 'Could not find labelled vertex');
    return labelledVertex;
  }

  /**
   * Update the drag areas for all vertices.
   */
  setVertexDragAreas() {
    // available drag areas go way outside of model bounds, constraint within model bounds is implemented by
    // a bounds.closestPointTo check to support smooth movement around the edge of bounds
    const dilatedBounds = QuadrilateralConstants.MODEL_BOUNDS.dilated(1);
    this.vertexA.dragAreaProperty.set(QuadrilateralUtils.createVertexArea(dilatedBounds, this.vertexA, this.vertexB, this.vertexC, this.vertexD, this.validateShape));
    this.vertexB.dragAreaProperty.set(QuadrilateralUtils.createVertexArea(dilatedBounds, this.vertexB, this.vertexC, this.vertexD, this.vertexA, this.validateShape));
    this.vertexC.dragAreaProperty.set(QuadrilateralUtils.createVertexArea(dilatedBounds, this.vertexC, this.vertexD, this.vertexA, this.vertexB, this.validateShape));
    this.vertexD.dragAreaProperty.set(QuadrilateralUtils.createVertexArea(dilatedBounds, this.vertexD, this.vertexA, this.vertexB, this.vertexC, this.validateShape));
  }

  /**
   * Set Properties deferred so that callbacks are not invoked while the QuadrilateralShapeModel has bad transient
   * state while other Property values are being calculated.
   */
  setPropertiesDeferred(deferred) {
    assert && assert(deferred !== this.propertiesDeferred, 'deferred state must be changing, you may have not un-deferred Properties');
    this.propertiesDeferred = deferred;

    // set deferred for all Properties first so that their values are up-to-date by the time we call listeners
    const deferredVertexListeners = this.vertices.map(vertex => vertex.setPropertiesDeferred(deferred));

    // call any deferred callbacks if no longer deferred
    deferredVertexListeners.forEach(deferredListener => deferredListener && deferredListener());
  }

  /**
   * Reset the shape by resetting vertices. Defer update of Properties so that Properties do not
   * call listeners until all Vertices have been repositioned.
   */
  reset() {
    // set necessary Properties deferred so that we can update everything together
    this.setPropertiesDeferred(true);
    this.vertexA.reset();
    this.vertexB.reset();
    this.vertexC.reset();
    this.vertexD.reset();

    // no longer deferred, invoke callbacks and update order dependent Properties
    this.setPropertiesDeferred(false);
    this.updateOrderDependentProperties();
  }

  /**
   * Reset the shape AND indicate that a reset is in progress (which will disable certain view feedback.
   * Use this when just resetting the QuadrilateralShapeModel without resetting the full QuadrilateralShapeModel.
   */
  isolatedReset() {
    this.resetNotInProgressProperty.value = false;
    this.reset();
    this.resetNotInProgressProperty.value = true;
  }

  /**
   * Returns true when the provided QuadrilateralShapeModel has every vertex contained within model bounds.
   * @param shapeModel
   */
  static areQuadrilateralVerticesInBounds(shapeModel) {
    return _.every(shapeModel.vertices, vertex => {
      return QuadrilateralConstants.MODEL_BOUNDS.containsBounds(vertex.modelBoundsProperty.value);
    });
  }

  /**
   * Returns true if the quadrilateral shape is NOT crossed. The quadrilateral shape is usually valid when not crossed,
   * so returning this value makes logic easier at usage sites.
   */
  static isQuadrilateralShapeNotCrossed(shapeModel) {
    let shapeCrossed = true;
    for (let i = 0; i < shapeModel.vertices.length; i++) {
      const testVertex = shapeModel.vertices[i];

      // Make sure that no vertices overlap any other.
      if (shapeCrossed) {
        for (let j = 0; j < shapeModel.vertices.length; j++) {
          const otherVertex = shapeModel.vertices[j];
          if (testVertex !== otherVertex) {
            shapeCrossed = !testVertex.overlapsOther(otherVertex);
            if (!shapeCrossed) {
              break;
            }
          }
        }
      }

      // Make sure that no vertices overlap a side.
      if (shapeCrossed) {
        for (let j = 0; j < shapeModel.sides.length; j++) {
          const side = shapeModel.sides[j];
          if (!side.includesVertex(testVertex)) {
            shapeCrossed = !side.shapeProperty.value.intersectsBounds(testVertex.modelBoundsProperty.value);
            if (!shapeCrossed) {
              break;
            }
          }
        }
      }

      // Make sure the QuadrilateralVertex is within the drag area Shape.
      if (shapeCrossed) {
        assert && assert(testVertex.dragAreaProperty.value, 'Drag area must be defined for the QuadrilateralVertex');
        shapeCrossed = QuadrilateralUtils.customShapeContainsPoint(testVertex.dragAreaProperty.value, testVertex.positionProperty.value);
      }

      // Quadrilateral is not allowed, no need to keep testing
      if (!shapeCrossed) {
        break;
      }
    }
    return shapeCrossed;
  }

  /**
   * Returns true if the current quadrilateral shape is allowed based on the rules of this model.
   *
   * A QuadrilateralVertex cannot overlap any other.
   * A QuadrilateralVertex cannot overlap any QuadrilateralSide.
   * A QuadrilateralVertex cannot go outside model bounds.
   * A QuadrilateralVertex cannot to outside its defined drag Shape (which prevents crossed Quadrilaterals).
   *
   * As soon as the quadrilateral is found to be disallowed, we break out of testing.
   */
  static isQuadrilateralShapeAllowed(shapeModel) {
    let shapeAllowed = true;

    // All vertices must be completely within model bounds.
    shapeAllowed = QuadrilateralShapeModel.areQuadrilateralVerticesInBounds(shapeModel);

    // If all vertices are in bounds, look for crossed shapes (more computationally expensive).
    if (shapeAllowed) {
      shapeAllowed = QuadrilateralShapeModel.isQuadrilateralShapeNotCrossed(shapeModel);
    }
    return shapeAllowed;
  }

  /**
   * Returns the tolerance interval to use for a value. Generally, the default value will be returned. If the sim is
   * running while connected to a prototype device (?deviceConnection) or in a mode where all step sizes are reduced,
   * the value will be further reduced by scale factors provided by query parameter.
   */
  static getWidenedToleranceInterval(defaultValue) {
    let interval = defaultValue;

    // Note that both cases are possible and the scale factors compound!
    if (QuadrilateralQueryParameters.reducedStepSize) {
      interval = interval * QuadrilateralQueryParameters.reducedStepSizeToleranceIntervalScaleFactor;
    }
    if (QuadrilateralQueryParameters.deviceConnection) {
      interval = interval * QuadrilateralQueryParameters.connectedToleranceIntervalScaleFactor;
    }
    return interval;
  }

  /**
   * Returns true if two angles are equal within the provided tolerance interval.
   */
  static isAngleEqualToOther(angle1, angle2, toleranceInterval) {
    return Utils.equalsEpsilon(angle1, angle2, toleranceInterval);
  }
}
quadrilateral.register('QuadrilateralShapeModel', QuadrilateralShapeModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJxdWFkcmlsYXRlcmFsIiwiTmFtZWRRdWFkcmlsYXRlcmFsIiwiUXVhZHJpbGF0ZXJhbFNpZGUiLCJRdWFkcmlsYXRlcmFsVmVydGV4IiwiVXRpbHMiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzIiwiUXVhZHJpbGF0ZXJhbFZlcnRleExhYmVsIiwib3B0aW9uaXplIiwiVGFuZGVtIiwiUGFyYWxsZWxTaWRlQ2hlY2tlciIsIkVudW1lcmF0aW9uUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJRdWFkcmlsYXRlcmFsU2hhcGVEZXRlY3RvciIsIlF1YWRyaWxhdGVyYWxTaWRlUGFpciIsIlF1YWRyaWxhdGVyYWxWZXJ0ZXhQYWlyIiwiUXVhZHJpbGF0ZXJhbFV0aWxzIiwiUXVhZHJpbGF0ZXJhbFNpZGVMYWJlbCIsIlF1YWRyaWxhdGVyYWxDb25zdGFudHMiLCJRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCIsImNvbnN0cnVjdG9yIiwicmVzZXROb3RJblByb2dyZXNzUHJvcGVydHkiLCJzbW9vdGhpbmdMZW5ndGhQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ2YWxpZGF0ZVNoYXBlIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJfaXNQYXJhbGxlbG9ncmFtIiwiX2FyZUFsbEFuZ2xlc1JpZ2h0IiwiX2FyZUFsbExlbmd0aHNFcXVhbCIsInZlcnRleEEiLCJWRVJURVhfQSIsImNyZWF0ZVRhbmRlbSIsInZlcnRleEIiLCJWRVJURVhfQiIsInZlcnRleEMiLCJWRVJURVhfQyIsInZlcnRleEQiLCJWRVJURVhfRCIsInZlcnRpY2VzIiwib3Bwb3NpdGVWZXJ0ZXhNYXAiLCJNYXAiLCJhZGphY2VudFZlcnRleE1hcCIsInNpZGVBQiIsIlNJREVfQUIiLCJzaWRlQkMiLCJTSURFX0JDIiwic2lkZUNEIiwiU0lERV9DRCIsInNpZGVEQSIsIlNJREVfREEiLCJzaWRlcyIsIm9wcG9zaXRlU2lkZU1hcCIsImFkamFjZW50U2lkZU1hcCIsImFkamFjZW50RXF1YWxWZXJ0ZXhQYWlyc1Byb3BlcnR5Iiwib3Bwb3NpdGVFcXVhbFZlcnRleFBhaXJzUHJvcGVydHkiLCJhZGphY2VudEVxdWFsU2lkZVBhaXJzUHJvcGVydHkiLCJvcHBvc2l0ZUVxdWFsU2lkZVBhaXJzUHJvcGVydHkiLCJwYXJhbGxlbFNpZGVQYWlyc1Byb3BlcnR5IiwiY29ubmVjdFRvU2lkZSIsInNoYXBlTmFtZVByb3BlcnR5IiwiQ09OVkVYX1FVQURSSUxBVEVSQUwiLCJhcmVhUHJvcGVydHkiLCJzaGFwZUNoYW5nZWRFbWl0dGVyIiwiaW50ZXJBbmdsZVRvbGVyYW5jZUludGVydmFsIiwiZ2V0V2lkZW5lZFRvbGVyYW5jZUludGVydmFsIiwic3RhdGljQW5nbGVUb2xlcmFuY2VJbnRlcnZhbCIsImludGVyTGVuZ3RoVG9sZXJhbmNlSW50ZXJ2YWwiLCJzaWRlQUJTaWRlQ0RQYXJhbGxlbFNpZGVDaGVja2VyIiwic2lkZUJDU2lkZURBUGFyYWxsZWxTaWRlQ2hlY2tlciIsInBhcmFsbGVsU2lkZUNoZWNrZXJzIiwicHJvcGVydGllc0RlZmVycmVkIiwibXVsdGlsaW5rIiwicG9zaXRpb25Qcm9wZXJ0eSIsInBvc2l0aW9uMSIsInBvc2l0aW9uMiIsInBvc2l0aW9uMyIsInBvc2l0aW9uNCIsInVwZGF0ZU9yZGVyRGVwZW5kZW50UHJvcGVydGllcyIsImVtaXQiLCJzZXRWZXJ0ZXhEcmFnQXJlYXMiLCJmb3JFYWNoIiwidmVydGV4IiwibW9kZWxCb3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJ2ZXJ0ZXhCb3VuZHMiLCJoYWxmU21hbGxlc3RJbnRlcnZhbCIsIk1JTk9SX1JFRFVDRURfU0laRV9WRVJURVhfSU5URVJWQUwiLCJ0b3BDb25zdHJhaW5lZFByb3BlcnR5IiwidmFsdWUiLCJlcXVhbHNFcHNpbG9uIiwibWF4WSIsIk1PREVMX0JPVU5EUyIsInJpZ2h0Q29uc3RyYWluZWRQcm9wZXJ0eSIsIm1heFgiLCJib3R0b21Db25zdHJhaW5lZFByb3BlcnR5IiwibWluWSIsImxlZnRDb25zdHJhaW5lZFByb3BlcnR5IiwibWluWCIsImdldEFyZUFsbEFuZ2xlc1JpZ2h0IiwidXBkYXRlQXJlQWxsQW5nbGVzUmlnaHQiLCJfIiwiZXZlcnkiLCJpc1JpZ2h0QW5nbGUiLCJhbmdsZVByb3BlcnR5IiwiZ2V0QXJlQWxsTGVuZ3Roc0VxdWFsIiwidXBkYXRlQXJlQWxsTGVuZ3Roc0VxdWFsIiwiaXNJbnRlckxlbmd0aEVxdWFsVG9PdGhlciIsImxlbmd0aFByb3BlcnR5IiwiZ2V0QXJlYSIsImEiLCJiIiwiYyIsImQiLCJmaXJzdEFuZ2xlIiwic2Vjb25kQW5nbGUiLCJzIiwiY29zQXJnIiwiTWF0aCIsImNvcyIsImFyZWEiLCJzcXJ0IiwiaXNBcmVhTmFOIiwiaXNOYU4iLCJhc3NlcnQiLCJpc0ludGVyQW5nbGVFcXVhbFRvT3RoZXIiLCJhbmdsZTEiLCJhbmdsZTIiLCJsZW5ndGgxIiwibGVuZ3RoMiIsImFuZ2xlIiwiUEkiLCJpc1BhcmFsbGVsb2dyYW0iLCJpc1N0YXRpY0FuZ2xlRXF1YWxUb090aGVyIiwib3RoZXJBbmdsZSIsImlzRmxhdEFuZ2xlIiwic2V0VmVydGV4UG9zaXRpb25zIiwibGFiZWxUb1Bvc2l0aW9uTWFwIiwic2V0UHJvcGVydGllc0RlZmVycmVkIiwicG9zaXRpb25WYWx1ZSIsImxhYmVsS2V5IiwiZ2V0TGFiZWxsZWRWZXJ0ZXgiLCJlcXVhbHMiLCJ1cGRhdGVBbmdsZSIsInNpZGUiLCJ1cGRhdGVMZW5ndGhBbmRTaGFwZSIsInVwZGF0ZVBhcmFsbGVsU2lkZVByb3BlcnRpZXMiLCJ1cGRhdGVWZXJ0ZXhBbmdsZUNvbXBhcmlzb25zIiwidXBkYXRlU2lkZUxlbmd0aENvbXBhcmlzb25zIiwic2V0IiwiZ2V0U2hhcGVOYW1lIiwidXBkYXRlRXF1YWxWZXJ0ZXhQYWlycyIsImVxdWFsVmVydGV4UGFpcnNQcm9wZXJ0eSIsInZlcnRleE1hcCIsImN1cnJlbnRWZXJ0ZXhQYWlycyIsInJlbGF0ZWRWZXJ0aWNlcyIsImtleVZlcnRleCIsIm1hcCIsInJlbGF0ZWRWZXJ0aWNlc0FycmF5IiwiQXJyYXkiLCJpc0FycmF5IiwicmVsYXRlZFZlcnRleCIsInZlcnRleFBhaXIiLCJjb21wb25lbnQxIiwiY29tcG9uZW50MiIsImFyZUFuZ2xlc0VxdWFsIiwiaW5kZXhPZlZlcnRleFBhaXIiLCJmaW5kSW5kZXgiLCJjdXJyZW50VmVydGV4UGFpciIsImN1cnJlbnRseUluY2x1ZGVzVmVydGV4UGFpciIsInNwbGljZSIsIm5vdGlmeUxpc3RlbmVyc1N0YXRpYyIsInB1c2giLCJ1cGRhdGVFcXVhbFNpZGVQYWlycyIsImVxdWFsU2lkZVBhaXJzUHJvcGVydHkiLCJzaWRlTWFwIiwiY3VycmVudFNpZGVQYWlycyIsInJlbGF0ZWRTaWRlcyIsImtleVNpZGUiLCJyZWxhdGVkU2lkZXNBcnJheSIsInJlbGF0ZWRTaWRlIiwic2lkZVBhaXIiLCJmaXJzdExlbmd0aCIsInNlY29uZExlbmd0aCIsImFyZUxlbmd0aHNFcXVhbCIsImluZGV4T2ZTaWRlUGFpciIsImN1cnJlbnRTaWRlUGFpciIsImN1cnJlbnRseUluY2x1ZGVzU2lkZVBhaXIiLCJzaWRlQUJTaWRlQ0RQYXJhbGxlbCIsImFyZVNpZGVzUGFyYWxsZWwiLCJzaWRlQkNTaWRlREFQYXJhbGxlbCIsInByZXZpb3VzUGFyYWxsZWxTaWRlUGFpcnMiLCJjdXJyZW50UGFyYWxsZWxTaWRlUGFpcnMiLCJpc0VxdWFsIiwic2V0RnJvbVNoYXBlIiwib3RoZXIiLCJ2ZXJ0ZXhMYWJlbCIsImxhYmVsbGVkVmVydGV4IiwiZmluZCIsImRpbGF0ZWRCb3VuZHMiLCJkaWxhdGVkIiwiZHJhZ0FyZWFQcm9wZXJ0eSIsImNyZWF0ZVZlcnRleEFyZWEiLCJkZWZlcnJlZCIsImRlZmVycmVkVmVydGV4TGlzdGVuZXJzIiwiZGVmZXJyZWRMaXN0ZW5lciIsInJlc2V0IiwiaXNvbGF0ZWRSZXNldCIsImFyZVF1YWRyaWxhdGVyYWxWZXJ0aWNlc0luQm91bmRzIiwic2hhcGVNb2RlbCIsImNvbnRhaW5zQm91bmRzIiwiaXNRdWFkcmlsYXRlcmFsU2hhcGVOb3RDcm9zc2VkIiwic2hhcGVDcm9zc2VkIiwiaSIsImxlbmd0aCIsInRlc3RWZXJ0ZXgiLCJqIiwib3RoZXJWZXJ0ZXgiLCJvdmVybGFwc090aGVyIiwiaW5jbHVkZXNWZXJ0ZXgiLCJzaGFwZVByb3BlcnR5IiwiaW50ZXJzZWN0c0JvdW5kcyIsImN1c3RvbVNoYXBlQ29udGFpbnNQb2ludCIsImlzUXVhZHJpbGF0ZXJhbFNoYXBlQWxsb3dlZCIsInNoYXBlQWxsb3dlZCIsImRlZmF1bHRWYWx1ZSIsImludGVydmFsIiwicmVkdWNlZFN0ZXBTaXplIiwicmVkdWNlZFN0ZXBTaXplVG9sZXJhbmNlSW50ZXJ2YWxTY2FsZUZhY3RvciIsImRldmljZUNvbm5lY3Rpb24iLCJjb25uZWN0ZWRUb2xlcmFuY2VJbnRlcnZhbFNjYWxlRmFjdG9yIiwiaXNBbmdsZUVxdWFsVG9PdGhlciIsInRvbGVyYW5jZUludGVydmFsIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIG1vZGVsIGNvbXBvbmVudCBmb3IgdGhlIGNvbXBvbmVudHMgb2YgdGhlIGFjdHVhbCBxdWFkcmlsYXRlcmFsIGdlb21ldHJ5L3NoYXBlLiBUaGlzIGluY2x1ZGVzIHN1YmNvbXBvbmVudHNcclxuICogZm9yIHZlcnRpY2VzIGFuZCBzaWRlcy4gSXQgYWxzbyBob2xkcyBzdGF0ZSBmb3IgZ2VvbWV0cmljIHByb3BlcnRpZXMgc3VjaCBhcyBzaGFwZSBhcmVhLCBwYWlycyBvZiBlcXVhbCBzaWRlXHJcbiAqIGxlbmd0aHMsIHZlcnRleCBhbmdsZXMsIGFuZCBwYXJhbGxlbCBzaWRlcy5cclxuICpcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBxdWFkcmlsYXRlcmFsIGZyb20gJy4uLy4uL3F1YWRyaWxhdGVyYWwuanMnO1xyXG5pbXBvcnQgTmFtZWRRdWFkcmlsYXRlcmFsIGZyb20gJy4vTmFtZWRRdWFkcmlsYXRlcmFsLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxTaWRlIGZyb20gJy4vUXVhZHJpbGF0ZXJhbFNpZGUuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFZlcnRleCBmcm9tICcuL1F1YWRyaWxhdGVyYWxWZXJ0ZXguanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9RdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCBmcm9tICcuL1F1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBQYXJhbGxlbFNpZGVDaGVja2VyIGZyb20gJy4vUGFyYWxsZWxTaWRlQ2hlY2tlci5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFNoYXBlRGV0ZWN0b3IgZnJvbSAnLi9RdWFkcmlsYXRlcmFsU2hhcGVEZXRlY3Rvci5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsU2lkZVBhaXIgZnJvbSAnLi9RdWFkcmlsYXRlcmFsU2lkZVBhaXIuanMnO1xyXG5pbXBvcnQgUXVhZHJpbGF0ZXJhbFZlcnRleFBhaXIgZnJvbSAnLi9RdWFkcmlsYXRlcmFsVmVydGV4UGFpci5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsVXRpbHMgZnJvbSAnLi9RdWFkcmlsYXRlcmFsVXRpbHMuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsU2lkZUxhYmVsIGZyb20gJy4vUXVhZHJpbGF0ZXJhbFNpZGVMYWJlbC5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzIGZyb20gJy4uLy4uL1F1YWRyaWxhdGVyYWxDb25zdGFudHMuanMnO1xyXG5cclxuLy8gVXNlZCB3aGVuIHZlcmlmeWluZyB0aGF0IFF1YWRyaWxhdGVyYWxWZXJ0ZXggcG9zaXRpb25zIGFyZSB2YWxpZCBiZWZvcmUgc2V0dGluZyB0byB0aGUgbW9kZWwuXHJcbmV4cG9ydCB0eXBlIFZlcnRleExhYmVsVG9Qcm9wb3NlZFBvc2l0aW9uTWFwID0gTWFwPFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCwgVmVjdG9yMj47XHJcblxyXG50eXBlIFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhlIHNoYXBlIGdldHMgdGVzdGVkIHRvIG1ha2Ugc3VyZSBpdCBpcyB2YWxpZC4gVGhpcyBtZWFucyBubyBvdmVybGFwcGluZyB2ZXJ0aWNlcyBhbmQgbm8gY3Jvc3NlZFxyXG4gIC8vIHNpZGVzLlxyXG4gIHZhbGlkYXRlU2hhcGU/OiBib29sZWFuO1xyXG4gIHRhbmRlbT86IFRhbmRlbTtcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsIHtcclxuXHJcbiAgLy8gVmVydGljZXMgb2YgdGhlIHF1YWRyaWxhdGVyYWwuXHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRleEE6IFF1YWRyaWxhdGVyYWxWZXJ0ZXg7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRleEI6IFF1YWRyaWxhdGVyYWxWZXJ0ZXg7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRleEM6IFF1YWRyaWxhdGVyYWxWZXJ0ZXg7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRleEQ6IFF1YWRyaWxhdGVyYWxWZXJ0ZXg7XHJcbiAgcHVibGljIHJlYWRvbmx5IHZlcnRpY2VzOiByZWFkb25seSBRdWFkcmlsYXRlcmFsVmVydGV4W107XHJcblxyXG4gIC8vIFNpZGVzIG9mIHRoZSBxdWFkcmlsYXRlcmFsLlxyXG4gIHB1YmxpYyByZWFkb25seSBzaWRlQUI6IFF1YWRyaWxhdGVyYWxTaWRlO1xyXG4gIHB1YmxpYyByZWFkb25seSBzaWRlQkM6IFF1YWRyaWxhdGVyYWxTaWRlO1xyXG4gIHB1YmxpYyByZWFkb25seSBzaWRlQ0Q6IFF1YWRyaWxhdGVyYWxTaWRlO1xyXG4gIHB1YmxpYyByZWFkb25seSBzaWRlREE6IFF1YWRyaWxhdGVyYWxTaWRlO1xyXG4gIHB1YmxpYyByZWFkb25seSBzaWRlczogcmVhZG9ubHkgUXVhZHJpbGF0ZXJhbFNpZGVbXTtcclxuXHJcbiAgLy8gTW9uaXRvcnMgYW5nbGVzIG9mIHRoZSBzaGFwZSB0byBkZXRlcm1pbmUgd2hlbiBwYWlycyBvZiBvcHBvc2l0ZSBzaWRlcyBhcmUgcGFyYWxsZWwuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNpZGVBQlNpZGVDRFBhcmFsbGVsU2lkZUNoZWNrZXI6IFBhcmFsbGVsU2lkZUNoZWNrZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNpZGVCQ1NpZGVEQVBhcmFsbGVsU2lkZUNoZWNrZXI6IFBhcmFsbGVsU2lkZUNoZWNrZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBhcmFsbGVsU2lkZUNoZWNrZXJzOiByZWFkb25seSBQYXJhbGxlbFNpZGVDaGVja2VyW107XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHF1YWRyaWxhdGVyYWwgaXMgYSBwYXJhbGxlbG9ncmFtLlxyXG4gIHByaXZhdGUgX2lzUGFyYWxsZWxvZ3JhbTogYm9vbGVhbjtcclxuXHJcbiAgLy8gVHJ1ZSB3aGVuIGFsbCBhbmdsZXMgb2YgdGhlIHF1YWRyaWxhdGVyYWwgYXJlIHJpZ2h0IGFuZ2xlcyB3aXRoaW4gaW50ZXJBbmdsZVRvbGVyYW5jZUludGVydmFsLlxyXG4gIHByaXZhdGUgX2FyZUFsbEFuZ2xlc1JpZ2h0OiBib29sZWFuO1xyXG5cclxuICAvLyBUcnVlIHdoZW4gYWxsIGxlbmd0aHMgb2YgdGhlIHF1YWRyaWxhdGVyYWwgYXJlIGVxdWFsIHdpdGhpbiB0aGUgbGVuZ3RoVG9sZXJhbmNlSW50ZXJ2YWwuXHJcbiAgcHJpdmF0ZSBfYXJlQWxsTGVuZ3Roc0VxdWFsOiBib29sZWFuO1xyXG5cclxuICAvLyBUaGUgYXJlYSBvZiB0aGUgcXVhZHJpbGF0ZXJhbC4gVXBkYXRlZCBpbiBcImRlZmVycmVkXCIgUHJvcGVydGllcywgb25seSBhZnRlciBwb3NpdGlvbnMgb2YgYWxsIGZvdXIgdmVydGljZXMgYXJlXHJcbiAgLy8gZGV0ZXJtaW5lZC5cclxuICBwdWJsaWMgcmVhZG9ubHkgYXJlYVByb3BlcnR5OiBUUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gVGhlIHRvbGVyYW5jZSBpbnRlcnZhbHMgZm9yIGFuZ2xlIGFuZCBsZW5ndGggY29tcGFyaXNvbnMgd2hlbiBjb21wYXJpbmcgdHdvIGFuZ2xlL2xlbmd0aHMgd2l0aCBvbmUgYW5vdGhlci5cclxuICAvLyBUaGVzZSB2YWx1ZXMgYXJlIGdlbmVyYWxseSBsYXJnZXIgdGhhbiBcInN0YXRpY1wiIGFuZ2xlIHRvbGVyYW5jZSBpbnRlcnZhbHMgdG8gYWNjb3VudCBmb3IgY29tcG91bmRpbmcgZXJyb3JcclxuICAvLyB3aGVuIGNvbXBhcmluZyBhbmdsZXMuIEZvciBleGFtcGxlLCB3ZSB3YW50IGEgYml0IG1vcmUgZmxleGliaWxpdHkgd2hlbiBjb21wYXJpbmcgYW5nbGVzIG9mIGEgdHJhcGV6b2lkIG9yIGVsc2VcclxuICAvLyBpdCB3b3VsZCBiZSBpbmNyZWRpYmx5IGRpZmZpY3VsdCB0byBmaW5kIHRoYXQgc2hhcGUuXHJcbiAgcHVibGljIHJlYWRvbmx5IGludGVyQW5nbGVUb2xlcmFuY2VJbnRlcnZhbDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBpbnRlckxlbmd0aFRvbGVyYW5jZUludGVydmFsOiBudW1iZXI7XHJcblxyXG4gIC8vIFRoZSB0b2xlcmFuY2UgaW50ZXJ2YWwgZm9yIGFuZ2xlIGNvbXBhcmlzb25zIHdoZW4gY29tcGFyaW5nIGEgdmVydGV4IGFuZ2xlIHdpdGggYSBzdGF0aWMgdmFsdWUuIFRoaXNcclxuICAvLyB0b2xlcmFuY2UgaW50ZXJ2YWwgd2lsbCBnZW5lcmFsbHkgYmUgc21hbGxlciB0aGFuIHRoZSBcImludGVyXCIgaW50ZXJ2YWxzIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCBtdWNoIHdpZ2dsZSByb29tXHJcbiAgLy8gd2hlbiBkZXRlY3RpbmcgY3JpdGljYWwgYW5nbGVzLiBGb3IgZXhhbXBsZSwgdGhlIGFuZ2xlIG5lZWRzIHRvIGJlIHZlcnkgY2xvc2UgdG8gTWF0aC5QSSAvIDIgdG8gYmUgY29uc2lkZXJlZFxyXG4gIC8vIGEgXCJyaWdodCBhbmdsZVwiIGFuZCBtYWtlIHRoZSBcInJpZ2h0IGFuZ2xlIGluZGljYXRvcnNcIiBhcHBlYXIuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0YXRpY0FuZ2xlVG9sZXJhbmNlSW50ZXJ2YWw6IG51bWJlcjtcclxuXHJcbiAgLy8gRW1pdHMgYW4gZXZlbnQgd2hlbmV2ZXIgdGhlIHNoYXBlIG9mIHRoZSBRdWFkcmlsYXRlcmFsIGNoYW5nZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgc2hhcGVDaGFuZ2VkRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIC8vIFRoZSBuYW1lIG9mIHRoZSBxdWFkcmlsYXRlcmFsIChsaWtlIHNxdWFyZS9yaG9tYnVzL3RyYXBlem9pZCwgZXRjKS4gV2lsbCBiZSBudWxsIGlmIGl0IGlzIGEgcmFuZG9tXHJcbiAgLy8gdW5uYW1lZCBzaGFwZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2hhcGVOYW1lUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8TmFtZWRRdWFkcmlsYXRlcmFsPjtcclxuXHJcbiAgLy8gQSBtYXAgdGhhdCBwcm92aWRlcyB0aGUgYWRqYWNlbnQgdmVydGljZXMgdG8gdGhlIHByb3ZpZGVkIFF1YWRyaWxhdGVyYWxWZXJ0ZXguXHJcbiAgcHVibGljIHJlYWRvbmx5IGFkamFjZW50VmVydGV4TWFwOiBNYXA8UXVhZHJpbGF0ZXJhbFZlcnRleCwgUXVhZHJpbGF0ZXJhbFZlcnRleFtdPjtcclxuXHJcbiAgLy8gQSBtYXAgdGhhdCBwcm92aWRlcyB0aGUgb3Bwb3NpdGUgdmVydGV4IGZyb20gYSBnaXZlIHZlcnRleC5cclxuICBwdWJsaWMgcmVhZG9ubHkgb3Bwb3NpdGVWZXJ0ZXhNYXA6IE1hcDxRdWFkcmlsYXRlcmFsVmVydGV4LCBRdWFkcmlsYXRlcmFsVmVydGV4PjtcclxuXHJcbiAgLy8gQSBtYXAgdGhhdCBwcm92aWRlcyB0aGUgYWRqYWNlbnQgc2lkZXMgdG8gdGhlIHByb3ZpZGVkIFF1YWRyaWxhdGVyYWxTaWRlLlxyXG4gIHB1YmxpYyByZWFkb25seSBhZGphY2VudFNpZGVNYXA6IE1hcDxRdWFkcmlsYXRlcmFsU2lkZSwgUXVhZHJpbGF0ZXJhbFNpZGVbXT47XHJcblxyXG4gIC8vIEEgbWFwIHRoYXQgcHJvdmlkZXMgdGhlIG9wcG9zaXRlIHNpZGUgZnJvbSB0aGUgcHJvdmlkZWQgUXVhZHJpbGF0ZXJhbFNpZGUuXHJcbiAgcHVibGljIHJlYWRvbmx5IG9wcG9zaXRlU2lkZU1hcDogTWFwPFF1YWRyaWxhdGVyYWxTaWRlLCBRdWFkcmlsYXRlcmFsU2lkZT47XHJcblxyXG4gIC8vIEFuIGFycmF5IG9mIGFsbCB0aGUgYWRqYWNlbnQgVmVydGV4UGFpcnMgdGhhdCBjdXJyZW50bHkgaGF2ZSBlcXVhbCBhbmdsZXMuXHJcbiAgcHVibGljIHJlYWRvbmx5IGFkamFjZW50RXF1YWxWZXJ0ZXhQYWlyc1Byb3BlcnR5OiBQcm9wZXJ0eTxRdWFkcmlsYXRlcmFsVmVydGV4UGFpcltdPjtcclxuXHJcbiAgLy8gQW4gYXJyYXkgb2YgYWxsIHRoZSBvcHBvc2l0ZSBWZXJ0ZXhQYWlycyB0aGF0IGN1cnJlbnRseSBoYXZlIGVxdWFsIGFuZ2xlcy5cclxuICBwdWJsaWMgcmVhZG9ubHkgb3Bwb3NpdGVFcXVhbFZlcnRleFBhaXJzUHJvcGVydHk6IFByb3BlcnR5PFF1YWRyaWxhdGVyYWxWZXJ0ZXhQYWlyW10+O1xyXG5cclxuICAvLyBBbiBhcnJheSBvZiBhbGwgdGhlIGFkamFjZW50IFNpZGVQYWlycyB0aGF0IGhhdmUgZXF1YWwgbGVuZ3Rocy5cclxuICBwdWJsaWMgcmVhZG9ubHkgYWRqYWNlbnRFcXVhbFNpZGVQYWlyc1Byb3BlcnR5OiBQcm9wZXJ0eTxRdWFkcmlsYXRlcmFsU2lkZVBhaXJbXT47XHJcblxyXG4gIC8vIEFuIGFycmF5IG9mIGFsbCB0aGUgb3Bwb3NpdGUgU2lkZVBhaXJzIHRoYXQgaGF2ZSBlcXVhbCBzaWRlIGxlbmd0aHMuXHJcbiAgcHVibGljIHJlYWRvbmx5IG9wcG9zaXRlRXF1YWxTaWRlUGFpcnNQcm9wZXJ0eTogUHJvcGVydHk8UXVhZHJpbGF0ZXJhbFNpZGVQYWlyW10+O1xyXG5cclxuICAvLyBBbiBhcnJheSBvZiBhbGwgdGhlIChvcHBvc2l0ZSkgU2lkZVBhaXJzIHRoYXQgY3VycmVudGx5IHBhcmFsbGVsIHdpdGggZWFjaCBvdGhlci5cclxuICBwdWJsaWMgcmVhZG9ubHkgcGFyYWxsZWxTaWRlUGFpcnNQcm9wZXJ0eTogUHJvcGVydHk8UXVhZHJpbGF0ZXJhbFNpZGVQYWlyW10+O1xyXG5cclxuICAvLyBJcyB0aGUgc2ltdWxhdGlvbiAqbm90KiBiZWluZyByZXNldD9cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlc2V0Tm90SW5Qcm9ncmVzc1Byb3BlcnR5OiBUUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFRydWUgd2hlbiB0aGUgUHJvcGVydGllcyBvZiB0aGUgc2hhcGUgYXJlIGN1cnJlbnRseSBiZWluZyBkZWZlcnJlZCwgcHJldmVudGluZyBsaXN0ZW5lcnMgZnJvbSBiZWluZyBjYWxsZWQgYW5kXHJcbiAgLy8gbmV3IHZhbHVlcyBmcm9tIGJlaW5nIHNldC5cclxuICBwcml2YXRlIHByb3BlcnRpZXNEZWZlcnJlZDogYm9vbGVhbjtcclxuXHJcbiAgLy8gSWYgdHJ1ZSwgdGhlIHNoYXBlIGlzIHRlc3RlZCB0byBtYWtlIHN1cmUgaXQgaXMgdmFsaWQgKG5vIG92ZXJsYXBwaW5nIHZlcnRpY2VzIG9yIGNyb3NzZWQgc2lkZXMpLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmFsaWRhdGVTaGFwZTogYm9vbGVhbjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByZXNldE5vdEluUHJvZ3Jlc3NQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+LCBzbW9vdGhpbmdMZW5ndGhQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8UXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWxPcHRpb25zLCBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbE9wdGlvbnM+KCkoIHtcclxuICAgICAgdmFsaWRhdGVTaGFwZTogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMudmFsaWRhdGVTaGFwZSA9IG9wdGlvbnMudmFsaWRhdGVTaGFwZTtcclxuXHJcbiAgICB0aGlzLl9pc1BhcmFsbGVsb2dyYW0gPSBmYWxzZTtcclxuICAgIHRoaXMuX2FyZUFsbEFuZ2xlc1JpZ2h0ID0gZmFsc2U7XHJcbiAgICB0aGlzLl9hcmVBbGxMZW5ndGhzRXF1YWwgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnZlcnRleEEgPSBuZXcgUXVhZHJpbGF0ZXJhbFZlcnRleCggbmV3IFZlY3RvcjIoIC0wLjI1LCAwLjI1ICksIFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbC5WRVJURVhfQSwgc21vb3RoaW5nTGVuZ3RoUHJvcGVydHksIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlcnRleEEnICkgKTtcclxuICAgIHRoaXMudmVydGV4QiA9IG5ldyBRdWFkcmlsYXRlcmFsVmVydGV4KCBuZXcgVmVjdG9yMiggMC4yNSwgMC4yNSApLCBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwuVkVSVEVYX0IsIHNtb290aGluZ0xlbmd0aFByb3BlcnR5LCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2ZXJ0ZXhCJyApICk7XHJcbiAgICB0aGlzLnZlcnRleEMgPSBuZXcgUXVhZHJpbGF0ZXJhbFZlcnRleCggbmV3IFZlY3RvcjIoIDAuMjUsIC0wLjI1ICksIFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbC5WRVJURVhfQywgc21vb3RoaW5nTGVuZ3RoUHJvcGVydHksIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlcnRleEMnICkgKTtcclxuICAgIHRoaXMudmVydGV4RCA9IG5ldyBRdWFkcmlsYXRlcmFsVmVydGV4KCBuZXcgVmVjdG9yMiggLTAuMjUsIC0wLjI1ICksIFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbC5WRVJURVhfRCwgc21vb3RoaW5nTGVuZ3RoUHJvcGVydHksIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlcnRleEQnICkgKTtcclxuICAgIHRoaXMudmVydGljZXMgPSBbIHRoaXMudmVydGV4QSwgdGhpcy52ZXJ0ZXhCLCB0aGlzLnZlcnRleEMsIHRoaXMudmVydGV4RCBdO1xyXG5cclxuICAgIHRoaXMub3Bwb3NpdGVWZXJ0ZXhNYXAgPSBuZXcgTWFwKCBbXHJcbiAgICAgIFsgdGhpcy52ZXJ0ZXhBLCB0aGlzLnZlcnRleEMgXSxcclxuICAgICAgWyB0aGlzLnZlcnRleEIsIHRoaXMudmVydGV4RCBdLFxyXG4gICAgICBbIHRoaXMudmVydGV4QywgdGhpcy52ZXJ0ZXhBIF0sXHJcbiAgICAgIFsgdGhpcy52ZXJ0ZXhELCB0aGlzLnZlcnRleEIgXVxyXG4gICAgXSApO1xyXG5cclxuICAgIHRoaXMuYWRqYWNlbnRWZXJ0ZXhNYXAgPSBuZXcgTWFwKCBbXHJcbiAgICAgIFsgdGhpcy52ZXJ0ZXhBLCBbIHRoaXMudmVydGV4QiwgdGhpcy52ZXJ0ZXhEIF0gXSxcclxuICAgICAgWyB0aGlzLnZlcnRleEIsIFsgdGhpcy52ZXJ0ZXhBLCB0aGlzLnZlcnRleEMgXSBdLFxyXG4gICAgICBbIHRoaXMudmVydGV4QywgWyB0aGlzLnZlcnRleEIsIHRoaXMudmVydGV4RCBdIF0sXHJcbiAgICAgIFsgdGhpcy52ZXJ0ZXhELCBbIHRoaXMudmVydGV4QSwgdGhpcy52ZXJ0ZXhDIF0gXVxyXG4gICAgXSApO1xyXG5cclxuICAgIHRoaXMuc2lkZUFCID0gbmV3IFF1YWRyaWxhdGVyYWxTaWRlKCB0aGlzLnZlcnRleEEsIHRoaXMudmVydGV4QiwgUXVhZHJpbGF0ZXJhbFNpZGVMYWJlbC5TSURFX0FCLCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaWRlQUInICkgKTtcclxuICAgIHRoaXMuc2lkZUJDID0gbmV3IFF1YWRyaWxhdGVyYWxTaWRlKCB0aGlzLnZlcnRleEIsIHRoaXMudmVydGV4QywgUXVhZHJpbGF0ZXJhbFNpZGVMYWJlbC5TSURFX0JDLCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaWRlQkMnICkgKTtcclxuICAgIHRoaXMuc2lkZUNEID0gbmV3IFF1YWRyaWxhdGVyYWxTaWRlKCB0aGlzLnZlcnRleEMsIHRoaXMudmVydGV4RCwgUXVhZHJpbGF0ZXJhbFNpZGVMYWJlbC5TSURFX0NELCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaWRlQ0QnICkgKTtcclxuICAgIHRoaXMuc2lkZURBID0gbmV3IFF1YWRyaWxhdGVyYWxTaWRlKCB0aGlzLnZlcnRleEQsIHRoaXMudmVydGV4QSwgUXVhZHJpbGF0ZXJhbFNpZGVMYWJlbC5TSURFX0RBLCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaWRlREEnICkgKTtcclxuICAgIHRoaXMuc2lkZXMgPSBbIHRoaXMuc2lkZUFCLCB0aGlzLnNpZGVCQywgdGhpcy5zaWRlQ0QsIHRoaXMuc2lkZURBIF07XHJcblxyXG4gICAgdGhpcy5vcHBvc2l0ZVNpZGVNYXAgPSBuZXcgTWFwKCBbXHJcbiAgICAgIFsgdGhpcy5zaWRlQUIsIHRoaXMuc2lkZUNEIF0sXHJcbiAgICAgIFsgdGhpcy5zaWRlQkMsIHRoaXMuc2lkZURBIF0sXHJcbiAgICAgIFsgdGhpcy5zaWRlQ0QsIHRoaXMuc2lkZUFCIF0sXHJcbiAgICAgIFsgdGhpcy5zaWRlREEsIHRoaXMuc2lkZUJDIF1cclxuICAgIF0gKTtcclxuXHJcbiAgICB0aGlzLmFkamFjZW50U2lkZU1hcCA9IG5ldyBNYXAoIFtcclxuICAgICAgWyB0aGlzLnNpZGVBQiwgWyB0aGlzLnNpZGVEQSwgdGhpcy5zaWRlQkMgXSBdLFxyXG4gICAgICBbIHRoaXMuc2lkZUJDLCBbIHRoaXMuc2lkZUFCLCB0aGlzLnNpZGVDRCBdIF0sXHJcbiAgICAgIFsgdGhpcy5zaWRlQ0QsIFsgdGhpcy5zaWRlQkMsIHRoaXMuc2lkZURBIF0gXSxcclxuICAgICAgWyB0aGlzLnNpZGVEQSwgWyB0aGlzLnNpZGVDRCwgdGhpcy5zaWRlQUIgXSBdXHJcbiAgICBdICk7XHJcblxyXG4gICAgdGhpcy5hZGphY2VudEVxdWFsVmVydGV4UGFpcnNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxRdWFkcmlsYXRlcmFsVmVydGV4UGFpcltdPiggW10gKTtcclxuICAgIHRoaXMub3Bwb3NpdGVFcXVhbFZlcnRleFBhaXJzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8UXVhZHJpbGF0ZXJhbFZlcnRleFBhaXJbXT4oIFtdICk7XHJcbiAgICB0aGlzLmFkamFjZW50RXF1YWxTaWRlUGFpcnNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxRdWFkcmlsYXRlcmFsU2lkZVBhaXJbXT4oIFtdICk7XHJcbiAgICB0aGlzLm9wcG9zaXRlRXF1YWxTaWRlUGFpcnNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eTxRdWFkcmlsYXRlcmFsU2lkZVBhaXJbXT4oIFtdICk7XHJcbiAgICB0aGlzLnBhcmFsbGVsU2lkZVBhaXJzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8UXVhZHJpbGF0ZXJhbFNpZGVQYWlyW10+KCBbXSApO1xyXG5cclxuICAgIC8vIENvbm5lY3QgdGhlIHNpZGVzLCBjcmVhdGluZyB0aGUgc2hhcGUgYW5kIGdpdmluZyB2ZXJ0aWNlcyB0aGUgaW5mb3JtYXRpb24gdGhleSBuZWVkIHRvIGNhbGN1bGF0ZSBhbmdsZXMuXHJcbiAgICB0aGlzLnNpZGVCQy5jb25uZWN0VG9TaWRlKCB0aGlzLnNpZGVBQiApO1xyXG4gICAgdGhpcy5zaWRlQ0QuY29ubmVjdFRvU2lkZSggdGhpcy5zaWRlQkMgKTtcclxuICAgIHRoaXMuc2lkZURBLmNvbm5lY3RUb1NpZGUoIHRoaXMuc2lkZUNEICk7XHJcbiAgICB0aGlzLnNpZGVBQi5jb25uZWN0VG9TaWRlKCB0aGlzLnNpZGVEQSApO1xyXG5cclxuICAgIHRoaXMuc2hhcGVOYW1lUHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25Qcm9wZXJ0eSggTmFtZWRRdWFkcmlsYXRlcmFsLkNPTlZFWF9RVUFEUklMQVRFUkFMLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hhcGVOYW1lUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFyZWFQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FyZWFQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc2hhcGVDaGFuZ2VkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFtdPigge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NoYXBlQ2hhbmdlZEVtaXR0ZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmludGVyQW5nbGVUb2xlcmFuY2VJbnRlcnZhbCA9IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLmdldFdpZGVuZWRUb2xlcmFuY2VJbnRlcnZhbCggUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy5pbnRlckFuZ2xlVG9sZXJhbmNlSW50ZXJ2YWwgKTtcclxuICAgIHRoaXMuc3RhdGljQW5nbGVUb2xlcmFuY2VJbnRlcnZhbCA9IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLmdldFdpZGVuZWRUb2xlcmFuY2VJbnRlcnZhbCggUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy5zdGF0aWNBbmdsZVRvbGVyYW5jZUludGVydmFsICk7XHJcbiAgICB0aGlzLmludGVyTGVuZ3RoVG9sZXJhbmNlSW50ZXJ2YWwgPSBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC5nZXRXaWRlbmVkVG9sZXJhbmNlSW50ZXJ2YWwoIFF1YWRyaWxhdGVyYWxRdWVyeVBhcmFtZXRlcnMuaW50ZXJMZW5ndGhUb2xlcmFuY2VJbnRlcnZhbCApO1xyXG5cclxuICAgIHRoaXMuc2lkZUFCU2lkZUNEUGFyYWxsZWxTaWRlQ2hlY2tlciA9IG5ldyBQYXJhbGxlbFNpZGVDaGVja2VyKFxyXG4gICAgICBuZXcgUXVhZHJpbGF0ZXJhbFNpZGVQYWlyKCB0aGlzLnNpZGVBQiwgdGhpcy5zaWRlQ0QgKSxcclxuICAgICAgdGhpcy5zaGFwZUNoYW5nZWRFbWl0dGVyLFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaWRlQUJTaWRlQ0RQYXJhbGxlbFNpZGVDaGVja2VyJyApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuc2lkZUJDU2lkZURBUGFyYWxsZWxTaWRlQ2hlY2tlciA9IG5ldyBQYXJhbGxlbFNpZGVDaGVja2VyKFxyXG4gICAgICBuZXcgUXVhZHJpbGF0ZXJhbFNpZGVQYWlyKCB0aGlzLnNpZGVCQywgdGhpcy5zaWRlREEgKSxcclxuICAgICAgdGhpcy5zaGFwZUNoYW5nZWRFbWl0dGVyLFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaWRlQkNTaWRlREFQYXJhbGxlbFNpZGVDaGVja2VyJyApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMucGFyYWxsZWxTaWRlQ2hlY2tlcnMgPSBbXHJcbiAgICAgIHRoaXMuc2lkZUFCU2lkZUNEUGFyYWxsZWxTaWRlQ2hlY2tlcixcclxuICAgICAgdGhpcy5zaWRlQkNTaWRlREFQYXJhbGxlbFNpZGVDaGVja2VyXHJcbiAgICBdO1xyXG5cclxuICAgIHRoaXMucmVzZXROb3RJblByb2dyZXNzUHJvcGVydHkgPSByZXNldE5vdEluUHJvZ3Jlc3NQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLnByb3BlcnRpZXNEZWZlcnJlZCA9IGZhbHNlO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgICB0aGlzLnZlcnRleEEucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLnZlcnRleEIucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLnZlcnRleEMucG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgICB0aGlzLnZlcnRleEQucG9zaXRpb25Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBvc2l0aW9uMSwgcG9zaXRpb24yLCBwb3NpdGlvbjMsIHBvc2l0aW9uNCApID0+IHtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIGdlb21ldHJpYyBhdHRyaWJ1dGVzIGFmdGVyIFF1YWRyaWxhdGVyYWxWZXJ0ZXggcG9zaXRpb25zIGhhdmUgY2hhbmdlZC5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9yZGVyRGVwZW5kZW50UHJvcGVydGllcygpO1xyXG5cclxuICAgICAgICAvLyBub3RpZnkgYSBjaGFuZ2UgaW4gc2hhcGUsIGFmdGVyIHVwZGF0aW5nIGdlb21ldHJpYyBhdHRyaWJ1dGVzXHJcbiAgICAgICAgdGhpcy5zaGFwZUNoYW5nZWRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAgICAgLy8gQWZ0ZXIgdGhlIHNoYXBlIGhhcyBjaGFuZ2VkLCB1cGRhdGUgdGhlIGFyZWFzIG9mIGFsbG93ZWQgbW90aW9uIGZvciBlYWNoIFF1YWRyaWxhdGVyYWxWZXJ0ZXguXHJcbiAgICAgICAgdGhpcy5zZXRWZXJ0ZXhEcmFnQXJlYXMoKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLnZlcnRpY2VzLmZvckVhY2goIHZlcnRleCA9PiB7XHJcbiAgICAgIHZlcnRleC5tb2RlbEJvdW5kc1Byb3BlcnR5LmxpbmsoIHZlcnRleEJvdW5kcyA9PiB7XHJcblxyXG4gICAgICAgIC8vIHNtYWxsZXN0IHBvc3NpYmxlIGludGVydmFsIGZvciBjb250cm9sbGluZyB0aGUgdmVydGV4IHBvc2l0aW9ucywgb3ZlciB0d28gc28gdGhhdCB3ZSBrbm93IHdoZW4gdGhlIHZlcnRleFxyXG4gICAgICAgIC8vIHRvdWNoZXMgbW9kZWwgYm91bmRzLlxyXG4gICAgICAgIGNvbnN0IGhhbGZTbWFsbGVzdEludGVydmFsID0gUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5NSU5PUl9SRURVQ0VEX1NJWkVfVkVSVEVYX0lOVEVSVkFMIC8gMjtcclxuICAgICAgICB2ZXJ0ZXgudG9wQ29uc3RyYWluZWRQcm9wZXJ0eS52YWx1ZSA9IFV0aWxzLmVxdWFsc0Vwc2lsb24oIHZlcnRleEJvdW5kcy5tYXhZLCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLk1PREVMX0JPVU5EUy5tYXhZLCBoYWxmU21hbGxlc3RJbnRlcnZhbCApO1xyXG4gICAgICAgIHZlcnRleC5yaWdodENvbnN0cmFpbmVkUHJvcGVydHkudmFsdWUgPSBVdGlscy5lcXVhbHNFcHNpbG9uKCB2ZXJ0ZXhCb3VuZHMubWF4WCwgUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5NT0RFTF9CT1VORFMubWF4WCwgaGFsZlNtYWxsZXN0SW50ZXJ2YWwgKTtcclxuICAgICAgICB2ZXJ0ZXguYm90dG9tQ29uc3RyYWluZWRQcm9wZXJ0eS52YWx1ZSA9IFV0aWxzLmVxdWFsc0Vwc2lsb24oIHZlcnRleEJvdW5kcy5taW5ZLCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLk1PREVMX0JPVU5EUy5taW5ZLCBoYWxmU21hbGxlc3RJbnRlcnZhbCApO1xyXG4gICAgICAgIHZlcnRleC5sZWZ0Q29uc3RyYWluZWRQcm9wZXJ0eS52YWx1ZSA9IFV0aWxzLmVxdWFsc0Vwc2lsb24oIHZlcnRleEJvdW5kcy5taW5YLCBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLk1PREVMX0JPVU5EUy5taW5YLCBoYWxmU21hbGxlc3RJbnRlcnZhbCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgd2hlbiBhbGwgYW5nbGVzIGFyZSByaWdodCAod2l0aGluIHN0YXRpY0FuZ2xlVG9sZXJhbmNlSW50ZXJ2YWwpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRBcmVBbGxBbmdsZXNSaWdodCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9hcmVBbGxBbmdsZXNSaWdodDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB2YWx1ZSB0cmFja2luZyB3aGVuIGFsbCBhbmdsZXMgYXJlIGVxdWFsLiBUbyBiZSBjYWxsZWQgaW4gdXBkYXRlT3JkZXJEZXBlbmRlbnRQcm9wZXJ0aWVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlQXJlQWxsQW5nbGVzUmlnaHQoKTogdm9pZCB7XHJcbiAgICB0aGlzLl9hcmVBbGxBbmdsZXNSaWdodCA9IF8uZXZlcnkoIHRoaXMudmVydGljZXMsIHZlcnRleCA9PiB0aGlzLmlzUmlnaHRBbmdsZSggdmVydGV4LmFuZ2xlUHJvcGVydHkudmFsdWUhICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSB3aGVuIGFsbCBsZW5ndGhzIGFyZSBlcXVhbC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QXJlQWxsTGVuZ3Roc0VxdWFsKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FyZUFsbExlbmd0aHNFcXVhbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB2YWx1ZSB0cmFja2luZyBhbGwgZXF1YWwgc2lkZSBsZW5ndGhzLiBUbyBiZSBjYWxsZWQgaW4gdXBkYXRlT3JkZXJEZXBlbmRlbnRQcm9wZXJ0aWVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlQXJlQWxsTGVuZ3Roc0VxdWFsKCk6IHZvaWQge1xyXG4gICAgdGhpcy5fYXJlQWxsTGVuZ3Roc0VxdWFsID0gdGhpcy5pc0ludGVyTGVuZ3RoRXF1YWxUb090aGVyKCB0aGlzLnNpZGVBQi5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5zaWRlQkMubGVuZ3RoUHJvcGVydHkudmFsdWUgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0ludGVyTGVuZ3RoRXF1YWxUb090aGVyKCB0aGlzLnNpZGVCQy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5zaWRlQ0QubGVuZ3RoUHJvcGVydHkudmFsdWUgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0ludGVyTGVuZ3RoRXF1YWxUb090aGVyKCB0aGlzLnNpZGVDRC5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5zaWRlREEubGVuZ3RoUHJvcGVydHkudmFsdWUgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0ludGVyTGVuZ3RoRXF1YWxUb090aGVyKCB0aGlzLnNpZGVEQS5sZW5ndGhQcm9wZXJ0eS52YWx1ZSwgdGhpcy5zaWRlQUIubGVuZ3RoUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGFyZWEgb2YgdGhlIHF1YWRyaWxhdGVyYWwuIFVzZXMgQnJldHNjaG5laWRlcidzIGZvcm11bGEgZm9yIHRoZSBhcmVhIG9mIGEgZ2VuZXJhbCBxdWFkcmlsYXRlcmFsLFxyXG4gICAqIHNlZSBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CcmV0c2NobmVpZGVyJTI3c19mb3JtdWxhLlxyXG4gICAqXHJcbiAgICogUmVxdWlyZXMgc2lkZSBsZW5ndGhzIGFuZCB2ZXJ0ZXggYW5nbGVzIHRvIGJlIHVwLXRvLWRhdGUsIG11c3QgYmUgdXNlZCBpbiB1cGRhdGVPcmRlckRlcGVuZGVudFByb3BlcnRpZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRBcmVhKCk6IG51bWJlciB7XHJcbiAgICBjb25zdCBhID0gdGhpcy5zaWRlQUIubGVuZ3RoUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBiID0gdGhpcy5zaWRlQkMubGVuZ3RoUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBjID0gdGhpcy5zaWRlQ0QubGVuZ3RoUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBkID0gdGhpcy5zaWRlREEubGVuZ3RoUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gY2FuIGJlIGFueSB0d28gb3Bwb3NpdGUgYW5nbGVzXHJcbiAgICBjb25zdCBmaXJzdEFuZ2xlID0gdGhpcy52ZXJ0ZXhBLmFuZ2xlUHJvcGVydHkudmFsdWUhO1xyXG4gICAgY29uc3Qgc2Vjb25kQW5nbGUgPSB0aGlzLnZlcnRleEMuYW5nbGVQcm9wZXJ0eS52YWx1ZSE7XHJcblxyXG4gICAgLy8gc2VtaXBlcmltZXRlclxyXG4gICAgY29uc3QgcyA9ICggYSArIGIgKyBjICsgZCApIC8gMjtcclxuXHJcbiAgICBjb25zdCBjb3NBcmcgPSBNYXRoLmNvcyggKCBmaXJzdEFuZ2xlICsgc2Vjb25kQW5nbGUgKSAvIDIgKTtcclxuICAgIGNvbnN0IGFyZWEgPSBNYXRoLnNxcnQoICggcyAtIGEgKSAqICggcyAtIGIgKSAqICggcyAtIGMgKSAqICggcyAtIGQgKSAtICggYSAqIGIgKiBjICogZCApICogY29zQXJnICogY29zQXJnICk7XHJcblxyXG4gICAgY29uc3QgaXNBcmVhTmFOID0gaXNOYU4oIGFyZWEgKTtcclxuXHJcbiAgICAvLyBBIHZlcnRleCBtaWdodCBiZSBvdmVybGFwcGVkIHdpdGggYSBzaWRlIG9yIGFub3RoZXIgUXVhZHJpbGF0ZXJhbFZlcnRleCBpbiB0aGUgXCJ0ZXN0XCIgc2hhcGUgd2hpbGUgd2UgYXJlIHRyeWluZyB0byBmaW5kXHJcbiAgICAvLyBhIGdvb2QgdmVydGV4IHBvc2l0aW9uLiBHcmFjZWZ1bGx5IGhhbmRsZSB0aGlzIGJ5IHJldHVybmluZyBhbiBhcmVhIG9mIHplcm8gKGFyZWEgaXMgTmFOL3VuZGVmaW5lZCBvdGhlcndpc2UpLlxyXG4gICAgaWYgKCB0aGlzLnZhbGlkYXRlU2hhcGUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFpc0FyZWFOYU4sICdBcmVhIGlzIG5vdCBkZWZpbmVkIGZvciB0aGUgcXVhZHJpbGF0ZXJhbCBzaGFwZScgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBpc0FyZWFOYU4gPyAwIDogYXJlYTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdHdvIGFuZ2xlcyBhcmUgZXF1YWwgd2l0aGluZyBhbmdsZVRvbGVyYW5jZUludGVydmFsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0ludGVyQW5nbGVFcXVhbFRvT3RoZXIoIGFuZ2xlMTogbnVtYmVyLCBhbmdsZTI6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBVdGlscy5lcXVhbHNFcHNpbG9uKCBhbmdsZTEsIGFuZ2xlMiwgdGhpcy5pbnRlckFuZ2xlVG9sZXJhbmNlSW50ZXJ2YWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgbGVuZ3RocyBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlciB3aXRoaW4gaW50ZXJMZW5ndGhUb2xlcmFuY2VJbnRlcnZhbC5cclxuICAgKi9cclxuICBwdWJsaWMgaXNJbnRlckxlbmd0aEVxdWFsVG9PdGhlciggbGVuZ3RoMTogbnVtYmVyLCBsZW5ndGgyOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gVXRpbHMuZXF1YWxzRXBzaWxvbiggbGVuZ3RoMSwgbGVuZ3RoMiwgdGhpcy5pbnRlckxlbmd0aFRvbGVyYW5jZUludGVydmFsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFuZ2xlIGlzIGEgcmlnaHQgYW5nbGUsIHdpdGhpbiBzdGF0aWNBbmdsZVRvbGVyYW5jZUludGVydmFsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc1JpZ2h0QW5nbGUoIGFuZ2xlOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gVXRpbHMuZXF1YWxzRXBzaWxvbiggYW5nbGUsIE1hdGguUEkgLyAyLCB0aGlzLnN0YXRpY0FuZ2xlVG9sZXJhbmNlSW50ZXJ2YWwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSB3aGVuIHRoZSBzaGFwZSBpcyBhIHBhcmFsbGVsb2dyYW0uXHJcbiAgICovXHJcbiAgcHVibGljIGlzUGFyYWxsZWxvZ3JhbSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLl9pc1BhcmFsbGVsb2dyYW07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdHdvIGFuZ2xlcyBhcmUgZXF1YWwgd2l0aGluIHN0YXRpY0FuZ2xlVG9sZXJhbmNlSW50ZXJ2YWwuIFNlZSB0aGF0IHZhbHVlIGZvciBtb3JlXHJcbiAgICogaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIGlzU3RhdGljQW5nbGVFcXVhbFRvT3RoZXIoIGFuZ2xlOiBudW1iZXIsIG90aGVyQW5nbGU6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiBVdGlscy5lcXVhbHNFcHNpbG9uKCBhbmdsZSwgb3RoZXJBbmdsZSwgdGhpcy5zdGF0aWNBbmdsZVRvbGVyYW5jZUludGVydmFsICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGFuZ2xlIGlzIGVxdWFsIHRvIFBJIHdpdGhpbiBzdGF0aWNBbmdsZVRvbGVyYW5jZUludGVydmFsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0ZsYXRBbmdsZSggYW5nbGU6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzU3RhdGljQW5nbGVFcXVhbFRvT3RoZXIoIGFuZ2xlLCBNYXRoLlBJICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgbXVsdGlwbGUgdmVydGV4IHBvc2l0aW9ucyBhdCBvbmNlLCB1cGRhdGluZyBlYWNoIGFuZCB0aGVuIGNhbGxpbmcgcmVsZXZhbnQgUHJvcGVydHkgbGlzdGVuZXJzIGFmdGVyXHJcbiAgICogYWxsIGFyZSBzZXQuIFRoaXMgd2F5IHlvdSBjYW4gc2FmZWx5IHNldCBtdWx0aXBsZSBhdCBhIHRpbWUgd2l0aG91dCB0cmFuc2llbnQgc3RhdGVzIHdoZXJlIHRoZSBzaGFwZSBpc1xyXG4gICAqIG5vdCB2YWxpZC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0VmVydGV4UG9zaXRpb25zKCBsYWJlbFRvUG9zaXRpb25NYXA6IFZlcnRleExhYmVsVG9Qcm9wb3NlZFBvc2l0aW9uTWFwICk6IHZvaWQge1xyXG5cclxuICAgIHRoaXMuc2V0UHJvcGVydGllc0RlZmVycmVkKCB0cnVlICk7XHJcblxyXG4gICAgbGFiZWxUb1Bvc2l0aW9uTWFwLmZvckVhY2goICggcG9zaXRpb25WYWx1ZSwgbGFiZWxLZXkgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHZlcnRleCA9IHRoaXMuZ2V0TGFiZWxsZWRWZXJ0ZXgoIGxhYmVsS2V5ICk7XHJcblxyXG4gICAgICAvLyB0aGlzIGlzIGEgbmV3IFZlY3RvcjIgaW5zdGFuY2Ugc28gZXZlbiBpZiB4LHkgdmFsdWVzIGFyZSB0aGUgc2FtZSBhcyB0aGUgb2xkIHZhbHVlIGl0IHdpbGwgdHJpZ2dlclxyXG4gICAgICAvLyBsaXN0ZW5lcnMgd2l0aG91dCB0aGlzIGNoZWNrXHJcbiAgICAgIGlmICggIXBvc2l0aW9uVmFsdWUuZXF1YWxzKCB2ZXJ0ZXgucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApICkge1xyXG4gICAgICAgIHZlcnRleC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gcG9zaXRpb25WYWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVuLWRlZmVyIGFsbCBzbyB0aGF0IGFsbCBQcm9wZXJ0aWVzIGFuZCBjYWxscyBjYWxsYmFja3NcclxuICAgIHRoaXMuc2V0UHJvcGVydGllc0RlZmVycmVkKCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIFByb3BlcnRpZXMgdGhhdCBuZWVkIHRvIGJlIGNhbGN1bGF0ZWQgaW4gc2VxdWVuY2UgdG8gaGF2ZSBjb3JyZWN0IHZhbHVlcy4gUG9zaXRpb25zIG5lZWQgdG8gdXBkYXRlLFxyXG4gICAqIHRoZW4gYW5nbGVzIGFuZCBsZW5ndGhzLCB0aGVuIFByb3BlcnRpZXMgdHJhY2tpbmcgcGFpcnMgb2YgZXF1YWwgbGVuZ3RocyBhbmQgYW5nbGVzLCB0aGVuIHBhcmFsbGVsb2dyYW0gc3RhdGUsXHJcbiAgICogYW5kIGZpbmFsbHkgc2hhcGUgbmFtZS4gSWYgc2hhcGUgbmFtZSBvciBwYXJhbGxlbG9ncmFtIHN0YXRlIGlzIGNhbGN1bGF0ZWQgYmVmb3JlIHNoYXBlIHByb3BlcnRpZXMsIHRoZWlyIHZhbHVlc1xyXG4gICAqIHdpbGwgYmUgaW5jb3JyZWN0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVPcmRlckRlcGVuZGVudFByb3BlcnRpZXMoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gdXBkYXRlIGFuZ2xlc1xyXG4gICAgdGhpcy52ZXJ0aWNlcy5mb3JFYWNoKCB2ZXJ0ZXggPT4ge1xyXG4gICAgICB2ZXJ0ZXgudXBkYXRlQW5nbGUoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgbGVuZ3Roc1xyXG4gICAgdGhpcy5zaWRlcy5mb3JFYWNoKCBzaWRlID0+IHtcclxuICAgICAgc2lkZS51cGRhdGVMZW5ndGhBbmRTaGFwZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBhaXJzIG9mIHBhcmFsbGVsIHNpZGVzXHJcbiAgICB0aGlzLnVwZGF0ZVBhcmFsbGVsU2lkZVByb3BlcnRpZXMoKTtcclxuXHJcbiAgICAvLyBwYWlycyBvZiBlcXVhbCB2ZXJ0ZXggYW5nbGVzIGFuZCBzaWRlIGxlbmd0aHNcclxuICAgIHRoaXMudXBkYXRlVmVydGV4QW5nbGVDb21wYXJpc29ucygpO1xyXG4gICAgdGhpcy51cGRhdGVTaWRlTGVuZ3RoQ29tcGFyaXNvbnMoKTtcclxuXHJcbiAgICAvLyBvdGhlciBzaGFwZSBhdHRyaWJ1dGVzXHJcbiAgICB0aGlzLmFyZWFQcm9wZXJ0eS5zZXQoIHRoaXMuZ2V0QXJlYSgpICk7XHJcbiAgICB0aGlzLnVwZGF0ZUFyZUFsbEFuZ2xlc1JpZ2h0KCk7XHJcbiAgICB0aGlzLnVwZGF0ZUFyZUFsbExlbmd0aHNFcXVhbCgpO1xyXG5cclxuICAgIC8vIHRoZSBkZXRlY3RlZCBzaGFwZSBuYW1lXHJcbiAgICB0aGlzLnNoYXBlTmFtZVByb3BlcnR5LnNldCggUXVhZHJpbGF0ZXJhbFNoYXBlRGV0ZWN0b3IuZ2V0U2hhcGVOYW1lKCB0aGlzICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSBQcm9wZXJ0aWVzIGZvciBhbmdsZSBjb21wYXJpc29ucyAtIHBhaXJzIG9mIGVxdWFsIG9wcG9zaXRlIGFuZCBlcXVhbCBhZGphY2VudCBhbmdsZXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVWZXJ0ZXhBbmdsZUNvbXBhcmlzb25zKCk6IHZvaWQge1xyXG4gICAgdGhpcy51cGRhdGVFcXVhbFZlcnRleFBhaXJzKCB0aGlzLmFkamFjZW50RXF1YWxWZXJ0ZXhQYWlyc1Byb3BlcnR5LCB0aGlzLmFkamFjZW50VmVydGV4TWFwICk7XHJcbiAgICB0aGlzLnVwZGF0ZUVxdWFsVmVydGV4UGFpcnMoIHRoaXMub3Bwb3NpdGVFcXVhbFZlcnRleFBhaXJzUHJvcGVydHksIHRoaXMub3Bwb3NpdGVWZXJ0ZXhNYXAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSBhIHByb3ZpZGVkIFByb3BlcnR5IHRoYXQgaG9sZHMgYSBsaXN0IG9mIGVxdWFsIGFuZ2xlcyAoZWl0aGVyIG9wcG9zaXRlIG9yIGFkamFjZW50KS5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZUVxdWFsVmVydGV4UGFpcnMoIGVxdWFsVmVydGV4UGFpcnNQcm9wZXJ0eTogUHJvcGVydHk8UXVhZHJpbGF0ZXJhbFZlcnRleFBhaXJbXT4sIHZlcnRleE1hcDogTWFwPFF1YWRyaWxhdGVyYWxWZXJ0ZXgsIFF1YWRyaWxhdGVyYWxWZXJ0ZXhbXSB8IFF1YWRyaWxhdGVyYWxWZXJ0ZXg+ICk6IHZvaWQge1xyXG4gICAgY29uc3QgY3VycmVudFZlcnRleFBhaXJzID0gZXF1YWxWZXJ0ZXhQYWlyc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgdmVydGV4TWFwLmZvckVhY2goICggcmVsYXRlZFZlcnRpY2VzLCBrZXlWZXJ0ZXgsIG1hcCApID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHJlbGF0ZWRWZXJ0aWNlc0FycmF5ID0gQXJyYXkuaXNBcnJheSggcmVsYXRlZFZlcnRpY2VzICkgPyByZWxhdGVkVmVydGljZXMgOiBbIHJlbGF0ZWRWZXJ0aWNlcyBdO1xyXG4gICAgICByZWxhdGVkVmVydGljZXNBcnJheS5mb3JFYWNoKCByZWxhdGVkVmVydGV4ID0+IHtcclxuICAgICAgICBjb25zdCB2ZXJ0ZXhQYWlyID0gbmV3IFF1YWRyaWxhdGVyYWxWZXJ0ZXhQYWlyKCBrZXlWZXJ0ZXgsIHJlbGF0ZWRWZXJ0ZXggKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlyc3RBbmdsZSA9IHZlcnRleFBhaXIuY29tcG9uZW50MS5hbmdsZVByb3BlcnR5LnZhbHVlITtcclxuICAgICAgICBjb25zdCBzZWNvbmRBbmdsZSA9IHZlcnRleFBhaXIuY29tcG9uZW50Mi5hbmdsZVByb3BlcnR5LnZhbHVlITtcclxuICAgICAgICBjb25zdCBhcmVBbmdsZXNFcXVhbCA9IHRoaXMuaXNJbnRlckFuZ2xlRXF1YWxUb090aGVyKCBmaXJzdEFuZ2xlLCBzZWNvbmRBbmdsZSApO1xyXG4gICAgICAgIGNvbnN0IGluZGV4T2ZWZXJ0ZXhQYWlyID0gXy5maW5kSW5kZXgoIGN1cnJlbnRWZXJ0ZXhQYWlycywgY3VycmVudFZlcnRleFBhaXIgPT4gY3VycmVudFZlcnRleFBhaXIuZXF1YWxzKCB2ZXJ0ZXhQYWlyICkgKTtcclxuICAgICAgICBjb25zdCBjdXJyZW50bHlJbmNsdWRlc1ZlcnRleFBhaXIgPSBpbmRleE9mVmVydGV4UGFpciA+IC0xO1xyXG5cclxuICAgICAgICBpZiAoIGN1cnJlbnRseUluY2x1ZGVzVmVydGV4UGFpciAmJiAhYXJlQW5nbGVzRXF1YWwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIFF1YWRyaWxhdGVyYWxWZXJ0ZXhQYWlyIG5lZWRzIHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBhbmdsZXMgYXJlIG5vIGxvbmdlciBlcXVhbFxyXG4gICAgICAgICAgY3VycmVudFZlcnRleFBhaXJzLnNwbGljZSggaW5kZXhPZlZlcnRleFBhaXIsIDEgKTtcclxuICAgICAgICAgIGVxdWFsVmVydGV4UGFpcnNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoICFjdXJyZW50bHlJbmNsdWRlc1ZlcnRleFBhaXIgJiYgYXJlQW5nbGVzRXF1YWwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIFF1YWRyaWxhdGVyYWxWZXJ0ZXhQYWlyIG5lZWRzIHRvIGJlIGFkZGVkIGJlY2F1c2UgdGhleSBqdXN0IGJlY2FtZSBlcXVhbFxyXG4gICAgICAgICAgY3VycmVudFZlcnRleFBhaXJzLnB1c2goIHZlcnRleFBhaXIgKTtcclxuICAgICAgICAgIGVxdWFsVmVydGV4UGFpcnNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSBQcm9wZXJ0aWVzIGZvciBzaWRlIGxlbmd0aCBjb21wYXJpc29ucyAtIGVpdGhlciBvcHBvc2l0ZSBvciBhZGphY2VudCBzaWRlcy5cclxuICAgKi9cclxuICBwcml2YXRlIHVwZGF0ZVNpZGVMZW5ndGhDb21wYXJpc29ucygpOiB2b2lkIHtcclxuICAgIHRoaXMudXBkYXRlRXF1YWxTaWRlUGFpcnMoIHRoaXMuYWRqYWNlbnRFcXVhbFNpZGVQYWlyc1Byb3BlcnR5LCB0aGlzLmFkamFjZW50U2lkZU1hcCApO1xyXG4gICAgdGhpcy51cGRhdGVFcXVhbFNpZGVQYWlycyggdGhpcy5vcHBvc2l0ZUVxdWFsU2lkZVBhaXJzUHJvcGVydHksIHRoaXMub3Bwb3NpdGVTaWRlTWFwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgYSBwcm92aWRlZCBQcm9wZXJ0eSBob2xkaW5nIGEgbGlzdCBvZiBzaWRlcyB0aGF0IGFyZSBlcXVhbCBpbiBsZW5ndGggKGVpdGhlciBvcHBvc2l0ZSBvciBhZGphY2VudCkuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVFcXVhbFNpZGVQYWlycyggZXF1YWxTaWRlUGFpcnNQcm9wZXJ0eTogUHJvcGVydHk8UXVhZHJpbGF0ZXJhbFNpZGVQYWlyW10+LCBzaWRlTWFwOiBNYXA8UXVhZHJpbGF0ZXJhbFNpZGUsIFF1YWRyaWxhdGVyYWxTaWRlW10gfCBRdWFkcmlsYXRlcmFsU2lkZT4gKTogdm9pZCB7XHJcbiAgICBjb25zdCBjdXJyZW50U2lkZVBhaXJzID0gZXF1YWxTaWRlUGFpcnNQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBzaWRlTWFwLmZvckVhY2goICggcmVsYXRlZFNpZGVzLCBrZXlTaWRlICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgcmVsYXRlZFNpZGVzQXJyYXkgPSBBcnJheS5pc0FycmF5KCByZWxhdGVkU2lkZXMgKSA/IHJlbGF0ZWRTaWRlcyA6IFsgcmVsYXRlZFNpZGVzIF07XHJcbiAgICAgIHJlbGF0ZWRTaWRlc0FycmF5LmZvckVhY2goIHJlbGF0ZWRTaWRlID0+IHtcclxuICAgICAgICBjb25zdCBzaWRlUGFpciA9IG5ldyBRdWFkcmlsYXRlcmFsU2lkZVBhaXIoIGtleVNpZGUsIHJlbGF0ZWRTaWRlICk7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpcnN0TGVuZ3RoID0gc2lkZVBhaXIuY29tcG9uZW50MS5sZW5ndGhQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBjb25zdCBzZWNvbmRMZW5ndGggPSBzaWRlUGFpci5jb21wb25lbnQyLmxlbmd0aFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGFyZUxlbmd0aHNFcXVhbCA9IHRoaXMuaXNJbnRlckxlbmd0aEVxdWFsVG9PdGhlciggZmlyc3RMZW5ndGgsIHNlY29uZExlbmd0aCApO1xyXG4gICAgICAgIGNvbnN0IGluZGV4T2ZTaWRlUGFpciA9IF8uZmluZEluZGV4KCBjdXJyZW50U2lkZVBhaXJzLCBjdXJyZW50U2lkZVBhaXIgPT4gY3VycmVudFNpZGVQYWlyLmVxdWFscyggc2lkZVBhaXIgKSApO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRseUluY2x1ZGVzU2lkZVBhaXIgPSBpbmRleE9mU2lkZVBhaXIgPiAtMTtcclxuXHJcbiAgICAgICAgaWYgKCBjdXJyZW50bHlJbmNsdWRlc1NpZGVQYWlyICYmICFhcmVMZW5ndGhzRXF1YWwgKSB7XHJcblxyXG4gICAgICAgICAgLy8gdGhlIFF1YWRyaWxhdGVyYWxWZXJ0ZXhQYWlyIG5lZWRzIHRvIGJlIHJlbW92ZWQgYmVjYXVzZSBhbmdsZXMgYXJlIG5vIGxvbmdlciBlcXVhbFxyXG4gICAgICAgICAgY3VycmVudFNpZGVQYWlycy5zcGxpY2UoIGluZGV4T2ZTaWRlUGFpciwgMSApO1xyXG4gICAgICAgICAgZXF1YWxTaWRlUGFpcnNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoICFjdXJyZW50bHlJbmNsdWRlc1NpZGVQYWlyICYmIGFyZUxlbmd0aHNFcXVhbCApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgUXVhZHJpbGF0ZXJhbFZlcnRleFBhaXIgbmVlZHMgdG8gYmUgYWRkZWQgYmVjYXVzZSB0aGV5IGp1c3QgYmVjYW1lIGVxdWFsXHJcbiAgICAgICAgICBjdXJyZW50U2lkZVBhaXJzLnB1c2goIHNpZGVQYWlyICk7XHJcbiAgICAgICAgICBlcXVhbFNpZGVQYWlyc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVyc1N0YXRpYygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyBQcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gb3Bwb3NpdGUgc2lkZXMgdGhhdCBhcmUgcGFyYWxsZWwsIGFuZCB3aGV0aGVyIHRoaXMgc2hhcGUgaXMgYSBwYXJhbGxlbG9ncmFtLiBUbyBiZVxyXG4gICAqIHVzZWQgaW4gdXBkYXRlT3JkZXJEZXBlbmRlbnRQcm9wZXJ0aWVzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgdXBkYXRlUGFyYWxsZWxTaWRlUHJvcGVydGllcygpOiB2b2lkIHtcclxuICAgIGNvbnN0IHNpZGVBQlNpZGVDRFBhcmFsbGVsID0gdGhpcy5zaWRlQUJTaWRlQ0RQYXJhbGxlbFNpZGVDaGVja2VyLmFyZVNpZGVzUGFyYWxsZWwoKTtcclxuICAgIGNvbnN0IHNpZGVCQ1NpZGVEQVBhcmFsbGVsID0gdGhpcy5zaWRlQkNTaWRlREFQYXJhbGxlbFNpZGVDaGVja2VyLmFyZVNpZGVzUGFyYWxsZWwoKTtcclxuXHJcbiAgICB0aGlzLl9pc1BhcmFsbGVsb2dyYW0gPSBzaWRlQUJTaWRlQ0RQYXJhbGxlbCAmJiBzaWRlQkNTaWRlREFQYXJhbGxlbDtcclxuXHJcbiAgICBjb25zdCBwcmV2aW91c1BhcmFsbGVsU2lkZVBhaXJzID0gdGhpcy5wYXJhbGxlbFNpZGVQYWlyc1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgY3VycmVudFBhcmFsbGVsU2lkZVBhaXJzID0gW107XHJcbiAgICBpZiAoIHNpZGVBQlNpZGVDRFBhcmFsbGVsICkge1xyXG4gICAgICBjdXJyZW50UGFyYWxsZWxTaWRlUGFpcnMucHVzaCggdGhpcy5zaWRlQUJTaWRlQ0RQYXJhbGxlbFNpZGVDaGVja2VyLnNpZGVQYWlyICk7XHJcbiAgICB9XHJcbiAgICBpZiAoIHNpZGVCQ1NpZGVEQVBhcmFsbGVsICkge1xyXG4gICAgICBjdXJyZW50UGFyYWxsZWxTaWRlUGFpcnMucHVzaCggdGhpcy5zaWRlQkNTaWRlREFQYXJhbGxlbFNpZGVDaGVja2VyLnNpZGVQYWlyICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhXy5pc0VxdWFsKCBwcmV2aW91c1BhcmFsbGVsU2lkZVBhaXJzLCBjdXJyZW50UGFyYWxsZWxTaWRlUGFpcnMgKSApIHtcclxuICAgICAgdGhpcy5wYXJhbGxlbFNpZGVQYWlyc1Byb3BlcnR5LnZhbHVlID0gY3VycmVudFBhcmFsbGVsU2lkZVBhaXJzO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGlzIG1vZGVsIHRvIGJlIHRoZSBzYW1lIGFzIHRoZSBwcm92aWRlZCBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCBieSBzZXR0aW5nIFF1YWRyaWxhdGVyYWxWZXJ0ZXggcG9zaXRpb25zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRGcm9tU2hhcGUoIG90aGVyOiBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBTaW5jZSB3ZSBhcmUgdXBkYXRpbmcgbWFueSB2ZXJ0aWNlcyBhdCBvbmNlLCB3ZSBuZWVkIHRvIGRlZmVyIGNhbGxiYWNrcyB1bnRpbCBhbGwgcG9zaXRpb25zIGFyZSBzZXQuIE90aGVyd2lzZSxcclxuICAgIC8vIGNhbGxiYWNrcyB3aWxsIGJlIGNhbGxlZCBmb3IgYSBwb3RlbnRpYWxseSBkaXNhbGxvd2VkIHNoYXBlLlxyXG4gICAgdGhpcy5zZXRQcm9wZXJ0aWVzRGVmZXJyZWQoIHRydWUgKTtcclxuXHJcbiAgICB0aGlzLnZlcnRleEEucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG90aGVyLnZlcnRleEEucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy52ZXJ0ZXhCLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBvdGhlci52ZXJ0ZXhCLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIHRoaXMudmVydGV4Qy5wb3NpdGlvblByb3BlcnR5LnNldCggb3RoZXIudmVydGV4Qy5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB0aGlzLnZlcnRleEQucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIG90aGVyLnZlcnRleEQucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIHRoaXMuc2V0UHJvcGVydGllc0RlZmVycmVkKCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSB2ZXJ0ZXggb2YgdGhpcyBzaGFwZSBtb2RlbCB3aXRoIHRoZSBwcm92aWRlZCB2ZXJ0ZXhMYWJlbC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TGFiZWxsZWRWZXJ0ZXgoIHZlcnRleExhYmVsOiBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwgKTogUXVhZHJpbGF0ZXJhbFZlcnRleCB7XHJcbiAgICBjb25zdCBsYWJlbGxlZFZlcnRleCA9IF8uZmluZCggdGhpcy52ZXJ0aWNlcywgdmVydGV4ID0+IHZlcnRleC52ZXJ0ZXhMYWJlbCA9PT0gdmVydGV4TGFiZWwgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsYWJlbGxlZFZlcnRleCwgJ0NvdWxkIG5vdCBmaW5kIGxhYmVsbGVkIHZlcnRleCcgKTtcclxuICAgIHJldHVybiBsYWJlbGxlZFZlcnRleCE7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGRyYWcgYXJlYXMgZm9yIGFsbCB2ZXJ0aWNlcy5cclxuICAgKi9cclxuICBwcml2YXRlIHNldFZlcnRleERyYWdBcmVhcygpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBhdmFpbGFibGUgZHJhZyBhcmVhcyBnbyB3YXkgb3V0c2lkZSBvZiBtb2RlbCBib3VuZHMsIGNvbnN0cmFpbnQgd2l0aGluIG1vZGVsIGJvdW5kcyBpcyBpbXBsZW1lbnRlZCBieVxyXG4gICAgLy8gYSBib3VuZHMuY2xvc2VzdFBvaW50VG8gY2hlY2sgdG8gc3VwcG9ydCBzbW9vdGggbW92ZW1lbnQgYXJvdW5kIHRoZSBlZGdlIG9mIGJvdW5kc1xyXG4gICAgY29uc3QgZGlsYXRlZEJvdW5kcyA9IFF1YWRyaWxhdGVyYWxDb25zdGFudHMuTU9ERUxfQk9VTkRTLmRpbGF0ZWQoIDEgKTtcclxuXHJcbiAgICB0aGlzLnZlcnRleEEuZHJhZ0FyZWFQcm9wZXJ0eS5zZXQoIFF1YWRyaWxhdGVyYWxVdGlscy5jcmVhdGVWZXJ0ZXhBcmVhKCBkaWxhdGVkQm91bmRzLCB0aGlzLnZlcnRleEEsIHRoaXMudmVydGV4QiwgdGhpcy52ZXJ0ZXhDLCB0aGlzLnZlcnRleEQsIHRoaXMudmFsaWRhdGVTaGFwZSApICk7XHJcbiAgICB0aGlzLnZlcnRleEIuZHJhZ0FyZWFQcm9wZXJ0eS5zZXQoIFF1YWRyaWxhdGVyYWxVdGlscy5jcmVhdGVWZXJ0ZXhBcmVhKCBkaWxhdGVkQm91bmRzLCB0aGlzLnZlcnRleEIsIHRoaXMudmVydGV4QywgdGhpcy52ZXJ0ZXhELCB0aGlzLnZlcnRleEEsIHRoaXMudmFsaWRhdGVTaGFwZSApICk7XHJcbiAgICB0aGlzLnZlcnRleEMuZHJhZ0FyZWFQcm9wZXJ0eS5zZXQoIFF1YWRyaWxhdGVyYWxVdGlscy5jcmVhdGVWZXJ0ZXhBcmVhKCBkaWxhdGVkQm91bmRzLCB0aGlzLnZlcnRleEMsIHRoaXMudmVydGV4RCwgdGhpcy52ZXJ0ZXhBLCB0aGlzLnZlcnRleEIsIHRoaXMudmFsaWRhdGVTaGFwZSApICk7XHJcbiAgICB0aGlzLnZlcnRleEQuZHJhZ0FyZWFQcm9wZXJ0eS5zZXQoIFF1YWRyaWxhdGVyYWxVdGlscy5jcmVhdGVWZXJ0ZXhBcmVhKCBkaWxhdGVkQm91bmRzLCB0aGlzLnZlcnRleEQsIHRoaXMudmVydGV4QSwgdGhpcy52ZXJ0ZXhCLCB0aGlzLnZlcnRleEMsIHRoaXMudmFsaWRhdGVTaGFwZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgUHJvcGVydGllcyBkZWZlcnJlZCBzbyB0aGF0IGNhbGxiYWNrcyBhcmUgbm90IGludm9rZWQgd2hpbGUgdGhlIFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsIGhhcyBiYWQgdHJhbnNpZW50XHJcbiAgICogc3RhdGUgd2hpbGUgb3RoZXIgUHJvcGVydHkgdmFsdWVzIGFyZSBiZWluZyBjYWxjdWxhdGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQcm9wZXJ0aWVzRGVmZXJyZWQoIGRlZmVycmVkOiBib29sZWFuICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZGVmZXJyZWQgIT09IHRoaXMucHJvcGVydGllc0RlZmVycmVkLCAnZGVmZXJyZWQgc3RhdGUgbXVzdCBiZSBjaGFuZ2luZywgeW91IG1heSBoYXZlIG5vdCB1bi1kZWZlcnJlZCBQcm9wZXJ0aWVzJyApO1xyXG4gICAgdGhpcy5wcm9wZXJ0aWVzRGVmZXJyZWQgPSBkZWZlcnJlZDtcclxuXHJcbiAgICAvLyBzZXQgZGVmZXJyZWQgZm9yIGFsbCBQcm9wZXJ0aWVzIGZpcnN0IHNvIHRoYXQgdGhlaXIgdmFsdWVzIGFyZSB1cC10by1kYXRlIGJ5IHRoZSB0aW1lIHdlIGNhbGwgbGlzdGVuZXJzXHJcbiAgICBjb25zdCBkZWZlcnJlZFZlcnRleExpc3RlbmVycyA9IHRoaXMudmVydGljZXMubWFwKCB2ZXJ0ZXggPT4gdmVydGV4LnNldFByb3BlcnRpZXNEZWZlcnJlZCggZGVmZXJyZWQgKSApO1xyXG5cclxuICAgIC8vIGNhbGwgYW55IGRlZmVycmVkIGNhbGxiYWNrcyBpZiBubyBsb25nZXIgZGVmZXJyZWRcclxuICAgIGRlZmVycmVkVmVydGV4TGlzdGVuZXJzLmZvckVhY2goIGRlZmVycmVkTGlzdGVuZXIgPT4gZGVmZXJyZWRMaXN0ZW5lciAmJiBkZWZlcnJlZExpc3RlbmVyKCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBzaGFwZSBieSByZXNldHRpbmcgdmVydGljZXMuIERlZmVyIHVwZGF0ZSBvZiBQcm9wZXJ0aWVzIHNvIHRoYXQgUHJvcGVydGllcyBkbyBub3RcclxuICAgKiBjYWxsIGxpc3RlbmVycyB1bnRpbCBhbGwgVmVydGljZXMgaGF2ZSBiZWVuIHJlcG9zaXRpb25lZC5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gc2V0IG5lY2Vzc2FyeSBQcm9wZXJ0aWVzIGRlZmVycmVkIHNvIHRoYXQgd2UgY2FuIHVwZGF0ZSBldmVyeXRoaW5nIHRvZ2V0aGVyXHJcbiAgICB0aGlzLnNldFByb3BlcnRpZXNEZWZlcnJlZCggdHJ1ZSApO1xyXG5cclxuICAgIHRoaXMudmVydGV4QS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZXJ0ZXhCLnJlc2V0KCk7XHJcbiAgICB0aGlzLnZlcnRleEMucmVzZXQoKTtcclxuICAgIHRoaXMudmVydGV4RC5yZXNldCgpO1xyXG5cclxuICAgIC8vIG5vIGxvbmdlciBkZWZlcnJlZCwgaW52b2tlIGNhbGxiYWNrcyBhbmQgdXBkYXRlIG9yZGVyIGRlcGVuZGVudCBQcm9wZXJ0aWVzXHJcbiAgICB0aGlzLnNldFByb3BlcnRpZXNEZWZlcnJlZCggZmFsc2UgKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZU9yZGVyRGVwZW5kZW50UHJvcGVydGllcygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXQgdGhlIHNoYXBlIEFORCBpbmRpY2F0ZSB0aGF0IGEgcmVzZXQgaXMgaW4gcHJvZ3Jlc3MgKHdoaWNoIHdpbGwgZGlzYWJsZSBjZXJ0YWluIHZpZXcgZmVlZGJhY2suXHJcbiAgICogVXNlIHRoaXMgd2hlbiBqdXN0IHJlc2V0dGluZyB0aGUgUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwgd2l0aG91dCByZXNldHRpbmcgdGhlIGZ1bGwgUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwuXHJcbiAgICovXHJcbiAgcHVibGljIGlzb2xhdGVkUmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0Tm90SW5Qcm9ncmVzc1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB0aGlzLnJlc2V0Tm90SW5Qcm9ncmVzc1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSB3aGVuIHRoZSBwcm92aWRlZCBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCBoYXMgZXZlcnkgdmVydGV4IGNvbnRhaW5lZCB3aXRoaW4gbW9kZWwgYm91bmRzLlxyXG4gICAqIEBwYXJhbSBzaGFwZU1vZGVsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgYXJlUXVhZHJpbGF0ZXJhbFZlcnRpY2VzSW5Cb3VuZHMoIHNoYXBlTW9kZWw6IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIF8uZXZlcnkoIHNoYXBlTW9kZWwudmVydGljZXMsIHZlcnRleCA9PiB7XHJcbiAgICAgIHJldHVybiBRdWFkcmlsYXRlcmFsQ29uc3RhbnRzLk1PREVMX0JPVU5EUy5jb250YWluc0JvdW5kcyggdmVydGV4Lm1vZGVsQm91bmRzUHJvcGVydHkudmFsdWUgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcXVhZHJpbGF0ZXJhbCBzaGFwZSBpcyBOT1QgY3Jvc3NlZC4gVGhlIHF1YWRyaWxhdGVyYWwgc2hhcGUgaXMgdXN1YWxseSB2YWxpZCB3aGVuIG5vdCBjcm9zc2VkLFxyXG4gICAqIHNvIHJldHVybmluZyB0aGlzIHZhbHVlIG1ha2VzIGxvZ2ljIGVhc2llciBhdCB1c2FnZSBzaXRlcy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGlzUXVhZHJpbGF0ZXJhbFNoYXBlTm90Q3Jvc3NlZCggc2hhcGVNb2RlbDogUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwgKTogYm9vbGVhbiB7XHJcbiAgICBsZXQgc2hhcGVDcm9zc2VkID0gdHJ1ZTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzaGFwZU1vZGVsLnZlcnRpY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCB0ZXN0VmVydGV4ID0gc2hhcGVNb2RlbC52ZXJ0aWNlc1sgaSBdO1xyXG5cclxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgbm8gdmVydGljZXMgb3ZlcmxhcCBhbnkgb3RoZXIuXHJcbiAgICAgIGlmICggc2hhcGVDcm9zc2VkICkge1xyXG4gICAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHNoYXBlTW9kZWwudmVydGljZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBvdGhlclZlcnRleCA9IHNoYXBlTW9kZWwudmVydGljZXNbIGogXTtcclxuXHJcbiAgICAgICAgICBpZiAoIHRlc3RWZXJ0ZXggIT09IG90aGVyVmVydGV4ICkge1xyXG4gICAgICAgICAgICBzaGFwZUNyb3NzZWQgPSAhdGVzdFZlcnRleC5vdmVybGFwc090aGVyKCBvdGhlclZlcnRleCApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCAhc2hhcGVDcm9zc2VkICkge1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCBubyB2ZXJ0aWNlcyBvdmVybGFwIGEgc2lkZS5cclxuICAgICAgaWYgKCBzaGFwZUNyb3NzZWQgKSB7XHJcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgc2hhcGVNb2RlbC5zaWRlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIGNvbnN0IHNpZGUgPSBzaGFwZU1vZGVsLnNpZGVzWyBqIF07XHJcbiAgICAgICAgICBpZiAoICFzaWRlLmluY2x1ZGVzVmVydGV4KCB0ZXN0VmVydGV4ICkgKSB7XHJcbiAgICAgICAgICAgIHNoYXBlQ3Jvc3NlZCA9ICFzaWRlLnNoYXBlUHJvcGVydHkudmFsdWUuaW50ZXJzZWN0c0JvdW5kcyggdGVzdFZlcnRleC5tb2RlbEJvdW5kc1Byb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoICFzaGFwZUNyb3NzZWQgKSB7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgUXVhZHJpbGF0ZXJhbFZlcnRleCBpcyB3aXRoaW4gdGhlIGRyYWcgYXJlYSBTaGFwZS5cclxuICAgICAgaWYgKCBzaGFwZUNyb3NzZWQgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGVzdFZlcnRleC5kcmFnQXJlYVByb3BlcnR5LnZhbHVlLCAnRHJhZyBhcmVhIG11c3QgYmUgZGVmaW5lZCBmb3IgdGhlIFF1YWRyaWxhdGVyYWxWZXJ0ZXgnICk7XHJcbiAgICAgICAgc2hhcGVDcm9zc2VkID0gUXVhZHJpbGF0ZXJhbFV0aWxzLmN1c3RvbVNoYXBlQ29udGFpbnNQb2ludCggdGVzdFZlcnRleC5kcmFnQXJlYVByb3BlcnR5LnZhbHVlISwgdGVzdFZlcnRleC5wb3NpdGlvblByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFF1YWRyaWxhdGVyYWwgaXMgbm90IGFsbG93ZWQsIG5vIG5lZWQgdG8ga2VlcCB0ZXN0aW5nXHJcbiAgICAgIGlmICggIXNoYXBlQ3Jvc3NlZCApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaGFwZUNyb3NzZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgcXVhZHJpbGF0ZXJhbCBzaGFwZSBpcyBhbGxvd2VkIGJhc2VkIG9uIHRoZSBydWxlcyBvZiB0aGlzIG1vZGVsLlxyXG4gICAqXHJcbiAgICogQSBRdWFkcmlsYXRlcmFsVmVydGV4IGNhbm5vdCBvdmVybGFwIGFueSBvdGhlci5cclxuICAgKiBBIFF1YWRyaWxhdGVyYWxWZXJ0ZXggY2Fubm90IG92ZXJsYXAgYW55IFF1YWRyaWxhdGVyYWxTaWRlLlxyXG4gICAqIEEgUXVhZHJpbGF0ZXJhbFZlcnRleCBjYW5ub3QgZ28gb3V0c2lkZSBtb2RlbCBib3VuZHMuXHJcbiAgICogQSBRdWFkcmlsYXRlcmFsVmVydGV4IGNhbm5vdCB0byBvdXRzaWRlIGl0cyBkZWZpbmVkIGRyYWcgU2hhcGUgKHdoaWNoIHByZXZlbnRzIGNyb3NzZWQgUXVhZHJpbGF0ZXJhbHMpLlxyXG4gICAqXHJcbiAgICogQXMgc29vbiBhcyB0aGUgcXVhZHJpbGF0ZXJhbCBpcyBmb3VuZCB0byBiZSBkaXNhbGxvd2VkLCB3ZSBicmVhayBvdXQgb2YgdGVzdGluZy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGlzUXVhZHJpbGF0ZXJhbFNoYXBlQWxsb3dlZCggc2hhcGVNb2RlbDogUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwgKTogYm9vbGVhbiB7XHJcbiAgICBsZXQgc2hhcGVBbGxvd2VkID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBBbGwgdmVydGljZXMgbXVzdCBiZSBjb21wbGV0ZWx5IHdpdGhpbiBtb2RlbCBib3VuZHMuXHJcbiAgICBzaGFwZUFsbG93ZWQgPSBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC5hcmVRdWFkcmlsYXRlcmFsVmVydGljZXNJbkJvdW5kcyggc2hhcGVNb2RlbCApO1xyXG5cclxuICAgIC8vIElmIGFsbCB2ZXJ0aWNlcyBhcmUgaW4gYm91bmRzLCBsb29rIGZvciBjcm9zc2VkIHNoYXBlcyAobW9yZSBjb21wdXRhdGlvbmFsbHkgZXhwZW5zaXZlKS5cclxuICAgIGlmICggc2hhcGVBbGxvd2VkICkge1xyXG4gICAgICBzaGFwZUFsbG93ZWQgPSBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC5pc1F1YWRyaWxhdGVyYWxTaGFwZU5vdENyb3NzZWQoIHNoYXBlTW9kZWwgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzaGFwZUFsbG93ZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSB0b2xlcmFuY2UgaW50ZXJ2YWwgdG8gdXNlIGZvciBhIHZhbHVlLiBHZW5lcmFsbHksIHRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgcmV0dXJuZWQuIElmIHRoZSBzaW0gaXNcclxuICAgKiBydW5uaW5nIHdoaWxlIGNvbm5lY3RlZCB0byBhIHByb3RvdHlwZSBkZXZpY2UgKD9kZXZpY2VDb25uZWN0aW9uKSBvciBpbiBhIG1vZGUgd2hlcmUgYWxsIHN0ZXAgc2l6ZXMgYXJlIHJlZHVjZWQsXHJcbiAgICogdGhlIHZhbHVlIHdpbGwgYmUgZnVydGhlciByZWR1Y2VkIGJ5IHNjYWxlIGZhY3RvcnMgcHJvdmlkZWQgYnkgcXVlcnkgcGFyYW1ldGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0V2lkZW5lZFRvbGVyYW5jZUludGVydmFsKCBkZWZhdWx0VmFsdWU6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgbGV0IGludGVydmFsID0gZGVmYXVsdFZhbHVlO1xyXG5cclxuICAgIC8vIE5vdGUgdGhhdCBib3RoIGNhc2VzIGFyZSBwb3NzaWJsZSBhbmQgdGhlIHNjYWxlIGZhY3RvcnMgY29tcG91bmQhXHJcbiAgICBpZiAoIFF1YWRyaWxhdGVyYWxRdWVyeVBhcmFtZXRlcnMucmVkdWNlZFN0ZXBTaXplICkge1xyXG4gICAgICBpbnRlcnZhbCA9IGludGVydmFsICogUXVhZHJpbGF0ZXJhbFF1ZXJ5UGFyYW1ldGVycy5yZWR1Y2VkU3RlcFNpemVUb2xlcmFuY2VJbnRlcnZhbFNjYWxlRmFjdG9yO1xyXG4gICAgfVxyXG4gICAgaWYgKCBRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzLmRldmljZUNvbm5lY3Rpb24gKSB7XHJcbiAgICAgIGludGVydmFsID0gaW50ZXJ2YWwgKiBRdWFkcmlsYXRlcmFsUXVlcnlQYXJhbWV0ZXJzLmNvbm5lY3RlZFRvbGVyYW5jZUludGVydmFsU2NhbGVGYWN0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGludGVydmFsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHR3byBhbmdsZXMgYXJlIGVxdWFsIHdpdGhpbiB0aGUgcHJvdmlkZWQgdG9sZXJhbmNlIGludGVydmFsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgaXNBbmdsZUVxdWFsVG9PdGhlciggYW5nbGUxOiBudW1iZXIsIGFuZ2xlMjogbnVtYmVyLCB0b2xlcmFuY2VJbnRlcnZhbDogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIFV0aWxzLmVxdWFsc0Vwc2lsb24oIGFuZ2xlMSwgYW5nbGUyLCB0b2xlcmFuY2VJbnRlcnZhbCApO1xyXG4gIH1cclxufVxyXG5cclxucXVhZHJpbGF0ZXJhbC5yZWdpc3RlciggJ1F1YWRyaWxhdGVyYWxTaGFwZU1vZGVsJywgUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFDN0UsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFDMUQsT0FBT0MsbUJBQW1CLE1BQU0sNENBQTRDO0FBRTVFLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFFeEQsT0FBT0MsMEJBQTBCLE1BQU0saUNBQWlDO0FBQ3hFLE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUM5RCxPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFDbEUsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBRXhELE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQUNoRSxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7O0FBRXBFOztBQVdBLGVBQWUsTUFBTUMsdUJBQXVCLENBQUM7RUFFM0M7O0VBT0E7O0VBT0E7O0VBS0E7O0VBR0E7O0VBR0E7O0VBR0E7RUFDQTtFQUdBO0VBQ0E7RUFDQTtFQUNBO0VBSUE7RUFDQTtFQUNBO0VBQ0E7RUFHQTtFQUdBO0VBQ0E7RUFHQTtFQUdBO0VBR0E7RUFHQTtFQUdBO0VBR0E7RUFHQTtFQUdBO0VBR0E7RUFHQTtFQUdBO0VBQ0E7RUFHQTtFQUdPQyxXQUFXQSxDQUFFQywwQkFBOEMsRUFBRUMsdUJBQWtELEVBQUVDLGVBQWdELEVBQUc7SUFFekssTUFBTUMsT0FBTyxHQUFHaEIsU0FBUyxDQUFpRSxDQUFDLENBQUU7TUFDM0ZpQixhQUFhLEVBQUUsSUFBSTtNQUNuQkMsTUFBTSxFQUFFakIsTUFBTSxDQUFDa0I7SUFDakIsQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLElBQUksQ0FBQ0UsYUFBYSxHQUFHRCxPQUFPLENBQUNDLGFBQWE7SUFFMUMsSUFBSSxDQUFDRyxnQkFBZ0IsR0FBRyxLQUFLO0lBQzdCLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUcsS0FBSztJQUMvQixJQUFJLENBQUNDLG1CQUFtQixHQUFHLEtBQUs7SUFFaEMsSUFBSSxDQUFDQyxPQUFPLEdBQUcsSUFBSTdCLG1CQUFtQixDQUFFLElBQUlKLE9BQU8sQ0FBRSxDQUFDLElBQUksRUFBRSxJQUFLLENBQUMsRUFBRVMsd0JBQXdCLENBQUN5QixRQUFRLEVBQUVWLHVCQUF1QixFQUFFRSxPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLFNBQVUsQ0FBRSxDQUFDO0lBQzFLLElBQUksQ0FBQ0MsT0FBTyxHQUFHLElBQUloQyxtQkFBbUIsQ0FBRSxJQUFJSixPQUFPLENBQUUsSUFBSSxFQUFFLElBQUssQ0FBQyxFQUFFUyx3QkFBd0IsQ0FBQzRCLFFBQVEsRUFBRWIsdUJBQXVCLEVBQUVFLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDTyxZQUFZLENBQUUsU0FBVSxDQUFFLENBQUM7SUFDekssSUFBSSxDQUFDRyxPQUFPLEdBQUcsSUFBSWxDLG1CQUFtQixDQUFFLElBQUlKLE9BQU8sQ0FBRSxJQUFJLEVBQUUsQ0FBQyxJQUFLLENBQUMsRUFBRVMsd0JBQXdCLENBQUM4QixRQUFRLEVBQUVmLHVCQUF1QixFQUFFRSxPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLFNBQVUsQ0FBRSxDQUFDO0lBQzFLLElBQUksQ0FBQ0ssT0FBTyxHQUFHLElBQUlwQyxtQkFBbUIsQ0FBRSxJQUFJSixPQUFPLENBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFLLENBQUMsRUFBRVMsd0JBQXdCLENBQUNnQyxRQUFRLEVBQUVqQix1QkFBdUIsRUFBRUUsT0FBTyxDQUFDRSxNQUFNLENBQUNPLFlBQVksQ0FBRSxTQUFVLENBQUUsQ0FBQztJQUMzSyxJQUFJLENBQUNPLFFBQVEsR0FBRyxDQUFFLElBQUksQ0FBQ1QsT0FBTyxFQUFFLElBQUksQ0FBQ0csT0FBTyxFQUFFLElBQUksQ0FBQ0UsT0FBTyxFQUFFLElBQUksQ0FBQ0UsT0FBTyxDQUFFO0lBRTFFLElBQUksQ0FBQ0csaUJBQWlCLEdBQUcsSUFBSUMsR0FBRyxDQUFFLENBQ2hDLENBQUUsSUFBSSxDQUFDWCxPQUFPLEVBQUUsSUFBSSxDQUFDSyxPQUFPLENBQUUsRUFDOUIsQ0FBRSxJQUFJLENBQUNGLE9BQU8sRUFBRSxJQUFJLENBQUNJLE9BQU8sQ0FBRSxFQUM5QixDQUFFLElBQUksQ0FBQ0YsT0FBTyxFQUFFLElBQUksQ0FBQ0wsT0FBTyxDQUFFLEVBQzlCLENBQUUsSUFBSSxDQUFDTyxPQUFPLEVBQUUsSUFBSSxDQUFDSixPQUFPLENBQUUsQ0FDOUIsQ0FBQztJQUVILElBQUksQ0FBQ1MsaUJBQWlCLEdBQUcsSUFBSUQsR0FBRyxDQUFFLENBQ2hDLENBQUUsSUFBSSxDQUFDWCxPQUFPLEVBQUUsQ0FBRSxJQUFJLENBQUNHLE9BQU8sRUFBRSxJQUFJLENBQUNJLE9BQU8sQ0FBRSxDQUFFLEVBQ2hELENBQUUsSUFBSSxDQUFDSixPQUFPLEVBQUUsQ0FBRSxJQUFJLENBQUNILE9BQU8sRUFBRSxJQUFJLENBQUNLLE9BQU8sQ0FBRSxDQUFFLEVBQ2hELENBQUUsSUFBSSxDQUFDQSxPQUFPLEVBQUUsQ0FBRSxJQUFJLENBQUNGLE9BQU8sRUFBRSxJQUFJLENBQUNJLE9BQU8sQ0FBRSxDQUFFLEVBQ2hELENBQUUsSUFBSSxDQUFDQSxPQUFPLEVBQUUsQ0FBRSxJQUFJLENBQUNQLE9BQU8sRUFBRSxJQUFJLENBQUNLLE9BQU8sQ0FBRSxDQUFFLENBQ2hELENBQUM7SUFFSCxJQUFJLENBQUNRLE1BQU0sR0FBRyxJQUFJM0MsaUJBQWlCLENBQUUsSUFBSSxDQUFDOEIsT0FBTyxFQUFFLElBQUksQ0FBQ0csT0FBTyxFQUFFakIsc0JBQXNCLENBQUM0QixPQUFPLEVBQUVyQixPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLFFBQVMsQ0FBRSxDQUFDO0lBQzFJLElBQUksQ0FBQ2EsTUFBTSxHQUFHLElBQUk3QyxpQkFBaUIsQ0FBRSxJQUFJLENBQUNpQyxPQUFPLEVBQUUsSUFBSSxDQUFDRSxPQUFPLEVBQUVuQixzQkFBc0IsQ0FBQzhCLE9BQU8sRUFBRXZCLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDTyxZQUFZLENBQUUsUUFBUyxDQUFFLENBQUM7SUFDMUksSUFBSSxDQUFDZSxNQUFNLEdBQUcsSUFBSS9DLGlCQUFpQixDQUFFLElBQUksQ0FBQ21DLE9BQU8sRUFBRSxJQUFJLENBQUNFLE9BQU8sRUFBRXJCLHNCQUFzQixDQUFDZ0MsT0FBTyxFQUFFekIsT0FBTyxDQUFDRSxNQUFNLENBQUNPLFlBQVksQ0FBRSxRQUFTLENBQUUsQ0FBQztJQUMxSSxJQUFJLENBQUNpQixNQUFNLEdBQUcsSUFBSWpELGlCQUFpQixDQUFFLElBQUksQ0FBQ3FDLE9BQU8sRUFBRSxJQUFJLENBQUNQLE9BQU8sRUFBRWQsc0JBQXNCLENBQUNrQyxPQUFPLEVBQUUzQixPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLFFBQVMsQ0FBRSxDQUFDO0lBQzFJLElBQUksQ0FBQ21CLEtBQUssR0FBRyxDQUFFLElBQUksQ0FBQ1IsTUFBTSxFQUFFLElBQUksQ0FBQ0UsTUFBTSxFQUFFLElBQUksQ0FBQ0UsTUFBTSxFQUFFLElBQUksQ0FBQ0UsTUFBTSxDQUFFO0lBRW5FLElBQUksQ0FBQ0csZUFBZSxHQUFHLElBQUlYLEdBQUcsQ0FBRSxDQUM5QixDQUFFLElBQUksQ0FBQ0UsTUFBTSxFQUFFLElBQUksQ0FBQ0ksTUFBTSxDQUFFLEVBQzVCLENBQUUsSUFBSSxDQUFDRixNQUFNLEVBQUUsSUFBSSxDQUFDSSxNQUFNLENBQUUsRUFDNUIsQ0FBRSxJQUFJLENBQUNGLE1BQU0sRUFBRSxJQUFJLENBQUNKLE1BQU0sQ0FBRSxFQUM1QixDQUFFLElBQUksQ0FBQ00sTUFBTSxFQUFFLElBQUksQ0FBQ0osTUFBTSxDQUFFLENBQzVCLENBQUM7SUFFSCxJQUFJLENBQUNRLGVBQWUsR0FBRyxJQUFJWixHQUFHLENBQUUsQ0FDOUIsQ0FBRSxJQUFJLENBQUNFLE1BQU0sRUFBRSxDQUFFLElBQUksQ0FBQ00sTUFBTSxFQUFFLElBQUksQ0FBQ0osTUFBTSxDQUFFLENBQUUsRUFDN0MsQ0FBRSxJQUFJLENBQUNBLE1BQU0sRUFBRSxDQUFFLElBQUksQ0FBQ0YsTUFBTSxFQUFFLElBQUksQ0FBQ0ksTUFBTSxDQUFFLENBQUUsRUFDN0MsQ0FBRSxJQUFJLENBQUNBLE1BQU0sRUFBRSxDQUFFLElBQUksQ0FBQ0YsTUFBTSxFQUFFLElBQUksQ0FBQ0ksTUFBTSxDQUFFLENBQUUsRUFDN0MsQ0FBRSxJQUFJLENBQUNBLE1BQU0sRUFBRSxDQUFFLElBQUksQ0FBQ0YsTUFBTSxFQUFFLElBQUksQ0FBQ0osTUFBTSxDQUFFLENBQUUsQ0FDN0MsQ0FBQztJQUVILElBQUksQ0FBQ1csZ0NBQWdDLEdBQUcsSUFBSTFELFFBQVEsQ0FBNkIsRUFBRyxDQUFDO0lBQ3JGLElBQUksQ0FBQzJELGdDQUFnQyxHQUFHLElBQUkzRCxRQUFRLENBQTZCLEVBQUcsQ0FBQztJQUNyRixJQUFJLENBQUM0RCw4QkFBOEIsR0FBRyxJQUFJNUQsUUFBUSxDQUEyQixFQUFHLENBQUM7SUFDakYsSUFBSSxDQUFDNkQsOEJBQThCLEdBQUcsSUFBSTdELFFBQVEsQ0FBMkIsRUFBRyxDQUFDO0lBQ2pGLElBQUksQ0FBQzhELHlCQUF5QixHQUFHLElBQUk5RCxRQUFRLENBQTJCLEVBQUcsQ0FBQzs7SUFFNUU7SUFDQSxJQUFJLENBQUNpRCxNQUFNLENBQUNjLGFBQWEsQ0FBRSxJQUFJLENBQUNoQixNQUFPLENBQUM7SUFDeEMsSUFBSSxDQUFDSSxNQUFNLENBQUNZLGFBQWEsQ0FBRSxJQUFJLENBQUNkLE1BQU8sQ0FBQztJQUN4QyxJQUFJLENBQUNJLE1BQU0sQ0FBQ1UsYUFBYSxDQUFFLElBQUksQ0FBQ1osTUFBTyxDQUFDO0lBQ3hDLElBQUksQ0FBQ0osTUFBTSxDQUFDZ0IsYUFBYSxDQUFFLElBQUksQ0FBQ1YsTUFBTyxDQUFDO0lBRXhDLElBQUksQ0FBQ1csaUJBQWlCLEdBQUcsSUFBSWxELG1CQUFtQixDQUFFWCxrQkFBa0IsQ0FBQzhELG9CQUFvQixFQUFFO01BQ3pGcEMsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLG1CQUFvQjtJQUMzRCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUM4QixZQUFZLEdBQUcsSUFBSTFELGNBQWMsQ0FBRSxDQUFDLEVBQUU7TUFDekNxQixNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDTyxZQUFZLENBQUUsY0FBZTtJQUN0RCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUMrQixtQkFBbUIsR0FBRyxJQUFJNUQsT0FBTyxDQUFNO01BQzFDc0IsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLHFCQUFzQjtJQUM3RCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNnQywyQkFBMkIsR0FBRzlDLHVCQUF1QixDQUFDK0MsMkJBQTJCLENBQUU1RCw0QkFBNEIsQ0FBQzJELDJCQUE0QixDQUFDO0lBQ2xKLElBQUksQ0FBQ0UsNEJBQTRCLEdBQUdoRCx1QkFBdUIsQ0FBQytDLDJCQUEyQixDQUFFNUQsNEJBQTRCLENBQUM2RCw0QkFBNkIsQ0FBQztJQUNwSixJQUFJLENBQUNDLDRCQUE0QixHQUFHakQsdUJBQXVCLENBQUMrQywyQkFBMkIsQ0FBRTVELDRCQUE0QixDQUFDOEQsNEJBQTZCLENBQUM7SUFFcEosSUFBSSxDQUFDQywrQkFBK0IsR0FBRyxJQUFJM0QsbUJBQW1CLENBQzVELElBQUlJLHFCQUFxQixDQUFFLElBQUksQ0FBQzhCLE1BQU0sRUFBRSxJQUFJLENBQUNJLE1BQU8sQ0FBQyxFQUNyRCxJQUFJLENBQUNnQixtQkFBbUIsRUFDeEJ4QyxPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLGlDQUFrQyxDQUNqRSxDQUFDO0lBRUQsSUFBSSxDQUFDcUMsK0JBQStCLEdBQUcsSUFBSTVELG1CQUFtQixDQUM1RCxJQUFJSSxxQkFBcUIsQ0FBRSxJQUFJLENBQUNnQyxNQUFNLEVBQUUsSUFBSSxDQUFDSSxNQUFPLENBQUMsRUFDckQsSUFBSSxDQUFDYyxtQkFBbUIsRUFDeEJ4QyxPQUFPLENBQUNFLE1BQU0sQ0FBQ08sWUFBWSxDQUFFLGlDQUFrQyxDQUNqRSxDQUFDO0lBRUQsSUFBSSxDQUFDc0Msb0JBQW9CLEdBQUcsQ0FDMUIsSUFBSSxDQUFDRiwrQkFBK0IsRUFDcEMsSUFBSSxDQUFDQywrQkFBK0IsQ0FDckM7SUFFRCxJQUFJLENBQUNqRCwwQkFBMEIsR0FBR0EsMEJBQTBCO0lBRTVELElBQUksQ0FBQ21ELGtCQUFrQixHQUFHLEtBQUs7SUFFL0I1RCxTQUFTLENBQUM2RCxTQUFTLENBQUUsQ0FDakIsSUFBSSxDQUFDMUMsT0FBTyxDQUFDMkMsZ0JBQWdCLEVBQzdCLElBQUksQ0FBQ3hDLE9BQU8sQ0FBQ3dDLGdCQUFnQixFQUM3QixJQUFJLENBQUN0QyxPQUFPLENBQUNzQyxnQkFBZ0IsRUFDN0IsSUFBSSxDQUFDcEMsT0FBTyxDQUFDb0MsZ0JBQWdCLENBQUUsRUFDakMsQ0FBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxLQUFNO01BRWhEO01BQ0EsSUFBSSxDQUFDQyw4QkFBOEIsQ0FBQyxDQUFDOztNQUVyQztNQUNBLElBQUksQ0FBQ2YsbUJBQW1CLENBQUNnQixJQUFJLENBQUMsQ0FBQzs7TUFFL0I7TUFDQSxJQUFJLENBQUNDLGtCQUFrQixDQUFDLENBQUM7SUFDM0IsQ0FDRixDQUFDO0lBRUQsSUFBSSxDQUFDekMsUUFBUSxDQUFDMEMsT0FBTyxDQUFFQyxNQUFNLElBQUk7TUFDL0JBLE1BQU0sQ0FBQ0MsbUJBQW1CLENBQUNDLElBQUksQ0FBRUMsWUFBWSxJQUFJO1FBRS9DO1FBQ0E7UUFDQSxNQUFNQyxvQkFBb0IsR0FBR3JFLHNCQUFzQixDQUFDc0Usa0NBQWtDLEdBQUcsQ0FBQztRQUMxRkwsTUFBTSxDQUFDTSxzQkFBc0IsQ0FBQ0MsS0FBSyxHQUFHdkYsS0FBSyxDQUFDd0YsYUFBYSxDQUFFTCxZQUFZLENBQUNNLElBQUksRUFBRTFFLHNCQUFzQixDQUFDMkUsWUFBWSxDQUFDRCxJQUFJLEVBQUVMLG9CQUFxQixDQUFDO1FBQzlJSixNQUFNLENBQUNXLHdCQUF3QixDQUFDSixLQUFLLEdBQUd2RixLQUFLLENBQUN3RixhQUFhLENBQUVMLFlBQVksQ0FBQ1MsSUFBSSxFQUFFN0Usc0JBQXNCLENBQUMyRSxZQUFZLENBQUNFLElBQUksRUFBRVIsb0JBQXFCLENBQUM7UUFDaEpKLE1BQU0sQ0FBQ2EseUJBQXlCLENBQUNOLEtBQUssR0FBR3ZGLEtBQUssQ0FBQ3dGLGFBQWEsQ0FBRUwsWUFBWSxDQUFDVyxJQUFJLEVBQUUvRSxzQkFBc0IsQ0FBQzJFLFlBQVksQ0FBQ0ksSUFBSSxFQUFFVixvQkFBcUIsQ0FBQztRQUNqSkosTUFBTSxDQUFDZSx1QkFBdUIsQ0FBQ1IsS0FBSyxHQUFHdkYsS0FBSyxDQUFDd0YsYUFBYSxDQUFFTCxZQUFZLENBQUNhLElBQUksRUFBRWpGLHNCQUFzQixDQUFDMkUsWUFBWSxDQUFDTSxJQUFJLEVBQUVaLG9CQUFxQixDQUFDO01BQ2pKLENBQUUsQ0FBQztJQUNMLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtFQUNTYSxvQkFBb0JBLENBQUEsRUFBWTtJQUNyQyxPQUFPLElBQUksQ0FBQ3ZFLGtCQUFrQjtFQUNoQzs7RUFFQTtBQUNGO0FBQ0E7RUFDVXdFLHVCQUF1QkEsQ0FBQSxFQUFTO0lBQ3RDLElBQUksQ0FBQ3hFLGtCQUFrQixHQUFHeUUsQ0FBQyxDQUFDQyxLQUFLLENBQUUsSUFBSSxDQUFDL0QsUUFBUSxFQUFFMkMsTUFBTSxJQUFJLElBQUksQ0FBQ3FCLFlBQVksQ0FBRXJCLE1BQU0sQ0FBQ3NCLGFBQWEsQ0FBQ2YsS0FBTyxDQUFFLENBQUM7RUFDaEg7O0VBRUE7QUFDRjtBQUNBO0VBQ1NnQixxQkFBcUJBLENBQUEsRUFBWTtJQUN0QyxPQUFPLElBQUksQ0FBQzVFLG1CQUFtQjtFQUNqQzs7RUFFQTtBQUNGO0FBQ0E7RUFDVTZFLHdCQUF3QkEsQ0FBQSxFQUFTO0lBQ3ZDLElBQUksQ0FBQzdFLG1CQUFtQixHQUFHLElBQUksQ0FBQzhFLHlCQUF5QixDQUFFLElBQUksQ0FBQ2hFLE1BQU0sQ0FBQ2lFLGNBQWMsQ0FBQ25CLEtBQUssRUFBRSxJQUFJLENBQUM1QyxNQUFNLENBQUMrRCxjQUFjLENBQUNuQixLQUFNLENBQUMsSUFDcEcsSUFBSSxDQUFDa0IseUJBQXlCLENBQUUsSUFBSSxDQUFDOUQsTUFBTSxDQUFDK0QsY0FBYyxDQUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQzFDLE1BQU0sQ0FBQzZELGNBQWMsQ0FBQ25CLEtBQU0sQ0FBQyxJQUNwRyxJQUFJLENBQUNrQix5QkFBeUIsQ0FBRSxJQUFJLENBQUM1RCxNQUFNLENBQUM2RCxjQUFjLENBQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDeEMsTUFBTSxDQUFDMkQsY0FBYyxDQUFDbkIsS0FBTSxDQUFDLElBQ3BHLElBQUksQ0FBQ2tCLHlCQUF5QixDQUFFLElBQUksQ0FBQzFELE1BQU0sQ0FBQzJELGNBQWMsQ0FBQ25CLEtBQUssRUFBRSxJQUFJLENBQUM5QyxNQUFNLENBQUNpRSxjQUFjLENBQUNuQixLQUFNLENBQUM7RUFDakk7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1VvQixPQUFPQSxDQUFBLEVBQVc7SUFDeEIsTUFBTUMsQ0FBQyxHQUFHLElBQUksQ0FBQ25FLE1BQU0sQ0FBQ2lFLGNBQWMsQ0FBQ25CLEtBQUs7SUFDMUMsTUFBTXNCLENBQUMsR0FBRyxJQUFJLENBQUNsRSxNQUFNLENBQUMrRCxjQUFjLENBQUNuQixLQUFLO0lBQzFDLE1BQU11QixDQUFDLEdBQUcsSUFBSSxDQUFDakUsTUFBTSxDQUFDNkQsY0FBYyxDQUFDbkIsS0FBSztJQUMxQyxNQUFNd0IsQ0FBQyxHQUFHLElBQUksQ0FBQ2hFLE1BQU0sQ0FBQzJELGNBQWMsQ0FBQ25CLEtBQUs7O0lBRTFDO0lBQ0EsTUFBTXlCLFVBQVUsR0FBRyxJQUFJLENBQUNwRixPQUFPLENBQUMwRSxhQUFhLENBQUNmLEtBQU07SUFDcEQsTUFBTTBCLFdBQVcsR0FBRyxJQUFJLENBQUNoRixPQUFPLENBQUNxRSxhQUFhLENBQUNmLEtBQU07O0lBRXJEO0lBQ0EsTUFBTTJCLENBQUMsR0FBRyxDQUFFTixDQUFDLEdBQUdDLENBQUMsR0FBR0MsQ0FBQyxHQUFHQyxDQUFDLElBQUssQ0FBQztJQUUvQixNQUFNSSxNQUFNLEdBQUdDLElBQUksQ0FBQ0MsR0FBRyxDQUFFLENBQUVMLFVBQVUsR0FBR0MsV0FBVyxJQUFLLENBQUUsQ0FBQztJQUMzRCxNQUFNSyxJQUFJLEdBQUdGLElBQUksQ0FBQ0csSUFBSSxDQUFFLENBQUVMLENBQUMsR0FBR04sQ0FBQyxLQUFPTSxDQUFDLEdBQUdMLENBQUMsQ0FBRSxJQUFLSyxDQUFDLEdBQUdKLENBQUMsQ0FBRSxJQUFLSSxDQUFDLEdBQUdILENBQUMsQ0FBRSxHQUFLSCxDQUFDLEdBQUdDLENBQUMsR0FBR0MsQ0FBQyxHQUFHQyxDQUFDLEdBQUtJLE1BQU0sR0FBR0EsTUFBTyxDQUFDO0lBRTdHLE1BQU1LLFNBQVMsR0FBR0MsS0FBSyxDQUFFSCxJQUFLLENBQUM7O0lBRS9CO0lBQ0E7SUFDQSxJQUFLLElBQUksQ0FBQ2hHLGFBQWEsRUFBRztNQUN4Qm9HLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNGLFNBQVMsRUFBRSxpREFBa0QsQ0FBQztJQUNuRjtJQUNBLE9BQU9BLFNBQVMsR0FBRyxDQUFDLEdBQUdGLElBQUk7RUFDN0I7O0VBRUE7QUFDRjtBQUNBO0VBQ1NLLHdCQUF3QkEsQ0FBRUMsTUFBYyxFQUFFQyxNQUFjLEVBQVk7SUFDekUsT0FBTzdILEtBQUssQ0FBQ3dGLGFBQWEsQ0FBRW9DLE1BQU0sRUFBRUMsTUFBTSxFQUFFLElBQUksQ0FBQy9ELDJCQUE0QixDQUFDO0VBQ2hGOztFQUVBO0FBQ0Y7QUFDQTtFQUNTMkMseUJBQXlCQSxDQUFFcUIsT0FBZSxFQUFFQyxPQUFlLEVBQVk7SUFDNUUsT0FBTy9ILEtBQUssQ0FBQ3dGLGFBQWEsQ0FBRXNDLE9BQU8sRUFBRUMsT0FBTyxFQUFFLElBQUksQ0FBQzlELDRCQUE2QixDQUFDO0VBQ25GOztFQUVBO0FBQ0Y7QUFDQTtFQUNTb0MsWUFBWUEsQ0FBRTJCLEtBQWEsRUFBWTtJQUM1QyxPQUFPaEksS0FBSyxDQUFDd0YsYUFBYSxDQUFFd0MsS0FBSyxFQUFFWixJQUFJLENBQUNhLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDakUsNEJBQTZCLENBQUM7RUFDckY7O0VBRUE7QUFDRjtBQUNBO0VBQ1NrRSxlQUFlQSxDQUFBLEVBQVk7SUFDaEMsT0FBTyxJQUFJLENBQUN6RyxnQkFBZ0I7RUFDOUI7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDUzBHLHlCQUF5QkEsQ0FBRUgsS0FBYSxFQUFFSSxVQUFrQixFQUFZO0lBQzdFLE9BQU9wSSxLQUFLLENBQUN3RixhQUFhLENBQUV3QyxLQUFLLEVBQUVJLFVBQVUsRUFBRSxJQUFJLENBQUNwRSw0QkFBNkIsQ0FBQztFQUNwRjs7RUFFQTtBQUNGO0FBQ0E7RUFDU3FFLFdBQVdBLENBQUVMLEtBQWEsRUFBWTtJQUMzQyxPQUFPLElBQUksQ0FBQ0cseUJBQXlCLENBQUVILEtBQUssRUFBRVosSUFBSSxDQUFDYSxFQUFHLENBQUM7RUFDekQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNTSyxrQkFBa0JBLENBQUVDLGtCQUFvRCxFQUFTO0lBRXRGLElBQUksQ0FBQ0MscUJBQXFCLENBQUUsSUFBSyxDQUFDO0lBRWxDRCxrQkFBa0IsQ0FBQ3hELE9BQU8sQ0FBRSxDQUFFMEQsYUFBYSxFQUFFQyxRQUFRLEtBQU07TUFDekQsTUFBTTFELE1BQU0sR0FBRyxJQUFJLENBQUMyRCxpQkFBaUIsQ0FBRUQsUUFBUyxDQUFDOztNQUVqRDtNQUNBO01BQ0EsSUFBSyxDQUFDRCxhQUFhLENBQUNHLE1BQU0sQ0FBRTVELE1BQU0sQ0FBQ1QsZ0JBQWdCLENBQUNnQixLQUFNLENBQUMsRUFBRztRQUM1RFAsTUFBTSxDQUFDVCxnQkFBZ0IsQ0FBQ2dCLEtBQUssR0FBR2tELGFBQWE7TUFDL0M7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNELHFCQUFxQixDQUFFLEtBQU0sQ0FBQztFQUNyQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDUzVELDhCQUE4QkEsQ0FBQSxFQUFTO0lBRTVDO0lBQ0EsSUFBSSxDQUFDdkMsUUFBUSxDQUFDMEMsT0FBTyxDQUFFQyxNQUFNLElBQUk7TUFDL0JBLE1BQU0sQ0FBQzZELFdBQVcsQ0FBQyxDQUFDO0lBQ3RCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQzVGLEtBQUssQ0FBQzhCLE9BQU8sQ0FBRStELElBQUksSUFBSTtNQUMxQkEsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBQyxDQUFDO0lBQzdCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0MsNEJBQTRCLENBQUMsQ0FBQzs7SUFFbkM7SUFDQSxJQUFJLENBQUNDLDRCQUE0QixDQUFDLENBQUM7SUFDbkMsSUFBSSxDQUFDQywyQkFBMkIsQ0FBQyxDQUFDOztJQUVsQztJQUNBLElBQUksQ0FBQ3RGLFlBQVksQ0FBQ3VGLEdBQUcsQ0FBRSxJQUFJLENBQUN4QyxPQUFPLENBQUMsQ0FBRSxDQUFDO0lBQ3ZDLElBQUksQ0FBQ1QsdUJBQXVCLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUNNLHdCQUF3QixDQUFDLENBQUM7O0lBRS9CO0lBQ0EsSUFBSSxDQUFDOUMsaUJBQWlCLENBQUN5RixHQUFHLENBQUV6SSwwQkFBMEIsQ0FBQzBJLFlBQVksQ0FBRSxJQUFLLENBQUUsQ0FBQztFQUMvRTs7RUFFQTtBQUNGO0FBQ0E7RUFDVUgsNEJBQTRCQSxDQUFBLEVBQVM7SUFDM0MsSUFBSSxDQUFDSSxzQkFBc0IsQ0FBRSxJQUFJLENBQUNqRyxnQ0FBZ0MsRUFBRSxJQUFJLENBQUNaLGlCQUFrQixDQUFDO0lBQzVGLElBQUksQ0FBQzZHLHNCQUFzQixDQUFFLElBQUksQ0FBQ2hHLGdDQUFnQyxFQUFFLElBQUksQ0FBQ2YsaUJBQWtCLENBQUM7RUFDOUY7O0VBRUE7QUFDRjtBQUNBO0VBQ1UrRyxzQkFBc0JBLENBQUVDLHdCQUE2RCxFQUFFQyxTQUFnRixFQUFTO0lBQ3RMLE1BQU1DLGtCQUFrQixHQUFHRix3QkFBd0IsQ0FBQy9ELEtBQUs7SUFDekRnRSxTQUFTLENBQUN4RSxPQUFPLENBQUUsQ0FBRTBFLGVBQWUsRUFBRUMsU0FBUyxFQUFFQyxHQUFHLEtBQU07TUFFeEQsTUFBTUMsb0JBQW9CLEdBQUdDLEtBQUssQ0FBQ0MsT0FBTyxDQUFFTCxlQUFnQixDQUFDLEdBQUdBLGVBQWUsR0FBRyxDQUFFQSxlQUFlLENBQUU7TUFDckdHLG9CQUFvQixDQUFDN0UsT0FBTyxDQUFFZ0YsYUFBYSxJQUFJO1FBQzdDLE1BQU1DLFVBQVUsR0FBRyxJQUFJcEosdUJBQXVCLENBQUU4SSxTQUFTLEVBQUVLLGFBQWMsQ0FBQztRQUUxRSxNQUFNL0MsVUFBVSxHQUFHZ0QsVUFBVSxDQUFDQyxVQUFVLENBQUMzRCxhQUFhLENBQUNmLEtBQU07UUFDN0QsTUFBTTBCLFdBQVcsR0FBRytDLFVBQVUsQ0FBQ0UsVUFBVSxDQUFDNUQsYUFBYSxDQUFDZixLQUFNO1FBQzlELE1BQU00RSxjQUFjLEdBQUcsSUFBSSxDQUFDeEMsd0JBQXdCLENBQUVYLFVBQVUsRUFBRUMsV0FBWSxDQUFDO1FBQy9FLE1BQU1tRCxpQkFBaUIsR0FBR2pFLENBQUMsQ0FBQ2tFLFNBQVMsQ0FBRWIsa0JBQWtCLEVBQUVjLGlCQUFpQixJQUFJQSxpQkFBaUIsQ0FBQzFCLE1BQU0sQ0FBRW9CLFVBQVcsQ0FBRSxDQUFDO1FBQ3hILE1BQU1PLDJCQUEyQixHQUFHSCxpQkFBaUIsR0FBRyxDQUFDLENBQUM7UUFFMUQsSUFBS0csMkJBQTJCLElBQUksQ0FBQ0osY0FBYyxFQUFHO1VBRXBEO1VBQ0FYLGtCQUFrQixDQUFDZ0IsTUFBTSxDQUFFSixpQkFBaUIsRUFBRSxDQUFFLENBQUM7VUFDakRkLHdCQUF3QixDQUFDbUIscUJBQXFCLENBQUMsQ0FBQztRQUNsRCxDQUFDLE1BQ0ksSUFBSyxDQUFDRiwyQkFBMkIsSUFBSUosY0FBYyxFQUFHO1VBRXpEO1VBQ0FYLGtCQUFrQixDQUFDa0IsSUFBSSxDQUFFVixVQUFXLENBQUM7VUFDckNWLHdCQUF3QixDQUFDbUIscUJBQXFCLENBQUMsQ0FBQztRQUNsRDtNQUNGLENBQUUsQ0FBQztJQUNMLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtFQUNVdkIsMkJBQTJCQSxDQUFBLEVBQVM7SUFDMUMsSUFBSSxDQUFDeUIsb0JBQW9CLENBQUUsSUFBSSxDQUFDckgsOEJBQThCLEVBQUUsSUFBSSxDQUFDSCxlQUFnQixDQUFDO0lBQ3RGLElBQUksQ0FBQ3dILG9CQUFvQixDQUFFLElBQUksQ0FBQ3BILDhCQUE4QixFQUFFLElBQUksQ0FBQ0wsZUFBZ0IsQ0FBQztFQUN4Rjs7RUFFQTtBQUNGO0FBQ0E7RUFDVXlILG9CQUFvQkEsQ0FBRUMsc0JBQXlELEVBQUVDLE9BQXdFLEVBQVM7SUFDeEssTUFBTUMsZ0JBQWdCLEdBQUdGLHNCQUFzQixDQUFDckYsS0FBSztJQUVyRHNGLE9BQU8sQ0FBQzlGLE9BQU8sQ0FBRSxDQUFFZ0csWUFBWSxFQUFFQyxPQUFPLEtBQU07TUFFNUMsTUFBTUMsaUJBQWlCLEdBQUdwQixLQUFLLENBQUNDLE9BQU8sQ0FBRWlCLFlBQWEsQ0FBQyxHQUFHQSxZQUFZLEdBQUcsQ0FBRUEsWUFBWSxDQUFFO01BQ3pGRSxpQkFBaUIsQ0FBQ2xHLE9BQU8sQ0FBRW1HLFdBQVcsSUFBSTtRQUN4QyxNQUFNQyxRQUFRLEdBQUcsSUFBSXhLLHFCQUFxQixDQUFFcUssT0FBTyxFQUFFRSxXQUFZLENBQUM7UUFFbEUsTUFBTUUsV0FBVyxHQUFHRCxRQUFRLENBQUNsQixVQUFVLENBQUN2RCxjQUFjLENBQUNuQixLQUFLO1FBQzVELE1BQU04RixZQUFZLEdBQUdGLFFBQVEsQ0FBQ2pCLFVBQVUsQ0FBQ3hELGNBQWMsQ0FBQ25CLEtBQUs7UUFDN0QsTUFBTStGLGVBQWUsR0FBRyxJQUFJLENBQUM3RSx5QkFBeUIsQ0FBRTJFLFdBQVcsRUFBRUMsWUFBYSxDQUFDO1FBQ25GLE1BQU1FLGVBQWUsR0FBR3BGLENBQUMsQ0FBQ2tFLFNBQVMsQ0FBRVMsZ0JBQWdCLEVBQUVVLGVBQWUsSUFBSUEsZUFBZSxDQUFDNUMsTUFBTSxDQUFFdUMsUUFBUyxDQUFFLENBQUM7UUFDOUcsTUFBTU0seUJBQXlCLEdBQUdGLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFFdEQsSUFBS0UseUJBQXlCLElBQUksQ0FBQ0gsZUFBZSxFQUFHO1VBRW5EO1VBQ0FSLGdCQUFnQixDQUFDTixNQUFNLENBQUVlLGVBQWUsRUFBRSxDQUFFLENBQUM7VUFDN0NYLHNCQUFzQixDQUFDSCxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2hELENBQUMsTUFDSSxJQUFLLENBQUNnQix5QkFBeUIsSUFBSUgsZUFBZSxFQUFHO1VBRXhEO1VBQ0FSLGdCQUFnQixDQUFDSixJQUFJLENBQUVTLFFBQVMsQ0FBQztVQUNqQ1Asc0JBQXNCLENBQUNILHFCQUFxQixDQUFDLENBQUM7UUFDaEQ7TUFDRixDQUFFLENBQUM7SUFDTCxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNVekIsNEJBQTRCQSxDQUFBLEVBQVM7SUFDM0MsTUFBTTBDLG9CQUFvQixHQUFHLElBQUksQ0FBQ3hILCtCQUErQixDQUFDeUgsZ0JBQWdCLENBQUMsQ0FBQztJQUNwRixNQUFNQyxvQkFBb0IsR0FBRyxJQUFJLENBQUN6SCwrQkFBK0IsQ0FBQ3dILGdCQUFnQixDQUFDLENBQUM7SUFFcEYsSUFBSSxDQUFDbEssZ0JBQWdCLEdBQUdpSyxvQkFBb0IsSUFBSUUsb0JBQW9CO0lBRXBFLE1BQU1DLHlCQUF5QixHQUFHLElBQUksQ0FBQ3JJLHlCQUF5QixDQUFDK0IsS0FBSztJQUN0RSxNQUFNdUcsd0JBQXdCLEdBQUcsRUFBRTtJQUNuQyxJQUFLSixvQkFBb0IsRUFBRztNQUMxQkksd0JBQXdCLENBQUNwQixJQUFJLENBQUUsSUFBSSxDQUFDeEcsK0JBQStCLENBQUNpSCxRQUFTLENBQUM7SUFDaEY7SUFDQSxJQUFLUyxvQkFBb0IsRUFBRztNQUMxQkUsd0JBQXdCLENBQUNwQixJQUFJLENBQUUsSUFBSSxDQUFDdkcsK0JBQStCLENBQUNnSCxRQUFTLENBQUM7SUFDaEY7SUFFQSxJQUFLLENBQUNoRixDQUFDLENBQUM0RixPQUFPLENBQUVGLHlCQUF5QixFQUFFQyx3QkFBeUIsQ0FBQyxFQUFHO01BQ3ZFLElBQUksQ0FBQ3RJLHlCQUF5QixDQUFDK0IsS0FBSyxHQUFHdUcsd0JBQXdCO0lBQ2pFO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0VBQ1NFLFlBQVlBLENBQUVDLEtBQThCLEVBQVM7SUFFMUQ7SUFDQTtJQUNBLElBQUksQ0FBQ3pELHFCQUFxQixDQUFFLElBQUssQ0FBQztJQUVsQyxJQUFJLENBQUM1RyxPQUFPLENBQUMyQyxnQkFBZ0IsQ0FBQzRFLEdBQUcsQ0FBRThDLEtBQUssQ0FBQ3JLLE9BQU8sQ0FBQzJDLGdCQUFnQixDQUFDZ0IsS0FBTSxDQUFDO0lBQ3pFLElBQUksQ0FBQ3hELE9BQU8sQ0FBQ3dDLGdCQUFnQixDQUFDNEUsR0FBRyxDQUFFOEMsS0FBSyxDQUFDbEssT0FBTyxDQUFDd0MsZ0JBQWdCLENBQUNnQixLQUFNLENBQUM7SUFDekUsSUFBSSxDQUFDdEQsT0FBTyxDQUFDc0MsZ0JBQWdCLENBQUM0RSxHQUFHLENBQUU4QyxLQUFLLENBQUNoSyxPQUFPLENBQUNzQyxnQkFBZ0IsQ0FBQ2dCLEtBQU0sQ0FBQztJQUN6RSxJQUFJLENBQUNwRCxPQUFPLENBQUNvQyxnQkFBZ0IsQ0FBQzRFLEdBQUcsQ0FBRThDLEtBQUssQ0FBQzlKLE9BQU8sQ0FBQ29DLGdCQUFnQixDQUFDZ0IsS0FBTSxDQUFDO0lBRXpFLElBQUksQ0FBQ2lELHFCQUFxQixDQUFFLEtBQU0sQ0FBQztFQUNyQzs7RUFFQTtBQUNGO0FBQ0E7RUFDU0csaUJBQWlCQSxDQUFFdUQsV0FBcUMsRUFBd0I7SUFDckYsTUFBTUMsY0FBYyxHQUFHaEcsQ0FBQyxDQUFDaUcsSUFBSSxDQUFFLElBQUksQ0FBQy9KLFFBQVEsRUFBRTJDLE1BQU0sSUFBSUEsTUFBTSxDQUFDa0gsV0FBVyxLQUFLQSxXQUFZLENBQUM7SUFFNUZ4RSxNQUFNLElBQUlBLE1BQU0sQ0FBRXlFLGNBQWMsRUFBRSxnQ0FBaUMsQ0FBQztJQUNwRSxPQUFPQSxjQUFjO0VBQ3ZCOztFQUVBO0FBQ0Y7QUFDQTtFQUNVckgsa0JBQWtCQSxDQUFBLEVBQVM7SUFFakM7SUFDQTtJQUNBLE1BQU11SCxhQUFhLEdBQUd0TCxzQkFBc0IsQ0FBQzJFLFlBQVksQ0FBQzRHLE9BQU8sQ0FBRSxDQUFFLENBQUM7SUFFdEUsSUFBSSxDQUFDMUssT0FBTyxDQUFDMkssZ0JBQWdCLENBQUNwRCxHQUFHLENBQUV0SSxrQkFBa0IsQ0FBQzJMLGdCQUFnQixDQUFFSCxhQUFhLEVBQUUsSUFBSSxDQUFDekssT0FBTyxFQUFFLElBQUksQ0FBQ0csT0FBTyxFQUFFLElBQUksQ0FBQ0UsT0FBTyxFQUFFLElBQUksQ0FBQ0UsT0FBTyxFQUFFLElBQUksQ0FBQ2IsYUFBYyxDQUFFLENBQUM7SUFDckssSUFBSSxDQUFDUyxPQUFPLENBQUN3SyxnQkFBZ0IsQ0FBQ3BELEdBQUcsQ0FBRXRJLGtCQUFrQixDQUFDMkwsZ0JBQWdCLENBQUVILGFBQWEsRUFBRSxJQUFJLENBQUN0SyxPQUFPLEVBQUUsSUFBSSxDQUFDRSxPQUFPLEVBQUUsSUFBSSxDQUFDRSxPQUFPLEVBQUUsSUFBSSxDQUFDUCxPQUFPLEVBQUUsSUFBSSxDQUFDTixhQUFjLENBQUUsQ0FBQztJQUNySyxJQUFJLENBQUNXLE9BQU8sQ0FBQ3NLLGdCQUFnQixDQUFDcEQsR0FBRyxDQUFFdEksa0JBQWtCLENBQUMyTCxnQkFBZ0IsQ0FBRUgsYUFBYSxFQUFFLElBQUksQ0FBQ3BLLE9BQU8sRUFBRSxJQUFJLENBQUNFLE9BQU8sRUFBRSxJQUFJLENBQUNQLE9BQU8sRUFBRSxJQUFJLENBQUNHLE9BQU8sRUFBRSxJQUFJLENBQUNULGFBQWMsQ0FBRSxDQUFDO0lBQ3JLLElBQUksQ0FBQ2EsT0FBTyxDQUFDb0ssZ0JBQWdCLENBQUNwRCxHQUFHLENBQUV0SSxrQkFBa0IsQ0FBQzJMLGdCQUFnQixDQUFFSCxhQUFhLEVBQUUsSUFBSSxDQUFDbEssT0FBTyxFQUFFLElBQUksQ0FBQ1AsT0FBTyxFQUFFLElBQUksQ0FBQ0csT0FBTyxFQUFFLElBQUksQ0FBQ0UsT0FBTyxFQUFFLElBQUksQ0FBQ1gsYUFBYyxDQUFFLENBQUM7RUFDdks7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU2tILHFCQUFxQkEsQ0FBRWlFLFFBQWlCLEVBQVM7SUFDdEQvRSxNQUFNLElBQUlBLE1BQU0sQ0FBRStFLFFBQVEsS0FBSyxJQUFJLENBQUNwSSxrQkFBa0IsRUFBRSwwRUFBMkUsQ0FBQztJQUNwSSxJQUFJLENBQUNBLGtCQUFrQixHQUFHb0ksUUFBUTs7SUFFbEM7SUFDQSxNQUFNQyx1QkFBdUIsR0FBRyxJQUFJLENBQUNySyxRQUFRLENBQUNzSCxHQUFHLENBQUUzRSxNQUFNLElBQUlBLE1BQU0sQ0FBQ3dELHFCQUFxQixDQUFFaUUsUUFBUyxDQUFFLENBQUM7O0lBRXZHO0lBQ0FDLHVCQUF1QixDQUFDM0gsT0FBTyxDQUFFNEgsZ0JBQWdCLElBQUlBLGdCQUFnQixJQUFJQSxnQkFBZ0IsQ0FBQyxDQUFFLENBQUM7RUFDL0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0MsS0FBS0EsQ0FBQSxFQUFTO0lBRW5CO0lBQ0EsSUFBSSxDQUFDcEUscUJBQXFCLENBQUUsSUFBSyxDQUFDO0lBRWxDLElBQUksQ0FBQzVHLE9BQU8sQ0FBQ2dMLEtBQUssQ0FBQyxDQUFDO0lBQ3BCLElBQUksQ0FBQzdLLE9BQU8sQ0FBQzZLLEtBQUssQ0FBQyxDQUFDO0lBQ3BCLElBQUksQ0FBQzNLLE9BQU8sQ0FBQzJLLEtBQUssQ0FBQyxDQUFDO0lBQ3BCLElBQUksQ0FBQ3pLLE9BQU8sQ0FBQ3lLLEtBQUssQ0FBQyxDQUFDOztJQUVwQjtJQUNBLElBQUksQ0FBQ3BFLHFCQUFxQixDQUFFLEtBQU0sQ0FBQztJQUVuQyxJQUFJLENBQUM1RCw4QkFBOEIsQ0FBQyxDQUFDO0VBQ3ZDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NpSSxhQUFhQSxDQUFBLEVBQVM7SUFDM0IsSUFBSSxDQUFDM0wsMEJBQTBCLENBQUNxRSxLQUFLLEdBQUcsS0FBSztJQUM3QyxJQUFJLENBQUNxSCxLQUFLLENBQUMsQ0FBQztJQUNaLElBQUksQ0FBQzFMLDBCQUEwQixDQUFDcUUsS0FBSyxHQUFHLElBQUk7RUFDOUM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRSxPQUFldUgsZ0NBQWdDQSxDQUFFQyxVQUFtQyxFQUFZO0lBQzlGLE9BQU81RyxDQUFDLENBQUNDLEtBQUssQ0FBRTJHLFVBQVUsQ0FBQzFLLFFBQVEsRUFBRTJDLE1BQU0sSUFBSTtNQUM3QyxPQUFPakUsc0JBQXNCLENBQUMyRSxZQUFZLENBQUNzSCxjQUFjLENBQUVoSSxNQUFNLENBQUNDLG1CQUFtQixDQUFDTSxLQUFNLENBQUM7SUFDL0YsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRSxPQUFjMEgsOEJBQThCQSxDQUFFRixVQUFtQyxFQUFZO0lBQzNGLElBQUlHLFlBQVksR0FBRyxJQUFJO0lBRXZCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSixVQUFVLENBQUMxSyxRQUFRLENBQUMrSyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ3JELE1BQU1FLFVBQVUsR0FBR04sVUFBVSxDQUFDMUssUUFBUSxDQUFFOEssQ0FBQyxDQUFFOztNQUUzQztNQUNBLElBQUtELFlBQVksRUFBRztRQUNsQixLQUFNLElBQUlJLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1AsVUFBVSxDQUFDMUssUUFBUSxDQUFDK0ssTUFBTSxFQUFFRSxDQUFDLEVBQUUsRUFBRztVQUNyRCxNQUFNQyxXQUFXLEdBQUdSLFVBQVUsQ0FBQzFLLFFBQVEsQ0FBRWlMLENBQUMsQ0FBRTtVQUU1QyxJQUFLRCxVQUFVLEtBQUtFLFdBQVcsRUFBRztZQUNoQ0wsWUFBWSxHQUFHLENBQUNHLFVBQVUsQ0FBQ0csYUFBYSxDQUFFRCxXQUFZLENBQUM7WUFFdkQsSUFBSyxDQUFDTCxZQUFZLEVBQUc7Y0FDbkI7WUFDRjtVQUNGO1FBQ0Y7TUFDRjs7TUFFQTtNQUNBLElBQUtBLFlBQVksRUFBRztRQUNsQixLQUFNLElBQUlJLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1AsVUFBVSxDQUFDOUosS0FBSyxDQUFDbUssTUFBTSxFQUFFRSxDQUFDLEVBQUUsRUFBRztVQUNsRCxNQUFNeEUsSUFBSSxHQUFHaUUsVUFBVSxDQUFDOUosS0FBSyxDQUFFcUssQ0FBQyxDQUFFO1VBQ2xDLElBQUssQ0FBQ3hFLElBQUksQ0FBQzJFLGNBQWMsQ0FBRUosVUFBVyxDQUFDLEVBQUc7WUFDeENILFlBQVksR0FBRyxDQUFDcEUsSUFBSSxDQUFDNEUsYUFBYSxDQUFDbkksS0FBSyxDQUFDb0ksZ0JBQWdCLENBQUVOLFVBQVUsQ0FBQ3BJLG1CQUFtQixDQUFDTSxLQUFNLENBQUM7WUFFakcsSUFBSyxDQUFDMkgsWUFBWSxFQUFHO2NBQ25CO1lBQ0Y7VUFDRjtRQUNGO01BQ0Y7O01BRUE7TUFDQSxJQUFLQSxZQUFZLEVBQUc7UUFDbEJ4RixNQUFNLElBQUlBLE1BQU0sQ0FBRTJGLFVBQVUsQ0FBQ2QsZ0JBQWdCLENBQUNoSCxLQUFLLEVBQUUsdURBQXdELENBQUM7UUFDOUcySCxZQUFZLEdBQUdyTSxrQkFBa0IsQ0FBQytNLHdCQUF3QixDQUFFUCxVQUFVLENBQUNkLGdCQUFnQixDQUFDaEgsS0FBSyxFQUFHOEgsVUFBVSxDQUFDOUksZ0JBQWdCLENBQUNnQixLQUFNLENBQUM7TUFDckk7O01BRUE7TUFDQSxJQUFLLENBQUMySCxZQUFZLEVBQUc7UUFDbkI7TUFDRjtJQUNGO0lBRUEsT0FBT0EsWUFBWTtFQUNyQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQWNXLDJCQUEyQkEsQ0FBRWQsVUFBbUMsRUFBWTtJQUN4RixJQUFJZSxZQUFZLEdBQUcsSUFBSTs7SUFFdkI7SUFDQUEsWUFBWSxHQUFHOU0sdUJBQXVCLENBQUM4TCxnQ0FBZ0MsQ0FBRUMsVUFBVyxDQUFDOztJQUVyRjtJQUNBLElBQUtlLFlBQVksRUFBRztNQUNsQkEsWUFBWSxHQUFHOU0sdUJBQXVCLENBQUNpTSw4QkFBOEIsQ0FBRUYsVUFBVyxDQUFDO0lBQ3JGO0lBQ0EsT0FBT2UsWUFBWTtFQUNyQjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsT0FBYy9KLDJCQUEyQkEsQ0FBRWdLLFlBQW9CLEVBQVc7SUFDeEUsSUFBSUMsUUFBUSxHQUFHRCxZQUFZOztJQUUzQjtJQUNBLElBQUs1Tiw0QkFBNEIsQ0FBQzhOLGVBQWUsRUFBRztNQUNsREQsUUFBUSxHQUFHQSxRQUFRLEdBQUc3Tiw0QkFBNEIsQ0FBQytOLDJDQUEyQztJQUNoRztJQUNBLElBQUsvTiw0QkFBNEIsQ0FBQ2dPLGdCQUFnQixFQUFHO01BQ25ESCxRQUFRLEdBQUdBLFFBQVEsR0FBRzdOLDRCQUE0QixDQUFDaU8scUNBQXFDO0lBQzFGO0lBRUEsT0FBT0osUUFBUTtFQUNqQjs7RUFFQTtBQUNGO0FBQ0E7RUFDRSxPQUFjSyxtQkFBbUJBLENBQUV6RyxNQUFjLEVBQUVDLE1BQWMsRUFBRXlHLGlCQUF5QixFQUFZO0lBQ3RHLE9BQU90TyxLQUFLLENBQUN3RixhQUFhLENBQUVvQyxNQUFNLEVBQUVDLE1BQU0sRUFBRXlHLGlCQUFrQixDQUFDO0VBQ2pFO0FBQ0Y7QUFFQTFPLGFBQWEsQ0FBQzJPLFFBQVEsQ0FBRSx5QkFBeUIsRUFBRXZOLHVCQUF3QixDQUFDIn0=