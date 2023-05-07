// Copyright 2021, University of Colorado Boulder

const execute = require('../common/execute');
const _ = require('lodash'); // eslint-disable-line no-unused-vars
const fs = require('fs');

/**
 *
 * Output a formatted view of recent commits to help in writing a report
 *
 * USAGE:
 * cd directory-with-all-repos
 * node perennial/js/scripts/commit-report.js username > report.txt
 *
 * EXAMPLE:
 * node perennial/js/scripts/commit-report.js samreid > report.txt
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
(async () => {
  const args = process.argv.slice(2);
  const username = args[0];
  const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  if (!username) {
    console.log('username must be supplied as first command-line argument');
  } else {
    const outputtedLines = [];

    // current timestamp in milliseconds
    const d = new Date(Date.now());
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();
    console.log(`${username === 'samreid' ? 'Sam Reid - ' : ''}${months[month]} ${day}, ${year}`);
    console.log();
    console.log('Highlights');
    console.log('');
    console.log('Pose Hours: ');

    // Don't use getActiveRepos() since it cannot be run from the root
    const contents = fs.readFileSync('perennial/data/active-repos', 'utf8').trim();
    const repos = contents.split('\n').map(sim => sim.trim());

    // git --no-pager log --all --remotes --since=7.days --author=$1 --pretty=format:"%an %ad %s" --date=relative
    const gitArgs = ['--no-pager', 'log', '--all', '--remotes', '--since=7.days', '--pretty=format:"%an %ad %s"', '--date=relative'];
    const a = repos.map(repo => execute('git', gitArgs, `${repo}`, {
      // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
      errors: 'resolve'
    }));
    const out = await Promise.all(a);

    // Report results
    for (let i = 0; i < a.length; i++) {
      let outputtedRepo = false;
      const repo = repos[i];
      const o = out[i];
      if (o.stderr.trim().length > 0) {
        console.log(o.stderr.trim());
      }
      const stdout = o.stdout.trim();
      if (stdout.length > 0 || o.stderr.trim().length > 0) {
        const lines = stdout.split('\n');
        lines.forEach(line => {
          if (line.startsWith('"') && line.endsWith('"')) {
            line = line.substring(1, line.length - 1);
          }
          if (line.startsWith(username)) {
            line = line.substring(username.length).trim();
            const tokens = line.split(' ');
            const number = Number(tokens[0]);
            const time = tokens[1];
            if (time === 'days' && number <= 7) {
              line = line.substring('n days ago '.length);
            }
            if (time === 'hours' && number <= 9) {
              line = line.substring('n hours ago '.length);
            }
            if (time === 'hours' && number >= 10 && number <= 99) {
              line = line.substring('nn hours ago '.length);
            }
            if (!outputtedLines.find(x => x === line) && !line.startsWith('Merge branch \'master\' of')) {
              if (!outputtedRepo) {
                console.log();
                console.log(repo);
                outputtedRepo = true;
              }
              console.log(line);
              outputtedLines.push(line);
            }
          }
        });
      }
    }
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGVjdXRlIiwicmVxdWlyZSIsIl8iLCJmcyIsImFyZ3MiLCJwcm9jZXNzIiwiYXJndiIsInNsaWNlIiwidXNlcm5hbWUiLCJtb250aHMiLCJjb25zb2xlIiwibG9nIiwib3V0cHV0dGVkTGluZXMiLCJkIiwiRGF0ZSIsIm5vdyIsImRheSIsImdldERhdGUiLCJtb250aCIsImdldE1vbnRoIiwieWVhciIsImdldEZ1bGxZZWFyIiwiY29udGVudHMiLCJyZWFkRmlsZVN5bmMiLCJ0cmltIiwicmVwb3MiLCJzcGxpdCIsIm1hcCIsInNpbSIsImdpdEFyZ3MiLCJhIiwicmVwbyIsImVycm9ycyIsIm91dCIsIlByb21pc2UiLCJhbGwiLCJpIiwibGVuZ3RoIiwib3V0cHV0dGVkUmVwbyIsIm8iLCJzdGRlcnIiLCJzdGRvdXQiLCJsaW5lcyIsImZvckVhY2giLCJsaW5lIiwic3RhcnRzV2l0aCIsImVuZHNXaXRoIiwic3Vic3RyaW5nIiwidG9rZW5zIiwibnVtYmVyIiwiTnVtYmVyIiwidGltZSIsImZpbmQiLCJ4IiwicHVzaCJdLCJzb3VyY2VzIjpbImNvbW1pdC1yZXBvcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuY29uc3QgZXhlY3V0ZSA9IHJlcXVpcmUoICcuLi9jb21tb24vZXhlY3V0ZScgKTtcclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuY29uc3QgZnMgPSByZXF1aXJlKCAnZnMnICk7XHJcblxyXG4vKipcclxuICpcclxuICogT3V0cHV0IGEgZm9ybWF0dGVkIHZpZXcgb2YgcmVjZW50IGNvbW1pdHMgdG8gaGVscCBpbiB3cml0aW5nIGEgcmVwb3J0XHJcbiAqXHJcbiAqIFVTQUdFOlxyXG4gKiBjZCBkaXJlY3Rvcnktd2l0aC1hbGwtcmVwb3NcclxuICogbm9kZSBwZXJlbm5pYWwvanMvc2NyaXB0cy9jb21taXQtcmVwb3J0LmpzIHVzZXJuYW1lID4gcmVwb3J0LnR4dFxyXG4gKlxyXG4gKiBFWEFNUExFOlxyXG4gKiBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL2NvbW1pdC1yZXBvcnQuanMgc2FtcmVpZCA+IHJlcG9ydC50eHRcclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcbiggYXN5bmMgKCkgPT4ge1xyXG4gIGNvbnN0IGFyZ3MgPSBwcm9jZXNzLmFyZ3Yuc2xpY2UoIDIgKTtcclxuICBjb25zdCB1c2VybmFtZSA9IGFyZ3NbIDAgXTtcclxuXHJcbiAgY29uc3QgbW9udGhzID0gWyAnSmFuJywgJ0ZlYicsICdNYXJjaCcsICdBcHJpbCcsICdNYXknLCAnSnVuZScsICdKdWx5JywgJ0F1ZycsICdTZXB0JywgJ09jdCcsICdOb3YnLCAnRGVjJyBdO1xyXG4gIGlmICggIXVzZXJuYW1lICkge1xyXG4gICAgY29uc29sZS5sb2coICd1c2VybmFtZSBtdXN0IGJlIHN1cHBsaWVkIGFzIGZpcnN0IGNvbW1hbmQtbGluZSBhcmd1bWVudCcgKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0dGVkTGluZXMgPSBbXTtcclxuXHJcbiAgICAvLyBjdXJyZW50IHRpbWVzdGFtcCBpbiBtaWxsaXNlY29uZHNcclxuICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSggRGF0ZS5ub3coKSApO1xyXG4gICAgY29uc3QgZGF5ID0gZC5nZXREYXRlKCk7XHJcbiAgICBjb25zdCBtb250aCA9IGQuZ2V0TW9udGgoKTtcclxuICAgIGNvbnN0IHllYXIgPSBkLmdldEZ1bGxZZWFyKCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coIGAke3VzZXJuYW1lID09PSAnc2FtcmVpZCcgPyAnU2FtIFJlaWQgLSAnIDogJyd9JHttb250aHNbIG1vbnRoIF19ICR7ZGF5fSwgJHt5ZWFyfWAgKTtcclxuICAgIGNvbnNvbGUubG9nKCk7XHJcblxyXG4gICAgY29uc29sZS5sb2coICdIaWdobGlnaHRzJyApO1xyXG4gICAgY29uc29sZS5sb2coICcnICk7XHJcbiAgICBjb25zb2xlLmxvZyggJ1Bvc2UgSG91cnM6ICcgKTtcclxuXHJcbiAgICAvLyBEb24ndCB1c2UgZ2V0QWN0aXZlUmVwb3MoKSBzaW5jZSBpdCBjYW5ub3QgYmUgcnVuIGZyb20gdGhlIHJvb3RcclxuICAgIGNvbnN0IGNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKCAncGVyZW5uaWFsL2RhdGEvYWN0aXZlLXJlcG9zJywgJ3V0ZjgnICkudHJpbSgpO1xyXG4gICAgY29uc3QgcmVwb3MgPSBjb250ZW50cy5zcGxpdCggJ1xcbicgKS5tYXAoIHNpbSA9PiBzaW0udHJpbSgpICk7XHJcblxyXG4gICAgLy8gZ2l0IC0tbm8tcGFnZXIgbG9nIC0tYWxsIC0tcmVtb3RlcyAtLXNpbmNlPTcuZGF5cyAtLWF1dGhvcj0kMSAtLXByZXR0eT1mb3JtYXQ6XCIlYW4gJWFkICVzXCIgLS1kYXRlPXJlbGF0aXZlXHJcbiAgICBjb25zdCBnaXRBcmdzID0gWyAnLS1uby1wYWdlcicsICdsb2cnLCAnLS1hbGwnLCAnLS1yZW1vdGVzJywgJy0tc2luY2U9Ny5kYXlzJywgJy0tcHJldHR5PWZvcm1hdDpcIiVhbiAlYWQgJXNcIicsICctLWRhdGU9cmVsYXRpdmUnIF07XHJcblxyXG4gICAgY29uc3QgYSA9IHJlcG9zLm1hcCggcmVwbyA9PiBleGVjdXRlKCAnZ2l0JywgZ2l0QXJncywgYCR7cmVwb31gLCB7XHJcblxyXG4gICAgICAvLyByZXNvbHZlIGVycm9ycyBzbyBQcm9taXNlLmFsbCBkb2Vzbid0IGZhaWwgb24gZmlyc3QgcmVwbyB0aGF0IGNhbm5vdCBwdWxsL3JlYmFzZVxyXG4gICAgICBlcnJvcnM6ICdyZXNvbHZlJ1xyXG4gICAgfSApICk7XHJcbiAgICBjb25zdCBvdXQgPSBhd2FpdCBQcm9taXNlLmFsbCggYSApO1xyXG5cclxuICAgIC8vIFJlcG9ydCByZXN1bHRzXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgbGV0IG91dHB1dHRlZFJlcG8gPSBmYWxzZTtcclxuICAgICAgY29uc3QgcmVwbyA9IHJlcG9zWyBpIF07XHJcbiAgICAgIGNvbnN0IG8gPSBvdXRbIGkgXTtcclxuXHJcbiAgICAgIGlmICggby5zdGRlcnIudHJpbSgpLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coIG8uc3RkZXJyLnRyaW0oKSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBzdGRvdXQgPSBvLnN0ZG91dC50cmltKCk7XHJcbiAgICAgIGlmICggc3Rkb3V0Lmxlbmd0aCA+IDAgfHwgby5zdGRlcnIudHJpbSgpLmxlbmd0aCA+IDAgKSB7XHJcblxyXG5cclxuICAgICAgICBjb25zdCBsaW5lcyA9IHN0ZG91dC5zcGxpdCggJ1xcbicgKTtcclxuICAgICAgICBsaW5lcy5mb3JFYWNoKCBsaW5lID0+IHtcclxuICAgICAgICAgIGlmICggbGluZS5zdGFydHNXaXRoKCAnXCInICkgJiYgbGluZS5lbmRzV2l0aCggJ1wiJyApICkge1xyXG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoIDEsIGxpbmUubGVuZ3RoIC0gMSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggbGluZS5zdGFydHNXaXRoKCB1c2VybmFtZSApICkge1xyXG4gICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoIHVzZXJuYW1lLmxlbmd0aCApLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRva2VucyA9IGxpbmUuc3BsaXQoICcgJyApO1xyXG4gICAgICAgICAgICBjb25zdCBudW1iZXIgPSBOdW1iZXIoIHRva2Vuc1sgMCBdICk7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpbWUgPSB0b2tlbnNbIDEgXTtcclxuXHJcbiAgICAgICAgICAgIGlmICggdGltZSA9PT0gJ2RheXMnICYmIG51bWJlciA8PSA3ICkge1xyXG4gICAgICAgICAgICAgIGxpbmUgPSBsaW5lLnN1YnN0cmluZyggJ24gZGF5cyBhZ28gJy5sZW5ndGggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIHRpbWUgPT09ICdob3VycycgJiYgbnVtYmVyIDw9IDkgKSB7XHJcbiAgICAgICAgICAgICAgbGluZSA9IGxpbmUuc3Vic3RyaW5nKCAnbiBob3VycyBhZ28gJy5sZW5ndGggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIHRpbWUgPT09ICdob3VycycgJiYgbnVtYmVyID49IDEwICYmIG51bWJlciA8PSA5OSApIHtcclxuICAgICAgICAgICAgICBsaW5lID0gbGluZS5zdWJzdHJpbmcoICdubiBob3VycyBhZ28gJy5sZW5ndGggKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCAhb3V0cHV0dGVkTGluZXMuZmluZCggeCA9PiB4ID09PSBsaW5lICkgJiYgIWxpbmUuc3RhcnRzV2l0aCggJ01lcmdlIGJyYW5jaCBcXCdtYXN0ZXJcXCcgb2YnICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgIGlmICggIW91dHB1dHRlZFJlcG8gKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coIHJlcG8gKTtcclxuICAgICAgICAgICAgICAgIG91dHB1dHRlZFJlcG8gPSB0cnVlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyggbGluZSApO1xyXG4gICAgICAgICAgICAgIG91dHB1dHRlZExpbmVzLnB1c2goIGxpbmUgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0gKSgpOyJdLCJtYXBwaW5n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