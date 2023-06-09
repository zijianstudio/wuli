// Copyright 2017, University of Colorado Boulder

/**
 * Checks out the given dependencies (for a given repository) without modifying the given repository.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const gitFetchCheckout = require('./gitFetchCheckout');
const npmUpdate = require('./npmUpdate');
const winston = require('winston');

/**
 * Checks out the given dependencies (for a given repository) without modifying the given repository.
 * @public
 *
 * @param {string} repo - The repository name
 * @param {Object} dependencies - In the format of dependencies.json
 * @param {boolean} includeNpmUpdate - Whether npm update should be included (for the repo and chipper)
 * @returns {Promise.<Array.<string>>} - Resolves with checkedOutRepos
 */
module.exports = async function (repo, dependencies, includeNpmUpdate) {
  winston.info(`checking out dependencies for ${repo}`);

  // track checked-out repositories, as it's helpful for future processes
  const checkedOutRepoNames = [repo];

  // Ignore the repo we just checked out, and the comment
  const repoNames = Object.keys(dependencies).filter(key => key !== 'comment' && key !== repo);
  for (let i = 0; i < repoNames.length; i++) {
    const dependencyRepoName = repoNames[i];
    checkedOutRepoNames.push(dependencyRepoName);
    const sha = dependencies[dependencyRepoName].sha;
    if (!sha) {
      throw new Error(`Missing sha for ${dependencyRepoName} in ${repo}`);
    }
    await gitFetchCheckout(dependencyRepoName, sha);
  }
  if (includeNpmUpdate) {
    await npmUpdate(repo);
    await npmUpdate('chipper');
    await npmUpdate('perennial-alias');
  }
  return checkedOutRepoNames;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnaXRGZXRjaENoZWNrb3V0IiwicmVxdWlyZSIsIm5wbVVwZGF0ZSIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImRlcGVuZGVuY2llcyIsImluY2x1ZGVOcG1VcGRhdGUiLCJpbmZvIiwiY2hlY2tlZE91dFJlcG9OYW1lcyIsInJlcG9OYW1lcyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJrZXkiLCJpIiwibGVuZ3RoIiwiZGVwZW5kZW5jeVJlcG9OYW1lIiwicHVzaCIsInNoYSIsIkVycm9yIl0sInNvdXJjZXMiOlsiY2hlY2tvdXREZXBlbmRlbmNpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTcsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBvdXQgdGhlIGdpdmVuIGRlcGVuZGVuY2llcyAoZm9yIGEgZ2l2ZW4gcmVwb3NpdG9yeSkgd2l0aG91dCBtb2RpZnlpbmcgdGhlIGdpdmVuIHJlcG9zaXRvcnkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBnaXRGZXRjaENoZWNrb3V0ID0gcmVxdWlyZSggJy4vZ2l0RmV0Y2hDaGVja291dCcgKTtcclxuY29uc3QgbnBtVXBkYXRlID0gcmVxdWlyZSggJy4vbnBtVXBkYXRlJyApO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XHJcblxyXG4vKipcclxuICogQ2hlY2tzIG91dCB0aGUgZ2l2ZW4gZGVwZW5kZW5jaWVzIChmb3IgYSBnaXZlbiByZXBvc2l0b3J5KSB3aXRob3V0IG1vZGlmeWluZyB0aGUgZ2l2ZW4gcmVwb3NpdG9yeS5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwbyAtIFRoZSByZXBvc2l0b3J5IG5hbWVcclxuICogQHBhcmFtIHtPYmplY3R9IGRlcGVuZGVuY2llcyAtIEluIHRoZSBmb3JtYXQgb2YgZGVwZW5kZW5jaWVzLmpzb25cclxuICogQHBhcmFtIHtib29sZWFufSBpbmNsdWRlTnBtVXBkYXRlIC0gV2hldGhlciBucG0gdXBkYXRlIHNob3VsZCBiZSBpbmNsdWRlZCAoZm9yIHRoZSByZXBvIGFuZCBjaGlwcGVyKVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXkuPHN0cmluZz4+fSAtIFJlc29sdmVzIHdpdGggY2hlY2tlZE91dFJlcG9zXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCByZXBvLCBkZXBlbmRlbmNpZXMsIGluY2x1ZGVOcG1VcGRhdGUgKSB7XHJcbiAgd2luc3Rvbi5pbmZvKCBgY2hlY2tpbmcgb3V0IGRlcGVuZGVuY2llcyBmb3IgJHtyZXBvfWAgKTtcclxuXHJcbiAgLy8gdHJhY2sgY2hlY2tlZC1vdXQgcmVwb3NpdG9yaWVzLCBhcyBpdCdzIGhlbHBmdWwgZm9yIGZ1dHVyZSBwcm9jZXNzZXNcclxuICBjb25zdCBjaGVja2VkT3V0UmVwb05hbWVzID0gWyByZXBvIF07XHJcblxyXG4gIC8vIElnbm9yZSB0aGUgcmVwbyB3ZSBqdXN0IGNoZWNrZWQgb3V0LCBhbmQgdGhlIGNvbW1lbnRcclxuICBjb25zdCByZXBvTmFtZXMgPSBPYmplY3Qua2V5cyggZGVwZW5kZW5jaWVzICkuZmlsdGVyKCBrZXkgPT4ga2V5ICE9PSAnY29tbWVudCcgJiYga2V5ICE9PSByZXBvICk7XHJcblxyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHJlcG9OYW1lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGNvbnN0IGRlcGVuZGVuY3lSZXBvTmFtZSA9IHJlcG9OYW1lc1sgaSBdO1xyXG5cclxuICAgIGNoZWNrZWRPdXRSZXBvTmFtZXMucHVzaCggZGVwZW5kZW5jeVJlcG9OYW1lICk7XHJcbiAgICBjb25zdCBzaGEgPSBkZXBlbmRlbmNpZXNbIGRlcGVuZGVuY3lSZXBvTmFtZSBdLnNoYTtcclxuICAgIGlmICggIXNoYSApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCBgTWlzc2luZyBzaGEgZm9yICR7ZGVwZW5kZW5jeVJlcG9OYW1lfSBpbiAke3JlcG99YCApO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IGdpdEZldGNoQ2hlY2tvdXQoIGRlcGVuZGVuY3lSZXBvTmFtZSwgc2hhICk7XHJcbiAgfVxyXG5cclxuICBpZiAoIGluY2x1ZGVOcG1VcGRhdGUgKSB7XHJcbiAgICBhd2FpdCBucG1VcGRhdGUoIHJlcG8gKTtcclxuICAgIGF3YWl0IG5wbVVwZGF0ZSggJ2NoaXBwZXInICk7XHJcbiAgICBhd2FpdCBucG1VcGRhdGUoICdwZXJlbm5pYWwtYWxpYXMnICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY2hlY2tlZE91dFJlcG9OYW1lcztcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGdCQUFnQixHQUFHQyxPQUFPLENBQUUsb0JBQXFCLENBQUM7QUFDeEQsTUFBTUMsU0FBUyxHQUFHRCxPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1FLE9BQU8sR0FBR0YsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FHLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLGdCQUFnQixFQUFHO0VBQ3RFTCxPQUFPLENBQUNNLElBQUksQ0FBRyxpQ0FBZ0NILElBQUssRUFBRSxDQUFDOztFQUV2RDtFQUNBLE1BQU1JLG1CQUFtQixHQUFHLENBQUVKLElBQUksQ0FBRTs7RUFFcEM7RUFDQSxNQUFNSyxTQUFTLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFFTixZQUFhLENBQUMsQ0FBQ08sTUFBTSxDQUFFQyxHQUFHLElBQUlBLEdBQUcsS0FBSyxTQUFTLElBQUlBLEdBQUcsS0FBS1QsSUFBSyxDQUFDO0VBRWhHLEtBQU0sSUFBSVUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHTCxTQUFTLENBQUNNLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7SUFDM0MsTUFBTUUsa0JBQWtCLEdBQUdQLFNBQVMsQ0FBRUssQ0FBQyxDQUFFO0lBRXpDTixtQkFBbUIsQ0FBQ1MsSUFBSSxDQUFFRCxrQkFBbUIsQ0FBQztJQUM5QyxNQUFNRSxHQUFHLEdBQUdiLFlBQVksQ0FBRVcsa0JBQWtCLENBQUUsQ0FBQ0UsR0FBRztJQUNsRCxJQUFLLENBQUNBLEdBQUcsRUFBRztNQUNWLE1BQU0sSUFBSUMsS0FBSyxDQUFHLG1CQUFrQkgsa0JBQW1CLE9BQU1aLElBQUssRUFBRSxDQUFDO0lBQ3ZFO0lBRUEsTUFBTU4sZ0JBQWdCLENBQUVrQixrQkFBa0IsRUFBRUUsR0FBSSxDQUFDO0VBQ25EO0VBRUEsSUFBS1osZ0JBQWdCLEVBQUc7SUFDdEIsTUFBTU4sU0FBUyxDQUFFSSxJQUFLLENBQUM7SUFDdkIsTUFBTUosU0FBUyxDQUFFLFNBQVUsQ0FBQztJQUM1QixNQUFNQSxTQUFTLENBQUUsaUJBQWtCLENBQUM7RUFDdEM7RUFFQSxPQUFPUSxtQkFBbUI7QUFDNUIsQ0FBQyJ9