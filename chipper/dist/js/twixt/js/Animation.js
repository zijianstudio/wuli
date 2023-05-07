// Copyright 2018-2023, University of Colorado Boulder

/**
 * An easing-based controllable animation.
 *
 * We use some terminology to describe points and regions in time for an animation:
 *
 *             starts                            begins                                finishes
 *               |             delay               |             animation                |
 * time-->       |           (waiting)             |     (animated values changing)       |
 * ---------------------------------------------------------------------------------------------------------------------
 *               |------------------------------running-----------------------------------|
 *                                                 |-------------animating----------------|
 *
 * TODO #3: pause/cancel (and stop->cancel renaming)
 * TODO #3: function for blending with angular/rotational values
 * TODO #3: consider keyframed animation helper?
 * TODO #3: Hooks for attaching/detaching stepping via screens/nodes
 * TODO #3: Add documentation examples (contingent on how screen/node hooks work)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Emitter from '../../axon/js/Emitter.js';
import stepTimer from '../../axon/js/stepTimer.js';
import TinyEmitter from '../../axon/js/TinyEmitter.js';
import Utils from '../../dot/js/Utils.js';
import optionize from '../../phet-core/js/optionize.js';
import AnimationTarget from './AnimationTarget.js';
import twixt from './twixt.js';

// IMPORTANT: See AnimationTarget's config documentation, as those config can be passed in either here, or in
// the targets array.
class Animation {
  // All of the different values that will be animated by this animation.
  // If config.targets was supplied, those targets will be wrapped into AnimationTargets
  // If config.targets was not supplied, the config from this object will be wrapped into one AnimationTarget

  // Saved config to help determine the length of the animation

  // In seconds

  // Computed length for the animation (in seconds)
  length = 0;

  // Length of time remaining in the "delay" portion. Computed after the animation is started, and only used until the
  // animation "begins".
  remainingDelay = 0;

  // Length of time remaining in the actual animation (after the delay) portion. Computed after the delay has passed,
  // and only used until the animation "ends".
  remainingAnimation = 0;

  // True while the animation is being stepped through (both the delay portion AND the actual animation portion).
  runningProperty = new BooleanProperty(false);

  // True while the animation is actually changing the value (false while waiting for the delay, or while the animation
  // is not running at all).
  animatingProperty = new BooleanProperty(false);

  // Fired when the animation is "started" (i.e. when start() is called and the delay, if one is there, starts).
  startEmitter = new Emitter();

  // Fired when the actual animation of the value begins (i.e. when the delay finishes and the actual animation begins).
  beginEmitter = new Emitter();

  // Fired when the animation finishes naturally (was not abnormally stopped). A {number} is provided as a single
  // argument to the emit callback, and represents how much "extra" time occurred after the end of the animation. For
  // example, if you have a 1-second animation and stepped it by 3 seconds, this finished emitter would be called with
  // 2 seconds.
  finishEmitter = new Emitter({
    parameters: [{
      valueType: 'number'
    }]
  });

  // Fired when the animation is manually stopped (with stop()). Does NOT fire when it finishes normally.
  stopEmitter = new Emitter();

  // Fired when the animation ends, regardless of whether it fully finished, or was stopped prematurely.
  endedEmitter = new Emitter({
    hasListenerOrderDependencies: true
  }); // TODO: listener order dependencies in should be dealt with, https://github.com/phetsims/fraction-matcher/issues/110

  // Fired when (just after) the animation has changed animated values/targets.
  updateEmitter = new Emitter();

  /**
   * The constructor config will define one or more animation "targets" (specific values to be animated). The config
   * available for targets is documented in AnimationTarget.
   *
   * If there is only one target, it is recommended to pass in those config in the top-level Animation config, e.g.:
   * | var someNumberProperty = new NumberProperty( 0 );
   * | new Animation( {
   * |   // Options for the Animation as a whole
   * |   duration: 2,
   * |
   * |   // Options for the one target to change
   * |   property: someNumberProperty,
   * |   to: 5
   * | } );
   *
   * However multiple different targets are supported, and should be specified in the `targets` option:
   * | var someNumberProperty = new NumberProperty( 100 );
   * | var someObject = { someAttribute: new Vector2( 100, 5 ) };
   * | new Animation( {
   * |   // Options for the Animation as a whole
   * |   duration: 2,
   * |
   * |   targets: [ {
   * |     // First target
   * |     property: someNumberProperty,
   * |     to: 5
   * |   }, {
   * |     // Second target
   * |     object: someObject,
   * |     attribute: 'someAttribute',
   * |     to: new Vector2( 50, 10 )
   * |   } ]
   * | } );
   *
   * NOTE: The length of the animation needs to be specified in exactly one place. This can usually be done by
   * specifying the `duration` in the config, but `speed` can also be used in any of the targets.
   *
   * EXAMPLE: It's possible to create continuous animation loops, where animations cycle back and forth, e.g.:
   * | var moreOpaque = new Animation( {
   * |   object: animatedCircle,
   * |   attribute: 'opacity',
   * |   from: 0.5,
   * |   to: 1,
   * |   duration: 0.5,
   * |   easing: Easing.QUADRATIC_IN_OUT
   * | } );
   * | var lessOpaque = new Animation( {
   * |   object: animatedCircle,
   * |   attribute: 'opacity',
   * |   from: 1,
   * |   to: 0.5,
   * |   duration: 0.5,
   * |   easing: Easing.QUADRATIC_IN_OUT
   * | } );
   * | moreOpaque.then( lessOpaque );
   * | lessOpaque.then( moreOpaque );
   * | lessOpaque.start();
   */
  constructor(providedConfig) {
    const config = optionize()({
      targets: null,
      duration: null,
      delay: 0,
      stepEmitter: stepTimer
    }, providedConfig);
    assert && assert(+(config.property !== undefined) + +(config.object !== undefined) + +(config.setValue !== undefined) + +(config.targets !== null) === 1, 'Should have one (and only one) way of defining how to set the animated value. Use one of property/object/setValue/targets');
    assert && assert(typeof config.delay === 'number' && isFinite(config.delay) && config.delay >= 0, 'The delay should be a non-negative number.');
    assert && assert(config.stepEmitter === null || config.stepEmitter instanceof Emitter || config.stepEmitter instanceof TinyEmitter, 'stepEmitter must be null or an (Tiny)Emitter');
    this.targets = (config.targets === null ? [config] : config.targets).map(config => {
      return new AnimationTarget(config); // TODO #3: strip out the irrelevant config when using config arg
    });

    assert && assert(+(config.duration !== null) + _.sum(_.map(this.targets, target => target.hasPreferredDuration() ? 1 : 0)) === 1, 'Exactly one duration/speed option should be used.');
    this.duration = config.duration;
    this.delay = config.delay;

    // Wire up to the provided Emitter, if any. Whenever this animation is started, it will add a listener to the Timer
    // (and conversely, will be removed when stopped). This means it will animate with the timer, but will not leak
    // memory as long as the animation doesn't last forever.
    const stepEmitter = config.stepEmitter;
    if (stepEmitter) {
      const stepListener = this.step.bind(this);
      this.runningProperty.link(running => {
        if (running && !stepEmitter.hasListener(stepListener)) {
          stepEmitter.addListener(stepListener);
        } else if (!running && stepEmitter.hasListener(stepListener)) {
          stepEmitter.removeListener(stepListener);
        }
      });
    }
  }

  /**
   * Starts the animation (or if it has a delay, sets the animation to start after that delay).
   *
   * @param [dt] - If provided, step this far into the animation initially.  Used for chaining animations.
   */
  start(dt) {
    // If we are already animating, do nothing
    if (this.runningProperty.value) {
      return this;
    }

    // The remaining delay needs to be valid immediately after start is called.
    this.remainingDelay = this.delay;

    // Notifications
    this.runningProperty.value = true;
    this.startEmitter.emit();

    // Set up initial state and value
    this.step(dt !== undefined ? dt : 0);
    return this;
  }

  /**
   * Stops the animation (or if waiting for the delay, will not "start" the animation).
   */
  stop() {
    // If we are not already animating, do nothing
    if (!this.runningProperty.value) {
      return this;
    }

    // Notifications
    this.runningProperty.value = false;
    this.stopEmitter.emit();
    this.endedEmitter.emit();
    return this;
  }

  /**
   * Steps the animation forward by a certain amount of time.
   *
   * @param dt - In seconds
   */
  step(dt) {
    // Ignore the step if our animation is not running
    if (!this.runningProperty.value) {
      return this;
    }

    // First, burn through the delay if animation hasn't started yet.
    if (!this.animatingProperty.value) {
      this.remainingDelay -= dt;
      dt = -this.remainingDelay; // record how far past the delay we go

      // Bail if we are not ready to start the animation
      if (this.remainingDelay > 0) {
        return this;
      }

      // Compute the start/end for each target, and determine the length of our animation
      this.length = this.duration;
      for (let i = 0; i < this.targets.length; i++) {
        const target = this.targets[i];
        target.computeStartEnd();

        // If we don't have a computed length yet, check all of our targets
        if (this.length === null) {
          this.length = target.getPreferredDuration();
        }
      }
      assert && assert(this.length !== null, 'After going through the targets, we should have a length by now');
      this.remainingAnimation = this.length;

      // Notify about the animation starting
      this.animatingProperty.value = true;
      this.beginEmitter.emit();
    }

    // Take our dt off of our remaining time
    this.remainingAnimation -= dt;
    dt = -this.remainingAnimation; // record how far past the animation we go

    assert && assert(this.length !== null);
    const ratio = this.length > 0 ? Utils.clamp((this.length - this.remainingAnimation) / this.length, 0, 1) : 1;
    for (let j = 0; j < this.targets.length; j++) {
      this.targets[j].update(ratio);
    }

    // Notification
    this.updateEmitter.emit();

    // Handle finishing the animation if it is over.
    if (ratio === 1) {
      this.animatingProperty.value = false;
      this.runningProperty.value = false;

      // Step into the next animation by the overflow time
      this.finishEmitter.emit(dt);
      this.endedEmitter.emit();
    }
    return this;
  }

  /**
   * After this animation is complete, the given animation will be started.
   *
   * @returns - Returns the passed-in animation so things can be chained nicely.
   */
  then(animation) {
    this.finishEmitter.addListener(dt => animation.start(dt));
    return animation;
  }
}
twixt.register('Animation', Animation);
export default Animation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbWl0dGVyIiwic3RlcFRpbWVyIiwiVGlueUVtaXR0ZXIiLCJVdGlscyIsIm9wdGlvbml6ZSIsIkFuaW1hdGlvblRhcmdldCIsInR3aXh0IiwiQW5pbWF0aW9uIiwibGVuZ3RoIiwicmVtYWluaW5nRGVsYXkiLCJyZW1haW5pbmdBbmltYXRpb24iLCJydW5uaW5nUHJvcGVydHkiLCJhbmltYXRpbmdQcm9wZXJ0eSIsInN0YXJ0RW1pdHRlciIsImJlZ2luRW1pdHRlciIsImZpbmlzaEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwic3RvcEVtaXR0ZXIiLCJlbmRlZEVtaXR0ZXIiLCJoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzIiwidXBkYXRlRW1pdHRlciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRDb25maWciLCJjb25maWciLCJ0YXJnZXRzIiwiZHVyYXRpb24iLCJkZWxheSIsInN0ZXBFbWl0dGVyIiwiYXNzZXJ0IiwicHJvcGVydHkiLCJ1bmRlZmluZWQiLCJvYmplY3QiLCJzZXRWYWx1ZSIsImlzRmluaXRlIiwibWFwIiwiXyIsInN1bSIsInRhcmdldCIsImhhc1ByZWZlcnJlZER1cmF0aW9uIiwic3RlcExpc3RlbmVyIiwic3RlcCIsImJpbmQiLCJsaW5rIiwicnVubmluZyIsImhhc0xpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsInN0YXJ0IiwiZHQiLCJ2YWx1ZSIsImVtaXQiLCJzdG9wIiwiaSIsImNvbXB1dGVTdGFydEVuZCIsImdldFByZWZlcnJlZER1cmF0aW9uIiwicmF0aW8iLCJjbGFtcCIsImoiLCJ1cGRhdGUiLCJ0aGVuIiwiYW5pbWF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBbmltYXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gZWFzaW5nLWJhc2VkIGNvbnRyb2xsYWJsZSBhbmltYXRpb24uXHJcbiAqXHJcbiAqIFdlIHVzZSBzb21lIHRlcm1pbm9sb2d5IHRvIGRlc2NyaWJlIHBvaW50cyBhbmQgcmVnaW9ucyBpbiB0aW1lIGZvciBhbiBhbmltYXRpb246XHJcbiAqXHJcbiAqICAgICAgICAgICAgIHN0YXJ0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWdpbnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVzXHJcbiAqICAgICAgICAgICAgICAgfCAgICAgICAgICAgICBkZWxheSAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgYW5pbWF0aW9uICAgICAgICAgICAgICAgIHxcclxuICogdGltZS0tPiAgICAgICB8ICAgICAgICAgICAod2FpdGluZykgICAgICAgICAgICAgfCAgICAgKGFuaW1hdGVkIHZhbHVlcyBjaGFuZ2luZykgICAgICAgfFxyXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogICAgICAgICAgICAgICB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tcnVubmluZy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tfFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8LS0tLS0tLS0tLS0tLWFuaW1hdGluZy0tLS0tLS0tLS0tLS0tLS18XHJcbiAqXHJcbiAqIFRPRE8gIzM6IHBhdXNlL2NhbmNlbCAoYW5kIHN0b3AtPmNhbmNlbCByZW5hbWluZylcclxuICogVE9ETyAjMzogZnVuY3Rpb24gZm9yIGJsZW5kaW5nIHdpdGggYW5ndWxhci9yb3RhdGlvbmFsIHZhbHVlc1xyXG4gKiBUT0RPICMzOiBjb25zaWRlciBrZXlmcmFtZWQgYW5pbWF0aW9uIGhlbHBlcj9cclxuICogVE9ETyAjMzogSG9va3MgZm9yIGF0dGFjaGluZy9kZXRhY2hpbmcgc3RlcHBpbmcgdmlhIHNjcmVlbnMvbm9kZXNcclxuICogVE9ETyAjMzogQWRkIGRvY3VtZW50YXRpb24gZXhhbXBsZXMgKGNvbnRpbmdlbnQgb24gaG93IHNjcmVlbi9ub2RlIGhvb2tzIHdvcmspXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IHN0ZXBUaW1lciBmcm9tICcuLi8uLi9heG9uL2pzL3N0ZXBUaW1lci5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IFRpbnlFbWl0dGVyIGZyb20gJy4uLy4uL2F4b24vanMvVGlueUVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvblRhcmdldCwgeyBBbmltYXRpb25UYXJnZXRPcHRpb25zIH0gZnJvbSAnLi9BbmltYXRpb25UYXJnZXQuanMnO1xyXG5pbXBvcnQgdHdpeHQgZnJvbSAnLi90d2l4dC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zPFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcyBleHRlbmRzIHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiB1bmtub3duIH0+ID0ge1xyXG4gIC8vIENhbiBiZSBwcm92aWRlZCBpbnN0ZWFkIG9mIHNldFZhbHVlL3Byb3BlcnR5L29iamVjdCwgYW5kIGl0IGNvbnRhaW5zIGFuIGFycmF5IG9mIGNvbmZpZy1zdHlsZSBvYmplY3RzIHRoYXQgYWxsb3dzXHJcbiAgLy8gYW5pbWF0aW5nIG11bHRpcGxlIGRpZmZlcmVudCB0aGluZ3MgYXQgdGhlIHNhbWUgdGltZS4gU2VlIEFuaW1hdGlvblRhcmdldCBmb3IgZGV0YWlscyBhYm91dCBhbGwgb2YgdGhlIHN1cHBvcnRlZFxyXG4gIC8vIGNvbmZpZy5cclxuICAvLyBOT1RFOiBzcGVlZCwgaWYgcHJvdmlkZWQsIHNob3VsZCBiZSBvbmx5IHNwZWNpZmllZCBvbiBleGFjdGx5IG9uZSBvZiB0aGUgdGFyZ2V0cycgY29uZmlnIGlmIG11bHRpcGxlIHRhcmdldHNcclxuICAvLyBhcmUgc3BlY2lmaWVkLlxyXG4gIHRhcmdldHM/OiB7IFtLIGluIGtleW9mIFRhcmdldFR5cGVzXTogQW5pbWF0aW9uVGFyZ2V0T3B0aW9uczxUYXJnZXRUeXBlc1tLXSwgVGFyZ2V0T2JqZWN0VHlwZXNbS10+IH0gfCBudWxsO1xyXG5cclxuICAvLyBJZiBwcm92aWRlZCwgdGhlIGFuaW1hdGlvbidzIGxlbmd0aCB3aWxsIGJlIHRoaXMgdmFsdWUgKGluIHNlY29uZHMpLiBJZiBvbWl0dGVkLCBvbmUgb2YgdGhlIHRhcmdldHMnIGBzcGVlZGAgb3B0aW9uXHJcbiAgLy8gc2hvdWxkIGJlIHNldCAodGhlIGxlbmd0aCBvZiB0aGUgYW5pbWF0aW9uIHdpbGwgYmUgYmFzZWQgb24gdGhhdCkuXHJcbiAgZHVyYXRpb24/OiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvLyBUaGUgYW1vdW50IG9mIHRpbWUgKGluIHNlY29uZHMpIGJldHdlZW4gd2hlbiB0aGUgYW5pbWF0aW9uIGlzIFwic3RhcnRlZFwiIGFuZCB3aGVuIHRoZSBhY3R1YWwgYW5pbWF0aW9uIG9mIHRoZSB2YWx1ZVxyXG4gIC8vIGJlZ2lucy4gTmVnYXRpdmUgZGVsYXlzIGFyZSBub3Qgc3VwcG9ydGVkLlxyXG4gIGRlbGF5PzogbnVtYmVyO1xyXG5cclxuICAvLyBPbmUgb2YgdGhlIGZvbGxvd2luZyBjb25maWc6XHJcbiAgLy8gVGhlIEVtaXR0ZXIgKHdoaWNoIHByb3ZpZGVzIGEgZHQge251bWJlcn0gdmFsdWUgb24gZW1pdCkgd2hpY2ggZHJpdmVzIHRoZSBhbmltYXRpb24sIG9yIG51bGwgaWYgdGhlIGNsaWVudFxyXG4gIC8vIHdpbGwgZHJpdmUgdGhlIGFuaW1hdGlvbiBieSBjYWxsaW5nIGBzdGVwKGR0KWAgbWFudWFsbHkuICBEZWZhdWx0cyB0byB0aGUgam9pc3QgVGltZXIgd2hpY2ggcnVucyBhdXRvbWF0aWNhbGx5XHJcbiAgLy8gYXMgcGFydCBvZiB0aGUgU2ltIHRpbWUgc3RlcC5cclxuICAvLyBUT0RPICMzOiB7U2NyZWVuVmlld30gLSBhbmltYXRlcyBvbmx5IHdoZW4gdGhlIFNjcmVlblZpZXcgaXMgdGhlIGFjdGl2ZSBvbmUuXHJcbiAgLy8gVE9ETyAjMzoge05vZGV9IC0gYW5pbWF0ZXMgb25seSB3aGVuIHRoZSBub2RlJ3MgdHJhaWwgaXMgdmlzaWJsZSBvbiBhIERpc3BsYXlcclxuICBzdGVwRW1pdHRlcj86IFRFbWl0dGVyPFsgbnVtYmVyIF0+IHwgbnVsbDtcclxufTtcclxuXHJcbi8vIElNUE9SVEFOVDogU2VlIEFuaW1hdGlvblRhcmdldCdzIGNvbmZpZyBkb2N1bWVudGF0aW9uLCBhcyB0aG9zZSBjb25maWcgY2FuIGJlIHBhc3NlZCBpbiBlaXRoZXIgaGVyZSwgb3IgaW5cclxuLy8gdGhlIHRhcmdldHMgYXJyYXkuXHJcbmV4cG9ydCB0eXBlIEFuaW1hdGlvbk9wdGlvbnM8U2VsZlR5cGUgPSB1bmtub3duLCBTZWxmT2JqZWN0VHlwZSA9IHVua25vd24sIFRhcmdldFR5cGVzID0gdW5rbm93bltdLCBUYXJnZXRPYmplY3RUeXBlcyBleHRlbmRzIHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiB1bmtub3duIH0gPSB7IFtLIGluIGtleW9mIFRhcmdldFR5cGVzXTogdW5rbm93biB9PiA9IFNlbGZPcHRpb25zPFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcz4gJiBBbmltYXRpb25UYXJnZXRPcHRpb25zPFNlbGZUeXBlLCBTZWxmT2JqZWN0VHlwZT47XHJcblxyXG5jbGFzcyBBbmltYXRpb248U2VsZlR5cGUgPSB1bmtub3duLCBTZWxmT2JqZWN0VHlwZSA9IHVua25vd24sIFRhcmdldFR5cGVzID0gdW5rbm93bltdLCBUYXJnZXRPYmplY3RUeXBlcyBleHRlbmRzIHsgW0sgaW4ga2V5b2YgVGFyZ2V0VHlwZXNdOiB1bmtub3duIH0gPSB7IFtLIGluIGtleW9mIFRhcmdldFR5cGVzXTogdW5rbm93biB9PiB7XHJcblxyXG4gIC8vIEFsbCBvZiB0aGUgZGlmZmVyZW50IHZhbHVlcyB0aGF0IHdpbGwgYmUgYW5pbWF0ZWQgYnkgdGhpcyBhbmltYXRpb24uXHJcbiAgLy8gSWYgY29uZmlnLnRhcmdldHMgd2FzIHN1cHBsaWVkLCB0aG9zZSB0YXJnZXRzIHdpbGwgYmUgd3JhcHBlZCBpbnRvIEFuaW1hdGlvblRhcmdldHNcclxuICAvLyBJZiBjb25maWcudGFyZ2V0cyB3YXMgbm90IHN1cHBsaWVkLCB0aGUgY29uZmlnIGZyb20gdGhpcyBvYmplY3Qgd2lsbCBiZSB3cmFwcGVkIGludG8gb25lIEFuaW1hdGlvblRhcmdldFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdGFyZ2V0czogQW5pbWF0aW9uVGFyZ2V0PHVua25vd24+W107XHJcblxyXG4gIC8vIFNhdmVkIGNvbmZpZyB0byBoZWxwIGRldGVybWluZSB0aGUgbGVuZ3RoIG9mIHRoZSBhbmltYXRpb25cclxuICBwcml2YXRlIHJlYWRvbmx5IGR1cmF0aW9uOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvLyBJbiBzZWNvbmRzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkZWxheTogbnVtYmVyO1xyXG5cclxuICAvLyBDb21wdXRlZCBsZW5ndGggZm9yIHRoZSBhbmltYXRpb24gKGluIHNlY29uZHMpXHJcbiAgcHJpdmF0ZSBsZW5ndGg6IG51bWJlciB8IG51bGwgPSAwO1xyXG5cclxuICAvLyBMZW5ndGggb2YgdGltZSByZW1haW5pbmcgaW4gdGhlIFwiZGVsYXlcIiBwb3J0aW9uLiBDb21wdXRlZCBhZnRlciB0aGUgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQsIGFuZCBvbmx5IHVzZWQgdW50aWwgdGhlXHJcbiAgLy8gYW5pbWF0aW9uIFwiYmVnaW5zXCIuXHJcbiAgcHJpdmF0ZSByZW1haW5pbmdEZWxheSA9IDA7XHJcblxyXG4gIC8vIExlbmd0aCBvZiB0aW1lIHJlbWFpbmluZyBpbiB0aGUgYWN0dWFsIGFuaW1hdGlvbiAoYWZ0ZXIgdGhlIGRlbGF5KSBwb3J0aW9uLiBDb21wdXRlZCBhZnRlciB0aGUgZGVsYXkgaGFzIHBhc3NlZCxcclxuICAvLyBhbmQgb25seSB1c2VkIHVudGlsIHRoZSBhbmltYXRpb24gXCJlbmRzXCIuXHJcbiAgcHJpdmF0ZSByZW1haW5pbmdBbmltYXRpb24gPSAwO1xyXG5cclxuICAvLyBUcnVlIHdoaWxlIHRoZSBhbmltYXRpb24gaXMgYmVpbmcgc3RlcHBlZCB0aHJvdWdoIChib3RoIHRoZSBkZWxheSBwb3J0aW9uIEFORCB0aGUgYWN0dWFsIGFuaW1hdGlvbiBwb3J0aW9uKS5cclxuICBwdWJsaWMgcmVhZG9ubHkgcnVubmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuXHJcbiAgLy8gVHJ1ZSB3aGlsZSB0aGUgYW5pbWF0aW9uIGlzIGFjdHVhbGx5IGNoYW5naW5nIHRoZSB2YWx1ZSAoZmFsc2Ugd2hpbGUgd2FpdGluZyBmb3IgdGhlIGRlbGF5LCBvciB3aGlsZSB0aGUgYW5pbWF0aW9uXHJcbiAgLy8gaXMgbm90IHJ1bm5pbmcgYXQgYWxsKS5cclxuICBwdWJsaWMgcmVhZG9ubHkgYW5pbWF0aW5nUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAvLyBGaXJlZCB3aGVuIHRoZSBhbmltYXRpb24gaXMgXCJzdGFydGVkXCIgKGkuZS4gd2hlbiBzdGFydCgpIGlzIGNhbGxlZCBhbmQgdGhlIGRlbGF5LCBpZiBvbmUgaXMgdGhlcmUsIHN0YXJ0cykuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0YXJ0RW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gIC8vIEZpcmVkIHdoZW4gdGhlIGFjdHVhbCBhbmltYXRpb24gb2YgdGhlIHZhbHVlIGJlZ2lucyAoaS5lLiB3aGVuIHRoZSBkZWxheSBmaW5pc2hlcyBhbmQgdGhlIGFjdHVhbCBhbmltYXRpb24gYmVnaW5zKS5cclxuICBwdWJsaWMgcmVhZG9ubHkgYmVnaW5FbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgLy8gRmlyZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGZpbmlzaGVzIG5hdHVyYWxseSAod2FzIG5vdCBhYm5vcm1hbGx5IHN0b3BwZWQpLiBBIHtudW1iZXJ9IGlzIHByb3ZpZGVkIGFzIGEgc2luZ2xlXHJcbiAgLy8gYXJndW1lbnQgdG8gdGhlIGVtaXQgY2FsbGJhY2ssIGFuZCByZXByZXNlbnRzIGhvdyBtdWNoIFwiZXh0cmFcIiB0aW1lIG9jY3VycmVkIGFmdGVyIHRoZSBlbmQgb2YgdGhlIGFuaW1hdGlvbi4gRm9yXHJcbiAgLy8gZXhhbXBsZSwgaWYgeW91IGhhdmUgYSAxLXNlY29uZCBhbmltYXRpb24gYW5kIHN0ZXBwZWQgaXQgYnkgMyBzZWNvbmRzLCB0aGlzIGZpbmlzaGVkIGVtaXR0ZXIgd291bGQgYmUgY2FsbGVkIHdpdGhcclxuICAvLyAyIHNlY29uZHMuXHJcbiAgcHVibGljIHJlYWRvbmx5IGZpbmlzaEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIG51bWJlciBdPiggeyBwYXJhbWV0ZXJzOiBbIHsgdmFsdWVUeXBlOiAnbnVtYmVyJyB9IF0gfSApO1xyXG5cclxuICAvLyBGaXJlZCB3aGVuIHRoZSBhbmltYXRpb24gaXMgbWFudWFsbHkgc3RvcHBlZCAod2l0aCBzdG9wKCkpLiBEb2VzIE5PVCBmaXJlIHdoZW4gaXQgZmluaXNoZXMgbm9ybWFsbHkuXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0b3BFbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcclxuXHJcbiAgLy8gRmlyZWQgd2hlbiB0aGUgYW5pbWF0aW9uIGVuZHMsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciBpdCBmdWxseSBmaW5pc2hlZCwgb3Igd2FzIHN0b3BwZWQgcHJlbWF0dXJlbHkuXHJcbiAgcHVibGljIHJlYWRvbmx5IGVuZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7IGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IHRydWUgfSApOyAvLyBUT0RPOiBsaXN0ZW5lciBvcmRlciBkZXBlbmRlbmNpZXMgaW4gc2hvdWxkIGJlIGRlYWx0IHdpdGgsIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mcmFjdGlvbi1tYXRjaGVyL2lzc3Vlcy8xMTBcclxuXHJcbiAgLy8gRmlyZWQgd2hlbiAoanVzdCBhZnRlcikgdGhlIGFuaW1hdGlvbiBoYXMgY2hhbmdlZCBhbmltYXRlZCB2YWx1ZXMvdGFyZ2V0cy5cclxuICBwdWJsaWMgcmVhZG9ubHkgdXBkYXRlRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSBjb25zdHJ1Y3RvciBjb25maWcgd2lsbCBkZWZpbmUgb25lIG9yIG1vcmUgYW5pbWF0aW9uIFwidGFyZ2V0c1wiIChzcGVjaWZpYyB2YWx1ZXMgdG8gYmUgYW5pbWF0ZWQpLiBUaGUgY29uZmlnXHJcbiAgICogYXZhaWxhYmxlIGZvciB0YXJnZXRzIGlzIGRvY3VtZW50ZWQgaW4gQW5pbWF0aW9uVGFyZ2V0LlxyXG4gICAqXHJcbiAgICogSWYgdGhlcmUgaXMgb25seSBvbmUgdGFyZ2V0LCBpdCBpcyByZWNvbW1lbmRlZCB0byBwYXNzIGluIHRob3NlIGNvbmZpZyBpbiB0aGUgdG9wLWxldmVsIEFuaW1hdGlvbiBjb25maWcsIGUuZy46XHJcbiAgICogfCB2YXIgc29tZU51bWJlclByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwICk7XHJcbiAgICogfCBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICogfCAgIC8vIE9wdGlvbnMgZm9yIHRoZSBBbmltYXRpb24gYXMgYSB3aG9sZVxyXG4gICAqIHwgICBkdXJhdGlvbjogMixcclxuICAgKiB8XHJcbiAgICogfCAgIC8vIE9wdGlvbnMgZm9yIHRoZSBvbmUgdGFyZ2V0IHRvIGNoYW5nZVxyXG4gICAqIHwgICBwcm9wZXJ0eTogc29tZU51bWJlclByb3BlcnR5LFxyXG4gICAqIHwgICB0bzogNVxyXG4gICAqIHwgfSApO1xyXG4gICAqXHJcbiAgICogSG93ZXZlciBtdWx0aXBsZSBkaWZmZXJlbnQgdGFyZ2V0cyBhcmUgc3VwcG9ydGVkLCBhbmQgc2hvdWxkIGJlIHNwZWNpZmllZCBpbiB0aGUgYHRhcmdldHNgIG9wdGlvbjpcclxuICAgKiB8IHZhciBzb21lTnVtYmVyUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDEwMCApO1xyXG4gICAqIHwgdmFyIHNvbWVPYmplY3QgPSB7IHNvbWVBdHRyaWJ1dGU6IG5ldyBWZWN0b3IyKCAxMDAsIDUgKSB9O1xyXG4gICAqIHwgbmV3IEFuaW1hdGlvbigge1xyXG4gICAqIHwgICAvLyBPcHRpb25zIGZvciB0aGUgQW5pbWF0aW9uIGFzIGEgd2hvbGVcclxuICAgKiB8ICAgZHVyYXRpb246IDIsXHJcbiAgICogfFxyXG4gICAqIHwgICB0YXJnZXRzOiBbIHtcclxuICAgKiB8ICAgICAvLyBGaXJzdCB0YXJnZXRcclxuICAgKiB8ICAgICBwcm9wZXJ0eTogc29tZU51bWJlclByb3BlcnR5LFxyXG4gICAqIHwgICAgIHRvOiA1XHJcbiAgICogfCAgIH0sIHtcclxuICAgKiB8ICAgICAvLyBTZWNvbmQgdGFyZ2V0XHJcbiAgICogfCAgICAgb2JqZWN0OiBzb21lT2JqZWN0LFxyXG4gICAqIHwgICAgIGF0dHJpYnV0ZTogJ3NvbWVBdHRyaWJ1dGUnLFxyXG4gICAqIHwgICAgIHRvOiBuZXcgVmVjdG9yMiggNTAsIDEwIClcclxuICAgKiB8ICAgfSBdXHJcbiAgICogfCB9ICk7XHJcbiAgICpcclxuICAgKiBOT1RFOiBUaGUgbGVuZ3RoIG9mIHRoZSBhbmltYXRpb24gbmVlZHMgdG8gYmUgc3BlY2lmaWVkIGluIGV4YWN0bHkgb25lIHBsYWNlLiBUaGlzIGNhbiB1c3VhbGx5IGJlIGRvbmUgYnlcclxuICAgKiBzcGVjaWZ5aW5nIHRoZSBgZHVyYXRpb25gIGluIHRoZSBjb25maWcsIGJ1dCBgc3BlZWRgIGNhbiBhbHNvIGJlIHVzZWQgaW4gYW55IG9mIHRoZSB0YXJnZXRzLlxyXG4gICAqXHJcbiAgICogRVhBTVBMRTogSXQncyBwb3NzaWJsZSB0byBjcmVhdGUgY29udGludW91cyBhbmltYXRpb24gbG9vcHMsIHdoZXJlIGFuaW1hdGlvbnMgY3ljbGUgYmFjayBhbmQgZm9ydGgsIGUuZy46XHJcbiAgICogfCB2YXIgbW9yZU9wYXF1ZSA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgKiB8ICAgb2JqZWN0OiBhbmltYXRlZENpcmNsZSxcclxuICAgKiB8ICAgYXR0cmlidXRlOiAnb3BhY2l0eScsXHJcbiAgICogfCAgIGZyb206IDAuNSxcclxuICAgKiB8ICAgdG86IDEsXHJcbiAgICogfCAgIGR1cmF0aW9uOiAwLjUsXHJcbiAgICogfCAgIGVhc2luZzogRWFzaW5nLlFVQURSQVRJQ19JTl9PVVRcclxuICAgKiB8IH0gKTtcclxuICAgKiB8IHZhciBsZXNzT3BhcXVlID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAqIHwgICBvYmplY3Q6IGFuaW1hdGVkQ2lyY2xlLFxyXG4gICAqIHwgICBhdHRyaWJ1dGU6ICdvcGFjaXR5JyxcclxuICAgKiB8ICAgZnJvbTogMSxcclxuICAgKiB8ICAgdG86IDAuNSxcclxuICAgKiB8ICAgZHVyYXRpb246IDAuNSxcclxuICAgKiB8ICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxyXG4gICAqIHwgfSApO1xyXG4gICAqIHwgbW9yZU9wYXF1ZS50aGVuKCBsZXNzT3BhcXVlICk7XHJcbiAgICogfCBsZXNzT3BhcXVlLnRoZW4oIG1vcmVPcGFxdWUgKTtcclxuICAgKiB8IGxlc3NPcGFxdWUuc3RhcnQoKTtcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkQ29uZmlnOiBBbmltYXRpb25PcHRpb25zPFNlbGZUeXBlLCBTZWxmT2JqZWN0VHlwZSwgVGFyZ2V0VHlwZXMsIFRhcmdldE9iamVjdFR5cGVzPiApIHtcclxuXHJcbiAgICBjb25zdCBjb25maWcgPSBvcHRpb25pemU8QW5pbWF0aW9uT3B0aW9uczxTZWxmVHlwZSwgU2VsZk9iamVjdFR5cGUsIFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcz4sIFNlbGZPcHRpb25zPFRhcmdldFR5cGVzLCBUYXJnZXRPYmplY3RUeXBlcz4+KCkoIHtcclxuICAgICAgdGFyZ2V0czogbnVsbCxcclxuICAgICAgZHVyYXRpb246IG51bGwsXHJcbiAgICAgIGRlbGF5OiAwLFxyXG4gICAgICBzdGVwRW1pdHRlcjogc3RlcFRpbWVyXHJcbiAgICB9LCBwcm92aWRlZENvbmZpZyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICsoIGNvbmZpZy5wcm9wZXJ0eSAhPT0gdW5kZWZpbmVkICkgKyArKCBjb25maWcub2JqZWN0ICE9PSB1bmRlZmluZWQgKSArICsoIGNvbmZpZy5zZXRWYWx1ZSAhPT0gdW5kZWZpbmVkICkgKyArKCBjb25maWcudGFyZ2V0cyAhPT0gbnVsbCApID09PSAxLFxyXG4gICAgICAnU2hvdWxkIGhhdmUgb25lIChhbmQgb25seSBvbmUpIHdheSBvZiBkZWZpbmluZyBob3cgdG8gc2V0IHRoZSBhbmltYXRlZCB2YWx1ZS4gVXNlIG9uZSBvZiBwcm9wZXJ0eS9vYmplY3Qvc2V0VmFsdWUvdGFyZ2V0cycgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0eXBlb2YgY29uZmlnLmRlbGF5ID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSggY29uZmlnLmRlbGF5ICkgJiYgY29uZmlnLmRlbGF5ID49IDAsXHJcbiAgICAgICdUaGUgZGVsYXkgc2hvdWxkIGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4nICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLnN0ZXBFbWl0dGVyID09PSBudWxsIHx8IGNvbmZpZy5zdGVwRW1pdHRlciBpbnN0YW5jZW9mIEVtaXR0ZXIgfHwgY29uZmlnLnN0ZXBFbWl0dGVyIGluc3RhbmNlb2YgVGlueUVtaXR0ZXIsXHJcbiAgICAgICdzdGVwRW1pdHRlciBtdXN0IGJlIG51bGwgb3IgYW4gKFRpbnkpRW1pdHRlcicgKTtcclxuXHJcbiAgICB0aGlzLnRhcmdldHMgPSAoICggY29uZmlnLnRhcmdldHMgPT09IG51bGwgPyBbIGNvbmZpZyBdIDogY29uZmlnLnRhcmdldHMgKSBhcyBBbmltYXRpb25UYXJnZXRPcHRpb25zW10gKS5tYXAoIGNvbmZpZyA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgQW5pbWF0aW9uVGFyZ2V0KCBjb25maWcgKTsgLy8gVE9ETyAjMzogc3RyaXAgb3V0IHRoZSBpcnJlbGV2YW50IGNvbmZpZyB3aGVuIHVzaW5nIGNvbmZpZyBhcmdcclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCArKCBjb25maWcuZHVyYXRpb24gIT09IG51bGwgKSArIF8uc3VtKCBfLm1hcCggdGhpcy50YXJnZXRzLFxyXG4gICAgICB0YXJnZXQgPT4gdGFyZ2V0Lmhhc1ByZWZlcnJlZER1cmF0aW9uKCkgPyAxIDogMFxyXG4gICAgKSApID09PSAxLCAnRXhhY3RseSBvbmUgZHVyYXRpb24vc3BlZWQgb3B0aW9uIHNob3VsZCBiZSB1c2VkLicgKTtcclxuXHJcbiAgICB0aGlzLmR1cmF0aW9uID0gY29uZmlnLmR1cmF0aW9uO1xyXG4gICAgdGhpcy5kZWxheSA9IGNvbmZpZy5kZWxheTtcclxuXHJcbiAgICAvLyBXaXJlIHVwIHRvIHRoZSBwcm92aWRlZCBFbWl0dGVyLCBpZiBhbnkuIFdoZW5ldmVyIHRoaXMgYW5pbWF0aW9uIGlzIHN0YXJ0ZWQsIGl0IHdpbGwgYWRkIGEgbGlzdGVuZXIgdG8gdGhlIFRpbWVyXHJcbiAgICAvLyAoYW5kIGNvbnZlcnNlbHksIHdpbGwgYmUgcmVtb3ZlZCB3aGVuIHN0b3BwZWQpLiBUaGlzIG1lYW5zIGl0IHdpbGwgYW5pbWF0ZSB3aXRoIHRoZSB0aW1lciwgYnV0IHdpbGwgbm90IGxlYWtcclxuICAgIC8vIG1lbW9yeSBhcyBsb25nIGFzIHRoZSBhbmltYXRpb24gZG9lc24ndCBsYXN0IGZvcmV2ZXIuXHJcbiAgICBjb25zdCBzdGVwRW1pdHRlciA9IGNvbmZpZy5zdGVwRW1pdHRlcjtcclxuICAgIGlmICggc3RlcEVtaXR0ZXIgKSB7XHJcbiAgICAgIGNvbnN0IHN0ZXBMaXN0ZW5lciA9IHRoaXMuc3RlcC5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgICB0aGlzLnJ1bm5pbmdQcm9wZXJ0eS5saW5rKCBydW5uaW5nID0+IHtcclxuICAgICAgICBpZiAoIHJ1bm5pbmcgJiYgIXN0ZXBFbWl0dGVyLmhhc0xpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKSApIHtcclxuICAgICAgICAgIHN0ZXBFbWl0dGVyLmFkZExpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoICFydW5uaW5nICYmIHN0ZXBFbWl0dGVyLmhhc0xpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKSApIHtcclxuICAgICAgICAgIHN0ZXBFbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCBzdGVwTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0cyB0aGUgYW5pbWF0aW9uIChvciBpZiBpdCBoYXMgYSBkZWxheSwgc2V0cyB0aGUgYW5pbWF0aW9uIHRvIHN0YXJ0IGFmdGVyIHRoYXQgZGVsYXkpLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIFtkdF0gLSBJZiBwcm92aWRlZCwgc3RlcCB0aGlzIGZhciBpbnRvIHRoZSBhbmltYXRpb24gaW5pdGlhbGx5LiAgVXNlZCBmb3IgY2hhaW5pbmcgYW5pbWF0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhcnQoIGR0PzogbnVtYmVyICk6IHRoaXMge1xyXG4gICAgLy8gSWYgd2UgYXJlIGFscmVhZHkgYW5pbWF0aW5nLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoIHRoaXMucnVubmluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgcmVtYWluaW5nIGRlbGF5IG5lZWRzIHRvIGJlIHZhbGlkIGltbWVkaWF0ZWx5IGFmdGVyIHN0YXJ0IGlzIGNhbGxlZC5cclxuICAgIHRoaXMucmVtYWluaW5nRGVsYXkgPSB0aGlzLmRlbGF5O1xyXG5cclxuICAgIC8vIE5vdGlmaWNhdGlvbnNcclxuICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgIHRoaXMuc3RhcnRFbWl0dGVyLmVtaXQoKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgaW5pdGlhbCBzdGF0ZSBhbmQgdmFsdWVcclxuICAgIHRoaXMuc3RlcCggZHQgIT09IHVuZGVmaW5lZCA/IGR0IDogMCApO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RvcHMgdGhlIGFuaW1hdGlvbiAob3IgaWYgd2FpdGluZyBmb3IgdGhlIGRlbGF5LCB3aWxsIG5vdCBcInN0YXJ0XCIgdGhlIGFuaW1hdGlvbikuXHJcbiAgICovXHJcbiAgcHVibGljIHN0b3AoKTogdGhpcyB7XHJcbiAgICAvLyBJZiB3ZSBhcmUgbm90IGFscmVhZHkgYW5pbWF0aW5nLCBkbyBub3RoaW5nXHJcbiAgICBpZiAoICF0aGlzLnJ1bm5pbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm90aWZpY2F0aW9uc1xyXG4gICAgdGhpcy5ydW5uaW5nUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIHRoaXMuc3RvcEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgdGhpcy5lbmRlZEVtaXR0ZXIuZW1pdCgpO1xyXG5cclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RlcHMgdGhlIGFuaW1hdGlvbiBmb3J3YXJkIGJ5IGEgY2VydGFpbiBhbW91bnQgb2YgdGltZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkdCAtIEluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB0aGlzIHtcclxuXHJcbiAgICAvLyBJZ25vcmUgdGhlIHN0ZXAgaWYgb3VyIGFuaW1hdGlvbiBpcyBub3QgcnVubmluZ1xyXG4gICAgaWYgKCAhdGhpcy5ydW5uaW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZpcnN0LCBidXJuIHRocm91Z2ggdGhlIGRlbGF5IGlmIGFuaW1hdGlvbiBoYXNuJ3Qgc3RhcnRlZCB5ZXQuXHJcbiAgICBpZiAoICF0aGlzLmFuaW1hdGluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnJlbWFpbmluZ0RlbGF5IC09IGR0O1xyXG4gICAgICBkdCA9IC10aGlzLnJlbWFpbmluZ0RlbGF5OyAvLyByZWNvcmQgaG93IGZhciBwYXN0IHRoZSBkZWxheSB3ZSBnb1xyXG5cclxuICAgICAgLy8gQmFpbCBpZiB3ZSBhcmUgbm90IHJlYWR5IHRvIHN0YXJ0IHRoZSBhbmltYXRpb25cclxuICAgICAgaWYgKCB0aGlzLnJlbWFpbmluZ0RlbGF5ID4gMCApIHtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ29tcHV0ZSB0aGUgc3RhcnQvZW5kIGZvciBlYWNoIHRhcmdldCwgYW5kIGRldGVybWluZSB0aGUgbGVuZ3RoIG9mIG91ciBhbmltYXRpb25cclxuICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmR1cmF0aW9uO1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnRhcmdldHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy50YXJnZXRzWyBpIF07XHJcbiAgICAgICAgdGFyZ2V0LmNvbXB1dGVTdGFydEVuZCgpO1xyXG5cclxuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgY29tcHV0ZWQgbGVuZ3RoIHlldCwgY2hlY2sgYWxsIG9mIG91ciB0YXJnZXRzXHJcbiAgICAgICAgaWYgKCB0aGlzLmxlbmd0aCA9PT0gbnVsbCApIHtcclxuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGFyZ2V0LmdldFByZWZlcnJlZER1cmF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubGVuZ3RoICE9PSBudWxsLCAnQWZ0ZXIgZ29pbmcgdGhyb3VnaCB0aGUgdGFyZ2V0cywgd2Ugc2hvdWxkIGhhdmUgYSBsZW5ndGggYnkgbm93JyApO1xyXG4gICAgICB0aGlzLnJlbWFpbmluZ0FuaW1hdGlvbiA9IHRoaXMubGVuZ3RoITtcclxuXHJcbiAgICAgIC8vIE5vdGlmeSBhYm91dCB0aGUgYW5pbWF0aW9uIHN0YXJ0aW5nXHJcbiAgICAgIHRoaXMuYW5pbWF0aW5nUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICB0aGlzLmJlZ2luRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGFrZSBvdXIgZHQgb2ZmIG9mIG91ciByZW1haW5pbmcgdGltZVxyXG4gICAgdGhpcy5yZW1haW5pbmdBbmltYXRpb24gLT0gZHQ7XHJcbiAgICBkdCA9IC10aGlzLnJlbWFpbmluZ0FuaW1hdGlvbjsgLy8gcmVjb3JkIGhvdyBmYXIgcGFzdCB0aGUgYW5pbWF0aW9uIHdlIGdvXHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5sZW5ndGggIT09IG51bGwgKTtcclxuICAgIGNvbnN0IHJhdGlvID0gdGhpcy5sZW5ndGghID4gMCA/IFV0aWxzLmNsYW1wKCAoIHRoaXMubGVuZ3RoISAtIHRoaXMucmVtYWluaW5nQW5pbWF0aW9uICkgLyB0aGlzLmxlbmd0aCEsIDAsIDEgKSA6IDE7XHJcbiAgICBmb3IgKCBsZXQgaiA9IDA7IGogPCB0aGlzLnRhcmdldHMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgIHRoaXMudGFyZ2V0c1sgaiBdLnVwZGF0ZSggcmF0aW8gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBOb3RpZmljYXRpb25cclxuICAgIHRoaXMudXBkYXRlRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgLy8gSGFuZGxlIGZpbmlzaGluZyB0aGUgYW5pbWF0aW9uIGlmIGl0IGlzIG92ZXIuXHJcbiAgICBpZiAoIHJhdGlvID09PSAxICkge1xyXG4gICAgICB0aGlzLmFuaW1hdGluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucnVubmluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcblxyXG4gICAgICAvLyBTdGVwIGludG8gdGhlIG5leHQgYW5pbWF0aW9uIGJ5IHRoZSBvdmVyZmxvdyB0aW1lXHJcbiAgICAgIHRoaXMuZmluaXNoRW1pdHRlci5lbWl0KCBkdCApO1xyXG4gICAgICB0aGlzLmVuZGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZnRlciB0aGlzIGFuaW1hdGlvbiBpcyBjb21wbGV0ZSwgdGhlIGdpdmVuIGFuaW1hdGlvbiB3aWxsIGJlIHN0YXJ0ZWQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAtIFJldHVybnMgdGhlIHBhc3NlZC1pbiBhbmltYXRpb24gc28gdGhpbmdzIGNhbiBiZSBjaGFpbmVkIG5pY2VseS5cclxuICAgKi9cclxuICBwdWJsaWMgdGhlbiggYW5pbWF0aW9uOiBBbmltYXRpb24gKTogQW5pbWF0aW9uIHtcclxuICAgIHRoaXMuZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCBkdDogbnVtYmVyICkgPT4gYW5pbWF0aW9uLnN0YXJ0KCBkdCApICk7XHJcbiAgICByZXR1cm4gYW5pbWF0aW9uO1xyXG4gIH1cclxufVxyXG5cclxudHdpeHQucmVnaXN0ZXIoICdBbmltYXRpb24nLCBBbmltYXRpb24gKTtcclxuZXhwb3J0IGRlZmF1bHQgQW5pbWF0aW9uOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sa0NBQWtDO0FBQzlELE9BQU9DLE9BQU8sTUFBTSwwQkFBMEI7QUFDOUMsT0FBT0MsU0FBUyxNQUFNLDRCQUE0QjtBQUVsRCxPQUFPQyxXQUFXLE1BQU0sOEJBQThCO0FBQ3RELE9BQU9DLEtBQUssTUFBTSx1QkFBdUI7QUFDekMsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxlQUFlLE1BQWtDLHNCQUFzQjtBQUM5RSxPQUFPQyxLQUFLLE1BQU0sWUFBWTs7QUEyQjlCO0FBQ0E7QUFHQSxNQUFNQyxTQUFTLENBQWlMO0VBRTlMO0VBQ0E7RUFDQTs7RUFHQTs7RUFHQTs7RUFHQTtFQUNRQyxNQUFNLEdBQWtCLENBQUM7O0VBRWpDO0VBQ0E7RUFDUUMsY0FBYyxHQUFHLENBQUM7O0VBRTFCO0VBQ0E7RUFDUUMsa0JBQWtCLEdBQUcsQ0FBQzs7RUFFOUI7RUFDZ0JDLGVBQWUsR0FBRyxJQUFJWixlQUFlLENBQUUsS0FBTSxDQUFDOztFQUU5RDtFQUNBO0VBQ2dCYSxpQkFBaUIsR0FBRyxJQUFJYixlQUFlLENBQUUsS0FBTSxDQUFDOztFQUVoRTtFQUNnQmMsWUFBWSxHQUFHLElBQUliLE9BQU8sQ0FBQyxDQUFDOztFQUU1QztFQUNn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