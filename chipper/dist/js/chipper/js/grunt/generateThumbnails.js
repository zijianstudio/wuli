// Copyright 2017-2022, University of Colorado Boulder

/**
 * This grunt task generates 128x84 and 600x394 thumbnails of the sim's screenshot in assets.
 * Thumbnails are put in the build directory of the sim. If the directory doesn't exist, it is created.
 * New grunt tasks can easily be created to generate different sized images by passing this function
 * different heights and widths.
 *
 * @author Aaron Davis
 */

// modules
const grunt = require('grunt');
const jimp = require('jimp');

/**
 * @param {string} repo - name of the repository
 * @param {number} width of the resized image
 * @param {number} height of the resized image
 * @param {number} quality - percent quality, in the range [0..100]
 * @param {string} mime - Mime type - one of jimp.MIME_PNG, jimp.MIME_JPEG, jimp.MIME_BMP
 * @param {string} altSuffix - ending for the filename e.g. -alt1
 * @returns {Promise} - Resolves to a {Buffer} with the image data
 */
module.exports = function (repo, width, height, quality, mime, altSuffix) {
  return new Promise((resolve, reject) => {
    const fullResImageName = `../${repo}/assets/${repo}-screenshot${altSuffix || ''}.png`;
    if (!grunt.file.exists(fullResImageName)) {
      grunt.log.writeln(`no image file exists: ${fullResImageName}. Aborting generateThumbnails`);
      return;
    }
    new jimp(fullResImageName, function () {
      // eslint-disable-line no-new
      if (mime === jimp.MIME_JPEG) {
        this.quality(quality);
      }
      this.resize(width, height).getBuffer(mime, (error, buffer) => {
        if (error) {
          reject(new Error(error));
        } else {
          resolve(buffer);
        }
      });
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncnVudCIsInJlcXVpcmUiLCJqaW1wIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ3aWR0aCIsImhlaWdodCIsInF1YWxpdHkiLCJtaW1lIiwiYWx0U3VmZml4IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJmdWxsUmVzSW1hZ2VOYW1lIiwiZmlsZSIsImV4aXN0cyIsImxvZyIsIndyaXRlbG4iLCJNSU1FX0pQRUciLCJyZXNpemUiLCJnZXRCdWZmZXIiLCJlcnJvciIsImJ1ZmZlciIsIkVycm9yIl0sInNvdXJjZXMiOlsiZ2VuZXJhdGVUaHVtYm5haWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgZ3J1bnQgdGFzayBnZW5lcmF0ZXMgMTI4eDg0IGFuZCA2MDB4Mzk0IHRodW1ibmFpbHMgb2YgdGhlIHNpbSdzIHNjcmVlbnNob3QgaW4gYXNzZXRzLlxyXG4gKiBUaHVtYm5haWxzIGFyZSBwdXQgaW4gdGhlIGJ1aWxkIGRpcmVjdG9yeSBvZiB0aGUgc2ltLiBJZiB0aGUgZGlyZWN0b3J5IGRvZXNuJ3QgZXhpc3QsIGl0IGlzIGNyZWF0ZWQuXHJcbiAqIE5ldyBncnVudCB0YXNrcyBjYW4gZWFzaWx5IGJlIGNyZWF0ZWQgdG8gZ2VuZXJhdGUgZGlmZmVyZW50IHNpemVkIGltYWdlcyBieSBwYXNzaW5nIHRoaXMgZnVuY3Rpb25cclxuICogZGlmZmVyZW50IGhlaWdodHMgYW5kIHdpZHRocy5cclxuICpcclxuICogQGF1dGhvciBBYXJvbiBEYXZpc1xyXG4gKi9cclxuXHJcblxyXG4vLyBtb2R1bGVzXHJcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xyXG5jb25zdCBqaW1wID0gcmVxdWlyZSggJ2ppbXAnICk7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBuYW1lIG9mIHRoZSByZXBvc2l0b3J5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBvZiB0aGUgcmVzaXplZCBpbWFnZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IG9mIHRoZSByZXNpemVkIGltYWdlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBxdWFsaXR5IC0gcGVyY2VudCBxdWFsaXR5LCBpbiB0aGUgcmFuZ2UgWzAuLjEwMF1cclxuICogQHBhcmFtIHtzdHJpbmd9IG1pbWUgLSBNaW1lIHR5cGUgLSBvbmUgb2YgamltcC5NSU1FX1BORywgamltcC5NSU1FX0pQRUcsIGppbXAuTUlNRV9CTVBcclxuICogQHBhcmFtIHtzdHJpbmd9IGFsdFN1ZmZpeCAtIGVuZGluZyBmb3IgdGhlIGZpbGVuYW1lIGUuZy4gLWFsdDFcclxuICogQHJldHVybnMge1Byb21pc2V9IC0gUmVzb2x2ZXMgdG8gYSB7QnVmZmVyfSB3aXRoIHRoZSBpbWFnZSBkYXRhXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCByZXBvLCB3aWR0aCwgaGVpZ2h0LCBxdWFsaXR5LCBtaW1lLCBhbHRTdWZmaXggKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKCAoIHJlc29sdmUsIHJlamVjdCApID0+IHtcclxuICAgIGNvbnN0IGZ1bGxSZXNJbWFnZU5hbWUgPSBgLi4vJHtyZXBvfS9hc3NldHMvJHtyZXBvfS1zY3JlZW5zaG90JHthbHRTdWZmaXggfHwgJyd9LnBuZ2A7XHJcblxyXG4gICAgaWYgKCAhZ3J1bnQuZmlsZS5leGlzdHMoIGZ1bGxSZXNJbWFnZU5hbWUgKSApIHtcclxuICAgICAgZ3J1bnQubG9nLndyaXRlbG4oIGBubyBpbWFnZSBmaWxlIGV4aXN0czogJHtmdWxsUmVzSW1hZ2VOYW1lfS4gQWJvcnRpbmcgZ2VuZXJhdGVUaHVtYm5haWxzYCApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgbmV3IGppbXAoIGZ1bGxSZXNJbWFnZU5hbWUsIGZ1bmN0aW9uKCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xyXG4gICAgICBpZiAoIG1pbWUgPT09IGppbXAuTUlNRV9KUEVHICkge1xyXG4gICAgICAgIHRoaXMucXVhbGl0eSggcXVhbGl0eSApO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMucmVzaXplKCB3aWR0aCwgaGVpZ2h0ICkuZ2V0QnVmZmVyKCBtaW1lLCAoIGVycm9yLCBidWZmZXIgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBlcnJvciApIHtcclxuICAgICAgICAgIHJlamVjdCggbmV3IEVycm9yKCBlcnJvciApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmVzb2x2ZSggYnVmZmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfSApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQSxNQUFNQSxLQUFLLEdBQUdDLE9BQU8sQ0FBRSxPQUFRLENBQUM7QUFDaEMsTUFBTUMsSUFBSSxHQUFHRCxPQUFPLENBQUUsTUFBTyxDQUFDOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUUsTUFBTSxDQUFDQyxPQUFPLEdBQUcsVUFBVUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRztFQUN6RSxPQUFPLElBQUlDLE9BQU8sQ0FBRSxDQUFFQyxPQUFPLEVBQUVDLE1BQU0sS0FBTTtJQUN6QyxNQUFNQyxnQkFBZ0IsR0FBSSxNQUFLVCxJQUFLLFdBQVVBLElBQUssY0FBYUssU0FBUyxJQUFJLEVBQUcsTUFBSztJQUVyRixJQUFLLENBQUNWLEtBQUssQ0FBQ2UsSUFBSSxDQUFDQyxNQUFNLENBQUVGLGdCQUFpQixDQUFDLEVBQUc7TUFDNUNkLEtBQUssQ0FBQ2lCLEdBQUcsQ0FBQ0MsT0FBTyxDQUFHLHlCQUF3QkosZ0JBQWlCLCtCQUErQixDQUFDO01BQzdGO0lBQ0Y7SUFFQSxJQUFJWixJQUFJLENBQUVZLGdCQUFnQixFQUFFLFlBQVc7TUFBRTtNQUN2QyxJQUFLTCxJQUFJLEtBQUtQLElBQUksQ0FBQ2lCLFNBQVMsRUFBRztRQUM3QixJQUFJLENBQUNYLE9BQU8sQ0FBRUEsT0FBUSxDQUFDO01BQ3pCO01BQ0EsSUFBSSxDQUFDWSxNQUFNLENBQUVkLEtBQUssRUFBRUMsTUFBTyxDQUFDLENBQUNjLFNBQVMsQ0FBRVosSUFBSSxFQUFFLENBQUVhLEtBQUssRUFBRUMsTUFBTSxLQUFNO1FBQ2pFLElBQUtELEtBQUssRUFBRztVQUNYVCxNQUFNLENBQUUsSUFBSVcsS0FBSyxDQUFFRixLQUFNLENBQUUsQ0FBQztRQUM5QixDQUFDLE1BQ0k7VUFDSFYsT0FBTyxDQUFFVyxNQUFPLENBQUM7UUFDbkI7TUFDRixDQUFFLENBQUM7SUFDTCxDQUFFLENBQUM7RUFDTCxDQUFFLENBQUM7QUFDTCxDQUFDIn0=