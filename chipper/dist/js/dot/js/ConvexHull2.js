// Copyright 2013-2023, University of Colorado Boulder

/**
 * Construction of 2D convex hulls from a list of points.
 *
 * For example:
 * #begin canvasExample grahamScan 256x128
 * #on
 * var points = _.range( 50 ).map( function() {
 *   return new phet.dot.Vector2( 5 + ( 256 - 10 ) * Math.random(), 5 + ( 128 - 10 ) * Math.random() );
 * } );
 * var hullPoints = phet.dot.ConvexHull2.grahamScan( points, false );
 * #off
 * context.beginPath();
 * hullPoints.forEach( function( point ) {
 *   context.lineTo( point.x, point.y );
 * } );
 * context.closePath();
 * context.fillStyle = '#eee';
 * context.fill();
 * context.strokeStyle = '#f00';
 * context.stroke();
 *
 * context.beginPath();
 * points.forEach( function( point ) {
 *   context.arc( point.x, point.y, 2, 0, Math.PI * 2, false );
 *   context.closePath();
 * } );
 * context.fillStyle = '#00f';
 * context.fill();
 * #end canvasExample
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import dot from './dot.js';

/**
 * counter-clockwise turn if > 0, clockwise turn if < 0, collinear if === 0.
 * @param {Vector2} p1
 * @param {Vector2} p2
 * @param {Vector2} p3
 * @returns {number}
 */
function ccw(p1, p2, p3) {
  return p2.minus(p1).crossScalar(p3.minus(p1));
}
const ConvexHull2 = {
  // TODO testing: all collinear, multiple ways of having same angle, etc.

  /**
   * Given multiple points, this performs a Graham Scan (http://en.wikipedia.org/wiki/Graham_scan) to identify an
   * ordered list of points which define the minimal polygon that contains all of the points.
   * @public
   *
   * @param {Array.<Vector2>} points
   * @param {boolean} includeCollinear - If a point is along an edge of the convex hull (not at one of its vertices),
   *                                     should it be included?
   * @returns {Array.<Vector2>}
   */
  grahamScan: (points, includeCollinear) => {
    if (points.length <= 2) {
      return points;
    }

    // find the point 'p' with the lowest y value
    let minY = Number.POSITIVE_INFINITY;
    let p = null;
    _.each(points, point => {
      if (point.y <= minY) {
        // if two points have the same y value, take the one with the lowest x
        if (point.y === minY && p) {
          if (point.x < p.x) {
            p = point;
          }
        } else {
          minY = point.y;
          p = point;
        }
      }
    });

    // sorts the points by their angle. Between 0 and PI
    points = _.sortBy(points, point => {
      return point.minus(p).angle;
    });

    // remove p from points (relies on the above statement making a defensive copy)
    points.splice(_.indexOf(points, p), 1);

    // our result array
    const result = [p];
    _.each(points, point => {
      // ignore points equal to our starting point
      if (p.x === point.x && p.y === point.y) {
        return;
      }
      function isRightTurn() {
        if (result.length < 2) {
          return false;
        }
        const cross = ccw(result[result.length - 2], result[result.length - 1], point);
        return includeCollinear ? cross < 0 : cross <= 0;
      }
      while (isRightTurn()) {
        result.pop();
      }
      result.push(point);
    });
    return result;
  }
};
dot.register('ConvexHull2', ConvexHull2);
export default ConvexHull2;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3QiLCJjY3ciLCJwMSIsInAyIiwicDMiLCJtaW51cyIsImNyb3NzU2NhbGFyIiwiQ29udmV4SHVsbDIiLCJncmFoYW1TY2FuIiwicG9pbnRzIiwiaW5jbHVkZUNvbGxpbmVhciIsImxlbmd0aCIsIm1pblkiLCJOdW1iZXIiLCJQT1NJVElWRV9JTkZJTklUWSIsInAiLCJfIiwiZWFjaCIsInBvaW50IiwieSIsIngiLCJzb3J0QnkiLCJhbmdsZSIsInNwbGljZSIsImluZGV4T2YiLCJyZXN1bHQiLCJpc1JpZ2h0VHVybiIsImNyb3NzIiwicG9wIiwicHVzaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29udmV4SHVsbDIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29uc3RydWN0aW9uIG9mIDJEIGNvbnZleCBodWxscyBmcm9tIGEgbGlzdCBvZiBwb2ludHMuXHJcbiAqXHJcbiAqIEZvciBleGFtcGxlOlxyXG4gKiAjYmVnaW4gY2FudmFzRXhhbXBsZSBncmFoYW1TY2FuIDI1NngxMjhcclxuICogI29uXHJcbiAqIHZhciBwb2ludHMgPSBfLnJhbmdlKCA1MCApLm1hcCggZnVuY3Rpb24oKSB7XHJcbiAqICAgcmV0dXJuIG5ldyBwaGV0LmRvdC5WZWN0b3IyKCA1ICsgKCAyNTYgLSAxMCApICogTWF0aC5yYW5kb20oKSwgNSArICggMTI4IC0gMTAgKSAqIE1hdGgucmFuZG9tKCkgKTtcclxuICogfSApO1xyXG4gKiB2YXIgaHVsbFBvaW50cyA9IHBoZXQuZG90LkNvbnZleEh1bGwyLmdyYWhhbVNjYW4oIHBvaW50cywgZmFsc2UgKTtcclxuICogI29mZlxyXG4gKiBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gKiBodWxsUG9pbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBwb2ludCApIHtcclxuICogICBjb250ZXh0LmxpbmVUbyggcG9pbnQueCwgcG9pbnQueSApO1xyXG4gKiB9ICk7XHJcbiAqIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAqIGNvbnRleHQuZmlsbFN0eWxlID0gJyNlZWUnO1xyXG4gKiBjb250ZXh0LmZpbGwoKTtcclxuICogY29udGV4dC5zdHJva2VTdHlsZSA9ICcjZjAwJztcclxuICogY29udGV4dC5zdHJva2UoKTtcclxuICpcclxuICogY29udGV4dC5iZWdpblBhdGgoKTtcclxuICogcG9pbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBwb2ludCApIHtcclxuICogICBjb250ZXh0LmFyYyggcG9pbnQueCwgcG9pbnQueSwgMiwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICk7XHJcbiAqICAgY29udGV4dC5jbG9zZVBhdGgoKTtcclxuICogfSApO1xyXG4gKiBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMDBmJztcclxuICogY29udGV4dC5maWxsKCk7XHJcbiAqICNlbmQgY2FudmFzRXhhbXBsZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdCBmcm9tICcuL2RvdC5qcyc7XHJcblxyXG4vKipcclxuICogY291bnRlci1jbG9ja3dpc2UgdHVybiBpZiA+IDAsIGNsb2Nrd2lzZSB0dXJuIGlmIDwgMCwgY29sbGluZWFyIGlmID09PSAwLlxyXG4gKiBAcGFyYW0ge1ZlY3RvcjJ9IHAxXHJcbiAqIEBwYXJhbSB7VmVjdG9yMn0gcDJcclxuICogQHBhcmFtIHtWZWN0b3IyfSBwM1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gKi9cclxuZnVuY3Rpb24gY2N3KCBwMSwgcDIsIHAzICkge1xyXG4gIHJldHVybiBwMi5taW51cyggcDEgKS5jcm9zc1NjYWxhciggcDMubWludXMoIHAxICkgKTtcclxufVxyXG5cclxuY29uc3QgQ29udmV4SHVsbDIgPSB7XHJcbiAgLy8gVE9ETyB0ZXN0aW5nOiBhbGwgY29sbGluZWFyLCBtdWx0aXBsZSB3YXlzIG9mIGhhdmluZyBzYW1lIGFuZ2xlLCBldGMuXHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIG11bHRpcGxlIHBvaW50cywgdGhpcyBwZXJmb3JtcyBhIEdyYWhhbSBTY2FuIChodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0dyYWhhbV9zY2FuKSB0byBpZGVudGlmeSBhblxyXG4gICAqIG9yZGVyZWQgbGlzdCBvZiBwb2ludHMgd2hpY2ggZGVmaW5lIHRoZSBtaW5pbWFsIHBvbHlnb24gdGhhdCBjb250YWlucyBhbGwgb2YgdGhlIHBvaW50cy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0FycmF5LjxWZWN0b3IyPn0gcG9pbnRzXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlQ29sbGluZWFyIC0gSWYgYSBwb2ludCBpcyBhbG9uZyBhbiBlZGdlIG9mIHRoZSBjb252ZXggaHVsbCAobm90IGF0IG9uZSBvZiBpdHMgdmVydGljZXMpLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBpdCBiZSBpbmNsdWRlZD9cclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPFZlY3RvcjI+fVxyXG4gICAqL1xyXG4gIGdyYWhhbVNjYW46ICggcG9pbnRzLCBpbmNsdWRlQ29sbGluZWFyICkgPT4ge1xyXG4gICAgaWYgKCBwb2ludHMubGVuZ3RoIDw9IDIgKSB7XHJcbiAgICAgIHJldHVybiBwb2ludHM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCB0aGUgcG9pbnQgJ3AnIHdpdGggdGhlIGxvd2VzdCB5IHZhbHVlXHJcbiAgICBsZXQgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuICAgIGxldCBwID0gbnVsbDtcclxuICAgIF8uZWFjaCggcG9pbnRzLCBwb2ludCA9PiB7XHJcbiAgICAgIGlmICggcG9pbnQueSA8PSBtaW5ZICkge1xyXG4gICAgICAgIC8vIGlmIHR3byBwb2ludHMgaGF2ZSB0aGUgc2FtZSB5IHZhbHVlLCB0YWtlIHRoZSBvbmUgd2l0aCB0aGUgbG93ZXN0IHhcclxuICAgICAgICBpZiAoIHBvaW50LnkgPT09IG1pblkgJiYgcCApIHtcclxuICAgICAgICAgIGlmICggcG9pbnQueCA8IHAueCApIHtcclxuICAgICAgICAgICAgcCA9IHBvaW50O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIG1pblkgPSBwb2ludC55O1xyXG4gICAgICAgICAgcCA9IHBvaW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNvcnRzIHRoZSBwb2ludHMgYnkgdGhlaXIgYW5nbGUuIEJldHdlZW4gMCBhbmQgUElcclxuICAgIHBvaW50cyA9IF8uc29ydEJ5KCBwb2ludHMsIHBvaW50ID0+IHtcclxuICAgICAgcmV0dXJuIHBvaW50Lm1pbnVzKCBwICkuYW5nbGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlIHAgZnJvbSBwb2ludHMgKHJlbGllcyBvbiB0aGUgYWJvdmUgc3RhdGVtZW50IG1ha2luZyBhIGRlZmVuc2l2ZSBjb3B5KVxyXG4gICAgcG9pbnRzLnNwbGljZSggXy5pbmRleE9mKCBwb2ludHMsIHAgKSwgMSApO1xyXG5cclxuICAgIC8vIG91ciByZXN1bHQgYXJyYXlcclxuICAgIGNvbnN0IHJlc3VsdCA9IFsgcCBdO1xyXG5cclxuICAgIF8uZWFjaCggcG9pbnRzLCBwb2ludCA9PiB7XHJcbiAgICAgIC8vIGlnbm9yZSBwb2ludHMgZXF1YWwgdG8gb3VyIHN0YXJ0aW5nIHBvaW50XHJcbiAgICAgIGlmICggcC54ID09PSBwb2ludC54ICYmIHAueSA9PT0gcG9pbnQueSApIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBpc1JpZ2h0VHVybigpIHtcclxuICAgICAgICBpZiAoIHJlc3VsdC5sZW5ndGggPCAyICkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBjcm9zcyA9IGNjdyggcmVzdWx0WyByZXN1bHQubGVuZ3RoIC0gMiBdLCByZXN1bHRbIHJlc3VsdC5sZW5ndGggLSAxIF0sIHBvaW50ICk7XHJcbiAgICAgICAgcmV0dXJuIGluY2x1ZGVDb2xsaW5lYXIgPyAoIGNyb3NzIDwgMCApIDogKCBjcm9zcyA8PSAwICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHdoaWxlICggaXNSaWdodFR1cm4oKSApIHtcclxuICAgICAgICByZXN1bHQucG9wKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmVzdWx0LnB1c2goIHBvaW50ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9XHJcbn07XHJcblxyXG5kb3QucmVnaXN0ZXIoICdDb252ZXhIdWxsMicsIENvbnZleEh1bGwyICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb252ZXhIdWxsMjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsR0FBRyxNQUFNLFVBQVU7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBU0MsR0FBR0EsQ0FBRUMsRUFBRSxFQUFFQyxFQUFFLEVBQUVDLEVBQUUsRUFBRztFQUN6QixPQUFPRCxFQUFFLENBQUNFLEtBQUssQ0FBRUgsRUFBRyxDQUFDLENBQUNJLFdBQVcsQ0FBRUYsRUFBRSxDQUFDQyxLQUFLLENBQUVILEVBQUcsQ0FBRSxDQUFDO0FBQ3JEO0FBRUEsTUFBTUssV0FBVyxHQUFHO0VBQ2xCOztFQUVBO0FBQ0Y7QUFDQTtB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