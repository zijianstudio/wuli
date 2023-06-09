// Copyright 2022-2023, University of Colorado Boulder

/**
 * Launch puppeteer and point it to CT running on a server for 15 minutes.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const assert = require('assert');
const puppeteerLoad = require('../../../perennial/js/common/puppeteerLoad');
const {
  parentPort
} = require('worker_threads'); // eslint-disable-line require-statement-match

process.on('SIGINT', () => process.exit());
(async () => {
  const ctID = process.argv[2];
  assert(ctID, 'usage: node puppeteerCTClient {{SOME_IDENTIFIER_HERE}} {{SERVER}}');
  let server = process.argv[3];
  assert(server, 'usage: node puppeteerCTClient {{SOME_IDENTIFIER_HERE}} {{SERVER}}');
  server = server.endsWith('/') ? server : `${server}/`;

  // http so we don't need to overhead when running locally
  const url = `${server}continuous-testing/aqua/html/continuous-loop.html?id=${ctID}%20Puppeteer`;
  const loadingMessage = `Loading ${url}`;
  parentPort && parentPort.postMessage(loadingMessage);
  // console.log( loadingMessage );

  const error = await puppeteerLoad(url, {
    waitAfterLoad: 15 * 60 * 1000,
    // 15 minutes
    allowedTimeToLoad: 120000,
    gotoTimeout: 1000000000,
    // A page error is what we are testing for. Don't fail the browser instance out when an assertion occurs
    rejectPageErrors: false,
    launchOptions: {
      // With this flag, temp files are written to /tmp/ on bayes, which caused https://github.com/phetsims/aqua/issues/145
      // /dev/shm/ is much bigger
      ignoreDefaultArgs: ['--disable-dev-shm-usage'],
      // Command line arguments passed to the chrome instance,
      args: ['--enable-precise-memory-info',
      // To prevent filling up `/tmp`, see https://github.com/phetsims/aqua/issues/145
      `--user-data-dir=${process.cwd()}/../tmp/puppeteerUserData/`,
      // Fork child processes directly to prevent orphaned chrome instances from lingering on sparky, https://github.com/phetsims/aqua/issues/150#issuecomment-1170140994
      '--no-zygote', '--no-sandbox']
    }
  });
  if (error) {
    // console.error( error );

    // Send the error to the parent Node process that spawned the worker.
    parentPort && parentPort.postMessage(error);
  }

  // The worker didn't seem to exit without this line
  process.exit(0);
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhc3NlcnQiLCJyZXF1aXJlIiwicHVwcGV0ZWVyTG9hZCIsInBhcmVudFBvcnQiLCJwcm9jZXNzIiwib24iLCJleGl0IiwiY3RJRCIsImFyZ3YiLCJzZXJ2ZXIiLCJlbmRzV2l0aCIsInVybCIsImxvYWRpbmdNZXNzYWdlIiwicG9zdE1lc3NhZ2UiLCJlcnJvciIsIndhaXRBZnRlckxvYWQiLCJhbGxvd2VkVGltZVRvTG9hZCIsImdvdG9UaW1lb3V0IiwicmVqZWN0UGFnZUVycm9ycyIsImxhdW5jaE9wdGlvbnMiLCJpZ25vcmVEZWZhdWx0QXJncyIsImFyZ3MiLCJjd2QiXSwic291cmNlcyI6WyJwdXBwZXRlZXJDVENsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBMYXVuY2ggcHVwcGV0ZWVyIGFuZCBwb2ludCBpdCB0byBDVCBydW5uaW5nIG9uIGEgc2VydmVyIGZvciAxNSBtaW51dGVzLlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuY29uc3QgYXNzZXJ0ID0gcmVxdWlyZSggJ2Fzc2VydCcgKTtcclxuY29uc3QgcHVwcGV0ZWVyTG9hZCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL3B1cHBldGVlckxvYWQnICk7XHJcbmNvbnN0IHsgcGFyZW50UG9ydCB9ID0gcmVxdWlyZSggJ3dvcmtlcl90aHJlYWRzJyApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlcXVpcmUtc3RhdGVtZW50LW1hdGNoXHJcblxyXG5wcm9jZXNzLm9uKCAnU0lHSU5UJywgKCkgPT4gcHJvY2Vzcy5leGl0KCkgKTtcclxuXHJcbiggYXN5bmMgKCkgPT4ge1xyXG5cclxuICBjb25zdCBjdElEID0gcHJvY2Vzcy5hcmd2WyAyIF07XHJcbiAgYXNzZXJ0KCBjdElELCAndXNhZ2U6IG5vZGUgcHVwcGV0ZWVyQ1RDbGllbnQge3tTT01FX0lERU5USUZJRVJfSEVSRX19IHt7U0VSVkVSfX0nICk7XHJcblxyXG4gIGxldCBzZXJ2ZXIgPSBwcm9jZXNzLmFyZ3ZbIDMgXTtcclxuICBhc3NlcnQoIHNlcnZlciwgJ3VzYWdlOiBub2RlIHB1cHBldGVlckNUQ2xpZW50IHt7U09NRV9JREVOVElGSUVSX0hFUkV9fSB7e1NFUlZFUn19JyApO1xyXG5cclxuICBzZXJ2ZXIgPSBzZXJ2ZXIuZW5kc1dpdGgoICcvJyApID8gc2VydmVyIDogYCR7c2VydmVyfS9gO1xyXG5cclxuICAvLyBodHRwIHNvIHdlIGRvbid0IG5lZWQgdG8gb3ZlcmhlYWQgd2hlbiBydW5uaW5nIGxvY2FsbHlcclxuICBjb25zdCB1cmwgPSBgJHtzZXJ2ZXJ9Y29udGludW91cy10ZXN0aW5nL2FxdWEvaHRtbC9jb250aW51b3VzLWxvb3AuaHRtbD9pZD0ke2N0SUR9JTIwUHVwcGV0ZWVyYDtcclxuICBjb25zdCBsb2FkaW5nTWVzc2FnZSA9IGBMb2FkaW5nICR7dXJsfWA7XHJcbiAgcGFyZW50UG9ydCAmJiBwYXJlbnRQb3J0LnBvc3RNZXNzYWdlKCBsb2FkaW5nTWVzc2FnZSApO1xyXG4gIC8vIGNvbnNvbGUubG9nKCBsb2FkaW5nTWVzc2FnZSApO1xyXG5cclxuICBjb25zdCBlcnJvciA9IGF3YWl0IHB1cHBldGVlckxvYWQoIHVybCwge1xyXG4gICAgd2FpdEFmdGVyTG9hZDogMTUgKiA2MCAqIDEwMDAsIC8vIDE1IG1pbnV0ZXNcclxuICAgIGFsbG93ZWRUaW1lVG9Mb2FkOiAxMjAwMDAsXHJcbiAgICBnb3RvVGltZW91dDogMTAwMDAwMDAwMCxcclxuXHJcbiAgICAvLyBBIHBhZ2UgZXJyb3IgaXMgd2hhdCB3ZSBhcmUgdGVzdGluZyBmb3IuIERvbid0IGZhaWwgdGhlIGJyb3dzZXIgaW5zdGFuY2Ugb3V0IHdoZW4gYW4gYXNzZXJ0aW9uIG9jY3Vyc1xyXG4gICAgcmVqZWN0UGFnZUVycm9yczogZmFsc2UsXHJcblxyXG4gICAgbGF1bmNoT3B0aW9uczoge1xyXG5cclxuICAgICAgLy8gV2l0aCB0aGlzIGZsYWcsIHRlbXAgZmlsZXMgYXJlIHdyaXR0ZW4gdG8gL3RtcC8gb24gYmF5ZXMsIHdoaWNoIGNhdXNlZCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvMTQ1XHJcbiAgICAgIC8vIC9kZXYvc2htLyBpcyBtdWNoIGJpZ2dlclxyXG4gICAgICBpZ25vcmVEZWZhdWx0QXJnczogWyAnLS1kaXNhYmxlLWRldi1zaG0tdXNhZ2UnIF0sXHJcblxyXG4gICAgICAvLyBDb21tYW5kIGxpbmUgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgY2hyb21lIGluc3RhbmNlLFxyXG4gICAgICBhcmdzOiBbXHJcbiAgICAgICAgJy0tZW5hYmxlLXByZWNpc2UtbWVtb3J5LWluZm8nLFxyXG5cclxuICAgICAgICAvLyBUbyBwcmV2ZW50IGZpbGxpbmcgdXAgYC90bXBgLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzE0NVxyXG4gICAgICAgIGAtLXVzZXItZGF0YS1kaXI9JHtwcm9jZXNzLmN3ZCgpfS8uLi90bXAvcHVwcGV0ZWVyVXNlckRhdGEvYCxcclxuXHJcbiAgICAgICAgLy8gRm9yayBjaGlsZCBwcm9jZXNzZXMgZGlyZWN0bHkgdG8gcHJldmVudCBvcnBoYW5lZCBjaHJvbWUgaW5zdGFuY2VzIGZyb20gbGluZ2VyaW5nIG9uIHNwYXJreSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2FxdWEvaXNzdWVzLzE1MCNpc3N1ZWNvbW1lbnQtMTE3MDE0MDk5NFxyXG4gICAgICAgICctLW5vLXp5Z290ZScsXHJcbiAgICAgICAgJy0tbm8tc2FuZGJveCdcclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0gKTtcclxuICBpZiAoIGVycm9yICkge1xyXG4gICAgLy8gY29uc29sZS5lcnJvciggZXJyb3IgKTtcclxuXHJcbiAgICAvLyBTZW5kIHRoZSBlcnJvciB0byB0aGUgcGFyZW50IE5vZGUgcHJvY2VzcyB0aGF0IHNwYXduZWQgdGhlIHdvcmtlci5cclxuICAgIHBhcmVudFBvcnQgJiYgcGFyZW50UG9ydC5wb3N0TWVzc2FnZSggZXJyb3IgKTtcclxuICB9XHJcblxyXG4gIC8vIFRoZSB3b3JrZXIgZGlkbid0IHNlZW0gdG8gZXhpdCB3aXRob3V0IHRoaXMgbGluZVxyXG4gIHByb2Nlc3MuZXhpdCggMCApO1xyXG59ICkoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxNQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBRSxRQUFTLENBQUM7QUFDbEMsTUFBTUMsYUFBYSxHQUFHRCxPQUFPLENBQUUsNENBQTZDLENBQUM7QUFDN0UsTUFBTTtFQUFFRTtBQUFXLENBQUMsR0FBR0YsT0FBTyxDQUFFLGdCQUFpQixDQUFDLENBQUMsQ0FBQzs7QUFFcERHLE9BQU8sQ0FBQ0MsRUFBRSxDQUFFLFFBQVEsRUFBRSxNQUFNRCxPQUFPLENBQUNFLElBQUksQ0FBQyxDQUFFLENBQUM7QUFFNUMsQ0FBRSxZQUFZO0VBRVosTUFBTUMsSUFBSSxHQUFHSCxPQUFPLENBQUNJLElBQUksQ0FBRSxDQUFDLENBQUU7RUFDOUJSLE1BQU0sQ0FBRU8sSUFBSSxFQUFFLG1FQUFvRSxDQUFDO0VBRW5GLElBQUlFLE1BQU0sR0FBR0wsT0FBTyxDQUFDSSxJQUFJLENBQUUsQ0FBQyxDQUFFO0VBQzlCUixNQUFNLENBQUVTLE1BQU0sRUFBRSxtRUFBb0UsQ0FBQztFQUVyRkEsTUFBTSxHQUFHQSxNQUFNLENBQUNDLFFBQVEsQ0FBRSxHQUFJLENBQUMsR0FBR0QsTUFBTSxHQUFJLEdBQUVBLE1BQU8sR0FBRTs7RUFFdkQ7RUFDQSxNQUFNRSxHQUFHLEdBQUksR0FBRUYsTUFBTyx3REFBdURGLElBQUssY0FBYTtFQUMvRixNQUFNSyxjQUFjLEdBQUksV0FBVUQsR0FBSSxFQUFDO0VBQ3ZDUixVQUFVLElBQUlBLFVBQVUsQ0FBQ1UsV0FBVyxDQUFFRCxjQUFlLENBQUM7RUFDdEQ7O0VBRUEsTUFBTUUsS0FBSyxHQUFHLE1BQU1aLGFBQWEsQ0FBRVMsR0FBRyxFQUFFO0lBQ3RDSSxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJO0lBQUU7SUFDL0JDLGlCQUFpQixFQUFFLE1BQU07SUFDekJDLFdBQVcsRUFBRSxVQUFVO0lBRXZCO0lBQ0FDLGdCQUFnQixFQUFFLEtBQUs7SUFFdkJDLGFBQWEsRUFBRTtNQUViO01BQ0E7TUFDQUMsaUJBQWlCLEVBQUUsQ0FBRSx5QkFBeUIsQ0FBRTtNQUVoRDtNQUNBQyxJQUFJLEVBQUUsQ0FDSiw4QkFBOEI7TUFFOUI7TUFDQyxtQkFBa0JqQixPQUFPLENBQUNrQixHQUFHLENBQUMsQ0FBRSw0QkFBMkI7TUFFNUQ7TUFDQSxhQUFhLEVBQ2IsY0FBYztJQUVsQjtFQUNGLENBQUUsQ0FBQztFQUNILElBQUtSLEtBQUssRUFBRztJQUNYOztJQUVBO0lBQ0FYLFVBQVUsSUFBSUEsVUFBVSxDQUFDVSxXQUFXLENBQUVDLEtBQU0sQ0FBQztFQUMvQzs7RUFFQTtFQUNBVixPQUFPLENBQUNFLElBQUksQ0FBRSxDQUFFLENBQUM7QUFDbkIsQ0FBQyxFQUFHLENBQUMifQ==