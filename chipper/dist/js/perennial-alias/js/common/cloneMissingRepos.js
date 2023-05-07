// Copyright 2020, University of Colorado Boulder

/**
 * Clones missing repositories
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const cloneRepo = require('./cloneRepo');
const getMissingRepos = require('./getMissingRepos');
const winston = require('winston');

/**
 * Clones missing repositories
 * @public
 *
 * @returns {Promise.<string>} - The names of the repos cloned
 */
module.exports = async () => {
  winston.info('Cloning missing repos');
  const missingRepos = getMissingRepos();
  for (const repo of missingRepos) {
    await cloneRepo(repo);
  }
  return missingRepos;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjbG9uZVJlcG8iLCJyZXF1aXJlIiwiZ2V0TWlzc2luZ1JlcG9zIiwid2luc3RvbiIsIm1vZHVsZSIsImV4cG9ydHMiLCJpbmZvIiwibWlzc2luZ1JlcG9zIiwicmVwbyJdLCJzb3VyY2VzIjpbImNsb25lTWlzc2luZ1JlcG9zLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbG9uZXMgbWlzc2luZyByZXBvc2l0b3JpZXNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmNvbnN0IGNsb25lUmVwbyA9IHJlcXVpcmUoICcuL2Nsb25lUmVwbycgKTtcclxuY29uc3QgZ2V0TWlzc2luZ1JlcG9zID0gcmVxdWlyZSggJy4vZ2V0TWlzc2luZ1JlcG9zJyApO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XHJcblxyXG4vKipcclxuICogQ2xvbmVzIG1pc3NpbmcgcmVwb3NpdG9yaWVzXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gVGhlIG5hbWVzIG9mIHRoZSByZXBvcyBjbG9uZWRcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgKCkgPT4ge1xyXG4gIHdpbnN0b24uaW5mbyggJ0Nsb25pbmcgbWlzc2luZyByZXBvcycgKTtcclxuXHJcbiAgY29uc3QgbWlzc2luZ1JlcG9zID0gZ2V0TWlzc2luZ1JlcG9zKCk7XHJcblxyXG4gIGZvciAoIGNvbnN0IHJlcG8gb2YgbWlzc2luZ1JlcG9zICkge1xyXG4gICAgYXdhaXQgY2xvbmVSZXBvKCByZXBvICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gbWlzc2luZ1JlcG9zO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsU0FBUyxHQUFHQyxPQUFPLENBQUUsYUFBYyxDQUFDO0FBQzFDLE1BQU1DLGVBQWUsR0FBR0QsT0FBTyxDQUFFLG1CQUFvQixDQUFDO0FBQ3RELE1BQU1FLE9BQU8sR0FBR0YsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FHLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFlBQVk7RUFDM0JGLE9BQU8sQ0FBQ0csSUFBSSxDQUFFLHVCQUF3QixDQUFDO0VBRXZDLE1BQU1DLFlBQVksR0FBR0wsZUFBZSxDQUFDLENBQUM7RUFFdEMsS0FBTSxNQUFNTSxJQUFJLElBQUlELFlBQVksRUFBRztJQUNqQyxNQUFNUCxTQUFTLENBQUVRLElBQUssQ0FBQztFQUN6QjtFQUVBLE9BQU9ELFlBQVk7QUFDckIsQ0FBQyJ9