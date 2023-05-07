// Copyright 2019-2020, University of Colorado Boulder

/**
 * reverseRobinsonProjector is a singleton that takes a normalized X Y coordinate on a Robinson projection of the Earth
 * and converts it to latitude and longitude values based on the definition of a Robinson projection.
 *
 * @author Arnab Purkayastha
 * @author John Blanco (PhET Interactive Simulations)
 */

import numberLineIntegers from '../../numberLineIntegers.js';

const reverseRobinsonProjector = {

  /**
   * Get the latitude and longitude associated with the normalized x and y values.  The x and y values are taken from
   * a position on a map image where the point (0,0) is in the center of the map and the max values in both the x or y
   * directions are 0.5, thus leading to a span of 1 in both the horizontal and vertical directions.  This is a purely
   * computational way to implement the algorithm, see
   * https://vdocuments.site/a-computational-approach-to-the-robinson-projection.html or, if that link goes dead,
   * search on "A Computational Approach to the Robinson Projection".
   * @param {number} x
   * @param {number} y
   * @returns {{latitude: {number}, longitude: {number}}}
   * @public
   */
  xyToLatLong( x, y ) {

    // NOTE to future maintainers: There are a lot of "magic numbers" in this method, meaning numbers whose values are
    // used without any explanation.  These values are all taken from the example and paper referenced in the JSDoc
    // header comment for this method.

    const relativeX = Math.abs( x );
    const relativeY = Math.abs( 0.5072 * y );

    const sphereRadius = 1.178 / ( 2 * Math.PI );
    const thisBStar = relativeY / sphereRadius;
    let thisAStar = 0;
    for ( let i = 0; i <= 18; i++ ) {
      thisAStar += mValues[ i ] * Math.abs( BStarValues[ i ] - thisBStar );
    }

    const long = relativeX / ( sphereRadius * thisAStar );

    let lat = 0;
    for ( let i = 0; i <= 18; i++ ) {
      lat += nValues[ i ] * Math.sqrt(
        Math.pow( AStarValues[ i ] - thisAStar, 2 ) +
        Math.pow( BStarValues[ i ] - thisBStar, 2 )
      );
    }

    const latitudeInRadians = y > 0 ? lat : -lat;
    const longitudeInRadians = x > 0 ? long : -long;

    return {
      latitude: latitudeInRadians / Math.PI * 180,
      longitude: longitudeInRadians / Math.PI * 180
    };
  }
};

const AStarValues = [
  0.84870000, 0.84751182, 0.84479598,
  0.84021300, 0.83359314, 0.82578510,
  0.81475200, 0.80006949, 0.78216192,
  0.76060494, 0.73658673, 0.70866450,
  0.67777182, 0.64475739, 0.60987582,
  0.57134484, 0.52729731, 0.48562614,
  0.45167814
];

const BStarValues = [
  0.00000000, 0.08384260, 0.16768520,
  0.25152780, 0.33537040, 0.41921300,
  0.50305560, 0.58689820, 0.67047034,
  0.75336633, 0.83518048, 0.91537187,
  0.99339958, 1.06872269, 1.14066505,
  1.20841528, 1.27035062, 1.31998003,
  1.35230000
];

const mValues = [
  0.4737166113, -0.00911028522, -0.01113479305,
  -0.01214704697, -0.00708577740, -0.01923282436,
  -0.02176345915, -0.01957843209, -0.02288586729,
  -0.01676092031, -0.02731224791, -0.02386224240,
  -0.02119239013, -0.02327513775, -0.04193330922,
  -0.07123235442, -0.06423048161, -0.10536278437,
  1.00598851957
];

const nValues = [
  1.07729625255, -0.00012324928, -0.00032923415,
  -0.00056627609, -0.00045168290, -0.00141388769,
  -0.00211521349, -0.00083658786, 0.00073523299,
  0.00349045186, 0.00502041018, 0.00860101415,
  0.01281238969, 0.01794606372, 0.02090220870,
  0.02831504310, 0.11177176318, 0.28108668066,
  -0.45126573496
];

numberLineIntegers.register( 'reverseRobinsonProjector', reverseRobinsonProjector );
export default reverseRobinsonProjector;