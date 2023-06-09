// Copyright 2022, University of Colorado Boulder

/**
 * Ensures that a simulation is marked as published in its package.json
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitPush = require('./gitPush');
const fs = require('fs');
const _ = require('lodash'); // eslint-disable-line no-unused-vars

/**
 * Ensures that a simulation is marked as published in its package.json
 * @public
 *
 * @param {string} repo
 *
 * @returns {Promise<void>}
 */
module.exports = async function (repo) {
  const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
  if (!packageObject.phet.published) {
    packageObject.phet.published = true;
    fs.writeFileSync(`../${repo}/package.json`, JSON.stringify(packageObject, null, 2));
    await gitAdd(repo, 'package.json');
    await gitCommit(repo, 'Marking repository as published');
    await gitPush(repo, 'master');
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnaXRBZGQiLCJyZXF1aXJlIiwiZ2l0Q29tbWl0IiwiZ2l0UHVzaCIsImZzIiwiXyIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwicGFja2FnZU9iamVjdCIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsInBoZXQiLCJwdWJsaXNoZWQiLCJ3cml0ZUZpbGVTeW5jIiwic3RyaW5naWZ5Il0sInNvdXJjZXMiOlsibWFya1NpbUFzUHVibGlzaGVkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBFbnN1cmVzIHRoYXQgYSBzaW11bGF0aW9uIGlzIG1hcmtlZCBhcyBwdWJsaXNoZWQgaW4gaXRzIHBhY2thZ2UuanNvblxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xyXG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XHJcbmNvbnN0IGdpdFB1c2ggPSByZXF1aXJlKCAnLi9naXRQdXNoJyApO1xyXG5jb25zdCBmcyA9IHJlcXVpcmUoICdmcycgKTtcclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuXHJcbi8qKlxyXG4gKiBFbnN1cmVzIHRoYXQgYSBzaW11bGF0aW9uIGlzIG1hcmtlZCBhcyBwdWJsaXNoZWQgaW4gaXRzIHBhY2thZ2UuanNvblxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcclxuICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xyXG5cclxuICBpZiAoICFwYWNrYWdlT2JqZWN0LnBoZXQucHVibGlzaGVkICkge1xyXG4gICAgcGFja2FnZU9iamVjdC5waGV0LnB1Ymxpc2hlZCA9IHRydWU7XHJcbiAgICBmcy53cml0ZUZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCBKU09OLnN0cmluZ2lmeSggcGFja2FnZU9iamVjdCwgbnVsbCwgMiApICk7XHJcblxyXG4gICAgYXdhaXQgZ2l0QWRkKCByZXBvLCAncGFja2FnZS5qc29uJyApO1xyXG4gICAgYXdhaXQgZ2l0Q29tbWl0KCByZXBvLCAnTWFya2luZyByZXBvc2l0b3J5IGFzIHB1Ymxpc2hlZCcgKTtcclxuICAgIGF3YWl0IGdpdFB1c2goIHJlcG8sICdtYXN0ZXInICk7XHJcbiAgfVxyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsTUFBTSxHQUFHQyxPQUFPLENBQUUsVUFBVyxDQUFDO0FBQ3BDLE1BQU1DLFNBQVMsR0FBR0QsT0FBTyxDQUFFLGFBQWMsQ0FBQztBQUMxQyxNQUFNRSxPQUFPLEdBQUdGLE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTUcsRUFBRSxHQUFHSCxPQUFPLENBQUUsSUFBSyxDQUFDO0FBQzFCLE1BQU1JLENBQUMsR0FBR0osT0FBTyxDQUFFLFFBQVMsQ0FBQyxDQUFDLENBQUM7O0FBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUssTUFBTSxDQUFDQyxPQUFPLEdBQUcsZ0JBQWdCQyxJQUFJLEVBQUc7RUFDdEMsTUFBTUMsYUFBYSxHQUFHQyxJQUFJLENBQUNDLEtBQUssQ0FBRVAsRUFBRSxDQUFDUSxZQUFZLENBQUcsTUFBS0osSUFBSyxlQUFjLEVBQUUsTUFBTyxDQUFFLENBQUM7RUFFeEYsSUFBSyxDQUFDQyxhQUFhLENBQUNJLElBQUksQ0FBQ0MsU0FBUyxFQUFHO0lBQ25DTCxhQUFhLENBQUNJLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUk7SUFDbkNWLEVBQUUsQ0FBQ1csYUFBYSxDQUFHLE1BQUtQLElBQUssZUFBYyxFQUFFRSxJQUFJLENBQUNNLFNBQVMsQ0FBRVAsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFFLENBQUUsQ0FBQztJQUV2RixNQUFNVCxNQUFNLENBQUVRLElBQUksRUFBRSxjQUFlLENBQUM7SUFDcEMsTUFBTU4sU0FBUyxDQUFFTSxJQUFJLEVBQUUsaUNBQWtDLENBQUM7SUFDMUQsTUFBTUwsT0FBTyxDQUFFSyxJQUFJLEVBQUUsUUFBUyxDQUFDO0VBQ2pDO0FBQ0YsQ0FBQyJ9