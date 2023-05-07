// Copyright 2019-2022, University of Colorado Boulder

/**
 * A panel that will contain icons for draggable tools that can be pulled into the view. Forwards drag events from the
 * icons to the tools in the view.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import { DragListener, HBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
class ToolboxPanel extends Panel {
  /**
   * @param {EnergySkateParkModel} model
   * @param {EnergySkateParkScreenView} view
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, view, tandem, options) {
    options = merge({
      align: 'center',
      // smaller y margin to save space when used with very tall ControlPanels (like in the intro screen)
      yMargin: 2
    }, EnergySkateParkConstants.PANEL_OPTIONS, options);

    // create the icons
    const measuringTapeIcon = MeasuringTapeNode.createIcon({
      cursor: 'pointer'
    });
    const stopwatchIcon = new StopwatchNode(new Stopwatch({
      isVisible: true,
      tandem: Tandem.OPT_OUT
    }), {
      numberDisplayOptions: {
        textOptions: {
          maxWidth: 100
        }
      },
      tandem: Tandem.OPT_OUT
    }).rasterized({
      resolution: 5,
      imageOptions: {
        cursor: 'pointer',
        tandem: tandem.createTandem('timerIcon')
      }
    });
    measuringTapeIcon.setScaleMagnitude(0.7);
    stopwatchIcon.setScaleMagnitude(0.4);

    // align icons for panel
    const icons = new HBox({
      children: [stopwatchIcon, measuringTapeIcon],
      align: 'center',
      spacing: 20,
      excludeInvisibleChildrenFromBounds: false
    });
    super(icons, options);

    // create a forwarding listener for the MeasuringTapeNode DragListener
    measuringTapeIcon.addInputListener(DragListener.createForwardingListener(event => {
      if (!model.measuringTapeVisibleProperty.get()) {
        model.measuringTapeVisibleProperty.set(true);
        const modelPosition = view.modelViewTransform.viewToModelPosition(this.globalToParentPoint(event.pointer.point));
        model.measuringTapeBasePositionProperty.set(modelPosition);
        model.measuringTapeTipPositionProperty.set(modelPosition.plusXY(1, 0));
        view.measuringTapeNode.startBaseDrag(event);
      }
    }));

    // create a forwarding listener for the StopwatchNode DragListener
    stopwatchIcon.addInputListener(DragListener.createForwardingListener(event => {
      if (!model.stopwatch.isVisibleProperty.get()) {
        model.stopwatch.isVisibleProperty.value = true;
        const coordinate = this.globalToParentPoint(event.pointer.point).minusXY(view.stopwatchNode.width / 2, view.stopwatchNode.height / 2);
        model.stopwatch.positionProperty.set(coordinate);
        view.stopwatchNode.dragListener.press(event, view.stopwatchNode);
      }
    }));
    ToolboxPanel.attachIconVisibilityListener(measuringTapeIcon, model.measuringTapeVisibleProperty);
    ToolboxPanel.attachIconVisibilityListener(stopwatchIcon, model.stopwatch.isVisibleProperty);
  }

  /**
   * Create and attach a listener that makes the icon visible/invisible while the tool is invisible/visible.
   * Reference to the DerivedProperty is not returned because there is no need to dispose of it. This listener
   * can be attached for the life of the sim.
   * @private
   *
   * @param {Node} icon
   * @param {BooleanProperty} visibleProperty
   */
  static attachIconVisibilityListener(icon, visibleProperty) {
    const iconVisibleProperty = new DerivedProperty([visibleProperty], visible => {
      return !visible;
    });
    iconVisibleProperty.linkAttribute(icon, 'visible');
  }
}
energySkatePark.register('ToolboxPanel', ToolboxPanel);
export default ToolboxPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJtZXJnZSIsIk1lYXN1cmluZ1RhcGVOb2RlIiwiU3RvcHdhdGNoIiwiU3RvcHdhdGNoTm9kZSIsIkRyYWdMaXN0ZW5lciIsIkhCb3giLCJQYW5lbCIsIlRhbmRlbSIsImVuZXJneVNrYXRlUGFyayIsIkVuZXJneVNrYXRlUGFya0NvbnN0YW50cyIsIlRvb2xib3hQYW5lbCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ2aWV3IiwidGFuZGVtIiwib3B0aW9ucyIsImFsaWduIiwieU1hcmdpbiIsIlBBTkVMX09QVElPTlMiLCJtZWFzdXJpbmdUYXBlSWNvbiIsImNyZWF0ZUljb24iLCJjdXJzb3IiLCJzdG9wd2F0Y2hJY29uIiwiaXNWaXNpYmxlIiwiT1BUX09VVCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidGV4dE9wdGlvbnMiLCJtYXhXaWR0aCIsInJhc3Rlcml6ZWQiLCJyZXNvbHV0aW9uIiwiaW1hZ2VPcHRpb25zIiwiY3JlYXRlVGFuZGVtIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJpY29ucyIsImNoaWxkcmVuIiwic3BhY2luZyIsImV4Y2x1ZGVJbnZpc2libGVDaGlsZHJlbkZyb21Cb3VuZHMiLCJhZGRJbnB1dExpc3RlbmVyIiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiZXZlbnQiLCJtZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5IiwiZ2V0Iiwic2V0IiwibW9kZWxQb3NpdGlvbiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInZpZXdUb01vZGVsUG9zaXRpb24iLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwibWVhc3VyaW5nVGFwZUJhc2VQb3NpdGlvblByb3BlcnR5IiwibWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkiLCJwbHVzWFkiLCJtZWFzdXJpbmdUYXBlTm9kZSIsInN0YXJ0QmFzZURyYWciLCJzdG9wd2F0Y2giLCJpc1Zpc2libGVQcm9wZXJ0eSIsInZhbHVlIiwiY29vcmRpbmF0ZSIsIm1pbnVzWFkiLCJzdG9wd2F0Y2hOb2RlIiwid2lkdGgiLCJoZWlnaHQiLCJwb3NpdGlvblByb3BlcnR5IiwiZHJhZ0xpc3RlbmVyIiwicHJlc3MiLCJhdHRhY2hJY29uVmlzaWJpbGl0eUxpc3RlbmVyIiwiaWNvbiIsInZpc2libGVQcm9wZXJ0eSIsImljb25WaXNpYmxlUHJvcGVydHkiLCJ2aXNpYmxlIiwibGlua0F0dHJpYnV0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVG9vbGJveFBhbmVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgcGFuZWwgdGhhdCB3aWxsIGNvbnRhaW4gaWNvbnMgZm9yIGRyYWdnYWJsZSB0b29scyB0aGF0IGNhbiBiZSBwdWxsZWQgaW50byB0aGUgdmlldy4gRm9yd2FyZHMgZHJhZyBldmVudHMgZnJvbSB0aGVcclxuICogaWNvbnMgdG8gdGhlIHRvb2xzIGluIHRoZSB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNZWFzdXJpbmdUYXBlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWVhc3VyaW5nVGFwZU5vZGUuanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdG9wd2F0Y2guanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoTm9kZS5qcyc7XHJcbmltcG9ydCB7IERyYWdMaXN0ZW5lciwgSEJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZW5lcmd5U2thdGVQYXJrIGZyb20gJy4uLy4uL2VuZXJneVNrYXRlUGFyay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMgZnJvbSAnLi4vRW5lcmd5U2thdGVQYXJrQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFRvb2xib3hQYW5lbCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lTa2F0ZVBhcmtNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge0VuZXJneVNrYXRlUGFya1NjcmVlblZpZXd9IHZpZXdcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdmlldywgdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuXHJcbiAgICAgIC8vIHNtYWxsZXIgeSBtYXJnaW4gdG8gc2F2ZSBzcGFjZSB3aGVuIHVzZWQgd2l0aCB2ZXJ5IHRhbGwgQ29udHJvbFBhbmVscyAobGlrZSBpbiB0aGUgaW50cm8gc2NyZWVuKVxyXG4gICAgICB5TWFyZ2luOiAyXHJcbiAgICB9LCBFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuUEFORUxfT1BUSU9OUywgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgaWNvbnNcclxuICAgIGNvbnN0IG1lYXN1cmluZ1RhcGVJY29uID0gTWVhc3VyaW5nVGFwZU5vZGUuY3JlYXRlSWNvbigge1xyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHN0b3B3YXRjaEljb24gPSBuZXcgU3RvcHdhdGNoTm9kZSggbmV3IFN0b3B3YXRjaCgge1xyXG4gICAgICBpc1Zpc2libGU6IHRydWUsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKSwge1xyXG4gICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBtYXhXaWR0aDogMTAwXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICkucmFzdGVyaXplZCgge1xyXG4gICAgICByZXNvbHV0aW9uOiA1LFxyXG4gICAgICBpbWFnZU9wdGlvbnM6IHtcclxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lckljb24nIClcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIG1lYXN1cmluZ1RhcGVJY29uLnNldFNjYWxlTWFnbml0dWRlKCAwLjcgKTtcclxuICAgIHN0b3B3YXRjaEljb24uc2V0U2NhbGVNYWduaXR1ZGUoIDAuNCApO1xyXG5cclxuICAgIC8vIGFsaWduIGljb25zIGZvciBwYW5lbFxyXG4gICAgY29uc3QgaWNvbnMgPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBzdG9wd2F0Y2hJY29uLCBtZWFzdXJpbmdUYXBlSWNvbiBdLFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG4gICAgICBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBpY29ucywgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIGZvcndhcmRpbmcgbGlzdGVuZXIgZm9yIHRoZSBNZWFzdXJpbmdUYXBlTm9kZSBEcmFnTGlzdGVuZXJcclxuICAgIG1lYXN1cmluZ1RhcGVJY29uLmFkZElucHV0TGlzdGVuZXIoIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGV2ZW50ID0+IHtcclxuICAgICAgaWYgKCAhbW9kZWwubWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBtb2RlbC5tZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG5cclxuICAgICAgICBjb25zdCBtb2RlbFBvc2l0aW9uID0gdmlldy5tb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxQb3NpdGlvbiggdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkgKTtcclxuICAgICAgICBtb2RlbC5tZWFzdXJpbmdUYXBlQmFzZVBvc2l0aW9uUHJvcGVydHkuc2V0KCBtb2RlbFBvc2l0aW9uICk7XHJcbiAgICAgICAgbW9kZWwubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkuc2V0KCBtb2RlbFBvc2l0aW9uLnBsdXNYWSggMSwgMCApICk7XHJcblxyXG4gICAgICAgIHZpZXcubWVhc3VyaW5nVGFwZU5vZGUuc3RhcnRCYXNlRHJhZyggZXZlbnQgKTtcclxuICAgICAgfVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgZm9yd2FyZGluZyBsaXN0ZW5lciBmb3IgdGhlIFN0b3B3YXRjaE5vZGUgRHJhZ0xpc3RlbmVyXHJcbiAgICBzdG9wd2F0Y2hJY29uLmFkZElucHV0TGlzdGVuZXIoIERyYWdMaXN0ZW5lci5jcmVhdGVGb3J3YXJkaW5nTGlzdGVuZXIoIGV2ZW50ID0+IHtcclxuICAgICAgaWYgKCAhbW9kZWwuc3RvcHdhdGNoLmlzVmlzaWJsZVByb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIG1vZGVsLnN0b3B3YXRjaC5pc1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvb3JkaW5hdGUgPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGV2ZW50LnBvaW50ZXIucG9pbnQgKS5taW51c1hZKFxyXG4gICAgICAgICAgdmlldy5zdG9wd2F0Y2hOb2RlLndpZHRoIC8gMixcclxuICAgICAgICAgIHZpZXcuc3RvcHdhdGNoTm9kZS5oZWlnaHQgLyAyXHJcbiAgICAgICAgKTtcclxuICAgICAgICBtb2RlbC5zdG9wd2F0Y2gucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIGNvb3JkaW5hdGUgKTtcclxuICAgICAgICB2aWV3LnN0b3B3YXRjaE5vZGUuZHJhZ0xpc3RlbmVyLnByZXNzKCBldmVudCwgdmlldy5zdG9wd2F0Y2hOb2RlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIFRvb2xib3hQYW5lbC5hdHRhY2hJY29uVmlzaWJpbGl0eUxpc3RlbmVyKCBtZWFzdXJpbmdUYXBlSWNvbiwgbW9kZWwubWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSApO1xyXG4gICAgVG9vbGJveFBhbmVsLmF0dGFjaEljb25WaXNpYmlsaXR5TGlzdGVuZXIoIHN0b3B3YXRjaEljb24sIG1vZGVsLnN0b3B3YXRjaC5pc1Zpc2libGVQcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuZCBhdHRhY2ggYSBsaXN0ZW5lciB0aGF0IG1ha2VzIHRoZSBpY29uIHZpc2libGUvaW52aXNpYmxlIHdoaWxlIHRoZSB0b29sIGlzIGludmlzaWJsZS92aXNpYmxlLlxyXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgRGVyaXZlZFByb3BlcnR5IGlzIG5vdCByZXR1cm5lZCBiZWNhdXNlIHRoZXJlIGlzIG5vIG5lZWQgdG8gZGlzcG9zZSBvZiBpdC4gVGhpcyBsaXN0ZW5lclxyXG4gICAqIGNhbiBiZSBhdHRhY2hlZCBmb3IgdGhlIGxpZmUgb2YgdGhlIHNpbS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBpY29uXHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHZpc2libGVQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIHN0YXRpYyBhdHRhY2hJY29uVmlzaWJpbGl0eUxpc3RlbmVyKCBpY29uLCB2aXNpYmxlUHJvcGVydHkgKSB7XHJcbiAgICBjb25zdCBpY29uVmlzaWJsZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB2aXNpYmxlUHJvcGVydHkgXSwgdmlzaWJsZSA9PiB7XHJcbiAgICAgIHJldHVybiAhdmlzaWJsZTtcclxuICAgIH0gKTtcclxuICAgIGljb25WaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggaWNvbiwgJ3Zpc2libGUnICk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdUb29sYm94UGFuZWwnLCBUb29sYm94UGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgVG9vbGJveFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxhQUFhLE1BQU0sOENBQThDO0FBQ3hFLFNBQVNDLFlBQVksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN0RSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFFckUs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