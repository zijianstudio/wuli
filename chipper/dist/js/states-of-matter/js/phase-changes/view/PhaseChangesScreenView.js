// Copyright 2014-2022, University of Colorado Boulder

/**
 * view for the Phase Changes screen
 *
 * @author John Blanco
 * @author Siddhartha Chinthapally (Actual Concepts)
 * @author Aaron Davis
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BicyclePumpNode from '../../../../scenery-phet/js/BicyclePumpNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HeaterCoolerNode from '../../../../scenery-phet/js/HeaterCoolerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { Node, RichText } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import MultipleParticleModel from '../../common/model/MultipleParticleModel.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMQueryParameters from '../../common/SOMQueryParameters.js';
import SubstanceType from '../../common/SubstanceType.js';
import ParticleContainerNode from '../../common/view/ParticleContainerNode.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import InteractionPotentialAccordionBox from './InteractionPotentialAccordionBox.js';
import PhaseChangesMoleculesControlPanel from './PhaseChangesMoleculesControlPanel.js';
import PhaseDiagramAccordionBox from './PhaseDiagramAccordionBox.js';

// strings
const returnLidString = StatesOfMatterStrings.returnLid;

// constants
const PANEL_WIDTH = 170; // empirically determined to be wide enough for all contents using English strings with some margin
const INTER_PANEL_SPACING = 8;

// constants used when mapping the model pressure and temperature to the phase diagram.
const TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM = 0.375;
const CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM = 0.8;

// Used for calculating moving averages needed to mellow out the graph behavior.  Value empirically determined.
const MAX_NUM_HISTORY_SAMPLES = 100;

// constants used in the layout process
const CONTROL_PANEL_X_INSET = 15;
class PhaseChangesScreenView extends ScreenView {
  /**
   * @param {PhaseChangesModel} model - model of the simulation
   * @param {boolean} isPotentialGraphEnabled
   * @param {Tandem} tandem
   */
  constructor(model, isPotentialGraphEnabled, tandem) {
    super(merge({
      tandem: tandem
    }, SOMConstants.SCREEN_VIEW_OPTIONS));

    // @private
    this.multipleParticleModel = model;
    this.modelTemperatureHistory = createObservableArray({
      allowDuplicates: true
    });

    // Create the model-view transform. The multipliers for the 2nd parameter can be used to adjust where the point
    // (0, 0) in the model, which is the lower left corner of the particle container, appears in the view.The final
    // parameter is the scale, and can be changed to make the view more zoomed in or out.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(this.layoutBounds.width * 0.325, this.layoutBounds.height * 0.75), SOMConstants.VIEW_CONTAINER_WIDTH / MultipleParticleModel.PARTICLE_CONTAINER_WIDTH);

    // figure out where in the view the particles will be when the container is not exploded
    const nominalParticleAreaViewBounds = new Bounds2(modelViewTransform.modelToViewX(0), modelViewTransform.modelToViewY(0) + modelViewTransform.modelToViewDeltaY(MultipleParticleModel.PARTICLE_CONTAINER_INITIAL_HEIGHT), modelViewTransform.modelToViewX(0) + modelViewTransform.modelToViewDeltaX(MultipleParticleModel.PARTICLE_CONTAINER_WIDTH), modelViewTransform.modelToViewY(0));

    // create the particle container - it takes care of positioning itself
    this.particleContainerNode = new ParticleContainerNode(model, modelViewTransform, {
      volumeControlEnabled: true,
      pressureGaugeEnabled: true,
      thermometerXOffsetFromCenter: modelViewTransform.modelToViewDeltaX(-MultipleParticleModel.PARTICLE_CONTAINER_WIDTH * 0.15),
      tandem: tandem.createTandem('particleContainerNode')
    });

    // add the particle container
    this.addChild(this.particleContainerNode);

    // add heater/cooler node
    const heaterCoolerNode = new HeaterCoolerNode(model.heatingCoolingAmountProperty, {
      scale: 0.79,
      centerX: nominalParticleAreaViewBounds.centerX,
      top: nominalParticleAreaViewBounds.maxY + 30,
      // offset from container bottom empirically determined
      tandem: tandem.createTandem('heaterCoolerNode'),
      frontOptions: {
        snapToZero: !SOMQueryParameters.stickyBurners
      }
    });
    this.addChild(heaterCoolerNode);

    // control when the heater/cooler node is enabled for input
    Multilink.multilink([model.isPlayingProperty, model.isExplodedProperty], (isPlaying, isExploded) => {
      if (!isPlaying || isExploded) {
        heaterCoolerNode.interruptSubtreeInput(); // cancel interaction
        heaterCoolerNode.heatCoolAmountProperty.set(0); // force to zero in case snapToZero is off
        heaterCoolerNode.slider.enabled = false;
      } else {
        heaterCoolerNode.slider.enabled = true;
      }
    });

    // add reset all button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.modelTemperatureHistory.clear();
        model.reset();
        this.particleContainerNode.reset();

        // Reset phase diagram state in SOM basic version.
        model.phaseDiagramExpandedProperty.value = isPotentialGraphEnabled;
        this.pumpNode.reset();
      },
      radius: SOMConstants.RESET_ALL_BUTTON_RADIUS,
      right: this.layoutBounds.maxX - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_SIDE,
      bottom: this.layoutBounds.maxY - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // add play pause button and step button
    this.addChild(new TimeControlNode(model.isPlayingProperty, {
      playPauseStepButtonOptions: {
        playPauseButtonOptions: {
          radius: SOMConstants.PLAY_PAUSE_BUTTON_RADIUS
        },
        stepForwardButtonOptions: {
          radius: SOMConstants.STEP_BUTTON_RADIUS,
          listener: () => {
            model.stepInTime(SOMConstants.NOMINAL_TIME_STEP);
          }
        },
        playPauseStepXSpacing: 10
      },
      // position empirically determined
      right: heaterCoolerNode.left - 50,
      centerY: heaterCoolerNode.centerY,
      tandem: tandem.createTandem('timeControlNode')
    }));

    // Pump is located at the bottom left of the screen.
    const pumpPosition = new Vector2(106, 466);

    // Hose attaches to the bottom left side of the container.
    const hoseAttachmentPoint = new Vector2(nominalParticleAreaViewBounds.left, nominalParticleAreaViewBounds.bottom - 70);

    // Create a derived property that will be used to control the enabled state of the bicycle pump node.
    const bicyclePumpEnabledProperty = new DerivedProperty([model.isPlayingProperty, model.isExplodedProperty, model.lidAboveInjectionPointProperty, model.maxNumberOfMoleculesProperty, model.targetNumberOfMoleculesProperty], (isPlaying, isExploded, lidAboveInjectionPoint, maxNumberOfMoleculesProperty, targetNumberOfMolecules) => {
      return isPlaying && !isExploded && lidAboveInjectionPoint && targetNumberOfMolecules < maxNumberOfMoleculesProperty;
    });

    // Create a range property that can be provided to the bicycle pump.
    const numberOfMoleculesRangeProperty = new Property(new Range(0, model.maxNumberOfMoleculesProperty.value));
    model.maxNumberOfMoleculesProperty.lazyLink(maxNumberOfMolecules => {
      numberOfMoleculesRangeProperty.set(new Range(0, maxNumberOfMolecules));
    });

    // add bicycle pump node
    this.pumpNode = new BicyclePumpNode(model.targetNumberOfMoleculesProperty, numberOfMoleculesRangeProperty, {
      nodeEnabledProperty: bicyclePumpEnabledProperty,
      injectionEnabledProperty: model.isInjectionAllowedProperty,
      translation: pumpPosition,
      hoseAttachmentOffset: hoseAttachmentPoint.minus(pumpPosition),
      hoseCurviness: 1.5,
      handleTouchAreaXDilation: 100,
      handleTouchAreaYDilation: 100,
      dragListenerOptions: {
        numberOfParticlesPerPumpAction: 3
      },
      tandem: tandem.createTandem('pumpNode')
    });
    this.addChild(this.pumpNode);

    // add return lid button
    this.returnLidButton = new TextPushButton(returnLidString, {
      font: new PhetFont(14),
      baseColor: 'yellow',
      maxWidth: 100,
      listener: () => {
        model.returnLid();
      },
      visible: false,
      xMargin: 10,
      centerX: nominalParticleAreaViewBounds.minX - 150,
      centerY: nominalParticleAreaViewBounds.minY,
      // phet-io
      tandem: tandem.createTandem('returnLidButton'),
      phetioReadOnly: true,
      visiblePropertyOptions: {
        phetioReadOnly: true
      },
      enabledPropertyOptions: {
        phetioReadOnly: true
      }
    });
    this.addChild(this.returnLidButton);
    model.isExplodedProperty.linkAttribute(this.returnLidButton, 'visible');

    // add interaction potential diagram
    let interactionPotentialAccordionBox = null;
    if (isPotentialGraphEnabled) {
      interactionPotentialAccordionBox = new InteractionPotentialAccordionBox(SOMConstants.MAX_SIGMA, SOMConstants.MIN_EPSILON, model, {
        maxWidth: PANEL_WIDTH,
        minWidth: PANEL_WIDTH,
        right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
        tandem: tandem.createTandem('interactionPotentialAccordionBox')
      });
      this.addChild(interactionPotentialAccordionBox);
    }

    // add the atom/molecule selection control panel
    const moleculesControlPanel = new PhaseChangesMoleculesControlPanel(model, {
      showAdjustableAttraction: isPotentialGraphEnabled,
      right: this.layoutBounds.right - CONTROL_PANEL_X_INSET,
      top: 5,
      maxWidth: PANEL_WIDTH,
      minWidth: PANEL_WIDTH,
      tandem: tandem.createTandem('moleculesControlPanel')
    });
    this.addChild(moleculesControlPanel);

    // Add a container node that will hold the phase diagram accordion box.  This is done so that the overall visibility
    // of the diagram box can be controlled using phet-io independently of the dynamic hide/show behavior implemented
    // below.  See https://github.com/phetsims/states-of-matter/issues/332.
    const phaseDiagramContainer = new Node({
      tandem: tandem.createTandem('phaseDiagramContainer')
    });
    this.addChild(phaseDiagramContainer);

    // add phase diagram - in SOM basic version by default phase diagram should be closed.
    model.phaseDiagramExpandedProperty.value = isPotentialGraphEnabled;
    this.phaseDiagramAccordionBox = new PhaseDiagramAccordionBox(model.phaseDiagramExpandedProperty, {
      minWidth: PANEL_WIDTH,
      maxWidth: PANEL_WIDTH,
      right: moleculesControlPanel.right,
      top: moleculesControlPanel.top + INTER_PANEL_SPACING,
      tandem: phaseDiagramContainer.tandem.createTandem('phaseDiagramAccordionBox')
    });
    phaseDiagramContainer.addChild(this.phaseDiagramAccordionBox);

    // @private - variables used to map temperature on to the phase diagram
    this.triplePointTemperatureInModelUnits = 0;
    this.criticalPointTemperatureInModelUnits = 0;
    this.slopeInFirstRegion = 0;
    this.slopeInSecondRegion = 0;
    this.offsetInSecondRegion = 0;

    // monitor the substance and update the mappings to triple and critical points when changes occur
    model.substanceProperty.link(substance => {
      if (substance === SubstanceType.NEON || substance === SubstanceType.ARGON || substance === SubstanceType.ADJUSTABLE_ATOM) {
        this.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;
        this.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
      } else if (substance === SubstanceType.DIATOMIC_OXYGEN) {
        this.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_DIATOMIC_MODEL_TEMPERATURE;
        this.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_DIATOMIC_MODEL_TEMPERATURE;
      } else if (substance === SubstanceType.WATER) {
        this.triplePointTemperatureInModelUnits = SOMConstants.TRIPLE_POINT_WATER_MODEL_TEMPERATURE;
        this.criticalPointTemperatureInModelUnits = SOMConstants.CRITICAL_POINT_WATER_MODEL_TEMPERATURE;
      }
      this.slopeInFirstRegion = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM / this.triplePointTemperatureInModelUnits;
      this.slopeInSecondRegion = (CRITICAL_POINT_TEMPERATURE_ON_DIAGRAM - TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM) / (this.criticalPointTemperatureInModelUnits - this.triplePointTemperatureInModelUnits);
      this.offsetInSecondRegion = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - this.slopeInSecondRegion * this.triplePointTemperatureInModelUnits;
    });

    // handle explosions of the container
    model.isExplodedProperty.link(() => {
      this.modelTemperatureHistory.clear();
      this.updatePhaseDiagram();
    });

    // Hook up a function that updates several view attributes when the substance changes.
    model.substanceProperty.link(substance => {
      this.modelTemperatureHistory.clear();
      this.updatePhaseDiagram();
      this.phaseDiagramAccordionBox.setDepictingWater(substance === SubstanceType.WATER);
      if (isPotentialGraphEnabled) {
        if (substance === SubstanceType.ADJUSTABLE_ATOM || substance === SubstanceType.DIATOMIC_OXYGEN || substance === SubstanceType.WATER) {
          interactionPotentialAccordionBox.setMolecular(true);
        } else {
          interactionPotentialAccordionBox.setMolecular(false);
        }
      }

      // don't show the phase diagram for adjustable attraction, since we need the space for other things
      this.phaseDiagramAccordionBox.visible = substance !== SubstanceType.ADJUSTABLE_ATOM;
    });

    // Update layout based on the visibility and bounds of the various control panels and accordion boxes.
    Multilink.multilink([this.phaseDiagramAccordionBox.visibleProperty, moleculesControlPanel.boundsProperty], (phaseDiagramVisible, moleculeControlPanelBounds) => {
      if (isPotentialGraphEnabled) {
        interactionPotentialAccordionBox.top = moleculeControlPanelBounds.bottom + INTER_PANEL_SPACING;
        this.phaseDiagramAccordionBox.top = interactionPotentialAccordionBox.bottom + INTER_PANEL_SPACING;
      } else {
        this.phaseDiagramAccordionBox.top = moleculeControlPanelBounds.bottom + INTER_PANEL_SPACING;
      }
    });

    // Happy Easter
    const egg = new RichText('Goodbye boiling water -<br>you will be mist!', {
      fill: 'yellow',
      font: new PhetFont(14),
      align: 'left',
      left: this.returnLidButton.left,
      top: this.returnLidButton.bottom + 20
    });
    this.addChild(egg);
    let eggShown = false;
    model.isPlayingProperty.link(isPlaying => {
      egg.visible = !isPlaying && model.isExplodedProperty.get() && model.substanceProperty.get() === SubstanceType.WATER && !eggShown;
      if (egg.visible) {
        eggShown = true;
      }
    });

    // Monitor the model for changes of the container size and adjust the view accordingly.
    model.containerHeightProperty.link(() => {
      this.updatePhaseDiagram();
    });
    model.temperatureSetPointProperty.link(() => {
      this.modelTemperatureHistory.clear();
      this.updatePhaseDiagram();
    });
    model.scaledAtoms.lengthProperty.link(() => {
      this.updatePhaseDiagram();
    });
  }

  // @public
  step(dt) {
    this.particleContainerNode.step(dt);
  }

  /**
   * Update the position of the marker on the phase diagram based on the temperature and pressure values within the
   * model.
   * @private
   */
  updatePhaseDiagram() {
    // If the container has exploded, don't bother showing the dot.
    if (this.multipleParticleModel.isExplodedProperty.get() || this.multipleParticleModel.scaledAtoms.length === 0) {
      this.phaseDiagramAccordionBox.setStateMarkerVisible(false);
    } else {
      this.phaseDiagramAccordionBox.setStateMarkerVisible(true);
      const movingAverageTemperature = this.updateMovingAverageTemperature(this.multipleParticleModel.temperatureSetPointProperty.get());
      const modelPressure = this.multipleParticleModel.getModelPressure();
      const mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature(movingAverageTemperature);
      const mappedPressure = this.mapModelTempAndPressureToPhaseDiagramPressure(modelPressure, movingAverageTemperature);
      this.phaseDiagramAccordionBox.setStateMarkerPos(mappedTemperature, mappedPressure);
    }
  }

  /**
   * Update and returns the moving average taking into account the new temperature value.
   * @param {number} newTemperatureValue
   * @returns {number}
   * @private
   */
  updateMovingAverageTemperature(newTemperatureValue) {
    if (this.modelTemperatureHistory.length === MAX_NUM_HISTORY_SAMPLES) {
      this.modelTemperatureHistory.shift();
    }
    this.modelTemperatureHistory.push(newTemperatureValue);
    let totalOfAllTemperatures = 0;
    for (let i = 0; i < this.modelTemperatureHistory.length; i++) {
      totalOfAllTemperatures += this.modelTemperatureHistory.get(i);
    }
    return totalOfAllTemperatures / this.modelTemperatureHistory.length;
  }

  /**
   * Map the model temperature to phase diagram temperature based on the phase chart shape.
   * @param {number} modelTemperature
   * @returns {number}
   * @private
   */
  mapModelTemperatureToPhaseDiagramTemperature(modelTemperature) {
    let mappedTemperature;
    if (modelTemperature < this.triplePointTemperatureInModelUnits) {
      mappedTemperature = this.slopeInFirstRegion * modelTemperature;
    } else {
      mappedTemperature = modelTemperature * this.slopeInSecondRegion + this.offsetInSecondRegion;
    }
    return Math.min(mappedTemperature, 1);
  }

  /**
   * Map the model temperature and pressure to a normalized pressure value suitable for use in setting the marker
   * position on the phase chart.
   * @param {number} modelPressure
   * @param {number} modelTemperature
   * @returns {number}
   * @private
   */
  mapModelTempAndPressureToPhaseDiagramPressure(modelPressure, modelTemperature) {
    // This method is a total tweak fest.  All values and equations are made to map to the phase diagram, and are NOT
    // based on any real-world equations that define phases of matter.
    const cutOverTemperature = TRIPLE_POINT_TEMPERATURE_ON_DIAGRAM - 0.025;
    const mappedTemperature = this.mapModelTemperatureToPhaseDiagramTemperature(modelTemperature);
    let mappedPressure;
    if (mappedTemperature <= cutOverTemperature) {
      mappedPressure = Math.pow(mappedTemperature, 1.6);
    } else {
      mappedPressure = Math.pow(mappedTemperature - cutOverTemperature, 1.75) + 0.192;
    }
    return Math.min(mappedPressure, 1);
  }
}
statesOfMatter.register('PhaseChangesScreenView', PhaseChangesScreenView);
export default PhaseChangesScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwibWVyZ2UiLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiQmljeWNsZVB1bXBOb2RlIiwiUmVzZXRBbGxCdXR0b24iLCJIZWF0ZXJDb29sZXJOb2RlIiwiUGhldEZvbnQiLCJUaW1lQ29udHJvbE5vZGUiLCJOb2RlIiwiUmljaFRleHQiLCJUZXh0UHVzaEJ1dHRvbiIsIk11bHRpcGxlUGFydGljbGVNb2RlbCIsIlNPTUNvbnN0YW50cyIsIlNPTVF1ZXJ5UGFyYW1ldGVycyIsIlN1YnN0YW5jZVR5cGUiLCJQYXJ0aWNsZUNvbnRhaW5lck5vZGUiLCJzdGF0ZXNPZk1hdHRlciIsIlN0YXRlc09mTWF0dGVyU3RyaW5ncyIsIkludGVyYWN0aW9uUG90ZW50aWFsQWNjb3JkaW9uQm94IiwiUGhhc2VDaGFuZ2VzTW9sZWN1bGVzQ29udHJvbFBhbmVsIiwiUGhhc2VEaWFncmFtQWNjb3JkaW9uQm94IiwicmV0dXJuTGlkU3RyaW5nIiwicmV0dXJuTGlkIiwiUEFORUxfV0lEVEgiLCJJTlRFUl9QQU5FTF9TUEFDSU5HIiwiVFJJUExFX1BPSU5UX1RFTVBFUkFUVVJFX09OX0RJQUdSQU0iLCJDUklUSUNBTF9QT0lOVF9URU1QRVJBVFVSRV9PTl9ESUFHUkFNIiwiTUFYX05VTV9ISVNUT1JZX1NBTVBMRVMiLCJDT05UUk9MX1BBTkVMX1hfSU5TRVQiLCJQaGFzZUNoYW5nZXNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImlzUG90ZW50aWFsR3JhcGhFbmFibGVkIiwidGFuZGVtIiwiU0NSRUVOX1ZJRVdfT1BUSU9OUyIsIm11bHRpcGxlUGFydGljbGVNb2RlbCIsIm1vZGVsVGVtcGVyYXR1cmVIaXN0b3J5IiwiYWxsb3dEdXBsaWNhdGVzIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJsYXlvdXRCb3VuZHMiLCJ3aWR0aCIsImhlaWdodCIsIlZJRVdfQ09OVEFJTkVSX1dJRFRIIiwiUEFSVElDTEVfQ09OVEFJTkVSX1dJRFRIIiwibm9taW5hbFBhcnRpY2xlQXJlYVZpZXdCb3VuZHMiLCJtb2RlbFRvVmlld1giLCJtb2RlbFRvVmlld1kiLCJtb2RlbFRvVmlld0RlbHRhWSIsIlBBUlRJQ0xFX0NPTlRBSU5FUl9JTklUSUFMX0hFSUdIVCIsIm1vZGVsVG9WaWV3RGVsdGFYIiwicGFydGljbGVDb250YWluZXJOb2RlIiwidm9sdW1lQ29udHJvbEVuYWJsZWQiLCJwcmVzc3VyZUdhdWdlRW5hYmxlZCIsInRoZXJtb21ldGVyWE9mZnNldEZyb21DZW50ZXIiLCJjcmVhdGVUYW5kZW0iLCJhZGRDaGlsZCIsImhlYXRlckNvb2xlck5vZGUiLCJoZWF0aW5nQ29vbGluZ0Ftb3VudFByb3BlcnR5Iiwic2NhbGUiLCJjZW50ZXJYIiwidG9wIiwibWF4WSIsImZyb250T3B0aW9ucyIsInNuYXBUb1plcm8iLCJzdGlja3lCdXJuZXJzIiwibXVsdGlsaW5rIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJpc0V4cGxvZGVkUHJvcGVydHkiLCJpc1BsYXlpbmciLCJpc0V4cGxvZGVkIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwiaGVhdENvb2xBbW91bnRQcm9wZXJ0eSIsInNldCIsInNsaWRlciIsImVuYWJsZWQiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiY2xlYXIiLCJyZXNldCIsInBoYXNlRGlhZ3JhbUV4cGFuZGVkUHJvcGVydHkiLCJ2YWx1ZSIsInB1bXBOb2RlIiwicmFkaXVzIiwiUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMiLCJyaWdodCIsIm1heFgiLCJSRVNFVF9BTExfQlVUVE9OX0RJU1RBTkNFX0ZST01fU0lERSIsImJvdHRvbSIsIlJFU0VUX0FMTF9CVVRUT05fRElTVEFOQ0VfRlJPTV9CT1RUT00iLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsInBsYXlQYXVzZUJ1dHRvbk9wdGlvbnMiLCJQTEFZX1BBVVNFX0JVVFRPTl9SQURJVVMiLCJzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnMiLCJTVEVQX0JVVFRPTl9SQURJVVMiLCJzdGVwSW5UaW1lIiwiTk9NSU5BTF9USU1FX1NURVAiLCJwbGF5UGF1c2VTdGVwWFNwYWNpbmciLCJsZWZ0IiwiY2VudGVyWSIsInB1bXBQb3NpdGlvbiIsImhvc2VBdHRhY2htZW50UG9pbnQiLCJiaWN5Y2xlUHVtcEVuYWJsZWRQcm9wZXJ0eSIsImxpZEFib3ZlSW5qZWN0aW9uUG9pbnRQcm9wZXJ0eSIsIm1heE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHkiLCJ0YXJnZXROdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5IiwibGlkQWJvdmVJbmplY3Rpb25Qb2ludCIsInRhcmdldE51bWJlck9mTW9sZWN1bGVzIiwibnVtYmVyT2ZNb2xlY3VsZXNSYW5nZVByb3BlcnR5IiwibGF6eUxpbmsiLCJtYXhOdW1iZXJPZk1vbGVjdWxlcyIsIm5vZGVFbmFibGVkUHJvcGVydHkiLCJpbmplY3Rpb25FbmFibGVkUHJvcGVydHkiLCJpc0luamVjdGlvbkFsbG93ZWRQcm9wZXJ0eSIsInRyYW5zbGF0aW9uIiwiaG9zZUF0dGFjaG1lbnRPZmZzZXQiLCJtaW51cyIsImhvc2VDdXJ2aW5lc3MiLCJoYW5kbGVUb3VjaEFyZWFYRGlsYXRpb24iLCJoYW5kbGVUb3VjaEFyZWFZRGlsYXRpb24iLCJkcmFnTGlzdGVuZXJPcHRpb25zIiwibnVtYmVyT2ZQYXJ0aWNsZXNQZXJQdW1wQWN0aW9uIiwicmV0dXJuTGlkQnV0dG9uIiwiZm9udCIsImJhc2VDb2xvciIsIm1heFdpZHRoIiwidmlzaWJsZSIsInhNYXJnaW4iLCJtaW5YIiwibWluWSIsInBoZXRpb1JlYWRPbmx5IiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsImVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMiLCJsaW5rQXR0cmlidXRlIiwiaW50ZXJhY3Rpb25Qb3RlbnRpYWxBY2NvcmRpb25Cb3giLCJNQVhfU0lHTUEiLCJNSU5fRVBTSUxPTiIsIm1pbldpZHRoIiwibW9sZWN1bGVzQ29udHJvbFBhbmVsIiwic2hvd0FkanVzdGFibGVBdHRyYWN0aW9uIiwicGhhc2VEaWFncmFtQ29udGFpbmVyIiwicGhhc2VEaWFncmFtQWNjb3JkaW9uQm94IiwidHJpcGxlUG9pbnRUZW1wZXJhdHVyZUluTW9kZWxVbml0cyIsImNyaXRpY2FsUG9pbnRUZW1wZXJhdHVyZUluTW9kZWxVbml0cyIsInNsb3BlSW5GaXJzdFJlZ2lvbiIsInNsb3BlSW5TZWNvbmRSZWdpb24iLCJvZmZzZXRJblNlY29uZFJlZ2lvbiIsInN1YnN0YW5jZVByb3BlcnR5IiwibGluayIsInN1YnN0YW5jZSIsIk5FT04iLCJBUkdPTiIsIkFESlVTVEFCTEVfQVRPTSIsIlRSSVBMRV9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkUiLCJDUklUSUNBTF9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkUiLCJESUFUT01JQ19PWFlHRU4iLCJUUklQTEVfUE9JTlRfRElBVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkUiLCJDUklUSUNBTF9QT0lOVF9ESUFUT01JQ19NT0RFTF9URU1QRVJBVFVSRSIsIldBVEVSIiwiVFJJUExFX1BPSU5UX1dBVEVSX01PREVMX1RFTVBFUkFUVVJFIiwiQ1JJVElDQUxfUE9JTlRfV0FURVJfTU9ERUxfVEVNUEVSQVRVUkUiLCJ1cGRhdGVQaGFzZURpYWdyYW0iLCJzZXREZXBpY3RpbmdXYXRlciIsInNldE1vbGVjdWxhciIsInZpc2libGVQcm9wZXJ0eSIsImJvdW5kc1Byb3BlcnR5IiwicGhhc2VEaWFncmFtVmlzaWJsZSIsIm1vbGVjdWxlQ29udHJvbFBhbmVsQm91bmRzIiwiZWdnIiwiZmlsbCIsImFsaWduIiwiZWdnU2hvd24iLCJnZXQiLCJjb250YWluZXJIZWlnaHRQcm9wZXJ0eSIsInRlbXBlcmF0dXJlU2V0UG9pbnRQcm9wZXJ0eSIsInNjYWxlZEF0b21zIiwibGVuZ3RoUHJvcGVydHkiLCJzdGVwIiwiZHQiLCJsZW5ndGgiLCJzZXRTdGF0ZU1hcmtlclZpc2libGUiLCJtb3ZpbmdBdmVyYWdlVGVtcGVyYXR1cmUiLCJ1cGRhdGVNb3ZpbmdBdmVyYWdlVGVtcGVyYXR1cmUiLCJtb2RlbFByZXNzdXJlIiwiZ2V0TW9kZWxQcmVzc3VyZSIsIm1hcHBlZFRlbXBlcmF0dXJlIiwibWFwTW9kZWxUZW1wZXJhdHVyZVRvUGhhc2VEaWFncmFtVGVtcGVyYXR1cmUiLCJtYXBwZWRQcmVzc3VyZSIsIm1hcE1vZGVsVGVtcEFuZFByZXNzdXJlVG9QaGFzZURpYWdyYW1QcmVzc3VyZSIsInNldFN0YXRlTWFya2VyUG9zIiwibmV3VGVtcGVyYXR1cmVWYWx1ZSIsInNoaWZ0IiwicHVzaCIsInRvdGFsT2ZBbGxUZW1wZXJhdHVyZXMiLCJpIiwibW9kZWxUZW1wZXJhdHVyZSIsIk1hdGgiLCJtaW4iLCJjdXRPdmVyVGVtcGVyYXR1cmUiLCJwb3ciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBoYXNlQ2hhbmdlc1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogdmlldyBmb3IgdGhlIFBoYXNlIENoYW5nZXMgc2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBTaWRkaGFydGhhIENoaW50aGFwYWxseSAoQWN0dWFsIENvbmNlcHRzKVxyXG4gKiBAYXV0aG9yIEFhcm9uIERhdmlzXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgQmljeWNsZVB1bXBOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9CaWN5Y2xlUHVtcE5vZGUuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgSGVhdGVyQ29vbGVyTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvSGVhdGVyQ29vbGVyTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgVGltZUNvbnRyb2xOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9UaW1lQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSaWNoVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBNdWx0aXBsZVBhcnRpY2xlTW9kZWwgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL011bHRpcGxlUGFydGljbGVNb2RlbC5qcyc7XHJcbmltcG9ydCBTT01Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1NPTUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTT01RdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vY29tbW9uL1NPTVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBTdWJzdGFuY2VUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9TdWJzdGFuY2VUeXBlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlQ29udGFpbmVyTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9QYXJ0aWNsZUNvbnRhaW5lck5vZGUuanMnO1xyXG5pbXBvcnQgc3RhdGVzT2ZNYXR0ZXIgZnJvbSAnLi4vLi4vc3RhdGVzT2ZNYXR0ZXIuanMnO1xyXG5pbXBvcnQgU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzIGZyb20gJy4uLy4uL1N0YXRlc09mTWF0dGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBJbnRlcmFjdGlvblBvdGVudGlhbEFjY29yZGlvbkJveCBmcm9tICcuL0ludGVyYWN0aW9uUG90ZW50aWFsQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IFBoYXNlQ2hhbmdlc01vbGVjdWxlc0NvbnRyb2xQYW5lbCBmcm9tICcuL1BoYXNlQ2hhbmdlc01vbGVjdWxlc0NvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBQaGFzZURpYWdyYW1BY2NvcmRpb25Cb3ggZnJvbSAnLi9QaGFzZURpYWdyYW1BY2NvcmRpb25Cb3guanMnO1xyXG5cclxuLy8gc3RyaW5nc1xyXG5jb25zdCByZXR1cm5MaWRTdHJpbmcgPSBTdGF0ZXNPZk1hdHRlclN0cmluZ3MucmV0dXJuTGlkO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFBBTkVMX1dJRFRIID0gMTcwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHRvIGJlIHdpZGUgZW5vdWdoIGZvciBhbGwgY29udGVudHMgdXNpbmcgRW5nbGlzaCBzdHJpbmdzIHdpdGggc29tZSBtYXJnaW5cclxuY29uc3QgSU5URVJfUEFORUxfU1BBQ0lORyA9IDg7XHJcblxyXG4vLyBjb25zdGFudHMgdXNlZCB3aGVuIG1hcHBpbmcgdGhlIG1vZGVsIHByZXNzdXJlIGFuZCB0ZW1wZXJhdHVyZSB0byB0aGUgcGhhc2UgZGlhZ3JhbS5cclxuY29uc3QgVFJJUExFX1BPSU5UX1RFTVBFUkFUVVJFX09OX0RJQUdSQU0gPSAwLjM3NTtcclxuY29uc3QgQ1JJVElDQUxfUE9JTlRfVEVNUEVSQVRVUkVfT05fRElBR1JBTSA9IDAuODtcclxuXHJcbi8vIFVzZWQgZm9yIGNhbGN1bGF0aW5nIG1vdmluZyBhdmVyYWdlcyBuZWVkZWQgdG8gbWVsbG93IG91dCB0aGUgZ3JhcGggYmVoYXZpb3IuICBWYWx1ZSBlbXBpcmljYWxseSBkZXRlcm1pbmVkLlxyXG5jb25zdCBNQVhfTlVNX0hJU1RPUllfU0FNUExFUyA9IDEwMDtcclxuXHJcbi8vIGNvbnN0YW50cyB1c2VkIGluIHRoZSBsYXlvdXQgcHJvY2Vzc1xyXG5jb25zdCBDT05UUk9MX1BBTkVMX1hfSU5TRVQgPSAxNTtcclxuXHJcbmNsYXNzIFBoYXNlQ2hhbmdlc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQaGFzZUNoYW5nZXNNb2RlbH0gbW9kZWwgLSBtb2RlbCBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNQb3RlbnRpYWxHcmFwaEVuYWJsZWRcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBpc1BvdGVudGlhbEdyYXBoRW5hYmxlZCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCBtZXJnZSggeyB0YW5kZW06IHRhbmRlbSB9LCBTT01Db25zdGFudHMuU0NSRUVOX1ZJRVdfT1BUSU9OUyApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsID0gbW9kZWw7XHJcbiAgICB0aGlzLm1vZGVsVGVtcGVyYXR1cmVIaXN0b3J5ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCB7IGFsbG93RHVwbGljYXRlczogdHJ1ZSB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBtb2RlbC12aWV3IHRyYW5zZm9ybS4gVGhlIG11bHRpcGxpZXJzIGZvciB0aGUgMm5kIHBhcmFtZXRlciBjYW4gYmUgdXNlZCB0byBhZGp1c3Qgd2hlcmUgdGhlIHBvaW50XHJcbiAgICAvLyAoMCwgMCkgaW4gdGhlIG1vZGVsLCB3aGljaCBpcyB0aGUgbG93ZXIgbGVmdCBjb3JuZXIgb2YgdGhlIHBhcnRpY2xlIGNvbnRhaW5lciwgYXBwZWFycyBpbiB0aGUgdmlldy5UaGUgZmluYWxcclxuICAgIC8vIHBhcmFtZXRlciBpcyB0aGUgc2NhbGUsIGFuZCBjYW4gYmUgY2hhbmdlZCB0byBtYWtlIHRoZSB2aWV3IG1vcmUgem9vbWVkIGluIG9yIG91dC5cclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIG5ldyBWZWN0b3IyKCAwLCAwICksXHJcbiAgICAgIG5ldyBWZWN0b3IyKCB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAqIDAuMzI1LCB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKiAwLjc1ICksXHJcbiAgICAgIFNPTUNvbnN0YW50cy5WSUVXX0NPTlRBSU5FUl9XSURUSCAvIE11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfV0lEVEhcclxuICAgICk7XHJcblxyXG4gICAgLy8gZmlndXJlIG91dCB3aGVyZSBpbiB0aGUgdmlldyB0aGUgcGFydGljbGVzIHdpbGwgYmUgd2hlbiB0aGUgY29udGFpbmVyIGlzIG5vdCBleHBsb2RlZFxyXG4gICAgY29uc3Qgbm9taW5hbFBhcnRpY2xlQXJlYVZpZXdCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggMCApLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAwICkgKyBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIE11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfSU5JVElBTF9IRUlHSFQgKSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggMCApICsgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBNdWx0aXBsZVBhcnRpY2xlTW9kZWwuUEFSVElDTEVfQ09OVEFJTkVSX1dJRFRIICksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIDAgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHBhcnRpY2xlIGNvbnRhaW5lciAtIGl0IHRha2VzIGNhcmUgb2YgcG9zaXRpb25pbmcgaXRzZWxmXHJcbiAgICB0aGlzLnBhcnRpY2xlQ29udGFpbmVyTm9kZSA9IG5ldyBQYXJ0aWNsZUNvbnRhaW5lck5vZGUoIG1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgdm9sdW1lQ29udHJvbEVuYWJsZWQ6IHRydWUsXHJcbiAgICAgIHByZXNzdXJlR2F1Z2VFbmFibGVkOiB0cnVlLFxyXG4gICAgICB0aGVybW9tZXRlclhPZmZzZXRGcm9tQ2VudGVyOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoXHJcbiAgICAgICAgLU11bHRpcGxlUGFydGljbGVNb2RlbC5QQVJUSUNMRV9DT05UQUlORVJfV0lEVEggKiAwLjE1XHJcbiAgICAgICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcnRpY2xlQ29udGFpbmVyTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgcGFydGljbGUgY29udGFpbmVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBhcnRpY2xlQ29udGFpbmVyTm9kZSApO1xyXG5cclxuICAgIC8vIGFkZCBoZWF0ZXIvY29vbGVyIG5vZGVcclxuICAgIGNvbnN0IGhlYXRlckNvb2xlck5vZGUgPSBuZXcgSGVhdGVyQ29vbGVyTm9kZSggbW9kZWwuaGVhdGluZ0Nvb2xpbmdBbW91bnRQcm9wZXJ0eSwge1xyXG4gICAgICBzY2FsZTogMC43OSxcclxuICAgICAgY2VudGVyWDogbm9taW5hbFBhcnRpY2xlQXJlYVZpZXdCb3VuZHMuY2VudGVyWCxcclxuICAgICAgdG9wOiBub21pbmFsUGFydGljbGVBcmVhVmlld0JvdW5kcy5tYXhZICsgMzAsIC8vIG9mZnNldCBmcm9tIGNvbnRhaW5lciBib3R0b20gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdoZWF0ZXJDb29sZXJOb2RlJyApLFxyXG4gICAgICBmcm9udE9wdGlvbnM6IHtcclxuICAgICAgICBzbmFwVG9aZXJvOiAhU09NUXVlcnlQYXJhbWV0ZXJzLnN0aWNreUJ1cm5lcnNcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggaGVhdGVyQ29vbGVyTm9kZSApO1xyXG5cclxuICAgIC8vIGNvbnRyb2wgd2hlbiB0aGUgaGVhdGVyL2Nvb2xlciBub2RlIGlzIGVuYWJsZWQgZm9yIGlucHV0XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCBtb2RlbC5pc0V4cGxvZGVkUHJvcGVydHkgXSxcclxuICAgICAgKCBpc1BsYXlpbmcsIGlzRXhwbG9kZWQgKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhaXNQbGF5aW5nIHx8IGlzRXhwbG9kZWQgKSB7XHJcbiAgICAgICAgICBoZWF0ZXJDb29sZXJOb2RlLmludGVycnVwdFN1YnRyZWVJbnB1dCgpOyAvLyBjYW5jZWwgaW50ZXJhY3Rpb25cclxuICAgICAgICAgIGhlYXRlckNvb2xlck5vZGUuaGVhdENvb2xBbW91bnRQcm9wZXJ0eS5zZXQoIDAgKTsgLy8gZm9yY2UgdG8gemVybyBpbiBjYXNlIHNuYXBUb1plcm8gaXMgb2ZmXHJcbiAgICAgICAgICBoZWF0ZXJDb29sZXJOb2RlLnNsaWRlci5lbmFibGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgaGVhdGVyQ29vbGVyTm9kZS5zbGlkZXIuZW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIGFkZCByZXNldCBhbGwgYnV0dG9uXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMubW9kZWxUZW1wZXJhdHVyZUhpc3RvcnkuY2xlYXIoKTtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMucGFydGljbGVDb250YWluZXJOb2RlLnJlc2V0KCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IHBoYXNlIGRpYWdyYW0gc3RhdGUgaW4gU09NIGJhc2ljIHZlcnNpb24uXHJcbiAgICAgICAgbW9kZWwucGhhc2VEaWFncmFtRXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9IGlzUG90ZW50aWFsR3JhcGhFbmFibGVkO1xyXG4gICAgICAgIHRoaXMucHVtcE5vZGUucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmFkaXVzOiBTT01Db25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gU09NQ29uc3RhbnRzLlJFU0VUX0FMTF9CVVRUT05fRElTVEFOQ0VfRlJPTV9TSURFLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBTT01Db25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9ESVNUQU5DRV9GUk9NX0JPVFRPTSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgLy8gYWRkIHBsYXkgcGF1c2UgYnV0dG9uIGFuZCBzdGVwIGJ1dHRvblxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFRpbWVDb250cm9sTm9kZSggbW9kZWwuaXNQbGF5aW5nUHJvcGVydHksIHtcclxuICAgICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBwbGF5UGF1c2VCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICByYWRpdXM6IFNPTUNvbnN0YW50cy5QTEFZX1BBVVNFX0JVVFRPTl9SQURJVVNcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgcmFkaXVzOiBTT01Db25zdGFudHMuU1RFUF9CVVRUT05fUkFESVVTLFxyXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAgICAgbW9kZWwuc3RlcEluVGltZSggU09NQ29uc3RhbnRzLk5PTUlOQUxfVElNRV9TVEVQICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF5UGF1c2VTdGVwWFNwYWNpbmc6IDEwXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBwb3NpdGlvbiBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIHJpZ2h0OiBoZWF0ZXJDb29sZXJOb2RlLmxlZnQgLSA1MCxcclxuICAgICAgY2VudGVyWTogaGVhdGVyQ29vbGVyTm9kZS5jZW50ZXJZLFxyXG5cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUNvbnRyb2xOb2RlJyApXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBQdW1wIGlzIGxvY2F0ZWQgYXQgdGhlIGJvdHRvbSBsZWZ0IG9mIHRoZSBzY3JlZW4uXHJcbiAgICBjb25zdCBwdW1wUG9zaXRpb24gPSBuZXcgVmVjdG9yMiggMTA2LCA0NjYgKTtcclxuXHJcbiAgICAvLyBIb3NlIGF0dGFjaGVzIHRvIHRoZSBib3R0b20gbGVmdCBzaWRlIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICBjb25zdCBob3NlQXR0YWNobWVudFBvaW50ID0gbmV3IFZlY3RvcjIoIG5vbWluYWxQYXJ0aWNsZUFyZWFWaWV3Qm91bmRzLmxlZnQsIG5vbWluYWxQYXJ0aWNsZUFyZWFWaWV3Qm91bmRzLmJvdHRvbSAtIDcwICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgZGVyaXZlZCBwcm9wZXJ0eSB0aGF0IHdpbGwgYmUgdXNlZCB0byBjb250cm9sIHRoZSBlbmFibGVkIHN0YXRlIG9mIHRoZSBiaWN5Y2xlIHB1bXAgbm9kZS5cclxuICAgIGNvbnN0IGJpY3ljbGVQdW1wRW5hYmxlZFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgW1xyXG4gICAgICAgIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLmlzRXhwbG9kZWRQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5saWRBYm92ZUluamVjdGlvblBvaW50UHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwubWF4TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC50YXJnZXROdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5XHJcbiAgICAgIF0sXHJcbiAgICAgICggaXNQbGF5aW5nLCBpc0V4cGxvZGVkLCBsaWRBYm92ZUluamVjdGlvblBvaW50LCBtYXhOdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5LCB0YXJnZXROdW1iZXJPZk1vbGVjdWxlcyApID0+IHtcclxuICAgICAgICByZXR1cm4gaXNQbGF5aW5nICYmXHJcbiAgICAgICAgICAgICAgICFpc0V4cGxvZGVkICYmXHJcbiAgICAgICAgICAgICAgIGxpZEFib3ZlSW5qZWN0aW9uUG9pbnQgJiZcclxuICAgICAgICAgICAgICAgdGFyZ2V0TnVtYmVyT2ZNb2xlY3VsZXMgPCBtYXhOdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5O1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHJhbmdlIHByb3BlcnR5IHRoYXQgY2FuIGJlIHByb3ZpZGVkIHRvIHRoZSBiaWN5Y2xlIHB1bXAuXHJcbiAgICBjb25zdCBudW1iZXJPZk1vbGVjdWxlc1JhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG5ldyBSYW5nZSggMCwgbW9kZWwubWF4TnVtYmVyT2ZNb2xlY3VsZXNQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgICBtb2RlbC5tYXhOdW1iZXJPZk1vbGVjdWxlc1Byb3BlcnR5LmxhenlMaW5rKCBtYXhOdW1iZXJPZk1vbGVjdWxlcyA9PiB7XHJcbiAgICAgIG51bWJlck9mTW9sZWN1bGVzUmFuZ2VQcm9wZXJ0eS5zZXQoIG5ldyBSYW5nZSggMCwgbWF4TnVtYmVyT2ZNb2xlY3VsZXMgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBiaWN5Y2xlIHB1bXAgbm9kZVxyXG4gICAgdGhpcy5wdW1wTm9kZSA9IG5ldyBCaWN5Y2xlUHVtcE5vZGUoXHJcbiAgICAgIG1vZGVsLnRhcmdldE51bWJlck9mTW9sZWN1bGVzUHJvcGVydHksXHJcbiAgICAgIG51bWJlck9mTW9sZWN1bGVzUmFuZ2VQcm9wZXJ0eSxcclxuICAgICAge1xyXG4gICAgICAgIG5vZGVFbmFibGVkUHJvcGVydHk6IGJpY3ljbGVQdW1wRW5hYmxlZFByb3BlcnR5LFxyXG4gICAgICAgIGluamVjdGlvbkVuYWJsZWRQcm9wZXJ0eTogbW9kZWwuaXNJbmplY3Rpb25BbGxvd2VkUHJvcGVydHksXHJcbiAgICAgICAgdHJhbnNsYXRpb246IHB1bXBQb3NpdGlvbixcclxuICAgICAgICBob3NlQXR0YWNobWVudE9mZnNldDogaG9zZUF0dGFjaG1lbnRQb2ludC5taW51cyggcHVtcFBvc2l0aW9uICksXHJcbiAgICAgICAgaG9zZUN1cnZpbmVzczogMS41LFxyXG4gICAgICAgIGhhbmRsZVRvdWNoQXJlYVhEaWxhdGlvbjogMTAwLFxyXG4gICAgICAgIGhhbmRsZVRvdWNoQXJlYVlEaWxhdGlvbjogMTAwLFxyXG4gICAgICAgIGRyYWdMaXN0ZW5lck9wdGlvbnM6IHtcclxuICAgICAgICAgIG51bWJlck9mUGFydGljbGVzUGVyUHVtcEFjdGlvbjogM1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHVtcE5vZGUnIClcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucHVtcE5vZGUgKTtcclxuXHJcbiAgICAvLyBhZGQgcmV0dXJuIGxpZCBidXR0b25cclxuICAgIHRoaXMucmV0dXJuTGlkQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCByZXR1cm5MaWRTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gICAgICBiYXNlQ29sb3I6ICd5ZWxsb3cnLFxyXG4gICAgICBtYXhXaWR0aDogMTAwLFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4geyBtb2RlbC5yZXR1cm5MaWQoKTsgfSxcclxuICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICBjZW50ZXJYOiBub21pbmFsUGFydGljbGVBcmVhVmlld0JvdW5kcy5taW5YIC0gMTUwLFxyXG4gICAgICBjZW50ZXJZOiBub21pbmFsUGFydGljbGVBcmVhVmlld0JvdW5kcy5taW5ZLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXR1cm5MaWRCdXR0b24nICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH0sXHJcbiAgICAgIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM6IHsgcGhldGlvUmVhZE9ubHk6IHRydWUgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZXR1cm5MaWRCdXR0b24gKTtcclxuICAgIG1vZGVsLmlzRXhwbG9kZWRQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLnJldHVybkxpZEJ1dHRvbiwgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgLy8gYWRkIGludGVyYWN0aW9uIHBvdGVudGlhbCBkaWFncmFtXHJcbiAgICBsZXQgaW50ZXJhY3Rpb25Qb3RlbnRpYWxBY2NvcmRpb25Cb3ggPSBudWxsO1xyXG4gICAgaWYgKCBpc1BvdGVudGlhbEdyYXBoRW5hYmxlZCApIHtcclxuICAgICAgaW50ZXJhY3Rpb25Qb3RlbnRpYWxBY2NvcmRpb25Cb3ggPSBuZXcgSW50ZXJhY3Rpb25Qb3RlbnRpYWxBY2NvcmRpb25Cb3goXHJcbiAgICAgICAgU09NQ29uc3RhbnRzLk1BWF9TSUdNQSxcclxuICAgICAgICBTT01Db25zdGFudHMuTUlOX0VQU0lMT04sXHJcbiAgICAgICAgbW9kZWwsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbWF4V2lkdGg6IFBBTkVMX1dJRFRILFxyXG4gICAgICAgICAgbWluV2lkdGg6IFBBTkVMX1dJRFRILFxyXG4gICAgICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gQ09OVFJPTF9QQU5FTF9YX0lOU0VULFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW50ZXJhY3Rpb25Qb3RlbnRpYWxBY2NvcmRpb25Cb3gnIClcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIGludGVyYWN0aW9uUG90ZW50aWFsQWNjb3JkaW9uQm94ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoZSBhdG9tL21vbGVjdWxlIHNlbGVjdGlvbiBjb250cm9sIHBhbmVsXHJcbiAgICBjb25zdCBtb2xlY3VsZXNDb250cm9sUGFuZWwgPSBuZXcgUGhhc2VDaGFuZ2VzTW9sZWN1bGVzQ29udHJvbFBhbmVsKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAge1xyXG4gICAgICAgIHNob3dBZGp1c3RhYmxlQXR0cmFjdGlvbjogaXNQb3RlbnRpYWxHcmFwaEVuYWJsZWQsXHJcbiAgICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gQ09OVFJPTF9QQU5FTF9YX0lOU0VULFxyXG4gICAgICAgIHRvcDogNSxcclxuICAgICAgICBtYXhXaWR0aDogUEFORUxfV0lEVEgsXHJcbiAgICAgICAgbWluV2lkdGg6IFBBTkVMX1dJRFRILFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vbGVjdWxlc0NvbnRyb2xQYW5lbCcgKVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbW9sZWN1bGVzQ29udHJvbFBhbmVsICk7XHJcblxyXG4gICAgLy8gQWRkIGEgY29udGFpbmVyIG5vZGUgdGhhdCB3aWxsIGhvbGQgdGhlIHBoYXNlIGRpYWdyYW0gYWNjb3JkaW9uIGJveC4gIFRoaXMgaXMgZG9uZSBzbyB0aGF0IHRoZSBvdmVyYWxsIHZpc2liaWxpdHlcclxuICAgIC8vIG9mIHRoZSBkaWFncmFtIGJveCBjYW4gYmUgY29udHJvbGxlZCB1c2luZyBwaGV0LWlvIGluZGVwZW5kZW50bHkgb2YgdGhlIGR5bmFtaWMgaGlkZS9zaG93IGJlaGF2aW9yIGltcGxlbWVudGVkXHJcbiAgICAvLyBiZWxvdy4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc3RhdGVzLW9mLW1hdHRlci9pc3N1ZXMvMzMyLlxyXG4gICAgY29uc3QgcGhhc2VEaWFncmFtQ29udGFpbmVyID0gbmV3IE5vZGUoIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGhhc2VEaWFncmFtQ29udGFpbmVyJyApIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBoYXNlRGlhZ3JhbUNvbnRhaW5lciApO1xyXG5cclxuICAgIC8vIGFkZCBwaGFzZSBkaWFncmFtIC0gaW4gU09NIGJhc2ljIHZlcnNpb24gYnkgZGVmYXVsdCBwaGFzZSBkaWFncmFtIHNob3VsZCBiZSBjbG9zZWQuXHJcbiAgICBtb2RlbC5waGFzZURpYWdyYW1FeHBhbmRlZFByb3BlcnR5LnZhbHVlID0gaXNQb3RlbnRpYWxHcmFwaEVuYWJsZWQ7XHJcbiAgICB0aGlzLnBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveCA9IG5ldyBQaGFzZURpYWdyYW1BY2NvcmRpb25Cb3goIG1vZGVsLnBoYXNlRGlhZ3JhbUV4cGFuZGVkUHJvcGVydHksIHtcclxuICAgICAgbWluV2lkdGg6IFBBTkVMX1dJRFRILFxyXG4gICAgICBtYXhXaWR0aDogUEFORUxfV0lEVEgsXHJcbiAgICAgIHJpZ2h0OiBtb2xlY3VsZXNDb250cm9sUGFuZWwucmlnaHQsXHJcbiAgICAgIHRvcDogbW9sZWN1bGVzQ29udHJvbFBhbmVsLnRvcCArIElOVEVSX1BBTkVMX1NQQUNJTkcsXHJcbiAgICAgIHRhbmRlbTogcGhhc2VEaWFncmFtQ29udGFpbmVyLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwaGFzZURpYWdyYW1BY2NvcmRpb25Cb3gnIClcclxuICAgIH0gKTtcclxuICAgIHBoYXNlRGlhZ3JhbUNvbnRhaW5lci5hZGRDaGlsZCggdGhpcy5waGFzZURpYWdyYW1BY2NvcmRpb25Cb3ggKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHZhcmlhYmxlcyB1c2VkIHRvIG1hcCB0ZW1wZXJhdHVyZSBvbiB0byB0aGUgcGhhc2UgZGlhZ3JhbVxyXG4gICAgdGhpcy50cmlwbGVQb2ludFRlbXBlcmF0dXJlSW5Nb2RlbFVuaXRzID0gMDtcclxuICAgIHRoaXMuY3JpdGljYWxQb2ludFRlbXBlcmF0dXJlSW5Nb2RlbFVuaXRzID0gMDtcclxuICAgIHRoaXMuc2xvcGVJbkZpcnN0UmVnaW9uID0gMDtcclxuICAgIHRoaXMuc2xvcGVJblNlY29uZFJlZ2lvbiA9IDA7XHJcbiAgICB0aGlzLm9mZnNldEluU2Vjb25kUmVnaW9uID0gMDtcclxuXHJcbiAgICAvLyBtb25pdG9yIHRoZSBzdWJzdGFuY2UgYW5kIHVwZGF0ZSB0aGUgbWFwcGluZ3MgdG8gdHJpcGxlIGFuZCBjcml0aWNhbCBwb2ludHMgd2hlbiBjaGFuZ2VzIG9jY3VyXHJcbiAgICBtb2RlbC5zdWJzdGFuY2VQcm9wZXJ0eS5saW5rKCBzdWJzdGFuY2UgPT4ge1xyXG5cclxuICAgICAgaWYgKCBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuTkVPTiB8fFxyXG4gICAgICAgICAgIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5BUkdPTiB8fFxyXG4gICAgICAgICAgIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5BREpVU1RBQkxFX0FUT00gKSB7XHJcbiAgICAgICAgdGhpcy50cmlwbGVQb2ludFRlbXBlcmF0dXJlSW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLlRSSVBMRV9QT0lOVF9NT05BVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgdGhpcy5jcml0aWNhbFBvaW50VGVtcGVyYXR1cmVJbk1vZGVsVW5pdHMgPSBTT01Db25zdGFudHMuQ1JJVElDQUxfUE9JTlRfTU9OQVRPTUlDX01PREVMX1RFTVBFUkFUVVJFO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuRElBVE9NSUNfT1hZR0VOICkge1xyXG4gICAgICAgIHRoaXMudHJpcGxlUG9pbnRUZW1wZXJhdHVyZUluTW9kZWxVbml0cyA9IFNPTUNvbnN0YW50cy5UUklQTEVfUE9JTlRfRElBVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgICAgdGhpcy5jcml0aWNhbFBvaW50VGVtcGVyYXR1cmVJbk1vZGVsVW5pdHMgPSBTT01Db25zdGFudHMuQ1JJVElDQUxfUE9JTlRfRElBVE9NSUNfTU9ERUxfVEVNUEVSQVRVUkU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIHN1YnN0YW5jZSA9PT0gU3Vic3RhbmNlVHlwZS5XQVRFUiApIHtcclxuICAgICAgICB0aGlzLnRyaXBsZVBvaW50VGVtcGVyYXR1cmVJbk1vZGVsVW5pdHMgPSBTT01Db25zdGFudHMuVFJJUExFX1BPSU5UX1dBVEVSX01PREVMX1RFTVBFUkFUVVJFO1xyXG4gICAgICAgIHRoaXMuY3JpdGljYWxQb2ludFRlbXBlcmF0dXJlSW5Nb2RlbFVuaXRzID0gU09NQ29uc3RhbnRzLkNSSVRJQ0FMX1BPSU5UX1dBVEVSX01PREVMX1RFTVBFUkFUVVJFO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuc2xvcGVJbkZpcnN0UmVnaW9uID0gVFJJUExFX1BPSU5UX1RFTVBFUkFUVVJFX09OX0RJQUdSQU0gLyB0aGlzLnRyaXBsZVBvaW50VGVtcGVyYXR1cmVJbk1vZGVsVW5pdHM7XHJcbiAgICAgIHRoaXMuc2xvcGVJblNlY29uZFJlZ2lvbiA9ICggQ1JJVElDQUxfUE9JTlRfVEVNUEVSQVRVUkVfT05fRElBR1JBTSAtIFRSSVBMRV9QT0lOVF9URU1QRVJBVFVSRV9PTl9ESUFHUkFNICkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuY3JpdGljYWxQb2ludFRlbXBlcmF0dXJlSW5Nb2RlbFVuaXRzIC0gdGhpcy50cmlwbGVQb2ludFRlbXBlcmF0dXJlSW5Nb2RlbFVuaXRzICk7XHJcbiAgICAgIHRoaXMub2Zmc2V0SW5TZWNvbmRSZWdpb24gPSBUUklQTEVfUE9JTlRfVEVNUEVSQVRVUkVfT05fRElBR1JBTSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIHRoaXMuc2xvcGVJblNlY29uZFJlZ2lvbiAqIHRoaXMudHJpcGxlUG9pbnRUZW1wZXJhdHVyZUluTW9kZWxVbml0cyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGhhbmRsZSBleHBsb3Npb25zIG9mIHRoZSBjb250YWluZXJcclxuICAgIG1vZGVsLmlzRXhwbG9kZWRQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMubW9kZWxUZW1wZXJhdHVyZUhpc3RvcnkuY2xlYXIoKTtcclxuICAgICAgdGhpcy51cGRhdGVQaGFzZURpYWdyYW0oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIb29rIHVwIGEgZnVuY3Rpb24gdGhhdCB1cGRhdGVzIHNldmVyYWwgdmlldyBhdHRyaWJ1dGVzIHdoZW4gdGhlIHN1YnN0YW5jZSBjaGFuZ2VzLlxyXG4gICAgbW9kZWwuc3Vic3RhbmNlUHJvcGVydHkubGluayggc3Vic3RhbmNlID0+IHtcclxuICAgICAgdGhpcy5tb2RlbFRlbXBlcmF0dXJlSGlzdG9yeS5jbGVhcigpO1xyXG4gICAgICB0aGlzLnVwZGF0ZVBoYXNlRGlhZ3JhbSgpO1xyXG4gICAgICB0aGlzLnBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveC5zZXREZXBpY3RpbmdXYXRlciggc3Vic3RhbmNlID09PSBTdWJzdGFuY2VUeXBlLldBVEVSICk7XHJcbiAgICAgIGlmICggaXNQb3RlbnRpYWxHcmFwaEVuYWJsZWQgKSB7XHJcbiAgICAgICAgaWYgKCBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuQURKVVNUQUJMRV9BVE9NIHx8XHJcbiAgICAgICAgICAgICBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuRElBVE9NSUNfT1hZR0VOIHx8XHJcbiAgICAgICAgICAgICBzdWJzdGFuY2UgPT09IFN1YnN0YW5jZVR5cGUuV0FURVIgKSB7XHJcbiAgICAgICAgICBpbnRlcmFjdGlvblBvdGVudGlhbEFjY29yZGlvbkJveC5zZXRNb2xlY3VsYXIoIHRydWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpbnRlcmFjdGlvblBvdGVudGlhbEFjY29yZGlvbkJveC5zZXRNb2xlY3VsYXIoIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBkb24ndCBzaG93IHRoZSBwaGFzZSBkaWFncmFtIGZvciBhZGp1c3RhYmxlIGF0dHJhY3Rpb24sIHNpbmNlIHdlIG5lZWQgdGhlIHNwYWNlIGZvciBvdGhlciB0aGluZ3NcclxuICAgICAgdGhpcy5waGFzZURpYWdyYW1BY2NvcmRpb25Cb3gudmlzaWJsZSA9IHN1YnN0YW5jZSAhPT0gU3Vic3RhbmNlVHlwZS5BREpVU1RBQkxFX0FUT007XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIGxheW91dCBiYXNlZCBvbiB0aGUgdmlzaWJpbGl0eSBhbmQgYm91bmRzIG9mIHRoZSB2YXJpb3VzIGNvbnRyb2wgcGFuZWxzIGFuZCBhY2NvcmRpb24gYm94ZXMuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIHRoaXMucGhhc2VEaWFncmFtQWNjb3JkaW9uQm94LnZpc2libGVQcm9wZXJ0eSwgbW9sZWN1bGVzQ29udHJvbFBhbmVsLmJvdW5kc1Byb3BlcnR5IF0sXHJcbiAgICAgICggcGhhc2VEaWFncmFtVmlzaWJsZSwgbW9sZWN1bGVDb250cm9sUGFuZWxCb3VuZHMgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBpc1BvdGVudGlhbEdyYXBoRW5hYmxlZCApIHtcclxuICAgICAgICAgIGludGVyYWN0aW9uUG90ZW50aWFsQWNjb3JkaW9uQm94LnRvcCA9IG1vbGVjdWxlQ29udHJvbFBhbmVsQm91bmRzLmJvdHRvbSArIElOVEVSX1BBTkVMX1NQQUNJTkc7XHJcbiAgICAgICAgICB0aGlzLnBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveC50b3AgPSBpbnRlcmFjdGlvblBvdGVudGlhbEFjY29yZGlvbkJveC5ib3R0b20gKyBJTlRFUl9QQU5FTF9TUEFDSU5HO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucGhhc2VEaWFncmFtQWNjb3JkaW9uQm94LnRvcCA9IG1vbGVjdWxlQ29udHJvbFBhbmVsQm91bmRzLmJvdHRvbSArIElOVEVSX1BBTkVMX1NQQUNJTkc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEhhcHB5IEVhc3RlclxyXG4gICAgY29uc3QgZWdnID0gbmV3IFJpY2hUZXh0KCAnR29vZGJ5ZSBib2lsaW5nIHdhdGVyIC08YnI+eW91IHdpbGwgYmUgbWlzdCEnLCB7XHJcbiAgICAgIGZpbGw6ICd5ZWxsb3cnLFxyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0ICksXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGxlZnQ6IHRoaXMucmV0dXJuTGlkQnV0dG9uLmxlZnQsXHJcbiAgICAgIHRvcDogdGhpcy5yZXR1cm5MaWRCdXR0b24uYm90dG9tICsgMjBcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVnZyApO1xyXG5cclxuICAgIGxldCBlZ2dTaG93biA9IGZhbHNlO1xyXG4gICAgbW9kZWwuaXNQbGF5aW5nUHJvcGVydHkubGluayggaXNQbGF5aW5nID0+IHtcclxuICAgICAgZWdnLnZpc2libGUgPSAhaXNQbGF5aW5nICYmIG1vZGVsLmlzRXhwbG9kZWRQcm9wZXJ0eS5nZXQoKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLnN1YnN0YW5jZVByb3BlcnR5LmdldCgpID09PSBTdWJzdGFuY2VUeXBlLldBVEVSICYmICFlZ2dTaG93bjtcclxuICAgICAgaWYgKCBlZ2cudmlzaWJsZSApIHtcclxuICAgICAgICBlZ2dTaG93biA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNb25pdG9yIHRoZSBtb2RlbCBmb3IgY2hhbmdlcyBvZiB0aGUgY29udGFpbmVyIHNpemUgYW5kIGFkanVzdCB0aGUgdmlldyBhY2NvcmRpbmdseS5cclxuICAgIG1vZGVsLmNvbnRhaW5lckhlaWdodFByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy51cGRhdGVQaGFzZURpYWdyYW0oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC50ZW1wZXJhdHVyZVNldFBvaW50UHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLm1vZGVsVGVtcGVyYXR1cmVIaXN0b3J5LmNsZWFyKCk7XHJcbiAgICAgIHRoaXMudXBkYXRlUGhhc2VEaWFncmFtKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwuc2NhbGVkQXRvbXMubGVuZ3RoUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVBoYXNlRGlhZ3JhbSgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5wYXJ0aWNsZUNvbnRhaW5lck5vZGUuc3RlcCggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgcG9zaXRpb24gb2YgdGhlIG1hcmtlciBvbiB0aGUgcGhhc2UgZGlhZ3JhbSBiYXNlZCBvbiB0aGUgdGVtcGVyYXR1cmUgYW5kIHByZXNzdXJlIHZhbHVlcyB3aXRoaW4gdGhlXHJcbiAgICogbW9kZWwuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVQaGFzZURpYWdyYW0oKSB7XHJcblxyXG4gICAgLy8gSWYgdGhlIGNvbnRhaW5lciBoYXMgZXhwbG9kZWQsIGRvbid0IGJvdGhlciBzaG93aW5nIHRoZSBkb3QuXHJcbiAgICBpZiAoIHRoaXMubXVsdGlwbGVQYXJ0aWNsZU1vZGVsLmlzRXhwbG9kZWRQcm9wZXJ0eS5nZXQoKSB8fCB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5zY2FsZWRBdG9tcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgIHRoaXMucGhhc2VEaWFncmFtQWNjb3JkaW9uQm94LnNldFN0YXRlTWFya2VyVmlzaWJsZSggZmFsc2UgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveC5zZXRTdGF0ZU1hcmtlclZpc2libGUoIHRydWUgKTtcclxuICAgICAgY29uc3QgbW92aW5nQXZlcmFnZVRlbXBlcmF0dXJlID0gdGhpcy51cGRhdGVNb3ZpbmdBdmVyYWdlVGVtcGVyYXR1cmUoXHJcbiAgICAgICAgdGhpcy5tdWx0aXBsZVBhcnRpY2xlTW9kZWwudGVtcGVyYXR1cmVTZXRQb2ludFByb3BlcnR5LmdldCgpXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IG1vZGVsUHJlc3N1cmUgPSB0aGlzLm11bHRpcGxlUGFydGljbGVNb2RlbC5nZXRNb2RlbFByZXNzdXJlKCk7XHJcbiAgICAgIGNvbnN0IG1hcHBlZFRlbXBlcmF0dXJlID0gdGhpcy5tYXBNb2RlbFRlbXBlcmF0dXJlVG9QaGFzZURpYWdyYW1UZW1wZXJhdHVyZSggbW92aW5nQXZlcmFnZVRlbXBlcmF0dXJlICk7XHJcbiAgICAgIGNvbnN0IG1hcHBlZFByZXNzdXJlID0gdGhpcy5tYXBNb2RlbFRlbXBBbmRQcmVzc3VyZVRvUGhhc2VEaWFncmFtUHJlc3N1cmUoIG1vZGVsUHJlc3N1cmUsIG1vdmluZ0F2ZXJhZ2VUZW1wZXJhdHVyZSApO1xyXG4gICAgICB0aGlzLnBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveC5zZXRTdGF0ZU1hcmtlclBvcyggbWFwcGVkVGVtcGVyYXR1cmUsIG1hcHBlZFByZXNzdXJlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgYW5kIHJldHVybnMgdGhlIG1vdmluZyBhdmVyYWdlIHRha2luZyBpbnRvIGFjY291bnQgdGhlIG5ldyB0ZW1wZXJhdHVyZSB2YWx1ZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbmV3VGVtcGVyYXR1cmVWYWx1ZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVNb3ZpbmdBdmVyYWdlVGVtcGVyYXR1cmUoIG5ld1RlbXBlcmF0dXJlVmFsdWUgKSB7XHJcbiAgICBpZiAoIHRoaXMubW9kZWxUZW1wZXJhdHVyZUhpc3RvcnkubGVuZ3RoID09PSBNQVhfTlVNX0hJU1RPUllfU0FNUExFUyApIHtcclxuICAgICAgdGhpcy5tb2RlbFRlbXBlcmF0dXJlSGlzdG9yeS5zaGlmdCgpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5tb2RlbFRlbXBlcmF0dXJlSGlzdG9yeS5wdXNoKCBuZXdUZW1wZXJhdHVyZVZhbHVlICk7XHJcbiAgICBsZXQgdG90YWxPZkFsbFRlbXBlcmF0dXJlcyA9IDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm1vZGVsVGVtcGVyYXR1cmVIaXN0b3J5Lmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0b3RhbE9mQWxsVGVtcGVyYXR1cmVzICs9IHRoaXMubW9kZWxUZW1wZXJhdHVyZUhpc3RvcnkuZ2V0KCBpICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG90YWxPZkFsbFRlbXBlcmF0dXJlcyAvIHRoaXMubW9kZWxUZW1wZXJhdHVyZUhpc3RvcnkubGVuZ3RoO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwIHRoZSBtb2RlbCB0ZW1wZXJhdHVyZSB0byBwaGFzZSBkaWFncmFtIHRlbXBlcmF0dXJlIGJhc2VkIG9uIHRoZSBwaGFzZSBjaGFydCBzaGFwZS5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gbW9kZWxUZW1wZXJhdHVyZVxyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBtYXBNb2RlbFRlbXBlcmF0dXJlVG9QaGFzZURpYWdyYW1UZW1wZXJhdHVyZSggbW9kZWxUZW1wZXJhdHVyZSApIHtcclxuXHJcbiAgICBsZXQgbWFwcGVkVGVtcGVyYXR1cmU7XHJcbiAgICBpZiAoIG1vZGVsVGVtcGVyYXR1cmUgPCB0aGlzLnRyaXBsZVBvaW50VGVtcGVyYXR1cmVJbk1vZGVsVW5pdHMgKSB7XHJcbiAgICAgIG1hcHBlZFRlbXBlcmF0dXJlID0gdGhpcy5zbG9wZUluRmlyc3RSZWdpb24gKiBtb2RlbFRlbXBlcmF0dXJlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIG1hcHBlZFRlbXBlcmF0dXJlID0gbW9kZWxUZW1wZXJhdHVyZSAqIHRoaXMuc2xvcGVJblNlY29uZFJlZ2lvbiArIHRoaXMub2Zmc2V0SW5TZWNvbmRSZWdpb247XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE1hdGgubWluKCBtYXBwZWRUZW1wZXJhdHVyZSwgMSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFwIHRoZSBtb2RlbCB0ZW1wZXJhdHVyZSBhbmQgcHJlc3N1cmUgdG8gYSBub3JtYWxpemVkIHByZXNzdXJlIHZhbHVlIHN1aXRhYmxlIGZvciB1c2UgaW4gc2V0dGluZyB0aGUgbWFya2VyXHJcbiAgICogcG9zaXRpb24gb24gdGhlIHBoYXNlIGNoYXJ0LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtb2RlbFByZXNzdXJlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG1vZGVsVGVtcGVyYXR1cmVcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbWFwTW9kZWxUZW1wQW5kUHJlc3N1cmVUb1BoYXNlRGlhZ3JhbVByZXNzdXJlKCBtb2RlbFByZXNzdXJlLCBtb2RlbFRlbXBlcmF0dXJlICkge1xyXG5cclxuICAgIC8vIFRoaXMgbWV0aG9kIGlzIGEgdG90YWwgdHdlYWsgZmVzdC4gIEFsbCB2YWx1ZXMgYW5kIGVxdWF0aW9ucyBhcmUgbWFkZSB0byBtYXAgdG8gdGhlIHBoYXNlIGRpYWdyYW0sIGFuZCBhcmUgTk9UXHJcbiAgICAvLyBiYXNlZCBvbiBhbnkgcmVhbC13b3JsZCBlcXVhdGlvbnMgdGhhdCBkZWZpbmUgcGhhc2VzIG9mIG1hdHRlci5cclxuICAgIGNvbnN0IGN1dE92ZXJUZW1wZXJhdHVyZSA9IFRSSVBMRV9QT0lOVF9URU1QRVJBVFVSRV9PTl9ESUFHUkFNIC0gMC4wMjU7XHJcbiAgICBjb25zdCBtYXBwZWRUZW1wZXJhdHVyZSA9IHRoaXMubWFwTW9kZWxUZW1wZXJhdHVyZVRvUGhhc2VEaWFncmFtVGVtcGVyYXR1cmUoIG1vZGVsVGVtcGVyYXR1cmUgKTtcclxuICAgIGxldCBtYXBwZWRQcmVzc3VyZTtcclxuICAgIGlmICggbWFwcGVkVGVtcGVyYXR1cmUgPD0gY3V0T3ZlclRlbXBlcmF0dXJlICkge1xyXG4gICAgICBtYXBwZWRQcmVzc3VyZSA9IE1hdGgucG93KCBtYXBwZWRUZW1wZXJhdHVyZSwgMS42ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbWFwcGVkUHJlc3N1cmUgPSBNYXRoLnBvdyggbWFwcGVkVGVtcGVyYXR1cmUgLSBjdXRPdmVyVGVtcGVyYXR1cmUsIDEuNzUgKSArIDAuMTkyO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIE1hdGgubWluKCBtYXBwZWRQcmVzc3VyZSwgMSApO1xyXG4gIH1cclxufVxyXG5cclxuc3RhdGVzT2ZNYXR0ZXIucmVnaXN0ZXIoICdQaGFzZUNoYW5nZXNTY3JlZW5WaWV3JywgUGhhc2VDaGFuZ2VzU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBQaGFzZUNoYW5nZXNTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENB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