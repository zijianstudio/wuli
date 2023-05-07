// Copyright 2023, University of Colorado Boulder

/**
 * Runs a CT test
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

const _ = require('lodash');
const sendTestResult = require('./sendTestResult');
const puppeteer = require('../../../perennial/node_modules/puppeteer');
const winston = require('winston');
const sleep = require('../../../perennial/js/common/sleep');

/**
 * Runs a CT test
 * @public
 *
 * @param {Object} testInfo
 * @param {Object} [options]
 * @returns {Promise}
 */
module.exports = async function (testInfo, options) {
  options = _.extend({
    server: 'https://sparky.colorado.edu',
    // {string} - The server to use
    browserCreator: puppeteer,
    browser: null,
    launchOptions: {
      args: ['--disable-gpu']
    }
  }, options);
  const majorTimeout = 280000;
  const bailTimout = 400000;
  const testInfoQueryParam = `testInfo=${encodeURIComponent(JSON.stringify({
    test: testInfo.test,
    snapshotName: testInfo.snapshotName,
    timestamp: testInfo.timestamp
  }))}`;
  const url = `${options.server}/continuous-testing/aqua/html/${testInfo.url}${testInfo.url.includes('?') ? '&' : '?'}${testInfoQueryParam}`;
  const ownsBrowser = !options.browser;
  let browser;
  let page;
  let log = '';

  // Gets included in any error/fail messages
  const logResult = message => {
    winston.info(message);
    log += `${message}\n`;
  };
  try {
    browser = options.browser || (await options.browserCreator.launch(options.launchOptions));
    page = await browser.newPage();
    await page.setDefaultNavigationTimeout(majorTimeout);

    // TODO: have pendingPassFail when the result isn't sent
    let receivedPassFail = false;
    let gotNextTest = false;

    // promote for use outside the closure
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // Define a window.onMessageReceivedEvent function on the page.
    await page.exposeFunction('onPostMessageReceived', async e => {
      try {
        e = JSON.parse(e);
      } catch (e) {
        return;
      }
      if (e.type === 'test-pass') {
        receivedPassFail = true;
        winston.info('Sending PASS result');
        const serverMessage = await sendTestResult(e.message, testInfo, true, options);
        winston.info(`Server receipt: ${JSON.stringify(serverMessage)}`);
      } else if (e.type === 'test-fail') {
        receivedPassFail = false;
        winston.info('Sending FAIL result');
        const serverMessage = await sendTestResult(`${e.message}\n${log}`, testInfo, false, options);
        winston.info(`Server receipt: ${JSON.stringify(serverMessage)}`);
      } else if (e.type === 'test-next') {
        gotNextTest = true;
        resolve();
      }
    });

    // Support puppeteer (evaluateOnNewDocument) or playwright (addInitScript)
    await (page.evaluateOnNewDocument || page.addInitScript)(() => {
      const oldParent = window.parent;
      window.parent = {
        postMessage: e => {
          window.onPostMessageReceived && window.onPostMessageReceived(e);
          if (oldParent) {
            oldParent.postMessage(e);
          }
        }
      };
    });
    page.on('response', async response => {
      // 200 and 300 class status are most likely fine here
      if (response.url() === url && response.status() >= 400) {
        logResult(`[ERROR] Could not load from status: ${response.status()}`);
      }
    });
    page.on('console', msg => logResult(`[CONSOLE] ${msg.text()}`));
    page.on('error', message => {
      logResult(`[ERROR] ${message}`);
    });
    page.on('pageerror', message => {
      logResult(`[PAGE ERROR] ${message}`);
    });
    page.on('framenavigated', frame => {
      logResult(`[NAVIGATED] ${frame.url()}`);
    });

    // Run asynchronously
    (async () => {
      await sleep(bailTimout);
      if (!gotNextTest) {
        if (receivedPassFail) {
          resolve();
        } else {
          reject(new Error(`Did not get next-test message in ${bailTimout}ms`));
        }
      }
    })();
    logResult(`[URL] ${url}`);
    await page.goto(url, {
      timeout: majorTimeout
    });
    await promise;
    winston.debug('promise resolved');
    !page.isClosed() && (await page.close());
    winston.debug('page closed');

    // If we created a temporary browser, close it
    ownsBrowser && (await browser.close());
    winston.debug('browser closed');
  } catch (e) {
    page && !page.isClosed() && (await page.close());
    ownsBrowser && (await browser.close());
    throw new Error(`${e}\n${log}`);
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfIiwicmVxdWlyZSIsInNlbmRUZXN0UmVzdWx0IiwicHVwcGV0ZWVyIiwid2luc3RvbiIsInNsZWVwIiwibW9kdWxlIiwiZXhwb3J0cyIsInRlc3RJbmZvIiwib3B0aW9ucyIsImV4dGVuZCIsInNlcnZlciIsImJyb3dzZXJDcmVhdG9yIiwiYnJvd3NlciIsImxhdW5jaE9wdGlvbnMiLCJhcmdzIiwibWFqb3JUaW1lb3V0IiwiYmFpbFRpbW91dCIsInRlc3RJbmZvUXVlcnlQYXJhbSIsImVuY29kZVVSSUNvbXBvbmVudCIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0ZXN0Iiwic25hcHNob3ROYW1lIiwidGltZXN0YW1wIiwidXJsIiwiaW5jbHVkZXMiLCJvd25zQnJvd3NlciIsInBhZ2UiLCJsb2ciLCJsb2dSZXN1bHQiLCJtZXNzYWdlIiwiaW5mbyIsImxhdW5jaCIsIm5ld1BhZ2UiLCJzZXREZWZhdWx0TmF2aWdhdGlvblRpbWVvdXQiLCJyZWNlaXZlZFBhc3NGYWlsIiwiZ290TmV4dFRlc3QiLCJyZXNvbHZlIiwicmVqZWN0IiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXMiLCJyZWoiLCJleHBvc2VGdW5jdGlvbiIsImUiLCJwYXJzZSIsInR5cGUiLCJzZXJ2ZXJNZXNzYWdlIiwiZXZhbHVhdGVPbk5ld0RvY3VtZW50IiwiYWRkSW5pdFNjcmlwdCIsIm9sZFBhcmVudCIsIndpbmRvdyIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwib25Qb3N0TWVzc2FnZVJlY2VpdmVkIiwib24iLCJyZXNwb25zZSIsInN0YXR1cyIsIm1zZyIsInRleHQiLCJmcmFtZSIsIkVycm9yIiwiZ290byIsInRpbWVvdXQiLCJkZWJ1ZyIsImlzQ2xvc2VkIiwiY2xvc2UiXSwic291cmNlcyI6WyJydW5UZXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSdW5zIGEgQ1QgdGVzdFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuY29uc3QgXyA9IHJlcXVpcmUoICdsb2Rhc2gnICk7XHJcbmNvbnN0IHNlbmRUZXN0UmVzdWx0ID0gcmVxdWlyZSggJy4vc2VuZFRlc3RSZXN1bHQnICk7XHJcbmNvbnN0IHB1cHBldGVlciA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvbm9kZV9tb2R1bGVzL3B1cHBldGVlcicgKTtcclxuY29uc3Qgd2luc3RvbiA9IHJlcXVpcmUoICd3aW5zdG9uJyApO1xyXG5jb25zdCBzbGVlcCA9IHJlcXVpcmUoICcuLi8uLi8uLi9wZXJlbm5pYWwvanMvY29tbW9uL3NsZWVwJyApO1xyXG5cclxuLyoqXHJcbiAqIFJ1bnMgYSBDVCB0ZXN0XHJcbiAqIEBwdWJsaWNcclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IHRlc3RJbmZvXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICogQHJldHVybnMge1Byb21pc2V9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIGZ1bmN0aW9uKCB0ZXN0SW5mbywgb3B0aW9ucyApIHtcclxuICBvcHRpb25zID0gXy5leHRlbmQoIHtcclxuICAgIHNlcnZlcjogJ2h0dHBzOi8vc3Bhcmt5LmNvbG9yYWRvLmVkdScsIC8vIHtzdHJpbmd9IC0gVGhlIHNlcnZlciB0byB1c2VcclxuICAgIGJyb3dzZXJDcmVhdG9yOiBwdXBwZXRlZXIsXHJcbiAgICBicm93c2VyOiBudWxsLFxyXG5cclxuICAgIGxhdW5jaE9wdGlvbnM6IHtcclxuICAgICAgYXJnczogW1xyXG4gICAgICAgICctLWRpc2FibGUtZ3B1J1xyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfSwgb3B0aW9ucyApO1xyXG5cclxuICBjb25zdCBtYWpvclRpbWVvdXQgPSAyODAwMDA7XHJcbiAgY29uc3QgYmFpbFRpbW91dCA9IDQwMDAwMDtcclxuXHJcbiAgY29uc3QgdGVzdEluZm9RdWVyeVBhcmFtID0gYHRlc3RJbmZvPSR7ZW5jb2RlVVJJQ29tcG9uZW50KCBKU09OLnN0cmluZ2lmeSgge1xyXG4gICAgdGVzdDogdGVzdEluZm8udGVzdCxcclxuICAgIHNuYXBzaG90TmFtZTogdGVzdEluZm8uc25hcHNob3ROYW1lLFxyXG4gICAgdGltZXN0YW1wOiB0ZXN0SW5mby50aW1lc3RhbXBcclxuICB9ICkgKX1gO1xyXG5cclxuICBjb25zdCB1cmwgPSBgJHtvcHRpb25zLnNlcnZlcn0vY29udGludW91cy10ZXN0aW5nL2FxdWEvaHRtbC8ke3Rlc3RJbmZvLnVybH0ke3Rlc3RJbmZvLnVybC5pbmNsdWRlcyggJz8nICkgPyAnJicgOiAnPyd9JHt0ZXN0SW5mb1F1ZXJ5UGFyYW19YDtcclxuXHJcbiAgY29uc3Qgb3duc0Jyb3dzZXIgPSAhb3B0aW9ucy5icm93c2VyO1xyXG5cclxuICBsZXQgYnJvd3NlcjtcclxuICBsZXQgcGFnZTtcclxuICBsZXQgbG9nID0gJyc7XHJcblxyXG4gIC8vIEdldHMgaW5jbHVkZWQgaW4gYW55IGVycm9yL2ZhaWwgbWVzc2FnZXNcclxuICBjb25zdCBsb2dSZXN1bHQgPSBtZXNzYWdlID0+IHtcclxuICAgIHdpbnN0b24uaW5mbyggbWVzc2FnZSApO1xyXG4gICAgbG9nICs9IGAke21lc3NhZ2V9XFxuYDtcclxuICB9O1xyXG5cclxuICB0cnkge1xyXG4gICAgYnJvd3NlciA9IG9wdGlvbnMuYnJvd3NlciB8fCBhd2FpdCBvcHRpb25zLmJyb3dzZXJDcmVhdG9yLmxhdW5jaCggb3B0aW9ucy5sYXVuY2hPcHRpb25zICk7XHJcblxyXG4gICAgcGFnZSA9IGF3YWl0IGJyb3dzZXIubmV3UGFnZSgpO1xyXG4gICAgYXdhaXQgcGFnZS5zZXREZWZhdWx0TmF2aWdhdGlvblRpbWVvdXQoIG1ham9yVGltZW91dCApO1xyXG5cclxuICAgIC8vIFRPRE86IGhhdmUgcGVuZGluZ1Bhc3NGYWlsIHdoZW4gdGhlIHJlc3VsdCBpc24ndCBzZW50XHJcbiAgICBsZXQgcmVjZWl2ZWRQYXNzRmFpbCA9IGZhbHNlO1xyXG4gICAgbGV0IGdvdE5leHRUZXN0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcHJvbW90ZSBmb3IgdXNlIG91dHNpZGUgdGhlIGNsb3N1cmVcclxuICAgIGxldCByZXNvbHZlO1xyXG4gICAgbGV0IHJlamVjdDtcclxuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKCByZXMsIHJlaiApID0+IHtcclxuICAgICAgcmVzb2x2ZSA9IHJlcztcclxuICAgICAgcmVqZWN0ID0gcmVqO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERlZmluZSBhIHdpbmRvdy5vbk1lc3NhZ2VSZWNlaXZlZEV2ZW50IGZ1bmN0aW9uIG9uIHRoZSBwYWdlLlxyXG4gICAgYXdhaXQgcGFnZS5leHBvc2VGdW5jdGlvbiggJ29uUG9zdE1lc3NhZ2VSZWNlaXZlZCcsIGFzeW5jIGUgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGUgPSBKU09OLnBhcnNlKCBlICk7XHJcbiAgICAgIH1cclxuICAgICAgY2F0Y2goIGUgKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIGUudHlwZSA9PT0gJ3Rlc3QtcGFzcycgKSB7XHJcbiAgICAgICAgcmVjZWl2ZWRQYXNzRmFpbCA9IHRydWU7XHJcblxyXG4gICAgICAgIHdpbnN0b24uaW5mbyggJ1NlbmRpbmcgUEFTUyByZXN1bHQnICk7XHJcbiAgICAgICAgY29uc3Qgc2VydmVyTWVzc2FnZSA9IGF3YWl0IHNlbmRUZXN0UmVzdWx0KCBlLm1lc3NhZ2UsIHRlc3RJbmZvLCB0cnVlLCBvcHRpb25zICk7XHJcbiAgICAgICAgd2luc3Rvbi5pbmZvKCBgU2VydmVyIHJlY2VpcHQ6ICR7SlNPTi5zdHJpbmdpZnkoIHNlcnZlck1lc3NhZ2UgKX1gICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGUudHlwZSA9PT0gJ3Rlc3QtZmFpbCcgKSB7XHJcbiAgICAgICAgcmVjZWl2ZWRQYXNzRmFpbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB3aW5zdG9uLmluZm8oICdTZW5kaW5nIEZBSUwgcmVzdWx0JyApO1xyXG4gICAgICAgIGNvbnN0IHNlcnZlck1lc3NhZ2UgPSBhd2FpdCBzZW5kVGVzdFJlc3VsdCggYCR7ZS5tZXNzYWdlfVxcbiR7bG9nfWAsIHRlc3RJbmZvLCBmYWxzZSwgb3B0aW9ucyApO1xyXG4gICAgICAgIHdpbnN0b24uaW5mbyggYFNlcnZlciByZWNlaXB0OiAke0pTT04uc3RyaW5naWZ5KCBzZXJ2ZXJNZXNzYWdlICl9YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBlLnR5cGUgPT09ICd0ZXN0LW5leHQnICkge1xyXG4gICAgICAgIGdvdE5leHRUZXN0ID0gdHJ1ZTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTdXBwb3J0IHB1cHBldGVlciAoZXZhbHVhdGVPbk5ld0RvY3VtZW50KSBvciBwbGF5d3JpZ2h0IChhZGRJbml0U2NyaXB0KVxyXG4gICAgYXdhaXQgKCAoIHBhZ2UuZXZhbHVhdGVPbk5ld0RvY3VtZW50IHx8IHBhZ2UuYWRkSW5pdFNjcmlwdCApKCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG9sZFBhcmVudCA9IHdpbmRvdy5wYXJlbnQ7XHJcblxyXG4gICAgICB3aW5kb3cucGFyZW50ID0ge1xyXG4gICAgICAgIHBvc3RNZXNzYWdlOiBlID0+IHtcclxuICAgICAgICAgIHdpbmRvdy5vblBvc3RNZXNzYWdlUmVjZWl2ZWQgJiYgd2luZG93Lm9uUG9zdE1lc3NhZ2VSZWNlaXZlZCggZSApO1xyXG4gICAgICAgICAgaWYgKCBvbGRQYXJlbnQgKSB7XHJcbiAgICAgICAgICAgIG9sZFBhcmVudC5wb3N0TWVzc2FnZSggZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHBhZ2Uub24oICdyZXNwb25zZScsIGFzeW5jIHJlc3BvbnNlID0+IHtcclxuICAgICAgLy8gMjAwIGFuZCAzMDAgY2xhc3Mgc3RhdHVzIGFyZSBtb3N0IGxpa2VseSBmaW5lIGhlcmVcclxuICAgICAgaWYgKCByZXNwb25zZS51cmwoKSA9PT0gdXJsICYmIHJlc3BvbnNlLnN0YXR1cygpID49IDQwMCApIHtcclxuICAgICAgICBsb2dSZXN1bHQoIGBbRVJST1JdIENvdWxkIG5vdCBsb2FkIGZyb20gc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1cygpfWAgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgcGFnZS5vbiggJ2NvbnNvbGUnLCBtc2cgPT4gbG9nUmVzdWx0KCBgW0NPTlNPTEVdICR7bXNnLnRleHQoKX1gICkgKTtcclxuXHJcbiAgICBwYWdlLm9uKCAnZXJyb3InLCBtZXNzYWdlID0+IHtcclxuICAgICAgbG9nUmVzdWx0KCBgW0VSUk9SXSAke21lc3NhZ2V9YCApO1xyXG4gICAgfSApO1xyXG4gICAgcGFnZS5vbiggJ3BhZ2VlcnJvcicsIG1lc3NhZ2UgPT4ge1xyXG4gICAgICBsb2dSZXN1bHQoIGBbUEFHRSBFUlJPUl0gJHttZXNzYWdlfWAgKTtcclxuICAgIH0gKTtcclxuICAgIHBhZ2Uub24oICdmcmFtZW5hdmlnYXRlZCcsIGZyYW1lID0+IHtcclxuICAgICAgbG9nUmVzdWx0KCBgW05BVklHQVRFRF0gJHtmcmFtZS51cmwoKX1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUnVuIGFzeW5jaHJvbm91c2x5XHJcbiAgICAoIGFzeW5jICgpID0+IHtcclxuICAgICAgYXdhaXQgc2xlZXAoIGJhaWxUaW1vdXQgKTtcclxuICAgICAgaWYgKCAhZ290TmV4dFRlc3QgKSB7XHJcbiAgICAgICAgaWYgKCByZWNlaXZlZFBhc3NGYWlsICkge1xyXG4gICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHJlamVjdCggbmV3IEVycm9yKCBgRGlkIG5vdCBnZXQgbmV4dC10ZXN0IG1lc3NhZ2UgaW4gJHtiYWlsVGltb3V0fW1zYCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICkoKTtcclxuXHJcbiAgICBsb2dSZXN1bHQoIGBbVVJMXSAke3VybH1gICk7XHJcbiAgICBhd2FpdCBwYWdlLmdvdG8oIHVybCwge1xyXG4gICAgICB0aW1lb3V0OiBtYWpvclRpbWVvdXRcclxuICAgIH0gKTtcclxuICAgIGF3YWl0IHByb21pc2U7XHJcbiAgICB3aW5zdG9uLmRlYnVnKCAncHJvbWlzZSByZXNvbHZlZCcgKTtcclxuXHJcbiAgICAhcGFnZS5pc0Nsb3NlZCgpICYmIGF3YWl0IHBhZ2UuY2xvc2UoKTtcclxuICAgIHdpbnN0b24uZGVidWcoICdwYWdlIGNsb3NlZCcgKTtcclxuXHJcbiAgICAvLyBJZiB3ZSBjcmVhdGVkIGEgdGVtcG9yYXJ5IGJyb3dzZXIsIGNsb3NlIGl0XHJcbiAgICBvd25zQnJvd3NlciAmJiBhd2FpdCBicm93c2VyLmNsb3NlKCk7XHJcbiAgICB3aW5zdG9uLmRlYnVnKCAnYnJvd3NlciBjbG9zZWQnICk7XHJcbiAgfVxyXG5cclxuICBjYXRjaCggZSApIHtcclxuICAgIHBhZ2UgJiYgIXBhZ2UuaXNDbG9zZWQoKSAmJiBhd2FpdCBwYWdlLmNsb3NlKCk7XHJcbiAgICBvd25zQnJvd3NlciAmJiBhd2FpdCBicm93c2VyLmNsb3NlKCk7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoIGAke2V9XFxuJHtsb2d9YCApO1xyXG4gIH1cclxufTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1BLENBQUMsR0FBR0MsT0FBTyxDQUFFLFFBQVMsQ0FBQztBQUM3QixNQUFNQyxjQUFjLEdBQUdELE9BQU8sQ0FBRSxrQkFBbUIsQ0FBQztBQUNwRCxNQUFNRSxTQUFTLEdBQUdGLE9BQU8sQ0FBRSwyQ0FBNEMsQ0FBQztBQUN4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