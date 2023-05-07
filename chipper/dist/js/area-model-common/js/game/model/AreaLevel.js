// Copyright 2017-2021, University of Colorado Boulder

/**
 * A game level
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaChallenge from './AreaChallenge.js';
import GameState from './GameState.js';
class AreaLevel {
  /**
   * @param {number} number
   * @param {AreaChallengeType} type
   * @param {Property.<Color>} colorProperty
   * @param {Array.<AreaChallengeDescription>} challengeDescriptions
   */
  constructor(number, type, colorProperty, challengeDescriptions) {
    // @public {number} - Will be the value 1 for "Level 1". Not using the 0-based values used in VEGAS, so sometimes
    // this value will need to be decremented when passed to VEGAS components.
    this.number = number;

    // @public {AreaChallengeType}
    this.type = type;

    // @public {Property.<Color>}
    this.colorProperty = colorProperty;

    // @public {Array.<AreaChallengeDescription>} - Descriptions for each type of level
    this.challengeDescriptions = challengeDescriptions;

    // @public {Property.<number>} - Ranges from 0 to AreaModelCommonConstants.PERFECT_SCORE
    //                               (since 2 points are rewarded for first attempt correct)
    this.scoreProperty = new NumberProperty(0);

    // @public {Array.<AreaChallenge>}
    this.challenges = this.generateChallenges();

    // @public {Property.<number>} - The index of the current challenge.
    this.challengeIndexProperty = new NumberProperty(0);

    // @public {Property.<AreaChallenge>}
    this.currentChallengeProperty = new DerivedProperty([this.challengeIndexProperty], index => this.challenges[index]);

    // @public {boolean} - Whether the level is finished
    this.finished = false;
  }

  /**
   * Generates six challenges.
   * @private
   *
   * @returns {Array.<AreaChallenge>}
   */
  generateChallenges() {
    // Always include the first description as the first challenge
    let descriptions = [this.challengeDescriptions[0]];

    // Shuffle the rest of them in a random order
    descriptions = descriptions.concat(dotRandom.shuffle(descriptions.slice(1)));

    // Then fill with random challenges if there are any more spaces
    while (descriptions.length < AreaModelCommonConstants.NUM_CHALLENGES) {
      descriptions.push(dotRandom.sample(this.challengeDescriptions));
    }

    // Generate based on the descriptions
    return descriptions.map(description => new AreaChallenge(description));
  }

  /**
   * Selects the level (resetting progress and generates a new challenge).  It is not the same as starting the level,
   * It's more of a "switch to" operation, since there will already be challenges. We want to delay the resetting of
   * the level until it's selected again (unless it was already finished).
   * @public
   */
  select() {
    if (this.finished) {
      this.finished = false;
      this.reset();
    }
  }

  /**
   * Marks the level as finished.  This means challenges will be regenerated if the level is selected again.
   * @public
   */
  finish() {
    this.finished = true;
  }

  /**
   * Move to the next challenge.
   * @public
   */
  next() {
    if (this.challengeIndexProperty.value === AreaModelCommonConstants.NUM_CHALLENGES - 1) {
      this.finish();
      this.currentChallengeProperty.value.stateProperty.value = GameState.LEVEL_COMPLETE;
    } else {
      this.challengeIndexProperty.value += 1;
    }
  }

  /**
   * When we start over, we want to reset the score, but not immediately change the challenges yet (we'll wait until
   * we re-select this level).
   * @public
   *
   * See https://github.com/phetsims/area-model-common/issues/87 and
   * https://github.com/phetsims/area-model-common/issues/96.
   */
  startOver() {
    this.scoreProperty.reset();
    this.finish();
  }

  /**
   * Returns the model to its initial state.
   * @public
   */
  reset() {
    this.challenges = this.generateChallenges();
    this.scoreProperty.reset();
    this.challengeIndexProperty.reset();
    this.challengeIndexProperty.notifyListenersStatic();
  }
}
areaModelCommon.register('AreaLevel', AreaLevel);
export default AreaLevel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsImRvdFJhbmRvbSIsImFyZWFNb2RlbENvbW1vbiIsIkFyZWFNb2RlbENvbW1vbkNvbnN0YW50cyIsIkFyZWFDaGFsbGVuZ2UiLCJHYW1lU3RhdGUiLCJBcmVhTGV2ZWwiLCJjb25zdHJ1Y3RvciIsIm51bWJlciIsInR5cGUiLCJjb2xvclByb3BlcnR5IiwiY2hhbGxlbmdlRGVzY3JpcHRpb25zIiwic2NvcmVQcm9wZXJ0eSIsImNoYWxsZW5nZXMiLCJnZW5lcmF0ZUNoYWxsZW5nZXMiLCJjaGFsbGVuZ2VJbmRleFByb3BlcnR5IiwiY3VycmVudENoYWxsZW5nZVByb3BlcnR5IiwiaW5kZXgiLCJmaW5pc2hlZCIsImRlc2NyaXB0aW9ucyIsImNvbmNhdCIsInNodWZmbGUiLCJzbGljZSIsImxlbmd0aCIsIk5VTV9DSEFMTEVOR0VTIiwicHVzaCIsInNhbXBsZSIsIm1hcCIsImRlc2NyaXB0aW9uIiwic2VsZWN0IiwicmVzZXQiLCJmaW5pc2giLCJuZXh0IiwidmFsdWUiLCJzdGF0ZVByb3BlcnR5IiwiTEVWRUxfQ09NUExFVEUiLCJzdGFydE92ZXIiLCJub3RpZnlMaXN0ZW5lcnNTdGF0aWMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFyZWFMZXZlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGdhbWUgbGV2ZWxcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBhcmVhTW9kZWxDb21tb24gZnJvbSAnLi4vLi4vYXJlYU1vZGVsQ29tbW9uLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFyZWFDaGFsbGVuZ2UgZnJvbSAnLi9BcmVhQ2hhbGxlbmdlLmpzJztcclxuaW1wb3J0IEdhbWVTdGF0ZSBmcm9tICcuL0dhbWVTdGF0ZS5qcyc7XHJcblxyXG5jbGFzcyBBcmVhTGV2ZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJcclxuICAgKiBAcGFyYW0ge0FyZWFDaGFsbGVuZ2VUeXBlfSB0eXBlXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Q29sb3I+fSBjb2xvclByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtBcnJheS48QXJlYUNoYWxsZW5nZURlc2NyaXB0aW9uPn0gY2hhbGxlbmdlRGVzY3JpcHRpb25zXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlciwgdHlwZSwgY29sb3JQcm9wZXJ0eSwgY2hhbGxlbmdlRGVzY3JpcHRpb25zICkge1xyXG5cclxuICAgIC8vIEBwdWJsaWMge251bWJlcn0gLSBXaWxsIGJlIHRoZSB2YWx1ZSAxIGZvciBcIkxldmVsIDFcIi4gTm90IHVzaW5nIHRoZSAwLWJhc2VkIHZhbHVlcyB1c2VkIGluIFZFR0FTLCBzbyBzb21ldGltZXNcclxuICAgIC8vIHRoaXMgdmFsdWUgd2lsbCBuZWVkIHRvIGJlIGRlY3JlbWVudGVkIHdoZW4gcGFzc2VkIHRvIFZFR0FTIGNvbXBvbmVudHMuXHJcbiAgICB0aGlzLm51bWJlciA9IG51bWJlcjtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBcmVhQ2hhbGxlbmdlVHlwZX1cclxuICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPENvbG9yPn1cclxuICAgIHRoaXMuY29sb3JQcm9wZXJ0eSA9IGNvbG9yUHJvcGVydHk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPEFyZWFDaGFsbGVuZ2VEZXNjcmlwdGlvbj59IC0gRGVzY3JpcHRpb25zIGZvciBlYWNoIHR5cGUgb2YgbGV2ZWxcclxuICAgIHRoaXMuY2hhbGxlbmdlRGVzY3JpcHRpb25zID0gY2hhbGxlbmdlRGVzY3JpcHRpb25zO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxudW1iZXI+fSAtIFJhbmdlcyBmcm9tIDAgdG8gQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLlBFUkZFQ1RfU0NPUkVcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChzaW5jZSAyIHBvaW50cyBhcmUgcmV3YXJkZWQgZm9yIGZpcnN0IGF0dGVtcHQgY29ycmVjdClcclxuICAgIHRoaXMuc2NvcmVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxBcmVhQ2hhbGxlbmdlPn1cclxuICAgIHRoaXMuY2hhbGxlbmdlcyA9IHRoaXMuZ2VuZXJhdGVDaGFsbGVuZ2VzKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7UHJvcGVydHkuPG51bWJlcj59IC0gVGhlIGluZGV4IG9mIHRoZSBjdXJyZW50IGNoYWxsZW5nZS5cclxuICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxBcmVhQ2hhbGxlbmdlPn1cclxuICAgIHRoaXMuY3VycmVudENoYWxsZW5nZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLmNoYWxsZW5nZUluZGV4UHJvcGVydHkgXSwgaW5kZXggPT4gdGhpcy5jaGFsbGVuZ2VzWyBpbmRleCBdICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Ym9vbGVhbn0gLSBXaGV0aGVyIHRoZSBsZXZlbCBpcyBmaW5pc2hlZFxyXG4gICAgdGhpcy5maW5pc2hlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGVzIHNpeCBjaGFsbGVuZ2VzLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyB7QXJyYXkuPEFyZWFDaGFsbGVuZ2U+fVxyXG4gICAqL1xyXG4gIGdlbmVyYXRlQ2hhbGxlbmdlcygpIHtcclxuXHJcbiAgICAvLyBBbHdheXMgaW5jbHVkZSB0aGUgZmlyc3QgZGVzY3JpcHRpb24gYXMgdGhlIGZpcnN0IGNoYWxsZW5nZVxyXG4gICAgbGV0IGRlc2NyaXB0aW9ucyA9IFsgdGhpcy5jaGFsbGVuZ2VEZXNjcmlwdGlvbnNbIDAgXSBdO1xyXG5cclxuICAgIC8vIFNodWZmbGUgdGhlIHJlc3Qgb2YgdGhlbSBpbiBhIHJhbmRvbSBvcmRlclxyXG4gICAgZGVzY3JpcHRpb25zID0gZGVzY3JpcHRpb25zLmNvbmNhdCggZG90UmFuZG9tLnNodWZmbGUoIGRlc2NyaXB0aW9ucy5zbGljZSggMSApICkgKTtcclxuXHJcbiAgICAvLyBUaGVuIGZpbGwgd2l0aCByYW5kb20gY2hhbGxlbmdlcyBpZiB0aGVyZSBhcmUgYW55IG1vcmUgc3BhY2VzXHJcbiAgICB3aGlsZSAoIGRlc2NyaXB0aW9ucy5sZW5ndGggPCBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuTlVNX0NIQUxMRU5HRVMgKSB7XHJcbiAgICAgIGRlc2NyaXB0aW9ucy5wdXNoKCBkb3RSYW5kb20uc2FtcGxlKCB0aGlzLmNoYWxsZW5nZURlc2NyaXB0aW9ucyApICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2VuZXJhdGUgYmFzZWQgb24gdGhlIGRlc2NyaXB0aW9uc1xyXG4gICAgcmV0dXJuIGRlc2NyaXB0aW9ucy5tYXAoIGRlc2NyaXB0aW9uID0+IG5ldyBBcmVhQ2hhbGxlbmdlKCBkZXNjcmlwdGlvbiApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWxlY3RzIHRoZSBsZXZlbCAocmVzZXR0aW5nIHByb2dyZXNzIGFuZCBnZW5lcmF0ZXMgYSBuZXcgY2hhbGxlbmdlKS4gIEl0IGlzIG5vdCB0aGUgc2FtZSBhcyBzdGFydGluZyB0aGUgbGV2ZWwsXHJcbiAgICogSXQncyBtb3JlIG9mIGEgXCJzd2l0Y2ggdG9cIiBvcGVyYXRpb24sIHNpbmNlIHRoZXJlIHdpbGwgYWxyZWFkeSBiZSBjaGFsbGVuZ2VzLiBXZSB3YW50IHRvIGRlbGF5IHRoZSByZXNldHRpbmcgb2ZcclxuICAgKiB0aGUgbGV2ZWwgdW50aWwgaXQncyBzZWxlY3RlZCBhZ2FpbiAodW5sZXNzIGl0IHdhcyBhbHJlYWR5IGZpbmlzaGVkKS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2VsZWN0KCkge1xyXG4gICAgaWYgKCB0aGlzLmZpbmlzaGVkICkge1xyXG4gICAgICB0aGlzLmZpbmlzaGVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1hcmtzIHRoZSBsZXZlbCBhcyBmaW5pc2hlZC4gIFRoaXMgbWVhbnMgY2hhbGxlbmdlcyB3aWxsIGJlIHJlZ2VuZXJhdGVkIGlmIHRoZSBsZXZlbCBpcyBzZWxlY3RlZCBhZ2Fpbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZmluaXNoKCkge1xyXG4gICAgdGhpcy5maW5pc2hlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIHRvIHRoZSBuZXh0IGNoYWxsZW5nZS5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbmV4dCgpIHtcclxuICAgIGlmICggdGhpcy5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LnZhbHVlID09PSBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuTlVNX0NIQUxMRU5HRVMgLSAxICkge1xyXG4gICAgICB0aGlzLmZpbmlzaCgpO1xyXG4gICAgICB0aGlzLmN1cnJlbnRDaGFsbGVuZ2VQcm9wZXJ0eS52YWx1ZS5zdGF0ZVByb3BlcnR5LnZhbHVlID0gR2FtZVN0YXRlLkxFVkVMX0NPTVBMRVRFO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS52YWx1ZSArPSAxO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiB3ZSBzdGFydCBvdmVyLCB3ZSB3YW50IHRvIHJlc2V0IHRoZSBzY29yZSwgYnV0IG5vdCBpbW1lZGlhdGVseSBjaGFuZ2UgdGhlIGNoYWxsZW5nZXMgeWV0ICh3ZSdsbCB3YWl0IHVudGlsXHJcbiAgICogd2UgcmUtc2VsZWN0IHRoaXMgbGV2ZWwpLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXJlYS1tb2RlbC1jb21tb24vaXNzdWVzLzg3IGFuZFxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9hcmVhLW1vZGVsLWNvbW1vbi9pc3N1ZXMvOTYuXHJcbiAgICovXHJcbiAgc3RhcnRPdmVyKCkge1xyXG4gICAgdGhpcy5zY29yZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZpbmlzaCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbW9kZWwgdG8gaXRzIGluaXRpYWwgc3RhdGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5jaGFsbGVuZ2VzID0gdGhpcy5nZW5lcmF0ZUNoYWxsZW5nZXMoKTtcclxuXHJcbiAgICB0aGlzLnNjb3JlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMuY2hhbGxlbmdlSW5kZXhQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ0FyZWFMZXZlbCcsIEFyZWFMZXZlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQXJlYUxldmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxlQUFlLE1BQU0sMEJBQTBCO0FBQ3RELE9BQU9DLHdCQUF3QixNQUFNLDBDQUEwQztBQUMvRSxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFFdEMsTUFBTUMsU0FBUyxDQUFDO0VBQ2Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxhQUFhLEVBQUVDLHFCQUFxQixFQUFHO0lBRWhFO0lBQ0E7SUFDQSxJQUFJLENBQUNILE1BQU0sR0FBR0EsTUFBTTs7SUFFcEI7SUFDQSxJQUFJLENBQUNDLElBQUksR0FBR0EsSUFBSTs7SUFFaEI7SUFDQSxJQUFJLENBQUNDLGFBQWEsR0FBR0EsYUFBYTs7SUFFbEM7SUFDQSxJQUFJLENBQUNDLHFCQUFxQixHQUFHQSxxQkFBcUI7O0lBRWxEO0lBQ0E7SUFDQSxJQUFJLENBQUNDLGFBQWEsR0FBRyxJQUFJWixjQUFjLENBQUUsQ0FBRSxDQUFDOztJQUU1QztJQUNBLElBQUksQ0FBQ2EsVUFBVSxHQUFHLElBQUksQ0FBQ0Msa0JBQWtCLENBQUMsQ0FBQzs7SUFFM0M7SUFDQSxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUlmLGNBQWMsQ0FBRSxDQUFFLENBQUM7O0lBRXJEO0lBQ0EsSUFBSSxDQUFDZ0Isd0JBQXdCLEdBQUcs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