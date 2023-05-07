// Copyright 2017, University of Colorado Boulder

/**
 * Updates the top-level dependencies.json, given the result of a build in the build directory.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const ChipperVersion = require('./ChipperVersion');
const copyFile = require('./copyFile');
const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitPush = require('./gitPush');
const winston = require('winston');

/**
 * Updates the top-level dependencies.json, given the result of a build in the build directory.
 * @public
 *
 * @param {string} repo - The repository that was built
 * @param {Array.<string>} brands - The brands that were built
 * @param {string} message
 * @param {string} branch - The branch we're on (to push to)
 * @returns {Promise}
 */
module.exports = async function (repo, brands, message, branch) {
  winston.info(`updating top-level dependencies.json for ${repo} ${message} to branch ${branch}`);
  const chipperVersion = ChipperVersion.getFromRepository();
  let buildDepdenciesFile;

  // Chipper "1.0" (it was called such) had version 0.0.0 in its package.json
  if (chipperVersion.major === 0 && chipperVersion.minor === 0) {
    buildDepdenciesFile = `../${repo}/build/dependencies.json`;
  }
  // Chipper 2.0
  else if (chipperVersion.major === 2 && chipperVersion.minor === 0) {
    buildDepdenciesFile = `../${repo}/build/${brands[0]}/dependencies.json`;
  } else {
    throw new Error(`unsupported chipper version: ${chipperVersion.toString()}`);
  }
  await copyFile(buildDepdenciesFile, `../${repo}/dependencies.json`);
  await gitAdd(repo, 'dependencies.json');
  await gitCommit(repo, `updated dependencies.json for ${message}`);
  await gitPush(repo, branch);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyVmVyc2lvbiIsInJlcXVpcmUiLCJjb3B5RmlsZSIsImdpdEFkZCIsImdpdENvbW1pdCIsImdpdFB1c2giLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJicmFuZHMiLCJtZXNzYWdlIiwiYnJhbmNoIiwiaW5mbyIsImNoaXBwZXJWZXJzaW9uIiwiZ2V0RnJvbVJlcG9zaXRvcnkiLCJidWlsZERlcGRlbmNpZXNGaWxlIiwibWFqb3IiLCJtaW5vciIsIkVycm9yIiwidG9TdHJpbmciXSwic291cmNlcyI6WyJ1cGRhdGVEZXBlbmRlbmNpZXNKU09OLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoZSB0b3AtbGV2ZWwgZGVwZW5kZW5jaWVzLmpzb24sIGdpdmVuIHRoZSByZXN1bHQgb2YgYSBidWlsZCBpbiB0aGUgYnVpbGQgZGlyZWN0b3J5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgQ2hpcHBlclZlcnNpb24gPSByZXF1aXJlKCAnLi9DaGlwcGVyVmVyc2lvbicgKTtcclxuY29uc3QgY29weUZpbGUgPSByZXF1aXJlKCAnLi9jb3B5RmlsZScgKTtcclxuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xyXG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XHJcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi9naXRQdXNoJyApO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XHJcblxyXG4vKipcclxuICogVXBkYXRlcyB0aGUgdG9wLWxldmVsIGRlcGVuZGVuY2llcy5qc29uLCBnaXZlbiB0aGUgcmVzdWx0IG9mIGEgYnVpbGQgaW4gdGhlIGJ1aWxkIGRpcmVjdG9yeS5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IHRoYXQgd2FzIGJ1aWx0XHJcbiAqIEBwYXJhbSB7QXJyYXkuPHN0cmluZz59IGJyYW5kcyAtIFRoZSBicmFuZHMgdGhhdCB3ZXJlIGJ1aWx0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXNzYWdlXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBUaGUgYnJhbmNoIHdlJ3JlIG9uICh0byBwdXNoIHRvKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIGJyYW5kcywgbWVzc2FnZSwgYnJhbmNoICkge1xyXG4gIHdpbnN0b24uaW5mbyggYHVwZGF0aW5nIHRvcC1sZXZlbCBkZXBlbmRlbmNpZXMuanNvbiBmb3IgJHtyZXBvfSAke21lc3NhZ2V9IHRvIGJyYW5jaCAke2JyYW5jaH1gICk7XHJcblxyXG4gIGNvbnN0IGNoaXBwZXJWZXJzaW9uID0gQ2hpcHBlclZlcnNpb24uZ2V0RnJvbVJlcG9zaXRvcnkoKTtcclxuXHJcbiAgbGV0IGJ1aWxkRGVwZGVuY2llc0ZpbGU7XHJcblxyXG4gIC8vIENoaXBwZXIgXCIxLjBcIiAoaXQgd2FzIGNhbGxlZCBzdWNoKSBoYWQgdmVyc2lvbiAwLjAuMCBpbiBpdHMgcGFja2FnZS5qc29uXHJcbiAgaWYgKCBjaGlwcGVyVmVyc2lvbi5tYWpvciA9PT0gMCAmJiBjaGlwcGVyVmVyc2lvbi5taW5vciA9PT0gMCApIHtcclxuICAgIGJ1aWxkRGVwZGVuY2llc0ZpbGUgPSBgLi4vJHtyZXBvfS9idWlsZC9kZXBlbmRlbmNpZXMuanNvbmA7XHJcbiAgfVxyXG4gIC8vIENoaXBwZXIgMi4wXHJcbiAgZWxzZSBpZiAoIGNoaXBwZXJWZXJzaW9uLm1ham9yID09PSAyICYmIGNoaXBwZXJWZXJzaW9uLm1pbm9yID09PSAwICkge1xyXG4gICAgYnVpbGREZXBkZW5jaWVzRmlsZSA9IGAuLi8ke3JlcG99L2J1aWxkLyR7YnJhbmRzWyAwIF19L2RlcGVuZGVuY2llcy5qc29uYDtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGB1bnN1cHBvcnRlZCBjaGlwcGVyIHZlcnNpb246ICR7Y2hpcHBlclZlcnNpb24udG9TdHJpbmcoKX1gICk7XHJcbiAgfVxyXG5cclxuICBhd2FpdCBjb3B5RmlsZSggYnVpbGREZXBkZW5jaWVzRmlsZSwgYC4uLyR7cmVwb30vZGVwZW5kZW5jaWVzLmpzb25gICk7XHJcbiAgYXdhaXQgZ2l0QWRkKCByZXBvLCAnZGVwZW5kZW5jaWVzLmpzb24nICk7XHJcbiAgYXdhaXQgZ2l0Q29tbWl0KCByZXBvLCBgdXBkYXRlZCBkZXBlbmRlbmNpZXMuanNvbiBmb3IgJHttZXNzYWdlfWAgKTtcclxuICBhd2FpdCBnaXRQdXNoKCByZXBvLCBicmFuY2ggKTtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLGtCQUFtQixDQUFDO0FBQ3BELE1BQU1DLFFBQVEsR0FBR0QsT0FBTyxDQUFFLFlBQWEsQ0FBQztBQUN4QyxNQUFNRSxNQUFNLEdBQUdGLE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDcEMsTUFBTUcsU0FBUyxHQUFHSCxPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1JLE9BQU8sR0FBR0osT0FBTyxDQUFFLFdBQVksQ0FBQztBQUN0QyxNQUFNSyxPQUFPLEdBQUdMLE9BQU8sQ0FBRSxTQUFVLENBQUM7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FNLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFFQyxNQUFNLEVBQUVDLE9BQU8sRUFBRUMsTUFBTSxFQUFHO0VBQy9ETixPQUFPLENBQUNPLElBQUksQ0FBRyw0Q0FBMkNKLElBQUssSUFBR0UsT0FBUSxjQUFhQyxNQUFPLEVBQUUsQ0FBQztFQUVqRyxNQUFNRSxjQUFjLEdBQUdkLGNBQWMsQ0FBQ2UsaUJBQWlCLENBQUMsQ0FBQztFQUV6RCxJQUFJQyxtQkFBbUI7O0VBRXZCO0VBQ0EsSUFBS0YsY0FBYyxDQUFDRyxLQUFLLEtBQUssQ0FBQyxJQUFJSCxjQUFjLENBQUNJLEtBQUssS0FBSyxDQUFDLEVBQUc7SUFDOURGLG1CQUFtQixHQUFJLE1BQUtQLElBQUssMEJBQXlCO0VBQzVEO0VBQ0E7RUFBQSxLQUNLLElBQUtLLGNBQWMsQ0FBQ0csS0FBSyxLQUFLLENBQUMsSUFBSUgsY0FBYyxDQUFDSSxLQUFLLEtBQUssQ0FBQyxFQUFHO0lBQ25FRixtQkFBbUIsR0FBSSxNQUFLUCxJQUFLLFVBQVNDLE1BQU0sQ0FBRSxDQUFDLENBQUcsb0JBQW1CO0VBQzNFLENBQUMsTUFDSTtJQUNILE1BQU0sSUFBSVMsS0FBSyxDQUFHLGdDQUErQkwsY0FBYyxDQUFDTSxRQUFRLENBQUMsQ0FBRSxFQUFFLENBQUM7RUFDaEY7RUFFQSxNQUFNbEIsUUFBUSxDQUFFYyxtQkFBbUIsRUFBRyxNQUFLUCxJQUFLLG9CQUFvQixDQUFDO0VBQ3JFLE1BQU1OLE1BQU0sQ0FBRU0sSUFBSSxFQUFFLG1CQUFvQixDQUFDO0VBQ3pDLE1BQU1MLFNBQVMsQ0FBRUssSUFBSSxFQUFHLGlDQUFnQ0UsT0FBUSxFQUFFLENBQUM7RUFDbkUsTUFBTU4sT0FBTyxDQUFFSSxJQUFJLEVBQUVHLE1BQU8sQ0FBQztBQUMvQixDQUFDIn0=