// Copyright 2017-2023, University of Colorado Boulder

/**
 * A scene in the 'Mystery' screen in 'Function Builder: Basics'.
 * This Mystery screen deals with Pattern (image) cards and functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import beaker_png from '../../../../function-builder/images/cards/beaker_png.js';
import butterfly_png from '../../../../function-builder/images/cards/butterfly_png.js';
import cherries_png from '../../../../function-builder/images/cards/cherries_png.js';
import circle_png from '../../../../function-builder/images/cards/circle_png.js';
import feet_png from '../../../../function-builder/images/cards/feet_png.js';
import planet_png from '../../../../function-builder/images/cards/planet_png.js';
import rectangle_png from '../../../../function-builder/images/cards/rectangle_png.js';
import snowflake_png from '../../../../function-builder/images/cards/snowflake_png.js';
import star_png from '../../../../function-builder/images/cards/star_png.js';
import stickFigure_png from '../../../../function-builder/images/cards/stickFigure_png.js';
import sun_png from '../../../../function-builder/images/cards/sun_png.js';
import triangle_png from '../../../../function-builder/images/cards/triangle_png.js';
import FBConstants from '../../../../function-builder/js/common/FBConstants.js';
import FBQueryParameters from '../../../../function-builder/js/common/FBQueryParameters.js';
import Builder from '../../../../function-builder/js/common/model/builder/Builder.js';
import FunctionCreator from '../../../../function-builder/js/common/model/functions/FunctionCreator.js';
import Scene from '../../../../function-builder/js/common/model/Scene.js';
import FBIconFactory from '../../../../function-builder/js/common/view/FBIconFactory.js'; // eslint-disable-line no-view-imported-from-model
import MysteryChallenges from '../../../../function-builder/js/mystery/model/MysteryChallenges.js';
import Erase from '../../../../function-builder/js/patterns/model/functions/Erase.js';
import Grayscale from '../../../../function-builder/js/patterns/model/functions/Grayscale.js';
import Identity from '../../../../function-builder/js/patterns/model/functions/Identity.js';
import InvertRGB from '../../../../function-builder/js/patterns/model/functions/InvertRGB.js';
import Mirror from '../../../../function-builder/js/patterns/model/functions/Mirror.js';
import Rotate180 from '../../../../function-builder/js/patterns/model/functions/Rotate180.js';
import Rotate90 from '../../../../function-builder/js/patterns/model/functions/Rotate90.js';
import Shrink from '../../../../function-builder/js/patterns/model/functions/Shrink.js';
import Warhol from '../../../../function-builder/js/patterns/model/functions/Warhol.js';
import merge from '../../../../phet-core/js/merge.js';
import functionBuilderBasics from '../../functionBuilderBasics.js';
class FBBMysteryScene extends Scene {
  /**
   * @param {ImageFunction[][]} challengePool
   * @param {Object} [options]
   */
  constructor(challengePool, options) {
    options = merge({
      numberOfSlots: 1,
      numberOfEachCard: 1
    }, options);

    // {Node} scene selection icon
    assert && assert(!options.iconNode);
    options.iconNode = FBIconFactory.createSceneIcon(options.numberOfSlots);

    // Create enough instances of each function type to support the case where all functions
    // in a challenge have the same type.
    assert && assert(!options.numberOfEachFunction);
    options.numberOfEachFunction = options.numberOfSlots;

    // validate the challenge pool
    if (assert) {
      // limit scope of for-loop var using IIFE
      (() => {
        for (let i = 0; i < challengePool.length; i++) {
          const challenge = challengePool[i]; // {ImageFunction[]}

          // validate challenge
          assert && assert(challenge.length === options.numberOfSlots, `incorrect number of functions in challenge: ${challenge}`);
        }
      })();
    }

    // {HTMLImageElement[]} images for the input cards, in the order that they appear in the carousel
    const cardContent = [feet_png, snowflake_png, butterfly_png, stickFigure_png, planet_png, sun_png, beaker_png, cherries_png, rectangle_png, circle_png, triangle_png, star_png];

    // {FunctionCreator[]} function creators, in the order that functions appear in the carousel.
    const functionCreators = [new FunctionCreator(Mirror), new FunctionCreator(Rotate90), new FunctionCreator(Grayscale), new FunctionCreator(Rotate180), new FunctionCreator(Identity), new FunctionCreator(InvertRGB), new FunctionCreator(Erase), new FunctionCreator(Shrink), new FunctionCreator(Warhol)];
    const builderWidth = Scene.computeBuilderWidth(options.numberOfSlots);
    const builderX = FBConstants.SCREEN_VIEW_LAYOUT_BOUNDS.width / 2 - builderWidth / 2;
    const builder = new Builder({
      numberOfSlots: options.numberOfSlots,
      width: builderWidth,
      position: new Vector2(builderX, FBConstants.BUILDER_Y)
    });
    super(cardContent, functionCreators, builder, options);

    // @private
    this.numberOfSlots = options.numberOfSlots;

    // @public the challenge that is displayed
    this.challengeProperty = new Property(challengePool[MysteryChallenges.DEFAULT_CHALLENGE_INDEX]);
    this.challengePool = challengePool; // (read-only) for debug only, the original challenge pool, do not modify!

    // @private
    this.availableChallenges = challengePool.slice(0); // available challenges
    this.availableChallenges.splice(MysteryChallenges.DEFAULT_CHALLENGE_INDEX, 1); // remove the default challenge
  }

  /**
   * Resets the scene.
   * Resets the challenge to its initial value, restocks the challenge pool.
   *
   * @public
   * @override
   */
  reset() {
    super.reset();

    // force notification when initial challenge is displayed
    if (this.challengeProperty.get() === this.challengeProperty.initialValue) {
      this.challengeProperty.notifyListenersStatic();
    } else {
      this.challengeProperty.reset();
    }

    // restock the available challenges, with default challenge removed
    this.availableChallenges = this.challengePool.slice(0);
    this.availableChallenges.splice(MysteryChallenges.DEFAULT_CHALLENGE_INDEX, 1);
  }

  /**
   * Advances to the next randomly-selected challenge.  After a challenge has been selected, it is not selected
   * again until all challenges in the pool have been selected.
   *
   * @public
   */
  nextChallenge() {
    // available pool is empty
    if (this.availableChallenges.length === 0) {
      // restock the pool
      this.availableChallenges = this.challengePool.slice(0);

      // remove the current challenge, so we don't select it twice in a row
      if (!FBQueryParameters.playAll) {
        const currentChallengeIndex = this.availableChallenges.indexOf(this.challengeProperty.get());
        this.availableChallenges.splice(currentChallengeIndex, 1);
        assert && assert(this.availableChallenges.length === this.challengePool.length - 1);
      }
    }

    // randomly select a challenge from the available pool
    const challengeIndex = FBQueryParameters.playAll ? 0 : dotRandom.nextInt(this.availableChallenges.length);
    assert && assert(challengeIndex >= 0 && challengeIndex < this.availableChallenges.length);
    const challenge = this.availableChallenges[challengeIndex];

    // remove the challenge from the available pool
    this.availableChallenges.splice(challengeIndex, 1);
    this.challengeProperty.set(challenge);
  }
}
functionBuilderBasics.register('FBBMysteryScene', FBBMysteryScene);
export default FBBMysteryScene;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlZlY3RvcjIiLCJiZWFrZXJfcG5nIiwiYnV0dGVyZmx5X3BuZyIsImNoZXJyaWVzX3BuZyIsImNpcmNsZV9wbmciLCJmZWV0X3BuZyIsInBsYW5ldF9wbmciLCJyZWN0YW5nbGVfcG5nIiwic25vd2ZsYWtlX3BuZyIsInN0YXJfcG5nIiwic3RpY2tGaWd1cmVfcG5nIiwic3VuX3BuZyIsInRyaWFuZ2xlX3BuZyIsIkZCQ29uc3RhbnRzIiwiRkJRdWVyeVBhcmFtZXRlcnMiLCJCdWlsZGVyIiwiRnVuY3Rpb25DcmVhdG9yIiwiU2NlbmUiLCJGQkljb25GYWN0b3J5IiwiTXlzdGVyeUNoYWxsZW5nZXMiLCJFcmFzZSIsIkdyYXlzY2FsZSIsIklkZW50aXR5IiwiSW52ZXJ0UkdCIiwiTWlycm9yIiwiUm90YXRlMTgwIiwiUm90YXRlOTAiLCJTaHJpbmsiLCJXYXJob2wiLCJtZXJnZSIsImZ1bmN0aW9uQnVpbGRlckJhc2ljcyIsIkZCQk15c3RlcnlTY2VuZSIsImNvbnN0cnVjdG9yIiwiY2hhbGxlbmdlUG9vbCIsIm9wdGlvbnMiLCJudW1iZXJPZlNsb3RzIiwibnVtYmVyT2ZFYWNoQ2FyZCIsImFzc2VydCIsImljb25Ob2RlIiwiY3JlYXRlU2NlbmVJY29uIiwibnVtYmVyT2ZFYWNoRnVuY3Rpb24iLCJpIiwibGVuZ3RoIiwiY2hhbGxlbmdlIiwiY2FyZENvbnRlbnQiLCJmdW5jdGlvbkNyZWF0b3JzIiwiYnVpbGRlcldpZHRoIiwiY29tcHV0ZUJ1aWxkZXJXaWR0aCIsImJ1aWxkZXJYIiwiU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUyIsIndpZHRoIiwiYnVpbGRlciIsInBvc2l0aW9uIiwiQlVJTERFUl9ZIiwiY2hhbGxlbmdlUHJvcGVydHkiLCJERUZBVUxUX0NIQUxMRU5HRV9JTkRFWCIsImF2YWlsYWJsZUNoYWxsZW5nZXMiLCJzbGljZSIsInNwbGljZSIsInJlc2V0IiwiZ2V0IiwiaW5pdGlhbFZhbHVlIiwibm90aWZ5TGlzdGVuZXJzU3RhdGljIiwibmV4dENoYWxsZW5nZSIsInBsYXlBbGwiLCJjdXJyZW50Q2hhbGxlbmdlSW5kZXgiLCJpbmRleE9mIiwiY2hhbGxlbmdlSW5kZXgiLCJuZXh0SW50Iiwic2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGQkJNeXN0ZXJ5U2NlbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzY2VuZSBpbiB0aGUgJ015c3RlcnknIHNjcmVlbiBpbiAnRnVuY3Rpb24gQnVpbGRlcjogQmFzaWNzJy5cclxuICogVGhpcyBNeXN0ZXJ5IHNjcmVlbiBkZWFscyB3aXRoIFBhdHRlcm4gKGltYWdlKSBjYXJkcyBhbmQgZnVuY3Rpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgYmVha2VyX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2ltYWdlcy9jYXJkcy9iZWFrZXJfcG5nLmpzJztcclxuaW1wb3J0IGJ1dHRlcmZseV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvYnV0dGVyZmx5X3BuZy5qcyc7XHJcbmltcG9ydCBjaGVycmllc19wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvY2hlcnJpZXNfcG5nLmpzJztcclxuaW1wb3J0IGNpcmNsZV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvY2lyY2xlX3BuZy5qcyc7XHJcbmltcG9ydCBmZWV0X3BuZyBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2ltYWdlcy9jYXJkcy9mZWV0X3BuZy5qcyc7XHJcbmltcG9ydCBwbGFuZXRfcG5nIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvaW1hZ2VzL2NhcmRzL3BsYW5ldF9wbmcuanMnO1xyXG5pbXBvcnQgcmVjdGFuZ2xlX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2ltYWdlcy9jYXJkcy9yZWN0YW5nbGVfcG5nLmpzJztcclxuaW1wb3J0IHNub3dmbGFrZV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvc25vd2ZsYWtlX3BuZy5qcyc7XHJcbmltcG9ydCBzdGFyX3BuZyBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2ltYWdlcy9jYXJkcy9zdGFyX3BuZy5qcyc7XHJcbmltcG9ydCBzdGlja0ZpZ3VyZV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvc3RpY2tGaWd1cmVfcG5nLmpzJztcclxuaW1wb3J0IHN1bl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvc3VuX3BuZy5qcyc7XHJcbmltcG9ydCB0cmlhbmdsZV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9pbWFnZXMvY2FyZHMvdHJpYW5nbGVfcG5nLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvY29tbW9uL0ZCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZCUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvY29tbW9uL0ZCUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJ1aWxkZXIgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9qcy9jb21tb24vbW9kZWwvYnVpbGRlci9CdWlsZGVyLmpzJztcclxuaW1wb3J0IEZ1bmN0aW9uQ3JlYXRvciBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL2NvbW1vbi9tb2RlbC9mdW5jdGlvbnMvRnVuY3Rpb25DcmVhdG9yLmpzJztcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvY29tbW9uL21vZGVsL1NjZW5lLmpzJztcclxuaW1wb3J0IEZCSWNvbkZhY3RvcnkgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9qcy9jb21tb24vdmlldy9GQkljb25GYWN0b3J5LmpzJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12aWV3LWltcG9ydGVkLWZyb20tbW9kZWxcclxuaW1wb3J0IE15c3RlcnlDaGFsbGVuZ2VzIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvbXlzdGVyeS9tb2RlbC9NeXN0ZXJ5Q2hhbGxlbmdlcy5qcyc7XHJcbmltcG9ydCBFcmFzZSBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL3BhdHRlcm5zL21vZGVsL2Z1bmN0aW9ucy9FcmFzZS5qcyc7XHJcbmltcG9ydCBHcmF5c2NhbGUgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9qcy9wYXR0ZXJucy9tb2RlbC9mdW5jdGlvbnMvR3JheXNjYWxlLmpzJztcclxuaW1wb3J0IElkZW50aXR5IGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvcGF0dGVybnMvbW9kZWwvZnVuY3Rpb25zL0lkZW50aXR5LmpzJztcclxuaW1wb3J0IEludmVydFJHQiBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL3BhdHRlcm5zL21vZGVsL2Z1bmN0aW9ucy9JbnZlcnRSR0IuanMnO1xyXG5pbXBvcnQgTWlycm9yIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvcGF0dGVybnMvbW9kZWwvZnVuY3Rpb25zL01pcnJvci5qcyc7XHJcbmltcG9ydCBSb3RhdGUxODAgZnJvbSAnLi4vLi4vLi4vLi4vZnVuY3Rpb24tYnVpbGRlci9qcy9wYXR0ZXJucy9tb2RlbC9mdW5jdGlvbnMvUm90YXRlMTgwLmpzJztcclxuaW1wb3J0IFJvdGF0ZTkwIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvcGF0dGVybnMvbW9kZWwvZnVuY3Rpb25zL1JvdGF0ZTkwLmpzJztcclxuaW1wb3J0IFNocmluayBmcm9tICcuLi8uLi8uLi8uLi9mdW5jdGlvbi1idWlsZGVyL2pzL3BhdHRlcm5zL21vZGVsL2Z1bmN0aW9ucy9TaHJpbmsuanMnO1xyXG5pbXBvcnQgV2FyaG9sIGZyb20gJy4uLy4uLy4uLy4uL2Z1bmN0aW9uLWJ1aWxkZXIvanMvcGF0dGVybnMvbW9kZWwvZnVuY3Rpb25zL1dhcmhvbC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyQmFzaWNzIGZyb20gJy4uLy4uL2Z1bmN0aW9uQnVpbGRlckJhc2ljcy5qcyc7XHJcblxyXG5jbGFzcyBGQkJNeXN0ZXJ5U2NlbmUgZXh0ZW5kcyBTY2VuZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7SW1hZ2VGdW5jdGlvbltdW119IGNoYWxsZW5nZVBvb2xcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNoYWxsZW5nZVBvb2wsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG51bWJlck9mU2xvdHM6IDEsXHJcbiAgICAgIG51bWJlck9mRWFjaENhcmQ6IDFcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB7Tm9kZX0gc2NlbmUgc2VsZWN0aW9uIGljb25cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmljb25Ob2RlICk7XHJcbiAgICBvcHRpb25zLmljb25Ob2RlID0gRkJJY29uRmFjdG9yeS5jcmVhdGVTY2VuZUljb24oIG9wdGlvbnMubnVtYmVyT2ZTbG90cyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBlbm91Z2ggaW5zdGFuY2VzIG9mIGVhY2ggZnVuY3Rpb24gdHlwZSB0byBzdXBwb3J0IHRoZSBjYXNlIHdoZXJlIGFsbCBmdW5jdGlvbnNcclxuICAgIC8vIGluIGEgY2hhbGxlbmdlIGhhdmUgdGhlIHNhbWUgdHlwZS5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLm51bWJlck9mRWFjaEZ1bmN0aW9uICk7XHJcbiAgICBvcHRpb25zLm51bWJlck9mRWFjaEZ1bmN0aW9uID0gb3B0aW9ucy5udW1iZXJPZlNsb3RzO1xyXG5cclxuICAgIC8vIHZhbGlkYXRlIHRoZSBjaGFsbGVuZ2UgcG9vbFxyXG4gICAgaWYgKCBhc3NlcnQgKSB7XHJcblxyXG4gICAgICAvLyBsaW1pdCBzY29wZSBvZiBmb3ItbG9vcCB2YXIgdXNpbmcgSUlGRVxyXG4gICAgICAoICgpID0+IHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBjaGFsbGVuZ2VQb29sLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IGNoYWxsZW5nZSA9IGNoYWxsZW5nZVBvb2xbIGkgXTsgLy8ge0ltYWdlRnVuY3Rpb25bXX1cclxuXHJcbiAgICAgICAgICAvLyB2YWxpZGF0ZSBjaGFsbGVuZ2VcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoYWxsZW5nZS5sZW5ndGggPT09IG9wdGlvbnMubnVtYmVyT2ZTbG90cyxcclxuICAgICAgICAgICAgYGluY29ycmVjdCBudW1iZXIgb2YgZnVuY3Rpb25zIGluIGNoYWxsZW5nZTogJHtjaGFsbGVuZ2V9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8ge0hUTUxJbWFnZUVsZW1lbnRbXX0gaW1hZ2VzIGZvciB0aGUgaW5wdXQgY2FyZHMsIGluIHRoZSBvcmRlciB0aGF0IHRoZXkgYXBwZWFyIGluIHRoZSBjYXJvdXNlbFxyXG4gICAgY29uc3QgY2FyZENvbnRlbnQgPSBbXHJcbiAgICAgIGZlZXRfcG5nLFxyXG4gICAgICBzbm93Zmxha2VfcG5nLFxyXG4gICAgICBidXR0ZXJmbHlfcG5nLFxyXG4gICAgICBzdGlja0ZpZ3VyZV9wbmcsXHJcbiAgICAgIHBsYW5ldF9wbmcsXHJcbiAgICAgIHN1bl9wbmcsXHJcbiAgICAgIGJlYWtlcl9wbmcsXHJcbiAgICAgIGNoZXJyaWVzX3BuZyxcclxuICAgICAgcmVjdGFuZ2xlX3BuZyxcclxuICAgICAgY2lyY2xlX3BuZyxcclxuICAgICAgdHJpYW5nbGVfcG5nLFxyXG4gICAgICBzdGFyX3BuZ1xyXG4gICAgXTtcclxuXHJcbiAgICAvLyB7RnVuY3Rpb25DcmVhdG9yW119IGZ1bmN0aW9uIGNyZWF0b3JzLCBpbiB0aGUgb3JkZXIgdGhhdCBmdW5jdGlvbnMgYXBwZWFyIGluIHRoZSBjYXJvdXNlbC5cclxuICAgIGNvbnN0IGZ1bmN0aW9uQ3JlYXRvcnMgPSBbXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIE1pcnJvciApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBSb3RhdGU5MCApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBHcmF5c2NhbGUgKSxcclxuICAgICAgbmV3IEZ1bmN0aW9uQ3JlYXRvciggUm90YXRlMTgwICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIElkZW50aXR5ICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIEludmVydFJHQiApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBFcmFzZSApLFxyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBTaHJpbmsgKSxcclxuICAgICAgbmV3IEZ1bmN0aW9uQ3JlYXRvciggV2FyaG9sIClcclxuICAgIF07XHJcblxyXG4gICAgY29uc3QgYnVpbGRlcldpZHRoID0gU2NlbmUuY29tcHV0ZUJ1aWxkZXJXaWR0aCggb3B0aW9ucy5udW1iZXJPZlNsb3RzICk7XHJcbiAgICBjb25zdCBidWlsZGVyWCA9ICggRkJDb25zdGFudHMuU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUy53aWR0aCAvIDIgKSAtICggYnVpbGRlcldpZHRoIC8gMiApO1xyXG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBCdWlsZGVyKCB7XHJcbiAgICAgIG51bWJlck9mU2xvdHM6IG9wdGlvbnMubnVtYmVyT2ZTbG90cyxcclxuICAgICAgd2lkdGg6IGJ1aWxkZXJXaWR0aCxcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCBidWlsZGVyWCwgRkJDb25zdGFudHMuQlVJTERFUl9ZIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY2FyZENvbnRlbnQsIGZ1bmN0aW9uQ3JlYXRvcnMsIGJ1aWxkZXIsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5udW1iZXJPZlNsb3RzID0gb3B0aW9ucy5udW1iZXJPZlNsb3RzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgdGhlIGNoYWxsZW5nZSB0aGF0IGlzIGRpc3BsYXllZFxyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggY2hhbGxlbmdlUG9vbFsgTXlzdGVyeUNoYWxsZW5nZXMuREVGQVVMVF9DSEFMTEVOR0VfSU5ERVggXSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQb29sID0gY2hhbGxlbmdlUG9vbDsgLy8gKHJlYWQtb25seSkgZm9yIGRlYnVnIG9ubHksIHRoZSBvcmlnaW5hbCBjaGFsbGVuZ2UgcG9vbCwgZG8gbm90IG1vZGlmeSFcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzID0gY2hhbGxlbmdlUG9vbC5zbGljZSggMCApOyAvLyBhdmFpbGFibGUgY2hhbGxlbmdlc1xyXG4gICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLnNwbGljZSggTXlzdGVyeUNoYWxsZW5nZXMuREVGQVVMVF9DSEFMTEVOR0VfSU5ERVgsIDEgKTsgLy8gcmVtb3ZlIHRoZSBkZWZhdWx0IGNoYWxsZW5nZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBzY2VuZS5cclxuICAgKiBSZXNldHMgdGhlIGNoYWxsZW5nZSB0byBpdHMgaW5pdGlhbCB2YWx1ZSwgcmVzdG9ja3MgdGhlIGNoYWxsZW5nZSBwb29sLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuXHJcbiAgICAvLyBmb3JjZSBub3RpZmljYXRpb24gd2hlbiBpbml0aWFsIGNoYWxsZW5nZSBpcyBkaXNwbGF5ZWRcclxuICAgIGlmICggdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKSA9PT0gdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eS5pbml0aWFsVmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvcGVydHkubm90aWZ5TGlzdGVuZXJzU3RhdGljKCk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlc3RvY2sgdGhlIGF2YWlsYWJsZSBjaGFsbGVuZ2VzLCB3aXRoIGRlZmF1bHQgY2hhbGxlbmdlIHJlbW92ZWRcclxuICAgIHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlcyA9IHRoaXMuY2hhbGxlbmdlUG9vbC5zbGljZSggMCApO1xyXG4gICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLnNwbGljZSggTXlzdGVyeUNoYWxsZW5nZXMuREVGQVVMVF9DSEFMTEVOR0VfSU5ERVgsIDEgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkdmFuY2VzIHRvIHRoZSBuZXh0IHJhbmRvbWx5LXNlbGVjdGVkIGNoYWxsZW5nZS4gIEFmdGVyIGEgY2hhbGxlbmdlIGhhcyBiZWVuIHNlbGVjdGVkLCBpdCBpcyBub3Qgc2VsZWN0ZWRcclxuICAgKiBhZ2FpbiB1bnRpbCBhbGwgY2hhbGxlbmdlcyBpbiB0aGUgcG9vbCBoYXZlIGJlZW4gc2VsZWN0ZWQuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbmV4dENoYWxsZW5nZSgpIHtcclxuXHJcbiAgICAvLyBhdmFpbGFibGUgcG9vbCBpcyBlbXB0eVxyXG4gICAgaWYgKCB0aGlzLmF2YWlsYWJsZUNoYWxsZW5nZXMubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgLy8gcmVzdG9jayB0aGUgcG9vbFxyXG4gICAgICB0aGlzLmF2YWlsYWJsZUNoYWxsZW5nZXMgPSB0aGlzLmNoYWxsZW5nZVBvb2wuc2xpY2UoIDAgKTtcclxuXHJcbiAgICAgIC8vIHJlbW92ZSB0aGUgY3VycmVudCBjaGFsbGVuZ2UsIHNvIHdlIGRvbid0IHNlbGVjdCBpdCB0d2ljZSBpbiBhIHJvd1xyXG4gICAgICBpZiAoICFGQlF1ZXJ5UGFyYW1ldGVycy5wbGF5QWxsICkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDaGFsbGVuZ2VJbmRleCA9IHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlcy5pbmRleE9mKCB0aGlzLmNoYWxsZW5nZVByb3BlcnR5LmdldCgpICk7XHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLnNwbGljZSggY3VycmVudENoYWxsZW5nZUluZGV4LCAxICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLmxlbmd0aCA9PT0gdGhpcy5jaGFsbGVuZ2VQb29sLmxlbmd0aCAtIDEgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJhbmRvbWx5IHNlbGVjdCBhIGNoYWxsZW5nZSBmcm9tIHRoZSBhdmFpbGFibGUgcG9vbFxyXG4gICAgY29uc3QgY2hhbGxlbmdlSW5kZXggPSBGQlF1ZXJ5UGFyYW1ldGVycy5wbGF5QWxsID8gMCA6IGRvdFJhbmRvbS5uZXh0SW50KCB0aGlzLmF2YWlsYWJsZUNoYWxsZW5nZXMubGVuZ3RoICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjaGFsbGVuZ2VJbmRleCA+PSAwICYmIGNoYWxsZW5nZUluZGV4IDwgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLmxlbmd0aCApO1xyXG4gICAgY29uc3QgY2hhbGxlbmdlID0gdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzWyBjaGFsbGVuZ2VJbmRleCBdO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgY2hhbGxlbmdlIGZyb20gdGhlIGF2YWlsYWJsZSBwb29sXHJcbiAgICB0aGlzLmF2YWlsYWJsZUNoYWxsZW5nZXMuc3BsaWNlKCBjaGFsbGVuZ2VJbmRleCwgMSApO1xyXG5cclxuICAgIHRoaXMuY2hhbGxlbmdlUHJvcGVydHkuc2V0KCBjaGFsbGVuZ2UgKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlckJhc2ljcy5yZWdpc3RlciggJ0ZCQk15c3RlcnlTY2VuZScsIEZCQk15c3RlcnlTY2VuZSApO1xyXG5leHBvcnQgZGVmYXVsdCBGQkJNeXN0ZXJ5U2NlbmU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLHlEQUF5RDtBQUNoRixPQUFPQyxhQUFhLE1BQU0sNERBQTREO0FBQ3RG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