// Copyright 2021-2023, University of Colorado Boulder

/**
 * NumberPlayGameLevelSelectionNode is the user interface for level selection and other game settings in the 'Game'
 * screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { HBox, ManualConstraint, Node, Text } from '../../../../scenery/js/imports.js';
import numberPlay from '../../numberPlay.js';
import NumberPlayStrings from '../../NumberPlayStrings.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import NumberPlayGameInfoDialog from './NumberPlayGameInfoDialog.js';
import NumberPlayGameLevelSelectionButtonGroup from './NumberPlayGameLevelSelectionButtonGroup.js';
import NumberSuiteCommonConstants from '../../../../number-suite-common/js/common/NumberSuiteCommonConstants.js';

// constants
const INFO_BUTTON_SIZE = 35;
const INFO_BUTTON_MARGIN = 20;
class NumberPlayGameLevelSelectionNode extends Node {
  constructor(model, layoutBounds, resetCallback) {
    super();

    // create the info dialog, which displays info about each game
    const numberPlayGameInfoDialog = new NumberPlayGameInfoDialog(model.levels);

    // Info button, to right of 'Choose Your Game!', opens the Info dialog.
    const infoButton = new InfoButton({
      iconFill: 'rgb( 41, 106, 163 )',
      maxHeight: INFO_BUTTON_SIZE,
      listener: () => numberPlayGameInfoDialog.show()
    });

    // leave room for the info button
    const titleMaxWidth = layoutBounds.width - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X * 2 - infoButton.width * 2 - INFO_BUTTON_MARGIN * 2;

    // create and add the title text
    const titleText = new Text(NumberPlayStrings.chooseYourGameStringProperty, {
      font: new PhetFont(40),
      maxWidth: titleMaxWidth
    });
    const hBox = new HBox({
      children: [titleText, infoButton],
      spacing: INFO_BUTTON_MARGIN,
      align: 'center'
    });
    this.addChild(hBox);
    hBox.top = layoutBounds.top + 42;
    ManualConstraint.create(this, [hBox], hBox => {
      hBox.centerX = layoutBounds.centerX + (INFO_BUTTON_MARGIN + infoButton.width) / 2;
    });
    const levelSelectionButtonGroup = new NumberPlayGameLevelSelectionButtonGroup(model.levelProperty, model.levels);
    levelSelectionButtonGroup.center = layoutBounds.center;
    this.addChild(levelSelectionButtonGroup);

    // create and add reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        resetCallback();
      },
      right: layoutBounds.maxX - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X,
      bottom: layoutBounds.maxY - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y
    });
    this.addChild(resetAllButton);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberPlay.register('NumberPlayGameLevelSelectionNode', NumberPlayGameLevelSelectionNode);
export default NumberPlayGameLevelSelectionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXNldEFsbEJ1dHRvbiIsIkhCb3giLCJNYW51YWxDb25zdHJhaW50IiwiTm9kZSIsIlRleHQiLCJudW1iZXJQbGF5IiwiTnVtYmVyUGxheVN0cmluZ3MiLCJQaGV0Rm9udCIsIkluZm9CdXR0b24iLCJOdW1iZXJQbGF5R2FtZUluZm9EaWFsb2ciLCJOdW1iZXJQbGF5R2FtZUxldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAiLCJOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cyIsIklORk9fQlVUVE9OX1NJWkUiLCJJTkZPX0JVVFRPTl9NQVJHSU4iLCJOdW1iZXJQbGF5R2FtZUxldmVsU2VsZWN0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJsYXlvdXRCb3VuZHMiLCJyZXNldENhbGxiYWNrIiwibnVtYmVyUGxheUdhbWVJbmZvRGlhbG9nIiwibGV2ZWxzIiwiaW5mb0J1dHRvbiIsImljb25GaWxsIiwibWF4SGVpZ2h0IiwibGlzdGVuZXIiLCJzaG93IiwidGl0bGVNYXhXaWR0aCIsIndpZHRoIiwiU0NSRUVOX1ZJRVdfUEFERElOR19YIiwidGl0bGVUZXh0IiwiY2hvb3NlWW91ckdhbWVTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJtYXhXaWR0aCIsImhCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJhbGlnbiIsImFkZENoaWxkIiwidG9wIiwiY3JlYXRlIiwiY2VudGVyWCIsImxldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAiLCJsZXZlbFByb3BlcnR5IiwiY2VudGVyIiwicmVzZXRBbGxCdXR0b24iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyaWdodCIsIm1heFgiLCJib3R0b20iLCJtYXhZIiwiU0NSRUVOX1ZJRVdfUEFERElOR19ZIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTnVtYmVyUGxheUdhbWVMZXZlbFNlbGVjdGlvbk5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTnVtYmVyUGxheUdhbWVMZXZlbFNlbGVjdGlvbk5vZGUgaXMgdGhlIHVzZXIgaW50ZXJmYWNlIGZvciBsZXZlbCBzZWxlY3Rpb24gYW5kIG90aGVyIGdhbWUgc2V0dGluZ3MgaW4gdGhlICdHYW1lJ1xyXG4gKiBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE1hbnVhbENvbnN0cmFpbnQsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyUGxheSBmcm9tICcuLi8uLi9udW1iZXJQbGF5LmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlTdHJpbmdzIGZyb20gJy4uLy4uL051bWJlclBsYXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlHYW1lTW9kZWwgZnJvbSAnLi4vbW9kZWwvTnVtYmVyUGxheUdhbWVNb2RlbC5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgSW5mb0J1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9JbmZvQnV0dG9uLmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlHYW1lSW5mb0RpYWxvZyBmcm9tICcuL051bWJlclBsYXlHYW1lSW5mb0RpYWxvZy5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5R2FtZUxldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAgZnJvbSAnLi9OdW1iZXJQbGF5R2FtZUxldmVsU2VsZWN0aW9uQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLXN1aXRlLWNvbW1vbi9qcy9jb21tb24vTnVtYmVyU3VpdGVDb21tb25Db25zdGFudHMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElORk9fQlVUVE9OX1NJWkUgPSAzNTtcclxuY29uc3QgSU5GT19CVVRUT05fTUFSR0lOID0gMjA7XHJcblxyXG5jbGFzcyBOdW1iZXJQbGF5R2FtZUxldmVsU2VsZWN0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBOdW1iZXJQbGF5R2FtZU1vZGVsLCBsYXlvdXRCb3VuZHM6IEJvdW5kczIsIHJlc2V0Q2FsbGJhY2s6ICgpID0+IHZvaWQgKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgaW5mbyBkaWFsb2csIHdoaWNoIGRpc3BsYXlzIGluZm8gYWJvdXQgZWFjaCBnYW1lXHJcbiAgICBjb25zdCBudW1iZXJQbGF5R2FtZUluZm9EaWFsb2cgPSBuZXcgTnVtYmVyUGxheUdhbWVJbmZvRGlhbG9nKCBtb2RlbC5sZXZlbHMgKTtcclxuXHJcbiAgICAvLyBJbmZvIGJ1dHRvbiwgdG8gcmlnaHQgb2YgJ0Nob29zZSBZb3VyIEdhbWUhJywgb3BlbnMgdGhlIEluZm8gZGlhbG9nLlxyXG4gICAgY29uc3QgaW5mb0J1dHRvbiA9IG5ldyBJbmZvQnV0dG9uKCB7XHJcbiAgICAgIGljb25GaWxsOiAncmdiKCA0MSwgMTA2LCAxNjMgKScsXHJcbiAgICAgIG1heEhlaWdodDogSU5GT19CVVRUT05fU0laRSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IG51bWJlclBsYXlHYW1lSW5mb0RpYWxvZy5zaG93KClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsZWF2ZSByb29tIGZvciB0aGUgaW5mbyBidXR0b25cclxuICAgIGNvbnN0IHRpdGxlTWF4V2lkdGggPSBsYXlvdXRCb3VuZHMud2lkdGggLSBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5TQ1JFRU5fVklFV19QQURESU5HX1ggKiAyIC0gaW5mb0J1dHRvbi53aWR0aCAqIDIgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIElORk9fQlVUVE9OX01BUkdJTiAqIDI7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIHRpdGxlIHRleHRcclxuICAgIGNvbnN0IHRpdGxlVGV4dCA9IG5ldyBUZXh0KCBOdW1iZXJQbGF5U3RyaW5ncy5jaG9vc2VZb3VyR2FtZVN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggNDAgKSxcclxuICAgICAgbWF4V2lkdGg6IHRpdGxlTWF4V2lkdGhcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBoQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGl0bGVUZXh0LCBpbmZvQnV0dG9uIF0sXHJcbiAgICAgIHNwYWNpbmc6IElORk9fQlVUVE9OX01BUkdJTixcclxuICAgICAgYWxpZ246ICdjZW50ZXInXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBoQm94ICk7XHJcbiAgICBoQm94LnRvcCA9IGxheW91dEJvdW5kcy50b3AgKyA0MjtcclxuXHJcbiAgICBNYW51YWxDb25zdHJhaW50LmNyZWF0ZSggdGhpcywgWyBoQm94IF0sIGhCb3ggPT4ge1xyXG4gICAgICBoQm94LmNlbnRlclggPSBsYXlvdXRCb3VuZHMuY2VudGVyWCArICggSU5GT19CVVRUT05fTUFSR0lOICsgaW5mb0J1dHRvbi53aWR0aCApIC8gMjtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBsZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwID0gbmV3IE51bWJlclBsYXlHYW1lTGV2ZWxTZWxlY3Rpb25CdXR0b25Hcm91cCggbW9kZWwubGV2ZWxQcm9wZXJ0eSwgbW9kZWwubGV2ZWxzICk7XHJcbiAgICBsZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwLmNlbnRlciA9IGxheW91dEJvdW5kcy5jZW50ZXI7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBsZXZlbFNlbGVjdGlvbkJ1dHRvbkdyb3VwICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgcmVzZXQgYWxsIGJ1dHRvblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgaW50ZXJhY3Rpb25zIHRoYXQgbWF5IGJlIGluIHByb2dyZXNzXHJcbiAgICAgICAgcmVzZXRDYWxsYmFjaygpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogbGF5b3V0Qm91bmRzLm1heFggLSBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5TQ1JFRU5fVklFV19QQURESU5HX1gsXHJcbiAgICAgIGJvdHRvbTogbGF5b3V0Qm91bmRzLm1heFkgLSBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5TQ1JFRU5fVklFV19QQURESU5HX1lcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyUGxheS5yZWdpc3RlciggJ051bWJlclBsYXlHYW1lTGV2ZWxTZWxlY3Rpb25Ob2RlJywgTnVtYmVyUGxheUdhbWVMZXZlbFNlbGVjdGlvbk5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyUGxheUdhbWVMZXZlbFNlbGVjdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLFNBQVNDLElBQUksRUFBRUMsZ0JBQWdCLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN0RixPQUFPQyxVQUFVLE1BQU0scUJBQXFCO0FBQzVDLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUUxRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFVBQVUsTUFBTSxtREFBbUQ7QUFDMUUsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCO0FBQ3BFLE9BQU9DLHVDQUF1QyxNQUFNLDhDQUE4QztBQUNsRyxPQUFPQywwQkFBMEIsTUFBTSx5RUFBeUU7O0FBRWhIO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsRUFBRTtBQUMzQixNQUFNQyxrQkFBa0IsR0FBRyxFQUFFO0FBRTdCLE1BQU1DLGdDQUFnQyxTQUFTWCxJQUFJLENBQUM7RUFFM0NZLFdBQVdBLENBQUVDLEtBQTBCLEVBQUVDLFlBQXFCLEVBQUVDLGFBQXlCLEVBQUc7SUFDakcsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxJQUFJVix3QkFBd0IsQ0FBRU8sS0FBSyxDQUFDSSxNQUFPLENBQUM7O0lBRTdFO0lBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUliLFVBQVUsQ0FBRTtNQUNqQ2MsUUFBUSxFQUFFLHFCQUFxQjtNQUMvQkMsU0FBUyxFQUFFWCxnQkFBZ0I7TUFDM0JZLFFBQVEsRUFBRUEsQ0FBQSxLQUFNTCx3QkFBd0IsQ0FBQ00sSUFBSSxDQUFDO0lBQ2hELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLGFBQWEsR0FBR1QsWUFBWSxDQUFDVSxLQUFLLEdBQUdoQiwwQkFBMEIsQ0FBQ2lCLHFCQUFxQixHQUFHLENBQUMsR0FBR1AsVUFBVSxDQUFDTSxLQUFLLEdBQUcsQ0FBQyxHQUNoR2Qsa0JBQWtCLEdBQUcsQ0FBQzs7SUFFNUM7SUFDQSxNQUFNZ0IsU0FBUyxHQUFHLElBQUl6QixJQUFJLENBQUVFLGlCQUFpQixDQUFDd0IsNEJBQTRCLEVBQUU7TUFDMUVDLElBQUksRUFBRSxJQUFJeEIsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QnlCLFFBQVEsRUFBRU47SUFDWixDQUFFLENBQUM7SUFFSCxNQUFNTyxJQUFJLEdBQUcsSUFBSWhDLElBQUksQ0FBRTtNQUNyQmlDLFFBQVEsRUFBRSxDQUFFTCxTQUFTLEVBQUVSLFVBQVUsQ0FBRTtNQUNuQ2MsT0FBTyxFQUFFdEIsa0JBQWtCO01BQzNCdUIsS0FBSyxFQUFFO0lBQ1QsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDQyxRQUFRLENBQUVKLElBQUssQ0FBQztJQUNyQkEsSUFBSSxDQUFDSyxHQUFHLEdBQUdyQixZQUFZLENBQUNxQixHQUFHLEdBQUcsRUFBRTtJQUVoQ3BDLGdCQUFnQixDQUFDcUMsTUFBTSxDQUFFLElBQUksRUFBRSxDQUFFTixJQUFJLENBQUUsRUFBRUEsSUFBSSxJQUFJO01BQy9DQSxJQUFJLENBQUNPLE9BQU8sR0FBR3ZCLFlBQVksQ0FBQ3VCLE9BQU8sR0FBRyxDQUFFM0Isa0JBQWtCLEdBQUdRLFVBQVUsQ0FBQ00sS0FBSyxJQUFLLENBQUM7SUFDckYsQ0FBRSxDQUFDO0lBRUgsTUFBTWMseUJBQXlCLEdBQUcsSUFBSS9CLHVDQUF1QyxDQUFFTSxLQUFLLENBQUMwQixhQUFhLEVBQUUxQixLQUFLLENBQUNJLE1BQU8sQ0FBQztJQUNsSHFCLHlCQUF5QixDQUFDRSxNQUFNLEdBQUcxQixZQUFZLENBQUMwQixNQUFNO0lBQ3RELElBQUksQ0FBQ04sUUFBUSxDQUFFSSx5QkFBMEIsQ0FBQzs7SUFFMUM7SUFDQSxNQUFNRyxjQUFjLEdBQUcsSUFBSTVDLGNBQWMsQ0FBRTtNQUN6Q3dCLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2QsSUFBSSxDQUFDcUIscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIzQixhQUFhLENBQUMsQ0FBQztNQUNqQixDQUFDO01BQ0Q0QixLQUFLLEVBQUU3QixZQUFZLENBQUM4QixJQUFJLEdBQUdwQywwQkFBMEIsQ0FBQ2lCLHFCQUFxQjtNQUMzRW9CLE1BQU0sRUFBRS9CLFlBQVksQ0FBQ2dDLElBQUksR0FBR3RDLDBCQUEwQixDQUFDdUM7SUFDekQsQ0FBRSxDQUFDO0lBQ0gsSUFBSSxDQUFDYixRQUFRLENBQUVPLGNBQWUsQ0FBQztFQUNqQztFQUVnQk8sT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUE5QyxVQUFVLENBQUNnRCxRQUFRLENBQUUsa0NBQWtDLEVBQUV2QyxnQ0FBaUMsQ0FBQztBQUMzRixlQUFlQSxnQ0FBZ0MifQ==