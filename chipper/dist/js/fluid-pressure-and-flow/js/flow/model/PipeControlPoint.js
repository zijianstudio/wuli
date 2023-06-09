// Copyright 2014-2021, University of Colorado Boulder

/**
 * Data structure for a control point that can be dragged around to change the shape of the pipe.
 * Modified from energy-skate-park/js/model/ControlPoint.js.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
class PipeControlPoint {
  /**
   * @param {number} x - position of the control point
   * @param {number} y - position of the control point
   */
  constructor(x, y) {
    this.positionProperty = new Vector2Property(new Vector2(x, y));
  }

  /**
   * @public
   */
  reset() {
    this.positionProperty.reset();
  }
}
fluidPressureAndFlow.register('PipeControlPoint', PipeControlPoint);
export default PipeControlPoint;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJQaXBlQ29udHJvbFBvaW50IiwiY29uc3RydWN0b3IiLCJ4IiwieSIsInBvc2l0aW9uUHJvcGVydHkiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGlwZUNvbnRyb2xQb2ludC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBEYXRhIHN0cnVjdHVyZSBmb3IgYSBjb250cm9sIHBvaW50IHRoYXQgY2FuIGJlIGRyYWdnZWQgYXJvdW5kIHRvIGNoYW5nZSB0aGUgc2hhcGUgb2YgdGhlIHBpcGUuXHJcbiAqIE1vZGlmaWVkIGZyb20gZW5lcmd5LXNrYXRlLXBhcmsvanMvbW9kZWwvQ29udHJvbFBvaW50LmpzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IGZsdWlkUHJlc3N1cmVBbmRGbG93IGZyb20gJy4uLy4uL2ZsdWlkUHJlc3N1cmVBbmRGbG93LmpzJztcclxuXHJcbmNsYXNzIFBpcGVDb250cm9sUG9pbnQge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0geCAtIHBvc2l0aW9uIG9mIHRoZSBjb250cm9sIHBvaW50XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHkgLSBwb3NpdGlvbiBvZiB0aGUgY29udHJvbCBwb2ludFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB4LCB5ICkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIHgsIHkgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ1BpcGVDb250cm9sUG9pbnQnLCBQaXBlQ29udHJvbFBvaW50ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFBpcGVDb250cm9sUG9pbnQ7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUVoRSxNQUFNQyxnQkFBZ0IsQ0FBQztFQUVyQjtBQUNGO0FBQ0E7QUFDQTtFQUNFQyxXQUFXQSxDQUFFQyxDQUFDLEVBQUVDLENBQUMsRUFBRztJQUNsQixJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUlOLGVBQWUsQ0FBRSxJQUFJRCxPQUFPLENBQUVLLENBQUMsRUFBRUMsQ0FBRSxDQUFFLENBQUM7RUFDcEU7O0VBRUE7QUFDRjtBQUNBO0VBQ0VFLEtBQUtBLENBQUEsRUFBRztJQUNOLElBQUksQ0FBQ0QsZ0JBQWdCLENBQUNDLEtBQUssQ0FBQyxDQUFDO0VBQy9CO0FBQ0Y7QUFFQU4sb0JBQW9CLENBQUNPLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRU4sZ0JBQWlCLENBQUM7QUFDckUsZUFBZUEsZ0JBQWdCIn0=