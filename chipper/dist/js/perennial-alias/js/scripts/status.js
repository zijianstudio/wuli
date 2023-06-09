// Copyright 2021, University of Colorado Boulder

/**
 * Checks status for repos, and prints it out to the console
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const getActiveRepos = require('../common/getActiveRepos');
const gitStatus = require('../common/gitStatus');
const winston = require('winston');
winston.default.transports.console.level = 'error';

// ANSI escape sequences to move to the right (in the same line) or to apply or reset colors
const moveRight = '\u001b[42G';
const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';
const repos = getActiveRepos();
const data = {};
const getStatus = async repo => {
  data[repo] = '';
  const status = await gitStatus(repo);
  let isGreen = false;
  if (status.branch) {
    isGreen = !status.status && status.branch === 'master' && status.ahead === 0;
    if (!isGreen || process.argv.includes('--all')) {
      data[repo] += `${repo}${moveRight}${isGreen ? green : red}${status.branch}${reset}${status.ahead === 0 ? '' : ` ahead ${status.ahead}`}${status.behind === 0 ? '' : ` behind ${status.behind}`}\n`;
    }
  } else {
    // if no branch, print our SHA (detached head)
    data[repo] += `${repo}${moveRight}${red}${status.sha}${reset}\n`;
  }
  if (status.status) {
    if (!isGreen || process.argv.includes('--all')) {
      data[repo] += status.status + '\n';
    }
  }
};
(async () => {
  await Promise.all(repos.map(repo => getStatus(repo)));
  repos.forEach(repo => {
    process.stdout.write(data[repo]);
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRBY3RpdmVSZXBvcyIsInJlcXVpcmUiLCJnaXRTdGF0dXMiLCJ3aW5zdG9uIiwiZGVmYXVsdCIsInRyYW5zcG9ydHMiLCJjb25zb2xlIiwibGV2ZWwiLCJtb3ZlUmlnaHQiLCJyZWQiLCJncmVlbiIsInJlc2V0IiwicmVwb3MiLCJkYXRhIiwiZ2V0U3RhdHVzIiwicmVwbyIsInN0YXR1cyIsImlzR3JlZW4iLCJicmFuY2giLCJhaGVhZCIsInByb2Nlc3MiLCJhcmd2IiwiaW5jbHVkZXMiLCJiZWhpbmQiLCJzaGEiLCJQcm9taXNlIiwiYWxsIiwibWFwIiwiZm9yRWFjaCIsInN0ZG91dCIsIndyaXRlIl0sInNvdXJjZXMiOlsic3RhdHVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDaGVja3Mgc3RhdHVzIGZvciByZXBvcywgYW5kIHByaW50cyBpdCBvdXQgdG8gdGhlIGNvbnNvbGVcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmNvbnN0IGdldEFjdGl2ZVJlcG9zID0gcmVxdWlyZSggJy4uL2NvbW1vbi9nZXRBY3RpdmVSZXBvcycgKTtcclxuY29uc3QgZ2l0U3RhdHVzID0gcmVxdWlyZSggJy4uL2NvbW1vbi9naXRTdGF0dXMnICk7XHJcbmNvbnN0IHdpbnN0b24gPSByZXF1aXJlKCAnd2luc3RvbicgKTtcclxuXHJcbndpbnN0b24uZGVmYXVsdC50cmFuc3BvcnRzLmNvbnNvbGUubGV2ZWwgPSAnZXJyb3InO1xyXG5cclxuLy8gQU5TSSBlc2NhcGUgc2VxdWVuY2VzIHRvIG1vdmUgdG8gdGhlIHJpZ2h0IChpbiB0aGUgc2FtZSBsaW5lKSBvciB0byBhcHBseSBvciByZXNldCBjb2xvcnNcclxuY29uc3QgbW92ZVJpZ2h0ID0gJ1xcdTAwMWJbNDJHJztcclxuY29uc3QgcmVkID0gJ1xcdTAwMWJbMzFtJztcclxuY29uc3QgZ3JlZW4gPSAnXFx1MDAxYlszMm0nO1xyXG5jb25zdCByZXNldCA9ICdcXHUwMDFiWzBtJztcclxuXHJcbmNvbnN0IHJlcG9zID0gZ2V0QWN0aXZlUmVwb3MoKTtcclxuY29uc3QgZGF0YSA9IHt9O1xyXG5cclxuY29uc3QgZ2V0U3RhdHVzID0gYXN5bmMgcmVwbyA9PiB7XHJcbiAgZGF0YVsgcmVwbyBdID0gJyc7XHJcblxyXG4gIGNvbnN0IHN0YXR1cyA9IGF3YWl0IGdpdFN0YXR1cyggcmVwbyApO1xyXG5cclxuICBsZXQgaXNHcmVlbiA9IGZhbHNlO1xyXG4gIGlmICggc3RhdHVzLmJyYW5jaCApIHtcclxuICAgIGlzR3JlZW4gPSAhc3RhdHVzLnN0YXR1cyAmJiBzdGF0dXMuYnJhbmNoID09PSAnbWFzdGVyJyAmJiBzdGF0dXMuYWhlYWQgPT09IDA7XHJcblxyXG4gICAgaWYgKCAhaXNHcmVlbiB8fCBwcm9jZXNzLmFyZ3YuaW5jbHVkZXMoICctLWFsbCcgKSApIHtcclxuICAgICAgZGF0YVsgcmVwbyBdICs9IGAke3JlcG99JHttb3ZlUmlnaHR9JHtpc0dyZWVuID8gZ3JlZW4gOiByZWR9JHtzdGF0dXMuYnJhbmNofSR7cmVzZXR9JHtzdGF0dXMuYWhlYWQgPT09IDAgPyAnJyA6IGAgYWhlYWQgJHtzdGF0dXMuYWhlYWR9YH0ke3N0YXR1cy5iZWhpbmQgPT09IDAgPyAnJyA6IGAgYmVoaW5kICR7c3RhdHVzLmJlaGluZH1gfVxcbmA7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgLy8gaWYgbm8gYnJhbmNoLCBwcmludCBvdXIgU0hBIChkZXRhY2hlZCBoZWFkKVxyXG4gICAgZGF0YVsgcmVwbyBdICs9IGAke3JlcG99JHttb3ZlUmlnaHR9JHtyZWR9JHtzdGF0dXMuc2hhfSR7cmVzZXR9XFxuYDtcclxuICB9XHJcblxyXG4gIGlmICggc3RhdHVzLnN0YXR1cyApIHtcclxuICAgIGlmICggIWlzR3JlZW4gfHwgcHJvY2Vzcy5hcmd2LmluY2x1ZGVzKCAnLS1hbGwnICkgKSB7XHJcbiAgICAgIGRhdGFbIHJlcG8gXSArPSBzdGF0dXMuc3RhdHVzICsgJ1xcbic7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuKCBhc3luYyAoKSA9PiB7XHJcbiAgYXdhaXQgUHJvbWlzZS5hbGwoIHJlcG9zLm1hcCggcmVwbyA9PiBnZXRTdGF0dXMoIHJlcG8gKSApICk7XHJcbiAgcmVwb3MuZm9yRWFjaCggcmVwbyA9PiB7XHJcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSggZGF0YVsgcmVwbyBdICk7XHJcbiAgfSApO1xyXG59ICkoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBR0MsT0FBTyxDQUFFLDBCQUEyQixDQUFDO0FBQzVELE1BQU1DLFNBQVMsR0FBR0QsT0FBTyxDQUFFLHFCQUFzQixDQUFDO0FBQ2xELE1BQU1FLE9BQU8sR0FBR0YsT0FBTyxDQUFFLFNBQVUsQ0FBQztBQUVwQ0UsT0FBTyxDQUFDQyxPQUFPLENBQUNDLFVBQVUsQ0FBQ0MsT0FBTyxDQUFDQyxLQUFLLEdBQUcsT0FBTzs7QUFFbEQ7QUFDQSxNQUFNQyxTQUFTLEdBQUcsWUFBWTtBQUM5QixNQUFNQyxHQUFHLEdBQUcsWUFBWTtBQUN4QixNQUFNQyxLQUFLLEdBQUcsWUFBWTtBQUMxQixNQUFNQyxLQUFLLEdBQUcsV0FBVztBQUV6QixNQUFNQyxLQUFLLEdBQUdaLGNBQWMsQ0FBQyxDQUFDO0FBQzlCLE1BQU1hLElBQUksR0FBRyxDQUFDLENBQUM7QUFFZixNQUFNQyxTQUFTLEdBQUcsTUFBTUMsSUFBSSxJQUFJO0VBQzlCRixJQUFJLENBQUVFLElBQUksQ0FBRSxHQUFHLEVBQUU7RUFFakIsTUFBTUMsTUFBTSxHQUFHLE1BQU1kLFNBQVMsQ0FBRWEsSUFBSyxDQUFDO0VBRXRDLElBQUlFLE9BQU8sR0FBRyxLQUFLO0VBQ25CLElBQUtELE1BQU0sQ0FBQ0UsTUFBTSxFQUFHO0lBQ25CRCxPQUFPLEdBQUcsQ0FBQ0QsTUFBTSxDQUFDQSxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsTUFBTSxLQUFLLFFBQVEsSUFBSUYsTUFBTSxDQUFDRyxLQUFLLEtBQUssQ0FBQztJQUU1RSxJQUFLLENBQUNGLE9BQU8sSUFBSUcsT0FBTyxDQUFDQyxJQUFJLENBQUNDLFFBQVEsQ0FBRSxPQUFRLENBQUMsRUFBRztNQUNsRFQsSUFBSSxDQUFFRSxJQUFJLENBQUUsSUFBSyxHQUFFQSxJQUFLLEdBQUVQLFNBQVUsR0FBRVMsT0FBTyxHQUFHUCxLQUFLLEdBQUdELEdBQUksR0FBRU8sTUFBTSxDQUFDRSxNQUFPLEdBQUVQLEtBQU0sR0FBRUssTUFBTSxDQUFDRyxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBSSxVQUFTSCxNQUFNLENBQUNHLEtBQU0sRUFBRSxHQUFFSCxNQUFNLENBQUNPLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFJLFdBQVVQLE1BQU0sQ0FBQ08sTUFBTyxFQUFFLElBQUc7SUFDdE07RUFDRixDQUFDLE1BQ0k7SUFDSDtJQUNBVixJQUFJLENBQUVFLElBQUksQ0FBRSxJQUFLLEdBQUVBLElBQUssR0FBRVAsU0FBVSxHQUFFQyxHQUFJLEdBQUVPLE1BQU0sQ0FBQ1EsR0FBSSxHQUFFYixLQUFNLElBQUc7RUFDcEU7RUFFQSxJQUFLSyxNQUFNLENBQUNBLE1BQU0sRUFBRztJQUNuQixJQUFLLENBQUNDLE9BQU8sSUFBSUcsT0FBTyxDQUFDQyxJQUFJLENBQUNDLFFBQVEsQ0FBRSxPQUFRLENBQUMsRUFBRztNQUNsRFQsSUFBSSxDQUFFRSxJQUFJLENBQUUsSUFBSUMsTUFBTSxDQUFDQSxNQUFNLEdBQUcsSUFBSTtJQUN0QztFQUNGO0FBQ0YsQ0FBQztBQUVELENBQUUsWUFBWTtFQUNaLE1BQU1TLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFZCxLQUFLLENBQUNlLEdBQUcsQ0FBRVosSUFBSSxJQUFJRCxTQUFTLENBQUVDLElBQUssQ0FBRSxDQUFFLENBQUM7RUFDM0RILEtBQUssQ0FBQ2dCLE9BQU8sQ0FBRWIsSUFBSSxJQUFJO0lBQ3JCSyxPQUFPLENBQUNTLE1BQU0sQ0FBQ0MsS0FBSyxDQUFFakIsSUFBSSxDQUFFRSxJQUFJLENBQUcsQ0FBQztFQUN0QyxDQUFFLENBQUM7QUFDTCxDQUFDLEVBQUcsQ0FBQyJ9