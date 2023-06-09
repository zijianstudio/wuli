// Copyright 2020, University of Colorado Boulder

/**
 * Updates the development/test HTML as needed for a change in the version. Updates are based on the version in the
 * package.json. This will also commit if an update occurs.
 *
 * See https://github.com/phetsims/chipper/issues/926
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const execute = require('./execute');
const gitAdd = require('./gitAdd');
const gitCommit = require('./gitCommit');
const gitIsClean = require('./gitIsClean');
const gruntCommand = require('./gruntCommand');
const loadJSON = require('./loadJSON');
const winston = require('winston');

/**
 * Updates the development/test HTML as needed for a change in the version, and creates a commit.
 * @public
 *
 * @param {string} repo - The repository name
 * @returns {Promise}
 */
module.exports = async function (repo) {
  winston.info(`Updating HTML for ${repo} with the new version strings`);
  const isClean = await gitIsClean(repo);
  if (!isClean) {
    throw new Error(`Unclean status in ${repo}, cannot clean up HTML`);
  }

  // We'll want to update development/test HTML as necessary, since they'll include the version
  const packageObject = await loadJSON(`../${repo}/package.json`);
  await execute(gruntCommand, ['generate-development-html'], `../${repo}`);
  await gitAdd(repo, `${repo}_en.html`);
  if (packageObject.phet.generatedUnitTests) {
    await execute(gruntCommand, ['generate-test-html'], `../${repo}`);
    await gitAdd(repo, `${repo}-tests.html`);
  }
  if (!(await gitIsClean(repo))) {
    await gitCommit(repo, `Bumping dev${packageObject.phet.generatedUnitTests ? '/test' : ''} HTML with new version`);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsImdpdEFkZCIsImdpdENvbW1pdCIsImdpdElzQ2xlYW4iLCJncnVudENvbW1hbmQiLCJsb2FkSlNPTiIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwicmVwbyIsImluZm8iLCJpc0NsZWFuIiwiRXJyb3IiLCJwYWNrYWdlT2JqZWN0IiwicGhldCIsImdlbmVyYXRlZFVuaXRUZXN0cyJdLCJzb3VyY2VzIjpbInVwZGF0ZUhUTUxWZXJzaW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoZSBkZXZlbG9wbWVudC90ZXN0IEhUTUwgYXMgbmVlZGVkIGZvciBhIGNoYW5nZSBpbiB0aGUgdmVyc2lvbi4gVXBkYXRlcyBhcmUgYmFzZWQgb24gdGhlIHZlcnNpb24gaW4gdGhlXHJcbiAqIHBhY2thZ2UuanNvbi4gVGhpcyB3aWxsIGFsc28gY29tbWl0IGlmIGFuIHVwZGF0ZSBvY2N1cnMuXHJcbiAqXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2hpcHBlci9pc3N1ZXMvOTI2XHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBleGVjdXRlID0gcmVxdWlyZSggJy4vZXhlY3V0ZScgKTtcclxuY29uc3QgZ2l0QWRkID0gcmVxdWlyZSggJy4vZ2l0QWRkJyApO1xyXG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi9naXRDb21taXQnICk7XHJcbmNvbnN0IGdpdElzQ2xlYW4gPSByZXF1aXJlKCAnLi9naXRJc0NsZWFuJyApO1xyXG5jb25zdCBncnVudENvbW1hbmQgPSByZXF1aXJlKCAnLi9ncnVudENvbW1hbmQnICk7XHJcbmNvbnN0IGxvYWRKU09OID0gcmVxdWlyZSggJy4vbG9hZEpTT04nICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGVzIHRoZSBkZXZlbG9wbWVudC90ZXN0IEhUTUwgYXMgbmVlZGVkIGZvciBhIGNoYW5nZSBpbiB0aGUgdmVyc2lvbiwgYW5kIGNyZWF0ZXMgYSBjb21taXQuXHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHJlcG8gLSBUaGUgcmVwb3NpdG9yeSBuYW1lXHJcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbiggcmVwbyApIHtcclxuICB3aW5zdG9uLmluZm8oIGBVcGRhdGluZyBIVE1MIGZvciAke3JlcG99IHdpdGggdGhlIG5ldyB2ZXJzaW9uIHN0cmluZ3NgICk7XHJcblxyXG4gIGNvbnN0IGlzQ2xlYW4gPSBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICk7XHJcbiAgaWYgKCAhaXNDbGVhbiApIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggYFVuY2xlYW4gc3RhdHVzIGluICR7cmVwb30sIGNhbm5vdCBjbGVhbiB1cCBIVE1MYCApO1xyXG4gIH1cclxuXHJcbiAgLy8gV2UnbGwgd2FudCB0byB1cGRhdGUgZGV2ZWxvcG1lbnQvdGVzdCBIVE1MIGFzIG5lY2Vzc2FyeSwgc2luY2UgdGhleSdsbCBpbmNsdWRlIHRoZSB2ZXJzaW9uXHJcbiAgY29uc3QgcGFja2FnZU9iamVjdCA9IGF3YWl0IGxvYWRKU09OKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gICk7XHJcbiAgYXdhaXQgZXhlY3V0ZSggZ3J1bnRDb21tYW5kLCBbICdnZW5lcmF0ZS1kZXZlbG9wbWVudC1odG1sJyBdLCBgLi4vJHtyZXBvfWAgKTtcclxuICBhd2FpdCBnaXRBZGQoIHJlcG8sIGAke3JlcG99X2VuLmh0bWxgICk7XHJcblxyXG4gIGlmICggcGFja2FnZU9iamVjdC5waGV0LmdlbmVyYXRlZFVuaXRUZXN0cyApIHtcclxuICAgIGF3YWl0IGV4ZWN1dGUoIGdydW50Q29tbWFuZCwgWyAnZ2VuZXJhdGUtdGVzdC1odG1sJyBdLCBgLi4vJHtyZXBvfWAgKTtcclxuICAgIGF3YWl0IGdpdEFkZCggcmVwbywgYCR7cmVwb30tdGVzdHMuaHRtbGAgKTtcclxuICB9XHJcbiAgaWYgKCAhKCBhd2FpdCBnaXRJc0NsZWFuKCByZXBvICkgKSApIHtcclxuICAgIGF3YWl0IGdpdENvbW1pdCggcmVwbywgYEJ1bXBpbmcgZGV2JHtwYWNrYWdlT2JqZWN0LnBoZXQuZ2VuZXJhdGVkVW5pdFRlc3RzID8gJy90ZXN0JyA6ICcnfSBIVE1MIHdpdGggbmV3IHZlcnNpb25gICk7XHJcbiAgfVxyXG59O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsT0FBTyxHQUFHQyxPQUFPLENBQUUsV0FBWSxDQUFDO0FBQ3RDLE1BQU1DLE1BQU0sR0FBR0QsT0FBTyxDQUFFLFVBQVcsQ0FBQztBQUNwQyxNQUFNRSxTQUFTLEdBQUdGLE9BQU8sQ0FBRSxhQUFjLENBQUM7QUFDMUMsTUFBTUcsVUFBVSxHQUFHSCxPQUFPLENBQUUsY0FBZSxDQUFDO0FBQzVDLE1BQU1JLFlBQVksR0FBR0osT0FBTyxDQUFFLGdCQUFpQixDQUFDO0FBQ2hELE1BQU1LLFFBQVEsR0FBR0wsT0FBTyxDQUFFLFlBQWEsQ0FBQztBQUN4QyxNQUFNTSxPQUFPLEdBQUdOLE9BQU8sQ0FBRSxTQUFVLENBQUM7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0FPLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGdCQUFnQkMsSUFBSSxFQUFHO0VBQ3RDSCxPQUFPLENBQUNJLElBQUksQ0FBRyxxQkFBb0JELElBQUssK0JBQStCLENBQUM7RUFFeEUsTUFBTUUsT0FBTyxHQUFHLE1BQU1SLFVBQVUsQ0FBRU0sSUFBSyxDQUFDO0VBQ3hDLElBQUssQ0FBQ0UsT0FBTyxFQUFHO0lBQ2QsTUFBTSxJQUFJQyxLQUFLLENBQUcscUJBQW9CSCxJQUFLLHdCQUF3QixDQUFDO0VBQ3RFOztFQUVBO0VBQ0EsTUFBTUksYUFBYSxHQUFHLE1BQU1SLFFBQVEsQ0FBRyxNQUFLSSxJQUFLLGVBQWUsQ0FBQztFQUNqRSxNQUFNVixPQUFPLENBQUVLLFlBQVksRUFBRSxDQUFFLDJCQUEyQixDQUFFLEVBQUcsTUFBS0ssSUFBSyxFQUFFLENBQUM7RUFDNUUsTUFBTVIsTUFBTSxDQUFFUSxJQUFJLEVBQUcsR0FBRUEsSUFBSyxVQUFVLENBQUM7RUFFdkMsSUFBS0ksYUFBYSxDQUFDQyxJQUFJLENBQUNDLGtCQUFrQixFQUFHO0lBQzNDLE1BQU1oQixPQUFPLENBQUVLLFlBQVksRUFBRSxDQUFFLG9CQUFvQixDQUFFLEVBQUcsTUFBS0ssSUFBSyxFQUFFLENBQUM7SUFDckUsTUFBTVIsTUFBTSxDQUFFUSxJQUFJLEVBQUcsR0FBRUEsSUFBSyxhQUFhLENBQUM7RUFDNUM7RUFDQSxJQUFLLEVBQUcsTUFBTU4sVUFBVSxDQUFFTSxJQUFLLENBQUMsQ0FBRSxFQUFHO0lBQ25DLE1BQU1QLFNBQVMsQ0FBRU8sSUFBSSxFQUFHLGNBQWFJLGFBQWEsQ0FBQ0MsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxPQUFPLEdBQUcsRUFBRyx3QkFBd0IsQ0FBQztFQUNySDtBQUNGLENBQUMifQ==