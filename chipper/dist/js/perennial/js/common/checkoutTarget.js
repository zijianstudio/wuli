// Copyright 2017, University of Colorado Boulder

/**
 * Checks out a SHA/branch for a repository, and also checks out all of its dependencies.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const checkoutDependencies = require('./checkoutDependencies');
const getDependencies = require('./getDependencies');
const gitCheckout = require('./gitCheckout');
const gitPull = require('./gitPull');
const winston = require('winston');

/**
 * Checks out a SHA/branch for a repository, and also checks out all of its dependencies.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} target - branch or SHA
 * @param {boolean} includeNpmUpdate
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */
module.exports = async function (repo, target, includeNpmUpdate) {
  winston.info(`checking out shas for ${repo} ${target}`);
  await gitCheckout(repo, target);
  await gitPull(repo); // Does this work for a SHA?
  const dependencies = await getDependencies(repo);
  return checkoutDependencies(repo, dependencies, includeNpmUpdate);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjaGVja291dERlcGVuZGVuY2llcyIsInJlcXVpcmUiLCJnZXREZXBlbmRlbmNpZXMiLCJnaXRDaGVja291dCIsImdpdFB1bGwiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJ0YXJnZXQiLCJpbmNsdWRlTnBtVXBkYXRlIiwiaW5mbyIsImRlcGVuZGVuY2llcyJdLCJzb3VyY2VzIjpbImNoZWNrb3V0VGFyZ2V0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgb3V0IGEgU0hBL2JyYW5jaCBmb3IgYSByZXBvc2l0b3J5LCBhbmQgYWxzbyBjaGVja3Mgb3V0IGFsbCBvZiBpdHMgZGVwZW5kZW5jaWVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgY2hlY2tvdXREZXBlbmRlbmNpZXMgPSByZXF1aXJlKCAnLi9jaGVja291dERlcGVuZGVuY2llcycgKTtcclxuY29uc3QgZ2V0RGVwZW5kZW5jaWVzID0gcmVxdWlyZSggJy4vZ2V0RGVwZW5kZW5jaWVzJyApO1xyXG5jb25zdCBnaXRDaGVja291dCA9IHJlcXVpcmUoICcuL2dpdENoZWNrb3V0JyApO1xyXG5jb25zdCBnaXRQdWxsID0gcmVxdWlyZSggJy4vZ2l0UHVsbCcgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBvdXQgYSBTSEEvYnJhbmNoIGZvciBhIHJlcG9zaXRvcnksIGFuZCBhbHNvIGNoZWNrcyBvdXQgYWxsIG9mIGl0cyBkZXBlbmRlbmNpZXMuXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0YXJnZXQgLSBicmFuY2ggb3IgU0hBXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5jbHVkZU5wbVVwZGF0ZVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fSAtIFJlc29sdmVzIHdpdGggY2hlY2tlZE91dFJlcG9zXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCB0YXJnZXQsIGluY2x1ZGVOcG1VcGRhdGUgKSB7XHJcbiAgd2luc3Rvbi5pbmZvKCBgY2hlY2tpbmcgb3V0IHNoYXMgZm9yICR7cmVwb30gJHt0YXJnZXR9YCApO1xyXG5cclxuICBhd2FpdCBnaXRDaGVja291dCggcmVwbywgdGFyZ2V0ICk7XHJcbiAgYXdhaXQgZ2l0UHVsbCggcmVwbyApOyAvLyBEb2VzIHRoaXMgd29yayBmb3IgYSBTSEE/XHJcbiAgY29uc3QgZGVwZW5kZW5jaWVzID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKCByZXBvICk7XHJcbiAgcmV0dXJuIGNoZWNrb3V0RGVwZW5kZW5jaWVzKCByZXBvLCBkZXBlbmRlbmNpZXMsIGluY2x1ZGVOcG1VcGRhdGUgKTtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLG9CQUFvQixHQUFHQyxPQUFPLENBQUUsd0JBQXlCLENBQUM7QUFDaEUsTUFBTUMsZUFBZSxHQUFHRCxPQUFPLENBQUUsbUJBQW9CLENBQUM7QUFDdEQsTUFBTUUsV0FBVyxHQUFHRixPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNRyxPQUFPLEdBQUdILE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTUksT0FBTyxHQUFHSixPQUFPLENBQUUsU0FBVSxDQUFDOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUssTUFBTSxDQUFDQyxPQUFPLEdBQUcsZ0JBQWdCQyxJQUFJLEVBQUVDLE1BQU0sRUFBRUMsZ0JBQWdCLEVBQUc7RUFDaEVMLE9BQU8sQ0FBQ00sSUFBSSxDQUFHLHlCQUF3QkgsSUFBSyxJQUFHQyxNQUFPLEVBQUUsQ0FBQztFQUV6RCxNQUFNTixXQUFXLENBQUVLLElBQUksRUFBRUMsTUFBTyxDQUFDO0VBQ2pDLE1BQU1MLE9BQU8sQ0FBRUksSUFBSyxDQUFDLENBQUMsQ0FBQztFQUN2QixNQUFNSSxZQUFZLEdBQUcsTUFBTVYsZUFBZSxDQUFFTSxJQUFLLENBQUM7RUFDbEQsT0FBT1Isb0JBQW9CLENBQUVRLElBQUksRUFBRUksWUFBWSxFQUFFRixnQkFBaUIsQ0FBQztBQUNyRSxDQUFDIn0=