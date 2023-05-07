// Copyright 2018, University of Colorado Boulder

/**
 * git rev-parse
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const assert = require('assert');

/**
 * Gets a single commit for a given query
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} query
 * @returns {Promise.<string>} - Resolves to the SHA.
 */
module.exports = function (repo, query) {
  assert(typeof repo === 'string');
  assert(typeof query === 'string');
  return execute('git', ['rev-parse', query], `../${repo}`).then(stdout => {
    const sha = stdout.trim();
    if (sha.length === 0) {
      return Promise.reject(new Error('No matching SHA'));
    } else if (sha.length > 40) {
      return Promise.reject(new Error('Potentially multiple SHAs returned'));
    } else {
      return Promise.resolve(sha);
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImFzc2VydCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwicXVlcnkiLCJ0aGVuIiwic3Rkb3V0Iiwic2hhIiwidHJpbSIsImxlbmd0aCIsIlByb21pc2UiLCJyZWplY3QiLCJFcnJvciIsInJlc29sdmUiXSwic291cmNlcyI6WyJnaXRSZXZQYXJzZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogZ2l0IHJldi1wYXJzZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICk7XHJcbmNvbnN0IGFzc2VydCA9IHJlcXVpcmUoICdhc3NlcnQnICk7XHJcblxyXG4vKipcclxuICogR2V0cyBhIHNpbmdsZSBjb21taXQgZm9yIGEgZ2l2ZW4gcXVlcnlcclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5XHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFJlc29sdmVzIHRvIHRoZSBTSEEuXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCByZXBvLCBxdWVyeSApIHtcclxuICBhc3NlcnQoIHR5cGVvZiByZXBvID09PSAnc3RyaW5nJyApO1xyXG4gIGFzc2VydCggdHlwZW9mIHF1ZXJ5ID09PSAnc3RyaW5nJyApO1xyXG5cclxuICByZXR1cm4gZXhlY3V0ZSggJ2dpdCcsIFsgJ3Jldi1wYXJzZScsIHF1ZXJ5IF0sIGAuLi8ke3JlcG99YCApLnRoZW4oIHN0ZG91dCA9PiB7XHJcbiAgICBjb25zdCBzaGEgPSBzdGRvdXQudHJpbSgpO1xyXG4gICAgaWYgKCBzaGEubGVuZ3RoID09PSAwICkge1xyXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoIG5ldyBFcnJvciggJ05vIG1hdGNoaW5nIFNIQScgKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHNoYS5sZW5ndGggPiA0MCApIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KCBuZXcgRXJyb3IoICdQb3RlbnRpYWxseSBtdWx0aXBsZSBTSEFzIHJldHVybmVkJyApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSggc2hhICk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsT0FBTyxHQUFHQyxPQUFPLENBQUUsV0FBWSxDQUFDO0FBQ3RDLE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFFLFFBQVMsQ0FBQzs7QUFFbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRSxNQUFNLENBQUNDLE9BQU8sR0FBRyxVQUFVQyxJQUFJLEVBQUVDLEtBQUssRUFBRztFQUN2Q0osTUFBTSxDQUFFLE9BQU9HLElBQUksS0FBSyxRQUFTLENBQUM7RUFDbENILE1BQU0sQ0FBRSxPQUFPSSxLQUFLLEtBQUssUUFBUyxDQUFDO0VBRW5DLE9BQU9OLE9BQU8sQ0FBRSxLQUFLLEVBQUUsQ0FBRSxXQUFXLEVBQUVNLEtBQUssQ0FBRSxFQUFHLE1BQUtELElBQUssRUFBRSxDQUFDLENBQUNFLElBQUksQ0FBRUMsTUFBTSxJQUFJO0lBQzVFLE1BQU1DLEdBQUcsR0FBR0QsTUFBTSxDQUFDRSxJQUFJLENBQUMsQ0FBQztJQUN6QixJQUFLRCxHQUFHLENBQUNFLE1BQU0sS0FBSyxDQUFDLEVBQUc7TUFDdEIsT0FBT0MsT0FBTyxDQUFDQyxNQUFNLENBQUUsSUFBSUMsS0FBSyxDQUFFLGlCQUFrQixDQUFFLENBQUM7SUFDekQsQ0FBQyxNQUNJLElBQUtMLEdBQUcsQ0FBQ0UsTUFBTSxHQUFHLEVBQUUsRUFBRztNQUMxQixPQUFPQyxPQUFPLENBQUNDLE1BQU0sQ0FBRSxJQUFJQyxLQUFLLENBQUUsb0NBQXFDLENBQUUsQ0FBQztJQUM1RSxDQUFDLE1BQ0k7TUFDSCxPQUFPRixPQUFPLENBQUNHLE9BQU8sQ0FBRU4sR0FBSSxDQUFDO0lBQy9CO0VBQ0YsQ0FBRSxDQUFDO0FBQ0wsQ0FBQyJ9