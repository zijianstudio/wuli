// Copyright 2014-2023, University of Colorado Boulder

/**
 * Main ScreenView node that contains all other nodes.
 *
 * @author Andrey Zelenkov (Mlearner)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import { Node, Plane, VBox } from '../../../../scenery/js/imports.js';
import ClosestDragForwardingListener from '../../../../sun/js/ClosestDragForwardingListener.js';
import pendulumLab from '../../pendulumLab.js';
import PendulumLabConstants from '../PendulumLabConstants.js';
import GlobalControlPanel from './GlobalControlPanel.js';
import PendulaNode from './PendulaNode.js';
import PendulumControlPanel from './PendulumControlPanel.js';
import PendulumLabProtractorNode from './PendulumLabProtractorNode.js';
import PendulumLabRulerNode from './PendulumLabRulerNode.js';
import PeriodTraceNode from './PeriodTraceNode.js';
import PlaybackControlsNode from './PlaybackControlsNode.js';
import ToolsPanel from './ToolsPanel.js';
class PendulumLabScreenView extends ScreenView {
  /**
   * @param {PendulumLabModel} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    super();

    // @private {PendulumLabModel}
    this.model = model;
    options = merge({
      hasGravityTweakers: false,
      hasPeriodTimer: false
    }, options);
    const modelViewTransform = PendulumLabConstants.MODEL_VIEW_TRANSFORM;
    const pendulaNode = new PendulaNode(model.pendula, modelViewTransform, {
      isAccelerationVisibleProperty: model.isAccelerationVisibleProperty,
      isVelocityVisibleProperty: model.isVelocityVisibleProperty
    });

    // create drag listener for the pendula
    const backgroundDragNode = new Plane();
    const dragListener = new ClosestDragForwardingListener(0.15, 0); // 15cm from mass is OK for touch
    pendulaNode.draggableItems.forEach(draggableItem => {
      dragListener.addDraggableItem(draggableItem);
    });
    backgroundDragNode.addInputListener(dragListener);

    // @private {PeriodTraceNode}
    this.firstPeriodTraceNode = new PeriodTraceNode(model.pendula[0], modelViewTransform);
    this.secondPeriodTraceNode = new PeriodTraceNode(model.pendula[1], modelViewTransform);

    // create protractor node
    const protractorNode = new PendulumLabProtractorNode(model.pendula, modelViewTransform);

    // create a node to keep track of combo box
    const popupLayer = new Node();
    const pendulumControlPanel = new PendulumControlPanel(model.pendula, model.numberOfPendulaProperty);
    const globalControlPanel = new GlobalControlPanel(model, popupLayer, !!options.hasGravityTweakers);

    // @protected
    this.rightPanelsContainer = new VBox({
      spacing: PendulumLabConstants.PANEL_PADDING,
      children: [pendulumControlPanel, globalControlPanel],
      right: this.layoutBounds.right - PendulumLabConstants.PANEL_PADDING,
      top: this.layoutBounds.top + PendulumLabConstants.PANEL_PADDING
    });

    // create tools control panel (which controls the visibility of the ruler and stopwatch)
    const toolsControlPanelNode = new ToolsPanel(model.ruler.isVisibleProperty, model.stopwatch.isVisibleProperty, model.isPeriodTraceVisibleProperty, options.hasPeriodTimer, {
      maxWidth: 180,
      left: this.layoutBounds.left + PendulumLabConstants.PANEL_PADDING,
      bottom: this.layoutBounds.bottom - PendulumLabConstants.PANEL_PADDING
    });

    // @protected {Node}
    this.toolsControlPanelNode = toolsControlPanelNode;

    // create pendulum system control panel (controls the length and mass of the pendula)
    const playbackControls = new PlaybackControlsNode(model.numberOfPendulaProperty, model.isPlayingProperty, model.timeSpeedProperty, model.stepManual.bind(model), model.returnPendula.bind(model), {
      x: this.layoutBounds.centerX,
      bottom: this.layoutBounds.bottom - PendulumLabConstants.PANEL_PADDING
    });

    // create reset all button
    const resetAllButton = new ResetAllButton({
      listener: model.reset.bind(model),
      right: this.layoutBounds.right - PendulumLabConstants.PANEL_PADDING,
      bottom: this.layoutBounds.bottom - PendulumLabConstants.PANEL_PADDING
    });

    // create ruler node
    const rulerNode = new PendulumLabRulerNode(model.ruler, modelViewTransform, this.layoutBounds);
    rulerNode.left = this.layoutBounds.left + PendulumLabConstants.PANEL_PADDING;
    rulerNode.top = this.layoutBounds.top + PendulumLabConstants.PANEL_PADDING;
    model.ruler.setInitialPositionValue(rulerNode.center);

    // @protected
    this.rulerNode = rulerNode;

    // create timer node
    const stopwatchNode = new StopwatchNode(model.stopwatch, {
      dragBoundsProperty: this.visibleBoundsProperty
    });

    // @protected
    this.stopwatchNode = stopwatchNode;
    this.setStopwatchInitialPosition();

    // @protected
    this.arrowsPanelLayer = new Node();
    this.energyGraphLayer = new Node();
    this.periodTimerLayer = new Node();
    const leftFloatingLayer = new Node({
      children: [this.energyGraphLayer, this.arrowsPanelLayer, toolsControlPanelNode]
    });
    const rightFloatingLayer = new Node({
      children: [this.rightPanelsContainer, resetAllButton, popupLayer]
    });

    // Layout for https://github.com/phetsims/pendulum-lab/issues/98
    this.visibleBoundsProperty.lazyLink(visibleBounds => {
      let dx = -visibleBounds.x;
      dx = Math.min(200, dx);
      leftFloatingLayer.x = -dx;
      rightFloatingLayer.x = dx;
      // set the drag bounds of the ruler
      rulerNode.dragListener.dragBounds.set(visibleBounds.erodedXY(rulerNode.width / 2, rulerNode.height / 2));
    });
    this.children = [backgroundDragNode, protractorNode, leftFloatingLayer, rightFloatingLayer, playbackControls, this.firstPeriodTraceNode, this.secondPeriodTraceNode, pendulaNode, rulerNode, this.periodTimerLayer, stopwatchNode];
  }

  /**
   * Position the stopwatch next to the ruler.
   * @protected
   */
  setStopwatchInitialPosition() {
    const stopwatchInitialPosition = new Vector2(this.rulerNode.right + 10, this.rulerNode.bottom - this.stopwatchNode.height);
    this.model.stopwatch.positionProperty.value = stopwatchInitialPosition;
    this.model.stopwatch.positionProperty.setInitialValue(stopwatchInitialPosition);
  }

  /**
   * Steps the view.
   * @public
   *
   * @param {number} dt
   */
  step(dt) {
    if (this.model.isPlayingProperty.value) {
      this.firstPeriodTraceNode.step(dt);
      this.secondPeriodTraceNode.step(dt);
    }
  }
}
pendulumLab.register('PendulumLabScreenView', PendulumLabScreenView);
export default PendulumLabScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwiUmVzZXRBbGxCdXR0b24iLCJTdG9wd2F0Y2hOb2RlIiwiTm9kZSIsIlBsYW5lIiwiVkJveCIsIkNsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyIiwicGVuZHVsdW1MYWIiLCJQZW5kdWx1bUxhYkNvbnN0YW50cyIsIkdsb2JhbENvbnRyb2xQYW5lbCIsIlBlbmR1bGFOb2RlIiwiUGVuZHVsdW1Db250cm9sUGFuZWwiLCJQZW5kdWx1bUxhYlByb3RyYWN0b3JOb2RlIiwiUGVuZHVsdW1MYWJSdWxlck5vZGUiLCJQZXJpb2RUcmFjZU5vZGUiLCJQbGF5YmFja0NvbnRyb2xzTm9kZSIsIlRvb2xzUGFuZWwiLCJQZW5kdWx1bUxhYlNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwib3B0aW9ucyIsImhhc0dyYXZpdHlUd2Vha2VycyIsImhhc1BlcmlvZFRpbWVyIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiTU9ERUxfVklFV19UUkFOU0ZPUk0iLCJwZW5kdWxhTm9kZSIsInBlbmR1bGEiLCJpc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eSIsImlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHkiLCJiYWNrZ3JvdW5kRHJhZ05vZGUiLCJkcmFnTGlzdGVuZXIiLCJkcmFnZ2FibGVJdGVtcyIsImZvckVhY2giLCJkcmFnZ2FibGVJdGVtIiwiYWRkRHJhZ2dhYmxlSXRlbSIsImFkZElucHV0TGlzdGVuZXIiLCJmaXJzdFBlcmlvZFRyYWNlTm9kZSIsInNlY29uZFBlcmlvZFRyYWNlTm9kZSIsInByb3RyYWN0b3JOb2RlIiwicG9wdXBMYXllciIsInBlbmR1bHVtQ29udHJvbFBhbmVsIiwibnVtYmVyT2ZQZW5kdWxhUHJvcGVydHkiLCJnbG9iYWxDb250cm9sUGFuZWwiLCJyaWdodFBhbmVsc0NvbnRhaW5lciIsInNwYWNpbmciLCJQQU5FTF9QQURESU5HIiwiY2hpbGRyZW4iLCJyaWdodCIsImxheW91dEJvdW5kcyIsInRvcCIsInRvb2xzQ29udHJvbFBhbmVsTm9kZSIsInJ1bGVyIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJzdG9wd2F0Y2giLCJpc1BlcmlvZFRyYWNlVmlzaWJsZVByb3BlcnR5IiwibWF4V2lkdGgiLCJsZWZ0IiwiYm90dG9tIiwicGxheWJhY2tDb250cm9scyIsImlzUGxheWluZ1Byb3BlcnR5IiwidGltZVNwZWVkUHJvcGVydHkiLCJzdGVwTWFudWFsIiwiYmluZCIsInJldHVyblBlbmR1bGEiLCJ4IiwiY2VudGVyWCIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJyZXNldCIsInJ1bGVyTm9kZSIsInNldEluaXRpYWxQb3NpdGlvblZhbHVlIiwiY2VudGVyIiwic3RvcHdhdGNoTm9kZSIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInNldFN0b3B3YXRjaEluaXRpYWxQb3NpdGlvbiIsImFycm93c1BhbmVsTGF5ZXIiLCJlbmVyZ3lHcmFwaExheWVyIiwicGVyaW9kVGltZXJMYXllciIsImxlZnRGbG9hdGluZ0xheWVyIiwicmlnaHRGbG9hdGluZ0xheWVyIiwibGF6eUxpbmsiLCJ2aXNpYmxlQm91bmRzIiwiZHgiLCJNYXRoIiwibWluIiwiZHJhZ0JvdW5kcyIsInNldCIsImVyb2RlZFhZIiwid2lkdGgiLCJoZWlnaHQiLCJzdG9wd2F0Y2hJbml0aWFsUG9zaXRpb24iLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJzZXRJbml0aWFsVmFsdWUiLCJzdGVwIiwiZHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBlbmR1bHVtTGFiU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNYWluIFNjcmVlblZpZXcgbm9kZSB0aGF0IGNvbnRhaW5zIGFsbCBvdGhlciBub2Rlcy5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoTm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFBsYW5lLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DbG9zZXN0RHJhZ0ZvcndhcmRpbmdMaXN0ZW5lci5qcyc7XHJcbmltcG9ydCBwZW5kdWx1bUxhYiBmcm9tICcuLi8uLi9wZW5kdWx1bUxhYi5qcyc7XHJcbmltcG9ydCBQZW5kdWx1bUxhYkNvbnN0YW50cyBmcm9tICcuLi9QZW5kdWx1bUxhYkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBHbG9iYWxDb250cm9sUGFuZWwgZnJvbSAnLi9HbG9iYWxDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgUGVuZHVsYU5vZGUgZnJvbSAnLi9QZW5kdWxhTm9kZS5qcyc7XHJcbmltcG9ydCBQZW5kdWx1bUNvbnRyb2xQYW5lbCBmcm9tICcuL1BlbmR1bHVtQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiUHJvdHJhY3Rvck5vZGUgZnJvbSAnLi9QZW5kdWx1bUxhYlByb3RyYWN0b3JOb2RlLmpzJztcclxuaW1wb3J0IFBlbmR1bHVtTGFiUnVsZXJOb2RlIGZyb20gJy4vUGVuZHVsdW1MYWJSdWxlck5vZGUuanMnO1xyXG5pbXBvcnQgUGVyaW9kVHJhY2VOb2RlIGZyb20gJy4vUGVyaW9kVHJhY2VOb2RlLmpzJztcclxuaW1wb3J0IFBsYXliYWNrQ29udHJvbHNOb2RlIGZyb20gJy4vUGxheWJhY2tDb250cm9sc05vZGUuanMnO1xyXG5pbXBvcnQgVG9vbHNQYW5lbCBmcm9tICcuL1Rvb2xzUGFuZWwuanMnO1xyXG5cclxuY2xhc3MgUGVuZHVsdW1MYWJTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UGVuZHVsdW1MYWJNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UGVuZHVsdW1MYWJNb2RlbH1cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaGFzR3Jhdml0eVR3ZWFrZXJzOiBmYWxzZSxcclxuICAgICAgaGFzUGVyaW9kVGltZXI6IGZhbHNlXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gUGVuZHVsdW1MYWJDb25zdGFudHMuTU9ERUxfVklFV19UUkFOU0ZPUk07XHJcblxyXG4gICAgY29uc3QgcGVuZHVsYU5vZGUgPSBuZXcgUGVuZHVsYU5vZGUoIG1vZGVsLnBlbmR1bGEsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBpc0FjY2VsZXJhdGlvblZpc2libGVQcm9wZXJ0eTogbW9kZWwuaXNBY2NlbGVyYXRpb25WaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIGlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHk6IG1vZGVsLmlzVmVsb2NpdHlWaXNpYmxlUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgZHJhZyBsaXN0ZW5lciBmb3IgdGhlIHBlbmR1bGFcclxuICAgIGNvbnN0IGJhY2tncm91bmREcmFnTm9kZSA9IG5ldyBQbGFuZSgpO1xyXG4gICAgY29uc3QgZHJhZ0xpc3RlbmVyID0gbmV3IENsb3Nlc3REcmFnRm9yd2FyZGluZ0xpc3RlbmVyKCAwLjE1LCAwICk7IC8vIDE1Y20gZnJvbSBtYXNzIGlzIE9LIGZvciB0b3VjaFxyXG4gICAgcGVuZHVsYU5vZGUuZHJhZ2dhYmxlSXRlbXMuZm9yRWFjaCggZHJhZ2dhYmxlSXRlbSA9PiB7XHJcbiAgICAgIGRyYWdMaXN0ZW5lci5hZGREcmFnZ2FibGVJdGVtKCBkcmFnZ2FibGVJdGVtICk7XHJcbiAgICB9ICk7XHJcbiAgICBiYWNrZ3JvdW5kRHJhZ05vZGUuYWRkSW5wdXRMaXN0ZW5lciggZHJhZ0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1BlcmlvZFRyYWNlTm9kZX1cclxuICAgIHRoaXMuZmlyc3RQZXJpb2RUcmFjZU5vZGUgPSBuZXcgUGVyaW9kVHJhY2VOb2RlKCBtb2RlbC5wZW5kdWxhWyAwIF0sIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgdGhpcy5zZWNvbmRQZXJpb2RUcmFjZU5vZGUgPSBuZXcgUGVyaW9kVHJhY2VOb2RlKCBtb2RlbC5wZW5kdWxhWyAxIF0sIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBwcm90cmFjdG9yIG5vZGVcclxuICAgIGNvbnN0IHByb3RyYWN0b3JOb2RlID0gbmV3IFBlbmR1bHVtTGFiUHJvdHJhY3Rvck5vZGUoIG1vZGVsLnBlbmR1bGEsIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIG5vZGUgdG8ga2VlcCB0cmFjayBvZiBjb21ibyBib3hcclxuICAgIGNvbnN0IHBvcHVwTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIGNvbnN0IHBlbmR1bHVtQ29udHJvbFBhbmVsID0gbmV3IFBlbmR1bHVtQ29udHJvbFBhbmVsKCBtb2RlbC5wZW5kdWxhLCBtb2RlbC5udW1iZXJPZlBlbmR1bGFQcm9wZXJ0eSApO1xyXG4gICAgY29uc3QgZ2xvYmFsQ29udHJvbFBhbmVsID0gbmV3IEdsb2JhbENvbnRyb2xQYW5lbCggbW9kZWwsIHBvcHVwTGF5ZXIsICEhb3B0aW9ucy5oYXNHcmF2aXR5VHdlYWtlcnMgKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkXHJcbiAgICB0aGlzLnJpZ2h0UGFuZWxzQ29udGFpbmVyID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfUEFERElORyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBwZW5kdWx1bUNvbnRyb2xQYW5lbCxcclxuICAgICAgICBnbG9iYWxDb250cm9sUGFuZWxcclxuICAgICAgXSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfUEFERElORyxcclxuICAgICAgdG9wOiB0aGlzLmxheW91dEJvdW5kcy50b3AgKyBQZW5kdWx1bUxhYkNvbnN0YW50cy5QQU5FTF9QQURESU5HXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRvb2xzIGNvbnRyb2wgcGFuZWwgKHdoaWNoIGNvbnRyb2xzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBydWxlciBhbmQgc3RvcHdhdGNoKVxyXG4gICAgY29uc3QgdG9vbHNDb250cm9sUGFuZWxOb2RlID0gbmV3IFRvb2xzUGFuZWwoIG1vZGVsLnJ1bGVyLmlzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5zdG9wd2F0Y2guaXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmlzUGVyaW9kVHJhY2VWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMuaGFzUGVyaW9kVGltZXIsIHtcclxuICAgICAgICBtYXhXaWR0aDogMTgwLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyBQZW5kdWx1bUxhYkNvbnN0YW50cy5QQU5FTF9QQURESU5HLFxyXG4gICAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfUEFERElOR1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCB7Tm9kZX1cclxuICAgIHRoaXMudG9vbHNDb250cm9sUGFuZWxOb2RlID0gdG9vbHNDb250cm9sUGFuZWxOb2RlO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBwZW5kdWx1bSBzeXN0ZW0gY29udHJvbCBwYW5lbCAoY29udHJvbHMgdGhlIGxlbmd0aCBhbmQgbWFzcyBvZiB0aGUgcGVuZHVsYSlcclxuICAgIGNvbnN0IHBsYXliYWNrQ29udHJvbHMgPSBuZXcgUGxheWJhY2tDb250cm9sc05vZGUoIG1vZGVsLm51bWJlck9mUGVuZHVsYVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwudGltZVNwZWVkUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnN0ZXBNYW51YWwuYmluZCggbW9kZWwgKSxcclxuICAgICAgbW9kZWwucmV0dXJuUGVuZHVsYS5iaW5kKCBtb2RlbCApLCB7XHJcbiAgICAgICAgeDogdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCxcclxuICAgICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIFBlbmR1bHVtTGFiQ29uc3RhbnRzLlBBTkVMX1BBRERJTkdcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSByZXNldCBhbGwgYnV0dG9uXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogbW9kZWwucmVzZXQuYmluZCggbW9kZWwgKSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfUEFERElORyxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSBQZW5kdWx1bUxhYkNvbnN0YW50cy5QQU5FTF9QQURESU5HXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHJ1bGVyIG5vZGVcclxuICAgIGNvbnN0IHJ1bGVyTm9kZSA9IG5ldyBQZW5kdWx1bUxhYlJ1bGVyTm9kZSggbW9kZWwucnVsZXIsIG1vZGVsVmlld1RyYW5zZm9ybSwgdGhpcy5sYXlvdXRCb3VuZHMgKTtcclxuICAgIHJ1bGVyTm9kZS5sZWZ0ID0gdGhpcy5sYXlvdXRCb3VuZHMubGVmdCArIFBlbmR1bHVtTGFiQ29uc3RhbnRzLlBBTkVMX1BBRERJTkc7XHJcbiAgICBydWxlck5vZGUudG9wID0gdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgUGVuZHVsdW1MYWJDb25zdGFudHMuUEFORUxfUEFERElORztcclxuICAgIG1vZGVsLnJ1bGVyLnNldEluaXRpYWxQb3NpdGlvblZhbHVlKCBydWxlck5vZGUuY2VudGVyICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZFxyXG4gICAgdGhpcy5ydWxlck5vZGUgPSBydWxlck5vZGU7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRpbWVyIG5vZGVcclxuICAgIGNvbnN0IHN0b3B3YXRjaE5vZGUgPSBuZXcgU3RvcHdhdGNoTm9kZSggbW9kZWwuc3RvcHdhdGNoLCB7XHJcbiAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkXHJcbiAgICB0aGlzLnN0b3B3YXRjaE5vZGUgPSBzdG9wd2F0Y2hOb2RlO1xyXG5cclxuICAgIHRoaXMuc2V0U3RvcHdhdGNoSW5pdGlhbFBvc2l0aW9uKCk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZFxyXG4gICAgdGhpcy5hcnJvd3NQYW5lbExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuZW5lcmd5R3JhcGhMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLnBlcmlvZFRpbWVyTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIGNvbnN0IGxlZnRGbG9hdGluZ0xheWVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICB0aGlzLmVuZXJneUdyYXBoTGF5ZXIsIHRoaXMuYXJyb3dzUGFuZWxMYXllciwgdG9vbHNDb250cm9sUGFuZWxOb2RlXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHJpZ2h0RmxvYXRpbmdMYXllciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgdGhpcy5yaWdodFBhbmVsc0NvbnRhaW5lcixcclxuICAgICAgICByZXNldEFsbEJ1dHRvbixcclxuICAgICAgICBwb3B1cExheWVyXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMYXlvdXQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wZW5kdWx1bS1sYWIvaXNzdWVzLzk4XHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdmlzaWJsZUJvdW5kcyA9PiB7XHJcbiAgICAgIGxldCBkeCA9IC12aXNpYmxlQm91bmRzLng7XHJcbiAgICAgIGR4ID0gTWF0aC5taW4oIDIwMCwgZHggKTtcclxuICAgICAgbGVmdEZsb2F0aW5nTGF5ZXIueCA9IC1keDtcclxuICAgICAgcmlnaHRGbG9hdGluZ0xheWVyLnggPSBkeDtcclxuICAgICAgLy8gc2V0IHRoZSBkcmFnIGJvdW5kcyBvZiB0aGUgcnVsZXJcclxuICAgICAgcnVsZXJOb2RlLmRyYWdMaXN0ZW5lci5kcmFnQm91bmRzLnNldCggdmlzaWJsZUJvdW5kcy5lcm9kZWRYWSggcnVsZXJOb2RlLndpZHRoIC8gMiwgcnVsZXJOb2RlLmhlaWdodCAvIDIgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hpbGRyZW4gPSBbXHJcbiAgICAgIGJhY2tncm91bmREcmFnTm9kZSxcclxuICAgICAgcHJvdHJhY3Rvck5vZGUsXHJcbiAgICAgIGxlZnRGbG9hdGluZ0xheWVyLFxyXG4gICAgICByaWdodEZsb2F0aW5nTGF5ZXIsXHJcbiAgICAgIHBsYXliYWNrQ29udHJvbHMsXHJcbiAgICAgIHRoaXMuZmlyc3RQZXJpb2RUcmFjZU5vZGUsXHJcbiAgICAgIHRoaXMuc2Vjb25kUGVyaW9kVHJhY2VOb2RlLFxyXG4gICAgICBwZW5kdWxhTm9kZSxcclxuICAgICAgcnVsZXJOb2RlLFxyXG4gICAgICB0aGlzLnBlcmlvZFRpbWVyTGF5ZXIsXHJcbiAgICAgIHN0b3B3YXRjaE5vZGVcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQb3NpdGlvbiB0aGUgc3RvcHdhdGNoIG5leHQgdG8gdGhlIHJ1bGVyLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKi9cclxuICBzZXRTdG9wd2F0Y2hJbml0aWFsUG9zaXRpb24oKSB7XHJcbiAgICBjb25zdCBzdG9wd2F0Y2hJbml0aWFsUG9zaXRpb24gPSBuZXcgVmVjdG9yMihcclxuICAgICAgdGhpcy5ydWxlck5vZGUucmlnaHQgKyAxMCxcclxuICAgICAgdGhpcy5ydWxlck5vZGUuYm90dG9tIC0gdGhpcy5zdG9wd2F0Y2hOb2RlLmhlaWdodFxyXG4gICAgKTtcclxuICAgIHRoaXMubW9kZWwuc3RvcHdhdGNoLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBzdG9wd2F0Y2hJbml0aWFsUG9zaXRpb247XHJcbiAgICB0aGlzLm1vZGVsLnN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnNldEluaXRpYWxWYWx1ZSggc3RvcHdhdGNoSW5pdGlhbFBvc2l0aW9uICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyB0aGUgdmlldy5cclxuICAgKiBAcHVibGljXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5tb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5maXJzdFBlcmlvZFRyYWNlTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgICB0aGlzLnNlY29uZFBlcmlvZFRyYWNlTm9kZS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxucGVuZHVsdW1MYWIucmVnaXN0ZXIoICdQZW5kdWx1bUxhYlNjcmVlblZpZXcnLCBQZW5kdWx1bUxhYlNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGVuZHVsdW1MYWJTY3JlZW5WaWV3O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLFNBQVNDLElBQUksRUFBRUMsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLDZCQUE2QixNQUFNLHFEQUFxRDtBQUMvRixPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUM3RCxPQUFPQyxrQkFBa0IsTUFBTSx5QkFBeUI7QUFDeEQsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQUMxQyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0MseUJBQXlCLE1BQU0sZ0NBQWdDO0FBQ3RFLE9BQU9DLG9CQUFvQixNQUFNLDJCQUEy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