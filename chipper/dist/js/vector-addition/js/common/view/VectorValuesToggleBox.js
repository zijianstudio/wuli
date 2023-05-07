// Copyright 2019-2023, University of Colorado Boulder

/**
 * VectorValuesToggleBox is the toggle box at the top of the screen. It displays the active vector's magnitude,
 * angle, x component, and y component.
 *
 * 'Is a' relationship with ToggleBox
 *    - when closed, displays 'Vector Values'
 *    - when open either displays 'select a vector' or the active vector's attributes
 *      (a series of labels and VectorValuesNumberDisplays)
 *
 * This panel exists for the entire sim and is never disposed.
 *
 * @author Martin Veillette
 * @author Brandon Li
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import { AlignBox, HBox, Node, Text } from '../../../../scenery/js/imports.js';
import vectorAddition from '../../vectorAddition.js';
import VectorAdditionStrings from '../../VectorAdditionStrings.js';
import Graph from '../model/Graph.js';
import VectorAdditionConstants from '../VectorAdditionConstants.js';
import ToggleBox from './ToggleBox.js';
import VectorQuantities from './VectorQuantities.js';
import VectorSymbolNode from './VectorSymbolNode.js';
import VectorValuesNumberDisplay from './VectorValuesNumberDisplay.js';

//----------------------------------------------------------------------------------------
// constants

// margin from the label to the number label (ltr)
const LABEL_RIGHT_MARGIN = 7;

// margin from the number display to the label (ltr)
const LABEL_LEFT_MARGIN = 17;

// width of the magnitude label
const MAGNITUDE_LABEL_WIDTH = 50;

// width of the angle label
const ANGLE_LABEL_WIDTH = 15;

// width of the component labels
const COMPONENT_LABEL_WIDTH = 35;
export default class VectorValuesToggleBox extends ToggleBox {
  /**
   * @param {Graph} graph - the graph that contains the vectors to display
   * @param {Object} [options]
   */
  constructor(graph, options) {
    assert && assert(graph instanceof Graph, `invalid graph: ${graph}`);
    assert && assert(!options || Object.getPrototypeOf(options) === Object.prototype, `Extra prototype on options: ${options}`);
    options = merge({
      // superclass options
      contentFixedWidth: 500,
      // {number|null} fixed size of the panel (see superclass)
      contentFixedHeight: 45,
      // {number|null} fixed size of the panel (see superclass)
      isExpandedInitially: true
    }, options);

    //----------------------------------------------------------------------------------------
    // Create the scenery node for when the panel is closed, which is the inspectVectorText
    const inspectVectorText = new Text(VectorAdditionStrings.vectorValues, {
      font: VectorAdditionConstants.TITLE_FONT
    });

    //----------------------------------------------------------------------------------------
    // Create the scenery nodes for when the panel is open

    // Text for when there isn't a vector that is active
    const selectVectorText = new Text(VectorAdditionStrings.noVectorSelected, {
      font: VectorAdditionConstants.TITLE_FONT
    });

    // Container for the labels and number displays that display the vector's attributes
    const vectorAttributesContainer = new HBox({
      spacing: LABEL_LEFT_MARGIN
    });

    // Create the content container for the open content
    const panelOpenContent = new Node();
    panelOpenContent.setChildren([selectVectorText, vectorAttributesContainer]);

    //----------------------------------------------------------------------------------------
    // Create the scenery nodes to display the vector. Each attribute has a label and a VectorValuesNumberDisplay
    //----------------------------------------------------------------------------------------

    const magnitudeDisplayNode = new VectorSymbolNode({
      includeAbsoluteValueBars: true
    });
    const magnitudeNumberDisplay = new VectorValuesNumberDisplay(graph, VectorQuantities.MAGNITUDE);
    const angleText = new Text(MathSymbols.THETA, {
      font: VectorAdditionConstants.EQUATION_SYMBOL_FONT
    });
    const angleNumberDisplay = new VectorValuesNumberDisplay(graph, VectorQuantities.ANGLE);
    const xComponentText = new VectorSymbolNode({
      showVectorArrow: false
    });
    const xComponentNumberDisplay = new VectorValuesNumberDisplay(graph, VectorQuantities.X_COMPONENT);
    const yComponentText = new VectorSymbolNode({
      showVectorArrow: false
    });
    const yComponentNumberDisplay = new VectorValuesNumberDisplay(graph, VectorQuantities.Y_COMPONENT);

    //----------------------------------------------------------------------------------------
    // Add the new scenery nodes
    //----------------------------------------------------------------------------------------

    // Function that adds a label and display container combo, putting the label in a fixed sized AlignBox
    const addNumberDisplayAndLabel = (label, numberDisplay, labelWidth) => {
      // Align the label in a AlignBox to set a fixed width
      const fixedWidthLabel = new AlignBox(label, {
        xAlign: 'right',
        yAlign: 'center',
        alignBounds: new Bounds2(0, 0, labelWidth, options.contentFixedHeight),
        maxWidth: labelWidth
      });
      label.maxWidth = labelWidth;
      vectorAttributesContainer.addChild(new HBox({
        spacing: LABEL_RIGHT_MARGIN,
        children: [fixedWidthLabel, numberDisplay]
      }));
    };
    addNumberDisplayAndLabel(magnitudeDisplayNode, magnitudeNumberDisplay, MAGNITUDE_LABEL_WIDTH);
    addNumberDisplayAndLabel(angleText, angleNumberDisplay, ANGLE_LABEL_WIDTH);
    addNumberDisplayAndLabel(xComponentText, xComponentNumberDisplay, COMPONENT_LABEL_WIDTH);
    addNumberDisplayAndLabel(yComponentText, yComponentNumberDisplay, COMPONENT_LABEL_WIDTH);

    //----------------------------------------------------------------------------------------

    const updateCoefficient = coefficient => {
      magnitudeDisplayNode.setCoefficient(coefficient);
      xComponentText.setCoefficient(coefficient);
      yComponentText.setCoefficient(coefficient);
    };

    // Observe changes to when the graphs active vector Property changes to update the panel.
    // unlink is unnecessary, exists for the lifetime of the sim.
    graph.activeVectorProperty.link((activeVector, oldActiveVector) => {
      if (activeVector !== null) {
        vectorAttributesContainer.visible = true;
        selectVectorText.visible = false;

        // Get the vector symbol
        const vectorSymbol = activeVector.symbol ? activeVector.symbol : activeVector.fallBackSymbol;

        // Update labels (angle label is the same)
        magnitudeDisplayNode.setSymbol(vectorSymbol);
        xComponentText.setSymbol(`${vectorSymbol}<sub>${VectorAdditionStrings.symbol.x}</sub>`);
        yComponentText.setSymbol(`${vectorSymbol}<sub>${VectorAdditionStrings.symbol.y}</sub>`);
      } else {
        vectorAttributesContainer.visible = false;
        selectVectorText.visible = true;
      }
      selectVectorText.centerY = panelOpenContent.centerY;
      vectorAttributesContainer.centerY = panelOpenContent.centerY;
      if (activeVector && activeVector.coefficientProperty) {
        activeVector.coefficientProperty.link(updateCoefficient); // unlink required when active vector changes
      }

      if (oldActiveVector && oldActiveVector.coefficientProperty) {
        oldActiveVector.coefficientProperty.unlink(updateCoefficient);
        // reset
        updateCoefficient(activeVector && activeVector.coefficientProperty ? activeVector.coefficientProperty.value : 1);
      }
    });
    selectVectorText.centerY = panelOpenContent.centerY;
    vectorAttributesContainer.centerY = panelOpenContent.centerY;

    //----------------------------------------------------------------------------------------
    // Create the inspect a vector panel
    //----------------------------------------------------------------------------------------

    super(inspectVectorText, panelOpenContent, options);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'VectorValuesToggleBox is not intended to be disposed');
  }
}
vectorAddition.register('VectorValuesToggleBox', VectorValuesToggleBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwibWVyZ2UiLCJNYXRoU3ltYm9scyIsIkFsaWduQm94IiwiSEJveCIsIk5vZGUiLCJUZXh0IiwidmVjdG9yQWRkaXRpb24iLCJWZWN0b3JBZGRpdGlvblN0cmluZ3MiLCJHcmFwaCIsIlZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIiwiVG9nZ2xlQm94IiwiVmVjdG9yUXVhbnRpdGllcyIsIlZlY3RvclN5bWJvbE5vZGUiLCJWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5IiwiTEFCRUxfUklHSFRfTUFSR0lOIiwiTEFCRUxfTEVGVF9NQVJHSU4iLCJNQUdOSVRVREVfTEFCRUxfV0lEVEgiLCJBTkdMRV9MQUJFTF9XSURUSCIsIkNPTVBPTkVOVF9MQUJFTF9XSURUSCIsIlZlY3RvclZhbHVlc1RvZ2dsZUJveCIsImNvbnN0cnVjdG9yIiwiZ3JhcGgiLCJvcHRpb25zIiwiYXNzZXJ0IiwiT2JqZWN0IiwiZ2V0UHJvdG90eXBlT2YiLCJwcm90b3R5cGUiLCJjb250ZW50Rml4ZWRXaWR0aCIsImNvbnRlbnRGaXhlZEhlaWdodCIsImlzRXhwYW5kZWRJbml0aWFsbHkiLCJpbnNwZWN0VmVjdG9yVGV4dCIsInZlY3RvclZhbHVlcyIsImZvbnQiLCJUSVRMRV9GT05UIiwic2VsZWN0VmVjdG9yVGV4dCIsIm5vVmVjdG9yU2VsZWN0ZWQiLCJ2ZWN0b3JBdHRyaWJ1dGVzQ29udGFpbmVyIiwic3BhY2luZyIsInBhbmVsT3BlbkNvbnRlbnQiLCJzZXRDaGlsZHJlbiIsIm1hZ25pdHVkZURpc3BsYXlOb2RlIiwiaW5jbHVkZUFic29sdXRlVmFsdWVCYXJzIiwibWFnbml0dWRlTnVtYmVyRGlzcGxheSIsIk1BR05JVFVERSIsImFuZ2xlVGV4dCIsIlRIRVRBIiwiRVFVQVRJT05fU1lNQk9MX0ZPTlQiLCJhbmdsZU51bWJlckRpc3BsYXkiLCJBTkdMRSIsInhDb21wb25lbnRUZXh0Iiwic2hvd1ZlY3RvckFycm93IiwieENvbXBvbmVudE51bWJlckRpc3BsYXkiLCJYX0NPTVBPTkVOVCIsInlDb21wb25lbnRUZXh0IiwieUNvbXBvbmVudE51bWJlckRpc3BsYXkiLCJZX0NPTVBPTkVOVCIsImFkZE51bWJlckRpc3BsYXlBbmRMYWJlbCIsImxhYmVsIiwibnVtYmVyRGlzcGxheSIsImxhYmVsV2lkdGgiLCJmaXhlZFdpZHRoTGFiZWwiLCJ4QWxpZ24iLCJ5QWxpZ24iLCJhbGlnbkJvdW5kcyIsIm1heFdpZHRoIiwiYWRkQ2hpbGQiLCJjaGlsZHJlbiIsInVwZGF0ZUNvZWZmaWNpZW50IiwiY29lZmZpY2llbnQiLCJzZXRDb2VmZmljaWVudCIsImFjdGl2ZVZlY3RvclByb3BlcnR5IiwibGluayIsImFjdGl2ZVZlY3RvciIsIm9sZEFjdGl2ZVZlY3RvciIsInZpc2libGUiLCJ2ZWN0b3JTeW1ib2wiLCJzeW1ib2wiLCJmYWxsQmFja1N5bWJvbCIsInNldFN5bWJvbCIsIngiLCJ5IiwiY2VudGVyWSIsImNvZWZmaWNpZW50UHJvcGVydHkiLCJ1bmxpbmsiLCJ2YWx1ZSIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlY3RvclZhbHVlc1RvZ2dsZUJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWZWN0b3JWYWx1ZXNUb2dnbGVCb3ggaXMgdGhlIHRvZ2dsZSBib3ggYXQgdGhlIHRvcCBvZiB0aGUgc2NyZWVuLiBJdCBkaXNwbGF5cyB0aGUgYWN0aXZlIHZlY3RvcidzIG1hZ25pdHVkZSxcclxuICogYW5nbGUsIHggY29tcG9uZW50LCBhbmQgeSBjb21wb25lbnQuXHJcbiAqXHJcbiAqICdJcyBhJyByZWxhdGlvbnNoaXAgd2l0aCBUb2dnbGVCb3hcclxuICogICAgLSB3aGVuIGNsb3NlZCwgZGlzcGxheXMgJ1ZlY3RvciBWYWx1ZXMnXHJcbiAqICAgIC0gd2hlbiBvcGVuIGVpdGhlciBkaXNwbGF5cyAnc2VsZWN0IGEgdmVjdG9yJyBvciB0aGUgYWN0aXZlIHZlY3RvcidzIGF0dHJpYnV0ZXNcclxuICogICAgICAoYSBzZXJpZXMgb2YgbGFiZWxzIGFuZCBWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5cylcclxuICpcclxuICogVGhpcyBwYW5lbCBleGlzdHMgZm9yIHRoZSBlbnRpcmUgc2ltIGFuZCBpcyBuZXZlciBkaXNwb3NlZC5cclxuICpcclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNYXRoU3ltYm9scyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWF0aFN5bWJvbHMuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgSEJveCwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBWZWN0b3JBZGRpdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vVmVjdG9yQWRkaXRpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEdyYXBoIGZyb20gJy4uL21vZGVsL0dyYXBoLmpzJztcclxuaW1wb3J0IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzIGZyb20gJy4uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFRvZ2dsZUJveCBmcm9tICcuL1RvZ2dsZUJveC5qcyc7XHJcbmltcG9ydCBWZWN0b3JRdWFudGl0aWVzIGZyb20gJy4vVmVjdG9yUXVhbnRpdGllcy5qcyc7XHJcbmltcG9ydCBWZWN0b3JTeW1ib2xOb2RlIGZyb20gJy4vVmVjdG9yU3ltYm9sTm9kZS5qcyc7XHJcbmltcG9ydCBWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5IGZyb20gJy4vVmVjdG9yVmFsdWVzTnVtYmVyRGlzcGxheS5qcyc7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gY29uc3RhbnRzXHJcblxyXG4vLyBtYXJnaW4gZnJvbSB0aGUgbGFiZWwgdG8gdGhlIG51bWJlciBsYWJlbCAobHRyKVxyXG5jb25zdCBMQUJFTF9SSUdIVF9NQVJHSU4gPSA3O1xyXG5cclxuLy8gbWFyZ2luIGZyb20gdGhlIG51bWJlciBkaXNwbGF5IHRvIHRoZSBsYWJlbCAobHRyKVxyXG5jb25zdCBMQUJFTF9MRUZUX01BUkdJTiA9IDE3O1xyXG5cclxuLy8gd2lkdGggb2YgdGhlIG1hZ25pdHVkZSBsYWJlbFxyXG5jb25zdCBNQUdOSVRVREVfTEFCRUxfV0lEVEggPSA1MDtcclxuXHJcbi8vIHdpZHRoIG9mIHRoZSBhbmdsZSBsYWJlbFxyXG5jb25zdCBBTkdMRV9MQUJFTF9XSURUSCA9IDE1O1xyXG5cclxuLy8gd2lkdGggb2YgdGhlIGNvbXBvbmVudCBsYWJlbHNcclxuY29uc3QgQ09NUE9ORU5UX0xBQkVMX1dJRFRIID0gMzU7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZWN0b3JWYWx1ZXNUb2dnbGVCb3ggZXh0ZW5kcyBUb2dnbGVCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0dyYXBofSBncmFwaCAtIHRoZSBncmFwaCB0aGF0IGNvbnRhaW5zIHRoZSB2ZWN0b3JzIHRvIGRpc3BsYXlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGdyYXBoLCBvcHRpb25zICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGdyYXBoIGluc3RhbmNlb2YgR3JhcGgsIGBpbnZhbGlkIGdyYXBoOiAke2dyYXBofWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZiggb3B0aW9ucyApID09PSBPYmplY3QucHJvdG90eXBlLCBgRXh0cmEgcHJvdG90eXBlIG9uIG9wdGlvbnM6ICR7b3B0aW9uc31gICk7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBzdXBlcmNsYXNzIG9wdGlvbnNcclxuICAgICAgY29udGVudEZpeGVkV2lkdGg6IDUwMCwgLy8ge251bWJlcnxudWxsfSBmaXhlZCBzaXplIG9mIHRoZSBwYW5lbCAoc2VlIHN1cGVyY2xhc3MpXHJcbiAgICAgIGNvbnRlbnRGaXhlZEhlaWdodDogNDUsIC8vIHtudW1iZXJ8bnVsbH0gZml4ZWQgc2l6ZSBvZiB0aGUgcGFuZWwgKHNlZSBzdXBlcmNsYXNzKVxyXG4gICAgICBpc0V4cGFuZGVkSW5pdGlhbGx5OiB0cnVlXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gQ3JlYXRlIHRoZSBzY2VuZXJ5IG5vZGUgZm9yIHdoZW4gdGhlIHBhbmVsIGlzIGNsb3NlZCwgd2hpY2ggaXMgdGhlIGluc3BlY3RWZWN0b3JUZXh0XHJcbiAgICBjb25zdCBpbnNwZWN0VmVjdG9yVGV4dCA9IG5ldyBUZXh0KCBWZWN0b3JBZGRpdGlvblN0cmluZ3MudmVjdG9yVmFsdWVzLCB7XHJcbiAgICAgIGZvbnQ6IFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLlRJVExFX0ZPTlRcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENyZWF0ZSB0aGUgc2NlbmVyeSBub2RlcyBmb3Igd2hlbiB0aGUgcGFuZWwgaXMgb3BlblxyXG5cclxuICAgIC8vIFRleHQgZm9yIHdoZW4gdGhlcmUgaXNuJ3QgYSB2ZWN0b3IgdGhhdCBpcyBhY3RpdmVcclxuICAgIGNvbnN0IHNlbGVjdFZlY3RvclRleHQgPSBuZXcgVGV4dCggVmVjdG9yQWRkaXRpb25TdHJpbmdzLm5vVmVjdG9yU2VsZWN0ZWQsIHtcclxuICAgICAgZm9udDogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuVElUTEVfRk9OVFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENvbnRhaW5lciBmb3IgdGhlIGxhYmVscyBhbmQgbnVtYmVyIGRpc3BsYXlzIHRoYXQgZGlzcGxheSB0aGUgdmVjdG9yJ3MgYXR0cmlidXRlc1xyXG4gICAgY29uc3QgdmVjdG9yQXR0cmlidXRlc0NvbnRhaW5lciA9IG5ldyBIQm94KCB7IHNwYWNpbmc6IExBQkVMX0xFRlRfTUFSR0lOIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNvbnRlbnQgY29udGFpbmVyIGZvciB0aGUgb3BlbiBjb250ZW50XHJcbiAgICBjb25zdCBwYW5lbE9wZW5Db250ZW50ID0gbmV3IE5vZGUoKTtcclxuICAgIHBhbmVsT3BlbkNvbnRlbnQuc2V0Q2hpbGRyZW4oIFsgc2VsZWN0VmVjdG9yVGV4dCwgdmVjdG9yQXR0cmlidXRlc0NvbnRhaW5lciBdICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBDcmVhdGUgdGhlIHNjZW5lcnkgbm9kZXMgdG8gZGlzcGxheSB0aGUgdmVjdG9yLiBFYWNoIGF0dHJpYnV0ZSBoYXMgYSBsYWJlbCBhbmQgYSBWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb25zdCBtYWduaXR1ZGVEaXNwbGF5Tm9kZSA9IG5ldyBWZWN0b3JTeW1ib2xOb2RlKCB7XHJcbiAgICAgIGluY2x1ZGVBYnNvbHV0ZVZhbHVlQmFyczogdHJ1ZVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbWFnbml0dWRlTnVtYmVyRGlzcGxheSA9IG5ldyBWZWN0b3JWYWx1ZXNOdW1iZXJEaXNwbGF5KCBncmFwaCwgVmVjdG9yUXVhbnRpdGllcy5NQUdOSVRVREUgKTtcclxuXHJcbiAgICBjb25zdCBhbmdsZVRleHQgPSBuZXcgVGV4dCggTWF0aFN5bWJvbHMuVEhFVEEsIHsgZm9udDogVmVjdG9yQWRkaXRpb25Db25zdGFudHMuRVFVQVRJT05fU1lNQk9MX0ZPTlQgfSApO1xyXG4gICAgY29uc3QgYW5nbGVOdW1iZXJEaXNwbGF5ID0gbmV3IFZlY3RvclZhbHVlc051bWJlckRpc3BsYXkoIGdyYXBoLCBWZWN0b3JRdWFudGl0aWVzLkFOR0xFICk7XHJcblxyXG4gICAgY29uc3QgeENvbXBvbmVudFRleHQgPSBuZXcgVmVjdG9yU3ltYm9sTm9kZSggeyBzaG93VmVjdG9yQXJyb3c6IGZhbHNlIH0gKTtcclxuICAgIGNvbnN0IHhDb21wb25lbnROdW1iZXJEaXNwbGF5ID0gbmV3IFZlY3RvclZhbHVlc051bWJlckRpc3BsYXkoIGdyYXBoLCBWZWN0b3JRdWFudGl0aWVzLlhfQ09NUE9ORU5UICk7XHJcblxyXG4gICAgY29uc3QgeUNvbXBvbmVudFRleHQgPSBuZXcgVmVjdG9yU3ltYm9sTm9kZSggeyBzaG93VmVjdG9yQXJyb3c6IGZhbHNlIH0gKTtcclxuICAgIGNvbnN0IHlDb21wb25lbnROdW1iZXJEaXNwbGF5ID0gbmV3IFZlY3RvclZhbHVlc051bWJlckRpc3BsYXkoIGdyYXBoLCBWZWN0b3JRdWFudGl0aWVzLllfQ09NUE9ORU5UICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBZGQgdGhlIG5ldyBzY2VuZXJ5IG5vZGVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBGdW5jdGlvbiB0aGF0IGFkZHMgYSBsYWJlbCBhbmQgZGlzcGxheSBjb250YWluZXIgY29tYm8sIHB1dHRpbmcgdGhlIGxhYmVsIGluIGEgZml4ZWQgc2l6ZWQgQWxpZ25Cb3hcclxuICAgIGNvbnN0IGFkZE51bWJlckRpc3BsYXlBbmRMYWJlbCA9ICggbGFiZWwsIG51bWJlckRpc3BsYXksIGxhYmVsV2lkdGggKSA9PiB7XHJcblxyXG4gICAgICAvLyBBbGlnbiB0aGUgbGFiZWwgaW4gYSBBbGlnbkJveCB0byBzZXQgYSBmaXhlZCB3aWR0aFxyXG4gICAgICBjb25zdCBmaXhlZFdpZHRoTGFiZWwgPSBuZXcgQWxpZ25Cb3goIGxhYmVsLCB7XHJcbiAgICAgICAgeEFsaWduOiAncmlnaHQnLFxyXG4gICAgICAgIHlBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgYWxpZ25Cb3VuZHM6IG5ldyBCb3VuZHMyKCAwLCAwLCBsYWJlbFdpZHRoLCBvcHRpb25zLmNvbnRlbnRGaXhlZEhlaWdodCApLFxyXG4gICAgICAgIG1heFdpZHRoOiBsYWJlbFdpZHRoXHJcbiAgICAgIH0gKTtcclxuICAgICAgbGFiZWwubWF4V2lkdGggPSBsYWJlbFdpZHRoO1xyXG4gICAgICB2ZWN0b3JBdHRyaWJ1dGVzQ29udGFpbmVyLmFkZENoaWxkKCBuZXcgSEJveCgge1xyXG4gICAgICAgIHNwYWNpbmc6IExBQkVMX1JJR0hUX01BUkdJTixcclxuICAgICAgICBjaGlsZHJlbjogWyBmaXhlZFdpZHRoTGFiZWwsIG51bWJlckRpc3BsYXkgXVxyXG4gICAgICB9ICkgKTtcclxuICAgIH07XHJcblxyXG4gICAgYWRkTnVtYmVyRGlzcGxheUFuZExhYmVsKCBtYWduaXR1ZGVEaXNwbGF5Tm9kZSwgbWFnbml0dWRlTnVtYmVyRGlzcGxheSwgTUFHTklUVURFX0xBQkVMX1dJRFRIICk7XHJcbiAgICBhZGROdW1iZXJEaXNwbGF5QW5kTGFiZWwoIGFuZ2xlVGV4dCwgYW5nbGVOdW1iZXJEaXNwbGF5LCBBTkdMRV9MQUJFTF9XSURUSCApO1xyXG4gICAgYWRkTnVtYmVyRGlzcGxheUFuZExhYmVsKCB4Q29tcG9uZW50VGV4dCwgeENvbXBvbmVudE51bWJlckRpc3BsYXksIENPTVBPTkVOVF9MQUJFTF9XSURUSCApO1xyXG4gICAgYWRkTnVtYmVyRGlzcGxheUFuZExhYmVsKCB5Q29tcG9uZW50VGV4dCwgeUNvbXBvbmVudE51bWJlckRpc3BsYXksIENPTVBPTkVOVF9MQUJFTF9XSURUSCApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IHVwZGF0ZUNvZWZmaWNpZW50ID0gY29lZmZpY2llbnQgPT4ge1xyXG4gICAgICBtYWduaXR1ZGVEaXNwbGF5Tm9kZS5zZXRDb2VmZmljaWVudCggY29lZmZpY2llbnQgKTtcclxuICAgICAgeENvbXBvbmVudFRleHQuc2V0Q29lZmZpY2llbnQoIGNvZWZmaWNpZW50ICk7XHJcbiAgICAgIHlDb21wb25lbnRUZXh0LnNldENvZWZmaWNpZW50KCBjb2VmZmljaWVudCApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgdG8gd2hlbiB0aGUgZ3JhcGhzIGFjdGl2ZSB2ZWN0b3IgUHJvcGVydHkgY2hhbmdlcyB0byB1cGRhdGUgdGhlIHBhbmVsLlxyXG4gICAgLy8gdW5saW5rIGlzIHVubmVjZXNzYXJ5LCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG4gICAgZ3JhcGguYWN0aXZlVmVjdG9yUHJvcGVydHkubGluayggKCBhY3RpdmVWZWN0b3IsIG9sZEFjdGl2ZVZlY3RvciApID0+IHtcclxuXHJcbiAgICAgIGlmICggYWN0aXZlVmVjdG9yICE9PSBudWxsICkge1xyXG4gICAgICAgIHZlY3RvckF0dHJpYnV0ZXNDb250YWluZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgc2VsZWN0VmVjdG9yVGV4dC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIEdldCB0aGUgdmVjdG9yIHN5bWJvbFxyXG4gICAgICAgIGNvbnN0IHZlY3RvclN5bWJvbCA9IGFjdGl2ZVZlY3Rvci5zeW1ib2wgPyBhY3RpdmVWZWN0b3Iuc3ltYm9sIDogYWN0aXZlVmVjdG9yLmZhbGxCYWNrU3ltYm9sO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgbGFiZWxzIChhbmdsZSBsYWJlbCBpcyB0aGUgc2FtZSlcclxuICAgICAgICBtYWduaXR1ZGVEaXNwbGF5Tm9kZS5zZXRTeW1ib2woIHZlY3RvclN5bWJvbCApO1xyXG4gICAgICAgIHhDb21wb25lbnRUZXh0LnNldFN5bWJvbCggYCR7dmVjdG9yU3ltYm9sfTxzdWI+JHtWZWN0b3JBZGRpdGlvblN0cmluZ3Muc3ltYm9sLnh9PC9zdWI+YCApO1xyXG4gICAgICAgIHlDb21wb25lbnRUZXh0LnNldFN5bWJvbCggYCR7dmVjdG9yU3ltYm9sfTxzdWI+JHtWZWN0b3JBZGRpdGlvblN0cmluZ3Muc3ltYm9sLnl9PC9zdWI+YCApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHZlY3RvckF0dHJpYnV0ZXNDb250YWluZXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHNlbGVjdFZlY3RvclRleHQudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHNlbGVjdFZlY3RvclRleHQuY2VudGVyWSA9IHBhbmVsT3BlbkNvbnRlbnQuY2VudGVyWTtcclxuICAgICAgdmVjdG9yQXR0cmlidXRlc0NvbnRhaW5lci5jZW50ZXJZID0gcGFuZWxPcGVuQ29udGVudC5jZW50ZXJZO1xyXG5cclxuICAgICAgaWYgKCBhY3RpdmVWZWN0b3IgJiYgYWN0aXZlVmVjdG9yLmNvZWZmaWNpZW50UHJvcGVydHkgKSB7XHJcbiAgICAgICAgYWN0aXZlVmVjdG9yLmNvZWZmaWNpZW50UHJvcGVydHkubGluayggdXBkYXRlQ29lZmZpY2llbnQgKTsgLy8gdW5saW5rIHJlcXVpcmVkIHdoZW4gYWN0aXZlIHZlY3RvciBjaGFuZ2VzXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggb2xkQWN0aXZlVmVjdG9yICYmIG9sZEFjdGl2ZVZlY3Rvci5jb2VmZmljaWVudFByb3BlcnR5ICkge1xyXG4gICAgICAgIG9sZEFjdGl2ZVZlY3Rvci5jb2VmZmljaWVudFByb3BlcnR5LnVubGluayggdXBkYXRlQ29lZmZpY2llbnQgKTtcclxuICAgICAgICAvLyByZXNldFxyXG4gICAgICAgIHVwZGF0ZUNvZWZmaWNpZW50KCAoIGFjdGl2ZVZlY3RvciAmJiBhY3RpdmVWZWN0b3IuY29lZmZpY2llbnRQcm9wZXJ0eSApID8gYWN0aXZlVmVjdG9yLmNvZWZmaWNpZW50UHJvcGVydHkudmFsdWUgOiAxICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzZWxlY3RWZWN0b3JUZXh0LmNlbnRlclkgPSBwYW5lbE9wZW5Db250ZW50LmNlbnRlclk7XHJcbiAgICB2ZWN0b3JBdHRyaWJ1dGVzQ29udGFpbmVyLmNlbnRlclkgPSBwYW5lbE9wZW5Db250ZW50LmNlbnRlclk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBDcmVhdGUgdGhlIGluc3BlY3QgYSB2ZWN0b3IgcGFuZWxcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHN1cGVyKCBpbnNwZWN0VmVjdG9yVGV4dCwgcGFuZWxPcGVuQ29udGVudCwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ1ZlY3RvclZhbHVlc1RvZ2dsZUJveCBpcyBub3QgaW50ZW5kZWQgdG8gYmUgZGlzcG9zZWQnICk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ1ZlY3RvclZhbHVlc1RvZ2dsZUJveCcsIFZlY3RvclZhbHVlc1RvZ2dsZUJveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxTQUFTQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlFLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSxtQkFBbUI7QUFDckMsT0FBT0MsdUJBQXVCLE1BQU0sK0JBQStCO0FBQ25FLE9BQU9DLFNBQVMsTUFBTSxnQkFBZ0I7QUFDdEMsT0FBT0MsZ0JBQWdCLE1BQU0sdUJBQXVCO0FBQ3BELE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyx5QkFBeUIsTUFBTSxnQ0FBZ0M7O0FBRXRFO0FBQ0E7O0FBRUE7QUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxDQUFDOztBQUU1QjtBQUNBLE1BQU1DLGlCQUFpQixHQUFHLEVBQUU7O0FBRTVCO0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcsRUFBRTs7QUFFaEM7QUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxFQUFFOztBQUU1QjtBQUNBLE1BQU1DLHFCQUFxQixHQUFHLEVBQUU7QUFFaEMsZUFBZSxNQUFNQyxxQkFBcUIsU0FBU1QsU0FBUyxDQUFDO0VBRTNEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VVLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsT0FBTyxFQUFHO0lBRTVCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUYsS0FBSyxZQUFZYixLQUFLLEVBQUcsa0JBQWlCYSxLQUFNLEVBQUUsQ0FBQztJQUNyRUUsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ0QsT0FBTyxJQUFJRSxNQUFNLENBQUNDLGNBQWMsQ0FBRUgsT0FBUSxDQUFDLEtBQUtFLE1BQU0sQ0FBQ0UsU0FBUyxFQUFHLCtCQUE4QkosT0FBUSxFQUFFLENBQUM7SUFFL0hBLE9BQU8sR0FBR3RCLEtBQUssQ0FBRTtNQUVmO01BQ0EyQixpQkFBaUIsRUFBRSxHQUFHO01BQUU7TUFDeEJDLGtCQUFrQixFQUFFLEVBQUU7TUFBRTtNQUN4QkMsbUJBQW1CLEVBQUU7SUFFdkIsQ0FBQyxFQUFFUCxPQUFRLENBQUM7O0lBRVo7SUFDQTtJQUNBLE1BQU1RLGlCQUFpQixHQUFHLElBQUl6QixJQUFJLENBQUVFLHFCQUFxQixDQUFDd0IsWUFBWSxFQUFFO01BQ3RFQyxJQUFJLEVBQUV2Qix1QkFBdUIsQ0FBQ3dCO0lBQ2hDLENBQUUsQ0FBQzs7SUFFSDtJQUNBOztJQUVBO0lBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSTdCLElBQUksQ0FBRUUscUJBQXFCLENBQUM0QixnQkFBZ0IsRUFBRTtNQUN6RUgsSUFBSSxFQUFFdkIsdUJBQXVCLENBQUN3QjtJQUNoQyxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNRyx5QkFBeUIsR0FBRyxJQUFJakMsSUFBSSxDQUFFO01BQUVrQyxPQUFPLEVBQUV0QjtJQUFrQixDQUFFLENBQUM7O0lBRTVFO0lBQ0EsTUFBTXVCLGdCQUFnQixHQUFHLElBQUlsQyxJQUFJLENBQUMsQ0FBQztJQUNuQ2tDLGdCQUFnQixDQUFDQyxXQUFXLENBQUUsQ0FBRUwsZ0JBQWdCLEVBQUVFLHlCQUF5QixDQUFHLENBQUM7O0lBRS9FO0lBQ0E7SUFDQTs7SUFFQSxNQUFNSSxvQkFBb0IsR0FBRyxJQUFJNUIsZ0JBQWdCLENBQUU7TUFDakQ2Qix3QkFBd0IsRUFBRTtJQUM1QixDQUFFLENBQUM7SUFDSCxNQUFNQyxzQkFBc0IsR0FBRyxJQUFJN0IseUJBQXlCLENBQUVRLEtBQUssRUFBRVYsZ0JBQWdCLENBQUNnQyxTQUFVLENBQUM7SUFFakcsTUFBTUMsU0FBUyxHQUFHLElBQUl2QyxJQUFJLENBQUVKLFdBQVcsQ0FBQzRDLEtBQUssRUFBRTtNQUFFYixJQUFJLEVBQUV2Qix1QkFBdUIsQ0FBQ3FDO0lBQXFCLENBQUUsQ0FBQztJQUN2RyxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJbEMseUJBQXlCLENBQUVRLEtBQUssRUFBRVYsZ0JBQWdCLENBQUNxQyxLQUFNLENBQUM7SUFFekYsTUFBTUMsY0FBYyxHQUFHLElBQUlyQyxnQkFBZ0IsQ0FBRTtNQUFFc0MsZUFBZSxFQUFFO0lBQU0sQ0FBRSxDQUFDO0lBQ3pFLE1BQU1DLHVCQUF1QixHQUFHLElBQUl0Qyx5QkFBeUIsQ0FBRVEsS0FBSyxFQUFFVixnQkFBZ0IsQ0FBQ3lDLFdBQVksQ0FBQztJQUVwRyxNQUFNQyxjQUFjLEdBQUcsSUFBSXpDLGdCQUFnQixDQUFFO01BQUVzQyxlQUFlLEVBQUU7SUFBTSxDQUFFLENBQUM7SUFDekUsTUFBTUksdUJBQXVCLEdBQUcsSUFBSXpDLHlCQUF5QixDQUFFUSxLQUFLLEVBQUVWLGdCQUFnQixDQUFDNEMsV0FBWSxDQUFDOztJQUVwRztJQUNBO0lBQ0E7O0lBRUE7SUFDQSxNQUFNQyx3QkFBd0IsR0FBR0EsQ0FBRUMsS0FBSyxFQUFFQyxhQUFhLEVBQUVDLFVBQVUsS0FBTTtNQUV2RTtNQUNBLE1BQU1DLGVBQWUsR0FBRyxJQUFJMUQsUUFBUSxDQUFFdUQsS0FBSyxFQUFFO1FBQzNDSSxNQUFNLEVBQUUsT0FBTztRQUNmQyxNQUFNLEVBQUUsUUFBUTtRQUNoQkMsV0FBVyxFQUFFLElBQUloRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTRELFVBQVUsRUFBRXJDLE9BQU8sQ0FBQ00sa0JBQW1CLENBQUM7UUFDeEVvQyxRQUFRLEVBQUVMO01BQ1osQ0FBRSxDQUFDO01BQ0hGLEtBQUssQ0FBQ08sUUFBUSxHQUFHTCxVQUFVO01BQzNCdkIseUJBQXlCLENBQUM2QixRQUFRLENBQUUsSUFBSTlELElBQUksQ0FBRTtRQUM1Q2tDLE9BQU8sRUFBRXZCLGtCQUFrQjtRQUMzQm9ELFFBQVEsRUFBRSxDQUFFTixlQUFlLEVBQUVGLGFBQWE7TUFDNUMsQ0FBRSxDQUFFLENBQUM7SUFDUCxDQUFDO0lBRURGLHdCQUF3QixDQUFFaEIsb0JBQW9CLEVBQUVFLHNCQUFzQixFQUFFMUIscUJBQXNCLENBQUM7SUFDL0Z3Qyx3QkFBd0IsQ0FBRVosU0FBUyxFQUFFRyxrQkFBa0IsRUFBRTlCLGlCQUFrQixDQUFDO0lBQzVFdUMsd0JBQXdCLENBQUVQLGNBQWMsRUFBRUUsdUJBQXVCLEVBQUVqQyxxQkFBc0IsQ0FBQztJQUMxRnNDLHdCQUF3QixDQUFFSCxjQUFjLEVBQUVDLHVCQUF1QixFQUFFcEMscUJBQXNCLENBQUM7O0lBRTFGOztJQUVBLE1BQU1pRCxpQkFBaUIsR0FBR0MsV0FBVyxJQUFJO01BQ3ZDNUIsb0JBQW9CLENBQUM2QixjQUFjLENBQUVELFdBQVksQ0FBQztNQUNsRG5CLGNBQWMsQ0FBQ29CLGNBQWMsQ0FBRUQsV0FBWSxDQUFDO01BQzVDZixjQUFjLENBQUNnQixjQUFjLENBQUVELFdBQVksQ0FBQztJQUM5QyxDQUFDOztJQUVEO0lBQ0E7SUFDQS9DLEtBQUssQ0FBQ2lELG9CQUFvQixDQUFDQyxJQUFJLENBQUUsQ0FBRUMsWUFBWSxFQUFFQyxlQUFlLEtBQU07TUFFcEUsSUFBS0QsWUFBWSxLQUFLLElBQUksRUFBRztRQUMzQnBDLHlCQUF5QixDQUFDc0MsT0FBTyxHQUFHLElBQUk7UUFDeEN4QyxnQkFBZ0IsQ0FBQ3dDLE9BQU8sR0FBRyxLQUFLOztRQUVoQztRQUNBLE1BQU1DLFlBQVksR0FBR0gsWUFBWSxDQUFDSSxNQUFNLEdBQUdKLFlBQVksQ0FBQ0ksTUFBTSxHQUFHSixZQUFZLENBQUNLLGNBQWM7O1FBRTVGO1FBQ0FyQyxvQkFBb0IsQ0FBQ3NDLFNBQVMsQ0FBRUgsWUFBYSxDQUFDO1FBQzlDMUIsY0FBYyxDQUFDNkIsU0FBUyxDQUFHLEdBQUVILFlBQWEsUUFBT3BFLHFCQUFxQixDQUFDcUUsTUFBTSxDQUFDRyxDQUFFLFFBQVEsQ0FBQztRQUN6RjFCLGNBQWMsQ0FBQ3lCLFNBQVMsQ0FBRyxHQUFFSCxZQUFhLFFBQU9wRSxxQkFBcUIsQ0FBQ3FFLE1BQU0sQ0FBQ0ksQ0FBRSxRQUFRLENBQUM7TUFDM0YsQ0FBQyxNQUNJO1FBQ0g1Qyx5QkFBeUIsQ0FBQ3NDLE9BQU8sR0FBRyxLQUFLO1FBQ3pDeEMsZ0JBQWdCLENBQUN3QyxPQUFPLEdBQUcsSUFBSTtNQUNqQztNQUVBeEMsZ0JBQWdCLENBQUMrQyxPQUFPLEdBQUczQyxnQkFBZ0IsQ0FBQzJDLE9BQU87TUFDbkQ3Qyx5QkFBeUIsQ0FBQzZDLE9BQU8sR0FBRzNDLGdCQUFnQixDQUFDMkMsT0FBTztNQUU1RCxJQUFLVCxZQUFZLElBQUlBLFlBQVksQ0FBQ1UsbUJBQW1CLEVBQUc7UUFDdERWLFlBQVksQ0FBQ1UsbUJBQW1CLENBQUNYLElBQUksQ0FBRUosaUJBQWtCLENBQUMsQ0FBQyxDQUFDO01BQzlEOztNQUVBLElBQUtNLGVBQWUsSUFBSUEsZUFBZSxDQUFDUyxtQkFBbUIsRUFBRztRQUM1RFQsZUFBZSxDQUFDUyxtQkFBbUIsQ0FBQ0MsTUFBTSxDQUFFaEIsaUJBQWtCLENBQUM7UUFDL0Q7UUFDQUEsaUJBQWlCLENBQUlLLFlBQVksSUFBSUEsWUFBWSxDQUFDVSxtQkFBbUIsR0FBS1YsWUFBWSxDQUFDVSxtQkFBbUIsQ0FBQ0UsS0FBSyxHQUFHLENBQUUsQ0FBQztNQUN4SDtJQUNGLENBQUUsQ0FBQztJQUVIbEQsZ0JBQWdCLENBQUMrQyxPQUFPLEdBQUczQyxnQkFBZ0IsQ0FBQzJDLE9BQU87SUFDbkQ3Qyx5QkFBeUIsQ0FBQzZDLE9BQU8sR0FBRzNDLGdCQUFnQixDQUFDMkMsT0FBTzs7SUFFNUQ7SUFDQTtJQUNBOztJQUVBLEtBQUssQ0FBRW5ELGlCQUFpQixFQUFFUSxnQkFBZ0IsRUFBRWhCLE9BQVEsQ0FBQztFQUN2RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFK0QsT0FBT0EsQ0FBQSxFQUFHO0lBQ1I5RCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsc0RBQXVELENBQUM7RUFDbkY7QUFDRjtBQUVBakIsY0FBYyxDQUFDZ0YsUUFBUSxDQUFFLHVCQUF1QixFQUFFbkUscUJBQXNCLENBQUMifQ==