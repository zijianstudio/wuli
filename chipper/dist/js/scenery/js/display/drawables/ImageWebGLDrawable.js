// Copyright 2016-2022, University of Colorado Boulder

/**
 * WebGL drawable for Image nodes.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Poolable from '../../../../phet-core/js/Poolable.js';
import { ImageStatefulDrawable, Renderer, scenery, WebGLSelfDrawable } from '../../imports.js';

// For alignment, we keep things to 8 components, aligned on 4-byte boundaries.
// See https://developer.apple.com/library/ios/documentation/3DDrawing/Conceptual/OpenGLES_ProgrammingGuide/TechniquesforWorkingwithVertexData/TechniquesforWorkingwithVertexData.html#//apple_ref/doc/uid/TP40008793-CH107-SW15
const WEBGL_COMPONENTS = 5; // format [X Y U V A] for 6 vertices

const VERTEX_0_OFFSET = WEBGL_COMPONENTS * 0;
const VERTEX_1_OFFSET = WEBGL_COMPONENTS * 1;
const VERTEX_2_OFFSET = WEBGL_COMPONENTS * 2;
const VERTEX_3_OFFSET = WEBGL_COMPONENTS * 3;
const VERTEX_4_OFFSET = WEBGL_COMPONENTS * 4;
const VERTEX_5_OFFSET = WEBGL_COMPONENTS * 5;
const VERTEX_X_OFFSET = 0;
const VERTEX_Y_OFFSET = 1;
const VERTEX_U_OFFSET = 2;
const VERTEX_V_OFFSET = 3;
const VERTEX_A_OFFSET = 4;
class ImageWebGLDrawable extends ImageStatefulDrawable(WebGLSelfDrawable) {
  /**
   * @public
   * @override
   *
   * @param {number} renderer
   * @param {Instance} instance
   */
  initialize(renderer, instance) {
    super.initialize(renderer, instance);

    // @public {Float32Array} - 5-length components for 6 vertices (2 tris), for 6 vertices
    this.vertexArray = this.vertexArray || new Float32Array(WEBGL_COMPONENTS * 6);

    // @private {Vector2} - corner vertices in the relative transform root coordinate space
    this.upperLeft = new Vector2(0, 0);
    this.lowerLeft = new Vector2(0, 0);
    this.upperRight = new Vector2(0, 0);
    this.lowerRight = new Vector2(0, 0);

    // @private {boolean}
    this.xyDirty = true; // is our vertex position information out of date?
    this.uvDirty = true; // is our UV information out of date?
    this.updatedOnce = false;

    // {SpriteSheet.Sprite} exported for WebGLBlock's rendering loop
    this.sprite = null;
  }

  /**
   * @public
   *
   * @param {WebGLBlock} webGLBlock
   */
  onAddToBlock(webglBlock) {
    this.webglBlock = webglBlock; // TODO: do we need this reference?
    this.markDirty();
    this.reserveSprite();
  }

  /**
   * @public
   *
   * @param {WebGLBlock} webGLBlock
   */
  onRemoveFromBlock(webglBlock) {
    this.unreserveSprite();
  }

  /**
   * @private
   */
  reserveSprite() {
    if (this.sprite) {
      // if we already reserved a sprite for the image, bail out
      if (this.sprite.image === this.node._image) {
        return;
      }
      // otherwise we need to ditch our last reservation before reserving a new sprite
      else {
        this.unreserveSprite();
      }
    }

    // if the width/height isn't loaded yet, we can still use the desired value
    const width = this.node.getImageWidth();
    const height = this.node.getImageHeight();

    // if we have a width/height, we'll load a sprite
    this.sprite = width > 0 && height > 0 ? this.webglBlock.addSpriteSheetImage(this.node._image, width, height) : null;

    // full updates on everything if our sprite changes
    this.xyDirty = true;
    this.uvDirty = true;
  }

  /**
   * @private
   */
  unreserveSprite() {
    if (this.sprite) {
      this.webglBlock.removeSpriteSheetImage(this.sprite);
    }
    this.sprite = null;
  }

  /**
   * @public
   * @override
   */
  markTransformDirty() {
    this.xyDirty = true;
    super.markTransformDirty();
  }

  /**
   * A "catch-all" dirty method that directly marks the paintDirty flag and triggers propagation of dirty
   * information. This can be used by other mark* methods, or directly itself if the paintDirty flag is checked.
   * @public
   *
   * It should be fired (indirectly or directly) for anything besides transforms that needs to make a drawable
   * dirty.
   */
  markPaintDirty() {
    this.xyDirty = true; // vertex positions can depend on image width/height
    this.uvDirty = true;
    this.markDirty();
  }

  /**
   * Updates the DOM appearance of this drawable (whether by preparing/calling draw calls, DOM element updates, etc.)
   * @public
   * @override
   *
   * @returns {boolean} - Whether the update should continue (if false, further updates in supertype steps should not
   *                      be done).
   */
  update() {
    // See if we need to actually update things (will bail out if we are not dirty, or if we've been disposed)
    if (!super.update()) {
      return false;
    }

    // ensure that we have a reserved sprite (part of the spritesheet)
    this.reserveSprite();
    if (this.dirtyImageOpacity || !this.updatedOnce) {
      this.vertexArray[VERTEX_0_OFFSET + VERTEX_A_OFFSET] = this.node._imageOpacity;
      this.vertexArray[VERTEX_1_OFFSET + VERTEX_A_OFFSET] = this.node._imageOpacity;
      this.vertexArray[VERTEX_2_OFFSET + VERTEX_A_OFFSET] = this.node._imageOpacity;
      this.vertexArray[VERTEX_3_OFFSET + VERTEX_A_OFFSET] = this.node._imageOpacity;
      this.vertexArray[VERTEX_4_OFFSET + VERTEX_A_OFFSET] = this.node._imageOpacity;
      this.vertexArray[VERTEX_5_OFFSET + VERTEX_A_OFFSET] = this.node._imageOpacity;
    }
    this.updatedOnce = true;

    // if we don't have a sprite (we don't have a loaded image yet), just bail
    if (!this.sprite) {
      return false;
    }
    if (this.uvDirty) {
      this.uvDirty = false;
      const uvBounds = this.sprite.uvBounds;

      // TODO: consider reversal of minY and maxY usage here for vertical inverse

      // first triangle UVs
      this.vertexArray[VERTEX_0_OFFSET + VERTEX_U_OFFSET] = uvBounds.minX; // upper left U
      this.vertexArray[VERTEX_0_OFFSET + VERTEX_V_OFFSET] = uvBounds.minY; // upper left V
      this.vertexArray[VERTEX_1_OFFSET + VERTEX_U_OFFSET] = uvBounds.minX; // lower left U
      this.vertexArray[VERTEX_1_OFFSET + VERTEX_V_OFFSET] = uvBounds.maxY; // lower left V
      this.vertexArray[VERTEX_2_OFFSET + VERTEX_U_OFFSET] = uvBounds.maxX; // upper right U
      this.vertexArray[VERTEX_2_OFFSET + VERTEX_V_OFFSET] = uvBounds.minY; // upper right V

      // second triangle UVs
      this.vertexArray[VERTEX_3_OFFSET + VERTEX_U_OFFSET] = uvBounds.maxX; // upper right U
      this.vertexArray[VERTEX_3_OFFSET + VERTEX_V_OFFSET] = uvBounds.minY; // upper right V
      this.vertexArray[VERTEX_4_OFFSET + VERTEX_U_OFFSET] = uvBounds.minX; // lower left U
      this.vertexArray[VERTEX_4_OFFSET + VERTEX_V_OFFSET] = uvBounds.maxY; // lower left V
      this.vertexArray[VERTEX_5_OFFSET + VERTEX_U_OFFSET] = uvBounds.maxX; // lower right U
      this.vertexArray[VERTEX_5_OFFSET + VERTEX_V_OFFSET] = uvBounds.maxY; // lower right V
    }

    if (this.xyDirty) {
      this.xyDirty = false;
      const width = this.node.getImageWidth();
      const height = this.node.getImageHeight();
      const transformMatrix = this.instance.relativeTransform.matrix; // with compute need, should always be accurate
      transformMatrix.multiplyVector2(this.upperLeft.setXY(0, 0));
      transformMatrix.multiplyVector2(this.lowerLeft.setXY(0, height));
      transformMatrix.multiplyVector2(this.upperRight.setXY(width, 0));
      transformMatrix.multiplyVector2(this.lowerRight.setXY(width, height));

      // first triangle XYs
      this.vertexArray[VERTEX_0_OFFSET + VERTEX_X_OFFSET] = this.upperLeft.x;
      this.vertexArray[VERTEX_0_OFFSET + VERTEX_Y_OFFSET] = this.upperLeft.y;
      this.vertexArray[VERTEX_1_OFFSET + VERTEX_X_OFFSET] = this.lowerLeft.x;
      this.vertexArray[VERTEX_1_OFFSET + VERTEX_Y_OFFSET] = this.lowerLeft.y;
      this.vertexArray[VERTEX_2_OFFSET + VERTEX_X_OFFSET] = this.upperRight.x;
      this.vertexArray[VERTEX_2_OFFSET + VERTEX_Y_OFFSET] = this.upperRight.y;

      // second triangle XYs
      this.vertexArray[VERTEX_3_OFFSET + VERTEX_X_OFFSET] = this.upperRight.x;
      this.vertexArray[VERTEX_3_OFFSET + VERTEX_Y_OFFSET] = this.upperRight.y;
      this.vertexArray[VERTEX_4_OFFSET + VERTEX_X_OFFSET] = this.lowerLeft.x;
      this.vertexArray[VERTEX_4_OFFSET + VERTEX_Y_OFFSET] = this.lowerLeft.y;
      this.vertexArray[VERTEX_5_OFFSET + VERTEX_X_OFFSET] = this.lowerRight.x;
      this.vertexArray[VERTEX_5_OFFSET + VERTEX_Y_OFFSET] = this.lowerRight.y;
    }
    return true;
  }
}

// TODO: doc
ImageWebGLDrawable.prototype.webglRenderer = Renderer.webglTexturedTriangles;
scenery.register('ImageWebGLDrawable', ImageWebGLDrawable);
Poolable.mixInto(ImageWebGLDrawable);
export default ImageWebGLDrawable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUG9vbGFibGUiLCJJbWFnZVN0YXRlZnVsRHJhd2FibGUiLCJSZW5kZXJlciIsInNjZW5lcnkiLCJXZWJHTFNlbGZEcmF3YWJsZSIsIldFQkdMX0NPTVBPTkVOVFMiLCJWRVJURVhfMF9PRkZTRVQiLCJWRVJURVhfMV9PRkZTRVQiLCJWRVJURVhfMl9PRkZTRVQiLCJWRVJURVhfM19PRkZTRVQiLCJWRVJURVhfNF9PRkZTRVQiLCJWRVJURVhfNV9PRkZTRVQiLCJWRVJURVhfWF9PRkZTRVQiLCJWRVJURVhfWV9PRkZTRVQiLCJWRVJURVhfVV9PRkZTRVQiLCJWRVJURVhfVl9PRkZTRVQiLCJWRVJURVhfQV9PRkZTRVQiLCJJbWFnZVdlYkdMRHJhd2FibGUiLCJpbml0aWFsaXplIiwicmVuZGVyZXIiLCJpbnN0YW5jZSIsInZlcnRleEFycmF5IiwiRmxvYXQzMkFycmF5IiwidXBwZXJMZWZ0IiwibG93ZXJMZWZ0IiwidXBwZXJSaWdodCIsImxvd2VyUmlnaHQiLCJ4eURpcnR5IiwidXZEaXJ0eSIsInVwZGF0ZWRPbmNlIiwic3ByaXRlIiwib25BZGRUb0Jsb2NrIiwid2ViZ2xCbG9jayIsIm1hcmtEaXJ0eSIsInJlc2VydmVTcHJpdGUiLCJvblJlbW92ZUZyb21CbG9jayIsInVucmVzZXJ2ZVNwcml0ZSIsImltYWdlIiwibm9kZSIsIl9pbWFnZSIsIndpZHRoIiwiZ2V0SW1hZ2VXaWR0aCIsImhlaWdodCIsImdldEltYWdlSGVpZ2h0IiwiYWRkU3ByaXRlU2hlZXRJbWFnZSIsInJlbW92ZVNwcml0ZVNoZWV0SW1hZ2UiLCJtYXJrVHJhbnNmb3JtRGlydHkiLCJtYXJrUGFpbnREaXJ0eSIsInVwZGF0ZSIsImRpcnR5SW1hZ2VPcGFjaXR5IiwiX2ltYWdlT3BhY2l0eSIsInV2Qm91bmRzIiwibWluWCIsIm1pblkiLCJtYXhZIiwibWF4WCIsInRyYW5zZm9ybU1hdHJpeCIsInJlbGF0aXZlVHJhbnNmb3JtIiwibWF0cml4IiwibXVsdGlwbHlWZWN0b3IyIiwic2V0WFkiLCJ4IiwieSIsInByb3RvdHlwZSIsIndlYmdsUmVuZGVyZXIiLCJ3ZWJnbFRleHR1cmVkVHJpYW5nbGVzIiwicmVnaXN0ZXIiLCJtaXhJbnRvIl0sInNvdXJjZXMiOlsiSW1hZ2VXZWJHTERyYXdhYmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdlYkdMIGRyYXdhYmxlIGZvciBJbWFnZSBub2Rlcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlU3RhdGVmdWxEcmF3YWJsZSwgUmVuZGVyZXIsIHNjZW5lcnksIFdlYkdMU2VsZkRyYXdhYmxlIH0gZnJvbSAnLi4vLi4vaW1wb3J0cy5qcyc7XHJcblxyXG4vLyBGb3IgYWxpZ25tZW50LCB3ZSBrZWVwIHRoaW5ncyB0byA4IGNvbXBvbmVudHMsIGFsaWduZWQgb24gNC1ieXRlIGJvdW5kYXJpZXMuXHJcbi8vIFNlZSBodHRwczovL2RldmVsb3Blci5hcHBsZS5jb20vbGlicmFyeS9pb3MvZG9jdW1lbnRhdGlvbi8zRERyYXdpbmcvQ29uY2VwdHVhbC9PcGVuR0xFU19Qcm9ncmFtbWluZ0d1aWRlL1RlY2huaXF1ZXNmb3JXb3JraW5nd2l0aFZlcnRleERhdGEvVGVjaG5pcXVlc2Zvcldvcmtpbmd3aXRoVmVydGV4RGF0YS5odG1sIy8vYXBwbGVfcmVmL2RvYy91aWQvVFA0MDAwODc5My1DSDEwNy1TVzE1XHJcbmNvbnN0IFdFQkdMX0NPTVBPTkVOVFMgPSA1OyAvLyBmb3JtYXQgW1ggWSBVIFYgQV0gZm9yIDYgdmVydGljZXNcclxuXHJcbmNvbnN0IFZFUlRFWF8wX09GRlNFVCA9IFdFQkdMX0NPTVBPTkVOVFMgKiAwO1xyXG5jb25zdCBWRVJURVhfMV9PRkZTRVQgPSBXRUJHTF9DT01QT05FTlRTICogMTtcclxuY29uc3QgVkVSVEVYXzJfT0ZGU0VUID0gV0VCR0xfQ09NUE9ORU5UUyAqIDI7XHJcbmNvbnN0IFZFUlRFWF8zX09GRlNFVCA9IFdFQkdMX0NPTVBPTkVOVFMgKiAzO1xyXG5jb25zdCBWRVJURVhfNF9PRkZTRVQgPSBXRUJHTF9DT01QT05FTlRTICogNDtcclxuY29uc3QgVkVSVEVYXzVfT0ZGU0VUID0gV0VCR0xfQ09NUE9ORU5UUyAqIDU7XHJcblxyXG5jb25zdCBWRVJURVhfWF9PRkZTRVQgPSAwO1xyXG5jb25zdCBWRVJURVhfWV9PRkZTRVQgPSAxO1xyXG5jb25zdCBWRVJURVhfVV9PRkZTRVQgPSAyO1xyXG5jb25zdCBWRVJURVhfVl9PRkZTRVQgPSAzO1xyXG5jb25zdCBWRVJURVhfQV9PRkZTRVQgPSA0O1xyXG5cclxuY2xhc3MgSW1hZ2VXZWJHTERyYXdhYmxlIGV4dGVuZHMgSW1hZ2VTdGF0ZWZ1bERyYXdhYmxlKCBXZWJHTFNlbGZEcmF3YWJsZSApIHtcclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmVuZGVyZXJcclxuICAgKiBAcGFyYW0ge0luc3RhbmNlfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApIHtcclxuICAgIHN1cGVyLmluaXRpYWxpemUoIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0Zsb2F0MzJBcnJheX0gLSA1LWxlbmd0aCBjb21wb25lbnRzIGZvciA2IHZlcnRpY2VzICgyIHRyaXMpLCBmb3IgNiB2ZXJ0aWNlc1xyXG4gICAgdGhpcy52ZXJ0ZXhBcnJheSA9IHRoaXMudmVydGV4QXJyYXkgfHwgbmV3IEZsb2F0MzJBcnJheSggV0VCR0xfQ09NUE9ORU5UUyAqIDYgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7VmVjdG9yMn0gLSBjb3JuZXIgdmVydGljZXMgaW4gdGhlIHJlbGF0aXZlIHRyYW5zZm9ybSByb290IGNvb3JkaW5hdGUgc3BhY2VcclxuICAgIHRoaXMudXBwZXJMZWZ0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMubG93ZXJMZWZ0ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMudXBwZXJSaWdodCA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcbiAgICB0aGlzLmxvd2VyUmlnaHQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtib29sZWFufVxyXG4gICAgdGhpcy54eURpcnR5ID0gdHJ1ZTsgLy8gaXMgb3VyIHZlcnRleCBwb3NpdGlvbiBpbmZvcm1hdGlvbiBvdXQgb2YgZGF0ZT9cclxuICAgIHRoaXMudXZEaXJ0eSA9IHRydWU7IC8vIGlzIG91ciBVViBpbmZvcm1hdGlvbiBvdXQgb2YgZGF0ZT9cclxuICAgIHRoaXMudXBkYXRlZE9uY2UgPSBmYWxzZTtcclxuXHJcbiAgICAvLyB7U3ByaXRlU2hlZXQuU3ByaXRlfSBleHBvcnRlZCBmb3IgV2ViR0xCbG9jaydzIHJlbmRlcmluZyBsb29wXHJcbiAgICB0aGlzLnNwcml0ZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1dlYkdMQmxvY2t9IHdlYkdMQmxvY2tcclxuICAgKi9cclxuICBvbkFkZFRvQmxvY2soIHdlYmdsQmxvY2sgKSB7XHJcbiAgICB0aGlzLndlYmdsQmxvY2sgPSB3ZWJnbEJsb2NrOyAvLyBUT0RPOiBkbyB3ZSBuZWVkIHRoaXMgcmVmZXJlbmNlP1xyXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcclxuXHJcbiAgICB0aGlzLnJlc2VydmVTcHJpdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7V2ViR0xCbG9ja30gd2ViR0xCbG9ja1xyXG4gICAqL1xyXG4gIG9uUmVtb3ZlRnJvbUJsb2NrKCB3ZWJnbEJsb2NrICkge1xyXG4gICAgdGhpcy51bnJlc2VydmVTcHJpdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVzZXJ2ZVNwcml0ZSgpIHtcclxuICAgIGlmICggdGhpcy5zcHJpdGUgKSB7XHJcbiAgICAgIC8vIGlmIHdlIGFscmVhZHkgcmVzZXJ2ZWQgYSBzcHJpdGUgZm9yIHRoZSBpbWFnZSwgYmFpbCBvdXRcclxuICAgICAgaWYgKCB0aGlzLnNwcml0ZS5pbWFnZSA9PT0gdGhpcy5ub2RlLl9pbWFnZSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgLy8gb3RoZXJ3aXNlIHdlIG5lZWQgdG8gZGl0Y2ggb3VyIGxhc3QgcmVzZXJ2YXRpb24gYmVmb3JlIHJlc2VydmluZyBhIG5ldyBzcHJpdGVcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy51bnJlc2VydmVTcHJpdGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIHRoZSB3aWR0aC9oZWlnaHQgaXNuJ3QgbG9hZGVkIHlldCwgd2UgY2FuIHN0aWxsIHVzZSB0aGUgZGVzaXJlZCB2YWx1ZVxyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLm5vZGUuZ2V0SW1hZ2VXaWR0aCgpO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ub2RlLmdldEltYWdlSGVpZ2h0KCk7XHJcblxyXG4gICAgLy8gaWYgd2UgaGF2ZSBhIHdpZHRoL2hlaWdodCwgd2UnbGwgbG9hZCBhIHNwcml0ZVxyXG4gICAgdGhpcy5zcHJpdGUgPSAoIHdpZHRoID4gMCAmJiBoZWlnaHQgPiAwICkgPyB0aGlzLndlYmdsQmxvY2suYWRkU3ByaXRlU2hlZXRJbWFnZSggdGhpcy5ub2RlLl9pbWFnZSwgd2lkdGgsIGhlaWdodCApIDogbnVsbDtcclxuXHJcbiAgICAvLyBmdWxsIHVwZGF0ZXMgb24gZXZlcnl0aGluZyBpZiBvdXIgc3ByaXRlIGNoYW5nZXNcclxuICAgIHRoaXMueHlEaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLnV2RGlydHkgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1bnJlc2VydmVTcHJpdGUoKSB7XHJcbiAgICBpZiAoIHRoaXMuc3ByaXRlICkge1xyXG4gICAgICB0aGlzLndlYmdsQmxvY2sucmVtb3ZlU3ByaXRlU2hlZXRJbWFnZSggdGhpcy5zcHJpdGUgKTtcclxuICAgIH1cclxuICAgIHRoaXMuc3ByaXRlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBtYXJrVHJhbnNmb3JtRGlydHkoKSB7XHJcbiAgICB0aGlzLnh5RGlydHkgPSB0cnVlO1xyXG5cclxuICAgIHN1cGVyLm1hcmtUcmFuc2Zvcm1EaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBcImNhdGNoLWFsbFwiIGRpcnR5IG1ldGhvZCB0aGF0IGRpcmVjdGx5IG1hcmtzIHRoZSBwYWludERpcnR5IGZsYWcgYW5kIHRyaWdnZXJzIHByb3BhZ2F0aW9uIG9mIGRpcnR5XHJcbiAgICogaW5mb3JtYXRpb24uIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgbWFyayogbWV0aG9kcywgb3IgZGlyZWN0bHkgaXRzZWxmIGlmIHRoZSBwYWludERpcnR5IGZsYWcgaXMgY2hlY2tlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBJdCBzaG91bGQgYmUgZmlyZWQgKGluZGlyZWN0bHkgb3IgZGlyZWN0bHkpIGZvciBhbnl0aGluZyBiZXNpZGVzIHRyYW5zZm9ybXMgdGhhdCBuZWVkcyB0byBtYWtlIGEgZHJhd2FibGVcclxuICAgKiBkaXJ0eS5cclxuICAgKi9cclxuICBtYXJrUGFpbnREaXJ0eSgpIHtcclxuICAgIHRoaXMueHlEaXJ0eSA9IHRydWU7IC8vIHZlcnRleCBwb3NpdGlvbnMgY2FuIGRlcGVuZCBvbiBpbWFnZSB3aWR0aC9oZWlnaHRcclxuICAgIHRoaXMudXZEaXJ0eSA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5tYXJrRGlydHkoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIERPTSBhcHBlYXJhbmNlIG9mIHRoaXMgZHJhd2FibGUgKHdoZXRoZXIgYnkgcHJlcGFyaW5nL2NhbGxpbmcgZHJhdyBjYWxscywgRE9NIGVsZW1lbnQgdXBkYXRlcywgZXRjLilcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB1cGRhdGUgc2hvdWxkIGNvbnRpbnVlIChpZiBmYWxzZSwgZnVydGhlciB1cGRhdGVzIGluIHN1cGVydHlwZSBzdGVwcyBzaG91bGQgbm90XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgYmUgZG9uZSkuXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgLy8gU2VlIGlmIHdlIG5lZWQgdG8gYWN0dWFsbHkgdXBkYXRlIHRoaW5ncyAod2lsbCBiYWlsIG91dCBpZiB3ZSBhcmUgbm90IGRpcnR5LCBvciBpZiB3ZSd2ZSBiZWVuIGRpc3Bvc2VkKVxyXG4gICAgaWYgKCAhc3VwZXIudXBkYXRlKCkgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBlbnN1cmUgdGhhdCB3ZSBoYXZlIGEgcmVzZXJ2ZWQgc3ByaXRlIChwYXJ0IG9mIHRoZSBzcHJpdGVzaGVldClcclxuICAgIHRoaXMucmVzZXJ2ZVNwcml0ZSgpO1xyXG5cclxuICAgIGlmICggdGhpcy5kaXJ0eUltYWdlT3BhY2l0eSB8fCAhdGhpcy51cGRhdGVkT25jZSApIHtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzBfT0ZGU0VUICsgVkVSVEVYX0FfT0ZGU0VUIF0gPSB0aGlzLm5vZGUuX2ltYWdlT3BhY2l0eTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzFfT0ZGU0VUICsgVkVSVEVYX0FfT0ZGU0VUIF0gPSB0aGlzLm5vZGUuX2ltYWdlT3BhY2l0eTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzJfT0ZGU0VUICsgVkVSVEVYX0FfT0ZGU0VUIF0gPSB0aGlzLm5vZGUuX2ltYWdlT3BhY2l0eTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzNfT0ZGU0VUICsgVkVSVEVYX0FfT0ZGU0VUIF0gPSB0aGlzLm5vZGUuX2ltYWdlT3BhY2l0eTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzRfT0ZGU0VUICsgVkVSVEVYX0FfT0ZGU0VUIF0gPSB0aGlzLm5vZGUuX2ltYWdlT3BhY2l0eTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzVfT0ZGU0VUICsgVkVSVEVYX0FfT0ZGU0VUIF0gPSB0aGlzLm5vZGUuX2ltYWdlT3BhY2l0eTtcclxuICAgIH1cclxuICAgIHRoaXMudXBkYXRlZE9uY2UgPSB0cnVlO1xyXG5cclxuICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgYSBzcHJpdGUgKHdlIGRvbid0IGhhdmUgYSBsb2FkZWQgaW1hZ2UgeWV0KSwganVzdCBiYWlsXHJcbiAgICBpZiAoICF0aGlzLnNwcml0ZSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy51dkRpcnR5ICkge1xyXG4gICAgICB0aGlzLnV2RGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIGNvbnN0IHV2Qm91bmRzID0gdGhpcy5zcHJpdGUudXZCb3VuZHM7XHJcblxyXG4gICAgICAvLyBUT0RPOiBjb25zaWRlciByZXZlcnNhbCBvZiBtaW5ZIGFuZCBtYXhZIHVzYWdlIGhlcmUgZm9yIHZlcnRpY2FsIGludmVyc2VcclxuXHJcbiAgICAgIC8vIGZpcnN0IHRyaWFuZ2xlIFVWc1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMF9PRkZTRVQgKyBWRVJURVhfVV9PRkZTRVQgXSA9IHV2Qm91bmRzLm1pblg7IC8vIHVwcGVyIGxlZnQgVVxyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMF9PRkZTRVQgKyBWRVJURVhfVl9PRkZTRVQgXSA9IHV2Qm91bmRzLm1pblk7IC8vIHVwcGVyIGxlZnQgVlxyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMV9PRkZTRVQgKyBWRVJURVhfVV9PRkZTRVQgXSA9IHV2Qm91bmRzLm1pblg7IC8vIGxvd2VyIGxlZnQgVVxyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMV9PRkZTRVQgKyBWRVJURVhfVl9PRkZTRVQgXSA9IHV2Qm91bmRzLm1heFk7IC8vIGxvd2VyIGxlZnQgVlxyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMl9PRkZTRVQgKyBWRVJURVhfVV9PRkZTRVQgXSA9IHV2Qm91bmRzLm1heFg7IC8vIHVwcGVyIHJpZ2h0IFVcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzJfT0ZGU0VUICsgVkVSVEVYX1ZfT0ZGU0VUIF0gPSB1dkJvdW5kcy5taW5ZOyAvLyB1cHBlciByaWdodCBWXHJcblxyXG4gICAgICAvLyBzZWNvbmQgdHJpYW5nbGUgVVZzXHJcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIFZFUlRFWF8zX09GRlNFVCArIFZFUlRFWF9VX09GRlNFVCBdID0gdXZCb3VuZHMubWF4WDsgLy8gdXBwZXIgcmlnaHQgVVxyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfM19PRkZTRVQgKyBWRVJURVhfVl9PRkZTRVQgXSA9IHV2Qm91bmRzLm1pblk7IC8vIHVwcGVyIHJpZ2h0IFZcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzRfT0ZGU0VUICsgVkVSVEVYX1VfT0ZGU0VUIF0gPSB1dkJvdW5kcy5taW5YOyAvLyBsb3dlciBsZWZ0IFVcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzRfT0ZGU0VUICsgVkVSVEVYX1ZfT0ZGU0VUIF0gPSB1dkJvdW5kcy5tYXhZOyAvLyBsb3dlciBsZWZ0IFZcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzVfT0ZGU0VUICsgVkVSVEVYX1VfT0ZGU0VUIF0gPSB1dkJvdW5kcy5tYXhYOyAvLyBsb3dlciByaWdodCBVXHJcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIFZFUlRFWF81X09GRlNFVCArIFZFUlRFWF9WX09GRlNFVCBdID0gdXZCb3VuZHMubWF4WTsgLy8gbG93ZXIgcmlnaHQgVlxyXG4gICAgfVxyXG5cclxuICAgIGlmICggdGhpcy54eURpcnR5ICkge1xyXG4gICAgICB0aGlzLnh5RGlydHkgPSBmYWxzZTtcclxuXHJcbiAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5ub2RlLmdldEltYWdlV2lkdGgoKTtcclxuICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5ub2RlLmdldEltYWdlSGVpZ2h0KCk7XHJcblxyXG4gICAgICBjb25zdCB0cmFuc2Zvcm1NYXRyaXggPSB0aGlzLmluc3RhbmNlLnJlbGF0aXZlVHJhbnNmb3JtLm1hdHJpeDsgLy8gd2l0aCBjb21wdXRlIG5lZWQsIHNob3VsZCBhbHdheXMgYmUgYWNjdXJhdGVcclxuICAgICAgdHJhbnNmb3JtTWF0cml4Lm11bHRpcGx5VmVjdG9yMiggdGhpcy51cHBlckxlZnQuc2V0WFkoIDAsIDAgKSApO1xyXG4gICAgICB0cmFuc2Zvcm1NYXRyaXgubXVsdGlwbHlWZWN0b3IyKCB0aGlzLmxvd2VyTGVmdC5zZXRYWSggMCwgaGVpZ2h0ICkgKTtcclxuICAgICAgdHJhbnNmb3JtTWF0cml4Lm11bHRpcGx5VmVjdG9yMiggdGhpcy51cHBlclJpZ2h0LnNldFhZKCB3aWR0aCwgMCApICk7XHJcbiAgICAgIHRyYW5zZm9ybU1hdHJpeC5tdWx0aXBseVZlY3RvcjIoIHRoaXMubG93ZXJSaWdodC5zZXRYWSggd2lkdGgsIGhlaWdodCApICk7XHJcblxyXG4gICAgICAvLyBmaXJzdCB0cmlhbmdsZSBYWXNcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzBfT0ZGU0VUICsgVkVSVEVYX1hfT0ZGU0VUIF0gPSB0aGlzLnVwcGVyTGVmdC54O1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMF9PRkZTRVQgKyBWRVJURVhfWV9PRkZTRVQgXSA9IHRoaXMudXBwZXJMZWZ0Lnk7XHJcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIFZFUlRFWF8xX09GRlNFVCArIFZFUlRFWF9YX09GRlNFVCBdID0gdGhpcy5sb3dlckxlZnQueDtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzFfT0ZGU0VUICsgVkVSVEVYX1lfT0ZGU0VUIF0gPSB0aGlzLmxvd2VyTGVmdC55O1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMl9PRkZTRVQgKyBWRVJURVhfWF9PRkZTRVQgXSA9IHRoaXMudXBwZXJSaWdodC54O1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfMl9PRkZTRVQgKyBWRVJURVhfWV9PRkZTRVQgXSA9IHRoaXMudXBwZXJSaWdodC55O1xyXG5cclxuICAgICAgLy8gc2Vjb25kIHRyaWFuZ2xlIFhZc1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfM19PRkZTRVQgKyBWRVJURVhfWF9PRkZTRVQgXSA9IHRoaXMudXBwZXJSaWdodC54O1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfM19PRkZTRVQgKyBWRVJURVhfWV9PRkZTRVQgXSA9IHRoaXMudXBwZXJSaWdodC55O1xyXG4gICAgICB0aGlzLnZlcnRleEFycmF5WyBWRVJURVhfNF9PRkZTRVQgKyBWRVJURVhfWF9PRkZTRVQgXSA9IHRoaXMubG93ZXJMZWZ0Lng7XHJcbiAgICAgIHRoaXMudmVydGV4QXJyYXlbIFZFUlRFWF80X09GRlNFVCArIFZFUlRFWF9ZX09GRlNFVCBdID0gdGhpcy5sb3dlckxlZnQueTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzVfT0ZGU0VUICsgVkVSVEVYX1hfT0ZGU0VUIF0gPSB0aGlzLmxvd2VyUmlnaHQueDtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheVsgVkVSVEVYXzVfT0ZGU0VUICsgVkVSVEVYX1lfT0ZGU0VUIF0gPSB0aGlzLmxvd2VyUmlnaHQueTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vIFRPRE86IGRvY1xyXG5JbWFnZVdlYkdMRHJhd2FibGUucHJvdG90eXBlLndlYmdsUmVuZGVyZXIgPSBSZW5kZXJlci53ZWJnbFRleHR1cmVkVHJpYW5nbGVzO1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0ltYWdlV2ViR0xEcmF3YWJsZScsIEltYWdlV2ViR0xEcmF3YWJsZSApO1xyXG5cclxuUG9vbGFibGUubWl4SW50byggSW1hZ2VXZWJHTERyYXdhYmxlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBJbWFnZVdlYkdMRHJhd2FibGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxTQUFTQyxxQkFBcUIsRUFBRUMsUUFBUSxFQUFFQyxPQUFPLEVBQUVDLGlCQUFpQixRQUFRLGtCQUFrQjs7QUFFOUY7QUFDQTtBQUNBLE1BQU1DLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUU1QixNQUFNQyxlQUFlLEdBQUdELGdCQUFnQixHQUFHLENBQUM7QUFDNUMsTUFBTUUsZUFBZSxHQUFHRixnQkFBZ0IsR0FBRyxDQUFDO0FB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