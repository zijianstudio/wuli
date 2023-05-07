// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView class that the 'Decay' and 'Nuclide Chart' will extend.
 *
 * @author Luisa Vargas
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import { Color, Text, VBox } from '../../../../scenery/js/imports.js';
import BANColors from '../BANColors.js';
import NucleonCountPanel from './NucleonCountPanel.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import DoubleArrowButton from './DoubleArrowButton.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NucleonCreatorNode from './NucleonCreatorNode.js';
import ParticleType from './ParticleType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import arrayRemove from '../../../../phet-core/js/arrayRemove.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import BANQueryParameters from '../BANQueryParameters.js';
import ParticleAtomNode from '../../chart-intro/view/ParticleAtomNode.js';
const TOUCH_AREA_Y_DILATION = 3;

// types

// constants
const HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS = 160;
class BANScreenView extends ScreenView {
  // ParticleView.id => {ParticleView} - lookup map for efficiency. Used for storage only.

  // the NucleonCreatorNode for the protons and neutrons

  constructor(model, atomCenter, providedOptions) {
    const options = optionize()({
      particleViewPositionVector: atomCenter
    }, providedOptions);
    super(options);
    this.particleViewPositionVector = options.particleViewPositionVector;
    this.model = model;
    this.timeSinceCountdownStarted = 0;
    this.previousProtonCount = 0;
    this.previousNeutronCount = 0;
    this.atomCenter = atomCenter;
    this.particleViewMap = {};
    this.nucleonCountPanel = new NucleonCountPanel(model.particleAtom.protonCountProperty, model.protonCountRange, model.particleAtom.neutronCountProperty, model.neutronCountRange);
    this.nucleonCountPanel.top = this.layoutBounds.minY + BANConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild(this.nucleonCountPanel);

    // Create the textual readout for the element name.
    this.elementName = new Text('', {
      font: BANConstants.REGULAR_FONT,
      fill: Color.RED,
      maxWidth: BANConstants.ELEMENT_NAME_MAX_WIDTH
    });
    this.addChild(this.elementName);
    const arrowButtonSpacing = 7; // spacing between the 'up' arrow buttons and 'down' arrow buttons
    const arrowButtonOptions = {
      arrowWidth: 14,
      arrowHeight: 14,
      fireOnHold: false
    };

    // return if any nuclides exist above, below, or to the left or right of a given nuclide
    const getNextOrPreviousIso = (direction, particleType, protonCount, neutronCount) => {
      if (direction === 'up') {
        // proton up arrow
        if (particleType === ParticleType.PROTON) {
          return AtomIdentifier.doesNextIsotoneExist(protonCount, neutronCount);
        }

        // neutron up arrow
        return AtomIdentifier.doesNextIsotopeExist(protonCount, neutronCount);
      }

      // proton down arrow
      if (particleType === ParticleType.PROTON) {
        return AtomIdentifier.doesPreviousIsotoneExist(protonCount, neutronCount);
      }

      // neutron down arrow
      return AtomIdentifier.doesPreviousIsotopeExist(protonCount, neutronCount);
    };

    // function returns whether the protonCount or neutronCount is at its min or max range
    const isNucleonCountAtRangeBounds = (direction, particleType, protonCount, neutronCount) => {
      if (direction === 'up') {
        // proton up arrow
        if (particleType === ParticleType.PROTON) {
          return protonCount !== model.protonCountRange.max;
        }

        // neutron up arrow
        return neutronCount !== model.neutronCountRange.max;
      }

      // proton down arrow
      if (particleType === ParticleType.PROTON) {
        return protonCount !== model.protonCountRange.min;
      }

      // neutron down arrow
      return neutronCount !== model.neutronCountRange.min;
    };

    // enable or disable the creator node and adjust the opacity accordingly
    const creatorNodeEnabled = (creatorNode, enable) => {
      if (creatorNode) {
        creatorNode.inputEnabled = enable;
        creatorNode.opacity = enable ? 1 : 0.5;
      }
    };

    // function to create the arrow enabled properties
    const createArrowEnabledProperty = (direction, firstParticleType, secondParticleType) => {
      return new DerivedProperty([model.particleAtom.protonCountProperty, model.particleAtom.neutronCountProperty, model.incomingProtons.lengthProperty, model.incomingNeutrons.lengthProperty, model.userControlledProtons.lengthProperty, model.userControlledNeutrons.lengthProperty], (atomProtonCount, atomNeutronCount, incomingProtonsCount, incomingNeutronsCount, userControlledProtonCount, userControlledNeutronCount) => {
        const protonCount = atomProtonCount + incomingProtonsCount + userControlledProtonCount;
        const neutronCount = atomNeutronCount + incomingNeutronsCount + userControlledNeutronCount;
        const userControlledNucleonCount = userControlledNeutronCount + userControlledProtonCount;

        // disable all arrow buttons if the nuclide does not exist
        if (!AtomIdentifier.doesExist(protonCount, neutronCount) && (model.particleAtom.massNumberProperty.value !== 0 || userControlledNucleonCount !== 0)) {
          creatorNodeEnabled(this.protonsCreatorNode, false);
          creatorNodeEnabled(this.neutronsCreatorNode, false);
          return false;
        } else {
          creatorNodeEnabled(this.protonsCreatorNode, true);
          creatorNodeEnabled(this.neutronsCreatorNode, true);
          const nextOrPreviousIsoExists = secondParticleType ? !getNextOrPreviousIso(direction, firstParticleType, protonCount, neutronCount) || !getNextOrPreviousIso(direction, secondParticleType, protonCount, neutronCount) : !getNextOrPreviousIso(direction, firstParticleType, protonCount, neutronCount);
          const doesNuclideExist = AtomIdentifier.doesExist(protonCount, neutronCount);
          const nuclideExistsBoolean = direction === 'up' ? !doesNuclideExist : doesNuclideExist;
          const doesPreviousNuclideExist = secondParticleType && direction === 'down' ? !AtomIdentifier.doesPreviousNuclideExist(protonCount, neutronCount) : nextOrPreviousIsoExists;
          if (nuclideExistsBoolean && doesPreviousNuclideExist) {
            return false;
          }
          return secondParticleType ? isNucleonCountAtRangeBounds(direction, firstParticleType, protonCount, neutronCount) && isNucleonCountAtRangeBounds(direction, secondParticleType, protonCount, neutronCount) : isNucleonCountAtRangeBounds(direction, firstParticleType, protonCount, neutronCount);
        }
      });
    };

    // create the arrow enabled properties
    const protonUpArrowEnabledProperty = createArrowEnabledProperty('up', ParticleType.PROTON);
    const neutronUpArrowEnabledProperty = createArrowEnabledProperty('up', ParticleType.NEUTRON);
    const doubleUpArrowEnabledProperty = createArrowEnabledProperty('up', ParticleType.PROTON, ParticleType.NEUTRON);
    const protonDownArrowEnabledProperty = createArrowEnabledProperty('down', ParticleType.PROTON);
    const neutronDownArrowEnabledProperty = createArrowEnabledProperty('down', ParticleType.NEUTRON);
    const doubleDownArrowEnabledProperty = createArrowEnabledProperty('down', ParticleType.PROTON, ParticleType.NEUTRON);

    // function to create the double arrow buttons
    const createDoubleArrowButtons = direction => {
      return new DoubleArrowButton(direction, direction === 'up' ? () => increaseNucleonCountListener(ParticleType.PROTON, ParticleType.NEUTRON) : () => decreaseNucleonCountListener(ParticleType.PROTON, ParticleType.NEUTRON), merge({
        leftArrowFill: BANColors.protonColorProperty,
        rightArrowFill: BANColors.neutronColorProperty,
        enabledProperty: direction === 'up' ? doubleUpArrowEnabledProperty : doubleDownArrowEnabledProperty,
        touchAreaYDilation: TOUCH_AREA_Y_DILATION
      }, arrowButtonOptions));
    };

    // create the double arrow buttons
    const doubleArrowButtons = new VBox({
      children: [createDoubleArrowButtons('up'), createDoubleArrowButtons('down')],
      spacing: arrowButtonSpacing
    });
    doubleArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    doubleArrowButtons.centerX = this.atomCenter.x;
    this.addChild(doubleArrowButtons);

    // functions to create the listeners that create or remove a particle
    const increaseNucleonCountListener = (firstNucleonType, secondNucleonType) => {
      this.createParticleFromStack(firstNucleonType);
      if (secondNucleonType) {
        this.createParticleFromStack(secondNucleonType);
      }
    };
    const decreaseNucleonCountListener = (firstNucleonType, secondNucleonType) => {
      this.returnParticleToStack(firstNucleonType);
      if (secondNucleonType) {
        this.returnParticleToStack(secondNucleonType);
      }
    };

    // function to create the single arrow buttons
    const createSingleArrowButtons = (nucleonType, nucleonColorProperty) => {
      const singleArrowButtonOptions = merge({
        arrowFill: nucleonColorProperty
      }, arrowButtonOptions);
      const upArrowButton = new ArrowButton('up', () => increaseNucleonCountListener(nucleonType), merge({
        enabledProperty: nucleonType === ParticleType.PROTON ? protonUpArrowEnabledProperty : neutronUpArrowEnabledProperty,
        touchAreaYDilation: TOUCH_AREA_Y_DILATION
      }, singleArrowButtonOptions));
      const downArrowButton = new ArrowButton('down', () => decreaseNucleonCountListener(nucleonType), merge({
        enabledProperty: nucleonType === ParticleType.PROTON ? protonDownArrowEnabledProperty : neutronDownArrowEnabledProperty,
        touchAreaYDilation: TOUCH_AREA_Y_DILATION
      }, singleArrowButtonOptions));
      return new VBox({
        children: [upArrowButton, downArrowButton],
        spacing: arrowButtonSpacing
      });
    };

    // create the single arrow buttons
    const protonArrowButtons = createSingleArrowButtons(ParticleType.PROTON, BANColors.protonColorProperty);
    protonArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    protonArrowButtons.right = doubleArrowButtons.left - HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild(protonArrowButtons);
    const neutronArrowButtons = createSingleArrowButtons(ParticleType.NEUTRON, BANColors.neutronColorProperty);
    neutronArrowButtons.bottom = this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN;
    neutronArrowButtons.left = doubleArrowButtons.right + HORIZONTAL_DISTANCE_BETWEEN_ARROW_BUTTONS;
    this.addChild(neutronArrowButtons);

    // function to keep track of when a double arrow button was clicked
    const createSingleOrDoubleArrowButtonClickedListener = (isDoubleArrowButton, arrowButtons) => {
      const arrowButtonsChildren = arrowButtons.getChildren();
      arrowButtonsChildren.forEach(arrowButton => {
        arrowButton.addListener(() => {
          model.doubleArrowButtonClickedBooleanProperty.value = isDoubleArrowButton;
        });
      });
    };
    createSingleOrDoubleArrowButtonClickedListener(true, doubleArrowButtons);
    createSingleOrDoubleArrowButtonClickedListener(false, protonArrowButtons);
    createSingleOrDoubleArrowButtonClickedListener(false, neutronArrowButtons);
    const nucleonLabelTextOptions = {
      font: new PhetFont(20),
      maxWidth: 150
    };

    // create and add the Protons and Neutrons label
    const protonsLabel = new Text(BuildANucleusStrings.protons, nucleonLabelTextOptions);
    protonsLabel.bottom = doubleArrowButtons.bottom;
    protonsLabel.centerX = (doubleArrowButtons.left - protonArrowButtons.right) / 2 + protonArrowButtons.right;
    this.addChild(protonsLabel);
    const neutronsLabel = new Text(BuildANucleusStrings.neutronsUppercase, nucleonLabelTextOptions);
    neutronsLabel.bottom = doubleArrowButtons.bottom;
    neutronsLabel.centerX = (neutronArrowButtons.left - doubleArrowButtons.right) / 2 + doubleArrowButtons.right;
    this.addChild(neutronsLabel);

    // create and add the NucleonCreatorNode for the protons
    this.protonsCreatorNode = new NucleonCreatorNode(ParticleType.PROTON, this, options.particleViewPositionVector);
    this.protonsCreatorNode.top = doubleArrowButtons.top;
    this.protonsCreatorNode.centerX = protonsLabel.centerX;
    this.addChild(this.protonsCreatorNode);

    // create and add the NucleonCreatorNode for the neutrons
    this.neutronsCreatorNode = new NucleonCreatorNode(ParticleType.NEUTRON, this, options.particleViewPositionVector);
    this.neutronsCreatorNode.top = doubleArrowButtons.top;
    this.neutronsCreatorNode.centerX = neutronsLabel.centerX;
    this.addChild(this.neutronsCreatorNode);
    this.protonsCreatorNodeModelCenter = this.protonsCreatorNode.center.minus(options.particleViewPositionVector);
    this.neutronsCreatorNodeModelCenter = this.neutronsCreatorNode.center.minus(options.particleViewPositionVector);
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - BANConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - BANConstants.SCREEN_VIEW_Y_MARGIN
    });
    this.addChild(this.resetAllButton);
    const userControlledListener = (isUserControlled, particle) => {
      if (isUserControlled && this.model.particleAtom.containsParticle(particle)) {
        this.model.particleAtom.removeParticle(particle);
      }
      if (isUserControlled && particle.type === ParticleType.PROTON.name.toLowerCase() && !this.model.userControlledProtons.includes(particle)) {
        this.model.userControlledProtons.add(particle);
      } else if (!isUserControlled && particle.type === ParticleType.PROTON.name.toLowerCase() && this.model.userControlledProtons.includes(particle)) {
        this.model.userControlledProtons.remove(particle);
      } else if (isUserControlled && particle.type === ParticleType.NEUTRON.name.toLowerCase() && !this.model.userControlledNeutrons.includes(particle)) {
        this.model.userControlledNeutrons.add(particle);
      } else if (!isUserControlled && particle.type === ParticleType.NEUTRON.name.toLowerCase() && this.model.userControlledNeutrons.includes(particle)) {
        this.model.userControlledNeutrons.remove(particle);
      }
    };

    // convert string particle type to a ParticleType
    const getParticleTypeFromStringType = particleTypeString => {
      const particleType = particleTypeString === ParticleType.PROTON.name.toLowerCase() ? ParticleType.PROTON : particleTypeString === ParticleType.NEUTRON.name.toLowerCase() ? ParticleType.NEUTRON : particleTypeString === ParticleType.ELECTRON.name.toLowerCase() ? ParticleType.ELECTRON : particleTypeString === ParticleType.POSITRON.name.toLowerCase() ? ParticleType.POSITRON : null;
      assert && assert(particleType !== null, `Particle type ${particleTypeString} is not a valid particle type.`);
      return particleType;
    };

    // add ParticleView's to match the model
    this.model.particles.addItemAddedListener(particle => {
      const particleView = new ParticleView(particle, ModelViewTransform2.createSinglePointScaleMapping(Vector2.ZERO, options.particleViewPositionVector, 1));
      this.particleViewMap[particleView.particle.id] = particleView;
      this.addParticleView(particle);
      const particleType = getParticleTypeFromStringType(particle.type);
      if (particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON) {
        // called when a nucleon is finished being dragged
        particle.dragEndedEmitter.addListener(() => {
          this.dragEndedListener(particle, this.model.particleAtom);
        });
        this.checkIfCreatorNodeShouldBeInvisible(particleType);
      }

      // TODO: unlink userControlledListener
      particle.userControlledProperty.link(isUserControlled => userControlledListener(isUserControlled, particle));
    });

    // remove ParticleView's to match the model
    this.model.particles.addItemRemovedListener(particle => {
      const particleView = this.findParticleView(particle);
      particle.dragEndedEmitter.dispose();
      particle.animationEndedEmitter.dispose();
      delete this.particleViewMap[particleView.particle.id];
      particleView.dispose();
      particle.dispose();
      const particleType = getParticleTypeFromStringType(particle.type);
      if (particleType === ParticleType.PROTON || particleType === ParticleType.NEUTRON) {
        this.checkIfCreatorNodeShouldBeVisible(particleType);
      }
    });
    this.particleAtomNode = new ParticleAtomNode(this.particleViewMap, this.atomCenter, this.model.protonCountRange);

    // for use in positioning
    this.doubleArrowButtons = doubleArrowButtons;
    this.protonArrowButtons = protonArrowButtons;
    this.neutronArrowButtons = neutronArrowButtons;

    // add initial neutrons and protons specified by the query parameters to the atom
    _.times(Math.max(BANQueryParameters.neutrons, BANQueryParameters.protons), () => {
      if (this.model.particleAtom.neutronCountProperty.value < BANQueryParameters.neutrons) {
        this.addNucleonImmediatelyToAtom(ParticleType.NEUTRON);
      }
      if (this.model.particleAtom.protonCountProperty.value < BANQueryParameters.protons) {
        this.addNucleonImmediatelyToAtom(ParticleType.PROTON);
      }
    });

    // update the cloud size as the massNumber changes
    model.particleAtom.protonCountProperty.link(protonCount => this.particleAtomNode.updateCloudSize(protonCount, 0.27, 10, 20));
  }

  /**
   * Get information for a specific particle type.
   */
  getInfoForParticleType(particleType) {
    const maxCount = particleType === ParticleType.PROTON ? this.model.protonCountRange.max : this.model.neutronCountRange.max;
    const creatorNode = particleType === ParticleType.PROTON ? this.protonsCreatorNode : this.neutronsCreatorNode;
    const numberOfNucleons = [...this.model.particles].filter(particle => particle.type === particleType.name.toLowerCase()).length;
    const outgoingNucleons = [...this.model.outgoingParticles].filter(particle => particle.type === particleType.name.toLowerCase()).length;
    return {
      maxCount: maxCount,
      creatorNode: creatorNode,
      numberOfNucleons: numberOfNucleons,
      outgoingNucleons: outgoingNucleons
    };
  }

  /**
   * Hides the given creator node if the count for that nucleon type has reached its max.
   */
  checkIfCreatorNodeShouldBeInvisible(particleType) {
    const infoForParticleType = this.getInfoForParticleType(particleType);
    if (infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons >= infoForParticleType.maxCount) {
      BANScreenView.setCreatorNodeVisibility(infoForParticleType.creatorNode, false);
    }
  }

  /**
   * Shows the given creator node if the count for that nucleon type is below its max.
   */
  checkIfCreatorNodeShouldBeVisible(particleType) {
    const infoForParticleType = this.getInfoForParticleType(particleType);
    if (infoForParticleType.numberOfNucleons - infoForParticleType.outgoingNucleons < infoForParticleType.maxCount) {
      BANScreenView.setCreatorNodeVisibility(infoForParticleType.creatorNode, true);
    }
  }

  /**
   * Create and add a nucleon of particleType immediately to the particleAtom.
   */
  addNucleonImmediatelyToAtom(particleType) {
    const particle = new Particle(particleType.name.toLowerCase(), {
      maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
    });

    // place the particle the center of the particleAtom and add it to the model and particleAtom
    particle.setPositionAndDestination(this.model.particleAtom.positionProperty.value);
    this.model.addParticle(particle);
    this.model.particleAtom.addParticle(particle);
  }

  /**
   * Set the input enabled and visibility of a creator node.
   */
  static setCreatorNodeVisibility(creatorNode, visible) {
    if (creatorNode.visible !== visible) {
      creatorNode.visible = visible;
      creatorNode.inputEnabled = visible;
    }
  }

  /**
   * Create a particle of particleType at its creator node and send it (and add it) to the particleAtom.
   */
  createParticleFromStack(particleType) {
    // create a particle at the center of its creator node
    const particle = new Particle(particleType.name.toLowerCase(), {
      maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
    });
    particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;
    const origin = particleType === ParticleType.PROTON ? this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;
    particle.setPositionAndDestination(origin);

    // send the particle the center of the particleAtom and add it to the model
    particle.destinationProperty.value = this.model.getParticleDestination(particleType, particle);
    this.model.addParticle(particle);

    // don't let the particle be clicked until it reaches the particleAtom
    const particleView = this.findParticleView(particle);
    particleView.inputEnabled = false;
    if (particleType === ParticleType.PROTON) {
      this.model.incomingProtons.push(particle);
    } else {
      this.model.incomingNeutrons.push(particle);
    }

    // add the particle to the particleAtom once it reaches the center of the particleAtom and allow it to be clicked
    particle.animationEndedEmitter.addListener(() => {
      if (!this.model.particleAtom.containsParticle(particle)) {
        // must remove incoming particles before adding it to particleAtom so incoming count is accurate
        if (particleType === ParticleType.PROTON) {
          arrayRemove(this.model.incomingProtons, particle);
        } else {
          arrayRemove(this.model.incomingNeutrons, particle);
        }
        this.model.particleAtom.addParticle(particle);
        particleView.inputEnabled = true;
        particle.animationEndedEmitter.removeAllListeners();
      }
    });
  }

  /**
   * Remove a particle of particleType from the particleAtom and send it back to its creator node.
   */
  returnParticleToStack(particleType) {
    const creatorNodePosition = particleType === ParticleType.PROTON ? this.protonsCreatorNodeModelCenter : this.neutronsCreatorNodeModelCenter;
    const particleToReturn = this.model.getParticleToReturn(particleType, creatorNodePosition);

    // remove the particle from the particleAtom and send it back to its creator node position
    this.model.particleAtom.removeParticle(particleToReturn);
    this.animateAndRemoveParticle(particleToReturn, creatorNodePosition);
  }

  /**
   * Animate particle to the given destination and then remove it.
   */
  animateAndRemoveParticle(particle, destination) {
    const particleView = this.findParticleView(particle);
    particleView.inputEnabled = false;
    if (destination) {
      particle.destinationProperty.value = destination;
      particle.animationEndedEmitter.addListener(() => {
        this.removeParticle(particle);
      });
    } else {
      this.removeParticle(particle);
    }
  }

  /**
   * Remove the given particle from the model.
   */
  removeParticle(particle) {
    this.model.outgoingParticles.includes(particle) && this.model.outgoingParticles.remove(particle);
    this.model.removeParticle(particle);
  }

  /**
   * Add a particle to the model and immediately start dragging it with the provided event.
   */
  addAndDragParticle(event, particle) {
    this.model.addParticle(particle);
    const particleView = this.findParticleView(particle);
    particleView.startSyntheticDrag(event);
  }
  reset() {
    //TODO
  }

  /**
   * @param dt - time step, in seconds
   */
  step(dt) {
    const protonCount = this.model.particleAtom.protonCountProperty.value;
    const neutronCount = this.model.particleAtom.neutronCountProperty.value;
    if (!this.model.doesNuclideExistBooleanProperty.value) {
      this.timeSinceCountdownStarted += dt;
    } else {
      this.timeSinceCountdownStarted = 0;

      // keep track of the old values of protonCountProperty and neutronCountProperty to know which value increased
      this.previousProtonCount = protonCount;
      this.previousNeutronCount = neutronCount;
    }

    // show the nuclide that does not exist for one second, then return the necessary particles
    if (this.timeSinceCountdownStarted >= BANConstants.TIME_TO_SHOW_DOES_NOT_EXIST) {
      this.timeSinceCountdownStarted = 0;

      // TODO: change this because it is a bit hacky, uses a boolean property to keep track of if a double arrow button
      //  was clicked
      // a proton and neutron were added to create a nuclide that does not exist, so return a proton and neutron
      if (this.model.doubleArrowButtonClickedBooleanProperty.value && AtomIdentifier.doesPreviousNuclideExist(protonCount, neutronCount)) {
        this.returnParticleToStack(ParticleType.NEUTRON);
        this.returnParticleToStack(ParticleType.PROTON);
      }

      // the neutronCount increased to create a nuclide that does not exist, so return a neutron to the stack
      else if (this.previousNeutronCount < neutronCount && AtomIdentifier.doesPreviousIsotopeExist(protonCount, neutronCount)) {
        this.returnParticleToStack(ParticleType.NEUTRON);
      }

      // the protonCount increased to create a nuclide that does not exist, so return a proton to the stack
      else if (this.previousProtonCount < protonCount && AtomIdentifier.doesPreviousIsotoneExist(protonCount, neutronCount)) {
        this.returnParticleToStack(ParticleType.PROTON);
      }
    }
  }

  /**
   * Given a Particle, find our current display (ParticleView) of it.
   */
  findParticleView(particle) {
    const particleView = this.particleViewMap[particle.id];
    assert && assert(particleView, 'Did not find matching ParticleView for type ' + particle.type + ' and id ' + particle.id);
    return particleView;
  }

  /**
   * Define the update function for the element name.
   */
  static updateElementName(elementNameText, protonCount, neutronCount, doesNuclideExist, centerX, centerY) {
    let name = AtomIdentifier.getName(protonCount);
    const massNumber = protonCount + neutronCount;

    // show "{name} - {massNumber} does not form" in the elementName's place when a nuclide that does not exist on Earth is built
    if (!doesNuclideExist && massNumber !== 0) {
      // no protons
      if (name.length === 0) {
        name += massNumber.toString() + ' ' + BuildANucleusStrings.neutronsLowercase + ' ' + BuildANucleusStrings.doesNotForm;
      } else {
        name += ' - ' + massNumber.toString() + ' ' + BuildANucleusStrings.doesNotForm;
      }
    }

    // no protons
    else if (name.length === 0) {
      // no neutrons
      if (neutronCount === 0) {
        name = '';
      }

      // only one neutron
      else if (neutronCount === 1) {
        name = neutronCount + ' ' + BuildANucleusStrings.neutronLowercase;
      }

      // multiple neutrons
      else {
        name = StringUtils.fillIn(BuildANucleusStrings.clusterOfNeutronsPattern, {
          neutronNumber: neutronCount
        });
      }
    } else {
      name += ' - ' + massNumber.toString();
    }
    elementNameText.string = name;
    elementNameText.centerX = centerX;
    if (centerY) {
      elementNameText.centerY = centerY;
    }
  }

  /**
   * Define a function that will decide where to put nucleons.
   */
  dragEndedListener(nucleon, atom) {
    const particleCreatorNodeCenter = nucleon.type === ParticleType.PROTON.name.toLowerCase() ? this.protonsCreatorNode.center : this.neutronsCreatorNode.center;
    if (this.isNucleonInCaptureArea(nucleon, atom) ||
    // if removing the nucleon will create a nuclide that does not exist, re-add the nucleon to the atom
    this.model.particleAtom.protonCountProperty.value + this.model.particleAtom.neutronCountProperty.value !== 0 && !AtomIdentifier.doesExist(this.model.particleAtom.protonCountProperty.value, this.model.particleAtom.neutronCountProperty.value)) {
      atom.addParticle(nucleon);
    }

    // only animate the removal of a nucleon if it was dragged out of the creator node
    else if (nucleon.positionProperty.value.distance(particleCreatorNodeCenter) > 10) {
      this.animateAndRemoveParticle(nucleon, particleCreatorNodeCenter.minus(this.particleViewPositionVector));
    }
  }
  isNucleonInCaptureArea(nucleon, atom) {
    // Please see subclass implementations
    return false;
  }
  addParticleView(particle) {
    this.particleAtomNode.addParticleView(particle);
  }
}
buildANucleus.register('BANScreenView', BANScreenView);
export default BANScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiUmVzZXRBbGxCdXR0b24iLCJidWlsZEFOdWNsZXVzIiwiQkFOQ29uc3RhbnRzIiwib3B0aW9uaXplIiwiQXJyb3dCdXR0b24iLCJDb2xvciIsIlRleHQiLCJWQm94IiwiQkFOQ29sb3JzIiwiTnVjbGVvbkNvdW50UGFuZWwiLCJBdG9tSWRlbnRpZmllciIsIkRvdWJsZUFycm93QnV0dG9uIiwibWVyZ2UiLCJQaGV0Rm9udCIsIlBhcnRpY2xlVmlldyIsIlBhcnRpY2xlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkJ1aWxkQU51Y2xldXNTdHJpbmdzIiwiTnVjbGVvbkNyZWF0b3JOb2RlIiwiUGFydGljbGVUeXBlIiwiVmVjdG9yMiIsIkRlcml2ZWRQcm9wZXJ0eSIsImFycmF5UmVtb3ZlIiwiU3RyaW5nVXRpbHMiLCJCQU5RdWVyeVBhcmFtZXRlcnMiLCJQYXJ0aWNsZUF0b21Ob2RlIiwiVE9VQ0hfQVJFQV9ZX0RJTEFUSU9OIiwiSE9SSVpPTlRBTF9ESVNUQU5DRV9CRVRXRUVOX0FSUk9XX0JVVFRPTlMiLCJCQU5TY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImF0b21DZW50ZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGFydGljbGVWaWV3UG9zaXRpb25WZWN0b3IiLCJ0aW1lU2luY2VDb3VudGRvd25TdGFydGVkIiwicHJldmlvdXNQcm90b25Db3VudCIsInByZXZpb3VzTmV1dHJvbkNvdW50IiwicGFydGljbGVWaWV3TWFwIiwibnVjbGVvbkNvdW50UGFuZWwiLCJwYXJ0aWNsZUF0b20iLCJwcm90b25Db3VudFByb3BlcnR5IiwicHJvdG9uQ291bnRSYW5nZSIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwibmV1dHJvbkNvdW50UmFuZ2UiLCJ0b3AiLCJsYXlvdXRCb3VuZHMiLCJtaW5ZIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJhZGRDaGlsZCIsImVsZW1lbnROYW1lIiwiZm9udCIsIlJFR1VMQVJfRk9OVCIsImZpbGwiLCJSRUQiLCJtYXhXaWR0aCIsIkVMRU1FTlRfTkFNRV9NQVhfV0lEVEgiLCJhcnJvd0J1dHRvblNwYWNpbmciLCJhcnJvd0J1dHRvbk9wdGlvbnMiLCJhcnJvd1dpZHRoIiwiYXJyb3dIZWlnaHQiLCJmaXJlT25Ib2xkIiwiZ2V0TmV4dE9yUHJldmlvdXNJc28iLCJkaXJlY3Rpb24iLCJwYXJ0aWNsZVR5cGUiLCJwcm90b25Db3VudCIsIm5ldXRyb25Db3VudCIsIlBST1RPTiIsImRvZXNOZXh0SXNvdG9uZUV4aXN0IiwiZG9lc05leHRJc290b3BlRXhpc3QiLCJkb2VzUHJldmlvdXNJc290b25lRXhpc3QiLCJkb2VzUHJldmlvdXNJc290b3BlRXhpc3QiLCJpc051Y2xlb25Db3VudEF0UmFuZ2VCb3VuZHMiLCJtYXgiLCJtaW4iLCJjcmVhdG9yTm9kZUVuYWJsZWQiLCJjcmVhdG9yTm9kZSIsImVuYWJsZSIsImlucHV0RW5hYmxlZCIsIm9wYWNpdHkiLCJjcmVhdGVBcnJvd0VuYWJsZWRQcm9wZXJ0eSIsImZpcnN0UGFydGljbGVUeXBlIiwic2Vjb25kUGFydGljbGVUeXBlIiwiaW5jb21pbmdQcm90b25zIiwibGVuZ3RoUHJvcGVydHkiLCJpbmNvbWluZ05ldXRyb25zIiwidXNlckNvbnRyb2xsZWRQcm90b25zIiwidXNlckNvbnRyb2xsZWROZXV0cm9ucyIsImF0b21Qcm90b25Db3VudCIsImF0b21OZXV0cm9uQ291bnQiLCJpbmNvbWluZ1Byb3RvbnNDb3VudCIsImluY29taW5nTmV1dHJvbnNDb3VudCIsInVzZXJDb250cm9sbGVkUHJvdG9uQ291bnQiLCJ1c2VyQ29udHJvbGxlZE5ldXRyb25Db3VudCIsInVzZXJDb250cm9sbGVkTnVjbGVvbkNvdW50IiwiZG9lc0V4aXN0IiwibWFzc051bWJlclByb3BlcnR5IiwidmFsdWUiLCJwcm90b25zQ3JlYXRvck5vZGUiLCJuZXV0cm9uc0NyZWF0b3JOb2RlIiwibmV4dE9yUHJldmlvdXNJc29FeGlzdHMiLCJkb2VzTnVjbGlkZUV4aXN0IiwibnVjbGlkZUV4aXN0c0Jvb2xlYW4iLCJkb2VzUHJldmlvdXNOdWNsaWRlRXhpc3QiLCJwcm90b25VcEFycm93RW5hYmxlZFByb3BlcnR5IiwibmV1dHJvblVwQXJyb3dFbmFibGVkUHJvcGVydHkiLCJORVVUUk9OIiwiZG91YmxlVXBBcnJvd0VuYWJsZWRQcm9wZXJ0eSIsInByb3RvbkRvd25BcnJvd0VuYWJsZWRQcm9wZXJ0eSIsIm5ldXRyb25Eb3duQXJyb3dFbmFibGVkUHJvcGVydHkiLCJkb3VibGVEb3duQXJyb3dFbmFibGVkUHJvcGVydHkiLCJjcmVhdGVEb3VibGVBcnJvd0J1dHRvbnMiLCJpbmNyZWFzZU51Y2xlb25Db3VudExpc3RlbmVyIiwiZGVjcmVhc2VOdWNsZW9uQ291bnRMaXN0ZW5lciIsImxlZnRBcnJvd0ZpbGwiLCJwcm90b25Db2xvclByb3BlcnR5IiwicmlnaHRBcnJvd0ZpbGwiLCJuZXV0cm9uQ29sb3JQcm9wZXJ0eSIsImVuYWJsZWRQcm9wZXJ0eSIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImRvdWJsZUFycm93QnV0dG9ucyIsImNoaWxkcmVuIiwic3BhY2luZyIsImJvdHRvbSIsIm1heFkiLCJjZW50ZXJYIiwieCIsImZpcnN0TnVjbGVvblR5cGUiLCJzZWNvbmROdWNsZW9uVHlwZSIsImNyZWF0ZVBhcnRpY2xlRnJvbVN0YWNrIiwicmV0dXJuUGFydGljbGVUb1N0YWNrIiwiY3JlYXRlU2luZ2xlQXJyb3dCdXR0b25zIiwibnVjbGVvblR5cGUiLCJudWNsZW9uQ29sb3JQcm9wZXJ0eSIsInNpbmdsZUFycm93QnV0dG9uT3B0aW9ucyIsImFycm93RmlsbCIsInVwQXJyb3dCdXR0b24iLCJkb3duQXJyb3dCdXR0b24iLCJwcm90b25BcnJvd0J1dHRvbnMiLCJyaWdodCIsImxlZnQiLCJuZXV0cm9uQXJyb3dCdXR0b25zIiwiY3JlYXRlU2luZ2xlT3JEb3VibGVBcnJvd0J1dHRvbkNsaWNrZWRMaXN0ZW5lciIsImlzRG91YmxlQXJyb3dCdXR0b24iLCJhcnJvd0J1dHRvbnMiLCJhcnJvd0J1dHRvbnNDaGlsZHJlbiIsImdldENoaWxkcmVuIiwiZm9yRWFjaCIsImFycm93QnV0dG9uIiwiYWRkTGlzdGVuZXIiLCJkb3VibGVBcnJvd0J1dHRvbkNsaWNrZWRCb29sZWFuUHJvcGVydHkiLCJudWNsZW9uTGFiZWxUZXh0T3B0aW9ucyIsInByb3RvbnNMYWJlbCIsInByb3RvbnMiLCJuZXV0cm9uc0xhYmVsIiwibmV1dHJvbnNVcHBlcmNhc2UiLCJwcm90b25zQ3JlYXRvck5vZGVNb2RlbENlbnRlciIsImNlbnRlciIsIm1pbnVzIiwibmV1dHJvbnNDcmVhdG9yTm9kZU1vZGVsQ2VudGVyIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJlc2V0IiwibWF4WCIsIlNDUkVFTl9WSUVXX1hfTUFSR0lOIiwidXNlckNvbnRyb2xsZWRMaXN0ZW5lciIsImlzVXNlckNvbnRyb2xsZWQiLCJwYXJ0aWNsZSIsImNvbnRhaW5zUGFydGljbGUiLCJyZW1vdmVQYXJ0aWNsZSIsInR5cGUiLCJuYW1lIiwidG9Mb3dlckNhc2UiLCJpbmNsdWRlcyIsImFkZCIsInJlbW92ZSIsImdldFBhcnRpY2xlVHlwZUZyb21TdHJpbmdUeXBlIiwicGFydGljbGVUeXBlU3RyaW5nIiwiRUxFQ1RST04iLCJQT1NJVFJPTiIsImFzc2VydCIsInBhcnRpY2xlcyIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwicGFydGljbGVWaWV3IiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZU1hcHBpbmciLCJaRVJPIiwiaWQiLCJhZGRQYXJ0aWNsZVZpZXciLCJkcmFnRW5kZWRFbWl0dGVyIiwiZHJhZ0VuZGVkTGlzdGVuZXIiLCJjaGVja0lmQ3JlYXRvck5vZGVTaG91bGRCZUludmlzaWJsZSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJsaW5rIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsImZpbmRQYXJ0aWNsZVZpZXciLCJkaXNwb3NlIiwiYW5pbWF0aW9uRW5kZWRFbWl0dGVyIiwiY2hlY2tJZkNyZWF0b3JOb2RlU2hvdWxkQmVWaXNpYmxlIiwicGFydGljbGVBdG9tTm9kZSIsIl8iLCJ0aW1lcyIsIk1hdGgiLCJuZXV0cm9ucyIsImFkZE51Y2xlb25JbW1lZGlhdGVseVRvQXRvbSIsInVwZGF0ZUNsb3VkU2l6ZSIsImdldEluZm9Gb3JQYXJ0aWNsZVR5cGUiLCJtYXhDb3VudCIsIm51bWJlck9mTnVjbGVvbnMiLCJmaWx0ZXIiLCJsZW5ndGgiLCJvdXRnb2luZ051Y2xlb25zIiwib3V0Z29pbmdQYXJ0aWNsZXMiLCJpbmZvRm9yUGFydGljbGVUeXBlIiwic2V0Q3JlYXRvck5vZGVWaXNpYmlsaXR5IiwibWF4WkxheWVyIiwiTlVNQkVSX09GX05VQ0xFT05fTEFZRVJTIiwic2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJhZGRQYXJ0aWNsZSIsInZpc2libGUiLCJhbmltYXRpb25WZWxvY2l0eVByb3BlcnR5IiwiUEFSVElDTEVfQU5JTUFUSU9OX1NQRUVEIiwib3JpZ2luIiwiZGVzdGluYXRpb25Qcm9wZXJ0eSIsImdldFBhcnRpY2xlRGVzdGluYXRpb24iLCJwdXNoIiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiY3JlYXRvck5vZGVQb3NpdGlvbiIsInBhcnRpY2xlVG9SZXR1cm4iLCJnZXRQYXJ0aWNsZVRvUmV0dXJuIiwiYW5pbWF0ZUFuZFJlbW92ZVBhcnRpY2xlIiwiZGVzdGluYXRpb24iLCJhZGRBbmREcmFnUGFydGljbGUiLCJldmVudCIsInN0YXJ0U3ludGhldGljRHJhZyIsInN0ZXAiLCJkdCIsImRvZXNOdWNsaWRlRXhpc3RCb29sZWFuUHJvcGVydHkiLCJUSU1FX1RPX1NIT1dfRE9FU19OT1RfRVhJU1QiLCJ1cGRhdGVFbGVtZW50TmFtZSIsImVsZW1lbnROYW1lVGV4dCIsImNlbnRlclkiLCJnZXROYW1lIiwibWFzc051bWJlciIsInRvU3RyaW5nIiwibmV1dHJvbnNMb3dlcmNhc2UiLCJkb2VzTm90Rm9ybSIsIm5ldXRyb25Mb3dlcmNhc2UiLCJmaWxsSW4iLCJjbHVzdGVyT2ZOZXV0cm9uc1BhdHRlcm4iLCJuZXV0cm9uTnVtYmVyIiwic3RyaW5nIiwibnVjbGVvbiIsImF0b20iLCJwYXJ0aWNsZUNyZWF0b3JOb2RlQ2VudGVyIiwiaXNOdWNsZW9uSW5DYXB0dXJlQXJlYSIsImRpc3RhbmNlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCQU5TY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIyLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjcmVlblZpZXcgY2xhc3MgdGhhdCB0aGUgJ0RlY2F5JyBhbmQgJ051Y2xpZGUgQ2hhcnQnIHdpbGwgZXh0ZW5kLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEx1aXNhIFZhcmdhc1xyXG4gKi9cclxuXHJcbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBidWlsZEFOdWNsZXVzIGZyb20gJy4uLy4uL2J1aWxkQU51Y2xldXMuanMnO1xyXG5pbXBvcnQgQkFOQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9CQU5Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgQkFOTW9kZWwgZnJvbSAnLi4vbW9kZWwvQkFOTW9kZWwuanMnO1xyXG5pbXBvcnQgQXJyb3dCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvQXJyb3dCdXR0b24uanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgTm9kZSwgUHJlc3NMaXN0ZW5lckV2ZW50LCBQcm9maWxlQ29sb3JQcm9wZXJ0eSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBCQU5Db2xvcnMgZnJvbSAnLi4vQkFOQ29sb3JzLmpzJztcclxuaW1wb3J0IE51Y2xlb25Db3VudFBhbmVsIGZyb20gJy4vTnVjbGVvbkNvdW50UGFuZWwuanMnO1xyXG5pbXBvcnQgQXRvbUlkZW50aWZpZXIgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvQXRvbUlkZW50aWZpZXIuanMnO1xyXG5pbXBvcnQgRG91YmxlQXJyb3dCdXR0b24sIHsgRG91YmxlQXJyb3dCdXR0b25EaXJlY3Rpb24gfSBmcm9tICcuL0RvdWJsZUFycm93QnV0dG9uLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgUGFydGljbGVWaWV3IGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL3ZpZXcvUGFydGljbGVWaWV3LmpzJztcclxuaW1wb3J0IFBhcnRpY2xlIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL21vZGVsL1BhcnRpY2xlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgQnVpbGRBTnVjbGV1c1N0cmluZ3MgZnJvbSAnLi4vLi4vQnVpbGRBTnVjbGV1c1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgTnVjbGVvbkNyZWF0b3JOb2RlIGZyb20gJy4vTnVjbGVvbkNyZWF0b3JOb2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlVHlwZSBmcm9tICcuL1BhcnRpY2xlVHlwZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZUF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGVBdG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQkFOUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0JBTlF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZU51Y2xldXMgZnJvbSAnLi4vLi4vY2hhcnQtaW50cm8vbW9kZWwvUGFydGljbGVOdWNsZXVzLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlQXRvbU5vZGUgZnJvbSAnLi4vLi4vY2hhcnQtaW50cm8vdmlldy9QYXJ0aWNsZUF0b21Ob2RlLmpzJztcclxuXHJcbmNvbnN0IFRPVUNIX0FSRUFfWV9ESUxBVElPTiA9IDM7XHJcblxyXG4vLyB0eXBlc1xyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHBhcnRpY2xlVmlld1Bvc2l0aW9uVmVjdG9yPzogVmVjdG9yMjtcclxufTtcclxuZXhwb3J0IHR5cGUgQkFOU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNjcmVlblZpZXdPcHRpb25zO1xyXG5leHBvcnQgdHlwZSBQYXJ0aWNsZVZpZXdNYXAgPSBSZWNvcmQ8bnVtYmVyLCBQYXJ0aWNsZVZpZXc+O1xyXG5cclxudHlwZSBQYXJ0aWNsZVR5cGVJbmZvID0ge1xyXG4gIG1heENvdW50OiBudW1iZXI7XHJcbiAgY3JlYXRvck5vZGU6IE5vZGU7XHJcbiAgbnVtYmVyT2ZOdWNsZW9uczogbnVtYmVyO1xyXG4gIG91dGdvaW5nTnVjbGVvbnM6IG51bWJlcjtcclxufTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBIT1JJWk9OVEFMX0RJU1RBTkNFX0JFVFdFRU5fQVJST1dfQlVUVE9OUyA9IDE2MDtcclxuXHJcbmFic3RyYWN0IGNsYXNzIEJBTlNjcmVlblZpZXc8TSBleHRlbmRzIEJBTk1vZGVsPFBhcnRpY2xlQXRvbSB8IFBhcnRpY2xlTnVjbGV1cz4+IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIHByb3RlY3RlZCBtb2RlbDogTTtcclxuICBwcml2YXRlIHRpbWVTaW5jZUNvdW50ZG93blN0YXJ0ZWQ6IG51bWJlcjtcclxuICBwcml2YXRlIHByZXZpb3VzUHJvdG9uQ291bnQ6IG51bWJlcjtcclxuICBwcml2YXRlIHByZXZpb3VzTmV1dHJvbkNvdW50OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJlc2V0QWxsQnV0dG9uOiBOb2RlO1xyXG4gIHB1YmxpYyByZWFkb25seSBudWNsZW9uQ291bnRQYW5lbDogTm9kZTtcclxuXHJcbiAgLy8gUGFydGljbGVWaWV3LmlkID0+IHtQYXJ0aWNsZVZpZXd9IC0gbG9va3VwIG1hcCBmb3IgZWZmaWNpZW5jeS4gVXNlZCBmb3Igc3RvcmFnZSBvbmx5LlxyXG4gIHByb3RlY3RlZCByZWFkb25seSBwYXJ0aWNsZVZpZXdNYXA6IFBhcnRpY2xlVmlld01hcDtcclxuXHJcbiAgLy8gdGhlIE51Y2xlb25DcmVhdG9yTm9kZSBmb3IgdGhlIHByb3RvbnMgYW5kIG5ldXRyb25zXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHByb3RvbnNDcmVhdG9yTm9kZTogTm9kZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmV1dHJvbnNDcmVhdG9yTm9kZTogTm9kZTtcclxuXHJcbiAgcHVibGljIHByb3RvbnNDcmVhdG9yTm9kZU1vZGVsQ2VudGVyOiBWZWN0b3IyO1xyXG4gIHB1YmxpYyBuZXV0cm9uc0NyZWF0b3JOb2RlTW9kZWxDZW50ZXI6IFZlY3RvcjI7XHJcblxyXG4gIHByb3RlY3RlZCByZWFkb25seSBkb3VibGVBcnJvd0J1dHRvbnM6IE5vZGU7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHByb3RvbkFycm93QnV0dG9uczogTm9kZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgbmV1dHJvbkFycm93QnV0dG9uczogTm9kZTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgZWxlbWVudE5hbWU6IFRleHQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBhdG9tQ2VudGVyOiBWZWN0b3IyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgcGFydGljbGVWaWV3UG9zaXRpb25WZWN0b3I6IFZlY3RvcjI7XHJcbiAgcHJvdGVjdGVkIHBhcnRpY2xlQXRvbU5vZGU6IFBhcnRpY2xlQXRvbU5vZGU7XHJcblxyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvciggbW9kZWw6IE0sIGF0b21DZW50ZXI6IFZlY3RvcjIsIHByb3ZpZGVkT3B0aW9ucz86IEJBTlNjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QkFOU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5WaWV3T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgcGFydGljbGVWaWV3UG9zaXRpb25WZWN0b3I6IGF0b21DZW50ZXJcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZVZpZXdQb3NpdGlvblZlY3RvciA9IG9wdGlvbnMucGFydGljbGVWaWV3UG9zaXRpb25WZWN0b3I7XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB0aGlzLnRpbWVTaW5jZUNvdW50ZG93blN0YXJ0ZWQgPSAwO1xyXG4gICAgdGhpcy5wcmV2aW91c1Byb3RvbkNvdW50ID0gMDtcclxuICAgIHRoaXMucHJldmlvdXNOZXV0cm9uQ291bnQgPSAwO1xyXG5cclxuICAgIHRoaXMuYXRvbUNlbnRlciA9IGF0b21DZW50ZXI7XHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZVZpZXdNYXAgPSB7fTtcclxuXHJcbiAgICB0aGlzLm51Y2xlb25Db3VudFBhbmVsID0gbmV3IE51Y2xlb25Db3VudFBhbmVsKCBtb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eSwgbW9kZWwucHJvdG9uQ291bnRSYW5nZSxcclxuICAgICAgbW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LCBtb2RlbC5uZXV0cm9uQ291bnRSYW5nZSApO1xyXG4gICAgdGhpcy5udWNsZW9uQ291bnRQYW5lbC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy5taW5ZICsgQkFOQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5udWNsZW9uQ291bnRQYW5lbCApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgdGV4dHVhbCByZWFkb3V0IGZvciB0aGUgZWxlbWVudCBuYW1lLlxyXG4gICAgdGhpcy5lbGVtZW50TmFtZSA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBCQU5Db25zdGFudHMuUkVHVUxBUl9GT05ULFxyXG4gICAgICBmaWxsOiBDb2xvci5SRUQsXHJcbiAgICAgIG1heFdpZHRoOiBCQU5Db25zdGFudHMuRUxFTUVOVF9OQU1FX01BWF9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5lbGVtZW50TmFtZSApO1xyXG5cclxuICAgIGNvbnN0IGFycm93QnV0dG9uU3BhY2luZyA9IDc7IC8vIHNwYWNpbmcgYmV0d2VlbiB0aGUgJ3VwJyBhcnJvdyBidXR0b25zIGFuZCAnZG93bicgYXJyb3cgYnV0dG9uc1xyXG4gICAgY29uc3QgYXJyb3dCdXR0b25PcHRpb25zID0ge1xyXG4gICAgICBhcnJvd1dpZHRoOiAxNCxcclxuICAgICAgYXJyb3dIZWlnaHQ6IDE0LFxyXG4gICAgICBmaXJlT25Ib2xkOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyByZXR1cm4gaWYgYW55IG51Y2xpZGVzIGV4aXN0IGFib3ZlLCBiZWxvdywgb3IgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgYSBnaXZlbiBudWNsaWRlXHJcbiAgICBjb25zdCBnZXROZXh0T3JQcmV2aW91c0lzbyA9ICggZGlyZWN0aW9uOiBzdHJpbmcsIHBhcnRpY2xlVHlwZTogUGFydGljbGVUeXBlLCBwcm90b25Db3VudDogbnVtYmVyLCBuZXV0cm9uQ291bnQ6IG51bWJlciApID0+IHtcclxuXHJcbiAgICAgIGlmICggZGlyZWN0aW9uID09PSAndXAnICkge1xyXG5cclxuICAgICAgICAvLyBwcm90b24gdXAgYXJyb3dcclxuICAgICAgICBpZiAoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiApIHtcclxuICAgICAgICAgIHJldHVybiBBdG9tSWRlbnRpZmllci5kb2VzTmV4dElzb3RvbmVFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbmV1dHJvbiB1cCBhcnJvd1xyXG4gICAgICAgIHJldHVybiBBdG9tSWRlbnRpZmllci5kb2VzTmV4dElzb3RvcGVFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBwcm90b24gZG93biBhcnJvd1xyXG4gICAgICBpZiAoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiApIHtcclxuICAgICAgICByZXR1cm4gQXRvbUlkZW50aWZpZXIuZG9lc1ByZXZpb3VzSXNvdG9uZUV4aXN0KCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG5ldXRyb24gZG93biBhcnJvd1xyXG4gICAgICByZXR1cm4gQXRvbUlkZW50aWZpZXIuZG9lc1ByZXZpb3VzSXNvdG9wZUV4aXN0KCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uIHJldHVybnMgd2hldGhlciB0aGUgcHJvdG9uQ291bnQgb3IgbmV1dHJvbkNvdW50IGlzIGF0IGl0cyBtaW4gb3IgbWF4IHJhbmdlXHJcbiAgICBjb25zdCBpc051Y2xlb25Db3VudEF0UmFuZ2VCb3VuZHMgPSAoIGRpcmVjdGlvbjogc3RyaW5nLCBwYXJ0aWNsZVR5cGU6IFBhcnRpY2xlVHlwZSwgcHJvdG9uQ291bnQ6IG51bWJlciwgbmV1dHJvbkNvdW50OiBudW1iZXIgKSA9PiB7XHJcbiAgICAgIGlmICggZGlyZWN0aW9uID09PSAndXAnICkge1xyXG5cclxuICAgICAgICAvLyBwcm90b24gdXAgYXJyb3dcclxuICAgICAgICBpZiAoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiApIHtcclxuICAgICAgICAgIHJldHVybiBwcm90b25Db3VudCAhPT0gbW9kZWwucHJvdG9uQ291bnRSYW5nZS5tYXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBuZXV0cm9uIHVwIGFycm93XHJcbiAgICAgICAgcmV0dXJuIG5ldXRyb25Db3VudCAhPT0gbW9kZWwubmV1dHJvbkNvdW50UmFuZ2UubWF4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBwcm90b24gZG93biBhcnJvd1xyXG4gICAgICBpZiAoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiApIHtcclxuICAgICAgICByZXR1cm4gcHJvdG9uQ291bnQgIT09IG1vZGVsLnByb3RvbkNvdW50UmFuZ2UubWluO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBuZXV0cm9uIGRvd24gYXJyb3dcclxuICAgICAgcmV0dXJuIG5ldXRyb25Db3VudCAhPT0gbW9kZWwubmV1dHJvbkNvdW50UmFuZ2UubWluO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBlbmFibGUgb3IgZGlzYWJsZSB0aGUgY3JlYXRvciBub2RlIGFuZCBhZGp1c3QgdGhlIG9wYWNpdHkgYWNjb3JkaW5nbHlcclxuICAgIGNvbnN0IGNyZWF0b3JOb2RlRW5hYmxlZCA9ICggY3JlYXRvck5vZGU6IE5vZGUsIGVuYWJsZTogYm9vbGVhbiApID0+IHtcclxuICAgICAgaWYgKCBjcmVhdG9yTm9kZSApIHtcclxuICAgICAgICBjcmVhdG9yTm9kZS5pbnB1dEVuYWJsZWQgPSBlbmFibGU7XHJcbiAgICAgICAgY3JlYXRvck5vZGUub3BhY2l0eSA9IGVuYWJsZSA/IDEgOiAwLjU7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBhcnJvdyBlbmFibGVkIHByb3BlcnRpZXNcclxuICAgIGNvbnN0IGNyZWF0ZUFycm93RW5hYmxlZFByb3BlcnR5ID0gKCBkaXJlY3Rpb246IHN0cmluZywgZmlyc3RQYXJ0aWNsZVR5cGU6IFBhcnRpY2xlVHlwZSwgc2Vjb25kUGFydGljbGVUeXBlPzogUGFydGljbGVUeXBlICkgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eSwgbW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LFxyXG4gICAgICAgICAgbW9kZWwuaW5jb21pbmdQcm90b25zLmxlbmd0aFByb3BlcnR5LCBtb2RlbC5pbmNvbWluZ05ldXRyb25zLmxlbmd0aFByb3BlcnR5LCBtb2RlbC51c2VyQ29udHJvbGxlZFByb3RvbnMubGVuZ3RoUHJvcGVydHksXHJcbiAgICAgICAgICBtb2RlbC51c2VyQ29udHJvbGxlZE5ldXRyb25zLmxlbmd0aFByb3BlcnR5IF0sXHJcbiAgICAgICAgKCBhdG9tUHJvdG9uQ291bnQsIGF0b21OZXV0cm9uQ291bnQsIGluY29taW5nUHJvdG9uc0NvdW50LCBpbmNvbWluZ05ldXRyb25zQ291bnQsXHJcbiAgICAgICAgICB1c2VyQ29udHJvbGxlZFByb3RvbkNvdW50LCB1c2VyQ29udHJvbGxlZE5ldXRyb25Db3VudCApID0+IHtcclxuXHJcbiAgICAgICAgICBjb25zdCBwcm90b25Db3VudCA9IGF0b21Qcm90b25Db3VudCArIGluY29taW5nUHJvdG9uc0NvdW50ICsgdXNlckNvbnRyb2xsZWRQcm90b25Db3VudDtcclxuICAgICAgICAgIGNvbnN0IG5ldXRyb25Db3VudCA9IGF0b21OZXV0cm9uQ291bnQgKyBpbmNvbWluZ05ldXRyb25zQ291bnQgKyB1c2VyQ29udHJvbGxlZE5ldXRyb25Db3VudDtcclxuICAgICAgICAgIGNvbnN0IHVzZXJDb250cm9sbGVkTnVjbGVvbkNvdW50ID0gdXNlckNvbnRyb2xsZWROZXV0cm9uQ291bnQgKyB1c2VyQ29udHJvbGxlZFByb3RvbkNvdW50O1xyXG5cclxuICAgICAgICAgIC8vIGRpc2FibGUgYWxsIGFycm93IGJ1dHRvbnMgaWYgdGhlIG51Y2xpZGUgZG9lcyBub3QgZXhpc3RcclxuICAgICAgICAgIGlmICggIUF0b21JZGVudGlmaWVyLmRvZXNFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApICYmICggbW9kZWwucGFydGljbGVBdG9tLm1hc3NOdW1iZXJQcm9wZXJ0eS52YWx1ZSAhPT0gMCB8fCB1c2VyQ29udHJvbGxlZE51Y2xlb25Db3VudCAhPT0gMCApICkge1xyXG4gICAgICAgICAgICBjcmVhdG9yTm9kZUVuYWJsZWQoIHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBjcmVhdG9yTm9kZUVuYWJsZWQoIHRoaXMubmV1dHJvbnNDcmVhdG9yTm9kZSwgZmFsc2UgKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjcmVhdG9yTm9kZUVuYWJsZWQoIHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlLCB0cnVlICk7XHJcbiAgICAgICAgICAgIGNyZWF0b3JOb2RlRW5hYmxlZCggdGhpcy5uZXV0cm9uc0NyZWF0b3JOb2RlLCB0cnVlICk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuZXh0T3JQcmV2aW91c0lzb0V4aXN0cyA9IHNlY29uZFBhcnRpY2xlVHlwZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIWdldE5leHRPclByZXZpb3VzSXNvKCBkaXJlY3Rpb24sIGZpcnN0UGFydGljbGVUeXBlLCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50ICkgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhZ2V0TmV4dE9yUHJldmlvdXNJc28oIGRpcmVjdGlvbiwgc2Vjb25kUGFydGljbGVUeXBlLCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50ICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFnZXROZXh0T3JQcmV2aW91c0lzbyggZGlyZWN0aW9uLCBmaXJzdFBhcnRpY2xlVHlwZSwgcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZG9lc051Y2xpZGVFeGlzdCA9IEF0b21JZGVudGlmaWVyLmRvZXNFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApO1xyXG4gICAgICAgICAgICBjb25zdCBudWNsaWRlRXhpc3RzQm9vbGVhbiA9IGRpcmVjdGlvbiA9PT0gJ3VwJyA/ICFkb2VzTnVjbGlkZUV4aXN0IDogZG9lc051Y2xpZGVFeGlzdDtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGRvZXNQcmV2aW91c051Y2xpZGVFeGlzdCA9IHNlY29uZFBhcnRpY2xlVHlwZSAmJiBkaXJlY3Rpb24gPT09ICdkb3duJyA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFBdG9tSWRlbnRpZmllci5kb2VzUHJldmlvdXNOdWNsaWRlRXhpc3QoIHByb3RvbkNvdW50LCBuZXV0cm9uQ291bnQgKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRPclByZXZpb3VzSXNvRXhpc3RzO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBudWNsaWRlRXhpc3RzQm9vbGVhbiAmJiBkb2VzUHJldmlvdXNOdWNsaWRlRXhpc3QgKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZWNvbmRQYXJ0aWNsZVR5cGUgPyBpc051Y2xlb25Db3VudEF0UmFuZ2VCb3VuZHMoIGRpcmVjdGlvbiwgZmlyc3RQYXJ0aWNsZVR5cGUsIHByb3RvbkNvdW50LCBuZXV0cm9uQ291bnQgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNOdWNsZW9uQ291bnRBdFJhbmdlQm91bmRzKCBkaXJlY3Rpb24sIHNlY29uZFBhcnRpY2xlVHlwZSwgcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApIDpcclxuICAgICAgICAgICAgICAgICAgIGlzTnVjbGVvbkNvdW50QXRSYW5nZUJvdW5kcyggZGlyZWN0aW9uLCBmaXJzdFBhcnRpY2xlVHlwZSwgcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgYXJyb3cgZW5hYmxlZCBwcm9wZXJ0aWVzXHJcbiAgICBjb25zdCBwcm90b25VcEFycm93RW5hYmxlZFByb3BlcnR5ID0gY3JlYXRlQXJyb3dFbmFibGVkUHJvcGVydHkoICd1cCcsIFBhcnRpY2xlVHlwZS5QUk9UT04gKTtcclxuICAgIGNvbnN0IG5ldXRyb25VcEFycm93RW5hYmxlZFByb3BlcnR5ID0gY3JlYXRlQXJyb3dFbmFibGVkUHJvcGVydHkoICd1cCcsIFBhcnRpY2xlVHlwZS5ORVVUUk9OICk7XHJcbiAgICBjb25zdCBkb3VibGVVcEFycm93RW5hYmxlZFByb3BlcnR5ID0gY3JlYXRlQXJyb3dFbmFibGVkUHJvcGVydHkoICd1cCcsIFBhcnRpY2xlVHlwZS5QUk9UT04sIFBhcnRpY2xlVHlwZS5ORVVUUk9OICk7XHJcbiAgICBjb25zdCBwcm90b25Eb3duQXJyb3dFbmFibGVkUHJvcGVydHkgPSBjcmVhdGVBcnJvd0VuYWJsZWRQcm9wZXJ0eSggJ2Rvd24nLCBQYXJ0aWNsZVR5cGUuUFJPVE9OICk7XHJcbiAgICBjb25zdCBuZXV0cm9uRG93bkFycm93RW5hYmxlZFByb3BlcnR5ID0gY3JlYXRlQXJyb3dFbmFibGVkUHJvcGVydHkoICdkb3duJywgUGFydGljbGVUeXBlLk5FVVRST04gKTtcclxuICAgIGNvbnN0IGRvdWJsZURvd25BcnJvd0VuYWJsZWRQcm9wZXJ0eSA9IGNyZWF0ZUFycm93RW5hYmxlZFByb3BlcnR5KCAnZG93bicsIFBhcnRpY2xlVHlwZS5QUk9UT04sIFBhcnRpY2xlVHlwZS5ORVVUUk9OICk7XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBkb3VibGUgYXJyb3cgYnV0dG9uc1xyXG4gICAgY29uc3QgY3JlYXRlRG91YmxlQXJyb3dCdXR0b25zID0gKCBkaXJlY3Rpb246IERvdWJsZUFycm93QnV0dG9uRGlyZWN0aW9uICk6IE5vZGUgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IERvdWJsZUFycm93QnV0dG9uKCBkaXJlY3Rpb24sXHJcbiAgICAgICAgZGlyZWN0aW9uID09PSAndXAnID9cclxuICAgICAgICAoKSA9PiBpbmNyZWFzZU51Y2xlb25Db3VudExpc3RlbmVyKCBQYXJ0aWNsZVR5cGUuUFJPVE9OLCBQYXJ0aWNsZVR5cGUuTkVVVFJPTiApIDpcclxuICAgICAgICAoKSA9PiBkZWNyZWFzZU51Y2xlb25Db3VudExpc3RlbmVyKCBQYXJ0aWNsZVR5cGUuUFJPVE9OLCBQYXJ0aWNsZVR5cGUuTkVVVFJPTiApLFxyXG4gICAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgICBsZWZ0QXJyb3dGaWxsOiBCQU5Db2xvcnMucHJvdG9uQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgIHJpZ2h0QXJyb3dGaWxsOiBCQU5Db2xvcnMubmV1dHJvbkNvbG9yUHJvcGVydHksXHJcbiAgICAgICAgICBlbmFibGVkUHJvcGVydHk6IGRpcmVjdGlvbiA9PT0gJ3VwJyA/IGRvdWJsZVVwQXJyb3dFbmFibGVkUHJvcGVydHkgOiBkb3VibGVEb3duQXJyb3dFbmFibGVkUHJvcGVydHksXHJcbiAgICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IFRPVUNIX0FSRUFfWV9ESUxBVElPTlxyXG4gICAgICAgIH0sIGFycm93QnV0dG9uT3B0aW9ucyApXHJcbiAgICAgICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgZG91YmxlIGFycm93IGJ1dHRvbnNcclxuICAgIGNvbnN0IGRvdWJsZUFycm93QnV0dG9ucyA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGNyZWF0ZURvdWJsZUFycm93QnV0dG9ucyggJ3VwJyApLCBjcmVhdGVEb3VibGVBcnJvd0J1dHRvbnMoICdkb3duJyApIF0sXHJcbiAgICAgIHNwYWNpbmc6IGFycm93QnV0dG9uU3BhY2luZ1xyXG4gICAgfSApO1xyXG4gICAgZG91YmxlQXJyb3dCdXR0b25zLmJvdHRvbSA9IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBCQU5Db25zdGFudHMuU0NSRUVOX1ZJRVdfWV9NQVJHSU47XHJcbiAgICBkb3VibGVBcnJvd0J1dHRvbnMuY2VudGVyWCA9IHRoaXMuYXRvbUNlbnRlci54O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZG91YmxlQXJyb3dCdXR0b25zICk7XHJcblxyXG4gICAgLy8gZnVuY3Rpb25zIHRvIGNyZWF0ZSB0aGUgbGlzdGVuZXJzIHRoYXQgY3JlYXRlIG9yIHJlbW92ZSBhIHBhcnRpY2xlXHJcbiAgICBjb25zdCBpbmNyZWFzZU51Y2xlb25Db3VudExpc3RlbmVyID0gKCBmaXJzdE51Y2xlb25UeXBlOiBQYXJ0aWNsZVR5cGUsIHNlY29uZE51Y2xlb25UeXBlPzogUGFydGljbGVUeXBlICkgPT4ge1xyXG4gICAgICB0aGlzLmNyZWF0ZVBhcnRpY2xlRnJvbVN0YWNrKCBmaXJzdE51Y2xlb25UeXBlICk7XHJcbiAgICAgIGlmICggc2Vjb25kTnVjbGVvblR5cGUgKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVQYXJ0aWNsZUZyb21TdGFjayggc2Vjb25kTnVjbGVvblR5cGUgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGNvbnN0IGRlY3JlYXNlTnVjbGVvbkNvdW50TGlzdGVuZXIgPSAoIGZpcnN0TnVjbGVvblR5cGU6IFBhcnRpY2xlVHlwZSwgc2Vjb25kTnVjbGVvblR5cGU/OiBQYXJ0aWNsZVR5cGUgKSA9PiB7XHJcbiAgICAgIHRoaXMucmV0dXJuUGFydGljbGVUb1N0YWNrKCBmaXJzdE51Y2xlb25UeXBlICk7XHJcbiAgICAgIGlmICggc2Vjb25kTnVjbGVvblR5cGUgKSB7XHJcbiAgICAgICAgdGhpcy5yZXR1cm5QYXJ0aWNsZVRvU3RhY2soIHNlY29uZE51Y2xlb25UeXBlICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBzaW5nbGUgYXJyb3cgYnV0dG9uc1xyXG4gICAgY29uc3QgY3JlYXRlU2luZ2xlQXJyb3dCdXR0b25zID0gKCBudWNsZW9uVHlwZTogUGFydGljbGVUeXBlLCBudWNsZW9uQ29sb3JQcm9wZXJ0eTogUHJvZmlsZUNvbG9yUHJvcGVydHkgKTogTm9kZSA9PiB7XHJcbiAgICAgIGNvbnN0IHNpbmdsZUFycm93QnV0dG9uT3B0aW9ucyA9IG1lcmdlKCB7IGFycm93RmlsbDogbnVjbGVvbkNvbG9yUHJvcGVydHkgfSwgYXJyb3dCdXR0b25PcHRpb25zICk7XHJcbiAgICAgIGNvbnN0IHVwQXJyb3dCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICd1cCcsICgpID0+IGluY3JlYXNlTnVjbGVvbkNvdW50TGlzdGVuZXIoIG51Y2xlb25UeXBlICksXHJcbiAgICAgICAgbWVyZ2UoIHtcclxuICAgICAgICAgICAgZW5hYmxlZFByb3BlcnR5OiBudWNsZW9uVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiA/IHByb3RvblVwQXJyb3dFbmFibGVkUHJvcGVydHkgOiBuZXV0cm9uVXBBcnJvd0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBUT1VDSF9BUkVBX1lfRElMQVRJT05cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzaW5nbGVBcnJvd0J1dHRvbk9wdGlvbnMgKVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBkb3duQXJyb3dCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdkb3duJywgKCkgPT4gZGVjcmVhc2VOdWNsZW9uQ291bnRMaXN0ZW5lciggbnVjbGVvblR5cGUgKSxcclxuICAgICAgICBtZXJnZSgge1xyXG4gICAgICAgICAgICBlbmFibGVkUHJvcGVydHk6IG51Y2xlb25UeXBlID09PSBQYXJ0aWNsZVR5cGUuUFJPVE9OID8gcHJvdG9uRG93bkFycm93RW5hYmxlZFByb3BlcnR5IDogbmV1dHJvbkRvd25BcnJvd0VuYWJsZWRQcm9wZXJ0eSxcclxuICAgICAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiBUT1VDSF9BUkVBX1lfRElMQVRJT05cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzaW5nbGVBcnJvd0J1dHRvbk9wdGlvbnMgKVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgICAgICBjaGlsZHJlbjogWyB1cEFycm93QnV0dG9uLCBkb3duQXJyb3dCdXR0b24gXSxcclxuICAgICAgICBzcGFjaW5nOiBhcnJvd0J1dHRvblNwYWNpbmdcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIHNpbmdsZSBhcnJvdyBidXR0b25zXHJcbiAgICBjb25zdCBwcm90b25BcnJvd0J1dHRvbnMgPSBjcmVhdGVTaW5nbGVBcnJvd0J1dHRvbnMoIFBhcnRpY2xlVHlwZS5QUk9UT04sIEJBTkNvbG9ycy5wcm90b25Db2xvclByb3BlcnR5ICk7XHJcbiAgICBwcm90b25BcnJvd0J1dHRvbnMuYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIEJBTkNvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTjtcclxuICAgIHByb3RvbkFycm93QnV0dG9ucy5yaWdodCA9IGRvdWJsZUFycm93QnV0dG9ucy5sZWZ0IC0gSE9SSVpPTlRBTF9ESVNUQU5DRV9CRVRXRUVOX0FSUk9XX0JVVFRPTlM7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwcm90b25BcnJvd0J1dHRvbnMgKTtcclxuICAgIGNvbnN0IG5ldXRyb25BcnJvd0J1dHRvbnMgPSBjcmVhdGVTaW5nbGVBcnJvd0J1dHRvbnMoIFBhcnRpY2xlVHlwZS5ORVVUUk9OLCBCQU5Db2xvcnMubmV1dHJvbkNvbG9yUHJvcGVydHkgKTtcclxuICAgIG5ldXRyb25BcnJvd0J1dHRvbnMuYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIEJBTkNvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTjtcclxuICAgIG5ldXRyb25BcnJvd0J1dHRvbnMubGVmdCA9IGRvdWJsZUFycm93QnV0dG9ucy5yaWdodCArIEhPUklaT05UQUxfRElTVEFOQ0VfQkVUV0VFTl9BUlJPV19CVVRUT05TO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV1dHJvbkFycm93QnV0dG9ucyApO1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uIHRvIGtlZXAgdHJhY2sgb2Ygd2hlbiBhIGRvdWJsZSBhcnJvdyBidXR0b24gd2FzIGNsaWNrZWRcclxuICAgIGNvbnN0IGNyZWF0ZVNpbmdsZU9yRG91YmxlQXJyb3dCdXR0b25DbGlja2VkTGlzdGVuZXIgPSAoIGlzRG91YmxlQXJyb3dCdXR0b246IGJvb2xlYW4sIGFycm93QnV0dG9uczogTm9kZSApID0+IHtcclxuICAgICAgY29uc3QgYXJyb3dCdXR0b25zQ2hpbGRyZW4gPSBhcnJvd0J1dHRvbnMuZ2V0Q2hpbGRyZW4oKSBhcyBBcnJvd0J1dHRvbltdO1xyXG4gICAgICBhcnJvd0J1dHRvbnNDaGlsZHJlbi5mb3JFYWNoKCBhcnJvd0J1dHRvbiA9PiB7XHJcbiAgICAgICAgYXJyb3dCdXR0b24uYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgICAgIG1vZGVsLmRvdWJsZUFycm93QnV0dG9uQ2xpY2tlZEJvb2xlYW5Qcm9wZXJ0eS52YWx1ZSA9IGlzRG91YmxlQXJyb3dCdXR0b247XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNyZWF0ZVNpbmdsZU9yRG91YmxlQXJyb3dCdXR0b25DbGlja2VkTGlzdGVuZXIoIHRydWUsIGRvdWJsZUFycm93QnV0dG9ucyApO1xyXG4gICAgY3JlYXRlU2luZ2xlT3JEb3VibGVBcnJvd0J1dHRvbkNsaWNrZWRMaXN0ZW5lciggZmFsc2UsIHByb3RvbkFycm93QnV0dG9ucyApO1xyXG4gICAgY3JlYXRlU2luZ2xlT3JEb3VibGVBcnJvd0J1dHRvbkNsaWNrZWRMaXN0ZW5lciggZmFsc2UsIG5ldXRyb25BcnJvd0J1dHRvbnMgKTtcclxuXHJcbiAgICBjb25zdCBudWNsZW9uTGFiZWxUZXh0T3B0aW9ucyA9IHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApLCBtYXhXaWR0aDogMTUwIH07XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIFByb3RvbnMgYW5kIE5ldXRyb25zIGxhYmVsXHJcbiAgICBjb25zdCBwcm90b25zTGFiZWwgPSBuZXcgVGV4dCggQnVpbGRBTnVjbGV1c1N0cmluZ3MucHJvdG9ucywgbnVjbGVvbkxhYmVsVGV4dE9wdGlvbnMgKTtcclxuICAgIHByb3RvbnNMYWJlbC5ib3R0b20gPSBkb3VibGVBcnJvd0J1dHRvbnMuYm90dG9tO1xyXG4gICAgcHJvdG9uc0xhYmVsLmNlbnRlclggPSAoIGRvdWJsZUFycm93QnV0dG9ucy5sZWZ0IC0gcHJvdG9uQXJyb3dCdXR0b25zLnJpZ2h0ICkgLyAyICsgcHJvdG9uQXJyb3dCdXR0b25zLnJpZ2h0O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcHJvdG9uc0xhYmVsICk7XHJcblxyXG4gICAgY29uc3QgbmV1dHJvbnNMYWJlbCA9IG5ldyBUZXh0KCBCdWlsZEFOdWNsZXVzU3RyaW5ncy5uZXV0cm9uc1VwcGVyY2FzZSwgbnVjbGVvbkxhYmVsVGV4dE9wdGlvbnMgKTtcclxuICAgIG5ldXRyb25zTGFiZWwuYm90dG9tID0gZG91YmxlQXJyb3dCdXR0b25zLmJvdHRvbTtcclxuICAgIG5ldXRyb25zTGFiZWwuY2VudGVyWCA9ICggbmV1dHJvbkFycm93QnV0dG9ucy5sZWZ0IC0gZG91YmxlQXJyb3dCdXR0b25zLnJpZ2h0ICkgLyAyICsgZG91YmxlQXJyb3dCdXR0b25zLnJpZ2h0O1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV1dHJvbnNMYWJlbCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBOdWNsZW9uQ3JlYXRvck5vZGUgZm9yIHRoZSBwcm90b25zXHJcbiAgICB0aGlzLnByb3RvbnNDcmVhdG9yTm9kZSA9IG5ldyBOdWNsZW9uQ3JlYXRvck5vZGU8UGFydGljbGVBdG9tIHwgUGFydGljbGVOdWNsZXVzPiggUGFydGljbGVUeXBlLlBST1RPTiwgdGhpcywgb3B0aW9ucy5wYXJ0aWNsZVZpZXdQb3NpdGlvblZlY3RvciApO1xyXG4gICAgdGhpcy5wcm90b25zQ3JlYXRvck5vZGUudG9wID0gZG91YmxlQXJyb3dCdXR0b25zLnRvcDtcclxuICAgIHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlLmNlbnRlclggPSBwcm90b25zTGFiZWwuY2VudGVyWDtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuZCBhZGQgdGhlIE51Y2xlb25DcmVhdG9yTm9kZSBmb3IgdGhlIG5ldXRyb25zXHJcbiAgICB0aGlzLm5ldXRyb25zQ3JlYXRvck5vZGUgPSBuZXcgTnVjbGVvbkNyZWF0b3JOb2RlPFBhcnRpY2xlQXRvbSB8IFBhcnRpY2xlTnVjbGV1cz4oIFBhcnRpY2xlVHlwZS5ORVVUUk9OLCB0aGlzLCBvcHRpb25zLnBhcnRpY2xlVmlld1Bvc2l0aW9uVmVjdG9yICk7XHJcbiAgICB0aGlzLm5ldXRyb25zQ3JlYXRvck5vZGUudG9wID0gZG91YmxlQXJyb3dCdXR0b25zLnRvcDtcclxuICAgIHRoaXMubmV1dHJvbnNDcmVhdG9yTm9kZS5jZW50ZXJYID0gbmV1dHJvbnNMYWJlbC5jZW50ZXJYO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5uZXV0cm9uc0NyZWF0b3JOb2RlICk7XHJcblxyXG4gICAgdGhpcy5wcm90b25zQ3JlYXRvck5vZGVNb2RlbENlbnRlciA9IHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlLmNlbnRlci5taW51cyggb3B0aW9ucy5wYXJ0aWNsZVZpZXdQb3NpdGlvblZlY3RvciApO1xyXG4gICAgdGhpcy5uZXV0cm9uc0NyZWF0b3JOb2RlTW9kZWxDZW50ZXIgPSB0aGlzLm5ldXRyb25zQ3JlYXRvck5vZGUuY2VudGVyLm1pbnVzKCBvcHRpb25zLnBhcnRpY2xlVmlld1Bvc2l0aW9uVmVjdG9yICk7XHJcblxyXG4gICAgdGhpcy5yZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLm1heFggLSBCQU5Db25zdGFudHMuU0NSRUVOX1ZJRVdfWF9NQVJHSU4sXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIEJBTkNvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTlxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5yZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIGNvbnN0IHVzZXJDb250cm9sbGVkTGlzdGVuZXIgPSAoIGlzVXNlckNvbnRyb2xsZWQ6IGJvb2xlYW4sIHBhcnRpY2xlOiBQYXJ0aWNsZSApID0+IHtcclxuICAgICAgaWYgKCBpc1VzZXJDb250cm9sbGVkICYmIHRoaXMubW9kZWwucGFydGljbGVBdG9tLmNvbnRhaW5zUGFydGljbGUoIHBhcnRpY2xlICkgKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggaXNVc2VyQ29udHJvbGxlZCAmJiBwYXJ0aWNsZS50eXBlID09PSBQYXJ0aWNsZVR5cGUuUFJPVE9OLm5hbWUudG9Mb3dlckNhc2UoKSAmJiAhdGhpcy5tb2RlbC51c2VyQ29udHJvbGxlZFByb3RvbnMuaW5jbHVkZXMoIHBhcnRpY2xlICkgKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC51c2VyQ29udHJvbGxlZFByb3RvbnMuYWRkKCBwYXJ0aWNsZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhaXNVc2VyQ29udHJvbGxlZCAmJiBwYXJ0aWNsZS50eXBlID09PSBQYXJ0aWNsZVR5cGUuUFJPVE9OLm5hbWUudG9Mb3dlckNhc2UoKSAmJiB0aGlzLm1vZGVsLnVzZXJDb250cm9sbGVkUHJvdG9ucy5pbmNsdWRlcyggcGFydGljbGUgKSApIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnVzZXJDb250cm9sbGVkUHJvdG9ucy5yZW1vdmUoIHBhcnRpY2xlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGlzVXNlckNvbnRyb2xsZWQgJiYgcGFydGljbGUudHlwZSA9PT0gUGFydGljbGVUeXBlLk5FVVRST04ubmFtZS50b0xvd2VyQ2FzZSgpICYmICF0aGlzLm1vZGVsLnVzZXJDb250cm9sbGVkTmV1dHJvbnMuaW5jbHVkZXMoIHBhcnRpY2xlICkgKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbC51c2VyQ29udHJvbGxlZE5ldXRyb25zLmFkZCggcGFydGljbGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICggIWlzVXNlckNvbnRyb2xsZWQgJiYgcGFydGljbGUudHlwZSA9PT0gUGFydGljbGVUeXBlLk5FVVRST04ubmFtZS50b0xvd2VyQ2FzZSgpICYmIHRoaXMubW9kZWwudXNlckNvbnRyb2xsZWROZXV0cm9ucy5pbmNsdWRlcyggcGFydGljbGUgKSApIHtcclxuICAgICAgICB0aGlzLm1vZGVsLnVzZXJDb250cm9sbGVkTmV1dHJvbnMucmVtb3ZlKCBwYXJ0aWNsZSApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGNvbnZlcnQgc3RyaW5nIHBhcnRpY2xlIHR5cGUgdG8gYSBQYXJ0aWNsZVR5cGVcclxuICAgIGNvbnN0IGdldFBhcnRpY2xlVHlwZUZyb21TdHJpbmdUeXBlID0gKCBwYXJ0aWNsZVR5cGVTdHJpbmc6IHN0cmluZyApID0+IHtcclxuICAgICAgY29uc3QgcGFydGljbGVUeXBlID0gcGFydGljbGVUeXBlU3RyaW5nID09PSBQYXJ0aWNsZVR5cGUuUFJPVE9OLm5hbWUudG9Mb3dlckNhc2UoKSA/IFBhcnRpY2xlVHlwZS5QUk9UT04gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNsZVR5cGVTdHJpbmcgPT09IFBhcnRpY2xlVHlwZS5ORVVUUk9OLm5hbWUudG9Mb3dlckNhc2UoKSA/IFBhcnRpY2xlVHlwZS5ORVVUUk9OIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljbGVUeXBlU3RyaW5nID09PSBQYXJ0aWNsZVR5cGUuRUxFQ1RST04ubmFtZS50b0xvd2VyQ2FzZSgpID8gUGFydGljbGVUeXBlLkVMRUNUUk9OIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljbGVUeXBlU3RyaW5nID09PSBQYXJ0aWNsZVR5cGUuUE9TSVRST04ubmFtZS50b0xvd2VyQ2FzZSgpID8gUGFydGljbGVUeXBlLlBPU0lUUk9OIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGFydGljbGVUeXBlICE9PSBudWxsLCBgUGFydGljbGUgdHlwZSAke3BhcnRpY2xlVHlwZVN0cmluZ30gaXMgbm90IGEgdmFsaWQgcGFydGljbGUgdHlwZS5gICk7XHJcbiAgICAgIHJldHVybiBwYXJ0aWNsZVR5cGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGFkZCBQYXJ0aWNsZVZpZXcncyB0byBtYXRjaCB0aGUgbW9kZWxcclxuICAgIHRoaXMubW9kZWwucGFydGljbGVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyKCAoIHBhcnRpY2xlOiBQYXJ0aWNsZSApID0+IHtcclxuICAgICAgY29uc3QgcGFydGljbGVWaWV3ID0gbmV3IFBhcnRpY2xlVmlldyggcGFydGljbGUsXHJcbiAgICAgICAgTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlTWFwcGluZyggVmVjdG9yMi5aRVJPLCBvcHRpb25zLnBhcnRpY2xlVmlld1Bvc2l0aW9uVmVjdG9yLCAxICkgKTtcclxuXHJcbiAgICAgIHRoaXMucGFydGljbGVWaWV3TWFwWyBwYXJ0aWNsZVZpZXcucGFydGljbGUuaWQgXSA9IHBhcnRpY2xlVmlldztcclxuICAgICAgdGhpcy5hZGRQYXJ0aWNsZVZpZXcoIHBhcnRpY2xlICk7XHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlVHlwZSA9IGdldFBhcnRpY2xlVHlwZUZyb21TdHJpbmdUeXBlKCBwYXJ0aWNsZS50eXBlICk7XHJcblxyXG4gICAgICBpZiAoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiB8fCBwYXJ0aWNsZVR5cGUgPT09IFBhcnRpY2xlVHlwZS5ORVVUUk9OICkge1xyXG5cclxuICAgICAgICAvLyBjYWxsZWQgd2hlbiBhIG51Y2xlb24gaXMgZmluaXNoZWQgYmVpbmcgZHJhZ2dlZFxyXG4gICAgICAgIHBhcnRpY2xlLmRyYWdFbmRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHsgdGhpcy5kcmFnRW5kZWRMaXN0ZW5lciggcGFydGljbGUsIHRoaXMubW9kZWwucGFydGljbGVBdG9tICk7IH0gKTtcclxuICAgICAgICB0aGlzLmNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlSW52aXNpYmxlKCBwYXJ0aWNsZVR5cGUgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVE9ETzogdW5saW5rIHVzZXJDb250cm9sbGVkTGlzdGVuZXJcclxuICAgICAgcGFydGljbGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCBpc1VzZXJDb250cm9sbGVkID0+IHVzZXJDb250cm9sbGVkTGlzdGVuZXIoIGlzVXNlckNvbnRyb2xsZWQsIHBhcnRpY2xlICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByZW1vdmUgUGFydGljbGVWaWV3J3MgdG8gbWF0Y2ggdGhlIG1vZGVsXHJcbiAgICB0aGlzLm1vZGVsLnBhcnRpY2xlcy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCAoIHBhcnRpY2xlOiBQYXJ0aWNsZSApID0+IHtcclxuICAgICAgY29uc3QgcGFydGljbGVWaWV3ID0gdGhpcy5maW5kUGFydGljbGVWaWV3KCBwYXJ0aWNsZSApO1xyXG5cclxuICAgICAgcGFydGljbGUuZHJhZ0VuZGVkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICAgIHBhcnRpY2xlLmFuaW1hdGlvbkVuZGVkRW1pdHRlci5kaXNwb3NlKCk7XHJcblxyXG4gICAgICBkZWxldGUgdGhpcy5wYXJ0aWNsZVZpZXdNYXBbIHBhcnRpY2xlVmlldy5wYXJ0aWNsZS5pZCBdO1xyXG5cclxuICAgICAgcGFydGljbGVWaWV3LmRpc3Bvc2UoKTtcclxuICAgICAgcGFydGljbGUuZGlzcG9zZSgpO1xyXG5cclxuICAgICAgY29uc3QgcGFydGljbGVUeXBlID0gZ2V0UGFydGljbGVUeXBlRnJvbVN0cmluZ1R5cGUoIHBhcnRpY2xlLnR5cGUgKTtcclxuXHJcbiAgICAgIGlmICggcGFydGljbGVUeXBlID09PSBQYXJ0aWNsZVR5cGUuUFJPVE9OIHx8IHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLk5FVVRST04gKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja0lmQ3JlYXRvck5vZGVTaG91bGRCZVZpc2libGUoIHBhcnRpY2xlVHlwZSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wYXJ0aWNsZUF0b21Ob2RlID0gbmV3IFBhcnRpY2xlQXRvbU5vZGUoIHRoaXMucGFydGljbGVWaWV3TWFwLCB0aGlzLmF0b21DZW50ZXIsIHRoaXMubW9kZWwucHJvdG9uQ291bnRSYW5nZSApO1xyXG5cclxuICAgIC8vIGZvciB1c2UgaW4gcG9zaXRpb25pbmdcclxuICAgIHRoaXMuZG91YmxlQXJyb3dCdXR0b25zID0gZG91YmxlQXJyb3dCdXR0b25zO1xyXG4gICAgdGhpcy5wcm90b25BcnJvd0J1dHRvbnMgPSBwcm90b25BcnJvd0J1dHRvbnM7XHJcbiAgICB0aGlzLm5ldXRyb25BcnJvd0J1dHRvbnMgPSBuZXV0cm9uQXJyb3dCdXR0b25zO1xyXG5cclxuICAgIC8vIGFkZCBpbml0aWFsIG5ldXRyb25zIGFuZCBwcm90b25zIHNwZWNpZmllZCBieSB0aGUgcXVlcnkgcGFyYW1ldGVycyB0byB0aGUgYXRvbVxyXG4gICAgXy50aW1lcyggTWF0aC5tYXgoIEJBTlF1ZXJ5UGFyYW1ldGVycy5uZXV0cm9ucywgQkFOUXVlcnlQYXJhbWV0ZXJzLnByb3RvbnMgKSwgKCkgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMubW9kZWwucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LnZhbHVlIDwgQkFOUXVlcnlQYXJhbWV0ZXJzLm5ldXRyb25zICkge1xyXG4gICAgICAgIHRoaXMuYWRkTnVjbGVvbkltbWVkaWF0ZWx5VG9BdG9tKCBQYXJ0aWNsZVR5cGUuTkVVVFJPTiApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZSA8IEJBTlF1ZXJ5UGFyYW1ldGVycy5wcm90b25zICkge1xyXG4gICAgICAgIHRoaXMuYWRkTnVjbGVvbkltbWVkaWF0ZWx5VG9BdG9tKCBQYXJ0aWNsZVR5cGUuUFJPVE9OICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGNsb3VkIHNpemUgYXMgdGhlIG1hc3NOdW1iZXIgY2hhbmdlc1xyXG4gICAgbW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHkubGluayggcHJvdG9uQ291bnQgPT4gdGhpcy5wYXJ0aWNsZUF0b21Ob2RlLnVwZGF0ZUNsb3VkU2l6ZSggcHJvdG9uQ291bnQsIDAuMjcsIDEwLCAyMCApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXQgaW5mb3JtYXRpb24gZm9yIGEgc3BlY2lmaWMgcGFydGljbGUgdHlwZS5cclxuICAgKi9cclxuICBwcml2YXRlIGdldEluZm9Gb3JQYXJ0aWNsZVR5cGUoIHBhcnRpY2xlVHlwZTogUGFydGljbGVUeXBlICk6IFBhcnRpY2xlVHlwZUluZm8ge1xyXG4gICAgY29uc3QgbWF4Q291bnQgPSBwYXJ0aWNsZVR5cGUgPT09IFBhcnRpY2xlVHlwZS5QUk9UT04gPyB0aGlzLm1vZGVsLnByb3RvbkNvdW50UmFuZ2UubWF4IDogdGhpcy5tb2RlbC5uZXV0cm9uQ291bnRSYW5nZS5tYXg7XHJcbiAgICBjb25zdCBjcmVhdG9yTm9kZSA9IHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiA/IHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlIDogdGhpcy5uZXV0cm9uc0NyZWF0b3JOb2RlO1xyXG4gICAgY29uc3QgbnVtYmVyT2ZOdWNsZW9ucyA9IFsgLi4udGhpcy5tb2RlbC5wYXJ0aWNsZXMgXVxyXG4gICAgICAuZmlsdGVyKCBwYXJ0aWNsZSA9PiBwYXJ0aWNsZS50eXBlID09PSBwYXJ0aWNsZVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpICkubGVuZ3RoO1xyXG4gICAgY29uc3Qgb3V0Z29pbmdOdWNsZW9ucyA9IFsgLi4udGhpcy5tb2RlbC5vdXRnb2luZ1BhcnRpY2xlcyBdXHJcbiAgICAgIC5maWx0ZXIoIHBhcnRpY2xlID0+IHBhcnRpY2xlLnR5cGUgPT09IHBhcnRpY2xlVHlwZS5uYW1lLnRvTG93ZXJDYXNlKCkgKS5sZW5ndGg7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbWF4Q291bnQ6IG1heENvdW50LFxyXG4gICAgICBjcmVhdG9yTm9kZTogY3JlYXRvck5vZGUsXHJcbiAgICAgIG51bWJlck9mTnVjbGVvbnM6IG51bWJlck9mTnVjbGVvbnMsXHJcbiAgICAgIG91dGdvaW5nTnVjbGVvbnM6IG91dGdvaW5nTnVjbGVvbnNcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIaWRlcyB0aGUgZ2l2ZW4gY3JlYXRvciBub2RlIGlmIHRoZSBjb3VudCBmb3IgdGhhdCBudWNsZW9uIHR5cGUgaGFzIHJlYWNoZWQgaXRzIG1heC5cclxuICAgKi9cclxuICBwdWJsaWMgY2hlY2tJZkNyZWF0b3JOb2RlU2hvdWxkQmVJbnZpc2libGUoIHBhcnRpY2xlVHlwZTogUGFydGljbGVUeXBlICk6IHZvaWQge1xyXG4gICAgY29uc3QgaW5mb0ZvclBhcnRpY2xlVHlwZSA9IHRoaXMuZ2V0SW5mb0ZvclBhcnRpY2xlVHlwZSggcGFydGljbGVUeXBlICk7XHJcblxyXG4gICAgaWYgKCAoIGluZm9Gb3JQYXJ0aWNsZVR5cGUubnVtYmVyT2ZOdWNsZW9ucyAtIGluZm9Gb3JQYXJ0aWNsZVR5cGUub3V0Z29pbmdOdWNsZW9ucyApID49IGluZm9Gb3JQYXJ0aWNsZVR5cGUubWF4Q291bnQgKSB7XHJcbiAgICAgIEJBTlNjcmVlblZpZXcuc2V0Q3JlYXRvck5vZGVWaXNpYmlsaXR5KCBpbmZvRm9yUGFydGljbGVUeXBlLmNyZWF0b3JOb2RlLCBmYWxzZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvd3MgdGhlIGdpdmVuIGNyZWF0b3Igbm9kZSBpZiB0aGUgY291bnQgZm9yIHRoYXQgbnVjbGVvbiB0eXBlIGlzIGJlbG93IGl0cyBtYXguXHJcbiAgICovXHJcbiAgcHVibGljIGNoZWNrSWZDcmVhdG9yTm9kZVNob3VsZEJlVmlzaWJsZSggcGFydGljbGVUeXBlOiBQYXJ0aWNsZVR5cGUgKTogdm9pZCB7XHJcbiAgICBjb25zdCBpbmZvRm9yUGFydGljbGVUeXBlID0gdGhpcy5nZXRJbmZvRm9yUGFydGljbGVUeXBlKCBwYXJ0aWNsZVR5cGUgKTtcclxuXHJcbiAgICBpZiAoICggaW5mb0ZvclBhcnRpY2xlVHlwZS5udW1iZXJPZk51Y2xlb25zIC0gaW5mb0ZvclBhcnRpY2xlVHlwZS5vdXRnb2luZ051Y2xlb25zICkgPCBpbmZvRm9yUGFydGljbGVUeXBlLm1heENvdW50ICkge1xyXG4gICAgICBCQU5TY3JlZW5WaWV3LnNldENyZWF0b3JOb2RlVmlzaWJpbGl0eSggaW5mb0ZvclBhcnRpY2xlVHlwZS5jcmVhdG9yTm9kZSwgdHJ1ZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGFuZCBhZGQgYSBudWNsZW9uIG9mIHBhcnRpY2xlVHlwZSBpbW1lZGlhdGVseSB0byB0aGUgcGFydGljbGVBdG9tLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGROdWNsZW9uSW1tZWRpYXRlbHlUb0F0b20oIHBhcnRpY2xlVHlwZTogUGFydGljbGVUeXBlICk6IHZvaWQge1xyXG4gICAgY29uc3QgcGFydGljbGUgPSBuZXcgUGFydGljbGUoIHBhcnRpY2xlVHlwZS5uYW1lLnRvTG93ZXJDYXNlKCksIHtcclxuICAgICAgbWF4WkxheWVyOiBCQU5Db25zdGFudHMuTlVNQkVSX09GX05VQ0xFT05fTEFZRVJTIC0gMVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBsYWNlIHRoZSBwYXJ0aWNsZSB0aGUgY2VudGVyIG9mIHRoZSBwYXJ0aWNsZUF0b20gYW5kIGFkZCBpdCB0byB0aGUgbW9kZWwgYW5kIHBhcnRpY2xlQXRvbVxyXG4gICAgcGFydGljbGUuc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiggdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy5tb2RlbC5hZGRQYXJ0aWNsZSggcGFydGljbGUgKTtcclxuICAgIHRoaXMubW9kZWwucGFydGljbGVBdG9tLmFkZFBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBpbnB1dCBlbmFibGVkIGFuZCB2aXNpYmlsaXR5IG9mIGEgY3JlYXRvciBub2RlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc3RhdGljIHNldENyZWF0b3JOb2RlVmlzaWJpbGl0eSggY3JlYXRvck5vZGU6IE5vZGUsIHZpc2libGU6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBpZiAoIGNyZWF0b3JOb2RlLnZpc2libGUgIT09IHZpc2libGUgKSB7XHJcbiAgICAgIGNyZWF0b3JOb2RlLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgICBjcmVhdG9yTm9kZS5pbnB1dEVuYWJsZWQgPSB2aXNpYmxlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgcGFydGljbGUgb2YgcGFydGljbGVUeXBlIGF0IGl0cyBjcmVhdG9yIG5vZGUgYW5kIHNlbmQgaXQgKGFuZCBhZGQgaXQpIHRvIHRoZSBwYXJ0aWNsZUF0b20uXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZVBhcnRpY2xlRnJvbVN0YWNrKCBwYXJ0aWNsZVR5cGU6IFBhcnRpY2xlVHlwZSApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBjcmVhdGUgYSBwYXJ0aWNsZSBhdCB0aGUgY2VudGVyIG9mIGl0cyBjcmVhdG9yIG5vZGVcclxuICAgIGNvbnN0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKCBwYXJ0aWNsZVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpLCB7XHJcbiAgICAgIG1heFpMYXllcjogQkFOQ29uc3RhbnRzLk5VTUJFUl9PRl9OVUNMRU9OX0xBWUVSUyAtIDFcclxuICAgIH0gKTtcclxuICAgIHBhcnRpY2xlLmFuaW1hdGlvblZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBCQU5Db25zdGFudHMuUEFSVElDTEVfQU5JTUFUSU9OX1NQRUVEO1xyXG4gICAgY29uc3Qgb3JpZ2luID0gcGFydGljbGVUeXBlID09PSBQYXJ0aWNsZVR5cGUuUFJPVE9OID9cclxuICAgICAgICAgICAgICAgICAgIHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlTW9kZWxDZW50ZXIgOiB0aGlzLm5ldXRyb25zQ3JlYXRvck5vZGVNb2RlbENlbnRlcjtcclxuICAgIHBhcnRpY2xlLnNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24oIG9yaWdpbiApO1xyXG5cclxuICAgIC8vIHNlbmQgdGhlIHBhcnRpY2xlIHRoZSBjZW50ZXIgb2YgdGhlIHBhcnRpY2xlQXRvbSBhbmQgYWRkIGl0IHRvIHRoZSBtb2RlbFxyXG4gICAgcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMubW9kZWwuZ2V0UGFydGljbGVEZXN0aW5hdGlvbiggcGFydGljbGVUeXBlLCBwYXJ0aWNsZSApO1xyXG4gICAgdGhpcy5tb2RlbC5hZGRQYXJ0aWNsZSggcGFydGljbGUgKTtcclxuXHJcbiAgICAvLyBkb24ndCBsZXQgdGhlIHBhcnRpY2xlIGJlIGNsaWNrZWQgdW50aWwgaXQgcmVhY2hlcyB0aGUgcGFydGljbGVBdG9tXHJcbiAgICBjb25zdCBwYXJ0aWNsZVZpZXcgPSB0aGlzLmZpbmRQYXJ0aWNsZVZpZXcoIHBhcnRpY2xlICk7XHJcbiAgICBwYXJ0aWNsZVZpZXcuaW5wdXRFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCBwYXJ0aWNsZVR5cGUgPT09IFBhcnRpY2xlVHlwZS5QUk9UT04gKSB7XHJcbiAgICAgIHRoaXMubW9kZWwuaW5jb21pbmdQcm90b25zLnB1c2goIHBhcnRpY2xlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5tb2RlbC5pbmNvbWluZ05ldXRyb25zLnB1c2goIHBhcnRpY2xlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gYWRkIHRoZSBwYXJ0aWNsZSB0byB0aGUgcGFydGljbGVBdG9tIG9uY2UgaXQgcmVhY2hlcyB0aGUgY2VudGVyIG9mIHRoZSBwYXJ0aWNsZUF0b20gYW5kIGFsbG93IGl0IHRvIGJlIGNsaWNrZWRcclxuICAgIHBhcnRpY2xlLmFuaW1hdGlvbkVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBpZiAoICF0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5jb250YWluc1BhcnRpY2xlKCBwYXJ0aWNsZSApICkge1xyXG5cclxuICAgICAgICAvLyBtdXN0IHJlbW92ZSBpbmNvbWluZyBwYXJ0aWNsZXMgYmVmb3JlIGFkZGluZyBpdCB0byBwYXJ0aWNsZUF0b20gc28gaW5jb21pbmcgY291bnQgaXMgYWNjdXJhdGVcclxuICAgICAgICBpZiAoIHBhcnRpY2xlVHlwZSA9PT0gUGFydGljbGVUeXBlLlBST1RPTiApIHtcclxuICAgICAgICAgIGFycmF5UmVtb3ZlKCB0aGlzLm1vZGVsLmluY29taW5nUHJvdG9ucywgcGFydGljbGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhcnJheVJlbW92ZSggdGhpcy5tb2RlbC5pbmNvbWluZ05ldXRyb25zLCBwYXJ0aWNsZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20uYWRkUGFydGljbGUoIHBhcnRpY2xlICk7XHJcbiAgICAgICAgcGFydGljbGVWaWV3LmlucHV0RW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgcGFydGljbGUuYW5pbWF0aW9uRW5kZWRFbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgYSBwYXJ0aWNsZSBvZiBwYXJ0aWNsZVR5cGUgZnJvbSB0aGUgcGFydGljbGVBdG9tIGFuZCBzZW5kIGl0IGJhY2sgdG8gaXRzIGNyZWF0b3Igbm9kZS5cclxuICAgKi9cclxuICBwdWJsaWMgcmV0dXJuUGFydGljbGVUb1N0YWNrKCBwYXJ0aWNsZVR5cGU6IFBhcnRpY2xlVHlwZSApOiB2b2lkIHtcclxuICAgIGNvbnN0IGNyZWF0b3JOb2RlUG9zaXRpb24gPSBwYXJ0aWNsZVR5cGUgPT09IFBhcnRpY2xlVHlwZS5QUk9UT04gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvdG9uc0NyZWF0b3JOb2RlTW9kZWxDZW50ZXIgOiB0aGlzLm5ldXRyb25zQ3JlYXRvck5vZGVNb2RlbENlbnRlcjtcclxuXHJcbiAgICBjb25zdCBwYXJ0aWNsZVRvUmV0dXJuID0gdGhpcy5tb2RlbC5nZXRQYXJ0aWNsZVRvUmV0dXJuKCBwYXJ0aWNsZVR5cGUsIGNyZWF0b3JOb2RlUG9zaXRpb24gKTtcclxuXHJcbiAgICAvLyByZW1vdmUgdGhlIHBhcnRpY2xlIGZyb20gdGhlIHBhcnRpY2xlQXRvbSBhbmQgc2VuZCBpdCBiYWNrIHRvIGl0cyBjcmVhdG9yIG5vZGUgcG9zaXRpb25cclxuICAgIHRoaXMubW9kZWwucGFydGljbGVBdG9tLnJlbW92ZVBhcnRpY2xlKCBwYXJ0aWNsZVRvUmV0dXJuICk7XHJcbiAgICB0aGlzLmFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSggcGFydGljbGVUb1JldHVybiwgY3JlYXRvck5vZGVQb3NpdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZSBwYXJ0aWNsZSB0byB0aGUgZ2l2ZW4gZGVzdGluYXRpb24gYW5kIHRoZW4gcmVtb3ZlIGl0LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhbmltYXRlQW5kUmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlOiBQYXJ0aWNsZSwgZGVzdGluYXRpb24/OiBWZWN0b3IyICk6IHZvaWQge1xyXG4gICAgY29uc3QgcGFydGljbGVWaWV3ID0gdGhpcy5maW5kUGFydGljbGVWaWV3KCBwYXJ0aWNsZSApO1xyXG4gICAgcGFydGljbGVWaWV3LmlucHV0RW5hYmxlZCA9IGZhbHNlO1xyXG5cclxuICAgIGlmICggZGVzdGluYXRpb24gKSB7XHJcbiAgICAgIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkudmFsdWUgPSBkZXN0aW5hdGlvbjtcclxuXHJcbiAgICAgIHBhcnRpY2xlLmFuaW1hdGlvbkVuZGVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIHRoZSBnaXZlbiBwYXJ0aWNsZSBmcm9tIHRoZSBtb2RlbC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgcmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlOiBQYXJ0aWNsZSApOiB2b2lkIHtcclxuICAgIHRoaXMubW9kZWwub3V0Z29pbmdQYXJ0aWNsZXMuaW5jbHVkZXMoIHBhcnRpY2xlICkgJiYgdGhpcy5tb2RlbC5vdXRnb2luZ1BhcnRpY2xlcy5yZW1vdmUoIHBhcnRpY2xlICk7XHJcbiAgICB0aGlzLm1vZGVsLnJlbW92ZVBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgcGFydGljbGUgdG8gdGhlIG1vZGVsIGFuZCBpbW1lZGlhdGVseSBzdGFydCBkcmFnZ2luZyBpdCB3aXRoIHRoZSBwcm92aWRlZCBldmVudC5cclxuICAgKi9cclxuICBwdWJsaWMgYWRkQW5kRHJhZ1BhcnRpY2xlKCBldmVudDogUHJlc3NMaXN0ZW5lckV2ZW50LCBwYXJ0aWNsZTogUGFydGljbGUgKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vZGVsLmFkZFBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gICAgY29uc3QgcGFydGljbGVWaWV3ID0gdGhpcy5maW5kUGFydGljbGVWaWV3KCBwYXJ0aWNsZSApO1xyXG4gICAgcGFydGljbGVWaWV3LnN0YXJ0U3ludGhldGljRHJhZyggZXZlbnQgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBjb25zdCBwcm90b25Db3VudCA9IHRoaXMubW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBuZXV0cm9uQ291bnQgPSB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBpZiAoICF0aGlzLm1vZGVsLmRvZXNOdWNsaWRlRXhpc3RCb29sZWFuUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMudGltZVNpbmNlQ291bnRkb3duU3RhcnRlZCArPSBkdDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLnRpbWVTaW5jZUNvdW50ZG93blN0YXJ0ZWQgPSAwO1xyXG5cclxuICAgICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgb2xkIHZhbHVlcyBvZiBwcm90b25Db3VudFByb3BlcnR5IGFuZCBuZXV0cm9uQ291bnRQcm9wZXJ0eSB0byBrbm93IHdoaWNoIHZhbHVlIGluY3JlYXNlZFxyXG4gICAgICB0aGlzLnByZXZpb3VzUHJvdG9uQ291bnQgPSBwcm90b25Db3VudDtcclxuICAgICAgdGhpcy5wcmV2aW91c05ldXRyb25Db3VudCA9IG5ldXRyb25Db3VudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBzaG93IHRoZSBudWNsaWRlIHRoYXQgZG9lcyBub3QgZXhpc3QgZm9yIG9uZSBzZWNvbmQsIHRoZW4gcmV0dXJuIHRoZSBuZWNlc3NhcnkgcGFydGljbGVzXHJcbiAgICBpZiAoIHRoaXMudGltZVNpbmNlQ291bnRkb3duU3RhcnRlZCA+PSBCQU5Db25zdGFudHMuVElNRV9UT19TSE9XX0RPRVNfTk9UX0VYSVNUICkge1xyXG4gICAgICB0aGlzLnRpbWVTaW5jZUNvdW50ZG93blN0YXJ0ZWQgPSAwO1xyXG5cclxuICAgICAgLy8gVE9ETzogY2hhbmdlIHRoaXMgYmVjYXVzZSBpdCBpcyBhIGJpdCBoYWNreSwgdXNlcyBhIGJvb2xlYW4gcHJvcGVydHkgdG8ga2VlcCB0cmFjayBvZiBpZiBhIGRvdWJsZSBhcnJvdyBidXR0b25cclxuICAgICAgLy8gIHdhcyBjbGlja2VkXHJcbiAgICAgIC8vIGEgcHJvdG9uIGFuZCBuZXV0cm9uIHdlcmUgYWRkZWQgdG8gY3JlYXRlIGEgbnVjbGlkZSB0aGF0IGRvZXMgbm90IGV4aXN0LCBzbyByZXR1cm4gYSBwcm90b24gYW5kIG5ldXRyb25cclxuICAgICAgaWYgKCB0aGlzLm1vZGVsLmRvdWJsZUFycm93QnV0dG9uQ2xpY2tlZEJvb2xlYW5Qcm9wZXJ0eS52YWx1ZSAmJlxyXG4gICAgICAgICAgIEF0b21JZGVudGlmaWVyLmRvZXNQcmV2aW91c051Y2xpZGVFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApICkge1xyXG4gICAgICAgIHRoaXMucmV0dXJuUGFydGljbGVUb1N0YWNrKCBQYXJ0aWNsZVR5cGUuTkVVVFJPTiApO1xyXG4gICAgICAgIHRoaXMucmV0dXJuUGFydGljbGVUb1N0YWNrKCBQYXJ0aWNsZVR5cGUuUFJPVE9OICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHRoZSBuZXV0cm9uQ291bnQgaW5jcmVhc2VkIHRvIGNyZWF0ZSBhIG51Y2xpZGUgdGhhdCBkb2VzIG5vdCBleGlzdCwgc28gcmV0dXJuIGEgbmV1dHJvbiB0byB0aGUgc3RhY2tcclxuICAgICAgZWxzZSBpZiAoIHRoaXMucHJldmlvdXNOZXV0cm9uQ291bnQgPCBuZXV0cm9uQ291bnQgJiZcclxuICAgICAgICAgICAgICAgIEF0b21JZGVudGlmaWVyLmRvZXNQcmV2aW91c0lzb3RvcGVFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApICkge1xyXG4gICAgICAgIHRoaXMucmV0dXJuUGFydGljbGVUb1N0YWNrKCBQYXJ0aWNsZVR5cGUuTkVVVFJPTiApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0aGUgcHJvdG9uQ291bnQgaW5jcmVhc2VkIHRvIGNyZWF0ZSBhIG51Y2xpZGUgdGhhdCBkb2VzIG5vdCBleGlzdCwgc28gcmV0dXJuIGEgcHJvdG9uIHRvIHRoZSBzdGFja1xyXG4gICAgICBlbHNlIGlmICggdGhpcy5wcmV2aW91c1Byb3RvbkNvdW50IDwgcHJvdG9uQ291bnQgJiZcclxuICAgICAgICAgICAgICAgIEF0b21JZGVudGlmaWVyLmRvZXNQcmV2aW91c0lzb3RvbmVFeGlzdCggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApICkge1xyXG4gICAgICAgIHRoaXMucmV0dXJuUGFydGljbGVUb1N0YWNrKCBQYXJ0aWNsZVR5cGUuUFJPVE9OICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGEgUGFydGljbGUsIGZpbmQgb3VyIGN1cnJlbnQgZGlzcGxheSAoUGFydGljbGVWaWV3KSBvZiBpdC5cclxuICAgKi9cclxuICBwdWJsaWMgZmluZFBhcnRpY2xlVmlldyggcGFydGljbGU6IFBhcnRpY2xlICk6IFBhcnRpY2xlVmlldyB7XHJcbiAgICBjb25zdCBwYXJ0aWNsZVZpZXcgPSB0aGlzLnBhcnRpY2xlVmlld01hcFsgcGFydGljbGUuaWQgXTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcnRpY2xlVmlldywgJ0RpZCBub3QgZmluZCBtYXRjaGluZyBQYXJ0aWNsZVZpZXcgZm9yIHR5cGUgJyArIHBhcnRpY2xlLnR5cGUgKyAnIGFuZCBpZCAnICsgcGFydGljbGUuaWQgKTtcclxuICAgIHJldHVybiBwYXJ0aWNsZVZpZXc7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZWZpbmUgdGhlIHVwZGF0ZSBmdW5jdGlvbiBmb3IgdGhlIGVsZW1lbnQgbmFtZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHVwZGF0ZUVsZW1lbnROYW1lKCBlbGVtZW50TmFtZVRleHQ6IFRleHQsIHByb3RvbkNvdW50OiBudW1iZXIsIG5ldXRyb25Db3VudDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvZXNOdWNsaWRlRXhpc3Q6IGJvb2xlYW4sIGNlbnRlclg6IG51bWJlciwgY2VudGVyWT86IG51bWJlciApOiB2b2lkIHtcclxuICAgIGxldCBuYW1lID0gQXRvbUlkZW50aWZpZXIuZ2V0TmFtZSggcHJvdG9uQ291bnQgKTtcclxuICAgIGNvbnN0IG1hc3NOdW1iZXIgPSBwcm90b25Db3VudCArIG5ldXRyb25Db3VudDtcclxuXHJcbiAgICAvLyBzaG93IFwie25hbWV9IC0ge21hc3NOdW1iZXJ9IGRvZXMgbm90IGZvcm1cIiBpbiB0aGUgZWxlbWVudE5hbWUncyBwbGFjZSB3aGVuIGEgbnVjbGlkZSB0aGF0IGRvZXMgbm90IGV4aXN0IG9uIEVhcnRoIGlzIGJ1aWx0XHJcbiAgICBpZiAoICFkb2VzTnVjbGlkZUV4aXN0ICYmIG1hc3NOdW1iZXIgIT09IDAgKSB7XHJcblxyXG4gICAgICAvLyBubyBwcm90b25zXHJcbiAgICAgIGlmICggbmFtZS5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgbmFtZSArPSBtYXNzTnVtYmVyLnRvU3RyaW5nKCkgKyAnICcgKyBCdWlsZEFOdWNsZXVzU3RyaW5ncy5uZXV0cm9uc0xvd2VyY2FzZSArICcgJyArIEJ1aWxkQU51Y2xldXNTdHJpbmdzLmRvZXNOb3RGb3JtO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG5hbWUgKz0gJyAtICcgKyBtYXNzTnVtYmVyLnRvU3RyaW5nKCkgKyAnICcgKyBCdWlsZEFOdWNsZXVzU3RyaW5ncy5kb2VzTm90Rm9ybTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG5vIHByb3RvbnNcclxuICAgIGVsc2UgaWYgKCBuYW1lLmxlbmd0aCA9PT0gMCApIHtcclxuXHJcbiAgICAgIC8vIG5vIG5ldXRyb25zXHJcbiAgICAgIGlmICggbmV1dHJvbkNvdW50ID09PSAwICkge1xyXG4gICAgICAgIG5hbWUgPSAnJztcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gb25seSBvbmUgbmV1dHJvblxyXG4gICAgICBlbHNlIGlmICggbmV1dHJvbkNvdW50ID09PSAxICkge1xyXG4gICAgICAgIG5hbWUgPSBuZXV0cm9uQ291bnQgKyAnICcgKyBCdWlsZEFOdWNsZXVzU3RyaW5ncy5uZXV0cm9uTG93ZXJjYXNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBtdWx0aXBsZSBuZXV0cm9uc1xyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBuYW1lID0gU3RyaW5nVXRpbHMuZmlsbEluKCBCdWlsZEFOdWNsZXVzU3RyaW5ncy5jbHVzdGVyT2ZOZXV0cm9uc1BhdHRlcm4sIHtcclxuICAgICAgICAgIG5ldXRyb25OdW1iZXI6IG5ldXRyb25Db3VudFxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBuYW1lICs9ICcgLSAnICsgbWFzc051bWJlci50b1N0cmluZygpO1xyXG4gICAgfVxyXG4gICAgZWxlbWVudE5hbWVUZXh0LnN0cmluZyA9IG5hbWU7XHJcbiAgICBlbGVtZW50TmFtZVRleHQuY2VudGVyWCA9IGNlbnRlclg7XHJcbiAgICBpZiAoIGNlbnRlclkgKSB7XHJcbiAgICAgIGVsZW1lbnROYW1lVGV4dC5jZW50ZXJZID0gY2VudGVyWTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERlZmluZSBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBkZWNpZGUgd2hlcmUgdG8gcHV0IG51Y2xlb25zLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBkcmFnRW5kZWRMaXN0ZW5lciggbnVjbGVvbjogUGFydGljbGUsIGF0b206IFBhcnRpY2xlQXRvbSApOiB2b2lkIHtcclxuICAgIGNvbnN0IHBhcnRpY2xlQ3JlYXRvck5vZGVDZW50ZXIgPSBudWNsZW9uLnR5cGUgPT09IFBhcnRpY2xlVHlwZS5QUk9UT04ubmFtZS50b0xvd2VyQ2FzZSgpID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3RvbnNDcmVhdG9yTm9kZS5jZW50ZXIgOiB0aGlzLm5ldXRyb25zQ3JlYXRvck5vZGUuY2VudGVyO1xyXG5cclxuICAgIGlmICggdGhpcy5pc051Y2xlb25JbkNhcHR1cmVBcmVhKCBudWNsZW9uLCBhdG9tICkgfHxcclxuXHJcbiAgICAgICAgIC8vIGlmIHJlbW92aW5nIHRoZSBudWNsZW9uIHdpbGwgY3JlYXRlIGEgbnVjbGlkZSB0aGF0IGRvZXMgbm90IGV4aXN0LCByZS1hZGQgdGhlIG51Y2xlb24gdG8gdGhlIGF0b21cclxuICAgICAgICAgKCAoIHRoaXMubW9kZWwucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHkudmFsdWUgKyB0aGlzLm1vZGVsLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS52YWx1ZSApICE9PSAwICYmXHJcbiAgICAgICAgICAgIUF0b21JZGVudGlmaWVyLmRvZXNFeGlzdCggdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS52YWx1ZSwgdGhpcy5tb2RlbC5wYXJ0aWNsZUF0b20ubmV1dHJvbkNvdW50UHJvcGVydHkudmFsdWUgKVxyXG4gICAgICAgICApXHJcbiAgICApIHtcclxuICAgICAgYXRvbS5hZGRQYXJ0aWNsZSggbnVjbGVvbiApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9ubHkgYW5pbWF0ZSB0aGUgcmVtb3ZhbCBvZiBhIG51Y2xlb24gaWYgaXQgd2FzIGRyYWdnZWQgb3V0IG9mIHRoZSBjcmVhdG9yIG5vZGVcclxuICAgIGVsc2UgaWYgKCBudWNsZW9uLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZGlzdGFuY2UoIHBhcnRpY2xlQ3JlYXRvck5vZGVDZW50ZXIgKSA+IDEwICkge1xyXG4gICAgICB0aGlzLmFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSggbnVjbGVvbiwgcGFydGljbGVDcmVhdG9yTm9kZUNlbnRlci5taW51cyggdGhpcy5wYXJ0aWNsZVZpZXdQb3NpdGlvblZlY3RvciApICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgaXNOdWNsZW9uSW5DYXB0dXJlQXJlYSggbnVjbGVvbjogUGFydGljbGUsIGF0b206IFBhcnRpY2xlQXRvbSApOiBib29sZWFuIHtcclxuICAgIC8vIFBsZWFzZSBzZWUgc3ViY2xhc3MgaW1wbGVtZW50YXRpb25zXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgYWRkUGFydGljbGVWaWV3KCBwYXJ0aWNsZTogUGFydGljbGUgKTogdm9pZCB7XHJcbiAgICB0aGlzLnBhcnRpY2xlQXRvbU5vZGUuYWRkUGFydGljbGVWaWV3KCBwYXJ0aWNsZSApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTnVjbGV1cy5yZWdpc3RlciggJ0JBTlNjcmVlblZpZXcnLCBCQU5TY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJBTlNjcmVlblZpZXc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQTZCLG9DQUFvQztBQUNsRixPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxTQUFTLE1BQU0sdUNBQXVDO0FBRTdELE9BQU9DLFdBQVcsTUFBTSwyQ0FBMkM7QUFDbkUsU0FBU0MsS0FBSyxFQUFrREMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3JILE9BQU9DLFNBQVMsTUFBTSxpQkFBaUI7QUFDdkMsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLGNBQWMsTUFBTSx3Q0FBd0M7QUFDbkUsT0FBT0MsaUJBQWlCLE1BQXNDLHdCQUF3QjtBQUN0RixPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsWUFBWSxNQUFNLDJDQUEyQztBQUNwRSxPQUFPQyxRQUFRLE1BQU0sd0NBQXdDO0FBQzdELE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLFlBQVksTUFBTSxtQkFBbUI7QUFFNUMsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxrQkFBa0IsTUFBTSwwQkFBMEI7QUFFekQsT0FBT0MsZ0JBQWdCLE1BQU0sNENBQTRDO0FB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