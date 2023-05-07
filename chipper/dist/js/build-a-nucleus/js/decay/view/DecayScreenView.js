// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Decay' screen.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import optionize from '../../../../phet-core/js/optionize.js';
import BANScreenView from '../../common/view/BANScreenView.js';
import HalfLifeInformationNode from './HalfLifeInformationNode.js';
import BANConstants from '../../common/BANConstants.js';
import AvailableDecaysPanel from './AvailableDecaysPanel.js';
import SymbolNode from '../../../../shred/js/view/SymbolNode.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import { Circle, Color, HBox, ManualConstraint, RadialGradient, Text } from '../../../../scenery/js/imports.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BANColors from '../../common/BANColors.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Property from '../../../../axon/js/Property.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ParticleType from '../../common/view/ParticleType.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import DecayType from '../../common/view/DecayType.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ReturnButton from '../../../../scenery-phet/js/buttons/ReturnButton.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';

// constants
const NUCLEON_CAPTURE_RADIUS = 100;
const NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE = 2;
const NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE = 2;

// types

class DecayScreenView extends BANScreenView {
  // the symbol node in an accordion box

  // show or hide the electron cloud

  constructor(model, providedOptions) {
    const options = optionize()({}, providedOptions);
    super(model, new Vector2(BANConstants.SCREEN_VIEW_ATOM_CENTER_X, BANConstants.SCREEN_VIEW_ATOM_CENTER_Y), options);
    this.model = model;

    // create and add the atomNode
    this.atomNode = new AtomNode(model.particleAtom, ModelViewTransform2.createIdentity(), {
      showCenterX: false,
      showElementNameProperty: new Property(false),
      showNeutralOrIonProperty: new Property(false),
      showStableOrUnstableProperty: new Property(false),
      electronShellDepictionProperty: new Property('cloud')
    });
    this.atomNode.center = this.particleAtomNode.emptyAtomCircle.center;
    this.addChild(this.atomNode);

    // create and add the half-life information node at the top half of the decay screen
    const halfLifeInformationNode = new HalfLifeInformationNode(model.halfLifeNumberProperty, model.isStableBooleanProperty, model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty);
    halfLifeInformationNode.left = this.layoutBounds.minX + BANConstants.SCREEN_VIEW_X_MARGIN + 30;
    halfLifeInformationNode.y = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN + 80;
    this.addChild(halfLifeInformationNode);

    // use this constant since everything else is positioned off of the halfLifeInformationNode and the centerX changes
    // as the halfLifeArrow in the halfLifeInformationNode moves
    const halfLifeInformationNodeCenterX = halfLifeInformationNode.centerX;

    // create and add the symbol node in an accordion box
    const symbolNode = new SymbolNode(model.particleAtom.protonCountProperty, model.particleAtom.massNumberProperty, {
      scale: 0.3
    });
    this.symbolAccordionBox = new AccordionBox(symbolNode, {
      titleNode: new Text(BuildANucleusStrings.symbol, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 118
      }),
      fill: BANColors.panelBackgroundColorProperty,
      minWidth: 50,
      contentAlign: 'center',
      contentXMargin: 35,
      contentYMargin: 16,
      buttonXMargin: 10,
      buttonYMargin: 10,
      expandCollapseButtonOptions: {
        sideLength: 18
      },
      titleAlignX: 'left',
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    });
    this.symbolAccordionBox.right = this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN;
    this.symbolAccordionBox.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild(this.symbolAccordionBox);

    // store the current nucleon counts
    let oldProtonCount;
    let oldNeutronCount;
    const storeNucleonCounts = () => {
      oldProtonCount = this.model.particleAtom.protonCountProperty.value;
      oldNeutronCount = this.model.particleAtom.neutronCountProperty.value;
    };

    // create the undo decay button
    const undoDecayButton = new ReturnButton(() => {
      undoDecayButton.visible = false;
      restorePreviousNucleonCount(ParticleType.PROTON, oldProtonCount);
      restorePreviousNucleonCount(ParticleType.NEUTRON, oldNeutronCount);
      this.model.outgoingParticles.forEach(particle => {
        this.model.removeParticle(particle);
      });
      this.model.outgoingParticles.clear();
      this.model.particleAnimations.clear();
    }, {
      baseColor: Color.YELLOW.darkerColor(0.95)
    });
    undoDecayButton.visible = false;
    this.addChild(undoDecayButton);

    // restore the particleAtom to have the nucleon counts before a decay occurred
    const restorePreviousNucleonCount = (particleType, oldNucleonCount) => {
      const newNucleonCount = particleType === ParticleType.PROTON ? this.model.particleAtom.protonCountProperty.value : this.model.particleAtom.neutronCountProperty.value;
      const nucleonCountDifference = oldNucleonCount - newNucleonCount;
      for (let i = 0; i < Math.abs(nucleonCountDifference); i++) {
        if (nucleonCountDifference > 0) {
          this.addNucleonImmediatelyToAtom(particleType);
        } else if (nucleonCountDifference < 0) {
          removeNucleonImmediatelyFromAtom(particleType);
        }
      }
    };

    // remove a nucleon of a given particleType from the atom immediately
    const removeNucleonImmediatelyFromAtom = particleType => {
      const particleToRemove = this.model.particleAtom.extractParticle(particleType.name.toLowerCase());
      this.animateAndRemoveParticle(particleToRemove);
    };

    // show the undoDecayButton
    const showAndRepositionUndoDecayButton = decayType => {
      repositionUndoDecayButton(decayType);
      undoDecayButton.visible = true;
    };

    // hide the undo decay button if anything in the nucleus changes
    Multilink.multilink([this.model.particleAtom.massNumberProperty, this.model.userControlledProtons.lengthProperty, this.model.incomingProtons.lengthProperty, this.model.incomingNeutrons.lengthProperty, this.model.userControlledNeutrons.lengthProperty], () => {
      undoDecayButton.visible = false;
    });

    // create and add the available decays panel at the center right of the decay screen
    const availableDecaysPanel = new AvailableDecaysPanel(model, {
      emitNucleon: this.emitNucleon.bind(this),
      emitAlphaParticle: this.emitAlphaParticle.bind(this),
      betaDecay: this.betaDecay.bind(this),
      storeNucleonCounts: storeNucleonCounts.bind(this),
      showAndRepositionUndoDecayButton: showAndRepositionUndoDecayButton.bind(this)
    });
    availableDecaysPanel.right = this.symbolAccordionBox.right;
    availableDecaysPanel.top = this.symbolAccordionBox.bottom + 10;
    this.addChild(availableDecaysPanel);
    let manualConstraint;

    // reposition the undo button beside the decayButton
    const repositionUndoDecayButton = decayType => {
      const decayButtonAndIconIndex = availableDecaysPanel.decayTypeButtonIndexMap[decayType];
      const decayButtonAndIcon = availableDecaysPanel.arrangedDecayButtonsAndIcons.children[decayButtonAndIconIndex];
      manualConstraint && manualConstraint.dispose();
      manualConstraint = new ManualConstraint(this, [decayButtonAndIcon, undoDecayButton], (decayButtonAndIconWrapper, undoDecayButtonWrapper) => {
        undoDecayButtonWrapper.centerY = decayButtonAndIconWrapper.centerY;
      });
    };
    undoDecayButton.right = availableDecaysPanel.left - 10;

    // show the electron cloud by default
    this.showElectronCloudBooleanProperty = new BooleanProperty(true);
    this.showElectronCloudBooleanProperty.link(showElectronCloud => {
      this.particleAtomNode.electronCloud.visible = showElectronCloud;
    });

    // create and add the electronCloud checkbox
    const showElectronCloudCheckbox = new Checkbox(this.showElectronCloudBooleanProperty, new HBox({
      children: [new Text(BuildANucleusStrings.electronCloud, {
        font: BANConstants.REGULAR_FONT,
        maxWidth: 210
      }),
      // electron cloud icon
      new Circle({
        radius: 18,
        fill: new RadialGradient(0, 0, 0, 0, 0, 18).addColorStop(0, 'rgba( 0, 0, 255, 200 )').addColorStop(0.9, 'rgba( 0, 0, 255, 0 )')
      })],
      spacing: 5
    }));
    showElectronCloudCheckbox.left = availableDecaysPanel.left;
    showElectronCloudCheckbox.bottom = this.resetAllButton.bottom;
    this.addChild(showElectronCloudCheckbox);

    // create and add stability indicator
    this.stabilityIndicator = new Text('', {
      font: BANConstants.REGULAR_FONT,
      fill: 'black',
      visible: true,
      maxWidth: 225
    });
    this.stabilityIndicator.center = new Vector2(halfLifeInformationNodeCenterX, availableDecaysPanel.top);
    this.addChild(this.stabilityIndicator);

    // add the particleViewLayerNode after everything else so particles are in the top layer
    this.addChild(this.particleAtomNode);

    // Define the update function for the stability indicator.
    const updateStabilityIndicator = (protonCount, neutronCount) => {
      if (protonCount > 0) {
        if (AtomIdentifier.isStable(protonCount, neutronCount)) {
          this.stabilityIndicator.string = BuildANucleusStrings.stable;
        } else {
          this.stabilityIndicator.string = BuildANucleusStrings.unstable;
        }
      } else {
        this.stabilityIndicator.string = '';
      }
      this.stabilityIndicator.center = new Vector2(halfLifeInformationNodeCenterX, availableDecaysPanel.top);
    };

    // Add the listeners that control the label content
    Multilink.multilink([model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty], (protonCount, neutronCount) => updateStabilityIndicator(protonCount, neutronCount));
    const updateStabilityIndicatorVisibility = visible => {
      this.stabilityIndicator.visible = visible;
    };
    model.doesNuclideExistBooleanProperty.link(updateStabilityIndicatorVisibility);

    // TODO: move elementName to BANScreenView bc text node the same, just positioning different

    this.elementName.center = this.stabilityIndicator.center.plusXY(0, 60);
    this.nucleonCountPanel.left = availableDecaysPanel.left;

    // Hook up update listeners.
    Multilink.multilink([model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.doesNuclideExistBooleanProperty], (protonCount, neutronCount, doesNuclideExist) => BANScreenView.updateElementName(this.elementName, protonCount, neutronCount, doesNuclideExist, this.stabilityIndicator.centerX));

    // only show the emptyAtomCircle if less than 2 particles are in the atom. We still want to show it when there's
    // only one nucleon, and no electron cloud, to accommodate for when the first nucleon is being animated towards the
    // atomNode center. However, if the electronCloud is showing, then only show the emptyAtomCircle when there are zero
    // nucleons
    Multilink.multilink([this.model.particleAtom.protonCountProperty, this.model.particleAtom.neutronCountProperty, this.showElectronCloudBooleanProperty], (protonCount, neutronCount, showElectronCloud) => {
      // TODO: Why should there be two cases? Could remove the latter case?
      this.particleAtomNode.emptyAtomCircle.visible = showElectronCloud ? protonCount + neutronCount === 0 : protonCount + neutronCount <= 1;
    });
  }

  /**
   * Removes a nucleon from the nucleus and animates it out of view.
   */
  emitNucleon(particleType, fromDecay) {
    assert && assert(particleType === ParticleType.PROTON ? this.model.particleAtom.protonCountProperty.value >= 1 : this.model.particleAtom.neutronCountProperty.value >= 1, 'The particleAtom needs a ' + particleType.name + ' to emit it. The decay: ' + fromDecay + ' cannot occur.');
    const nucleon = this.model.particleAtom.extractParticle(particleType.name.toLowerCase());
    this.model.outgoingParticles.add(nucleon);
    this.animateAndRemoveParticle(nucleon, this.getRandomExternalModelPosition());
  }

  /**
   * Creates an alpha particle by removing the needed nucleons from the nucleus, arranging them, and then animates the
   * particle out of view.
   */
  emitAlphaParticle() {
    assert && assert(this.model.particleAtom.protonCountProperty.value >= 2 && this.model.particleAtom.neutronCountProperty.value >= 2, 'The particleAtom needs 2 protons and 2 neutrons to emit an alpha particle.');

    // get the protons and neutrons closest to the center of the particleAtom
    const protonsToRemove = _.sortBy([...this.model.particleAtom.protons], proton => proton.positionProperty.value.distance(this.model.particleAtom.positionProperty.value)).slice(0, NUMBER_OF_PROTONS_IN_ALPHA_PARTICLE);
    const neutronsToRemove = _.sortBy([...this.model.particleAtom.neutrons], neutron => neutron.positionProperty.value.distance(this.model.particleAtom.positionProperty.value)).slice(0, NUMBER_OF_NEUTRONS_IN_ALPHA_PARTICLE);

    // create and add the alpha particle node
    const alphaParticle = new ParticleAtom();

    // pass in empty model view transform because none of the MVT functionality in AtomNode is used
    const alphaParticleNode = new AtomNode(alphaParticle, ModelViewTransform2.createIdentity(), {
      showCenterX: false,
      showElementNameProperty: new BooleanProperty(false),
      showNeutralOrIonProperty: new BooleanProperty(false),
      showStableOrUnstableProperty: new BooleanProperty(false),
      electronShellDepictionProperty: new StringProperty('cloud')
    });
    alphaParticleNode.center = this.atomNode.center;
    this.addChild(alphaParticleNode);

    // remove the obtained protons and neutrons from the particleAtom and add them to the alphaParticle
    [...protonsToRemove, ...neutronsToRemove].forEach(nucleon => {
      this.model.particleAtom.removeParticle(nucleon);
      alphaParticle.addParticle(nucleon);
      this.model.outgoingParticles.add(nucleon);
    });

    // ensure the creator nodes are visible since particles are being removed from the particleAtom
    alphaParticle.moveAllParticlesToDestination();
    this.checkIfCreatorNodeShouldBeVisible(ParticleType.PROTON);
    this.checkIfCreatorNodeShouldBeVisible(ParticleType.NEUTRON);
    alphaParticle.protons.forEach(proton => {
      this.findParticleView(proton).inputEnabled = false;
    });
    alphaParticle.neutrons.forEach(neutron => {
      this.findParticleView(neutron).inputEnabled = false;
    });

    // animate the particle to a random destination outside the model
    const destination = this.getRandomExternalModelPosition(alphaParticleNode.width);
    const totalDistanceAlphaParticleTravels = alphaParticle.positionProperty.value.distance(destination);
    const animationDuration = totalDistanceAlphaParticleTravels / BANConstants.PARTICLE_ANIMATION_SPEED;
    const alphaParticleEmissionAnimation = new Animation({
      property: alphaParticle.positionProperty,
      to: destination,
      duration: animationDuration,
      easing: Easing.LINEAR
    });
    this.model.particleAnimations.push(alphaParticleEmissionAnimation);
    alphaParticleEmissionAnimation.finishEmitter.addListener(() => {
      alphaParticle.neutrons.forEach(neutron => {
        this.removeParticle(neutron);
      });
      alphaParticle.protons.forEach(proton => {
        this.removeParticle(proton);
      });
      alphaParticleNode.dispose();
      alphaParticle.dispose();
    });
    alphaParticleEmissionAnimation.start();

    // this is a special case where the 2 remaining protons, after an alpha particle is emitted, are emitted too
    if (this.model.particleAtom.protonCountProperty.value === 2 && this.model.particleAtom.neutronCountProperty.value === 0) {
      const alphaParticleInitialPosition = alphaParticle.positionProperty.value;

      // the distance the alpha particle travels in {{ BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST }} seconds
      const alphaParticleDistanceTravelled = BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST * (totalDistanceAlphaParticleTravels / animationDuration);
      let protonsEmitted = false;
      alphaParticle.positionProperty.link(position => {
        // emit the 2 protons after {{ BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST }} seconds
        if (!protonsEmitted && position.distance(alphaParticleInitialPosition) >= alphaParticleDistanceTravelled) {
          _.times(2, () => {
            this.emitNucleon(ParticleType.PROTON, DecayType.ALPHA_DECAY.name);
          });
          protonsEmitted = true;
        }
      });
    }
  }

  /**
   * Changes the nucleon type of a particle in the atom and emits an electron or positron from behind that particle.
   */
  betaDecay(betaDecayType) {
    let particleArray;
    let particleToEmit;
    let nucleonTypeCountValue;
    let nucleonTypeToChange;
    if (betaDecayType === DecayType.BETA_MINUS_DECAY) {
      particleArray = this.model.particleAtom.neutrons;
      particleToEmit = new Particle(ParticleType.ELECTRON.name.toLowerCase());
      nucleonTypeCountValue = this.model.particleAtom.neutronCountProperty.value;
      nucleonTypeToChange = ParticleType.NEUTRON.name;
    } else {
      particleArray = this.model.particleAtom.protons;
      particleToEmit = new Particle(ParticleType.POSITRON.name.toLowerCase());
      nucleonTypeCountValue = this.model.particleAtom.protonCountProperty.value;
      nucleonTypeToChange = ParticleType.PROTON.name;
    }
    this.model.outgoingParticles.add(particleToEmit);
    assert && assert(nucleonTypeCountValue >= 1, 'The particleAtom needs a ' + nucleonTypeToChange + ' for a ' + betaDecayType.name);

    // the particle that will change its nucleon type will be the one closest to the center of the atom
    const particle = _.sortBy([...particleArray], particle => particle.positionProperty.value.distance(this.model.particleAtom.positionProperty.value)).shift();

    // place the particleToEmit in the same position and behind the particle that is changing its nucleon type
    particleToEmit.positionProperty.value = particle.positionProperty.value;
    particleToEmit.zLayerProperty.value = particle.zLayerProperty.value + 1;

    // add the particle to the model to emit it, then change the nucleon type and remove the particle
    this.model.addParticle(particleToEmit);
    particleToEmit.destinationProperty.value = this.getRandomExternalModelPosition();
    // TODO: stop this callback from being called if particleToEmit is already removed with outgoingParticles (but I can't manually cause that error..)
    const initialColorChangeAnimation = this.model.particleAtom.changeNucleonType(particle, () => {
      //if ( this.model.particles.includes( particleToEmit ) ) {
      this.animateAndRemoveParticle(particleToEmit, particleToEmit.destinationProperty.value);
      this.checkIfCreatorNodeShouldBeInvisible(ParticleType.PROTON);
      this.checkIfCreatorNodeShouldBeInvisible(ParticleType.NEUTRON);
      this.checkIfCreatorNodeShouldBeVisible(ParticleType.PROTON);
      this.checkIfCreatorNodeShouldBeVisible(ParticleType.NEUTRON);
      //}
    });

    this.model.particleAnimations.add(initialColorChangeAnimation);
  }

  /**
   * Returns a random position outside of the screen view's visible bounds.
   */
  getRandomExternalModelPosition(particleWidth) {
    const visibleBounds = this.visibleBoundsProperty.value.dilated(particleWidth ? particleWidth : 0);
    const destinationBounds = visibleBounds.dilated(300);
    let randomVector = Vector2.ZERO;
    while (visibleBounds.containsPoint(randomVector)) {
      randomVector = new Vector2(dotRandom.nextDoubleBetween(destinationBounds.minX, destinationBounds.maxX), dotRandom.nextDoubleBetween(destinationBounds.minY, destinationBounds.maxY));
    }
    return randomVector.minus(new Vector2(BANConstants.SCREEN_VIEW_ATOM_CENTER_X, BANConstants.SCREEN_VIEW_ATOM_CENTER_Y));
  }

  /**
   * Returns whether the nucleon is within the circular capture radius around the atom.
   */
  isNucleonInCaptureArea(nucleon, atom) {
    return nucleon.positionProperty.value.distance(atom.positionProperty.value) < NUCLEON_CAPTURE_RADIUS;
  }
  reset() {
    this.symbolAccordionBox.reset();
    this.showElectronCloudBooleanProperty.reset();
  }
}
buildANucleus.register('DecayScreenView', DecayScreenView);
export default DecayScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJidWlsZEFOdWNsZXVzIiwib3B0aW9uaXplIiwiQkFOU2NyZWVuVmlldyIsIkhhbGZMaWZlSW5mb3JtYXRpb25Ob2RlIiwiQkFOQ29uc3RhbnRzIiwiQXZhaWxhYmxlRGVjYXlzUGFuZWwiLCJTeW1ib2xOb2RlIiwiQWNjb3JkaW9uQm94IiwiQ2lyY2xlIiwiQ29sb3IiLCJIQm94IiwiTWFudWFsQ29uc3RyYWludCIsIlJhZGlhbEdyYWRpZW50IiwiVGV4dCIsIkJ1aWxkQU51Y2xldXNTdHJpbmdzIiwiQm9vbGVhblByb3BlcnR5IiwiQkFOQ29sb3JzIiwiQXRvbUlkZW50aWZpZXIiLCJWZWN0b3IyIiwiUHJvcGVydHkiLCJBdG9tTm9kZSIsIlBhcnRpY2xlIiwiUGFydGljbGVBdG9tIiwiUGFydGljbGVUeXBlIiwiQ2hlY2tib3giLCJkb3RSYW5kb20iLCJBbmltYXRpb24iLCJFYXNpbmciLCJEZWNheVR5cGUiLCJNdWx0aWxpbmsiLCJSZXR1cm5CdXR0b24iLCJTdHJpbmdQcm9wZXJ0eSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJOVUNMRU9OX0NBUFRVUkVfUkFESVVTIiwiTlVNQkVSX09GX1BST1RPTlNfSU5fQUxQSEFfUEFSVElDTEUiLCJOVU1CRVJfT0ZfTkVVVFJPTlNfSU5fQUxQSEFfUEFSVElDTEUiLCJEZWNheVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIlNDUkVFTl9WSUVXX0FUT01fQ0VOVEVSX1giLCJTQ1JFRU5fVklFV19BVE9NX0NFTlRFUl9ZIiwiYXRvbU5vZGUiLCJwYXJ0aWNsZUF0b20iLCJjcmVhdGVJZGVudGl0eSIsInNob3dDZW50ZXJYIiwic2hvd0VsZW1lbnROYW1lUHJvcGVydHkiLCJzaG93TmV1dHJhbE9ySW9uUHJvcGVydHkiLCJzaG93U3RhYmxlT3JVbnN0YWJsZVByb3BlcnR5IiwiZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5IiwiY2VudGVyIiwicGFydGljbGVBdG9tTm9kZSIsImVtcHR5QXRvbUNpcmNsZSIsImFkZENoaWxkIiwiaGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUiLCJoYWxmTGlmZU51bWJlclByb3BlcnR5IiwiaXNTdGFibGVCb29sZWFuUHJvcGVydHkiLCJwcm90b25Db3VudFByb3BlcnR5IiwibmV1dHJvbkNvdW50UHJvcGVydHkiLCJkb2VzTnVjbGlkZUV4aXN0Qm9vbGVhblByb3BlcnR5IiwibGVmdCIsImxheW91dEJvdW5kcyIsIm1pblgiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsInkiLCJtaW5ZIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJoYWxmTGlmZUluZm9ybWF0aW9uTm9kZUNlbnRlclgiLCJjZW50ZXJYIiwic3ltYm9sTm9kZSIsIm1hc3NOdW1iZXJQcm9wZXJ0eSIsInNjYWxlIiwic3ltYm9sQWNjb3JkaW9uQm94IiwidGl0bGVOb2RlIiwic3ltYm9sIiwiZm9udCIsIlJFR1VMQVJfRk9OVCIsIm1heFdpZHRoIiwiZmlsbCIsInBhbmVsQmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJtaW5XaWR0aCIsImNvbnRlbnRBbGlnbiIsImNvbnRlbnRYTWFyZ2luIiwiY29udGVudFlNYXJnaW4iLCJidXR0b25YTWFyZ2luIiwiYnV0dG9uWU1hcmdpbiIsImV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyIsInNpZGVMZW5ndGgiLCJ0aXRsZUFsaWduWCIsInN0cm9rZSIsIlBBTkVMX1NUUk9LRSIsImNvcm5lclJhZGl1cyIsIlBBTkVMX0NPUk5FUl9SQURJVVMiLCJyaWdodCIsIm1heFgiLCJ0b3AiLCJvbGRQcm90b25Db3VudCIsIm9sZE5ldXRyb25Db3VudCIsInN0b3JlTnVjbGVvbkNvdW50cyIsInZhbHVlIiwidW5kb0RlY2F5QnV0dG9uIiwidmlzaWJsZSIsInJlc3RvcmVQcmV2aW91c051Y2xlb25Db3VudCIsIlBST1RPTiIsIk5FVVRST04iLCJvdXRnb2luZ1BhcnRpY2xlcyIsImZvckVhY2giLCJwYXJ0aWNsZSIsInJlbW92ZVBhcnRpY2xlIiwiY2xlYXIiLCJwYXJ0aWNsZUFuaW1hdGlvbnMiLCJiYXNlQ29sb3IiLCJZRUxMT1ciLCJkYXJrZXJDb2xvciIsInBhcnRpY2xlVHlwZSIsIm9sZE51Y2xlb25Db3VudCIsIm5ld051Y2xlb25Db3VudCIsIm51Y2xlb25Db3VudERpZmZlcmVuY2UiLCJpIiwiTWF0aCIsImFicyIsImFkZE51Y2xlb25JbW1lZGlhdGVseVRvQXRvbSIsInJlbW92ZU51Y2xlb25JbW1lZGlhdGVseUZyb21BdG9tIiwicGFydGljbGVUb1JlbW92ZSIsImV4dHJhY3RQYXJ0aWNsZSIsIm5hbWUiLCJ0b0xvd2VyQ2FzZSIsImFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSIsInNob3dBbmRSZXBvc2l0aW9uVW5kb0RlY2F5QnV0dG9uIiwiZGVjYXlUeXBlIiwicmVwb3NpdGlvblVuZG9EZWNheUJ1dHRvbiIsIm11bHRpbGluayIsInVzZXJDb250cm9sbGVkUHJvdG9ucyIsImxlbmd0aFByb3BlcnR5IiwiaW5jb21pbmdQcm90b25zIiwiaW5jb21pbmdOZXV0cm9ucyIsInVzZXJDb250cm9sbGVkTmV1dHJvbnMiLCJhdmFpbGFibGVEZWNheXNQYW5lbCIsImVtaXROdWNsZW9uIiwiYmluZCIsImVtaXRBbHBoYVBhcnRpY2xlIiwiYmV0YURlY2F5IiwiYm90dG9tIiwibWFudWFsQ29uc3RyYWludCIsImRlY2F5QnV0dG9uQW5kSWNvbkluZGV4IiwiZGVjYXlUeXBlQnV0dG9uSW5kZXhNYXAiLCJkZWNheUJ1dHRvbkFuZEljb24iLCJhcnJhbmdlZERlY2F5QnV0dG9uc0FuZEljb25zIiwiY2hpbGRyZW4iLCJkaXNwb3NlIiwiZGVjYXlCdXR0b25BbmRJY29uV3JhcHBlciIsInVuZG9EZWNheUJ1dHRvbldyYXBwZXIiLCJjZW50ZXJZIiwic2hvd0VsZWN0cm9uQ2xvdWRCb29sZWFuUHJvcGVydHkiLCJsaW5rIiwic2hvd0VsZWN0cm9uQ2xvdWQiLCJlbGVjdHJvbkNsb3VkIiwic2hvd0VsZWN0cm9uQ2xvdWRDaGVja2JveCIsInJhZGl1cyIsImFkZENvbG9yU3RvcCIsInNwYWNpbmciLCJyZXNldEFsbEJ1dHRvbiIsInN0YWJpbGl0eUluZGljYXRvciIsInVwZGF0ZVN0YWJpbGl0eUluZGljYXRvciIsInByb3RvbkNvdW50IiwibmV1dHJvbkNvdW50IiwiaXNTdGFibGUiLCJzdHJpbmciLCJzdGFibGUiLCJ1bnN0YWJsZSIsInVwZGF0ZVN0YWJpbGl0eUluZGljYXRvclZpc2liaWxpdHkiLCJlbGVtZW50TmFtZSIsInBsdXNYWSIsIm51Y2xlb25Db3VudFBhbmVsIiwiZG9lc051Y2xpZGVFeGlzdCIsInVwZGF0ZUVsZW1lbnROYW1lIiwiZnJvbURlY2F5IiwiYXNzZXJ0IiwibnVjbGVvbiIsImFkZCIsImdldFJhbmRvbUV4dGVybmFsTW9kZWxQb3NpdGlvbiIsInByb3RvbnNUb1JlbW92ZSIsIl8iLCJzb3J0QnkiLCJwcm90b25zIiwicHJvdG9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsImRpc3RhbmNlIiwic2xpY2UiLCJuZXV0cm9uc1RvUmVtb3ZlIiwibmV1dHJvbnMiLCJuZXV0cm9uIiwiYWxwaGFQYXJ0aWNsZSIsImFscGhhUGFydGljbGVOb2RlIiwiYWRkUGFydGljbGUiLCJtb3ZlQWxsUGFydGljbGVzVG9EZXN0aW5hdGlvbiIsImNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlVmlzaWJsZSIsImZpbmRQYXJ0aWNsZVZpZXciLCJpbnB1dEVuYWJsZWQiLCJkZXN0aW5hdGlvbiIsIndpZHRoIiwidG90YWxEaXN0YW5jZUFscGhhUGFydGljbGVUcmF2ZWxzIiwiYW5pbWF0aW9uRHVyYXRpb24iLCJQQVJUSUNMRV9BTklNQVRJT05fU1BFRUQiLCJhbHBoYVBhcnRpY2xlRW1pc3Npb25BbmltYXRpb24iLCJwcm9wZXJ0eSIsInRvIiwiZHVyYXRpb24iLCJlYXNpbmciLCJMSU5FQVIiLCJwdXNoIiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwic3RhcnQiLCJhbHBoYVBhcnRpY2xlSW5pdGlhbFBvc2l0aW9uIiwiYWxwaGFQYXJ0aWNsZURpc3RhbmNlVHJhdmVsbGVkIiwiVElNRV9UT19TSE9XX0RPRVNfTk9UX0VYSVNUIiwicHJvdG9uc0VtaXR0ZWQiLCJwb3NpdGlvbiIsInRpbWVzIiwiQUxQSEFfREVDQVkiLCJiZXRhRGVjYXlUeXBlIiwicGFydGljbGVBcnJheSIsInBhcnRpY2xlVG9FbWl0IiwibnVjbGVvblR5cGVDb3VudFZhbHVlIiwibnVjbGVvblR5cGVUb0NoYW5nZSIsIkJFVEFfTUlOVVNfREVDQVkiLCJFTEVDVFJPTiIsIlBPU0lUUk9OIiwic2hpZnQiLCJ6TGF5ZXJQcm9wZXJ0eSIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJpbml0aWFsQ29sb3JDaGFuZ2VBbmltYXRpb24iLCJjaGFuZ2VOdWNsZW9uVHlwZSIsImNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlSW52aXNpYmxlIiwicGFydGljbGVXaWR0aCIsInZpc2libGVCb3VuZHMiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJkaWxhdGVkIiwiZGVzdGluYXRpb25Cb3VuZHMiLCJyYW5kb21WZWN0b3IiLCJaRVJPIiwiY29udGFpbnNQb2ludCIsIm5leHREb3VibGVCZXR3ZWVuIiwibWF4WSIsIm1pbnVzIiwiaXNOdWNsZW9uSW5DYXB0dXJlQXJlYSIsImF0b20iLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRGVjYXlTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgZm9yIHRoZSAnRGVjYXknIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICovXHJcblxyXG5pbXBvcnQgYnVpbGRBTnVjbGV1cyBmcm9tICcuLi8uLi9idWlsZEFOdWNsZXVzLmpzJztcclxuaW1wb3J0IERlY2F5TW9kZWwgZnJvbSAnLi4vbW9kZWwvRGVjYXlNb2RlbC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQkFOU2NyZWVuVmlldywgeyBCQU5TY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0JBTlNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgSGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUgZnJvbSAnLi9IYWxmTGlmZUluZm9ybWF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBCQU5Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0JBTkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBdmFpbGFibGVEZWNheXNQYW5lbCBmcm9tICcuL0F2YWlsYWJsZURlY2F5c1BhbmVsLmpzJztcclxuaW1wb3J0IFN5bWJvbE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvdmlldy9TeW1ib2xOb2RlLmpzJztcclxuaW1wb3J0IEFjY29yZGlvbkJveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgSEJveCwgTWFudWFsQ29uc3RyYWludCwgTm9kZSwgUmFkaWFsR3JhZGllbnQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQnVpbGRBTnVjbGV1c1N0cmluZ3MgZnJvbSAnLi4vLi4vQnVpbGRBTnVjbGV1c1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJBTkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vQkFOQ29sb3JzLmpzJztcclxuaW1wb3J0IEF0b21JZGVudGlmaWVyIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL0F0b21JZGVudGlmaWVyLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBBdG9tTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L0F0b21Ob2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL21vZGVsL1BhcnRpY2xlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlQXRvbSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9QYXJ0aWNsZUF0b20uanMnO1xyXG5pbXBvcnQgUGFydGljbGVUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1BhcnRpY2xlVHlwZS5qcyc7XHJcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ2hlY2tib3guanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgQW5pbWF0aW9uIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0FuaW1hdGlvbi5qcyc7XHJcbmltcG9ydCBFYXNpbmcgZnJvbSAnLi4vLi4vLi4vLi4vdHdpeHQvanMvRWFzaW5nLmpzJztcclxuaW1wb3J0IERlY2F5VHlwZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9EZWNheVR5cGUuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFJldHVybkJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXR1cm5CdXR0b24uanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVUNMRU9OX0NBUFRVUkVfUkFESVVTID0gMTAwO1xyXG5jb25zdCBOVU1CRVJfT0ZfUFJPVE9OU19JTl9BTFBIQV9QQVJUSUNMRSA9IDI7XHJcbmNvbnN0IE5VTUJFUl9PRl9ORVVUUk9OU19JTl9BTFBIQV9QQVJUSUNMRSA9IDI7XHJcblxyXG4vLyB0eXBlc1xyXG5leHBvcnQgdHlwZSBEZWNheVNjcmVlblZpZXdPcHRpb25zID0gQkFOU2NyZWVuVmlld09wdGlvbnM7XHJcblxyXG5jbGFzcyBEZWNheVNjcmVlblZpZXcgZXh0ZW5kcyBCQU5TY3JlZW5WaWV3PERlY2F5TW9kZWw+IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBzdGFiaWxpdHlJbmRpY2F0b3I6IFRleHQ7XHJcblxyXG4gIC8vIHRoZSBzeW1ib2wgbm9kZSBpbiBhbiBhY2NvcmRpb24gYm94XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzeW1ib2xBY2NvcmRpb25Cb3g6IEFjY29yZGlvbkJveDtcclxuXHJcbiAgLy8gc2hvdyBvciBoaWRlIHRoZSBlbGVjdHJvbiBjbG91ZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2hvd0VsZWN0cm9uQ2xvdWRCb29sZWFuUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYXRvbU5vZGU6IEF0b21Ob2RlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBEZWNheU1vZGVsLCBwcm92aWRlZE9wdGlvbnM/OiBEZWNheVNjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8RGVjYXlTY3JlZW5WaWV3T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgQkFOU2NyZWVuVmlld09wdGlvbnM+KCkoIHt9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggbW9kZWwsIG5ldyBWZWN0b3IyKCBCQU5Db25zdGFudHMuU0NSRUVOX1ZJRVdfQVRPTV9DRU5URVJfWCwgQkFOQ29uc3RhbnRzLlNDUkVFTl9WSUVXX0FUT01fQ0VOVEVSX1kgKSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgYXRvbU5vZGVcclxuICAgIHRoaXMuYXRvbU5vZGUgPSBuZXcgQXRvbU5vZGUoIG1vZGVsLnBhcnRpY2xlQXRvbSwgTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVJZGVudGl0eSgpLCB7IHNob3dDZW50ZXJYOiBmYWxzZSxcclxuICAgICAgc2hvd0VsZW1lbnROYW1lUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgc2hvd05ldXRyYWxPcklvblByb3BlcnR5OiBuZXcgUHJvcGVydHkoIGZhbHNlICksXHJcbiAgICAgIHNob3dTdGFibGVPclVuc3RhYmxlUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5OiBuZXcgUHJvcGVydHkoICdjbG91ZCcgKSB9ICk7XHJcbiAgICB0aGlzLmF0b21Ob2RlLmNlbnRlciA9IHRoaXMucGFydGljbGVBdG9tTm9kZS5lbXB0eUF0b21DaXJjbGUuY2VudGVyO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5hdG9tTm9kZSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBoYWxmLWxpZmUgaW5mb3JtYXRpb24gbm9kZSBhdCB0aGUgdG9wIGhhbGYgb2YgdGhlIGRlY2F5IHNjcmVlblxyXG4gICAgY29uc3QgaGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUgPSBuZXcgSGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUoIG1vZGVsLmhhbGZMaWZlTnVtYmVyUHJvcGVydHksIG1vZGVsLmlzU3RhYmxlQm9vbGVhblByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eSwgbW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LCBtb2RlbC5kb2VzTnVjbGlkZUV4aXN0Qm9vbGVhblByb3BlcnR5ICk7XHJcbiAgICBoYWxmTGlmZUluZm9ybWF0aW9uTm9kZS5sZWZ0ID0gdGhpcy5sYXlvdXRCb3VuZHMubWluWCArIEJBTkNvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTiArIDMwO1xyXG4gICAgaGFsZkxpZmVJbmZvcm1hdGlvbk5vZGUueSA9IHRoaXMubGF5b3V0Qm91bmRzLm1pblkgKyBCQU5Db25zdGFudHMuU0NSRUVOX1ZJRVdfWV9NQVJHSU4gKyA4MDtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGhhbGZMaWZlSW5mb3JtYXRpb25Ob2RlICk7XHJcblxyXG4gICAgLy8gdXNlIHRoaXMgY29uc3RhbnQgc2luY2UgZXZlcnl0aGluZyBlbHNlIGlzIHBvc2l0aW9uZWQgb2ZmIG9mIHRoZSBoYWxmTGlmZUluZm9ybWF0aW9uTm9kZSBhbmQgdGhlIGNlbnRlclggY2hhbmdlc1xyXG4gICAgLy8gYXMgdGhlIGhhbGZMaWZlQXJyb3cgaW4gdGhlIGhhbGZMaWZlSW5mb3JtYXRpb25Ob2RlIG1vdmVzXHJcbiAgICBjb25zdCBoYWxmTGlmZUluZm9ybWF0aW9uTm9kZUNlbnRlclggPSBoYWxmTGlmZUluZm9ybWF0aW9uTm9kZS5jZW50ZXJYO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBzeW1ib2wgbm9kZSBpbiBhbiBhY2NvcmRpb24gYm94XHJcbiAgICBjb25zdCBzeW1ib2xOb2RlID0gbmV3IFN5bWJvbE5vZGUoIG1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LCBtb2RlbC5wYXJ0aWNsZUF0b20ubWFzc051bWJlclByb3BlcnR5LCB7XHJcbiAgICAgIHNjYWxlOiAwLjNcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc3ltYm9sQWNjb3JkaW9uQm94ID0gbmV3IEFjY29yZGlvbkJveCggc3ltYm9sTm9kZSwge1xyXG4gICAgICB0aXRsZU5vZGU6IG5ldyBUZXh0KCBCdWlsZEFOdWNsZXVzU3RyaW5ncy5zeW1ib2wsIHtcclxuICAgICAgICBmb250OiBCQU5Db25zdGFudHMuUkVHVUxBUl9GT05ULFxyXG4gICAgICAgIG1heFdpZHRoOiAxMThcclxuICAgICAgfSApLFxyXG4gICAgICBmaWxsOiBCQU5Db2xvcnMucGFuZWxCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgbWluV2lkdGg6IDUwLFxyXG4gICAgICBjb250ZW50QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICBjb250ZW50WE1hcmdpbjogMzUsXHJcbiAgICAgIGNvbnRlbnRZTWFyZ2luOiAxNixcclxuICAgICAgYnV0dG9uWE1hcmdpbjogMTAsXHJcbiAgICAgIGJ1dHRvbllNYXJnaW46IDEwLFxyXG4gICAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBzaWRlTGVuZ3RoOiAxOFxyXG4gICAgICB9LFxyXG4gICAgICB0aXRsZUFsaWduWDogJ2xlZnQnLFxyXG4gICAgICBzdHJva2U6IEJBTkNvbnN0YW50cy5QQU5FTF9TVFJPS0UsXHJcbiAgICAgIGNvcm5lclJhZGl1czogQkFOQ29uc3RhbnRzLlBBTkVMX0NPUk5FUl9SQURJVVNcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc3ltYm9sQWNjb3JkaW9uQm94LnJpZ2h0ID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIEJBTkNvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTjtcclxuICAgIHRoaXMuc3ltYm9sQWNjb3JkaW9uQm94LnRvcCA9IHRoaXMubGF5b3V0Qm91bmRzLm1pblkgKyBCQU5Db25zdGFudHMuU0NSRUVOX1ZJRVdfWV9NQVJHSU47XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnN5bWJvbEFjY29yZGlvbkJveCApO1xyXG5cclxuXHJcbiAgICAvLyBzdG9yZSB0aGUgY3VycmVudCBudWNsZW9uIGNvdW50c1xyXG4gICAgbGV0IG9sZFByb3RvbkNvdW50OiBudW1iZXI7XHJcbiAgICBsZXQgb2xkTmV1dHJvbkNvdW50OiBudW1iZXI7XHJcbiAgICBjb25zdCBzdG9yZU51Y2xlb25Db3VudHMgPSAoKSA9PiB7XHJcbiAgICAgIG9sZFByb3RvbkNvdW50ID0gdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgb2xkTmV1dHJvbkNvdW50ID0gdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ubmV1dHJvbkNvdW50UHJvcGVydHkudmFsdWU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgdW5kbyBkZWNheSBidXR0b25cclxuICAgIGNvbnN0IHVuZG9EZWNheUJ1dHRvbiA9IG5ldyBSZXR1cm5CdXR0b24oICgpID0+IHtcclxuICAgICAgdW5kb0RlY2F5QnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgcmVzdG9yZVByZXZpb3VzTnVjbGVvbkNvdW50KCBQYXJ0aWNsZVR5cGUuUFJPVE9OLCBvbGRQcm90b25Db3VudCApO1xyXG4gICAgICByZXN0b3JlUHJldmlvdXNOdWNsZW9uQ291bnQoIFBhcnRpY2xlVHlwZS5ORVVUUk9OLCBvbGROZXV0cm9uQ291bnQgKTtcclxuICAgICAgdGhpcy5tb2RlbC5vdXRnb2luZ1BhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5yZW1vdmVQYXJ0aWNsZSggcGFydGljbGUgKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLm1vZGVsLm91dGdvaW5nUGFydGljbGVzLmNsZWFyKCk7XHJcbiAgICAgIHRoaXMubW9kZWwucGFydGljbGVBbmltYXRpb25zLmNsZWFyKCk7XHJcbiAgICB9LCB7XHJcbiAgICAgIGJhc2VDb2xvcjogQ29sb3IuWUVMTE9XLmRhcmtlckNvbG9yKCAwLjk1IClcclxuICAgIH0gKTtcclxuICAgIHVuZG9EZWNheUJ1dHRvbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB1bmRvRGVjYXlCdXR0b24gKTtcclxuXHJcbiAgICAvLyByZXN0b3JlIHRoZSBwYXJ0aWNsZUF0b20gdG8gaGF2ZSB0aGUgbnVjbGVvbiBjb3VudHMgYmVmb3JlIGEgZGVjYXkgb2NjdXJyZWRcclxuICAgIGNvbnN0IHJlc3RvcmVQcmV2aW91c051Y2xlb25Db3VudCA9ICggcGFydGljbGVUeXBlOiBQYXJ0aWNsZVR5cGUsIG9sZE51Y2xlb25Db3VudDogbnVtYmVyICkgPT4ge1xyXG4gICAgICBjb25zdCBuZXdOdWNsZW9uQ291bnQgPSBwYXJ0aWNsZVR5cGUgPT09IFBhcnRpY2xlVHlwZS5QUk9UT04gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LnZhbHVlIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ubmV1dHJvbkNvdW50UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IG51Y2xlb25Db3VudERpZmZlcmVuY2UgPSBvbGROdWNsZW9uQ291bnQgLSBuZXdOdWNsZW9uQ291bnQ7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBNYXRoLmFicyggbnVjbGVvbkNvdW50RGlmZmVyZW5jZSApOyBpKysgKSB7XHJcbiAgICAgICAgaWYgKCBudWNsZW9uQ291bnREaWZmZXJlbmNlID4gMCApIHtcclxuICAgICAgICAgIHRoaXMuYWRkTnVjbGVvbkltbWVkaWF0ZWx5VG9BdG9tKCBwYXJ0aWNsZVR5cGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIG51Y2xlb25Db3VudERpZmZlcmVuY2UgPCAwICkge1xyXG4gICAgICAgICAgcmVtb3ZlTnVjbGVvbkltbWVkaWF0ZWx5RnJvbUF0b20oIHBhcnRpY2xlVHlwZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyByZW1vdmUgYSBudWNsZW9uIG9mIGEgZ2l2ZW4gcGFydGljbGVUeXBlIGZyb20gdGhlIGF0b20gaW1tZWRpYXRlbHlcclxuICAgIGNvbnN0IHJlbW92ZU51Y2xlb25JbW1lZGlhdGVseUZyb21BdG9tID0gKCBwYXJ0aWNsZVR5cGU6IFBhcnRpY2xlVHlwZSApID0+IHtcclxuICAgICAgY29uc3QgcGFydGljbGVUb1JlbW92ZSA9IHRoaXMubW9kZWwucGFydGljbGVBdG9tLmV4dHJhY3RQYXJ0aWNsZSggcGFydGljbGVUeXBlLm5hbWUudG9Mb3dlckNhc2UoKSApO1xyXG4gICAgICB0aGlzLmFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSggcGFydGljbGVUb1JlbW92ZSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBzaG93IHRoZSB1bmRvRGVjYXlCdXR0b25cclxuICAgIGNvbnN0IHNob3dBbmRSZXBvc2l0aW9uVW5kb0RlY2F5QnV0dG9uID0gKCBkZWNheVR5cGU6IHN0cmluZyApID0+IHtcclxuICAgICAgcmVwb3NpdGlvblVuZG9EZWNheUJ1dHRvbiggZGVjYXlUeXBlICk7XHJcbiAgICAgIHVuZG9EZWNheUJ1dHRvbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gaGlkZSB0aGUgdW5kbyBkZWNheSBidXR0b24gaWYgYW55dGhpbmcgaW4gdGhlIG51Y2xldXMgY2hhbmdlc1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5tYXNzTnVtYmVyUHJvcGVydHksIHRoaXMubW9kZWwudXNlckNvbnRyb2xsZWRQcm90b25zLmxlbmd0aFByb3BlcnR5LFxyXG4gICAgICB0aGlzLm1vZGVsLmluY29taW5nUHJvdG9ucy5sZW5ndGhQcm9wZXJ0eSwgdGhpcy5tb2RlbC5pbmNvbWluZ05ldXRyb25zLmxlbmd0aFByb3BlcnR5LFxyXG4gICAgICB0aGlzLm1vZGVsLnVzZXJDb250cm9sbGVkTmV1dHJvbnMubGVuZ3RoUHJvcGVydHkgXSwgKCkgPT4ge1xyXG4gICAgICB1bmRvRGVjYXlCdXR0b24udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBhdmFpbGFibGUgZGVjYXlzIHBhbmVsIGF0IHRoZSBjZW50ZXIgcmlnaHQgb2YgdGhlIGRlY2F5IHNjcmVlblxyXG4gICAgY29uc3QgYXZhaWxhYmxlRGVjYXlzUGFuZWwgPSBuZXcgQXZhaWxhYmxlRGVjYXlzUGFuZWwoIG1vZGVsLCB7XHJcbiAgICAgIGVtaXROdWNsZW9uOiB0aGlzLmVtaXROdWNsZW9uLmJpbmQoIHRoaXMgKSxcclxuICAgICAgZW1pdEFscGhhUGFydGljbGU6IHRoaXMuZW1pdEFscGhhUGFydGljbGUuYmluZCggdGhpcyApLFxyXG4gICAgICBiZXRhRGVjYXk6IHRoaXMuYmV0YURlY2F5LmJpbmQoIHRoaXMgKSxcclxuICAgICAgc3RvcmVOdWNsZW9uQ291bnRzOiBzdG9yZU51Y2xlb25Db3VudHMuYmluZCggdGhpcyApLFxyXG4gICAgICBzaG93QW5kUmVwb3NpdGlvblVuZG9EZWNheUJ1dHRvbjogc2hvd0FuZFJlcG9zaXRpb25VbmRvRGVjYXlCdXR0b24uYmluZCggdGhpcyApXHJcbiAgICB9ICk7XHJcbiAgICBhdmFpbGFibGVEZWNheXNQYW5lbC5yaWdodCA9IHRoaXMuc3ltYm9sQWNjb3JkaW9uQm94LnJpZ2h0O1xyXG4gICAgYXZhaWxhYmxlRGVjYXlzUGFuZWwudG9wID0gdGhpcy5zeW1ib2xBY2NvcmRpb25Cb3guYm90dG9tICsgMTA7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhdmFpbGFibGVEZWNheXNQYW5lbCApO1xyXG5cclxuICAgIGxldCBtYW51YWxDb25zdHJhaW50OiBNYW51YWxDb25zdHJhaW50PE5vZGVbXT4gfCBudWxsO1xyXG5cclxuICAgIC8vIHJlcG9zaXRpb24gdGhlIHVuZG8gYnV0dG9uIGJlc2lkZSB0aGUgZGVjYXlCdXR0b25cclxuICAgIGNvbnN0IHJlcG9zaXRpb25VbmRvRGVjYXlCdXR0b24gPSAoIGRlY2F5VHlwZTogc3RyaW5nICkgPT4ge1xyXG4gICAgICBjb25zdCBkZWNheUJ1dHRvbkFuZEljb25JbmRleCA9IGF2YWlsYWJsZURlY2F5c1BhbmVsLmRlY2F5VHlwZUJ1dHRvbkluZGV4TWFwWyBkZWNheVR5cGUgXTtcclxuICAgICAgY29uc3QgZGVjYXlCdXR0b25BbmRJY29uID0gYXZhaWxhYmxlRGVjYXlzUGFuZWwuYXJyYW5nZWREZWNheUJ1dHRvbnNBbmRJY29ucy5jaGlsZHJlblsgZGVjYXlCdXR0b25BbmRJY29uSW5kZXggXTtcclxuICAgICAgbWFudWFsQ29uc3RyYWludCAmJiBtYW51YWxDb25zdHJhaW50LmRpc3Bvc2UoKTtcclxuICAgICAgbWFudWFsQ29uc3RyYWludCA9IG5ldyBNYW51YWxDb25zdHJhaW50KCB0aGlzLCBbIGRlY2F5QnV0dG9uQW5kSWNvbiwgdW5kb0RlY2F5QnV0dG9uIF0sXHJcbiAgICAgICAgKCBkZWNheUJ1dHRvbkFuZEljb25XcmFwcGVyLCB1bmRvRGVjYXlCdXR0b25XcmFwcGVyICkgPT4ge1xyXG4gICAgICAgICAgdW5kb0RlY2F5QnV0dG9uV3JhcHBlci5jZW50ZXJZID0gZGVjYXlCdXR0b25BbmRJY29uV3JhcHBlci5jZW50ZXJZO1xyXG4gICAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgICB1bmRvRGVjYXlCdXR0b24ucmlnaHQgPSBhdmFpbGFibGVEZWNheXNQYW5lbC5sZWZ0IC0gMTA7XHJcblxyXG4gICAgLy8gc2hvdyB0aGUgZWxlY3Ryb24gY2xvdWQgYnkgZGVmYXVsdFxyXG4gICAgdGhpcy5zaG93RWxlY3Ryb25DbG91ZEJvb2xlYW5Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICAgIHRoaXMuc2hvd0VsZWN0cm9uQ2xvdWRCb29sZWFuUHJvcGVydHkubGluayggc2hvd0VsZWN0cm9uQ2xvdWQgPT4geyB0aGlzLnBhcnRpY2xlQXRvbU5vZGUuZWxlY3Ryb25DbG91ZC52aXNpYmxlID0gc2hvd0VsZWN0cm9uQ2xvdWQ7IH0gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgZWxlY3Ryb25DbG91ZCBjaGVja2JveFxyXG4gICAgY29uc3Qgc2hvd0VsZWN0cm9uQ2xvdWRDaGVja2JveCA9IG5ldyBDaGVja2JveCggdGhpcy5zaG93RWxlY3Ryb25DbG91ZEJvb2xlYW5Qcm9wZXJ0eSwgbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVGV4dCggQnVpbGRBTnVjbGV1c1N0cmluZ3MuZWxlY3Ryb25DbG91ZCwgeyBmb250OiBCQU5Db25zdGFudHMuUkVHVUxBUl9GT05ULCBtYXhXaWR0aDogMjEwIH0gKSxcclxuXHJcbiAgICAgICAgLy8gZWxlY3Ryb24gY2xvdWQgaWNvblxyXG4gICAgICAgIG5ldyBDaXJjbGUoIHtcclxuICAgICAgICAgIHJhZGl1czogMTgsXHJcbiAgICAgICAgICBmaWxsOiBuZXcgUmFkaWFsR3JhZGllbnQoIDAsIDAsIDAsIDAsIDAsIDE4IClcclxuICAgICAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgJ3JnYmEoIDAsIDAsIDI1NSwgMjAwICknIClcclxuICAgICAgICAgICAgLmFkZENvbG9yU3RvcCggMC45LCAncmdiYSggMCwgMCwgMjU1LCAwICknIClcclxuICAgICAgICB9IClcclxuICAgICAgXSxcclxuICAgICAgc3BhY2luZzogNVxyXG4gICAgfSApICk7XHJcbiAgICBzaG93RWxlY3Ryb25DbG91ZENoZWNrYm94LmxlZnQgPSBhdmFpbGFibGVEZWNheXNQYW5lbC5sZWZ0O1xyXG4gICAgc2hvd0VsZWN0cm9uQ2xvdWRDaGVja2JveC5ib3R0b20gPSB0aGlzLnJlc2V0QWxsQnV0dG9uLmJvdHRvbTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNob3dFbGVjdHJvbkNsb3VkQ2hlY2tib3ggKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCBzdGFiaWxpdHkgaW5kaWNhdG9yXHJcbiAgICB0aGlzLnN0YWJpbGl0eUluZGljYXRvciA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBCQU5Db25zdGFudHMuUkVHVUxBUl9GT05ULFxyXG4gICAgICBmaWxsOiAnYmxhY2snLFxyXG4gICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICBtYXhXaWR0aDogMjI1XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnN0YWJpbGl0eUluZGljYXRvci5jZW50ZXIgPSBuZXcgVmVjdG9yMiggaGFsZkxpZmVJbmZvcm1hdGlvbk5vZGVDZW50ZXJYLCBhdmFpbGFibGVEZWNheXNQYW5lbC50b3AgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuc3RhYmlsaXR5SW5kaWNhdG9yICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBwYXJ0aWNsZVZpZXdMYXllck5vZGUgYWZ0ZXIgZXZlcnl0aGluZyBlbHNlIHNvIHBhcnRpY2xlcyBhcmUgaW4gdGhlIHRvcCBsYXllclxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5wYXJ0aWNsZUF0b21Ob2RlICk7XHJcblxyXG4gICAgLy8gRGVmaW5lIHRoZSB1cGRhdGUgZnVuY3Rpb24gZm9yIHRoZSBzdGFiaWxpdHkgaW5kaWNhdG9yLlxyXG4gICAgY29uc3QgdXBkYXRlU3RhYmlsaXR5SW5kaWNhdG9yID0gKCBwcm90b25Db3VudDogbnVtYmVyLCBuZXV0cm9uQ291bnQ6IG51bWJlciApID0+IHtcclxuICAgICAgaWYgKCBwcm90b25Db3VudCA+IDAgKSB7XHJcbiAgICAgICAgaWYgKCBBdG9tSWRlbnRpZmllci5pc1N0YWJsZSggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApICkge1xyXG4gICAgICAgICAgdGhpcy5zdGFiaWxpdHlJbmRpY2F0b3Iuc3RyaW5nID0gQnVpbGRBTnVjbGV1c1N0cmluZ3Muc3RhYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuc3RhYmlsaXR5SW5kaWNhdG9yLnN0cmluZyA9IEJ1aWxkQU51Y2xldXNTdHJpbmdzLnVuc3RhYmxlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0YWJpbGl0eUluZGljYXRvci5zdHJpbmcgPSAnJztcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnN0YWJpbGl0eUluZGljYXRvci5jZW50ZXIgPSBuZXcgVmVjdG9yMiggaGFsZkxpZmVJbmZvcm1hdGlvbk5vZGVDZW50ZXJYLCBhdmFpbGFibGVEZWNheXNQYW5lbC50b3AgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gQWRkIHRoZSBsaXN0ZW5lcnMgdGhhdCBjb250cm9sIHRoZSBsYWJlbCBjb250ZW50XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LCBtb2RlbC5wYXJ0aWNsZUF0b20ubmV1dHJvbkNvdW50UHJvcGVydHkgXSxcclxuICAgICAgKCBwcm90b25Db3VudDogbnVtYmVyLCBuZXV0cm9uQ291bnQ6IG51bWJlciApID0+IHVwZGF0ZVN0YWJpbGl0eUluZGljYXRvciggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApXHJcbiAgICApO1xyXG4gICAgY29uc3QgdXBkYXRlU3RhYmlsaXR5SW5kaWNhdG9yVmlzaWJpbGl0eSA9ICggdmlzaWJsZTogYm9vbGVhbiApID0+IHtcclxuICAgICAgdGhpcy5zdGFiaWxpdHlJbmRpY2F0b3IudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICB9O1xyXG4gICAgbW9kZWwuZG9lc051Y2xpZGVFeGlzdEJvb2xlYW5Qcm9wZXJ0eS5saW5rKCB1cGRhdGVTdGFiaWxpdHlJbmRpY2F0b3JWaXNpYmlsaXR5ICk7XHJcblxyXG4gICAgLy8gVE9ETzogbW92ZSBlbGVtZW50TmFtZSB0byBCQU5TY3JlZW5WaWV3IGJjIHRleHQgbm9kZSB0aGUgc2FtZSwganVzdCBwb3NpdGlvbmluZyBkaWZmZXJlbnRcclxuXHJcbiAgICB0aGlzLmVsZW1lbnROYW1lLmNlbnRlciA9IHRoaXMuc3RhYmlsaXR5SW5kaWNhdG9yLmNlbnRlci5wbHVzWFkoIDAsIDYwICk7XHJcbiAgICB0aGlzLm51Y2xlb25Db3VudFBhbmVsLmxlZnQgPSBhdmFpbGFibGVEZWNheXNQYW5lbC5sZWZ0O1xyXG5cclxuICAgIC8vIEhvb2sgdXAgdXBkYXRlIGxpc3RlbmVycy5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHksIG1vZGVsLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eSwgbW9kZWwuZG9lc051Y2xpZGVFeGlzdEJvb2xlYW5Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHByb3RvbkNvdW50OiBudW1iZXIsIG5ldXRyb25Db3VudDogbnVtYmVyLCBkb2VzTnVjbGlkZUV4aXN0OiBib29sZWFuICkgPT5cclxuICAgICAgICBCQU5TY3JlZW5WaWV3LnVwZGF0ZUVsZW1lbnROYW1lKCB0aGlzLmVsZW1lbnROYW1lLCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50LCBkb2VzTnVjbGlkZUV4aXN0LCB0aGlzLnN0YWJpbGl0eUluZGljYXRvci5jZW50ZXJYIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gb25seSBzaG93IHRoZSBlbXB0eUF0b21DaXJjbGUgaWYgbGVzcyB0aGFuIDIgcGFydGljbGVzIGFyZSBpbiB0aGUgYXRvbS4gV2Ugc3RpbGwgd2FudCB0byBzaG93IGl0IHdoZW4gdGhlcmUnc1xyXG4gICAgLy8gb25seSBvbmUgbnVjbGVvbiwgYW5kIG5vIGVsZWN0cm9uIGNsb3VkLCB0byBhY2NvbW1vZGF0ZSBmb3Igd2hlbiB0aGUgZmlyc3QgbnVjbGVvbiBpcyBiZWluZyBhbmltYXRlZCB0b3dhcmRzIHRoZVxyXG4gICAgLy8gYXRvbU5vZGUgY2VudGVyLiBIb3dldmVyLCBpZiB0aGUgZWxlY3Ryb25DbG91ZCBpcyBzaG93aW5nLCB0aGVuIG9ubHkgc2hvdyB0aGUgZW1wdHlBdG9tQ2lyY2xlIHdoZW4gdGhlcmUgYXJlIHplcm9cclxuICAgIC8vIG51Y2xlb25zXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMubW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHksIHRoaXMubW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LFxyXG4gICAgICB0aGlzLnNob3dFbGVjdHJvbkNsb3VkQm9vbGVhblByb3BlcnR5IF0sICggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCwgc2hvd0VsZWN0cm9uQ2xvdWQgKSA9PiB7XHJcblxyXG4gICAgICAvLyBUT0RPOiBXaHkgc2hvdWxkIHRoZXJlIGJlIHR3byBjYXNlcz8gQ291bGQgcmVtb3ZlIHRoZSBsYXR0ZXIgY2FzZT9cclxuICAgICAgdGhpcy5wYXJ0aWNsZUF0b21Ob2RlLmVtcHR5QXRvbUNpcmNsZS52aXNpYmxlID0gc2hvd0VsZWN0cm9uQ2xvdWQgPyAoIHByb3RvbkNvdW50ICsgbmV1dHJvbkNvdW50ICkgPT09IDAgOiAoIHByb3RvbkNvdW50ICsgbmV1dHJvbkNvdW50ICkgPD0gMTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBudWNsZW9uIGZyb20gdGhlIG51Y2xldXMgYW5kIGFuaW1hdGVzIGl0IG91dCBvZiB2aWV3LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBlbWl0TnVjbGVvbiggcGFydGljbGVUeXBlOiBQYXJ0aWNsZVR5cGUsIGZyb21EZWNheT86IHN0cmluZyApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiA/IHRoaXMubW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHkudmFsdWUgPj0gMSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS52YWx1ZSA+PSAxLFxyXG4gICAgICAnVGhlIHBhcnRpY2xlQXRvbSBuZWVkcyBhICcgKyBwYXJ0aWNsZVR5cGUubmFtZSArICcgdG8gZW1pdCBpdC4gVGhlIGRlY2F5OiAnICsgZnJvbURlY2F5ICsgJyBjYW5ub3Qgb2NjdXIuJyApO1xyXG5cclxuICAgIGNvbnN0IG51Y2xlb24gPSB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5leHRyYWN0UGFydGljbGUoIHBhcnRpY2xlVHlwZS5uYW1lLnRvTG93ZXJDYXNlKCkgKTtcclxuICAgIHRoaXMubW9kZWwub3V0Z29pbmdQYXJ0aWNsZXMuYWRkKCBudWNsZW9uICk7XHJcbiAgICB0aGlzLmFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSggbnVjbGVvbiwgdGhpcy5nZXRSYW5kb21FeHRlcm5hbE1vZGVsUG9zaXRpb24oKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhbiBhbHBoYSBwYXJ0aWNsZSBieSByZW1vdmluZyB0aGUgbmVlZGVkIG51Y2xlb25zIGZyb20gdGhlIG51Y2xldXMsIGFycmFuZ2luZyB0aGVtLCBhbmQgdGhlbiBhbmltYXRlcyB0aGVcclxuICAgKiBwYXJ0aWNsZSBvdXQgb2Ygdmlldy5cclxuICAgKi9cclxuICBwdWJsaWMgZW1pdEFscGhhUGFydGljbGUoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LnZhbHVlID49IDIgJiZcclxuICAgIHRoaXMubW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LnZhbHVlID49IDIsXHJcbiAgICAgICdUaGUgcGFydGljbGVBdG9tIG5lZWRzIDIgcHJvdG9ucyBhbmQgMiBuZXV0cm9ucyB0byBlbWl0IGFuIGFscGhhIHBhcnRpY2xlLicgKTtcclxuXHJcbiAgICAvLyBnZXQgdGhlIHByb3RvbnMgYW5kIG5ldXRyb25zIGNsb3Nlc3QgdG8gdGhlIGNlbnRlciBvZiB0aGUgcGFydGljbGVBdG9tXHJcbiAgICBjb25zdCBwcm90b25zVG9SZW1vdmUgPSBfLnNvcnRCeSggWyAuLi50aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25zIF0sIHByb3RvbiA9PlxyXG4gICAgICBwcm90b24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApIClcclxuICAgICAgLnNsaWNlKCAwLCBOVU1CRVJfT0ZfUFJPVE9OU19JTl9BTFBIQV9QQVJUSUNMRSApO1xyXG4gICAgY29uc3QgbmV1dHJvbnNUb1JlbW92ZSA9IF8uc29ydEJ5KCBbIC4uLnRoaXMubW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25zIF0sXHJcbiAgICAgIG5ldXRyb24gPT4gbmV1dHJvbi5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKVxyXG4gICAgICAuc2xpY2UoIDAsIE5VTUJFUl9PRl9ORVVUUk9OU19JTl9BTFBIQV9QQVJUSUNMRSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBhbHBoYSBwYXJ0aWNsZSBub2RlXHJcbiAgICBjb25zdCBhbHBoYVBhcnRpY2xlID0gbmV3IFBhcnRpY2xlQXRvbSgpO1xyXG5cclxuICAgIC8vIHBhc3MgaW4gZW1wdHkgbW9kZWwgdmlldyB0cmFuc2Zvcm0gYmVjYXVzZSBub25lIG9mIHRoZSBNVlQgZnVuY3Rpb25hbGl0eSBpbiBBdG9tTm9kZSBpcyB1c2VkXHJcbiAgICBjb25zdCBhbHBoYVBhcnRpY2xlTm9kZSA9IG5ldyBBdG9tTm9kZSggYWxwaGFQYXJ0aWNsZSwgTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVJZGVudGl0eSgpLCB7XHJcbiAgICAgIHNob3dDZW50ZXJYOiBmYWxzZSxcclxuICAgICAgc2hvd0VsZW1lbnROYW1lUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICksXHJcbiAgICAgIHNob3dOZXV0cmFsT3JJb25Qcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgc2hvd1N0YWJsZU9yVW5zdGFibGVQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5OiBuZXcgU3RyaW5nUHJvcGVydHkoICdjbG91ZCcgKVxyXG4gICAgfSApO1xyXG4gICAgYWxwaGFQYXJ0aWNsZU5vZGUuY2VudGVyID0gdGhpcy5hdG9tTm9kZS5jZW50ZXI7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhbHBoYVBhcnRpY2xlTm9kZSApO1xyXG5cclxuICAgIC8vIHJlbW92ZSB0aGUgb2J0YWluZWQgcHJvdG9ucyBhbmQgbmV1dHJvbnMgZnJvbSB0aGUgcGFydGljbGVBdG9tIGFuZCBhZGQgdGhlbSB0byB0aGUgYWxwaGFQYXJ0aWNsZVxyXG4gICAgWyAuLi5wcm90b25zVG9SZW1vdmUsIC4uLm5ldXRyb25zVG9SZW1vdmUgXS5mb3JFYWNoKCBudWNsZW9uID0+IHtcclxuICAgICAgdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucmVtb3ZlUGFydGljbGUoIG51Y2xlb24gKTtcclxuICAgICAgYWxwaGFQYXJ0aWNsZS5hZGRQYXJ0aWNsZSggbnVjbGVvbiApO1xyXG4gICAgICB0aGlzLm1vZGVsLm91dGdvaW5nUGFydGljbGVzLmFkZCggbnVjbGVvbiApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGVuc3VyZSB0aGUgY3JlYXRvciBub2RlcyBhcmUgdmlzaWJsZSBzaW5jZSBwYXJ0aWNsZXMgYXJlIGJlaW5nIHJlbW92ZWQgZnJvbSB0aGUgcGFydGljbGVBdG9tXHJcbiAgICBhbHBoYVBhcnRpY2xlLm1vdmVBbGxQYXJ0aWNsZXNUb0Rlc3RpbmF0aW9uKCk7XHJcbiAgICB0aGlzLmNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlVmlzaWJsZSggUGFydGljbGVUeXBlLlBST1RPTiApO1xyXG4gICAgdGhpcy5jaGVja0lmQ3JlYXRvck5vZGVTaG91bGRCZVZpc2libGUoIFBhcnRpY2xlVHlwZS5ORVVUUk9OICk7XHJcblxyXG4gICAgYWxwaGFQYXJ0aWNsZS5wcm90b25zLmZvckVhY2goIHByb3RvbiA9PiB7XHJcbiAgICAgIHRoaXMuZmluZFBhcnRpY2xlVmlldyggcHJvdG9uICkuaW5wdXRFbmFibGVkID0gZmFsc2U7XHJcbiAgICB9ICk7XHJcbiAgICBhbHBoYVBhcnRpY2xlLm5ldXRyb25zLmZvckVhY2goIG5ldXRyb24gPT4ge1xyXG4gICAgICB0aGlzLmZpbmRQYXJ0aWNsZVZpZXcoIG5ldXRyb24gKS5pbnB1dEVuYWJsZWQgPSBmYWxzZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhbmltYXRlIHRoZSBwYXJ0aWNsZSB0byBhIHJhbmRvbSBkZXN0aW5hdGlvbiBvdXRzaWRlIHRoZSBtb2RlbFxyXG4gICAgY29uc3QgZGVzdGluYXRpb24gPSB0aGlzLmdldFJhbmRvbUV4dGVybmFsTW9kZWxQb3NpdGlvbiggYWxwaGFQYXJ0aWNsZU5vZGUud2lkdGggKTtcclxuICAgIGNvbnN0IHRvdGFsRGlzdGFuY2VBbHBoYVBhcnRpY2xlVHJhdmVscyA9IGFscGhhUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggZGVzdGluYXRpb24gKTtcclxuICAgIGNvbnN0IGFuaW1hdGlvbkR1cmF0aW9uID0gdG90YWxEaXN0YW5jZUFscGhhUGFydGljbGVUcmF2ZWxzIC8gQkFOQ29uc3RhbnRzLlBBUlRJQ0xFX0FOSU1BVElPTl9TUEVFRDtcclxuXHJcbiAgICBjb25zdCBhbHBoYVBhcnRpY2xlRW1pc3Npb25BbmltYXRpb24gPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgIHByb3BlcnR5OiBhbHBoYVBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHRvOiBkZXN0aW5hdGlvbixcclxuICAgICAgZHVyYXRpb246IGFuaW1hdGlvbkR1cmF0aW9uLFxyXG4gICAgICBlYXNpbmc6IEVhc2luZy5MSU5FQVJcclxuICAgIH0gKTtcclxuICAgIHRoaXMubW9kZWwucGFydGljbGVBbmltYXRpb25zLnB1c2goIGFscGhhUGFydGljbGVFbWlzc2lvbkFuaW1hdGlvbiApO1xyXG5cclxuICAgIGFscGhhUGFydGljbGVFbWlzc2lvbkFuaW1hdGlvbi5maW5pc2hFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIGFscGhhUGFydGljbGUubmV1dHJvbnMuZm9yRWFjaCggbmV1dHJvbiA9PiB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVQYXJ0aWNsZSggbmV1dHJvbiApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGFscGhhUGFydGljbGUucHJvdG9ucy5mb3JFYWNoKCBwcm90b24gPT4ge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlUGFydGljbGUoIHByb3RvbiApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGFscGhhUGFydGljbGVOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgYWxwaGFQYXJ0aWNsZS5kaXNwb3NlKCk7XHJcbiAgICB9ICk7XHJcbiAgICBhbHBoYVBhcnRpY2xlRW1pc3Npb25BbmltYXRpb24uc3RhcnQoKTtcclxuXHJcbiAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHRoZSAyIHJlbWFpbmluZyBwcm90b25zLCBhZnRlciBhbiBhbHBoYSBwYXJ0aWNsZSBpcyBlbWl0dGVkLCBhcmUgZW1pdHRlZCB0b29cclxuICAgIGlmICggdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZSA9PT0gMiAmJiB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuICAgICAgY29uc3QgYWxwaGFQYXJ0aWNsZUluaXRpYWxQb3NpdGlvbiA9IGFscGhhUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgIC8vIHRoZSBkaXN0YW5jZSB0aGUgYWxwaGEgcGFydGljbGUgdHJhdmVscyBpbiB7eyBCQU5Db25zdGFudHMuVElNRV9UT19TSE9XX0RPRVNfTk9UX0VYSVNUIH19IHNlY29uZHNcclxuICAgICAgY29uc3QgYWxwaGFQYXJ0aWNsZURpc3RhbmNlVHJhdmVsbGVkID0gQkFOQ29uc3RhbnRzLlRJTUVfVE9fU0hPV19ET0VTX05PVF9FWElTVCAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggdG90YWxEaXN0YW5jZUFscGhhUGFydGljbGVUcmF2ZWxzIC8gYW5pbWF0aW9uRHVyYXRpb24gKTtcclxuXHJcbiAgICAgIGxldCBwcm90b25zRW1pdHRlZCA9IGZhbHNlO1xyXG4gICAgICBhbHBoYVBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG5cclxuICAgICAgICAvLyBlbWl0IHRoZSAyIHByb3RvbnMgYWZ0ZXIge3sgQkFOQ29uc3RhbnRzLlRJTUVfVE9fU0hPV19ET0VTX05PVF9FWElTVCB9fSBzZWNvbmRzXHJcbiAgICAgICAgaWYgKCAhcHJvdG9uc0VtaXR0ZWQgJiYgcG9zaXRpb24uZGlzdGFuY2UoIGFscGhhUGFydGljbGVJbml0aWFsUG9zaXRpb24gKSA+PSBhbHBoYVBhcnRpY2xlRGlzdGFuY2VUcmF2ZWxsZWQgKSB7XHJcbiAgICAgICAgICBfLnRpbWVzKCAyLCAoKSA9PiB7IHRoaXMuZW1pdE51Y2xlb24oIFBhcnRpY2xlVHlwZS5QUk9UT04sIERlY2F5VHlwZS5BTFBIQV9ERUNBWS5uYW1lICk7IH0gKTtcclxuICAgICAgICAgIHByb3RvbnNFbWl0dGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZXMgdGhlIG51Y2xlb24gdHlwZSBvZiBhIHBhcnRpY2xlIGluIHRoZSBhdG9tIGFuZCBlbWl0cyBhbiBlbGVjdHJvbiBvciBwb3NpdHJvbiBmcm9tIGJlaGluZCB0aGF0IHBhcnRpY2xlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBiZXRhRGVjYXkoIGJldGFEZWNheVR5cGU6IERlY2F5VHlwZSApOiB2b2lkIHtcclxuICAgIGxldCBwYXJ0aWNsZUFycmF5O1xyXG4gICAgbGV0IHBhcnRpY2xlVG9FbWl0OiBQYXJ0aWNsZTtcclxuICAgIGxldCBudWNsZW9uVHlwZUNvdW50VmFsdWU7XHJcbiAgICBsZXQgbnVjbGVvblR5cGVUb0NoYW5nZTtcclxuICAgIGlmICggYmV0YURlY2F5VHlwZSA9PT0gRGVjYXlUeXBlLkJFVEFfTUlOVVNfREVDQVkgKSB7XHJcbiAgICAgIHBhcnRpY2xlQXJyYXkgPSB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5uZXV0cm9ucztcclxuICAgICAgcGFydGljbGVUb0VtaXQgPSBuZXcgUGFydGljbGUoIFBhcnRpY2xlVHlwZS5FTEVDVFJPTi5uYW1lLnRvTG93ZXJDYXNlKCkgKTtcclxuICAgICAgbnVjbGVvblR5cGVDb3VudFZhbHVlID0gdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ubmV1dHJvbkNvdW50UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIG51Y2xlb25UeXBlVG9DaGFuZ2UgPSBQYXJ0aWNsZVR5cGUuTkVVVFJPTi5uYW1lO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHBhcnRpY2xlQXJyYXkgPSB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25zO1xyXG4gICAgICBwYXJ0aWNsZVRvRW1pdCA9IG5ldyBQYXJ0aWNsZSggUGFydGljbGVUeXBlLlBPU0lUUk9OLm5hbWUudG9Mb3dlckNhc2UoKSApO1xyXG4gICAgICBudWNsZW9uVHlwZUNvdW50VmFsdWUgPSB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBudWNsZW9uVHlwZVRvQ2hhbmdlID0gUGFydGljbGVUeXBlLlBST1RPTi5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubW9kZWwub3V0Z29pbmdQYXJ0aWNsZXMuYWRkKCBwYXJ0aWNsZVRvRW1pdCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbnVjbGVvblR5cGVDb3VudFZhbHVlID49IDEsXHJcbiAgICAgICdUaGUgcGFydGljbGVBdG9tIG5lZWRzIGEgJyArIG51Y2xlb25UeXBlVG9DaGFuZ2UgKyAnIGZvciBhICcgKyBiZXRhRGVjYXlUeXBlLm5hbWUgKTtcclxuXHJcbiAgICAvLyB0aGUgcGFydGljbGUgdGhhdCB3aWxsIGNoYW5nZSBpdHMgbnVjbGVvbiB0eXBlIHdpbGwgYmUgdGhlIG9uZSBjbG9zZXN0IHRvIHRoZSBjZW50ZXIgb2YgdGhlIGF0b21cclxuICAgIGNvbnN0IHBhcnRpY2xlID0gXy5zb3J0QnkoIFsgLi4ucGFydGljbGVBcnJheSBdLFxyXG4gICAgICBwYXJ0aWNsZSA9PiBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLmRpc3RhbmNlKCB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgKS5zaGlmdCgpO1xyXG5cclxuICAgIC8vIHBsYWNlIHRoZSBwYXJ0aWNsZVRvRW1pdCBpbiB0aGUgc2FtZSBwb3NpdGlvbiBhbmQgYmVoaW5kIHRoZSBwYXJ0aWNsZSB0aGF0IGlzIGNoYW5naW5nIGl0cyBudWNsZW9uIHR5cGVcclxuICAgIHBhcnRpY2xlVG9FbWl0LnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgcGFydGljbGVUb0VtaXQuekxheWVyUHJvcGVydHkudmFsdWUgPSBwYXJ0aWNsZS56TGF5ZXJQcm9wZXJ0eS52YWx1ZSArIDE7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBwYXJ0aWNsZSB0byB0aGUgbW9kZWwgdG8gZW1pdCBpdCwgdGhlbiBjaGFuZ2UgdGhlIG51Y2xlb24gdHlwZSBhbmQgcmVtb3ZlIHRoZSBwYXJ0aWNsZVxyXG4gICAgdGhpcy5tb2RlbC5hZGRQYXJ0aWNsZSggcGFydGljbGVUb0VtaXQgKTtcclxuICAgIHBhcnRpY2xlVG9FbWl0LmRlc3RpbmF0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLmdldFJhbmRvbUV4dGVybmFsTW9kZWxQb3NpdGlvbigpO1xyXG4gICAgLy8gVE9ETzogc3RvcCB0aGlzIGNhbGxiYWNrIGZyb20gYmVpbmcgY2FsbGVkIGlmIHBhcnRpY2xlVG9FbWl0IGlzIGFscmVhZHkgcmVtb3ZlZCB3aXRoIG91dGdvaW5nUGFydGljbGVzIChidXQgSSBjYW4ndCBtYW51YWxseSBjYXVzZSB0aGF0IGVycm9yLi4pXHJcbiAgICBjb25zdCBpbml0aWFsQ29sb3JDaGFuZ2VBbmltYXRpb24gPSB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5jaGFuZ2VOdWNsZW9uVHlwZSggcGFydGljbGUsICgpID0+IHtcclxuICAgICAgLy9pZiAoIHRoaXMubW9kZWwucGFydGljbGVzLmluY2x1ZGVzKCBwYXJ0aWNsZVRvRW1pdCApICkge1xyXG4gICAgICB0aGlzLmFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSggcGFydGljbGVUb0VtaXQsIHBhcnRpY2xlVG9FbWl0LmRlc3RpbmF0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgdGhpcy5jaGVja0lmQ3JlYXRvck5vZGVTaG91bGRCZUludmlzaWJsZSggUGFydGljbGVUeXBlLlBST1RPTiApO1xyXG4gICAgICB0aGlzLmNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlSW52aXNpYmxlKCBQYXJ0aWNsZVR5cGUuTkVVVFJPTiApO1xyXG4gICAgICB0aGlzLmNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlVmlzaWJsZSggUGFydGljbGVUeXBlLlBST1RPTiApO1xyXG4gICAgICB0aGlzLmNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlVmlzaWJsZSggUGFydGljbGVUeXBlLk5FVVRST04gKTtcclxuICAgICAgLy99XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm1vZGVsLnBhcnRpY2xlQW5pbWF0aW9ucy5hZGQoIGluaXRpYWxDb2xvckNoYW5nZUFuaW1hdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIHJhbmRvbSBwb3NpdGlvbiBvdXRzaWRlIG9mIHRoZSBzY3JlZW4gdmlldydzIHZpc2libGUgYm91bmRzLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0UmFuZG9tRXh0ZXJuYWxNb2RlbFBvc2l0aW9uKCBwYXJ0aWNsZVdpZHRoPzogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgdmlzaWJsZUJvdW5kcyA9IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LnZhbHVlLmRpbGF0ZWQoIHBhcnRpY2xlV2lkdGggPyBwYXJ0aWNsZVdpZHRoIDogMCApO1xyXG4gICAgY29uc3QgZGVzdGluYXRpb25Cb3VuZHMgPSB2aXNpYmxlQm91bmRzLmRpbGF0ZWQoIDMwMCApO1xyXG5cclxuICAgIGxldCByYW5kb21WZWN0b3IgPSBWZWN0b3IyLlpFUk87XHJcbiAgICB3aGlsZSAoIHZpc2libGVCb3VuZHMuY29udGFpbnNQb2ludCggcmFuZG9tVmVjdG9yICkgKSB7XHJcbiAgICAgIHJhbmRvbVZlY3RvciA9IG5ldyBWZWN0b3IyKCBkb3RSYW5kb20ubmV4dERvdWJsZUJldHdlZW4oIGRlc3RpbmF0aW9uQm91bmRzLm1pblgsIGRlc3RpbmF0aW9uQm91bmRzLm1heFggKSxcclxuICAgICAgICBkb3RSYW5kb20ubmV4dERvdWJsZUJldHdlZW4oIGRlc3RpbmF0aW9uQm91bmRzLm1pblksIGRlc3RpbmF0aW9uQm91bmRzLm1heFkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByYW5kb21WZWN0b3IubWludXMoIG5ldyBWZWN0b3IyKCBCQU5Db25zdGFudHMuU0NSRUVOX1ZJRVdfQVRPTV9DRU5URVJfWCwgQkFOQ29uc3RhbnRzLlNDUkVFTl9WSUVXX0FUT01fQ0VOVEVSX1kgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBudWNsZW9uIGlzIHdpdGhpbiB0aGUgY2lyY3VsYXIgY2FwdHVyZSByYWRpdXMgYXJvdW5kIHRoZSBhdG9tLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBpc051Y2xlb25JbkNhcHR1cmVBcmVhKCBudWNsZW9uOiBQYXJ0aWNsZSwgYXRvbTogUGFydGljbGVBdG9tICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIG51Y2xlb24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5kaXN0YW5jZSggYXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlICkgPCBOVUNMRU9OX0NBUFRVUkVfUkFESVVTO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zeW1ib2xBY2NvcmRpb25Cb3gucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd0VsZWN0cm9uQ2xvdWRCb29sZWFuUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmJ1aWxkQU51Y2xldXMucmVnaXN0ZXIoICdEZWNheVNjcmVlblZpZXcnLCBEZWNheVNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgRGVjYXlTY3JlZW5WaWV3O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFNLHdCQUF3QjtBQUVsRCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUNuRixPQUFPQyxhQUFhLE1BQWdDLG9DQUFvQztBQUN4RixPQUFPQyx1QkFBdUIsTUFBTSw4QkFBOEI7QUFDbEUsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFD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