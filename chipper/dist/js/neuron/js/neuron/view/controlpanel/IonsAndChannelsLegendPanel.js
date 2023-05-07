// Copyright 2014-2022, University of Colorado Boulder

/**
 * This class displays a legend, a.k.a. a key, for a set of ions and membrane
 * channels.  It simply displays information and doesn't control anything, so
 * it does not include much in the way of interactive behavior.
 *
 * @author John Blanco
 *@author Sharfudeen Ashraf (for Ghent University)
 */

import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, HStrut, Text, VBox } from '../../../../../scenery/js/imports.js';
import Panel from '../../../../../sun/js/Panel.js';
import neuron from '../../../neuron.js';
import NeuronStrings from '../../../NeuronStrings.js';
import NeuronConstants from '../../common/NeuronConstants.js';
import PotassiumGatedChannel from '../../model/PotassiumGatedChannel.js';
import PotassiumIon from '../../model/PotassiumIon.js';
import PotassiumLeakageChannel from '../../model/PotassiumLeakageChannel.js';
import SodiumDualGatedChannel from '../../model/SodiumDualGatedChannel.js';
import SodiumIon from '../../model/SodiumIon.js';
import SodiumLeakageChannel from '../../model/SodiumLeakageChannel.js';
import MembraneChannelNode from '../MembraneChannelNode.js';
import ParticleNode from '../ParticleNode.js';
const legendString = NeuronStrings.legend;
const potassiumGatedChannelString = NeuronStrings.potassiumGatedChannel;
const potassiumIonString = NeuronStrings.potassiumIon;
const potassiumLeakChannelString = NeuronStrings.potassiumLeakChannel;
const sodiumGatedChannelString = NeuronStrings.sodiumGatedChannel;
const sodiumIonString = NeuronStrings.sodiumIon;
const sodiumLeakChannelString = NeuronStrings.sodiumLeakChannel;

// constants
const LEGEND_TEXT_OPTIONS = {
  font: new PhetFont({
    size: 12
  })
};
const MAX_TEXT_WIDTH = 140; // empirically determined

class IonsAndChannelsLegendPanel extends Panel {
  constructor() {
    // The model-view transforms below are used to make nodes that usually
    // reside on the canvas be of an appropriate size for inclusion on the
    // control panel.
    const PARTICLE_MVT = ModelViewTransform2.createRectangleMapping(new Bounds2(-3.0, -3.0, 2.0, 2.0), new Bounds2(-8, -8, 16, 16));
    const CHANNEL_MVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, Vector2.ZERO, 4);

    // Add the title to the list of children.
    const imageAndLabelChildren = [];
    imageAndLabelChildren.push(scaleAndFitTextItem(new Text(legendString, {
      font: new PhetFont({
        size: 16,
        weight: 'bold'
      })
    })));

    // Create all of the image icons, since we need to do some layout calculations before adding them to the panel.
    const iconList = [];
    const sodiumIonImageNode = new ParticleNode(new SodiumIon(), PARTICLE_MVT);
    iconList.push(sodiumIonImageNode);
    const potassiumIonImageNode = new ParticleNode(new PotassiumIon(), PARTICLE_MVT);
    iconList.push(potassiumIonImageNode);
    const sodiumDualGatedChannelNode = new MembraneChannelNode(new SodiumDualGatedChannel(), CHANNEL_MVT);
    sodiumDualGatedChannelNode.rotate(-Math.PI / 2);
    iconList.push(sodiumDualGatedChannelNode);
    const potassiumGatedChannelNode = new MembraneChannelNode(new PotassiumGatedChannel(), CHANNEL_MVT);
    potassiumGatedChannelNode.rotate(-Math.PI / 2);
    iconList.push(potassiumGatedChannelNode);
    const sodiumLeakageChannelNode = new MembraneChannelNode(new SodiumLeakageChannel(), CHANNEL_MVT);
    sodiumLeakageChannelNode.rotate(-Math.PI / 2);
    iconList.push(sodiumLeakageChannelNode);
    const potassiumLeakageChannelNode = new MembraneChannelNode(new PotassiumLeakageChannel(), CHANNEL_MVT);
    potassiumLeakageChannelNode.rotate(-Math.PI / 2);
    iconList.push(potassiumLeakageChannelNode);

    // Figure out the maximum icon width.
    let maxIconWidth = 0;
    iconList.forEach(icon => {
      maxIconWidth = icon.width > maxIconWidth ? icon.width : maxIconWidth;
    });

    // Add the icon+caption nodes.
    imageAndLabelChildren.push(createIconAndCaptionNode(sodiumIonImageNode, maxIconWidth, sodiumIonString));
    imageAndLabelChildren.push(createIconAndCaptionNode(potassiumIonImageNode, maxIconWidth, potassiumIonString));
    imageAndLabelChildren.push(createIconAndCaptionNode(sodiumDualGatedChannelNode, maxIconWidth, sodiumGatedChannelString));
    imageAndLabelChildren.push(createIconAndCaptionNode(potassiumGatedChannelNode, maxIconWidth, potassiumGatedChannelString));
    imageAndLabelChildren.push(createIconAndCaptionNode(sodiumLeakageChannelNode, maxIconWidth, sodiumLeakChannelString));
    imageAndLabelChildren.push(createIconAndCaptionNode(potassiumLeakageChannelNode, maxIconWidth, potassiumLeakChannelString));

    // add the children to a VBox and put that on the panel
    super(new VBox({
      children: imageAndLabelChildren,
      align: 'left',
      spacing: 5
    }), {
      // panel options
      fill: NeuronConstants.CONTROL_PANEL_BACKGROUND,
      stroke: NeuronConstants.CONTROL_PANEL_STROKE,
      xMargin: 8,
      yMargin: 10
    });
  }
}

// Utility function to scale and fit the text nodes within the panel's bounds
function scaleAndFitTextItem(textItemNode) {
  const textNodeScaleFactor = Math.min(1, MAX_TEXT_WIDTH / textItemNode.width);
  textItemNode.scale(textNodeScaleFactor);
  return textItemNode;
}

// Utility function to create an icon/caption node for inclusion in the legend.
function createIconAndCaptionNode(icon, maxIconWidth, captionText) {
  assert && assert(icon.width <= maxIconWidth, 'maxIconWidth cannot be larger than ');
  const centeringSpacerWidth = (maxIconWidth - icon.width) / 2 + 0.1; // Spacing can't be zero, hence the adder at the end.
  return new HBox({
    spacing: 0,
    children: [new HStrut(centeringSpacerWidth), icon, new HStrut(centeringSpacerWidth + 8),
    // adder empirically determined
    scaleAndFitTextItem(new Text(captionText, LEGEND_TEXT_OPTIONS))]
  });
}
neuron.register('IonsAndChannelsLegendPanel', IonsAndChannelsLegendPanel);
export default IonsAndChannelsLegendPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVmVjdG9yMiIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJQaGV0Rm9udCIsIkhCb3giLCJIU3RydXQiLCJUZXh0IiwiVkJveCIsIlBhbmVsIiwibmV1cm9uIiwiTmV1cm9uU3RyaW5ncyIsIk5ldXJvbkNvbnN0YW50cyIsIlBvdGFzc2l1bUdhdGVkQ2hhbm5lbCIsIlBvdGFzc2l1bUlvbiIsIlBvdGFzc2l1bUxlYWthZ2VDaGFubmVsIiwiU29kaXVtRHVhbEdhdGVkQ2hhbm5lbCIsIlNvZGl1bUlvbiIsIlNvZGl1bUxlYWthZ2VDaGFubmVsIiwiTWVtYnJhbmVDaGFubmVsTm9kZSIsIlBhcnRpY2xlTm9kZSIsImxlZ2VuZFN0cmluZyIsImxlZ2VuZCIsInBvdGFzc2l1bUdhdGVkQ2hhbm5lbFN0cmluZyIsInBvdGFzc2l1bUdhdGVkQ2hhbm5lbCIsInBvdGFzc2l1bUlvblN0cmluZyIsInBvdGFzc2l1bUlvbiIsInBvdGFzc2l1bUxlYWtDaGFubmVsU3RyaW5nIiwicG90YXNzaXVtTGVha0NoYW5uZWwiLCJzb2RpdW1HYXRlZENoYW5uZWxTdHJpbmciLCJzb2RpdW1HYXRlZENoYW5uZWwiLCJzb2RpdW1Jb25TdHJpbmciLCJzb2RpdW1Jb24iLCJzb2RpdW1MZWFrQ2hhbm5lbFN0cmluZyIsInNvZGl1bUxlYWtDaGFubmVsIiwiTEVHRU5EX1RFWFRfT1BUSU9OUyIsImZvbnQiLCJzaXplIiwiTUFYX1RFWFRfV0lEVEgiLCJJb25zQW5kQ2hhbm5lbHNMZWdlbmRQYW5lbCIsImNvbnN0cnVjdG9yIiwiUEFSVElDTEVfTVZUIiwiY3JlYXRlUmVjdGFuZ2xlTWFwcGluZyIsIkNIQU5ORUxfTVZUIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJaRVJPIiwiaW1hZ2VBbmRMYWJlbENoaWxkcmVuIiwicHVzaCIsInNjYWxlQW5kRml0VGV4dEl0ZW0iLCJ3ZWlnaHQiLCJpY29uTGlzdCIsInNvZGl1bUlvbkltYWdlTm9kZSIsInBvdGFzc2l1bUlvbkltYWdlTm9kZSIsInNvZGl1bUR1YWxHYXRlZENoYW5uZWxOb2RlIiwicm90YXRlIiwiTWF0aCIsIlBJIiwicG90YXNzaXVtR2F0ZWRDaGFubmVsTm9kZSIsInNvZGl1bUxlYWthZ2VDaGFubmVsTm9kZSIsInBvdGFzc2l1bUxlYWthZ2VDaGFubmVsTm9kZSIsIm1heEljb25XaWR0aCIsImZvckVhY2giLCJpY29uIiwid2lkdGgiLCJjcmVhdGVJY29uQW5kQ2FwdGlvbk5vZGUiLCJjaGlsZHJlbiIsImFsaWduIiwic3BhY2luZyIsImZpbGwiLCJDT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkQiLCJzdHJva2UiLCJDT05UUk9MX1BBTkVMX1NUUk9LRSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwidGV4dEl0ZW1Ob2RlIiwidGV4dE5vZGVTY2FsZUZhY3RvciIsIm1pbiIsInNjYWxlIiwiY2FwdGlvblRleHQiLCJhc3NlcnQiLCJjZW50ZXJpbmdTcGFjZXJXaWR0aCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSW9uc0FuZENoYW5uZWxzTGVnZW5kUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVGhpcyBjbGFzcyBkaXNwbGF5cyBhIGxlZ2VuZCwgYS5rLmEuIGEga2V5LCBmb3IgYSBzZXQgb2YgaW9ucyBhbmQgbWVtYnJhbmVcclxuICogY2hhbm5lbHMuICBJdCBzaW1wbHkgZGlzcGxheXMgaW5mb3JtYXRpb24gYW5kIGRvZXNuJ3QgY29udHJvbCBhbnl0aGluZywgc29cclxuICogaXQgZG9lcyBub3QgaW5jbHVkZSBtdWNoIGluIHRoZSB3YXkgb2YgaW50ZXJhY3RpdmUgYmVoYXZpb3IuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICpAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgSFN0cnV0LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBuZXVyb24gZnJvbSAnLi4vLi4vLi4vbmV1cm9uLmpzJztcclxuaW1wb3J0IE5ldXJvblN0cmluZ3MgZnJvbSAnLi4vLi4vLi4vTmV1cm9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOZXVyb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05ldXJvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQb3Rhc3NpdW1HYXRlZENoYW5uZWwgZnJvbSAnLi4vLi4vbW9kZWwvUG90YXNzaXVtR2F0ZWRDaGFubmVsLmpzJztcclxuaW1wb3J0IFBvdGFzc2l1bUlvbiBmcm9tICcuLi8uLi9tb2RlbC9Qb3Rhc3NpdW1Jb24uanMnO1xyXG5pbXBvcnQgUG90YXNzaXVtTGVha2FnZUNoYW5uZWwgZnJvbSAnLi4vLi4vbW9kZWwvUG90YXNzaXVtTGVha2FnZUNoYW5uZWwuanMnO1xyXG5pbXBvcnQgU29kaXVtRHVhbEdhdGVkQ2hhbm5lbCBmcm9tICcuLi8uLi9tb2RlbC9Tb2RpdW1EdWFsR2F0ZWRDaGFubmVsLmpzJztcclxuaW1wb3J0IFNvZGl1bUlvbiBmcm9tICcuLi8uLi9tb2RlbC9Tb2RpdW1Jb24uanMnO1xyXG5pbXBvcnQgU29kaXVtTGVha2FnZUNoYW5uZWwgZnJvbSAnLi4vLi4vbW9kZWwvU29kaXVtTGVha2FnZUNoYW5uZWwuanMnO1xyXG5pbXBvcnQgTWVtYnJhbmVDaGFubmVsTm9kZSBmcm9tICcuLi9NZW1icmFuZUNoYW5uZWxOb2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlTm9kZSBmcm9tICcuLi9QYXJ0aWNsZU5vZGUuanMnO1xyXG5cclxuY29uc3QgbGVnZW5kU3RyaW5nID0gTmV1cm9uU3RyaW5ncy5sZWdlbmQ7XHJcbmNvbnN0IHBvdGFzc2l1bUdhdGVkQ2hhbm5lbFN0cmluZyA9IE5ldXJvblN0cmluZ3MucG90YXNzaXVtR2F0ZWRDaGFubmVsO1xyXG5jb25zdCBwb3Rhc3NpdW1Jb25TdHJpbmcgPSBOZXVyb25TdHJpbmdzLnBvdGFzc2l1bUlvbjtcclxuY29uc3QgcG90YXNzaXVtTGVha0NoYW5uZWxTdHJpbmcgPSBOZXVyb25TdHJpbmdzLnBvdGFzc2l1bUxlYWtDaGFubmVsO1xyXG5jb25zdCBzb2RpdW1HYXRlZENoYW5uZWxTdHJpbmcgPSBOZXVyb25TdHJpbmdzLnNvZGl1bUdhdGVkQ2hhbm5lbDtcclxuY29uc3Qgc29kaXVtSW9uU3RyaW5nID0gTmV1cm9uU3RyaW5ncy5zb2RpdW1Jb247XHJcbmNvbnN0IHNvZGl1bUxlYWtDaGFubmVsU3RyaW5nID0gTmV1cm9uU3RyaW5ncy5zb2RpdW1MZWFrQ2hhbm5lbDtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMRUdFTkRfVEVYVF9PUFRJT05TID0geyBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTIgfSApIH07XHJcbmNvbnN0IE1BWF9URVhUX1dJRFRIID0gMTQwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcblxyXG5jbGFzcyBJb25zQW5kQ2hhbm5lbHNMZWdlbmRQYW5lbCBleHRlbmRzIFBhbmVsIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7XHJcblxyXG4gICAgLy8gVGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtcyBiZWxvdyBhcmUgdXNlZCB0byBtYWtlIG5vZGVzIHRoYXQgdXN1YWxseVxyXG4gICAgLy8gcmVzaWRlIG9uIHRoZSBjYW52YXMgYmUgb2YgYW4gYXBwcm9wcmlhdGUgc2l6ZSBmb3IgaW5jbHVzaW9uIG9uIHRoZVxyXG4gICAgLy8gY29udHJvbCBwYW5lbC5cclxuICAgIGNvbnN0IFBBUlRJQ0xFX01WVCA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlUmVjdGFuZ2xlTWFwcGluZyhcclxuICAgICAgbmV3IEJvdW5kczIoIC0zLjAsIC0zLjAsIDIuMCwgMi4wICksIG5ldyBCb3VuZHMyKCAtOCwgLTgsIDE2LCAxNiApICk7XHJcblxyXG4gICAgY29uc3QgQ0hBTk5FTF9NVlQgPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nKCBWZWN0b3IyLlpFUk8sIFZlY3RvcjIuWkVSTywgNCApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgdGl0bGUgdG8gdGhlIGxpc3Qgb2YgY2hpbGRyZW4uXHJcbiAgICBjb25zdCBpbWFnZUFuZExhYmVsQ2hpbGRyZW4gPSBbXTtcclxuICAgIGltYWdlQW5kTGFiZWxDaGlsZHJlbi5wdXNoKCBzY2FsZUFuZEZpdFRleHRJdGVtKCBuZXcgVGV4dCggbGVnZW5kU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCgge1xyXG4gICAgICAgIHNpemU6IDE2LFxyXG4gICAgICAgIHdlaWdodDogJ2JvbGQnXHJcbiAgICAgIH0gKVxyXG4gICAgfSApICkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYWxsIG9mIHRoZSBpbWFnZSBpY29ucywgc2luY2Ugd2UgbmVlZCB0byBkbyBzb21lIGxheW91dCBjYWxjdWxhdGlvbnMgYmVmb3JlIGFkZGluZyB0aGVtIHRvIHRoZSBwYW5lbC5cclxuICAgIGNvbnN0IGljb25MaXN0ID0gW107XHJcbiAgICBjb25zdCBzb2RpdW1Jb25JbWFnZU5vZGUgPSBuZXcgUGFydGljbGVOb2RlKCBuZXcgU29kaXVtSW9uKCksIFBBUlRJQ0xFX01WVCApO1xyXG4gICAgaWNvbkxpc3QucHVzaCggc29kaXVtSW9uSW1hZ2VOb2RlICk7XHJcbiAgICBjb25zdCBwb3Rhc3NpdW1Jb25JbWFnZU5vZGUgPSBuZXcgUGFydGljbGVOb2RlKCBuZXcgUG90YXNzaXVtSW9uKCksIFBBUlRJQ0xFX01WVCApO1xyXG4gICAgaWNvbkxpc3QucHVzaCggcG90YXNzaXVtSW9uSW1hZ2VOb2RlICk7XHJcbiAgICBjb25zdCBzb2RpdW1EdWFsR2F0ZWRDaGFubmVsTm9kZSA9IG5ldyBNZW1icmFuZUNoYW5uZWxOb2RlKCBuZXcgU29kaXVtRHVhbEdhdGVkQ2hhbm5lbCgpLCBDSEFOTkVMX01WVCApO1xyXG4gICAgc29kaXVtRHVhbEdhdGVkQ2hhbm5lbE5vZGUucm90YXRlKCAtTWF0aC5QSSAvIDIgKTtcclxuICAgIGljb25MaXN0LnB1c2goIHNvZGl1bUR1YWxHYXRlZENoYW5uZWxOb2RlICk7XHJcbiAgICBjb25zdCBwb3Rhc3NpdW1HYXRlZENoYW5uZWxOb2RlID0gbmV3IE1lbWJyYW5lQ2hhbm5lbE5vZGUoIG5ldyBQb3Rhc3NpdW1HYXRlZENoYW5uZWwoKSwgQ0hBTk5FTF9NVlQgKTtcclxuICAgIHBvdGFzc2l1bUdhdGVkQ2hhbm5lbE5vZGUucm90YXRlKCAtTWF0aC5QSSAvIDIgKTtcclxuICAgIGljb25MaXN0LnB1c2goIHBvdGFzc2l1bUdhdGVkQ2hhbm5lbE5vZGUgKTtcclxuICAgIGNvbnN0IHNvZGl1bUxlYWthZ2VDaGFubmVsTm9kZSA9IG5ldyBNZW1icmFuZUNoYW5uZWxOb2RlKCBuZXcgU29kaXVtTGVha2FnZUNoYW5uZWwoKSwgQ0hBTk5FTF9NVlQgKTtcclxuICAgIHNvZGl1bUxlYWthZ2VDaGFubmVsTm9kZS5yb3RhdGUoIC1NYXRoLlBJIC8gMiApO1xyXG4gICAgaWNvbkxpc3QucHVzaCggc29kaXVtTGVha2FnZUNoYW5uZWxOb2RlICk7XHJcbiAgICBjb25zdCBwb3Rhc3NpdW1MZWFrYWdlQ2hhbm5lbE5vZGUgPSBuZXcgTWVtYnJhbmVDaGFubmVsTm9kZSggbmV3IFBvdGFzc2l1bUxlYWthZ2VDaGFubmVsKCksIENIQU5ORUxfTVZUICk7XHJcbiAgICBwb3Rhc3NpdW1MZWFrYWdlQ2hhbm5lbE5vZGUucm90YXRlKCAtTWF0aC5QSSAvIDIgKTtcclxuICAgIGljb25MaXN0LnB1c2goIHBvdGFzc2l1bUxlYWthZ2VDaGFubmVsTm9kZSApO1xyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgdGhlIG1heGltdW0gaWNvbiB3aWR0aC5cclxuICAgIGxldCBtYXhJY29uV2lkdGggPSAwO1xyXG4gICAgaWNvbkxpc3QuZm9yRWFjaCggaWNvbiA9PiB7XHJcbiAgICAgIG1heEljb25XaWR0aCA9IGljb24ud2lkdGggPiBtYXhJY29uV2lkdGggPyBpY29uLndpZHRoIDogbWF4SWNvbldpZHRoO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgaWNvbitjYXB0aW9uIG5vZGVzLlxyXG4gICAgaW1hZ2VBbmRMYWJlbENoaWxkcmVuLnB1c2goIGNyZWF0ZUljb25BbmRDYXB0aW9uTm9kZSggc29kaXVtSW9uSW1hZ2VOb2RlLCBtYXhJY29uV2lkdGgsIHNvZGl1bUlvblN0cmluZyApICk7XHJcbiAgICBpbWFnZUFuZExhYmVsQ2hpbGRyZW4ucHVzaCggY3JlYXRlSWNvbkFuZENhcHRpb25Ob2RlKCBwb3Rhc3NpdW1Jb25JbWFnZU5vZGUsIG1heEljb25XaWR0aCwgcG90YXNzaXVtSW9uU3RyaW5nICkgKTtcclxuICAgIGltYWdlQW5kTGFiZWxDaGlsZHJlbi5wdXNoKCBjcmVhdGVJY29uQW5kQ2FwdGlvbk5vZGUoIHNvZGl1bUR1YWxHYXRlZENoYW5uZWxOb2RlLCBtYXhJY29uV2lkdGgsIHNvZGl1bUdhdGVkQ2hhbm5lbFN0cmluZyApICk7XHJcbiAgICBpbWFnZUFuZExhYmVsQ2hpbGRyZW4ucHVzaCggY3JlYXRlSWNvbkFuZENhcHRpb25Ob2RlKCBwb3Rhc3NpdW1HYXRlZENoYW5uZWxOb2RlLCBtYXhJY29uV2lkdGgsIHBvdGFzc2l1bUdhdGVkQ2hhbm5lbFN0cmluZyApICk7XHJcbiAgICBpbWFnZUFuZExhYmVsQ2hpbGRyZW4ucHVzaCggY3JlYXRlSWNvbkFuZENhcHRpb25Ob2RlKCBzb2RpdW1MZWFrYWdlQ2hhbm5lbE5vZGUsIG1heEljb25XaWR0aCwgc29kaXVtTGVha0NoYW5uZWxTdHJpbmcgKSApO1xyXG4gICAgaW1hZ2VBbmRMYWJlbENoaWxkcmVuLnB1c2goIGNyZWF0ZUljb25BbmRDYXB0aW9uTm9kZSggcG90YXNzaXVtTGVha2FnZUNoYW5uZWxOb2RlLCBtYXhJY29uV2lkdGgsIHBvdGFzc2l1bUxlYWtDaGFubmVsU3RyaW5nICkgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGNoaWxkcmVuIHRvIGEgVkJveCBhbmQgcHV0IHRoYXQgb24gdGhlIHBhbmVsXHJcbiAgICBzdXBlciggbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IGltYWdlQW5kTGFiZWxDaGlsZHJlbixcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogNVxyXG4gICAgfSApLCB7XHJcbiAgICAgIC8vIHBhbmVsIG9wdGlvbnNcclxuICAgICAgZmlsbDogTmV1cm9uQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQkFDS0dST1VORCxcclxuICAgICAgc3Ryb2tlOiBOZXVyb25Db25zdGFudHMuQ09OVFJPTF9QQU5FTF9TVFJPS0UsXHJcbiAgICAgIHhNYXJnaW46IDgsXHJcbiAgICAgIHlNYXJnaW46IDEwXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBVdGlsaXR5IGZ1bmN0aW9uIHRvIHNjYWxlIGFuZCBmaXQgdGhlIHRleHQgbm9kZXMgd2l0aGluIHRoZSBwYW5lbCdzIGJvdW5kc1xyXG5mdW5jdGlvbiBzY2FsZUFuZEZpdFRleHRJdGVtKCB0ZXh0SXRlbU5vZGUgKSB7XHJcbiAgY29uc3QgdGV4dE5vZGVTY2FsZUZhY3RvciA9IE1hdGgubWluKCAxLCBNQVhfVEVYVF9XSURUSCAvIHRleHRJdGVtTm9kZS53aWR0aCApO1xyXG4gIHRleHRJdGVtTm9kZS5zY2FsZSggdGV4dE5vZGVTY2FsZUZhY3RvciApO1xyXG4gIHJldHVybiB0ZXh0SXRlbU5vZGU7XHJcbn1cclxuXHJcbi8vIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGljb24vY2FwdGlvbiBub2RlIGZvciBpbmNsdXNpb24gaW4gdGhlIGxlZ2VuZC5cclxuZnVuY3Rpb24gY3JlYXRlSWNvbkFuZENhcHRpb25Ob2RlKCBpY29uLCBtYXhJY29uV2lkdGgsIGNhcHRpb25UZXh0ICkge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIGljb24ud2lkdGggPD0gbWF4SWNvbldpZHRoLCAnbWF4SWNvbldpZHRoIGNhbm5vdCBiZSBsYXJnZXIgdGhhbiAnICk7XHJcbiAgY29uc3QgY2VudGVyaW5nU3BhY2VyV2lkdGggPSAoIG1heEljb25XaWR0aCAtIGljb24ud2lkdGggKSAvIDIgKyAwLjE7IC8vIFNwYWNpbmcgY2FuJ3QgYmUgemVybywgaGVuY2UgdGhlIGFkZGVyIGF0IHRoZSBlbmQuXHJcbiAgcmV0dXJuIG5ldyBIQm94KCB7XHJcbiAgICBzcGFjaW5nOiAwLFxyXG4gICAgY2hpbGRyZW46IFtcclxuICAgICAgbmV3IEhTdHJ1dCggY2VudGVyaW5nU3BhY2VyV2lkdGggKSxcclxuICAgICAgaWNvbixcclxuICAgICAgbmV3IEhTdHJ1dCggY2VudGVyaW5nU3BhY2VyV2lkdGggKyA4ICksIC8vIGFkZGVyIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgc2NhbGVBbmRGaXRUZXh0SXRlbSggbmV3IFRleHQoIGNhcHRpb25UZXh0LCBMRUdFTkRfVEVYVF9PUFRJT05TICkgKVxyXG4gICAgXVxyXG4gIH0gKTtcclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnSW9uc0FuZENoYW5uZWxzTGVnZW5kUGFuZWwnLCBJb25zQW5kQ2hhbm5lbHNMZWdlbmRQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBJb25zQW5kQ2hhbm5lbHNMZWdlbmRQYW5lbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLG1CQUFtQixNQUFNLDBEQUEwRDtBQUMxRixPQUFPQyxRQUFRLE1BQU0sNENBQTRDO0FBQ2pFLFNBQVNDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDL0UsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxPQUFPQyxNQUFNLE1BQU0sb0JBQW9CO0FBQ3ZDLE9BQU9DLGFBQWEsTUFBTSwyQkFBMkI7QUFDckQsT0FBT0MsZUFBZSxNQUFNLGlDQUFpQztBQUM3RCxPQUFPQyxxQkFBcUIsTUFBTSxzQ0FBc0M7QUFDeEUsT0FBT0MsWUFBWSxNQUFNLDZCQUE2QjtBQUN0RCxPQUFPQyx1QkFBdUIsTUFBTSx3Q0FBd0M7QUFDNUUsT0FBT0Msc0JBQXNCLE1BQU0sdUNBQXVDO0FBQzFFLE9BQU9DLFNBQVMsTUFBTSwwQkFBMEI7QUFDaEQsT0FBT0Msb0JBQW9CLE1BQU0scUNBQXFDO0FBQ3RFLE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUMzRCxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBRTdDLE1BQU1DLFlBQVksR0FBR1YsYUFBYSxDQUFDVyxNQUFNO0FBQ3pDLE1BQU1DLDJCQUEyQixHQUFHWixhQUFhLENBQUNhLHFCQUFxQjtBQUN2RSxNQUFNQyxrQkFBa0IsR0FBR2QsYUFBYSxDQUFDZSxZQUFZO0FBQ3JELE1BQU1DLDBCQUEwQixHQUFHaEIsYUFBYSxDQUFDaUIsb0JBQW9CO0FBQ3JFLE1BQU1DLHdCQUF3QixHQUFHbEIsYUFBYSxDQUFDbUIsa0JBQWtCO0FBQ2pFLE1B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