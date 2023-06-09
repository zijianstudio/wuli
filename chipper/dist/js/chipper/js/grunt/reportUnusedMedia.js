// Copyright 2015-2021, University of Colorado Boulder

/**
 * Report which media files (such as images and sounds) from a sim were not used in the simulation with a require
 * statement.
 *
 * Each time a resource is loaded by a plugin (image, sounds, mipmap,...) its license info is added to this global by
 * the plugin.  After all resources are loaded, the global will contain the list of all resources that are actually used
 * by the sim.  Comparing what's in the filesystem to this list identifies resources that are unused.
 *
 * See https://github.com/phetsims/chipper/issues/172
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (Phet Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

// modules
const ChipperConstants = require('../../../chipper/js/common/ChipperConstants');
const grunt = require('grunt');

/**
 * @param {string} repo - Name of the repo
 * @param {Array.<string>} usedModules - Used modules within the repo
 */
module.exports = (repo, usedModules) => {
  // on Windows, paths are reported with a backslash, normalize to forward slashes so this works everywhere
  const normalizedUsedModules = usedModules.map(module => module.split('\\').join('/'));
  ChipperConstants.MEDIA_TYPES.forEach(mediaType => {
    // Iterate over media directories and sub-directories
    const subdirectory = `../${repo}/${mediaType}`;
    if (grunt.file.isDir(subdirectory)) {
      grunt.file.recurse(subdirectory, (abspath, rootdir, subdir, filename) => {
        if (filename !== 'license.json' && filename !== 'README.md' && filename.indexOf('.js') !== -1) {
          const module = subdir ? `${repo}/${mediaType}/${subdir}/${filename}` : `${repo}/${mediaType}/${filename}`;

          // If no licenseEntries were registered, or some were registered but not one corresponding to this file
          if (!normalizedUsedModules.includes(`chipper/dist/js/${module}`)) {
            grunt.log.warn(`Unused ${mediaType} module: ${module}`);
          }
        }
      });
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyQ29uc3RhbnRzIiwicmVxdWlyZSIsImdydW50IiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ1c2VkTW9kdWxlcyIsIm5vcm1hbGl6ZWRVc2VkTW9kdWxlcyIsIm1hcCIsInNwbGl0Iiwiam9pbiIsIk1FRElBX1RZUEVTIiwiZm9yRWFjaCIsIm1lZGlhVHlwZSIsInN1YmRpcmVjdG9yeSIsImZpbGUiLCJpc0RpciIsInJlY3Vyc2UiLCJhYnNwYXRoIiwicm9vdGRpciIsInN1YmRpciIsImZpbGVuYW1lIiwiaW5kZXhPZiIsImluY2x1ZGVzIiwibG9nIiwid2FybiJdLCJzb3VyY2VzIjpbInJlcG9ydFVudXNlZE1lZGlhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcG9ydCB3aGljaCBtZWRpYSBmaWxlcyAoc3VjaCBhcyBpbWFnZXMgYW5kIHNvdW5kcykgZnJvbSBhIHNpbSB3ZXJlIG5vdCB1c2VkIGluIHRoZSBzaW11bGF0aW9uIHdpdGggYSByZXF1aXJlXHJcbiAqIHN0YXRlbWVudC5cclxuICpcclxuICogRWFjaCB0aW1lIGEgcmVzb3VyY2UgaXMgbG9hZGVkIGJ5IGEgcGx1Z2luIChpbWFnZSwgc291bmRzLCBtaXBtYXAsLi4uKSBpdHMgbGljZW5zZSBpbmZvIGlzIGFkZGVkIHRvIHRoaXMgZ2xvYmFsIGJ5XHJcbiAqIHRoZSBwbHVnaW4uICBBZnRlciBhbGwgcmVzb3VyY2VzIGFyZSBsb2FkZWQsIHRoZSBnbG9iYWwgd2lsbCBjb250YWluIHRoZSBsaXN0IG9mIGFsbCByZXNvdXJjZXMgdGhhdCBhcmUgYWN0dWFsbHkgdXNlZFxyXG4gKiBieSB0aGUgc2ltLiAgQ29tcGFyaW5nIHdoYXQncyBpbiB0aGUgZmlsZXN5c3RlbSB0byB0aGlzIGxpc3QgaWRlbnRpZmllcyByZXNvdXJjZXMgdGhhdCBhcmUgdW51c2VkLlxyXG4gKlxyXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NoaXBwZXIvaXNzdWVzLzE3MlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhldCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG4vLyBtb2R1bGVzXHJcbmNvbnN0IENoaXBwZXJDb25zdGFudHMgPSByZXF1aXJlKCAnLi4vLi4vLi4vY2hpcHBlci9qcy9jb21tb24vQ2hpcHBlckNvbnN0YW50cycgKTtcclxuY29uc3QgZ3J1bnQgPSByZXF1aXJlKCAnZ3J1bnQnICk7XHJcblxyXG4vKipcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBOYW1lIG9mIHRoZSByZXBvXHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IHVzZWRNb2R1bGVzIC0gVXNlZCBtb2R1bGVzIHdpdGhpbiB0aGUgcmVwb1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSAoIHJlcG8sIHVzZWRNb2R1bGVzICkgPT4ge1xyXG5cclxuICAvLyBvbiBXaW5kb3dzLCBwYXRocyBhcmUgcmVwb3J0ZWQgd2l0aCBhIGJhY2tzbGFzaCwgbm9ybWFsaXplIHRvIGZvcndhcmQgc2xhc2hlcyBzbyB0aGlzIHdvcmtzIGV2ZXJ5d2hlcmVcclxuICBjb25zdCBub3JtYWxpemVkVXNlZE1vZHVsZXMgPSB1c2VkTW9kdWxlcy5tYXAoIG1vZHVsZSA9PiBtb2R1bGUuc3BsaXQoICdcXFxcJyApLmpvaW4oICcvJyApICk7XHJcblxyXG4gIENoaXBwZXJDb25zdGFudHMuTUVESUFfVFlQRVMuZm9yRWFjaCggbWVkaWFUeXBlID0+IHtcclxuXHJcbiAgICAvLyBJdGVyYXRlIG92ZXIgbWVkaWEgZGlyZWN0b3JpZXMgYW5kIHN1Yi1kaXJlY3Rvcmllc1xyXG4gICAgY29uc3Qgc3ViZGlyZWN0b3J5ID0gYC4uLyR7cmVwb30vJHttZWRpYVR5cGV9YDtcclxuICAgIGlmICggZ3J1bnQuZmlsZS5pc0Rpciggc3ViZGlyZWN0b3J5ICkgKSB7XHJcbiAgICAgIGdydW50LmZpbGUucmVjdXJzZSggc3ViZGlyZWN0b3J5LCAoIGFic3BhdGgsIHJvb3RkaXIsIHN1YmRpciwgZmlsZW5hbWUgKSA9PiB7XHJcblxyXG4gICAgICAgIGlmICggZmlsZW5hbWUgIT09ICdsaWNlbnNlLmpzb24nICYmIGZpbGVuYW1lICE9PSAnUkVBRE1FLm1kJyAmJiBmaWxlbmFtZS5pbmRleE9mKCAnLmpzJyApICE9PSAtMSApIHtcclxuICAgICAgICAgIGNvbnN0IG1vZHVsZSA9IHN1YmRpciA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBgJHtyZXBvfS8ke21lZGlhVHlwZX0vJHtzdWJkaXJ9LyR7ZmlsZW5hbWV9YCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBgJHtyZXBvfS8ke21lZGlhVHlwZX0vJHtmaWxlbmFtZX1gO1xyXG5cclxuICAgICAgICAgIC8vIElmIG5vIGxpY2Vuc2VFbnRyaWVzIHdlcmUgcmVnaXN0ZXJlZCwgb3Igc29tZSB3ZXJlIHJlZ2lzdGVyZWQgYnV0IG5vdCBvbmUgY29ycmVzcG9uZGluZyB0byB0aGlzIGZpbGVcclxuICAgICAgICAgIGlmICggIW5vcm1hbGl6ZWRVc2VkTW9kdWxlcy5pbmNsdWRlcyggYGNoaXBwZXIvZGlzdC9qcy8ke21vZHVsZX1gICkgKSB7XHJcbiAgICAgICAgICAgIGdydW50LmxvZy53YXJuKCBgVW51c2VkICR7bWVkaWFUeXBlfSBtb2R1bGU6ICR7bW9kdWxlfWAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9ICk7XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsTUFBTUEsZ0JBQWdCLEdBQUdDLE9BQU8sQ0FBRSw2Q0FBOEMsQ0FBQztBQUNqRixNQUFNQyxLQUFLLEdBQUdELE9BQU8sQ0FBRSxPQUFRLENBQUM7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0FFLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLENBQUVDLElBQUksRUFBRUMsV0FBVyxLQUFNO0VBRXhDO0VBQ0EsTUFBTUMscUJBQXFCLEdBQUdELFdBQVcsQ0FBQ0UsR0FBRyxDQUFFTCxNQUFNLElBQUlBLE1BQU0sQ0FBQ00sS0FBSyxDQUFFLElBQUssQ0FBQyxDQUFDQyxJQUFJLENBQUUsR0FBSSxDQUFFLENBQUM7RUFFM0ZWLGdCQUFnQixDQUFDVyxXQUFXLENBQUNDLE9BQU8sQ0FBRUMsU0FBUyxJQUFJO0lBRWpEO0lBQ0EsTUFBTUMsWUFBWSxHQUFJLE1BQUtULElBQUssSUFBR1EsU0FBVSxFQUFDO0lBQzlDLElBQUtYLEtBQUssQ0FBQ2EsSUFBSSxDQUFDQyxLQUFLLENBQUVGLFlBQWEsQ0FBQyxFQUFHO01BQ3RDWixLQUFLLENBQUNhLElBQUksQ0FBQ0UsT0FBTyxDQUFFSCxZQUFZLEVBQUUsQ0FBRUksT0FBTyxFQUFFQyxPQUFPLEVBQUVDLE1BQU0sRUFBRUMsUUFBUSxLQUFNO1FBRTFFLElBQUtBLFFBQVEsS0FBSyxjQUFjLElBQUlBLFFBQVEsS0FBSyxXQUFXLElBQUlBLFFBQVEsQ0FBQ0MsT0FBTyxDQUFFLEtBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFHO1VBQ2pHLE1BQU1uQixNQUFNLEdBQUdpQixNQUFNLEdBQ0wsR0FBRWYsSUFBSyxJQUFHUSxTQUFVLElBQUdPLE1BQU8sSUFBR0MsUUFBUyxFQUFDLEdBQzNDLEdBQUVoQixJQUFLLElBQUdRLFNBQVUsSUFBR1EsUUFBUyxFQUFDOztVQUVqRDtVQUNBLElBQUssQ0FBQ2QscUJBQXFCLENBQUNnQixRQUFRLENBQUcsbUJBQWtCcEIsTUFBTyxFQUFFLENBQUMsRUFBRztZQUNwRUQsS0FBSyxDQUFDc0IsR0FBRyxDQUFDQyxJQUFJLENBQUcsVUFBU1osU0FBVSxZQUFXVixNQUFPLEVBQUUsQ0FBQztVQUMzRDtRQUNGO01BQ0YsQ0FBRSxDQUFDO0lBQ0w7RUFDRixDQUFFLENBQUM7QUFDTCxDQUFDIn0=