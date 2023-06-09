// Copyright 2015-2021, University of Colorado Boulder

/**
 * Grunt task that determines created and last modified dates from git, and updates copyright statements accordingly,
 * see #403
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

const grunt = require('grunt');
const updateCopyrightDate = require('./updateCopyrightDate');

/**
 * @public
 * @param {string} repo - The repository name for the files to update
 * @param {function} predicate - takes a repo-relative path {string} and returns {boolean} if the path should be updated.
 * @returns {Promise}
 */
module.exports = async function (repo, predicate = () => true) {
  let relativeFiles = [];
  grunt.file.recurse(`../${repo}`, (abspath, rootdir, subdir, filename) => {
    relativeFiles.push(`${subdir}/${filename}`);
  });
  relativeFiles = relativeFiles.filter(file => file.startsWith('js/')).filter(predicate);
  for (const relativeFile of relativeFiles) {
    await updateCopyrightDate(repo, relativeFile);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJncnVudCIsInJlcXVpcmUiLCJ1cGRhdGVDb3B5cmlnaHREYXRlIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJwcmVkaWNhdGUiLCJyZWxhdGl2ZUZpbGVzIiwiZmlsZSIsInJlY3Vyc2UiLCJhYnNwYXRoIiwicm9vdGRpciIsInN1YmRpciIsImZpbGVuYW1lIiwicHVzaCIsImZpbHRlciIsInN0YXJ0c1dpdGgiLCJyZWxhdGl2ZUZpbGUiXSwic291cmNlcyI6WyJ1cGRhdGVDb3B5cmlnaHREYXRlcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHcnVudCB0YXNrIHRoYXQgZGV0ZXJtaW5lcyBjcmVhdGVkIGFuZCBsYXN0IG1vZGlmaWVkIGRhdGVzIGZyb20gZ2l0LCBhbmQgdXBkYXRlcyBjb3B5cmlnaHQgc3RhdGVtZW50cyBhY2NvcmRpbmdseSxcclxuICogc2VlICM0MDNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5cclxuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XHJcbmNvbnN0IHVwZGF0ZUNvcHlyaWdodERhdGUgPSByZXF1aXJlKCAnLi91cGRhdGVDb3B5cmlnaHREYXRlJyApO1xyXG5cclxuLyoqXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lIGZvciB0aGUgZmlsZXMgdG8gdXBkYXRlXHJcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHByZWRpY2F0ZSAtIHRha2VzIGEgcmVwby1yZWxhdGl2ZSBwYXRoIHtzdHJpbmd9IGFuZCByZXR1cm5zIHtib29sZWFufSBpZiB0aGUgcGF0aCBzaG91bGQgYmUgdXBkYXRlZC5cclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBwcmVkaWNhdGUgPSAoKSA9PiB0cnVlICkge1xyXG4gIGxldCByZWxhdGl2ZUZpbGVzID0gW107XHJcbiAgZ3J1bnQuZmlsZS5yZWN1cnNlKCBgLi4vJHtyZXBvfWAsICggYWJzcGF0aCwgcm9vdGRpciwgc3ViZGlyLCBmaWxlbmFtZSApID0+IHtcclxuICAgIHJlbGF0aXZlRmlsZXMucHVzaCggYCR7c3ViZGlyfS8ke2ZpbGVuYW1lfWAgKTtcclxuICB9ICk7XHJcbiAgcmVsYXRpdmVGaWxlcyA9IHJlbGF0aXZlRmlsZXMuZmlsdGVyKCBmaWxlID0+IGZpbGUuc3RhcnRzV2l0aCggJ2pzLycgKSApLmZpbHRlciggcHJlZGljYXRlICk7XHJcblxyXG4gIGZvciAoIGNvbnN0IHJlbGF0aXZlRmlsZSBvZiByZWxhdGl2ZUZpbGVzICkge1xyXG4gICAgYXdhaXQgdXBkYXRlQ29weXJpZ2h0RGF0ZSggcmVwbywgcmVsYXRpdmVGaWxlICk7XHJcbiAgfVxyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSxLQUFLLEdBQUdDLE9BQU8sQ0FBRSxPQUFRLENBQUM7QUFDaEMsTUFBTUMsbUJBQW1CLEdBQUdELE9BQU8sQ0FBRSx1QkFBd0IsQ0FBQzs7QUFFOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FFLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFFQyxTQUFTLEdBQUdBLENBQUEsS0FBTSxJQUFJLEVBQUc7RUFDOUQsSUFBSUMsYUFBYSxHQUFHLEVBQUU7RUFDdEJQLEtBQUssQ0FBQ1EsSUFBSSxDQUFDQyxPQUFPLENBQUcsTUFBS0osSUFBSyxFQUFDLEVBQUUsQ0FBRUssT0FBTyxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRUMsUUFBUSxLQUFNO0lBQzFFTixhQUFhLENBQUNPLElBQUksQ0FBRyxHQUFFRixNQUFPLElBQUdDLFFBQVMsRUFBRSxDQUFDO0VBQy9DLENBQUUsQ0FBQztFQUNITixhQUFhLEdBQUdBLGFBQWEsQ0FBQ1EsTUFBTSxDQUFFUCxJQUFJLElBQUlBLElBQUksQ0FBQ1EsVUFBVSxDQUFFLEtBQU0sQ0FBRSxDQUFDLENBQUNELE1BQU0sQ0FBRVQsU0FBVSxDQUFDO0VBRTVGLEtBQU0sTUFBTVcsWUFBWSxJQUFJVixhQUFhLEVBQUc7SUFDMUMsTUFBTUwsbUJBQW1CLENBQUVHLElBQUksRUFBRVksWUFBYSxDQUFDO0VBQ2pEO0FBQ0YsQ0FBQyJ9