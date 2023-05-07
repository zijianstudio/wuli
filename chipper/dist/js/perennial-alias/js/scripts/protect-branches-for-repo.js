// Copyright 2021, University of Colorado Boulder

const protectGithubBranches = require('../common/protectGithubBranches');

/**
 * Set branch protection rules for the provided repo so that master, main, and release branches cannot be deleted.
 *
 * USAGE:
 * node perennial/js/scripts/protect-branches-for-repo.js repository-name
 *
 * EXAMPLE:
 * node perennial/js/scripts/protect-branches-for-repo.js john-travoltage
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

const args = process.argv.slice(2);
const repo = args[0];
if (!repo) {
  console.error('Repo name must be provided as first command line argument.');
} else {
  (async () => {
    await protectGithubBranches.protectBranches([repo]);
  })();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcm90ZWN0R2l0aHViQnJhbmNoZXMiLCJyZXF1aXJlIiwiYXJncyIsInByb2Nlc3MiLCJhcmd2Iiwic2xpY2UiLCJyZXBvIiwiY29uc29sZSIsImVycm9yIiwicHJvdGVjdEJyYW5jaGVzIl0sInNvdXJjZXMiOlsicHJvdGVjdC1icmFuY2hlcy1mb3ItcmVwby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5jb25zdCBwcm90ZWN0R2l0aHViQnJhbmNoZXMgPSByZXF1aXJlKCAnLi4vY29tbW9uL3Byb3RlY3RHaXRodWJCcmFuY2hlcycgKTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgYnJhbmNoIHByb3RlY3Rpb24gcnVsZXMgZm9yIHRoZSBwcm92aWRlZCByZXBvIHNvIHRoYXQgbWFzdGVyLCBtYWluLCBhbmQgcmVsZWFzZSBicmFuY2hlcyBjYW5ub3QgYmUgZGVsZXRlZC5cclxuICpcclxuICogVVNBR0U6XHJcbiAqIG5vZGUgcGVyZW5uaWFsL2pzL3NjcmlwdHMvcHJvdGVjdC1icmFuY2hlcy1mb3ItcmVwby5qcyByZXBvc2l0b3J5LW5hbWVcclxuICpcclxuICogRVhBTVBMRTpcclxuICogbm9kZSBwZXJlbm5pYWwvanMvc2NyaXB0cy9wcm90ZWN0LWJyYW5jaGVzLWZvci1yZXBvLmpzIGpvaG4tdHJhdm9sdGFnZVxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5cclxuY29uc3QgYXJncyA9IHByb2Nlc3MuYXJndi5zbGljZSggMiApO1xyXG5jb25zdCByZXBvID0gYXJnc1sgMCBdO1xyXG5cclxuaWYgKCAhcmVwbyApIHtcclxuICBjb25zb2xlLmVycm9yKCAnUmVwbyBuYW1lIG11c3QgYmUgcHJvdmlkZWQgYXMgZmlyc3QgY29tbWFuZCBsaW5lIGFyZ3VtZW50LicgKTtcclxufVxyXG5lbHNlIHtcclxuICAoIGFzeW5jICgpID0+IHtcclxuICAgIGF3YWl0IHByb3RlY3RHaXRodWJCcmFuY2hlcy5wcm90ZWN0QnJhbmNoZXMoIFsgcmVwbyBdICk7XHJcbiAgfSApKCk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLE1BQU1BLHFCQUFxQixHQUFHQyxPQUFPLENBQUUsaUNBQWtDLENBQUM7O0FBRTFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsTUFBTUMsSUFBSSxHQUFHQyxPQUFPLENBQUNDLElBQUksQ0FBQ0MsS0FBSyxDQUFFLENBQUUsQ0FBQztBQUNwQyxNQUFNQyxJQUFJLEdBQUdKLElBQUksQ0FBRSxDQUFDLENBQUU7QUFFdEIsSUFBSyxDQUFDSSxJQUFJLEVBQUc7RUFDWEMsT0FBTyxDQUFDQyxLQUFLLENBQUUsNERBQTZELENBQUM7QUFDL0UsQ0FBQyxNQUNJO0VBQ0gsQ0FBRSxZQUFZO0lBQ1osTUFBTVIscUJBQXFCLENBQUNTLGVBQWUsQ0FBRSxDQUFFSCxJQUFJLENBQUcsQ0FBQztFQUN6RCxDQUFDLEVBQUcsQ0FBQztBQUNQIn0=