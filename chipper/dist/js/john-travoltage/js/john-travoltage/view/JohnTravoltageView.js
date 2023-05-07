// Copyright 2013-2022, University of Colorado Boulder

/**
 * Main ScreenView of simulation. Drawing starts here
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Vasily Shakhov (Mlearner)
 * @author Justin Obara
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import platform from '../../../../phet-core/js/platform.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import { Circle, Line, Node, Path, PDOMPeer } from '../../../../scenery/js/imports.js';
import PitchedPopGenerator from '../../../../tambo/js/sound-generators/PitchedPopGenerator.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import SoundLevelEnum from '../../../../tambo/js/SoundLevelEnum.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import VibrationManageriOS from '../../../../tappi/js/VibrationManageriOS.js';
import chargesInBody_mp3 from '../../../sounds/chargesInBody_mp3.js';
import electricDischarge_mp3 from '../../../sounds/electricDischarge_mp3.js';
import gazouch_mp3 from '../../../sounds/gazouch_mp3.js';
import ouch_mp3 from '../../../sounds/ouch_mp3.js';
import johnTravoltage from '../../johnTravoltage.js';
import JohnTravoltageStrings from '../../JohnTravoltageStrings.js';
import AppendageRangeMaps from '../AppendageRangeMaps.js';
import JohnTravoltageQueryParameters from '../JohnTravoltageQueryParameters.js';
import JohnTravoltageModel from '../model/JohnTravoltageModel.js';
import AppendageNode from './AppendageNode.js';
import ArmNode from './ArmNode.js';
import ArmPositionSoundGenerator from './ArmPositionSoundGenerator.js';
import BackgroundNode from './BackgroundNode.js';
import DebugUtils from './DebugUtils.js';
import ElectronLayerNode from './ElectronLayerNode.js';
import FootDragSoundGenerator from './FootDragSoundGenerator.js';
import LegNode from './LegNode.js';
import SparkNode from './SparkNode.js';
import vibrationController from './vibrationController.js';
const screenSummaryBodyDescriptionPatternString = JohnTravoltageStrings.a11y.screenSummary.bodyDescriptionPattern;
const electronsSingleDescriptionString = JohnTravoltageStrings.a11y.electrons.singleDescription;
const electronsMultipleDescriptionPatternString = JohnTravoltageStrings.a11y.electrons.multipleDescriptionPattern;
const descriptionWithChargePatternString = JohnTravoltageStrings.a11y.screenSummary.descriptionWithChargePattern;
const voicingContentHintString = JohnTravoltageStrings.a11y.voicing.contentHint;
const voicingDetailedContentHintString = JohnTravoltageStrings.a11y.voicing.detailedContentHint;
const previousDischargePatternString = JohnTravoltageStrings.a11y.voicing.previousDischargePattern;
const screenSummaryWithPreviousDischargePatternString = JohnTravoltageStrings.a11y.voicing.screenSummaryWithPreviousDischargePattern;
const screenSummarySingleScreenIntroPatternStringProperty = SceneryPhetStrings.a11y.voicing.simSection.screenSummary.singleScreenIntroPatternStringProperty;
const overviewPatternString = JohnTravoltageStrings.a11y.voicing.overviewPattern;
const voicingChargedContentHintString = JohnTravoltageStrings.a11y.voicing.chargedContentHint;
const multipleElectronsOnBodyPatternString = JohnTravoltageStrings.a11y.voicing.multipleElectronsOnBodyPattern;

// constants
const OUCH_EXCLAMATION_DELAY = 0.5; // in seconds
const CHARGES_SOUND_GAIN_FACTOR = 0.1; // multiplier for charges-in-the-body sound, empirically determined

class JohnTravoltageView extends ScreenView {
  /**
   * @param {JohnTravoltageModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    const summaryNode = new Node({
      tagName: 'p'
    });
    super({
      //The sim works best in most browsers using svg.
      //But in firefox on Win8 it is very slow and buggy, so use canvas on firefox.
      renderer: platform.firefox ? 'canvas' : null,
      layoutBounds: new Bounds2(0, 0, 768, 504),
      tandem: tandem,
      screenSummaryContent: summaryNode
    });

    // @private
    this.model = model;

    // @private
    // Prototype emitters and listeners to assist in prototyping haptics - We need to know when a user is touching the
    // sim for https://github.com/phetsims/phet-io-wrapper-haptics/issues/5, but these are not instrumented for
    // PhET-iO in scenery. These can be removed once they are instrumented and once prototyping is complete
    // in john-travoltage.
    this.touchStartEmitter = new Emitter({
      tandem: tandem.createTandem('touchStartEmitter')
    });
    this.touchEndEmitter = new Emitter({
      tandem: tandem.createTandem('touchEndEmitter')
    });
    this.touchMoveEmitter = new Emitter({
      tandem: tandem.createTandem('touchMoveEmitter')
    });
    window.addEventListener('touchstart', () => {
      this.touchStartEmitter.emit();
    });
    window.addEventListener('touchend', () => {
      this.touchEndEmitter.emit();
    });
    window.addEventListener('touchmove', () => {
      this.touchMoveEmitter.emit();
    });

    //add background elements
    this.addChild(new BackgroundNode(tandem.createTandem('backgroundNode')));

    //Split layers after background for performance
    this.addChild(new Node({
      layerSplit: true,
      pickable: false
    }));

    // @public
    this.legNode = new LegNode(model.leg, model.electronGroup, tandem.createTandem('legNode'));
    this.addChild(this.legNode);

    // @public
    this.armNode = new ArmNode(model.arm, tandem.createTandem('armNode'));
    this.addChild(this.armNode);

    // @private (a11y) after travolta picks up electrons the first time, this flag will modify descriptions slightly
    this.includeElectronInfo = false;

    // Show the dotted lines again when the sim is reset
    model.resetEmitter.addListener(() => {
      if (!model.leg.isDraggingProperty.get()) {
        model.leg.borderVisibleProperty.set(true);
      }
      if (!model.arm.isDraggingProperty.get()) {
        model.arm.borderVisibleProperty.set(true);
      }
      this.includeElectronInfo = false;
      this.legNode.resetDescriptionCounters();
    });

    // store the region when the discharge starts
    model.dischargeStartedEmitter.addListener(() => {
      const position = this.armNode.a11yAngleToPosition(model.arm.angleProperty.get());
      const newRegion = AppendageNode.getRegion(position, AppendageRangeMaps.armMap.regions);
      this.legNode.resetDescriptionCounters();
      this.armNode.regionAtDischarge = newRegion;
      this.armNode.positionAtDischarge = this.armNode.inputValue;
    });

    // spark
    const sparkNode = new SparkNode(model, listener => {
      model.stepEmitter.addListener(listener);
    }, tandem.createTandem('sparkNode'));
    this.addChild(sparkNode);

    // reset all button
    const resetAllButton = new ResetAllButton({
      radius: 23,
      right: this.layoutBounds.maxX - 8,
      bottom: this.layoutBounds.maxY - 8,
      listener: () => {
        model.reset();
      },
      tandem: tandem.createTandem('resetAllButton')
    });

    // pdom - the ResetAllButton is alone in a control panel in this sim
    this.addChild(resetAllButton);

    // @private - Use a layer for electrons so it has only one pickable flag, perhaps may improve performance compared
    // to iterating over all electrons to see if they are pickable? Split layers before particle layer for performance.
    this.electronLayer = new ElectronLayerNode(model, this.armNode, JohnTravoltageModel.MAX_ELECTRONS, tandem.createTandem('electronLayer'), {
      layerSplit: true,
      pickable: false
    });
    this.addChild(this.electronLayer);
    const updateDescription = () => {
      summaryNode.descriptionContent = this.createSceneDescription();
    };

    // electrons observable array exists for the lifetime of the sim, so there is no need to remove these listeners
    model.electronGroup.elementCreatedEmitter.addListener(() => {
      updateDescription();
      this.includeElectronInfo = true;
    });
    model.electronGroup.elementDisposedEmitter.addListener(() => {
      if (model.electronGroup.count === 0) {
        updateDescription();
      }
    });

    // properties exist for life of sim, no need to unlink
    this.armNode.model.angleProperty.link(updateDescription);
    this.legNode.model.angleProperty.link(updateDescription);

    // the play area is described by the screen view's description sibling through aria-describedby
    this.pdomPlayAreaNode.addAriaDescribedbyAssociation({
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: this,
      otherElementName: PDOMPeer.DESCRIPTION_SIBLING
    });

    // debug lines, body and forceline
    // borders are approximately 8px = radius of particle from physical body,
    // because physical radius of electron = 1 in box2D
    if (JohnTravoltageQueryParameters.showDebugInfo) {
      this.showBody();
      this.addChild(new Circle(10, {
        x: model.bodyVertices[0].x,
        y: model.bodyVertices[0].y,
        fill: 'blue'
      }));
      this.addChild(new Circle(10, {
        x: 0,
        y: 0,
        fill: 'blue'
      }));

      //Debugging for finger position
      const fingerCircle = new Circle(10, {
        fill: 'red'
      });
      model.arm.angleProperty.link(() => {
        fingerCircle.x = model.arm.getFingerPosition().x;
        fingerCircle.y = model.arm.getFingerPosition().y;
      });
      this.addChild(fingerCircle);

      // DebugUtils.debugLineSegments( this );
      DebugUtils.debugPositions(this);
    }

    // inverse of the resetInProgressProperty, used for muting sounds during reset
    const resetNotInProgressProperty = new DerivedProperty([model.resetInProgressProperty], resetInProgress => !resetInProgress);

    // create and register the sound generators used in this view
    const ouchSoundClip = new SoundClip(ouch_mp3, {
      initialOutputLevel: 0.7
    });
    soundManager.addSoundGenerator(ouchSoundClip);
    const gazouchSoundClip = new SoundClip(gazouch_mp3, {
      initialOutputLevel: 0.8
    });
    soundManager.addSoundGenerator(gazouchSoundClip);
    const electricDischargeSoundClip = new SoundClip(electricDischarge_mp3, {
      loop: true,
      trimSilence: true,
      initialOutputLevel: 0.75
    });
    soundManager.addSoundGenerator(electricDischargeSoundClip);
    const chargesInBodySoundClip = new SoundClip(chargesInBody_mp3, {
      loop: true,
      trimSilence: true,
      initialOutputLevel: 0.1
    });
    soundManager.addSoundGenerator(chargesInBodySoundClip);
    soundManager.addSoundGenerator(new ArmPositionSoundGenerator(model.arm.angleProperty, {
      enableControlProperties: [resetNotInProgressProperty],
      initialOutputLevel: 0.2
    }));
    this.footDragSoundGenerator = new FootDragSoundGenerator(model.leg.angleProperty, JohnTravoltageModel.FOOT_ON_CARPET_MIN_ANGLE, JohnTravoltageModel.FOOT_ON_CARPET_MAX_ANGLE, {
      enableControlProperties: [resetNotInProgressProperty],
      initialOutputLevel: 0.35
    });
    soundManager.addSoundGenerator(this.footDragSoundGenerator);
    const popSoundGenerator = new PitchedPopGenerator({
      enableControlProperties: [resetNotInProgressProperty],
      initialOutputLevel: 0.3
    });
    soundManager.addSoundGenerator(popSoundGenerator, {
      sonificationLevel: SoundLevelEnum.EXTRA
    });
    model.sparkVisibleProperty.link(sparkVisible => {
      if (sparkVisible) {
        // start the electric discharge sound
        electricDischargeSoundClip.play();

        // play the appropriate "ouch" sound based on the level of charge (plays nothing for low charge level)
        const numElectronsInBody = model.electronGroup.count;
        if (numElectronsInBody > 85) {
          gazouchSoundClip.play(OUCH_EXCLAMATION_DELAY);
        } else if (numElectronsInBody > 30) {
          ouchSoundClip.play(OUCH_EXCLAMATION_DELAY);
        }
      } else {
        // stop the electric discharge sound (if playing)
        electricDischargeSoundClip.stop();
      }
    });

    // update the sound related to the number of electrons in JT's body
    const lengthChangedListener = () => {
      const numElectrons = model.electronGroup.count;
      // update the sound that indicates the amount of charge in the body
      if (numElectrons === 0) {
        if (chargesInBodySoundClip.isPlaying) {
          chargesInBodySoundClip.stop();
        }
      } else {
        // set the gain based on the number of electrons, this equation was empirically determined
        chargesInBodySoundClip.setOutputLevel(0.01 + 0.99 * (numElectrons / JohnTravoltageModel.MAX_ELECTRONS) * CHARGES_SOUND_GAIN_FACTOR);

        // set the playback speed based on the number of electrons, equation empirically determined
        chargesInBodySoundClip.setPlaybackRate(1 + 0.25 * (numElectrons / JohnTravoltageModel.MAX_ELECTRONS));

        // start loop if necessary
        if (!chargesInBodySoundClip.isPlaying) {
          chargesInBodySoundClip.play();
        }
      }

      // play a pop each time the number of electrons changes
      popSoundGenerator.playPop(numElectrons / JohnTravoltageModel.MAX_ELECTRONS);
    };
    model.electronGroup.elementCreatedEmitter.addListener(lengthChangedListener);
    model.electronGroup.elementDisposedEmitter.addListener(lengthChangedListener);

    // TODO: This can be removed now that we are transitioning to #337
    this.vibratingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('vibratingProperty')
    });

    // pdomOrder
    this.pdomPlayAreaNode.pdomOrder = [this.legNode, this.armNode, sparkNode, this.electronLayer];
    this.pdomControlAreaNode.pdomOrder = [resetAllButton];

    // code related to vibration prototype work - hidden behind a query param while we understand more about what
    // we want for this feature.
    const vibrationParam = phet.chipper.queryParameters.vibrationParadigm;
    if (vibrationParam !== null) {
      // sends messages to the containing Swift app
      const vibrationManager = new VibrationManageriOS();

      // controls simulation specific vibrations and uses vibrationManager to send messages
      vibrationController.initialize(model, this, vibrationManager);
    }
  }

  /**
   * step the view forward in time
   * @param {number} dt
   * @public
   */
  step(dt) {
    this.footDragSoundGenerator.step(dt);
  }

  /**
   * Create the description of the simulation scene, describing John's hand and leg, and the number of charges
   * in his body.
   *
   * @private
   * @returns {string}
   */
  createSceneDescription() {
    let chargeDescription;
    let sceneDescription;

    // description for John - this will always be in the screen summary
    const positionDescription = AppendageNode.getPositionDescription(this.armNode.a11yAngleToPosition(this.model.arm.angleProperty.get()), AppendageRangeMaps.armMap.regions);
    const johnDescription = StringUtils.fillIn(screenSummaryBodyDescriptionPatternString, {
      position: positionDescription
    });

    // if there are any charges, a description of the charge will be prepended to the summary
    if (this.includeElectronInfo) {
      if (this.model.electronGroup.count === 1) {
        chargeDescription = electronsSingleDescriptionString;
      } else {
        chargeDescription = StringUtils.fillIn(electronsMultipleDescriptionPatternString, {
          value: this.model.electronGroup.count
        });
      }
      sceneDescription = StringUtils.fillIn(descriptionWithChargePatternString, {
        charge: chargeDescription,
        johnDescription: johnDescription
      });
    } else {
      sceneDescription = johnDescription;
    }
    return sceneDescription;
  }

  /**
   * Creates the voicing content for the "Overview" button from the Toolbar.
   * @public
   */
  getVoicingOverviewContent() {
    const overviewString = StringUtils.fillIn(screenSummarySingleScreenIntroPatternStringProperty, {
      sim: phet.joist.sim.simNameProperty.get()
    });
    return StringUtils.fillIn(overviewPatternString, {
      overview: overviewString
    });
  }

  /**
   * Similar to the PDOM scene description, but uses a qualitative description to describe the amount of
   * charge on the body.
   * @public
   * @override
   *
   * @returns {string}
   */
  getVoicingDetailsContent() {
    const model = this.model;
    const positionDescription = AppendageNode.getPositionDescription(this.armNode.a11yAngleToPosition(model.arm.angleProperty.get()), AppendageRangeMaps.armMap.regions);
    const johnDescription = StringUtils.fillIn(screenSummaryBodyDescriptionPatternString, {
      position: positionDescription
    });
    let screenDescription;
    if (this.includeElectronInfo) {
      const chargeDescription = StringUtils.fillIn(multipleElectronsOnBodyPatternString, {
        quantity: this.electronLayer.getQualitativeChargeDescription(model.electronGroup.count)
      });
      screenDescription = StringUtils.fillIn(descriptionWithChargePatternString, {
        charge: chargeDescription,
        johnDescription: johnDescription
      });
    } else {
      screenDescription = johnDescription;
    }

    // if there is a non-zero amount of electrons in the last discharge event describe this - this will be zero
    // until first discharge event and on reset
    if (model.numberOfElectronsDischarged > 0) {
      const previousDischargeQuantity = this.electronLayer.getQualitativeChargeDescription(model.numberOfElectronsDischarged);
      const previousHandPosition = AppendageNode.getPositionDescription(this.armNode.positionAtDischarge, AppendageRangeMaps.armMap.regions);
      const previousDischargeDescription = StringUtils.fillIn(previousDischargePatternString, {
        quantity: previousDischargeQuantity,
        position: previousHandPosition
      });
      screenDescription = StringUtils.fillIn(screenSummaryWithPreviousDischargePatternString, {
        screenSummary: screenDescription,
        previousDischarge: previousDischargeDescription
      });
    }
    return screenDescription;
  }

  /**
   * Creates the content to be spoken by speech synthesis from the "Hint" button on the toolbar.
   * @public
   *
   * @returns {string}
   */
  getVoicingHintContent() {
    const chargeCount = this.model.electronGroup.count;
    let hintString = voicingContentHintString;
    if (chargeCount > 0 && chargeCount < 10) {
      // a bit of charge, but maybe not enough to trigger a shock, guide user to more
      hintString = voicingDetailedContentHintString;
    } else if (chargeCount >= 10) {
      // lots of charge, guide user toward discharging electrons
      hintString = voicingChargedContentHintString;
    }
    return hintString;
  }

  /**
   * Only used for debugging.  Show debug information for the body and charges, and visual information
   * regarding how the model calculates charge positions.
   * @private
   */
  showBody() {
    //Show normals
    let lineSegment;
    for (let i = 0; i < this.model.lineSegments.length; i++) {
      lineSegment = this.model.lineSegments[i];
      const center = lineSegment.center;
      const normal = lineSegment.normal.times(50);
      this.addChild(new Line(center.x, center.y, center.x + normal.x, center.y + normal.y, {
        lineWidth: 2,
        stroke: 'blue'
      }));
    }
    let path = new Path(this.model.bodyShape, {
      stroke: 'orange',
      lineWidth: 2,
      pickable: false
    });
    this.addChild(path);

    // forcelines, which attract particles
    const lines = this.model.forceLines;
    let customShape;
    for (let i = 0; i < lines.length; i++) {
      customShape = new Shape();
      customShape.moveTo(lines[i].x1, lines[i].y1);
      customShape.lineTo(lines[i].x2, lines[i].y2);
      path = new Path(customShape, {
        stroke: 'red',
        lineWidth: 1,
        pickable: false,
        x: 0,
        y: 0
      });
      this.addChild(path);
    }
  }
}
johnTravoltage.register('JohnTravoltageView', JohnTravoltageView);
export default JohnTravoltageView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiQm91bmRzMiIsIlNjcmVlblZpZXciLCJTaGFwZSIsInBsYXRmb3JtIiwiU3RyaW5nVXRpbHMiLCJSZXNldEFsbEJ1dHRvbiIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkNpcmNsZSIsIkxpbmUiLCJOb2RlIiwiUGF0aCIsIlBET01QZWVyIiwiUGl0Y2hlZFBvcEdlbmVyYXRvciIsIlNvdW5kQ2xpcCIsIlNvdW5kTGV2ZWxFbnVtIiwic291bmRNYW5hZ2VyIiwiVmlicmF0aW9uTWFuYWdlcmlPUyIsImNoYXJnZXNJbkJvZHlfbXAzIiwiZWxlY3RyaWNEaXNjaGFyZ2VfbXAzIiwiZ2F6b3VjaF9tcDMiLCJvdWNoX21wMyIsImpvaG5UcmF2b2x0YWdlIiwiSm9oblRyYXZvbHRhZ2VTdHJpbmdzIiwiQXBwZW5kYWdlUmFuZ2VNYXBzIiwiSm9oblRyYXZvbHRhZ2VRdWVyeVBhcmFtZXRlcnMiLCJKb2huVHJhdm9sdGFnZU1vZGVsIiwiQXBwZW5kYWdlTm9kZSIsIkFybU5vZGUiLCJBcm1Qb3NpdGlvblNvdW5kR2VuZXJhdG9yIiwiQmFja2dyb3VuZE5vZGUiLCJEZWJ1Z1V0aWxzIiwiRWxlY3Ryb25MYXllck5vZGUiLCJGb290RHJhZ1NvdW5kR2VuZXJhdG9yIiwiTGVnTm9kZSIsIlNwYXJrTm9kZSIsInZpYnJhdGlvbkNvbnRyb2xsZXIiLCJzY3JlZW5TdW1tYXJ5Qm9keURlc2NyaXB0aW9uUGF0dGVyblN0cmluZyIsImExMXkiLCJzY3JlZW5TdW1tYXJ5IiwiYm9keURlc2NyaXB0aW9uUGF0dGVybiIsImVsZWN0cm9uc1NpbmdsZURlc2NyaXB0aW9uU3RyaW5nIiwiZWxlY3Ryb25zIiwic2luZ2xlRGVzY3JpcHRpb24iLCJlbGVjdHJvbnNNdWx0aXBsZURlc2NyaXB0aW9uUGF0dGVyblN0cmluZyIsIm11bHRpcGxlRGVzY3JpcHRpb25QYXR0ZXJuIiwiZGVzY3JpcHRpb25XaXRoQ2hhcmdlUGF0dGVyblN0cmluZyIsImRlc2NyaXB0aW9uV2l0aENoYXJnZVBhdHRlcm4iLCJ2b2ljaW5nQ29udGVudEhpbnRTdHJpbmciLCJ2b2ljaW5nIiwiY29udGVudEhpbnQiLCJ2b2ljaW5nRGV0YWlsZWRDb250ZW50SGludFN0cmluZyIsImRldGFpbGVkQ29udGVudEhpbnQiLCJwcmV2aW91c0Rpc2NoYXJnZVBhdHRlcm5TdHJpbmciLCJwcmV2aW91c0Rpc2NoYXJnZVBhdHRlcm4iLCJzY3JlZW5TdW1tYXJ5V2l0aFByZXZpb3VzRGlzY2hhcmdlUGF0dGVyblN0cmluZyIsInNjcmVlblN1bW1hcnlXaXRoUHJldmlvdXNEaXNjaGFyZ2VQYXR0ZXJuIiwic2NyZWVuU3VtbWFyeVNpbmdsZVNjcmVlbkludHJvUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwic2ltU2VjdGlvbiIsInNpbmdsZVNjcmVlbkludHJvUGF0dGVyblN0cmluZ1Byb3BlcnR5Iiwib3ZlcnZpZXdQYXR0ZXJuU3RyaW5nIiwib3ZlcnZpZXdQYXR0ZXJuIiwidm9pY2luZ0NoYXJnZWRDb250ZW50SGludFN0cmluZyIsImNoYXJnZWRDb250ZW50SGludCIsIm11bHRpcGxlRWxlY3Ryb25zT25Cb2R5UGF0dGVyblN0cmluZyIsIm11bHRpcGxlRWxlY3Ryb25zT25Cb2R5UGF0dGVybiIsIk9VQ0hfRVhDTEFNQVRJT05fREVMQVkiLCJDSEFSR0VTX1NPVU5EX0dBSU5fRkFDVE9SIiwiSm9oblRyYXZvbHRhZ2VWaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInN1bW1hcnlOb2RlIiwidGFnTmFtZSIsInJlbmRlcmVyIiwiZmlyZWZveCIsImxheW91dEJvdW5kcyIsInNjcmVlblN1bW1hcnlDb250ZW50IiwidG91Y2hTdGFydEVtaXR0ZXIiLCJjcmVhdGVUYW5kZW0iLCJ0b3VjaEVuZEVtaXR0ZXIiLCJ0b3VjaE1vdmVFbWl0dGVyIiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImVtaXQiLCJhZGRDaGlsZCIsImxheWVyU3BsaXQiLCJwaWNrYWJsZSIsImxlZ05vZGUiLCJsZWciLCJlbGVjdHJvbkdyb3VwIiwiYXJtTm9kZSIsImFybSIsImluY2x1ZGVFbGVjdHJvbkluZm8iLCJyZXNldEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImlzRHJhZ2dpbmdQcm9wZXJ0eSIsImdldCIsImJvcmRlclZpc2libGVQcm9wZXJ0eSIsInNldCIsInJlc2V0RGVzY3JpcHRpb25Db3VudGVycyIsImRpc2NoYXJnZVN0YXJ0ZWRFbWl0dGVyIiwicG9zaXRpb24iLCJhMTF5QW5nbGVUb1Bvc2l0aW9uIiwiYW5nbGVQcm9wZXJ0eSIsIm5ld1JlZ2lvbiIsImdldFJlZ2lvbiIsImFybU1hcCIsInJlZ2lvbnMiLCJyZWdpb25BdERpc2NoYXJnZSIsInBvc2l0aW9uQXREaXNjaGFyZ2UiLCJpbnB1dFZhbHVlIiwic3BhcmtOb2RlIiwibGlzdGVuZXIiLCJzdGVwRW1pdHRlciIsInJlc2V0QWxsQnV0dG9uIiwicmFkaXVzIiwicmlnaHQiLCJtYXhYIiwiYm90dG9tIiwibWF4WSIsInJlc2V0IiwiZWxlY3Ryb25MYXllciIsIk1BWF9FTEVDVFJPTlMiLCJ1cGRhdGVEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uQ29udGVudCIsImNyZWF0ZVNjZW5lRGVzY3JpcHRpb24iLCJlbGVtZW50Q3JlYXRlZEVtaXR0ZXIiLCJlbGVtZW50RGlzcG9zZWRFbWl0dGVyIiwiY291bnQiLCJsaW5rIiwicGRvbVBsYXlBcmVhTm9kZSIsImFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uIiwidGhpc0VsZW1lbnROYW1lIiwiUFJJTUFSWV9TSUJMSU5HIiwib3RoZXJOb2RlIiwib3RoZXJFbGVtZW50TmFtZSIsIkRFU0NSSVBUSU9OX1NJQkxJTkciLCJzaG93RGVidWdJbmZvIiwic2hvd0JvZHkiLCJ4IiwiYm9keVZlcnRpY2VzIiwieSIsImZpbGwiLCJmaW5nZXJDaXJjbGUiLCJnZXRGaW5nZXJQb3NpdGlvbiIsImRlYnVnUG9zaXRpb25zIiwicmVzZXROb3RJblByb2dyZXNzUHJvcGVydHkiLCJyZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSIsInJlc2V0SW5Qcm9ncmVzcyIsIm91Y2hTb3VuZENsaXAiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJhZGRTb3VuZEdlbmVyYXRvciIsImdhem91Y2hTb3VuZENsaXAiLCJlbGVjdHJpY0Rpc2NoYXJnZVNvdW5kQ2xpcCIsImxvb3AiLCJ0cmltU2lsZW5jZSIsImNoYXJnZXNJbkJvZHlTb3VuZENsaXAiLCJlbmFibGVDb250cm9sUHJvcGVydGllcyIsImZvb3REcmFnU291bmRHZW5lcmF0b3IiLCJGT09UX09OX0NBUlBFVF9NSU5fQU5HTEUiLCJGT09UX09OX0NBUlBFVF9NQVhfQU5HTEUiLCJwb3BTb3VuZEdlbmVyYXRvciIsInNvbmlmaWNhdGlvbkxldmVsIiwiRVhUUkEiLCJzcGFya1Zpc2libGVQcm9wZXJ0eSIsInNwYXJrVmlzaWJsZSIsInBsYXkiLCJudW1FbGVjdHJvbnNJbkJvZHkiLCJzdG9wIiwibGVuZ3RoQ2hhbmdlZExpc3RlbmVyIiwibnVtRWxlY3Ryb25zIiwiaXNQbGF5aW5nIiwic2V0T3V0cHV0TGV2ZWwiLCJzZXRQbGF5YmFja1JhdGUiLCJwbGF5UG9wIiwidmlicmF0aW5nUHJvcGVydHkiLCJwZG9tT3JkZXIiLCJwZG9tQ29udHJvbEFyZWFOb2RlIiwidmlicmF0aW9uUGFyYW0iLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsInZpYnJhdGlvblBhcmFkaWdtIiwidmlicmF0aW9uTWFuYWdlciIsImluaXRpYWxpemUiLCJzdGVwIiwiZHQiLCJjaGFyZ2VEZXNjcmlwdGlvbiIsInNjZW5lRGVzY3JpcHRpb24iLCJwb3NpdGlvbkRlc2NyaXB0aW9uIiwiZ2V0UG9zaXRpb25EZXNjcmlwdGlvbiIsImpvaG5EZXNjcmlwdGlvbiIsImZpbGxJbiIsInZhbHVlIiwiY2hhcmdlIiwiZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCIsIm92ZXJ2aWV3U3RyaW5nIiwic2ltIiwiam9pc3QiLCJzaW1OYW1lUHJvcGVydHkiLCJvdmVydmlldyIsImdldFZvaWNpbmdEZXRhaWxzQ29udGVudCIsInNjcmVlbkRlc2NyaXB0aW9uIiwicXVhbnRpdHkiLCJnZXRRdWFsaXRhdGl2ZUNoYXJnZURlc2NyaXB0aW9uIiwibnVtYmVyT2ZFbGVjdHJvbnNEaXNjaGFyZ2VkIiwicHJldmlvdXNEaXNjaGFyZ2VRdWFudGl0eSIsInByZXZpb3VzSGFuZFBvc2l0aW9uIiwicHJldmlvdXNEaXNjaGFyZ2VEZXNjcmlwdGlvbiIsInByZXZpb3VzRGlzY2hhcmdlIiwiZ2V0Vm9pY2luZ0hpbnRDb250ZW50IiwiY2hhcmdlQ291bnQiLCJoaW50U3RyaW5nIiwibGluZVNlZ21lbnQiLCJpIiwibGluZVNlZ21lbnRzIiwibGVuZ3RoIiwiY2VudGVyIiwibm9ybWFsIiwidGltZXMiLCJsaW5lV2lkdGgiLCJzdHJva2UiLCJwYXRoIiwiYm9keVNoYXBlIiwibGluZXMiLCJmb3JjZUxpbmVzIiwiY3VzdG9tU2hhcGUiLCJtb3ZlVG8iLCJ4MSIsInkxIiwibGluZVRvIiwieDIiLCJ5MiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiSm9oblRyYXZvbHRhZ2VWaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gU2NyZWVuVmlldyBvZiBzaW11bGF0aW9uLiBEcmF3aW5nIHN0YXJ0cyBoZXJlXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEp1c3RpbiBPYmFyYVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IFNjZW5lcnlQaGV0U3RyaW5ncyBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU2NlbmVyeVBoZXRTdHJpbmdzLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBMaW5lLCBOb2RlLCBQYXRoLCBQRE9NUGVlciB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaXRjaGVkUG9wR2VuZXJhdG9yIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kLWdlbmVyYXRvcnMvUGl0Y2hlZFBvcEdlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgU291bmRMZXZlbEVudW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvU291bmRMZXZlbEVudW0uanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBWaWJyYXRpb25NYW5hZ2VyaU9TIGZyb20gJy4uLy4uLy4uLy4uL3RhcHBpL2pzL1ZpYnJhdGlvbk1hbmFnZXJpT1MuanMnO1xyXG5cclxuaW1wb3J0IGNoYXJnZXNJbkJvZHlfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9jaGFyZ2VzSW5Cb2R5X21wMy5qcyc7XHJcbmltcG9ydCBlbGVjdHJpY0Rpc2NoYXJnZV9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL2VsZWN0cmljRGlzY2hhcmdlX21wMy5qcyc7XHJcbmltcG9ydCBnYXpvdWNoX21wMyBmcm9tICcuLi8uLi8uLi9zb3VuZHMvZ2F6b3VjaF9tcDMuanMnO1xyXG5pbXBvcnQgb3VjaF9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL291Y2hfbXAzLmpzJztcclxuaW1wb3J0IGpvaG5UcmF2b2x0YWdlIGZyb20gJy4uLy4uL2pvaG5UcmF2b2x0YWdlLmpzJztcclxuaW1wb3J0IEpvaG5UcmF2b2x0YWdlU3RyaW5ncyBmcm9tICcuLi8uLi9Kb2huVHJhdm9sdGFnZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQXBwZW5kYWdlUmFuZ2VNYXBzIGZyb20gJy4uL0FwcGVuZGFnZVJhbmdlTWFwcy5qcyc7XHJcbmltcG9ydCBKb2huVHJhdm9sdGFnZVF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9Kb2huVHJhdm9sdGFnZVF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBKb2huVHJhdm9sdGFnZU1vZGVsIGZyb20gJy4uL21vZGVsL0pvaG5UcmF2b2x0YWdlTW9kZWwuanMnO1xyXG5pbXBvcnQgQXBwZW5kYWdlTm9kZSBmcm9tICcuL0FwcGVuZGFnZU5vZGUuanMnO1xyXG5pbXBvcnQgQXJtTm9kZSBmcm9tICcuL0FybU5vZGUuanMnO1xyXG5pbXBvcnQgQXJtUG9zaXRpb25Tb3VuZEdlbmVyYXRvciBmcm9tICcuL0FybVBvc2l0aW9uU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgQmFja2dyb3VuZE5vZGUgZnJvbSAnLi9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCBEZWJ1Z1V0aWxzIGZyb20gJy4vRGVidWdVdGlscy5qcyc7XHJcbmltcG9ydCBFbGVjdHJvbkxheWVyTm9kZSBmcm9tICcuL0VsZWN0cm9uTGF5ZXJOb2RlLmpzJztcclxuaW1wb3J0IEZvb3REcmFnU291bmRHZW5lcmF0b3IgZnJvbSAnLi9Gb290RHJhZ1NvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IExlZ05vZGUgZnJvbSAnLi9MZWdOb2RlLmpzJztcclxuaW1wb3J0IFNwYXJrTm9kZSBmcm9tICcuL1NwYXJrTm9kZS5qcyc7XHJcbmltcG9ydCB2aWJyYXRpb25Db250cm9sbGVyIGZyb20gJy4vdmlicmF0aW9uQ29udHJvbGxlci5qcyc7XHJcblxyXG5jb25zdCBzY3JlZW5TdW1tYXJ5Qm9keURlc2NyaXB0aW9uUGF0dGVyblN0cmluZyA9IEpvaG5UcmF2b2x0YWdlU3RyaW5ncy5hMTF5LnNjcmVlblN1bW1hcnkuYm9keURlc2NyaXB0aW9uUGF0dGVybjtcclxuY29uc3QgZWxlY3Ryb25zU2luZ2xlRGVzY3JpcHRpb25TdHJpbmcgPSBKb2huVHJhdm9sdGFnZVN0cmluZ3MuYTExeS5lbGVjdHJvbnMuc2luZ2xlRGVzY3JpcHRpb247XHJcbmNvbnN0IGVsZWN0cm9uc011bHRpcGxlRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nID0gSm9oblRyYXZvbHRhZ2VTdHJpbmdzLmExMXkuZWxlY3Ryb25zLm11bHRpcGxlRGVzY3JpcHRpb25QYXR0ZXJuO1xyXG5jb25zdCBkZXNjcmlwdGlvbldpdGhDaGFyZ2VQYXR0ZXJuU3RyaW5nID0gSm9oblRyYXZvbHRhZ2VTdHJpbmdzLmExMXkuc2NyZWVuU3VtbWFyeS5kZXNjcmlwdGlvbldpdGhDaGFyZ2VQYXR0ZXJuO1xyXG5jb25zdCB2b2ljaW5nQ29udGVudEhpbnRTdHJpbmcgPSBKb2huVHJhdm9sdGFnZVN0cmluZ3MuYTExeS52b2ljaW5nLmNvbnRlbnRIaW50O1xyXG5jb25zdCB2b2ljaW5nRGV0YWlsZWRDb250ZW50SGludFN0cmluZyA9IEpvaG5UcmF2b2x0YWdlU3RyaW5ncy5hMTF5LnZvaWNpbmcuZGV0YWlsZWRDb250ZW50SGludDtcclxuY29uc3QgcHJldmlvdXNEaXNjaGFyZ2VQYXR0ZXJuU3RyaW5nID0gSm9oblRyYXZvbHRhZ2VTdHJpbmdzLmExMXkudm9pY2luZy5wcmV2aW91c0Rpc2NoYXJnZVBhdHRlcm47XHJcbmNvbnN0IHNjcmVlblN1bW1hcnlXaXRoUHJldmlvdXNEaXNjaGFyZ2VQYXR0ZXJuU3RyaW5nID0gSm9oblRyYXZvbHRhZ2VTdHJpbmdzLmExMXkudm9pY2luZy5zY3JlZW5TdW1tYXJ5V2l0aFByZXZpb3VzRGlzY2hhcmdlUGF0dGVybjtcclxuY29uc3Qgc2NyZWVuU3VtbWFyeVNpbmdsZVNjcmVlbkludHJvUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gU2NlbmVyeVBoZXRTdHJpbmdzLmExMXkudm9pY2luZy5zaW1TZWN0aW9uLnNjcmVlblN1bW1hcnkuc2luZ2xlU2NyZWVuSW50cm9QYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG92ZXJ2aWV3UGF0dGVyblN0cmluZyA9IEpvaG5UcmF2b2x0YWdlU3RyaW5ncy5hMTF5LnZvaWNpbmcub3ZlcnZpZXdQYXR0ZXJuO1xyXG5jb25zdCB2b2ljaW5nQ2hhcmdlZENvbnRlbnRIaW50U3RyaW5nID0gSm9oblRyYXZvbHRhZ2VTdHJpbmdzLmExMXkudm9pY2luZy5jaGFyZ2VkQ29udGVudEhpbnQ7XHJcbmNvbnN0IG11bHRpcGxlRWxlY3Ryb25zT25Cb2R5UGF0dGVyblN0cmluZyA9IEpvaG5UcmF2b2x0YWdlU3RyaW5ncy5hMTF5LnZvaWNpbmcubXVsdGlwbGVFbGVjdHJvbnNPbkJvZHlQYXR0ZXJuO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE9VQ0hfRVhDTEFNQVRJT05fREVMQVkgPSAwLjU7IC8vIGluIHNlY29uZHNcclxuY29uc3QgQ0hBUkdFU19TT1VORF9HQUlOX0ZBQ1RPUiA9IDAuMTsgLy8gbXVsdGlwbGllciBmb3IgY2hhcmdlcy1pbi10aGUtYm9keSBzb3VuZCwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuY2xhc3MgSm9oblRyYXZvbHRhZ2VWaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Sm9oblRyYXZvbHRhZ2VNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgc3VtbWFyeU5vZGUgPSBuZXcgTm9kZSggeyB0YWdOYW1lOiAncCcgfSApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcblxyXG4gICAgICAvL1RoZSBzaW0gd29ya3MgYmVzdCBpbiBtb3N0IGJyb3dzZXJzIHVzaW5nIHN2Zy5cclxuICAgICAgLy9CdXQgaW4gZmlyZWZveCBvbiBXaW44IGl0IGlzIHZlcnkgc2xvdyBhbmQgYnVnZ3ksIHNvIHVzZSBjYW52YXMgb24gZmlyZWZveC5cclxuICAgICAgcmVuZGVyZXI6IHBsYXRmb3JtLmZpcmVmb3ggPyAnY2FudmFzJyA6IG51bGwsXHJcbiAgICAgIGxheW91dEJvdW5kczogbmV3IEJvdW5kczIoIDAsIDAsIDc2OCwgNTA0ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG4gICAgICBzY3JlZW5TdW1tYXJ5Q29udGVudDogc3VtbWFyeU5vZGVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICAvLyBQcm90b3R5cGUgZW1pdHRlcnMgYW5kIGxpc3RlbmVycyB0byBhc3Npc3QgaW4gcHJvdG90eXBpbmcgaGFwdGljcyAtIFdlIG5lZWQgdG8ga25vdyB3aGVuIGEgdXNlciBpcyB0b3VjaGluZyB0aGVcclxuICAgIC8vIHNpbSBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8td3JhcHBlci1oYXB0aWNzL2lzc3Vlcy81LCBidXQgdGhlc2UgYXJlIG5vdCBpbnN0cnVtZW50ZWQgZm9yXHJcbiAgICAvLyBQaEVULWlPIGluIHNjZW5lcnkuIFRoZXNlIGNhbiBiZSByZW1vdmVkIG9uY2UgdGhleSBhcmUgaW5zdHJ1bWVudGVkIGFuZCBvbmNlIHByb3RvdHlwaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAvLyBpbiBqb2huLXRyYXZvbHRhZ2UuXHJcbiAgICB0aGlzLnRvdWNoU3RhcnRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG91Y2hTdGFydEVtaXR0ZXInIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMudG91Y2hFbmRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG91Y2hFbmRFbWl0dGVyJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3VjaE1vdmVFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG91Y2hNb3ZlRW1pdHRlcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsICgpID0+IHtcclxuICAgICAgdGhpcy50b3VjaFN0YXJ0RW1pdHRlci5lbWl0KCk7XHJcbiAgICB9ICk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgKCkgPT4ge1xyXG4gICAgICB0aGlzLnRvdWNoRW5kRW1pdHRlci5lbWl0KCk7XHJcbiAgICB9ICk7XHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsICgpID0+IHtcclxuICAgICAgdGhpcy50b3VjaE1vdmVFbWl0dGVyLmVtaXQoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvL2FkZCBiYWNrZ3JvdW5kIGVsZW1lbnRzXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgQmFja2dyb3VuZE5vZGUoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYWNrZ3JvdW5kTm9kZScgKSApICk7XHJcblxyXG4gICAgLy9TcGxpdCBsYXllcnMgYWZ0ZXIgYmFja2dyb3VuZCBmb3IgcGVyZm9ybWFuY2VcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7IGxheWVyU3BsaXQ6IHRydWUsIHBpY2thYmxlOiBmYWxzZSB9ICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljXHJcbiAgICB0aGlzLmxlZ05vZGUgPSBuZXcgTGVnTm9kZSggbW9kZWwubGVnLCBtb2RlbC5lbGVjdHJvbkdyb3VwLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVnTm9kZScgKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5sZWdOb2RlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5hcm1Ob2RlID0gbmV3IEFybU5vZGUoIG1vZGVsLmFybSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FybU5vZGUnICkgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYXJtTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIChhMTF5KSBhZnRlciB0cmF2b2x0YSBwaWNrcyB1cCBlbGVjdHJvbnMgdGhlIGZpcnN0IHRpbWUsIHRoaXMgZmxhZyB3aWxsIG1vZGlmeSBkZXNjcmlwdGlvbnMgc2xpZ2h0bHlcclxuICAgIHRoaXMuaW5jbHVkZUVsZWN0cm9uSW5mbyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIGRvdHRlZCBsaW5lcyBhZ2FpbiB3aGVuIHRoZSBzaW0gaXMgcmVzZXRcclxuICAgIG1vZGVsLnJlc2V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBpZiAoICFtb2RlbC5sZWcuaXNEcmFnZ2luZ1Byb3BlcnR5LmdldCgpICkge1xyXG4gICAgICAgIG1vZGVsLmxlZy5ib3JkZXJWaXNpYmxlUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCAhbW9kZWwuYXJtLmlzRHJhZ2dpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICBtb2RlbC5hcm0uYm9yZGVyVmlzaWJsZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmluY2x1ZGVFbGVjdHJvbkluZm8gPSBmYWxzZTtcclxuICAgICAgdGhpcy5sZWdOb2RlLnJlc2V0RGVzY3JpcHRpb25Db3VudGVycygpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHN0b3JlIHRoZSByZWdpb24gd2hlbiB0aGUgZGlzY2hhcmdlIHN0YXJ0c1xyXG4gICAgbW9kZWwuZGlzY2hhcmdlU3RhcnRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmFybU5vZGUuYTExeUFuZ2xlVG9Qb3NpdGlvbiggbW9kZWwuYXJtLmFuZ2xlUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgY29uc3QgbmV3UmVnaW9uID0gQXBwZW5kYWdlTm9kZS5nZXRSZWdpb24oIHBvc2l0aW9uLCBBcHBlbmRhZ2VSYW5nZU1hcHMuYXJtTWFwLnJlZ2lvbnMgKTtcclxuICAgICAgdGhpcy5sZWdOb2RlLnJlc2V0RGVzY3JpcHRpb25Db3VudGVycygpO1xyXG5cclxuICAgICAgdGhpcy5hcm1Ob2RlLnJlZ2lvbkF0RGlzY2hhcmdlID0gbmV3UmVnaW9uO1xyXG4gICAgICB0aGlzLmFybU5vZGUucG9zaXRpb25BdERpc2NoYXJnZSA9IHRoaXMuYXJtTm9kZS5pbnB1dFZhbHVlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNwYXJrXHJcbiAgICBjb25zdCBzcGFya05vZGUgPSBuZXcgU3BhcmtOb2RlKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgbGlzdGVuZXIgPT4geyBtb2RlbC5zdGVwRW1pdHRlci5hZGRMaXN0ZW5lciggbGlzdGVuZXIgKTsgfSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwYXJrTm9kZScgKVxyXG4gICAgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNwYXJrTm9kZSApO1xyXG5cclxuICAgIC8vIHJlc2V0IGFsbCBidXR0b25cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIHJhZGl1czogMjMsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gOCxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gOCxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBkb20gLSB0aGUgUmVzZXRBbGxCdXR0b24gaXMgYWxvbmUgaW4gYSBjb250cm9sIHBhbmVsIGluIHRoaXMgc2ltXHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gVXNlIGEgbGF5ZXIgZm9yIGVsZWN0cm9ucyBzbyBpdCBoYXMgb25seSBvbmUgcGlja2FibGUgZmxhZywgcGVyaGFwcyBtYXkgaW1wcm92ZSBwZXJmb3JtYW5jZSBjb21wYXJlZFxyXG4gICAgLy8gdG8gaXRlcmF0aW5nIG92ZXIgYWxsIGVsZWN0cm9ucyB0byBzZWUgaWYgdGhleSBhcmUgcGlja2FibGU/IFNwbGl0IGxheWVycyBiZWZvcmUgcGFydGljbGUgbGF5ZXIgZm9yIHBlcmZvcm1hbmNlLlxyXG4gICAgdGhpcy5lbGVjdHJvbkxheWVyID0gbmV3IEVsZWN0cm9uTGF5ZXJOb2RlKCBtb2RlbCwgdGhpcy5hcm1Ob2RlLCBKb2huVHJhdm9sdGFnZU1vZGVsLk1BWF9FTEVDVFJPTlMsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbkxheWVyJyApLCB7XHJcbiAgICAgIGxheWVyU3BsaXQ6IHRydWUsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5lbGVjdHJvbkxheWVyICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlRGVzY3JpcHRpb24gPSAoKSA9PiB7XHJcbiAgICAgIHN1bW1hcnlOb2RlLmRlc2NyaXB0aW9uQ29udGVudCA9IHRoaXMuY3JlYXRlU2NlbmVEZXNjcmlwdGlvbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBlbGVjdHJvbnMgb2JzZXJ2YWJsZSBhcnJheSBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLCBzbyB0aGVyZSBpcyBubyBuZWVkIHRvIHJlbW92ZSB0aGVzZSBsaXN0ZW5lcnNcclxuICAgIG1vZGVsLmVsZWN0cm9uR3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHVwZGF0ZURlc2NyaXB0aW9uKCk7XHJcbiAgICAgIHRoaXMuaW5jbHVkZUVsZWN0cm9uSW5mbyA9IHRydWU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwuZWxlY3Ryb25Hcm91cC5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGlmICggbW9kZWwuZWxlY3Ryb25Hcm91cC5jb3VudCA9PT0gMCApIHtcclxuICAgICAgICB1cGRhdGVEZXNjcmlwdGlvbigpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcHJvcGVydGllcyBleGlzdCBmb3IgbGlmZSBvZiBzaW0sIG5vIG5lZWQgdG8gdW5saW5rXHJcbiAgICB0aGlzLmFybU5vZGUubW9kZWwuYW5nbGVQcm9wZXJ0eS5saW5rKCB1cGRhdGVEZXNjcmlwdGlvbiApO1xyXG4gICAgdGhpcy5sZWdOb2RlLm1vZGVsLmFuZ2xlUHJvcGVydHkubGluayggdXBkYXRlRGVzY3JpcHRpb24gKTtcclxuXHJcbiAgICAvLyB0aGUgcGxheSBhcmVhIGlzIGRlc2NyaWJlZCBieSB0aGUgc2NyZWVuIHZpZXcncyBkZXNjcmlwdGlvbiBzaWJsaW5nIHRocm91Z2ggYXJpYS1kZXNjcmliZWRieVxyXG4gICAgdGhpcy5wZG9tUGxheUFyZWFOb2RlLmFkZEFyaWFEZXNjcmliZWRieUFzc29jaWF0aW9uKCB7XHJcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxyXG4gICAgICBvdGhlck5vZGU6IHRoaXMsXHJcbiAgICAgIG90aGVyRWxlbWVudE5hbWU6IFBET01QZWVyLkRFU0NSSVBUSU9OX1NJQkxJTkdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBkZWJ1ZyBsaW5lcywgYm9keSBhbmQgZm9yY2VsaW5lXHJcbiAgICAvLyBib3JkZXJzIGFyZSBhcHByb3hpbWF0ZWx5IDhweCA9IHJhZGl1cyBvZiBwYXJ0aWNsZSBmcm9tIHBoeXNpY2FsIGJvZHksXHJcbiAgICAvLyBiZWNhdXNlIHBoeXNpY2FsIHJhZGl1cyBvZiBlbGVjdHJvbiA9IDEgaW4gYm94MkRcclxuICAgIGlmICggSm9oblRyYXZvbHRhZ2VRdWVyeVBhcmFtZXRlcnMuc2hvd0RlYnVnSW5mbyApIHtcclxuICAgICAgdGhpcy5zaG93Qm9keSgpO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggMTAsIHtcclxuICAgICAgICB4OiBtb2RlbC5ib2R5VmVydGljZXNbIDAgXS54LFxyXG4gICAgICAgIHk6IG1vZGVsLmJvZHlWZXJ0aWNlc1sgMCBdLnksXHJcbiAgICAgICAgZmlsbDogJ2JsdWUnXHJcbiAgICAgIH0gKSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgQ2lyY2xlKCAxMCwgeyB4OiAwLCB5OiAwLCBmaWxsOiAnYmx1ZScgfSApICk7XHJcblxyXG4gICAgICAvL0RlYnVnZ2luZyBmb3IgZmluZ2VyIHBvc2l0aW9uXHJcbiAgICAgIGNvbnN0IGZpbmdlckNpcmNsZSA9IG5ldyBDaXJjbGUoIDEwLCB7IGZpbGw6ICdyZWQnIH0gKTtcclxuICAgICAgbW9kZWwuYXJtLmFuZ2xlUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICAgIGZpbmdlckNpcmNsZS54ID0gbW9kZWwuYXJtLmdldEZpbmdlclBvc2l0aW9uKCkueDtcclxuICAgICAgICBmaW5nZXJDaXJjbGUueSA9IG1vZGVsLmFybS5nZXRGaW5nZXJQb3NpdGlvbigpLnk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggZmluZ2VyQ2lyY2xlICk7XHJcblxyXG4gICAgICAvLyBEZWJ1Z1V0aWxzLmRlYnVnTGluZVNlZ21lbnRzKCB0aGlzICk7XHJcbiAgICAgIERlYnVnVXRpbHMuZGVidWdQb3NpdGlvbnMoIHRoaXMgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpbnZlcnNlIG9mIHRoZSByZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSwgdXNlZCBmb3IgbXV0aW5nIHNvdW5kcyBkdXJpbmcgcmVzZXRcclxuICAgIGNvbnN0IHJlc2V0Tm90SW5Qcm9ncmVzc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC5yZXNldEluUHJvZ3Jlc3NQcm9wZXJ0eSBdLCByZXNldEluUHJvZ3Jlc3MgPT4gIXJlc2V0SW5Qcm9ncmVzcyApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgcmVnaXN0ZXIgdGhlIHNvdW5kIGdlbmVyYXRvcnMgdXNlZCBpbiB0aGlzIHZpZXdcclxuICAgIGNvbnN0IG91Y2hTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBvdWNoX21wMywgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNyB9ICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIG91Y2hTb3VuZENsaXAgKTtcclxuICAgIGNvbnN0IGdhem91Y2hTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBnYXpvdWNoX21wMywgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuOCB9ICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGdhem91Y2hTb3VuZENsaXAgKTtcclxuICAgIGNvbnN0IGVsZWN0cmljRGlzY2hhcmdlU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggZWxlY3RyaWNEaXNjaGFyZ2VfbXAzLCB7XHJcbiAgICAgIGxvb3A6IHRydWUsXHJcbiAgICAgIHRyaW1TaWxlbmNlOiB0cnVlLFxyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDAuNzVcclxuICAgIH0gKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggZWxlY3RyaWNEaXNjaGFyZ2VTb3VuZENsaXAgKTtcclxuICAgIGNvbnN0IGNoYXJnZXNJbkJvZHlTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBjaGFyZ2VzSW5Cb2R5X21wMywge1xyXG4gICAgICBsb29wOiB0cnVlLFxyXG4gICAgICB0cmltU2lsZW5jZTogdHJ1ZSxcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjFcclxuICAgIH0gKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggY2hhcmdlc0luQm9keVNvdW5kQ2xpcCApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBuZXcgQXJtUG9zaXRpb25Tb3VuZEdlbmVyYXRvciggbW9kZWwuYXJtLmFuZ2xlUHJvcGVydHksIHtcclxuICAgICAgZW5hYmxlQ29udHJvbFByb3BlcnRpZXM6IFsgcmVzZXROb3RJblByb2dyZXNzUHJvcGVydHkgXSxcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjJcclxuICAgIH0gKSApO1xyXG4gICAgdGhpcy5mb290RHJhZ1NvdW5kR2VuZXJhdG9yID0gbmV3IEZvb3REcmFnU291bmRHZW5lcmF0b3IoXHJcbiAgICAgIG1vZGVsLmxlZy5hbmdsZVByb3BlcnR5LFxyXG4gICAgICBKb2huVHJhdm9sdGFnZU1vZGVsLkZPT1RfT05fQ0FSUEVUX01JTl9BTkdMRSxcclxuICAgICAgSm9oblRyYXZvbHRhZ2VNb2RlbC5GT09UX09OX0NBUlBFVF9NQVhfQU5HTEUsXHJcbiAgICAgIHtcclxuICAgICAgICBlbmFibGVDb250cm9sUHJvcGVydGllczogWyByZXNldE5vdEluUHJvZ3Jlc3NQcm9wZXJ0eSBdLFxyXG4gICAgICAgIGluaXRpYWxPdXRwdXRMZXZlbDogMC4zNVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCB0aGlzLmZvb3REcmFnU291bmRHZW5lcmF0b3IgKTtcclxuICAgIGNvbnN0IHBvcFNvdW5kR2VuZXJhdG9yID0gbmV3IFBpdGNoZWRQb3BHZW5lcmF0b3IoIHtcclxuICAgICAgZW5hYmxlQ29udHJvbFByb3BlcnRpZXM6IFsgcmVzZXROb3RJblByb2dyZXNzUHJvcGVydHkgXSxcclxuICAgICAgaW5pdGlhbE91dHB1dExldmVsOiAwLjNcclxuICAgIH0gKTtcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggcG9wU291bmRHZW5lcmF0b3IsIHsgc29uaWZpY2F0aW9uTGV2ZWw6IFNvdW5kTGV2ZWxFbnVtLkVYVFJBIH0gKTtcclxuXHJcbiAgICBtb2RlbC5zcGFya1Zpc2libGVQcm9wZXJ0eS5saW5rKCBzcGFya1Zpc2libGUgPT4ge1xyXG5cclxuICAgICAgaWYgKCBzcGFya1Zpc2libGUgKSB7XHJcblxyXG4gICAgICAgIC8vIHN0YXJ0IHRoZSBlbGVjdHJpYyBkaXNjaGFyZ2Ugc291bmRcclxuICAgICAgICBlbGVjdHJpY0Rpc2NoYXJnZVNvdW5kQ2xpcC5wbGF5KCk7XHJcblxyXG4gICAgICAgIC8vIHBsYXkgdGhlIGFwcHJvcHJpYXRlIFwib3VjaFwiIHNvdW5kIGJhc2VkIG9uIHRoZSBsZXZlbCBvZiBjaGFyZ2UgKHBsYXlzIG5vdGhpbmcgZm9yIGxvdyBjaGFyZ2UgbGV2ZWwpXHJcbiAgICAgICAgY29uc3QgbnVtRWxlY3Ryb25zSW5Cb2R5ID0gbW9kZWwuZWxlY3Ryb25Hcm91cC5jb3VudDtcclxuICAgICAgICBpZiAoIG51bUVsZWN0cm9uc0luQm9keSA+IDg1ICkge1xyXG4gICAgICAgICAgZ2F6b3VjaFNvdW5kQ2xpcC5wbGF5KCBPVUNIX0VYQ0xBTUFUSU9OX0RFTEFZICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBudW1FbGVjdHJvbnNJbkJvZHkgPiAzMCApIHtcclxuICAgICAgICAgIG91Y2hTb3VuZENsaXAucGxheSggT1VDSF9FWENMQU1BVElPTl9ERUxBWSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gc3RvcCB0aGUgZWxlY3RyaWMgZGlzY2hhcmdlIHNvdW5kIChpZiBwbGF5aW5nKVxyXG4gICAgICAgIGVsZWN0cmljRGlzY2hhcmdlU291bmRDbGlwLnN0b3AoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgc291bmQgcmVsYXRlZCB0byB0aGUgbnVtYmVyIG9mIGVsZWN0cm9ucyBpbiBKVCdzIGJvZHlcclxuICAgIGNvbnN0IGxlbmd0aENoYW5nZWRMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgY29uc3QgbnVtRWxlY3Ryb25zID0gbW9kZWwuZWxlY3Ryb25Hcm91cC5jb3VudDtcclxuICAgICAgLy8gdXBkYXRlIHRoZSBzb3VuZCB0aGF0IGluZGljYXRlcyB0aGUgYW1vdW50IG9mIGNoYXJnZSBpbiB0aGUgYm9keVxyXG4gICAgICBpZiAoIG51bUVsZWN0cm9ucyA9PT0gMCApIHtcclxuICAgICAgICBpZiAoIGNoYXJnZXNJbkJvZHlTb3VuZENsaXAuaXNQbGF5aW5nICkge1xyXG4gICAgICAgICAgY2hhcmdlc0luQm9keVNvdW5kQ2xpcC5zdG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBzZXQgdGhlIGdhaW4gYmFzZWQgb24gdGhlIG51bWJlciBvZiBlbGVjdHJvbnMsIHRoaXMgZXF1YXRpb24gd2FzIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICBjaGFyZ2VzSW5Cb2R5U291bmRDbGlwLnNldE91dHB1dExldmVsKFxyXG4gICAgICAgICAgMC4wMSArIDAuOTkgKiAoIG51bUVsZWN0cm9ucyAvIEpvaG5UcmF2b2x0YWdlTW9kZWwuTUFYX0VMRUNUUk9OUyApICogQ0hBUkdFU19TT1VORF9HQUlOX0ZBQ1RPUlxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIC8vIHNldCB0aGUgcGxheWJhY2sgc3BlZWQgYmFzZWQgb24gdGhlIG51bWJlciBvZiBlbGVjdHJvbnMsIGVxdWF0aW9uIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICBjaGFyZ2VzSW5Cb2R5U291bmRDbGlwLnNldFBsYXliYWNrUmF0ZSggMSArIDAuMjUgKiAoIG51bUVsZWN0cm9ucyAvIEpvaG5UcmF2b2x0YWdlTW9kZWwuTUFYX0VMRUNUUk9OUyApICk7XHJcblxyXG4gICAgICAgIC8vIHN0YXJ0IGxvb3AgaWYgbmVjZXNzYXJ5XHJcbiAgICAgICAgaWYgKCAhY2hhcmdlc0luQm9keVNvdW5kQ2xpcC5pc1BsYXlpbmcgKSB7XHJcbiAgICAgICAgICBjaGFyZ2VzSW5Cb2R5U291bmRDbGlwLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHBsYXkgYSBwb3AgZWFjaCB0aW1lIHRoZSBudW1iZXIgb2YgZWxlY3Ryb25zIGNoYW5nZXNcclxuICAgICAgcG9wU291bmRHZW5lcmF0b3IucGxheVBvcCggbnVtRWxlY3Ryb25zIC8gSm9oblRyYXZvbHRhZ2VNb2RlbC5NQVhfRUxFQ1RST05TICk7XHJcbiAgICB9O1xyXG5cclxuICAgIG1vZGVsLmVsZWN0cm9uR3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBsZW5ndGhDaGFuZ2VkTGlzdGVuZXIgKTtcclxuICAgIG1vZGVsLmVsZWN0cm9uR3JvdXAuZWxlbWVudERpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggbGVuZ3RoQ2hhbmdlZExpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gVE9ETzogVGhpcyBjYW4gYmUgcmVtb3ZlZCBub3cgdGhhdCB3ZSBhcmUgdHJhbnNpdGlvbmluZyB0byAjMzM3XHJcbiAgICB0aGlzLnZpYnJhdGluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlicmF0aW5nUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tT3JkZXJcclxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHRoaXMubGVnTm9kZSxcclxuICAgICAgdGhpcy5hcm1Ob2RlLFxyXG4gICAgICBzcGFya05vZGUsXHJcbiAgICAgIHRoaXMuZWxlY3Ryb25MYXllclxyXG4gICAgXTtcclxuICAgIHRoaXMucGRvbUNvbnRyb2xBcmVhTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHJlc2V0QWxsQnV0dG9uXHJcbiAgICBdO1xyXG5cclxuICAgIC8vIGNvZGUgcmVsYXRlZCB0byB2aWJyYXRpb24gcHJvdG90eXBlIHdvcmsgLSBoaWRkZW4gYmVoaW5kIGEgcXVlcnkgcGFyYW0gd2hpbGUgd2UgdW5kZXJzdGFuZCBtb3JlIGFib3V0IHdoYXRcclxuICAgIC8vIHdlIHdhbnQgZm9yIHRoaXMgZmVhdHVyZS5cclxuICAgIGNvbnN0IHZpYnJhdGlvblBhcmFtID0gcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy52aWJyYXRpb25QYXJhZGlnbTtcclxuICAgIGlmICggdmlicmF0aW9uUGFyYW0gIT09IG51bGwgKSB7XHJcblxyXG4gICAgICAvLyBzZW5kcyBtZXNzYWdlcyB0byB0aGUgY29udGFpbmluZyBTd2lmdCBhcHBcclxuICAgICAgY29uc3QgdmlicmF0aW9uTWFuYWdlciA9IG5ldyBWaWJyYXRpb25NYW5hZ2VyaU9TKCk7XHJcblxyXG4gICAgICAvLyBjb250cm9scyBzaW11bGF0aW9uIHNwZWNpZmljIHZpYnJhdGlvbnMgYW5kIHVzZXMgdmlicmF0aW9uTWFuYWdlciB0byBzZW5kIG1lc3NhZ2VzXHJcbiAgICAgIHZpYnJhdGlvbkNvbnRyb2xsZXIuaW5pdGlhbGl6ZSggbW9kZWwsIHRoaXMsIHZpYnJhdGlvbk1hbmFnZXIgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgdGhlIHZpZXcgZm9yd2FyZCBpbiB0aW1lXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5mb290RHJhZ1NvdW5kR2VuZXJhdG9yLnN0ZXAoIGR0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBzaW11bGF0aW9uIHNjZW5lLCBkZXNjcmliaW5nIEpvaG4ncyBoYW5kIGFuZCBsZWcsIGFuZCB0aGUgbnVtYmVyIG9mIGNoYXJnZXNcclxuICAgKiBpbiBoaXMgYm9keS5cclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBjcmVhdGVTY2VuZURlc2NyaXB0aW9uKCkge1xyXG4gICAgbGV0IGNoYXJnZURlc2NyaXB0aW9uO1xyXG4gICAgbGV0IHNjZW5lRGVzY3JpcHRpb247XHJcblxyXG4gICAgLy8gZGVzY3JpcHRpb24gZm9yIEpvaG4gLSB0aGlzIHdpbGwgYWx3YXlzIGJlIGluIHRoZSBzY3JlZW4gc3VtbWFyeVxyXG4gICAgY29uc3QgcG9zaXRpb25EZXNjcmlwdGlvbiA9IEFwcGVuZGFnZU5vZGUuZ2V0UG9zaXRpb25EZXNjcmlwdGlvbiggdGhpcy5hcm1Ob2RlLmExMXlBbmdsZVRvUG9zaXRpb24oIHRoaXMubW9kZWwuYXJtLmFuZ2xlUHJvcGVydHkuZ2V0KCkgKSwgQXBwZW5kYWdlUmFuZ2VNYXBzLmFybU1hcC5yZWdpb25zICk7XHJcbiAgICBjb25zdCBqb2huRGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNjcmVlblN1bW1hcnlCb2R5RGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nLCB7IHBvc2l0aW9uOiBwb3NpdGlvbkRlc2NyaXB0aW9uIH0gKTtcclxuXHJcbiAgICAvLyBpZiB0aGVyZSBhcmUgYW55IGNoYXJnZXMsIGEgZGVzY3JpcHRpb24gb2YgdGhlIGNoYXJnZSB3aWxsIGJlIHByZXBlbmRlZCB0byB0aGUgc3VtbWFyeVxyXG4gICAgaWYgKCB0aGlzLmluY2x1ZGVFbGVjdHJvbkluZm8gKSB7XHJcbiAgICAgIGlmICggdGhpcy5tb2RlbC5lbGVjdHJvbkdyb3VwLmNvdW50ID09PSAxICkge1xyXG4gICAgICAgIGNoYXJnZURlc2NyaXB0aW9uID0gZWxlY3Ryb25zU2luZ2xlRGVzY3JpcHRpb25TdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgY2hhcmdlRGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGVsZWN0cm9uc011bHRpcGxlRGVzY3JpcHRpb25QYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgICB2YWx1ZTogdGhpcy5tb2RlbC5lbGVjdHJvbkdyb3VwLmNvdW50XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzY2VuZURlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBkZXNjcmlwdGlvbldpdGhDaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgY2hhcmdlOiBjaGFyZ2VEZXNjcmlwdGlvbixcclxuICAgICAgICBqb2huRGVzY3JpcHRpb246IGpvaG5EZXNjcmlwdGlvblxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgc2NlbmVEZXNjcmlwdGlvbiA9IGpvaG5EZXNjcmlwdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2NlbmVEZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIHZvaWNpbmcgY29udGVudCBmb3IgdGhlIFwiT3ZlcnZpZXdcIiBidXR0b24gZnJvbSB0aGUgVG9vbGJhci5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Vm9pY2luZ092ZXJ2aWV3Q29udGVudCgpIHtcclxuICAgIGNvbnN0IG92ZXJ2aWV3U3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBzY3JlZW5TdW1tYXJ5U2luZ2xlU2NyZWVuSW50cm9QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgc2ltOiBwaGV0LmpvaXN0LnNpbS5zaW1OYW1lUHJvcGVydHkuZ2V0KClcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gU3RyaW5nVXRpbHMuZmlsbEluKCBvdmVydmlld1BhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgb3ZlcnZpZXc6IG92ZXJ2aWV3U3RyaW5nXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTaW1pbGFyIHRvIHRoZSBQRE9NIHNjZW5lIGRlc2NyaXB0aW9uLCBidXQgdXNlcyBhIHF1YWxpdGF0aXZlIGRlc2NyaXB0aW9uIHRvIGRlc2NyaWJlIHRoZSBhbW91bnQgb2ZcclxuICAgKiBjaGFyZ2Ugb24gdGhlIGJvZHkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqXHJcbiAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgKi9cclxuICBnZXRWb2ljaW5nRGV0YWlsc0NvbnRlbnQoKSB7XHJcblxyXG4gICAgY29uc3QgbW9kZWwgPSB0aGlzLm1vZGVsO1xyXG5cclxuICAgIGNvbnN0IHBvc2l0aW9uRGVzY3JpcHRpb24gPSBBcHBlbmRhZ2VOb2RlLmdldFBvc2l0aW9uRGVzY3JpcHRpb24oIHRoaXMuYXJtTm9kZS5hMTF5QW5nbGVUb1Bvc2l0aW9uKCBtb2RlbC5hcm0uYW5nbGVQcm9wZXJ0eS5nZXQoKSApLCBBcHBlbmRhZ2VSYW5nZU1hcHMuYXJtTWFwLnJlZ2lvbnMgKTtcclxuICAgIGNvbnN0IGpvaG5EZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggc2NyZWVuU3VtbWFyeUJvZHlEZXNjcmlwdGlvblBhdHRlcm5TdHJpbmcsIHsgcG9zaXRpb246IHBvc2l0aW9uRGVzY3JpcHRpb24gfSApO1xyXG5cclxuICAgIGxldCBzY3JlZW5EZXNjcmlwdGlvbjtcclxuICAgIGlmICggdGhpcy5pbmNsdWRlRWxlY3Ryb25JbmZvICkge1xyXG4gICAgICBjb25zdCBjaGFyZ2VEZXNjcmlwdGlvbiA9IFN0cmluZ1V0aWxzLmZpbGxJbiggbXVsdGlwbGVFbGVjdHJvbnNPbkJvZHlQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgcXVhbnRpdHk6IHRoaXMuZWxlY3Ryb25MYXllci5nZXRRdWFsaXRhdGl2ZUNoYXJnZURlc2NyaXB0aW9uKCBtb2RlbC5lbGVjdHJvbkdyb3VwLmNvdW50IClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2NyZWVuRGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIGRlc2NyaXB0aW9uV2l0aENoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBjaGFyZ2U6IGNoYXJnZURlc2NyaXB0aW9uLFxyXG4gICAgICAgIGpvaG5EZXNjcmlwdGlvbjogam9obkRlc2NyaXB0aW9uXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBzY3JlZW5EZXNjcmlwdGlvbiA9IGpvaG5EZXNjcmlwdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGVyZSBpcyBhIG5vbi16ZXJvIGFtb3VudCBvZiBlbGVjdHJvbnMgaW4gdGhlIGxhc3QgZGlzY2hhcmdlIGV2ZW50IGRlc2NyaWJlIHRoaXMgLSB0aGlzIHdpbGwgYmUgemVyb1xyXG4gICAgLy8gdW50aWwgZmlyc3QgZGlzY2hhcmdlIGV2ZW50IGFuZCBvbiByZXNldFxyXG4gICAgaWYgKCBtb2RlbC5udW1iZXJPZkVsZWN0cm9uc0Rpc2NoYXJnZWQgPiAwICkge1xyXG4gICAgICBjb25zdCBwcmV2aW91c0Rpc2NoYXJnZVF1YW50aXR5ID0gdGhpcy5lbGVjdHJvbkxheWVyLmdldFF1YWxpdGF0aXZlQ2hhcmdlRGVzY3JpcHRpb24oIG1vZGVsLm51bWJlck9mRWxlY3Ryb25zRGlzY2hhcmdlZCApO1xyXG4gICAgICBjb25zdCBwcmV2aW91c0hhbmRQb3NpdGlvbiA9IEFwcGVuZGFnZU5vZGUuZ2V0UG9zaXRpb25EZXNjcmlwdGlvbiggdGhpcy5hcm1Ob2RlLnBvc2l0aW9uQXREaXNjaGFyZ2UsIEFwcGVuZGFnZVJhbmdlTWFwcy5hcm1NYXAucmVnaW9ucyApO1xyXG4gICAgICBjb25zdCBwcmV2aW91c0Rpc2NoYXJnZURlc2NyaXB0aW9uID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwcmV2aW91c0Rpc2NoYXJnZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICBxdWFudGl0eTogcHJldmlvdXNEaXNjaGFyZ2VRdWFudGl0eSxcclxuICAgICAgICBwb3NpdGlvbjogcHJldmlvdXNIYW5kUG9zaXRpb25cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2NyZWVuRGVzY3JpcHRpb24gPSBTdHJpbmdVdGlscy5maWxsSW4oIHNjcmVlblN1bW1hcnlXaXRoUHJldmlvdXNEaXNjaGFyZ2VQYXR0ZXJuU3RyaW5nLCB7XHJcbiAgICAgICAgc2NyZWVuU3VtbWFyeTogc2NyZWVuRGVzY3JpcHRpb24sXHJcbiAgICAgICAgcHJldmlvdXNEaXNjaGFyZ2U6IHByZXZpb3VzRGlzY2hhcmdlRGVzY3JpcHRpb25cclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzY3JlZW5EZXNjcmlwdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIGNvbnRlbnQgdG8gYmUgc3Bva2VuIGJ5IHNwZWVjaCBzeW50aGVzaXMgZnJvbSB0aGUgXCJIaW50XCIgYnV0dG9uIG9uIHRoZSB0b29sYmFyLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICovXHJcbiAgZ2V0Vm9pY2luZ0hpbnRDb250ZW50KCkge1xyXG5cclxuICAgIGNvbnN0IGNoYXJnZUNvdW50ID0gdGhpcy5tb2RlbC5lbGVjdHJvbkdyb3VwLmNvdW50O1xyXG4gICAgbGV0IGhpbnRTdHJpbmcgPSB2b2ljaW5nQ29udGVudEhpbnRTdHJpbmc7XHJcblxyXG4gICAgaWYgKCBjaGFyZ2VDb3VudCA+IDAgJiYgY2hhcmdlQ291bnQgPCAxMCApIHtcclxuXHJcbiAgICAgIC8vIGEgYml0IG9mIGNoYXJnZSwgYnV0IG1heWJlIG5vdCBlbm91Z2ggdG8gdHJpZ2dlciBhIHNob2NrLCBndWlkZSB1c2VyIHRvIG1vcmVcclxuICAgICAgaGludFN0cmluZyA9IHZvaWNpbmdEZXRhaWxlZENvbnRlbnRIaW50U3RyaW5nO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGNoYXJnZUNvdW50ID49IDEwICkge1xyXG5cclxuICAgICAgLy8gbG90cyBvZiBjaGFyZ2UsIGd1aWRlIHVzZXIgdG93YXJkIGRpc2NoYXJnaW5nIGVsZWN0cm9uc1xyXG4gICAgICBoaW50U3RyaW5nID0gdm9pY2luZ0NoYXJnZWRDb250ZW50SGludFN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaGludFN0cmluZztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ubHkgdXNlZCBmb3IgZGVidWdnaW5nLiAgU2hvdyBkZWJ1ZyBpbmZvcm1hdGlvbiBmb3IgdGhlIGJvZHkgYW5kIGNoYXJnZXMsIGFuZCB2aXN1YWwgaW5mb3JtYXRpb25cclxuICAgKiByZWdhcmRpbmcgaG93IHRoZSBtb2RlbCBjYWxjdWxhdGVzIGNoYXJnZSBwb3NpdGlvbnMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBzaG93Qm9keSgpIHtcclxuXHJcbiAgICAvL1Nob3cgbm9ybWFsc1xyXG4gICAgbGV0IGxpbmVTZWdtZW50O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5tb2RlbC5saW5lU2VnbWVudHMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGxpbmVTZWdtZW50ID0gdGhpcy5tb2RlbC5saW5lU2VnbWVudHNbIGkgXTtcclxuICAgICAgY29uc3QgY2VudGVyID0gbGluZVNlZ21lbnQuY2VudGVyO1xyXG4gICAgICBjb25zdCBub3JtYWwgPSBsaW5lU2VnbWVudC5ub3JtYWwudGltZXMoIDUwICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBMaW5lKCBjZW50ZXIueCwgY2VudGVyLnksIGNlbnRlci54ICsgbm9ybWFsLngsIGNlbnRlci55ICsgbm9ybWFsLnksIHtcclxuICAgICAgICBsaW5lV2lkdGg6IDIsXHJcbiAgICAgICAgc3Ryb2tlOiAnYmx1ZSdcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBhdGggPSBuZXcgUGF0aCggdGhpcy5tb2RlbC5ib2R5U2hhcGUsIHtcclxuICAgICAgc3Ryb2tlOiAnb3JhbmdlJyxcclxuICAgICAgbGluZVdpZHRoOiAyLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHBhdGggKTtcclxuXHJcbiAgICAvLyBmb3JjZWxpbmVzLCB3aGljaCBhdHRyYWN0IHBhcnRpY2xlc1xyXG4gICAgY29uc3QgbGluZXMgPSB0aGlzLm1vZGVsLmZvcmNlTGluZXM7XHJcbiAgICBsZXQgY3VzdG9tU2hhcGU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY3VzdG9tU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgICAgY3VzdG9tU2hhcGUubW92ZVRvKCBsaW5lc1sgaSBdLngxLCBsaW5lc1sgaSBdLnkxICk7XHJcbiAgICAgIGN1c3RvbVNoYXBlLmxpbmVUbyggbGluZXNbIGkgXS54MiwgbGluZXNbIGkgXS55MiApO1xyXG4gICAgICBwYXRoID0gbmV3IFBhdGgoIGN1c3RvbVNoYXBlLCB7XHJcbiAgICAgICAgc3Ryb2tlOiAncmVkJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgICAgcGlja2FibGU6IGZhbHNlLFxyXG4gICAgICAgIHg6IDAsXHJcbiAgICAgICAgeTogMFxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIHBhdGggKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmpvaG5UcmF2b2x0YWdlLnJlZ2lzdGVyKCAnSm9oblRyYXZvbHRhZ2VWaWV3JywgSm9oblRyYXZvbHRhZ2VWaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEpvaG5UcmF2b2x0YWdlVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxVQUFVLE1BQU0sb0NBQW9DO0FBQzNELFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsUUFBUSxNQUFNLHNDQUFzQztBQUMzRCxPQUFPQyxXQUFXLE1BQU0sK0NBQStDO0FBQ3ZFLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0Msa0JBQWtCLE1BQU0sbURB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