// Copyright 2013-2023, University of Colorado Boulder

/**
 * A node that displays a single image either from an actual HTMLImageElement, a URL, a Canvas element, or a mipmap
 * data structure described in the constructor.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import IOType from '../../../tandem/js/types/IOType.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import { Imageable, ImageCanvasDrawable, ImageDOMDrawable, ImageSVGDrawable, ImageWebGLDrawable, Node, Renderer, scenery, SpriteSheet } from '../imports.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';

// Image-specific options that can be passed in the constructor or mutate() call.
const IMAGE_OPTION_KEYS = ['image',
// {string|HTMLImageElement|HTMLCanvasElement|Array} - Changes the image displayed, see setImage() for documentation
'imageOpacity',
// {number} - Controls opacity of this image (and not children), see setImageOpacity() for documentation
'imageBounds',
// {Bounds2|null} - Controls the amount of the image that is hit-tested or considered "inside" the image, see setImageBounds()
'initialWidth',
// {number} - Width of an image not-yet loaded (for layout), see setInitialWidth() for documentation
'initialHeight',
// {number} - Height of an image not-yet loaded (for layout), see setInitialHeight() for documentation
'mipmap',
// {boolean} - Whether mipmapped output is supported, see setMipmap() for documentation
'mipmapBias',
// {number} - Whether mipmapping tends towards sharp/aliased or blurry, see setMipmapBias() for documentation
'mipmapInitialLevel',
// {number} - How many mipmap levels to generate if needed, see setMipmapInitialLevel() for documentation
'mipmapMaxLevel',
// {number} The maximum mipmap level to compute if needed, see setMipmapMaxLevel() for documentation
'hitTestPixels' // {boolean} - Whether non-transparent pixels will control contained points, see setHitTestPixels() for documentation
];

export default class Image extends Imageable(Node) {
  // If non-null, determines what is considered "inside" the image for containment and hit-testing.

  constructor(image, providedOptions) {
    // rely on the setImage call from the super constructor to do the setup
    const options = optionize()({
      image: image
    }, providedOptions);
    super();
    this._imageBounds = null;
    this.mutate(options);
    this.invalidateSupportedRenderers();
  }

  /**
   * Triggers recomputation of the image's bounds and refreshes any displays output of the image.
   *
   * Generally this can trigger recomputation of mipmaps, will mark any drawables as needing repaints, and will
   * cause a spritesheet change for WebGL.
   *
   * This should be done when the underlying image has changed appearance (usually the case with a Canvas changing,
   * but this is also triggered by our actual image reference changing).
   */
  invalidateImage() {
    if (this._image) {
      this.invalidateSelf(this._imageBounds || new Bounds2(0, 0, this.getImageWidth(), this.getImageHeight()));
    } else {
      this.invalidateSelf(Bounds2.NOTHING);
    }
    const stateLen = this._drawables.length;
    for (let i = 0; i < stateLen; i++) {
      this._drawables[i].markDirtyImage();
    }
    super.invalidateImage();
    this.invalidateSupportedRenderers();
  }

  /**
   * Recomputes what renderers are supported, given the current image information.
   */
  invalidateSupportedRenderers() {
    // Canvas is always permitted
    let r = Renderer.bitmaskCanvas;

    // If it fits within the sprite sheet, then WebGL is also permitted
    // If the image hasn't loaded, the getImageWidth/Height will be 0 and this rule would pass.  However, this
    // function will be called again after the image loads, and would correctly invalidate WebGL, if too large to fit
    // in a SpriteSheet
    const fitsWithinSpriteSheet = this.getImageWidth() <= SpriteSheet.MAX_DIMENSION.width && this.getImageHeight() <= SpriteSheet.MAX_DIMENSION.height;
    if (fitsWithinSpriteSheet) {
      r |= Renderer.bitmaskWebGL;
    }

    // If it is not a canvas, then it can additionally be rendered in SVG or DOM
    if (!(this._image instanceof HTMLCanvasElement)) {
      // assumes HTMLImageElement
      r |= Renderer.bitmaskSVG | Renderer.bitmaskDOM;
    }
    this.setRendererBitmask(r);
  }

  /**
   * Sets an opacity that is applied only to this image (will not affect children or the rest of the node's subtree).
   *
   * This should generally be preferred over Node's opacity if it has the same result, as modifying this will be much
   * faster, and will not force additional Canvases or intermediate steps in display.
   *
   * @param imageOpacity - Should be a number between 0 (transparent) and 1 (opaque), just like normal opacity.
   */
  setImageOpacity(imageOpacity) {
    const changed = this._imageOpacity !== imageOpacity;
    super.setImageOpacity(imageOpacity);
    if (changed) {
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyImageOpacity();
      }
    }
  }

  /**
   * Sets the imageBounds value for the Image. If non-null, determines what is considered "inside" the image for
   * containment and hit-testing.
   *
   * NOTE: This is accomplished by using any provided imageBounds as the node's own selfBounds. This will affect layout,
   * hit-testing, and anything else using the bounds of this node.
   */
  setImageBounds(imageBounds) {
    if (this._imageBounds !== imageBounds) {
      this._imageBounds = imageBounds;
      this.invalidateImage();
    }
  }
  set imageBounds(value) {
    this.setImageBounds(value);
  }
  get imageBounds() {
    return this._imageBounds;
  }

  /**
   * Returns the imageBounds, see setImageBounds for details.
   */
  getImageBounds() {
    return this._imageBounds;
  }

  /**
   * Whether this Node itself is painted (displays something itself).
   */
  isPainted() {
    // Always true for Image nodes
    return true;
  }

  /**
   * Draws the current Node's self representation, assuming the wrapper's Canvas context is already in the local
   * coordinate frame of this node.
   *
   * @param wrapper
   * @param matrix - The transformation matrix already applied to the context.
   */
  canvasPaintSelf(wrapper, matrix) {
    //TODO: Have a separate method for this, instead of touching the prototype. Can make 'this' references too easily.
    ImageCanvasDrawable.prototype.paintCanvas(wrapper, this, matrix);
  }

  /**
   * Creates a DOM drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createDOMDrawable(renderer, instance) {
    // @ts-expect-error - Poolable
    return ImageDOMDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a SVG drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createSVGDrawable(renderer, instance) {
    // @ts-expect-error - Poolable
    return ImageSVGDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a Canvas drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createCanvasDrawable(renderer, instance) {
    // @ts-expect-error - Poolable
    return ImageCanvasDrawable.createFromPool(renderer, instance);
  }

  /**
   * Creates a WebGL drawable for this Image. (scenery-internal)
   *
   * @param renderer - In the bitmask format specified by Renderer, which may contain additional bit flags.
   * @param instance - Instance object that will be associated with the drawable
   */
  createWebGLDrawable(renderer, instance) {
    // @ts-expect-error - Poolable
    return ImageWebGLDrawable.createFromPool(renderer, instance);
  }

  /**
   * Override this for computation of whether a point is inside our self content (defaults to selfBounds check).
   *
   * @param point - Considered to be in the local coordinate frame
   */
  containsPointSelf(point) {
    const inBounds = Node.prototype.containsPointSelf.call(this, point);
    if (!inBounds || !this._hitTestPixels || !this._hitTestImageData) {
      return inBounds;
    }
    return Imageable.testHitTestData(this._hitTestImageData, this.imageWidth, this.imageHeight, point);
  }

  /**
   * Returns a Shape that represents the area covered by containsPointSelf.
   */
  getSelfShape() {
    if (this._hitTestPixels && this._hitTestImageData) {
      // If we're hit-testing pixels, return that shape included.
      return Imageable.hitTestDataToShape(this._hitTestImageData, this.imageWidth, this.imageHeight);
    } else {
      // Otherwise the super call will just include the rectangle (bounds).
      return Node.prototype.getSelfShape.call(this);
    }
  }

  /**
   * Triggers recomputation of mipmaps (as long as mipmapping is enabled)
   */
  invalidateMipmaps() {
    const markDirty = this._image && this._mipmap && !this._mipmapData;
    super.invalidateMipmaps();
    if (markDirty) {
      const stateLen = this._drawables.length;
      for (let i = 0; i < stateLen; i++) {
        this._drawables[i].markDirtyMipmap();
      }
    }
  }
  mutate(options) {
    return super.mutate(options);
  }
  // Initial values for most Node mutator options
  static DEFAULT_IMAGE_OPTIONS = combineOptions({}, Node.DEFAULT_NODE_OPTIONS, Imageable.DEFAULT_OPTIONS);
}

/**
 * {Array.<string>} - String keys for all of the allowed options that will be set by node.mutate( options ), in the
 * order they will be evaluated in.
 *
 * NOTE: See Node's _mutatorKeys documentation for more information on how this operates, and potential special
 *       cases that may apply.
 */
Image.prototype._mutatorKeys = [...IMAGE_OPTION_KEYS, ...Node.prototype._mutatorKeys];

/**
 * {Array.<String>} - List of all dirty flags that should be available on drawables created from this node (or
 *                    subtype). Given a flag (e.g. radius), it indicates the existence of a function
 *                    drawable.markDirtyRadius() that will indicate to the drawable that the radius has changed.
 * (scenery-internal)
 * @override
 */
Image.prototype.drawableMarkFlags = [...Node.prototype.drawableMarkFlags, 'image', 'imageOpacity', 'mipmap'];

// NOTE: Not currently in use
Image.ImageIO = new IOType('ImageIO', {
  valueType: Image,
  supertype: Node.NodeIO,
  events: ['changed'],
  methods: {
    setImage: {
      returnType: VoidIO,
      parameterTypes: [StringIO],
      implementation: function (base64Text) {
        const im = new window.Image();
        im.src = base64Text;
        // @ts-expect-error TODO: how would this even work?
        this.image = im;
      },
      documentation: 'Set the image from a base64 string',
      invocableForReadOnlyElements: false
    }
  }
});
scenery.register('Image', Image);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiSU9UeXBlIiwiU3RyaW5nSU8iLCJWb2lkSU8iLCJJbWFnZWFibGUiLCJJbWFnZUNhbnZhc0RyYXdhYmxlIiwiSW1hZ2VET01EcmF3YWJsZSIsIkltYWdlU1ZHRHJhd2FibGUiLCJJbWFnZVdlYkdMRHJhd2FibGUiLCJOb2RlIiwiUmVuZGVyZXIiLCJzY2VuZXJ5IiwiU3ByaXRlU2hlZXQiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIklNQUdFX09QVElPTl9LRVlTIiwiSW1hZ2UiLCJjb25zdHJ1Y3RvciIsImltYWdlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIl9pbWFnZUJvdW5kcyIsIm11dGF0ZSIsImludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMiLCJpbnZhbGlkYXRlSW1hZ2UiLCJfaW1hZ2UiLCJpbnZhbGlkYXRlU2VsZiIsImdldEltYWdlV2lkdGgiLCJnZXRJbWFnZUhlaWdodCIsIk5PVEhJTkciLCJzdGF0ZUxlbiIsIl9kcmF3YWJsZXMiLCJsZW5ndGgiLCJpIiwibWFya0RpcnR5SW1hZ2UiLCJyIiwiYml0bWFza0NhbnZhcyIsImZpdHNXaXRoaW5TcHJpdGVTaGVldCIsIk1BWF9ESU1FTlNJT04iLCJ3aWR0aCIsImhlaWdodCIsImJpdG1hc2tXZWJHTCIsIkhUTUxDYW52YXNFbGVtZW50IiwiYml0bWFza1NWRyIsImJpdG1hc2tET00iLCJzZXRSZW5kZXJlckJpdG1hc2siLCJzZXRJbWFnZU9wYWNpdHkiLCJpbWFnZU9wYWNpdHkiLCJjaGFuZ2VkIiwiX2ltYWdlT3BhY2l0eSIsIm1hcmtEaXJ0eUltYWdlT3BhY2l0eSIsInNldEltYWdlQm91bmRzIiwiaW1hZ2VCb3VuZHMiLCJ2YWx1ZSIsImdldEltYWdlQm91bmRzIiwiaXNQYWludGVkIiwiY2FudmFzUGFpbnRTZWxmIiwid3JhcHBlciIsIm1hdHJpeCIsInByb3RvdHlwZSIsInBhaW50Q2FudmFzIiwiY3JlYXRlRE9NRHJhd2FibGUiLCJyZW5kZXJlciIsImluc3RhbmNlIiwiY3JlYXRlRnJvbVBvb2wiLCJjcmVhdGVTVkdEcmF3YWJsZSIsImNyZWF0ZUNhbnZhc0RyYXdhYmxlIiwiY3JlYXRlV2ViR0xEcmF3YWJsZSIsImNvbnRhaW5zUG9pbnRTZWxmIiwicG9pbnQiLCJpbkJvdW5kcyIsImNhbGwiLCJfaGl0VGVzdFBpeGVscyIsIl9oaXRUZXN0SW1hZ2VEYXRhIiwidGVzdEhpdFRlc3REYXRhIiwiaW1hZ2VXaWR0aCIsImltYWdlSGVpZ2h0IiwiZ2V0U2VsZlNoYXBlIiwiaGl0VGVzdERhdGFUb1NoYXBlIiwiaW52YWxpZGF0ZU1pcG1hcHMiLCJtYXJrRGlydHkiLCJfbWlwbWFwIiwiX21pcG1hcERhdGEiLCJtYXJrRGlydHlNaXBtYXAiLCJERUZBVUxUX0lNQUdFX09QVElPTlMiLCJERUZBVUxUX05PREVfT1BUSU9OUyIsIkRFRkFVTFRfT1BUSU9OUyIsIl9tdXRhdG9yS2V5cyIsImRyYXdhYmxlTWFya0ZsYWdzIiwiSW1hZ2VJTyIsInZhbHVlVHlwZSIsInN1cGVydHlwZSIsIk5vZGVJTyIsImV2ZW50cyIsIm1ldGhvZHMiLCJzZXRJbWFnZSIsInJldHVyblR5cGUiLCJwYXJhbWV0ZXJUeXBlcyIsImltcGxlbWVudGF0aW9uIiwiYmFzZTY0VGV4dCIsImltIiwid2luZG93Iiwic3JjIiwiZG9jdW1lbnRhdGlvbiIsImludm9jYWJsZUZvclJlYWRPbmx5RWxlbWVudHMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkltYWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9kZSB0aGF0IGRpc3BsYXlzIGEgc2luZ2xlIGltYWdlIGVpdGhlciBmcm9tIGFuIGFjdHVhbCBIVE1MSW1hZ2VFbGVtZW50LCBhIFVSTCwgYSBDYW52YXMgZWxlbWVudCwgb3IgYSBtaXBtYXBcclxuICogZGF0YSBzdHJ1Y3R1cmUgZGVzY3JpYmVkIGluIHRoZSBjb25zdHJ1Y3Rvci5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IFN0cmluZ0lPIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9TdHJpbmdJTy5qcyc7XHJcbmltcG9ydCBWb2lkSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1ZvaWRJTy5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENhbnZhc0NvbnRleHRXcmFwcGVyLCBDYW52YXNTZWxmRHJhd2FibGUsIERPTVNlbGZEcmF3YWJsZSwgVEltYWdlRHJhd2FibGUsIEltYWdlYWJsZSwgSW1hZ2VhYmxlSW1hZ2UsIEltYWdlYWJsZU9wdGlvbnMsIEltYWdlQ2FudmFzRHJhd2FibGUsIEltYWdlRE9NRHJhd2FibGUsIEltYWdlU1ZHRHJhd2FibGUsIEltYWdlV2ViR0xEcmF3YWJsZSwgSW5zdGFuY2UsIE5vZGUsIE5vZGVPcHRpb25zLCBSZW5kZXJlciwgc2NlbmVyeSwgU3ByaXRlU2hlZXQsIFNWR1NlbGZEcmF3YWJsZSwgV2ViR0xTZWxmRHJhd2FibGUgfSBmcm9tICcuLi9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5cclxuXHJcbi8vIEltYWdlLXNwZWNpZmljIG9wdGlvbnMgdGhhdCBjYW4gYmUgcGFzc2VkIGluIHRoZSBjb25zdHJ1Y3RvciBvciBtdXRhdGUoKSBjYWxsLlxyXG5jb25zdCBJTUFHRV9PUFRJT05fS0VZUyA9IFtcclxuICAnaW1hZ2UnLCAvLyB7c3RyaW5nfEhUTUxJbWFnZUVsZW1lbnR8SFRNTENhbnZhc0VsZW1lbnR8QXJyYXl9IC0gQ2hhbmdlcyB0aGUgaW1hZ2UgZGlzcGxheWVkLCBzZWUgc2V0SW1hZ2UoKSBmb3IgZG9jdW1lbnRhdGlvblxyXG4gICdpbWFnZU9wYWNpdHknLCAvLyB7bnVtYmVyfSAtIENvbnRyb2xzIG9wYWNpdHkgb2YgdGhpcyBpbWFnZSAoYW5kIG5vdCBjaGlsZHJlbiksIHNlZSBzZXRJbWFnZU9wYWNpdHkoKSBmb3IgZG9jdW1lbnRhdGlvblxyXG4gICdpbWFnZUJvdW5kcycsIC8vIHtCb3VuZHMyfG51bGx9IC0gQ29udHJvbHMgdGhlIGFtb3VudCBvZiB0aGUgaW1hZ2UgdGhhdCBpcyBoaXQtdGVzdGVkIG9yIGNvbnNpZGVyZWQgXCJpbnNpZGVcIiB0aGUgaW1hZ2UsIHNlZSBzZXRJbWFnZUJvdW5kcygpXHJcbiAgJ2luaXRpYWxXaWR0aCcsIC8vIHtudW1iZXJ9IC0gV2lkdGggb2YgYW4gaW1hZ2Ugbm90LXlldCBsb2FkZWQgKGZvciBsYXlvdXQpLCBzZWUgc2V0SW5pdGlhbFdpZHRoKCkgZm9yIGRvY3VtZW50YXRpb25cclxuICAnaW5pdGlhbEhlaWdodCcsIC8vIHtudW1iZXJ9IC0gSGVpZ2h0IG9mIGFuIGltYWdlIG5vdC15ZXQgbG9hZGVkIChmb3IgbGF5b3V0KSwgc2VlIHNldEluaXRpYWxIZWlnaHQoKSBmb3IgZG9jdW1lbnRhdGlvblxyXG4gICdtaXBtYXAnLCAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIG1pcG1hcHBlZCBvdXRwdXQgaXMgc3VwcG9ydGVkLCBzZWUgc2V0TWlwbWFwKCkgZm9yIGRvY3VtZW50YXRpb25cclxuICAnbWlwbWFwQmlhcycsIC8vIHtudW1iZXJ9IC0gV2hldGhlciBtaXBtYXBwaW5nIHRlbmRzIHRvd2FyZHMgc2hhcnAvYWxpYXNlZCBvciBibHVycnksIHNlZSBzZXRNaXBtYXBCaWFzKCkgZm9yIGRvY3VtZW50YXRpb25cclxuICAnbWlwbWFwSW5pdGlhbExldmVsJywgLy8ge251bWJlcn0gLSBIb3cgbWFueSBtaXBtYXAgbGV2ZWxzIHRvIGdlbmVyYXRlIGlmIG5lZWRlZCwgc2VlIHNldE1pcG1hcEluaXRpYWxMZXZlbCgpIGZvciBkb2N1bWVudGF0aW9uXHJcbiAgJ21pcG1hcE1heExldmVsJywgLy8ge251bWJlcn0gVGhlIG1heGltdW0gbWlwbWFwIGxldmVsIHRvIGNvbXB1dGUgaWYgbmVlZGVkLCBzZWUgc2V0TWlwbWFwTWF4TGV2ZWwoKSBmb3IgZG9jdW1lbnRhdGlvblxyXG4gICdoaXRUZXN0UGl4ZWxzJyAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIG5vbi10cmFuc3BhcmVudCBwaXhlbHMgd2lsbCBjb250cm9sIGNvbnRhaW5lZCBwb2ludHMsIHNlZSBzZXRIaXRUZXN0UGl4ZWxzKCkgZm9yIGRvY3VtZW50YXRpb25cclxuXTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgaW1hZ2VCb3VuZHM/OiBCb3VuZHMyIHwgbnVsbDtcclxufTtcclxuXHJcbnR5cGUgUGFyZW50T3B0aW9ucyA9IE5vZGVPcHRpb25zICYgSW1hZ2VhYmxlT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIEltYWdlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGFyZW50T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYWdlIGV4dGVuZHMgSW1hZ2VhYmxlKCBOb2RlICkge1xyXG5cclxuICAvLyBJZiBub24tbnVsbCwgZGV0ZXJtaW5lcyB3aGF0IGlzIGNvbnNpZGVyZWQgXCJpbnNpZGVcIiB0aGUgaW1hZ2UgZm9yIGNvbnRhaW5tZW50IGFuZCBoaXQtdGVzdGluZy5cclxuICBwcml2YXRlIF9pbWFnZUJvdW5kczogQm91bmRzMiB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaW1hZ2U6IEltYWdlYWJsZUltYWdlLCBwcm92aWRlZE9wdGlvbnM/OiBJbWFnZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgLy8gcmVseSBvbiB0aGUgc2V0SW1hZ2UgY2FsbCBmcm9tIHRoZSBzdXBlciBjb25zdHJ1Y3RvciB0byBkbyB0aGUgc2V0dXBcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SW1hZ2VPcHRpb25zLCBFbXB0eVNlbGZPcHRpb25zLCBQYXJlbnRPcHRpb25zPigpKCB7XHJcbiAgICAgIGltYWdlOiBpbWFnZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICB0aGlzLl9pbWFnZUJvdW5kcyA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGVTdXBwb3J0ZWRSZW5kZXJlcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRyaWdnZXJzIHJlY29tcHV0YXRpb24gb2YgdGhlIGltYWdlJ3MgYm91bmRzIGFuZCByZWZyZXNoZXMgYW55IGRpc3BsYXlzIG91dHB1dCBvZiB0aGUgaW1hZ2UuXHJcbiAgICpcclxuICAgKiBHZW5lcmFsbHkgdGhpcyBjYW4gdHJpZ2dlciByZWNvbXB1dGF0aW9uIG9mIG1pcG1hcHMsIHdpbGwgbWFyayBhbnkgZHJhd2FibGVzIGFzIG5lZWRpbmcgcmVwYWludHMsIGFuZCB3aWxsXHJcbiAgICogY2F1c2UgYSBzcHJpdGVzaGVldCBjaGFuZ2UgZm9yIFdlYkdMLlxyXG4gICAqXHJcbiAgICogVGhpcyBzaG91bGQgYmUgZG9uZSB3aGVuIHRoZSB1bmRlcmx5aW5nIGltYWdlIGhhcyBjaGFuZ2VkIGFwcGVhcmFuY2UgKHVzdWFsbHkgdGhlIGNhc2Ugd2l0aCBhIENhbnZhcyBjaGFuZ2luZyxcclxuICAgKiBidXQgdGhpcyBpcyBhbHNvIHRyaWdnZXJlZCBieSBvdXIgYWN0dWFsIGltYWdlIHJlZmVyZW5jZSBjaGFuZ2luZykuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGludmFsaWRhdGVJbWFnZSgpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5faW1hZ2UgKSB7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVNlbGYoIHRoaXMuX2ltYWdlQm91bmRzIHx8IG5ldyBCb3VuZHMyKCAwLCAwLCB0aGlzLmdldEltYWdlV2lkdGgoKSwgdGhpcy5nZXRJbWFnZUhlaWdodCgpICkgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVTZWxmKCBCb3VuZHMyLk5PVEhJTkcgKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdGF0ZUxlbiA9IHRoaXMuX2RyYXdhYmxlcy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAoIHRoaXMuX2RyYXdhYmxlc1sgaSBdIGFzIHVua25vd24gYXMgVEltYWdlRHJhd2FibGUgKS5tYXJrRGlydHlJbWFnZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyLmludmFsaWRhdGVJbWFnZSgpO1xyXG5cclxuICAgIHRoaXMuaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVjb21wdXRlcyB3aGF0IHJlbmRlcmVycyBhcmUgc3VwcG9ydGVkLCBnaXZlbiB0aGUgY3VycmVudCBpbWFnZSBpbmZvcm1hdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaW52YWxpZGF0ZVN1cHBvcnRlZFJlbmRlcmVycygpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBDYW52YXMgaXMgYWx3YXlzIHBlcm1pdHRlZFxyXG4gICAgbGV0IHIgPSBSZW5kZXJlci5iaXRtYXNrQ2FudmFzO1xyXG5cclxuICAgIC8vIElmIGl0IGZpdHMgd2l0aGluIHRoZSBzcHJpdGUgc2hlZXQsIHRoZW4gV2ViR0wgaXMgYWxzbyBwZXJtaXR0ZWRcclxuICAgIC8vIElmIHRoZSBpbWFnZSBoYXNuJ3QgbG9hZGVkLCB0aGUgZ2V0SW1hZ2VXaWR0aC9IZWlnaHQgd2lsbCBiZSAwIGFuZCB0aGlzIHJ1bGUgd291bGQgcGFzcy4gIEhvd2V2ZXIsIHRoaXNcclxuICAgIC8vIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFnYWluIGFmdGVyIHRoZSBpbWFnZSBsb2FkcywgYW5kIHdvdWxkIGNvcnJlY3RseSBpbnZhbGlkYXRlIFdlYkdMLCBpZiB0b28gbGFyZ2UgdG8gZml0XHJcbiAgICAvLyBpbiBhIFNwcml0ZVNoZWV0XHJcbiAgICBjb25zdCBmaXRzV2l0aGluU3ByaXRlU2hlZXQgPSB0aGlzLmdldEltYWdlV2lkdGgoKSA8PSBTcHJpdGVTaGVldC5NQVhfRElNRU5TSU9OLndpZHRoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEltYWdlSGVpZ2h0KCkgPD0gU3ByaXRlU2hlZXQuTUFYX0RJTUVOU0lPTi5oZWlnaHQ7XHJcbiAgICBpZiAoIGZpdHNXaXRoaW5TcHJpdGVTaGVldCApIHtcclxuICAgICAgciB8PSBSZW5kZXJlci5iaXRtYXNrV2ViR0w7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgaXQgaXMgbm90IGEgY2FudmFzLCB0aGVuIGl0IGNhbiBhZGRpdGlvbmFsbHkgYmUgcmVuZGVyZWQgaW4gU1ZHIG9yIERPTVxyXG4gICAgaWYgKCAhKCB0aGlzLl9pbWFnZSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50ICkgKSB7XHJcbiAgICAgIC8vIGFzc3VtZXMgSFRNTEltYWdlRWxlbWVudFxyXG4gICAgICByIHw9IFJlbmRlcmVyLmJpdG1hc2tTVkcgfCBSZW5kZXJlci5iaXRtYXNrRE9NO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2V0UmVuZGVyZXJCaXRtYXNrKCByICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGFuIG9wYWNpdHkgdGhhdCBpcyBhcHBsaWVkIG9ubHkgdG8gdGhpcyBpbWFnZSAod2lsbCBub3QgYWZmZWN0IGNoaWxkcmVuIG9yIHRoZSByZXN0IG9mIHRoZSBub2RlJ3Mgc3VidHJlZSkuXHJcbiAgICpcclxuICAgKiBUaGlzIHNob3VsZCBnZW5lcmFsbHkgYmUgcHJlZmVycmVkIG92ZXIgTm9kZSdzIG9wYWNpdHkgaWYgaXQgaGFzIHRoZSBzYW1lIHJlc3VsdCwgYXMgbW9kaWZ5aW5nIHRoaXMgd2lsbCBiZSBtdWNoXHJcbiAgICogZmFzdGVyLCBhbmQgd2lsbCBub3QgZm9yY2UgYWRkaXRpb25hbCBDYW52YXNlcyBvciBpbnRlcm1lZGlhdGUgc3RlcHMgaW4gZGlzcGxheS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBpbWFnZU9wYWNpdHkgLSBTaG91bGQgYmUgYSBudW1iZXIgYmV0d2VlbiAwICh0cmFuc3BhcmVudCkgYW5kIDEgKG9wYXF1ZSksIGp1c3QgbGlrZSBub3JtYWwgb3BhY2l0eS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgc2V0SW1hZ2VPcGFjaXR5KCBpbWFnZU9wYWNpdHk6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGNvbnN0IGNoYW5nZWQgPSB0aGlzLl9pbWFnZU9wYWNpdHkgIT09IGltYWdlT3BhY2l0eTtcclxuXHJcbiAgICBzdXBlci5zZXRJbWFnZU9wYWNpdHkoIGltYWdlT3BhY2l0eSApO1xyXG5cclxuICAgIGlmICggY2hhbmdlZCApIHtcclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUSW1hZ2VEcmF3YWJsZSApLm1hcmtEaXJ0eUltYWdlT3BhY2l0eSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBpbWFnZUJvdW5kcyB2YWx1ZSBmb3IgdGhlIEltYWdlLiBJZiBub24tbnVsbCwgZGV0ZXJtaW5lcyB3aGF0IGlzIGNvbnNpZGVyZWQgXCJpbnNpZGVcIiB0aGUgaW1hZ2UgZm9yXHJcbiAgICogY29udGFpbm1lbnQgYW5kIGhpdC10ZXN0aW5nLlxyXG4gICAqXHJcbiAgICogTk9URTogVGhpcyBpcyBhY2NvbXBsaXNoZWQgYnkgdXNpbmcgYW55IHByb3ZpZGVkIGltYWdlQm91bmRzIGFzIHRoZSBub2RlJ3Mgb3duIHNlbGZCb3VuZHMuIFRoaXMgd2lsbCBhZmZlY3QgbGF5b3V0LFxyXG4gICAqIGhpdC10ZXN0aW5nLCBhbmQgYW55dGhpbmcgZWxzZSB1c2luZyB0aGUgYm91bmRzIG9mIHRoaXMgbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0SW1hZ2VCb3VuZHMoIGltYWdlQm91bmRzOiBCb3VuZHMyIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5faW1hZ2VCb3VuZHMgIT09IGltYWdlQm91bmRzICkge1xyXG4gICAgICB0aGlzLl9pbWFnZUJvdW5kcyA9IGltYWdlQm91bmRzO1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlSW1hZ2UoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgaW1hZ2VCb3VuZHMoIHZhbHVlOiBCb3VuZHMyIHwgbnVsbCApIHsgdGhpcy5zZXRJbWFnZUJvdW5kcyggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGltYWdlQm91bmRzKCk6IEJvdW5kczIgfCBudWxsIHsgcmV0dXJuIHRoaXMuX2ltYWdlQm91bmRzOyB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGltYWdlQm91bmRzLCBzZWUgc2V0SW1hZ2VCb3VuZHMgZm9yIGRldGFpbHMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEltYWdlQm91bmRzKCk6IEJvdW5kczIgfCBudWxsIHtcclxuICAgIHJldHVybiB0aGlzLl9pbWFnZUJvdW5kcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFdoZXRoZXIgdGhpcyBOb2RlIGl0c2VsZiBpcyBwYWludGVkIChkaXNwbGF5cyBzb21ldGhpbmcgaXRzZWxmKS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaXNQYWludGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgLy8gQWx3YXlzIHRydWUgZm9yIEltYWdlIG5vZGVzXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERyYXdzIHRoZSBjdXJyZW50IE5vZGUncyBzZWxmIHJlcHJlc2VudGF0aW9uLCBhc3N1bWluZyB0aGUgd3JhcHBlcidzIENhbnZhcyBjb250ZXh0IGlzIGFscmVhZHkgaW4gdGhlIGxvY2FsXHJcbiAgICogY29vcmRpbmF0ZSBmcmFtZSBvZiB0aGlzIG5vZGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gd3JhcHBlclxyXG4gICAqIEBwYXJhbSBtYXRyaXggLSBUaGUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGFscmVhZHkgYXBwbGllZCB0byB0aGUgY29udGV4dC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgY2FudmFzUGFpbnRTZWxmKCB3cmFwcGVyOiBDYW52YXNDb250ZXh0V3JhcHBlciwgbWF0cml4OiBNYXRyaXgzICk6IHZvaWQge1xyXG4gICAgLy9UT0RPOiBIYXZlIGEgc2VwYXJhdGUgbWV0aG9kIGZvciB0aGlzLCBpbnN0ZWFkIG9mIHRvdWNoaW5nIHRoZSBwcm90b3R5cGUuIENhbiBtYWtlICd0aGlzJyByZWZlcmVuY2VzIHRvbyBlYXNpbHkuXHJcbiAgICBJbWFnZUNhbnZhc0RyYXdhYmxlLnByb3RvdHlwZS5wYWludENhbnZhcyggd3JhcHBlciwgdGhpcywgbWF0cml4ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgRE9NIGRyYXdhYmxlIGZvciB0aGlzIEltYWdlLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgKlxyXG4gICAqIEBwYXJhbSByZW5kZXJlciAtIEluIHRoZSBiaXRtYXNrIGZvcm1hdCBzcGVjaWZpZWQgYnkgUmVuZGVyZXIsIHdoaWNoIG1heSBjb250YWluIGFkZGl0aW9uYWwgYml0IGZsYWdzLlxyXG4gICAqIEBwYXJhbSBpbnN0YW5jZSAtIEluc3RhbmNlIG9iamVjdCB0aGF0IHdpbGwgYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVET01EcmF3YWJsZSggcmVuZGVyZXI6IG51bWJlciwgaW5zdGFuY2U6IEluc3RhbmNlICk6IERPTVNlbGZEcmF3YWJsZSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gUG9vbGFibGVcclxuICAgIHJldHVybiBJbWFnZURPTURyYXdhYmxlLmNyZWF0ZUZyb21Qb29sKCByZW5kZXJlciwgaW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBTVkcgZHJhd2FibGUgZm9yIHRoaXMgSW1hZ2UuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVNWR0RyYXdhYmxlKCByZW5kZXJlcjogbnVtYmVyLCBpbnN0YW5jZTogSW5zdGFuY2UgKTogU1ZHU2VsZkRyYXdhYmxlIHtcclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBQb29sYWJsZVxyXG4gICAgcmV0dXJuIEltYWdlU1ZHRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIENhbnZhcyBkcmF3YWJsZSBmb3IgdGhpcyBJbWFnZS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcmVuZGVyZXIgLSBJbiB0aGUgYml0bWFzayBmb3JtYXQgc3BlY2lmaWVkIGJ5IFJlbmRlcmVyLCB3aGljaCBtYXkgY29udGFpbiBhZGRpdGlvbmFsIGJpdCBmbGFncy5cclxuICAgKiBAcGFyYW0gaW5zdGFuY2UgLSBJbnN0YW5jZSBvYmplY3QgdGhhdCB3aWxsIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgZHJhd2FibGVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlQ2FudmFzRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBDYW52YXNTZWxmRHJhd2FibGUge1xyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIFBvb2xhYmxlXHJcbiAgICByZXR1cm4gSW1hZ2VDYW52YXNEcmF3YWJsZS5jcmVhdGVGcm9tUG9vbCggcmVuZGVyZXIsIGluc3RhbmNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgV2ViR0wgZHJhd2FibGUgZm9yIHRoaXMgSW1hZ2UuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHJlbmRlcmVyIC0gSW4gdGhlIGJpdG1hc2sgZm9ybWF0IHNwZWNpZmllZCBieSBSZW5kZXJlciwgd2hpY2ggbWF5IGNvbnRhaW4gYWRkaXRpb25hbCBiaXQgZmxhZ3MuXHJcbiAgICogQHBhcmFtIGluc3RhbmNlIC0gSW5zdGFuY2Ugb2JqZWN0IHRoYXQgd2lsbCBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVdlYkdMRHJhd2FibGUoIHJlbmRlcmVyOiBudW1iZXIsIGluc3RhbmNlOiBJbnN0YW5jZSApOiBXZWJHTFNlbGZEcmF3YWJsZSB7XHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gUG9vbGFibGVcclxuICAgIHJldHVybiBJbWFnZVdlYkdMRHJhd2FibGUuY3JlYXRlRnJvbVBvb2woIHJlbmRlcmVyLCBpbnN0YW5jZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT3ZlcnJpZGUgdGhpcyBmb3IgY29tcHV0YXRpb24gb2Ygd2hldGhlciBhIHBvaW50IGlzIGluc2lkZSBvdXIgc2VsZiBjb250ZW50IChkZWZhdWx0cyB0byBzZWxmQm91bmRzIGNoZWNrKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwb2ludCAtIENvbnNpZGVyZWQgdG8gYmUgaW4gdGhlIGxvY2FsIGNvb3JkaW5hdGUgZnJhbWVcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY29udGFpbnNQb2ludFNlbGYoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgaW5Cb3VuZHMgPSBOb2RlLnByb3RvdHlwZS5jb250YWluc1BvaW50U2VsZi5jYWxsKCB0aGlzLCBwb2ludCApO1xyXG5cclxuICAgIGlmICggIWluQm91bmRzIHx8ICF0aGlzLl9oaXRUZXN0UGl4ZWxzIHx8ICF0aGlzLl9oaXRUZXN0SW1hZ2VEYXRhICkge1xyXG4gICAgICByZXR1cm4gaW5Cb3VuZHM7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEltYWdlYWJsZS50ZXN0SGl0VGVzdERhdGEoIHRoaXMuX2hpdFRlc3RJbWFnZURhdGEsIHRoaXMuaW1hZ2VXaWR0aCwgdGhpcy5pbWFnZUhlaWdodCwgcG9pbnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBTaGFwZSB0aGF0IHJlcHJlc2VudHMgdGhlIGFyZWEgY292ZXJlZCBieSBjb250YWluc1BvaW50U2VsZi5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0U2VsZlNoYXBlKCk6IFNoYXBlIHtcclxuICAgIGlmICggdGhpcy5faGl0VGVzdFBpeGVscyAmJiB0aGlzLl9oaXRUZXN0SW1hZ2VEYXRhICkge1xyXG4gICAgICAvLyBJZiB3ZSdyZSBoaXQtdGVzdGluZyBwaXhlbHMsIHJldHVybiB0aGF0IHNoYXBlIGluY2x1ZGVkLlxyXG4gICAgICByZXR1cm4gSW1hZ2VhYmxlLmhpdFRlc3REYXRhVG9TaGFwZSggdGhpcy5faGl0VGVzdEltYWdlRGF0YSwgdGhpcy5pbWFnZVdpZHRoLCB0aGlzLmltYWdlSGVpZ2h0ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy8gT3RoZXJ3aXNlIHRoZSBzdXBlciBjYWxsIHdpbGwganVzdCBpbmNsdWRlIHRoZSByZWN0YW5nbGUgKGJvdW5kcykuXHJcbiAgICAgIHJldHVybiBOb2RlLnByb3RvdHlwZS5nZXRTZWxmU2hhcGUuY2FsbCggdGhpcyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHJpZ2dlcnMgcmVjb21wdXRhdGlvbiBvZiBtaXBtYXBzIChhcyBsb25nIGFzIG1pcG1hcHBpbmcgaXMgZW5hYmxlZClcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgaW52YWxpZGF0ZU1pcG1hcHMoKTogdm9pZCB7XHJcbiAgICBjb25zdCBtYXJrRGlydHkgPSB0aGlzLl9pbWFnZSAmJiB0aGlzLl9taXBtYXAgJiYgIXRoaXMuX21pcG1hcERhdGE7XHJcblxyXG4gICAgc3VwZXIuaW52YWxpZGF0ZU1pcG1hcHMoKTtcclxuXHJcbiAgICBpZiAoIG1hcmtEaXJ0eSApIHtcclxuICAgICAgY29uc3Qgc3RhdGVMZW4gPSB0aGlzLl9kcmF3YWJsZXMubGVuZ3RoO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGF0ZUxlbjsgaSsrICkge1xyXG4gICAgICAgICggdGhpcy5fZHJhd2FibGVzWyBpIF0gYXMgdW5rbm93biBhcyBUSW1hZ2VEcmF3YWJsZSApLm1hcmtEaXJ0eU1pcG1hcCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgbXV0YXRlKCBvcHRpb25zPzogSW1hZ2VPcHRpb25zICk6IHRoaXMge1xyXG4gICAgcmV0dXJuIHN1cGVyLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBJbWFnZUlPOiBJT1R5cGU7XHJcblxyXG4gIC8vIEluaXRpYWwgdmFsdWVzIGZvciBtb3N0IE5vZGUgbXV0YXRvciBvcHRpb25zXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBERUZBVUxUX0lNQUdFX09QVElPTlMgPSBjb21iaW5lT3B0aW9uczxJbWFnZU9wdGlvbnM+KCB7fSwgTm9kZS5ERUZBVUxUX05PREVfT1BUSU9OUywgSW1hZ2VhYmxlLkRFRkFVTFRfT1BUSU9OUyApO1xyXG59XHJcblxyXG4vKipcclxuICoge0FycmF5LjxzdHJpbmc+fSAtIFN0cmluZyBrZXlzIGZvciBhbGwgb2YgdGhlIGFsbG93ZWQgb3B0aW9ucyB0aGF0IHdpbGwgYmUgc2V0IGJ5IG5vZGUubXV0YXRlKCBvcHRpb25zICksIGluIHRoZVxyXG4gKiBvcmRlciB0aGV5IHdpbGwgYmUgZXZhbHVhdGVkIGluLlxyXG4gKlxyXG4gKiBOT1RFOiBTZWUgTm9kZSdzIF9tdXRhdG9yS2V5cyBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGluZm9ybWF0aW9uIG9uIGhvdyB0aGlzIG9wZXJhdGVzLCBhbmQgcG90ZW50aWFsIHNwZWNpYWxcclxuICogICAgICAgY2FzZXMgdGhhdCBtYXkgYXBwbHkuXHJcbiAqL1xyXG5JbWFnZS5wcm90b3R5cGUuX211dGF0b3JLZXlzID0gWyAuLi5JTUFHRV9PUFRJT05fS0VZUywgLi4uTm9kZS5wcm90b3R5cGUuX211dGF0b3JLZXlzIF07XHJcblxyXG4vKipcclxuICoge0FycmF5LjxTdHJpbmc+fSAtIExpc3Qgb2YgYWxsIGRpcnR5IGZsYWdzIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSBvbiBkcmF3YWJsZXMgY3JlYXRlZCBmcm9tIHRoaXMgbm9kZSAob3JcclxuICogICAgICAgICAgICAgICAgICAgIHN1YnR5cGUpLiBHaXZlbiBhIGZsYWcgKGUuZy4gcmFkaXVzKSwgaXQgaW5kaWNhdGVzIHRoZSBleGlzdGVuY2Ugb2YgYSBmdW5jdGlvblxyXG4gKiAgICAgICAgICAgICAgICAgICAgZHJhd2FibGUubWFya0RpcnR5UmFkaXVzKCkgdGhhdCB3aWxsIGluZGljYXRlIHRvIHRoZSBkcmF3YWJsZSB0aGF0IHRoZSByYWRpdXMgaGFzIGNoYW5nZWQuXHJcbiAqIChzY2VuZXJ5LWludGVybmFsKVxyXG4gKiBAb3ZlcnJpZGVcclxuICovXHJcbkltYWdlLnByb3RvdHlwZS5kcmF3YWJsZU1hcmtGbGFncyA9IFsgLi4uTm9kZS5wcm90b3R5cGUuZHJhd2FibGVNYXJrRmxhZ3MsICdpbWFnZScsICdpbWFnZU9wYWNpdHknLCAnbWlwbWFwJyBdO1xyXG5cclxuLy8gTk9URTogTm90IGN1cnJlbnRseSBpbiB1c2VcclxuSW1hZ2UuSW1hZ2VJTyA9IG5ldyBJT1R5cGUoICdJbWFnZUlPJywge1xyXG4gIHZhbHVlVHlwZTogSW1hZ2UsXHJcbiAgc3VwZXJ0eXBlOiBOb2RlLk5vZGVJTyxcclxuICBldmVudHM6IFsgJ2NoYW5nZWQnIF0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgc2V0SW1hZ2U6IHtcclxuICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxyXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBTdHJpbmdJTyBdLFxyXG4gICAgICBpbXBsZW1lbnRhdGlvbjogZnVuY3Rpb24oIGJhc2U2NFRleHQ6IHN0cmluZyApIHtcclxuICAgICAgICBjb25zdCBpbSA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcclxuICAgICAgICBpbS5zcmMgPSBiYXNlNjRUZXh0O1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVE9ETzogaG93IHdvdWxkIHRoaXMgZXZlbiB3b3JrP1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbTtcclxuICAgICAgfSxcclxuICAgICAgZG9jdW1lbnRhdGlvbjogJ1NldCB0aGUgaW1hZ2UgZnJvbSBhIGJhc2U2NCBzdHJpbmcnLFxyXG4gICAgICBpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzOiBmYWxzZVxyXG4gICAgfVxyXG4gIH1cclxufSApO1xyXG5cclxuc2NlbmVyeS5yZWdpc3RlciggJ0ltYWdlJywgSW1hZ2UgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxNQUFNLE1BQU0sb0NBQW9DO0FBQ3ZELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsT0FBT0MsTUFBTSxNQUFNLG9DQUFvQztBQUl2RCxTQUFvRkMsU0FBUyxFQUFvQ0MsbUJBQW1CLEVBQUVDLGdCQUFnQixFQUFFQyxnQkFBZ0IsRUFBRUMsa0JBQWtCLEVBQVlDLElBQUksRUFBZUMsUUFBUSxFQUFFQyxPQUFPLEVBQUVDLFdBQVcsUUFBNEMsZUFBZTtBQUNwVSxPQUFPQyxTQUFTLElBQUlDLGNBQWMsUUFBMEIsb0NBQW9DOztBQUdoRztBQUNBLE1BQU1DLGlCQUFpQixHQUFHLENBQ3hCLE9BQU87QUFBRTtBQUNULGNBQWM7QUFBRTtBQUNoQixhQUFhO0FBQUU7QUFDZixjQUFjO0FBQUU7QUFDaEIsZUFBZTtBQUFFO0FBQ2pCLFFBQVE7QUFBRTtBQUNWLFlBQVk7QUFBRTtBQUNkLG9CQUFvQjtBQUFFO0FBQ3RCLGdCQUFnQjtBQUFFO0FBQ2xCLGVBQWUsQ0FBQztBQUFBLENBQ2pCOztBQVVELGVBQWUsTUFBTUMsS0FBSyxTQUFTWixTQUFTLENBQUVLLElBQUssQ0FBQyxDQUFDO0VBRW5EOztFQUdPUSxXQUFXQSxDQUFFQyxLQUFxQixFQUFFQyxlQUE4QixFQUFHO0lBRTFFO0lBQ0EsTUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQWdELENBQUMsQ0FBRTtNQUMxRUssS0FB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