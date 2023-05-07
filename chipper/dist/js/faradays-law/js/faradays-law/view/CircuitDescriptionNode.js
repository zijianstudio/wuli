// Copyright 2018-2022, University of Colorado Boulder

/**
 *
 * Handles the logic of mapping the position of a Node (via its bounds) to a specified region in the sim. This map is
 * divided into 9 evenly divided regions.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 */

// modules
import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import MagnetDescriber from './MagnetDescriber.js';

// strings
const lightBulbCircuitLabelString = FaradaysLawStrings.a11y.lightBulbCircuitLabel;
const lightBulbString = FaradaysLawStrings.a11y.lightBulb;
const inTheCircuitString = FaradaysLawStrings.a11y.inTheCircuit;
const fourLoopCoilString = FaradaysLawStrings.a11y.fourLoopCoil;
const twoLoopCoilString = FaradaysLawStrings.a11y.twoLoopCoil;
const voltmeterString = FaradaysLawStrings.a11y.voltmeter;
class CircuitDescriptionNode extends Node {
  /**
   * @param {FaradaysLawModel} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    options = merge({
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: lightBulbCircuitLabelString
    }, options);
    super(options);
    const dynamicChildrenNode = new Node();
    this.addChild(dynamicChildrenNode);
    const fourCoilOnlyNode = new Node({
      tagName: 'p',
      innerContent: ''
    });
    const otherComponentsNode = new Node({
      tagName: 'ul',
      labelContent: inTheCircuitString,
      appendDescription: true
    });
    model.topCoilVisibleProperty.link(showTopCoil => {
      otherComponentsNode.descriptionContent = MagnetDescriber.getCoilDescription(showTopCoil);
    });
    model.voltmeterVisibleProperty.link(showVoltmeter => {
      fourCoilOnlyNode.innerContent = MagnetDescriber.getFourCoilOnlyDescription(showVoltmeter);
    });
    const lightBulbItem = createListItemNode(lightBulbString);
    const fourLoopItem = createListItemNode(fourLoopCoilString);
    const twoLoopItem = createListItemNode(twoLoopCoilString);
    const voltmeterItem = createListItemNode(voltmeterString);
    Multilink.multilink([model.topCoilVisibleProperty, model.voltmeterVisibleProperty], (showTopCoil, showVoltmeter) => {
      if (!showTopCoil) {
        dynamicChildrenNode.children = [fourCoilOnlyNode];
      } else {
        const children = [lightBulbItem];
        children.push(fourLoopItem);
        showTopCoil && children.push(twoLoopItem);
        showVoltmeter && children.push(voltmeterItem);
        otherComponentsNode.children = children;
        dynamicChildrenNode.children = [otherComponentsNode];
      }
    });
  }
}
function createListItemNode(innerContent) {
  return new Node({
    tagName: 'li',
    innerContent: innerContent
  });
}
faradaysLaw.register('CircuitDescriptionNode', CircuitDescriptionNode);
export default CircuitDescriptionNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJtZXJnZSIsIk5vZGUiLCJmYXJhZGF5c0xhdyIsIkZhcmFkYXlzTGF3U3RyaW5ncyIsIk1hZ25ldERlc2NyaWJlciIsImxpZ2h0QnVsYkNpcmN1aXRMYWJlbFN0cmluZyIsImExMXkiLCJsaWdodEJ1bGJDaXJjdWl0TGFiZWwiLCJsaWdodEJ1bGJTdHJpbmciLCJsaWdodEJ1bGIiLCJpblRoZUNpcmN1aXRTdHJpbmciLCJpblRoZUNpcmN1aXQiLCJmb3VyTG9vcENvaWxTdHJpbmciLCJmb3VyTG9vcENvaWwiLCJ0d29Mb29wQ29pbFN0cmluZyIsInR3b0xvb3BDb2lsIiwidm9sdG1ldGVyU3RyaW5nIiwidm9sdG1ldGVyIiwiQ2lyY3VpdERlc2NyaXB0aW9uTm9kZSIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJvcHRpb25zIiwidGFnTmFtZSIsImxhYmVsVGFnTmFtZSIsImxhYmVsQ29udGVudCIsImR5bmFtaWNDaGlsZHJlbk5vZGUiLCJhZGRDaGlsZCIsImZvdXJDb2lsT25seU5vZGUiLCJpbm5lckNvbnRlbnQiLCJvdGhlckNvbXBvbmVudHNOb2RlIiwiYXBwZW5kRGVzY3JpcHRpb24iLCJ0b3BDb2lsVmlzaWJsZVByb3BlcnR5IiwibGluayIsInNob3dUb3BDb2lsIiwiZGVzY3JpcHRpb25Db250ZW50IiwiZ2V0Q29pbERlc2NyaXB0aW9uIiwidm9sdG1ldGVyVmlzaWJsZVByb3BlcnR5Iiwic2hvd1ZvbHRtZXRlciIsImdldEZvdXJDb2lsT25seURlc2NyaXB0aW9uIiwibGlnaHRCdWxiSXRlbSIsImNyZWF0ZUxpc3RJdGVtTm9kZSIsImZvdXJMb29wSXRlbSIsInR3b0xvb3BJdGVtIiwidm9sdG1ldGVySXRlbSIsIm11bHRpbGluayIsImNoaWxkcmVuIiwicHVzaCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2lyY3VpdERlc2NyaXB0aW9uTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKlxyXG4gKiBIYW5kbGVzIHRoZSBsb2dpYyBvZiBtYXBwaW5nIHRoZSBwb3NpdGlvbiBvZiBhIE5vZGUgKHZpYSBpdHMgYm91bmRzKSB0byBhIHNwZWNpZmllZCByZWdpb24gaW4gdGhlIHNpbS4gVGhpcyBtYXAgaXNcclxuICogZGl2aWRlZCBpbnRvIDkgZXZlbmx5IGRpdmlkZWQgcmVnaW9ucy5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvdyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG4vLyBtb2R1bGVzXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmYXJhZGF5c0xhdyBmcm9tICcuLi8uLi9mYXJhZGF5c0xhdy5qcyc7XHJcbmltcG9ydCBGYXJhZGF5c0xhd1N0cmluZ3MgZnJvbSAnLi4vLi4vRmFyYWRheXNMYXdTdHJpbmdzLmpzJztcclxuaW1wb3J0IE1hZ25ldERlc2NyaWJlciBmcm9tICcuL01hZ25ldERlc2NyaWJlci5qcyc7XHJcblxyXG4vLyBzdHJpbmdzXHJcbmNvbnN0IGxpZ2h0QnVsYkNpcmN1aXRMYWJlbFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmxpZ2h0QnVsYkNpcmN1aXRMYWJlbDtcclxuY29uc3QgbGlnaHRCdWxiU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkubGlnaHRCdWxiO1xyXG5jb25zdCBpblRoZUNpcmN1aXRTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5pblRoZUNpcmN1aXQ7XHJcbmNvbnN0IGZvdXJMb29wQ29pbFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmZvdXJMb29wQ29pbDtcclxuY29uc3QgdHdvTG9vcENvaWxTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS50d29Mb29wQ29pbDtcclxuY29uc3Qgdm9sdG1ldGVyU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkudm9sdG1ldGVyO1xyXG5cclxuY2xhc3MgQ2lyY3VpdERlc2NyaXB0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZhcmFkYXlzTGF3TW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2gzJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBsaWdodEJ1bGJDaXJjdWl0TGFiZWxTdHJpbmdcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGR5bmFtaWNDaGlsZHJlbk5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZHluYW1pY0NoaWxkcmVuTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IGZvdXJDb2lsT25seU5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICB0YWdOYW1lOiAncCcsXHJcbiAgICAgIGlubmVyQ29udGVudDogJydcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBvdGhlckNvbXBvbmVudHNOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFnTmFtZTogJ3VsJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBpblRoZUNpcmN1aXRTdHJpbmcsXHJcbiAgICAgIGFwcGVuZERlc2NyaXB0aW9uOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwudG9wQ29pbFZpc2libGVQcm9wZXJ0eS5saW5rKCBzaG93VG9wQ29pbCA9PiB7XHJcbiAgICAgIG90aGVyQ29tcG9uZW50c05vZGUuZGVzY3JpcHRpb25Db250ZW50ID0gTWFnbmV0RGVzY3JpYmVyLmdldENvaWxEZXNjcmlwdGlvbiggc2hvd1RvcENvaWwgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkubGluayggc2hvd1ZvbHRtZXRlciA9PiB7XHJcbiAgICAgIGZvdXJDb2lsT25seU5vZGUuaW5uZXJDb250ZW50ID0gTWFnbmV0RGVzY3JpYmVyLmdldEZvdXJDb2lsT25seURlc2NyaXB0aW9uKCBzaG93Vm9sdG1ldGVyICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGlnaHRCdWxiSXRlbSA9IGNyZWF0ZUxpc3RJdGVtTm9kZSggbGlnaHRCdWxiU3RyaW5nICk7XHJcbiAgICBjb25zdCBmb3VyTG9vcEl0ZW0gPSBjcmVhdGVMaXN0SXRlbU5vZGUoIGZvdXJMb29wQ29pbFN0cmluZyApO1xyXG4gICAgY29uc3QgdHdvTG9vcEl0ZW0gPSBjcmVhdGVMaXN0SXRlbU5vZGUoIHR3b0xvb3BDb2lsU3RyaW5nICk7XHJcbiAgICBjb25zdCB2b2x0bWV0ZXJJdGVtID0gY3JlYXRlTGlzdEl0ZW1Ob2RlKCB2b2x0bWV0ZXJTdHJpbmcgKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIG1vZGVsLnRvcENvaWxWaXNpYmxlUHJvcGVydHksIG1vZGVsLnZvbHRtZXRlclZpc2libGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHNob3dUb3BDb2lsLCBzaG93Vm9sdG1ldGVyICkgPT4ge1xyXG4gICAgICAgIGlmICggIXNob3dUb3BDb2lsICkge1xyXG4gICAgICAgICAgZHluYW1pY0NoaWxkcmVuTm9kZS5jaGlsZHJlbiA9IFsgZm91ckNvaWxPbmx5Tm9kZSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gWyBsaWdodEJ1bGJJdGVtIF07XHJcbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKCBmb3VyTG9vcEl0ZW0gKTtcclxuICAgICAgICAgIHNob3dUb3BDb2lsICYmIGNoaWxkcmVuLnB1c2goIHR3b0xvb3BJdGVtICk7XHJcbiAgICAgICAgICBzaG93Vm9sdG1ldGVyICYmIGNoaWxkcmVuLnB1c2goIHZvbHRtZXRlckl0ZW0gKTtcclxuICAgICAgICAgIG90aGVyQ29tcG9uZW50c05vZGUuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgICAgIGR5bmFtaWNDaGlsZHJlbk5vZGUuY2hpbGRyZW4gPSBbIG90aGVyQ29tcG9uZW50c05vZGUgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVMaXN0SXRlbU5vZGUoIGlubmVyQ29udGVudCApIHtcclxuICByZXR1cm4gbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJywgaW5uZXJDb250ZW50OiBpbm5lckNvbnRlbnQgfSApO1xyXG59XHJcblxyXG5mYXJhZGF5c0xhdy5yZWdpc3RlciggJ0NpcmN1aXREZXNjcmlwdGlvbk5vZGUnLCBDaXJjdWl0RGVzY3JpcHRpb25Ob2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IENpcmN1aXREZXNjcmlwdGlvbk5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGVBQWUs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