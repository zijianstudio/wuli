// Copyright 2020-2022, University of Colorado Boulder

/**
 * Runs simulation tests in an iframe, and passes results to our parent frame (continuous-loop.html).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

(() => {
  const options = QueryStringMachine.getAll({
    url: {
      type: 'string',
      defaultValue: ''
    },
    duration: {
      type: 'number',
      defaultValue: 120000
    },
    // By default, if the load doesn't happen, we'll just skip the test
    failIfNoLoad: {
      type: 'flag'
    },
    simQueryParameters: {
      type: 'string',
      defaultValue: ''
    }
  });

  // Add those two to our query parameters, so we get load/error messages
  const iframe = aqua.createFrame();
  iframe.src = QueryStringMachine.appendQueryStringArray(options.url, [`?continuousTest=${encodeURIComponent(aqua.options.testInfo)}`, options.simQueryParameters]);
  const failPrefix = options.simQueryParameters ? `Query: ${options.simQueryParameters}\n` : '';
  let hasLoaded = false;
  const timeoutID = setTimeout(() => {
    if (hasLoaded) {
      aqua.simplePass(); // Only pass the 'run' if it loads AND doesn't error for the entire duration
    } else {
      if (options.failIfNoLoad) {
        aqua.simpleFail(`${failPrefix}did not load in ${options.duration}ms`);
      } else {
        aqua.simpleSkip();
      }
    }
  }, options.duration);
  const testInfo = JSON.parse(aqua.options.testInfo);

  // handling messages from sims
  window.addEventListener('message', async evt => {
    if (typeof evt.data !== 'string') {
      return;
    }
    const data = JSON.parse(evt.data);

    // Filter out any message that isn't directly from this test
    if (data.continuousTest && _.isEqual(testInfo, data.continuousTest)) {
      console.log(data.type);

      // Sent by Joist due to the postMessage* query parameters
      if (data.type === 'continuous-test-error') {
        clearTimeout(timeoutID);
        const transpiledStacktrace = await window.transpileStacktrace(data.stack);
        aqua.simpleFail(`${failPrefix + data.message}\n${transpiledStacktrace}`);
      } else if (data.type === 'continuous-test-unload') {
        clearTimeout(timeoutID);
        aqua.simpleFail(`${failPrefix}Unloaded frame before complete, window.location probably changed`);
      } else if (data.type === 'continuous-test-load') {
        hasLoaded = true;
      } else if (data.type === 'continuous-test-pass') {
        clearTimeout(timeoutID);
        aqua.simplePass();
      }
    }
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25zIiwiUXVlcnlTdHJpbmdNYWNoaW5lIiwiZ2V0QWxsIiwidXJsIiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImR1cmF0aW9uIiwiZmFpbElmTm9Mb2FkIiwic2ltUXVlcnlQYXJhbWV0ZXJzIiwiaWZyYW1lIiwiYXF1YSIsImNyZWF0ZUZyYW1lIiwic3JjIiwiYXBwZW5kUXVlcnlTdHJpbmdBcnJheSIsImVuY29kZVVSSUNvbXBvbmVudCIsInRlc3RJbmZvIiwiZmFpbFByZWZpeCIsImhhc0xvYWRlZCIsInRpbWVvdXRJRCIsInNldFRpbWVvdXQiLCJzaW1wbGVQYXNzIiwic2ltcGxlRmFpbCIsInNpbXBsZVNraXAiLCJKU09OIiwicGFyc2UiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiZXZ0IiwiZGF0YSIsImNvbnRpbnVvdXNUZXN0IiwiXyIsImlzRXF1YWwiLCJjb25zb2xlIiwibG9nIiwiY2xlYXJUaW1lb3V0IiwidHJhbnNwaWxlZFN0YWNrdHJhY2UiLCJ0cmFuc3BpbGVTdGFja3RyYWNlIiwic3RhY2siLCJtZXNzYWdlIl0sInNvdXJjZXMiOlsic2ltLXRlc3QuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUnVucyBzaW11bGF0aW9uIHRlc3RzIGluIGFuIGlmcmFtZSwgYW5kIHBhc3NlcyByZXN1bHRzIHRvIG91ciBwYXJlbnQgZnJhbWUgKGNvbnRpbnVvdXMtbG9vcC5odG1sKS5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbiggKCkgPT4ge1xyXG4gIGNvbnN0IG9wdGlvbnMgPSBRdWVyeVN0cmluZ01hY2hpbmUuZ2V0QWxsKCB7XHJcbiAgICB1cmw6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogJydcclxuICAgIH0sXHJcbiAgICBkdXJhdGlvbjoge1xyXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgZGVmYXVsdFZhbHVlOiAxMjAwMDBcclxuICAgIH0sXHJcblxyXG4gICAgLy8gQnkgZGVmYXVsdCwgaWYgdGhlIGxvYWQgZG9lc24ndCBoYXBwZW4sIHdlJ2xsIGp1c3Qgc2tpcCB0aGUgdGVzdFxyXG4gICAgZmFpbElmTm9Mb2FkOiB7XHJcbiAgICAgIHR5cGU6ICdmbGFnJ1xyXG4gICAgfSxcclxuXHJcbiAgICBzaW1RdWVyeVBhcmFtZXRlcnM6IHtcclxuICAgICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICAgIGRlZmF1bHRWYWx1ZTogJydcclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIC8vIEFkZCB0aG9zZSB0d28gdG8gb3VyIHF1ZXJ5IHBhcmFtZXRlcnMsIHNvIHdlIGdldCBsb2FkL2Vycm9yIG1lc3NhZ2VzXHJcbiAgY29uc3QgaWZyYW1lID0gYXF1YS5jcmVhdGVGcmFtZSgpO1xyXG4gIGlmcmFtZS5zcmMgPSBRdWVyeVN0cmluZ01hY2hpbmUuYXBwZW5kUXVlcnlTdHJpbmdBcnJheSggb3B0aW9ucy51cmwsIFtcclxuICAgIGA/Y29udGludW91c1Rlc3Q9JHtlbmNvZGVVUklDb21wb25lbnQoIGFxdWEub3B0aW9ucy50ZXN0SW5mbyApfWAsXHJcbiAgICBvcHRpb25zLnNpbVF1ZXJ5UGFyYW1ldGVyc1xyXG4gIF0gKTtcclxuXHJcbiAgY29uc3QgZmFpbFByZWZpeCA9ICggb3B0aW9ucy5zaW1RdWVyeVBhcmFtZXRlcnMgPyAoIGBRdWVyeTogJHtvcHRpb25zLnNpbVF1ZXJ5UGFyYW1ldGVyc31cXG5gICkgOiAnJyApO1xyXG5cclxuICBsZXQgaGFzTG9hZGVkID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0IHRpbWVvdXRJRCA9IHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgIGlmICggaGFzTG9hZGVkICkge1xyXG4gICAgICBhcXVhLnNpbXBsZVBhc3MoKTsgLy8gT25seSBwYXNzIHRoZSAncnVuJyBpZiBpdCBsb2FkcyBBTkQgZG9lc24ndCBlcnJvciBmb3IgdGhlIGVudGlyZSBkdXJhdGlvblxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGlmICggb3B0aW9ucy5mYWlsSWZOb0xvYWQgKSB7XHJcbiAgICAgICAgYXF1YS5zaW1wbGVGYWlsKCBgJHtmYWlsUHJlZml4fWRpZCBub3QgbG9hZCBpbiAke29wdGlvbnMuZHVyYXRpb259bXNgICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXF1YS5zaW1wbGVTa2lwKCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LCBvcHRpb25zLmR1cmF0aW9uICk7XHJcblxyXG4gIGNvbnN0IHRlc3RJbmZvID0gSlNPTi5wYXJzZSggYXF1YS5vcHRpb25zLnRlc3RJbmZvICk7XHJcblxyXG4gIC8vIGhhbmRsaW5nIG1lc3NhZ2VzIGZyb20gc2ltc1xyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbWVzc2FnZScsIGFzeW5jIGV2dCA9PiB7XHJcbiAgICBpZiAoIHR5cGVvZiBldnQuZGF0YSAhPT0gJ3N0cmluZycgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKCBldnQuZGF0YSApO1xyXG5cclxuICAgIC8vIEZpbHRlciBvdXQgYW55IG1lc3NhZ2UgdGhhdCBpc24ndCBkaXJlY3RseSBmcm9tIHRoaXMgdGVzdFxyXG4gICAgaWYgKCBkYXRhLmNvbnRpbnVvdXNUZXN0ICYmIF8uaXNFcXVhbCggdGVzdEluZm8sIGRhdGEuY29udGludW91c1Rlc3QgKSApIHtcclxuICAgICAgY29uc29sZS5sb2coIGRhdGEudHlwZSApO1xyXG5cclxuICAgICAgLy8gU2VudCBieSBKb2lzdCBkdWUgdG8gdGhlIHBvc3RNZXNzYWdlKiBxdWVyeSBwYXJhbWV0ZXJzXHJcbiAgICAgIGlmICggZGF0YS50eXBlID09PSAnY29udGludW91cy10ZXN0LWVycm9yJyApIHtcclxuICAgICAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXRJRCApO1xyXG4gICAgICAgIGNvbnN0IHRyYW5zcGlsZWRTdGFja3RyYWNlID0gYXdhaXQgd2luZG93LnRyYW5zcGlsZVN0YWNrdHJhY2UoIGRhdGEuc3RhY2sgKTtcclxuICAgICAgICBhcXVhLnNpbXBsZUZhaWwoIGAke2ZhaWxQcmVmaXggKyBkYXRhLm1lc3NhZ2V9XFxuJHt0cmFuc3BpbGVkU3RhY2t0cmFjZX1gICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGRhdGEudHlwZSA9PT0gJ2NvbnRpbnVvdXMtdGVzdC11bmxvYWQnICkge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCggdGltZW91dElEICk7XHJcbiAgICAgICAgYXF1YS5zaW1wbGVGYWlsKCBgJHtmYWlsUHJlZml4fVVubG9hZGVkIGZyYW1lIGJlZm9yZSBjb21wbGV0ZSwgd2luZG93LmxvY2F0aW9uIHByb2JhYmx5IGNoYW5nZWRgICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGRhdGEudHlwZSA9PT0gJ2NvbnRpbnVvdXMtdGVzdC1sb2FkJyApIHtcclxuICAgICAgICBoYXNMb2FkZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBkYXRhLnR5cGUgPT09ICdjb250aW51b3VzLXRlc3QtcGFzcycgKSB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0SUQgKTtcclxuICAgICAgICBhcXVhLnNpbXBsZVBhc3MoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0gKTtcclxufSApKCk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFFLE1BQU07RUFDTixNQUFNQSxPQUFPLEdBQUdDLGtCQUFrQixDQUFDQyxNQUFNLENBQUU7SUFDekNDLEdBQUcsRUFBRTtNQUNIQyxJQUFJLEVBQUUsUUFBUTtNQUNkQyxZ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