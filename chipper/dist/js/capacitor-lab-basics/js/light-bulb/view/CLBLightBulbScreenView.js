// Copyright 2015-2022, University of Colorado Boulder

/**
 * ScreenView for "Light Bulb" screen of Capacitor Lab: Basics.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { AlignGroup, Color, HBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import capacitorLabBasics from '../../capacitorLabBasics.js';
import BarMeterPanel from '../../common/view/BarMeterPanel.js';
import CLBViewControlPanel from '../../common/view/control/CLBViewControlPanel.js';
import ToolboxPanel from '../../common/view/control/ToolboxPanel.js';
import DebugLayer from '../../common/view/DebugLayer.js';
import VoltmeterNode from '../../common/view/meters/VoltmeterNode.js';
import LightBulbCircuitNode from './LightBulbCircuitNode.js';
class CLBLightBulbScreenView extends ScreenView {
  /**
   * @param {CLBLightBulbModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // @private {YawPitchModelViewTransform3}
    this.modelViewTransform = model.modelViewTransform;

    // @private {CLBLightBulbModel}
    this.model = model;

    // @private {LightBulbCircuitNode} Circuit
    this.lightBulbCircuitNode = new LightBulbCircuitNode(model, tandem.createTandem('lightBulbCircuitNode'));

    // meters
    const barMeterPanel = new BarMeterPanel(model, tandem.createTandem('barMeterPanel'));
    const voltmeterNode = new VoltmeterNode(model.voltmeter, this.modelViewTransform, model.voltmeterVisibleProperty, tandem.createTandem('voltmeterNode'));

    // @public {StopwatchNode}
    const stopwatchNode = new StopwatchNode(model.stopwatch, {
      numberDisplayOptions: {
        numberFormatter: StopwatchNode.createRichTextNumberFormatter({
          showAsMinutesAndSeconds: true,
          numberOfDecimalPlaces: 1
        })
      },
      dragBoundsProperty: this.visibleBoundsProperty,
      tandem: Tandem.OPT_OUT,
      // TODO(phet-io): this seems like it should not opt out, since it has interactive components
      dragListenerOptions: {
        end: () => {
          // When a node is released, check if it is over the toolbox.  If so, drop it in.
          if (toolboxPanel.bounds.intersectsBounds(stopwatchNode.bounds)) {
            model.stopwatch.reset();
          }
        }
      }
    });
    this.addChild(stopwatchNode);

    // @public {AlignGroup}
    this.rightPanelAlignGroup = new AlignGroup({
      matchVertical: false,
      minWidth: 350
    });
    const toolboxPanel = new ToolboxPanel(stopwatchNode, voltmeterNode, this.modelViewTransform, model.voltmeter.isDraggedProperty, model.stopwatch, model.voltmeterVisibleProperty, tandem.createTandem('toolboxPanel'), {
      alignGroup: this.rightPanelAlignGroup
    });

    // View control panel and voltmeter panel
    const viewControlPanel = new CLBViewControlPanel(model, tandem.createTandem('viewControlPanel'), {
      maxTextWidth: 200,
      alignGroup: this.rightPanelAlignGroup
    });
    viewControlPanel.rightTop = this.layoutBounds.rightTop.plus(new Vector2(-10, 10));
    toolboxPanel.rightTop = viewControlPanel.rightBottom.plus(new Vector2(0, 10));

    // Circuit bar meter panel
    barMeterPanel.left = this.lightBulbCircuitNode.topWireNode.left - 40;
    barMeterPanel.top = this.layoutBounds.top + 10;
    const timeControlPanel = new Panel(new TimeControlNode(model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => {
            model.manualStep();
          }
        }
      },
      tandem: tandem.createTandem('timeControlNode')
    }), {
      xMargin: 15,
      yMargin: 15,
      stroke: null,
      fill: new Color(255, 255, 255, 0.6),
      tandem: tandem.createTandem('timeControlPanel')
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
      },
      radius: 25,
      tandem: tandem.createTandem('resetAllButton')
    });
    const simControlHBox = new HBox({
      children: [timeControlPanel, resetAllButton],
      spacing: 50,
      bottom: this.layoutBounds.bottom - 20,
      right: this.layoutBounds.right - 30
    });

    // rendering order
    this.addChild(this.lightBulbCircuitNode);
    this.addChild(simControlHBox);
    this.addChild(barMeterPanel);
    this.addChild(viewControlPanel);
    this.addChild(toolboxPanel);
    this.addChild(voltmeterNode);
    this.addChild(new DebugLayer(model));
  }
}
capacitorLabBasics.register('CLBLightBulbScreenView', CLBLightBulbScreenView);
export default CLBLightBulbScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIlJlc2V0QWxsQnV0dG9uIiwiU3RvcHdhdGNoTm9kZSIsIlRpbWVDb250cm9sTm9kZSIsIkFsaWduR3JvdXAiLCJDb2xvciIsIkhCb3giLCJQYW5lbCIsIlRhbmRlbSIsImNhcGFjaXRvckxhYkJhc2ljcyIsIkJhck1ldGVyUGFuZWwiLCJDTEJWaWV3Q29udHJvbFBhbmVsIiwiVG9vbGJveFBhbmVsIiwiRGVidWdMYXllciIsIlZvbHRtZXRlck5vZGUiLCJMaWdodEJ1bGJDaXJjdWl0Tm9kZSIsIkNMQkxpZ2h0QnVsYlNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwibGlnaHRCdWxiQ2lyY3VpdE5vZGUiLCJjcmVhdGVUYW5kZW0iLCJiYXJNZXRlclBhbmVsIiwidm9sdG1ldGVyTm9kZSIsInZvbHRtZXRlciIsInZvbHRtZXRlclZpc2libGVQcm9wZXJ0eSIsInN0b3B3YXRjaE5vZGUiLCJzdG9wd2F0Y2giLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsIm51bWJlckZvcm1hdHRlciIsImNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyIiwic2hvd0FzTWludXRlc0FuZFNlY29uZHMiLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJPUFRfT1VUIiwiZHJhZ0xpc3RlbmVyT3B0aW9ucyIsImVuZCIsInRvb2xib3hQYW5lbCIsImJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJyZXNldCIsImFkZENoaWxkIiwicmlnaHRQYW5lbEFsaWduR3JvdXAiLCJtYXRjaFZlcnRpY2FsIiwibWluV2lkdGgiLCJpc0RyYWdnZWRQcm9wZXJ0eSIsImFsaWduR3JvdXAiLCJ2aWV3Q29udHJvbFBhbmVsIiwibWF4VGV4dFdpZHRoIiwicmlnaHRUb3AiLCJsYXlvdXRCb3VuZHMiLCJwbHVzIiwicmlnaHRCb3R0b20iLCJsZWZ0IiwidG9wV2lyZU5vZGUiLCJ0b3AiLCJ0aW1lQ29udHJvbFBhbmVsIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsInBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zIiwic3RlcEZvcndhcmRCdXR0b25PcHRpb25zIiwibGlzdGVuZXIiLCJtYW51YWxTdGVwIiwieE1hcmdpbiIsInlNYXJnaW4iLCJzdHJva2UiLCJmaWxsIiwicmVzZXRBbGxCdXR0b24iLCJyYWRpdXMiLCJzaW1Db250cm9sSEJveCIsImNoaWxkcmVuIiwic3BhY2luZyIsImJvdHRvbSIsInJpZ2h0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDTEJMaWdodEJ1bGJTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgZm9yIFwiTGlnaHQgQnVsYlwiIHNjcmVlbiBvZiBDYXBhY2l0b3IgTGFiOiBCYXNpY3MuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBTdG9wd2F0Y2hOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2hOb2RlLmpzJztcclxuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IHsgQWxpZ25Hcm91cCwgQ29sb3IsIEhCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGNhcGFjaXRvckxhYkJhc2ljcyBmcm9tICcuLi8uLi9jYXBhY2l0b3JMYWJCYXNpY3MuanMnO1xyXG5pbXBvcnQgQmFyTWV0ZXJQYW5lbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9CYXJNZXRlclBhbmVsLmpzJztcclxuaW1wb3J0IENMQlZpZXdDb250cm9sUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvY29udHJvbC9DTEJWaWV3Q29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFRvb2xib3hQYW5lbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9jb250cm9sL1Rvb2xib3hQYW5lbC5qcyc7XHJcbmltcG9ydCBEZWJ1Z0xheWVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0RlYnVnTGF5ZXIuanMnO1xyXG5pbXBvcnQgVm9sdG1ldGVyTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9tZXRlcnMvVm9sdG1ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCBMaWdodEJ1bGJDaXJjdWl0Tm9kZSBmcm9tICcuL0xpZ2h0QnVsYkNpcmN1aXROb2RlLmpzJztcclxuXHJcbmNsYXNzIENMQkxpZ2h0QnVsYlNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDTEJMaWdodEJ1bGJNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHsgdGFuZGVtOiB0YW5kZW0gfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtZYXdQaXRjaE1vZGVsVmlld1RyYW5zZm9ybTN9XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q0xCTGlnaHRCdWxiTW9kZWx9XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0xpZ2h0QnVsYkNpcmN1aXROb2RlfSBDaXJjdWl0XHJcbiAgICB0aGlzLmxpZ2h0QnVsYkNpcmN1aXROb2RlID0gbmV3IExpZ2h0QnVsYkNpcmN1aXROb2RlKCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpZ2h0QnVsYkNpcmN1aXROb2RlJyApICk7XHJcblxyXG4gICAgLy8gbWV0ZXJzXHJcbiAgICBjb25zdCBiYXJNZXRlclBhbmVsID0gbmV3IEJhck1ldGVyUGFuZWwoIG1vZGVsLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmFyTWV0ZXJQYW5lbCcgKSApO1xyXG4gICAgY29uc3Qgdm9sdG1ldGVyTm9kZSA9IG5ldyBWb2x0bWV0ZXJOb2RlKCBtb2RlbC52b2x0bWV0ZXIsIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLCBtb2RlbC52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2b2x0bWV0ZXJOb2RlJyApICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7U3RvcHdhdGNoTm9kZX1cclxuICAgIGNvbnN0IHN0b3B3YXRjaE5vZGUgPSBuZXcgU3RvcHdhdGNoTm9kZSggbW9kZWwuc3RvcHdhdGNoLCB7XHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgbnVtYmVyRm9ybWF0dGVyOiBTdG9wd2F0Y2hOb2RlLmNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyKCB7XHJcbiAgICAgICAgICBzaG93QXNNaW51dGVzQW5kU2Vjb25kczogdHJ1ZSxcclxuICAgICAgICAgIG51bWJlck9mRGVjaW1hbFBsYWNlczogMVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9LFxyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VULCAvLyBUT0RPKHBoZXQtaW8pOiB0aGlzIHNlZW1zIGxpa2UgaXQgc2hvdWxkIG5vdCBvcHQgb3V0LCBzaW5jZSBpdCBoYXMgaW50ZXJhY3RpdmUgY29tcG9uZW50c1xyXG4gICAgICBkcmFnTGlzdGVuZXJPcHRpb25zOiB7XHJcbiAgICAgICAgZW5kOiAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgLy8gV2hlbiBhIG5vZGUgaXMgcmVsZWFzZWQsIGNoZWNrIGlmIGl0IGlzIG92ZXIgdGhlIHRvb2xib3guICBJZiBzbywgZHJvcCBpdCBpbi5cclxuICAgICAgICAgIGlmICggdG9vbGJveFBhbmVsLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBzdG9wd2F0Y2hOb2RlLmJvdW5kcyApICkge1xyXG4gICAgICAgICAgICBtb2RlbC5zdG9wd2F0Y2gucmVzZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN0b3B3YXRjaE5vZGUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtBbGlnbkdyb3VwfVxyXG4gICAgdGhpcy5yaWdodFBhbmVsQWxpZ25Hcm91cCA9IG5ldyBBbGlnbkdyb3VwKCB7IG1hdGNoVmVydGljYWw6IGZhbHNlLCBtaW5XaWR0aDogMzUwIH0gKTtcclxuXHJcbiAgICBjb25zdCB0b29sYm94UGFuZWwgPSBuZXcgVG9vbGJveFBhbmVsKFxyXG4gICAgICBzdG9wd2F0Y2hOb2RlLFxyXG4gICAgICB2b2x0bWV0ZXJOb2RlLFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgbW9kZWwudm9sdG1ldGVyLmlzRHJhZ2dlZFByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5zdG9wd2F0Y2gsXHJcbiAgICAgIG1vZGVsLnZvbHRtZXRlclZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Rvb2xib3hQYW5lbCcgKSwge1xyXG4gICAgICAgIGFsaWduR3JvdXA6IHRoaXMucmlnaHRQYW5lbEFsaWduR3JvdXBcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBWaWV3IGNvbnRyb2wgcGFuZWwgYW5kIHZvbHRtZXRlciBwYW5lbFxyXG4gICAgY29uc3Qgdmlld0NvbnRyb2xQYW5lbCA9IG5ldyBDTEJWaWV3Q29udHJvbFBhbmVsKCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXdDb250cm9sUGFuZWwnICksIHtcclxuICAgICAgbWF4VGV4dFdpZHRoOiAyMDAsXHJcbiAgICAgIGFsaWduR3JvdXA6IHRoaXMucmlnaHRQYW5lbEFsaWduR3JvdXBcclxuICAgIH0gKTtcclxuICAgIHZpZXdDb250cm9sUGFuZWwucmlnaHRUb3AgPSB0aGlzLmxheW91dEJvdW5kcy5yaWdodFRvcC5wbHVzKCBuZXcgVmVjdG9yMiggLTEwLCAxMCApICk7XHJcbiAgICB0b29sYm94UGFuZWwucmlnaHRUb3AgPSB2aWV3Q29udHJvbFBhbmVsLnJpZ2h0Qm90dG9tLnBsdXMoIG5ldyBWZWN0b3IyKCAwLCAxMCApICk7XHJcblxyXG4gICAgLy8gQ2lyY3VpdCBiYXIgbWV0ZXIgcGFuZWxcclxuICAgIGJhck1ldGVyUGFuZWwubGVmdCA9IHRoaXMubGlnaHRCdWxiQ2lyY3VpdE5vZGUudG9wV2lyZU5vZGUubGVmdCAtIDQwO1xyXG4gICAgYmFyTWV0ZXJQYW5lbC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy50b3AgKyAxMDtcclxuXHJcbiAgICBjb25zdCB0aW1lQ29udHJvbFBhbmVsID0gbmV3IFBhbmVsKCBuZXcgVGltZUNvbnRyb2xOb2RlKCBtb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSwge1xyXG4gICAgICB0aW1lU3BlZWRQcm9wZXJ0eTogbW9kZWwudGltZVNwZWVkUHJvcGVydHksXHJcbiAgICAgIHBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc3RlcEZvcndhcmRCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4geyBtb2RlbC5tYW51YWxTdGVwKCk7IH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVDb250cm9sTm9kZScgKVxyXG4gICAgfSApLCB7XHJcbiAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICB5TWFyZ2luOiAxNSxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICBmaWxsOiBuZXcgQ29sb3IoIDI1NSwgMjU1LCAyNTUsIDAuNiApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbFBhbmVsJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByYWRpdXM6IDI1LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNpbUNvbnRyb2xIQm94ID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICB0aW1lQ29udHJvbFBhbmVsLFxyXG4gICAgICAgIHJlc2V0QWxsQnV0dG9uXHJcbiAgICAgIF0sXHJcbiAgICAgIHNwYWNpbmc6IDUwLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIDIwLFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSAzMFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5saWdodEJ1bGJDaXJjdWl0Tm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2ltQ29udHJvbEhCb3ggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJhck1ldGVyUGFuZWwgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHZpZXdDb250cm9sUGFuZWwgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRvb2xib3hQYW5lbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdm9sdG1ldGVyTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IERlYnVnTGF5ZXIoIG1vZGVsICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNhcGFjaXRvckxhYkJhc2ljcy5yZWdpc3RlciggJ0NMQkxpZ2h0QnVsYlNjcmVlblZpZXcnLCBDTEJMaWdodEJ1bGJTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IENMQkxpZ2h0QnVsYlNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLFNBQVNDLFVBQVUsRUFBRUMsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzNFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Ms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