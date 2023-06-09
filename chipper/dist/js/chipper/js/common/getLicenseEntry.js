// Copyright 2015-2021, University of Colorado Boulder

/**
 * Retrieves the license entry for a media file from license.json.
 * This file is used when loading media files (images, sounds,...) via media plugins.
 *
 * A license entry for a media file is found in a license.json file that is in
 * the same directory as the media file. A license entry has the following fields:
 *
 * text - copyright statement or "Public Domain"
 * projectURL - the URL for the resource
 * license - the name of license, such as "Public Domain"
 * notes - additional helpful information about the resource, or ""
 * exception - [optional] description of why the file is being used despite the fact that it doesn't match PhET's licensing policy
 *
 * For an example, see any of the license.json files in a PhET simulation's images directory.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

/* eslint-env node */

const fs = require('fs');

/**
 * Retrieves the license entry for a media file from license.json.
 *
 * @param {string} absolutePath - the path for the media file
 * @returns {Object|null} the entry from the license.json file, null if there is no entry
 *
 * @private
 */
function getLicenseEntry(absolutePath) {
  const lastSlashIndex = absolutePath.lastIndexOf('/');
  const prefix = absolutePath.substring(0, lastSlashIndex);
  const licenseFilename = `${prefix}/license.json`; // license.json is a sibling of the media file
  const mediaFilename = absolutePath.substring(lastSlashIndex + 1); // field name in license.json

  // read license.json if it exists
  if (!fs.existsSync(licenseFilename)) {
    return null;
  }
  const fileContents = fs.readFileSync(licenseFilename, 'utf8');
  let json = null;
  try {
    json = JSON.parse(fileContents);
  } catch (err) {
    if (err instanceof SyntaxError) {
      // default message is incomprehensible, see chipper#449
      throw new Error(`syntax error in ${licenseFilename}: ${err.message}`);
    } else {
      throw err;
    }
  }

  // get the media file's license entry
  const entry = json[mediaFilename];
  if (!entry) {
    return null; // Not annotated in file
  }

  return entry;
}
module.exports = getLicenseEntry;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJnZXRMaWNlbnNlRW50cnkiLCJhYnNvbHV0ZVBhdGgiLCJsYXN0U2xhc2hJbmRleCIsImxhc3RJbmRleE9mIiwicHJlZml4Iiwic3Vic3RyaW5nIiwibGljZW5zZUZpbGVuYW1lIiwibWVkaWFGaWxlbmFtZSIsImV4aXN0c1N5bmMiLCJmaWxlQ29udGVudHMiLCJyZWFkRmlsZVN5bmMiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwiZXJyIiwiU3ludGF4RXJyb3IiLCJFcnJvciIsIm1lc3NhZ2UiLCJlbnRyeSIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlcyI6WyJnZXRMaWNlbnNlRW50cnkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmV0cmlldmVzIHRoZSBsaWNlbnNlIGVudHJ5IGZvciBhIG1lZGlhIGZpbGUgZnJvbSBsaWNlbnNlLmpzb24uXHJcbiAqIFRoaXMgZmlsZSBpcyB1c2VkIHdoZW4gbG9hZGluZyBtZWRpYSBmaWxlcyAoaW1hZ2VzLCBzb3VuZHMsLi4uKSB2aWEgbWVkaWEgcGx1Z2lucy5cclxuICpcclxuICogQSBsaWNlbnNlIGVudHJ5IGZvciBhIG1lZGlhIGZpbGUgaXMgZm91bmQgaW4gYSBsaWNlbnNlLmpzb24gZmlsZSB0aGF0IGlzIGluXHJcbiAqIHRoZSBzYW1lIGRpcmVjdG9yeSBhcyB0aGUgbWVkaWEgZmlsZS4gQSBsaWNlbnNlIGVudHJ5IGhhcyB0aGUgZm9sbG93aW5nIGZpZWxkczpcclxuICpcclxuICogdGV4dCAtIGNvcHlyaWdodCBzdGF0ZW1lbnQgb3IgXCJQdWJsaWMgRG9tYWluXCJcclxuICogcHJvamVjdFVSTCAtIHRoZSBVUkwgZm9yIHRoZSByZXNvdXJjZVxyXG4gKiBsaWNlbnNlIC0gdGhlIG5hbWUgb2YgbGljZW5zZSwgc3VjaCBhcyBcIlB1YmxpYyBEb21haW5cIlxyXG4gKiBub3RlcyAtIGFkZGl0aW9uYWwgaGVscGZ1bCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVzb3VyY2UsIG9yIFwiXCJcclxuICogZXhjZXB0aW9uIC0gW29wdGlvbmFsXSBkZXNjcmlwdGlvbiBvZiB3aHkgdGhlIGZpbGUgaXMgYmVpbmcgdXNlZCBkZXNwaXRlIHRoZSBmYWN0IHRoYXQgaXQgZG9lc24ndCBtYXRjaCBQaEVUJ3MgbGljZW5zaW5nIHBvbGljeVxyXG4gKlxyXG4gKiBGb3IgYW4gZXhhbXBsZSwgc2VlIGFueSBvZiB0aGUgbGljZW5zZS5qc29uIGZpbGVzIGluIGEgUGhFVCBzaW11bGF0aW9uJ3MgaW1hZ2VzIGRpcmVjdG9yeS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG4vKiBlc2xpbnQtZW52IG5vZGUgKi9cclxuXHJcblxyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuXHJcbi8qKlxyXG4gKiBSZXRyaWV2ZXMgdGhlIGxpY2Vuc2UgZW50cnkgZm9yIGEgbWVkaWEgZmlsZSBmcm9tIGxpY2Vuc2UuanNvbi5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IGFic29sdXRlUGF0aCAtIHRoZSBwYXRoIGZvciB0aGUgbWVkaWEgZmlsZVxyXG4gKiBAcmV0dXJucyB7T2JqZWN0fG51bGx9IHRoZSBlbnRyeSBmcm9tIHRoZSBsaWNlbnNlLmpzb24gZmlsZSwgbnVsbCBpZiB0aGVyZSBpcyBubyBlbnRyeVxyXG4gKlxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0TGljZW5zZUVudHJ5KCBhYnNvbHV0ZVBhdGggKSB7XHJcblxyXG4gIGNvbnN0IGxhc3RTbGFzaEluZGV4ID0gYWJzb2x1dGVQYXRoLmxhc3RJbmRleE9mKCAnLycgKTtcclxuICBjb25zdCBwcmVmaXggPSBhYnNvbHV0ZVBhdGguc3Vic3RyaW5nKCAwLCBsYXN0U2xhc2hJbmRleCApO1xyXG4gIGNvbnN0IGxpY2Vuc2VGaWxlbmFtZSA9IGAke3ByZWZpeH0vbGljZW5zZS5qc29uYDsgLy8gbGljZW5zZS5qc29uIGlzIGEgc2libGluZyBvZiB0aGUgbWVkaWEgZmlsZVxyXG4gIGNvbnN0IG1lZGlhRmlsZW5hbWUgPSBhYnNvbHV0ZVBhdGguc3Vic3RyaW5nKCBsYXN0U2xhc2hJbmRleCArIDEgKTsgLy8gZmllbGQgbmFtZSBpbiBsaWNlbnNlLmpzb25cclxuXHJcbiAgLy8gcmVhZCBsaWNlbnNlLmpzb24gaWYgaXQgZXhpc3RzXHJcbiAgaWYgKCAhZnMuZXhpc3RzU3luYyggbGljZW5zZUZpbGVuYW1lICkgKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcbiAgY29uc3QgZmlsZUNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKCBsaWNlbnNlRmlsZW5hbWUsICd1dGY4JyApO1xyXG4gIGxldCBqc29uID0gbnVsbDtcclxuICB0cnkge1xyXG4gICAganNvbiA9IEpTT04ucGFyc2UoIGZpbGVDb250ZW50cyApO1xyXG4gIH1cclxuICBjYXRjaCggZXJyICkge1xyXG4gICAgaWYgKCBlcnIgaW5zdGFuY2VvZiBTeW50YXhFcnJvciApIHtcclxuICAgICAgLy8gZGVmYXVsdCBtZXNzYWdlIGlzIGluY29tcHJlaGVuc2libGUsIHNlZSBjaGlwcGVyIzQ0OVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBzeW50YXggZXJyb3IgaW4gJHtsaWNlbnNlRmlsZW5hbWV9OiAke2Vyci5tZXNzYWdlfWAgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBnZXQgdGhlIG1lZGlhIGZpbGUncyBsaWNlbnNlIGVudHJ5XHJcbiAgY29uc3QgZW50cnkgPSBqc29uWyBtZWRpYUZpbGVuYW1lIF07XHJcbiAgaWYgKCAhZW50cnkgKSB7XHJcbiAgICByZXR1cm4gbnVsbDsgLy8gTm90IGFubm90YXRlZCBpbiBmaWxlXHJcbiAgfVxyXG4gIHJldHVybiBlbnRyeTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnZXRMaWNlbnNlRW50cnk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFHQSxNQUFNQSxFQUFFLEdBQUdDLE9BQU8sQ0FBRSxJQUFLLENBQUM7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTQyxlQUFlQSxDQUFFQyxZQUFZLEVBQUc7RUFFdkMsTUFBTUMsY0FBYyxHQUFHRCxZQUFZLENBQUNFLFdBQVcsQ0FBRSxHQUFJLENBQUM7RUFDdEQsTUFBTUMsTUFBTSxHQUFHSCxZQUFZLENBQUNJLFNBQVMsQ0FBRSxDQUFDLEVBQUVILGNBQWUsQ0FBQztFQUMxRCxNQUFNSSxlQUFlLEdBQUksR0FBRUYsTUFBTyxlQUFjLENBQUMsQ0FBQztFQUNsRCxNQUFNRyxhQUFhLEdBQUdOLFlBQVksQ0FBQ0ksU0FBUyxDQUFFSCxjQUFjLEdBQUcsQ0FBRSxDQUFDLENBQUMsQ0FBQzs7RUFFcEU7RUFDQSxJQUFLLENBQUNKLEVBQUUsQ0FBQ1UsVUFBVSxDQUFFRixlQUFnQixDQUFDLEVBQUc7SUFDdkMsT0FBTyxJQUFJO0VBQ2I7RUFDQSxNQUFNRyxZQUFZLEdBQUdYLEVBQUUsQ0FBQ1ksWUFBWSxDQUFFSixlQUFlLEVBQUUsTUFBTyxDQUFDO0VBQy9ELElBQUlLLElBQUksR0FBRyxJQUFJO0VBQ2YsSUFBSTtJQUNGQSxJQUFJLEdBQUdDLElBQUksQ0FBQ0MsS0FBSyxDQUFFSixZQUFhLENBQUM7RUFDbkMsQ0FBQyxDQUNELE9BQU9LLEdBQUcsRUFBRztJQUNYLElBQUtBLEdBQUcsWUFBWUMsV0FBVyxFQUFHO01BQ2hDO01BQ0EsTUFBTSxJQUFJQyxLQUFLLENBQUcsbUJBQWtCVixlQUFnQixLQUFJUSxHQUFHLENBQUNHLE9BQVEsRUFBRSxDQUFDO0lBQ3pFLENBQUMsTUFDSTtNQUNILE1BQU1ILEdBQUc7SUFDWDtFQUNGOztFQUVBO0VBQ0EsTUFBTUksS0FBSyxHQUFHUCxJQUFJLENBQUVKLGFBQWEsQ0FBRTtFQUNuQyxJQUFLLENBQUNXLEtBQUssRUFBRztJQUNaLE9BQU8sSUFBSSxDQUFDLENBQUM7RUFDZjs7RUFDQSxPQUFPQSxLQUFLO0FBQ2Q7QUFFQUMsTUFBTSxDQUFDQyxPQUFPLEdBQUdwQixlQUFlIn0=