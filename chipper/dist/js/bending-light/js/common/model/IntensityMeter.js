// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for the intensity meter, including the position of the sensor, body, the reading values, etc.
 * When multiple rays hit the sensor, they are summed up.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { Shape } from '../../../../kite/js/imports.js';
import bendingLight from '../../bendingLight.js';
import Reading from './Reading.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
class IntensityMeter {
  rayReadings = []; // accumulation of readings

  /**
   * @param sensorX - sensor x position in model coordinates
   * @param sensorY - sensor y position in model coordinates
   * @param bodyX - body x position in model coordinates
   * @param bodyY - body y position in model coordinates
   */
  constructor(sensorX, sensorY, bodyX, bodyY) {
    this.readingProperty = new Property(Reading.MISS); // value to show on the body
    this.sensorPositionProperty = new Vector2Property(new Vector2(sensorX, sensorY));
    this.bodyPositionProperty = new Vector2Property(new Vector2(bodyX, bodyY));
    this.enabledProperty = new BooleanProperty(false); // True if it is in the play area
  }

  // Restore the initial values.
  reset() {
    this.readingProperty.reset();
    this.sensorPositionProperty.reset();
    this.bodyPositionProperty.reset();
    this.enabledProperty.reset();
    this.rayReadings.length = 0;
  }

  // Copy the model for reuse in the toolbox node.
  copy() {
    return new IntensityMeter(this.sensorPositionProperty.get().x, this.sensorPositionProperty.get().y, this.bodyPositionProperty.get().x, this.bodyPositionProperty.get().y);
  }
  getSensorShape() {
    // fine tuned to match the given image
    const radius = 1E-6;
    return new Shape().arcPoint(this.sensorPositionProperty.get(), radius, 0, Math.PI * 2, false);
  }

  // Should be called before a model update so that values from last computation don't leak over into the next sum.
  clearRayReadings() {
    this.rayReadings = [];
    this.readingProperty.set(Reading.MISS);
  }

  /**
   * Add a new reading to the accumulator and update the readout
   * @param reading - intensity of the wave or MISS
   */
  addRayReading(reading) {
    this.rayReadings.push(reading);
    this.updateReading();
  }

  // Update the body text based on the accumulated Reading values
  updateReading() {
    // enumerate the hits
    const hits = [];
    this.rayReadings.forEach(rayReading => {
      if (rayReading.isHit()) {
        hits.push(rayReading);
      }
    });

    // if no hits, say "MISS"
    if (hits.length === 0) {
      this.readingProperty.set(Reading.MISS);
    } else {
      // otherwise, sum the intensities
      let total = 0.0;
      hits.forEach(hit => {
        total += hit.value;
      });
      this.readingProperty.set(new Reading(total));
    }
  }
}
bendingLight.register('IntensityMeter', IntensityMeter);
export default IntensityMeter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJTaGFwZSIsImJlbmRpbmdMaWdodCIsIlJlYWRpbmciLCJCb29sZWFuUHJvcGVydHkiLCJJbnRlbnNpdHlNZXRlciIsInJheVJlYWRpbmdzIiwiY29uc3RydWN0b3IiLCJzZW5zb3JYIiwic2Vuc29yWSIsImJvZHlYIiwiYm9keVkiLCJyZWFkaW5nUHJvcGVydHkiLCJNSVNTIiwic2Vuc29yUG9zaXRpb25Qcm9wZXJ0eSIsImJvZHlQb3NpdGlvblByb3BlcnR5IiwiZW5hYmxlZFByb3BlcnR5IiwicmVzZXQiLCJsZW5ndGgiLCJjb3B5IiwiZ2V0IiwieCIsInkiLCJnZXRTZW5zb3JTaGFwZSIsInJhZGl1cyIsImFyY1BvaW50IiwiTWF0aCIsIlBJIiwiY2xlYXJSYXlSZWFkaW5ncyIsInNldCIsImFkZFJheVJlYWRpbmciLCJyZWFkaW5nIiwicHVzaCIsInVwZGF0ZVJlYWRpbmciLCJoaXRzIiwiZm9yRWFjaCIsInJheVJlYWRpbmciLCJpc0hpdCIsInRvdGFsIiwiaGl0IiwidmFsdWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkludGVuc2l0eU1ldGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciB0aGUgaW50ZW5zaXR5IG1ldGVyLCBpbmNsdWRpbmcgdGhlIHBvc2l0aW9uIG9mIHRoZSBzZW5zb3IsIGJvZHksIHRoZSByZWFkaW5nIHZhbHVlcywgZXRjLlxyXG4gKiBXaGVuIG11bHRpcGxlIHJheXMgaGl0IHRoZSBzZW5zb3IsIHRoZXkgYXJlIHN1bW1lZCB1cC5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaGFuZHJhc2hla2FyIEJlbWFnb25pIChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJlbmRpbmdMaWdodCBmcm9tICcuLi8uLi9iZW5kaW5nTGlnaHQuanMnO1xyXG5pbXBvcnQgUmVhZGluZyBmcm9tICcuL1JlYWRpbmcuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuXHJcbmNsYXNzIEludGVuc2l0eU1ldGVyIHtcclxuICBwdWJsaWMgcmVhZG9ubHkgcmVhZGluZ1Byb3BlcnR5OiBQcm9wZXJ0eTxSZWFkaW5nPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc2Vuc29yUG9zaXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGJvZHlQb3NpdGlvblByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPjtcclxuICBwcml2YXRlIHJheVJlYWRpbmdzOiBSZWFkaW5nW10gPSBbXTsgLy8gYWNjdW11bGF0aW9uIG9mIHJlYWRpbmdzXHJcbiAgcHVibGljIHJlYWRvbmx5IGVuYWJsZWRQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gc2Vuc29yWCAtIHNlbnNvciB4IHBvc2l0aW9uIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIHNlbnNvclkgLSBzZW5zb3IgeSBwb3NpdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSBib2R5WCAtIGJvZHkgeCBwb3NpdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqIEBwYXJhbSBib2R5WSAtIGJvZHkgeSBwb3NpdGlvbiBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2Vuc29yWDogbnVtYmVyLCBzZW5zb3JZOiBudW1iZXIsIGJvZHlYOiBudW1iZXIsIGJvZHlZOiBudW1iZXIgKSB7XHJcblxyXG4gICAgdGhpcy5yZWFkaW5nUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIFJlYWRpbmcuTUlTUyApOyAvLyB2YWx1ZSB0byBzaG93IG9uIHRoZSBib2R5XHJcbiAgICB0aGlzLnNlbnNvclBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggc2Vuc29yWCwgc2Vuc29yWSApICk7XHJcbiAgICB0aGlzLmJvZHlQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIGJvZHlYLCBib2R5WSApICk7XHJcbiAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7IC8vIFRydWUgaWYgaXQgaXMgaW4gdGhlIHBsYXkgYXJlYVxyXG4gIH1cclxuXHJcbiAgLy8gUmVzdG9yZSB0aGUgaW5pdGlhbCB2YWx1ZXMuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZWFkaW5nUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2Vuc29yUG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5ib2R5UG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbmFibGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucmF5UmVhZGluZ3MubGVuZ3RoID0gMDtcclxuICB9XHJcblxyXG4gIC8vIENvcHkgdGhlIG1vZGVsIGZvciByZXVzZSBpbiB0aGUgdG9vbGJveCBub2RlLlxyXG4gIHB1YmxpYyBjb3B5KCk6IEludGVuc2l0eU1ldGVyIHtcclxuICAgIHJldHVybiBuZXcgSW50ZW5zaXR5TWV0ZXIoXHJcbiAgICAgIHRoaXMuc2Vuc29yUG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54LFxyXG4gICAgICB0aGlzLnNlbnNvclBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSxcclxuICAgICAgdGhpcy5ib2R5UG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54LFxyXG4gICAgICB0aGlzLmJvZHlQb3NpdGlvblByb3BlcnR5LmdldCgpLnlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U2Vuc29yU2hhcGUoKTogU2hhcGUge1xyXG5cclxuICAgIC8vIGZpbmUgdHVuZWQgdG8gbWF0Y2ggdGhlIGdpdmVuIGltYWdlXHJcbiAgICBjb25zdCByYWRpdXMgPSAxRS02O1xyXG4gICAgcmV0dXJuIG5ldyBTaGFwZSgpLmFyY1BvaW50KCB0aGlzLnNlbnNvclBvc2l0aW9uUHJvcGVydHkuZ2V0KCksIHJhZGl1cywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlICk7XHJcbiAgfVxyXG5cclxuICAvLyBTaG91bGQgYmUgY2FsbGVkIGJlZm9yZSBhIG1vZGVsIHVwZGF0ZSBzbyB0aGF0IHZhbHVlcyBmcm9tIGxhc3QgY29tcHV0YXRpb24gZG9uJ3QgbGVhayBvdmVyIGludG8gdGhlIG5leHQgc3VtLlxyXG4gIHB1YmxpYyBjbGVhclJheVJlYWRpbmdzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5yYXlSZWFkaW5ncyA9IFtdO1xyXG4gICAgdGhpcy5yZWFkaW5nUHJvcGVydHkuc2V0KCBSZWFkaW5nLk1JU1MgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIG5ldyByZWFkaW5nIHRvIHRoZSBhY2N1bXVsYXRvciBhbmQgdXBkYXRlIHRoZSByZWFkb3V0XHJcbiAgICogQHBhcmFtIHJlYWRpbmcgLSBpbnRlbnNpdHkgb2YgdGhlIHdhdmUgb3IgTUlTU1xyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRSYXlSZWFkaW5nKCByZWFkaW5nOiBSZWFkaW5nICk6IHZvaWQge1xyXG4gICAgdGhpcy5yYXlSZWFkaW5ncy5wdXNoKCByZWFkaW5nICk7XHJcbiAgICB0aGlzLnVwZGF0ZVJlYWRpbmcoKTtcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSB0aGUgYm9keSB0ZXh0IGJhc2VkIG9uIHRoZSBhY2N1bXVsYXRlZCBSZWFkaW5nIHZhbHVlc1xyXG4gIHByaXZhdGUgdXBkYXRlUmVhZGluZygpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBlbnVtZXJhdGUgdGhlIGhpdHNcclxuICAgIGNvbnN0IGhpdHM6IFJlYWRpbmdbXSA9IFtdO1xyXG4gICAgdGhpcy5yYXlSZWFkaW5ncy5mb3JFYWNoKCByYXlSZWFkaW5nID0+IHtcclxuICAgICAgaWYgKCByYXlSZWFkaW5nLmlzSGl0KCkgKSB7XHJcbiAgICAgICAgaGl0cy5wdXNoKCByYXlSZWFkaW5nICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBpZiBubyBoaXRzLCBzYXkgXCJNSVNTXCJcclxuICAgIGlmICggaGl0cy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHRoaXMucmVhZGluZ1Byb3BlcnR5LnNldCggUmVhZGluZy5NSVNTICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIG90aGVyd2lzZSwgc3VtIHRoZSBpbnRlbnNpdGllc1xyXG4gICAgICBsZXQgdG90YWwgPSAwLjA7XHJcbiAgICAgIGhpdHMuZm9yRWFjaCggKCBoaXQ6IFJlYWRpbmcgKSA9PiB7XHJcbiAgICAgICAgdG90YWwgKz0gaGl0LnZhbHVlO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMucmVhZGluZ1Byb3BlcnR5LnNldCggbmV3IFJlYWRpbmcoIHRvdGFsICkgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmJlbmRpbmdMaWdodC5yZWdpc3RlciggJ0ludGVuc2l0eU1ldGVyJywgSW50ZW5zaXR5TWV0ZXIgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEludGVuc2l0eU1ldGVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLE9BQU8sTUFBTSxjQUFjO0FBQ2xDLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFFcEUsTUFBTUMsY0FBYyxDQUFDO0VBSVhDLFdBQVcsR0FBYyxFQUFFLENBQUMsQ0FBQzs7RUFHckM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLFdBQVdBLENBQUVDLE9BQWUsRUFBRUMsT0FBZSxFQUFFQyxLQUFhLEVBQUVDLEtBQWEsRUFBRztJQUVuRixJQUFJLENBQUNDLGVBQWUsR0FBRyxJQUFJZCxRQUFRLENBQUVLLE9BQU8sQ0FBQ1UsSUFBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUlkLGVBQWUsQ0FBRSxJQUFJRCxPQUFPLENBQUVTLE9BQU8sRUFBRUMsT0FBUSxDQUFFLENBQUM7SUFDcEYsSUFBSSxDQUFDTSxvQkFBb0IsR0FBRyxJQUFJZixlQUFlLENBQUUsSUFBSUQsT0FBTyxDQUFFVyxLQUFLLEVBQUVDLEtBQU0sQ0FBRSxDQUFDO0lBQzlFLElBQUksQ0FBQ0ssZUFBZSxHQUFHLElBQUlaLGVBQWUsQ0FBRSxLQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ3ZEOztFQUVBO0VBQ09hLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNMLGVBQWUsQ0FBQ0ssS0FBSyxDQUFDLENBQUM7SUFDNUIsSUFBSSxDQUFDSCxzQkFBc0IsQ0FB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