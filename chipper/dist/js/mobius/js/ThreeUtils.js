// Copyright 2019-2023, University of Colorado Boulder

/**
 * Base view for all "show a single molecule in the center" screens
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector3 from '../../dot/js/Vector3.js';
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import PhetFont from '../../scenery-phet/js/PhetFont.js';
import SceneryPhetStrings from '../../scenery-phet/js/SceneryPhetStrings.js';
import { HBox, openPopup, Path, Text, Utils } from '../../scenery/js/imports.js';
import exclamationTriangleSolidShape from '../../sherpa/js/fontawesome-5/exclamationTriangleSolidShape.js';
import mobius from './mobius.js';

// {THREE.TextureLoader|null} - "singleton" for the texture loader
let textureLoader = null;
const scratchFloatArray = new Float32Array(128);
const ThreeUtils = {
  /**
   * Converts a Vector3 to a THREE.Vector3
   */
  vectorToThree(vector) {
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  },
  /**
   * Converts a THREE.Vector3 to a Vector3
   */
  threeToVector(vector) {
    return new Vector3(vector.x, vector.y, vector.z);
  },
  /**
   * Converts a Color to a THREE.Color
   */
  colorToThree(color) {
    return new THREE.Color(color.toNumber());
  },
  /**
   * Returns an array of [ x, y, z, ... ] vertices for a quad pointed towards the camera.
   *
   * @param bounds2 - x,y
   * @param z
   */
  frontVertices(bounds2, z) {
    return scratchFloatArray.slice(0, ThreeUtils.writeFrontVertices(scratchFloatArray, 0, bounds2, z));
  },
  /**
   * Returns an array of [ x, y, z, ... ] vertices for a quad pointed up.
   *
   * @param bounds2 - x,z
   * @param y
   */
  topVertices(bounds2, y) {
    return scratchFloatArray.slice(0, ThreeUtils.writeTopVertices(scratchFloatArray, 0, bounds2, y));
  },
  /**
   * Returns an array of [ x, y, z, ... ] vertices for a quad pointed towards the right.
   *
   * @param bounds2 - z,y
   * @param x
   */
  rightVertices(bounds2, x) {
    return scratchFloatArray.slice(0, ThreeUtils.writeRightVertices(scratchFloatArray, 0, bounds2, x));
  },
  /**
   * Returns an array of [ x, y, z, ... ] vertices for a quad pointed towards the left.
   *
   * @param Bounds2 bounds2 - z,y
   * @param number x
   */
  leftVertices(bounds2, x) {
    return scratchFloatArray.slice(0, ThreeUtils.writeLeftVertices(scratchFloatArray, 0, bounds2, x));
  },
  /**
   * Writes a single triangle into a buffer, returning the new index location. Assumes vertices in counterclockwise
   * order.
   *
   * Writes 9 entries into the array.
   *
   * @returns - The index for the next write
   */
  writeTriangle(array, index, x0, y0, z0, x1, y1, z1, x2, y2, z2) {
    array[index + 0] = x0;
    array[index + 1] = y0;
    array[index + 2] = z0;
    array[index + 3] = x1;
    array[index + 4] = y1;
    array[index + 5] = z1;
    array[index + 6] = x2;
    array[index + 7] = y2;
    array[index + 8] = z2;
    return index + 9;
  },
  /**
   * Writes a single quad into a buffer, returning the new index location. Assumes verties in counterclockwise order.
   *
   * Writes 18 entries into the array.
   *
   * @returns - The index for the next write
   */
  writeQuad(array, index, x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    index = ThreeUtils.writeTriangle(array, index, x0, y0, z0, x1, y1, z1, x2, y2, z2);
    index = ThreeUtils.writeTriangle(array, index, x0, y0, z0, x2, y2, z2, x3, y3, z3);
    return index;
  },
  /**
   * Writes a single front-facing quad into a buffer, returning the new index location. Assumes verties in
   * counterclockwise order.
   *
   * Writes 18 entries into the array.
   *
   * @returns - The index for the next write
   */
  writeFrontVertices(array, index, bounds2, z) {
    return ThreeUtils.writeQuad(array, index, bounds2.minX, bounds2.maxY, z, bounds2.minX, bounds2.minY, z, bounds2.maxX, bounds2.minY, z, bounds2.maxX, bounds2.maxY, z);
  },
  /**
   * Writes a single up-facing quad into a buffer, returning the new index location. Assumes verties in
   * counterclockwise order.
   *
   * Writes 18 entries into the array.
   *
   * @param array
   * @param index
   * @param bounds2 - x,z
   * @param y
   * @returns - The index for the next write
   */
  writeTopVertices(array, index, bounds2, y) {
    return ThreeUtils.writeQuad(array, index, bounds2.minX, y, bounds2.maxY, bounds2.maxX, y, bounds2.maxY, bounds2.maxX, y, bounds2.minY, bounds2.minX, y, bounds2.minY);
  },
  /**
   * Writes a single right-facing quad into a buffer, returning the new index location. Assumes verties in
   * counterclockwise order.
   *
   * Writes 18 entries into the array.
   *
   * @param array
   * @param index
   * @param bounds2 - z,y
   * @param x
   * @returns - The index for the next write
   */
  writeRightVertices(array, index, bounds2, x) {
    return ThreeUtils.writeQuad(array, index, x, bounds2.minY, bounds2.maxX, x, bounds2.minY, bounds2.minX, x, bounds2.maxY, bounds2.minX, x, bounds2.maxY, bounds2.maxX);
  },
  /**
   * Writes a single left-facing quad into a buffer, returning the new index location. Assumes verties in
   * counterclockwise order.
   *
   * Writes 18 entries into the array.
   *
   * @param array
   * @param index
   * @param bounds2 - z,y
   * @param x
   * @returns - The index for the next write
   */
  writeLeftVertices(array, index, bounds2, x) {
    return ThreeUtils.writeQuad(array, index, x, bounds2.minY, bounds2.maxX, x, bounds2.maxY, bounds2.maxX, x, bounds2.maxY, bounds2.minX, x, bounds2.minY, bounds2.minX);
  },
  /**
   * Returns a THREE.TextureLoader instance (using a singleton so we don't create more than we need).
   */
  get textureLoader() {
    if (!textureLoader) {
      textureLoader = new THREE.TextureLoader();
    }
    return textureLoader;
  },
  /**
   * Returns a THREE.Texture for a given HTMLImageElement.
   */
  imageToTexture(image, waitForLoad) {
    if (waitForLoad) {
      return ThreeUtils.textureLoader.load(image.src, asyncLoader.createLock());
    } else {
      return ThreeUtils.textureLoader.load(image.src);
    }
  },
  /**
   * Checks if webgl is enabled by the browser.
   */
  isWebGLEnabled() {
    return phet.chipper.queryParameters.webgl && Utils.isWebGLSupported;
  },
  /**
   * Shows a warning with a link to more information about PhET simulation webgl compatibility.
   */
  showWebGLWarning(screenView) {
    const warningNode = new HBox({
      children: [new Path(exclamationTriangleSolidShape, {
        fill: '#E87600',
        // "safety orange", according to Wikipedia
        scale: 0.06
      }), new Text(SceneryPhetStrings.webglWarning.bodyStringProperty, {
        font: new PhetFont(16),
        fill: '#000',
        maxWidth: 600
      })],
      spacing: 12,
      align: 'center',
      cursor: 'pointer',
      center: screenView.layoutBounds.center
    });
    screenView.addChild(warningNode);
    warningNode.mouseArea = warningNode.touchArea = warningNode.localBounds;
    warningNode.addInputListener({
      up: function () {
        const joistGlobal = _.get(window, 'phet.joist', null); // returns null if global isn't found
        const locale = joistGlobal ? joistGlobal.sim.locale : 'en';
        openPopup(`https://phet.colorado.edu/webgl-disabled-page?simLocale=${locale}`);
      }
    });
  }
};
mobius.register('ThreeUtils', ThreeUtils);
export default ThreeUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IzIiwiYXN5bmNMb2FkZXIiLCJQaGV0Rm9udCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkhCb3giLCJvcGVuUG9wdXAiLCJQYXRoIiwiVGV4dCIsIlV0aWxzIiwiZXhjbGFtYXRpb25UcmlhbmdsZVNvbGlkU2hhcGUiLCJtb2JpdXMiLCJ0ZXh0dXJlTG9hZGVyIiwic2NyYXRjaEZsb2F0QXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJUaHJlZVV0aWxzIiwidmVjdG9yVG9UaHJlZSIsInZlY3RvciIsIlRIUkVFIiwieCIsInkiLCJ6IiwidGhyZWVUb1ZlY3RvciIsImNvbG9yVG9UaHJlZSIsImNvbG9yIiwiQ29sb3IiLCJ0b051bWJlciIsImZyb250VmVydGljZXMiLCJib3VuZHMyIiwic2xpY2UiLCJ3cml0ZUZyb250VmVydGljZXMiLCJ0b3BWZXJ0aWNlcyIsIndyaXRlVG9wVmVydGljZXMiLCJyaWdodFZlcnRpY2VzIiwid3JpdGVSaWdodFZlcnRpY2VzIiwibGVmdFZlcnRpY2VzIiwid3JpdGVMZWZ0VmVydGljZXMiLCJ3cml0ZVRyaWFuZ2xlIiwiYXJyYXkiLCJpbmRleCIsIngwIiwieTAiLCJ6MCIsIngxIiwieTEiLCJ6MSIsIngyIiwieTIiLCJ6MiIsIndyaXRlUXVhZCIsIngzIiwieTMiLCJ6MyIsIm1pblgiLCJtYXhZIiwibWluWSIsIm1heFgiLCJUZXh0dXJlTG9hZGVyIiwiaW1hZ2VUb1RleHR1cmUiLCJpbWFnZSIsIndhaXRGb3JMb2FkIiwibG9hZCIsInNyYyIsImNyZWF0ZUxvY2siLCJpc1dlYkdMRW5hYmxlZCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwid2ViZ2wiLCJpc1dlYkdMU3VwcG9ydGVkIiwic2hvd1dlYkdMV2FybmluZyIsInNjcmVlblZpZXciLCJ3YXJuaW5nTm9kZSIsImNoaWxkcmVuIiwiZmlsbCIsInNjYWxlIiwid2ViZ2xXYXJuaW5nIiwiYm9keVN0cmluZ1Byb3BlcnR5IiwiZm9udCIsIm1heFdpZHRoIiwic3BhY2luZyIsImFsaWduIiwiY3Vyc29yIiwiY2VudGVyIiwibGF5b3V0Qm91bmRzIiwiYWRkQ2hpbGQiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImFkZElucHV0TGlzdGVuZXIiLCJ1cCIsImpvaXN0R2xvYmFsIiwiXyIsImdldCIsIndpbmRvdyIsImxvY2FsZSIsInNpbSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGhyZWVVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHZpZXcgZm9yIGFsbCBcInNob3cgYSBzaW5nbGUgbW9sZWN1bGUgaW4gdGhlIGNlbnRlclwiIHNjcmVlbnNcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IGFzeW5jTG9hZGVyIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hc3luY0xvYWRlci5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgU2NlbmVyeVBoZXRTdHJpbmdzIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgSEJveCwgb3BlblBvcHVwLCBQYXRoLCBUZXh0LCBVdGlscyB9IGZyb20gJy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBleGNsYW1hdGlvblRyaWFuZ2xlU29saWRTaGFwZSBmcm9tICcuLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9leGNsYW1hdGlvblRyaWFuZ2xlU29saWRTaGFwZS5qcyc7XHJcbmltcG9ydCBtb2JpdXMgZnJvbSAnLi9tb2JpdXMuanMnO1xyXG5cclxuLy8ge1RIUkVFLlRleHR1cmVMb2FkZXJ8bnVsbH0gLSBcInNpbmdsZXRvblwiIGZvciB0aGUgdGV4dHVyZSBsb2FkZXJcclxubGV0IHRleHR1cmVMb2FkZXI6IFRIUkVFLlRleHR1cmVMb2FkZXIgfCBudWxsID0gbnVsbDtcclxuXHJcbmNvbnN0IHNjcmF0Y2hGbG9hdEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggMTI4ICk7XHJcblxyXG5jb25zdCBUaHJlZVV0aWxzID0ge1xyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgVmVjdG9yMyB0byBhIFRIUkVFLlZlY3RvcjNcclxuICAgKi9cclxuICB2ZWN0b3JUb1RocmVlKCB2ZWN0b3I6IFZlY3RvcjMgKTogVEhSRUUuVmVjdG9yMyB7XHJcbiAgICByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoIHZlY3Rvci54LCB2ZWN0b3IueSwgdmVjdG9yLnogKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIFRIUkVFLlZlY3RvcjMgdG8gYSBWZWN0b3IzXHJcbiAgICovXHJcbiAgdGhyZWVUb1ZlY3RvciggdmVjdG9yOiBUSFJFRS5WZWN0b3IzICk6IFZlY3RvcjMge1xyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IzKCB2ZWN0b3IueCwgdmVjdG9yLnksIHZlY3Rvci56ICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydHMgYSBDb2xvciB0byBhIFRIUkVFLkNvbG9yXHJcbiAgICovXHJcbiAgY29sb3JUb1RocmVlKCBjb2xvcjogQ29sb3IgKTogVEhSRUUuQ29sb3Ige1xyXG4gICAgcmV0dXJuIG5ldyBUSFJFRS5Db2xvciggY29sb3IudG9OdW1iZXIoKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgWyB4LCB5LCB6LCAuLi4gXSB2ZXJ0aWNlcyBmb3IgYSBxdWFkIHBvaW50ZWQgdG93YXJkcyB0aGUgY2FtZXJhLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJvdW5kczIgLSB4LHlcclxuICAgKiBAcGFyYW0gelxyXG4gICAqL1xyXG4gIGZyb250VmVydGljZXMoIGJvdW5kczI6IEJvdW5kczIsIHo6IG51bWJlciApOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgcmV0dXJuIHNjcmF0Y2hGbG9hdEFycmF5LnNsaWNlKCAwLCBUaHJlZVV0aWxzLndyaXRlRnJvbnRWZXJ0aWNlcyggc2NyYXRjaEZsb2F0QXJyYXksIDAsIGJvdW5kczIsIHogKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgWyB4LCB5LCB6LCAuLi4gXSB2ZXJ0aWNlcyBmb3IgYSBxdWFkIHBvaW50ZWQgdXAuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYm91bmRzMiAtIHgselxyXG4gICAqIEBwYXJhbSB5XHJcbiAgICovXHJcbiAgdG9wVmVydGljZXMoIGJvdW5kczI6IEJvdW5kczIsIHk6IG51bWJlciApOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgcmV0dXJuIHNjcmF0Y2hGbG9hdEFycmF5LnNsaWNlKCAwLCBUaHJlZVV0aWxzLndyaXRlVG9wVmVydGljZXMoIHNjcmF0Y2hGbG9hdEFycmF5LCAwLCBib3VuZHMyLCB5ICkgKTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIFsgeCwgeSwgeiwgLi4uIF0gdmVydGljZXMgZm9yIGEgcXVhZCBwb2ludGVkIHRvd2FyZHMgdGhlIHJpZ2h0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJvdW5kczIgLSB6LHlcclxuICAgKiBAcGFyYW0geFxyXG4gICAqL1xyXG4gIHJpZ2h0VmVydGljZXMoIGJvdW5kczI6IEJvdW5kczIsIHg6IG51bWJlciApOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgcmV0dXJuIHNjcmF0Y2hGbG9hdEFycmF5LnNsaWNlKCAwLCBUaHJlZVV0aWxzLndyaXRlUmlnaHRWZXJ0aWNlcyggc2NyYXRjaEZsb2F0QXJyYXksIDAsIGJvdW5kczIsIHggKSApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2YgWyB4LCB5LCB6LCAuLi4gXSB2ZXJ0aWNlcyBmb3IgYSBxdWFkIHBvaW50ZWQgdG93YXJkcyB0aGUgbGVmdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBCb3VuZHMyIGJvdW5kczIgLSB6LHlcclxuICAgKiBAcGFyYW0gbnVtYmVyIHhcclxuICAgKi9cclxuICBsZWZ0VmVydGljZXMoIGJvdW5kczI6IEJvdW5kczIsIHg6IG51bWJlciApOiBGbG9hdDMyQXJyYXkge1xyXG4gICAgcmV0dXJuIHNjcmF0Y2hGbG9hdEFycmF5LnNsaWNlKCAwLCBUaHJlZVV0aWxzLndyaXRlTGVmdFZlcnRpY2VzKCBzY3JhdGNoRmxvYXRBcnJheSwgMCwgYm91bmRzMiwgeCApICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogV3JpdGVzIGEgc2luZ2xlIHRyaWFuZ2xlIGludG8gYSBidWZmZXIsIHJldHVybmluZyB0aGUgbmV3IGluZGV4IGxvY2F0aW9uLiBBc3N1bWVzIHZlcnRpY2VzIGluIGNvdW50ZXJjbG9ja3dpc2VcclxuICAgKiBvcmRlci5cclxuICAgKlxyXG4gICAqIFdyaXRlcyA5IGVudHJpZXMgaW50byB0aGUgYXJyYXkuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFRoZSBpbmRleCBmb3IgdGhlIG5leHQgd3JpdGVcclxuICAgKi9cclxuICB3cml0ZVRyaWFuZ2xlKCBhcnJheTogRmxvYXQzMkFycmF5IHwgRmxvYXQ2NEFycmF5LCBpbmRleDogbnVtYmVyLCB4MDogbnVtYmVyLCB5MDogbnVtYmVyLCB6MDogbnVtYmVyLCB4MTogbnVtYmVyLCB5MTogbnVtYmVyLCB6MTogbnVtYmVyLCB4MjogbnVtYmVyLCB5MjogbnVtYmVyLCB6MjogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBhcnJheVsgaW5kZXggKyAwIF0gPSB4MDtcclxuICAgIGFycmF5WyBpbmRleCArIDEgXSA9IHkwO1xyXG4gICAgYXJyYXlbIGluZGV4ICsgMiBdID0gejA7XHJcbiAgICBhcnJheVsgaW5kZXggKyAzIF0gPSB4MTtcclxuICAgIGFycmF5WyBpbmRleCArIDQgXSA9IHkxO1xyXG4gICAgYXJyYXlbIGluZGV4ICsgNSBdID0gejE7XHJcbiAgICBhcnJheVsgaW5kZXggKyA2IF0gPSB4MjtcclxuICAgIGFycmF5WyBpbmRleCArIDcgXSA9IHkyO1xyXG4gICAgYXJyYXlbIGluZGV4ICsgOCBdID0gejI7XHJcblxyXG4gICAgcmV0dXJuIGluZGV4ICsgOTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBXcml0ZXMgYSBzaW5nbGUgcXVhZCBpbnRvIGEgYnVmZmVyLCByZXR1cm5pbmcgdGhlIG5ldyBpbmRleCBsb2NhdGlvbi4gQXNzdW1lcyB2ZXJ0aWVzIGluIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXIuXHJcbiAgICpcclxuICAgKiBXcml0ZXMgMTggZW50cmllcyBpbnRvIHRoZSBhcnJheS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIC0gVGhlIGluZGV4IGZvciB0aGUgbmV4dCB3cml0ZVxyXG4gICAqL1xyXG4gIHdyaXRlUXVhZCggYXJyYXk6IEZsb2F0MzJBcnJheSB8IEZsb2F0NjRBcnJheSwgaW5kZXg6IG51bWJlciwgeDA6IG51bWJlciwgeTA6IG51bWJlciwgejA6IG51bWJlciwgeDE6IG51bWJlciwgeTE6IG51bWJlciwgejE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciwgejI6IG51bWJlciwgeDM6IG51bWJlciwgeTM6IG51bWJlciwgejM6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaW5kZXggPSBUaHJlZVV0aWxzLndyaXRlVHJpYW5nbGUoXHJcbiAgICAgIGFycmF5LCBpbmRleCxcclxuICAgICAgeDAsIHkwLCB6MCxcclxuICAgICAgeDEsIHkxLCB6MSxcclxuICAgICAgeDIsIHkyLCB6MlxyXG4gICAgKTtcclxuICAgIGluZGV4ID0gVGhyZWVVdGlscy53cml0ZVRyaWFuZ2xlKFxyXG4gICAgICBhcnJheSwgaW5kZXgsXHJcbiAgICAgIHgwLCB5MCwgejAsXHJcbiAgICAgIHgyLCB5MiwgejIsXHJcbiAgICAgIHgzLCB5MywgejNcclxuICAgICk7XHJcbiAgICByZXR1cm4gaW5kZXg7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogV3JpdGVzIGEgc2luZ2xlIGZyb250LWZhY2luZyBxdWFkIGludG8gYSBidWZmZXIsIHJldHVybmluZyB0aGUgbmV3IGluZGV4IGxvY2F0aW9uLiBBc3N1bWVzIHZlcnRpZXMgaW5cclxuICAgKiBjb3VudGVyY2xvY2t3aXNlIG9yZGVyLlxyXG4gICAqXHJcbiAgICogV3JpdGVzIDE4IGVudHJpZXMgaW50byB0aGUgYXJyYXkuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFRoZSBpbmRleCBmb3IgdGhlIG5leHQgd3JpdGVcclxuICAgKi9cclxuICB3cml0ZUZyb250VmVydGljZXMoIGFycmF5OiBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXksIGluZGV4OiBudW1iZXIsIGJvdW5kczI6IEJvdW5kczIsIHo6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIFRocmVlVXRpbHMud3JpdGVRdWFkKFxyXG4gICAgICBhcnJheSwgaW5kZXgsXHJcbiAgICAgIGJvdW5kczIubWluWCwgYm91bmRzMi5tYXhZLCB6LFxyXG4gICAgICBib3VuZHMyLm1pblgsIGJvdW5kczIubWluWSwgeixcclxuICAgICAgYm91bmRzMi5tYXhYLCBib3VuZHMyLm1pblksIHosXHJcbiAgICAgIGJvdW5kczIubWF4WCwgYm91bmRzMi5tYXhZLCB6XHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBhIHNpbmdsZSB1cC1mYWNpbmcgcXVhZCBpbnRvIGEgYnVmZmVyLCByZXR1cm5pbmcgdGhlIG5ldyBpbmRleCBsb2NhdGlvbi4gQXNzdW1lcyB2ZXJ0aWVzIGluXHJcbiAgICogY291bnRlcmNsb2Nrd2lzZSBvcmRlci5cclxuICAgKlxyXG4gICAqIFdyaXRlcyAxOCBlbnRyaWVzIGludG8gdGhlIGFycmF5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFycmF5XHJcbiAgICogQHBhcmFtIGluZGV4XHJcbiAgICogQHBhcmFtIGJvdW5kczIgLSB4LHpcclxuICAgKiBAcGFyYW0geVxyXG4gICAqIEByZXR1cm5zIC0gVGhlIGluZGV4IGZvciB0aGUgbmV4dCB3cml0ZVxyXG4gICAqL1xyXG4gIHdyaXRlVG9wVmVydGljZXMoIGFycmF5OiBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXksIGluZGV4OiBudW1iZXIsIGJvdW5kczI6IEJvdW5kczIsIHk6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIFRocmVlVXRpbHMud3JpdGVRdWFkKFxyXG4gICAgICBhcnJheSwgaW5kZXgsXHJcbiAgICAgIGJvdW5kczIubWluWCwgeSwgYm91bmRzMi5tYXhZLFxyXG4gICAgICBib3VuZHMyLm1heFgsIHksIGJvdW5kczIubWF4WSxcclxuICAgICAgYm91bmRzMi5tYXhYLCB5LCBib3VuZHMyLm1pblksXHJcbiAgICAgIGJvdW5kczIubWluWCwgeSwgYm91bmRzMi5taW5ZXHJcbiAgICApO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFdyaXRlcyBhIHNpbmdsZSByaWdodC1mYWNpbmcgcXVhZCBpbnRvIGEgYnVmZmVyLCByZXR1cm5pbmcgdGhlIG5ldyBpbmRleCBsb2NhdGlvbi4gQXNzdW1lcyB2ZXJ0aWVzIGluXHJcbiAgICogY291bnRlcmNsb2Nrd2lzZSBvcmRlci5cclxuICAgKlxyXG4gICAqIFdyaXRlcyAxOCBlbnRyaWVzIGludG8gdGhlIGFycmF5LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGFycmF5XHJcbiAgICogQHBhcmFtIGluZGV4XHJcbiAgICogQHBhcmFtIGJvdW5kczIgLSB6LHlcclxuICAgKiBAcGFyYW0geFxyXG4gICAqIEByZXR1cm5zIC0gVGhlIGluZGV4IGZvciB0aGUgbmV4dCB3cml0ZVxyXG4gICAqL1xyXG4gIHdyaXRlUmlnaHRWZXJ0aWNlcyggYXJyYXk6IEZsb2F0MzJBcnJheSB8IEZsb2F0NjRBcnJheSwgaW5kZXg6IG51bWJlciwgYm91bmRzMjogQm91bmRzMiwgeDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gVGhyZWVVdGlscy53cml0ZVF1YWQoXHJcbiAgICAgIGFycmF5LCBpbmRleCxcclxuICAgICAgeCwgYm91bmRzMi5taW5ZLCBib3VuZHMyLm1heFgsXHJcbiAgICAgIHgsIGJvdW5kczIubWluWSwgYm91bmRzMi5taW5YLFxyXG4gICAgICB4LCBib3VuZHMyLm1heFksIGJvdW5kczIubWluWCxcclxuICAgICAgeCwgYm91bmRzMi5tYXhZLCBib3VuZHMyLm1heFhcclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogV3JpdGVzIGEgc2luZ2xlIGxlZnQtZmFjaW5nIHF1YWQgaW50byBhIGJ1ZmZlciwgcmV0dXJuaW5nIHRoZSBuZXcgaW5kZXggbG9jYXRpb24uIEFzc3VtZXMgdmVydGllcyBpblxyXG4gICAqIGNvdW50ZXJjbG9ja3dpc2Ugb3JkZXIuXHJcbiAgICpcclxuICAgKiBXcml0ZXMgMTggZW50cmllcyBpbnRvIHRoZSBhcnJheS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBhcnJheVxyXG4gICAqIEBwYXJhbSBpbmRleFxyXG4gICAqIEBwYXJhbSBib3VuZHMyIC0geix5XHJcbiAgICogQHBhcmFtIHhcclxuICAgKiBAcmV0dXJucyAtIFRoZSBpbmRleCBmb3IgdGhlIG5leHQgd3JpdGVcclxuICAgKi9cclxuICB3cml0ZUxlZnRWZXJ0aWNlcyggYXJyYXk6IEZsb2F0MzJBcnJheSB8IEZsb2F0NjRBcnJheSwgaW5kZXg6IG51bWJlciwgYm91bmRzMjogQm91bmRzMiwgeDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gVGhyZWVVdGlscy53cml0ZVF1YWQoXHJcbiAgICAgIGFycmF5LCBpbmRleCxcclxuICAgICAgeCwgYm91bmRzMi5taW5ZLCBib3VuZHMyLm1heFgsXHJcbiAgICAgIHgsIGJvdW5kczIubWF4WSwgYm91bmRzMi5tYXhYLFxyXG4gICAgICB4LCBib3VuZHMyLm1heFksIGJvdW5kczIubWluWCxcclxuICAgICAgeCwgYm91bmRzMi5taW5ZLCBib3VuZHMyLm1pblhcclxuICAgICk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIFRIUkVFLlRleHR1cmVMb2FkZXIgaW5zdGFuY2UgKHVzaW5nIGEgc2luZ2xldG9uIHNvIHdlIGRvbid0IGNyZWF0ZSBtb3JlIHRoYW4gd2UgbmVlZCkuXHJcbiAgICovXHJcbiAgZ2V0IHRleHR1cmVMb2FkZXIoKTogVEhSRUUuVGV4dHVyZUxvYWRlciB7XHJcbiAgICBpZiAoICF0ZXh0dXJlTG9hZGVyICkge1xyXG4gICAgICB0ZXh0dXJlTG9hZGVyID0gbmV3IFRIUkVFLlRleHR1cmVMb2FkZXIoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0ZXh0dXJlTG9hZGVyO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBUSFJFRS5UZXh0dXJlIGZvciBhIGdpdmVuIEhUTUxJbWFnZUVsZW1lbnQuXHJcbiAgICovXHJcbiAgaW1hZ2VUb1RleHR1cmUoIGltYWdlOiBIVE1MSW1hZ2VFbGVtZW50LCB3YWl0Rm9yTG9hZD86IGJvb2xlYW4gKTogVEhSRUUuVGV4dHVyZSB7XHJcbiAgICBpZiAoIHdhaXRGb3JMb2FkICkge1xyXG4gICAgICByZXR1cm4gVGhyZWVVdGlscy50ZXh0dXJlTG9hZGVyLmxvYWQoIGltYWdlLnNyYywgYXN5bmNMb2FkZXIuY3JlYXRlTG9jaygpICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIFRocmVlVXRpbHMudGV4dHVyZUxvYWRlci5sb2FkKCBpbWFnZS5zcmMgKTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBDaGVja3MgaWYgd2ViZ2wgaXMgZW5hYmxlZCBieSB0aGUgYnJvd3Nlci5cclxuICAgKi9cclxuICBpc1dlYkdMRW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLndlYmdsICYmIFV0aWxzLmlzV2ViR0xTdXBwb3J0ZWQ7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgYSB3YXJuaW5nIHdpdGggYSBsaW5rIHRvIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgUGhFVCBzaW11bGF0aW9uIHdlYmdsIGNvbXBhdGliaWxpdHkuXHJcbiAgICovXHJcbiAgc2hvd1dlYkdMV2FybmluZyggc2NyZWVuVmlldzogU2NyZWVuVmlldyApOiB2b2lkIHtcclxuICAgIGNvbnN0IHdhcm5pbmdOb2RlID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUGF0aCggZXhjbGFtYXRpb25UcmlhbmdsZVNvbGlkU2hhcGUsIHtcclxuICAgICAgICAgIGZpbGw6ICcjRTg3NjAwJywgLy8gXCJzYWZldHkgb3JhbmdlXCIsIGFjY29yZGluZyB0byBXaWtpcGVkaWFcclxuICAgICAgICAgIHNjYWxlOiAwLjA2XHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBUZXh0KCBTY2VuZXJ5UGhldFN0cmluZ3Mud2ViZ2xXYXJuaW5nLmJvZHlTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLFxyXG4gICAgICAgICAgZmlsbDogJyMwMDAnLFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDYwMFxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICBzcGFjaW5nOiAxMixcclxuICAgICAgYWxpZ246ICdjZW50ZXInLFxyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgY2VudGVyOiBzY3JlZW5WaWV3LmxheW91dEJvdW5kcy5jZW50ZXJcclxuICAgIH0gKTtcclxuICAgIHNjcmVlblZpZXcuYWRkQ2hpbGQoIHdhcm5pbmdOb2RlICk7XHJcblxyXG4gICAgd2FybmluZ05vZGUubW91c2VBcmVhID0gd2FybmluZ05vZGUudG91Y2hBcmVhID0gd2FybmluZ05vZGUubG9jYWxCb3VuZHM7XHJcblxyXG4gICAgd2FybmluZ05vZGUuYWRkSW5wdXRMaXN0ZW5lcigge1xyXG4gICAgICB1cDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc3Qgam9pc3RHbG9iYWwgPSBfLmdldCggd2luZG93LCAncGhldC5qb2lzdCcsIG51bGwgKTsgLy8gcmV0dXJucyBudWxsIGlmIGdsb2JhbCBpc24ndCBmb3VuZFxyXG4gICAgICAgIGNvbnN0IGxvY2FsZSA9IGpvaXN0R2xvYmFsID8gam9pc3RHbG9iYWwuc2ltLmxvY2FsZSA6ICdlbic7XHJcblxyXG4gICAgICAgIG9wZW5Qb3B1cCggYGh0dHBzOi8vcGhldC5jb2xvcmFkby5lZHUvd2ViZ2wtZGlzYWJsZWQtcGFnZT9zaW1Mb2NhbGU9JHtsb2NhbGV9YCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59O1xyXG5cclxubW9iaXVzLnJlZ2lzdGVyKCAnVGhyZWVVdGlscycsIFRocmVlVXRpbHMgKTtcclxuZXhwb3J0IGRlZmF1bHQgVGhyZWVVdGlsczsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsT0FBTyxNQUFNLHlCQUF5QjtBQUU3QyxPQUFPQyxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLFFBQVEsTUFBTSxtQ0FBbUM7QUFDeEQsT0FBT0Msa0JBQWtCLE1BQU0sNkNBQTZDO0FBQzVF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