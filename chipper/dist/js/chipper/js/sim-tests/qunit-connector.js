// Copyright 2020-2021, University of Colorado Boulder

/**
 * When running unit tests in an iframe, connects to the parent frame to give results.
 * @author Sam Reid (PhET Interactive Simulations)
 */
(function () {
  // By default, QUnit runs tests when load event is triggered on the window. If you’re loading tests asynchronously,
  // you can set this property to false, then call QUnit.start() once everything is loaded.
  // See https://api.qunitjs.com/config/QUnit.config
  QUnit.config.autostart = false;
  QUnit.log(details => {
    window.parent !== window && window.parent.postMessage(JSON.stringify({
      type: 'qunit-test',
      main: details.module,
      // TODO: what is this for? (https://github.com/phetsims/aqua/issues/81)
      result: details.result,
      module: details.module,
      name: details.name,
      message: details.message,
      // TODO: consider expected/actual, or don't worry because we'll run finer tests once it fails. (https://github.com/phetsims/aqua/issues/81)
      source: details.source
    }), '*');
  });
  QUnit.on('runEnd', data => {
    window.parent !== window && window.parent.postMessage(JSON.stringify({
      type: 'qunit-done',
      failed: data.testCounts.failed,
      passed: data.testCounts.passed,
      total: data.testCounts.total
    }), '*');
  });
  window.addEventListener('error', a => {
    let message = '';
    let stack = '';
    if (a && a.message) {
      message = a.message;
    }
    if (a && a.error && a.error.stack) {
      stack = a.error.stack;
    }
    window.parent !== window && window.parent.postMessage(JSON.stringify({
      type: 'error',
      message: message,
      stack: stack
    }), '*');
  });
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRVW5pdCIsImNvbmZpZyIsImF1dG9zdGFydCIsImxvZyIsImRldGFpbHMiLCJ3aW5kb3ciLCJwYXJlbnQiLCJwb3N0TWVzc2FnZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0eXBlIiwibWFpbiIsIm1vZHVsZSIsInJlc3VsdCIsIm5hbWUiLCJtZXNzYWdlIiwic291cmNlIiwib24iLCJkYXRhIiwiZmFpbGVkIiwidGVzdENvdW50cyIsInBhc3NlZCIsInRvdGFsIiwiYWRkRXZlbnRMaXN0ZW5lciIsImEiLCJzdGFjayIsImVycm9yIl0sInNvdXJjZXMiOlsicXVuaXQtY29ubmVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuXHJcbi8qKlxyXG4gKiBXaGVuIHJ1bm5pbmcgdW5pdCB0ZXN0cyBpbiBhbiBpZnJhbWUsIGNvbm5lY3RzIHRvIHRoZSBwYXJlbnQgZnJhbWUgdG8gZ2l2ZSByZXN1bHRzLlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuKCBmdW5jdGlvbigpIHtcclxuXHJcbiAgLy8gQnkgZGVmYXVsdCwgUVVuaXQgcnVucyB0ZXN0cyB3aGVuIGxvYWQgZXZlbnQgaXMgdHJpZ2dlcmVkIG9uIHRoZSB3aW5kb3cuIElmIHlvdeKAmXJlIGxvYWRpbmcgdGVzdHMgYXN5bmNocm9ub3VzbHksXHJcbiAgLy8geW91IGNhbiBzZXQgdGhpcyBwcm9wZXJ0eSB0byBmYWxzZSwgdGhlbiBjYWxsIFFVbml0LnN0YXJ0KCkgb25jZSBldmVyeXRoaW5nIGlzIGxvYWRlZC5cclxuICAvLyBTZWUgaHR0cHM6Ly9hcGkucXVuaXRqcy5jb20vY29uZmlnL1FVbml0LmNvbmZpZ1xyXG4gIFFVbml0LmNvbmZpZy5hdXRvc3RhcnQgPSBmYWxzZTtcclxuXHJcbiAgUVVuaXQubG9nKCBkZXRhaWxzID0+IHtcclxuICAgICggd2luZG93LnBhcmVudCAhPT0gd2luZG93ICkgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtcclxuICAgICAgdHlwZTogJ3F1bml0LXRlc3QnLFxyXG4gICAgICBtYWluOiBkZXRhaWxzLm1vZHVsZSwgLy8gVE9ETzogd2hhdCBpcyB0aGlzIGZvcj8gKGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcXVhL2lzc3Vlcy84MSlcclxuICAgICAgcmVzdWx0OiBkZXRhaWxzLnJlc3VsdCxcclxuICAgICAgbW9kdWxlOiBkZXRhaWxzLm1vZHVsZSxcclxuICAgICAgbmFtZTogZGV0YWlscy5uYW1lLFxyXG4gICAgICBtZXNzYWdlOiBkZXRhaWxzLm1lc3NhZ2UsXHJcblxyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciBleHBlY3RlZC9hY3R1YWwsIG9yIGRvbid0IHdvcnJ5IGJlY2F1c2Ugd2UnbGwgcnVuIGZpbmVyIHRlc3RzIG9uY2UgaXQgZmFpbHMuIChodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXF1YS9pc3N1ZXMvODEpXHJcbiAgICAgIHNvdXJjZTogZGV0YWlscy5zb3VyY2VcclxuICAgIH0gKSwgJyonICk7XHJcbiAgfSApO1xyXG5cclxuICBRVW5pdC5vbiggJ3J1bkVuZCcsIGRhdGEgPT4ge1xyXG4gICAgKCB3aW5kb3cucGFyZW50ICE9PSB3aW5kb3cgKSAmJiB3aW5kb3cucGFyZW50LnBvc3RNZXNzYWdlKCBKU09OLnN0cmluZ2lmeSgge1xyXG4gICAgICB0eXBlOiAncXVuaXQtZG9uZScsXHJcbiAgICAgIGZhaWxlZDogZGF0YS50ZXN0Q291bnRzLmZhaWxlZCxcclxuICAgICAgcGFzc2VkOiBkYXRhLnRlc3RDb3VudHMucGFzc2VkLFxyXG4gICAgICB0b3RhbDogZGF0YS50ZXN0Q291bnRzLnRvdGFsXHJcbiAgICB9ICksICcqJyApO1xyXG4gIH0gKTtcclxuXHJcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIGEgPT4ge1xyXG4gICAgbGV0IG1lc3NhZ2UgPSAnJztcclxuICAgIGxldCBzdGFjayA9ICcnO1xyXG4gICAgaWYgKCBhICYmIGEubWVzc2FnZSApIHtcclxuICAgICAgbWVzc2FnZSA9IGEubWVzc2FnZTtcclxuICAgIH1cclxuICAgIGlmICggYSAmJiBhLmVycm9yICYmIGEuZXJyb3Iuc3RhY2sgKSB7XHJcbiAgICAgIHN0YWNrID0gYS5lcnJvci5zdGFjaztcclxuICAgIH1cclxuICAgICggd2luZG93LnBhcmVudCAhPT0gd2luZG93ICkgJiYgd2luZG93LnBhcmVudC5wb3N0TWVzc2FnZSggSlNPTi5zdHJpbmdpZnkoIHtcclxuICAgICAgdHlwZTogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcclxuICAgICAgc3RhY2s6IHN0YWNrXHJcbiAgICB9ICksICcqJyApO1xyXG4gIH0gKTtcclxufSApKCk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUUsWUFBVztFQUVYO0VBQ0E7RUFDQTtFQUNBQSxLQUFLLENBQUNDLE1BQU0sQ0FBQ0MsU0FBUyxHQUFHLEtBQUs7RUFFOUJGLEtBQUssQ0FBQ0csR0FBRyxDQUFFQyxPQUFPLElBQUk7SUFDbEJDLE1BQU0sQ0FBQ0MsTUFBTSxLQUFLRCxNQUFNLElBQU1BLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxXQUFXLENBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFFO01BQ3pFQyxJQUFJLEVBQUUsWUFBWTtNQUNsQkMsSUFBSSxFQUFFUCxPQUFPLENBQUNRLE1BQU07TUFBRTtNQUN0QkMsTUFBTSxFQUFFVCxPQUFPLENBQUNTLE1BQU07TUFDdEJELE1BQU0sRUFBRVIsT0FBTyxDQUFDUSxNQUFNO01BQ3RCRSxJQUFJLEVBQUVWLE9BQU8sQ0FBQ1UsSUFBSTtNQUNsQkMsT0FBTyxFQUFFWCxPQUFPLENBQUNXLE9BQU87TUFFeEI7TUFDQUMsTUFBTSxFQUFFWixPQUFPLENBQUNZO0lBQ2xCLENBQUUsQ0FBQyxFQUFFLEdBQUksQ0FBQztFQUNaLENBQUUsQ0FBQztFQUVIaEIsS0FBSyxDQUFDaUIsRUFBRSxDQUFFLFFBQVEsRUFBRUMsSUFBSSxJQUFJO0lBQ3hCYixNQUFNLENBQUNDLE1BQU0sS0FBS0QsTUFBTSxJQUFNQSxNQUFNLENBQUNDLE1BQU0sQ0FBQ0MsV0FBVyxDQUFFQyxJQUFJLENBQUNDLFNBQVMsQ0FBRTtNQUN6RUMsSUFBSSxFQUFFLFlBQVk7TUFDbEJTLE1BQU0sRUFBRUQsSUFBSSxDQUFDRSxVQUFVLENBQUNELE1BQU07TUFDOUJFLE1BQU0sRUFBRUgsSUFBSSxDQUFDRSxVQUFVLENBQUNDLE1BQU07TUFDOUJDLEtBQUssRUFBRUosSUFBSSxDQUFDRSxVQUFVLENBQUNFO0lBQ3pCLENBQUUsQ0FBQyxFQUFFLEdBQUksQ0FBQztFQUNaLENBQUUsQ0FBQztFQUVIakIsTUFBTSxDQUFDa0IsZ0JBQWdCLENBQUUsT0FBTyxFQUFFQyxDQUFDLElBQUk7SUFDckMsSUFBSVQsT0FBTyxHQUFHLEVBQUU7SUFDaEIsSUFBSVUsS0FBSyxHQUFHLEVBQUU7SUFDZCxJQUFLRCxDQUFDLElBQUlBLENBQUMsQ0FBQ1QsT0FBTyxFQUFHO01BQ3BCQSxPQUFPLEdBQUdTLENBQUMsQ0FBQ1QsT0FBTztJQUNyQjtJQUNBLElBQUtTLENBQUMsSUFBSUEsQ0FBQyxDQUFDRSxLQUFLLElBQUlGLENBQUMsQ0FBQ0UsS0FBSyxDQUFDRCxLQUFLLEVBQUc7TUFDbkNBLEtBQUssR0FBR0QsQ0FBQyxDQUFDRSxLQUFLLENBQUNELEtBQUs7SUFDdkI7SUFDRXBCLE1BQU0sQ0FBQ0MsTUFBTSxLQUFLRCxNQUFNLElBQU1BLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxXQUFXLENBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFFO01BQ3pFQyxJQUFJLEVBQUUsT0FBTztNQUNiSyxPQUFPLEVBQUVBLE9BQU87TUFDaEJVLEtBQUssRUFBRUE7SUFDVCxDQUFFLENBQUMsRUFBRSxHQUFJLENBQUM7RUFDWixDQUFFLENBQUM7QUFDTCxDQUFDLEVBQUcsQ0FBQyJ9