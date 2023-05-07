// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model for a flexible cylindrical pipe which can be modified using a fixed number of control points.
 * Also models the flow of particles in the pipe (with and without friction).
 * All units are in metric unless otherwise mentioned.
 *
 * @author Siddhartha Chinthapally (Actual Concepts).
 */

import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import PipeControlPoint from './PipeControlPoint.js';
import PipeCrossSection from './PipeCrossSection.js';
import SplineEvaluation from './SplineEvaluation.js';

// constants
const CROSS_SECTION_MIN_HEIGHT = 1; //m
const TOP_CONTROL_POINT_INITIAL_Y = -3.5; //m
const BOTTOM_CONTROL_POINT_INITIAL_Y = -1.4; //m
const PIPE_INITIAL_SCALE = 0.36;
const PIPE_INITIAL_Y = 197; //from screen top in view coordinates
const TOP_HANDLE_INITIAL_Y = PIPE_INITIAL_Y + 2; //from screen top in view coordinates
const BOTTOM_HANDLE_INITIAL_Y = 324; //from screen top in view coordinates

const CONTROL_POINT_X_SPACING = 2.3; //m
const LAST_CONTROL_POINT_OFFSET = 0.2; //m
const DUMMY_CONTROL_POINT_OFFSET = 0.1; //m

class Pipe {
  constructor() {
    const mainHandleInitialY = (TOP_HANDLE_INITIAL_Y + BOTTOM_HANDLE_INITIAL_Y) / 2;
    this.flowRateProperty = new Property(5000); // rate of fluid flow in Liter per second (L/s)
    this.frictionProperty = new Property(false); // flag indicating whether friction should slow particles near the edges
    this.rightPipeYPositionProperty = new Property(PIPE_INITIAL_Y); //tracks the right pipe's vertical position in pixel
    this.leftPipeYPositionProperty = new Property(PIPE_INITIAL_Y);
    this.leftPipeMainHandleYPositionProperty = new Property(mainHandleInitialY);
    this.rightPipeMainHandleYPositionProperty = new Property(mainHandleInitialY);
    this.leftPipeScaleProperty = new Property(PIPE_INITIAL_SCALE);
    this.rightPipeScaleProperty = new Property(PIPE_INITIAL_SCALE);
    this.leftPipeTopHandleYProperty = new Property(TOP_HANDLE_INITIAL_Y);
    this.leftPipeBottomHandleYProperty = new Property(BOTTOM_HANDLE_INITIAL_Y);
    this.rightPipeTopHandleYProperty = new Property(TOP_HANDLE_INITIAL_Y);
    this.rightPipeBottomHandleYProperty = new Property(BOTTOM_HANDLE_INITIAL_Y);

    // cross-sections that the user can manipulate to deform the pipe.
    const controlCrossSections = [
    //dummy cross section, not part of the pipe flow line shape. This is where the particles originate.
    new PipeCrossSection(-(3 * CONTROL_POINT_X_SPACING - DUMMY_CONTROL_POINT_OFFSET), TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(-(3 * CONTROL_POINT_X_SPACING - LAST_CONTROL_POINT_OFFSET), TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(-(2 * CONTROL_POINT_X_SPACING), TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(-CONTROL_POINT_X_SPACING, TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(0, TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(CONTROL_POINT_X_SPACING, TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(2 * CONTROL_POINT_X_SPACING, TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y), new PipeCrossSection(3 * CONTROL_POINT_X_SPACING - LAST_CONTROL_POINT_OFFSET, TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y),
    //dummy cross section, not part of the pipe flow line shape. This is where the particles are removed.
    new PipeCrossSection(3 * CONTROL_POINT_X_SPACING - DUMMY_CONTROL_POINT_OFFSET, TOP_CONTROL_POINT_INITIAL_Y, BOTTOM_CONTROL_POINT_INITIAL_Y)];
    this.top = []; // array to store top control points
    this.bottom = []; // array to store bottom control points
    for (let i = 0; i < controlCrossSections.length; i++) {
      this.top.push(new PipeControlPoint(controlCrossSections[i].x, controlCrossSections[i].yTop));
      this.bottom.push(new PipeControlPoint(controlCrossSections[i].x, controlCrossSections[i].yBottom));
    }

    // nonlinear interpolation of the control sections for particle motion and determining the velocity field
    this.splineCrossSections = [];

    // flag to improve performance
    this.dirty = true;
  }

  /**
   * reset the pipe
   * @public
   */
  reset() {
    for (let i = 0; i < this.top.length; i++) {
      this.top[i].reset();
      this.bottom[i].reset();
    }
    this.dirty = true;
    this.flowRateProperty.reset();
    this.frictionProperty.reset();
    this.rightPipeYPositionProperty.reset();
    this.leftPipeYPositionProperty.reset();
    this.leftPipeMainHandleYPositionProperty.reset();
    this.rightPipeMainHandleYPositionProperty.reset();
    this.leftPipeScaleProperty.reset();
    this.rightPipeScaleProperty.reset();
    this.leftPipeTopHandleYProperty.reset();
    this.leftPipeBottomHandleYProperty.reset();
    this.rightPipeTopHandleYProperty.reset();
    this.rightPipeBottomHandleYProperty.reset();
  }

  /**
   * Interpolates the pipe control points to obtain a smooth set of cross sections
   * @returns {Array.<PipeCrossSection>} array of interpolated cross-sections
   * @private
   */
  spline() {
    const spline = []; // array to hold the pipe cross sections

    // allocate fixed size arrays for holding pipe control points' x,y values. These are used for computing the splines.
    const numCrossSections = this.top.length;
    const u = new Array(numCrossSections);
    const xBottom = new Array(numCrossSections);
    const yBottom = new Array(numCrossSections);
    const xTop = new Array(numCrossSections);
    const yTop = new Array(numCrossSections);

    // compute the spline for the pipe top line
    for (let i = 0; i < this.top.length; i++) {
      u[i] = i / this.top.length;
      xTop[i] = this.top[i].positionProperty.value.x;
      yTop[i] = this.top[i].positionProperty.value.y;
    }
    const xSplineTop = numeric.spline(u, xTop);
    const ySplineTop = numeric.spline(u, yTop);

    // compute the spline for the pipe bottom line
    for (let i = 0; i < this.bottom.length; i++) {
      u[i] = i / this.bottom.length;
      xBottom[i] = this.bottom[i].positionProperty.value.x;
      yBottom[i] = this.bottom[i].positionProperty.value.y;
    }
    const xSplineBottom = numeric.spline(u, xBottom);
    const ySplineBottom = numeric.spline(u, yBottom);

    // for line smoothness
    const lastPt = (this.top.length - 1) / this.top.length;
    const linSpace = numeric.linspace(0, lastPt, 20 * (this.top.length - 1));

    // compute points
    const xPointsBottom = SplineEvaluation.atArray(xSplineBottom, linSpace);
    const yPointsBottom = SplineEvaluation.atArray(ySplineBottom, linSpace);
    const xPointsTop = SplineEvaluation.atArray(xSplineTop, linSpace);
    const yPointsTop = SplineEvaluation.atArray(ySplineTop, linSpace);

    // Use spline points to build the intermediate pipe cross-sections.
    // Note: the number of cross-sections to use can be reduced (ex: alpha += 3) to get better performance
    for (let alpha = 0; alpha < xPointsTop.length; alpha += 3) {
      const topPointX = xPointsTop[alpha];
      const bottomPointX = xPointsBottom[alpha];
      let topPointY = yPointsTop[alpha];
      let bottomPointY = yPointsBottom[alpha];

      //make sure pipe top doesn't go below pipe bottom
      //Note that when the velocity becomes too high, Bernoulli's equation gives a negative pressure.
      //The pressure doesn't really go negative then, it just means Bernoulli's equation is inapplicable in that situation
      //So we have to make sure the distance threshold is high enough that Bernoulli's equation never gives a negative pressure

      const min = CROSS_SECTION_MIN_HEIGHT; // maintaining a minimum pipe cross section of dia 1;
      if (topPointY - bottomPointY < min) {
        const center = (topPointY + bottomPointY) / 2;
        topPointY = center + min / 2;
        bottomPointY = center - min / 2;
      }
      spline.push(new PipeCrossSection((topPointX + bottomPointX) / 2, bottomPointY, topPointY));
    }
    return spline;
  }

  /**
   * Gets all the pipe cross-sections, rebuilding the intermediate interpolated ones if necessary
   * @public
   */
  getSplineCrossSections() {
    // if pipe shape changes create the new cross sections else return old cross sections
    if (this.dirty) {
      this.splineCrossSections = this.spline();
      this.dirty = false;
    }
    return this.splineCrossSections;
  }

  /**
   * return the xPosition of the right most control point
   * @public
   */
  getMaxX() {
    return this.top[this.top.length - 1].positionProperty.value.x;
  }

  /**
   * return the xPosition of the left most control point
   * @public
   */
  getMinX() {
    return this.top[0].positionProperty.value.x;
  }

  /**
   * Given a global y-position, determine the fraction to the top (point at bottom = 0, point halfway up = 0.5, etc.)
   * @param {number} x - position in meters
   * @param {number} y - position in meters
   * @returns {number} fraction
   * @private
   */
  getFractionToTop(x, y) {
    const position = this.getCrossSection(x);
    return Utils.linear(position.yBottom, position.yTop, 0, 1, y);
  }

  /**
   * Determines the cross section for a given x-coordinate by linear interpolation between the nearest nonlinear samples.
   * @param {number} x - position in meters
   * @returns {PipeCrossSection} cross section of pipe
   * @private
   */
  getCrossSection(x) {
    const previous = this.getPipePositionBefore(x);
    const next = this.getPipePositionAfter(x);
    const top = Utils.linear(previous.x, next.x, previous.yTop, next.yTop, x);
    const bottom = Utils.linear(previous.x, next.x, previous.yBottom, next.yBottom, x);
    return new PipeCrossSection(x, bottom, top); //return pipe cross section
  }

  /**
   * Lookup the cross section immediately before the specified x-position for interpolation
   * @param {number} x - position in meters
   * @returns {PipeCrossSection|null} if one exists
   * @private
   */
  getPipePositionBefore(x) {
    const crossSections = this.getCrossSections();

    // the crossSections are sorted in ascending x.
    let pipeCrossSection;
    for (let i = crossSections.length - 1; i >= 0; i--) {
      pipeCrossSection = crossSections[i];
      if (pipeCrossSection.getX() < x) {
        return pipeCrossSection;
      }
    }
    return null;
  }

  /**
   * @private
   */
  getCrossSections() {
    return this.getSplineCrossSections();
  }

  /**
   * Lookup the cross section immediately after the specified x-position for interpolation
   * @param {number} x - position in meters
   * @returns {PipeCrossSection|null} if one exists
   * @private
   */
  getPipePositionAfter(x) {
    const crossSections = this.getCrossSections();

    // the crossSections are sorted in ascending x.
    let pipeCrossSection;
    for (let i = 0; i < crossSections.length; i++) {
      pipeCrossSection = crossSections[i];
      if (pipeCrossSection.getX() > x) {
        return pipeCrossSection;
      }
    }
    return null;
  }

  /**
   * Get the speed at the specified x-position in m/s.  This is before friction and vertical effects are accounted for.
   * @param { Number } x - position in meters
   * @returns {number} speed of fluid flow at given x position
   * @private
   */
  getSpeed(x) {
    //Continuity equation: a1*v1 = a2*v2
    //treat pipes as if they are cylindrical cross sections
    const crossSectionDiameter = this.getCrossSection(x).getHeight();
    const crossSectionRadius = crossSectionDiameter / 2;
    const crossSectionArea = Math.PI * crossSectionRadius * crossSectionRadius;

    // use rate of fluid flow in volume (m^3) per second
    return this.flowRateProperty.value / 1000 / crossSectionArea;
  }

  /**
   * I was told that the fluid flow rate falls off quadratically, so use lagrange interpolation so that at the center of the pipe
   * the velocity is full speed, and it falls off quadratically toward the sides.
   * See http://stackoverflow.com/questions/2075013/best-way-to-find-quadratic-regression-curve-in-java
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number} x
   * @returns {number}
   * @private
   */
  lagrange(x1, y1, x2, y2, x3, y3, x) {
    return (x - x2) * (x - x3) / (x1 - x2) / (x1 - x3) * y1 + (x - x1) * (x - x3) / (x2 - x1) / (x2 - x3) * y2 + (x - x1) * (x - x2) / (x3 - x1) / (x3 - x2) * y3;
  }

  /**
   * Get the velocity at the specified point, does not account for vertical effects or friction.
   * @param {number} x - position in meters
   * @param {number} y - position in meters
   * @returns {Vector2} velocity at x,y in metric units.
   * @public
   */
  getVelocity(x, y) {
    const fraction = this.getFractionToTop(x, y);
    const speed = this.getSpeed(x);
    const pre = this.getCrossSection(x - 1E-7); // pipe cross section
    const post = this.getCrossSection(x + 1E-7); // pipe cross section

    const x0 = pre.getX();
    const y0 = Utils.linear(0, 1, pre.yBottom, pre.yTop, fraction);
    const x1 = post.getX();
    const y1 = Utils.linear(0, 1, post.yBottom, post.yTop, fraction);
    const velocity = new Vector2(x1 - x0, y1 - y0);
    return velocity.setMagnitude(speed);
  }

  /**
   * Gets the x-velocity of a particle, incorporating vertical effects.
   * If this effect is ignored, then when there is a large slope in the pipe, particles closer to the edge move much faster (which is physically incorrect).
   * @param {number} x - position in meters
   * @param {number} y - position in meters
   * @returns {number} the tweaked x-velocity
   * @public
   */
  getTweakedVx(x, y) {
    const fraction = this.getFractionToTop(x, y);
    const speed = this.getSpeed(x);
    const pre = this.getCrossSection(x - 1E-7); // pipe cross section
    const post = this.getCrossSection(x + 1E-7); // pipe cross section

    const x0 = pre.getX();
    const y0 = Utils.linear(0, 1, pre.yBottom, pre.yTop, fraction);
    const x1 = post.getX();
    const y1 = Utils.linear(0, 1, post.yBottom, post.yTop, fraction);
    const deltaX = x1 - x0;
    const deltaY = y1 - y0;
    const vx = deltaX / Math.sqrt(deltaX * deltaX + deltaY * deltaY) * speed;

    // If friction is enabled, then scale down quadratically (like a parabola) as you get further from the center of the pipe.
    // But instead of reaching zero velocity at the edge of the pipe (which could cause particles to pile up indefinitely), extend the region
    // a small epsilon past the (0..1) pipe range
    if (this.frictionProperty.value) {
      const epsilon = 0.2;
      const fractionToTop = this.getFractionToTop(x, y);
      const scaleFactor = this.lagrange(-epsilon, 0, 0.5, 1, 1 + epsilon, 0, fractionToTop);
      return vx * scaleFactor;
    } else {
      return vx;
    }
  }

  /**
   * @param {number} x - position in meters
   * @param {number} y - position in meters
   * @returns {Vector2} the velocity vector at the given point
   * @public
   */
  getTweakedVelocity(x, y) {
    return new Vector2(this.getTweakedVx(x, y), this.getVelocity(x, y).y);
  }

  /**
   * Find the y-value for the specified x-value and fraction (0=bottom, 1=top) of the pipe
   * @param {number} x - position in meters
   * @param {number} fraction - is in (0,1) (0=bottom, 1=top)
   * @returns {number}
   * @public
   */
  fractionToPosition(x, fraction) {
    const position = this.getCrossSection(x);
    return Utils.linear(0, 1, position.yBottom, position.yTop, fraction);
  }

  /**
   * Get the point at the specified position
   * @param {number} x position  is in meters
   * @param {number} fractionToTop is in (0,1)
   * @returns {Vector2} the position vector of the point
   * @public
   */
  getPoint(x, fractionToTop) {
    return new Vector2(x, this.fractionToPosition(x, fractionToTop));
  }

  /**
   * Compute the circular cross sectional area (in meters squared) at the specified position
   * @param {number} x - position in meters
   * @returns {number} area of cross section at x in square meters
   * @public
   */
  getCrossSectionalArea(x) {
    const radius = Math.abs(this.getPoint(x, 0.5).y - this.getPoint(x, 1).y);
    return Math.PI * radius * radius;
  }
}
fluidPressureAndFlow.register('Pipe', Pipe);
export default Pipe;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlV0aWxzIiwiVmVjdG9yMiIsImZsdWlkUHJlc3N1cmVBbmRGbG93IiwiUGlwZUNvbnRyb2xQb2ludCIsIlBpcGVDcm9zc1NlY3Rpb24iLCJTcGxpbmVFdmFsdWF0aW9uIiwiQ1JPU1NfU0VDVElPTl9NSU5fSEVJR0hUIiwiVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZIiwiQk9UVE9NX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZIiwiUElQRV9JTklUSUFMX1NDQUxFIiwiUElQRV9JTklUSUFMX1kiLCJUT1BfSEFORExFX0lOSVRJQUxfWSIsIkJPVFRPTV9IQU5ETEVfSU5JVElBTF9ZIiwiQ09OVFJPTF9QT0lOVF9YX1NQQUNJTkciLCJMQVNUX0NPTlRST0xfUE9JTlRfT0ZGU0VUIiwiRFVNTVlfQ09OVFJPTF9QT0lOVF9PRkZTRVQiLCJQaXBlIiwiY29uc3RydWN0b3IiLCJtYWluSGFuZGxlSW5pdGlhbFkiLCJmbG93UmF0ZVByb3BlcnR5IiwiZnJpY3Rpb25Qcm9wZXJ0eSIsInJpZ2h0UGlwZVlQb3NpdGlvblByb3BlcnR5IiwibGVmdFBpcGVZUG9zaXRpb25Qcm9wZXJ0eSIsImxlZnRQaXBlTWFpbkhhbmRsZVlQb3NpdGlvblByb3BlcnR5IiwicmlnaHRQaXBlTWFpbkhhbmRsZVlQb3NpdGlvblByb3BlcnR5IiwibGVmdFBpcGVTY2FsZVByb3BlcnR5IiwicmlnaHRQaXBlU2NhbGVQcm9wZXJ0eSIsImxlZnRQaXBlVG9wSGFuZGxlWVByb3BlcnR5IiwibGVmdFBpcGVCb3R0b21IYW5kbGVZUHJvcGVydHkiLCJyaWdodFBpcGVUb3BIYW5kbGVZUHJvcGVydHkiLCJyaWdodFBpcGVCb3R0b21IYW5kbGVZUHJvcGVydHkiLCJjb250cm9sQ3Jvc3NTZWN0aW9ucyIsInRvcCIsImJvdHRvbSIsImkiLCJsZW5ndGgiLCJwdXNoIiwieCIsInlUb3AiLCJ5Qm90dG9tIiwic3BsaW5lQ3Jvc3NTZWN0aW9ucyIsImRpcnR5IiwicmVzZXQiLCJzcGxpbmUiLCJudW1Dcm9zc1NlY3Rpb25zIiwidSIsIkFycmF5IiwieEJvdHRvbSIsInhUb3AiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJ5IiwieFNwbGluZVRvcCIsIm51bWVyaWMiLCJ5U3BsaW5lVG9wIiwieFNwbGluZUJvdHRvbSIsInlTcGxpbmVCb3R0b20iLCJsYXN0UHQiLCJsaW5TcGFjZSIsImxpbnNwYWNlIiwieFBvaW50c0JvdHRvbSIsImF0QXJyYXkiLCJ5UG9pbnRzQm90dG9tIiwieFBvaW50c1RvcCIsInlQb2ludHNUb3AiLCJhbHBoYSIsInRvcFBvaW50WCIsImJvdHRvbVBvaW50WCIsInRvcFBvaW50WSIsImJvdHRvbVBvaW50WSIsIm1pbiIsImNlbnRlciIsImdldFNwbGluZUNyb3NzU2VjdGlvbnMiLCJnZXRNYXhYIiwiZ2V0TWluWCIsImdldEZyYWN0aW9uVG9Ub3AiLCJwb3NpdGlvbiIsImdldENyb3NzU2VjdGlvbiIsImxpbmVhciIsInByZXZpb3VzIiwiZ2V0UGlwZVBvc2l0aW9uQmVmb3JlIiwibmV4dCIsImdldFBpcGVQb3NpdGlvbkFmdGVyIiwiY3Jvc3NTZWN0aW9ucyIsImdldENyb3NzU2VjdGlvbnMiLCJwaXBlQ3Jvc3NTZWN0aW9uIiwiZ2V0WCIsImdldFNwZWVkIiwiY3Jvc3NTZWN0aW9uRGlhbWV0ZXIiLCJnZXRIZWlnaHQiLCJjcm9zc1NlY3Rpb25SYWRpdXMiLCJjcm9zc1NlY3Rpb25BcmVhIiwiTWF0aCIsIlBJIiwibGFncmFuZ2UiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIngzIiwieTMiLCJnZXRWZWxvY2l0eSIsImZyYWN0aW9uIiwic3BlZWQiLCJwcmUiLCJwb3N0IiwieDAiLCJ5MCIsInZlbG9jaXR5Iiwic2V0TWFnbml0dWRlIiwiZ2V0VHdlYWtlZFZ4IiwiZGVsdGFYIiwiZGVsdGFZIiwidngiLCJzcXJ0IiwiZXBzaWxvbiIsImZyYWN0aW9uVG9Ub3AiLCJzY2FsZUZhY3RvciIsImdldFR3ZWFrZWRWZWxvY2l0eSIsImZyYWN0aW9uVG9Qb3NpdGlvbiIsImdldFBvaW50IiwiZ2V0Q3Jvc3NTZWN0aW9uYWxBcmVhIiwicmFkaXVzIiwiYWJzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQaXBlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciBhIGZsZXhpYmxlIGN5bGluZHJpY2FsIHBpcGUgd2hpY2ggY2FuIGJlIG1vZGlmaWVkIHVzaW5nIGEgZml4ZWQgbnVtYmVyIG9mIGNvbnRyb2wgcG9pbnRzLlxyXG4gKiBBbHNvIG1vZGVscyB0aGUgZmxvdyBvZiBwYXJ0aWNsZXMgaW4gdGhlIHBpcGUgKHdpdGggYW5kIHdpdGhvdXQgZnJpY3Rpb24pLlxyXG4gKiBBbGwgdW5pdHMgYXJlIGluIG1ldHJpYyB1bmxlc3Mgb3RoZXJ3aXNlIG1lbnRpb25lZC5cclxuICpcclxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsIENvbmNlcHRzKS5cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBmbHVpZFByZXNzdXJlQW5kRmxvdyBmcm9tICcuLi8uLi9mbHVpZFByZXNzdXJlQW5kRmxvdy5qcyc7XHJcbmltcG9ydCBQaXBlQ29udHJvbFBvaW50IGZyb20gJy4vUGlwZUNvbnRyb2xQb2ludC5qcyc7XHJcbmltcG9ydCBQaXBlQ3Jvc3NTZWN0aW9uIGZyb20gJy4vUGlwZUNyb3NzU2VjdGlvbi5qcyc7XHJcbmltcG9ydCBTcGxpbmVFdmFsdWF0aW9uIGZyb20gJy4vU3BsaW5lRXZhbHVhdGlvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQ1JPU1NfU0VDVElPTl9NSU5fSEVJR0hUID0gMTsgLy9tXHJcbmNvbnN0IFRPUF9DT05UUk9MX1BPSU5UX0lOSVRJQUxfWSA9IC0zLjU7IC8vbVxyXG5jb25zdCBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgPSAtMS40OyAvL21cclxuY29uc3QgUElQRV9JTklUSUFMX1NDQUxFID0gMC4zNjtcclxuXHJcbmNvbnN0IFBJUEVfSU5JVElBTF9ZID0gMTk3OyAvL2Zyb20gc2NyZWVuIHRvcCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbmNvbnN0IFRPUF9IQU5ETEVfSU5JVElBTF9ZID0gUElQRV9JTklUSUFMX1kgKyAyOyAvL2Zyb20gc2NyZWVuIHRvcCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbmNvbnN0IEJPVFRPTV9IQU5ETEVfSU5JVElBTF9ZID0gMzI0OyAvL2Zyb20gc2NyZWVuIHRvcCBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcblxyXG5jb25zdCBDT05UUk9MX1BPSU5UX1hfU1BBQ0lORyA9IDIuMzsgLy9tXHJcbmNvbnN0IExBU1RfQ09OVFJPTF9QT0lOVF9PRkZTRVQgPSAwLjI7IC8vbVxyXG5jb25zdCBEVU1NWV9DT05UUk9MX1BPSU5UX09GRlNFVCA9IDAuMTsgLy9tXHJcblxyXG5jbGFzcyBQaXBlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBjb25zdCBtYWluSGFuZGxlSW5pdGlhbFkgPSAoIFRPUF9IQU5ETEVfSU5JVElBTF9ZICsgQk9UVE9NX0hBTkRMRV9JTklUSUFMX1kgKSAvIDI7XHJcblxyXG4gICAgdGhpcy5mbG93UmF0ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCA1MDAwICk7IC8vIHJhdGUgb2YgZmx1aWQgZmxvdyBpbiBMaXRlciBwZXIgc2Vjb25kIChML3MpXHJcbiAgICB0aGlzLmZyaWN0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7IC8vIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIGZyaWN0aW9uIHNob3VsZCBzbG93IHBhcnRpY2xlcyBuZWFyIHRoZSBlZGdlc1xyXG4gICAgdGhpcy5yaWdodFBpcGVZUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggUElQRV9JTklUSUFMX1kgKTsgLy90cmFja3MgdGhlIHJpZ2h0IHBpcGUncyB2ZXJ0aWNhbCBwb3NpdGlvbiBpbiBwaXhlbFxyXG4gICAgdGhpcy5sZWZ0UGlwZVlQb3NpdGlvblByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBQSVBFX0lOSVRJQUxfWSApO1xyXG4gICAgdGhpcy5sZWZ0UGlwZU1haW5IYW5kbGVZUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbWFpbkhhbmRsZUluaXRpYWxZICk7XHJcbiAgICB0aGlzLnJpZ2h0UGlwZU1haW5IYW5kbGVZUG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbWFpbkhhbmRsZUluaXRpYWxZICk7XHJcbiAgICB0aGlzLmxlZnRQaXBlU2NhbGVQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggUElQRV9JTklUSUFMX1NDQUxFICk7XHJcbiAgICB0aGlzLnJpZ2h0UGlwZVNjYWxlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFBJUEVfSU5JVElBTF9TQ0FMRSApO1xyXG4gICAgdGhpcy5sZWZ0UGlwZVRvcEhhbmRsZVlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggVE9QX0hBTkRMRV9JTklUSUFMX1kgKTtcclxuICAgIHRoaXMubGVmdFBpcGVCb3R0b21IYW5kbGVZUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIEJPVFRPTV9IQU5ETEVfSU5JVElBTF9ZICk7XHJcbiAgICB0aGlzLnJpZ2h0UGlwZVRvcEhhbmRsZVlQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggVE9QX0hBTkRMRV9JTklUSUFMX1kgKTtcclxuICAgIHRoaXMucmlnaHRQaXBlQm90dG9tSGFuZGxlWVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBCT1RUT01fSEFORExFX0lOSVRJQUxfWSApO1xyXG5cclxuICAgIC8vIGNyb3NzLXNlY3Rpb25zIHRoYXQgdGhlIHVzZXIgY2FuIG1hbmlwdWxhdGUgdG8gZGVmb3JtIHRoZSBwaXBlLlxyXG4gICAgY29uc3QgY29udHJvbENyb3NzU2VjdGlvbnMgPSBbXHJcbiAgICAgIC8vZHVtbXkgY3Jvc3Mgc2VjdGlvbiwgbm90IHBhcnQgb2YgdGhlIHBpcGUgZmxvdyBsaW5lIHNoYXBlLiBUaGlzIGlzIHdoZXJlIHRoZSBwYXJ0aWNsZXMgb3JpZ2luYXRlLlxyXG4gICAgICBuZXcgUGlwZUNyb3NzU2VjdGlvbiggLSggMyAqIENPTlRST0xfUE9JTlRfWF9TUEFDSU5HIC0gRFVNTVlfQ09OVFJPTF9QT0lOVF9PRkZTRVQgKSwgVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZLFxyXG4gICAgICAgIEJPVFRPTV9DT05UUk9MX1BPSU5UX0lOSVRJQUxfWSApLFxyXG5cclxuICAgICAgbmV3IFBpcGVDcm9zc1NlY3Rpb24oIC0oIDMgKiBDT05UUk9MX1BPSU5UX1hfU1BBQ0lORyAtIExBU1RfQ09OVFJPTF9QT0lOVF9PRkZTRVQgKSwgVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZLFxyXG4gICAgICAgIEJPVFRPTV9DT05UUk9MX1BPSU5UX0lOSVRJQUxfWSApLFxyXG4gICAgICBuZXcgUGlwZUNyb3NzU2VjdGlvbiggLSggMiAqIENPTlRST0xfUE9JTlRfWF9TUEFDSU5HICksIFRPUF9DT05UUk9MX1BPSU5UX0lOSVRJQUxfWSxcclxuICAgICAgICBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgKSxcclxuICAgICAgbmV3IFBpcGVDcm9zc1NlY3Rpb24oIC1DT05UUk9MX1BPSU5UX1hfU1BBQ0lORywgVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZLCBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgKSxcclxuICAgICAgbmV3IFBpcGVDcm9zc1NlY3Rpb24oIDAsIFRPUF9DT05UUk9MX1BPSU5UX0lOSVRJQUxfWSwgQk9UVE9NX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZICksXHJcbiAgICAgIG5ldyBQaXBlQ3Jvc3NTZWN0aW9uKCBDT05UUk9MX1BPSU5UX1hfU1BBQ0lORywgVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZLCBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgKSxcclxuICAgICAgbmV3IFBpcGVDcm9zc1NlY3Rpb24oIDIgKiBDT05UUk9MX1BPSU5UX1hfU1BBQ0lORywgVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZLCBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgKSxcclxuICAgICAgbmV3IFBpcGVDcm9zc1NlY3Rpb24oIDMgKiBDT05UUk9MX1BPSU5UX1hfU1BBQ0lORyAtIExBU1RfQ09OVFJPTF9QT0lOVF9PRkZTRVQsIFRPUF9DT05UUk9MX1BPSU5UX0lOSVRJQUxfWSxcclxuICAgICAgICBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgKSxcclxuXHJcbiAgICAgIC8vZHVtbXkgY3Jvc3Mgc2VjdGlvbiwgbm90IHBhcnQgb2YgdGhlIHBpcGUgZmxvdyBsaW5lIHNoYXBlLiBUaGlzIGlzIHdoZXJlIHRoZSBwYXJ0aWNsZXMgYXJlIHJlbW92ZWQuXHJcbiAgICAgIG5ldyBQaXBlQ3Jvc3NTZWN0aW9uKCAzICogQ09OVFJPTF9QT0lOVF9YX1NQQUNJTkcgLSBEVU1NWV9DT05UUk9MX1BPSU5UX09GRlNFVCwgVE9QX0NPTlRST0xfUE9JTlRfSU5JVElBTF9ZLCBCT1RUT01fQ09OVFJPTF9QT0lOVF9JTklUSUFMX1kgKVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnRvcCA9IFtdOyAvLyBhcnJheSB0byBzdG9yZSB0b3AgY29udHJvbCBwb2ludHNcclxuICAgIHRoaXMuYm90dG9tID0gW107IC8vIGFycmF5IHRvIHN0b3JlIGJvdHRvbSBjb250cm9sIHBvaW50c1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY29udHJvbENyb3NzU2VjdGlvbnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMudG9wLnB1c2goIG5ldyBQaXBlQ29udHJvbFBvaW50KCBjb250cm9sQ3Jvc3NTZWN0aW9uc1sgaSBdLngsIGNvbnRyb2xDcm9zc1NlY3Rpb25zWyBpIF0ueVRvcCApICk7XHJcbiAgICAgIHRoaXMuYm90dG9tLnB1c2goIG5ldyBQaXBlQ29udHJvbFBvaW50KCBjb250cm9sQ3Jvc3NTZWN0aW9uc1sgaSBdLngsIGNvbnRyb2xDcm9zc1NlY3Rpb25zWyBpIF0ueUJvdHRvbSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm9ubGluZWFyIGludGVycG9sYXRpb24gb2YgdGhlIGNvbnRyb2wgc2VjdGlvbnMgZm9yIHBhcnRpY2xlIG1vdGlvbiBhbmQgZGV0ZXJtaW5pbmcgdGhlIHZlbG9jaXR5IGZpZWxkXHJcbiAgICB0aGlzLnNwbGluZUNyb3NzU2VjdGlvbnMgPSBbXTtcclxuXHJcbiAgICAvLyBmbGFnIHRvIGltcHJvdmUgcGVyZm9ybWFuY2VcclxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xyXG5cclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiByZXNldCB0aGUgcGlwZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRvcC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy50b3BbIGkgXS5yZXNldCgpO1xyXG4gICAgICB0aGlzLmJvdHRvbVsgaSBdLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmZsb3dSYXRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5yaWdodFBpcGVZUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5sZWZ0UGlwZVlQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmxlZnRQaXBlTWFpbkhhbmRsZVlQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnJpZ2h0UGlwZU1haW5IYW5kbGVZUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5sZWZ0UGlwZVNjYWxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmlnaHRQaXBlU2NhbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5sZWZ0UGlwZVRvcEhhbmRsZVlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5sZWZ0UGlwZUJvdHRvbUhhbmRsZVlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5yaWdodFBpcGVUb3BIYW5kbGVZUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmlnaHRQaXBlQm90dG9tSGFuZGxlWVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnRlcnBvbGF0ZXMgdGhlIHBpcGUgY29udHJvbCBwb2ludHMgdG8gb2J0YWluIGEgc21vb3RoIHNldCBvZiBjcm9zcyBzZWN0aW9uc1xyXG4gICAqIEByZXR1cm5zIHtBcnJheS48UGlwZUNyb3NzU2VjdGlvbj59IGFycmF5IG9mIGludGVycG9sYXRlZCBjcm9zcy1zZWN0aW9uc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc3BsaW5lKCkge1xyXG4gICAgY29uc3Qgc3BsaW5lID0gW107Ly8gYXJyYXkgdG8gaG9sZCB0aGUgcGlwZSBjcm9zcyBzZWN0aW9uc1xyXG5cclxuICAgIC8vIGFsbG9jYXRlIGZpeGVkIHNpemUgYXJyYXlzIGZvciBob2xkaW5nIHBpcGUgY29udHJvbCBwb2ludHMnIHgseSB2YWx1ZXMuIFRoZXNlIGFyZSB1c2VkIGZvciBjb21wdXRpbmcgdGhlIHNwbGluZXMuXHJcbiAgICBjb25zdCBudW1Dcm9zc1NlY3Rpb25zID0gdGhpcy50b3AubGVuZ3RoO1xyXG5cclxuICAgIGNvbnN0IHUgPSBuZXcgQXJyYXkoIG51bUNyb3NzU2VjdGlvbnMgKTtcclxuICAgIGNvbnN0IHhCb3R0b20gPSBuZXcgQXJyYXkoIG51bUNyb3NzU2VjdGlvbnMgKTtcclxuICAgIGNvbnN0IHlCb3R0b20gPSBuZXcgQXJyYXkoIG51bUNyb3NzU2VjdGlvbnMgKTtcclxuICAgIGNvbnN0IHhUb3AgPSBuZXcgQXJyYXkoIG51bUNyb3NzU2VjdGlvbnMgKTtcclxuICAgIGNvbnN0IHlUb3AgPSBuZXcgQXJyYXkoIG51bUNyb3NzU2VjdGlvbnMgKTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHRoZSBzcGxpbmUgZm9yIHRoZSBwaXBlIHRvcCBsaW5lXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRvcC5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdVsgaSBdID0gaSAvIHRoaXMudG9wLmxlbmd0aDtcclxuICAgICAgeFRvcFsgaSBdID0gdGhpcy50b3BbIGkgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICAgIHlUb3BbIGkgXSA9IHRoaXMudG9wWyBpIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgfVxyXG4gICAgY29uc3QgeFNwbGluZVRvcCA9IG51bWVyaWMuc3BsaW5lKCB1LCB4VG9wICk7XHJcbiAgICBjb25zdCB5U3BsaW5lVG9wID0gbnVtZXJpYy5zcGxpbmUoIHUsIHlUb3AgKTtcclxuXHJcbiAgICAvLyBjb21wdXRlIHRoZSBzcGxpbmUgZm9yIHRoZSBwaXBlIGJvdHRvbSBsaW5lXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmJvdHRvbS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdVsgaSBdID0gaSAvIHRoaXMuYm90dG9tLmxlbmd0aDtcclxuICAgICAgeEJvdHRvbVsgaSBdID0gdGhpcy5ib3R0b21bIGkgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgICAgIHlCb3R0b21bIGkgXSA9IHRoaXMuYm90dG9tWyBpIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgfVxyXG4gICAgY29uc3QgeFNwbGluZUJvdHRvbSA9IG51bWVyaWMuc3BsaW5lKCB1LCB4Qm90dG9tICk7XHJcbiAgICBjb25zdCB5U3BsaW5lQm90dG9tID0gbnVtZXJpYy5zcGxpbmUoIHUsIHlCb3R0b20gKTtcclxuXHJcbiAgICAvLyBmb3IgbGluZSBzbW9vdGhuZXNzXHJcbiAgICBjb25zdCBsYXN0UHQgPSAoIHRoaXMudG9wLmxlbmd0aCAtIDEgKSAvIHRoaXMudG9wLmxlbmd0aDtcclxuICAgIGNvbnN0IGxpblNwYWNlID0gbnVtZXJpYy5saW5zcGFjZSggMCwgbGFzdFB0LCAyMCAqICggdGhpcy50b3AubGVuZ3RoIC0gMSApICk7XHJcblxyXG4gICAgLy8gY29tcHV0ZSBwb2ludHNcclxuICAgIGNvbnN0IHhQb2ludHNCb3R0b20gPSBTcGxpbmVFdmFsdWF0aW9uLmF0QXJyYXkoIHhTcGxpbmVCb3R0b20sIGxpblNwYWNlICk7XHJcbiAgICBjb25zdCB5UG9pbnRzQm90dG9tID0gU3BsaW5lRXZhbHVhdGlvbi5hdEFycmF5KCB5U3BsaW5lQm90dG9tLCBsaW5TcGFjZSApO1xyXG4gICAgY29uc3QgeFBvaW50c1RvcCA9IFNwbGluZUV2YWx1YXRpb24uYXRBcnJheSggeFNwbGluZVRvcCwgbGluU3BhY2UgKTtcclxuICAgIGNvbnN0IHlQb2ludHNUb3AgPSBTcGxpbmVFdmFsdWF0aW9uLmF0QXJyYXkoIHlTcGxpbmVUb3AsIGxpblNwYWNlICk7XHJcblxyXG4gICAgLy8gVXNlIHNwbGluZSBwb2ludHMgdG8gYnVpbGQgdGhlIGludGVybWVkaWF0ZSBwaXBlIGNyb3NzLXNlY3Rpb25zLlxyXG4gICAgLy8gTm90ZTogdGhlIG51bWJlciBvZiBjcm9zcy1zZWN0aW9ucyB0byB1c2UgY2FuIGJlIHJlZHVjZWQgKGV4OiBhbHBoYSArPSAzKSB0byBnZXQgYmV0dGVyIHBlcmZvcm1hbmNlXHJcbiAgICBmb3IgKCBsZXQgYWxwaGEgPSAwOyBhbHBoYSA8IHhQb2ludHNUb3AubGVuZ3RoOyBhbHBoYSArPSAzICkge1xyXG5cclxuICAgICAgY29uc3QgdG9wUG9pbnRYID0geFBvaW50c1RvcFsgYWxwaGEgXTtcclxuICAgICAgY29uc3QgYm90dG9tUG9pbnRYID0geFBvaW50c0JvdHRvbVsgYWxwaGEgXTtcclxuICAgICAgbGV0IHRvcFBvaW50WSA9IHlQb2ludHNUb3BbIGFscGhhIF07XHJcbiAgICAgIGxldCBib3R0b21Qb2ludFkgPSB5UG9pbnRzQm90dG9tWyBhbHBoYSBdO1xyXG5cclxuICAgICAgLy9tYWtlIHN1cmUgcGlwZSB0b3AgZG9lc24ndCBnbyBiZWxvdyBwaXBlIGJvdHRvbVxyXG4gICAgICAvL05vdGUgdGhhdCB3aGVuIHRoZSB2ZWxvY2l0eSBiZWNvbWVzIHRvbyBoaWdoLCBCZXJub3VsbGkncyBlcXVhdGlvbiBnaXZlcyBhIG5lZ2F0aXZlIHByZXNzdXJlLlxyXG4gICAgICAvL1RoZSBwcmVzc3VyZSBkb2Vzbid0IHJlYWxseSBnbyBuZWdhdGl2ZSB0aGVuLCBpdCBqdXN0IG1lYW5zIEJlcm5vdWxsaSdzIGVxdWF0aW9uIGlzIGluYXBwbGljYWJsZSBpbiB0aGF0IHNpdHVhdGlvblxyXG4gICAgICAvL1NvIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoZSBkaXN0YW5jZSB0aHJlc2hvbGQgaXMgaGlnaCBlbm91Z2ggdGhhdCBCZXJub3VsbGkncyBlcXVhdGlvbiBuZXZlciBnaXZlcyBhIG5lZ2F0aXZlIHByZXNzdXJlXHJcblxyXG4gICAgICBjb25zdCBtaW4gPSBDUk9TU19TRUNUSU9OX01JTl9IRUlHSFQ7Ly8gbWFpbnRhaW5pbmcgYSBtaW5pbXVtIHBpcGUgY3Jvc3Mgc2VjdGlvbiBvZiBkaWEgMTtcclxuICAgICAgaWYgKCB0b3BQb2ludFkgLSBib3R0b21Qb2ludFkgPCBtaW4gKSB7XHJcbiAgICAgICAgY29uc3QgY2VudGVyID0gKCB0b3BQb2ludFkgKyBib3R0b21Qb2ludFkgKSAvIDI7XHJcbiAgICAgICAgdG9wUG9pbnRZID0gY2VudGVyICsgbWluIC8gMjtcclxuICAgICAgICBib3R0b21Qb2ludFkgPSBjZW50ZXIgLSBtaW4gLyAyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzcGxpbmUucHVzaCggbmV3IFBpcGVDcm9zc1NlY3Rpb24oICggdG9wUG9pbnRYICsgYm90dG9tUG9pbnRYICkgLyAyLCBib3R0b21Qb2ludFksIHRvcFBvaW50WSApICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3BsaW5lO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhbGwgdGhlIHBpcGUgY3Jvc3Mtc2VjdGlvbnMsIHJlYnVpbGRpbmcgdGhlIGludGVybWVkaWF0ZSBpbnRlcnBvbGF0ZWQgb25lcyBpZiBuZWNlc3NhcnlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0U3BsaW5lQ3Jvc3NTZWN0aW9ucygpIHtcclxuICAgIC8vIGlmIHBpcGUgc2hhcGUgY2hhbmdlcyBjcmVhdGUgdGhlIG5ldyBjcm9zcyBzZWN0aW9ucyBlbHNlIHJldHVybiBvbGQgY3Jvc3Mgc2VjdGlvbnNcclxuICAgIGlmICggdGhpcy5kaXJ0eSApIHtcclxuICAgICAgdGhpcy5zcGxpbmVDcm9zc1NlY3Rpb25zID0gdGhpcy5zcGxpbmUoKTtcclxuICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMuc3BsaW5lQ3Jvc3NTZWN0aW9ucztcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm4gdGhlIHhQb3NpdGlvbiBvZiB0aGUgcmlnaHQgbW9zdCBjb250cm9sIHBvaW50XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldE1heFgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3BbIHRoaXMudG9wLmxlbmd0aCAtIDEgXS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLng7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXR1cm4gdGhlIHhQb3NpdGlvbiBvZiB0aGUgbGVmdCBtb3N0IGNvbnRyb2wgcG9pbnRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWluWCgpIHtcclxuICAgIHJldHVybiB0aGlzLnRvcFsgMCBdLnBvc2l0aW9uUHJvcGVydHkudmFsdWUueDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgZ2xvYmFsIHktcG9zaXRpb24sIGRldGVybWluZSB0aGUgZnJhY3Rpb24gdG8gdGhlIHRvcCAocG9pbnQgYXQgYm90dG9tID0gMCwgcG9pbnQgaGFsZndheSB1cCA9IDAuNSwgZXRjLilcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHBvc2l0aW9uIGluIG1ldGVyc1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHJldHVybnMge251bWJlcn0gZnJhY3Rpb25cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGdldEZyYWN0aW9uVG9Ub3AoIHgsIHkgKSB7XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2V0Q3Jvc3NTZWN0aW9uKCB4ICk7XHJcbiAgICByZXR1cm4gVXRpbHMubGluZWFyKCBwb3NpdGlvbi55Qm90dG9tLCBwb3NpdGlvbi55VG9wLCAwLCAxLCB5ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHRoZSBjcm9zcyBzZWN0aW9uIGZvciBhIGdpdmVuIHgtY29vcmRpbmF0ZSBieSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHRoZSBuZWFyZXN0IG5vbmxpbmVhciBzYW1wbGVzLlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHJldHVybnMge1BpcGVDcm9zc1NlY3Rpb259IGNyb3NzIHNlY3Rpb24gb2YgcGlwZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Q3Jvc3NTZWN0aW9uKCB4ICkge1xyXG4gICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLmdldFBpcGVQb3NpdGlvbkJlZm9yZSggeCApO1xyXG4gICAgY29uc3QgbmV4dCA9IHRoaXMuZ2V0UGlwZVBvc2l0aW9uQWZ0ZXIoIHggKTtcclxuICAgIGNvbnN0IHRvcCA9IFV0aWxzLmxpbmVhciggcHJldmlvdXMueCwgbmV4dC54LCBwcmV2aW91cy55VG9wLCBuZXh0LnlUb3AsIHggKTtcclxuICAgIGNvbnN0IGJvdHRvbSA9IFV0aWxzLmxpbmVhciggcHJldmlvdXMueCwgbmV4dC54LCBwcmV2aW91cy55Qm90dG9tLCBuZXh0LnlCb3R0b20sIHggKTtcclxuICAgIHJldHVybiBuZXcgUGlwZUNyb3NzU2VjdGlvbiggeCwgYm90dG9tLCB0b3AgKTsgLy9yZXR1cm4gcGlwZSBjcm9zcyBzZWN0aW9uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMb29rdXAgdGhlIGNyb3NzIHNlY3Rpb24gaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBzcGVjaWZpZWQgeC1wb3NpdGlvbiBmb3IgaW50ZXJwb2xhdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHJldHVybnMge1BpcGVDcm9zc1NlY3Rpb258bnVsbH0gaWYgb25lIGV4aXN0c1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0UGlwZVBvc2l0aW9uQmVmb3JlKCB4ICkge1xyXG4gICAgY29uc3QgY3Jvc3NTZWN0aW9ucyA9IHRoaXMuZ2V0Q3Jvc3NTZWN0aW9ucygpO1xyXG5cclxuICAgIC8vIHRoZSBjcm9zc1NlY3Rpb25zIGFyZSBzb3J0ZWQgaW4gYXNjZW5kaW5nIHguXHJcbiAgICBsZXQgcGlwZUNyb3NzU2VjdGlvbjtcclxuICAgIGZvciAoIGxldCBpID0gY3Jvc3NTZWN0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgcGlwZUNyb3NzU2VjdGlvbiA9IGNyb3NzU2VjdGlvbnNbIGkgXTtcclxuICAgICAgaWYgKCBwaXBlQ3Jvc3NTZWN0aW9uLmdldFgoKSA8IHggKSB7XHJcbiAgICAgICAgcmV0dXJuIHBpcGVDcm9zc1NlY3Rpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRDcm9zc1NlY3Rpb25zKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0U3BsaW5lQ3Jvc3NTZWN0aW9ucygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTG9va3VwIHRoZSBjcm9zcyBzZWN0aW9uIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBzcGVjaWZpZWQgeC1wb3NpdGlvbiBmb3IgaW50ZXJwb2xhdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHJldHVybnMge1BpcGVDcm9zc1NlY3Rpb258bnVsbH0gaWYgb25lIGV4aXN0c1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0UGlwZVBvc2l0aW9uQWZ0ZXIoIHggKSB7XHJcbiAgICBjb25zdCBjcm9zc1NlY3Rpb25zID0gdGhpcy5nZXRDcm9zc1NlY3Rpb25zKCk7XHJcblxyXG4gICAgLy8gdGhlIGNyb3NzU2VjdGlvbnMgYXJlIHNvcnRlZCBpbiBhc2NlbmRpbmcgeC5cclxuICAgIGxldCBwaXBlQ3Jvc3NTZWN0aW9uO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY3Jvc3NTZWN0aW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgcGlwZUNyb3NzU2VjdGlvbiA9IGNyb3NzU2VjdGlvbnNbIGkgXTtcclxuICAgICAgaWYgKCBwaXBlQ3Jvc3NTZWN0aW9uLmdldFgoKSA+IHggKSB7XHJcbiAgICAgICAgcmV0dXJuIHBpcGVDcm9zc1NlY3Rpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBzcGVlZCBhdCB0aGUgc3BlY2lmaWVkIHgtcG9zaXRpb24gaW4gbS9zLiAgVGhpcyBpcyBiZWZvcmUgZnJpY3Rpb24gYW5kIHZlcnRpY2FsIGVmZmVjdHMgYXJlIGFjY291bnRlZCBmb3IuXHJcbiAgICogQHBhcmFtIHsgTnVtYmVyIH0geCAtIHBvc2l0aW9uIGluIG1ldGVyc1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHNwZWVkIG9mIGZsdWlkIGZsb3cgYXQgZ2l2ZW4geCBwb3NpdGlvblxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0U3BlZWQoIHggKSB7XHJcblxyXG4gICAgLy9Db250aW51aXR5IGVxdWF0aW9uOiBhMSp2MSA9IGEyKnYyXHJcbiAgICAvL3RyZWF0IHBpcGVzIGFzIGlmIHRoZXkgYXJlIGN5bGluZHJpY2FsIGNyb3NzIHNlY3Rpb25zXHJcbiAgICBjb25zdCBjcm9zc1NlY3Rpb25EaWFtZXRlciA9IHRoaXMuZ2V0Q3Jvc3NTZWN0aW9uKCB4ICkuZ2V0SGVpZ2h0KCk7XHJcbiAgICBjb25zdCBjcm9zc1NlY3Rpb25SYWRpdXMgPSBjcm9zc1NlY3Rpb25EaWFtZXRlciAvIDI7XHJcbiAgICBjb25zdCBjcm9zc1NlY3Rpb25BcmVhID0gTWF0aC5QSSAqIGNyb3NzU2VjdGlvblJhZGl1cyAqIGNyb3NzU2VjdGlvblJhZGl1cztcclxuXHJcbiAgICAvLyB1c2UgcmF0ZSBvZiBmbHVpZCBmbG93IGluIHZvbHVtZSAobV4zKSBwZXIgc2Vjb25kXHJcbiAgICByZXR1cm4gKCB0aGlzLmZsb3dSYXRlUHJvcGVydHkudmFsdWUgLyAxMDAwICkgLyBjcm9zc1NlY3Rpb25BcmVhO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSSB3YXMgdG9sZCB0aGF0IHRoZSBmbHVpZCBmbG93IHJhdGUgZmFsbHMgb2ZmIHF1YWRyYXRpY2FsbHksIHNvIHVzZSBsYWdyYW5nZSBpbnRlcnBvbGF0aW9uIHNvIHRoYXQgYXQgdGhlIGNlbnRlciBvZiB0aGUgcGlwZVxyXG4gICAqIHRoZSB2ZWxvY2l0eSBpcyBmdWxsIHNwZWVkLCBhbmQgaXQgZmFsbHMgb2ZmIHF1YWRyYXRpY2FsbHkgdG93YXJkIHRoZSBzaWRlcy5cclxuICAgKiBTZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMDc1MDEzL2Jlc3Qtd2F5LXRvLWZpbmQtcXVhZHJhdGljLXJlZ3Jlc3Npb24tY3VydmUtaW4tamF2YVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4MlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5MlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4M1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB5M1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGxhZ3JhbmdlKCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzLCB4ICkge1xyXG4gICAgcmV0dXJuICggeCAtIHgyICkgKiAoIHggLSB4MyApIC8gKCB4MSAtIHgyICkgLyAoIHgxIC0geDMgKSAqIHkxICtcclxuICAgICAgICAgICAoIHggLSB4MSApICogKCB4IC0geDMgKSAvICggeDIgLSB4MSApIC8gKCB4MiAtIHgzICkgKiB5MiArXHJcbiAgICAgICAgICAgKCB4IC0geDEgKSAqICggeCAtIHgyICkgLyAoIHgzIC0geDEgKSAvICggeDMgLSB4MiApICogeTM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgdGhlIHZlbG9jaXR5IGF0IHRoZSBzcGVjaWZpZWQgcG9pbnQsIGRvZXMgbm90IGFjY291bnQgZm9yIHZlcnRpY2FsIGVmZmVjdHMgb3IgZnJpY3Rpb24uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBwb3NpdGlvbiBpbiBtZXRlcnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIHBvc2l0aW9uIGluIG1ldGVyc1xyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfSB2ZWxvY2l0eSBhdCB4LHkgaW4gbWV0cmljIHVuaXRzLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRWZWxvY2l0eSggeCwgeSApIHtcclxuICAgIGNvbnN0IGZyYWN0aW9uID0gdGhpcy5nZXRGcmFjdGlvblRvVG9wKCB4LCB5ICk7XHJcbiAgICBjb25zdCBzcGVlZCA9IHRoaXMuZ2V0U3BlZWQoIHggKTtcclxuXHJcbiAgICBjb25zdCBwcmUgPSB0aGlzLmdldENyb3NzU2VjdGlvbiggeCAtIDFFLTcgKTsvLyBwaXBlIGNyb3NzIHNlY3Rpb25cclxuICAgIGNvbnN0IHBvc3QgPSB0aGlzLmdldENyb3NzU2VjdGlvbiggeCArIDFFLTcgKTsvLyBwaXBlIGNyb3NzIHNlY3Rpb25cclxuXHJcbiAgICBjb25zdCB4MCA9IHByZS5nZXRYKCk7XHJcbiAgICBjb25zdCB5MCA9IFV0aWxzLmxpbmVhciggMCwgMSwgcHJlLnlCb3R0b20sIHByZS55VG9wLCBmcmFjdGlvbiApO1xyXG4gICAgY29uc3QgeDEgPSBwb3N0LmdldFgoKTtcclxuICAgIGNvbnN0IHkxID0gVXRpbHMubGluZWFyKCAwLCAxLCBwb3N0LnlCb3R0b20sIHBvc3QueVRvcCwgZnJhY3Rpb24gKTtcclxuICAgIGNvbnN0IHZlbG9jaXR5ID0gbmV3IFZlY3RvcjIoIHgxIC0geDAsIHkxIC0geTAgKTtcclxuICAgIHJldHVybiB2ZWxvY2l0eS5zZXRNYWduaXR1ZGUoIHNwZWVkICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB4LXZlbG9jaXR5IG9mIGEgcGFydGljbGUsIGluY29ycG9yYXRpbmcgdmVydGljYWwgZWZmZWN0cy5cclxuICAgKiBJZiB0aGlzIGVmZmVjdCBpcyBpZ25vcmVkLCB0aGVuIHdoZW4gdGhlcmUgaXMgYSBsYXJnZSBzbG9wZSBpbiB0aGUgcGlwZSwgcGFydGljbGVzIGNsb3NlciB0byB0aGUgZWRnZSBtb3ZlIG11Y2ggZmFzdGVyICh3aGljaCBpcyBwaHlzaWNhbGx5IGluY29ycmVjdCkuXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBwb3NpdGlvbiBpbiBtZXRlcnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0geSAtIHBvc2l0aW9uIGluIG1ldGVyc1xyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSB0d2Vha2VkIHgtdmVsb2NpdHlcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VHdlYWtlZFZ4KCB4LCB5ICkge1xyXG5cclxuICAgIGNvbnN0IGZyYWN0aW9uID0gdGhpcy5nZXRGcmFjdGlvblRvVG9wKCB4LCB5ICk7XHJcbiAgICBjb25zdCBzcGVlZCA9IHRoaXMuZ2V0U3BlZWQoIHggKTtcclxuXHJcbiAgICBjb25zdCBwcmUgPSB0aGlzLmdldENyb3NzU2VjdGlvbiggeCAtIDFFLTcgKTsvLyBwaXBlIGNyb3NzIHNlY3Rpb25cclxuICAgIGNvbnN0IHBvc3QgPSB0aGlzLmdldENyb3NzU2VjdGlvbiggeCArIDFFLTcgKTsvLyBwaXBlIGNyb3NzIHNlY3Rpb25cclxuXHJcbiAgICBjb25zdCB4MCA9IHByZS5nZXRYKCk7XHJcbiAgICBjb25zdCB5MCA9IFV0aWxzLmxpbmVhciggMCwgMSwgcHJlLnlCb3R0b20sIHByZS55VG9wLCBmcmFjdGlvbiApO1xyXG4gICAgY29uc3QgeDEgPSBwb3N0LmdldFgoKTtcclxuICAgIGNvbnN0IHkxID0gVXRpbHMubGluZWFyKCAwLCAxLCBwb3N0LnlCb3R0b20sIHBvc3QueVRvcCwgZnJhY3Rpb24gKTtcclxuXHJcbiAgICBjb25zdCBkZWx0YVggPSAoIHgxIC0geDAgKTtcclxuICAgIGNvbnN0IGRlbHRhWSA9ICggeTEgLSB5MCApO1xyXG4gICAgY29uc3QgdnggPSAoIGRlbHRhWCAvIE1hdGguc3FydCggZGVsdGFYICogZGVsdGFYICsgZGVsdGFZICogZGVsdGFZICkgKSAqIHNwZWVkO1xyXG5cclxuICAgIC8vIElmIGZyaWN0aW9uIGlzIGVuYWJsZWQsIHRoZW4gc2NhbGUgZG93biBxdWFkcmF0aWNhbGx5IChsaWtlIGEgcGFyYWJvbGEpIGFzIHlvdSBnZXQgZnVydGhlciBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIHBpcGUuXHJcbiAgICAvLyBCdXQgaW5zdGVhZCBvZiByZWFjaGluZyB6ZXJvIHZlbG9jaXR5IGF0IHRoZSBlZGdlIG9mIHRoZSBwaXBlICh3aGljaCBjb3VsZCBjYXVzZSBwYXJ0aWNsZXMgdG8gcGlsZSB1cCBpbmRlZmluaXRlbHkpLCBleHRlbmQgdGhlIHJlZ2lvblxyXG4gICAgLy8gYSBzbWFsbCBlcHNpbG9uIHBhc3QgdGhlICgwLi4xKSBwaXBlIHJhbmdlXHJcbiAgICBpZiAoIHRoaXMuZnJpY3Rpb25Qcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgY29uc3QgZXBzaWxvbiA9IDAuMjtcclxuICAgICAgY29uc3QgZnJhY3Rpb25Ub1RvcCA9IHRoaXMuZ2V0RnJhY3Rpb25Ub1RvcCggeCwgeSApO1xyXG4gICAgICBjb25zdCBzY2FsZUZhY3RvciA9IHRoaXMubGFncmFuZ2UoIC1lcHNpbG9uLCAwLCAwLjUsIDEsIDEgKyBlcHNpbG9uLCAwLCBmcmFjdGlvblRvVG9wICk7XHJcbiAgICAgIHJldHVybiB2eCAqIHNjYWxlRmFjdG9yO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiB2eDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBwb3NpdGlvbiBpbiBtZXRlcnNcclxuICAgKiBAcmV0dXJucyB7VmVjdG9yMn0gdGhlIHZlbG9jaXR5IHZlY3RvciBhdCB0aGUgZ2l2ZW4gcG9pbnRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VHdlYWtlZFZlbG9jaXR5KCB4LCB5ICkge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB0aGlzLmdldFR3ZWFrZWRWeCggeCwgeSApLCB0aGlzLmdldFZlbG9jaXR5KCB4LCB5ICkueSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmluZCB0aGUgeS12YWx1ZSBmb3IgdGhlIHNwZWNpZmllZCB4LXZhbHVlIGFuZCBmcmFjdGlvbiAoMD1ib3R0b20sIDE9dG9wKSBvZiB0aGUgcGlwZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gcG9zaXRpb24gaW4gbWV0ZXJzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGZyYWN0aW9uIC0gaXMgaW4gKDAsMSkgKDA9Ym90dG9tLCAxPXRvcClcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBmcmFjdGlvblRvUG9zaXRpb24oIHgsIGZyYWN0aW9uICkge1xyXG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdldENyb3NzU2VjdGlvbiggeCApO1xyXG4gICAgcmV0dXJuIFV0aWxzLmxpbmVhciggMCwgMSwgcG9zaXRpb24ueUJvdHRvbSwgcG9zaXRpb24ueVRvcCwgZnJhY3Rpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcG9pbnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvblxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB4IHBvc2l0aW9uICBpcyBpbiBtZXRlcnNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZnJhY3Rpb25Ub1RvcCBpcyBpbiAoMCwxKVxyXG4gICAqIEByZXR1cm5zIHtWZWN0b3IyfSB0aGUgcG9zaXRpb24gdmVjdG9yIG9mIHRoZSBwb2ludFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRQb2ludCggeCwgZnJhY3Rpb25Ub1RvcCApIHtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgdGhpcy5mcmFjdGlvblRvUG9zaXRpb24oIHgsIGZyYWN0aW9uVG9Ub3AgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29tcHV0ZSB0aGUgY2lyY3VsYXIgY3Jvc3Mgc2VjdGlvbmFsIGFyZWEgKGluIG1ldGVycyBzcXVhcmVkKSBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHggLSBwb3NpdGlvbiBpbiBtZXRlcnNcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBhcmVhIG9mIGNyb3NzIHNlY3Rpb24gYXQgeCBpbiBzcXVhcmUgbWV0ZXJzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldENyb3NzU2VjdGlvbmFsQXJlYSggeCApIHtcclxuICAgIGNvbnN0IHJhZGl1cyA9IE1hdGguYWJzKCB0aGlzLmdldFBvaW50KCB4LCAwLjUgKS55IC0gdGhpcy5nZXRQb2ludCggeCwgMSApLnkgKTtcclxuICAgIHJldHVybiBNYXRoLlBJICogcmFkaXVzICogcmFkaXVzO1xyXG4gIH1cclxufVxyXG5cclxuZmx1aWRQcmVzc3VyZUFuZEZsb3cucmVnaXN0ZXIoICdQaXBlJywgUGlwZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQaXBlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBQ2hFLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCOztBQUVwRDtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLE1BQU1DLDJCQUEyQixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDMUMsTUFBTUMsOEJBQThCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QyxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJO0FBRS9CLE1BQU1DLGNBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM1QixNQUFNQyxvQkFBb0IsR0FBR0QsY0FBYyxHQUFH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