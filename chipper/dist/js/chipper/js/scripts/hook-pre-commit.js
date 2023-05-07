// Copyright 2022-2023, University of Colorado Boulder

/**
 * Runs tasks for pre-commit, including lint and qunit testing.  Avoids the overhead of grunt and Gruntfile.js for speed.
 *
 * Should only be run when developing in master, because when dependency shas are checked out for one sim,
 * they will likely be inconsistent for other repos which would cause failures for processes like type checking.
 * This means when running maintenance release steps, you may need to run git commands with --no-verify.
 *
 * Timing data is streamed through phetTimingLog, please see that file for how to see the results live and/or afterwards.
 *
 * USAGE:
 * cd ${repo}
 * node ../chipper/js/scripts/hook-pre-commit.js
 *
 * OPTIONS:
 * --console: outputs information to the console for debugging
 *
 * See also phet-info/git-template-dir/hooks/pre-commit for how this is used in precommit hooks.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

const path = require('path');
const execute = require('../../../perennial-alias/js/common/execute');
const phetTimingLog = require('../../../perennial-alias/js/common/phetTimingLog');
(async () => {
  // Identify the current repo
  const repo = process.cwd().split(path.sep).pop();
  const precommitSuccess = await phetTimingLog.startAsync(`hook-pre-commit repo="${repo}"`, async () => {
    // Console logging via --console
    const commandLineArguments = process.argv.slice(2);
    const outputToConsole = commandLineArguments.includes('--console');
    const promises = ['lint', 'report-media', 'tsc', 'qunit', 'phet-io-api-compare'].map(task => {
      return phetTimingLog.startAsync(task, async () => {
        const results = await execute('node', ['../chipper/js/scripts/hook-pre-commit-task.js', `--command=${task}`, `--repo=${repo}`, outputToConsole ? '--console' : ''], '../chipper', {
          errors: 'resolve'
        });
        results.stdout && results.stdout.trim().length > 0 && console.log(results.stdout);
        results.stderr && results.stderr.trim().length > 0 && console.log(results.stderr);
        if (results.code === 0) {
          return 0;
        } else {
          let message = 'Task failed: ' + task;
          if (results.stdout && results.stdout.trim().length > 0) {
            message = message + ', ' + results.stdout;
          }
          if (results.stderr && results.stderr.trim().length > 0) {
            message = message + ', ' + results.stderr;
          }
          throw new Error(message);
        }
      }, {
        depth: 1
      });
    });
    try {
      await Promise.all(promises);
      console.log('All tasks succeeded');
      return true;
    } catch (e) {
      // Exit as soon as any one promise fails
      // Each task is responsible for outputting its error to the console, so the console should already
      // be showing the error by now
      return false;
    }
  });

  // generatePhetioMacroAPI is preventing exit for unknown reasons, so manually exit here
  phetTimingLog.close(() => process.exit(precommitSuccess ? 0 : 1));
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYXRoIiwicmVxdWlyZSIsImV4ZWN1dGUiLCJwaGV0VGltaW5nTG9nIiwicmVwbyIsInByb2Nlc3MiLCJjd2QiLCJzcGxpdCIsInNlcCIsInBvcCIsInByZWNvbW1pdFN1Y2Nlc3MiLCJzdGFydEFzeW5jIiwiY29tbWFuZExpbmVBcmd1bWVudHMiLCJhcmd2Iiwic2xpY2UiLCJvdXRwdXRUb0NvbnNvbGUiLCJpbmNsdWRlcyIsInByb21pc2VzIiwibWFwIiwidGFzayIsInJlc3VsdHMiLCJlcnJvcnMiLCJzdGRvdXQiLCJ0cmltIiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsInN0ZGVyciIsImNvZGUiLCJtZXNzYWdlIiwiRXJyb3IiLCJkZXB0aCIsIlByb21pc2UiLCJhbGwiLCJlIiwiY2xvc2UiLCJleGl0Il0sInNvdXJjZXMiOlsiaG9vay1wcmUtY29tbWl0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJ1bnMgdGFza3MgZm9yIHByZS1jb21taXQsIGluY2x1ZGluZyBsaW50IGFuZCBxdW5pdCB0ZXN0aW5nLiAgQXZvaWRzIHRoZSBvdmVyaGVhZCBvZiBncnVudCBhbmQgR3J1bnRmaWxlLmpzIGZvciBzcGVlZC5cclxuICpcclxuICogU2hvdWxkIG9ubHkgYmUgcnVuIHdoZW4gZGV2ZWxvcGluZyBpbiBtYXN0ZXIsIGJlY2F1c2Ugd2hlbiBkZXBlbmRlbmN5IHNoYXMgYXJlIGNoZWNrZWQgb3V0IGZvciBvbmUgc2ltLFxyXG4gKiB0aGV5IHdpbGwgbGlrZWx5IGJlIGluY29uc2lzdGVudCBmb3Igb3RoZXIgcmVwb3Mgd2hpY2ggd291bGQgY2F1c2UgZmFpbHVyZXMgZm9yIHByb2Nlc3NlcyBsaWtlIHR5cGUgY2hlY2tpbmcuXHJcbiAqIFRoaXMgbWVhbnMgd2hlbiBydW5uaW5nIG1haW50ZW5hbmNlIHJlbGVhc2Ugc3RlcHMsIHlvdSBtYXkgbmVlZCB0byBydW4gZ2l0IGNvbW1hbmRzIHdpdGggLS1uby12ZXJpZnkuXHJcbiAqXHJcbiAqIFRpbWluZyBkYXRhIGlzIHN0cmVhbWVkIHRocm91Z2ggcGhldFRpbWluZ0xvZywgcGxlYXNlIHNlZSB0aGF0IGZpbGUgZm9yIGhvdyB0byBzZWUgdGhlIHJlc3VsdHMgbGl2ZSBhbmQvb3IgYWZ0ZXJ3YXJkcy5cclxuICpcclxuICogVVNBR0U6XHJcbiAqIGNkICR7cmVwb31cclxuICogbm9kZSAuLi9jaGlwcGVyL2pzL3NjcmlwdHMvaG9vay1wcmUtY29tbWl0LmpzXHJcbiAqXHJcbiAqIE9QVElPTlM6XHJcbiAqIC0tY29uc29sZTogb3V0cHV0cyBpbmZvcm1hdGlvbiB0byB0aGUgY29uc29sZSBmb3IgZGVidWdnaW5nXHJcbiAqXHJcbiAqIFNlZSBhbHNvIHBoZXQtaW5mby9naXQtdGVtcGxhdGUtZGlyL2hvb2tzL3ByZS1jb21taXQgZm9yIGhvdyB0aGlzIGlzIHVzZWQgaW4gcHJlY29tbWl0IGhvb2tzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmNvbnN0IHBhdGggPSByZXF1aXJlKCAncGF0aCcgKTtcclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwtYWxpYXMvanMvY29tbW9uL2V4ZWN1dGUnICk7XHJcbmNvbnN0IHBoZXRUaW1pbmdMb2cgPSByZXF1aXJlKCAnLi4vLi4vLi4vcGVyZW5uaWFsLWFsaWFzL2pzL2NvbW1vbi9waGV0VGltaW5nTG9nJyApO1xyXG5cclxuKCBhc3luYyAoKSA9PiB7XHJcblxyXG4gIC8vIElkZW50aWZ5IHRoZSBjdXJyZW50IHJlcG9cclxuICBjb25zdCByZXBvID0gcHJvY2Vzcy5jd2QoKS5zcGxpdCggcGF0aC5zZXAgKS5wb3AoKTtcclxuXHJcbiAgY29uc3QgcHJlY29tbWl0U3VjY2VzcyA9IGF3YWl0IHBoZXRUaW1pbmdMb2cuc3RhcnRBc3luYyggYGhvb2stcHJlLWNvbW1pdCByZXBvPVwiJHtyZXBvfVwiYCwgYXN5bmMgKCkgPT4ge1xyXG5cclxuICAgIC8vIENvbnNvbGUgbG9nZ2luZyB2aWEgLS1jb25zb2xlXHJcbiAgICBjb25zdCBjb21tYW5kTGluZUFyZ3VtZW50cyA9IHByb2Nlc3MuYXJndi5zbGljZSggMiApO1xyXG4gICAgY29uc3Qgb3V0cHV0VG9Db25zb2xlID0gY29tbWFuZExpbmVBcmd1bWVudHMuaW5jbHVkZXMoICctLWNvbnNvbGUnICk7XHJcblxyXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbICdsaW50JywgJ3JlcG9ydC1tZWRpYScsICd0c2MnLCAncXVuaXQnLCAncGhldC1pby1hcGktY29tcGFyZScgXS5tYXAoIHRhc2sgPT4ge1xyXG4gICAgICByZXR1cm4gcGhldFRpbWluZ0xvZy5zdGFydEFzeW5jKCB0YXNrLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IGV4ZWN1dGUoICdub2RlJywgW1xyXG4gICAgICAgICAgJy4uL2NoaXBwZXIvanMvc2NyaXB0cy9ob29rLXByZS1jb21taXQtdGFzay5qcycsXHJcbiAgICAgICAgICBgLS1jb21tYW5kPSR7dGFza31gLFxyXG4gICAgICAgICAgYC0tcmVwbz0ke3JlcG99YCxcclxuICAgICAgICAgIG91dHB1dFRvQ29uc29sZSA/ICctLWNvbnNvbGUnIDogJycgXSwgJy4uL2NoaXBwZXInLCB7XHJcbiAgICAgICAgICBlcnJvcnM6ICdyZXNvbHZlJ1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICByZXN1bHRzLnN0ZG91dCAmJiByZXN1bHRzLnN0ZG91dC50cmltKCkubGVuZ3RoID4gMCAmJiBjb25zb2xlLmxvZyggcmVzdWx0cy5zdGRvdXQgKTtcclxuICAgICAgICByZXN1bHRzLnN0ZGVyciAmJiByZXN1bHRzLnN0ZGVyci50cmltKCkubGVuZ3RoID4gMCAmJiBjb25zb2xlLmxvZyggcmVzdWx0cy5zdGRlcnIgKTtcclxuXHJcbiAgICAgICAgaWYgKCByZXN1bHRzLmNvZGUgPT09IDAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBsZXQgbWVzc2FnZSA9ICdUYXNrIGZhaWxlZDogJyArIHRhc2s7XHJcbiAgICAgICAgICBpZiAoIHJlc3VsdHMuc3Rkb3V0ICYmIHJlc3VsdHMuc3Rkb3V0LnRyaW0oKS5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSArICcsICcgKyByZXN1bHRzLnN0ZG91dDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggcmVzdWx0cy5zdGRlcnIgJiYgcmVzdWx0cy5zdGRlcnIudHJpbSgpLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBtZXNzYWdlICsgJywgJyArIHJlc3VsdHMuc3RkZXJyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCBtZXNzYWdlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgZGVwdGg6IDFcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKCBwcm9taXNlcyApO1xyXG4gICAgICBjb25zb2xlLmxvZyggJ0FsbCB0YXNrcyBzdWNjZWVkZWQnICk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2F0Y2goIGUgKSB7XHJcblxyXG4gICAgICAvLyBFeGl0IGFzIHNvb24gYXMgYW55IG9uZSBwcm9taXNlIGZhaWxzXHJcbiAgICAgIC8vIEVhY2ggdGFzayBpcyByZXNwb25zaWJsZSBmb3Igb3V0cHV0dGluZyBpdHMgZXJyb3IgdG8gdGhlIGNvbnNvbGUsIHNvIHRoZSBjb25zb2xlIHNob3VsZCBhbHJlYWR5XHJcbiAgICAgIC8vIGJlIHNob3dpbmcgdGhlIGVycm9yIGJ5IG5vd1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICAvLyBnZW5lcmF0ZVBoZXRpb01hY3JvQVBJIGlzIHByZXZlbnRpbmcgZXhpdCBmb3IgdW5rbm93biByZWFzb25zLCBzbyBtYW51YWxseSBleGl0IGhlcmVcclxuICBwaGV0VGltaW5nTG9nLmNsb3NlKCAoKSA9PiBwcm9jZXNzLmV4aXQoIHByZWNvbW1pdFN1Y2Nlc3MgPyAwIDogMSApICk7XHJcbn0gKSgpOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxJQUFJLEdBQUdDLE9BQU8sQ0FBRSxNQUFPLENBQUM7QUFDOUIsTUFBTUMsT0FBTyxHQUFHRCxPQUFPLENBQUUsNENBQTZDLENBQUM7QUFDdkUsTUFBTUUsYUFBYSxHQUFHRixPQUFPLENBQUUsa0RBQW1ELENBQUM7QUFFbkYsQ0FBRSxZQUFZO0VBRVo7RUFDQSxNQUFNRyxJQUFJLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFUCxJQUFJLENBQUNRLEdBQUksQ0FBQyxDQUFDQyxHQUFHLENBQUMsQ0FBQztFQUVsRCxNQUFNQyxnQkFBZ0IsR0FBRyxNQUFNUCxhQUFhLENBQUNRLFVBQVUsQ0FBRyx5QkFBd0JQLElBQUssR0FBRSxFQUFFLFlBQVk7SUFFckc7SUFDQSxNQUFNUSxvQkFBb0IsR0FBR1AsT0FBTyxDQUFDUSxJQUFJLENBQUNDLEtBQUssQ0FBRSxDQUFFLENBQUM7SUFDcEQsTUFBTUMsZUFBZSxHQUFHSCxvQkFBb0IsQ0FBQ0ksUUFBUSxDQUFFLFdBQVksQ0FBQztJQUVwRSxNQUFNQyxRQUFRLEdBQUcsQ0FBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUscUJBQXFCLENBQUUsQ0FBQ0MsR0FBRyxDQUFFQyxJQUFJLElBQUk7TUFDOUYsT0FBT2hCLGFBQWEsQ0FBQ1EsVUFBVSxDQUFFUSxJQUFJLEVBQUUsWUFBWTtRQUNqRCxNQUFNQyxPQUFPLEdBQUcsTUFBTWxCLE9BQU8sQ0FBRSxNQUFNLEVBQUUsQ0FDckMsK0NBQStDLEVBQzlDLGFBQVlpQixJQUFLLEVBQUMsRUFDbEIsVUFBU2YsSUFBSyxFQUFDLEVBQ2hCVyxlQUFlLEdBQUcsV0FBVyxHQUFHLEVBQUUsQ0FBRSxFQUFFLFlBQVksRUFBRTtVQUNwRE0sTUFBTSxFQUFFO1FBQ1YsQ0FBRSxDQUFDO1FBQ0hELE9BQU8sQ0FBQ0UsTUFBTSxJQUFJRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQ0MsTUFBTSxHQUFHLENBQUMsSUFBSUMsT0FBTyxDQUFDQyxHQUFHLENBQUVOLE9BQU8sQ0FBQ0UsTUFBTyxDQUFDO1FBQ25GRixPQUFPLENBQUNPLE1BQU0sSUFBSVAsT0FBTyxDQUFDTyxNQUFNLENBQUNKLElBQUksQ0FBQyxDQUFDLENBQUNDLE1BQU0sR0FBRyxDQUFDLElBQUlDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFTixPQUFPLENBQUNPLE1BQU8sQ0FBQztRQUVuRixJQUFLUCxPQUFPLENBQUNRLElBQUksS0FBSyxDQUFDLEVBQUc7VUFDeEIsT0FBTyxDQUFDO1FBQ1YsQ0FBQyxNQUNJO1VBQ0gsSUFBSUMsT0FBTyxHQUFHLGVBQWUsR0FBR1YsSUFBSTtVQUNwQyxJQUFLQyxPQUFPLENBQUNFLE1BQU0sSUFBSUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLElBQUksQ0FBQyxDQUFDLENBQUNDLE1BQU0sR0FBRyxDQUFDLEVBQUc7WUFDeERLLE9BQU8sR0FBR0EsT0FBTyxHQUFHLElBQUksR0FBR1QsT0FBTyxDQUFDRSxNQUFNO1VBQzNDO1VBQ0EsSUFBS0YsT0FBTyxDQUFDTyxNQUFNLElBQUlQLE9BQU8sQ0FBQ08sTUFBTSxDQUFDSixJQUFJLENBQUMsQ0FBQyxDQUFDQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO1lBQ3hESyxPQUFPLEdBQUdBLE9BQU8sR0FBRyxJQUFJLEdBQUdULE9BQU8sQ0FBQ08sTUFBTTtVQUMzQztVQUNBLE1BQU0sSUFBSUcsS0FBSyxDQUFFRCxPQUFRLENBQUM7UUFDNUI7TUFDRixDQUFDLEVBQUU7UUFDREUsS0FBSyxFQUFFO01BQ1QsQ0FBRSxDQUFDO0lBQ0wsQ0FBRSxDQUFDO0lBRUgsSUFBSTtNQUNGLE1BQU1DLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFaEIsUUFBUyxDQUFDO01BQzdCUSxPQUFPLENBQUNDLEdBQUcsQ0FBRSxxQkFBc0IsQ0FBQztNQUNwQyxPQUFPLElBQUk7SUFDYixDQUFDLENBQ0QsT0FBT1EsQ0FBQyxFQUFHO01BRVQ7TUFDQTtNQUNBO01BQ0EsT0FBTyxLQUFLO0lBQ2Q7RUFDRixDQUFFLENBQUM7O0VBRUg7RUFDQS9CLGFBQWEsQ0FBQ2dDLEtBQUssQ0FBRSxNQUFNOUIsT0FBTyxDQUFDK0IsSUFBSSxDQUFFMUIsZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBRSxDQUFDO0FBQ3ZFLENBQUMsRUFBRyxDQUFDIn0=