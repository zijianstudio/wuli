// Copyright 2020-2021, University of Colorado Boulder

import Tandem from '../../../tandem/js/Tandem.js';

/**
 * Start Qunit while supporting PhET-iO brand
 */
const qunitStart = () => {
  const start = () => {
    // Uncomment for a debugger whenever a test fails
    if (_.hasIn(window, 'phet.chipper.queryParameters') && phet.chipper.queryParameters.debugger) {
      QUnit.log(context => {
        if (!context.result) {
          debugger;
        }
      }); // eslint-disable-line no-debugger
    }

    if (Tandem.PHET_IO_ENABLED) {
      import( /* webpackMode: "eager" */'../../../phet-io/js/phetioEngine.js').then(() => {
        // no API validation in unit tests
        phet.tandem.phetioAPIValidation.enabled = false;
        phet.phetio.phetioEngine.flushPhetioObjectBuffer();
        QUnit.start();
      });
    } else {
      QUnit.start();
    }
  };

  // When running in the puppeteer harness, we need the opportunity to wire up listeners before QUnit begins.
  if (QueryStringMachine.containsKey('qunitHooks')) {
    window.qunitLaunchAfterHooks = start;
  } else {
    start();
  }
};
export default qunitStart;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJxdW5pdFN0YXJ0Iiwic3RhcnQiLCJfIiwiaGFzSW4iLCJ3aW5kb3ciLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImRlYnVnZ2VyIiwiUVVuaXQiLCJsb2ciLCJjb250ZXh0IiwicmVzdWx0IiwiUEhFVF9JT19FTkFCTEVEIiwidGhlbiIsInRhbmRlbSIsInBoZXRpb0FQSVZhbGlkYXRpb24iLCJlbmFibGVkIiwicGhldGlvIiwicGhldGlvRW5naW5lIiwiZmx1c2hQaGV0aW9PYmplY3RCdWZmZXIiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJjb250YWluc0tleSIsInF1bml0TGF1bmNoQWZ0ZXJIb29rcyJdLCJzb3VyY2VzIjpbInF1bml0U3RhcnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuLyoqXHJcbiAqIFN0YXJ0IFF1bml0IHdoaWxlIHN1cHBvcnRpbmcgUGhFVC1pTyBicmFuZFxyXG4gKi9cclxuY29uc3QgcXVuaXRTdGFydCA9ICgpID0+IHtcclxuXHJcbiAgY29uc3Qgc3RhcnQgPSAoKSA9PiB7XHJcblxyXG4gICAgLy8gVW5jb21tZW50IGZvciBhIGRlYnVnZ2VyIHdoZW5ldmVyIGEgdGVzdCBmYWlsc1xyXG4gICAgaWYgKCBfLmhhc0luKCB3aW5kb3csICdwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzJyApICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGVidWdnZXIgKSB7XHJcbiAgICAgIFFVbml0LmxvZyggY29udGV4dCA9PiB7IGlmICggIWNvbnRleHQucmVzdWx0ICkgeyBkZWJ1Z2dlcjsgfX0gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1kZWJ1Z2dlclxyXG4gICAgfVxyXG5cclxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcclxuICAgICAgaW1wb3J0KCAvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovICcuLi8uLi8uLi9waGV0LWlvL2pzL3BoZXRpb0VuZ2luZS5qcycgKS50aGVuKCAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIG5vIEFQSSB2YWxpZGF0aW9uIGluIHVuaXQgdGVzdHNcclxuICAgICAgICBwaGV0LnRhbmRlbS5waGV0aW9BUElWYWxpZGF0aW9uLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUuZmx1c2hQaGV0aW9PYmplY3RCdWZmZXIoKTtcclxuICAgICAgICBRVW5pdC5zdGFydCgpO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgUVVuaXQuc3RhcnQoKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBXaGVuIHJ1bm5pbmcgaW4gdGhlIHB1cHBldGVlciBoYXJuZXNzLCB3ZSBuZWVkIHRoZSBvcHBvcnR1bml0eSB0byB3aXJlIHVwIGxpc3RlbmVycyBiZWZvcmUgUVVuaXQgYmVnaW5zLlxyXG4gIGlmICggUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAncXVuaXRIb29rcycgKSApIHtcclxuICAgIHdpbmRvdy5xdW5pdExhdW5jaEFmdGVySG9va3MgPSBzdGFydDtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBzdGFydCgpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHF1bml0U3RhcnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0sOEJBQThCOztBQUVqRDtBQUNBO0FBQ0E7QUFDQSxNQUFNQyxVQUFVLEdBQUdBLENBQUEsS0FBTTtFQUV2QixNQUFNQyxLQUFLLEdBQUdBLENBQUEsS0FBTTtJQUVsQjtJQUNBLElBQUtDLENBQUMsQ0FBQ0MsS0FBSyxDQUFFQyxNQUFNLEVBQUUsOEJBQStCLENBQUMsSUFBSUMsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsUUFBUSxFQUFHO01BQ2hHQyxLQUFLLENBQUNDLEdBQUcsQ0FBRUMsT0FBTyxJQUFJO1FBQUUsSUFBSyxDQUFDQSxPQUFPLENBQUNDLE1BQU0sRUFBRztVQUFFO1FBQVU7TUFBQyxDQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ25FOztJQUVBLElBQUtiLE1BQU0sQ0FBQ2MsZUFBZSxFQUFHO01BQzVCLE1BQU0sRUFBRSwwQkFBMkIscUNBQXNDLENBQUMsQ0FBQ0MsSUFBSSxDQUFFLE1BQU07UUFFckY7UUFDQVQsSUFBSSxDQUFDVSxNQUFNLENBQUNDLG1CQUFtQixDQUFDQyxPQUFPLEdBQUcsS0FBSztRQUMvQ1osSUFBSSxDQUFDYSxNQUFNLENBQUNDLFlBQVksQ0FBQ0MsdUJBQXVCLENBQUMsQ0FBQztRQUNsRFgsS0FBSyxDQUFDUixLQUFLLENBQUMsQ0FBQztNQUNmLENBQUUsQ0FBQztJQUNMLENBQUMsTUFDSTtNQUNIUSxLQUFLLENBQUNSLEtBQUssQ0FBQyxDQUFDO0lBQ2Y7RUFDRixDQUFDOztFQUVEO0VBQ0EsSUFBS29CLGtCQUFrQixDQUFDQyxXQUFXLENBQUUsWUFBYSxDQUFDLEVBQUc7SUFDcERsQixNQUFNLENBQUNtQixxQkFBcUIsR0FBR3RCLEtBQUs7RUFDdEMsQ0FBQyxNQUNJO0lBQ0hBLEtBQUssQ0FBQyxDQUFDO0VBQ1Q7QUFDRixDQUFDO0FBRUQsZUFBZUQsVUFBVSJ9