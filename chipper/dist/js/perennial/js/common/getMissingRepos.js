// Copyright 2020, University of Colorado Boulder

/**
 * Returns the list of repos listed in active-repos that are not checked out.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getRepoList = require('./getRepoList');
const fs = require('fs');

/**
 * Returns the list of repos listed in active-repos that are not checked out.
 * @public
 *
 * @returns {Array.<string>}
 */
module.exports = function () {
  const activeRepos = getRepoList('active-repos');
  const missingRepos = [];
  for (const repo of activeRepos) {
    if (!fs.existsSync(`../${repo}`)) {
      missingRepos.push(repo);
    }
  }
  return missingRepos;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZXBvTGlzdCIsInJlcXVpcmUiLCJmcyIsIm1vZHVsZSIsImV4cG9ydHMiLCJhY3RpdmVSZXBvcyIsIm1pc3NpbmdSZXBvcyIsInJlcG8iLCJleGlzdHNTeW5jIiwicHVzaCJdLCJzb3VyY2VzIjpbImdldE1pc3NpbmdSZXBvcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGlzdCBvZiByZXBvcyBsaXN0ZWQgaW4gYWN0aXZlLXJlcG9zIHRoYXQgYXJlIG5vdCBjaGVja2VkIG91dC5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmNvbnN0IGdldFJlcG9MaXN0ID0gcmVxdWlyZSggJy4vZ2V0UmVwb0xpc3QnICk7XHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIGxpc3Qgb2YgcmVwb3MgbGlzdGVkIGluIGFjdGl2ZS1yZXBvcyB0aGF0IGFyZSBub3QgY2hlY2tlZCBvdXQuXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHJldHVybnMge0FycmF5LjxzdHJpbmc+fVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcclxuICBjb25zdCBhY3RpdmVSZXBvcyA9IGdldFJlcG9MaXN0KCAnYWN0aXZlLXJlcG9zJyApO1xyXG4gIGNvbnN0IG1pc3NpbmdSZXBvcyA9IFtdO1xyXG5cclxuICBmb3IgKCBjb25zdCByZXBvIG9mIGFjdGl2ZVJlcG9zICkge1xyXG4gICAgaWYgKCAhZnMuZXhpc3RzU3luYyggYC4uLyR7cmVwb31gICkgKSB7XHJcbiAgICAgIG1pc3NpbmdSZXBvcy5wdXNoKCByZXBvICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbWlzc2luZ1JlcG9zO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsV0FBVyxHQUFHQyxPQUFPLENBQUUsZUFBZ0IsQ0FBQztBQUM5QyxNQUFNQyxFQUFFLEdBQUdELE9BQU8sQ0FBRSxJQUFLLENBQUM7O0FBRTFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRSxNQUFNLENBQUNDLE9BQU8sR0FBRyxZQUFXO0VBQzFCLE1BQU1DLFdBQVcsR0FBR0wsV0FBVyxDQUFFLGNBQWUsQ0FBQztFQUNqRCxNQUFNTSxZQUFZLEdBQUcsRUFBRTtFQUV2QixLQUFNLE1BQU1DLElBQUksSUFBSUYsV0FBVyxFQUFHO0lBQ2hDLElBQUssQ0FBQ0gsRUFBRSxDQUFDTSxVQUFVLENBQUcsTUFBS0QsSUFBSyxFQUFFLENBQUMsRUFBRztNQUNwQ0QsWUFBWSxDQUFDRyxJQUFJLENBQUVGLElBQUssQ0FBQztJQUMzQjtFQUNGO0VBRUEsT0FBT0QsWUFBWTtBQUNyQixDQUFDIn0=