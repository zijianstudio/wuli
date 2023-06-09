// Copyright 2017, University of Colorado Boulder

/**
 * Handling for writing JSON to a file.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const fs = require('fs');
const winston = require('winston');

/**
 * Write JSON to a file
 * @public
 *
 * @param {string} file
 * @param {Object} content
 * @returns {Promise}
 */
module.exports = function (file, content) {
  return new Promise((resolve, reject) => {
    winston.debug(`Writing JSON to ${file}`);
    fs.writeFile(file, JSON.stringify(content, null, 2), err => {
      if (err) {
        reject(new Error(`Could not write to file: ${file} due to: ${err}`));
      } else {
        resolve();
      }
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsImZpbGUiLCJjb250ZW50IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkZWJ1ZyIsIndyaXRlRmlsZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJlcnIiLCJFcnJvciJdLCJzb3VyY2VzIjpbIndyaXRlSlNPTi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSGFuZGxpbmcgZm9yIHdyaXRpbmcgSlNPTiB0byBhIGZpbGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5cclxuLyoqXHJcbiAqIFdyaXRlIEpTT04gdG8gYSBmaWxlXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGZpbGVcclxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnRcclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBmaWxlLCBjb250ZW50ICkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XHJcbiAgICB3aW5zdG9uLmRlYnVnKCBgV3JpdGluZyBKU09OIHRvICR7ZmlsZX1gICk7XHJcblxyXG4gICAgZnMud3JpdGVGaWxlKCBmaWxlLCBKU09OLnN0cmluZ2lmeSggY29udGVudCwgbnVsbCwgMiApLCBlcnIgPT4ge1xyXG4gICAgICBpZiAoIGVyciApIHtcclxuICAgICAgICByZWplY3QoIG5ldyBFcnJvciggYENvdWxkIG5vdCB3cml0ZSB0byBmaWxlOiAke2ZpbGV9IGR1ZSB0bzogJHtlcnJ9YCApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsRUFBRSxHQUFHQyxPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1BQU1DLE9BQU8sR0FBR0QsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRSxNQUFNLENBQUNDLE9BQU8sR0FBRyxVQUFVQyxJQUFJLEVBQUVDLE9BQU8sRUFBRztFQUN6QyxPQUFPLElBQUlDLE9BQU8sQ0FBRSxDQUFFQyxPQUFPLEVBQUVDLE1BQU0sS0FBTTtJQUN6Q1AsT0FBTyxDQUFDUSxLQUFLLENBQUcsbUJBQWtCTCxJQUFLLEVBQUUsQ0FBQztJQUUxQ0wsRUFBRSxDQUFDVyxTQUFTLENBQUVOLElBQUksRUFBRU8sSUFBSSxDQUFDQyxTQUFTLENBQUVQLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBRSxDQUFDLEVBQUVRLEdBQUcsSUFBSTtNQUM3RCxJQUFLQSxHQUFHLEVBQUc7UUFDVEwsTUFBTSxDQUFFLElBQUlNLEtBQUssQ0FBRyw0QkFBMkJWLElBQUssWUFBV1MsR0FBSSxFQUFFLENBQUUsQ0FBQztNQUMxRSxDQUFDLE1BQ0k7UUFDSE4sT0FBTyxDQUFDLENBQUM7TUFDWDtJQUNGLENBQUUsQ0FBQztFQUNMLENBQUUsQ0FBQztBQUNMLENBQUMifQ==