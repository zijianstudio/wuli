// Copyright 2016-2022, University of Colorado Boulder

/**
 * Model for one table in the Billiards scene
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../../dot/js/Vector2Property.js';
import merge from '../../../../../phet-core/js/merge.js';
import proportionPlayground from '../../../proportionPlayground.js';
import ProportionPlaygroundConstants from '../../ProportionPlaygroundConstants.js';
import SceneRatio from '../SceneRatio.js';

// constants
const scratchVector = new Vector2(0, 0);
class BilliardsTable extends SceneRatio {
  /**
   * @param {Tandem} tandem
   * @param {Object} [options] - See below for available options
   */
  constructor(tandem, options) {
    options = merge({
      // {number} Initial length of the billiards table.
      initialLength: 5,
      // {number} Initial width of the billiards table.
      initialWidth: 5,
      // {Property.<boolean>} - Whether the view should be visible
      visibleProperty: new BooleanProperty(true),
      // {Property.<boolean>} - Whether the controls should be visible
      controlsVisibleProperty: new BooleanProperty(true)
    }, options);
    const lengthProperty = new NumberProperty(options.initialLength, {
      range: ProportionPlaygroundConstants.BILLIARDS_COUNT_RANGE,
      numberType: 'Integer',
      tandem: tandem.createTandem('lengthProperty')
    });
    const widthProperty = new NumberProperty(options.initialWidth, {
      range: ProportionPlaygroundConstants.BILLIARDS_COUNT_RANGE,
      numberType: 'Integer',
      tandem: tandem.createTandem('widthProperty')
    });
    super(options.visibleProperty, options.controlsVisibleProperty, lengthProperty, widthProperty, tandem);

    // @public {NumberProperty} - Number of grid units vertically
    this.lengthProperty = lengthProperty;

    // @public {NumberProperty} - Number of grid units horizontally
    this.widthProperty = widthProperty;

    // @public {Property.<Vector2>} - The position of the ball in pixels
    this.ballPositionProperty = new Vector2Property(new Vector2(0, 0), {
      phetioState: false,
      phetioReadOnly: true,
      tandem: tandem.createTandem('ballPositionProperty')
    });

    // @public {Vector2} - The velocity of the ball in pixels per second
    this.ballVelocity = new Vector2(0, 0);

    // Keep track of collision points so the path can be shown as an array of lines.
    // @public {ObservableArrayDef.<Vector2>} (read-only) - the points where the ball has collided with the walls
    this.collisionPoints = createObservableArray();

    // @public {Emitter} (read-only) - emits when the ball was restarted
    this.restartEmitter = new Emitter();

    // @public {boolean} - Whether the table has started animating (so we can continue to animate it in the background)
    this.hasStartedAnimating = false;
    this.restartBall(); // Helps initialize in one place

    // Restart the ball when the length or width changes
    this.lengthProperty.link(this.restartBall.bind(this));
    this.widthProperty.link(this.restartBall.bind(this));
  }

  /**
   * Restart the ball in the correct position and notify observers.
   * @public
   */
  restartBall() {
    // For readability
    const length = this.lengthProperty.value;
    const width = this.widthProperty.value;

    // See https://github.com/phetsims/proportion-playground/issues/13
    const speed = 1.5 * Math.sqrt(Math.pow(length, 2) + Math.pow(width, 2));

    // initially the ball starts in the bottom left corner and moves up and to the right.
    this.ballPositionProperty.value = new Vector2(0, 0);
    this.ballVelocity.setXY(speed, speed);
    this.collisionPoints.clear();
    this.collisionPoints.push(new Vector2(0, 0));
    this.restartEmitter.emit();
    this.hasStartedAnimating = false;
  }

  /**
   * Reset the table and restart the ball.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.restartBall();
  }

  /**
   * Moves the ball forward in time, and handles collisions.
   * @public
   *
   * @param {number} dt - Time to move forward in seconds
   */
  step(dt) {
    // Skip 0 dt, so we can simplify our intersection detection
    if (dt === 0) {
      return;
    }
    if (!this.hasStartedAnimating) {
      this.hasStartedAnimating = true;
    }
    const width = this.widthProperty.value;
    const length = this.lengthProperty.value;
    assert && assert(width > 0 && length > 0);

    // Mutable vectors (we'll copy position to the new Property value at the end)
    const position = scratchVector.set(this.ballPositionProperty.value);
    const velocity = this.ballVelocity;

    // Bail out if the ball has stopped
    if (velocity.magnitude === 0) {
      return;
    }

    // Keep bouncing while we still can (and have time left)
    while (velocity.magnitude > 0 && dt > 0) {
      // What are the wall x/y values in the direction we're traveling
      const boundaryX = velocity.x > 0 ? width : 0;
      const boundaryY = velocity.y > 0 ? length : 0;

      // How much time until we hit said boundaries.
      const timeLeftX = (boundaryX - position.x) / velocity.x;
      const timeLeftY = (boundaryY - position.y) / velocity.y;
      assert && assert(timeLeftX >= 0);
      assert && assert(timeLeftY >= 0);

      // Time until hitting the first wall
      const minTimeLeft = Math.min(timeLeftX, timeLeftY);

      // We won't make it to a wall, just step forward and use up DT
      if (dt < minTimeLeft) {
        position.add(velocity.times(dt));
        dt = 0;
      }
      // We'll bounce off (and possibly continue afterwards)
      else {
        // Step to the position on the wall
        position.add(velocity.times(minTimeLeft));

        // Round (so our collision and end points are nice)
        position.roundSymmetric();

        // Record the bounce
        this.collisionPoints.push(position.copy());

        // Sanity check, in case imprecise computations puts us over the boundary
        if (minTimeLeft > 0) {
          dt -= minTimeLeft;
        }

        // If we bounced on the left or right
        if (timeLeftX === minTimeLeft) {
          velocity.x *= -1;
        }
        if (timeLeftY === minTimeLeft) {
          velocity.y *= -1;
        }

        // Stop the ball when we hit a corner
        if ((position.x === 0 || position.x === width) && (position.y === 0 || position.y === length)) {
          this.ballVelocity.setXY(0, 0);
        }
      }
    }

    // Since we used a mutable vector for position, copy it over to the Property
    this.ballPositionProperty.value = position.copy();
  }
}
proportionPlayground.register('BilliardsTable', BilliardsTable);
export default BilliardsTable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5IiwibWVyZ2UiLCJwcm9wb3J0aW9uUGxheWdyb3VuZCIsIlByb3BvcnRpb25QbGF5Z3JvdW5kQ29uc3RhbnRzIiwiU2NlbmVSYXRpbyIsInNjcmF0Y2hWZWN0b3IiLCJCaWxsaWFyZHNUYWJsZSIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsImluaXRpYWxMZW5ndGgiLCJpbml0aWFsV2lkdGgiLCJ2aXNpYmxlUHJvcGVydHkiLCJjb250cm9sc1Zpc2libGVQcm9wZXJ0eSIsImxlbmd0aFByb3BlcnR5IiwicmFuZ2UiLCJCSUxMSUFSRFNfQ09VTlRfUkFOR0UiLCJudW1iZXJUeXBlIiwiY3JlYXRlVGFuZGVtIiwid2lkdGhQcm9wZXJ0eSIsImJhbGxQb3NpdGlvblByb3BlcnR5IiwicGhldGlvU3RhdGUiLCJwaGV0aW9SZWFkT25seSIsImJhbGxWZWxvY2l0eSIsImNvbGxpc2lvblBvaW50cyIsInJlc3RhcnRFbWl0dGVyIiwiaGFzU3RhcnRlZEFuaW1hdGluZyIsInJlc3RhcnRCYWxsIiwibGluayIsImJpbmQiLCJsZW5ndGgiLCJ2YWx1ZSIsIndpZHRoIiwic3BlZWQiLCJNYXRoIiwic3FydCIsInBvdyIsInNldFhZIiwiY2xlYXIiLCJwdXNoIiwiZW1pdCIsInJlc2V0Iiwic3RlcCIsImR0IiwiYXNzZXJ0IiwicG9zaXRpb24iLCJzZXQiLCJ2ZWxvY2l0eSIsIm1hZ25pdHVkZSIsImJvdW5kYXJ5WCIsIngiLCJib3VuZGFyeVkiLCJ5IiwidGltZUxlZnRYIiwidGltZUxlZnRZIiwibWluVGltZUxlZnQiLCJtaW4iLCJhZGQiLCJ0aW1lcyIsInJvdW5kU3ltbWV0cmljIiwiY29weSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmlsbGlhcmRzVGFibGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgZm9yIG9uZSB0YWJsZSBpbiB0aGUgQmlsbGlhcmRzIHNjZW5lXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBwcm9wb3J0aW9uUGxheWdyb3VuZCBmcm9tICcuLi8uLi8uLi9wcm9wb3J0aW9uUGxheWdyb3VuZC5qcyc7XHJcbmltcG9ydCBQcm9wb3J0aW9uUGxheWdyb3VuZENvbnN0YW50cyBmcm9tICcuLi8uLi9Qcm9wb3J0aW9uUGxheWdyb3VuZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTY2VuZVJhdGlvIGZyb20gJy4uL1NjZW5lUmF0aW8uanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IHNjcmF0Y2hWZWN0b3IgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuY2xhc3MgQmlsbGlhcmRzVGFibGUgZXh0ZW5kcyBTY2VuZVJhdGlvIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIFNlZSBiZWxvdyBmb3IgYXZhaWxhYmxlIG9wdGlvbnNcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyB7bnVtYmVyfSBJbml0aWFsIGxlbmd0aCBvZiB0aGUgYmlsbGlhcmRzIHRhYmxlLlxyXG4gICAgICBpbml0aWFsTGVuZ3RoOiA1LFxyXG5cclxuICAgICAgLy8ge251bWJlcn0gSW5pdGlhbCB3aWR0aCBvZiB0aGUgYmlsbGlhcmRzIHRhYmxlLlxyXG4gICAgICBpbml0aWFsV2lkdGg6IDUsXHJcblxyXG4gICAgICAvLyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIFdoZXRoZXIgdGhlIHZpZXcgc2hvdWxkIGJlIHZpc2libGVcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksXHJcblxyXG4gICAgICAvLyB7UHJvcGVydHkuPGJvb2xlYW4+fSAtIFdoZXRoZXIgdGhlIGNvbnRyb2xzIHNob3VsZCBiZSB2aXNpYmxlXHJcbiAgICAgIGNvbnRyb2xzVmlzaWJsZVByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlIClcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBsZW5ndGhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggb3B0aW9ucy5pbml0aWFsTGVuZ3RoLCB7XHJcbiAgICAgIHJhbmdlOiBQcm9wb3J0aW9uUGxheWdyb3VuZENvbnN0YW50cy5CSUxMSUFSRFNfQ09VTlRfUkFOR0UsXHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVuZ3RoUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHdpZHRoUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuaW5pdGlhbFdpZHRoLCB7XHJcbiAgICAgIHJhbmdlOiBQcm9wb3J0aW9uUGxheWdyb3VuZENvbnN0YW50cy5CSUxMSUFSRFNfQ09VTlRfUkFOR0UsXHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2lkdGhQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zLnZpc2libGVQcm9wZXJ0eSwgb3B0aW9ucy5jb250cm9sc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgbGVuZ3RoUHJvcGVydHksXHJcbiAgICAgIHdpZHRoUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5fSAtIE51bWJlciBvZiBncmlkIHVuaXRzIHZlcnRpY2FsbHlcclxuICAgIHRoaXMubGVuZ3RoUHJvcGVydHkgPSBsZW5ndGhQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBOdW1iZXIgb2YgZ3JpZCB1bml0cyBob3Jpem9udGFsbHlcclxuICAgIHRoaXMud2lkdGhQcm9wZXJ0eSA9IHdpZHRoUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPFZlY3RvcjI+fSAtIFRoZSBwb3NpdGlvbiBvZiB0aGUgYmFsbCBpbiBwaXhlbHNcclxuICAgIHRoaXMuYmFsbFBvc2l0aW9uUHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMCwgMCApLCB7XHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JhbGxQb3NpdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7VmVjdG9yMn0gLSBUaGUgdmVsb2NpdHkgb2YgdGhlIGJhbGwgaW4gcGl4ZWxzIHBlciBzZWNvbmRcclxuICAgIHRoaXMuYmFsbFZlbG9jaXR5ID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuXHJcbiAgICAvLyBLZWVwIHRyYWNrIG9mIGNvbGxpc2lvbiBwb2ludHMgc28gdGhlIHBhdGggY2FuIGJlIHNob3duIGFzIGFuIGFycmF5IG9mIGxpbmVzLlxyXG4gICAgLy8gQHB1YmxpYyB7T2JzZXJ2YWJsZUFycmF5RGVmLjxWZWN0b3IyPn0gKHJlYWQtb25seSkgLSB0aGUgcG9pbnRzIHdoZXJlIHRoZSBiYWxsIGhhcyBjb2xsaWRlZCB3aXRoIHRoZSB3YWxsc1xyXG4gICAgdGhpcy5jb2xsaXNpb25Qb2ludHMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtFbWl0dGVyfSAocmVhZC1vbmx5KSAtIGVtaXRzIHdoZW4gdGhlIGJhbGwgd2FzIHJlc3RhcnRlZFxyXG4gICAgdGhpcy5yZXN0YXJ0RW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSB0YWJsZSBoYXMgc3RhcnRlZCBhbmltYXRpbmcgKHNvIHdlIGNhbiBjb250aW51ZSB0byBhbmltYXRlIGl0IGluIHRoZSBiYWNrZ3JvdW5kKVxyXG4gICAgdGhpcy5oYXNTdGFydGVkQW5pbWF0aW5nID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5yZXN0YXJ0QmFsbCgpOyAvLyBIZWxwcyBpbml0aWFsaXplIGluIG9uZSBwbGFjZVxyXG5cclxuICAgIC8vIFJlc3RhcnQgdGhlIGJhbGwgd2hlbiB0aGUgbGVuZ3RoIG9yIHdpZHRoIGNoYW5nZXNcclxuICAgIHRoaXMubGVuZ3RoUHJvcGVydHkubGluayggdGhpcy5yZXN0YXJ0QmFsbC5iaW5kKCB0aGlzICkgKTtcclxuICAgIHRoaXMud2lkdGhQcm9wZXJ0eS5saW5rKCB0aGlzLnJlc3RhcnRCYWxsLmJpbmQoIHRoaXMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdGFydCB0aGUgYmFsbCBpbiB0aGUgY29ycmVjdCBwb3NpdGlvbiBhbmQgbm90aWZ5IG9ic2VydmVycy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzdGFydEJhbGwoKSB7XHJcblxyXG4gICAgLy8gRm9yIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aFByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLndpZHRoUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wcm9wb3J0aW9uLXBsYXlncm91bmQvaXNzdWVzLzEzXHJcbiAgICBjb25zdCBzcGVlZCA9IDEuNSAqIE1hdGguc3FydCggTWF0aC5wb3coIGxlbmd0aCwgMiApICsgTWF0aC5wb3coIHdpZHRoLCAyICkgKTtcclxuXHJcbiAgICAvLyBpbml0aWFsbHkgdGhlIGJhbGwgc3RhcnRzIGluIHRoZSBib3R0b20gbGVmdCBjb3JuZXIgYW5kIG1vdmVzIHVwIGFuZCB0byB0aGUgcmlnaHQuXHJcbiAgICB0aGlzLmJhbGxQb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoIDAsIDAgKTtcclxuICAgIHRoaXMuYmFsbFZlbG9jaXR5LnNldFhZKCBzcGVlZCwgc3BlZWQgKTtcclxuXHJcbiAgICB0aGlzLmNvbGxpc2lvblBvaW50cy5jbGVhcigpO1xyXG4gICAgdGhpcy5jb2xsaXNpb25Qb2ludHMucHVzaCggbmV3IFZlY3RvcjIoIDAsIDAgKSApO1xyXG4gICAgdGhpcy5yZXN0YXJ0RW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgdGhpcy5oYXNTdGFydGVkQW5pbWF0aW5nID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldCB0aGUgdGFibGUgYW5kIHJlc3RhcnQgdGhlIGJhbGwuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuXHJcbiAgICB0aGlzLnJlc3RhcnRCYWxsKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyB0aGUgYmFsbCBmb3J3YXJkIGluIHRpbWUsIGFuZCBoYW5kbGVzIGNvbGxpc2lvbnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0IC0gVGltZSB0byBtb3ZlIGZvcndhcmQgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgLy8gU2tpcCAwIGR0LCBzbyB3ZSBjYW4gc2ltcGxpZnkgb3VyIGludGVyc2VjdGlvbiBkZXRlY3Rpb25cclxuICAgIGlmICggZHQgPT09IDAgKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICF0aGlzLmhhc1N0YXJ0ZWRBbmltYXRpbmcgKSB7XHJcbiAgICAgIHRoaXMuaGFzU3RhcnRlZEFuaW1hdGluZyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLndpZHRoUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLmxlbmd0aFByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpZHRoID4gMCAmJiBsZW5ndGggPiAwICk7XHJcblxyXG4gICAgLy8gTXV0YWJsZSB2ZWN0b3JzICh3ZSdsbCBjb3B5IHBvc2l0aW9uIHRvIHRoZSBuZXcgUHJvcGVydHkgdmFsdWUgYXQgdGhlIGVuZClcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gc2NyYXRjaFZlY3Rvci5zZXQoIHRoaXMuYmFsbFBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIGNvbnN0IHZlbG9jaXR5ID0gdGhpcy5iYWxsVmVsb2NpdHk7XHJcblxyXG4gICAgLy8gQmFpbCBvdXQgaWYgdGhlIGJhbGwgaGFzIHN0b3BwZWRcclxuICAgIGlmICggdmVsb2NpdHkubWFnbml0dWRlID09PSAwICkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gS2VlcCBib3VuY2luZyB3aGlsZSB3ZSBzdGlsbCBjYW4gKGFuZCBoYXZlIHRpbWUgbGVmdClcclxuICAgIHdoaWxlICggdmVsb2NpdHkubWFnbml0dWRlID4gMCAmJiBkdCA+IDAgKSB7XHJcbiAgICAgIC8vIFdoYXQgYXJlIHRoZSB3YWxsIHgveSB2YWx1ZXMgaW4gdGhlIGRpcmVjdGlvbiB3ZSdyZSB0cmF2ZWxpbmdcclxuICAgICAgY29uc3QgYm91bmRhcnlYID0gdmVsb2NpdHkueCA+IDAgPyB3aWR0aCA6IDA7XHJcbiAgICAgIGNvbnN0IGJvdW5kYXJ5WSA9IHZlbG9jaXR5LnkgPiAwID8gbGVuZ3RoIDogMDtcclxuXHJcbiAgICAgIC8vIEhvdyBtdWNoIHRpbWUgdW50aWwgd2UgaGl0IHNhaWQgYm91bmRhcmllcy5cclxuICAgICAgY29uc3QgdGltZUxlZnRYID0gKCBib3VuZGFyeVggLSBwb3NpdGlvbi54ICkgLyB2ZWxvY2l0eS54O1xyXG4gICAgICBjb25zdCB0aW1lTGVmdFkgPSAoIGJvdW5kYXJ5WSAtIHBvc2l0aW9uLnkgKSAvIHZlbG9jaXR5Lnk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRpbWVMZWZ0WCA+PSAwICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRpbWVMZWZ0WSA+PSAwICk7XHJcblxyXG4gICAgICAvLyBUaW1lIHVudGlsIGhpdHRpbmcgdGhlIGZpcnN0IHdhbGxcclxuICAgICAgY29uc3QgbWluVGltZUxlZnQgPSBNYXRoLm1pbiggdGltZUxlZnRYLCB0aW1lTGVmdFkgKTtcclxuXHJcbiAgICAgIC8vIFdlIHdvbid0IG1ha2UgaXQgdG8gYSB3YWxsLCBqdXN0IHN0ZXAgZm9yd2FyZCBhbmQgdXNlIHVwIERUXHJcbiAgICAgIGlmICggZHQgPCBtaW5UaW1lTGVmdCApIHtcclxuICAgICAgICBwb3NpdGlvbi5hZGQoIHZlbG9jaXR5LnRpbWVzKCBkdCApICk7XHJcbiAgICAgICAgZHQgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFdlJ2xsIGJvdW5jZSBvZmYgKGFuZCBwb3NzaWJseSBjb250aW51ZSBhZnRlcndhcmRzKVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICAvLyBTdGVwIHRvIHRoZSBwb3NpdGlvbiBvbiB0aGUgd2FsbFxyXG4gICAgICAgIHBvc2l0aW9uLmFkZCggdmVsb2NpdHkudGltZXMoIG1pblRpbWVMZWZ0ICkgKTtcclxuXHJcbiAgICAgICAgLy8gUm91bmQgKHNvIG91ciBjb2xsaXNpb24gYW5kIGVuZCBwb2ludHMgYXJlIG5pY2UpXHJcbiAgICAgICAgcG9zaXRpb24ucm91bmRTeW1tZXRyaWMoKTtcclxuXHJcbiAgICAgICAgLy8gUmVjb3JkIHRoZSBib3VuY2VcclxuICAgICAgICB0aGlzLmNvbGxpc2lvblBvaW50cy5wdXNoKCBwb3NpdGlvbi5jb3B5KCkgKTtcclxuXHJcbiAgICAgICAgLy8gU2FuaXR5IGNoZWNrLCBpbiBjYXNlIGltcHJlY2lzZSBjb21wdXRhdGlvbnMgcHV0cyB1cyBvdmVyIHRoZSBib3VuZGFyeVxyXG4gICAgICAgIGlmICggbWluVGltZUxlZnQgPiAwICkge1xyXG4gICAgICAgICAgZHQgLT0gbWluVGltZUxlZnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiB3ZSBib3VuY2VkIG9uIHRoZSBsZWZ0IG9yIHJpZ2h0XHJcbiAgICAgICAgaWYgKCB0aW1lTGVmdFggPT09IG1pblRpbWVMZWZ0ICkge1xyXG4gICAgICAgICAgdmVsb2NpdHkueCAqPSAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB0aW1lTGVmdFkgPT09IG1pblRpbWVMZWZ0ICkge1xyXG4gICAgICAgICAgdmVsb2NpdHkueSAqPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0b3AgdGhlIGJhbGwgd2hlbiB3ZSBoaXQgYSBjb3JuZXJcclxuICAgICAgICBpZiAoICggcG9zaXRpb24ueCA9PT0gMCB8fCBwb3NpdGlvbi54ID09PSB3aWR0aCApICYmXHJcbiAgICAgICAgICAgICAoIHBvc2l0aW9uLnkgPT09IDAgfHwgcG9zaXRpb24ueSA9PT0gbGVuZ3RoICkgKSB7XHJcbiAgICAgICAgICB0aGlzLmJhbGxWZWxvY2l0eS5zZXRYWSggMCwgMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFNpbmNlIHdlIHVzZWQgYSBtdXRhYmxlIHZlY3RvciBmb3IgcG9zaXRpb24sIGNvcHkgaXQgb3ZlciB0byB0aGUgUHJvcGVydHlcclxuICAgIHRoaXMuYmFsbFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwb3NpdGlvbi5jb3B5KCk7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ0JpbGxpYXJkc1RhYmxlJywgQmlsbGlhcmRzVGFibGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEJpbGxpYXJkc1RhYmxlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDJDQUEyQztBQUN2RSxPQUFPQyxxQkFBcUIsTUFBTSxpREFBaUQ7QUFDbkYsT0FBT0MsT0FBTyxNQUFNLG1DQUFtQztBQUN2RCxPQUFPQyxjQUFjLE1BQU0sMENBQTBDO0FBQ3JFLE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLDBDQUEwQztBQUN0RSxPQUFPQyxL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