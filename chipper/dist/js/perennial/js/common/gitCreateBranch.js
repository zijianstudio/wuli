// Copyright 2018, University of Colorado Boulder

/**
 * git checkout -b {{BRANCH}}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const assert = require('assert');
const winston = require('winston');

/**
 * Executes git checkout -b {{BRANCH}}
 * @public
 *
 * @param {string} repo - The repository name
 * @param {string} branch - The branch name to create
 * @returns {Promise.<string>} - Stdout
 * @rejects {ExecuteError}
 */
module.exports = function (repo, branch) {
  assert(typeof repo === 'string');
  assert(typeof branch === 'string');
  winston.info(`git checkout -b ${branch} on ${repo}`);
  return execute('git', ['checkout', '-b', branch], `../${repo}`);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImFzc2VydCIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImJyYW5jaCIsImluZm8iXSwic291cmNlcyI6WyJnaXRDcmVhdGVCcmFuY2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGdpdCBjaGVja291dCAtYiB7e0JSQU5DSH19XHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKTtcclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5cclxuLyoqXHJcbiAqIEV4ZWN1dGVzIGdpdCBjaGVja291dCAtYiB7e0JSQU5DSH19XHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBicmFuY2ggLSBUaGUgYnJhbmNoIG5hbWUgdG8gY3JlYXRlXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlLjxzdHJpbmc+fSAtIFN0ZG91dFxyXG4gKiBAcmVqZWN0cyB7RXhlY3V0ZUVycm9yfVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggcmVwbywgYnJhbmNoICkge1xyXG4gIGFzc2VydCggdHlwZW9mIHJlcG8gPT09ICdzdHJpbmcnICk7XHJcbiAgYXNzZXJ0KCB0eXBlb2YgYnJhbmNoID09PSAnc3RyaW5nJyApO1xyXG5cclxuICB3aW5zdG9uLmluZm8oIGBnaXQgY2hlY2tvdXQgLWIgJHticmFuY2h9IG9uICR7cmVwb31gICk7XHJcblxyXG4gIHJldHVybiBleGVjdXRlKCAnZ2l0JywgWyAnY2hlY2tvdXQnLCAnLWInLCBicmFuY2ggXSwgYC4uLyR7cmVwb31gICk7XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxPQUFPLEdBQUdDLE9BQU8sQ0FBRSxXQUFZLENBQUM7QUFDdEMsTUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUUsUUFBUyxDQUFDO0FBQ2xDLE1BQU1FLE9BQU8sR0FBR0YsT0FBTyxDQUFFLFNBQVUsQ0FBQzs7QUFFcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FHLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFVBQVVDLElBQUksRUFBRUMsTUFBTSxFQUFHO0VBQ3hDTCxNQUFNLENBQUUsT0FBT0ksSUFBSSxLQUFLLFFBQVMsQ0FBQztFQUNsQ0osTUFBTSxDQUFFLE9BQU9LLE1BQU0sS0FBSyxRQUFTLENBQUM7RUFFcENKLE9BQU8sQ0FBQ0ssSUFBSSxDQUFHLG1CQUFrQkQsTUFBTyxPQUFNRCxJQUFLLEVBQUUsQ0FBQztFQUV0RCxPQUFPTixPQUFPLENBQUUsS0FBSyxFQUFFLENBQUUsVUFBVSxFQUFFLElBQUksRUFBRU8sTUFBTSxDQUFFLEVBQUcsTUFBS0QsSUFBSyxFQUFFLENBQUM7QUFDckUsQ0FBQyJ9