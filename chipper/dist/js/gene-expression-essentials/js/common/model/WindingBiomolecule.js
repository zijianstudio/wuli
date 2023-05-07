// Copyright 2015-2021, University of Colorado Boulder

/**
 * Biomolecule that is a represented as a wound up strand. Generally, this refers to some sort of RNA. The complicated
 * part of this is the algorithm that is used to wind the strand.
 *
 * @author John Blanco
 * @author Mohamed Safi
 * @author Aadish Gupta
 */

import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GEEConstants from '../GEEConstants.js';
import BioShapeUtils from './BioShapeUtils.js';
import MobileBiomolecule from './MobileBiomolecule.js';
import ShapeDefiningPoint from './ShapeDefiningPoint.js';

// constants
// Color used by this molecule. Since mRNA is depicted as a line and not as a closed shape, a transparent color is
// used for the fill. This enables reuse of generic biomolecule classes.
const NOMINAL_COLOR = new Color(0, 0, 0, 0);

// Parameters that control how the winding biomolecule winds. NOTE: The different variations of winding parameters
// were added in an effort to come to some consensus about how the mRNA should look for the various genes.  In the
// end, a single set was chosen, but I (jbphet) have left the other parameter sets here in case this question ever
// comes up again so that we don't have to "rediscover" parameters that look reasonably good.
const WINDING_PARAMS = [{
  // straight line - generally only used for debug
  yWave1Frequency: 0,
  yWave1PhaseOffset: 0,
  yWave1Multiplier: 0,
  yWave2Frequency: 0,
  yWave2PhaseOffset: 0,
  yWave2Multiplier: 0,
  xWaveFrequency: 0,
  xWavePhaseOffset: 0,
  xWaveMultiplier: 0
}, {
  // sine wave from yWave1 only
  yWave1Frequency: Math.PI * 0.01,
  yWave1PhaseOffset: 0.1 * Math.PI,
  yWave1Multiplier: 0.5,
  yWave2Frequency: 0,
  yWave2PhaseOffset: 0,
  yWave2Multiplier: 0,
  xWaveFrequency: 0,
  xWavePhaseOffset: 0,
  xWaveMultiplier: 0
}, {
  // double sine wave from yWave1 and yWave2
  yWave1Frequency: Math.PI * 0.01,
  yWave1PhaseOffset: 0.1 * Math.PI,
  yWave1Multiplier: 0.5,
  yWave2Frequency: Math.PI * 0.02,
  yWave2PhaseOffset: 0,
  yWave2Multiplier: 0.5,
  xWaveFrequency: 0,
  xWavePhaseOffset: 0,
  xWaveMultiplier: 0
}, {
  // x wave
  yWave1Frequency: Math.PI * 0.01,
  yWave1PhaseOffset: 0.1 * Math.PI,
  yWave1Multiplier: 0.5,
  yWave2Frequency: 0,
  yWave2PhaseOffset: 0,
  yWave2Multiplier: 0,
  xWaveFrequency: Math.PI * 0.03,
  xWavePhaseOffset: 0,
  xWaveMultiplier: 0.4
}, {
  // tight, irregular, couple of loops
  yWave1Frequency: 0.007 * Math.PI,
  yWave1PhaseOffset: 0.35 * Math.PI,
  yWave1Multiplier: 0.11,
  yWave2Frequency: 0.037 * Math.PI,
  yWave2PhaseOffset: 1.6 * Math.PI,
  yWave2Multiplier: 0.3,
  xWaveFrequency: 0.022 * Math.PI,
  xWavePhaseOffset: 0.3 * Math.PI,
  xWaveMultiplier: 0.24
}, {
  // winding with a few kinks, no complete loops
  yWave1Frequency: 0.02 * Math.PI,
  yWave1PhaseOffset: 0.35 * Math.PI,
  yWave1Multiplier: 0.2,
  yWave2Frequency: 0.007 * Math.PI,
  yWave2PhaseOffset: 1.6 * Math.PI,
  yWave2Multiplier: 0.1,
  xWaveFrequency: 0.01 * Math.PI,
  xWavePhaseOffset: 0.25 * Math.PI,
  xWaveMultiplier: 0.14
}, {
  // squiggly with a couple of small loops
  yWave1Frequency: 0.008 * Math.PI,
  yWave1PhaseOffset: 0.5 * Math.PI,
  yWave1Multiplier: 0.2,
  yWave2Frequency: 0.02 * Math.PI,
  yWave2PhaseOffset: 0.55 * Math.PI,
  yWave2Multiplier: 0.2,
  xWaveFrequency: 0.02 * Math.PI,
  xWavePhaseOffset: 0.45 * Math.PI,
  xWaveMultiplier: 0.2
}, {
  // large winds, no loops
  yWave1Frequency: 0.03350868765331309,
  yWave1PhaseOffset: 1.4652859313212294,
  yWave1Multiplier: 0.3523018499297727,
  yWave2Frequency: 0.03679270540637452,
  yWave2PhaseOffset: 0.8290895969945882,
  yWave2Multiplier: 0.3710465106439804,
  xWaveFrequency: 0.06762818354262706,
  xWavePhaseOffset: 1.3697784268233215,
  xWaveMultiplier: 0.19589544619869786
}, {
  // loopy and windy, liked by @kathy-phet
  yWave1Frequency: 0.02417698217540225,
  yWave1PhaseOffset: 2.4695448382255574,
  yWave1Multiplier: 0.37836434264592467,
  yWave2Frequency: 0.06201593943296497,
  yWave2PhaseOffset: 1.936966001193581,
  yWave2Multiplier: 0.41526000924061474,
  xWaveFrequency: 0.16811027073589893,
  xWavePhaseOffset: 0.030242447922989232,
  xWaveMultiplier: 0.3390090209844494
}, {
  // very loopy
  yWave1Frequency: 0.008 * Math.PI,
  yWave1PhaseOffset: 2.4695448382255574,
  yWave1Multiplier: 0.2,
  yWave2Frequency: 0.02 * Math.PI,
  yWave2PhaseOffset: 1.936966001193581,
  yWave2Multiplier: 0.2,
  xWaveFrequency: 0.02 * Math.PI,
  xWavePhaseOffset: 0.030242447922989232,
  xWaveMultiplier: 0.2
}, {
  // ECG sort of one with some overlap
  yWave1Frequency: 0.033801261909700855,
  yWave1PhaseOffset: 2.749035346535291,
  yWave1Multiplier: 0.27327335215625254,
  yWave2Frequency: 0.13249523648326847,
  yWave2PhaseOffset: 3.5761786010790373,
  yWave2Multiplier: 0.20586648052301262,
  xWaveFrequency: 0.03982596097448576,
  xWavePhaseOffset: 1.7894001491723766,
  xWaveMultiplier: 0.13588696362810446
}];
class WindingBiomolecule extends MobileBiomolecule {
  /**
   * @param {GeneExpressionModel} model
   * @param {Shape} initialShape
   * @param {Vector2} position
   * @param {Object} [options]
   */
  constructor(model, initialShape, position, options) {
    options = merge({
      // {number} - winding algorithm to use when creating and updating this biomolecule, see code for range
      windingParamSet: 0
    }, options);
    super(model, initialShape, NOMINAL_COLOR);

    // set up the winding params
    this.windingParams = WINDING_PARAMS[options.windingParamSet];

    // Add first shape defining point to the point list.
    this.firstShapeDefiningPoint = new ShapeDefiningPoint(position, 0); //@protected
    this.lastShapeDefiningPoint = this.firstShapeDefiningPoint; //@protected

    // List of the shape segments that define the outline shape.
    this.shapeSegments = []; //@public
  }

  /**
   * @public
   */
  dispose() {
    this.shapeSegments.length = 0;
    super.dispose();
  }

  /**
   * Get the first shape-defining point enclosed in the provided length range.
   * @param {Range} lengthRange
   * @returns {ShapeDefiningPoint}
   * @private
   */
  getFirstEnclosedPoint(lengthRange) {
    let currentPoint = this.firstShapeDefiningPoint;
    let currentLength = 0;
    while (currentPoint !== null) {
      if (currentLength >= lengthRange.min && currentLength < lengthRange.max) {
        // We've found the first point.
        break;
      }
      currentPoint = currentPoint.getNextPoint();
      currentLength += currentPoint !== null ? currentPoint.getTargetDistanceToPreviousPoint() : 0;
    }
    return currentPoint;
  }

  /**
   * Get the last shape-defining point enclosed in the provided length range.
   * @param  {Range} lengthRange
   * @returns {ShapeDefiningPoint}
   * @private
   */
  getLastEnclosedPoint(lengthRange) {
    let currentPoint = this.firstShapeDefiningPoint;
    let currentLength = 0;
    while (currentPoint !== null) {
      if (currentLength >= lengthRange.min && currentLength < lengthRange.max) {
        break;
      }
      currentPoint = currentPoint.getNextPoint();
      currentLength += currentPoint !== null ? currentPoint.getTargetDistanceToPreviousPoint() : 0;
    }
    if (currentPoint !== null) {
      while (currentPoint.getNextPoint() !== null && currentPoint.getNextPoint().getTargetDistanceToPreviousPoint() + currentLength < lengthRange.max) {
        currentPoint = currentPoint.getNextPoint();
        currentLength += currentPoint.getTargetDistanceToPreviousPoint();
      }
    }
    return currentPoint;
  }

  /**
   * Add the specified amount of mRNA length to the tail end of the mRNA. Adding a length will cause the winding
   * algorithm to be re-run.
   * @param {number} length - Length of mRNA to add in picometers.
   * @public
   */
  addLength(length) {
    // Add the length to the set of shape-defining points. This may add a new point, or simply reposition the current
    // last point.
    if (this.firstShapeDefiningPoint === this.lastShapeDefiningPoint) {
      // This is the first length added to the strand, so put it on.
      this.addPointToEnd(this.lastShapeDefiningPoint.getPosition(), length);
    } else if (this.lastShapeDefiningPoint.getTargetDistanceToPreviousPoint() < GEEConstants.INTER_POINT_DISTANCE) {
      const prevDistance = this.lastShapeDefiningPoint.getTargetDistanceToPreviousPoint();
      if (prevDistance + length <= GEEConstants.INTER_POINT_DISTANCE) {
        // No need to add a new point - just set the distance of the current last point to be further away from the
        // previous.
        this.lastShapeDefiningPoint.setTargetDistanceToPreviousPoint(prevDistance + length);
      } else {
        // Set the last point to be at the prescribed inter-point distance, and then add a new point.
        this.lastShapeDefiningPoint.setTargetDistanceToPreviousPoint(GEEConstants.INTER_POINT_DISTANCE);
        this.addPointToEnd(this.lastShapeDefiningPoint.getPosition(), length - (GEEConstants.INTER_POINT_DISTANCE - prevDistance));
      }
    } else {
      // add new point or points to the end
      let remainingLengthToAdd = length;
      while (remainingLengthToAdd > 0) {
        const targetDistanceToPreviousPoint = Math.min(GEEConstants.INTER_POINT_DISTANCE, remainingLengthToAdd);
        this.addPointToEnd(this.lastShapeDefiningPoint.getPosition(), targetDistanceToPreviousPoint);
        remainingLengthToAdd -= targetDistanceToPreviousPoint;
      }
    }

    // Update the shape segments that define the outline shape.
    this.getLastShapeSegment().add(length, this, this.shapeSegments);

    // Realign the segments, since some growth probably occurred.
    this.realignSegmentsFromEnd();

    // Now that the points and shape segments are updated, run the algorithm that winds the points through the shapes
    // to produce the shape of the strand that will be presented to the user.
    this.windPointsThroughSegments();
  }

  /**
   * This is the "winding algorithm" that positions the points that define the shape of the mRNA within the shape
   * segments. The combination of this algorithm and the shape segments allow the mRNA to look reasonable when it is
   * being synthesized and when it is being transcribed.
   * @protected
   */
  windPointsThroughSegments() {
    let handledLength = 0;

    // Loop through the shape segments positioning the shape-defining points within them.
    for (let i = 0; i < this.shapeSegments.length; i++) {
      const shapeSegment = this.shapeSegments[i];
      let lengthRange;

      // determine how much of the mRNA is within this shape segment and set the amount of length to work with accordingly
      if (shapeSegment !== this.getLastShapeSegment()) {
        lengthRange = new Range(handledLength, handledLength + shapeSegment.getContainedLength());
      } else {
        // This is the last segment, so set the end of the length range to be infinite in order to be sure that the
        // last point is always included. If this isn't done, accumulation of floating point errors can cause the last
        // point to fall outside of the range, and it won't get positioned.  Which is bad.
        lengthRange = new Range(handledLength, Number.MAX_VALUE);

        // If this assert is hit, something may well be wrong with the way the shape segments are being updated.
        assert && assert(this.getLength() - this.getTotalLengthInShapeSegments() < 1, 'larger than expected difference between mRNA length and shape segment length');
      }
      const firstEnclosedPoint = this.getFirstEnclosedPoint(lengthRange);
      const lastEnclosedPoint = this.getLastEnclosedPoint(lengthRange);
      if (firstEnclosedPoint === null) {
        // The segment contains no points.
        continue;
      } else if (shapeSegment.isFlat()) {
        // Position the contained points in a flat line.
        this.positionPointsInLine(firstEnclosedPoint, lastEnclosedPoint, shapeSegment.getUpperLeftCornerPosition());
      } else {
        // The segment is square, so position the points within it in a way that looks something like mRNA.
        this.positionPointsAsComplexWave(firstEnclosedPoint, lastEnclosedPoint, shapeSegment.getBounds());
      }
      handledLength += shapeSegment.getContainedLength();
    }

    // Update the shape property based on the newly positioned points.
    this.shapeProperty.set(BioShapeUtils.createCurvyLineFromPoints(this.getPointList()).makeImmutable());
  }

  /**
   * Returns the sum of length of all shape segments
   * @returns {number}
   * @private
   */
  getTotalLengthInShapeSegments() {
    let totalShapeSegmentLength = 0;
    this.shapeSegments.forEach(shapeSeg => {
      totalShapeSegmentLength += shapeSeg.getContainedLength();
    });
    return totalShapeSegmentLength;
  }

  /**
   * Position a series of points in a straight line. The distances between the points are set to be their target
   * distances. This is generally used when positioning the points in a flat shape segment.
   *
   * @param {ShapeDefiningPoint} firstPoint
   * @param {ShapeDefiningPoint} lastPoint
   * @param {Vector2} origin
   * @private
   */
  positionPointsInLine(firstPoint, lastPoint, origin) {
    let currentPoint = firstPoint;
    let xOffset = 0;
    while (currentPoint !== lastPoint && currentPoint !== null) {
      currentPoint.setPositionXY(origin.x + xOffset, origin.y);
      currentPoint = currentPoint.getNextPoint();
      xOffset += currentPoint !== null ? currentPoint.getTargetDistanceToPreviousPoint() : 0;
    }
    assert && assert(currentPoint !== null, 'error: last point not found when positioning points');

    // position the last point
    currentPoint.setPositionXY(origin.x + xOffset, origin.y);
  }

  /**
   * position the points that define the shape of the strand using a combination of sine waves
   * @param {ShapeDefiningPoint} firstPoint
   * @param {ShapeDefiningPoint} lastPoint
   * @param {Rectangle} bounds
   * @private
   */
  positionPointsAsComplexWave(firstPoint, lastPoint, bounds) {
    if (firstPoint === null) {
      // Defensive programming.
      return;
    }

    // Position the first point at the upper left.
    firstPoint.setPositionXY(bounds.getMinX(), bounds.getMinY() + bounds.getHeight());
    if (firstPoint === lastPoint) {
      // Nothing more to do.
      return;
    }
    const diagonalSpan = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);

    // for easier manipulation, make a list of all of the points in order from first to last
    const points = [];
    let currentPoint = firstPoint;
    points.push(currentPoint);
    while (currentPoint !== lastPoint) {
      currentPoint = currentPoint.getNextPoint();
      points.push(currentPoint);
    }
    const nextLinearPosition = new Vector2(bounds.minX, bounds.maxY);
    const interPointXDistance = bounds.width / (points.length - 1);
    const interPointYDistance = -bounds.height / (points.length - 1);
    let totalDistanceTraversed = 0;
    const totalDistancePerStep = Math.sqrt(interPointXDistance * interPointXDistance + interPointYDistance * interPointYDistance);

    // convenience vars for winding params
    const yWave1Frequency = this.windingParams.yWave1Frequency;
    const yWave1PhaseOffset = this.windingParams.yWave1PhaseOffset;
    const yWave1Multiplier = this.windingParams.yWave1Multiplier;
    const yWave2Frequency = this.windingParams.yWave2Frequency;
    const yWave2PhaseOffset = this.windingParams.yWave2PhaseOffset;
    const yWave2Multiplier = this.windingParams.yWave2Multiplier;
    const xWaveFrequency = this.windingParams.xWaveFrequency;
    const xWavePhaseOffset = this.windingParams.xWavePhaseOffset;
    const xWaveMultiplier = this.windingParams.xWaveMultiplier;

    // pre-allocate and reuse the offset vector for optimal performance
    const offsetFromLinearSequence = new Vector2(0, 0);

    // implement the winding algorithm
    for (let i = 0; i < points.length; i++) {
      // window function to modulate less at corners of square than in middle so that everything fits in the segment
      let offsetScale;
      if (totalDistanceTraversed < diagonalSpan / 2) {
        offsetScale = totalDistanceTraversed;
      } else {
        offsetScale = diagonalSpan - totalDistanceTraversed;
      }

      // use periodic functions to create a complex but deterministic shape
      offsetFromLinearSequence.setXY(yWave1Multiplier * Math.sin(totalDistanceTraversed * yWave1Frequency + yWave1PhaseOffset) + yWave2Multiplier * Math.sin(totalDistanceTraversed * yWave2Frequency + yWave2PhaseOffset), xWaveMultiplier * Math.sin(totalDistanceTraversed * xWaveFrequency + xWavePhaseOffset));
      offsetFromLinearSequence.rotate(Math.PI / 4);
      offsetFromLinearSequence.multiplyScalar(offsetScale);
      points[i].setPositionXY(nextLinearPosition.x + offsetFromLinearSequence.x, Math.min(nextLinearPosition.y + offsetFromLinearSequence.y, bounds.maxY));
      nextLinearPosition.addXY(interPointXDistance, interPointYDistance);
      totalDistanceTraversed += totalDistancePerStep;
    }
  }

  /**
   * Realign all the segments, making sure that the end of one connects to the beginning of another, using the last
   * segment on the list as the starting point.
   * @private
   */
  realignSegmentsFromEnd() {
    let copyOfShapeSegments = this.shapeSegments.slice();
    copyOfShapeSegments = copyOfShapeSegments.reverse();
    for (let i = 0; i < copyOfShapeSegments.length - 1; i++) {
      // Assumes that the shape segments attach to one another in such a way that they chain from the upper left to
      // the lower right.
      copyOfShapeSegments[i + 1].setLowerRightCornerPosition(copyOfShapeSegments[i].getUpperLeftCornerPosition());
    }
  }

  /**
   * Returns the last shape segment in the shapeSegments array
   * @returns {ShapeSegment}
   * @private
   */
  getLastShapeSegment() {
    return this.shapeSegments[this.shapeSegments.length - 1];
  }

  /**
   * Add a point to the end of the list of shape defining points. Note that this will alter the last point on the list.
   * @param {Vector2} position
   * @param {number} targetDistanceToPreviousPoint
   * @private
   */
  addPointToEnd(position, targetDistanceToPreviousPoint) {
    const newPoint = new ShapeDefiningPoint(position, targetDistanceToPreviousPoint);
    this.lastShapeDefiningPoint.setNextPoint(newPoint);
    newPoint.setPreviousPoint(this.lastShapeDefiningPoint);
    this.lastShapeDefiningPoint = newPoint;
  }

  /**
   * Get the points that define the shape as a list.
   * @returns {Array}
   * @private
   */
  getPointList() {
    const pointList = [];
    let thisPoint = this.firstShapeDefiningPoint;
    while (thisPoint !== null) {
      pointList.push(thisPoint.getPosition());
      thisPoint = thisPoint.getNextPoint();
    }
    return pointList;
  }

  /**
   * Get the length of the strand. The length is calculated by adding up the intended distances between the points, and
   * does not account for curvature.
   * @returns {number} length in picometers
   * @protected
   */
  getLength() {
    let length = 0;
    let thisPoint = this.firstShapeDefiningPoint.getNextPoint();
    while (thisPoint !== null) {
      length += thisPoint.getTargetDistanceToPreviousPoint();
      thisPoint = thisPoint.getNextPoint();
    }
    return length;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @public
   */
  setLowerRightPositionXY(x, y) {
    let totalWidth = 0;
    let totalHeight = 0;
    for (let i = 0; i < this.shapeSegments.length; i++) {
      totalWidth += this.shapeSegments[i].bounds.width;
      totalHeight += this.shapeSegments[i].bounds.height;
    }
    // set the overall position property
    this.setPositionXY(x - totalWidth / 2, y + totalHeight / 2);

    // set the position of the last segment - this position is relative to the overall position, not absolute
    this.getLastShapeSegment().setLowerRightCornerPositionXY(totalWidth / 2, -totalHeight / 2);

    // realign all other segments based on the position of the last one
    this.realignSegmentsFromEnd();
  }

  /**
   * Adjust the position and the relative positions of all the shape segments such that the mRNA is in the same
   * place but the center is actually in the center of the segments.  This is necessary because during translations
   * the segments change shape and can move such that the position is not longer at the center of the shape.
   * @protected
   */
  recenter() {
    const shapeBounds = this.shapeProperty.get().bounds;
    const adjustmentX = shapeBounds.centerX;
    const adjustmentY = shapeBounds.centerY;

    // only readjust if needed
    if (adjustmentX !== 0 || adjustmentY !== 0) {
      // adjust the shape segments
      for (let i = 0; i < this.shapeSegments.length; i++) {
        const shapeSegment = this.shapeSegments[i];
        const upperLeftCornerPosition = shapeSegment.getUpperLeftCornerPosition();
        shapeSegment.setUpperLeftCornerPositionXY(upperLeftCornerPosition.x - adjustmentX, upperLeftCornerPosition.y - adjustmentY);
      }

      // adjust the position
      const position = this.getPosition();
      this.setPositionXY(position.x + adjustmentX, position.y + adjustmentY);
    }
  }

  /**
   * Realign the positions of all segments starting from the given segment and working forward and backward through
   * the segment list.
   * @param {ShapeSegment} segmentToAlignFrom
   * @protected
   */
  realignSegmentsFrom(segmentToAlignFrom) {
    assert && assert(this.shapeSegments.indexOf(segmentToAlignFrom) !== -1, 'attempt to align to segment that is not on the list');

    // Align segments that follow this one.
    let currentSegment = segmentToAlignFrom;
    let nextSegment = this.getNextShapeSegment(currentSegment);
    while (nextSegment !== null) {
      const nextSegmentLowerRightCornerPos = currentSegment.getLowerRightCornerPosition();
      nextSegment.setUpperLeftCornerPositionXY(nextSegmentLowerRightCornerPos.x, nextSegmentLowerRightCornerPos.y);
      currentSegment = nextSegment;
      nextSegment = this.getNextShapeSegment(currentSegment);
    }

    // Align segments that precede this one.
    currentSegment = segmentToAlignFrom;
    let previousSegment = this.getPreviousShapeSegment(currentSegment);
    while (previousSegment !== null) {
      previousSegment.setLowerRightCornerPosition(currentSegment.getUpperLeftCornerPosition());
      currentSegment = previousSegment;
      previousSegment = this.getPreviousShapeSegment(currentSegment);
    }
  }

  /**
   * Returns the next shape segment in the array for the given shape segment
   * @param {ShapeSegment} shapeSegment
   * @returns {ShapeSegment}
   * @public
   */
  getNextShapeSegment(shapeSegment) {
    const index = this.shapeSegments.indexOf(shapeSegment);
    assert && assert(index !== -1, 'Given item not in list');
    if (index === this.shapeSegments.length - 1) {
      // The given segment is the last element on the list, so null is returned.
      return null;
    } else {
      return this.shapeSegments[index + 1];
    }
  }

  /**
   * Returns the previous shape segment in the array for the given shape segment
   * @param {ShapeSegment} shapeSegment
   * @returns {ShapeSegment}
   * @public
   */
  getPreviousShapeSegment(shapeSegment) {
    const index = this.shapeSegments.indexOf(shapeSegment);
    assert && assert(index !== -1, 'Given item not in list');
    if (index === 0) {
      // The given segment is the first element on the list, so null is returned.
      return null;
    } else {
      return this.shapeSegments[index - 1];
    }
  }

  /**
   * Inserts the new shape segment after the given shape segment in the array
   * @param {ShapeSegment} existingShapeSegment
   * @param {ShapeSegment} shapeSegmentToInsert
   * @public
   */
  insertAfterShapeSegment(existingShapeSegment, shapeSegmentToInsert) {
    const index = this.shapeSegments.indexOf(existingShapeSegment);
    assert && assert(index !== -1, 'Given item not in list');
    this.shapeSegments.splice(index + 1, 0, shapeSegmentToInsert);
  }

  /**
   * Inserts the new shape segment before the given shape segment in the array
   * @param {ShapeSegment} existingShapeSegment
   * @param {ShapeSegment} shapeSegmentToInsert
   * @public
   */
  insertBeforeShapeSegment(existingShapeSegment, shapeSegmentToInsert) {
    const index = this.shapeSegments.indexOf(existingShapeSegment);
    assert && assert(index !== -1, 'Given item not in list');
    this.shapeSegments.splice(index, 0, shapeSegmentToInsert);
  }
}
geneExpressionEssentials.register('WindingBiomolecule', WindingBiomolecule);
export default WindingBiomolecule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsIlZlY3RvcjIiLCJtZXJnZSIsIkNvbG9yIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiR0VFQ29uc3RhbnRzIiwiQmlvU2hhcGVVdGlscyIsIk1vYmlsZUJpb21vbGVjdWxlIiwiU2hhcGVEZWZpbmluZ1BvaW50IiwiTk9NSU5BTF9DT0xPUiIsIldJTkRJTkdfUEFSQU1TIiwieVdhdmUxRnJlcXVlbmN5IiwieVdhdmUxUGhhc2VPZmZzZXQiLCJ5V2F2ZTFNdWx0aXBsaWVyIiwieVdhdmUyRnJlcXVlbmN5IiwieVdhdmUyUGhhc2VPZmZzZXQiLCJ5V2F2ZTJNdWx0aXBsaWVyIiwieFdhdmVGcmVxdWVuY3kiLCJ4V2F2ZVBoYXNlT2Zmc2V0IiwieFdhdmVNdWx0aXBsaWVyIiwiTWF0aCIsIlBJIiwiV2luZGluZ0Jpb21vbGVjdWxlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImluaXRpYWxTaGFwZSIsInBvc2l0aW9uIiwib3B0aW9ucyIsIndpbmRpbmdQYXJhbVNldCIsIndpbmRpbmdQYXJhbXMiLCJmaXJzdFNoYXBlRGVmaW5pbmdQb2ludCIsImxhc3RTaGFwZURlZmluaW5nUG9pbnQiLCJzaGFwZVNlZ21lbnRzIiwiZGlzcG9zZSIsImxlbmd0aCIsImdldEZpcnN0RW5jbG9zZWRQb2ludCIsImxlbmd0aFJhbmdlIiwiY3VycmVudFBvaW50IiwiY3VycmVudExlbmd0aCIsIm1pbiIsIm1heCIsImdldE5leHRQb2ludCIsImdldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50IiwiZ2V0TGFzdEVuY2xvc2VkUG9pbnQiLCJhZGRMZW5ndGgiLCJhZGRQb2ludFRvRW5kIiwiZ2V0UG9zaXRpb24iLCJJTlRFUl9QT0lOVF9ESVNUQU5DRSIsInByZXZEaXN0YW5jZSIsInNldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50IiwicmVtYWluaW5nTGVuZ3RoVG9BZGQiLCJ0YXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCIsImdldExhc3RTaGFwZVNlZ21lbnQiLCJhZGQiLCJyZWFsaWduU2VnbWVudHNGcm9tRW5kIiwid2luZFBvaW50c1Rocm91Z2hTZWdtZW50cyIsImhhbmRsZWRMZW5ndGgiLCJpIiwic2hhcGVTZWdtZW50IiwiZ2V0Q29udGFpbmVkTGVuZ3RoIiwiTnVtYmVyIiwiTUFYX1ZBTFVFIiwiYXNzZXJ0IiwiZ2V0TGVuZ3RoIiwiZ2V0VG90YWxMZW5ndGhJblNoYXBlU2VnbWVudHMiLCJmaXJzdEVuY2xvc2VkUG9pbnQiLCJsYXN0RW5jbG9zZWRQb2ludCIsImlzRmxhdCIsInBvc2l0aW9uUG9pbnRzSW5MaW5lIiwiZ2V0VXBwZXJMZWZ0Q29ybmVyUG9zaXRpb24iLCJwb3NpdGlvblBvaW50c0FzQ29tcGxleFdhdmUiLCJnZXRCb3VuZHMiLCJzaGFwZVByb3BlcnR5Iiwic2V0IiwiY3JlYXRlQ3VydnlMaW5lRnJvbVBvaW50cyIsImdldFBvaW50TGlzdCIsIm1ha2VJbW11dGFibGUiLCJ0b3RhbFNoYXBlU2VnbWVudExlbmd0aCIsImZvckVhY2giLCJzaGFwZVNlZyIsImZpcnN0UG9pbnQiLCJsYXN0UG9pbnQiLCJvcmlnaW4iLCJ4T2Zmc2V0Iiwic2V0UG9zaXRpb25YWSIsIngiLCJ5IiwiYm91bmRzIiwiZ2V0TWluWCIsImdldE1pblkiLCJnZXRIZWlnaHQiLCJkaWFnb25hbFNwYW4iLCJzcXJ0Iiwid2lkdGgiLCJoZWlnaHQiLCJwb2ludHMiLCJwdXNoIiwibmV4dExpbmVhclBvc2l0aW9uIiwibWluWCIsIm1heFkiLCJpbnRlclBvaW50WERpc3RhbmNlIiwiaW50ZXJQb2ludFlEaXN0YW5jZSIsInRvdGFsRGlzdGFuY2VUcmF2ZXJzZWQiLCJ0b3RhbERpc3RhbmNlUGVyU3RlcCIsIm9mZnNldEZyb21MaW5lYXJTZXF1ZW5jZSIsIm9mZnNldFNjYWxlIiwic2V0WFkiLCJzaW4iLCJyb3RhdGUiLCJtdWx0aXBseVNjYWxhciIsImFkZFhZIiwiY29weU9mU2hhcGVTZWdtZW50cyIsInNsaWNlIiwicmV2ZXJzZSIsInNldExvd2VyUmlnaHRDb3JuZXJQb3NpdGlvbiIsIm5ld1BvaW50Iiwic2V0TmV4dFBvaW50Iiwic2V0UHJldmlvdXNQb2ludCIsInBvaW50TGlzdCIsInRoaXNQb2ludCIsInNldExvd2VyUmlnaHRQb3NpdGlvblhZIiwidG90YWxXaWR0aCIsInRvdGFsSGVpZ2h0Iiwic2V0TG93ZXJSaWdodENvcm5lclBvc2l0aW9uWFkiLCJyZWNlbnRlciIsInNoYXBlQm91bmRzIiwiZ2V0IiwiYWRqdXN0bWVudFgiLCJjZW50ZXJYIiwiYWRqdXN0bWVudFkiLCJjZW50ZXJZIiwidXBwZXJMZWZ0Q29ybmVyUG9zaXRpb24iLCJzZXRVcHBlckxlZnRDb3JuZXJQb3NpdGlvblhZIiwicmVhbGlnblNlZ21lbnRzRnJvbSIsInNlZ21lbnRUb0FsaWduRnJvbSIsImluZGV4T2YiLCJjdXJyZW50U2VnbWVudCIsIm5leHRTZWdtZW50IiwiZ2V0TmV4dFNoYXBlU2VnbWVudCIsIm5leHRTZWdtZW50TG93ZXJSaWdodENvcm5lclBvcyIsImdldExvd2VyUmlnaHRDb3JuZXJQb3NpdGlvbiIsInByZXZpb3VzU2VnbWVudCIsImdldFByZXZpb3VzU2hhcGVTZWdtZW50IiwiaW5kZXgiLCJpbnNlcnRBZnRlclNoYXBlU2VnbWVudCIsImV4aXN0aW5nU2hhcGVTZWdtZW50Iiwic2hhcGVTZWdtZW50VG9JbnNlcnQiLCJzcGxpY2UiLCJpbnNlcnRCZWZvcmVTaGFwZVNlZ21lbnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldpbmRpbmdCaW9tb2xlY3VsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCaW9tb2xlY3VsZSB0aGF0IGlzIGEgcmVwcmVzZW50ZWQgYXMgYSB3b3VuZCB1cCBzdHJhbmQuIEdlbmVyYWxseSwgdGhpcyByZWZlcnMgdG8gc29tZSBzb3J0IG9mIFJOQS4gVGhlIGNvbXBsaWNhdGVkXHJcbiAqIHBhcnQgb2YgdGhpcyBpcyB0aGUgYWxnb3JpdGhtIHRoYXQgaXMgdXNlZCB0byB3aW5kIHRoZSBzdHJhbmQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBNb2hhbWVkIFNhZmlcclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBHRUVDb25zdGFudHMgZnJvbSAnLi4vR0VFQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJpb1NoYXBlVXRpbHMgZnJvbSAnLi9CaW9TaGFwZVV0aWxzLmpzJztcclxuaW1wb3J0IE1vYmlsZUJpb21vbGVjdWxlIGZyb20gJy4vTW9iaWxlQmlvbW9sZWN1bGUuanMnO1xyXG5pbXBvcnQgU2hhcGVEZWZpbmluZ1BvaW50IGZyb20gJy4vU2hhcGVEZWZpbmluZ1BvaW50LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBDb2xvciB1c2VkIGJ5IHRoaXMgbW9sZWN1bGUuIFNpbmNlIG1STkEgaXMgZGVwaWN0ZWQgYXMgYSBsaW5lIGFuZCBub3QgYXMgYSBjbG9zZWQgc2hhcGUsIGEgdHJhbnNwYXJlbnQgY29sb3IgaXNcclxuLy8gdXNlZCBmb3IgdGhlIGZpbGwuIFRoaXMgZW5hYmxlcyByZXVzZSBvZiBnZW5lcmljIGJpb21vbGVjdWxlIGNsYXNzZXMuXHJcbmNvbnN0IE5PTUlOQUxfQ09MT1IgPSBuZXcgQ29sb3IoIDAsIDAsIDAsIDAgKTtcclxuXHJcbi8vIFBhcmFtZXRlcnMgdGhhdCBjb250cm9sIGhvdyB0aGUgd2luZGluZyBiaW9tb2xlY3VsZSB3aW5kcy4gTk9URTogVGhlIGRpZmZlcmVudCB2YXJpYXRpb25zIG9mIHdpbmRpbmcgcGFyYW1ldGVyc1xyXG4vLyB3ZXJlIGFkZGVkIGluIGFuIGVmZm9ydCB0byBjb21lIHRvIHNvbWUgY29uc2Vuc3VzIGFib3V0IGhvdyB0aGUgbVJOQSBzaG91bGQgbG9vayBmb3IgdGhlIHZhcmlvdXMgZ2VuZXMuICBJbiB0aGVcclxuLy8gZW5kLCBhIHNpbmdsZSBzZXQgd2FzIGNob3NlbiwgYnV0IEkgKGpicGhldCkgaGF2ZSBsZWZ0IHRoZSBvdGhlciBwYXJhbWV0ZXIgc2V0cyBoZXJlIGluIGNhc2UgdGhpcyBxdWVzdGlvbiBldmVyXHJcbi8vIGNvbWVzIHVwIGFnYWluIHNvIHRoYXQgd2UgZG9uJ3QgaGF2ZSB0byBcInJlZGlzY292ZXJcIiBwYXJhbWV0ZXJzIHRoYXQgbG9vayByZWFzb25hYmx5IGdvb2QuXHJcbmNvbnN0IFdJTkRJTkdfUEFSQU1TID0gW1xyXG5cclxuICB7XHJcbiAgICAvLyBzdHJhaWdodCBsaW5lIC0gZ2VuZXJhbGx5IG9ubHkgdXNlZCBmb3IgZGVidWdcclxuICAgIHlXYXZlMUZyZXF1ZW5jeTogMCxcclxuICAgIHlXYXZlMVBoYXNlT2Zmc2V0OiAwLFxyXG4gICAgeVdhdmUxTXVsdGlwbGllcjogMCxcclxuICAgIHlXYXZlMkZyZXF1ZW5jeTogMCxcclxuICAgIHlXYXZlMlBoYXNlT2Zmc2V0OiAwLFxyXG4gICAgeVdhdmUyTXVsdGlwbGllcjogMCxcclxuICAgIHhXYXZlRnJlcXVlbmN5OiAwLFxyXG4gICAgeFdhdmVQaGFzZU9mZnNldDogMCxcclxuICAgIHhXYXZlTXVsdGlwbGllcjogMFxyXG4gIH0sXHJcblxyXG4gIHtcclxuICAgIC8vIHNpbmUgd2F2ZSBmcm9tIHlXYXZlMSBvbmx5XHJcbiAgICB5V2F2ZTFGcmVxdWVuY3k6IE1hdGguUEkgKiAwLjAxLFxyXG4gICAgeVdhdmUxUGhhc2VPZmZzZXQ6IDAuMSAqIE1hdGguUEksXHJcbiAgICB5V2F2ZTFNdWx0aXBsaWVyOiAwLjUsXHJcbiAgICB5V2F2ZTJGcmVxdWVuY3k6IDAsXHJcbiAgICB5V2F2ZTJQaGFzZU9mZnNldDogMCxcclxuICAgIHlXYXZlMk11bHRpcGxpZXI6IDAsXHJcbiAgICB4V2F2ZUZyZXF1ZW5jeTogMCxcclxuICAgIHhXYXZlUGhhc2VPZmZzZXQ6IDAsXHJcbiAgICB4V2F2ZU11bHRpcGxpZXI6IDBcclxuICB9LFxyXG5cclxuICB7XHJcbiAgICAvLyBkb3VibGUgc2luZSB3YXZlIGZyb20geVdhdmUxIGFuZCB5V2F2ZTJcclxuICAgIHlXYXZlMUZyZXF1ZW5jeTogTWF0aC5QSSAqIDAuMDEsXHJcbiAgICB5V2F2ZTFQaGFzZU9mZnNldDogMC4xICogTWF0aC5QSSxcclxuICAgIHlXYXZlMU11bHRpcGxpZXI6IDAuNSxcclxuICAgIHlXYXZlMkZyZXF1ZW5jeTogTWF0aC5QSSAqIDAuMDIsXHJcbiAgICB5V2F2ZTJQaGFzZU9mZnNldDogMCxcclxuICAgIHlXYXZlMk11bHRpcGxpZXI6IDAuNSxcclxuICAgIHhXYXZlRnJlcXVlbmN5OiAwLFxyXG4gICAgeFdhdmVQaGFzZU9mZnNldDogMCxcclxuICAgIHhXYXZlTXVsdGlwbGllcjogMFxyXG4gIH0sXHJcblxyXG4gIHtcclxuICAgIC8vIHggd2F2ZVxyXG4gICAgeVdhdmUxRnJlcXVlbmN5OiBNYXRoLlBJICogMC4wMSxcclxuICAgIHlXYXZlMVBoYXNlT2Zmc2V0OiAwLjEgKiBNYXRoLlBJLFxyXG4gICAgeVdhdmUxTXVsdGlwbGllcjogMC41LFxyXG4gICAgeVdhdmUyRnJlcXVlbmN5OiAwLFxyXG4gICAgeVdhdmUyUGhhc2VPZmZzZXQ6IDAsXHJcbiAgICB5V2F2ZTJNdWx0aXBsaWVyOiAwLFxyXG4gICAgeFdhdmVGcmVxdWVuY3k6IE1hdGguUEkgKiAwLjAzLFxyXG4gICAgeFdhdmVQaGFzZU9mZnNldDogMCxcclxuICAgIHhXYXZlTXVsdGlwbGllcjogMC40XHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgLy8gdGlnaHQsIGlycmVndWxhciwgY291cGxlIG9mIGxvb3BzXHJcbiAgICB5V2F2ZTFGcmVxdWVuY3k6IDAuMDA3ICogTWF0aC5QSSxcclxuICAgIHlXYXZlMVBoYXNlT2Zmc2V0OiAwLjM1ICogTWF0aC5QSSxcclxuICAgIHlXYXZlMU11bHRpcGxpZXI6IDAuMTEsXHJcbiAgICB5V2F2ZTJGcmVxdWVuY3k6IDAuMDM3ICogTWF0aC5QSSxcclxuICAgIHlXYXZlMlBoYXNlT2Zmc2V0OiAxLjYgKiBNYXRoLlBJLFxyXG4gICAgeVdhdmUyTXVsdGlwbGllcjogMC4zLFxyXG4gICAgeFdhdmVGcmVxdWVuY3k6IDAuMDIyICogTWF0aC5QSSxcclxuICAgIHhXYXZlUGhhc2VPZmZzZXQ6IDAuMyAqIE1hdGguUEksXHJcbiAgICB4V2F2ZU11bHRpcGxpZXI6IDAuMjRcclxuICB9LFxyXG5cclxuICB7XHJcbiAgICAvLyB3aW5kaW5nIHdpdGggYSBmZXcga2lua3MsIG5vIGNvbXBsZXRlIGxvb3BzXHJcbiAgICB5V2F2ZTFGcmVxdWVuY3k6IDAuMDIgKiBNYXRoLlBJLFxyXG4gICAgeVdhdmUxUGhhc2VPZmZzZXQ6IDAuMzUgKiBNYXRoLlBJLFxyXG4gICAgeVdhdmUxTXVsdGlwbGllcjogMC4yLFxyXG4gICAgeVdhdmUyRnJlcXVlbmN5OiAwLjAwNyAqIE1hdGguUEksXHJcbiAgICB5V2F2ZTJQaGFzZU9mZnNldDogMS42ICogTWF0aC5QSSxcclxuICAgIHlXYXZlMk11bHRpcGxpZXI6IDAuMSxcclxuICAgIHhXYXZlRnJlcXVlbmN5OiAwLjAxICogTWF0aC5QSSxcclxuICAgIHhXYXZlUGhhc2VPZmZzZXQ6IDAuMjUgKiBNYXRoLlBJLFxyXG4gICAgeFdhdmVNdWx0aXBsaWVyOiAwLjE0XHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgLy8gc3F1aWdnbHkgd2l0aCBhIGNvdXBsZSBvZiBzbWFsbCBsb29wc1xyXG4gICAgeVdhdmUxRnJlcXVlbmN5OiAwLjAwOCAqIE1hdGguUEksXHJcbiAgICB5V2F2ZTFQaGFzZU9mZnNldDogMC41ICogTWF0aC5QSSxcclxuICAgIHlXYXZlMU11bHRpcGxpZXI6IDAuMixcclxuICAgIHlXYXZlMkZyZXF1ZW5jeTogMC4wMiAqIE1hdGguUEksXHJcbiAgICB5V2F2ZTJQaGFzZU9mZnNldDogMC41NSAqIE1hdGguUEksXHJcbiAgICB5V2F2ZTJNdWx0aXBsaWVyOiAwLjIsXHJcbiAgICB4V2F2ZUZyZXF1ZW5jeTogMC4wMiAqIE1hdGguUEksXHJcbiAgICB4V2F2ZVBoYXNlT2Zmc2V0OiAwLjQ1ICogTWF0aC5QSSxcclxuICAgIHhXYXZlTXVsdGlwbGllcjogMC4yXHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgLy8gbGFyZ2Ugd2luZHMsIG5vIGxvb3BzXHJcbiAgICB5V2F2ZTFGcmVxdWVuY3k6IDAuMDMzNTA4Njg3NjUzMzEzMDksXHJcbiAgICB5V2F2ZTFQaGFzZU9mZnNldDogMS40NjUyODU5MzEzMjEyMjk0LFxyXG4gICAgeVdhdmUxTXVsdGlwbGllcjogMC4zNTIzMDE4NDk5Mjk3NzI3LFxyXG4gICAgeVdhdmUyRnJlcXVlbmN5OiAwLjAzNjc5MjcwNTQwNjM3NDUyLFxyXG4gICAgeVdhdmUyUGhhc2VPZmZzZXQ6IDAuODI5MDg5NTk2OTk0NTg4MixcclxuICAgIHlXYXZlMk11bHRpcGxpZXI6IDAuMzcxMDQ2NTEwNjQzOTgwNCxcclxuICAgIHhXYXZlRnJlcXVlbmN5OiAwLjA2NzYyODE4MzU0MjYyNzA2LFxyXG4gICAgeFdhdmVQaGFzZU9mZnNldDogMS4zNjk3Nzg0MjY4MjMzMjE1LFxyXG4gICAgeFdhdmVNdWx0aXBsaWVyOiAwLjE5NTg5NTQ0NjE5ODY5Nzg2XHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgLy8gbG9vcHkgYW5kIHdpbmR5LCBsaWtlZCBieSBAa2F0aHktcGhldFxyXG4gICAgeVdhdmUxRnJlcXVlbmN5OiAwLjAyNDE3Njk4MjE3NTQwMjI1LFxyXG4gICAgeVdhdmUxUGhhc2VPZmZzZXQ6IDIuNDY5NTQ0ODM4MjI1NTU3NCxcclxuICAgIHlXYXZlMU11bHRpcGxpZXI6IDAuMzc4MzY0MzQyNjQ1OTI0NjcsXHJcbiAgICB5V2F2ZTJGcmVxdWVuY3k6IDAuMDYyMDE1OTM5NDMyOTY0OTcsXHJcbiAgICB5V2F2ZTJQaGFzZU9mZnNldDogMS45MzY5NjYwMDExOTM1ODEsXHJcbiAgICB5V2F2ZTJNdWx0aXBsaWVyOiAwLjQxNTI2MDAwOTI0MDYxNDc0LFxyXG4gICAgeFdhdmVGcmVxdWVuY3k6IDAuMTY4MTEwMjcwNzM1ODk4OTMsXHJcbiAgICB4V2F2ZVBoYXNlT2Zmc2V0OiAwLjAzMDI0MjQ0NzkyMjk4OTIzMixcclxuICAgIHhXYXZlTXVsdGlwbGllcjogMC4zMzkwMDkwMjA5ODQ0NDk0XHJcbiAgfSxcclxuXHJcbiAge1xyXG4gICAgLy8gdmVyeSBsb29weVxyXG4gICAgeVdhdmUxRnJlcXVlbmN5OiAwLjAwOCAqIE1hdGguUEksXHJcbiAgICB5V2F2ZTFQaGFzZU9mZnNldDogMi40Njk1NDQ4MzgyMjU1NTc0LFxyXG4gICAgeVdhdmUxTXVsdGlwbGllcjogMC4yLFxyXG4gICAgeVdhdmUyRnJlcXVlbmN5OiAwLjAyICogTWF0aC5QSSxcclxuICAgIHlXYXZlMlBoYXNlT2Zmc2V0OiAxLjkzNjk2NjAwMTE5MzU4MSxcclxuICAgIHlXYXZlMk11bHRpcGxpZXI6IDAuMixcclxuICAgIHhXYXZlRnJlcXVlbmN5OiAwLjAyICogTWF0aC5QSSxcclxuICAgIHhXYXZlUGhhc2VPZmZzZXQ6IDAuMDMwMjQyNDQ3OTIyOTg5MjMyLFxyXG4gICAgeFdhdmVNdWx0aXBsaWVyOiAwLjJcclxuICB9LFxyXG5cclxuICB7XHJcbiAgICAvLyBFQ0cgc29ydCBvZiBvbmUgd2l0aCBzb21lIG92ZXJsYXBcclxuICAgIHlXYXZlMUZyZXF1ZW5jeTogMC4wMzM4MDEyNjE5MDk3MDA4NTUsXHJcbiAgICB5V2F2ZTFQaGFzZU9mZnNldDogMi43NDkwMzUzNDY1MzUyOTEsXHJcbiAgICB5V2F2ZTFNdWx0aXBsaWVyOiAwLjI3MzI3MzM1MjE1NjI1MjU0LFxyXG4gICAgeVdhdmUyRnJlcXVlbmN5OiAwLjEzMjQ5NTIzNjQ4MzI2ODQ3LFxyXG4gICAgeVdhdmUyUGhhc2VPZmZzZXQ6IDMuNTc2MTc4NjAxMDc5MDM3MyxcclxuICAgIHlXYXZlMk11bHRpcGxpZXI6IDAuMjA1ODY2NDgwNTIzMDEyNjIsXHJcbiAgICB4V2F2ZUZyZXF1ZW5jeTogMC4wMzk4MjU5NjA5NzQ0ODU3NixcclxuICAgIHhXYXZlUGhhc2VPZmZzZXQ6IDEuNzg5NDAwMTQ5MTcyMzc2NixcclxuICAgIHhXYXZlTXVsdGlwbGllcjogMC4xMzU4ODY5NjM2MjgxMDQ0NlxyXG4gIH1cclxuXTtcclxuXHJcbmNsYXNzIFdpbmRpbmdCaW9tb2xlY3VsZSBleHRlbmRzIE1vYmlsZUJpb21vbGVjdWxlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtHZW5lRXhwcmVzc2lvbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IGluaXRpYWxTaGFwZVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBpbml0aWFsU2hhcGUsIHBvc2l0aW9uLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8ge251bWJlcn0gLSB3aW5kaW5nIGFsZ29yaXRobSB0byB1c2Ugd2hlbiBjcmVhdGluZyBhbmQgdXBkYXRpbmcgdGhpcyBiaW9tb2xlY3VsZSwgc2VlIGNvZGUgZm9yIHJhbmdlXHJcbiAgICAgIHdpbmRpbmdQYXJhbVNldDogMFxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIGluaXRpYWxTaGFwZSwgTk9NSU5BTF9DT0xPUiApO1xyXG5cclxuICAgIC8vIHNldCB1cCB0aGUgd2luZGluZyBwYXJhbXNcclxuICAgIHRoaXMud2luZGluZ1BhcmFtcyA9IFdJTkRJTkdfUEFSQU1TWyBvcHRpb25zLndpbmRpbmdQYXJhbVNldCBdO1xyXG5cclxuICAgIC8vIEFkZCBmaXJzdCBzaGFwZSBkZWZpbmluZyBwb2ludCB0byB0aGUgcG9pbnQgbGlzdC5cclxuICAgIHRoaXMuZmlyc3RTaGFwZURlZmluaW5nUG9pbnQgPSBuZXcgU2hhcGVEZWZpbmluZ1BvaW50KCBwb3NpdGlvbiwgMCApOyAvL0Bwcm90ZWN0ZWRcclxuICAgIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludCA9IHRoaXMuZmlyc3RTaGFwZURlZmluaW5nUG9pbnQ7IC8vQHByb3RlY3RlZFxyXG5cclxuICAgIC8vIExpc3Qgb2YgdGhlIHNoYXBlIHNlZ21lbnRzIHRoYXQgZGVmaW5lIHRoZSBvdXRsaW5lIHNoYXBlLlxyXG4gICAgdGhpcy5zaGFwZVNlZ21lbnRzID0gW107IC8vQHB1YmxpY1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoID0gMDtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZmlyc3Qgc2hhcGUtZGVmaW5pbmcgcG9pbnQgZW5jbG9zZWQgaW4gdGhlIHByb3ZpZGVkIGxlbmd0aCByYW5nZS5cclxuICAgKiBAcGFyYW0ge1JhbmdlfSBsZW5ndGhSYW5nZVxyXG4gICAqIEByZXR1cm5zIHtTaGFwZURlZmluaW5nUG9pbnR9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRGaXJzdEVuY2xvc2VkUG9pbnQoIGxlbmd0aFJhbmdlICkge1xyXG4gICAgbGV0IGN1cnJlbnRQb2ludCA9IHRoaXMuZmlyc3RTaGFwZURlZmluaW5nUG9pbnQ7XHJcbiAgICBsZXQgY3VycmVudExlbmd0aCA9IDA7XHJcbiAgICB3aGlsZSAoIGN1cnJlbnRQb2ludCAhPT0gbnVsbCApIHtcclxuICAgICAgaWYgKCBjdXJyZW50TGVuZ3RoID49IGxlbmd0aFJhbmdlLm1pbiAmJiBjdXJyZW50TGVuZ3RoIDwgbGVuZ3RoUmFuZ2UubWF4ICkge1xyXG5cclxuICAgICAgICAvLyBXZSd2ZSBmb3VuZCB0aGUgZmlyc3QgcG9pbnQuXHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY3VycmVudFBvaW50ID0gY3VycmVudFBvaW50LmdldE5leHRQb2ludCgpO1xyXG4gICAgICBjdXJyZW50TGVuZ3RoICs9IGN1cnJlbnRQb2ludCAhPT0gbnVsbCA/IGN1cnJlbnRQb2ludC5nZXRUYXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCgpIDogMDtcclxuICAgIH1cclxuICAgIHJldHVybiBjdXJyZW50UG9pbnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGxhc3Qgc2hhcGUtZGVmaW5pbmcgcG9pbnQgZW5jbG9zZWQgaW4gdGhlIHByb3ZpZGVkIGxlbmd0aCByYW5nZS5cclxuICAgKiBAcGFyYW0gIHtSYW5nZX0gbGVuZ3RoUmFuZ2VcclxuICAgKiBAcmV0dXJucyB7U2hhcGVEZWZpbmluZ1BvaW50fVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0TGFzdEVuY2xvc2VkUG9pbnQoIGxlbmd0aFJhbmdlICkge1xyXG4gICAgbGV0IGN1cnJlbnRQb2ludCA9IHRoaXMuZmlyc3RTaGFwZURlZmluaW5nUG9pbnQ7XHJcbiAgICBsZXQgY3VycmVudExlbmd0aCA9IDA7XHJcbiAgICB3aGlsZSAoIGN1cnJlbnRQb2ludCAhPT0gbnVsbCApIHtcclxuICAgICAgaWYgKCBjdXJyZW50TGVuZ3RoID49IGxlbmd0aFJhbmdlLm1pbiAmJiBjdXJyZW50TGVuZ3RoIDwgbGVuZ3RoUmFuZ2UubWF4ICkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGN1cnJlbnRQb2ludCA9IGN1cnJlbnRQb2ludC5nZXROZXh0UG9pbnQoKTtcclxuICAgICAgY3VycmVudExlbmd0aCArPSBjdXJyZW50UG9pbnQgIT09IG51bGwgPyBjdXJyZW50UG9pbnQuZ2V0VGFyZ2V0RGlzdGFuY2VUb1ByZXZpb3VzUG9pbnQoKSA6IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBjdXJyZW50UG9pbnQgIT09IG51bGwgKSB7XHJcbiAgICAgIHdoaWxlICggY3VycmVudFBvaW50LmdldE5leHRQb2ludCgpICE9PSBudWxsICYmXHJcbiAgICAgICAgICAgICAgY3VycmVudFBvaW50LmdldE5leHRQb2ludCgpLmdldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50KCkgKyBjdXJyZW50TGVuZ3RoIDwgbGVuZ3RoUmFuZ2UubWF4ICkge1xyXG4gICAgICAgIGN1cnJlbnRQb2ludCA9IGN1cnJlbnRQb2ludC5nZXROZXh0UG9pbnQoKTtcclxuICAgICAgICBjdXJyZW50TGVuZ3RoICs9IGN1cnJlbnRQb2ludC5nZXRUYXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGN1cnJlbnRQb2ludDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGUgc3BlY2lmaWVkIGFtb3VudCBvZiBtUk5BIGxlbmd0aCB0byB0aGUgdGFpbCBlbmQgb2YgdGhlIG1STkEuIEFkZGluZyBhIGxlbmd0aCB3aWxsIGNhdXNlIHRoZSB3aW5kaW5nXHJcbiAgICogYWxnb3JpdGhtIHRvIGJlIHJlLXJ1bi5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVuZ3RoIC0gTGVuZ3RoIG9mIG1STkEgdG8gYWRkIGluIHBpY29tZXRlcnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZExlbmd0aCggbGVuZ3RoICkge1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbGVuZ3RoIHRvIHRoZSBzZXQgb2Ygc2hhcGUtZGVmaW5pbmcgcG9pbnRzLiBUaGlzIG1heSBhZGQgYSBuZXcgcG9pbnQsIG9yIHNpbXBseSByZXBvc2l0aW9uIHRoZSBjdXJyZW50XHJcbiAgICAvLyBsYXN0IHBvaW50LlxyXG4gICAgaWYgKCB0aGlzLmZpcnN0U2hhcGVEZWZpbmluZ1BvaW50ID09PSB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQgKSB7XHJcblxyXG4gICAgICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBsZW5ndGggYWRkZWQgdG8gdGhlIHN0cmFuZCwgc28gcHV0IGl0IG9uLlxyXG4gICAgICB0aGlzLmFkZFBvaW50VG9FbmQoIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5nZXRQb3NpdGlvbigpLCBsZW5ndGggKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQuZ2V0VGFyZ2V0RGlzdGFuY2VUb1ByZXZpb3VzUG9pbnQoKSA8IEdFRUNvbnN0YW50cy5JTlRFUl9QT0lOVF9ESVNUQU5DRSApIHtcclxuICAgICAgY29uc3QgcHJldkRpc3RhbmNlID0gdGhpcy5sYXN0U2hhcGVEZWZpbmluZ1BvaW50LmdldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50KCk7XHJcbiAgICAgIGlmICggcHJldkRpc3RhbmNlICsgbGVuZ3RoIDw9IEdFRUNvbnN0YW50cy5JTlRFUl9QT0lOVF9ESVNUQU5DRSApIHtcclxuXHJcbiAgICAgICAgLy8gTm8gbmVlZCB0byBhZGQgYSBuZXcgcG9pbnQgLSBqdXN0IHNldCB0aGUgZGlzdGFuY2Ugb2YgdGhlIGN1cnJlbnQgbGFzdCBwb2ludCB0byBiZSBmdXJ0aGVyIGF3YXkgZnJvbSB0aGVcclxuICAgICAgICAvLyBwcmV2aW91cy5cclxuICAgICAgICB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQuc2V0VGFyZ2V0RGlzdGFuY2VUb1ByZXZpb3VzUG9pbnQoIHByZXZEaXN0YW5jZSArIGxlbmd0aCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIGxhc3QgcG9pbnQgdG8gYmUgYXQgdGhlIHByZXNjcmliZWQgaW50ZXItcG9pbnQgZGlzdGFuY2UsIGFuZCB0aGVuIGFkZCBhIG5ldyBwb2ludC5cclxuICAgICAgICB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQuc2V0VGFyZ2V0RGlzdGFuY2VUb1ByZXZpb3VzUG9pbnQoIEdFRUNvbnN0YW50cy5JTlRFUl9QT0lOVF9ESVNUQU5DRSApO1xyXG4gICAgICAgIHRoaXMuYWRkUG9pbnRUb0VuZChcclxuICAgICAgICAgIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5nZXRQb3NpdGlvbigpLFxyXG4gICAgICAgICAgbGVuZ3RoIC0gKCBHRUVDb25zdGFudHMuSU5URVJfUE9JTlRfRElTVEFOQ0UgLSBwcmV2RGlzdGFuY2UgKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gYWRkIG5ldyBwb2ludCBvciBwb2ludHMgdG8gdGhlIGVuZFxyXG4gICAgICBsZXQgcmVtYWluaW5nTGVuZ3RoVG9BZGQgPSBsZW5ndGg7XHJcbiAgICAgIHdoaWxlICggcmVtYWluaW5nTGVuZ3RoVG9BZGQgPiAwICkge1xyXG4gICAgICAgIGNvbnN0IHRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50ID0gTWF0aC5taW4oIEdFRUNvbnN0YW50cy5JTlRFUl9QT0lOVF9ESVNUQU5DRSwgcmVtYWluaW5nTGVuZ3RoVG9BZGQgKTtcclxuICAgICAgICB0aGlzLmFkZFBvaW50VG9FbmQoIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5nZXRQb3NpdGlvbigpLCB0YXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCApO1xyXG4gICAgICAgIHJlbWFpbmluZ0xlbmd0aFRvQWRkIC09IHRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBzaGFwZSBzZWdtZW50cyB0aGF0IGRlZmluZSB0aGUgb3V0bGluZSBzaGFwZS5cclxuICAgIHRoaXMuZ2V0TGFzdFNoYXBlU2VnbWVudCgpLmFkZCggbGVuZ3RoLCB0aGlzLCB0aGlzLnNoYXBlU2VnbWVudHMgKTtcclxuXHJcbiAgICAvLyBSZWFsaWduIHRoZSBzZWdtZW50cywgc2luY2Ugc29tZSBncm93dGggcHJvYmFibHkgb2NjdXJyZWQuXHJcbiAgICB0aGlzLnJlYWxpZ25TZWdtZW50c0Zyb21FbmQoKTtcclxuXHJcbiAgICAvLyBOb3cgdGhhdCB0aGUgcG9pbnRzIGFuZCBzaGFwZSBzZWdtZW50cyBhcmUgdXBkYXRlZCwgcnVuIHRoZSBhbGdvcml0aG0gdGhhdCB3aW5kcyB0aGUgcG9pbnRzIHRocm91Z2ggdGhlIHNoYXBlc1xyXG4gICAgLy8gdG8gcHJvZHVjZSB0aGUgc2hhcGUgb2YgdGhlIHN0cmFuZCB0aGF0IHdpbGwgYmUgcHJlc2VudGVkIHRvIHRoZSB1c2VyLlxyXG4gICAgdGhpcy53aW5kUG9pbnRzVGhyb3VnaFNlZ21lbnRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGlzIHRoZSBcIndpbmRpbmcgYWxnb3JpdGhtXCIgdGhhdCBwb3NpdGlvbnMgdGhlIHBvaW50cyB0aGF0IGRlZmluZSB0aGUgc2hhcGUgb2YgdGhlIG1STkEgd2l0aGluIHRoZSBzaGFwZVxyXG4gICAqIHNlZ21lbnRzLiBUaGUgY29tYmluYXRpb24gb2YgdGhpcyBhbGdvcml0aG0gYW5kIHRoZSBzaGFwZSBzZWdtZW50cyBhbGxvdyB0aGUgbVJOQSB0byBsb29rIHJlYXNvbmFibGUgd2hlbiBpdCBpc1xyXG4gICAqIGJlaW5nIHN5bnRoZXNpemVkIGFuZCB3aGVuIGl0IGlzIGJlaW5nIHRyYW5zY3JpYmVkLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICB3aW5kUG9pbnRzVGhyb3VnaFNlZ21lbnRzKCkge1xyXG4gICAgbGV0IGhhbmRsZWRMZW5ndGggPSAwO1xyXG5cclxuICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgc2hhcGUgc2VnbWVudHMgcG9zaXRpb25pbmcgdGhlIHNoYXBlLWRlZmluaW5nIHBvaW50cyB3aXRoaW4gdGhlbS5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc2hhcGVTZWdtZW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3Qgc2hhcGVTZWdtZW50ID0gdGhpcy5zaGFwZVNlZ21lbnRzWyBpIF07XHJcbiAgICAgIGxldCBsZW5ndGhSYW5nZTtcclxuXHJcbiAgICAgIC8vIGRldGVybWluZSBob3cgbXVjaCBvZiB0aGUgbVJOQSBpcyB3aXRoaW4gdGhpcyBzaGFwZSBzZWdtZW50IGFuZCBzZXQgdGhlIGFtb3VudCBvZiBsZW5ndGggdG8gd29yayB3aXRoIGFjY29yZGluZ2x5XHJcbiAgICAgIGlmICggc2hhcGVTZWdtZW50ICE9PSB0aGlzLmdldExhc3RTaGFwZVNlZ21lbnQoKSApIHtcclxuICAgICAgICBsZW5ndGhSYW5nZSA9IG5ldyBSYW5nZSggaGFuZGxlZExlbmd0aCwgaGFuZGxlZExlbmd0aCArIHNoYXBlU2VnbWVudC5nZXRDb250YWluZWRMZW5ndGgoKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBsYXN0IHNlZ21lbnQsIHNvIHNldCB0aGUgZW5kIG9mIHRoZSBsZW5ndGggcmFuZ2UgdG8gYmUgaW5maW5pdGUgaW4gb3JkZXIgdG8gYmUgc3VyZSB0aGF0IHRoZVxyXG4gICAgICAgIC8vIGxhc3QgcG9pbnQgaXMgYWx3YXlzIGluY2x1ZGVkLiBJZiB0aGlzIGlzbid0IGRvbmUsIGFjY3VtdWxhdGlvbiBvZiBmbG9hdGluZyBwb2ludCBlcnJvcnMgY2FuIGNhdXNlIHRoZSBsYXN0XHJcbiAgICAgICAgLy8gcG9pbnQgdG8gZmFsbCBvdXRzaWRlIG9mIHRoZSByYW5nZSwgYW5kIGl0IHdvbid0IGdldCBwb3NpdGlvbmVkLiAgV2hpY2ggaXMgYmFkLlxyXG4gICAgICAgIGxlbmd0aFJhbmdlID0gbmV3IFJhbmdlKCBoYW5kbGVkTGVuZ3RoLCBOdW1iZXIuTUFYX1ZBTFVFICk7XHJcblxyXG5cclxuICAgICAgICAvLyBJZiB0aGlzIGFzc2VydCBpcyBoaXQsIHNvbWV0aGluZyBtYXkgd2VsbCBiZSB3cm9uZyB3aXRoIHRoZSB3YXkgdGhlIHNoYXBlIHNlZ21lbnRzIGFyZSBiZWluZyB1cGRhdGVkLlxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgICB0aGlzLmdldExlbmd0aCgpIC0gdGhpcy5nZXRUb3RhbExlbmd0aEluU2hhcGVTZWdtZW50cygpIDwgMSxcclxuICAgICAgICAgICdsYXJnZXIgdGhhbiBleHBlY3RlZCBkaWZmZXJlbmNlIGJldHdlZW4gbVJOQSBsZW5ndGggYW5kIHNoYXBlIHNlZ21lbnQgbGVuZ3RoJ1xyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGZpcnN0RW5jbG9zZWRQb2ludCA9IHRoaXMuZ2V0Rmlyc3RFbmNsb3NlZFBvaW50KCBsZW5ndGhSYW5nZSApO1xyXG4gICAgICBjb25zdCBsYXN0RW5jbG9zZWRQb2ludCA9IHRoaXMuZ2V0TGFzdEVuY2xvc2VkUG9pbnQoIGxlbmd0aFJhbmdlICk7XHJcbiAgICAgIGlmICggZmlyc3RFbmNsb3NlZFBvaW50ID09PSBudWxsICkge1xyXG5cclxuICAgICAgICAvLyBUaGUgc2VnbWVudCBjb250YWlucyBubyBwb2ludHMuXHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHNoYXBlU2VnbWVudC5pc0ZsYXQoKSApIHtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpb24gdGhlIGNvbnRhaW5lZCBwb2ludHMgaW4gYSBmbGF0IGxpbmUuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblBvaW50c0luTGluZSggZmlyc3RFbmNsb3NlZFBvaW50LCBsYXN0RW5jbG9zZWRQb2ludCwgc2hhcGVTZWdtZW50LmdldFVwcGVyTGVmdENvcm5lclBvc2l0aW9uKCkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNlZ21lbnQgaXMgc3F1YXJlLCBzbyBwb3NpdGlvbiB0aGUgcG9pbnRzIHdpdGhpbiBpdCBpbiBhIHdheSB0aGF0IGxvb2tzIHNvbWV0aGluZyBsaWtlIG1STkEuXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblBvaW50c0FzQ29tcGxleFdhdmUoIGZpcnN0RW5jbG9zZWRQb2ludCwgbGFzdEVuY2xvc2VkUG9pbnQsIHNoYXBlU2VnbWVudC5nZXRCb3VuZHMoKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBoYW5kbGVkTGVuZ3RoICs9IHNoYXBlU2VnbWVudC5nZXRDb250YWluZWRMZW5ndGgoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHNoYXBlIHByb3BlcnR5IGJhc2VkIG9uIHRoZSBuZXdseSBwb3NpdGlvbmVkIHBvaW50cy5cclxuICAgIHRoaXMuc2hhcGVQcm9wZXJ0eS5zZXQoIEJpb1NoYXBlVXRpbHMuY3JlYXRlQ3VydnlMaW5lRnJvbVBvaW50cyggdGhpcy5nZXRQb2ludExpc3QoKSApLm1ha2VJbW11dGFibGUoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3VtIG9mIGxlbmd0aCBvZiBhbGwgc2hhcGUgc2VnbWVudHNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0VG90YWxMZW5ndGhJblNoYXBlU2VnbWVudHMoKSB7XHJcbiAgICBsZXQgdG90YWxTaGFwZVNlZ21lbnRMZW5ndGggPSAwO1xyXG5cclxuICAgIHRoaXMuc2hhcGVTZWdtZW50cy5mb3JFYWNoKCBzaGFwZVNlZyA9PiB7XHJcbiAgICAgIHRvdGFsU2hhcGVTZWdtZW50TGVuZ3RoICs9IHNoYXBlU2VnLmdldENvbnRhaW5lZExlbmd0aCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHJldHVybiB0b3RhbFNoYXBlU2VnbWVudExlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFBvc2l0aW9uIGEgc2VyaWVzIG9mIHBvaW50cyBpbiBhIHN0cmFpZ2h0IGxpbmUuIFRoZSBkaXN0YW5jZXMgYmV0d2VlbiB0aGUgcG9pbnRzIGFyZSBzZXQgdG8gYmUgdGhlaXIgdGFyZ2V0XHJcbiAgICogZGlzdGFuY2VzLiBUaGlzIGlzIGdlbmVyYWxseSB1c2VkIHdoZW4gcG9zaXRpb25pbmcgdGhlIHBvaW50cyBpbiBhIGZsYXQgc2hhcGUgc2VnbWVudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7U2hhcGVEZWZpbmluZ1BvaW50fSBmaXJzdFBvaW50XHJcbiAgICogQHBhcmFtIHtTaGFwZURlZmluaW5nUG9pbnR9IGxhc3RQb2ludFxyXG4gICAqIEBwYXJhbSB7VmVjdG9yMn0gb3JpZ2luXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwb3NpdGlvblBvaW50c0luTGluZSggZmlyc3RQb2ludCwgbGFzdFBvaW50LCBvcmlnaW4gKSB7XHJcbiAgICBsZXQgY3VycmVudFBvaW50ID0gZmlyc3RQb2ludDtcclxuICAgIGxldCB4T2Zmc2V0ID0gMDtcclxuICAgIHdoaWxlICggY3VycmVudFBvaW50ICE9PSBsYXN0UG9pbnQgJiYgY3VycmVudFBvaW50ICE9PSBudWxsICkge1xyXG4gICAgICBjdXJyZW50UG9pbnQuc2V0UG9zaXRpb25YWSggb3JpZ2luLnggKyB4T2Zmc2V0LCBvcmlnaW4ueSApO1xyXG4gICAgICBjdXJyZW50UG9pbnQgPSBjdXJyZW50UG9pbnQuZ2V0TmV4dFBvaW50KCk7XHJcbiAgICAgIHhPZmZzZXQgKz0gY3VycmVudFBvaW50ICE9PSBudWxsID8gY3VycmVudFBvaW50LmdldFRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50KCkgOiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGN1cnJlbnRQb2ludCAhPT0gbnVsbCwgJ2Vycm9yOiBsYXN0IHBvaW50IG5vdCBmb3VuZCB3aGVuIHBvc2l0aW9uaW5nIHBvaW50cycgKTtcclxuXHJcbiAgICAvLyBwb3NpdGlvbiB0aGUgbGFzdCBwb2ludFxyXG4gICAgY3VycmVudFBvaW50LnNldFBvc2l0aW9uWFkoIG9yaWdpbi54ICsgeE9mZnNldCwgb3JpZ2luLnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHBvc2l0aW9uIHRoZSBwb2ludHMgdGhhdCBkZWZpbmUgdGhlIHNoYXBlIG9mIHRoZSBzdHJhbmQgdXNpbmcgYSBjb21iaW5hdGlvbiBvZiBzaW5lIHdhdmVzXHJcbiAgICogQHBhcmFtIHtTaGFwZURlZmluaW5nUG9pbnR9IGZpcnN0UG9pbnRcclxuICAgKiBAcGFyYW0ge1NoYXBlRGVmaW5pbmdQb2ludH0gbGFzdFBvaW50XHJcbiAgICogQHBhcmFtIHtSZWN0YW5nbGV9IGJvdW5kc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcG9zaXRpb25Qb2ludHNBc0NvbXBsZXhXYXZlKCBmaXJzdFBvaW50LCBsYXN0UG9pbnQsIGJvdW5kcyApIHtcclxuXHJcbiAgICBpZiAoIGZpcnN0UG9pbnQgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBEZWZlbnNpdmUgcHJvZ3JhbW1pbmcuXHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgZmlyc3QgcG9pbnQgYXQgdGhlIHVwcGVyIGxlZnQuXHJcbiAgICBmaXJzdFBvaW50LnNldFBvc2l0aW9uWFkoIGJvdW5kcy5nZXRNaW5YKCksIGJvdW5kcy5nZXRNaW5ZKCkgKyBib3VuZHMuZ2V0SGVpZ2h0KCkgKTtcclxuICAgIGlmICggZmlyc3RQb2ludCA9PT0gbGFzdFBvaW50ICkge1xyXG5cclxuICAgICAgLy8gTm90aGluZyBtb3JlIHRvIGRvLlxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGlhZ29uYWxTcGFuID0gTWF0aC5zcXJ0KCBib3VuZHMud2lkdGggKiBib3VuZHMud2lkdGggKyBib3VuZHMuaGVpZ2h0ICogYm91bmRzLmhlaWdodCApO1xyXG5cclxuICAgIC8vIGZvciBlYXNpZXIgbWFuaXB1bGF0aW9uLCBtYWtlIGEgbGlzdCBvZiBhbGwgb2YgdGhlIHBvaW50cyBpbiBvcmRlciBmcm9tIGZpcnN0IHRvIGxhc3RcclxuICAgIGNvbnN0IHBvaW50cyA9IFtdO1xyXG4gICAgbGV0IGN1cnJlbnRQb2ludCA9IGZpcnN0UG9pbnQ7XHJcbiAgICBwb2ludHMucHVzaCggY3VycmVudFBvaW50ICk7XHJcbiAgICB3aGlsZSAoIGN1cnJlbnRQb2ludCAhPT0gbGFzdFBvaW50ICkge1xyXG4gICAgICBjdXJyZW50UG9pbnQgPSBjdXJyZW50UG9pbnQuZ2V0TmV4dFBvaW50KCk7XHJcbiAgICAgIHBvaW50cy5wdXNoKCBjdXJyZW50UG9pbnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuZXh0TGluZWFyUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggYm91bmRzLm1pblgsIGJvdW5kcy5tYXhZICk7XHJcbiAgICBjb25zdCBpbnRlclBvaW50WERpc3RhbmNlID0gYm91bmRzLndpZHRoIC8gKCBwb2ludHMubGVuZ3RoIC0gMSApO1xyXG4gICAgY29uc3QgaW50ZXJQb2ludFlEaXN0YW5jZSA9IC1ib3VuZHMuaGVpZ2h0IC8gKCBwb2ludHMubGVuZ3RoIC0gMSApO1xyXG4gICAgbGV0IHRvdGFsRGlzdGFuY2VUcmF2ZXJzZWQgPSAwO1xyXG4gICAgY29uc3QgdG90YWxEaXN0YW5jZVBlclN0ZXAgPSBNYXRoLnNxcnQoIGludGVyUG9pbnRYRGlzdGFuY2UgKiBpbnRlclBvaW50WERpc3RhbmNlICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlclBvaW50WURpc3RhbmNlICogaW50ZXJQb2ludFlEaXN0YW5jZSApO1xyXG5cclxuICAgIC8vIGNvbnZlbmllbmNlIHZhcnMgZm9yIHdpbmRpbmcgcGFyYW1zXHJcbiAgICBjb25zdCB5V2F2ZTFGcmVxdWVuY3kgPSB0aGlzLndpbmRpbmdQYXJhbXMueVdhdmUxRnJlcXVlbmN5O1xyXG4gICAgY29uc3QgeVdhdmUxUGhhc2VPZmZzZXQgPSB0aGlzLndpbmRpbmdQYXJhbXMueVdhdmUxUGhhc2VPZmZzZXQ7XHJcbiAgICBjb25zdCB5V2F2ZTFNdWx0aXBsaWVyID0gdGhpcy53aW5kaW5nUGFyYW1zLnlXYXZlMU11bHRpcGxpZXI7XHJcbiAgICBjb25zdCB5V2F2ZTJGcmVxdWVuY3kgPSB0aGlzLndpbmRpbmdQYXJhbXMueVdhdmUyRnJlcXVlbmN5O1xyXG4gICAgY29uc3QgeVdhdmUyUGhhc2VPZmZzZXQgPSB0aGlzLndpbmRpbmdQYXJhbXMueVdhdmUyUGhhc2VPZmZzZXQ7XHJcbiAgICBjb25zdCB5V2F2ZTJNdWx0aXBsaWVyID0gdGhpcy53aW5kaW5nUGFyYW1zLnlXYXZlMk11bHRpcGxpZXI7XHJcbiAgICBjb25zdCB4V2F2ZUZyZXF1ZW5jeSA9IHRoaXMud2luZGluZ1BhcmFtcy54V2F2ZUZyZXF1ZW5jeTtcclxuICAgIGNvbnN0IHhXYXZlUGhhc2VPZmZzZXQgPSB0aGlzLndpbmRpbmdQYXJhbXMueFdhdmVQaGFzZU9mZnNldDtcclxuICAgIGNvbnN0IHhXYXZlTXVsdGlwbGllciA9IHRoaXMud2luZGluZ1BhcmFtcy54V2F2ZU11bHRpcGxpZXI7XHJcblxyXG4gICAgLy8gcHJlLWFsbG9jYXRlIGFuZCByZXVzZSB0aGUgb2Zmc2V0IHZlY3RvciBmb3Igb3B0aW1hbCBwZXJmb3JtYW5jZVxyXG4gICAgY29uc3Qgb2Zmc2V0RnJvbUxpbmVhclNlcXVlbmNlID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICAvLyBpbXBsZW1lbnQgdGhlIHdpbmRpbmcgYWxnb3JpdGhtXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyB3aW5kb3cgZnVuY3Rpb24gdG8gbW9kdWxhdGUgbGVzcyBhdCBjb3JuZXJzIG9mIHNxdWFyZSB0aGFuIGluIG1pZGRsZSBzbyB0aGF0IGV2ZXJ5dGhpbmcgZml0cyBpbiB0aGUgc2VnbWVudFxyXG4gICAgICBsZXQgb2Zmc2V0U2NhbGU7XHJcbiAgICAgIGlmICggdG90YWxEaXN0YW5jZVRyYXZlcnNlZCA8IGRpYWdvbmFsU3BhbiAvIDIgKSB7XHJcbiAgICAgICAgb2Zmc2V0U2NhbGUgPSB0b3RhbERpc3RhbmNlVHJhdmVyc2VkO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG9mZnNldFNjYWxlID0gZGlhZ29uYWxTcGFuIC0gdG90YWxEaXN0YW5jZVRyYXZlcnNlZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gdXNlIHBlcmlvZGljIGZ1bmN0aW9ucyB0byBjcmVhdGUgYSBjb21wbGV4IGJ1dCBkZXRlcm1pbmlzdGljIHNoYXBlXHJcbiAgICAgIG9mZnNldEZyb21MaW5lYXJTZXF1ZW5jZS5zZXRYWShcclxuICAgICAgICAoIHlXYXZlMU11bHRpcGxpZXIgKiBNYXRoLnNpbiggdG90YWxEaXN0YW5jZVRyYXZlcnNlZCAqIHlXYXZlMUZyZXF1ZW5jeSArIHlXYXZlMVBoYXNlT2Zmc2V0ICkgK1xyXG4gICAgICAgICAgeVdhdmUyTXVsdGlwbGllciAqIE1hdGguc2luKCB0b3RhbERpc3RhbmNlVHJhdmVyc2VkICogeVdhdmUyRnJlcXVlbmN5ICsgeVdhdmUyUGhhc2VPZmZzZXQgKSApLFxyXG4gICAgICAgIHhXYXZlTXVsdGlwbGllciAqIE1hdGguc2luKCB0b3RhbERpc3RhbmNlVHJhdmVyc2VkICogeFdhdmVGcmVxdWVuY3kgKyB4V2F2ZVBoYXNlT2Zmc2V0IClcclxuICAgICAgKTtcclxuICAgICAgb2Zmc2V0RnJvbUxpbmVhclNlcXVlbmNlLnJvdGF0ZSggTWF0aC5QSSAvIDQgKTtcclxuICAgICAgb2Zmc2V0RnJvbUxpbmVhclNlcXVlbmNlLm11bHRpcGx5U2NhbGFyKCBvZmZzZXRTY2FsZSApO1xyXG4gICAgICBwb2ludHNbIGkgXS5zZXRQb3NpdGlvblhZKFxyXG4gICAgICAgIG5leHRMaW5lYXJQb3NpdGlvbi54ICsgb2Zmc2V0RnJvbUxpbmVhclNlcXVlbmNlLngsXHJcbiAgICAgICAgTWF0aC5taW4oIG5leHRMaW5lYXJQb3NpdGlvbi55ICsgb2Zmc2V0RnJvbUxpbmVhclNlcXVlbmNlLnksIGJvdW5kcy5tYXhZIClcclxuICAgICAgKTtcclxuICAgICAgbmV4dExpbmVhclBvc2l0aW9uLmFkZFhZKCBpbnRlclBvaW50WERpc3RhbmNlLCBpbnRlclBvaW50WURpc3RhbmNlICk7XHJcbiAgICAgIHRvdGFsRGlzdGFuY2VUcmF2ZXJzZWQgKz0gdG90YWxEaXN0YW5jZVBlclN0ZXA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWFsaWduIGFsbCB0aGUgc2VnbWVudHMsIG1ha2luZyBzdXJlIHRoYXQgdGhlIGVuZCBvZiBvbmUgY29ubmVjdHMgdG8gdGhlIGJlZ2lubmluZyBvZiBhbm90aGVyLCB1c2luZyB0aGUgbGFzdFxyXG4gICAqIHNlZ21lbnQgb24gdGhlIGxpc3QgYXMgdGhlIHN0YXJ0aW5nIHBvaW50LlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVhbGlnblNlZ21lbnRzRnJvbUVuZCgpIHtcclxuICAgIGxldCBjb3B5T2ZTaGFwZVNlZ21lbnRzID0gdGhpcy5zaGFwZVNlZ21lbnRzLnNsaWNlKCk7XHJcblxyXG4gICAgY29weU9mU2hhcGVTZWdtZW50cyA9IGNvcHlPZlNoYXBlU2VnbWVudHMucmV2ZXJzZSgpO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNvcHlPZlNoYXBlU2VnbWVudHMubGVuZ3RoIC0gMTsgaSsrICkge1xyXG5cclxuICAgICAgLy8gQXNzdW1lcyB0aGF0IHRoZSBzaGFwZSBzZWdtZW50cyBhdHRhY2ggdG8gb25lIGFub3RoZXIgaW4gc3VjaCBhIHdheSB0aGF0IHRoZXkgY2hhaW4gZnJvbSB0aGUgdXBwZXIgbGVmdCB0b1xyXG4gICAgICAvLyB0aGUgbG93ZXIgcmlnaHQuXHJcbiAgICAgIGNvcHlPZlNoYXBlU2VnbWVudHNbIGkgKyAxIF0uc2V0TG93ZXJSaWdodENvcm5lclBvc2l0aW9uKCBjb3B5T2ZTaGFwZVNlZ21lbnRzWyBpIF0uZ2V0VXBwZXJMZWZ0Q29ybmVyUG9zaXRpb24oKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbGFzdCBzaGFwZSBzZWdtZW50IGluIHRoZSBzaGFwZVNlZ21lbnRzIGFycmF5XHJcbiAgICogQHJldHVybnMge1NoYXBlU2VnbWVudH1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldExhc3RTaGFwZVNlZ21lbnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zaGFwZVNlZ21lbnRzWyB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoIC0gMSBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgcG9pbnQgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdCBvZiBzaGFwZSBkZWZpbmluZyBwb2ludHMuIE5vdGUgdGhhdCB0aGlzIHdpbGwgYWx0ZXIgdGhlIGxhc3QgcG9pbnQgb24gdGhlIGxpc3QuXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0YXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYWRkUG9pbnRUb0VuZCggcG9zaXRpb24sIHRhcmdldERpc3RhbmNlVG9QcmV2aW91c1BvaW50ICkge1xyXG4gICAgY29uc3QgbmV3UG9pbnQgPSBuZXcgU2hhcGVEZWZpbmluZ1BvaW50KCBwb3NpdGlvbiwgdGFyZ2V0RGlzdGFuY2VUb1ByZXZpb3VzUG9pbnQgKTtcclxuICAgIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludC5zZXROZXh0UG9pbnQoIG5ld1BvaW50ICk7XHJcbiAgICBuZXdQb2ludC5zZXRQcmV2aW91c1BvaW50KCB0aGlzLmxhc3RTaGFwZURlZmluaW5nUG9pbnQgKTtcclxuICAgIHRoaXMubGFzdFNoYXBlRGVmaW5pbmdQb2ludCA9IG5ld1BvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwb2ludHMgdGhhdCBkZWZpbmUgdGhlIHNoYXBlIGFzIGEgbGlzdC5cclxuICAgKiBAcmV0dXJucyB7QXJyYXl9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRQb2ludExpc3QoKSB7XHJcbiAgICBjb25zdCBwb2ludExpc3QgPSBbXTtcclxuICAgIGxldCB0aGlzUG9pbnQgPSB0aGlzLmZpcnN0U2hhcGVEZWZpbmluZ1BvaW50O1xyXG4gICAgd2hpbGUgKCB0aGlzUG9pbnQgIT09IG51bGwgKSB7XHJcbiAgICAgIHBvaW50TGlzdC5wdXNoKCB0aGlzUG9pbnQuZ2V0UG9zaXRpb24oKSApO1xyXG4gICAgICB0aGlzUG9pbnQgPSB0aGlzUG9pbnQuZ2V0TmV4dFBvaW50KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcG9pbnRMaXN0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBsZW5ndGggb2YgdGhlIHN0cmFuZC4gVGhlIGxlbmd0aCBpcyBjYWxjdWxhdGVkIGJ5IGFkZGluZyB1cCB0aGUgaW50ZW5kZWQgZGlzdGFuY2VzIGJldHdlZW4gdGhlIHBvaW50cywgYW5kXHJcbiAgICogZG9lcyBub3QgYWNjb3VudCBmb3IgY3VydmF0dXJlLlxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IGxlbmd0aCBpbiBwaWNvbWV0ZXJzXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIGdldExlbmd0aCgpIHtcclxuICAgIGxldCBsZW5ndGggPSAwO1xyXG4gICAgbGV0IHRoaXNQb2ludCA9IHRoaXMuZmlyc3RTaGFwZURlZmluaW5nUG9pbnQuZ2V0TmV4dFBvaW50KCk7XHJcbiAgICB3aGlsZSAoIHRoaXNQb2ludCAhPT0gbnVsbCApIHtcclxuICAgICAgbGVuZ3RoICs9IHRoaXNQb2ludC5nZXRUYXJnZXREaXN0YW5jZVRvUHJldmlvdXNQb2ludCgpO1xyXG4gICAgICB0aGlzUG9pbnQgPSB0aGlzUG9pbnQuZ2V0TmV4dFBvaW50KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHhcclxuICAgKiBAcGFyYW0ge251bWJlcn0geVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRMb3dlclJpZ2h0UG9zaXRpb25YWSggeCwgeSApIHtcclxuICAgIGxldCB0b3RhbFdpZHRoID0gMDtcclxuICAgIGxldCB0b3RhbEhlaWdodCA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRvdGFsV2lkdGggKz0gdGhpcy5zaGFwZVNlZ21lbnRzWyBpIF0uYm91bmRzLndpZHRoO1xyXG4gICAgICB0b3RhbEhlaWdodCArPSB0aGlzLnNoYXBlU2VnbWVudHNbIGkgXS5ib3VuZHMuaGVpZ2h0O1xyXG4gICAgfVxyXG4gICAgLy8gc2V0IHRoZSBvdmVyYWxsIHBvc2l0aW9uIHByb3BlcnR5XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uWFkoIHggLSB0b3RhbFdpZHRoIC8gMiwgeSArIHRvdGFsSGVpZ2h0IC8gMiApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgcG9zaXRpb24gb2YgdGhlIGxhc3Qgc2VnbWVudCAtIHRoaXMgcG9zaXRpb24gaXMgcmVsYXRpdmUgdG8gdGhlIG92ZXJhbGwgcG9zaXRpb24sIG5vdCBhYnNvbHV0ZVxyXG4gICAgdGhpcy5nZXRMYXN0U2hhcGVTZWdtZW50KCkuc2V0TG93ZXJSaWdodENvcm5lclBvc2l0aW9uWFkoIHRvdGFsV2lkdGggLyAyLCAtdG90YWxIZWlnaHQgLyAyICk7XHJcblxyXG4gICAgLy8gcmVhbGlnbiBhbGwgb3RoZXIgc2VnbWVudHMgYmFzZWQgb24gdGhlIHBvc2l0aW9uIG9mIHRoZSBsYXN0IG9uZVxyXG4gICAgdGhpcy5yZWFsaWduU2VnbWVudHNGcm9tRW5kKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGp1c3QgdGhlIHBvc2l0aW9uIGFuZCB0aGUgcmVsYXRpdmUgcG9zaXRpb25zIG9mIGFsbCB0aGUgc2hhcGUgc2VnbWVudHMgc3VjaCB0aGF0IHRoZSBtUk5BIGlzIGluIHRoZSBzYW1lXHJcbiAgICogcGxhY2UgYnV0IHRoZSBjZW50ZXIgaXMgYWN0dWFsbHkgaW4gdGhlIGNlbnRlciBvZiB0aGUgc2VnbWVudHMuICBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGR1cmluZyB0cmFuc2xhdGlvbnNcclxuICAgKiB0aGUgc2VnbWVudHMgY2hhbmdlIHNoYXBlIGFuZCBjYW4gbW92ZSBzdWNoIHRoYXQgdGhlIHBvc2l0aW9uIGlzIG5vdCBsb25nZXIgYXQgdGhlIGNlbnRlciBvZiB0aGUgc2hhcGUuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHJlY2VudGVyKCkge1xyXG4gICAgY29uc3Qgc2hhcGVCb3VuZHMgPSB0aGlzLnNoYXBlUHJvcGVydHkuZ2V0KCkuYm91bmRzO1xyXG4gICAgY29uc3QgYWRqdXN0bWVudFggPSBzaGFwZUJvdW5kcy5jZW50ZXJYO1xyXG4gICAgY29uc3QgYWRqdXN0bWVudFkgPSBzaGFwZUJvdW5kcy5jZW50ZXJZO1xyXG5cclxuICAgIC8vIG9ubHkgcmVhZGp1c3QgaWYgbmVlZGVkXHJcbiAgICBpZiAoIGFkanVzdG1lbnRYICE9PSAwIHx8IGFkanVzdG1lbnRZICE9PSAwICkge1xyXG5cclxuICAgICAgLy8gYWRqdXN0IHRoZSBzaGFwZSBzZWdtZW50c1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgc2hhcGVTZWdtZW50ID0gdGhpcy5zaGFwZVNlZ21lbnRzWyBpIF07XHJcbiAgICAgICAgY29uc3QgdXBwZXJMZWZ0Q29ybmVyUG9zaXRpb24gPSBzaGFwZVNlZ21lbnQuZ2V0VXBwZXJMZWZ0Q29ybmVyUG9zaXRpb24oKTtcclxuICAgICAgICBzaGFwZVNlZ21lbnQuc2V0VXBwZXJMZWZ0Q29ybmVyUG9zaXRpb25YWShcclxuICAgICAgICAgIHVwcGVyTGVmdENvcm5lclBvc2l0aW9uLnggLSBhZGp1c3RtZW50WCxcclxuICAgICAgICAgIHVwcGVyTGVmdENvcm5lclBvc2l0aW9uLnkgLSBhZGp1c3RtZW50WVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFkanVzdCB0aGUgcG9zaXRpb25cclxuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uKCk7XHJcbiAgICAgIHRoaXMuc2V0UG9zaXRpb25YWSggcG9zaXRpb24ueCArIGFkanVzdG1lbnRYLCBwb3NpdGlvbi55ICsgYWRqdXN0bWVudFkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlYWxpZ24gdGhlIHBvc2l0aW9ucyBvZiBhbGwgc2VnbWVudHMgc3RhcnRpbmcgZnJvbSB0aGUgZ2l2ZW4gc2VnbWVudCBhbmQgd29ya2luZyBmb3J3YXJkIGFuZCBiYWNrd2FyZCB0aHJvdWdoXHJcbiAgICogdGhlIHNlZ21lbnQgbGlzdC5cclxuICAgKiBAcGFyYW0ge1NoYXBlU2VnbWVudH0gc2VnbWVudFRvQWxpZ25Gcm9tXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHJlYWxpZ25TZWdtZW50c0Zyb20oIHNlZ21lbnRUb0FsaWduRnJvbSApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICB0aGlzLnNoYXBlU2VnbWVudHMuaW5kZXhPZiggc2VnbWVudFRvQWxpZ25Gcm9tICkgIT09IC0xLFxyXG4gICAgICAnYXR0ZW1wdCB0byBhbGlnbiB0byBzZWdtZW50IHRoYXQgaXMgbm90IG9uIHRoZSBsaXN0J1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBbGlnbiBzZWdtZW50cyB0aGF0IGZvbGxvdyB0aGlzIG9uZS5cclxuICAgIGxldCBjdXJyZW50U2VnbWVudCA9IHNlZ21lbnRUb0FsaWduRnJvbTtcclxuICAgIGxldCBuZXh0U2VnbWVudCA9IHRoaXMuZ2V0TmV4dFNoYXBlU2VnbWVudCggY3VycmVudFNlZ21lbnQgKTtcclxuICAgIHdoaWxlICggbmV4dFNlZ21lbnQgIT09IG51bGwgKSB7XHJcbiAgICAgIGNvbnN0IG5leHRTZWdtZW50TG93ZXJSaWdodENvcm5lclBvcyA9IGN1cnJlbnRTZWdtZW50LmdldExvd2VyUmlnaHRDb3JuZXJQb3NpdGlvbigpO1xyXG4gICAgICBuZXh0U2VnbWVudC5zZXRVcHBlckxlZnRDb3JuZXJQb3NpdGlvblhZKCBuZXh0U2VnbWVudExvd2VyUmlnaHRDb3JuZXJQb3MueCwgbmV4dFNlZ21lbnRMb3dlclJpZ2h0Q29ybmVyUG9zLnkgKTtcclxuICAgICAgY3VycmVudFNlZ21lbnQgPSBuZXh0U2VnbWVudDtcclxuICAgICAgbmV4dFNlZ21lbnQgPSB0aGlzLmdldE5leHRTaGFwZVNlZ21lbnQoIGN1cnJlbnRTZWdtZW50ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWxpZ24gc2VnbWVudHMgdGhhdCBwcmVjZWRlIHRoaXMgb25lLlxyXG4gICAgY3VycmVudFNlZ21lbnQgPSBzZWdtZW50VG9BbGlnbkZyb207XHJcbiAgICBsZXQgcHJldmlvdXNTZWdtZW50ID0gdGhpcy5nZXRQcmV2aW91c1NoYXBlU2VnbWVudCggY3VycmVudFNlZ21lbnQgKTtcclxuICAgIHdoaWxlICggcHJldmlvdXNTZWdtZW50ICE9PSBudWxsICkge1xyXG4gICAgICBwcmV2aW91c1NlZ21lbnQuc2V0TG93ZXJSaWdodENvcm5lclBvc2l0aW9uKCBjdXJyZW50U2VnbWVudC5nZXRVcHBlckxlZnRDb3JuZXJQb3NpdGlvbigpICk7XHJcbiAgICAgIGN1cnJlbnRTZWdtZW50ID0gcHJldmlvdXNTZWdtZW50O1xyXG4gICAgICBwcmV2aW91c1NlZ21lbnQgPSB0aGlzLmdldFByZXZpb3VzU2hhcGVTZWdtZW50KCBjdXJyZW50U2VnbWVudCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbmV4dCBzaGFwZSBzZWdtZW50IGluIHRoZSBhcnJheSBmb3IgdGhlIGdpdmVuIHNoYXBlIHNlZ21lbnRcclxuICAgKiBAcGFyYW0ge1NoYXBlU2VnbWVudH0gc2hhcGVTZWdtZW50XHJcbiAgICogQHJldHVybnMge1NoYXBlU2VnbWVudH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TmV4dFNoYXBlU2VnbWVudCggc2hhcGVTZWdtZW50ICkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnNoYXBlU2VnbWVudHMuaW5kZXhPZiggc2hhcGVTZWdtZW50ICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnR2l2ZW4gaXRlbSBub3QgaW4gbGlzdCcgKTtcclxuXHJcbiAgICBpZiAoIGluZGV4ID09PSB0aGlzLnNoYXBlU2VnbWVudHMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgLy8gVGhlIGdpdmVuIHNlZ21lbnQgaXMgdGhlIGxhc3QgZWxlbWVudCBvbiB0aGUgbGlzdCwgc28gbnVsbCBpcyByZXR1cm5lZC5cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc2hhcGVTZWdtZW50c1sgaW5kZXggKyAxIF07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBwcmV2aW91cyBzaGFwZSBzZWdtZW50IGluIHRoZSBhcnJheSBmb3IgdGhlIGdpdmVuIHNoYXBlIHNlZ21lbnRcclxuICAgKiBAcGFyYW0ge1NoYXBlU2VnbWVudH0gc2hhcGVTZWdtZW50XHJcbiAgICogQHJldHVybnMge1NoYXBlU2VnbWVudH1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0UHJldmlvdXNTaGFwZVNlZ21lbnQoIHNoYXBlU2VnbWVudCApIHtcclxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5zaGFwZVNlZ21lbnRzLmluZGV4T2YoIHNoYXBlU2VnbWVudCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGluZGV4ICE9PSAtMSwgJ0dpdmVuIGl0ZW0gbm90IGluIGxpc3QnICk7XHJcblxyXG4gICAgaWYgKCBpbmRleCA9PT0gMCApIHtcclxuICAgICAgLy8gVGhlIGdpdmVuIHNlZ21lbnQgaXMgdGhlIGZpcnN0IGVsZW1lbnQgb24gdGhlIGxpc3QsIHNvIG51bGwgaXMgcmV0dXJuZWQuXHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnNoYXBlU2VnbWVudHNbIGluZGV4IC0gMSBdO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5zZXJ0cyB0aGUgbmV3IHNoYXBlIHNlZ21lbnQgYWZ0ZXIgdGhlIGdpdmVuIHNoYXBlIHNlZ21lbnQgaW4gdGhlIGFycmF5XHJcbiAgICogQHBhcmFtIHtTaGFwZVNlZ21lbnR9IGV4aXN0aW5nU2hhcGVTZWdtZW50XHJcbiAgICogQHBhcmFtIHtTaGFwZVNlZ21lbnR9IHNoYXBlU2VnbWVudFRvSW5zZXJ0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGluc2VydEFmdGVyU2hhcGVTZWdtZW50KCBleGlzdGluZ1NoYXBlU2VnbWVudCwgc2hhcGVTZWdtZW50VG9JbnNlcnQgKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuc2hhcGVTZWdtZW50cy5pbmRleE9mKCBleGlzdGluZ1NoYXBlU2VnbWVudCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnR2l2ZW4gaXRlbSBub3QgaW4gbGlzdCcgKTtcclxuICAgIHRoaXMuc2hhcGVTZWdtZW50cy5zcGxpY2UoIGluZGV4ICsgMSwgMCwgc2hhcGVTZWdtZW50VG9JbnNlcnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc2VydHMgdGhlIG5ldyBzaGFwZSBzZWdtZW50IGJlZm9yZSB0aGUgZ2l2ZW4gc2hhcGUgc2VnbWVudCBpbiB0aGUgYXJyYXlcclxuICAgKiBAcGFyYW0ge1NoYXBlU2VnbWVudH0gZXhpc3RpbmdTaGFwZVNlZ21lbnRcclxuICAgKiBAcGFyYW0ge1NoYXBlU2VnbWVudH0gc2hhcGVTZWdtZW50VG9JbnNlcnRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgaW5zZXJ0QmVmb3JlU2hhcGVTZWdtZW50KCBleGlzdGluZ1NoYXBlU2VnbWVudCwgc2hhcGVTZWdtZW50VG9JbnNlcnQgKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuc2hhcGVTZWdtZW50cy5pbmRleE9mKCBleGlzdGluZ1NoYXBlU2VnbWVudCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggaW5kZXggIT09IC0xLCAnR2l2ZW4gaXRlbSBub3QgaW4gbGlzdCcgKTtcclxuICAgIHRoaXMuc2hhcGVTZWdtZW50cy5zcGxpY2UoIGluZGV4LCAwLCBzaGFwZVNlZ21lbnRUb0luc2VydCApO1xyXG4gIH1cclxufVxyXG5cclxuZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLnJlZ2lzdGVyKCAnV2luZGluZ0Jpb21vbGVjdWxlJywgV2luZGluZ0Jpb21vbGVjdWxlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXaW5kaW5nQmlvbW9sZWN1bGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxLQUFLLFFB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