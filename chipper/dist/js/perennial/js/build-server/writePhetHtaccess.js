// Copyright 2017-2018, University of Colorado Boulder

const constants = require('./constants');
const SimVersion = require('../common/SimVersion');
const writeFile = require('../common/writeFile');
const axios = require('axios');

/**
 * Write the .htaccess file to make "latest" point to the version being deployed and allow "download" links to work on Safari
 * @param simName
 * @param version
 */
module.exports = async function writePhetHtaccess(simName, version) {
  const metadataURL = `${constants.BUILD_SERVER_CONFIG.productionServerURL}/services/metadata/1.2/simulations?format=json&type=html&summary&include-unpublished=true&simulation=${simName}`;
  const pass = constants.BUILD_SERVER_CONFIG.serverToken;
  let response;
  try {
    response = await axios({
      url: metadataURL,
      auth: {
        username: 'token',
        password: pass
      }
    });
  } catch (e) {
    throw new Error(e);
  }
  const body = response.data;

  // We got an error and the simulation has already been deployed to the website, bail!
  if (body.error && body.error[0] !== 'No sims found with the criteria provided') {
    throw new Error(body.error);
  }
  // We did not get an error, compare the deploy request version with the website, if the request is for a later version, update it.
  else if (!body.error) {
    const thisVersion = SimVersion.parse(version);
    const latestVersion = SimVersion.parse(body.projects[0].version.string);
    // The requested deploy is earlier than the latest version, exit without updating the .htacess
    if (thisVersion.compareNumber(latestVersion) < 0) {
      return;
    }
  }

  // We either got an error indicating that the simulation has not yet been deployed, or the requested version is later than the latest version
  // Update the .htaccess file that controls the /latest/ rewrite
  const contents = `${'RewriteEngine on\n' + 'RewriteBase /sims/html/'}${simName}/\n` + `RewriteRule ^latest(.*) ${version}$1\n` + 'Header always set Access-Control-Allow-Origin "*"\n\n' + 'RewriteCond %{QUERY_STRING} =download\n' + 'RewriteRule ([^/]*)$ - [L,E=download:$1]\n' + 'Header onsuccess set Content-disposition "attachment; filename=%{download}e" env=download\n';
  await writeFile(`${constants.HTML_SIMS_DIRECTORY + simName}/.htaccess`, contents);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb25zdGFudHMiLCJyZXF1aXJlIiwiU2ltVmVyc2lvbiIsIndyaXRlRmlsZSIsImF4aW9zIiwibW9kdWxlIiwiZXhwb3J0cyIsIndyaXRlUGhldEh0YWNjZXNzIiwic2ltTmFtZSIsInZlcnNpb24iLCJtZXRhZGF0YVVSTCIsIkJVSUxEX1NFUlZFUl9DT05GSUciLCJwcm9kdWN0aW9uU2VydmVyVVJMIiwicGFzcyIsInNlcnZlclRva2VuIiwicmVzcG9uc2UiLCJ1cmwiLCJhdXRoIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsImUiLCJFcnJvciIsImJvZHkiLCJkYXRhIiwiZXJyb3IiLCJ0aGlzVmVyc2lvbiIsInBhcnNlIiwibGF0ZXN0VmVyc2lvbiIsInByb2plY3RzIiwic3RyaW5nIiwiY29tcGFyZU51bWJlciIsImNvbnRlbnRzIiwiSFRNTF9TSU1TX0RJUkVDVE9SWSJdLCJzb3VyY2VzIjpbIndyaXRlUGhldEh0YWNjZXNzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMTgsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuXHJcbmNvbnN0IGNvbnN0YW50cyA9IHJlcXVpcmUoICcuL2NvbnN0YW50cycgKTtcclxuY29uc3QgU2ltVmVyc2lvbiA9IHJlcXVpcmUoICcuLi9jb21tb24vU2ltVmVyc2lvbicgKTtcclxuY29uc3Qgd3JpdGVGaWxlID0gcmVxdWlyZSggJy4uL2NvbW1vbi93cml0ZUZpbGUnICk7XHJcbmNvbnN0IGF4aW9zID0gcmVxdWlyZSggJ2F4aW9zJyApO1xyXG5cclxuLyoqXHJcbiAqIFdyaXRlIHRoZSAuaHRhY2Nlc3MgZmlsZSB0byBtYWtlIFwibGF0ZXN0XCIgcG9pbnQgdG8gdGhlIHZlcnNpb24gYmVpbmcgZGVwbG95ZWQgYW5kIGFsbG93IFwiZG93bmxvYWRcIiBsaW5rcyB0byB3b3JrIG9uIFNhZmFyaVxyXG4gKiBAcGFyYW0gc2ltTmFtZVxyXG4gKiBAcGFyYW0gdmVyc2lvblxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiB3cml0ZVBoZXRIdGFjY2Vzcyggc2ltTmFtZSwgdmVyc2lvbiApIHtcclxuICBjb25zdCBtZXRhZGF0YVVSTCA9IGAke2NvbnN0YW50cy5CVUlMRF9TRVJWRVJfQ09ORklHLnByb2R1Y3Rpb25TZXJ2ZXJVUkx9L3NlcnZpY2VzL21ldGFkYXRhLzEuMi9zaW11bGF0aW9ucz9mb3JtYXQ9anNvbiZ0eXBlPWh0bWwmc3VtbWFyeSZpbmNsdWRlLXVucHVibGlzaGVkPXRydWUmc2ltdWxhdGlvbj0ke3NpbU5hbWV9YDtcclxuICBjb25zdCBwYXNzID0gY29uc3RhbnRzLkJVSUxEX1NFUlZFUl9DT05GSUcuc2VydmVyVG9rZW47XHJcbiAgbGV0IHJlc3BvbnNlO1xyXG4gIHRyeSB7XHJcbiAgICByZXNwb25zZSA9IGF3YWl0IGF4aW9zKCB7XHJcbiAgICAgIHVybDogbWV0YWRhdGFVUkwsXHJcbiAgICAgIGF1dGg6IHtcclxuICAgICAgICB1c2VybmFtZTogJ3Rva2VuJyxcclxuICAgICAgICBwYXNzd29yZDogcGFzc1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG4gIGNhdGNoKCBlICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCBlICk7XHJcbiAgfVxyXG4gIGNvbnN0IGJvZHkgPSByZXNwb25zZS5kYXRhO1xyXG5cclxuXHJcbiAgLy8gV2UgZ290IGFuIGVycm9yIGFuZCB0aGUgc2ltdWxhdGlvbiBoYXMgYWxyZWFkeSBiZWVuIGRlcGxveWVkIHRvIHRoZSB3ZWJzaXRlLCBiYWlsIVxyXG4gIGlmICggYm9keS5lcnJvciAmJiBib2R5LmVycm9yWyAwIF0gIT09ICdObyBzaW1zIGZvdW5kIHdpdGggdGhlIGNyaXRlcmlhIHByb3ZpZGVkJyApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggYm9keS5lcnJvciApO1xyXG4gIH1cclxuICAvLyBXZSBkaWQgbm90IGdldCBhbiBlcnJvciwgY29tcGFyZSB0aGUgZGVwbG95IHJlcXVlc3QgdmVyc2lvbiB3aXRoIHRoZSB3ZWJzaXRlLCBpZiB0aGUgcmVxdWVzdCBpcyBmb3IgYSBsYXRlciB2ZXJzaW9uLCB1cGRhdGUgaXQuXHJcbiAgZWxzZSBpZiAoICFib2R5LmVycm9yICkge1xyXG4gICAgY29uc3QgdGhpc1ZlcnNpb24gPSBTaW1WZXJzaW9uLnBhcnNlKCB2ZXJzaW9uICk7XHJcbiAgICBjb25zdCBsYXRlc3RWZXJzaW9uID0gU2ltVmVyc2lvbi5wYXJzZSggYm9keS5wcm9qZWN0c1sgMCBdLnZlcnNpb24uc3RyaW5nICk7XHJcbiAgICAvLyBUaGUgcmVxdWVzdGVkIGRlcGxveSBpcyBlYXJsaWVyIHRoYW4gdGhlIGxhdGVzdCB2ZXJzaW9uLCBleGl0IHdpdGhvdXQgdXBkYXRpbmcgdGhlIC5odGFjZXNzXHJcbiAgICBpZiAoIHRoaXNWZXJzaW9uLmNvbXBhcmVOdW1iZXIoIGxhdGVzdFZlcnNpb24gKSA8IDAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFdlIGVpdGhlciBnb3QgYW4gZXJyb3IgaW5kaWNhdGluZyB0aGF0IHRoZSBzaW11bGF0aW9uIGhhcyBub3QgeWV0IGJlZW4gZGVwbG95ZWQsIG9yIHRoZSByZXF1ZXN0ZWQgdmVyc2lvbiBpcyBsYXRlciB0aGFuIHRoZSBsYXRlc3QgdmVyc2lvblxyXG4gIC8vIFVwZGF0ZSB0aGUgLmh0YWNjZXNzIGZpbGUgdGhhdCBjb250cm9scyB0aGUgL2xhdGVzdC8gcmV3cml0ZVxyXG4gIGNvbnN0IGNvbnRlbnRzID0gYCR7J1Jld3JpdGVFbmdpbmUgb25cXG4nICtcclxuICAgICAgICAgICAgICAgICAgICdSZXdyaXRlQmFzZSAvc2ltcy9odG1sLyd9JHtzaW1OYW1lfS9cXG5gICtcclxuICAgICAgICAgICAgICAgICAgIGBSZXdyaXRlUnVsZSBebGF0ZXN0KC4qKSAke3ZlcnNpb259JDFcXG5gICtcclxuICAgICAgICAgICAgICAgICAgICdIZWFkZXIgYWx3YXlzIHNldCBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gXCIqXCJcXG5cXG4nICtcclxuICAgICAgICAgICAgICAgICAgICdSZXdyaXRlQ29uZCAle1FVRVJZX1NUUklOR30gPWRvd25sb2FkXFxuJyArXHJcbiAgICAgICAgICAgICAgICAgICAnUmV3cml0ZVJ1bGUgKFteL10qKSQgLSBbTCxFPWRvd25sb2FkOiQxXVxcbicgK1xyXG4gICAgICAgICAgICAgICAgICAgJ0hlYWRlciBvbnN1Y2Nlc3Mgc2V0IENvbnRlbnQtZGlzcG9zaXRpb24gXCJhdHRhY2htZW50OyBmaWxlbmFtZT0le2Rvd25sb2FkfWVcIiBlbnY9ZG93bmxvYWRcXG4nO1xyXG4gIGF3YWl0IHdyaXRlRmlsZSggYCR7Y29uc3RhbnRzLkhUTUxfU0lNU19ESVJFQ1RPUlkgKyBzaW1OYW1lfS8uaHRhY2Nlc3NgLCBjb250ZW50cyApO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBLE1BQU1BLFNBQVMsR0FBR0MsT0FBTyxDQUFFLGFBQWMsQ0FBQztBQUMxQyxNQUFNQyxVQUFVLEdBQUdELE9BQU8sQ0FBRSxzQkFBdUIsQ0FBQztBQUNwRCxNQUFNRSxTQUFTLEdBQUdGLE9BQU8sQ0FBRSxxQkFBc0IsQ0FBQztBQUNsRCxNQUFNRyxLQUFLLEdBQUdILE9BQU8sQ0FBRSxPQUFRLENBQUM7O0FBRWhDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQUksTUFBTSxDQUFDQyxPQUFPLEdBQUcsZUFBZUMsaUJBQWlCQSxDQUFFQyxPQUFPLEVBQUVDLE9BQU8sRUFBRztFQUNwRSxNQUFNQyxXQUFXLEdBQUksR0FBRVYsU0FBUyxDQUFDVyxtQkFBbUIsQ0FBQ0MsbUJBQW9CLHdHQUF1R0osT0FBUSxFQUFDO0VBQ3pMLE1BQU1LLElBQUksR0FBR2IsU0FBUyxDQUFDVyxtQkFBbUIsQ0FBQ0csV0FBVztFQUN0RCxJQUFJQyxRQUFRO0VBQ1osSUFBSTtJQUNGQSxRQUFRLEdBQUcsTUFBTVgsS0FBSyxDQUFFO01BQ3RCWSxHQUFHLEVBQUVOLFdBQVc7TUFDaEJPLElBQUksRUFBRTtRQUNKQyxRQUFRLEVBQUUsT0FBTztRQUNqQkMsUUFBUSxFQUFFTjtNQUNaO0lBQ0YsQ0FBRSxDQUFDO0VBQ0wsQ0FBQyxDQUNELE9BQU9PLENBQUMsRUFBRztJQUNULE1BQU0sSUFBSUMsS0FBSyxDQUFFRCxDQUFFLENBQUM7RUFDdEI7RUFDQSxNQUFNRSxJQUFJLEdBQUdQLFFBQVEsQ0FBQ1EsSUFBSTs7RUFHMUI7RUFDQSxJQUFLRCxJQUFJLENBQUNFLEtBQUssSUFBSUYsSUFBSSxDQUFDRSxLQUFLLENBQUUsQ0FBQyxDQUFFLEtBQUssMENBQTBDLEVBQUc7SUFDbEYsTUFBTSxJQUFJSCxLQUFLLENBQUVDLElBQUksQ0FBQ0UsS0FBTSxDQUFDO0VBQy9CO0VBQ0E7RUFBQSxLQUNLLElBQUssQ0FBQ0YsSUFBSSxDQUFDRSxLQUFLLEVBQUc7SUFDdEIsTUFBTUMsV0FBVyxHQUFHdkIsVUFBVSxDQUFDd0IsS0FBSyxDQUFFakIsT0FBUSxDQUFDO0lBQy9DLE1BQU1rQixhQUFhLEdBQUd6QixVQUFVLENBQUN3QixLQUFLLENBQUVKLElBQUksQ0FBQ00sUUFBUSxDQUFFLENBQUMsQ0FBRSxDQUFDbkIsT0FBTyxDQUFDb0IsTUFBTyxDQUFDO0lBQzNFO0lBQ0EsSUFBS0osV0FBVyxDQUFDSyxhQUFhLENBQUVILGFBQWMsQ0FBQyxHQUFHLENBQUMsRUFBRztNQUNwRDtJQUNGO0VBQ0Y7O0VBRUE7RUFDQTtFQUNBLE1BQU1JLFFBQVEsR0FBSSxHQUFFLG9CQUFvQixHQUN2Qix5QkFBMEIsR0FBRXZCLE9BQVEsS0FBSSxHQUN2QywyQkFBMEJDLE9BQVEsTUFBSyxHQUN4Qyx1REFBdUQsR0FDdkQseUNBQXlDLEdBQ3pDLDRDQUE0QyxHQUM1Qyw2RkFBNkY7RUFDOUcsTUFBTU4sU0FBUyxDQUFHLEdBQUVILFNBQVMsQ0FBQ2dDLG1CQUFtQixHQUFHeEIsT0FBUSxZQUFXLEVBQUV1QixRQUFTLENBQUM7QUFDckYsQ0FBQyJ9