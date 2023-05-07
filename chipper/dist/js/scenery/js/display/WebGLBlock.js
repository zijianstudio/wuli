// Copyright 2013-2022, University of Colorado Boulder

/**
 * Renders a visual layer of WebGL drawables.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Sharfudeen Ashraf (For Ghent University)
 */

import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import cleanArray from '../../../phet-core/js/cleanArray.js';
import Poolable from '../../../phet-core/js/Poolable.js';
import { FittedBlock, Renderer, scenery, ShaderProgram, SpriteSheet, Utils } from '../imports.js';
class WebGLBlock extends FittedBlock {
  /**
   * @mixes Poolable
   *
   * @param {Display} display
   * @param {number} renderer
   * @param {Instance} transformRootInstance
   * @param {Instance} filterRootInstance
   */
  constructor(display, renderer, transformRootInstance, filterRootInstance) {
    super();
    this.initialize(display, renderer, transformRootInstance, filterRootInstance);
  }

  /**
   * @public
   *
   * @param {Display} display
   * @param {number} renderer
   * @param {Instance} transformRootInstance
   * @param {Instance} filterRootInstance
   * @returns {WebGLBlock} - For chaining
   */
  initialize(display, renderer, transformRootInstance, filterRootInstance) {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`initialize #${this.id}`);
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();

    // WebGLBlocks are hard-coded to take the full display size (as opposed to svg and canvas)
    // Since we saw some jitter on iPad, see #318 and generally expect WebGL layers to span the entire display
    // In the future, it would be good to understand what was causing the problem and make webgl consistent
    // with svg and canvas again.
    super.initialize(display, renderer, transformRootInstance, FittedBlock.FULL_DISPLAY);

    // TODO: Uhh, is this not used?
    this.filterRootInstance = filterRootInstance;

    // {boolean} - Whether we pass this flag to the WebGL Context. It will store the contents displayed on the screen,
    // so that canvas.toDataURL() will work. It also requires clearing the context manually ever frame. Both incur
    // performance costs, so it should be false by default.
    // TODO: This block can be shared across displays, so we need to handle preserveDrawingBuffer separately?
    this.preserveDrawingBuffer = display._preserveDrawingBuffer;

    // list of {Drawable}s that need to be updated before we update
    this.dirtyDrawables = cleanArray(this.dirtyDrawables);

    // {Array.<SpriteSheet>}, permanent list of spritesheets for this block
    this.spriteSheets = this.spriteSheets || [];

    // Projection {Matrix3} that maps from Scenery's global coordinate frame to normalized device coordinates,
    // where x,y are both in the range [-1,1] from one side of the Canvas to the other.
    this.projectionMatrix = this.projectionMatrix || new Matrix3();

    // @private {Float32Array} - Column-major 3x3 array specifying our projection matrix for 2D points
    // (homogenized to (x,y,1))
    this.projectionMatrixArray = new Float32Array(9);

    // processor for custom WebGL drawables (e.g. WebGLNode)
    this.customProcessor = this.customProcessor || new CustomProcessor();

    // processor for drawing vertex-colored triangles (e.g. Path types)
    this.vertexColorPolygonsProcessor = this.vertexColorPolygonsProcessor || new VertexColorPolygons(this.projectionMatrixArray);

    // processor for drawing textured triangles (e.g. Image)
    this.texturedTrianglesProcessor = this.texturedTrianglesProcessor || new TexturedTrianglesProcessor(this.projectionMatrixArray);

    // @public {Emitter} - Called when the WebGL context changes to a new context.
    this.glChangedEmitter = new TinyEmitter();

    // @private {boolean}
    this.isContextLost = false;

    // @private {function}
    this.contextLostListener = this.onContextLoss.bind(this);
    this.contextRestoreListener = this.onContextRestoration.bind(this);
    if (!this.domElement) {
      // @public (scenery-internal) {HTMLCanvasElement} - Div wrapper used so we can switch out Canvases if necessary.
      this.domElement = document.createElement('div');
      this.domElement.className = 'webgl-container';
      this.domElement.style.position = 'absolute';
      this.domElement.style.left = '0';
      this.domElement.style.top = '0';
      this.rebuildCanvas();
    }

    // clear buffers when we are reinitialized
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // reset any fit transforms that were applied
    Utils.prepareForTransform(this.canvas); // Apply CSS needed for future CSS transforms to work properly.
    Utils.unsetTransform(this.canvas); // clear out any transforms that could have been previously applied

    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    return this;
  }

  /**
   * Forces a rebuild of the Canvas and its context (as long as a context can be obtained).
   * @private
   *
   * This can be necessary when the browser won't restore our context that was lost (and we need to create another
   * canvas to get a valid context).
   */
  rebuildCanvas() {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`rebuildCanvas #${this.id}`);
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
    const canvas = document.createElement('canvas');
    const gl = this.getContextFromCanvas(canvas);

    // Don't assert-failure out if this is not our first attempt (we're testing to see if we can recreate)
    assert && assert(gl || this.canvas, 'We should have a WebGL context by now');

    // If we're aggressively trying to rebuild, we need to ignore context creation failure.
    if (gl) {
      if (this.canvas) {
        this.domElement.removeChild(this.canvas);
        this.canvas.removeEventListener('webglcontextlost', this.contextLostListener, false);
        this.canvas.removeEventListener('webglcontextrestored', this.contextRestoreListener, false);
      }

      // @private {HTMLCanvasElement}
      this.canvas = canvas;
      this.canvas.style.pointerEvents = 'none';

      // @private {number} - unique ID so that we can support rasterization with Display.foreignObjectRasterization
      this.canvasId = this.canvas.id = `scenery-webgl${this.id}`;
      this.canvas.addEventListener('webglcontextlost', this.contextLostListener, false);
      this.canvas.addEventListener('webglcontextrestored', this.contextRestoreListener, false);
      this.domElement.appendChild(this.canvas);
      this.setupContext(gl);
    }
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
  }

  /**
   * Takes a fresh WebGL context switches the WebGL block over to use it.
   * @private
   *
   * @param {WebGLRenderingContext} gl
   */
  setupContext(gl) {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`setupContext #${this.id}`);
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
    assert && assert(gl, 'Should have an actual context if this is called');
    this.isContextLost = false;

    // @private {WebGLRenderingContext}
    this.gl = gl;

    // @private {number} - How much larger our Canvas will be compared to the CSS pixel dimensions, so that our
    // Canvas maps one of its pixels to a physical pixel (for Retina devices, etc.).
    this.backingScale = Utils.backingScale(this.gl);

    // Double the backing scale size if we detect no built-in antialiasing.
    // See https://github.com/phetsims/circuit-construction-kit-dc/issues/139 and
    // https://github.com/phetsims/scenery/issues/859.
    if (this.display._allowBackingScaleAntialiasing && gl.getParameter(gl.SAMPLES) === 0) {
      this.backingScale *= 2;
    }

    // @private {number}
    this.originalBackingScale = this.backingScale;
    Utils.applyWebGLContextDefaults(this.gl); // blending defaults, etc.

    // When the context changes, we need to force certain refreshes
    this.markDirty();
    this.dirtyFit = true; // Force re-fitting

    // Update the context references on the processors
    this.customProcessor.initializeContext(this.gl);
    this.vertexColorPolygonsProcessor.initializeContext(this.gl);
    this.texturedTrianglesProcessor.initializeContext(this.gl);

    // Notify spritesheets of the new context
    for (let i = 0; i < this.spriteSheets.length; i++) {
      this.spriteSheets[i].initializeContext(this.gl);
    }

    // Notify (e.g. WebGLNode painters need to be recreated)
    this.glChangedEmitter.emit();
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
  }

  /**
   * Attempts to force a Canvas rebuild to get a new Canvas/context pair.
   * @private
   */
  delayedRebuildCanvas() {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Delaying rebuilding of Canvas #${this.id}`);
    const self = this;

    // TODO: Can we move this to before the update() step? Could happen same-frame in that case.
    // NOTE: We don't want to rely on a common timer, so we're using the built-in form on purpose.
    window.setTimeout(function () {
      // eslint-disable-line bad-sim-text
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Executing delayed rebuilding #${this.id}`);
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
      self.rebuildCanvas();
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    });
  }

  /**
   * Callback for whenever our WebGL context is lost.
   * @private
   *
   * @param {WebGLContextEvent} domEvent
   */
  onContextLoss(domEvent) {
    if (!this.isContextLost) {
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Context lost #${this.id}`);
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
      this.isContextLost = true;

      // Preventing default is super-important, otherwise it never attempts to restore the context
      domEvent.preventDefault();
      this.canvas.style.display = 'none';
      this.markDirty();
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    }
  }

  /**
   * Callback for whenever our WebGL context is restored.
   * @private
   *
   * @param {WebGLContextEvent} domEvent
   */
  onContextRestoration(domEvent) {
    if (this.isContextLost) {
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`Context restored #${this.id}`);
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
      const gl = this.getContextFromCanvas(this.canvas);
      assert && assert(gl, 'We were told the context was restored, so this should work');
      this.setupContext(gl);
      this.canvas.style.display = '';
      sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    }
  }

  /**
   * Attempts to get a WebGL context from a Canvas.
   * @private
   *
   * @param {HTMLCanvasElement}
   * @returns {WebGLRenderingContext|*} - If falsy, it did not succeed.
   */
  getContextFromCanvas(canvas) {
    const contextOptions = {
      antialias: true,
      preserveDrawingBuffer: this.preserveDrawingBuffer
      // NOTE: we use premultiplied alpha since it should have better performance AND it appears to be the only one
      // truly compatible with texture filtering/interpolation.
      // See https://github.com/phetsims/energy-skate-park/issues/39, https://github.com/phetsims/scenery/issues/397
      // and https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
    };

    // we've already committed to using a WebGLBlock, so no use in a try-catch around our context attempt
    return canvas.getContext('webgl', contextOptions) || canvas.getContext('experimental-webgl', contextOptions);
  }

  /**
   * @public
   * @override
   */
  setSizeFullDisplay() {
    const size = this.display.getSize();
    this.canvas.width = Math.ceil(size.width * this.backingScale);
    this.canvas.height = Math.ceil(size.height * this.backingScale);
    this.canvas.style.width = `${size.width}px`;
    this.canvas.style.height = `${size.height}px`;
  }

  /**
   * @public
   * @override
   */
  setSizeFitBounds() {
    throw new Error('setSizeFitBounds unimplemented for WebGLBlock');
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
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`update #${this.id}`);
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
    const gl = this.gl;
    if (this.isContextLost && this.display._aggressiveContextRecreation) {
      this.delayedRebuildCanvas();
    }

    // update drawables, so that they have vertex arrays up to date, etc.
    while (this.dirtyDrawables.length) {
      this.dirtyDrawables.pop().update();
    }

    // ensure sprite sheet textures are up-to-date
    const numSpriteSheets = this.spriteSheets.length;
    for (let i = 0; i < numSpriteSheets; i++) {
      this.spriteSheets[i].updateTexture();
    }

    // temporary hack for supporting webglScale
    if (this.firstDrawable && this.firstDrawable === this.lastDrawable && this.firstDrawable.node && this.firstDrawable.node._hints.webglScale !== null && this.backingScale !== this.originalBackingScale * this.firstDrawable.node._hints.webglScale) {
      this.backingScale = this.originalBackingScale * this.firstDrawable.node._hints.webglScale;
      this.dirtyFit = true;
    }

    // udpate the fit BEFORE drawing, since it may change our offset
    this.updateFit();

    // finalX = 2 * x / display.width - 1
    // finalY = 1 - 2 * y / display.height
    // result = matrix * ( x, y, 1 )
    this.projectionMatrix.rowMajor(2 / this.display.width, 0, -1, 0, -2 / this.display.height, 1, 0, 0, 1);
    this.projectionMatrix.copyToArray(this.projectionMatrixArray);

    // if we created the context with preserveDrawingBuffer, we need to clear before rendering
    if (this.preserveDrawingBuffer) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);

    // We switch between processors for drawables based on each drawable's webglRenderer property. Each processor
    // will be activated, will process a certain number of adjacent drawables with that processor's webglRenderer,
    // and then will be deactivated. This allows us to switch back-and-forth between different shader programs,
    // and allows us to trigger draw calls for each grouping of drawables in an efficient way.
    let currentProcessor = null;
    // How many draw calls have been executed. If no draw calls are executed while updating, it means nothing should
    // be drawn, and we'll have to manually clear the Canvas if we are not preserving the drawing buffer.
    let cumulativeDrawCount = 0;
    // Iterate through all of our drawables (linked list)
    //OHTWO TODO: PERFORMANCE: create an array for faster drawable iteration (this is probably a hellish memory access pattern)
    for (let drawable = this.firstDrawable; drawable !== null; drawable = drawable.nextDrawable) {
      // ignore invisible drawables
      if (drawable.visible) {
        // select our desired processor
        let desiredProcessor = null;
        if (drawable.webglRenderer === Renderer.webglTexturedTriangles) {
          desiredProcessor = this.texturedTrianglesProcessor;
        } else if (drawable.webglRenderer === Renderer.webglCustom) {
          desiredProcessor = this.customProcessor;
        } else if (drawable.webglRenderer === Renderer.webglVertexColorPolygons) {
          desiredProcessor = this.vertexColorPolygonsProcessor;
        }
        assert && assert(desiredProcessor);

        // swap processors if necessary
        if (desiredProcessor !== currentProcessor) {
          // deactivate any old processors
          if (currentProcessor) {
            cumulativeDrawCount += currentProcessor.deactivate();
          }
          // activate the new processor
          currentProcessor = desiredProcessor;
          currentProcessor.activate();
        }

        // process our current drawable with the current processor
        currentProcessor.processDrawable(drawable);
      }

      // exit loop end case
      if (drawable === this.lastDrawable) {
        break;
      }
    }
    // deactivate any processor that still has drawables that need to be handled
    if (currentProcessor) {
      cumulativeDrawCount += currentProcessor.deactivate();
    }

    // If we executed no draw calls AND we aren't preserving the drawing buffer, we'll need to manually clear the
    // drawing buffer ourself.
    if (cumulativeDrawCount === 0 && !this.preserveDrawingBuffer) {
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.flush();
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
    return true;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`dispose #${this.id}`);

    // TODO: many things to dispose!?

    // clear references
    cleanArray(this.dirtyDrawables);
    super.dispose();
  }

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  markDirtyDrawable(drawable) {
    sceneryLog && sceneryLog.dirty && sceneryLog.dirty(`markDirtyDrawable on WebGLBlock#${this.id} with ${drawable.toString()}`);
    assert && assert(drawable);
    assert && assert(!drawable.isDisposed);

    // TODO: instance check to see if it is a canvas cache (usually we don't need to call update on our drawables)
    this.dirtyDrawables.push(drawable);
    this.markDirty();
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  addDrawable(drawable) {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.addDrawable ${drawable.toString()}`);
    super.addDrawable(drawable);

    // will trigger changes to the spritesheets for images, or initialization for others
    drawable.onAddToBlock(this);
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  removeDrawable(drawable) {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.removeDrawable ${drawable.toString()}`);

    // Ensure a removed drawable is not present in the dirtyDrawables array afterwards. Don't want to update it.
    // See https://github.com/phetsims/scenery/issues/635
    let index = 0;
    while ((index = this.dirtyDrawables.indexOf(drawable, index)) >= 0) {
      this.dirtyDrawables.splice(index, 1);
    }

    // wil trigger removal from spritesheets
    drawable.onRemoveFromBlock(this);
    super.removeDrawable(drawable);
  }

  /**
   * Ensures we have an allocated part of a SpriteSheet for this image. If a SpriteSheet already contains this image,
   * we'll just increase the reference count. Otherwise, we'll attempt to add it into one of our SpriteSheets. If
   * it doesn't fit, we'll add a new SpriteSheet and add the image to it.
   * @public
   *
   * @param {HTMLImageElement | HTMLCanvasElement} image
   * @param {number} width
   * @param {number} height
   *
   * @returns {Sprite} - Throws an error if we can't accommodate the image
   */
  addSpriteSheetImage(image, width, height) {
    let sprite = null;
    const numSpriteSheets = this.spriteSheets.length;
    // TODO: check for SpriteSheet containment first?
    for (let i = 0; i < numSpriteSheets; i++) {
      const spriteSheet = this.spriteSheets[i];
      sprite = spriteSheet.addImage(image, width, height);
      if (sprite) {
        break;
      }
    }
    if (!sprite) {
      const newSpriteSheet = new SpriteSheet(true); // use mipmaps for now?
      sprite = newSpriteSheet.addImage(image, width, height);
      newSpriteSheet.initializeContext(this.gl);
      this.spriteSheets.push(newSpriteSheet);
      if (!sprite) {
        // TODO: renderer flags should change for very large images
        throw new Error('Attempt to load image that is too large for sprite sheets');
      }
    }
    return sprite;
  }

  /**
   * Removes the reference to the sprite in our spritesheets.
   * @public
   *
   * @param {Sprite} sprite
   */
  removeSpriteSheetImage(sprite) {
    sprite.spriteSheet.removeImage(sprite.image);
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} firstDrawable
   * @param {Drawable} lastDrawable
   */
  onIntervalChange(firstDrawable, lastDrawable) {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.onIntervalChange ${firstDrawable.toString()} to ${lastDrawable.toString()}`);
    super.onIntervalChange(firstDrawable, lastDrawable);
    this.markDirty();
  }

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  onPotentiallyMovedDrawable(drawable) {
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.WebGLBlock(`#${this.id}.onPotentiallyMovedDrawable ${drawable.toString()}`);
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.push();
    assert && assert(drawable.parentDrawable === this);
    this.markDirty();
    sceneryLog && sceneryLog.WebGLBlock && sceneryLog.pop();
  }

  /**
   * Returns a string form of this object
   * @public
   *
   * @returns {string}
   */
  toString() {
    return `WebGLBlock#${this.id}-${FittedBlock.fitString[this.fit]}`;
  }
}
scenery.register('WebGLBlock', WebGLBlock);

/**---------------------------------------------------------------------------*
 * Processors rely on the following lifecycle:
 * 1. activate()
 * 2. processDrawable() - 0 or more times
 * 3. deactivate()
 * Once deactivated, they should have executed all of the draw calls they need to make.
 *---------------------------------------------------------------------------*/
class Processor {
  /**
   * @public
   */
  activate() {}

  /**
   * Sets the WebGL context that this processor should use.
   * @public
   *
   * NOTE: This can be called multiple times on a single processor, in the case where the previous context was lost.
   *       We should not need to dispose anything from that.
   *
   * @param {WebGLRenderingContext} gl
   */
  initializeContext(gl) {}

  /**
   * @public
   *
   * @param {Drawable} drawable
   */
  processDrawable(drawable) {}

  /**
   * @public
   */
  deactivate() {}
}
class CustomProcessor extends Processor {
  constructor() {
    super();

    // @private {Drawable}
    this.drawable = null;
  }

  /**
   * @public
   * @override
   */
  activate() {
    this.drawCount = 0;
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  processDrawable(drawable) {
    assert && assert(drawable.webglRenderer === Renderer.webglCustom);
    this.drawable = drawable;
    this.draw();
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    return this.drawCount;
  }

  /**
   * @private
   */
  draw() {
    if (this.drawable) {
      const count = this.drawable.draw();
      assert && assert(typeof count === 'number');
      this.drawCount += count;
      this.drawable = null;
    }
  }
}
class VertexColorPolygons extends Processor {
  /**
   * @param {Float32Array} projectionMatrixArray - Projection matrix entries
   */
  constructor(projectionMatrixArray) {
    assert && assert(projectionMatrixArray instanceof Float32Array);
    super();

    // @private {Float32Array}
    this.projectionMatrixArray = projectionMatrixArray;

    // @private {number} - Initial length of the vertex buffer. May increase as needed.
    this.lastArrayLength = 128;

    // @private {Float32Array}
    this.vertexArray = new Float32Array(this.lastArrayLength);
  }

  /**
   * Sets the WebGL context that this processor should use.
   * @public
   * @override
   *
   * NOTE: This can be called multiple times on a single processor, in the case where the previous context was lost.
   *       We should not need to dispose anything from that.
   *
   * @param {WebGLRenderingContext} gl
   */
  initializeContext(gl) {
    assert && assert(gl, 'Should be an actual context');

    // @private {WebGLRenderingContext}
    this.gl = gl;

    // @private {ShaderProgram}
    this.shaderProgram = new ShaderProgram(gl, [
    // vertex shader
    'attribute vec2 aVertex;', 'attribute vec4 aColor;', 'varying vec4 vColor;', 'uniform mat3 uProjectionMatrix;', 'void main() {', '  vColor = aColor;', '  vec3 ndc = uProjectionMatrix * vec3( aVertex, 1.0 );',
    // homogeneous map to to normalized device coordinates
    '  gl_Position = vec4( ndc.xy, 0.0, 1.0 );', '}'].join('\n'), [
    // fragment shader
    'precision mediump float;', 'varying vec4 vColor;', 'void main() {',
    // NOTE: Premultiplying alpha here is needed since we're going back to the standard blend functions.
    // See https://github.com/phetsims/energy-skate-park/issues/39, https://github.com/phetsims/scenery/issues/397
    // and https://stackoverflow.com/questions/39341564/webgl-how-to-correctly-blend-alpha-channel-png
    '  gl_FragColor = vec4( vColor.rgb * vColor.a, vColor.a );', '}'].join('\n'), {
      attributes: ['aVertex', 'aColor'],
      uniforms: ['uProjectionMatrix']
    });

    // @private {WebGLBuffer}
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
  }

  /**
   * @public
   * @override
   */
  activate() {
    this.shaderProgram.use();
    this.vertexArrayIndex = 0;
    this.drawCount = 0;
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  processDrawable(drawable) {
    if (drawable.includeVertices) {
      const vertexData = drawable.vertexArray;

      // if our vertex data won't fit, keep doubling the size until it fits
      while (vertexData.length + this.vertexArrayIndex > this.vertexArray.length) {
        const newVertexArray = new Float32Array(this.vertexArray.length * 2);
        newVertexArray.set(this.vertexArray);
        this.vertexArray = newVertexArray;
      }

      // copy our vertex data into the main array
      this.vertexArray.set(vertexData, this.vertexArrayIndex);
      this.vertexArrayIndex += vertexData.length;
      this.drawCount++;
    }
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    if (this.drawCount) {
      this.draw();
    }
    this.shaderProgram.unuse();
    return this.drawCount;
  }

  /**
   * @private
   */
  draw() {
    const gl = this.gl;

    // (uniform) projection transform into normalized device coordinates
    gl.uniformMatrix3fv(this.shaderProgram.uniformLocations.uProjectionMatrix, false, this.projectionMatrixArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    // if we increased in length, we need to do a full bufferData to resize it on the GPU side
    if (this.vertexArray.length > this.lastArrayLength) {
      gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
    }
    // otherwise do a more efficient update that only sends part of the array over
    else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray.subarray(0, this.vertexArrayIndex));
    }
    const sizeOfFloat = Float32Array.BYTES_PER_ELEMENT;
    const stride = 6 * sizeOfFloat;
    gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, stride, 0 * sizeOfFloat);
    gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aColor, 4, gl.FLOAT, false, stride, 2 * sizeOfFloat);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexArrayIndex / 6);
    this.vertexArrayIndex = 0;
  }
}
class TexturedTrianglesProcessor extends Processor {
  /**
   * @param {Float32Array} projectionMatrixArray - Projection matrix entries
   */
  constructor(projectionMatrixArray) {
    assert && assert(projectionMatrixArray instanceof Float32Array);
    super();

    // @private {Float32Array}
    this.projectionMatrixArray = projectionMatrixArray;

    // @private {number} - Initial length of the vertex buffer. May increase as needed.
    this.lastArrayLength = 128;

    // @private {Float32Array}
    this.vertexArray = new Float32Array(this.lastArrayLength);
  }

  /**
   * Sets the WebGL context that this processor should use.
   * @public
   * @override
   *
   * NOTE: This can be called multiple times on a single processor, in the case where the previous context was lost.
   *       We should not need to dispose anything from that.
   *
   * @param {WebGLRenderingContext} gl
   */
  initializeContext(gl) {
    assert && assert(gl, 'Should be an actual context');

    // @private {WebGLRenderingContext}
    this.gl = gl;

    // @private {ShaderProgram}
    this.shaderProgram = new ShaderProgram(gl, [
    // vertex shader
    'attribute vec2 aVertex;', 'attribute vec2 aTextureCoord;', 'attribute float aAlpha;', 'varying vec2 vTextureCoord;', 'varying float vAlpha;', 'uniform mat3 uProjectionMatrix;', 'void main() {', '  vTextureCoord = aTextureCoord;', '  vAlpha = aAlpha;', '  vec3 ndc = uProjectionMatrix * vec3( aVertex, 1.0 );',
    // homogeneous map to to normalized device coordinates
    '  gl_Position = vec4( ndc.xy, 0.0, 1.0 );', '}'].join('\n'), [
    // fragment shader
    'precision mediump float;', 'varying vec2 vTextureCoord;', 'varying float vAlpha;', 'uniform sampler2D uTexture;', 'void main() {', '  vec4 color = texture2D( uTexture, vTextureCoord, -0.7 );',
    // mipmap LOD bias of -0.7 (for now)
    '  color.a *= vAlpha;', '  gl_FragColor = color;',
    // don't premultiply alpha (we are loading the textures as premultiplied already)
    '}'].join('\n'), {
      // attributes: [ 'aVertex', 'aTextureCoord' ],
      attributes: ['aVertex', 'aTextureCoord', 'aAlpha'],
      uniforms: ['uTexture', 'uProjectionMatrix']
    });

    // @private {WebGLBuffer}
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
  }

  /**
   * @public
   * @override
   */
  activate() {
    this.shaderProgram.use();
    this.currentSpriteSheet = null;
    this.vertexArrayIndex = 0;
    this.drawCount = 0;
  }

  /**
   * @public
   * @override
   *
   * @param {Drawable} drawable
   */
  processDrawable(drawable) {
    // skip unloaded images or sprites
    if (!drawable.sprite) {
      return;
    }
    assert && assert(drawable.webglRenderer === Renderer.webglTexturedTriangles);
    if (this.currentSpriteSheet && drawable.sprite.spriteSheet !== this.currentSpriteSheet) {
      this.draw();
    }
    this.currentSpriteSheet = drawable.sprite.spriteSheet;
    const vertexData = drawable.vertexArray;

    // if our vertex data won't fit, keep doubling the size until it fits
    while (vertexData.length + this.vertexArrayIndex > this.vertexArray.length) {
      const newVertexArray = new Float32Array(this.vertexArray.length * 2);
      newVertexArray.set(this.vertexArray);
      this.vertexArray = newVertexArray;
    }

    // copy our vertex data into the main array
    this.vertexArray.set(vertexData, this.vertexArrayIndex);
    this.vertexArrayIndex += vertexData.length;
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    if (this.currentSpriteSheet) {
      this.draw();
    }
    this.shaderProgram.unuse();
    return this.drawCount;
  }

  /**
   * @private
   */
  draw() {
    assert && assert(this.currentSpriteSheet);
    const gl = this.gl;

    // (uniform) projection transform into normalized device coordinates
    gl.uniformMatrix3fv(this.shaderProgram.uniformLocations.uProjectionMatrix, false, this.projectionMatrixArray);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    // if we increased in length, we need to do a full bufferData to resize it on the GPU side
    if (this.vertexArray.length > this.lastArrayLength) {
      gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.DYNAMIC_DRAW); // fully buffer at the start
    }
    // otherwise do a more efficient update that only sends part of the array over
    else {
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray.subarray(0, this.vertexArrayIndex));
    }
    const numComponents = 5;
    const sizeOfFloat = Float32Array.BYTES_PER_ELEMENT;
    const stride = numComponents * sizeOfFloat;
    gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aVertex, 2, gl.FLOAT, false, stride, 0 * sizeOfFloat);
    gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * sizeOfFloat);
    gl.vertexAttribPointer(this.shaderProgram.attributeLocations.aAlpha, 1, gl.FLOAT, false, stride, 4 * sizeOfFloat);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.currentSpriteSheet.texture);
    gl.uniform1i(this.shaderProgram.uniformLocations.uTexture, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexArrayIndex / numComponents);
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.drawCount++;
    this.currentSpriteSheet = null;
    this.vertexArrayIndex = 0;
  }
}
Poolable.mixInto(WebGLBlock);
export default WebGLBlock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaW55RW1pdHRlciIsIk1hdHJpeDMiLCJjbGVhbkFycmF5IiwiUG9vbGFibGUiLCJGaXR0ZWRCbG9jayIsIlJlbmRlcmVyIiwic2NlbmVyeSIsIlNoYWRlclByb2dyYW0iLCJTcHJpdGVTaGVldCIsIlV0aWxzIiwiV2ViR0xCbG9jayIsImNvbnN0cnVjdG9yIiwiZGlzcGxheSIsInJlbmRlcmVyIiwidHJhbnNmb3JtUm9vdEluc3RhbmNlIiwiZmlsdGVyUm9vdEluc3RhbmNlIiwiaW5pdGlhbGl6ZSIsInNjZW5lcnlMb2ciLCJpZCIsInB1c2giLCJGVUxMX0RJU1BMQVkiLCJwcmVzZXJ2ZURyYXdpbmdCdWZmZXIiLCJfcHJlc2VydmVEcmF3aW5nQnVmZmVyIiwiZGlydHlEcmF3YWJsZXMiLCJzcHJpdGVTaGVldHMiLCJwcm9qZWN0aW9uTWF0cml4IiwicHJvamVjdGlvbk1hdHJpeEFycmF5IiwiRmxvYXQzMkFycmF5IiwiY3VzdG9tUHJvY2Vzc29yIiwiQ3VzdG9tUHJvY2Vzc29yIiwidmVydGV4Q29sb3JQb2x5Z29uc1Byb2Nlc3NvciIsIlZlcnRleENvbG9yUG9seWdvbnMiLCJ0ZXh0dXJlZFRyaWFuZ2xlc1Byb2Nlc3NvciIsIlRleHR1cmVkVHJpYW5nbGVzUHJvY2Vzc29yIiwiZ2xDaGFuZ2VkRW1pdHRlciIsImlzQ29udGV4dExvc3QiLCJjb250ZXh0TG9zdExpc3RlbmVyIiwib25Db250ZXh0TG9zcyIsImJpbmQiLCJjb250ZXh0UmVzdG9yZUxpc3RlbmVyIiwib25Db250ZXh0UmVzdG9yYXRpb24iLCJkb21FbGVtZW50IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NOYW1lIiwic3R5bGUiLCJwb3NpdGlvbiIsImxlZnQiLCJ0b3AiLCJyZWJ1aWxkQ2FudmFzIiwiZ2wiLCJjbGVhciIsIkNPTE9SX0JVRkZFUl9CSVQiLCJwcmVwYXJlRm9yVHJhbnNmb3JtIiwiY2FudmFzIiwidW5zZXRUcmFuc2Zvcm0iLCJwb3AiLCJnZXRDb250ZXh0RnJvbUNhbnZhcyIsImFzc2VydCIsInJlbW92ZUNoaWxkIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInBvaW50ZXJFdmVudHMiLCJjYW52YXNJZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJhcHBlbmRDaGlsZCIsInNldHVwQ29udGV4dCIsImJhY2tpbmdTY2FsZSIsIl9hbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZyIsImdldFBhcmFtZXRlciIsIlNBTVBMRVMiLCJvcmlnaW5hbEJhY2tpbmdTY2FsZSIsImFwcGx5V2ViR0xDb250ZXh0RGVmYXVsdHMiLCJtYXJrRGlydHkiLCJkaXJ0eUZpdCIsImluaXRpYWxpemVDb250ZXh0IiwiaSIsImxlbmd0aCIsImVtaXQiLCJkZWxheWVkUmVidWlsZENhbnZhcyIsInNlbGYiLCJ3aW5kb3ciLCJzZXRUaW1lb3V0IiwiZG9tRXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsImNvbnRleHRPcHRpb25zIiwiYW50aWFsaWFzIiwiZ2V0Q29udGV4dCIsInNldFNpemVGdWxsRGlzcGxheSIsInNpemUiLCJnZXRTaXplIiwid2lkdGgiLCJNYXRoIiwiY2VpbCIsImhlaWdodCIsInNldFNpemVGaXRCb3VuZHMiLCJFcnJvciIsInVwZGF0ZSIsIl9hZ2dyZXNzaXZlQ29udGV4dFJlY3JlYXRpb24iLCJudW1TcHJpdGVTaGVldHMiLCJ1cGRhdGVUZXh0dXJlIiwiZmlyc3REcmF3YWJsZSIsImxhc3REcmF3YWJsZSIsIm5vZGUiLCJfaGludHMiLCJ3ZWJnbFNjYWxlIiwidXBkYXRlRml0Iiwicm93TWFqb3IiLCJjb3B5VG9BcnJheSIsInZpZXdwb3J0IiwiY3VycmVudFByb2Nlc3NvciIsImN1bXVsYXRpdmVEcmF3Q291bnQiLCJkcmF3YWJsZSIsIm5leHREcmF3YWJsZSIsInZpc2libGUiLCJkZXNpcmVkUHJvY2Vzc29yIiwid2ViZ2xSZW5kZXJlciIsIndlYmdsVGV4dHVyZWRUcmlhbmdsZXMiLCJ3ZWJnbEN1c3RvbSIsIndlYmdsVmVydGV4Q29sb3JQb2x5Z29ucyIsImRlYWN0aXZhdGUiLCJhY3RpdmF0ZSIsInByb2Nlc3NEcmF3YWJsZSIsImZsdXNoIiwiZGlzcG9zZSIsIm1hcmtEaXJ0eURyYXdhYmxlIiwiZGlydHkiLCJ0b1N0cmluZyIsImlzRGlzcG9zZWQiLCJhZGREcmF3YWJsZSIsIm9uQWRkVG9CbG9jayIsInJlbW92ZURyYXdhYmxlIiwiaW5kZXgiLCJpbmRleE9mIiwic3BsaWNlIiwib25SZW1vdmVGcm9tQmxvY2siLCJhZGRTcHJpdGVTaGVldEltYWdlIiwiaW1hZ2UiLCJzcHJpdGUiLCJzcHJpdGVTaGVldCIsImFkZEltYWdlIiwibmV3U3ByaXRlU2hlZXQiLCJyZW1vdmVTcHJpdGVTaGVldEltYWdlIiwicmVtb3ZlSW1hZ2UiLCJvbkludGVydmFsQ2hhbmdlIiwib25Qb3RlbnRpYWxseU1vdmVkRHJhd2FibGUiLCJwYXJlbnREcmF3YWJsZSIsImZpdFN0cmluZyIsImZpdCIsInJlZ2lzdGVyIiwiUHJvY2Vzc29yIiwiZHJhd0NvdW50IiwiZHJhdyIsImNvdW50IiwibGFzdEFycmF5TGVuZ3RoIiwidmVydGV4QXJyYXkiLCJzaGFkZXJQcm9ncmFtIiwiam9pbiIsImF0dHJpYnV0ZXMiLCJ1bmlmb3JtcyIsInZlcnRleEJ1ZmZlciIsImNyZWF0ZUJ1ZmZlciIsImJpbmRCdWZmZXIiLCJBUlJBWV9CVUZGRVIiLCJidWZmZXJEYXRhIiwiRFlOQU1JQ19EUkFXIiwidXNlIiwidmVydGV4QXJyYXlJbmRleCIsImluY2x1ZGVWZXJ0aWNlcyIsInZlcnRleERhdGEiLCJuZXdWZXJ0ZXhBcnJheSIsInNldCIsInVudXNlIiwidW5pZm9ybU1hdHJpeDNmdiIsInVuaWZvcm1Mb2NhdGlvbnMiLCJ1UHJvamVjdGlvbk1hdHJpeCIsImJ1ZmZlclN1YkRhdGEiLCJzdWJhcnJheSIsInNpemVPZkZsb2F0IiwiQllURVNfUEVSX0VMRU1FTlQiLCJzdHJpZGUiLCJ2ZXJ0ZXhBdHRyaWJQb2ludGVyIiwiYXR0cmlidXRlTG9jYXRpb25zIiwiYVZlcnRleCIsIkZMT0FUIiwiYUNvbG9yIiwiZHJhd0FycmF5cyIsIlRSSUFOR0xFUyIsImN1cnJlbnRTcHJpdGVTaGVldCIsIm51bUNvbXBvbmVudHMiLCJhVGV4dHVyZUNvb3JkIiwiYUFscGhhIiwiYWN0aXZlVGV4dHVyZSIsIlRFWFRVUkUwIiwiYmluZFRleHR1cmUiLCJURVhUVVJFXzJEIiwidGV4dHVyZSIsInVuaWZvcm0xaSIsInVUZXh0dXJlIiwibWl4SW50byJdLCJzb3VyY2VzIjpbIldlYkdMQmxvY2suanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVuZGVycyBhIHZpc3VhbCBsYXllciBvZiBXZWJHTCBkcmF3YWJsZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoRm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBjbGVhbkFycmF5IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9jbGVhbkFycmF5LmpzJztcclxuaW1wb3J0IFBvb2xhYmxlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9Qb29sYWJsZS5qcyc7XHJcbmltcG9ydCB7IEZpdHRlZEJsb2NrLCBSZW5kZXJlciwgc2NlbmVyeSwgU2hhZGVyUHJvZ3JhbSwgU3ByaXRlU2hlZXQsIFV0aWxzIH0gZnJvbSAnLi4vaW1wb3J0cy5qcyc7XHJcblxyXG5jbGFzcyBXZWJHTEJsb2NrIGV4dGVuZHMgRml0dGVkQmxvY2sge1xyXG4gIC8qKlxyXG4gICAqIEBtaXhlcyBQb29sYWJsZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEaXNwbGF5fSBkaXNwbGF5XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJlbmRlcmVyXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gdHJhbnNmb3JtUm9vdEluc3RhbmNlXHJcbiAgICogQHBhcmFtIHtJbnN0YW5jZX0gZmlsdGVyUm9vdEluc3RhbmNlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGRpc3BsYXksIHJlbmRlcmVyLCB0cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGZpbHRlclJvb3RJbnN0YW5jZSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5pbml0aWFsaXplKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBmaWx0ZXJSb290SW5zdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RGlzcGxheX0gZGlzcGxheVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByZW5kZXJlclxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IHRyYW5zZm9ybVJvb3RJbnN0YW5jZVxyXG4gICAqIEBwYXJhbSB7SW5zdGFuY2V9IGZpbHRlclJvb3RJbnN0YW5jZVxyXG4gICAqIEByZXR1cm5zIHtXZWJHTEJsb2NrfSAtIEZvciBjaGFpbmluZ1xyXG4gICAqL1xyXG4gIGluaXRpYWxpemUoIGRpc3BsYXksIHJlbmRlcmVyLCB0cmFuc2Zvcm1Sb290SW5zdGFuY2UsIGZpbHRlclJvb3RJbnN0YW5jZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYGluaXRpYWxpemUgIyR7dGhpcy5pZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICAvLyBXZWJHTEJsb2NrcyBhcmUgaGFyZC1jb2RlZCB0byB0YWtlIHRoZSBmdWxsIGRpc3BsYXkgc2l6ZSAoYXMgb3Bwb3NlZCB0byBzdmcgYW5kIGNhbnZhcylcclxuICAgIC8vIFNpbmNlIHdlIHNhdyBzb21lIGppdHRlciBvbiBpUGFkLCBzZWUgIzMxOCBhbmQgZ2VuZXJhbGx5IGV4cGVjdCBXZWJHTCBsYXllcnMgdG8gc3BhbiB0aGUgZW50aXJlIGRpc3BsYXlcclxuICAgIC8vIEluIHRoZSBmdXR1cmUsIGl0IHdvdWxkIGJlIGdvb2QgdG8gdW5kZXJzdGFuZCB3aGF0IHdhcyBjYXVzaW5nIHRoZSBwcm9ibGVtIGFuZCBtYWtlIHdlYmdsIGNvbnNpc3RlbnRcclxuICAgIC8vIHdpdGggc3ZnIGFuZCBjYW52YXMgYWdhaW4uXHJcbiAgICBzdXBlci5pbml0aWFsaXplKCBkaXNwbGF5LCByZW5kZXJlciwgdHJhbnNmb3JtUm9vdEluc3RhbmNlLCBGaXR0ZWRCbG9jay5GVUxMX0RJU1BMQVkgKTtcclxuXHJcbiAgICAvLyBUT0RPOiBVaGgsIGlzIHRoaXMgbm90IHVzZWQ/XHJcbiAgICB0aGlzLmZpbHRlclJvb3RJbnN0YW5jZSA9IGZpbHRlclJvb3RJbnN0YW5jZTtcclxuXHJcbiAgICAvLyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHdlIHBhc3MgdGhpcyBmbGFnIHRvIHRoZSBXZWJHTCBDb250ZXh0LiBJdCB3aWxsIHN0b3JlIHRoZSBjb250ZW50cyBkaXNwbGF5ZWQgb24gdGhlIHNjcmVlbixcclxuICAgIC8vIHNvIHRoYXQgY2FudmFzLnRvRGF0YVVSTCgpIHdpbGwgd29yay4gSXQgYWxzbyByZXF1aXJlcyBjbGVhcmluZyB0aGUgY29udGV4dCBtYW51YWxseSBldmVyIGZyYW1lLiBCb3RoIGluY3VyXHJcbiAgICAvLyBwZXJmb3JtYW5jZSBjb3N0cywgc28gaXQgc2hvdWxkIGJlIGZhbHNlIGJ5IGRlZmF1bHQuXHJcbiAgICAvLyBUT0RPOiBUaGlzIGJsb2NrIGNhbiBiZSBzaGFyZWQgYWNyb3NzIGRpc3BsYXlzLCBzbyB3ZSBuZWVkIHRvIGhhbmRsZSBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIgc2VwYXJhdGVseT9cclxuICAgIHRoaXMucHJlc2VydmVEcmF3aW5nQnVmZmVyID0gZGlzcGxheS5fcHJlc2VydmVEcmF3aW5nQnVmZmVyO1xyXG5cclxuICAgIC8vIGxpc3Qgb2Yge0RyYXdhYmxlfXMgdGhhdCBuZWVkIHRvIGJlIHVwZGF0ZWQgYmVmb3JlIHdlIHVwZGF0ZVxyXG4gICAgdGhpcy5kaXJ0eURyYXdhYmxlcyA9IGNsZWFuQXJyYXkoIHRoaXMuZGlydHlEcmF3YWJsZXMgKTtcclxuXHJcbiAgICAvLyB7QXJyYXkuPFNwcml0ZVNoZWV0Pn0sIHBlcm1hbmVudCBsaXN0IG9mIHNwcml0ZXNoZWV0cyBmb3IgdGhpcyBibG9ja1xyXG4gICAgdGhpcy5zcHJpdGVTaGVldHMgPSB0aGlzLnNwcml0ZVNoZWV0cyB8fCBbXTtcclxuXHJcbiAgICAvLyBQcm9qZWN0aW9uIHtNYXRyaXgzfSB0aGF0IG1hcHMgZnJvbSBTY2VuZXJ5J3MgZ2xvYmFsIGNvb3JkaW5hdGUgZnJhbWUgdG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXMsXHJcbiAgICAvLyB3aGVyZSB4LHkgYXJlIGJvdGggaW4gdGhlIHJhbmdlIFstMSwxXSBmcm9tIG9uZSBzaWRlIG9mIHRoZSBDYW52YXMgdG8gdGhlIG90aGVyLlxyXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4ID0gdGhpcy5wcm9qZWN0aW9uTWF0cml4IHx8IG5ldyBNYXRyaXgzKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0Zsb2F0MzJBcnJheX0gLSBDb2x1bW4tbWFqb3IgM3gzIGFycmF5IHNwZWNpZnlpbmcgb3VyIHByb2plY3Rpb24gbWF0cml4IGZvciAyRCBwb2ludHNcclxuICAgIC8vIChob21vZ2VuaXplZCB0byAoeCx5LDEpKVxyXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCA5ICk7XHJcblxyXG4gICAgLy8gcHJvY2Vzc29yIGZvciBjdXN0b20gV2ViR0wgZHJhd2FibGVzIChlLmcuIFdlYkdMTm9kZSlcclxuICAgIHRoaXMuY3VzdG9tUHJvY2Vzc29yID0gdGhpcy5jdXN0b21Qcm9jZXNzb3IgfHwgbmV3IEN1c3RvbVByb2Nlc3NvcigpO1xyXG5cclxuICAgIC8vIHByb2Nlc3NvciBmb3IgZHJhd2luZyB2ZXJ0ZXgtY29sb3JlZCB0cmlhbmdsZXMgKGUuZy4gUGF0aCB0eXBlcylcclxuICAgIHRoaXMudmVydGV4Q29sb3JQb2x5Z29uc1Byb2Nlc3NvciA9IHRoaXMudmVydGV4Q29sb3JQb2x5Z29uc1Byb2Nlc3NvciB8fCBuZXcgVmVydGV4Q29sb3JQb2x5Z29ucyggdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgKTtcclxuXHJcbiAgICAvLyBwcm9jZXNzb3IgZm9yIGRyYXdpbmcgdGV4dHVyZWQgdHJpYW5nbGVzIChlLmcuIEltYWdlKVxyXG4gICAgdGhpcy50ZXh0dXJlZFRyaWFuZ2xlc1Byb2Nlc3NvciA9IHRoaXMudGV4dHVyZWRUcmlhbmdsZXNQcm9jZXNzb3IgfHwgbmV3IFRleHR1cmVkVHJpYW5nbGVzUHJvY2Vzc29yKCB0aGlzLnByb2plY3Rpb25NYXRyaXhBcnJheSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0VtaXR0ZXJ9IC0gQ2FsbGVkIHdoZW4gdGhlIFdlYkdMIGNvbnRleHQgY2hhbmdlcyB0byBhIG5ldyBjb250ZXh0LlxyXG4gICAgdGhpcy5nbENoYW5nZWRFbWl0dGVyID0gbmV3IFRpbnlFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Jvb2xlYW59XHJcbiAgICB0aGlzLmlzQ29udGV4dExvc3QgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLmNvbnRleHRMb3N0TGlzdGVuZXIgPSB0aGlzLm9uQ29udGV4dExvc3MuYmluZCggdGhpcyApO1xyXG4gICAgdGhpcy5jb250ZXh0UmVzdG9yZUxpc3RlbmVyID0gdGhpcy5vbkNvbnRleHRSZXN0b3JhdGlvbi5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5kb21FbGVtZW50ICkge1xyXG4gICAgICAvLyBAcHVibGljIChzY2VuZXJ5LWludGVybmFsKSB7SFRNTENhbnZhc0VsZW1lbnR9IC0gRGl2IHdyYXBwZXIgdXNlZCBzbyB3ZSBjYW4gc3dpdGNoIG91dCBDYW52YXNlcyBpZiBuZWNlc3NhcnkuXHJcbiAgICAgIHRoaXMuZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5jbGFzc05hbWUgPSAnd2ViZ2wtY29udGFpbmVyJztcclxuICAgICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgdGhpcy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMCc7XHJcbiAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMCc7XHJcblxyXG4gICAgICB0aGlzLnJlYnVpbGRDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjbGVhciBidWZmZXJzIHdoZW4gd2UgYXJlIHJlaW5pdGlhbGl6ZWRcclxuICAgIHRoaXMuZ2wuY2xlYXIoIHRoaXMuZ2wuQ09MT1JfQlVGRkVSX0JJVCApO1xyXG5cclxuICAgIC8vIHJlc2V0IGFueSBmaXQgdHJhbnNmb3JtcyB0aGF0IHdlcmUgYXBwbGllZFxyXG4gICAgVXRpbHMucHJlcGFyZUZvclRyYW5zZm9ybSggdGhpcy5jYW52YXMgKTsgLy8gQXBwbHkgQ1NTIG5lZWRlZCBmb3IgZnV0dXJlIENTUyB0cmFuc2Zvcm1zIHRvIHdvcmsgcHJvcGVybHkuXHJcbiAgICBVdGlscy51bnNldFRyYW5zZm9ybSggdGhpcy5jYW52YXMgKTsgLy8gY2xlYXIgb3V0IGFueSB0cmFuc2Zvcm1zIHRoYXQgY291bGQgaGF2ZSBiZWVuIHByZXZpb3VzbHkgYXBwbGllZFxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3JjZXMgYSByZWJ1aWxkIG9mIHRoZSBDYW52YXMgYW5kIGl0cyBjb250ZXh0IChhcyBsb25nIGFzIGEgY29udGV4dCBjYW4gYmUgb2J0YWluZWQpLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBUaGlzIGNhbiBiZSBuZWNlc3Nhcnkgd2hlbiB0aGUgYnJvd3NlciB3b24ndCByZXN0b3JlIG91ciBjb250ZXh0IHRoYXQgd2FzIGxvc3QgKGFuZCB3ZSBuZWVkIHRvIGNyZWF0ZSBhbm90aGVyXHJcbiAgICogY2FudmFzIHRvIGdldCBhIHZhbGlkIGNvbnRleHQpLlxyXG4gICAqL1xyXG4gIHJlYnVpbGRDYW52YXMoKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGByZWJ1aWxkQ2FudmFzICMke3RoaXMuaWR9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgIGNvbnN0IGdsID0gdGhpcy5nZXRDb250ZXh0RnJvbUNhbnZhcyggY2FudmFzICk7XHJcblxyXG4gICAgLy8gRG9uJ3QgYXNzZXJ0LWZhaWx1cmUgb3V0IGlmIHRoaXMgaXMgbm90IG91ciBmaXJzdCBhdHRlbXB0ICh3ZSdyZSB0ZXN0aW5nIHRvIHNlZSBpZiB3ZSBjYW4gcmVjcmVhdGUpXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbCB8fCB0aGlzLmNhbnZhcywgJ1dlIHNob3VsZCBoYXZlIGEgV2ViR0wgY29udGV4dCBieSBub3cnICk7XHJcblxyXG4gICAgLy8gSWYgd2UncmUgYWdncmVzc2l2ZWx5IHRyeWluZyB0byByZWJ1aWxkLCB3ZSBuZWVkIHRvIGlnbm9yZSBjb250ZXh0IGNyZWF0aW9uIGZhaWx1cmUuXHJcbiAgICBpZiAoIGdsICkge1xyXG4gICAgICBpZiAoIHRoaXMuY2FudmFzICkge1xyXG4gICAgICAgIHRoaXMuZG9tRWxlbWVudC5yZW1vdmVDaGlsZCggdGhpcy5jYW52YXMgKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCAnd2ViZ2xjb250ZXh0bG9zdCcsIHRoaXMuY29udGV4dExvc3RMaXN0ZW5lciwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy5yZW1vdmVFdmVudExpc3RlbmVyKCAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnLCB0aGlzLmNvbnRleHRSZXN0b3JlTGlzdGVuZXIsIGZhbHNlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIHtIVE1MQ2FudmFzRWxlbWVudH1cclxuICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XHJcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfSAtIHVuaXF1ZSBJRCBzbyB0aGF0IHdlIGNhbiBzdXBwb3J0IHJhc3Rlcml6YXRpb24gd2l0aCBEaXNwbGF5LmZvcmVpZ25PYmplY3RSYXN0ZXJpemF0aW9uXHJcbiAgICAgIHRoaXMuY2FudmFzSWQgPSB0aGlzLmNhbnZhcy5pZCA9IGBzY2VuZXJ5LXdlYmdsJHt0aGlzLmlkfWA7XHJcblxyXG4gICAgICB0aGlzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCAnd2ViZ2xjb250ZXh0bG9zdCcsIHRoaXMuY29udGV4dExvc3RMaXN0ZW5lciwgZmFsc2UgKTtcclxuICAgICAgdGhpcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lciggJ3dlYmdsY29udGV4dHJlc3RvcmVkJywgdGhpcy5jb250ZXh0UmVzdG9yZUxpc3RlbmVyLCBmYWxzZSApO1xyXG5cclxuICAgICAgdGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLmNhbnZhcyApO1xyXG5cclxuICAgICAgdGhpcy5zZXR1cENvbnRleHQoIGdsICk7XHJcbiAgICB9XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRha2VzIGEgZnJlc2ggV2ViR0wgY29udGV4dCBzd2l0Y2hlcyB0aGUgV2ViR0wgYmxvY2sgb3ZlciB0byB1c2UgaXQuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gICAqL1xyXG4gIHNldHVwQ29udGV4dCggZ2wgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGBzZXR1cENvbnRleHQgIyR7dGhpcy5pZH1gICk7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnB1c2goKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBnbCwgJ1Nob3VsZCBoYXZlIGFuIGFjdHVhbCBjb250ZXh0IGlmIHRoaXMgaXMgY2FsbGVkJyApO1xyXG5cclxuICAgIHRoaXMuaXNDb250ZXh0TG9zdCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9XHJcbiAgICB0aGlzLmdsID0gZ2w7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBIb3cgbXVjaCBsYXJnZXIgb3VyIENhbnZhcyB3aWxsIGJlIGNvbXBhcmVkIHRvIHRoZSBDU1MgcGl4ZWwgZGltZW5zaW9ucywgc28gdGhhdCBvdXJcclxuICAgIC8vIENhbnZhcyBtYXBzIG9uZSBvZiBpdHMgcGl4ZWxzIHRvIGEgcGh5c2ljYWwgcGl4ZWwgKGZvciBSZXRpbmEgZGV2aWNlcywgZXRjLikuXHJcbiAgICB0aGlzLmJhY2tpbmdTY2FsZSA9IFV0aWxzLmJhY2tpbmdTY2FsZSggdGhpcy5nbCApO1xyXG5cclxuICAgIC8vIERvdWJsZSB0aGUgYmFja2luZyBzY2FsZSBzaXplIGlmIHdlIGRldGVjdCBubyBidWlsdC1pbiBhbnRpYWxpYXNpbmcuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1kYy9pc3N1ZXMvMTM5IGFuZFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzg1OS5cclxuICAgIGlmICggdGhpcy5kaXNwbGF5Ll9hbGxvd0JhY2tpbmdTY2FsZUFudGlhbGlhc2luZyAmJiBnbC5nZXRQYXJhbWV0ZXIoIGdsLlNBTVBMRVMgKSA9PT0gMCApIHtcclxuICAgICAgdGhpcy5iYWNraW5nU2NhbGUgKj0gMjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5vcmlnaW5hbEJhY2tpbmdTY2FsZSA9IHRoaXMuYmFja2luZ1NjYWxlO1xyXG5cclxuICAgIFV0aWxzLmFwcGx5V2ViR0xDb250ZXh0RGVmYXVsdHMoIHRoaXMuZ2wgKTsgLy8gYmxlbmRpbmcgZGVmYXVsdHMsIGV0Yy5cclxuXHJcbiAgICAvLyBXaGVuIHRoZSBjb250ZXh0IGNoYW5nZXMsIHdlIG5lZWQgdG8gZm9yY2UgY2VydGFpbiByZWZyZXNoZXNcclxuICAgIHRoaXMubWFya0RpcnR5KCk7XHJcbiAgICB0aGlzLmRpcnR5Rml0ID0gdHJ1ZTsgLy8gRm9yY2UgcmUtZml0dGluZ1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgY29udGV4dCByZWZlcmVuY2VzIG9uIHRoZSBwcm9jZXNzb3JzXHJcbiAgICB0aGlzLmN1c3RvbVByb2Nlc3Nvci5pbml0aWFsaXplQ29udGV4dCggdGhpcy5nbCApO1xyXG4gICAgdGhpcy52ZXJ0ZXhDb2xvclBvbHlnb25zUHJvY2Vzc29yLmluaXRpYWxpemVDb250ZXh0KCB0aGlzLmdsICk7XHJcbiAgICB0aGlzLnRleHR1cmVkVHJpYW5nbGVzUHJvY2Vzc29yLmluaXRpYWxpemVDb250ZXh0KCB0aGlzLmdsICk7XHJcblxyXG4gICAgLy8gTm90aWZ5IHNwcml0ZXNoZWV0cyBvZiB0aGUgbmV3IGNvbnRleHRcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc3ByaXRlU2hlZXRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzLnNwcml0ZVNoZWV0c1sgaSBdLmluaXRpYWxpemVDb250ZXh0KCB0aGlzLmdsICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm90aWZ5IChlLmcuIFdlYkdMTm9kZSBwYWludGVycyBuZWVkIHRvIGJlIHJlY3JlYXRlZClcclxuICAgIHRoaXMuZ2xDaGFuZ2VkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIGZvcmNlIGEgQ2FudmFzIHJlYnVpbGQgdG8gZ2V0IGEgbmV3IENhbnZhcy9jb250ZXh0IHBhaXIuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkZWxheWVkUmVidWlsZENhbnZhcygpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYERlbGF5aW5nIHJlYnVpbGRpbmcgb2YgQ2FudmFzICMke3RoaXMuaWR9YCApO1xyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gVE9ETzogQ2FuIHdlIG1vdmUgdGhpcyB0byBiZWZvcmUgdGhlIHVwZGF0ZSgpIHN0ZXA/IENvdWxkIGhhcHBlbiBzYW1lLWZyYW1lIGluIHRoYXQgY2FzZS5cclxuICAgIC8vIE5PVEU6IFdlIGRvbid0IHdhbnQgdG8gcmVseSBvbiBhIGNvbW1vbiB0aW1lciwgc28gd2UncmUgdXNpbmcgdGhlIGJ1aWx0LWluIGZvcm0gb24gcHVycG9zZS5cclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWQtc2ltLXRleHRcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgRXhlY3V0aW5nIGRlbGF5ZWQgcmVidWlsZGluZyAjJHt0aGlzLmlkfWAgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcbiAgICAgIHNlbGYucmVidWlsZENhbnZhcygpO1xyXG4gICAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLnBvcCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGJhY2sgZm9yIHdoZW5ldmVyIG91ciBXZWJHTCBjb250ZXh0IGlzIGxvc3QuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7V2ViR0xDb250ZXh0RXZlbnR9IGRvbUV2ZW50XHJcbiAgICovXHJcbiAgb25Db250ZXh0TG9zcyggZG9tRXZlbnQgKSB7XHJcbiAgICBpZiAoICF0aGlzLmlzQ29udGV4dExvc3QgKSB7XHJcbiAgICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYENvbnRleHQgbG9zdCAjJHt0aGlzLmlkfWAgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICB0aGlzLmlzQ29udGV4dExvc3QgPSB0cnVlO1xyXG5cclxuICAgICAgLy8gUHJldmVudGluZyBkZWZhdWx0IGlzIHN1cGVyLWltcG9ydGFudCwgb3RoZXJ3aXNlIGl0IG5ldmVyIGF0dGVtcHRzIHRvIHJlc3RvcmUgdGhlIGNvbnRleHRcclxuICAgICAgZG9tRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHRoaXMuY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcblxyXG4gICAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxiYWNrIGZvciB3aGVuZXZlciBvdXIgV2ViR0wgY29udGV4dCBpcyByZXN0b3JlZC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtXZWJHTENvbnRleHRFdmVudH0gZG9tRXZlbnRcclxuICAgKi9cclxuICBvbkNvbnRleHRSZXN0b3JhdGlvbiggZG9tRXZlbnQgKSB7XHJcbiAgICBpZiAoIHRoaXMuaXNDb250ZXh0TG9zdCApIHtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrKCBgQ29udGV4dCByZXN0b3JlZCAjJHt0aGlzLmlkfWAgKTtcclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgICBjb25zdCBnbCA9IHRoaXMuZ2V0Q29udGV4dEZyb21DYW52YXMoIHRoaXMuY2FudmFzICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGdsLCAnV2Ugd2VyZSB0b2xkIHRoZSBjb250ZXh0IHdhcyByZXN0b3JlZCwgc28gdGhpcyBzaG91bGQgd29yaycgKTtcclxuXHJcbiAgICAgIHRoaXMuc2V0dXBDb250ZXh0KCBnbCApO1xyXG5cclxuICAgICAgdGhpcy5jYW52YXMuc3R5bGUuZGlzcGxheSA9ICcnO1xyXG5cclxuICAgICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEF0dGVtcHRzIHRvIGdldCBhIFdlYkdMIGNvbnRleHQgZnJvbSBhIENhbnZhcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH1cclxuICAgKiBAcmV0dXJucyB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fCp9IC0gSWYgZmFsc3ksIGl0IGRpZCBub3Qgc3VjY2VlZC5cclxuICAgKi9cclxuICBnZXRDb250ZXh0RnJvbUNhbnZhcyggY2FudmFzICkge1xyXG4gICAgY29uc3QgY29udGV4dE9wdGlvbnMgPSB7XHJcbiAgICAgIGFudGlhbGlhczogdHJ1ZSxcclxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiB0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlclxyXG4gICAgICAvLyBOT1RFOiB3ZSB1c2UgcHJlbXVsdGlwbGllZCBhbHBoYSBzaW5jZSBpdCBzaG91bGQgaGF2ZSBiZXR0ZXIgcGVyZm9ybWFuY2UgQU5EIGl0IGFwcGVhcnMgdG8gYmUgdGhlIG9ubHkgb25lXHJcbiAgICAgIC8vIHRydWx5IGNvbXBhdGlibGUgd2l0aCB0ZXh0dXJlIGZpbHRlcmluZy9pbnRlcnBvbGF0aW9uLlxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy8zOSwgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzM5N1xyXG4gICAgICAvLyBhbmQgaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzkzNDE1NjQvd2ViZ2wtaG93LXRvLWNvcnJlY3RseS1ibGVuZC1hbHBoYS1jaGFubmVsLXBuZ1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGNvbW1pdHRlZCB0byB1c2luZyBhIFdlYkdMQmxvY2ssIHNvIG5vIHVzZSBpbiBhIHRyeS1jYXRjaCBhcm91bmQgb3VyIGNvbnRleHQgYXR0ZW1wdFxyXG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCAnd2ViZ2wnLCBjb250ZXh0T3B0aW9ucyApIHx8IGNhbnZhcy5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJywgY29udGV4dE9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBzZXRTaXplRnVsbERpc3BsYXkoKSB7XHJcbiAgICBjb25zdCBzaXplID0gdGhpcy5kaXNwbGF5LmdldFNpemUoKTtcclxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gTWF0aC5jZWlsKCBzaXplLndpZHRoICogdGhpcy5iYWNraW5nU2NhbGUgKTtcclxuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IE1hdGguY2VpbCggc2l6ZS5oZWlnaHQgKiB0aGlzLmJhY2tpbmdTY2FsZSApO1xyXG4gICAgdGhpcy5jYW52YXMuc3R5bGUud2lkdGggPSBgJHtzaXplLndpZHRofXB4YDtcclxuICAgIHRoaXMuY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke3NpemUuaGVpZ2h0fXB4YDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBzZXRTaXplRml0Qm91bmRzKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnc2V0U2l6ZUZpdEJvdW5kcyB1bmltcGxlbWVudGVkIGZvciBXZWJHTEJsb2NrJyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgRE9NIGFwcGVhcmFuY2Ugb2YgdGhpcyBkcmF3YWJsZSAod2hldGhlciBieSBwcmVwYXJpbmcvY2FsbGluZyBkcmF3IGNhbGxzLCBET00gZWxlbWVudCB1cGRhdGVzLCBldGMuKVxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSAtIFdoZXRoZXIgdGhlIHVwZGF0ZSBzaG91bGQgY29udGludWUgKGlmIGZhbHNlLCBmdXJ0aGVyIHVwZGF0ZXMgaW4gc3VwZXJ0eXBlIHN0ZXBzIHNob3VsZCBub3RcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICBiZSBkb25lKS5cclxuICAgKi9cclxuICB1cGRhdGUoKSB7XHJcbiAgICAvLyBTZWUgaWYgd2UgbmVlZCB0byBhY3R1YWxseSB1cGRhdGUgdGhpbmdzICh3aWxsIGJhaWwgb3V0IGlmIHdlIGFyZSBub3QgZGlydHksIG9yIGlmIHdlJ3ZlIGJlZW4gZGlzcG9zZWQpXHJcbiAgICBpZiAoICFzdXBlci51cGRhdGUoKSApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYHVwZGF0ZSAjJHt0aGlzLmlkfWAgKTtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucHVzaCgpO1xyXG5cclxuICAgIGNvbnN0IGdsID0gdGhpcy5nbDtcclxuXHJcbiAgICBpZiAoIHRoaXMuaXNDb250ZXh0TG9zdCAmJiB0aGlzLmRpc3BsYXkuX2FnZ3Jlc3NpdmVDb250ZXh0UmVjcmVhdGlvbiApIHtcclxuICAgICAgdGhpcy5kZWxheWVkUmVidWlsZENhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHVwZGF0ZSBkcmF3YWJsZXMsIHNvIHRoYXQgdGhleSBoYXZlIHZlcnRleCBhcnJheXMgdXAgdG8gZGF0ZSwgZXRjLlxyXG4gICAgd2hpbGUgKCB0aGlzLmRpcnR5RHJhd2FibGVzLmxlbmd0aCApIHtcclxuICAgICAgdGhpcy5kaXJ0eURyYXdhYmxlcy5wb3AoKS51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBlbnN1cmUgc3ByaXRlIHNoZWV0IHRleHR1cmVzIGFyZSB1cC10by1kYXRlXHJcbiAgICBjb25zdCBudW1TcHJpdGVTaGVldHMgPSB0aGlzLnNwcml0ZVNoZWV0cy5sZW5ndGg7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1TcHJpdGVTaGVldHM7IGkrKyApIHtcclxuICAgICAgdGhpcy5zcHJpdGVTaGVldHNbIGkgXS51cGRhdGVUZXh0dXJlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdGVtcG9yYXJ5IGhhY2sgZm9yIHN1cHBvcnRpbmcgd2ViZ2xTY2FsZVxyXG4gICAgaWYgKCB0aGlzLmZpcnN0RHJhd2FibGUgJiZcclxuICAgICAgICAgdGhpcy5maXJzdERyYXdhYmxlID09PSB0aGlzLmxhc3REcmF3YWJsZSAmJlxyXG4gICAgICAgICB0aGlzLmZpcnN0RHJhd2FibGUubm9kZSAmJlxyXG4gICAgICAgICB0aGlzLmZpcnN0RHJhd2FibGUubm9kZS5faGludHMud2ViZ2xTY2FsZSAhPT0gbnVsbCAmJlxyXG4gICAgICAgICB0aGlzLmJhY2tpbmdTY2FsZSAhPT0gdGhpcy5vcmlnaW5hbEJhY2tpbmdTY2FsZSAqIHRoaXMuZmlyc3REcmF3YWJsZS5ub2RlLl9oaW50cy53ZWJnbFNjYWxlICkge1xyXG4gICAgICB0aGlzLmJhY2tpbmdTY2FsZSA9IHRoaXMub3JpZ2luYWxCYWNraW5nU2NhbGUgKiB0aGlzLmZpcnN0RHJhd2FibGUubm9kZS5faGludHMud2ViZ2xTY2FsZTtcclxuICAgICAgdGhpcy5kaXJ0eUZpdCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdWRwYXRlIHRoZSBmaXQgQkVGT1JFIGRyYXdpbmcsIHNpbmNlIGl0IG1heSBjaGFuZ2Ugb3VyIG9mZnNldFxyXG4gICAgdGhpcy51cGRhdGVGaXQoKTtcclxuXHJcbiAgICAvLyBmaW5hbFggPSAyICogeCAvIGRpc3BsYXkud2lkdGggLSAxXHJcbiAgICAvLyBmaW5hbFkgPSAxIC0gMiAqIHkgLyBkaXNwbGF5LmhlaWdodFxyXG4gICAgLy8gcmVzdWx0ID0gbWF0cml4ICogKCB4LCB5LCAxIClcclxuICAgIHRoaXMucHJvamVjdGlvbk1hdHJpeC5yb3dNYWpvcihcclxuICAgICAgMiAvIHRoaXMuZGlzcGxheS53aWR0aCwgMCwgLTEsXHJcbiAgICAgIDAsIC0yIC8gdGhpcy5kaXNwbGF5LmhlaWdodCwgMSxcclxuICAgICAgMCwgMCwgMSApO1xyXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4LmNvcHlUb0FycmF5KCB0aGlzLnByb2plY3Rpb25NYXRyaXhBcnJheSApO1xyXG5cclxuICAgIC8vIGlmIHdlIGNyZWF0ZWQgdGhlIGNvbnRleHQgd2l0aCBwcmVzZXJ2ZURyYXdpbmdCdWZmZXIsIHdlIG5lZWQgdG8gY2xlYXIgYmVmb3JlIHJlbmRlcmluZ1xyXG4gICAgaWYgKCB0aGlzLnByZXNlcnZlRHJhd2luZ0J1ZmZlciApIHtcclxuICAgICAgZ2wuY2xlYXIoIGdsLkNPTE9SX0JVRkZFUl9CSVQgKTtcclxuICAgIH1cclxuXHJcbiAgICBnbC52aWV3cG9ydCggMC4wLCAwLjAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyBXZSBzd2l0Y2ggYmV0d2VlbiBwcm9jZXNzb3JzIGZvciBkcmF3YWJsZXMgYmFzZWQgb24gZWFjaCBkcmF3YWJsZSdzIHdlYmdsUmVuZGVyZXIgcHJvcGVydHkuIEVhY2ggcHJvY2Vzc29yXHJcbiAgICAvLyB3aWxsIGJlIGFjdGl2YXRlZCwgd2lsbCBwcm9jZXNzIGEgY2VydGFpbiBudW1iZXIgb2YgYWRqYWNlbnQgZHJhd2FibGVzIHdpdGggdGhhdCBwcm9jZXNzb3IncyB3ZWJnbFJlbmRlcmVyLFxyXG4gICAgLy8gYW5kIHRoZW4gd2lsbCBiZSBkZWFjdGl2YXRlZC4gVGhpcyBhbGxvd3MgdXMgdG8gc3dpdGNoIGJhY2stYW5kLWZvcnRoIGJldHdlZW4gZGlmZmVyZW50IHNoYWRlciBwcm9ncmFtcyxcclxuICAgIC8vIGFuZCBhbGxvd3MgdXMgdG8gdHJpZ2dlciBkcmF3IGNhbGxzIGZvciBlYWNoIGdyb3VwaW5nIG9mIGRyYXdhYmxlcyBpbiBhbiBlZmZpY2llbnQgd2F5LlxyXG4gICAgbGV0IGN1cnJlbnRQcm9jZXNzb3IgPSBudWxsO1xyXG4gICAgLy8gSG93IG1hbnkgZHJhdyBjYWxscyBoYXZlIGJlZW4gZXhlY3V0ZWQuIElmIG5vIGRyYXcgY2FsbHMgYXJlIGV4ZWN1dGVkIHdoaWxlIHVwZGF0aW5nLCBpdCBtZWFucyBub3RoaW5nIHNob3VsZFxyXG4gICAgLy8gYmUgZHJhd24sIGFuZCB3ZSdsbCBoYXZlIHRvIG1hbnVhbGx5IGNsZWFyIHRoZSBDYW52YXMgaWYgd2UgYXJlIG5vdCBwcmVzZXJ2aW5nIHRoZSBkcmF3aW5nIGJ1ZmZlci5cclxuICAgIGxldCBjdW11bGF0aXZlRHJhd0NvdW50ID0gMDtcclxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBhbGwgb2Ygb3VyIGRyYXdhYmxlcyAobGlua2VkIGxpc3QpXHJcbiAgICAvL09IVFdPIFRPRE86IFBFUkZPUk1BTkNFOiBjcmVhdGUgYW4gYXJyYXkgZm9yIGZhc3RlciBkcmF3YWJsZSBpdGVyYXRpb24gKHRoaXMgaXMgcHJvYmFibHkgYSBoZWxsaXNoIG1lbW9yeSBhY2Nlc3MgcGF0dGVybilcclxuICAgIGZvciAoIGxldCBkcmF3YWJsZSA9IHRoaXMuZmlyc3REcmF3YWJsZTsgZHJhd2FibGUgIT09IG51bGw7IGRyYXdhYmxlID0gZHJhd2FibGUubmV4dERyYXdhYmxlICkge1xyXG4gICAgICAvLyBpZ25vcmUgaW52aXNpYmxlIGRyYXdhYmxlc1xyXG4gICAgICBpZiAoIGRyYXdhYmxlLnZpc2libGUgKSB7XHJcbiAgICAgICAgLy8gc2VsZWN0IG91ciBkZXNpcmVkIHByb2Nlc3NvclxyXG4gICAgICAgIGxldCBkZXNpcmVkUHJvY2Vzc29yID0gbnVsbDtcclxuICAgICAgICBpZiAoIGRyYXdhYmxlLndlYmdsUmVuZGVyZXIgPT09IFJlbmRlcmVyLndlYmdsVGV4dHVyZWRUcmlhbmdsZXMgKSB7XHJcbiAgICAgICAgICBkZXNpcmVkUHJvY2Vzc29yID0gdGhpcy50ZXh0dXJlZFRyaWFuZ2xlc1Byb2Nlc3NvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGRyYXdhYmxlLndlYmdsUmVuZGVyZXIgPT09IFJlbmRlcmVyLndlYmdsQ3VzdG9tICkge1xyXG4gICAgICAgICAgZGVzaXJlZFByb2Nlc3NvciA9IHRoaXMuY3VzdG9tUHJvY2Vzc29yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggZHJhd2FibGUud2ViZ2xSZW5kZXJlciA9PT0gUmVuZGVyZXIud2ViZ2xWZXJ0ZXhDb2xvclBvbHlnb25zICkge1xyXG4gICAgICAgICAgZGVzaXJlZFByb2Nlc3NvciA9IHRoaXMudmVydGV4Q29sb3JQb2x5Z29uc1Byb2Nlc3NvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZGVzaXJlZFByb2Nlc3NvciApO1xyXG5cclxuICAgICAgICAvLyBzd2FwIHByb2Nlc3NvcnMgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKCBkZXNpcmVkUHJvY2Vzc29yICE9PSBjdXJyZW50UHJvY2Vzc29yICkge1xyXG4gICAgICAgICAgLy8gZGVhY3RpdmF0ZSBhbnkgb2xkIHByb2Nlc3NvcnNcclxuICAgICAgICAgIGlmICggY3VycmVudFByb2Nlc3NvciApIHtcclxuICAgICAgICAgICAgY3VtdWxhdGl2ZURyYXdDb3VudCArPSBjdXJyZW50UHJvY2Vzc29yLmRlYWN0aXZhdGUoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBuZXcgcHJvY2Vzc29yXHJcbiAgICAgICAgICBjdXJyZW50UHJvY2Vzc29yID0gZGVzaXJlZFByb2Nlc3NvcjtcclxuICAgICAgICAgIGN1cnJlbnRQcm9jZXNzb3IuYWN0aXZhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHByb2Nlc3Mgb3VyIGN1cnJlbnQgZHJhd2FibGUgd2l0aCB0aGUgY3VycmVudCBwcm9jZXNzb3JcclxuICAgICAgICBjdXJyZW50UHJvY2Vzc29yLnByb2Nlc3NEcmF3YWJsZSggZHJhd2FibGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gZXhpdCBsb29wIGVuZCBjYXNlXHJcbiAgICAgIGlmICggZHJhd2FibGUgPT09IHRoaXMubGFzdERyYXdhYmxlICkgeyBicmVhazsgfVxyXG4gICAgfVxyXG4gICAgLy8gZGVhY3RpdmF0ZSBhbnkgcHJvY2Vzc29yIHRoYXQgc3RpbGwgaGFzIGRyYXdhYmxlcyB0aGF0IG5lZWQgdG8gYmUgaGFuZGxlZFxyXG4gICAgaWYgKCBjdXJyZW50UHJvY2Vzc29yICkge1xyXG4gICAgICBjdW11bGF0aXZlRHJhd0NvdW50ICs9IGN1cnJlbnRQcm9jZXNzb3IuZGVhY3RpdmF0ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHdlIGV4ZWN1dGVkIG5vIGRyYXcgY2FsbHMgQU5EIHdlIGFyZW4ndCBwcmVzZXJ2aW5nIHRoZSBkcmF3aW5nIGJ1ZmZlciwgd2UnbGwgbmVlZCB0byBtYW51YWxseSBjbGVhciB0aGVcclxuICAgIC8vIGRyYXdpbmcgYnVmZmVyIG91cnNlbGYuXHJcbiAgICBpZiAoIGN1bXVsYXRpdmVEcmF3Q291bnQgPT09IDAgJiYgIXRoaXMucHJlc2VydmVEcmF3aW5nQnVmZmVyICkge1xyXG4gICAgICBnbC5jbGVhciggZ2wuQ09MT1JfQlVGRkVSX0JJVCApO1xyXG4gICAgfVxyXG5cclxuICAgIGdsLmZsdXNoKCk7XHJcblxyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wb3AoKTtcclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYGRpc3Bvc2UgIyR7dGhpcy5pZH1gICk7XHJcblxyXG4gICAgLy8gVE9ETzogbWFueSB0aGluZ3MgdG8gZGlzcG9zZSE/XHJcblxyXG4gICAgLy8gY2xlYXIgcmVmZXJlbmNlc1xyXG4gICAgY2xlYW5BcnJheSggdGhpcy5kaXJ0eURyYXdhYmxlcyApO1xyXG5cclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgbWFya0RpcnR5RHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLmRpcnR5ICYmIHNjZW5lcnlMb2cuZGlydHkoIGBtYXJrRGlydHlEcmF3YWJsZSBvbiBXZWJHTEJsb2NrIyR7dGhpcy5pZH0gd2l0aCAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGRyYXdhYmxlICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhZHJhd2FibGUuaXNEaXNwb3NlZCApO1xyXG5cclxuICAgIC8vIFRPRE86IGluc3RhbmNlIGNoZWNrIHRvIHNlZSBpZiBpdCBpcyBhIGNhbnZhcyBjYWNoZSAodXN1YWxseSB3ZSBkb24ndCBuZWVkIHRvIGNhbGwgdXBkYXRlIG9uIG91ciBkcmF3YWJsZXMpXHJcbiAgICB0aGlzLmRpcnR5RHJhd2FibGVzLnB1c2goIGRyYXdhYmxlICk7XHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBhZGREcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGAjJHt0aGlzLmlkfS5hZGREcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG5cclxuICAgIHN1cGVyLmFkZERyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG5cclxuICAgIC8vIHdpbGwgdHJpZ2dlciBjaGFuZ2VzIHRvIHRoZSBzcHJpdGVzaGVldHMgZm9yIGltYWdlcywgb3IgaW5pdGlhbGl6YXRpb24gZm9yIG90aGVyc1xyXG4gICAgZHJhd2FibGUub25BZGRUb0Jsb2NrKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApIHtcclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayggYCMke3RoaXMuaWR9LnJlbW92ZURyYXdhYmxlICR7ZHJhd2FibGUudG9TdHJpbmcoKX1gICk7XHJcblxyXG4gICAgLy8gRW5zdXJlIGEgcmVtb3ZlZCBkcmF3YWJsZSBpcyBub3QgcHJlc2VudCBpbiB0aGUgZGlydHlEcmF3YWJsZXMgYXJyYXkgYWZ0ZXJ3YXJkcy4gRG9uJ3Qgd2FudCB0byB1cGRhdGUgaXQuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3NjZW5lcnkvaXNzdWVzLzYzNVxyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuICAgIHdoaWxlICggKCBpbmRleCA9IHRoaXMuZGlydHlEcmF3YWJsZXMuaW5kZXhPZiggZHJhd2FibGUsIGluZGV4ICkgKSA+PSAwICkge1xyXG4gICAgICB0aGlzLmRpcnR5RHJhd2FibGVzLnNwbGljZSggaW5kZXgsIDEgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB3aWwgdHJpZ2dlciByZW1vdmFsIGZyb20gc3ByaXRlc2hlZXRzXHJcbiAgICBkcmF3YWJsZS5vblJlbW92ZUZyb21CbG9jayggdGhpcyApO1xyXG5cclxuICAgIHN1cGVyLnJlbW92ZURyYXdhYmxlKCBkcmF3YWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5zdXJlcyB3ZSBoYXZlIGFuIGFsbG9jYXRlZCBwYXJ0IG9mIGEgU3ByaXRlU2hlZXQgZm9yIHRoaXMgaW1hZ2UuIElmIGEgU3ByaXRlU2hlZXQgYWxyZWFkeSBjb250YWlucyB0aGlzIGltYWdlLFxyXG4gICAqIHdlJ2xsIGp1c3QgaW5jcmVhc2UgdGhlIHJlZmVyZW5jZSBjb3VudC4gT3RoZXJ3aXNlLCB3ZSdsbCBhdHRlbXB0IHRvIGFkZCBpdCBpbnRvIG9uZSBvZiBvdXIgU3ByaXRlU2hlZXRzLiBJZlxyXG4gICAqIGl0IGRvZXNuJ3QgZml0LCB3ZSdsbCBhZGQgYSBuZXcgU3ByaXRlU2hlZXQgYW5kIGFkZCB0aGUgaW1hZ2UgdG8gaXQuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50IHwgSFRNTENhbnZhc0VsZW1lbnR9IGltYWdlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxyXG4gICAqXHJcbiAgICogQHJldHVybnMge1Nwcml0ZX0gLSBUaHJvd3MgYW4gZXJyb3IgaWYgd2UgY2FuJ3QgYWNjb21tb2RhdGUgdGhlIGltYWdlXHJcbiAgICovXHJcbiAgYWRkU3ByaXRlU2hlZXRJbWFnZSggaW1hZ2UsIHdpZHRoLCBoZWlnaHQgKSB7XHJcbiAgICBsZXQgc3ByaXRlID0gbnVsbDtcclxuICAgIGNvbnN0IG51bVNwcml0ZVNoZWV0cyA9IHRoaXMuc3ByaXRlU2hlZXRzLmxlbmd0aDtcclxuICAgIC8vIFRPRE86IGNoZWNrIGZvciBTcHJpdGVTaGVldCBjb250YWlubWVudCBmaXJzdD9cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVNwcml0ZVNoZWV0czsgaSsrICkge1xyXG4gICAgICBjb25zdCBzcHJpdGVTaGVldCA9IHRoaXMuc3ByaXRlU2hlZXRzWyBpIF07XHJcbiAgICAgIHNwcml0ZSA9IHNwcml0ZVNoZWV0LmFkZEltYWdlKCBpbWFnZSwgd2lkdGgsIGhlaWdodCApO1xyXG4gICAgICBpZiAoIHNwcml0ZSApIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCAhc3ByaXRlICkge1xyXG4gICAgICBjb25zdCBuZXdTcHJpdGVTaGVldCA9IG5ldyBTcHJpdGVTaGVldCggdHJ1ZSApOyAvLyB1c2UgbWlwbWFwcyBmb3Igbm93P1xyXG4gICAgICBzcHJpdGUgPSBuZXdTcHJpdGVTaGVldC5hZGRJbWFnZSggaW1hZ2UsIHdpZHRoLCBoZWlnaHQgKTtcclxuICAgICAgbmV3U3ByaXRlU2hlZXQuaW5pdGlhbGl6ZUNvbnRleHQoIHRoaXMuZ2wgKTtcclxuICAgICAgdGhpcy5zcHJpdGVTaGVldHMucHVzaCggbmV3U3ByaXRlU2hlZXQgKTtcclxuICAgICAgaWYgKCAhc3ByaXRlICkge1xyXG4gICAgICAgIC8vIFRPRE86IHJlbmRlcmVyIGZsYWdzIHNob3VsZCBjaGFuZ2UgZm9yIHZlcnkgbGFyZ2UgaW1hZ2VzXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQXR0ZW1wdCB0byBsb2FkIGltYWdlIHRoYXQgaXMgdG9vIGxhcmdlIGZvciBzcHJpdGUgc2hlZXRzJyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3ByaXRlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBzcHJpdGUgaW4gb3VyIHNwcml0ZXNoZWV0cy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge1Nwcml0ZX0gc3ByaXRlXHJcbiAgICovXHJcbiAgcmVtb3ZlU3ByaXRlU2hlZXRJbWFnZSggc3ByaXRlICkge1xyXG4gICAgc3ByaXRlLnNwcml0ZVNoZWV0LnJlbW92ZUltYWdlKCBzcHJpdGUuaW1hZ2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGZpcnN0RHJhd2FibGVcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBsYXN0RHJhd2FibGVcclxuICAgKi9cclxuICBvbkludGVydmFsQ2hhbmdlKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGAjJHt0aGlzLmlkfS5vbkludGVydmFsQ2hhbmdlICR7Zmlyc3REcmF3YWJsZS50b1N0cmluZygpfSB0byAke2xhc3REcmF3YWJsZS50b1N0cmluZygpfWAgKTtcclxuXHJcbiAgICBzdXBlci5vbkludGVydmFsQ2hhbmdlKCBmaXJzdERyYXdhYmxlLCBsYXN0RHJhd2FibGUgKTtcclxuXHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBvblBvdGVudGlhbGx5TW92ZWREcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcbiAgICBzY2VuZXJ5TG9nICYmIHNjZW5lcnlMb2cuV2ViR0xCbG9jayAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2soIGAjJHt0aGlzLmlkfS5vblBvdGVudGlhbGx5TW92ZWREcmF3YWJsZSAke2RyYXdhYmxlLnRvU3RyaW5nKCl9YCApO1xyXG4gICAgc2NlbmVyeUxvZyAmJiBzY2VuZXJ5TG9nLldlYkdMQmxvY2sgJiYgc2NlbmVyeUxvZy5wdXNoKCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUucGFyZW50RHJhd2FibGUgPT09IHRoaXMgKTtcclxuXHJcbiAgICB0aGlzLm1hcmtEaXJ0eSgpO1xyXG5cclxuICAgIHNjZW5lcnlMb2cgJiYgc2NlbmVyeUxvZy5XZWJHTEJsb2NrICYmIHNjZW5lcnlMb2cucG9wKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgc3RyaW5nIGZvcm0gb2YgdGhpcyBvYmplY3RcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIGBXZWJHTEJsb2NrIyR7dGhpcy5pZH0tJHtGaXR0ZWRCbG9jay5maXRTdHJpbmdbIHRoaXMuZml0IF19YDtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnkucmVnaXN0ZXIoICdXZWJHTEJsb2NrJywgV2ViR0xCbG9jayApO1xyXG5cclxuLyoqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxyXG4gKiBQcm9jZXNzb3JzIHJlbHkgb24gdGhlIGZvbGxvd2luZyBsaWZlY3ljbGU6XHJcbiAqIDEuIGFjdGl2YXRlKClcclxuICogMi4gcHJvY2Vzc0RyYXdhYmxlKCkgLSAwIG9yIG1vcmUgdGltZXNcclxuICogMy4gZGVhY3RpdmF0ZSgpXHJcbiAqIE9uY2UgZGVhY3RpdmF0ZWQsIHRoZXkgc2hvdWxkIGhhdmUgZXhlY3V0ZWQgYWxsIG9mIHRoZSBkcmF3IGNhbGxzIHRoZXkgbmVlZCB0byBtYWtlLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmNsYXNzIFByb2Nlc3NvciB7XHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFjdGl2YXRlKCkge1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIFdlYkdMIGNvbnRleHQgdGhhdCB0aGlzIHByb2Nlc3NvciBzaG91bGQgdXNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiBhIHNpbmdsZSBwcm9jZXNzb3IsIGluIHRoZSBjYXNlIHdoZXJlIHRoZSBwcmV2aW91cyBjb250ZXh0IHdhcyBsb3N0LlxyXG4gICAqICAgICAgIFdlIHNob3VsZCBub3QgbmVlZCB0byBkaXNwb3NlIGFueXRoaW5nIGZyb20gdGhhdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gICAqL1xyXG4gIGluaXRpYWxpemVDb250ZXh0KCBnbCApIHtcclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHByb2Nlc3NEcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGRlYWN0aXZhdGUoKSB7XHJcblxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQ3VzdG9tUHJvY2Vzc29yIGV4dGVuZHMgUHJvY2Vzc29yIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0RyYXdhYmxlfVxyXG4gICAgdGhpcy5kcmF3YWJsZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgYWN0aXZhdGUoKSB7XHJcbiAgICB0aGlzLmRyYXdDb3VudCA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0RyYXdhYmxlfSBkcmF3YWJsZVxyXG4gICAqL1xyXG4gIHByb2Nlc3NEcmF3YWJsZSggZHJhd2FibGUgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkcmF3YWJsZS53ZWJnbFJlbmRlcmVyID09PSBSZW5kZXJlci53ZWJnbEN1c3RvbSApO1xyXG5cclxuICAgIHRoaXMuZHJhd2FibGUgPSBkcmF3YWJsZTtcclxuICAgIHRoaXMuZHJhdygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRlYWN0aXZhdGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5kcmF3Q291bnQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGRyYXcoKSB7XHJcbiAgICBpZiAoIHRoaXMuZHJhd2FibGUgKSB7XHJcbiAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5kcmF3YWJsZS5kcmF3KCk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHR5cGVvZiBjb3VudCA9PT0gJ251bWJlcicgKTtcclxuICAgICAgdGhpcy5kcmF3Q291bnQgKz0gY291bnQ7XHJcbiAgICAgIHRoaXMuZHJhd2FibGUgPSBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgVmVydGV4Q29sb3JQb2x5Z29ucyBleHRlbmRzIFByb2Nlc3NvciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IHByb2plY3Rpb25NYXRyaXhBcnJheSAtIFByb2plY3Rpb24gbWF0cml4IGVudHJpZXNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcHJvamVjdGlvbk1hdHJpeEFycmF5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvamVjdGlvbk1hdHJpeEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RmxvYXQzMkFycmF5fVxyXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgPSBwcm9qZWN0aW9uTWF0cml4QXJyYXk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBJbml0aWFsIGxlbmd0aCBvZiB0aGUgdmVydGV4IGJ1ZmZlci4gTWF5IGluY3JlYXNlIGFzIG5lZWRlZC5cclxuICAgIHRoaXMubGFzdEFycmF5TGVuZ3RoID0gMTI4O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtGbG9hdDMyQXJyYXl9XHJcbiAgICB0aGlzLnZlcnRleEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5sYXN0QXJyYXlMZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIFdlYkdMIGNvbnRleHQgdGhhdCB0aGlzIHByb2Nlc3NvciBzaG91bGQgdXNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiBhIHNpbmdsZSBwcm9jZXNzb3IsIGluIHRoZSBjYXNlIHdoZXJlIHRoZSBwcmV2aW91cyBjb250ZXh0IHdhcyBsb3N0LlxyXG4gICAqICAgICAgIFdlIHNob3VsZCBub3QgbmVlZCB0byBkaXNwb3NlIGFueXRoaW5nIGZyb20gdGhhdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gICAqL1xyXG4gIGluaXRpYWxpemVDb250ZXh0KCBnbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdsLCAnU2hvdWxkIGJlIGFuIGFjdHVhbCBjb250ZXh0JyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9XHJcbiAgICB0aGlzLmdsID0gZ2w7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1NoYWRlclByb2dyYW19XHJcbiAgICB0aGlzLnNoYWRlclByb2dyYW0gPSBuZXcgU2hhZGVyUHJvZ3JhbSggZ2wsIFtcclxuICAgICAgLy8gdmVydGV4IHNoYWRlclxyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgYVZlcnRleDsnLFxyXG4gICAgICAnYXR0cmlidXRlIHZlYzQgYUNvbG9yOycsXHJcbiAgICAgICd2YXJ5aW5nIHZlYzQgdkNvbG9yOycsXHJcbiAgICAgICd1bmlmb3JtIG1hdDMgdVByb2plY3Rpb25NYXRyaXg7JyxcclxuXHJcbiAgICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICAgJyAgdkNvbG9yID0gYUNvbG9yOycsXHJcbiAgICAgICcgIHZlYzMgbmRjID0gdVByb2plY3Rpb25NYXRyaXggKiB2ZWMzKCBhVmVydGV4LCAxLjAgKTsnLCAvLyBob21vZ2VuZW91cyBtYXAgdG8gdG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXNcclxuICAgICAgJyAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBuZGMueHksIDAuMCwgMS4wICk7JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oICdcXG4nICksIFtcclxuICAgICAgLy8gZnJhZ21lbnQgc2hhZGVyXHJcbiAgICAgICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxyXG4gICAgICAndmFyeWluZyB2ZWM0IHZDb2xvcjsnLFxyXG5cclxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICAgICAvLyBOT1RFOiBQcmVtdWx0aXBseWluZyBhbHBoYSBoZXJlIGlzIG5lZWRlZCBzaW5jZSB3ZSdyZSBnb2luZyBiYWNrIHRvIHRoZSBzdGFuZGFyZCBibGVuZCBmdW5jdGlvbnMuXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LXNrYXRlLXBhcmsvaXNzdWVzLzM5LCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMzk3XHJcbiAgICAgIC8vIGFuZCBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zOTM0MTU2NC93ZWJnbC1ob3ctdG8tY29ycmVjdGx5LWJsZW5kLWFscGhhLWNoYW5uZWwtcG5nXHJcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHZlYzQoIHZDb2xvci5yZ2IgKiB2Q29sb3IuYSwgdkNvbG9yLmEgKTsnLFxyXG4gICAgICAnfSdcclxuICAgIF0uam9pbiggJ1xcbicgKSwge1xyXG4gICAgICBhdHRyaWJ1dGVzOiBbICdhVmVydGV4JywgJ2FDb2xvcicgXSxcclxuICAgICAgdW5pZm9ybXM6IFsgJ3VQcm9qZWN0aW9uTWF0cml4JyBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1dlYkdMQnVmZmVyfVxyXG4gICAgdGhpcy52ZXJ0ZXhCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XHJcbiAgICBnbC5idWZmZXJEYXRhKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QXJyYXksIGdsLkRZTkFNSUNfRFJBVyApOyAvLyBmdWxseSBidWZmZXIgYXQgdGhlIHN0YXJ0XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgYWN0aXZhdGUoKSB7XHJcbiAgICB0aGlzLnNoYWRlclByb2dyYW0udXNlKCk7XHJcblxyXG4gICAgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ID0gMDtcclxuICAgIHRoaXMuZHJhd0NvdW50ID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7RHJhd2FibGV9IGRyYXdhYmxlXHJcbiAgICovXHJcbiAgcHJvY2Vzc0RyYXdhYmxlKCBkcmF3YWJsZSApIHtcclxuICAgIGlmICggZHJhd2FibGUuaW5jbHVkZVZlcnRpY2VzICkge1xyXG4gICAgICBjb25zdCB2ZXJ0ZXhEYXRhID0gZHJhd2FibGUudmVydGV4QXJyYXk7XHJcblxyXG4gICAgICAvLyBpZiBvdXIgdmVydGV4IGRhdGEgd29uJ3QgZml0LCBrZWVwIGRvdWJsaW5nIHRoZSBzaXplIHVudGlsIGl0IGZpdHNcclxuICAgICAgd2hpbGUgKCB2ZXJ0ZXhEYXRhLmxlbmd0aCArIHRoaXMudmVydGV4QXJyYXlJbmRleCA+IHRoaXMudmVydGV4QXJyYXkubGVuZ3RoICkge1xyXG4gICAgICAgIGNvbnN0IG5ld1ZlcnRleEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy52ZXJ0ZXhBcnJheS5sZW5ndGggKiAyICk7XHJcbiAgICAgICAgbmV3VmVydGV4QXJyYXkuc2V0KCB0aGlzLnZlcnRleEFycmF5ICk7XHJcbiAgICAgICAgdGhpcy52ZXJ0ZXhBcnJheSA9IG5ld1ZlcnRleEFycmF5O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBjb3B5IG91ciB2ZXJ0ZXggZGF0YSBpbnRvIHRoZSBtYWluIGFycmF5XHJcbiAgICAgIHRoaXMudmVydGV4QXJyYXkuc2V0KCB2ZXJ0ZXhEYXRhLCB0aGlzLnZlcnRleEFycmF5SW5kZXggKTtcclxuICAgICAgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICs9IHZlcnRleERhdGEubGVuZ3RoO1xyXG5cclxuICAgICAgdGhpcy5kcmF3Q291bnQrKztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkZWFjdGl2YXRlKCkge1xyXG4gICAgaWYgKCB0aGlzLmRyYXdDb3VudCApIHtcclxuICAgICAgdGhpcy5kcmF3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtLnVudXNlKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuZHJhd0NvdW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBkcmF3KCkge1xyXG4gICAgY29uc3QgZ2wgPSB0aGlzLmdsO1xyXG5cclxuICAgIC8vICh1bmlmb3JtKSBwcm9qZWN0aW9uIHRyYW5zZm9ybSBpbnRvIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXHJcbiAgICBnbC51bmlmb3JtTWF0cml4M2Z2KCB0aGlzLnNoYWRlclByb2dyYW0udW5pZm9ybUxvY2F0aW9ucy51UHJvamVjdGlvbk1hdHJpeCwgZmFsc2UsIHRoaXMucHJvamVjdGlvbk1hdHJpeEFycmF5ICk7XHJcblxyXG4gICAgZ2wuYmluZEJ1ZmZlciggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEJ1ZmZlciApO1xyXG4gICAgLy8gaWYgd2UgaW5jcmVhc2VkIGluIGxlbmd0aCwgd2UgbmVlZCB0byBkbyBhIGZ1bGwgYnVmZmVyRGF0YSB0byByZXNpemUgaXQgb24gdGhlIEdQVSBzaWRlXHJcbiAgICBpZiAoIHRoaXMudmVydGV4QXJyYXkubGVuZ3RoID4gdGhpcy5sYXN0QXJyYXlMZW5ndGggKSB7XHJcbiAgICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhBcnJheSwgZ2wuRFlOQU1JQ19EUkFXICk7IC8vIGZ1bGx5IGJ1ZmZlciBhdCB0aGUgc3RhcnRcclxuICAgIH1cclxuICAgIC8vIG90aGVyd2lzZSBkbyBhIG1vcmUgZWZmaWNpZW50IHVwZGF0ZSB0aGF0IG9ubHkgc2VuZHMgcGFydCBvZiB0aGUgYXJyYXkgb3ZlclxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgMCwgdGhpcy52ZXJ0ZXhBcnJheS5zdWJhcnJheSggMCwgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICkgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNpemVPZkZsb2F0ID0gRmxvYXQzMkFycmF5LkJZVEVTX1BFUl9FTEVNRU5UO1xyXG4gICAgY29uc3Qgc3RyaWRlID0gNiAqIHNpemVPZkZsb2F0O1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlciggdGhpcy5zaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hVmVydGV4LCAyLCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSwgMCAqIHNpemVPZkZsb2F0ICk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCB0aGlzLnNoYWRlclByb2dyYW0uYXR0cmlidXRlTG9jYXRpb25zLmFDb2xvciwgNCwgZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDIgKiBzaXplT2ZGbG9hdCApO1xyXG5cclxuICAgIGdsLmRyYXdBcnJheXMoIGdsLlRSSUFOR0xFUywgMCwgdGhpcy52ZXJ0ZXhBcnJheUluZGV4IC8gNiApO1xyXG5cclxuICAgIHRoaXMudmVydGV4QXJyYXlJbmRleCA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBUZXh0dXJlZFRyaWFuZ2xlc1Byb2Nlc3NvciBleHRlbmRzIFByb2Nlc3NvciB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IHByb2plY3Rpb25NYXRyaXhBcnJheSAtIFByb2plY3Rpb24gbWF0cml4IGVudHJpZXNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcHJvamVjdGlvbk1hdHJpeEFycmF5ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvamVjdGlvbk1hdHJpeEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICk7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7RmxvYXQzMkFycmF5fVxyXG4gICAgdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgPSBwcm9qZWN0aW9uTWF0cml4QXJyYXk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge251bWJlcn0gLSBJbml0aWFsIGxlbmd0aCBvZiB0aGUgdmVydGV4IGJ1ZmZlci4gTWF5IGluY3JlYXNlIGFzIG5lZWRlZC5cclxuICAgIHRoaXMubGFzdEFycmF5TGVuZ3RoID0gMTI4O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtGbG9hdDMyQXJyYXl9XHJcbiAgICB0aGlzLnZlcnRleEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5sYXN0QXJyYXlMZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIFdlYkdMIGNvbnRleHQgdGhhdCB0aGlzIHByb2Nlc3NvciBzaG91bGQgdXNlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKlxyXG4gICAqIE5PVEU6IFRoaXMgY2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyBvbiBhIHNpbmdsZSBwcm9jZXNzb3IsIGluIHRoZSBjYXNlIHdoZXJlIHRoZSBwcmV2aW91cyBjb250ZXh0IHdhcyBsb3N0LlxyXG4gICAqICAgICAgIFdlIHNob3VsZCBub3QgbmVlZCB0byBkaXNwb3NlIGFueXRoaW5nIGZyb20gdGhhdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxyXG4gICAqL1xyXG4gIGluaXRpYWxpemVDb250ZXh0KCBnbCApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdsLCAnU2hvdWxkIGJlIGFuIGFjdHVhbCBjb250ZXh0JyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9XHJcbiAgICB0aGlzLmdsID0gZ2w7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1NoYWRlclByb2dyYW19XHJcbiAgICB0aGlzLnNoYWRlclByb2dyYW0gPSBuZXcgU2hhZGVyUHJvZ3JhbSggZ2wsIFtcclxuICAgICAgLy8gdmVydGV4IHNoYWRlclxyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgYVZlcnRleDsnLFxyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDsnLFxyXG4gICAgICAnYXR0cmlidXRlIGZsb2F0IGFBbHBoYTsnLFxyXG4gICAgICAndmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7JyxcclxuICAgICAgJ3ZhcnlpbmcgZmxvYXQgdkFscGhhOycsXHJcbiAgICAgICd1bmlmb3JtIG1hdDMgdVByb2plY3Rpb25NYXRyaXg7JyxcclxuXHJcbiAgICAgICd2b2lkIG1haW4oKSB7JyxcclxuICAgICAgJyAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7JyxcclxuICAgICAgJyAgdkFscGhhID0gYUFscGhhOycsXHJcbiAgICAgICcgIHZlYzMgbmRjID0gdVByb2plY3Rpb25NYXRyaXggKiB2ZWMzKCBhVmVydGV4LCAxLjAgKTsnLCAvLyBob21vZ2VuZW91cyBtYXAgdG8gdG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXNcclxuICAgICAgJyAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBuZGMueHksIDAuMCwgMS4wICk7JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oICdcXG4nICksIFtcclxuICAgICAgLy8gZnJhZ21lbnQgc2hhZGVyXHJcbiAgICAgICdwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDsnLFxyXG4gICAgICAndmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7JyxcclxuICAgICAgJ3ZhcnlpbmcgZmxvYXQgdkFscGhhOycsXHJcbiAgICAgICd1bmlmb3JtIHNhbXBsZXIyRCB1VGV4dHVyZTsnLFxyXG5cclxuICAgICAgJ3ZvaWQgbWFpbigpIHsnLFxyXG4gICAgICAnICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKCB1VGV4dHVyZSwgdlRleHR1cmVDb29yZCwgLTAuNyApOycsIC8vIG1pcG1hcCBMT0QgYmlhcyBvZiAtMC43IChmb3Igbm93KVxyXG4gICAgICAnICBjb2xvci5hICo9IHZBbHBoYTsnLFxyXG4gICAgICAnICBnbF9GcmFnQ29sb3IgPSBjb2xvcjsnLCAvLyBkb24ndCBwcmVtdWx0aXBseSBhbHBoYSAod2UgYXJlIGxvYWRpbmcgdGhlIHRleHR1cmVzIGFzIHByZW11bHRpcGxpZWQgYWxyZWFkeSlcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oICdcXG4nICksIHtcclxuICAgICAgLy8gYXR0cmlidXRlczogWyAnYVZlcnRleCcsICdhVGV4dHVyZUNvb3JkJyBdLFxyXG4gICAgICBhdHRyaWJ1dGVzOiBbICdhVmVydGV4JywgJ2FUZXh0dXJlQ29vcmQnLCAnYUFscGhhJyBdLFxyXG4gICAgICB1bmlmb3JtczogWyAndVRleHR1cmUnLCAndVByb2plY3Rpb25NYXRyaXgnIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7V2ViR0xCdWZmZXJ9XHJcbiAgICB0aGlzLnZlcnRleEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG5cclxuICAgIGdsLmJpbmRCdWZmZXIoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIgKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhBcnJheSwgZ2wuRFlOQU1JQ19EUkFXICk7IC8vIGZ1bGx5IGJ1ZmZlciBhdCB0aGUgc3RhcnRcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBhY3RpdmF0ZSgpIHtcclxuICAgIHRoaXMuc2hhZGVyUHJvZ3JhbS51c2UoKTtcclxuXHJcbiAgICB0aGlzLmN1cnJlbnRTcHJpdGVTaGVldCA9IG51bGw7XHJcbiAgICB0aGlzLnZlcnRleEFycmF5SW5kZXggPSAwO1xyXG4gICAgdGhpcy5kcmF3Q291bnQgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtEcmF3YWJsZX0gZHJhd2FibGVcclxuICAgKi9cclxuICBwcm9jZXNzRHJhd2FibGUoIGRyYXdhYmxlICkge1xyXG4gICAgLy8gc2tpcCB1bmxvYWRlZCBpbWFnZXMgb3Igc3ByaXRlc1xyXG4gICAgaWYgKCAhZHJhd2FibGUuc3ByaXRlICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZHJhd2FibGUud2ViZ2xSZW5kZXJlciA9PT0gUmVuZGVyZXIud2ViZ2xUZXh0dXJlZFRyaWFuZ2xlcyApO1xyXG4gICAgaWYgKCB0aGlzLmN1cnJlbnRTcHJpdGVTaGVldCAmJiBkcmF3YWJsZS5zcHJpdGUuc3ByaXRlU2hlZXQgIT09IHRoaXMuY3VycmVudFNwcml0ZVNoZWV0ICkge1xyXG4gICAgICB0aGlzLmRyYXcoKTtcclxuICAgIH1cclxuICAgIHRoaXMuY3VycmVudFNwcml0ZVNoZWV0ID0gZHJhd2FibGUuc3ByaXRlLnNwcml0ZVNoZWV0O1xyXG5cclxuICAgIGNvbnN0IHZlcnRleERhdGEgPSBkcmF3YWJsZS52ZXJ0ZXhBcnJheTtcclxuXHJcbiAgICAvLyBpZiBvdXIgdmVydGV4IGRhdGEgd29uJ3QgZml0LCBrZWVwIGRvdWJsaW5nIHRoZSBzaXplIHVudGlsIGl0IGZpdHNcclxuICAgIHdoaWxlICggdmVydGV4RGF0YS5sZW5ndGggKyB0aGlzLnZlcnRleEFycmF5SW5kZXggPiB0aGlzLnZlcnRleEFycmF5Lmxlbmd0aCApIHtcclxuICAgICAgY29uc3QgbmV3VmVydGV4QXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KCB0aGlzLnZlcnRleEFycmF5Lmxlbmd0aCAqIDIgKTtcclxuICAgICAgbmV3VmVydGV4QXJyYXkuc2V0KCB0aGlzLnZlcnRleEFycmF5ICk7XHJcbiAgICAgIHRoaXMudmVydGV4QXJyYXkgPSBuZXdWZXJ0ZXhBcnJheTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb3B5IG91ciB2ZXJ0ZXggZGF0YSBpbnRvIHRoZSBtYWluIGFycmF5XHJcbiAgICB0aGlzLnZlcnRleEFycmF5LnNldCggdmVydGV4RGF0YSwgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ICk7XHJcbiAgICB0aGlzLnZlcnRleEFycmF5SW5kZXggKz0gdmVydGV4RGF0YS5sZW5ndGg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgZGVhY3RpdmF0ZSgpIHtcclxuICAgIGlmICggdGhpcy5jdXJyZW50U3ByaXRlU2hlZXQgKSB7XHJcbiAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2hhZGVyUHJvZ3JhbS51bnVzZSgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzLmRyYXdDb3VudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZHJhdygpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY3VycmVudFNwcml0ZVNoZWV0ICk7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XHJcblxyXG4gICAgLy8gKHVuaWZvcm0pIHByb2plY3Rpb24gdHJhbnNmb3JtIGludG8gbm9ybWFsaXplZCBkZXZpY2UgY29vcmRpbmF0ZXNcclxuICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYoIHRoaXMuc2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVQcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgdGhpcy5wcm9qZWN0aW9uTWF0cml4QXJyYXkgKTtcclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKCBnbC5BUlJBWV9CVUZGRVIsIHRoaXMudmVydGV4QnVmZmVyICk7XHJcbiAgICAvLyBpZiB3ZSBpbmNyZWFzZWQgaW4gbGVuZ3RoLCB3ZSBuZWVkIHRvIGRvIGEgZnVsbCBidWZmZXJEYXRhIHRvIHJlc2l6ZSBpdCBvbiB0aGUgR1BVIHNpZGVcclxuICAgIGlmICggdGhpcy52ZXJ0ZXhBcnJheS5sZW5ndGggPiB0aGlzLmxhc3RBcnJheUxlbmd0aCApIHtcclxuICAgICAgZ2wuYnVmZmVyRGF0YSggZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleEFycmF5LCBnbC5EWU5BTUlDX0RSQVcgKTsgLy8gZnVsbHkgYnVmZmVyIGF0IHRoZSBzdGFydFxyXG4gICAgfVxyXG4gICAgLy8gb3RoZXJ3aXNlIGRvIGEgbW9yZSBlZmZpY2llbnQgdXBkYXRlIHRoYXQgb25seSBzZW5kcyBwYXJ0IG9mIHRoZSBhcnJheSBvdmVyXHJcbiAgICBlbHNlIHtcclxuICAgICAgZ2wuYnVmZmVyU3ViRGF0YSggZ2wuQVJSQVlfQlVGRkVSLCAwLCB0aGlzLnZlcnRleEFycmF5LnN1YmFycmF5KCAwLCB0aGlzLnZlcnRleEFycmF5SW5kZXggKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG51bUNvbXBvbmVudHMgPSA1O1xyXG4gICAgY29uc3Qgc2l6ZU9mRmxvYXQgPSBGbG9hdDMyQXJyYXkuQllURVNfUEVSX0VMRU1FTlQ7XHJcbiAgICBjb25zdCBzdHJpZGUgPSBudW1Db21wb25lbnRzICogc2l6ZU9mRmxvYXQ7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCB0aGlzLnNoYWRlclByb2dyYW0uYXR0cmlidXRlTG9jYXRpb25zLmFWZXJ0ZXgsIDIsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCAwICogc2l6ZU9mRmxvYXQgKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHRoaXMuc2hhZGVyUHJvZ3JhbS5hdHRyaWJ1dGVMb2NhdGlvbnMuYVRleHR1cmVDb29yZCwgMiwgZ2wuRkxPQVQsIGZhbHNlLCBzdHJpZGUsIDIgKiBzaXplT2ZGbG9hdCApO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlciggdGhpcy5zaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hQWxwaGEsIDEsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCA0ICogc2l6ZU9mRmxvYXQgKTtcclxuXHJcbiAgICBnbC5hY3RpdmVUZXh0dXJlKCBnbC5URVhUVVJFMCApO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIHRoaXMuY3VycmVudFNwcml0ZVNoZWV0LnRleHR1cmUgKTtcclxuICAgIGdsLnVuaWZvcm0xaSggdGhpcy5zaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVRleHR1cmUsIDAgKTtcclxuXHJcbiAgICBnbC5kcmF3QXJyYXlzKCBnbC5UUklBTkdMRVMsIDAsIHRoaXMudmVydGV4QXJyYXlJbmRleCAvIG51bUNvbXBvbmVudHMgKTtcclxuXHJcbiAgICBnbC5iaW5kVGV4dHVyZSggZ2wuVEVYVFVSRV8yRCwgbnVsbCApO1xyXG5cclxuICAgIHRoaXMuZHJhd0NvdW50Kys7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50U3ByaXRlU2hlZXQgPSBudWxsO1xyXG4gICAgdGhpcy52ZXJ0ZXhBcnJheUluZGV4ID0gMDtcclxuICB9XHJcbn1cclxuXHJcblBvb2xhYmxlLm1peEludG8oIFdlYkdMQmxvY2sgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdlYkdMQmxvY2s7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0saUNBQWlDO0FBQ3pELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsVUFBVSxNQUFNLHFDQUFxQztBQUM1RCxPQUFPQyxRQUFRLE1BQU0sbUNBQW1DO0FBQ3hELFNBQVNDLFdBQVcsRUFBRUMsUUFBUSxFQUFFQyxPQUFPLEVBQUVDLGFBQWEsRUFBRUMsV0FBVyxFQUFFQyxLQUFLLFFBQVEsZUFBZTtBQUVqRyxNQUFNQyxVQUFVLFNBQVNOLFdBQVcsQ0FBQztFQUNuQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxxQkFBcUIsRUFBRUMsa0JBQWtCLEVBQUc7SUFDMUUsS0FBSyxDQUFDLENBQUM7SUFFUCxJQUFJLENBQUNDLFVBQVUsQ0FB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