// Copyright 2017, University of Colorado Boulder

/**
 * Generates the lists under perennial/data/, and if there were changes, will commit and push.
 *
 * This grunt task should be run manually by developers when a change has been made that would add or remove
 * an entry from one of the perennial/data/ lists. But it will also be run as part of daily-grunt-work.sh
 * to catch anything that was forgotten.
 *
 * This used to be run automatically by bayes whenever a relevant change was made, see
 * https://github.com/phetsims/perennial/issues/66
 *
 * But we decided to change it to a manual step with a daily fallback, see
 * https://github.com/phetsims/perennial/issues/213
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getActiveRepos = require('../common/getActiveRepos');
const getBranch = require('../common/getBranch');
const gitAdd = require('../common/gitAdd');
const gitCommit = require('../common/gitCommit');
const gitIsClean = require('../common/gitIsClean');
const gitPush = require('../common/gitPush');
const assert = require('assert');
const fs = require('fs');
const grunt = require('grunt');
const os = require('os');
const winston = require('winston');

/**
 * Generates the lists under perennial/data/, and if there were changes, will commit and push.
 * @public
 */
module.exports = async function () {
  if ((await getBranch('perennial')) !== 'master' || !(await gitIsClean('perennial'))) {
    grunt.fail.fatal('Data will only be generated if perennial is on master with no working-copy changes.');
  }
  const activeRepos = getActiveRepos();
  function writeList(name, packageFilter) {
    const repos = activeRepos.filter(repo => {
      // Make sure that if someone doesn't have all repositories checked out that this will FAIL. Otherwise bad things.
      assert(grunt.file.exists(`../${repo}`));
      let packageObject;
      try {
        packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
      } catch (e) {
        return false;
      }
      return packageObject.phet && packageFilter(packageObject.phet);
    });
    grunt.log.writeln(`Writing to data/${name}`);
    fs.writeFileSync(`data/${name}`, repos.join(os.EOL) + os.EOL);
  }
  writeList('interactive-description', phet => phet.simFeatures && phet.simFeatures.supportsInteractiveDescription);
  writeList('voicing', phet => phet.simFeatures && phet.simFeatures.supportsVoicing);
  writeList('active-runnables', phet => phet.runnable);
  writeList('active-sims', phet => phet.simulation);
  writeList('unit-tests', phet => phet.generatedUnitTests);
  writeList('phet-io', phet => phet.runnable && phet.supportedBrands && phet.supportedBrands.includes('phet-io'));
  writeList('phet-io-api-stable', phet => {
    return phet.runnable && phet.supportedBrands && phet.supportedBrands.includes('phet-io') && phet['phet-io'] && phet['phet-io'].compareDesignedAPIChanges;
  });
  await gitAdd('perennial', 'data/interactive-description');
  await gitAdd('perennial', 'data/voicing');
  await gitAdd('perennial', 'data/active-runnables');
  await gitAdd('perennial', 'data/active-sims');
  await gitAdd('perennial', 'data/unit-tests');
  await gitAdd('perennial', 'data/phet-io');
  await gitAdd('perennial', 'data/phet-io-api-stable');
  const hasChanges = !(await gitIsClean('perennial'));
  if (hasChanges) {
    winston.info('Changes to data files detected, will push');
    await gitCommit('perennial', 'Automated update of perennial data files');
    await gitPush('perennial', 'master');
  } else {
    winston.info('No changes detected');
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRBY3RpdmVSZXBvcyIsInJlcXVpcmUiLCJnZXRCcmFuY2giLCJnaXRBZGQiLCJnaXRDb21taXQiLCJnaXRJc0NsZWFuIiwiZ2l0UHVzaCIsImFzc2VydCIsImZzIiwiZ3J1bnQiLCJvcyIsIndpbnN0b24iLCJtb2R1bGUiLCJleHBvcnRzIiwiZmFpbCIsImZhdGFsIiwiYWN0aXZlUmVwb3MiLCJ3cml0ZUxpc3QiLCJuYW1lIiwicGFja2FnZUZpbHRlciIsInJlcG9zIiwiZmlsdGVyIiwicmVwbyIsImZpbGUiLCJleGlzdHMiLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiZSIsInBoZXQiLCJsb2ciLCJ3cml0ZWxuIiwid3JpdGVGaWxlU3luYyIsImpvaW4iLCJFT0wiLCJzaW1GZWF0dXJlcyIsInN1cHBvcnRzSW50ZXJhY3RpdmVEZXNjcmlwdGlvbiIsInN1cHBvcnRzVm9pY2luZyIsInJ1bm5hYmxlIiwic2ltdWxhdGlvbiIsImdlbmVyYXRlZFVuaXRUZXN0cyIsInN1cHBvcnRlZEJyYW5kcyIsImluY2x1ZGVzIiwiY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcyIsImhhc0NoYW5nZXMiLCJpbmZvIl0sInNvdXJjZXMiOlsiZ2VuZXJhdGVEYXRhLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZXMgdGhlIGxpc3RzIHVuZGVyIHBlcmVubmlhbC9kYXRhLywgYW5kIGlmIHRoZXJlIHdlcmUgY2hhbmdlcywgd2lsbCBjb21taXQgYW5kIHB1c2guXHJcbiAqXHJcbiAqIFRoaXMgZ3J1bnQgdGFzayBzaG91bGQgYmUgcnVuIG1hbnVhbGx5IGJ5IGRldmVsb3BlcnMgd2hlbiBhIGNoYW5nZSBoYXMgYmVlbiBtYWRlIHRoYXQgd291bGQgYWRkIG9yIHJlbW92ZVxyXG4gKiBhbiBlbnRyeSBmcm9tIG9uZSBvZiB0aGUgcGVyZW5uaWFsL2RhdGEvIGxpc3RzLiBCdXQgaXQgd2lsbCBhbHNvIGJlIHJ1biBhcyBwYXJ0IG9mIGRhaWx5LWdydW50LXdvcmsuc2hcclxuICogdG8gY2F0Y2ggYW55dGhpbmcgdGhhdCB3YXMgZm9yZ290dGVuLlxyXG4gKlxyXG4gKiBUaGlzIHVzZWQgdG8gYmUgcnVuIGF1dG9tYXRpY2FsbHkgYnkgYmF5ZXMgd2hlbmV2ZXIgYSByZWxldmFudCBjaGFuZ2Ugd2FzIG1hZGUsIHNlZVxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy82NlxyXG4gKlxyXG4gKiBCdXQgd2UgZGVjaWRlZCB0byBjaGFuZ2UgaXQgdG8gYSBtYW51YWwgc3RlcCB3aXRoIGEgZGFpbHkgZmFsbGJhY2ssIHNlZVxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGVyZW5uaWFsL2lzc3Vlcy8yMTNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRBY3RpdmVSZXBvcycgKTtcclxuY29uc3QgZ2V0QnJhbmNoID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRCcmFuY2gnICk7XHJcbmNvbnN0IGdpdEFkZCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0QWRkJyApO1xyXG5jb25zdCBnaXRDb21taXQgPSByZXF1aXJlKCAnLi4vY29tbW9uL2dpdENvbW1pdCcgKTtcclxuY29uc3QgZ2l0SXNDbGVhbiA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0SXNDbGVhbicgKTtcclxuY29uc3QgZ2l0UHVzaCA9IHJlcXVpcmUoICcuLi9jb21tb24vZ2l0UHVzaCcgKTtcclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcbmNvbnN0IGdydW50ID0gcmVxdWlyZSggJ2dydW50JyApO1xyXG5jb25zdCBvcyA9IHJlcXVpcmUoICdvcycgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlcyB0aGUgbGlzdHMgdW5kZXIgcGVyZW5uaWFsL2RhdGEvLCBhbmQgaWYgdGhlcmUgd2VyZSBjaGFuZ2VzLCB3aWxsIGNvbW1pdCBhbmQgcHVzaC5cclxuICogQHB1YmxpY1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBmdW5jdGlvbigpIHtcclxuICBpZiAoIGF3YWl0IGdldEJyYW5jaCggJ3BlcmVubmlhbCcgKSAhPT0gJ21hc3RlcicgfHwgIWF3YWl0IGdpdElzQ2xlYW4oICdwZXJlbm5pYWwnICkgKSB7XHJcbiAgICBncnVudC5mYWlsLmZhdGFsKCAnRGF0YSB3aWxsIG9ubHkgYmUgZ2VuZXJhdGVkIGlmIHBlcmVubmlhbCBpcyBvbiBtYXN0ZXIgd2l0aCBubyB3b3JraW5nLWNvcHkgY2hhbmdlcy4nICk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhY3RpdmVSZXBvcyA9IGdldEFjdGl2ZVJlcG9zKCk7XHJcblxyXG4gIGZ1bmN0aW9uIHdyaXRlTGlzdCggbmFtZSwgcGFja2FnZUZpbHRlciApIHtcclxuICAgIGNvbnN0IHJlcG9zID0gYWN0aXZlUmVwb3MuZmlsdGVyKCByZXBvID0+IHtcclxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgaWYgc29tZW9uZSBkb2Vzbid0IGhhdmUgYWxsIHJlcG9zaXRvcmllcyBjaGVja2VkIG91dCB0aGF0IHRoaXMgd2lsbCBGQUlMLiBPdGhlcndpc2UgYmFkIHRoaW5ncy5cclxuICAgICAgYXNzZXJ0KCBncnVudC5maWxlLmV4aXN0cyggYC4uLyR7cmVwb31gICkgKTtcclxuXHJcbiAgICAgIGxldCBwYWNrYWdlT2JqZWN0O1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHBhY2thZ2VPYmplY3QgPSBKU09OLnBhcnNlKCBmcy5yZWFkRmlsZVN5bmMoIGAuLi8ke3JlcG99L3BhY2thZ2UuanNvbmAsICd1dGY4JyApICk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwYWNrYWdlT2JqZWN0LnBoZXQgJiYgcGFja2FnZUZpbHRlciggcGFja2FnZU9iamVjdC5waGV0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgZ3J1bnQubG9nLndyaXRlbG4oIGBXcml0aW5nIHRvIGRhdGEvJHtuYW1lfWAgKTtcclxuICAgIGZzLndyaXRlRmlsZVN5bmMoIGBkYXRhLyR7bmFtZX1gLCByZXBvcy5qb2luKCBvcy5FT0wgKSArIG9zLkVPTCApO1xyXG4gIH1cclxuXHJcbiAgd3JpdGVMaXN0KCAnaW50ZXJhY3RpdmUtZGVzY3JpcHRpb24nLCBwaGV0ID0+IHBoZXQuc2ltRmVhdHVyZXMgJiYgcGhldC5zaW1GZWF0dXJlcy5zdXBwb3J0c0ludGVyYWN0aXZlRGVzY3JpcHRpb24gKTtcclxuICB3cml0ZUxpc3QoICd2b2ljaW5nJywgcGhldCA9PiBwaGV0LnNpbUZlYXR1cmVzICYmIHBoZXQuc2ltRmVhdHVyZXMuc3VwcG9ydHNWb2ljaW5nICk7XHJcbiAgd3JpdGVMaXN0KCAnYWN0aXZlLXJ1bm5hYmxlcycsIHBoZXQgPT4gcGhldC5ydW5uYWJsZSApO1xyXG4gIHdyaXRlTGlzdCggJ2FjdGl2ZS1zaW1zJywgcGhldCA9PiBwaGV0LnNpbXVsYXRpb24gKTtcclxuICB3cml0ZUxpc3QoICd1bml0LXRlc3RzJywgcGhldCA9PiBwaGV0LmdlbmVyYXRlZFVuaXRUZXN0cyApO1xyXG4gIHdyaXRlTGlzdCggJ3BoZXQtaW8nLCBwaGV0ID0+IHBoZXQucnVubmFibGUgJiYgcGhldC5zdXBwb3J0ZWRCcmFuZHMgJiYgcGhldC5zdXBwb3J0ZWRCcmFuZHMuaW5jbHVkZXMoICdwaGV0LWlvJyApICk7XHJcbiAgd3JpdGVMaXN0KCAncGhldC1pby1hcGktc3RhYmxlJywgcGhldCA9PiB7XHJcbiAgICByZXR1cm4gcGhldC5ydW5uYWJsZSAmJiBwaGV0LnN1cHBvcnRlZEJyYW5kcyAmJiBwaGV0LnN1cHBvcnRlZEJyYW5kcy5pbmNsdWRlcyggJ3BoZXQtaW8nICkgJiZcclxuICAgICAgICAgICBwaGV0WyAncGhldC1pbycgXSAmJiBwaGV0WyAncGhldC1pbycgXS5jb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzO1xyXG4gIH0gKTtcclxuXHJcbiAgYXdhaXQgZ2l0QWRkKCAncGVyZW5uaWFsJywgJ2RhdGEvaW50ZXJhY3RpdmUtZGVzY3JpcHRpb24nICk7XHJcbiAgYXdhaXQgZ2l0QWRkKCAncGVyZW5uaWFsJywgJ2RhdGEvdm9pY2luZycgKTtcclxuICBhd2FpdCBnaXRBZGQoICdwZXJlbm5pYWwnLCAnZGF0YS9hY3RpdmUtcnVubmFibGVzJyApO1xyXG4gIGF3YWl0IGdpdEFkZCggJ3BlcmVubmlhbCcsICdkYXRhL2FjdGl2ZS1zaW1zJyApO1xyXG4gIGF3YWl0IGdpdEFkZCggJ3BlcmVubmlhbCcsICdkYXRhL3VuaXQtdGVzdHMnICk7XHJcbiAgYXdhaXQgZ2l0QWRkKCAncGVyZW5uaWFsJywgJ2RhdGEvcGhldC1pbycgKTtcclxuICBhd2FpdCBnaXRBZGQoICdwZXJlbm5pYWwnLCAnZGF0YS9waGV0LWlvLWFwaS1zdGFibGUnICk7XHJcblxyXG4gIGNvbnN0IGhhc0NoYW5nZXMgPSAhYXdhaXQgZ2l0SXNDbGVhbiggJ3BlcmVubmlhbCcgKTtcclxuICBpZiAoIGhhc0NoYW5nZXMgKSB7XHJcbiAgICB3aW5zdG9uLmluZm8oICdDaGFuZ2VzIHRvIGRhdGEgZmlsZXMgZGV0ZWN0ZWQsIHdpbGwgcHVzaCcgKTtcclxuICAgIGF3YWl0IGdpdENvbW1pdCggJ3BlcmVubmlhbCcsICdBdXRvbWF0ZWQgdXBkYXRlIG9mIHBlcmVubmlhbCBkYXRhIGZpbGVzJyApO1xyXG4gICAgYXdhaXQgZ2l0UHVzaCggJ3BlcmVubmlhbCcsICdtYXN0ZXInICk7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgd2luc3Rvbi5pbmZvKCAnTm8gY2hhbmdlcyBkZXRlY3RlZCcgKTtcclxuICB9XHJcbn07XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLDBCQUEyQixDQUFDO0FBQzVELE1BQU1DLFNBQVMsR0FBR0QsT0FBTyxDQUFFLHFCQUFzQixDQUFDO0FBQ2xELE1BQU1FLE1BQU0sR0FBR0YsT0FBTyxDQUFFLGtCQUFtQixDQUFDO0FBQzVDLE1BQU1HLFNBQVMsR0FBR0gsT0FBTyxDQUFFLHFCQUFzQixDQUFDO0FBQ2xELE1BQU1JLFVBQVUsR0FBR0osT0FBTyxDQUFFLHNCQUF1QixDQUFDO0FBQ3BELE1BQU1LLE9BQU8sR0FBR0wsT0FBTyxDQUFFLG1CQUFvQixDQUFDO0FBQzlDLE1BQU1NLE1BQU0sR0FBR04sT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUNsQyxNQUFNTyxFQUFFLEdBQUdQLE9BQU8sQ0FBRSxJQUFLLENBQUM7QUFDMUIsTUFBTVEsS0FBSyxHQUFHUixPQUFPLENBQUUsT0FBUSxDQUFDO0FBQ2hDLE1BQU1TLEVBQUUsR0FBR1QsT0FBTyxDQUFFLElBQUssQ0FBQztBQUMxQixNQUFNVSxPQUFPLEdBQUdWLE9BQU8sQ0FBRSxTQUFVLENBQUM7O0FBRXBDO0FBQ0E7QUFDQTtBQUNBO0FBQ0FXLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLGtCQUFpQjtFQUNoQyxJQUFLLE9BQU1YLFNBQVMsQ0FBRSxXQUFZLENBQUMsTUFBSyxRQUFRLElBQUksRUFBQyxNQUFNRyxVQUFVLENBQUUsV0FBWSxDQUFDLEdBQUc7SUFDckZJLEtBQUssQ0FBQ0ssSUFBSSxDQUFDQyxLQUFLLENBQUUscUZBQXNGLENBQUM7RUFDM0c7RUFFQSxNQUFNQyxXQUFXLEdBQUdoQixjQUFjLENBQUMs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