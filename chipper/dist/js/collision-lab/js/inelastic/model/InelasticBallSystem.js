// Copyright 2020-2022, University of Colorado Boulder

/**
 * InelasticBallSystem is a BallSystem sub-type for the 'Inelastic' screen. InelasticBallSystems only have 2 fixed Balls
 * and the numberOfBallsProperty cannot be mutated.
 *
 * In the 'Inelastic' screen, there are different 'presets' of Balls. When the user changes a the preset,
 * InelasticBallSystem will do the following:
 *   - Pause the sim.
 *   - Set the elapsed time to 0.
 *   - Set every Ball's position, mass, and velocity to the preset's BallStates, if the preset is not set to CUSTOM.
 *     Setting the preset to CUSTOM doesn't change any of the Balls.
 *   - If the user manipulates any of the two Balls, the preset is set to CUSTOM.
 *
 * @author Brandon Li
 */

import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import AssertUtils from '../../../../phetcommon/js/AssertUtils.js';
import collisionLab from '../../collisionLab.js';
import BallState from '../../common/model/BallState.js';
import BallSystem from '../../common/model/BallSystem.js';
import InelasticPlayArea from './InelasticPlayArea.js';
import InelasticPreset from './InelasticPreset.js';

// constants
const NUMBER_OF_BALLS = 2;
const INELASTIC_INITIAL_BALL_STATES = [new BallState(new Vector2(-1.0, 0.000), new Vector2(1.00, 0.300), 0.50), new BallState(new Vector2(0.00, 0.500), new Vector2(-0.5, -0.50), 1.50)];
class InelasticBallSystem extends BallSystem {
  /**
   * @param {InelasticPlayArea} playArea
   * @param {Property.<number>} elapsedTimeProperty
   * @param {Property.<boolean>} isPlayingProperty
   * @param {Object} [options]
   */
  constructor(playArea, elapsedTimeProperty, isPlayingProperty, options) {
    assert && assert(playArea instanceof InelasticPlayArea, `invalid playArea: ${playArea}`);
    assert && AssertUtils.assertPropertyOf(elapsedTimeProperty, 'number');
    assert && AssertUtils.assertPropertyOf(isPlayingProperty, 'boolean');
    options = merge({
      numberOfBallsRange: new RangeWithValue(NUMBER_OF_BALLS, NUMBER_OF_BALLS, NUMBER_OF_BALLS),
      pathsVisibleInitially: false
    }, options);
    super(INELASTIC_INITIAL_BALL_STATES, playArea, options);

    // Verify that the configuration of Balls conforms to the invariants for the Inelastic screen, but bury behind
    // assert so it doesn't impact production performance.
    if (assert) {
      // Verify that the correct number of BallStates were provided.
      assert(INELASTIC_INITIAL_BALL_STATES.length === NUMBER_OF_BALLS);

      // Verify that there is a fixed number of Balls in the 'InelasticBallSystem' screen.
      this.numberOfBallsProperty.link(numberOfBalls => assert(numberOfBalls === NUMBER_OF_BALLS));

      // Verify that the position of BallStates were inside the PlayArea's bounds.
      assert(INELASTIC_INITIAL_BALL_STATES.every(ballState => playArea.bounds.containsPoint(ballState.position)));
    }

    // @public {Property.<InelasticPreset>} - the current InelasticPreset.
    this.inelasticPresetProperty = new EnumerationDeprecatedProperty(InelasticPreset, InelasticPreset.CUSTOM);

    //----------------------------------------------------------------------------------------

    let wasSetToCustomAutomatically = false;

    // Observe when the user manipulates any of the two Balls and set the InelasticPreset to CUSTOM. Link is never
    // removed since InelasticBallSystems are never disposed.
    this.ballSystemUserControlledProperty.link(ballSystemUserControlled => {
      if (ballSystemUserControlled && this.inelasticPresetProperty.value !== InelasticPreset.CUSTOM) {
        wasSetToCustomAutomatically = true;
        this.inelasticPresetProperty.value = InelasticPreset.CUSTOM;
        wasSetToCustomAutomatically = false;
      }
    });

    // Observe when the InelasticPreset changes to do the functionality described at the top of the file. Link is never
    // removed since InelasticBallSystems are never disposed.
    this.inelasticPresetProperty.link(inelasticPreset => {
      if (!wasSetToCustomAutomatically) {
        // Pause the sim.
        isPlayingProperty.value = false;
      }

      // Set the elapsed time to 0.
      elapsedTimeProperty.reset();

      // Set every Ball's position, mass, and velocity to the InelasticPreset's BallStates.
      inelasticPreset.setBalls(this.balls);
    });
  }

  /**
   * Resets the InelasticBallSystem.
   * @public
   *
   * Called when the reset-all button is pressed.
   */
  reset() {
    super.reset();
    this.inelasticPresetProperty.reset();
  }

  /**
   * Computes the angular momentum of the entire BallSystem, relative to the center-of-mass, using the L = r x p formula
   * described in https://en.wikipedia.org/wiki/Angular_momentum#Discussion.
   * @public
   *
   * @returns {number} - in kg*(m^2/s).
   */
  getTotalAngularMomentum() {
    let totalAngularMomentum = 0;
    this.balls.forEach(ball => {
      // Get the position vector (r) and momentum (p) relative to the center-of-mass
      const r = ball.positionProperty.value.minus(this.centerOfMass.positionProperty.value);
      const p = ball.velocityProperty.value.minus(this.centerOfMass.velocityProperty.value).multiplyScalar(ball.massProperty.value);

      // L = r x p (relative to the center-of-mass)
      totalAngularMomentum += r.crossScalar(p);
    });
    return totalAngularMomentum;
  }
}
collisionLab.register('InelasticBallSystem', InelasticBallSystem);
export default InelasticBallSystem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIlJhbmdlV2l0aFZhbHVlIiwiVmVjdG9yMiIsIm1lcmdlIiwiQXNzZXJ0VXRpbHMiLCJjb2xsaXNpb25MYWIiLCJCYWxsU3RhdGUiLCJCYWxsU3lzdGVtIiwiSW5lbGFzdGljUGxheUFyZWEiLCJJbmVsYXN0aWNQcmVzZXQiLCJOVU1CRVJfT0ZfQkFMTFMiLCJJTkVMQVNUSUNfSU5JVElBTF9CQUxMX1NUQVRFUyIsIkluZWxhc3RpY0JhbGxTeXN0ZW0iLCJjb25zdHJ1Y3RvciIsInBsYXlBcmVhIiwiZWxhcHNlZFRpbWVQcm9wZXJ0eSIsImlzUGxheWluZ1Byb3BlcnR5Iiwib3B0aW9ucyIsImFzc2VydCIsImFzc2VydFByb3BlcnR5T2YiLCJudW1iZXJPZkJhbGxzUmFuZ2UiLCJwYXRoc1Zpc2libGVJbml0aWFsbHkiLCJsZW5ndGgiLCJudW1iZXJPZkJhbGxzUHJvcGVydHkiLCJsaW5rIiwibnVtYmVyT2ZCYWxscyIsImV2ZXJ5IiwiYmFsbFN0YXRlIiwiYm91bmRzIiwiY29udGFpbnNQb2ludCIsInBvc2l0aW9uIiwiaW5lbGFzdGljUHJlc2V0UHJvcGVydHkiLCJDVVNUT00iLCJ3YXNTZXRUb0N1c3RvbUF1dG9tYXRpY2FsbHkiLCJiYWxsU3lzdGVtVXNlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImJhbGxTeXN0ZW1Vc2VyQ29udHJvbGxlZCIsInZhbHVlIiwiaW5lbGFzdGljUHJlc2V0IiwicmVzZXQiLCJzZXRCYWxscyIsImJhbGxzIiwiZ2V0VG90YWxBbmd1bGFyTW9tZW50dW0iLCJ0b3RhbEFuZ3VsYXJNb21lbnR1bSIsImZvckVhY2giLCJiYWxsIiwiciIsInBvc2l0aW9uUHJvcGVydHkiLCJtaW51cyIsImNlbnRlck9mTWFzcyIsInAiLCJ2ZWxvY2l0eVByb3BlcnR5IiwibXVsdGlwbHlTY2FsYXIiLCJtYXNzUHJvcGVydHkiLCJjcm9zc1NjYWxhciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW5lbGFzdGljQmFsbFN5c3RlbS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbmVsYXN0aWNCYWxsU3lzdGVtIGlzIGEgQmFsbFN5c3RlbSBzdWItdHlwZSBmb3IgdGhlICdJbmVsYXN0aWMnIHNjcmVlbi4gSW5lbGFzdGljQmFsbFN5c3RlbXMgb25seSBoYXZlIDIgZml4ZWQgQmFsbHNcclxuICogYW5kIHRoZSBudW1iZXJPZkJhbGxzUHJvcGVydHkgY2Fubm90IGJlIG11dGF0ZWQuXHJcbiAqXHJcbiAqIEluIHRoZSAnSW5lbGFzdGljJyBzY3JlZW4sIHRoZXJlIGFyZSBkaWZmZXJlbnQgJ3ByZXNldHMnIG9mIEJhbGxzLiBXaGVuIHRoZSB1c2VyIGNoYW5nZXMgYSB0aGUgcHJlc2V0LFxyXG4gKiBJbmVsYXN0aWNCYWxsU3lzdGVtIHdpbGwgZG8gdGhlIGZvbGxvd2luZzpcclxuICogICAtIFBhdXNlIHRoZSBzaW0uXHJcbiAqICAgLSBTZXQgdGhlIGVsYXBzZWQgdGltZSB0byAwLlxyXG4gKiAgIC0gU2V0IGV2ZXJ5IEJhbGwncyBwb3NpdGlvbiwgbWFzcywgYW5kIHZlbG9jaXR5IHRvIHRoZSBwcmVzZXQncyBCYWxsU3RhdGVzLCBpZiB0aGUgcHJlc2V0IGlzIG5vdCBzZXQgdG8gQ1VTVE9NLlxyXG4gKiAgICAgU2V0dGluZyB0aGUgcHJlc2V0IHRvIENVU1RPTSBkb2Vzbid0IGNoYW5nZSBhbnkgb2YgdGhlIEJhbGxzLlxyXG4gKiAgIC0gSWYgdGhlIHVzZXIgbWFuaXB1bGF0ZXMgYW55IG9mIHRoZSB0d28gQmFsbHMsIHRoZSBwcmVzZXQgaXMgc2V0IHRvIENVU1RPTS5cclxuICpcclxuICogQGF1dGhvciBCcmFuZG9uIExpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2VXaXRoVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlV2l0aFZhbHVlLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEFzc2VydFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvQXNzZXJ0VXRpbHMuanMnO1xyXG5pbXBvcnQgY29sbGlzaW9uTGFiIGZyb20gJy4uLy4uL2NvbGxpc2lvbkxhYi5qcyc7XHJcbmltcG9ydCBCYWxsU3RhdGUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0JhbGxTdGF0ZS5qcyc7XHJcbmltcG9ydCBCYWxsU3lzdGVtIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CYWxsU3lzdGVtLmpzJztcclxuaW1wb3J0IEluZWxhc3RpY1BsYXlBcmVhIGZyb20gJy4vSW5lbGFzdGljUGxheUFyZWEuanMnO1xyXG5pbXBvcnQgSW5lbGFzdGljUHJlc2V0IGZyb20gJy4vSW5lbGFzdGljUHJlc2V0LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVU1CRVJfT0ZfQkFMTFMgPSAyO1xyXG5jb25zdCBJTkVMQVNUSUNfSU5JVElBTF9CQUxMX1NUQVRFUyA9IFtcclxuICBuZXcgQmFsbFN0YXRlKCBuZXcgVmVjdG9yMiggLTEuMCwgMC4wMDAgKSwgbmV3IFZlY3RvcjIoIDEuMDAsIDAuMzAwICksIDAuNTAgKSxcclxuICBuZXcgQmFsbFN0YXRlKCBuZXcgVmVjdG9yMiggMC4wMCwgMC41MDAgKSwgbmV3IFZlY3RvcjIoIC0wLjUsIC0wLjUwICksIDEuNTAgKVxyXG5dO1xyXG5cclxuY2xhc3MgSW5lbGFzdGljQmFsbFN5c3RlbSBleHRlbmRzIEJhbGxTeXN0ZW0ge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0luZWxhc3RpY1BsYXlBcmVhfSBwbGF5QXJlYVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IGVsYXBzZWRUaW1lUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gaXNQbGF5aW5nUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHBsYXlBcmVhLCBlbGFwc2VkVGltZVByb3BlcnR5LCBpc1BsYXlpbmdQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBsYXlBcmVhIGluc3RhbmNlb2YgSW5lbGFzdGljUGxheUFyZWEsIGBpbnZhbGlkIHBsYXlBcmVhOiAke3BsYXlBcmVhfWAgKTtcclxuICAgIGFzc2VydCAmJiBBc3NlcnRVdGlscy5hc3NlcnRQcm9wZXJ0eU9mKCBlbGFwc2VkVGltZVByb3BlcnR5LCAnbnVtYmVyJyApO1xyXG4gICAgYXNzZXJ0ICYmIEFzc2VydFV0aWxzLmFzc2VydFByb3BlcnR5T2YoIGlzUGxheWluZ1Byb3BlcnR5LCAnYm9vbGVhbicgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIG51bWJlck9mQmFsbHNSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKCBOVU1CRVJfT0ZfQkFMTFMsIE5VTUJFUl9PRl9CQUxMUywgTlVNQkVSX09GX0JBTExTICksXHJcbiAgICAgIHBhdGhzVmlzaWJsZUluaXRpYWxseTogZmFsc2VcclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIElORUxBU1RJQ19JTklUSUFMX0JBTExfU1RBVEVTLCBwbGF5QXJlYSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBjb25maWd1cmF0aW9uIG9mIEJhbGxzIGNvbmZvcm1zIHRvIHRoZSBpbnZhcmlhbnRzIGZvciB0aGUgSW5lbGFzdGljIHNjcmVlbiwgYnV0IGJ1cnkgYmVoaW5kXHJcbiAgICAvLyBhc3NlcnQgc28gaXQgZG9lc24ndCBpbXBhY3QgcHJvZHVjdGlvbiBwZXJmb3JtYW5jZS5cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG5cclxuICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIEJhbGxTdGF0ZXMgd2VyZSBwcm92aWRlZC5cclxuICAgICAgYXNzZXJ0KCBJTkVMQVNUSUNfSU5JVElBTF9CQUxMX1NUQVRFUy5sZW5ndGggPT09IE5VTUJFUl9PRl9CQUxMUyApO1xyXG5cclxuICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlcmUgaXMgYSBmaXhlZCBudW1iZXIgb2YgQmFsbHMgaW4gdGhlICdJbmVsYXN0aWNCYWxsU3lzdGVtJyBzY3JlZW4uXHJcbiAgICAgIHRoaXMubnVtYmVyT2ZCYWxsc1Byb3BlcnR5LmxpbmsoIG51bWJlck9mQmFsbHMgPT4gYXNzZXJ0KCBudW1iZXJPZkJhbGxzID09PSBOVU1CRVJfT0ZfQkFMTFMgKSApO1xyXG5cclxuICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHBvc2l0aW9uIG9mIEJhbGxTdGF0ZXMgd2VyZSBpbnNpZGUgdGhlIFBsYXlBcmVhJ3MgYm91bmRzLlxyXG4gICAgICBhc3NlcnQoIElORUxBU1RJQ19JTklUSUFMX0JBTExfU1RBVEVTLmV2ZXJ5KCBiYWxsU3RhdGUgPT4gcGxheUFyZWEuYm91bmRzLmNvbnRhaW5zUG9pbnQoIGJhbGxTdGF0ZS5wb3NpdGlvbiApICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48SW5lbGFzdGljUHJlc2V0Pn0gLSB0aGUgY3VycmVudCBJbmVsYXN0aWNQcmVzZXQuXHJcbiAgICB0aGlzLmluZWxhc3RpY1ByZXNldFByb3BlcnR5ID0gbmV3IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5KCBJbmVsYXN0aWNQcmVzZXQsIEluZWxhc3RpY1ByZXNldC5DVVNUT00gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBsZXQgd2FzU2V0VG9DdXN0b21BdXRvbWF0aWNhbGx5ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gT2JzZXJ2ZSB3aGVuIHRoZSB1c2VyIG1hbmlwdWxhdGVzIGFueSBvZiB0aGUgdHdvIEJhbGxzIGFuZCBzZXQgdGhlIEluZWxhc3RpY1ByZXNldCB0byBDVVNUT00uIExpbmsgaXMgbmV2ZXJcclxuICAgIC8vIHJlbW92ZWQgc2luY2UgSW5lbGFzdGljQmFsbFN5c3RlbXMgYXJlIG5ldmVyIGRpc3Bvc2VkLlxyXG4gICAgdGhpcy5iYWxsU3lzdGVtVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCBiYWxsU3lzdGVtVXNlckNvbnRyb2xsZWQgPT4ge1xyXG4gICAgICBpZiAoIGJhbGxTeXN0ZW1Vc2VyQ29udHJvbGxlZCAmJiB0aGlzLmluZWxhc3RpY1ByZXNldFByb3BlcnR5LnZhbHVlICE9PSBJbmVsYXN0aWNQcmVzZXQuQ1VTVE9NICkge1xyXG4gICAgICAgIHdhc1NldFRvQ3VzdG9tQXV0b21hdGljYWxseSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbmVsYXN0aWNQcmVzZXRQcm9wZXJ0eS52YWx1ZSA9IEluZWxhc3RpY1ByZXNldC5DVVNUT007XHJcbiAgICAgICAgd2FzU2V0VG9DdXN0b21BdXRvbWF0aWNhbGx5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIHdoZW4gdGhlIEluZWxhc3RpY1ByZXNldCBjaGFuZ2VzIHRvIGRvIHRoZSBmdW5jdGlvbmFsaXR5IGRlc2NyaWJlZCBhdCB0aGUgdG9wIG9mIHRoZSBmaWxlLiBMaW5rIGlzIG5ldmVyXHJcbiAgICAvLyByZW1vdmVkIHNpbmNlIEluZWxhc3RpY0JhbGxTeXN0ZW1zIGFyZSBuZXZlciBkaXNwb3NlZC5cclxuICAgIHRoaXMuaW5lbGFzdGljUHJlc2V0UHJvcGVydHkubGluayggaW5lbGFzdGljUHJlc2V0ID0+IHtcclxuXHJcbiAgICAgIGlmICggIXdhc1NldFRvQ3VzdG9tQXV0b21hdGljYWxseSApIHtcclxuICAgICAgICAvLyBQYXVzZSB0aGUgc2ltLlxyXG4gICAgICAgIGlzUGxheWluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNldCB0aGUgZWxhcHNlZCB0aW1lIHRvIDAuXHJcbiAgICAgIGVsYXBzZWRUaW1lUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAgIC8vIFNldCBldmVyeSBCYWxsJ3MgcG9zaXRpb24sIG1hc3MsIGFuZCB2ZWxvY2l0eSB0byB0aGUgSW5lbGFzdGljUHJlc2V0J3MgQmFsbFN0YXRlcy5cclxuICAgICAgaW5lbGFzdGljUHJlc2V0LnNldEJhbGxzKCB0aGlzLmJhbGxzICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhlIEluZWxhc3RpY0JhbGxTeXN0ZW0uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqXHJcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHJlc2V0LWFsbCBidXR0b24gaXMgcHJlc3NlZC5cclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgICB0aGlzLmluZWxhc3RpY1ByZXNldFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb21wdXRlcyB0aGUgYW5ndWxhciBtb21lbnR1bSBvZiB0aGUgZW50aXJlIEJhbGxTeXN0ZW0sIHJlbGF0aXZlIHRvIHRoZSBjZW50ZXItb2YtbWFzcywgdXNpbmcgdGhlIEwgPSByIHggcCBmb3JtdWxhXHJcbiAgICogZGVzY3JpYmVkIGluIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FuZ3VsYXJfbW9tZW50dW0jRGlzY3Vzc2lvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAtIGluIGtnKihtXjIvcykuXHJcbiAgICovXHJcbiAgZ2V0VG90YWxBbmd1bGFyTW9tZW50dW0oKSB7XHJcbiAgICBsZXQgdG90YWxBbmd1bGFyTW9tZW50dW0gPSAwO1xyXG5cclxuICAgIHRoaXMuYmFsbHMuZm9yRWFjaCggYmFsbCA9PiB7XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIHBvc2l0aW9uIHZlY3RvciAocikgYW5kIG1vbWVudHVtIChwKSByZWxhdGl2ZSB0byB0aGUgY2VudGVyLW9mLW1hc3NcclxuICAgICAgY29uc3QgciA9IGJhbGwucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggdGhpcy5jZW50ZXJPZk1hc3MucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICBjb25zdCBwID0gYmFsbC52ZWxvY2l0eVByb3BlcnR5LnZhbHVlLm1pbnVzKCB0aGlzLmNlbnRlck9mTWFzcy52ZWxvY2l0eVByb3BlcnR5LnZhbHVlICkubXVsdGlwbHlTY2FsYXIoIGJhbGwubWFzc1Byb3BlcnR5LnZhbHVlICk7XHJcblxyXG4gICAgICAvLyBMID0gciB4IHAgKHJlbGF0aXZlIHRvIHRoZSBjZW50ZXItb2YtbWFzcylcclxuICAgICAgdG90YWxBbmd1bGFyTW9tZW50dW0gKz0gci5jcm9zc1NjYWxhciggcCApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIHRvdGFsQW5ndWxhck1vbWVudHVtO1xyXG4gIH1cclxufVxyXG5cclxuY29sbGlzaW9uTGFiLnJlZ2lzdGVyKCAnSW5lbGFzdGljQmFsbFN5c3RlbScsIEluZWxhc3RpY0JhbGxTeXN0ZW0gKTtcclxuZXhwb3J0IGRlZmF1bHQgSW5lbGFzdGljQmFsbFN5c3RlbTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FB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