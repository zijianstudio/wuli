// Copyright 2022-2023, University of Colorado Boulder

/**
 * Base class for a manipulable data point which could be a soccer ball or, in the lab screen, a colored sphere.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import centerAndVariability from '../../centerAndVariability.js';
import Property from '../../../../axon/js/Property.js';
import Pose from './Pose.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
export default class SoccerPlayer {
  poseProperty = new Property(Pose.STANDING);

  // Also used to determine the artwork for rendering the SoccerPlayerNode

  timestampWhenPoisedBegan = null;
  constructor(placeInLine) {
    this.isActiveProperty = new BooleanProperty(placeInLine === 0);
    this.initialPlaceInLine = placeInLine;
  }
  reset() {
    this.poseProperty.reset();
    this.timestampWhenPoisedBegan = null;
    this.isActiveProperty.reset();
  }
}
centerAndVariability.register('SoccerPlayer', SoccerPlayer);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjZW50ZXJBbmRWYXJpYWJpbGl0eSIsIlByb3BlcnR5IiwiUG9zZSIsIkJvb2xlYW5Qcm9wZXJ0eSIsIlNvY2NlclBsYXllciIsInBvc2VQcm9wZXJ0eSIsIlNUQU5ESU5HIiwidGltZXN0YW1wV2hlblBvaXNlZEJlZ2FuIiwiY29uc3RydWN0b3IiLCJwbGFjZUluTGluZSIsImlzQWN0aXZlUHJvcGVydHkiLCJpbml0aWFsUGxhY2VJbkxpbmUiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU29jY2VyUGxheWVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgY2xhc3MgZm9yIGEgbWFuaXB1bGFibGUgZGF0YSBwb2ludCB3aGljaCBjb3VsZCBiZSBhIHNvY2NlciBiYWxsIG9yLCBpbiB0aGUgbGFiIHNjcmVlbiwgYSBjb2xvcmVkIHNwaGVyZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjZW50ZXJBbmRWYXJpYWJpbGl0eSBmcm9tICcuLi8uLi9jZW50ZXJBbmRWYXJpYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFBvc2UgZnJvbSAnLi9Qb3NlLmpzJztcclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2NjZXJQbGF5ZXIge1xyXG4gIHB1YmxpYyByZWFkb25seSBwb3NlUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8UG9zZT4oIFBvc2UuU1RBTkRJTkcgKTtcclxuXHJcbiAgLy8gQWxzbyB1c2VkIHRvIGRldGVybWluZSB0aGUgYXJ0d29yayBmb3IgcmVuZGVyaW5nIHRoZSBTb2NjZXJQbGF5ZXJOb2RlXHJcbiAgcHVibGljIHJlYWRvbmx5IGluaXRpYWxQbGFjZUluTGluZTogbnVtYmVyO1xyXG5cclxuICBwdWJsaWMgdGltZXN0YW1wV2hlblBvaXNlZEJlZ2FuOiBudW1iZXIgfCBudWxsID0gbnVsbDtcclxuICBwdWJsaWMgcmVhZG9ubHkgaXNBY3RpdmVQcm9wZXJ0eTogQm9vbGVhblByb3BlcnR5O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHBsYWNlSW5MaW5lOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLmlzQWN0aXZlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBwbGFjZUluTGluZSA9PT0gMCApO1xyXG4gICAgdGhpcy5pbml0aWFsUGxhY2VJbkxpbmUgPSBwbGFjZUluTGluZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucG9zZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRpbWVzdGFtcFdoZW5Qb2lzZWRCZWdhbiA9IG51bGw7XHJcbiAgICB0aGlzLmlzQWN0aXZlUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmNlbnRlckFuZFZhcmlhYmlsaXR5LnJlZ2lzdGVyKCAnU29jY2VyUGxheWVyJywgU29jY2VyUGxheWVyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0Esb0JBQW9CLE1BQU0sK0JBQStCO0FBQ2hFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxlQUFlLE1BQU1DLFlBQVksQ0FBQztFQUNoQkMsWUFBWSxHQUFHLElBQUlKLFFBQVEsQ0FBUUMsSUFBSSxDQUFDSSxRQUFTLENBQUM7O0VBRWxFOztFQUdPQyx3QkFBd0IsR0FBa0IsSUFBSTtFQUc5Q0MsV0FBV0EsQ0FBRUMsV0FBbUIsRUFBRztJQUN4QyxJQUFJLENBQUNDLGdCQUFnQixHQUFHLElBQUlQLGVBQWUsQ0FBRU0sV0FBVyxLQUFLLENBQUUsQ0FBQztJQUNoRSxJQUFJLENBQUNFLGtCQUFrQixHQUFHRixXQUFXO0VBQ3ZDO0VBRU9HLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNQLFlBQVksQ0FBQ08sS0FBSyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDTCx3QkFBd0IsR0FBRyxJQUFJO0lBQ3BDLElBQUksQ0FBQ0csZ0JBQWdCLENBQUNFLEtBQUssQ0FBQyxDQUFDO0VBQy9CO0FBQ0Y7QUFFQVosb0JBQW9CLENBQUNhLFFBQVEsQ0FBRSxjQUFjLEVBQUVULFlBQWEsQ0FBQyJ9