// Copyright 2013-2023, University of Colorado Boulder

/**
 * Code for testing which platform is running.  Use sparingly, if at all!
 *
 * Sample usage:
 * if (platform.firefox) {node.renderer = 'canvas';}
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import phetCore from './phetCore.js';
const ua = navigator.userAgent;

// Checks to see whether we are IE, and if so whether the version matches.
function isIE(version) {
  return getInternetExplorerVersion() === version;
}

// Whether the browser is most likely Safari running on iOS
// See http://stackoverflow.com/questions/3007480/determine-if-user-navigated-from-mobile-safari
function isMobileSafari() {
  return !!(window.phet && phet.chipper && phet.chipper.queryParameters && phet.chipper.queryParameters['phet-app'] || (ua.match(/(iPod|iPhone|iPad)/) || navigator.platform === 'MacIntel' && navigator.maxTouchPoints >= 2) && ua.match(/AppleWebKit/));
}

//IE11 no longer reports MSIE in the user agent string, see https://github.com/phetsims/phet-core/issues/12
//This code is adapted from http://stackoverflow.com/questions/17907445/how-to-detect-ie11
function getInternetExplorerVersion() {
  let rv = -1;
  let re = null;
  if (navigator.appName === 'Microsoft Internet Explorer') {
    re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
    if (re.exec(ua) !== null) {
      rv = parseFloat(RegExp.$1);
    }
  } else if (navigator.appName === 'Netscape') {
    re = new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})');
    if (re.exec(ua) !== null) {
      rv = parseFloat(RegExp.$1);
    }
  }
  return rv;
}
const platform = {
  // Whether the browser is most likely Firefox
  firefox: ua.toLowerCase().indexOf('firefox') > -1,
  // Whether the browser is most likely Safari running on iOS
  mobileSafari: isMobileSafari(),
  // Whether the browser is a matching version of Safari running on OS X
  safari5: !!(ua.match(/Version\/5\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  safari6: !!(ua.match(/Version\/6\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  safari7: !!(ua.match(/Version\/7\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  safari10: !!(ua.match(/Version\/10\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  safari11: !!(ua.match(/Version\/11\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  // Match Safari on iOS
  safari9: !!(ua.match(/Version\/9\./) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  // Whether the browser matches any version of safari, including mobile
  safari: isMobileSafari() || !!(ua.match(/Version\//) && ua.match(/Safari\//) && ua.match(/AppleWebKit/)),
  // Whether the browser is some type of IE (Internet Explorer)
  ie: getInternetExplorerVersion() !== -1,
  // Whether the browser is a specific version of IE (Internet Explorer)
  ie9: isIE(9),
  ie10: isIE(10),
  ie11: isIE(11),
  // Whether the browser has Android in its user agent
  android: ua.indexOf('Android') > 0,
  // Whether the browser is Microsoft Edge
  edge: !!ua.match(/Edge\//),
  // Whether the browser is Chromium-based (usually Chrome)
  chromium: /chrom(e|ium)/.test(ua.toLowerCase()) && !ua.match(/Edge\//),
  // Whether the platform is ChromeOS, https://stackoverflow.com/questions/29657165/detecting-chrome-os-with-javascript
  chromeOS: ua.indexOf('CrOS') > 0,
  mac: navigator.platform.includes('Mac')
};
phetCore.register('platform', platform);
export default platform;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwaGV0Q29yZSIsInVhIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaXNJRSIsInZlcnNpb24iLCJnZXRJbnRlcm5ldEV4cGxvcmVyVmVyc2lvbiIsImlzTW9iaWxlU2FmYXJpIiwid2luZG93IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJtYXRjaCIsInBsYXRmb3JtIiwibWF4VG91Y2hQb2ludHMiLCJydiIsInJlIiwiYXBwTmFtZSIsIlJlZ0V4cCIsImV4ZWMiLCJwYXJzZUZsb2F0IiwiJDEiLCJmaXJlZm94IiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwibW9iaWxlU2FmYXJpIiwic2FmYXJpNSIsInNhZmFyaTYiLCJzYWZhcmk3Iiwic2FmYXJpMTAiLCJzYWZhcmkxMSIsInNhZmFyaTkiLCJzYWZhcmkiLCJpZSIsImllOSIsImllMTAiLCJpZTExIiwiYW5kcm9pZCIsImVkZ2UiLCJjaHJvbWl1bSIsInRlc3QiLCJjaHJvbWVPUyIsIm1hYyIsImluY2x1ZGVzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJwbGF0Zm9ybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb2RlIGZvciB0ZXN0aW5nIHdoaWNoIHBsYXRmb3JtIGlzIHJ1bm5pbmcuICBVc2Ugc3BhcmluZ2x5LCBpZiBhdCBhbGwhXHJcbiAqXHJcbiAqIFNhbXBsZSB1c2FnZTpcclxuICogaWYgKHBsYXRmb3JtLmZpcmVmb3gpIHtub2RlLnJlbmRlcmVyID0gJ2NhbnZhcyc7fVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBwaGV0Q29yZSBmcm9tICcuL3BoZXRDb3JlLmpzJztcclxuXHJcbmNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuXHJcbi8vIENoZWNrcyB0byBzZWUgd2hldGhlciB3ZSBhcmUgSUUsIGFuZCBpZiBzbyB3aGV0aGVyIHRoZSB2ZXJzaW9uIG1hdGNoZXMuXHJcbmZ1bmN0aW9uIGlzSUUoIHZlcnNpb24gKSB7XHJcbiAgcmV0dXJuIGdldEludGVybmV0RXhwbG9yZXJWZXJzaW9uKCkgPT09IHZlcnNpb247XHJcbn1cclxuXHJcbi8vIFdoZXRoZXIgdGhlIGJyb3dzZXIgaXMgbW9zdCBsaWtlbHkgU2FmYXJpIHJ1bm5pbmcgb24gaU9TXHJcbi8vIFNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMwMDc0ODAvZGV0ZXJtaW5lLWlmLXVzZXItbmF2aWdhdGVkLWZyb20tbW9iaWxlLXNhZmFyaVxyXG5mdW5jdGlvbiBpc01vYmlsZVNhZmFyaSgpIHtcclxuICByZXR1cm4gISEoXHJcbiAgICAoIHdpbmRvdy5waGV0ICYmIHBoZXQuY2hpcHBlciAmJiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzICYmIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnNbICdwaGV0LWFwcCcgXSApIHx8XHJcbiAgICAoICggdWEubWF0Y2goIC8oaVBvZHxpUGhvbmV8aVBhZCkvICkgfHwgKCBuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdNYWNJbnRlbCcgJiYgbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID49IDIgKSApICYmIHVhLm1hdGNoKCAvQXBwbGVXZWJLaXQvICkgKVxyXG4gICk7XHJcbn1cclxuXHJcbi8vSUUxMSBubyBsb25nZXIgcmVwb3J0cyBNU0lFIGluIHRoZSB1c2VyIGFnZW50IHN0cmluZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWNvcmUvaXNzdWVzLzEyXHJcbi8vVGhpcyBjb2RlIGlzIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE3OTA3NDQ1L2hvdy10by1kZXRlY3QtaWUxMVxyXG5mdW5jdGlvbiBnZXRJbnRlcm5ldEV4cGxvcmVyVmVyc2lvbigpIHtcclxuICBsZXQgcnYgPSAtMTtcclxuICBsZXQgcmUgPSBudWxsO1xyXG4gIGlmICggbmF2aWdhdG9yLmFwcE5hbWUgPT09ICdNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXInICkge1xyXG4gICAgcmUgPSBuZXcgUmVnRXhwKCAnTVNJRSAoWzAtOV17MSx9Wy4wLTldezAsfSknICk7XHJcbiAgICBpZiAoIHJlLmV4ZWMoIHVhICkgIT09IG51bGwgKSB7XHJcbiAgICAgIHJ2ID0gcGFyc2VGbG9hdCggUmVnRXhwLiQxICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBuYXZpZ2F0b3IuYXBwTmFtZSA9PT0gJ05ldHNjYXBlJyApIHtcclxuICAgIHJlID0gbmV3IFJlZ0V4cCggJ1RyaWRlbnQvLipydjooWzAtOV17MSx9Wy4wLTldezAsfSknICk7XHJcbiAgICBpZiAoIHJlLmV4ZWMoIHVhICkgIT09IG51bGwgKSB7XHJcbiAgICAgIHJ2ID0gcGFyc2VGbG9hdCggUmVnRXhwLiQxICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBydjtcclxufVxyXG5cclxuY29uc3QgcGxhdGZvcm0gPSB7XHJcbiAgLy8gV2hldGhlciB0aGUgYnJvd3NlciBpcyBtb3N0IGxpa2VseSBGaXJlZm94XHJcbiAgZmlyZWZveDogdWEudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnZmlyZWZveCcgKSA+IC0xLFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGlzIG1vc3QgbGlrZWx5IFNhZmFyaSBydW5uaW5nIG9uIGlPU1xyXG4gIG1vYmlsZVNhZmFyaTogaXNNb2JpbGVTYWZhcmkoKSxcclxuXHJcbiAgLy8gV2hldGhlciB0aGUgYnJvd3NlciBpcyBhIG1hdGNoaW5nIHZlcnNpb24gb2YgU2FmYXJpIHJ1bm5pbmcgb24gT1MgWFxyXG4gIHNhZmFyaTU6ICEhKCB1YS5tYXRjaCggL1ZlcnNpb25cXC81XFwuLyApICYmIHVhLm1hdGNoKCAvU2FmYXJpXFwvLyApICYmIHVhLm1hdGNoKCAvQXBwbGVXZWJLaXQvICkgKSxcclxuICBzYWZhcmk2OiAhISggdWEubWF0Y2goIC9WZXJzaW9uXFwvNlxcLi8gKSAmJiB1YS5tYXRjaCggL1NhZmFyaVxcLy8gKSAmJiB1YS5tYXRjaCggL0FwcGxlV2ViS2l0LyApICksXHJcbiAgc2FmYXJpNzogISEoIHVhLm1hdGNoKCAvVmVyc2lvblxcLzdcXC4vICkgJiYgdWEubWF0Y2goIC9TYWZhcmlcXC8vICkgJiYgdWEubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApLFxyXG4gIHNhZmFyaTEwOiAhISggdWEubWF0Y2goIC9WZXJzaW9uXFwvMTBcXC4vICkgJiYgdWEubWF0Y2goIC9TYWZhcmlcXC8vICkgJiYgdWEubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApLFxyXG4gIHNhZmFyaTExOiAhISggdWEubWF0Y2goIC9WZXJzaW9uXFwvMTFcXC4vICkgJiYgdWEubWF0Y2goIC9TYWZhcmlcXC8vICkgJiYgdWEubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApLFxyXG5cclxuICAvLyBNYXRjaCBTYWZhcmkgb24gaU9TXHJcbiAgc2FmYXJpOTogISEoIHVhLm1hdGNoKCAvVmVyc2lvblxcLzlcXC4vICkgJiYgdWEubWF0Y2goIC9TYWZhcmlcXC8vICkgJiYgdWEubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApLFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIG1hdGNoZXMgYW55IHZlcnNpb24gb2Ygc2FmYXJpLCBpbmNsdWRpbmcgbW9iaWxlXHJcbiAgc2FmYXJpOiBpc01vYmlsZVNhZmFyaSgpIHx8ICEhKCB1YS5tYXRjaCggL1ZlcnNpb25cXC8vICkgJiYgdWEubWF0Y2goIC9TYWZhcmlcXC8vICkgJiYgdWEubWF0Y2goIC9BcHBsZVdlYktpdC8gKSApLFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGlzIHNvbWUgdHlwZSBvZiBJRSAoSW50ZXJuZXQgRXhwbG9yZXIpXHJcbiAgaWU6IGdldEludGVybmV0RXhwbG9yZXJWZXJzaW9uKCkgIT09IC0xLFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGlzIGEgc3BlY2lmaWMgdmVyc2lvbiBvZiBJRSAoSW50ZXJuZXQgRXhwbG9yZXIpXHJcbiAgaWU5OiBpc0lFKCA5ICksXHJcbiAgaWUxMDogaXNJRSggMTAgKSxcclxuICBpZTExOiBpc0lFKCAxMSApLFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGhhcyBBbmRyb2lkIGluIGl0cyB1c2VyIGFnZW50XHJcbiAgYW5kcm9pZDogdWEuaW5kZXhPZiggJ0FuZHJvaWQnICkgPiAwLFxyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBicm93c2VyIGlzIE1pY3Jvc29mdCBFZGdlXHJcbiAgZWRnZTogISF1YS5tYXRjaCggL0VkZ2VcXC8vICksXHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIGJyb3dzZXIgaXMgQ2hyb21pdW0tYmFzZWQgKHVzdWFsbHkgQ2hyb21lKVxyXG4gIGNocm9taXVtOiAoIC9jaHJvbShlfGl1bSkvICkudGVzdCggdWEudG9Mb3dlckNhc2UoKSApICYmICF1YS5tYXRjaCggL0VkZ2VcXC8vICksXHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlIHBsYXRmb3JtIGlzIENocm9tZU9TLCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yOTY1NzE2NS9kZXRlY3RpbmctY2hyb21lLW9zLXdpdGgtamF2YXNjcmlwdFxyXG4gIGNocm9tZU9TOiB1YS5pbmRleE9mKCAnQ3JPUycgKSA+IDAsXHJcblxyXG4gIG1hYzogbmF2aWdhdG9yLnBsYXRmb3JtLmluY2x1ZGVzKCAnTWFjJyApXHJcbn07XHJcbnBoZXRDb3JlLnJlZ2lzdGVyKCAncGxhdGZvcm0nLCBwbGF0Zm9ybSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcGxhdGZvcm07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNB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