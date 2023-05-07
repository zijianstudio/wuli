// Copyright 2020, University of Colorado Boulder

/**
 * Asynchronously checks whether a repo is not up-to-date with origin/master
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getRemoteBranchSHAs = require('./getRemoteBranchSHAs');
const gitRevParse = require('./gitRevParse');

/**
 * Asynchronously checks whether a repo is not up-to-date with origin/master
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<boolean>}
 * @rejects {ExecuteError}
 */
module.exports = async function (repo) {
  const currentSHA = await gitRevParse(repo, 'master');
  const remoteSHA = (await getRemoteBranchSHAs(repo)).master;
  return currentSHA !== remoteSHA;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZW1vdGVCcmFuY2hTSEFzIiwicmVxdWlyZSIsImdpdFJldlBhcnNlIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJjdXJyZW50U0hBIiwicmVtb3RlU0hBIiwibWFzdGVyIl0sInNvdXJjZXMiOlsiaXNTdGFsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXN5bmNocm9ub3VzbHkgY2hlY2tzIHdoZXRoZXIgYSByZXBvIGlzIG5vdCB1cC10by1kYXRlIHdpdGggb3JpZ2luL21hc3RlclxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZ2V0UmVtb3RlQnJhbmNoU0hBcyA9IHJlcXVpcmUoICcuL2dldFJlbW90ZUJyYW5jaFNIQXMnICk7XHJcbmNvbnN0IGdpdFJldlBhcnNlID0gcmVxdWlyZSggJy4vZ2l0UmV2UGFyc2UnICk7XHJcblxyXG4vKipcclxuICogQXN5bmNocm9ub3VzbHkgY2hlY2tzIHdoZXRoZXIgYSByZXBvIGlzIG5vdCB1cC10by1kYXRlIHdpdGggb3JpZ2luL21hc3RlclxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48Ym9vbGVhbj59XHJcbiAqIEByZWplY3RzIHtFeGVjdXRlRXJyb3J9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvICkge1xyXG4gIGNvbnN0IGN1cnJlbnRTSEEgPSBhd2FpdCBnaXRSZXZQYXJzZSggcmVwbywgJ21hc3RlcicgKTtcclxuICBjb25zdCByZW1vdGVTSEEgPSAoIGF3YWl0IGdldFJlbW90ZUJyYW5jaFNIQXMoIHJlcG8gKSApLm1hc3RlcjtcclxuXHJcbiAgcmV0dXJuIGN1cnJlbnRTSEEgIT09IHJlbW90ZVNIQTtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLG1CQUFtQixHQUFHQyxPQUFPLENBQUUsdUJBQXdCLENBQUM7QUFDOUQsTUFBTUMsV0FBVyxHQUFHRCxPQUFPLENBQUUsZUFBZ0IsQ0FBQzs7QUFFOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRSxNQUFNLENBQUNDLE9BQU8sR0FBRyxnQkFBZ0JDLElBQUksRUFBRztFQUN0QyxNQUFNQyxVQUFVLEdBQUcsTUFBTUosV0FBVyxDQUFFRyxJQUFJLEVBQUUsUUFBUyxDQUFDO0VBQ3RELE1BQU1FLFNBQVMsR0FBRyxDQUFFLE1BQU1QLG1CQUFtQixDQUFFSyxJQUFLLENBQUMsRUFBR0csTUFBTTtFQUU5RCxPQUFPRixVQUFVLEtBQUtDLFNBQVM7QUFDakMsQ0FBQyJ9