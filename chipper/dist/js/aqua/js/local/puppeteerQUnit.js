/* eslint-disable */
// Adapted from https://github.com/davidtaylorhq/qunit-puppeteer which is distributed under the MIT License
/* eslint-enable */

module.exports = function (browser, targetURL) {
  return new Promise(async (resolve, reject) => {
    // eslint-disable-line no-async-promise-executor
    const page = await browser.newPage();
    let ended = false;
    const end = async function (result) {
      if (!ended) {
        ended = true;
        await page.close();
        resolve(result);
      }
    };
    page.on('error', msg => end({
      ok: false,
      result: 'error',
      message: msg
    }));
    page.on('pageerror', msg => end({
      ok: false,
      result: 'pageerror',
      message: msg
    }));
    const moduleErrors = [];
    let testErrors = [];
    let assertionErrors = [];
    await page.exposeFunction('harness_moduleDone', context => {
      if (context.failed) {
        const msg = `Module Failed: ${context.name}\n${testErrors.join('\n')}`;
        moduleErrors.push(msg);
        testErrors = [];
      }
    });
    await page.exposeFunction('harness_testDone', context => {
      if (context.failed) {
        const msg = `  Test Failed: ${context.name}${assertionErrors.join('    ')}`;
        testErrors.push(msg);
        assertionErrors = [];
        process.stdout.write('F');
      } else {
        // process.stdout.write( '.' );
      }
    });
    await page.exposeFunction('harness_log', (passed, message, source) => {
      if (passed) {
        return;
      } // If success don't log

      let msg = '\n    Assertion Failed:';
      if (message) {
        msg += ` ${message}`;
      }
      if (source) {
        msg += `\n\n${source}`;
      }
      assertionErrors.push(msg);
    });
    await page.exposeFunction('harness_done', async context => {
      // console.log( '\n' );

      if (moduleErrors.length > 0) {
        for (let idx = 0; idx < moduleErrors.length; idx++) {
          console.error(`${moduleErrors[idx]}\n`);
        }
      }
      end({
        ok: context.passed === context.total,
        time: context.runtime,
        totalTests: context.total,
        passed: context.passed,
        failed: context.failed,
        errors: moduleErrors
      });
    });
    try {
      if (targetURL.indexOf('?') === -1) {
        throw new Error('URL should have query parameters');
      }
      await page.goto(`${targetURL}&qunitHooks`);
      await page.evaluate(() => {
        const launch = () => {
          QUnit.config.testTimeout = 10000;

          // Cannot pass the window.harness_blah methods directly, because they are
          // automatically defined as async methods, which QUnit does not support
          QUnit.moduleDone(context => window.harness_moduleDone(context));
          QUnit.testDone(context => window.harness_testDone(context));

          // This context could contain objects that can't be sent over to harness_log, so just take the parts we need.
          QUnit.log(context => window.harness_log(context.result, context.message, context.source));
          QUnit.done(context => window.harness_done(context));

          // Launch the qunit tests now that listeners are wired up
          window.qunitLaunchAfterHooks();
        };

        // Start right away if the page is ready
        if (window.qunitLaunchAfterHooks) {
          launch();
        } else {
          // Polling to wait until the page is ready for launch
          let id = null;
          id = setInterval(() => {
            if (window.qunitLaunchAfterHooks) {
              clearInterval(id);
              launch();
            }
          }, 16);
        }
      });
    } catch (e) {
      end({
        ok: false,
        message: `caught exception ${e}`
      });
    }
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnRzIiwiYnJvd3NlciIsInRhcmdldFVSTCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicGFnZSIsIm5ld1BhZ2UiLCJlbmRlZCIsImVuZCIsInJlc3VsdCIsImNsb3NlIiwib24iLCJtc2ciLCJvayIsIm1lc3NhZ2UiLCJtb2R1bGVFcnJvcnMiLCJ0ZXN0RXJyb3JzIiwiYXNzZXJ0aW9uRXJyb3JzIiwiZXhwb3NlRnVuY3Rpb24iLCJjb250ZXh0IiwiZmFpbGVkIiwibmFtZSIsImpvaW4iLCJwdXNoIiwicHJvY2VzcyIsInN0ZG91dCIsIndyaXRlIiwicGFzc2VkIiwic291cmNlIiwibGVuZ3RoIiwiaWR4IiwiY29uc29sZSIsImVycm9yIiwidG90YWwiLCJ0aW1lIiwicnVudGltZSIsInRvdGFsVGVzdHMiLCJlcnJvcnMiLCJpbmRleE9mIiwiRXJyb3IiLCJnb3RvIiwiZXZhbHVhdGUiLCJsYXVuY2giLCJRVW5pdCIsImNvbmZpZyIsInRlc3RUaW1lb3V0IiwibW9kdWxlRG9uZSIsIndpbmRvdyIsImhhcm5lc3NfbW9kdWxlRG9uZSIsInRlc3REb25lIiwiaGFybmVzc190ZXN0RG9uZSIsImxvZyIsImhhcm5lc3NfbG9nIiwiZG9uZSIsImhhcm5lc3NfZG9uZSIsInF1bml0TGF1bmNoQWZ0ZXJIb29rcyIsImlkIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwiZSJdLCJzb3VyY2VzIjpbInB1cHBldGVlclFVbml0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXHJcbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWR0YXlsb3JocS9xdW5pdC1wdXBwZXRlZXIgd2hpY2ggaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXHJcbi8qIGVzbGludC1lbmFibGUgKi9cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCBicm93c2VyLCB0YXJnZXRVUkwgKSB7XHJcblxyXG4gIHJldHVybiBuZXcgUHJvbWlzZSggYXN5bmMgKCByZXNvbHZlLCByZWplY3QgKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYXN5bmMtcHJvbWlzZS1leGVjdXRvclxyXG4gICAgY29uc3QgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xyXG4gICAgbGV0IGVuZGVkID0gZmFsc2U7XHJcbiAgICBjb25zdCBlbmQgPSBhc3luYyBmdW5jdGlvbiggcmVzdWx0ICkge1xyXG4gICAgICBpZiAoICFlbmRlZCApIHtcclxuICAgICAgICBlbmRlZCA9IHRydWU7XHJcbiAgICAgICAgYXdhaXQgcGFnZS5jbG9zZSgpO1xyXG4gICAgICAgIHJlc29sdmUoIHJlc3VsdCApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHBhZ2Uub24oICdlcnJvcicsIG1zZyA9PiBlbmQoIHsgb2s6IGZhbHNlLCByZXN1bHQ6ICdlcnJvcicsIG1lc3NhZ2U6IG1zZyB9ICkgKTtcclxuICAgIHBhZ2Uub24oICdwYWdlZXJyb3InLCBtc2cgPT4gZW5kKCB7IG9rOiBmYWxzZSwgcmVzdWx0OiAncGFnZWVycm9yJywgbWVzc2FnZTogbXNnIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IG1vZHVsZUVycm9ycyA9IFtdO1xyXG4gICAgbGV0IHRlc3RFcnJvcnMgPSBbXTtcclxuICAgIGxldCBhc3NlcnRpb25FcnJvcnMgPSBbXTtcclxuXHJcbiAgICBhd2FpdCBwYWdlLmV4cG9zZUZ1bmN0aW9uKCAnaGFybmVzc19tb2R1bGVEb25lJywgY29udGV4dCA9PiB7XHJcbiAgICAgIGlmICggY29udGV4dC5mYWlsZWQgKSB7XHJcbiAgICAgICAgY29uc3QgbXNnID0gYE1vZHVsZSBGYWlsZWQ6ICR7Y29udGV4dC5uYW1lfVxcbiR7dGVzdEVycm9ycy5qb2luKCAnXFxuJyApfWA7XHJcbiAgICAgICAgbW9kdWxlRXJyb3JzLnB1c2goIG1zZyApO1xyXG4gICAgICAgIHRlc3RFcnJvcnMgPSBbXTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGF3YWl0IHBhZ2UuZXhwb3NlRnVuY3Rpb24oICdoYXJuZXNzX3Rlc3REb25lJywgY29udGV4dCA9PiB7XHJcbiAgICAgIGlmICggY29udGV4dC5mYWlsZWQgKSB7XHJcbiAgICAgICAgY29uc3QgbXNnID0gYCAgVGVzdCBGYWlsZWQ6ICR7Y29udGV4dC5uYW1lfSR7YXNzZXJ0aW9uRXJyb3JzLmpvaW4oICcgICAgJyApfWA7XHJcbiAgICAgICAgdGVzdEVycm9ycy5wdXNoKCBtc2cgKTtcclxuICAgICAgICBhc3NlcnRpb25FcnJvcnMgPSBbXTtcclxuICAgICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSggJ0YnICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gcHJvY2Vzcy5zdGRvdXQud3JpdGUoICcuJyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgYXdhaXQgcGFnZS5leHBvc2VGdW5jdGlvbiggJ2hhcm5lc3NfbG9nJywgKCBwYXNzZWQsIG1lc3NhZ2UsIHNvdXJjZSApID0+IHtcclxuICAgICAgaWYgKCBwYXNzZWQgKSB7IHJldHVybjsgfSAvLyBJZiBzdWNjZXNzIGRvbid0IGxvZ1xyXG5cclxuICAgICAgbGV0IG1zZyA9ICdcXG4gICAgQXNzZXJ0aW9uIEZhaWxlZDonO1xyXG4gICAgICBpZiAoIG1lc3NhZ2UgKSB7XHJcbiAgICAgICAgbXNnICs9IGAgJHttZXNzYWdlfWA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggc291cmNlICkge1xyXG4gICAgICAgIG1zZyArPSBgXFxuXFxuJHtzb3VyY2V9YDtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXNzZXJ0aW9uRXJyb3JzLnB1c2goIG1zZyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGF3YWl0IHBhZ2UuZXhwb3NlRnVuY3Rpb24oICdoYXJuZXNzX2RvbmUnLCBhc3luYyBjb250ZXh0ID0+IHtcclxuICAgICAgLy8gY29uc29sZS5sb2coICdcXG4nICk7XHJcblxyXG4gICAgICBpZiAoIG1vZHVsZUVycm9ycy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIGZvciAoIGxldCBpZHggPSAwOyBpZHggPCBtb2R1bGVFcnJvcnMubGVuZ3RoOyBpZHgrKyApIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGAke21vZHVsZUVycm9yc1sgaWR4IF19XFxuYCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZW5kKCB7XHJcbiAgICAgICAgb2s6IGNvbnRleHQucGFzc2VkID09PSBjb250ZXh0LnRvdGFsLFxyXG4gICAgICAgIHRpbWU6IGNvbnRleHQucnVudGltZSxcclxuICAgICAgICB0b3RhbFRlc3RzOiBjb250ZXh0LnRvdGFsLFxyXG4gICAgICAgIHBhc3NlZDogY29udGV4dC5wYXNzZWQsXHJcbiAgICAgICAgZmFpbGVkOiBjb250ZXh0LmZhaWxlZCxcclxuICAgICAgICBlcnJvcnM6IG1vZHVsZUVycm9yc1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCB0YXJnZXRVUkwuaW5kZXhPZiggJz8nICkgPT09IC0xICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggJ1VSTCBzaG91bGQgaGF2ZSBxdWVyeSBwYXJhbWV0ZXJzJyApO1xyXG4gICAgICB9XHJcbiAgICAgIGF3YWl0IHBhZ2UuZ290byggYCR7dGFyZ2V0VVJMfSZxdW5pdEhvb2tzYCApO1xyXG5cclxuICAgICAgYXdhaXQgcGFnZS5ldmFsdWF0ZSggKCkgPT4ge1xyXG5cclxuICAgICAgICBjb25zdCBsYXVuY2ggPSAoKSA9PiB7XHJcbiAgICAgICAgICBRVW5pdC5jb25maWcudGVzdFRpbWVvdXQgPSAxMDAwMDtcclxuXHJcbiAgICAgICAgICAvLyBDYW5ub3QgcGFzcyB0aGUgd2luZG93Lmhhcm5lc3NfYmxhaCBtZXRob2RzIGRpcmVjdGx5LCBiZWNhdXNlIHRoZXkgYXJlXHJcbiAgICAgICAgICAvLyBhdXRvbWF0aWNhbGx5IGRlZmluZWQgYXMgYXN5bmMgbWV0aG9kcywgd2hpY2ggUVVuaXQgZG9lcyBub3Qgc3VwcG9ydFxyXG4gICAgICAgICAgUVVuaXQubW9kdWxlRG9uZSggY29udGV4dCA9PiB3aW5kb3cuaGFybmVzc19tb2R1bGVEb25lKCBjb250ZXh0ICkgKTtcclxuICAgICAgICAgIFFVbml0LnRlc3REb25lKCBjb250ZXh0ID0+IHdpbmRvdy5oYXJuZXNzX3Rlc3REb25lKCBjb250ZXh0ICkgKTtcclxuXHJcbiAgICAgICAgICAvLyBUaGlzIGNvbnRleHQgY291bGQgY29udGFpbiBvYmplY3RzIHRoYXQgY2FuJ3QgYmUgc2VudCBvdmVyIHRvIGhhcm5lc3NfbG9nLCBzbyBqdXN0IHRha2UgdGhlIHBhcnRzIHdlIG5lZWQuXHJcbiAgICAgICAgICBRVW5pdC5sb2coIGNvbnRleHQgPT4gd2luZG93Lmhhcm5lc3NfbG9nKCBjb250ZXh0LnJlc3VsdCwgY29udGV4dC5tZXNzYWdlLCBjb250ZXh0LnNvdXJjZSApICk7XHJcbiAgICAgICAgICBRVW5pdC5kb25lKCBjb250ZXh0ID0+IHdpbmRvdy5oYXJuZXNzX2RvbmUoIGNvbnRleHQgKSApO1xyXG5cclxuICAgICAgICAgIC8vIExhdW5jaCB0aGUgcXVuaXQgdGVzdHMgbm93IHRoYXQgbGlzdGVuZXJzIGFyZSB3aXJlZCB1cFxyXG4gICAgICAgICAgd2luZG93LnF1bml0TGF1bmNoQWZ0ZXJIb29rcygpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IHJpZ2h0IGF3YXkgaWYgdGhlIHBhZ2UgaXMgcmVhZHlcclxuICAgICAgICBpZiAoIHdpbmRvdy5xdW5pdExhdW5jaEFmdGVySG9va3MgKSB7XHJcbiAgICAgICAgICBsYXVuY2goKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gUG9sbGluZyB0byB3YWl0IHVudGlsIHRoZSBwYWdlIGlzIHJlYWR5IGZvciBsYXVuY2hcclxuICAgICAgICAgIGxldCBpZCA9IG51bGw7XHJcbiAgICAgICAgICBpZCA9IHNldEludGVydmFsKCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICggd2luZG93LnF1bml0TGF1bmNoQWZ0ZXJIb29rcyApIHtcclxuICAgICAgICAgICAgICBjbGVhckludGVydmFsKCBpZCApO1xyXG4gICAgICAgICAgICAgIGxhdW5jaCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCAxNiApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgIGVuZCggeyBvazogZmFsc2UsIG1lc3NhZ2U6IGBjYXVnaHQgZXhjZXB0aW9uICR7ZX1gIH0gKTtcclxuICAgIH1cclxuICB9ICk7XHJcbn07Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7O0FBR0FBLE1BQU0sQ0FBQ0MsT0FBTyxHQUFHLFVBQVVDLE9BQU8sRUFBRUMsU0FBUyxFQUFHO0VBRTlDLE9BQU8sSUFBSUMsT0FBTyxDQUFFLE9BQVFDLE9BQU8sRUFBRUMsTUFBTSxLQUFNO0lBQUU7SUFDakQsTUFBTUMsSUFBSSxHQUFHLE1BQU1MLE9BQU8sQ0FBQ00sT0FBTyxDQUFDLENBQUM7SUFDcEMsSUFBSUMsS0FBSyxHQUFHLEtBQUs7SUFDakIsTUFBTUMsR0FBRyxHQUFHLGVBQUFBLENBQWdCQyxNQUFNLEVBQUc7TUFDbkMsSUFBSyxDQUFDRixLQUFLLEVBQUc7UUFDWkEsS0FBSyxHQUFHLElBQUk7UUFDWixNQUFNRixJQUFJLENBQUNLLEtBQUssQ0FBQyxDQUFDO1FBQ2xCUCxPQUFPLENBQUVNLE1BQU8sQ0FBQztNQUNuQjtJQUNGLENBQUM7SUFFREosSUFBSSxDQUFDTSxFQUFFLENBQUUsT0FBTyxFQUFFQyxHQUFHLElBQUlKLEdBQUcsQ0FBRTtNQUFFSyxFQUFFLEVBQUUsS0FBSztNQUFFSixNQUFNLEVBQUUsT0FB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