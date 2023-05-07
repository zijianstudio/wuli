// Copyright 2018-2022, University of Colorado Boulder

/**
 * IntroAnimator is responsible for animating the transition between 1 and 2 systems in the Intro screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import hookesLaw from '../../hookesLaw.js';

// constants
const STEPPER = null; // step method must be called by the client
const TRANSLATION_DURATION = 0.5; // duration of system 1 translation animation, in seconds
const OPACITY_DURATION = 0.5; // duration of system 2 opacity animation, in seconds

export default class IntroAnimator {
  // which Animation in the chain should be stepped

  constructor(numberOfSystemsProperty, system1Node, system2Node, layoutBounds, tandem) {
    this.activeAnimation = null;

    // Initial state
    if (numberOfSystemsProperty.value === 1) {
      system1Node.centerY = layoutBounds.centerY;
      system2Node.visible = false;
    } else {
      system1Node.centerY = 0.25 * layoutBounds.height;
      system2Node.visible = true;
    }
    system2Node.centerY = 0.75 * layoutBounds.height;

    // Vertical position of system 1, instrumented for PhET-iO to support record/playback, see #53.
    const system1CenterYProperty = new NumberProperty(system1Node.centerY, {
      tandem: tandem.createTandem('system1CenterYProperty'),
      phetioReadOnly: true
    });
    system1CenterYProperty.link(centerY => {
      system1Node.centerY = centerY;
    });

    // Opacity of system 2, instrumented for PhET-iO to support record/playback, see #53.
    const system2OpacityProperty = new NumberProperty(system2Node.opacity, {
      isValidValue: value => value >= 0 && value <= 1,
      tandem: tandem.createTandem('system2OpacityProperty'),
      phetioReadOnly: true
    });
    system2OpacityProperty.link(opacity => {
      system2Node.opacity = opacity;
    });
    let system1Animation = null; // animation for system 1 translation
    let system2Animation = null; // animation for system 2 opacity (fade)

    // unlink not needed
    numberOfSystemsProperty.link(numberOfSystems => {
      // Stop any animations that are in progress.
      system1Animation && system1Animation.stop();
      system2Animation && system2Animation.stop();
      if (numberOfSystems === 1) {
        // Fade out system 2, then move system 1 to vertical center of layoutBounds.

        // Fade out system 2.
        system2Animation = new Animation({
          stepEmitter: STEPPER,
          duration: OPACITY_DURATION,
          targets: [{
            property: system2OpacityProperty,
            easing: Easing.LINEAR,
            to: 0
          }]
        });

        // Translate system 1.
        system1Animation = new Animation({
          stepEmitter: STEPPER,
          duration: TRANSLATION_DURATION,
          targets: [{
            property: system1CenterYProperty,
            easing: Easing.LINEAR,
            to: layoutBounds.centerY // to centerY of layout bounds
          }]
        });

        // When the fade of system 2 completes, switch to translation of system 1.
        system2Animation.finishEmitter.addListener(() => {
          system2Node.visible = false; // Make system 2 invisible, so you can't interact with it.
          this.activeAnimation = system1Animation;
          assert && assert(system1Animation);
          system1Animation.start();
        });

        // When the translation of system 1 completes, notify that the animation has completed.
        system1Animation.finishEmitter.addListener(() => {
          this.activeAnimation = null;
        });

        // Start with the fade of system 2.
        this.activeAnimation = system2Animation;
      } else {
        // Move system 1 to top of layoutBounds, then fade in system 2.

        // Translate system 1.
        system1Animation = new Animation({
          stepEmitter: STEPPER,
          duration: TRANSLATION_DURATION,
          targets: [{
            property: system1CenterYProperty,
            easing: Easing.LINEAR,
            to: layoutBounds.minY + 0.25 * layoutBounds.height // towards top of layoutBounds
          }]
        });

        // Fade in system 2.
        system2Animation = new Animation({
          stepEmitter: STEPPER,
          duration: OPACITY_DURATION,
          targets: [{
            property: system2OpacityProperty,
            easing: Easing.LINEAR,
            to: 1
          }]
        });

        // When translation of system 1 completes, switch to fade of system 2.
        system1Animation.finishEmitter.addListener(() => {
          system2Node.visible = true; // Make system 2 visible.
          this.activeAnimation = system2Animation;
          assert && assert(system2Animation);
          system2Animation.start();
        });

        // When fade of system 2 completes, notify that the animation has completed.
        system2Animation.finishEmitter.addListener(() => {
          this.activeAnimation = null;
        });

        // Start the translation of system 1.
        this.activeAnimation = system1Animation;
      }
      this.activeAnimation.start();
    });
  }
  step(dt) {
    this.activeAnimation && this.activeAnimation.step(dt);
  }
}
hookesLaw.register('IntroAnimator', IntroAnimator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkFuaW1hdGlvbiIsIkVhc2luZyIsImhvb2tlc0xhdyIsIlNURVBQRVIiLCJUUkFOU0xBVElPTl9EVVJBVElPTiIsIk9QQUNJVFlfRFVSQVRJT04iLCJJbnRyb0FuaW1hdG9yIiwiY29uc3RydWN0b3IiLCJudW1iZXJPZlN5c3RlbXNQcm9wZXJ0eSIsInN5c3RlbTFOb2RlIiwic3lzdGVtMk5vZGUiLCJsYXlvdXRCb3VuZHMiLCJ0YW5kZW0iLCJhY3RpdmVBbmltYXRpb24iLCJ2YWx1ZSIsImNlbnRlclkiLCJ2aXNpYmxlIiwiaGVpZ2h0Iiwic3lzdGVtMUNlbnRlcllQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwibGluayIsInN5c3RlbTJPcGFjaXR5UHJvcGVydHkiLCJvcGFjaXR5IiwiaXNWYWxpZFZhbHVlIiwic3lzdGVtMUFuaW1hdGlvbiIsInN5c3RlbTJBbmltYXRpb24iLCJudW1iZXJPZlN5c3RlbXMiLCJzdG9wIiwic3RlcEVtaXR0ZXIiLCJkdXJhdGlvbiIsInRhcmdldHMiLCJwcm9wZXJ0eSIsImVhc2luZyIsIkxJTkVBUiIsInRvIiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwiYXNzZXJ0Iiwic3RhcnQiLCJtaW5ZIiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb0FuaW1hdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEludHJvQW5pbWF0b3IgaXMgcmVzcG9uc2libGUgZm9yIGFuaW1hdGluZyB0aGUgdHJhbnNpdGlvbiBiZXR3ZWVuIDEgYW5kIDIgc3lzdGVtcyBpbiB0aGUgSW50cm8gc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IGhvb2tlc0xhdyBmcm9tICcuLi8uLi9ob29rZXNMYXcuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNURVBQRVIgPSBudWxsOyAvLyBzdGVwIG1ldGhvZCBtdXN0IGJlIGNhbGxlZCBieSB0aGUgY2xpZW50XHJcbmNvbnN0IFRSQU5TTEFUSU9OX0RVUkFUSU9OID0gMC41OyAvLyBkdXJhdGlvbiBvZiBzeXN0ZW0gMSB0cmFuc2xhdGlvbiBhbmltYXRpb24sIGluIHNlY29uZHNcclxuY29uc3QgT1BBQ0lUWV9EVVJBVElPTiA9IDAuNTsgLy8gZHVyYXRpb24gb2Ygc3lzdGVtIDIgb3BhY2l0eSBhbmltYXRpb24sIGluIHNlY29uZHNcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludHJvQW5pbWF0b3Ige1xyXG5cclxuICAvLyB3aGljaCBBbmltYXRpb24gaW4gdGhlIGNoYWluIHNob3VsZCBiZSBzdGVwcGVkXHJcbiAgcHJpdmF0ZSBhY3RpdmVBbmltYXRpb246IEFuaW1hdGlvbiB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbnVtYmVyT2ZTeXN0ZW1zUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBzeXN0ZW0xTm9kZTogTm9kZSwgc3lzdGVtMk5vZGU6IE5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHRoaXMuYWN0aXZlQW5pbWF0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBJbml0aWFsIHN0YXRlXHJcbiAgICBpZiAoIG51bWJlck9mU3lzdGVtc1Byb3BlcnR5LnZhbHVlID09PSAxICkge1xyXG4gICAgICBzeXN0ZW0xTm9kZS5jZW50ZXJZID0gbGF5b3V0Qm91bmRzLmNlbnRlclk7XHJcbiAgICAgIHN5c3RlbTJOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzeXN0ZW0xTm9kZS5jZW50ZXJZID0gKCAwLjI1ICogbGF5b3V0Qm91bmRzLmhlaWdodCApO1xyXG4gICAgICBzeXN0ZW0yTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHN5c3RlbTJOb2RlLmNlbnRlclkgPSAwLjc1ICogbGF5b3V0Qm91bmRzLmhlaWdodDtcclxuXHJcbiAgICAvLyBWZXJ0aWNhbCBwb3NpdGlvbiBvZiBzeXN0ZW0gMSwgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPIHRvIHN1cHBvcnQgcmVjb3JkL3BsYXliYWNrLCBzZWUgIzUzLlxyXG4gICAgY29uc3Qgc3lzdGVtMUNlbnRlcllQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggc3lzdGVtMU5vZGUuY2VudGVyWSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzeXN0ZW0xQ2VudGVyWVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgc3lzdGVtMUNlbnRlcllQcm9wZXJ0eS5saW5rKCBjZW50ZXJZID0+IHtcclxuICAgICAgc3lzdGVtMU5vZGUuY2VudGVyWSA9IGNlbnRlclk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gT3BhY2l0eSBvZiBzeXN0ZW0gMiwgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPIHRvIHN1cHBvcnQgcmVjb3JkL3BsYXliYWNrLCBzZWUgIzUzLlxyXG4gICAgY29uc3Qgc3lzdGVtMk9wYWNpdHlQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggc3lzdGVtMk5vZGUub3BhY2l0eSwge1xyXG4gICAgICBpc1ZhbGlkVmFsdWU6IHZhbHVlID0+ICggdmFsdWUgPj0gMCAmJiB2YWx1ZSA8PSAxICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N5c3RlbTJPcGFjaXR5UHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICBzeXN0ZW0yT3BhY2l0eVByb3BlcnR5LmxpbmsoIG9wYWNpdHkgPT4ge1xyXG4gICAgICBzeXN0ZW0yTm9kZS5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBsZXQgc3lzdGVtMUFuaW1hdGlvbjogQW5pbWF0aW9uIHwgbnVsbCA9IG51bGw7IC8vIGFuaW1hdGlvbiBmb3Igc3lzdGVtIDEgdHJhbnNsYXRpb25cclxuICAgIGxldCBzeXN0ZW0yQW5pbWF0aW9uOiBBbmltYXRpb24gfCBudWxsID0gbnVsbDsgLy8gYW5pbWF0aW9uIGZvciBzeXN0ZW0gMiBvcGFjaXR5IChmYWRlKVxyXG5cclxuICAgIC8vIHVubGluayBub3QgbmVlZGVkXHJcbiAgICBudW1iZXJPZlN5c3RlbXNQcm9wZXJ0eS5saW5rKCBudW1iZXJPZlN5c3RlbXMgPT4ge1xyXG5cclxuICAgICAgLy8gU3RvcCBhbnkgYW5pbWF0aW9ucyB0aGF0IGFyZSBpbiBwcm9ncmVzcy5cclxuICAgICAgc3lzdGVtMUFuaW1hdGlvbiAmJiBzeXN0ZW0xQW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgc3lzdGVtMkFuaW1hdGlvbiAmJiBzeXN0ZW0yQW5pbWF0aW9uLnN0b3AoKTtcclxuXHJcbiAgICAgIGlmICggbnVtYmVyT2ZTeXN0ZW1zID09PSAxICkge1xyXG5cclxuICAgICAgICAvLyBGYWRlIG91dCBzeXN0ZW0gMiwgdGhlbiBtb3ZlIHN5c3RlbSAxIHRvIHZlcnRpY2FsIGNlbnRlciBvZiBsYXlvdXRCb3VuZHMuXHJcblxyXG4gICAgICAgIC8vIEZhZGUgb3V0IHN5c3RlbSAyLlxyXG4gICAgICAgIHN5c3RlbTJBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgICBzdGVwRW1pdHRlcjogU1RFUFBFUixcclxuICAgICAgICAgIGR1cmF0aW9uOiBPUEFDSVRZX0RVUkFUSU9OLFxyXG4gICAgICAgICAgdGFyZ2V0czogWyB7XHJcbiAgICAgICAgICAgIHByb3BlcnR5OiBzeXN0ZW0yT3BhY2l0eVByb3BlcnR5LFxyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVIsXHJcbiAgICAgICAgICAgIHRvOiAwXHJcbiAgICAgICAgICB9IF1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIFRyYW5zbGF0ZSBzeXN0ZW0gMS5cclxuICAgICAgICBzeXN0ZW0xQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgICAgc3RlcEVtaXR0ZXI6IFNURVBQRVIsXHJcbiAgICAgICAgICBkdXJhdGlvbjogVFJBTlNMQVRJT05fRFVSQVRJT04sXHJcbiAgICAgICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICAgICAgcHJvcGVydHk6IHN5c3RlbTFDZW50ZXJZUHJvcGVydHksXHJcbiAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLkxJTkVBUixcclxuICAgICAgICAgICAgdG86IGxheW91dEJvdW5kcy5jZW50ZXJZIC8vIHRvIGNlbnRlclkgb2YgbGF5b3V0IGJvdW5kc1xyXG4gICAgICAgICAgfSBdXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBXaGVuIHRoZSBmYWRlIG9mIHN5c3RlbSAyIGNvbXBsZXRlcywgc3dpdGNoIHRvIHRyYW5zbGF0aW9uIG9mIHN5c3RlbSAxLlxyXG4gICAgICAgIHN5c3RlbTJBbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgc3lzdGVtMk5vZGUudmlzaWJsZSA9IGZhbHNlOyAvLyBNYWtlIHN5c3RlbSAyIGludmlzaWJsZSwgc28geW91IGNhbid0IGludGVyYWN0IHdpdGggaXQuXHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUFuaW1hdGlvbiA9IHN5c3RlbTFBbmltYXRpb247XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzeXN0ZW0xQW5pbWF0aW9uICk7XHJcbiAgICAgICAgICBzeXN0ZW0xQW5pbWF0aW9uIS5zdGFydCgpO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gV2hlbiB0aGUgdHJhbnNsYXRpb24gb2Ygc3lzdGVtIDEgY29tcGxldGVzLCBub3RpZnkgdGhhdCB0aGUgYW5pbWF0aW9uIGhhcyBjb21wbGV0ZWQuXHJcbiAgICAgICAgc3lzdGVtMUFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBTdGFydCB3aXRoIHRoZSBmYWRlIG9mIHN5c3RlbSAyLlxyXG4gICAgICAgIHRoaXMuYWN0aXZlQW5pbWF0aW9uID0gc3lzdGVtMkFuaW1hdGlvbjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gTW92ZSBzeXN0ZW0gMSB0byB0b3Agb2YgbGF5b3V0Qm91bmRzLCB0aGVuIGZhZGUgaW4gc3lzdGVtIDIuXHJcblxyXG4gICAgICAgIC8vIFRyYW5zbGF0ZSBzeXN0ZW0gMS5cclxuICAgICAgICBzeXN0ZW0xQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgICAgc3RlcEVtaXR0ZXI6IFNURVBQRVIsXHJcbiAgICAgICAgICBkdXJhdGlvbjogVFJBTlNMQVRJT05fRFVSQVRJT04sXHJcbiAgICAgICAgICB0YXJnZXRzOiBbIHtcclxuICAgICAgICAgICAgcHJvcGVydHk6IHN5c3RlbTFDZW50ZXJZUHJvcGVydHksXHJcbiAgICAgICAgICAgIGVhc2luZzogRWFzaW5nLkxJTkVBUixcclxuICAgICAgICAgICAgdG86IGxheW91dEJvdW5kcy5taW5ZICsgKCAwLjI1ICogbGF5b3V0Qm91bmRzLmhlaWdodCApIC8vIHRvd2FyZHMgdG9wIG9mIGxheW91dEJvdW5kc1xyXG4gICAgICAgICAgfSBdXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICAvLyBGYWRlIGluIHN5c3RlbSAyLlxyXG4gICAgICAgIHN5c3RlbTJBbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgICAgICBzdGVwRW1pdHRlcjogU1RFUFBFUixcclxuICAgICAgICAgIGR1cmF0aW9uOiBPUEFDSVRZX0RVUkFUSU9OLFxyXG4gICAgICAgICAgdGFyZ2V0czogWyB7XHJcbiAgICAgICAgICAgIHByb3BlcnR5OiBzeXN0ZW0yT3BhY2l0eVByb3BlcnR5LFxyXG4gICAgICAgICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVIsXHJcbiAgICAgICAgICAgIHRvOiAxXHJcbiAgICAgICAgICB9IF1cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIC8vIFdoZW4gdHJhbnNsYXRpb24gb2Ygc3lzdGVtIDEgY29tcGxldGVzLCBzd2l0Y2ggdG8gZmFkZSBvZiBzeXN0ZW0gMi5cclxuICAgICAgICBzeXN0ZW0xQW5pbWF0aW9uLmZpbmlzaEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICAgIHN5c3RlbTJOb2RlLnZpc2libGUgPSB0cnVlOyAvLyBNYWtlIHN5c3RlbSAyIHZpc2libGUuXHJcbiAgICAgICAgICB0aGlzLmFjdGl2ZUFuaW1hdGlvbiA9IHN5c3RlbTJBbmltYXRpb247XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzeXN0ZW0yQW5pbWF0aW9uICk7XHJcbiAgICAgICAgICBzeXN0ZW0yQW5pbWF0aW9uIS5zdGFydCgpO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gV2hlbiBmYWRlIG9mIHN5c3RlbSAyIGNvbXBsZXRlcywgbm90aWZ5IHRoYXQgdGhlIGFuaW1hdGlvbiBoYXMgY29tcGxldGVkLlxyXG4gICAgICAgIHN5c3RlbTJBbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hY3RpdmVBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gU3RhcnQgdGhlIHRyYW5zbGF0aW9uIG9mIHN5c3RlbSAxLlxyXG4gICAgICAgIHRoaXMuYWN0aXZlQW5pbWF0aW9uID0gc3lzdGVtMUFuaW1hdGlvbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5hY3RpdmVBbmltYXRpb24uc3RhcnQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgdGhpcy5hY3RpdmVBbmltYXRpb24gJiYgdGhpcy5hY3RpdmVBbmltYXRpb24uc3RlcCggZHQgKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ0ludHJvQW5pbWF0b3InLCBJbnRyb0FuaW1hdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx1Q0FBdUM7QUFLbEUsT0FBT0MsU0FBUyxNQUFNLG1DQUFtQztBQUN6RCxP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