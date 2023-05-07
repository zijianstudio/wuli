// Copyright 2015-2023, University of Colorado Boulder

/**
 * Renders the view for the SeriesAmmeter, which looks the same in lifelike mode or schematic mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Node, Rectangle, Text } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import CurrentSense from '../model/CurrentSense.js';
import ProbeTextNode from './ProbeTextNode.js';
import Panel from '../../../sun/js/Panel.js';
import StringProperty from '../../../axon/js/StringProperty.js';
const currentStringProperty = CircuitConstructionKitCommonStrings.currentStringProperty;

// constants
const PANEL_HEIGHT = 40;
const PANEL_WIDTH = CCKCConstants.SERIES_AMMETER_LENGTH;
const ORANGE = '#f39033';
const CORNER_RADIUS = 4;

/**
 * Utility function for creating a panel for the sensor body
 * Rasterize so it can be rendered in WebGL, see https://github.com/phetsims/circuit-construction-kit-dc/issues/67
 * @param [providedOptions]
 */
const createPanel = providedOptions => new Rectangle(0, 0, PANEL_WIDTH, PANEL_HEIGHT, providedOptions).rasterized({
  wrap: false
});
const orangeBackgroundPanel = createPanel({
  cornerRadius: CORNER_RADIUS,
  fill: ORANGE
});
const blackBorder = createPanel({
  cornerRadius: CORNER_RADIUS,
  stroke: '#231f20',
  lineWidth: 2.4
});
export default class SeriesAmmeterNode extends FixedCircuitElementNode {
  constructor(screenView, circuitNode, seriesAmmeter, tandem, isValueDepictionEnabledProperty, providedOptions) {
    const stringProperty = new StringProperty(MathSymbols.NO_VALUE, {
      tandem: tandem.createTandem('probeReadoutText').createTandem(Text.STRING_PROPERTY_TANDEM_NAME),
      phetioReadOnly: true
    });
    const probeTextNode = new ProbeTextNode(stringProperty, isValueDepictionEnabledProperty, currentStringProperty,
    // No need for an extra level of nesting in the tandem tree, since that is just an implementation detail
    // and not a feature
    tandem, {
      seriesAmmeter: true
    });

    /**
     * Update the text in the numeric readout text box.  Shows '?' if disconnected.
     */
    const updateText = () => {
      let readout = MathSymbols.NO_VALUE;

      // If it is not an icon and connected at both sides, show the current, otherwise show '-'
      if (screenView) {
        const circuit = screenView.model.circuit;
        const startConnection = circuit.getNeighboringVertices(seriesAmmeter.startVertexProperty.get()).length > 1;
        const endConnection = circuit.getNeighboringVertices(seriesAmmeter.endVertexProperty.get()).length > 1;
        if (startConnection && endConnection) {
          const sign = seriesAmmeter.currentSenseProperty.value === CurrentSense.BACKWARD ? -1 : +1;
          readout = CCKCUtils.createCurrentReadout(seriesAmmeter.currentProperty.get() * sign, false);
        }
      }
      stringProperty.value = readout;
    };
    seriesAmmeter.currentProperty.link(updateText);
    seriesAmmeter.startVertexProperty.lazyLink(updateText);
    seriesAmmeter.endVertexProperty.lazyLink(updateText);
    seriesAmmeter.currentSenseProperty.lazyLink(updateText);
    ammeterReadoutTypeProperty.lazyLink(updateText);
    CircuitConstructionKitCommonStrings.currentUnitsStringProperty.lazyLink(updateText);

    // NOTE: This is called every frame
    circuitNode && circuitNode.circuit.circuitChangedEmitter.addListener(updateText);

    // This node only has a lifelike representation because it is a sensor
    const lifelikeNode = new Node({
      children: [
      // orange background panel
      orangeBackgroundPanel,
      // gray track
      new Rectangle(0, 0, PANEL_WIDTH, 20, {
        fill: '#bcbdbf',
        centerY: PANEL_HEIGHT / 2
      }),
      // black border
      blackBorder]
    });

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    lifelikeNode.mouseArea = lifelikeNode.bounds.copy();
    lifelikeNode.touchArea = lifelikeNode.bounds.copy();

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;
    super(screenView, circuitNode, seriesAmmeter, new EnumerationProperty(CircuitElementViewType.LIFELIKE), lifelikeNode, new Node({
      children: [lifelikeNode]
    }),
    // reuse lifelike view for the schematic view
    tandem, providedOptions);

    // the panel to be shown in front for z-ordering.  Wrap centered in a child node to make the layout
    // in updateRender trivial.
    this.frontPanelContainer = new Panel(probeTextNode, {
      fill: ORANGE,
      stroke: null,
      xMargin: 10,
      yMargin: 1,
      pickable: false
    });
    if (providedOptions && providedOptions.isIcon) {
      lifelikeNode.addChild(this.frontPanelContainer.mutate({
        centerX: lifelikeNode.width / 2,
        centerY: lifelikeNode.height / 2 - 2
      }));
    } else {
      assert && assert(!!circuitNode);
      if (circuitNode && !seriesAmmeter.phetioIsArchetype && seriesAmmeter.tandem.supplied) {
        circuitNode.seriesAmmeterNodeReadoutPanelLayer.addChild(this.frontPanelContainer);
      }
    }

    // whether to show as an isIcon
    this.isIcon = !!(providedOptions && providedOptions.isIcon);
    this.disposeSeriesAmmeterNode = () => {
      seriesAmmeter.currentSenseProperty.unlink(updateText);
      CircuitConstructionKitCommonStrings.currentUnitsStringProperty.unlink(updateText);
      seriesAmmeter.currentProperty.unlink(updateText);
      seriesAmmeter.startVertexProperty.unlink(updateText);
      seriesAmmeter.endVertexProperty.unlink(updateText);
      ammeterReadoutTypeProperty.unlink(updateText);
      if (!this.isIcon) {
        assert && assert(!!circuitNode);
        if (circuitNode) {
          circuitNode.seriesAmmeterNodeReadoutPanelLayer.removeChild(this.frontPanelContainer);
        }
      }
      lifelikeNode.dispose();
      this.frontPanelContainer.dispose();
      probeTextNode.dispose();
      circuitNode && circuitNode.circuit.circuitChangedEmitter.removeListener(updateText);
      stringProperty.dispose();
    };
  }
  dispose() {
    this.disposeSeriesAmmeterNode();
    super.dispose();
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * CCKCLightBulbNode calls updateRender for its child socket node
   */
  updateRender() {
    super.updateRender();
    this.frontPanelContainer.setMatrix(this.contentNode.getMatrix()); // For rotation
    this.frontPanelContainer.center = this.center; // for translation
  }
}

circuitConstructionKitCommon.register('SeriesAmmeterNode', SeriesAmmeterNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkNDS0NDb25zdGFudHMiLCJDQ0tDVXRpbHMiLCJDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJGaXhlZENpcmN1aXRFbGVtZW50Tm9kZSIsIk1hdGhTeW1ib2xzIiwiYW1tZXRlclJlYWRvdXRUeXBlUHJvcGVydHkiLCJDaXJjdWl0RWxlbWVudFZpZXdUeXBlIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIkN1cnJlbnRTZW5zZSIsIlByb2JlVGV4dE5vZGUiLCJQYW5lbCIsIlN0cmluZ1Byb3BlcnR5IiwiY3VycmVudFN0cmluZ1Byb3BlcnR5IiwiUEFORUxfSEVJR0hUIiwiUEFORUxfV0lEVEgiLCJTRVJJRVNfQU1NRVRFUl9MRU5HVEgiLCJPUkFOR0UiLCJDT1JORVJfUkFESVVTIiwiY3JlYXRlUGFuZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJyYXN0ZXJpemVkIiwid3JhcCIsIm9yYW5nZUJhY2tncm91bmRQYW5lbCIsImNvcm5lclJhZGl1cyIsImZpbGwiLCJibGFja0JvcmRlciIsInN0cm9rZSIsImxpbmVXaWR0aCIsIlNlcmllc0FtbWV0ZXJOb2RlIiwiY29uc3RydWN0b3IiLCJzY3JlZW5WaWV3IiwiY2lyY3VpdE5vZGUiLCJzZXJpZXNBbW1ldGVyIiwidGFuZGVtIiwiaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eSIsInN0cmluZ1Byb3BlcnR5IiwiTk9fVkFMVUUiLCJjcmVhdGVUYW5kZW0iLCJTVFJJTkdfUFJPUEVSVFlfVEFOREVNX05BTUUiLCJwaGV0aW9SZWFkT25seSIsInByb2JlVGV4dE5vZGUiLCJ1cGRhdGVUZXh0IiwicmVhZG91dCIsImNpcmN1aXQiLCJtb2RlbCIsInN0YXJ0Q29ubmVjdGlvbiIsImdldE5laWdoYm9yaW5nVmVydGljZXMiLCJzdGFydFZlcnRleFByb3BlcnR5IiwiZ2V0IiwibGVuZ3RoIiwiZW5kQ29ubmVjdGlvbiIsImVuZFZlcnRleFByb3BlcnR5Iiwic2lnbiIsImN1cnJlbnRTZW5zZVByb3BlcnR5IiwidmFsdWUiLCJCQUNLV0FSRCIsImNyZWF0ZUN1cnJlbnRSZWFkb3V0IiwiY3VycmVudFByb3BlcnR5IiwibGluayIsImxhenlMaW5rIiwiY3VycmVudFVuaXRzU3RyaW5nUHJvcGVydHkiLCJjaXJjdWl0Q2hhbmdlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxpZmVsaWtlTm9kZSIsImNoaWxkcmVuIiwiY2VudGVyWSIsIm1vdXNlQXJlYSIsImJvdW5kcyIsImNvcHkiLCJ0b3VjaEFyZWEiLCJMSUZFTElLRSIsImZyb250UGFuZWxDb250YWluZXIiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInBpY2thYmxlIiwiaXNJY29uIiwiYWRkQ2hpbGQiLCJtdXRhdGUiLCJjZW50ZXJYIiwid2lkdGgiLCJoZWlnaHQiLCJhc3NlcnQiLCJwaGV0aW9Jc0FyY2hldHlwZSIsInN1cHBsaWVkIiwic2VyaWVzQW1tZXRlck5vZGVSZWFkb3V0UGFuZWxMYXllciIsImRpc3Bvc2VTZXJpZXNBbW1ldGVyTm9kZSIsInVubGluayIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZSIsInJlbW92ZUxpc3RlbmVyIiwidXBkYXRlUmVuZGVyIiwic2V0TWF0cml4IiwiY29udGVudE5vZGUiLCJnZXRNYXRyaXgiLCJjZW50ZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNlcmllc0FtbWV0ZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlbmRlcnMgdGhlIHZpZXcgZm9yIHRoZSBTZXJpZXNBbW1ldGVyLCB3aGljaCBsb29rcyB0aGUgc2FtZSBpbiBsaWZlbGlrZSBtb2RlIG9yIHNjaGVtYXRpYyBtb2RlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSwgUmVjdGFuZ2xlT3B0aW9ucywgVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ0NLQ1V0aWxzIGZyb20gJy4uL0NDS0NVdGlscy5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncyBmcm9tICcuLi9DaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgRml4ZWRDaXJjdWl0RWxlbWVudE5vZGUsIHsgRml4ZWRDaXJjdWl0RWxlbWVudE5vZGVPcHRpb25zIH0gZnJvbSAnLi9GaXhlZENpcmN1aXRFbGVtZW50Tm9kZS5qcyc7XHJcbmltcG9ydCBDQ0tDU2NyZWVuVmlldyBmcm9tICcuL0NDS0NTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IENpcmN1aXROb2RlIGZyb20gJy4vQ2lyY3VpdE5vZGUuanMnO1xyXG5pbXBvcnQgU2VyaWVzQW1tZXRlciBmcm9tICcuLi9tb2RlbC9TZXJpZXNBbW1ldGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE1hdGhTeW1ib2xzIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9scy5qcyc7XHJcbmltcG9ydCBhbW1ldGVyUmVhZG91dFR5cGVQcm9wZXJ0eSBmcm9tICcuL2FtbWV0ZXJSZWFkb3V0VHlwZVByb3BlcnR5LmpzJztcclxuaW1wb3J0IENpcmN1aXRFbGVtZW50Vmlld1R5cGUgZnJvbSAnLi4vbW9kZWwvQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBDdXJyZW50U2Vuc2UgZnJvbSAnLi4vbW9kZWwvQ3VycmVudFNlbnNlLmpzJztcclxuaW1wb3J0IFByb2JlVGV4dE5vZGUgZnJvbSAnLi9Qcm9iZVRleHROb2RlLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5cclxuY29uc3QgY3VycmVudFN0cmluZ1Byb3BlcnR5ID0gQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MuY3VycmVudFN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBBTkVMX0hFSUdIVCA9IDQwO1xyXG5jb25zdCBQQU5FTF9XSURUSCA9IENDS0NDb25zdGFudHMuU0VSSUVTX0FNTUVURVJfTEVOR1RIO1xyXG5jb25zdCBPUkFOR0UgPSAnI2YzOTAzMyc7XHJcblxyXG5jb25zdCBDT1JORVJfUkFESVVTID0gNDtcclxuXHJcbi8qKlxyXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIHBhbmVsIGZvciB0aGUgc2Vuc29yIGJvZHlcclxuICogUmFzdGVyaXplIHNvIGl0IGNhbiBiZSByZW5kZXJlZCBpbiBXZWJHTCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtZGMvaXNzdWVzLzY3XHJcbiAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gKi9cclxuY29uc3QgY3JlYXRlUGFuZWwgPSAoIHByb3ZpZGVkT3B0aW9ucz86IFJlY3RhbmdsZU9wdGlvbnMgKSA9PiBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBQQU5FTF9XSURUSCwgUEFORUxfSEVJR0hULCBwcm92aWRlZE9wdGlvbnMgKS5yYXN0ZXJpemVkKCB7IHdyYXA6IGZhbHNlIH0gKTtcclxuXHJcbmNvbnN0IG9yYW5nZUJhY2tncm91bmRQYW5lbCA9IGNyZWF0ZVBhbmVsKCB7IGNvcm5lclJhZGl1czogQ09STkVSX1JBRElVUywgZmlsbDogT1JBTkdFIH0gKTtcclxuY29uc3QgYmxhY2tCb3JkZXIgPSBjcmVhdGVQYW5lbCgge1xyXG4gIGNvcm5lclJhZGl1czogQ09STkVSX1JBRElVUyxcclxuICBzdHJva2U6ICcjMjMxZjIwJyxcclxuICBsaW5lV2lkdGg6IDIuNFxyXG59ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXJpZXNBbW1ldGVyTm9kZSBleHRlbmRzIEZpeGVkQ2lyY3VpdEVsZW1lbnROb2RlIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGZyb250UGFuZWxDb250YWluZXI6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2VyaWVzQW1tZXRlck5vZGU6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NyZWVuVmlldzogQ0NLQ1NjcmVlblZpZXcgfCBudWxsLCBjaXJjdWl0Tm9kZTogQ2lyY3VpdE5vZGUgfCBudWxsLCBzZXJpZXNBbW1ldGVyOiBTZXJpZXNBbW1ldGVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGFuZGVtOiBUYW5kZW0sIGlzVmFsdWVEZXBpY3Rpb25FbmFibGVkUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM/OiBGaXhlZENpcmN1aXRFbGVtZW50Tm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgc3RyaW5nUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoIE1hdGhTeW1ib2xzLk5PX1ZBTFVFLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb2JlUmVhZG91dFRleHQnICkuY3JlYXRlVGFuZGVtKCBUZXh0LlNUUklOR19QUk9QRVJUWV9UQU5ERU1fTkFNRSApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHByb2JlVGV4dE5vZGUgPSBuZXcgUHJvYmVUZXh0Tm9kZShcclxuICAgICAgc3RyaW5nUHJvcGVydHksIGlzVmFsdWVEZXBpY3Rpb25FbmFibGVkUHJvcGVydHksIGN1cnJlbnRTdHJpbmdQcm9wZXJ0eSxcclxuXHJcbiAgICAgIC8vIE5vIG5lZWQgZm9yIGFuIGV4dHJhIGxldmVsIG9mIG5lc3RpbmcgaW4gdGhlIHRhbmRlbSB0cmVlLCBzaW5jZSB0aGF0IGlzIGp1c3QgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsXHJcbiAgICAgIC8vIGFuZCBub3QgYSBmZWF0dXJlXHJcbiAgICAgIHRhbmRlbSwge1xyXG4gICAgICAgIHNlcmllc0FtbWV0ZXI6IHRydWVcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlIHRoZSB0ZXh0IGluIHRoZSBudW1lcmljIHJlYWRvdXQgdGV4dCBib3guICBTaG93cyAnPycgaWYgZGlzY29ubmVjdGVkLlxyXG4gICAgICovXHJcbiAgICBjb25zdCB1cGRhdGVUZXh0ID0gKCkgPT4ge1xyXG4gICAgICBsZXQgcmVhZG91dDogc3RyaW5nID0gTWF0aFN5bWJvbHMuTk9fVkFMVUU7XHJcblxyXG4gICAgICAvLyBJZiBpdCBpcyBub3QgYW4gaWNvbiBhbmQgY29ubmVjdGVkIGF0IGJvdGggc2lkZXMsIHNob3cgdGhlIGN1cnJlbnQsIG90aGVyd2lzZSBzaG93ICctJ1xyXG4gICAgICBpZiAoIHNjcmVlblZpZXcgKSB7XHJcblxyXG4gICAgICAgIGNvbnN0IGNpcmN1aXQgPSBzY3JlZW5WaWV3Lm1vZGVsLmNpcmN1aXQ7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRDb25uZWN0aW9uID0gY2lyY3VpdC5nZXROZWlnaGJvcmluZ1ZlcnRpY2VzKCBzZXJpZXNBbW1ldGVyLnN0YXJ0VmVydGV4UHJvcGVydHkuZ2V0KCkgKS5sZW5ndGggPiAxO1xyXG4gICAgICAgIGNvbnN0IGVuZENvbm5lY3Rpb24gPSBjaXJjdWl0LmdldE5laWdoYm9yaW5nVmVydGljZXMoIHNlcmllc0FtbWV0ZXIuZW5kVmVydGV4UHJvcGVydHkuZ2V0KCkgKS5sZW5ndGggPiAxO1xyXG5cclxuICAgICAgICBpZiAoIHN0YXJ0Q29ubmVjdGlvbiAmJiBlbmRDb25uZWN0aW9uICkge1xyXG5cclxuICAgICAgICAgIGNvbnN0IHNpZ24gPSBzZXJpZXNBbW1ldGVyLmN1cnJlbnRTZW5zZVByb3BlcnR5LnZhbHVlID09PSBDdXJyZW50U2Vuc2UuQkFDS1dBUkQgPyAtMSA6ICsxO1xyXG4gICAgICAgICAgcmVhZG91dCA9IENDS0NVdGlscy5jcmVhdGVDdXJyZW50UmVhZG91dCggc2VyaWVzQW1tZXRlci5jdXJyZW50UHJvcGVydHkuZ2V0KCkgKiBzaWduLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgc3RyaW5nUHJvcGVydHkudmFsdWUgPSByZWFkb3V0O1xyXG4gICAgfTtcclxuXHJcbiAgICBzZXJpZXNBbW1ldGVyLmN1cnJlbnRQcm9wZXJ0eS5saW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICBzZXJpZXNBbW1ldGVyLnN0YXJ0VmVydGV4UHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVRleHQgKTtcclxuICAgIHNlcmllc0FtbWV0ZXIuZW5kVmVydGV4UHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVRleHQgKTtcclxuICAgIHNlcmllc0FtbWV0ZXIuY3VycmVudFNlbnNlUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVRleHQgKTtcclxuICAgIGFtbWV0ZXJSZWFkb3V0VHlwZVByb3BlcnR5LmxhenlMaW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy5jdXJyZW50VW5pdHNTdHJpbmdQcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlVGV4dCApO1xyXG5cclxuICAgIC8vIE5PVEU6IFRoaXMgaXMgY2FsbGVkIGV2ZXJ5IGZyYW1lXHJcbiAgICBjaXJjdWl0Tm9kZSAmJiBjaXJjdWl0Tm9kZS5jaXJjdWl0LmNpcmN1aXRDaGFuZ2VkRW1pdHRlci5hZGRMaXN0ZW5lciggdXBkYXRlVGV4dCApO1xyXG5cclxuICAgIC8vIFRoaXMgbm9kZSBvbmx5IGhhcyBhIGxpZmVsaWtlIHJlcHJlc2VudGF0aW9uIGJlY2F1c2UgaXQgaXMgYSBzZW5zb3JcclxuICAgIGNvbnN0IGxpZmVsaWtlTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcblxyXG4gICAgICAgIC8vIG9yYW5nZSBiYWNrZ3JvdW5kIHBhbmVsXHJcbiAgICAgICAgb3JhbmdlQmFja2dyb3VuZFBhbmVsLFxyXG5cclxuICAgICAgICAvLyBncmF5IHRyYWNrXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgUEFORUxfV0lEVEgsIDIwLCB7XHJcbiAgICAgICAgICBmaWxsOiAnI2JjYmRiZicsXHJcbiAgICAgICAgICBjZW50ZXJZOiBQQU5FTF9IRUlHSFQgLyAyXHJcbiAgICAgICAgfSApLFxyXG5cclxuICAgICAgICAvLyBibGFjayBib3JkZXJcclxuICAgICAgICBibGFja0JvcmRlclxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRXhwYW5kIHRoZSBwb2ludGVyIGFyZWFzIHdpdGggYSBkZWZlbnNpdmUgY29weSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy8zMTBcclxuICAgIGxpZmVsaWtlTm9kZS5tb3VzZUFyZWEgPSBsaWZlbGlrZU5vZGUuYm91bmRzLmNvcHkoKTtcclxuICAgIGxpZmVsaWtlTm9kZS50b3VjaEFyZWEgPSBsaWZlbGlrZU5vZGUuYm91bmRzLmNvcHkoKTtcclxuXHJcbiAgICAvLyBDZW50ZXIgdmVydGljYWxseSB0byBtYXRjaCB0aGUgRml4ZWRDaXJjdWl0RWxlbWVudE5vZGUgYXNzdW1wdGlvbiB0aGF0IG9yaWdpbiBpcyBjZW50ZXIgbGVmdFxyXG4gICAgbGlmZWxpa2VOb2RlLmNlbnRlclkgPSAwO1xyXG5cclxuICAgIHN1cGVyKFxyXG4gICAgICBzY3JlZW5WaWV3LFxyXG4gICAgICBjaXJjdWl0Tm9kZSxcclxuICAgICAgc2VyaWVzQW1tZXRlcixcclxuICAgICAgbmV3IEVudW1lcmF0aW9uUHJvcGVydHkoIENpcmN1aXRFbGVtZW50Vmlld1R5cGUuTElGRUxJS0UgKSxcclxuICAgICAgbGlmZWxpa2VOb2RlLFxyXG4gICAgICBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBsaWZlbGlrZU5vZGUgXSB9ICksIC8vIHJldXNlIGxpZmVsaWtlIHZpZXcgZm9yIHRoZSBzY2hlbWF0aWMgdmlld1xyXG4gICAgICB0YW5kZW0sXHJcbiAgICAgIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyB0aGUgcGFuZWwgdG8gYmUgc2hvd24gaW4gZnJvbnQgZm9yIHotb3JkZXJpbmcuICBXcmFwIGNlbnRlcmVkIGluIGEgY2hpbGQgbm9kZSB0byBtYWtlIHRoZSBsYXlvdXRcclxuICAgIC8vIGluIHVwZGF0ZVJlbmRlciB0cml2aWFsLlxyXG4gICAgdGhpcy5mcm9udFBhbmVsQ29udGFpbmVyID0gbmV3IFBhbmVsKCBwcm9iZVRleHROb2RlLCB7XHJcbiAgICAgIGZpbGw6IE9SQU5HRSxcclxuICAgICAgc3Ryb2tlOiBudWxsLFxyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogMSxcclxuICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBwcm92aWRlZE9wdGlvbnMgJiYgcHJvdmlkZWRPcHRpb25zLmlzSWNvbiApIHtcclxuICAgICAgbGlmZWxpa2VOb2RlLmFkZENoaWxkKCB0aGlzLmZyb250UGFuZWxDb250YWluZXIubXV0YXRlKCB7XHJcbiAgICAgICAgY2VudGVyWDogbGlmZWxpa2VOb2RlLndpZHRoIC8gMixcclxuICAgICAgICBjZW50ZXJZOiBsaWZlbGlrZU5vZGUuaGVpZ2h0IC8gMiAtIDJcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISFjaXJjdWl0Tm9kZSApO1xyXG4gICAgICBpZiAoIGNpcmN1aXROb2RlICYmICFzZXJpZXNBbW1ldGVyLnBoZXRpb0lzQXJjaGV0eXBlICYmIHNlcmllc0FtbWV0ZXIudGFuZGVtLnN1cHBsaWVkICkge1xyXG4gICAgICAgIGNpcmN1aXROb2RlLnNlcmllc0FtbWV0ZXJOb2RlUmVhZG91dFBhbmVsTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuZnJvbnRQYW5lbENvbnRhaW5lciApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gd2hldGhlciB0byBzaG93IGFzIGFuIGlzSWNvblxyXG4gICAgdGhpcy5pc0ljb24gPSAhISggcHJvdmlkZWRPcHRpb25zICYmIHByb3ZpZGVkT3B0aW9ucy5pc0ljb24gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VTZXJpZXNBbW1ldGVyTm9kZSA9ICgpID0+IHtcclxuXHJcbiAgICAgIHNlcmllc0FtbWV0ZXIuY3VycmVudFNlbnNlUHJvcGVydHkudW5saW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICAgIENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzLmN1cnJlbnRVbml0c1N0cmluZ1Byb3BlcnR5LnVubGluayggdXBkYXRlVGV4dCApO1xyXG5cclxuICAgICAgc2VyaWVzQW1tZXRlci5jdXJyZW50UHJvcGVydHkudW5saW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICAgIHNlcmllc0FtbWV0ZXIuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZVRleHQgKTtcclxuICAgICAgc2VyaWVzQW1tZXRlci5lbmRWZXJ0ZXhQcm9wZXJ0eS51bmxpbmsoIHVwZGF0ZVRleHQgKTtcclxuICAgICAgYW1tZXRlclJlYWRvdXRUeXBlUHJvcGVydHkudW5saW5rKCB1cGRhdGVUZXh0ICk7XHJcbiAgICAgIGlmICggIXRoaXMuaXNJY29uICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICEhY2lyY3VpdE5vZGUgKTtcclxuICAgICAgICBpZiAoIGNpcmN1aXROb2RlICkge1xyXG4gICAgICAgICAgY2lyY3VpdE5vZGUuc2VyaWVzQW1tZXRlck5vZGVSZWFkb3V0UGFuZWxMYXllci5yZW1vdmVDaGlsZCggdGhpcy5mcm9udFBhbmVsQ29udGFpbmVyICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGxpZmVsaWtlTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgIHRoaXMuZnJvbnRQYW5lbENvbnRhaW5lci5kaXNwb3NlKCk7XHJcbiAgICAgIHByb2JlVGV4dE5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICBjaXJjdWl0Tm9kZSAmJiBjaXJjdWl0Tm9kZS5jaXJjdWl0LmNpcmN1aXRDaGFuZ2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdXBkYXRlVGV4dCApO1xyXG4gICAgICBzdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTZXJpZXNBbW1ldGVyTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTXVsdGlwbGUgdXBkYXRlcyBtYXkgaGFwcGVuIHBlciBmcmFtZSwgdGhleSBhcmUgYmF0Y2hlZCBhbmQgdXBkYXRlZCBvbmNlIGluIHRoZSB2aWV3IHN0ZXAgdG8gaW1wcm92ZSBwZXJmb3JtYW5jZS5cclxuICAgKiBDQ0tDTGlnaHRCdWxiTm9kZSBjYWxscyB1cGRhdGVSZW5kZXIgZm9yIGl0cyBjaGlsZCBzb2NrZXQgbm9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSB1cGRhdGVSZW5kZXIoKTogdm9pZCB7XHJcbiAgICBzdXBlci51cGRhdGVSZW5kZXIoKTtcclxuICAgIHRoaXMuZnJvbnRQYW5lbENvbnRhaW5lci5zZXRNYXRyaXgoIHRoaXMuY29udGVudE5vZGUuZ2V0TWF0cml4KCkgKTsgLy8gRm9yIHJvdGF0aW9uXHJcbiAgICB0aGlzLmZyb250UGFuZWxDb250YWluZXIuY2VudGVyID0gdGhpcy5jZW50ZXI7IC8vIGZvciB0cmFuc2xhdGlvblxyXG4gIH1cclxufVxyXG5cclxuY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5yZWdpc3RlciggJ1Nlcmllc0FtbWV0ZXJOb2RlJywgU2VyaWVzQW1tZXRlck5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsSUFBSSxFQUFFQyxTQUFTLEVBQW9CQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ3hGLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjtBQUN2QyxPQUFPQyxtQ0FBbUMsTUFBTSwyQ0FBMkM7QUFDM0YsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLHVCQUF1QixNQUEwQyw4QkFBOEI7QUFLdEcsT0FBT0MsV0FBVyxNQUFNLHlDQUF5QztBQUNqRSxPQUFPQywwQkFBMEIsTUFBTSxpQ0FBaUM7QUFDeEUsT0FBT0Msc0JBQXNCLE1BQU0sb0NBQW9DO0FBQ3ZFLE9BQU9DLG1CQUFtQixNQUFNLHlDQUF5QztBQUN6RSxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCO0FBQ25ELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtB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