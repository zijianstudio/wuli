// Copyright 2016-2022, University of Colorado Boulder

/**
 * The space in which atoms and alpha particles are rendered.  The particles can be represented two
 * ways, 'nucleus' and 'particle'.  When represented by a nucleus, the particle is shown as an image of
 * two protons and two neutrons.  When represented as a particle, it is represented as a small magenta
 * circle.
 *
 * @author Dave Schmitz (Schmitzware)
 * @author Jesse Greenberg
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { CanvasNode, Color } from '../../../../scenery/js/imports.js';
import rutherfordScattering from '../../rutherfordScattering.js';
import RSColors from '../RSColors.js';
import RSConstants from '../RSConstants.js';
import ParticleNodeFactory from './ParticleNodeFactory.js';

// constants
const SPACE_BORDER_WIDTH = 2;
const SPACE_BORDER_COLOR = 'grey';
const PARTICLE_TRACE_WIDTH = 1.5;
const FADEOUT_SEGMENTS = 80;
class ParticleSpaceNode extends CanvasNode {
  /**
   * @param {atomSpace} atomSpace - space containing atoms and particles
   * @param {Property} showAlphaTraceProperty
   * @param {ModelViewTransform2} modelViewTransform - model to view  transform
   * @param {Object} config - must contain a canvasBounds attribute of type Bounds2
   */
  constructor(atomSpace, showAlphaTraceProperty, modelViewTransform, config) {
    config = merge({
      // {Bounds2}
      canvasBounds: required(config.canvasBounds),
      particleStyle: 'nucleus',
      // 'nucleus'|'particle'
      particleTraceColor: new Color(255, 0, 255)
    }, config);

    // the bounds should be eroded by 10 so it appears that particles glide into the space
    config.canvasBounds = config.canvasBounds.eroded(RSConstants.SPACE_BUFFER);
    super(config);
    this.particleStyle = config.particleStyle;
    this.particleTraceColor = config.particleTraceColor;

    // @private
    this.atomSpace = atomSpace;

    // @private
    this.alphaParticleImage = null;

    // @private - model to view coordinate transform
    this.modelViewTransform = modelViewTransform;

    // @private
    this.showAlphaTraceProperty = showAlphaTraceProperty;

    // @private
    this.particleTraceColorWithFade = `rgba(${config.particleTraceColor.r},${config.particleTraceColor.g},${config.particleTraceColor.b},{0})`;

    // @private - the area to be used as the 'viewport', border not included
    this.clipRect = {
      x: this.canvasBounds.getX() + SPACE_BORDER_WIDTH / 2,
      y: this.canvasBounds.getY() + SPACE_BORDER_WIDTH / 2,
      width: this.canvasBounds.getWidth() - SPACE_BORDER_WIDTH,
      height: this.canvasBounds.getHeight() - SPACE_BORDER_WIDTH
    };

    // create a single alpha particle image to use for rendering all particles - asynchronous
    let alphaParticle;
    if (this.particleStyle === 'nucleus') {
      alphaParticle = ParticleNodeFactory.createNucleusAlpha();
    } else if (this.particleStyle === 'particle') {
      alphaParticle = ParticleNodeFactory.createParticleAlpha();
    }
    alphaParticle.toImage((image, x, y) => {
      this.alphaParticleImage = image;
      this.particleImageHalfWidth = this.alphaParticleImage.width / 2;
      this.particleImageHalfHeight = this.alphaParticleImage.height / 2;
    });
    this.invalidatePaint();
  }

  /**
   * A no/op function to be implemented by derived objects
   * @param {CanvasRenderingContext2D} context
   * @protected
   */
  paintSpace(context) {
    assert && assert(false, 'subtype needs to implement');
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @override
   * @private
   */
  paintCanvas(context) {
    const bounds = this.canvasBounds;
    const renderTrace = this.showAlphaTraceProperty.value;

    // clear
    context.clearRect(bounds.getX(), bounds.getY(), bounds.getWidth(), bounds.getHeight());

    // border
    context.beginPath();
    context.lineWidth = SPACE_BORDER_WIDTH;
    context.strokeStyle = SPACE_BORDER_COLOR;
    context.rect(bounds.getX(), bounds.getY(), bounds.getWidth(), bounds.getHeight());
    context.stroke();

    // viewport clip
    context.beginPath();
    context.strokeStyle = 'transparent';
    context.fillStyle = RSColors.backgroundColorProperty.get().toCSS();
    context.rect(this.clipRect.x, this.clipRect.y, this.clipRect.width, this.clipRect.height);
    context.stroke();
    context.fill();
    context.clip();

    // render derived space
    this.paintSpace(context);

    // Slight chance the image used isn't loaded. In that case, return & try again on next frame
    if (this.alphaParticleImage === null) {
      return;
    }

    // render all alpha particles & corresponding traces in the space
    this.renderAlphaParticles(context, this.atomSpace, renderTrace);
  }

  /**
   * Render alpha particles that belong to a parent particleContainer
   * @param  {Context2D} context
   * @param  {Atom|AtomSpace} particleContainer
   * @param  {boolean} renderTrace
   * @private
   */
  renderAlphaParticles(context, particleContainer, renderTrace) {
    if (renderTrace) {
      // if style is 'nucleus' we can get away with rendering with one path for performance
      if (this.particleStyle === 'nucleus') {
        context.beginPath();
        context.lineWidth = PARTICLE_TRACE_WIDTH;
        context.strokeStyle = this.particleTraceColor.getCanvasStyle();
      }
    }
    particleContainer.particles.forEach(particle => {
      // render the traces (if enabled)
      if (renderTrace) {
        // add trace segments
        for (let i = 1; i < particle.positions.length; i++) {
          if (this.particleStyle === 'particle') {
            // if the style is of a 'particle', each segment needs a new path to create the gradient effect
            context.beginPath();
          }
          const segmentStartViewPosition = this.modelViewTransform.modelToViewPosition(particle.positions[i - 1]);
          context.moveTo(segmentStartViewPosition.x, segmentStartViewPosition.y);
          const segmentEndViewPosition = this.modelViewTransform.modelToViewPosition(particle.positions[i]);
          context.lineTo(segmentEndViewPosition.x, segmentEndViewPosition.y);
          if (this.particleStyle === 'particle') {
            // only the last FADEOUT_SEGMENTS should be visible, map i to the opacity
            const length = particle.positions.length;
            const alpha = Utils.linear(length - FADEOUT_SEGMENTS, length, 0, 0.5, i);
            const strokeStyle = StringUtils.format(this.particleTraceColorWithFade, alpha);
            context.strokeStyle = strokeStyle;
            context.stroke();
            context.closePath();
          }
        }
      }

      // render particle
      const particleViewPosition = this.modelViewTransform.modelToViewPosition(particle.positionProperty.get());
      context.drawImage(this.alphaParticleImage, particleViewPosition.x - this.particleImageHalfWidth, particleViewPosition.y - this.particleImageHalfHeight);
    });

    // render traces as single path in nucleus representation for performance
    if (renderTrace) {
      if (this.particleStyle === 'nucleus') {
        context.stroke();
      }
    }
  }
}
rutherfordScattering.register('ParticleSpaceNode', ParticleSpaceNode);
export default ParticleSpaceNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm1lcmdlIiwicmVxdWlyZWQiLCJTdHJpbmdVdGlscyIsIkNhbnZhc05vZGUiLCJDb2xvciIsInJ1dGhlcmZvcmRTY2F0dGVyaW5nIiwiUlNDb2xvcnMiLCJSU0NvbnN0YW50cyIsIlBhcnRpY2xlTm9kZUZhY3RvcnkiLCJTUEFDRV9CT1JERVJfV0lEVEgiLCJTUEFDRV9CT1JERVJfQ09MT1IiLCJQQVJUSUNMRV9UUkFDRV9XSURUSCIsIkZBREVPVVRfU0VHTUVOVFMiLCJQYXJ0aWNsZVNwYWNlTm9kZSIsImNvbnN0cnVjdG9yIiwiYXRvbVNwYWNlIiwic2hvd0FscGhhVHJhY2VQcm9wZXJ0eSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNvbmZpZyIsImNhbnZhc0JvdW5kcyIsInBhcnRpY2xlU3R5bGUiLCJwYXJ0aWNsZVRyYWNlQ29sb3IiLCJlcm9kZWQiLCJTUEFDRV9CVUZGRVIiLCJhbHBoYVBhcnRpY2xlSW1hZ2UiLCJwYXJ0aWNsZVRyYWNlQ29sb3JXaXRoRmFkZSIsInIiLCJnIiwiYiIsImNsaXBSZWN0IiwieCIsImdldFgiLCJ5IiwiZ2V0WSIsIndpZHRoIiwiZ2V0V2lkdGgiLCJoZWlnaHQiLCJnZXRIZWlnaHQiLCJhbHBoYVBhcnRpY2xlIiwiY3JlYXRlTnVjbGV1c0FscGhhIiwiY3JlYXRlUGFydGljbGVBbHBoYSIsInRvSW1hZ2UiLCJpbWFnZSIsInBhcnRpY2xlSW1hZ2VIYWxmV2lkdGgiLCJwYXJ0aWNsZUltYWdlSGFsZkhlaWdodCIsImludmFsaWRhdGVQYWludCIsInBhaW50U3BhY2UiLCJjb250ZXh0IiwiYXNzZXJ0IiwicGFpbnRDYW52YXMiLCJib3VuZHMiLCJyZW5kZXJUcmFjZSIsInZhbHVlIiwiY2xlYXJSZWN0IiwiYmVnaW5QYXRoIiwibGluZVdpZHRoIiwic3Ryb2tlU3R5bGUiLCJyZWN0Iiwic3Ryb2tlIiwiZmlsbFN0eWxlIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJnZXQiLCJ0b0NTUyIsImZpbGwiLCJjbGlwIiwicmVuZGVyQWxwaGFQYXJ0aWNsZXMiLCJwYXJ0aWNsZUNvbnRhaW5lciIsImdldENhbnZhc1N0eWxlIiwicGFydGljbGVzIiwiZm9yRWFjaCIsInBhcnRpY2xlIiwiaSIsInBvc2l0aW9ucyIsImxlbmd0aCIsInNlZ21lbnRTdGFydFZpZXdQb3NpdGlvbiIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJtb3ZlVG8iLCJzZWdtZW50RW5kVmlld1Bvc2l0aW9uIiwibGluZVRvIiwiYWxwaGEiLCJsaW5lYXIiLCJmb3JtYXQiLCJjbG9zZVBhdGgiLCJwYXJ0aWNsZVZpZXdQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJkcmF3SW1hZ2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBhcnRpY2xlU3BhY2VOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBzcGFjZSBpbiB3aGljaCBhdG9tcyBhbmQgYWxwaGEgcGFydGljbGVzIGFyZSByZW5kZXJlZC4gIFRoZSBwYXJ0aWNsZXMgY2FuIGJlIHJlcHJlc2VudGVkIHR3b1xyXG4gKiB3YXlzLCAnbnVjbGV1cycgYW5kICdwYXJ0aWNsZScuICBXaGVuIHJlcHJlc2VudGVkIGJ5IGEgbnVjbGV1cywgdGhlIHBhcnRpY2xlIGlzIHNob3duIGFzIGFuIGltYWdlIG9mXHJcbiAqIHR3byBwcm90b25zIGFuZCB0d28gbmV1dHJvbnMuICBXaGVuIHJlcHJlc2VudGVkIGFzIGEgcGFydGljbGUsIGl0IGlzIHJlcHJlc2VudGVkIGFzIGEgc21hbGwgbWFnZW50YVxyXG4gKiBjaXJjbGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgRGF2ZSBTY2htaXR6IChTY2htaXR6d2FyZSlcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCByZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvcmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzTm9kZSwgQ29sb3IgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcnV0aGVyZm9yZFNjYXR0ZXJpbmcgZnJvbSAnLi4vLi4vcnV0aGVyZm9yZFNjYXR0ZXJpbmcuanMnO1xyXG5pbXBvcnQgUlNDb2xvcnMgZnJvbSAnLi4vUlNDb2xvcnMuanMnO1xyXG5pbXBvcnQgUlNDb25zdGFudHMgZnJvbSAnLi4vUlNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUGFydGljbGVOb2RlRmFjdG9yeSBmcm9tICcuL1BhcnRpY2xlTm9kZUZhY3RvcnkuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNQQUNFX0JPUkRFUl9XSURUSCA9IDI7XHJcbmNvbnN0IFNQQUNFX0JPUkRFUl9DT0xPUiA9ICdncmV5JztcclxuY29uc3QgUEFSVElDTEVfVFJBQ0VfV0lEVEggPSAxLjU7XHJcbmNvbnN0IEZBREVPVVRfU0VHTUVOVFMgPSA4MDtcclxuXHJcbmNsYXNzIFBhcnRpY2xlU3BhY2VOb2RlIGV4dGVuZHMgQ2FudmFzTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7YXRvbVNwYWNlfSBhdG9tU3BhY2UgLSBzcGFjZSBjb250YWluaW5nIGF0b21zIGFuZCBwYXJ0aWNsZXNcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5fSBzaG93QWxwaGFUcmFjZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm0gLSBtb2RlbCB0byB2aWV3ICB0cmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnIC0gbXVzdCBjb250YWluIGEgY2FudmFzQm91bmRzIGF0dHJpYnV0ZSBvZiB0eXBlIEJvdW5kczJcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYXRvbVNwYWNlLCBzaG93QWxwaGFUcmFjZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGNvbmZpZyApIHtcclxuICAgIGNvbmZpZyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyB7Qm91bmRzMn1cclxuICAgICAgY2FudmFzQm91bmRzOiByZXF1aXJlZCggY29uZmlnLmNhbnZhc0JvdW5kcyApLFxyXG4gICAgICBwYXJ0aWNsZVN0eWxlOiAnbnVjbGV1cycsIC8vICdudWNsZXVzJ3wncGFydGljbGUnXHJcbiAgICAgIHBhcnRpY2xlVHJhY2VDb2xvcjogbmV3IENvbG9yKCAyNTUsIDAsIDI1NSApXHJcbiAgICB9LCBjb25maWcgKTtcclxuXHJcbiAgICAvLyB0aGUgYm91bmRzIHNob3VsZCBiZSBlcm9kZWQgYnkgMTAgc28gaXQgYXBwZWFycyB0aGF0IHBhcnRpY2xlcyBnbGlkZSBpbnRvIHRoZSBzcGFjZVxyXG4gICAgY29uZmlnLmNhbnZhc0JvdW5kcyA9IGNvbmZpZy5jYW52YXNCb3VuZHMuZXJvZGVkKCBSU0NvbnN0YW50cy5TUEFDRV9CVUZGRVIgKTtcclxuXHJcbiAgICBzdXBlciggY29uZmlnICk7XHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZVN0eWxlID0gY29uZmlnLnBhcnRpY2xlU3R5bGU7XHJcbiAgICB0aGlzLnBhcnRpY2xlVHJhY2VDb2xvciA9IGNvbmZpZy5wYXJ0aWNsZVRyYWNlQ29sb3I7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYXRvbVNwYWNlID0gYXRvbVNwYWNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLmFscGhhUGFydGljbGVJbWFnZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtb2RlbCB0byB2aWV3IGNvb3JkaW5hdGUgdHJhbnNmb3JtXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zaG93QWxwaGFUcmFjZVByb3BlcnR5ID0gc2hvd0FscGhhVHJhY2VQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5wYXJ0aWNsZVRyYWNlQ29sb3JXaXRoRmFkZSA9IGByZ2JhKCR7Y29uZmlnLnBhcnRpY2xlVHJhY2VDb2xvci5yfSwke2NvbmZpZy5wYXJ0aWNsZVRyYWNlQ29sb3IuZ30sJHtjb25maWcucGFydGljbGVUcmFjZUNvbG9yLmJ9LHswfSlgO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlIGFyZWEgdG8gYmUgdXNlZCBhcyB0aGUgJ3ZpZXdwb3J0JywgYm9yZGVyIG5vdCBpbmNsdWRlZFxyXG4gICAgdGhpcy5jbGlwUmVjdCA9IHtcclxuICAgICAgeDogdGhpcy5jYW52YXNCb3VuZHMuZ2V0WCgpICsgU1BBQ0VfQk9SREVSX1dJRFRIIC8gMixcclxuICAgICAgeTogdGhpcy5jYW52YXNCb3VuZHMuZ2V0WSgpICsgU1BBQ0VfQk9SREVSX1dJRFRIIC8gMixcclxuICAgICAgd2lkdGg6IHRoaXMuY2FudmFzQm91bmRzLmdldFdpZHRoKCkgLSBTUEFDRV9CT1JERVJfV0lEVEgsXHJcbiAgICAgIGhlaWdodDogdGhpcy5jYW52YXNCb3VuZHMuZ2V0SGVpZ2h0KCkgLSBTUEFDRV9CT1JERVJfV0lEVEhcclxuICAgIH07XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgc2luZ2xlIGFscGhhIHBhcnRpY2xlIGltYWdlIHRvIHVzZSBmb3IgcmVuZGVyaW5nIGFsbCBwYXJ0aWNsZXMgLSBhc3luY2hyb25vdXNcclxuICAgIGxldCBhbHBoYVBhcnRpY2xlO1xyXG4gICAgaWYgKCB0aGlzLnBhcnRpY2xlU3R5bGUgPT09ICdudWNsZXVzJyApIHtcclxuICAgICAgYWxwaGFQYXJ0aWNsZSA9IFBhcnRpY2xlTm9kZUZhY3RvcnkuY3JlYXRlTnVjbGV1c0FscGhhKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5wYXJ0aWNsZVN0eWxlID09PSAncGFydGljbGUnICkge1xyXG4gICAgICBhbHBoYVBhcnRpY2xlID0gUGFydGljbGVOb2RlRmFjdG9yeS5jcmVhdGVQYXJ0aWNsZUFscGhhKCk7XHJcbiAgICB9XHJcbiAgICBhbHBoYVBhcnRpY2xlLnRvSW1hZ2UoICggaW1hZ2UsIHgsIHkgKSA9PiB7XHJcbiAgICAgIHRoaXMuYWxwaGFQYXJ0aWNsZUltYWdlID0gaW1hZ2U7XHJcbiAgICAgIHRoaXMucGFydGljbGVJbWFnZUhhbGZXaWR0aCA9IHRoaXMuYWxwaGFQYXJ0aWNsZUltYWdlLndpZHRoIC8gMjtcclxuICAgICAgdGhpcy5wYXJ0aWNsZUltYWdlSGFsZkhlaWdodCA9IHRoaXMuYWxwaGFQYXJ0aWNsZUltYWdlLmhlaWdodCAvIDI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbnZhbGlkYXRlUGFpbnQoKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBBIG5vL29wIGZ1bmN0aW9uIHRvIGJlIGltcGxlbWVudGVkIGJ5IGRlcml2ZWQgb2JqZWN0c1xyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqL1xyXG4gIHBhaW50U3BhY2UoIGNvbnRleHQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ3N1YnR5cGUgbmVlZHMgdG8gaW1wbGVtZW50JyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IGNvbnRleHRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xyXG5cclxuICAgIGNvbnN0IGJvdW5kcyA9IHRoaXMuY2FudmFzQm91bmRzO1xyXG4gICAgY29uc3QgcmVuZGVyVHJhY2UgPSB0aGlzLnNob3dBbHBoYVRyYWNlUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gY2xlYXJcclxuICAgIGNvbnRleHQuY2xlYXJSZWN0KCBib3VuZHMuZ2V0WCgpLCBib3VuZHMuZ2V0WSgpLCBib3VuZHMuZ2V0V2lkdGgoKSwgYm91bmRzLmdldEhlaWdodCgpICk7XHJcblxyXG4gICAgLy8gYm9yZGVyXHJcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgY29udGV4dC5saW5lV2lkdGggPSBTUEFDRV9CT1JERVJfV0lEVEg7XHJcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gU1BBQ0VfQk9SREVSX0NPTE9SO1xyXG4gICAgY29udGV4dC5yZWN0KCBib3VuZHMuZ2V0WCgpLCBib3VuZHMuZ2V0WSgpLCBib3VuZHMuZ2V0V2lkdGgoKSwgYm91bmRzLmdldEhlaWdodCgpICk7XHJcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG5cclxuICAgIC8vIHZpZXdwb3J0IGNsaXBcclxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ3RyYW5zcGFyZW50JztcclxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gUlNDb2xvcnMuYmFja2dyb3VuZENvbG9yUHJvcGVydHkuZ2V0KCkudG9DU1MoKTtcclxuICAgIGNvbnRleHQucmVjdCggdGhpcy5jbGlwUmVjdC54LCB0aGlzLmNsaXBSZWN0LnksIHRoaXMuY2xpcFJlY3Qud2lkdGgsIHRoaXMuY2xpcFJlY3QuaGVpZ2h0ICk7XHJcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG4gICAgY29udGV4dC5maWxsKCk7XHJcbiAgICBjb250ZXh0LmNsaXAoKTtcclxuXHJcbiAgICAvLyByZW5kZXIgZGVyaXZlZCBzcGFjZVxyXG4gICAgdGhpcy5wYWludFNwYWNlKCBjb250ZXh0ICk7XHJcblxyXG4gICAgLy8gU2xpZ2h0IGNoYW5jZSB0aGUgaW1hZ2UgdXNlZCBpc24ndCBsb2FkZWQuIEluIHRoYXQgY2FzZSwgcmV0dXJuICYgdHJ5IGFnYWluIG9uIG5leHQgZnJhbWVcclxuICAgIGlmICggdGhpcy5hbHBoYVBhcnRpY2xlSW1hZ2UgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW5kZXIgYWxsIGFscGhhIHBhcnRpY2xlcyAmIGNvcnJlc3BvbmRpbmcgdHJhY2VzIGluIHRoZSBzcGFjZVxyXG4gICAgdGhpcy5yZW5kZXJBbHBoYVBhcnRpY2xlcyggY29udGV4dCwgdGhpcy5hdG9tU3BhY2UsIHJlbmRlclRyYWNlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW5kZXIgYWxwaGEgcGFydGljbGVzIHRoYXQgYmVsb25nIHRvIGEgcGFyZW50IHBhcnRpY2xlQ29udGFpbmVyXHJcbiAgICogQHBhcmFtICB7Q29udGV4dDJEfSBjb250ZXh0XHJcbiAgICogQHBhcmFtICB7QXRvbXxBdG9tU3BhY2V9IHBhcnRpY2xlQ29udGFpbmVyXHJcbiAgICogQHBhcmFtICB7Ym9vbGVhbn0gcmVuZGVyVHJhY2VcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlbmRlckFscGhhUGFydGljbGVzKCBjb250ZXh0LCBwYXJ0aWNsZUNvbnRhaW5lciwgcmVuZGVyVHJhY2UgKSB7XHJcbiAgICBpZiAoIHJlbmRlclRyYWNlICkge1xyXG5cclxuICAgICAgLy8gaWYgc3R5bGUgaXMgJ251Y2xldXMnIHdlIGNhbiBnZXQgYXdheSB3aXRoIHJlbmRlcmluZyB3aXRoIG9uZSBwYXRoIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgICBpZiAoIHRoaXMucGFydGljbGVTdHlsZSA9PT0gJ251Y2xldXMnICkge1xyXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBQQVJUSUNMRV9UUkFDRV9XSURUSDtcclxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gdGhpcy5wYXJ0aWNsZVRyYWNlQ29sb3IuZ2V0Q2FudmFzU3R5bGUoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnRpY2xlQ29udGFpbmVyLnBhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcblxyXG4gICAgICAvLyByZW5kZXIgdGhlIHRyYWNlcyAoaWYgZW5hYmxlZClcclxuICAgICAgaWYgKCByZW5kZXJUcmFjZSApIHtcclxuXHJcbiAgICAgICAgLy8gYWRkIHRyYWNlIHNlZ21lbnRzXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAxOyBpIDwgcGFydGljbGUucG9zaXRpb25zLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLnBhcnRpY2xlU3R5bGUgPT09ICdwYXJ0aWNsZScgKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiB0aGUgc3R5bGUgaXMgb2YgYSAncGFydGljbGUnLCBlYWNoIHNlZ21lbnQgbmVlZHMgYSBuZXcgcGF0aCB0byBjcmVhdGUgdGhlIGdyYWRpZW50IGVmZmVjdFxyXG4gICAgICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHNlZ21lbnRTdGFydFZpZXdQb3NpdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBhcnRpY2xlLnBvc2l0aW9uc1sgaSAtIDEgXSApO1xyXG4gICAgICAgICAgY29udGV4dC5tb3ZlVG8oIHNlZ21lbnRTdGFydFZpZXdQb3NpdGlvbi54LCBzZWdtZW50U3RhcnRWaWV3UG9zaXRpb24ueSApO1xyXG4gICAgICAgICAgY29uc3Qgc2VnbWVudEVuZFZpZXdQb3NpdGlvbiA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBhcnRpY2xlLnBvc2l0aW9uc1sgaSBdICk7XHJcbiAgICAgICAgICBjb250ZXh0LmxpbmVUbyggc2VnbWVudEVuZFZpZXdQb3NpdGlvbi54LCBzZWdtZW50RW5kVmlld1Bvc2l0aW9uLnkgKTtcclxuXHJcbiAgICAgICAgICBpZiAoIHRoaXMucGFydGljbGVTdHlsZSA9PT0gJ3BhcnRpY2xlJyApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG9ubHkgdGhlIGxhc3QgRkFERU9VVF9TRUdNRU5UUyBzaG91bGQgYmUgdmlzaWJsZSwgbWFwIGkgdG8gdGhlIG9wYWNpdHlcclxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gcGFydGljbGUucG9zaXRpb25zLmxlbmd0aDtcclxuICAgICAgICAgICAgY29uc3QgYWxwaGEgPSBVdGlscy5saW5lYXIoIGxlbmd0aCAtIEZBREVPVVRfU0VHTUVOVFMsIGxlbmd0aCwgMCwgMC41LCBpICk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0cm9rZVN0eWxlID0gU3RyaW5nVXRpbHMuZm9ybWF0KCB0aGlzLnBhcnRpY2xlVHJhY2VDb2xvcldpdGhGYWRlLCBhbHBoYSApO1xyXG4gICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGU7XHJcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XHJcbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyByZW5kZXIgcGFydGljbGVcclxuICAgICAgY29uc3QgcGFydGljbGVWaWV3UG9zaXRpb24gPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKCB0aGlzLmFscGhhUGFydGljbGVJbWFnZSxcclxuICAgICAgICBwYXJ0aWNsZVZpZXdQb3NpdGlvbi54IC0gdGhpcy5wYXJ0aWNsZUltYWdlSGFsZldpZHRoLFxyXG4gICAgICAgIHBhcnRpY2xlVmlld1Bvc2l0aW9uLnkgLSB0aGlzLnBhcnRpY2xlSW1hZ2VIYWxmSGVpZ2h0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVuZGVyIHRyYWNlcyBhcyBzaW5nbGUgcGF0aCBpbiBudWNsZXVzIHJlcHJlc2VudGF0aW9uIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgaWYgKCByZW5kZXJUcmFjZSApIHtcclxuICAgICAgaWYgKCB0aGlzLnBhcnRpY2xlU3R5bGUgPT09ICdudWNsZXVzJyApIHtcclxuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5ydXRoZXJmb3JkU2NhdHRlcmluZy5yZWdpc3RlciggJ1BhcnRpY2xlU3BhY2VOb2RlJywgUGFydGljbGVTcGFjZU5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFBhcnRpY2xlU3BhY2VOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsU0FBU0MsVUFBVSxFQUFFQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxRQUFRLE1BQU0sZ0JBQWdCO0FBQ3JDLE9BQU9DLFdBQVcsTUFBTSxtQkFBbUI7QUFDM0MsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCOztBQUUxRDtBQUNBLE1BQU1DLGtCQUFrQixHQUFHLENBQUM7QUFDNUIsTUFBTUMsa0JBQWtCLEdBQUcsTUFBTTtBQUNqQyxNQUFNQyxvQkFBb0IsR0FBRyxHQUFHO0FBQ2hDLE1BQU1D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