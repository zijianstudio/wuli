// Copyright 2021, University of Colorado Boulder

/**
 * Whether the current branch's remote SHA differs from the current SHA
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const assert = require('assert');
const getBranch = require('./getBranch');
const getRemoteBranchSHAs = require('./getRemoteBranchSHAs');
const gitRevParse = require('./gitRevParse');

/**
 * Whether the current branch's remote SHA differs from the current SHA
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise.<boolean>}
 */
module.exports = async function (repo) {
  assert(typeof repo === 'string');
  const branch = await getBranch(repo);
  const currentSHA = await gitRevParse(repo, 'HEAD');
  const remoteSHA = (await getRemoteBranchSHAs(repo))[branch];
  return currentSHA !== remoteSHA;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwiZ2V0QnJhbmNoIiwiZ2V0UmVtb3RlQnJhbmNoU0hBcyIsImdpdFJldlBhcnNlIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJicmFuY2giLCJjdXJyZW50U0hBIiwicmVtb3RlU0hBIl0sInNvdXJjZXMiOlsiaXNHaXRSZW1vdGVEaWZmZXJlbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgYnJhbmNoJ3MgcmVtb3RlIFNIQSBkaWZmZXJzIGZyb20gdGhlIGN1cnJlbnQgU0hBXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5jb25zdCBnZXRCcmFuY2ggPSByZXF1aXJlKCAnLi9nZXRCcmFuY2gnICk7XHJcbmNvbnN0IGdldFJlbW90ZUJyYW5jaFNIQXMgPSByZXF1aXJlKCAnLi9nZXRSZW1vdGVCcmFuY2hTSEFzJyApO1xyXG5jb25zdCBnaXRSZXZQYXJzZSA9IHJlcXVpcmUoICcuL2dpdFJldlBhcnNlJyApO1xyXG5cclxuLyoqXHJcbiAqIFdoZXRoZXIgdGhlIGN1cnJlbnQgYnJhbmNoJ3MgcmVtb3RlIFNIQSBkaWZmZXJzIGZyb20gdGhlIGN1cnJlbnQgU0hBXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxib29sZWFuPn1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8gKSB7XHJcbiAgYXNzZXJ0KCB0eXBlb2YgcmVwbyA9PT0gJ3N0cmluZycgKTtcclxuXHJcbiAgY29uc3QgYnJhbmNoID0gYXdhaXQgZ2V0QnJhbmNoKCByZXBvICk7XHJcbiAgY29uc3QgY3VycmVudFNIQSA9IGF3YWl0IGdpdFJldlBhcnNlKCByZXBvLCAnSEVBRCcgKTtcclxuICBjb25zdCByZW1vdGVTSEEgPSAoIGF3YWl0IGdldFJlbW90ZUJyYW5jaFNIQXMoIHJlcG8gKSApWyBicmFuY2ggXTtcclxuXHJcbiAgcmV0dXJuIGN1cnJlbnRTSEEgIT09IHJlbW90ZVNIQTtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLE1BQU0sR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUNsQyxNQUFNQyxTQUFTLEdBQUdELE9BQU8sQ0FBRSxhQUFjLENBQUM7QUFDMUMsTUFBTUUsbUJBQW1CLEdBQUdGLE9BQU8sQ0FBRSx1QkFBd0IsQ0FBQztBQUM5RCxNQUFNRyxXQUFXLEdBQUdILE9BQU8sQ0FBRSxlQUFnQixDQUFDOztBQUU5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBSSxNQUFNLENBQUNDLE9BQU8sR0FBRyxnQkFBZ0JDLElBQUksRUFBRztFQUN0Q1AsTUFBTSxDQUFFLE9BQU9PLElBQUksS0FBSyxRQUFTLENBQUM7RUFFbEMsTUFBTUMsTUFBTSxHQUFHLE1BQU1OLFNBQVMsQ0FBRUssSUFBSyxDQUFDO0VBQ3RDLE1BQU1FLFVBQVUsR0FBRyxNQUFNTCxXQUFXLENBQUVHLElBQUksRUFBRSxNQUFPLENBQUM7RUFDcEQsTUFBTUcsU0FBUyxHQUFHLENBQUUsTUFBTVAsbUJBQW1CLENBQUVJLElBQUssQ0FBQyxFQUFJQyxNQUFNLENBQUU7RUFFakUsT0FBT0MsVUFBVSxLQUFLQyxTQUFTO0FBQ2pDLENBQUMifQ==