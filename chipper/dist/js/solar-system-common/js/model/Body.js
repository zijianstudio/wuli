// Copyright 2023, University of Colorado Boulder

/**
 * Model for a gravitational interacting Body
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import Vector2 from '../../../dot/js/Vector2.js';
import solarSystemCommon from '../solarSystemCommon.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
export default class Body {
  // Unitless body quantities (physical properties)

  // Collision handling
  collidedEmitter = new TinyEmitter();

  // Not resettable, common model will handle. Determines if the body is currently on-screen
  isActiveProperty = new BooleanProperty(false);

  // True when the body goes off-screen
  escapedProperty = new BooleanProperty(false);

  // True when the body force is off-scale
  forceOffscaleProperty = new BooleanProperty(false);

  // User modified properties
  userControlledPositionProperty = new BooleanProperty(false);
  userControlledVelocityProperty = new BooleanProperty(false);
  userControlledMassProperty = new BooleanProperty(false);

  // Array of points for drawing the path

  pathDistance = 0;
  constructor(index, initialMass, initialPosition, initialVelocity, userControlledProperty, colorProperty) {
    this.index = index;
    this.userControlledProperty = userControlledProperty;
    this.massProperty = new NumberProperty(initialMass, {
      isValidValue: v => v > 0
    });
    this.radiusProperty = new NumberProperty(1);
    this.positionProperty = new Vector2Property(initialPosition);
    this.velocityProperty = new Vector2Property(initialVelocity);
    this.accelerationProperty = new Vector2Property(Vector2.ZERO);
    this.forceProperty = new Vector2Property(Vector2.ZERO);
    this.colorProperty = colorProperty;
    this.radiusProperty = new DerivedProperty([this.massProperty], mass => Body.massToRadius(mass));

    // Data for rendering the path
    this.pathPoints = createObservableArray();
  }
  reset() {
    this.massProperty.reset();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.accelerationProperty.reset();
    this.forceProperty.reset();
    this.escapedProperty.reset();
    this.forceOffscaleProperty.reset();
    this.clearPath();
  }

  /**
   * Add a point to the collection of points that follow the trajectory of a moving body.
   * This also removes points when the path gets too long.
   */
  addPathPoint() {
    const pathPoint = this.positionProperty.value.copy();

    // Only add or remove points if the body is effectively moving
    if (this.pathPoints.length === 0 || !pathPoint.equals(this.pathPoints[this.pathPoints.length - 1])) {
      this.pathPoints.push(pathPoint);

      // Add the length to the tracked path length
      if (this.pathPoints.length >= 2) {
        this.pathDistance += pathPoint.distance(this.pathPoints[this.pathPoints.length - 2]);
      }

      // Remove points from the path as the path gets too long
      while (this.pathDistance > 2000) {
        this.pathDistance -= this.pathPoints[1].distance(this.pathPoints[0]);
        this.pathPoints.shift();
      }
    }
  }
  get info() {
    return {
      mass: this.massProperty.value,
      position: this.positionProperty.value.copy(),
      velocity: this.velocityProperty.value.copy(),
      active: this.isActiveProperty.value
    };
  }
  isOverlapping(otherBody) {
    const distance = this.positionProperty.value.distance(otherBody.positionProperty.value);
    const radiusSum = this.radiusProperty.value + otherBody.radiusProperty.value;
    return distance < radiusSum;
  }
  preventCollision(bodies) {
    bodies.forEach(body => {
      if (body !== this && this.isOverlapping(body)) {
        // If it's going to collide, arbitrarily move it 100 pixels up
        this.positionProperty.value = this.positionProperty.value.plus(new Vector2(0, 100));
        this.preventCollision(bodies);
      }
    });
  }

  /**
   * Clear the whole path of points tracking the body's trajectory.
   */
  clearPath() {
    this.pathPoints.clear();
    this.pathDistance = 0;
  }
  static massToRadius(mass) {
    const minRadius = 3;
    return Math.max(minRadius, 2.3 * Math.pow(mass, 1 / 3));
  }
}
solarSystemCommon.register('Body', Body);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJWZWN0b3IyIiwic29sYXJTeXN0ZW1Db21tb24iLCJOdW1iZXJQcm9wZXJ0eSIsIkJvb2xlYW5Qcm9wZXJ0eSIsIlZlY3RvcjJQcm9wZXJ0eSIsIlRpbnlFbWl0dGVyIiwiRGVyaXZlZFByb3BlcnR5IiwiQm9keSIsImNvbGxpZGVkRW1pdHRlciIsImlzQWN0aXZlUHJvcGVydHkiLCJlc2NhcGVkUHJvcGVydHkiLCJmb3JjZU9mZnNjYWxlUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFBvc2l0aW9uUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFZlbG9jaXR5UHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZE1hc3NQcm9wZXJ0eSIsInBhdGhEaXN0YW5jZSIsImNvbnN0cnVjdG9yIiwiaW5kZXgiLCJpbml0aWFsTWFzcyIsImluaXRpYWxQb3NpdGlvbiIsImluaXRpYWxWZWxvY2l0eSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJjb2xvclByb3BlcnR5IiwibWFzc1Byb3BlcnR5IiwiaXNWYWxpZFZhbHVlIiwidiIsInJhZGl1c1Byb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsInZlbG9jaXR5UHJvcGVydHkiLCJhY2NlbGVyYXRpb25Qcm9wZXJ0eSIsIlpFUk8iLCJmb3JjZVByb3BlcnR5IiwibWFzcyIsIm1hc3NUb1JhZGl1cyIsInBhdGhQb2ludHMiLCJyZXNldCIsImNsZWFyUGF0aCIsImFkZFBhdGhQb2ludCIsInBhdGhQb2ludCIsInZhbHVlIiwiY29weSIsImxlbmd0aCIsImVxdWFscyIsInB1c2giLCJkaXN0YW5jZSIsInNoaWZ0IiwiaW5mbyIsInBvc2l0aW9uIiwidmVsb2NpdHkiLCJhY3RpdmUiLCJpc092ZXJsYXBwaW5nIiwib3RoZXJCb2R5IiwicmFkaXVzU3VtIiwicHJldmVudENvbGxpc2lvbiIsImJvZGllcyIsImZvckVhY2giLCJib2R5IiwicGx1cyIsImNsZWFyIiwibWluUmFkaXVzIiwiTWF0aCIsIm1heCIsInBvdyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQm9keS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIGEgZ3Jhdml0YXRpb25hbCBpbnRlcmFjdGluZyBCb2R5XHJcbiAqXHJcbiAqIEBhdXRob3IgQWd1c3TDrW4gVmFsbGVqbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgc29sYXJTeXN0ZW1Db21tb24gZnJvbSAnLi4vc29sYXJTeXN0ZW1Db21tb24uanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBCb2R5SW5mbyB9IGZyb20gJy4vU29sYXJTeXN0ZW1Db21tb25Nb2RlbC5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb2R5IHtcclxuICAvLyBVbml0bGVzcyBib2R5IHF1YW50aXRpZXMgKHBoeXNpY2FsIHByb3BlcnRpZXMpXHJcbiAgcHVibGljIHJlYWRvbmx5IG1hc3NQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgcmFkaXVzUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcbiAgcHVibGljIHJlYWRvbmx5IHBvc2l0aW9uUHJvcGVydHk6IFByb3BlcnR5PFZlY3RvcjI+O1xyXG4gIHB1YmxpYyByZWFkb25seSB2ZWxvY2l0eVByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPjtcclxuICBwdWJsaWMgcmVhZG9ubHkgYWNjZWxlcmF0aW9uUHJvcGVydHk6IFByb3BlcnR5PFZlY3RvcjI+O1xyXG4gIHB1YmxpYyByZWFkb25seSBmb3JjZVByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IyPjtcclxuXHJcbiAgLy8gQ29sbGlzaW9uIGhhbmRsaW5nXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbGxpZGVkRW1pdHRlciA9IG5ldyBUaW55RW1pdHRlcigpO1xyXG5cclxuICAvLyBOb3QgcmVzZXR0YWJsZSwgY29tbW9uIG1vZGVsIHdpbGwgaGFuZGxlLiBEZXRlcm1pbmVzIGlmIHRoZSBib2R5IGlzIGN1cnJlbnRseSBvbi1zY3JlZW5cclxuICBwdWJsaWMgcmVhZG9ubHkgaXNBY3RpdmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gIC8vIFRydWUgd2hlbiB0aGUgYm9keSBnb2VzIG9mZi1zY3JlZW5cclxuICBwdWJsaWMgcmVhZG9ubHkgZXNjYXBlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgLy8gVHJ1ZSB3aGVuIHRoZSBib2R5IGZvcmNlIGlzIG9mZi1zY2FsZVxyXG4gIHB1YmxpYyByZWFkb25seSBmb3JjZU9mZnNjYWxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAvLyBVc2VyIG1vZGlmaWVkIHByb3BlcnRpZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgdXNlckNvbnRyb2xsZWRQb3NpdGlvblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICBwdWJsaWMgcmVhZG9ubHkgdXNlckNvbnRyb2xsZWRWZWxvY2l0eVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICBwdWJsaWMgcmVhZG9ubHkgdXNlckNvbnRyb2xsZWRNYXNzUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAvLyBBcnJheSBvZiBwb2ludHMgZm9yIGRyYXdpbmcgdGhlIHBhdGhcclxuICBwdWJsaWMgcmVhZG9ubHkgcGF0aFBvaW50czogT2JzZXJ2YWJsZUFycmF5PFZlY3RvcjI+O1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgY29sb3JQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICBwcml2YXRlIHBhdGhEaXN0YW5jZSA9IDA7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IGluZGV4OiBudW1iZXIsIGluaXRpYWxNYXNzOiBudW1iZXIsIGluaXRpYWxQb3NpdGlvbjogVmVjdG9yMiwgaW5pdGlhbFZlbG9jaXR5OiBWZWN0b3IyLCBwdWJsaWMgdXNlckNvbnRyb2xsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIGNvbG9yUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PENvbG9yPiApIHtcclxuICAgIHRoaXMubWFzc1Byb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsTWFzcywgeyBpc1ZhbGlkVmFsdWU6IHYgPT4gdiA+IDAgfSApO1xyXG4gICAgdGhpcy5yYWRpdXNQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMSApO1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggaW5pdGlhbFBvc2l0aW9uICk7XHJcbiAgICB0aGlzLnZlbG9jaXR5UHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBpbml0aWFsVmVsb2NpdHkgKTtcclxuICAgIHRoaXMuYWNjZWxlcmF0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8gKTtcclxuICAgIHRoaXMuZm9yY2VQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTyApO1xyXG4gICAgdGhpcy5jb2xvclByb3BlcnR5ID0gY29sb3JQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLnJhZGl1c1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLm1hc3NQcm9wZXJ0eSBdLCBtYXNzID0+IEJvZHkubWFzc1RvUmFkaXVzKCBtYXNzICkgKTtcclxuXHJcbiAgICAvLyBEYXRhIGZvciByZW5kZXJpbmcgdGhlIHBhdGhcclxuICAgIHRoaXMucGF0aFBvaW50cyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmFjY2VsZXJhdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZvcmNlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZXNjYXBlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZvcmNlT2Zmc2NhbGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5jbGVhclBhdGgoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIHBvaW50IHRvIHRoZSBjb2xsZWN0aW9uIG9mIHBvaW50cyB0aGF0IGZvbGxvdyB0aGUgdHJhamVjdG9yeSBvZiBhIG1vdmluZyBib2R5LlxyXG4gICAqIFRoaXMgYWxzbyByZW1vdmVzIHBvaW50cyB3aGVuIHRoZSBwYXRoIGdldHMgdG9vIGxvbmcuXHJcbiAgICovXHJcbiAgcHVibGljIGFkZFBhdGhQb2ludCgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHBhdGhQb2ludCA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5jb3B5KCk7XHJcblxyXG4gICAgLy8gT25seSBhZGQgb3IgcmVtb3ZlIHBvaW50cyBpZiB0aGUgYm9keSBpcyBlZmZlY3RpdmVseSBtb3ZpbmdcclxuICAgIGlmICggdGhpcy5wYXRoUG9pbnRzLmxlbmd0aCA9PT0gMCB8fCAhcGF0aFBvaW50LmVxdWFscyggdGhpcy5wYXRoUG9pbnRzWyB0aGlzLnBhdGhQb2ludHMubGVuZ3RoIC0gMSBdICkgKSB7XHJcbiAgICAgIHRoaXMucGF0aFBvaW50cy5wdXNoKCBwYXRoUG9pbnQgKTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgbGVuZ3RoIHRvIHRoZSB0cmFja2VkIHBhdGggbGVuZ3RoXHJcbiAgICAgIGlmICggdGhpcy5wYXRoUG9pbnRzLmxlbmd0aCA+PSAyICkge1xyXG4gICAgICAgIHRoaXMucGF0aERpc3RhbmNlICs9IHBhdGhQb2ludC5kaXN0YW5jZSggdGhpcy5wYXRoUG9pbnRzWyB0aGlzLnBhdGhQb2ludHMubGVuZ3RoIC0gMiBdICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbW92ZSBwb2ludHMgZnJvbSB0aGUgcGF0aCBhcyB0aGUgcGF0aCBnZXRzIHRvbyBsb25nXHJcbiAgICAgIHdoaWxlICggdGhpcy5wYXRoRGlzdGFuY2UgPiAyMDAwICkge1xyXG4gICAgICAgIHRoaXMucGF0aERpc3RhbmNlIC09IHRoaXMucGF0aFBvaW50c1sgMSBdLmRpc3RhbmNlKCB0aGlzLnBhdGhQb2ludHNbIDAgXSApO1xyXG4gICAgICAgIHRoaXMucGF0aFBvaW50cy5zaGlmdCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldCBpbmZvKCk6IEJvZHlJbmZvIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIG1hc3M6IHRoaXMubWFzc1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBwb3NpdGlvbjogdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmNvcHkoKSxcclxuICAgICAgdmVsb2NpdHk6IHRoaXMudmVsb2NpdHlQcm9wZXJ0eS52YWx1ZS5jb3B5KCksXHJcbiAgICAgIGFjdGl2ZTogdGhpcy5pc0FjdGl2ZVByb3BlcnR5LnZhbHVlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzT3ZlcmxhcHBpbmcoIG90aGVyQm9keTogQm9keSApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCBvdGhlckJvZHkucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgY29uc3QgcmFkaXVzU3VtID0gdGhpcy5yYWRpdXNQcm9wZXJ0eS52YWx1ZSArIG90aGVyQm9keS5yYWRpdXNQcm9wZXJ0eS52YWx1ZTtcclxuICAgIHJldHVybiBkaXN0YW5jZSA8IHJhZGl1c1N1bTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwcmV2ZW50Q29sbGlzaW9uKCBib2RpZXM6IEJvZHlbXSApOiB2b2lkIHtcclxuICAgIGJvZGllcy5mb3JFYWNoKCBib2R5ID0+IHtcclxuICAgICAgaWYgKCBib2R5ICE9PSB0aGlzICYmIHRoaXMuaXNPdmVybGFwcGluZyggYm9keSApICkge1xyXG4gICAgICAgIC8vIElmIGl0J3MgZ29pbmcgdG8gY29sbGlkZSwgYXJiaXRyYXJpbHkgbW92ZSBpdCAxMDAgcGl4ZWxzIHVwXHJcbiAgICAgICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gdGhpcy5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXMoIG5ldyBWZWN0b3IyKCAwLCAxMDAgKSApO1xyXG4gICAgICAgIHRoaXMucHJldmVudENvbGxpc2lvbiggYm9kaWVzICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENsZWFyIHRoZSB3aG9sZSBwYXRoIG9mIHBvaW50cyB0cmFja2luZyB0aGUgYm9keSdzIHRyYWplY3RvcnkuXHJcbiAgICovXHJcbiAgcHVibGljIGNsZWFyUGF0aCgpOiB2b2lkIHtcclxuICAgIHRoaXMucGF0aFBvaW50cy5jbGVhcigpO1xyXG4gICAgdGhpcy5wYXRoRGlzdGFuY2UgPSAwO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXRpYyBtYXNzVG9SYWRpdXMoIG1hc3M6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgY29uc3QgbWluUmFkaXVzID0gMztcclxuICAgIHJldHVybiBNYXRoLm1heCggbWluUmFkaXVzLCAyLjMgKiBNYXRoLnBvdyggbWFzcywgMSAvIDMgKSApO1xyXG4gIH1cclxufVxyXG5cclxuc29sYXJTeXN0ZW1Db21tb24ucmVnaXN0ZXIoICdCb2R5JywgQm9keSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBMkIsMkNBQTJDO0FBQ2xHLE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsaUJBQWlCLE1BQU0seUJBQXlCO0FBQ3ZELE9BQU9DLGNBQWMsTUFBTSxvQ0FBb0M7QUFDL0QsT0FBT0MsZUFBZSxNQUFNLHFDQUFxQztBQUNqRSxPQUFP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