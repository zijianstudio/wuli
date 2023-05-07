// Copyright 2016-2022, University of Colorado Boulder

/**
 * Encodes layout information about how the square/round beads and chain/string are positioned, given a count of
 * round and square beads.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrea Lin
 */

import Random from '../../../../../dot/js/Random.js';
import Utils from '../../../../../dot/js/Utils.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import { Shape } from '../../../../../kite/js/imports.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
import RoundBead from './RoundBead.js';
import SquareBead from './SquareBead.js';

// {number} - The diameter of beads (for the square bead, it's from the center of the bead to the center of a side)
const BEAD_DIAMETER = ProportionPlaygroundConstants.BEAD_DIAMETER;

// The horizontal offset in two-bead shapes from the vertical center-line to the beads.
// The "best" way would be to refactor all of the custom curves/positioning so things are
// curves centered about the origin created with a shared parameterized function
// (instead of many "magic" constants with custom x,y values for each curve).
// But this didn't seem to be worth the time/risk.
const TWO_BEAD_OFFSET = BEAD_DIAMETER - 7;

/**
 * Creates an immutable spline with specific parameters from a list of points.
 * @private
 *
 * @param {Array.<Vector2>} splinePoints
 * @returns {Shape}
 */
function shapeFromSplintPoints(splinePoints) {
  return new Shape().cardinalSpline(splinePoints, {
    tension: -0.75,
    isClosedLineSegments: true
  }).makeImmutable();
}

// {Object} - maps a seed {number} => {Array.<Vector2>}, see getRepulsionPoints(). Lazily computed
const repulsionPointMap = {};

/**
 * Returns points used for adjusting the necklace into a random-looking shape.
 * @private
 *
 * This repulsion should be the same for necklaces with the same proportion (and is not used if there is 0 of one
 * bead type), so a seed is generated from the ratio of the bead counts, and repulsion points are shared for every
 * layout that has the same seed.
 *
 * @param {number} roundBeadCount - Number of round beads in the necklace
 * @param {number} squareBeadCount - Number of square beads in the necklace
 * @returns {Array.<Vector2>} - An array of up to 4 repulsion points to be used in necklace layout.
 */
function getRepulsionPoints(roundBeadCount, squareBeadCount) {
  // Keeping prior behavior based on this formula.
  const seed = squareBeadCount === 0 ? 30 : roundBeadCount / squareBeadCount;
  let repulsionPoints = repulsionPointMap[seed];
  if (!repulsionPoints) {
    // OK to use our own instance of Random here, see documentation of getRepulsionPoints
    // and https://github.com/phetsims/proportion-playground/issues/81.
    const random = new Random({
      seed: seed
    });
    repulsionPoints = [];
    repulsionPointMap[seed] = repulsionPoints;
    const numRepulsionPoints = random.nextIntBetween(1, 4);
    // create repulsion points
    for (let g = 0; g < numRepulsionPoints; g++) {
      // separate repulsion points by quadrant to prevent too much concentrated repulsion
      const angle = Math.PI / 2 * (random.nextDouble() / numRepulsionPoints + g);
      const radius = random.nextDouble() * 0.3 + 0.2; // 0.2 - 0.5, ratio of apothem

      repulsionPoints.push(Vector2.createPolar(radius, angle));
    }
  }
  return repulsionPoints;
}

// {Object} - Map from "{{roundBeadCount}},{{squareBeadCount}}" {string} => {NecklaceLayout}, lazily computed in
// NecklaceLayout.getLayout().
const layoutMap = {};
class NecklaceLayout {
  /**
   * @param {number} roundBeadCount - Number of round beads in the necklace
   * @param {number} squareBeadCount - Number of square beads in the necklace
   */
  constructor(roundBeadCount, squareBeadCount) {
    // @public {number} - Number of round beads in the necklace
    this.roundBeadCount = roundBeadCount;

    // @public {number} - Number of square beads in the necklace
    this.squareBeadCount = squareBeadCount;

    // @public {Shape} - Shape of the chain/string behind the beads
    this.shape = new Shape();

    // @public {Array.<RoundBead>} - All round beads in the necklace
    this.roundBeads = [];

    // @public {Array.<SquareBead>} - All square beads in the necklace
    this.squareBeads = [];

    // @public {Vector2} - Global translation that should be applied to the shape/beads in order to look approximately
    // centered when in the view (heuristic to avoid expensive operations on older code).
    this.containerTranslation = Vector2.ZERO;
    if (roundBeadCount === 1 && squareBeadCount === 0) {
      this.shape = NecklaceLayout.ONE_ROUND_BEAD_SHAPE;
      this.roundBeads.push(new RoundBead(Vector2.ZERO));
      this.containerTranslation = new Vector2(1.3514828985498655, 12.636803053853306);
    } else if (roundBeadCount === 2 && squareBeadCount === 0) {
      this.shape = NecklaceLayout.TWO_ROUND_BEADS_SHAPE;
      this.roundBeads.push(new RoundBead(Vector2.ZERO));
      this.roundBeads.push(new RoundBead(new Vector2(TWO_BEAD_OFFSET * 2, 0)));
      this.containerTranslation = new Vector2(-11, 12.991498868074157);
    } else if (roundBeadCount === 1 && squareBeadCount === 1) {
      this.shape = NecklaceLayout.TWO_MIXED_BEADS_SHAPE;
      this.roundBeads.push(new RoundBead(Vector2.ZERO));
      this.squareBeads.push(new SquareBead(new Vector2(TWO_BEAD_OFFSET * 2, 0), 0));
      this.containerTranslation = new Vector2(-11, 15.785);
    } else if (roundBeadCount === 0 && squareBeadCount === 1) {
      this.shape = NecklaceLayout.ONE_SQUARE_BEAD_SHAPE;
      this.squareBeads.push(new SquareBead(Vector2.ZERO, 0));
      this.containerTranslation = new Vector2(0.2394730404209664, 10.390542501611892);
    } else if (roundBeadCount === 0 && squareBeadCount === 2) {
      this.shape = NecklaceLayout.TWO_SQUARE_BEADS_SHAPE;
      this.squareBeads.push(new SquareBead(Vector2.ZERO, 0));
      this.squareBeads.push(new SquareBead(new Vector2(TWO_BEAD_OFFSET * 2, 0), 0));
      this.containerTranslation = new Vector2(-10.753124040624703, 10.534079717389499);
    } else {
      const numBeads = roundBeadCount + squareBeadCount;

      // Number of vertices is one more than number of beads to account for a gap.
      const numVertices = numBeads + 1;
      const angelBetweenVertices = Math.PI * 2 / numVertices;

      // empirical, larger spacing with only 3 beads
      const sideLength = (numBeads === 3 ? 1.94 : 1.28) * BEAD_DIAMETER;

      // circumradius of the polygon, used to find polar coordinates for the vertices
      let R = 1 / 2 * sideLength / Math.sin(Math.PI / numVertices);

      // make beads closer together as there are more of them
      if (numVertices <= 20) {
        R *= Utils.linear(3, ProportionPlaygroundConstants.BEAD_COUNT_RANGE.max, 1.5, 1, numVertices);
      }

      // Use repulsion of random points to make the shape look more natural.
      // apothem of the polygon, see http://www.mathopenref.com/apothem.html
      const apothem = R * Math.cos(Math.PI / numVertices);

      // Scale up the repulsion points to our size
      const repulsionPoints = getRepulsionPoints(roundBeadCount, squareBeadCount).map(point => point.timesScalar(apothem));

      // loop through vertices and change according to repulsion points
      const vertices = [];
      for (let i = 0; i < numVertices; i++) {
        const angle = (i + 0.5) * angelBetweenVertices - Math.PI / 2;
        const perfectVertex = Vector2.createPolar(R, angle);
        let newRadius = R;
        if (roundBeadCount > 0 && squareBeadCount > 0) {
          // loop through repulsion points and change the vertex
          for (let g = 0; g < repulsionPoints.length; g++) {
            const difference = repulsionPoints[g].distance(perfectVertex);
            const amount = Math.pow(apothem - difference, 2);
            const change = amount / R;
            newRadius += change;
          }
        }
        const vertex = Vector2.createPolar(newRadius, angle);
        vertices.push(vertex);
      }

      // Set up pairs of vertices - between each pair of vertices will be a bead
      const pairs = [];
      for (let i = 0; i < vertices.length - 1; i++) {
        pairs.push({
          start: vertices[i],
          end: vertices[i + 1]
        });
      }
      // join last->first
      if (vertices.length > 0) {
        pairs.push({
          start: vertices[vertices.length - 1],
          end: vertices[0]
        });
      }
      const gcd = Utils.gcd(roundBeadCount, squareBeadCount);
      const types = _.flatten(_.range(0, gcd).map(() => _.times(squareBeadCount / gcd, () => 'square').concat(_.times(roundBeadCount / gcd, () => 'round'))));

      // Between each pair of vertices, we must put a bead in the center
      const centers = [];
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const center = pair.start.blend(pair.end, 0.5);
        centers.push(center);
      }

      // Find the shortest distance between any two centers
      let minSideLength = centers[centers.length - 1].distance(centers[0]);
      for (let i = 0; i < centers.length - 1; i++) {
        const newLength = centers[i].distance(centers[i + 1]);
        if (newLength < minSideLength) {
          minSideLength = newLength;
        }
      }

      // Resize necklace to be smaller so beads are closer together
      const radiusScale = BEAD_DIAMETER / minSideLength;
      for (let i = 0; i < centers.length; i++) {
        const oldCenter = centers[i];

        // Add 5 to the radius to give some more space between beads
        const extraSpace = 0.28 * BEAD_DIAMETER;
        centers[i] = Vector2.createPolar(radiusScale * oldCenter.magnitude + extraSpace, oldCenter.angle);
      }
      let center;
      let angle;

      // Instantiate the beads between each vertex
      for (let i = 0; i < centers.length; i++) {
        center = centers[i];
        angle = pairs[i].end.minus(pairs[i].start).angle;

        // Add a bead if it is not the last pair
        if (i !== centers.length - 1) {
          if (types[i] === 'round') {
            this.roundBeads.push(new RoundBead(center));
          } else {
            this.squareBeads.push(new SquareBead(center, angle));
          }
        }

        // If it is the last pair, move center further away for a curved gap.
        else {
          centers[i] = center.addXY(15 * Math.cos(center.angle), 15 * Math.sin(center.angle));
        }
      }

      // the black line of the necklace
      for (let i = 0; i < centers.length - 1; i++) {
        center = centers[i];

        // Have the last bead connect to the first bead.
        const nextCenter = i === centers.length - 2 ? centers[0] : centers[i + 1];

        // the more vertices, the less curved the necklace line connecting to each bead
        const strength = 20 / numVertices + 2;

        // control point for the quadratic curve
        let control = center.blend(nextCenter, 0.5);

        // curve necklace line based on a certain degree of strength
        control.addXY(strength * Math.cos(control.angle), strength * Math.sin(control.angle));

        // gap is more curved/bumpy than the rest of the black line
        if (i === centers.length - 2) {
          control = centers[centers.length - 1];
        }
        this.shape.moveToPoint(center);
        this.shape.quadraticCurveToPoint(control, nextCenter);
      }
      this.shape.makeImmutable();
      this.containerTranslation = roundBeadCount + squareBeadCount === 3 ? new Vector2(0, -5) : Vector2.ZERO;
    }
  }

  /**
   * Returns a {NecklaceLayout} corresponding to the number of round/square beads (lazily computed and cached).
   * @public
   *
   * @param {number} roundBeadCount - Number of round beads in the necklace
   * @param {number} squareBeadCount - Number of square beads in the necklace
   * @returns {NecklaceLayout}
   */
  static getLayout(roundBeadCount, squareBeadCount) {
    const key = `${roundBeadCount},${squareBeadCount}`;
    if (layoutMap[key]) {
      return layoutMap[key];
    }
    const result = new NecklaceLayout(roundBeadCount, squareBeadCount);
    layoutMap[key] = result;
    return result;
  }
}

/**
 * {Shape} - Immutable shared string shape for when there is only one round bead.
 */
NecklaceLayout.ONE_ROUND_BEAD_SHAPE = shapeFromSplintPoints([new Vector2(0.38 * BEAD_DIAMETER, 0.05 * BEAD_DIAMETER), new Vector2(-0.38 * BEAD_DIAMETER, 0.05 * BEAD_DIAMETER), new Vector2(-0.72 * BEAD_DIAMETER, -1.5 * BEAD_DIAMETER), new Vector2(0.5 * BEAD_DIAMETER, -1.55 * BEAD_DIAMETER)]);

/**
 * {Shape} - Immutable shared string shape for when there is only one square bead.
 */
NecklaceLayout.ONE_SQUARE_BEAD_SHAPE = shapeFromSplintPoints([new Vector2(0.55 * BEAD_DIAMETER, 0), new Vector2(-0.61 * BEAD_DIAMETER, 0), new Vector2(-0.66 * BEAD_DIAMETER, -1.33 * BEAD_DIAMETER), new Vector2(0.66 * BEAD_DIAMETER, -1.33 * BEAD_DIAMETER)]);

/**
 * {Shape} - Immutable shared string shape for when there are only two round beads.
 * Previous doc: "if all round beads, draw the same shape as twenty round beads", may not be accurate.
 */
NecklaceLayout.TWO_ROUND_BEADS_SHAPE = shapeFromSplintPoints([new Vector2(0.55 * BEAD_DIAMETER + TWO_BEAD_OFFSET, 0.05 * BEAD_DIAMETER), new Vector2(-0.55 * BEAD_DIAMETER + TWO_BEAD_OFFSET, 0.05 * BEAD_DIAMETER), new Vector2(-0.78 * BEAD_DIAMETER + TWO_BEAD_OFFSET, -1.5 * BEAD_DIAMETER), new Vector2(0.55 * BEAD_DIAMETER + TWO_BEAD_OFFSET, -1.61 * BEAD_DIAMETER)]);

/**
 * {Shape} - Immutable shared string shape for when there are only two square beads.
 * Previous doc: "if all square beads, draw the same shape as twenty square beads", may not be accurate.
 */
NecklaceLayout.TWO_SQUARE_BEADS_SHAPE = shapeFromSplintPoints([new Vector2(0.61 * BEAD_DIAMETER + TWO_BEAD_OFFSET, 0), new Vector2(-0.66 * BEAD_DIAMETER + TWO_BEAD_OFFSET, 0), new Vector2(-0.71 * BEAD_DIAMETER + TWO_BEAD_OFFSET, -1.39 * BEAD_DIAMETER), new Vector2(0.71 * BEAD_DIAMETER + TWO_BEAD_OFFSET, -1.29 * BEAD_DIAMETER)]);

/**
 * {Shape} - Immutable shared string shape for when there is only one bead of each type.
 * Previous doc: "if one bead of each kind, draw same shape as twenty round and twenty square beads", may not be
 * accurate.
 */
NecklaceLayout.TWO_MIXED_BEADS_SHAPE = shapeFromSplintPoints([new Vector2(TWO_BEAD_OFFSET, 5), new Vector2(-1.11 * BEAD_DIAMETER + TWO_BEAD_OFFSET, -0.94 * BEAD_DIAMETER), new Vector2(TWO_BEAD_OFFSET, -2.22 * BEAD_DIAMETER), new Vector2(1.11 * BEAD_DIAMETER + TWO_BEAD_OFFSET, -0.94 * BEAD_DIAMETER)]);
proportionPlayground.register('NecklaceLayout', NecklaceLayout);
export default NecklaceLayout;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5kb20iLCJVdGlscyIsIlZlY3RvcjIiLCJTaGFwZSIsInByb3BvcnRpb25QbGF5Z3JvdW5kIiwiUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMiLCJSb3VuZEJlYWQiLCJTcXVhcmVCZWFkIiwiQkVBRF9ESUFNRVRFUiIsIlRXT19CRUFEX09GRlNFVCIsInNoYXBlRnJvbVNwbGludFBvaW50cyIsInNwbGluZVBvaW50cyIsImNhcmRpbmFsU3BsaW5lIiwidGVuc2lvbiIsImlzQ2xvc2VkTGluZVNlZ21lbnRzIiwibWFrZUltbXV0YWJsZSIsInJlcHVsc2lvblBvaW50TWFwIiwiZ2V0UmVwdWxzaW9uUG9pbnRzIiwicm91bmRCZWFkQ291bnQiLCJzcXVhcmVCZWFkQ291bnQiLCJzZWVkIiwicmVwdWxzaW9uUG9pbnRzIiwicmFuZG9tIiwibnVtUmVwdWxzaW9uUG9pbnRzIiwibmV4dEludEJldHdlZW4iLCJnIiwiYW5nbGUiLCJNYXRoIiwiUEkiLCJuZXh0RG91YmxlIiwicmFkaXVzIiwicHVzaCIsImNyZWF0ZVBvbGFyIiwibGF5b3V0TWFwIiwiTmVja2xhY2VMYXlvdXQiLCJjb25zdHJ1Y3RvciIsInNoYXBlIiwicm91bmRCZWFkcyIsInNxdWFyZUJlYWRzIiwiY29udGFpbmVyVHJhbnNsYXRpb24iLCJaRVJPIiwiT05FX1JPVU5EX0JFQURfU0hBUEUiLCJUV09fUk9VTkRfQkVBRFNfU0hBUEUiLCJUV09fTUlYRURfQkVBRFNfU0hBUEUiLCJPTkVfU1FVQVJFX0JFQURfU0hBUEUiLCJUV09fU1FVQVJFX0JFQURTX1NIQVBFIiwibnVtQmVhZHMiLCJudW1WZXJ0aWNlcyIsImFuZ2VsQmV0d2VlblZlcnRpY2VzIiwic2lkZUxlbmd0aCIsIlIiLCJzaW4iLCJsaW5lYXIiLCJCRUFEX0NPVU5UX1JBTkdFIiwibWF4IiwiYXBvdGhlbSIsImNvcyIsIm1hcCIsInBvaW50IiwidGltZXNTY2FsYXIiLCJ2ZXJ0aWNlcyIsImkiLCJwZXJmZWN0VmVydGV4IiwibmV3UmFkaXVzIiwibGVuZ3RoIiwiZGlmZmVyZW5jZSIsImRpc3RhbmNlIiwiYW1vdW50IiwicG93IiwiY2hhbmdlIiwidmVydGV4IiwicGFpcnMiLCJzdGFydCIsImVuZCIsImdjZCIsInR5cGVzIiwiXyIsImZsYXR0ZW4iLCJyYW5nZSIsInRpbWVzIiwiY29uY2F0IiwiY2VudGVycyIsInBhaXIiLCJjZW50ZXIiLCJibGVuZCIsIm1pblNpZGVMZW5ndGgiLCJuZXdMZW5ndGgiLCJyYWRpdXNTY2FsZSIsIm9sZENlbnRlciIsImV4dHJhU3BhY2UiLCJtYWduaXR1ZGUiLCJtaW51cyIsImFkZFhZIiwibmV4dENlbnRlciIsInN0cmVuZ3RoIiwiY29udHJvbCIsIm1vdmVUb1BvaW50IiwicXVhZHJhdGljQ3VydmVUb1BvaW50IiwiZ2V0TGF5b3V0Iiwia2V5IiwicmVzdWx0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOZWNrbGFjZUxheW91dC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFbmNvZGVzIGxheW91dCBpbmZvcm1hdGlvbiBhYm91dCBob3cgdGhlIHNxdWFyZS9yb3VuZCBiZWFkcyBhbmQgY2hhaW4vc3RyaW5nIGFyZSBwb3NpdGlvbmVkLCBnaXZlbiBhIGNvdW50IG9mXHJcbiAqIHJvdW5kIGFuZCBzcXVhcmUgYmVhZHMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZWEgTGluXHJcbiAqL1xyXG5cclxuaW1wb3J0IFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvUmFuZG9tLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcHJvcG9ydGlvblBsYXlncm91bmQgZnJvbSAnLi4vLi4vLi4vcHJvcG9ydGlvblBsYXlncm91bmQuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMgZnJvbSAnLi4vLi4vUHJvcG9ydGlvblBsYXlncm91bmRDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUm91bmRCZWFkIGZyb20gJy4vUm91bmRCZWFkLmpzJztcclxuaW1wb3J0IFNxdWFyZUJlYWQgZnJvbSAnLi9TcXVhcmVCZWFkLmpzJztcclxuXHJcbi8vIHtudW1iZXJ9IC0gVGhlIGRpYW1ldGVyIG9mIGJlYWRzIChmb3IgdGhlIHNxdWFyZSBiZWFkLCBpdCdzIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmVhZCB0byB0aGUgY2VudGVyIG9mIGEgc2lkZSlcclxuY29uc3QgQkVBRF9ESUFNRVRFUiA9IFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLkJFQURfRElBTUVURVI7XHJcblxyXG4vLyBUaGUgaG9yaXpvbnRhbCBvZmZzZXQgaW4gdHdvLWJlYWQgc2hhcGVzIGZyb20gdGhlIHZlcnRpY2FsIGNlbnRlci1saW5lIHRvIHRoZSBiZWFkcy5cclxuLy8gVGhlIFwiYmVzdFwiIHdheSB3b3VsZCBiZSB0byByZWZhY3RvciBhbGwgb2YgdGhlIGN1c3RvbSBjdXJ2ZXMvcG9zaXRpb25pbmcgc28gdGhpbmdzIGFyZVxyXG4vLyBjdXJ2ZXMgY2VudGVyZWQgYWJvdXQgdGhlIG9yaWdpbiBjcmVhdGVkIHdpdGggYSBzaGFyZWQgcGFyYW1ldGVyaXplZCBmdW5jdGlvblxyXG4vLyAoaW5zdGVhZCBvZiBtYW55IFwibWFnaWNcIiBjb25zdGFudHMgd2l0aCBjdXN0b20geCx5IHZhbHVlcyBmb3IgZWFjaCBjdXJ2ZSkuXHJcbi8vIEJ1dCB0aGlzIGRpZG4ndCBzZWVtIHRvIGJlIHdvcnRoIHRoZSB0aW1lL3Jpc2suXHJcbmNvbnN0IFRXT19CRUFEX09GRlNFVCA9IEJFQURfRElBTUVURVIgLSA3O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gaW1tdXRhYmxlIHNwbGluZSB3aXRoIHNwZWNpZmljIHBhcmFtZXRlcnMgZnJvbSBhIGxpc3Qgb2YgcG9pbnRzLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gc3BsaW5lUG9pbnRzXHJcbiAqIEByZXR1cm5zIHtTaGFwZX1cclxuICovXHJcbmZ1bmN0aW9uIHNoYXBlRnJvbVNwbGludFBvaW50cyggc3BsaW5lUG9pbnRzICkge1xyXG4gIHJldHVybiBuZXcgU2hhcGUoKS5jYXJkaW5hbFNwbGluZSggc3BsaW5lUG9pbnRzLCB7XHJcbiAgICB0ZW5zaW9uOiAtMC43NSxcclxuICAgIGlzQ2xvc2VkTGluZVNlZ21lbnRzOiB0cnVlXHJcbiAgfSApLm1ha2VJbW11dGFibGUoKTtcclxufVxyXG5cclxuLy8ge09iamVjdH0gLSBtYXBzIGEgc2VlZCB7bnVtYmVyfSA9PiB7QXJyYXkuPFZlY3RvcjI+fSwgc2VlIGdldFJlcHVsc2lvblBvaW50cygpLiBMYXppbHkgY29tcHV0ZWRcclxuY29uc3QgcmVwdWxzaW9uUG9pbnRNYXAgPSB7fTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIHBvaW50cyB1c2VkIGZvciBhZGp1c3RpbmcgdGhlIG5lY2tsYWNlIGludG8gYSByYW5kb20tbG9va2luZyBzaGFwZS5cclxuICogQHByaXZhdGVcclxuICpcclxuICogVGhpcyByZXB1bHNpb24gc2hvdWxkIGJlIHRoZSBzYW1lIGZvciBuZWNrbGFjZXMgd2l0aCB0aGUgc2FtZSBwcm9wb3J0aW9uIChhbmQgaXMgbm90IHVzZWQgaWYgdGhlcmUgaXMgMCBvZiBvbmVcclxuICogYmVhZCB0eXBlKSwgc28gYSBzZWVkIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSByYXRpbyBvZiB0aGUgYmVhZCBjb3VudHMsIGFuZCByZXB1bHNpb24gcG9pbnRzIGFyZSBzaGFyZWQgZm9yIGV2ZXJ5XHJcbiAqIGxheW91dCB0aGF0IGhhcyB0aGUgc2FtZSBzZWVkLlxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gcm91bmRCZWFkQ291bnQgLSBOdW1iZXIgb2Ygcm91bmQgYmVhZHMgaW4gdGhlIG5lY2tsYWNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBzcXVhcmVCZWFkQ291bnQgLSBOdW1iZXIgb2Ygc3F1YXJlIGJlYWRzIGluIHRoZSBuZWNrbGFjZVxyXG4gKiBAcmV0dXJucyB7QXJyYXkuPFZlY3RvcjI+fSAtIEFuIGFycmF5IG9mIHVwIHRvIDQgcmVwdWxzaW9uIHBvaW50cyB0byBiZSB1c2VkIGluIG5lY2tsYWNlIGxheW91dC5cclxuICovXHJcbmZ1bmN0aW9uIGdldFJlcHVsc2lvblBvaW50cyggcm91bmRCZWFkQ291bnQsIHNxdWFyZUJlYWRDb3VudCApIHtcclxuICAvLyBLZWVwaW5nIHByaW9yIGJlaGF2aW9yIGJhc2VkIG9uIHRoaXMgZm9ybXVsYS5cclxuICBjb25zdCBzZWVkID0gc3F1YXJlQmVhZENvdW50ID09PSAwID8gMzAgOiByb3VuZEJlYWRDb3VudCAvIHNxdWFyZUJlYWRDb3VudDtcclxuICBsZXQgcmVwdWxzaW9uUG9pbnRzID0gcmVwdWxzaW9uUG9pbnRNYXBbIHNlZWQgXTtcclxuXHJcbiAgaWYgKCAhcmVwdWxzaW9uUG9pbnRzICkge1xyXG5cclxuICAgIC8vIE9LIHRvIHVzZSBvdXIgb3duIGluc3RhbmNlIG9mIFJhbmRvbSBoZXJlLCBzZWUgZG9jdW1lbnRhdGlvbiBvZiBnZXRSZXB1bHNpb25Qb2ludHNcclxuICAgIC8vIGFuZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcHJvcG9ydGlvbi1wbGF5Z3JvdW5kL2lzc3Vlcy84MS5cclxuICAgIGNvbnN0IHJhbmRvbSA9IG5ldyBSYW5kb20oIHsgc2VlZDogc2VlZCB9ICk7XHJcbiAgICByZXB1bHNpb25Qb2ludHMgPSBbXTtcclxuICAgIHJlcHVsc2lvblBvaW50TWFwWyBzZWVkIF0gPSByZXB1bHNpb25Qb2ludHM7XHJcblxyXG4gICAgY29uc3QgbnVtUmVwdWxzaW9uUG9pbnRzID0gcmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCA0ICk7XHJcbiAgICAvLyBjcmVhdGUgcmVwdWxzaW9uIHBvaW50c1xyXG4gICAgZm9yICggbGV0IGcgPSAwOyBnIDwgbnVtUmVwdWxzaW9uUG9pbnRzOyBnKysgKSB7XHJcbiAgICAgIC8vIHNlcGFyYXRlIHJlcHVsc2lvbiBwb2ludHMgYnkgcXVhZHJhbnQgdG8gcHJldmVudCB0b28gbXVjaCBjb25jZW50cmF0ZWQgcmVwdWxzaW9uXHJcbiAgICAgIGNvbnN0IGFuZ2xlID0gTWF0aC5QSSAvIDIgKiAoIHJhbmRvbS5uZXh0RG91YmxlKCkgLyBudW1SZXB1bHNpb25Qb2ludHMgKyBnICk7XHJcbiAgICAgIGNvbnN0IHJhZGl1cyA9ICggcmFuZG9tLm5leHREb3VibGUoKSAqIDAuMyArIDAuMiApOyAvLyAwLjIgLSAwLjUsIHJhdGlvIG9mIGFwb3RoZW1cclxuXHJcbiAgICAgIHJlcHVsc2lvblBvaW50cy5wdXNoKCBWZWN0b3IyLmNyZWF0ZVBvbGFyKCByYWRpdXMsIGFuZ2xlICkgKTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHJlcHVsc2lvblBvaW50cztcclxufVxyXG5cclxuLy8ge09iamVjdH0gLSBNYXAgZnJvbSBcInt7cm91bmRCZWFkQ291bnR9fSx7e3NxdWFyZUJlYWRDb3VudH19XCIge3N0cmluZ30gPT4ge05lY2tsYWNlTGF5b3V0fSwgbGF6aWx5IGNvbXB1dGVkIGluXHJcbi8vIE5lY2tsYWNlTGF5b3V0LmdldExheW91dCgpLlxyXG5jb25zdCBsYXlvdXRNYXAgPSB7fTtcclxuXHJcbmNsYXNzIE5lY2tsYWNlTGF5b3V0IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm91bmRCZWFkQ291bnQgLSBOdW1iZXIgb2Ygcm91bmQgYmVhZHMgaW4gdGhlIG5lY2tsYWNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNxdWFyZUJlYWRDb3VudCAtIE51bWJlciBvZiBzcXVhcmUgYmVhZHMgaW4gdGhlIG5lY2tsYWNlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHJvdW5kQmVhZENvdW50LCBzcXVhcmVCZWFkQ291bnQgKSB7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfSAtIE51bWJlciBvZiByb3VuZCBiZWFkcyBpbiB0aGUgbmVja2xhY2VcclxuICAgIHRoaXMucm91bmRCZWFkQ291bnQgPSByb3VuZEJlYWRDb3VudDtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IC0gTnVtYmVyIG9mIHNxdWFyZSBiZWFkcyBpbiB0aGUgbmVja2xhY2VcclxuICAgIHRoaXMuc3F1YXJlQmVhZENvdW50ID0gc3F1YXJlQmVhZENvdW50O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1NoYXBlfSAtIFNoYXBlIG9mIHRoZSBjaGFpbi9zdHJpbmcgYmVoaW5kIHRoZSBiZWFkc1xyXG4gICAgdGhpcy5zaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxSb3VuZEJlYWQ+fSAtIEFsbCByb3VuZCBiZWFkcyBpbiB0aGUgbmVja2xhY2VcclxuICAgIHRoaXMucm91bmRCZWFkcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxTcXVhcmVCZWFkPn0gLSBBbGwgc3F1YXJlIGJlYWRzIGluIHRoZSBuZWNrbGFjZVxyXG4gICAgdGhpcy5zcXVhcmVCZWFkcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJ9IC0gR2xvYmFsIHRyYW5zbGF0aW9uIHRoYXQgc2hvdWxkIGJlIGFwcGxpZWQgdG8gdGhlIHNoYXBlL2JlYWRzIGluIG9yZGVyIHRvIGxvb2sgYXBwcm94aW1hdGVseVxyXG4gICAgLy8gY2VudGVyZWQgd2hlbiBpbiB0aGUgdmlldyAoaGV1cmlzdGljIHRvIGF2b2lkIGV4cGVuc2l2ZSBvcGVyYXRpb25zIG9uIG9sZGVyIGNvZGUpLlxyXG4gICAgdGhpcy5jb250YWluZXJUcmFuc2xhdGlvbiA9IFZlY3RvcjIuWkVSTztcclxuXHJcbiAgICBpZiAoIHJvdW5kQmVhZENvdW50ID09PSAxICYmIHNxdWFyZUJlYWRDb3VudCA9PT0gMCApIHtcclxuICAgICAgdGhpcy5zaGFwZSA9IE5lY2tsYWNlTGF5b3V0Lk9ORV9ST1VORF9CRUFEX1NIQVBFO1xyXG4gICAgICB0aGlzLnJvdW5kQmVhZHMucHVzaCggbmV3IFJvdW5kQmVhZCggVmVjdG9yMi5aRVJPICkgKTtcclxuICAgICAgdGhpcy5jb250YWluZXJUcmFuc2xhdGlvbiA9IG5ldyBWZWN0b3IyKCAxLjM1MTQ4Mjg5ODU0OTg2NTUsIDEyLjYzNjgwMzA1Mzg1MzMwNiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHJvdW5kQmVhZENvdW50ID09PSAyICYmIHNxdWFyZUJlYWRDb3VudCA9PT0gMCApIHtcclxuICAgICAgdGhpcy5zaGFwZSA9IE5lY2tsYWNlTGF5b3V0LlRXT19ST1VORF9CRUFEU19TSEFQRTtcclxuICAgICAgdGhpcy5yb3VuZEJlYWRzLnB1c2goIG5ldyBSb3VuZEJlYWQoIFZlY3RvcjIuWkVSTyApICk7XHJcbiAgICAgIHRoaXMucm91bmRCZWFkcy5wdXNoKCBuZXcgUm91bmRCZWFkKCBuZXcgVmVjdG9yMiggVFdPX0JFQURfT0ZGU0VUICogMiwgMCApICkgKTtcclxuICAgICAgdGhpcy5jb250YWluZXJUcmFuc2xhdGlvbiA9IG5ldyBWZWN0b3IyKCAtMTEsIDEyLjk5MTQ5ODg2ODA3NDE1NyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHJvdW5kQmVhZENvdW50ID09PSAxICYmIHNxdWFyZUJlYWRDb3VudCA9PT0gMSApIHtcclxuICAgICAgdGhpcy5zaGFwZSA9IE5lY2tsYWNlTGF5b3V0LlRXT19NSVhFRF9CRUFEU19TSEFQRTtcclxuICAgICAgdGhpcy5yb3VuZEJlYWRzLnB1c2goIG5ldyBSb3VuZEJlYWQoIFZlY3RvcjIuWkVSTyApICk7XHJcbiAgICAgIHRoaXMuc3F1YXJlQmVhZHMucHVzaCggbmV3IFNxdWFyZUJlYWQoIG5ldyBWZWN0b3IyKCBUV09fQkVBRF9PRkZTRVQgKiAyLCAwICksIDAgKSApO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lclRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIC0xMSwgMTUuNzg1ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggcm91bmRCZWFkQ291bnQgPT09IDAgJiYgc3F1YXJlQmVhZENvdW50ID09PSAxICkge1xyXG4gICAgICB0aGlzLnNoYXBlID0gTmVja2xhY2VMYXlvdXQuT05FX1NRVUFSRV9CRUFEX1NIQVBFO1xyXG4gICAgICB0aGlzLnNxdWFyZUJlYWRzLnB1c2goIG5ldyBTcXVhcmVCZWFkKCBWZWN0b3IyLlpFUk8sIDAgKSApO1xyXG4gICAgICB0aGlzLmNvbnRhaW5lclRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIDAuMjM5NDczMDQwNDIwOTY2NCwgMTAuMzkwNTQyNTAxNjExODkyICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggcm91bmRCZWFkQ291bnQgPT09IDAgJiYgc3F1YXJlQmVhZENvdW50ID09PSAyICkge1xyXG4gICAgICB0aGlzLnNoYXBlID0gTmVja2xhY2VMYXlvdXQuVFdPX1NRVUFSRV9CRUFEU19TSEFQRTtcclxuICAgICAgdGhpcy5zcXVhcmVCZWFkcy5wdXNoKCBuZXcgU3F1YXJlQmVhZCggVmVjdG9yMi5aRVJPLCAwICkgKTtcclxuICAgICAgdGhpcy5zcXVhcmVCZWFkcy5wdXNoKCBuZXcgU3F1YXJlQmVhZCggbmV3IFZlY3RvcjIoIFRXT19CRUFEX09GRlNFVCAqIDIsIDAgKSwgMCApICk7XHJcbiAgICAgIHRoaXMuY29udGFpbmVyVHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggLTEwLjc1MzEyNDA0MDYyNDcwMywgMTAuNTM0MDc5NzE3Mzg5NDk5ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgbnVtQmVhZHMgPSByb3VuZEJlYWRDb3VudCArIHNxdWFyZUJlYWRDb3VudDtcclxuXHJcbiAgICAgIC8vIE51bWJlciBvZiB2ZXJ0aWNlcyBpcyBvbmUgbW9yZSB0aGFuIG51bWJlciBvZiBiZWFkcyB0byBhY2NvdW50IGZvciBhIGdhcC5cclxuICAgICAgY29uc3QgbnVtVmVydGljZXMgPSBudW1CZWFkcyArIDE7XHJcbiAgICAgIGNvbnN0IGFuZ2VsQmV0d2VlblZlcnRpY2VzID0gTWF0aC5QSSAqIDIgLyBudW1WZXJ0aWNlcztcclxuXHJcbiAgICAgIC8vIGVtcGlyaWNhbCwgbGFyZ2VyIHNwYWNpbmcgd2l0aCBvbmx5IDMgYmVhZHNcclxuICAgICAgY29uc3Qgc2lkZUxlbmd0aCA9ICggbnVtQmVhZHMgPT09IDMgPyAxLjk0IDogMS4yOCApICogQkVBRF9ESUFNRVRFUjtcclxuXHJcbiAgICAgIC8vIGNpcmN1bXJhZGl1cyBvZiB0aGUgcG9seWdvbiwgdXNlZCB0byBmaW5kIHBvbGFyIGNvb3JkaW5hdGVzIGZvciB0aGUgdmVydGljZXNcclxuICAgICAgbGV0IFIgPSAxIC8gMiAqIHNpZGVMZW5ndGggLyBNYXRoLnNpbiggTWF0aC5QSSAvIG51bVZlcnRpY2VzICk7XHJcblxyXG4gICAgICAvLyBtYWtlIGJlYWRzIGNsb3NlciB0b2dldGhlciBhcyB0aGVyZSBhcmUgbW9yZSBvZiB0aGVtXHJcbiAgICAgIGlmICggbnVtVmVydGljZXMgPD0gMjAgKSB7XHJcbiAgICAgICAgUiAqPSBVdGlscy5saW5lYXIoIDMsIFByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzLkJFQURfQ09VTlRfUkFOR0UubWF4LCAxLjUsIDEsIG51bVZlcnRpY2VzICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFVzZSByZXB1bHNpb24gb2YgcmFuZG9tIHBvaW50cyB0byBtYWtlIHRoZSBzaGFwZSBsb29rIG1vcmUgbmF0dXJhbC5cclxuICAgICAgLy8gYXBvdGhlbSBvZiB0aGUgcG9seWdvbiwgc2VlIGh0dHA6Ly93d3cubWF0aG9wZW5yZWYuY29tL2Fwb3RoZW0uaHRtbFxyXG4gICAgICBjb25zdCBhcG90aGVtID0gUiAqIE1hdGguY29zKCBNYXRoLlBJIC8gbnVtVmVydGljZXMgKTtcclxuXHJcbiAgICAgIC8vIFNjYWxlIHVwIHRoZSByZXB1bHNpb24gcG9pbnRzIHRvIG91ciBzaXplXHJcbiAgICAgIGNvbnN0IHJlcHVsc2lvblBvaW50cyA9IGdldFJlcHVsc2lvblBvaW50cyggcm91bmRCZWFkQ291bnQsIHNxdWFyZUJlYWRDb3VudCApLm1hcCggcG9pbnQgPT4gcG9pbnQudGltZXNTY2FsYXIoIGFwb3RoZW0gKSApO1xyXG5cclxuICAgICAgLy8gbG9vcCB0aHJvdWdoIHZlcnRpY2VzIGFuZCBjaGFuZ2UgYWNjb3JkaW5nIHRvIHJlcHVsc2lvbiBwb2ludHNcclxuICAgICAgY29uc3QgdmVydGljZXMgPSBbXTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtVmVydGljZXM7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBhbmdsZSA9ICggaSArIDAuNSApICogYW5nZWxCZXR3ZWVuVmVydGljZXMgLSBNYXRoLlBJIC8gMjtcclxuICAgICAgICBjb25zdCBwZXJmZWN0VmVydGV4ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggUiwgYW5nbGUgKTtcclxuICAgICAgICBsZXQgbmV3UmFkaXVzID0gUjtcclxuXHJcbiAgICAgICAgaWYgKCByb3VuZEJlYWRDb3VudCA+IDAgJiYgc3F1YXJlQmVhZENvdW50ID4gMCApIHtcclxuICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCByZXB1bHNpb24gcG9pbnRzIGFuZCBjaGFuZ2UgdGhlIHZlcnRleFxyXG4gICAgICAgICAgZm9yICggbGV0IGcgPSAwOyBnIDwgcmVwdWxzaW9uUG9pbnRzLmxlbmd0aDsgZysrICkge1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmZXJlbmNlID0gcmVwdWxzaW9uUG9pbnRzWyBnIF0uZGlzdGFuY2UoIHBlcmZlY3RWZXJ0ZXggKTtcclxuICAgICAgICAgICAgY29uc3QgYW1vdW50ID0gTWF0aC5wb3coICggYXBvdGhlbSAtIGRpZmZlcmVuY2UgKSwgMiApO1xyXG4gICAgICAgICAgICBjb25zdCBjaGFuZ2UgPSBhbW91bnQgLyBSO1xyXG4gICAgICAgICAgICBuZXdSYWRpdXMgKz0gY2hhbmdlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdmVydGV4ID0gVmVjdG9yMi5jcmVhdGVQb2xhciggbmV3UmFkaXVzLCBhbmdsZSApO1xyXG4gICAgICAgIHZlcnRpY2VzLnB1c2goIHZlcnRleCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTZXQgdXAgcGFpcnMgb2YgdmVydGljZXMgLSBiZXR3ZWVuIGVhY2ggcGFpciBvZiB2ZXJ0aWNlcyB3aWxsIGJlIGEgYmVhZFxyXG4gICAgICBjb25zdCBwYWlycyA9IFtdO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICAgICAgcGFpcnMucHVzaCggeyBzdGFydDogdmVydGljZXNbIGkgXSwgZW5kOiB2ZXJ0aWNlc1sgaSArIDEgXSB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgLy8gam9pbiBsYXN0LT5maXJzdFxyXG4gICAgICBpZiAoIHZlcnRpY2VzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgcGFpcnMucHVzaCggeyBzdGFydDogdmVydGljZXNbIHZlcnRpY2VzLmxlbmd0aCAtIDEgXSwgZW5kOiB2ZXJ0aWNlc1sgMCBdIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZ2NkID0gVXRpbHMuZ2NkKCByb3VuZEJlYWRDb3VudCwgc3F1YXJlQmVhZENvdW50ICk7XHJcbiAgICAgIGNvbnN0IHR5cGVzID0gXy5mbGF0dGVuKCBfLnJhbmdlKCAwLCBnY2QgKS5tYXAoICgpID0+IF8udGltZXMoIHNxdWFyZUJlYWRDb3VudCAvIGdjZCwgKCkgPT4gJ3NxdWFyZScgKS5jb25jYXQoXHJcbiAgICAgICAgXy50aW1lcyggcm91bmRCZWFkQ291bnQgLyBnY2QsICgpID0+ICdyb3VuZCcgKSApICkgKTtcclxuXHJcbiAgICAgIC8vIEJldHdlZW4gZWFjaCBwYWlyIG9mIHZlcnRpY2VzLCB3ZSBtdXN0IHB1dCBhIGJlYWQgaW4gdGhlIGNlbnRlclxyXG4gICAgICBjb25zdCBjZW50ZXJzID0gW107XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IHBhaXIgPSBwYWlyc1sgaSBdO1xyXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHBhaXIuc3RhcnQuYmxlbmQoIHBhaXIuZW5kLCAwLjUgKTtcclxuICAgICAgICBjZW50ZXJzLnB1c2goIGNlbnRlciApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGaW5kIHRoZSBzaG9ydGVzdCBkaXN0YW5jZSBiZXR3ZWVuIGFueSB0d28gY2VudGVyc1xyXG4gICAgICBsZXQgbWluU2lkZUxlbmd0aCA9IGNlbnRlcnNbIGNlbnRlcnMubGVuZ3RoIC0gMSBdLmRpc3RhbmNlKCBjZW50ZXJzWyAwIF0gKTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgY2VudGVycy5sZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgbmV3TGVuZ3RoID0gY2VudGVyc1sgaSBdLmRpc3RhbmNlKCBjZW50ZXJzWyBpICsgMSBdICk7XHJcbiAgICAgICAgaWYgKCBuZXdMZW5ndGggPCBtaW5TaWRlTGVuZ3RoICkge1xyXG4gICAgICAgICAgbWluU2lkZUxlbmd0aCA9IG5ld0xlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlc2l6ZSBuZWNrbGFjZSB0byBiZSBzbWFsbGVyIHNvIGJlYWRzIGFyZSBjbG9zZXIgdG9nZXRoZXJcclxuICAgICAgY29uc3QgcmFkaXVzU2NhbGUgPSBCRUFEX0RJQU1FVEVSIC8gbWluU2lkZUxlbmd0aDtcclxuXHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNlbnRlcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3Qgb2xkQ2VudGVyID0gY2VudGVyc1sgaSBdO1xyXG5cclxuICAgICAgICAvLyBBZGQgNSB0byB0aGUgcmFkaXVzIHRvIGdpdmUgc29tZSBtb3JlIHNwYWNlIGJldHdlZW4gYmVhZHNcclxuICAgICAgICBjb25zdCBleHRyYVNwYWNlID0gMC4yOCAqIEJFQURfRElBTUVURVI7XHJcbiAgICAgICAgY2VudGVyc1sgaSBdID0gVmVjdG9yMi5jcmVhdGVQb2xhciggcmFkaXVzU2NhbGUgKiBvbGRDZW50ZXIubWFnbml0dWRlICsgZXh0cmFTcGFjZSwgb2xkQ2VudGVyLmFuZ2xlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBjZW50ZXI7XHJcbiAgICAgIGxldCBhbmdsZTtcclxuXHJcbiAgICAgIC8vIEluc3RhbnRpYXRlIHRoZSBiZWFkcyBiZXR3ZWVuIGVhY2ggdmVydGV4XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNlbnRlcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY2VudGVyID0gY2VudGVyc1sgaSBdO1xyXG4gICAgICAgIGFuZ2xlID0gcGFpcnNbIGkgXS5lbmQubWludXMoIHBhaXJzWyBpIF0uc3RhcnQgKS5hbmdsZTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGEgYmVhZCBpZiBpdCBpcyBub3QgdGhlIGxhc3QgcGFpclxyXG4gICAgICAgIGlmICggaSAhPT0gY2VudGVycy5sZW5ndGggLSAxICkge1xyXG4gICAgICAgICAgaWYgKCB0eXBlc1sgaSBdID09PSAncm91bmQnICkge1xyXG4gICAgICAgICAgICB0aGlzLnJvdW5kQmVhZHMucHVzaCggbmV3IFJvdW5kQmVhZCggY2VudGVyICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNxdWFyZUJlYWRzLnB1c2goIG5ldyBTcXVhcmVCZWFkKCBjZW50ZXIsIGFuZ2xlICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIGl0IGlzIHRoZSBsYXN0IHBhaXIsIG1vdmUgY2VudGVyIGZ1cnRoZXIgYXdheSBmb3IgYSBjdXJ2ZWQgZ2FwLlxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY2VudGVyc1sgaSBdID0gY2VudGVyLmFkZFhZKCAxNSAqIE1hdGguY29zKCBjZW50ZXIuYW5nbGUgKSwgMTUgKiBNYXRoLnNpbiggY2VudGVyLmFuZ2xlICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRoZSBibGFjayBsaW5lIG9mIHRoZSBuZWNrbGFjZVxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjZW50ZXJzLmxlbmd0aCAtIDE7IGkrKyApIHtcclxuICAgICAgICBjZW50ZXIgPSBjZW50ZXJzWyBpIF07XHJcblxyXG4gICAgICAgIC8vIEhhdmUgdGhlIGxhc3QgYmVhZCBjb25uZWN0IHRvIHRoZSBmaXJzdCBiZWFkLlxyXG4gICAgICAgIGNvbnN0IG5leHRDZW50ZXIgPSBpID09PSBjZW50ZXJzLmxlbmd0aCAtIDIgPyBjZW50ZXJzWyAwIF0gOiBjZW50ZXJzWyBpICsgMSBdO1xyXG5cclxuICAgICAgICAvLyB0aGUgbW9yZSB2ZXJ0aWNlcywgdGhlIGxlc3MgY3VydmVkIHRoZSBuZWNrbGFjZSBsaW5lIGNvbm5lY3RpbmcgdG8gZWFjaCBiZWFkXHJcbiAgICAgICAgY29uc3Qgc3RyZW5ndGggPSAyMCAvIG51bVZlcnRpY2VzICsgMjtcclxuXHJcbiAgICAgICAgLy8gY29udHJvbCBwb2ludCBmb3IgdGhlIHF1YWRyYXRpYyBjdXJ2ZVxyXG4gICAgICAgIGxldCBjb250cm9sID0gY2VudGVyLmJsZW5kKCBuZXh0Q2VudGVyLCAwLjUgKTtcclxuXHJcbiAgICAgICAgLy8gY3VydmUgbmVja2xhY2UgbGluZSBiYXNlZCBvbiBhIGNlcnRhaW4gZGVncmVlIG9mIHN0cmVuZ3RoXHJcbiAgICAgICAgY29udHJvbC5hZGRYWSggc3RyZW5ndGggKiBNYXRoLmNvcyggY29udHJvbC5hbmdsZSApLCBzdHJlbmd0aCAqIE1hdGguc2luKCBjb250cm9sLmFuZ2xlICkgKTtcclxuXHJcbiAgICAgICAgLy8gZ2FwIGlzIG1vcmUgY3VydmVkL2J1bXB5IHRoYW4gdGhlIHJlc3Qgb2YgdGhlIGJsYWNrIGxpbmVcclxuICAgICAgICBpZiAoIGkgPT09IGNlbnRlcnMubGVuZ3RoIC0gMiApIHtcclxuICAgICAgICAgIGNvbnRyb2wgPSBjZW50ZXJzWyBjZW50ZXJzLmxlbmd0aCAtIDEgXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2hhcGUubW92ZVRvUG9pbnQoIGNlbnRlciApO1xyXG4gICAgICAgIHRoaXMuc2hhcGUucXVhZHJhdGljQ3VydmVUb1BvaW50KCBjb250cm9sLCBuZXh0Q2VudGVyICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuc2hhcGUubWFrZUltbXV0YWJsZSgpO1xyXG5cclxuICAgICAgdGhpcy5jb250YWluZXJUcmFuc2xhdGlvbiA9ICggcm91bmRCZWFkQ291bnQgKyBzcXVhcmVCZWFkQ291bnQgPT09IDMgKSA/IG5ldyBWZWN0b3IyKCAwLCAtNSApIDogVmVjdG9yMi5aRVJPO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSB7TmVja2xhY2VMYXlvdXR9IGNvcnJlc3BvbmRpbmcgdG8gdGhlIG51bWJlciBvZiByb3VuZC9zcXVhcmUgYmVhZHMgKGxhemlseSBjb21wdXRlZCBhbmQgY2FjaGVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcm91bmRCZWFkQ291bnQgLSBOdW1iZXIgb2Ygcm91bmQgYmVhZHMgaW4gdGhlIG5lY2tsYWNlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNxdWFyZUJlYWRDb3VudCAtIE51bWJlciBvZiBzcXVhcmUgYmVhZHMgaW4gdGhlIG5lY2tsYWNlXHJcbiAgICogQHJldHVybnMge05lY2tsYWNlTGF5b3V0fVxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRMYXlvdXQoIHJvdW5kQmVhZENvdW50LCBzcXVhcmVCZWFkQ291bnQgKSB7XHJcblxyXG4gICAgY29uc3Qga2V5ID0gYCR7cm91bmRCZWFkQ291bnR9LCR7c3F1YXJlQmVhZENvdW50fWA7XHJcbiAgICBpZiAoIGxheW91dE1hcFsga2V5IF0gKSB7XHJcbiAgICAgIHJldHVybiBsYXlvdXRNYXBbIGtleSBdO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBOZWNrbGFjZUxheW91dCggcm91bmRCZWFkQ291bnQsIHNxdWFyZUJlYWRDb3VudCApO1xyXG4gICAgbGF5b3V0TWFwWyBrZXkgXSA9IHJlc3VsdDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLyoqXHJcbiAqIHtTaGFwZX0gLSBJbW11dGFibGUgc2hhcmVkIHN0cmluZyBzaGFwZSBmb3Igd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSByb3VuZCBiZWFkLlxyXG4gKi9cclxuTmVja2xhY2VMYXlvdXQuT05FX1JPVU5EX0JFQURfU0hBUEUgPSBzaGFwZUZyb21TcGxpbnRQb2ludHMoIFtcclxuICBuZXcgVmVjdG9yMiggMC4zOCAqIEJFQURfRElBTUVURVIsIDAuMDUgKiBCRUFEX0RJQU1FVEVSICksXHJcbiAgbmV3IFZlY3RvcjIoIC0wLjM4ICogQkVBRF9ESUFNRVRFUiwgMC4wNSAqIEJFQURfRElBTUVURVIgKSxcclxuICBuZXcgVmVjdG9yMiggLTAuNzIgKiBCRUFEX0RJQU1FVEVSLCAtMS41ICogQkVBRF9ESUFNRVRFUiApLFxyXG4gIG5ldyBWZWN0b3IyKCAwLjUgKiBCRUFEX0RJQU1FVEVSLCAtMS41NSAqIEJFQURfRElBTUVURVIgKVxyXG5dICk7XHJcblxyXG4vKipcclxuICoge1NoYXBlfSAtIEltbXV0YWJsZSBzaGFyZWQgc3RyaW5nIHNoYXBlIGZvciB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHNxdWFyZSBiZWFkLlxyXG4gKi9cclxuTmVja2xhY2VMYXlvdXQuT05FX1NRVUFSRV9CRUFEX1NIQVBFID0gc2hhcGVGcm9tU3BsaW50UG9pbnRzKCBbXHJcbiAgbmV3IFZlY3RvcjIoIDAuNTUgKiBCRUFEX0RJQU1FVEVSLCAwICksXHJcbiAgbmV3IFZlY3RvcjIoIC0wLjYxICogQkVBRF9ESUFNRVRFUiwgMCApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMC42NiAqIEJFQURfRElBTUVURVIsIC0xLjMzICogQkVBRF9ESUFNRVRFUiApLFxyXG4gIG5ldyBWZWN0b3IyKCAwLjY2ICogQkVBRF9ESUFNRVRFUiwgLTEuMzMgKiBCRUFEX0RJQU1FVEVSIClcclxuXSApO1xyXG5cclxuLyoqXHJcbiAqIHtTaGFwZX0gLSBJbW11dGFibGUgc2hhcmVkIHN0cmluZyBzaGFwZSBmb3Igd2hlbiB0aGVyZSBhcmUgb25seSB0d28gcm91bmQgYmVhZHMuXHJcbiAqIFByZXZpb3VzIGRvYzogXCJpZiBhbGwgcm91bmQgYmVhZHMsIGRyYXcgdGhlIHNhbWUgc2hhcGUgYXMgdHdlbnR5IHJvdW5kIGJlYWRzXCIsIG1heSBub3QgYmUgYWNjdXJhdGUuXHJcbiAqL1xyXG5OZWNrbGFjZUxheW91dC5UV09fUk9VTkRfQkVBRFNfU0hBUEUgPSBzaGFwZUZyb21TcGxpbnRQb2ludHMoIFtcclxuICBuZXcgVmVjdG9yMiggMC41NSAqIEJFQURfRElBTUVURVIgKyBUV09fQkVBRF9PRkZTRVQsIDAuMDUgKiBCRUFEX0RJQU1FVEVSICksXHJcbiAgbmV3IFZlY3RvcjIoIC0wLjU1ICogQkVBRF9ESUFNRVRFUiArIFRXT19CRUFEX09GRlNFVCwgMC4wNSAqIEJFQURfRElBTUVURVIgKSxcclxuICBuZXcgVmVjdG9yMiggLTAuNzggKiBCRUFEX0RJQU1FVEVSICsgVFdPX0JFQURfT0ZGU0VULCAtMS41ICogQkVBRF9ESUFNRVRFUiApLFxyXG4gIG5ldyBWZWN0b3IyKCAwLjU1ICogQkVBRF9ESUFNRVRFUiArIFRXT19CRUFEX09GRlNFVCwgLTEuNjEgKiBCRUFEX0RJQU1FVEVSIClcclxuXSApO1xyXG5cclxuLyoqXHJcbiAqIHtTaGFwZX0gLSBJbW11dGFibGUgc2hhcmVkIHN0cmluZyBzaGFwZSBmb3Igd2hlbiB0aGVyZSBhcmUgb25seSB0d28gc3F1YXJlIGJlYWRzLlxyXG4gKiBQcmV2aW91cyBkb2M6IFwiaWYgYWxsIHNxdWFyZSBiZWFkcywgZHJhdyB0aGUgc2FtZSBzaGFwZSBhcyB0d2VudHkgc3F1YXJlIGJlYWRzXCIsIG1heSBub3QgYmUgYWNjdXJhdGUuXHJcbiAqL1xyXG5OZWNrbGFjZUxheW91dC5UV09fU1FVQVJFX0JFQURTX1NIQVBFID0gc2hhcGVGcm9tU3BsaW50UG9pbnRzKCBbXHJcbiAgbmV3IFZlY3RvcjIoIDAuNjEgKiBCRUFEX0RJQU1FVEVSICsgVFdPX0JFQURfT0ZGU0VULCAwICksXHJcbiAgbmV3IFZlY3RvcjIoIC0wLjY2ICogQkVBRF9ESUFNRVRFUiArIFRXT19CRUFEX09GRlNFVCwgMCApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMC43MSAqIEJFQURfRElBTUVURVIgKyBUV09fQkVBRF9PRkZTRVQsIC0xLjM5ICogQkVBRF9ESUFNRVRFUiApLFxyXG4gIG5ldyBWZWN0b3IyKCAwLjcxICogQkVBRF9ESUFNRVRFUiArIFRXT19CRUFEX09GRlNFVCwgLTEuMjkgKiBCRUFEX0RJQU1FVEVSIClcclxuXSApO1xyXG5cclxuLyoqXHJcbiAqIHtTaGFwZX0gLSBJbW11dGFibGUgc2hhcmVkIHN0cmluZyBzaGFwZSBmb3Igd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSBiZWFkIG9mIGVhY2ggdHlwZS5cclxuICogUHJldmlvdXMgZG9jOiBcImlmIG9uZSBiZWFkIG9mIGVhY2gga2luZCwgZHJhdyBzYW1lIHNoYXBlIGFzIHR3ZW50eSByb3VuZCBhbmQgdHdlbnR5IHNxdWFyZSBiZWFkc1wiLCBtYXkgbm90IGJlXHJcbiAqIGFjY3VyYXRlLlxyXG4gKi9cclxuTmVja2xhY2VMYXlvdXQuVFdPX01JWEVEX0JFQURTX1NIQVBFID0gc2hhcGVGcm9tU3BsaW50UG9pbnRzKCBbXHJcbiAgbmV3IFZlY3RvcjIoIFRXT19CRUFEX09GRlNFVCwgNSApLFxyXG4gIG5ldyBWZWN0b3IyKCAtMS4xMSAqIEJFQURfRElBTUVURVIgKyBUV09fQkVBRF9PRkZTRVQsIC0wLjk0ICogQkVBRF9ESUFNRVRFUiApLFxyXG4gIG5ldyBWZWN0b3IyKCBUV09fQkVBRF9PRkZTRVQsIC0yLjIyICogQkVBRF9ESUFNRVRFUiApLFxyXG4gIG5ldyBWZWN0b3IyKCAxLjExICogQkVBRF9ESUFNRVRFUiArIFRXT19CRUFEX09GRlNFVCwgLTAuOTQgKiBCRUFEX0RJQU1FVEVSIClcclxuXSApO1xyXG5cclxucHJvcG9ydGlvblBsYXlncm91bmQucmVnaXN0ZXIoICdOZWNrbGFjZUxheW91dCcsIE5lY2tsYWNlTGF5b3V0ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBOZWNrbGFjZUxheW91dDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsU0FBU0MsS0FBSyxRQUFRLG1DQUFtQztBQUN6RCxPQUFPQyxvQkFBb0IsTUFBTSxrQ0FBa0M7QUFDbkUsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBQ2xGLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjs7QUFFeEM7QUFDQSxNQUFNQyxhQUFhLEdBQUdILDZCQUE2QixDQUFDRyxhQUFhOztBQUVqRTtB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