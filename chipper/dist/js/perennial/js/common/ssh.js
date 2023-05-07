// Copyright 2017, University of Colorado Boulder

/**
 * Executes a command on a remote server.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const winston = require('winston');

/**
 * Executes a command on a remote server.
 * @public
 *
 * @param {string} username
 * @param {string} host
 * @param {string} cmd - The process to execute.
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */
module.exports = function (username, host, cmd) {
  winston.info(`running ${cmd} remotely on ${host}`);
  return execute('ssh', [`${username}@${host}`, cmd], '.');
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwidXNlcm5hbWUiLCJob3N0IiwiY21kIiwiaW5mbyJdLCJzb3VyY2VzIjpbInNzaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSBjb21tYW5kIG9uIGEgcmVtb3RlIHNlcnZlci5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi9leGVjdXRlJyApO1xyXG5jb25zdCB3aW5zdG9uID0gcmVxdWlyZSggJ3dpbnN0b24nICk7XHJcblxyXG4vKipcclxuICogRXhlY3V0ZXMgYSBjb21tYW5kIG9uIGEgcmVtb3RlIHNlcnZlci5cclxuICogQHB1YmxpY1xyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdXNlcm5hbWVcclxuICogQHBhcmFtIHtzdHJpbmd9IGhvc3RcclxuICogQHBhcmFtIHtzdHJpbmd9IGNtZCAtIFRoZSBwcm9jZXNzIHRvIGV4ZWN1dGUuXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFN0ZG91dFxyXG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggdXNlcm5hbWUsIGhvc3QsIGNtZCApIHtcclxuICB3aW5zdG9uLmluZm8oIGBydW5uaW5nICR7Y21kfSByZW1vdGVseSBvbiAke2hvc3R9YCApO1xyXG5cclxuICByZXR1cm4gZXhlY3V0ZSggJ3NzaCcsIFtcclxuICAgIGAke3VzZXJuYW1lfUAke2hvc3R9YCxcclxuICAgIGNtZFxyXG4gIF0sICcuJyApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsT0FBTyxHQUFHQyxPQUFPLENBQUUsV0FBWSxDQUFDO0FBQ3RDLE1BQU1DLE9BQU8sR0FBR0QsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUUsTUFBTSxDQUFDQyxPQUFPLEdBQUcsVUFBVUMsUUFBUSxFQUFFQyxJQUFJLEVBQUVDLEdBQUcsRUFBRztFQUMvQ0wsT0FBTyxDQUFDTSxJQUFJLENBQUcsV0FBVUQsR0FBSSxnQkFBZUQsSUFBSyxFQUFFLENBQUM7RUFFcEQsT0FBT04sT0FBTyxDQUFFLEtBQUssRUFBRSxDQUNwQixHQUFFSyxRQUFTLElBQUdDLElBQUssRUFBQyxFQUNyQkMsR0FBRyxDQUNKLEVBQUUsR0FBSSxDQUFDO0FBQ1YsQ0FBQyJ9