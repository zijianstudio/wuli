// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for the 'Solve It!' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Node } from '../../../../scenery/js/imports.js';
import Easing from '../../../../twixt/js/Easing.js';
import TransitionNode from '../../../../twixt/js/TransitionNode.js';
import GameAudioPlayer from '../../../../vegas/js/GameAudioPlayer.js';
import EqualityExplorerConstants from '../../common/EqualityExplorerConstants.js';
import equalityExplorer from '../../equalityExplorer.js';
import SolveItLevelSelectionNode from './SolveItLevelSelectionNode.js';
import SolveItLevelNode from './SolveItLevelNode.js';

// constants
const TRANSITION_OPTIONS = {
  duration: 0.5,
  // sec
  targetOptions: {
    easing: Easing.QUADRATIC_IN_OUT
  }
};
export default class SolveItScreenView extends ScreenView {
  // State of the Snapshots accordion box is global to the Screen. Expanding it in one game level expands it in
  // all game levels. See https://github.com/phetsims/equality-explorer/issues/124

  // a Node for each level of the game

  // Handles the animated 'slide' transition between level-selection and game levels

  constructor(model, tandem) {
    const options = {
      layoutBounds: EqualityExplorerConstants.SCREEN_VIEW_LAYOUT_BOUNDS,
      preventFit: EqualityExplorerConstants.SCREEN_VIEW_PREVENT_FIT,
      tandem: tandem
    };
    super(options);
    this.snapshotsAccordionBoxExpandedProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('snapshotsAccordionBoxExpandedProperty'),
      phetioDocumentation: 'Applies to the "Snapshots" accordion box for all game levels'
    });
    const gameAudioPlayer = new GameAudioPlayer();

    // UI for level selection and other game settings
    const levelSelectionNode = new SolveItLevelSelectionNode(model, this.layoutBounds, {
      resetCallback: () => {
        model.reset();
        this.reset();
      },
      tandem: options.tandem.createTandem('levelSelectionNode')
    });

    // Nodes for levels, organized under a parent tandem
    const levelNodesTandem = options.tandem.createTandem('levelNodes');
    this.levelNodes = model.levels.map(level => new SolveItLevelNode(level, model.levelProperty, model.rewardScoreProperty, this.layoutBounds, this.visibleBoundsProperty, this.snapshotsAccordionBoxExpandedProperty, gameAudioPlayer, {
      visibleProperty: new DerivedProperty([model.levelProperty], selectedLevel => level === selectedLevel),
      tandem: levelNodesTandem.createTandem(`${level.tandem.name}Node`)
    }));
    const levelsParent = new Node({
      children: this.levelNodes
    });

    // Transition (slide left/right) between level-selection UI and the selected game level.
    this.transitionNode = new TransitionNode(this.visibleBoundsProperty, {
      //TODO https://github.com/phetsims/equality-explorer/issues/197 stateful animation?
      cachedNodes: [levelSelectionNode, levelsParent],
      content: levelSelectionNode
    });
    this.addChild(this.transitionNode);
    model.levelProperty.link((level, previousLevel) => {
      // If the selected level doesn't have an associated challenge, create one.
      if (level !== null && !level.challengeProperty.value) {
        level.nextChallenge();
      }
      if (previousLevel === null && level !== null) {
        // Start the transition from the level-selection UI (null) to the selected game level.
        this.transitionNode.slideLeftTo(levelsParent, TRANSITION_OPTIONS);
      } else if (previousLevel !== null && level === null) {
        // Start the transition from the selected game level to the level-selection UI (null).
        this.transitionNode.slideRightTo(levelSelectionNode, TRANSITION_OPTIONS);
      } else {
        // No transition. This can only happen via PhET-iO, by changing levelProperty.
        levelSelectionNode.visible = level === null;
        levelsParent.visible = level !== null;
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.snapshotsAccordionBoxExpandedProperty.reset();
    for (let i = 0; i < this.levelNodes.length; i++) {
      this.levelNodes[i].reset();
    }
  }

  /**
   * @param dt - elapsed time, in seconds
   */
  step(dt) {
    super.step(dt);

    // animate the transition between level-selection and challenge UI
    this.transitionNode.step(dt);

    // animate the view for the selected level
    for (let i = 0; i < this.levelNodes.length; i++) {
      const levelNode = this.levelNodes[i];
      if (levelNode.visible) {
        levelNode.step && levelNode.step(dt);
        break;
      }
    }
  }
}
equalityExplorer.register('SolveItScreenView', SolveItScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJTY3JlZW5WaWV3IiwiTm9kZSIsIkVhc2luZyIsIlRyYW5zaXRpb25Ob2RlIiwiR2FtZUF1ZGlvUGxheWVyIiwiRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyIsImVxdWFsaXR5RXhwbG9yZXIiLCJTb2x2ZUl0TGV2ZWxTZWxlY3Rpb25Ob2RlIiwiU29sdmVJdExldmVsTm9kZSIsIlRSQU5TSVRJT05fT1BUSU9OUyIsImR1cmF0aW9uIiwidGFyZ2V0T3B0aW9ucyIsImVhc2luZyIsIlFVQURSQVRJQ19JTl9PVVQiLCJTb2x2ZUl0U2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJvcHRpb25zIiwibGF5b3V0Qm91bmRzIiwiU0NSRUVOX1ZJRVdfTEFZT1VUX0JPVU5EUyIsInByZXZlbnRGaXQiLCJTQ1JFRU5fVklFV19QUkVWRU5UX0ZJVCIsInNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiZ2FtZUF1ZGlvUGxheWVyIiwibGV2ZWxTZWxlY3Rpb25Ob2RlIiwicmVzZXRDYWxsYmFjayIsInJlc2V0IiwibGV2ZWxOb2Rlc1RhbmRlbSIsImxldmVsTm9kZXMiLCJsZXZlbHMiLCJtYXAiLCJsZXZlbCIsImxldmVsUHJvcGVydHkiLCJyZXdhcmRTY29yZVByb3BlcnR5IiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwidmlzaWJsZVByb3BlcnR5Iiwic2VsZWN0ZWRMZXZlbCIsIm5hbWUiLCJsZXZlbHNQYXJlbnQiLCJjaGlsZHJlbiIsInRyYW5zaXRpb25Ob2RlIiwiY2FjaGVkTm9kZXMiLCJjb250ZW50IiwiYWRkQ2hpbGQiLCJsaW5rIiwicHJldmlvdXNMZXZlbCIsImNoYWxsZW5nZVByb3BlcnR5IiwidmFsdWUiLCJuZXh0Q2hhbGxlbmdlIiwic2xpZGVMZWZ0VG8iLCJzbGlkZVJpZ2h0VG8iLCJ2aXNpYmxlIiwiZGlzcG9zZSIsImFzc2VydCIsImkiLCJsZW5ndGgiLCJzdGVwIiwiZHQiLCJsZXZlbE5vZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbHZlSXRTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFZpZXcgZm9yIHRoZSAnU29sdmUgSXQhJyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEVhc2luZyBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9FYXNpbmcuanMnO1xyXG5pbXBvcnQgVHJhbnNpdGlvbk5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvVHJhbnNpdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgR2FtZUF1ZGlvUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3ZlZ2FzL2pzL0dhbWVBdWRpb1BsYXllci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9FcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBTb2x2ZUl0TW9kZWwgZnJvbSAnLi4vbW9kZWwvU29sdmVJdE1vZGVsLmpzJztcclxuaW1wb3J0IFNvbHZlSXRMZXZlbFNlbGVjdGlvbk5vZGUgZnJvbSAnLi9Tb2x2ZUl0TGV2ZWxTZWxlY3Rpb25Ob2RlLmpzJztcclxuaW1wb3J0IFNvbHZlSXRMZXZlbE5vZGUgZnJvbSAnLi9Tb2x2ZUl0TGV2ZWxOb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBUUkFOU0lUSU9OX09QVElPTlMgPSB7XHJcbiAgZHVyYXRpb246IDAuNSwgLy8gc2VjXHJcbiAgdGFyZ2V0T3B0aW9uczoge1xyXG4gICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbHZlSXRTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8vIFN0YXRlIG9mIHRoZSBTbmFwc2hvdHMgYWNjb3JkaW9uIGJveCBpcyBnbG9iYWwgdG8gdGhlIFNjcmVlbi4gRXhwYW5kaW5nIGl0IGluIG9uZSBnYW1lIGxldmVsIGV4cGFuZHMgaXQgaW5cclxuICAvLyBhbGwgZ2FtZSBsZXZlbHMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzEyNFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc25hcHNob3RzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIGEgTm9kZSBmb3IgZWFjaCBsZXZlbCBvZiB0aGUgZ2FtZVxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGV2ZWxOb2RlczogU29sdmVJdExldmVsTm9kZVtdO1xyXG5cclxuICAvLyBIYW5kbGVzIHRoZSBhbmltYXRlZCAnc2xpZGUnIHRyYW5zaXRpb24gYmV0d2VlbiBsZXZlbC1zZWxlY3Rpb24gYW5kIGdhbWUgbGV2ZWxzXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0cmFuc2l0aW9uTm9kZTogVHJhbnNpdGlvbk5vZGU7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFNvbHZlSXRNb2RlbCwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLlNDUkVFTl9WSUVXX0xBWU9VVF9CT1VORFMsXHJcbiAgICAgIHByZXZlbnRGaXQ6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuU0NSRUVOX1ZJRVdfUFJFVkVOVF9GSVQsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9O1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQXBwbGllcyB0byB0aGUgXCJTbmFwc2hvdHNcIiBhY2NvcmRpb24gYm94IGZvciBhbGwgZ2FtZSBsZXZlbHMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZ2FtZUF1ZGlvUGxheWVyID0gbmV3IEdhbWVBdWRpb1BsYXllcigpO1xyXG5cclxuICAgIC8vIFVJIGZvciBsZXZlbCBzZWxlY3Rpb24gYW5kIG90aGVyIGdhbWUgc2V0dGluZ3NcclxuICAgIGNvbnN0IGxldmVsU2VsZWN0aW9uTm9kZSA9IG5ldyBTb2x2ZUl0TGV2ZWxTZWxlY3Rpb25Ob2RlKCBtb2RlbCwgdGhpcy5sYXlvdXRCb3VuZHMsIHtcclxuICAgICAgcmVzZXRDYWxsYmFjazogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xldmVsU2VsZWN0aW9uTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE5vZGVzIGZvciBsZXZlbHMsIG9yZ2FuaXplZCB1bmRlciBhIHBhcmVudCB0YW5kZW1cclxuICAgIGNvbnN0IGxldmVsTm9kZXNUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZXZlbE5vZGVzJyApO1xyXG4gICAgdGhpcy5sZXZlbE5vZGVzID0gbW9kZWwubGV2ZWxzLm1hcCggbGV2ZWwgPT4gbmV3IFNvbHZlSXRMZXZlbE5vZGUoIGxldmVsLCBtb2RlbC5sZXZlbFByb3BlcnR5LCBtb2RlbC5yZXdhcmRTY29yZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcywgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHRoaXMuc25hcHNob3RzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSwgZ2FtZUF1ZGlvUGxheWVyLCB7XHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG1vZGVsLmxldmVsUHJvcGVydHkgXSwgc2VsZWN0ZWRMZXZlbCA9PiAoIGxldmVsID09PSBzZWxlY3RlZExldmVsICkgKSxcclxuICAgICAgICB0YW5kZW06IGxldmVsTm9kZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCBgJHtsZXZlbC50YW5kZW0ubmFtZX1Ob2RlYCApXHJcbiAgICAgIH0gKSApO1xyXG4gICAgY29uc3QgbGV2ZWxzUGFyZW50ID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IHRoaXMubGV2ZWxOb2Rlc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRyYW5zaXRpb24gKHNsaWRlIGxlZnQvcmlnaHQpIGJldHdlZW4gbGV2ZWwtc2VsZWN0aW9uIFVJIGFuZCB0aGUgc2VsZWN0ZWQgZ2FtZSBsZXZlbC5cclxuICAgIHRoaXMudHJhbnNpdGlvbk5vZGUgPSBuZXcgVHJhbnNpdGlvbk5vZGUoIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCB7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE5NyBzdGF0ZWZ1bCBhbmltYXRpb24/XHJcbiAgICAgIGNhY2hlZE5vZGVzOiBbIGxldmVsU2VsZWN0aW9uTm9kZSwgbGV2ZWxzUGFyZW50IF0sXHJcbiAgICAgIGNvbnRlbnQ6IGxldmVsU2VsZWN0aW9uTm9kZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50cmFuc2l0aW9uTm9kZSApO1xyXG5cclxuICAgIG1vZGVsLmxldmVsUHJvcGVydHkubGluayggKCBsZXZlbCwgcHJldmlvdXNMZXZlbCApID0+IHtcclxuXHJcbiAgICAgIC8vIElmIHRoZSBzZWxlY3RlZCBsZXZlbCBkb2Vzbid0IGhhdmUgYW4gYXNzb2NpYXRlZCBjaGFsbGVuZ2UsIGNyZWF0ZSBvbmUuXHJcbiAgICAgIGlmICggbGV2ZWwgIT09IG51bGwgJiYgIWxldmVsLmNoYWxsZW5nZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIGxldmVsLm5leHRDaGFsbGVuZ2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBwcmV2aW91c0xldmVsID09PSBudWxsICYmIGxldmVsICE9PSBudWxsICkge1xyXG5cclxuICAgICAgICAvLyBTdGFydCB0aGUgdHJhbnNpdGlvbiBmcm9tIHRoZSBsZXZlbC1zZWxlY3Rpb24gVUkgKG51bGwpIHRvIHRoZSBzZWxlY3RlZCBnYW1lIGxldmVsLlxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbk5vZGUuc2xpZGVMZWZ0VG8oIGxldmVsc1BhcmVudCwgVFJBTlNJVElPTl9PUFRJT05TICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHByZXZpb3VzTGV2ZWwgIT09IG51bGwgJiYgbGV2ZWwgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0IHRoZSB0cmFuc2l0aW9uIGZyb20gdGhlIHNlbGVjdGVkIGdhbWUgbGV2ZWwgdG8gdGhlIGxldmVsLXNlbGVjdGlvbiBVSSAobnVsbCkuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uTm9kZS5zbGlkZVJpZ2h0VG8oIGxldmVsU2VsZWN0aW9uTm9kZSwgVFJBTlNJVElPTl9PUFRJT05TICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIE5vIHRyYW5zaXRpb24uIFRoaXMgY2FuIG9ubHkgaGFwcGVuIHZpYSBQaEVULWlPLCBieSBjaGFuZ2luZyBsZXZlbFByb3BlcnR5LlxyXG4gICAgICAgIGxldmVsU2VsZWN0aW9uTm9kZS52aXNpYmxlID0gKCBsZXZlbCA9PT0gbnVsbCApO1xyXG4gICAgICAgIGxldmVsc1BhcmVudC52aXNpYmxlID0gKCBsZXZlbCAhPT0gbnVsbCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxldmVsTm9kZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMubGV2ZWxOb2Rlc1sgaSBdLnJlc2V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZHQgLSBlbGFwc2VkIHRpbWUsIGluIHNlY29uZHNcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBzdXBlci5zdGVwKCBkdCApO1xyXG5cclxuICAgIC8vIGFuaW1hdGUgdGhlIHRyYW5zaXRpb24gYmV0d2VlbiBsZXZlbC1zZWxlY3Rpb24gYW5kIGNoYWxsZW5nZSBVSVxyXG4gICAgdGhpcy50cmFuc2l0aW9uTm9kZS5zdGVwKCBkdCApO1xyXG5cclxuICAgIC8vIGFuaW1hdGUgdGhlIHZpZXcgZm9yIHRoZSBzZWxlY3RlZCBsZXZlbFxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5sZXZlbE5vZGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBsZXZlbE5vZGUgPSB0aGlzLmxldmVsTm9kZXNbIGkgXTtcclxuICAgICAgaWYgKCBsZXZlbE5vZGUudmlzaWJsZSApIHtcclxuICAgICAgICBsZXZlbE5vZGUuc3RlcCAmJiBsZXZlbE5vZGUuc3RlcCggZHQgKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ1NvbHZlSXRTY3JlZW5WaWV3JywgU29sdmVJdFNjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBRXBFLE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUV4RCxPQUFPQyxN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