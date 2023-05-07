// Copyright 2015-2022, University of Colorado Boulder

/**
 * A WebGL Scenery node that is used to render the sodium and potassium particles, a.k.a. ions, that need to be
 * portrayed in the Neuron simulation.  This node exists as an optimization, since representing every particle as an
 * individual Scenery node proved to be far too computationally intensive.
 *
 * In this node, particles are rendered using a texture that is created on a canvas.  The texture exists as a separate
 * class.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { ShaderProgram, WebGLNode } from '../../../../scenery/js/imports.js';
import neuron from '../../neuron.js';
import ParticleType from '../model/ParticleType.js';
import NeuronParticlesTexture from './NeuronParticlesTexture.js';

// constants
const MAX_PARTICLES = 2000; // several trials were run and peak number of particles was 1841, so this value should be safe
const VERTICES_PER_PARTICLE = 4; // basically one per corner of the rectangle that encloses the particle
const POSITION_VALUES_PER_VERTEX = 2; // x and y, z is considered to be always 1
const TEXTURE_VALUES_PER_VERTEX = 2; // x and y coordinates within the 2D texture
const OPACITY_VALUES_PER_VERTEX = 1; // a single value from 0 to 1
const scratchFloatArray = new Float32Array(9);
class ParticlesWebGLNode extends WebGLNode {
  /**
   * @param {NeuronModel} neuronModel
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Property.<Matrix3>} zoomMatrixProperty - a matrix that tracks how zoomed in or out this node is, used to
   * determine whether a given particle needs to be rendered
   * @param {Shape} bounds
   */
  constructor(neuronModel, modelViewTransform, zoomMatrixProperty, bounds) {
    super(ParticlesPainter, {
      canvasBounds: bounds
    });

    // Keep references to the things that needed in order to render the particles.
    this.neuronModel = neuronModel; // @private
    this.modelViewTransform = modelViewTransform; // @private
    this.viewTransformationMatrix = modelViewTransform.getMatrix(); // @private
    this.zoomMatrixProperty = zoomMatrixProperty; // @private
    this.particleBounds = bounds; // @private

    // Create the texture for the particles.
    this.particlesTexture = new NeuronParticlesTexture(modelViewTransform); // @private

    // @private - pre-allocated arrays and values that are reused for better performance
    this.vertexData = new Float32Array(MAX_PARTICLES * VERTICES_PER_PARTICLE * (POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX + OPACITY_VALUES_PER_VERTEX));
    this.elementData = new Uint16Array(MAX_PARTICLES * (VERTICES_PER_PARTICLE + 2));
    this.particleData = new Array(MAX_PARTICLES);

    // pre-calculate the texture coordinates for the two different particle types
    this.sodiumTextureCoords = this.particlesTexture.getTexCoords(ParticleType.SODIUM_ION);
    this.potassiumTextureCoords = this.particlesTexture.getTexCoords(ParticleType.POTASSIUM_ION);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      // For better performance, the array of particle data objects is initialized here and the values updated rather
      // than reallocated during each update.
      this.particleData[i] = {
        pos: new Vector2(0, 0),
        radius: 1,
        type: null,
        opacity: 1
      };

      // Also for better performance, the element data is initialized at the start for the max number of particles.
      const indexBase = i * 6;
      const valueBase = i * 4;
      this.elementData[indexBase] = valueBase;
      this.elementData[indexBase + 1] = valueBase + 1;
      this.elementData[indexBase + 2] = valueBase + 2;
      this.elementData[indexBase + 3] = valueBase + 3;
      if (i + 1 < MAX_PARTICLES) {
        // Add the 'degenerate triangle' that will force a discontinuity in the triangle strip.
        this.elementData[indexBase + 4] = valueBase + 3;
        this.elementData[indexBase + 5] = valueBase + 4;
      }
    }
    this.numActiveParticles = 0; // @private

    // initial update
    this.updateParticleData();

    // monitor a property that indicates when a particle state has changed and initiate a redraw
    neuronModel.particlesMoved.addListener(() => {
      this.invalidatePaint();
    });

    // monitor a property that indicates whether all ions are being depicted and initiate a redraw on a change
    neuronModel.allIonsSimulatedProperty.lazyLink(() => {
      this.invalidatePaint();
    });

    // monitor a property that indicates when the zoom level and changes and initiate a redraw
    zoomMatrixProperty.lazyLink(() => {
      this.invalidatePaint();
    });

    /**
     * There is an issue in Scenery where, if nothing is drawn, whatever was previously drawn stays there.  This was
     * causing problems in this sim when turning off the "Show All Ions" setting, see
     * https://github.com/phetsims/neuron/issues/100.  The Scenery issue is
     * https://github.com/phetsims/scenery/issues/503.  To work around this problem, a property was added to the model
     * and linked here that can be used to set the node invisible if there are no particles to be rendered.  This can
     * probably be removed if and when the Scenery issue is addressed.
     */
    neuronModel.atLeastOneParticlePresentProperty.lazyLink(atLeastOneParticlePresent => {
      this.visible = atLeastOneParticlePresent;
      this.invalidatePaint();
    });
  }

  /**
   * Check if the provided particle is in the current rendering bounds and, if so, create a particle data object and
   * add it to the list that will be converted into vertex data in a subsequent step.
   * @param {Particle} particle
   * @private
   */
  addParticleData(particle) {
    const xPos = this.modelViewTransform.modelToViewX(particle.positionX);
    const yPos = this.modelViewTransform.modelToViewY(particle.positionY);
    const radius = this.modelViewTransform.modelToViewDeltaX(particle.getRadius());

    // Figure out the position and radius of the zoomed particle.
    const zoomMatrix = this.zoomMatrixProperty.value;
    const zoomedXPos = zoomMatrix.m00() * xPos + zoomMatrix.m02();
    const zoomedYPos = zoomMatrix.m11() * yPos + zoomMatrix.m12();
    const zoomedRadius = zoomMatrix.m00() * radius;

    // Only add the particle if its zoomed position is within the bounds being shown.
    if (this.particleBounds.containsCoordinates(zoomedXPos, zoomedYPos)) {
      const particleDataEntry = this.particleData[this.numActiveParticles];
      particleDataEntry.pos.setXY(zoomedXPos, zoomedYPos);
      particleDataEntry.radius = zoomedRadius;
      particleDataEntry.type = particle.getType();
      particleDataEntry.opacity = particle.getOpacity();
      assert && assert(this.numActiveParticles < MAX_PARTICLES - 1);
      this.numActiveParticles = Math.min(this.numActiveParticles + 1, MAX_PARTICLES);
    }
  }

  /**
   * Update the representation shown in the canvas based on the model state.  This is intended to be called any time
   * one or more particles move in a given time step, which means once per frame or less.
   * @private
   */
  updateParticleData() {
    this.numActiveParticles = 0;

    // For better performance, we loop over the arrays contained within the observable arrays rather than using the
    // forEach function.  This is much more efficient.  Note that this is only safe if no mods are made to the
    // contents of the observable array.

    let i;
    let particleArray = this.neuronModel.backgroundParticles;
    for (i = 0; i < particleArray.length; i++) {
      this.addParticleData(particleArray[i]);
    }
    particleArray = this.neuronModel.transientParticles;
    for (i = 0; i < particleArray.length; i++) {
      this.addParticleData(particleArray[i]);
    }
    particleArray = this.neuronModel.playbackParticles;
    for (i = 0; i < particleArray.length; i++) {
      this.addParticleData(particleArray[i]);
    }
  }
}
neuron.register('ParticlesWebGLNode', ParticlesWebGLNode);
class ParticlesPainter {
  /**
   * Constructor for the object that will do the actual painting for this node.  This constructor, rather than an
   * instance, is passed to the parent WebGLNode type.
   * @param {WebGLRenderingContext} gl
   * @param {WaveWebGLNode} node
   */
  constructor(gl, node) {
    this.gl = gl;
    this.node = node;

    // vertex shader
    const vertexShaderSource = ['attribute vec2 aPosition;', 'attribute vec2 aTextureCoordinate;', 'attribute float aOpacity;', 'varying vec2 vTextureCoordinate;', 'varying float vOpacity;', 'uniform mat3 uModelViewMatrix;', 'uniform mat3 uProjectionMatrix;', 'void main( void ) {',
    // homogeneous model-view transformation
    '  vec3 view = uModelViewMatrix * vec3( aPosition.xy, 1 );',
    // homogeneous map to to normalized device coordinates
    '  vec3 ndc = uProjectionMatrix * vec3( view.xy, 1 );',
    // texture coordinate
    '  vTextureCoordinate = aTextureCoordinate;',
    // opacity
    '  vOpacity = aOpacity;',
    // assume a z value of 1 for the position
    '  gl_Position = vec4( ndc.xy, 1.0, 1.0 );', '}'].join('\n');

    // fragment shader
    const fragmentShaderSource = ['precision mediump float;', 'varying vec2 vTextureCoordinate;', 'varying float vOpacity;', 'uniform sampler2D uSampler;', 'void main( void ) {', '  gl_FragColor = texture2D( uSampler, vTextureCoordinate );', '  gl_FragColor.a *= vOpacity;',
    // Use premultipled alpha, see https://github.com/phetsims/energy-skate-park/issues/39
    '  gl_FragColor.rgb *= gl_FragColor.a;', '}'].join('\n');
    this.shaderProgram = new ShaderProgram(gl, vertexShaderSource, fragmentShaderSource, {
      attributes: ['aPosition', 'aTextureCoordinate', 'aOpacity'],
      uniforms: ['uModelViewMatrix', 'uProjectionMatrix']
    });
    this.texture = gl.createTexture();
    this.vertexBuffer = gl.createBuffer();
    this.elementBuffer = gl.createBuffer();

    // bind the texture that contains the particle images
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // Texture filtering, see http://learningwebgl.com/blog/?p=571
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    // ship the texture data to the GPU
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.node.particlesTexture.canvas);

    // generate a mipmap for better handling of zoom in/out
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  /**
   * @public
   *
   * @param {Matrix3} modelViewMatrix
   * @param {Matrix3} projectionMatrix
   * @returns {WebGLNode.PAINTED_SOMETHING}
   */
  paint(modelViewMatrix, projectionMatrix) {
    const gl = this.gl;
    const shaderProgram = this.shaderProgram;
    let i; // loop index

    this.node.updateParticleData();

    // Convert particle data to vertices that represent a rectangle plus texture coordinates.
    let vertexDataIndex = 0;
    for (i = 0; i < this.node.numActiveParticles; i++) {
      // convenience var
      const particleDatum = this.node.particleData[i];

      // Tweak Alert!  The radii of the particles are adjusted here in order to look correct.
      let adjustedParticleRadius;
      let textureCoordinates;
      if (particleDatum.type === ParticleType.SODIUM_ION) {
        adjustedParticleRadius = particleDatum.radius * 1.9;
        textureCoordinates = this.node.sodiumTextureCoords;
      } else if (particleDatum.type === ParticleType.POTASSIUM_ION) {
        adjustedParticleRadius = particleDatum.radius * 2.1;
        textureCoordinates = this.node.potassiumTextureCoords;
      }

      //-------------------------------------------------------------------------------------------------------------
      // Add the vertex data.  Though WebGL uses 3 component vectors, this only assigns x and y values because z is
      // assumed to be 1.  This is not done in a loop in order to get optimal performance.
      //-------------------------------------------------------------------------------------------------------------

      // upper left vertex position
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.x - adjustedParticleRadius;
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.y - adjustedParticleRadius;

      // texture coordinate, which is a 2-component vector
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.minX; // x texture coordinate
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.minY; // y texture coordinate

      // opacity, which is a single value
      this.node.vertexData[vertexDataIndex++] = particleDatum.opacity;

      // lower left vertex position
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.x - adjustedParticleRadius;
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.y + adjustedParticleRadius;

      // texture coordinate, which is a 2-component vector
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.minX; // x texture coordinate
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.maxY; // y texture coordinate

      // opacity, which is a single value
      this.node.vertexData[vertexDataIndex++] = particleDatum.opacity;

      // upper right vertex position
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.x + adjustedParticleRadius;
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.y - adjustedParticleRadius;

      // texture coordinate, which is a 2-component vector
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.maxX; // x texture coordinate
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.minY; // y texture coordinate

      // opacity, which is a single value
      this.node.vertexData[vertexDataIndex++] = particleDatum.opacity;

      // lower right vertex position
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.x + adjustedParticleRadius;
      this.node.vertexData[vertexDataIndex++] = particleDatum.pos.y + adjustedParticleRadius;

      // texture coordinate, which is a 2-component vector
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.maxX; // x texture coordinate
      this.node.vertexData[vertexDataIndex++] = textureCoordinates.maxY; // y texture coordinate

      // opacity, which is a single value
      this.node.vertexData[vertexDataIndex++] = particleDatum.opacity;
    }

    // Load the vertex data into the GPU.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.node.vertexData, gl.DYNAMIC_DRAW);

    // Set up the attributes that will be passed into the vertex shader.
    const elementSize = Float32Array.BYTES_PER_ELEMENT;
    const elementsPerVertex = POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX + OPACITY_VALUES_PER_VERTEX;
    const stride = elementSize * elementsPerVertex;
    gl.vertexAttribPointer(shaderProgram.attributeLocations.aPosition, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribPointer(shaderProgram.attributeLocations.aTextureCoordinate, 2, gl.FLOAT, false, stride, elementSize * TEXTURE_VALUES_PER_VERTEX);
    gl.vertexAttribPointer(shaderProgram.attributeLocations.aOpacity, 1, gl.FLOAT, false, stride, elementSize * (POSITION_VALUES_PER_VERTEX + TEXTURE_VALUES_PER_VERTEX));

    // Load the element data into the GPU.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elementBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.node.elementData, gl.STATIC_DRAW);
    shaderProgram.use();
    gl.uniformMatrix3fv(shaderProgram.uniformLocations.uModelViewMatrix, false, modelViewMatrix.copyToArray(scratchFloatArray));
    gl.uniformMatrix3fv(shaderProgram.uniformLocations.uProjectionMatrix, false, projectionMatrix.copyToArray(scratchFloatArray));

    // activate and bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.uniformLocations.uSampler, 0);

    // add the element data
    gl.drawElements(gl.TRIANGLE_STRIP, this.node.numActiveParticles * 6 - 2, gl.UNSIGNED_SHORT, 0);
    shaderProgram.unuse();
    return WebGLNode.PAINTED_SOMETHING;
  }

  /**
   * Releases references
   * @public
   */
  dispose() {
    this.shaderProgram.dispose();
    this.gl.deleteBuffer(this.vertexBuffer);
    this.gl.deleteTexture(this.texture);
    this.gl.deleteBuffer(this.elementBuffer);
    this.shaderProgram = null;
  }
}
export default ParticlesWebGLNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2hhZGVyUHJvZ3JhbSIsIldlYkdMTm9kZSIsIm5ldXJvbiIsIlBhcnRpY2xlVHlwZSIsIk5ldXJvblBhcnRpY2xlc1RleHR1cmUiLCJNQVhfUEFSVElDTEVTIiwiVkVSVElDRVNfUEVSX1BBUlRJQ0xFIiwiUE9TSVRJT05fVkFMVUVTX1BFUl9WRVJURVgiLCJURVhUVVJFX1ZBTFVFU19QRVJfVkVSVEVYIiwiT1BBQ0lUWV9WQUxVRVNfUEVSX1ZFUlRFWCIsInNjcmF0Y2hGbG9hdEFycmF5IiwiRmxvYXQzMkFycmF5IiwiUGFydGljbGVzV2ViR0xOb2RlIiwiY29uc3RydWN0b3IiLCJuZXVyb25Nb2RlbCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInpvb21NYXRyaXhQcm9wZXJ0eSIsImJvdW5kcyIsIlBhcnRpY2xlc1BhaW50ZXIiLCJjYW52YXNCb3VuZHMiLCJ2aWV3VHJhbnNmb3JtYXRpb25NYXRyaXgiLCJnZXRNYXRyaXgiLCJwYXJ0aWNsZUJvdW5kcyIsInBhcnRpY2xlc1RleHR1cmUiLCJ2ZXJ0ZXhEYXRhIiwiZWxlbWVudERhdGEiLCJVaW50MTZBcnJheSIsInBhcnRpY2xlRGF0YSIsIkFycmF5Iiwic29kaXVtVGV4dHVyZUNvb3JkcyIsImdldFRleENvb3JkcyIsIlNPRElVTV9JT04iLCJwb3Rhc3NpdW1UZXh0dXJlQ29vcmRzIiwiUE9UQVNTSVVNX0lPTiIsImkiLCJwb3MiLCJyYWRpdXMiLCJ0eXBlIiwib3BhY2l0eSIsImluZGV4QmFzZSIsInZhbHVlQmFzZSIsIm51bUFjdGl2ZVBhcnRpY2xlcyIsInVwZGF0ZVBhcnRpY2xlRGF0YSIsInBhcnRpY2xlc01vdmVkIiwiYWRkTGlzdGVuZXIiLCJpbnZhbGlkYXRlUGFpbnQiLCJhbGxJb25zU2ltdWxhdGVkUHJvcGVydHkiLCJsYXp5TGluayIsImF0TGVhc3RPbmVQYXJ0aWNsZVByZXNlbnRQcm9wZXJ0eSIsImF0TGVhc3RPbmVQYXJ0aWNsZVByZXNlbnQiLCJ2aXNpYmxlIiwiYWRkUGFydGljbGVEYXRhIiwicGFydGljbGUiLCJ4UG9zIiwibW9kZWxUb1ZpZXdYIiwicG9zaXRpb25YIiwieVBvcyIsIm1vZGVsVG9WaWV3WSIsInBvc2l0aW9uWSIsIm1vZGVsVG9WaWV3RGVsdGFYIiwiZ2V0UmFkaXVzIiwiem9vbU1hdHJpeCIsInZhbHVlIiwiem9vbWVkWFBvcyIsIm0wMCIsIm0wMiIsInpvb21lZFlQb3MiLCJtMTEiLCJtMTIiLCJ6b29tZWRSYWRpdXMiLCJjb250YWluc0Nvb3JkaW5hdGVzIiwicGFydGljbGVEYXRhRW50cnkiLCJzZXRYWSIsImdldFR5cGUiLCJnZXRPcGFjaXR5IiwiYXNzZXJ0IiwiTWF0aCIsIm1pbiIsInBhcnRpY2xlQXJyYXkiLCJiYWNrZ3JvdW5kUGFydGljbGVzIiwibGVuZ3RoIiwidHJhbnNpZW50UGFydGljbGVzIiwicGxheWJhY2tQYXJ0aWNsZXMiLCJyZWdpc3RlciIsImdsIiwibm9kZSIsInZlcnRleFNoYWRlclNvdXJjZSIsImpvaW4iLCJmcmFnbWVudFNoYWRlclNvdXJjZSIsInNoYWRlclByb2dyYW0iLCJhdHRyaWJ1dGVzIiwidW5pZm9ybXMiLCJ0ZXh0dXJlIiwiY3JlYXRlVGV4dHVyZSIsInZlcnRleEJ1ZmZlciIsImNyZWF0ZUJ1ZmZlciIsImVsZW1lbnRCdWZmZXIiLCJiaW5kVGV4dHVyZSIsIlRFWFRVUkVfMkQiLCJ0ZXhQYXJhbWV0ZXJpIiwiVEVYVFVSRV9XUkFQX1MiLCJDTEFNUF9UT19FREdFIiwiVEVYVFVSRV9XUkFQX1QiLCJURVhUVVJFX01BR19GSUxURVIiLCJMSU5FQVIiLCJURVhUVVJFX01JTl9GSUxURVIiLCJMSU5FQVJfTUlQTUFQX0xJTkVBUiIsInRleEltYWdlMkQiLCJSR0JBIiwiVU5TSUdORURfQllURSIsImNhbnZhcyIsImdlbmVyYXRlTWlwbWFwIiwicGFpbnQiLCJtb2RlbFZpZXdNYXRyaXgiLCJwcm9qZWN0aW9uTWF0cml4IiwidmVydGV4RGF0YUluZGV4IiwicGFydGljbGVEYXR1bSIsImFkanVzdGVkUGFydGljbGVSYWRpdXMiLCJ0ZXh0dXJlQ29vcmRpbmF0ZXMiLCJ4IiwieSIsIm1pblgiLCJtaW5ZIiwibWF4WSIsIm1heFgiLCJiaW5kQnVmZmVyIiwiQVJSQVlfQlVGRkVSIiwiYnVmZmVyRGF0YSIsIkRZTkFNSUNfRFJBVyIsImVsZW1lbnRTaXplIiwiQllURVNfUEVSX0VMRU1FTlQiLCJlbGVtZW50c1BlclZlcnRleCIsInN0cmlkZSIsInZlcnRleEF0dHJpYlBvaW50ZXIiLCJhdHRyaWJ1dGVMb2NhdGlvbnMiLCJhUG9zaXRpb24iLCJGTE9BVCIsImFUZXh0dXJlQ29vcmRpbmF0ZSIsImFPcGFjaXR5IiwiRUxFTUVOVF9BUlJBWV9CVUZGRVIiLCJTVEFUSUNfRFJBVyIsInVzZSIsInVuaWZvcm1NYXRyaXgzZnYiLCJ1bmlmb3JtTG9jYXRpb25zIiwidU1vZGVsVmlld01hdHJpeCIsImNvcHlUb0FycmF5IiwidVByb2plY3Rpb25NYXRyaXgiLCJhY3RpdmVUZXh0dXJlIiwiVEVYVFVSRTAiLCJ1bmlmb3JtMWkiLCJ1U2FtcGxlciIsImRyYXdFbGVtZW50cyIsIlRSSUFOR0xFX1NUUklQIiwiVU5TSUdORURfU0hPUlQiLCJ1bnVzZSIsIlBBSU5URURfU09NRVRISU5HIiwiZGlzcG9zZSIsImRlbGV0ZUJ1ZmZlciIsImRlbGV0ZVRleHR1cmUiXSwic291cmNlcyI6WyJQYXJ0aWNsZXNXZWJHTE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBXZWJHTCBTY2VuZXJ5IG5vZGUgdGhhdCBpcyB1c2VkIHRvIHJlbmRlciB0aGUgc29kaXVtIGFuZCBwb3Rhc3NpdW0gcGFydGljbGVzLCBhLmsuYS4gaW9ucywgdGhhdCBuZWVkIHRvIGJlXHJcbiAqIHBvcnRyYXllZCBpbiB0aGUgTmV1cm9uIHNpbXVsYXRpb24uICBUaGlzIG5vZGUgZXhpc3RzIGFzIGFuIG9wdGltaXphdGlvbiwgc2luY2UgcmVwcmVzZW50aW5nIGV2ZXJ5IHBhcnRpY2xlIGFzIGFuXHJcbiAqIGluZGl2aWR1YWwgU2NlbmVyeSBub2RlIHByb3ZlZCB0byBiZSBmYXIgdG9vIGNvbXB1dGF0aW9uYWxseSBpbnRlbnNpdmUuXHJcbiAqXHJcbiAqIEluIHRoaXMgbm9kZSwgcGFydGljbGVzIGFyZSByZW5kZXJlZCB1c2luZyBhIHRleHR1cmUgdGhhdCBpcyBjcmVhdGVkIG9uIGEgY2FudmFzLiAgVGhlIHRleHR1cmUgZXhpc3RzIGFzIGEgc2VwYXJhdGVcclxuICogY2xhc3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaGFyZnVkZWVuIEFzaHJhZiAoZm9yIEdoZW50IFVuaXZlcnNpdHkpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBTaGFkZXJQcm9ncmFtLCBXZWJHTE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZVR5cGUgZnJvbSAnLi4vbW9kZWwvUGFydGljbGVUeXBlLmpzJztcclxuaW1wb3J0IE5ldXJvblBhcnRpY2xlc1RleHR1cmUgZnJvbSAnLi9OZXVyb25QYXJ0aWNsZXNUZXh0dXJlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVhfUEFSVElDTEVTID0gMjAwMDsgLy8gc2V2ZXJhbCB0cmlhbHMgd2VyZSBydW4gYW5kIHBlYWsgbnVtYmVyIG9mIHBhcnRpY2xlcyB3YXMgMTg0MSwgc28gdGhpcyB2YWx1ZSBzaG91bGQgYmUgc2FmZVxyXG5jb25zdCBWRVJUSUNFU19QRVJfUEFSVElDTEUgPSA0OyAvLyBiYXNpY2FsbHkgb25lIHBlciBjb3JuZXIgb2YgdGhlIHJlY3RhbmdsZSB0aGF0IGVuY2xvc2VzIHRoZSBwYXJ0aWNsZVxyXG5jb25zdCBQT1NJVElPTl9WQUxVRVNfUEVSX1ZFUlRFWCA9IDI7IC8vIHggYW5kIHksIHogaXMgY29uc2lkZXJlZCB0byBiZSBhbHdheXMgMVxyXG5jb25zdCBURVhUVVJFX1ZBTFVFU19QRVJfVkVSVEVYID0gMjsgLy8geCBhbmQgeSBjb29yZGluYXRlcyB3aXRoaW4gdGhlIDJEIHRleHR1cmVcclxuY29uc3QgT1BBQ0lUWV9WQUxVRVNfUEVSX1ZFUlRFWCA9IDE7IC8vIGEgc2luZ2xlIHZhbHVlIGZyb20gMCB0byAxXHJcbmNvbnN0IHNjcmF0Y2hGbG9hdEFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSggOSApO1xyXG5cclxuY2xhc3MgUGFydGljbGVzV2ViR0xOb2RlIGV4dGVuZHMgV2ViR0xOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOZXVyb25Nb2RlbH0gbmV1cm9uTW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPE1hdHJpeDM+fSB6b29tTWF0cml4UHJvcGVydHkgLSBhIG1hdHJpeCB0aGF0IHRyYWNrcyBob3cgem9vbWVkIGluIG9yIG91dCB0aGlzIG5vZGUgaXMsIHVzZWQgdG9cclxuICAgKiBkZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIHBhcnRpY2xlIG5lZWRzIHRvIGJlIHJlbmRlcmVkXHJcbiAgICogQHBhcmFtIHtTaGFwZX0gYm91bmRzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG5ldXJvbk1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHpvb21NYXRyaXhQcm9wZXJ0eSwgYm91bmRzICkge1xyXG4gICAgc3VwZXIoIFBhcnRpY2xlc1BhaW50ZXIsIHtcclxuICAgICAgY2FudmFzQm91bmRzOiBib3VuZHNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBLZWVwIHJlZmVyZW5jZXMgdG8gdGhlIHRoaW5ncyB0aGF0IG5lZWRlZCBpbiBvcmRlciB0byByZW5kZXIgdGhlIHBhcnRpY2xlcy5cclxuICAgIHRoaXMubmV1cm9uTW9kZWwgPSBuZXVyb25Nb2RlbDsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gbW9kZWxWaWV3VHJhbnNmb3JtOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy52aWV3VHJhbnNmb3JtYXRpb25NYXRyaXggPSBtb2RlbFZpZXdUcmFuc2Zvcm0uZ2V0TWF0cml4KCk7IC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnpvb21NYXRyaXhQcm9wZXJ0eSA9IHpvb21NYXRyaXhQcm9wZXJ0eTsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMucGFydGljbGVCb3VuZHMgPSBib3VuZHM7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSB0ZXh0dXJlIGZvciB0aGUgcGFydGljbGVzLlxyXG4gICAgdGhpcy5wYXJ0aWNsZXNUZXh0dXJlID0gbmV3IE5ldXJvblBhcnRpY2xlc1RleHR1cmUoIG1vZGVsVmlld1RyYW5zZm9ybSApOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gcHJlLWFsbG9jYXRlZCBhcnJheXMgYW5kIHZhbHVlcyB0aGF0IGFyZSByZXVzZWQgZm9yIGJldHRlciBwZXJmb3JtYW5jZVxyXG4gICAgdGhpcy52ZXJ0ZXhEYXRhID0gbmV3IEZsb2F0MzJBcnJheSggTUFYX1BBUlRJQ0xFUyAqIFZFUlRJQ0VTX1BFUl9QQVJUSUNMRSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIFBPU0lUSU9OX1ZBTFVFU19QRVJfVkVSVEVYICsgVEVYVFVSRV9WQUxVRVNfUEVSX1ZFUlRFWCArIE9QQUNJVFlfVkFMVUVTX1BFUl9WRVJURVggKSApO1xyXG4gICAgdGhpcy5lbGVtZW50RGF0YSA9IG5ldyBVaW50MTZBcnJheSggTUFYX1BBUlRJQ0xFUyAqICggVkVSVElDRVNfUEVSX1BBUlRJQ0xFICsgMiApICk7XHJcbiAgICB0aGlzLnBhcnRpY2xlRGF0YSA9IG5ldyBBcnJheSggTUFYX1BBUlRJQ0xFUyApO1xyXG5cclxuICAgIC8vIHByZS1jYWxjdWxhdGUgdGhlIHRleHR1cmUgY29vcmRpbmF0ZXMgZm9yIHRoZSB0d28gZGlmZmVyZW50IHBhcnRpY2xlIHR5cGVzXHJcbiAgICB0aGlzLnNvZGl1bVRleHR1cmVDb29yZHMgPSB0aGlzLnBhcnRpY2xlc1RleHR1cmUuZ2V0VGV4Q29vcmRzKCBQYXJ0aWNsZVR5cGUuU09ESVVNX0lPTiApO1xyXG4gICAgdGhpcy5wb3Rhc3NpdW1UZXh0dXJlQ29vcmRzID0gdGhpcy5wYXJ0aWNsZXNUZXh0dXJlLmdldFRleENvb3JkcyggUGFydGljbGVUeXBlLlBPVEFTU0lVTV9JT04gKTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNQVhfUEFSVElDTEVTOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBGb3IgYmV0dGVyIHBlcmZvcm1hbmNlLCB0aGUgYXJyYXkgb2YgcGFydGljbGUgZGF0YSBvYmplY3RzIGlzIGluaXRpYWxpemVkIGhlcmUgYW5kIHRoZSB2YWx1ZXMgdXBkYXRlZCByYXRoZXJcclxuICAgICAgLy8gdGhhbiByZWFsbG9jYXRlZCBkdXJpbmcgZWFjaCB1cGRhdGUuXHJcbiAgICAgIHRoaXMucGFydGljbGVEYXRhWyBpIF0gPSB7XHJcbiAgICAgICAgcG9zOiBuZXcgVmVjdG9yMiggMCwgMCApLFxyXG4gICAgICAgIHJhZGl1czogMSxcclxuICAgICAgICB0eXBlOiBudWxsLFxyXG4gICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEFsc28gZm9yIGJldHRlciBwZXJmb3JtYW5jZSwgdGhlIGVsZW1lbnQgZGF0YSBpcyBpbml0aWFsaXplZCBhdCB0aGUgc3RhcnQgZm9yIHRoZSBtYXggbnVtYmVyIG9mIHBhcnRpY2xlcy5cclxuICAgICAgY29uc3QgaW5kZXhCYXNlID0gaSAqIDY7XHJcbiAgICAgIGNvbnN0IHZhbHVlQmFzZSA9IGkgKiA0O1xyXG4gICAgICB0aGlzLmVsZW1lbnREYXRhWyBpbmRleEJhc2UgXSA9IHZhbHVlQmFzZTtcclxuICAgICAgdGhpcy5lbGVtZW50RGF0YVsgaW5kZXhCYXNlICsgMSBdID0gdmFsdWVCYXNlICsgMTtcclxuICAgICAgdGhpcy5lbGVtZW50RGF0YVsgaW5kZXhCYXNlICsgMiBdID0gdmFsdWVCYXNlICsgMjtcclxuICAgICAgdGhpcy5lbGVtZW50RGF0YVsgaW5kZXhCYXNlICsgMyBdID0gdmFsdWVCYXNlICsgMztcclxuICAgICAgaWYgKCBpICsgMSA8IE1BWF9QQVJUSUNMRVMgKSB7XHJcbiAgICAgICAgLy8gQWRkIHRoZSAnZGVnZW5lcmF0ZSB0cmlhbmdsZScgdGhhdCB3aWxsIGZvcmNlIGEgZGlzY29udGludWl0eSBpbiB0aGUgdHJpYW5nbGUgc3RyaXAuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50RGF0YVsgaW5kZXhCYXNlICsgNCBdID0gdmFsdWVCYXNlICsgMztcclxuICAgICAgICB0aGlzLmVsZW1lbnREYXRhWyBpbmRleEJhc2UgKyA1IF0gPSB2YWx1ZUJhc2UgKyA0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5udW1BY3RpdmVQYXJ0aWNsZXMgPSAwOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIGluaXRpYWwgdXBkYXRlXHJcbiAgICB0aGlzLnVwZGF0ZVBhcnRpY2xlRGF0YSgpO1xyXG5cclxuICAgIC8vIG1vbml0b3IgYSBwcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB3aGVuIGEgcGFydGljbGUgc3RhdGUgaGFzIGNoYW5nZWQgYW5kIGluaXRpYXRlIGEgcmVkcmF3XHJcbiAgICBuZXVyb25Nb2RlbC5wYXJ0aWNsZXNNb3ZlZC5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1vbml0b3IgYSBwcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB3aGV0aGVyIGFsbCBpb25zIGFyZSBiZWluZyBkZXBpY3RlZCBhbmQgaW5pdGlhdGUgYSByZWRyYXcgb24gYSBjaGFuZ2VcclxuICAgIG5ldXJvbk1vZGVsLmFsbElvbnNTaW11bGF0ZWRQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1vbml0b3IgYSBwcm9wZXJ0eSB0aGF0IGluZGljYXRlcyB3aGVuIHRoZSB6b29tIGxldmVsIGFuZCBjaGFuZ2VzIGFuZCBpbml0aWF0ZSBhIHJlZHJhd1xyXG4gICAgem9vbU1hdHJpeFByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGVyZSBpcyBhbiBpc3N1ZSBpbiBTY2VuZXJ5IHdoZXJlLCBpZiBub3RoaW5nIGlzIGRyYXduLCB3aGF0ZXZlciB3YXMgcHJldmlvdXNseSBkcmF3biBzdGF5cyB0aGVyZS4gIFRoaXMgd2FzXHJcbiAgICAgKiBjYXVzaW5nIHByb2JsZW1zIGluIHRoaXMgc2ltIHdoZW4gdHVybmluZyBvZmYgdGhlIFwiU2hvdyBBbGwgSW9uc1wiIHNldHRpbmcsIHNlZVxyXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25ldXJvbi9pc3N1ZXMvMTAwLiAgVGhlIFNjZW5lcnkgaXNzdWUgaXNcclxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy81MDMuICBUbyB3b3JrIGFyb3VuZCB0aGlzIHByb2JsZW0sIGEgcHJvcGVydHkgd2FzIGFkZGVkIHRvIHRoZSBtb2RlbFxyXG4gICAgICogYW5kIGxpbmtlZCBoZXJlIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2V0IHRoZSBub2RlIGludmlzaWJsZSBpZiB0aGVyZSBhcmUgbm8gcGFydGljbGVzIHRvIGJlIHJlbmRlcmVkLiAgVGhpcyBjYW5cclxuICAgICAqIHByb2JhYmx5IGJlIHJlbW92ZWQgaWYgYW5kIHdoZW4gdGhlIFNjZW5lcnkgaXNzdWUgaXMgYWRkcmVzc2VkLlxyXG4gICAgICovXHJcbiAgICBuZXVyb25Nb2RlbC5hdExlYXN0T25lUGFydGljbGVQcmVzZW50UHJvcGVydHkubGF6eUxpbmsoIGF0TGVhc3RPbmVQYXJ0aWNsZVByZXNlbnQgPT4ge1xyXG4gICAgICB0aGlzLnZpc2libGUgPSBhdExlYXN0T25lUGFydGljbGVQcmVzZW50O1xyXG4gICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgaWYgdGhlIHByb3ZpZGVkIHBhcnRpY2xlIGlzIGluIHRoZSBjdXJyZW50IHJlbmRlcmluZyBib3VuZHMgYW5kLCBpZiBzbywgY3JlYXRlIGEgcGFydGljbGUgZGF0YSBvYmplY3QgYW5kXHJcbiAgICogYWRkIGl0IHRvIHRoZSBsaXN0IHRoYXQgd2lsbCBiZSBjb252ZXJ0ZWQgaW50byB2ZXJ0ZXggZGF0YSBpbiBhIHN1YnNlcXVlbnQgc3RlcC5cclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlfSBwYXJ0aWNsZVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYWRkUGFydGljbGVEYXRhKCBwYXJ0aWNsZSApIHtcclxuICAgIGNvbnN0IHhQb3MgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBhcnRpY2xlLnBvc2l0aW9uWCApO1xyXG4gICAgY29uc3QgeVBvcyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcGFydGljbGUucG9zaXRpb25ZICk7XHJcbiAgICBjb25zdCByYWRpdXMgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggcGFydGljbGUuZ2V0UmFkaXVzKCkgKTtcclxuXHJcbiAgICAvLyBGaWd1cmUgb3V0IHRoZSBwb3NpdGlvbiBhbmQgcmFkaXVzIG9mIHRoZSB6b29tZWQgcGFydGljbGUuXHJcbiAgICBjb25zdCB6b29tTWF0cml4ID0gdGhpcy56b29tTWF0cml4UHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCB6b29tZWRYUG9zID0gem9vbU1hdHJpeC5tMDAoKSAqIHhQb3MgKyB6b29tTWF0cml4Lm0wMigpO1xyXG4gICAgY29uc3Qgem9vbWVkWVBvcyA9IHpvb21NYXRyaXgubTExKCkgKiB5UG9zICsgem9vbU1hdHJpeC5tMTIoKTtcclxuICAgIGNvbnN0IHpvb21lZFJhZGl1cyA9IHpvb21NYXRyaXgubTAwKCkgKiByYWRpdXM7XHJcblxyXG4gICAgLy8gT25seSBhZGQgdGhlIHBhcnRpY2xlIGlmIGl0cyB6b29tZWQgcG9zaXRpb24gaXMgd2l0aGluIHRoZSBib3VuZHMgYmVpbmcgc2hvd24uXHJcbiAgICBpZiAoIHRoaXMucGFydGljbGVCb3VuZHMuY29udGFpbnNDb29yZGluYXRlcyggem9vbWVkWFBvcywgem9vbWVkWVBvcyApICkge1xyXG4gICAgICBjb25zdCBwYXJ0aWNsZURhdGFFbnRyeSA9IHRoaXMucGFydGljbGVEYXRhWyB0aGlzLm51bUFjdGl2ZVBhcnRpY2xlcyBdO1xyXG4gICAgICBwYXJ0aWNsZURhdGFFbnRyeS5wb3Muc2V0WFkoIHpvb21lZFhQb3MsIHpvb21lZFlQb3MgKTtcclxuICAgICAgcGFydGljbGVEYXRhRW50cnkucmFkaXVzID0gem9vbWVkUmFkaXVzO1xyXG4gICAgICBwYXJ0aWNsZURhdGFFbnRyeS50eXBlID0gcGFydGljbGUuZ2V0VHlwZSgpO1xyXG4gICAgICBwYXJ0aWNsZURhdGFFbnRyeS5vcGFjaXR5ID0gcGFydGljbGUuZ2V0T3BhY2l0eSgpO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm51bUFjdGl2ZVBhcnRpY2xlcyA8IE1BWF9QQVJUSUNMRVMgLSAxICk7XHJcbiAgICAgIHRoaXMubnVtQWN0aXZlUGFydGljbGVzID0gTWF0aC5taW4oIHRoaXMubnVtQWN0aXZlUGFydGljbGVzICsgMSwgTUFYX1BBUlRJQ0xFUyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSByZXByZXNlbnRhdGlvbiBzaG93biBpbiB0aGUgY2FudmFzIGJhc2VkIG9uIHRoZSBtb2RlbCBzdGF0ZS4gIFRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgY2FsbGVkIGFueSB0aW1lXHJcbiAgICogb25lIG9yIG1vcmUgcGFydGljbGVzIG1vdmUgaW4gYSBnaXZlbiB0aW1lIHN0ZXAsIHdoaWNoIG1lYW5zIG9uY2UgcGVyIGZyYW1lIG9yIGxlc3MuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVQYXJ0aWNsZURhdGEoKSB7XHJcbiAgICB0aGlzLm51bUFjdGl2ZVBhcnRpY2xlcyA9IDA7XHJcblxyXG4gICAgLy8gRm9yIGJldHRlciBwZXJmb3JtYW5jZSwgd2UgbG9vcCBvdmVyIHRoZSBhcnJheXMgY29udGFpbmVkIHdpdGhpbiB0aGUgb2JzZXJ2YWJsZSBhcnJheXMgcmF0aGVyIHRoYW4gdXNpbmcgdGhlXHJcbiAgICAvLyBmb3JFYWNoIGZ1bmN0aW9uLiAgVGhpcyBpcyBtdWNoIG1vcmUgZWZmaWNpZW50LiAgTm90ZSB0aGF0IHRoaXMgaXMgb25seSBzYWZlIGlmIG5vIG1vZHMgYXJlIG1hZGUgdG8gdGhlXHJcbiAgICAvLyBjb250ZW50cyBvZiB0aGUgb2JzZXJ2YWJsZSBhcnJheS5cclxuXHJcbiAgICBsZXQgaTtcclxuICAgIGxldCBwYXJ0aWNsZUFycmF5ID0gdGhpcy5uZXVyb25Nb2RlbC5iYWNrZ3JvdW5kUGFydGljbGVzO1xyXG5cclxuICAgIGZvciAoIGkgPSAwOyBpIDwgcGFydGljbGVBcnJheS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpcy5hZGRQYXJ0aWNsZURhdGEoIHBhcnRpY2xlQXJyYXlbIGkgXSApO1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnRpY2xlQXJyYXkgPSB0aGlzLm5ldXJvbk1vZGVsLnRyYW5zaWVudFBhcnRpY2xlcztcclxuXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhcnRpY2xlQXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkUGFydGljbGVEYXRhKCBwYXJ0aWNsZUFycmF5WyBpIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJ0aWNsZUFycmF5ID0gdGhpcy5uZXVyb25Nb2RlbC5wbGF5YmFja1BhcnRpY2xlcztcclxuXHJcbiAgICBmb3IgKCBpID0gMDsgaSA8IHBhcnRpY2xlQXJyYXkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWRkUGFydGljbGVEYXRhKCBwYXJ0aWNsZUFycmF5WyBpIF0gKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm5ldXJvbi5yZWdpc3RlciggJ1BhcnRpY2xlc1dlYkdMTm9kZScsIFBhcnRpY2xlc1dlYkdMTm9kZSApO1xyXG5cclxuY2xhc3MgUGFydGljbGVzUGFpbnRlciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgb2JqZWN0IHRoYXQgd2lsbCBkbyB0aGUgYWN0dWFsIHBhaW50aW5nIGZvciB0aGlzIG5vZGUuICBUaGlzIGNvbnN0cnVjdG9yLCByYXRoZXIgdGhhbiBhblxyXG4gICAqIGluc3RhbmNlLCBpcyBwYXNzZWQgdG8gdGhlIHBhcmVudCBXZWJHTE5vZGUgdHlwZS5cclxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2xcclxuICAgKiBAcGFyYW0ge1dhdmVXZWJHTE5vZGV9IG5vZGVcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZ2wsIG5vZGUgKSB7XHJcbiAgICB0aGlzLmdsID0gZ2w7XHJcbiAgICB0aGlzLm5vZGUgPSBub2RlO1xyXG5cclxuICAgIC8vIHZlcnRleCBzaGFkZXJcclxuICAgIGNvbnN0IHZlcnRleFNoYWRlclNvdXJjZSA9IFtcclxuICAgICAgJ2F0dHJpYnV0ZSB2ZWMyIGFQb3NpdGlvbjsnLFxyXG4gICAgICAnYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZGluYXRlOycsXHJcbiAgICAgICdhdHRyaWJ1dGUgZmxvYXQgYU9wYWNpdHk7JyxcclxuICAgICAgJ3ZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkaW5hdGU7JyxcclxuICAgICAgJ3ZhcnlpbmcgZmxvYXQgdk9wYWNpdHk7JyxcclxuICAgICAgJ3VuaWZvcm0gbWF0MyB1TW9kZWxWaWV3TWF0cml4OycsXHJcbiAgICAgICd1bmlmb3JtIG1hdDMgdVByb2plY3Rpb25NYXRyaXg7JyxcclxuXHJcbiAgICAgICd2b2lkIG1haW4oIHZvaWQgKSB7JyxcclxuICAgICAgLy8gaG9tb2dlbmVvdXMgbW9kZWwtdmlldyB0cmFuc2Zvcm1hdGlvblxyXG4gICAgICAnICB2ZWMzIHZpZXcgPSB1TW9kZWxWaWV3TWF0cml4ICogdmVjMyggYVBvc2l0aW9uLnh5LCAxICk7JyxcclxuICAgICAgLy8gaG9tb2dlbmVvdXMgbWFwIHRvIHRvIG5vcm1hbGl6ZWQgZGV2aWNlIGNvb3JkaW5hdGVzXHJcbiAgICAgICcgIHZlYzMgbmRjID0gdVByb2plY3Rpb25NYXRyaXggKiB2ZWMzKCB2aWV3Lnh5LCAxICk7JyxcclxuICAgICAgLy8gdGV4dHVyZSBjb29yZGluYXRlXHJcbiAgICAgICcgIHZUZXh0dXJlQ29vcmRpbmF0ZSA9IGFUZXh0dXJlQ29vcmRpbmF0ZTsnLFxyXG4gICAgICAvLyBvcGFjaXR5XHJcbiAgICAgICcgIHZPcGFjaXR5ID0gYU9wYWNpdHk7JyxcclxuICAgICAgLy8gYXNzdW1lIGEgeiB2YWx1ZSBvZiAxIGZvciB0aGUgcG9zaXRpb25cclxuICAgICAgJyAgZ2xfUG9zaXRpb24gPSB2ZWM0KCBuZGMueHksIDEuMCwgMS4wICk7JyxcclxuICAgICAgJ30nXHJcbiAgICBdLmpvaW4oICdcXG4nICk7XHJcblxyXG4gICAgLy8gZnJhZ21lbnQgc2hhZGVyXHJcbiAgICBjb25zdCBmcmFnbWVudFNoYWRlclNvdXJjZSA9IFtcclxuICAgICAgJ3ByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OycsXHJcbiAgICAgICd2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZGluYXRlOycsXHJcbiAgICAgICd2YXJ5aW5nIGZsb2F0IHZPcGFjaXR5OycsXHJcbiAgICAgICd1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjsnLFxyXG4gICAgICAndm9pZCBtYWluKCB2b2lkICkgeycsXHJcbiAgICAgICcgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCggdVNhbXBsZXIsIHZUZXh0dXJlQ29vcmRpbmF0ZSApOycsXHJcbiAgICAgICcgIGdsX0ZyYWdDb2xvci5hICo9IHZPcGFjaXR5OycsXHJcblxyXG4gICAgICAvLyBVc2UgcHJlbXVsdGlwbGVkIGFscGhhLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VuZXJneS1za2F0ZS1wYXJrL2lzc3Vlcy8zOVxyXG4gICAgICAnICBnbF9GcmFnQ29sb3IucmdiICo9IGdsX0ZyYWdDb2xvci5hOycsXHJcbiAgICAgICd9J1xyXG4gICAgXS5qb2luKCAnXFxuJyApO1xyXG5cclxuICAgIHRoaXMuc2hhZGVyUHJvZ3JhbSA9IG5ldyBTaGFkZXJQcm9ncmFtKCBnbCwgdmVydGV4U2hhZGVyU291cmNlLCBmcmFnbWVudFNoYWRlclNvdXJjZSwge1xyXG4gICAgICBhdHRyaWJ1dGVzOiBbICdhUG9zaXRpb24nLCAnYVRleHR1cmVDb29yZGluYXRlJywgJ2FPcGFjaXR5JyBdLFxyXG4gICAgICB1bmlmb3JtczogWyAndU1vZGVsVmlld01hdHJpeCcsICd1UHJvamVjdGlvbk1hdHJpeCcgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgIHRoaXMudmVydGV4QnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XHJcbiAgICB0aGlzLmVsZW1lbnRCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuXHJcbiAgICAvLyBiaW5kIHRoZSB0ZXh0dXJlIHRoYXQgY29udGFpbnMgdGhlIHBhcnRpY2xlIGltYWdlc1xyXG4gICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSApO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaSggZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UgKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFICk7XHJcbiAgICAvLyBUZXh0dXJlIGZpbHRlcmluZywgc2VlIGh0dHA6Ly9sZWFybmluZ3dlYmdsLmNvbS9ibG9nLz9wPTU3MVxyXG4gICAgZ2wudGV4UGFyYW1ldGVyaSggZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIgKTtcclxuICAgIGdsLnRleFBhcmFtZXRlcmkoIGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSX01JUE1BUF9MSU5FQVIgKTtcclxuICAgIC8vIHNoaXAgdGhlIHRleHR1cmUgZGF0YSB0byB0aGUgR1BVXHJcbiAgICBnbC50ZXhJbWFnZTJEKCBnbC5URVhUVVJFXzJELCAwLCBnbC5SR0JBLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCB0aGlzLm5vZGUucGFydGljbGVzVGV4dHVyZS5jYW52YXMgKTtcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBhIG1pcG1hcCBmb3IgYmV0dGVyIGhhbmRsaW5nIG9mIHpvb20gaW4vb3V0XHJcbiAgICBnbC5nZW5lcmF0ZU1pcG1hcCggZ2wuVEVYVFVSRV8yRCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNYXRyaXgzfSBtb2RlbFZpZXdNYXRyaXhcclxuICAgKiBAcGFyYW0ge01hdHJpeDN9IHByb2plY3Rpb25NYXRyaXhcclxuICAgKiBAcmV0dXJucyB7V2ViR0xOb2RlLlBBSU5URURfU09NRVRISU5HfVxyXG4gICAqL1xyXG4gIHBhaW50KCBtb2RlbFZpZXdNYXRyaXgsIHByb2plY3Rpb25NYXRyaXggKSB7XHJcbiAgICBjb25zdCBnbCA9IHRoaXMuZ2w7XHJcbiAgICBjb25zdCBzaGFkZXJQcm9ncmFtID0gdGhpcy5zaGFkZXJQcm9ncmFtO1xyXG4gICAgbGV0IGk7IC8vIGxvb3AgaW5kZXhcclxuXHJcbiAgICB0aGlzLm5vZGUudXBkYXRlUGFydGljbGVEYXRhKCk7XHJcblxyXG4gICAgLy8gQ29udmVydCBwYXJ0aWNsZSBkYXRhIHRvIHZlcnRpY2VzIHRoYXQgcmVwcmVzZW50IGEgcmVjdGFuZ2xlIHBsdXMgdGV4dHVyZSBjb29yZGluYXRlcy5cclxuICAgIGxldCB2ZXJ0ZXhEYXRhSW5kZXggPSAwO1xyXG4gICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLm5vZGUubnVtQWN0aXZlUGFydGljbGVzOyBpKysgKSB7XHJcblxyXG4gICAgICAvLyBjb252ZW5pZW5jZSB2YXJcclxuICAgICAgY29uc3QgcGFydGljbGVEYXR1bSA9IHRoaXMubm9kZS5wYXJ0aWNsZURhdGFbIGkgXTtcclxuXHJcbiAgICAgIC8vIFR3ZWFrIEFsZXJ0ISAgVGhlIHJhZGlpIG9mIHRoZSBwYXJ0aWNsZXMgYXJlIGFkanVzdGVkIGhlcmUgaW4gb3JkZXIgdG8gbG9vayBjb3JyZWN0LlxyXG4gICAgICBsZXQgYWRqdXN0ZWRQYXJ0aWNsZVJhZGl1cztcclxuICAgICAgbGV0IHRleHR1cmVDb29yZGluYXRlcztcclxuICAgICAgaWYgKCBwYXJ0aWNsZURhdHVtLnR5cGUgPT09IFBhcnRpY2xlVHlwZS5TT0RJVU1fSU9OICkge1xyXG4gICAgICAgIGFkanVzdGVkUGFydGljbGVSYWRpdXMgPSBwYXJ0aWNsZURhdHVtLnJhZGl1cyAqIDEuOTtcclxuICAgICAgICB0ZXh0dXJlQ29vcmRpbmF0ZXMgPSB0aGlzLm5vZGUuc29kaXVtVGV4dHVyZUNvb3JkcztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggcGFydGljbGVEYXR1bS50eXBlID09PSBQYXJ0aWNsZVR5cGUuUE9UQVNTSVVNX0lPTiApIHtcclxuICAgICAgICBhZGp1c3RlZFBhcnRpY2xlUmFkaXVzID0gcGFydGljbGVEYXR1bS5yYWRpdXMgKiAyLjE7XHJcbiAgICAgICAgdGV4dHVyZUNvb3JkaW5hdGVzID0gdGhpcy5ub2RlLnBvdGFzc2l1bVRleHR1cmVDb29yZHM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAvLyBBZGQgdGhlIHZlcnRleCBkYXRhLiAgVGhvdWdoIFdlYkdMIHVzZXMgMyBjb21wb25lbnQgdmVjdG9ycywgdGhpcyBvbmx5IGFzc2lnbnMgeCBhbmQgeSB2YWx1ZXMgYmVjYXVzZSB6IGlzXHJcbiAgICAgIC8vIGFzc3VtZWQgdG8gYmUgMS4gIFRoaXMgaXMgbm90IGRvbmUgaW4gYSBsb29wIGluIG9yZGVyIHRvIGdldCBvcHRpbWFsIHBlcmZvcm1hbmNlLlxyXG4gICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgIC8vIHVwcGVyIGxlZnQgdmVydGV4IHBvc2l0aW9uXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gcGFydGljbGVEYXR1bS5wb3MueCAtIGFkanVzdGVkUGFydGljbGVSYWRpdXM7XHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gcGFydGljbGVEYXR1bS5wb3MueSAtIGFkanVzdGVkUGFydGljbGVSYWRpdXM7XHJcblxyXG4gICAgICAvLyB0ZXh0dXJlIGNvb3JkaW5hdGUsIHdoaWNoIGlzIGEgMi1jb21wb25lbnQgdmVjdG9yXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gdGV4dHVyZUNvb3JkaW5hdGVzLm1pblg7IC8vIHggdGV4dHVyZSBjb29yZGluYXRlXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gdGV4dHVyZUNvb3JkaW5hdGVzLm1pblk7IC8vIHkgdGV4dHVyZSBjb29yZGluYXRlXHJcblxyXG4gICAgICAvLyBvcGFjaXR5LCB3aGljaCBpcyBhIHNpbmdsZSB2YWx1ZVxyXG4gICAgICB0aGlzLm5vZGUudmVydGV4RGF0YVsgdmVydGV4RGF0YUluZGV4KysgXSA9IHBhcnRpY2xlRGF0dW0ub3BhY2l0eTtcclxuXHJcbiAgICAgIC8vIGxvd2VyIGxlZnQgdmVydGV4IHBvc2l0aW9uXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gcGFydGljbGVEYXR1bS5wb3MueCAtIGFkanVzdGVkUGFydGljbGVSYWRpdXM7XHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gcGFydGljbGVEYXR1bS5wb3MueSArIGFkanVzdGVkUGFydGljbGVSYWRpdXM7XHJcblxyXG4gICAgICAvLyB0ZXh0dXJlIGNvb3JkaW5hdGUsIHdoaWNoIGlzIGEgMi1jb21wb25lbnQgdmVjdG9yXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gdGV4dHVyZUNvb3JkaW5hdGVzLm1pblg7IC8vIHggdGV4dHVyZSBjb29yZGluYXRlXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gdGV4dHVyZUNvb3JkaW5hdGVzLm1heFk7IC8vIHkgdGV4dHVyZSBjb29yZGluYXRlXHJcblxyXG4gICAgICAvLyBvcGFjaXR5LCB3aGljaCBpcyBhIHNpbmdsZSB2YWx1ZVxyXG4gICAgICB0aGlzLm5vZGUudmVydGV4RGF0YVsgdmVydGV4RGF0YUluZGV4KysgXSA9IHBhcnRpY2xlRGF0dW0ub3BhY2l0eTtcclxuXHJcbiAgICAgIC8vIHVwcGVyIHJpZ2h0IHZlcnRleCBwb3NpdGlvblxyXG4gICAgICB0aGlzLm5vZGUudmVydGV4RGF0YVsgdmVydGV4RGF0YUluZGV4KysgXSA9IHBhcnRpY2xlRGF0dW0ucG9zLnggKyBhZGp1c3RlZFBhcnRpY2xlUmFkaXVzO1xyXG4gICAgICB0aGlzLm5vZGUudmVydGV4RGF0YVsgdmVydGV4RGF0YUluZGV4KysgXSA9IHBhcnRpY2xlRGF0dW0ucG9zLnkgLSBhZGp1c3RlZFBhcnRpY2xlUmFkaXVzO1xyXG5cclxuICAgICAgLy8gdGV4dHVyZSBjb29yZGluYXRlLCB3aGljaCBpcyBhIDItY29tcG9uZW50IHZlY3RvclxyXG4gICAgICB0aGlzLm5vZGUudmVydGV4RGF0YVsgdmVydGV4RGF0YUluZGV4KysgXSA9IHRleHR1cmVDb29yZGluYXRlcy5tYXhYOyAvLyB4IHRleHR1cmUgY29vcmRpbmF0ZVxyXG4gICAgICB0aGlzLm5vZGUudmVydGV4RGF0YVsgdmVydGV4RGF0YUluZGV4KysgXSA9IHRleHR1cmVDb29yZGluYXRlcy5taW5ZOyAvLyB5IHRleHR1cmUgY29vcmRpbmF0ZVxyXG5cclxuICAgICAgLy8gb3BhY2l0eSwgd2hpY2ggaXMgYSBzaW5nbGUgdmFsdWVcclxuICAgICAgdGhpcy5ub2RlLnZlcnRleERhdGFbIHZlcnRleERhdGFJbmRleCsrIF0gPSBwYXJ0aWNsZURhdHVtLm9wYWNpdHk7XHJcblxyXG4gICAgICAvLyBsb3dlciByaWdodCB2ZXJ0ZXggcG9zaXRpb25cclxuICAgICAgdGhpcy5ub2RlLnZlcnRleERhdGFbIHZlcnRleERhdGFJbmRleCsrIF0gPSBwYXJ0aWNsZURhdHVtLnBvcy54ICsgYWRqdXN0ZWRQYXJ0aWNsZVJhZGl1cztcclxuICAgICAgdGhpcy5ub2RlLnZlcnRleERhdGFbIHZlcnRleERhdGFJbmRleCsrIF0gPSBwYXJ0aWNsZURhdHVtLnBvcy55ICsgYWRqdXN0ZWRQYXJ0aWNsZVJhZGl1cztcclxuXHJcbiAgICAgIC8vIHRleHR1cmUgY29vcmRpbmF0ZSwgd2hpY2ggaXMgYSAyLWNvbXBvbmVudCB2ZWN0b3JcclxuICAgICAgdGhpcy5ub2RlLnZlcnRleERhdGFbIHZlcnRleERhdGFJbmRleCsrIF0gPSB0ZXh0dXJlQ29vcmRpbmF0ZXMubWF4WDsgLy8geCB0ZXh0dXJlIGNvb3JkaW5hdGVcclxuICAgICAgdGhpcy5ub2RlLnZlcnRleERhdGFbIHZlcnRleERhdGFJbmRleCsrIF0gPSB0ZXh0dXJlQ29vcmRpbmF0ZXMubWF4WTsgLy8geSB0ZXh0dXJlIGNvb3JkaW5hdGVcclxuXHJcbiAgICAgIC8vIG9wYWNpdHksIHdoaWNoIGlzIGEgc2luZ2xlIHZhbHVlXHJcbiAgICAgIHRoaXMubm9kZS52ZXJ0ZXhEYXRhWyB2ZXJ0ZXhEYXRhSW5kZXgrKyBdID0gcGFydGljbGVEYXR1bS5vcGFjaXR5O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWQgdGhlIHZlcnRleCBkYXRhIGludG8gdGhlIEdQVS5cclxuICAgIGdsLmJpbmRCdWZmZXIoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy52ZXJ0ZXhCdWZmZXIgKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5ub2RlLnZlcnRleERhdGEsIGdsLkRZTkFNSUNfRFJBVyApO1xyXG5cclxuICAgIC8vIFNldCB1cCB0aGUgYXR0cmlidXRlcyB0aGF0IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIHZlcnRleCBzaGFkZXIuXHJcbiAgICBjb25zdCBlbGVtZW50U2l6ZSA9IEZsb2F0MzJBcnJheS5CWVRFU19QRVJfRUxFTUVOVDtcclxuICAgIGNvbnN0IGVsZW1lbnRzUGVyVmVydGV4ID0gUE9TSVRJT05fVkFMVUVTX1BFUl9WRVJURVggKyBURVhUVVJFX1ZBTFVFU19QRVJfVkVSVEVYICsgT1BBQ0lUWV9WQUxVRVNfUEVSX1ZFUlRFWDtcclxuICAgIGNvbnN0IHN0cmlkZSA9IGVsZW1lbnRTaXplICogZWxlbWVudHNQZXJWZXJ0ZXg7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCBzaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hUG9zaXRpb24sIDIsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLCAwICk7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKCBzaGFkZXJQcm9ncmFtLmF0dHJpYnV0ZUxvY2F0aW9ucy5hVGV4dHVyZUNvb3JkaW5hdGUsIDIsIGdsLkZMT0FULCBmYWxzZSwgc3RyaWRlLFxyXG4gICAgICBlbGVtZW50U2l6ZSAqIFRFWFRVUkVfVkFMVUVTX1BFUl9WRVJURVggKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoIHNoYWRlclByb2dyYW0uYXR0cmlidXRlTG9jYXRpb25zLmFPcGFjaXR5LCAxLCBnbC5GTE9BVCwgZmFsc2UsIHN0cmlkZSxcclxuICAgICAgZWxlbWVudFNpemUgKiAoIFBPU0lUSU9OX1ZBTFVFU19QRVJfVkVSVEVYICsgVEVYVFVSRV9WQUxVRVNfUEVSX1ZFUlRFWCApICk7XHJcblxyXG4gICAgLy8gTG9hZCB0aGUgZWxlbWVudCBkYXRhIGludG8gdGhlIEdQVS5cclxuICAgIGdsLmJpbmRCdWZmZXIoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLmVsZW1lbnRCdWZmZXIgKTtcclxuICAgIGdsLmJ1ZmZlckRhdGEoIGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0aGlzLm5vZGUuZWxlbWVudERhdGEsIGdsLlNUQVRJQ19EUkFXICk7XHJcblxyXG4gICAgc2hhZGVyUHJvZ3JhbS51c2UoKTtcclxuXHJcbiAgICBnbC51bmlmb3JtTWF0cml4M2Z2KCBzaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudU1vZGVsVmlld01hdHJpeCwgZmFsc2UsIG1vZGVsVmlld01hdHJpeC5jb3B5VG9BcnJheSggc2NyYXRjaEZsb2F0QXJyYXkgKSApO1xyXG4gICAgZ2wudW5pZm9ybU1hdHJpeDNmdiggc2hhZGVyUHJvZ3JhbS51bmlmb3JtTG9jYXRpb25zLnVQcm9qZWN0aW9uTWF0cml4LCBmYWxzZSwgcHJvamVjdGlvbk1hdHJpeC5jb3B5VG9BcnJheSggc2NyYXRjaEZsb2F0QXJyYXkgKSApO1xyXG5cclxuICAgIC8vIGFjdGl2YXRlIGFuZCBiaW5kIHRoZSB0ZXh0dXJlXHJcbiAgICBnbC5hY3RpdmVUZXh0dXJlKCBnbC5URVhUVVJFMCApO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoIGdsLlRFWFRVUkVfMkQsIHRoaXMudGV4dHVyZSApO1xyXG4gICAgZ2wudW5pZm9ybTFpKCBzaGFkZXJQcm9ncmFtLnVuaWZvcm1Mb2NhdGlvbnMudVNhbXBsZXIsIDAgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGVsZW1lbnQgZGF0YVxyXG4gICAgZ2wuZHJhd0VsZW1lbnRzKCBnbC5UUklBTkdMRV9TVFJJUCwgdGhpcy5ub2RlLm51bUFjdGl2ZVBhcnRpY2xlcyAqIDYgLSAyLCBnbC5VTlNJR05FRF9TSE9SVCwgMCApO1xyXG5cclxuICAgIHNoYWRlclByb2dyYW0udW51c2UoKTtcclxuXHJcbiAgICByZXR1cm4gV2ViR0xOb2RlLlBBSU5URURfU09NRVRISU5HO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVsZWFzZXMgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5zaGFkZXJQcm9ncmFtLmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKCB0aGlzLnZlcnRleEJ1ZmZlciApO1xyXG4gICAgdGhpcy5nbC5kZWxldGVUZXh0dXJlKCB0aGlzLnRleHR1cmUgKTtcclxuICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKCB0aGlzLmVsZW1lbnRCdWZmZXIgKTtcclxuICAgIHRoaXMuc2hhZGVyUHJvZ3JhbSA9IG51bGw7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZXNXZWJHTE5vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLGFBQWEsRUFBRUMsU0FBUyxRQUFRLG1DQUFtQztBQUM1RSxPQUFPQyxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLFlBQVksTUFBTSwwQkFBMEI7QUFDbkQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCOztBQUVoRTtBQUNBLE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUM1QixNQUFNQyxxQkFBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqQyxNQUFNQywwQkFBMEIsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxNQUFNQyx5QkFBeUIsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFNQyx5QkFBeUIsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJQyxZQUFZLENBQUUsQ0FBRSxDQUFDO0FBRS9DLE1BQU1DLGtCQUFrQixTQUFTWCxTQUFTLENBQUM7RUFFekM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRVksV0FBV0EsQ0FBRUMsV0FBVyxFQUFFQyxrQkFBa0IsRUFBRUMsa0JBQWtCLEVBQUVDLE1BQU0sRUFBRztJQUN6RSxLQUFLLENBQUVDLGdCQUFnQixFQUFFO01BQ3ZCQyxZQUFZLEVBQUVGO0lBQ2hCLENBQUUsQ0FBQzs7SUFFSDtJQUNBLElBQUksQ0FBQ0gsV0FBVyxHQUFHQSxXQUFXLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUNDLGtCQUFrQixHQUFHQSxrQkFBa0IsQ0FBQyxDQUFDO0lBQzlDLElBQUksQ0FBQ0ssd0JBQXdCLEdBQUdMLGtCQUFrQixDQUFDTSxTQUFTLENBQUMs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