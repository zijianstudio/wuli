// Copyright 2015-2022, University of Colorado Boulder

/**
 * Main view for the "Atomic Interactions" sim and for the "Interactions" screen in the States of Matter simulation.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMColors from '../../common/view/SOMColors.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import DualAtomModel from '../model/DualAtomModel.js';
import ForceDisplayMode from '../model/ForceDisplayMode.js';
import AtomicInteractionsControlPanel from './AtomicInteractionsControlPanel.js';
import ForcesAccordionBox from './ForcesAccordionBox.js';
import GrabbableParticleNode from './GrabbableParticleNode.js';
import HandNode from './HandNode.js';
import InteractivePotentialGraph from './InteractivePotentialGraph.js';
import ParticleForceNode from './ParticleForceNode.js';
import PushPinNode from './PushPinNode.js';
const returnAtomString = StatesOfMatterStrings.returnAtom;

// Constant used to control size of push pin, empirically determined.
const PUSH_PIN_WIDTH = 20;
const INSET = 15;
const MAX_TEXT_WIDTH = 80;
const PANEL_WIDTH = 209; // empirically determined to work well for English and most other translations

class AtomicInteractionsScreenView extends ScreenView {
  /**
   * @param {DualAtomModel} dualAtomModel of the simulation
   * @param {boolean} enableHeterogeneousAtoms
   * @param {Tandem} tandem
   */
  constructor(dualAtomModel, enableHeterogeneousAtoms, tandem) {
    // due to some odd behavior, we need to turn on preventFit for this screen, see
    // https://github.com/phetsims/states-of-matter/issues/176
    const screenViewOptions = merge({
      preventFit: true,
      tandem: tandem
    }, SOMConstants.SCREEN_VIEW_OPTIONS);
    super(screenViewOptions);

    // @private, vars needed to do the job
    this.dualAtomModel = dualAtomModel;
    this.movableParticle = dualAtomModel.movableAtom;
    this.fixedParticle = dualAtomModel.fixedAtom;
    this.showAttractiveForces = false;
    this.showRepulsiveForces = false;
    this.showTotalForces = false;

    // set up the model-view transform, @private
    this.modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(new Vector2(0, 0), new Vector2(145, 360), 0.25);

    // initialize local variables
    const tickTextColor = enableHeterogeneousAtoms ? 'black' : SOMColors.controlPanelTextProperty;
    const textColor = enableHeterogeneousAtoms ? 'black' : SOMColors.controlPanelTextProperty;
    const panelFill = enableHeterogeneousAtoms ? '#D1D2FF' : SOMColors.controlPanelBackgroundProperty;
    const panelStroke = enableHeterogeneousAtoms ? '#D1D2FF' : SOMColors.controlPanelStrokeProperty;
    const panelTextFill = enableHeterogeneousAtoms ? 'black' : SOMColors.controlPanelTextProperty;
    const forceControlPanelButtonAlign = enableHeterogeneousAtoms ? 'right' : 'left';
    const atomsControlPanel = new AtomicInteractionsControlPanel(dualAtomModel, enableHeterogeneousAtoms, {
      right: this.layoutBounds.maxX - INSET,
      top: this.layoutBounds.minY + INSET,
      tickTextColor: tickTextColor,
      textColor: textColor,
      fill: panelFill,
      stroke: panelStroke,
      panelTextFill: panelTextFill,
      maxWidth: PANEL_WIDTH,
      minWidth: PANEL_WIDTH,
      tandem: tandem.createTandem('atomsControlPanel')
    });

    // Set the x-offset of the graph so that the left axis will be directly above the center of the fixed atom, which
    // should in turn make the position marker directly above the movable atom.  These values were empirically
    // determined are are different based on whether the zoom buttons are present on the graph.
    const graphXOffset = enableHeterogeneousAtoms ? -43 : -31;

    // @private interactive potential diagram
    this.interactivePotentialGraph = new InteractivePotentialGraph(dualAtomModel, {
      zoomable: enableHeterogeneousAtoms,
      left: this.modelViewTransform.modelToViewX(0) + graphXOffset,
      top: atomsControlPanel.top + 5,
      // additional offset empirically determined to look good
      tandem: tandem.createTandem('interactivePotentialGraph')
    });
    this.addChild(this.interactivePotentialGraph);

    // @private button for returning the atom to the screen
    this.returnAtomButton = new TextPushButton(returnAtomString, {
      font: new PhetFont(17),
      baseColor: '#61BEE3',
      maxWidth: MAX_TEXT_WIDTH,
      listener: () => {
        dualAtomModel.resetMovableAtomPos();
      },
      left: this.layoutBounds.minX + 6 * INSET,
      bottom: this.layoutBounds.bottom - 2 * INSET,
      tandem: tandem.createTandem('returnAtomButton'),
      visible: false,
      phetioReadOnly: true,
      visiblePropertyOptions: {
        phetioReadOnly: true
      },
      phetioInputEnabledPropertyInstrumented: true,
      enabledPropertyOptions: {
        phetioReadOnly: true
      }
    });
    this.addChild(this.returnAtomButton);

    // create and add the Reset All Button in the bottom right
    const resetAllButton = new ResetAllButton({
      listener: () => {
        dualAtomModel.reset();
        this.interactivePotentialGraph.reset();
      },
      radius: SOMConstants.RESET_ALL_BUTTON_RADIUS,
      right: this.layoutBounds.maxX - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_SIDE,
      bottom: this.layoutBounds.maxY - SOMConstants.RESET_ALL_BUTTON_DISTANCE_FROM_BOTTOM,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // add force control
    const forcesAccordionBox = new ForcesAccordionBox(dualAtomModel.forcesDisplayModeProperty, dualAtomModel.forcesExpandedProperty, {
      tickTextColor: tickTextColor,
      textColor: textColor,
      fill: panelFill,
      stroke: panelStroke,
      textFill: panelTextFill,
      buttonAlign: forceControlPanelButtonAlign,
      showTitleWhenExpanded: !enableHeterogeneousAtoms,
      minWidth: PANEL_WIDTH,
      maxWidth: PANEL_WIDTH,
      tandem: tandem.createTandem('forcesAccordionBox')
    });

    // the control panels will overlap the reset all button if fully opened, so they must be a bit to the left
    atomsControlPanel.right = resetAllButton.left - 20; // offset empirically determined

    // add control for play/pause/step
    const timeControlNode = new TimeControlNode(dualAtomModel.isPlayingProperty, {
      timeSpeedProperty: dualAtomModel.timeSpeedProperty,
      playPauseStepButtonOptions: {
        playPauseButtonOptions: {
          radius: SOMConstants.PLAY_PAUSE_BUTTON_RADIUS
        },
        stepForwardButtonOptions: {
          radius: SOMConstants.STEP_BUTTON_RADIUS,
          listener: () => {
            dualAtomModel.stepInternal(SOMConstants.NOMINAL_TIME_STEP * DualAtomModel.NORMAL_MOTION_TIME_MULTIPLIER);
          }
        },
        playPauseStepXSpacing: 10
      },
      speedRadioButtonGroupOptions: {
        labelOptions: {
          fill: SOMColors.controlPanelTextProperty,
          font: new PhetFont(14),
          maxWidth: MAX_TEXT_WIDTH
        }
      },
      // position empirically determined
      centerX: this.layoutBounds.centerX + 20,
      bottom: this.layoutBounds.bottom - 14,
      tandem: tandem.createTandem('timeControlNode')
    });
    this.addChild(timeControlNode);

    // Create the nodes that will act as layers for the fixed and movable particles. This is done so that the movable
    // particle can always appear to be on top.
    this.fixedParticleLayer = new Node();
    this.addChild(this.fixedParticleLayer);
    this.movableParticleLayer = new Node();
    this.addChild(this.movableParticleLayer);

    // Create a reusable node that looks like a cartoon hand and is used to indicate to the user that an atom can be
    // moved.  This will be dynamically added and removed from the scene graph.
    this.handNode = new HandNode(this.dualAtomModel, this.dualAtomModel.movableAtom, this.modelViewTransform, 0, {
      tandem: tandem.createTandem('handNode'),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    });

    // add the representation of the fixed particle
    this.fixedParticleNode = new ParticleForceNode(dualAtomModel.fixedAtom, this.modelViewTransform, true, tandem.createTandem('fixedParticleNode'));
    this.fixedParticleNode.setShowAttractiveForces(this.showAttractiveForces);
    this.fixedParticleNode.setShowRepulsiveForces(this.showRepulsiveForces);
    this.fixedParticleNode.setShowTotalForces(this.showTotalForces);
    this.fixedParticleLayer.addChild(this.fixedParticleNode);

    // add the representation of the movable particle
    this.movableParticleNode = new GrabbableParticleNode(this.dualAtomModel, dualAtomModel.movableAtom, this.modelViewTransform, true, 0, tandem.createTandem('movableParticleNode'));
    this.movableParticleNode.setShowAttractiveForces(this.showAttractiveForces);
    this.movableParticleNode.setShowRepulsiveForces(this.showRepulsiveForces);
    this.movableParticleNode.setShowTotalForces(this.showTotalForces);
    this.movableParticleLayer.addChild(this.movableParticleNode);
    this.movableParticleLayer.addChild(this.handNode);

    // associate the hand node with the movable atom
    this.handNode.setParticle(dualAtomModel.movableAtom);

    // Create and add the push pin node that will be used to convey the idea that the fixed atom is pinned to the canvas.
    this.pushPinNode = new PushPinNode();
    this.pushPinNode.scale(PUSH_PIN_WIDTH / this.pushPinNode.width);
    this.addChild(this.pushPinNode);

    // Add the control panels to the screen after the atoms so that the atoms with go behind them.
    this.addChild(atomsControlPanel);
    this.addChild(forcesAccordionBox);

    // update various aspects of the appearance when the selected atom pair changes
    dualAtomModel.atomPairProperty.link(() => {
      forcesAccordionBox.top = atomsControlPanel.bottom + INSET / 2;
      forcesAccordionBox.left = atomsControlPanel.left;
      this.updatePositionMarkerOnGraph();
      this.updateMinimumXForMovableAtom();
      this.updatePushPinPosition();
      this.updateHandPosition();
    });

    // update the push pin position if the adjustable atom diameter changes
    dualAtomModel.adjustableAtomDiameterProperty.link(() => {
      this.updatePushPinPosition();
    });

    // update the visibility of the force arrows when the settings change
    dualAtomModel.forcesDisplayModeProperty.link(forces => {
      this.setShowAttractiveForces(forces === ForceDisplayMode.COMPONENTS);
      this.setShowRepulsiveForces(forces === ForceDisplayMode.COMPONENTS);
      this.setShowTotalForces(forces === ForceDisplayMode.TOTAL);
      if (!this.showAttractiveForces && !this.showTotalForces && forces !== ForceDisplayMode.HIDDEN) {
        throw new Error(`invalid forces: ${forces}`);
      }
    });

    // monitor the atom diameter and trigger updates when changes occur
    dualAtomModel.adjustableAtomDiameterProperty.link(() => {
      this.updateMinimumXForMovableAtom();
      this.updateHandPosition();
    });
  }

  /**
   * Called by the animation loop.
   * @public
   */
  step() {
    this.handlePositionChanged();
  }

  /**
   * Turn on/off the displaying of the force arrows that represent the attractive force.
   * @param {boolean} showForces
   * @public
   */
  setShowAttractiveForces(showForces) {
    this.movableParticleNode.setShowAttractiveForces(showForces);
    this.fixedParticleNode.setShowAttractiveForces(showForces);
    this.showAttractiveForces = showForces;
  }

  /**
   * Turn on/off the displaying of the force arrows that represent the repulsive force.
   * @param {boolean} showForces
   * @public
   */
  setShowRepulsiveForces(showForces) {
    this.movableParticleNode.setShowRepulsiveForces(showForces);
    this.fixedParticleNode.setShowRepulsiveForces(showForces);
    this.showRepulsiveForces = showForces;
  }

  /**
   * Turn on/off the displaying of the force arrows that represent the total force, i.e. attractive plus repulsive.
   * @param {boolean} showForces
   * @public
   */
  setShowTotalForces(showForces) {
    this.movableParticleNode.setShowTotalForces(showForces);
    this.fixedParticleNode.setShowTotalForces(showForces);
    this.showTotalForces = showForces;
  }

  /**
   * @private
   */
  handlePositionChanged() {
    this.updatePositionMarkerOnGraph();
    this.updateForceVectors();
    this.updateHandPosition();
    const simDimensions = phet.joist.sim.dimensionProperty.value;
    const width = simDimensions.width;
    const height = simDimensions.height;
    const scale = Math.min(width / this.layoutBounds.width, height / this.layoutBounds.height);
    let atomWindowPosition = scale * this.modelViewTransform.modelToViewX(this.dualAtomModel.movableAtom.getX());

    // account for the view centering
    if (scale === height / this.layoutBounds.height) {
      atomWindowPosition += (width - this.layoutBounds.width * scale) / 2 - 50;
    }
    if (atomWindowPosition > width) {
      if (!this.returnAtomButton.isVisible()) {
        // The particle is off the canvas and the button is not yet shown, so show it.
        this.returnAtomButton.setVisible(true);
      }
    } else if (this.returnAtomButton.isVisible()) {
      // The particle is on the canvas but the button is visible (which it shouldn't be), so hide it.
      this.returnAtomButton.setVisible(false);
    }
  }

  /**
   * Update the position marker on the Lennard-Jones potential diagram. This will indicate the amount of potential
   * being experienced between the two atoms in the model.
   * @private
   */
  updatePositionMarkerOnGraph() {
    const distance = this.fixedParticle.positionProperty.value.distance(this.movableParticle.positionProperty.value);
    this.interactivePotentialGraph.setMarkerPosition(distance);
  }

  /**
   * @private
   */
  updatePushPinPosition() {
    const pinnedAtomPosition = this.dualAtomModel.fixedAtom.positionProperty.value;
    const pinnedAtomRadius = this.dualAtomModel.fixedAtom.radiusProperty.value;
    const mvt = this.modelViewTransform;
    this.pushPinNode.right = mvt.modelToViewX(pinnedAtomPosition.x - pinnedAtomRadius * 0.5);
    this.pushPinNode.bottom = mvt.modelToViewY(pinnedAtomPosition.y - pinnedAtomRadius * 0.5);
  }

  /**
   * @private
   */
  updateHandPosition() {
    this.handNode.left = this.modelViewTransform.modelToViewX(this.movableParticle.positionProperty.value.x);
  }

  /**
   * Update the minimum X value allowed for the movable atom.  This prevents too much overlap between the atoms.
   * @public
   */
  updateMinimumXForMovableAtom() {
    // Use a minimum X value that is just a bit less than the sigma value, since the repulsive potential goes up
    // rapidly with smaller values.
    const minXInModel = this.dualAtomModel.getSigma() * 0.9;
    this.interactivePotentialGraph.setMinXForAtom(minXInModel);
    const minXInView = this.modelViewTransform.modelToViewX(minXInModel);
    this.movableParticleNode.setMinX(minXInView);
    this.handNode.setMinX(minXInView);
  }

  /**
   * @private
   */
  updateForceVectors() {
    if (this.fixedParticle !== null && this.movableParticle !== null) {
      this.fixedParticleNode.setForces(this.dualAtomModel.attractiveForce, -this.dualAtomModel.repulsiveForce);
      this.movableParticleNode.setForces(-this.dualAtomModel.attractiveForce, this.dualAtomModel.repulsiveForce);
    }
  }
}
statesOfMatter.register('AtomicInteractionsScreenView', AtomicInteractionsScreenView);
export default AtomicInteractionsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIm1lcmdlIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJUaW1lQ29udHJvbE5vZGUiLCJOb2RlIiwiVGV4dFB1c2hCdXR0b24iLCJTT01Db25zdGFudHMiLCJTT01Db2xvcnMiLCJzdGF0ZXNPZk1hdHRlciIsIlN0YXRlc09mTWF0dGVyU3RyaW5ncyIsIkR1YWxBdG9tTW9kZWwiLCJGb3JjZURpc3BsYXlNb2RlIiwiQXRvbWljSW50ZXJhY3Rpb25zQ29udHJvbFBhbmVsIiwiRm9yY2VzQWNjb3JkaW9uQm94IiwiR3JhYmJhYmxlUGFydGljbGVOb2RlIiwiSGFuZE5vZGUiLCJJbnRlcmFjdGl2ZVBvdGVudGlhbEdyYXBoIiwiUGFydGljbGVGb3JjZU5vZGUiLCJQdXNoUGluTm9kZSIsInJldHVybkF0b21TdHJpbmciLCJyZXR1cm5BdG9tIiwiUFVTSF9QSU5fV0lEVEgiLCJJTlNFVCIsIk1BWF9URVhUX1dJRFRIIiwiUEFORUxfV0lEVEgiLCJBdG9taWNJbnRlcmFjdGlvbnNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJkdWFsQXRvbU1vZGVsIiwiZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zIiwidGFuZGVtIiwic2NyZWVuVmlld09wdGlvbnMiLCJwcmV2ZW50Rml0IiwiU0NSRUVOX1ZJRVdfT1BUSU9OUyIsIm1vdmFibGVQYXJ0aWNsZSIsIm1vdmFibGVBdG9tIiwiZml4ZWRQYXJ0aWNsZSIsImZpeGVkQXRvbSIsInNob3dBdHRyYWN0aXZlRm9yY2VzIiwic2hvd1JlcHVsc2l2ZUZvcmNlcyIsInNob3dUb3RhbEZvcmNlcyIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVNYXBwaW5nIiwidGlja1RleHRDb2xvciIsImNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSIsInRleHRDb2xvciIsInBhbmVsRmlsbCIsImNvbnRyb2xQYW5lbEJhY2tncm91bmRQcm9wZXJ0eSIsInBhbmVsU3Ryb2tlIiwiY29udHJvbFBhbmVsU3Ryb2tlUHJvcGVydHkiLCJwYW5lbFRleHRGaWxsIiwiZm9yY2VDb250cm9sUGFuZWxCdXR0b25BbGlnbiIsImF0b21zQ29udHJvbFBhbmVsIiwicmlnaHQiLCJsYXlvdXRCb3VuZHMiLCJtYXhYIiwidG9wIiwibWluWSIsImZpbGwiLCJzdHJva2UiLCJtYXhXaWR0aCIsIm1pbldpZHRoIiwiY3JlYXRlVGFuZGVtIiwiZ3JhcGhYT2Zmc2V0IiwiaW50ZXJhY3RpdmVQb3RlbnRpYWxHcmFwaCIsInpvb21hYmxlIiwibGVmdCIsIm1vZGVsVG9WaWV3WCIsImFkZENoaWxkIiwicmV0dXJuQXRvbUJ1dHRvbiIsImZvbnQiLCJiYXNlQ29sb3IiLCJsaXN0ZW5lciIsInJlc2V0TW92YWJsZUF0b21Qb3MiLCJtaW5YIiwiYm90dG9tIiwidmlzaWJsZSIsInBoZXRpb1JlYWRPbmx5IiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwiZW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsInJlc2V0QWxsQnV0dG9uIiwicmVzZXQiLCJyYWRpdXMiLCJSRVNFVF9BTExfQlVUVE9OX1JBRElVUyIsIlJFU0VUX0FMTF9CVVRUT05fRElTVEFOQ0VfRlJPTV9TSURFIiwibWF4WSIsIlJFU0VUX0FMTF9CVVRUT05fRElTVEFOQ0VfRlJPTV9CT1RUT00iLCJmb3JjZXNBY2NvcmRpb25Cb3giLCJmb3JjZXNEaXNwbGF5TW9kZVByb3BlcnR5IiwiZm9yY2VzRXhwYW5kZWRQcm9wZXJ0eSIsInRleHRGaWxsIiwiYnV0dG9uQWxpZ24iLCJzaG93VGl0bGVXaGVuRXhwYW5kZWQiLCJ0aW1lQ29udHJvbE5vZGUiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsInRpbWVTcGVlZFByb3BlcnR5IiwicGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnMiLCJwbGF5UGF1c2VCdXR0b25PcHRpb25zIiwiUExBWV9QQVVTRV9CVVRUT05fUkFESVVTIiwic3RlcEZvcndhcmRCdXR0b25PcHRpb25zIiwiU1RFUF9CVVRUT05fUkFESVVTIiwic3RlcEludGVybmFsIiwiTk9NSU5BTF9USU1FX1NURVAiLCJOT1JNQUxfTU9USU9OX1RJTUVfTVVMVElQTElFUiIsInBsYXlQYXVzZVN0ZXBYU3BhY2luZyIsInNwZWVkUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMiLCJsYWJlbE9wdGlvbnMiLCJjZW50ZXJYIiwiZml4ZWRQYXJ0aWNsZUxheWVyIiwibW92YWJsZVBhcnRpY2xlTGF5ZXIiLCJoYW5kTm9kZSIsImZpeGVkUGFydGljbGVOb2RlIiwic2V0U2hvd0F0dHJhY3RpdmVGb3JjZXMiLCJzZXRTaG93UmVwdWxzaXZlRm9yY2VzIiwic2V0U2hvd1RvdGFsRm9yY2VzIiwibW92YWJsZVBhcnRpY2xlTm9kZSIsInNldFBhcnRpY2xlIiwicHVzaFBpbk5vZGUiLCJzY2FsZSIsIndpZHRoIiwiYXRvbVBhaXJQcm9wZXJ0eSIsImxpbmsiLCJ1cGRhdGVQb3NpdGlvbk1hcmtlck9uR3JhcGgiLCJ1cGRhdGVNaW5pbXVtWEZvck1vdmFibGVBdG9tIiwidXBkYXRlUHVzaFBpblBvc2l0aW9uIiwidXBkYXRlSGFuZFBvc2l0aW9uIiwiYWRqdXN0YWJsZUF0b21EaWFtZXRlclByb3BlcnR5IiwiZm9yY2VzIiwiQ09NUE9ORU5UUyIsIlRPVEFMIiwiSElEREVOIiwiRXJyb3IiLCJzdGVwIiwiaGFuZGxlUG9zaXRpb25DaGFuZ2VkIiwic2hvd0ZvcmNlcyIsInVwZGF0ZUZvcmNlVmVjdG9ycyIsInNpbURpbWVuc2lvbnMiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJkaW1lbnNpb25Qcm9wZXJ0eSIsInZhbHVlIiwiaGVpZ2h0IiwiTWF0aCIsIm1pbiIsImF0b21XaW5kb3dQb3NpdGlvbiIsImdldFgiLCJpc1Zpc2libGUiLCJzZXRWaXNpYmxlIiwiZGlzdGFuY2UiLCJwb3NpdGlvblByb3BlcnR5Iiwic2V0TWFya2VyUG9zaXRpb24iLCJwaW5uZWRBdG9tUG9zaXRpb24iLCJwaW5uZWRBdG9tUmFkaXVzIiwicmFkaXVzUHJvcGVydHkiLCJtdnQiLCJ4IiwibW9kZWxUb1ZpZXdZIiwieSIsIm1pblhJbk1vZGVsIiwiZ2V0U2lnbWEiLCJzZXRNaW5YRm9yQXRvbSIsIm1pblhJblZpZXciLCJzZXRNaW5YIiwic2V0Rm9yY2VzIiwiYXR0cmFjdGl2ZUZvcmNlIiwicmVwdWxzaXZlRm9yY2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkF0b21pY0ludGVyYWN0aW9uc1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFpbiB2aWV3IGZvciB0aGUgXCJBdG9taWMgSW50ZXJhY3Rpb25zXCIgc2ltIGFuZCBmb3IgdGhlIFwiSW50ZXJhY3Rpb25zXCIgc2NyZWVuIGluIHRoZSBTdGF0ZXMgb2YgTWF0dGVyIHNpbXVsYXRpb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUZXh0UHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9UZXh0UHVzaEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBTT01Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1NPTUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBTT01Db2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU09NQ29sb3JzLmpzJztcclxuaW1wb3J0IHN0YXRlc09mTWF0dGVyIGZyb20gJy4uLy4uL3N0YXRlc09mTWF0dGVyLmpzJztcclxuaW1wb3J0IFN0YXRlc09mTWF0dGVyU3RyaW5ncyBmcm9tICcuLi8uLi9TdGF0ZXNPZk1hdHRlclN0cmluZ3MuanMnO1xyXG5pbXBvcnQgRHVhbEF0b21Nb2RlbCBmcm9tICcuLi9tb2RlbC9EdWFsQXRvbU1vZGVsLmpzJztcclxuaW1wb3J0IEZvcmNlRGlzcGxheU1vZGUgZnJvbSAnLi4vbW9kZWwvRm9yY2VEaXNwbGF5TW9kZS5qcyc7XHJcbmltcG9ydCBBdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwgZnJvbSAnLi9BdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgRm9yY2VzQWNjb3JkaW9uQm94IGZyb20gJy4vRm9yY2VzQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IEdyYWJiYWJsZVBhcnRpY2xlTm9kZSBmcm9tICcuL0dyYWJiYWJsZVBhcnRpY2xlTm9kZS5qcyc7XHJcbmltcG9ydCBIYW5kTm9kZSBmcm9tICcuL0hhbmROb2RlLmpzJztcclxuaW1wb3J0IEludGVyYWN0aXZlUG90ZW50aWFsR3JhcGggZnJvbSAnLi9JbnRlcmFjdGl2ZVBvdGVudGlhbEdyYXBoLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlRm9yY2VOb2RlIGZyb20gJy4vUGFydGljbGVGb3JjZU5vZGUuanMnO1xyXG5pbXBvcnQgUHVzaFBpbk5vZGUgZnJvbSAnLi9QdXNoUGluTm9kZS5qcyc7XHJcblxyXG5jb25zdCByZXR1cm5BdG9tU3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLnJldHVybkF0b207XHJcblxyXG4vLyBDb25zdGFudCB1c2VkIHRvIGNvbnRyb2wgc2l6ZSBvZiBwdXNoIHBpbiwgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZC5cclxuY29uc3QgUFVTSF9QSU5fV0lEVEggPSAyMDtcclxuY29uc3QgSU5TRVQgPSAxNTtcclxuY29uc3QgTUFYX1RFWFRfV0lEVEggPSA4MDtcclxuY29uc3QgUEFORUxfV0lEVEggPSAyMDk7IC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWQgdG8gd29yayB3ZWxsIGZvciBFbmdsaXNoIGFuZCBtb3N0IG90aGVyIHRyYW5zbGF0aW9uc1xyXG5cclxuY2xhc3MgQXRvbWljSW50ZXJhY3Rpb25zU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0R1YWxBdG9tTW9kZWx9IGR1YWxBdG9tTW9kZWwgb2YgdGhlIHNpbXVsYXRpb25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tc1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZHVhbEF0b21Nb2RlbCwgZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gZHVlIHRvIHNvbWUgb2RkIGJlaGF2aW9yLCB3ZSBuZWVkIHRvIHR1cm4gb24gcHJldmVudEZpdCBmb3IgdGhpcyBzY3JlZW4sIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3N0YXRlcy1vZi1tYXR0ZXIvaXNzdWVzLzE3NlxyXG4gICAgY29uc3Qgc2NyZWVuVmlld09wdGlvbnMgPSBtZXJnZSggeyBwcmV2ZW50Rml0OiB0cnVlLCB0YW5kZW06IHRhbmRlbSB9LCBTT01Db25zdGFudHMuU0NSRUVOX1ZJRVdfT1BUSU9OUyApO1xyXG5cclxuICAgIHN1cGVyKCBzY3JlZW5WaWV3T3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlLCB2YXJzIG5lZWRlZCB0byBkbyB0aGUgam9iXHJcbiAgICB0aGlzLmR1YWxBdG9tTW9kZWwgPSBkdWFsQXRvbU1vZGVsO1xyXG4gICAgdGhpcy5tb3ZhYmxlUGFydGljbGUgPSBkdWFsQXRvbU1vZGVsLm1vdmFibGVBdG9tO1xyXG4gICAgdGhpcy5maXhlZFBhcnRpY2xlID0gZHVhbEF0b21Nb2RlbC5maXhlZEF0b207XHJcbiAgICB0aGlzLnNob3dBdHRyYWN0aXZlRm9yY2VzID0gZmFsc2U7XHJcbiAgICB0aGlzLnNob3dSZXB1bHNpdmVGb3JjZXMgPSBmYWxzZTtcclxuICAgIHRoaXMuc2hvd1RvdGFsRm9yY2VzID0gZmFsc2U7XHJcblxyXG4gICAgLy8gc2V0IHVwIHRoZSBtb2RlbC12aWV3IHRyYW5zZm9ybSwgQHByaXZhdGVcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlTWFwcGluZyhcclxuICAgICAgbmV3IFZlY3RvcjIoIDAsIDAgKSxcclxuICAgICAgbmV3IFZlY3RvcjIoIDE0NSwgMzYwICksXHJcbiAgICAgIDAuMjVcclxuICAgICk7XHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSBsb2NhbCB2YXJpYWJsZXNcclxuICAgIGNvbnN0IHRpY2tUZXh0Q29sb3IgPSBlbmFibGVIZXRlcm9nZW5lb3VzQXRvbXMgPyAnYmxhY2snIDogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eTtcclxuICAgIGNvbnN0IHRleHRDb2xvciA9IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyA/ICdibGFjaycgOiBTT01Db2xvcnMuY29udHJvbFBhbmVsVGV4dFByb3BlcnR5O1xyXG4gICAgY29uc3QgcGFuZWxGaWxsID0gZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zID8gJyNEMUQyRkYnIDogU09NQ29sb3JzLmNvbnRyb2xQYW5lbEJhY2tncm91bmRQcm9wZXJ0eTtcclxuICAgIGNvbnN0IHBhbmVsU3Ryb2tlID0gZW5hYmxlSGV0ZXJvZ2VuZW91c0F0b21zID8gJyNEMUQyRkYnIDogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFN0cm9rZVByb3BlcnR5O1xyXG4gICAgY29uc3QgcGFuZWxUZXh0RmlsbCA9IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyA/ICdibGFjaycgOiBTT01Db2xvcnMuY29udHJvbFBhbmVsVGV4dFByb3BlcnR5O1xyXG4gICAgY29uc3QgZm9yY2VDb250cm9sUGFuZWxCdXR0b25BbGlnbiA9IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyA/ICdyaWdodCcgOiAnbGVmdCc7XHJcbiAgICBjb25zdCBhdG9tc0NvbnRyb2xQYW5lbCA9IG5ldyBBdG9taWNJbnRlcmFjdGlvbnNDb250cm9sUGFuZWwoIGR1YWxBdG9tTW9kZWwsIGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcywge1xyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIElOU0VULFxyXG4gICAgICB0b3A6IHRoaXMubGF5b3V0Qm91bmRzLm1pblkgKyBJTlNFVCxcclxuICAgICAgdGlja1RleHRDb2xvcjogdGlja1RleHRDb2xvcixcclxuICAgICAgdGV4dENvbG9yOiB0ZXh0Q29sb3IsXHJcbiAgICAgIGZpbGw6IHBhbmVsRmlsbCxcclxuICAgICAgc3Ryb2tlOiBwYW5lbFN0cm9rZSxcclxuICAgICAgcGFuZWxUZXh0RmlsbDogcGFuZWxUZXh0RmlsbCxcclxuICAgICAgbWF4V2lkdGg6IFBBTkVMX1dJRFRILFxyXG4gICAgICBtaW5XaWR0aDogUEFORUxfV0lEVEgsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21zQ29udHJvbFBhbmVsJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSB4LW9mZnNldCBvZiB0aGUgZ3JhcGggc28gdGhhdCB0aGUgbGVmdCBheGlzIHdpbGwgYmUgZGlyZWN0bHkgYWJvdmUgdGhlIGNlbnRlciBvZiB0aGUgZml4ZWQgYXRvbSwgd2hpY2hcclxuICAgIC8vIHNob3VsZCBpbiB0dXJuIG1ha2UgdGhlIHBvc2l0aW9uIG1hcmtlciBkaXJlY3RseSBhYm92ZSB0aGUgbW92YWJsZSBhdG9tLiAgVGhlc2UgdmFsdWVzIHdlcmUgZW1waXJpY2FsbHlcclxuICAgIC8vIGRldGVybWluZWQgYXJlIGFyZSBkaWZmZXJlbnQgYmFzZWQgb24gd2hldGhlciB0aGUgem9vbSBidXR0b25zIGFyZSBwcmVzZW50IG9uIHRoZSBncmFwaC5cclxuICAgIGNvbnN0IGdyYXBoWE9mZnNldCA9IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyA/IC00MyA6IC0zMTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBpbnRlcmFjdGl2ZSBwb3RlbnRpYWwgZGlhZ3JhbVxyXG4gICAgdGhpcy5pbnRlcmFjdGl2ZVBvdGVudGlhbEdyYXBoID0gbmV3IEludGVyYWN0aXZlUG90ZW50aWFsR3JhcGgoIGR1YWxBdG9tTW9kZWwsIHtcclxuICAgICAgem9vbWFibGU6IGVuYWJsZUhldGVyb2dlbmVvdXNBdG9tcyxcclxuICAgICAgbGVmdDogdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCAwICkgKyBncmFwaFhPZmZzZXQsXHJcbiAgICAgIHRvcDogYXRvbXNDb250cm9sUGFuZWwudG9wICsgNSwgLy8gYWRkaXRpb25hbCBvZmZzZXQgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB0byBsb29rIGdvb2RcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW50ZXJhY3RpdmVQb3RlbnRpYWxHcmFwaCcgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5pbnRlcmFjdGl2ZVBvdGVudGlhbEdyYXBoICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgYnV0dG9uIGZvciByZXR1cm5pbmcgdGhlIGF0b20gdG8gdGhlIHNjcmVlblxyXG4gICAgdGhpcy5yZXR1cm5BdG9tQnV0dG9uID0gbmV3IFRleHRQdXNoQnV0dG9uKCByZXR1cm5BdG9tU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTcgKSxcclxuICAgICAgYmFzZUNvbG9yOiAnIzYxQkVFMycsXHJcbiAgICAgIG1heFdpZHRoOiBNQVhfVEVYVF9XSURUSCxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBkdWFsQXRvbU1vZGVsLnJlc2V0TW92YWJsZUF0b21Qb3MoKTtcclxuICAgICAgfSxcclxuICAgICAgbGVmdDogdGhpcy5sYXlvdXRCb3VuZHMubWluWCArIDYgKiBJTlNFVCxcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSAyICogSU5TRVQsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JldHVybkF0b21CdXR0b24nICksXHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9LFxyXG4gICAgICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcclxuICAgICAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJldHVybkF0b21CdXR0b24gKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgUmVzZXQgQWxsIEJ1dHRvbiBpbiB0aGUgYm90dG9tIHJpZ2h0XHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIGR1YWxBdG9tTW9kZWwucmVzZXQoKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aXZlUG90ZW50aWFsR3JhcGgucmVzZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgcmFkaXVzOiBTT01Db25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gU09NQ29uc3RhbnRzLlJFU0VUX0FMTF9CVVRUT05fRElTVEFOQ0VfRlJPTV9TSURFLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBTT01Db25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9ESVNUQU5DRV9GUk9NX0JPVFRPTSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJlc2V0QWxsQnV0dG9uICk7XHJcblxyXG4gICAgLy8gYWRkIGZvcmNlIGNvbnRyb2xcclxuICAgIGNvbnN0IGZvcmNlc0FjY29yZGlvbkJveCA9IG5ldyBGb3JjZXNBY2NvcmRpb25Cb3goXHJcbiAgICAgIGR1YWxBdG9tTW9kZWwuZm9yY2VzRGlzcGxheU1vZGVQcm9wZXJ0eSxcclxuICAgICAgZHVhbEF0b21Nb2RlbC5mb3JjZXNFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGlja1RleHRDb2xvcjogdGlja1RleHRDb2xvcixcclxuICAgICAgICB0ZXh0Q29sb3I6IHRleHRDb2xvcixcclxuICAgICAgICBmaWxsOiBwYW5lbEZpbGwsXHJcbiAgICAgICAgc3Ryb2tlOiBwYW5lbFN0cm9rZSxcclxuICAgICAgICB0ZXh0RmlsbDogcGFuZWxUZXh0RmlsbCxcclxuICAgICAgICBidXR0b25BbGlnbjogZm9yY2VDb250cm9sUGFuZWxCdXR0b25BbGlnbixcclxuICAgICAgICBzaG93VGl0bGVXaGVuRXhwYW5kZWQ6ICFlbmFibGVIZXRlcm9nZW5lb3VzQXRvbXMsXHJcbiAgICAgICAgbWluV2lkdGg6IFBBTkVMX1dJRFRILFxyXG4gICAgICAgIG1heFdpZHRoOiBQQU5FTF9XSURUSCxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmb3JjZXNBY2NvcmRpb25Cb3gnIClcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyB0aGUgY29udHJvbCBwYW5lbHMgd2lsbCBvdmVybGFwIHRoZSByZXNldCBhbGwgYnV0dG9uIGlmIGZ1bGx5IG9wZW5lZCwgc28gdGhleSBtdXN0IGJlIGEgYml0IHRvIHRoZSBsZWZ0XHJcbiAgICBhdG9tc0NvbnRyb2xQYW5lbC5yaWdodCA9IHJlc2V0QWxsQnV0dG9uLmxlZnQgLSAyMDsgLy8gb2Zmc2V0IGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuXHJcbiAgICAvLyBhZGQgY29udHJvbCBmb3IgcGxheS9wYXVzZS9zdGVwXHJcbiAgICBjb25zdCB0aW1lQ29udHJvbE5vZGUgPSBuZXcgVGltZUNvbnRyb2xOb2RlKCBkdWFsQXRvbU1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHRpbWVTcGVlZFByb3BlcnR5OiBkdWFsQXRvbU1vZGVsLnRpbWVTcGVlZFByb3BlcnR5LFxyXG5cclxuICAgICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcclxuXHJcbiAgICAgICAgcGxheVBhdXNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgcmFkaXVzOiBTT01Db25zdGFudHMuUExBWV9QQVVTRV9CVVRUT05fUkFESVVTXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHJhZGl1czogU09NQ29uc3RhbnRzLlNURVBfQlVUVE9OX1JBRElVUyxcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGR1YWxBdG9tTW9kZWwuc3RlcEludGVybmFsKCBTT01Db25zdGFudHMuTk9NSU5BTF9USU1FX1NURVAgKiBEdWFsQXRvbU1vZGVsLk5PUk1BTF9NT1RJT05fVElNRV9NVUxUSVBMSUVSICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBwbGF5UGF1c2VTdGVwWFNwYWNpbmc6IDEwXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBzcGVlZFJhZGlvQnV0dG9uR3JvdXBPcHRpb25zOiB7XHJcbiAgICAgICAgbGFiZWxPcHRpb25zOiB7XHJcbiAgICAgICAgICBmaWxsOiBTT01Db2xvcnMuY29udHJvbFBhbmVsVGV4dFByb3BlcnR5LFxyXG4gICAgICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNCApLFxyXG4gICAgICAgICAgbWF4V2lkdGg6IE1BWF9URVhUX1dJRFRIXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcG9zaXRpb24gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYICsgMjAsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gMTQsXHJcblxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbE5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVDb250cm9sTm9kZSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgbm9kZXMgdGhhdCB3aWxsIGFjdCBhcyBsYXllcnMgZm9yIHRoZSBmaXhlZCBhbmQgbW92YWJsZSBwYXJ0aWNsZXMuIFRoaXMgaXMgZG9uZSBzbyB0aGF0IHRoZSBtb3ZhYmxlXHJcbiAgICAvLyBwYXJ0aWNsZSBjYW4gYWx3YXlzIGFwcGVhciB0byBiZSBvbiB0b3AuXHJcbiAgICB0aGlzLmZpeGVkUGFydGljbGVMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmZpeGVkUGFydGljbGVMYXllciApO1xyXG4gICAgdGhpcy5tb3ZhYmxlUGFydGljbGVMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm1vdmFibGVQYXJ0aWNsZUxheWVyICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgcmV1c2FibGUgbm9kZSB0aGF0IGxvb2tzIGxpa2UgYSBjYXJ0b29uIGhhbmQgYW5kIGlzIHVzZWQgdG8gaW5kaWNhdGUgdG8gdGhlIHVzZXIgdGhhdCBhbiBhdG9tIGNhbiBiZVxyXG4gICAgLy8gbW92ZWQuICBUaGlzIHdpbGwgYmUgZHluYW1pY2FsbHkgYWRkZWQgYW5kIHJlbW92ZWQgZnJvbSB0aGUgc2NlbmUgZ3JhcGguXHJcbiAgICB0aGlzLmhhbmROb2RlID0gbmV3IEhhbmROb2RlKFxyXG4gICAgICB0aGlzLmR1YWxBdG9tTW9kZWwsXHJcbiAgICAgIHRoaXMuZHVhbEF0b21Nb2RlbC5tb3ZhYmxlQXRvbSxcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIDAsXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdoYW5kTm9kZScgKSxcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7IHBoZXRpb1JlYWRPbmx5OiB0cnVlIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBmaXhlZCBwYXJ0aWNsZVxyXG4gICAgdGhpcy5maXhlZFBhcnRpY2xlTm9kZSA9IG5ldyBQYXJ0aWNsZUZvcmNlTm9kZShcclxuICAgICAgZHVhbEF0b21Nb2RlbC5maXhlZEF0b20sXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB0cnVlLFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZml4ZWRQYXJ0aWNsZU5vZGUnIClcclxuICAgICk7XHJcbiAgICB0aGlzLmZpeGVkUGFydGljbGVOb2RlLnNldFNob3dBdHRyYWN0aXZlRm9yY2VzKCB0aGlzLnNob3dBdHRyYWN0aXZlRm9yY2VzICk7XHJcbiAgICB0aGlzLmZpeGVkUGFydGljbGVOb2RlLnNldFNob3dSZXB1bHNpdmVGb3JjZXMoIHRoaXMuc2hvd1JlcHVsc2l2ZUZvcmNlcyApO1xyXG4gICAgdGhpcy5maXhlZFBhcnRpY2xlTm9kZS5zZXRTaG93VG90YWxGb3JjZXMoIHRoaXMuc2hvd1RvdGFsRm9yY2VzICk7XHJcbiAgICB0aGlzLmZpeGVkUGFydGljbGVMYXllci5hZGRDaGlsZCggdGhpcy5maXhlZFBhcnRpY2xlTm9kZSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1vdmFibGUgcGFydGljbGVcclxuICAgIHRoaXMubW92YWJsZVBhcnRpY2xlTm9kZSA9IG5ldyBHcmFiYmFibGVQYXJ0aWNsZU5vZGUoXHJcbiAgICAgIHRoaXMuZHVhbEF0b21Nb2RlbCxcclxuICAgICAgZHVhbEF0b21Nb2RlbC5tb3ZhYmxlQXRvbSxcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHRydWUsXHJcbiAgICAgIDAsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtb3ZhYmxlUGFydGljbGVOb2RlJyApXHJcbiAgICApO1xyXG4gICAgdGhpcy5tb3ZhYmxlUGFydGljbGVOb2RlLnNldFNob3dBdHRyYWN0aXZlRm9yY2VzKCB0aGlzLnNob3dBdHRyYWN0aXZlRm9yY2VzICk7XHJcbiAgICB0aGlzLm1vdmFibGVQYXJ0aWNsZU5vZGUuc2V0U2hvd1JlcHVsc2l2ZUZvcmNlcyggdGhpcy5zaG93UmVwdWxzaXZlRm9yY2VzICk7XHJcbiAgICB0aGlzLm1vdmFibGVQYXJ0aWNsZU5vZGUuc2V0U2hvd1RvdGFsRm9yY2VzKCB0aGlzLnNob3dUb3RhbEZvcmNlcyApO1xyXG4gICAgdGhpcy5tb3ZhYmxlUGFydGljbGVMYXllci5hZGRDaGlsZCggdGhpcy5tb3ZhYmxlUGFydGljbGVOb2RlICk7XHJcbiAgICB0aGlzLm1vdmFibGVQYXJ0aWNsZUxheWVyLmFkZENoaWxkKCB0aGlzLmhhbmROb2RlICk7XHJcblxyXG4gICAgLy8gYXNzb2NpYXRlIHRoZSBoYW5kIG5vZGUgd2l0aCB0aGUgbW92YWJsZSBhdG9tXHJcbiAgICB0aGlzLmhhbmROb2RlLnNldFBhcnRpY2xlKCBkdWFsQXRvbU1vZGVsLm1vdmFibGVBdG9tICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIHB1c2ggcGluIG5vZGUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gY29udmV5IHRoZSBpZGVhIHRoYXQgdGhlIGZpeGVkIGF0b20gaXMgcGlubmVkIHRvIHRoZSBjYW52YXMuXHJcbiAgICB0aGlzLnB1c2hQaW5Ob2RlID0gbmV3IFB1c2hQaW5Ob2RlKCk7XHJcbiAgICB0aGlzLnB1c2hQaW5Ob2RlLnNjYWxlKCBQVVNIX1BJTl9XSURUSCAvIHRoaXMucHVzaFBpbk5vZGUud2lkdGggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucHVzaFBpbk5vZGUgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGNvbnRyb2wgcGFuZWxzIHRvIHRoZSBzY3JlZW4gYWZ0ZXIgdGhlIGF0b21zIHNvIHRoYXQgdGhlIGF0b21zIHdpdGggZ28gYmVoaW5kIHRoZW0uXHJcbiAgICB0aGlzLmFkZENoaWxkKCBhdG9tc0NvbnRyb2xQYW5lbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZm9yY2VzQWNjb3JkaW9uQm94ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHZhcmlvdXMgYXNwZWN0cyBvZiB0aGUgYXBwZWFyYW5jZSB3aGVuIHRoZSBzZWxlY3RlZCBhdG9tIHBhaXIgY2hhbmdlc1xyXG4gICAgZHVhbEF0b21Nb2RlbC5hdG9tUGFpclByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgZm9yY2VzQWNjb3JkaW9uQm94LnRvcCA9IGF0b21zQ29udHJvbFBhbmVsLmJvdHRvbSArIElOU0VUIC8gMjtcclxuICAgICAgZm9yY2VzQWNjb3JkaW9uQm94LmxlZnQgPSBhdG9tc0NvbnRyb2xQYW5lbC5sZWZ0O1xyXG4gICAgICB0aGlzLnVwZGF0ZVBvc2l0aW9uTWFya2VyT25HcmFwaCgpO1xyXG4gICAgICB0aGlzLnVwZGF0ZU1pbmltdW1YRm9yTW92YWJsZUF0b20oKTtcclxuICAgICAgdGhpcy51cGRhdGVQdXNoUGluUG9zaXRpb24oKTtcclxuICAgICAgdGhpcy51cGRhdGVIYW5kUG9zaXRpb24oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHB1c2ggcGluIHBvc2l0aW9uIGlmIHRoZSBhZGp1c3RhYmxlIGF0b20gZGlhbWV0ZXIgY2hhbmdlc1xyXG4gICAgZHVhbEF0b21Nb2RlbC5hZGp1c3RhYmxlQXRvbURpYW1ldGVyUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVB1c2hQaW5Qb3NpdGlvbigpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZm9yY2UgYXJyb3dzIHdoZW4gdGhlIHNldHRpbmdzIGNoYW5nZVxyXG4gICAgZHVhbEF0b21Nb2RlbC5mb3JjZXNEaXNwbGF5TW9kZVByb3BlcnR5LmxpbmsoIGZvcmNlcyA9PiB7XHJcbiAgICAgIHRoaXMuc2V0U2hvd0F0dHJhY3RpdmVGb3JjZXMoIGZvcmNlcyA9PT0gRm9yY2VEaXNwbGF5TW9kZS5DT01QT05FTlRTICk7XHJcbiAgICAgIHRoaXMuc2V0U2hvd1JlcHVsc2l2ZUZvcmNlcyggZm9yY2VzID09PSBGb3JjZURpc3BsYXlNb2RlLkNPTVBPTkVOVFMgKTtcclxuICAgICAgdGhpcy5zZXRTaG93VG90YWxGb3JjZXMoIGZvcmNlcyA9PT0gRm9yY2VEaXNwbGF5TW9kZS5UT1RBTCApO1xyXG4gICAgICBpZiAoICF0aGlzLnNob3dBdHRyYWN0aXZlRm9yY2VzICYmICF0aGlzLnNob3dUb3RhbEZvcmNlcyAmJiBmb3JjZXMgIT09IEZvcmNlRGlzcGxheU1vZGUuSElEREVOICkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvciggYGludmFsaWQgZm9yY2VzOiAke2ZvcmNlc31gICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBtb25pdG9yIHRoZSBhdG9tIGRpYW1ldGVyIGFuZCB0cmlnZ2VyIHVwZGF0ZXMgd2hlbiBjaGFuZ2VzIG9jY3VyXHJcbiAgICBkdWFsQXRvbU1vZGVsLmFkanVzdGFibGVBdG9tRGlhbWV0ZXJQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMudXBkYXRlTWluaW11bVhGb3JNb3ZhYmxlQXRvbSgpO1xyXG4gICAgICB0aGlzLnVwZGF0ZUhhbmRQb3NpdGlvbigpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGJ5IHRoZSBhbmltYXRpb24gbG9vcC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCgpIHtcclxuICAgIHRoaXMuaGFuZGxlUG9zaXRpb25DaGFuZ2VkKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUdXJuIG9uL29mZiB0aGUgZGlzcGxheWluZyBvZiB0aGUgZm9yY2UgYXJyb3dzIHRoYXQgcmVwcmVzZW50IHRoZSBhdHRyYWN0aXZlIGZvcmNlLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd0ZvcmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRTaG93QXR0cmFjdGl2ZUZvcmNlcyggc2hvd0ZvcmNlcyApIHtcclxuICAgIHRoaXMubW92YWJsZVBhcnRpY2xlTm9kZS5zZXRTaG93QXR0cmFjdGl2ZUZvcmNlcyggc2hvd0ZvcmNlcyApO1xyXG4gICAgdGhpcy5maXhlZFBhcnRpY2xlTm9kZS5zZXRTaG93QXR0cmFjdGl2ZUZvcmNlcyggc2hvd0ZvcmNlcyApO1xyXG4gICAgdGhpcy5zaG93QXR0cmFjdGl2ZUZvcmNlcyA9IHNob3dGb3JjZXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUdXJuIG9uL29mZiB0aGUgZGlzcGxheWluZyBvZiB0aGUgZm9yY2UgYXJyb3dzIHRoYXQgcmVwcmVzZW50IHRoZSByZXB1bHNpdmUgZm9yY2UuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBzaG93Rm9yY2VzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFNob3dSZXB1bHNpdmVGb3JjZXMoIHNob3dGb3JjZXMgKSB7XHJcbiAgICB0aGlzLm1vdmFibGVQYXJ0aWNsZU5vZGUuc2V0U2hvd1JlcHVsc2l2ZUZvcmNlcyggc2hvd0ZvcmNlcyApO1xyXG4gICAgdGhpcy5maXhlZFBhcnRpY2xlTm9kZS5zZXRTaG93UmVwdWxzaXZlRm9yY2VzKCBzaG93Rm9yY2VzICk7XHJcbiAgICB0aGlzLnNob3dSZXB1bHNpdmVGb3JjZXMgPSBzaG93Rm9yY2VzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVHVybiBvbi9vZmYgdGhlIGRpc3BsYXlpbmcgb2YgdGhlIGZvcmNlIGFycm93cyB0aGF0IHJlcHJlc2VudCB0aGUgdG90YWwgZm9yY2UsIGkuZS4gYXR0cmFjdGl2ZSBwbHVzIHJlcHVsc2l2ZS5cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dGb3JjZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0U2hvd1RvdGFsRm9yY2VzKCBzaG93Rm9yY2VzICkge1xyXG4gICAgdGhpcy5tb3ZhYmxlUGFydGljbGVOb2RlLnNldFNob3dUb3RhbEZvcmNlcyggc2hvd0ZvcmNlcyApO1xyXG4gICAgdGhpcy5maXhlZFBhcnRpY2xlTm9kZS5zZXRTaG93VG90YWxGb3JjZXMoIHNob3dGb3JjZXMgKTtcclxuICAgIHRoaXMuc2hvd1RvdGFsRm9yY2VzID0gc2hvd0ZvcmNlcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgaGFuZGxlUG9zaXRpb25DaGFuZ2VkKCkge1xyXG5cclxuICAgIHRoaXMudXBkYXRlUG9zaXRpb25NYXJrZXJPbkdyYXBoKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUZvcmNlVmVjdG9ycygpO1xyXG4gICAgdGhpcy51cGRhdGVIYW5kUG9zaXRpb24oKTtcclxuXHJcbiAgICBjb25zdCBzaW1EaW1lbnNpb25zID0gcGhldC5qb2lzdC5zaW0uZGltZW5zaW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCB3aWR0aCA9IHNpbURpbWVuc2lvbnMud2lkdGg7XHJcbiAgICBjb25zdCBoZWlnaHQgPSBzaW1EaW1lbnNpb25zLmhlaWdodDtcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IE1hdGgubWluKCB3aWR0aCAvIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoLCBoZWlnaHQgLyB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKTtcclxuICAgIGxldCBhdG9tV2luZG93UG9zaXRpb24gPSBzY2FsZSAqICggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0aGlzLmR1YWxBdG9tTW9kZWwubW92YWJsZUF0b20uZ2V0WCgpICkgKTtcclxuXHJcbiAgICAvLyBhY2NvdW50IGZvciB0aGUgdmlldyBjZW50ZXJpbmdcclxuICAgIGlmICggc2NhbGUgPT09IGhlaWdodCAvIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCApIHtcclxuICAgICAgYXRvbVdpbmRvd1Bvc2l0aW9uICs9ICggd2lkdGggLSB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAqIHNjYWxlICkgLyAyIC0gNTA7XHJcbiAgICB9XHJcbiAgICBpZiAoIGF0b21XaW5kb3dQb3NpdGlvbiA+IHdpZHRoICkge1xyXG4gICAgICBpZiAoICF0aGlzLnJldHVybkF0b21CdXR0b24uaXNWaXNpYmxlKCkgKSB7XHJcbiAgICAgICAgLy8gVGhlIHBhcnRpY2xlIGlzIG9mZiB0aGUgY2FudmFzIGFuZCB0aGUgYnV0dG9uIGlzIG5vdCB5ZXQgc2hvd24sIHNvIHNob3cgaXQuXHJcbiAgICAgICAgdGhpcy5yZXR1cm5BdG9tQnV0dG9uLnNldFZpc2libGUoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucmV0dXJuQXRvbUJ1dHRvbi5pc1Zpc2libGUoKSApIHtcclxuICAgICAgLy8gVGhlIHBhcnRpY2xlIGlzIG9uIHRoZSBjYW52YXMgYnV0IHRoZSBidXR0b24gaXMgdmlzaWJsZSAod2hpY2ggaXQgc2hvdWxkbid0IGJlKSwgc28gaGlkZSBpdC5cclxuICAgICAgdGhpcy5yZXR1cm5BdG9tQnV0dG9uLnNldFZpc2libGUoIGZhbHNlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIHBvc2l0aW9uIG1hcmtlciBvbiB0aGUgTGVubmFyZC1Kb25lcyBwb3RlbnRpYWwgZGlhZ3JhbS4gVGhpcyB3aWxsIGluZGljYXRlIHRoZSBhbW91bnQgb2YgcG90ZW50aWFsXHJcbiAgICogYmVpbmcgZXhwZXJpZW5jZWQgYmV0d2VlbiB0aGUgdHdvIGF0b21zIGluIHRoZSBtb2RlbC5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZVBvc2l0aW9uTWFya2VyT25HcmFwaCgpIHtcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gdGhpcy5maXhlZFBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuZGlzdGFuY2UoIHRoaXMubW92YWJsZVBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgIHRoaXMuaW50ZXJhY3RpdmVQb3RlbnRpYWxHcmFwaC5zZXRNYXJrZXJQb3NpdGlvbiggZGlzdGFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlUHVzaFBpblBvc2l0aW9uKCkge1xyXG4gICAgY29uc3QgcGlubmVkQXRvbVBvc2l0aW9uID0gdGhpcy5kdWFsQXRvbU1vZGVsLmZpeGVkQXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgcGlubmVkQXRvbVJhZGl1cyA9IHRoaXMuZHVhbEF0b21Nb2RlbC5maXhlZEF0b20ucmFkaXVzUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBtdnQgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgIHRoaXMucHVzaFBpbk5vZGUucmlnaHQgPSBtdnQubW9kZWxUb1ZpZXdYKCBwaW5uZWRBdG9tUG9zaXRpb24ueCAtIHBpbm5lZEF0b21SYWRpdXMgKiAwLjUgKTtcclxuICAgIHRoaXMucHVzaFBpbk5vZGUuYm90dG9tID0gbXZ0Lm1vZGVsVG9WaWV3WSggcGlubmVkQXRvbVBvc2l0aW9uLnkgLSBwaW5uZWRBdG9tUmFkaXVzICogMC41ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUhhbmRQb3NpdGlvbigpIHtcclxuICAgIHRoaXMuaGFuZE5vZGUubGVmdCA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggdGhpcy5tb3ZhYmxlUGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS54ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIG1pbmltdW0gWCB2YWx1ZSBhbGxvd2VkIGZvciB0aGUgbW92YWJsZSBhdG9tLiAgVGhpcyBwcmV2ZW50cyB0b28gbXVjaCBvdmVybGFwIGJldHdlZW4gdGhlIGF0b21zLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB1cGRhdGVNaW5pbXVtWEZvck1vdmFibGVBdG9tKCkge1xyXG5cclxuICAgIC8vIFVzZSBhIG1pbmltdW0gWCB2YWx1ZSB0aGF0IGlzIGp1c3QgYSBiaXQgbGVzcyB0aGFuIHRoZSBzaWdtYSB2YWx1ZSwgc2luY2UgdGhlIHJlcHVsc2l2ZSBwb3RlbnRpYWwgZ29lcyB1cFxyXG4gICAgLy8gcmFwaWRseSB3aXRoIHNtYWxsZXIgdmFsdWVzLlxyXG4gICAgY29uc3QgbWluWEluTW9kZWwgPSB0aGlzLmR1YWxBdG9tTW9kZWwuZ2V0U2lnbWEoKSAqIDAuOTtcclxuICAgIHRoaXMuaW50ZXJhY3RpdmVQb3RlbnRpYWxHcmFwaC5zZXRNaW5YRm9yQXRvbSggbWluWEluTW9kZWwgKTtcclxuICAgIGNvbnN0IG1pblhJblZpZXcgPSB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIG1pblhJbk1vZGVsICk7XHJcbiAgICB0aGlzLm1vdmFibGVQYXJ0aWNsZU5vZGUuc2V0TWluWCggbWluWEluVmlldyApO1xyXG4gICAgdGhpcy5oYW5kTm9kZS5zZXRNaW5YKCBtaW5YSW5WaWV3ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUZvcmNlVmVjdG9ycygpIHtcclxuICAgIGlmICggKCB0aGlzLmZpeGVkUGFydGljbGUgIT09IG51bGwgKSAmJiAoIHRoaXMubW92YWJsZVBhcnRpY2xlICE9PSBudWxsICkgKSB7XHJcbiAgICAgIHRoaXMuZml4ZWRQYXJ0aWNsZU5vZGUuc2V0Rm9yY2VzKCB0aGlzLmR1YWxBdG9tTW9kZWwuYXR0cmFjdGl2ZUZvcmNlLCAtdGhpcy5kdWFsQXRvbU1vZGVsLnJlcHVsc2l2ZUZvcmNlICk7XHJcbiAgICAgIHRoaXMubW92YWJsZVBhcnRpY2xlTm9kZS5zZXRGb3JjZXMoIC10aGlzLmR1YWxBdG9tTW9kZWwuYXR0cmFjdGl2ZUZvcmNlLCB0aGlzLmR1YWxBdG9tTW9kZWwucmVwdWxzaXZlRm9yY2UgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnN0YXRlc09mTWF0dGVyLnJlZ2lzdGVyKCAnQXRvbWljSW50ZXJhY3Rpb25zU2NyZWVuVmlldycsIEF0b21pY0ludGVyYWN0aW9uc1NjcmVlblZpZXcgKTtcclxuXHJcbmV4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