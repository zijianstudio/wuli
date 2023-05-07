// Copyright 2020-2023, University of Colorado Boulder

/**
 * WavePacketScreenView is the view for the 'Wave Packet' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Rectangle, RichText } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FMWConstants from '../../common/FMWConstants.js';
import FMWQueryParameters from '../../common/FMWQueryParameters.js';
import FMWSymbols from '../../common/FMWSymbols.js';
import LabeledExpandCollapseButton from '../../common/view/LabeledExpandCollapseButton.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FourierMakingWavesStrings from '../../FourierMakingWavesStrings.js';
import WavePacketModel from '../model/WavePacketModel.js';
import ComponentsEquationText from './ComponentsEquationText.js';
import ComponentSpacingToolNode from './ComponentSpacingToolNode.js';
import ContinuousWaveformCheckbox from './ContinuousWaveformCheckbox.js';
import WaveformEnvelopeCheckbox from './WaveformEnvelopeCheckbox.js';
import WavePacketAmplitudesChartNode from './WavePacketAmplitudesChartNode.js';
import WavePacketComponentsChartNode from './WavePacketComponentsChartNode.js';
import WavePacketControlPanel from './WavePacketControlPanel.js';
import WavePacketLengthToolNode from './WavePacketLengthToolNode.js';
import WavePacketSumChartNode from './WavePacketSumChartNode.js';
import WavePacketSumEquationNode from './WavePacketSumEquationNode.js';
export default class WavePacketScreenView extends ScreenView {
  /**
   * @param {WavePacketModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    assert && assert(model instanceof WavePacketModel);
    assert && assert(tandem instanceof Tandem);
    super({
      tandem: tandem
    });

    //------------------------------------------------------------------------------------------------------------------
    // View Properties
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all charts
    const viewPropertiesTandem = tandem.createTandem('viewProperties');

    // View Properties
    const componentSpacingToolVisibleProperty = new BooleanProperty(false, {
      tandem: viewPropertiesTandem.createTandem('componentSpacingToolVisibleProperty')
    });
    const lengthToolVisibleProperty = new BooleanProperty(false, {
      tandem: viewPropertiesTandem.createTandem('lengthToolVisibleProperty')
    });

    //------------------------------------------------------------------------------------------------------------------
    // Amplitudes chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all charts
    const chartsTandem = tandem.createTandem('charts');

    // Parent tandem for all elements related to the Amplitudes chart
    const amplitudesTandem = chartsTandem.createTandem('amplitudes');

    // Button to show/hide the Amplitudes chart and its related UI element
    const amplitudesExpandCollapseButton = new LabeledExpandCollapseButton(FourierMakingWavesStrings.amplitudesOfFourierComponentsStringProperty, model.amplitudesChart.chartExpandedProperty, {
      textOptions: {
        maxWidth: 300
      },
      tandem: amplitudesTandem.createTandem('amplitudesExpandCollapseButton')
    });

    // 'Amplitudes of Fourier Components' chart
    const amplitudesChartNode = new WavePacketAmplitudesChartNode(model.amplitudesChart, {
      chartTransformOptions: {
        modelXRange: model.wavePacket.waveNumberRange
        // modelYRange will automatically scale to fit the data set
      },

      tandem: amplitudesTandem.createTandem('amplitudesChartNode')
    });
    const amplitudesEquationStringProperty = new DerivedProperty([FMWSymbols.AStringProperty, FMWSymbols.nStringProperty], (A, n) => `${A}<sub>${n}</sub>`);

    // Equation above the Amplitudes chart
    const amplitudesEquationText = new RichText(amplitudesEquationStringProperty, {
      font: FMWConstants.EQUATION_FONT,
      maxWidth: 100,
      tandem: amplitudesTandem.createTandem('amplitudesEquationText')
    });
    const continuousWaveformCheckbox = new ContinuousWaveformCheckbox(model.amplitudesChart.continuousWaveformVisibleProperty, {
      tandem: amplitudesTandem.createTandem('continuousWaveformCheckbox')
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // That can be done using amplitudesExpandCollapseButton, or by changing amplitudesChart.chartExpandedProperty via PhET-iO.
    const amplitudesParentNode = new Node({
      visibleProperty: model.amplitudesChart.chartExpandedProperty,
      children: [amplitudesChartNode, amplitudesEquationText, continuousWaveformCheckbox]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Components chart
    //------------------------------------------------------------------------------------------------------------------

    // Parent tandem for all elements related to the Components chart
    const componentsTandem = chartsTandem.createTandem('components');

    // Button to show/hide the Components chart and its related UI element
    const componentsExpandCollapseButton = new LabeledExpandCollapseButton(FourierMakingWavesStrings.fourierComponentsStringProperty, model.componentsChart.chartExpandedProperty, {
      tandem: componentsTandem.createTandem('componentsExpandCollapseButton')
    });

    // Components chart
    const componentsChartNode = new WavePacketComponentsChartNode(model.componentsChart, {
      tandem: componentsTandem.createTandem('componentsChartNode')
    });

    // Equation above the Components chart
    const componentsEquationText = new ComponentsEquationText(model.domainProperty, model.seriesTypeProperty, {
      maxWidth: 0.5 * FMWConstants.CHART_RECTANGLE_SIZE.width,
      tandem: componentsTandem.createTandem('componentsEquationText')
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // That can be done using harmonicsExpandCollapseButton, or by changing harmonicsChart.chartExpandedProperty via PhET-iO.
    const componentsParentNode = new Node({
      visibleProperty: model.componentsChart.chartExpandedProperty,
      children: [componentsChartNode, componentsEquationText]
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
    const sumChartNode = new WavePacketSumChartNode(model.sumChart, {
      tandem: sumTandem.createTandem('sumChartNode')
    });

    // Equation above the Sum chart
    const sumEquationNode = new WavePacketSumEquationNode(model.domainProperty, model.seriesTypeProperty, model.wavePacket.componentSpacingProperty, {
      maxWidth: 0.5 * FMWConstants.CHART_RECTANGLE_SIZE.width,
      tandem: sumTandem.createTandem('sumEquationNode')
    });

    // Waveform Envelope checkbox
    const waveformEnvelopeCheckbox = new WaveformEnvelopeCheckbox(model.sumChart.waveformEnvelopeVisibleProperty, {
      tandem: sumTandem.createTandem('waveformEnvelopeCheckbox')
    });

    // All of the elements that should be hidden when chartExpandedProperty is set to false.
    // That can be done using sumExpandCollapseButton, or by changing sumChart.chartExpandedProperty via PhET-iO.
    const sumParentNode = new Node({
      visibleProperty: model.sumChart.chartExpandedProperty,
      children: [sumChartNode, sumEquationNode, waveformEnvelopeCheckbox]
    });

    //------------------------------------------------------------------------------------------------------------------
    // Other UI elements
    //------------------------------------------------------------------------------------------------------------------

    // Parent for all popups
    const popupParent = new Node();
    const controlPanel = new WavePacketControlPanel(model, componentSpacingToolVisibleProperty, lengthToolVisibleProperty, popupParent, {
      tandem: tandem.createTandem('controlPanel')
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        resetMeasurementTools();
      },
      tandem: tandem.createTandem('resetAllButton')
    });

    //------------------------------------------------------------------------------------------------------------------
    // Layout
    //------------------------------------------------------------------------------------------------------------------

    const chartTitleBottomSpacing = 15; // space below the title of a chart

    // Amplitudes chart at top left
    amplitudesExpandCollapseButton.left = this.layoutBounds.left + FMWConstants.SCREEN_VIEW_X_MARGIN;
    amplitudesExpandCollapseButton.top = this.layoutBounds.top + 10;
    amplitudesChartNode.x = FMWConstants.X_CHART_RECTANGLES;
    amplitudesChartNode.y = amplitudesExpandCollapseButton.bottom + chartTitleBottomSpacing;
    const amplitudesChartRectangleLocalBounds = amplitudesChartNode.chartRectangle.boundsTo(this);
    continuousWaveformCheckbox.boundsProperty.link(bounds => {
      continuousWaveformCheckbox.right = amplitudesChartRectangleLocalBounds.right - 5;
      continuousWaveformCheckbox.top = amplitudesChartNode.bottom + 8;
    });

    // Components chart below the Amplitudes chart
    componentsExpandCollapseButton.left = this.layoutBounds.left + FMWConstants.SCREEN_VIEW_X_MARGIN;
    componentsExpandCollapseButton.top = continuousWaveformCheckbox.bottom;
    componentsChartNode.x = amplitudesChartNode.x;
    componentsChartNode.y = componentsExpandCollapseButton.bottom + chartTitleBottomSpacing;
    const componentsChartRectangleLocalBounds = componentsChartNode.chartRectangle.boundsTo(this);

    // Sum chart below the Components chart
    sumExpandCollapseButton.left = componentsExpandCollapseButton.left;
    sumExpandCollapseButton.top = componentsChartNode.bottom + 30;
    sumChartNode.x = componentsChartNode.x;
    sumChartNode.y = sumExpandCollapseButton.bottom + chartTitleBottomSpacing;
    const sumChartRectangleLocalBounds = sumChartNode.chartRectangle.boundsTo(this);
    waveformEnvelopeCheckbox.boundsProperty.link(bounds => {
      waveformEnvelopeCheckbox.right = sumChartRectangleLocalBounds.right - 5;
      waveformEnvelopeCheckbox.top = sumChartNode.bottom + 8;
    });

    // Reset All button at bottom right
    resetAllButton.right = this.layoutBounds.maxX - FMWConstants.SCREEN_VIEW_X_MARGIN;
    resetAllButton.bottom = this.layoutBounds.maxY - FMWConstants.SCREEN_VIEW_Y_MARGIN;

    // Control panel centered in the space to the right of the charts.
    // Constrain dimensions of the control panel as a fallback, so that sim is still usable if something unforeseen
    // happens - e.g. font size differences on platforms, or a subcomponent misbehaving.
    controlPanel.centerX = componentsChartNode.right + (this.layoutBounds.right - componentsChartNode.right) / 2;
    controlPanel.top = this.layoutBounds.top + 10; // a bit less than SCREEN_VIEW_X_MARGIN, to gain some height
    controlPanel.maxWidth = this.layoutBounds.right - controlPanel.width - FMWConstants.SCREEN_VIEW_X_MARGIN;
    controlPanel.maxHeight = resetAllButton.top - controlPanel.top - 5;

    //------------------------------------------------------------------------------------------------------------------
    // Rendering order
    //------------------------------------------------------------------------------------------------------------------

    // Measurement tools are created later, added to this parent so we know the rendering order.
    const measurementToolsParent = new Node();

    // Add everything to one root Node, then add that root Node to the scene graph.
    // This should improve startup performance, compared to calling this.addChild for each Node.
    const screenViewRootNode = new Node({
      children: [amplitudesExpandCollapseButton, amplitudesParentNode, componentsExpandCollapseButton, componentsParentNode, sumExpandCollapseButton, sumParentNode, measurementToolsParent, controlPanel, resetAllButton,
      // parent for popups on top
      popupParent]
    });
    this.addChild(screenViewRootNode);

    //------------------------------------------------------------------------------------------------------------------
    // Equation positions
    //------------------------------------------------------------------------------------------------------------------

    // Center dynamic equations above their respective charts. Since we need to listen to the bounds of these equations
    // in order to respect their maxWidth, wrapper Nodes are transformed for equations that are dynamic.
    // See https://github.com/phetsims/fourier-making-waves/issues/40

    // Space between top of the ChartRectangle and bottom of the equation
    const equationYSpacing = 3;
    amplitudesEquationText.boundsProperty.link(() => {
      amplitudesEquationText.centerX = amplitudesChartRectangleLocalBounds.centerX;
      amplitudesEquationText.bottom = amplitudesChartRectangleLocalBounds.top - equationYSpacing;
    });
    componentsEquationText.boundsProperty.link(() => {
      componentsEquationText.centerX = componentsChartRectangleLocalBounds.centerX;
      componentsEquationText.bottom = componentsChartRectangleLocalBounds.top - equationYSpacing;
    });
    sumEquationNode.boundsProperty.link(() => {
      sumEquationNode.centerX = sumChartRectangleLocalBounds.centerX;
      sumEquationNode.bottom = sumChartRectangleLocalBounds.top - equationYSpacing;
    });

    //------------------------------------------------------------------------------------------------------------------
    // Measurement Tools
    //------------------------------------------------------------------------------------------------------------------

    // Create measurement tools after layout of charts, because their initial positions and drag bounds depend on
    // final positions and bounds of ChartRectangles.

    // Parent tandem for all measurement tools
    const measurementToolsTandem = tandem.createTandem('measurementTools');

    // Keep tool in the vicinity of the Amplitudes chart, and keep its label visible.
    const componentSpacingToolDragBounds = new Bounds2(amplitudesChartRectangleLocalBounds.left, amplitudesChartRectangleLocalBounds.top + 10, amplitudesChartRectangleLocalBounds.right + 15, amplitudesChartRectangleLocalBounds.bottom);

    // Component Spacing (k1 or omega1) measurement tool
    const componentSpacingToolNode = new ComponentSpacingToolNode(model.wavePacket.componentSpacingProperty, amplitudesChartNode.chartTransform, model.domainProperty, {
      position: new Vector2(amplitudesChartRectangleLocalBounds.right - 80, amplitudesChartRectangleLocalBounds.top + 50),
      dragBounds: componentSpacingToolDragBounds,
      visibleProperty: componentSpacingToolVisibleProperty,
      tandem: measurementToolsTandem.createTandem('componentSpacingToolNode')
    });
    measurementToolsParent.addChild(componentSpacingToolNode);

    // lengthToolNode can be dragged around on the Components and Sum charts.
    const lengthToolDragBounds = new Bounds2(componentsChartRectangleLocalBounds.left - 15, componentsChartRectangleLocalBounds.top, componentsChartRectangleLocalBounds.right + 20, this.layoutBounds.bottom - 20);

    // Wavelength (lamda1) or period (T1) tool
    const lengthToolNode = new WavePacketLengthToolNode(model.wavePacket.lengthProperty, componentsChartNode.chartTransform, model.domainProperty, {
      // See https://github.com/phetsims/fourier-making-waves/issues/134 for position.
      position: sumChartRectangleLocalBounds.center,
      dragBounds: lengthToolDragBounds,
      visibleProperty: lengthToolVisibleProperty,
      tandem: measurementToolsTandem.createTandem('lengthToolNode')
    });
    measurementToolsParent.addChild(lengthToolNode);

    // Show drag bounds for the measurement tools.
    if (FMWQueryParameters.debugTools) {
      measurementToolsParent.addChild(new Rectangle(componentSpacingToolDragBounds, {
        stroke: 'red'
      }));
      measurementToolsParent.addChild(new Rectangle(lengthToolDragBounds, {
        stroke: 'red'
      }));
    }
    const resetMeasurementTools = () => {
      componentSpacingToolVisibleProperty.reset();
      componentSpacingToolNode.reset();
      lengthToolVisibleProperty.reset();
      lengthToolNode.reset();
    };

    //------------------------------------------------------------------------------------------------------------------
    // PDOM
    //------------------------------------------------------------------------------------------------------------------

    // pdom - traversal order
    // See https://github.com/phetsims/fourier-making-waves/issues/53 and https://github.com/phetsims/fourier-making-waves/issues/84.
    screenViewRootNode.pdomOrder = [controlPanel, componentSpacingToolNode, lengthToolNode, amplitudesExpandCollapseButton, continuousWaveformCheckbox, componentsExpandCollapseButton, componentsChartNode, sumExpandCollapseButton, sumChartNode, waveformEnvelopeCheckbox, resetAllButton];
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
fourierMakingWaves.register('WavePacketScreenView', WavePacketScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJCb3VuZHMyIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJSZXNldEFsbEJ1dHRvbiIsIk5vZGUiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRhbmRlbSIsIkZNV0NvbnN0YW50cyIsIkZNV1F1ZXJ5UGFyYW1ldGVycyIsIkZNV1N5bWJvbHMiLCJMYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIiwiV2F2ZVBhY2tldE1vZGVsIiwiQ29tcG9uZW50c0VxdWF0aW9uVGV4dCIsIkNvbXBvbmVudFNwYWNpbmdUb29sTm9kZSIsIkNvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94IiwiV2F2ZWZvcm1FbnZlbG9wZUNoZWNrYm94IiwiV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydE5vZGUiLCJXYXZlUGFja2V0Q29tcG9uZW50c0NoYXJ0Tm9kZSIsIldhdmVQYWNrZXRDb250cm9sUGFuZWwiLCJXYXZlUGFja2V0TGVuZ3RoVG9vbE5vZGUiLCJXYXZlUGFja2V0U3VtQ2hhcnROb2RlIiwiV2F2ZVBhY2tldFN1bUVxdWF0aW9uTm9kZSIsIldhdmVQYWNrZXRTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImFzc2VydCIsInZpZXdQcm9wZXJ0aWVzVGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiY29tcG9uZW50U3BhY2luZ1Rvb2xWaXNpYmxlUHJvcGVydHkiLCJsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5IiwiY2hhcnRzVGFuZGVtIiwiYW1wbGl0dWRlc1RhbmRlbSIsImFtcGxpdHVkZXNFeHBhbmRDb2xsYXBzZUJ1dHRvbiIsImFtcGxpdHVkZXNPZkZvdXJpZXJDb21wb25lbnRzU3RyaW5nUHJvcGVydHkiLCJhbXBsaXR1ZGVzQ2hhcnQiLCJjaGFydEV4cGFuZGVkUHJvcGVydHkiLCJ0ZXh0T3B0aW9ucyIsIm1heFdpZHRoIiwiYW1wbGl0dWRlc0NoYXJ0Tm9kZSIsImNoYXJ0VHJhbnNmb3JtT3B0aW9ucyIsIm1vZGVsWFJhbmdlIiwid2F2ZVBhY2tldCIsIndhdmVOdW1iZXJSYW5nZSIsImFtcGxpdHVkZXNFcXVhdGlvblN0cmluZ1Byb3BlcnR5IiwiQVN0cmluZ1Byb3BlcnR5IiwiblN0cmluZ1Byb3BlcnR5IiwiQSIsIm4iLCJhbXBsaXR1ZGVzRXF1YXRpb25UZXh0IiwiZm9udCIsIkVRVUFUSU9OX0ZPTlQiLCJjb250aW51b3VzV2F2ZWZvcm1DaGVja2JveCIsImNvbnRpbnVvdXNXYXZlZm9ybVZpc2libGVQcm9wZXJ0eSIsImFtcGxpdHVkZXNQYXJlbnROb2RlIiwidmlzaWJsZVByb3BlcnR5IiwiY2hpbGRyZW4iLCJjb21wb25lbnRzVGFuZGVtIiwiY29tcG9uZW50c0V4cGFuZENvbGxhcHNlQnV0dG9uIiwiZm91cmllckNvbXBvbmVudHNTdHJpbmdQcm9wZXJ0eSIsImNvbXBvbmVudHNDaGFydCIsImNvbXBvbmVudHNDaGFydE5vZGUiLCJjb21wb25lbnRzRXF1YXRpb25UZXh0IiwiZG9tYWluUHJvcGVydHkiLCJzZXJpZXNUeXBlUHJvcGVydHkiLCJDSEFSVF9SRUNUQU5HTEVfU0laRSIsIndpZHRoIiwiY29tcG9uZW50c1BhcmVudE5vZGUiLCJzdW1UYW5kZW0iLCJzdW1FeHBhbmRDb2xsYXBzZUJ1dHRvbiIsInN1bVN0cmluZ1Byb3BlcnR5Iiwic3VtQ2hhcnQiLCJzdW1DaGFydE5vZGUiLCJzdW1FcXVhdGlvbk5vZGUiLCJjb21wb25lbnRTcGFjaW5nUHJvcGVydHkiLCJ3YXZlZm9ybUVudmVsb3BlQ2hlY2tib3giLCJ3YXZlZm9ybUVudmVsb3BlVmlzaWJsZVByb3BlcnR5Iiwic3VtUGFyZW50Tm9kZSIsInBvcHVwUGFyZW50IiwiY29udHJvbFBhbmVsIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJlc2V0IiwicmVzZXRNZWFzdXJlbWVudFRvb2xzIiwiY2hhcnRUaXRsZUJvdHRvbVNwYWNpbmciLCJsZWZ0IiwibGF5b3V0Qm91bmRzIiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJ0b3AiLCJ4IiwiWF9DSEFSVF9SRUNUQU5HTEVTIiwieSIsImJvdHRvbSIsImFtcGxpdHVkZXNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzIiwiY2hhcnRSZWN0YW5nbGUiLCJib3VuZHNUbyIsImJvdW5kc1Byb3BlcnR5IiwibGluayIsImJvdW5kcyIsInJpZ2h0IiwiY29tcG9uZW50c0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMiLCJzdW1DaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzIiwibWF4WCIsIm1heFkiLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsImNlbnRlclgiLCJtYXhIZWlnaHQiLCJtZWFzdXJlbWVudFRvb2xzUGFyZW50Iiwic2NyZWVuVmlld1Jvb3ROb2RlIiwiYWRkQ2hpbGQiLCJlcXVhdGlvbllTcGFjaW5nIiwibWVhc3VyZW1lbnRUb29sc1RhbmRlbSIsImNvbXBvbmVudFNwYWNpbmdUb29sRHJhZ0JvdW5kcyIsImNvbXBvbmVudFNwYWNpbmdUb29sTm9kZSIsImNoYXJ0VHJhbnNmb3JtIiwicG9zaXRpb24iLCJkcmFnQm91bmRzIiwibGVuZ3RoVG9vbERyYWdCb3VuZHMiLCJsZW5ndGhUb29sTm9kZSIsImxlbmd0aFByb3BlcnR5IiwiY2VudGVyIiwiZGVidWdUb29scyIsInN0cm9rZSIsInBkb21PcmRlciIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVQYWNrZXRTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFdhdmVQYWNrZXRTY3JlZW5WaWV3IGlzIHRoZSB2aWV3IGZvciB0aGUgJ1dhdmUgUGFja2V0JyBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBGTVdRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL0ZNV1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBGTVdTeW1ib2xzIGZyb20gJy4uLy4uL2NvbW1vbi9GTVdTeW1ib2xzLmpzJztcclxuaW1wb3J0IExhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24uanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzIGZyb20gJy4uLy4uL0ZvdXJpZXJNYWtpbmdXYXZlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldE1vZGVsIGZyb20gJy4uL21vZGVsL1dhdmVQYWNrZXRNb2RlbC5qcyc7XHJcbmltcG9ydCBDb21wb25lbnRzRXF1YXRpb25UZXh0IGZyb20gJy4vQ29tcG9uZW50c0VxdWF0aW9uVGV4dC5qcyc7XHJcbmltcG9ydCBDb21wb25lbnRTcGFjaW5nVG9vbE5vZGUgZnJvbSAnLi9Db21wb25lbnRTcGFjaW5nVG9vbE5vZGUuanMnO1xyXG5pbXBvcnQgQ29udGludW91c1dhdmVmb3JtQ2hlY2tib3ggZnJvbSAnLi9Db250aW51b3VzV2F2ZWZvcm1DaGVja2JveC5qcyc7XHJcbmltcG9ydCBXYXZlZm9ybUVudmVsb3BlQ2hlY2tib3ggZnJvbSAnLi9XYXZlZm9ybUVudmVsb3BlQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgV2F2ZVBhY2tldEFtcGxpdHVkZXNDaGFydE5vZGUgZnJvbSAnLi9XYXZlUGFja2V0QW1wbGl0dWRlc0NoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlUGFja2V0Q29tcG9uZW50c0NoYXJ0Tm9kZSBmcm9tICcuL1dhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnROb2RlLmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXRDb250cm9sUGFuZWwgZnJvbSAnLi9XYXZlUGFja2V0Q29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFdhdmVQYWNrZXRMZW5ndGhUb29sTm9kZSBmcm9tICcuL1dhdmVQYWNrZXRMZW5ndGhUb29sTm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlUGFja2V0U3VtQ2hhcnROb2RlIGZyb20gJy4vV2F2ZVBhY2tldFN1bUNoYXJ0Tm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlUGFja2V0U3VtRXF1YXRpb25Ob2RlIGZyb20gJy4vV2F2ZVBhY2tldFN1bUVxdWF0aW9uTm9kZS5qcyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXZlUGFja2V0U2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1dhdmVQYWNrZXRNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbCBpbnN0YW5jZW9mIFdhdmVQYWNrZXRNb2RlbCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGFuZGVtIGluc3RhbmNlb2YgVGFuZGVtICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gVmlldyBQcm9wZXJ0aWVzXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBjaGFydHNcclxuICAgIGNvbnN0IHZpZXdQcm9wZXJ0aWVzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXdQcm9wZXJ0aWVzJyApO1xyXG5cclxuICAgIC8vIFZpZXcgUHJvcGVydGllc1xyXG4gICAgY29uc3QgY29tcG9uZW50U3BhY2luZ1Rvb2xWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHZpZXdQcm9wZXJ0aWVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbGVuZ3RoVG9vbFZpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdmlld1Byb3BlcnRpZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVuZ3RoVG9vbFZpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBBbXBsaXR1ZGVzIGNoYXJ0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBjaGFydHNcclxuICAgIGNvbnN0IGNoYXJ0c1RhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGFydHMnICk7XHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIGVsZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIEFtcGxpdHVkZXMgY2hhcnRcclxuICAgIGNvbnN0IGFtcGxpdHVkZXNUYW5kZW0gPSBjaGFydHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlcycgKTtcclxuXHJcbiAgICAvLyBCdXR0b24gdG8gc2hvdy9oaWRlIHRoZSBBbXBsaXR1ZGVzIGNoYXJ0IGFuZCBpdHMgcmVsYXRlZCBVSSBlbGVtZW50XHJcbiAgICBjb25zdCBhbXBsaXR1ZGVzRXhwYW5kQ29sbGFwc2VCdXR0b24gPSBuZXcgTGFiZWxlZEV4cGFuZENvbGxhcHNlQnV0dG9uKFxyXG4gICAgICBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmFtcGxpdHVkZXNPZkZvdXJpZXJDb21wb25lbnRzU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmFtcGxpdHVkZXNDaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHksIHtcclxuICAgICAgICB0ZXh0T3B0aW9uczogeyBtYXhXaWR0aDogMzAwIH0sXHJcbiAgICAgICAgdGFuZGVtOiBhbXBsaXR1ZGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FtcGxpdHVkZXNFeHBhbmRDb2xsYXBzZUJ1dHRvbicgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gJ0FtcGxpdHVkZXMgb2YgRm91cmllciBDb21wb25lbnRzJyBjaGFydFxyXG4gICAgY29uc3QgYW1wbGl0dWRlc0NoYXJ0Tm9kZSA9IG5ldyBXYXZlUGFja2V0QW1wbGl0dWRlc0NoYXJ0Tm9kZSggbW9kZWwuYW1wbGl0dWRlc0NoYXJ0LCB7XHJcbiAgICAgIGNoYXJ0VHJhbnNmb3JtT3B0aW9uczoge1xyXG4gICAgICAgIG1vZGVsWFJhbmdlOiBtb2RlbC53YXZlUGFja2V0LndhdmVOdW1iZXJSYW5nZVxyXG4gICAgICAgIC8vIG1vZGVsWVJhbmdlIHdpbGwgYXV0b21hdGljYWxseSBzY2FsZSB0byBmaXQgdGhlIGRhdGEgc2V0XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogYW1wbGl0dWRlc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdhbXBsaXR1ZGVzQ2hhcnROb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYW1wbGl0dWRlc0VxdWF0aW9uU3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIEZNV1N5bWJvbHMuQVN0cmluZ1Byb3BlcnR5LCBGTVdTeW1ib2xzLm5TdHJpbmdQcm9wZXJ0eSBdLFxyXG4gICAgICAoIEEsIG4gKSA9PiBgJHtBfTxzdWI+JHtufTwvc3ViPmBcclxuICAgICk7XHJcblxyXG4gICAgLy8gRXF1YXRpb24gYWJvdmUgdGhlIEFtcGxpdHVkZXMgY2hhcnRcclxuICAgIGNvbnN0IGFtcGxpdHVkZXNFcXVhdGlvblRleHQgPSBuZXcgUmljaFRleHQoIGFtcGxpdHVkZXNFcXVhdGlvblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IEZNV0NvbnN0YW50cy5FUVVBVElPTl9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogMTAwLFxyXG4gICAgICB0YW5kZW06IGFtcGxpdHVkZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnYW1wbGl0dWRlc0VxdWF0aW9uVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94ID0gbmV3IENvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94KFxyXG4gICAgICBtb2RlbC5hbXBsaXR1ZGVzQ2hhcnQuY29udGludW91c1dhdmVmb3JtVmlzaWJsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBhbXBsaXR1ZGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94JyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbGwgb2YgdGhlIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIGhpZGRlbiB3aGVuIGNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSBpcyBzZXQgdG8gZmFsc2UuXHJcbiAgICAvLyBUaGF0IGNhbiBiZSBkb25lIHVzaW5nIGFtcGxpdHVkZXNFeHBhbmRDb2xsYXBzZUJ1dHRvbiwgb3IgYnkgY2hhbmdpbmcgYW1wbGl0dWRlc0NoYXJ0LmNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSB2aWEgUGhFVC1pTy5cclxuICAgIGNvbnN0IGFtcGxpdHVkZXNQYXJlbnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC5hbXBsaXR1ZGVzQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICBjaGlsZHJlbjogWyBhbXBsaXR1ZGVzQ2hhcnROb2RlLCBhbXBsaXR1ZGVzRXF1YXRpb25UZXh0LCBjb250aW51b3VzV2F2ZWZvcm1DaGVja2JveCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENvbXBvbmVudHMgY2hhcnRcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIGVsZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIENvbXBvbmVudHMgY2hhcnRcclxuICAgIGNvbnN0IGNvbXBvbmVudHNUYW5kZW0gPSBjaGFydHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnY29tcG9uZW50cycgKTtcclxuXHJcbiAgICAvLyBCdXR0b24gdG8gc2hvdy9oaWRlIHRoZSBDb21wb25lbnRzIGNoYXJ0IGFuZCBpdHMgcmVsYXRlZCBVSSBlbGVtZW50XHJcbiAgICBjb25zdCBjb21wb25lbnRzRXhwYW5kQ29sbGFwc2VCdXR0b24gPSBuZXcgTGFiZWxlZEV4cGFuZENvbGxhcHNlQnV0dG9uKFxyXG4gICAgICBGb3VyaWVyTWFraW5nV2F2ZXNTdHJpbmdzLmZvdXJpZXJDb21wb25lbnRzU3RyaW5nUHJvcGVydHksIG1vZGVsLmNvbXBvbmVudHNDaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IGNvbXBvbmVudHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnY29tcG9uZW50c0V4cGFuZENvbGxhcHNlQnV0dG9uJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb21wb25lbnRzIGNoYXJ0XHJcbiAgICBjb25zdCBjb21wb25lbnRzQ2hhcnROb2RlID0gbmV3IFdhdmVQYWNrZXRDb21wb25lbnRzQ2hhcnROb2RlKCBtb2RlbC5jb21wb25lbnRzQ2hhcnQsIHtcclxuICAgICAgdGFuZGVtOiBjb21wb25lbnRzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbXBvbmVudHNDaGFydE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFcXVhdGlvbiBhYm92ZSB0aGUgQ29tcG9uZW50cyBjaGFydFxyXG4gICAgY29uc3QgY29tcG9uZW50c0VxdWF0aW9uVGV4dCA9IG5ldyBDb21wb25lbnRzRXF1YXRpb25UZXh0KCBtb2RlbC5kb21haW5Qcm9wZXJ0eSwgbW9kZWwuc2VyaWVzVHlwZVByb3BlcnR5LCB7XHJcbiAgICAgIG1heFdpZHRoOiAwLjUgKiBGTVdDb25zdGFudHMuQ0hBUlRfUkVDVEFOR0xFX1NJWkUud2lkdGgsXHJcbiAgICAgIHRhbmRlbTogY29tcG9uZW50c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21wb25lbnRzRXF1YXRpb25UZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWxsIG9mIHRoZSBlbGVtZW50cyB0aGF0IHNob3VsZCBiZSBoaWRkZW4gd2hlbiBjaGFydEV4cGFuZGVkUHJvcGVydHkgaXMgc2V0IHRvIGZhbHNlLlxyXG4gICAgLy8gVGhhdCBjYW4gYmUgZG9uZSB1c2luZyBoYXJtb25pY3NFeHBhbmRDb2xsYXBzZUJ1dHRvbiwgb3IgYnkgY2hhbmdpbmcgaGFybW9uaWNzQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5IHZpYSBQaEVULWlPLlxyXG4gICAgY29uc3QgY29tcG9uZW50c1BhcmVudE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLmNvbXBvbmVudHNDaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGNoaWxkcmVuOiBbIGNvbXBvbmVudHNDaGFydE5vZGUsIGNvbXBvbmVudHNFcXVhdGlvblRleHQgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBTdW0gY2hhcnRcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gUGFyZW50IHRhbmRlbSBmb3IgYWxsIGVsZW1lbnRzIHJlbGF0ZWQgdG8gdGhlIFN1bSBjaGFydFxyXG4gICAgY29uc3Qgc3VtVGFuZGVtID0gY2hhcnRzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bScgKTtcclxuXHJcbiAgICAvLyBCdXR0b24gdG8gc2hvdy9oaWRlIHRoZSBTdW0gY2hhcnQgYW5kIGl0cyByZWxhdGVkIFVJIGVsZW1lbnRcclxuICAgIGNvbnN0IHN1bUV4cGFuZENvbGxhcHNlQnV0dG9uID0gbmV3IExhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbihcclxuICAgICAgRm91cmllck1ha2luZ1dhdmVzU3RyaW5ncy5zdW1TdHJpbmdQcm9wZXJ0eSwgbW9kZWwuc3VtQ2hhcnQuY2hhcnRFeHBhbmRlZFByb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiBzdW1UYW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24nIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFN1bSBjaGFydFxyXG4gICAgY29uc3Qgc3VtQ2hhcnROb2RlID0gbmV3IFdhdmVQYWNrZXRTdW1DaGFydE5vZGUoIG1vZGVsLnN1bUNoYXJ0LCB7XHJcbiAgICAgIHRhbmRlbTogc3VtVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N1bUNoYXJ0Tm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEVxdWF0aW9uIGFib3ZlIHRoZSBTdW0gY2hhcnRcclxuICAgIGNvbnN0IHN1bUVxdWF0aW9uTm9kZSA9IG5ldyBXYXZlUGFja2V0U3VtRXF1YXRpb25Ob2RlKCBtb2RlbC5kb21haW5Qcm9wZXJ0eSwgbW9kZWwuc2VyaWVzVHlwZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC53YXZlUGFja2V0LmNvbXBvbmVudFNwYWNpbmdQcm9wZXJ0eSwge1xyXG4gICAgICAgIG1heFdpZHRoOiAwLjUgKiBGTVdDb25zdGFudHMuQ0hBUlRfUkVDVEFOR0xFX1NJWkUud2lkdGgsXHJcbiAgICAgICAgdGFuZGVtOiBzdW1UYW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VtRXF1YXRpb25Ob2RlJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBXYXZlZm9ybSBFbnZlbG9wZSBjaGVja2JveFxyXG4gICAgY29uc3Qgd2F2ZWZvcm1FbnZlbG9wZUNoZWNrYm94ID0gbmV3IFdhdmVmb3JtRW52ZWxvcGVDaGVja2JveCggbW9kZWwuc3VtQ2hhcnQud2F2ZWZvcm1FbnZlbG9wZVZpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IHN1bVRhbmRlbS5jcmVhdGVUYW5kZW0oICd3YXZlZm9ybUVudmVsb3BlQ2hlY2tib3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBbGwgb2YgdGhlIGVsZW1lbnRzIHRoYXQgc2hvdWxkIGJlIGhpZGRlbiB3aGVuIGNoYXJ0RXhwYW5kZWRQcm9wZXJ0eSBpcyBzZXQgdG8gZmFsc2UuXHJcbiAgICAvLyBUaGF0IGNhbiBiZSBkb25lIHVzaW5nIHN1bUV4cGFuZENvbGxhcHNlQnV0dG9uLCBvciBieSBjaGFuZ2luZyBzdW1DaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHkgdmlhIFBoRVQtaU8uXHJcbiAgICBjb25zdCBzdW1QYXJlbnROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC5zdW1DaGFydC5jaGFydEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGNoaWxkcmVuOiBbIHN1bUNoYXJ0Tm9kZSwgc3VtRXF1YXRpb25Ob2RlLCB3YXZlZm9ybUVudmVsb3BlQ2hlY2tib3ggXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBPdGhlciBVSSBlbGVtZW50c1xyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvLyBQYXJlbnQgZm9yIGFsbCBwb3B1cHNcclxuICAgIGNvbnN0IHBvcHVwUGFyZW50ID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWwgPSBuZXcgV2F2ZVBhY2tldENvbnRyb2xQYW5lbCggbW9kZWwsIGNvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBsZW5ndGhUb29sVmlzaWJsZVByb3BlcnR5LCBwb3B1cFBhcmVudCwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbCcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgaW50ZXJhY3Rpb25zIHRoYXQgbWF5IGJlIGluIHByb2dyZXNzXHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgICByZXNldE1lYXN1cmVtZW50VG9vbHMoKTtcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gTGF5b3V0XHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNvbnN0IGNoYXJ0VGl0bGVCb3R0b21TcGFjaW5nID0gMTU7IC8vIHNwYWNlIGJlbG93IHRoZSB0aXRsZSBvZiBhIGNoYXJ0XHJcblxyXG4gICAgLy8gQW1wbGl0dWRlcyBjaGFydCBhdCB0b3AgbGVmdFxyXG4gICAgYW1wbGl0dWRlc0V4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnQgPSB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgRk1XQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOO1xyXG4gICAgYW1wbGl0dWRlc0V4cGFuZENvbGxhcHNlQnV0dG9uLnRvcCA9IHRoaXMubGF5b3V0Qm91bmRzLnRvcCArIDEwO1xyXG4gICAgYW1wbGl0dWRlc0NoYXJ0Tm9kZS54ID0gRk1XQ29uc3RhbnRzLlhfQ0hBUlRfUkVDVEFOR0xFUztcclxuICAgIGFtcGxpdHVkZXNDaGFydE5vZGUueSA9IGFtcGxpdHVkZXNFeHBhbmRDb2xsYXBzZUJ1dHRvbi5ib3R0b20gKyBjaGFydFRpdGxlQm90dG9tU3BhY2luZztcclxuICAgIGNvbnN0IGFtcGxpdHVkZXNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzID0gYW1wbGl0dWRlc0NoYXJ0Tm9kZS5jaGFydFJlY3RhbmdsZS5ib3VuZHNUbyggdGhpcyApO1xyXG5cclxuICAgIGNvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94LmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgIGNvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94LnJpZ2h0ID0gYW1wbGl0dWRlc0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMucmlnaHQgLSA1O1xyXG4gICAgICBjb250aW51b3VzV2F2ZWZvcm1DaGVja2JveC50b3AgPSBhbXBsaXR1ZGVzQ2hhcnROb2RlLmJvdHRvbSArIDg7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ29tcG9uZW50cyBjaGFydCBiZWxvdyB0aGUgQW1wbGl0dWRlcyBjaGFydFxyXG4gICAgY29tcG9uZW50c0V4cGFuZENvbGxhcHNlQnV0dG9uLmxlZnQgPSB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgRk1XQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOO1xyXG4gICAgY29tcG9uZW50c0V4cGFuZENvbGxhcHNlQnV0dG9uLnRvcCA9IGNvbnRpbnVvdXNXYXZlZm9ybUNoZWNrYm94LmJvdHRvbTtcclxuICAgIGNvbXBvbmVudHNDaGFydE5vZGUueCA9IGFtcGxpdHVkZXNDaGFydE5vZGUueDtcclxuICAgIGNvbXBvbmVudHNDaGFydE5vZGUueSA9IGNvbXBvbmVudHNFeHBhbmRDb2xsYXBzZUJ1dHRvbi5ib3R0b20gKyBjaGFydFRpdGxlQm90dG9tU3BhY2luZztcclxuICAgIGNvbnN0IGNvbXBvbmVudHNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzID0gY29tcG9uZW50c0NoYXJ0Tm9kZS5jaGFydFJlY3RhbmdsZS5ib3VuZHNUbyggdGhpcyApO1xyXG5cclxuICAgIC8vIFN1bSBjaGFydCBiZWxvdyB0aGUgQ29tcG9uZW50cyBjaGFydFxyXG4gICAgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24ubGVmdCA9IGNvbXBvbmVudHNFeHBhbmRDb2xsYXBzZUJ1dHRvbi5sZWZ0O1xyXG4gICAgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24udG9wID0gY29tcG9uZW50c0NoYXJ0Tm9kZS5ib3R0b20gKyAzMDtcclxuICAgIHN1bUNoYXJ0Tm9kZS54ID0gY29tcG9uZW50c0NoYXJ0Tm9kZS54O1xyXG4gICAgc3VtQ2hhcnROb2RlLnkgPSBzdW1FeHBhbmRDb2xsYXBzZUJ1dHRvbi5ib3R0b20gKyBjaGFydFRpdGxlQm90dG9tU3BhY2luZztcclxuICAgIGNvbnN0IHN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMgPSBzdW1DaGFydE5vZGUuY2hhcnRSZWN0YW5nbGUuYm91bmRzVG8oIHRoaXMgKTtcclxuXHJcbiAgICB3YXZlZm9ybUVudmVsb3BlQ2hlY2tib3guYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgd2F2ZWZvcm1FbnZlbG9wZUNoZWNrYm94LnJpZ2h0ID0gc3VtQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5yaWdodCAtIDU7XHJcbiAgICAgIHdhdmVmb3JtRW52ZWxvcGVDaGVja2JveC50b3AgPSBzdW1DaGFydE5vZGUuYm90dG9tICsgODtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBSZXNldCBBbGwgYnV0dG9uIGF0IGJvdHRvbSByaWdodFxyXG4gICAgcmVzZXRBbGxCdXR0b24ucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gRk1XQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOO1xyXG4gICAgcmVzZXRBbGxCdXR0b24uYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIEZNV0NvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTjtcclxuXHJcbiAgICAvLyBDb250cm9sIHBhbmVsIGNlbnRlcmVkIGluIHRoZSBzcGFjZSB0byB0aGUgcmlnaHQgb2YgdGhlIGNoYXJ0cy5cclxuICAgIC8vIENvbnN0cmFpbiBkaW1lbnNpb25zIG9mIHRoZSBjb250cm9sIHBhbmVsIGFzIGEgZmFsbGJhY2ssIHNvIHRoYXQgc2ltIGlzIHN0aWxsIHVzYWJsZSBpZiBzb21ldGhpbmcgdW5mb3Jlc2VlblxyXG4gICAgLy8gaGFwcGVucyAtIGUuZy4gZm9udCBzaXplIGRpZmZlcmVuY2VzIG9uIHBsYXRmb3Jtcywgb3IgYSBzdWJjb21wb25lbnQgbWlzYmVoYXZpbmcuXHJcbiAgICBjb250cm9sUGFuZWwuY2VudGVyWCA9IGNvbXBvbmVudHNDaGFydE5vZGUucmlnaHQgKyAoIHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gY29tcG9uZW50c0NoYXJ0Tm9kZS5yaWdodCApIC8gMjtcclxuICAgIGNvbnRyb2xQYW5lbC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy50b3AgKyAxMDsgLy8gYSBiaXQgbGVzcyB0aGFuIFNDUkVFTl9WSUVXX1hfTUFSR0lOLCB0byBnYWluIHNvbWUgaGVpZ2h0XHJcbiAgICBjb250cm9sUGFuZWwubWF4V2lkdGggPSB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIGNvbnRyb2xQYW5lbC53aWR0aCAtIEZNV0NvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTjtcclxuICAgIGNvbnRyb2xQYW5lbC5tYXhIZWlnaHQgPSByZXNldEFsbEJ1dHRvbi50b3AgLSBjb250cm9sUGFuZWwudG9wIC0gNTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gUmVuZGVyaW5nIG9yZGVyXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8vIE1lYXN1cmVtZW50IHRvb2xzIGFyZSBjcmVhdGVkIGxhdGVyLCBhZGRlZCB0byB0aGlzIHBhcmVudCBzbyB3ZSBrbm93IHRoZSByZW5kZXJpbmcgb3JkZXIuXHJcbiAgICBjb25zdCBtZWFzdXJlbWVudFRvb2xzUGFyZW50ID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBBZGQgZXZlcnl0aGluZyB0byBvbmUgcm9vdCBOb2RlLCB0aGVuIGFkZCB0aGF0IHJvb3QgTm9kZSB0byB0aGUgc2NlbmUgZ3JhcGguXHJcbiAgICAvLyBUaGlzIHNob3VsZCBpbXByb3ZlIHN0YXJ0dXAgcGVyZm9ybWFuY2UsIGNvbXBhcmVkIHRvIGNhbGxpbmcgdGhpcy5hZGRDaGlsZCBmb3IgZWFjaCBOb2RlLlxyXG4gICAgY29uc3Qgc2NyZWVuVmlld1Jvb3ROb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBhbXBsaXR1ZGVzRXhwYW5kQ29sbGFwc2VCdXR0b24sXHJcbiAgICAgICAgYW1wbGl0dWRlc1BhcmVudE5vZGUsXHJcbiAgICAgICAgY29tcG9uZW50c0V4cGFuZENvbGxhcHNlQnV0dG9uLFxyXG4gICAgICAgIGNvbXBvbmVudHNQYXJlbnROb2RlLFxyXG4gICAgICAgIHN1bUV4cGFuZENvbGxhcHNlQnV0dG9uLFxyXG4gICAgICAgIHN1bVBhcmVudE5vZGUsXHJcbiAgICAgICAgbWVhc3VyZW1lbnRUb29sc1BhcmVudCxcclxuICAgICAgICBjb250cm9sUGFuZWwsXHJcbiAgICAgICAgcmVzZXRBbGxCdXR0b24sXHJcblxyXG4gICAgICAgIC8vIHBhcmVudCBmb3IgcG9wdXBzIG9uIHRvcFxyXG4gICAgICAgIHBvcHVwUGFyZW50XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNjcmVlblZpZXdSb290Tm9kZSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBFcXVhdGlvbiBwb3NpdGlvbnNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQ2VudGVyIGR5bmFtaWMgZXF1YXRpb25zIGFib3ZlIHRoZWlyIHJlc3BlY3RpdmUgY2hhcnRzLiBTaW5jZSB3ZSBuZWVkIHRvIGxpc3RlbiB0byB0aGUgYm91bmRzIG9mIHRoZXNlIGVxdWF0aW9uc1xyXG4gICAgLy8gaW4gb3JkZXIgdG8gcmVzcGVjdCB0aGVpciBtYXhXaWR0aCwgd3JhcHBlciBOb2RlcyBhcmUgdHJhbnNmb3JtZWQgZm9yIGVxdWF0aW9ucyB0aGF0IGFyZSBkeW5hbWljLlxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvNDBcclxuXHJcbiAgICAvLyBTcGFjZSBiZXR3ZWVuIHRvcCBvZiB0aGUgQ2hhcnRSZWN0YW5nbGUgYW5kIGJvdHRvbSBvZiB0aGUgZXF1YXRpb25cclxuICAgIGNvbnN0IGVxdWF0aW9uWVNwYWNpbmcgPSAzO1xyXG5cclxuICAgIGFtcGxpdHVkZXNFcXVhdGlvblRleHQuYm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBhbXBsaXR1ZGVzRXF1YXRpb25UZXh0LmNlbnRlclggPSBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgICBhbXBsaXR1ZGVzRXF1YXRpb25UZXh0LmJvdHRvbSA9IGFtcGxpdHVkZXNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLnRvcCAtIGVxdWF0aW9uWVNwYWNpbmc7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29tcG9uZW50c0VxdWF0aW9uVGV4dC5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGNvbXBvbmVudHNFcXVhdGlvblRleHQuY2VudGVyWCA9IGNvbXBvbmVudHNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLmNlbnRlclg7XHJcbiAgICAgIGNvbXBvbmVudHNFcXVhdGlvblRleHQuYm90dG9tID0gY29tcG9uZW50c0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMudG9wIC0gZXF1YXRpb25ZU3BhY2luZztcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdW1FcXVhdGlvbk5vZGUuYm91bmRzUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICBzdW1FcXVhdGlvbk5vZGUuY2VudGVyWCA9IHN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMuY2VudGVyWDtcclxuICAgICAgc3VtRXF1YXRpb25Ob2RlLmJvdHRvbSA9IHN1bUNoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMudG9wIC0gZXF1YXRpb25ZU3BhY2luZztcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gTWVhc3VyZW1lbnQgVG9vbHNcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gQ3JlYXRlIG1lYXN1cmVtZW50IHRvb2xzIGFmdGVyIGxheW91dCBvZiBjaGFydHMsIGJlY2F1c2UgdGhlaXIgaW5pdGlhbCBwb3NpdGlvbnMgYW5kIGRyYWcgYm91bmRzIGRlcGVuZCBvblxyXG4gICAgLy8gZmluYWwgcG9zaXRpb25zIGFuZCBib3VuZHMgb2YgQ2hhcnRSZWN0YW5nbGVzLlxyXG5cclxuICAgIC8vIFBhcmVudCB0YW5kZW0gZm9yIGFsbCBtZWFzdXJlbWVudCB0b29sc1xyXG4gICAgY29uc3QgbWVhc3VyZW1lbnRUb29sc1RhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWFzdXJlbWVudFRvb2xzJyApO1xyXG5cclxuICAgIC8vIEtlZXAgdG9vbCBpbiB0aGUgdmljaW5pdHkgb2YgdGhlIEFtcGxpdHVkZXMgY2hhcnQsIGFuZCBrZWVwIGl0cyBsYWJlbCB2aXNpYmxlLlxyXG4gICAgY29uc3QgY29tcG9uZW50U3BhY2luZ1Rvb2xEcmFnQm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgICAgIGFtcGxpdHVkZXNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLmxlZnQsXHJcbiAgICAgIGFtcGxpdHVkZXNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLnRvcCArIDEwLFxyXG4gICAgICBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5yaWdodCArIDE1LFxyXG4gICAgICBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5ib3R0b21cclxuICAgICk7XHJcblxyXG4gICAgLy8gQ29tcG9uZW50IFNwYWNpbmcgKGsxIG9yIG9tZWdhMSkgbWVhc3VyZW1lbnQgdG9vbFxyXG4gICAgY29uc3QgY29tcG9uZW50U3BhY2luZ1Rvb2xOb2RlID0gbmV3IENvbXBvbmVudFNwYWNpbmdUb29sTm9kZSggbW9kZWwud2F2ZVBhY2tldC5jb21wb25lbnRTcGFjaW5nUHJvcGVydHksXHJcbiAgICAgIGFtcGxpdHVkZXNDaGFydE5vZGUuY2hhcnRUcmFuc2Zvcm0sIG1vZGVsLmRvbWFpblByb3BlcnR5LCB7XHJcbiAgICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy5yaWdodCAtIDgwLCBhbXBsaXR1ZGVzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy50b3AgKyA1MCApLFxyXG4gICAgICAgIGRyYWdCb3VuZHM6IGNvbXBvbmVudFNwYWNpbmdUb29sRHJhZ0JvdW5kcyxcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IGNvbXBvbmVudFNwYWNpbmdUb29sVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbTogbWVhc3VyZW1lbnRUb29sc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdjb21wb25lbnRTcGFjaW5nVG9vbE5vZGUnIClcclxuICAgICAgfSApO1xyXG4gICAgbWVhc3VyZW1lbnRUb29sc1BhcmVudC5hZGRDaGlsZCggY29tcG9uZW50U3BhY2luZ1Rvb2xOb2RlICk7XHJcblxyXG4gICAgLy8gbGVuZ3RoVG9vbE5vZGUgY2FuIGJlIGRyYWdnZWQgYXJvdW5kIG9uIHRoZSBDb21wb25lbnRzIGFuZCBTdW0gY2hhcnRzLlxyXG4gICAgY29uc3QgbGVuZ3RoVG9vbERyYWdCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgY29tcG9uZW50c0NoYXJ0UmVjdGFuZ2xlTG9jYWxCb3VuZHMubGVmdCAtIDE1LFxyXG4gICAgICBjb21wb25lbnRzQ2hhcnRSZWN0YW5nbGVMb2NhbEJvdW5kcy50b3AsXHJcbiAgICAgIGNvbXBvbmVudHNDaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLnJpZ2h0ICsgMjAsXHJcbiAgICAgIHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIDIwXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFdhdmVsZW5ndGggKGxhbWRhMSkgb3IgcGVyaW9kIChUMSkgdG9vbFxyXG4gICAgY29uc3QgbGVuZ3RoVG9vbE5vZGUgPSBuZXcgV2F2ZVBhY2tldExlbmd0aFRvb2xOb2RlKCBtb2RlbC53YXZlUGFja2V0Lmxlbmd0aFByb3BlcnR5LFxyXG4gICAgICBjb21wb25lbnRzQ2hhcnROb2RlLmNoYXJ0VHJhbnNmb3JtLCBtb2RlbC5kb21haW5Qcm9wZXJ0eSwge1xyXG5cclxuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZvdXJpZXItbWFraW5nLXdhdmVzL2lzc3Vlcy8xMzQgZm9yIHBvc2l0aW9uLlxyXG4gICAgICAgIHBvc2l0aW9uOiBzdW1DaGFydFJlY3RhbmdsZUxvY2FsQm91bmRzLmNlbnRlcixcclxuICAgICAgICBkcmFnQm91bmRzOiBsZW5ndGhUb29sRHJhZ0JvdW5kcyxcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IGxlbmd0aFRvb2xWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtOiBtZWFzdXJlbWVudFRvb2xzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xlbmd0aFRvb2xOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuICAgIG1lYXN1cmVtZW50VG9vbHNQYXJlbnQuYWRkQ2hpbGQoIGxlbmd0aFRvb2xOb2RlICk7XHJcblxyXG4gICAgLy8gU2hvdyBkcmFnIGJvdW5kcyBmb3IgdGhlIG1lYXN1cmVtZW50IHRvb2xzLlxyXG4gICAgaWYgKCBGTVdRdWVyeVBhcmFtZXRlcnMuZGVidWdUb29scyApIHtcclxuICAgICAgbWVhc3VyZW1lbnRUb29sc1BhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggY29tcG9uZW50U3BhY2luZ1Rvb2xEcmFnQm91bmRzLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAncmVkJ1xyXG4gICAgICB9ICkgKTtcclxuICAgICAgbWVhc3VyZW1lbnRUb29sc1BhcmVudC5hZGRDaGlsZCggbmV3IFJlY3RhbmdsZSggbGVuZ3RoVG9vbERyYWdCb3VuZHMsIHtcclxuICAgICAgICBzdHJva2U6ICdyZWQnXHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc2V0TWVhc3VyZW1lbnRUb29scyA9ICgpID0+IHtcclxuICAgICAgY29tcG9uZW50U3BhY2luZ1Rvb2xWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgY29tcG9uZW50U3BhY2luZ1Rvb2xOb2RlLnJlc2V0KCk7XHJcbiAgICAgIGxlbmd0aFRvb2xWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgbGVuZ3RoVG9vbE5vZGUucmVzZXQoKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFBET01cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gcGRvbSAtIHRyYXZlcnNhbCBvcmRlclxyXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvNTMgYW5kIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9mb3VyaWVyLW1ha2luZy13YXZlcy9pc3N1ZXMvODQuXHJcbiAgICBzY3JlZW5WaWV3Um9vdE5vZGUucGRvbU9yZGVyID0gW1xyXG4gICAgICBjb250cm9sUGFuZWwsXHJcbiAgICAgIGNvbXBvbmVudFNwYWNpbmdUb29sTm9kZSxcclxuICAgICAgbGVuZ3RoVG9vbE5vZGUsXHJcbiAgICAgIGFtcGxpdHVkZXNFeHBhbmRDb2xsYXBzZUJ1dHRvbixcclxuICAgICAgY29udGludW91c1dhdmVmb3JtQ2hlY2tib3gsXHJcbiAgICAgIGNvbXBvbmVudHNFeHBhbmRDb2xsYXBzZUJ1dHRvbixcclxuICAgICAgY29tcG9uZW50c0NoYXJ0Tm9kZSxcclxuICAgICAgc3VtRXhwYW5kQ29sbGFwc2VCdXR0b24sXHJcbiAgICAgIHN1bUNoYXJ0Tm9kZSxcclxuICAgICAgd2F2ZWZvcm1FbnZlbG9wZUNoZWNrYm94LFxyXG4gICAgICByZXNldEFsbEJ1dHRvblxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mb3VyaWVyTWFraW5nV2F2ZXMucmVnaXN0ZXIoICdXYXZlUGFja2V0U2NyZWVuVmlldycsIFdhdmVQYWNrZXRTY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLFNBQVNDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLFFBQVEsbUNBQW1DO0FBQzdFLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxrQkFBa0IsTUFBTSxvQ0FBb0M7QUFDbkUsT0FBT0MsVUFBVSxNQUFNLDRCQUE0QjtBQUNuRCxPQUFPQywyQkFBMkIsTUFBTSxrREFBa0Q7QUFDMUYsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLHlCQUF5QixNQUFNLG9DQUFvQztBQUMxRSxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9D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