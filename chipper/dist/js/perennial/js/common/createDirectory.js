// Copyright 2020, University of Colorado Boulder

/**
 * Creates a directory at the given path
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const fs = require('fs');
const winston = require('winston');

/**
 * Creates a directory at the given path
 * @public
 *
 * @param {string} path
 * @returns {Promise}
 */
module.exports = function (path) {
  winston.info(`Creating directory ${path}`);
  return new Promise((resolve, reject) => {
    fs.mkdir(path, err => {
      if (err) {
        reject(new Error(`createDirectory: ${err}`));
      } else {
        resolve();
      }
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInBhdGgiLCJpbmZvIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJta2RpciIsImVyciIsIkVycm9yIl0sInNvdXJjZXMiOlsiY3JlYXRlRGlyZWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgZGlyZWN0b3J5IGF0IHRoZSBnaXZlbiBwYXRoXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBkaXJlY3RvcnkgYXQgdGhlIGdpdmVuIHBhdGhcclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIHBhdGggKSB7XHJcbiAgd2luc3Rvbi5pbmZvKCBgQ3JlYXRpbmcgZGlyZWN0b3J5ICR7cGF0aH1gICk7XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSggKCByZXNvbHZlLCByZWplY3QgKSA9PiB7XHJcbiAgICBmcy5ta2RpciggcGF0aCwgZXJyID0+IHtcclxuICAgICAgaWYgKCBlcnIgKSB7XHJcbiAgICAgICAgcmVqZWN0KCBuZXcgRXJyb3IoIGBjcmVhdGVEaXJlY3Rvcnk6ICR7ZXJyfWAgKSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH0gKTtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLEVBQUUsR0FBR0MsT0FBTyxDQUFFLElBQUssQ0FBQztBQUMxQixNQUFNQyxPQUFPLEdBQUdELE9BQU8sQ0FBRSxTQUFVLENBQUM7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FFLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFVBQVVDLElBQUksRUFBRztFQUNoQ0gsT0FBTyxDQUFDSSxJQUFJLENBQUcsc0JBQXFCRCxJQUFLLEVBQUUsQ0FBQztFQUU1QyxPQUFPLElBQUlFLE9BQU8sQ0FBRSxDQUFFQyxPQUFPLEVBQUVDLE1BQU0sS0FBTTtJQUN6Q1QsRUFBRSxDQUFDVSxLQUFLLENBQUVMLElBQUksRUFBRU0sR0FBRyxJQUFJO01BQ3JCLElBQUtBLEdBQUcsRUFBRztRQUNURixNQUFNLENBQUUsSUFBSUcsS0FBSyxDQUFHLG9CQUFtQkQsR0FBSSxFQUFFLENBQUUsQ0FBQztNQUNsRCxDQUFDLE1BQ0k7UUFDSEgsT0FBTyxDQUFDLENBQUM7TUFDWDtJQUNGLENBQUUsQ0FBQztFQUNMLENBQUUsQ0FBQztBQUNMLENBQUMifQ==