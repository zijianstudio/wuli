// Copyright 2021-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Game' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import numberPlay from '../../numberPlay.js';
import NumberPlayGameLevelSelectionNode from './NumberPlayGameLevelSelectionNode.js';
import SubitizeGameLevelNode from './SubitizeGameLevelNode.js';
import CountingGameLevelNode from './CountingGameLevelNode.js';
import NumberPlayGameLevel from '../model/NumberPlayGameLevel.js';
import SubitizeGameLevel from '../model/SubitizeGameLevel.js';
import NumberPlayGameRewardNode from './NumberPlayGameRewardNode.js';
import NumberPlayGameRewardDialog from './NumberPlayGameRewardDialog.js';

// constants
const TRANSITION_OPTIONS = {
  duration: 0.5,
  // seconds
  targetOptions: {
    easing: Easing.QUADRATIC_IN_OUT
  }
};
class NumberPlayGameScreenView extends ScreenView {
  // store all level nodes in one place for easy iteration

  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // create the level selection node
    const levelSelectionNode = new NumberPlayGameLevelSelectionNode(model, this.layoutBounds, () => {
      model.reset();
      this.reset();
    });
    this.rewardNode = new NumberPlayGameRewardNode();

    // Dialog that is displayed when the score reaches the reward value.
    const rewardDialog = new NumberPlayGameRewardDialog(model.levelProperty, this.rewardNode, NumberPlayGameLevel.REWARD_SCORE);

    // create the level nodes for the 'Counting' game
    const countingLevelNodes = model.countingLevels.map(level => new CountingGameLevelNode(level, model.levelProperty, rewardDialog, this.layoutBounds, this.visibleBoundsProperty));

    // create the level nodes for the 'Subitize' game
    const subitizeLevelNodes = model.subitizeLevels.map(level => new SubitizeGameLevelNode(level, model.levelProperty, rewardDialog, this.layoutBounds, this.visibleBoundsProperty));
    this.levelNodes = [...countingLevelNodes, ...subitizeLevelNodes];

    // create the transitionNode which handles the animated slide transition between levelSelectionNode and a level
    const transitionNode = new TransitionNode(this.visibleBoundsProperty, {
      content: levelSelectionNode,
      cachedNodes: [levelSelectionNode, ...this.levelNodes]
    });

    // transition between the levelSelectionNode and the selected level when the model changes. if levelProperty has a
    // null value, then no level is selected and levelSelectionNode will be displayed.
    model.levelProperty.lazyLink(level => {
      this.interruptSubtreeInput();
      if (level) {
        const selectedLevelNode = _.find(this.levelNodes, levelNode => levelNode.level === level);

        // if navigating to a level that's in an unsolved state, load a new challenge
        if (!level.isChallengeSolvedProperty.value) {
          // if the selected level is for the subitize game, load a new challenge by resetting the start sequence
          if (level instanceof SubitizeGameLevel) {
            level.subitizer.resetStartSequence();
          } else {
            // otherwise load a new challenge the standard way (new challenge directly, with no start sequence)
            selectedLevelNode.newChallenge();
          }
        }

        // transition to the selected level
        transitionNode.slideLeftTo(selectedLevelNode, TRANSITION_OPTIONS);
      } else {
        // selected level was null, so transition to levelSelectionNode
        transitionNode.slideRightTo(levelSelectionNode, TRANSITION_OPTIONS);
      }
    });
    this.addChild(transitionNode);
    this.addChild(this.rewardNode);
  }
  step(dt) {
    this.rewardNode.visible && this.rewardNode.step(dt);
  }
  reset() {
    this.levelNodes.forEach(levelNode => levelNode.reset());
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberPlay.register('NumberPlayGameScreenView', NumberPlayGameScreenView);
export default NumberPlayGameScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiRWFzaW5nIiwiVHJhbnNpdGlvbk5vZGUiLCJudW1iZXJQbGF5IiwiTnVtYmVyUGxheUdhbWVMZXZlbFNlbGVjdGlvbk5vZGUiLCJTdWJpdGl6ZUdhbWVMZXZlbE5vZGUiLCJDb3VudGluZ0dhbWVMZXZlbE5vZGUiLCJOdW1iZXJQbGF5R2FtZUxldmVsIiwiU3ViaXRpemVHYW1lTGV2ZWwiLCJOdW1iZXJQbGF5R2FtZVJld2FyZE5vZGUiLCJOdW1iZXJQbGF5R2FtZVJld2FyZERpYWxvZyIsIlRSQU5TSVRJT05fT1BUSU9OUyIsImR1cmF0aW9uIiwidGFyZ2V0T3B0aW9ucyIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJOdW1iZXJQbGF5R2FtZVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwibGV2ZWxTZWxlY3Rpb25Ob2RlIiwibGF5b3V0Qm91bmRzIiwicmVzZXQiLCJyZXdhcmROb2RlIiwicmV3YXJkRGlhbG9nIiwibGV2ZWxQcm9wZXJ0eSIsIlJFV0FSRF9TQ09SRSIsImNvdW50aW5nTGV2ZWxOb2RlcyIsImNvdW50aW5nTGV2ZWxzIiwibWFwIiwibGV2ZWwiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJzdWJpdGl6ZUxldmVsTm9kZXMiLCJzdWJpdGl6ZUxldmVscyIsImxldmVsTm9kZXMiLCJ0cmFuc2l0aW9uTm9kZSIsImNvbnRlbnQiLCJjYWNoZWROb2RlcyIsImxhenlMaW5rIiwiaW50ZXJydXB0U3VidHJlZUlucHV0Iiwic2VsZWN0ZWRMZXZlbE5vZGUiLCJfIiwiZmluZCIsImxldmVsTm9kZSIsImlzQ2hhbGxlbmdlU29sdmVkUHJvcGVydHkiLCJ2YWx1ZSIsInN1Yml0aXplciIsInJlc2V0U3RhcnRTZXF1ZW5jZSIsIm5ld0NoYWxsZW5nZSIsInNsaWRlTGVmdFRvIiwic2xpZGVSaWdodFRvIiwiYWRkQ2hpbGQiLCJzdGVwIiwiZHQiLCJ2aXNpYmxlIiwiZm9yRWFjaCIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51bWJlclBsYXlHYW1lU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY3JlZW5WaWV3IGZvciB0aGUgJ0dhbWUnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEx1aXNhIFZhcmdhc1xyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBUcmFuc2l0aW9uTm9kZSBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9UcmFuc2l0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBudW1iZXJQbGF5IGZyb20gJy4uLy4uL251bWJlclBsYXkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGxheUdhbWVNb2RlbCBmcm9tICcuLi9tb2RlbC9OdW1iZXJQbGF5R2FtZU1vZGVsLmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlHYW1lTGV2ZWxTZWxlY3Rpb25Ob2RlIGZyb20gJy4vTnVtYmVyUGxheUdhbWVMZXZlbFNlbGVjdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgU3ViaXRpemVHYW1lTGV2ZWxOb2RlIGZyb20gJy4vU3ViaXRpemVHYW1lTGV2ZWxOb2RlLmpzJztcclxuaW1wb3J0IENvdW50aW5nR2FtZUxldmVsTm9kZSBmcm9tICcuL0NvdW50aW5nR2FtZUxldmVsTm9kZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5R2FtZUxldmVsTm9kZSBmcm9tICcuL051bWJlclBsYXlHYW1lTGV2ZWxOb2RlLmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlHYW1lTGV2ZWwgZnJvbSAnLi4vbW9kZWwvTnVtYmVyUGxheUdhbWVMZXZlbC5qcyc7XHJcbmltcG9ydCBTdWJpdGl6ZUdhbWVMZXZlbCBmcm9tICcuLi9tb2RlbC9TdWJpdGl6ZUdhbWVMZXZlbC5qcyc7XHJcbmltcG9ydCBOdW1iZXJQbGF5R2FtZVJld2FyZE5vZGUgZnJvbSAnLi9OdW1iZXJQbGF5R2FtZVJld2FyZE5vZGUuanMnO1xyXG5pbXBvcnQgTnVtYmVyUGxheUdhbWVSZXdhcmREaWFsb2cgZnJvbSAnLi9OdW1iZXJQbGF5R2FtZVJld2FyZERpYWxvZy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVFJBTlNJVElPTl9PUFRJT05TID0ge1xyXG4gIGR1cmF0aW9uOiAwLjUsIC8vIHNlY29uZHNcclxuICB0YXJnZXRPcHRpb25zOiB7XHJcbiAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgfVxyXG59O1xyXG5cclxuY2xhc3MgTnVtYmVyUGxheUdhbWVTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8vIHN0b3JlIGFsbCBsZXZlbCBub2RlcyBpbiBvbmUgcGxhY2UgZm9yIGVhc3kgaXRlcmF0aW9uXHJcbiAgcHJpdmF0ZSByZWFkb25seSBsZXZlbE5vZGVzOiBBcnJheTxOdW1iZXJQbGF5R2FtZUxldmVsTm9kZTxOdW1iZXJQbGF5R2FtZUxldmVsPj47XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmV3YXJkTm9kZTogTnVtYmVyUGxheUdhbWVSZXdhcmROb2RlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBOdW1iZXJQbGF5R2FtZU1vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgbGV2ZWwgc2VsZWN0aW9uIG5vZGVcclxuICAgIGNvbnN0IGxldmVsU2VsZWN0aW9uTm9kZSA9IG5ldyBOdW1iZXJQbGF5R2FtZUxldmVsU2VsZWN0aW9uTm9kZSggbW9kZWwsIHRoaXMubGF5b3V0Qm91bmRzLCAoKSA9PiB7XHJcbiAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJld2FyZE5vZGUgPSBuZXcgTnVtYmVyUGxheUdhbWVSZXdhcmROb2RlKCk7XHJcblxyXG4gICAgLy8gRGlhbG9nIHRoYXQgaXMgZGlzcGxheWVkIHdoZW4gdGhlIHNjb3JlIHJlYWNoZXMgdGhlIHJld2FyZCB2YWx1ZS5cclxuICAgIGNvbnN0IHJld2FyZERpYWxvZyA9IG5ldyBOdW1iZXJQbGF5R2FtZVJld2FyZERpYWxvZyggbW9kZWwubGV2ZWxQcm9wZXJ0eSwgdGhpcy5yZXdhcmROb2RlLCBOdW1iZXJQbGF5R2FtZUxldmVsLlJFV0FSRF9TQ09SRSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgbGV2ZWwgbm9kZXMgZm9yIHRoZSAnQ291bnRpbmcnIGdhbWVcclxuICAgIGNvbnN0IGNvdW50aW5nTGV2ZWxOb2RlcyA9IG1vZGVsLmNvdW50aW5nTGV2ZWxzLm1hcCggbGV2ZWwgPT5cclxuICAgICAgbmV3IENvdW50aW5nR2FtZUxldmVsTm9kZSggbGV2ZWwsIG1vZGVsLmxldmVsUHJvcGVydHksIHJld2FyZERpYWxvZywgdGhpcy5sYXlvdXRCb3VuZHMsIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5ICkgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGxldmVsIG5vZGVzIGZvciB0aGUgJ1N1Yml0aXplJyBnYW1lXHJcbiAgICBjb25zdCBzdWJpdGl6ZUxldmVsTm9kZXMgPSBtb2RlbC5zdWJpdGl6ZUxldmVscy5tYXAoIGxldmVsID0+XHJcbiAgICAgIG5ldyBTdWJpdGl6ZUdhbWVMZXZlbE5vZGUoIGxldmVsLCBtb2RlbC5sZXZlbFByb3BlcnR5LCByZXdhcmREaWFsb2csIHRoaXMubGF5b3V0Qm91bmRzLCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSApICk7XHJcblxyXG4gICAgdGhpcy5sZXZlbE5vZGVzID0gWyAuLi5jb3VudGluZ0xldmVsTm9kZXMsIC4uLnN1Yml0aXplTGV2ZWxOb2RlcyBdO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgdHJhbnNpdGlvbk5vZGUgd2hpY2ggaGFuZGxlcyB0aGUgYW5pbWF0ZWQgc2xpZGUgdHJhbnNpdGlvbiBiZXR3ZWVuIGxldmVsU2VsZWN0aW9uTm9kZSBhbmQgYSBsZXZlbFxyXG4gICAgY29uc3QgdHJhbnNpdGlvbk5vZGUgPSBuZXcgVHJhbnNpdGlvbk5vZGUoIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCB7XHJcbiAgICAgIGNvbnRlbnQ6IGxldmVsU2VsZWN0aW9uTm9kZSxcclxuICAgICAgY2FjaGVkTm9kZXM6IFsgbGV2ZWxTZWxlY3Rpb25Ob2RlLCAuLi50aGlzLmxldmVsTm9kZXMgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRyYW5zaXRpb24gYmV0d2VlbiB0aGUgbGV2ZWxTZWxlY3Rpb25Ob2RlIGFuZCB0aGUgc2VsZWN0ZWQgbGV2ZWwgd2hlbiB0aGUgbW9kZWwgY2hhbmdlcy4gaWYgbGV2ZWxQcm9wZXJ0eSBoYXMgYVxyXG4gICAgLy8gbnVsbCB2YWx1ZSwgdGhlbiBubyBsZXZlbCBpcyBzZWxlY3RlZCBhbmQgbGV2ZWxTZWxlY3Rpb25Ob2RlIHdpbGwgYmUgZGlzcGxheWVkLlxyXG4gICAgbW9kZWwubGV2ZWxQcm9wZXJ0eS5sYXp5TGluayggbGV2ZWwgPT4ge1xyXG4gICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG5cclxuICAgICAgaWYgKCBsZXZlbCApIHtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZExldmVsTm9kZSA9IF8uZmluZCggdGhpcy5sZXZlbE5vZGVzLCBsZXZlbE5vZGUgPT4gKCBsZXZlbE5vZGUubGV2ZWwgPT09IGxldmVsICkgKSE7XHJcblxyXG4gICAgICAgIC8vIGlmIG5hdmlnYXRpbmcgdG8gYSBsZXZlbCB0aGF0J3MgaW4gYW4gdW5zb2x2ZWQgc3RhdGUsIGxvYWQgYSBuZXcgY2hhbGxlbmdlXHJcbiAgICAgICAgaWYgKCAhbGV2ZWwuaXNDaGFsbGVuZ2VTb2x2ZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgICAgICAvLyBpZiB0aGUgc2VsZWN0ZWQgbGV2ZWwgaXMgZm9yIHRoZSBzdWJpdGl6ZSBnYW1lLCBsb2FkIGEgbmV3IGNoYWxsZW5nZSBieSByZXNldHRpbmcgdGhlIHN0YXJ0IHNlcXVlbmNlXHJcbiAgICAgICAgICBpZiAoIGxldmVsIGluc3RhbmNlb2YgU3ViaXRpemVHYW1lTGV2ZWwgKSB7XHJcbiAgICAgICAgICAgIGxldmVsLnN1Yml0aXplci5yZXNldFN0YXJ0U2VxdWVuY2UoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIGxvYWQgYSBuZXcgY2hhbGxlbmdlIHRoZSBzdGFuZGFyZCB3YXkgKG5ldyBjaGFsbGVuZ2UgZGlyZWN0bHksIHdpdGggbm8gc3RhcnQgc2VxdWVuY2UpXHJcbiAgICAgICAgICAgIHNlbGVjdGVkTGV2ZWxOb2RlLm5ld0NoYWxsZW5nZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdHJhbnNpdGlvbiB0byB0aGUgc2VsZWN0ZWQgbGV2ZWxcclxuICAgICAgICB0cmFuc2l0aW9uTm9kZS5zbGlkZUxlZnRUbyggc2VsZWN0ZWRMZXZlbE5vZGUsIFRSQU5TSVRJT05fT1BUSU9OUyApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBzZWxlY3RlZCBsZXZlbCB3YXMgbnVsbCwgc28gdHJhbnNpdGlvbiB0byBsZXZlbFNlbGVjdGlvbk5vZGVcclxuICAgICAgICB0cmFuc2l0aW9uTm9kZS5zbGlkZVJpZ2h0VG8oIGxldmVsU2VsZWN0aW9uTm9kZSwgVFJBTlNJVElPTl9PUFRJT05TICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0cmFuc2l0aW9uTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZXdhcmROb2RlICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMucmV3YXJkTm9kZS52aXNpYmxlICYmIHRoaXMucmV3YXJkTm9kZS5zdGVwKCBkdCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5sZXZlbE5vZGVzLmZvckVhY2goIGxldmVsTm9kZSA9PiBsZXZlbE5vZGUucmVzZXQoKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlclBsYXkucmVnaXN0ZXIoICdOdW1iZXJQbGF5R2FtZVNjcmVlblZpZXcnLCBOdW1iZXJQbGF5R2FtZVNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgTnVtYmVyUGxheUdhbWVTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxvQ0FBb0M7QUFFM0QsT0FBT0MsTUFBTSxNQUFNLGdDQUFnQztBQUNuRCxPQUFPQyxjQUFjLE1BQU0sd0NBQXdDO0FBQ25FLE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFF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