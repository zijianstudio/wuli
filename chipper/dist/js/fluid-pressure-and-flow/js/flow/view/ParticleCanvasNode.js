// Copyright 2014-2021, University of Colorado Boulder

/**
 * A particle layer rendered on canvas
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class ParticleCanvasNode extends CanvasNode {
  /**
   * @param {ObservableArrayDef.<Particle>} particles that need to be rendered on the canvas
   * @param {ObservableArrayDef.<Particle>} gridParticles that need to be rendered on the canvas
   * @param {ModelViewTransform2} modelViewTransform to convert between model and view co-ordinate frames
   * @param {Object} [options]
   */
  constructor(particles, gridParticles, modelViewTransform, options) {
    super(options);
    this.particles = particles;
    this.gridParticles = gridParticles;
    this.modelViewTransform = modelViewTransform;
    this.invalidatePaint();
  }

  /**
   * Paints the particles on the canvas node.
   * @param {CanvasRenderingContext2D} context
   * @public
   */
  paintCanvas(context) {
    // paint the regular particles
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles.get(i);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(this.modelViewTransform.modelToViewX(particle.xPosition), this.modelViewTransform.modelToViewY(particle.getY()), this.modelViewTransform.modelToViewDeltaX(particle.radius), 0, 2 * Math.PI, true);
      context.fill();
    }

    // paint the grid particles
    for (let i = 0; i < this.gridParticles.length; i++) {
      const particle = this.gridParticles.get(i);
      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(this.modelViewTransform.modelToViewX(particle.xPosition), this.modelViewTransform.modelToViewY(particle.getY()), this.modelViewTransform.modelToViewDeltaX(particle.radius), 0, 2 * Math.PI, true);
      context.fill();
    }
  }

  /**
   * @public
   */
  step() {
    this.invalidatePaint();
  }
}
fluidPressureAndFlow.register('ParticleCanvasNode', ParticleCanvasNode);
export default ParticleCanvasNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYW52YXNOb2RlIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJQYXJ0aWNsZUNhbnZhc05vZGUiLCJjb25zdHJ1Y3RvciIsInBhcnRpY2xlcyIsImdyaWRQYXJ0aWNsZXMiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJvcHRpb25zIiwiaW52YWxpZGF0ZVBhaW50IiwicGFpbnRDYW52YXMiLCJjb250ZXh0IiwiaSIsImxlbmd0aCIsInBhcnRpY2xlIiwiZ2V0IiwiZmlsbFN0eWxlIiwiY29sb3IiLCJiZWdpblBhdGgiLCJhcmMiLCJtb2RlbFRvVmlld1giLCJ4UG9zaXRpb24iLCJtb2RlbFRvVmlld1kiLCJnZXRZIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJyYWRpdXMiLCJNYXRoIiwiUEkiLCJmaWxsIiwic3RlcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVDYW52YXNOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgcGFydGljbGUgbGF5ZXIgcmVuZGVyZWQgb24gY2FudmFzXHJcbiAqXHJcbiAqIEBhdXRob3IgU2lkZGhhcnRoYSBDaGludGhhcGFsbHkgKEFjdHVhbCBDb25jZXB0cylcclxuICovXHJcblxyXG5pbXBvcnQgeyBDYW52YXNOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGZsdWlkUHJlc3N1cmVBbmRGbG93IGZyb20gJy4uLy4uL2ZsdWlkUHJlc3N1cmVBbmRGbG93LmpzJztcclxuXHJcbmNsYXNzIFBhcnRpY2xlQ2FudmFzTm9kZSBleHRlbmRzIENhbnZhc05vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09ic2VydmFibGVBcnJheURlZi48UGFydGljbGU+fSBwYXJ0aWNsZXMgdGhhdCBuZWVkIHRvIGJlIHJlbmRlcmVkIG9uIHRoZSBjYW52YXNcclxuICAgKiBAcGFyYW0ge09ic2VydmFibGVBcnJheURlZi48UGFydGljbGU+fSBncmlkUGFydGljbGVzIHRoYXQgbmVlZCB0byBiZSByZW5kZXJlZCBvbiB0aGUgY2FudmFzXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm0gdG8gY29udmVydCBiZXR3ZWVuIG1vZGVsIGFuZCB2aWV3IGNvLW9yZGluYXRlIGZyYW1lc1xyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggcGFydGljbGVzLCBncmlkUGFydGljbGVzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnBhcnRpY2xlcyA9IHBhcnRpY2xlcztcclxuICAgIHRoaXMuZ3JpZFBhcnRpY2xlcyA9IGdyaWRQYXJ0aWNsZXM7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGFpbnRzIHRoZSBwYXJ0aWNsZXMgb24gdGhlIGNhbnZhcyBub2RlLlxyXG4gICAqIEBwYXJhbSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfSBjb250ZXh0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHBhaW50Q2FudmFzKCBjb250ZXh0ICkge1xyXG5cclxuICAgIC8vIHBhaW50IHRoZSByZWd1bGFyIHBhcnRpY2xlc1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXMuZ2V0KCBpICk7XHJcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gcGFydGljbGUuY29sb3I7XHJcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgIGNvbnRleHQuYXJjKCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBhcnRpY2xlLnhQb3NpdGlvbiApLFxyXG4gICAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcGFydGljbGUuZ2V0WSgpICksXHJcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIHBhcnRpY2xlLnJhZGl1cyApLCAwLCAyICogTWF0aC5QSSwgdHJ1ZSApO1xyXG4gICAgICBjb250ZXh0LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwYWludCB0aGUgZ3JpZCBwYXJ0aWNsZXNcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZFBhcnRpY2xlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcGFydGljbGUgPSB0aGlzLmdyaWRQYXJ0aWNsZXMuZ2V0KCBpICk7XHJcbiAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gcGFydGljbGUuY29sb3I7XHJcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XHJcbiAgICAgIGNvbnRleHQuYXJjKCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIHBhcnRpY2xlLnhQb3NpdGlvbiApLFxyXG4gICAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggcGFydGljbGUuZ2V0WSgpICksXHJcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIHBhcnRpY2xlLnJhZGl1cyApLCAwLCAyICogTWF0aC5QSSwgdHJ1ZSApO1xyXG4gICAgICBjb250ZXh0LmZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCgpIHtcclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ1BhcnRpY2xlQ2FudmFzTm9kZScsIFBhcnRpY2xlQ2FudmFzTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZUNhbnZhc05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFVBQVUsUUFBUSxtQ0FBbUM7QUFDOUQsT0FBT0Msb0JBQW9CLE1BQU0sK0JBQStCO0FBRWhFLE1BQU1DLGtCQUFrQixTQUFTRixVQUFVLENBQUM7RUFFMUM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLFNBQVMsRUFBRUMsYUFBYSxFQUFFQyxrQkFBa0IsRUFBRUMsT0FBTyxFQUFHO0lBRW5FLEtBQUssQ0FBRUEsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ0gsU0FBUyxHQUFHQSxTQUFTO0lBQzFCLElBQUksQ0FBQ0MsYUFBYSxHQUFHQSxhQUFhO0lBQ2xDLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUdBLGtCQUFrQjtJQUU1QyxJQUFJLENBQUNFLGVBQWUsQ0FBQyxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsT0FBTyxFQUFHO0lBRXJCO0lBQ0EsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUcsSUFBSSxDQUFDUCxTQUFTLENBQUNRLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFDaEQsTUFBTUUsUUFBUSxHQUFHLElBQUksQ0FBQ1QsU0FBUyxDQUFDVSxHQUFHLENBQUVILENBQUUsQ0FBQztNQUN4Q0QsT0FBTyxDQUFDSyxTQUFTLEdBQUdGLFFBQVEsQ0FBQ0csS0FBSztNQUNsQ04sT0FBTyxDQUFDTyxTQUFTLENBQUMsQ0FBQztNQUNuQlAsT0FBTyxDQUFDUSxHQUFHLENBQUUsSUFBSSxDQUFDWixrQkFBa0IsQ0FBQ2EsWUFBWSxDQUFFTixRQUFRLENBQUNPLFNBQVUsQ0FBQyxFQUNyRSxJQUFJLENBQUNkLGtCQUFrQixDQUFDZSxZQUFZLENBQUVSLFFBQVEsQ0FBQ1MsSUFBSSxDQUFDLENBQUUsQ0FBQyxFQUN2RCxJQUFJLENBQUNoQixrQkFBa0IsQ0FBQ2lCLGlCQUFpQixDQUFFVixRQUFRLENBQUNXLE1BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUdDLElBQUksQ0FBQ0MsRUFBRSxFQUFFLElBQUssQ0FBQztNQUN0RmhCLE9BQU8sQ0FBQ2lCLElBQUksQ0FBQyxDQUFDO0lBQ2hCOztJQUVBO0lBQ0EsS0FBTSxJQUFJaEIsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHLElBQUksQ0FBQ04sYUFBYSxDQUFDTyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFHO01BQ3BELE1BQU1FLFFBQVEsR0FBRyxJQUFJLENBQUNSLGFBQWEsQ0FBQ1MsR0FBRyxDQUFFSCxDQUFFLENBQUM7TUFDNUNELE9BQU8sQ0FBQ0ssU0FBUyxHQUFHRixRQUFRLENBQUNHLEtBQUs7TUFDbENOLE9BQU8sQ0FBQ08sU0FBUyxDQUFDLENBQUM7TUFDbkJQLE9BQU8sQ0FBQ1EsR0FBRyxDQUFFLElBQUksQ0FBQ1osa0JBQWtCLENBQUNhLFlBQVksQ0FBRU4sUUFBUSxDQUFDTyxTQUFVLENBQUMsRUFDckUsSUFBSSxDQUFDZCxrQkFBa0IsQ0FBQ2UsWUFBWSxDQUFFUixRQUFRLENBQUNTLElBQUksQ0FBQyxDQUFFLENBQUMsRUFDdkQsSUFBSSxDQUFDaEIsa0JBQWtCLENBQUNpQixpQkFBaUIsQ0FBRVYsUUFBUSxDQUFDVyxNQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHQyxJQUFJLENBQUNDLEVBQUUsRUFBRSxJQUFLLENBQUM7TUFDdEZoQixPQUFPLENBQUNpQixJQUFJLENBQUMsQ0FBQztJQUNoQjtFQUVGOztFQUVBO0FBQ0Y7QUFDQTtFQUNFQyxJQUFJQSxDQUFBLEVBQUc7SUFDTCxJQUFJLENBQUNwQixlQUFlLENBQUMsQ0FBQztFQUN4QjtBQUNGO0FBRUFQLG9CQUFvQixDQUFDNEIsUUFBUSxDQUFFLG9CQUFvQixFQUFFM0Isa0JBQW1CLENBQUM7QUFDekUsZUFBZUEsa0JBQWtCIn0=