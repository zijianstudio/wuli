// Copyright 2015-2022, University of Colorado Boulder

/**
 * This grunt task iterates over all of the license.json files and reports any media files (images, sound, ...)
 * that have any of the following problems:
 *
 * incompatible-license    Known to be from an unapproved source outside of PhET
 * not-annotated           Missing license.json file or missing entry in license.json
 * missing-file            There is an entry in the license.json but no corresponding file
 *
 * This can be run from any simulation directory with `grunt report-media` and it reports for
 * all directories (not just the simulation at hand).
 *
 * Note that this program relies on numerous heuristics for determining the output, such as allowed entries that
 * determine if a file originates from PhET.
 *
 * See https://github.com/phetsims/tasks/issues/274
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

const ChipperConstants = require('../common/ChipperConstants');
const getLicenseEntry = require('../common/getLicenseEntry');
const getPhetLibs = require('../grunt/getPhetLibs');
const grunt = require('grunt');
const path = require('path');

/**
 * @param {string} repo
 * @returns {boolean} success
 */
module.exports = async repo => {
  // Check for the dependencies of the target repo
  const dependencies = getPhetLibs(repo);

  // Start in the github checkout dir (above one of the sibling directories)
  const directory = process.cwd();
  const rootdir = `${directory}/../`;

  // Determines if our report was successful.
  let success = true;

  // Create a fast report based on the license.json files for the specified repository and directory (images or sound)
  for (const repo of dependencies) {
    // Check if the repo is missing from the directory
    if (!grunt.file.exists(rootdir + repo)) {
      if (repo.indexOf('phet-io') === 0 || repo === 'studio') {
        console.log(`skipping repo (not checked out): ${repo}`);
        success = true;
        continue;
      } else {
        console.log(`missing repo: ${repo}`);
        success = false;
        continue;
      }
    }
    for (const directory of ChipperConstants.MEDIA_TYPES) {
      const searchDir = `${rootdir + repo}/${directory}`;

      // Projects don't necessarily have all media directories
      if (grunt.file.exists(searchDir)) {
        // Iterate over all media directories, such as images and sounds recursively
        grunt.file.recurse(searchDir, (abspath, rootdir, subdir, filename) => {
          if (filename.endsWith('.js') || filename.endsWith('.ts')) {
            return; // modulified data doesn't need to be checked
          }

          // Some files don't need to be attributed in the license.json
          if (abspath.indexOf('README.md') < 0 && filename.indexOf('license.json') !== 0) {
            // Classify the resource
            const result = getLicenseEntry(abspath);
            if (!result) {
              grunt.log.error(`not-annotated: ${repo}/${directory}/${filename}`);
              success = false;
            }
            // Report if it is a problem
            else if (result.isProblematic === true) {
              grunt.log.error(`incompatible-license: ${repo}/${directory}/${filename}`);
              success = false;
            }
          }

          // Now iterate through the license.json entries and see which are missing files
          // This helps to identify stale entries in the license.json files.
          if (filename === 'license.json') {
            const file = grunt.file.read(abspath);
            const json = JSON.parse(file);

            // For each key in the json file, make sure that file exists in the directory
            for (const key in json) {
              if (json.hasOwnProperty(key)) {
                // Checks for files in directory and subdirectory
                const resourceFilename = `${path.dirname(abspath)}/${key}`;
                const exists = grunt.file.exists(resourceFilename);
                if (!exists) {
                  grunt.log.error(`missing-file: ${repo}/${directory}/${key}`);
                  success = false;
                }
              }
            }
          }
        });
      }
    }
  }
  if (!success) {
    grunt.fail.fatal('There is an issue with the licenses for media types.');
  }
  return success;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyQ29uc3RhbnRzIiwicmVxdWlyZSIsImdldExpY2Vuc2VFbnRyeSIsImdldFBoZXRMaWJzIiwiZ3J1bnQiLCJwYXRoIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJkZXBlbmRlbmNpZXMiLCJkaXJlY3RvcnkiLCJwcm9jZXNzIiwiY3dkIiwicm9vdGRpciIsInN1Y2Nlc3MiLCJmaWxlIiwiZXhpc3RzIiwiaW5kZXhPZiIsImNvbnNvbGUiLCJsb2ciLCJNRURJQV9UWVBFUyIsInNlYXJjaERpciIsInJlY3Vyc2UiLCJhYnNwYXRoIiwic3ViZGlyIiwiZmlsZW5hbWUiLCJlbmRzV2l0aCIsInJlc3VsdCIsImVycm9yIiwiaXNQcm9ibGVtYXRpYyIsInJlYWQiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwia2V5IiwiaGFzT3duUHJvcGVydHkiLCJyZXNvdXJjZUZpbGVuYW1lIiwiZGlybmFtZSIsImZhaWwiLCJmYXRhbCJdLCJzb3VyY2VzIjpbInJlcG9ydE1lZGlhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgZ3J1bnQgdGFzayBpdGVyYXRlcyBvdmVyIGFsbCBvZiB0aGUgbGljZW5zZS5qc29uIGZpbGVzIGFuZCByZXBvcnRzIGFueSBtZWRpYSBmaWxlcyAoaW1hZ2VzLCBzb3VuZCwgLi4uKVxyXG4gKiB0aGF0IGhhdmUgYW55IG9mIHRoZSBmb2xsb3dpbmcgcHJvYmxlbXM6XHJcbiAqXHJcbiAqIGluY29tcGF0aWJsZS1saWNlbnNlICAgIEtub3duIHRvIGJlIGZyb20gYW4gdW5hcHByb3ZlZCBzb3VyY2Ugb3V0c2lkZSBvZiBQaEVUXHJcbiAqIG5vdC1hbm5vdGF0ZWQgICAgICAgICAgIE1pc3NpbmcgbGljZW5zZS5qc29uIGZpbGUgb3IgbWlzc2luZyBlbnRyeSBpbiBsaWNlbnNlLmpzb25cclxuICogbWlzc2luZy1maWxlICAgICAgICAgICAgVGhlcmUgaXMgYW4gZW50cnkgaW4gdGhlIGxpY2Vuc2UuanNvbiBidXQgbm8gY29ycmVzcG9uZGluZyBmaWxlXHJcbiAqXHJcbiAqIFRoaXMgY2FuIGJlIHJ1biBmcm9tIGFueSBzaW11bGF0aW9uIGRpcmVjdG9yeSB3aXRoIGBncnVudCByZXBvcnQtbWVkaWFgIGFuZCBpdCByZXBvcnRzIGZvclxyXG4gKiBhbGwgZGlyZWN0b3JpZXMgKG5vdCBqdXN0IHRoZSBzaW11bGF0aW9uIGF0IGhhbmQpLlxyXG4gKlxyXG4gKiBOb3RlIHRoYXQgdGhpcyBwcm9ncmFtIHJlbGllcyBvbiBudW1lcm91cyBoZXVyaXN0aWNzIGZvciBkZXRlcm1pbmluZyB0aGUgb3V0cHV0LCBzdWNoIGFzIGFsbG93ZWQgZW50cmllcyB0aGF0XHJcbiAqIGRldGVybWluZSBpZiBhIGZpbGUgb3JpZ2luYXRlcyBmcm9tIFBoRVQuXHJcbiAqXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFza3MvaXNzdWVzLzI3NFxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBDaGlwcGVyQ29uc3RhbnRzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9DaGlwcGVyQ29uc3RhbnRzJyApO1xyXG5jb25zdCBnZXRMaWNlbnNlRW50cnkgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dldExpY2Vuc2VFbnRyeScgKTtcclxuY29uc3QgZ2V0UGhldExpYnMgPSByZXF1aXJlKCAnLi4vZ3J1bnQvZ2V0UGhldExpYnMnICk7XHJcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xyXG5jb25zdCBwYXRoID0gcmVxdWlyZSggJ3BhdGgnICk7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG9cclxuICogQHJldHVybnMge2Jvb2xlYW59IHN1Y2Nlc3NcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgcmVwbyA9PiB7XHJcblxyXG4gIC8vIENoZWNrIGZvciB0aGUgZGVwZW5kZW5jaWVzIG9mIHRoZSB0YXJnZXQgcmVwb1xyXG4gIGNvbnN0IGRlcGVuZGVuY2llcyA9IGdldFBoZXRMaWJzKCByZXBvICk7XHJcblxyXG4gIC8vIFN0YXJ0IGluIHRoZSBnaXRodWIgY2hlY2tvdXQgZGlyIChhYm92ZSBvbmUgb2YgdGhlIHNpYmxpbmcgZGlyZWN0b3JpZXMpXHJcbiAgY29uc3QgZGlyZWN0b3J5ID0gcHJvY2Vzcy5jd2QoKTtcclxuICBjb25zdCByb290ZGlyID0gYCR7ZGlyZWN0b3J5fS8uLi9gO1xyXG5cclxuICAvLyBEZXRlcm1pbmVzIGlmIG91ciByZXBvcnQgd2FzIHN1Y2Nlc3NmdWwuXHJcbiAgbGV0IHN1Y2Nlc3MgPSB0cnVlO1xyXG5cclxuICAvLyBDcmVhdGUgYSBmYXN0IHJlcG9ydCBiYXNlZCBvbiB0aGUgbGljZW5zZS5qc29uIGZpbGVzIGZvciB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkgYW5kIGRpcmVjdG9yeSAoaW1hZ2VzIG9yIHNvdW5kKVxyXG4gIGZvciAoIGNvbnN0IHJlcG8gb2YgZGVwZW5kZW5jaWVzICkge1xyXG5cclxuICAgIC8vIENoZWNrIGlmIHRoZSByZXBvIGlzIG1pc3NpbmcgZnJvbSB0aGUgZGlyZWN0b3J5XHJcbiAgICBpZiAoICFncnVudC5maWxlLmV4aXN0cyggcm9vdGRpciArIHJlcG8gKSApIHtcclxuXHJcbiAgICAgIGlmICggcmVwby5pbmRleE9mKCAncGhldC1pbycgKSA9PT0gMCB8fCByZXBvID09PSAnc3R1ZGlvJyApIHtcclxuICAgICAgICBjb25zb2xlLmxvZyggYHNraXBwaW5nIHJlcG8gKG5vdCBjaGVja2VkIG91dCk6ICR7cmVwb31gICk7XHJcbiAgICAgICAgc3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coIGBtaXNzaW5nIHJlcG86ICR7cmVwb31gICk7XHJcbiAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmb3IgKCBjb25zdCBkaXJlY3Rvcnkgb2YgQ2hpcHBlckNvbnN0YW50cy5NRURJQV9UWVBFUyApIHtcclxuICAgICAgY29uc3Qgc2VhcmNoRGlyID0gYCR7cm9vdGRpciArIHJlcG99LyR7ZGlyZWN0b3J5fWA7XHJcblxyXG4gICAgICAvLyBQcm9qZWN0cyBkb24ndCBuZWNlc3NhcmlseSBoYXZlIGFsbCBtZWRpYSBkaXJlY3Rvcmllc1xyXG4gICAgICBpZiAoIGdydW50LmZpbGUuZXhpc3RzKCBzZWFyY2hEaXIgKSApIHtcclxuXHJcbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIGFsbCBtZWRpYSBkaXJlY3Rvcmllcywgc3VjaCBhcyBpbWFnZXMgYW5kIHNvdW5kcyByZWN1cnNpdmVseVxyXG4gICAgICAgIGdydW50LmZpbGUucmVjdXJzZSggc2VhcmNoRGlyLCAoIGFic3BhdGgsIHJvb3RkaXIsIHN1YmRpciwgZmlsZW5hbWUgKSA9PiB7XHJcblxyXG4gICAgICAgICAgaWYgKCBmaWxlbmFtZS5lbmRzV2l0aCggJy5qcycgKSB8fCBmaWxlbmFtZS5lbmRzV2l0aCggJy50cycgKSApIHtcclxuICAgICAgICAgICAgcmV0dXJuOyAvLyBtb2R1bGlmaWVkIGRhdGEgZG9lc24ndCBuZWVkIHRvIGJlIGNoZWNrZWRcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTb21lIGZpbGVzIGRvbid0IG5lZWQgdG8gYmUgYXR0cmlidXRlZCBpbiB0aGUgbGljZW5zZS5qc29uXHJcbiAgICAgICAgICBpZiAoIGFic3BhdGguaW5kZXhPZiggJ1JFQURNRS5tZCcgKSA8IDAgJiZcclxuICAgICAgICAgICAgICAgZmlsZW5hbWUuaW5kZXhPZiggJ2xpY2Vuc2UuanNvbicgKSAhPT0gMCApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIENsYXNzaWZ5IHRoZSByZXNvdXJjZVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBnZXRMaWNlbnNlRW50cnkoIGFic3BhdGggKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggIXJlc3VsdCApIHtcclxuICAgICAgICAgICAgICBncnVudC5sb2cuZXJyb3IoIGBub3QtYW5ub3RhdGVkOiAke3JlcG99LyR7ZGlyZWN0b3J5fS8ke2ZpbGVuYW1lfWAgKTtcclxuICAgICAgICAgICAgICBzdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gUmVwb3J0IGlmIGl0IGlzIGEgcHJvYmxlbVxyXG4gICAgICAgICAgICBlbHNlIGlmICggcmVzdWx0LmlzUHJvYmxlbWF0aWMgPT09IHRydWUgKSB7XHJcbiAgICAgICAgICAgICAgZ3J1bnQubG9nLmVycm9yKCBgaW5jb21wYXRpYmxlLWxpY2Vuc2U6ICR7cmVwb30vJHtkaXJlY3Rvcnl9LyR7ZmlsZW5hbWV9YCApO1xyXG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIE5vdyBpdGVyYXRlIHRocm91Z2ggdGhlIGxpY2Vuc2UuanNvbiBlbnRyaWVzIGFuZCBzZWUgd2hpY2ggYXJlIG1pc3NpbmcgZmlsZXNcclxuICAgICAgICAgIC8vIFRoaXMgaGVscHMgdG8gaWRlbnRpZnkgc3RhbGUgZW50cmllcyBpbiB0aGUgbGljZW5zZS5qc29uIGZpbGVzLlxyXG4gICAgICAgICAgaWYgKCBmaWxlbmFtZSA9PT0gJ2xpY2Vuc2UuanNvbicgKSB7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmaWxlID0gZ3J1bnQuZmlsZS5yZWFkKCBhYnNwYXRoICk7XHJcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKCBmaWxlICk7XHJcblxyXG4gICAgICAgICAgICAvLyBGb3IgZWFjaCBrZXkgaW4gdGhlIGpzb24gZmlsZSwgbWFrZSBzdXJlIHRoYXQgZmlsZSBleGlzdHMgaW4gdGhlIGRpcmVjdG9yeVxyXG4gICAgICAgICAgICBmb3IgKCBjb25zdCBrZXkgaW4ganNvbiApIHtcclxuICAgICAgICAgICAgICBpZiAoIGpzb24uaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENoZWNrcyBmb3IgZmlsZXMgaW4gZGlyZWN0b3J5IGFuZCBzdWJkaXJlY3RvcnlcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlc291cmNlRmlsZW5hbWUgPSBgJHtwYXRoLmRpcm5hbWUoIGFic3BhdGggKX0vJHtrZXl9YDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0cyA9IGdydW50LmZpbGUuZXhpc3RzKCByZXNvdXJjZUZpbGVuYW1lICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCAhZXhpc3RzICkge1xyXG4gICAgICAgICAgICAgICAgICBncnVudC5sb2cuZXJyb3IoIGBtaXNzaW5nLWZpbGU6ICR7cmVwb30vJHtkaXJlY3Rvcnl9LyR7a2V5fWAgKTtcclxuICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKCAhc3VjY2VzcyApIHtcclxuICAgIGdydW50LmZhaWwuZmF0YWwoICdUaGVyZSBpcyBhbiBpc3N1ZSB3aXRoIHRoZSBsaWNlbnNlcyBmb3IgbWVkaWEgdHlwZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHN1Y2Nlc3M7XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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