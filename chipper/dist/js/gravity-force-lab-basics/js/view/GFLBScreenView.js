// Copyright 2016-2023, University of Colorado Boulder

/**
 * Main screen view for the simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import GravityForceLabStrings from '../../../gravity-force-lab/js/GravityForceLabStrings.js';
import GravityForceLabScreenSummaryNode from '../../../gravity-force-lab/js/view/GravityForceLabScreenSummaryNode.js';
import MassBoundarySoundGenerator from '../../../gravity-force-lab/js/view/MassBoundarySoundGenerator.js';
import MassSoundGenerator from '../../../gravity-force-lab/js/view/MassSoundGenerator.js';
import SpherePositionsDescriptionNode from '../../../gravity-force-lab/js/view/SpherePositionsDescriptionNode.js';
import saturatedSineLoopTrimmed_wav from '../../../gravity-force-lab/sounds/saturatedSineLoopTrimmed_wav.js';
import InverseSquareLawCommonStrings from '../../../inverse-square-law-common/js/InverseSquareLawCommonStrings.js';
import ISLCQueryParameters from '../../../inverse-square-law-common/js/ISLCQueryParameters.js';
import DefaultDirection from '../../../inverse-square-law-common/js/view/DefaultDirection.js';
import ISLCDragBoundsNode from '../../../inverse-square-law-common/js/view/ISLCDragBoundsNode.js';
import ISLCGridNode from '../../../inverse-square-law-common/js/view/ISLCGridNode.js';
import ISLCObjectEnum from '../../../inverse-square-law-common/js/model/ISLCObjectEnum.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Color, HBox, Node, PDOMPeer, Voicing } from '../../../scenery/js/imports.js';
import ContinuousPropertySoundGenerator from '../../../tambo/js/sound-generators/ContinuousPropertySoundGenerator.js';
import soundManager from '../../../tambo/js/soundManager.js';
import VibrationTestEvent from '../../../tappi/js/tracking/VibrationTestEvent.js';
import VibrationTestEventRecorder from '../../../tappi/js/tracking/VibrationTestEventRecorder.js';
import VibrationTestInputListener from '../../../tappi/js/tracking/VibrationTestInputListener.js';
import VibrationManageriOS from '../../../tappi/js/VibrationManageriOS.js';
import GFLBConstants from '../GFLBConstants.js';
import gravityForceLabBasics from '../gravityForceLabBasics.js';
import GravityForceLabBasicsStrings from '../GravityForceLabBasicsStrings.js';
import GFLBForceDescriber from './describers/GFLBForceDescriber.js';
import GFLBMassDescriber from './describers/GFLBMassDescriber.js';
import GFLBPositionDescriber from './describers/GFLBPositionDescriber.js';
import GFLBVoicingSummaryDescriber from './describers/GFLBVoicingSummaryDescriber.js';
import DistanceArrowNode from './DistanceArrowNode.js';
import GFLBAlertManager from './GFLBAlertManager.js';
import GFLBCheckboxPanel from './GFLBCheckboxPanel.js';
import GFLBMassControl from './GFLBMassControl.js';
import GFLBMassDescriptionNode from './GFLBMassDescriptionNode.js';
import GFLBMassNode from './GFLBMassNode.js';
import vibrationController from './vibrationController.js';
const constantSizeString = GravityForceLabStrings.constantSize;
const distanceString = GravityForceLabBasicsStrings.distance;
const forceValuesString = InverseSquareLawCommonStrings.forceValues;
const mass1LabelString = GravityForceLabBasicsStrings.mass1Label;
const mass1String = GravityForceLabStrings.mass1;
const mass2LabelString = GravityForceLabBasicsStrings.mass2Label;
const mass2String = GravityForceLabStrings.mass2;
const mass1ControlLabelString = GravityForceLabBasicsStrings.mass1ControlLabel;
const mass2ControlLabelString = GravityForceLabBasicsStrings.mass2ControlLabel;
const massControlsLabelString = GravityForceLabStrings.a11y.controls.massControlsLabel;
const massControlsHelpTextBillionsString = GravityForceLabBasicsStrings.a11y.massControlsHelpTextBillions;
const massControlsHelpTextDensityBillionsString = GravityForceLabBasicsStrings.a11y.massControlsHelpTextDensityBillions;
const forceValuesCheckboxHelpTextString = InverseSquareLawCommonStrings.a11y.forceValuesCheckboxHelpText;
const constantSizeCheckboxHelpTextString = GravityForceLabStrings.a11y.controls.constantSizeCheckboxHelpText;
const distanceCheckboxHelpTextString = GravityForceLabBasicsStrings.a11y.distanceCheckboxHelpText;
const screenSummaryPlayAreaControlsString = GravityForceLabBasicsStrings.a11y.screenSummary.playAreaControls;
const basicsSimStateLabelString = GravityForceLabBasicsStrings.a11y.screenSummary.basicsSimStateLabel;
const screenSummaryPlayAreaOverviewPatternString = GravityForceLabBasicsStrings.a11y.screenSummary.playAreaOverviewPattern;
const screenSummarySecondaryDescriptionPatternString = GravityForceLabBasicsStrings.a11y.screenSummary.secondaryDescriptionPattern;
const thePlayAreaHasString = GravityForceLabBasicsStrings.a11y.screenSummary.thePlayAreaHas;
const inTheControlAreaString = GravityForceLabBasicsStrings.a11y.screenSummary.inTheControlArea;
const forceValuesHintResponseString = GravityForceLabBasicsStrings.a11y.voicing.forceValuesHintResponse;
const distanceHintResponseString = GravityForceLabBasicsStrings.a11y.voicing.distanceHintResponse;
const constantSizeHintResponseString = GravityForceLabBasicsStrings.a11y.voicing.constantSizeHintResponse;
const forceValuesShownResponseString = GravityForceLabBasicsStrings.a11y.voicing.forceValuesShownResponse;
const forceValuesHiddenResponseString = GravityForceLabBasicsStrings.a11y.voicing.forceValuesHiddenResponse;
const distanceShownResponseString = GravityForceLabBasicsStrings.a11y.voicing.distanceShownResponse;
const distanceHiddenResponseString = GravityForceLabBasicsStrings.a11y.voicing.distanceHiddenResponse;
const constantSizeSetResponseString = GravityForceLabBasicsStrings.a11y.voicing.constantSizeSetResponse;
const constantSizeNotSetResponseString = GravityForceLabBasicsStrings.a11y.voicing.constantSizeNotSetResponse;

// constants
const MASS_CONTROLS_Y_POSITION = 385;
const PANEL_SPACING = 50;
const SHOW_GRID = ISLCQueryParameters.showGrid;
const SHOW_DRAG_BOUNDS = ISLCQueryParameters.showDragBounds;
const OBJECT_ONE = ISLCObjectEnum.OBJECT_ONE;
const OBJECT_TWO = ISLCObjectEnum.OBJECT_TWO;
const BOUNDARY_SOUNDS_LEVEL = 1;
class GFLBScreenView extends ScreenView {
  /**
   * @param {GFLBModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    // initialize a11y describers and alert manager
    const positionDescriber = new GFLBPositionDescriber(model, mass1LabelString, mass2LabelString);
    const forceDescriber = new GFLBForceDescriber(model, mass1LabelString, mass2LabelString, positionDescriber);
    const massDescriber = new GFLBMassDescriber(model, forceDescriber);
    const playAreaOverviewString = StringUtils.fillIn(screenSummaryPlayAreaOverviewPatternString, {
      playArea: thePlayAreaHasString
    });
    const secondaryOverviewString = StringUtils.fillIn(screenSummarySecondaryDescriptionPatternString, {
      controlArea: inTheControlAreaString
    });
    super({
      layoutBounds: new Bounds2(0, 0, 768, 464),
      screenSummaryContent: new GravityForceLabScreenSummaryNode(model, massDescriber, forceDescriber, positionDescriber, {
        screenSummaryPlayAreaOverview: playAreaOverviewString,
        screenSummaryPlayAreaControls: screenSummaryPlayAreaControlsString,
        secondaryDescriptionContent: secondaryOverviewString,
        simStateLabel: basicsSimStateLabelString,
        additionalMassDistanceProperties: [model.showDistanceProperty]
      }),
      tandem: tandem
    });
    const alertManager = new GFLBAlertManager(model, massDescriber, forceDescriber, {
      descriptionAlertNode: this
    });

    // @private {GFLBVoicingSummaryDescriber} - Generates alerts for the Voicing feature from buttons in the Sim
    // Toolbar.
    this.voicingSummaryDescriber = new GFLBVoicingSummaryDescriber(forceDescriber, positionDescriber, massDescriber);

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model, which is
    // between the two masses.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(this.layoutBounds.width / 2, this.layoutBounds.height / 2), 0.05);

    // add the mass nodes to the view
    const mass1Node = new GFLBMassNode(model, model.object1, this.layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, {
      label: mass1LabelString,
      otherObjectLabel: mass2LabelString,
      defaultDirection: DefaultDirection.LEFT,
      arrowColor: '#66F',
      forceArrowHeight: 125,
      tandem: tandem.createTandem('mass1Node')
    });
    const mass2Node = new GFLBMassNode(model, model.object2, this.layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, {
      label: mass2LabelString,
      otherObjectLabel: mass1LabelString,
      defaultDirection: DefaultDirection.RIGHT,
      arrowColor: '#F66',
      forceArrowHeight: 175,
      tandem: tandem.createTandem('mass2Node')
    });
    const massDescriptionNodeOptions = {
      object1Label: mass1LabelString,
      object2Label: mass2LabelString
    };

    // pdom descriptions for each mass - the masses themselves leverage AccessibleValueHandler, but these
    // form descriptive summaries for the state of each mass
    const objectOneMassDescriptionNode = new GFLBMassDescriptionNode(model, model.object1, massDescriber, forceDescriber, positionDescriber, massDescriptionNodeOptions);
    const objectTwoMassDescriptionNode = new GFLBMassDescriptionNode(model, model.object2, massDescriber, forceDescriber, positionDescriber, massDescriptionNodeOptions);
    const massPositionsNode = new SpherePositionsDescriptionNode(model, positionDescriber, {
      additionalDescriptionDependencies: [model.showDistanceProperty]
    });
    massPositionsNode.addChild(mass1Node);
    massPositionsNode.addChild(mass2Node);

    // the arrow nodes and their labels should be on top of the masses, but under the rest of the control panel
    massPositionsNode.addChild(mass1Node.arrowNode);
    massPositionsNode.addChild(mass2Node.arrowNode);

    // mass controls
    const massControl1 = new GFLBMassControl(mass1String, model.object1.valueProperty, GFLBConstants.MASS_RANGE, mass1ControlLabelString, OBJECT_ONE, alertManager, massDescriber, tandem.createTandem('massControl1'));
    const massControl2 = new GFLBMassControl(mass2String, model.object2.valueProperty, GFLBConstants.MASS_RANGE, mass2ControlLabelString, OBJECT_TWO, alertManager, massDescriber, tandem.createTandem('massControl2'), {
      color: new Color(255, 0, 0)
    });
    const massControlsNode = new Node({
      labelTagName: 'h3',
      labelContent: massControlsLabelString,
      tagName: 'div',
      descriptionContent: massControlsHelpTextBillionsString
    });

    // The list of mass controls is aria-labelledby the its label sibling, see https://github.com/phetsims/gravity-force-lab/issues/132
    massControlsNode.addAriaLabelledbyAssociation({
      otherNode: massControlsNode,
      otherElementName: PDOMPeer.LABEL_SIBLING,
      thisElementName: PDOMPeer.PRIMARY_SIBLING
    });

    // place mass controls in an HBox
    const massControlBox = new HBox({
      children: [massControl1, massControl2],
      center: this.layoutBounds.center,
      spacing: PANEL_SPACING
    });
    massControlsNode.addChild(massControlBox);
    model.constantRadiusProperty.link(constantRadius => {
      massControlsNode.descriptionContent = constantRadius ? massControlsHelpTextDensityBillionsString : massControlsHelpTextBillionsString;
    });

    // sound generation for the mass values
    soundManager.addSoundGenerator(new MassSoundGenerator(model.object1.valueProperty, GFLBConstants.MASS_RANGE, model.resetInProgressProperty, {
      initialOutputLevel: 0.7
    }));
    soundManager.addSoundGenerator(new MassSoundGenerator(model.object2.valueProperty, GFLBConstants.MASS_RANGE, model.resetInProgressProperty, {
      initialOutputLevel: 0.7
    }));

    // @private - sound generation for the force sound
    this.forceSoundGenerator = new ContinuousPropertySoundGenerator(model.forceProperty, saturatedSineLoopTrimmed_wav, new Range(model.getMinForce(), model.getMaxForce()), {
      initialOutputLevel: 0.2,
      playbackRateCenterOffset: 0.122,
      // this is about 2 semitone, and was necessary to match original sound design
      resetInProgressProperty: model.resetInProgressProperty,
      trimSilence: false // a very precise sound file is used, so make sure it doesn't get changed
    });

    soundManager.addSoundGenerator(this.forceSoundGenerator);

    // sound generation for masses reaching the inner or outer motion boundaries
    soundManager.addSoundGenerator(new MassBoundarySoundGenerator(model.object1, model, 'left', {
      initialOutputLevel: BOUNDARY_SOUNDS_LEVEL
    }));
    soundManager.addSoundGenerator(new MassBoundarySoundGenerator(model.object2, model, 'right', {
      initialOutputLevel: BOUNDARY_SOUNDS_LEVEL
    }));
    const checkboxItems = [{
      label: forceValuesString,
      property: model.showForceValuesProperty,
      options: {
        //phet-io
        tandem: tandem.createTandem('forceValuesCheckbox'),
        accessibleName: forceValuesString,
        descriptionContent: forceValuesCheckboxHelpTextString,
        // voicing
        voicingNameResponse: forceValuesString,
        voicingHintResponse: forceValuesHintResponseString,
        checkedContextResponse: forceValuesShownResponseString,
        uncheckedContextResponse: forceValuesHiddenResponseString
      }
    }, {
      label: distanceString,
      property: model.showDistanceProperty,
      options: {
        // phet-io
        tandem: tandem.createTandem('distanceCheckbox'),
        accessibleName: distanceString,
        descriptionContent: distanceCheckboxHelpTextString,
        // voicing
        voicingNameResponse: distanceString,
        voicingHintResponse: distanceHintResponseString,
        checkedContextResponse: distanceShownResponseString,
        uncheckedContextResponse: distanceHiddenResponseString
      }
    }, {
      label: constantSizeString,
      property: model.constantRadiusProperty,
      options: {
        // phet-io
        tandem: tandem.createTandem('constantSizeCheckbox'),
        accessibleName: constantSizeString,
        descriptionContent: constantSizeCheckboxHelpTextString,
        // voicing
        voicingNameResponse: constantSizeString,
        voicingHintResponse: constantSizeHintResponseString,
        checkedContextResponse: constantSizeSetResponseString,
        uncheckedContextResponse: constantSizeNotSetResponseString
      }
    }];
    const parameterControlPanel = new GFLBCheckboxPanel(checkboxItems, {
      tandem: tandem.createTandem('parameterControlPanel'),
      fill: '#f1f1f2'
    });

    // arrow that shows distance between the two masses
    const distanceArrowNode = new DistanceArrowNode(model, modelViewTransform, positionDescriber, {
      tandem: tandem.createTandem('distanceArrowNode'),
      y: 145
    });
    model.showDistanceProperty.linkAttribute(distanceArrowNode, 'visible');
    massPositionsNode.addChild(distanceArrowNode);

    // Reset All button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        mass1Node.reset();
        mass2Node.reset();
        this.forceSoundGenerator.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      tandem: tandem.createTandem('resetAllButton')
    });

    // children
    this.pdomPlayAreaNode.children = [objectOneMassDescriptionNode, objectTwoMassDescriptionNode, massPositionsNode, massControlsNode];
    this.pdomControlAreaNode.children = [parameterControlPanel, resetAllButton];

    // voicing - when ReadingBlocks for the arrows are enabled, they should come before everything else, where top
    // most component vertically comes first
    massPositionsNode.pdomOrder = [mass2Node.arrowNode, mass1Node.arrowNode, mass1Node, mass2Node];

    // voicing - Make sure that the Utterances from Alerters only announce when the content under this ScreenView
    // is visible
    Voicing.registerUtteranceToNode(alertManager.constantSizeChangedContextResponseUtterance, this);

    // layout the view elements
    parameterControlPanel.right = this.layoutBounds.width - 15;
    parameterControlPanel.bottom = MASS_CONTROLS_Y_POSITION;
    massControlBox.right = parameterControlPanel.left - PANEL_SPACING;
    massControlBox.top = parameterControlPanel.top;
    resetAllButton.right = parameterControlPanel.right;
    resetAllButton.top = parameterControlPanel.bottom + 13.5;

    // voicing - Update the voicingObjectResponse for each mass when any Property changes that would update the object
    // response
    Multilink.multilink([model.object1.positionProperty, model.object2.positionProperty, model.showDistanceProperty], () => {
      mass1Node.voicingObjectResponse = positionDescriber.getDistanceFromOtherObjectDescription(model.object1.enum);
      mass2Node.voicingObjectResponse = positionDescriber.getDistanceFromOtherObjectDescription(model.object2.enum);
    });

    //------------------------------------------------
    // debugging
    //------------------------------------------------

    if (SHOW_DRAG_BOUNDS) {
      this.addChild(new ISLCDragBoundsNode(model, this.layoutBounds, modelViewTransform));
    }
    if (SHOW_GRID) {
      const gridNode = new ISLCGridNode(model.snapObjectsToNearest, this.layoutBounds, modelViewTransform, {
        stroke: 'rgba( 250, 100, 100, 0.6 )'
      });
      this.addChild(gridNode);
    }

    //------------------------------------------------
    // vibration prototype
    //------------------------------------------------
    if (phet.chipper.queryParameters.vibrationParadigm) {
      // sends messages to the containing Swift app
      const vibrationManager = new VibrationManageriOS();

      // the vibration controller for this simulation
      vibrationController.initialize(vibrationManager, model);

      // collection of input and simulation events that will be recorded during user interaction
      this.eventRecorder = new VibrationTestEventRecorder(vibrationManager);

      // listener that watches finger/touch input and saves to the event recorder
      this.vibrationTestInputListener = new VibrationTestInputListener(this.eventRecorder);
      phet.joist.display.addInputListener(this.vibrationTestInputListener);

      // sim specific events that we want to record
      model.object1.valueProperty.lazyLink(value => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(value, null, this.vibrationTestInputListener.elapsedTime, 'Mass 1 Value'));
      });
      model.object2.valueProperty.lazyLink(value => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(value, null, this.vibrationTestInputListener.elapsedTime, 'Mass 2 Value'));
      });
      model.object1.positionProperty.lazyLink(value => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(value, null, this.vibrationTestInputListener.elapsedTime, 'Moving Mass 1'));
      });
      model.object2.positionProperty.lazyLink(value => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(value, null, this.vibrationTestInputListener.elapsedTime, 'Moving Mass 2'));
      });
      model.constantRadiusProperty.lazyLink(constantRadius => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(constantRadius, null, this.vibrationTestInputListener.elapsedTime, 'Constant Radius'));
      });
      model.showDistanceProperty.lazyLink(showDistance => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(showDistance, null, this.vibrationTestInputListener.elapsedTime, 'Show Distance'));
      });
      model.showForceValuesProperty.lazyLink(showForceValues => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(showForceValues, null, this.vibrationTestInputListener.elapsedTime, 'Show Force Values'));
      });
      model.resetInProgressProperty.lazyLink(inProgress => {
        this.eventRecorder.addTestEvent(new VibrationTestEvent(null, null, this.vibrationTestInputListener.elapsedTime, 'Reset All'));
      });
    }
  }

  /**
   * step the view
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.forceSoundGenerator.step(dt);
    if (this.vibrationTestInputListener) {
      this.vibrationTestInputListener.setElapsedTime(this.vibrationTestInputListener.elapsedTime + dt);
    }
  }

  /**
   * Returns the string to use for the "Overview" button of the simulation Toolbar when
   * this screen is active.
   * @public
   * @returns {string}
   */
  getVoicingOverviewContent() {
    return this.voicingSummaryDescriber.createOverviewAlert();
  }

  /**
   * Returns the string to speak when the "Details" button of the simulation Toolbar
   * is pressed when this screen is active.
   * @public
   * @returns {string}
   */
  getVoicingDetailsContent() {
    return this.voicingSummaryDescriber.createDetailsAlert();
  }

  /**
   * Returns the string to speak whe the "Hints" button of the simulation Toolbar
   * is pressed when this screen is active.
   * @public
   * @returns {string}
   */
  getVoicingHintContent() {
    return this.voicingSummaryDescriber.createHintAlert();
  }
}
gravityForceLabBasics.register('GFLBScreenView', GFLBScreenView);
export default GFLBScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJCb3VuZHMyIiwiUmFuZ2UiLCJWZWN0b3IyIiwiR3Jhdml0eUZvcmNlTGFiU3RyaW5ncyIsIkdyYXZpdHlGb3JjZUxhYlNjcmVlblN1bW1hcnlOb2RlIiwiTWFzc0JvdW5kYXJ5U291bmRHZW5lcmF0b3IiLCJNYXNzU291bmRHZW5lcmF0b3IiLCJTcGhlcmVQb3NpdGlvbnNEZXNjcmlwdGlvbk5vZGUiLCJzYXR1cmF0ZWRTaW5lTG9vcFRyaW1tZWRfd2F2IiwiSW52ZXJzZVNxdWFyZUxhd0NvbW1vblN0cmluZ3MiLCJJU0xDUXVlcnlQYXJhbWV0ZXJzIiwiRGVmYXVsdERpcmVjdGlvbiIsIklTTENEcmFnQm91bmRzTm9kZSIsIklTTENHcmlkTm9kZSIsIklTTENPYmplY3RFbnVtIiwiU2NyZWVuVmlldyIsIlN0cmluZ1V0aWxzIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc2V0QWxsQnV0dG9uIiwiQ29sb3IiLCJIQm94IiwiTm9kZSIsIlBET01QZWVyIiwiVm9pY2luZyIsIkNvbnRpbnVvdXNQcm9wZXJ0eVNvdW5kR2VuZXJhdG9yIiwic291bmRNYW5hZ2VyIiwiVmlicmF0aW9uVGVzdEV2ZW50IiwiVmlicmF0aW9uVGVzdEV2ZW50UmVjb3JkZXIiLCJWaWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lciIsIlZpYnJhdGlvbk1hbmFnZXJpT1MiLCJHRkxCQ29uc3RhbnRzIiwiZ3Jhdml0eUZvcmNlTGFiQmFzaWNzIiwiR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncyIsIkdGTEJGb3JjZURlc2NyaWJlciIsIkdGTEJNYXNzRGVzY3JpYmVyIiwiR0ZMQlBvc2l0aW9uRGVzY3JpYmVyIiwiR0ZMQlZvaWNpbmdTdW1tYXJ5RGVzY3JpYmVyIiwiRGlzdGFuY2VBcnJvd05vZGUiLCJHRkxCQWxlcnRNYW5hZ2VyIiwiR0ZMQkNoZWNrYm94UGFuZWwiLCJHRkxCTWFzc0NvbnRyb2wiLCJHRkxCTWFzc0Rlc2NyaXB0aW9uTm9kZSIsIkdGTEJNYXNzTm9kZSIsInZpYnJhdGlvbkNvbnRyb2xsZXIiLCJjb25zdGFudFNpemVTdHJpbmciLCJjb25zdGFudFNpemUiLCJkaXN0YW5jZVN0cmluZyIsImRpc3RhbmNlIiwiZm9yY2VWYWx1ZXNTdHJpbmciLCJmb3JjZVZhbHVlcyIsIm1hc3MxTGFiZWxTdHJpbmciLCJtYXNzMUxhYmVsIiwibWFzczFTdHJpbmciLCJtYXNzMSIsIm1hc3MyTGFiZWxTdHJpbmciLCJtYXNzMkxhYmVsIiwibWFzczJTdHJpbmciLCJtYXNzMiIsIm1hc3MxQ29udHJvbExhYmVsU3RyaW5nIiwibWFzczFDb250cm9sTGFiZWwiLCJtYXNzMkNvbnRyb2xMYWJlbFN0cmluZyIsIm1hc3MyQ29udHJvbExhYmVsIiwibWFzc0NvbnRyb2xzTGFiZWxTdHJpbmciLCJhMTF5IiwiY29udHJvbHMiLCJtYXNzQ29udHJvbHNMYWJlbCIsIm1hc3NDb250cm9sc0hlbHBUZXh0QmlsbGlvbnNTdHJpbmciLCJtYXNzQ29udHJvbHNIZWxwVGV4dEJpbGxpb25zIiwibWFzc0NvbnRyb2xzSGVscFRleHREZW5zaXR5QmlsbGlvbnNTdHJpbmciLCJtYXNzQ29udHJvbHNIZWxwVGV4dERlbnNpdHlCaWxsaW9ucyIsImZvcmNlVmFsdWVzQ2hlY2tib3hIZWxwVGV4dFN0cmluZyIsImZvcmNlVmFsdWVzQ2hlY2tib3hIZWxwVGV4dCIsImNvbnN0YW50U2l6ZUNoZWNrYm94SGVscFRleHRTdHJpbmciLCJjb25zdGFudFNpemVDaGVja2JveEhlbHBUZXh0IiwiZGlzdGFuY2VDaGVja2JveEhlbHBUZXh0U3RyaW5nIiwiZGlzdGFuY2VDaGVja2JveEhlbHBUZXh0Iiwic2NyZWVuU3VtbWFyeVBsYXlBcmVhQ29udHJvbHNTdHJpbmciLCJzY3JlZW5TdW1tYXJ5IiwicGxheUFyZWFDb250cm9scyIsImJhc2ljc1NpbVN0YXRlTGFiZWxTdHJpbmciLCJiYXNpY3NTaW1TdGF0ZUxhYmVsIiwic2NyZWVuU3VtbWFyeVBsYXlBcmVhT3ZlcnZpZXdQYXR0ZXJuU3RyaW5nIiwicGxheUFyZWFPdmVydmlld1BhdHRlcm4iLCJzY3JlZW5TdW1tYXJ5U2Vjb25kYXJ5RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nIiwic2Vjb25kYXJ5RGVzY3JpcHRpb25QYXR0ZXJuIiwidGhlUGxheUFyZWFIYXNTdHJpbmciLCJ0aGVQbGF5QXJlYUhhcyIsImluVGhlQ29udHJvbEFyZWFTdHJpbmciLCJpblRoZUNvbnRyb2xBcmVhIiwiZm9yY2VWYWx1ZXNIaW50UmVzcG9uc2VTdHJpbmciLCJ2b2ljaW5nIiwiZm9yY2VWYWx1ZXNIaW50UmVzcG9uc2UiLCJkaXN0YW5jZUhpbnRSZXNwb25zZVN0cmluZyIsImRpc3RhbmNlSGludFJlc3BvbnNlIiwiY29uc3RhbnRTaXplSGludFJlc3BvbnNlU3RyaW5nIiwiY29uc3RhbnRTaXplSGludFJlc3BvbnNlIiwiZm9yY2VWYWx1ZXNTaG93blJlc3BvbnNlU3RyaW5nIiwiZm9yY2VWYWx1ZXNTaG93blJlc3BvbnNlIiwiZm9yY2VWYWx1ZXNIaWRkZW5SZXNwb25zZVN0cmluZyIsImZvcmNlVmFsdWVzSGlkZGVuUmVzcG9uc2UiLCJkaXN0YW5jZVNob3duUmVzcG9uc2VTdHJpbmciLCJkaXN0YW5jZVNob3duUmVzcG9uc2UiLCJkaXN0YW5jZUhpZGRlblJlc3BvbnNlU3RyaW5nIiwiZGlzdGFuY2VIaWRkZW5SZXNwb25zZSIsImNvbnN0YW50U2l6ZVNldFJlc3BvbnNlU3RyaW5nIiwiY29uc3RhbnRTaXplU2V0UmVzcG9uc2UiLCJjb25zdGFudFNpemVOb3RTZXRSZXNwb25zZVN0cmluZyIsImNvbnN0YW50U2l6ZU5vdFNldFJlc3BvbnNlIiwiTUFTU19DT05UUk9MU19ZX1BPU0lUSU9OIiwiUEFORUxfU1BBQ0lORyIsIlNIT1dfR1JJRCIsInNob3dHcmlkIiwiU0hPV19EUkFHX0JPVU5EUyIsInNob3dEcmFnQm91bmRzIiwiT0JKRUNUX09ORSIsIk9CSkVDVF9UV08iLCJCT1VOREFSWV9TT1VORFNfTEVWRUwiLCJHRkxCU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJwb3NpdGlvbkRlc2NyaWJlciIsImZvcmNlRGVzY3JpYmVyIiwibWFzc0Rlc2NyaWJlciIsInBsYXlBcmVhT3ZlcnZpZXdTdHJpbmciLCJmaWxsSW4iLCJwbGF5QXJlYSIsInNlY29uZGFyeU92ZXJ2aWV3U3RyaW5nIiwiY29udHJvbEFyZWEiLCJsYXlvdXRCb3VuZHMiLCJzY3JlZW5TdW1tYXJ5Q29udGVudCIsInNjcmVlblN1bW1hcnlQbGF5QXJlYU92ZXJ2aWV3Iiwic2NyZWVuU3VtbWFyeVBsYXlBcmVhQ29udHJvbHMiLCJzZWNvbmRhcnlEZXNjcmlwdGlvbkNvbnRlbnQiLCJzaW1TdGF0ZUxhYmVsIiwiYWRkaXRpb25hbE1hc3NEaXN0YW5jZVByb3BlcnRpZXMiLCJzaG93RGlzdGFuY2VQcm9wZXJ0eSIsImFsZXJ0TWFuYWdlciIsImRlc2NyaXB0aW9uQWxlcnROb2RlIiwidm9pY2luZ1N1bW1hcnlEZXNjcmliZXIiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJ3aWR0aCIsImhlaWdodCIsIm1hc3MxTm9kZSIsIm9iamVjdDEiLCJsYWJlbCIsIm90aGVyT2JqZWN0TGFiZWwiLCJkZWZhdWx0RGlyZWN0aW9uIiwiTEVGVCIsImFycm93Q29sb3IiLCJmb3JjZUFycm93SGVpZ2h0IiwiY3JlYXRlVGFuZGVtIiwibWFzczJOb2RlIiwib2JqZWN0MiIsIlJJR0hUIiwibWFzc0Rlc2NyaXB0aW9uTm9kZU9wdGlvbnMiLCJvYmplY3QxTGFiZWwiLCJvYmplY3QyTGFiZWwiLCJvYmplY3RPbmVNYXNzRGVzY3JpcHRpb25Ob2RlIiwib2JqZWN0VHdvTWFzc0Rlc2NyaXB0aW9uTm9kZSIsIm1hc3NQb3NpdGlvbnNOb2RlIiwiYWRkaXRpb25hbERlc2NyaXB0aW9uRGVwZW5kZW5jaWVzIiwiYWRkQ2hpbGQiLCJhcnJvd05vZGUiLCJtYXNzQ29udHJvbDEiLCJ2YWx1ZVByb3BlcnR5IiwiTUFTU19SQU5HRSIsIm1hc3NDb250cm9sMiIsImNvbG9yIiwibWFzc0NvbnRyb2xzTm9kZSIsImxhYmVsVGFnTmFtZSIsImxhYmVsQ29udGVudCIsInRhZ05hbWUiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJhZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uIiwib3RoZXJOb2RlIiwib3RoZXJFbGVtZW50TmFtZSIsIkxBQkVMX1NJQkxJTkciLCJ0aGlzRWxlbWVudE5hbWUiLCJQUklNQVJZX1NJQkxJTkciLCJtYXNzQ29udHJvbEJveCIsImNoaWxkcmVuIiwiY2VudGVyIiwic3BhY2luZyIsImNvbnN0YW50UmFkaXVzUHJvcGVydHkiLCJsaW5rIiwiY29uc3RhbnRSYWRpdXMiLCJhZGRTb3VuZEdlbmVyYXRvciIsInJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5IiwiaW5pdGlhbE91dHB1dExldmVsIiwiZm9yY2VTb3VuZEdlbmVyYXRvciIsImZvcmNlUHJvcGVydHkiLCJnZXRNaW5Gb3JjZSIsImdldE1heEZvcmNlIiwicGxheWJhY2tSYXRlQ2VudGVyT2Zmc2V0IiwidHJpbVNpbGVuY2UiLCJjaGVja2JveEl0ZW1zIiwicHJvcGVydHkiLCJzaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eSIsIm9wdGlvbnMiLCJhY2Nlc3NpYmxlTmFtZSIsInZvaWNpbmdOYW1lUmVzcG9uc2UiLCJ2b2ljaW5nSGludFJlc3BvbnNlIiwiY2hlY2tlZENvbnRleHRSZXNwb25zZSIsInVuY2hlY2tlZENvbnRleHRSZXNwb25zZSIsInBhcmFtZXRlckNvbnRyb2xQYW5lbCIsImZpbGwiLCJkaXN0YW5jZUFycm93Tm9kZSIsInkiLCJsaW5rQXR0cmlidXRlIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwicmlnaHQiLCJtYXhYIiwiYm90dG9tIiwibWF4WSIsInBkb21QbGF5QXJlYU5vZGUiLCJwZG9tQ29udHJvbEFyZWFOb2RlIiwicGRvbU9yZGVyIiwicmVnaXN0ZXJVdHRlcmFuY2VUb05vZGUiLCJjb25zdGFudFNpemVDaGFuZ2VkQ29udGV4dFJlc3BvbnNlVXR0ZXJhbmNlIiwibGVmdCIsInRvcCIsIm11bHRpbGluayIsInBvc2l0aW9uUHJvcGVydHkiLCJ2b2ljaW5nT2JqZWN0UmVzcG9uc2UiLCJnZXREaXN0YW5jZUZyb21PdGhlck9iamVjdERlc2NyaXB0aW9uIiwiZW51bSIsImdyaWROb2RlIiwic25hcE9iamVjdHNUb05lYXJlc3QiLCJzdHJva2UiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInZpYnJhdGlvblBhcmFkaWdtIiwidmlicmF0aW9uTWFuYWdlciIsImluaXRpYWxpemUiLCJldmVudFJlY29yZGVyIiwidmlicmF0aW9uVGVzdElucHV0TGlzdGVuZXIiLCJqb2lzdCIsImRpc3BsYXkiLCJhZGRJbnB1dExpc3RlbmVyIiwibGF6eUxpbmsiLCJ2YWx1ZSIsImFkZFRlc3RFdmVudCIsImVsYXBzZWRUaW1lIiwic2hvd0Rpc3RhbmNlIiwic2hvd0ZvcmNlVmFsdWVzIiwiaW5Qcm9ncmVzcyIsInN0ZXAiLCJkdCIsInNldEVsYXBzZWRUaW1lIiwiZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCIsImNyZWF0ZU92ZXJ2aWV3QWxlcnQiLCJnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQiLCJjcmVhdGVEZXRhaWxzQWxlcnQiLCJnZXRWb2ljaW5nSGludENvbnRlbnQiLCJjcmVhdGVIaW50QWxlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdGTEJTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gc2NyZWVuIHZpZXcgZm9yIHRoZSBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzIGZyb20gJy4uLy4uLy4uL2dyYXZpdHktZm9yY2UtbGFiL2pzL0dyYXZpdHlGb3JjZUxhYlN0cmluZ3MuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUZvcmNlTGFiU2NyZWVuU3VtbWFyeU5vZGUgZnJvbSAnLi4vLi4vLi4vZ3Jhdml0eS1mb3JjZS1sYWIvanMvdmlldy9HcmF2aXR5Rm9yY2VMYWJTY3JlZW5TdW1tYXJ5Tm9kZS5qcyc7XHJcbmltcG9ydCBNYXNzQm91bmRhcnlTb3VuZEdlbmVyYXRvciBmcm9tICcuLi8uLi8uLi9ncmF2aXR5LWZvcmNlLWxhYi9qcy92aWV3L01hc3NCb3VuZGFyeVNvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IE1hc3NTb3VuZEdlbmVyYXRvciBmcm9tICcuLi8uLi8uLi9ncmF2aXR5LWZvcmNlLWxhYi9qcy92aWV3L01hc3NTb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBTcGhlcmVQb3NpdGlvbnNEZXNjcmlwdGlvbk5vZGUgZnJvbSAnLi4vLi4vLi4vZ3Jhdml0eS1mb3JjZS1sYWIvanMvdmlldy9TcGhlcmVQb3NpdGlvbnNEZXNjcmlwdGlvbk5vZGUuanMnO1xyXG5pbXBvcnQgc2F0dXJhdGVkU2luZUxvb3BUcmltbWVkX3dhdiBmcm9tICcuLi8uLi8uLi9ncmF2aXR5LWZvcmNlLWxhYi9zb3VuZHMvc2F0dXJhdGVkU2luZUxvb3BUcmltbWVkX3dhdi5qcyc7XHJcbmltcG9ydCBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9pbnZlcnNlLXNxdWFyZS1sYXctY29tbW9uL2pzL0ludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IElTTENRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy9JU0xDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IERlZmF1bHREaXJlY3Rpb24gZnJvbSAnLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L0RlZmF1bHREaXJlY3Rpb24uanMnO1xyXG5pbXBvcnQgSVNMQ0RyYWdCb3VuZHNOb2RlIGZyb20gJy4uLy4uLy4uL2ludmVyc2Utc3F1YXJlLWxhdy1jb21tb24vanMvdmlldy9JU0xDRHJhZ0JvdW5kc05vZGUuanMnO1xyXG5pbXBvcnQgSVNMQ0dyaWROb2RlIGZyb20gJy4uLy4uLy4uL2ludmVyc2Utc3F1YXJlLWxhdy1jb21tb24vanMvdmlldy9JU0xDR3JpZE5vZGUuanMnO1xyXG5pbXBvcnQgSVNMQ09iamVjdEVudW0gZnJvbSAnLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy9tb2RlbC9JU0xDT2JqZWN0RW51bS5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgSEJveCwgTm9kZSwgUERPTVBlZXIsIFZvaWNpbmcgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ29udGludW91c1Byb3BlcnR5U291bmRHZW5lcmF0b3IgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Db250aW51b3VzUHJvcGVydHlTb3VuZEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IFZpYnJhdGlvblRlc3RFdmVudCBmcm9tICcuLi8uLi8uLi90YXBwaS9qcy90cmFja2luZy9WaWJyYXRpb25UZXN0RXZlbnQuanMnO1xyXG5pbXBvcnQgVmlicmF0aW9uVGVzdEV2ZW50UmVjb3JkZXIgZnJvbSAnLi4vLi4vLi4vdGFwcGkvanMvdHJhY2tpbmcvVmlicmF0aW9uVGVzdEV2ZW50UmVjb3JkZXIuanMnO1xyXG5pbXBvcnQgVmlicmF0aW9uVGVzdElucHV0TGlzdGVuZXIgZnJvbSAnLi4vLi4vLi4vdGFwcGkvanMvdHJhY2tpbmcvVmlicmF0aW9uVGVzdElucHV0TGlzdGVuZXIuanMnO1xyXG5pbXBvcnQgVmlicmF0aW9uTWFuYWdlcmlPUyBmcm9tICcuLi8uLi8uLi90YXBwaS9qcy9WaWJyYXRpb25NYW5hZ2VyaU9TLmpzJztcclxuaW1wb3J0IEdGTEJDb25zdGFudHMgZnJvbSAnLi4vR0ZMQkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBncmF2aXR5Rm9yY2VMYWJCYXNpY3MgZnJvbSAnLi4vZ3Jhdml0eUZvcmNlTGFiQmFzaWNzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MgZnJvbSAnLi4vR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBHRkxCRm9yY2VEZXNjcmliZXIgZnJvbSAnLi9kZXNjcmliZXJzL0dGTEJGb3JjZURlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBHRkxCTWFzc0Rlc2NyaWJlciBmcm9tICcuL2Rlc2NyaWJlcnMvR0ZMQk1hc3NEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgR0ZMQlBvc2l0aW9uRGVzY3JpYmVyIGZyb20gJy4vZGVzY3JpYmVycy9HRkxCUG9zaXRpb25EZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgR0ZMQlZvaWNpbmdTdW1tYXJ5RGVzY3JpYmVyIGZyb20gJy4vZGVzY3JpYmVycy9HRkxCVm9pY2luZ1N1bW1hcnlEZXNjcmliZXIuanMnO1xyXG5pbXBvcnQgRGlzdGFuY2VBcnJvd05vZGUgZnJvbSAnLi9EaXN0YW5jZUFycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBHRkxCQWxlcnRNYW5hZ2VyIGZyb20gJy4vR0ZMQkFsZXJ0TWFuYWdlci5qcyc7XHJcbmltcG9ydCBHRkxCQ2hlY2tib3hQYW5lbCBmcm9tICcuL0dGTEJDaGVja2JveFBhbmVsLmpzJztcclxuaW1wb3J0IEdGTEJNYXNzQ29udHJvbCBmcm9tICcuL0dGTEJNYXNzQ29udHJvbC5qcyc7XHJcbmltcG9ydCBHRkxCTWFzc0Rlc2NyaXB0aW9uTm9kZSBmcm9tICcuL0dGTEJNYXNzRGVzY3JpcHRpb25Ob2RlLmpzJztcclxuaW1wb3J0IEdGTEJNYXNzTm9kZSBmcm9tICcuL0dGTEJNYXNzTm9kZS5qcyc7XHJcbmltcG9ydCB2aWJyYXRpb25Db250cm9sbGVyIGZyb20gJy4vdmlicmF0aW9uQ29udHJvbGxlci5qcyc7XHJcblxyXG5jb25zdCBjb25zdGFudFNpemVTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJTdHJpbmdzLmNvbnN0YW50U2l6ZTtcclxuY29uc3QgZGlzdGFuY2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmRpc3RhbmNlO1xyXG5jb25zdCBmb3JjZVZhbHVlc1N0cmluZyA9IEludmVyc2VTcXVhcmVMYXdDb21tb25TdHJpbmdzLmZvcmNlVmFsdWVzO1xyXG5jb25zdCBtYXNzMUxhYmVsU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncy5tYXNzMUxhYmVsO1xyXG5jb25zdCBtYXNzMVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MubWFzczE7XHJcbmNvbnN0IG1hc3MyTGFiZWxTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLm1hc3MyTGFiZWw7XHJcbmNvbnN0IG1hc3MyU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5tYXNzMjtcclxuY29uc3QgbWFzczFDb250cm9sTGFiZWxTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLm1hc3MxQ29udHJvbExhYmVsO1xyXG5jb25zdCBtYXNzMkNvbnRyb2xMYWJlbFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MubWFzczJDb250cm9sTGFiZWw7XHJcbmNvbnN0IG1hc3NDb250cm9sc0xhYmVsU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiU3RyaW5ncy5hMTF5LmNvbnRyb2xzLm1hc3NDb250cm9sc0xhYmVsO1xyXG5jb25zdCBtYXNzQ29udHJvbHNIZWxwVGV4dEJpbGxpb25zU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncy5hMTF5Lm1hc3NDb250cm9sc0hlbHBUZXh0QmlsbGlvbnM7XHJcbmNvbnN0IG1hc3NDb250cm9sc0hlbHBUZXh0RGVuc2l0eUJpbGxpb25zU3RyaW5nID0gR3Jhdml0eUZvcmNlTGFiQmFzaWNzU3RyaW5ncy5hMTF5Lm1hc3NDb250cm9sc0hlbHBUZXh0RGVuc2l0eUJpbGxpb25zO1xyXG5jb25zdCBmb3JjZVZhbHVlc0NoZWNrYm94SGVscFRleHRTdHJpbmcgPSBJbnZlcnNlU3F1YXJlTGF3Q29tbW9uU3RyaW5ncy5hMTF5LmZvcmNlVmFsdWVzQ2hlY2tib3hIZWxwVGV4dDtcclxuY29uc3QgY29uc3RhbnRTaXplQ2hlY2tib3hIZWxwVGV4dFN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYlN0cmluZ3MuYTExeS5jb250cm9scy5jb25zdGFudFNpemVDaGVja2JveEhlbHBUZXh0O1xyXG5jb25zdCBkaXN0YW5jZUNoZWNrYm94SGVscFRleHRTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkuZGlzdGFuY2VDaGVja2JveEhlbHBUZXh0O1xyXG5jb25zdCBzY3JlZW5TdW1tYXJ5UGxheUFyZWFDb250cm9sc1N0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LnBsYXlBcmVhQ29udHJvbHM7XHJcbmNvbnN0IGJhc2ljc1NpbVN0YXRlTGFiZWxTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5iYXNpY3NTaW1TdGF0ZUxhYmVsO1xyXG5jb25zdCBzY3JlZW5TdW1tYXJ5UGxheUFyZWFPdmVydmlld1BhdHRlcm5TdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5wbGF5QXJlYU92ZXJ2aWV3UGF0dGVybjtcclxuY29uc3Qgc2NyZWVuU3VtbWFyeVNlY29uZGFyeURlc2NyaXB0aW9uUGF0dGVyblN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LnNlY29uZGFyeURlc2NyaXB0aW9uUGF0dGVybjtcclxuY29uc3QgdGhlUGxheUFyZWFIYXNTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS50aGVQbGF5QXJlYUhhcztcclxuY29uc3QgaW5UaGVDb250cm9sQXJlYVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS5zY3JlZW5TdW1tYXJ5LmluVGhlQ29udHJvbEFyZWE7XHJcblxyXG5jb25zdCBmb3JjZVZhbHVlc0hpbnRSZXNwb25zZVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS52b2ljaW5nLmZvcmNlVmFsdWVzSGludFJlc3BvbnNlO1xyXG5jb25zdCBkaXN0YW5jZUhpbnRSZXNwb25zZVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS52b2ljaW5nLmRpc3RhbmNlSGludFJlc3BvbnNlO1xyXG5jb25zdCBjb25zdGFudFNpemVIaW50UmVzcG9uc2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkudm9pY2luZy5jb25zdGFudFNpemVIaW50UmVzcG9uc2U7XHJcblxyXG5jb25zdCBmb3JjZVZhbHVlc1Nob3duUmVzcG9uc2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkudm9pY2luZy5mb3JjZVZhbHVlc1Nob3duUmVzcG9uc2U7XHJcbmNvbnN0IGZvcmNlVmFsdWVzSGlkZGVuUmVzcG9uc2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkudm9pY2luZy5mb3JjZVZhbHVlc0hpZGRlblJlc3BvbnNlO1xyXG5jb25zdCBkaXN0YW5jZVNob3duUmVzcG9uc2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkudm9pY2luZy5kaXN0YW5jZVNob3duUmVzcG9uc2U7XHJcbmNvbnN0IGRpc3RhbmNlSGlkZGVuUmVzcG9uc2VTdHJpbmcgPSBHcmF2aXR5Rm9yY2VMYWJCYXNpY3NTdHJpbmdzLmExMXkudm9pY2luZy5kaXN0YW5jZUhpZGRlblJlc3BvbnNlO1xyXG5jb25zdCBjb25zdGFudFNpemVTZXRSZXNwb25zZVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS52b2ljaW5nLmNvbnN0YW50U2l6ZVNldFJlc3BvbnNlO1xyXG5jb25zdCBjb25zdGFudFNpemVOb3RTZXRSZXNwb25zZVN0cmluZyA9IEdyYXZpdHlGb3JjZUxhYkJhc2ljc1N0cmluZ3MuYTExeS52b2ljaW5nLmNvbnN0YW50U2l6ZU5vdFNldFJlc3BvbnNlO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE1BU1NfQ09OVFJPTFNfWV9QT1NJVElPTiA9IDM4NTtcclxuY29uc3QgUEFORUxfU1BBQ0lORyA9IDUwO1xyXG5jb25zdCBTSE9XX0dSSUQgPSBJU0xDUXVlcnlQYXJhbWV0ZXJzLnNob3dHcmlkO1xyXG5jb25zdCBTSE9XX0RSQUdfQk9VTkRTID0gSVNMQ1F1ZXJ5UGFyYW1ldGVycy5zaG93RHJhZ0JvdW5kcztcclxuY29uc3QgT0JKRUNUX09ORSA9IElTTENPYmplY3RFbnVtLk9CSkVDVF9PTkU7XHJcbmNvbnN0IE9CSkVDVF9UV08gPSBJU0xDT2JqZWN0RW51bS5PQkpFQ1RfVFdPO1xyXG5jb25zdCBCT1VOREFSWV9TT1VORFNfTEVWRUwgPSAxO1xyXG5cclxuY2xhc3MgR0ZMQlNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtHRkxCTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIC8vIGluaXRpYWxpemUgYTExeSBkZXNjcmliZXJzIGFuZCBhbGVydCBtYW5hZ2VyXHJcbiAgICBjb25zdCBwb3NpdGlvbkRlc2NyaWJlciA9IG5ldyBHRkxCUG9zaXRpb25EZXNjcmliZXIoIG1vZGVsLCBtYXNzMUxhYmVsU3RyaW5nLCBtYXNzMkxhYmVsU3RyaW5nICk7XHJcbiAgICBjb25zdCBmb3JjZURlc2NyaWJlciA9IG5ldyBHRkxCRm9yY2VEZXNjcmliZXIoIG1vZGVsLCBtYXNzMUxhYmVsU3RyaW5nLCBtYXNzMkxhYmVsU3RyaW5nLCBwb3NpdGlvbkRlc2NyaWJlciApO1xyXG4gICAgY29uc3QgbWFzc0Rlc2NyaWJlciA9IG5ldyBHRkxCTWFzc0Rlc2NyaWJlciggbW9kZWwsIGZvcmNlRGVzY3JpYmVyICk7XHJcblxyXG4gICAgY29uc3QgcGxheUFyZWFPdmVydmlld1N0cmluZyA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2NyZWVuU3VtbWFyeVBsYXlBcmVhT3ZlcnZpZXdQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIHBsYXlBcmVhOiB0aGVQbGF5QXJlYUhhc1N0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNlY29uZGFyeU92ZXJ2aWV3U3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzY3JlZW5TdW1tYXJ5U2Vjb25kYXJ5RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgIGNvbnRyb2xBcmVhOiBpblRoZUNvbnRyb2xBcmVhU3RyaW5nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBuZXcgQm91bmRzMiggMCwgMCwgNzY4LCA0NjQgKSxcclxuICAgICAgc2NyZWVuU3VtbWFyeUNvbnRlbnQ6IG5ldyBHcmF2aXR5Rm9yY2VMYWJTY3JlZW5TdW1tYXJ5Tm9kZSggbW9kZWwsIG1hc3NEZXNjcmliZXIsIGZvcmNlRGVzY3JpYmVyLCBwb3NpdGlvbkRlc2NyaWJlciwge1xyXG4gICAgICAgIHNjcmVlblN1bW1hcnlQbGF5QXJlYU92ZXJ2aWV3OiBwbGF5QXJlYU92ZXJ2aWV3U3RyaW5nLFxyXG4gICAgICAgIHNjcmVlblN1bW1hcnlQbGF5QXJlYUNvbnRyb2xzOiBzY3JlZW5TdW1tYXJ5UGxheUFyZWFDb250cm9sc1N0cmluZyxcclxuICAgICAgICBzZWNvbmRhcnlEZXNjcmlwdGlvbkNvbnRlbnQ6IHNlY29uZGFyeU92ZXJ2aWV3U3RyaW5nLFxyXG4gICAgICAgIHNpbVN0YXRlTGFiZWw6IGJhc2ljc1NpbVN0YXRlTGFiZWxTdHJpbmcsXHJcbiAgICAgICAgYWRkaXRpb25hbE1hc3NEaXN0YW5jZVByb3BlcnRpZXM6IFsgbW9kZWwuc2hvd0Rpc3RhbmNlUHJvcGVydHkgXVxyXG4gICAgICB9ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYWxlcnRNYW5hZ2VyID0gbmV3IEdGTEJBbGVydE1hbmFnZXIoIG1vZGVsLCBtYXNzRGVzY3JpYmVyLCBmb3JjZURlc2NyaWJlciwge1xyXG4gICAgICBkZXNjcmlwdGlvbkFsZXJ0Tm9kZTogdGhpc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtHRkxCVm9pY2luZ1N1bW1hcnlEZXNjcmliZXJ9IC0gR2VuZXJhdGVzIGFsZXJ0cyBmb3IgdGhlIFZvaWNpbmcgZmVhdHVyZSBmcm9tIGJ1dHRvbnMgaW4gdGhlIFNpbVxyXG4gICAgLy8gVG9vbGJhci5cclxuICAgIHRoaXMudm9pY2luZ1N1bW1hcnlEZXNjcmliZXIgPSBuZXcgR0ZMQlZvaWNpbmdTdW1tYXJ5RGVzY3JpYmVyKCBmb3JjZURlc2NyaWJlciwgcG9zaXRpb25EZXNjcmliZXIsIG1hc3NEZXNjcmliZXIgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtLiAgVGhlIHByaW1hcnkgdW5pdHMgdXNlZCBpbiB0aGUgbW9kZWwgYXJlIG1ldGVycywgc28gc2lnbmlmaWNhbnQgem9vbSBpcyB1c2VkLlxyXG4gICAgLy8gVGhlIG11bHRpcGxpZXJzIGZvciB0aGUgMm5kIHBhcmFtZXRlciBjYW4gYmUgdXNlZCB0byBhZGp1c3Qgd2hlcmUgdGhlIHBvaW50ICgwLCAwKSBpbiB0aGUgbW9kZWwsIHdoaWNoIGlzXHJcbiAgICAvLyBiZXR3ZWVuIHRoZSB0d28gbWFzc2VzLlxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyhcclxuICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICBuZXcgVmVjdG9yMiggdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggLyAyLCB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgLyAyICksXHJcbiAgICAgIDAuMDVcclxuICAgICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBtYXNzIG5vZGVzIHRvIHRoZSB2aWV3XHJcbiAgICBjb25zdCBtYXNzMU5vZGUgPSBuZXcgR0ZMQk1hc3NOb2RlKCBtb2RlbCwgbW9kZWwub2JqZWN0MSwgdGhpcy5sYXlvdXRCb3VuZHMsIG1vZGVsVmlld1RyYW5zZm9ybSwgYWxlcnRNYW5hZ2VyLFxyXG4gICAgICBmb3JjZURlc2NyaWJlcixcclxuICAgICAgcG9zaXRpb25EZXNjcmliZXIsIHtcclxuICAgICAgICBsYWJlbDogbWFzczFMYWJlbFN0cmluZyxcclxuICAgICAgICBvdGhlck9iamVjdExhYmVsOiBtYXNzMkxhYmVsU3RyaW5nLFxyXG4gICAgICAgIGRlZmF1bHREaXJlY3Rpb246IERlZmF1bHREaXJlY3Rpb24uTEVGVCxcclxuICAgICAgICBhcnJvd0NvbG9yOiAnIzY2RicsXHJcbiAgICAgICAgZm9yY2VBcnJvd0hlaWdodDogMTI1LFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3MxTm9kZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWFzczJOb2RlID0gbmV3IEdGTEJNYXNzTm9kZSggbW9kZWwsIG1vZGVsLm9iamVjdDIsIHRoaXMubGF5b3V0Qm91bmRzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGFsZXJ0TWFuYWdlcixcclxuICAgICAgZm9yY2VEZXNjcmliZXIsXHJcbiAgICAgIHBvc2l0aW9uRGVzY3JpYmVyLCB7XHJcbiAgICAgICAgbGFiZWw6IG1hc3MyTGFiZWxTdHJpbmcsXHJcbiAgICAgICAgb3RoZXJPYmplY3RMYWJlbDogbWFzczFMYWJlbFN0cmluZyxcclxuICAgICAgICBkZWZhdWx0RGlyZWN0aW9uOiBEZWZhdWx0RGlyZWN0aW9uLlJJR0hULFxyXG4gICAgICAgIGFycm93Q29sb3I6ICcjRjY2JyxcclxuICAgICAgICBmb3JjZUFycm93SGVpZ2h0OiAxNzUsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzczJOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBtYXNzRGVzY3JpcHRpb25Ob2RlT3B0aW9ucyA9IHtcclxuICAgICAgb2JqZWN0MUxhYmVsOiBtYXNzMUxhYmVsU3RyaW5nLFxyXG4gICAgICBvYmplY3QyTGFiZWw6IG1hc3MyTGFiZWxTdHJpbmdcclxuICAgIH07XHJcblxyXG4gICAgLy8gcGRvbSBkZXNjcmlwdGlvbnMgZm9yIGVhY2ggbWFzcyAtIHRoZSBtYXNzZXMgdGhlbXNlbHZlcyBsZXZlcmFnZSBBY2Nlc3NpYmxlVmFsdWVIYW5kbGVyLCBidXQgdGhlc2VcclxuICAgIC8vIGZvcm0gZGVzY3JpcHRpdmUgc3VtbWFyaWVzIGZvciB0aGUgc3RhdGUgb2YgZWFjaCBtYXNzXHJcbiAgICBjb25zdCBvYmplY3RPbmVNYXNzRGVzY3JpcHRpb25Ob2RlID0gbmV3IEdGTEJNYXNzRGVzY3JpcHRpb25Ob2RlKCBtb2RlbCwgbW9kZWwub2JqZWN0MSwgbWFzc0Rlc2NyaWJlciwgZm9yY2VEZXNjcmliZXIsXHJcbiAgICAgIHBvc2l0aW9uRGVzY3JpYmVyLCBtYXNzRGVzY3JpcHRpb25Ob2RlT3B0aW9ucyApO1xyXG4gICAgY29uc3Qgb2JqZWN0VHdvTWFzc0Rlc2NyaXB0aW9uTm9kZSA9IG5ldyBHRkxCTWFzc0Rlc2NyaXB0aW9uTm9kZSggbW9kZWwsIG1vZGVsLm9iamVjdDIsIG1hc3NEZXNjcmliZXIsIGZvcmNlRGVzY3JpYmVyLFxyXG4gICAgICBwb3NpdGlvbkRlc2NyaWJlciwgbWFzc0Rlc2NyaXB0aW9uTm9kZU9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBtYXNzUG9zaXRpb25zTm9kZSA9IG5ldyBTcGhlcmVQb3NpdGlvbnNEZXNjcmlwdGlvbk5vZGUoIG1vZGVsLCBwb3NpdGlvbkRlc2NyaWJlciwge1xyXG4gICAgICBhZGRpdGlvbmFsRGVzY3JpcHRpb25EZXBlbmRlbmNpZXM6IFsgbW9kZWwuc2hvd0Rpc3RhbmNlUHJvcGVydHkgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIG1hc3NQb3NpdGlvbnNOb2RlLmFkZENoaWxkKCBtYXNzMU5vZGUgKTtcclxuICAgIG1hc3NQb3NpdGlvbnNOb2RlLmFkZENoaWxkKCBtYXNzMk5vZGUgKTtcclxuXHJcbiAgICAvLyB0aGUgYXJyb3cgbm9kZXMgYW5kIHRoZWlyIGxhYmVscyBzaG91bGQgYmUgb24gdG9wIG9mIHRoZSBtYXNzZXMsIGJ1dCB1bmRlciB0aGUgcmVzdCBvZiB0aGUgY29udHJvbCBwYW5lbFxyXG4gICAgbWFzc1Bvc2l0aW9uc05vZGUuYWRkQ2hpbGQoIG1hc3MxTm9kZS5hcnJvd05vZGUgKTtcclxuICAgIG1hc3NQb3NpdGlvbnNOb2RlLmFkZENoaWxkKCBtYXNzMk5vZGUuYXJyb3dOb2RlICk7XHJcblxyXG4gICAgLy8gbWFzcyBjb250cm9sc1xyXG4gICAgY29uc3QgbWFzc0NvbnRyb2wxID0gbmV3IEdGTEJNYXNzQ29udHJvbCggbWFzczFTdHJpbmcsIG1vZGVsLm9iamVjdDEudmFsdWVQcm9wZXJ0eSxcclxuICAgICAgR0ZMQkNvbnN0YW50cy5NQVNTX1JBTkdFLCBtYXNzMUNvbnRyb2xMYWJlbFN0cmluZywgT0JKRUNUX09ORSwgYWxlcnRNYW5hZ2VyLFxyXG4gICAgICBtYXNzRGVzY3JpYmVyLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzc0NvbnRyb2wxJyApICk7XHJcbiAgICBjb25zdCBtYXNzQ29udHJvbDIgPSBuZXcgR0ZMQk1hc3NDb250cm9sKCBtYXNzMlN0cmluZywgbW9kZWwub2JqZWN0Mi52YWx1ZVByb3BlcnR5LFxyXG4gICAgICBHRkxCQ29uc3RhbnRzLk1BU1NfUkFOR0UsIG1hc3MyQ29udHJvbExhYmVsU3RyaW5nLCBPQkpFQ1RfVFdPLCBhbGVydE1hbmFnZXIsXHJcbiAgICAgIG1hc3NEZXNjcmliZXIsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXNzQ29udHJvbDInICksIHtcclxuICAgICAgICBjb2xvcjogbmV3IENvbG9yKCAyNTUsIDAsIDAgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWFzc0NvbnRyb2xzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2gzJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBtYXNzQ29udHJvbHNMYWJlbFN0cmluZyxcclxuICAgICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogbWFzc0NvbnRyb2xzSGVscFRleHRCaWxsaW9uc1N0cmluZ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBsaXN0IG9mIG1hc3MgY29udHJvbHMgaXMgYXJpYS1sYWJlbGxlZGJ5IHRoZSBpdHMgbGFiZWwgc2libGluZywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9ncmF2aXR5LWZvcmNlLWxhYi9pc3N1ZXMvMTMyXHJcbiAgICBtYXNzQ29udHJvbHNOb2RlLmFkZEFyaWFMYWJlbGxlZGJ5QXNzb2NpYXRpb24oIHtcclxuICAgICAgb3RoZXJOb2RlOiBtYXNzQ29udHJvbHNOb2RlLFxyXG4gICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5MQUJFTF9TSUJMSU5HLFxyXG4gICAgICB0aGlzRWxlbWVudE5hbWU6IFBET01QZWVyLlBSSU1BUllfU0lCTElOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBsYWNlIG1hc3MgY29udHJvbHMgaW4gYW4gSEJveFxyXG4gICAgY29uc3QgbWFzc0NvbnRyb2xCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBtYXNzQ29udHJvbDEsIG1hc3NDb250cm9sMiBdLFxyXG4gICAgICBjZW50ZXI6IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlcixcclxuICAgICAgc3BhY2luZzogUEFORUxfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG4gICAgbWFzc0NvbnRyb2xzTm9kZS5hZGRDaGlsZCggbWFzc0NvbnRyb2xCb3ggKTtcclxuXHJcbiAgICBtb2RlbC5jb25zdGFudFJhZGl1c1Byb3BlcnR5LmxpbmsoIGNvbnN0YW50UmFkaXVzID0+IHtcclxuICAgICAgbWFzc0NvbnRyb2xzTm9kZS5kZXNjcmlwdGlvbkNvbnRlbnQgPSBjb25zdGFudFJhZGl1cyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFzc0NvbnRyb2xzSGVscFRleHREZW5zaXR5QmlsbGlvbnNTdHJpbmcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc3NDb250cm9sc0hlbHBUZXh0QmlsbGlvbnNTdHJpbmc7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvbiBmb3IgdGhlIG1hc3MgdmFsdWVzXHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIG5ldyBNYXNzU291bmRHZW5lcmF0b3IoXHJcbiAgICAgIG1vZGVsLm9iamVjdDEudmFsdWVQcm9wZXJ0eSxcclxuICAgICAgR0ZMQkNvbnN0YW50cy5NQVNTX1JBTkdFLFxyXG4gICAgICBtb2RlbC5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSxcclxuICAgICAgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNyB9XHJcbiAgICApICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIG5ldyBNYXNzU291bmRHZW5lcmF0b3IoXHJcbiAgICAgIG1vZGVsLm9iamVjdDIudmFsdWVQcm9wZXJ0eSxcclxuICAgICAgR0ZMQkNvbnN0YW50cy5NQVNTX1JBTkdFLFxyXG4gICAgICBtb2RlbC5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSxcclxuICAgICAgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNyB9XHJcbiAgICApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBzb3VuZCBnZW5lcmF0aW9uIGZvciB0aGUgZm9yY2Ugc291bmRcclxuICAgIHRoaXMuZm9yY2VTb3VuZEdlbmVyYXRvciA9IG5ldyBDb250aW51b3VzUHJvcGVydHlTb3VuZEdlbmVyYXRvcihcclxuICAgICAgbW9kZWwuZm9yY2VQcm9wZXJ0eSxcclxuICAgICAgc2F0dXJhdGVkU2luZUxvb3BUcmltbWVkX3dhdixcclxuICAgICAgbmV3IFJhbmdlKCBtb2RlbC5nZXRNaW5Gb3JjZSgpLCBtb2RlbC5nZXRNYXhGb3JjZSgpICksXHJcbiAgICAgIHtcclxuICAgICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuMixcclxuICAgICAgICBwbGF5YmFja1JhdGVDZW50ZXJPZmZzZXQ6IDAuMTIyLCAvLyB0aGlzIGlzIGFib3V0IDIgc2VtaXRvbmUsIGFuZCB3YXMgbmVjZXNzYXJ5IHRvIG1hdGNoIG9yaWdpbmFsIHNvdW5kIGRlc2lnblxyXG4gICAgICAgIHJlc2V0SW5Qcm9ncmVzc1Byb3BlcnR5OiBtb2RlbC5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSxcclxuICAgICAgICB0cmltU2lsZW5jZTogZmFsc2UgLy8gYSB2ZXJ5IHByZWNpc2Ugc291bmQgZmlsZSBpcyB1c2VkLCBzbyBtYWtlIHN1cmUgaXQgZG9lc24ndCBnZXQgY2hhbmdlZFxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCB0aGlzLmZvcmNlU291bmRHZW5lcmF0b3IgKTtcclxuXHJcbiAgICAvLyBzb3VuZCBnZW5lcmF0aW9uIGZvciBtYXNzZXMgcmVhY2hpbmcgdGhlIGlubmVyIG9yIG91dGVyIG1vdGlvbiBib3VuZGFyaWVzXHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIG5ldyBNYXNzQm91bmRhcnlTb3VuZEdlbmVyYXRvciggbW9kZWwub2JqZWN0MSwgbW9kZWwsICdsZWZ0Jywge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IEJPVU5EQVJZX1NPVU5EU19MRVZFTFxyXG4gICAgfSApICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIG5ldyBNYXNzQm91bmRhcnlTb3VuZEdlbmVyYXRvciggbW9kZWwub2JqZWN0MiwgbW9kZWwsICdyaWdodCcsIHtcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiBCT1VOREFSWV9TT1VORFNfTEVWRUxcclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IGNoZWNrYm94SXRlbXMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogZm9yY2VWYWx1ZXNTdHJpbmcsIHByb3BlcnR5OiBtb2RlbC5zaG93Rm9yY2VWYWx1ZXNQcm9wZXJ0eSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgLy9waGV0LWlvXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb3JjZVZhbHVlc0NoZWNrYm94JyApLFxyXG5cclxuICAgICAgICAgIGFjY2Vzc2libGVOYW1lOiBmb3JjZVZhbHVlc1N0cmluZyxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogZm9yY2VWYWx1ZXNDaGVja2JveEhlbHBUZXh0U3RyaW5nLFxyXG5cclxuICAgICAgICAgIC8vIHZvaWNpbmdcclxuICAgICAgICAgIHZvaWNpbmdOYW1lUmVzcG9uc2U6IGZvcmNlVmFsdWVzU3RyaW5nLFxyXG4gICAgICAgICAgdm9pY2luZ0hpbnRSZXNwb25zZTogZm9yY2VWYWx1ZXNIaW50UmVzcG9uc2VTdHJpbmcsXHJcbiAgICAgICAgICBjaGVja2VkQ29udGV4dFJlc3BvbnNlOiBmb3JjZVZhbHVlc1Nob3duUmVzcG9uc2VTdHJpbmcsXHJcbiAgICAgICAgICB1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IGZvcmNlVmFsdWVzSGlkZGVuUmVzcG9uc2VTdHJpbmdcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBsYWJlbDogZGlzdGFuY2VTdHJpbmcsIHByb3BlcnR5OiBtb2RlbC5zaG93RGlzdGFuY2VQcm9wZXJ0eSxcclxuICAgICAgICBvcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgLy8gcGhldC1pb1xyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlzdGFuY2VDaGVja2JveCcgKSxcclxuXHJcbiAgICAgICAgICBhY2Nlc3NpYmxlTmFtZTogZGlzdGFuY2VTdHJpbmcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IGRpc3RhbmNlQ2hlY2tib3hIZWxwVGV4dFN0cmluZyxcclxuXHJcbiAgICAgICAgICAvLyB2b2ljaW5nXHJcbiAgICAgICAgICB2b2ljaW5nTmFtZVJlc3BvbnNlOiBkaXN0YW5jZVN0cmluZyxcclxuICAgICAgICAgIHZvaWNpbmdIaW50UmVzcG9uc2U6IGRpc3RhbmNlSGludFJlc3BvbnNlU3RyaW5nLFxyXG4gICAgICAgICAgY2hlY2tlZENvbnRleHRSZXNwb25zZTogZGlzdGFuY2VTaG93blJlc3BvbnNlU3RyaW5nLFxyXG4gICAgICAgICAgdW5jaGVja2VkQ29udGV4dFJlc3BvbnNlOiBkaXN0YW5jZUhpZGRlblJlc3BvbnNlU3RyaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgbGFiZWw6IGNvbnN0YW50U2l6ZVN0cmluZywgcHJvcGVydHk6IG1vZGVsLmNvbnN0YW50UmFkaXVzUHJvcGVydHksXHJcbiAgICAgICAgb3B0aW9uczoge1xyXG5cclxuICAgICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnN0YW50U2l6ZUNoZWNrYm94JyApLFxyXG5cclxuICAgICAgICAgIGFjY2Vzc2libGVOYW1lOiBjb25zdGFudFNpemVTdHJpbmcsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IGNvbnN0YW50U2l6ZUNoZWNrYm94SGVscFRleHRTdHJpbmcsXHJcblxyXG4gICAgICAgICAgLy8gdm9pY2luZ1xyXG4gICAgICAgICAgdm9pY2luZ05hbWVSZXNwb25zZTogY29uc3RhbnRTaXplU3RyaW5nLFxyXG4gICAgICAgICAgdm9pY2luZ0hpbnRSZXNwb25zZTogY29uc3RhbnRTaXplSGludFJlc3BvbnNlU3RyaW5nLFxyXG4gICAgICAgICAgY2hlY2tlZENvbnRleHRSZXNwb25zZTogY29uc3RhbnRTaXplU2V0UmVzcG9uc2VTdHJpbmcsXHJcbiAgICAgICAgICB1bmNoZWNrZWRDb250ZXh0UmVzcG9uc2U6IGNvbnN0YW50U2l6ZU5vdFNldFJlc3BvbnNlU3RyaW5nXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgY29uc3QgcGFyYW1ldGVyQ29udHJvbFBhbmVsID0gbmV3IEdGTEJDaGVja2JveFBhbmVsKCBjaGVja2JveEl0ZW1zLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcmFtZXRlckNvbnRyb2xQYW5lbCcgKSxcclxuICAgICAgZmlsbDogJyNmMWYxZjInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYXJyb3cgdGhhdCBzaG93cyBkaXN0YW5jZSBiZXR3ZWVuIHRoZSB0d28gbWFzc2VzXHJcbiAgICBjb25zdCBkaXN0YW5jZUFycm93Tm9kZSA9IG5ldyBEaXN0YW5jZUFycm93Tm9kZSggbW9kZWwsIG1vZGVsVmlld1RyYW5zZm9ybSwgcG9zaXRpb25EZXNjcmliZXIsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlzdGFuY2VBcnJvd05vZGUnICksXHJcbiAgICAgIHk6IDE0NVxyXG4gICAgfSApO1xyXG4gICAgbW9kZWwuc2hvd0Rpc3RhbmNlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggZGlzdGFuY2VBcnJvd05vZGUsICd2aXNpYmxlJyApO1xyXG4gICAgbWFzc1Bvc2l0aW9uc05vZGUuYWRkQ2hpbGQoIGRpc3RhbmNlQXJyb3dOb2RlICk7XHJcblxyXG4gICAgLy8gUmVzZXQgQWxsIGJ1dHRvblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuXHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgICBtYXNzMU5vZGUucmVzZXQoKTtcclxuICAgICAgICBtYXNzMk5vZGUucmVzZXQoKTtcclxuICAgICAgICB0aGlzLmZvcmNlU291bmRHZW5lcmF0b3IucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSAxMCxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gMTAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2hpbGRyZW5cclxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZS5jaGlsZHJlbiA9IFtcclxuICAgICAgb2JqZWN0T25lTWFzc0Rlc2NyaXB0aW9uTm9kZSxcclxuICAgICAgb2JqZWN0VHdvTWFzc0Rlc2NyaXB0aW9uTm9kZSxcclxuICAgICAgbWFzc1Bvc2l0aW9uc05vZGUsXHJcbiAgICAgIG1hc3NDb250cm9sc05vZGVcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLmNoaWxkcmVuID0gW1xyXG4gICAgICBwYXJhbWV0ZXJDb250cm9sUGFuZWwsXHJcbiAgICAgIHJlc2V0QWxsQnV0dG9uXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIHZvaWNpbmcgLSB3aGVuIFJlYWRpbmdCbG9ja3MgZm9yIHRoZSBhcnJvd3MgYXJlIGVuYWJsZWQsIHRoZXkgc2hvdWxkIGNvbWUgYmVmb3JlIGV2ZXJ5dGhpbmcgZWxzZSwgd2hlcmUgdG9wXHJcbiAgICAvLyBtb3N0IGNvbXBvbmVudCB2ZXJ0aWNhbGx5IGNvbWVzIGZpcnN0XHJcbiAgICBtYXNzUG9zaXRpb25zTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIG1hc3MyTm9kZS5hcnJvd05vZGUsXHJcbiAgICAgIG1hc3MxTm9kZS5hcnJvd05vZGUsXHJcbiAgICAgIG1hc3MxTm9kZSxcclxuICAgICAgbWFzczJOb2RlXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIHZvaWNpbmcgLSBNYWtlIHN1cmUgdGhhdCB0aGUgVXR0ZXJhbmNlcyBmcm9tIEFsZXJ0ZXJzIG9ubHkgYW5ub3VuY2Ugd2hlbiB0aGUgY29udGVudCB1bmRlciB0aGlzIFNjcmVlblZpZXdcclxuICAgIC8vIGlzIHZpc2libGVcclxuICAgIFZvaWNpbmcucmVnaXN0ZXJVdHRlcmFuY2VUb05vZGUoIGFsZXJ0TWFuYWdlci5jb25zdGFudFNpemVDaGFuZ2VkQ29udGV4dFJlc3BvbnNlVXR0ZXJhbmNlLCB0aGlzICk7XHJcblxyXG4gICAgLy8gbGF5b3V0IHRoZSB2aWV3IGVsZW1lbnRzXHJcbiAgICBwYXJhbWV0ZXJDb250cm9sUGFuZWwucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAtIDE1O1xyXG4gICAgcGFyYW1ldGVyQ29udHJvbFBhbmVsLmJvdHRvbSA9IE1BU1NfQ09OVFJPTFNfWV9QT1NJVElPTjtcclxuXHJcbiAgICBtYXNzQ29udHJvbEJveC5yaWdodCA9IHBhcmFtZXRlckNvbnRyb2xQYW5lbC5sZWZ0IC0gUEFORUxfU1BBQ0lORztcclxuICAgIG1hc3NDb250cm9sQm94LnRvcCA9IHBhcmFtZXRlckNvbnRyb2xQYW5lbC50b3A7XHJcblxyXG4gICAgcmVzZXRBbGxCdXR0b24ucmlnaHQgPSBwYXJhbWV0ZXJDb250cm9sUGFuZWwucmlnaHQ7XHJcbiAgICByZXNldEFsbEJ1dHRvbi50b3AgPSBwYXJhbWV0ZXJDb250cm9sUGFuZWwuYm90dG9tICsgMTMuNTtcclxuXHJcbiAgICAvLyB2b2ljaW5nIC0gVXBkYXRlIHRoZSB2b2ljaW5nT2JqZWN0UmVzcG9uc2UgZm9yIGVhY2ggbWFzcyB3aGVuIGFueSBQcm9wZXJ0eSBjaGFuZ2VzIHRoYXQgd291bGQgdXBkYXRlIHRoZSBvYmplY3RcclxuICAgIC8vIHJlc3BvbnNlXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLm9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eSwgbW9kZWwub2JqZWN0Mi5wb3NpdGlvblByb3BlcnR5LCBtb2RlbC5zaG93RGlzdGFuY2VQcm9wZXJ0eSBdLCAoKSA9PiB7XHJcbiAgICAgIG1hc3MxTm9kZS52b2ljaW5nT2JqZWN0UmVzcG9uc2UgPSBwb3NpdGlvbkRlc2NyaWJlci5nZXREaXN0YW5jZUZyb21PdGhlck9iamVjdERlc2NyaXB0aW9uKCBtb2RlbC5vYmplY3QxLmVudW0gKTtcclxuICAgICAgbWFzczJOb2RlLnZvaWNpbmdPYmplY3RSZXNwb25zZSA9IHBvc2l0aW9uRGVzY3JpYmVyLmdldERpc3RhbmNlRnJvbU90aGVyT2JqZWN0RGVzY3JpcHRpb24oIG1vZGVsLm9iamVjdDIuZW51bSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBkZWJ1Z2dpbmdcclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaWYgKCBTSE9XX0RSQUdfQk9VTkRTICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgSVNMQ0RyYWdCb3VuZHNOb2RlKCBtb2RlbCwgdGhpcy5sYXlvdXRCb3VuZHMsIG1vZGVsVmlld1RyYW5zZm9ybSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBTSE9XX0dSSUQgKSB7XHJcbiAgICAgIGNvbnN0IGdyaWROb2RlID0gbmV3IElTTENHcmlkTm9kZShcclxuICAgICAgICBtb2RlbC5zbmFwT2JqZWN0c1RvTmVhcmVzdCxcclxuICAgICAgICB0aGlzLmxheW91dEJvdW5kcyxcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgeyBzdHJva2U6ICdyZ2JhKCAyNTAsIDEwMCwgMTAwLCAwLjYgKScgfVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBncmlkTm9kZSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyB2aWJyYXRpb24gcHJvdG90eXBlXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLnZpYnJhdGlvblBhcmFkaWdtICkge1xyXG5cclxuICAgICAgLy8gc2VuZHMgbWVzc2FnZXMgdG8gdGhlIGNvbnRhaW5pbmcgU3dpZnQgYXBwXHJcbiAgICAgIGNvbnN0IHZpYnJhdGlvbk1hbmFnZXIgPSBuZXcgVmlicmF0aW9uTWFuYWdlcmlPUygpO1xyXG5cclxuICAgICAgLy8gdGhlIHZpYnJhdGlvbiBjb250cm9sbGVyIGZvciB0aGlzIHNpbXVsYXRpb25cclxuICAgICAgdmlicmF0aW9uQ29udHJvbGxlci5pbml0aWFsaXplKCB2aWJyYXRpb25NYW5hZ2VyLCBtb2RlbCApO1xyXG5cclxuICAgICAgLy8gY29sbGVjdGlvbiBvZiBpbnB1dCBhbmQgc2ltdWxhdGlvbiBldmVudHMgdGhhdCB3aWxsIGJlIHJlY29yZGVkIGR1cmluZyB1c2VyIGludGVyYWN0aW9uXHJcbiAgICAgIHRoaXMuZXZlbnRSZWNvcmRlciA9IG5ldyBWaWJyYXRpb25UZXN0RXZlbnRSZWNvcmRlciggdmlicmF0aW9uTWFuYWdlciApO1xyXG5cclxuICAgICAgLy8gbGlzdGVuZXIgdGhhdCB3YXRjaGVzIGZpbmdlci90b3VjaCBpbnB1dCBhbmQgc2F2ZXMgdG8gdGhlIGV2ZW50IHJlY29yZGVyXHJcbiAgICAgIHRoaXMudmlicmF0aW9uVGVzdElucHV0TGlzdGVuZXIgPSBuZXcgVmlicmF0aW9uVGVzdElucHV0TGlzdGVuZXIoIHRoaXMuZXZlbnRSZWNvcmRlciApO1xyXG4gICAgICBwaGV0LmpvaXN0LmRpc3BsYXkuYWRkSW5wdXRMaXN0ZW5lciggdGhpcy52aWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gc2ltIHNwZWNpZmljIGV2ZW50cyB0aGF0IHdlIHdhbnQgdG8gcmVjb3JkXHJcbiAgICAgIG1vZGVsLm9iamVjdDEudmFsdWVQcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRSZWNvcmRlci5hZGRUZXN0RXZlbnQoIG5ldyBWaWJyYXRpb25UZXN0RXZlbnQoIHZhbHVlLCBudWxsLCB0aGlzLnZpYnJhdGlvblRlc3RJbnB1dExpc3RlbmVyLmVsYXBzZWRUaW1lLCAnTWFzcyAxIFZhbHVlJyApICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIG1vZGVsLm9iamVjdDIudmFsdWVQcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRSZWNvcmRlci5hZGRUZXN0RXZlbnQoIG5ldyBWaWJyYXRpb25UZXN0RXZlbnQoIHZhbHVlLCBudWxsLCB0aGlzLnZpYnJhdGlvblRlc3RJbnB1dExpc3RlbmVyLmVsYXBzZWRUaW1lLCAnTWFzcyAyIFZhbHVlJyApICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIG1vZGVsLm9iamVjdDEucG9zaXRpb25Qcm9wZXJ0eS5sYXp5TGluayggdmFsdWUgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRSZWNvcmRlci5hZGRUZXN0RXZlbnQoIG5ldyBWaWJyYXRpb25UZXN0RXZlbnQoIHZhbHVlLCBudWxsLCB0aGlzLnZpYnJhdGlvblRlc3RJbnB1dExpc3RlbmVyLmVsYXBzZWRUaW1lLCAnTW92aW5nIE1hc3MgMScgKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBtb2RlbC5vYmplY3QyLnBvc2l0aW9uUHJvcGVydHkubGF6eUxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgICB0aGlzLmV2ZW50UmVjb3JkZXIuYWRkVGVzdEV2ZW50KCBuZXcgVmlicmF0aW9uVGVzdEV2ZW50KCB2YWx1ZSwgbnVsbCwgdGhpcy52aWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lci5lbGFwc2VkVGltZSwgJ01vdmluZyBNYXNzIDInICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgbW9kZWwuY29uc3RhbnRSYWRpdXNQcm9wZXJ0eS5sYXp5TGluayggY29uc3RhbnRSYWRpdXMgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRSZWNvcmRlci5hZGRUZXN0RXZlbnQoIG5ldyBWaWJyYXRpb25UZXN0RXZlbnQoIGNvbnN0YW50UmFkaXVzLCBudWxsLCB0aGlzLnZpYnJhdGlvblRlc3RJbnB1dExpc3RlbmVyLmVsYXBzZWRUaW1lLCAnQ29uc3RhbnQgUmFkaXVzJyApICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIG1vZGVsLnNob3dEaXN0YW5jZVByb3BlcnR5LmxhenlMaW5rKCBzaG93RGlzdGFuY2UgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRSZWNvcmRlci5hZGRUZXN0RXZlbnQoIG5ldyBWaWJyYXRpb25UZXN0RXZlbnQoIHNob3dEaXN0YW5jZSwgbnVsbCwgdGhpcy52aWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lci5lbGFwc2VkVGltZSwgJ1Nob3cgRGlzdGFuY2UnICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgbW9kZWwuc2hvd0ZvcmNlVmFsdWVzUHJvcGVydHkubGF6eUxpbmsoIHNob3dGb3JjZVZhbHVlcyA9PiB7XHJcbiAgICAgICAgdGhpcy5ldmVudFJlY29yZGVyLmFkZFRlc3RFdmVudCggbmV3IFZpYnJhdGlvblRlc3RFdmVudCggc2hvd0ZvcmNlVmFsdWVzLCBudWxsLCB0aGlzLnZpYnJhdGlvblRlc3RJbnB1dExpc3RlbmVyLmVsYXBzZWRUaW1lLCAnU2hvdyBGb3JjZSBWYWx1ZXMnICkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgbW9kZWwucmVzZXRJblByb2dyZXNzUHJvcGVydHkubGF6eUxpbmsoIGluUHJvZ3Jlc3MgPT4ge1xyXG4gICAgICAgIHRoaXMuZXZlbnRSZWNvcmRlci5hZGRUZXN0RXZlbnQoIG5ldyBWaWJyYXRpb25UZXN0RXZlbnQoIG51bGwsIG51bGwsIHRoaXMudmlicmF0aW9uVGVzdElucHV0TGlzdGVuZXIuZWxhcHNlZFRpbWUsICdSZXNldCBBbGwnICkgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogc3RlcCB0aGUgdmlld1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdFxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIHRoaXMuZm9yY2VTb3VuZEdlbmVyYXRvci5zdGVwKCBkdCApO1xyXG5cclxuICAgIGlmICggdGhpcy52aWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lciApIHtcclxuICAgICAgdGhpcy52aWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lci5zZXRFbGFwc2VkVGltZSggdGhpcy52aWJyYXRpb25UZXN0SW5wdXRMaXN0ZW5lci5lbGFwc2VkVGltZSArIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgdG8gdXNlIGZvciB0aGUgXCJPdmVydmlld1wiIGJ1dHRvbiBvZiB0aGUgc2ltdWxhdGlvbiBUb29sYmFyIHdoZW5cclxuICAgKiB0aGlzIHNjcmVlbiBpcyBhY3RpdmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCgpIHtcclxuICAgIHJldHVybiB0aGlzLnZvaWNpbmdTdW1tYXJ5RGVzY3JpYmVyLmNyZWF0ZU92ZXJ2aWV3QWxlcnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHN0cmluZyB0byBzcGVhayB3aGVuIHRoZSBcIkRldGFpbHNcIiBidXR0b24gb2YgdGhlIHNpbXVsYXRpb24gVG9vbGJhclxyXG4gICAqIGlzIHByZXNzZWQgd2hlbiB0aGlzIHNjcmVlbiBpcyBhY3RpdmUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Vm9pY2luZ0RldGFpbHNDb250ZW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMudm9pY2luZ1N1bW1hcnlEZXNjcmliZXIuY3JlYXRlRGV0YWlsc0FsZXJ0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgdG8gc3BlYWsgd2hlIHRoZSBcIkhpbnRzXCIgYnV0dG9uIG9mIHRoZSBzaW11bGF0aW9uIFRvb2xiYXJcclxuICAgKiBpcyBwcmVzc2VkIHdoZW4gdGhpcyBzY3JlZW4gaXMgYWN0aXZlLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAqL1xyXG4gIGdldFZvaWNpbmdIaW50Q29udGVudCgpIHtcclxuICAgIHJldHVybiB0aGlzLnZvaWNpbmdTdW1tYXJ5RGVzY3JpYmVyLmNyZWF0ZUhpbnRBbGVydCgpO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUZvcmNlTGFiQmFzaWNzLnJlZ2lzdGVyKCAnR0ZMQlNjcmVlblZpZXcnLCBHRkxCU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBHRkxCU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxPQUFPLE1BQU0sNEJBQTRCO0FBQ2hELE9BQU9DLHNCQUFzQixNQUFNLHlEQUF5RDtBQUM1RixPQUFPQyxnQ0FBZ0MsTUFBTSx3RUFBd0U7QUFDckgsT0FBT0MsMEJBQTBCLE1BQU0sa0VBQWtFO0FBQ3pHLE9BQU9DLGtCQUFrQixNQUFNLDBEQUEw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