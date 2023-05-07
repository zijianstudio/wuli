// Copyright 2021, University of Colorado Boulder

/**
 * ParticleNode is the view for a particle. It is responsible for the visual representation of a particle,
 * and keeping that visual representation synchronized with a Particle instance.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import exampleSim from '../../exampleSim.js';
class ParticleNode extends ShadedSphereNode {
  /**
   * @param {Particle} particle - the model of a particle
   * @param {ModelViewTransform2} modelViewTransform - transform between model and view coordinates
   * @param {Options} [options]
   */
  constructor(particle, modelViewTransform, options) {
    options = merge({
      // ShadedSphereNode options
      mainColor: particle.color
    }, options);
    super(modelViewTransform.modelToViewDeltaX(particle.diameter), options);

    // @public (read-only)
    this.particle = particle;

    // Update the view position to match the model position.
    // Note that we're applying the transform from model to view coordinates.
    particle.positionProperty.link(position => {
      this.translation = modelViewTransform.modelToViewPosition(position);
    });

    // Update opacity to match the model.
    particle.opacityProperty.link(opacity => {
      this.opacity = opacity;
    });
  }
}
exampleSim.register('ParticleNode', ParticleNode);
export default ParticleNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlNoYWRlZFNwaGVyZU5vZGUiLCJleGFtcGxlU2ltIiwiUGFydGljbGVOb2RlIiwiY29uc3RydWN0b3IiLCJwYXJ0aWNsZSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJtYWluQ29sb3IiLCJjb2xvciIsIm1vZGVsVG9WaWV3RGVsdGFYIiwiZGlhbWV0ZXIiLCJwb3NpdGlvblByb3BlcnR5IiwibGluayIsInBvc2l0aW9uIiwidHJhbnNsYXRpb24iLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwib3BhY2l0eVByb3BlcnR5Iiwib3BhY2l0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBQYXJ0aWNsZU5vZGUgaXMgdGhlIHZpZXcgZm9yIGEgcGFydGljbGUuIEl0IGlzIHJlc3BvbnNpYmxlIGZvciB0aGUgdmlzdWFsIHJlcHJlc2VudGF0aW9uIG9mIGEgcGFydGljbGUsXHJcbiAqIGFuZCBrZWVwaW5nIHRoYXQgdmlzdWFsIHJlcHJlc2VudGF0aW9uIHN5bmNocm9uaXplZCB3aXRoIGEgUGFydGljbGUgaW5zdGFuY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBTaGFkZWRTcGhlcmVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TaGFkZWRTcGhlcmVOb2RlLmpzJztcclxuaW1wb3J0IGV4YW1wbGVTaW0gZnJvbSAnLi4vLi4vZXhhbXBsZVNpbS5qcyc7XHJcblxyXG5jbGFzcyBQYXJ0aWNsZU5vZGUgZXh0ZW5kcyBTaGFkZWRTcGhlcmVOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZX0gcGFydGljbGUgLSB0aGUgbW9kZWwgb2YgYSBwYXJ0aWNsZVxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtIC0gdHJhbnNmb3JtIGJldHdlZW4gbW9kZWwgYW5kIHZpZXcgY29vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge09wdGlvbnN9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwYXJ0aWNsZSwgbW9kZWxWaWV3VHJhbnNmb3JtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gU2hhZGVkU3BoZXJlTm9kZSBvcHRpb25zXHJcbiAgICAgIG1haW5Db2xvcjogcGFydGljbGUuY29sb3JcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBwYXJ0aWNsZS5kaWFtZXRlciApLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KVxyXG4gICAgdGhpcy5wYXJ0aWNsZSA9IHBhcnRpY2xlO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdmlldyBwb3NpdGlvbiB0byBtYXRjaCB0aGUgbW9kZWwgcG9zaXRpb24uXHJcbiAgICAvLyBOb3RlIHRoYXQgd2UncmUgYXBwbHlpbmcgdGhlIHRyYW5zZm9ybSBmcm9tIG1vZGVsIHRvIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmxpbmsoIHBvc2l0aW9uID0+IHtcclxuICAgICAgdGhpcy50cmFuc2xhdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSBvcGFjaXR5IHRvIG1hdGNoIHRoZSBtb2RlbC5cclxuICAgIHBhcnRpY2xlLm9wYWNpdHlQcm9wZXJ0eS5saW5rKCBvcGFjaXR5ID0+IHtcclxuICAgICAgdGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmV4YW1wbGVTaW0ucmVnaXN0ZXIoICdQYXJ0aWNsZU5vZGUnLCBQYXJ0aWNsZU5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGFydGljbGVOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsZ0JBQWdCLE1BQU0saURBQWlEO0FBQzlFLE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFFNUMsTUFBTUMsWUFBWSxTQUFTRixnQkFBZ0IsQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsa0JBQWtCLEVBQUVDLE9BQU8sRUFBRztJQUVuREEsT0FBTyxHQUFHUCxLQUFLLENBQUU7TUFFZjtNQUNBUSxTQUFTLEVBQUVILFFBQVEsQ0FBQ0k7SUFDdEIsQ0FBQyxFQUFFRixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVELGtCQUFrQixDQUFDSSxpQkFBaUIsQ0FBRUwsUUFBUSxDQUFDTSxRQUFTLENBQUMsRUFBRUosT0FBUSxDQUFDOztJQUUzRTtJQUNBLElBQUksQ0FBQ0YsUUFBUSxHQUFHQSxRQUFROztJQUV4QjtJQUNBO0lBQ0FBLFFBQVEsQ0FBQ08sZ0JBQWdCLENBQUNDLElBQUksQ0FBRUMsUUFBUSxJQUFJO01BQzFDLElBQUksQ0FBQ0MsV0FBVyxHQUFHVCxrQkFBa0IsQ0FBQ1UsbUJBQW1CLENBQUVGLFFBQVMsQ0FBQztJQUN2RSxDQUFFLENBQUM7O0lBRUg7SUFDQVQsUUFBUSxDQUFDWSxlQUFlLENBQUNKLElBQUksQ0FBRUssT0FBTyxJQUFJO01BQ3hDLElBQUksQ0FBQ0EsT0FBTyxHQUFHQSxPQUFPO0lBQ3hCLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQWhCLFVBQVUsQ0FBQ2lCLFFBQVEsQ0FBRSxjQUFjLEVBQUVoQixZQUFhLENBQUM7QUFDbkQsZUFBZUEsWUFBWSJ9