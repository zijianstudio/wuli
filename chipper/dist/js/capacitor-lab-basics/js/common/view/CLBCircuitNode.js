// Copyright 2015-2022, University of Colorado Boulder

/**
 * Base type for the circuit nodes in Capacitor Lab: Basics.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import CapacitorConstants from '../../../../scenery-phet/js/capacitor/CapacitorConstants.js';
import CapacitorNode from '../../../../scenery-phet/js/capacitor/CapacitorNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import capacitorLabBasics from '../../capacitorLabBasics.js';
import CLBConstants from '../CLBConstants.js';
import CircuitState from '../model/CircuitState.js';
import BatteryNode from './BatteryNode.js';
import CurrentIndicatorNode from './CurrentIndicatorNode.js';
import PlateAreaDragHandleNode from './drag/PlateAreaDragHandleNode.js';
import PlateSeparationDragHandleNode from './drag/PlateSeparationDragHandleNode.js';
import SwitchNode from './SwitchNode.js';
import WireNode from './WireNode.js';
class CLBCircuitNode extends Node {
  /**
   * @constructor
   *
   * @param {CLBModel} model
   * @param {Tandem} tandem
   */

  constructor(model, tandem) {
    super();

    // Validate number of switches in model
    assert && assert(model.circuit.circuitSwitches.length === 2, 'This circuit should have two switches: top and bottom.');

    // @public {Circuit}
    this.circuit = model.circuit;

    // @private {BatteryNode}
    this.batteryNode = new BatteryNode(this.circuit.battery, CLBConstants.BATTERY_VOLTAGE_RANGE, tandem.createTandem('batteryNode'));
    const capacitorNode = new CapacitorNode(this.circuit, model.modelViewTransform, model.plateChargesVisibleProperty, model.electricFieldVisibleProperty, {
      tandem: tandem.createTandem('capacitorNode')
    });

    // @public {Node}
    this.topWireNode = new Node();
    this.bottomWireNode = new Node();
    this.circuit.topWires.forEach(topWire => {
      this.topWireNode.addChild(new WireNode(topWire));
    });
    this.circuit.bottomWires.forEach(bottomWire => {
      this.bottomWireNode.addChild(new WireNode(bottomWire));
    });

    // Don't allow both switches to be controlled at once
    const switchControlledProperty = new BooleanProperty(false);

    // @private {Array.<SwitchNode>}
    this.circuitSwitchNodes = [];
    this.circuitSwitchNodes.push(new SwitchNode(this.circuit.circuitSwitches[0], model.modelViewTransform, switchControlledProperty, tandem.createTandem('topSwitchNode')));
    this.circuitSwitchNodes.push(new SwitchNode(this.circuit.circuitSwitches[1], model.modelViewTransform, switchControlledProperty, tandem.createTandem('bottomSwitchNode')));

    // Once the circuit has been built, if the circuit connection has changed, the switch has been used.
    this.circuitSwitchNodes.forEach(switchNode => {
      switchNode.circuitSwitch.circuitConnectionProperty.lazyLink(connection => {
        if (connection !== switchNode.circuitSwitch.circuitConnectionProperty.initialValue && connection !== CircuitState.SWITCH_IN_TRANSIT) {
          model.switchUsedProperty.set(true);
        }
      });
    });

    // Make the switch "hint" arrows disappear after first use of the switch (#94). This affects both screens
    // because a common reference to the switchUsedProperty is shared between the models.
    model.switchUsedProperty.link(switchUsed => {
      this.circuitSwitchNodes.forEach(switchNode => {
        switchNode.switchCueArrow.setVisible(!switchUsed);
      });
    });

    // drag handles
    const plateSeparationDragHandleNode = new PlateSeparationDragHandleNode(this.circuit.capacitor, model.modelViewTransform, CapacitorConstants.PLATE_SEPARATION_RANGE, tandem.createTandem('plateSeparationDragHandleNode'));
    const plateAreaDragHandleNode = new PlateAreaDragHandleNode(this.circuit.capacitor, model.modelViewTransform, CapacitorConstants.PLATE_WIDTH_RANGE, tandem.createTandem('plateAreaDragHandleNode'));

    // current indicators
    this.batteryTopCurrentIndicatorNode = new CurrentIndicatorNode(this.circuit.currentAmplitudeProperty, 0, model.currentOrientationProperty, model.arrowColorProperty, model.stepEmitter, tandem.createTandem('batteryTopCurrentIndicatorNode'));
    this.batteryBottomCurrentIndicatorNode = new CurrentIndicatorNode(this.circuit.currentAmplitudeProperty, Math.PI, model.currentOrientationProperty, model.arrowColorProperty, model.stepEmitter, tandem.createTandem('batteryBottomCurrentIndicatorNode'));

    // rendering order
    this.circuitSwitchNodes.forEach(switchNode => {
      switchNode.connectionAreaNodes.forEach(connectionAreaNode => {
        this.addChild(connectionAreaNode);
      });
    });
    this.addChild(this.bottomWireNode);
    this.addChild(this.batteryNode);
    this.addChild(capacitorNode);
    this.addChild(this.topWireNode);
    this.addChild(this.circuitSwitchNodes[0]);
    this.addChild(this.batteryTopCurrentIndicatorNode);
    this.addChild(this.batteryBottomCurrentIndicatorNode);
    this.addChild(plateSeparationDragHandleNode);
    this.addChild(plateAreaDragHandleNode);
    this.addChild(this.circuitSwitchNodes[1]);

    // battery
    this.batteryNode.center = model.modelViewTransform.modelToViewPosition(this.circuit.battery.position);

    // capacitor
    capacitorNode.center = model.modelViewTransform.modelToViewPosition(this.circuit.capacitor.position);

    // top current indicator
    const x = this.batteryNode.right + (this.circuitSwitchNodes[0].left - this.batteryNode.right) / 2;

    // current indicator offset
    const indicatorOffset = 7 / 2;
    let y = this.topWireNode.bounds.minY + indicatorOffset;
    this.batteryTopCurrentIndicatorNode.translate(x, y);

    // bottom current indicator
    y = this.bottomWireNode.bounds.getMaxY() - indicatorOffset;
    this.batteryBottomCurrentIndicatorNode.translate(x, y);

    // wires shapes are in model coordinate frame, so the nodes live at (0,0) the following does nothing but it
    // explicitly defines the layout.
    this.topWireNode.translation = new Vector2(0, 0);
    this.bottomWireNode.translation = new Vector2(0, 0);

    // observer for visibility of the current indicators
    model.currentVisibleProperty.link(currentIndicatorsVisible => {
      this.batteryTopCurrentIndicatorNode.setVisible(currentIndicatorsVisible);
      this.batteryBottomCurrentIndicatorNode.setVisible(currentIndicatorsVisible);
    });
  }
}
capacitorLabBasics.register('CLBCircuitNode', CLBCircuitNode);
export default CLBCircuitNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJWZWN0b3IyIiwiQ2FwYWNpdG9yQ29uc3RhbnRzIiwiQ2FwYWNpdG9yTm9kZSIsIk5vZGUiLCJjYXBhY2l0b3JMYWJCYXNpY3MiLCJDTEJDb25zdGFudHMiLCJDaXJjdWl0U3RhdGUiLCJCYXR0ZXJ5Tm9kZSIsIkN1cnJlbnRJbmRpY2F0b3JOb2RlIiwiUGxhdGVBcmVhRHJhZ0hhbmRsZU5vZGUiLCJQbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlTm9kZSIsIlN3aXRjaE5vZGUiLCJXaXJlTm9kZSIsIkNMQkNpcmN1aXROb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImFzc2VydCIsImNpcmN1aXQiLCJjaXJjdWl0U3dpdGNoZXMiLCJsZW5ndGgiLCJiYXR0ZXJ5Tm9kZSIsImJhdHRlcnkiLCJCQVRURVJZX1ZPTFRBR0VfUkFOR0UiLCJjcmVhdGVUYW5kZW0iLCJjYXBhY2l0b3JOb2RlIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicGxhdGVDaGFyZ2VzVmlzaWJsZVByb3BlcnR5IiwiZWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eSIsInRvcFdpcmVOb2RlIiwiYm90dG9tV2lyZU5vZGUiLCJ0b3BXaXJlcyIsImZvckVhY2giLCJ0b3BXaXJlIiwiYWRkQ2hpbGQiLCJib3R0b21XaXJlcyIsImJvdHRvbVdpcmUiLCJzd2l0Y2hDb250cm9sbGVkUHJvcGVydHkiLCJjaXJjdWl0U3dpdGNoTm9kZXMiLCJwdXNoIiwic3dpdGNoTm9kZSIsImNpcmN1aXRTd2l0Y2giLCJjaXJjdWl0Q29ubmVjdGlvblByb3BlcnR5IiwibGF6eUxpbmsiLCJjb25uZWN0aW9uIiwiaW5pdGlhbFZhbHVlIiwiU1dJVENIX0lOX1RSQU5TSVQiLCJzd2l0Y2hVc2VkUHJvcGVydHkiLCJzZXQiLCJsaW5rIiwic3dpdGNoVXNlZCIsInN3aXRjaEN1ZUFycm93Iiwic2V0VmlzaWJsZSIsInBsYXRlU2VwYXJhdGlvbkRyYWdIYW5kbGVOb2RlIiwiY2FwYWNpdG9yIiwiUExBVEVfU0VQQVJBVElPTl9SQU5HRSIsInBsYXRlQXJlYURyYWdIYW5kbGVOb2RlIiwiUExBVEVfV0lEVEhfUkFOR0UiLCJiYXR0ZXJ5VG9wQ3VycmVudEluZGljYXRvck5vZGUiLCJjdXJyZW50QW1wbGl0dWRlUHJvcGVydHkiLCJjdXJyZW50T3JpZW50YXRpb25Qcm9wZXJ0eSIsImFycm93Q29sb3JQcm9wZXJ0eSIsInN0ZXBFbWl0dGVyIiwiYmF0dGVyeUJvdHRvbUN1cnJlbnRJbmRpY2F0b3JOb2RlIiwiTWF0aCIsIlBJIiwiY29ubmVjdGlvbkFyZWFOb2RlcyIsImNvbm5lY3Rpb25BcmVhTm9kZSIsImNlbnRlciIsIm1vZGVsVG9WaWV3UG9zaXRpb24iLCJwb3NpdGlvbiIsIngiLCJyaWdodCIsImxlZnQiLCJpbmRpY2F0b3JPZmZzZXQiLCJ5IiwiYm91bmRzIiwibWluWSIsInRyYW5zbGF0ZSIsImdldE1heFkiLCJ0cmFuc2xhdGlvbiIsImN1cnJlbnRWaXNpYmxlUHJvcGVydHkiLCJjdXJyZW50SW5kaWNhdG9yc1Zpc2libGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNMQkNpcmN1aXROb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgdHlwZSBmb3IgdGhlIGNpcmN1aXQgbm9kZXMgaW4gQ2FwYWNpdG9yIExhYjogQmFzaWNzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgQ2FwYWNpdG9yQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9jYXBhY2l0b3IvQ2FwYWNpdG9yQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENhcGFjaXRvck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2NhcGFjaXRvci9DYXBhY2l0b3JOb2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjYXBhY2l0b3JMYWJCYXNpY3MgZnJvbSAnLi4vLi4vY2FwYWNpdG9yTGFiQmFzaWNzLmpzJztcclxuaW1wb3J0IENMQkNvbnN0YW50cyBmcm9tICcuLi9DTEJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdFN0YXRlIGZyb20gJy4uL21vZGVsL0NpcmN1aXRTdGF0ZS5qcyc7XHJcbmltcG9ydCBCYXR0ZXJ5Tm9kZSBmcm9tICcuL0JhdHRlcnlOb2RlLmpzJztcclxuaW1wb3J0IEN1cnJlbnRJbmRpY2F0b3JOb2RlIGZyb20gJy4vQ3VycmVudEluZGljYXRvck5vZGUuanMnO1xyXG5pbXBvcnQgUGxhdGVBcmVhRHJhZ0hhbmRsZU5vZGUgZnJvbSAnLi9kcmFnL1BsYXRlQXJlYURyYWdIYW5kbGVOb2RlLmpzJztcclxuaW1wb3J0IFBsYXRlU2VwYXJhdGlvbkRyYWdIYW5kbGVOb2RlIGZyb20gJy4vZHJhZy9QbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlTm9kZS5qcyc7XHJcbmltcG9ydCBTd2l0Y2hOb2RlIGZyb20gJy4vU3dpdGNoTm9kZS5qcyc7XHJcbmltcG9ydCBXaXJlTm9kZSBmcm9tICcuL1dpcmVOb2RlLmpzJztcclxuXHJcbmNsYXNzIENMQkNpcmN1aXROb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQGNvbnN0cnVjdG9yXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0NMQk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIFZhbGlkYXRlIG51bWJlciBvZiBzd2l0Y2hlcyBpbiBtb2RlbFxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9kZWwuY2lyY3VpdC5jaXJjdWl0U3dpdGNoZXMubGVuZ3RoID09PSAyLFxyXG4gICAgICAnVGhpcyBjaXJjdWl0IHNob3VsZCBoYXZlIHR3byBzd2l0Y2hlczogdG9wIGFuZCBib3R0b20uJyApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0NpcmN1aXR9XHJcbiAgICB0aGlzLmNpcmN1aXQgPSBtb2RlbC5jaXJjdWl0O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtCYXR0ZXJ5Tm9kZX1cclxuICAgIHRoaXMuYmF0dGVyeU5vZGUgPSBuZXcgQmF0dGVyeU5vZGUoIHRoaXMuY2lyY3VpdC5iYXR0ZXJ5LCBDTEJDb25zdGFudHMuQkFUVEVSWV9WT0xUQUdFX1JBTkdFLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmF0dGVyeU5vZGUnICkgKTtcclxuXHJcbiAgICBjb25zdCBjYXBhY2l0b3JOb2RlID0gbmV3IENhcGFjaXRvck5vZGUoXHJcbiAgICAgIHRoaXMuY2lyY3VpdCxcclxuICAgICAgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBtb2RlbC5wbGF0ZUNoYXJnZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYXBhY2l0b3JOb2RlJyApXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7Tm9kZX1cclxuICAgIHRoaXMudG9wV2lyZU5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5ib3R0b21XaXJlTm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0LnRvcFdpcmVzLmZvckVhY2goIHRvcFdpcmUgPT4ge1xyXG4gICAgICB0aGlzLnRvcFdpcmVOb2RlLmFkZENoaWxkKCBuZXcgV2lyZU5vZGUoIHRvcFdpcmUgKSApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jaXJjdWl0LmJvdHRvbVdpcmVzLmZvckVhY2goIGJvdHRvbVdpcmUgPT4ge1xyXG4gICAgICB0aGlzLmJvdHRvbVdpcmVOb2RlLmFkZENoaWxkKCBuZXcgV2lyZU5vZGUoIGJvdHRvbVdpcmUgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERvbid0IGFsbG93IGJvdGggc3dpdGNoZXMgdG8gYmUgY29udHJvbGxlZCBhdCBvbmNlXHJcbiAgICBjb25zdCBzd2l0Y2hDb250cm9sbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtBcnJheS48U3dpdGNoTm9kZT59XHJcbiAgICB0aGlzLmNpcmN1aXRTd2l0Y2hOb2RlcyA9IFtdO1xyXG4gICAgdGhpcy5jaXJjdWl0U3dpdGNoTm9kZXMucHVzaCggbmV3IFN3aXRjaE5vZGUoXHJcbiAgICAgIHRoaXMuY2lyY3VpdC5jaXJjdWl0U3dpdGNoZXNbIDAgXSxcclxuICAgICAgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBzd2l0Y2hDb250cm9sbGVkUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b3BTd2l0Y2hOb2RlJyApXHJcbiAgICApICk7XHJcbiAgICB0aGlzLmNpcmN1aXRTd2l0Y2hOb2Rlcy5wdXNoKCBuZXcgU3dpdGNoTm9kZShcclxuICAgICAgdGhpcy5jaXJjdWl0LmNpcmN1aXRTd2l0Y2hlc1sgMSBdLFxyXG4gICAgICBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHN3aXRjaENvbnRyb2xsZWRQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JvdHRvbVN3aXRjaE5vZGUnIClcclxuICAgICkgKTtcclxuXHJcbiAgICAvLyBPbmNlIHRoZSBjaXJjdWl0IGhhcyBiZWVuIGJ1aWx0LCBpZiB0aGUgY2lyY3VpdCBjb25uZWN0aW9uIGhhcyBjaGFuZ2VkLCB0aGUgc3dpdGNoIGhhcyBiZWVuIHVzZWQuXHJcbiAgICB0aGlzLmNpcmN1aXRTd2l0Y2hOb2Rlcy5mb3JFYWNoKCBzd2l0Y2hOb2RlID0+IHtcclxuICAgICAgc3dpdGNoTm9kZS5jaXJjdWl0U3dpdGNoLmNpcmN1aXRDb25uZWN0aW9uUHJvcGVydHkubGF6eUxpbmsoIGNvbm5lY3Rpb24gPT4ge1xyXG4gICAgICAgIGlmICggY29ubmVjdGlvbiAhPT0gc3dpdGNoTm9kZS5jaXJjdWl0U3dpdGNoLmNpcmN1aXRDb25uZWN0aW9uUHJvcGVydHkuaW5pdGlhbFZhbHVlICYmXHJcbiAgICAgICAgICAgICBjb25uZWN0aW9uICE9PSBDaXJjdWl0U3RhdGUuU1dJVENIX0lOX1RSQU5TSVQgKSB7XHJcbiAgICAgICAgICBtb2RlbC5zd2l0Y2hVc2VkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgc3dpdGNoIFwiaGludFwiIGFycm93cyBkaXNhcHBlYXIgYWZ0ZXIgZmlyc3QgdXNlIG9mIHRoZSBzd2l0Y2ggKCM5NCkuIFRoaXMgYWZmZWN0cyBib3RoIHNjcmVlbnNcclxuICAgIC8vIGJlY2F1c2UgYSBjb21tb24gcmVmZXJlbmNlIHRvIHRoZSBzd2l0Y2hVc2VkUHJvcGVydHkgaXMgc2hhcmVkIGJldHdlZW4gdGhlIG1vZGVscy5cclxuICAgIG1vZGVsLnN3aXRjaFVzZWRQcm9wZXJ0eS5saW5rKCBzd2l0Y2hVc2VkID0+IHtcclxuICAgICAgdGhpcy5jaXJjdWl0U3dpdGNoTm9kZXMuZm9yRWFjaCggc3dpdGNoTm9kZSA9PiB7XHJcbiAgICAgICAgc3dpdGNoTm9kZS5zd2l0Y2hDdWVBcnJvdy5zZXRWaXNpYmxlKCAhc3dpdGNoVXNlZCApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZHJhZyBoYW5kbGVzXHJcbiAgICBjb25zdCBwbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlTm9kZSA9IG5ldyBQbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlTm9kZSggdGhpcy5jaXJjdWl0LmNhcGFjaXRvciwgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfU0VQQVJBVElPTl9SQU5HRSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsYXRlU2VwYXJhdGlvbkRyYWdIYW5kbGVOb2RlJyApICk7XHJcbiAgICBjb25zdCBwbGF0ZUFyZWFEcmFnSGFuZGxlTm9kZSA9IG5ldyBQbGF0ZUFyZWFEcmFnSGFuZGxlTm9kZSggdGhpcy5jaXJjdWl0LmNhcGFjaXRvciwgbW9kZWwubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBDYXBhY2l0b3JDb25zdGFudHMuUExBVEVfV0lEVEhfUkFOR0UsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF0ZUFyZWFEcmFnSGFuZGxlTm9kZScgKSApO1xyXG5cclxuICAgIC8vIGN1cnJlbnQgaW5kaWNhdG9yc1xyXG4gICAgdGhpcy5iYXR0ZXJ5VG9wQ3VycmVudEluZGljYXRvck5vZGUgPSBuZXcgQ3VycmVudEluZGljYXRvck5vZGUoXHJcbiAgICAgIHRoaXMuY2lyY3VpdC5jdXJyZW50QW1wbGl0dWRlUHJvcGVydHksXHJcbiAgICAgIDAsXHJcbiAgICAgIG1vZGVsLmN1cnJlbnRPcmllbnRhdGlvblByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5hcnJvd0NvbG9yUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnN0ZXBFbWl0dGVyLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmF0dGVyeVRvcEN1cnJlbnRJbmRpY2F0b3JOb2RlJyApICk7XHJcbiAgICB0aGlzLmJhdHRlcnlCb3R0b21DdXJyZW50SW5kaWNhdG9yTm9kZSA9IG5ldyBDdXJyZW50SW5kaWNhdG9yTm9kZShcclxuICAgICAgdGhpcy5jaXJjdWl0LmN1cnJlbnRBbXBsaXR1ZGVQcm9wZXJ0eSxcclxuICAgICAgTWF0aC5QSSxcclxuICAgICAgbW9kZWwuY3VycmVudE9yaWVudGF0aW9uUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmFycm93Q29sb3JQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc3RlcEVtaXR0ZXIsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYXR0ZXJ5Qm90dG9tQ3VycmVudEluZGljYXRvck5vZGUnICkgKTtcclxuXHJcbiAgICAvLyByZW5kZXJpbmcgb3JkZXJcclxuICAgIHRoaXMuY2lyY3VpdFN3aXRjaE5vZGVzLmZvckVhY2goIHN3aXRjaE5vZGUgPT4ge1xyXG4gICAgICBzd2l0Y2hOb2RlLmNvbm5lY3Rpb25BcmVhTm9kZXMuZm9yRWFjaCggY29ubmVjdGlvbkFyZWFOb2RlID0+IHtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKCBjb25uZWN0aW9uQXJlYU5vZGUgKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ib3R0b21XaXJlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYXR0ZXJ5Tm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2FwYWNpdG9yTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50b3BXaXJlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jaXJjdWl0U3dpdGNoTm9kZXNbIDAgXSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5iYXR0ZXJ5VG9wQ3VycmVudEluZGljYXRvck5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYmF0dGVyeUJvdHRvbUN1cnJlbnRJbmRpY2F0b3JOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwbGF0ZVNlcGFyYXRpb25EcmFnSGFuZGxlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcGxhdGVBcmVhRHJhZ0hhbmRsZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY2lyY3VpdFN3aXRjaE5vZGVzWyAxIF0gKTtcclxuXHJcbiAgICAvLyBiYXR0ZXJ5XHJcbiAgICB0aGlzLmJhdHRlcnlOb2RlLmNlbnRlciA9IG1vZGVsLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCB0aGlzLmNpcmN1aXQuYmF0dGVyeS5wb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIGNhcGFjaXRvclxyXG4gICAgY2FwYWNpdG9yTm9kZS5jZW50ZXIgPSBtb2RlbC5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggdGhpcy5jaXJjdWl0LmNhcGFjaXRvci5wb3NpdGlvbiApO1xyXG5cclxuICAgIC8vIHRvcCBjdXJyZW50IGluZGljYXRvclxyXG4gICAgY29uc3QgeCA9IHRoaXMuYmF0dGVyeU5vZGUucmlnaHQgKyAoIHRoaXMuY2lyY3VpdFN3aXRjaE5vZGVzWyAwIF0ubGVmdCAtIHRoaXMuYmF0dGVyeU5vZGUucmlnaHQgKSAvIDI7XHJcblxyXG4gICAgLy8gY3VycmVudCBpbmRpY2F0b3Igb2Zmc2V0XHJcbiAgICBjb25zdCBpbmRpY2F0b3JPZmZzZXQgPSA3IC8gMjtcclxuICAgIGxldCB5ID0gdGhpcy50b3BXaXJlTm9kZS5ib3VuZHMubWluWSArIGluZGljYXRvck9mZnNldDtcclxuICAgIHRoaXMuYmF0dGVyeVRvcEN1cnJlbnRJbmRpY2F0b3JOb2RlLnRyYW5zbGF0ZSggeCwgeSApO1xyXG5cclxuICAgIC8vIGJvdHRvbSBjdXJyZW50IGluZGljYXRvclxyXG4gICAgeSA9IHRoaXMuYm90dG9tV2lyZU5vZGUuYm91bmRzLmdldE1heFkoKSAtIGluZGljYXRvck9mZnNldDtcclxuICAgIHRoaXMuYmF0dGVyeUJvdHRvbUN1cnJlbnRJbmRpY2F0b3JOb2RlLnRyYW5zbGF0ZSggeCwgeSApO1xyXG5cclxuICAgIC8vIHdpcmVzIHNoYXBlcyBhcmUgaW4gbW9kZWwgY29vcmRpbmF0ZSBmcmFtZSwgc28gdGhlIG5vZGVzIGxpdmUgYXQgKDAsMCkgdGhlIGZvbGxvd2luZyBkb2VzIG5vdGhpbmcgYnV0IGl0XHJcbiAgICAvLyBleHBsaWNpdGx5IGRlZmluZXMgdGhlIGxheW91dC5cclxuICAgIHRoaXMudG9wV2lyZU5vZGUudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG4gICAgdGhpcy5ib3R0b21XaXJlTm9kZS50cmFuc2xhdGlvbiA9IG5ldyBWZWN0b3IyKCAwLCAwICk7XHJcblxyXG4gICAgLy8gb2JzZXJ2ZXIgZm9yIHZpc2liaWxpdHkgb2YgdGhlIGN1cnJlbnQgaW5kaWNhdG9yc1xyXG4gICAgbW9kZWwuY3VycmVudFZpc2libGVQcm9wZXJ0eS5saW5rKCBjdXJyZW50SW5kaWNhdG9yc1Zpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLmJhdHRlcnlUb3BDdXJyZW50SW5kaWNhdG9yTm9kZS5zZXRWaXNpYmxlKCBjdXJyZW50SW5kaWNhdG9yc1Zpc2libGUgKTtcclxuICAgICAgdGhpcy5iYXR0ZXJ5Qm90dG9tQ3VycmVudEluZGljYXRvck5vZGUuc2V0VmlzaWJsZSggY3VycmVudEluZGljYXRvcnNWaXNpYmxlICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5jYXBhY2l0b3JMYWJCYXNpY3MucmVnaXN0ZXIoICdDTEJDaXJjdWl0Tm9kZScsIENMQkNpcmN1aXROb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IENMQkNpcmN1aXROb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7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