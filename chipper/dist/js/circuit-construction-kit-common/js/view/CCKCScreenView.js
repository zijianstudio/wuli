// Copyright 2015-2023, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import PlayPauseButton from '../../../scenery-phet/js/buttons/PlayPauseButton.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../scenery-phet/js/TimeControlNode.js';
import { AlignBox, AlignGroup, KeyboardListener, KeyboardUtils, Node, VBox } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import AdvancedAccordionBox from './AdvancedAccordionBox.js';
import AmmeterNode from './AmmeterNode.js';
import ChargeSpeedThrottlingReadoutNode from './ChargeSpeedThrottlingReadoutNode.js';
import CircuitElementEditContainerNode from './CircuitElementEditContainerNode.js';
import CircuitElementToolbox from './CircuitElementToolbox.js';
import CircuitNode from './CircuitNode.js';
import CurrentChartNode from './CurrentChartNode.js';
import DisplayOptionsPanel from './DisplayOptionsPanel.js';
import SensorToolbox from './SensorToolbox.js';
import ViewRadioButtonGroup from './ViewRadioButtonGroup.js';
import VoltageChartNode from './VoltageChartNode.js';
import VoltmeterNode from './VoltmeterNode.js';
import CCKCZoomButtonGroup from './CCKCZoomButtonGroup.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import CCKCUtils from '../CCKCUtils.js';
import Vertex from '../model/Vertex.js';
import CircuitElement from '../model/CircuitElement.js';
const batteryResistanceStringProperty = CircuitConstructionKitCommonStrings.batteryResistanceStringProperty;
const sourceResistanceStringProperty = CircuitConstructionKitCommonStrings.sourceResistanceStringProperty;

// constants
const VERTICAL_MARGIN = CCKCConstants.VERTICAL_MARGIN;

// Match margins with the carousel page control and spacing
const HORIZONTAL_MARGIN = CCKCConstants.HORIZONTAL_MARGIN;

// Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
// instance variable so the control panels will have the same width across all screens,
// see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
const CONTROL_PANEL_ALIGN_GROUP = new AlignGroup({
  // Elements should have the same widths but not constrained to have the same heights
  matchVertical: false
});

// Support accessibility for deleting selected circuit elements, but don't support broader tab navigation until it
// is complete
document.addEventListener('keydown', event => {
  if (KeyboardUtils.isKeyEvent(event, KeyboardUtils.KEY_TAB)) {
    event.preventDefault();
  }
});
export default class CCKCScreenView extends ScreenView {
  /**
   * @param model
   * @param circuitElementToolItems - to be shown in the carousel
   * @param tandem
   * @param [providedOptions]
   */
  constructor(model, circuitElementToolItems, tandem, providedOptions) {
    const options = optionize()({
      // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
      // scenes (including but not limited to this one).
      showResetAllButton: true,
      /* SEE ALSO OPTIONS IN CircuitElementToolbox*/

      showSeriesAmmeters: false,
      showTimeControls: false,
      showAdvancedControls: true,
      showCharts: false,
      blackBoxStudy: false,
      showStopwatchCheckbox: false,
      showPhaseShiftControl: false,
      hasACandDCVoltageSources: false,
      // determines the string shown in the AdvancedAccordionBox
      showMeterPhetioIndex: false
    }, providedOptions);
    super({
      tandem: tandem
    });
    this.model = model;

    // TODO (black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false

    // contains parts of the circuit that should be shown behind the controls
    this.circuitNodeBackLayer = new Node();
    this.circuitNode = new CircuitNode(model.circuit, this, tandem.createTandem('circuitNode'));
    const meterNodesTandem = tandem.createTandem('meterNodes');
    const voltmeterNodes = model.voltmeters.map(voltmeter => {
      const voltmeterNode = new VoltmeterNode(voltmeter, model, this.circuitNode, {
        tandem: meterNodesTandem.createTandem(`voltmeterNode${voltmeter.phetioIndex}`),
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty,
        showPhetioIndex: options.showMeterPhetioIndex
      });
      voltmeter.droppedEmitter.addListener(bodyNodeGlobalBounds => {
        const bodyNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds(bodyNodeGlobalBounds);
        if (bodyNodeBoundsEroded.intersectsBounds(this.sensorToolbox.globalBounds)) {
          voltmeter.isActiveProperty.value = false;
        }
      });
      return voltmeterNode;
    });
    const ammeterNodes = model.ammeters.map(ammeter => {
      const ammeterNode = new AmmeterNode(ammeter, this.circuitNode, {
        tandem: model.isShowNoncontactAmmeters ? meterNodesTandem.createTandem(`ammeterNode${ammeter.phetioIndex}`) : Tandem.OPT_OUT,
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty,
        blackBoxStudy: options.blackBoxStudy,
        showPhetioIndex: options.showMeterPhetioIndex
      });
      ammeter.droppedEmitter.addListener(bodyNodeGlobalBounds => {
        const bodyNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds(bodyNodeGlobalBounds);
        if (bodyNodeBoundsEroded.intersectsBounds(this.sensorToolbox.globalBounds)) {
          ammeter.isActiveProperty.value = false;
        }
      });
      return ammeterNode;
    });
    this.chartNodes = [];

    // Optionally initialize the chart nodes
    if (options.showCharts) {
      const createVoltageChartNode = tandemName => {
        const voltageChartNode = new VoltageChartNode(this.circuitNode, model.circuit.timeProperty, this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty, {
          tandem: meterNodesTandem.createTandem(tandemName)
        });
        voltageChartNode.initializeBodyDragListener(this);
        return voltageChartNode;
      };
      const createCurrentChartNode = tandemName => {
        const currentChartNode = new CurrentChartNode(this.circuitNode, model.circuit.timeProperty, this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty, {
          tandem: meterNodesTandem.createTandem(tandemName)
        });
        currentChartNode.initializeBodyDragListener(this);
        return currentChartNode;
      };
      this.voltageChartNode1 = createVoltageChartNode('voltageChartNode1');
      this.voltageChartNode2 = createVoltageChartNode('voltageChartNode2');
      this.currentChartNode1 = createCurrentChartNode('currentChartNode1');
      this.currentChartNode2 = createCurrentChartNode('currentChartNode2');
      this.chartNodes.push(this.voltageChartNode1, this.voltageChartNode2, this.currentChartNode1, this.currentChartNode2);
    } else {
      this.voltageChartNode1 = null;
      this.voltageChartNode2 = null;
      this.currentChartNode1 = null;
      this.currentChartNode2 = null;
    }

    // Toolbox from which CircuitElements can be dragged
    this.circuitElementToolbox = new CircuitElementToolbox(model.viewTypeProperty, circuitElementToolItems, tandem.createTandem('circuitElementToolbox'), options.circuitElementToolboxOptions);

    // so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox(CONTROL_PANEL_ALIGN_GROUP, this.circuitNode, voltmeterNodes, ammeterNodes, [this.voltageChartNode1, this.voltageChartNode2], [this.currentChartNode1, this.currentChartNode2], tandem.createTandem('sensorToolbox'), {
      showSeriesAmmeters: options.showSeriesAmmeters,
      showNoncontactAmmeters: model.isShowNoncontactAmmeters,
      showCharts: options.showCharts,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    });
    this.viewRadioButtonGroup = new ViewRadioButtonGroup(model.viewTypeProperty, tandem.createTandem('viewRadioButtonGroup'), {
      maxWidth: this.circuitElementToolbox.carousel.backgroundWidth
    });
    this.viewRadioButtonGroup.mutate({
      scale: this.circuitElementToolbox.carousel.backgroundWidth / this.viewRadioButtonGroup.width * options.circuitElementToolboxOptions.carouselScale
    });
    this.displayOptionsPanel = new DisplayOptionsPanel(CONTROL_PANEL_ALIGN_GROUP, model.circuit.showCurrentProperty, model.circuit.currentTypeProperty, model.showValuesProperty, model.showLabelsProperty, model.stopwatch, options.showStopwatchCheckbox, tandem.createTandem('displayOptionsPanel'));
    this.advancedAccordionBox = options.showAdvancedControls ? new AdvancedAccordionBox(model.circuit, CONTROL_PANEL_ALIGN_GROUP, options.hasACandDCVoltageSources ? sourceResistanceStringProperty : batteryResistanceStringProperty, tandem.createTandem('advancedAccordionBox'), {
      showRealBulbsCheckbox: !options.hasACandDCVoltageSources
    }) : null;
    this.addChild(this.circuitNodeBackLayer);

    // Reset All button
    let resetAllButton = null;
    if (options.showResetAllButton) {
      resetAllButton = new ResetAllButton({
        tandem: tandem.createTandem('resetAllButton'),
        listener: () => {
          model.reset();
          this.reset();
        }
      });
      this.addChild(resetAllButton);
    }
    const toolboxContainer = new VBox({
      align: 'right',
      spacing: 5,
      children: [this.circuitElementToolbox, this.viewRadioButtonGroup]
    });
    this.addChild(toolboxContainer);
    const controlPanelVBox = new VBox({
      spacing: VERTICAL_MARGIN,
      children: options.showAdvancedControls ? [this.displayOptionsPanel, this.sensorToolbox, this.advancedAccordionBox] : [this.displayOptionsPanel, this.sensorToolbox]
    });
    const box = new AlignBox(controlPanelVBox, {
      xAlign: 'right',
      yAlign: 'top',
      xMargin: HORIZONTAL_MARGIN,
      yMargin: VERTICAL_MARGIN
    });
    this.visibleBoundsProperty.linkAttribute(box, 'alignBounds');
    this.addChild(box);
    this.addChild(this.circuitNode);
    const chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(model.circuit.chargeAnimator.timeScaleProperty, model.circuit.showCurrentProperty, model.isValueDepictionEnabledProperty);
    this.addChild(chargeSpeedThrottlingReadoutNode);

    // The center between the left toolbox and the right control panels
    const playAreaCenterXProperty = new NumberProperty(0);
    const circuitElementEditContainerNode = new CircuitElementEditContainerNode(model.circuit, this.visibleBoundsProperty, model.modeProperty, playAreaCenterXProperty, tandem.createTandem('circuitElementEditContainerNode'), {
      showPhaseShiftControl: options.showPhaseShiftControl
    });
    this.addChild(circuitElementEditContainerNode);

    // The voltmeter and ammeter are rendered with the circuit node so they will scale up and down with the circuit
    voltmeterNodes.forEach(voltmeterNode => this.circuitNode.sensorLayer.addChild(voltmeterNode));
    ammeterNodes.forEach(ammeterNode => this.circuitNode.sensorLayer.addChild(ammeterNode));
    this.chartNodes.forEach(chartNode => this.circuitNode.sensorLayer.addChild(chartNode));

    // Create the zoom button group
    const zoomButtonGroup = new CCKCZoomButtonGroup(model.zoomLevelProperty, {
      tandem: tandem.createTandem('zoomButtonGroup'),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    });
    zoomButtonGroup.mutate({
      scale: this.circuitElementToolbox.carousel.backgroundWidth / zoomButtonGroup.width * options.circuitElementToolboxOptions.carouselScale
    });

    // Add the optional Play/Pause button
    if (CCKCQueryParameters.showDepictValuesToggleButton) {
      const playPauseButton = new PlayPauseButton(model.isValueDepictionEnabledProperty, {
        tandem: tandem.createTandem('playPauseButton'),
        baseColor: '#33ff44' // the default blue fades into the background too much
      });

      this.addChild(playPauseButton);
      this.visibleBoundsProperty.link(visibleBounds => {
        // Float the playPauseButton to the bottom left
        playPauseButton.mutate({
          left: visibleBounds.left + VERTICAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN - zoomButtonGroup.height - VERTICAL_MARGIN
        });
      });
    }
    let timeControlNode = null;
    if (options.showTimeControls) {
      timeControlNode = new TimeControlNode(model.isPlayingProperty, {
        tandem: tandem.createTandem('timeControlNode'),
        playPauseStepButtonOptions: {
          stepForwardButtonOptions: {
            listener: () => model.stepSingleStep()
          }
        }
      });
      this.addChild(timeControlNode);
    }

    // Add it in front of everything (should never be obscured by a CircuitElement)
    this.addChild(zoomButtonGroup);
    Multilink.multilink([this.visibleBoundsProperty, toolboxContainer.localBoundsProperty], visibleBounds => {
      toolboxContainer.left = visibleBounds.left + HORIZONTAL_MARGIN;
      toolboxContainer.top = visibleBounds.top + VERTICAL_MARGIN;

      // Float the resetAllButton to the bottom right
      options.showResetAllButton && resetAllButton && resetAllButton.mutate({
        right: visibleBounds.right - HORIZONTAL_MARGIN,
        bottom: visibleBounds.bottom - VERTICAL_MARGIN
      });
      timeControlNode && timeControlNode.mutate({
        left: controlPanelVBox.left,
        bottom: visibleBounds.bottom - VERTICAL_MARGIN
      });
      if (Number.isFinite(toolboxContainer.right)) {
        zoomButtonGroup.right = toolboxContainer.right;
      } else {
        zoomButtonGroup.left = visibleBounds.left + HORIZONTAL_MARGIN;
      }
      zoomButtonGroup.bottom = visibleBounds.bottom - VERTICAL_MARGIN;

      // Center some things between the panels, but gracefully accommodate when phet-io has made them disappear
      const leftEdge = this.circuitElementToolbox.bounds.isEmpty() ? visibleBounds.left : this.circuitElementToolbox.right;
      const rightEdge = controlPanelVBox.bounds.isEmpty() ? visibleBounds.right : controlPanelVBox.left;
      playAreaCenterXProperty.value = (leftEdge + rightEdge) / 2;
      chargeSpeedThrottlingReadoutNode.mutate({
        centerX: playAreaCenterXProperty.value,
        bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
      });
    });

    // Center the circuit node so that zooms will remain centered.
    this.circuitNode.setTranslation(this.layoutBounds.centerX, this.layoutBounds.centerY);
    this.circuitNodeBackLayer.setTranslation(this.layoutBounds.centerX, this.layoutBounds.centerY);

    // Continuously zoom in and out as the current zoom interpolates, and update when the visible bounds change
    Multilink.multilink([model.animatedZoomScaleProperty, this.visibleBoundsProperty], (currentZoom, visibleBounds) => {
      this.circuitNode.setScaleMagnitude(currentZoom);
      this.circuitNodeBackLayer.setScaleMagnitude(currentZoom);
      this.circuitNode.updateTransform(visibleBounds);
    });

    // When a Vertex is dropped and the CircuitElement is over the CircuitElementToolbox, the CircuitElement will go back
    // into the toolbox
    this.model.circuit.vertexDroppedEmitter.addListener(vertex => {
      const neighbors = this.model.circuit.getNeighborCircuitElements(vertex);
      if (neighbors.length === 1) {
        const circuitElement = neighbors[0];
        const circuitElementNode = this.circuitNode.getCircuitElementNode(circuitElement);
        if (this.canNodeDropInToolbox(circuitElementNode)) {
          this.model.circuit.disposeCircuitElement(circuitElement);
        }
      }
    });

    // Re-render after setting state
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(() => {
      this.step(1 / 60);
    });

    // note whether the stopwatch should be repositioned when selected.  Otherwise it remembers its position
    this.stopwatchNodePositionDirty = true;
    if (options.showStopwatchCheckbox) {
      const stopwatchNode = new StopwatchNode(model.stopwatch, {
        dragBoundsProperty: this.visibleBoundsProperty,
        right: controlPanelVBox.left - HORIZONTAL_MARGIN,
        numberDisplayOptions: {
          numberFormatter: StopwatchNode.createRichTextNumberFormatter({
            numberOfDecimalPlaces: 1
          })
        },
        tandem: tandem.createTandem('stopwatchNode')
      });
      this.addChild(stopwatchNode);

      // Show the StopwatchNode when the checkbox is checked
      model.stopwatch.isVisibleProperty.link(isVisible => {
        if (isVisible && this.stopwatchNodePositionDirty) {
          // Compute bounds lazily now that everything is attached to the scene graph
          model.stopwatch.positionProperty.value = new Vector2(controlPanelVBox.left - stopwatchNode.width - 10,
          // center the text are vertically on the checkbox, so the non-draggable buttons aren't right next to the checkbox
          this.globalToLocalBounds(this.displayOptionsPanel.stopwatchCheckbox.globalBounds).centerY - stopwatchNode.height * 0.2);
          this.stopwatchNodePositionDirty = false;
        }
      });
    }
    model.stepEmitter.addListener(dt => this.stepOnce(dt));

    // Add a global key listener on a nested Node since having a listener on the root would make pickable:null things
    // into pickable: true and hence block input, see https://github.com/phetsims/circuit-construction-kit-common/issues/985
    this.addChild(new Node({
      inputListeners: [new KeyboardListener({
        keys: ['delete', 'backspace'],
        global: true,
        callback: (event, listener) => {
          // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/307
          event?.domEvent?.preventDefault();

          // Double guard to work around errors in fuzzing
          const selection = this.circuitNode.circuit.selectionProperty.value;
          if (this.circuitNode.vertexCutButton.inputEnabled && selection instanceof Vertex) {
            this.circuitNode.circuit.cutVertex(this.circuitNode.circuit.getSelectedVertex());
          } else if (selection instanceof CircuitElement) {
            const circuitElement = selection;

            // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
            if (!circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged) {
              // Only permit deletion if the circuit element is marked as disposable
              if (circuitElement.isDisposableProperty.value) {
                this.circuitNode.circuit.disposeCircuitElement(circuitElement);
              }
            }
          }
        }
      })]
    }));
  }

  /**
   * Called from model steps
   */
  stepOnce(dt) {
    // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/476
    if (dt >= CCKCConstants.MAX_DT) {
      return;
    }
    this.chartNodes.forEach(chartNode => chartNode.step(this.model.circuit.timeProperty.value, dt));
  }

  /**
   * Move forward in time by the specified dt
   * @param dt - seconds
   */
  step(dt) {
    // noting from the main step
    this.circuitNode.step();

    // if the model is stepping, the charts will sample new values.  Otherwise, take a reading at the current point,
    // for updating the pen location
    if (!this.model.isPlayingProperty.value) {
      this.chartNodes.forEach(chartNode => chartNode.sampleLatestValue());
    }
  }

  /**
   * Overrideable stub for resetting
   */
  reset() {
    this.stopwatchNodePositionDirty = true;
    this.circuitElementToolbox.reset();
    this.advancedAccordionBox && this.advancedAccordionBox.expandedProperty.reset();
    this.chartNodes.forEach(chartNode => chartNode.reset());
  }

  /**
   * Return true if and only if the CircuitElementNode can be dropped in the toolbox.
   */
  canNodeDropInToolbox(circuitElementNode) {
    const circuitElement = circuitElementNode.circuitElement;

    // Only single (unconnected) elements can be dropped into the toolbox
    const isSingle = this.model.circuit.isSingle(circuitElement);
    const componentImage = circuitElementNode instanceof FixedCircuitElementNode ? circuitElementNode.contentNode : circuitElementNode;
    const elementNodeBounds = this.globalToLocalBounds(componentImage.globalBounds);
    const elementNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds(elementNodeBounds);

    // SeriesAmmeters should be dropped in the sensor toolbox
    const toolbox = circuitElement instanceof SeriesAmmeter ? this.sensorToolbox : this.circuitElementToolbox.carousel;
    const globalCarouselBounds = toolbox.localToGlobalBounds(toolbox.localBounds);
    const carouselBounds = this.globalToLocalBounds(globalCarouselBounds);

    // Detect whether eroded component image bounds intersects the toolbox bounds
    const overToolbox = carouselBounds.intersectsBounds(elementNodeBoundsEroded);
    return isSingle && overToolbox && circuitElement.isDisposableProperty.value;
  }
}
circuitConstructionKitCommon.register('CCKCScreenView', CCKCScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3Iiwib3B0aW9uaXplIiwiUGxheVBhdXNlQnV0dG9uIiwiUmVzZXRBbGxCdXR0b24iLCJTdG9wd2F0Y2hOb2RlIiwiVGltZUNvbnRyb2xOb2RlIiwiQWxpZ25Cb3giLCJBbGlnbkdyb3VwIiwiS2V5Ym9hcmRMaXN0ZW5lciIsIktleWJvYXJkVXRpbHMiLCJOb2RlIiwiVkJveCIsIlRhbmRlbSIsIkNDS0NDb25zdGFudHMiLCJDQ0tDUXVlcnlQYXJhbWV0ZXJzIiwiY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiIsIkNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzIiwiU2VyaWVzQW1tZXRlciIsIkFkdmFuY2VkQWNjb3JkaW9uQm94IiwiQW1tZXRlck5vZGUiLCJDaGFyZ2VTcGVlZFRocm90dGxpbmdSZWFkb3V0Tm9kZSIsIkNpcmN1aXRFbGVtZW50RWRpdENvbnRhaW5lck5vZGUiLCJDaXJjdWl0RWxlbWVudFRvb2xib3giLCJDaXJjdWl0Tm9kZSIsIkN1cnJlbnRDaGFydE5vZGUiLCJEaXNwbGF5T3B0aW9uc1BhbmVsIiwiU2Vuc29yVG9vbGJveCIsIlZpZXdSYWRpb0J1dHRvbkdyb3VwIiwiVm9sdGFnZUNoYXJ0Tm9kZSIsIlZvbHRtZXRlck5vZGUiLCJDQ0tDWm9vbUJ1dHRvbkdyb3VwIiwiRml4ZWRDaXJjdWl0RWxlbWVudE5vZGUiLCJDQ0tDVXRpbHMiLCJWZXJ0ZXgiLCJDaXJjdWl0RWxlbWVudCIsImJhdHRlcnlSZXNpc3RhbmNlU3RyaW5nUHJvcGVydHkiLCJzb3VyY2VSZXNpc3RhbmNlU3RyaW5nUHJvcGVydHkiLCJWRVJUSUNBTF9NQVJHSU4iLCJIT1JJWk9OVEFMX01BUkdJTiIsIkNPTlRST0xfUEFORUxfQUxJR05fR1JPVVAiLCJtYXRjaFZlcnRpY2FsIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnQiLCJpc0tleUV2ZW50IiwiS0VZX1RBQiIsInByZXZlbnREZWZhdWx0IiwiQ0NLQ1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwiY2lyY3VpdEVsZW1lbnRUb29sSXRlbXMiLCJ0YW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2hvd1Jlc2V0QWxsQnV0dG9uIiwic2hvd1Nlcmllc0FtbWV0ZXJzIiwic2hvd1RpbWVDb250cm9scyIsInNob3dBZHZhbmNlZENvbnRyb2xzIiwic2hvd0NoYXJ0cyIsImJsYWNrQm94U3R1ZHkiLCJzaG93U3RvcHdhdGNoQ2hlY2tib3giLCJzaG93UGhhc2VTaGlmdENvbnRyb2wiLCJoYXNBQ2FuZERDVm9sdGFnZVNvdXJjZXMiLCJzaG93TWV0ZXJQaGV0aW9JbmRleCIsImNpcmN1aXROb2RlQmFja0xheWVyIiwiY2lyY3VpdE5vZGUiLCJjaXJjdWl0IiwiY3JlYXRlVGFuZGVtIiwibWV0ZXJOb2Rlc1RhbmRlbSIsInZvbHRtZXRlck5vZGVzIiwidm9sdG1ldGVycyIsIm1hcCIsInZvbHRtZXRlciIsInZvbHRtZXRlck5vZGUiLCJwaGV0aW9JbmRleCIsInNob3dSZXN1bHRzUHJvcGVydHkiLCJpc1ZhbHVlRGVwaWN0aW9uRW5hYmxlZFByb3BlcnR5IiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwidmlzaWJsZUJvdW5kc0luQ2lyY3VpdENvb3JkaW5hdGVGcmFtZVByb3BlcnR5Iiwic2hvd1BoZXRpb0luZGV4IiwiZHJvcHBlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImJvZHlOb2RlR2xvYmFsQm91bmRzIiwiYm9keU5vZGVCb3VuZHNFcm9kZWQiLCJnZXREcm9wSXRlbUhpdEJveEZvckJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJzZW5zb3JUb29sYm94IiwiZ2xvYmFsQm91bmRzIiwiaXNBY3RpdmVQcm9wZXJ0eSIsInZhbHVlIiwiYW1tZXRlck5vZGVzIiwiYW1tZXRlcnMiLCJhbW1ldGVyIiwiYW1tZXRlck5vZGUiLCJpc1Nob3dOb25jb250YWN0QW1tZXRlcnMiLCJPUFRfT1VUIiwiY2hhcnROb2RlcyIsImNyZWF0ZVZvbHRhZ2VDaGFydE5vZGUiLCJ0YW5kZW1OYW1lIiwidm9sdGFnZUNoYXJ0Tm9kZSIsInRpbWVQcm9wZXJ0eSIsImluaXRpYWxpemVCb2R5RHJhZ0xpc3RlbmVyIiwiY3JlYXRlQ3VycmVudENoYXJ0Tm9kZSIsImN1cnJlbnRDaGFydE5vZGUiLCJ2b2x0YWdlQ2hhcnROb2RlMSIsInZvbHRhZ2VDaGFydE5vZGUyIiwiY3VycmVudENoYXJ0Tm9kZTEiLCJjdXJyZW50Q2hhcnROb2RlMiIsInB1c2giLCJjaXJjdWl0RWxlbWVudFRvb2xib3giLCJ2aWV3VHlwZVByb3BlcnR5IiwiY2lyY3VpdEVsZW1lbnRUb29sYm94T3B0aW9ucyIsInNob3dOb25jb250YWN0QW1tZXRlcnMiLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJ2aWV3UmFkaW9CdXR0b25Hcm91cCIsIm1heFdpZHRoIiwiY2Fyb3VzZWwiLCJiYWNrZ3JvdW5kV2lkdGgiLCJtdXRhdGUiLCJzY2FsZSIsIndpZHRoIiwiY2Fyb3VzZWxTY2FsZSIsImRpc3BsYXlPcHRpb25zUGFuZWwiLCJzaG93Q3VycmVudFByb3BlcnR5IiwiY3VycmVudFR5cGVQcm9wZXJ0eSIsInNob3dWYWx1ZXNQcm9wZXJ0eSIsInNob3dMYWJlbHNQcm9wZXJ0eSIsInN0b3B3YXRjaCIsImFkdmFuY2VkQWNjb3JkaW9uQm94Iiwic2hvd1JlYWxCdWxic0NoZWNrYm94IiwiYWRkQ2hpbGQiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwicmVzZXQiLCJ0b29sYm94Q29udGFpbmVyIiwiYWxpZ24iLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJjb250cm9sUGFuZWxWQm94IiwiYm94IiwieEFsaWduIiwieUFsaWduIiwieE1hcmdpbiIsInlNYXJnaW4iLCJsaW5rQXR0cmlidXRlIiwiY2hhcmdlU3BlZWRUaHJvdHRsaW5nUmVhZG91dE5vZGUiLCJjaGFyZ2VBbmltYXRvciIsInRpbWVTY2FsZVByb3BlcnR5IiwicGxheUFyZWFDZW50ZXJYUHJvcGVydHkiLCJjaXJjdWl0RWxlbWVudEVkaXRDb250YWluZXJOb2RlIiwibW9kZVByb3BlcnR5IiwiZm9yRWFjaCIsInNlbnNvckxheWVyIiwiY2hhcnROb2RlIiwiem9vbUJ1dHRvbkdyb3VwIiwiem9vbUxldmVsUHJvcGVydHkiLCJzaG93RGVwaWN0VmFsdWVzVG9nZ2xlQnV0dG9uIiwicGxheVBhdXNlQnV0dG9uIiwiYmFzZUNvbG9yIiwibGluayIsInZpc2libGVCb3VuZHMiLCJsZWZ0IiwiYm90dG9tIiwiaGVpZ2h0IiwidGltZUNvbnRyb2xOb2RlIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsInN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9ucyIsInN0ZXBTaW5nbGVTdGVwIiwibXVsdGlsaW5rIiwibG9jYWxCb3VuZHNQcm9wZXJ0eSIsInRvcCIsInJpZ2h0IiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJsZWZ0RWRnZSIsImJvdW5kcyIsImlzRW1wdHkiLCJyaWdodEVkZ2UiLCJjZW50ZXJYIiwic2V0VHJhbnNsYXRpb24iLCJsYXlvdXRCb3VuZHMiLCJjZW50ZXJZIiwiYW5pbWF0ZWRab29tU2NhbGVQcm9wZXJ0eSIsImN1cnJlbnRab29tIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJ1cGRhdGVUcmFuc2Zvcm0iLCJ2ZXJ0ZXhEcm9wcGVkRW1pdHRlciIsInZlcnRleCIsIm5laWdoYm9ycyIsImdldE5laWdoYm9yQ2lyY3VpdEVsZW1lbnRzIiwibGVuZ3RoIiwiY2lyY3VpdEVsZW1lbnQiLCJjaXJjdWl0RWxlbWVudE5vZGUiLCJnZXRDaXJjdWl0RWxlbWVudE5vZGUiLCJjYW5Ob2RlRHJvcEluVG9vbGJveCIsImRpc3Bvc2VDaXJjdWl0RWxlbWVudCIsIlBIRVRfSU9fRU5BQkxFRCIsInBoZXQiLCJwaGV0aW8iLCJwaGV0aW9FbmdpbmUiLCJwaGV0aW9TdGF0ZUVuZ2luZSIsInN0YXRlU2V0RW1pdHRlciIsInN0ZXAiLCJzdG9wd2F0Y2hOb2RlUG9zaXRpb25EaXJ0eSIsInN0b3B3YXRjaE5vZGUiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJudW1iZXJEaXNwbGF5T3B0aW9ucyIsIm51bWJlckZvcm1hdHRlciIsImNyZWF0ZVJpY2hUZXh0TnVtYmVyRm9ybWF0dGVyIiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwiaXNWaXNpYmxlUHJvcGVydHkiLCJpc1Zpc2libGUiLCJwb3NpdGlvblByb3BlcnR5IiwiZ2xvYmFsVG9Mb2NhbEJvdW5kcyIsInN0b3B3YXRjaENoZWNrYm94Iiwic3RlcEVtaXR0ZXIiLCJkdCIsInN0ZXBPbmNlIiwiaW5wdXRMaXN0ZW5lcnMiLCJrZXlzIiwiZ2xvYmFsIiwiY2FsbGJhY2siLCJkb21FdmVudCIsInNlbGVjdGlvbiIsInNlbGVjdGlvblByb3BlcnR5IiwidmVydGV4Q3V0QnV0dG9uIiwiaW5wdXRFbmFibGVkIiwiY3V0VmVydGV4IiwiZ2V0U2VsZWN0ZWRWZXJ0ZXgiLCJzdGFydFZlcnRleFByb3BlcnR5IiwiaXNEcmFnZ2VkIiwiZW5kVmVydGV4UHJvcGVydHkiLCJpc0Rpc3Bvc2FibGVQcm9wZXJ0eSIsIk1BWF9EVCIsInNhbXBsZUxhdGVzdFZhbHVlIiwiZXhwYW5kZWRQcm9wZXJ0eSIsImlzU2luZ2xlIiwiY29tcG9uZW50SW1hZ2UiLCJjb250ZW50Tm9kZSIsImVsZW1lbnROb2RlQm91bmRzIiwiZWxlbWVudE5vZGVCb3VuZHNFcm9kZWQiLCJ0b29sYm94IiwiZ2xvYmFsQ2Fyb3VzZWxCb3VuZHMiLCJsb2NhbFRvR2xvYmFsQm91bmRzIiwibG9jYWxCb3VuZHMiLCJjYXJvdXNlbEJvdW5kcyIsIm92ZXJUb29sYm94IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDQ0tDU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIHRoYXQgcmVwcmVzZW50cyBhIHNpbmdsZSBzY2VuZSBvciBzY3JlZW4sIHdpdGggYSBjaXJjdWl0LCB0b29sYm94LCBzZW5zb3JzLCBldGMuIEV4aXN0cyBmb3IgdGhlIGxpZmUgb2YgdGhlIHNpbVxyXG4gKiBhbmQgaGVuY2UgZG9lcyBub3QgcmVxdWlyZSBhIGRpc3Bvc2UgaW1wbGVtZW50YXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQbGF5UGF1c2VCdXR0b24gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUGxheVBhdXNlQnV0dG9uLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFN0b3B3YXRjaE5vZGUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1N0b3B3YXRjaE5vZGUuanMnO1xyXG5pbXBvcnQgVGltZUNvbnRyb2xOb2RlIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgeyBBbGlnbkJveCwgQWxpZ25Hcm91cCwgS2V5Ym9hcmRMaXN0ZW5lciwgS2V5Ym9hcmRVdGlscywgTm9kZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCB7IENhcm91c2VsSXRlbSB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9DYXJvdXNlbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ0NLQ1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9DQ0tDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncyBmcm9tICcuLi9DaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Q29uc3RydWN0aW9uS2l0TW9kZWwgZnJvbSAnLi4vbW9kZWwvQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsLmpzJztcclxuaW1wb3J0IFNlcmllc0FtbWV0ZXIgZnJvbSAnLi4vbW9kZWwvU2VyaWVzQW1tZXRlci5qcyc7XHJcbmltcG9ydCBBZHZhbmNlZEFjY29yZGlvbkJveCBmcm9tICcuL0FkdmFuY2VkQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IEFtbWV0ZXJOb2RlIGZyb20gJy4vQW1tZXRlck5vZGUuanMnO1xyXG5pbXBvcnQgQ2hhcmdlU3BlZWRUaHJvdHRsaW5nUmVhZG91dE5vZGUgZnJvbSAnLi9DaGFyZ2VTcGVlZFRocm90dGxpbmdSZWFkb3V0Tm9kZS5qcyc7XHJcbmltcG9ydCBDaXJjdWl0RWxlbWVudEVkaXRDb250YWluZXJOb2RlIGZyb20gJy4vQ2lyY3VpdEVsZW1lbnRFZGl0Q29udGFpbmVyTm9kZS5qcyc7XHJcbmltcG9ydCBDaXJjdWl0RWxlbWVudE5vZGUgZnJvbSAnLi9DaXJjdWl0RWxlbWVudE5vZGUuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnRUb29sYm94LCB7IENpcmN1aXRFbGVtZW50VG9vbGJveE9wdGlvbnMgfSBmcm9tICcuL0NpcmN1aXRFbGVtZW50VG9vbGJveC5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Tm9kZSBmcm9tICcuL0NpcmN1aXROb2RlLmpzJztcclxuaW1wb3J0IEN1cnJlbnRDaGFydE5vZGUgZnJvbSAnLi9DdXJyZW50Q2hhcnROb2RlLmpzJztcclxuaW1wb3J0IERpc3BsYXlPcHRpb25zUGFuZWwgZnJvbSAnLi9EaXNwbGF5T3B0aW9uc1BhbmVsLmpzJztcclxuaW1wb3J0IFNlbnNvclRvb2xib3ggZnJvbSAnLi9TZW5zb3JUb29sYm94LmpzJztcclxuaW1wb3J0IFZpZXdSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4vVmlld1JhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgVm9sdGFnZUNoYXJ0Tm9kZSBmcm9tICcuL1ZvbHRhZ2VDaGFydE5vZGUuanMnO1xyXG5pbXBvcnQgVm9sdG1ldGVyTm9kZSBmcm9tICcuL1ZvbHRtZXRlck5vZGUuanMnO1xyXG5pbXBvcnQgQ0NLQ1pvb21CdXR0b25Hcm91cCBmcm9tICcuL0NDS0Nab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgRml4ZWRDaXJjdWl0RWxlbWVudE5vZGUgZnJvbSAnLi9GaXhlZENpcmN1aXRFbGVtZW50Tm9kZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IENDS0NVdGlscyBmcm9tICcuLi9DQ0tDVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVydGV4IGZyb20gJy4uL21vZGVsL1ZlcnRleC5qcyc7XHJcbmltcG9ydCBDaXJjdWl0RWxlbWVudCBmcm9tICcuLi9tb2RlbC9DaXJjdWl0RWxlbWVudC5qcyc7XHJcblxyXG5jb25zdCBiYXR0ZXJ5UmVzaXN0YW5jZVN0cmluZ1Byb3BlcnR5ID0gQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MuYmF0dGVyeVJlc2lzdGFuY2VTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc291cmNlUmVzaXN0YW5jZVN0cmluZ1Byb3BlcnR5ID0gQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3Muc291cmNlUmVzaXN0YW5jZVN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFZFUlRJQ0FMX01BUkdJTiA9IENDS0NDb25zdGFudHMuVkVSVElDQUxfTUFSR0lOO1xyXG5cclxuLy8gTWF0Y2ggbWFyZ2lucyB3aXRoIHRoZSBjYXJvdXNlbCBwYWdlIGNvbnRyb2wgYW5kIHNwYWNpbmdcclxuY29uc3QgSE9SSVpPTlRBTF9NQVJHSU4gPSBDQ0tDQ29uc3RhbnRzLkhPUklaT05UQUxfTUFSR0lOO1xyXG5cclxuLy8gR3JvdXAgZm9yIGFsaWduaW5nIHRoZSBjb250ZW50IGluIHRoZSBwYW5lbHMgYW5kIGFjY29yZGlvbiBib3hlcy4gIFRoaXMgaXMgYSBjbGFzcyB2YXJpYWJsZSBpbnN0ZWFkIG9mIGFuXHJcbi8vIGluc3RhbmNlIHZhcmlhYmxlIHNvIHRoZSBjb250cm9sIHBhbmVscyB3aWxsIGhhdmUgdGhlIHNhbWUgd2lkdGggYWNyb3NzIGFsbCBzY3JlZW5zLFxyXG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1kYy9pc3N1ZXMvOVxyXG5jb25zdCBDT05UUk9MX1BBTkVMX0FMSUdOX0dST1VQID0gbmV3IEFsaWduR3JvdXAoIHtcclxuXHJcbiAgLy8gRWxlbWVudHMgc2hvdWxkIGhhdmUgdGhlIHNhbWUgd2lkdGhzIGJ1dCBub3QgY29uc3RyYWluZWQgdG8gaGF2ZSB0aGUgc2FtZSBoZWlnaHRzXHJcbiAgbWF0Y2hWZXJ0aWNhbDogZmFsc2VcclxufSApO1xyXG5cclxuLy8gU3VwcG9ydCBhY2Nlc3NpYmlsaXR5IGZvciBkZWxldGluZyBzZWxlY3RlZCBjaXJjdWl0IGVsZW1lbnRzLCBidXQgZG9uJ3Qgc3VwcG9ydCBicm9hZGVyIHRhYiBuYXZpZ2F0aW9uIHVudGlsIGl0XHJcbi8vIGlzIGNvbXBsZXRlXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZXZlbnQgPT4ge1xyXG5cclxuICBpZiAoIEtleWJvYXJkVXRpbHMuaXNLZXlFdmVudCggZXZlbnQsIEtleWJvYXJkVXRpbHMuS0VZX1RBQiApICkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcbn0gKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgc2hvd1Jlc2V0QWxsQnV0dG9uPzogYm9vbGVhbjtcclxuICBjaXJjdWl0RWxlbWVudFRvb2xib3hPcHRpb25zOiBDaXJjdWl0RWxlbWVudFRvb2xib3hPcHRpb25zO1xyXG4gIHNob3dTZXJpZXNBbW1ldGVycz86IGJvb2xlYW47XHJcbiAgc2hvd1RpbWVDb250cm9scz86IGJvb2xlYW47XHJcbiAgc2hvd0FkdmFuY2VkQ29udHJvbHM/OiBib29sZWFuO1xyXG4gIHNob3dDaGFydHM/OiBib29sZWFuO1xyXG4gIGJsYWNrQm94U3R1ZHk/OiBib29sZWFuO1xyXG4gIHNob3dTdG9wd2F0Y2hDaGVja2JveD86IGJvb2xlYW47XHJcbiAgc2hvd1BoYXNlU2hpZnRDb250cm9sPzogYm9vbGVhbjtcclxuICBoYXNBQ2FuZERDVm9sdGFnZVNvdXJjZXM/OiBib29sZWFuO1xyXG4gIHNob3dNZXRlclBoZXRpb0luZGV4PzogYm9vbGVhbjtcclxufTtcclxuZXhwb3J0IHR5cGUgQ0NLQ1NjcmVlblZpZXdPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFNjcmVlblZpZXdPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDQ0tDU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG4gIHB1YmxpYyByZWFkb25seSBtb2RlbDogQ2lyY3VpdENvbnN0cnVjdGlvbktpdE1vZGVsO1xyXG4gIHB1YmxpYyByZWFkb25seSBjaXJjdWl0Tm9kZUJhY2tMYXllcjogTm9kZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgY2lyY3VpdE5vZGU6IENpcmN1aXROb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgY2hhcnROb2RlczogKCBWb2x0YWdlQ2hhcnROb2RlIHwgQ3VycmVudENoYXJ0Tm9kZSApW107XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2b2x0YWdlQ2hhcnROb2RlMTogVm9sdGFnZUNoYXJ0Tm9kZSB8IG51bGw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSB2b2x0YWdlQ2hhcnROb2RlMjogVm9sdGFnZUNoYXJ0Tm9kZSB8IG51bGw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjdXJyZW50Q2hhcnROb2RlMTogQ3VycmVudENoYXJ0Tm9kZSB8IG51bGw7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjdXJyZW50Q2hhcnROb2RlMjogQ3VycmVudENoYXJ0Tm9kZSB8IG51bGw7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGNpcmN1aXRFbGVtZW50VG9vbGJveDogQ2lyY3VpdEVsZW1lbnRUb29sYm94O1xyXG4gIHB1YmxpYyByZWFkb25seSBzZW5zb3JUb29sYm94OiBTZW5zb3JUb29sYm94O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmlld1JhZGlvQnV0dG9uR3JvdXA6IFZpZXdSYWRpb0J1dHRvbkdyb3VwO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcGxheU9wdGlvbnNQYW5lbDogRGlzcGxheU9wdGlvbnNQYW5lbDtcclxuICBwcml2YXRlIHJlYWRvbmx5IGFkdmFuY2VkQWNjb3JkaW9uQm94OiBBZHZhbmNlZEFjY29yZGlvbkJveCB8IG51bGw7XHJcbiAgcHJpdmF0ZSBzdG9wd2F0Y2hOb2RlUG9zaXRpb25EaXJ0eTogYm9vbGVhbjtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG1vZGVsXHJcbiAgICogQHBhcmFtIGNpcmN1aXRFbGVtZW50VG9vbEl0ZW1zIC0gdG8gYmUgc2hvd24gaW4gdGhlIGNhcm91c2VsXHJcbiAgICogQHBhcmFtIHRhbmRlbVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggbW9kZWw6IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRNb2RlbCwgY2lyY3VpdEVsZW1lbnRUb29sSXRlbXM6IENhcm91c2VsSXRlbVtdLCB0YW5kZW06IFRhbmRlbSwgcHJvdmlkZWRPcHRpb25zPzogQ0NLQ1NjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q0NLQ1NjcmVlblZpZXdPcHRpb25zLCBTZWxmT3B0aW9ucywgU3RyaWN0T21pdDxTY3JlZW5WaWV3T3B0aW9ucywgJ3RhbmRlbSc+PigpKCB7XHJcblxyXG4gICAgICAvLyBXaGVuIHVzZWQgYXMgYSBzY2VuZSwgdGhlIHJlc2V0IGFsbCBidXR0b24gaXMgc3VwcHJlc3NlZCBoZXJlLCBhZGRlZCBpbiB0aGUgc2NyZWVuIHNvIHRoYXQgaXQgbWF5IHJlc2V0IGFsbFxyXG4gICAgICAvLyBzY2VuZXMgKGluY2x1ZGluZyBidXQgbm90IGxpbWl0ZWQgdG8gdGhpcyBvbmUpLlxyXG4gICAgICBzaG93UmVzZXRBbGxCdXR0b246IHRydWUsXHJcblxyXG4gICAgICAvKiBTRUUgQUxTTyBPUFRJT05TIElOIENpcmN1aXRFbGVtZW50VG9vbGJveCovXHJcblxyXG4gICAgICBzaG93U2VyaWVzQW1tZXRlcnM6IGZhbHNlLFxyXG4gICAgICBzaG93VGltZUNvbnRyb2xzOiBmYWxzZSxcclxuICAgICAgc2hvd0FkdmFuY2VkQ29udHJvbHM6IHRydWUsXHJcbiAgICAgIHNob3dDaGFydHM6IGZhbHNlLFxyXG4gICAgICBibGFja0JveFN0dWR5OiBmYWxzZSxcclxuICAgICAgc2hvd1N0b3B3YXRjaENoZWNrYm94OiBmYWxzZSxcclxuICAgICAgc2hvd1BoYXNlU2hpZnRDb250cm9sOiBmYWxzZSxcclxuICAgICAgaGFzQUNhbmREQ1ZvbHRhZ2VTb3VyY2VzOiBmYWxzZSwgLy8gZGV0ZXJtaW5lcyB0aGUgc3RyaW5nIHNob3duIGluIHRoZSBBZHZhbmNlZEFjY29yZGlvbkJveFxyXG4gICAgICBzaG93TWV0ZXJQaGV0aW9JbmRleDogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB7IHRhbmRlbTogdGFuZGVtIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgLy8gVE9ETyAoYmxhY2stYm94LXN0dWR5KTogY2hhbmdlIGJhY2tncm91bmQgY29sb3IgdG8gZ3JheSB3aGVuIGlzVmFsdWVEZXBpY3Rpb25FbmFibGVkUHJvcGVydHkgZ29lcyBmYWxzZVxyXG5cclxuICAgIC8vIGNvbnRhaW5zIHBhcnRzIG9mIHRoZSBjaXJjdWl0IHRoYXQgc2hvdWxkIGJlIHNob3duIGJlaGluZCB0aGUgY29udHJvbHNcclxuICAgIHRoaXMuY2lyY3VpdE5vZGVCYWNrTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMuY2lyY3VpdE5vZGUgPSBuZXcgQ2lyY3VpdE5vZGUoXHJcbiAgICAgIG1vZGVsLmNpcmN1aXQsIHRoaXMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaXJjdWl0Tm9kZScgKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBtZXRlck5vZGVzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21ldGVyTm9kZXMnICk7XHJcblxyXG4gICAgY29uc3Qgdm9sdG1ldGVyTm9kZXMgPSBtb2RlbC52b2x0bWV0ZXJzLm1hcCggdm9sdG1ldGVyID0+IHtcclxuICAgICAgY29uc3Qgdm9sdG1ldGVyTm9kZSA9IG5ldyBWb2x0bWV0ZXJOb2RlKCB2b2x0bWV0ZXIsIG1vZGVsLCB0aGlzLmNpcmN1aXROb2RlLCB7XHJcbiAgICAgICAgdGFuZGVtOiBtZXRlck5vZGVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggYHZvbHRtZXRlck5vZGUke3ZvbHRtZXRlci5waGV0aW9JbmRleH1gICksXHJcbiAgICAgICAgc2hvd1Jlc3VsdHNQcm9wZXJ0eTogbW9kZWwuaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICB2aXNpYmxlQm91bmRzUHJvcGVydHk6IHRoaXMuY2lyY3VpdE5vZGUudmlzaWJsZUJvdW5kc0luQ2lyY3VpdENvb3JkaW5hdGVGcmFtZVByb3BlcnR5LFxyXG4gICAgICAgIHNob3dQaGV0aW9JbmRleDogb3B0aW9ucy5zaG93TWV0ZXJQaGV0aW9JbmRleFxyXG4gICAgICB9ICk7XHJcbiAgICAgIHZvbHRtZXRlci5kcm9wcGVkRW1pdHRlci5hZGRMaXN0ZW5lciggYm9keU5vZGVHbG9iYWxCb3VuZHMgPT4ge1xyXG4gICAgICAgIGNvbnN0IGJvZHlOb2RlQm91bmRzRXJvZGVkID0gQ0NLQ1V0aWxzLmdldERyb3BJdGVtSGl0Qm94Rm9yQm91bmRzKCBib2R5Tm9kZUdsb2JhbEJvdW5kcyApO1xyXG4gICAgICAgIGlmICggYm9keU5vZGVCb3VuZHNFcm9kZWQuaW50ZXJzZWN0c0JvdW5kcyggdGhpcy5zZW5zb3JUb29sYm94Lmdsb2JhbEJvdW5kcyApICkge1xyXG4gICAgICAgICAgdm9sdG1ldGVyLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgcmV0dXJuIHZvbHRtZXRlck5vZGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYW1tZXRlck5vZGVzID0gbW9kZWwuYW1tZXRlcnMubWFwKCBhbW1ldGVyID0+IHtcclxuICAgICAgY29uc3QgYW1tZXRlck5vZGUgPSBuZXcgQW1tZXRlck5vZGUoIGFtbWV0ZXIsIHRoaXMuY2lyY3VpdE5vZGUsIHtcclxuICAgICAgICB0YW5kZW06IG1vZGVsLmlzU2hvd05vbmNvbnRhY3RBbW1ldGVycyA/IG1ldGVyTm9kZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCBgYW1tZXRlck5vZGUke2FtbWV0ZXIucGhldGlvSW5kZXh9YCApIDogVGFuZGVtLk9QVF9PVVQsXHJcbiAgICAgICAgc2hvd1Jlc3VsdHNQcm9wZXJ0eTogbW9kZWwuaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICB2aXNpYmxlQm91bmRzUHJvcGVydHk6IHRoaXMuY2lyY3VpdE5vZGUudmlzaWJsZUJvdW5kc0luQ2lyY3VpdENvb3JkaW5hdGVGcmFtZVByb3BlcnR5LFxyXG4gICAgICAgIGJsYWNrQm94U3R1ZHk6IG9wdGlvbnMuYmxhY2tCb3hTdHVkeSxcclxuICAgICAgICBzaG93UGhldGlvSW5kZXg6IG9wdGlvbnMuc2hvd01ldGVyUGhldGlvSW5kZXhcclxuICAgICAgfSApO1xyXG4gICAgICBhbW1ldGVyLmRyb3BwZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBib2R5Tm9kZUdsb2JhbEJvdW5kcyA9PiB7XHJcbiAgICAgICAgY29uc3QgYm9keU5vZGVCb3VuZHNFcm9kZWQgPSBDQ0tDVXRpbHMuZ2V0RHJvcEl0ZW1IaXRCb3hGb3JCb3VuZHMoIGJvZHlOb2RlR2xvYmFsQm91bmRzICk7XHJcbiAgICAgICAgaWYgKCBib2R5Tm9kZUJvdW5kc0Vyb2RlZC5pbnRlcnNlY3RzQm91bmRzKCB0aGlzLnNlbnNvclRvb2xib3guZ2xvYmFsQm91bmRzICkgKSB7XHJcbiAgICAgICAgICBhbW1ldGVyLmlzQWN0aXZlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgcmV0dXJuIGFtbWV0ZXJOb2RlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuY2hhcnROb2RlcyA9IFtdO1xyXG5cclxuICAgIC8vIE9wdGlvbmFsbHkgaW5pdGlhbGl6ZSB0aGUgY2hhcnQgbm9kZXNcclxuICAgIGlmICggb3B0aW9ucy5zaG93Q2hhcnRzICkge1xyXG5cclxuICAgICAgY29uc3QgY3JlYXRlVm9sdGFnZUNoYXJ0Tm9kZSA9ICggdGFuZGVtTmFtZTogc3RyaW5nICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZvbHRhZ2VDaGFydE5vZGUgPSBuZXcgVm9sdGFnZUNoYXJ0Tm9kZSggdGhpcy5jaXJjdWl0Tm9kZSwgbW9kZWwuY2lyY3VpdC50aW1lUHJvcGVydHksXHJcbiAgICAgICAgICB0aGlzLmNpcmN1aXROb2RlLnZpc2libGVCb3VuZHNJbkNpcmN1aXRDb29yZGluYXRlRnJhbWVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICB0YW5kZW06IG1ldGVyTm9kZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCB0YW5kZW1OYW1lIClcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIHZvbHRhZ2VDaGFydE5vZGUuaW5pdGlhbGl6ZUJvZHlEcmFnTGlzdGVuZXIoIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gdm9sdGFnZUNoYXJ0Tm9kZTtcclxuICAgICAgfTtcclxuICAgICAgY29uc3QgY3JlYXRlQ3VycmVudENoYXJ0Tm9kZSA9ICggdGFuZGVtTmFtZTogc3RyaW5nICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDaGFydE5vZGUgPSBuZXcgQ3VycmVudENoYXJ0Tm9kZSggdGhpcy5jaXJjdWl0Tm9kZSwgbW9kZWwuY2lyY3VpdC50aW1lUHJvcGVydHksXHJcbiAgICAgICAgICB0aGlzLmNpcmN1aXROb2RlLnZpc2libGVCb3VuZHNJbkNpcmN1aXRDb29yZGluYXRlRnJhbWVQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgICB0YW5kZW06IG1ldGVyTm9kZXNUYW5kZW0uY3JlYXRlVGFuZGVtKCB0YW5kZW1OYW1lIClcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIGN1cnJlbnRDaGFydE5vZGUuaW5pdGlhbGl6ZUJvZHlEcmFnTGlzdGVuZXIoIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gY3VycmVudENoYXJ0Tm9kZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIHRoaXMudm9sdGFnZUNoYXJ0Tm9kZTEgPSBjcmVhdGVWb2x0YWdlQ2hhcnROb2RlKCAndm9sdGFnZUNoYXJ0Tm9kZTEnICk7XHJcbiAgICAgIHRoaXMudm9sdGFnZUNoYXJ0Tm9kZTIgPSBjcmVhdGVWb2x0YWdlQ2hhcnROb2RlKCAndm9sdGFnZUNoYXJ0Tm9kZTInICk7XHJcblxyXG4gICAgICB0aGlzLmN1cnJlbnRDaGFydE5vZGUxID0gY3JlYXRlQ3VycmVudENoYXJ0Tm9kZSggJ2N1cnJlbnRDaGFydE5vZGUxJyApO1xyXG4gICAgICB0aGlzLmN1cnJlbnRDaGFydE5vZGUyID0gY3JlYXRlQ3VycmVudENoYXJ0Tm9kZSggJ2N1cnJlbnRDaGFydE5vZGUyJyApO1xyXG5cclxuICAgICAgdGhpcy5jaGFydE5vZGVzLnB1c2goIHRoaXMudm9sdGFnZUNoYXJ0Tm9kZTEsIHRoaXMudm9sdGFnZUNoYXJ0Tm9kZTIsIHRoaXMuY3VycmVudENoYXJ0Tm9kZTEsIHRoaXMuY3VycmVudENoYXJ0Tm9kZTIgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnZvbHRhZ2VDaGFydE5vZGUxID0gbnVsbDtcclxuICAgICAgdGhpcy52b2x0YWdlQ2hhcnROb2RlMiA9IG51bGw7XHJcblxyXG4gICAgICB0aGlzLmN1cnJlbnRDaGFydE5vZGUxID0gbnVsbDtcclxuICAgICAgdGhpcy5jdXJyZW50Q2hhcnROb2RlMiA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVG9vbGJveCBmcm9tIHdoaWNoIENpcmN1aXRFbGVtZW50cyBjYW4gYmUgZHJhZ2dlZFxyXG4gICAgdGhpcy5jaXJjdWl0RWxlbWVudFRvb2xib3ggPSBuZXcgQ2lyY3VpdEVsZW1lbnRUb29sYm94KFxyXG4gICAgICBtb2RlbC52aWV3VHlwZVByb3BlcnR5LFxyXG4gICAgICBjaXJjdWl0RWxlbWVudFRvb2xJdGVtcyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NpcmN1aXRFbGVtZW50VG9vbGJveCcgKSxcclxuICAgICAgb3B0aW9ucy5jaXJjdWl0RWxlbWVudFRvb2xib3hPcHRpb25zXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHNvIHRoYXQgc3ViY2xhc3NlcyBjYW4gYWRkIGEgbGF5b3V0IGNpcmN1aXQgZWxlbWVudCBuZWFyIGl0XHJcbiAgICB0aGlzLnNlbnNvclRvb2xib3ggPSBuZXcgU2Vuc29yVG9vbGJveChcclxuICAgICAgQ09OVFJPTF9QQU5FTF9BTElHTl9HUk9VUCxcclxuICAgICAgdGhpcy5jaXJjdWl0Tm9kZSxcclxuICAgICAgdm9sdG1ldGVyTm9kZXMsXHJcbiAgICAgIGFtbWV0ZXJOb2RlcyxcclxuICAgICAgWyB0aGlzLnZvbHRhZ2VDaGFydE5vZGUxISwgdGhpcy52b2x0YWdlQ2hhcnROb2RlMiEgXSxcclxuICAgICAgWyB0aGlzLmN1cnJlbnRDaGFydE5vZGUxISwgdGhpcy5jdXJyZW50Q2hhcnROb2RlMiEgXSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NlbnNvclRvb2xib3gnICksIHtcclxuICAgICAgICBzaG93U2VyaWVzQW1tZXRlcnM6IG9wdGlvbnMuc2hvd1Nlcmllc0FtbWV0ZXJzLFxyXG4gICAgICAgIHNob3dOb25jb250YWN0QW1tZXRlcnM6IG1vZGVsLmlzU2hvd05vbmNvbnRhY3RBbW1ldGVycyxcclxuICAgICAgICBzaG93Q2hhcnRzOiBvcHRpb25zLnNob3dDaGFydHMsXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZpZXdSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFZpZXdSYWRpb0J1dHRvbkdyb3VwKFxyXG4gICAgICBtb2RlbC52aWV3VHlwZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlld1JhZGlvQnV0dG9uR3JvdXAnICksIHtcclxuICAgICAgICBtYXhXaWR0aDogdGhpcy5jaXJjdWl0RWxlbWVudFRvb2xib3guY2Fyb3VzZWwuYmFja2dyb3VuZFdpZHRoXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLnZpZXdSYWRpb0J1dHRvbkdyb3VwLm11dGF0ZSgge1xyXG4gICAgICBzY2FsZTogdGhpcy5jaXJjdWl0RWxlbWVudFRvb2xib3guY2Fyb3VzZWwuYmFja2dyb3VuZFdpZHRoIC9cclxuICAgICAgICAgICAgIHRoaXMudmlld1JhZGlvQnV0dG9uR3JvdXAud2lkdGggKiBvcHRpb25zLmNpcmN1aXRFbGVtZW50VG9vbGJveE9wdGlvbnMuY2Fyb3VzZWxTY2FsZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGlzcGxheU9wdGlvbnNQYW5lbCA9IG5ldyBEaXNwbGF5T3B0aW9uc1BhbmVsKFxyXG4gICAgICBDT05UUk9MX1BBTkVMX0FMSUdOX0dST1VQLFxyXG4gICAgICBtb2RlbC5jaXJjdWl0LnNob3dDdXJyZW50UHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmNpcmN1aXQuY3VycmVudFR5cGVQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc2hvd1ZhbHVlc1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5zaG93TGFiZWxzUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnN0b3B3YXRjaCxcclxuICAgICAgb3B0aW9ucy5zaG93U3RvcHdhdGNoQ2hlY2tib3gsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXNwbGF5T3B0aW9uc1BhbmVsJyApXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMuYWR2YW5jZWRBY2NvcmRpb25Cb3ggPSBvcHRpb25zLnNob3dBZHZhbmNlZENvbnRyb2xzID8gbmV3IEFkdmFuY2VkQWNjb3JkaW9uQm94KFxyXG4gICAgICBtb2RlbC5jaXJjdWl0LFxyXG4gICAgICBDT05UUk9MX1BBTkVMX0FMSUdOX0dST1VQLFxyXG4gICAgICBvcHRpb25zLmhhc0FDYW5kRENWb2x0YWdlU291cmNlcyA/IHNvdXJjZVJlc2lzdGFuY2VTdHJpbmdQcm9wZXJ0eSA6IGJhdHRlcnlSZXNpc3RhbmNlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhZHZhbmNlZEFjY29yZGlvbkJveCcgKSwge1xyXG4gICAgICAgIHNob3dSZWFsQnVsYnNDaGVja2JveDogIW9wdGlvbnMuaGFzQUNhbmREQ1ZvbHRhZ2VTb3VyY2VzXHJcbiAgICAgIH1cclxuICAgICkgOiBudWxsO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY2lyY3VpdE5vZGVCYWNrTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBSZXNldCBBbGwgYnV0dG9uXHJcbiAgICBsZXQgcmVzZXRBbGxCdXR0b246IFJlc2V0QWxsQnV0dG9uIHwgbnVsbCA9IG51bGw7XHJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd1Jlc2V0QWxsQnV0dG9uICkge1xyXG4gICAgICByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApLFxyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRvb2xib3hDb250YWluZXIgPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICB0aGlzLmNpcmN1aXRFbGVtZW50VG9vbGJveCxcclxuICAgICAgICB0aGlzLnZpZXdSYWRpb0J1dHRvbkdyb3VwXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRvb2xib3hDb250YWluZXIgKTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWxWQm94ID0gbmV3IFZCb3goIHtcclxuICAgICAgc3BhY2luZzogVkVSVElDQUxfTUFSR0lOLFxyXG4gICAgICBjaGlsZHJlbjogb3B0aW9ucy5zaG93QWR2YW5jZWRDb250cm9scyA/XHJcbiAgICAgICAgWyB0aGlzLmRpc3BsYXlPcHRpb25zUGFuZWwsIHRoaXMuc2Vuc29yVG9vbGJveCwgdGhpcy5hZHZhbmNlZEFjY29yZGlvbkJveCEgXSA6XHJcbiAgICAgICAgWyB0aGlzLmRpc3BsYXlPcHRpb25zUGFuZWwsIHRoaXMuc2Vuc29yVG9vbGJveCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYm94ID0gbmV3IEFsaWduQm94KCBjb250cm9sUGFuZWxWQm94LCB7XHJcbiAgICAgIHhBbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgeUFsaWduOiAndG9wJyxcclxuICAgICAgeE1hcmdpbjogSE9SSVpPTlRBTF9NQVJHSU4sXHJcbiAgICAgIHlNYXJnaW46IFZFUlRJQ0FMX01BUkdJTlxyXG4gICAgfSApO1xyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkubGlua0F0dHJpYnV0ZSggYm94LCAnYWxpZ25Cb3VuZHMnICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggYm94ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNpcmN1aXROb2RlICk7XHJcblxyXG4gICAgY29uc3QgY2hhcmdlU3BlZWRUaHJvdHRsaW5nUmVhZG91dE5vZGUgPSBuZXcgQ2hhcmdlU3BlZWRUaHJvdHRsaW5nUmVhZG91dE5vZGUoXHJcbiAgICAgIG1vZGVsLmNpcmN1aXQuY2hhcmdlQW5pbWF0b3IudGltZVNjYWxlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmNpcmN1aXQuc2hvd0N1cnJlbnRQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuaXNWYWx1ZURlcGljdGlvbkVuYWJsZWRQcm9wZXJ0eVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNoYXJnZVNwZWVkVGhyb3R0bGluZ1JlYWRvdXROb2RlICk7XHJcblxyXG4gICAgLy8gVGhlIGNlbnRlciBiZXR3ZWVuIHRoZSBsZWZ0IHRvb2xib3ggYW5kIHRoZSByaWdodCBjb250cm9sIHBhbmVsc1xyXG4gICAgY29uc3QgcGxheUFyZWFDZW50ZXJYUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKTtcclxuXHJcbiAgICBjb25zdCBjaXJjdWl0RWxlbWVudEVkaXRDb250YWluZXJOb2RlID0gbmV3IENpcmN1aXRFbGVtZW50RWRpdENvbnRhaW5lck5vZGUoXHJcbiAgICAgIG1vZGVsLmNpcmN1aXQsXHJcbiAgICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC5tb2RlUHJvcGVydHksXHJcbiAgICAgIHBsYXlBcmVhQ2VudGVyWFByb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2lyY3VpdEVsZW1lbnRFZGl0Q29udGFpbmVyTm9kZScgKSwge1xyXG4gICAgICAgIHNob3dQaGFzZVNoaWZ0Q29udHJvbDogb3B0aW9ucy5zaG93UGhhc2VTaGlmdENvbnRyb2xcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBjaXJjdWl0RWxlbWVudEVkaXRDb250YWluZXJOb2RlICk7XHJcblxyXG4gICAgLy8gVGhlIHZvbHRtZXRlciBhbmQgYW1tZXRlciBhcmUgcmVuZGVyZWQgd2l0aCB0aGUgY2lyY3VpdCBub2RlIHNvIHRoZXkgd2lsbCBzY2FsZSB1cCBhbmQgZG93biB3aXRoIHRoZSBjaXJjdWl0XHJcbiAgICB2b2x0bWV0ZXJOb2Rlcy5mb3JFYWNoKCB2b2x0bWV0ZXJOb2RlID0+IHRoaXMuY2lyY3VpdE5vZGUuc2Vuc29yTGF5ZXIuYWRkQ2hpbGQoIHZvbHRtZXRlck5vZGUgKSApO1xyXG4gICAgYW1tZXRlck5vZGVzLmZvckVhY2goIGFtbWV0ZXJOb2RlID0+IHRoaXMuY2lyY3VpdE5vZGUuc2Vuc29yTGF5ZXIuYWRkQ2hpbGQoIGFtbWV0ZXJOb2RlICkgKTtcclxuICAgIHRoaXMuY2hhcnROb2Rlcy5mb3JFYWNoKCBjaGFydE5vZGUgPT4gdGhpcy5jaXJjdWl0Tm9kZS5zZW5zb3JMYXllci5hZGRDaGlsZCggY2hhcnROb2RlICkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHpvb20gYnV0dG9uIGdyb3VwXHJcbiAgICBjb25zdCB6b29tQnV0dG9uR3JvdXAgPSBuZXcgQ0NLQ1pvb21CdXR0b25Hcm91cCggbW9kZWwuem9vbUxldmVsUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnem9vbUJ1dHRvbkdyb3VwJyApLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgcGhldGlvRmVhdHVyZWQ6IHRydWVcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgem9vbUJ1dHRvbkdyb3VwLm11dGF0ZSgge1xyXG4gICAgICBzY2FsZTogdGhpcy5jaXJjdWl0RWxlbWVudFRvb2xib3guY2Fyb3VzZWwuYmFja2dyb3VuZFdpZHRoIC9cclxuICAgICAgICAgICAgIHpvb21CdXR0b25Hcm91cC53aWR0aCAqIG9wdGlvbnMuY2lyY3VpdEVsZW1lbnRUb29sYm94T3B0aW9ucy5jYXJvdXNlbFNjYWxlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBvcHRpb25hbCBQbGF5L1BhdXNlIGJ1dHRvblxyXG4gICAgaWYgKCBDQ0tDUXVlcnlQYXJhbWV0ZXJzLnNob3dEZXBpY3RWYWx1ZXNUb2dnbGVCdXR0b24gKSB7XHJcbiAgICAgIGNvbnN0IHBsYXlQYXVzZUJ1dHRvbiA9IG5ldyBQbGF5UGF1c2VCdXR0b24oIG1vZGVsLmlzVmFsdWVEZXBpY3Rpb25FbmFibGVkUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF5UGF1c2VCdXR0b24nICksXHJcbiAgICAgICAgYmFzZUNvbG9yOiAnIzMzZmY0NCcgLy8gdGhlIGRlZmF1bHQgYmx1ZSBmYWRlcyBpbnRvIHRoZSBiYWNrZ3JvdW5kIHRvbyBtdWNoXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggcGxheVBhdXNlQnV0dG9uICk7XHJcbiAgICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LmxpbmsoICggdmlzaWJsZUJvdW5kczogQm91bmRzMiApID0+IHtcclxuXHJcbiAgICAgICAgLy8gRmxvYXQgdGhlIHBsYXlQYXVzZUJ1dHRvbiB0byB0aGUgYm90dG9tIGxlZnRcclxuICAgICAgICBwbGF5UGF1c2VCdXR0b24ubXV0YXRlKCB7XHJcbiAgICAgICAgICBsZWZ0OiB2aXNpYmxlQm91bmRzLmxlZnQgKyBWRVJUSUNBTF9NQVJHSU4sXHJcbiAgICAgICAgICBib3R0b206IHZpc2libGVCb3VuZHMuYm90dG9tIC0gVkVSVElDQUxfTUFSR0lOIC0gem9vbUJ1dHRvbkdyb3VwLmhlaWdodCAtIFZFUlRJQ0FMX01BUkdJTlxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCB0aW1lQ29udHJvbE5vZGU6IFRpbWVDb250cm9sTm9kZSB8IG51bGwgPSBudWxsO1xyXG4gICAgaWYgKCBvcHRpb25zLnNob3dUaW1lQ29udHJvbHMgKSB7XHJcbiAgICAgIHRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUNvbnRyb2xOb2RlJyApLFxyXG4gICAgICAgIHBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICBzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgICAgbGlzdGVuZXI6ICgpID0+IG1vZGVsLnN0ZXBTaW5nbGVTdGVwKClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGltZUNvbnRyb2xOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIGl0IGluIGZyb250IG9mIGV2ZXJ5dGhpbmcgKHNob3VsZCBuZXZlciBiZSBvYnNjdXJlZCBieSBhIENpcmN1aXRFbGVtZW50KVxyXG4gICAgdGhpcy5hZGRDaGlsZCggem9vbUJ1dHRvbkdyb3VwICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwgdG9vbGJveENvbnRhaW5lci5sb2NhbEJvdW5kc1Byb3BlcnR5IF0sXHJcbiAgICAgICggdmlzaWJsZUJvdW5kczogQm91bmRzMiApID0+IHtcclxuICAgICAgICB0b29sYm94Q29udGFpbmVyLmxlZnQgPSB2aXNpYmxlQm91bmRzLmxlZnQgKyBIT1JJWk9OVEFMX01BUkdJTjtcclxuICAgICAgICB0b29sYm94Q29udGFpbmVyLnRvcCA9IHZpc2libGVCb3VuZHMudG9wICsgVkVSVElDQUxfTUFSR0lOO1xyXG5cclxuICAgICAgICAvLyBGbG9hdCB0aGUgcmVzZXRBbGxCdXR0b24gdG8gdGhlIGJvdHRvbSByaWdodFxyXG4gICAgICAgIG9wdGlvbnMuc2hvd1Jlc2V0QWxsQnV0dG9uICYmIHJlc2V0QWxsQnV0dG9uICYmIHJlc2V0QWxsQnV0dG9uLm11dGF0ZSgge1xyXG4gICAgICAgICAgcmlnaHQ6IHZpc2libGVCb3VuZHMucmlnaHQgLSBIT1JJWk9OVEFMX01BUkdJTixcclxuICAgICAgICAgIGJvdHRvbTogdmlzaWJsZUJvdW5kcy5ib3R0b20gLSBWRVJUSUNBTF9NQVJHSU5cclxuICAgICAgICB9ICk7XHJcblxyXG4gICAgICAgIHRpbWVDb250cm9sTm9kZSAmJiB0aW1lQ29udHJvbE5vZGUubXV0YXRlKCB7XHJcbiAgICAgICAgICBsZWZ0OiBjb250cm9sUGFuZWxWQm94LmxlZnQsXHJcbiAgICAgICAgICBib3R0b206IHZpc2libGVCb3VuZHMuYm90dG9tIC0gVkVSVElDQUxfTUFSR0lOXHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICBpZiAoIE51bWJlci5pc0Zpbml0ZSggdG9vbGJveENvbnRhaW5lci5yaWdodCApICkge1xyXG4gICAgICAgICAgem9vbUJ1dHRvbkdyb3VwLnJpZ2h0ID0gdG9vbGJveENvbnRhaW5lci5yaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB6b29tQnV0dG9uR3JvdXAubGVmdCA9IHZpc2libGVCb3VuZHMubGVmdCArIEhPUklaT05UQUxfTUFSR0lOO1xyXG4gICAgICAgIH1cclxuICAgICAgICB6b29tQnV0dG9uR3JvdXAuYm90dG9tID0gdmlzaWJsZUJvdW5kcy5ib3R0b20gLSBWRVJUSUNBTF9NQVJHSU47XHJcblxyXG4gICAgICAgIC8vIENlbnRlciBzb21lIHRoaW5ncyBiZXR3ZWVuIHRoZSBwYW5lbHMsIGJ1dCBncmFjZWZ1bGx5IGFjY29tbW9kYXRlIHdoZW4gcGhldC1pbyBoYXMgbWFkZSB0aGVtIGRpc2FwcGVhclxyXG4gICAgICAgIGNvbnN0IGxlZnRFZGdlID0gdGhpcy5jaXJjdWl0RWxlbWVudFRvb2xib3guYm91bmRzLmlzRW1wdHkoKSA/IHZpc2libGVCb3VuZHMubGVmdCA6IHRoaXMuY2lyY3VpdEVsZW1lbnRUb29sYm94LnJpZ2h0O1xyXG4gICAgICAgIGNvbnN0IHJpZ2h0RWRnZSA9IGNvbnRyb2xQYW5lbFZCb3guYm91bmRzLmlzRW1wdHkoKSA/IHZpc2libGVCb3VuZHMucmlnaHQgOiBjb250cm9sUGFuZWxWQm94LmxlZnQ7XHJcblxyXG4gICAgICAgIHBsYXlBcmVhQ2VudGVyWFByb3BlcnR5LnZhbHVlID0gKCBsZWZ0RWRnZSArIHJpZ2h0RWRnZSApIC8gMjtcclxuXHJcbiAgICAgICAgY2hhcmdlU3BlZWRUaHJvdHRsaW5nUmVhZG91dE5vZGUubXV0YXRlKCB7XHJcbiAgICAgICAgICBjZW50ZXJYOiBwbGF5QXJlYUNlbnRlclhQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgIGJvdHRvbTogdmlzaWJsZUJvdW5kcy5ib3R0b20gLSAxMDAgLy8gc28gaXQgZG9lc24ndCBvdmVybGFwIHRoZSBjb21wb25lbnQgY29udHJvbHNcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBDZW50ZXIgdGhlIGNpcmN1aXQgbm9kZSBzbyB0aGF0IHpvb21zIHdpbGwgcmVtYWluIGNlbnRlcmVkLlxyXG4gICAgdGhpcy5jaXJjdWl0Tm9kZS5zZXRUcmFuc2xhdGlvbiggdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCwgdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWSApO1xyXG4gICAgdGhpcy5jaXJjdWl0Tm9kZUJhY2tMYXllci5zZXRUcmFuc2xhdGlvbiggdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWCwgdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyWSApO1xyXG5cclxuICAgIC8vIENvbnRpbnVvdXNseSB6b29tIGluIGFuZCBvdXQgYXMgdGhlIGN1cnJlbnQgem9vbSBpbnRlcnBvbGF0ZXMsIGFuZCB1cGRhdGUgd2hlbiB0aGUgdmlzaWJsZSBib3VuZHMgY2hhbmdlXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLmFuaW1hdGVkWm9vbVNjYWxlUHJvcGVydHksIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5IF0sICggY3VycmVudFpvb20sIHZpc2libGVCb3VuZHMgKSA9PiB7XHJcbiAgICAgIHRoaXMuY2lyY3VpdE5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIGN1cnJlbnRab29tICk7XHJcbiAgICAgIHRoaXMuY2lyY3VpdE5vZGVCYWNrTGF5ZXIuc2V0U2NhbGVNYWduaXR1ZGUoIGN1cnJlbnRab29tICk7XHJcbiAgICAgIHRoaXMuY2lyY3VpdE5vZGUudXBkYXRlVHJhbnNmb3JtKCB2aXNpYmxlQm91bmRzICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiBhIFZlcnRleCBpcyBkcm9wcGVkIGFuZCB0aGUgQ2lyY3VpdEVsZW1lbnQgaXMgb3ZlciB0aGUgQ2lyY3VpdEVsZW1lbnRUb29sYm94LCB0aGUgQ2lyY3VpdEVsZW1lbnQgd2lsbCBnbyBiYWNrXHJcbiAgICAvLyBpbnRvIHRoZSB0b29sYm94XHJcbiAgICB0aGlzLm1vZGVsLmNpcmN1aXQudmVydGV4RHJvcHBlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHZlcnRleCA9PiB7XHJcblxyXG4gICAgICBjb25zdCBuZWlnaGJvcnMgPSB0aGlzLm1vZGVsLmNpcmN1aXQuZ2V0TmVpZ2hib3JDaXJjdWl0RWxlbWVudHMoIHZlcnRleCApO1xyXG4gICAgICBpZiAoIG5laWdoYm9ycy5sZW5ndGggPT09IDEgKSB7XHJcbiAgICAgICAgY29uc3QgY2lyY3VpdEVsZW1lbnQgPSBuZWlnaGJvcnNbIDAgXTtcclxuICAgICAgICBjb25zdCBjaXJjdWl0RWxlbWVudE5vZGUgPSB0aGlzLmNpcmN1aXROb2RlLmdldENpcmN1aXRFbGVtZW50Tm9kZSggY2lyY3VpdEVsZW1lbnQgKTtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLmNhbk5vZGVEcm9wSW5Ub29sYm94KCBjaXJjdWl0RWxlbWVudE5vZGUgKSApIHtcclxuICAgICAgICAgIHRoaXMubW9kZWwuY2lyY3VpdC5kaXNwb3NlQ2lyY3VpdEVsZW1lbnQoIGNpcmN1aXRFbGVtZW50ICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmUtcmVuZGVyIGFmdGVyIHNldHRpbmcgc3RhdGVcclxuICAgIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lLnN0YXRlU2V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLnN0ZXAoIDEgLyA2MCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG5vdGUgd2hldGhlciB0aGUgc3RvcHdhdGNoIHNob3VsZCBiZSByZXBvc2l0aW9uZWQgd2hlbiBzZWxlY3RlZC4gIE90aGVyd2lzZSBpdCByZW1lbWJlcnMgaXRzIHBvc2l0aW9uXHJcbiAgICB0aGlzLnN0b3B3YXRjaE5vZGVQb3NpdGlvbkRpcnR5ID0gdHJ1ZTtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd1N0b3B3YXRjaENoZWNrYm94ICkge1xyXG4gICAgICBjb25zdCBzdG9wd2F0Y2hOb2RlID0gbmV3IFN0b3B3YXRjaE5vZGUoIG1vZGVsLnN0b3B3YXRjaCwge1xyXG4gICAgICAgIGRyYWdCb3VuZHNQcm9wZXJ0eTogdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksXHJcbiAgICAgICAgcmlnaHQ6IGNvbnRyb2xQYW5lbFZCb3gubGVmdCAtIEhPUklaT05UQUxfTUFSR0lOLFxyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICBudW1iZXJGb3JtYXR0ZXI6IFN0b3B3YXRjaE5vZGUuY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIoIHtcclxuICAgICAgICAgICAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiAxXHJcbiAgICAgICAgICB9IClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N0b3B3YXRjaE5vZGUnIClcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBzdG9wd2F0Y2hOb2RlICk7XHJcblxyXG4gICAgICAvLyBTaG93IHRoZSBTdG9wd2F0Y2hOb2RlIHdoZW4gdGhlIGNoZWNrYm94IGlzIGNoZWNrZWRcclxuICAgICAgbW9kZWwuc3RvcHdhdGNoLmlzVmlzaWJsZVByb3BlcnR5LmxpbmsoIGlzVmlzaWJsZSA9PiB7XHJcbiAgICAgICAgaWYgKCBpc1Zpc2libGUgJiYgdGhpcy5zdG9wd2F0Y2hOb2RlUG9zaXRpb25EaXJ0eSApIHtcclxuXHJcbiAgICAgICAgICAvLyBDb21wdXRlIGJvdW5kcyBsYXppbHkgbm93IHRoYXQgZXZlcnl0aGluZyBpcyBhdHRhY2hlZCB0byB0aGUgc2NlbmUgZ3JhcGhcclxuICAgICAgICAgIG1vZGVsLnN0b3B3YXRjaC5wb3NpdGlvblByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgICAgIGNvbnRyb2xQYW5lbFZCb3gubGVmdCAtIHN0b3B3YXRjaE5vZGUud2lkdGggLSAxMCxcclxuXHJcbiAgICAgICAgICAgIC8vIGNlbnRlciB0aGUgdGV4dCBhcmUgdmVydGljYWxseSBvbiB0aGUgY2hlY2tib3gsIHNvIHRoZSBub24tZHJhZ2dhYmxlIGJ1dHRvbnMgYXJlbid0IHJpZ2h0IG5leHQgdG8gdGhlIGNoZWNrYm94XHJcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggdGhpcy5kaXNwbGF5T3B0aW9uc1BhbmVsLnN0b3B3YXRjaENoZWNrYm94IS5nbG9iYWxCb3VuZHMgKS5jZW50ZXJZIC0gc3RvcHdhdGNoTm9kZS5oZWlnaHQgKiAwLjJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICB0aGlzLnN0b3B3YXRjaE5vZGVQb3NpdGlvbkRpcnR5ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgbW9kZWwuc3RlcEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGR0ID0+IHRoaXMuc3RlcE9uY2UoIGR0ICkgKTtcclxuXHJcbiAgICAvLyBBZGQgYSBnbG9iYWwga2V5IGxpc3RlbmVyIG9uIGEgbmVzdGVkIE5vZGUgc2luY2UgaGF2aW5nIGEgbGlzdGVuZXIgb24gdGhlIHJvb3Qgd291bGQgbWFrZSBwaWNrYWJsZTpudWxsIHRoaW5nc1xyXG4gICAgLy8gaW50byBwaWNrYWJsZTogdHJ1ZSBhbmQgaGVuY2UgYmxvY2sgaW5wdXQsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2lyY3VpdC1jb25zdHJ1Y3Rpb24ta2l0LWNvbW1vbi9pc3N1ZXMvOTg1XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTm9kZSgge1xyXG4gICAgICBpbnB1dExpc3RlbmVyczogWyBuZXcgS2V5Ym9hcmRMaXN0ZW5lcigge1xyXG4gICAgICAgIGtleXM6IFsgJ2RlbGV0ZScsICdiYWNrc3BhY2UnIF0sXHJcbiAgICAgICAgZ2xvYmFsOiB0cnVlLFxyXG4gICAgICAgIGNhbGxiYWNrOiAoIGV2ZW50LCBsaXN0ZW5lciApID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBwcmV2ZW50IGRlZmF1bHQgc28gJ2JhY2tzcGFjZScgYW5kICdkZWxldGUnIGRvbid0IG5hdmlnYXRlIGJhY2sgYSBwYWdlIGluIEZpcmVmb3gsIHNlZVxyXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzMwN1xyXG4gICAgICAgICAgZXZlbnQ/LmRvbUV2ZW50Py5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgIC8vIERvdWJsZSBndWFyZCB0byB3b3JrIGFyb3VuZCBlcnJvcnMgaW4gZnV6emluZ1xyXG4gICAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gdGhpcy5jaXJjdWl0Tm9kZS5jaXJjdWl0LnNlbGVjdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLmNpcmN1aXROb2RlLnZlcnRleEN1dEJ1dHRvbi5pbnB1dEVuYWJsZWQgJiYgc2VsZWN0aW9uIGluc3RhbmNlb2YgVmVydGV4ICkge1xyXG4gICAgICAgICAgICB0aGlzLmNpcmN1aXROb2RlLmNpcmN1aXQuY3V0VmVydGV4KCB0aGlzLmNpcmN1aXROb2RlLmNpcmN1aXQuZ2V0U2VsZWN0ZWRWZXJ0ZXgoKSEgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2UgaWYgKCBzZWxlY3Rpb24gaW5zdGFuY2VvZiBDaXJjdWl0RWxlbWVudCApIHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGNpcmN1aXRFbGVtZW50ID0gc2VsZWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgLy8gT25seSBwZXJtaXQgZGVsZXRpb24gd2hlbiBub3QgYmVpbmcgZHJhZ2dlZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2lzc3Vlcy80MTRcclxuICAgICAgICAgICAgaWYgKCAhY2lyY3VpdEVsZW1lbnQuc3RhcnRWZXJ0ZXhQcm9wZXJ0eS52YWx1ZS5pc0RyYWdnZWQgJiYgIWNpcmN1aXRFbGVtZW50LmVuZFZlcnRleFByb3BlcnR5LnZhbHVlLmlzRHJhZ2dlZCApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gT25seSBwZXJtaXQgZGVsZXRpb24gaWYgdGhlIGNpcmN1aXQgZWxlbWVudCBpcyBtYXJrZWQgYXMgZGlzcG9zYWJsZVxyXG4gICAgICAgICAgICAgIGlmICggY2lyY3VpdEVsZW1lbnQuaXNEaXNwb3NhYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNpcmN1aXROb2RlLmNpcmN1aXQuZGlzcG9zZUNpcmN1aXRFbGVtZW50KCBjaXJjdWl0RWxlbWVudCApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApIF1cclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGZyb20gbW9kZWwgc3RlcHNcclxuICAgKi9cclxuICBwcml2YXRlIHN0ZXBPbmNlKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIElmIHRoZSBzdGVwIGlzIGxhcmdlLCBpdCBwcm9iYWJseSBtZWFucyB0aGF0IHRoZSBzY3JlZW4gd2FzIGhpZGRlbiBmb3IgYSB3aGlsZSwgc28ganVzdCBpZ25vcmUgaXQuXHJcbiAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NpcmN1aXQtY29uc3RydWN0aW9uLWtpdC1jb21tb24vaXNzdWVzLzQ3NlxyXG4gICAgaWYgKCBkdCA+PSBDQ0tDQ29uc3RhbnRzLk1BWF9EVCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY2hhcnROb2Rlcy5mb3JFYWNoKCBjaGFydE5vZGUgPT4gY2hhcnROb2RlLnN0ZXAoIHRoaXMubW9kZWwuY2lyY3VpdC50aW1lUHJvcGVydHkudmFsdWUsIGR0ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmUgZm9yd2FyZCBpbiB0aW1lIGJ5IHRoZSBzcGVjaWZpZWQgZHRcclxuICAgKiBAcGFyYW0gZHQgLSBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gbm90aW5nIGZyb20gdGhlIG1haW4gc3RlcFxyXG4gICAgdGhpcy5jaXJjdWl0Tm9kZS5zdGVwKCk7XHJcblxyXG4gICAgLy8gaWYgdGhlIG1vZGVsIGlzIHN0ZXBwaW5nLCB0aGUgY2hhcnRzIHdpbGwgc2FtcGxlIG5ldyB2YWx1ZXMuICBPdGhlcndpc2UsIHRha2UgYSByZWFkaW5nIGF0IHRoZSBjdXJyZW50IHBvaW50LFxyXG4gICAgLy8gZm9yIHVwZGF0aW5nIHRoZSBwZW4gbG9jYXRpb25cclxuICAgIGlmICggIXRoaXMubW9kZWwuaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMuY2hhcnROb2Rlcy5mb3JFYWNoKCBjaGFydE5vZGUgPT4gY2hhcnROb2RlLnNhbXBsZUxhdGVzdFZhbHVlKCkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE92ZXJyaWRlYWJsZSBzdHViIGZvciByZXNldHRpbmdcclxuICAgKi9cclxuICBwcml2YXRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdG9wd2F0Y2hOb2RlUG9zaXRpb25EaXJ0eSA9IHRydWU7XHJcbiAgICB0aGlzLmNpcmN1aXRFbGVtZW50VG9vbGJveC5yZXNldCgpO1xyXG4gICAgdGhpcy5hZHZhbmNlZEFjY29yZGlvbkJveCAmJiB0aGlzLmFkdmFuY2VkQWNjb3JkaW9uQm94LmV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY2hhcnROb2Rlcy5mb3JFYWNoKCBjaGFydE5vZGUgPT4gY2hhcnROb2RlLnJlc2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoZSBDaXJjdWl0RWxlbWVudE5vZGUgY2FuIGJlIGRyb3BwZWQgaW4gdGhlIHRvb2xib3guXHJcbiAgICovXHJcbiAgcHVibGljIGNhbk5vZGVEcm9wSW5Ub29sYm94KCBjaXJjdWl0RWxlbWVudE5vZGU6IENpcmN1aXRFbGVtZW50Tm9kZSApOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGNpcmN1aXRFbGVtZW50ID0gY2lyY3VpdEVsZW1lbnROb2RlLmNpcmN1aXRFbGVtZW50O1xyXG5cclxuICAgIC8vIE9ubHkgc2luZ2xlICh1bmNvbm5lY3RlZCkgZWxlbWVudHMgY2FuIGJlIGRyb3BwZWQgaW50byB0aGUgdG9vbGJveFxyXG4gICAgY29uc3QgaXNTaW5nbGUgPSB0aGlzLm1vZGVsLmNpcmN1aXQuaXNTaW5nbGUoIGNpcmN1aXRFbGVtZW50ICk7XHJcblxyXG4gICAgY29uc3QgY29tcG9uZW50SW1hZ2UgPSBjaXJjdWl0RWxlbWVudE5vZGUgaW5zdGFuY2VvZiBGaXhlZENpcmN1aXRFbGVtZW50Tm9kZSA/IGNpcmN1aXRFbGVtZW50Tm9kZS5jb250ZW50Tm9kZSA6IGNpcmN1aXRFbGVtZW50Tm9kZTtcclxuICAgIGNvbnN0IGVsZW1lbnROb2RlQm91bmRzID0gdGhpcy5nbG9iYWxUb0xvY2FsQm91bmRzKCBjb21wb25lbnRJbWFnZS5nbG9iYWxCb3VuZHMgKTtcclxuICAgIGNvbnN0IGVsZW1lbnROb2RlQm91bmRzRXJvZGVkID0gQ0NLQ1V0aWxzLmdldERyb3BJdGVtSGl0Qm94Rm9yQm91bmRzKCBlbGVtZW50Tm9kZUJvdW5kcyApO1xyXG5cclxuICAgIC8vIFNlcmllc0FtbWV0ZXJzIHNob3VsZCBiZSBkcm9wcGVkIGluIHRoZSBzZW5zb3IgdG9vbGJveFxyXG4gICAgY29uc3QgdG9vbGJveCA9IGNpcmN1aXRFbGVtZW50IGluc3RhbmNlb2YgU2VyaWVzQW1tZXRlciA/IHRoaXMuc2Vuc29yVG9vbGJveCA6IHRoaXMuY2lyY3VpdEVsZW1lbnRUb29sYm94LmNhcm91c2VsO1xyXG5cclxuICAgIGNvbnN0IGdsb2JhbENhcm91c2VsQm91bmRzID0gdG9vbGJveC5sb2NhbFRvR2xvYmFsQm91bmRzKCB0b29sYm94LmxvY2FsQm91bmRzICk7XHJcbiAgICBjb25zdCBjYXJvdXNlbEJvdW5kcyA9IHRoaXMuZ2xvYmFsVG9Mb2NhbEJvdW5kcyggZ2xvYmFsQ2Fyb3VzZWxCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBEZXRlY3Qgd2hldGhlciBlcm9kZWQgY29tcG9uZW50IGltYWdlIGJvdW5kcyBpbnRlcnNlY3RzIHRoZSB0b29sYm94IGJvdW5kc1xyXG4gICAgY29uc3Qgb3ZlclRvb2xib3ggPSBjYXJvdXNlbEJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCBlbGVtZW50Tm9kZUJvdW5kc0Vyb2RlZCApO1xyXG5cclxuICAgIHJldHVybiBpc1NpbmdsZSAmJiBvdmVyVG9vbGJveCAmJiBjaXJjdWl0RWxlbWVudC5pc0Rpc3Bvc2FibGVQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVn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