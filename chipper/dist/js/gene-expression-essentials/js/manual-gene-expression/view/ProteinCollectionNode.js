// Copyright 2015-2023, University of Colorado Boulder

/**
 * A Node that represents a labeled box where the user can collect protein molecules.
 *
 * @author Sharfudeen Ashraf
 * @author John Blanco
 * @author Aadish Gupta
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Color, HBox, Node, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import GEEConstants from '../../common/GEEConstants.js';
import geneExpressionEssentials from '../../geneExpressionEssentials.js';
import GeneExpressionEssentialsStrings from '../../GeneExpressionEssentialsStrings.js';
import ProteinCollectionArea from './ProteinCollectionArea.js';

// constants
const NUM_PROTEIN_TYPES = 3; // Total number of protein types that can be collected.

// attributes of various aspects of the box
const TITLE_FONT = new PhetFont({
  size: 18,
  weight: 'bold'
});
const READOUT_FONT = new PhetFont({
  size: 18,
  weight: 'bold'
});
const BACKGROUND_COLOR = new Color(255, 250, 205);
const INTEGER_BOX_BACKGROUND_COLOR = new Color(240, 240, 240);
const collectionCompleteString = GeneExpressionEssentialsStrings.collectionComplete;
const proteinCountCaptionPart1String = GeneExpressionEssentialsStrings.proteinCountCaptionPart1;
const proteinCountCaptionPart2String = GeneExpressionEssentialsStrings.proteinCountCaptionPart2;
const yourProteinCollectionString = GeneExpressionEssentialsStrings.yourProteinCollection;
class ProteinCollectionNode extends Node {
  /**
   * @param {ManualGeneExpressionModel} model
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(model, modelViewTransform) {
    super();

    // Create the title and scale it if needed.
    const title = new RichText(yourProteinCollectionString, {
      fill: Color.BLACK,
      font: TITLE_FONT,
      maxWidth: 120,
      align: 'center'
    });

    // create the collection area
    const collectionArea = new ProteinCollectionArea(model, modelViewTransform);

    // create the panel
    this.addChild(new Panel(new VBox({
      children: [title, collectionArea, createCollectionCountIndicator(model)],
      spacing: 5
    }), {
      cornerRadius: GEEConstants.CORNER_RADIUS,
      fill: BACKGROUND_COLOR,
      resize: false
    }));
  }
}

/**
 * helper function to create a node that indicates the number of proteins that the user has collected so far. This
 * monitors the model and updates automatically.
 * @param {ManualGeneExpressionModel}model
 */
function createCollectionCountIndicator(model) {
  const contentNode = new Node();
  const collectionCompleteNode = new Text(collectionCompleteString, {
    font: new PhetFont(20),
    maxWidth: 200
  });
  contentNode.addChild(collectionCompleteNode);
  const countReadoutText = new Text(0, {
    font: READOUT_FONT
  });
  const countReadoutPanel = new Panel(countReadoutText, {
    minWidth: countReadoutText.width,
    resize: false,
    cornerRadius: GEEConstants.CORNER_RADIUS,
    lineWidth: 1,
    align: 'center',
    fill: INTEGER_BOX_BACKGROUND_COLOR
  });
  const countIndicatorNode = new HBox({
    children: [new Text(proteinCountCaptionPart1String, {
      font: READOUT_FONT,
      maxWidth: 100
    }), countReadoutPanel],
    spacing: 4
  });
  const children = [countIndicatorNode, new Text(proteinCountCaptionPart2String, {
    font: READOUT_FONT,
    maxWidth: 200
  })];
  const collectedQuantityIndicator = new VBox({
    children: children,
    spacing: 10
  });
  contentNode.addChild(collectedQuantityIndicator);
  collectedQuantityIndicator.center = collectionCompleteNode.center;
  function countChangeUpdater() {
    let numProteinTypesCollected = 0;
    if (model.proteinACollectedProperty.get() > 0) {
      numProteinTypesCollected++;
    }
    if (model.proteinBCollectedProperty.get() > 0) {
      numProteinTypesCollected++;
    }
    if (model.proteinCCollectedProperty.get() > 0) {
      numProteinTypesCollected++;
    }
    countReadoutText.setString(numProteinTypesCollected);
    // Set the visibility.
    collectedQuantityIndicator.setVisible(numProteinTypesCollected !== NUM_PROTEIN_TYPES);
    collectionCompleteNode.setVisible(numProteinTypesCollected === NUM_PROTEIN_TYPES);
  }
  model.proteinACollectedProperty.link(countChangeUpdater);
  model.proteinBCollectedProperty.link(countChangeUpdater);
  model.proteinCCollectedProperty.link(countChangeUpdater);
  return contentNode;
}
geneExpressionEssentials.register('ProteinCollectionNode', ProteinCollectionNode);
export default ProteinCollectionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIkNvbG9yIiwiSEJveCIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiUGFuZWwiLCJHRUVDb25zdGFudHMiLCJnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMiLCJHZW5lRXhwcmVzc2lvbkVzc2VudGlhbHNTdHJpbmdzIiwiUHJvdGVpbkNvbGxlY3Rpb25BcmVhIiwiTlVNX1BST1RFSU5fVFlQRVMiLCJUSVRMRV9GT05UIiwic2l6ZSIsIndlaWdodCIsIlJFQURPVVRfRk9OVCIsIkJBQ0tHUk9VTkRfQ09MT1IiLCJJTlRFR0VSX0JPWF9CQUNLR1JPVU5EX0NPTE9SIiwiY29sbGVjdGlvbkNvbXBsZXRlU3RyaW5nIiwiY29sbGVjdGlvbkNvbXBsZXRlIiwicHJvdGVpbkNvdW50Q2FwdGlvblBhcnQxU3RyaW5nIiwicHJvdGVpbkNvdW50Q2FwdGlvblBhcnQxIiwicHJvdGVpbkNvdW50Q2FwdGlvblBhcnQyU3RyaW5nIiwicHJvdGVpbkNvdW50Q2FwdGlvblBhcnQyIiwieW91clByb3RlaW5Db2xsZWN0aW9uU3RyaW5nIiwieW91clByb3RlaW5Db2xsZWN0aW9uIiwiUHJvdGVpbkNvbGxlY3Rpb25Ob2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInRpdGxlIiwiZmlsbCIsIkJMQUNLIiwiZm9udCIsIm1heFdpZHRoIiwiYWxpZ24iLCJjb2xsZWN0aW9uQXJlYSIsImFkZENoaWxkIiwiY2hpbGRyZW4iLCJjcmVhdGVDb2xsZWN0aW9uQ291bnRJbmRpY2F0b3IiLCJzcGFjaW5nIiwiY29ybmVyUmFkaXVzIiwiQ09STkVSX1JBRElVUyIsInJlc2l6ZSIsImNvbnRlbnROb2RlIiwiY29sbGVjdGlvbkNvbXBsZXRlTm9kZSIsImNvdW50UmVhZG91dFRleHQiLCJjb3VudFJlYWRvdXRQYW5lbCIsIm1pbldpZHRoIiwid2lkdGgiLCJsaW5lV2lkdGgiLCJjb3VudEluZGljYXRvck5vZGUiLCJjb2xsZWN0ZWRRdWFudGl0eUluZGljYXRvciIsImNlbnRlciIsImNvdW50Q2hhbmdlVXBkYXRlciIsIm51bVByb3RlaW5UeXBlc0NvbGxlY3RlZCIsInByb3RlaW5BQ29sbGVjdGVkUHJvcGVydHkiLCJnZXQiLCJwcm90ZWluQkNvbGxlY3RlZFByb3BlcnR5IiwicHJvdGVpbkNDb2xsZWN0ZWRQcm9wZXJ0eSIsInNldFN0cmluZyIsInNldFZpc2libGUiLCJsaW5rIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcm90ZWluQ29sbGVjdGlvbk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSBOb2RlIHRoYXQgcmVwcmVzZW50cyBhIGxhYmVsZWQgYm94IHdoZXJlIHRoZSB1c2VyIGNhbiBjb2xsZWN0IHByb3RlaW4gbW9sZWN1bGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIEhCb3gsIE5vZGUsIFJpY2hUZXh0LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBHRUVDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0dFRUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBnZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMgZnJvbSAnLi4vLi4vZ2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzLmpzJztcclxuaW1wb3J0IEdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MgZnJvbSAnLi4vLi4vR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQcm90ZWluQ29sbGVjdGlvbkFyZWEgZnJvbSAnLi9Qcm90ZWluQ29sbGVjdGlvbkFyZWEuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE5VTV9QUk9URUlOX1RZUEVTID0gMzsgIC8vIFRvdGFsIG51bWJlciBvZiBwcm90ZWluIHR5cGVzIHRoYXQgY2FuIGJlIGNvbGxlY3RlZC5cclxuXHJcbi8vIGF0dHJpYnV0ZXMgb2YgdmFyaW91cyBhc3BlY3RzIG9mIHRoZSBib3hcclxuY29uc3QgVElUTEVfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAxOCwgd2VpZ2h0OiAnYm9sZCcgfSApO1xyXG5jb25zdCBSRUFET1VUX0ZPTlQgPSBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTgsIHdlaWdodDogJ2JvbGQnIH0gKTtcclxuY29uc3QgQkFDS0dST1VORF9DT0xPUiA9IG5ldyBDb2xvciggMjU1LCAyNTAsIDIwNSApO1xyXG5jb25zdCBJTlRFR0VSX0JPWF9CQUNLR1JPVU5EX0NPTE9SID0gbmV3IENvbG9yKCAyNDAsIDI0MCwgMjQwICk7XHJcblxyXG5jb25zdCBjb2xsZWN0aW9uQ29tcGxldGVTdHJpbmcgPSBHZW5lRXhwcmVzc2lvbkVzc2VudGlhbHNTdHJpbmdzLmNvbGxlY3Rpb25Db21wbGV0ZTtcclxuY29uc3QgcHJvdGVpbkNvdW50Q2FwdGlvblBhcnQxU3RyaW5nID0gR2VuZUV4cHJlc3Npb25Fc3NlbnRpYWxzU3RyaW5ncy5wcm90ZWluQ291bnRDYXB0aW9uUGFydDE7XHJcbmNvbnN0IHByb3RlaW5Db3VudENhcHRpb25QYXJ0MlN0cmluZyA9IEdlbmVFeHByZXNzaW9uRXNzZW50aWFsc1N0cmluZ3MucHJvdGVpbkNvdW50Q2FwdGlvblBhcnQyO1xyXG5jb25zdCB5b3VyUHJvdGVpbkNvbGxlY3Rpb25TdHJpbmcgPSBHZW5lRXhwcmVzc2lvbkVzc2VudGlhbHNTdHJpbmdzLnlvdXJQcm90ZWluQ29sbGVjdGlvbjtcclxuXHJcbmNsYXNzIFByb3RlaW5Db2xsZWN0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01hbnVhbEdlbmVFeHByZXNzaW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSB0aXRsZSBhbmQgc2NhbGUgaXQgaWYgbmVlZGVkLlxyXG4gICAgY29uc3QgdGl0bGUgPSBuZXcgUmljaFRleHQoIHlvdXJQcm90ZWluQ29sbGVjdGlvblN0cmluZywge1xyXG4gICAgICBmaWxsOiBDb2xvci5CTEFDSyxcclxuICAgICAgZm9udDogVElUTEVfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IDEyMCxcclxuICAgICAgYWxpZ246ICdjZW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBjb2xsZWN0aW9uIGFyZWFcclxuICAgIGNvbnN0IGNvbGxlY3Rpb25BcmVhID0gbmV3IFByb3RlaW5Db2xsZWN0aW9uQXJlYSggbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgcGFuZWxcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQYW5lbChcclxuICAgICAgbmV3IFZCb3goIHsgY2hpbGRyZW46IFsgdGl0bGUsIGNvbGxlY3Rpb25BcmVhLCBjcmVhdGVDb2xsZWN0aW9uQ291bnRJbmRpY2F0b3IoIG1vZGVsICkgXSwgc3BhY2luZzogNSB9ICksXHJcbiAgICAgIHtcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IEdFRUNvbnN0YW50cy5DT1JORVJfUkFESVVTLFxyXG4gICAgICAgIGZpbGw6IEJBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgICAgcmVzaXplOiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICApICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogaGVscGVyIGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5vZGUgdGhhdCBpbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBwcm90ZWlucyB0aGF0IHRoZSB1c2VyIGhhcyBjb2xsZWN0ZWQgc28gZmFyLiBUaGlzXHJcbiAqIG1vbml0b3JzIHRoZSBtb2RlbCBhbmQgdXBkYXRlcyBhdXRvbWF0aWNhbGx5LlxyXG4gKiBAcGFyYW0ge01hbnVhbEdlbmVFeHByZXNzaW9uTW9kZWx9bW9kZWxcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUNvbGxlY3Rpb25Db3VudEluZGljYXRvciggbW9kZWwgKSB7XHJcbiAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgTm9kZSgpO1xyXG5cclxuICBjb25zdCBjb2xsZWN0aW9uQ29tcGxldGVOb2RlID0gbmV3IFRleHQoIGNvbGxlY3Rpb25Db21wbGV0ZVN0cmluZywge1xyXG4gICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gICAgbWF4V2lkdGg6IDIwMFxyXG4gIH0gKTtcclxuICBjb250ZW50Tm9kZS5hZGRDaGlsZCggY29sbGVjdGlvbkNvbXBsZXRlTm9kZSApO1xyXG5cclxuICBjb25zdCBjb3VudFJlYWRvdXRUZXh0ID0gbmV3IFRleHQoIDAsIHtcclxuICAgIGZvbnQ6IFJFQURPVVRfRk9OVFxyXG4gIH0gKTtcclxuICBjb25zdCBjb3VudFJlYWRvdXRQYW5lbCA9IG5ldyBQYW5lbCggY291bnRSZWFkb3V0VGV4dCwge1xyXG4gICAgbWluV2lkdGg6IGNvdW50UmVhZG91dFRleHQud2lkdGgsXHJcbiAgICByZXNpemU6IGZhbHNlLFxyXG4gICAgY29ybmVyUmFkaXVzOiBHRUVDb25zdGFudHMuQ09STkVSX1JBRElVUyxcclxuICAgIGxpbmVXaWR0aDogMSxcclxuICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgIGZpbGw6IElOVEVHRVJfQk9YX0JBQ0tHUk9VTkRfQ09MT1JcclxuICB9ICk7XHJcbiAgY29uc3QgY291bnRJbmRpY2F0b3JOb2RlID0gbmV3IEhCb3goIHtcclxuICAgIGNoaWxkcmVuOiBbIG5ldyBUZXh0KCBwcm90ZWluQ291bnRDYXB0aW9uUGFydDFTdHJpbmcsIHtcclxuICAgICAgZm9udDogUkVBRE9VVF9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTAwXHJcbiAgICB9ICksXHJcbiAgICAgIGNvdW50UmVhZG91dFBhbmVsIF0sXHJcbiAgICBzcGFjaW5nOiA0XHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBjaGlsZHJlbiA9IFsgY291bnRJbmRpY2F0b3JOb2RlLCBuZXcgVGV4dCggcHJvdGVpbkNvdW50Q2FwdGlvblBhcnQyU3RyaW5nLCB7XHJcbiAgICBmb250OiBSRUFET1VUX0ZPTlQsXHJcbiAgICBtYXhXaWR0aDogMjAwXHJcbiAgfSApIF07XHJcbiAgY29uc3QgY29sbGVjdGVkUXVhbnRpdHlJbmRpY2F0b3IgPSBuZXcgVkJveCgge1xyXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuLCBzcGFjaW5nOiAxMFxyXG4gIH0gKTtcclxuXHJcbiAgY29udGVudE5vZGUuYWRkQ2hpbGQoIGNvbGxlY3RlZFF1YW50aXR5SW5kaWNhdG9yICk7XHJcbiAgY29sbGVjdGVkUXVhbnRpdHlJbmRpY2F0b3IuY2VudGVyID0gY29sbGVjdGlvbkNvbXBsZXRlTm9kZS5jZW50ZXI7XHJcblxyXG4gIGZ1bmN0aW9uIGNvdW50Q2hhbmdlVXBkYXRlcigpIHtcclxuICAgIGxldCBudW1Qcm90ZWluVHlwZXNDb2xsZWN0ZWQgPSAwO1xyXG4gICAgaWYgKCBtb2RlbC5wcm90ZWluQUNvbGxlY3RlZFByb3BlcnR5LmdldCgpID4gMCApIHtcclxuICAgICAgbnVtUHJvdGVpblR5cGVzQ29sbGVjdGVkKys7XHJcbiAgICB9XHJcbiAgICBpZiAoIG1vZGVsLnByb3RlaW5CQ29sbGVjdGVkUHJvcGVydHkuZ2V0KCkgPiAwICkge1xyXG4gICAgICBudW1Qcm90ZWluVHlwZXNDb2xsZWN0ZWQrKztcclxuICAgIH1cclxuICAgIGlmICggbW9kZWwucHJvdGVpbkNDb2xsZWN0ZWRQcm9wZXJ0eS5nZXQoKSA+IDAgKSB7XHJcbiAgICAgIG51bVByb3RlaW5UeXBlc0NvbGxlY3RlZCsrO1xyXG4gICAgfVxyXG4gICAgY291bnRSZWFkb3V0VGV4dC5zZXRTdHJpbmcoIG51bVByb3RlaW5UeXBlc0NvbGxlY3RlZCApO1xyXG4gICAgLy8gU2V0IHRoZSB2aXNpYmlsaXR5LlxyXG4gICAgY29sbGVjdGVkUXVhbnRpdHlJbmRpY2F0b3Iuc2V0VmlzaWJsZSggbnVtUHJvdGVpblR5cGVzQ29sbGVjdGVkICE9PSBOVU1fUFJPVEVJTl9UWVBFUyApO1xyXG4gICAgY29sbGVjdGlvbkNvbXBsZXRlTm9kZS5zZXRWaXNpYmxlKCBudW1Qcm90ZWluVHlwZXNDb2xsZWN0ZWQgPT09IE5VTV9QUk9URUlOX1RZUEVTICk7XHJcbiAgfVxyXG5cclxuICBtb2RlbC5wcm90ZWluQUNvbGxlY3RlZFByb3BlcnR5LmxpbmsoIGNvdW50Q2hhbmdlVXBkYXRlciApO1xyXG4gIG1vZGVsLnByb3RlaW5CQ29sbGVjdGVkUHJvcGVydHkubGluayggY291bnRDaGFuZ2VVcGRhdGVyICk7XHJcbiAgbW9kZWwucHJvdGVpbkNDb2xsZWN0ZWRQcm9wZXJ0eS5saW5rKCBjb3VudENoYW5nZVVwZGF0ZXIgKTtcclxuXHJcbiAgcmV0dXJuIGNvbnRlbnROb2RlO1xyXG59XHJcblxyXG5nZW5lRXhwcmVzc2lvbkVzc2VudGlhbHMucmVnaXN0ZXIoICdQcm90ZWluQ29sbGVjdGlvbk5vZGUnLCBQcm90ZWluQ29sbGVjdGlvbk5vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFByb3RlaW5Db2xsZWN0aW9uTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFB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