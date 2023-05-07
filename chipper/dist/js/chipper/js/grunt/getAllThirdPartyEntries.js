// Copyright 2017-2021, University of Colorado Boulder

/**
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getThirdPartyLibEntries = require('./getThirdPartyLibEntries');
const grunt = require('grunt');

/**
 * Returns an object with information about third-party license entries.
 *
 * NOTE: This pulls entries from some of the chipper globals. Should be done only after the build
 *
 * @param {string} repo
 * @param {string} brand
 * @param {Object} licenseEntries
 */
module.exports = function (repo, brand, licenseEntries) {
  const thirdPartyEntries = {
    lib: getThirdPartyLibEntries(repo, brand)
  };
  if (licenseEntries) {
    for (const mediaType in licenseEntries) {
      if (licenseEntries.hasOwnProperty(mediaType)) {
        const mediaEntry = licenseEntries[mediaType];

        // For each resource of that type
        for (const resourceName in mediaEntry) {
          if (mediaEntry.hasOwnProperty(resourceName)) {
            const licenseEntry = mediaEntry[resourceName];

            // If it is not from PhET, it is from a 3rd party and we must include it in the report
            // But lift this restriction when building a non-phet brand
            if (!licenseEntry) {
              // Fail if there is no license entry.  Though this error should have been caught
              if (brand === 'phet' || brand === 'phet-io') {
                // during plugin loading, so this is a "double check"
                grunt.log.error(`No license.json entry for ${resourceName}`);
              }
            } else if (licenseEntry.projectURL !== 'https://phet.colorado.edu' && licenseEntry.projectURL !== 'http://phet.colorado.edu') {
              thirdPartyEntries[mediaType] = thirdPartyEntries[mediaType] || {};
              thirdPartyEntries[mediaType][resourceName] = licenseEntry;
            }
          }
        }
      }
    }
  }
  return thirdPartyEntries;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUaGlyZFBhcnR5TGliRW50cmllcyIsInJlcXVpcmUiLCJncnVudCIsIm1vZHVsZSIsImV4cG9ydHMiLCJyZXBvIiwiYnJhbmQiLCJsaWNlbnNlRW50cmllcyIsInRoaXJkUGFydHlFbnRyaWVzIiwibGliIiwibWVkaWFUeXBlIiwiaGFzT3duUHJvcGVydHkiLCJtZWRpYUVudHJ5IiwicmVzb3VyY2VOYW1lIiwibGljZW5zZUVudHJ5IiwibG9nIiwiZXJyb3IiLCJwcm9qZWN0VVJMIl0sInNvdXJjZXMiOlsiZ2V0QWxsVGhpcmRQYXJ0eUVudHJpZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBnZXRUaGlyZFBhcnR5TGliRW50cmllcyA9IHJlcXVpcmUoICcuL2dldFRoaXJkUGFydHlMaWJFbnRyaWVzJyApO1xyXG5jb25zdCBncnVudCA9IHJlcXVpcmUoICdncnVudCcgKTtcclxuXHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoaXJkLXBhcnR5IGxpY2Vuc2UgZW50cmllcy5cclxuICpcclxuICogTk9URTogVGhpcyBwdWxscyBlbnRyaWVzIGZyb20gc29tZSBvZiB0aGUgY2hpcHBlciBnbG9iYWxzLiBTaG91bGQgYmUgZG9uZSBvbmx5IGFmdGVyIHRoZSBidWlsZFxyXG4gKlxyXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVwb1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gYnJhbmRcclxuICogQHBhcmFtIHtPYmplY3R9IGxpY2Vuc2VFbnRyaWVzXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCByZXBvLCBicmFuZCwgbGljZW5zZUVudHJpZXMgKSB7XHJcbiAgY29uc3QgdGhpcmRQYXJ0eUVudHJpZXMgPSB7XHJcbiAgICBsaWI6IGdldFRoaXJkUGFydHlMaWJFbnRyaWVzKCByZXBvLCBicmFuZCApXHJcbiAgfTtcclxuICBpZiAoIGxpY2Vuc2VFbnRyaWVzICkge1xyXG4gICAgZm9yICggY29uc3QgbWVkaWFUeXBlIGluIGxpY2Vuc2VFbnRyaWVzICkge1xyXG4gICAgICBpZiAoIGxpY2Vuc2VFbnRyaWVzLmhhc093blByb3BlcnR5KCBtZWRpYVR5cGUgKSApIHtcclxuXHJcbiAgICAgICAgY29uc3QgbWVkaWFFbnRyeSA9IGxpY2Vuc2VFbnRyaWVzWyBtZWRpYVR5cGUgXTtcclxuXHJcbiAgICAgICAgLy8gRm9yIGVhY2ggcmVzb3VyY2Ugb2YgdGhhdCB0eXBlXHJcbiAgICAgICAgZm9yICggY29uc3QgcmVzb3VyY2VOYW1lIGluIG1lZGlhRW50cnkgKSB7XHJcbiAgICAgICAgICBpZiAoIG1lZGlhRW50cnkuaGFzT3duUHJvcGVydHkoIHJlc291cmNlTmFtZSApICkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgbGljZW5zZUVudHJ5ID0gbWVkaWFFbnRyeVsgcmVzb3VyY2VOYW1lIF07XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBpdCBpcyBub3QgZnJvbSBQaEVULCBpdCBpcyBmcm9tIGEgM3JkIHBhcnR5IGFuZCB3ZSBtdXN0IGluY2x1ZGUgaXQgaW4gdGhlIHJlcG9ydFxyXG4gICAgICAgICAgICAvLyBCdXQgbGlmdCB0aGlzIHJlc3RyaWN0aW9uIHdoZW4gYnVpbGRpbmcgYSBub24tcGhldCBicmFuZFxyXG4gICAgICAgICAgICBpZiAoICFsaWNlbnNlRW50cnkgKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIEZhaWwgaWYgdGhlcmUgaXMgbm8gbGljZW5zZSBlbnRyeS4gIFRob3VnaCB0aGlzIGVycm9yIHNob3VsZCBoYXZlIGJlZW4gY2F1Z2h0XHJcbiAgICAgICAgICAgICAgaWYgKCBicmFuZCA9PT0gJ3BoZXQnIHx8IGJyYW5kID09PSAncGhldC1pbycgKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkdXJpbmcgcGx1Z2luIGxvYWRpbmcsIHNvIHRoaXMgaXMgYSBcImRvdWJsZSBjaGVja1wiXHJcbiAgICAgICAgICAgICAgICBncnVudC5sb2cuZXJyb3IoIGBObyBsaWNlbnNlLmpzb24gZW50cnkgZm9yICR7cmVzb3VyY2VOYW1lfWAgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIGxpY2Vuc2VFbnRyeS5wcm9qZWN0VVJMICE9PSAnaHR0cHM6Ly9waGV0LmNvbG9yYWRvLmVkdScgJiZcclxuICAgICAgICAgICAgICAgICAgICAgIGxpY2Vuc2VFbnRyeS5wcm9qZWN0VVJMICE9PSAnaHR0cDovL3BoZXQuY29sb3JhZG8uZWR1JyApIHtcclxuICAgICAgICAgICAgICB0aGlyZFBhcnR5RW50cmllc1sgbWVkaWFUeXBlIF0gPSB0aGlyZFBhcnR5RW50cmllc1sgbWVkaWFUeXBlIF0gfHwge307XHJcbiAgICAgICAgICAgICAgdGhpcmRQYXJ0eUVudHJpZXNbIG1lZGlhVHlwZSBdWyByZXNvdXJjZU5hbWUgXSA9IGxpY2Vuc2VFbnRyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXJkUGFydHlFbnRyaWVzO1xyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFHQSxNQUFNQSx1QkFBdUIsR0FBR0MsT0FBTyxDQUFFLDJCQUE0QixDQUFDO0FBQ3RFLE1BQU1DLEtBQUssR0FBR0QsT0FBTyxDQUFFLE9BQVEsQ0FBQzs7QUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FFLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFVBQVVDLElBQUksRUFBRUMsS0FBSyxFQUFFQyxjQUFjLEVBQUc7RUFDdkQsTUFBTUMsaUJBQWlCLEdBQUc7SUFDeEJDLEdBQUcsRUFBRVQsdUJBQXVCLENBQUVLLElBQUksRUFBRUMsS0FBTTtFQUM1QyxDQUFDO0VBQ0QsSUFBS0MsY0FBYyxFQUFHO0lBQ3BCLEtBQU0sTUFBTUcsU0FBUyxJQUFJSCxjQUFjLEVBQUc7TUFDeEMsSUFBS0EsY0FBYyxDQUFDSSxjQUFjLENBQUVELFNBQVUsQ0FBQyxFQUFHO1FBRWhELE1BQU1FLFVBQVUsR0FBR0wsY0FBYyxDQUFFRyxTQUFTLENBQUU7O1FBRTlDO1FBQ0EsS0FBTSxNQUFNRyxZQUFZLElBQUlELFVBQVUsRUFBRztVQUN2QyxJQUFLQSxVQUFVLENBQUNELGNBQWMsQ0FBRUUsWUFBYSxDQUFDLEVBQUc7WUFFL0MsTUFBTUMsWUFBWSxHQUFHRixVQUFVLENBQUVDLFlBQVksQ0FBRTs7WUFFL0M7WUFDQTtZQUNBLElBQUssQ0FBQ0MsWUFBWSxFQUFHO2NBRW5CO2NBQ0EsSUFBS1IsS0FBSyxLQUFLLE1BQU0sSUFBSUEsS0FBSyxLQUFLLFNBQVMsRUFBRztnQkFDN0M7Z0JBQ0FKLEtBQUssQ0FBQ2EsR0FBRyxDQUFDQyxLQUFLLENBQUcsNkJBQTRCSCxZQUFhLEVBQUUsQ0FBQztjQUNoRTtZQUNGLENBQUMsTUFDSSxJQUFLQyxZQUFZLENBQUNHLFVBQVUsS0FBSywyQkFBMkIsSUFDdkRILFlBQVksQ0FBQ0csVUFBVSxLQUFLLDBCQUEwQixFQUFHO2NBQ2pFVCxpQkFBaUIsQ0FBRUUsU0FBUyxDQUFFLEdBQUdGLGlCQUFpQixDQUFFRSxTQUFTLENBQUUsSUFBSSxDQUFDLENBQUM7Y0FDckVGLGlCQUFpQixDQUFFRSxTQUFTLENBQUUsQ0FBRUcsWUFBWSxDQUFFLEdBQUdDLFlBQVk7WUFDL0Q7VUFDRjtRQUNGO01BQ0Y7SUFDRjtFQUNGO0VBRUEsT0FBT04saUJBQWlCO0FBQzFCLENBQUMifQ==