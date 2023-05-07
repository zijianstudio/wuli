// Copyright 2023, University of Colorado Boulder

const protectGithubBranches = require('../common/protectGithubBranches');

/**
 * Remove branch protection rules for the provided repo so that master, main, and release CAN be modified.
 * It is faster to just remove branch protections from the github UI, but this is helpful for automation.
 * For example, you can use this if the automated maintenance release process needs to force push to
 * production branches.
 *
 * USAGE:
 * node perennial/js/scripts/clear-branch-protections-for-repo.js repository-name
 *
 * EXAMPLE:
 * node perennial/js/scripts/clear-branch-protections-for-repo.js john-travoltage
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

const args = process.argv.slice(2);
const repo = args[0];
if (!repo) {
  console.error('Repo name must be provided as first command line argument.');
} else {
  (async () => {
    await protectGithubBranches.clearBranchProtections([repo]);
  })();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcm90ZWN0R2l0aHViQnJhbmNoZXMiLCJyZXF1aXJlIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJyZXBvIiwiY29uc29sZSIsImVycm9yIiwiY2xlYXJCcmFuY2hQcm90ZWN0aW9ucyJdLCJzb3VyY2VzIjpbImNsZWFyLWJyYW5jaC1wcm90ZWN0aW9ucy1mb3ItcmVwby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5jb25zdCBwcm90ZWN0R2l0aHViQnJhbmNoZXMgPSByZXF1aXJlKCAnLi4vY29tbW9uL3Byb3RlY3RHaXRodWJCcmFuY2hlcycgKTtcclxuXHJcbi8qKlxyXG4gKiBSZW1vdmUgYnJhbmNoIHByb3RlY3Rpb24gcnVsZXMgZm9yIHRoZSBwcm92aWRlZCByZXBvIHNvIHRoYXQgbWFzdGVyLCBtYWluLCBhbmQgcmVsZWFzZSBDQU4gYmUgbW9kaWZpZWQuXHJcbiAqIEl0IGlzIGZhc3RlciB0byBqdXN0IHJlbW92ZSBicmFuY2ggcHJvdGVjdGlvbnMgZnJvbSB0aGUgZ2l0aHViIFVJLCBidXQgdGhpcyBpcyBoZWxwZnVsIGZvciBhdXRvbWF0aW9uLlxyXG4gKiBGb3IgZXhhbXBsZSwgeW91IGNhbiB1c2UgdGhpcyBpZiB0aGUgYXV0b21hdGVkIG1haW50ZW5hbmNlIHJlbGVhc2UgcHJvY2VzcyBuZWVkcyB0byBmb3JjZSBwdXNoIHRvXHJcbiAqIHByb2R1Y3Rpb24gYnJhbmNoZXMuXHJcbiAqXHJcbiAqIFVTQUdFOlxyXG4gKiBub2RlIHBlcmVubmlhbC9qcy9zY3JpcHRzL2NsZWFyLWJyYW5jaC1wcm90ZWN0aW9ucy1mb3ItcmVwby5qcyByZXBvc2l0b3J5LW5hbWVcclxuICpcclxuICogRVhBTVBMRTpcclxuICogbm9kZSBwZXJlbm5pYWwvanMvc2NyaXB0cy9jbGVhci1icmFuY2gtcHJvdGVjdGlvbnMtZm9yLXJlcG8uanMgam9obi10cmF2b2x0YWdlXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcblxyXG5jb25zdCBhcmdzID0gcHJvY2Vzcy5hcmd2LnNsaWNlKCAyICk7XHJcbmNvbnN0IHJlcG8gPSBhcmdzWyAwIF07XHJcblxyXG5pZiAoICFyZXBvICkge1xyXG4gIGNvbnNvbGUuZXJyb3IoICdSZXBvIG5hbWUgbXVzdCBiZSBwcm92aWRlZCBhcyBmaXJzdCBjb21tYW5kIGxpbmUgYXJndW1lbnQuJyApO1xyXG59XHJcbmVsc2Uge1xyXG4gICggYXN5bmMgKCkgPT4ge1xyXG4gICAgYXdhaXQgcHJvdGVjdEdpdGh1YkJyYW5jaGVzLmNsZWFyQnJhbmNoUHJvdGVjdGlvbnMoIFsgcmVwbyBdICk7XHJcbiAgfSApKCk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE1BQU1BLHFCQUFxQixHQUFHQyxPQUFPLENBQUUsaUNBQWtDLENBQUM7O0FBRTFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsTUFBTUMsSUFBSSxHQUFHQyxPQUFPLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFFLENBQUUsQ0FBQztBQUNwQyxNQUFNQyxJQUFJLEdBQUdKLElBQUksQ0FBRSxDQUFDLENBQUU7QUFFdEIsSUFBSyxDQUFDSSxJQUFJLEVBQUc7RUFDWEMsT0FBTyxDQUFDQyxLQUFLLENBQUUsNERBQTZELENBQUM7QUFDL0UsQ0FBQyxNQUNJO0VBQ0gsQ0FBRSxZQUFZO0lBQ1osTUFBTVIscUJBQXFCLENBQUNTLHNCQUFzQixDQUFFLENBQUVILElBQUksQ0FBRyxDQUFDO0VBQ2hFLENBQUMsRUFBRyxDQUFDO0FBQ1AifQ==