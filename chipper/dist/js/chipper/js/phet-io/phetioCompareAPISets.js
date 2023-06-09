// Copyright 2021-2023, University of Colorado Boulder
const fs = require('fs');
const phetioCompareAPIs = require('./phetioCompareAPIs');
const _ = require('lodash');
const jsondiffpatch = require('../../../sherpa/lib/jsondiffpatch-v0.3.11.umd').create({});
const assert = require('assert');

/**
 * Compare two sets of APIs using phetioCompareAPIs.
 *
 * @param {string[]} repos
 * @param {Object} proposedAPIs - map where key=repo, value=proposed API for that repo
 * @param {Object} [options]
 * @returns {boolean} ok
 */
module.exports = async (repos, proposedAPIs, options) => {
  let ok = true;
  options = _.extend({
    delta: false,
    compareBreakingAPIChanges: true
  }, options);
  repos.forEach(repo => {
    const packageObject = JSON.parse(fs.readFileSync(`../${repo}/package.json`, 'utf8'));
    const phetioSection = packageObject.phet['phet-io'] || {};

    // Fails on missing file or parse error.
    const referenceAPI = JSON.parse(fs.readFileSync(`../phet-io-sim-specific/repos/${repo}/${repo}-phet-io-api.json`, 'utf8'));
    const proposedAPI = proposedAPIs[repo];
    const comparisonData = phetioCompareAPIs(referenceAPI, proposedAPI, _, assert, {
      compareBreakingAPIChanges: options.compareBreakingAPIChanges,
      compareDesignedAPIChanges: !!phetioSection.compareDesignedAPIChanges // determined from the package.json flag
    });

    if (comparisonData.breakingProblems.length) {
      ok = false;
      console.log(`${repo} BREAKING PROBLEMS`);
      console.log(comparisonData.breakingProblems.join('\n'));
      console.log('\n');
    }
    if (comparisonData.designedProblems.length) {
      ok = false;
      console.log(`${repo} DESIGN PROBLEMS`);
      console.log(comparisonData.designedProblems.join('\n'));
      console.log('\n');
    }
    if (options.delta) {
      const delta = jsondiffpatch.diff(referenceAPI, proposedAPI);
      if (delta) {
        console.log(JSON.stringify(delta, null, 2));
      }
    }
  });
  return ok;
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJwaGV0aW9Db21wYXJlQVBJcyIsIl8iLCJqc29uZGlmZnBhdGNoIiwiY3JlYXRlIiwiYXNzZXJ0IiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcG9zIiwicHJvcG9zZWRBUElzIiwib3B0aW9ucyIsIm9rIiwiZXh0ZW5kIiwiZGVsdGEiLCJjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzIiwiZm9yRWFjaCIsInJlcG8iLCJwYWNrYWdlT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwicGhldGlvU2VjdGlvbiIsInBoZXQiLCJyZWZlcmVuY2VBUEkiLCJwcm9wb3NlZEFQSSIsImNvbXBhcmlzb25EYXRhIiwiY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcyIsImJyZWFraW5nUHJvYmxlbXMiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiam9pbiIsImRlc2lnbmVkUHJvYmxlbXMiLCJkaWZmIiwic3RyaW5naWZ5Il0sInNvdXJjZXMiOlsicGhldGlvQ29tcGFyZUFQSVNldHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5jb25zdCBwaGV0aW9Db21wYXJlQVBJcyA9IHJlcXVpcmUoICcuL3BoZXRpb0NvbXBhcmVBUElzJyApO1xyXG5jb25zdCBfID0gcmVxdWlyZSggJ2xvZGFzaCcgKTtcclxuY29uc3QganNvbmRpZmZwYXRjaCA9IHJlcXVpcmUoICcuLi8uLi8uLi9zaGVycGEvbGliL2pzb25kaWZmcGF0Y2gtdjAuMy4xMS51bWQnICkuY3JlYXRlKCB7fSApO1xyXG5jb25zdCBhc3NlcnQgPSByZXF1aXJlKCAnYXNzZXJ0JyApO1xyXG5cclxuLyoqXHJcbiAqIENvbXBhcmUgdHdvIHNldHMgb2YgQVBJcyB1c2luZyBwaGV0aW9Db21wYXJlQVBJcy5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmdbXX0gcmVwb3NcclxuICogQHBhcmFtIHtPYmplY3R9IHByb3Bvc2VkQVBJcyAtIG1hcCB3aGVyZSBrZXk9cmVwbywgdmFsdWU9cHJvcG9zZWQgQVBJIGZvciB0aGF0IHJlcG9cclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gb2tcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgKCByZXBvcywgcHJvcG9zZWRBUElzLCBvcHRpb25zICkgPT4ge1xyXG4gIGxldCBvayA9IHRydWU7XHJcbiAgb3B0aW9ucyA9IF8uZXh0ZW5kKCB7XHJcbiAgICBkZWx0YTogZmFsc2UsXHJcbiAgICBjb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzOiB0cnVlXHJcbiAgfSwgb3B0aW9ucyApO1xyXG5cclxuICByZXBvcy5mb3JFYWNoKCByZXBvID0+IHtcclxuXHJcbiAgICBjb25zdCBwYWNrYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vJHtyZXBvfS9wYWNrYWdlLmpzb25gLCAndXRmOCcgKSApO1xyXG4gICAgY29uc3QgcGhldGlvU2VjdGlvbiA9IHBhY2thZ2VPYmplY3QucGhldFsgJ3BoZXQtaW8nIF0gfHwge307XHJcblxyXG4gICAgLy8gRmFpbHMgb24gbWlzc2luZyBmaWxlIG9yIHBhcnNlIGVycm9yLlxyXG4gICAgY29uc3QgcmVmZXJlbmNlQVBJID0gSlNPTi5wYXJzZSggZnMucmVhZEZpbGVTeW5jKCBgLi4vcGhldC1pby1zaW0tc3BlY2lmaWMvcmVwb3MvJHtyZXBvfS8ke3JlcG99LXBoZXQtaW8tYXBpLmpzb25gLCAndXRmOCcgKSApO1xyXG4gICAgY29uc3QgcHJvcG9zZWRBUEkgPSBwcm9wb3NlZEFQSXNbIHJlcG8gXTtcclxuXHJcbiAgICBjb25zdCBjb21wYXJpc29uRGF0YSA9IHBoZXRpb0NvbXBhcmVBUElzKCByZWZlcmVuY2VBUEksIHByb3Bvc2VkQVBJLCBfLCBhc3NlcnQsIHtcclxuICAgICAgY29tcGFyZUJyZWFraW5nQVBJQ2hhbmdlczogb3B0aW9ucy5jb21wYXJlQnJlYWtpbmdBUElDaGFuZ2VzLFxyXG4gICAgICBjb21wYXJlRGVzaWduZWRBUElDaGFuZ2VzOiAhIXBoZXRpb1NlY3Rpb24uY29tcGFyZURlc2lnbmVkQVBJQ2hhbmdlcyAvLyBkZXRlcm1pbmVkIGZyb20gdGhlIHBhY2thZ2UuanNvbiBmbGFnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBjb21wYXJpc29uRGF0YS5icmVha2luZ1Byb2JsZW1zLmxlbmd0aCApIHtcclxuICAgICAgb2sgPSBmYWxzZTtcclxuICAgICAgY29uc29sZS5sb2coIGAke3JlcG99IEJSRUFLSU5HIFBST0JMRU1TYCApO1xyXG4gICAgICBjb25zb2xlLmxvZyggY29tcGFyaXNvbkRhdGEuYnJlYWtpbmdQcm9ibGVtcy5qb2luKCAnXFxuJyApICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCAnXFxuJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggY29tcGFyaXNvbkRhdGEuZGVzaWduZWRQcm9ibGVtcy5sZW5ndGggKSB7XHJcbiAgICAgIG9rID0gZmFsc2U7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBgJHtyZXBvfSBERVNJR04gUFJPQkxFTVNgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBjb21wYXJpc29uRGF0YS5kZXNpZ25lZFByb2JsZW1zLmpvaW4oICdcXG4nICkgKTtcclxuICAgICAgY29uc29sZS5sb2coICdcXG4nICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmRlbHRhICkge1xyXG4gICAgICBjb25zdCBkZWx0YSA9IGpzb25kaWZmcGF0Y2guZGlmZiggcmVmZXJlbmNlQVBJLCBwcm9wb3NlZEFQSSApO1xyXG4gICAgICBpZiAoIGRlbHRhICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBKU09OLnN0cmluZ2lmeSggZGVsdGEsIG51bGwsIDIgKSApO1xyXG4gICAgICB9XHJcbiAg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