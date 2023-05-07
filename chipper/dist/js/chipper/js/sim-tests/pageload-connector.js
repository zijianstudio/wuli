// Copyright 2022, University of Colorado Boulder

/**
 * Reports a (delayed) page load (or error) to the parent frame for Aqua continuous testing.
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

(function () {
  let hasErrored = false;
  window.addEventListener('error', data => {
    if (!hasErrored) {
      hasErrored = true;
      let message = '';
      let stack = '';
      if (data && data.message) {
        message = data.message;
      }
      if (data && data.error && data.error.stack) {
        stack = data.error.stack;
      }
      window.parent !== window && window.parent.postMessage(JSON.stringify({
        type: 'pageload-error',
        url: window.location.href,
        message: message,
        stack: stack
      }), '*');
      console.log('error');
    }
  });
  window.addEventListener('load', event => {
    // Wait 4 seconds before reporting load, to see if it errors first
    setTimeout(() => {
      if (!hasErrored) {
        window.parent !== window && window.parent.postMessage(JSON.stringify({
          type: 'pageload-load',
          url: window.location.href
        }), '*');
        console.log('load');
      }
    }, 4000);
  }, false);
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJoYXNFcnJvcmVkIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGEiLCJtZXNzYWdlIiwic3RhY2siLCJlcnJvciIsInBhcmVudCIsInBvc3RNZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsInR5cGUiLCJ1cmwiLCJsb2NhdGlvbiIsImhyZWYiLCJjb25zb2xlIiwibG9nIiwiZXZlbnQiLCJzZXRUaW1lb3V0Il0sInNvdXJjZXMiOlsicGFnZWxvYWQtY29ubmVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXBvcnRzIGEgKGRlbGF5ZWQpIHBhZ2UgbG9hZCAob3IgZXJyb3IpIHRvIHRoZSBwYXJlbnQgZnJhbWUgZm9yIEFxdWEgY29udGludW91cyB0ZXN0aW5nLlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuXHJcbiggZnVuY3Rpb24oKSB7XHJcblxyXG4gIGxldCBoYXNFcnJvcmVkID0gZmFsc2U7XHJcblxyXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCBkYXRhID0+IHtcclxuICAgIGlmICggIWhhc0Vycm9yZWQgKSB7XHJcbiAgICAgIGhhc0Vycm9yZWQgPSB0cnVlO1xyXG5cclxuICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcclxuICAgICAgbGV0IHN0YWNrID0gJyc7XHJcbiAgICAgIGlmICggZGF0YSAmJiBkYXRhLm1lc3NhZ2UgKSB7XHJcbiAgICAgICAgbWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGRhdGEgJiYgZGF0YS5lcnJvciAmJiBkYXRhLmVycm9yLnN0YWNrICkge1xyXG4gICAgICAgIHN0YWNrID0gZGF0YS5lcnJvci5zdGFjaztcclxuICAgICAgfVxyXG4gICAgICAoIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdyApICYmIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7XHJcbiAgICAgICAgdHlwZTogJ3BhZ2Vsb2FkLWVycm9yJyxcclxuICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxyXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgc3RhY2s6IHN0YWNrXHJcbiAgICAgIH0gKSwgJyonICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCAnZXJyb3InICk7XHJcbiAgICB9XHJcbiAgfSApO1xyXG5cclxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCBldmVudCA9PiB7XHJcbiAgICAvLyBXYWl0IDQgc2Vjb25kcyBiZWZvcmUgcmVwb3J0aW5nIGxvYWQsIHRvIHNlZSBpZiBpdCBlcnJvcnMgZmlyc3RcclxuICAgIHNldFRpbWVvdXQoICgpID0+IHtcclxuICAgICAgaWYgKCAhaGFzRXJyb3JlZCApIHtcclxuICAgICAgICAoIHdpbmRvdy5wYXJlbnQgIT09IHdpbmRvdyApICYmIHdpbmRvdy5wYXJlbnQucG9zdE1lc3NhZ2UoIEpTT04uc3RyaW5naWZ5KCB7XHJcbiAgICAgICAgICB0eXBlOiAncGFnZWxvYWQtbG9hZCcsXHJcbiAgICAgICAgICB1cmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmXHJcbiAgICAgICAgfSApLCAnKicgKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coICdsb2FkJyApO1xyXG4gICAgICB9XHJcbiAgICB9LCA0MDAwICk7XHJcbiAgfSwgZmFsc2UgKTtcclxufSApKCk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsQ0FBRSxZQUFXO0VBRVgsSUFBSUEsVUFBVSxHQUFHLEtBQUs7RUFFdEJDLE1BQU0sQ0FBQ0MsZ0JBQWdCLENBQUUsT0FBTyxFQUFFQyxJQUFJLElBQUk7SUFDeEMsSUFBSyxDQUFDSCxVQUFVLEVBQUc7TUFDakJBLFVBQVUsR0FBRyxJQUFJO01BRWpCLElBQUlJLE9BQU8sR0FBRyxFQUFFO01BQ2hCLElBQUlDLEtBQUssR0FBRyxFQUFFO01BQ2QsSUFBS0YsSUFBSSxJQUFJQSxJQUFJLENBQUNDLE9BQU8sRUFBRztRQUMxQkEsT0FBTyxHQUFHRCxJQUFJLENBQUNDLE9BQU87TUFDeEI7TUFDQSxJQUFLRCxJQUFJLElBQUlBLElBQUksQ0FBQ0csS0FBSyxJQUFJSCxJQUFJLENBQUNHLEtBQUssQ0FBQ0QsS0FBSyxFQUFHO1FBQzVDQSxLQUFLLEdBQUdGLElBQUksQ0FBQ0csS0FBSyxDQUFDRCxLQUFLO01BQzFCO01BQ0VKLE1BQU0sQ0FBQ00sTUFBTSxLQUFLTixNQUFNLElBQU1BLE1BQU0sQ0FBQ00sTUFBTSxDQUFDQyxXQUFXLENBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFFO1FBQ3pFQyxJQUFJLEVBQUUsZ0JBQWdCO1FBQ3RCQyxHQUFHLEVBQUVYLE1BQU0sQ0FBQ1ksUUFBUSxDQUFDQyxJQUFJO1FBQ3pCVixPQUFPLEVBQUVBLE9BQU87UUFDaEJDLEtBQUssRUFBRUE7TUFDVCxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7TUFDVlUsT0FBTyxDQUFDQyxHQUFHLENBQUUsT0FBUSxDQUFDO0lBQ3hCO0VBQ0YsQ0FBRSxDQUFDO0VBRUhmLE1BQU0sQ0FBQ0MsZ0JBQWdCLENBQUUsTUFBTSxFQUFFZSxLQUFLLElBQUk7SUFDeEM7SUFDQUMsVUFBVSxDQUFFLE1BQU07TUFDaEIsSUFBSyxDQUFDbEIsVUFBVSxFQUFHO1FBQ2ZDLE1BQU0sQ0FBQ00sTUFBTSxLQUFLTixNQUFNLElBQU1BLE1BQU0sQ0FBQ00sTUFBTSxDQUFDQyxXQUFXLENBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFFO1VBQ3pFQyxJQUFJLEVBQUUsZUFBZTtVQUNyQkMsR0FBRyxFQUFFWCxNQUFNLENBQUNZLFFBQVEsQ0FBQ0M7UUFDdkIsQ0FBRSxDQUFDLEVBQUUsR0FBSSxDQUFDO1FBRVZDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFFLE1BQU8sQ0FBQztNQUN2QjtJQUNGLENBQUMsRUFBRSxJQUFLLENBQUM7RUFDWCxDQUFDLEVBQUUsS0FBTSxDQUFDO0FBQ1osQ0FBQyxFQUFHLENBQUMifQ==