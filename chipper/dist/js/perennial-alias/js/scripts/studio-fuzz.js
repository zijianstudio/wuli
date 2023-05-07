// Copyright 2021, University of Colorado Boulder

/**
 * Continuously running Studio fuzzing for testing
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const puppeteerLoad = require('../common/puppeteerLoad');
const withServer = require('../common/withServer');
(async () => {
  while (true) {
    // eslint-disable-line no-constant-condition
    let studioFuzz = null;
    console.log('starting new fuzz');
    try {
      await withServer(async port => {
        const url = `http://localhost:${port}/studio/index.html?sim=states-of-matter&phetioElementsDisplay=all&fuzz`;
        await puppeteerLoad(url, {
          waitAfterLoad: 10000,
          allowedTimeToLoad: 120000,
          gotoTimeout: 120000,
          launchOptions: {
            // With this flag, temp files are written to /tmp/ on bayes, which caused https://github.com/phetsims/aqua/issues/145
            // /dev/shm/ is much bigger
            ignoreDefaultArgs: ['--disable-dev-shm-usage'],
            // Command line arguments passed to the chrome instance,
            args: ['--enable-precise-memory-info',
            // To prevent filling up `/tmp`, see https://github.com/phetsims/aqua/issues/145
            `--user-data-dir=${process.cwd()}/../tmp/puppeteerUserData/`]
          }
        });
      });
    } catch (e) {
      studioFuzz = e;
    }
    console.log(studioFuzz);
  }
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwdXBwZXRlZXJMb2FkIiwicmVxdWlyZSIsIndpdGhTZXJ2ZXIiLCJzdHVkaW9GdXp6IiwiY29uc29sZSIsImxvZyIsInBvcnQiLCJ1cmwiLCJ3YWl0QWZ0ZXJMb2FkIiwiYWxsb3dlZFRpbWVUb0xvYWQiLCJnb3RvVGltZW91dCIsImxhdW5jaE9wdGlvbnMiLCJpZ25vcmVEZWZhdWx0QXJncyIsImFyZ3MiLCJwcm9jZXNzIiwiY3dkIiwiZSJdLCJzb3VyY2VzIjpbInN0dWRpby1mdXp6LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250aW51b3VzbHkgcnVubmluZyBTdHVkaW8gZnV6emluZyBmb3IgdGVzdGluZ1xyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIEtsdXNlbmRvcmYgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5jb25zdCBwdXBwZXRlZXJMb2FkID0gcmVxdWlyZSggJy4uL2NvbW1vbi9wdXBwZXRlZXJMb2FkJyApO1xyXG5jb25zdCB3aXRoU2VydmVyID0gcmVxdWlyZSggJy4uL2NvbW1vbi93aXRoU2VydmVyJyApO1xyXG5cclxuKCBhc3luYyAoKSA9PiB7XHJcblxyXG4gIHdoaWxlICggdHJ1ZSApIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuICAgIGxldCBzdHVkaW9GdXp6ID0gbnVsbDtcclxuXHJcbiAgICBjb25zb2xlLmxvZyggJ3N0YXJ0aW5nIG5ldyBmdXp6JyApO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHdpdGhTZXJ2ZXIoIGFzeW5jIHBvcnQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGBodHRwOi8vbG9jYWxob3N0OiR7cG9ydH0vc3R1ZGlvL2luZGV4Lmh0bWw/c2ltPXN0YXRlcy1vZi1tYXR0ZXImcGhldGlvRWxlbWVudHNEaXNwbGF5PWFsbCZmdXp6YDtcclxuICAgICAgICBhd2FpdCBwdXBwZXRlZXJMb2FkKCB1cmwsIHtcclxuICAgICAgICAgIHdhaXRBZnRlckxvYWQ6IDEwMDAwLFxyXG4gICAgICAgICAgYWxsb3dlZFRpbWVUb0xvYWQ6IDEyMDAwMCxcclxuICAgICAgICAgIGdvdG9UaW1lb3V0OiAxMjAwMDAsXHJcbiAgICAgICAgICBsYXVuY2hPcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgICAvLyBXaXRoIHRoaXMgZmxhZywgdGVtcCBmaWxlcyBhcmUgd3JpdHRlbiB0byAvdG1wLyBvbiBiYXllcywgd2hpY2ggY2F1c2VkIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcXVhL2lzc3Vlcy8xNDVcclxuICAgICAgICAgICAgLy8gL2Rldi9zaG0vIGlzIG11Y2ggYmlnZ2VyXHJcbiAgICAgICAgICAgIGlnbm9yZURlZmF1bHRBcmdzOiBbICctLWRpc2FibGUtZGV2LXNobS11c2FnZScgXSxcclxuXHJcbiAgICAgICAgICAgIC8vIENvbW1hbmQgbGluZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBjaHJvbWUgaW5zdGFuY2UsXHJcbiAgICAgICAgICAgIGFyZ3M6IFtcclxuICAgICAgICAgICAgICAnLS1lbmFibGUtcHJlY2lzZS1tZW1vcnktaW5mbycsXHJcblxyXG4gICAgICAgICAgICAgIC8vIFRvIHByZXZlbnQgZmlsbGluZyB1cCBgL3RtcGAsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTQ1XHJcbiAgICAgICAgICAgICAgYC0tdXNlci1kYXRhLWRpcj0ke3Byb2Nlc3MuY3dkKCl9Ly4uL3RtcC9wdXBwZXRlZXJVc2VyRGF0YS9gXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICBzdHVkaW9GdXp6ID0gZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZyggc3R1ZGlvRnV6eiApO1xyXG4gIH1cclxufSApKCk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBTUEsYUFBYSxHQUFHQyxPQUFPLENBQUUseUJBQTBCLENBQUM7QUFDMUQsTUFBTUMsVUFBVSxHQUFHRCxPQUFPLENBQUUsc0JBQXVCLENBQUM7QUFFcEQsQ0FBRSxZQUFZO0VBRVosT0FBUSxJQUFJLEVBQUc7SUFBRTtJQUNmLElBQUlFLFVBQVUsR0FBRyxJQUFJO0lBRXJCQyxPQUFPLENBQUNDLEdBQUcsQ0FBRSxtQkFBb0IsQ0FBQztJQUVsQyxJQUFJO01BQ0YsTUFBTUgsVUFBVSxDQUFFLE1BQU1JLElBQUksSUFBSTtRQUM5QixNQUFNQyxHQUFHLEdBQUksb0JBQW1CRCxJQUFLLHdFQUF1RTtRQUM1RyxNQUFNTixhQUFhLENBQUVPLEdBQUcsRUFBRTtVQUN4QkMsYUFBYSxFQUFFLEtBQUs7VUFDcEJDLGlCQUFpQixFQUFFLE1BQU07VUFDekJDLFdBQVcsRUFBRSxNQUFNO1VBQ25CQyxhQUFhLEVBQUU7WUFFYjtZQUNBO1lBQ0FDLGlCQUFpQixFQUFFLENBQUUseUJBQXlCLENBQUU7WUFFaEQ7WUFDQUMsSUFBSSxFQUFFLENBQ0osOEJBQThCO1lBRTlCO1lBQ0MsbUJBQWtCQyxPQUFPLENBQUNDLEdBQUcsQ0FBQyxDQUFFLDRCQUEyQjtVQUVoRTtRQUNGLENBQUUsQ0FBQztNQUNMLENBQUUsQ0FBQztJQUNMLENBQUMsQ0FDRCxPQUFPQyxDQUFDLEVBQUc7TUFDVGIsVUFBVSxHQUFHYSxDQUFDO0lBQ2hCO0lBRUFaLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFRixVQUFXLENBQUM7RUFDM0I7QUFDRixDQUFDLEVBQUcsQ0FBQyJ9