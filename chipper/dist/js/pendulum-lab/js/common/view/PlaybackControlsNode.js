// Copyright 2014-2023, University of Colorado Boulder

/**
 * Pendula system control panel node in 'Pendulum Lab' simulation.
 * Contains radio buttons to control number of pendula, play/pause and step buttons and time speed control radio buttons.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import PlayPauseButton from '../../../../scenery-phet/js/buttons/PlayPauseButton.js';
import StepForwardButton from '../../../../scenery-phet/js/buttons/StepForwardButton.js';
import { HBox, Node, Text } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import VerticalAquaRadioButtonGroup from '../../../../sun/js/VerticalAquaRadioButtonGroup.js';
import pendulumLab from '../../pendulumLab.js';
import PendulumLabStrings from '../../PendulumLabStrings.js';
import PendulumLabConstants from '../PendulumLabConstants.js';
import PendulaIcons from './PendulaIcons.js';
import StopButton from './StopButton.js';
const normalString = PendulumLabStrings.normal;
const slowMotionString = PendulumLabStrings.slowMotion;

// constants
const FONT = PendulumLabConstants.TITLE_FONT;
const RECTANGULAR_BUTTON_BASE_COLOR = 'rgb( 230, 231, 232 )';
class PlaybackControlsNode extends Node {
  /**
   * @param {Property.<number>} numberOfPendulaProperty - property to control number of pendula.
   * @param {Property.<boolean>} isPlayingProperty - property to control stream of time.
   * @param {Property.<number>} timeSpeedProperty - property to control speed of time.
   * @param {function} stepCallback - handler for step button.
   * @param {function} stopCallback - handler for stop button.
   * @param {Object} [options] for tools control panel node
   */
  constructor(numberOfPendulaProperty, isPlayingProperty, timeSpeedProperty, stepCallback, stopCallback, options) {
    const stopButton = new StopButton({
      listener: stopCallback
    });
    const pendulaCountRadioButtonGroup = new RectangularRadioButtonGroup(numberOfPendulaProperty, [{
      createNode: () => new Node({
        children: [PendulaIcons.ONE_PENDULUM_ICON]
      }),
      value: 1
    }, {
      createNode: () => new Node({
        children: [PendulaIcons.TWO_PENDULA_ICON]
      }),
      value: 2
    }], {
      spacing: 9,
      orientation: 'horizontal',
      radioButtonOptions: {
        baseColor: RECTANGULAR_BUTTON_BASE_COLOR,
        xMargin: 3,
        yMargin: 3
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: 8
    });
    const playPauseNode = new HBox({
      spacing: 10,
      children: [new PlayPauseButton(isPlayingProperty, {
        radius: 20,
        touchAreaDilation: 5
      }), new StepForwardButton({
        enabledProperty: DerivedProperty.not(isPlayingProperty),
        listener: stepCallback,
        radius: 15,
        touchAreaDilation: 5
      })]
    });
    const timeSpeedRadioNode = new VerticalAquaRadioButtonGroup(timeSpeedProperty, [{
      value: 1,
      createNode: () => new Text(normalString, {
        font: FONT
      })
    }, {
      value: 1 / 8,
      createNode: () => new Text(slowMotionString, {
        font: FONT
      })
    }], {
      spacing: 9,
      touchAreaXDilation: 10,
      radioButtonOptions: {
        radius: new Text('test', {
          font: FONT
        }).height / 2.2,
        xSpacing: 5
      },
      maxWidth: 150
    });
    stopButton.centerY = pendulaCountRadioButtonGroup.centerY = playPauseNode.centerY = timeSpeedRadioNode.centerY = 0;
    stopButton.centerX = 0;
    pendulaCountRadioButtonGroup.right = stopButton.left - 80;
    playPauseNode.left = stopButton.right + 80;
    timeSpeedRadioNode.left = playPauseNode.right + 40;
    super(merge({
      children: [stopButton, pendulaCountRadioButtonGroup, playPauseNode, timeSpeedRadioNode]
    }, options));
  }
}
pendulumLab.register('PlaybackControlsNode', PlaybackControlsNode);
export default PlaybackControlsNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJtZXJnZSIsIlBsYXlQYXVzZUJ1dHRvbiIsIlN0ZXBGb3J3YXJkQnV0dG9uIiwiSEJveCIsIk5vZGUiLCJUZXh0IiwiUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIiwiVmVydGljYWxBcXVhUmFkaW9CdXR0b25Hcm91cCIsInBlbmR1bHVtTGFiIiwiUGVuZHVsdW1MYWJTdHJpbmdzIiwiUGVuZHVsdW1MYWJDb25zdGFudHMiLCJQZW5kdWxhSWNvbnMiLCJTdG9wQnV0dG9uIiwibm9ybWFsU3RyaW5nIiwibm9ybWFsIiwic2xvd01vdGlvblN0cmluZyIsInNsb3dNb3Rpb24iLCJGT05UIiwiVElUTEVfRk9OVCIsIlJFQ1RBTkdVTEFSX0JVVFRPTl9CQVNFX0NPTE9SIiwiUGxheWJhY2tDb250cm9sc05vZGUiLCJjb25zdHJ1Y3RvciIsIm51bWJlck9mUGVuZHVsYVByb3BlcnR5IiwiaXNQbGF5aW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsInN0ZXBDYWxsYmFjayIsInN0b3BDYWxsYmFjayIsIm9wdGlvbnMiLCJzdG9wQnV0dG9uIiwibGlzdGVuZXIiLCJwZW5kdWxhQ291bnRSYWRpb0J1dHRvbkdyb3VwIiwiY3JlYXRlTm9kZSIsImNoaWxkcmVuIiwiT05FX1BFTkRVTFVNX0lDT04iLCJ2YWx1ZSIsIlRXT19QRU5EVUxBX0lDT04iLCJzcGFjaW5nIiwib3JpZW50YXRpb24iLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInBsYXlQYXVzZU5vZGUiLCJyYWRpdXMiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsImVuYWJsZWRQcm9wZXJ0eSIsIm5vdCIsInRpbWVTcGVlZFJhZGlvTm9kZSIsImZvbnQiLCJoZWlnaHQiLCJ4U3BhY2luZyIsIm1heFdpZHRoIiwiY2VudGVyWSIsImNlbnRlclgiLCJyaWdodCIsImxlZnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsYXliYWNrQ29udHJvbHNOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFBlbmR1bGEgc3lzdGVtIGNvbnRyb2wgcGFuZWwgbm9kZSBpbiAnUGVuZHVsdW0gTGFiJyBzaW11bGF0aW9uLlxyXG4gKiBDb250YWlucyByYWRpbyBidXR0b25zIHRvIGNvbnRyb2wgbnVtYmVyIG9mIHBlbmR1bGEsIHBsYXkvcGF1c2UgYW5kIHN0ZXAgYnV0dG9ucyBhbmQgdGltZSBzcGVlZCBjb250cm9sIHJhZGlvIGJ1dHRvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmV5IFplbGVua292IChNbGVhcm5lcilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQbGF5UGF1c2VCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUGxheVBhdXNlQnV0dG9uLmpzJztcclxuaW1wb3J0IFN0ZXBGb3J3YXJkQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1N0ZXBGb3J3YXJkQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgSEJveCwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1ZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgcGVuZHVsdW1MYWIgZnJvbSAnLi4vLi4vcGVuZHVsdW1MYWIuanMnO1xyXG5pbXBvcnQgUGVuZHVsdW1MYWJTdHJpbmdzIGZyb20gJy4uLy4uL1BlbmR1bHVtTGFiU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQZW5kdWx1bUxhYkNvbnN0YW50cyBmcm9tICcuLi9QZW5kdWx1bUxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQZW5kdWxhSWNvbnMgZnJvbSAnLi9QZW5kdWxhSWNvbnMuanMnO1xyXG5pbXBvcnQgU3RvcEJ1dHRvbiBmcm9tICcuL1N0b3BCdXR0b24uanMnO1xyXG5cclxuY29uc3Qgbm9ybWFsU3RyaW5nID0gUGVuZHVsdW1MYWJTdHJpbmdzLm5vcm1hbDtcclxuY29uc3Qgc2xvd01vdGlvblN0cmluZyA9IFBlbmR1bHVtTGFiU3RyaW5ncy5zbG93TW90aW9uO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IEZPTlQgPSBQZW5kdWx1bUxhYkNvbnN0YW50cy5USVRMRV9GT05UO1xyXG5jb25zdCBSRUNUQU5HVUxBUl9CVVRUT05fQkFTRV9DT0xPUiA9ICdyZ2IoIDIzMCwgMjMxLCAyMzIgKSc7XHJcblxyXG5jbGFzcyBQbGF5YmFja0NvbnRyb2xzTm9kZSBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IG51bWJlck9mUGVuZHVsYVByb3BlcnR5IC0gcHJvcGVydHkgdG8gY29udHJvbCBudW1iZXIgb2YgcGVuZHVsYS5cclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5Ljxib29sZWFuPn0gaXNQbGF5aW5nUHJvcGVydHkgLSBwcm9wZXJ0eSB0byBjb250cm9sIHN0cmVhbSBvZiB0aW1lLlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHRpbWVTcGVlZFByb3BlcnR5IC0gcHJvcGVydHkgdG8gY29udHJvbCBzcGVlZCBvZiB0aW1lLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHN0ZXBDYWxsYmFjayAtIGhhbmRsZXIgZm9yIHN0ZXAgYnV0dG9uLlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHN0b3BDYWxsYmFjayAtIGhhbmRsZXIgZm9yIHN0b3AgYnV0dG9uLlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gZm9yIHRvb2xzIGNvbnRyb2wgcGFuZWwgbm9kZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBudW1iZXJPZlBlbmR1bGFQcm9wZXJ0eSwgaXNQbGF5aW5nUHJvcGVydHksIHRpbWVTcGVlZFByb3BlcnR5LCBzdGVwQ2FsbGJhY2ssIHN0b3BDYWxsYmFjaywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBzdG9wQnV0dG9uID0gbmV3IFN0b3BCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6IHN0b3BDYWxsYmFja1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBlbmR1bGFDb3VudFJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCBudW1iZXJPZlBlbmR1bGFQcm9wZXJ0eSwgW1xyXG4gICAgICB7IGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIFBlbmR1bGFJY29ucy5PTkVfUEVORFVMVU1fSUNPTiBdIH0gKSwgdmFsdWU6IDEgfSxcclxuICAgICAgeyBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBQZW5kdWxhSWNvbnMuVFdPX1BFTkRVTEFfSUNPTiBdIH0gKSwgdmFsdWU6IDIgfVxyXG4gICAgXSwge1xyXG4gICAgICBzcGFjaW5nOiA5LFxyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBiYXNlQ29sb3I6IFJFQ1RBTkdVTEFSX0JVVFRPTl9CQVNFX0NPTE9SLFxyXG4gICAgICAgIHhNYXJnaW46IDMsXHJcbiAgICAgICAgeU1hcmdpbjogM1xyXG4gICAgICB9LFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogOFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBsYXlQYXVzZU5vZGUgPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgUGxheVBhdXNlQnV0dG9uKCBpc1BsYXlpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgcmFkaXVzOiAyMCxcclxuICAgICAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiA1XHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBTdGVwRm9yd2FyZEJ1dHRvbigge1xyXG4gICAgICAgICAgZW5hYmxlZFByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkubm90KCBpc1BsYXlpbmdQcm9wZXJ0eSApLFxyXG4gICAgICAgICAgbGlzdGVuZXI6IHN0ZXBDYWxsYmFjayxcclxuICAgICAgICAgIHJhZGl1czogMTUsXHJcbiAgICAgICAgICB0b3VjaEFyZWFEaWxhdGlvbjogNVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdGltZVNwZWVkUmFkaW9Ob2RlID0gbmV3IFZlcnRpY2FsQXF1YVJhZGlvQnV0dG9uR3JvdXAoIHRpbWVTcGVlZFByb3BlcnR5LCBbXHJcbiAgICAgIHsgdmFsdWU6IDEsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBub3JtYWxTdHJpbmcsIHsgZm9udDogRk9OVCB9ICkgfSxcclxuICAgICAgeyB2YWx1ZTogMSAvIDgsIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBzbG93TW90aW9uU3RyaW5nLCB7IGZvbnQ6IEZPTlQgfSApIH1cclxuICAgIF0sIHtcclxuICAgICAgc3BhY2luZzogOSxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAxMCxcclxuICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgcmFkaXVzOiBuZXcgVGV4dCggJ3Rlc3QnLCB7IGZvbnQ6IEZPTlQgfSApLmhlaWdodCAvIDIuMixcclxuICAgICAgICB4U3BhY2luZzogNVxyXG4gICAgICB9LFxyXG4gICAgICBtYXhXaWR0aDogMTUwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3RvcEJ1dHRvbi5jZW50ZXJZID0gcGVuZHVsYUNvdW50UmFkaW9CdXR0b25Hcm91cC5jZW50ZXJZID0gcGxheVBhdXNlTm9kZS5jZW50ZXJZID0gdGltZVNwZWVkUmFkaW9Ob2RlLmNlbnRlclkgPSAwO1xyXG4gICAgc3RvcEJ1dHRvbi5jZW50ZXJYID0gMDtcclxuICAgIHBlbmR1bGFDb3VudFJhZGlvQnV0dG9uR3JvdXAucmlnaHQgPSBzdG9wQnV0dG9uLmxlZnQgLSA4MDtcclxuICAgIHBsYXlQYXVzZU5vZGUubGVmdCA9IHN0b3BCdXR0b24ucmlnaHQgKyA4MDtcclxuICAgIHRpbWVTcGVlZFJhZGlvTm9kZS5sZWZ0ID0gcGxheVBhdXNlTm9kZS5yaWdodCArIDQwO1xyXG5cclxuICAgIHN1cGVyKCBtZXJnZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIHN0b3BCdXR0b24sXHJcbiAgICAgICAgcGVuZHVsYUNvdW50UmFkaW9CdXR0b25Hcm91cCxcclxuICAgICAgICBwbGF5UGF1c2VOb2RlLFxyXG4gICAgICAgIHRpbWVTcGVlZFJhZGlvTm9kZVxyXG4gICAgICBdXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnBlbmR1bHVtTGFiLnJlZ2lzdGVyKCAnUGxheWJhY2tDb250cm9sc05vZGUnLCBQbGF5YmFja0NvbnRyb2xzTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUGxheWJhY2tDb250cm9sc05vZGU7Il0sIm1h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