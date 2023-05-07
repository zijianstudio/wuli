// Copyright 2020-2021, University of Colorado Boulder

/*
 * Common functions used to communicate from test wrappers to continuous-loop.html (assumed to be the parent frame).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

(() => {
  const aquaOptions = QueryStringMachine.getAll({
    testInfo: {
      type: 'string',
      defaultValue: '{}'
    },
    width: {
      type: 'number',
      defaultValue: 512
    },
    height: {
      type: 'number',
      defaultValue: 384
    }
  });
  let sentMessage = false;
  let iframe = null;
  window.aqua = {
    // @public {Object}
    options: aquaOptions,
    /**
     * Creates an iframe, adds it to the body, and returns it
     * @public
     *
     * @returns {HTMLIFrameElement}
     */
    createFrame: function () {
      iframe = document.createElement('iframe');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('seamless', '1');
      iframe.setAttribute('width', `${aquaOptions.width}`);
      iframe.setAttribute('height', `${aquaOptions.height}`);
      document.body.appendChild(iframe);
      return iframe;
    },
    /**
     * Moves to the next test, clearing out the iframe.
     * @public
     */
    simpleFinish: function () {
      if (iframe) {
        iframe.src = 'about:blank';
      }
      aqua.nextTest();
    },
    /**
     * Records a pass for a pass/skip/fail test.
     * @public
     *
     * @param {string} [message]
     */
    simplePass: function (message) {
      if (sentMessage) {
        return;
      }
      sentMessage = true;
      aqua.testPass(message);
      aqua.simpleFinish();
    },
    /**
     * Records a skip for a pass/skip/fail test.
     * @public
     */
    simpleSkip: function () {
      if (sentMessage) {
        return;
      }
      sentMessage = true;
      aqua.simpleFinish();
    },
    /**
     * Records a fail for a pass/skip/fail test.
     * @public
     *
     * @param {string} message
     */
    simpleFail: function (message) {
      if (sentMessage) {
        return;
      }
      sentMessage = true;
      aqua.testFail((iframe ? `${iframe.src}\n` : '') + message);
      aqua.simpleFinish();
    },
    /**
     * Sends a post message.
     * @private
     *
     * @param {Object} message
     */
    sendMessage: function (message) {
      window.parent !== window && window.parent.postMessage(JSON.stringify(message), '*');
    },
    /**
     * Sends a test pass.
     * @public
     *
     * @param {string|undefined} message
     */
    testPass: function (message) {
      aqua.sendMessage({
        type: 'test-pass',
        message: message,
        testInfo: JSON.parse(aquaOptions.testInfo)
      });
      console.log(`[PASS] ${message}`);
    },
    /**
     * Sends a test failure.
     * @public
     *
     * @param {string|undefined} message
     */
    testFail: function (message) {
      // Don't send timeouts as failures, since it doesn't usually indicate an underlying problem
      if (message.indexOf('errors.html#timeout') < 0) {
        aqua.sendMessage({
          type: 'test-fail',
          message: message,
          testInfo: JSON.parse(aquaOptions.testInfo)
        });
      }
      console.log(`[FAIL] ${message}`);
    },
    /**
     * Sends a request to move to the next test
     * @public
     */
    nextTest: function () {
      aqua.sendMessage({
        type: 'test-next'
      });
      console.log('[NEXT TEST]');
    }
  };
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcXVhT3B0aW9ucyIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImdldEFsbCIsInRlc3RJbmZvIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsIndpZHRoIiwiaGVpZ2h0Iiwic2VudE1lc3NhZ2UiLCJpZnJhbWUiLCJ3aW5kb3ciLCJhcXVhIiwib3B0aW9ucyIsImNyZWF0ZUZyYW1lIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwic2V0QXR0cmlidXRlIiwiYm9keSIsImFwcGVuZENoaWxkIiwic2ltcGxlRmluaXNoIiwic3JjIiwibmV4dFRlc3QiLCJzaW1wbGVQYXNzIiwibWVzc2FnZSIsInRlc3RQYXNzIiwic2ltcGxlU2tpcCIsInNpbXBsZUZhaWwiLCJ0ZXN0RmFpbCIsInNlbmRNZXNzYWdlIiwicGFyZW50IiwicG9zdE1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwicGFyc2UiLCJjb25zb2xlIiwibG9nIiwiaW5kZXhPZiJdLCJzb3VyY2VzIjpbImNsaWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qXHJcbiAqIENvbW1vbiBmdW5jdGlvbnMgdXNlZCB0byBjb21tdW5pY2F0ZSBmcm9tIHRlc3Qgd3JhcHBlcnMgdG8gY29udGludW91cy1sb29wLmh0bWwgKGFzc3VtZWQgdG8gYmUgdGhlIHBhcmVudCBmcmFtZSkuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5cclxuKCAoKSA9PiB7XHJcbiAgY29uc3QgYXF1YU9wdGlvbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcbiAgICB0ZXN0SW5mbzoge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAne30nXHJcbiAgICB9LFxyXG4gICAgd2lkdGg6IHtcclxuICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogNTEyXHJcbiAgICB9LFxyXG4gICAgaGVpZ2h0OiB7XHJcbiAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICBkZWZhdWx0VmFsdWU6IDM4NFxyXG4gICAgfVxyXG4gIH0gKTtcclxuXHJcbiAgbGV0IHNlbnRNZXNzYWdlID0gZmFsc2U7XHJcbiAgbGV0IGlmcmFtZSA9IG51bGw7XHJcblxyXG4gIHdpbmRvdy5hcXVhID0ge1xyXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0fVxyXG4gICAgb3B0aW9uczogYXF1YU9wdGlvbnMsXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIGlmcmFtZSwgYWRkcyBpdCB0byB0aGUgYm9keSwgYW5kIHJldHVybnMgaXRcclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7SFRNTElGcmFtZUVsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIGNyZWF0ZUZyYW1lOiBmdW5jdGlvbigpIHtcclxuICAgICAgaWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lmcmFtZScgKTtcclxuICAgICAgaWZyYW1lLnNldEF0dHJpYnV0ZSggJ2ZyYW1lYm9yZGVyJywgJzAnICk7XHJcbiAgICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoICdzZWFtbGVzcycsICcxJyApO1xyXG4gICAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCBgJHthcXVhT3B0aW9ucy53aWR0aH1gICk7XHJcbiAgICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoICdoZWlnaHQnLCBgJHthcXVhT3B0aW9ucy5oZWlnaHR9YCApO1xyXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBpZnJhbWUgKTtcclxuICAgICAgcmV0dXJuIGlmcmFtZTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNb3ZlcyB0byB0aGUgbmV4dCB0ZXN0LCBjbGVhcmluZyBvdXQgdGhlIGlmcmFtZS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqL1xyXG4gICAgc2ltcGxlRmluaXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCBpZnJhbWUgKSB7XHJcbiAgICAgICAgaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XHJcbiAgICAgIH1cclxuICAgICAgYXF1YS5uZXh0VGVzdCgpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlY29yZHMgYSBwYXNzIGZvciBhIHBhc3Mvc2tpcC9mYWlsIHRlc3QuXHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXVxyXG4gICAgICovXHJcbiAgICBzaW1wbGVQYXNzOiBmdW5jdGlvbiggbWVzc2FnZSApIHtcclxuICAgICAgaWYgKCBzZW50TWVzc2FnZSApIHsgcmV0dXJuOyB9XHJcbiAgICAgIHNlbnRNZXNzYWdlID0gdHJ1ZTtcclxuXHJcbiAgICAgIGFxdWEudGVzdFBhc3MoIG1lc3NhZ2UgKTtcclxuICAgICAgYXF1YS5zaW1wbGVGaW5pc2goKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWNvcmRzIGEgc2tpcCBmb3IgYSBwYXNzL3NraXAvZmFpbCB0ZXN0LlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICovXHJcbiAgICBzaW1wbGVTa2lwOiBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCBzZW50TWVzc2FnZSApIHsgcmV0dXJuOyB9XHJcbiAgICAgIHNlbnRNZXNzYWdlID0gdHJ1ZTtcclxuXHJcbiAgICAgIGFxdWEuc2ltcGxlRmluaXNoKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVjb3JkcyBhIGZhaWwgZm9yIGEgcGFzcy9za2lwL2ZhaWwgdGVzdC5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZVxyXG4gICAgICovXHJcbiAgICBzaW1wbGVGYWlsOiBmdW5jdGlvbiggbWVzc2FnZSApIHtcclxuICAgICAgaWYgKCBzZW50TWVzc2FnZSApIHsgcmV0dXJuOyB9XHJcbiAgICAgIHNlbnRNZXNzYWdlID0gdHJ1ZTtcclxuXHJcbiAgICAgIGFxdWEudGVzdEZhaWwoICggaWZyYW1lID8gYCR7aWZyYW1lLnNyY31cXG5gIDogJycgKSArIG1lc3NhZ2UgKTtcclxuICAgICAgYXF1YS5zaW1wbGVGaW5pc2goKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhIHBvc3QgbWVzc2FnZS5cclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1lc3NhZ2VcclxuICAgICAqL1xyXG4gICAgc2VuZE1lc3NhZ2U6IGZ1bmN0aW9uKCBtZXNzYWdlICkge1xyXG4gICAgICAoIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdyApICYmIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCBtZXNzYWdlICksICcqJyApO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbmRzIGEgdGVzdCBwYXNzLlxyXG4gICAgICogQHB1YmxpY1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfHVuZGVmaW5lZH0gbWVzc2FnZVxyXG4gICAgICovXHJcbiAgICB0ZXN0UGFzczogZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XHJcbiAgICAgIGFxdWEuc2VuZE1lc3NhZ2UoIHtcclxuICAgICAgICB0eXBlOiAndGVzdC1wYXNzJyxcclxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgIHRlc3RJbmZvOiBKU09OLnBhcnNlKCBhcXVhT3B0aW9ucy50ZXN0SW5mbyApXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc29sZS5sb2coIGBbUEFTU10gJHttZXNzYWdlfWAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhIHRlc3QgZmFpbHVyZS5cclxuICAgICAqIEBwdWJsaWNcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IG1lc3NhZ2VcclxuICAgICAqL1xyXG4gICAgdGVzdEZhaWw6IGZ1bmN0aW9uKCBtZXNzYWdlICkge1xyXG4gICAgICAvLyBEb24ndCBzZW5kIHRpbWVvdXRzIGFzIGZhaWx1cmVzLCBzaW5jZSBpdCBkb2Vzbid0IHVzdWFsbHkgaW5kaWNhdGUgYW4gdW5kZXJseWluZyBwcm9ibGVtXHJcbiAgICAgIGlmICggbWVzc2FnZS5pbmRleE9mKCAnZXJyb3JzLmh0bWwjdGltZW91dCcgKSA8IDAgKSB7XHJcbiAgICAgICAgYXF1YS5zZW5kTWVzc2FnZSgge1xyXG4gICAgICAgICAgdHlwZTogJ3Rlc3QtZmFpbCcsXHJcbiAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxyXG4gICAgICAgICAgdGVzdEluZm86IEpTT04ucGFyc2UoIGFxdWFPcHRpb25zLnRlc3RJbmZvIClcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc29sZS5sb2coIGBbRkFJTF0gJHttZXNzYWdlfWAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZW5kcyBhIHJlcXVlc3QgdG8gbW92ZSB0byB0aGUgbmV4dCB0ZXN0XHJcbiAgICAgKiBAcHVibGljXHJcbiAgICAgKi9cclxuICAgIG5leHRUZXN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgYXF1YS5zZW5kTWVzc2FnZSgge1xyXG4gICAgICAgIHR5cGU6ICd0ZXN0LW5leHQnXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc29sZS5sb2coICdbTkVYVCBURVNUXScgKTtcclxuICAgIH1cclxuICB9O1xyXG59ICkoKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLENBQUUsTUFBTTtFQUNOLE1B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