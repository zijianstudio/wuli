// Copyright 2014-2023, University of Colorado Boulder

/**
 * Demonstration of misc scenery-phet UI components.
 * Demos are selected from a combo box, and are instantiated on demand.
 * Use the 'component' query parameter to set the initial selection of the combo box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import DemosScreenView from '../../../../sun/js/demo/DemosScreenView.js';
import sceneryPhet from '../../sceneryPhet.js';
import sceneryPhetQueryParameters from '../../sceneryPhetQueryParameters.js';
import demoArrowNode from './demoArrowNode.js';
import demoBeakerNode from './demoBeakerNode.js';
import demoBicyclePumpNode from './demoBicyclePumpNode.js';
import demoBracketNode from './demoBracketNode.js';
import demoCapacitorNode from './demoCapacitorNode.js';
import demoComboBoxDisplay from './demoComboBoxDisplay.js';
import demoConductivityTesterNode from './demoConductivityTesterNode.js';
import demoDrawer from './demoDrawer.js';
import demoEyeDropperNode from './demoEyeDropperNode.js';
import demoFaucetNode from './demoFaucetNode.js';
import demoFlowBox from './demoFlowBox.js';
import demoFormulaNode from './demoFormulaNode.js';
import demoGaugeNode from './demoGaugeNode.js';
import demoGrabDragInteraction from './demoGrabDragInteraction.js';
import demoGridBox from './demoGridBox.js';
import demoHandleNode from './demoHandleNode.js';
import demoHeaterCoolerNode from './demoHeaterCoolerNode.js';
import demoKeypad from './demoKeypad.js';
import demoLaserPointerNode from './demoLaserPointerNode.js';
import demoLineArrowNode from './demoLineArrowNode.js';
import demoManualConstraint from './demoManualConstraint.js';
import demoMeasuringTapeNode from './demoMeasuringTapeNode.js';
import demoNumberDisplay from './demoNumberDisplay.js';
import demoPaperAirplaneNode from './demoPaperAirplaneNode.js';
import demoParametricSpringNode from './demoParametricSpringNode.js';
import demoProbeNode from './demoProbeNode.js';
import demoRichText from './demoRichText.js';
import demoRulerNode from './demoRulerNode.js';
import demoScientificNotationNode from './demoScientificNotationNode.js';
import demoSpectrumNode from './demoSpectrumNode.js';
import demoSpinningIndicatorNode from './demoSpinningIndicatorNode.js';
import demoSprites from './demoSprites.js';
import demoStarNode from './demoStarNode.js';
import demoStopwatchNode from './demoStopwatchNode.js';
import demoThermometerNode from './demoThermometerNode.js';
import demoTimeControlNode from './demoTimeControlNode.js';
import demoWireNode from './demoWireNode.js';
export default class ComponentsScreenView extends DemosScreenView {
  constructor(providedOptions) {
    const options = optionize()({
      selectedDemoLabel: sceneryPhetQueryParameters.component
    }, providedOptions);

    // To add a demo, add an entry here of type SunDemo.
    const demos = [{
      label: 'ArrowNode',
      createNode: demoArrowNode
    }, {
      label: 'BeakerNode',
      createNode: demoBeakerNode
    }, {
      label: 'BicyclePumpNode',
      createNode: demoBicyclePumpNode
    }, {
      label: 'BracketNode',
      createNode: demoBracketNode
    }, {
      label: 'CapacitorNode',
      createNode: demoCapacitorNode
    }, {
      label: 'ComboBoxDisplay',
      createNode: demoComboBoxDisplay
    }, {
      label: 'ConductivityTesterNode',
      createNode: demoConductivityTesterNode
    }, {
      label: 'Drawer',
      createNode: demoDrawer
    }, {
      label: 'EyeDropperNode',
      createNode: demoEyeDropperNode
    }, {
      label: 'FaucetNode',
      createNode: demoFaucetNode
    }, {
      label: 'FlowBox',
      createNode: demoFlowBox
    }, {
      label: 'FormulaNode',
      createNode: demoFormulaNode
    }, {
      label: 'GaugeNode',
      createNode: demoGaugeNode
    }, {
      label: 'GridBox',
      createNode: demoGridBox
    }, {
      label: 'GrabDragInteraction',
      createNode: demoGrabDragInteraction
    }, {
      label: 'HandleNode',
      createNode: demoHandleNode
    }, {
      label: 'HeaterCoolerNode',
      createNode: demoHeaterCoolerNode
    }, {
      label: 'Keypad',
      createNode: demoKeypad
    }, {
      label: 'LaserPointerNode',
      createNode: demoLaserPointerNode
    }, {
      label: 'LineArrowNode',
      createNode: demoLineArrowNode
    }, {
      label: 'ManualConstraint',
      createNode: demoManualConstraint
    }, {
      label: 'MeasuringTapeNode',
      createNode: demoMeasuringTapeNode
    }, {
      label: 'NumberDisplay',
      createNode: demoNumberDisplay
    }, {
      label: 'PaperAirplaneNode',
      createNode: demoPaperAirplaneNode
    }, {
      label: 'ParametricSpringNode',
      createNode: demoParametricSpringNode
    }, {
      label: 'ProbeNode',
      createNode: demoProbeNode
    }, {
      label: 'RichText',
      createNode: demoRichText
    }, {
      label: 'RulerNode',
      createNode: demoRulerNode
    }, {
      label: 'ScientificNotationNode',
      createNode: demoScientificNotationNode
    }, {
      label: 'SpectrumNode',
      createNode: demoSpectrumNode
    }, {
      label: 'SpinningIndicatorNode',
      createNode: demoSpinningIndicatorNode
    }, {
      label: 'Sprites',
      createNode: demoSprites
    }, {
      label: 'StarNode',
      createNode: demoStarNode
    }, {
      label: 'StopwatchNode',
      createNode: demoStopwatchNode
    }, {
      label: 'ThermometerNode',
      createNode: demoThermometerNode
    }, {
      label: 'TimeControlNode',
      createNode: demoTimeControlNode
    }, {
      label: 'WireNode',
      createNode: demoWireNode
    }];
    super(demos, options);
  }
}
sceneryPhet.register('ComponentsScreenView', ComponentsScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJEZW1vc1NjcmVlblZpZXciLCJzY2VuZXJ5UGhldCIsInNjZW5lcnlQaGV0UXVlcnlQYXJhbWV0ZXJzIiwiZGVtb0Fycm93Tm9kZSIsImRlbW9CZWFrZXJOb2RlIiwiZGVtb0JpY3ljbGVQdW1wTm9kZSIsImRlbW9CcmFja2V0Tm9kZSIsImRlbW9DYXBhY2l0b3JOb2RlIiwiZGVtb0NvbWJvQm94RGlzcGxheSIsImRlbW9Db25kdWN0aXZpdHlUZXN0ZXJOb2RlIiwiZGVtb0RyYXdlciIsImRlbW9FeWVEcm9wcGVyTm9kZSIsImRlbW9GYXVjZXROb2RlIiwiZGVtb0Zsb3dCb3giLCJkZW1vRm9ybXVsYU5vZGUiLCJkZW1vR2F1Z2VOb2RlIiwiZGVtb0dyYWJEcmFnSW50ZXJhY3Rpb24iLCJkZW1vR3JpZEJveCIsImRlbW9IYW5kbGVOb2RlIiwiZGVtb0hlYXRlckNvb2xlck5vZGUiLCJkZW1vS2V5cGFkIiwiZGVtb0xhc2VyUG9pbnRlck5vZGUiLCJkZW1vTGluZUFycm93Tm9kZSIsImRlbW9NYW51YWxDb25zdHJhaW50IiwiZGVtb01lYXN1cmluZ1RhcGVOb2RlIiwiZGVtb051bWJlckRpc3BsYXkiLCJkZW1vUGFwZXJBaXJwbGFuZU5vZGUiLCJkZW1vUGFyYW1ldHJpY1NwcmluZ05vZGUiLCJkZW1vUHJvYmVOb2RlIiwiZGVtb1JpY2hUZXh0IiwiZGVtb1J1bGVyTm9kZSIsImRlbW9TY2llbnRpZmljTm90YXRpb25Ob2RlIiwiZGVtb1NwZWN0cnVtTm9kZSIsImRlbW9TcGlubmluZ0luZGljYXRvck5vZGUiLCJkZW1vU3ByaXRlcyIsImRlbW9TdGFyTm9kZSIsImRlbW9TdG9wd2F0Y2hOb2RlIiwiZGVtb1RoZXJtb21ldGVyTm9kZSIsImRlbW9UaW1lQ29udHJvbE5vZGUiLCJkZW1vV2lyZU5vZGUiLCJDb21wb25lbnRzU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNlbGVjdGVkRGVtb0xhYmVsIiwiY29tcG9uZW50IiwiZGVtb3MiLCJsYWJlbCIsImNyZWF0ZU5vZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbXBvbmVudHNTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW9uc3RyYXRpb24gb2YgbWlzYyBzY2VuZXJ5LXBoZXQgVUkgY29tcG9uZW50cy5cclxuICogRGVtb3MgYXJlIHNlbGVjdGVkIGZyb20gYSBjb21ibyBib3gsIGFuZCBhcmUgaW5zdGFudGlhdGVkIG9uIGRlbWFuZC5cclxuICogVXNlIHRoZSAnY29tcG9uZW50JyBxdWVyeSBwYXJhbWV0ZXIgdG8gc2V0IHRoZSBpbml0aWFsIHNlbGVjdGlvbiBvZiB0aGUgY29tYm8gYm94LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgRGVtb3NTY3JlZW5WaWV3LCB7IERlbW9zU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvZGVtby9EZW1vc1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXRRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vc2NlbmVyeVBoZXRRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgZGVtb0Fycm93Tm9kZSBmcm9tICcuL2RlbW9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgZGVtb0JlYWtlck5vZGUgZnJvbSAnLi9kZW1vQmVha2VyTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vQmljeWNsZVB1bXBOb2RlIGZyb20gJy4vZGVtb0JpY3ljbGVQdW1wTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vQnJhY2tldE5vZGUgZnJvbSAnLi9kZW1vQnJhY2tldE5vZGUuanMnO1xyXG5pbXBvcnQgZGVtb0NhcGFjaXRvck5vZGUgZnJvbSAnLi9kZW1vQ2FwYWNpdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vQ29tYm9Cb3hEaXNwbGF5IGZyb20gJy4vZGVtb0NvbWJvQm94RGlzcGxheS5qcyc7XHJcbmltcG9ydCBkZW1vQ29uZHVjdGl2aXR5VGVzdGVyTm9kZSBmcm9tICcuL2RlbW9Db25kdWN0aXZpdHlUZXN0ZXJOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9EcmF3ZXIgZnJvbSAnLi9kZW1vRHJhd2VyLmpzJztcclxuaW1wb3J0IGRlbW9FeWVEcm9wcGVyTm9kZSBmcm9tICcuL2RlbW9FeWVEcm9wcGVyTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vRmF1Y2V0Tm9kZSBmcm9tICcuL2RlbW9GYXVjZXROb2RlLmpzJztcclxuaW1wb3J0IGRlbW9GbG93Qm94IGZyb20gJy4vZGVtb0Zsb3dCb3guanMnO1xyXG5pbXBvcnQgZGVtb0Zvcm11bGFOb2RlIGZyb20gJy4vZGVtb0Zvcm11bGFOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9HYXVnZU5vZGUgZnJvbSAnLi9kZW1vR2F1Z2VOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9HcmFiRHJhZ0ludGVyYWN0aW9uIGZyb20gJy4vZGVtb0dyYWJEcmFnSW50ZXJhY3Rpb24uanMnO1xyXG5pbXBvcnQgZGVtb0dyaWRCb3ggZnJvbSAnLi9kZW1vR3JpZEJveC5qcyc7XHJcbmltcG9ydCBkZW1vSGFuZGxlTm9kZSBmcm9tICcuL2RlbW9IYW5kbGVOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9IZWF0ZXJDb29sZXJOb2RlIGZyb20gJy4vZGVtb0hlYXRlckNvb2xlck5vZGUuanMnO1xyXG5pbXBvcnQgZGVtb0tleXBhZCBmcm9tICcuL2RlbW9LZXlwYWQuanMnO1xyXG5pbXBvcnQgZGVtb0xhc2VyUG9pbnRlck5vZGUgZnJvbSAnLi9kZW1vTGFzZXJQb2ludGVyTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vTGluZUFycm93Tm9kZSBmcm9tICcuL2RlbW9MaW5lQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9NYW51YWxDb25zdHJhaW50IGZyb20gJy4vZGVtb01hbnVhbENvbnN0cmFpbnQuanMnO1xyXG5pbXBvcnQgZGVtb01lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4vZGVtb01lYXN1cmluZ1RhcGVOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9OdW1iZXJEaXNwbGF5IGZyb20gJy4vZGVtb051bWJlckRpc3BsYXkuanMnO1xyXG5pbXBvcnQgZGVtb1BhcGVyQWlycGxhbmVOb2RlIGZyb20gJy4vZGVtb1BhcGVyQWlycGxhbmVOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9QYXJhbWV0cmljU3ByaW5nTm9kZSBmcm9tICcuL2RlbW9QYXJhbWV0cmljU3ByaW5nTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vUHJvYmVOb2RlIGZyb20gJy4vZGVtb1Byb2JlTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vUmljaFRleHQgZnJvbSAnLi9kZW1vUmljaFRleHQuanMnO1xyXG5pbXBvcnQgZGVtb1J1bGVyTm9kZSBmcm9tICcuL2RlbW9SdWxlck5vZGUuanMnO1xyXG5pbXBvcnQgZGVtb1NjaWVudGlmaWNOb3RhdGlvbk5vZGUgZnJvbSAnLi9kZW1vU2NpZW50aWZpY05vdGF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vU3BlY3RydW1Ob2RlIGZyb20gJy4vZGVtb1NwZWN0cnVtTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vU3Bpbm5pbmdJbmRpY2F0b3JOb2RlIGZyb20gJy4vZGVtb1NwaW5uaW5nSW5kaWNhdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vU3ByaXRlcyBmcm9tICcuL2RlbW9TcHJpdGVzLmpzJztcclxuaW1wb3J0IGRlbW9TdGFyTm9kZSBmcm9tICcuL2RlbW9TdGFyTm9kZS5qcyc7XHJcbmltcG9ydCBkZW1vU3RvcHdhdGNoTm9kZSBmcm9tICcuL2RlbW9TdG9wd2F0Y2hOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9UaGVybW9tZXRlck5vZGUgZnJvbSAnLi9kZW1vVGhlcm1vbWV0ZXJOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9UaW1lQ29udHJvbE5vZGUgZnJvbSAnLi9kZW1vVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IGRlbW9XaXJlTm9kZSBmcm9tICcuL2RlbW9XaXJlTm9kZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxudHlwZSBDb21wb25lbnRzU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxEZW1vc1NjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21wb25lbnRzU2NyZWVuVmlldyBleHRlbmRzIERlbW9zU2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBDb21wb25lbnRzU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb21wb25lbnRzU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBEZW1vc1NjcmVlblZpZXdPcHRpb25zPigpKCB7XHJcbiAgICAgIHNlbGVjdGVkRGVtb0xhYmVsOiBzY2VuZXJ5UGhldFF1ZXJ5UGFyYW1ldGVycy5jb21wb25lbnRcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFRvIGFkZCBhIGRlbW8sIGFkZCBhbiBlbnRyeSBoZXJlIG9mIHR5cGUgU3VuRGVtby5cclxuICAgIGNvbnN0IGRlbW9zID0gW1xyXG4gICAgICB7IGxhYmVsOiAnQXJyb3dOb2RlJywgY3JlYXRlTm9kZTogZGVtb0Fycm93Tm9kZSB9LFxyXG4gICAgICB7IGxhYmVsOiAnQmVha2VyTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9CZWFrZXJOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdCaWN5Y2xlUHVtcE5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vQmljeWNsZVB1bXBOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdCcmFja2V0Tm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9CcmFja2V0Tm9kZSB9LFxyXG4gICAgICB7IGxhYmVsOiAnQ2FwYWNpdG9yTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9DYXBhY2l0b3JOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdDb21ib0JveERpc3BsYXknLCBjcmVhdGVOb2RlOiBkZW1vQ29tYm9Cb3hEaXNwbGF5IH0sXHJcbiAgICAgIHsgbGFiZWw6ICdDb25kdWN0aXZpdHlUZXN0ZXJOb2RlJywgY3JlYXRlTm9kZTogZGVtb0NvbmR1Y3Rpdml0eVRlc3Rlck5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ0RyYXdlcicsIGNyZWF0ZU5vZGU6IGRlbW9EcmF3ZXIgfSxcclxuICAgICAgeyBsYWJlbDogJ0V5ZURyb3BwZXJOb2RlJywgY3JlYXRlTm9kZTogZGVtb0V5ZURyb3BwZXJOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdGYXVjZXROb2RlJywgY3JlYXRlTm9kZTogZGVtb0ZhdWNldE5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ0Zsb3dCb3gnLCBjcmVhdGVOb2RlOiBkZW1vRmxvd0JveCB9LFxyXG4gICAgICB7IGxhYmVsOiAnRm9ybXVsYU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vRm9ybXVsYU5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ0dhdWdlTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9HYXVnZU5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ0dyaWRCb3gnLCBjcmVhdGVOb2RlOiBkZW1vR3JpZEJveCB9LFxyXG4gICAgICB7IGxhYmVsOiAnR3JhYkRyYWdJbnRlcmFjdGlvbicsIGNyZWF0ZU5vZGU6IGRlbW9HcmFiRHJhZ0ludGVyYWN0aW9uIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdIYW5kbGVOb2RlJywgY3JlYXRlTm9kZTogZGVtb0hhbmRsZU5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ0hlYXRlckNvb2xlck5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vSGVhdGVyQ29vbGVyTm9kZSB9LFxyXG4gICAgICB7IGxhYmVsOiAnS2V5cGFkJywgY3JlYXRlTm9kZTogZGVtb0tleXBhZCB9LFxyXG4gICAgICB7IGxhYmVsOiAnTGFzZXJQb2ludGVyTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9MYXNlclBvaW50ZXJOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdMaW5lQXJyb3dOb2RlJywgY3JlYXRlTm9kZTogZGVtb0xpbmVBcnJvd05vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ01hbnVhbENvbnN0cmFpbnQnLCBjcmVhdGVOb2RlOiBkZW1vTWFudWFsQ29uc3RyYWludCB9LFxyXG4gICAgICB7IGxhYmVsOiAnTWVhc3VyaW5nVGFwZU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vTWVhc3VyaW5nVGFwZU5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ051bWJlckRpc3BsYXknLCBjcmVhdGVOb2RlOiBkZW1vTnVtYmVyRGlzcGxheSB9LFxyXG4gICAgICB7IGxhYmVsOiAnUGFwZXJBaXJwbGFuZU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vUGFwZXJBaXJwbGFuZU5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ1BhcmFtZXRyaWNTcHJpbmdOb2RlJywgY3JlYXRlTm9kZTogZGVtb1BhcmFtZXRyaWNTcHJpbmdOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdQcm9iZU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vUHJvYmVOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdSaWNoVGV4dCcsIGNyZWF0ZU5vZGU6IGRlbW9SaWNoVGV4dCB9LFxyXG4gICAgICB7IGxhYmVsOiAnUnVsZXJOb2RlJywgY3JlYXRlTm9kZTogZGVtb1J1bGVyTm9kZSB9LFxyXG4gICAgICB7IGxhYmVsOiAnU2NpZW50aWZpY05vdGF0aW9uTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9TY2llbnRpZmljTm90YXRpb25Ob2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdTcGVjdHJ1bU5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vU3BlY3RydW1Ob2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdTcGlubmluZ0luZGljYXRvck5vZGUnLCBjcmVhdGVOb2RlOiBkZW1vU3Bpbm5pbmdJbmRpY2F0b3JOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdTcHJpdGVzJywgY3JlYXRlTm9kZTogZGVtb1Nwcml0ZXMgfSxcclxuICAgICAgeyBsYWJlbDogJ1N0YXJOb2RlJywgY3JlYXRlTm9kZTogZGVtb1N0YXJOb2RlIH0sXHJcbiAgICAgIHsgbGFiZWw6ICdTdG9wd2F0Y2hOb2RlJywgY3JlYXRlTm9kZTogZGVtb1N0b3B3YXRjaE5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ1RoZXJtb21ldGVyTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9UaGVybW9tZXRlck5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ1RpbWVDb250cm9sTm9kZScsIGNyZWF0ZU5vZGU6IGRlbW9UaW1lQ29udHJvbE5vZGUgfSxcclxuICAgICAgeyBsYWJlbDogJ1dpcmVOb2RlJywgY3JlYXRlTm9kZTogZGVtb1dpcmVOb2RlIH1cclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoIGRlbW9zLCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5zY2VuZXJ5UGhldC5yZWdpc3RlciggJ0NvbXBvbmVudHNTY3JlZW5WaWV3JywgQ29tcG9uZW50c1NjcmVlblZpZXcgKTsiXSwibWFw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