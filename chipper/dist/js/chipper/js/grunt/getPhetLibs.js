// Copyright 2017-2023, University of Colorado Boulder

/**
 * Determines a list of all dependent repositories (for dependencies.json or other creation)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const _ = require('lodash');
const assert = require('assert');
const ChipperConstants = require('../common/ChipperConstants');
const grunt = require('grunt');

/**
 * Returns a list of all dependent repositories.
 * @public
 *
 * @param {string} repo
 * @param {string} [brand] - If not specified, it will return the dependencies for all brands.
 * @returns {Array.<string>}
 */
module.exports = function getPhetLibs(repo, brand) {
  assert(typeof repo === 'string', 'Repository required for getPhetLibs');
  if (brand === undefined) {
    return getPhetLibs(repo, ChipperConstants.BRANDS);
  } else if (Array.isArray(brand)) {
    return _.reduce(brand, (dependencies, brand) => {
      return _.uniq(dependencies.concat(getPhetLibs(repo, brand)).sort());
    }, []);
  } else {
    const packageObject = grunt.file.readJSON(`../${repo}/package.json`);
    let buildObject;
    try {
      buildObject = grunt.file.readJSON('../chipper/build.json');
    } catch (e) {
      buildObject = {};
    }

    // start with package.json
    let phetLibs = packageObject && packageObject.phet && packageObject.phet.phetLibs ? packageObject.phet.phetLibs : [];

    // add the repo that's being built
    phetLibs.push(packageObject.name);

    // add common and brand-specific entries from build.json
    ['common', brand].forEach(id => {
      if (buildObject[id] && buildObject[id].phetLibs) {
        phetLibs = phetLibs.concat(buildObject[id].phetLibs);
      }
    });

    // add brand specific dependencies from the package json
    if (packageObject.phet && packageObject.phet[brand] && packageObject.phet[brand].phetLibs) {
      phetLibs = phetLibs.concat(packageObject.phet[brand].phetLibs);
    }

    // wrappers are also marked as phetLibs, so we can get their shas without listing them twice
    if (brand === 'phet-io' && packageObject.phet && packageObject.phet[brand]) {
      phetLibs = phetLibs.concat(packageObject.phet[brand].wrappers || []);
    }

    // sort and remove duplicates
    return _.uniq(phetLibs.sort());
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsImFzc2VydCIsIkNoaXBwZXJDb25zdGFudHMiLCJncnVudCIsIm1vZHVsZSIsImV4cG9ydHMiLCJnZXRQaGV0TGlicyIsInJlcG8iLCJicmFuZCIsInVuZGVmaW5lZCIsIkJSQU5EUyIsIkFycmF5IiwiaXNBcnJheSIsInJlZHVjZSIsImRlcGVuZGVuY2llcyIsInVuaXEiLCJjb25jYXQiLCJzb3J0IiwicGFja2FnZU9iamVjdCIsImZpbGUiLCJyZWFkSlNPTiIsImJ1aWxkT2JqZWN0IiwiZSIsInBoZXRMaWJzIiwicGhldCIsInB1c2giLCJuYW1lIiwiZm9yRWFjaCIsImlkIiwid3JhcHBlcnMiXSwic291cmNlcyI6WyJnZXRQaGV0TGlicy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEZXRlcm1pbmVzIGEgbGlzdCBvZiBhbGwgZGVwZW5kZW50IHJlcG9zaXRvcmllcyAoZm9yIGRlcGVuZGVuY2llcy5qc29uIG9yIG90aGVyIGNyZWF0aW9uKVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuXHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApO1xyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5jb25zdCBDaGlwcGVyQ29uc3RhbnRzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzJyApO1xyXG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGEgbGlzdCBvZiBhbGwgZGVwZW5kZW50IHJlcG9zaXRvcmllcy5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2JyYW5kXSAtIElmIG5vdCBzcGVjaWZpZWQsIGl0IHdpbGwgcmV0dXJuIHRoZSBkZXBlbmRlbmNpZXMgZm9yIGFsbCBicmFuZHMuXHJcbiAqIEByZXR1cm5zIHtBcnJheS48c3RyaW5nPn1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0UGhldExpYnMoIHJlcG8sIGJyYW5kICkge1xyXG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnLCAnUmVwb3NpdG9yeSByZXF1aXJlZCBmb3IgZ2V0UGhldExpYnMnICk7XHJcblxyXG4gIGlmICggYnJhbmQgPT09IHVuZGVmaW5lZCApIHtcclxuICAgIHJldHVybiBnZXRQaGV0TGlicyggcmVwbywgQ2hpcHBlckNvbnN0YW50cy5CUkFORFMgKTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIEFycmF5LmlzQXJyYXkoIGJyYW5kICkgKSB7XHJcbiAgICByZXR1cm4gXy5yZWR1Y2UoIGJyYW5kLCAoIGRlcGVuZGVuY2llcywgYnJhbmQgKSA9PiB7XHJcbiAgICAgIHJldHVybiBfLnVuaXEoIGRlcGVuZGVuY2llcy5jb25jYXQoIGdldFBoZXRMaWJzKCByZXBvLCBicmFuZCApICkuc29ydCgpICk7XHJcbiAgICB9LCBbXSApO1xyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGNvbnN0IHBhY2thZ2VPYmplY3QgPSBncnVudC5maWxlLnJlYWRKU09OKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XHJcbiAgICBsZXQgYnVpbGRPYmplY3Q7XHJcbiAgICB0cnkge1xyXG4gICAgICBidWlsZE9iamVjdCA9IGdydW50LmZpbGUucmVhZEpTT04oICcuLi9jaGlwcGVyL2J1aWxkLmpzb24nICk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCggZSApIHtcclxuICAgICAgYnVpbGRPYmplY3QgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzdGFydCB3aXRoIHBhY2thZ2UuanNvblxyXG4gICAgbGV0IHBoZXRMaWJzID0gcGFja2FnZU9iamVjdCAmJlxyXG4gICAgICAgICAgICAgICAgICAgcGFja2FnZU9iamVjdC5waGV0ICYmXHJcbiAgICAgICAgICAgICAgICAgICBwYWNrYWdlT2JqZWN0LnBoZXQucGhldExpYnMgP1xyXG4gICAgICAgICAgICAgICAgICAgcGFja2FnZU9iamVjdC5waGV0LnBoZXRMaWJzIDogW107XHJcblxyXG4gICAgLy8gYWRkIHRoZSByZXBvIHRoYXQncyBiZWluZyBidWlsdFxyXG4gICAgcGhldExpYnMucHVzaCggcGFja2FnZU9iamVjdC5uYW1lICk7XHJcblxyXG4gICAgLy8gYWRkIGNvbW1vbiBhbmQgYnJhbmQtc3BlY2lmaWMgZW50cmllcyBmcm9tIGJ1aWxkLmpzb25cclxuICAgIFsgJ2NvbW1vbicsIGJyYW5kIF0uZm9yRWFjaCggaWQgPT4ge1xyXG4gICAgICBpZiAoIGJ1aWxkT2JqZWN0WyBpZCBdICYmIGJ1aWxkT2JqZWN0WyBpZCBdLnBoZXRMaWJzICkge1xyXG4gICAgICAgIHBoZXRMaWJzID0gcGhldExpYnMuY29uY2F0KCBidWlsZE9iamVjdFsgaWQgXS5waGV0TGlicyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGJyYW5kIHNwZWNpZmljIGRlcGVuZGVuY2llcyBmcm9tIHRoZSBwYWNrYWdlIGpzb25cclxuICAgIGlmICggcGFja2FnZU9iamVjdC5waGV0ICYmIHBhY2thZ2VPYmplY3QucGhldFsgYnJhbmQgXSAmJiBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0ucGhldExpYnMgKSB7XHJcbiAgICAgIHBoZXRMaWJzID0gcGhldExpYnMuY29uY2F0KCBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0ucGhldExpYnMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3cmFwcGVycyBhcmUgYWxzbyBtYXJrZWQgYXMgcGhldExpYnMsIHNvIHdlIGNhbiBnZXQgdGhlaXIgc2hhcyB3aXRob3V0IGxpc3RpbmcgdGhlbSB0d2ljZVxyXG4gICAgaWYgKCBicmFuZCA9PT0gJ3BoZXQtaW8nICYmIHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0gKSB7XHJcbiAgICAgIHBoZXRMaWJzID0gcGhldExpYnMuY29uY2F0KCBwYWNrYWdlT2JqZWN0LnBoZXRbIGJyYW5kIF0ud3JhcHBlcnMgfHwgW10gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzb3J0IGFuZCByZW1vdmUgZHVwbGljYXRlc1xyXG4gICAgcmV0dXJuIF8udW5pcSggcGhldExpYnMuc29ydCgpICk7XHJcbiAgfVxyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxDQUFDLEdBQUdDLE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFDN0IsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1FLGdCQUFnQixHQUFHRixPQUFPLENBQUUsNEJBQTZCLENBQUM7QUFDaEUsTUFBTUcsS0FBSyxHQUFHSCxPQUFPLENBQUUsT0FBUSxDQUFDOztBQUVoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FJLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFNBQVNDLFdBQVdBLENBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFHO0VBQ25EUCxNQUFNLENBQUUsT0FBT00sSUFBSSxLQUFLLFFBQVEsRUFBRSxxQ0FBc0MsQ0FBQztFQUV6RSxJQUFLQyxLQUFLLEtBQUtDLFNBQVMsRUFBRztJQUN6QixPQUFPSCxXQUFXLENBQUVDLElBQUksRUFBRUwsZ0JBQWdCLENBQUNRLE1BQU8sQ0FBQztFQUNyRCxDQUFDLE1BQ0ksSUFBS0MsS0FBSyxDQUFDQyxPQUFPLENBQUVKLEtBQU0sQ0FBQyxFQUFHO0lBQ2pDLE9BQU9ULENBQUMsQ0FBQ2MsTUFBTSxDQUFFTCxLQUFLLEVBQUUsQ0FBRU0sWUFBWSxFQUFFTixLQUFLLEtBQU07TUFDakQsT0FBT1QsQ0FBQyxDQUFDZ0IsSUFBSSxDQUFFRCxZQUFZLENBQUNFLE1BQU0sQ0FBRVYsV0FBVyxDQUFFQyxJQUFJLEVBQUVDLEtBQU0sQ0FBRSxDQUFDLENBQUNTLElBQUksQ0FBQyxDQUFFLENBQUM7SUFDM0UsQ0FBQyxFQUFFLEVBQUcsQ0FBQztFQUNULENBQUMsTUFDSTtJQUNILE1BQU1DLGFBQWEsR0FBR2YsS0FBSyxDQUFDZ0IsSUFBSSxDQUFDQyxRQUFRLENBQUcsTUFBS2IsSUFBSyxlQUFlLENBQUM7SUFDdEUsSUFBSWMsV0FBVztJQUNmLElBQUk7TUFDRkEsV0FBVyxHQUFHbEIsS0FBSyxDQUFDZ0IsSUFBSSxDQUFDQyxRQUFRLENBQUUsdUJBQXdCLENBQUM7SUFDOUQsQ0FBQyxDQUNELE9BQU9FLENBQUMsRUFBRztNQUNURCxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCOztJQUVBO0lBQ0EsSUFBSUUsUUFBUSxHQUFHTCxhQUFhLElBQ2JBLGFBQWEsQ0FBQ00sSUFBSSxJQUNsQk4sYUFBYSxDQUFDTSxJQUFJLENBQUNELFFBQVEsR0FDM0JMLGFBQWEsQ0FBQ00sSUFBSSxDQUFDRCxRQUFRLEdBQUcsRUFBRTs7SUFFL0M7SUFDQUEsUUFBUSxDQUFDRSxJQUFJLENBQUVQLGFBQWEsQ0FBQ1EsSUFBSyxDQUFDOztJQUVuQztJQUNBLENBQUUsUUFBUSxFQUFFbEIsS0FBSyxDQUFFLENBQUNtQixPQUFPLENBQUVDLEVBQUUsSUFBSTtNQUNqQyxJQUFLUCxXQUFXLENBQUVPLEVBQUUsQ0FBRSxJQUFJUCxXQUFXLENBQUVPLEVBQUUsQ0FBRSxDQUFDTCxRQUFRLEVBQUc7UUFDckRBLFFBQVEsR0FBR0EsUUFBUSxDQUFDUCxNQUFNLENBQUVLLFdBQVcsQ0FBRU8sRUFBRSxDQUFFLENBQUNMLFFBQVMsQ0FBQztNQUMxRDtJQUNGLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUtMLGFBQWEsQ0FBQ00sSUFBSSxJQUFJTixhQUFhLENBQUNNLElBQUksQ0FBRWhCLEtBQUssQ0FBRSxJQUFJVSxhQUFhLENBQUNNLElBQUksQ0FBRWhCLEtBQUssQ0FBRSxDQUFDZSxRQUFRLEVBQUc7TUFDL0ZBLFFBQVEsR0FBR0EsUUFBUSxDQUFDUCxNQUFNLENBQUVFLGFBQWEsQ0FBQ00sSUFBSSxDQUFFaEIsS0FBSyxDQUFFLENBQUNlLFFBQVMsQ0FBQztJQUNwRTs7SUFFQTtJQUNBLElBQUtmLEtBQUssS0FBSyxTQUFTLElBQUlVLGFBQWEsQ0FBQ00sSUFBSSxJQUFJTixhQUFhLENBQUNNLElBQUksQ0FBRWhCLEtBQUssQ0FBRSxFQUFHO01BQzlFZSxRQUFRLEdBQUdBLFFBQVEsQ0FBQ1AsTUFBTSxDQUFFRSxhQUFhLENBQUNNLElBQUksQ0FBRWhCLEtBQUssQ0FBRSxDQUFDcUIsUUFBUSxJQUFJLEVBQUcsQ0FBQztJQUMxRTs7SUFFQTtJQUNBLE9BQU85QixDQUFDLENBQUNnQixJQUFJLENBQUVRLFFBQVEsQ0FBQ04sSUFBSSxDQUFDLENBQUUsQ0FBQztFQUNsQztBQUNGLENBQUMifQ==