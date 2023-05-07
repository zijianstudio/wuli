// Copyright 2015-2023, University of Colorado Boulder

/**
 * A scene in the 'Mystery' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import FBColors from '../../common/FBColors.js';
import FBConstants from '../../common/FBConstants.js';
import FBQueryParameters from '../../common/FBQueryParameters.js';
import MathBuilder from '../../common/model/builder/MathBuilder.js';
import Divide from '../../common/model/functions/Divide.js';
import FunctionCreator from '../../common/model/functions/FunctionCreator.js';
import Minus from '../../common/model/functions/Minus.js';
import Plus from '../../common/model/functions/Plus.js';
import Times from '../../common/model/functions/Times.js';
import RationalNumber from '../../common/model/RationalNumber.js';
import Scene from '../../common/model/Scene.js';
import FBIconFactory from '../../common/view/FBIconFactory.js'; // eslint-disable-line no-view-imported-from-model
import functionBuilder from '../../functionBuilder.js';
import MysteryChallenges from './MysteryChallenges.js';

// constants
const CARD_NUMBERS_RANGE = new Range(-4, 7);
const MAX_SLOTS = 3; // max number of slots in the builder

export default class MysteryScene extends Scene {
  /**
   * @param {string[]} challengePool
   * @param {Object} [options]
   */
  constructor(challengePool, options) {
    options = merge({
      numberOfSlots: 1,
      numberOfEachCard: 1
    }, options);
    assert && assert(options.numberOfSlots <= MAX_SLOTS);

    // {Node} scene selection icon
    assert && assert(!options.iconNode);
    options.iconNode = FBIconFactory.createSceneIcon(options.numberOfSlots);

    // Create enough instances of each function type to support the case where all functions
    // in a challenge have the same type.
    assert && assert(!options.numberOfEachFunction);
    options.numberOfEachFunction = options.numberOfSlots;

    // {RationalNumber[]} rational number cards, in the order that they appear in the carousel
    const cardContent = [];
    for (let i = CARD_NUMBERS_RANGE.min; i <= CARD_NUMBERS_RANGE.max; i++) {
      cardContent.push(RationalNumber.withInteger(i));
    }

    // {FunctionCreator[]} function creators, in the order that functions appear in the carousel
    const functionCreators = [new FunctionCreator(Plus), new FunctionCreator(Minus), new FunctionCreator(Times), new FunctionCreator(Divide)];

    // All builders have the same width, regardless of number of slots
    const builderWidth = Scene.computeBuilderWidth(MAX_SLOTS);
    const builderX = FBConstants.SCREEN_VIEW_LAYOUT_BOUNDS.width / 2 - builderWidth / 2;
    const builder = new MathBuilder({
      numberOfSlots: options.numberOfSlots,
      width: builderWidth,
      position: new Vector2(builderX, FBConstants.BUILDER_Y)
    });
    super(cardContent, functionCreators, builder, options);

    // @private
    this.numberOfSlots = options.numberOfSlots;

    // validate the challenge pool
    if (assert) {
      // limit scope of for-loop var using IIFE
      (function () {
        let duplicates = '';
        for (let i = 0; i < challengePool.length; i++) {
          const challenge = challengePool[i];

          // validate challenge
          const challengeObjects = MysteryChallenges.parseChallenge(challenge);
          assert && assert(challengeObjects.length === options.numberOfSlots, `incorrect number of functions in challenge: ${challenge}`);

          // check for duplicates
          if (challengePool.indexOf(challenge, i + 1) !== -1) {
            if (duplicates.length > 0) {
              duplicates += ', ';
            }
            duplicates += challenge;
          }
        }
        assert && assert(duplicates.length === 0, `pool contains duplicate challenges: ${duplicates}`);
      })();
    }

    // @public {Property.<string>} the challenge that is displayed
    this.challengeProperty = new Property(challengePool[MysteryChallenges.DEFAULT_CHALLENGE_INDEX]);
    this.challengePool = challengePool; // (read-only) for debug only, the original challenge pool, do not modify!

    // @private
    this.availableChallenges = challengePool.slice(0); // available challenges
    this.availableChallenges.splice(MysteryChallenges.DEFAULT_CHALLENGE_INDEX, 1); // remove the default challenge
    this.availableColorSets = FBColors.MYSTERY_COLOR_SETS.slice(0); // pool of available colors
    this.previousColorSets = []; // pool that was used on previous call to getColors
    this.nextColorIndexDebug = 0; // debug support for the 'showAllColors' query parameter
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

  /**
   * Randomly selects N colors from the pool, where N is equal to the number of functions in challenges.
   * Avoids similar colors by selecting N sets of colors, then choosing 1 color from each set.
   * The same N sets are not used on consecutive calls.
   *
   * @returns {<Color|string>[]}
   * @public
   */
  getColors() {
    let i;
    let colors = [];
    if (FBQueryParameters.showAllColors) {
      for (i = 0; i < this.numberOfSlots; i++) {
        colors.push(this.getColorDebug());
      }
    } else if (this.challengePool.indexOf(this.challengeProperty.get()) === MysteryChallenges.DEFAULT_CHALLENGE_INDEX) {
      // Always use the same colors for the default challenge. This provides a reproducible challenge for the teacher.
      colors = FBColors.MYSTERY_DEFAULT_CHALLENGE_COLORS[this.numberOfSlots - 1];
    } else {
      assert && assert(this.availableColorSets.length >= this.numberOfSlots);
      const colorSets = [];
      for (i = 0; i < this.numberOfSlots; i++) {
        // select a color set
        const colorSetIndex = dotRandom.nextInt(this.availableColorSets.length);
        const colorSet = this.availableColorSets[colorSetIndex];
        colorSets.push(colorSet);

        // remove the set from the available sets
        this.availableColorSets.splice(colorSetIndex, 1);

        // select a color from the set
        const colorIndex = dotRandom.nextInt(colorSet.length);
        const color = colorSet[colorIndex];
        colors.push(color);
      }

      // make sets from previous call available
      this.availableColorSets = this.availableColorSets.concat(this.previousColorSets);

      // remember sets from this call
      this.previousColorSets = colorSets;
    }
    assert && assert(colors && colors.length > 0, 'what, no colors?');
    return colors;
  }

  /**
   * Gets the next color, in order that they appear in the color pool.
   * This is used to support the 'showAllColors' query parameter.
   *
   * @private
   */
  getColorDebug() {
    const allColors = FBColors.MYSTERY_COLOR_SETS;
    const color = allColors[this.nextColorIndexDebug++];
    if (this.nextColorIndexDebug > allColors.length - 1) {
      this.nextColorIndexDebug = 0;
    }
    return color;
  }
}
functionBuilder.register('MysteryScene', MysteryScene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsIlJhbmdlIiwiVmVjdG9yMiIsIm1lcmdlIiwiRkJDb2xvcnMiLCJGQkNvbnN0YW50cyIsIkZCUXVlcnlQYXJhbWV0ZXJzIiwiTWF0aEJ1aWxkZXIiLCJEaXZpZGUiLCJGdW5jdGlvbkNyZWF0b3IiLCJNaW51cyIsIlBsdXMiLCJUaW1lcyIsIlJhdGlvbmFsTnVtYmVyIiwiU2NlbmUiLCJGQkljb25GYWN0b3J5IiwiZnVuY3Rpb25CdWlsZGVyIiwiTXlzdGVyeUNoYWxsZW5nZXMiLCJDQVJEX05VTUJFUlNfUkFOR0UiLCJNQVhfU0xPVFMiLCJNeXN0ZXJ5U2NlbmUiLCJjb25zdHJ1Y3RvciIsImNoYWxsZW5nZVBvb2wiLCJvcHRpb25zIiwibnVtYmVyT2ZTbG90cyIsIm51bWJlck9mRWFjaENhcmQiLCJhc3NlcnQiLCJpY29uTm9kZSIsImNyZWF0ZVNjZW5lSWNvbiIsIm51bWJlck9mRWFjaEZ1bmN0aW9uIiwiY2FyZENvbnRlbnQiLCJpIiwibWluIiwibWF4IiwicHVzaCIsIndpdGhJbnRlZ2VyIiwiZnVuY3Rpb25DcmVhdG9ycyIsImJ1aWxkZXJXaWR0aCIsImNvbXB1dGVCdWlsZGVyV2lkdGgiLCJidWlsZGVyWCIsIlNDUkVFTl9WSUVXX0xBWU9VVF9CT1VORFMiLCJ3aWR0aCIsImJ1aWxkZXIiLCJwb3NpdGlvbiIsIkJVSUxERVJfWSIsImR1cGxpY2F0ZXMiLCJsZW5ndGgiLCJjaGFsbGVuZ2UiLCJjaGFsbGVuZ2VPYmplY3RzIiwicGFyc2VDaGFsbGVuZ2UiLCJpbmRleE9mIiwiY2hhbGxlbmdlUHJvcGVydHkiLCJERUZBVUxUX0NIQUxMRU5HRV9JTkRFWCIsImF2YWlsYWJsZUNoYWxsZW5nZXMiLCJzbGljZSIsInNwbGljZSIsImF2YWlsYWJsZUNvbG9yU2V0cyIsIk1ZU1RFUllfQ09MT1JfU0VUUyIsInByZXZpb3VzQ29sb3JTZXRzIiwibmV4dENvbG9ySW5kZXhEZWJ1ZyIsInJlc2V0IiwiZ2V0IiwiaW5pdGlhbFZhbHVlIiwibm90aWZ5TGlzdGVuZXJzU3RhdGljIiwibmV4dENoYWxsZW5nZSIsInBsYXlBbGwiLCJjdXJyZW50Q2hhbGxlbmdlSW5kZXgiLCJjaGFsbGVuZ2VJbmRleCIsIm5leHRJbnQiLCJzZXQiLCJnZXRDb2xvcnMiLCJjb2xvcnMiLCJzaG93QWxsQ29sb3JzIiwiZ2V0Q29sb3JEZWJ1ZyIsIk1ZU1RFUllfREVGQVVMVF9DSEFMTEVOR0VfQ09MT1JTIiwiY29sb3JTZXRzIiwiY29sb3JTZXRJbmRleCIsImNvbG9yU2V0IiwiY29sb3JJbmRleCIsImNvbG9yIiwiY29uY2F0IiwiYWxsQ29sb3JzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNeXN0ZXJ5U2NlbmUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBzY2VuZSBpbiB0aGUgJ015c3RlcnknIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgRkJDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZCQ29sb3JzLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9GQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGQlF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9jb21tb24vRkJRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgTWF0aEJ1aWxkZXIgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL2J1aWxkZXIvTWF0aEJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgRGl2aWRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9mdW5jdGlvbnMvRGl2aWRlLmpzJztcclxuaW1wb3J0IEZ1bmN0aW9uQ3JlYXRvciBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvZnVuY3Rpb25zL0Z1bmN0aW9uQ3JlYXRvci5qcyc7XHJcbmltcG9ydCBNaW51cyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvZnVuY3Rpb25zL01pbnVzLmpzJztcclxuaW1wb3J0IFBsdXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL2Z1bmN0aW9ucy9QbHVzLmpzJztcclxuaW1wb3J0IFRpbWVzIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9mdW5jdGlvbnMvVGltZXMuanMnO1xyXG5pbXBvcnQgUmF0aW9uYWxOdW1iZXIgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1JhdGlvbmFsTnVtYmVyLmpzJztcclxuaW1wb3J0IFNjZW5lIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TY2VuZS5qcyc7XHJcbmltcG9ydCBGQkljb25GYWN0b3J5IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0ZCSWNvbkZhY3RvcnkuanMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXZpZXctaW1wb3J0ZWQtZnJvbS1tb2RlbFxyXG5pbXBvcnQgZnVuY3Rpb25CdWlsZGVyIGZyb20gJy4uLy4uL2Z1bmN0aW9uQnVpbGRlci5qcyc7XHJcbmltcG9ydCBNeXN0ZXJ5Q2hhbGxlbmdlcyBmcm9tICcuL015c3RlcnlDaGFsbGVuZ2VzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDQVJEX05VTUJFUlNfUkFOR0UgPSBuZXcgUmFuZ2UoIC00LCA3ICk7XHJcbmNvbnN0IE1BWF9TTE9UUyA9IDM7IC8vIG1heCBudW1iZXIgb2Ygc2xvdHMgaW4gdGhlIGJ1aWxkZXJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15c3RlcnlTY2VuZSBleHRlbmRzIFNjZW5lIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gY2hhbGxlbmdlUG9vbFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2hhbGxlbmdlUG9vbCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgbnVtYmVyT2ZTbG90czogMSxcclxuICAgICAgbnVtYmVyT2ZFYWNoQ2FyZDogMVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5udW1iZXJPZlNsb3RzIDw9IE1BWF9TTE9UUyApO1xyXG5cclxuICAgIC8vIHtOb2RlfSBzY2VuZSBzZWxlY3Rpb24gaWNvblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuaWNvbk5vZGUgKTtcclxuICAgIG9wdGlvbnMuaWNvbk5vZGUgPSBGQkljb25GYWN0b3J5LmNyZWF0ZVNjZW5lSWNvbiggb3B0aW9ucy5udW1iZXJPZlNsb3RzICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGVub3VnaCBpbnN0YW5jZXMgb2YgZWFjaCBmdW5jdGlvbiB0eXBlIHRvIHN1cHBvcnQgdGhlIGNhc2Ugd2hlcmUgYWxsIGZ1bmN0aW9uc1xyXG4gICAgLy8gaW4gYSBjaGFsbGVuZ2UgaGF2ZSB0aGUgc2FtZSB0eXBlLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMubnVtYmVyT2ZFYWNoRnVuY3Rpb24gKTtcclxuICAgIG9wdGlvbnMubnVtYmVyT2ZFYWNoRnVuY3Rpb24gPSBvcHRpb25zLm51bWJlck9mU2xvdHM7XHJcblxyXG4gICAgLy8ge1JhdGlvbmFsTnVtYmVyW119IHJhdGlvbmFsIG51bWJlciBjYXJkcywgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSBhcHBlYXIgaW4gdGhlIGNhcm91c2VsXHJcbiAgICBjb25zdCBjYXJkQ29udGVudCA9IFtdO1xyXG4gICAgZm9yICggbGV0IGkgPSBDQVJEX05VTUJFUlNfUkFOR0UubWluOyBpIDw9IENBUkRfTlVNQkVSU19SQU5HRS5tYXg7IGkrKyApIHtcclxuICAgICAgY2FyZENvbnRlbnQucHVzaCggUmF0aW9uYWxOdW1iZXIud2l0aEludGVnZXIoIGkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHtGdW5jdGlvbkNyZWF0b3JbXX0gZnVuY3Rpb24gY3JlYXRvcnMsIGluIHRoZSBvcmRlciB0aGF0IGZ1bmN0aW9ucyBhcHBlYXIgaW4gdGhlIGNhcm91c2VsXHJcbiAgICBjb25zdCBmdW5jdGlvbkNyZWF0b3JzID0gW1xyXG4gICAgICBuZXcgRnVuY3Rpb25DcmVhdG9yKCBQbHVzICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIE1pbnVzICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIFRpbWVzICksXHJcbiAgICAgIG5ldyBGdW5jdGlvbkNyZWF0b3IoIERpdmlkZSApXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIEFsbCBidWlsZGVycyBoYXZlIHRoZSBzYW1lIHdpZHRoLCByZWdhcmRsZXNzIG9mIG51bWJlciBvZiBzbG90c1xyXG4gICAgY29uc3QgYnVpbGRlcldpZHRoID0gU2NlbmUuY29tcHV0ZUJ1aWxkZXJXaWR0aCggTUFYX1NMT1RTICk7XHJcbiAgICBjb25zdCBidWlsZGVyWCA9ICggRkJDb25zdGFudHMuU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUy53aWR0aCAvIDIgKSAtICggYnVpbGRlcldpZHRoIC8gMiApO1xyXG4gICAgY29uc3QgYnVpbGRlciA9IG5ldyBNYXRoQnVpbGRlcigge1xyXG4gICAgICBudW1iZXJPZlNsb3RzOiBvcHRpb25zLm51bWJlck9mU2xvdHMsXHJcbiAgICAgIHdpZHRoOiBidWlsZGVyV2lkdGgsXHJcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggYnVpbGRlclgsIEZCQ29uc3RhbnRzLkJVSUxERVJfWSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNhcmRDb250ZW50LCBmdW5jdGlvbkNyZWF0b3JzLCBidWlsZGVyLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubnVtYmVyT2ZTbG90cyA9IG9wdGlvbnMubnVtYmVyT2ZTbG90cztcclxuXHJcbiAgICAvLyB2YWxpZGF0ZSB0aGUgY2hhbGxlbmdlIHBvb2xcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG5cclxuICAgICAgLy8gbGltaXQgc2NvcGUgb2YgZm9yLWxvb3AgdmFyIHVzaW5nIElJRkVcclxuICAgICAgKCBmdW5jdGlvbigpIHtcclxuICAgICAgICBsZXQgZHVwbGljYXRlcyA9ICcnO1xyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGNoYWxsZW5nZVBvb2wubGVuZ3RoOyBpKysgKSB7XHJcblxyXG4gICAgICAgICAgY29uc3QgY2hhbGxlbmdlID0gY2hhbGxlbmdlUG9vbFsgaSBdO1xyXG5cclxuICAgICAgICAgIC8vIHZhbGlkYXRlIGNoYWxsZW5nZVxyXG4gICAgICAgICAgY29uc3QgY2hhbGxlbmdlT2JqZWN0cyA9IE15c3RlcnlDaGFsbGVuZ2VzLnBhcnNlQ2hhbGxlbmdlKCBjaGFsbGVuZ2UgKTtcclxuICAgICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNoYWxsZW5nZU9iamVjdHMubGVuZ3RoID09PSBvcHRpb25zLm51bWJlck9mU2xvdHMsXHJcbiAgICAgICAgICAgIGBpbmNvcnJlY3QgbnVtYmVyIG9mIGZ1bmN0aW9ucyBpbiBjaGFsbGVuZ2U6ICR7Y2hhbGxlbmdlfWAgKTtcclxuXHJcbiAgICAgICAgICAvLyBjaGVjayBmb3IgZHVwbGljYXRlc1xyXG4gICAgICAgICAgaWYgKCBjaGFsbGVuZ2VQb29sLmluZGV4T2YoIGNoYWxsZW5nZSwgaSArIDEgKSAhPT0gLTEgKSB7XHJcbiAgICAgICAgICAgIGlmICggZHVwbGljYXRlcy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgICAgICAgIGR1cGxpY2F0ZXMgKz0gJywgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkdXBsaWNhdGVzICs9IGNoYWxsZW5nZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggZHVwbGljYXRlcy5sZW5ndGggPT09IDAsIGBwb29sIGNvbnRhaW5zIGR1cGxpY2F0ZSBjaGFsbGVuZ2VzOiAke2R1cGxpY2F0ZXN9YCApO1xyXG4gICAgICB9ICkoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48c3RyaW5nPn0gdGhlIGNoYWxsZW5nZSB0aGF0IGlzIGRpc3BsYXllZFxyXG4gICAgdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggY2hhbGxlbmdlUG9vbFsgTXlzdGVyeUNoYWxsZW5nZXMuREVGQVVMVF9DSEFMTEVOR0VfSU5ERVggXSApO1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VQb29sID0gY2hhbGxlbmdlUG9vbDsgLy8gKHJlYWQtb25seSkgZm9yIGRlYnVnIG9ubHksIHRoZSBvcmlnaW5hbCBjaGFsbGVuZ2UgcG9vbCwgZG8gbm90IG1vZGlmeSFcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzID0gY2hhbGxlbmdlUG9vbC5zbGljZSggMCApOyAvLyBhdmFpbGFibGUgY2hhbGxlbmdlc1xyXG4gICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLnNwbGljZSggTXlzdGVyeUNoYWxsZW5nZXMuREVGQVVMVF9DSEFMTEVOR0VfSU5ERVgsIDEgKTsgLy8gcmVtb3ZlIHRoZSBkZWZhdWx0IGNoYWxsZW5nZVxyXG4gICAgdGhpcy5hdmFpbGFibGVDb2xvclNldHMgPSBGQkNvbG9ycy5NWVNURVJZX0NPTE9SX1NFVFMuc2xpY2UoIDAgKTsgLy8gcG9vbCBvZiBhdmFpbGFibGUgY29sb3JzXHJcbiAgICB0aGlzLnByZXZpb3VzQ29sb3JTZXRzID0gW107IC8vIHBvb2wgdGhhdCB3YXMgdXNlZCBvbiBwcmV2aW91cyBjYWxsIHRvIGdldENvbG9yc1xyXG4gICAgdGhpcy5uZXh0Q29sb3JJbmRleERlYnVnID0gMDsgLy8gZGVidWcgc3VwcG9ydCBmb3IgdGhlICdzaG93QWxsQ29sb3JzJyBxdWVyeSBwYXJhbWV0ZXJcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgc2NlbmUuXHJcbiAgICogUmVzZXRzIHRoZSBjaGFsbGVuZ2UgdG8gaXRzIGluaXRpYWwgdmFsdWUsIHJlc3RvY2tzIHRoZSBjaGFsbGVuZ2UgcG9vbC5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcblxyXG4gICAgLy8gZm9yY2Ugbm90aWZpY2F0aW9uIHdoZW4gaW5pdGlhbCBjaGFsbGVuZ2UgaXMgZGlzcGxheWVkXHJcbiAgICBpZiAoIHRoaXMuY2hhbGxlbmdlUHJvcGVydHkuZ2V0KCkgPT09IHRoaXMuY2hhbGxlbmdlUHJvcGVydHkuaW5pdGlhbFZhbHVlICkge1xyXG4gICAgICB0aGlzLmNoYWxsZW5nZVByb3BlcnR5Lm5vdGlmeUxpc3RlbmVyc1N0YXRpYygpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXN0b2NrIHRoZSBhdmFpbGFibGUgY2hhbGxlbmdlcywgd2l0aCBkZWZhdWx0IGNoYWxsZW5nZSByZW1vdmVkXHJcbiAgICB0aGlzLmF2YWlsYWJsZUNoYWxsZW5nZXMgPSB0aGlzLmNoYWxsZW5nZVBvb2wuc2xpY2UoIDAgKTtcclxuICAgIHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlcy5zcGxpY2UoIE15c3RlcnlDaGFsbGVuZ2VzLkRFRkFVTFRfQ0hBTExFTkdFX0lOREVYLCAxICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlcyB0byB0aGUgbmV4dCByYW5kb21seS1zZWxlY3RlZCBjaGFsbGVuZ2UuICBBZnRlciBhIGNoYWxsZW5nZSBoYXMgYmVlbiBzZWxlY3RlZCwgaXQgaXMgbm90IHNlbGVjdGVkXHJcbiAgICogYWdhaW4gdW50aWwgYWxsIGNoYWxsZW5nZXMgaW4gdGhlIHBvb2wgaGF2ZSBiZWVuIHNlbGVjdGVkLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG5leHRDaGFsbGVuZ2UoKSB7XHJcblxyXG4gICAgLy8gYXZhaWxhYmxlIHBvb2wgaXMgZW1wdHlcclxuICAgIGlmICggdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLmxlbmd0aCA9PT0gMCApIHtcclxuXHJcbiAgICAgIC8vIHJlc3RvY2sgdGhlIHBvb2xcclxuICAgICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzID0gdGhpcy5jaGFsbGVuZ2VQb29sLnNsaWNlKCAwICk7XHJcblxyXG4gICAgICAvLyByZW1vdmUgdGhlIGN1cnJlbnQgY2hhbGxlbmdlLCBzbyB3ZSBkb24ndCBzZWxlY3QgaXQgdHdpY2UgaW4gYSByb3dcclxuICAgICAgaWYgKCAhRkJRdWVyeVBhcmFtZXRlcnMucGxheUFsbCApIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50Q2hhbGxlbmdlSW5kZXggPSB0aGlzLmF2YWlsYWJsZUNoYWxsZW5nZXMuaW5kZXhPZiggdGhpcy5jaGFsbGVuZ2VQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICAgIHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlcy5zcGxpY2UoIGN1cnJlbnRDaGFsbGVuZ2VJbmRleCwgMSApO1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlcy5sZW5ndGggPT09IHRoaXMuY2hhbGxlbmdlUG9vbC5sZW5ndGggLSAxICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyByYW5kb21seSBzZWxlY3QgYSBjaGFsbGVuZ2UgZnJvbSB0aGUgYXZhaWxhYmxlIHBvb2xcclxuICAgIGNvbnN0IGNoYWxsZW5nZUluZGV4ID0gRkJRdWVyeVBhcmFtZXRlcnMucGxheUFsbCA/IDAgOiBkb3RSYW5kb20ubmV4dEludCggdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLmxlbmd0aCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY2hhbGxlbmdlSW5kZXggPj0gMCAmJiBjaGFsbGVuZ2VJbmRleCA8IHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlcy5sZW5ndGggKTtcclxuICAgIGNvbnN0IGNoYWxsZW5nZSA9IHRoaXMuYXZhaWxhYmxlQ2hhbGxlbmdlc1sgY2hhbGxlbmdlSW5kZXggXTtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIGNoYWxsZW5nZSBmcm9tIHRoZSBhdmFpbGFibGUgcG9vbFxyXG4gICAgdGhpcy5hdmFpbGFibGVDaGFsbGVuZ2VzLnNwbGljZSggY2hhbGxlbmdlSW5kZXgsIDEgKTtcclxuXHJcbiAgICB0aGlzLmNoYWxsZW5nZVByb3BlcnR5LnNldCggY2hhbGxlbmdlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSYW5kb21seSBzZWxlY3RzIE4gY29sb3JzIGZyb20gdGhlIHBvb2wsIHdoZXJlIE4gaXMgZXF1YWwgdG8gdGhlIG51bWJlciBvZiBmdW5jdGlvbnMgaW4gY2hhbGxlbmdlcy5cclxuICAgKiBBdm9pZHMgc2ltaWxhciBjb2xvcnMgYnkgc2VsZWN0aW5nIE4gc2V0cyBvZiBjb2xvcnMsIHRoZW4gY2hvb3NpbmcgMSBjb2xvciBmcm9tIGVhY2ggc2V0LlxyXG4gICAqIFRoZSBzYW1lIE4gc2V0cyBhcmUgbm90IHVzZWQgb24gY29uc2VjdXRpdmUgY2FsbHMuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7PENvbG9yfHN0cmluZz5bXX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q29sb3JzKCkge1xyXG5cclxuICAgIGxldCBpO1xyXG4gICAgbGV0IGNvbG9ycyA9IFtdO1xyXG5cclxuICAgIGlmICggRkJRdWVyeVBhcmFtZXRlcnMuc2hvd0FsbENvbG9ycyApIHtcclxuICAgICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mU2xvdHM7IGkrKyApIHtcclxuICAgICAgICBjb2xvcnMucHVzaCggdGhpcy5nZXRDb2xvckRlYnVnKCkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuY2hhbGxlbmdlUG9vbC5pbmRleE9mKCB0aGlzLmNoYWxsZW5nZVByb3BlcnR5LmdldCgpICkgPT09IE15c3RlcnlDaGFsbGVuZ2VzLkRFRkFVTFRfQ0hBTExFTkdFX0lOREVYICkge1xyXG5cclxuICAgICAgLy8gQWx3YXlzIHVzZSB0aGUgc2FtZSBjb2xvcnMgZm9yIHRoZSBkZWZhdWx0IGNoYWxsZW5nZS4gVGhpcyBwcm92aWRlcyBhIHJlcHJvZHVjaWJsZSBjaGFsbGVuZ2UgZm9yIHRoZSB0ZWFjaGVyLlxyXG4gICAgICBjb2xvcnMgPSBGQkNvbG9ycy5NWVNURVJZX0RFRkFVTFRfQ0hBTExFTkdFX0NPTE9SU1sgdGhpcy5udW1iZXJPZlNsb3RzIC0gMSBdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYXZhaWxhYmxlQ29sb3JTZXRzLmxlbmd0aCA+PSB0aGlzLm51bWJlck9mU2xvdHMgKTtcclxuXHJcbiAgICAgIGNvbnN0IGNvbG9yU2V0cyA9IFtdO1xyXG5cclxuICAgICAgZm9yICggaSA9IDA7IGkgPCB0aGlzLm51bWJlck9mU2xvdHM7IGkrKyApIHtcclxuXHJcbiAgICAgICAgLy8gc2VsZWN0IGEgY29sb3Igc2V0XHJcbiAgICAgICAgY29uc3QgY29sb3JTZXRJbmRleCA9IGRvdFJhbmRvbS5uZXh0SW50KCB0aGlzLmF2YWlsYWJsZUNvbG9yU2V0cy5sZW5ndGggKTtcclxuICAgICAgICBjb25zdCBjb2xvclNldCA9IHRoaXMuYXZhaWxhYmxlQ29sb3JTZXRzWyBjb2xvclNldEluZGV4IF07XHJcbiAgICAgICAgY29sb3JTZXRzLnB1c2goIGNvbG9yU2V0ICk7XHJcblxyXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgc2V0IGZyb20gdGhlIGF2YWlsYWJsZSBzZXRzXHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVDb2xvclNldHMuc3BsaWNlKCBjb2xvclNldEluZGV4LCAxICk7XHJcblxyXG4gICAgICAgIC8vIHNlbGVjdCBhIGNvbG9yIGZyb20gdGhlIHNldFxyXG4gICAgICAgIGNvbnN0IGNvbG9ySW5kZXggPSBkb3RSYW5kb20ubmV4dEludCggY29sb3JTZXQubGVuZ3RoICk7XHJcbiAgICAgICAgY29uc3QgY29sb3IgPSBjb2xvclNldFsgY29sb3JJbmRleCBdO1xyXG4gICAgICAgIGNvbG9ycy5wdXNoKCBjb2xvciApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtYWtlIHNldHMgZnJvbSBwcmV2aW91cyBjYWxsIGF2YWlsYWJsZVxyXG4gICAgICB0aGlzLmF2YWlsYWJsZUNvbG9yU2V0cyA9IHRoaXMuYXZhaWxhYmxlQ29sb3JTZXRzLmNvbmNhdCggdGhpcy5wcmV2aW91c0NvbG9yU2V0cyApO1xyXG5cclxuICAgICAgLy8gcmVtZW1iZXIgc2V0cyBmcm9tIHRoaXMgY2FsbFxyXG4gICAgICB0aGlzLnByZXZpb3VzQ29sb3JTZXRzID0gY29sb3JTZXRzO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbG9ycyAmJiBjb2xvcnMubGVuZ3RoID4gMCwgJ3doYXQsIG5vIGNvbG9ycz8nICk7XHJcbiAgICByZXR1cm4gY29sb3JzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbmV4dCBjb2xvciwgaW4gb3JkZXIgdGhhdCB0aGV5IGFwcGVhciBpbiB0aGUgY29sb3IgcG9vbC5cclxuICAgKiBUaGlzIGlzIHVzZWQgdG8gc3VwcG9ydCB0aGUgJ3Nob3dBbGxDb2xvcnMnIHF1ZXJ5IHBhcmFtZXRlci5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgZ2V0Q29sb3JEZWJ1ZygpIHtcclxuICAgIGNvbnN0IGFsbENvbG9ycyA9IEZCQ29sb3JzLk1ZU1RFUllfQ09MT1JfU0VUUztcclxuICAgIGNvbnN0IGNvbG9yID0gYWxsQ29sb3JzWyB0aGlzLm5leHRDb2xvckluZGV4RGVidWcrKyBdO1xyXG4gICAgaWYgKCB0aGlzLm5leHRDb2xvckluZGV4RGVidWcgPiBhbGxDb2xvcnMubGVuZ3RoIC0gMSApIHtcclxuICAgICAgdGhpcy5uZXh0Q29sb3JJbmRleERlYnVnID0gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBjb2xvcjtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uQnVpbGRlci5yZWdpc3RlciggJ015c3RlcnlTY2VuZScsIE15c3RlcnlTY2VuZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsUUFBUSxNQUFNLDBCQUEwQjtBQUMvQyxPQUFPQyxXQUFXLE1BQU0sNkJBQTZCO0FBQ3JELE9BQU9DLGlCQUFpQixNQUFNLG1DQUFtQztBQUNqRSxPQUFPQyxXQUFXLE1BQU0sMkNBQTJDO0FBQ25FLE9BQU9DLE1BQU0sTUFBTSx3Q0FBd0M7QUFDM0QsT0FBT0MsZUFBZSxNQUFNLGlEQUFpRDtBQUM3RSxPQUFPQyxLQUFLLE1BQU0sdUNBQXVDO0FBQ3pELE9BQU9DLElBQUksTUFBTSxzQ0FBc0M7QUFDdkQsT0FBT0MsS0FBSyxNQUFN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