// Copyright 2022, University of Colorado Boulder

/**
 * Writes a file with grunt and adds it to git.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

const gitAdd = require('./gitAdd');
const gitIsClean = require('./gitIsClean');
const grunt = require('grunt');

/**
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} filePath - File name and potentially path relative to the repo
 * @param {string} content - The content of the file as a string
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */
module.exports = async function (repo, filePath, content) {
  const outputFile = `../${repo}/${filePath}`;
  grunt.file.write(outputFile, content);
  const fileClean = await gitIsClean(repo, filePath);
  if (!fileClean) {
    await gitAdd(repo, filePath);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnaXRBZGQiLCJyZXF1aXJlIiwiZ2l0SXNDbGVhbiIsImdydW50IiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJmaWxlUGF0aCIsImNvbnRlbnQiLCJvdXRwdXRGaWxlIiwiZmlsZSIsIndyaXRlIiwiZmlsZUNsZWFuIl0sInNvdXJjZXMiOlsid3JpdGVGaWxlQW5kR2l0QWRkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBXcml0ZXMgYSBmaWxlIHdpdGggZ3J1bnQgYW5kIGFkZHMgaXQgdG8gZ2l0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5jb25zdCBnaXRBZGQgPSByZXF1aXJlKCAnLi9naXRBZGQnICk7XHJcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi9naXRJc0NsZWFuJyApO1xyXG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcclxuXHJcbi8qKlxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZVBhdGggLSBGaWxlIG5hbWUgYW5kIHBvdGVudGlhbGx5IHBhdGggcmVsYXRpdmUgdG8gdGhlIHJlcG9cclxuICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnQgLSBUaGUgY29udGVudCBvZiB0aGUgZmlsZSBhcyBhIHN0cmluZ1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48c3RyaW5nPn0gLSBTdGRvdXRcclxuICogQHJlamVjdHMge0V4ZWN1dGVFcnJvcn1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIGZpbGVQYXRoLCBjb250ZW50ICkge1xyXG4gIGNvbnN0IG91dHB1dEZpbGUgPSBgLi4vJHtyZXBvfS8ke2ZpbGVQYXRofWA7XHJcbiAgZ3J1bnQuZmlsZS53cml0ZSggb3V0cHV0RmlsZSwgY29udGVudCApO1xyXG5cclxuICBjb25zdCBmaWxlQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCByZXBvLCBmaWxlUGF0aCApO1xyXG4gIGlmICggIWZpbGVDbGVhbiApIHtcclxuICAgIGF3YWl0IGdpdEFkZCggcmVwbywgZmlsZVBhdGggKTtcclxuICB9XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDcEMsTUFBTUMsVUFBVSxHQUFHRCxPQUFPLENBQUUsY0FBZSxDQUFDO0FBQzVDLE1BQU1FLEtBQUssR0FBR0YsT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FHLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFBRztFQUN6RCxNQUFNQyxVQUFVLEdBQUksTUFBS0gsSUFBSyxJQUFHQyxRQUFTLEVBQUM7RUFDM0NKLEtBQUssQ0FBQ08sSUFBSSxDQUFDQyxLQUFLLENBQUVGLFVBQVUsRUFBRUQsT0FBUSxDQUFDO0VBRXZDLE1BQU1JLFNBQVMsR0FBRyxNQUFNVixVQUFVLENBQUVJLElBQUksRUFBRUMsUUFBUyxDQUFDO0VBQ3BELElBQUssQ0FBQ0ssU0FBUyxFQUFHO0lBQ2hCLE1BQU1aLE1BQU0sQ0FBRU0sSUFBSSxFQUFFQyxRQUFTLENBQUM7RUFDaEM7QUFDRixDQUFDIn0=