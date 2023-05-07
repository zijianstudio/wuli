// Copyright 2017, University of Colorado Boulder

/**
 * Builds a repository.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const ChipperVersion = require('./ChipperVersion');
const execute = require('./execute');
const getBuildArguments = require('./getBuildArguments');
const gruntCommand = require('./gruntCommand');
const fs = require('fs');
const winston = require('winston');

/**
 * Builds a repository.
 * @public
 *
 * @param {string} repo
 * @param {Object} [options]
 * @returns {Promise.<string>} - The stdout of the build
 */
module.exports = async function (repo, options) {
  winston.info(`building ${repo}`);
  const chipperVersion = ChipperVersion.getFromRepository();
  const args = getBuildArguments(chipperVersion, options);
  const result = await execute(gruntCommand, args, `../${repo}`);
  const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
  const includesPhetio = packageObject.phet && packageObject.phet.supportedBrands && packageObject.phet.supportedBrands.includes('phet-io');

  // Examine output to see if getDependencies (in chipper) notices any missing phet-io things.
  // Fail out if so. Detects that specific error message.
  if (includesPhetio && result.includes('WARNING404')) {
    throw new Error('phet-io dependencies missing');
  }
  return result;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGlwcGVyVmVyc2lvbiIsInJlcXVpcmUiLCJleGVjdXRlIiwiZ2V0QnVpbGRBcmd1bWVudHMiLCJncnVudENvbW1hbmQiLCJmcyIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsIm9wdGlvbnMiLCJpbmZvIiwiY2hpcHBlclZlcnNpb24iLCJnZXRGcm9tUmVwb3NpdG9yeSIsImFyZ3MiLCJyZXN1bHQiLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiaW5jbHVkZXNQaGV0aW8iLCJwaGV0Iiwic3VwcG9ydGVkQnJhbmRzIiwiaW5jbHVkZXMiLCJFcnJvciJdLCJzb3VyY2VzIjpbImJ1aWxkLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSByZXBvc2l0b3J5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgQ2hpcHBlclZlcnNpb24gPSByZXF1aXJlKCAnLi9DaGlwcGVyVmVyc2lvbicgKTtcclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuL2V4ZWN1dGUnICk7XHJcbmNvbnN0IGdldEJ1aWxkQXJndW1lbnRzID0gcmVxdWlyZSggJy4vZ2V0QnVpbGRBcmd1bWVudHMnICk7XHJcbmNvbnN0IGdydW50Q29tbWFuZCA9IHJlcXVpcmUoICcuL2dydW50Q29tbWFuZCcgKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBCdWlsZHMgYSByZXBvc2l0b3J5LlxyXG4gKiBAcHVibGljXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSByZXBvXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICogQHJldHVybnMge1Byb21pc2UuPHN0cmluZz59IC0gVGhlIHN0ZG91dCBvZiB0aGUgYnVpbGRcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgZnVuY3Rpb24oIHJlcG8sIG9wdGlvbnMgKSB7XHJcbiAgd2luc3Rvbi5pbmZvKCBgYnVpbGRpbmcgJHtyZXBvfWAgKTtcclxuXHJcbiAgY29uc3QgY2hpcHBlclZlcnNpb24gPSBDaGlwcGVyVmVyc2lvbi5nZXRGcm9tUmVwb3NpdG9yeSgpO1xyXG4gIGNvbnN0IGFyZ3MgPSBnZXRCdWlsZEFyZ3VtZW50cyggY2hpcHBlclZlcnNpb24sIG9wdGlvbnMgKTtcclxuXHJcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBhcmdzLCBgLi4vJHtyZXBvfWAgKTtcclxuXHJcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IEpTT04ucGFyc2UoIGZzLnJlYWRGaWxlU3luYyggYC4uLyR7cmVwb30vcGFja2FnZS5qc29uYCwgJ3V0ZjgnICkgKTtcclxuICBjb25zdCBpbmNsdWRlc1BoZXRpbyA9IHBhY2thZ2VPYmplY3QucGhldCAmJiBwYWNrYWdlT2JqZWN0LnBoZXQuc3VwcG9ydGVkQnJhbmRzICYmIHBhY2thZ2VPYmplY3QucGhldC5zdXBwb3J0ZWRCcmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApO1xyXG5cclxuICAvLyBFeGFtaW5lIG91dHB1dCB0byBzZWUgaWYgZ2V0RGVwZW5kZW5jaWVzIChpbiBjaGlwcGVyKSBub3RpY2VzIGFueSBtaXNzaW5nIHBoZXQtaW8gdGhpbmdzLlxyXG4gIC8vIEZhaWwgb3V0IGlmIHNvLiBEZXRlY3RzIHRoYXQgc3BlY2lmaWMgZXJyb3IgbWVzc2FnZS5cclxuICBpZiAoIGluY2x1ZGVzUGhldGlvICYmIHJlc3VsdC5pbmNsdWRlcyggJ1dBUk5JTkc0MDQnICkgKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdwaGV0LWlvIGRlcGVuZGVuY2llcyBtaXNzaW5nJyApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLGtCQUFtQixDQUFDO0FBQ3BELE1BQU1DLE9BQU8sR0FBR0QsT0FBTyxDQUFFLFdBQVksQ0FBQztBQUN0QyxNQUFNRSxpQkFBaUIsR0FBR0YsT0FBTyxDQUFFLHFCQUFzQixDQUFDO0FBQzFELE1BQU1HLFlBQVksR0FBR0gsT0FBTyxDQUFFLGdCQUFpQixDQUFDO0FBQ2hELE1BQU1JLEVBQUUsR0FBR0osT0FBTyxDQUFFLElBQUssQ0FBQztBQUMxQixNQUFNSyxPQUFPLEdBQUdMLE9BQU8sQ0FBRSxTQUFVLENBQUM7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQU0sTUFBTSxDQUFDQyxPQUFPLEdBQUcsZ0JBQWdCQyxJQUFJLEVBQUVDLE9BQU8sRUFBRztFQUMvQ0osT0FBTyxDQUFDSyxJQUFJLENBQUcsWUFBV0YsSUFBSyxFQUFFLENBQUM7RUFFbEMsTUFBTUcsY0FBYyxHQUFHWixjQUFjLENBQUNhLGlCQUFpQixDQUFDLENBQUM7RUFDekQsTUFBTUMsSUFBSSxHQUFHWCxpQkFBaUIsQ0FBRVMsY0FBYyxFQUFFRixPQUFRLENBQUM7RUFFekQsTUFBTUssTUFBTSxHQUFHLE1BQU1iLE9BQU8sQ0FBRUUsWUFBWSxFQUFFVSxJQUFJLEVBQUcsTUFBS0wsSUFBSyxFQUFFLENBQUM7RUFFaEUsTUFBTU8sYUFBYSxHQUFHQyxJQUFJLENBQUNDLEtBQUssQ0FBRWIsRUFBRSxDQUFDYyxZQUFZLENBQUcsTUFBS1YsSUFBSyxlQUFjLEVBQUUsTUFBTyxDQUFFLENBQUM7RUFDeEYsTUFBTVcsY0FBYyxHQUFHSixhQUFhLENBQUNLLElBQUksSUFBSUwsYUFBYSxDQUFDSyxJQUFJLENBQUNDLGVBQWUsSUFBSU4sYUFBYSxDQUFDSyxJQUFJLENBQUNDLGVBQWUsQ0FBQ0MsUUFBUSxDQUFFLFNBQVUsQ0FBQzs7RUFFM0k7RUFDQTtFQUNBLElBQUtILGNBQWMsSUFBSUwsTUFBTSxDQUFDUSxRQUFRLENBQUUsWUFBYSxDQUFDLEVBQUc7SUFDdkQsTUFBTSxJQUFJQyxLQUFLLENBQUUsOEJBQStCLENBQUM7RUFDbkQ7RUFFQSxPQUFPVCxNQUFNO0FBQ2YsQ0FBQyJ9