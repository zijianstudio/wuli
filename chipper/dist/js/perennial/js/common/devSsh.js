// Copyright 2017, University of Colorado Boulder

/**
 * Executes a command on the dev server
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const buildLocal = require('./buildLocal');
const ssh = require('./ssh');

/**
 * Executes a command on the dev server
 * @public
 *
 * @param {string} cmd
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */
module.exports = function (cmd) {
  return ssh(buildLocal.devUsername, buildLocal.devDeployServer, cmd);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJidWlsZExvY2FsIiwicmVxdWlyZSIsInNzaCIsIm1vZHVsZSIsImV4cG9ydHMiLCJjbWQiLCJkZXZVc2VybmFtZSIsImRldkRlcGxveVNlcnZlciJdLCJzb3VyY2VzIjpbImRldlNzaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSBjb21tYW5kIG9uIHRoZSBkZXYgc2VydmVyXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBidWlsZExvY2FsID0gcmVxdWlyZSggJy4vYnVpbGRMb2NhbCcgKTtcclxuY29uc3Qgc3NoID0gcmVxdWlyZSggJy4vc3NoJyApO1xyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGVzIGEgY29tbWFuZCBvbiB0aGUgZGV2IHNlcnZlclxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjbWRcclxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gU3Rkb3V0XHJcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBjbWQgKSB7XHJcbiAgcmV0dXJuIHNzaCggYnVpbGRMb2NhbC5kZXZVc2VybmFtZSwgYnVpbGRMb2NhbC5kZXZEZXBsb3lTZXJ2ZXIsIGNtZCApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsVUFBVSxHQUFHQyxPQUFPLENBQUUsY0FBZSxDQUFDO0FBQzVDLE1BQU1DLEdBQUcsR0FBR0QsT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRSxNQUFNLENBQUNDLE9BQU8sR0FBRyxVQUFVQyxHQUFHLEVBQUc7RUFDL0IsT0FBT0gsR0FBRyxDQUFFRixVQUFVLENBQUNNLFdBQVcsRUFBRU4sVUFBVSxDQUFDTyxlQUFlLEVBQUVGLEdBQUksQ0FBQztBQUN2RSxDQUFDIn0=