// Copyright 2020-2022, University of Colorado Boulder

/**
 * @author Todd Holden (https://tholden79.wixsite.com/mysite2)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ProtractorNode from '../../../../scenery-phet/js/ProtractorNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { DragListener, Node, Path, Rectangle, RichText, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import XrayDiffractionConstants from '../../common/XrayDiffractionConstants.js';
import xrayDiffraction from '../../xrayDiffraction.js';
import XrayDiffractionStrings from '../../XrayDiffractionStrings.js';
import XrayDiffractionModel from '../model/XrayDiffractionModel.js';
import CrystalNode from './CrystalNode.js';
import LightPathNode from './LightPathNode.js';
import XrayControlPanel from './XrayControlPanel.js';

// strings
const dSinThetaString = XrayDiffractionStrings.dSinTheta;
const inPhaseString = XrayDiffractionStrings.inPhase;
const DIMENSION_ARROW_OPTIONS = {
  fill: 'black',
  stroke: null,
  tailWidth: 2,
  headWidth: 7,
  headHeight: 20,
  doubleHead: true
};
const AMP = 10;
const braggEquationString = XrayDiffractionStrings.braggEquation;
const interplaneDistanceString = XrayDiffractionStrings.interplaneDistance;
const lengthUnitString = XrayDiffractionStrings.lengthUnit;
const pLDString = XrayDiffractionStrings.pLD;
const SCALE_FACTOR = XrayDiffractionConstants.SCALE_FACTOR;
const TEXT_OPTIONS = {
  font: new PhetFont({
    family: 'Verdana',
    size: 14
  }),
  maxWidth: 200,
  align: 'center',
  setBoundsMethod: 'accurate'
};
const TOP_RAY_LENGTH = 400; // Arbitrary length of top incident ray to start it near the top left

// Arbitrary location of the crystal near the bottom center
const CRYSTAL_NODE_OPTIONS = {
  centerX: 400,
  centerY: 440
};
const ELEMENT_SPACING = XrayDiffractionConstants.ELEMENT_SPACING;
class XrayDiffractionScreenView extends ScreenView {
  /**
   * @param {XrayDiffractionModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    assert && assert(model instanceof XrayDiffractionModel, 'invalid model');
    assert && assert(tandem instanceof Tandem, 'invalid tandem');
    super({
      tandem: tandem
    });

    // @private - used to display the array of atoms. Using container to keep the correct order when we removeChild
    this.crystalNode = new CrystalNode(model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS);
    this.crystalNodeContainer = new Node();
    this.crystalNodeContainer.addChild(this.crystalNode);
    this.addChild(this.crystalNodeContainer);

    // @private - used to draw the current frame of the light waves. Updated at each timestep when animating.
    this.lightPathsNode = new Node();
    this.addChild(this.lightPathsNode);

    // @private node for displaying PLD region
    this.pLDNode = new Node();
    this.pLDChanged = true;
    this.addChild(this.pLDNode);

    // Initial drawing of light onto the screen.
    this.drawLight(model, this.crystalNode);

    // @protected Time Controls - subclass is responsible for play/pause of light animation
    this.timeControlNode = new TimeControlNode(model.animateProperty, {
      buttonGroupXSpacing: 25,
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          // when the Step button is pressed
          listener: () => {
            // .04 s - about 2 timesteps seems about right
            model.manualStep(0.04);
            this.drawLight(model, this.crystalNode);
          }
        }
      },
      tandem: tandem.createTandem('timeControlNode')
    });
    // layout positioning done after control panel is created

    // create the protractor node
    const showProtractorProperty = new BooleanProperty(false);
    const protractorNode = new ProtractorNode({
      visibleProperty: showProtractorProperty,
      rotatable: true,
      angle: Math.PI / 2,
      scale: 0.8
    });
    const protractorPositionProperty = new Vector2Property(protractorNode.center);
    // This link exists for the entire duration of the sim. No need to dispose.
    showProtractorProperty.linkAttribute(protractorNode, 'visible');
    const protractorNodeIcon = ProtractorNode.createIcon({
      scale: 0.24
    });
    // This link exists for the entire duration of the sim. No need to dispose.
    showProtractorProperty.link(showProtractor => {
      protractorNodeIcon.visible = !showProtractor;
    });

    // listener created once and needed for life of simulation. No need to dispose.
    const protractorNodeListener = new DragListener({
      positionProperty: protractorPositionProperty,
      useParentOffset: true,
      end: () => {
        if (protractorNode.getGlobalBounds().intersectsBounds(this.toolbox.getGlobalBounds())) {
          showProtractorProperty.value = false;
        }
      }
    });
    // listener created once and needed for life of simulation. No need to dispose.
    protractorNode.addInputListener(protractorNodeListener);

    // This link exists for the entire duration of the sim. No need to dispose.
    protractorPositionProperty.link(protractorPosition => {
      protractorNode.center = protractorPosition;
    });

    // Initialize the protractor icon and set up the first drag off the toolbox
    initializeIcon(protractorNodeIcon, showProtractorProperty, event => {
      // Center the protractor on the pointer
      protractorPositionProperty.value = protractorNode.globalToParentPoint(event.pointer.point);
      // listener created once and needed for life of simulation. No need to dispose.
      protractorNodeListener.press(event);
      showProtractorProperty.value = true;
    });

    // add tape measure
    const measuringTapeProperty = new Property({
      name: 'Å',
      multiplier: 1 / SCALE_FACTOR
    });
    const measuringTapeNode = new MeasuringTapeNode(measuringTapeProperty, {
      // translucent white background, same value as in Projectile Motion, see https://github.com/phetsims/projectile-motion/issues/156
      textBackgroundColor: 'rgba(255,255,255,0.6)',
      textColor: 'black',
      tipPositionProperty: new Vector2Property(new Vector2(5 * SCALE_FACTOR, 0)),
      // 5 Angstrom initial length

      // Drop in toolbox
      baseDragEnded: () => {
        if (measuringTapeNode.getGlobalBounds().intersectsBounds(this.toolbox.getGlobalBounds())) {
          isMeasuringTapeInPlayAreaProperty.value = false;
          measuringTapeNode.visible = false;
          measuringTapeNode.reset();
        }
      }
    });
    const measuringTapeIcon = MeasuringTapeNode.createIcon({
      scale: 0.65
    });

    //TODO this should be passed to new MeasuringTapeNode as visibleProperty option value
    const isMeasuringTapeInPlayAreaProperty = new BooleanProperty(false);
    measuringTapeNode.visible = false;
    initializeIcon(measuringTapeIcon, isMeasuringTapeInPlayAreaProperty, event => {
      // When clicking on the measuring tape icon, base point at cursor
      const delta = measuringTapeNode.tipPositionProperty.value.minus(measuringTapeNode.basePositionProperty.value);
      measuringTapeNode.basePositionProperty.value = measuringTapeNode.globalToParentPoint(event.pointer.point);
      measuringTapeNode.tipPositionProperty.value = measuringTapeNode.basePositionProperty.value.plus(delta);
      measuringTapeNode.startBaseDrag(event);
      isMeasuringTapeInPlayAreaProperty.value = true;
      measuringTapeNode.visible = true;
    });
    const toolboxNodes = [protractorNodeIcon, measuringTapeIcon];

    // @private - used to display a toolbox containing a protractor and ruler for the user
    this.toolbox = new Panel(new VBox({
      spacing: 10,
      children: toolboxNodes,
      excludeInvisibleChildrenFromBounds: false
    }), {
      xMargin: 10,
      yMargin: 10,
      stroke: '#696969',
      lineWidth: 1.5,
      fill: '#eeeeee',
      left: this.layoutBounds.minX + XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN
    });
    this.addChild(this.toolbox);
    this.addChild(protractorNode);
    this.addChild(measuringTapeNode);

    // max width set to 260 which is less than the exit ray length
    const inPhaseText = new RichText('', {
      maxWidth: 260
    });
    this.addChild(inPhaseText);

    // Note when we need to redraw PLD region
    // listener created once and needed for life of simulation. No need to dispose.
    model.pLDWavelengthsProperty.lazyLink(() => {
      this.pLDChanged = true;
    });

    // show/hide the PLD node when the checkbox linked to pathDifferenceProperty is checked.
    // listener created once and needed for life of simulation. No need to dispose.
    model.pathDifferenceProperty.link(hideTF => {
      this.pLDNode.visible = hideTF;
    });

    // displays message when path length difference (PLD) is integral multiple of the wavelength
    // listener created once and needed for life of simulation. No need to dispose.
    model.inPhaseProperty.lazyLink(() => {
      if (model.inPhaseProperty.value) {
        // reorient text and make it visible
        const theta = model.sourceAngleProperty.get();
        const rayTextEnd = new Vector2(this.crystalNode.centerX, this.crystalNode.centerY).minus(model.lattice.sites[0].timesScalar(SCALE_FACTOR));

        // find the center of the top outgoing ray and displace the text a little above it
        let rayTextCenter = new Vector2(TOP_RAY_LENGTH / 2, 0);
        rayTextCenter = rayTextEnd.minus(rayTextCenter.rotated(Math.PI - theta));
        if (model.wavefrontProperty.value === 'none') {
          // placement a little above the top of the wave 2.2 is arbitrary to put the text center high enough
          rayTextCenter = rayTextCenter.addXY(-2.2 * AMP * Math.sin(theta), -2.2 * AMP * Math.cos(theta));
        } else {
          // calculate the distance between light rays
          const raySep = 4 * (model.lattice.latticeConstantsProperty.value.z * Math.cos(theta));
          // placement right above the wavefronts
          rayTextCenter = rayTextCenter.addXY(-(raySep + AMP) * Math.sin(theta), -(raySep + AMP) * Math.cos(theta));
        }
        inPhaseText.rotation = -model.sourceAngleProperty.value;
        inPhaseText.string = StringUtils.fillIn(inPhaseString, {
          wavelengths: Utils.toFixed(model.pLDWavelengthsProperty.value, 0)
        });
        inPhaseText.center = rayTextCenter;
      } else {
        inPhaseText.string = '';
      }
    });

    // update display when incident angle, wavelength, ray grid, or path difference checkbox changes
    // This link exists for the entire duration of the sim. No need to dispose.
    Multilink.multilink([model.sourceAngleProperty, model.sourceWavelengthProperty, model.horizontalRaysProperty, model.verticalRaysProperty, model.wavefrontProperty, model.pathDifferenceProperty, model.showTransmittedProperty], () => {
      this.drawLight(model, this.crystalNode);
    });

    // update crystal when lattice parameters change
    // This link exists for the entire duration of the sim. No need to dispose.
    Multilink.multilink([model.lattice.aConstantProperty, model.lattice.cConstantProperty], () => {
      model.lattice.latticeConstantsProperty.value.x = model.lattice.aConstantProperty.value;
      model.lattice.latticeConstantsProperty.value.z = model.lattice.cConstantProperty.value;
      model.lattice.updateSites();
      this.crystalNodeContainer.removeChild(this.crystalNode);
      this.crystalNode = new CrystalNode(model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS);
      this.crystalNodeContainer.addChild(this.crystalNode);
      this.drawLight(model, this.crystalNode);
    });

    // @private - used to create an input panel for users to adjust parameters of the simulation
    this.controlPanel = new XrayControlPanel(model, this.timeControlNode);

    // Layout for controls done manually at the top right
    this.controlPanel.top = XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN;
    this.controlPanel.right = this.layoutBounds.maxX - XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN;
    this.addChild(this.controlPanel);

    // update view on model step
    model.addStepListener(() => {
      if (model.animateProperty) {
        this.drawLight(model, this.crystalNode);
      }
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
        measuringTapeNode.reset();
        this.crystalNodeContainer.removeChild(this.crystalNode);
        this.crystalNode = new CrystalNode(model.lattice.sites, model.lattice.latticeConstantsProperty.value, CRYSTAL_NODE_OPTIONS);
        this.crystalNodeContainer.addChild(this.crystalNode);
        this.drawLight(model, this.crystalNode);
        showProtractorProperty.reset();
        protractorNode.reset();
        isMeasuringTapeInPlayAreaProperty.value = false;
        measuringTapeNode.visible = false;
        measuringTapeNode.reset();
      },
      right: this.layoutBounds.maxX - XrayDiffractionConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - XrayDiffractionConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);
  }

  /**
   * Resets the view.
   * @public
   */
  reset() {
    //  done in the reset all button
  }

  /**
   * Draws the light rays (incoming and outgoing) along with the path length difference (PLD) region if checked.
   * Repeated calls to Math.sin() could be eliminated by defining a variable.
   * @param {XrayDiffractionModel} model
   * @param {CrystalNode} crystalNode
   * @public
   */
  drawLight(model, crystalNode) {
    this.lightPathsNode.removeAllChildren();
    const theta = model.sourceAngleProperty.get();
    const lamda = SCALE_FACTOR * model.sourceWavelengthProperty.get();
    const raySeparation = SCALE_FACTOR * (model.lattice.latticeConstantsProperty.value.z * Math.cos(theta));
    const incidentRay1End = new Vector2(crystalNode.centerX, crystalNode.centerY).minus(model.lattice.sites[0].timesScalar(SCALE_FACTOR));

    // Arbitrary length (400 pixels) of top incident ray to start it near the top left
    let incidentRay1Start = new Vector2(TOP_RAY_LENGTH, 0);
    incidentRay1Start = incidentRay1End.minus(incidentRay1Start.rotated(model.sourceAngleProperty.get()));

    // Main logic to draw the light rays
    const horiz = Math.floor(Math.min(model.horizontalRaysProperty.get(), 20 / model.lattice.latticeConstantsProperty.get().x));
    const vert = Math.min(Math.floor(model.verticalRaysProperty.get()), 1 + 2 * Math.floor(20 / model.lattice.latticeConstantsProperty.get().z));
    for (let i = -horiz; i <= horiz; i++) {
      for (let j = 0; j < vert; j++) {
        const shift = new Vector2(SCALE_FACTOR * i * model.lattice.latticeConstantsProperty.get().x, -SCALE_FACTOR * j * model.lattice.latticeConstantsProperty.get().z);
        const distance = SCALE_FACTOR * (i * model.lattice.latticeConstantsProperty.get().x * Math.sin(theta) + j * model.lattice.latticeConstantsProperty.get().z * Math.cos(theta));
        const incidentRayStart = new Vector2(incidentRay1Start.x - distance * Math.sin(theta), incidentRay1Start.y + distance * Math.cos(theta));
        const incidentRayEnd = incidentRay1End.minus(shift);
        const incidentRayLength = incidentRayEnd.minus(incidentRayStart).getMagnitude();
        const exitRayPhase = incidentRayLength / lamda * 2 * Math.PI + model.startPhase;
        const extraLength = 2 * SCALE_FACTOR * Math.cos(theta) * i * model.lattice.latticeConstantsProperty.get().x; // accomodates extra length for added horizontal rays
        const exitRayEnd = new Vector2(2 * incidentRayEnd.x - incidentRayStart.x + extraLength * Math.cos(theta), incidentRayStart.y - extraLength * Math.sin(theta));
        this.lightPathsNode.addChild(new LightPathNode(incidentRayStart, incidentRayEnd, SCALE_FACTOR * model.sourceWavelengthProperty.get(), {
          amplitude: AMP,
          startPhase: model.startPhase,
          waveFrontWidth: model.wavefrontProperty.value === 'none' ? 0 : Math.max(AMP, raySeparation - 2),
          waveFrontPattern: model.wavefrontProperty.value
        }));
        this.lightPathsNode.addChild(new LightPathNode(incidentRayEnd, exitRayEnd, SCALE_FACTOR * model.sourceWavelengthProperty.get(), {
          amplitude: AMP,
          startPhase: exitRayPhase,
          waveFrontWidth: model.wavefrontProperty.value === 'none' ? 0 : Math.max(AMP, raySeparation - 2),
          waveFrontPattern: model.wavefrontProperty.value,
          stroke: model.inPhaseProperty.value ? 'black' : 'gray',
          lineWidth: model.inPhaseProperty.value ? 2 : 1,
          waveFrontLineWidth: model.inPhaseProperty.value ? 3 : 1
        }));
        if (model.showTransmittedProperty.value) {
          // when incident ray is longer, transmitted ray is shorter
          let transmittedRayEnd = new Vector2(2 * TOP_RAY_LENGTH - incidentRayLength, 0);
          transmittedRayEnd = incidentRayEnd.minus(transmittedRayEnd.rotated(model.sourceAngleProperty.get() + Math.PI));
          this.lightPathsNode.addChild(new LightPathNode(incidentRayEnd, transmittedRayEnd, SCALE_FACTOR * model.sourceWavelengthProperty.get(), {
            amplitude: AMP,
            startPhase: exitRayPhase,
            waveFrontWidth: model.wavefrontProperty.value === 'none' ? 0 : Math.max(AMP, raySeparation - 2),
            waveFrontPattern: model.wavefrontProperty.value,
            stroke: model.inPhaseProperty.value ? 'hsl(0,0%,25%)' : 'black',
            lineWidth: model.inPhaseProperty.value ? 1.5 : 2,
            waveFrontLineWidth: model.inPhaseProperty.value ? 2 : 3
          }));
        }
      }
    }

    // if checked, draw the Path Length Difference region (only if it has changed)
    if (model.pathDifferenceProperty.value && this.pLDChanged) {
      this.pLDChanged = false;
      this.pLDNode.removeAllChildren();
      const dSinTheta = SCALE_FACTOR * (model.lattice.latticeConstantsProperty.value.z * Math.sin(theta));
      const lineStart = incidentRay1End;
      const lineInEnd = new Vector2(lineStart.x - (AMP + raySeparation) * Math.sin(theta), lineStart.y + (AMP + raySeparation) * Math.cos(theta));
      const lineOutEnd = new Vector2(lineStart.x + (AMP + raySeparation) * Math.sin(theta), lineStart.y + (AMP + raySeparation) * Math.cos(theta));
      const pLD = new Shape(); // Shape to show the edges of the path length difference
      pLD.moveToPoint(lineInEnd);
      pLD.lineToPoint(lineStart);
      pLD.lineToPoint(lineOutEnd);
      const pLDPath = new Path(pLD, {
        stroke: 'blue',
        lineWidth: 1
      });
      this.pLDNode.addChild(pLDPath);

      // Shade in the region of path length difference
      const pLDRegion1 = new Shape();
      const pLDRegion2 = new Shape();
      pLDRegion1.moveToPoint(lineInEnd);
      pLDRegion1.lineToRelative(dSinTheta * Math.cos(theta), dSinTheta * Math.sin(theta));
      pLDRegion1.lineToRelative(2 * AMP * Math.sin(theta), -2 * AMP * Math.cos(theta));
      pLDRegion1.lineToRelative(-dSinTheta * Math.cos(theta), -dSinTheta * Math.sin(theta));
      pLDRegion2.moveToPoint(lineOutEnd);
      pLDRegion2.lineToRelative(-dSinTheta * Math.cos(theta), dSinTheta * Math.sin(theta));
      pLDRegion2.lineToRelative(-2 * AMP * Math.sin(theta), -2 * AMP * Math.cos(theta));
      pLDRegion2.lineToRelative(dSinTheta * Math.cos(theta), -dSinTheta * Math.sin(theta));
      const pLDRegionOptions = {
        lineWidth: 1,
        fill: 'rgba( 64, 0, 0, 0.25 )'
      }; // light pink region to show PLD
      const pLDRegionPath1 = new Path(pLDRegion1, pLDRegionOptions);
      const pLDRegionPath2 = new Path(pLDRegion2, pLDRegionOptions);
      this.pLDNode.addChild(pLDRegionPath1);
      this.pLDNode.addChild(pLDRegionPath2);

      // add d sin(θ) and dimension arrow
      const pLDArrowStart = lineStart.plusXY((ELEMENT_SPACING + AMP + raySeparation) * Math.sin(theta), (ELEMENT_SPACING + AMP + raySeparation) * Math.cos(theta));
      const pLDArrowEnd = pLDArrowStart.plusXY(-dSinTheta * Math.cos(theta), dSinTheta * Math.sin(theta));
      const pLDLabelCenter = pLDArrowStart.plusXY(ELEMENT_SPACING * Math.sin(theta) - dSinTheta * Math.cos(theta) / 2, ELEMENT_SPACING * Math.cos(theta) + dSinTheta * Math.sin(theta) / 2);
      const pLDDimensionArrow = new ArrowNode(pLDArrowStart.x, pLDArrowStart.y, pLDArrowEnd.x, pLDArrowEnd.y, DIMENSION_ARROW_OPTIONS);
      const pLDDimensionLabel = new RichText(dSinThetaString, {
        maxWidth: 200,
        left: pLDLabelCenter.x,
        centerY: pLDLabelCenter.y
      });

      // add a translucent white background behind the label text - could also use BackgroundNode
      const pLDLabelBackground = new Rectangle(pLDDimensionLabel.x, pLDDimensionLabel.top, pLDDimensionLabel.width + 2, pLDDimensionLabel.height + 2, 4, 4, {
        fill: 'white',
        opacity: 0.65
      });
      this.pLDNode.addChild(pLDLabelBackground);
      this.pLDNode.addChild(pLDDimensionLabel);
      this.pLDNode.addChild(pLDDimensionArrow);
      this.pLDNode.setVisible(true);

      // Show Path difference information next to crystal
      const pLDDiagramBG = new Rectangle(0, 0, 2 * dSinTheta, 2 * AMP, {
        lineWidth: model.inPhaseProperty.value ? 2 : 0.5,
        stroke: 'black',
        fill: 'rgba( 64, 0, 0, 0.25 )'
      });
      const pLDDiagram = new LightPathNode(new Vector2(pLDDiagramBG.left, AMP), new Vector2(pLDDiagramBG.right, AMP), model.sourceWavelengthProperty.value * SCALE_FACTOR, {
        amplitude: AMP,
        waveFrontWidth: 2 * AMP,
        waveFrontPattern: () => 'black'
      });
      pLDDiagram.addChild(pLDDiagramBG); // add a background to the light wave

      const pLDDiagramDimensionArrow = new ArrowNode(pLDDiagramBG.left, 0, pLDDiagramBG.right, 0, DIMENSION_ARROW_OPTIONS);

      // Text nodes that reflects 2dsin(Theta), and 2dsin(Theta)/wavelength
      const _2dSinText = new RichText(StringUtils.fillIn(pLDString, {
        interplaneDistance: interplaneDistanceString,
        value: Utils.toFixed(model.pLDProperty.value, 1),
        unit: lengthUnitString
      }), TEXT_OPTIONS);
      const _2dSinLambdaText = new RichText(StringUtils.fillIn(braggEquationString, {
        interplaneDistance: interplaneDistanceString,
        value: Utils.toFixed(model.pLDWavelengthsProperty.value, 2)
      }), TEXT_OPTIONS);
      const pLDPanel = new Panel(new VBox({
        children: [_2dSinLambdaText, pLDDiagram, pLDDiagramDimensionArrow, _2dSinText],
        align: 'center',
        spacing: ELEMENT_SPACING
      }), {
        xMargin: 0,
        yMargin: 0,
        fill: 'rgba( 255, 255, 255, 0.75 )',
        lineWidth: 0,
        left: this.crystalNode.right,
        centerY: pLDLabelCenter.y,
        cornerRadius: 6
      });
      pLDPanel.right = Math.min(pLDPanel.right, this.controlPanel.left); // avoid covering the control panels
      this.pLDNode.addChild(pLDPanel);
    }
  }

  /**
   * Steps the view.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step(dt) {
    // stepping handeled in model
  }
}

/**
 * Initialize the icon for use in the toolbox.
 * @param {Node} node
 * @param {Property.<boolean>} inPlayAreaProperty
 * @param {function} forwardingListener
 */
const initializeIcon = (node, inPlayAreaProperty, forwardingListener) => {
  node.cursor = 'pointer';
  // These links and listeners exists for the entire duration of the sim. No need to dispose.
  inPlayAreaProperty.link(inPlayArea => {
    node.visible = !inPlayArea;
  });
  node.addInputListener(DragListener.createForwardingListener(forwardingListener));
};
xrayDiffraction.register('XrayDiffractionScreenView', XrayDiffractionScreenView);
export default XrayDiffractionScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIlV0aWxzIiwiVmVjdG9yMiIsIlZlY3RvcjJQcm9wZXJ0eSIsIlNjcmVlblZpZXciLCJTaGFwZSIsIlN0cmluZ1V0aWxzIiwiQXJyb3dOb2RlIiwiUmVzZXRBbGxCdXR0b24iLCJNZWFzdXJpbmdUYXBlTm9kZSIsIlBoZXRGb250IiwiUHJvdHJhY3Rvck5vZGUiLCJUaW1lQ29udHJvbE5vZGUiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUGF0aCIsIlJlY3RhbmdsZSIsIlJpY2hUZXh0IiwiVkJveCIsIlBhbmVsIiwiVGFuZGVtIiwiWHJheURpZmZyYWN0aW9uQ29uc3RhbnRzIiwieHJheURpZmZyYWN0aW9uIiwiWHJheURpZmZyYWN0aW9uU3RyaW5ncyIsIlhyYXlEaWZmcmFjdGlvbk1vZGVsIiwiQ3J5c3RhbE5vZGUiLCJMaWdodFBhdGhOb2RlIiwiWHJheUNvbnRyb2xQYW5lbCIsImRTaW5UaGV0YVN0cmluZyIsImRTaW5UaGV0YSIsImluUGhhc2VTdHJpbmciLCJpblBoYXNlIiwiRElNRU5TSU9OX0FSUk9XX09QVElPTlMiLCJmaWxsIiwic3Ryb2tlIiwidGFpbFdpZHRoIiwiaGVhZFdpZHRoIiwiaGVhZEhlaWdodCIsImRvdWJsZUhlYWQiLCJBTVAiLCJicmFnZ0VxdWF0aW9uU3RyaW5nIiwiYnJhZ2dFcXVhdGlvbiIsImludGVycGxhbmVEaXN0YW5jZVN0cmluZyIsImludGVycGxhbmVEaXN0YW5jZSIsImxlbmd0aFVuaXRTdHJpbmciLCJsZW5ndGhVbml0IiwicExEU3RyaW5nIiwicExEIiwiU0NBTEVfRkFDVE9SIiwiVEVYVF9PUFRJT05TIiwiZm9udCIsImZhbWlseSIsInNpemUiLCJtYXhXaWR0aCIsImFsaWduIiwic2V0Qm91bmRzTWV0aG9kIiwiVE9QX1JBWV9MRU5HVEgiLCJDUllTVEFMX05PREVfT1BUSU9OUyIsImNlbnRlclgiLCJjZW50ZXJZIiwiRUxFTUVOVF9TUEFDSU5HIiwiWHJheURpZmZyYWN0aW9uU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0YW5kZW0iLCJhc3NlcnQiLCJjcnlzdGFsTm9kZSIsImxhdHRpY2UiLCJzaXRlcyIsImxhdHRpY2VDb25zdGFudHNQcm9wZXJ0eSIsInZhbHVlIiwiY3J5c3RhbE5vZGVDb250YWluZXIiLCJhZGRDaGlsZCIsImxpZ2h0UGF0aHNOb2RlIiwicExETm9kZSIsInBMRENoYW5nZWQiLCJkcmF3TGlnaHQiLCJ0aW1lQ29udHJvbE5vZGUiLCJhbmltYXRlUHJvcGVydHkiLCJidXR0b25Hcm91cFhTcGFjaW5nIiwicGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnMiLCJzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnMiLCJsaXN0ZW5lciIsIm1hbnVhbFN0ZXAiLCJjcmVhdGVUYW5kZW0iLCJzaG93UHJvdHJhY3RvclByb3BlcnR5IiwicHJvdHJhY3Rvck5vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJyb3RhdGFibGUiLCJhbmdsZSIsIk1hdGgiLCJQSSIsInNjYWxlIiwicHJvdHJhY3RvclBvc2l0aW9uUHJvcGVydHkiLCJjZW50ZXIiLCJsaW5rQXR0cmlidXRlIiwicHJvdHJhY3Rvck5vZGVJY29uIiwiY3JlYXRlSWNvbiIsImxpbmsiLCJzaG93UHJvdHJhY3RvciIsInZpc2libGUiLCJwcm90cmFjdG9yTm9kZUxpc3RlbmVyIiwicG9zaXRpb25Qcm9wZXJ0eSIsInVzZVBhcmVudE9mZnNldCIsImVuZCIsImdldEdsb2JhbEJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJ0b29sYm94IiwiYWRkSW5wdXRMaXN0ZW5lciIsInByb3RyYWN0b3JQb3NpdGlvbiIsImluaXRpYWxpemVJY29uIiwiZXZlbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwicG9pbnRlciIsInBvaW50IiwicHJlc3MiLCJtZWFzdXJpbmdUYXBlUHJvcGVydHkiLCJuYW1lIiwibXVsdGlwbGllciIsIm1lYXN1cmluZ1RhcGVOb2RlIiwidGV4dEJhY2tncm91bmRDb2xvciIsInRleHRDb2xvciIsInRpcFBvc2l0aW9uUHJvcGVydHkiLCJiYXNlRHJhZ0VuZGVkIiwiaXNNZWFzdXJpbmdUYXBlSW5QbGF5QXJlYVByb3BlcnR5IiwicmVzZXQiLCJtZWFzdXJpbmdUYXBlSWNvbiIsImRlbHRhIiwibWludXMiLCJiYXNlUG9zaXRpb25Qcm9wZXJ0eSIsInBsdXMiLCJzdGFydEJhc2VEcmFnIiwidG9vbGJveE5vZGVzIiwic3BhY2luZyIsImNoaWxkcmVuIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwibGluZVdpZHRoIiwibGVmdCIsImxheW91dEJvdW5kcyIsIm1pblgiLCJTQ1JFRU5fVklFV19YX01BUkdJTiIsImJvdHRvbSIsIm1heFkiLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsImluUGhhc2VUZXh0IiwicExEV2F2ZWxlbmd0aHNQcm9wZXJ0eSIsImxhenlMaW5rIiwicGF0aERpZmZlcmVuY2VQcm9wZXJ0eSIsImhpZGVURiIsImluUGhhc2VQcm9wZXJ0eSIsInRoZXRhIiwic291cmNlQW5nbGVQcm9wZXJ0eSIsImdldCIsInJheVRleHRFbmQiLCJ0aW1lc1NjYWxhciIsInJheVRleHRDZW50ZXIiLCJyb3RhdGVkIiwid2F2ZWZyb250UHJvcGVydHkiLCJhZGRYWSIsInNpbiIsImNvcyIsInJheVNlcCIsInoiLCJyb3RhdGlvbiIsInN0cmluZyIsImZpbGxJbiIsIndhdmVsZW5ndGhzIiwidG9GaXhlZCIsIm11bHRpbGluayIsInNvdXJjZVdhdmVsZW5ndGhQcm9wZXJ0eSIsImhvcml6b250YWxSYXlzUHJvcGVydHkiLCJ2ZXJ0aWNhbFJheXNQcm9wZXJ0eSIsInNob3dUcmFuc21pdHRlZFByb3BlcnR5IiwiYUNvbnN0YW50UHJvcGVydHkiLCJjQ29uc3RhbnRQcm9wZXJ0eSIsIngiLCJ1cGRhdGVTaXRlcyIsInJlbW92ZUNoaWxkIiwiY29udHJvbFBhbmVsIiwidG9wIiwicmlnaHQiLCJtYXhYIiwiYWRkU3RlcExpc3RlbmVyIiwicmVzZXRBbGxCdXR0b24iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZW1vdmVBbGxDaGlsZHJlbiIsImxhbWRhIiwicmF5U2VwYXJhdGlvbiIsImluY2lkZW50UmF5MUVuZCIsImluY2lkZW50UmF5MVN0YXJ0IiwiaG9yaXoiLCJmbG9vciIsIm1pbiIsInZlcnQiLCJpIiwiaiIsInNoaWZ0IiwiZGlzdGFuY2UiLCJpbmNpZGVudFJheVN0YXJ0IiwieSIsImluY2lkZW50UmF5RW5kIiwiaW5jaWRlbnRSYXlMZW5ndGgiLCJnZXRNYWduaXR1ZGUiLCJleGl0UmF5UGhhc2UiLCJzdGFydFBoYXNlIiwiZXh0cmFMZW5ndGgiLCJleGl0UmF5RW5kIiwiYW1wbGl0dWRlIiwid2F2ZUZyb250V2lkdGgiLCJtYXgiLCJ3YXZlRnJvbnRQYXR0ZXJuIiwid2F2ZUZyb250TGluZVdpZHRoIiwidHJhbnNtaXR0ZWRSYXlFbmQiLCJsaW5lU3RhcnQiLCJsaW5lSW5FbmQiLCJsaW5lT3V0RW5kIiwibW92ZVRvUG9pbnQiLCJsaW5lVG9Qb2ludCIsInBMRFBhdGgiLCJwTERSZWdpb24xIiwicExEUmVnaW9uMiIsImxpbmVUb1JlbGF0aXZlIiwicExEUmVnaW9uT3B0aW9ucyIsInBMRFJlZ2lvblBhdGgxIiwicExEUmVnaW9uUGF0aDIiLCJwTERBcnJvd1N0YXJ0IiwicGx1c1hZIiwicExEQXJyb3dFbmQiLCJwTERMYWJlbENlbnRlciIsInBMRERpbWVuc2lvbkFycm93IiwicExERGltZW5zaW9uTGFiZWwiLCJwTERMYWJlbEJhY2tncm91bmQiLCJ3aWR0aCIsImhlaWdodCIsIm9wYWNpdHkiLCJzZXRWaXNpYmxlIiwicExERGlhZ3JhbUJHIiwicExERGlhZ3JhbSIsInBMRERpYWdyYW1EaW1lbnNpb25BcnJvdyIsIl8yZFNpblRleHQiLCJwTERQcm9wZXJ0eSIsInVuaXQiLCJfMmRTaW5MYW1iZGFUZXh0IiwicExEUGFuZWwiLCJjb3JuZXJSYWRpdXMiLCJzdGVwIiwiZHQiLCJub2RlIiwiaW5QbGF5QXJlYVByb3BlcnR5IiwiZm9yd2FyZGluZ0xpc3RlbmVyIiwiY3Vyc29yIiwiaW5QbGF5QXJlYSIsImNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiWHJheURpZmZyYWN0aW9uU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIFRvZGQgSG9sZGVuIChodHRwczovL3Rob2xkZW43OS53aXhzaXRlLmNvbS9teXNpdGUyKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IE1lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NZWFzdXJpbmdUYXBlTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgUHJvdHJhY3Rvck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1Byb3RyYWN0b3JOb2RlLmpzJztcclxuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyLCBOb2RlLCBQYXRoLCBSZWN0YW5nbGUsIFJpY2hUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBYcmF5RGlmZnJhY3Rpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1hyYXlEaWZmcmFjdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCB4cmF5RGlmZnJhY3Rpb24gZnJvbSAnLi4vLi4veHJheURpZmZyYWN0aW9uLmpzJztcclxuaW1wb3J0IFhyYXlEaWZmcmFjdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vWHJheURpZmZyYWN0aW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBYcmF5RGlmZnJhY3Rpb25Nb2RlbCBmcm9tICcuLi9tb2RlbC9YcmF5RGlmZnJhY3Rpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBDcnlzdGFsTm9kZSBmcm9tICcuL0NyeXN0YWxOb2RlLmpzJztcclxuaW1wb3J0IExpZ2h0UGF0aE5vZGUgZnJvbSAnLi9MaWdodFBhdGhOb2RlLmpzJztcclxuaW1wb3J0IFhyYXlDb250cm9sUGFuZWwgZnJvbSAnLi9YcmF5Q29udHJvbFBhbmVsLmpzJztcclxuXHJcbi8vIHN0cmluZ3NcclxuY29uc3QgZFNpblRoZXRhU3RyaW5nID0gWHJheURpZmZyYWN0aW9uU3RyaW5ncy5kU2luVGhldGE7XHJcbmNvbnN0IGluUGhhc2VTdHJpbmcgPSBYcmF5RGlmZnJhY3Rpb25TdHJpbmdzLmluUGhhc2U7XHJcblxyXG5jb25zdCBESU1FTlNJT05fQVJST1dfT1BUSU9OUyA9IHsgZmlsbDogJ2JsYWNrJywgc3Ryb2tlOiBudWxsLCB0YWlsV2lkdGg6IDIsIGhlYWRXaWR0aDogNywgaGVhZEhlaWdodDogMjAsIGRvdWJsZUhlYWQ6IHRydWUgfTtcclxuY29uc3QgQU1QID0gMTA7XHJcbmNvbnN0IGJyYWdnRXF1YXRpb25TdHJpbmcgPSBYcmF5RGlmZnJhY3Rpb25TdHJpbmdzLmJyYWdnRXF1YXRpb247XHJcbmNvbnN0IGludGVycGxhbmVEaXN0YW5jZVN0cmluZyA9IFhyYXlEaWZmcmFjdGlvblN0cmluZ3MuaW50ZXJwbGFuZURpc3RhbmNlO1xyXG5jb25zdCBsZW5ndGhVbml0U3RyaW5nID0gWHJheURpZmZyYWN0aW9uU3RyaW5ncy5sZW5ndGhVbml0O1xyXG5jb25zdCBwTERTdHJpbmcgPSBYcmF5RGlmZnJhY3Rpb25TdHJpbmdzLnBMRDtcclxuY29uc3QgU0NBTEVfRkFDVE9SID0gWHJheURpZmZyYWN0aW9uQ29uc3RhbnRzLlNDQUxFX0ZBQ1RPUjtcclxuY29uc3QgVEVYVF9PUFRJT05TID0geyBmb250OiBuZXcgUGhldEZvbnQoIHsgZmFtaWx5OiAnVmVyZGFuYScsIHNpemU6IDE0IH0gKSwgbWF4V2lkdGg6IDIwMCwgYWxpZ246ICdjZW50ZXInLCBzZXRCb3VuZHNNZXRob2Q6ICdhY2N1cmF0ZScgfTtcclxuY29uc3QgVE9QX1JBWV9MRU5HVEggPSA0MDA7IC8vIEFyYml0cmFyeSBsZW5ndGggb2YgdG9wIGluY2lkZW50IHJheSB0byBzdGFydCBpdCBuZWFyIHRoZSB0b3AgbGVmdFxyXG5cclxuLy8gQXJiaXRyYXJ5IGxvY2F0aW9uIG9mIHRoZSBjcnlzdGFsIG5lYXIgdGhlIGJvdHRvbSBjZW50ZXJcclxuY29uc3QgQ1JZU1RBTF9OT0RFX09QVElPTlMgPSB7IGNlbnRlclg6IDQwMCwgY2VudGVyWTogNDQwIH07XHJcbmNvbnN0IEVMRU1FTlRfU1BBQ0lORyA9IFhyYXlEaWZmcmFjdGlvbkNvbnN0YW50cy5FTEVNRU5UX1NQQUNJTkc7XHJcblxyXG5jbGFzcyBYcmF5RGlmZnJhY3Rpb25TY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7WHJheURpZmZyYWN0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9kZWwgaW5zdGFuY2VvZiBYcmF5RGlmZnJhY3Rpb25Nb2RlbCwgJ2ludmFsaWQgbW9kZWwnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0YW5kZW0gaW5zdGFuY2VvZiBUYW5kZW0sICdpbnZhbGlkIHRhbmRlbScgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdXNlZCB0byBkaXNwbGF5IHRoZSBhcnJheSBvZiBhdG9tcy4gVXNpbmcgY29udGFpbmVyIHRvIGtlZXAgdGhlIGNvcnJlY3Qgb3JkZXIgd2hlbiB3ZSByZW1vdmVDaGlsZFxyXG4gICAgdGhpcy5jcnlzdGFsTm9kZSA9IG5ldyBDcnlzdGFsTm9kZSggbW9kZWwubGF0dGljZS5zaXRlcywgbW9kZWwubGF0dGljZS5sYXR0aWNlQ29uc3RhbnRzUHJvcGVydHkudmFsdWUsIENSWVNUQUxfTk9ERV9PUFRJT05TICk7XHJcbiAgICB0aGlzLmNyeXN0YWxOb2RlQ29udGFpbmVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuY3J5c3RhbE5vZGVDb250YWluZXIuYWRkQ2hpbGQoIHRoaXMuY3J5c3RhbE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuY3J5c3RhbE5vZGVDb250YWluZXIgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHVzZWQgdG8gZHJhdyB0aGUgY3VycmVudCBmcmFtZSBvZiB0aGUgbGlnaHQgd2F2ZXMuIFVwZGF0ZWQgYXQgZWFjaCB0aW1lc3RlcCB3aGVuIGFuaW1hdGluZy5cclxuICAgIHRoaXMubGlnaHRQYXRoc05vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5saWdodFBhdGhzTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIG5vZGUgZm9yIGRpc3BsYXlpbmcgUExEIHJlZ2lvblxyXG4gICAgdGhpcy5wTEROb2RlID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMucExEQ2hhbmdlZCA9IHRydWU7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnBMRE5vZGUgKTtcclxuXHJcbiAgICAvLyBJbml0aWFsIGRyYXdpbmcgb2YgbGlnaHQgb250byB0aGUgc2NyZWVuLlxyXG4gICAgdGhpcy5kcmF3TGlnaHQoIG1vZGVsLCB0aGlzLmNyeXN0YWxOb2RlICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCBUaW1lIENvbnRyb2xzIC0gc3ViY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIHBsYXkvcGF1c2Ugb2YgbGlnaHQgYW5pbWF0aW9uXHJcbiAgICB0aGlzLnRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmFuaW1hdGVQcm9wZXJ0eSwge1xyXG4gICAgICBidXR0b25Hcm91cFhTcGFjaW5nOiAyNSxcclxuICAgICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIC8vIHdoZW4gdGhlIFN0ZXAgYnV0dG9uIGlzIHByZXNzZWRcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vIC4wNCBzIC0gYWJvdXQgMiB0aW1lc3RlcHMgc2VlbXMgYWJvdXQgcmlnaHRcclxuICAgICAgICAgICAgbW9kZWwubWFudWFsU3RlcCggMC4wNCApO1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdMaWdodCggbW9kZWwsIHRoaXMuY3J5c3RhbE5vZGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVDb250cm9sTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgLy8gbGF5b3V0IHBvc2l0aW9uaW5nIGRvbmUgYWZ0ZXIgY29udHJvbCBwYW5lbCBpcyBjcmVhdGVkXHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBwcm90cmFjdG9yIG5vZGVcclxuICAgIGNvbnN0IHNob3dQcm90cmFjdG9yUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgY29uc3QgcHJvdHJhY3Rvck5vZGUgPSBuZXcgUHJvdHJhY3Rvck5vZGUoIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBzaG93UHJvdHJhY3RvclByb3BlcnR5LFxyXG4gICAgICByb3RhdGFibGU6IHRydWUsXHJcbiAgICAgIGFuZ2xlOiBNYXRoLlBJIC8gMixcclxuICAgICAgc2NhbGU6IDAuOFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHByb3RyYWN0b3JQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggcHJvdHJhY3Rvck5vZGUuY2VudGVyICk7XHJcbiAgICAvLyBUaGlzIGxpbmsgZXhpc3RzIGZvciB0aGUgZW50aXJlIGR1cmF0aW9uIG9mIHRoZSBzaW0uIE5vIG5lZWQgdG8gZGlzcG9zZS5cclxuICAgIHNob3dQcm90cmFjdG9yUHJvcGVydHkubGlua0F0dHJpYnV0ZSggcHJvdHJhY3Rvck5vZGUsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIGNvbnN0IHByb3RyYWN0b3JOb2RlSWNvbiA9IFByb3RyYWN0b3JOb2RlLmNyZWF0ZUljb24oIHsgc2NhbGU6IDAuMjQgfSApO1xyXG4gICAgLy8gVGhpcyBsaW5rIGV4aXN0cyBmb3IgdGhlIGVudGlyZSBkdXJhdGlvbiBvZiB0aGUgc2ltLiBObyBuZWVkIHRvIGRpc3Bvc2UuXHJcbiAgICBzaG93UHJvdHJhY3RvclByb3BlcnR5LmxpbmsoIHNob3dQcm90cmFjdG9yID0+IHsgcHJvdHJhY3Rvck5vZGVJY29uLnZpc2libGUgPSAhc2hvd1Byb3RyYWN0b3I7IH0gKTtcclxuXHJcbiAgICAvLyBsaXN0ZW5lciBjcmVhdGVkIG9uY2UgYW5kIG5lZWRlZCBmb3IgbGlmZSBvZiBzaW11bGF0aW9uLiBObyBuZWVkIHRvIGRpc3Bvc2UuXHJcbiAgICBjb25zdCBwcm90cmFjdG9yTm9kZUxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICBwb3NpdGlvblByb3BlcnR5OiBwcm90cmFjdG9yUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdXNlUGFyZW50T2Zmc2V0OiB0cnVlLFxyXG4gICAgICBlbmQ6ICgpID0+IHtcclxuICAgICAgICBpZiAoIHByb3RyYWN0b3JOb2RlLmdldEdsb2JhbEJvdW5kcygpLmludGVyc2VjdHNCb3VuZHMoIHRoaXMudG9vbGJveC5nZXRHbG9iYWxCb3VuZHMoKSApICkge1xyXG4gICAgICAgICAgc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgLy8gbGlzdGVuZXIgY3JlYXRlZCBvbmNlIGFuZCBuZWVkZWQgZm9yIGxpZmUgb2Ygc2ltdWxhdGlvbi4gTm8gbmVlZCB0byBkaXNwb3NlLlxyXG4gICAgcHJvdHJhY3Rvck5vZGUuYWRkSW5wdXRMaXN0ZW5lciggcHJvdHJhY3Rvck5vZGVMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIFRoaXMgbGluayBleGlzdHMgZm9yIHRoZSBlbnRpcmUgZHVyYXRpb24gb2YgdGhlIHNpbS4gTm8gbmVlZCB0byBkaXNwb3NlLlxyXG4gICAgcHJvdHJhY3RvclBvc2l0aW9uUHJvcGVydHkubGluayggcHJvdHJhY3RvclBvc2l0aW9uID0+IHtcclxuICAgICAgcHJvdHJhY3Rvck5vZGUuY2VudGVyID0gcHJvdHJhY3RvclBvc2l0aW9uO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdGhlIHByb3RyYWN0b3IgaWNvbiBhbmQgc2V0IHVwIHRoZSBmaXJzdCBkcmFnIG9mZiB0aGUgdG9vbGJveFxyXG4gICAgaW5pdGlhbGl6ZUljb24oIHByb3RyYWN0b3JOb2RlSWNvbiwgc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eSwgZXZlbnQgPT4ge1xyXG4gICAgICAvLyBDZW50ZXIgdGhlIHByb3RyYWN0b3Igb24gdGhlIHBvaW50ZXJcclxuICAgICAgcHJvdHJhY3RvclBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwcm90cmFjdG9yTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcbiAgICAgIC8vIGxpc3RlbmVyIGNyZWF0ZWQgb25jZSBhbmQgbmVlZGVkIGZvciBsaWZlIG9mIHNpbXVsYXRpb24uIE5vIG5lZWQgdG8gZGlzcG9zZS5cclxuICAgICAgcHJvdHJhY3Rvck5vZGVMaXN0ZW5lci5wcmVzcyggZXZlbnQgKTtcclxuICAgICAgc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIHRhcGUgbWVhc3VyZVxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCB7IG5hbWU6ICfDhScsIG11bHRpcGxpZXI6IDEgLyBTQ0FMRV9GQUNUT1IgfSApO1xyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgTWVhc3VyaW5nVGFwZU5vZGUoIG1lYXN1cmluZ1RhcGVQcm9wZXJ0eSwge1xyXG4gICAgICAvLyB0cmFuc2x1Y2VudCB3aGl0ZSBiYWNrZ3JvdW5kLCBzYW1lIHZhbHVlIGFzIGluIFByb2plY3RpbGUgTW90aW9uLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Byb2plY3RpbGUtbW90aW9uL2lzc3Vlcy8xNTZcclxuICAgICAgdGV4dEJhY2tncm91bmRDb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC42KScsXHJcbiAgICAgIHRleHRDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgdGlwUG9zaXRpb25Qcm9wZXJ0eTogbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDUgKiBTQ0FMRV9GQUNUT1IsIDAgKSApLCAvLyA1IEFuZ3N0cm9tIGluaXRpYWwgbGVuZ3RoXHJcblxyXG4gICAgICAvLyBEcm9wIGluIHRvb2xib3hcclxuICAgICAgYmFzZURyYWdFbmRlZDogKCkgPT4ge1xyXG4gICAgICAgIGlmICggbWVhc3VyaW5nVGFwZU5vZGUuZ2V0R2xvYmFsQm91bmRzKCkuaW50ZXJzZWN0c0JvdW5kcyggdGhpcy50b29sYm94LmdldEdsb2JhbEJvdW5kcygpICkgKSB7XHJcbiAgICAgICAgICBpc01lYXN1cmluZ1RhcGVJblBsYXlBcmVhUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZUljb24gPSBNZWFzdXJpbmdUYXBlTm9kZS5jcmVhdGVJY29uKCB7IHNjYWxlOiAwLjY1IH0gKTtcclxuXHJcbiAgICAvL1RPRE8gdGhpcyBzaG91bGQgYmUgcGFzc2VkIHRvIG5ldyBNZWFzdXJpbmdUYXBlTm9kZSBhcyB2aXNpYmxlUHJvcGVydHkgb3B0aW9uIHZhbHVlXHJcbiAgICBjb25zdCBpc01lYXN1cmluZ1RhcGVJblBsYXlBcmVhUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gICAgbWVhc3VyaW5nVGFwZU5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIGluaXRpYWxpemVJY29uKCBtZWFzdXJpbmdUYXBlSWNvbiwgaXNNZWFzdXJpbmdUYXBlSW5QbGF5QXJlYVByb3BlcnR5LCBldmVudCA9PiB7XHJcbiAgICAgIC8vIFdoZW4gY2xpY2tpbmcgb24gdGhlIG1lYXN1cmluZyB0YXBlIGljb24sIGJhc2UgcG9pbnQgYXQgY3Vyc29yXHJcbiAgICAgIGNvbnN0IGRlbHRhID0gbWVhc3VyaW5nVGFwZU5vZGUudGlwUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5taW51cyggbWVhc3VyaW5nVGFwZU5vZGUuYmFzZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgbWVhc3VyaW5nVGFwZU5vZGUuYmFzZVBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBtZWFzdXJpbmdUYXBlTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcbiAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLnRpcFBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBtZWFzdXJpbmdUYXBlTm9kZS5iYXNlUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS5wbHVzKCBkZWx0YSApO1xyXG4gICAgICBtZWFzdXJpbmdUYXBlTm9kZS5zdGFydEJhc2VEcmFnKCBldmVudCApO1xyXG4gICAgICBpc01lYXN1cmluZ1RhcGVJblBsYXlBcmVhUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICBtZWFzdXJpbmdUYXBlTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB0b29sYm94Tm9kZXMgPSBbIHByb3RyYWN0b3JOb2RlSWNvbiwgbWVhc3VyaW5nVGFwZUljb24gXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHVzZWQgdG8gZGlzcGxheSBhIHRvb2xib3ggY29udGFpbmluZyBhIHByb3RyYWN0b3IgYW5kIHJ1bGVyIGZvciB0aGUgdXNlclxyXG4gICAgdGhpcy50b29sYm94ID0gbmV3IFBhbmVsKCBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IHRvb2xib3hOb2RlcyxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgIH0gKSwge1xyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgIHN0cm9rZTogJyM2OTY5NjknLFxyXG4gICAgICBsaW5lV2lkdGg6IDEuNSwgZmlsbDogJyNlZWVlZWUnLFxyXG4gICAgICBsZWZ0OiB0aGlzLmxheW91dEJvdW5kcy5taW5YICsgWHJheURpZmZyYWN0aW9uQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBYcmF5RGlmZnJhY3Rpb25Db25zdGFudHMuU0NSRUVOX1ZJRVdfWV9NQVJHSU5cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudG9vbGJveCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcHJvdHJhY3Rvck5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG1lYXN1cmluZ1RhcGVOb2RlICk7XHJcblxyXG4gICAgLy8gbWF4IHdpZHRoIHNldCB0byAyNjAgd2hpY2ggaXMgbGVzcyB0aGFuIHRoZSBleGl0IHJheSBsZW5ndGhcclxuICAgIGNvbnN0IGluUGhhc2VUZXh0ID0gbmV3IFJpY2hUZXh0KCAnJywgeyBtYXhXaWR0aDogMjYwIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGluUGhhc2VUZXh0ICk7XHJcblxyXG4gICAgLy8gTm90ZSB3aGVuIHdlIG5lZWQgdG8gcmVkcmF3IFBMRCByZWdpb25cclxuICAgIC8vIGxpc3RlbmVyIGNyZWF0ZWQgb25jZSBhbmQgbmVlZGVkIGZvciBsaWZlIG9mIHNpbXVsYXRpb24uIE5vIG5lZWQgdG8gZGlzcG9zZS5cclxuICAgIG1vZGVsLnBMRFdhdmVsZW5ndGhzUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHt0aGlzLnBMRENoYW5nZWQgPSB0cnVlO30gKTtcclxuXHJcbiAgICAvLyBzaG93L2hpZGUgdGhlIFBMRCBub2RlIHdoZW4gdGhlIGNoZWNrYm94IGxpbmtlZCB0byBwYXRoRGlmZmVyZW5jZVByb3BlcnR5IGlzIGNoZWNrZWQuXHJcbiAgICAvLyBsaXN0ZW5lciBjcmVhdGVkIG9uY2UgYW5kIG5lZWRlZCBmb3IgbGlmZSBvZiBzaW11bGF0aW9uLiBObyBuZWVkIHRvIGRpc3Bvc2UuXHJcbiAgICBtb2RlbC5wYXRoRGlmZmVyZW5jZVByb3BlcnR5LmxpbmsoIGhpZGVURiA9PiB7XHJcbiAgICAgIHRoaXMucExETm9kZS52aXNpYmxlID0gaGlkZVRGO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGRpc3BsYXlzIG1lc3NhZ2Ugd2hlbiBwYXRoIGxlbmd0aCBkaWZmZXJlbmNlIChQTEQpIGlzIGludGVncmFsIG11bHRpcGxlIG9mIHRoZSB3YXZlbGVuZ3RoXHJcbiAgICAvLyBsaXN0ZW5lciBjcmVhdGVkIG9uY2UgYW5kIG5lZWRlZCBmb3IgbGlmZSBvZiBzaW11bGF0aW9uLiBObyBuZWVkIHRvIGRpc3Bvc2UuXHJcbiAgICBtb2RlbC5pblBoYXNlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5pblBoYXNlUHJvcGVydHkudmFsdWUgKSB7XHJcblxyXG4gICAgICAgIC8vIHJlb3JpZW50IHRleHQgYW5kIG1ha2UgaXQgdmlzaWJsZVxyXG4gICAgICAgIGNvbnN0IHRoZXRhID0gbW9kZWwuc291cmNlQW5nbGVQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBjb25zdCByYXlUZXh0RW5kID0gbmV3IFZlY3RvcjIoIHRoaXMuY3J5c3RhbE5vZGUuY2VudGVyWCwgdGhpcy5jcnlzdGFsTm9kZS5jZW50ZXJZICkubWludXMoIG1vZGVsLmxhdHRpY2Uuc2l0ZXNbIDAgXS50aW1lc1NjYWxhciggU0NBTEVfRkFDVE9SICkgKTtcclxuXHJcbiAgICAgICAgLy8gZmluZCB0aGUgY2VudGVyIG9mIHRoZSB0b3Agb3V0Z29pbmcgcmF5IGFuZCBkaXNwbGFjZSB0aGUgdGV4dCBhIGxpdHRsZSBhYm92ZSBpdFxyXG4gICAgICAgIGxldCByYXlUZXh0Q2VudGVyID0gbmV3IFZlY3RvcjIoIFRPUF9SQVlfTEVOR1RIIC8gMiwgMCApO1xyXG4gICAgICAgIHJheVRleHRDZW50ZXIgPSByYXlUZXh0RW5kLm1pbnVzKCByYXlUZXh0Q2VudGVyLnJvdGF0ZWQoIE1hdGguUEkgLSB0aGV0YSApICk7XHJcbiAgICAgICAgaWYgKCBtb2RlbC53YXZlZnJvbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ25vbmUnICkge1xyXG4gICAgICAgICAgLy8gcGxhY2VtZW50IGEgbGl0dGxlIGFib3ZlIHRoZSB0b3Agb2YgdGhlIHdhdmUgMi4yIGlzIGFyYml0cmFyeSB0byBwdXQgdGhlIHRleHQgY2VudGVyIGhpZ2ggZW5vdWdoXHJcbiAgICAgICAgICByYXlUZXh0Q2VudGVyID0gcmF5VGV4dENlbnRlci5hZGRYWSggLTIuMiAqIEFNUCAqIE1hdGguc2luKCB0aGV0YSApLCAtMi4yICogQU1QICogTWF0aC5jb3MoIHRoZXRhICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGJldHdlZW4gbGlnaHQgcmF5c1xyXG4gICAgICAgICAgY29uc3QgcmF5U2VwID0gNCAqICggbW9kZWwubGF0dGljZS5sYXR0aWNlQ29uc3RhbnRzUHJvcGVydHkudmFsdWUueiAqIE1hdGguY29zKCB0aGV0YSApICk7XHJcbiAgICAgICAgICAvLyBwbGFjZW1lbnQgcmlnaHQgYWJvdmUgdGhlIHdhdmVmcm9udHNcclxuICAgICAgICAgIHJheVRleHRDZW50ZXIgPSByYXlUZXh0Q2VudGVyLmFkZFhZKCAtKCByYXlTZXAgKyBBTVAgKSAqIE1hdGguc2luKCB0aGV0YSApLCAtKCByYXlTZXAgKyBBTVAgKSAqIE1hdGguY29zKCB0aGV0YSApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluUGhhc2VUZXh0LnJvdGF0aW9uID0gLW1vZGVsLnNvdXJjZUFuZ2xlUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgaW5QaGFzZVRleHQuc3RyaW5nID0gU3RyaW5nVXRpbHMuZmlsbEluKCBpblBoYXNlU3RyaW5nLCB7XHJcbiAgICAgICAgICB3YXZlbGVuZ3RoczogVXRpbHMudG9GaXhlZCggbW9kZWwucExEV2F2ZWxlbmd0aHNQcm9wZXJ0eS52YWx1ZSwgMCApXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGluUGhhc2VUZXh0LmNlbnRlciA9IHJheVRleHRDZW50ZXI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaW5QaGFzZVRleHQuc3RyaW5nID0gJyc7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgZGlzcGxheSB3aGVuIGluY2lkZW50IGFuZ2xlLCB3YXZlbGVuZ3RoLCByYXkgZ3JpZCwgb3IgcGF0aCBkaWZmZXJlbmNlIGNoZWNrYm94IGNoYW5nZXNcclxuICAgIC8vIFRoaXMgbGluayBleGlzdHMgZm9yIHRoZSBlbnRpcmUgZHVyYXRpb24gb2YgdGhlIHNpbS4gTm8gbmVlZCB0byBkaXNwb3NlLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICBtb2RlbC5zb3VyY2VBbmdsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5zb3VyY2VXYXZlbGVuZ3RoUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmhvcml6b250YWxSYXlzUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnZlcnRpY2FsUmF5c1Byb3BlcnR5LFxyXG4gICAgICBtb2RlbC53YXZlZnJvbnRQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwucGF0aERpZmZlcmVuY2VQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc2hvd1RyYW5zbWl0dGVkUHJvcGVydHlcclxuICAgIF0sICgpID0+IHsgdGhpcy5kcmF3TGlnaHQoIG1vZGVsLCB0aGlzLmNyeXN0YWxOb2RlICk7IH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgY3J5c3RhbCB3aGVuIGxhdHRpY2UgcGFyYW1ldGVycyBjaGFuZ2VcclxuICAgIC8vIFRoaXMgbGluayBleGlzdHMgZm9yIHRoZSBlbnRpcmUgZHVyYXRpb24gb2YgdGhlIHNpbS4gTm8gbmVlZCB0byBkaXNwb3NlLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggW1xyXG4gICAgICBtb2RlbC5sYXR0aWNlLmFDb25zdGFudFByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5sYXR0aWNlLmNDb25zdGFudFByb3BlcnR5XHJcbiAgICBdLCAoKSA9PiB7XHJcbiAgICAgIG1vZGVsLmxhdHRpY2UubGF0dGljZUNvbnN0YW50c1Byb3BlcnR5LnZhbHVlLnggPSBtb2RlbC5sYXR0aWNlLmFDb25zdGFudFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICBtb2RlbC5sYXR0aWNlLmxhdHRpY2VDb25zdGFudHNQcm9wZXJ0eS52YWx1ZS56ID0gbW9kZWwubGF0dGljZS5jQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgbW9kZWwubGF0dGljZS51cGRhdGVTaXRlcygpO1xyXG4gICAgICB0aGlzLmNyeXN0YWxOb2RlQ29udGFpbmVyLnJlbW92ZUNoaWxkKCB0aGlzLmNyeXN0YWxOb2RlICk7XHJcbiAgICAgIHRoaXMuY3J5c3RhbE5vZGUgPSBuZXcgQ3J5c3RhbE5vZGUoIG1vZGVsLmxhdHRpY2Uuc2l0ZXMsIG1vZGVsLmxhdHRpY2UubGF0dGljZUNvbnN0YW50c1Byb3BlcnR5LnZhbHVlLCBDUllTVEFMX05PREVfT1BUSU9OUyApO1xyXG4gICAgICB0aGlzLmNyeXN0YWxOb2RlQ29udGFpbmVyLmFkZENoaWxkKCB0aGlzLmNyeXN0YWxOb2RlICk7XHJcbiAgICAgIHRoaXMuZHJhd0xpZ2h0KCBtb2RlbCwgdGhpcy5jcnlzdGFsTm9kZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdXNlZCB0byBjcmVhdGUgYW4gaW5wdXQgcGFuZWwgZm9yIHVzZXJzIHRvIGFkanVzdCBwYXJhbWV0ZXJzIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICB0aGlzLmNvbnRyb2xQYW5lbCA9IG5ldyBYcmF5Q29udHJvbFBhbmVsKCBtb2RlbCwgdGhpcy50aW1lQ29udHJvbE5vZGUgKTtcclxuXHJcbiAgICAvLyBMYXlvdXQgZm9yIGNvbnRyb2xzIGRvbmUgbWFudWFsbHkgYXQgdGhlIHRvcCByaWdodFxyXG4gICAgdGhpcy5jb250cm9sUGFuZWwudG9wID0gWHJheURpZmZyYWN0aW9uQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOO1xyXG4gICAgdGhpcy5jb250cm9sUGFuZWwucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gWHJheURpZmZyYWN0aW9uQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5jb250cm9sUGFuZWwgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdmlldyBvbiBtb2RlbCBzdGVwXHJcbiAgICBtb2RlbC5hZGRTdGVwTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgaWYgKCBtb2RlbC5hbmltYXRlUHJvcGVydHkgKSB7XHJcbiAgICAgICAgdGhpcy5kcmF3TGlnaHQoIG1vZGVsLCB0aGlzLmNyeXN0YWxOb2RlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICBtZWFzdXJpbmdUYXBlTm9kZS5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuY3J5c3RhbE5vZGVDb250YWluZXIucmVtb3ZlQ2hpbGQoIHRoaXMuY3J5c3RhbE5vZGUgKTtcclxuICAgICAgICB0aGlzLmNyeXN0YWxOb2RlID0gbmV3IENyeXN0YWxOb2RlKCBtb2RlbC5sYXR0aWNlLnNpdGVzLCBtb2RlbC5sYXR0aWNlLmxhdHRpY2VDb25zdGFudHNQcm9wZXJ0eS52YWx1ZSwgQ1JZU1RBTF9OT0RFX09QVElPTlMgKTtcclxuICAgICAgICB0aGlzLmNyeXN0YWxOb2RlQ29udGFpbmVyLmFkZENoaWxkKCB0aGlzLmNyeXN0YWxOb2RlICk7XHJcbiAgICAgICAgdGhpcy5kcmF3TGlnaHQoIG1vZGVsLCB0aGlzLmNyeXN0YWxOb2RlICk7XHJcbiAgICAgICAgc2hvd1Byb3RyYWN0b3JQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICAgIHByb3RyYWN0b3JOb2RlLnJlc2V0KCk7XHJcbiAgICAgICAgaXNNZWFzdXJpbmdUYXBlSW5QbGF5QXJlYVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgbWVhc3VyaW5nVGFwZU5vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gWHJheURpZmZyYWN0aW9uQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLm1heFkgLSBYcmF5RGlmZnJhY3Rpb25Db25zdGFudHMuU0NSRUVOX1ZJRVdfWV9NQVJHSU4sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSB2aWV3LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIC8vICBkb25lIGluIHRoZSByZXNldCBhbGwgYnV0dG9uXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEcmF3cyB0aGUgbGlnaHQgcmF5cyAoaW5jb21pbmcgYW5kIG91dGdvaW5nKSBhbG9uZyB3aXRoIHRoZSBwYXRoIGxlbmd0aCBkaWZmZXJlbmNlIChQTEQpIHJlZ2lvbiBpZiBjaGVja2VkLlxyXG4gICAqIFJlcGVhdGVkIGNhbGxzIHRvIE1hdGguc2luKCkgY291bGQgYmUgZWxpbWluYXRlZCBieSBkZWZpbmluZyBhIHZhcmlhYmxlLlxyXG4gICAqIEBwYXJhbSB7WHJheURpZmZyYWN0aW9uTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtDcnlzdGFsTm9kZX0gY3J5c3RhbE5vZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZHJhd0xpZ2h0KCBtb2RlbCwgY3J5c3RhbE5vZGUgKSB7XHJcbiAgICB0aGlzLmxpZ2h0UGF0aHNOb2RlLnJlbW92ZUFsbENoaWxkcmVuKCk7XHJcbiAgICBjb25zdCB0aGV0YSA9IG1vZGVsLnNvdXJjZUFuZ2xlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICBjb25zdCBsYW1kYSA9IFNDQUxFX0ZBQ1RPUiAqIG1vZGVsLnNvdXJjZVdhdmVsZW5ndGhQcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IHJheVNlcGFyYXRpb24gPSBTQ0FMRV9GQUNUT1IgKiAoIG1vZGVsLmxhdHRpY2UubGF0dGljZUNvbnN0YW50c1Byb3BlcnR5LnZhbHVlLnogKiBNYXRoLmNvcyggdGhldGEgKSApO1xyXG5cclxuICAgIGNvbnN0IGluY2lkZW50UmF5MUVuZCA9IG5ldyBWZWN0b3IyKCBjcnlzdGFsTm9kZS5jZW50ZXJYLCBjcnlzdGFsTm9kZS5jZW50ZXJZICkubWludXMoIG1vZGVsLmxhdHRpY2Uuc2l0ZXNbIDAgXS50aW1lc1NjYWxhciggU0NBTEVfRkFDVE9SICkgKTtcclxuXHJcbiAgICAvLyBBcmJpdHJhcnkgbGVuZ3RoICg0MDAgcGl4ZWxzKSBvZiB0b3AgaW5jaWRlbnQgcmF5IHRvIHN0YXJ0IGl0IG5lYXIgdGhlIHRvcCBsZWZ0XHJcbiAgICBsZXQgaW5jaWRlbnRSYXkxU3RhcnQgPSBuZXcgVmVjdG9yMiggVE9QX1JBWV9MRU5HVEgsIDAgKTtcclxuICAgIGluY2lkZW50UmF5MVN0YXJ0ID0gaW5jaWRlbnRSYXkxRW5kLm1pbnVzKCBpbmNpZGVudFJheTFTdGFydC5yb3RhdGVkKCBtb2RlbC5zb3VyY2VBbmdsZVByb3BlcnR5LmdldCgpICkgKTtcclxuXHJcbiAgICAvLyBNYWluIGxvZ2ljIHRvIGRyYXcgdGhlIGxpZ2h0IHJheXNcclxuICAgIGNvbnN0IGhvcml6ID0gTWF0aC5mbG9vciggTWF0aC5taW4oIG1vZGVsLmhvcml6b250YWxSYXlzUHJvcGVydHkuZ2V0KCksIDIwIC8gbW9kZWwubGF0dGljZS5sYXR0aWNlQ29uc3RhbnRzUHJvcGVydHkuZ2V0KCkueCApICk7XHJcbiAgICBjb25zdCB2ZXJ0ID0gTWF0aC5taW4oIE1hdGguZmxvb3IoIG1vZGVsLnZlcnRpY2FsUmF5c1Byb3BlcnR5LmdldCgpICksXHJcbiAgICAgIDEgKyAyICogTWF0aC5mbG9vciggMjAgLyBtb2RlbC5sYXR0aWNlLmxhdHRpY2VDb25zdGFudHNQcm9wZXJ0eS5nZXQoKS56ICkgKTtcclxuICAgIGZvciAoIGxldCBpID0gLWhvcml6OyBpIDw9IGhvcml6OyBpKysgKSB7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IHZlcnQ7IGorKyApIHtcclxuICAgICAgICBjb25zdCBzaGlmdCA9IG5ldyBWZWN0b3IyKCBTQ0FMRV9GQUNUT1IgKiBpICogbW9kZWwubGF0dGljZS5sYXR0aWNlQ29uc3RhbnRzUHJvcGVydHkuZ2V0KCkueCxcclxuICAgICAgICAgIC1TQ0FMRV9GQUNUT1IgKiBqICogbW9kZWwubGF0dGljZS5sYXR0aWNlQ29uc3RhbnRzUHJvcGVydHkuZ2V0KCkueiApO1xyXG4gICAgICAgIGNvbnN0IGRpc3RhbmNlID0gU0NBTEVfRkFDVE9SICogKCBpICogbW9kZWwubGF0dGljZS5sYXR0aWNlQ29uc3RhbnRzUHJvcGVydHkuZ2V0KCkueCAqIE1hdGguc2luKCB0aGV0YSApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgaiAqIG1vZGVsLmxhdHRpY2UubGF0dGljZUNvbnN0YW50c1Byb3BlcnR5LmdldCgpLnogKiBNYXRoLmNvcyggdGhldGEgKSApO1xyXG4gICAgICAgIGNvbnN0IGluY2lkZW50UmF5U3RhcnQgPSBuZXcgVmVjdG9yMiggaW5jaWRlbnRSYXkxU3RhcnQueCAtIGRpc3RhbmNlICogTWF0aC5zaW4oIHRoZXRhICksXHJcbiAgICAgICAgICBpbmNpZGVudFJheTFTdGFydC55ICsgZGlzdGFuY2UgKiBNYXRoLmNvcyggdGhldGEgKSApO1xyXG4gICAgICAgIGNvbnN0IGluY2lkZW50UmF5RW5kID0gaW5jaWRlbnRSYXkxRW5kLm1pbnVzKCBzaGlmdCApO1xyXG4gICAgICAgIGNvbnN0IGluY2lkZW50UmF5TGVuZ3RoID0gaW5jaWRlbnRSYXlFbmQubWludXMoIGluY2lkZW50UmF5U3RhcnQgKS5nZXRNYWduaXR1ZGUoKTtcclxuICAgICAgICBjb25zdCBleGl0UmF5UGhhc2UgPSAoIGluY2lkZW50UmF5TGVuZ3RoIC8gbGFtZGEgKSAqIDIgKiBNYXRoLlBJICsgbW9kZWwuc3RhcnRQaGFzZTtcclxuICAgICAgICBjb25zdCBleHRyYUxlbmd0aCA9IDIgKiBTQ0FMRV9GQUNUT1IgKiBNYXRoLmNvcyggdGhldGEgKSAqIGkgKiBtb2RlbC5sYXR0aWNlLmxhdHRpY2VDb25zdGFudHNQcm9wZXJ0eS5nZXQoKS54OyAvLyBhY2NvbW9kYXRlcyBleHRyYSBsZW5ndGggZm9yIGFkZGVkIGhvcml6b250YWwgcmF5c1xyXG4gICAgICAgIGNvbnN0IGV4aXRSYXlFbmQgPSBuZXcgVmVjdG9yMiggMiAqIGluY2lkZW50UmF5RW5kLnggLSBpbmNpZGVudFJheVN0YXJ0LnggKyBleHRyYUxlbmd0aCAqIE1hdGguY29zKCB0aGV0YSApLFxyXG4gICAgICAgICAgaW5jaWRlbnRSYXlTdGFydC55IC0gZXh0cmFMZW5ndGggKiBNYXRoLnNpbiggdGhldGEgKSApO1xyXG4gICAgICAgIHRoaXMubGlnaHRQYXRoc05vZGUuYWRkQ2hpbGQoIG5ldyBMaWdodFBhdGhOb2RlKCBpbmNpZGVudFJheVN0YXJ0LCBpbmNpZGVudFJheUVuZCwgU0NBTEVfRkFDVE9SICogbW9kZWwuc291cmNlV2F2ZWxlbmd0aFByb3BlcnR5LmdldCgpLCB7XHJcbiAgICAgICAgICBhbXBsaXR1ZGU6IEFNUCxcclxuICAgICAgICAgIHN0YXJ0UGhhc2U6IG1vZGVsLnN0YXJ0UGhhc2UsXHJcbiAgICAgICAgICB3YXZlRnJvbnRXaWR0aDogKCBtb2RlbC53YXZlZnJvbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ25vbmUnICkgPyAwIDogTWF0aC5tYXgoIEFNUCwgcmF5U2VwYXJhdGlvbiAtIDIgKSxcclxuICAgICAgICAgIHdhdmVGcm9udFBhdHRlcm46IG1vZGVsLndhdmVmcm9udFByb3BlcnR5LnZhbHVlXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgICAgdGhpcy5saWdodFBhdGhzTm9kZS5hZGRDaGlsZCggbmV3IExpZ2h0UGF0aE5vZGUoIGluY2lkZW50UmF5RW5kLCBleGl0UmF5RW5kLCBTQ0FMRV9GQUNUT1IgKiBtb2RlbC5zb3VyY2VXYXZlbGVuZ3RoUHJvcGVydHkuZ2V0KCksIHtcclxuICAgICAgICAgIGFtcGxpdHVkZTogQU1QLFxyXG4gICAgICAgICAgc3RhcnRQaGFzZTogZXhpdFJheVBoYXNlLFxyXG4gICAgICAgICAgd2F2ZUZyb250V2lkdGg6ICggbW9kZWwud2F2ZWZyb250UHJvcGVydHkudmFsdWUgPT09ICdub25lJyApID8gMCA6IE1hdGgubWF4KCBBTVAsIHJheVNlcGFyYXRpb24gLSAyICksXHJcbiAgICAgICAgICB3YXZlRnJvbnRQYXR0ZXJuOiBtb2RlbC53YXZlZnJvbnRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgIHN0cm9rZTogKCBtb2RlbC5pblBoYXNlUHJvcGVydHkudmFsdWUgKSA/ICdibGFjaycgOiAnZ3JheScsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6ICggbW9kZWwuaW5QaGFzZVByb3BlcnR5LnZhbHVlICkgPyAyIDogMSxcclxuICAgICAgICAgIHdhdmVGcm9udExpbmVXaWR0aDogKCBtb2RlbC5pblBoYXNlUHJvcGVydHkudmFsdWUgKSA/IDMgOiAxXHJcbiAgICAgICAgfSApICk7XHJcblxyXG4gICAgICAgIGlmICggbW9kZWwuc2hvd1RyYW5zbWl0dGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAvLyB3aGVuIGluY2lkZW50IHJheSBpcyBsb25nZXIsIHRyYW5zbWl0dGVkIHJheSBpcyBzaG9ydGVyXHJcbiAgICAgICAgICBsZXQgdHJhbnNtaXR0ZWRSYXlFbmQgPSBuZXcgVmVjdG9yMiggMiAqIFRPUF9SQVlfTEVOR1RIIC0gaW5jaWRlbnRSYXlMZW5ndGgsIDAgKTtcclxuICAgICAgICAgIHRyYW5zbWl0dGVkUmF5RW5kID0gaW5jaWRlbnRSYXlFbmQubWludXMoIHRyYW5zbWl0dGVkUmF5RW5kLnJvdGF0ZWQoIG1vZGVsLnNvdXJjZUFuZ2xlUHJvcGVydHkuZ2V0KCkgKyBNYXRoLlBJICkgKTtcclxuICAgICAgICAgIHRoaXMubGlnaHRQYXRoc05vZGUuYWRkQ2hpbGQoIG5ldyBMaWdodFBhdGhOb2RlKCBpbmNpZGVudFJheUVuZCwgdHJhbnNtaXR0ZWRSYXlFbmQsIFNDQUxFX0ZBQ1RPUiAqIG1vZGVsLnNvdXJjZVdhdmVsZW5ndGhQcm9wZXJ0eS5nZXQoKSwge1xyXG4gICAgICAgICAgICBhbXBsaXR1ZGU6IEFNUCxcclxuICAgICAgICAgICAgc3RhcnRQaGFzZTogZXhpdFJheVBoYXNlLFxyXG4gICAgICAgICAgICB3YXZlRnJvbnRXaWR0aDogKCBtb2RlbC53YXZlZnJvbnRQcm9wZXJ0eS52YWx1ZSA9PT0gJ25vbmUnICkgPyAwIDogTWF0aC5tYXgoIEFNUCwgcmF5U2VwYXJhdGlvbiAtIDIgKSxcclxuICAgICAgICAgICAgd2F2ZUZyb250UGF0dGVybjogbW9kZWwud2F2ZWZyb250UHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgICAgIHN0cm9rZTogKCBtb2RlbC5pblBoYXNlUHJvcGVydHkudmFsdWUgKSA/ICdoc2woMCwwJSwyNSUpJyA6ICdibGFjaycsXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogKCBtb2RlbC5pblBoYXNlUHJvcGVydHkudmFsdWUgKSA/IDEuNSA6IDIsXHJcbiAgICAgICAgICAgIHdhdmVGcm9udExpbmVXaWR0aDogKCBtb2RlbC5pblBoYXNlUHJvcGVydHkudmFsdWUgKSA/IDIgOiAzXHJcbiAgICAgICAgICB9ICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiBjaGVja2VkLCBkcmF3IHRoZSBQYXRoIExlbmd0aCBEaWZmZXJlbmNlIHJlZ2lvbiAob25seSBpZiBpdCBoYXMgY2hhbmdlZClcclxuICAgIGlmICggbW9kZWwucGF0aERpZmZlcmVuY2VQcm9wZXJ0eS52YWx1ZSAmJiB0aGlzLnBMRENoYW5nZWQgKSB7XHJcbiAgICAgIHRoaXMucExEQ2hhbmdlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLnBMRE5vZGUucmVtb3ZlQWxsQ2hpbGRyZW4oKTtcclxuICAgICAgY29uc3QgZFNpblRoZXRhID0gU0NBTEVfRkFDVE9SICogKCBtb2RlbC5sYXR0aWNlLmxhdHRpY2VDb25zdGFudHNQcm9wZXJ0eS52YWx1ZS56ICogTWF0aC5zaW4oIHRoZXRhICkgKTtcclxuICAgICAgY29uc3QgbGluZVN0YXJ0ID0gaW5jaWRlbnRSYXkxRW5kO1xyXG4gICAgICBjb25zdCBsaW5lSW5FbmQgPSBuZXcgVmVjdG9yMiggbGluZVN0YXJ0LnggLSAoIEFNUCArIHJheVNlcGFyYXRpb24gKSAqIE1hdGguc2luKCB0aGV0YSApLCBsaW5lU3RhcnQueSArICggQU1QICsgcmF5U2VwYXJhdGlvbiApICogTWF0aC5jb3MoIHRoZXRhICkgKTtcclxuICAgICAgY29uc3QgbGluZU91dEVuZCA9IG5ldyBWZWN0b3IyKCBsaW5lU3RhcnQueCArICggQU1QICsgcmF5U2VwYXJhdGlvbiApICogTWF0aC5zaW4oIHRoZXRhICksIGxpbmVTdGFydC55ICsgKCBBTVAgKyByYXlTZXBhcmF0aW9uICkgKiBNYXRoLmNvcyggdGhldGEgKSApO1xyXG5cclxuICAgICAgY29uc3QgcExEID0gbmV3IFNoYXBlKCk7IC8vIFNoYXBlIHRvIHNob3cgdGhlIGVkZ2VzIG9mIHRoZSBwYXRoIGxlbmd0aCBkaWZmZXJlbmNlXHJcbiAgICAgIHBMRC5tb3ZlVG9Qb2ludCggbGluZUluRW5kICk7XHJcbiAgICAgIHBMRC5saW5lVG9Qb2ludCggbGluZVN0YXJ0ICk7XHJcbiAgICAgIHBMRC5saW5lVG9Qb2ludCggbGluZU91dEVuZCApO1xyXG4gICAgICBjb25zdCBwTERQYXRoID0gbmV3IFBhdGgoIHBMRCwge1xyXG4gICAgICAgIHN0cm9rZTogJ2JsdWUnLFxyXG4gICAgICAgIGxpbmVXaWR0aDogMVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMucExETm9kZS5hZGRDaGlsZCggcExEUGF0aCApO1xyXG5cclxuICAgICAgLy8gU2hhZGUgaW4gdGhlIHJlZ2lvbiBvZiBwYXRoIGxlbmd0aCBkaWZmZXJlbmNlXHJcbiAgICAgIGNvbnN0IHBMRFJlZ2lvbjEgPSBuZXcgU2hhcGUoKTtcclxuICAgICAgY29uc3QgcExEUmVnaW9uMiA9IG5ldyBTaGFwZSgpO1xyXG4gICAgICBwTERSZWdpb24xLm1vdmVUb1BvaW50KCBsaW5lSW5FbmQgKTtcclxuICAgICAgcExEUmVnaW9uMS5saW5lVG9SZWxhdGl2ZSggZFNpblRoZXRhICogTWF0aC5jb3MoIHRoZXRhICksIGRTaW5UaGV0YSAqIE1hdGguc2luKCB0aGV0YSApICk7XHJcbiAgICAgIHBMRFJlZ2lvbjEubGluZVRvUmVsYXRpdmUoIDIgKiBBTVAgKiBNYXRoLnNpbiggdGhldGEgKSwgLTIgKiBBTVAgKiBNYXRoLmNvcyggdGhldGEgKSApO1xyXG4gICAgICBwTERSZWdpb24xLmxpbmVUb1JlbGF0aXZlKCAtZFNpblRoZXRhICogTWF0aC5jb3MoIHRoZXRhICksIC1kU2luVGhldGEgKiBNYXRoLnNpbiggdGhldGEgKSApO1xyXG5cclxuICAgICAgcExEUmVnaW9uMi5tb3ZlVG9Qb2ludCggbGluZU91dEVuZCApO1xyXG4gICAgICBwTERSZWdpb24yLmxpbmVUb1JlbGF0aXZlKCAtZFNpblRoZXRhICogTWF0aC5jb3MoIHRoZXRhICksIGRTaW5UaGV0YSAqIE1hdGguc2luKCB0aGV0YSApICk7XHJcbiAgICAgIHBMRFJlZ2lvbjIubGluZVRvUmVsYXRpdmUoIC0yICogQU1QICogTWF0aC5zaW4oIHRoZXRhICksIC0yICogQU1QICogTWF0aC5jb3MoIHRoZXRhICkgKTtcclxuICAgICAgcExEUmVnaW9uMi5saW5lVG9SZWxhdGl2ZSggZFNpblRoZXRhICogTWF0aC5jb3MoIHRoZXRhICksIC1kU2luVGhldGEgKiBNYXRoLnNpbiggdGhldGEgKSApO1xyXG5cclxuICAgICAgY29uc3QgcExEUmVnaW9uT3B0aW9ucyA9IHsgbGluZVdpZHRoOiAxLCBmaWxsOiAncmdiYSggNjQsIDAsIDAsIDAuMjUgKScgfTsgLy8gbGlnaHQgcGluayByZWdpb24gdG8gc2hvdyBQTERcclxuICAgICAgY29uc3QgcExEUmVnaW9uUGF0aDEgPSBuZXcgUGF0aCggcExEUmVnaW9uMSwgcExEUmVnaW9uT3B0aW9ucyApO1xyXG4gICAgICBjb25zdCBwTERSZWdpb25QYXRoMiA9IG5ldyBQYXRoKCBwTERSZWdpb24yLCBwTERSZWdpb25PcHRpb25zICk7XHJcblxyXG4gICAgICB0aGlzLnBMRE5vZGUuYWRkQ2hpbGQoIHBMRFJlZ2lvblBhdGgxICk7XHJcbiAgICAgIHRoaXMucExETm9kZS5hZGRDaGlsZCggcExEUmVnaW9uUGF0aDIgKTtcclxuXHJcbiAgICAgIC8vIGFkZCBkIHNpbijOuCkgYW5kIGRpbWVuc2lvbiBhcnJvd1xyXG4gICAgICBjb25zdCBwTERBcnJvd1N0YXJ0ID0gbGluZVN0YXJ0LnBsdXNYWSggKCBFTEVNRU5UX1NQQUNJTkcgKyBBTVAgKyByYXlTZXBhcmF0aW9uICkgKiBNYXRoLnNpbiggdGhldGEgKSxcclxuICAgICAgICAoIEVMRU1FTlRfU1BBQ0lORyArIEFNUCArIHJheVNlcGFyYXRpb24gKSAqIE1hdGguY29zKCB0aGV0YSApICk7XHJcbiAgICAgIGNvbnN0IHBMREFycm93RW5kID0gcExEQXJyb3dTdGFydC5wbHVzWFkoIC1kU2luVGhldGEgKiBNYXRoLmNvcyggdGhldGEgKSwgZFNpblRoZXRhICogTWF0aC5zaW4oIHRoZXRhICkgKTtcclxuICAgICAgY29uc3QgcExETGFiZWxDZW50ZXIgPSBwTERBcnJvd1N0YXJ0LnBsdXNYWSggRUxFTUVOVF9TUEFDSU5HICogTWF0aC5zaW4oIHRoZXRhICkgLSAoIGRTaW5UaGV0YSAqIE1hdGguY29zKCB0aGV0YSApICkgLyAyLFxyXG4gICAgICAgIEVMRU1FTlRfU1BBQ0lORyAqIE1hdGguY29zKCB0aGV0YSApICsgKCBkU2luVGhldGEgKiBNYXRoLnNpbiggdGhldGEgKSApIC8gMiApO1xyXG4gICAgICBjb25zdCBwTEREaW1lbnNpb25BcnJvdyA9IG5ldyBBcnJvd05vZGUoIHBMREFycm93U3RhcnQueCwgcExEQXJyb3dTdGFydC55LCBwTERBcnJvd0VuZC54LCBwTERBcnJvd0VuZC55LCBESU1FTlNJT05fQVJST1dfT1BUSU9OUyApO1xyXG4gICAgICBjb25zdCBwTEREaW1lbnNpb25MYWJlbCA9IG5ldyBSaWNoVGV4dCggZFNpblRoZXRhU3RyaW5nLCB7IG1heFdpZHRoOiAyMDAsIGxlZnQ6IHBMRExhYmVsQ2VudGVyLngsIGNlbnRlclk6IHBMRExhYmVsQ2VudGVyLnkgfSApO1xyXG5cclxuICAgICAgLy8gYWRkIGEgdHJhbnNsdWNlbnQgd2hpdGUgYmFja2dyb3VuZCBiZWhpbmQgdGhlIGxhYmVsIHRleHQgLSBjb3VsZCBhbHNvIHVzZSBCYWNrZ3JvdW5kTm9kZVxyXG4gICAgICBjb25zdCBwTERMYWJlbEJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCBwTEREaW1lbnNpb25MYWJlbC54LCBwTEREaW1lbnNpb25MYWJlbC50b3AsXHJcbiAgICAgICAgcExERGltZW5zaW9uTGFiZWwud2lkdGggKyAyLCBwTEREaW1lbnNpb25MYWJlbC5oZWlnaHQgKyAyLCA0LCA0LCB7XHJcbiAgICAgICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICAgICAgb3BhY2l0eTogMC42NVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgdGhpcy5wTEROb2RlLmFkZENoaWxkKCBwTERMYWJlbEJhY2tncm91bmQgKTtcclxuICAgICAgdGhpcy5wTEROb2RlLmFkZENoaWxkKCBwTEREaW1lbnNpb25MYWJlbCApO1xyXG4gICAgICB0aGlzLnBMRE5vZGUuYWRkQ2hpbGQoIHBMRERpbWVuc2lvbkFycm93ICk7XHJcbiAgICAgIHRoaXMucExETm9kZS5zZXRWaXNpYmxlKCB0cnVlICk7XHJcblxyXG4gICAgICAvLyBTaG93IFBhdGggZGlmZmVyZW5jZSBpbmZvcm1hdGlvbiBuZXh0IHRvIGNyeXN0YWxcclxuICAgICAgY29uc3QgcExERGlhZ3JhbUJHID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgMiAqIGRTaW5UaGV0YSwgMiAqIEFNUCwge1xyXG4gICAgICAgIGxpbmVXaWR0aDogbW9kZWwuaW5QaGFzZVByb3BlcnR5LnZhbHVlID8gMiA6IDAuNSxcclxuICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgZmlsbDogJ3JnYmEoIDY0LCAwLCAwLCAwLjI1ICknXHJcbiAgICAgIH0gKTtcclxuICAgICAgY29uc3QgcExERGlhZ3JhbSA9IG5ldyBMaWdodFBhdGhOb2RlKCBuZXcgVmVjdG9yMiggcExERGlhZ3JhbUJHLmxlZnQsIEFNUCApLCBuZXcgVmVjdG9yMiggcExERGlhZ3JhbUJHLnJpZ2h0LCBBTVAgKSxcclxuICAgICAgICBtb2RlbC5zb3VyY2VXYXZlbGVuZ3RoUHJvcGVydHkudmFsdWUgKiBTQ0FMRV9GQUNUT1IsIHtcclxuICAgICAgICAgIGFtcGxpdHVkZTogQU1QLFxyXG4gICAgICAgICAgd2F2ZUZyb250V2lkdGg6IDIgKiBBTVAsXHJcbiAgICAgICAgICB3YXZlRnJvbnRQYXR0ZXJuOiAoKSA9PiAnYmxhY2snXHJcbiAgICAgICAgfSApO1xyXG4gICAgICBwTEREaWFncmFtLmFkZENoaWxkKCBwTEREaWFncmFtQkcgKTsgLy8gYWRkIGEgYmFja2dyb3VuZCB0byB0aGUgbGlnaHQgd2F2ZVxyXG5cclxuICAgICAgY29uc3QgcExERGlhZ3JhbURpbWVuc2lvbkFycm93ID0gbmV3IEFycm93Tm9kZSggcExERGlhZ3JhbUJHLmxlZnQsIDAsIHBMRERpYWdyYW1CRy5yaWdodCwgMCwgRElNRU5TSU9OX0FSUk9XX09QVElPTlMgKTtcclxuXHJcbiAgICAgIC8vIFRleHQgbm9kZXMgdGhhdCByZWZsZWN0cyAyZHNpbihUaGV0YSksIGFuZCAyZHNpbihUaGV0YSkvd2F2ZWxlbmd0aFxyXG4gICAgICBjb25zdCBfMmRTaW5UZXh0ID0gbmV3IFJpY2hUZXh0KCBTdHJpbmdVdGlscy5maWxsSW4oIHBMRFN0cmluZywge1xyXG4gICAgICAgIGludGVycGxhbmVEaXN0YW5jZTogaW50ZXJwbGFuZURpc3RhbmNlU3RyaW5nLFxyXG4gICAgICAgIHZhbHVlOiBVdGlscy50b0ZpeGVkKCBtb2RlbC5wTERQcm9wZXJ0eS52YWx1ZSwgMSApLFxyXG4gICAgICAgIHVuaXQ6IGxlbmd0aFVuaXRTdHJpbmdcclxuICAgICAgfSApLCBURVhUX09QVElPTlMgKTtcclxuICAgICAgY29uc3QgXzJkU2luTGFtYmRhVGV4dCA9IG5ldyBSaWNoVGV4dCggU3RyaW5nVXRpbHMuZmlsbEluKCBicmFnZ0VxdWF0aW9uU3RyaW5nLCB7XHJcbiAgICAgICAgaW50ZXJwbGFuZURpc3RhbmNlOiBpbnRlcnBsYW5lRGlzdGFuY2VTdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IFV0aWxzLnRvRml4ZWQoIG1vZGVsLnBMRFdhdmVsZW5ndGhzUHJvcGVydHkudmFsdWUsIDIgKVxyXG4gICAgICB9ICksIFRFWFRfT1BUSU9OUyApO1xyXG5cclxuICAgICAgY29uc3QgcExEUGFuZWwgPSBuZXcgUGFuZWwoIG5ldyBWQm94KCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFsgXzJkU2luTGFtYmRhVGV4dCwgcExERGlhZ3JhbSwgcExERGlhZ3JhbURpbWVuc2lvbkFycm93LCBfMmRTaW5UZXh0IF0sXHJcbiAgICAgICAgYWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgIHNwYWNpbmc6IEVMRU1FTlRfU1BBQ0lOR1xyXG4gICAgICB9ICksIHtcclxuICAgICAgICB4TWFyZ2luOiAwLFxyXG4gICAgICAgIHlNYXJnaW46IDAsXHJcbiAgICAgICAgZmlsbDogJ3JnYmEoIDI1NSwgMjU1LCAyNTUsIDAuNzUgKScsXHJcbiAgICAgICAgbGluZVdpZHRoOiAwLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMuY3J5c3RhbE5vZGUucmlnaHQsXHJcbiAgICAgICAgY2VudGVyWTogcExETGFiZWxDZW50ZXIueSxcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDZcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgcExEUGFuZWwucmlnaHQgPSBNYXRoLm1pbiggcExEUGFuZWwucmlnaHQsIHRoaXMuY29udHJvbFBhbmVsLmxlZnQgKTsgLy8gYXZvaWQgY292ZXJpbmcgdGhlIGNvbnRyb2wgcGFuZWxzXHJcbiAgICAgIHRoaXMucExETm9kZS5hZGRDaGlsZCggcExEUGFuZWwgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0ZXBzIHRoZSB2aWV3LlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIC8vIHN0ZXBwaW5nIGhhbmRlbGVkIGluIG1vZGVsXHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSW5pdGlhbGl6ZSB0aGUgaWNvbiBmb3IgdXNlIGluIHRoZSB0b29sYm94LlxyXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcclxuICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGluUGxheUFyZWFQcm9wZXJ0eVxyXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmb3J3YXJkaW5nTGlzdGVuZXJcclxuICovXHJcbmNvbnN0IGluaXRpYWxpemVJY29uID0gKCBub2RlLCBpblBsYXlBcmVhUHJvcGVydHksIGZvcndhcmRpbmdMaXN0ZW5lciApID0+IHtcclxuICBub2RlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAvLyBUaGVzZSBsaW5rcyBhbmQgbGlzdGVuZXJzIGV4aXN0cyBmb3IgdGhlIGVudGlyZSBkdXJhdGlvbiBvZiB0aGUgc2ltLiBObyBuZWVkIHRvIGRpc3Bvc2UuXHJcbiAgaW5QbGF5QXJlYVByb3BlcnR5LmxpbmsoIGluUGxheUFyZWEgPT4geyBub2RlLnZpc2libGUgPSAhaW5QbGF5QXJlYTsgfSApO1xyXG4gIG5vZGUuYWRkSW5wdXRMaXN0ZW5lciggRHJhZ0xpc3RlbmVyLmNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciggZm9yd2FyZGluZ0xpc3RlbmVyICkgKTtcclxufTtcclxuXHJcbnhyYXlEaWZmcmFjdGlvbi5yZWdpc3RlciggJ1hyYXlEaWZmcmFjdGlvblNjcmVlblZpZXcnLCBYcmF5RGlmZnJhY3Rpb25TY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFhyYXlEaWZmcmFjdGlvblNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLGlCQUFpQixNQUFNLGtEQUFrRDtBQUNoRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGNBQWMsTUFBTSwrQ0FBK0M7QUFDMUUsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxZQUFZLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN2RyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0Msd0JBQXdCLE1BQU0sMENBQTBDO0FBQy9FLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0Msc0JBQXNCLE1BQU0saUNBQWlDO0FBQ3BFLE9BQU9DLG9CQUFvQixN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