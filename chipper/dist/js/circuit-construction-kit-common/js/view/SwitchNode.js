// Copyright 2015-2023, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Switch.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../kite/js/imports.js';
import { Circle, Color, FireListener, LinearGradient, Node, Path, Rectangle } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';

// constants
// dimensions for schematic battery
const LIFELIKE_DIAMETER = 16;
const SWITCH_START = CCKCConstants.SWITCH_START;
const SWITCH_END = CCKCConstants.SWITCH_END;
const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;
const lifelikeNodeThickness = 8;
const lifelikeGradient = new LinearGradient(0, -lifelikeNodeThickness / 2, 0, lifelikeNodeThickness / 2).addColorStop(0, '#d48270').addColorStop(0.3, '#e39b8c').addColorStop(1, '#b56351');
/**
 * @param viewType
 * @param fill
 * @param thickness
 * @param curveDiameter - the diameter of the circles in the slots
 * @param closed - whether the switch is closed
 * @returns - with leftSegmentNode, rotatingSegmentNode and rightSegmentNode properties (also {Node})
 */
const createNode = function (viewType, fill, thickness, curveDiameter, closed) {
  const edgeRadius = thickness / 2;
  const leftSegmentNode = new Rectangle(0, -thickness / 2, SWITCH_LENGTH * SWITCH_START, thickness, {
    cornerRadius: edgeRadius,
    fill: fill,
    stroke: Color.BLACK,
    pickable: true // This is necessary because we use scenery hit testing for the probe hit testing
  });

  // See the picture at https://github.com/phetsims/circuit-construction-kit-common/issues/313
  // This part has a curved notch that fits into the other segment
  const shape = new Shape().moveTo(0, thickness / 2).lineTo(SWITCH_LENGTH * SWITCH_START - curveDiameter, thickness / 2)

  // similar to the notch below
  .arc(SWITCH_LENGTH * SWITCH_START - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false).arc(SWITCH_LENGTH * SWITCH_START + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true).lineTo(SWITCH_LENGTH * SWITCH_START + curveDiameter, -thickness / 2).lineTo(0, -thickness / 2).lineTo(0, thickness / 2);
  const rotatingSegmentNode = new Path(shape, {
    x: SWITCH_LENGTH * SWITCH_START,
    fill: fill,
    stroke: Color.BLACK,
    lineWidth: viewType === CircuitElementViewType.SCHEMATIC ? 0 : 1,
    pickable: true // This is necessary because we use scenery hit testing for the probe hit testing
  });

  rotatingSegmentNode.rotation = closed ? 0 : -Math.PI / 4;
  const rightSegmentShape = new Shape().moveTo(SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2)

  // similar to the notch above
  .lineTo(SWITCH_LENGTH * SWITCH_END - curveDiameter, 0).arc(SWITCH_LENGTH * SWITCH_END - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false).arc(SWITCH_LENGTH * SWITCH_END + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true).lineTo(SWITCH_LENGTH * SWITCH_END + curveDiameter, -thickness / 2).lineTo(SWITCH_LENGTH - edgeRadius, -thickness / 2).arc(SWITCH_LENGTH - edgeRadius, 0, edgeRadius, -Math.PI / 2, Math.PI / 2).lineTo(SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2);
  const rightSegmentNode = new Path(rightSegmentShape, {
    fill: fill,
    stroke: Color.BLACK,
    pickable: true
  });
  const lifelikeHinge = new Circle(thickness * 0.6, {
    fill: '#a7a8ab',
    stroke: Color.BLACK,
    lineWidth: 4,
    x: SWITCH_LENGTH * SWITCH_START
  });
  const node = new Node({
    children: [leftSegmentNode, rotatingSegmentNode, rightSegmentNode, lifelikeHinge]
  });
  if (viewType === CircuitElementViewType.SCHEMATIC) {
    node.addChild(new Circle(thickness * 0.6, {
      fill: Color.BLACK,
      stroke: Color.BLACK,
      lineWidth: 4,
      x: SWITCH_LENGTH * SWITCH_END
    }));
  }
  node.leftSegmentNode = leftSegmentNode;
  node.rotatingSegmentNode = rotatingSegmentNode;
  node.rightSegmentNode = rightSegmentNode;
  return node;
};

// Create all of the images
const lifelikeOpenNode = createNode(CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, false);
const lifelikeOpenImage = lifelikeOpenNode.rasterized({
  wrap: false
});
const lifelikeClosedNode = createNode(CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, true);
const lifelikeClosedImage = lifelikeClosedNode.rasterized({
  wrap: false
});
const schematicOpenImage = createNode(CircuitElementViewType.SCHEMATIC, Color.BLACK, CCKCConstants.SCHEMATIC_LINE_WIDTH, 0, false).rasterized({
  wrap: false
});
const schematicClosedImage = createNode(CircuitElementViewType.SCHEMATIC, Color.BLACK, CCKCConstants.SCHEMATIC_LINE_WIDTH, 0, true).rasterized({
  wrap: false
});
export default class SwitchNode extends FixedCircuitElementNode {
  // the Switch rendered by this Node, equivalent to this.circuitElement

  /**
   * @param screenView - main screen view, null for icon
   * @param circuitNode, null for icon
   * @param circuitSwitch
   * @param viewTypeProperty
   * @param tandem
   * @param [providedOptions]
   */
  constructor(screenView, circuitNode, circuitSwitch, viewTypeProperty, tandem, providedOptions) {
    const lifelikeNode = new Node();
    const schematicNode = new Node();
    const closeListener = closed => {
      lifelikeNode.children = [closed ? lifelikeClosedImage : lifelikeOpenImage];
      schematicNode.children = [closed ? schematicClosedImage : schematicOpenImage];
    };
    circuitSwitch.isClosedProperty.link(closeListener);
    super(screenView, circuitNode, circuitSwitch, viewTypeProperty, lifelikeNode, schematicNode, tandem, providedOptions);
    this.circuitSwitch = circuitSwitch;
    let downPoint = null;

    // When the user taps the switch, toggle whether it is open or closed.
    const fireListener = new FireListener({
      tandem: tandem.createTandem('fireListener'),
      attach: false,
      press: event => {
        downPoint = circuitNode.globalToLocalPoint(event.pointer.point);
      },
      fire: event => {
        // Measure how far the switch was dragged in CircuitNode coordinates (if any)
        const distance = circuitNode.globalToLocalPoint(event.pointer.point).distance(downPoint);

        // Toggle the state of the switch, but only if the event is classified as a tap and not a drag
        if (distance < CCKCConstants.TAP_THRESHOLD) {
          circuitSwitch.isClosedProperty.value = !circuitSwitch.isClosedProperty.value;
        }
      }
    });

    // Only add the input listener if it is not for a toolbar icon
    screenView && this.contentNode.addInputListener(fireListener);

    // For hit testing
    this.lifelikeOpenNode = createNode(CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, false);
    this.disposeSwitchNode = () => {
      circuitSwitch.isClosedProperty.unlink(closeListener);
      screenView && this.contentNode.removeInputListener(fireListener);

      // Make sure the lifelikeNode and schematicNode are not listed as parents for their children because the children
      // (images) persist.
      lifelikeNode.dispose();
      schematicNode.dispose();
      fireListener.interrupt();
      fireListener.dispose();
    };
  }

  /**
   * Determine whether the start side (with the pivot) contains the sensor point.
   * @param point - in view coordinates
   */
  startSideContainsSensorPoint(point) {
    const localPoint = this.contentNode.parentToLocalPoint(point);
    const leftSegmentContainsPoint = lifelikeOpenNode.leftSegmentNode.containsPoint(localPoint);
    const node = this.circuitSwitch.isClosedProperty.get() ? lifelikeClosedNode : lifelikeOpenNode;
    const rotatingSegmentContainsPoint = node.rotatingSegmentNode.containsPoint(localPoint);
    return leftSegmentContainsPoint || rotatingSegmentContainsPoint;
  }

  /**
   * Determine whether the end side (with the pivot) contains the sensor point.
   * @param point - in view coordinates
   */
  endSideContainsSensorPoint(point) {
    const localPoint = this.contentNode.parentToLocalPoint(point);
    return lifelikeOpenNode.rightSegmentNode.containsPoint(localPoint);
  }

  /**
   * Returns true if the node hits the sensor at the given point.
   */
  containsSensorPoint(globalPoint) {
    const localPoint = this.globalToParentPoint(globalPoint);

    // make sure bounds are correct if cut or joined in this animation frame
    this.step();
    return this.startSideContainsSensorPoint(localPoint) || this.endSideContainsSensorPoint(localPoint);
  }
  dispose() {
    this.disposeSwitchNode();
    super.dispose();
  }
}
circuitConstructionKitCommon.register('SwitchNode', SwitchNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkNpcmNsZSIsIkNvbG9yIiwiRmlyZUxpc3RlbmVyIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIkNDS0NDb25zdGFudHMiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZSIsIkZpeGVkQ2lyY3VpdEVsZW1lbnROb2RlIiwiTElGRUxJS0VfRElBTUVURVIiLCJTV0lUQ0hfU1RBUlQiLCJTV0lUQ0hfRU5EIiwiU1dJVENIX0xFTkdUSCIsImxpZmVsaWtlTm9kZVRoaWNrbmVzcyIsImxpZmVsaWtlR3JhZGllbnQiLCJhZGRDb2xvclN0b3AiLCJjcmVhdGVOb2RlIiwidmlld1R5cGUiLCJmaWxsIiwidGhpY2tuZXNzIiwiY3VydmVEaWFtZXRlciIsImNsb3NlZCIsImVkZ2VSYWRpdXMiLCJsZWZ0U2VnbWVudE5vZGUiLCJjb3JuZXJSYWRpdXMiLCJzdHJva2UiLCJCTEFDSyIsInBpY2thYmxlIiwic2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJhcmMiLCJNYXRoIiwiUEkiLCJyb3RhdGluZ1NlZ21lbnROb2RlIiwieCIsImxpbmVXaWR0aCIsIlNDSEVNQVRJQyIsInJvdGF0aW9uIiwicmlnaHRTZWdtZW50U2hhcGUiLCJyaWdodFNlZ21lbnROb2RlIiwibGlmZWxpa2VIaW5nZSIsIm5vZGUiLCJjaGlsZHJlbiIsImFkZENoaWxkIiwibGlmZWxpa2VPcGVuTm9kZSIsIkxJRkVMSUtFIiwibGlmZWxpa2VPcGVuSW1hZ2UiLCJyYXN0ZXJpemVkIiwid3JhcCIsImxpZmVsaWtlQ2xvc2VkTm9kZSIsImxpZmVsaWtlQ2xvc2VkSW1hZ2UiLCJzY2hlbWF0aWNPcGVuSW1hZ2UiLCJTQ0hFTUFUSUNfTElORV9XSURUSCIsInNjaGVtYXRpY0Nsb3NlZEltYWdlIiwiU3dpdGNoTm9kZSIsImNvbnN0cnVjdG9yIiwic2NyZWVuVmlldyIsImNpcmN1aXROb2RlIiwiY2lyY3VpdFN3aXRjaCIsInZpZXdUeXBlUHJvcGVydHkiLCJ0YW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJsaWZlbGlrZU5vZGUiLCJzY2hlbWF0aWNOb2RlIiwiY2xvc2VMaXN0ZW5lciIsImlzQ2xvc2VkUHJvcGVydHkiLCJsaW5rIiwiZG93blBvaW50IiwiZmlyZUxpc3RlbmVyIiwiY3JlYXRlVGFuZGVtIiwiYXR0YWNoIiwicHJlc3MiLCJldmVudCIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsImZpcmUiLCJkaXN0YW5jZSIsIlRBUF9USFJFU0hPTEQiLCJ2YWx1ZSIsImNvbnRlbnROb2RlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImRpc3Bvc2VTd2l0Y2hOb2RlIiwidW5saW5rIiwicmVtb3ZlSW5wdXRMaXN0ZW5lciIsImRpc3Bvc2UiLCJpbnRlcnJ1cHQiLCJzdGFydFNpZGVDb250YWluc1NlbnNvclBvaW50IiwibG9jYWxQb2ludCIsInBhcmVudFRvTG9jYWxQb2ludCIsImxlZnRTZWdtZW50Q29udGFpbnNQb2ludCIsImNvbnRhaW5zUG9pbnQiLCJnZXQiLCJyb3RhdGluZ1NlZ21lbnRDb250YWluc1BvaW50IiwiZW5kU2lkZUNvbnRhaW5zU2Vuc29yUG9pbnQiLCJjb250YWluc1NlbnNvclBvaW50IiwiZ2xvYmFsUG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50Iiwic3RlcCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3dpdGNoTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZW5kZXJzIHRoZSBsaWZlbGlrZS9zY2hlbWF0aWMgdmlldyBmb3IgYSBTd2l0Y2guXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgRmlyZUxpc3RlbmVyLCBHcmFkaWVudCwgTGluZWFyR3JhZGllbnQsIE5vZGUsIFBhdGgsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50Vmlld1R5cGUgZnJvbSAnLi4vbW9kZWwvQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZS5qcyc7XHJcbmltcG9ydCBTd2l0Y2ggZnJvbSAnLi4vbW9kZWwvU3dpdGNoLmpzJztcclxuaW1wb3J0IENDS0NTY3JlZW5WaWV3IGZyb20gJy4vQ0NLQ1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdE5vZGUgZnJvbSAnLi9DaXJjdWl0Tm9kZS5qcyc7XHJcbmltcG9ydCBGaXhlZENpcmN1aXRFbGVtZW50Tm9kZSwgeyBGaXhlZENpcmN1aXRFbGVtZW50Tm9kZU9wdGlvbnMgfSBmcm9tICcuL0ZpeGVkQ2lyY3VpdEVsZW1lbnROb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBkaW1lbnNpb25zIGZvciBzY2hlbWF0aWMgYmF0dGVyeVxyXG5jb25zdCBMSUZFTElLRV9ESUFNRVRFUiA9IDE2O1xyXG5jb25zdCBTV0lUQ0hfU1RBUlQgPSBDQ0tDQ29uc3RhbnRzLlNXSVRDSF9TVEFSVDtcclxuY29uc3QgU1dJVENIX0VORCA9IENDS0NDb25zdGFudHMuU1dJVENIX0VORDtcclxuY29uc3QgU1dJVENIX0xFTkdUSCA9IENDS0NDb25zdGFudHMuU1dJVENIX0xFTkdUSDtcclxuXHJcbmNvbnN0IGxpZmVsaWtlTm9kZVRoaWNrbmVzcyA9IDg7XHJcbmNvbnN0IGxpZmVsaWtlR3JhZGllbnQgPSBuZXcgTGluZWFyR3JhZGllbnQoIDAsIC1saWZlbGlrZU5vZGVUaGlja25lc3MgLyAyLCAwLCBsaWZlbGlrZU5vZGVUaGlja25lc3MgLyAyIClcclxuICAuYWRkQ29sb3JTdG9wKCAwLCAnI2Q0ODI3MCcgKVxyXG4gIC5hZGRDb2xvclN0b3AoIDAuMywgJyNlMzliOGMnIClcclxuICAuYWRkQ29sb3JTdG9wKCAxLCAnI2I1NjM1MScgKTtcclxuXHJcbnR5cGUgU2VnbWVudGVkTm9kZSA9IHtcclxuICBsZWZ0U2VnbWVudE5vZGU6IE5vZGU7XHJcbiAgcmlnaHRTZWdtZW50Tm9kZTogTm9kZTtcclxuICByb3RhdGluZ1NlZ21lbnROb2RlOiBOb2RlO1xyXG59ICYgTm9kZTtcclxuLyoqXHJcbiAqIEBwYXJhbSB2aWV3VHlwZVxyXG4gKiBAcGFyYW0gZmlsbFxyXG4gKiBAcGFyYW0gdGhpY2tuZXNzXHJcbiAqIEBwYXJhbSBjdXJ2ZURpYW1ldGVyIC0gdGhlIGRpYW1ldGVyIG9mIHRoZSBjaXJjbGVzIGluIHRoZSBzbG90c1xyXG4gKiBAcGFyYW0gY2xvc2VkIC0gd2hldGhlciB0aGUgc3dpdGNoIGlzIGNsb3NlZFxyXG4gKiBAcmV0dXJucyAtIHdpdGggbGVmdFNlZ21lbnROb2RlLCByb3RhdGluZ1NlZ21lbnROb2RlIGFuZCByaWdodFNlZ21lbnROb2RlIHByb3BlcnRpZXMgKGFsc28ge05vZGV9KVxyXG4gKi9cclxuY29uc3QgY3JlYXRlTm9kZSA9IGZ1bmN0aW9uKCB2aWV3VHlwZTogQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZSwgZmlsbDogR3JhZGllbnQgfCBDb2xvciwgdGhpY2tuZXNzOiBudW1iZXIsIGN1cnZlRGlhbWV0ZXI6IG51bWJlciwgY2xvc2VkOiBib29sZWFuICkge1xyXG4gIGNvbnN0IGVkZ2VSYWRpdXMgPSB0aGlja25lc3MgLyAyO1xyXG5cclxuICBjb25zdCBsZWZ0U2VnbWVudE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLFxyXG4gICAgLXRoaWNrbmVzcyAvIDIsXHJcbiAgICBTV0lUQ0hfTEVOR1RIICogU1dJVENIX1NUQVJULFxyXG4gICAgdGhpY2tuZXNzLCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogZWRnZVJhZGl1cyxcclxuICAgICAgZmlsbDogZmlsbCxcclxuICAgICAgc3Ryb2tlOiBDb2xvci5CTEFDSyxcclxuICAgICAgcGlja2FibGU6IHRydWUgLy8gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB3ZSB1c2Ugc2NlbmVyeSBoaXQgdGVzdGluZyBmb3IgdGhlIHByb2JlIGhpdCB0ZXN0aW5nXHJcbiAgICB9ICk7XHJcblxyXG4gIC8vIFNlZSB0aGUgcGljdHVyZSBhdCBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvMzEzXHJcbiAgLy8gVGhpcyBwYXJ0IGhhcyBhIGN1cnZlZCBub3RjaCB0aGF0IGZpdHMgaW50byB0aGUgb3RoZXIgc2VnbWVudFxyXG4gIGNvbnN0IHNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgIC5tb3ZlVG8oIDAsIHRoaWNrbmVzcyAvIDIgKVxyXG4gICAgLmxpbmVUbyggU1dJVENIX0xFTkdUSCAqIFNXSVRDSF9TVEFSVCAtIGN1cnZlRGlhbWV0ZXIsIHRoaWNrbmVzcyAvIDIgKVxyXG5cclxuICAgIC8vIHNpbWlsYXIgdG8gdGhlIG5vdGNoIGJlbG93XHJcbiAgICAuYXJjKCBTV0lUQ0hfTEVOR1RIICogU1dJVENIX1NUQVJUIC0gY3VydmVEaWFtZXRlciAvIDIsIDAsIGN1cnZlRGlhbWV0ZXIgLyAyLCBNYXRoLlBJLCAwLCBmYWxzZSApXHJcbiAgICAuYXJjKCBTV0lUQ0hfTEVOR1RIICogU1dJVENIX1NUQVJUICsgY3VydmVEaWFtZXRlciAvIDIsIDAsIGN1cnZlRGlhbWV0ZXIgLyAyLCBNYXRoLlBJLCAwLCB0cnVlIClcclxuICAgIC5saW5lVG8oIFNXSVRDSF9MRU5HVEggKiBTV0lUQ0hfU1RBUlQgKyBjdXJ2ZURpYW1ldGVyLCAtdGhpY2tuZXNzIC8gMiApXHJcblxyXG4gICAgLmxpbmVUbyggMCwgLXRoaWNrbmVzcyAvIDIgKVxyXG4gICAgLmxpbmVUbyggMCwgdGhpY2tuZXNzIC8gMiApO1xyXG4gIGNvbnN0IHJvdGF0aW5nU2VnbWVudE5vZGUgPSBuZXcgUGF0aCggc2hhcGUsIHtcclxuICAgIHg6IFNXSVRDSF9MRU5HVEggKiBTV0lUQ0hfU1RBUlQsXHJcbiAgICBmaWxsOiBmaWxsLFxyXG4gICAgc3Ryb2tlOiBDb2xvci5CTEFDSyxcclxuICAgIGxpbmVXaWR0aDogdmlld1R5cGUgPT09IENpcmN1aXRFbGVtZW50Vmlld1R5cGUuU0NIRU1BVElDID8gMCA6IDEsXHJcbiAgICBwaWNrYWJsZTogdHJ1ZSAvLyBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHdlIHVzZSBzY2VuZXJ5IGhpdCB0ZXN0aW5nIGZvciB0aGUgcHJvYmUgaGl0IHRlc3RpbmdcclxuICB9ICk7XHJcblxyXG4gIHJvdGF0aW5nU2VnbWVudE5vZGUucm90YXRpb24gPSBjbG9zZWQgPyAwIDogLU1hdGguUEkgLyA0O1xyXG5cclxuICBjb25zdCByaWdodFNlZ21lbnRTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAubW92ZVRvKCBTV0lUQ0hfTEVOR1RIICogU1dJVENIX0VORCAtIGN1cnZlRGlhbWV0ZXIsIHRoaWNrbmVzcyAvIDIgKVxyXG5cclxuICAgIC8vIHNpbWlsYXIgdG8gdGhlIG5vdGNoIGFib3ZlXHJcbiAgICAubGluZVRvKCBTV0lUQ0hfTEVOR1RIICogU1dJVENIX0VORCAtIGN1cnZlRGlhbWV0ZXIsIDAgKVxyXG4gICAgLmFyYyggU1dJVENIX0xFTkdUSCAqIFNXSVRDSF9FTkQgLSBjdXJ2ZURpYW1ldGVyIC8gMiwgMCwgY3VydmVEaWFtZXRlciAvIDIsIE1hdGguUEksIDAsIGZhbHNlIClcclxuICAgIC5hcmMoIFNXSVRDSF9MRU5HVEggKiBTV0lUQ0hfRU5EICsgY3VydmVEaWFtZXRlciAvIDIsIDAsIGN1cnZlRGlhbWV0ZXIgLyAyLCBNYXRoLlBJLCAwLCB0cnVlIClcclxuICAgIC5saW5lVG8oIFNXSVRDSF9MRU5HVEggKiBTV0lUQ0hfRU5EICsgY3VydmVEaWFtZXRlciwgLXRoaWNrbmVzcyAvIDIgKVxyXG5cclxuICAgIC5saW5lVG8oIFNXSVRDSF9MRU5HVEggLSBlZGdlUmFkaXVzLCAtdGhpY2tuZXNzIC8gMiApXHJcbiAgICAuYXJjKCBTV0lUQ0hfTEVOR1RIIC0gZWRnZVJhZGl1cywgMCwgZWRnZVJhZGl1cywgLU1hdGguUEkgLyAyLCBNYXRoLlBJIC8gMiApXHJcbiAgICAubGluZVRvKCBTV0lUQ0hfTEVOR1RIICogU1dJVENIX0VORCAtIGN1cnZlRGlhbWV0ZXIsIHRoaWNrbmVzcyAvIDIgKTtcclxuICBjb25zdCByaWdodFNlZ21lbnROb2RlID0gbmV3IFBhdGgoIHJpZ2h0U2VnbWVudFNoYXBlLCB7XHJcbiAgICBmaWxsOiBmaWxsLFxyXG4gICAgc3Ryb2tlOiBDb2xvci5CTEFDSyxcclxuICAgIHBpY2thYmxlOiB0cnVlXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBsaWZlbGlrZUhpbmdlID0gbmV3IENpcmNsZSggdGhpY2tuZXNzICogMC42LCB7XHJcbiAgICBmaWxsOiAnI2E3YThhYicsXHJcbiAgICBzdHJva2U6IENvbG9yLkJMQUNLLFxyXG4gICAgbGluZVdpZHRoOiA0LFxyXG4gICAgeDogU1dJVENIX0xFTkdUSCAqIFNXSVRDSF9TVEFSVFxyXG4gIH0gKTtcclxuXHJcbiAgY29uc3Qgbm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICBjaGlsZHJlbjogWyBsZWZ0U2VnbWVudE5vZGUsIHJvdGF0aW5nU2VnbWVudE5vZGUsIHJpZ2h0U2VnbWVudE5vZGUsIGxpZmVsaWtlSGluZ2UgXVxyXG4gIH0gKSBhcyBTZWdtZW50ZWROb2RlO1xyXG5cclxuICBpZiAoIHZpZXdUeXBlID09PSBDaXJjdWl0RWxlbWVudFZpZXdUeXBlLlNDSEVNQVRJQyApIHtcclxuICAgIG5vZGUuYWRkQ2hpbGQoIG5ldyBDaXJjbGUoIHRoaWNrbmVzcyAqIDAuNiwge1xyXG4gICAgICBmaWxsOiBDb2xvci5CTEFDSyxcclxuICAgICAgc3Ryb2tlOiBDb2xvci5CTEFDSyxcclxuICAgICAgbGluZVdpZHRoOiA0LFxyXG4gICAgICB4OiBTV0lUQ0hfTEVOR1RIICogU1dJVENIX0VORFxyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICBub2RlLmxlZnRTZWdtZW50Tm9kZSA9IGxlZnRTZWdtZW50Tm9kZTtcclxuICBub2RlLnJvdGF0aW5nU2VnbWVudE5vZGUgPSByb3RhdGluZ1NlZ21lbnROb2RlO1xyXG4gIG5vZGUucmlnaHRTZWdtZW50Tm9kZSA9IHJpZ2h0U2VnbWVudE5vZGU7XHJcblxyXG4gIHJldHVybiBub2RlO1xyXG59O1xyXG5cclxuLy8gQ3JlYXRlIGFsbCBvZiB0aGUgaW1hZ2VzXHJcbmNvbnN0IGxpZmVsaWtlT3Blbk5vZGUgPSBjcmVhdGVOb2RlKFxyXG4gIENpcmN1aXRFbGVtZW50Vmlld1R5cGUuTElGRUxJS0UsIGxpZmVsaWtlR3JhZGllbnQsIExJRkVMSUtFX0RJQU1FVEVSLCA2LCBmYWxzZVxyXG4pO1xyXG5jb25zdCBsaWZlbGlrZU9wZW5JbWFnZSA9IGxpZmVsaWtlT3Blbk5vZGUucmFzdGVyaXplZCggeyB3cmFwOiBmYWxzZSB9ICk7XHJcblxyXG5jb25zdCBsaWZlbGlrZUNsb3NlZE5vZGUgPSBjcmVhdGVOb2RlKFxyXG4gIENpcmN1aXRFbGVtZW50Vmlld1R5cGUuTElGRUxJS0UsIGxpZmVsaWtlR3JhZGllbnQsIExJRkVMSUtFX0RJQU1FVEVSLCA2LCB0cnVlXHJcbik7XHJcbmNvbnN0IGxpZmVsaWtlQ2xvc2VkSW1hZ2UgPSBsaWZlbGlrZUNsb3NlZE5vZGUucmFzdGVyaXplZCggeyB3cmFwOiBmYWxzZSB9ICk7XHJcblxyXG5jb25zdCBzY2hlbWF0aWNPcGVuSW1hZ2UgPSBjcmVhdGVOb2RlKFxyXG4gIENpcmN1aXRFbGVtZW50Vmlld1R5cGUuU0NIRU1BVElDLCBDb2xvci5CTEFDSywgQ0NLQ0NvbnN0YW50cy5TQ0hFTUFUSUNfTElORV9XSURUSCwgMCwgZmFsc2VcclxuKS5yYXN0ZXJpemVkKCB7IHdyYXA6IGZhbHNlIH0gKTtcclxuXHJcbmNvbnN0IHNjaGVtYXRpY0Nsb3NlZEltYWdlID0gY3JlYXRlTm9kZShcclxuICBDaXJjdWl0RWxlbWVudFZpZXdUeXBlLlNDSEVNQVRJQywgQ29sb3IuQkxBQ0ssIENDS0NDb25zdGFudHMuU0NIRU1BVElDX0xJTkVfV0lEVEgsIDAsIHRydWVcclxuKS5yYXN0ZXJpemVkKCB7IHdyYXA6IGZhbHNlIH0gKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN3aXRjaE5vZGUgZXh0ZW5kcyBGaXhlZENpcmN1aXRFbGVtZW50Tm9kZSB7XHJcblxyXG4gIC8vIHRoZSBTd2l0Y2ggcmVuZGVyZWQgYnkgdGhpcyBOb2RlLCBlcXVpdmFsZW50IHRvIHRoaXMuY2lyY3VpdEVsZW1lbnRcclxuICBwdWJsaWMgcmVhZG9ubHkgY2lyY3VpdFN3aXRjaDogU3dpdGNoO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbGlmZWxpa2VPcGVuTm9kZTogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VTd2l0Y2hOb2RlOiAoKSA9PiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gc2NyZWVuVmlldyAtIG1haW4gc2NyZWVuIHZpZXcsIG51bGwgZm9yIGljb25cclxuICAgKiBAcGFyYW0gY2lyY3VpdE5vZGUsIG51bGwgZm9yIGljb25cclxuICAgKiBAcGFyYW0gY2lyY3VpdFN3aXRjaFxyXG4gICAqIEBwYXJhbSB2aWV3VHlwZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHRhbmRlbVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuVmlldzogQ0NLQ1NjcmVlblZpZXcgfCBudWxsLCBjaXJjdWl0Tm9kZTogQ2lyY3VpdE5vZGUgfCBudWxsLCBjaXJjdWl0U3dpdGNoOiBTd2l0Y2gsXHJcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3VHlwZVByb3BlcnR5OiBQcm9wZXJ0eTxDaXJjdWl0RWxlbWVudFZpZXdUeXBlPiwgdGFuZGVtOiBUYW5kZW0sIHByb3ZpZGVkT3B0aW9ucz86IEZpeGVkQ2lyY3VpdEVsZW1lbnROb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBsaWZlbGlrZU5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgY29uc3Qgc2NoZW1hdGljTm9kZSA9IG5ldyBOb2RlKCk7XHJcbiAgICBjb25zdCBjbG9zZUxpc3RlbmVyID0gKCBjbG9zZWQ6IGJvb2xlYW4gKSA9PiB7XHJcbiAgICAgIGxpZmVsaWtlTm9kZS5jaGlsZHJlbiA9IFsgY2xvc2VkID8gbGlmZWxpa2VDbG9zZWRJbWFnZSA6IGxpZmVsaWtlT3BlbkltYWdlIF07XHJcbiAgICAgIHNjaGVtYXRpY05vZGUuY2hpbGRyZW4gPSBbIGNsb3NlZCA/IHNjaGVtYXRpY0Nsb3NlZEltYWdlIDogc2NoZW1hdGljT3BlbkltYWdlIF07XHJcbiAgICB9O1xyXG4gICAgY2lyY3VpdFN3aXRjaC5pc0Nsb3NlZFByb3BlcnR5LmxpbmsoIGNsb3NlTGlzdGVuZXIgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgc2NyZWVuVmlldyxcclxuICAgICAgY2lyY3VpdE5vZGUsXHJcbiAgICAgIGNpcmN1aXRTd2l0Y2gsXHJcbiAgICAgIHZpZXdUeXBlUHJvcGVydHksXHJcbiAgICAgIGxpZmVsaWtlTm9kZSxcclxuICAgICAgc2NoZW1hdGljTm9kZSxcclxuICAgICAgdGFuZGVtLFxyXG4gICAgICBwcm92aWRlZE9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5jaXJjdWl0U3dpdGNoID0gY2lyY3VpdFN3aXRjaDtcclxuXHJcbiAgICBsZXQgZG93blBvaW50OiBWZWN0b3IyIHwgbnVsbCA9IG51bGw7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdXNlciB0YXBzIHRoZSBzd2l0Y2gsIHRvZ2dsZSB3aGV0aGVyIGl0IGlzIG9wZW4gb3IgY2xvc2VkLlxyXG4gICAgY29uc3QgZmlyZUxpc3RlbmVyID0gbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmaXJlTGlzdGVuZXInICksXHJcbiAgICAgIGF0dGFjaDogZmFsc2UsXHJcbiAgICAgIHByZXNzOiBldmVudCA9PiB7XHJcbiAgICAgICAgZG93blBvaW50ID0gY2lyY3VpdE5vZGUhLmdsb2JhbFRvTG9jYWxQb2ludCggZXZlbnQucG9pbnRlci5wb2ludCApO1xyXG4gICAgICB9LFxyXG4gICAgICBmaXJlOiBldmVudCA9PiB7XHJcblxyXG4gICAgICAgIC8vIE1lYXN1cmUgaG93IGZhciB0aGUgc3dpdGNoIHdhcyBkcmFnZ2VkIGluIENpcmN1aXROb2RlIGNvb3JkaW5hdGVzIChpZiBhbnkpXHJcbiAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBjaXJjdWl0Tm9kZSEuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICkuZGlzdGFuY2UoIGRvd25Qb2ludCEgKTtcclxuXHJcbiAgICAgICAgLy8gVG9nZ2xlIHRoZSBzdGF0ZSBvZiB0aGUgc3dpdGNoLCBidXQgb25seSBpZiB0aGUgZXZlbnQgaXMgY2xhc3NpZmllZCBhcyBhIHRhcCBhbmQgbm90IGEgZHJhZ1xyXG4gICAgICAgIGlmICggZGlzdGFuY2UgPCBDQ0tDQ29uc3RhbnRzLlRBUF9USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgICBjaXJjdWl0U3dpdGNoLmlzQ2xvc2VkUHJvcGVydHkudmFsdWUgPSAhY2lyY3VpdFN3aXRjaC5pc0Nsb3NlZFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE9ubHkgYWRkIHRoZSBpbnB1dCBsaXN0ZW5lciBpZiBpdCBpcyBub3QgZm9yIGEgdG9vbGJhciBpY29uXHJcbiAgICBzY3JlZW5WaWV3ICYmIHRoaXMuY29udGVudE5vZGUuYWRkSW5wdXRMaXN0ZW5lciggZmlyZUxpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gRm9yIGhpdCB0ZXN0aW5nXHJcbiAgICB0aGlzLmxpZmVsaWtlT3Blbk5vZGUgPSBjcmVhdGVOb2RlKFxyXG4gICAgICBDaXJjdWl0RWxlbWVudFZpZXdUeXBlLkxJRkVMSUtFLCBsaWZlbGlrZUdyYWRpZW50LCBMSUZFTElLRV9ESUFNRVRFUiwgNiwgZmFsc2VcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlU3dpdGNoTm9kZSA9ICgpID0+IHtcclxuICAgICAgY2lyY3VpdFN3aXRjaC5pc0Nsb3NlZFByb3BlcnR5LnVubGluayggY2xvc2VMaXN0ZW5lciApO1xyXG4gICAgICBzY3JlZW5WaWV3ICYmIHRoaXMuY29udGVudE5vZGUucmVtb3ZlSW5wdXRMaXN0ZW5lciggZmlyZUxpc3RlbmVyICk7XHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIGxpZmVsaWtlTm9kZSBhbmQgc2NoZW1hdGljTm9kZSBhcmUgbm90IGxpc3RlZCBhcyBwYXJlbnRzIGZvciB0aGVpciBjaGlsZHJlbiBiZWNhdXNlIHRoZSBjaGlsZHJlblxyXG4gICAgICAvLyAoaW1hZ2VzKSBwZXJzaXN0LlxyXG4gICAgICBsaWZlbGlrZU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICBzY2hlbWF0aWNOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgZmlyZUxpc3RlbmVyLmludGVycnVwdCgpO1xyXG4gICAgICBmaXJlTGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERldGVybWluZSB3aGV0aGVyIHRoZSBzdGFydCBzaWRlICh3aXRoIHRoZSBwaXZvdCkgY29udGFpbnMgdGhlIHNlbnNvciBwb2ludC5cclxuICAgKiBAcGFyYW0gcG9pbnQgLSBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXJ0U2lkZUNvbnRhaW5zU2Vuc29yUG9pbnQoIHBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMuY29udGVudE5vZGUucGFyZW50VG9Mb2NhbFBvaW50KCBwb2ludCApO1xyXG4gICAgY29uc3QgbGVmdFNlZ21lbnRDb250YWluc1BvaW50ID0gbGlmZWxpa2VPcGVuTm9kZS5sZWZ0U2VnbWVudE5vZGUuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApO1xyXG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuY2lyY3VpdFN3aXRjaC5pc0Nsb3NlZFByb3BlcnR5LmdldCgpID8gbGlmZWxpa2VDbG9zZWROb2RlIDogbGlmZWxpa2VPcGVuTm9kZTtcclxuICAgIGNvbnN0IHJvdGF0aW5nU2VnbWVudENvbnRhaW5zUG9pbnQgPSBub2RlLnJvdGF0aW5nU2VnbWVudE5vZGUuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApO1xyXG4gICAgcmV0dXJuIGxlZnRTZWdtZW50Q29udGFpbnNQb2ludCB8fCByb3RhdGluZ1NlZ21lbnRDb250YWluc1BvaW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lIHdoZXRoZXIgdGhlIGVuZCBzaWRlICh3aXRoIHRoZSBwaXZvdCkgY29udGFpbnMgdGhlIHNlbnNvciBwb2ludC5cclxuICAgKiBAcGFyYW0gcG9pbnQgLSBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICovXHJcbiAgcHVibGljIGVuZFNpZGVDb250YWluc1NlbnNvclBvaW50KCBwb2ludDogVmVjdG9yMiApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLmNvbnRlbnROb2RlLnBhcmVudFRvTG9jYWxQb2ludCggcG9pbnQgKTtcclxuICAgIHJldHVybiBsaWZlbGlrZU9wZW5Ob2RlLnJpZ2h0U2VnbWVudE5vZGUuY29udGFpbnNQb2ludCggbG9jYWxQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBub2RlIGhpdHMgdGhlIHNlbnNvciBhdCB0aGUgZ2l2ZW4gcG9pbnQuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbnRhaW5zU2Vuc29yUG9pbnQoIGdsb2JhbFBvaW50OiBWZWN0b3IyICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIGNvbnN0IGxvY2FsUG9pbnQgPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGdsb2JhbFBvaW50ICk7XHJcblxyXG4gICAgLy8gbWFrZSBzdXJlIGJvdW5kcyBhcmUgY29ycmVjdCBpZiBjdXQgb3Igam9pbmVkIGluIHRoaXMgYW5pbWF0aW9uIGZyYW1lXHJcbiAgICB0aGlzLnN0ZXAoKTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5zdGFydFNpZGVDb250YWluc1NlbnNvclBvaW50KCBsb2NhbFBvaW50ICkgfHwgdGhpcy5lbmRTaWRlQ29udGFpbnNTZW5zb3JQb2ludCggbG9jYWxQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTd2l0Y2hOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnU3dpdGNoTm9kZScsIFN3aXRjaE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBSUEsU0FBU0EsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxTQUFTQyxNQUFNLEVBQUVDLEtBQUssRUFBRUMsWUFBWSxFQUFZQyxjQUFjLEVB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