// Copyright 2017, University of Colorado Boulder

/**
 * npm update
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const npmCommand = require('./npmCommand');
const winston = require('winston');

/**
 * Executes an effective "npm update" (with pruning because it's required).
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise}
 */
module.exports = async function (repo) {
  winston.info(`npm update on ${repo}`);
  await execute(npmCommand, ['prune'], `../${repo}`);
  await execute(npmCommand, ['update'], `../${repo}`);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsIm5wbUNvbW1hbmQiLCJ3aW5zdG9uIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG8iLCJpbmZvIl0sInNvdXJjZXMiOlsibnBtVXBkYXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBucG0gdXBkYXRlXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKTtcclxuY29uc3QgbnBtQ29tbWFuZCA9IHJlcXVpcmUoICcuL25wbUNvbW1hbmQnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBFeGVjdXRlcyBhbiBlZmZlY3RpdmUgXCJucG0gdXBkYXRlXCIgKHdpdGggcHJ1bmluZyBiZWNhdXNlIGl0J3MgcmVxdWlyZWQpLlxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvIC0gVGhlIHJlcG9zaXRvcnkgbmFtZVxyXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8gKSB7XHJcbiAgd2luc3Rvbi5pbmZvKCBgbnBtIHVwZGF0ZSBvbiAke3JlcG99YCApO1xyXG5cclxuICBhd2FpdCBleGVjdXRlKCBucG1Db21tYW5kLCBbICdwcnVuZScgXSwgYC4uLyR7cmVwb31gICk7XHJcbiAgYXdhaXQgZXhlY3V0ZSggbnBtQ29tbWFuZCwgWyAndXBkYXRlJyBdLCBgLi4vJHtyZXBvfWAgKTtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLE9BQU8sR0FBR0MsT0FBTyxDQUFFLFdBQVksQ0FBQztBQUN0QyxNQUFNQyxVQUFVLEdBQUdELE9BQU8sQ0FBRSxjQUFlLENBQUM7QUFDNUMsTUFBTUUsT0FBTyxHQUFHRixPQUFPLENBQUUsU0FBVSxDQUFDOztBQUVwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBRyxNQUFNLENBQUNDLE9BQU8sR0FBRyxnQkFBZ0JDLElBQUksRUFBRztFQUN0Q0gsT0FBTyxDQUFDSSxJQUFJLENBQUcsaUJBQWdCRCxJQUFLLEVBQUUsQ0FBQztFQUV2QyxNQUFNTixPQUFPLENBQUVFLFVBQVUsRUFBRSxDQUFFLE9BQU8sQ0FBRSxFQUFHLE1BQUtJLElBQUssRUFBRSxDQUFDO0VBQ3RELE1BQU1OLE9BQU8sQ0FBRUUsVUFBVSxFQUFFLENBQUUsUUFBUSxDQUFFLEVBQUcsTUFBS0ksSUFBSyxFQUFFLENBQUM7QUFDekQsQ0FBQyJ9