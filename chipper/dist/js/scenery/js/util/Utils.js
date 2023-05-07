// Copyright 2013-2022, University of Colorado Boulder

/**
 * General utility functions for Scenery
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Transform3 from '../../../dot/js/Transform3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import platform from '../../../phet-core/js/platform.js';
import { Features, scenery } from '../imports.js';

// convenience function
function p(x, y) {
  return new Vector2(x, y);
}

// TODO: remove flag and tests after we're done
const debugChromeBoundsScanning = false;

// detect properly prefixed transform and transformOrigin properties
const transformProperty = Features.transform;
const transformOriginProperty = Features.transformOrigin || 'transformOrigin'; // fallback, so we don't try to set an empty string property later

// Scenery applications that do not use WebGL may trigger a ~ 0.5 second pause shortly after launch on some platforms.
// Webgl is enabled by default but may be shut off for applications that know they will not want to use it
// see https://github.com/phetsims/scenery/issues/621
let webglEnabled = true;
let _extensionlessWebGLSupport; // lazily computed

const Utils = {
  /*---------------------------------------------------------------------------*
   * Transformation Utilities (TODO: separate file)
   *---------------------------------------------------------------------------*/

  /**
   * Prepares a DOM element for use with applyPreparedTransform(). Applies some CSS styles that are required, but
   * that we don't want to set while animating.
   */
  prepareForTransform(element) {
    element.style[transformOriginProperty] = 'top left';
  },
  /**
   * Applies the CSS transform of the matrix to the element, with optional forcing of acceleration.
   * NOTE: prepareForTransform should be called at least once on the element before this method is used.
   */
  applyPreparedTransform(matrix, element) {
    // NOTE: not applying translateZ, see http://stackoverflow.com/questions/10014461/why-does-enabling-hardware-acceleration-in-css3-slow-down-performance
    element.style[transformProperty] = matrix.getCSSTransform();
  },
  /**
   * Applies a CSS transform value string to a DOM element.
   * NOTE: prepareForTransform should be called at least once on the element before this method is used.
   */
  setTransform(transformString, element) {
    element.style[transformProperty] = transformString;
  },
  /**
   * Removes a CSS transform from a DOM element.
   */
  unsetTransform(element) {
    element.style[transformProperty] = '';
  },
  /**
   * Ensures that window.requestAnimationFrame and window.cancelAnimationFrame use a native implementation if possible,
   * otherwise using a simple setTimeout internally. See https://github.com/phetsims/scenery/issues/426
   */
  polyfillRequestAnimationFrame() {
    if (!window.requestAnimationFrame || !window.cancelAnimationFrame) {
      // Fallback implementation if no prefixed version is available
      if (!Features.requestAnimationFrame || !Features.cancelAnimationFrame) {
        window.requestAnimationFrame = callback => {
          const timeAtStart = Date.now();

          // NOTE: We don't want to rely on a common timer, so we're using the built-in form on purpose.
          return window.setTimeout(() => {
            // eslint-disable-line bad-sim-text
            callback(Date.now() - timeAtStart);
          }, 16);
        };
        window.cancelAnimationFrame = clearTimeout;
      }
      // Fill in the non-prefixed names with the prefixed versions
      else {
        // @ts-expect-error
        window.requestAnimationFrame = window[Features.requestAnimationFrame];
        // @ts-expect-error
        window.cancelAnimationFrame = window[Features.cancelAnimationFrame];
      }
    }
  },
  /**
   * Returns the relative size of the context's backing store compared to the actual Canvas. For example, if it's 2,
   * the backing store has 2x2 the amount of pixels (4 times total).
   *
   * @returns The backing store pixel ratio.
   */
  backingStorePixelRatio(context) {
    // @ts-expect-error
    return context.webkitBackingStorePixelRatio ||
    // @ts-expect-error
    context.mozBackingStorePixelRatio ||
    // @ts-expect-error
    context.msBackingStorePixelRatio ||
    // @ts-expect-error
    context.oBackingStorePixelRatio ||
    // @ts-expect-error
    context.backingStorePixelRatio || 1;
  },
  /**
   * Returns the scaling factor that needs to be applied for handling a HiDPI Canvas
   * See see http://developer.apple.com/library/safari/#documentation/AudioVideo/Conceptual/HTML-canvas-guide/SettingUptheCanvas/SettingUptheCanvas.html#//apple_ref/doc/uid/TP40010542-CH2-SW5
   * And it's updated based on http://www.html5rocks.com/en/tutorials/canvas/hidpi/
   */
  backingScale(context) {
    if ('devicePixelRatio' in window) {
      const backingStoreRatio = Utils.backingStorePixelRatio(context);
      return window.devicePixelRatio / backingStoreRatio;
    }
    return 1;
  },
  /**
   * Whether the native Canvas HTML5 API supports the 'filter' attribute (similar to the CSS/SVG filter attribute).
   */
  supportsNativeCanvasFilter() {
    return !!Features.canvasFilter;
  },
  /**
   * Whether we can handle arbitrary filters in Canvas by manipulating the ImageData returned. If we have a backing
   * store pixel ratio that is non-1, we'll be blurring out things during that operation, which would be unacceptable.
   */
  supportsImageDataCanvasFilter() {
    // @ts-expect-error TODO: scenery and typing
    return Utils.backingStorePixelRatio(scenery.scratchContext) === 1;
  },
  /*---------------------------------------------------------------------------*
   * Text bounds utilities (TODO: separate file)
   *---------------------------------------------------------------------------*/

  /**
   * Given a data snapshot and transform, calculate range on how large / small the bounds can be. It's
   * very conservative, with an effective 1px extra range to allow for differences in anti-aliasing
   * for performance concerns, this does not support skews / rotations / anything but translation and scaling
   */
  scanBounds(imageData, resolution, transform) {
    // entry will be true if any pixel with the given x or y value is non-rgba(0,0,0,0)
    const dirtyX = _.map(_.range(resolution), () => false);
    const dirtyY = _.map(_.range(resolution), () => false);
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        const offset = 4 * (y * resolution + x);
        if (imageData.data[offset] !== 0 || imageData.data[offset + 1] !== 0 || imageData.data[offset + 2] !== 0 || imageData.data[offset + 3] !== 0) {
          dirtyX[x] = true;
          dirtyY[y] = true;
        }
      }
    }
    const minX = _.indexOf(dirtyX, true);
    const maxX = _.lastIndexOf(dirtyX, true);
    const minY = _.indexOf(dirtyY, true);
    const maxY = _.lastIndexOf(dirtyY, true);

    // based on pixel boundaries. for minBounds, the inner edge of the dirty pixel. for maxBounds, the outer edge of the adjacent non-dirty pixel
    // results in a spread of 2 for the identity transform (or any translated form)
    const extraSpread = resolution / 16; // is Chrome antialiasing really like this? dear god... TODO!!!
    return {
      minBounds: new Bounds2(minX < 1 || minX >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(minX + 1 + extraSpread, 0)).x, minY < 1 || minY >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(0, minY + 1 + extraSpread)).y, maxX < 1 || maxX >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(maxX - extraSpread, 0)).x, maxY < 1 || maxY >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(0, maxY - extraSpread)).y),
      maxBounds: new Bounds2(minX < 1 || minX >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(minX - 1 - extraSpread, 0)).x, minY < 1 || minY >= resolution - 1 ? Number.NEGATIVE_INFINITY : transform.inversePosition2(p(0, minY - 1 - extraSpread)).y, maxX < 1 || maxX >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(maxX + 2 + extraSpread, 0)).x, maxY < 1 || maxY >= resolution - 1 ? Number.POSITIVE_INFINITY : transform.inversePosition2(p(0, maxY + 2 + extraSpread)).y)
    };
  },
  /**
   * Measures accurate bounds of a function that draws things to a Canvas.
   */
  canvasAccurateBounds(renderToContext, options) {
    // how close to the actual bounds do we need to be?
    const precision = options && options.precision ? options.precision : 0.001;

    // 512x512 default square resolution
    const resolution = options && options.resolution ? options.resolution : 128;

    // at 1/16x default, we want to be able to get the bounds accurately for something as large as 16x our initial resolution
    // divisible by 2 so hopefully we avoid more quirks from Canvas rendering engines
    const initialScale = options && options.initialScale ? options.initialScale : 1 / 16;
    let minBounds = Bounds2.NOTHING;
    let maxBounds = Bounds2.EVERYTHING;
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const context = canvas.getContext('2d');
    if (debugChromeBoundsScanning) {
      $(window).ready(() => {
        const header = document.createElement('h2');
        $(header).text('Bounds Scan');
        $('#display').append(header);
      });
    }

    // TODO: Don't use Transform3 unless it is necessary
    function scan(transform) {
      // save/restore, in case the render tries to do any funny stuff like clipping, etc.
      context.save();
      transform.matrix.canvasSetTransform(context);
      renderToContext(context);
      context.restore();
      const data = context.getImageData(0, 0, resolution, resolution);
      const minMaxBounds = Utils.scanBounds(data, resolution, transform);
      function snapshotToCanvas(snapshot) {
        const canvas = document.createElement('canvas');
        canvas.width = resolution;
        canvas.height = resolution;
        const context = canvas.getContext('2d');
        context.putImageData(snapshot, 0, 0);
        $(canvas).css('border', '1px solid black');
        $(window).ready(() => {
          //$( '#display' ).append( $( document.createElement( 'div' ) ).text( 'Bounds: ' +  ) );
          $('#display').append(canvas);
        });
      }

      // TODO: remove after debug
      if (debugChromeBoundsScanning) {
        snapshotToCanvas(data);
      }
      context.clearRect(0, 0, resolution, resolution);
      return minMaxBounds;
    }

    // attempts to map the bounds specified to the entire testing canvas (minus a fine border), so we can nail down the location quickly
    function idealTransform(bounds) {
      // so that the bounds-edge doesn't land squarely on the boundary
      const borderSize = 2;
      const scaleX = (resolution - borderSize * 2) / (bounds.maxX - bounds.minX);
      const scaleY = (resolution - borderSize * 2) / (bounds.maxY - bounds.minY);
      const translationX = -scaleX * bounds.minX + borderSize;
      const translationY = -scaleY * bounds.minY + borderSize;
      return new Transform3(Matrix3.translation(translationX, translationY).timesMatrix(Matrix3.scaling(scaleX, scaleY)));
    }
    const initialTransform = new Transform3();
    // make sure to initially center our object, so we don't miss the bounds
    initialTransform.append(Matrix3.translation(resolution / 2, resolution / 2));
    initialTransform.append(Matrix3.scaling(initialScale));
    const coarseBounds = scan(initialTransform);
    minBounds = minBounds.union(coarseBounds.minBounds);
    maxBounds = maxBounds.intersection(coarseBounds.maxBounds);
    let tempMin;
    let tempMax;
    let refinedBounds;

    // minX
    tempMin = maxBounds.minY;
    tempMax = maxBounds.maxY;
    while (isFinite(minBounds.minX) && isFinite(maxBounds.minX) && Math.abs(minBounds.minX - maxBounds.minX) > precision) {
      // use maximum bounds except for the x direction, so we don't miss things that we are looking for
      refinedBounds = scan(idealTransform(new Bounds2(maxBounds.minX, tempMin, minBounds.minX, tempMax)));
      if (minBounds.minX <= refinedBounds.minBounds.minX && maxBounds.minX >= refinedBounds.maxBounds.minX) {
        // sanity check - break out of an infinite loop!
        if (debugChromeBoundsScanning) {
          console.log('warning, exiting infinite loop!');
          console.log(`transformed "min" minX: ${idealTransform(new Bounds2(maxBounds.minX, maxBounds.minY, minBounds.minX, maxBounds.maxY)).transformPosition2(p(minBounds.minX, 0))}`);
          console.log(`transformed "max" minX: ${idealTransform(new Bounds2(maxBounds.minX, maxBounds.minY, minBounds.minX, maxBounds.maxY)).transformPosition2(p(maxBounds.minX, 0))}`);
        }
        break;
      }
      minBounds = minBounds.withMinX(Math.min(minBounds.minX, refinedBounds.minBounds.minX));
      maxBounds = maxBounds.withMinX(Math.max(maxBounds.minX, refinedBounds.maxBounds.minX));
      tempMin = Math.max(tempMin, refinedBounds.maxBounds.minY);
      tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxY);
    }

    // maxX
    tempMin = maxBounds.minY;
    tempMax = maxBounds.maxY;
    while (isFinite(minBounds.maxX) && isFinite(maxBounds.maxX) && Math.abs(minBounds.maxX - maxBounds.maxX) > precision) {
      // use maximum bounds except for the x direction, so we don't miss things that we are looking for
      refinedBounds = scan(idealTransform(new Bounds2(minBounds.maxX, tempMin, maxBounds.maxX, tempMax)));
      if (minBounds.maxX >= refinedBounds.minBounds.maxX && maxBounds.maxX <= refinedBounds.maxBounds.maxX) {
        // sanity check - break out of an infinite loop!
        if (debugChromeBoundsScanning) {
          console.log('warning, exiting infinite loop!');
        }
        break;
      }
      minBounds = minBounds.withMaxX(Math.max(minBounds.maxX, refinedBounds.minBounds.maxX));
      maxBounds = maxBounds.withMaxX(Math.min(maxBounds.maxX, refinedBounds.maxBounds.maxX));
      tempMin = Math.max(tempMin, refinedBounds.maxBounds.minY);
      tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxY);
    }

    // minY
    tempMin = maxBounds.minX;
    tempMax = maxBounds.maxX;
    while (isFinite(minBounds.minY) && isFinite(maxBounds.minY) && Math.abs(minBounds.minY - maxBounds.minY) > precision) {
      // use maximum bounds except for the y direction, so we don't miss things that we are looking for
      refinedBounds = scan(idealTransform(new Bounds2(tempMin, maxBounds.minY, tempMax, minBounds.minY)));
      if (minBounds.minY <= refinedBounds.minBounds.minY && maxBounds.minY >= refinedBounds.maxBounds.minY) {
        // sanity check - break out of an infinite loop!
        if (debugChromeBoundsScanning) {
          console.log('warning, exiting infinite loop!');
        }
        break;
      }
      minBounds = minBounds.withMinY(Math.min(minBounds.minY, refinedBounds.minBounds.minY));
      maxBounds = maxBounds.withMinY(Math.max(maxBounds.minY, refinedBounds.maxBounds.minY));
      tempMin = Math.max(tempMin, refinedBounds.maxBounds.minX);
      tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxX);
    }

    // maxY
    tempMin = maxBounds.minX;
    tempMax = maxBounds.maxX;
    while (isFinite(minBounds.maxY) && isFinite(maxBounds.maxY) && Math.abs(minBounds.maxY - maxBounds.maxY) > precision) {
      // use maximum bounds except for the y direction, so we don't miss things that we are looking for
      refinedBounds = scan(idealTransform(new Bounds2(tempMin, minBounds.maxY, tempMax, maxBounds.maxY)));
      if (minBounds.maxY >= refinedBounds.minBounds.maxY && maxBounds.maxY <= refinedBounds.maxBounds.maxY) {
        // sanity check - break out of an infinite loop!
        if (debugChromeBoundsScanning) {
          console.log('warning, exiting infinite loop!');
        }
        break;
      }
      minBounds = minBounds.withMaxY(Math.max(minBounds.maxY, refinedBounds.minBounds.maxY));
      maxBounds = maxBounds.withMaxY(Math.min(maxBounds.maxY, refinedBounds.maxBounds.maxY));
      tempMin = Math.max(tempMin, refinedBounds.maxBounds.minX);
      tempMax = Math.min(tempMax, refinedBounds.maxBounds.maxX);
    }
    if (debugChromeBoundsScanning) {
      console.log(`minBounds: ${minBounds}`);
      console.log(`maxBounds: ${maxBounds}`);
    }

    // @ts-expect-error
    const result = new Bounds2(
    // Do finite checks so we don't return NaN
    isFinite(minBounds.minX) && isFinite(maxBounds.minX) ? (minBounds.minX + maxBounds.minX) / 2 : Number.POSITIVE_INFINITY, isFinite(minBounds.minY) && isFinite(maxBounds.minY) ? (minBounds.minY + maxBounds.minY) / 2 : Number.POSITIVE_INFINITY, isFinite(minBounds.maxX) && isFinite(maxBounds.maxX) ? (minBounds.maxX + maxBounds.maxX) / 2 : Number.NEGATIVE_INFINITY, isFinite(minBounds.maxY) && isFinite(maxBounds.maxY) ? (minBounds.maxY + maxBounds.maxY) / 2 : Number.NEGATIVE_INFINITY);

    // extra data about our bounds
    result.minBounds = minBounds;
    result.maxBounds = maxBounds;
    result.isConsistent = maxBounds.containsBounds(minBounds);
    result.precision = Math.max(Math.abs(minBounds.minX - maxBounds.minX), Math.abs(minBounds.minY - maxBounds.minY), Math.abs(minBounds.maxX - maxBounds.maxX), Math.abs(minBounds.maxY - maxBounds.maxY));

    // return the average
    return result;
  },
  /*---------------------------------------------------------------------------*
   * WebGL utilities (TODO: separate file)
   *---------------------------------------------------------------------------*/

  /**
   * Finds the smallest power of 2 that is at least as large as n.
   *
   * @returns The smallest power of 2 that is greater than or equal n
   */
  toPowerOf2(n) {
    let result = 1;
    while (result < n) {
      result *= 2;
    }
    return result;
  },
  /**
   * Creates and compiles a GLSL Shader object in WebGL.
   */
  createShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log('GLSL compile error:');
      console.log(gl.getShaderInfoLog(shader));
      console.log(source);

      // Normally it would be best to throw an exception here, but a context loss could cause the shader parameter check
      // to fail, and we must handle context loss gracefully between any adjacent pair of gl calls.
      // Therefore, we simply report the errors to the console.  See #279
    }

    return shader;
  },
  applyWebGLContextDefaults(gl) {
    // What color gets set when we call gl.clear()
    gl.clearColor(0, 0, 0, 0);

    // Blending similar to http://localhost/phet/git/webgl-blendfunctions/blendfuncseparate.html
    gl.enable(gl.BLEND);

    // NOTE: We switched back to a fully premultiplied setup, so we have the corresponding blend function.
    // For normal colors (and custom WebGLNode handling), it is necessary to use premultiplied values (multiplying the
    // RGB values by the alpha value for gl_FragColor). For textured triangles, it is assumed that the texture is
    // already premultiplied, so the built-in shader does not do the extra premultiplication.
    // See https://github.com/phetsims/energy-skate-park/issues/39, https://github.com/phetsims/scenery/issues/397
    // and https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  },
  /**
   * Set whether webgl should be enabled, see docs for webglEnabled
   */
  setWebGLEnabled(_webglEnabled) {
    webglEnabled = _webglEnabled;
  },
  /**
   * Check to see whether webgl is supported, using the same strategy as mrdoob and pixi.js
   *
   * @param [extensions] - A list of WebGL extensions that need to be supported
   */
  checkWebGLSupport(extensions) {
    // The webgl check can be shut off, please see docs at webglEnabled declaration site
    if (!webglEnabled) {
      return false;
    }
    const canvas = document.createElement('canvas');
    const args = {
      failIfMajorPerformanceCaveat: true
    };
    try {
      // @ts-expect-error
      const gl = !!window.WebGLRenderingContext && (canvas.getContext('webgl', args) || canvas.getContext('experimental-webgl', args));
      if (!gl) {
        return false;
      }
      if (extensions) {
        for (let i = 0; i < extensions.length; i++) {
          if (gl.getExtension(extensions[i]) === null) {
            return false;
          }
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  },
  /**
   * Check to see whether IE11 has proper clearStencil support (required for three.js to work well).
   */
  checkIE11StencilSupport() {
    const canvas = document.createElement('canvas');
    try {
      // @ts-expect-error
      const gl = !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      if (!gl) {
        return false;
      }

      // Failure for https://github.com/mrdoob/three.js/issues/3600 / https://github.com/phetsims/molecule-shapes/issues/133
      gl.clearStencil(0);
      return gl.getError() === 0;
    } catch (e) {
      return false;
    }
  },
  /**
   * Whether WebGL (with decent performance) is supported by the platform
   */
  get isWebGLSupported() {
    if (_extensionlessWebGLSupport === undefined) {
      _extensionlessWebGLSupport = Utils.checkWebGLSupport();
    }
    return _extensionlessWebGLSupport;
  },
  /**
   * Triggers a loss of a WebGL context, with a delayed restoration.
   *
   * NOTE: Only use this for debugging. Should not be called normally.
   */
  loseContext(gl) {
    const extension = gl.getExtension('WEBGL_lose_context');
    if (extension) {
      extension.loseContext();

      // NOTE: We don't want to rely on a common timer, so we're using the built-in form on purpose.
      setTimeout(() => {
        // eslint-disable-line bad-sim-text
        extension.restoreContext();
      }, 1000);
    }
  },
  /**
   * Creates a string useful for working around https://github.com/phetsims/collision-lab/issues/177.
   */
  safariEmbeddingMarkWorkaround(str) {
    if (platform.safari) {
      // Add in zero-width spaces for Safari, so it doesn't have adjacent embedding marks ever (which seems to prevent
      // things).
      return str.split('').join('\u200B');
    } else {
      return str;
    }
  }
};
scenery.register('Utils', Utils);
export default Utils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiTWF0cml4MyIsIlRyYW5zZm9ybTMiLCJWZWN0b3IyIiwicGxhdGZvcm0iLCJGZWF0dXJlcyIsInNjZW5lcnkiLCJwIiwieCIsInkiLCJkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nIiwidHJhbnNmb3JtUHJvcGVydHkiLCJ0cmFuc2Zvcm0iLCJ0cmFuc2Zvcm1PcmlnaW5Qcm9wZXJ0eSIsInRyYW5zZm9ybU9yaWdpbiIsIndlYmdsRW5hYmxlZCIsIl9leHRlbnNpb25sZXNzV2ViR0xTdXBwb3J0IiwiVXRpbHMiLCJwcmVwYXJlRm9yVHJhbnNmb3JtIiwiZWxlbWVudCIsInN0eWxlIiwiYXBwbHlQcmVwYXJlZFRyYW5zZm9ybSIsIm1hdHJpeCIsImdldENTU1RyYW5zZm9ybSIsInNldFRyYW5zZm9ybSIsInRyYW5zZm9ybVN0cmluZyIsInVuc2V0VHJhbnNmb3JtIiwicG9seWZpbGxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ3aW5kb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImNhbGxiYWNrIiwidGltZUF0U3RhcnQiLCJEYXRlIiwibm93Iiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCIsImJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJjb250ZXh0Iiwid2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJtc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJvQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImJhY2tpbmdTY2FsZSIsImJhY2tpbmdTdG9yZVJhdGlvIiwiZGV2aWNlUGl4ZWxSYXRpbyIsInN1cHBvcnRzTmF0aXZlQ2FudmFzRmlsdGVyIiwiY2FudmFzRmlsdGVyIiwic3VwcG9ydHNJbWFnZURhdGFDYW52YXNGaWx0ZXIiLCJzY3JhdGNoQ29udGV4dCIsInNjYW5Cb3VuZHMiLCJpbWFnZURhdGEiLCJyZXNvbHV0aW9uIiwiZGlydHlYIiwiXyIsIm1hcCIsInJhbmdlIiwiZGlydHlZIiwib2Zmc2V0IiwiZGF0YSIsIm1pblgiLCJpbmRleE9mIiwibWF4WCIsImxhc3RJbmRleE9mIiwibWluWSIsIm1heFkiLCJleHRyYVNwcmVhZCIsIm1pbkJvdW5kcyIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiaW52ZXJzZVBvc2l0aW9uMiIsIk5FR0FUSVZFX0lORklOSVRZIiwibWF4Qm91bmRzIiwiY2FudmFzQWNjdXJhdGVCb3VuZHMiLCJyZW5kZXJUb0NvbnRleHQiLCJvcHRpb25zIiwicHJlY2lzaW9uIiwiaW5pdGlhbFNjYWxlIiwiTk9USElORyIsIkVWRVJZVEhJTkciLCJjYW52YXMiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImdldENvbnRleHQiLCIkIiwicmVhZHkiLCJoZWFkZXIiLCJ0ZXh0IiwiYXBwZW5kIiwic2NhbiIsInNhdmUiLCJjYW52YXNTZXRUcmFuc2Zvcm0iLCJyZXN0b3JlIiwiZ2V0SW1hZ2VEYXRhIiwibWluTWF4Qm91bmRzIiwic25hcHNob3RUb0NhbnZhcyIsInNuYXBzaG90IiwicHV0SW1hZ2VEYXRhIiwiY3NzIiwiY2xlYXJSZWN0IiwiaWRlYWxUcmFuc2Zvcm0iLCJib3VuZHMiLCJib3JkZXJTaXplIiwic2NhbGVYIiwic2NhbGVZIiwidHJhbnNsYXRpb25YIiwidHJhbnNsYXRpb25ZIiwidHJhbnNsYXRpb24iLCJ0aW1lc01hdHJpeCIsInNjYWxpbmciLCJpbml0aWFsVHJhbnNmb3JtIiwiY29hcnNlQm91bmRzIiwidW5pb24iLCJpbnRlcnNlY3Rpb24iLCJ0ZW1wTWluIiwidGVtcE1heCIsInJlZmluZWRCb3VuZHMiLCJpc0Zpbml0ZSIsIk1hdGgiLCJhYnMiLCJjb25zb2xlIiwibG9nIiwidHJhbnNmb3JtUG9zaXRpb24yIiwid2l0aE1pblgiLCJtaW4iLCJtYXgiLCJ3aXRoTWF4WCIsIndpdGhNaW5ZIiwid2l0aE1heFkiLCJyZXN1bHQiLCJpc0NvbnNpc3RlbnQiLCJjb250YWluc0JvdW5kcyIsInRvUG93ZXJPZjIiLCJuIiwiY3JlYXRlU2hhZGVyIiwiZ2wiLCJzb3VyY2UiLCJ0eXBlIiwic2hhZGVyIiwic2hhZGVyU291cmNlIiwiY29tcGlsZVNoYWRlciIsImdldFNoYWRlclBhcmFtZXRlciIsIkNPTVBJTEVfU1RBVFVTIiwiZ2V0U2hhZGVySW5mb0xvZyIsImFwcGx5V2ViR0xDb250ZXh0RGVmYXVsdHMiLCJjbGVhckNvbG9yIiwiZW5hYmxlIiwiQkxFTkQiLCJibGVuZEZ1bmMiLCJPTkUiLCJPTkVfTUlOVVNfU1JDX0FMUEhBIiwic2V0V2ViR0xFbmFibGVkIiwiX3dlYmdsRW5hYmxlZCIsImNoZWNrV2ViR0xTdXBwb3J0IiwiZXh0ZW5zaW9ucyIsImFyZ3MiLCJmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0IiwiV2ViR0xSZW5kZXJpbmdDb250ZXh0IiwiaSIsImxlbmd0aCIsImdldEV4dGVuc2lvbiIsImUiLCJjaGVja0lFMTFTdGVuY2lsU3VwcG9ydCIsImNsZWFyU3RlbmNpbCIsImdldEVycm9yIiwiaXNXZWJHTFN1cHBvcnRlZCIsInVuZGVmaW5lZCIsImxvc2VDb250ZXh0IiwiZXh0ZW5zaW9uIiwicmVzdG9yZUNvbnRleHQiLCJzYWZhcmlFbWJlZGRpbmdNYXJrV29ya2Fyb3VuZCIsInN0ciIsInNhZmFyaSIsInNwbGl0Iiwiam9pbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR2VuZXJhbCB1dGlsaXR5IGZ1bmN0aW9ucyBmb3IgU2NlbmVyeVxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBUcmFuc2Zvcm0zIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9UcmFuc2Zvcm0zLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcclxuaW1wb3J0IHsgRmVhdHVyZXMsIHNjZW5lcnkgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuXHJcbi8vIGNvbnZlbmllbmNlIGZ1bmN0aW9uXHJcbmZ1bmN0aW9uIHAoIHg6IG51bWJlciwgeTogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG59XHJcblxyXG4vLyBUT0RPOiByZW1vdmUgZmxhZyBhbmQgdGVzdHMgYWZ0ZXIgd2UncmUgZG9uZVxyXG5jb25zdCBkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nID0gZmFsc2U7XHJcblxyXG4vLyBkZXRlY3QgcHJvcGVybHkgcHJlZml4ZWQgdHJhbnNmb3JtIGFuZCB0cmFuc2Zvcm1PcmlnaW4gcHJvcGVydGllc1xyXG5jb25zdCB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IEZlYXR1cmVzLnRyYW5zZm9ybTtcclxuY29uc3QgdHJhbnNmb3JtT3JpZ2luUHJvcGVydHkgPSBGZWF0dXJlcy50cmFuc2Zvcm1PcmlnaW4gfHwgJ3RyYW5zZm9ybU9yaWdpbic7IC8vIGZhbGxiYWNrLCBzbyB3ZSBkb24ndCB0cnkgdG8gc2V0IGFuIGVtcHR5IHN0cmluZyBwcm9wZXJ0eSBsYXRlclxyXG5cclxuLy8gU2NlbmVyeSBhcHBsaWNhdGlvbnMgdGhhdCBkbyBub3QgdXNlIFdlYkdMIG1heSB0cmlnZ2VyIGEgfiAwLjUgc2Vjb25kIHBhdXNlIHNob3J0bHkgYWZ0ZXIgbGF1bmNoIG9uIHNvbWUgcGxhdGZvcm1zLlxyXG4vLyBXZWJnbCBpcyBlbmFibGVkIGJ5IGRlZmF1bHQgYnV0IG1heSBiZSBzaHV0IG9mZiBmb3IgYXBwbGljYXRpb25zIHRoYXQga25vdyB0aGV5IHdpbGwgbm90IHdhbnQgdG8gdXNlIGl0XHJcbi8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvNjIxXHJcbmxldCB3ZWJnbEVuYWJsZWQgPSB0cnVlO1xyXG5cclxubGV0IF9leHRlbnNpb25sZXNzV2ViR0xTdXBwb3J0OiBib29sZWFuIHwgdW5kZWZpbmVkOyAvLyBsYXppbHkgY29tcHV0ZWRcclxuXHJcbmNvbnN0IFV0aWxzID0ge1xyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIFRyYW5zZm9ybWF0aW9uIFV0aWxpdGllcyAoVE9ETzogc2VwYXJhdGUgZmlsZSlcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIFByZXBhcmVzIGEgRE9NIGVsZW1lbnQgZm9yIHVzZSB3aXRoIGFwcGx5UHJlcGFyZWRUcmFuc2Zvcm0oKS4gQXBwbGllcyBzb21lIENTUyBzdHlsZXMgdGhhdCBhcmUgcmVxdWlyZWQsIGJ1dFxyXG4gICAqIHRoYXQgd2UgZG9uJ3Qgd2FudCB0byBzZXQgd2hpbGUgYW5pbWF0aW5nLlxyXG4gICAqL1xyXG4gIHByZXBhcmVGb3JUcmFuc2Zvcm0oIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcclxuICAgIGVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybU9yaWdpblByb3BlcnR5IF0gPSAndG9wIGxlZnQnO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEFwcGxpZXMgdGhlIENTUyB0cmFuc2Zvcm0gb2YgdGhlIG1hdHJpeCB0byB0aGUgZWxlbWVudCwgd2l0aCBvcHRpb25hbCBmb3JjaW5nIG9mIGFjY2VsZXJhdGlvbi5cclxuICAgKiBOT1RFOiBwcmVwYXJlRm9yVHJhbnNmb3JtIHNob3VsZCBiZSBjYWxsZWQgYXQgbGVhc3Qgb25jZSBvbiB0aGUgZWxlbWVudCBiZWZvcmUgdGhpcyBtZXRob2QgaXMgdXNlZC5cclxuICAgKi9cclxuICBhcHBseVByZXBhcmVkVHJhbnNmb3JtKCBtYXRyaXg6IE1hdHJpeDMsIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcclxuICAgIC8vIE5PVEU6IG5vdCBhcHBseWluZyB0cmFuc2xhdGVaLCBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDAxNDQ2MS93aHktZG9lcy1lbmFibGluZy1oYXJkd2FyZS1hY2NlbGVyYXRpb24taW4tY3NzMy1zbG93LWRvd24tcGVyZm9ybWFuY2VcclxuICAgIGVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSBtYXRyaXguZ2V0Q1NTVHJhbnNmb3JtKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbGllcyBhIENTUyB0cmFuc2Zvcm0gdmFsdWUgc3RyaW5nIHRvIGEgRE9NIGVsZW1lbnQuXHJcbiAgICogTk9URTogcHJlcGFyZUZvclRyYW5zZm9ybSBzaG91bGQgYmUgY2FsbGVkIGF0IGxlYXN0IG9uY2Ugb24gdGhlIGVsZW1lbnQgYmVmb3JlIHRoaXMgbWV0aG9kIGlzIHVzZWQuXHJcbiAgICovXHJcbiAgc2V0VHJhbnNmb3JtKCB0cmFuc2Zvcm1TdHJpbmc6IHN0cmluZywgZWxlbWVudDogSFRNTEVsZW1lbnQgfCBTVkdFbGVtZW50ICk6IHZvaWQge1xyXG4gICAgZWxlbWVudC5zdHlsZVsgdHJhbnNmb3JtUHJvcGVydHkgXSA9IHRyYW5zZm9ybVN0cmluZztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmVzIGEgQ1NTIHRyYW5zZm9ybSBmcm9tIGEgRE9NIGVsZW1lbnQuXHJcbiAgICovXHJcbiAgdW5zZXRUcmFuc2Zvcm0oIGVsZW1lbnQ6IEhUTUxFbGVtZW50IHwgU1ZHRWxlbWVudCApOiB2b2lkIHtcclxuICAgIGVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAnJztcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBFbnN1cmVzIHRoYXQgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSBhbmQgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHVzZSBhIG5hdGl2ZSBpbXBsZW1lbnRhdGlvbiBpZiBwb3NzaWJsZSxcclxuICAgKiBvdGhlcndpc2UgdXNpbmcgYSBzaW1wbGUgc2V0VGltZW91dCBpbnRlcm5hbGx5LiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzQyNlxyXG4gICAqL1xyXG4gIHBvbHlmaWxsUmVxdWVzdEFuaW1hdGlvbkZyYW1lKCk6IHZvaWQge1xyXG4gICAgaWYgKCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lICkge1xyXG4gICAgICAvLyBGYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBpZiBubyBwcmVmaXhlZCB2ZXJzaW9uIGlzIGF2YWlsYWJsZVxyXG4gICAgICBpZiAoICFGZWF0dXJlcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIUZlYXR1cmVzLmNhbmNlbEFuaW1hdGlvbkZyYW1lICkge1xyXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBjYWxsYmFjayA9PiB7XHJcbiAgICAgICAgICBjb25zdCB0aW1lQXRTdGFydCA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICAgICAgLy8gTk9URTogV2UgZG9uJ3Qgd2FudCB0byByZWx5IG9uIGEgY29tbW9uIHRpbWVyLCBzbyB3ZSdyZSB1c2luZyB0aGUgYnVpbHQtaW4gZm9ybSBvbiBwdXJwb3NlLlxyXG4gICAgICAgICAgcmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KCAoKSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFkLXNpbS10ZXh0XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKCBEYXRlLm5vdygpIC0gdGltZUF0U3RhcnQgKTtcclxuICAgICAgICAgIH0sIDE2ICk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XHJcbiAgICAgIH1cclxuICAgICAgLy8gRmlsbCBpbiB0aGUgbm9uLXByZWZpeGVkIG5hbWVzIHdpdGggdGhlIHByZWZpeGVkIHZlcnNpb25zXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyBGZWF0dXJlcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgXTtcclxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyBGZWF0dXJlcy5jYW5jZWxBbmltYXRpb25GcmFtZSBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgcmVsYXRpdmUgc2l6ZSBvZiB0aGUgY29udGV4dCdzIGJhY2tpbmcgc3RvcmUgY29tcGFyZWQgdG8gdGhlIGFjdHVhbCBDYW52YXMuIEZvciBleGFtcGxlLCBpZiBpdCdzIDIsXHJcbiAgICogdGhlIGJhY2tpbmcgc3RvcmUgaGFzIDJ4MiB0aGUgYW1vdW50IG9mIHBpeGVscyAoNCB0aW1lcyB0b3RhbCkuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBUaGUgYmFja2luZyBzdG9yZSBwaXhlbCByYXRpby5cclxuICAgKi9cclxuICBiYWNraW5nU3RvcmVQaXhlbFJhdGlvKCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBXZWJHTFJlbmRlcmluZ0NvbnRleHQgKTogbnVtYmVyIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgIHJldHVybiBjb250ZXh0LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcclxuICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgICAgY29udGV4dC5tb3pCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XHJcbiAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgIGNvbnRleHQubXNCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XHJcbiAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgIGNvbnRleHQub0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcclxuICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgICAgY29udGV4dC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDE7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgdGhhdCBuZWVkcyB0byBiZSBhcHBsaWVkIGZvciBoYW5kbGluZyBhIEhpRFBJIENhbnZhc1xyXG4gICAqIFNlZSBzZWUgaHR0cDovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9zYWZhcmkvI2RvY3VtZW50YXRpb24vQXVkaW9WaWRlby9Db25jZXB0dWFsL0hUTUwtY2FudmFzLWd1aWRlL1NldHRpbmdVcHRoZUNhbnZhcy9TZXR0aW5nVXB0aGVDYW52YXMuaHRtbCMvL2FwcGxlX3JlZi9kb2MvdWlkL1RQNDAwMTA1NDItQ0gyLVNXNVxyXG4gICAqIEFuZCBpdCdzIHVwZGF0ZWQgYmFzZWQgb24gaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi90dXRvcmlhbHMvY2FudmFzL2hpZHBpL1xyXG4gICAqL1xyXG4gIGJhY2tpbmdTY2FsZSggY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgV2ViR0xSZW5kZXJpbmdDb250ZXh0ICk6IG51bWJlciB7XHJcbiAgICBpZiAoICdkZXZpY2VQaXhlbFJhdGlvJyBpbiB3aW5kb3cgKSB7XHJcbiAgICAgIGNvbnN0IGJhY2tpbmdTdG9yZVJhdGlvID0gVXRpbHMuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyggY29udGV4dCApO1xyXG5cclxuICAgICAgcmV0dXJuIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC8gYmFja2luZ1N0b3JlUmF0aW87XHJcbiAgICB9XHJcbiAgICByZXR1cm4gMTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBXaGV0aGVyIHRoZSBuYXRpdmUgQ2FudmFzIEhUTUw1IEFQSSBzdXBwb3J0cyB0aGUgJ2ZpbHRlcicgYXR0cmlidXRlIChzaW1pbGFyIHRvIHRoZSBDU1MvU1ZHIGZpbHRlciBhdHRyaWJ1dGUpLlxyXG4gICAqL1xyXG4gIHN1cHBvcnRzTmF0aXZlQ2FudmFzRmlsdGVyKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICEhRmVhdHVyZXMuY2FudmFzRmlsdGVyO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgd2UgY2FuIGhhbmRsZSBhcmJpdHJhcnkgZmlsdGVycyBpbiBDYW52YXMgYnkgbWFuaXB1bGF0aW5nIHRoZSBJbWFnZURhdGEgcmV0dXJuZWQuIElmIHdlIGhhdmUgYSBiYWNraW5nXHJcbiAgICogc3RvcmUgcGl4ZWwgcmF0aW8gdGhhdCBpcyBub24tMSwgd2UnbGwgYmUgYmx1cnJpbmcgb3V0IHRoaW5ncyBkdXJpbmcgdGhhdCBvcGVyYXRpb24sIHdoaWNoIHdvdWxkIGJlIHVuYWNjZXB0YWJsZS5cclxuICAgKi9cclxuICBzdXBwb3J0c0ltYWdlRGF0YUNhbnZhc0ZpbHRlcigpOiBib29sZWFuIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETzogc2NlbmVyeSBhbmQgdHlwaW5nXHJcbiAgICByZXR1cm4gVXRpbHMuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyggc2NlbmVyeS5zY3JhdGNoQ29udGV4dCApID09PSAxO1xyXG4gIH0sXHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIFRleHQgYm91bmRzIHV0aWxpdGllcyAoVE9ETzogc2VwYXJhdGUgZmlsZSlcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgZGF0YSBzbmFwc2hvdCBhbmQgdHJhbnNmb3JtLCBjYWxjdWxhdGUgcmFuZ2Ugb24gaG93IGxhcmdlIC8gc21hbGwgdGhlIGJvdW5kcyBjYW4gYmUuIEl0J3NcclxuICAgKiB2ZXJ5IGNvbnNlcnZhdGl2ZSwgd2l0aCBhbiBlZmZlY3RpdmUgMXB4IGV4dHJhIHJhbmdlIHRvIGFsbG93IGZvciBkaWZmZXJlbmNlcyBpbiBhbnRpLWFsaWFzaW5nXHJcbiAgICogZm9yIHBlcmZvcm1hbmNlIGNvbmNlcm5zLCB0aGlzIGRvZXMgbm90IHN1cHBvcnQgc2tld3MgLyByb3RhdGlvbnMgLyBhbnl0aGluZyBidXQgdHJhbnNsYXRpb24gYW5kIHNjYWxpbmdcclxuICAgKi9cclxuICBzY2FuQm91bmRzKCBpbWFnZURhdGE6IEltYWdlRGF0YSwgcmVzb2x1dGlvbjogbnVtYmVyLCB0cmFuc2Zvcm06IFRyYW5zZm9ybTMgKTogeyBtaW5Cb3VuZHM6IEJvdW5kczI7IG1heEJvdW5kczogQm91bmRzMiB9IHtcclxuXHJcbiAgICAvLyBlbnRyeSB3aWxsIGJlIHRydWUgaWYgYW55IHBpeGVsIHdpdGggdGhlIGdpdmVuIHggb3IgeSB2YWx1ZSBpcyBub24tcmdiYSgwLDAsMCwwKVxyXG4gICAgY29uc3QgZGlydHlYID0gXy5tYXAoIF8ucmFuZ2UoIHJlc29sdXRpb24gKSwgKCkgPT4gZmFsc2UgKTtcclxuICAgIGNvbnN0IGRpcnR5WSA9IF8ubWFwKCBfLnJhbmdlKCByZXNvbHV0aW9uICksICgpID0+IGZhbHNlICk7XHJcblxyXG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgcmVzb2x1dGlvbjsgeCsrICkge1xyXG4gICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCByZXNvbHV0aW9uOyB5KysgKSB7XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gNCAqICggeSAqIHJlc29sdXRpb24gKyB4ICk7XHJcbiAgICAgICAgaWYgKCBpbWFnZURhdGEuZGF0YVsgb2Zmc2V0IF0gIT09IDAgfHwgaW1hZ2VEYXRhLmRhdGFbIG9mZnNldCArIDEgXSAhPT0gMCB8fCBpbWFnZURhdGEuZGF0YVsgb2Zmc2V0ICsgMiBdICE9PSAwIHx8IGltYWdlRGF0YS5kYXRhWyBvZmZzZXQgKyAzIF0gIT09IDAgKSB7XHJcbiAgICAgICAgICBkaXJ0eVhbIHggXSA9IHRydWU7XHJcbiAgICAgICAgICBkaXJ0eVlbIHkgXSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbWluWCA9IF8uaW5kZXhPZiggZGlydHlYLCB0cnVlICk7XHJcbiAgICBjb25zdCBtYXhYID0gXy5sYXN0SW5kZXhPZiggZGlydHlYLCB0cnVlICk7XHJcbiAgICBjb25zdCBtaW5ZID0gXy5pbmRleE9mKCBkaXJ0eVksIHRydWUgKTtcclxuICAgIGNvbnN0IG1heFkgPSBfLmxhc3RJbmRleE9mKCBkaXJ0eVksIHRydWUgKTtcclxuXHJcbiAgICAvLyBiYXNlZCBvbiBwaXhlbCBib3VuZGFyaWVzLiBmb3IgbWluQm91bmRzLCB0aGUgaW5uZXIgZWRnZSBvZiB0aGUgZGlydHkgcGl4ZWwuIGZvciBtYXhCb3VuZHMsIHRoZSBvdXRlciBlZGdlIG9mIHRoZSBhZGphY2VudCBub24tZGlydHkgcGl4ZWxcclxuICAgIC8vIHJlc3VsdHMgaW4gYSBzcHJlYWQgb2YgMiBmb3IgdGhlIGlkZW50aXR5IHRyYW5zZm9ybSAob3IgYW55IHRyYW5zbGF0ZWQgZm9ybSlcclxuICAgIGNvbnN0IGV4dHJhU3ByZWFkID0gcmVzb2x1dGlvbiAvIDE2OyAvLyBpcyBDaHJvbWUgYW50aWFsaWFzaW5nIHJlYWxseSBsaWtlIHRoaXM/IGRlYXIgZ29kLi4uIFRPRE8hISFcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG1pbkJvdW5kczogbmV3IEJvdW5kczIoXHJcbiAgICAgICAgKCBtaW5YIDwgMSB8fCBtaW5YID49IHJlc29sdXRpb24gLSAxICkgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiB0cmFuc2Zvcm0uaW52ZXJzZVBvc2l0aW9uMiggcCggbWluWCArIDEgKyBleHRyYVNwcmVhZCwgMCApICkueCxcclxuICAgICAgICAoIG1pblkgPCAxIHx8IG1pblkgPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCAwLCBtaW5ZICsgMSArIGV4dHJhU3ByZWFkICkgKS55LFxyXG4gICAgICAgICggbWF4WCA8IDEgfHwgbWF4WCA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIG1heFggLSBleHRyYVNwcmVhZCwgMCApICkueCxcclxuICAgICAgICAoIG1heFkgPCAxIHx8IG1heFkgPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCAwLCBtYXhZIC0gZXh0cmFTcHJlYWQgKSApLnlcclxuICAgICAgKSxcclxuICAgICAgbWF4Qm91bmRzOiBuZXcgQm91bmRzMihcclxuICAgICAgICAoIG1pblggPCAxIHx8IG1pblggPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5ORUdBVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCBtaW5YIC0gMSAtIGV4dHJhU3ByZWFkLCAwICkgKS54LFxyXG4gICAgICAgICggbWluWSA8IDEgfHwgbWluWSA+PSByZXNvbHV0aW9uIC0gMSApID8gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZIDogdHJhbnNmb3JtLmludmVyc2VQb3NpdGlvbjIoIHAoIDAsIG1pblkgLSAxIC0gZXh0cmFTcHJlYWQgKSApLnksXHJcbiAgICAgICAgKCBtYXhYIDwgMSB8fCBtYXhYID49IHJlc29sdXRpb24gLSAxICkgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiB0cmFuc2Zvcm0uaW52ZXJzZVBvc2l0aW9uMiggcCggbWF4WCArIDIgKyBleHRyYVNwcmVhZCwgMCApICkueCxcclxuICAgICAgICAoIG1heFkgPCAxIHx8IG1heFkgPj0gcmVzb2x1dGlvbiAtIDEgKSA/IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSA6IHRyYW5zZm9ybS5pbnZlcnNlUG9zaXRpb24yKCBwKCAwLCBtYXhZICsgMiArIGV4dHJhU3ByZWFkICkgKS55XHJcbiAgICAgIClcclxuICAgIH07XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogTWVhc3VyZXMgYWNjdXJhdGUgYm91bmRzIG9mIGEgZnVuY3Rpb24gdGhhdCBkcmF3cyB0aGluZ3MgdG8gYSBDYW52YXMuXHJcbiAgICovXHJcbiAgY2FudmFzQWNjdXJhdGVCb3VuZHMoIHJlbmRlclRvQ29udGV4dDogKCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgKSA9PiB2b2lkLCBvcHRpb25zPzogeyBwcmVjaXNpb24/OiBudW1iZXI7IHJlc29sdXRpb24/OiBudW1iZXI7IGluaXRpYWxTY2FsZT86IG51bWJlciB9ICk6IEJvdW5kczIgJiB7IG1pbkJvdW5kczogQm91bmRzMjsgbWF4Qm91bmRzOiBCb3VuZHMyOyBpc0NvbnNpc3RlbnQ6IGJvb2xlYW47IHByZWNpc2lvbjogbnVtYmVyIH0ge1xyXG4gICAgLy8gaG93IGNsb3NlIHRvIHRoZSBhY3R1YWwgYm91bmRzIGRvIHdlIG5lZWQgdG8gYmU/XHJcbiAgICBjb25zdCBwcmVjaXNpb24gPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVjaXNpb24gKSA/IG9wdGlvbnMucHJlY2lzaW9uIDogMC4wMDE7XHJcblxyXG4gICAgLy8gNTEyeDUxMiBkZWZhdWx0IHNxdWFyZSByZXNvbHV0aW9uXHJcbiAgICBjb25zdCByZXNvbHV0aW9uID0gKCBvcHRpb25zICYmIG9wdGlvbnMucmVzb2x1dGlvbiApID8gb3B0aW9ucy5yZXNvbHV0aW9uIDogMTI4O1xyXG5cclxuICAgIC8vIGF0IDEvMTZ4IGRlZmF1bHQsIHdlIHdhbnQgdG8gYmUgYWJsZSB0byBnZXQgdGhlIGJvdW5kcyBhY2N1cmF0ZWx5IGZvciBzb21ldGhpbmcgYXMgbGFyZ2UgYXMgMTZ4IG91ciBpbml0aWFsIHJlc29sdXRpb25cclxuICAgIC8vIGRpdmlzaWJsZSBieSAyIHNvIGhvcGVmdWxseSB3ZSBhdm9pZCBtb3JlIHF1aXJrcyBmcm9tIENhbnZhcyByZW5kZXJpbmcgZW5naW5lc1xyXG4gICAgY29uc3QgaW5pdGlhbFNjYWxlID0gKCBvcHRpb25zICYmIG9wdGlvbnMuaW5pdGlhbFNjYWxlICkgPyBvcHRpb25zLmluaXRpYWxTY2FsZSA6ICggMSAvIDE2ICk7XHJcblxyXG4gICAgbGV0IG1pbkJvdW5kcyA9IEJvdW5kczIuTk9USElORztcclxuICAgIGxldCBtYXhCb3VuZHMgPSBCb3VuZHMyLkVWRVJZVEhJTkc7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IHJlc29sdXRpb247XHJcbiAgICBjYW52YXMuaGVpZ2h0ID0gcmVzb2x1dGlvbjtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuXHJcbiAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XHJcbiAgICAgICQoIHdpbmRvdyApLnJlYWR5KCAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2gyJyApO1xyXG4gICAgICAgICQoIGhlYWRlciApLnRleHQoICdCb3VuZHMgU2NhbicgKTtcclxuICAgICAgICAkKCAnI2Rpc3BsYXknICkuYXBwZW5kKCBoZWFkZXIgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE86IERvbid0IHVzZSBUcmFuc2Zvcm0zIHVubGVzcyBpdCBpcyBuZWNlc3NhcnlcclxuICAgIGZ1bmN0aW9uIHNjYW4oIHRyYW5zZm9ybTogVHJhbnNmb3JtMyApOiB7IG1pbkJvdW5kczogQm91bmRzMjsgbWF4Qm91bmRzOiBCb3VuZHMyIH0ge1xyXG4gICAgICAvLyBzYXZlL3Jlc3RvcmUsIGluIGNhc2UgdGhlIHJlbmRlciB0cmllcyB0byBkbyBhbnkgZnVubnkgc3R1ZmYgbGlrZSBjbGlwcGluZywgZXRjLlxyXG4gICAgICBjb250ZXh0LnNhdmUoKTtcclxuICAgICAgdHJhbnNmb3JtLm1hdHJpeC5jYW52YXNTZXRUcmFuc2Zvcm0oIGNvbnRleHQgKTtcclxuICAgICAgcmVuZGVyVG9Db250ZXh0KCBjb250ZXh0ICk7XHJcbiAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKCAwLCAwLCByZXNvbHV0aW9uLCByZXNvbHV0aW9uICk7XHJcbiAgICAgIGNvbnN0IG1pbk1heEJvdW5kcyA9IFV0aWxzLnNjYW5Cb3VuZHMoIGRhdGEsIHJlc29sdXRpb24sIHRyYW5zZm9ybSApO1xyXG5cclxuICAgICAgZnVuY3Rpb24gc25hcHNob3RUb0NhbnZhcyggc25hcHNob3Q6IEltYWdlRGF0YSApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHJlc29sdXRpb247XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHJlc29sdXRpb247XHJcbiAgICAgICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCAnMmQnICkhO1xyXG4gICAgICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKCBzbmFwc2hvdCwgMCwgMCApO1xyXG4gICAgICAgICQoIGNhbnZhcyApLmNzcyggJ2JvcmRlcicsICcxcHggc29saWQgYmxhY2snICk7XHJcbiAgICAgICAgJCggd2luZG93ICkucmVhZHkoICgpID0+IHtcclxuICAgICAgICAgIC8vJCggJyNkaXNwbGF5JyApLmFwcGVuZCggJCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKSApLnRleHQoICdCb3VuZHM6ICcgKyAgKSApO1xyXG4gICAgICAgICAgJCggJyNkaXNwbGF5JyApLmFwcGVuZCggY2FudmFzICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBUT0RPOiByZW1vdmUgYWZ0ZXIgZGVidWdcclxuICAgICAgaWYgKCBkZWJ1Z0Nocm9tZUJvdW5kc1NjYW5uaW5nICkge1xyXG4gICAgICAgIHNuYXBzaG90VG9DYW52YXMoIGRhdGEgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29udGV4dC5jbGVhclJlY3QoIDAsIDAsIHJlc29sdXRpb24sIHJlc29sdXRpb24gKTtcclxuXHJcbiAgICAgIHJldHVybiBtaW5NYXhCb3VuZHM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYXR0ZW1wdHMgdG8gbWFwIHRoZSBib3VuZHMgc3BlY2lmaWVkIHRvIHRoZSBlbnRpcmUgdGVzdGluZyBjYW52YXMgKG1pbnVzIGEgZmluZSBib3JkZXIpLCBzbyB3ZSBjYW4gbmFpbCBkb3duIHRoZSBsb2NhdGlvbiBxdWlja2x5XHJcbiAgICBmdW5jdGlvbiBpZGVhbFRyYW5zZm9ybSggYm91bmRzOiBCb3VuZHMyICk6IFRyYW5zZm9ybTMge1xyXG4gICAgICAvLyBzbyB0aGF0IHRoZSBib3VuZHMtZWRnZSBkb2Vzbid0IGxhbmQgc3F1YXJlbHkgb24gdGhlIGJvdW5kYXJ5XHJcbiAgICAgIGNvbnN0IGJvcmRlclNpemUgPSAyO1xyXG5cclxuICAgICAgY29uc3Qgc2NhbGVYID0gKCByZXNvbHV0aW9uIC0gYm9yZGVyU2l6ZSAqIDIgKSAvICggYm91bmRzLm1heFggLSBib3VuZHMubWluWCApO1xyXG4gICAgICBjb25zdCBzY2FsZVkgPSAoIHJlc29sdXRpb24gLSBib3JkZXJTaXplICogMiApIC8gKCBib3VuZHMubWF4WSAtIGJvdW5kcy5taW5ZICk7XHJcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uWCA9IC1zY2FsZVggKiBib3VuZHMubWluWCArIGJvcmRlclNpemU7XHJcbiAgICAgIGNvbnN0IHRyYW5zbGF0aW9uWSA9IC1zY2FsZVkgKiBib3VuZHMubWluWSArIGJvcmRlclNpemU7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybTMoIE1hdHJpeDMudHJhbnNsYXRpb24oIHRyYW5zbGF0aW9uWCwgdHJhbnNsYXRpb25ZICkudGltZXNNYXRyaXgoIE1hdHJpeDMuc2NhbGluZyggc2NhbGVYLCBzY2FsZVkgKSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbFRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0zKCk7XHJcbiAgICAvLyBtYWtlIHN1cmUgdG8gaW5pdGlhbGx5IGNlbnRlciBvdXIgb2JqZWN0LCBzbyB3ZSBkb24ndCBtaXNzIHRoZSBib3VuZHNcclxuICAgIGluaXRpYWxUcmFuc2Zvcm0uYXBwZW5kKCBNYXRyaXgzLnRyYW5zbGF0aW9uKCByZXNvbHV0aW9uIC8gMiwgcmVzb2x1dGlvbiAvIDIgKSApO1xyXG4gICAgaW5pdGlhbFRyYW5zZm9ybS5hcHBlbmQoIE1hdHJpeDMuc2NhbGluZyggaW5pdGlhbFNjYWxlICkgKTtcclxuXHJcbiAgICBjb25zdCBjb2Fyc2VCb3VuZHMgPSBzY2FuKCBpbml0aWFsVHJhbnNmb3JtICk7XHJcblxyXG4gICAgbWluQm91bmRzID0gbWluQm91bmRzLnVuaW9uKCBjb2Fyc2VCb3VuZHMubWluQm91bmRzICk7XHJcbiAgICBtYXhCb3VuZHMgPSBtYXhCb3VuZHMuaW50ZXJzZWN0aW9uKCBjb2Fyc2VCb3VuZHMubWF4Qm91bmRzICk7XHJcblxyXG4gICAgbGV0IHRlbXBNaW47XHJcbiAgICBsZXQgdGVtcE1heDtcclxuICAgIGxldCByZWZpbmVkQm91bmRzO1xyXG5cclxuICAgIC8vIG1pblhcclxuICAgIHRlbXBNaW4gPSBtYXhCb3VuZHMubWluWTtcclxuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WTtcclxuICAgIHdoaWxlICggaXNGaW5pdGUoIG1pbkJvdW5kcy5taW5YICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5taW5YICkgJiYgTWF0aC5hYnMoIG1pbkJvdW5kcy5taW5YIC0gbWF4Qm91bmRzLm1pblggKSA+IHByZWNpc2lvbiApIHtcclxuICAgICAgLy8gdXNlIG1heGltdW0gYm91bmRzIGV4Y2VwdCBmb3IgdGhlIHggZGlyZWN0aW9uLCBzbyB3ZSBkb24ndCBtaXNzIHRoaW5ncyB0aGF0IHdlIGFyZSBsb29raW5nIGZvclxyXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCBtYXhCb3VuZHMubWluWCwgdGVtcE1pbiwgbWluQm91bmRzLm1pblgsIHRlbXBNYXggKSApICk7XHJcblxyXG4gICAgICBpZiAoIG1pbkJvdW5kcy5taW5YIDw9IHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1pblggJiYgbWF4Qm91bmRzLm1pblggPj0gcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWluWCApIHtcclxuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcclxuICAgICAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhcm5pbmcsIGV4aXRpbmcgaW5maW5pdGUgbG9vcCEnICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYHRyYW5zZm9ybWVkIFwibWluXCIgbWluWDogJHtpZGVhbFRyYW5zZm9ybSggbmV3IEJvdW5kczIoIG1heEJvdW5kcy5taW5YLCBtYXhCb3VuZHMubWluWSwgbWluQm91bmRzLm1pblgsIG1heEJvdW5kcy5tYXhZICkgKS50cmFuc2Zvcm1Qb3NpdGlvbjIoIHAoIG1pbkJvdW5kcy5taW5YLCAwICkgKX1gICk7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYHRyYW5zZm9ybWVkIFwibWF4XCIgbWluWDogJHtpZGVhbFRyYW5zZm9ybSggbmV3IEJvdW5kczIoIG1heEJvdW5kcy5taW5YLCBtYXhCb3VuZHMubWluWSwgbWluQm91bmRzLm1pblgsIG1heEJvdW5kcy5tYXhZICkgKS50cmFuc2Zvcm1Qb3NpdGlvbjIoIHAoIG1heEJvdW5kcy5taW5YLCAwICkgKX1gICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtaW5Cb3VuZHMgPSBtaW5Cb3VuZHMud2l0aE1pblgoIE1hdGgubWluKCBtaW5Cb3VuZHMubWluWCwgcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWluWCApICk7XHJcbiAgICAgIG1heEJvdW5kcyA9IG1heEJvdW5kcy53aXRoTWluWCggTWF0aC5tYXgoIG1heEJvdW5kcy5taW5YLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5YICkgKTtcclxuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5ZICk7XHJcbiAgICAgIHRlbXBNYXggPSBNYXRoLm1pbiggdGVtcE1heCwgcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWF4WSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1heFhcclxuICAgIHRlbXBNaW4gPSBtYXhCb3VuZHMubWluWTtcclxuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WTtcclxuICAgIHdoaWxlICggaXNGaW5pdGUoIG1pbkJvdW5kcy5tYXhYICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5tYXhYICkgJiYgTWF0aC5hYnMoIG1pbkJvdW5kcy5tYXhYIC0gbWF4Qm91bmRzLm1heFggKSA+IHByZWNpc2lvbiApIHtcclxuICAgICAgLy8gdXNlIG1heGltdW0gYm91bmRzIGV4Y2VwdCBmb3IgdGhlIHggZGlyZWN0aW9uLCBzbyB3ZSBkb24ndCBtaXNzIHRoaW5ncyB0aGF0IHdlIGFyZSBsb29raW5nIGZvclxyXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCBtaW5Cb3VuZHMubWF4WCwgdGVtcE1pbiwgbWF4Qm91bmRzLm1heFgsIHRlbXBNYXggKSApICk7XHJcblxyXG4gICAgICBpZiAoIG1pbkJvdW5kcy5tYXhYID49IHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1heFggJiYgbWF4Qm91bmRzLm1heFggPD0gcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWF4WCApIHtcclxuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcclxuICAgICAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhcm5pbmcsIGV4aXRpbmcgaW5maW5pdGUgbG9vcCEnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtaW5Cb3VuZHMgPSBtaW5Cb3VuZHMud2l0aE1heFgoIE1hdGgubWF4KCBtaW5Cb3VuZHMubWF4WCwgcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWF4WCApICk7XHJcbiAgICAgIG1heEJvdW5kcyA9IG1heEJvdW5kcy53aXRoTWF4WCggTWF0aC5taW4oIG1heEJvdW5kcy5tYXhYLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5tYXhYICkgKTtcclxuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5ZICk7XHJcbiAgICAgIHRlbXBNYXggPSBNYXRoLm1pbiggdGVtcE1heCwgcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWF4WSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1pbllcclxuICAgIHRlbXBNaW4gPSBtYXhCb3VuZHMubWluWDtcclxuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WDtcclxuICAgIHdoaWxlICggaXNGaW5pdGUoIG1pbkJvdW5kcy5taW5ZICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5taW5ZICkgJiYgTWF0aC5hYnMoIG1pbkJvdW5kcy5taW5ZIC0gbWF4Qm91bmRzLm1pblkgKSA+IHByZWNpc2lvbiApIHtcclxuICAgICAgLy8gdXNlIG1heGltdW0gYm91bmRzIGV4Y2VwdCBmb3IgdGhlIHkgZGlyZWN0aW9uLCBzbyB3ZSBkb24ndCBtaXNzIHRoaW5ncyB0aGF0IHdlIGFyZSBsb29raW5nIGZvclxyXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCB0ZW1wTWluLCBtYXhCb3VuZHMubWluWSwgdGVtcE1heCwgbWluQm91bmRzLm1pblkgKSApICk7XHJcblxyXG4gICAgICBpZiAoIG1pbkJvdW5kcy5taW5ZIDw9IHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1pblkgJiYgbWF4Qm91bmRzLm1pblkgPj0gcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWluWSApIHtcclxuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcclxuICAgICAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhcm5pbmcsIGV4aXRpbmcgaW5maW5pdGUgbG9vcCEnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtaW5Cb3VuZHMgPSBtaW5Cb3VuZHMud2l0aE1pblkoIE1hdGgubWluKCBtaW5Cb3VuZHMubWluWSwgcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWluWSApICk7XHJcbiAgICAgIG1heEJvdW5kcyA9IG1heEJvdW5kcy53aXRoTWluWSggTWF0aC5tYXgoIG1heEJvdW5kcy5taW5ZLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5ZICkgKTtcclxuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5YICk7XHJcbiAgICAgIHRlbXBNYXggPSBNYXRoLm1pbiggdGVtcE1heCwgcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWF4WCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG1heFlcclxuICAgIHRlbXBNaW4gPSBtYXhCb3VuZHMubWluWDtcclxuICAgIHRlbXBNYXggPSBtYXhCb3VuZHMubWF4WDtcclxuICAgIHdoaWxlICggaXNGaW5pdGUoIG1pbkJvdW5kcy5tYXhZICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5tYXhZICkgJiYgTWF0aC5hYnMoIG1pbkJvdW5kcy5tYXhZIC0gbWF4Qm91bmRzLm1heFkgKSA+IHByZWNpc2lvbiApIHtcclxuICAgICAgLy8gdXNlIG1heGltdW0gYm91bmRzIGV4Y2VwdCBmb3IgdGhlIHkgZGlyZWN0aW9uLCBzbyB3ZSBkb24ndCBtaXNzIHRoaW5ncyB0aGF0IHdlIGFyZSBsb29raW5nIGZvclxyXG4gICAgICByZWZpbmVkQm91bmRzID0gc2NhbiggaWRlYWxUcmFuc2Zvcm0oIG5ldyBCb3VuZHMyKCB0ZW1wTWluLCBtaW5Cb3VuZHMubWF4WSwgdGVtcE1heCwgbWF4Qm91bmRzLm1heFkgKSApICk7XHJcblxyXG4gICAgICBpZiAoIG1pbkJvdW5kcy5tYXhZID49IHJlZmluZWRCb3VuZHMubWluQm91bmRzLm1heFkgJiYgbWF4Qm91bmRzLm1heFkgPD0gcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWF4WSApIHtcclxuICAgICAgICAvLyBzYW5pdHkgY2hlY2sgLSBicmVhayBvdXQgb2YgYW4gaW5maW5pdGUgbG9vcCFcclxuICAgICAgICBpZiAoIGRlYnVnQ2hyb21lQm91bmRzU2Nhbm5pbmcgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ3dhcm5pbmcsIGV4aXRpbmcgaW5maW5pdGUgbG9vcCEnICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBtaW5Cb3VuZHMgPSBtaW5Cb3VuZHMud2l0aE1heFkoIE1hdGgubWF4KCBtaW5Cb3VuZHMubWF4WSwgcmVmaW5lZEJvdW5kcy5taW5Cb3VuZHMubWF4WSApICk7XHJcbiAgICAgIG1heEJvdW5kcyA9IG1heEJvdW5kcy53aXRoTWF4WSggTWF0aC5taW4oIG1heEJvdW5kcy5tYXhZLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5tYXhZICkgKTtcclxuICAgICAgdGVtcE1pbiA9IE1hdGgubWF4KCB0ZW1wTWluLCByZWZpbmVkQm91bmRzLm1heEJvdW5kcy5taW5YICk7XHJcbiAgICAgIHRlbXBNYXggPSBNYXRoLm1pbiggdGVtcE1heCwgcmVmaW5lZEJvdW5kcy5tYXhCb3VuZHMubWF4WCApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggZGVidWdDaHJvbWVCb3VuZHNTY2FubmluZyApIHtcclxuICAgICAgY29uc29sZS5sb2coIGBtaW5Cb3VuZHM6ICR7bWluQm91bmRzfWAgKTtcclxuICAgICAgY29uc29sZS5sb2coIGBtYXhCb3VuZHM6ICR7bWF4Qm91bmRzfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICBjb25zdCByZXN1bHQ6IEJvdW5kczIgJiB7IG1pbkJvdW5kczogQm91bmRzMjsgbWF4Qm91bmRzOiBCb3VuZHMyOyBpc0NvbnNpc3RlbnQ6IGJvb2xlYW47IHByZWNpc2lvbjogbnVtYmVyIH0gPSBuZXcgQm91bmRzMihcclxuICAgICAgLy8gRG8gZmluaXRlIGNoZWNrcyBzbyB3ZSBkb24ndCByZXR1cm4gTmFOXHJcbiAgICAgICggaXNGaW5pdGUoIG1pbkJvdW5kcy5taW5YICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5taW5YICkgKSA/ICggbWluQm91bmRzLm1pblggKyBtYXhCb3VuZHMubWluWCApIC8gMiA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSxcclxuICAgICAgKCBpc0Zpbml0ZSggbWluQm91bmRzLm1pblkgKSAmJiBpc0Zpbml0ZSggbWF4Qm91bmRzLm1pblkgKSApID8gKCBtaW5Cb3VuZHMubWluWSArIG1heEJvdW5kcy5taW5ZICkgLyAyIDogTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZLFxyXG4gICAgICAoIGlzRmluaXRlKCBtaW5Cb3VuZHMubWF4WCApICYmIGlzRmluaXRlKCBtYXhCb3VuZHMubWF4WCApICkgPyAoIG1pbkJvdW5kcy5tYXhYICsgbWF4Qm91bmRzLm1heFggKSAvIDIgOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFksXHJcbiAgICAgICggaXNGaW5pdGUoIG1pbkJvdW5kcy5tYXhZICkgJiYgaXNGaW5pdGUoIG1heEJvdW5kcy5tYXhZICkgKSA/ICggbWluQm91bmRzLm1heFkgKyBtYXhCb3VuZHMubWF4WSApIC8gMiA6IE51bWJlci5ORUdBVElWRV9JTkZJTklUWVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBleHRyYSBkYXRhIGFib3V0IG91ciBib3VuZHNcclxuICAgIHJlc3VsdC5taW5Cb3VuZHMgPSBtaW5Cb3VuZHM7XHJcbiAgICByZXN1bHQubWF4Qm91bmRzID0gbWF4Qm91bmRzO1xyXG4gICAgcmVzdWx0LmlzQ29uc2lzdGVudCA9IG1heEJvdW5kcy5jb250YWluc0JvdW5kcyggbWluQm91bmRzICk7XHJcbiAgICByZXN1bHQucHJlY2lzaW9uID0gTWF0aC5tYXgoXHJcbiAgICAgIE1hdGguYWJzKCBtaW5Cb3VuZHMubWluWCAtIG1heEJvdW5kcy5taW5YICksXHJcbiAgICAgIE1hdGguYWJzKCBtaW5Cb3VuZHMubWluWSAtIG1heEJvdW5kcy5taW5ZICksXHJcbiAgICAgIE1hdGguYWJzKCBtaW5Cb3VuZHMubWF4WCAtIG1heEJvdW5kcy5tYXhYICksXHJcbiAgICAgIE1hdGguYWJzKCBtaW5Cb3VuZHMubWF4WSAtIG1heEJvdW5kcy5tYXhZIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gcmV0dXJuIHRoZSBhdmVyYWdlXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gICAqIFdlYkdMIHV0aWxpdGllcyAoVE9ETzogc2VwYXJhdGUgZmlsZSlcclxuICAgKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcblxyXG4gIC8qKlxyXG4gICAqIEZpbmRzIHRoZSBzbWFsbGVzdCBwb3dlciBvZiAyIHRoYXQgaXMgYXQgbGVhc3QgYXMgbGFyZ2UgYXMgbi5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIFRoZSBzbWFsbGVzdCBwb3dlciBvZiAyIHRoYXQgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIG5cclxuICAgKi9cclxuICB0b1Bvd2VyT2YyKCBuOiBudW1iZXIgKTogbnVtYmVyIHtcclxuICAgIGxldCByZXN1bHQgPSAxO1xyXG4gICAgd2hpbGUgKCByZXN1bHQgPCBuICkge1xyXG4gICAgICByZXN1bHQgKj0gMjtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbmQgY29tcGlsZXMgYSBHTFNMIFNoYWRlciBvYmplY3QgaW4gV2ViR0wuXHJcbiAgICovXHJcbiAgY3JlYXRlU2hhZGVyKCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0LCBzb3VyY2U6IHN0cmluZywgdHlwZTogbnVtYmVyICk6IFdlYkdMU2hhZGVyIHtcclxuICAgIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlciggdHlwZSApITtcclxuICAgIGdsLnNoYWRlclNvdXJjZSggc2hhZGVyLCBzb3VyY2UgKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoIHNoYWRlciApO1xyXG5cclxuICAgIGlmICggIWdsLmdldFNoYWRlclBhcmFtZXRlciggc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUyApICkge1xyXG4gICAgICBjb25zb2xlLmxvZyggJ0dMU0wgY29tcGlsZSBlcnJvcjonICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCBnbC5nZXRTaGFkZXJJbmZvTG9nKCBzaGFkZXIgKSApO1xyXG4gICAgICBjb25zb2xlLmxvZyggc291cmNlICk7XHJcblxyXG4gICAgICAvLyBOb3JtYWxseSBpdCB3b3VsZCBiZSBiZXN0IHRvIHRocm93IGFuIGV4Y2VwdGlvbiBoZXJlLCBidXQgYSBjb250ZXh0IGxvc3MgY291bGQgY2F1c2UgdGhlIHNoYWRlciBwYXJhbWV0ZXIgY2hlY2tcclxuICAgICAgLy8gdG8gZmFpbCwgYW5kIHdlIG11c3QgaGFuZGxlIGNvbnRleHQgbG9zcyBncmFjZWZ1bGx5IGJldHdlZW4gYW55IGFkamFjZW50IHBhaXIgb2YgZ2wgY2FsbHMuXHJcbiAgICAgIC8vIFRoZXJlZm9yZSwgd2Ugc2ltcGx5IHJlcG9ydCB0aGUgZXJyb3JzIHRvIHRoZSBjb25zb2xlLiAgU2VlICMyNzlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2hhZGVyO1xyXG4gIH0sXHJcblxyXG4gIGFwcGx5V2ViR0xDb250ZXh0RGVmYXVsdHMoIGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgKTogdm9pZCB7XHJcbiAgICAvLyBXaGF0IGNvbG9yIGdldHMgc2V0IHdoZW4gd2UgY2FsbCBnbC5jbGVhcigpXHJcbiAgICBnbC5jbGVhckNvbG9yKCAwLCAwLCAwLCAwICk7XHJcblxyXG4gICAgLy8gQmxlbmRpbmcgc2ltaWxhciB0byBodHRwOi8vbG9jYWxob3N0L3BoZXQvZ2l0L3dlYmdsLWJsZW5kZnVuY3Rpb25zL2JsZW5kZnVuY3NlcGFyYXRlLmh0bWxcclxuICAgIGdsLmVuYWJsZSggZ2wuQkxFTkQgKTtcclxuXHJcbiAgICAvLyBOT1RFOiBXZSBzd2l0Y2hlZCBiYWNrIHRvIGEgZnVsbHkgcHJlbXVsdGlwbGllZCBzZXR1cCwgc28gd2UgaGF2ZSB0aGUgY29ycmVzcG9uZGluZyBibGVuZCBmdW5jdGlvbi5cclxuICAgIC8vIEZvciBub3JtYWwgY29sb3JzIChhbmQgY3VzdG9tIFdlYkdMTm9kZSBoYW5kbGluZyksIGl0IGlzIG5lY2Vzc2FyeSB0byB1c2UgcHJlbXVsdGlwbGllZCB2YWx1ZXMgKG11bHRpcGx5aW5nIHRoZVxyXG4gICAgLy8gUkdCIHZhbHVlcyBieSB0aGUgYWxwaGEgdmFsdWUgZm9yIGdsX0ZyYWdDb2xvcikuIEZvciB0ZXh0dXJlZCB0cmlhbmdsZXMsIGl0IGlzIGFzc3VtZWQgdGhhdCB0aGUgdGV4dHVyZSBpc1xyXG4gICAgLy8gYWxyZWFkeSBwcmVtdWx0aXBsaWVkLCBzbyB0aGUgYnVpbHQtaW4gc2hhZGVyIGRvZXMgbm90IGRvIHRoZSBleHRyYSBwcmVtdWx0aXBsaWNhdGlvbi5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmsvaXNzdWVzLzM5LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMzk3XHJcbiAgICAvLyBhbmQgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzkzNDE1NjQvd2ViZ2wtaG93LXRvLWNvcnJlY3RseS1ibGVuZC1hbHBoYS1jaGFubmVsLXBuZ1xyXG4gICAgZ2wuYmxlbmRGdW5jKCBnbC5PTkUsIGdsLk9ORV9NSU5VU19TUkNfQUxQSEEgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBTZXQgd2hldGhlciB3ZWJnbCBzaG91bGQgYmUgZW5hYmxlZCwgc2VlIGRvY3MgZm9yIHdlYmdsRW5hYmxlZFxyXG4gICAqL1xyXG4gIHNldFdlYkdMRW5hYmxlZCggX3dlYmdsRW5hYmxlZDogYm9vbGVhbiApOiB2b2lkIHtcclxuICAgIHdlYmdsRW5hYmxlZCA9IF93ZWJnbEVuYWJsZWQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdG8gc2VlIHdoZXRoZXIgd2ViZ2wgaXMgc3VwcG9ydGVkLCB1c2luZyB0aGUgc2FtZSBzdHJhdGVneSBhcyBtcmRvb2IgYW5kIHBpeGkuanNcclxuICAgKlxyXG4gICAqIEBwYXJhbSBbZXh0ZW5zaW9uc10gLSBBIGxpc3Qgb2YgV2ViR0wgZXh0ZW5zaW9ucyB0aGF0IG5lZWQgdG8gYmUgc3VwcG9ydGVkXHJcbiAgICovXHJcbiAgY2hlY2tXZWJHTFN1cHBvcnQoIGV4dGVuc2lvbnM/OiBzdHJpbmdbXSApOiBib29sZWFuIHtcclxuXHJcbiAgICAvLyBUaGUgd2ViZ2wgY2hlY2sgY2FuIGJlIHNodXQgb2ZmLCBwbGVhc2Ugc2VlIGRvY3MgYXQgd2ViZ2xFbmFibGVkIGRlY2xhcmF0aW9uIHNpdGVcclxuICAgIGlmICggIXdlYmdsRW5hYmxlZCApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuXHJcbiAgICBjb25zdCBhcmdzID0geyBmYWlsSWZNYWpvclBlcmZvcm1hbmNlQ2F2ZWF0OiB0cnVlIH07XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgIGNvbnN0IGdsOiBXZWJHTFJlbmRlcmluZ0NvbnRleHQgfCBudWxsID0gISF3aW5kb3cuV2ViR0xSZW5kZXJpbmdDb250ZXh0ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBjYW52YXMuZ2V0Q29udGV4dCggJ3dlYmdsJywgYXJncyApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJywgYXJncyApICk7XHJcblxyXG4gICAgICBpZiAoICFnbCApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggZXh0ZW5zaW9ucyApIHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBleHRlbnNpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgaWYgKCBnbC5nZXRFeHRlbnNpb24oIGV4dGVuc2lvbnNbIGkgXSApID09PSBudWxsICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgdG8gc2VlIHdoZXRoZXIgSUUxMSBoYXMgcHJvcGVyIGNsZWFyU3RlbmNpbCBzdXBwb3J0IChyZXF1aXJlZCBmb3IgdGhyZWUuanMgdG8gd29yayB3ZWxsKS5cclxuICAgKi9cclxuICBjaGVja0lFMTFTdGVuY2lsU3VwcG9ydCgpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBjb25zdCBnbDogV2ViR0xSZW5kZXJpbmdDb250ZXh0IHwgbnVsbCA9ICEhd2luZG93LldlYkdMUmVuZGVyaW5nQ29udGV4dCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggY2FudmFzLmdldENvbnRleHQoICd3ZWJnbCcgKSB8fCBjYW52YXMuZ2V0Q29udGV4dCggJ2V4cGVyaW1lbnRhbC13ZWJnbCcgKSApO1xyXG5cclxuICAgICAgaWYgKCAhZ2wgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGYWlsdXJlIGZvciBodHRwczovL2dpdGh1Yi5jb20vbXJkb29iL3RocmVlLmpzL2lzc3Vlcy8zNjAwIC8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL21vbGVjdWxlLXNoYXBlcy9pc3N1ZXMvMTMzXHJcbiAgICAgIGdsLmNsZWFyU3RlbmNpbCggMCApO1xyXG4gICAgICByZXR1cm4gZ2wuZ2V0RXJyb3IoKSA9PT0gMDtcclxuICAgIH1cclxuICAgIGNhdGNoKCBlICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogV2hldGhlciBXZWJHTCAod2l0aCBkZWNlbnQgcGVyZm9ybWFuY2UpIGlzIHN1cHBvcnRlZCBieSB0aGUgcGxhdGZvcm1cclxuICAgKi9cclxuICBnZXQgaXNXZWJHTFN1cHBvcnRlZCgpOiBib29sZWFuIHtcclxuICAgIGlmICggX2V4dGVuc2lvbmxlc3NXZWJHTFN1cHBvcnQgPT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgX2V4dGVuc2lvbmxlc3NXZWJHTFN1cHBvcnQgPSBVdGlscy5jaGVja1dlYkdMU3VwcG9ydCgpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9leHRlbnNpb25sZXNzV2ViR0xTdXBwb3J0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIGEgbG9zcyBvZiBhIFdlYkdMIGNvbnRleHQsIHdpdGggYSBkZWxheWVkIHJlc3RvcmF0aW9uLlxyXG4gICAqXHJcbiAgICogTk9URTogT25seSB1c2UgdGhpcyBmb3IgZGVidWdnaW5nLiBTaG91bGQgbm90IGJlIGNhbGxlZCBub3JtYWxseS5cclxuICAgKi9cclxuICBsb3NlQ29udGV4dCggZ2w6IFdlYkdMUmVuZGVyaW5nQ29udGV4dCApOiB2b2lkIHtcclxuICAgIGNvbnN0IGV4dGVuc2lvbiA9IGdsLmdldEV4dGVuc2lvbiggJ1dFQkdMX2xvc2VfY29udGV4dCcgKTtcclxuICAgIGlmICggZXh0ZW5zaW9uICkge1xyXG4gICAgICBleHRlbnNpb24ubG9zZUNvbnRleHQoKTtcclxuXHJcbiAgICAgIC8vIE5PVEU6IFdlIGRvbid0IHdhbnQgdG8gcmVseSBvbiBhIGNvbW1vbiB0aW1lciwgc28gd2UncmUgdXNpbmcgdGhlIGJ1aWx0LWluIGZvcm0gb24gcHVycG9zZS5cclxuICAgICAgc2V0VGltZW91dCggKCkgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhZC1zaW0tdGV4dFxyXG4gICAgICAgIGV4dGVuc2lvbi5yZXN0b3JlQ29udGV4dCgpO1xyXG4gICAgICB9LCAxMDAwICk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHN0cmluZyB1c2VmdWwgZm9yIHdvcmtpbmcgYXJvdW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jb2xsaXNpb24tbGFiL2lzc3Vlcy8xNzcuXHJcbiAgICovXHJcbiAgc2FmYXJpRW1iZWRkaW5nTWFya1dvcmthcm91bmQoIHN0cjogc3RyaW5nICk6IHN0cmluZyB7XHJcbiAgICBpZiAoIHBsYXRmb3JtLnNhZmFyaSApIHtcclxuICAgICAgLy8gQWRkIGluIHplcm8td2lkdGggc3BhY2VzIGZvciBTYWZhcmksIHNvIGl0IGRvZXNuJ3QgaGF2ZSBhZGphY2VudCBlbWJlZGRpbmcgbWFya3MgZXZlciAod2hpY2ggc2VlbXMgdG8gcHJldmVudFxyXG4gICAgICAvLyB0aGluZ3MpLlxyXG4gICAgICByZXR1cm4gc3RyLnNwbGl0KCAnJyApLmpvaW4oICdcXHUyMDBCJyApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ1V0aWxzJywgVXRpbHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgVXRpbHM7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0sK0JBQStCO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxTQUFTQyxRQUFRLEVBQUVDLE9BQU8sUUFBUSxlQUFlOztBQUVqRDtBQUNBLFNBQVNDLENBQUNBLENBQUVDLENBQVMsRUFBRUMsQ0FBUyxFQUFZO0VBQzFDLE9BQU8sSUFBSU4sT0FBTyxDQUFFSyxDQUFDLEVBQUVDLENBQUUsQ0FBQztBQUM1Qjs7QUFFQTtBQUNBLE1BQU1DLHlCQUF5QixHQUFHLEtBQUs7O0FBRXZDO0FBQ0EsTUFBTUMsaUJBQWlCLEdBQUdOLFFBQVEsQ0FBQ08sU0FBUztBQUM1QyxNQUFNQyx1QkFBdUIsR0FBR1IsUUFBUSxDQUFDUyxlQUFlLElBQUksaUJBQWlCLENBQUMsQ0FBQzs7QUFFL0U7QUFDQTtBQUNBO0FBQ0EsSUFBSUMsWUFBWSxHQUFHLElBQUk7QUFFdkIsSUFBSUMsMEJBQStDLENBQUMsQ0FBQzs7QUFFckQsTUFBTUMsS0FBSyxHQUFHO0VBQ1o7QUFDRjtBQUNBOztFQUVFO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLG1CQUFtQkEsQ0FBRUMsT0FBaUMsRUFBUztJQUM3REEsT0FBTyxDQUFDQyxLQUFLLENBQUVQLHVCQUF1QixDQUFFLEdBQUcsVUFBVTtFQUN2RCxDQUFDO0VBRUQ7QUFDRjtBQUNBO0FBQ0E7RUFDRVEsc0JBQXNCQSxDQUFFQyxNQUFlLEVBQUVILE9BQWlDLEVBQVM7SUFDakY7SUFDQUEsT0FBTyxDQUFDQyxLQUFLLENBQUVULGlCQUFpQixD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