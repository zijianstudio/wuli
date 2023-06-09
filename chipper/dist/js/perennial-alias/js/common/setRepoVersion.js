// Copyright 2017, University of Colorado Boulder

/**
 * Sets the version of the current checked-in repo's package.json, creating a commit with the change
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitIsClean = require('./gitIsClean');
const loadJSON = require('./loadJSON');
const writeJSON = require('./writeJSON');
const winston = require('winston');

/**
 * Sets the version for a current checked-in repo, creating a commit with the change
 * @public
 *
 * @param {string} repo - The repository name
 * @param {SimVersion} version
 * @param {string} [message] - Optional. If provided, appended at the end
 * @returns {Promise}
 */
module.exports = async function (repo, version, message) {
  winston.info(`Setting version from package.json for ${repo} to ${version.toString()}`);
  const packageFile = `../${repo}/package.json`;
  const isClean = await gitIsClean(repo);
  if (!isClean) {
    throw new Error(`Unclean status in ${repo}, cannot increment version`);
  }
  const packageObject = await loadJSON(packageFile);
  packageObject.version = version.toString();
  await writeJSON(packageFile, packageObject);
  await gitAdd(repo, 'package.json');
  await gitCommit(repo, `Bumping version to ${version.toString()}${message ? `, ${message}` : ''}`);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnaXRBZGQiLCJyZXF1aXJlIiwiZ2l0Q29tbWl0IiwiZ2l0SXNDbGVhbiIsImxvYWRKU09OIiwid3JpdGVKU09OIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwidmVyc2lvbiIsIm1lc3NhZ2UiLCJpbmZvIiwidG9TdHJpbmciLCJwYWNrYWdlRmlsZSIsImlzQ2xlYW4iLCJFcnJvciIsInBhY2thZ2VPYmplY3QiXSwic291cmNlcyI6WyJzZXRSZXBvVmVyc2lvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2V0cyB0aGUgdmVyc2lvbiBvZiB0aGUgY3VycmVudCBjaGVja2VkLWluIHJlcG8ncyBwYWNrYWdlLmpzb24sIGNyZWF0aW5nIGEgY29tbWl0IHdpdGggdGhlIGNoYW5nZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xyXG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XHJcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi9naXRJc0NsZWFuJyApO1xyXG5jb25zdCBsb2FkSlNPTiA9IHJlcXVpcmUoICcuL2xvYWRKU09OJyApO1xyXG5jb25zdCB3cml0ZUpTT04gPSByZXF1aXJlKCAnLi93cml0ZUpTT04nICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBTZXRzIHRoZSB2ZXJzaW9uIGZvciBhIGN1cnJlbnQgY2hlY2tlZC1pbiByZXBvLCBjcmVhdGluZyBhIGNvbW1pdCB3aXRoIHRoZSBjaGFuZ2VcclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcclxuICogQHBhcmFtIHtTaW1WZXJzaW9ufSB2ZXJzaW9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbWVzc2FnZV0gLSBPcHRpb25hbC4gSWYgcHJvdmlkZWQsIGFwcGVuZGVkIGF0IHRoZSBlbmRcclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCB2ZXJzaW9uLCBtZXNzYWdlICkge1xyXG4gIHdpbnN0b24uaW5mbyggYFNldHRpbmcgdmVyc2lvbiBmcm9tIHBhY2thZ2UuanNvbiBmb3IgJHtyZXBvfSB0byAke3ZlcnNpb24udG9TdHJpbmcoKX1gICk7XHJcblxyXG4gIGNvbnN0IHBhY2thZ2VGaWxlID0gYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYDtcclxuXHJcbiAgY29uc3QgaXNDbGVhbiA9IGF3YWl0IGdpdElzQ2xlYW4oIHJlcG8gKTtcclxuICBpZiAoICFpc0NsZWFuICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBgVW5jbGVhbiBzdGF0dXMgaW4gJHtyZXBvfSwgY2Fubm90IGluY3JlbWVudCB2ZXJzaW9uYCApO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IGF3YWl0IGxvYWRKU09OKCBwYWNrYWdlRmlsZSApO1xyXG4gIHBhY2thZ2VPYmplY3QudmVyc2lvbiA9IHZlcnNpb24udG9TdHJpbmcoKTtcclxuXHJcbiAgYXdhaXQgd3JpdGVKU09OKCBwYWNrYWdlRmlsZSwgcGFja2FnZU9iamVjdCApO1xyXG4gIGF3YWl0IGdpdEFkZCggcmVwbywgJ3BhY2thZ2UuanNvbicgKTtcclxuICBhd2FpdCBnaXRDb21taXQoIHJlcG8sIGBCdW1waW5nIHZlcnNpb24gdG8gJHt2ZXJzaW9uLnRvU3RyaW5nKCl9JHttZXNzYWdlID8gYCwgJHttZXNzYWdlfWAgOiAnJ31gICk7XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBRSxVQUFXLENBQUM7QUFDcEMsTUFBTUMsU0FBUyxHQUFHRCxPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1FLFVBQVUsR0FBR0YsT0FBTyxDQUFFLGNBQWUsQ0FBQztBQUM1QyxNQUFNRyxRQUFRLEdBQUdILE9BQU8sQ0FBRSxZQUFhLENBQUM7QUFDeEMsTUFBTUksU0FBUyxHQUFHSixPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1LLE9BQU8sR0FBR0wsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FNLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRztFQUN4REwsT0FBTyxDQUFDTSxJQUFJLENBQUcseUNBQXdDSCxJQUFLLE9BQU1DLE9BQU8sQ0FBQ0csUUFBUSxDQUFDLENBQUUsRUFBRSxDQUFDO0VBRXhGLE1BQU1DLFdBQVcsR0FBSSxNQUFLTCxJQUFLLGVBQWM7RUFFN0MsTUFBTU0sT0FBTyxHQUFHLE1BQU1aLFVBQVUsQ0FBRU0sSUFBSyxDQUFDO0VBQ3hDLElBQUssQ0FBQ00sT0FBTyxFQUFHO0lBQ2QsTUFBTSxJQUFJQyxLQUFLLENBQUcscUJBQW9CUCxJQUFLLDRCQUE0QixDQUFDO0VBQzFFO0VBRUEsTUFBTVEsYUFBYSxHQUFHLE1BQU1iLFFBQVEsQ0FBRVUsV0FBWSxDQUFDO0VBQ25ERyxhQUFhLENBQUNQLE9BQU8sR0FBR0EsT0FBTyxDQUFDRyxRQUFRLENBQUMsQ0FBQztFQUUxQyxNQUFNUixTQUFTLENBQUVTLFdBQVcsRUFBRUcsYUFBYyxDQUFDO0VBQzdDLE1BQU1qQixNQUFNLENBQUVTLElBQUksRUFBRSxjQUFlLENBQUM7RUFDcEMsTUFBTVAsU0FBUyxDQUFFTyxJQUFJLEVBQUcsc0JBQXFCQyxPQUFPLENBQUNHLFFBQVEsQ0FBQyxDQUFFLEdBQUVGLE9BQU8sR0FBSSxLQUFJQSxPQUFRLEVBQUMsR0FBRyxFQUFHLEVBQUUsQ0FBQztBQUNyRyxDQUFDIn0=