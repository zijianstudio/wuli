// Copyright 2013-2023, University of Colorado Boulder

/**
 * Portion of the scenegraph that corresponds to the 'play' game phase. (See GamePhase.PLAY)
 * Displays the scoreboard and current challenge.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import FiniteStatusBar from '../../../../vegas/js/FiniteStatusBar.js';
import ScoreDisplayLabeledNumber from '../../../../vegas/js/ScoreDisplayLabeledNumber.js';
import graphingLines from '../../graphingLines.js';
import GamePhase from '../model/GamePhase.js';
// constants
const STATUS_BAR_FONT = new PhetFont(20);
const STATUS_BAR_TEXT_FILL = 'white';
export default class PlayNode extends Node {
  constructor(model, layoutBounds, visibleBoundsProperty, audioPlayer) {
    super();
    const statusBar = new FiniteStatusBar(layoutBounds, visibleBoundsProperty, model.scoreProperty, {
      createScoreDisplay: scoreProperty => new ScoreDisplayLabeledNumber(scoreProperty, {
        font: STATUS_BAR_FONT,
        textFill: STATUS_BAR_TEXT_FILL
      }),
      // FiniteStatusBar uses 1-based level numbering, model is 0-based, see #88.
      levelProperty: new DerivedProperty([model.levelProperty], level => level + 1),
      challengeIndexProperty: model.challengeIndexProperty,
      numberOfChallengesProperty: model.challengesPerGameProperty,
      elapsedTimeProperty: model.timer.elapsedTimeProperty,
      timerEnabledProperty: model.timerEnabledProperty,
      font: STATUS_BAR_FONT,
      textFill: STATUS_BAR_TEXT_FILL,
      barFill: 'rgb( 49, 117, 202 )',
      xMargin: 40,
      startOverButtonOptions: {
        baseColor: 'rgb( 229, 243, 255 )',
        textFill: 'black',
        xMargin: 10,
        yMargin: 5,
        listener: () => {
          model.setGamePhase(GamePhase.SETTINGS);
        }
      }
    });
    this.addChild(statusBar);

    // compute the size of the area available for the challenges
    const challengeSize = new Dimension2(layoutBounds.width, layoutBounds.height - statusBar.bottom);

    // challenge parent, to keep challenge below scoreboard
    const challengeParent = new Rectangle(0, 0, 0, 1);
    challengeParent.top = statusBar.bottom;
    this.addChild(challengeParent);

    // Set up a new challenge
    // unlink unnecessary because PlayNode exists for the lifetime of the sim.
    let previousChallengeNode;
    model.challengeProperty.link(challenge => {
      // dispose of view for previous challenge
      if (previousChallengeNode) {
        previousChallengeNode.dispose(); // handles challengeParent.removeChild
      }

      // add view for current challenge
      const challengeNode = challenge.createView(model, challengeSize, audioPlayer);
      challengeParent.addChild(challengeNode);
      previousChallengeNode = challengeNode;
    });
  }
}
graphingLines.register('PlayNode', PlayNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUGhldEZvbnQiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiRmluaXRlU3RhdHVzQmFyIiwiU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlciIsImdyYXBoaW5nTGluZXMiLCJHYW1lUGhhc2UiLCJTVEFUVVNfQkFSX0ZPTlQiLCJTVEFUVVNfQkFSX1RFWFRfRklMTCIsIlBsYXlOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImxheW91dEJvdW5kcyIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsImF1ZGlvUGxheWVyIiwic3RhdHVzQmFyIiwic2NvcmVQcm9wZXJ0eSIsImNyZWF0ZVNjb3JlRGlzcGxheSIsImZvbnQiLCJ0ZXh0RmlsbCIsImxldmVsUHJvcGVydHkiLCJsZXZlbCIsImNoYWxsZW5nZUluZGV4UHJvcGVydHkiLCJudW1iZXJPZkNoYWxsZW5nZXNQcm9wZXJ0eSIsImNoYWxsZW5nZXNQZXJHYW1lUHJvcGVydHkiLCJlbGFwc2VkVGltZVByb3BlcnR5IiwidGltZXIiLCJ0aW1lckVuYWJsZWRQcm9wZXJ0eSIsImJhckZpbGwiLCJ4TWFyZ2luIiwic3RhcnRPdmVyQnV0dG9uT3B0aW9ucyIsImJhc2VDb2xvciIsInlNYXJnaW4iLCJsaXN0ZW5lciIsInNldEdhbWVQaGFzZSIsIlNFVFRJTkdTIiwiYWRkQ2hpbGQiLCJjaGFsbGVuZ2VTaXplIiwid2lkdGgiLCJoZWlnaHQiLCJib3R0b20iLCJjaGFsbGVuZ2VQYXJlbnQiLCJ0b3AiLCJwcmV2aW91c0NoYWxsZW5nZU5vZGUiLCJjaGFsbGVuZ2VQcm9wZXJ0eSIsImxpbmsiLCJjaGFsbGVuZ2UiLCJkaXNwb3NlIiwiY2hhbGxlbmdlTm9kZSIsImNyZWF0ZVZpZXciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXlOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBvcnRpb24gb2YgdGhlIHNjZW5lZ3JhcGggdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgJ3BsYXknIGdhbWUgcGhhc2UuIChTZWUgR2FtZVBoYXNlLlBMQVkpXHJcbiAqIERpc3BsYXlzIHRoZSBzY29yZWJvYXJkIGFuZCBjdXJyZW50IGNoYWxsZW5nZS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBGaW5pdGVTdGF0dXNCYXIgZnJvbSAnLi4vLi4vLi4vLi4vdmVnYXMvanMvRmluaXRlU3RhdHVzQmFyLmpzJztcclxuaW1wb3J0IEdhbWVBdWRpb1BsYXllciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9HYW1lQXVkaW9QbGF5ZXIuanMnO1xyXG5pbXBvcnQgU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlciBmcm9tICcuLi8uLi8uLi8uLi92ZWdhcy9qcy9TY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyLmpzJztcclxuaW1wb3J0IGdyYXBoaW5nTGluZXMgZnJvbSAnLi4vLi4vZ3JhcGhpbmdMaW5lcy5qcyc7XHJcbmltcG9ydCBHYW1lUGhhc2UgZnJvbSAnLi4vbW9kZWwvR2FtZVBoYXNlLmpzJztcclxuaW1wb3J0IExpbmVHYW1lTW9kZWwgZnJvbSAnLi4vbW9kZWwvTGluZUdhbWVNb2RlbC5qcyc7XHJcbmltcG9ydCBDaGFsbGVuZ2VOb2RlIGZyb20gJy4vQ2hhbGxlbmdlTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgU1RBVFVTX0JBUl9GT05UID0gbmV3IFBoZXRGb250KCAyMCApO1xyXG5jb25zdCBTVEFUVVNfQkFSX1RFWFRfRklMTCA9ICd3aGl0ZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBMaW5lR2FtZU1vZGVsLCBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIHZpc2libGVCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBhdWRpb1BsYXllcjogR2FtZUF1ZGlvUGxheWVyICkge1xyXG5cclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgc3RhdHVzQmFyID0gbmV3IEZpbml0ZVN0YXR1c0JhciggbGF5b3V0Qm91bmRzLCB2aXNpYmxlQm91bmRzUHJvcGVydHksIG1vZGVsLnNjb3JlUHJvcGVydHksIHtcclxuICAgICAgY3JlYXRlU2NvcmVEaXNwbGF5OiBzY29yZVByb3BlcnR5ID0+IG5ldyBTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyKCBzY29yZVByb3BlcnR5LCB7XHJcbiAgICAgICAgZm9udDogU1RBVFVTX0JBUl9GT05ULFxyXG4gICAgICAgIHRleHRGaWxsOiBTVEFUVVNfQkFSX1RFWFRfRklMTFxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyBGaW5pdGVTdGF0dXNCYXIgdXNlcyAxLWJhc2VkIGxldmVsIG51bWJlcmluZywgbW9kZWwgaXMgMC1iYXNlZCwgc2VlICM4OC5cclxuICAgICAgbGV2ZWxQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC5sZXZlbFByb3BlcnR5IF0sIGxldmVsID0+IGxldmVsICsgMSApLFxyXG4gICAgICBjaGFsbGVuZ2VJbmRleFByb3BlcnR5OiBtb2RlbC5jaGFsbGVuZ2VJbmRleFByb3BlcnR5LFxyXG4gICAgICBudW1iZXJPZkNoYWxsZW5nZXNQcm9wZXJ0eTogbW9kZWwuY2hhbGxlbmdlc1BlckdhbWVQcm9wZXJ0eSxcclxuICAgICAgZWxhcHNlZFRpbWVQcm9wZXJ0eTogbW9kZWwudGltZXIuZWxhcHNlZFRpbWVQcm9wZXJ0eSxcclxuICAgICAgdGltZXJFbmFibGVkUHJvcGVydHk6IG1vZGVsLnRpbWVyRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICBmb250OiBTVEFUVVNfQkFSX0ZPTlQsXHJcbiAgICAgIHRleHRGaWxsOiBTVEFUVVNfQkFSX1RFWFRfRklMTCxcclxuICAgICAgYmFyRmlsbDogJ3JnYiggNDksIDExNywgMjAyICknLFxyXG4gICAgICB4TWFyZ2luOiA0MCxcclxuICAgICAgc3RhcnRPdmVyQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIGJhc2VDb2xvcjogJ3JnYiggMjI5LCAyNDMsIDI1NSApJyxcclxuICAgICAgICB0ZXh0RmlsbDogJ2JsYWNrJyxcclxuICAgICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICBtb2RlbC5zZXRHYW1lUGhhc2UoIEdhbWVQaGFzZS5TRVRUSU5HUyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc3RhdHVzQmFyICk7XHJcblxyXG4gICAgLy8gY29tcHV0ZSB0aGUgc2l6ZSBvZiB0aGUgYXJlYSBhdmFpbGFibGUgZm9yIHRoZSBjaGFsbGVuZ2VzXHJcbiAgICBjb25zdCBjaGFsbGVuZ2VTaXplID0gbmV3IERpbWVuc2lvbjIoIGxheW91dEJvdW5kcy53aWR0aCwgbGF5b3V0Qm91bmRzLmhlaWdodCAtIHN0YXR1c0Jhci5ib3R0b20gKTtcclxuXHJcbiAgICAvLyBjaGFsbGVuZ2UgcGFyZW50LCB0byBrZWVwIGNoYWxsZW5nZSBiZWxvdyBzY29yZWJvYXJkXHJcbiAgICBjb25zdCBjaGFsbGVuZ2VQYXJlbnQgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAwLCAxICk7XHJcbiAgICBjaGFsbGVuZ2VQYXJlbnQudG9wID0gc3RhdHVzQmFyLmJvdHRvbTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNoYWxsZW5nZVBhcmVudCApO1xyXG5cclxuICAgIC8vIFNldCB1cCBhIG5ldyBjaGFsbGVuZ2VcclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeSBiZWNhdXNlIFBsYXlOb2RlIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0uXHJcbiAgICBsZXQgcHJldmlvdXNDaGFsbGVuZ2VOb2RlOiBDaGFsbGVuZ2VOb2RlO1xyXG4gICAgbW9kZWwuY2hhbGxlbmdlUHJvcGVydHkubGluayggY2hhbGxlbmdlID0+IHtcclxuXHJcbiAgICAgIC8vIGRpc3Bvc2Ugb2YgdmlldyBmb3IgcHJldmlvdXMgY2hhbGxlbmdlXHJcbiAgICAgIGlmICggcHJldmlvdXNDaGFsbGVuZ2VOb2RlICkge1xyXG4gICAgICAgIHByZXZpb3VzQ2hhbGxlbmdlTm9kZS5kaXNwb3NlKCk7IC8vIGhhbmRsZXMgY2hhbGxlbmdlUGFyZW50LnJlbW92ZUNoaWxkXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFkZCB2aWV3IGZvciBjdXJyZW50IGNoYWxsZW5nZVxyXG4gICAgICBjb25zdCBjaGFsbGVuZ2VOb2RlID0gY2hhbGxlbmdlLmNyZWF0ZVZpZXcoIG1vZGVsLCBjaGFsbGVuZ2VTaXplLCBhdWRpb1BsYXllciApO1xyXG4gICAgICBjaGFsbGVuZ2VQYXJlbnQuYWRkQ2hpbGQoIGNoYWxsZW5nZU5vZGUgKTtcclxuICAgICAgcHJldmlvdXNDaGFsbGVuZ2VOb2RlID0gY2hhbGxlbmdlTm9kZTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmdyYXBoaW5nTGluZXMucmVnaXN0ZXIoICdQbGF5Tm9kZScsIFBsYXlOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUdwRSxPQUFPQyxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQ25FLE9BQU9DLGVBQWUsTUFBTSx5Q0FBeUM7QUFFckUsT0FBT0MseUJBQXlCLE1BQU0sbURBQW1EO0FBQ3pGLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0MsU0FBUyxNQUFNLHVCQUF1QjtBQUk3QztBQUNBLE1BQU1DLGVBQWUsR0FBRyxJQUFJUCxRQUFRLENBQUUsRUFBRyxDQUFDO0FBQzFDLE1BQU1RLG9CQUFvQixHQUFHLE9BQU87QUFFcEMsZUFBZSxNQUFNQyxRQUFRLFNBQVNSLElBQUksQ0FBQztFQUVsQ1MsV0FBV0EsQ0FBRUMsS0FBb0IsRUFBRUMsWUFBcUIsRUFBRUMscUJBQWlELEVBQzlGQyxXQUE0QixFQUFHO0lBRWpELEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUMsU0FBUyxHQUFHLElBQUlaLGVBQWUsQ0FBRVMsWUFBWSxFQUFFQyxxQkFBcUIsRUFBRUYsS0FBSyxDQUFDSyxhQUFhLEVBQUU7TUFDL0ZDLGtCQUFrQixFQUFFRCxhQUFhLElBQUksSUFBSVoseUJBQXlCLENBQUVZLGFBQWEsRUFBRTtRQUNqRkUsSUFBSSxFQUFFWCxlQUFlO1FBQ3JCWSxRQUFRLEVBQUVYO01BQ1osQ0FBRSxDQUFDO01BRUg7TUFDQVksYUFBYSxFQUFFLElBQUl0QixlQUFlLENBQUUsQ0FBRWEsS0FBSyxDQUFDUyxhQUFhLENBQUUsRUFBRUMsS0FBSyxJQUFJQSxLQUFLLEdBQUcsQ0FBRSxDQUFDO01BQ2pGQyxzQkFBc0IsRUFBRVgsS0FBSyxDQUFDVyxzQkFBc0I7TUFDcERDLDBCQUEwQixFQUFFWixLQUFLLENBQUNhLHlCQUF5QjtNQUMzREMsbUJBQW1CLEVBQUVkLEtBQUssQ0FBQ2UsS0FBSyxDQUFDRCxtQkFBbUI7TUFDcERFLG9CQUFvQixFQUFFaEIsS0FBSyxDQUFDZ0Isb0JBQW9CO01BQ2hEVCxJQUFJLEVBQUVYLGVBQWU7TUFDckJZLFFBQVEsRUFBRVgsb0JBQW9CO01BQzlCb0IsT0FBTyxFQUFFLHFCQUFxQjtNQUM5QkMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsc0JBQXNCLEVBQUU7UUFDdEJDLFNBQVMsRUFBRSxzQkFBc0I7UUFDakNaLFFBQVEsRUFBRSxPQUFPO1FBQ2pCVSxPQUFPLEVBQUUsRUFBRTtRQUNYRyxPQUFPLEVBQUUsQ0FBQztRQUNWQyxRQUFRLEVBQUVBLENBQUEsS0FBTTtVQUNkdEIsS0FBSyxDQUFDdUIsWUFBWSxDQUFFNUIsU0FBUyxDQUFDNkIsUUFBUyxDQUFDO1FBQzFDO01BQ0Y7SUFDRixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLFFBQVEsQ0FBRXJCLFNBQVUsQ0FBQzs7SUFFMUI7SUFDQSxNQUFNc0IsYUFBYSxHQUFHLElBQUl0QyxVQUFVLENBQUVhLFlBQVksQ0FBQzBCLEtBQUssRUFBRTFCLFlBQVksQ0FBQzJCLE1BQU0sR0FBR3hCLFNBQVMsQ0FBQ3lCLE1BQU8sQ0FBQzs7SUFFbEc7SUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSXZDLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDbkR1QyxlQUFlLENBQUNDLEdBQUcsR0FBRzNCLFNBQVMsQ0FBQ3lCLE1BQU07SUFDdEMsSUFBSSxDQUFDSixRQUFRLENBQUVLLGVBQWdCLENBQUM7O0lBRWhDO0lBQ0E7SUFDQSxJQUFJRSxxQkFBb0M7SUFDeENoQyxLQUFLLENBQUNpQyxpQkFBaUIsQ0FBQ0MsSUFBSSxDQUFFQyxTQUFTLElBQUk7TUFFekM7TUFDQSxJQUFLSCxxQkFBcUIsRUFBRztRQUMzQkEscUJBQXFCLENBQUNJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNuQzs7TUFFQTtNQUNBLE1BQU1DLGFBQWEsR0FBR0YsU0FBUyxDQUFDRyxVQUFVLENBQUV0QyxLQUFLLEVBQUUwQixhQUFhLEVBQUV2QixXQUFZLENBQUM7TUFDL0UyQixlQUFlLENBQUNMLFFBQVEsQ0FBRVksYUFBYyxDQUFDO01BQ3pDTCxxQkFBcUIsR0FBR0ssYUFBYTtJQUN2QyxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUEzQyxhQUFhLENBQUM2QyxRQUFRLENBQUUsVUFBVSxFQUFFekMsUUFBUyxDQUFDIn0=