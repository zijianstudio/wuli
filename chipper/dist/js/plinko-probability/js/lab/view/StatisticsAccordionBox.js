// Copyright 2014-2022, University of Colorado Boulder

/**
 * Accordion Box that displays statistics associated with the histogram in Plinko Probability Simulation lab tab
 *
 * @author Martin Veillette (Berea College)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import merge from '../../../../phet-core/js/merge.js';
import { HBox, Text, VBox } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import PlinkoProbabilityConstants from '../../common/PlinkoProbabilityConstants.js';
import EquationNode from '../../common/view/EquationNode.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityStrings from '../../PlinkoProbabilityStrings.js';
import HistogramIcon from './HistogramIcon.js';
const idealString = PlinkoProbabilityStrings.ideal;
const muString = PlinkoProbabilityStrings.mu;
const nString = PlinkoProbabilityStrings.n;
const sigmaString = PlinkoProbabilityStrings.sigma;
const sMeanString = PlinkoProbabilityStrings.sMean;
const sString = PlinkoProbabilityStrings.s;
const xBarString = PlinkoProbabilityStrings.xBar;

// constants
const CONTENT_Y_SPACING = 10; // vertical spacing of elements in the accordion box's content

// options for the title of the panel
const OPTIONS_TITLE = {
  leftHandSideFont: PlinkoProbabilityConstants.TEXT_FONT_BOLD,
  leftHandSideFill: PlinkoProbabilityConstants.SAMPLE_FONT_COLOR,
  rightHandSideFont: PlinkoProbabilityConstants.TEXT_FONT_BOLD,
  rightHandSideFill: PlinkoProbabilityConstants.SAMPLE_FONT_COLOR,
  maxDecimalPlaces: 0
};

// options for sample statistics
const OPTIONS_SAMPLE = {
  leftHandSideFont: PlinkoProbabilityConstants.TEXT_FONT,
  leftHandSideFill: PlinkoProbabilityConstants.SAMPLE_FONT_COLOR,
  rightHandSideFont: PlinkoProbabilityConstants.TEXT_FONT,
  rightHandSideFill: PlinkoProbabilityConstants.SAMPLE_FONT_COLOR
};

// options for the theoretical statistics
const OPTIONS_THEORETICAL = {
  leftHandSideFont: PlinkoProbabilityConstants.TEXT_FONT,
  leftHandSideFill: PlinkoProbabilityConstants.THEORETICAL_FONT_COLOR,
  rightHandSideFont: PlinkoProbabilityConstants.TEXT_FONT,
  rightHandSideFill: PlinkoProbabilityConstants.THEORETICAL_FONT_COLOR
};
class StatisticsAccordionBox extends AccordionBox {
  /**
   * @param {LabModel} model
   * @param {Property.<boolean>} isTheoreticalHistogramVisibleProperty
   * @param {Object} [options]
   */
  constructor(model, isTheoreticalHistogramVisibleProperty, options) {
    const numberLandedBallsText = new EquationNode(nString, 0, OPTIONS_TITLE);
    options = merge({
      fill: PlinkoProbabilityConstants.PANEL_BACKGROUND_COLOR,
      cornerRadius: 10,
      // title
      titleNode: numberLandedBallsText,
      titleAlignX: 'left',
      titleXMargin: 5,
      // expand/collapse button
      buttonAlign: 'right',
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 20,
        touchAreaXDilation: 10,
        touchAreaYDilation: 10
      },
      // content
      contentXMargin: 8,
      contentYMargin: 10
    }, options);

    // create the EquationNode(s) that will populate the panel
    const sampleAverageText = new EquationNode(xBarString, 0, OPTIONS_SAMPLE);
    const sampleStandardDeviationText = new EquationNode(sString, 0, OPTIONS_SAMPLE);
    const sampleStandardDeviationOfMeanText = new EquationNode(sMeanString, 0, OPTIONS_SAMPLE);
    const theoreticalAverageText = new EquationNode(muString, 0, OPTIONS_THEORETICAL);
    const theoreticalStandardDeviationText = new EquationNode(sigmaString, 0, OPTIONS_THEORETICAL);

    // link is present for the life of the simulation, no need to dispose
    Multilink.multilink([model.numberOfRowsProperty, model.probabilityProperty], (numberOfRows, probability) => {
      assert && assert(Number.isInteger(numberOfRows), 'the number of rows must be an integer');
      theoreticalAverageText.setRightHandSideOfEquation(model.getTheoreticalAverage(numberOfRows, probability));
      theoreticalStandardDeviationText.setRightHandSideOfEquation(model.getTheoreticalStandardDeviation(numberOfRows, probability));
    });

    // update the statistics display after a ball landed in the bins.
    // no need to remove Listener, present for the lifetime of the simulation
    model.histogram.histogramUpdatedEmitter.addListener(() => {
      numberLandedBallsText.setRightHandSideOfEquation(model.histogram.landedBallsNumber);
      sampleAverageText.setRightHandSideOfEquation(model.histogram.average);
      sampleStandardDeviationText.setRightHandSideOfEquation(model.histogram.standardDeviation);
      sampleStandardDeviationOfMeanText.setRightHandSideOfEquation(model.histogram.standardDeviationOfMean);
    });

    // create the histogram icon with the text underneath it.
    const histogramIcon = new HistogramIcon();
    const histogramCheckboxIcon = new VBox({
      align: 'center',
      spacing: 5,
      children: [histogramIcon, new Text(idealString, {
        font: PlinkoProbabilityConstants.PANEL_READOUT_FONT,
        maxWidth: 1.5 * histogramIcon.width // i18n, determined empirically
      })]
    });

    const histogramCheckbox = new Checkbox(isTheoreticalHistogramVisibleProperty, histogramCheckboxIcon);
    const contentNode = new HBox({
      spacing: 5,
      align: 'top',
      children: [
      // left side of the accordion box
      new VBox({
        align: 'right',
        spacing: CONTENT_Y_SPACING,
        children: [sampleAverageText, sampleStandardDeviationText, sampleStandardDeviationOfMeanText]
      }),
      // right side of the accordion box
      new VBox({
        align: 'right',
        spacing: CONTENT_Y_SPACING,
        children: [theoreticalAverageText, theoreticalStandardDeviationText, histogramCheckbox]
      })]
    });
    super(contentNode, options);
  }
}
plinkoProbability.register('StatisticsAccordionBox', StatisticsAccordionBox);
export default StatisticsAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJtZXJnZSIsIkhCb3giLCJUZXh0IiwiVkJveCIsIkFjY29yZGlvbkJveCIsIkNoZWNrYm94IiwiUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMiLCJFcXVhdGlvbk5vZGUiLCJwbGlua29Qcm9iYWJpbGl0eSIsIlBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncyIsIkhpc3RvZ3JhbUljb24iLCJpZGVhbFN0cmluZyIsImlkZWFsIiwibXVTdHJpbmciLCJtdSIsIm5TdHJpbmciLCJuIiwic2lnbWFTdHJpbmciLCJzaWdtYSIsInNNZWFuU3RyaW5nIiwic01lYW4iLCJzU3RyaW5nIiwicyIsInhCYXJTdHJpbmciLCJ4QmFyIiwiQ09OVEVOVF9ZX1NQQUNJTkciLCJPUFRJT05TX1RJVExFIiwibGVmdEhhbmRTaWRlRm9udCIsIlRFWFRfRk9OVF9CT0xEIiwibGVmdEhhbmRTaWRlRmlsbCIsIlNBTVBMRV9GT05UX0NPTE9SIiwicmlnaHRIYW5kU2lkZUZvbnQiLCJyaWdodEhhbmRTaWRlRmlsbCIsIm1heERlY2ltYWxQbGFjZXMiLCJPUFRJT05TX1NBTVBMRSIsIlRFWFRfRk9OVCIsIk9QVElPTlNfVEhFT1JFVElDQUwiLCJUSEVPUkVUSUNBTF9GT05UX0NPTE9SIiwiU3RhdGlzdGljc0FjY29yZGlvbkJveCIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJpc1RoZW9yZXRpY2FsSGlzdG9ncmFtVmlzaWJsZVByb3BlcnR5Iiwib3B0aW9ucyIsIm51bWJlckxhbmRlZEJhbGxzVGV4dCIsImZpbGwiLCJQQU5FTF9CQUNLR1JPVU5EX0NPTE9SIiwiY29ybmVyUmFkaXVzIiwidGl0bGVOb2RlIiwidGl0bGVBbGlnblgiLCJ0aXRsZVhNYXJnaW4iLCJidXR0b25BbGlnbiIsImJ1dHRvblhNYXJnaW4iLCJidXR0b25ZTWFyZ2luIiwiZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zIiwic2lkZUxlbmd0aCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNvbnRlbnRYTWFyZ2luIiwiY29udGVudFlNYXJnaW4iLCJzYW1wbGVBdmVyYWdlVGV4dCIsInNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uVGV4dCIsInNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuVGV4dCIsInRoZW9yZXRpY2FsQXZlcmFnZVRleHQiLCJ0aGVvcmV0aWNhbFN0YW5kYXJkRGV2aWF0aW9uVGV4dCIsIm11bHRpbGluayIsIm51bWJlck9mUm93c1Byb3BlcnR5IiwicHJvYmFiaWxpdHlQcm9wZXJ0eSIsIm51bWJlck9mUm93cyIsInByb2JhYmlsaXR5IiwiYXNzZXJ0IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwic2V0UmlnaHRIYW5kU2lkZU9mRXF1YXRpb24iLCJnZXRUaGVvcmV0aWNhbEF2ZXJhZ2UiLCJnZXRUaGVvcmV0aWNhbFN0YW5kYXJkRGV2aWF0aW9uIiwiaGlzdG9ncmFtIiwiaGlzdG9ncmFtVXBkYXRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImxhbmRlZEJhbGxzTnVtYmVyIiwiYXZlcmFnZSIsInN0YW5kYXJkRGV2aWF0aW9uIiwic3RhbmRhcmREZXZpYXRpb25PZk1lYW4iLCJoaXN0b2dyYW1JY29uIiwiaGlzdG9ncmFtQ2hlY2tib3hJY29uIiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJmb250IiwiUEFORUxfUkVBRE9VVF9GT05UIiwibWF4V2lkdGgiLCJ3aWR0aCIsImhpc3RvZ3JhbUNoZWNrYm94IiwiY29udGVudE5vZGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YXRpc3RpY3NBY2NvcmRpb25Cb3guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWNjb3JkaW9uIEJveCB0aGF0IGRpc3BsYXlzIHN0YXRpc3RpY3MgYXNzb2NpYXRlZCB3aXRoIHRoZSBoaXN0b2dyYW0gaW4gUGxpbmtvIFByb2JhYmlsaXR5IFNpbXVsYXRpb24gbGFiIHRhYlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFjY29yZGlvbkJveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRXF1YXRpb25Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VxdWF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBwbGlua29Qcm9iYWJpbGl0eSBmcm9tICcuLi8uLi9wbGlua29Qcm9iYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3MgZnJvbSAnLi4vLi4vUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzLmpzJztcclxuaW1wb3J0IEhpc3RvZ3JhbUljb24gZnJvbSAnLi9IaXN0b2dyYW1JY29uLmpzJztcclxuXHJcbmNvbnN0IGlkZWFsU3RyaW5nID0gUGxpbmtvUHJvYmFiaWxpdHlTdHJpbmdzLmlkZWFsO1xyXG5jb25zdCBtdVN0cmluZyA9IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy5tdTtcclxuY29uc3QgblN0cmluZyA9IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy5uO1xyXG5jb25zdCBzaWdtYVN0cmluZyA9IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy5zaWdtYTtcclxuY29uc3Qgc01lYW5TdHJpbmcgPSBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3Muc01lYW47XHJcbmNvbnN0IHNTdHJpbmcgPSBQbGlua29Qcm9iYWJpbGl0eVN0cmluZ3MucztcclxuY29uc3QgeEJhclN0cmluZyA9IFBsaW5rb1Byb2JhYmlsaXR5U3RyaW5ncy54QmFyO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENPTlRFTlRfWV9TUEFDSU5HID0gMTA7IC8vIHZlcnRpY2FsIHNwYWNpbmcgb2YgZWxlbWVudHMgaW4gdGhlIGFjY29yZGlvbiBib3gncyBjb250ZW50XHJcblxyXG4vLyBvcHRpb25zIGZvciB0aGUgdGl0bGUgb2YgdGhlIHBhbmVsXHJcbmNvbnN0IE9QVElPTlNfVElUTEUgPSB7XHJcbiAgbGVmdEhhbmRTaWRlRm9udDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuVEVYVF9GT05UX0JPTEQsXHJcbiAgbGVmdEhhbmRTaWRlRmlsbDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuU0FNUExFX0ZPTlRfQ09MT1IsXHJcbiAgcmlnaHRIYW5kU2lkZUZvbnQ6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlRFWFRfRk9OVF9CT0xELFxyXG4gIHJpZ2h0SGFuZFNpZGVGaWxsOiBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5TQU1QTEVfRk9OVF9DT0xPUixcclxuICBtYXhEZWNpbWFsUGxhY2VzOiAwXHJcbn07XHJcblxyXG4vLyBvcHRpb25zIGZvciBzYW1wbGUgc3RhdGlzdGljc1xyXG5jb25zdCBPUFRJT05TX1NBTVBMRSA9IHtcclxuICBsZWZ0SGFuZFNpZGVGb250OiBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5URVhUX0ZPTlQsXHJcbiAgbGVmdEhhbmRTaWRlRmlsbDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuU0FNUExFX0ZPTlRfQ09MT1IsXHJcbiAgcmlnaHRIYW5kU2lkZUZvbnQ6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlRFWFRfRk9OVCxcclxuICByaWdodEhhbmRTaWRlRmlsbDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuU0FNUExFX0ZPTlRfQ09MT1JcclxufTtcclxuXHJcbi8vIG9wdGlvbnMgZm9yIHRoZSB0aGVvcmV0aWNhbCBzdGF0aXN0aWNzXHJcbmNvbnN0IE9QVElPTlNfVEhFT1JFVElDQUwgPSB7XHJcbiAgbGVmdEhhbmRTaWRlRm9udDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuVEVYVF9GT05ULFxyXG4gIGxlZnRIYW5kU2lkZUZpbGw6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlRIRU9SRVRJQ0FMX0ZPTlRfQ09MT1IsXHJcbiAgcmlnaHRIYW5kU2lkZUZvbnQ6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlRFWFRfRk9OVCxcclxuICByaWdodEhhbmRTaWRlRmlsbDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuVEhFT1JFVElDQUxfRk9OVF9DT0xPUlxyXG59O1xyXG5cclxuY2xhc3MgU3RhdGlzdGljc0FjY29yZGlvbkJveCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TGFiTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBpc1RoZW9yZXRpY2FsSGlzdG9ncmFtVmlzaWJsZVByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG51bWJlckxhbmRlZEJhbGxzVGV4dCA9IG5ldyBFcXVhdGlvbk5vZGUoIG5TdHJpbmcsIDAsIE9QVElPTlNfVElUTEUgKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIGZpbGw6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLlBBTkVMX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgIGNvcm5lclJhZGl1czogMTAsXHJcblxyXG4gICAgICAvLyB0aXRsZVxyXG4gICAgICB0aXRsZU5vZGU6IG51bWJlckxhbmRlZEJhbGxzVGV4dCxcclxuICAgICAgdGl0bGVBbGlnblg6ICdsZWZ0JyxcclxuICAgICAgdGl0bGVYTWFyZ2luOiA1LFxyXG5cclxuICAgICAgLy8gZXhwYW5kL2NvbGxhcHNlIGJ1dHRvblxyXG4gICAgICBidXR0b25BbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgYnV0dG9uWE1hcmdpbjogMTAsXHJcbiAgICAgIGJ1dHRvbllNYXJnaW46IDEwLFxyXG4gICAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBzaWRlTGVuZ3RoOiAyMCxcclxuICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMTBcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIGNvbnRlbnRcclxuICAgICAgY29udGVudFhNYXJnaW46IDgsXHJcbiAgICAgIGNvbnRlbnRZTWFyZ2luOiAxMFxyXG5cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIEVxdWF0aW9uTm9kZShzKSB0aGF0IHdpbGwgcG9wdWxhdGUgdGhlIHBhbmVsXHJcbiAgICBjb25zdCBzYW1wbGVBdmVyYWdlVGV4dCA9IG5ldyBFcXVhdGlvbk5vZGUoIHhCYXJTdHJpbmcsIDAsIE9QVElPTlNfU0FNUExFICk7XHJcbiAgICBjb25zdCBzYW1wbGVTdGFuZGFyZERldmlhdGlvblRleHQgPSBuZXcgRXF1YXRpb25Ob2RlKCBzU3RyaW5nLCAwLCBPUFRJT05TX1NBTVBMRSApO1xyXG4gICAgY29uc3Qgc2FtcGxlU3RhbmRhcmREZXZpYXRpb25PZk1lYW5UZXh0ID0gbmV3IEVxdWF0aW9uTm9kZSggc01lYW5TdHJpbmcsIDAsIE9QVElPTlNfU0FNUExFICk7XHJcbiAgICBjb25zdCB0aGVvcmV0aWNhbEF2ZXJhZ2VUZXh0ID0gbmV3IEVxdWF0aW9uTm9kZSggbXVTdHJpbmcsIDAsIE9QVElPTlNfVEhFT1JFVElDQUwgKTtcclxuICAgIGNvbnN0IHRoZW9yZXRpY2FsU3RhbmRhcmREZXZpYXRpb25UZXh0ID0gbmV3IEVxdWF0aW9uTm9kZSggc2lnbWFTdHJpbmcsIDAsIE9QVElPTlNfVEhFT1JFVElDQUwgKTtcclxuXHJcbiAgICAvLyBsaW5rIGlzIHByZXNlbnQgZm9yIHRoZSBsaWZlIG9mIHRoZSBzaW11bGF0aW9uLCBubyBuZWVkIHRvIGRpc3Bvc2VcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgbW9kZWwubnVtYmVyT2ZSb3dzUHJvcGVydHksIG1vZGVsLnByb2JhYmlsaXR5UHJvcGVydHkgXSxcclxuICAgICAgKCBudW1iZXJPZlJvd3MsIHByb2JhYmlsaXR5ICkgPT4ge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG51bWJlck9mUm93cyApLCAndGhlIG51bWJlciBvZiByb3dzIG11c3QgYmUgYW4gaW50ZWdlcicgKTtcclxuICAgICAgICB0aGVvcmV0aWNhbEF2ZXJhZ2VUZXh0LnNldFJpZ2h0SGFuZFNpZGVPZkVxdWF0aW9uKCBtb2RlbC5nZXRUaGVvcmV0aWNhbEF2ZXJhZ2UoIG51bWJlck9mUm93cywgcHJvYmFiaWxpdHkgKSApO1xyXG4gICAgICAgIHRoZW9yZXRpY2FsU3RhbmRhcmREZXZpYXRpb25UZXh0LnNldFJpZ2h0SGFuZFNpZGVPZkVxdWF0aW9uKCBtb2RlbC5nZXRUaGVvcmV0aWNhbFN0YW5kYXJkRGV2aWF0aW9uKCBudW1iZXJPZlJvd3MsIHByb2JhYmlsaXR5ICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgc3RhdGlzdGljcyBkaXNwbGF5IGFmdGVyIGEgYmFsbCBsYW5kZWQgaW4gdGhlIGJpbnMuXHJcbiAgICAvLyBubyBuZWVkIHRvIHJlbW92ZSBMaXN0ZW5lciwgcHJlc2VudCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICBtb2RlbC5oaXN0b2dyYW0uaGlzdG9ncmFtVXBkYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgbnVtYmVyTGFuZGVkQmFsbHNUZXh0LnNldFJpZ2h0SGFuZFNpZGVPZkVxdWF0aW9uKCBtb2RlbC5oaXN0b2dyYW0ubGFuZGVkQmFsbHNOdW1iZXIgKTtcclxuICAgICAgc2FtcGxlQXZlcmFnZVRleHQuc2V0UmlnaHRIYW5kU2lkZU9mRXF1YXRpb24oIG1vZGVsLmhpc3RvZ3JhbS5hdmVyYWdlICk7XHJcbiAgICAgIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uVGV4dC5zZXRSaWdodEhhbmRTaWRlT2ZFcXVhdGlvbiggbW9kZWwuaGlzdG9ncmFtLnN0YW5kYXJkRGV2aWF0aW9uICk7XHJcbiAgICAgIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuVGV4dC5zZXRSaWdodEhhbmRTaWRlT2ZFcXVhdGlvbiggbW9kZWwuaGlzdG9ncmFtLnN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBoaXN0b2dyYW0gaWNvbiB3aXRoIHRoZSB0ZXh0IHVuZGVybmVhdGggaXQuXHJcbiAgICBjb25zdCBoaXN0b2dyYW1JY29uID0gbmV3IEhpc3RvZ3JhbUljb24oKTtcclxuICAgIGNvbnN0IGhpc3RvZ3JhbUNoZWNrYm94SWNvbiA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBoaXN0b2dyYW1JY29uLFxyXG4gICAgICAgIG5ldyBUZXh0KCBpZGVhbFN0cmluZywge1xyXG4gICAgICAgICAgZm9udDogUGxpbmtvUHJvYmFiaWxpdHlDb25zdGFudHMuUEFORUxfUkVBRE9VVF9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDEuNSAqIGhpc3RvZ3JhbUljb24ud2lkdGggLy8gaTE4biwgZGV0ZXJtaW5lZCBlbXBpcmljYWxseVxyXG4gICAgICAgIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaGlzdG9ncmFtQ2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIGlzVGhlb3JldGljYWxIaXN0b2dyYW1WaXNpYmxlUHJvcGVydHksIGhpc3RvZ3JhbUNoZWNrYm94SWNvbiApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRlbnROb2RlID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgYWxpZ246ICd0b3AnLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG5cclxuICAgICAgICAvLyBsZWZ0IHNpZGUgb2YgdGhlIGFjY29yZGlvbiBib3hcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgYWxpZ246ICdyaWdodCcsXHJcbiAgICAgICAgICBzcGFjaW5nOiBDT05URU5UX1lfU1BBQ0lORyxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIHNhbXBsZUF2ZXJhZ2VUZXh0LFxyXG4gICAgICAgICAgICBzYW1wbGVTdGFuZGFyZERldmlhdGlvblRleHQsXHJcbiAgICAgICAgICAgIHNhbXBsZVN0YW5kYXJkRGV2aWF0aW9uT2ZNZWFuVGV4dFxyXG4gICAgICAgICAgXVxyXG4gICAgICAgIH0gKSxcclxuXHJcbiAgICAgICAgLy8gcmlnaHQgc2lkZSBvZiB0aGUgYWNjb3JkaW9uIGJveFxyXG4gICAgICAgIG5ldyBWQm94KCB7XHJcbiAgICAgICAgICBhbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgICAgIHNwYWNpbmc6IENPTlRFTlRfWV9TUEFDSU5HLFxyXG4gICAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgICAgdGhlb3JldGljYWxBdmVyYWdlVGV4dCxcclxuICAgICAgICAgICAgdGhlb3JldGljYWxTdGFuZGFyZERldmlhdGlvblRleHQsXHJcbiAgICAgICAgICAgIGhpc3RvZ3JhbUNoZWNrYm94XHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggY29udGVudE5vZGUsIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbnBsaW5rb1Byb2JhYmlsaXR5LnJlZ2lzdGVyKCAnU3RhdGlzdGljc0FjY29yZGlvbkJveCcsIFN0YXRpc3RpY3NBY2NvcmRpb25Cb3ggKTtcclxuZXhwb3J0IGRlZmF1bHQgU3RhdGlzdGljc0FjY29yZGlvbkJveDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BFLE9BQU9DLFlBQVksTUFBTSxvQ0FBb0M7QUFDN0QsT0FBT0MsUUFBUSxNQUFNLGdDQUFnQztBQUNyRCxPQUFPQywwQkFBMEIsTUFBTSw0Q0FBNEM7QUFDbkYsT0FBT0MsWUFBWSxNQUFNLG1DQUFtQztBQUM1RCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0Msd0JBQXdCLE1BQU0sbUNBQW1DO0FBQ3hFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFFOUMsTUFBTUMsV0FBVyxHQUFHRix3QkFBd0IsQ0FBQ0csS0FBSztBQUNsRCxNQUFNQyxRQUFRLEdBQUdKLHdCQUF3QixDQUFDSyxFQUFFO0FBQzVDLE1BQU1DLE9BQU8sR0FBR04sd0JBQXdCLENBQUNPLENBQUM7QUFDMUMsTUFBTUMsV0FBVyxHQUFHUix3QkFBd0IsQ0FBQ1MsS0FBSztBQUNsRCxNQUFNQyxXQUFXLEdBQUdWLHdC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