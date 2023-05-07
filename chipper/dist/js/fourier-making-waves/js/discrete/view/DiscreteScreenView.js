// Copyright 2020-2023, University of Colorado Boulder

/**
 * DiscreteScreenView is the view for the 'Discrete' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import OopsDialog from '../../../../scenery-phet/js/OopsDialog.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWQueryParameters from '../../common/FMWQueryParameters.js';
import Domain from '../../common/model/Domain.js';
import AmplitudeKeypadDialog from '../../common/view/AmplitudeKeypadDialog.js';
import LabeledExpandCollapseButton from '../../common/view/LabeledExpandCollapseButton.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import DiscreteModel from '../model/DiscreteModel.js';
import EquationForm from '../model/EquationForm.js';
import Waveform from '../model/Waveform.js';
import DiscreteAmplitudesChartNode from './DiscreteAmplitudesChartNode.js';
import DiscreteControlPanel from './DiscreteControlPanel.js';
import DiscreteHarmonicsChartNode from './DiscreteHarmonicsChartNode.js';
import DiscreteSumChartNode from './DiscreteSumChartNode.js';
import DiscreteSumEquationNode from './DiscreteSumEquationNode.js';
import ExpandedFormButton from './ExpandedFormButton.js';
import ExpandedFormDialog from './ExpandedFormDialog.js';
import FourierSoundGenerator from './FourierSoundGenerator.js';
import HarmonicsEquationNode from './HarmonicsEquationNode.js';
import InfiniteHarmonicsCheckbox from './InfiniteHarmonicsCheckbox.js';
import PeriodCalipersNode from './PeriodCalipersNode.js';
import PeriodClockNode from './PeriodClockNode.js';
import WavelengthCalipersNode from './WavelengthCalipersNode.js';
export default class DiscreteScreenView extends ScreenView {
  /**
   * @param {DiscreteModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    assert && assert(model instanceof DiscreteModel);
    assert && assert(tandem instanceof Tandem);
    super({
      tandem: tandem
    });

    //------------------------------------------------------------------------------------------------------------------
    // Sound
    //------------------------------------------------------------------------------------------------------------------

    // Sound for the Fourier series
    const fourierSoundGenerator = new FourierSoundGenerator(model.fourierSeries);
    soundManager.addSoundGenerator(fourierSoundGenerator, {
      associatedViewNode: this
    });

    //------------------------------------------------------------------------------------------------------------------
    // Amplitudes chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all charts
    const chartsTandem = tandem.createTandem('charts');

    // Parent tandem for all elements related to the Amplitudes chart
    const amplitudesTandem = chartsTandem.createTandem('amplitudes');

    // Keypad Dialog, for changing amplitude value
    const amplitudeKeypadDialog = new AmplitudeKeypadDialog(model.fourierSeries.amplitudeRange, {
      decimalPlaces: FMWConstants.DISCRETE_AMPLITUDE_DECIMAL_PLACES,
      layoutBounds: this.layoutBounds,
      tandem: amplitudesTandem.createTandem('amplitudeKeypadDialog')
    });

    // Amplitudes chart
    const amplitudesChartNode = new DiscreteAmplitudesChartNode(model.amplitudesChart, amplitudeKeypadDialog, {
      // Changing any amplitude switches the waveform to 'custom'.
      onEdit: () => {
        model.waveformProperty.value = Waveform.CUSTOM;
      },
      tandem: amplitudesTandem.createTandem('amplitudesChartNode')
    });

    // Disable the eraser button when all amplitudes are zero.
    const eraserButtonEnabledProperty = new DerivedProperty([model.fourierSeries.amplitudesProperty], amplitudes => !!_.find(amplitudes, amplitude => amplitude !== 0));

    // Push button to reset all amplitudes to zero
    const eraserButton = new EraserButton(merge({}, FMWConstants.ERASER_BUTTON_OPTIONS, {
      listener: () => {
        model.waveformProperty.value = Waveform.CUSTOM;
        model.fourierSeries.setAllAmplitudes(0);
      },
      enabledProperty: eraserButtonEnabledProperty,
      tandem: amplitudesTandem.createTandem('eraserButton')
    }));

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // In this screen, amplitudesChart.chartExpandedProperty can only be changed via PhET-iO.
    const amplitudesParentNode = new Node({
      visibleProperty: model.amplitudesChart.chartExpandedProperty,
      children: [amplitudesChartNode, eraserButton]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Harmonics chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all elements related to the Harmonics chart
    const harmonicsTandem = chartsTandem.createTandem('harmonics');

    // Button to show/hide the Harmonics chart and its related UI element
    const harmonicsExpandCollapseButton = new LabeledExpandCollapseButton(FourierMakingWavesStrings.harmonicsChartStringProperty, model.harmonicsChart.chartExpandedProperty, {
      tandem: harmonicsTandem.createTandem('harmonicsExpandCollapseButton')
    });

    // Harmonics chart
    const harmonicsChartNode = new DiscreteHarmonicsChartNode(model.harmonicsChart, {
      tandem: harmonicsTandem.createTandem('harmonicsChartNode')
    });

    // Equation that appears above the Harmonics chart, with wrapper Node to handle centering
    const harmonicsEquationNode = new HarmonicsEquationNode(model.domainProperty, model.seriesTypeProperty, model.equationFormProperty, {
      maxWidth: 0.5 * FMWConstants.CHART_RECTANGLE_SIZE.width,
      tandem: harmonicsTandem.createTandem('harmonicsEquationNode'),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // That can be done using harmonicsExpandCollapseButton, or by changing harmonicsChart.chartExpandedProperty via PhET-iO.
    const harmonicsParentNode = new Node({
      visibleProperty: model.harmonicsChart.chartExpandedProperty,
      children: [harmonicsChartNode, harmonicsEquationNode]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Sum chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all elements related to the Sum chart
    const sumTandem = chartsTandem.createTandem('sum');

    // Button to show/hide the Sum chart and its related UI element
    const sumExpandCollapseButton = new LabeledExpandCollapseButton(FourierMakingWavesStrings.sumStringProperty, model.sumChart.chartExpandedProperty, {
      tandem: sumTandem.createTandem('sumExpandCollapseButton')
    });

    // Sum chart
    const sumChartNode = new DiscreteSumChartNode(model.sumChart, {
      tandem: sumTandem.createTandem('sumChartNode')
    });

    // Equation that appears above the Sum chart, with wrapper Node to handle centering
    const sumEquationNodeTandem = sumTandem.createTandem('sumEquationNode');
    const sumEquationNode = new DiscreteSumEquationNode(model.fourierSeries.numberOfHarmonicsProperty, model.domainProperty, model.seriesTypeProperty, model.equationFormProperty, {
      maxWidth: 0.5 * FMWConstants.CHART_RECTANGLE_SIZE.width,
      tandem: sumTandem.createTandem('sumEquationNode'),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });
    const expandedFormDialog = new ExpandedFormDialog(model.fourierSeries, model.domainProperty, model.seriesTypeProperty, model.equationFormProperty, {
      tandem: sumEquationNodeTandem.createTandem('expandedFormDialog'),
      phetioDocumentation: 'This dialog shows the expanded form of the Sum equation.'
    });

    // Push button that opens the 'Expanded Form' dialog
    const expandedFormButton = new ExpandedFormButton({
      scale: 0.45,
      listener: () => expandedFormDialog.show(),
      // Make this button appear to be a child of sumEquationNode.
      tandem: sumEquationNodeTandem.createTandem('expandedFormButton'),
      phetioDocumentation: 'Pressing this button opens a dialog that shows the expanded form of the Sum equation.'
    });
    const sumEquationParentNode = new Node({
      children: [sumEquationNode, expandedFormButton]
    });

    // Shows the wave that the Fourier series is attempting to approximate
    const infiniteHarmonicsCheckbox = new InfiniteHarmonicsCheckbox(model.sumChart.infiniteHarmonicsVisibleProperty, {
      tandem: sumTandem.createTandem('infiniteHarmonicsCheckbox')
    });

    // Disable infiniteHarmonicsCheckbox for custom and wave-packet waveforms.
    model.waveformProperty.link(waveform => {
      infiniteHarmonicsCheckbox.interruptSubtreeInput();
      infiniteHarmonicsCheckbox.enabled = waveform.supportsInfiniteHarmonics;
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // That can be done using sumExpandCollapseButton, or by changing sumChart.chartExpandedProperty via PhET-iO.
    const sumParentNode = new Node({
      visibleProperty: model.sumChart.chartExpandedProperty,
      children: [sumChartNode, sumEquationParentNode, infiniteHarmonicsCheckbox]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Other UI elements
    //------------------------------------------------------------------------------------------------------------------

    // Parent for all popups
    const popupParent = new Node();

    // Control panel
    const controlPanel = new DiscreteControlPanel(model, popupParent, {
      maxWidth: 258,
      // as a fallback, in case some subcomponent is misbehaving
      tandem: tandem.createTandem('controlPanel')
    });

    // Time controls
    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      playPauseStepButtonOptions: {
        playPauseButtonOptions: {
          //TODO https://github.com/phetsims/fourier-making-waves/issues/92 workaround, we do not want partial hotkey support for TimeControlNode
          includeGlobalHotkey: false
        },
        stepForwardButtonOptions: {
          listener: () => {
            if (model.domainProperty.value === Domain.SPACE_AND_TIME) {
              model.stepOnce();
            }
          }
        }
      },
      tandem: tandem.createTandem('timeControlNode')
    });

    // Enable time controls only when there is the possibility of animation.
    model.domainProperty.link(domain => {
      timeControlNode.enabled = domain === Domain.SPACE_AND_TIME;
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        resetMeasurementTools();
      },
      tandem: tandem.createTandem('resetAllButton')
    });

    // Creating a sawtooth wave using cosines is impossible because it is asymmetric. Display a dialog if the user
    // attempts this.  The model is responsible for other adjustments. This dialog is created eagerly because it's
    // highly likely that this situation will be encountered.
    const oopsSawtoothWithCosinesDialog = new OopsDialog(FourierMakingWavesStrings.sawtoothWithCosinesStringProperty, {
      phetioReadOnly: true,
      visiblePropertyOptions: {
        phetioReadOnly: true
      },
      tandem: tandem.createTandem('oopsSawtoothWithCosinesDialog')
    });
    model.oopsSawtoothWithCosinesEmitter.addListener(() => oopsSawtoothWithCosinesDialog.show());

    //------------------------------------------------------------------------------------------------------------------
    // Layout
    //------------------------------------------------------------------------------------------------------------------

    const chartTitleBottomSpacing = 15; // space below the title of a chart

    // Amplitudes chart at top left
    amplitudesChartNode.x = FMWConstants.X_CHART_RECTANGLES;
    amplitudesChartNode.y = 58;
    const amplitudesChartRectangleLocalBounds = amplitudesChartNode.chartRectangle.boundsTo(this);

    // Eraser button to the right of the amplitude NumberDisplays
    const amplitudesChartRightTop = amplitudesChartRectangleLocalBounds.rightTop;
    eraserButton.left = amplitudesChartRightTop.x + 10;
    eraserButton.bottom = amplitudesChartRightTop.y - 10;

    // Harmonics chart below the Amplitudes chart
    harmonicsExpandCollapseButton.left = this.layoutBounds.left + FMWConstants.SCREEN_VIEW_X_MARGIN;
    harmonicsExpandCollapseButton.top = amplitudesChartNode.bottom + 15;
    harmonicsChartNode.x = FMWConstants.X_CHART_RECTANGLES;
    harmonicsChartNode.y = harmonicsExpandCollapseButton.bottom + chartTitleBottomSpacing;
    const harmonicsChartRectangleLocalBounds = harmonicsChartNode.chartRectangle.boundsTo(this);

    // Sum chart below the Harmonics chart
    sumExpandCollapseButton.left = harmonicsExpandCollapseButton.left;
    sumExpandCollapseButton.top = harmonicsChartNode.bottom + 30;
    sumChartNode.x = FMWConstants.X_CHART_RECTANGLES;
    sumChartNode.y = sumExpandCollapseButton.bottom + chartTitleBottomSpacing;
    const sumChartRectangleLocalBounds = sumChartNode.chartRectangle.boundsTo(this);
    infiniteHarmonicsCheckbox.boundsProperty.link(bounds => {
      infiniteHarmonicsCheckbox.right = sumChartRectangleLocalBounds.right - 5;
      infiniteHarmonicsCheckbox.top = sumChartNode.bottom + 8;
    });

    // Control panel to the right of the charts
    controlPanel.right = this.layoutBounds.right - FMWConstants.SCREEN_VIEW_X_MARGIN;
    controlPanel.top = this.layoutBounds.top + FMWConstants.SCREEN_VIEW_Y_MARGIN;

    // Time control below the control panel
    timeControlNode.left = controlPanel.left + 30;
    timeControlNode.bottom = this.layoutBounds.bottom - FMWConstants.SCREEN_VIEW_Y_MARGIN;

    // Reset All button at bottom right
    resetAllButton.right = this.layoutBounds.maxX - FMWConstants.SCREEN_VIEW_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - FMWConstants.SCREEN_VIEW_Y_MARGIN;

    //------------------------------------------------------------------------------------------------------------------
    // Rendering order
    //------------------------------------------------------------------------------------------------------------------

    // Measurement tools are created later, added to this parent so we know the rendering order.
    const measurementToolsParent = new Node();

    // Add everything to one root Node, then add that root Node to the scene graph.
    // This should improve startup performance, compared to calling this.addChild for each Node.
    const screenViewRootNode = new Node({
      children: [amplitudesParentNode, harmonicsExpandCollapseButton, harmonicsParentNode, sumExpandCollapseButton, sumParentNode, measurementToolsParent, controlPanel, timeControlNode, resetAllButton,
      // parent for popups on top
      popupParent]
    });
    this.addChild(screenViewRootNode);

    //------------------------------------------------------------------------------------------------------------------
    // Equation positions
    //------------------------------------------------------------------------------------------------------------------

    // Center equations above their respective charts.
    // Since we need to listen to the bounds of these equations in order to respect their maxWidth, wrapper Nodes are
    // transformed. See https://github.com/phetsims/fourier-making-waves/issues/40

    // Space between top of the ChartRectangle and bottom of the equation
    const equationYSpacing = 3;
    harmonicsEquationNode.boundsProperty.link(() => {
      // Center the equation above the Harmonics chart.
      harmonicsEquationNode.centerX = harmonicsChartRectangleLocalBounds.centerX;
      harmonicsEquationNode.bottom = harmonicsChartRectangleLocalBounds.top - equationYSpacing;
    });
    sumEquationNode.boundsProperty.link(() => {
      // Ensure that expandedFormButton is always above the chart, regardless of how tall the equation is.
      const maxHeight = Math.max(sumEquationNode.height, expandedFormButton.height);

      // Center the equation above the Sum chart.
      sumEquationNode.centerX = sumChartRectangleLocalBounds.centerX;
      sumEquationNode.centerY = sumChartRectangleLocalBounds.top - maxHeight / 2 - equationYSpacing;

      // Button to the right of the equation
      expandedFormButton.left = sumEquationNode.right + 20;
      expandedFormButton.centerY = sumEquationNode.centerY;
    });

    // Visibility of the equations above the charts
    model.equationFormProperty.link(equationForm => {
      const visible = equationForm !== EquationForm.HIDDEN;
      harmonicsEquationNode.visible = visible;
      sumEquationParentNode.visible = visible;
    });

    //------------------------------------------------------------------------------------------------------------------
    // Measurement tools
    //------------------------------------------------------------------------------------------------------------------

    // Create measurement tools after layout of charts, because their initial positions and drag bounds depend on
    // final positions and bounds of ChartRectangles.

    // Parent tandem for all measurement tools
    const measurementToolsTandem = tandem.createTandem('measurementTools');

    // Drag bounds for all measurement tools.
    const measurementToolsDragBounds = new Bounds2(this.layoutBounds.left + 20, amplitudesChartRectangleLocalBounds.bottom, harmonicsChartRectangleLocalBounds.right + 20, this.layoutBounds.bottom - 20);

    // For measuring a harmonic's wavelength in the 'space' and 'space & time' Domains.
    const wavelengthCalipersNode = new WavelengthCalipersNode(model, harmonicsChartNode.chartTransform, {
      position: harmonicsChartRectangleLocalBounds.leftCenter,
      dragBounds: measurementToolsDragBounds,
      tandem: measurementToolsTandem.createTandem('wavelengthCalipersNode')
    });
    measurementToolsParent.addChild(wavelengthCalipersNode);

    // For measuring a harmonic's period in the time Domain.
    const periodCalipersNode = new PeriodCalipersNode(model, harmonicsChartNode.chartTransform, {
      position: harmonicsChartRectangleLocalBounds.leftCenter,
      dragBounds: measurementToolsDragBounds,
      tandem: measurementToolsTandem.createTandem('periodCalipersNode')
    });
    measurementToolsParent.addChild(periodCalipersNode);

    // For measuring a harmonic's period in the 'space & time' Domain.
    const periodClockNode = new PeriodClockNode(model, {
      position: new Vector2(harmonicsChartRectangleLocalBounds.right, harmonicsChartNode.bottom + (sumChartRectangleLocalBounds.minY - harmonicsChartNode.bottom) / 2),
      dragBounds: measurementToolsDragBounds,
      tandem: measurementToolsTandem.createTandem('periodClockNode')
    });
    measurementToolsParent.addChild(periodClockNode);

    // Show drag bounds for the measurement tools.
    if (FMWQueryParameters.debugTools) {
      measurementToolsParent.addChild(new Rectangle(measurementToolsDragBounds, {
        stroke: 'red'
      }));
    }
    const resetMeasurementTools = () => {
      wavelengthCalipersNode.reset();
      periodCalipersNode.reset();
      periodClockNode.reset();
    };

    //------------------------------------------------------------------------------------------------------------------
    // PDOM
    //------------------------------------------------------------------------------------------------------------------

    // pdom -traversal order
    // See https://github.com/phetsims/fourier-making-waves/issues/53
    screenViewRootNode.pdomOrder = [amplitudesChartNode, eraserButton, controlPanel, wavelengthCalipersNode, periodCalipersNode, periodClockNode, harmonicsExpandCollapseButton, harmonicsChartNode, sumExpandCollapseButton, expandedFormButton, sumChartNode, infiniteHarmonicsCheckbox, timeControlNode, resetAllButton];
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
fourierMakingWaves.register('DiscreteScreenView', DiscreteScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJtZXJnZSIsIkVyYXNlckJ1dHRvbiIsIlJlc2V0QWxsQnV0dG9uIiwiT29wc0RpYWxvZyIsIlRpbWVDb250cm9sTm9kZSIsIk5vZGUiLCJSZWN0YW5nbGUiLCJzb3VuZE1hbmFnZXIiLCJUYW5kZW0iLCJGTVdDb25zdGFudHMiLCJGTVdRdWVyeVBhcmFtZXRlcnMiLCJEb21haW4iLCJBbXBsaXR1ZGVLZXlwYWREaWFsb2ciLCJMYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIiwiRGlzY3JldGVNb2RlbCIsIkVxdWF0aW9uRm9ybSIsIldhdmVmb3JtIiwiRGlzY3JldGVBbXBsaXR1ZGVzQ2hhcnROb2RlIiwiRGlzY3JldGVDb250cm9sUGFuZWwiLCJEaXNjcmV0ZUhhcm1vbmljc0NoYXJ0Tm9kZSIsIkRpc2NyZXRlU3VtQ2hhcnROb2RlIiwiRGlzY3JldGVTdW1FcXVhdGlvbk5vZGUiLCJFeHBhbmRlZEZvcm1CdXR0b24iLCJFeHBhbmRlZEZvcm1EaWFsb2ciLCJGb3VyaWVyU291bmRHZW5lcmF0b3IiLCJIYXJtb25pY3NFcXVhdGlvbk5vZGUiLCJJbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94IiwiUGVyaW9kQ2FsaXBlcnNOb2RlIiwiUGVyaW9kQ2xvY2tOb2RlIiwiV2F2ZWxlbmd0aENhbGlwZXJzTm9kZSIsIkRpc2NyZXRlU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJhc3NlcnQiLCJmb3VyaWVyU291bmRHZW5lcmF0b3IiLCJmb3VyaWVyU2VyaWVzIiwiYWRkU291bmRHZW5lcmF0b3IiLCJhc3NvY2lhdGVkVmlld05vZGUiLCJjaGFydHNUYW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJhbXBsaXR1ZGVzVGFuZGVtIiwiYW1wbGl0dWRlS2V5cGFkRGlhbG9nIiwiYW1wbGl0dWRlUmFuZ2UiLCJkZWNpbWFsUGxhY2VzIiwiRElTQ1JFVEVfQU1QTElUVURFX0RFQ0lNQUxfUExBQ0VTIiwibGF5b3V0Qm91bmRzIiwiYW1wbGl0dWRlc0NoYXJ0Tm9kZSIsImFtcGxpdHVkZXNDaGFydCIsIm9uRWRpdCIsIndhdmVmb3JtUHJvcGVydHkiLCJ2YWx1ZSIsIkNVU1RPTSIsImVyYXNlckJ1dHRvbkVuYWJsZWRQcm9wZXJ0eSIsImFtcGxpdHVkZXNQcm9wZXJ0eSIsImFtcGxpdHVkZXMiLCJfIiwiZmluZCIsImFtcGxpdHVkZSIsImVyYXNlckJ1dHRvbiIsIkVSQVNFUl9CVVRUT05fT1BUSU9OUyIsImxpc3RlbmVyIiwic2V0QWxsQW1wbGl0dWRlcyIsImVuYWJsZWRQcm9wZXJ0eSIsImFtcGxpdHVkZXNQYXJlbnROb2RlIiwidmlzaWJsZVByb3BlcnR5IiwiY2hhcnRFeHBhbmRlZFByb3BlcnR5IiwiY2hpbGRyZW4iLCJoYXJtb25pY3NUYW5kZW0iLCJoYXJtb25pY3NFeHBhbmRDb2xsYXBzZUJ1dHRvbiIsImhhcm1vbmljc0NoYXJ0U3RyaW5nUHJvcGVydHkiLCJoYXJtb25pY3NDaGFydCIsImhhcm1vbmljc0NoYXJ0Tm9kZSIsImhhcm1vbmljc0VxdWF0aW9uTm9kZSIsImRvbWFpblByb3BlcnR5Iiwic2VyaWVzVHlwZVByb3BlcnR5IiwiZXF1YXRpb25Gb3JtUHJvcGVydHkiLCJtYXhXaWR0aCIsIkNIQVJUX1JFQ1RBTkdMRV9TSVpFIiwid2lkdGgiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvUmVhZE9ubHkiLCJoYXJtb25pY3NQYXJlbnROb2RlIiwic3VtVGFuZGVtIiwic3VtRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJzdW1TdHJpbmdQcm9wZXJ0eSIsInN1bUNoYXJ0Iiwic3VtQ2hhcnROb2RlIiwic3VtRXF1YXRpb25Ob2RlVGFuZGVtIiwic3VtRXF1YXRpb25Ob2RlIiwibnVtYmVyT2ZIYXJtb25pY3NQcm9wZXJ0eSIsImV4cGFuZGVkRm9ybURpYWxvZyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJleHBhbmRlZEZvcm1CdXR0b24iLCJzY2FsZSIsInNob3ciLCJzdW1FcXVhdGlvblBhcmVudE5vZGUiLCJpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94IiwiaW5maW5pdGVIYXJtb25pY3NWaXNpYmxlUHJvcGVydHkiLCJsaW5rIiwid2F2ZWZvcm0iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJlbmFibGVkIiwic3VwcG9ydHNJbmZpbml0ZUhhcm1vbmljcyIsInN1bVBhcmVudE5vZGUiLCJwb3B1cFBhcmVudCIsImNvbnRyb2xQYW5lbCIsInRpbWVDb250cm9sTm9kZSIsImlzUGxheWluZ1Byb3BlcnR5IiwicGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnMiLCJwbGF5UGF1c2VCdXR0b25PcHRpb25zIiwiaW5jbHVkZUdsb2JhbEhvdGtleSIsInN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9ucyIsIlNQQUNFX0FORF9USU1FIiwic3RlcE9uY2UiLCJkb21haW4iLCJyZXNldEFsbEJ1dHRvbiIsInJlc2V0IiwicmVzZXRNZWFzdXJlbWVudFRvb2xzIiwib29wc1Nhd3Rvb3RoV2l0aENvc2luZXNEaWFsb2ciLCJzYXd0b290aFdpdGhDb3NpbmVzU3RyaW5nUHJvcGVydHkiLCJvb3BzU2F3dG9vdGhXaXRoQ29zaW5lc0VtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImNoYXJ0VGl0bGVCb3R0b21TcGFjaW5nIiwieCIsIlhfQ0hBUlRfUkVDVEFOR0xFUyIsInkiLCJhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyIsImNoYXJ0UmVjdGFuZ2xlIiwiYm91bmRzVG8iLCJhbXBsaXR1ZGVzQ2hhcnRSaWdodFRvcCIsInJpZ2h0VG9wIiwibGVmdCIsImJvdHRvbSIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwidG9wIiwiaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcyIsInN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMiLCJib3VuZHNQcm9wZXJ0eSIsImJvdW5kcyIsInJpZ2h0IiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJtYXhYIiwibWF4WSIsIm1lYXN1cmVtZW50VG9vbHNQYXJlbnQiLCJzY3JlZW5WaWV3Um9vdE5vZGUiLCJhZGRDaGlsZCIsImVxdWF0aW9uWVNwYWNpbmciLCJjZW50ZXJYIiwibWF4SGVpZ2h0IiwiTWF0aCIsIm1heCIsImhlaWdodCIsImNlbnRlclkiLCJlcXVhdGlvbkZvcm0iLCJ2aXNpYmxlIiwiSElEREVOIiwibWVhc3VyZW1lbnRUb29sc1RhbmRlbSIsIm1lYXN1cmVtZW50VG9vbHNEcmFnQm91bmRzIiwid2F2ZWxlbmd0aENhbGlwZXJzTm9kZSIsImNoYXJ0VHJhbnNmb3JtIiwicG9zaXRpb24iLCJsZWZ0Q2VudGVyIiwiZHJhZ0JvdW5kcyIsInBlcmlvZENhbGlwZXJzTm9kZSIsInBlcmlvZENsb2NrTm9kZSIsIm1pblkiLCJkZWJ1Z1Rvb2xzIiwic3Ryb2tlIiwicGRvbU9yZGVyIiwiZGlzcG9zZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGlzY3JldGVTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc2NyZXRlU2NyZWVuVmlldyBpcyB0aGUgdmlldyBmb3IgdGhlICdEaXNjcmV0ZScgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuXHJcbiAqL1xyXG5cclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBFcmFzZXJCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvRXJhc2VyQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IE9vcHNEaWFsb2cgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL09vcHNEaWFsb2cuanMnO1xyXG5pbXBvcnQgVGltZUNvbnRyb2xOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGTVdRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBEb21haW4gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0RvbWFpbi5qcyc7XHJcbmltcG9ydCBBbXBsaXR1ZGVLZXlwYWREaWFsb2cgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQW1wbGl0dWRlS2V5cGFkRGlhbG9nLmpzJztcclxuaW1wb3J0IExhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24uanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIGZyb20gJy4uLy4uL0ZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRGlzY3JldGVNb2RlbCBmcm9tICcuLi9tb2RlbC9EaXNjcmV0ZU1vZGVsLmpzJztcclxuaW1wb3J0IEVxdWF0aW9uRm9ybSBmcm9tICcuLi9tb2RlbC9FcXVhdGlvbkZvcm0uanMnO1xyXG5pbXBvcnQgV2F2ZWZvcm0gZnJvbSAnLi4vbW9kZWwvV2F2ZWZvcm0uanMnO1xyXG5pbXBvcnQgRGlzY3JldGVBbXBsaXR1ZGVzQ2hhcnROb2RlIGZyb20gJy4vRGlzY3JldGVBbXBsaXR1ZGVzQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IERpc2NyZXRlQ29udHJvbFBhbmVsIGZyb20gJy4vRGlzY3JldGVDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgRGlzY3JldGVIYXJtb25pY3NDaGFydE5vZGUgZnJvbSAnLi9EaXNjcmV0ZUhhcm1vbmljc0NoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBEaXNjcmV0ZVN1bUNoYXJ0Tm9kZSBmcm9tICcuL0Rpc2NyZXRlU3VtQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IERpc2NyZXRlU3VtRXF1YXRpb25Ob2RlIGZyb20gJy4vRGlzY3JldGVTdW1FcXVhdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgRXhwYW5kZWRGb3JtQnV0dG9uIGZyb20gJy4vRXhwYW5kZWRGb3JtQnV0dG9uLmpzJztcclxuaW1wb3J0IEV4cGFuZGVkRm9ybURpYWxvZyBmcm9tICcuL0V4cGFuZGVkRm9ybURpYWxvZy5qcyc7XHJcbmltcG9ydCBGb3VyaWVyU291bmRHZW5lcmF0b3IgZnJvbSAnLi9Gb3VyaWVyU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgSGFybW9uaWNzRXF1YXRpb25Ob2RlIGZyb20gJy4vSGFybW9uaWNzRXF1YXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IEluZmluaXRlSGFybW9uaWNzQ2hlY2tib3ggZnJvbSAnLi9JbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBlcmlvZENhbGlwZXJzTm9kZSBmcm9tICcuL1BlcmlvZENhbGlwZXJzTm9kZS5qcyc7XHJcbmltcG9ydCBQZXJpb2RDbG9ja05vZGUgZnJvbSAnLi9QZXJpb2RDbG9ja05vZGUuanMnO1xyXG5pbXBvcnQgV2F2ZWxlbmd0aENhbGlwZXJzTm9kZSBmcm9tICcuL1dhdmVsZW5ndGhDYWxpcGVyc05vZGUuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzY3JldGVTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RGlzY3JldGVNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbCBpbnN0YW5jZW9mIERpc2NyZXRlTW9kZWwgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRhbmRlbSBpbnN0YW5jZW9mIFRhbmRlbSApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFNvdW5kXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFNvdW5kIGZvciB0aGUgRm91cmllciBzZXJpZXNcclxuICAgIGNvbnN0IGZvdXJpZXJTb3VuZEdlbmVyYXRvciA9IG5ldyBGb3VyaWVyU291bmRHZW5lcmF0b3IoIG1vZGVsLmZvdXJpZXJTZXJpZXMgKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggZm91cmllclNvdW5kR2VuZXJhdG9yLCB7XHJcbiAgICAgIGFzc29jaWF0ZWRWaWV3Tm9kZTogdGhpc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBjaGFydHNcclxuICAgIGNvbnN0IGNoYXJ0c1RhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGFydHMnICk7XHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIGVsZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIEFtcGxpdHVkZXMgY2hhcnRcclxuICAgIGNvbnN0IGFtcGxpdHVkZXNUYW5kZW0gPSBjaGFydHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlcycgKTtcclxuXHJcbiAgICAvLyBLZXlwYWQgRGlhbG9nLCBmb3IgY2hhbmdpbmcgYW1wbGl0dWRlIHZhbHVlXHJcbiAgICBjb25zdCBhbXBsaXR1ZGVLZXlwYWREaWFsb2cgPSBuZXcgQW1wbGl0dWRlS2V5cGFkRGlhbG9nKCBtb2RlbC5mb3VyaWVyU2VyaWVzLmFtcGxpdHVkZVJhbmdlLCB7XHJcbiAgICAgIGRlY2ltYWxQbGFjZXM6IEZNV0NvbnN0YW50cy5ESVNDUkVURV9BTVBMSVRVREVfREVDSU1BTF9QTEFDRVMsXHJcbiAgICAgIGxheW91dEJvdW5kczogdGhpcy5sYXlvdXRCb3VuZHMsXHJcbiAgICAgIHRhbmRlbTogYW1wbGl0dWRlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdhbXBsaXR1ZGVLZXlwYWREaWFsb2cnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICBjb25zdCBhbXBsaXR1ZGVzQ2hhcnROb2RlID0gbmV3IERpc2NyZXRlQW1wbGl0dWRlc0NoYXJ0Tm9kZSggbW9kZWwuYW1wbGl0dWRlc0NoYXJ0LCBhbXBsaXR1ZGVLZXlwYWREaWFsb2csIHtcclxuXHJcbiAgICAgIC8vIENoYW5naW5nIGFueSBhbXBsaXR1ZGUgc3dpdGNoZXMgdGhlIHdhdmVmb3JtIHRvICdjdXN0b20nLlxyXG4gICAgICBvbkVkaXQ6ICgpID0+IHsgbW9kZWwud2F2ZWZvcm1Qcm9wZXJ0eS52YWx1ZSA9IFdhdmVmb3JtLkNVU1RPTTsgfSxcclxuICAgICAgdGFuZGVtOiBhbXBsaXR1ZGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FtcGxpdHVkZXNDaGFydE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEaXNhYmxlIHRoZSBlcmFzZXIgYnV0dG9uIHdoZW4gYWxsIGFtcGxpdHVkZXMgYXJlIHplcm8uXHJcbiAgICBjb25zdCBlcmFzZXJCdXR0b25FbmFibGVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIG1vZGVsLmZvdXJpZXJTZXJpZXMuYW1wbGl0dWRlc1Byb3BlcnR5IF0sXHJcbiAgICAgIGFtcGxpdHVkZXMgPT4gISFfLmZpbmQoIGFtcGxpdHVkZXMsIGFtcGxpdHVkZSA9PiAoIGFtcGxpdHVkZSAhPT0gMCApIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gUHVzaCBidXR0b24gdG8gcmVzZXQgYWxsIGFtcGxpdHVkZXMgdG8gemVyb1xyXG4gICAgY29uc3QgZXJhc2VyQnV0dG9uID0gbmV3IEVyYXNlckJ1dHRvbiggbWVyZ2UoIHt9LCBGTVdDb25zdGFudHMuRVJBU0VSX0JVVFRPTl9PUFRJT05TLCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgbW9kZWwud2F2ZWZvcm1Qcm9wZXJ0eS52YWx1ZSA9IFdhdmVmb3JtLkNVU1RPTTtcclxuICAgICAgICBtb2RlbC5mb3VyaWVyU2VyaWVzLnNldEFsbEFtcGxpdHVkZXMoIDAgKTtcclxuICAgICAgfSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5OiBlcmFzZXJCdXR0b25FbmFibGVkUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogYW1wbGl0dWRlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdlcmFzZXJCdXR0b24nIClcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEFsbCBvZiB0aGUgZWxlbWVudHMgdGhhdCBzaG91bGQgYmUgaGlkZGVuIHdoZW4gY2hhcnRFeHBhbmRlZFByb3BlcnR5IGlzIHNldCB0byBmYWxzZS5cclxuICAgIC8vIEluIHRoaXMgc2NyZWVuLCBhbXBsaXR1ZGVzQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5IGNhbiBvbmx5IGJlIGNoYW5nZWQgdmlhIFBoRVQtaU8uXHJcbiAgICBjb25zdCBhbXBsaXR1ZGVzUGFyZW50Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuYW1wbGl0dWRlc0NoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgY2hpbGRyZW46IFsgYW1wbGl0dWRlc0NoYXJ0Tm9kZSwgZXJhc2VyQnV0dG9uIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gSGFybW9uaWNzIGNoYXJ0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBlbGVtZW50cyByZWxhdGVkIHRvIHRoZSBIYXJtb25pY3MgY2hhcnRcclxuICAgIGNvbnN0IGhhcm1vbmljc1RhbmRlbSA9IGNoYXJ0c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdoYXJtb25pY3MnICk7XHJcblxyXG4gICAgLy8gQnV0dG9uIHRvIHNob3cvaGlkZSB0aGUgSGFybW9uaWNzIGNoYXJ0IGFuZCBpdHMgcmVsYXRlZCBVSSBlbGVtZW50XHJcbiAgICBjb25zdCBoYXJtb25pY3NFeHBhbmRDb2xsYXBzZUJ1dHRvbiA9IG5ldyBMYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24oXHJcbiAgICAgIEZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuaGFybW9uaWNzQ2hhcnRTdHJpbmdQcm9wZXJ0eSwgbW9kZWwuaGFybW9uaWNzQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBoYXJtb25pY3NUYW5kZW0uY3JlYXRlVGFuZGVtKCAnaGFybW9uaWNzRXhwYW5kQ29sbGFwc2VCdXR0b24nIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEhhcm1vbmljcyBjaGFydFxyXG4gICAgY29uc3QgaGFybW9uaWNzQ2hhcnROb2RlID0gbmV3IERpc2NyZXRlSGFybW9uaWNzQ2hhcnROb2RlKCBtb2RlbC5oYXJtb25pY3NDaGFydCwge1xyXG4gICAgICB0YW5kZW06IGhhcm1vbmljc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdoYXJtb25pY3NDaGFydE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFcXVhdGlvbiB0aGF0IGFwcGVhcnMgYWJvdmUgdGhlIEhhcm1vbmljcyBjaGFydCwgd2l0aCB3cmFwcGVyIE5vZGUgdG8gaGFuZGxlIGNlbnRlcmluZ1xyXG4gICAgY29uc3QgaGFybW9uaWNzRXF1YXRpb25Ob2RlID0gbmV3IEhhcm1vbmljc0VxdWF0aW9uTm9kZShcclxuICAgICAgbW9kZWwuZG9tYWluUHJvcGVydHksIG1vZGVsLnNlcmllc1R5cGVQcm9wZXJ0eSwgbW9kZWwuZXF1YXRpb25Gb3JtUHJvcGVydHksIHtcclxuICAgICAgICBtYXhXaWR0aDogMC41ICogRk1XQ29uc3RhbnRzLkNIQVJUX1JFQ1RBTkdMRV9TSVpFLndpZHRoLFxyXG4gICAgICAgIHRhbmRlbTogaGFybW9uaWNzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hhcm1vbmljc0VxdWF0aW9uTm9kZScgKSxcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIEFsbCBvZiB0aGUgZWxlbWVudHMgdGhhdCBzaG91bGQgYmUgaGlkZGVuIHdoZW4gY2hhcnRFeHBhbmRlZFByb3BlcnR5IGlzIHNldCB0byBmYWxzZS5cclxuICAgIC8vIFRoYXQgY2FuIGJlIGRvbmUgdXNpbmcgaGFybW9uaWNzRXhwYW5kQ29sbGFwc2VCdXR0b24sIG9yIGJ5IGNoYW5naW5nIGhhcm1vbmljc0NoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSB2aWEgUGhFVC1pTy5cclxuICAgIGNvbnN0IGhhcm1vbmljc1BhcmVudE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLmhhcm1vbmljc0NoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgY2hpbGRyZW46IFsgaGFybW9uaWNzQ2hhcnROb2RlLCBoYXJtb25pY3NFcXVhdGlvbk5vZGUgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBTdW0gY2hhcnRcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIGVsZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIFN1bSBjaGFydFxyXG4gICAgY29uc3Qgc3VtVGFuZGVtID0gY2hhcnRzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bScgKTtcclxuXHJcbiAgICAvLyBCdXR0b24gdG8gc2hvdy9oaWRlIHRoZSBTdW0gY2hhcnQgYW5kIGl0cyByZWxhdGVkIFVJIGVsZW1lbnRcclxuICAgIGNvbnN0IHN1bUV4cGFuZENvbGxhcHNlQnV0dG9uID0gbmV3IExhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbihcclxuICAgICAgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zdW1TdHJpbmdQcm9wZXJ0eSwgbW9kZWwuc3VtQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBzdW1UYW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24nIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFN1bSBjaGFydFxyXG4gICAgY29uc3Qgc3VtQ2hhcnROb2RlID0gbmV3IERpc2NyZXRlU3VtQ2hhcnROb2RlKCBtb2RlbC5zdW1DaGFydCwge1xyXG4gICAgICB0YW5kZW06IHN1bVRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdW1DaGFydE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFcXVhdGlvbiB0aGF0IGFwcGVhcnMgYWJvdmUgdGhlIFN1bSBjaGFydCwgd2l0aCB3cmFwcGVyIE5vZGUgdG8gaGFuZGxlIGNlbnRlcmluZ1xyXG4gICAgY29uc3Qgc3VtRXF1YXRpb25Ob2RlVGFuZGVtID0gc3VtVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bUVxdWF0aW9uTm9kZScgKTtcclxuICAgIGNvbnN0IHN1bUVxdWF0aW9uTm9kZSA9IG5ldyBEaXNjcmV0ZVN1bUVxdWF0aW9uTm9kZSggbW9kZWwuZm91cmllclNlcmllcy5udW1iZXJPZkhhcm1vbmljc1Byb3BlcnR5LCBtb2RlbC5kb21haW5Qcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc2VyaWVzVHlwZVByb3BlcnR5LCBtb2RlbC5lcXVhdGlvbkZvcm1Qcm9wZXJ0eSwge1xyXG4gICAgICAgIG1heFdpZHRoOiAwLjUgKiBGTVdDb25zdGFudHMuQ0hBUlRfUkVDVEFOR0xFX1NJWkUud2lkdGgsXHJcbiAgICAgICAgdGFuZGVtOiBzdW1UYW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VtRXF1YXRpb25Ob2RlJyApLFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZXhwYW5kZWRGb3JtRGlhbG9nID0gbmV3IEV4cGFuZGVkRm9ybURpYWxvZyhcclxuICAgICAgbW9kZWwuZm91cmllclNlcmllcywgbW9kZWwuZG9tYWluUHJvcGVydHksIG1vZGVsLnNlcmllc1R5cGVQcm9wZXJ0eSwgbW9kZWwuZXF1YXRpb25Gb3JtUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHN1bUVxdWF0aW9uTm9kZVRhbmRlbS5jcmVhdGVUYW5kZW0oICdleHBhbmRlZEZvcm1EaWFsb2cnICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgZGlhbG9nIHNob3dzIHRoZSBleHBhbmRlZCBmb3JtIG9mIHRoZSBTdW0gZXF1YXRpb24uJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gUHVzaCBidXR0b24gdGhhdCBvcGVucyB0aGUgJ0V4cGFuZGVkIEZvcm0nIGRpYWxvZ1xyXG4gICAgY29uc3QgZXhwYW5kZWRGb3JtQnV0dG9uID0gbmV3IEV4cGFuZGVkRm9ybUJ1dHRvbigge1xyXG4gICAgICBzY2FsZTogMC40NSxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IGV4cGFuZGVkRm9ybURpYWxvZy5zaG93KCksXHJcblxyXG4gICAgICAvLyBNYWtlIHRoaXMgYnV0dG9uIGFwcGVhciB0byBiZSBhIGNoaWxkIG9mIHN1bUVxdWF0aW9uTm9kZS5cclxuICAgICAgdGFuZGVtOiBzdW1FcXVhdGlvbk5vZGVUYW5kZW0uY3JlYXRlVGFuZGVtKCAnZXhwYW5kZWRGb3JtQnV0dG9uJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnUHJlc3NpbmcgdGhpcyBidXR0b24gb3BlbnMgYSBkaWFsb2cgdGhhdCBzaG93cyB0aGUgZXhwYW5kZWQgZm9ybSBvZiB0aGUgU3VtIGVxdWF0aW9uLidcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzdW1FcXVhdGlvblBhcmVudE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBzdW1FcXVhdGlvbk5vZGUsIGV4cGFuZGVkRm9ybUJ1dHRvbiBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2hvd3MgdGhlIHdhdmUgdGhhdCB0aGUgRm91cmllciBzZXJpZXMgaXMgYXR0ZW1wdGluZyB0byBhcHByb3hpbWF0ZVxyXG4gICAgY29uc3QgaW5maW5pdGVIYXJtb25pY3NDaGVja2JveCA9IG5ldyBJbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94KCBtb2RlbC5zdW1DaGFydC5pbmZpbml0ZUhhcm1vbmljc1Zpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IHN1bVRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSBpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94IGZvciBjdXN0b20gYW5kIHdhdmUtcGFja2V0IHdhdmVmb3Jtcy5cclxuICAgIG1vZGVsLndhdmVmb3JtUHJvcGVydHkubGluayggd2F2ZWZvcm0gPT4ge1xyXG4gICAgICBpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94LmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICBpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94LmVuYWJsZWQgPSB3YXZlZm9ybS5zdXBwb3J0c0luZmluaXRlSGFybW9uaWNzO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFsbCBvZiB0aGUgZWxlbWVudHMgdGhhdCBzaG91bGQgYmUgaGlkZGVuIHdoZW4gY2hhcnRFeHBhbmRlZFByb3BlcnR5IGlzIHNldCB0byBmYWxzZS5cclxuICAgIC8vIFRoYXQgY2FuIGJlIGRvbmUgdXNpbmcgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24sIG9yIGJ5IGNoYW5naW5nIHN1bUNoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSB2aWEgUGhFVC1pTy5cclxuICAgIGNvbnN0IHN1bVBhcmVudE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLnN1bUNoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgY2hpbGRyZW46IFsgc3VtQ2hhcnROb2RlLCBzdW1FcXVhdGlvblBhcmVudE5vZGUsIGluZmluaXRlSGFybW9uaWNzQ2hlY2tib3ggXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBPdGhlciBVSSBlbGVtZW50c1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBQYXJlbnQgZm9yIGFsbCBwb3B1cHNcclxuICAgIGNvbnN0IHBvcHVwUGFyZW50ID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBDb250cm9sIHBhbmVsXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWwgPSBuZXcgRGlzY3JldGVDb250cm9sUGFuZWwoIG1vZGVsLCBwb3B1cFBhcmVudCwge1xyXG4gICAgICBtYXhXaWR0aDogMjU4LCAvLyBhcyBhIGZhbGxiYWNrLCBpbiBjYXNlIHNvbWUgc3ViY29tcG9uZW50IGlzIG1pc2JlaGF2aW5nXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRpbWUgY29udHJvbHNcclxuICAgIGNvbnN0IHRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgcGxheVBhdXNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvOTIgd29ya2Fyb3VuZCwgd2UgZG8gbm90IHdhbnQgcGFydGlhbCBob3RrZXkgc3VwcG9ydCBmb3IgVGltZUNvbnRyb2xOb2RlXHJcbiAgICAgICAgICBpbmNsdWRlR2xvYmFsSG90a2V5OiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3RlcEZvcndhcmRCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIG1vZGVsLmRvbWFpblByb3BlcnR5LnZhbHVlID09PSBEb21haW4uU1BBQ0VfQU5EX1RJTUUgKSB7XHJcbiAgICAgICAgICAgICAgbW9kZWwuc3RlcE9uY2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUNvbnRyb2xOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRW5hYmxlIHRpbWUgY29udHJvbHMgb25seSB3aGVuIHRoZXJlIGlzIHRoZSBwb3NzaWJpbGl0eSBvZiBhbmltYXRpb24uXHJcbiAgICBtb2RlbC5kb21haW5Qcm9wZXJ0eS5saW5rKCBkb21haW4gPT4ge1xyXG4gICAgICB0aW1lQ29udHJvbE5vZGUuZW5hYmxlZCA9ICggZG9tYWluID09PSBEb21haW4uU1BBQ0VfQU5EX1RJTUUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHJlc2V0TWVhc3VyZW1lbnRUb29scygpO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0aW5nIGEgc2F3dG9vdGggd2F2ZSB1c2luZyBjb3NpbmVzIGlzIGltcG9zc2libGUgYmVjYXVzZSBpdCBpcyBhc3ltbWV0cmljLiBEaXNwbGF5IGEgZGlhbG9nIGlmIHRoZSB1c2VyXHJcbiAgICAvLyBhdHRlbXB0cyB0aGlzLiAgVGhlIG1vZGVsIGlzIHJlc3BvbnNpYmxlIGZvciBvdGhlciBhZGp1c3RtZW50cy4gVGhpcyBkaWFsb2cgaXMgY3JlYXRlZCBlYWdlcmx5IGJlY2F1c2UgaXQnc1xyXG4gICAgLy8gaGlnaGx5IGxpa2VseSB0aGF0IHRoaXMgc2l0dWF0aW9uIHdpbGwgYmUgZW5jb3VudGVyZWQuXHJcbiAgICBjb25zdCBvb3BzU2F3dG9vdGhXaXRoQ29zaW5lc0RpYWxvZyA9IG5ldyBPb3BzRGlhbG9nKCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLnNhd3Rvb3RoV2l0aENvc2luZXNTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdvb3BzU2F3dG9vdGhXaXRoQ29zaW5lc0RpYWxvZycgKVxyXG4gICAgfSApO1xyXG4gICAgbW9kZWwub29wc1Nhd3Rvb3RoV2l0aENvc2luZXNFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBvb3BzU2F3dG9vdGhXaXRoQ29zaW5lc0RpYWxvZy5zaG93KCkgKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gTGF5b3V0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IGNoYXJ0VGl0bGVCb3R0b21TcGFjaW5nID0gMTU7IC8vIHNwYWNlIGJlbG93IHRoZSB0aXRsZSBvZiBhIGNoYXJ0XHJcblxyXG4gICAgLy8gQW1wbGl0dWRlcyBjaGFydCBhdCB0b3AgbGVmdFxyXG4gICAgYW1wbGl0dWRlc0NoYXJ0Tm9kZS54ID0gRk1XQ29uc3RhbnRzLlhfQ0hBUlRfUkVDVEFOR0xFUztcclxuICAgIGFtcGxpdHVkZXNDaGFydE5vZGUueSA9IDU4O1xyXG4gICAgY29uc3QgYW1wbGl0dWRlc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMgPSBhbXBsaXR1ZGVzQ2hhcnROb2RlLmNoYXJ0UmVjdGFuZ2xlLmJvdW5kc1RvKCB0aGlzICk7XHJcblxyXG4gICAgLy8gRXJhc2VyIGJ1dHRvbiB0byB0aGUgcmlnaHQgb2YgdGhlIGFtcGxpdHVkZSBOdW1iZXJEaXNwbGF5c1xyXG4gICAgY29uc3QgYW1wbGl0dWRlc0NoYXJ0UmlnaHRUb3AgPSBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5yaWdodFRvcDtcclxuICAgIGVyYXNlckJ1dHRvbi5sZWZ0ID0gYW1wbGl0dWRlc0NoYXJ0UmlnaHRUb3AueCArIDEwO1xyXG4gICAgZXJhc2VyQnV0dG9uLmJvdHRvbSA9IGFtcGxpdHVkZXNDaGFydFJpZ2h0VG9wLnkgLSAxMDtcclxuXHJcbiAgICAvLyBIYXJtb25pY3MgY2hhcnQgYmVsb3cgdGhlIEFtcGxpdHVkZXMgY2hhcnRcclxuICAgIGhhcm1vbmljc0V4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnQgPSB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgRk1XQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOO1xyXG4gICAgaGFybW9uaWNzRXhwYW5kQ29sbGFwc2VCdXR0b24udG9wID0gYW1wbGl0dWRlc0NoYXJ0Tm9kZS5ib3R0b20gKyAxNTtcclxuICAgIGhhcm1vbmljc0NoYXJ0Tm9kZS54ID0gRk1XQ29uc3RhbnRzLlhfQ0hBUlRfUkVDVEFOR0xFUztcclxuICAgIGhhcm1vbmljc0NoYXJ0Tm9kZS55ID0gaGFybW9uaWNzRXhwYW5kQ29sbGFwc2VCdXR0b24uYm90dG9tICsgY2hhcnRUaXRsZUJvdHRvbVNwYWNpbmc7XHJcbiAgICBjb25zdCBoYXJtb25pY3NDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzID0gaGFybW9uaWNzQ2hhcnROb2RlLmNoYXJ0UmVjdGFuZ2xlLmJvdW5kc1RvKCB0aGlzICk7XHJcblxyXG4gICAgLy8gU3VtIGNoYXJ0IGJlbG93IHRoZSBIYXJtb25pY3MgY2hhcnRcclxuICAgIHN1bUV4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnQgPSBoYXJtb25pY3NFeHBhbmRDb2xsYXBzZUJ1dHRvbi5sZWZ0O1xyXG4gICAgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24udG9wID0gaGFybW9uaWNzQ2hhcnROb2RlLmJvdHRvbSArIDMwO1xyXG4gICAgc3VtQ2hhcnROb2RlLnggPSBGTVdDb25zdGFudHMuWF9DSEFSVF9SRUNUQU5HTEVTO1xyXG4gICAgc3VtQ2hhcnROb2RlLnkgPSBzdW1FeHBhbmRDb2xsYXBzZUJ1dHRvbi5ib3R0b20gKyBjaGFydFRpdGxlQm90dG9tU3BhY2luZztcclxuICAgIGNvbnN0IHN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMgPSBzdW1DaGFydE5vZGUuY2hhcnRSZWN0YW5nbGUuYm91bmRzVG8oIHRoaXMgKTtcclxuXHJcbiAgICBpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIGluZmluaXRlSGFybW9uaWNzQ2hlY2tib3gucmlnaHQgPSBzdW1DaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLnJpZ2h0IC0gNTtcclxuICAgICAgaW5maW5pdGVIYXJtb25pY3NDaGVja2JveC50b3AgPSBzdW1DaGFydE5vZGUuYm90dG9tICsgODtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb250cm9sIHBhbmVsIHRvIHRoZSByaWdodCBvZiB0aGUgY2hhcnRzXHJcbiAgICBjb250cm9sUGFuZWwucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIEZNV0NvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTjtcclxuICAgIGNvbnRyb2xQYW5lbC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy50b3AgKyBGTVdDb25zdGFudHMuU0NSRUVOX1ZJRVdfWV9NQVJHSU47XHJcblxyXG4gICAgLy8gVGltZSBjb250cm9sIGJlbG93IHRoZSBjb250cm9sIHBhbmVsXHJcbiAgICB0aW1lQ29udHJvbE5vZGUubGVmdCA9IGNvbnRyb2xQYW5lbC5sZWZ0ICsgMzA7XHJcbiAgICB0aW1lQ29udHJvbE5vZGUuYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gRk1XQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOO1xyXG5cclxuICAgIC8vIFJlc2V0IEFsbCBidXR0b24gYXQgYm90dG9tIHJpZ2h0XHJcbiAgICByZXNldEFsbEJ1dHRvbi5yaWdodCA9IHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSBGTVdDb25zdGFudHMuU0NSRUVOX1ZJRVdfWF9NQVJHSU47XHJcbiAgICByZXNldEFsbEJ1dHRvbi5ib3R0b20gPSB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gRk1XQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBSZW5kZXJpbmcgb3JkZXJcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gTWVhc3VyZW1lbnQgdG9vbHMgYXJlIGNyZWF0ZWQgbGF0ZXIsIGFkZGVkIHRvIHRoaXMgcGFyZW50IHNvIHdlIGtub3cgdGhlIHJlbmRlcmluZyBvcmRlci5cclxuICAgIGNvbnN0IG1lYXN1cmVtZW50VG9vbHNQYXJlbnQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIEFkZCBldmVyeXRoaW5nIHRvIG9uZSByb290IE5vZGUsIHRoZW4gYWRkIHRoYXQgcm9vdCBOb2RlIHRvIHRoZSBzY2VuZSBncmFwaC5cclxuICAgIC8vIFRoaXMgc2hvdWxkIGltcHJvdmUgc3RhcnR1cCBwZXJmb3JtYW5jZSwgY29tcGFyZWQgdG8gY2FsbGluZyB0aGlzLmFkZENoaWxkIGZvciBlYWNoIE5vZGUuXHJcbiAgICBjb25zdCBzY3JlZW5WaWV3Um9vdE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGFtcGxpdHVkZXNQYXJlbnROb2RlLFxyXG4gICAgICAgIGhhcm1vbmljc0V4cGFuZENvbGxhcHNlQnV0dG9uLFxyXG4gICAgICAgIGhhcm1vbmljc1BhcmVudE5vZGUsXHJcbiAgICAgICAgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24sXHJcbiAgICAgICAgc3VtUGFyZW50Tm9kZSxcclxuICAgICAgICBtZWFzdXJlbWVudFRvb2xzUGFyZW50LFxyXG4gICAgICAgIGNvbnRyb2xQYW5lbCxcclxuICAgICAgICB0aW1lQ29udHJvbE5vZGUsXHJcbiAgICAgICAgcmVzZXRBbGxCdXR0b24sXHJcblxyXG4gICAgICAgIC8vIHBhcmVudCBmb3IgcG9wdXBzIG9uIHRvcFxyXG4gICAgICAgIHBvcHVwUGFyZW50XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNjcmVlblZpZXdSb290Tm9kZSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBFcXVhdGlvbiBwb3NpdGlvbnNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQ2VudGVyIGVxdWF0aW9ucyBhYm92ZSB0aGVpciByZXNwZWN0aXZlIGNoYXJ0cy5cclxuICAgIC8vIFNpbmNlIHdlIG5lZWQgdG8gbGlzdGVuIHRvIHRoZSBib3VuZHMgb2YgdGhlc2UgZXF1YXRpb25zIGluIG9yZGVyIHRvIHJlc3BlY3QgdGhlaXIgbWF4V2lkdGgsIHdyYXBwZXIgTm9kZXMgYXJlXHJcbiAgICAvLyB0cmFuc2Zvcm1lZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvNDBcclxuXHJcbiAgICAvLyBTcGFjZSBiZXR3ZWVuIHRvcCBvZiB0aGUgQ2hhcnRSZWN0YW5nbGUgYW5kIGJvdHRvbSBvZiB0aGUgZXF1YXRpb25cclxuICAgIGNvbnN0IGVxdWF0aW9uWVNwYWNpbmcgPSAzO1xyXG5cclxuICAgIGhhcm1vbmljc0VxdWF0aW9uTm9kZS5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBDZW50ZXIgdGhlIGVxdWF0aW9uIGFib3ZlIHRoZSBIYXJtb25pY3MgY2hhcnQuXHJcbiAgICAgIGhhcm1vbmljc0VxdWF0aW9uTm9kZS5jZW50ZXJYID0gaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgICBoYXJtb25pY3NFcXVhdGlvbk5vZGUuYm90dG9tID0gaGFybW9uaWNzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy50b3AgLSBlcXVhdGlvbllTcGFjaW5nO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHN1bUVxdWF0aW9uTm9kZS5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcblxyXG4gICAgICAvLyBFbnN1cmUgdGhhdCBleHBhbmRlZEZvcm1CdXR0b24gaXMgYWx3YXlzIGFib3ZlIHRoZSBjaGFydCwgcmVnYXJkbGVzcyBvZiBob3cgdGFsbCB0aGUgZXF1YXRpb24gaXMuXHJcbiAgICAgIGNvbnN0IG1heEhlaWdodCA9IE1hdGgubWF4KCBzdW1FcXVhdGlvbk5vZGUuaGVpZ2h0LCBleHBhbmRlZEZvcm1CdXR0b24uaGVpZ2h0ICk7XHJcblxyXG4gICAgICAvLyBDZW50ZXIgdGhlIGVxdWF0aW9uIGFib3ZlIHRoZSBTdW0gY2hhcnQuXHJcbiAgICAgIHN1bUVxdWF0aW9uTm9kZS5jZW50ZXJYID0gc3VtQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgICBzdW1FcXVhdGlvbk5vZGUuY2VudGVyWSA9IHN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMudG9wIC0gKCBtYXhIZWlnaHQgLyAyICkgLSBlcXVhdGlvbllTcGFjaW5nO1xyXG5cclxuICAgICAgLy8gQnV0dG9uIHRvIHRoZSByaWdodCBvZiB0aGUgZXF1YXRpb25cclxuICAgICAgZXhwYW5kZWRGb3JtQnV0dG9uLmxlZnQgPSBzdW1FcXVhdGlvbk5vZGUucmlnaHQgKyAyMDtcclxuICAgICAgZXhwYW5kZWRGb3JtQnV0dG9uLmNlbnRlclkgPSBzdW1FcXVhdGlvbk5vZGUuY2VudGVyWTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBWaXNpYmlsaXR5IG9mIHRoZSBlcXVhdGlvbnMgYWJvdmUgdGhlIGNoYXJ0c1xyXG4gICAgbW9kZWwuZXF1YXRpb25Gb3JtUHJvcGVydHkubGluayggZXF1YXRpb25Gb3JtID0+IHtcclxuICAgICAgY29uc3QgdmlzaWJsZSA9ICggZXF1YXRpb25Gb3JtICE9PSBFcXVhdGlvbkZvcm0uSElEREVOICk7XHJcbiAgICAgIGhhcm1vbmljc0VxdWF0aW9uTm9kZS52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgc3VtRXF1YXRpb25QYXJlbnROb2RlLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBNZWFzdXJlbWVudCB0b29sc1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBDcmVhdGUgbWVhc3VyZW1lbnQgdG9vbHMgYWZ0ZXIgbGF5b3V0IG9mIGNoYXJ0cywgYmVjYXVzZSB0aGVpciBpbml0aWFsIHBvc2l0aW9ucyBhbmQgZHJhZyBib3VuZHMgZGVwZW5kIG9uXHJcbiAgICAvLyBmaW5hbCBwb3NpdGlvbnMgYW5kIGJvdW5kcyBvZiBDaGFydFJlY3RhbmdsZXMuXHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIG1lYXN1cmVtZW50IHRvb2xzXHJcbiAgICBjb25zdCBtZWFzdXJlbWVudFRvb2xzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21lYXN1cmVtZW50VG9vbHMnICk7XHJcblxyXG4gICAgLy8gRHJhZyBib3VuZHMgZm9yIGFsbCBtZWFzdXJlbWVudCB0b29scy5cclxuICAgIGNvbnN0IG1lYXN1cmVtZW50VG9vbHNEcmFnQm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAyMCxcclxuICAgICAgYW1wbGl0dWRlc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuYm90dG9tLFxyXG4gICAgICBoYXJtb25pY3NDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLnJpZ2h0ICsgMjAsXHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIDIwXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEZvciBtZWFzdXJpbmcgYSBoYXJtb25pYydzIHdhdmVsZW5ndGggaW4gdGhlICdzcGFjZScgYW5kICdzcGFjZSAmIHRpbWUnIERvbWFpbnMuXHJcbiAgICBjb25zdCB3YXZlbGVuZ3RoQ2FsaXBlcnNOb2RlID0gbmV3IFdhdmVsZW5ndGhDYWxpcGVyc05vZGUoIG1vZGVsLCBoYXJtb25pY3NDaGFydE5vZGUuY2hhcnRUcmFuc2Zvcm0sIHtcclxuICAgICAgcG9zaXRpb246IGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMubGVmdENlbnRlcixcclxuICAgICAgZHJhZ0JvdW5kczogbWVhc3VyZW1lbnRUb29sc0RyYWdCb3VuZHMsXHJcbiAgICAgIHRhbmRlbTogbWVhc3VyZW1lbnRUb29sc1RhbmRlbS5jcmVhdGVUYW5kZW0oICd3YXZlbGVuZ3RoQ2FsaXBlcnNOb2RlJyApXHJcbiAgICB9ICk7XHJcbiAgICBtZWFzdXJlbWVudFRvb2xzUGFyZW50LmFkZENoaWxkKCB3YXZlbGVuZ3RoQ2FsaXBlcnNOb2RlICk7XHJcblxyXG4gICAgLy8gRm9yIG1lYXN1cmluZyBhIGhhcm1vbmljJ3MgcGVyaW9kIGluIHRoZSB0aW1lIERvbWFpbi5cclxuICAgIGNvbnN0IHBlcmlvZENhbGlwZXJzTm9kZSA9IG5ldyBQZXJpb2RDYWxpcGVyc05vZGUoIG1vZGVsLCBoYXJtb25pY3NDaGFydE5vZGUuY2hhcnRUcmFuc2Zvcm0sIHtcclxuICAgICAgcG9zaXRpb246IGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMubGVmdENlbnRlcixcclxuICAgICAgZHJhZ0JvdW5kczogbWVhc3VyZW1lbnRUb29sc0RyYWdCb3VuZHMsXHJcbiAgICAgIHRhbmRlbTogbWVhc3VyZW1lbnRUb29sc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdwZXJpb2RDYWxpcGVyc05vZGUnIClcclxuICAgIH0gKTtcclxuICAgIG1lYXN1cmVtZW50VG9vbHNQYXJlbnQuYWRkQ2hpbGQoIHBlcmlvZENhbGlwZXJzTm9kZSApO1xyXG5cclxuICAgIC8vIEZvciBtZWFzdXJpbmcgYSBoYXJtb25pYydzIHBlcmlvZCBpbiB0aGUgJ3NwYWNlICYgdGltZScgRG9tYWluLlxyXG4gICAgY29uc3QgcGVyaW9kQ2xvY2tOb2RlID0gbmV3IFBlcmlvZENsb2NrTm9kZSggbW9kZWwsIHtcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKFxyXG4gICAgICAgIGhhcm1vbmljc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMucmlnaHQsXHJcbiAgICAgICAgaGFybW9uaWNzQ2hhcnROb2RlLmJvdHRvbSArICggc3VtQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5taW5ZIC0gaGFybW9uaWNzQ2hhcnROb2RlLmJvdHRvbSApIC8gMlxyXG4gICAgICApLFxyXG4gICAgICBkcmFnQm91bmRzOiBtZWFzdXJlbWVudFRvb2xzRHJhZ0JvdW5kcyxcclxuICAgICAgdGFuZGVtOiBtZWFzdXJlbWVudFRvb2xzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BlcmlvZENsb2NrTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgbWVhc3VyZW1lbnRUb29sc1BhcmVudC5hZGRDaGlsZCggcGVyaW9kQ2xvY2tOb2RlICk7XHJcblxyXG4gICAgLy8gU2hvdyBkcmFnIGJvdW5kcyBmb3IgdGhlIG1lYXN1cmVtZW50IHRvb2xzLlxyXG4gICAgaWYgKCBGTVdRdWVyeVBhcmFtZXRlcnMuZGVidWdUb29scyApIHtcclxuICAgICAgbWVhc3VyZW1lbnRUb29sc1BhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggbWVhc3VyZW1lbnRUb29sc0RyYWdCb3VuZHMsIHtcclxuICAgICAgICBzdHJva2U6ICdyZWQnXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc2V0TWVhc3VyZW1lbnRUb29scyA9ICgpID0+IHtcclxuICAgICAgd2F2ZWxlbmd0aENhbGlwZXJzTm9kZS5yZXNldCgpO1xyXG4gICAgICBwZXJpb2RDYWxpcGVyc05vZGUucmVzZXQoKTtcclxuICAgICAgcGVyaW9kQ2xvY2tOb2RlLnJlc2V0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBQRE9NXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIHBkb20gLXRyYXZlcnNhbCBvcmRlclxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvNTNcclxuICAgIHNjcmVlblZpZXdSb290Tm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIGFtcGxpdHVkZXNDaGFydE5vZGUsXHJcbiAgICAgIGVyYXNlckJ1dHRvbixcclxuICAgICAgY29udHJvbFBhbmVsLFxyXG4gICAgICB3YXZlbGVuZ3RoQ2FsaXBlcnNOb2RlLFxyXG4gICAgICBwZXJpb2RDYWxpcGVyc05vZGUsXHJcbiAgICAgIHBlcmlvZENsb2NrTm9kZSxcclxuICAgICAgaGFybW9uaWNzRXhwYW5kQ29sbGFwc2VCdXR0b24sXHJcbiAgICAgIGhhcm1vbmljc0NoYXJ0Tm9kZSxcclxuICAgICAgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24sXHJcbiAgICAgIGV4cGFuZGVkRm9ybUJ1dHRvbixcclxuICAgICAgc3VtQ2hhcnROb2RlLFxyXG4gICAgICBpbmZpbml0ZUhhcm1vbmljc0NoZWNrYm94LFxyXG4gICAgICB0aW1lQ29udHJvbE5vZGUsXHJcbiAgICAgIHJlc2V0QWxsQnV0dG9uXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ0Rpc2NyZXRlU2NyZWVuVmlldycsIERpc2NyZXRlU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsWUFBWSxNQUFNLHFEQUFxRDtBQUM5RSxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLFVBQVUsTUFBTSwyQ0FBMkM7QUFDbEUsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLHNDQUFzQztBQUMvRCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0Msa0JBQWtCLE1BQU0sb0NBQW9DO0FBQ25FLE9BQU9D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