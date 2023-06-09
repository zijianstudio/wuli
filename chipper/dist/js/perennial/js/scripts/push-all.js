// Copyright 2021, University of Colorado Boulder

const execute = require('../common/execute');
const _ = require('lodash'); // eslint-disable-line no-unused-vars
const fs = require('fs');

// constants
// Don't use getActiveRepos() since it cannot be run from the root
const contents = fs.readFileSync('perennial/data/active-repos', 'utf8').trim();
const repos = contents.split('\n').map(sim => sim.trim());

/**
 * Push all active-repos
 *
 * USAGE:
 * cd ${root containing all repos}
 * node perennial/js/scripts/push-all.js
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
(async () => {
  // const a = repos.map( repo => execute( 'git', 'log --branches --not --remotes --simplify-by-decoration --decorate --oneline'.split(' '), `${repo}`, {
  const promises = repos.map(repo => execute('git', 'log --branches --not --remotes --simplify-by-decoration --decorate --oneline'.split(' '), `${repo}`, {
    // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
    errors: 'resolve'
  }));
  const results = await Promise.all(promises);

  // Find out which repos need to be pushed
  const pushRepos = [];
  for (let i = 0; i < results.length; i++) {
    const repo = repos[i];
    const result = results[i];
    if (result.code === 0 && result.stdout.trim().length === 0 && result.stderr.trim().length === 0) {

      // was up-to-date
    } else {
      // needs to push
      pushRepos.push(repo);
    }
  }
  const pushPromises = pushRepos.map(repo => execute('git', ['push'], `${repo}`, {
    // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
    errors: 'resolve'
  }));
  const pushResults = await Promise.all(pushPromises);

  // Report results
  for (let i = 0; i < pushRepos.length; i++) {
    const repo = pushRepos[i];
    const returnObject = pushResults[i];
    console.log(repo);
    if (returnObject.stdout.trim().length > 0) {
      console.log(returnObject.stdout);
    }
    if (returnObject.stderr.trim().length > 0) {
      console.log(returnObject.stderr);
    }
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsIl8iLCJmcyIsImNvbnRlbnRzIiwicmVhZEZpbGVTeW5jIiwidHJpbSIsInJlcG9zIiwic3BsaXQiLCJtYXAiLCJzaW0iLCJwcm9taXNlcyIsInJlcG8iLCJlcnJvcnMiLCJyZXN1bHRzIiwiUHJvbWlzZSIsImFsbCIsInB1c2hSZXBvcyIsImkiLCJsZW5ndGgiLCJyZXN1bHQiLCJjb2RlIiwic3Rkb3V0Iiwic3RkZXJyIiwicHVzaCIsInB1c2hQcm9taXNlcyIsInB1c2hSZXN1bHRzIiwicmV0dXJuT2JqZWN0IiwiY29uc29sZSIsImxvZyJdLCJzb3VyY2VzIjpbInB1c2gtYWxsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbmNvbnN0IGV4ZWN1dGUgPSByZXF1aXJlKCAnLi4vY29tbW9uL2V4ZWN1dGUnICk7XHJcbmNvbnN0IF8gPSByZXF1aXJlKCAnbG9kYXNoJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbmNvbnN0IGZzID0gcmVxdWlyZSggJ2ZzJyApO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIERvbid0IHVzZSBnZXRBY3RpdmVSZXBvcygpIHNpbmNlIGl0IGNhbm5vdCBiZSBydW4gZnJvbSB0aGUgcm9vdFxyXG5jb25zdCBjb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyggJ3BlcmVubmlhbC9kYXRhL2FjdGl2ZS1yZXBvcycsICd1dGY4JyApLnRyaW0oKTtcclxuY29uc3QgcmVwb3MgPSBjb250ZW50cy5zcGxpdCggJ1xcbicgKS5tYXAoIHNpbSA9PiBzaW0udHJpbSgpICk7XHJcblxyXG4vKipcclxuICogUHVzaCBhbGwgYWN0aXZlLXJlcG9zXHJcbiAqXHJcbiAqIFVTQUdFOlxyXG4gKiBjZCAke3Jvb3QgY29udGFpbmluZyBhbGwgcmVwb3N9XHJcbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvcHVzaC1hbGwuanNcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcbiggYXN5bmMgKCkgPT4ge1xyXG5cclxuICAvLyBjb25zdCBhID0gcmVwb3MubWFwKCByZXBvID0+IGV4ZWN1dGUoICdnaXQnLCAnbG9nIC0tYnJhbmNoZXMgLS1ub3QgLS1yZW1vdGVzIC0tc2ltcGxpZnktYnktZGVjb3JhdGlvbiAtLWRlY29yYXRlIC0tb25lbGluZScuc3BsaXQoJyAnKSwgYCR7cmVwb31gLCB7XHJcbiAgY29uc3QgcHJvbWlzZXMgPSByZXBvcy5tYXAoIHJlcG8gPT4gZXhlY3V0ZSggJ2dpdCcsICdsb2cgLS1icmFuY2hlcyAtLW5vdCAtLXJlbW90ZXMgLS1zaW1wbGlmeS1ieS1kZWNvcmF0aW9uIC0tZGVjb3JhdGUgLS1vbmVsaW5lJy5zcGxpdCggJyAnICksIGAke3JlcG99YCwge1xyXG5cclxuICAgIC8vIHJlc29sdmUgZXJyb3JzIHNvIFByb21pc2UuYWxsIGRvZXNuJ3QgZmFpbCBvbiBmaXJzdCByZXBvIHRoYXQgY2Fubm90IHB1bGwvcmViYXNlXHJcbiAgICBlcnJvcnM6ICdyZXNvbHZlJ1xyXG4gIH0gKSApO1xyXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbCggcHJvbWlzZXMgKTtcclxuXHJcbiAgLy8gRmluZCBvdXQgd2hpY2ggcmVwb3MgbmVlZCB0byBiZSBwdXNoZWRcclxuICBjb25zdCBwdXNoUmVwb3MgPSBbXTtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3QgcmVwbyA9IHJlcG9zWyBpIF07XHJcbiAgICBjb25zdCByZXN1bHQgPSByZXN1bHRzWyBpIF07XHJcblxyXG4gICAgaWYgKCByZXN1bHQuY29kZSA9PT0gMCAmJiByZXN1bHQuc3Rkb3V0LnRyaW0oKS5sZW5ndGggPT09IDAgJiYgcmVzdWx0LnN0ZGVyci50cmltKCkubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgLy8gd2FzIHVwLXRvLWRhdGVcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gbmVlZHMgdG8gcHVzaFxyXG4gICAgICBwdXNoUmVwb3MucHVzaCggcmVwbyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgcHVzaFByb21pc2VzID0gcHVzaFJlcG9zLm1hcCggcmVwbyA9PiBleGVjdXRlKCAnZ2l0JywgWyAncHVzaCcgXSwgYCR7cmVwb31gLCB7XHJcblxyXG4gICAgLy8gcmVzb2x2ZSBlcnJvcnMgc28gUHJvbWlzZS5hbGwgZG9lc24ndCBmYWlsIG9uIGZpcnN0IHJlcG8gdGhhdCBjYW5ub3QgcHVsbC9yZWJhc2VcclxuICAgIGVycm9yczogJ3Jlc29sdmUnXHJcbiAgfSApICk7XHJcbiAgY29uc3QgcHVzaFJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbCggcHVzaFByb21pc2VzICk7XHJcblxyXG4gIC8vIFJlcG9ydCByZXN1bHRzXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgcHVzaFJlcG9zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgY29uc3QgcmVwbyA9IHB1c2hSZXBvc1sgaSBdO1xyXG4gICAgY29uc3QgcmV0dXJuT2JqZWN0ID0gcHVzaFJlc3VsdHNbIGkgXTtcclxuXHJcbiAgICBjb25zb2xlLmxvZyggcmVwbyApO1xyXG4gICAgaWYgKCByZXR1cm5PYmplY3Quc3Rkb3V0LnRyaW0oKS5sZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggcmV0dXJuT2JqZWN0LnN0ZG91dCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCByZXR1cm5PYmplY3Quc3RkZXJyLnRyaW0oKS5sZW5ndGggPiAwICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggcmV0dXJuT2JqZWN0LnN0ZGVyciApO1xyXG4gICAgfVxyXG4gIH1cclxufSApKCk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxN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