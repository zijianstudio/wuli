// Copyright 2020-2022, University of Colorado Boulder

/**
 * Isolates Image handling with HTML/Canvas images, with mipmaps and general support.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Utils from '../../../dot/js/Utils.js';
import { Shape } from '../../../kite/js/imports.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import { scenery, svgns, xlinkns } from '../imports.js';
// Need to poly-fill on some browsers
const log2 = Math.log2 || function (x) {
  return Math.log(x) / Math.LN2;
};
const DEFAULT_OPTIONS = {
  imageOpacity: 1,
  initialWidth: 0,
  initialHeight: 0,
  mipmap: false,
  mipmapBias: 0,
  mipmapInitialLevel: 4,
  mipmapMaxLevel: 5,
  hitTestPixels: false
};

// Lazy scratch canvas/context (so we don't incur the startup cost of canvas/context creation)
let scratchCanvas = null;
let scratchContext = null;
const getScratchCanvas = () => {
  if (!scratchCanvas) {
    scratchCanvas = document.createElement('canvas');
  }
  return scratchCanvas;
};
const getScratchContext = () => {
  if (!scratchContext) {
    scratchContext = getScratchCanvas().getContext('2d');
  }
  return scratchContext;
};
const Imageable = type => {
  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  return class ImageableMixin extends type {
    // (scenery-internal) Internal stateful value, see setImage()

    // Internal stateful value, see setInitialWidth() for documentation.

    // Internal stateful value, see setInitialHeight() for documentation.

    // (scenery-internal) Internal stateful value, see setImageOpacity() for documentation.

    // (scenery-internal) Internal stateful value, see setMipmap() for documentation.

    // (scenery-internal) Internal stateful value, see setMipmapBias() for documentation.

    // (scenery-internal) Internal stateful value, see setMipmapInitialLevel() for documentation.

    // (scenery-internal) Internal stateful value, see setMipmapMaxLevel() for documentation

    // Internal stateful value, see setHitTestPixels() for documentation

    // Array of Canvases for each level, constructed internally so that Canvas-based drawables (Canvas, WebGL) can quickly draw mipmaps.

    // Array of URLs for each level, where each URL will display an image (and is typically a data URI or blob URI), so
    // that we can handle mipmaps in SVG where URLs are required.
    // (scenery-internal) Mipmap data if it is passed into our image. Will be stored here for processing
    // Listener for invalidating our bounds whenever an image is invalidated.
    // Whether our _imageLoadListener has been attached as a listener to the current image.
    // Used for pixel hit testing.
    // Emits when mipmaps are (re)generated
    // For compatibility
    constructor(...args) {
      super(...args);
      this._image = null;
      this._initialWidth = DEFAULT_OPTIONS.initialWidth;
      this._initialHeight = DEFAULT_OPTIONS.initialHeight;
      this._imageOpacity = DEFAULT_OPTIONS.imageOpacity;
      this._mipmap = DEFAULT_OPTIONS.mipmap;
      this._mipmapBias = DEFAULT_OPTIONS.mipmapBias;
      this._mipmapInitialLevel = DEFAULT_OPTIONS.mipmapInitialLevel;
      this._mipmapMaxLevel = DEFAULT_OPTIONS.mipmapMaxLevel;
      this._hitTestPixels = DEFAULT_OPTIONS.hitTestPixels;
      this._mipmapCanvases = [];
      this._mipmapURLs = [];
      this._mipmapData = null;
      this._imageLoadListener = this._onImageLoad.bind(this);
      this._imageLoadListenerAttached = false;
      this._hitTestImageData = null;
      this.mipmapEmitter = new TinyEmitter();
    }

    /**
     * Sets the current image to be displayed by this Image node.
     *
     * We support a few different 'image' types that can be passed in:
     *
     * HTMLImageElement - A normal HTML <img>. If it hasn't been fully loaded yet, Scenery will take care of adding a
     *   listener that will update Scenery with its width/height (and load its data) when the image is fully loaded.
     *   NOTE that if you just created the <img>, it probably isn't loaded yet, particularly in Safari. If the Image
     *   node is constructed with an <img> that hasn't fully loaded, it will have a width and height of 0, which may
     *   cause issues if you are using bounds for layout. Please see initialWidth/initialHeight notes below.
     *
     * URL - Provide a {string}, and Scenery will assume it is a URL. This can be a normal URL, or a data URI, both will
     *   work. Please note that this has the same loading-order issues as using HTMLImageElement, but that it's almost
     *   always guaranteed to not have a width/height when you create the Image node. Note that data URI support for
     *   formats depends on the browser - only JPEG and PNG are supported broadly. Please see initialWidth/initialHeight
     *   notes below.
     *   Additionally, note that if a URL is provided, accessing image.getImage() or image.image will result not in the
     *   original URL (currently), but with the automatically created HTMLImageElement.
     *   TODO: return the original input
     *
     * HTMLCanvasElement - It's possible to pass an HTML5 Canvas directly into the Image node. It will immediately be
     *   aware of the width/height (bounds) of the Canvas, but NOTE that the Image node will not listen to Canvas size
     *   changes. It is assumed that after you pass in a Canvas to an Image node that it will not be modified further.
     *   Additionally, the Image node will only be rendered using Canvas or WebGL if a Canvas is used as input.
     *
     * Mipmap data structure - Image supports a mipmap data structure that provides rasterized mipmap levels. The 'top'
     *   level (level 0) is the entire full-size image, and every other level is twice as small in every direction
     *   (~1/4 the pixels), rounding dimensions up. This is useful for browsers that display the image badly if the
     *   image is too large. Instead, Scenery will dynamically pick the most appropriate size of the image to use,
     *   which improves the image appearance.
     *   The passed in 'image' should be an Array of mipmap objects of the format:
     *   {
     *     img: {HTMLImageElement}, // preferably preloaded, but it isn't required
     *     url: {string}, // URL (usually a data URL) for the image level
     *     width: {number}, // width of the mipmap level, in pixels
     *     height: {number} // height of the mipmap level, in pixels,
     *     canvas: {HTMLCanvasElement} // Canvas element containing the image data for the img.
     *     [updateCanvas]: {function} // If available, should be called before using the Canvas directly.
     *   }
     *   At least one level is required (level 0), and each mipmap level corresponds to the index in the array, e.g.:
     *   [
     *     level 0 (full size, e.g. 100x64)
     *     level 1 (half size, e.g. 50x32)
     *     level 2 (quarter size, e.g. 25x16)
     *     level 3 (eighth size, e.g. 13x8 - note the rounding up)
     *     ...
     *     level N (single pixel, e.g. 1x1 - this is the smallest level permitted, and there should only be one)
     *   ]
     *   Additionally, note that (currently) image.getImage() will return the HTMLImageElement from the first level,
     *   not the mipmap data.
     *   TODO: return the original input
     *
     *  Also note that if the underlying image (like Canvas data) has changed, it is recommended to call
     *  invalidateImage() instead of changing the image reference (calling setImage() multiple times)
     */
    setImage(image) {
      assert && assert(image, 'image should be available');

      // Generally, if a different value for image is provided, it has changed
      let hasImageChanged = this._image !== image;

      // Except in some cases, where the provided image is a string. If our current image has the same .src as the
      // "new" image, it's basically the same (as we promote string images to HTMLImageElements).
      if (hasImageChanged && typeof image === 'string' && this._image && this._image instanceof HTMLImageElement && image === this._image.src) {
        hasImageChanged = false;
      }

      // Or if our current mipmap data is the same as the input, then we aren't changing it
      if (hasImageChanged && image === this._mipmapData) {
        hasImageChanged = false;
      }
      if (hasImageChanged) {
        // Reset the initial dimensions, since we have a new image that may have different dimensions.
        this._initialWidth = 0;
        this._initialHeight = 0;

        // Don't leak memory by referencing old images
        if (this._image && this._imageLoadListenerAttached) {
          this._detachImageLoadListener();
        }

        // clear old mipmap data references
        this._mipmapData = null;

        // Convert string => HTMLImageElement
        if (typeof image === 'string') {
          // create an image with the assumed URL
          const src = image;
          image = document.createElement('img');
          image.src = src;
        }
        // Handle the provided mipmap
        else if (Array.isArray(image)) {
          // mipmap data!
          this._mipmapData = image;
          image = image[0].img; // presumes we are already loaded

          // force initialization of mipmapping parameters, since invalidateMipmaps() is guaranteed to run below
          this._mipmapInitialLevel = this._mipmapMaxLevel = this._mipmapData.length;
          this._mipmap = true;
        }

        // We ruled out the string | Mipmap cases above
        this._image = image;

        // If our image is an HTML image that hasn't loaded yet, attach a load listener.
        if (this._image instanceof HTMLImageElement && (!this._image.width || !this._image.height)) {
          this._attachImageLoadListener();
        }

        // Try recomputing bounds (may give a 0x0 if we aren't yet loaded)
        this.invalidateImage();
      }
      return this;
    }
    set image(value) {
      this.setImage(value);
    }
    get image() {
      return this.getImage();
    }

    /**
     * Returns the current image's representation as either a Canvas or img element.
     *
     * NOTE: If a URL or mipmap data was provided, this currently doesn't return the original input to setImage(), but
     *       instead provides the mapped result (or first mipmap level's image).
     *       TODO: return the original result instead.
     */
    getImage() {
      assert && assert(this._image !== null);
      return this._image;
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
      this.invalidateMipmaps();
      this._invalidateHitTestData();
    }

    /**
     * Sets the image with additional information about dimensions used before the image has loaded.
     *
     * This is essentially the same as setImage(), but also updates the initial dimensions. See setImage()'s
     * documentation for details on the image parameter.
     *
     * NOTE: setImage() will first reset the initial dimensions to 0, which will then be overridden later in this
     *       function. This may trigger bounds changes, even if the previous and next image (and image dimensions)
     *       are the same.
     *
     * @param image - See setImage()'s documentation
     * @param width - Initial width of the image. See setInitialWidth() for more documentation
     * @param height - Initial height of the image. See setInitialHeight() for more documentation
     */
    setImageWithSize(image, width, height) {
      // First, setImage(), as it will reset the initial width and height
      this.setImage(image);

      // Then apply the initial dimensions
      this.setInitialWidth(width);
      this.setInitialHeight(height);
      return this;
    }

    /**
     * Sets an opacity that is applied only to this image (will not affect children or the rest of the node's subtree).
     *
     * This should generally be preferred over Node's opacity if it has the same result, as modifying this will be much
     * faster, and will not force additional Canvases or intermediate steps in display.
     *
     * @param imageOpacity - Should be a number between 0 (transparent) and 1 (opaque), just like normal
     *                                opacity.
     */
    setImageOpacity(imageOpacity) {
      assert && assert(isFinite(imageOpacity) && imageOpacity >= 0 && imageOpacity <= 1, `imageOpacity out of range: ${imageOpacity}`);
      if (this._imageOpacity !== imageOpacity) {
        this._imageOpacity = imageOpacity;
      }
    }
    set imageOpacity(value) {
      this.setImageOpacity(value);
    }
    get imageOpacity() {
      return this.getImageOpacity();
    }

    /**
     * Returns the opacity applied only to this image (not including children).
     *
     * See setImageOpacity() documentation for more information.
     */
    getImageOpacity() {
      return this._imageOpacity;
    }

    /**
     * Provides an initial width for an image that has not loaded yet.
     *
     * If the input image hasn't loaded yet, but the (expected) size is known, providing an initialWidth will cause the
     * Image node to have the correct bounds (width) before the pixel data has been fully loaded. A value of 0 will be
     * ignored.
     *
     * This is required for many browsers, as images can show up as a 0x0 (like Safari does for unloaded images).
     *
     * NOTE: setImage will reset this value to 0 (ignored), since it's potentially likely the new image has different
     *       dimensions than the current image.
     *
     * NOTE: If these dimensions end up being different than the actual image width/height once it has been loaded, an
     *       assertion will fail. Only the correct dimensions should be provided. If the width/height is unknown,
     *       please use the localBounds override or a transparent rectangle for taking up the (approximate) bounds.
     *
     * @param width - Expected width of the image's unloaded content
     */
    setInitialWidth(width) {
      assert && assert(width >= 0 && width % 1 === 0, 'initialWidth should be a non-negative integer');
      if (width !== this._initialWidth) {
        this._initialWidth = width;
        this.invalidateImage();
      }
      return this;
    }
    set initialWidth(value) {
      this.setInitialWidth(value);
    }
    get initialWidth() {
      return this.getInitialWidth();
    }

    /**
     * Returns the initialWidth value set from setInitialWidth().
     *
     * See setInitialWidth() for more documentation. A value of 0 is ignored.
     */
    getInitialWidth() {
      return this._initialWidth;
    }

    /**
     * Provides an initial height for an image that has not loaded yet.
     *
     * If the input image hasn't loaded yet, but the (expected) size is known, providing an initialWidth will cause the
     * Image node to have the correct bounds (height) before the pixel data has been fully loaded. A value of 0 will be
     * ignored.
     *
     * This is required for many browsers, as images can show up as a 0x0 (like Safari does for unloaded images).
     *
     * NOTE: setImage will reset this value to 0 (ignored), since it's potentially likely the new image has different
     *       dimensions than the current image.
     *
     * NOTE: If these dimensions end up being different than the actual image width/height once it has been loaded, an
     *       assertion will fail. Only the correct dimensions should be provided. If the width/height is unknown,
     *       please use the localBounds override or a transparent rectangle for taking up the (approximate) bounds.
     *
     * @param height - Expected height of the image's unloaded content
     */
    setInitialHeight(height) {
      assert && assert(height >= 0 && height % 1 === 0, 'initialHeight should be a non-negative integer');
      if (height !== this._initialHeight) {
        this._initialHeight = height;
        this.invalidateImage();
      }
      return this;
    }
    set initialHeight(value) {
      this.setInitialHeight(value);
    }
    get initialHeight() {
      return this.getInitialHeight();
    }

    /**
     * Returns the initialHeight value set from setInitialHeight().
     *
     * See setInitialHeight() for more documentation. A value of 0 is ignored.
     */
    getInitialHeight() {
      return this._initialHeight;
    }

    /**
     * Sets whether mipmapping is supported.
     *
     * This defaults to false, but is automatically set to true when a mipmap is provided to setImage(). Setting it to
     * true on non-mipmap images will trigger creation of a medium-quality mipmap that will be used.
     *
     * NOTE: This mipmap generation is slow and CPU-intensive. Providing precomputed mipmap resources to an Image node
     *       will be much faster, and of higher quality.
     *
     * @param mipmap - Whether mipmapping is supported
     */
    setMipmap(mipmap) {
      if (this._mipmap !== mipmap) {
        this._mipmap = mipmap;
        this.invalidateMipmaps();
      }
      return this;
    }
    set mipmap(value) {
      this.setMipmap(value);
    }
    get mipmap() {
      return this.isMipmap();
    }

    /**
     * Returns whether mipmapping is supported.
     *
     * See setMipmap() for more documentation.
     */
    isMipmap() {
      return this._mipmap;
    }

    /**
     * Sets how much level-of-detail is displayed for mipmapping.
     *
     * When displaying mipmapped images as output, a certain source level of the mipmap needs to be used. Using a level
     * with too much resolution can create an aliased look (but will generally be sharper). Using a level with too
     * little resolution will be blurrier (but not aliased).
     *
     * The value of the mipmap bias is added on to the computed "ideal" mipmap level, and:
     * - A negative bias will typically increase the displayed resolution
     * - A positive bias will typically decrease the displayed resolution
     *
     * This is done approximately like the following formula:
     *   mipmapLevel = Utils.roundSymmetric( computedMipmapLevel + mipmapBias )
     */
    setMipmapBias(bias) {
      if (this._mipmapBias !== bias) {
        this._mipmapBias = bias;
        this.invalidateMipmaps();
      }
      return this;
    }
    set mipmapBias(value) {
      this.setMipmapBias(value);
    }
    get mipmapBias() {
      return this.getMipmapBias();
    }

    /**
     * Returns the current mipmap bias.
     *
     * See setMipmapBias() for more documentation.
     */
    getMipmapBias() {
      return this._mipmapBias;
    }

    /**
     * The number of initial mipmap levels to compute (if Scenery generates the mipmaps by setting mipmap:true on a
     * non-mipmapped input).
     *
     * @param level - A non-negative integer representing the number of mipmap levels to precompute.
     */
    setMipmapInitialLevel(level) {
      assert && assert(level % 1 === 0 && level >= 0, 'mipmapInitialLevel should be a non-negative integer');
      if (this._mipmapInitialLevel !== level) {
        this._mipmapInitialLevel = level;
        this.invalidateMipmaps();
      }
      return this;
    }
    set mipmapInitialLevel(value) {
      this.setMipmapInitialLevel(value);
    }
    get mipmapInitialLevel() {
      return this.getMipmapInitialLevel();
    }

    /**
     * Returns the current initial mipmap level.
     *
     * See setMipmapInitialLevel() for more documentation.
     */
    getMipmapInitialLevel() {
      return this._mipmapInitialLevel;
    }

    /**
     * The maximum (lowest-resolution) level that Scenery will compute if it generates mipmaps (e.g. by setting
     * mipmap:true on a non-mipmapped input).
     *
     * The default will precompute all default levels (from mipmapInitialLevel), so that we ideally don't hit mipmap
     * generation during animation.
     *
     * @param level - A non-negative integer representing the maximum mipmap level to compute.
     */
    setMipmapMaxLevel(level) {
      assert && assert(level % 1 === 0 && level >= 0, 'mipmapMaxLevel should be a non-negative integer');
      if (this._mipmapMaxLevel !== level) {
        this._mipmapMaxLevel = level;
        this.invalidateMipmaps();
      }
      return this;
    }
    set mipmapMaxLevel(value) {
      this.setMipmapMaxLevel(value);
    }
    get mipmapMaxLevel() {
      return this.getMipmapMaxLevel();
    }

    /**
     * Returns the current maximum mipmap level.
     *
     * See setMipmapMaxLevel() for more documentation.
     */
    getMipmapMaxLevel() {
      return this._mipmapMaxLevel;
    }

    /**
     * Controls whether either any pixel in the image will be marked as contained (when false), or whether transparent
     * pixels will be counted as "not contained in the image" for hit-testing (when true).
     *
     * See https://github.com/phetsims/scenery/issues/1049 for more information.
     */
    setHitTestPixels(hitTestPixels) {
      if (this._hitTestPixels !== hitTestPixels) {
        this._hitTestPixels = hitTestPixels;
        this._invalidateHitTestData();
      }
      return this;
    }
    set hitTestPixels(value) {
      this.setHitTestPixels(value);
    }
    get hitTestPixels() {
      return this.getHitTestPixels();
    }

    /**
     * Returns whether pixels are checked for hit testing.
     *
     * See setHitTestPixels() for more documentation.
     */
    getHitTestPixels() {
      return this._hitTestPixels;
    }

    /**
     * Constructs the next available (uncomputed) mipmap level, as long as the previous level was larger than 1x1.
     */
    _constructNextMipmap() {
      const level = this._mipmapCanvases.length;
      const biggerCanvas = this._mipmapCanvases[level - 1];

      // ignore any 1x1 canvases (or smaller?!?)
      if (biggerCanvas.width * biggerCanvas.height > 2) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(biggerCanvas.width / 2);
        canvas.height = Math.ceil(biggerCanvas.height / 2);

        // sanity check
        if (canvas.width > 0 && canvas.height > 0) {
          // Draw half-scale into the smaller Canvas
          const context = canvas.getContext('2d');
          context.scale(0.5, 0.5);
          context.drawImage(biggerCanvas, 0, 0);
          this._mipmapCanvases.push(canvas);
          this._mipmapURLs.push(canvas.toDataURL());
        }
      }
    }

    /**
     * Triggers recomputation of mipmaps (as long as mipmapping is enabled)
     */
    invalidateMipmaps() {
      // Clean output arrays
      cleanArray(this._mipmapCanvases);
      cleanArray(this._mipmapURLs);
      if (this._image && this._mipmap) {
        // If we have mipmap data as an input
        if (this._mipmapData) {
          for (let k = 0; k < this._mipmapData.length; k++) {
            const url = this._mipmapData[k].url;
            this._mipmapURLs.push(url);
            const updateCanvas = this._mipmapData[k].updateCanvas;
            updateCanvas && updateCanvas();
            this._mipmapCanvases.push(this._mipmapData[k].canvas);
          }
        }
        // Otherwise, we have an image (not mipmap) as our input, so we'll need to construct mipmap levels.
        else {
          const baseCanvas = document.createElement('canvas');
          baseCanvas.width = this.getImageWidth();
          baseCanvas.height = this.getImageHeight();

          // if we are not loaded yet, just ignore
          if (baseCanvas.width && baseCanvas.height) {
            const baseContext = baseCanvas.getContext('2d');
            baseContext.drawImage(this._image, 0, 0);
            this._mipmapCanvases.push(baseCanvas);
            this._mipmapURLs.push(baseCanvas.toDataURL());
            let level = 0;
            while (++level < this._mipmapInitialLevel) {
              this._constructNextMipmap();
            }
          }
        }
      }
      this.mipmapEmitter.emit();
    }

    /**
     * Returns the desired mipmap level (0-indexed) that should be used for the particular relative transform. (scenery-internal)
     *
     * @param matrix - The relative transformation matrix of the node.
     * @param [additionalBias] - Can be provided to get per-call bias (we want some of this for Canvas output)
     */
    getMipmapLevel(matrix, additionalBias = 0) {
      assert && assert(this._mipmap, 'Assumes mipmaps can be used');

      // Handle high-dpi devices like retina with correct mipmap levels.
      const scale = Imageable.getApproximateMatrixScale(matrix) * (window.devicePixelRatio || 1);
      return this.getMipmapLevelFromScale(scale, additionalBias);
    }

    /**
     * Returns the desired mipmap level (0-indexed) that should be used for the particular scale
     */
    getMipmapLevelFromScale(scale, additionalBias = 0) {
      assert && assert(scale > 0, 'scale should be a positive number');

      // If we are shown larger than scale, ALWAYS choose the highest resolution
      if (scale >= 1) {
        return 0;
      }

      // our approximate level of detail
      let level = log2(1 / scale);

      // convert to an integer level (-0.7 is a good default)
      level = Utils.roundSymmetric(level + this._mipmapBias + additionalBias - 0.7);
      if (level < 0) {
        level = 0;
      }
      if (level > this._mipmapMaxLevel) {
        level = this._mipmapMaxLevel;
      }

      // If necessary, do lazy construction of the mipmap level
      if (this.mipmap && !this._mipmapCanvases[level]) {
        let currentLevel = this._mipmapCanvases.length - 1;
        while (++currentLevel <= level) {
          this._constructNextMipmap();
        }
        // Sanity check, since _constructNextMipmap() may have had to bail out. We had to compute some, so use the last
        return Math.min(level, this._mipmapCanvases.length - 1);
      }
      // Should already be constructed, or isn't needed
      else {
        return level;
      }
    }

    /**
     * Returns a matching Canvas element for the given level-of-detail. (scenery-internal)
     *
     * @param level - Non-negative integer representing the mipmap level
     * @returns - Matching <canvas> for the level of detail
     */
    getMipmapCanvas(level) {
      assert && assert(level >= 0 && level < this._mipmapCanvases.length && level % 1 === 0);

      // Sanity check to make sure we have copied the image data in if necessary.
      if (this._mipmapData) {
        // level may not exist (it was generated), and updateCanvas may not exist
        const updateCanvas = this._mipmapData[level] && this._mipmapData[level].updateCanvas;
        updateCanvas && updateCanvas();
      }
      return this._mipmapCanvases[level];
    }

    /**
     * Returns a matching URL string for an image for the given level-of-detail. (scenery-internal)
     *
     * @param level - Non-negative integer representing the mipmap level
     * @returns - Matching data URL for the level of detail
     */
    getMipmapURL(level) {
      assert && assert(level >= 0 && level < this._mipmapCanvases.length && level % 1 === 0);
      return this._mipmapURLs[level];
    }

    /**
     * Returns whether there are mipmap levels that have been computed. (scenery-internal)
     */
    hasMipmaps() {
      return this._mipmapCanvases.length > 0;
    }

    /**
     * Triggers recomputation of hit test data
     */
    _invalidateHitTestData() {
      // Only compute this if we are hit-testing pixels
      if (!this._hitTestPixels) {
        return;
      }
      if (this._image !== null) {
        this._hitTestImageData = Imageable.getHitTestData(this._image, this.imageWidth, this.imageHeight);
      }
    }

    /**
     * Returns the width of the displayed image (not related to how this node is transformed).
     *
     * NOTE: If the image is not loaded and an initialWidth was provided, that width will be used.
     */
    getImageWidth() {
      if (this._image === null) {
        return 0;
      }
      const detectedWidth = this._mipmapData ? this._mipmapData[0].width : ('naturalWidth' in this._image ? this._image.naturalWidth : 0) || this._image.width;
      if (detectedWidth === 0) {
        return this._initialWidth; // either 0 (default), or the overridden value
      } else {
        assert && assert(this._initialWidth === 0 || this._initialWidth === detectedWidth, 'Bad Image.initialWidth');
        return detectedWidth;
      }
    }
    get imageWidth() {
      return this.getImageWidth();
    }

    /**
     * Returns the height of the displayed image (not related to how this node is transformed).
     *
     * NOTE: If the image is not loaded and an initialHeight was provided, that height will be used.
     */
    getImageHeight() {
      if (this._image === null) {
        return 0;
      }
      const detectedHeight = this._mipmapData ? this._mipmapData[0].height : ('naturalHeight' in this._image ? this._image.naturalHeight : 0) || this._image.height;
      if (detectedHeight === 0) {
        return this._initialHeight; // either 0 (default), or the overridden value
      } else {
        assert && assert(this._initialHeight === 0 || this._initialHeight === detectedHeight, 'Bad Image.initialHeight');
        return detectedHeight;
      }
    }
    get imageHeight() {
      return this.getImageHeight();
    }

    /**
     * If our provided image is an HTMLImageElement, returns its URL (src). (scenery-internal)
     */
    getImageURL() {
      assert && assert(this._image instanceof HTMLImageElement, 'Only supported for HTML image elements');
      return this._image.src;
    }

    /**
     * Attaches our on-load listener to our current image.
     */
    _attachImageLoadListener() {
      assert && assert(!this._imageLoadListenerAttached, 'Should only be attached to one thing at a time');
      if (!this.isDisposed) {
        this._image.addEventListener('load', this._imageLoadListener);
        this._imageLoadListenerAttached = true;
      }
    }

    /**
     * Detaches our on-load listener from our current image.
     */
    _detachImageLoadListener() {
      assert && assert(this._imageLoadListenerAttached, 'Needs to be attached first to be detached.');
      this._image.removeEventListener('load', this._imageLoadListener);
      this._imageLoadListenerAttached = false;
    }

    /**
     * Called when our image has loaded (it was not yet loaded with then listener was added)
     */
    _onImageLoad() {
      assert && assert(this._imageLoadListenerAttached, 'If _onImageLoad is firing, it should be attached');
      this.invalidateImage();
      this._detachImageLoadListener();
    }

    /**
     * Disposes the path, releasing image listeners if needed (and preventing new listeners from being added).
     */
    dispose() {
      if (this._image && this._imageLoadListenerAttached) {
        this._detachImageLoadListener();
      }

      // @ts-expect-error
      super.dispose && super.dispose();
    }
  };
};

/**
 * Optionally returns an ImageData object useful for hit-testing the pixel data of an image.
 *
 * @param image
 * @param width - logical width of the image
 * @param height - logical height of the image
 */
Imageable.getHitTestData = (image, width, height) => {
  // If the image isn't loaded yet, we don't want to try loading anything
  if (!(('naturalWidth' in image ? image.naturalWidth : 0) || image.width) || !(('naturalHeight' in image ? image.naturalHeight : 0) || image.height)) {
    return null;
  }
  const canvas = getScratchCanvas();
  const context = getScratchContext();
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, width, height);
};

/**
 * Tests whether a given pixel in an ImageData is at all non-transparent.
 *
 * @param imageData
 * @param width - logical width of the image
 * @param height - logical height of the image
 * @param point
 */
Imageable.testHitTestData = (imageData, width, height, point) => {
  // For sanity, map it based on the image dimensions and image data dimensions, and carefully clamp in case things are weird.
  const x = Utils.clamp(Math.floor(point.x / width * imageData.width), 0, imageData.width - 1);
  const y = Utils.clamp(Math.floor(point.y / height * imageData.height), 0, imageData.height - 1);
  const index = 4 * (x + y * imageData.width) + 3;
  return imageData.data[index] !== 0;
};

/**
 * Turns the ImageData into a Shape showing where hit testing would succeed.
 *
 * @param imageData
 * @param width - logical width of the image
 * @param height - logical height of the image
 */
Imageable.hitTestDataToShape = (imageData, width, height) => {
  const widthScale = width / imageData.width;
  const heightScale = height / imageData.height;
  const shape = new Shape();

  // Create rows at a time, so that if we have 50 adjacent pixels "on", then we'll just make a rectangle 50-wide.
  // This lets us do the CAG faster.
  let active = false;
  let min = 0;

  // NOTE: Rows are more helpful for CAG, even though columns would have better cache behavior when accessing the
  // imageData.

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = 4 * (x + y * imageData.width) + 3;
      if (imageData.data[index] !== 0) {
        // If our last pixel was empty, and now we're "on", start our rectangle
        if (!active) {
          active = true;
          min = x;
        }
      } else if (active) {
        // Finish a rectangle once we reach an "off" pixel
        active = false;
        shape.rect(min * widthScale, y * widthScale, widthScale * (x - min), heightScale);
      }
    }
    if (active) {
      // We'll need to finish rectangles at the end of each row anyway.
      active = false;
      shape.rect(min * widthScale, y * widthScale, widthScale * (imageData.width - min), heightScale);
    }
  }
  return shape.getSimplifiedAreaShape();
};

/**
 * Creates an SVG image element with a given URL and dimensions
 *
 * @param url - The URL for the image
 * @param width - Non-negative integer for the image's width
 * @param height - Non-negative integer for the image's height
 */
Imageable.createSVGImage = (url, width, height) => {
  assert && assert(isFinite(width) && width >= 0 && width % 1 === 0, 'width should be a non-negative finite integer');
  assert && assert(isFinite(height) && height >= 0 && height % 1 === 0, 'height should be a non-negative finite integer');
  const element = document.createElementNS(svgns, 'image');
  element.setAttribute('x', '0');
  element.setAttribute('y', '0');
  element.setAttribute('width', `${width}px`);
  element.setAttribute('height', `${height}px`);
  element.setAttributeNS(xlinkns, 'xlink:href', url);
  return element;
};

/**
 * Creates an object suitable to be passed to Image as a mipmap (from a Canvas)
 */
Imageable.createFastMipmapFromCanvas = baseCanvas => {
  const mipmaps = [];
  const baseURL = baseCanvas.toDataURL();
  const baseImage = new window.Image();
  baseImage.src = baseURL;

  // base level
  mipmaps.push({
    img: baseImage,
    url: baseURL,
    width: baseCanvas.width,
    height: baseCanvas.height,
    canvas: baseCanvas
  });
  let largeCanvas = baseCanvas;
  while (largeCanvas.width >= 2 && largeCanvas.height >= 2) {
    // draw half-size
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(largeCanvas.width / 2);
    canvas.height = Math.ceil(largeCanvas.height / 2);
    const context = canvas.getContext('2d');
    context.setTransform(0.5, 0, 0, 0.5, 0, 0);
    context.drawImage(largeCanvas, 0, 0);

    // smaller level
    const mipmapLevel = {
      width: canvas.width,
      height: canvas.height,
      canvas: canvas,
      url: canvas.toDataURL(),
      img: new window.Image()
    };
    // set up the image and url
    mipmapLevel.img.src = mipmapLevel.url;
    largeCanvas = canvas;
    mipmaps.push(mipmapLevel);
  }
  return mipmaps;
};

/**
 * Returns a sense of "average" scale, which should be exact if there is no asymmetric scale/shear applied
 */
Imageable.getApproximateMatrixScale = matrix => {
  return (Math.sqrt(matrix.m00() * matrix.m00() + matrix.m10() * matrix.m10()) + Math.sqrt(matrix.m01() * matrix.m01() + matrix.m11() * matrix.m11())) / 2;
};

// {number} - We include this for additional smoothing that seems to be needed for Canvas image quality
Imageable.CANVAS_MIPMAP_BIAS_ADJUSTMENT = 0.5;

// {Object} - Initial values for most Node mutator options
Imageable.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
scenery.register('Imageable', Imageable);
export default Imageable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIlV0aWxzIiwiU2hhcGUiLCJjbGVhbkFycmF5Iiwic2NlbmVyeSIsInN2Z25zIiwieGxpbmtucyIsImxvZzIiLCJNYXRoIiwieCIsImxvZyIsIkxOMiIsIkRFRkFVTFRfT1BUSU9OUyIsImltYWdlT3BhY2l0eSIsImluaXRpYWxXaWR0aCIsImluaXRpYWxIZWlnaHQiLCJtaXBtYXAiLCJtaXBtYXBCaWFzIiwibWlwbWFwSW5pdGlhbExldmVsIiwibWlwbWFwTWF4TGV2ZWwiLCJoaXRUZXN0UGl4ZWxzIiwic2NyYXRjaENhbnZhcyIsInNjcmF0Y2hDb250ZXh0IiwiZ2V0U2NyYXRjaENhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImdldFNjcmF0Y2hDb250ZXh0IiwiZ2V0Q29udGV4dCIsIkltYWdlYWJsZSIsInR5cGUiLCJJbWFnZWFibGVNaXhpbiIsImNvbnN0cnVjdG9yIiwiYXJncyIsIl9pbWFnZSIsIl9pbml0aWFsV2lkdGgiLCJfaW5pdGlhbEhlaWdodCIsIl9pbWFnZU9wYWNpdHkiLCJfbWlwbWFwIiwiX21pcG1hcEJpYXMiLCJfbWlwbWFwSW5pdGlhbExldmVsIiwiX21pcG1hcE1heExldmVsIiwiX2hpdFRlc3RQaXhlbHMiLCJfbWlwbWFwQ2FudmFzZXMiLCJfbWlwbWFwVVJMcyIsIl9taXBtYXBEYXRhIiwiX2ltYWdlTG9hZExpc3RlbmVyIiwiX29uSW1hZ2VMb2FkIiwiYmluZCIsIl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkIiwiX2hpdFRlc3RJbWFnZURhdGEiLCJtaXBtYXBFbWl0dGVyIiwic2V0SW1hZ2UiLCJpbWFnZSIsImFzc2VydCIsImhhc0ltYWdlQ2hhbmdlZCIsIkhUTUxJbWFnZUVsZW1lbnQiLCJzcmMiLCJfZGV0YWNoSW1hZ2VMb2FkTGlzdGVuZXIiLCJBcnJheSIsImlzQXJyYXkiLCJpbWciLCJsZW5ndGgiLCJ3aWR0aCIsImhlaWdodCIsIl9hdHRhY2hJbWFnZUxvYWRMaXN0ZW5lciIsImludmFsaWRhdGVJbWFnZSIsInZhbHVlIiwiZ2V0SW1hZ2UiLCJpbnZhbGlkYXRlTWlwbWFwcyIsIl9pbnZhbGlkYXRlSGl0VGVzdERhdGEiLCJzZXRJbWFnZVdpdGhTaXplIiwic2V0SW5pdGlhbFdpZHRoIiwic2V0SW5pdGlhbEhlaWdodCIsInNldEltYWdlT3BhY2l0eSIsImlzRmluaXRlIiwiZ2V0SW1hZ2VPcGFjaXR5IiwiZ2V0SW5pdGlhbFdpZHRoIiwiZ2V0SW5pdGlhbEhlaWdodCIsInNldE1pcG1hcCIsImlzTWlwbWFwIiwic2V0TWlwbWFwQmlhcyIsImJpYXMiLCJnZXRNaXBtYXBCaWFzIiwic2V0TWlwbWFwSW5pdGlhbExldmVsIiwibGV2ZWwiLCJnZXRNaXBtYXBJbml0aWFsTGV2ZWwiLCJzZXRNaXBtYXBNYXhMZXZlbCIsImdldE1pcG1hcE1heExldmVsIiwic2V0SGl0VGVzdFBpeGVscyIsImdldEhpdFRlc3RQaXhlbHMiLCJfY29uc3RydWN0TmV4dE1pcG1hcCIsImJpZ2dlckNhbnZhcyIsImNhbnZhcyIsImNlaWwiLCJjb250ZXh0Iiwic2NhbGUiLCJkcmF3SW1hZ2UiLCJwdXNoIiwidG9EYXRhVVJMIiwiayIsInVybCIsInVwZGF0ZUNhbnZhcyIsImJhc2VDYW52YXMiLCJnZXRJbWFnZVdpZHRoIiwiZ2V0SW1hZ2VIZWlnaHQiLCJiYXNlQ29udGV4dCIsImVtaXQiLCJnZXRNaXBtYXBMZXZlbCIsIm1hdHJpeCIsImFkZGl0aW9uYWxCaWFzIiwiZ2V0QXBwcm94aW1hdGVNYXRyaXhTY2FsZSIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJnZXRNaXBtYXBMZXZlbEZyb21TY2FsZSIsInJvdW5kU3ltbWV0cmljIiwiY3VycmVudExldmVsIiwibWluIiwiZ2V0TWlwbWFwQ2FudmFzIiwiZ2V0TWlwbWFwVVJMIiwiaGFzTWlwbWFwcyIsImdldEhpdFRlc3REYXRhIiwiaW1hZ2VXaWR0aCIsImltYWdlSGVpZ2h0IiwiZGV0ZWN0ZWRXaWR0aCIsIm5hdHVyYWxXaWR0aCIsImRldGVjdGVkSGVpZ2h0IiwibmF0dXJhbEhlaWdodCIsImdldEltYWdlVVJMIiwiaXNEaXNwb3NlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZGlzcG9zZSIsImdldEltYWdlRGF0YSIsInRlc3RIaXRUZXN0RGF0YSIsImltYWdlRGF0YSIsInBvaW50IiwiY2xhbXAiLCJmbG9vciIsInkiLCJpbmRleCIsImRhdGEiLCJoaXRUZXN0RGF0YVRvU2hhcGUiLCJ3aWR0aFNjYWxlIiwiaGVpZ2h0U2NhbGUiLCJzaGFwZSIsImFjdGl2ZSIsInJlY3QiLCJnZXRTaW1wbGlmaWVkQXJlYVNoYXBlIiwiY3JlYXRlU1ZHSW1hZ2UiLCJlbGVtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwic2V0QXR0cmlidXRlIiwic2V0QXR0cmlidXRlTlMiLCJjcmVhdGVGYXN0TWlwbWFwRnJvbUNhbnZhcyIsIm1pcG1hcHMiLCJiYXNlVVJMIiwiYmFzZUltYWdlIiwiSW1hZ2UiLCJsYXJnZUNhbnZhcyIsInNldFRyYW5zZm9ybSIsIm1pcG1hcExldmVsIiwic3FydCIsIm0wMCIsIm0xMCIsIm0wMSIsIm0xMSIsIkNBTlZBU19NSVBNQVBfQklBU19BREpVU1RNRU5UIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbWFnZWFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSXNvbGF0ZXMgSW1hZ2UgaGFuZGxpbmcgd2l0aCBIVE1ML0NhbnZhcyBpbWFnZXMsIHdpdGggbWlwbWFwcyBhbmQgZ2VuZXJhbCBzdXBwb3J0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgY2xlYW5BcnJheSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvY2xlYW5BcnJheS5qcyc7XHJcbmltcG9ydCBNYXRyaXgzIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBzY2VuZXJ5LCBzdmducywgeGxpbmtucyB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5cclxuLy8gTmVlZCB0byBwb2x5LWZpbGwgb24gc29tZSBicm93c2Vyc1xyXG5jb25zdCBsb2cyID0gTWF0aC5sb2cyIHx8IGZ1bmN0aW9uKCB4OiBudW1iZXIgKSB7IHJldHVybiBNYXRoLmxvZyggeCApIC8gTWF0aC5MTjI7IH07XHJcblxyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgaW1hZ2VPcGFjaXR5OiAxLFxyXG4gIGluaXRpYWxXaWR0aDogMCxcclxuICBpbml0aWFsSGVpZ2h0OiAwLFxyXG4gIG1pcG1hcDogZmFsc2UsXHJcbiAgbWlwbWFwQmlhczogMCxcclxuICBtaXBtYXBJbml0aWFsTGV2ZWw6IDQsXHJcbiAgbWlwbWFwTWF4TGV2ZWw6IDUsXHJcbiAgaGl0VGVzdFBpeGVsczogZmFsc2VcclxufSBhcyBjb25zdDtcclxuXHJcbi8vIExhenkgc2NyYXRjaCBjYW52YXMvY29udGV4dCAoc28gd2UgZG9uJ3QgaW5jdXIgdGhlIHN0YXJ0dXAgY29zdCBvZiBjYW52YXMvY29udGV4dCBjcmVhdGlvbilcclxubGV0IHNjcmF0Y2hDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IG51bGw7XHJcbmxldCBzY3JhdGNoQ29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XHJcbmNvbnN0IGdldFNjcmF0Y2hDYW52YXMgPSAoKTogSFRNTENhbnZhc0VsZW1lbnQgPT4ge1xyXG4gIGlmICggIXNjcmF0Y2hDYW52YXMgKSB7XHJcbiAgICBzY3JhdGNoQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICB9XHJcbiAgcmV0dXJuIHNjcmF0Y2hDYW52YXM7XHJcbn07XHJcbmNvbnN0IGdldFNjcmF0Y2hDb250ZXh0ID0gKCkgPT4ge1xyXG4gIGlmICggIXNjcmF0Y2hDb250ZXh0ICkge1xyXG4gICAgc2NyYXRjaENvbnRleHQgPSBnZXRTY3JhdGNoQ2FudmFzKCkuZ2V0Q29udGV4dCggJzJkJyApITtcclxuICB9XHJcbiAgcmV0dXJuIHNjcmF0Y2hDb250ZXh0O1xyXG59O1xyXG5cclxudHlwZSBDb25zdHJ1Y3RvcjxUID0gb2JqZWN0PiA9IG5ldyAoIC4uLmFyZ3M6IEludGVudGlvbmFsQW55W10gKSA9PiBUO1xyXG5cclxuZXhwb3J0IHR5cGUgTWlwbWFwID0ge1xyXG4gIHdpZHRoOiBudW1iZXI7XHJcbiAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgdXJsOiBzdHJpbmc7XHJcbiAgY2FudmFzPzogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgaW1nPzogSFRNTEltYWdlRWxlbWVudDtcclxuICB1cGRhdGVDYW52YXM/OiAoKSA9PiB2b2lkO1xyXG59W107XHJcblxyXG5leHBvcnQgdHlwZSBJbWFnZWFibGVJbWFnZSA9IHN0cmluZyB8IEhUTUxJbWFnZUVsZW1lbnQgfCBIVE1MQ2FudmFzRWxlbWVudCB8IE1pcG1hcDtcclxuXHJcbmV4cG9ydCB0eXBlIEltYWdlYWJsZU9wdGlvbnMgPSB7XHJcbiAgaW1hZ2U/OiBJbWFnZWFibGVJbWFnZTtcclxuICBpbWFnZU9wYWNpdHk/OiBudW1iZXI7XHJcbiAgaW5pdGlhbFdpZHRoPzogbnVtYmVyO1xyXG4gIGluaXRpYWxIZWlnaHQ/OiBudW1iZXI7XHJcbiAgbWlwbWFwPzogYm9vbGVhbjtcclxuICBtaXBtYXBCaWFzPzogbnVtYmVyO1xyXG4gIG1pcG1hcEluaXRpYWxMZXZlbD86IG51bWJlcjtcclxuICBtaXBtYXBNYXhMZXZlbD86IG51bWJlcjtcclxuICBoaXRUZXN0UGl4ZWxzPzogYm9vbGVhbjtcclxufTtcclxuXHJcbmNvbnN0IEltYWdlYWJsZSA9IDxTdXBlclR5cGUgZXh0ZW5kcyBDb25zdHJ1Y3Rvcj4oIHR5cGU6IFN1cGVyVHlwZSApID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbW9kdWxlLWJvdW5kYXJ5LXR5cGVzXHJcbiAgcmV0dXJuIGNsYXNzIEltYWdlYWJsZU1peGluIGV4dGVuZHMgdHlwZSB7XHJcblxyXG4gICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIEludGVybmFsIHN0YXRlZnVsIHZhbHVlLCBzZWUgc2V0SW1hZ2UoKVxyXG4gICAgcHVibGljIF9pbWFnZTogSFRNTEltYWdlRWxlbWVudCB8IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbDtcclxuXHJcbiAgICAvLyBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldEluaXRpYWxXaWR0aCgpIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gICAgcHJpdmF0ZSBfaW5pdGlhbFdpZHRoOiBudW1iZXI7XHJcblxyXG4gICAgLy8gSW50ZXJuYWwgc3RhdGVmdWwgdmFsdWUsIHNlZSBzZXRJbml0aWFsSGVpZ2h0KCkgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgICBwcml2YXRlIF9pbml0aWFsSGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIEludGVybmFsIHN0YXRlZnVsIHZhbHVlLCBzZWUgc2V0SW1hZ2VPcGFjaXR5KCkgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgICBwdWJsaWMgX2ltYWdlT3BhY2l0eTogbnVtYmVyO1xyXG5cclxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKSBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldE1pcG1hcCgpIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gICAgcHVibGljIF9taXBtYXA6IGJvb2xlYW47XHJcblxyXG4gICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIEludGVybmFsIHN0YXRlZnVsIHZhbHVlLCBzZWUgc2V0TWlwbWFwQmlhcygpIGZvciBkb2N1bWVudGF0aW9uLlxyXG4gICAgcHVibGljIF9taXBtYXBCaWFzOiBudW1iZXI7XHJcblxyXG4gICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIEludGVybmFsIHN0YXRlZnVsIHZhbHVlLCBzZWUgc2V0TWlwbWFwSW5pdGlhbExldmVsKCkgZm9yIGRvY3VtZW50YXRpb24uXHJcbiAgICBwdWJsaWMgX21pcG1hcEluaXRpYWxMZXZlbDogbnVtYmVyO1xyXG5cclxuICAgIC8vIChzY2VuZXJ5LWludGVybmFsKSBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldE1pcG1hcE1heExldmVsKCkgZm9yIGRvY3VtZW50YXRpb25cclxuICAgIHB1YmxpYyBfbWlwbWFwTWF4TGV2ZWw6IG51bWJlcjtcclxuXHJcbiAgICAvLyBJbnRlcm5hbCBzdGF0ZWZ1bCB2YWx1ZSwgc2VlIHNldEhpdFRlc3RQaXhlbHMoKSBmb3IgZG9jdW1lbnRhdGlvblxyXG4gICAgcHJvdGVjdGVkIF9oaXRUZXN0UGl4ZWxzOiBib29sZWFuO1xyXG5cclxuICAgIC8vIEFycmF5IG9mIENhbnZhc2VzIGZvciBlYWNoIGxldmVsLCBjb25zdHJ1Y3RlZCBpbnRlcm5hbGx5IHNvIHRoYXQgQ2FudmFzLWJhc2VkIGRyYXdhYmxlcyAoQ2FudmFzLCBXZWJHTCkgY2FuIHF1aWNrbHkgZHJhdyBtaXBtYXBzLlxyXG4gICAgcHJpdmF0ZSBfbWlwbWFwQ2FudmFzZXM6IEhUTUxDYW52YXNFbGVtZW50W107XHJcblxyXG4gICAgLy8gQXJyYXkgb2YgVVJMcyBmb3IgZWFjaCBsZXZlbCwgd2hlcmUgZWFjaCBVUkwgd2lsbCBkaXNwbGF5IGFuIGltYWdlIChhbmQgaXMgdHlwaWNhbGx5IGEgZGF0YSBVUkkgb3IgYmxvYiBVUkkpLCBzb1xyXG4gICAgLy8gdGhhdCB3ZSBjYW4gaGFuZGxlIG1pcG1hcHMgaW4gU1ZHIHdoZXJlIFVSTHMgYXJlIHJlcXVpcmVkLlxyXG4gICAgcHJpdmF0ZSBfbWlwbWFwVVJMczogc3RyaW5nW107XHJcblxyXG4gICAgLy8gKHNjZW5lcnktaW50ZXJuYWwpIE1pcG1hcCBkYXRhIGlmIGl0IGlzIHBhc3NlZCBpbnRvIG91ciBpbWFnZS4gV2lsbCBiZSBzdG9yZWQgaGVyZSBmb3IgcHJvY2Vzc2luZ1xyXG4gICAgcHVibGljIF9taXBtYXBEYXRhOiBNaXBtYXAgfCBudWxsO1xyXG5cclxuICAgIC8vIExpc3RlbmVyIGZvciBpbnZhbGlkYXRpbmcgb3VyIGJvdW5kcyB3aGVuZXZlciBhbiBpbWFnZSBpcyBpbnZhbGlkYXRlZC5cclxuICAgIHByaXZhdGUgX2ltYWdlTG9hZExpc3RlbmVyOiAoKSA9PiB2b2lkO1xyXG5cclxuICAgIC8vIFdoZXRoZXIgb3VyIF9pbWFnZUxvYWRMaXN0ZW5lciBoYXMgYmVlbiBhdHRhY2hlZCBhcyBhIGxpc3RlbmVyIHRvIHRoZSBjdXJyZW50IGltYWdlLlxyXG4gICAgcHJpdmF0ZSBfaW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZDogYm9vbGVhbjtcclxuXHJcbiAgICAvLyBVc2VkIGZvciBwaXhlbCBoaXQgdGVzdGluZy5cclxuICAgIHByb3RlY3RlZCBfaGl0VGVzdEltYWdlRGF0YTogSW1hZ2VEYXRhIHwgbnVsbDtcclxuXHJcbiAgICAvLyBFbWl0cyB3aGVuIG1pcG1hcHMgYXJlIChyZSlnZW5lcmF0ZWRcclxuICAgIHB1YmxpYyBtaXBtYXBFbWl0dGVyOiBURW1pdHRlcjtcclxuXHJcbiAgICAvLyBGb3IgY29tcGF0aWJpbGl0eVxyXG4gICAgcHVibGljIGlzRGlzcG9zZWQ/OiBib29sZWFuO1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvciggLi4uYXJnczogSW50ZW50aW9uYWxBbnlbXSApIHtcclxuXHJcbiAgICAgIHN1cGVyKCAuLi5hcmdzICk7XHJcblxyXG4gICAgICB0aGlzLl9pbWFnZSA9IG51bGw7XHJcbiAgICAgIHRoaXMuX2luaXRpYWxXaWR0aCA9IERFRkFVTFRfT1BUSU9OUy5pbml0aWFsV2lkdGg7XHJcbiAgICAgIHRoaXMuX2luaXRpYWxIZWlnaHQgPSBERUZBVUxUX09QVElPTlMuaW5pdGlhbEhlaWdodDtcclxuICAgICAgdGhpcy5faW1hZ2VPcGFjaXR5ID0gREVGQVVMVF9PUFRJT05TLmltYWdlT3BhY2l0eTtcclxuICAgICAgdGhpcy5fbWlwbWFwID0gREVGQVVMVF9PUFRJT05TLm1pcG1hcDtcclxuICAgICAgdGhpcy5fbWlwbWFwQmlhcyA9IERFRkFVTFRfT1BUSU9OUy5taXBtYXBCaWFzO1xyXG4gICAgICB0aGlzLl9taXBtYXBJbml0aWFsTGV2ZWwgPSBERUZBVUxUX09QVElPTlMubWlwbWFwSW5pdGlhbExldmVsO1xyXG4gICAgICB0aGlzLl9taXBtYXBNYXhMZXZlbCA9IERFRkFVTFRfT1BUSU9OUy5taXBtYXBNYXhMZXZlbDtcclxuICAgICAgdGhpcy5faGl0VGVzdFBpeGVscyA9IERFRkFVTFRfT1BUSU9OUy5oaXRUZXN0UGl4ZWxzO1xyXG4gICAgICB0aGlzLl9taXBtYXBDYW52YXNlcyA9IFtdO1xyXG4gICAgICB0aGlzLl9taXBtYXBVUkxzID0gW107XHJcbiAgICAgIHRoaXMuX21pcG1hcERhdGEgPSBudWxsO1xyXG4gICAgICB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lciA9IHRoaXMuX29uSW1hZ2VMb2FkLmJpbmQoIHRoaXMgKTtcclxuICAgICAgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl9oaXRUZXN0SW1hZ2VEYXRhID0gbnVsbDtcclxuICAgICAgdGhpcy5taXBtYXBFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgY3VycmVudCBpbWFnZSB0byBiZSBkaXNwbGF5ZWQgYnkgdGhpcyBJbWFnZSBub2RlLlxyXG4gICAgICpcclxuICAgICAqIFdlIHN1cHBvcnQgYSBmZXcgZGlmZmVyZW50ICdpbWFnZScgdHlwZXMgdGhhdCBjYW4gYmUgcGFzc2VkIGluOlxyXG4gICAgICpcclxuICAgICAqIEhUTUxJbWFnZUVsZW1lbnQgLSBBIG5vcm1hbCBIVE1MIDxpbWc+LiBJZiBpdCBoYXNuJ3QgYmVlbiBmdWxseSBsb2FkZWQgeWV0LCBTY2VuZXJ5IHdpbGwgdGFrZSBjYXJlIG9mIGFkZGluZyBhXHJcbiAgICAgKiAgIGxpc3RlbmVyIHRoYXQgd2lsbCB1cGRhdGUgU2NlbmVyeSB3aXRoIGl0cyB3aWR0aC9oZWlnaHQgKGFuZCBsb2FkIGl0cyBkYXRhKSB3aGVuIHRoZSBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXHJcbiAgICAgKiAgIE5PVEUgdGhhdCBpZiB5b3UganVzdCBjcmVhdGVkIHRoZSA8aW1nPiwgaXQgcHJvYmFibHkgaXNuJ3QgbG9hZGVkIHlldCwgcGFydGljdWxhcmx5IGluIFNhZmFyaS4gSWYgdGhlIEltYWdlXHJcbiAgICAgKiAgIG5vZGUgaXMgY29uc3RydWN0ZWQgd2l0aCBhbiA8aW1nPiB0aGF0IGhhc24ndCBmdWxseSBsb2FkZWQsIGl0IHdpbGwgaGF2ZSBhIHdpZHRoIGFuZCBoZWlnaHQgb2YgMCwgd2hpY2ggbWF5XHJcbiAgICAgKiAgIGNhdXNlIGlzc3VlcyBpZiB5b3UgYXJlIHVzaW5nIGJvdW5kcyBmb3IgbGF5b3V0LiBQbGVhc2Ugc2VlIGluaXRpYWxXaWR0aC9pbml0aWFsSGVpZ2h0IG5vdGVzIGJlbG93LlxyXG4gICAgICpcclxuICAgICAqIFVSTCAtIFByb3ZpZGUgYSB7c3RyaW5nfSwgYW5kIFNjZW5lcnkgd2lsbCBhc3N1bWUgaXQgaXMgYSBVUkwuIFRoaXMgY2FuIGJlIGEgbm9ybWFsIFVSTCwgb3IgYSBkYXRhIFVSSSwgYm90aCB3aWxsXHJcbiAgICAgKiAgIHdvcmsuIFBsZWFzZSBub3RlIHRoYXQgdGhpcyBoYXMgdGhlIHNhbWUgbG9hZGluZy1vcmRlciBpc3N1ZXMgYXMgdXNpbmcgSFRNTEltYWdlRWxlbWVudCwgYnV0IHRoYXQgaXQncyBhbG1vc3RcclxuICAgICAqICAgYWx3YXlzIGd1YXJhbnRlZWQgdG8gbm90IGhhdmUgYSB3aWR0aC9oZWlnaHQgd2hlbiB5b3UgY3JlYXRlIHRoZSBJbWFnZSBub2RlLiBOb3RlIHRoYXQgZGF0YSBVUkkgc3VwcG9ydCBmb3JcclxuICAgICAqICAgZm9ybWF0cyBkZXBlbmRzIG9uIHRoZSBicm93c2VyIC0gb25seSBKUEVHIGFuZCBQTkcgYXJlIHN1cHBvcnRlZCBicm9hZGx5LiBQbGVhc2Ugc2VlIGluaXRpYWxXaWR0aC9pbml0aWFsSGVpZ2h0XHJcbiAgICAgKiAgIG5vdGVzIGJlbG93LlxyXG4gICAgICogICBBZGRpdGlvbmFsbHksIG5vdGUgdGhhdCBpZiBhIFVSTCBpcyBwcm92aWRlZCwgYWNjZXNzaW5nIGltYWdlLmdldEltYWdlKCkgb3IgaW1hZ2UuaW1hZ2Ugd2lsbCByZXN1bHQgbm90IGluIHRoZVxyXG4gICAgICogICBvcmlnaW5hbCBVUkwgKGN1cnJlbnRseSksIGJ1dCB3aXRoIHRoZSBhdXRvbWF0aWNhbGx5IGNyZWF0ZWQgSFRNTEltYWdlRWxlbWVudC5cclxuICAgICAqICAgVE9ETzogcmV0dXJuIHRoZSBvcmlnaW5hbCBpbnB1dFxyXG4gICAgICpcclxuICAgICAqIEhUTUxDYW52YXNFbGVtZW50IC0gSXQncyBwb3NzaWJsZSB0byBwYXNzIGFuIEhUTUw1IENhbnZhcyBkaXJlY3RseSBpbnRvIHRoZSBJbWFnZSBub2RlLiBJdCB3aWxsIGltbWVkaWF0ZWx5IGJlXHJcbiAgICAgKiAgIGF3YXJlIG9mIHRoZSB3aWR0aC9oZWlnaHQgKGJvdW5kcykgb2YgdGhlIENhbnZhcywgYnV0IE5PVEUgdGhhdCB0aGUgSW1hZ2Ugbm9kZSB3aWxsIG5vdCBsaXN0ZW4gdG8gQ2FudmFzIHNpemVcclxuICAgICAqICAgY2hhbmdlcy4gSXQgaXMgYXNzdW1lZCB0aGF0IGFmdGVyIHlvdSBwYXNzIGluIGEgQ2FudmFzIHRvIGFuIEltYWdlIG5vZGUgdGhhdCBpdCB3aWxsIG5vdCBiZSBtb2RpZmllZCBmdXJ0aGVyLlxyXG4gICAgICogICBBZGRpdGlvbmFsbHksIHRoZSBJbWFnZSBub2RlIHdpbGwgb25seSBiZSByZW5kZXJlZCB1c2luZyBDYW52YXMgb3IgV2ViR0wgaWYgYSBDYW52YXMgaXMgdXNlZCBhcyBpbnB1dC5cclxuICAgICAqXHJcbiAgICAgKiBNaXBtYXAgZGF0YSBzdHJ1Y3R1cmUgLSBJbWFnZSBzdXBwb3J0cyBhIG1pcG1hcCBkYXRhIHN0cnVjdHVyZSB0aGF0IHByb3ZpZGVzIHJhc3Rlcml6ZWQgbWlwbWFwIGxldmVscy4gVGhlICd0b3AnXHJcbiAgICAgKiAgIGxldmVsIChsZXZlbCAwKSBpcyB0aGUgZW50aXJlIGZ1bGwtc2l6ZSBpbWFnZSwgYW5kIGV2ZXJ5IG90aGVyIGxldmVsIGlzIHR3aWNlIGFzIHNtYWxsIGluIGV2ZXJ5IGRpcmVjdGlvblxyXG4gICAgICogICAofjEvNCB0aGUgcGl4ZWxzKSwgcm91bmRpbmcgZGltZW5zaW9ucyB1cC4gVGhpcyBpcyB1c2VmdWwgZm9yIGJyb3dzZXJzIHRoYXQgZGlzcGxheSB0aGUgaW1hZ2UgYmFkbHkgaWYgdGhlXHJcbiAgICAgKiAgIGltYWdlIGlzIHRvbyBsYXJnZS4gSW5zdGVhZCwgU2NlbmVyeSB3aWxsIGR5bmFtaWNhbGx5IHBpY2sgdGhlIG1vc3QgYXBwcm9wcmlhdGUgc2l6ZSBvZiB0aGUgaW1hZ2UgdG8gdXNlLFxyXG4gICAgICogICB3aGljaCBpbXByb3ZlcyB0aGUgaW1hZ2UgYXBwZWFyYW5jZS5cclxuICAgICAqICAgVGhlIHBhc3NlZCBpbiAnaW1hZ2UnIHNob3VsZCBiZSBhbiBBcnJheSBvZiBtaXBtYXAgb2JqZWN0cyBvZiB0aGUgZm9ybWF0OlxyXG4gICAgICogICB7XHJcbiAgICAgKiAgICAgaW1nOiB7SFRNTEltYWdlRWxlbWVudH0sIC8vIHByZWZlcmFibHkgcHJlbG9hZGVkLCBidXQgaXQgaXNuJ3QgcmVxdWlyZWRcclxuICAgICAqICAgICB1cmw6IHtzdHJpbmd9LCAvLyBVUkwgKHVzdWFsbHkgYSBkYXRhIFVSTCkgZm9yIHRoZSBpbWFnZSBsZXZlbFxyXG4gICAgICogICAgIHdpZHRoOiB7bnVtYmVyfSwgLy8gd2lkdGggb2YgdGhlIG1pcG1hcCBsZXZlbCwgaW4gcGl4ZWxzXHJcbiAgICAgKiAgICAgaGVpZ2h0OiB7bnVtYmVyfSAvLyBoZWlnaHQgb2YgdGhlIG1pcG1hcCBsZXZlbCwgaW4gcGl4ZWxzLFxyXG4gICAgICogICAgIGNhbnZhczoge0hUTUxDYW52YXNFbGVtZW50fSAvLyBDYW52YXMgZWxlbWVudCBjb250YWluaW5nIHRoZSBpbWFnZSBkYXRhIGZvciB0aGUgaW1nLlxyXG4gICAgICogICAgIFt1cGRhdGVDYW52YXNdOiB7ZnVuY3Rpb259IC8vIElmIGF2YWlsYWJsZSwgc2hvdWxkIGJlIGNhbGxlZCBiZWZvcmUgdXNpbmcgdGhlIENhbnZhcyBkaXJlY3RseS5cclxuICAgICAqICAgfVxyXG4gICAgICogICBBdCBsZWFzdCBvbmUgbGV2ZWwgaXMgcmVxdWlyZWQgKGxldmVsIDApLCBhbmQgZWFjaCBtaXBtYXAgbGV2ZWwgY29ycmVzcG9uZHMgdG8gdGhlIGluZGV4IGluIHRoZSBhcnJheSwgZS5nLjpcclxuICAgICAqICAgW1xyXG4gICAgICogICAgIGxldmVsIDAgKGZ1bGwgc2l6ZSwgZS5nLiAxMDB4NjQpXHJcbiAgICAgKiAgICAgbGV2ZWwgMSAoaGFsZiBzaXplLCBlLmcuIDUweDMyKVxyXG4gICAgICogICAgIGxldmVsIDIgKHF1YXJ0ZXIgc2l6ZSwgZS5nLiAyNXgxNilcclxuICAgICAqICAgICBsZXZlbCAzIChlaWdodGggc2l6ZSwgZS5nLiAxM3g4IC0gbm90ZSB0aGUgcm91bmRpbmcgdXApXHJcbiAgICAgKiAgICAgLi4uXHJcbiAgICAgKiAgICAgbGV2ZWwgTiAoc2luZ2xlIHBpeGVsLCBlLmcuIDF4MSAtIHRoaXMgaXMgdGhlIHNtYWxsZXN0IGxldmVsIHBlcm1pdHRlZCwgYW5kIHRoZXJlIHNob3VsZCBvbmx5IGJlIG9uZSlcclxuICAgICAqICAgXVxyXG4gICAgICogICBBZGRpdGlvbmFsbHksIG5vdGUgdGhhdCAoY3VycmVudGx5KSBpbWFnZS5nZXRJbWFnZSgpIHdpbGwgcmV0dXJuIHRoZSBIVE1MSW1hZ2VFbGVtZW50IGZyb20gdGhlIGZpcnN0IGxldmVsLFxyXG4gICAgICogICBub3QgdGhlIG1pcG1hcCBkYXRhLlxyXG4gICAgICogICBUT0RPOiByZXR1cm4gdGhlIG9yaWdpbmFsIGlucHV0XHJcbiAgICAgKlxyXG4gICAgICogIEFsc28gbm90ZSB0aGF0IGlmIHRoZSB1bmRlcmx5aW5nIGltYWdlIChsaWtlIENhbnZhcyBkYXRhKSBoYXMgY2hhbmdlZCwgaXQgaXMgcmVjb21tZW5kZWQgdG8gY2FsbFxyXG4gICAgICogIGludmFsaWRhdGVJbWFnZSgpIGluc3RlYWQgb2YgY2hhbmdpbmcgdGhlIGltYWdlIHJlZmVyZW5jZSAoY2FsbGluZyBzZXRJbWFnZSgpIG11bHRpcGxlIHRpbWVzKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0SW1hZ2UoIGltYWdlOiBJbWFnZWFibGVJbWFnZSApOiB0aGlzIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaW1hZ2UsICdpbWFnZSBzaG91bGQgYmUgYXZhaWxhYmxlJyApO1xyXG5cclxuICAgICAgLy8gR2VuZXJhbGx5LCBpZiBhIGRpZmZlcmVudCB2YWx1ZSBmb3IgaW1hZ2UgaXMgcHJvdmlkZWQsIGl0IGhhcyBjaGFuZ2VkXHJcbiAgICAgIGxldCBoYXNJbWFnZUNoYW5nZWQgPSB0aGlzLl9pbWFnZSAhPT0gaW1hZ2U7XHJcblxyXG4gICAgICAvLyBFeGNlcHQgaW4gc29tZSBjYXNlcywgd2hlcmUgdGhlIHByb3ZpZGVkIGltYWdlIGlzIGEgc3RyaW5nLiBJZiBvdXIgY3VycmVudCBpbWFnZSBoYXMgdGhlIHNhbWUgLnNyYyBhcyB0aGVcclxuICAgICAgLy8gXCJuZXdcIiBpbWFnZSwgaXQncyBiYXNpY2FsbHkgdGhlIHNhbWUgKGFzIHdlIHByb21vdGUgc3RyaW5nIGltYWdlcyB0byBIVE1MSW1hZ2VFbGVtZW50cykuXHJcbiAgICAgIGlmICggaGFzSW1hZ2VDaGFuZ2VkICYmIHR5cGVvZiBpbWFnZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5faW1hZ2UgJiYgdGhpcy5faW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50ICYmIGltYWdlID09PSB0aGlzLl9pbWFnZS5zcmMgKSB7XHJcbiAgICAgICAgaGFzSW1hZ2VDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9yIGlmIG91ciBjdXJyZW50IG1pcG1hcCBkYXRhIGlzIHRoZSBzYW1lIGFzIHRoZSBpbnB1dCwgdGhlbiB3ZSBhcmVuJ3QgY2hhbmdpbmcgaXRcclxuICAgICAgaWYgKCBoYXNJbWFnZUNoYW5nZWQgJiYgaW1hZ2UgPT09IHRoaXMuX21pcG1hcERhdGEgKSB7XHJcbiAgICAgICAgaGFzSW1hZ2VDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggaGFzSW1hZ2VDaGFuZ2VkICkge1xyXG4gICAgICAgIC8vIFJlc2V0IHRoZSBpbml0aWFsIGRpbWVuc2lvbnMsIHNpbmNlIHdlIGhhdmUgYSBuZXcgaW1hZ2UgdGhhdCBtYXkgaGF2ZSBkaWZmZXJlbnQgZGltZW5zaW9ucy5cclxuICAgICAgICB0aGlzLl9pbml0aWFsV2lkdGggPSAwO1xyXG4gICAgICAgIHRoaXMuX2luaXRpYWxIZWlnaHQgPSAwO1xyXG5cclxuICAgICAgICAvLyBEb24ndCBsZWFrIG1lbW9yeSBieSByZWZlcmVuY2luZyBvbGQgaW1hZ2VzXHJcbiAgICAgICAgaWYgKCB0aGlzLl9pbWFnZSAmJiB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkICkge1xyXG4gICAgICAgICAgdGhpcy5fZGV0YWNoSW1hZ2VMb2FkTGlzdGVuZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNsZWFyIG9sZCBtaXBtYXAgZGF0YSByZWZlcmVuY2VzXHJcbiAgICAgICAgdGhpcy5fbWlwbWFwRGF0YSA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgc3RyaW5nID0+IEhUTUxJbWFnZUVsZW1lbnRcclxuICAgICAgICBpZiAoIHR5cGVvZiBpbWFnZSA9PT0gJ3N0cmluZycgKSB7XHJcbiAgICAgICAgICAvLyBjcmVhdGUgYW4gaW1hZ2Ugd2l0aCB0aGUgYXNzdW1lZCBVUkxcclxuICAgICAgICAgIGNvbnN0IHNyYyA9IGltYWdlO1xyXG4gICAgICAgICAgaW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW1nJyApO1xyXG4gICAgICAgICAgaW1hZ2Uuc3JjID0gc3JjO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBIYW5kbGUgdGhlIHByb3ZpZGVkIG1pcG1hcFxyXG4gICAgICAgIGVsc2UgaWYgKCBBcnJheS5pc0FycmF5KCBpbWFnZSApICkge1xyXG4gICAgICAgICAgLy8gbWlwbWFwIGRhdGEhXHJcbiAgICAgICAgICB0aGlzLl9taXBtYXBEYXRhID0gaW1hZ2U7XHJcbiAgICAgICAgICBpbWFnZSA9IGltYWdlWyAwIF0uaW1nITsgLy8gcHJlc3VtZXMgd2UgYXJlIGFscmVhZHkgbG9hZGVkXHJcblxyXG4gICAgICAgICAgLy8gZm9yY2UgaW5pdGlhbGl6YXRpb24gb2YgbWlwbWFwcGluZyBwYXJhbWV0ZXJzLCBzaW5jZSBpbnZhbGlkYXRlTWlwbWFwcygpIGlzIGd1YXJhbnRlZWQgdG8gcnVuIGJlbG93XHJcbiAgICAgICAgICB0aGlzLl9taXBtYXBJbml0aWFsTGV2ZWwgPSB0aGlzLl9taXBtYXBNYXhMZXZlbCA9IHRoaXMuX21pcG1hcERhdGEubGVuZ3RoO1xyXG4gICAgICAgICAgdGhpcy5fbWlwbWFwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFdlIHJ1bGVkIG91dCB0aGUgc3RyaW5nIHwgTWlwbWFwIGNhc2VzIGFib3ZlXHJcbiAgICAgICAgdGhpcy5faW1hZ2UgPSBpbWFnZTtcclxuXHJcbiAgICAgICAgLy8gSWYgb3VyIGltYWdlIGlzIGFuIEhUTUwgaW1hZ2UgdGhhdCBoYXNuJ3QgbG9hZGVkIHlldCwgYXR0YWNoIGEgbG9hZCBsaXN0ZW5lci5cclxuICAgICAgICBpZiAoIHRoaXMuX2ltYWdlIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCAmJiAoICF0aGlzLl9pbWFnZS53aWR0aCB8fCAhdGhpcy5faW1hZ2UuaGVpZ2h0ICkgKSB7XHJcbiAgICAgICAgICB0aGlzLl9hdHRhY2hJbWFnZUxvYWRMaXN0ZW5lcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJ5IHJlY29tcHV0aW5nIGJvdW5kcyAobWF5IGdpdmUgYSAweDAgaWYgd2UgYXJlbid0IHlldCBsb2FkZWQpXHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlSW1hZ2UoKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGltYWdlKCB2YWx1ZTogSW1hZ2VhYmxlSW1hZ2UgKSB7IHRoaXMuc2V0SW1hZ2UoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGltYWdlKCk6IEhUTUxJbWFnZUVsZW1lbnQgfCBIVE1MQ2FudmFzRWxlbWVudCB7IHJldHVybiB0aGlzLmdldEltYWdlKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgaW1hZ2UncyByZXByZXNlbnRhdGlvbiBhcyBlaXRoZXIgYSBDYW52YXMgb3IgaW1nIGVsZW1lbnQuXHJcbiAgICAgKlxyXG4gICAgICogTk9URTogSWYgYSBVUkwgb3IgbWlwbWFwIGRhdGEgd2FzIHByb3ZpZGVkLCB0aGlzIGN1cnJlbnRseSBkb2Vzbid0IHJldHVybiB0aGUgb3JpZ2luYWwgaW5wdXQgdG8gc2V0SW1hZ2UoKSwgYnV0XHJcbiAgICAgKiAgICAgICBpbnN0ZWFkIHByb3ZpZGVzIHRoZSBtYXBwZWQgcmVzdWx0IChvciBmaXJzdCBtaXBtYXAgbGV2ZWwncyBpbWFnZSkuXHJcbiAgICAgKiAgICAgICBUT0RPOiByZXR1cm4gdGhlIG9yaWdpbmFsIHJlc3VsdCBpbnN0ZWFkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SW1hZ2UoKTogSFRNTEltYWdlRWxlbWVudCB8IEhUTUxDYW52YXNFbGVtZW50IHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5faW1hZ2UgIT09IG51bGwgKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLl9pbWFnZSE7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmlnZ2VycyByZWNvbXB1dGF0aW9uIG9mIHRoZSBpbWFnZSdzIGJvdW5kcyBhbmQgcmVmcmVzaGVzIGFueSBkaXNwbGF5cyBvdXRwdXQgb2YgdGhlIGltYWdlLlxyXG4gICAgICpcclxuICAgICAqIEdlbmVyYWxseSB0aGlzIGNhbiB0cmlnZ2VyIHJlY29tcHV0YXRpb24gb2YgbWlwbWFwcywgd2lsbCBtYXJrIGFueSBkcmF3YWJsZXMgYXMgbmVlZGluZyByZXBhaW50cywgYW5kIHdpbGxcclxuICAgICAqIGNhdXNlIGEgc3ByaXRlc2hlZXQgY2hhbmdlIGZvciBXZWJHTC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNob3VsZCBiZSBkb25lIHdoZW4gdGhlIHVuZGVybHlpbmcgaW1hZ2UgaGFzIGNoYW5nZWQgYXBwZWFyYW5jZSAodXN1YWxseSB0aGUgY2FzZSB3aXRoIGEgQ2FudmFzIGNoYW5naW5nLFxyXG4gICAgICogYnV0IHRoaXMgaXMgYWxzbyB0cmlnZ2VyZWQgYnkgb3VyIGFjdHVhbCBpbWFnZSByZWZlcmVuY2UgY2hhbmdpbmcpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaW52YWxpZGF0ZUltYWdlKCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVNaXBtYXBzKCk7XHJcbiAgICAgIHRoaXMuX2ludmFsaWRhdGVIaXRUZXN0RGF0YSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgaW1hZ2Ugd2l0aCBhZGRpdGlvbmFsIGluZm9ybWF0aW9uIGFib3V0IGRpbWVuc2lvbnMgdXNlZCBiZWZvcmUgdGhlIGltYWdlIGhhcyBsb2FkZWQuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBpcyBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyBzZXRJbWFnZSgpLCBidXQgYWxzbyB1cGRhdGVzIHRoZSBpbml0aWFsIGRpbWVuc2lvbnMuIFNlZSBzZXRJbWFnZSgpJ3NcclxuICAgICAqIGRvY3VtZW50YXRpb24gZm9yIGRldGFpbHMgb24gdGhlIGltYWdlIHBhcmFtZXRlci5cclxuICAgICAqXHJcbiAgICAgKiBOT1RFOiBzZXRJbWFnZSgpIHdpbGwgZmlyc3QgcmVzZXQgdGhlIGluaXRpYWwgZGltZW5zaW9ucyB0byAwLCB3aGljaCB3aWxsIHRoZW4gYmUgb3ZlcnJpZGRlbiBsYXRlciBpbiB0aGlzXHJcbiAgICAgKiAgICAgICBmdW5jdGlvbi4gVGhpcyBtYXkgdHJpZ2dlciBib3VuZHMgY2hhbmdlcywgZXZlbiBpZiB0aGUgcHJldmlvdXMgYW5kIG5leHQgaW1hZ2UgKGFuZCBpbWFnZSBkaW1lbnNpb25zKVxyXG4gICAgICogICAgICAgYXJlIHRoZSBzYW1lLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBpbWFnZSAtIFNlZSBzZXRJbWFnZSgpJ3MgZG9jdW1lbnRhdGlvblxyXG4gICAgICogQHBhcmFtIHdpZHRoIC0gSW5pdGlhbCB3aWR0aCBvZiB0aGUgaW1hZ2UuIFNlZSBzZXRJbml0aWFsV2lkdGgoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uXHJcbiAgICAgKiBAcGFyYW0gaGVpZ2h0IC0gSW5pdGlhbCBoZWlnaHQgb2YgdGhlIGltYWdlLiBTZWUgc2V0SW5pdGlhbEhlaWdodCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb25cclxuICAgICAqL1xyXG4gICAgcHVibGljIHNldEltYWdlV2l0aFNpemUoIGltYWdlOiBzdHJpbmcgfCBIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTENhbnZhc0VsZW1lbnQgfCBNaXBtYXAsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgICAvLyBGaXJzdCwgc2V0SW1hZ2UoKSwgYXMgaXQgd2lsbCByZXNldCB0aGUgaW5pdGlhbCB3aWR0aCBhbmQgaGVpZ2h0XHJcbiAgICAgIHRoaXMuc2V0SW1hZ2UoIGltYWdlICk7XHJcblxyXG4gICAgICAvLyBUaGVuIGFwcGx5IHRoZSBpbml0aWFsIGRpbWVuc2lvbnNcclxuICAgICAgdGhpcy5zZXRJbml0aWFsV2lkdGgoIHdpZHRoICk7XHJcbiAgICAgIHRoaXMuc2V0SW5pdGlhbEhlaWdodCggaGVpZ2h0ICk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYW4gb3BhY2l0eSB0aGF0IGlzIGFwcGxpZWQgb25seSB0byB0aGlzIGltYWdlICh3aWxsIG5vdCBhZmZlY3QgY2hpbGRyZW4gb3IgdGhlIHJlc3Qgb2YgdGhlIG5vZGUncyBzdWJ0cmVlKS5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNob3VsZCBnZW5lcmFsbHkgYmUgcHJlZmVycmVkIG92ZXIgTm9kZSdzIG9wYWNpdHkgaWYgaXQgaGFzIHRoZSBzYW1lIHJlc3VsdCwgYXMgbW9kaWZ5aW5nIHRoaXMgd2lsbCBiZSBtdWNoXHJcbiAgICAgKiBmYXN0ZXIsIGFuZCB3aWxsIG5vdCBmb3JjZSBhZGRpdGlvbmFsIENhbnZhc2VzIG9yIGludGVybWVkaWF0ZSBzdGVwcyBpbiBkaXNwbGF5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBpbWFnZU9wYWNpdHkgLSBTaG91bGQgYmUgYSBudW1iZXIgYmV0d2VlbiAwICh0cmFuc3BhcmVudCkgYW5kIDEgKG9wYXF1ZSksIGp1c3QgbGlrZSBub3JtYWxcclxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5LlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0SW1hZ2VPcGFjaXR5KCBpbWFnZU9wYWNpdHk6IG51bWJlciApOiB2b2lkIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggaXNGaW5pdGUoIGltYWdlT3BhY2l0eSApICYmIGltYWdlT3BhY2l0eSA+PSAwICYmIGltYWdlT3BhY2l0eSA8PSAxLFxyXG4gICAgICAgIGBpbWFnZU9wYWNpdHkgb3V0IG9mIHJhbmdlOiAke2ltYWdlT3BhY2l0eX1gICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2ltYWdlT3BhY2l0eSAhPT0gaW1hZ2VPcGFjaXR5ICkge1xyXG4gICAgICAgIHRoaXMuX2ltYWdlT3BhY2l0eSA9IGltYWdlT3BhY2l0eTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaW1hZ2VPcGFjaXR5KCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEltYWdlT3BhY2l0eSggdmFsdWUgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaW1hZ2VPcGFjaXR5KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEltYWdlT3BhY2l0eSgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBvcGFjaXR5IGFwcGxpZWQgb25seSB0byB0aGlzIGltYWdlIChub3QgaW5jbHVkaW5nIGNoaWxkcmVuKS5cclxuICAgICAqXHJcbiAgICAgKiBTZWUgc2V0SW1hZ2VPcGFjaXR5KCkgZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEltYWdlT3BhY2l0eSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5faW1hZ2VPcGFjaXR5O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvdmlkZXMgYW4gaW5pdGlhbCB3aWR0aCBmb3IgYW4gaW1hZ2UgdGhhdCBoYXMgbm90IGxvYWRlZCB5ZXQuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGlucHV0IGltYWdlIGhhc24ndCBsb2FkZWQgeWV0LCBidXQgdGhlIChleHBlY3RlZCkgc2l6ZSBpcyBrbm93biwgcHJvdmlkaW5nIGFuIGluaXRpYWxXaWR0aCB3aWxsIGNhdXNlIHRoZVxyXG4gICAgICogSW1hZ2Ugbm9kZSB0byBoYXZlIHRoZSBjb3JyZWN0IGJvdW5kcyAod2lkdGgpIGJlZm9yZSB0aGUgcGl4ZWwgZGF0YSBoYXMgYmVlbiBmdWxseSBsb2FkZWQuIEEgdmFsdWUgb2YgMCB3aWxsIGJlXHJcbiAgICAgKiBpZ25vcmVkLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgaXMgcmVxdWlyZWQgZm9yIG1hbnkgYnJvd3NlcnMsIGFzIGltYWdlcyBjYW4gc2hvdyB1cCBhcyBhIDB4MCAobGlrZSBTYWZhcmkgZG9lcyBmb3IgdW5sb2FkZWQgaW1hZ2VzKS5cclxuICAgICAqXHJcbiAgICAgKiBOT1RFOiBzZXRJbWFnZSB3aWxsIHJlc2V0IHRoaXMgdmFsdWUgdG8gMCAoaWdub3JlZCksIHNpbmNlIGl0J3MgcG90ZW50aWFsbHkgbGlrZWx5IHRoZSBuZXcgaW1hZ2UgaGFzIGRpZmZlcmVudFxyXG4gICAgICogICAgICAgZGltZW5zaW9ucyB0aGFuIHRoZSBjdXJyZW50IGltYWdlLlxyXG4gICAgICpcclxuICAgICAqIE5PVEU6IElmIHRoZXNlIGRpbWVuc2lvbnMgZW5kIHVwIGJlaW5nIGRpZmZlcmVudCB0aGFuIHRoZSBhY3R1YWwgaW1hZ2Ugd2lkdGgvaGVpZ2h0IG9uY2UgaXQgaGFzIGJlZW4gbG9hZGVkLCBhblxyXG4gICAgICogICAgICAgYXNzZXJ0aW9uIHdpbGwgZmFpbC4gT25seSB0aGUgY29ycmVjdCBkaW1lbnNpb25zIHNob3VsZCBiZSBwcm92aWRlZC4gSWYgdGhlIHdpZHRoL2hlaWdodCBpcyB1bmtub3duLFxyXG4gICAgICogICAgICAgcGxlYXNlIHVzZSB0aGUgbG9jYWxCb3VuZHMgb3ZlcnJpZGUgb3IgYSB0cmFuc3BhcmVudCByZWN0YW5nbGUgZm9yIHRha2luZyB1cCB0aGUgKGFwcHJveGltYXRlKSBib3VuZHMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHdpZHRoIC0gRXhwZWN0ZWQgd2lkdGggb2YgdGhlIGltYWdlJ3MgdW5sb2FkZWQgY29udGVudFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0SW5pdGlhbFdpZHRoKCB3aWR0aDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB3aWR0aCA+PSAwICYmICggd2lkdGggJSAxID09PSAwICksICdpbml0aWFsV2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXInICk7XHJcblxyXG4gICAgICBpZiAoIHdpZHRoICE9PSB0aGlzLl9pbml0aWFsV2lkdGggKSB7XHJcbiAgICAgICAgdGhpcy5faW5pdGlhbFdpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUltYWdlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaW5pdGlhbFdpZHRoKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldEluaXRpYWxXaWR0aCggdmFsdWUgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaW5pdGlhbFdpZHRoKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEluaXRpYWxXaWR0aCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBpbml0aWFsV2lkdGggdmFsdWUgc2V0IGZyb20gc2V0SW5pdGlhbFdpZHRoKCkuXHJcbiAgICAgKlxyXG4gICAgICogU2VlIHNldEluaXRpYWxXaWR0aCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uIEEgdmFsdWUgb2YgMCBpcyBpZ25vcmVkLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0SW5pdGlhbFdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsV2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm92aWRlcyBhbiBpbml0aWFsIGhlaWdodCBmb3IgYW4gaW1hZ2UgdGhhdCBoYXMgbm90IGxvYWRlZCB5ZXQuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhlIGlucHV0IGltYWdlIGhhc24ndCBsb2FkZWQgeWV0LCBidXQgdGhlIChleHBlY3RlZCkgc2l6ZSBpcyBrbm93biwgcHJvdmlkaW5nIGFuIGluaXRpYWxXaWR0aCB3aWxsIGNhdXNlIHRoZVxyXG4gICAgICogSW1hZ2Ugbm9kZSB0byBoYXZlIHRoZSBjb3JyZWN0IGJvdW5kcyAoaGVpZ2h0KSBiZWZvcmUgdGhlIHBpeGVsIGRhdGEgaGFzIGJlZW4gZnVsbHkgbG9hZGVkLiBBIHZhbHVlIG9mIDAgd2lsbCBiZVxyXG4gICAgICogaWdub3JlZC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGlzIHJlcXVpcmVkIGZvciBtYW55IGJyb3dzZXJzLCBhcyBpbWFnZXMgY2FuIHNob3cgdXAgYXMgYSAweDAgKGxpa2UgU2FmYXJpIGRvZXMgZm9yIHVubG9hZGVkIGltYWdlcykuXHJcbiAgICAgKlxyXG4gICAgICogTk9URTogc2V0SW1hZ2Ugd2lsbCByZXNldCB0aGlzIHZhbHVlIHRvIDAgKGlnbm9yZWQpLCBzaW5jZSBpdCdzIHBvdGVudGlhbGx5IGxpa2VseSB0aGUgbmV3IGltYWdlIGhhcyBkaWZmZXJlbnRcclxuICAgICAqICAgICAgIGRpbWVuc2lvbnMgdGhhbiB0aGUgY3VycmVudCBpbWFnZS5cclxuICAgICAqXHJcbiAgICAgKiBOT1RFOiBJZiB0aGVzZSBkaW1lbnNpb25zIGVuZCB1cCBiZWluZyBkaWZmZXJlbnQgdGhhbiB0aGUgYWN0dWFsIGltYWdlIHdpZHRoL2hlaWdodCBvbmNlIGl0IGhhcyBiZWVuIGxvYWRlZCwgYW5cclxuICAgICAqICAgICAgIGFzc2VydGlvbiB3aWxsIGZhaWwuIE9ubHkgdGhlIGNvcnJlY3QgZGltZW5zaW9ucyBzaG91bGQgYmUgcHJvdmlkZWQuIElmIHRoZSB3aWR0aC9oZWlnaHQgaXMgdW5rbm93bixcclxuICAgICAqICAgICAgIHBsZWFzZSB1c2UgdGhlIGxvY2FsQm91bmRzIG92ZXJyaWRlIG9yIGEgdHJhbnNwYXJlbnQgcmVjdGFuZ2xlIGZvciB0YWtpbmcgdXAgdGhlIChhcHByb3hpbWF0ZSkgYm91bmRzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBoZWlnaHQgLSBFeHBlY3RlZCBoZWlnaHQgb2YgdGhlIGltYWdlJ3MgdW5sb2FkZWQgY29udGVudFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0SW5pdGlhbEhlaWdodCggaGVpZ2h0OiBudW1iZXIgKTogdGhpcyB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGhlaWdodCA+PSAwICYmICggaGVpZ2h0ICUgMSA9PT0gMCApLCAnaW5pdGlhbEhlaWdodCBzaG91bGQgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlcicgKTtcclxuXHJcbiAgICAgIGlmICggaGVpZ2h0ICE9PSB0aGlzLl9pbml0aWFsSGVpZ2h0ICkge1xyXG4gICAgICAgIHRoaXMuX2luaXRpYWxIZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZUltYWdlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgaW5pdGlhbEhlaWdodCggdmFsdWU6IG51bWJlciApIHsgdGhpcy5zZXRJbml0aWFsSGVpZ2h0KCB2YWx1ZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBpbml0aWFsSGVpZ2h0KCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldEluaXRpYWxIZWlnaHQoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaW5pdGlhbEhlaWdodCB2YWx1ZSBzZXQgZnJvbSBzZXRJbml0aWFsSGVpZ2h0KCkuXHJcbiAgICAgKlxyXG4gICAgICogU2VlIHNldEluaXRpYWxIZWlnaHQoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLiBBIHZhbHVlIG9mIDAgaXMgaWdub3JlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEluaXRpYWxIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHdoZXRoZXIgbWlwbWFwcGluZyBpcyBzdXBwb3J0ZWQuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBkZWZhdWx0cyB0byBmYWxzZSwgYnV0IGlzIGF1dG9tYXRpY2FsbHkgc2V0IHRvIHRydWUgd2hlbiBhIG1pcG1hcCBpcyBwcm92aWRlZCB0byBzZXRJbWFnZSgpLiBTZXR0aW5nIGl0IHRvXHJcbiAgICAgKiB0cnVlIG9uIG5vbi1taXBtYXAgaW1hZ2VzIHdpbGwgdHJpZ2dlciBjcmVhdGlvbiBvZiBhIG1lZGl1bS1xdWFsaXR5IG1pcG1hcCB0aGF0IHdpbGwgYmUgdXNlZC5cclxuICAgICAqXHJcbiAgICAgKiBOT1RFOiBUaGlzIG1pcG1hcCBnZW5lcmF0aW9uIGlzIHNsb3cgYW5kIENQVS1pbnRlbnNpdmUuIFByb3ZpZGluZyBwcmVjb21wdXRlZCBtaXBtYXAgcmVzb3VyY2VzIHRvIGFuIEltYWdlIG5vZGVcclxuICAgICAqICAgICAgIHdpbGwgYmUgbXVjaCBmYXN0ZXIsIGFuZCBvZiBoaWdoZXIgcXVhbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbWlwbWFwIC0gV2hldGhlciBtaXBtYXBwaW5nIGlzIHN1cHBvcnRlZFxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWlwbWFwKCBtaXBtYXA6IGJvb2xlYW4gKTogdGhpcyB7XHJcbiAgICAgIGlmICggdGhpcy5fbWlwbWFwICE9PSBtaXBtYXAgKSB7XHJcbiAgICAgICAgdGhpcy5fbWlwbWFwID0gbWlwbWFwO1xyXG5cclxuICAgICAgICB0aGlzLmludmFsaWRhdGVNaXBtYXBzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgbWlwbWFwKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRNaXBtYXAoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1pcG1hcCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuaXNNaXBtYXAoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIG1pcG1hcHBpbmcgaXMgc3VwcG9ydGVkLlxyXG4gICAgICpcclxuICAgICAqIFNlZSBzZXRNaXBtYXAoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgaXNNaXBtYXAoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9taXBtYXA7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGhvdyBtdWNoIGxldmVsLW9mLWRldGFpbCBpcyBkaXNwbGF5ZWQgZm9yIG1pcG1hcHBpbmcuXHJcbiAgICAgKlxyXG4gICAgICogV2hlbiBkaXNwbGF5aW5nIG1pcG1hcHBlZCBpbWFnZXMgYXMgb3V0cHV0LCBhIGNlcnRhaW4gc291cmNlIGxldmVsIG9mIHRoZSBtaXBtYXAgbmVlZHMgdG8gYmUgdXNlZC4gVXNpbmcgYSBsZXZlbFxyXG4gICAgICogd2l0aCB0b28gbXVjaCByZXNvbHV0aW9uIGNhbiBjcmVhdGUgYW4gYWxpYXNlZCBsb29rIChidXQgd2lsbCBnZW5lcmFsbHkgYmUgc2hhcnBlcikuIFVzaW5nIGEgbGV2ZWwgd2l0aCB0b29cclxuICAgICAqIGxpdHRsZSByZXNvbHV0aW9uIHdpbGwgYmUgYmx1cnJpZXIgKGJ1dCBub3QgYWxpYXNlZCkuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIHZhbHVlIG9mIHRoZSBtaXBtYXAgYmlhcyBpcyBhZGRlZCBvbiB0byB0aGUgY29tcHV0ZWQgXCJpZGVhbFwiIG1pcG1hcCBsZXZlbCwgYW5kOlxyXG4gICAgICogLSBBIG5lZ2F0aXZlIGJpYXMgd2lsbCB0eXBpY2FsbHkgaW5jcmVhc2UgdGhlIGRpc3BsYXllZCByZXNvbHV0aW9uXHJcbiAgICAgKiAtIEEgcG9zaXRpdmUgYmlhcyB3aWxsIHR5cGljYWxseSBkZWNyZWFzZSB0aGUgZGlzcGxheWVkIHJlc29sdXRpb25cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGlzIGRvbmUgYXBwcm94aW1hdGVseSBsaWtlIHRoZSBmb2xsb3dpbmcgZm9ybXVsYTpcclxuICAgICAqICAgbWlwbWFwTGV2ZWwgPSBVdGlscy5yb3VuZFN5bW1ldHJpYyggY29tcHV0ZWRNaXBtYXBMZXZlbCArIG1pcG1hcEJpYXMgKVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWlwbWFwQmlhcyggYmlhczogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgICBpZiAoIHRoaXMuX21pcG1hcEJpYXMgIT09IGJpYXMgKSB7XHJcbiAgICAgICAgdGhpcy5fbWlwbWFwQmlhcyA9IGJpYXM7XHJcblxyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZU1pcG1hcHMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBtaXBtYXBCaWFzKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldE1pcG1hcEJpYXMoIHZhbHVlICk7IH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG1pcG1hcEJpYXMoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0TWlwbWFwQmlhcygpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IG1pcG1hcCBiaWFzLlxyXG4gICAgICpcclxuICAgICAqIFNlZSBzZXRNaXBtYXBCaWFzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldE1pcG1hcEJpYXMoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX21pcG1hcEJpYXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbnVtYmVyIG9mIGluaXRpYWwgbWlwbWFwIGxldmVscyB0byBjb21wdXRlIChpZiBTY2VuZXJ5IGdlbmVyYXRlcyB0aGUgbWlwbWFwcyBieSBzZXR0aW5nIG1pcG1hcDp0cnVlIG9uIGFcclxuICAgICAqIG5vbi1taXBtYXBwZWQgaW5wdXQpLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBsZXZlbCAtIEEgbm9uLW5lZ2F0aXZlIGludGVnZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgbWlwbWFwIGxldmVscyB0byBwcmVjb21wdXRlLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgc2V0TWlwbWFwSW5pdGlhbExldmVsKCBsZXZlbDogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZXZlbCAlIDEgPT09IDAgJiYgbGV2ZWwgPj0gMCxcclxuICAgICAgICAnbWlwbWFwSW5pdGlhbExldmVsIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl9taXBtYXBJbml0aWFsTGV2ZWwgIT09IGxldmVsICkge1xyXG4gICAgICAgIHRoaXMuX21pcG1hcEluaXRpYWxMZXZlbCA9IGxldmVsO1xyXG5cclxuICAgICAgICB0aGlzLmludmFsaWRhdGVNaXBtYXBzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgbWlwbWFwSW5pdGlhbExldmVsKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldE1pcG1hcEluaXRpYWxMZXZlbCggdmFsdWUgKTsgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbWlwbWFwSW5pdGlhbExldmVsKCk6IG51bWJlciB7IHJldHVybiB0aGlzLmdldE1pcG1hcEluaXRpYWxMZXZlbCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGluaXRpYWwgbWlwbWFwIGxldmVsLlxyXG4gICAgICpcclxuICAgICAqIFNlZSBzZXRNaXBtYXBJbml0aWFsTGV2ZWwoKSBmb3IgbW9yZSBkb2N1bWVudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TWlwbWFwSW5pdGlhbExldmVsKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9taXBtYXBJbml0aWFsTGV2ZWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbWF4aW11bSAobG93ZXN0LXJlc29sdXRpb24pIGxldmVsIHRoYXQgU2NlbmVyeSB3aWxsIGNvbXB1dGUgaWYgaXQgZ2VuZXJhdGVzIG1pcG1hcHMgKGUuZy4gYnkgc2V0dGluZ1xyXG4gICAgICogbWlwbWFwOnRydWUgb24gYSBub24tbWlwbWFwcGVkIGlucHV0KS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgZGVmYXVsdCB3aWxsIHByZWNvbXB1dGUgYWxsIGRlZmF1bHQgbGV2ZWxzIChmcm9tIG1pcG1hcEluaXRpYWxMZXZlbCksIHNvIHRoYXQgd2UgaWRlYWxseSBkb24ndCBoaXQgbWlwbWFwXHJcbiAgICAgKiBnZW5lcmF0aW9uIGR1cmluZyBhbmltYXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGxldmVsIC0gQSBub24tbmVnYXRpdmUgaW50ZWdlciByZXByZXNlbnRpbmcgdGhlIG1heGltdW0gbWlwbWFwIGxldmVsIHRvIGNvbXB1dGUuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRNaXBtYXBNYXhMZXZlbCggbGV2ZWw6IG51bWJlciApOiB0aGlzIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGV2ZWwgJSAxID09PSAwICYmIGxldmVsID49IDAsXHJcbiAgICAgICAgJ21pcG1hcE1heExldmVsIHNob3VsZCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyJyApO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl9taXBtYXBNYXhMZXZlbCAhPT0gbGV2ZWwgKSB7XHJcbiAgICAgICAgdGhpcy5fbWlwbWFwTWF4TGV2ZWwgPSBsZXZlbDtcclxuXHJcbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlTWlwbWFwcygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IG1pcG1hcE1heExldmVsKCB2YWx1ZTogbnVtYmVyICkgeyB0aGlzLnNldE1pcG1hcE1heExldmVsKCB2YWx1ZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBtaXBtYXBNYXhMZXZlbCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5nZXRNaXBtYXBNYXhMZXZlbCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IG1heGltdW0gbWlwbWFwIGxldmVsLlxyXG4gICAgICpcclxuICAgICAqIFNlZSBzZXRNaXBtYXBNYXhMZXZlbCgpIGZvciBtb3JlIGRvY3VtZW50YXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRNaXBtYXBNYXhMZXZlbCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5fbWlwbWFwTWF4TGV2ZWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb250cm9scyB3aGV0aGVyIGVpdGhlciBhbnkgcGl4ZWwgaW4gdGhlIGltYWdlIHdpbGwgYmUgbWFya2VkIGFzIGNvbnRhaW5lZCAod2hlbiBmYWxzZSksIG9yIHdoZXRoZXIgdHJhbnNwYXJlbnRcclxuICAgICAqIHBpeGVscyB3aWxsIGJlIGNvdW50ZWQgYXMgXCJub3QgY29udGFpbmVkIGluIHRoZSBpbWFnZVwiIGZvciBoaXQtdGVzdGluZyAod2hlbiB0cnVlKS5cclxuICAgICAqXHJcbiAgICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzEwNDkgZm9yIG1vcmUgaW5mb3JtYXRpb24uXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRIaXRUZXN0UGl4ZWxzKCBoaXRUZXN0UGl4ZWxzOiBib29sZWFuICk6IHRoaXMge1xyXG5cclxuICAgICAgaWYgKCB0aGlzLl9oaXRUZXN0UGl4ZWxzICE9PSBoaXRUZXN0UGl4ZWxzICkge1xyXG4gICAgICAgIHRoaXMuX2hpdFRlc3RQaXhlbHMgPSBoaXRUZXN0UGl4ZWxzO1xyXG5cclxuICAgICAgICB0aGlzLl9pbnZhbGlkYXRlSGl0VGVzdERhdGEoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBoaXRUZXN0UGl4ZWxzKCB2YWx1ZTogYm9vbGVhbiApIHsgdGhpcy5zZXRIaXRUZXN0UGl4ZWxzKCB2YWx1ZSApOyB9XHJcblxyXG4gICAgcHVibGljIGdldCBoaXRUZXN0UGl4ZWxzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5nZXRIaXRUZXN0UGl4ZWxzKCk7IH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciBwaXhlbHMgYXJlIGNoZWNrZWQgZm9yIGhpdCB0ZXN0aW5nLlxyXG4gICAgICpcclxuICAgICAqIFNlZSBzZXRIaXRUZXN0UGl4ZWxzKCkgZm9yIG1vcmUgZG9jdW1lbnRhdGlvbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEhpdFRlc3RQaXhlbHMoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9oaXRUZXN0UGl4ZWxzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0cyB0aGUgbmV4dCBhdmFpbGFibGUgKHVuY29tcHV0ZWQpIG1pcG1hcCBsZXZlbCwgYXMgbG9uZyBhcyB0aGUgcHJldmlvdXMgbGV2ZWwgd2FzIGxhcmdlciB0aGFuIDF4MS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfY29uc3RydWN0TmV4dE1pcG1hcCgpOiB2b2lkIHtcclxuICAgICAgY29uc3QgbGV2ZWwgPSB0aGlzLl9taXBtYXBDYW52YXNlcy5sZW5ndGg7XHJcbiAgICAgIGNvbnN0IGJpZ2dlckNhbnZhcyA9IHRoaXMuX21pcG1hcENhbnZhc2VzWyBsZXZlbCAtIDEgXTtcclxuXHJcbiAgICAgIC8vIGlnbm9yZSBhbnkgMXgxIGNhbnZhc2VzIChvciBzbWFsbGVyPyE/KVxyXG4gICAgICBpZiAoIGJpZ2dlckNhbnZhcy53aWR0aCAqIGJpZ2dlckNhbnZhcy5oZWlnaHQgPiAyICkge1xyXG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdjYW52YXMnICk7XHJcbiAgICAgICAgY2FudmFzLndpZHRoID0gTWF0aC5jZWlsKCBiaWdnZXJDYW52YXMud2lkdGggLyAyICk7XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IE1hdGguY2VpbCggYmlnZ2VyQ2FudmFzLmhlaWdodCAvIDIgKTtcclxuXHJcbiAgICAgICAgLy8gc2FuaXR5IGNoZWNrXHJcbiAgICAgICAgaWYgKCBjYW52YXMud2lkdGggPiAwICYmIGNhbnZhcy5oZWlnaHQgPiAwICkge1xyXG4gICAgICAgICAgLy8gRHJhdyBoYWxmLXNjYWxlIGludG8gdGhlIHNtYWxsZXIgQ2FudmFzXHJcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKSE7XHJcbiAgICAgICAgICBjb250ZXh0LnNjYWxlKCAwLjUsIDAuNSApO1xyXG4gICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoIGJpZ2dlckNhbnZhcywgMCwgMCApO1xyXG5cclxuICAgICAgICAgIHRoaXMuX21pcG1hcENhbnZhc2VzLnB1c2goIGNhbnZhcyApO1xyXG4gICAgICAgICAgdGhpcy5fbWlwbWFwVVJMcy5wdXNoKCBjYW52YXMudG9EYXRhVVJMKCkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRyaWdnZXJzIHJlY29tcHV0YXRpb24gb2YgbWlwbWFwcyAoYXMgbG9uZyBhcyBtaXBtYXBwaW5nIGlzIGVuYWJsZWQpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBpbnZhbGlkYXRlTWlwbWFwcygpOiB2b2lkIHtcclxuICAgICAgLy8gQ2xlYW4gb3V0cHV0IGFycmF5c1xyXG4gICAgICBjbGVhbkFycmF5KCB0aGlzLl9taXBtYXBDYW52YXNlcyApO1xyXG4gICAgICBjbGVhbkFycmF5KCB0aGlzLl9taXBtYXBVUkxzICk7XHJcblxyXG4gICAgICBpZiAoIHRoaXMuX2ltYWdlICYmIHRoaXMuX21pcG1hcCApIHtcclxuICAgICAgICAvLyBJZiB3ZSBoYXZlIG1pcG1hcCBkYXRhIGFzIGFuIGlucHV0XHJcbiAgICAgICAgaWYgKCB0aGlzLl9taXBtYXBEYXRhICkge1xyXG4gICAgICAgICAgZm9yICggbGV0IGsgPSAwOyBrIDwgdGhpcy5fbWlwbWFwRGF0YS5sZW5ndGg7IGsrKyApIHtcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gdGhpcy5fbWlwbWFwRGF0YVsgayBdLnVybDtcclxuICAgICAgICAgICAgdGhpcy5fbWlwbWFwVVJMcy5wdXNoKCB1cmwgKTtcclxuICAgICAgICAgICAgY29uc3QgdXBkYXRlQ2FudmFzID0gdGhpcy5fbWlwbWFwRGF0YVsgayBdLnVwZGF0ZUNhbnZhcztcclxuICAgICAgICAgICAgdXBkYXRlQ2FudmFzICYmIHVwZGF0ZUNhbnZhcygpO1xyXG4gICAgICAgICAgICB0aGlzLl9taXBtYXBDYW52YXNlcy5wdXNoKCB0aGlzLl9taXBtYXBEYXRhWyBrIF0uY2FudmFzISApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGhhdmUgYW4gaW1hZ2UgKG5vdCBtaXBtYXApIGFzIG91ciBpbnB1dCwgc28gd2UnbGwgbmVlZCB0byBjb25zdHJ1Y3QgbWlwbWFwIGxldmVscy5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGJhc2VDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgICAgICAgYmFzZUNhbnZhcy53aWR0aCA9IHRoaXMuZ2V0SW1hZ2VXaWR0aCgpO1xyXG4gICAgICAgICAgYmFzZUNhbnZhcy5oZWlnaHQgPSB0aGlzLmdldEltYWdlSGVpZ2h0KCk7XHJcblxyXG4gICAgICAgICAgLy8gaWYgd2UgYXJlIG5vdCBsb2FkZWQgeWV0LCBqdXN0IGlnbm9yZVxyXG4gICAgICAgICAgaWYgKCBiYXNlQ2FudmFzLndpZHRoICYmIGJhc2VDYW52YXMuaGVpZ2h0ICkge1xyXG4gICAgICAgICAgICBjb25zdCBiYXNlQ29udGV4dCA9IGJhc2VDYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuICAgICAgICAgICAgYmFzZUNvbnRleHQuZHJhd0ltYWdlKCB0aGlzLl9pbWFnZSwgMCwgMCApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5fbWlwbWFwQ2FudmFzZXMucHVzaCggYmFzZUNhbnZhcyApO1xyXG4gICAgICAgICAgICB0aGlzLl9taXBtYXBVUkxzLnB1c2goIGJhc2VDYW52YXMudG9EYXRhVVJMKCkgKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBsZXZlbCA9IDA7XHJcbiAgICAgICAgICAgIHdoaWxlICggKytsZXZlbCA8IHRoaXMuX21pcG1hcEluaXRpYWxMZXZlbCApIHtcclxuICAgICAgICAgICAgICB0aGlzLl9jb25zdHJ1Y3ROZXh0TWlwbWFwKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMubWlwbWFwRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBkZXNpcmVkIG1pcG1hcCBsZXZlbCAoMC1pbmRleGVkKSB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciB0aGUgcGFydGljdWxhciByZWxhdGl2ZSB0cmFuc2Zvcm0uIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBtYXRyaXggLSBUaGUgcmVsYXRpdmUgdHJhbnNmb3JtYXRpb24gbWF0cml4IG9mIHRoZSBub2RlLlxyXG4gICAgICogQHBhcmFtIFthZGRpdGlvbmFsQmlhc10gLSBDYW4gYmUgcHJvdmlkZWQgdG8gZ2V0IHBlci1jYWxsIGJpYXMgKHdlIHdhbnQgc29tZSBvZiB0aGlzIGZvciBDYW52YXMgb3V0cHV0KVxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0TWlwbWFwTGV2ZWwoIG1hdHJpeDogTWF0cml4MywgYWRkaXRpb25hbEJpYXMgPSAwICk6IG51bWJlciB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuX21pcG1hcCwgJ0Fzc3VtZXMgbWlwbWFwcyBjYW4gYmUgdXNlZCcgKTtcclxuXHJcbiAgICAgIC8vIEhhbmRsZSBoaWdoLWRwaSBkZXZpY2VzIGxpa2UgcmV0aW5hIHdpdGggY29ycmVjdCBtaXBtYXAgbGV2ZWxzLlxyXG4gICAgICBjb25zdCBzY2FsZSA9IEltYWdlYWJsZS5nZXRBcHByb3hpbWF0ZU1hdHJpeFNjYWxlKCBtYXRyaXggKSAqICggd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSApO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuZ2V0TWlwbWFwTGV2ZWxGcm9tU2NhbGUoIHNjYWxlLCBhZGRpdGlvbmFsQmlhcyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZGVzaXJlZCBtaXBtYXAgbGV2ZWwgKDAtaW5kZXhlZCkgdGhhdCBzaG91bGQgYmUgdXNlZCBmb3IgdGhlIHBhcnRpY3VsYXIgc2NhbGVcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldE1pcG1hcExldmVsRnJvbVNjYWxlKCBzY2FsZTogbnVtYmVyLCBhZGRpdGlvbmFsQmlhcyA9IDAgKTogbnVtYmVyIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2NhbGUgPiAwLCAnc2NhbGUgc2hvdWxkIGJlIGEgcG9zaXRpdmUgbnVtYmVyJyApO1xyXG5cclxuICAgICAgLy8gSWYgd2UgYXJlIHNob3duIGxhcmdlciB0aGFuIHNjYWxlLCBBTFdBWVMgY2hvb3NlIHRoZSBoaWdoZXN0IHJlc29sdXRpb25cclxuICAgICAgaWYgKCBzY2FsZSA+PSAxICkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBvdXIgYXBwcm94aW1hdGUgbGV2ZWwgb2YgZGV0YWlsXHJcbiAgICAgIGxldCBsZXZlbCA9IGxvZzIoIDEgLyBzY2FsZSApO1xyXG5cclxuICAgICAgLy8gY29udmVydCB0byBhbiBpbnRlZ2VyIGxldmVsICgtMC43IGlzIGEgZ29vZCBkZWZhdWx0KVxyXG4gICAgICBsZXZlbCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBsZXZlbCArIHRoaXMuX21pcG1hcEJpYXMgKyBhZGRpdGlvbmFsQmlhcyAtIDAuNyApO1xyXG5cclxuICAgICAgaWYgKCBsZXZlbCA8IDAgKSB7XHJcbiAgICAgICAgbGV2ZWwgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbGV2ZWwgPiB0aGlzLl9taXBtYXBNYXhMZXZlbCApIHtcclxuICAgICAgICBsZXZlbCA9IHRoaXMuX21pcG1hcE1heExldmVsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiBuZWNlc3NhcnksIGRvIGxhenkgY29uc3RydWN0aW9uIG9mIHRoZSBtaXBtYXAgbGV2ZWxcclxuICAgICAgaWYgKCB0aGlzLm1pcG1hcCAmJiAhdGhpcy5fbWlwbWFwQ2FudmFzZXNbIGxldmVsIF0gKSB7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRMZXZlbCA9IHRoaXMuX21pcG1hcENhbnZhc2VzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgd2hpbGUgKCArK2N1cnJlbnRMZXZlbCA8PSBsZXZlbCApIHtcclxuICAgICAgICAgIHRoaXMuX2NvbnN0cnVjdE5leHRNaXBtYXAoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gU2FuaXR5IGNoZWNrLCBzaW5jZSBfY29uc3RydWN0TmV4dE1pcG1hcCgpIG1heSBoYXZlIGhhZCB0byBiYWlsIG91dC4gV2UgaGFkIHRvIGNvbXB1dGUgc29tZSwgc28gdXNlIHRoZSBsYXN0XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKCBsZXZlbCwgdGhpcy5fbWlwbWFwQ2FudmFzZXMubGVuZ3RoIC0gMSApO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFNob3VsZCBhbHJlYWR5IGJlIGNvbnN0cnVjdGVkLCBvciBpc24ndCBuZWVkZWRcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGxldmVsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgbWF0Y2hpbmcgQ2FudmFzIGVsZW1lbnQgZm9yIHRoZSBnaXZlbiBsZXZlbC1vZi1kZXRhaWwuIChzY2VuZXJ5LWludGVybmFsKVxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBsZXZlbCAtIE5vbi1uZWdhdGl2ZSBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgbWlwbWFwIGxldmVsXHJcbiAgICAgKiBAcmV0dXJucyAtIE1hdGNoaW5nIDxjYW52YXM+IGZvciB0aGUgbGV2ZWwgb2YgZGV0YWlsXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRNaXBtYXBDYW52YXMoIGxldmVsOiBudW1iZXIgKTogSFRNTENhbnZhc0VsZW1lbnQge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZXZlbCA+PSAwICYmXHJcbiAgICAgIGxldmVsIDwgdGhpcy5fbWlwbWFwQ2FudmFzZXMubGVuZ3RoICYmXHJcbiAgICAgICggbGV2ZWwgJSAxICkgPT09IDAgKTtcclxuXHJcbiAgICAgIC8vIFNhbml0eSBjaGVjayB0byBtYWtlIHN1cmUgd2UgaGF2ZSBjb3BpZWQgdGhlIGltYWdlIGRhdGEgaW4gaWYgbmVjZXNzYXJ5LlxyXG4gICAgICBpZiAoIHRoaXMuX21pcG1hcERhdGEgKSB7XHJcbiAgICAgICAgLy8gbGV2ZWwgbWF5IG5vdCBleGlzdCAoaXQgd2FzIGdlbmVyYXRlZCksIGFuZCB1cGRhdGVDYW52YXMgbWF5IG5vdCBleGlzdFxyXG4gICAgICAgIGNvbnN0IHVwZGF0ZUNhbnZhcyA9IHRoaXMuX21pcG1hcERhdGFbIGxldmVsIF0gJiYgdGhpcy5fbWlwbWFwRGF0YVsgbGV2ZWwgXS51cGRhdGVDYW52YXM7XHJcbiAgICAgICAgdXBkYXRlQ2FudmFzICYmIHVwZGF0ZUNhbnZhcygpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0aGlzLl9taXBtYXBDYW52YXNlc1sgbGV2ZWwgXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBtYXRjaGluZyBVUkwgc3RyaW5nIGZvciBhbiBpbWFnZSBmb3IgdGhlIGdpdmVuIGxldmVsLW9mLWRldGFpbC4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGxldmVsIC0gTm9uLW5lZ2F0aXZlIGludGVnZXIgcmVwcmVzZW50aW5nIHRoZSBtaXBtYXAgbGV2ZWxcclxuICAgICAqIEByZXR1cm5zIC0gTWF0Y2hpbmcgZGF0YSBVUkwgZm9yIHRoZSBsZXZlbCBvZiBkZXRhaWxcclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldE1pcG1hcFVSTCggbGV2ZWw6IG51bWJlciApOiBzdHJpbmcge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBsZXZlbCA+PSAwICYmXHJcbiAgICAgIGxldmVsIDwgdGhpcy5fbWlwbWFwQ2FudmFzZXMubGVuZ3RoICYmXHJcbiAgICAgICggbGV2ZWwgJSAxICkgPT09IDAgKTtcclxuXHJcbiAgICAgIHJldHVybiB0aGlzLl9taXBtYXBVUkxzWyBsZXZlbCBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB3aGV0aGVyIHRoZXJlIGFyZSBtaXBtYXAgbGV2ZWxzIHRoYXQgaGF2ZSBiZWVuIGNvbXB1dGVkLiAoc2NlbmVyeS1pbnRlcm5hbClcclxuICAgICAqL1xyXG4gICAgcHVibGljIGhhc01pcG1hcHMoKTogYm9vbGVhbiB7XHJcbiAgICAgIHJldHVybiB0aGlzLl9taXBtYXBDYW52YXNlcy5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJpZ2dlcnMgcmVjb21wdXRhdGlvbiBvZiBoaXQgdGVzdCBkYXRhXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2ludmFsaWRhdGVIaXRUZXN0RGF0YSgpOiB2b2lkIHtcclxuICAgICAgLy8gT25seSBjb21wdXRlIHRoaXMgaWYgd2UgYXJlIGhpdC10ZXN0aW5nIHBpeGVsc1xyXG4gICAgICBpZiAoICF0aGlzLl9oaXRUZXN0UGl4ZWxzICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCB0aGlzLl9pbWFnZSAhPT0gbnVsbCApIHtcclxuICAgICAgICB0aGlzLl9oaXRUZXN0SW1hZ2VEYXRhID0gSW1hZ2VhYmxlLmdldEhpdFRlc3REYXRhKCB0aGlzLl9pbWFnZSwgdGhpcy5pbWFnZVdpZHRoLCB0aGlzLmltYWdlSGVpZ2h0ICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBkaXNwbGF5ZWQgaW1hZ2UgKG5vdCByZWxhdGVkIHRvIGhvdyB0aGlzIG5vZGUgaXMgdHJhbnNmb3JtZWQpLlxyXG4gICAgICpcclxuICAgICAqIE5PVEU6IElmIHRoZSBpbWFnZSBpcyBub3QgbG9hZGVkIGFuZCBhbiBpbml0aWFsV2lkdGggd2FzIHByb3ZpZGVkLCB0aGF0IHdpZHRoIHdpbGwgYmUgdXNlZC5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldEltYWdlV2lkdGgoKTogbnVtYmVyIHtcclxuICAgICAgaWYgKCB0aGlzLl9pbWFnZSA9PT0gbnVsbCApIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZGV0ZWN0ZWRXaWR0aCA9IHRoaXMuX21pcG1hcERhdGEgPyB0aGlzLl9taXBtYXBEYXRhWyAwIF0ud2lkdGggOiAoICggJ25hdHVyYWxXaWR0aCcgaW4gdGhpcy5faW1hZ2UgPyB0aGlzLl9pbWFnZS5uYXR1cmFsV2lkdGggOiAwICkgfHwgdGhpcy5faW1hZ2Uud2lkdGggKTtcclxuICAgICAgaWYgKCBkZXRlY3RlZFdpZHRoID09PSAwICkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbml0aWFsV2lkdGg7IC8vIGVpdGhlciAwIChkZWZhdWx0KSwgb3IgdGhlIG92ZXJyaWRkZW4gdmFsdWVcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbml0aWFsV2lkdGggPT09IDAgfHwgdGhpcy5faW5pdGlhbFdpZHRoID09PSBkZXRlY3RlZFdpZHRoLCAnQmFkIEltYWdlLmluaXRpYWxXaWR0aCcgKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRldGVjdGVkV2lkdGg7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGltYWdlV2lkdGgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0SW1hZ2VXaWR0aCgpOyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIGRpc3BsYXllZCBpbWFnZSAobm90IHJlbGF0ZWQgdG8gaG93IHRoaXMgbm9kZSBpcyB0cmFuc2Zvcm1lZCkuXHJcbiAgICAgKlxyXG4gICAgICogTk9URTogSWYgdGhlIGltYWdlIGlzIG5vdCBsb2FkZWQgYW5kIGFuIGluaXRpYWxIZWlnaHQgd2FzIHByb3ZpZGVkLCB0aGF0IGhlaWdodCB3aWxsIGJlIHVzZWQuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRJbWFnZUhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICBpZiAoIHRoaXMuX2ltYWdlID09PSBudWxsICkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkZXRlY3RlZEhlaWdodCA9IHRoaXMuX21pcG1hcERhdGEgPyB0aGlzLl9taXBtYXBEYXRhWyAwIF0uaGVpZ2h0IDogKCAoICduYXR1cmFsSGVpZ2h0JyBpbiB0aGlzLl9pbWFnZSA/IHRoaXMuX2ltYWdlLm5hdHVyYWxIZWlnaHQgOiAwICkgfHwgdGhpcy5faW1hZ2UuaGVpZ2h0ICk7XHJcbiAgICAgIGlmICggZGV0ZWN0ZWRIZWlnaHQgPT09IDAgKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2luaXRpYWxIZWlnaHQ7IC8vIGVpdGhlciAwIChkZWZhdWx0KSwgb3IgdGhlIG92ZXJyaWRkZW4gdmFsdWVcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbml0aWFsSGVpZ2h0ID09PSAwIHx8IHRoaXMuX2luaXRpYWxIZWlnaHQgPT09IGRldGVjdGVkSGVpZ2h0LCAnQmFkIEltYWdlLmluaXRpYWxIZWlnaHQnICk7XHJcblxyXG4gICAgICAgIHJldHVybiBkZXRlY3RlZEhlaWdodDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgaW1hZ2VIZWlnaHQoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuZ2V0SW1hZ2VIZWlnaHQoKTsgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSWYgb3VyIHByb3ZpZGVkIGltYWdlIGlzIGFuIEhUTUxJbWFnZUVsZW1lbnQsIHJldHVybnMgaXRzIFVSTCAoc3JjKS4gKHNjZW5lcnktaW50ZXJuYWwpXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRJbWFnZVVSTCgpOiBzdHJpbmcge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbWFnZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQsICdPbmx5IHN1cHBvcnRlZCBmb3IgSFRNTCBpbWFnZSBlbGVtZW50cycgKTtcclxuXHJcbiAgICAgIHJldHVybiAoIHRoaXMuX2ltYWdlIGFzIEhUTUxJbWFnZUVsZW1lbnQgKS5zcmM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBvdXIgb24tbG9hZCBsaXN0ZW5lciB0byBvdXIgY3VycmVudCBpbWFnZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBfYXR0YWNoSW1hZ2VMb2FkTGlzdGVuZXIoKTogdm9pZCB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkLCAnU2hvdWxkIG9ubHkgYmUgYXR0YWNoZWQgdG8gb25lIHRoaW5nIGF0IGEgdGltZScgKTtcclxuXHJcbiAgICAgIGlmICggIXRoaXMuaXNEaXNwb3NlZCApIHtcclxuICAgICAgICAoIHRoaXMuX2ltYWdlIGFzIEhUTUxJbWFnZUVsZW1lbnQgKS5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMuX2ltYWdlTG9hZExpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGFjaGVzIG91ciBvbi1sb2FkIGxpc3RlbmVyIGZyb20gb3VyIGN1cnJlbnQgaW1hZ2UuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX2RldGFjaEltYWdlTG9hZExpc3RlbmVyKCk6IHZvaWQge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkLCAnTmVlZHMgdG8gYmUgYXR0YWNoZWQgZmlyc3QgdG8gYmUgZGV0YWNoZWQuJyApO1xyXG5cclxuICAgICAgKCB0aGlzLl9pbWFnZSBhcyBIVE1MSW1hZ2VFbGVtZW50ICkucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lciApO1xyXG4gICAgICB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsZWQgd2hlbiBvdXIgaW1hZ2UgaGFzIGxvYWRlZCAoaXQgd2FzIG5vdCB5ZXQgbG9hZGVkIHdpdGggdGhlbiBsaXN0ZW5lciB3YXMgYWRkZWQpXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgX29uSW1hZ2VMb2FkKCk6IHZvaWQge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLl9pbWFnZUxvYWRMaXN0ZW5lckF0dGFjaGVkLCAnSWYgX29uSW1hZ2VMb2FkIGlzIGZpcmluZywgaXQgc2hvdWxkIGJlIGF0dGFjaGVkJyApO1xyXG5cclxuICAgICAgdGhpcy5pbnZhbGlkYXRlSW1hZ2UoKTtcclxuICAgICAgdGhpcy5fZGV0YWNoSW1hZ2VMb2FkTGlzdGVuZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3Bvc2VzIHRoZSBwYXRoLCByZWxlYXNpbmcgaW1hZ2UgbGlzdGVuZXJzIGlmIG5lZWRlZCAoYW5kIHByZXZlbnRpbmcgbmV3IGxpc3RlbmVycyBmcm9tIGJlaW5nIGFkZGVkKS5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICAgIGlmICggdGhpcy5faW1hZ2UgJiYgdGhpcy5faW1hZ2VMb2FkTGlzdGVuZXJBdHRhY2hlZCApIHtcclxuICAgICAgICB0aGlzLl9kZXRhY2hJbWFnZUxvYWRMaXN0ZW5lcigpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgIHN1cGVyLmRpc3Bvc2UgJiYgc3VwZXIuZGlzcG9zZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcbn07XHJcblxyXG4vKipcclxuICogT3B0aW9uYWxseSByZXR1cm5zIGFuIEltYWdlRGF0YSBvYmplY3QgdXNlZnVsIGZvciBoaXQtdGVzdGluZyB0aGUgcGl4ZWwgZGF0YSBvZiBhbiBpbWFnZS5cclxuICpcclxuICogQHBhcmFtIGltYWdlXHJcbiAqIEBwYXJhbSB3aWR0aCAtIGxvZ2ljYWwgd2lkdGggb2YgdGhlIGltYWdlXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBsb2dpY2FsIGhlaWdodCBvZiB0aGUgaW1hZ2VcclxuICovXHJcbkltYWdlYWJsZS5nZXRIaXRUZXN0RGF0YSA9ICggaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQgfCBIVE1MQ2FudmFzRWxlbWVudCwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogSW1hZ2VEYXRhIHwgbnVsbCA9PiB7XHJcbiAgLy8gSWYgdGhlIGltYWdlIGlzbid0IGxvYWRlZCB5ZXQsIHdlIGRvbid0IHdhbnQgdG8gdHJ5IGxvYWRpbmcgYW55dGhpbmdcclxuICBpZiAoICEoICggJ25hdHVyYWxXaWR0aCcgaW4gaW1hZ2UgPyBpbWFnZS5uYXR1cmFsV2lkdGggOiAwICkgfHwgaW1hZ2Uud2lkdGggKSB8fCAhKCAoICduYXR1cmFsSGVpZ2h0JyBpbiBpbWFnZSA/IGltYWdlLm5hdHVyYWxIZWlnaHQgOiAwICkgfHwgaW1hZ2UuaGVpZ2h0ICkgKSB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIGNvbnN0IGNhbnZhcyA9IGdldFNjcmF0Y2hDYW52YXMoKTtcclxuICBjb25zdCBjb250ZXh0ID0gZ2V0U2NyYXRjaENvbnRleHQoKTtcclxuXHJcbiAgY2FudmFzLndpZHRoID0gd2lkdGg7XHJcbiAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICBjb250ZXh0LmRyYXdJbWFnZSggaW1hZ2UsIDAsIDAgKTtcclxuXHJcbiAgcmV0dXJuIGNvbnRleHQuZ2V0SW1hZ2VEYXRhKCAwLCAwLCB3aWR0aCwgaGVpZ2h0ICk7XHJcbn07XHJcblxyXG4vKipcclxuICogVGVzdHMgd2hldGhlciBhIGdpdmVuIHBpeGVsIGluIGFuIEltYWdlRGF0YSBpcyBhdCBhbGwgbm9uLXRyYW5zcGFyZW50LlxyXG4gKlxyXG4gKiBAcGFyYW0gaW1hZ2VEYXRhXHJcbiAqIEBwYXJhbSB3aWR0aCAtIGxvZ2ljYWwgd2lkdGggb2YgdGhlIGltYWdlXHJcbiAqIEBwYXJhbSBoZWlnaHQgLSBsb2dpY2FsIGhlaWdodCBvZiB0aGUgaW1hZ2VcclxuICogQHBhcmFtIHBvaW50XHJcbiAqL1xyXG5JbWFnZWFibGUudGVzdEhpdFRlc3REYXRhID0gKCBpbWFnZURhdGE6IEltYWdlRGF0YSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4gPT4ge1xyXG4gIC8vIEZvciBzYW5pdHksIG1hcCBpdCBiYXNlZCBvbiB0aGUgaW1hZ2UgZGltZW5zaW9ucyBhbmQgaW1hZ2UgZGF0YSBkaW1lbnNpb25zLCBhbmQgY2FyZWZ1bGx5IGNsYW1wIGluIGNhc2UgdGhpbmdzIGFyZSB3ZWlyZC5cclxuICBjb25zdCB4ID0gVXRpbHMuY2xhbXAoIE1hdGguZmxvb3IoICggcG9pbnQueCAvIHdpZHRoICkgKiBpbWFnZURhdGEud2lkdGggKSwgMCwgaW1hZ2VEYXRhLndpZHRoIC0gMSApO1xyXG4gIGNvbnN0IHkgPSBVdGlscy5jbGFtcCggTWF0aC5mbG9vciggKCBwb2ludC55IC8gaGVpZ2h0ICkgKiBpbWFnZURhdGEuaGVpZ2h0ICksIDAsIGltYWdlRGF0YS5oZWlnaHQgLSAxICk7XHJcblxyXG4gIGNvbnN0IGluZGV4ID0gNCAqICggeCArIHkgKiBpbWFnZURhdGEud2lkdGggKSArIDM7XHJcblxyXG4gIHJldHVybiBpbWFnZURhdGEuZGF0YVsgaW5kZXggXSAhPT0gMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBUdXJucyB0aGUgSW1hZ2VEYXRhIGludG8gYSBTaGFwZSBzaG93aW5nIHdoZXJlIGhpdCB0ZXN0aW5nIHdvdWxkIHN1Y2NlZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSBpbWFnZURhdGFcclxuICogQHBhcmFtIHdpZHRoIC0gbG9naWNhbCB3aWR0aCBvZiB0aGUgaW1hZ2VcclxuICogQHBhcmFtIGhlaWdodCAtIGxvZ2ljYWwgaGVpZ2h0IG9mIHRoZSBpbWFnZVxyXG4gKi9cclxuSW1hZ2VhYmxlLmhpdFRlc3REYXRhVG9TaGFwZSA9ICggaW1hZ2VEYXRhOiBJbWFnZURhdGEsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyICk6IFNoYXBlID0+IHtcclxuICBjb25zdCB3aWR0aFNjYWxlID0gd2lkdGggLyBpbWFnZURhdGEud2lkdGg7XHJcbiAgY29uc3QgaGVpZ2h0U2NhbGUgPSBoZWlnaHQgLyBpbWFnZURhdGEuaGVpZ2h0O1xyXG5cclxuICBjb25zdCBzaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG5cclxuICAvLyBDcmVhdGUgcm93cyBhdCBhIHRpbWUsIHNvIHRoYXQgaWYgd2UgaGF2ZSA1MCBhZGphY2VudCBwaXhlbHMgXCJvblwiLCB0aGVuIHdlJ2xsIGp1c3QgbWFrZSBhIHJlY3RhbmdsZSA1MC13aWRlLlxyXG4gIC8vIFRoaXMgbGV0cyB1cyBkbyB0aGUgQ0FHIGZhc3Rlci5cclxuICBsZXQgYWN0aXZlID0gZmFsc2U7XHJcbiAgbGV0IG1pbiA9IDA7XHJcblxyXG4gIC8vIE5PVEU6IFJvd3MgYXJlIG1vcmUgaGVscGZ1bCBmb3IgQ0FHLCBldmVuIHRob3VnaCBjb2x1bW5zIHdvdWxkIGhhdmUgYmV0dGVyIGNhY2hlIGJlaGF2aW9yIHdoZW4gYWNjZXNzaW5nIHRoZVxyXG4gIC8vIGltYWdlRGF0YS5cclxuXHJcbiAgZm9yICggbGV0IHkgPSAwOyB5IDwgaW1hZ2VEYXRhLmhlaWdodDsgeSsrICkge1xyXG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgaW1hZ2VEYXRhLndpZHRoOyB4KysgKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gNCAqICggeCArIHkgKiBpbWFnZURhdGEud2lkdGggKSArIDM7XHJcblxyXG4gICAgICBpZiAoIGltYWdlRGF0YS5kYXRhWyBpbmRleCBdICE9PSAwICkge1xyXG4gICAgICAgIC8vIElmIG91ciBsYXN0IHBpeGVsIHdhcyBlbXB0eSwgYW5kIG5vdyB3ZSdyZSBcIm9uXCIsIHN0YXJ0IG91ciByZWN0YW5nbGVcclxuICAgICAgICBpZiAoICFhY3RpdmUgKSB7XHJcbiAgICAgICAgICBhY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgbWluID0geDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGFjdGl2ZSApIHtcclxuICAgICAgICAvLyBGaW5pc2ggYSByZWN0YW5nbGUgb25jZSB3ZSByZWFjaCBhbiBcIm9mZlwiIHBpeGVsXHJcbiAgICAgICAgYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgc2hhcGUucmVjdCggbWluICogd2lkdGhTY2FsZSwgeSAqIHdpZHRoU2NhbGUsIHdpZHRoU2NhbGUgKiAoIHggLSBtaW4gKSwgaGVpZ2h0U2NhbGUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCBhY3RpdmUgKSB7XHJcbiAgICAgIC8vIFdlJ2xsIG5lZWQgdG8gZmluaXNoIHJlY3RhbmdsZXMgYXQgdGhlIGVuZCBvZiBlYWNoIHJvdyBhbnl3YXkuXHJcbiAgICAgIGFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICBzaGFwZS5yZWN0KCBtaW4gKiB3aWR0aFNjYWxlLCB5ICogd2lkdGhTY2FsZSwgd2lkdGhTY2FsZSAqICggaW1hZ2VEYXRhLndpZHRoIC0gbWluICksIGhlaWdodFNjYWxlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gc2hhcGUuZ2V0U2ltcGxpZmllZEFyZWFTaGFwZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gU1ZHIGltYWdlIGVsZW1lbnQgd2l0aCBhIGdpdmVuIFVSTCBhbmQgZGltZW5zaW9uc1xyXG4gKlxyXG4gKiBAcGFyYW0gdXJsIC0gVGhlIFVSTCBmb3IgdGhlIGltYWdlXHJcbiAqIEBwYXJhbSB3aWR0aCAtIE5vbi1uZWdhdGl2ZSBpbnRlZ2VyIGZvciB0aGUgaW1hZ2UncyB3aWR0aFxyXG4gKiBAcGFyYW0gaGVpZ2h0IC0gTm9uLW5lZ2F0aXZlIGludGVnZXIgZm9yIHRoZSBpbWFnZSdzIGhlaWdodFxyXG4gKi9cclxuSW1hZ2VhYmxlLmNyZWF0ZVNWR0ltYWdlID0gKCB1cmw6IHN0cmluZywgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIgKTogU1ZHSW1hZ2VFbGVtZW50ID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBpc0Zpbml0ZSggd2lkdGggKSAmJiB3aWR0aCA+PSAwICYmICggd2lkdGggJSAxICkgPT09IDAsXHJcbiAgICAnd2lkdGggc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBpbnRlZ2VyJyApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIGlzRmluaXRlKCBoZWlnaHQgKSAmJiBoZWlnaHQgPj0gMCAmJiAoIGhlaWdodCAlIDEgKSA9PT0gMCxcclxuICAgICdoZWlnaHQgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIGZpbml0ZSBpbnRlZ2VyJyApO1xyXG5cclxuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmducywgJ2ltYWdlJyApO1xyXG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAneCcsICcwJyApO1xyXG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAneScsICcwJyApO1xyXG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAnd2lkdGgnLCBgJHt3aWR0aH1weGAgKTtcclxuICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ2hlaWdodCcsIGAke2hlaWdodH1weGAgKTtcclxuICBlbGVtZW50LnNldEF0dHJpYnV0ZU5TKCB4bGlua25zLCAneGxpbms6aHJlZicsIHVybCApO1xyXG5cclxuICByZXR1cm4gZWxlbWVudDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGFuIG9iamVjdCBzdWl0YWJsZSB0byBiZSBwYXNzZWQgdG8gSW1hZ2UgYXMgYSBtaXBtYXAgKGZyb20gYSBDYW52YXMpXHJcbiAqL1xyXG5JbWFnZWFibGUuY3JlYXRlRmFzdE1pcG1hcEZyb21DYW52YXMgPSAoIGJhc2VDYW52YXM6IEhUTUxDYW52YXNFbGVtZW50ICk6IE1pcG1hcCA9PiB7XHJcbiAgY29uc3QgbWlwbWFwczogTWlwbWFwID0gW107XHJcblxyXG4gIGNvbnN0IGJhc2VVUkwgPSBiYXNlQ2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gIGNvbnN0IGJhc2VJbWFnZSA9IG5ldyB3aW5kb3cuSW1hZ2UoKTtcclxuICBiYXNlSW1hZ2Uuc3JjID0gYmFzZVVSTDtcclxuXHJcbiAgLy8gYmFzZSBsZXZlbFxyXG4gIG1pcG1hcHMucHVzaCgge1xyXG4gICAgaW1nOiBiYXNlSW1hZ2UsXHJcbiAgICB1cmw6IGJhc2VVUkwsXHJcbiAgICB3aWR0aDogYmFzZUNhbnZhcy53aWR0aCxcclxuICAgIGhlaWdodDogYmFzZUNhbnZhcy5oZWlnaHQsXHJcbiAgICBjYW52YXM6IGJhc2VDYW52YXNcclxuICB9ICk7XHJcblxyXG4gIGxldCBsYXJnZUNhbnZhcyA9IGJhc2VDYW52YXM7XHJcbiAgd2hpbGUgKCBsYXJnZUNhbnZhcy53aWR0aCA+PSAyICYmIGxhcmdlQ2FudmFzLmhlaWdodCA+PSAyICkge1xyXG5cclxuICAgIC8vIGRyYXcgaGFsZi1zaXplXHJcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xyXG4gICAgY2FudmFzLndpZHRoID0gTWF0aC5jZWlsKCBsYXJnZUNhbnZhcy53aWR0aCAvIDIgKTtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBNYXRoLmNlaWwoIGxhcmdlQ2FudmFzLmhlaWdodCAvIDIgKTtcclxuICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuICAgIGNvbnRleHQuc2V0VHJhbnNmb3JtKCAwLjUsIDAsIDAsIDAuNSwgMCwgMCApO1xyXG4gICAgY29udGV4dC5kcmF3SW1hZ2UoIGxhcmdlQ2FudmFzLCAwLCAwICk7XHJcblxyXG4gICAgLy8gc21hbGxlciBsZXZlbFxyXG4gICAgY29uc3QgbWlwbWFwTGV2ZWwgPSB7XHJcbiAgICAgIHdpZHRoOiBjYW52YXMud2lkdGgsXHJcbiAgICAgIGhlaWdodDogY2FudmFzLmhlaWdodCxcclxuICAgICAgY2FudmFzOiBjYW52YXMsXHJcbiAgICAgIHVybDogY2FudmFzLnRvRGF0YVVSTCgpLFxyXG4gICAgICBpbWc6IG5ldyB3aW5kb3cuSW1hZ2UoKVxyXG4gICAgfTtcclxuICAgIC8vIHNldCB1cCB0aGUgaW1hZ2UgYW5kIHVybFxyXG4gICAgbWlwbWFwTGV2ZWwuaW1nLnNyYyA9IG1pcG1hcExldmVsLnVybDtcclxuXHJcbiAgICBsYXJnZUNhbnZhcyA9IGNhbnZhcztcclxuICAgIG1pcG1hcHMucHVzaCggbWlwbWFwTGV2ZWwgKTtcclxuICB9XHJcblxyXG4gIHJldHVybiBtaXBtYXBzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgYSBzZW5zZSBvZiBcImF2ZXJhZ2VcIiBzY2FsZSwgd2hpY2ggc2hvdWxkIGJlIGV4YWN0IGlmIHRoZXJlIGlzIG5vIGFzeW1tZXRyaWMgc2NhbGUvc2hlYXIgYXBwbGllZFxyXG4gKi9cclxuSW1hZ2VhYmxlLmdldEFwcHJveGltYXRlTWF0cml4U2NhbGUgPSAoIG1hdHJpeDogTWF0cml4MyApOiBudW1iZXIgPT4ge1xyXG4gIHJldHVybiAoIE1hdGguc3FydCggbWF0cml4Lm0wMCgpICogbWF0cml4Lm0wMCgpICsgbWF0cml4Lm0xMCgpICogbWF0cml4Lm0xMCgpICkgK1xyXG4gICAgICAgICAgIE1hdGguc3FydCggbWF0cml4Lm0wMSgpICogbWF0cml4Lm0wMSgpICsgbWF0cml4Lm0xMSgpICogbWF0cml4Lm0xMSgpICkgKSAvIDI7XHJcbn07XHJcblxyXG4vLyB7bnVtYmVyfSAtIFdlIGluY2x1ZGUgdGhpcyBmb3IgYWRkaXRpb25hbCBzbW9vdGhpbmcgdGhhdCBzZWVtcyB0byBiZSBuZWVkZWQgZm9yIENhbnZhcyBpbWFnZSBxdWFsaXR5XHJcbkltYWdlYWJsZS5DQU5WQVNfTUlQTUFQX0JJQVNfQURKVVNUTUVOVCA9IDAuNTtcclxuXHJcbi8vIHtPYmplY3R9IC0gSW5pdGlhbCB2YWx1ZXMgZm9yIG1vc3QgTm9kZSBtdXRhdG9yIG9wdGlvbnNcclxuSW1hZ2VhYmxlLkRFRkFVTFRfT1BUSU9OUyA9IERFRkFVTFRfT1BUSU9OUztcclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdJbWFnZWFibGUnLCBJbWFnZWFibGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgSW1hZ2VhYmxlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLGlDQUFpQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBQzVDLFNBQVNDLEtBQUssUUFBUSw2QkFBNkI7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLHFDQUFxQztBQUc1RCxTQUFTQyxPQUFPLEVBQUVDLEtBQUssRUFBRUMsT0FBTyxRQUFRLGVBQWU7QUFJdkQ7QUFDQSxNQUFNQyxJQUFJLEdBQUdDLElBQUksQ0FBQ0QsSUFBSSxJQUFJLFVBQVVFLENBQVMsRUFBRztFQUFFLE9BQU9ELElBQUksQ0FBQ0UsR0FBRyxDQUFFRCxDQUFFLENBQUMsR0FBR0QsSUFBSSxDQUFDRyxHQUFHO0FBQUUsQ0FBQztBQUVwRixNQUFNQyxlQUFlLEdBQUc7RUFDdEJDLFlBQVksRUFBRSxDQUFDO0VBQ2ZDLFlBQVksRUFBRSxDQUFDO0VBQ2ZDLGFBQWEsRUFBRSxDQUFDO0VBQ2hCQyxNQUFNLEVBQUUsS0FBSztFQUNiQyxVQUFVLEVBQUUsQ0FBQztFQUNiQyxrQkFBa0IsRUFBRSxDQUFDO0VBQ3JCQyxjQUFjLEVBQUUsQ0FBQztFQUNqQkMsYUFBYSxFQUFFO0FBQ2pCLENBQVU7O0FBRVY7QUFDQSxJ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