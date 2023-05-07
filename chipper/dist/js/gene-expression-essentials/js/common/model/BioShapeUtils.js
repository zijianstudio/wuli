// Copyright 2015-2022, University of Colorado Boulder

/**
 * Several utilities for making it easier to create some complex and somewhat random shapes. This was created initially
 * to make it easier to create the shapes associated with biomolecules, but may have other uses.
 *
 * @author Sharfudeen Ashraf
 * @author Mohamed Safi
 * @author John Blanco
 * @author Aadish Gupta
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Random from '../../../../dot/js/Random.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import ShapeUtils from './ShapeUtils.js';
const BioShapeUtils = {
  /**
   * Create a distorted shape from a list of points.  This is useful when trying to animate some sort of deviation
   * from a basic shape.
   * Note that this works best when the points are centered around the point (0, 0), and may not work at all otherwise
   * (it has never been tested).
   *
   * @param {Array.<Vector2>} points
   * @param {number} distortionFactor
   * @param {number} randomNumberSeed
   * @returns {Shape}
   * @public
   */
  createdDistortedRoundedShapeFromPoints(points, distortionFactor, randomNumberSeed) {
    const rand = new Random({
      seed: randomNumberSeed
    });

    // Alter the positions of the points that define the shape in order to define a distorted version of the shape.
    const alteredPoints = [];
    for (let i = 0; i < points.length; i++) {
      const pointAsVector = points[i].copy();
      pointAsVector.multiplyScalar(1 + (rand.nextDouble() - 0.5) * distortionFactor);
      alteredPoints.push(pointAsVector);
    }

    // Create the basis for the new shape.
    const distortedShape = ShapeUtils.createRoundedShapeFromPoints(alteredPoints);
    return distortedShape;
  },
  /**
   * Create a shape based on a set of points. The points must be in an order that, if connected by straight lines,
   * would form a closed shape. Some of the segments will be straight lines and some will be curved, and which is
   * which will be based on a pseudo-random variable.
   *
   * @param {Array.<Vector2>} points
   * @param {number} seed
   * @returns {Shape}
   * @private
   */
  createRandomShapeFromPoints(points, seed) {
    const shape = new Shape();
    const rand = new Random({
      seed: seed
    });
    let cp1 = Vector2.pool.fetch();
    let cp2 = Vector2.pool.fetch();
    shape.moveToPoint(points[0]);
    for (let i = 0; i < points.length; i++) {
      const segmentStartPoint = points[i];
      const segmentEndPoint = points[(i + 1) % points.length];
      const previousPoint = points[i - 1 >= 0 ? i - 1 : points.length - 1];
      const nextPoint = points[(i + 2) % points.length];
      cp1 = ShapeUtils.extrapolateControlPoint(previousPoint, segmentStartPoint, segmentEndPoint, cp1);
      cp2 = ShapeUtils.extrapolateControlPoint(nextPoint, segmentEndPoint, segmentStartPoint, cp2);
      if (rand.nextBoolean()) {
        // Curved segment.
        shape.cubicCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, segmentEndPoint.x, segmentEndPoint.y);
      } else {
        // Straight segment.
        shape.lineTo(segmentEndPoint.x, segmentEndPoint.y);
      }
    }
    cp1.freeToPool();
    cp2.freeToPool();
    return shape;
  },
  /**
   * Calls createRandomShapeFromPoints to create random shape
   * @param {Dimension2} size
   * @param {number} seed
   * @returns {Shape}
   * @public
   */
  createRandomShape(size, seed) {
    const pointList = [];
    const rand = new Random({
      seed: seed
    });
    // Create a series of points that will enclose a space.
    for (let angle = 0; angle < 1.9 * Math.PI; angle += Math.PI / 10 + rand.nextDouble() * Math.PI / 10) {
      pointList.push(Vector2.createPolar(0.5 + rand.nextDouble(), angle));
    }
    const unscaledShape = this.createRandomShapeFromPoints(pointList, seed);
    const unscaledShapeBounds = unscaledShape.bounds;

    // Scale the shape to the specified size.
    const horizontalScale = size.width / unscaledShapeBounds.width;
    const verticalScale = size.height / unscaledShapeBounds.height;
    const scaledMatrix = Matrix3.scaling(horizontalScale, verticalScale);
    return unscaledShape.transformed(scaledMatrix);
  },
  /**
   * Create a curvy line from a list of points. The points are assumed to be in order.
   *
   * @param {Array.<Vector2>} points
   * @returns {Shape}
   * @public
   */
  createCurvyLineFromPoints(points) {
    assert && assert(points.length > 0);

    // Control points, used throughout the code below for curving the line.
    let cp1 = Vector2.pool.fetch();
    let cp2 = Vector2.pool.fetch();
    const path = new Shape();
    path.moveTo(points[0].x, points[0].y);
    if (points.length === 1 || points.length === 2) {
      // can't really create a curve from this, so draw a straight line to the end point and call it good
      path.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      return path;
    }

    // create the first curved segment
    cp1 = ShapeUtils.extrapolateControlPoint(points[2], points[1], points[0], cp1);
    path.quadraticCurveTo(cp1.x, cp1.y, points[1].x, points[1].y);

    // create the middle segments
    for (let i = 1; i < points.length - 2; i++) {
      const segmentStartPoint = points[i];
      const segmentEndPoint = points[i + 1];
      const previousPoint = points[i - 1];
      const nextPoint = points[i + 2];
      cp1 = ShapeUtils.extrapolateControlPoint(previousPoint, segmentStartPoint, segmentEndPoint, cp1);
      cp2 = ShapeUtils.extrapolateControlPoint(nextPoint, segmentEndPoint, segmentStartPoint, cp2);
      path.cubicCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, segmentEndPoint.x, segmentEndPoint.y);
    }

    // create the final curved segment
    cp1 = ShapeUtils.extrapolateControlPoint(points[points.length - 3], points[points.length - 2], points[points.length - 1], cp1);
    path.quadraticCurveTo(cp1.x, cp1.y, points[points.length - 1].x, points[points.length - 1].y);

    // free up the pre-allocated vectors
    cp1.freeToPool();
    cp2.freeToPool();
    return path;
  },
  /**
   * Create a shape that looks roughly like a 2D representation of E. Coli, which is essentially a rectangle with
   * round ends. Some randomization is added to the shape to make it look more like a natural object.
   *
   * @param {number} width
   * @param {number} height
   * @returns {Shape}
   * @public
   */
  createEColiLikeShape(width, height) {
    assert && assert(width > height); // Param checking.  Can't create the needed shape if this isn't true.

    // Tweakable parameters that affect number of points used to define the shape.
    const numPointsPerLineSegment = 8;
    const numPointsPerCurvedSegment = 8;

    // Adjustable parameter that affects the degree to which the shape is altered to make it look somewhat irregular.
    // Zero means no change from the perfect geometric shape, 1 means a lot of variation.
    const alterationFactor = 0.025;

    // The list of points that will define the shape.
    const pointList = [];

    // Random number generator used for deviation from the perfect geometric shape.
    const rand = new Random({
      seed: 45 // empirically determined to make shape look distorted
    });

    // Variables needed for the calculations.
    const curveRadius = height / 2;
    const lineLength = width - height;
    const rightCurveCenterX = width / 2 - height / 2;
    const leftCurveCenterX = -width / 2 + height / 2;
    const centerY = 0;
    let angle = 0;
    let radius = 0;
    let nextPoint = null;

    // Create a shape that is like E. Coli. Start at the left side of the line that defines the top edge and move
    // around the shape in a clockwise direction.

    // Add points for the top line.
    for (let i = 0; i < numPointsPerLineSegment; i++) {
      nextPoint = new Vector2(leftCurveCenterX + i * (lineLength / (numPointsPerLineSegment - 1)), centerY - height / 2);
      nextPoint.setXY(nextPoint.x, nextPoint.y + (rand.nextDouble() - 0.5) * height * alterationFactor);
      pointList.push(nextPoint);
    }

    // Add points that define the right curved edge. Skip what would be the first point, because it would overlap with
    // the previous segment.
    for (let i = 1; i < numPointsPerCurvedSegment; i++) {
      angle = -Math.PI / 2 + i * (Math.PI / (numPointsPerCurvedSegment - 1));
      radius = curveRadius + (rand.nextDouble() - 0.5) * height * alterationFactor;
      pointList.push(new Vector2(rightCurveCenterX + radius * Math.cos(angle), radius * Math.sin(angle)));
    }

    // Add points that define the bottom line. Skip what would be the first point, because it would overlap with the
    // previous segment.
    for (let i = 1; i < numPointsPerLineSegment; i++) {
      nextPoint = new Vector2(rightCurveCenterX - i * (lineLength / (numPointsPerLineSegment - 1)), centerY + height / 2);
      nextPoint.setXY(nextPoint.x, nextPoint.y + (rand.nextDouble() - 0.5) * height * alterationFactor);
      pointList.push(nextPoint);
    }

    // Add points that define the left curved side. Skip what would be the first point and last points, because the
    // would overlap with the previous and next segment (respectively).
    for (let i = 1; i < numPointsPerCurvedSegment - 1; i++) {
      angle = Math.PI / 2 + i * (Math.PI / (numPointsPerCurvedSegment - 1));
      radius = curveRadius + (rand.nextDouble() - 0.5) * height * alterationFactor;
      pointList.push(new Vector2(leftCurveCenterX + radius * Math.cos(angle), radius * Math.sin(angle)));
    }

    // Create the unrotated and untranslated shape.
    return ShapeUtils.createRoundedShapeFromPoints(pointList);
  }
};
geneExpressionEssentials.register('BioShapeUtils', BioShapeUtils);
export default BioShapeUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiUmFuZG9tIiwiVmVjdG9yMiIsIlNoYXBlIiwiZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIiwiU2hhcGVVdGlscyIsIkJpb1NoYXBlVXRpbHMiLCJjcmVhdGVkRGlzdG9ydGVkUm91bmRlZFNoYXBlRnJvbVBvaW50cyIsInBvaW50cyIsImRpc3RvcnRpb25GYWN0b3IiLCJyYW5kb21OdW1iZXJTZWVkIiwicmFuZCIsInNlZWQiLCJhbHRlcmVkUG9pbnRzIiwiaSIsImxlbmd0aCIsInBvaW50QXNWZWN0b3IiLCJjb3B5IiwibXVsdGlwbHlTY2FsYXIiLCJuZXh0RG91YmxlIiwicHVzaCIsImRpc3RvcnRlZFNoYXBlIiwiY3JlYXRlUm91bmRlZFNoYXBlRnJvbVBvaW50cyIsImNyZWF0ZVJhbmRvbVNoYXBlRnJvbVBvaW50cyIsInNoYXBlIiwiY3AxIiwicG9vbCIsImZldGNoIiwiY3AyIiwibW92ZVRvUG9pbnQiLCJzZWdtZW50U3RhcnRQb2ludCIsInNlZ21lbnRFbmRQb2ludCIsInByZXZpb3VzUG9pbnQiLCJuZXh0UG9pbnQiLCJleHRyYXBvbGF0ZUNvbnRyb2xQb2ludCIsIm5leHRCb29sZWFuIiwiY3ViaWNDdXJ2ZVRvIiwieCIsInkiLCJsaW5lVG8iLCJmcmVlVG9Qb29sIiwiY3JlYXRlUmFuZG9tU2hhcGUiLCJzaXplIiwicG9pbnRMaXN0IiwiYW5nbGUiLCJNYXRoIiwiUEkiLCJjcmVhdGVQb2xhciIsInVuc2NhbGVkU2hhcGUiLCJ1bnNjYWxlZFNoYXBlQm91bmRzIiwiYm91bmRzIiwiaG9yaXpvbnRhbFNjYWxlIiwid2lkdGgiLCJ2ZXJ0aWNhbFNjYWxlIiwiaGVpZ2h0Iiwic2NhbGVkTWF0cml4Iiwic2NhbGluZyIsInRyYW5zZm9ybWVkIiwiY3JlYXRlQ3VydnlMaW5lRnJvbVBvaW50cyIsImFzc2VydCIsInBhdGgiLCJtb3ZlVG8iLCJxdWFkcmF0aWNDdXJ2ZVRvIiwiY3JlYXRlRUNvbGlMaWtlU2hhcGUiLCJudW1Qb2ludHNQZXJMaW5lU2VnbWVudCIsIm51bVBvaW50c1BlckN1cnZlZFNlZ21lbnQiLCJhbHRlcmF0aW9uRmFjdG9yIiwiY3VydmVSYWRpdXMiLCJsaW5lTGVuZ3RoIiwicmlnaHRDdXJ2ZUNlbnRlclgiLCJsZWZ0Q3VydmVDZW50ZXJYIiwiY2VudGVyWSIsInJhZGl1cyIsInNldFhZIiwiY29zIiwic2luIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCaW9TaGFwZVV0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNldmVyYWwgdXRpbGl0aWVzIGZvciBtYWtpbmcgaXQgZWFzaWVyIHRvIGNyZWF0ZSBzb21lIGNvbXBsZXggYW5kIHNvbWV3aGF0IHJhbmRvbSBzaGFwZXMuIFRoaXMgd2FzIGNyZWF0ZWQgaW5pdGlhbGx5XHJcbiAqIHRvIG1ha2UgaXQgZWFzaWVyIHRvIGNyZWF0ZSB0aGUgc2hhcGVzIGFzc29jaWF0ZWQgd2l0aCBiaW9tb2xlY3VsZXMsIGJ1dCBtYXkgaGF2ZSBvdGhlciB1c2VzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqIEBhdXRob3IgTW9oYW1lZCBTYWZpXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmRvbS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzIGZyb20gJy4uLy4uL2dlbmVFeHByZXNzaW9uRXNzZW50aWFscy5qcyc7XHJcbmltcG9ydCBTaGFwZVV0aWxzIGZyb20gJy4vU2hhcGVVdGlscy5qcyc7XHJcblxyXG5jb25zdCBCaW9TaGFwZVV0aWxzID0ge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIGRpc3RvcnRlZCBzaGFwZSBmcm9tIGEgbGlzdCBvZiBwb2ludHMuICBUaGlzIGlzIHVzZWZ1bCB3aGVuIHRyeWluZyB0byBhbmltYXRlIHNvbWUgc29ydCBvZiBkZXZpYXRpb25cclxuICAgKiBmcm9tIGEgYmFzaWMgc2hhcGUuXHJcbiAgICogTm90ZSB0aGF0IHRoaXMgd29ya3MgYmVzdCB3aGVuIHRoZSBwb2ludHMgYXJlIGNlbnRlcmVkIGFyb3VuZCB0aGUgcG9pbnQgKDAsIDApLCBhbmQgbWF5IG5vdCB3b3JrIGF0IGFsbCBvdGhlcndpc2VcclxuICAgKiAoaXQgaGFzIG5ldmVyIGJlZW4gdGVzdGVkKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSBwb2ludHNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlzdG9ydGlvbkZhY3RvclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYW5kb21OdW1iZXJTZWVkXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjcmVhdGVkRGlzdG9ydGVkUm91bmRlZFNoYXBlRnJvbVBvaW50cyggcG9pbnRzLCBkaXN0b3J0aW9uRmFjdG9yLCByYW5kb21OdW1iZXJTZWVkICkge1xyXG4gICAgY29uc3QgcmFuZCA9IG5ldyBSYW5kb20oIHtcclxuICAgICAgc2VlZDogcmFuZG9tTnVtYmVyU2VlZFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFsdGVyIHRoZSBwb3NpdGlvbnMgb2YgdGhlIHBvaW50cyB0aGF0IGRlZmluZSB0aGUgc2hhcGUgaW4gb3JkZXIgdG8gZGVmaW5lIGEgZGlzdG9ydGVkIHZlcnNpb24gb2YgdGhlIHNoYXBlLlxyXG4gICAgY29uc3QgYWx0ZXJlZFBvaW50cyA9IFtdO1xyXG5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcG9pbnRBc1ZlY3RvciA9IHBvaW50c1sgaSBdLmNvcHkoKTtcclxuICAgICAgcG9pbnRBc1ZlY3Rvci5tdWx0aXBseVNjYWxhciggMSArICggcmFuZC5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIGRpc3RvcnRpb25GYWN0b3IgKTtcclxuICAgICAgYWx0ZXJlZFBvaW50cy5wdXNoKCBwb2ludEFzVmVjdG9yICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBiYXNpcyBmb3IgdGhlIG5ldyBzaGFwZS5cclxuICAgIGNvbnN0IGRpc3RvcnRlZFNoYXBlID0gU2hhcGVVdGlscy5jcmVhdGVSb3VuZGVkU2hhcGVGcm9tUG9pbnRzKCBhbHRlcmVkUG9pbnRzICk7XHJcblxyXG4gICAgcmV0dXJuIGRpc3RvcnRlZFNoYXBlO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHNoYXBlIGJhc2VkIG9uIGEgc2V0IG9mIHBvaW50cy4gVGhlIHBvaW50cyBtdXN0IGJlIGluIGFuIG9yZGVyIHRoYXQsIGlmIGNvbm5lY3RlZCBieSBzdHJhaWdodCBsaW5lcyxcclxuICAgKiB3b3VsZCBmb3JtIGEgY2xvc2VkIHNoYXBlLiBTb21lIG9mIHRoZSBzZWdtZW50cyB3aWxsIGJlIHN0cmFpZ2h0IGxpbmVzIGFuZCBzb21lIHdpbGwgYmUgY3VydmVkLCBhbmQgd2hpY2ggaXNcclxuICAgKiB3aGljaCB3aWxsIGJlIGJhc2VkIG9uIGEgcHNldWRvLXJhbmRvbSB2YXJpYWJsZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSBwb2ludHNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VlZFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNyZWF0ZVJhbmRvbVNoYXBlRnJvbVBvaW50cyggcG9pbnRzLCBzZWVkICkge1xyXG5cclxuICAgIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKCk7XHJcbiAgICBjb25zdCByYW5kID0gbmV3IFJhbmRvbSgge1xyXG4gICAgICBzZWVkOiBzZWVkXHJcbiAgICB9ICk7XHJcbiAgICBsZXQgY3AxID0gVmVjdG9yMi5wb29sLmZldGNoKCk7XHJcbiAgICBsZXQgY3AyID0gVmVjdG9yMi5wb29sLmZldGNoKCk7XHJcblxyXG4gICAgc2hhcGUubW92ZVRvUG9pbnQoIHBvaW50c1sgMCBdICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRTdGFydFBvaW50ID0gcG9pbnRzWyBpIF07XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRFbmRQb2ludCA9IHBvaW50c1sgKCBpICsgMSApICUgcG9pbnRzLmxlbmd0aCBdO1xyXG4gICAgICBjb25zdCBwcmV2aW91c1BvaW50ID0gcG9pbnRzWyBpIC0gMSA+PSAwID8gaSAtIDEgOiBwb2ludHMubGVuZ3RoIC0gMSBdO1xyXG4gICAgICBjb25zdCBuZXh0UG9pbnQgPSBwb2ludHNbICggaSArIDIgKSAlIHBvaW50cy5sZW5ndGggXTtcclxuICAgICAgY3AxID0gU2hhcGVVdGlscy5leHRyYXBvbGF0ZUNvbnRyb2xQb2ludCggcHJldmlvdXNQb2ludCwgc2VnbWVudFN0YXJ0UG9pbnQsIHNlZ21lbnRFbmRQb2ludCwgY3AxICk7XHJcbiAgICAgIGNwMiA9IFNoYXBlVXRpbHMuZXh0cmFwb2xhdGVDb250cm9sUG9pbnQoIG5leHRQb2ludCwgc2VnbWVudEVuZFBvaW50LCBzZWdtZW50U3RhcnRQb2ludCwgY3AyICk7XHJcbiAgICAgIGlmICggcmFuZC5uZXh0Qm9vbGVhbigpICkge1xyXG4gICAgICAgIC8vIEN1cnZlZCBzZWdtZW50LlxyXG4gICAgICAgIHNoYXBlLmN1YmljQ3VydmVUbyggY3AxLngsIGNwMS55LCBjcDIueCwgY3AyLnksIHNlZ21lbnRFbmRQb2ludC54LCBzZWdtZW50RW5kUG9pbnQueSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIFN0cmFpZ2h0IHNlZ21lbnQuXHJcbiAgICAgICAgc2hhcGUubGluZVRvKCBzZWdtZW50RW5kUG9pbnQueCwgc2VnbWVudEVuZFBvaW50LnkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY3AxLmZyZWVUb1Bvb2woKTtcclxuICAgIGNwMi5mcmVlVG9Qb29sKCk7XHJcbiAgICByZXR1cm4gc2hhcGU7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbHMgY3JlYXRlUmFuZG9tU2hhcGVGcm9tUG9pbnRzIHRvIGNyZWF0ZSByYW5kb20gc2hhcGVcclxuICAgKiBAcGFyYW0ge0RpbWVuc2lvbjJ9IHNpemVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gc2VlZFxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY3JlYXRlUmFuZG9tU2hhcGUoIHNpemUsIHNlZWQgKSB7XHJcbiAgICBjb25zdCBwb2ludExpc3QgPSBbXTtcclxuICAgIGNvbnN0IHJhbmQgPSBuZXcgUmFuZG9tKCB7XHJcbiAgICAgIHNlZWQ6IHNlZWRcclxuICAgIH0gKTtcclxuICAgIC8vIENyZWF0ZSBhIHNlcmllcyBvZiBwb2ludHMgdGhhdCB3aWxsIGVuY2xvc2UgYSBzcGFjZS5cclxuICAgIGZvciAoIGxldCBhbmdsZSA9IDA7IGFuZ2xlIDwgMS45ICogTWF0aC5QSTsgYW5nbGUgKz0gTWF0aC5QSSAvIDEwICsgcmFuZC5uZXh0RG91YmxlKCkgKiBNYXRoLlBJIC8gMTAgKSB7XHJcbiAgICAgIHBvaW50TGlzdC5wdXNoKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCAwLjUgKyByYW5kLm5leHREb3VibGUoKSwgYW5nbGUgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVuc2NhbGVkU2hhcGUgPSB0aGlzLmNyZWF0ZVJhbmRvbVNoYXBlRnJvbVBvaW50cyggcG9pbnRMaXN0LCBzZWVkICk7XHJcbiAgICBjb25zdCB1bnNjYWxlZFNoYXBlQm91bmRzID0gdW5zY2FsZWRTaGFwZS5ib3VuZHM7XHJcblxyXG4gICAgLy8gU2NhbGUgdGhlIHNoYXBlIHRvIHRoZSBzcGVjaWZpZWQgc2l6ZS5cclxuICAgIGNvbnN0IGhvcml6b250YWxTY2FsZSA9IHNpemUud2lkdGggLyB1bnNjYWxlZFNoYXBlQm91bmRzLndpZHRoO1xyXG4gICAgY29uc3QgdmVydGljYWxTY2FsZSA9IHNpemUuaGVpZ2h0IC8gdW5zY2FsZWRTaGFwZUJvdW5kcy5oZWlnaHQ7XHJcblxyXG4gICAgY29uc3Qgc2NhbGVkTWF0cml4ID0gTWF0cml4My5zY2FsaW5nKCBob3Jpem9udGFsU2NhbGUsIHZlcnRpY2FsU2NhbGUgKTtcclxuICAgIHJldHVybiB1bnNjYWxlZFNoYXBlLnRyYW5zZm9ybWVkKCBzY2FsZWRNYXRyaXggKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBjdXJ2eSBsaW5lIGZyb20gYSBsaXN0IG9mIHBvaW50cy4gVGhlIHBvaW50cyBhcmUgYXNzdW1lZCB0byBiZSBpbiBvcmRlci5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFZlY3RvcjI+fSBwb2ludHNcclxuICAgKiBAcmV0dXJucyB7U2hhcGV9XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNyZWF0ZUN1cnZ5TGluZUZyb21Qb2ludHMoIHBvaW50cyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBvaW50cy5sZW5ndGggPiAwICk7XHJcblxyXG4gICAgLy8gQ29udHJvbCBwb2ludHMsIHVzZWQgdGhyb3VnaG91dCB0aGUgY29kZSBiZWxvdyBmb3IgY3VydmluZyB0aGUgbGluZS5cclxuICAgIGxldCBjcDEgPSBWZWN0b3IyLnBvb2wuZmV0Y2goKTtcclxuICAgIGxldCBjcDIgPSBWZWN0b3IyLnBvb2wuZmV0Y2goKTtcclxuXHJcbiAgICBjb25zdCBwYXRoID0gbmV3IFNoYXBlKCk7XHJcbiAgICBwYXRoLm1vdmVUbyggcG9pbnRzWyAwIF0ueCwgcG9pbnRzWyAwIF0ueSApO1xyXG4gICAgaWYgKCBwb2ludHMubGVuZ3RoID09PSAxIHx8IHBvaW50cy5sZW5ndGggPT09IDIgKSB7XHJcblxyXG4gICAgICAvLyBjYW4ndCByZWFsbHkgY3JlYXRlIGEgY3VydmUgZnJvbSB0aGlzLCBzbyBkcmF3IGEgc3RyYWlnaHQgbGluZSB0byB0aGUgZW5kIHBvaW50IGFuZCBjYWxsIGl0IGdvb2RcclxuICAgICAgcGF0aC5saW5lVG8oIHBvaW50c1sgcG9pbnRzLmxlbmd0aCAtIDEgXS54LCBwb2ludHNbIHBvaW50cy5sZW5ndGggLSAxIF0ueSApO1xyXG4gICAgICByZXR1cm4gcGF0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGZpcnN0IGN1cnZlZCBzZWdtZW50XHJcbiAgICBjcDEgPSBTaGFwZVV0aWxzLmV4dHJhcG9sYXRlQ29udHJvbFBvaW50KCBwb2ludHNbIDIgXSwgcG9pbnRzWyAxIF0sIHBvaW50c1sgMCBdLCBjcDEgKTtcclxuICAgIHBhdGgucXVhZHJhdGljQ3VydmVUbyggY3AxLngsIGNwMS55LCBwb2ludHNbIDEgXS54LCBwb2ludHNbIDEgXS55ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBtaWRkbGUgc2VnbWVudHNcclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IHBvaW50cy5sZW5ndGggLSAyOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRTdGFydFBvaW50ID0gcG9pbnRzWyBpIF07XHJcbiAgICAgIGNvbnN0IHNlZ21lbnRFbmRQb2ludCA9IHBvaW50c1sgaSArIDEgXTtcclxuICAgICAgY29uc3QgcHJldmlvdXNQb2ludCA9IHBvaW50c1sgaSAtIDEgXTtcclxuICAgICAgY29uc3QgbmV4dFBvaW50ID0gcG9pbnRzWyAoIGkgKyAyICkgXTtcclxuICAgICAgY3AxID0gU2hhcGVVdGlscy5leHRyYXBvbGF0ZUNvbnRyb2xQb2ludCggcHJldmlvdXNQb2ludCwgc2VnbWVudFN0YXJ0UG9pbnQsIHNlZ21lbnRFbmRQb2ludCwgY3AxICk7XHJcbiAgICAgIGNwMiA9IFNoYXBlVXRpbHMuZXh0cmFwb2xhdGVDb250cm9sUG9pbnQoIG5leHRQb2ludCwgc2VnbWVudEVuZFBvaW50LCBzZWdtZW50U3RhcnRQb2ludCwgY3AyICk7XHJcbiAgICAgIHBhdGguY3ViaWNDdXJ2ZVRvKCBjcDEueCwgY3AxLnksIGNwMi54LCBjcDIueSwgc2VnbWVudEVuZFBvaW50LngsIHNlZ21lbnRFbmRQb2ludC55ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBmaW5hbCBjdXJ2ZWQgc2VnbWVudFxyXG4gICAgY3AxID0gU2hhcGVVdGlscy5leHRyYXBvbGF0ZUNvbnRyb2xQb2ludChcclxuICAgICAgcG9pbnRzWyBwb2ludHMubGVuZ3RoIC0gMyBdLFxyXG4gICAgICBwb2ludHNbIHBvaW50cy5sZW5ndGggLSAyIF0sXHJcbiAgICAgIHBvaW50c1sgcG9pbnRzLmxlbmd0aCAtIDEgXSxcclxuICAgICAgY3AxXHJcbiAgICApO1xyXG4gICAgcGF0aC5xdWFkcmF0aWNDdXJ2ZVRvKCBjcDEueCwgY3AxLnksIHBvaW50c1sgcG9pbnRzLmxlbmd0aCAtIDEgXS54LCBwb2ludHNbIHBvaW50cy5sZW5ndGggLSAxIF0ueSApO1xyXG5cclxuICAgIC8vIGZyZWUgdXAgdGhlIHByZS1hbGxvY2F0ZWQgdmVjdG9yc1xyXG4gICAgY3AxLmZyZWVUb1Bvb2woKTtcclxuICAgIGNwMi5mcmVlVG9Qb29sKCk7XHJcblxyXG4gICAgcmV0dXJuIHBhdGg7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgc2hhcGUgdGhhdCBsb29rcyByb3VnaGx5IGxpa2UgYSAyRCByZXByZXNlbnRhdGlvbiBvZiBFLiBDb2xpLCB3aGljaCBpcyBlc3NlbnRpYWxseSBhIHJlY3RhbmdsZSB3aXRoXHJcbiAgICogcm91bmQgZW5kcy4gU29tZSByYW5kb21pemF0aW9uIGlzIGFkZGVkIHRvIHRoZSBzaGFwZSB0byBtYWtlIGl0IGxvb2sgbW9yZSBsaWtlIGEgbmF0dXJhbCBvYmplY3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0XHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjcmVhdGVFQ29saUxpa2VTaGFwZSggd2lkdGgsIGhlaWdodCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID4gaGVpZ2h0ICk7IC8vIFBhcmFtIGNoZWNraW5nLiAgQ2FuJ3QgY3JlYXRlIHRoZSBuZWVkZWQgc2hhcGUgaWYgdGhpcyBpc24ndCB0cnVlLlxyXG5cclxuICAgIC8vIFR3ZWFrYWJsZSBwYXJhbWV0ZXJzIHRoYXQgYWZmZWN0IG51bWJlciBvZiBwb2ludHMgdXNlZCB0byBkZWZpbmUgdGhlIHNoYXBlLlxyXG4gICAgY29uc3QgbnVtUG9pbnRzUGVyTGluZVNlZ21lbnQgPSA4O1xyXG4gICAgY29uc3QgbnVtUG9pbnRzUGVyQ3VydmVkU2VnbWVudCA9IDg7XHJcblxyXG4gICAgLy8gQWRqdXN0YWJsZSBwYXJhbWV0ZXIgdGhhdCBhZmZlY3RzIHRoZSBkZWdyZWUgdG8gd2hpY2ggdGhlIHNoYXBlIGlzIGFsdGVyZWQgdG8gbWFrZSBpdCBsb29rIHNvbWV3aGF0IGlycmVndWxhci5cclxuICAgIC8vIFplcm8gbWVhbnMgbm8gY2hhbmdlIGZyb20gdGhlIHBlcmZlY3QgZ2VvbWV0cmljIHNoYXBlLCAxIG1lYW5zIGEgbG90IG9mIHZhcmlhdGlvbi5cclxuICAgIGNvbnN0IGFsdGVyYXRpb25GYWN0b3IgPSAwLjAyNTtcclxuXHJcbiAgICAvLyBUaGUgbGlzdCBvZiBwb2ludHMgdGhhdCB3aWxsIGRlZmluZSB0aGUgc2hhcGUuXHJcbiAgICBjb25zdCBwb2ludExpc3QgPSBbXTtcclxuXHJcbiAgICAvLyBSYW5kb20gbnVtYmVyIGdlbmVyYXRvciB1c2VkIGZvciBkZXZpYXRpb24gZnJvbSB0aGUgcGVyZmVjdCBnZW9tZXRyaWMgc2hhcGUuXHJcbiAgICBjb25zdCByYW5kID0gbmV3IFJhbmRvbSgge1xyXG4gICAgICBzZWVkOiA0NSAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIG1ha2Ugc2hhcGUgbG9vayBkaXN0b3J0ZWRcclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgLy8gVmFyaWFibGVzIG5lZWRlZCBmb3IgdGhlIGNhbGN1bGF0aW9ucy5cclxuICAgIGNvbnN0IGN1cnZlUmFkaXVzID0gaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IGxpbmVMZW5ndGggPSB3aWR0aCAtIGhlaWdodDtcclxuICAgIGNvbnN0IHJpZ2h0Q3VydmVDZW50ZXJYID0gd2lkdGggLyAyIC0gaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IGxlZnRDdXJ2ZUNlbnRlclggPSAtd2lkdGggLyAyICsgaGVpZ2h0IC8gMjtcclxuICAgIGNvbnN0IGNlbnRlclkgPSAwO1xyXG4gICAgbGV0IGFuZ2xlID0gMDtcclxuICAgIGxldCByYWRpdXMgPSAwO1xyXG4gICAgbGV0IG5leHRQb2ludCA9IG51bGw7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgc2hhcGUgdGhhdCBpcyBsaWtlIEUuIENvbGkuIFN0YXJ0IGF0IHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGxpbmUgdGhhdCBkZWZpbmVzIHRoZSB0b3AgZWRnZSBhbmQgbW92ZVxyXG4gICAgLy8gYXJvdW5kIHRoZSBzaGFwZSBpbiBhIGNsb2Nrd2lzZSBkaXJlY3Rpb24uXHJcblxyXG4gICAgLy8gQWRkIHBvaW50cyBmb3IgdGhlIHRvcCBsaW5lLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtUG9pbnRzUGVyTGluZVNlZ21lbnQ7IGkrKyApIHtcclxuICAgICAgbmV4dFBvaW50ID0gbmV3IFZlY3RvcjIoIGxlZnRDdXJ2ZUNlbnRlclggKyBpICogKCBsaW5lTGVuZ3RoIC8gKCBudW1Qb2ludHNQZXJMaW5lU2VnbWVudCAtIDEgKSApLCBjZW50ZXJZIC0gaGVpZ2h0IC8gMiApO1xyXG4gICAgICBuZXh0UG9pbnQuc2V0WFkoIG5leHRQb2ludC54LCBuZXh0UG9pbnQueSArICggcmFuZC5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIGhlaWdodCAqIGFsdGVyYXRpb25GYWN0b3IgKTtcclxuICAgICAgcG9pbnRMaXN0LnB1c2goIG5leHRQb2ludCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBwb2ludHMgdGhhdCBkZWZpbmUgdGhlIHJpZ2h0IGN1cnZlZCBlZGdlLiBTa2lwIHdoYXQgd291bGQgYmUgdGhlIGZpcnN0IHBvaW50LCBiZWNhdXNlIGl0IHdvdWxkIG92ZXJsYXAgd2l0aFxyXG4gICAgLy8gdGhlIHByZXZpb3VzIHNlZ21lbnQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBudW1Qb2ludHNQZXJDdXJ2ZWRTZWdtZW50OyBpKysgKSB7XHJcbiAgICAgIGFuZ2xlID0gLU1hdGguUEkgLyAyICsgaSAqICggTWF0aC5QSSAvICggbnVtUG9pbnRzUGVyQ3VydmVkU2VnbWVudCAtIDEgKSApO1xyXG4gICAgICByYWRpdXMgPSBjdXJ2ZVJhZGl1cyArICggcmFuZC5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIGhlaWdodCAqIGFsdGVyYXRpb25GYWN0b3I7XHJcbiAgICAgIHBvaW50TGlzdC5wdXNoKCBuZXcgVmVjdG9yMiggcmlnaHRDdXJ2ZUNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyggYW5nbGUgKSwgcmFkaXVzICogTWF0aC5zaW4oIGFuZ2xlICkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBwb2ludHMgdGhhdCBkZWZpbmUgdGhlIGJvdHRvbSBsaW5lLiBTa2lwIHdoYXQgd291bGQgYmUgdGhlIGZpcnN0IHBvaW50LCBiZWNhdXNlIGl0IHdvdWxkIG92ZXJsYXAgd2l0aCB0aGVcclxuICAgIC8vIHByZXZpb3VzIHNlZ21lbnQuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDE7IGkgPCBudW1Qb2ludHNQZXJMaW5lU2VnbWVudDsgaSsrICkge1xyXG4gICAgICBuZXh0UG9pbnQgPSBuZXcgVmVjdG9yMiggcmlnaHRDdXJ2ZUNlbnRlclggLSBpICogKCBsaW5lTGVuZ3RoIC8gKCBudW1Qb2ludHNQZXJMaW5lU2VnbWVudCAtIDEgKSApLCBjZW50ZXJZICsgaGVpZ2h0IC8gMiApO1xyXG4gICAgICBuZXh0UG9pbnQuc2V0WFkoIG5leHRQb2ludC54LCBuZXh0UG9pbnQueSArICggcmFuZC5uZXh0RG91YmxlKCkgLSAwLjUgKSAqIGhlaWdodCAqIGFsdGVyYXRpb25GYWN0b3IgKTtcclxuICAgICAgcG9pbnRMaXN0LnB1c2goIG5leHRQb2ludCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCBwb2ludHMgdGhhdCBkZWZpbmUgdGhlIGxlZnQgY3VydmVkIHNpZGUuIFNraXAgd2hhdCB3b3VsZCBiZSB0aGUgZmlyc3QgcG9pbnQgYW5kIGxhc3QgcG9pbnRzLCBiZWNhdXNlIHRoZVxyXG4gICAgLy8gd291bGQgb3ZlcmxhcCB3aXRoIHRoZSBwcmV2aW91cyBhbmQgbmV4dCBzZWdtZW50IChyZXNwZWN0aXZlbHkpLlxyXG4gICAgZm9yICggbGV0IGkgPSAxOyBpIDwgbnVtUG9pbnRzUGVyQ3VydmVkU2VnbWVudCAtIDE7IGkrKyApIHtcclxuICAgICAgYW5nbGUgPSBNYXRoLlBJIC8gMiArIGkgKiAoIE1hdGguUEkgLyAoIG51bVBvaW50c1BlckN1cnZlZFNlZ21lbnQgLSAxICkgKTtcclxuICAgICAgcmFkaXVzID0gY3VydmVSYWRpdXMgKyAoIHJhbmQubmV4dERvdWJsZSgpIC0gMC41ICkgKiBoZWlnaHQgKiBhbHRlcmF0aW9uRmFjdG9yO1xyXG4gICAgICBwb2ludExpc3QucHVzaCggbmV3IFZlY3RvcjIoIGxlZnRDdXJ2ZUNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyggYW5nbGUgKSwgcmFkaXVzICogTWF0aC5zaW4oIGFuZ2xlICkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgdW5yb3RhdGVkIGFuZCB1bnRyYW5zbGF0ZWQgc2hhcGUuXHJcbiAgICByZXR1cm4gU2hhcGVVdGlscy5jcmVhdGVSb3VuZGVkU2hhcGVGcm9tUG9pbnRzKCBwb2ludExpc3QgKTtcclxuICB9XHJcbn07XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdCaW9TaGFwZVV0aWxzJywgQmlvU2hhcGVVdGlscyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQmlvU2hhcGVVdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSw4QkFBOEI7QUFDakQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLG1DQUFtQztBQUN4RSxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBRXhDLE1BQU1DLGFBQWEsR0FBRztFQUNwQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsc0NBQXNDQSxDQUFFQyxNQUFNLEVBQUVDLGdCQUFnQixFQUFFQyxnQkFBZ0IsRUFBRztJQUNuRixNQUFNQyxJQUFJLEdBQUcsSUFBSVYsTUFBTSxDQUFFO01BQ3ZCVyxJQUFJLEVBQUVGO0lBQ1IsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUcsYUFBYSxHQUFHLEVBQUU7SUFFeEIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdOLE1BQU0sQ0FBQ08sTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRztNQUN4QyxNQUFNRSxhQUFh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