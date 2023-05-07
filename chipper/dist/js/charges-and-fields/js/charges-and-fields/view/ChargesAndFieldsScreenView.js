// Copyright 2014-2022, University of Colorado Boulder

/**
 * Main screen View of the Charges and Fields simulation
 *
 * @author Martin Veillette (Berea College)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import DotUtils from '../../../../dot/js/Utils.js'; // eslint-disable-line default-import-match-filename
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import platform from '../../../../phet-core/js/platform.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, Text, Utils } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import chargesAndFields from '../../chargesAndFields.js';
import ChargesAndFieldsColors from '../ChargesAndFieldsColors.js';
import ChargesAndFieldsConstants from '../ChargesAndFieldsConstants.js';
import ChargedParticleNode from './ChargedParticleNode.js';
import ChargesAndFieldsControlPanel from './ChargesAndFieldsControlPanel.js';
import ChargesAndFieldsMeasuringTapeNode from './ChargesAndFieldsMeasuringTapeNode.js';
import ChargesAndFieldsToolboxPanel from './ChargesAndFieldsToolboxPanel.js';
import ChargesAndSensorsPanel from './ChargesAndSensorsPanel.js';
import ElectricFieldCanvasNode from './ElectricFieldCanvasNode.js';
import ElectricFieldSensorNode from './ElectricFieldSensorNode.js';
import ElectricPotentialCanvasNode from './ElectricPotentialCanvasNode.js';
import ElectricPotentialLinesNode from './ElectricPotentialLinesNode.js';
import ElectricPotentialMobileWebGLNode from './ElectricPotentialMobileWebGLNode.js';
import ElectricPotentialSensorNode from './ElectricPotentialSensorNode.js';
import ElectricPotentialWebGLNode from './ElectricPotentialWebGLNode.js';
import GridNode from './GridNode.js';

// constants
const linear = DotUtils.linear;
const MAX_ELECTRIC_POTENTIAL = 40; // electric potential (in volts) at which color will saturate to colorMax
const MIN_ELECTRIC_POTENTIAL = -40; // electric potential at which color will saturate to minColor

// True (final arg) clamps the linear interpolation function
const ELECTRIC_FIELD_LINEAR_FUNCTION = new LinearFunction(0, ChargesAndFieldsConstants.EFIELD_COLOR_SAT_MAGNITUDE, 0, 1, true);
const ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION = new LinearFunction(MIN_ELECTRIC_POTENTIAL, 0, 0, 1, true);
const ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION = new LinearFunction(0, MAX_ELECTRIC_POTENTIAL, 0, 1, true);
const IS_DEBUG_MODE = phet.chipper.queryParameters.dev; // debug mode that displays a push button capable of adding multiple electric potential lines

/**
 * Determine whether a node is visible in the display, it must be a child and visible.
 * @param {Node} node
 * @returns {boolean}
 */
const isDisplayed = node => {
  const trail = node.getUniqueTrail();
  return trail.isVisible() && trail.rootNode() === phet.joist.display.rootNode;
};
class ChargesAndFieldsScreenView extends ScreenView {
  /**
   * @param {ChargesAndFieldsModel} model - main model of the simulation
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // Create a property that registers the model bounds based on the screen size
    // the availableModelBounds should not be reset when the resetAllButton is pressed,
    this.availableModelBoundsProperty = new Property(model.enlargedBounds, {
      tandem: tandem.createTandem('availableModelBoundsProperty'),
      phetioValueType: Bounds2.Bounds2IO,
      phetioDocumentation: 'Registers the model bounds based on the screen size'
    });

    // The origin of the model is set to the middle of the dev bounds. There are 8 meters across the width of the dev bounds.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(this.layoutBounds.width / 2, this.layoutBounds.height / 2), this.layoutBounds.width / ChargesAndFieldsConstants.WIDTH);

    // convenience variables
    this.modelViewTransform = modelViewTransform;
    this.model = model;

    // The mobile WebGL implementation will work with basic WebGL support
    const allowMobileWebGL = Utils.checkWebGLSupport() && phet.chipper.queryParameters.webgl;

    // The unlimited-particle implementation will work only with OES_texture_float where writing to
    // float textures is supported.
    const allowWebGL = allowMobileWebGL && Utils.checkWebGLSupport(['OES_texture_float']) && ElectricPotentialWebGLNode.supportsRenderingToFloatTexture();
    let electricPotentialGridNode = null;

    // Create the electric Potential grid node that displays an array of contiguous rectangles of changing colors
    // Don't trust Safari's OES_texture_float support currently!
    if (allowWebGL && !platform.safari) {
      electricPotentialGridNode = new ElectricPotentialWebGLNode(model.activeChargedParticles, modelViewTransform, model.isElectricPotentialVisibleProperty);
    } else if (allowMobileWebGL) {
      electricPotentialGridNode = new ElectricPotentialMobileWebGLNode(model.activeChargedParticles, modelViewTransform, model.isElectricPotentialVisibleProperty);
    } else {
      electricPotentialGridNode = new ElectricPotentialCanvasNode(model.activeChargedParticles, modelViewTransform, model.enlargedBounds, model.isElectricPotentialVisibleProperty);
    }

    // Create a grid of electric field arrow sensors
    const electricFieldGridNode = new ElectricFieldCanvasNode(model.activeChargedParticles, modelViewTransform, model.enlargedBounds, model.isElectricFieldDirectionOnlyProperty, model.isElectricFieldVisibleProperty);

    // Create the scenery node responsible for drawing the electricPotential lines
    const electricPotentialLinesNode = new ElectricPotentialLinesNode(model.electricPotentialLineGroup, modelViewTransform, model.areValuesVisibleProperty, tandem.createTandem('electricPotentialLinesNode'));

    // function({Property.<Vector2>}) to be called at the end of drag event
    const snapToGridLines = model.snapToGridLines.bind(model);

    // Create the draggable electric potential sensor node with a electric potential readout
    const electricPotentialSensorNode = new ElectricPotentialSensorNode(model, snapToGridLines, this.getElectricPotentialColor.bind(this), modelViewTransform, this.availableModelBoundsProperty, tandem.createTandem('electricPotentialSensorNode'));

    // Create a visual grid with major and minor lines on the view
    const gridNode = new GridNode(modelViewTransform, new Property(model.enlargedBounds), model.isGridVisibleProperty, model.areValuesVisibleProperty, tandem.createTandem('gridNode'));

    // Create the electric control panel on the upper right hand side
    const controlPanel = new ChargesAndFieldsControlPanel(model, tandem.createTandem('controlPanel'));

    // Create the Reset All Button in the bottom right, which resets the model
    const resetAllButton = new ResetAllButton({
      // do not reset the availableDragBoundsProperty
      listener: () => model.reset(),
      tandem: tandem.createTandem('resetAllButton')
    });

    // Create a measuring tape (set to invisible initially)
    const measuringTapeNode = new ChargesAndFieldsMeasuringTapeNode(model.measuringTape, snapToGridLines, modelViewTransform, this.availableModelBoundsProperty, tandem.createTandem('measuringTapeNode'));

    // The color of measurement text of the measuring tape updates itself when the projector/default color scheme changes
    ChargesAndFieldsColors.measuringTapeTextProperty.linkAttribute(measuringTapeNode, 'textColor');

    // Create the toolboxPanel with the measuring tape and the electric potential sensor icons
    const toolboxPanel = new ChargesAndFieldsToolboxPanel(model.measuringTape, model.electricPotentialSensor, measuringTapeNode, electricPotentialSensorNode, modelViewTransform, this.availableModelBoundsProperty, tandem.createTandem('toolboxPanel'));

    // Create the layer where the charged Particles and electric Field Sensors will be placed.
    // Force the moving charged Particles and electric Field Sensors into a separate layer for performance reasons.
    const draggableElementsLayer = new Node({
      layerSplit: true,
      preventFit: true
    });

    // webGL devices that do not have full WebGL support can only have a finite number of charges on board
    const isNumberChargesLimited = allowMobileWebGL && !allowWebGL;
    const numberChargesLimit = isNumberChargesLimited ? ElectricPotentialMobileWebGLNode.getNumberOfParticlesSupported() : Number.POSITIVE_INFINITY;
    const canAddMoreChargedParticlesProperty = new BooleanProperty(false);
    const updateCanAddMoreChargedParticlesProperty = () => {
      canAddMoreChargedParticlesProperty.value = model.chargedParticleGroup.count < numberChargesLimit;
    };
    updateCanAddMoreChargedParticlesProperty();
    model.chargedParticleGroup.elementCreatedEmitter.addListener(updateCanAddMoreChargedParticlesProperty);
    model.chargedParticleGroup.elementDisposedEmitter.addListener(updateCanAddMoreChargedParticlesProperty);

    // Create the charge and sensor enclosure, will be displayed at the bottom of the screen
    const chargesAndSensorsPanel = new ChargesAndSensorsPanel(model, this, (modelElement, event) => {
      // Horrible horrible hacks
      draggableElementsLayer.children.forEach(potentialView => {
        if (potentialView.modelElement === modelElement) {
          potentialView.dragListener.press(event, potentialView);
        }
      });
    }, canAddMoreChargedParticlesProperty, modelViewTransform, tandem.createTandem('chargesAndSensorsPanel'));
    model.isChargesAndSensorsPanelDisplayed = () => {
      const trail = chargesAndSensorsPanel.getUniqueTrail();
      return trail.isVisible() && trail.rootNode() === phet.joist.display.rootNode;
    };
    const updateSensorPanelLayout = () => {
      chargesAndSensorsPanel.bottom = this.layoutBounds.bottom - 15;
      chargesAndSensorsPanel.centerX = this.layoutBounds.centerX;
      model.chargesAndSensorsEnclosureBoundsProperty.set(modelViewTransform.viewToModelBounds(chargesAndSensorsPanel.bounds));
    };
    chargesAndSensorsPanel.localBoundsProperty.lazyLink(updateSensorPanelLayout);
    updateSensorPanelLayout();

    // Only show the ChargesAndSensorsPanel when at least one of its elements is visible
    new DerivedProperty([model.allowNewPositiveChargesProperty, model.allowNewNegativeChargesProperty, model.allowNewElectricFieldSensorsProperty], (positive, negative, electricFieldSensorGroup) => positive || negative || electricFieldSensorGroup).linkAttribute(chargesAndSensorsPanel, 'visible');

    // Handle the comings and goings of charged particles.
    model.chargedParticleGroup.elementCreatedEmitter.addListener(addedChargedParticle => {
      // Create and add the view representation for this chargedParticle.
      const chargedParticleNode = chargedParticleNodeGroup.createCorrespondingGroupElement(addedChargedParticle.tandem.name, addedChargedParticle);
      draggableElementsLayer.addChild(chargedParticleNode);
      addedChargedParticle.disposeEmitter.addListener(function callback() {
        addedChargedParticle.disposeEmitter.removeListener(callback);
        draggableElementsLayer.removeChild(chargedParticleNode);
        chargedParticleNodeGroup.disposeElement(chargedParticleNode);
      });
    });
    const chargedParticleNodeGroup = new PhetioGroup((tandem, chargedParticle) => {
      return new ChargedParticleNode(chargedParticle, snapToGridLines, modelViewTransform, this.availableModelBoundsProperty, model.chargesAndSensorsEnclosureBoundsProperty.get(), tandem);
    }, () => [model.chargedParticleGroup.archetype], {
      tandem: tandem.createTandem('chargedParticleNodeGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      // These elements are not created by the PhET-IO state engine, they can just listen to the model for supporting
      // state in the same way they do for sim logic.
      supportsDynamicState: false
    });
    const electricFieldSensorNodeGroup = new PhetioGroup((tandem, electricFieldSensor) => {
      // Create and add the view representation for this electric Field Sensor
      const electricFieldSensorNode = new ElectricFieldSensorNode(electricFieldSensor, snapToGridLines, modelViewTransform, this.availableModelBoundsProperty, model.isPlayAreaChargedProperty, model.areValuesVisibleProperty, model.chargesAndSensorsEnclosureBoundsProperty.get(), tandem);
      return electricFieldSensorNode;
    }, () => [model.electricFieldSensorGroup.archetype], {
      tandem: tandem.createTandem('electricFieldSensorNodeGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      // These elements are not created by the PhET-IO state engine, they can just listen to the model for supporting
      // state in the same way they do for sim logic.
      supportsDynamicState: false
    });

    // Handle the comings and goings of charged electric field sensors.
    model.electricFieldSensorGroup.elementCreatedEmitter.addListener(addedElectricFieldSensor => {
      const electricFieldSensorNode = electricFieldSensorNodeGroup.createCorrespondingGroupElement(addedElectricFieldSensor.tandem.name, addedElectricFieldSensor);
      draggableElementsLayer.addChild(electricFieldSensorNode);

      // Add the removal listener for if and when this electric field sensor is removed from the model.
      model.electricFieldSensorGroup.elementDisposedEmitter.addListener(function removalListener(removedElectricFieldSensor) {
        if (removedElectricFieldSensor === addedElectricFieldSensor) {
          electricFieldSensorNodeGroup.disposeElement(electricFieldSensorNode);
          model.electricFieldSensorGroup.elementDisposedEmitter.removeListener(removalListener);
        }
      });
    });

    // listens to the isUserControlled property of the electric potential sensor
    // return the electric Potential sensor to the toolboxPanel if it is not user Controlled and the
    // position of the sensor is inside the toolboxPanel panel
    electricPotentialSensorNode.isUserControlledProperty.link(isUserControlled => {
      if (!isUserControlled && toolboxPanel.bounds.intersectsBounds(electricPotentialSensorNode.bounds.eroded(5)) && isDisplayed(toolboxPanel)) {
        model.electricPotentialSensor.isActiveProperty.set(false);
      }
    });

    // listens to the isUserControlled property of the measuring tape
    // return the measuring tape to the toolboxPanel if not user Controlled and its position is located within the
    // toolbox panel
    measuringTapeNode.isBaseUserControlledProperty.link(isBaseUserControlled => {
      const tapeBaseBounds = measuringTapeNode.localToParentBounds(measuringTapeNode.getLocalBaseBounds());
      if (!isBaseUserControlled && toolboxPanel.bounds.intersectsBounds(tapeBaseBounds.eroded(5)) && isDisplayed(toolboxPanel)) {
        model.measuringTape.isActiveProperty.set(false);
      }
    });

    // dynamic parts of the control layout
    const updateControlLayout = () => {
      // right-align control panels
      const right = modelViewTransform.modelToViewX(this.availableModelBoundsProperty.get().right) - 10;
      controlPanel.right = right;
      resetAllButton.right = right;
      toolboxPanel.right = right;

      // toolbox panel below the control panel
      toolboxPanel.top = controlPanel.bottom + 10;
    };

    // link the available model bounds
    this.availableModelBoundsProperty.link(bounds => {
      // the measuring Tape is subject to dragBounds (specified in model coordinates)
      measuringTapeNode.setDragBounds(bounds);
      updateControlLayout();
    });
    updateControlLayout();
    controlPanel.localBoundsProperty.lazyLink(updateControlLayout);

    // static parts of the control layout
    controlPanel.top = 30;
    gridNode.centerX = this.layoutBounds.centerX;
    gridNode.top = modelViewTransform.modelToViewY(model.enlargedBounds.maxY);
    resetAllButton.bottom = this.layoutBounds.maxY - 20;
    this.addChild(electricPotentialGridNode); // it is the bottom of the z-order
    this.addChild(gridNode);
    this.addChild(electricFieldGridNode);
    this.addChild(electricPotentialLinesNode);
    this.addChild(toolboxPanel);
    this.addChild(controlPanel);
    this.addChild(resetAllButton);
    this.addChild(chargesAndSensorsPanel);
    this.addChild(draggableElementsLayer);
    this.addChild(electricPotentialSensorNode);
    this.addChild(measuringTapeNode);

    // if in debug mode, add a button that allows to add (many at a time) electric potential lines
    // and set up initial charges on the play area
    if (IS_DEBUG_MODE) {
      this.addChild(new RectangularPushButton({
        listener: () => model.addManyElectricPotentialLines(20),
        baseColor: 'rgb( 0, 222, 120 )',
        top: this.layoutBounds.top,
        left: this.layoutBounds.left,
        content: new Text('add some potential lines'),
        tandem: tandem.createTandem('debugButton')
      }));
      const charge1 = model.chargedParticleGroup.createNextElement(1, new Vector2(0, -1.5));
      const charge2 = model.chargedParticleGroup.createNextElement(-1, new Vector2(0, -1.5));
      charge1.isActiveProperty.set(true);
      charge2.isActiveProperty.set(true);
      charge1.positionProperty.set(new Vector2(2, 2));
      charge2.positionProperty.set(new Vector2(0, 1));
      model.isPlayAreaChargedProperty.set(true); // set isPlayAreaCharged to true since there are charges
    }
  }

  /**
   * Function that returns a color string for a given value of the electricPotential.
   * The interpolation scheme is somewhat unusual in the sense that it is performed via a piecewise function
   * which relies on three colors and three electric potential anchors. It is essentially two linear interpolation
   * functions put end to end so that the entire domain is covered.
   * @private
   * @param {number} electricPotential
   * @param {Object} [options] - useful to set transparency
   * @returns {string} color -  e.g. 'rgba(255, 255, 255, 1)'
   */
  getElectricPotentialColor(electricPotential, options) {
    let finalColor; // {string} e.g. 'rgba(0,0,0,1)'
    let distance; // {number}  between 0 and 1

    // for positive electric potential
    if (electricPotential > 0) {
      // clamped linear interpolation function, output lies between 0 and 1;
      distance = ELECTRIC_POTENTIAL_POSITIVE_LINEAR_FUNCTION.evaluate(electricPotential);
      finalColor = this.interpolateRGBA(
      // {Color} color that corresponds to the Electric Potential being zero
      ChargesAndFieldsColors.electricPotentialGridZeroProperty.get(),
      // {Color} color of Max Electric Potential
      ChargesAndFieldsColors.electricPotentialGridSaturationPositiveProperty.get(), distance,
      // {number} distance must be between 0 and 1
      options);
    }
    // for negative (or zero) electric potential
    else {
      // clamped linear interpolation function, output lies between 0 and 1
      distance = ELECTRIC_POTENTIAL_NEGATIVE_LINEAR_FUNCTION.evaluate(electricPotential);
      finalColor = this.interpolateRGBA(
      // {Color} color that corresponds to the lowest (i.e. negative) Electric Potential
      ChargesAndFieldsColors.electricPotentialGridSaturationNegativeProperty.get(),
      // {Color} color that corresponds to the Electric Potential being zero zero
      ChargesAndFieldsColors.electricPotentialGridZeroProperty.get(), distance,
      // {number} distance must be between 0 and 1
      options);
    }
    return finalColor;
  }

  /**
   * Function that returns a color that is proportional to the magnitude of the electric Field.
   * The color interpolates between ChargesAndFieldsColors.electricFieldGridZero (for an
   * electric field value of zero) and ChargesAndFieldsColors.electricFieldGridSaturation (which corresponds to an
   * electric field value of EFIELD_COLOR_SAT_MAGNITUDE).
   * @private
   * @param {number} electricFieldMagnitude - a non negative number
   * @param {Object} [options] - useful to set transparency
   * @returns {string} color - e.g. 'rgba(255, 255, 255, 1)'
   *
   */
  getElectricFieldMagnitudeColor(electricFieldMagnitude, options) {
    // ELECTRIC_FIELD_LINEAR_FUNCTION is a clamped linear function
    const distance = ELECTRIC_FIELD_LINEAR_FUNCTION.evaluate(electricFieldMagnitude); // a value between 0 and 1

    return this.interpolateRGBA(ChargesAndFieldsColors.electricFieldGridZeroProperty.get(),
    // {Color} color that corresponds to zero electric Field
    ChargesAndFieldsColors.electricFieldGridSaturationProperty.get(),
    // {Color} color that corresponds to the largest electric field
    distance,
    // {number} distance must be between 0 and 1
    options);
  }

  /**
   * Function that interpolates between two color. The transparency can be set vis a default options
   * The function returns a string in order to minimize the number of allocations
   * @private
   * @param {Color} color1
   * @param {Color} color2
   * @param {number} distance - a value from 0 to 1
   * @param {Object} [options]
   * @returns {string} color - e.g. 'rgba(0,0,0,1)'
   */
  interpolateRGBA(color1, color2, distance, options) {
    options = merge({
      // defaults
      transparency: 1
    }, options);
    if (distance < 0 || distance > 1) {
      throw new Error(`distance must be between 0 and 1: ${distance}`);
    }
    const r = Math.floor(linear(0, 1, color1.r, color2.r, distance));
    const g = Math.floor(linear(0, 1, color1.g, color2.g, distance));
    const b = Math.floor(linear(0, 1, color1.b, color2.b, distance));
    return `rgba(${r},${g},${b},${options.transparency})`;
  }

  /**
   * Function responsible for the layout of the ScreenView.
   * It overrides the layout strategy in ScreenView.js
   * It scales the scene graph up and down with
   * the size of the screen to ensure a minimally visible area,
   * but keeping it centered at the bottom of the screen.
   * @public
   * @param {Bounds2} viewBounds
   */
  layout(viewBounds) {
    this.resetTransform();
    const scale = this.getLayoutScale(viewBounds); // {number}
    this.setScaleMagnitude(scale);
    const width = viewBounds.width;
    const height = viewBounds.height;
    let offsetX = 0;
    let offsetY = 0;

    // Move to bottom vertically
    if (scale === width / this.layoutBounds.width) {
      offsetY = height / scale - this.layoutBounds.height;
    }

    // center horizontally
    else if (scale === height / this.layoutBounds.height) {
      offsetX = (width / scale - this.layoutBounds.width) / 2;
    }
    this.translate(offsetX + viewBounds.left / scale, offsetY + viewBounds.top / scale);
    const nominalViewBounds = new Rectangle(-offsetX, -offsetY, width / scale, height / scale);

    // the modelBounds are the nominal viewBounds (in model coordinates) or the model.enlargedBounds, whichever is smaller.
    this.availableModelBoundsProperty.set(this.modelViewTransform.viewToModelBounds(nominalViewBounds).intersection(this.model.enlargedBounds));
  }
}
chargesAndFields.register('ChargesAndFieldsScreenView', ChargesAndFieldsScreenView);
export default ChargesAndFieldsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJMaW5lYXJGdW5jdGlvbiIsIlJlY3RhbmdsZSIsIkRvdFV0aWxzIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJtZXJnZSIsInBsYXRmb3JtIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc2V0QWxsQnV0dG9uIiwiTm9kZSIsIlRleHQiLCJVdGlscyIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlBoZXRpb0dyb3VwIiwiY2hhcmdlc0FuZEZpZWxkcyIsIkNoYXJnZXNBbmRGaWVsZHNDb2xvcnMiLCJDaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzIiwiQ2hhcmdlZFBhcnRpY2xlTm9kZSIsIkNoYXJnZXNBbmRGaWVsZHNDb250cm9sUGFuZWwiLCJDaGFyZ2VzQW5kRmllbGRzTWVhc3VyaW5nVGFwZU5vZGUiLCJDaGFyZ2VzQW5kRmllbGRzVG9vbGJveFBhbmVsIiwiQ2hhcmdlc0FuZFNlbnNvcnNQYW5lbCIsIkVsZWN0cmljRmllbGRDYW52YXNOb2RlIiwiRWxlY3RyaWNGaWVsZFNlbnNvck5vZGUiLCJFbGVjdHJpY1BvdGVudGlhbENhbnZhc05vZGUiLCJFbGVjdHJpY1BvdGVudGlhbExpbmVzTm9kZSIsIkVsZWN0cmljUG90ZW50aWFsTW9iaWxlV2ViR0xOb2RlIiwiRWxlY3RyaWNQb3RlbnRpYWxTZW5zb3JOb2RlIiwiRWxlY3RyaWNQb3RlbnRpYWxXZWJHTE5vZGUiLCJHcmlkTm9kZSIsImxpbmVhciIsIk1BWF9FTEVDVFJJQ19QT1RFTlRJQUwiLCJNSU5fRUxFQ1RSSUNfUE9URU5USUFMIiwiRUxFQ1RSSUNfRklFTERfTElORUFSX0ZVTkNUSU9OIiwiRUZJRUxEX0NPTE9SX1NBVF9NQUdOSVRVREUiLCJFTEVDVFJJQ19QT1RFTlRJQUxfTkVHQVRJVkVfTElORUFSX0ZVTkNUSU9OIiwiRUxFQ1RSSUNfUE9URU5USUFMX1BPU0lUSVZFX0xJTkVBUl9GVU5DVElPTiIsIklTX0RFQlVHX01PREUiLCJwaGV0IiwiY2hpcHBlciIsInF1ZXJ5UGFyYW1ldGVycyIsImRldiIsImlzRGlzcGxheWVkIiwibm9kZSIsInRyYWlsIiwiZ2V0VW5pcXVlVHJhaWwiLCJpc1Zpc2libGUiLCJyb290Tm9kZSIsImpvaXN0IiwiZGlzcGxheSIsIkNoYXJnZXNBbmRGaWVsZHNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkiLCJlbmxhcmdlZEJvdW5kcyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsIkJvdW5kczJJTyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJsYXlvdXRCb3VuZHMiLCJ3aWR0aCIsImhlaWdodCIsIldJRFRIIiwiYWxsb3dNb2JpbGVXZWJHTCIsImNoZWNrV2ViR0xTdXBwb3J0Iiwid2ViZ2wiLCJhbGxvd1dlYkdMIiwic3VwcG9ydHNSZW5kZXJpbmdUb0Zsb2F0VGV4dHVyZSIsImVsZWN0cmljUG90ZW50aWFsR3JpZE5vZGUiLCJzYWZhcmkiLCJhY3RpdmVDaGFyZ2VkUGFydGljbGVzIiwiaXNFbGVjdHJpY1BvdGVudGlhbFZpc2libGVQcm9wZXJ0eSIsImVsZWN0cmljRmllbGRHcmlkTm9kZSIsImlzRWxlY3RyaWNGaWVsZERpcmVjdGlvbk9ubHlQcm9wZXJ0eSIsImlzRWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eSIsImVsZWN0cmljUG90ZW50aWFsTGluZXNOb2RlIiwiZWxlY3RyaWNQb3RlbnRpYWxMaW5lR3JvdXAiLCJhcmVWYWx1ZXNWaXNpYmxlUHJvcGVydHkiLCJzbmFwVG9HcmlkTGluZXMiLCJiaW5kIiwiZWxlY3RyaWNQb3RlbnRpYWxTZW5zb3JOb2RlIiwiZ2V0RWxlY3RyaWNQb3RlbnRpYWxDb2xvciIsImdyaWROb2RlIiwiaXNHcmlkVmlzaWJsZVByb3BlcnR5IiwiY29udHJvbFBhbmVsIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwibWVhc3VyaW5nVGFwZU5vZGUiLCJtZWFzdXJpbmdUYXBlIiwibWVhc3VyaW5nVGFwZVRleHRQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJ0b29sYm94UGFuZWwiLCJlbGVjdHJpY1BvdGVudGlhbFNlbnNvciIsImRyYWdnYWJsZUVsZW1lbnRzTGF5ZXIiLCJsYXllclNwbGl0IiwicHJldmVudEZpdCIsImlzTnVtYmVyQ2hhcmdlc0xpbWl0ZWQiLCJudW1iZXJDaGFyZ2VzTGltaXQiLCJnZXROdW1iZXJPZlBhcnRpY2xlc1N1cHBvcnRlZCIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiY2FuQWRkTW9yZUNoYXJnZWRQYXJ0aWNsZXNQcm9wZXJ0eSIsInVwZGF0ZUNhbkFkZE1vcmVDaGFyZ2VkUGFydGljbGVzUHJvcGVydHkiLCJ2YWx1ZSIsImNoYXJnZWRQYXJ0aWNsZUdyb3VwIiwiY291bnQiLCJlbGVtZW50Q3JlYXRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImVsZW1lbnREaXNwb3NlZEVtaXR0ZXIiLCJjaGFyZ2VzQW5kU2Vuc29yc1BhbmVsIiwibW9kZWxFbGVtZW50IiwiZXZlbnQiLCJjaGlsZHJlbiIsImZvckVhY2giLCJwb3RlbnRpYWxWaWV3IiwiZHJhZ0xpc3RlbmVyIiwicHJlc3MiLCJpc0NoYXJnZXNBbmRTZW5zb3JzUGFuZWxEaXNwbGF5ZWQiLCJ1cGRhdGVTZW5zb3JQYW5lbExheW91dCIsImJvdHRvbSIsImNlbnRlclgiLCJjaGFyZ2VzQW5kU2Vuc29yc0VuY2xvc3VyZUJvdW5kc1Byb3BlcnR5Iiwic2V0Iiwidmlld1RvTW9kZWxCb3VuZHMiLCJib3VuZHMiLCJsb2NhbEJvdW5kc1Byb3BlcnR5IiwibGF6eUxpbmsiLCJhbGxvd05ld1Bvc2l0aXZlQ2hhcmdlc1Byb3BlcnR5IiwiYWxsb3dOZXdOZWdhdGl2ZUNoYXJnZXNQcm9wZXJ0eSIsImFsbG93TmV3RWxlY3RyaWNGaWVsZFNlbnNvcnNQcm9wZXJ0eSIsInBvc2l0aXZlIiwibmVnYXRpdmUiLCJlbGVjdHJpY0ZpZWxkU2Vuc29yR3JvdXAiLCJhZGRlZENoYXJnZWRQYXJ0aWNsZSIsImNoYXJnZWRQYXJ0aWNsZU5vZGUiLCJjaGFyZ2VkUGFydGljbGVOb2RlR3JvdXAiLCJjcmVhdGVDb3JyZXNwb25kaW5nR3JvdXBFbGVtZW50IiwibmFtZSIsImFkZENoaWxkIiwiZGlzcG9zZUVtaXR0ZXIiLCJjYWxsYmFjayIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlQ2hpbGQiLCJkaXNwb3NlRWxlbWVudCIsImNoYXJnZWRQYXJ0aWNsZSIsImdldCIsImFyY2hldHlwZSIsInBoZXRpb1R5cGUiLCJQaGV0aW9Hcm91cElPIiwiTm9kZUlPIiwic3VwcG9ydHNEeW5hbWljU3RhdGUiLCJlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZUdyb3VwIiwiZWxlY3RyaWNGaWVsZFNlbnNvciIsImVsZWN0cmljRmllbGRTZW5zb3JOb2RlIiwiaXNQbGF5QXJlYUNoYXJnZWRQcm9wZXJ0eSIsImFkZGVkRWxlY3RyaWNGaWVsZFNlbnNvciIsInJlbW92YWxMaXN0ZW5lciIsInJlbW92ZWRFbGVjdHJpY0ZpZWxkU2Vuc29yIiwiaXNVc2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGluayIsImlzVXNlckNvbnRyb2xsZWQiLCJpbnRlcnNlY3RzQm91bmRzIiwiZXJvZGVkIiwiaXNBY3RpdmVQcm9wZXJ0eSIsImlzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJpc0Jhc2VVc2VyQ29udHJvbGxlZCIsInRhcGVCYXNlQm91bmRzIiwibG9jYWxUb1BhcmVudEJvdW5kcyIsImdldExvY2FsQmFzZUJvdW5kcyIsInVwZGF0ZUNvbnRyb2xMYXlvdXQiLCJyaWdodCIsIm1vZGVsVG9WaWV3WCIsInRvcCIsInNldERyYWdCb3VuZHMiLCJtb2RlbFRvVmlld1kiLCJtYXhZIiwiYWRkTWFueUVsZWN0cmljUG90ZW50aWFsTGluZXMiLCJiYXNlQ29sb3IiLCJsZWZ0IiwiY29udGVudCIsImNoYXJnZTEiLCJjcmVhdGVOZXh0RWxlbWVudCIsImNoYXJnZTIiLCJwb3NpdGlvblByb3BlcnR5IiwiZWxlY3RyaWNQb3RlbnRpYWwiLCJvcHRpb25zIiwiZmluYWxDb2xvciIsImRpc3RhbmNlIiwiZXZhbHVhdGUiLCJpbnRlcnBvbGF0ZVJHQkEiLCJlbGVjdHJpY1BvdGVudGlhbEdyaWRaZXJvUHJvcGVydHkiLCJlbGVjdHJpY1BvdGVudGlhbEdyaWRTYXR1cmF0aW9uUG9zaXRpdmVQcm9wZXJ0eSIsImVsZWN0cmljUG90ZW50aWFsR3JpZFNhdHVyYXRpb25OZWdhdGl2ZVByb3BlcnR5IiwiZ2V0RWxlY3RyaWNGaWVsZE1hZ25pdHVkZUNvbG9yIiwiZWxlY3RyaWNGaWVsZE1hZ25pdHVkZSIsImVsZWN0cmljRmllbGRHcmlkWmVyb1Byb3BlcnR5IiwiZWxlY3RyaWNGaWVsZEdyaWRTYXR1cmF0aW9uUHJvcGVydHkiLCJjb2xvcjEiLCJjb2xvcjIiLCJ0cmFuc3BhcmVuY3kiLCJFcnJvciIsInIiLCJNYXRoIiwiZmxvb3IiLCJnIiwiYiIsImxheW91dCIsInZpZXdCb3VuZHMiLCJyZXNldFRyYW5zZm9ybSIsInNjYWxlIiwiZ2V0TGF5b3V0U2NhbGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsIm9mZnNldFgiLCJvZmZzZXRZIiwidHJhbnNsYXRlIiwibm9taW5hbFZpZXdCb3VuZHMiLCJpbnRlcnNlY3Rpb24iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYXJnZXNBbmRGaWVsZHNTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gc2NyZWVuIFZpZXcgb2YgdGhlIENoYXJnZXMgYW5kIEZpZWxkcyBzaW11bGF0aW9uXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IERvdFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZGVmYXVsdC1pbXBvcnQtbWF0Y2gtZmlsZW5hbWVcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFRleHQsIFV0aWxzIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldGlvR3JvdXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1BoZXRpb0dyb3VwLmpzJztcclxuaW1wb3J0IGNoYXJnZXNBbmRGaWVsZHMgZnJvbSAnLi4vLi4vY2hhcmdlc0FuZEZpZWxkcy5qcyc7XHJcbmltcG9ydCBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzIGZyb20gJy4uL0NoYXJnZXNBbmRGaWVsZHNDb2xvcnMuanMnO1xyXG5pbXBvcnQgQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cyBmcm9tICcuLi9DaGFyZ2VzQW5kRmllbGRzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENoYXJnZWRQYXJ0aWNsZU5vZGUgZnJvbSAnLi9DaGFyZ2VkUGFydGljbGVOb2RlLmpzJztcclxuaW1wb3J0IENoYXJnZXNBbmRGaWVsZHNDb250cm9sUGFuZWwgZnJvbSAnLi9DaGFyZ2VzQW5kRmllbGRzQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IENoYXJnZXNBbmRGaWVsZHNNZWFzdXJpbmdUYXBlTm9kZSBmcm9tICcuL0NoYXJnZXNBbmRGaWVsZHNNZWFzdXJpbmdUYXBlTm9kZS5qcyc7XHJcbmltcG9ydCBDaGFyZ2VzQW5kRmllbGRzVG9vbGJveFBhbmVsIGZyb20gJy4vQ2hhcmdlc0FuZEZpZWxkc1Rvb2xib3hQYW5lbC5qcyc7XHJcbmltcG9ydCBDaGFyZ2VzQW5kU2Vuc29yc1BhbmVsIGZyb20gJy4vQ2hhcmdlc0FuZFNlbnNvcnNQYW5lbC5qcyc7XHJcbmltcG9ydCBFbGVjdHJpY0ZpZWxkQ2FudmFzTm9kZSBmcm9tICcuL0VsZWN0cmljRmllbGRDYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IEVsZWN0cmljRmllbGRTZW5zb3JOb2RlIGZyb20gJy4vRWxlY3RyaWNGaWVsZFNlbnNvck5vZGUuanMnO1xyXG5pbXBvcnQgRWxlY3RyaWNQb3RlbnRpYWxDYW52YXNOb2RlIGZyb20gJy4vRWxlY3RyaWNQb3RlbnRpYWxDYW52YXNOb2RlLmpzJztcclxuaW1wb3J0IEVsZWN0cmljUG90ZW50aWFsTGluZXNOb2RlIGZyb20gJy4vRWxlY3RyaWNQb3RlbnRpYWxMaW5lc05vZGUuanMnO1xyXG5pbXBvcnQgRWxlY3RyaWNQb3RlbnRpYWxNb2JpbGVXZWJHTE5vZGUgZnJvbSAnLi9FbGVjdHJpY1BvdGVudGlhbE1vYmlsZVdlYkdMTm9kZS5qcyc7XHJcbmltcG9ydCBFbGVjdHJpY1BvdGVudGlhbFNlbnNvck5vZGUgZnJvbSAnLi9FbGVjdHJpY1BvdGVudGlhbFNlbnNvck5vZGUuanMnO1xyXG5pbXBvcnQgRWxlY3RyaWNQb3RlbnRpYWxXZWJHTE5vZGUgZnJvbSAnLi9FbGVjdHJpY1BvdGVudGlhbFdlYkdMTm9kZS5qcyc7XHJcbmltcG9ydCBHcmlkTm9kZSBmcm9tICcuL0dyaWROb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBsaW5lYXIgPSBEb3RVdGlscy5saW5lYXI7XHJcbmNvbnN0IE1BWF9FTEVDVFJJQ19QT1RFTlRJQUwgPSA0MDsgLy8gZWxlY3RyaWMgcG90ZW50aWFsIChpbiB2b2x0cykgYXQgd2hpY2ggY29sb3Igd2lsbCBzYXR1cmF0ZSB0byBjb2xvck1heFxyXG5jb25zdCBNSU5fRUxFQ1RSSUNfUE9URU5USUFMID0gLTQwOyAvLyBlbGVjdHJpYyBwb3RlbnRpYWwgYXQgd2hpY2ggY29sb3Igd2lsbCBzYXR1cmF0ZSB0byBtaW5Db2xvclxyXG5cclxuLy8gVHJ1ZSAoZmluYWwgYXJnKSBjbGFtcHMgdGhlIGxpbmVhciBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uXHJcbmNvbnN0IEVMRUNUUklDX0ZJRUxEX0xJTkVBUl9GVU5DVElPTiA9IG5ldyBMaW5lYXJGdW5jdGlvbiggMCwgQ2hhcmdlc0FuZEZpZWxkc0NvbnN0YW50cy5FRklFTERfQ09MT1JfU0FUX01BR05JVFVERSwgMCwgMSwgdHJ1ZSApO1xyXG5jb25zdCBFTEVDVFJJQ19QT1RFTlRJQUxfTkVHQVRJVkVfTElORUFSX0ZVTkNUSU9OID0gbmV3IExpbmVhckZ1bmN0aW9uKCBNSU5fRUxFQ1RSSUNfUE9URU5USUFMLCAwLCAwLCAxLCB0cnVlICk7XHJcbmNvbnN0IEVMRUNUUklDX1BPVEVOVElBTF9QT1NJVElWRV9MSU5FQVJfRlVOQ1RJT04gPSBuZXcgTGluZWFyRnVuY3Rpb24oIDAsIE1BWF9FTEVDVFJJQ19QT1RFTlRJQUwsIDAsIDEsIHRydWUgKTtcclxuXHJcbmNvbnN0IElTX0RFQlVHX01PREUgPSBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmRldjsgLy8gZGVidWcgbW9kZSB0aGF0IGRpc3BsYXlzIGEgcHVzaCBidXR0b24gY2FwYWJsZSBvZiBhZGRpbmcgbXVsdGlwbGUgZWxlY3RyaWMgcG90ZW50aWFsIGxpbmVzXHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lIHdoZXRoZXIgYSBub2RlIGlzIHZpc2libGUgaW4gdGhlIGRpc3BsYXksIGl0IG11c3QgYmUgYSBjaGlsZCBhbmQgdmlzaWJsZS5cclxuICogQHBhcmFtIHtOb2RlfSBub2RlXHJcbiAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gKi9cclxuY29uc3QgaXNEaXNwbGF5ZWQgPSBub2RlID0+IHtcclxuICBjb25zdCB0cmFpbCA9IG5vZGUuZ2V0VW5pcXVlVHJhaWwoKTtcclxuICByZXR1cm4gdHJhaWwuaXNWaXNpYmxlKCkgJiYgdHJhaWwucm9vdE5vZGUoKSA9PT0gcGhldC5qb2lzdC5kaXNwbGF5LnJvb3ROb2RlO1xyXG59O1xyXG5cclxuY2xhc3MgQ2hhcmdlc0FuZEZpZWxkc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDaGFyZ2VzQW5kRmllbGRzTW9kZWx9IG1vZGVsIC0gbWFpbiBtb2RlbCBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHByb3BlcnR5IHRoYXQgcmVnaXN0ZXJzIHRoZSBtb2RlbCBib3VuZHMgYmFzZWQgb24gdGhlIHNjcmVlbiBzaXplXHJcbiAgICAvLyB0aGUgYXZhaWxhYmxlTW9kZWxCb3VuZHMgc2hvdWxkIG5vdCBiZSByZXNldCB3aGVuIHRoZSByZXNldEFsbEJ1dHRvbiBpcyBwcmVzc2VkLFxyXG4gICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBtb2RlbC5lbmxhcmdlZEJvdW5kcywge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IEJvdW5kczIuQm91bmRzMklPLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnUmVnaXN0ZXJzIHRoZSBtb2RlbCBib3VuZHMgYmFzZWQgb24gdGhlIHNjcmVlbiBzaXplJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBvcmlnaW4gb2YgdGhlIG1vZGVsIGlzIHNldCB0byB0aGUgbWlkZGxlIG9mIHRoZSBkZXYgYm91bmRzLiBUaGVyZSBhcmUgOCBtZXRlcnMgYWNyb3NzIHRoZSB3aWR0aCBvZiB0aGUgZGV2IGJvdW5kcy5cclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgbmV3IFZlY3RvcjIoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC8gMiwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0IC8gMiApLFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAvIENoYXJnZXNBbmRGaWVsZHNDb25zdGFudHMuV0lEVEggKTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZXNcclxuICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtID0gbW9kZWxWaWV3VHJhbnNmb3JtO1xyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vIFRoZSBtb2JpbGUgV2ViR0wgaW1wbGVtZW50YXRpb24gd2lsbCB3b3JrIHdpdGggYmFzaWMgV2ViR0wgc3VwcG9ydFxyXG4gICAgY29uc3QgYWxsb3dNb2JpbGVXZWJHTCA9IFV0aWxzLmNoZWNrV2ViR0xTdXBwb3J0KCkgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy53ZWJnbDtcclxuXHJcbiAgICAvLyBUaGUgdW5saW1pdGVkLXBhcnRpY2xlIGltcGxlbWVudGF0aW9uIHdpbGwgd29yayBvbmx5IHdpdGggT0VTX3RleHR1cmVfZmxvYXQgd2hlcmUgd3JpdGluZyB0b1xyXG4gICAgLy8gZmxvYXQgdGV4dHVyZXMgaXMgc3VwcG9ydGVkLlxyXG4gICAgY29uc3QgYWxsb3dXZWJHTCA9IGFsbG93TW9iaWxlV2ViR0wgJiYgVXRpbHMuY2hlY2tXZWJHTFN1cHBvcnQoIFsgJ09FU190ZXh0dXJlX2Zsb2F0JyBdICkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICBFbGVjdHJpY1BvdGVudGlhbFdlYkdMTm9kZS5zdXBwb3J0c1JlbmRlcmluZ1RvRmxvYXRUZXh0dXJlKCk7XHJcblxyXG4gICAgbGV0IGVsZWN0cmljUG90ZW50aWFsR3JpZE5vZGUgPSBudWxsO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgZWxlY3RyaWMgUG90ZW50aWFsIGdyaWQgbm9kZSB0aGF0IGRpc3BsYXlzIGFuIGFycmF5IG9mIGNvbnRpZ3VvdXMgcmVjdGFuZ2xlcyBvZiBjaGFuZ2luZyBjb2xvcnNcclxuICAgIC8vIERvbid0IHRydXN0IFNhZmFyaSdzIE9FU190ZXh0dXJlX2Zsb2F0IHN1cHBvcnQgY3VycmVudGx5IVxyXG4gICAgaWYgKCBhbGxvd1dlYkdMICYmICFwbGF0Zm9ybS5zYWZhcmkgKSB7XHJcbiAgICAgIGVsZWN0cmljUG90ZW50aWFsR3JpZE5vZGUgPSBuZXcgRWxlY3RyaWNQb3RlbnRpYWxXZWJHTE5vZGUoXHJcbiAgICAgICAgbW9kZWwuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyxcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgbW9kZWwuaXNFbGVjdHJpY1BvdGVudGlhbFZpc2libGVQcm9wZXJ0eVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIGFsbG93TW9iaWxlV2ViR0wgKSB7XHJcbiAgICAgIGVsZWN0cmljUG90ZW50aWFsR3JpZE5vZGUgPSBuZXcgRWxlY3RyaWNQb3RlbnRpYWxNb2JpbGVXZWJHTE5vZGUoXHJcbiAgICAgICAgbW9kZWwuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyxcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgbW9kZWwuaXNFbGVjdHJpY1BvdGVudGlhbFZpc2libGVQcm9wZXJ0eVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGVsZWN0cmljUG90ZW50aWFsR3JpZE5vZGUgPSBuZXcgRWxlY3RyaWNQb3RlbnRpYWxDYW52YXNOb2RlKFxyXG4gICAgICAgIG1vZGVsLmFjdGl2ZUNoYXJnZWRQYXJ0aWNsZXMsXHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgIG1vZGVsLmVubGFyZ2VkQm91bmRzLFxyXG4gICAgICAgIG1vZGVsLmlzRWxlY3RyaWNQb3RlbnRpYWxWaXNpYmxlUHJvcGVydHlcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgYSBncmlkIG9mIGVsZWN0cmljIGZpZWxkIGFycm93IHNlbnNvcnNcclxuICAgIGNvbnN0IGVsZWN0cmljRmllbGRHcmlkTm9kZSA9IG5ldyBFbGVjdHJpY0ZpZWxkQ2FudmFzTm9kZShcclxuICAgICAgbW9kZWwuYWN0aXZlQ2hhcmdlZFBhcnRpY2xlcyxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBtb2RlbC5lbmxhcmdlZEJvdW5kcyxcclxuICAgICAgbW9kZWwuaXNFbGVjdHJpY0ZpZWxkRGlyZWN0aW9uT25seVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5pc0VsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHNjZW5lcnkgbm9kZSByZXNwb25zaWJsZSBmb3IgZHJhd2luZyB0aGUgZWxlY3RyaWNQb3RlbnRpYWwgbGluZXNcclxuICAgIGNvbnN0IGVsZWN0cmljUG90ZW50aWFsTGluZXNOb2RlID0gbmV3IEVsZWN0cmljUG90ZW50aWFsTGluZXNOb2RlKFxyXG4gICAgICBtb2RlbC5lbGVjdHJpY1BvdGVudGlhbExpbmVHcm91cCxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICBtb2RlbC5hcmVWYWx1ZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJpY1BvdGVudGlhbExpbmVzTm9kZScgKSApO1xyXG5cclxuICAgIC8vIGZ1bmN0aW9uKHtQcm9wZXJ0eS48VmVjdG9yMj59KSB0byBiZSBjYWxsZWQgYXQgdGhlIGVuZCBvZiBkcmFnIGV2ZW50XHJcbiAgICBjb25zdCBzbmFwVG9HcmlkTGluZXMgPSBtb2RlbC5zbmFwVG9HcmlkTGluZXMuYmluZCggbW9kZWwgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGRyYWdnYWJsZSBlbGVjdHJpYyBwb3RlbnRpYWwgc2Vuc29yIG5vZGUgd2l0aCBhIGVsZWN0cmljIHBvdGVudGlhbCByZWFkb3V0XHJcbiAgICBjb25zdCBlbGVjdHJpY1BvdGVudGlhbFNlbnNvck5vZGUgPSBuZXcgRWxlY3RyaWNQb3RlbnRpYWxTZW5zb3JOb2RlKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgc25hcFRvR3JpZExpbmVzLFxyXG4gICAgICB0aGlzLmdldEVsZWN0cmljUG90ZW50aWFsQ29sb3IuYmluZCggdGhpcyApLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cmljUG90ZW50aWFsU2Vuc29yTm9kZScgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSB2aXN1YWwgZ3JpZCB3aXRoIG1ham9yIGFuZCBtaW5vciBsaW5lcyBvbiB0aGUgdmlld1xyXG4gICAgY29uc3QgZ3JpZE5vZGUgPSBuZXcgR3JpZE5vZGUoXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgbmV3IFByb3BlcnR5KCBtb2RlbC5lbmxhcmdlZEJvdW5kcyApLFxyXG4gICAgICBtb2RlbC5pc0dyaWRWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmFyZVZhbHVlc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyaWROb2RlJyApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBlbGVjdHJpYyBjb250cm9sIHBhbmVsIG9uIHRoZSB1cHBlciByaWdodCBoYW5kIHNpZGVcclxuICAgIGNvbnN0IGNvbnRyb2xQYW5lbCA9IG5ldyBDaGFyZ2VzQW5kRmllbGRzQ29udHJvbFBhbmVsKCBtb2RlbCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbCcgKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgUmVzZXQgQWxsIEJ1dHRvbiBpbiB0aGUgYm90dG9tIHJpZ2h0LCB3aGljaCByZXNldHMgdGhlIG1vZGVsXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG5cclxuICAgICAgLy8gZG8gbm90IHJlc2V0IHRoZSBhdmFpbGFibGVEcmFnQm91bmRzUHJvcGVydHlcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IG1vZGVsLnJlc2V0KCksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbWVhc3VyaW5nIHRhcGUgKHNldCB0byBpbnZpc2libGUgaW5pdGlhbGx5KVxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgQ2hhcmdlc0FuZEZpZWxkc01lYXN1cmluZ1RhcGVOb2RlKCBtb2RlbC5tZWFzdXJpbmdUYXBlLFxyXG4gICAgICBzbmFwVG9HcmlkTGluZXMsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyaW5nVGFwZU5vZGUnICkgKTtcclxuXHJcbiAgICAvLyBUaGUgY29sb3Igb2YgbWVhc3VyZW1lbnQgdGV4dCBvZiB0aGUgbWVhc3VyaW5nIHRhcGUgdXBkYXRlcyBpdHNlbGYgd2hlbiB0aGUgcHJvamVjdG9yL2RlZmF1bHQgY29sb3Igc2NoZW1lIGNoYW5nZXNcclxuICAgIENoYXJnZXNBbmRGaWVsZHNDb2xvcnMubWVhc3VyaW5nVGFwZVRleHRQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBtZWFzdXJpbmdUYXBlTm9kZSwgJ3RleHRDb2xvcicgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHRvb2xib3hQYW5lbCB3aXRoIHRoZSBtZWFzdXJpbmcgdGFwZSBhbmQgdGhlIGVsZWN0cmljIHBvdGVudGlhbCBzZW5zb3IgaWNvbnNcclxuICAgIGNvbnN0IHRvb2xib3hQYW5lbCA9IG5ldyBDaGFyZ2VzQW5kRmllbGRzVG9vbGJveFBhbmVsKFxyXG4gICAgICBtb2RlbC5tZWFzdXJpbmdUYXBlLFxyXG4gICAgICBtb2RlbC5lbGVjdHJpY1BvdGVudGlhbFNlbnNvcixcclxuICAgICAgbWVhc3VyaW5nVGFwZU5vZGUsXHJcbiAgICAgIGVsZWN0cmljUG90ZW50aWFsU2Vuc29yTm9kZSxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICB0aGlzLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b29sYm94UGFuZWwnIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBsYXllciB3aGVyZSB0aGUgY2hhcmdlZCBQYXJ0aWNsZXMgYW5kIGVsZWN0cmljIEZpZWxkIFNlbnNvcnMgd2lsbCBiZSBwbGFjZWQuXHJcbiAgICAvLyBGb3JjZSB0aGUgbW92aW5nIGNoYXJnZWQgUGFydGljbGVzIGFuZCBlbGVjdHJpYyBGaWVsZCBTZW5zb3JzIGludG8gYSBzZXBhcmF0ZSBsYXllciBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucy5cclxuICAgIGNvbnN0IGRyYWdnYWJsZUVsZW1lbnRzTGF5ZXIgPSBuZXcgTm9kZSggeyBsYXllclNwbGl0OiB0cnVlLCBwcmV2ZW50Rml0OiB0cnVlIH0gKTtcclxuXHJcbiAgICAvLyB3ZWJHTCBkZXZpY2VzIHRoYXQgZG8gbm90IGhhdmUgZnVsbCBXZWJHTCBzdXBwb3J0IGNhbiBvbmx5IGhhdmUgYSBmaW5pdGUgbnVtYmVyIG9mIGNoYXJnZXMgb24gYm9hcmRcclxuICAgIGNvbnN0IGlzTnVtYmVyQ2hhcmdlc0xpbWl0ZWQgPSBhbGxvd01vYmlsZVdlYkdMICYmICEoIGFsbG93V2ViR0wgKTtcclxuXHJcbiAgICBjb25zdCBudW1iZXJDaGFyZ2VzTGltaXQgPSAoIGlzTnVtYmVyQ2hhcmdlc0xpbWl0ZWQgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbGVjdHJpY1BvdGVudGlhbE1vYmlsZVdlYkdMTm9kZS5nZXROdW1iZXJPZlBhcnRpY2xlc1N1cHBvcnRlZCgpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcclxuXHJcbiAgICBjb25zdCBjYW5BZGRNb3JlQ2hhcmdlZFBhcnRpY2xlc1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKTtcclxuICAgIGNvbnN0IHVwZGF0ZUNhbkFkZE1vcmVDaGFyZ2VkUGFydGljbGVzUHJvcGVydHkgPSAoKSA9PiB7XHJcbiAgICAgIGNhbkFkZE1vcmVDaGFyZ2VkUGFydGljbGVzUHJvcGVydHkudmFsdWUgPSBtb2RlbC5jaGFyZ2VkUGFydGljbGVHcm91cC5jb3VudCA8IG51bWJlckNoYXJnZXNMaW1pdDtcclxuICAgIH07XHJcbiAgICB1cGRhdGVDYW5BZGRNb3JlQ2hhcmdlZFBhcnRpY2xlc1Byb3BlcnR5KCk7XHJcbiAgICBtb2RlbC5jaGFyZ2VkUGFydGljbGVHcm91cC5lbGVtZW50Q3JlYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZUNhbkFkZE1vcmVDaGFyZ2VkUGFydGljbGVzUHJvcGVydHkgKTtcclxuICAgIG1vZGVsLmNoYXJnZWRQYXJ0aWNsZUdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHVwZGF0ZUNhbkFkZE1vcmVDaGFyZ2VkUGFydGljbGVzUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNoYXJnZSBhbmQgc2Vuc29yIGVuY2xvc3VyZSwgd2lsbCBiZSBkaXNwbGF5ZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuXHJcbiAgICBjb25zdCBjaGFyZ2VzQW5kU2Vuc29yc1BhbmVsID0gbmV3IENoYXJnZXNBbmRTZW5zb3JzUGFuZWwoXHJcbiAgICAgIG1vZGVsLCB0aGlzLFxyXG4gICAgICAoIG1vZGVsRWxlbWVudCwgZXZlbnQgKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIEhvcnJpYmxlIGhvcnJpYmxlIGhhY2tzXHJcbiAgICAgICAgZHJhZ2dhYmxlRWxlbWVudHNMYXllci5jaGlsZHJlbi5mb3JFYWNoKCBwb3RlbnRpYWxWaWV3ID0+IHtcclxuICAgICAgICAgIGlmICggcG90ZW50aWFsVmlldy5tb2RlbEVsZW1lbnQgPT09IG1vZGVsRWxlbWVudCApIHtcclxuICAgICAgICAgICAgcG90ZW50aWFsVmlldy5kcmFnTGlzdGVuZXIucHJlc3MoIGV2ZW50LCBwb3RlbnRpYWxWaWV3ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9LFxyXG4gICAgICBjYW5BZGRNb3JlQ2hhcmdlZFBhcnRpY2xlc1Byb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjaGFyZ2VzQW5kU2Vuc29yc1BhbmVsJyApICk7XHJcblxyXG4gICAgbW9kZWwuaXNDaGFyZ2VzQW5kU2Vuc29yc1BhbmVsRGlzcGxheWVkID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFpbCA9IGNoYXJnZXNBbmRTZW5zb3JzUGFuZWwuZ2V0VW5pcXVlVHJhaWwoKTtcclxuICAgICAgcmV0dXJuIHRyYWlsLmlzVmlzaWJsZSgpICYmIHRyYWlsLnJvb3ROb2RlKCkgPT09IHBoZXQuam9pc3QuZGlzcGxheS5yb290Tm9kZTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgdXBkYXRlU2Vuc29yUGFuZWxMYXlvdXQgPSAoKSA9PiB7XHJcbiAgICAgIGNoYXJnZXNBbmRTZW5zb3JzUGFuZWwuYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gMTU7XHJcbiAgICAgIGNoYXJnZXNBbmRTZW5zb3JzUGFuZWwuY2VudGVyWCA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclg7XHJcblxyXG4gICAgICBtb2RlbC5jaGFyZ2VzQW5kU2Vuc29yc0VuY2xvc3VyZUJvdW5kc1Byb3BlcnR5LnNldCggbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCBjaGFyZ2VzQW5kU2Vuc29yc1BhbmVsLmJvdW5kcyApICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNoYXJnZXNBbmRTZW5zb3JzUGFuZWwubG9jYWxCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlU2Vuc29yUGFuZWxMYXlvdXQgKTtcclxuICAgIHVwZGF0ZVNlbnNvclBhbmVsTGF5b3V0KCk7XHJcblxyXG4gICAgLy8gT25seSBzaG93IHRoZSBDaGFyZ2VzQW5kU2Vuc29yc1BhbmVsIHdoZW4gYXQgbGVhc3Qgb25lIG9mIGl0cyBlbGVtZW50cyBpcyB2aXNpYmxlXHJcbiAgICBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgIG1vZGVsLmFsbG93TmV3UG9zaXRpdmVDaGFyZ2VzUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmFsbG93TmV3TmVnYXRpdmVDaGFyZ2VzUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmFsbG93TmV3RWxlY3RyaWNGaWVsZFNlbnNvcnNQcm9wZXJ0eVxyXG4gICAgXSwgKCBwb3NpdGl2ZSwgbmVnYXRpdmUsIGVsZWN0cmljRmllbGRTZW5zb3JHcm91cCApID0+IHBvc2l0aXZlIHx8IG5lZ2F0aXZlIHx8IGVsZWN0cmljRmllbGRTZW5zb3JHcm91cCApXHJcbiAgICAgIC5saW5rQXR0cmlidXRlKCBjaGFyZ2VzQW5kU2Vuc29yc1BhbmVsLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgdGhlIGNvbWluZ3MgYW5kIGdvaW5ncyBvZiBjaGFyZ2VkIHBhcnRpY2xlcy5cclxuICAgIG1vZGVsLmNoYXJnZWRQYXJ0aWNsZUdyb3VwLmVsZW1lbnRDcmVhdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggYWRkZWRDaGFyZ2VkUGFydGljbGUgPT4ge1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIHZpZXcgcmVwcmVzZW50YXRpb24gZm9yIHRoaXMgY2hhcmdlZFBhcnRpY2xlLlxyXG4gICAgICBjb25zdCBjaGFyZ2VkUGFydGljbGVOb2RlID0gY2hhcmdlZFBhcnRpY2xlTm9kZUdyb3VwLmNyZWF0ZUNvcnJlc3BvbmRpbmdHcm91cEVsZW1lbnQoXHJcbiAgICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUudGFuZGVtLm5hbWUsIGFkZGVkQ2hhcmdlZFBhcnRpY2xlICk7XHJcblxyXG4gICAgICBkcmFnZ2FibGVFbGVtZW50c0xheWVyLmFkZENoaWxkKCBjaGFyZ2VkUGFydGljbGVOb2RlICk7XHJcblxyXG4gICAgICBhZGRlZENoYXJnZWRQYXJ0aWNsZS5kaXNwb3NlRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gY2FsbGJhY2soKSB7XHJcbiAgICAgICAgYWRkZWRDaGFyZ2VkUGFydGljbGUuZGlzcG9zZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGNhbGxiYWNrICk7XHJcbiAgICAgICAgZHJhZ2dhYmxlRWxlbWVudHNMYXllci5yZW1vdmVDaGlsZCggY2hhcmdlZFBhcnRpY2xlTm9kZSApO1xyXG4gICAgICAgIGNoYXJnZWRQYXJ0aWNsZU5vZGVHcm91cC5kaXNwb3NlRWxlbWVudCggY2hhcmdlZFBhcnRpY2xlTm9kZSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hhcmdlZFBhcnRpY2xlTm9kZUdyb3VwID0gbmV3IFBoZXRpb0dyb3VwKCAoIHRhbmRlbSwgY2hhcmdlZFBhcnRpY2xlICkgPT4ge1xyXG4gICAgICByZXR1cm4gbmV3IENoYXJnZWRQYXJ0aWNsZU5vZGUoXHJcbiAgICAgICAgY2hhcmdlZFBhcnRpY2xlLFxyXG4gICAgICAgIHNuYXBUb0dyaWRMaW5lcyxcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLmNoYXJnZXNBbmRTZW5zb3JzRW5jbG9zdXJlQm91bmRzUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgdGFuZGVtXHJcbiAgICAgICk7XHJcbiAgICB9LCAoKSA9PiBbIG1vZGVsLmNoYXJnZWRQYXJ0aWNsZUdyb3VwLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NoYXJnZWRQYXJ0aWNsZU5vZGVHcm91cCcgKSxcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuXHJcbiAgICAgIC8vIFRoZXNlIGVsZW1lbnRzIGFyZSBub3QgY3JlYXRlZCBieSB0aGUgUGhFVC1JTyBzdGF0ZSBlbmdpbmUsIHRoZXkgY2FuIGp1c3QgbGlzdGVuIHRvIHRoZSBtb2RlbCBmb3Igc3VwcG9ydGluZ1xyXG4gICAgICAvLyBzdGF0ZSBpbiB0aGUgc2FtZSB3YXkgdGhleSBkbyBmb3Igc2ltIGxvZ2ljLlxyXG4gICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZUdyb3VwID0gbmV3IFBoZXRpb0dyb3VwKCAoIHRhbmRlbSwgZWxlY3RyaWNGaWVsZFNlbnNvciApID0+IHtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciB0aGlzIGVsZWN0cmljIEZpZWxkIFNlbnNvclxyXG4gICAgICBjb25zdCBlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZSA9IG5ldyBFbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZShcclxuICAgICAgICBlbGVjdHJpY0ZpZWxkU2Vuc29yLFxyXG4gICAgICAgIHNuYXBUb0dyaWRMaW5lcyxcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLmlzUGxheUFyZWFDaGFyZ2VkUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuYXJlVmFsdWVzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIG1vZGVsLmNoYXJnZXNBbmRTZW5zb3JzRW5jbG9zdXJlQm91bmRzUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgdGFuZGVtXHJcbiAgICAgICk7XHJcblxyXG4gICAgICByZXR1cm4gZWxlY3RyaWNGaWVsZFNlbnNvck5vZGU7XHJcbiAgICB9LCAoKSA9PiBbIG1vZGVsLmVsZWN0cmljRmllbGRTZW5zb3JHcm91cC5hcmNoZXR5cGUgXSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZUdyb3VwJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBQaGV0aW9Hcm91cC5QaGV0aW9Hcm91cElPKCBOb2RlLk5vZGVJTyApLFxyXG5cclxuICAgICAgLy8gVGhlc2UgZWxlbWVudHMgYXJlIG5vdCBjcmVhdGVkIGJ5IHRoZSBQaEVULUlPIHN0YXRlIGVuZ2luZSwgdGhleSBjYW4ganVzdCBsaXN0ZW4gdG8gdGhlIG1vZGVsIGZvciBzdXBwb3J0aW5nXHJcbiAgICAgIC8vIHN0YXRlIGluIHRoZSBzYW1lIHdheSB0aGV5IGRvIGZvciBzaW0gbG9naWMuXHJcbiAgICAgIHN1cHBvcnRzRHluYW1pY1N0YXRlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgY29taW5ncyBhbmQgZ29pbmdzIG9mIGNoYXJnZWQgZWxlY3RyaWMgZmllbGQgc2Vuc29ycy5cclxuICAgIG1vZGVsLmVsZWN0cmljRmllbGRTZW5zb3JHcm91cC5lbGVtZW50Q3JlYXRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGFkZGVkRWxlY3RyaWNGaWVsZFNlbnNvciA9PiB7XHJcbiAgICAgIGNvbnN0IGVsZWN0cmljRmllbGRTZW5zb3JOb2RlID0gZWxlY3RyaWNGaWVsZFNlbnNvck5vZGVHcm91cC5jcmVhdGVDb3JyZXNwb25kaW5nR3JvdXBFbGVtZW50KFxyXG4gICAgICAgIGFkZGVkRWxlY3RyaWNGaWVsZFNlbnNvci50YW5kZW0ubmFtZSwgYWRkZWRFbGVjdHJpY0ZpZWxkU2Vuc29yICk7XHJcblxyXG4gICAgICBkcmFnZ2FibGVFbGVtZW50c0xheWVyLmFkZENoaWxkKCBlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZSApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSByZW1vdmFsIGxpc3RlbmVyIGZvciBpZiBhbmQgd2hlbiB0aGlzIGVsZWN0cmljIGZpZWxkIHNlbnNvciBpcyByZW1vdmVkIGZyb20gdGhlIG1vZGVsLlxyXG4gICAgICBtb2RlbC5lbGVjdHJpY0ZpZWxkU2Vuc29yR3JvdXAuZWxlbWVudERpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkRWxlY3RyaWNGaWVsZFNlbnNvciApIHtcclxuICAgICAgICBpZiAoIHJlbW92ZWRFbGVjdHJpY0ZpZWxkU2Vuc29yID09PSBhZGRlZEVsZWN0cmljRmllbGRTZW5zb3IgKSB7XHJcbiAgICAgICAgICBlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZUdyb3VwLmRpc3Bvc2VFbGVtZW50KCBlbGVjdHJpY0ZpZWxkU2Vuc29yTm9kZSApO1xyXG4gICAgICAgICAgbW9kZWwuZWxlY3RyaWNGaWVsZFNlbnNvckdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGxpc3RlbnMgdG8gdGhlIGlzVXNlckNvbnRyb2xsZWQgcHJvcGVydHkgb2YgdGhlIGVsZWN0cmljIHBvdGVudGlhbCBzZW5zb3JcclxuICAgIC8vIHJldHVybiB0aGUgZWxlY3RyaWMgUG90ZW50aWFsIHNlbnNvciB0byB0aGUgdG9vbGJveFBhbmVsIGlmIGl0IGlzIG5vdCB1c2VyIENvbnRyb2xsZWQgYW5kIHRoZVxyXG4gICAgLy8gcG9zaXRpb24gb2YgdGhlIHNlbnNvciBpcyBpbnNpZGUgdGhlIHRvb2xib3hQYW5lbCBwYW5lbFxyXG4gICAgZWxlY3RyaWNQb3RlbnRpYWxTZW5zb3JOb2RlLmlzVXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCBpc1VzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgaWYgKCAhaXNVc2VyQ29udHJvbGxlZCAmJiB0b29sYm94UGFuZWwuYm91bmRzLmludGVyc2VjdHNCb3VuZHMoIGVsZWN0cmljUG90ZW50aWFsU2Vuc29yTm9kZS5ib3VuZHMuZXJvZGVkKCA1ICkgKSAmJiBpc0Rpc3BsYXllZCggdG9vbGJveFBhbmVsICkgKSB7XHJcbiAgICAgICAgbW9kZWwuZWxlY3RyaWNQb3RlbnRpYWxTZW5zb3IuaXNBY3RpdmVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBsaXN0ZW5zIHRvIHRoZSBpc1VzZXJDb250cm9sbGVkIHByb3BlcnR5IG9mIHRoZSBtZWFzdXJpbmcgdGFwZVxyXG4gICAgLy8gcmV0dXJuIHRoZSBtZWFzdXJpbmcgdGFwZSB0byB0aGUgdG9vbGJveFBhbmVsIGlmIG5vdCB1c2VyIENvbnRyb2xsZWQgYW5kIGl0cyBwb3NpdGlvbiBpcyBsb2NhdGVkIHdpdGhpbiB0aGVcclxuICAgIC8vIHRvb2xib3ggcGFuZWxcclxuICAgIG1lYXN1cmluZ1RhcGVOb2RlLmlzQmFzZVVzZXJDb250cm9sbGVkUHJvcGVydHkubGluayggaXNCYXNlVXNlckNvbnRyb2xsZWQgPT4ge1xyXG4gICAgICBjb25zdCB0YXBlQmFzZUJvdW5kcyA9IG1lYXN1cmluZ1RhcGVOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoIG1lYXN1cmluZ1RhcGVOb2RlLmdldExvY2FsQmFzZUJvdW5kcygpICk7XHJcbiAgICAgIGlmICggIWlzQmFzZVVzZXJDb250cm9sbGVkICYmIHRvb2xib3hQYW5lbC5ib3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggdGFwZUJhc2VCb3VuZHMuZXJvZGVkKCA1ICkgKSAmJiBpc0Rpc3BsYXllZCggdG9vbGJveFBhbmVsICkgKSB7XHJcbiAgICAgICAgbW9kZWwubWVhc3VyaW5nVGFwZS5pc0FjdGl2ZVByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGR5bmFtaWMgcGFydHMgb2YgdGhlIGNvbnRyb2wgbGF5b3V0XHJcbiAgICBjb25zdCB1cGRhdGVDb250cm9sTGF5b3V0ID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gcmlnaHQtYWxpZ24gY29udHJvbCBwYW5lbHNcclxuICAgICAgY29uc3QgcmlnaHQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0aGlzLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkuZ2V0KCkucmlnaHQgKSAtIDEwO1xyXG4gICAgICBjb250cm9sUGFuZWwucmlnaHQgPSByaWdodDtcclxuICAgICAgcmVzZXRBbGxCdXR0b24ucmlnaHQgPSByaWdodDtcclxuICAgICAgdG9vbGJveFBhbmVsLnJpZ2h0ID0gcmlnaHQ7XHJcblxyXG4gICAgICAvLyB0b29sYm94IHBhbmVsIGJlbG93IHRoZSBjb250cm9sIHBhbmVsXHJcbiAgICAgIHRvb2xib3hQYW5lbC50b3AgPSBjb250cm9sUGFuZWwuYm90dG9tICsgMTA7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGxpbmsgdGhlIGF2YWlsYWJsZSBtb2RlbCBib3VuZHNcclxuICAgIHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eS5saW5rKCBib3VuZHMgPT4ge1xyXG5cclxuICAgICAgLy8gdGhlIG1lYXN1cmluZyBUYXBlIGlzIHN1YmplY3QgdG8gZHJhZ0JvdW5kcyAoc3BlY2lmaWVkIGluIG1vZGVsIGNvb3JkaW5hdGVzKVxyXG4gICAgICBtZWFzdXJpbmdUYXBlTm9kZS5zZXREcmFnQm91bmRzKCBib3VuZHMgKTtcclxuXHJcbiAgICAgIHVwZGF0ZUNvbnRyb2xMYXlvdXQoKTtcclxuICAgIH0gKTtcclxuICAgIHVwZGF0ZUNvbnRyb2xMYXlvdXQoKTtcclxuXHJcbiAgICBjb250cm9sUGFuZWwubG9jYWxCb3VuZHNQcm9wZXJ0eS5sYXp5TGluayggdXBkYXRlQ29udHJvbExheW91dCApO1xyXG5cclxuICAgIC8vIHN0YXRpYyBwYXJ0cyBvZiB0aGUgY29udHJvbCBsYXlvdXRcclxuICAgIGNvbnRyb2xQYW5lbC50b3AgPSAzMDtcclxuICAgIGdyaWROb2RlLmNlbnRlclggPSB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgZ3JpZE5vZGUudG9wID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggbW9kZWwuZW5sYXJnZWRCb3VuZHMubWF4WSApO1xyXG4gICAgcmVzZXRBbGxCdXR0b24uYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIDIwO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVsZWN0cmljUG90ZW50aWFsR3JpZE5vZGUgKTsgLy8gaXQgaXMgdGhlIGJvdHRvbSBvZiB0aGUgei1vcmRlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggZ3JpZE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVsZWN0cmljRmllbGRHcmlkTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZWxlY3RyaWNQb3RlbnRpYWxMaW5lc05vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRvb2xib3hQYW5lbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY29udHJvbFBhbmVsICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2hhcmdlc0FuZFNlbnNvcnNQYW5lbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZHJhZ2dhYmxlRWxlbWVudHNMYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZWxlY3RyaWNQb3RlbnRpYWxTZW5zb3JOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBtZWFzdXJpbmdUYXBlTm9kZSApO1xyXG5cclxuICAgIC8vIGlmIGluIGRlYnVnIG1vZGUsIGFkZCBhIGJ1dHRvbiB0aGF0IGFsbG93cyB0byBhZGQgKG1hbnkgYXQgYSB0aW1lKSBlbGVjdHJpYyBwb3RlbnRpYWwgbGluZXNcclxuICAgIC8vIGFuZCBzZXQgdXAgaW5pdGlhbCBjaGFyZ2VzIG9uIHRoZSBwbGF5IGFyZWFcclxuICAgIGlmICggSVNfREVCVUdfTU9ERSApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICAgIGxpc3RlbmVyOiAoKSA9PiBtb2RlbC5hZGRNYW55RWxlY3RyaWNQb3RlbnRpYWxMaW5lcyggMjAgKSxcclxuICAgICAgICBiYXNlQ29sb3I6ICdyZ2IoIDAsIDIyMiwgMTIwICknLFxyXG4gICAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQsXHJcbiAgICAgICAgY29udGVudDogbmV3IFRleHQoICdhZGQgc29tZSBwb3RlbnRpYWwgbGluZXMnICksXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVidWdCdXR0b24nIClcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICBjb25zdCBjaGFyZ2UxID0gbW9kZWwuY2hhcmdlZFBhcnRpY2xlR3JvdXAuY3JlYXRlTmV4dEVsZW1lbnQoIDEsIG5ldyBWZWN0b3IyKCAwLCAtMS41ICkgKTtcclxuICAgICAgY29uc3QgY2hhcmdlMiA9IG1vZGVsLmNoYXJnZWRQYXJ0aWNsZUdyb3VwLmNyZWF0ZU5leHRFbGVtZW50KCAtMSwgbmV3IFZlY3RvcjIoIDAsIC0xLjUgKSApO1xyXG4gICAgICBjaGFyZ2UxLmlzQWN0aXZlUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgIGNoYXJnZTIuaXNBY3RpdmVQcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgY2hhcmdlMS5wb3NpdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIDIsIDIgKSApO1xyXG4gICAgICBjaGFyZ2UyLnBvc2l0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggMCwgMSApICk7XHJcblxyXG4gICAgICBtb2RlbC5pc1BsYXlBcmVhQ2hhcmdlZFByb3BlcnR5LnNldCggdHJ1ZSApOyAvLyBzZXQgaXNQbGF5QXJlYUNoYXJnZWQgdG8gdHJ1ZSBzaW5jZSB0aGVyZSBhcmUgY2hhcmdlc1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIGNvbG9yIHN0cmluZyBmb3IgYSBnaXZlbiB2YWx1ZSBvZiB0aGUgZWxlY3RyaWNQb3RlbnRpYWwuXHJcbiAgICogVGhlIGludGVycG9sYXRpb24gc2NoZW1lIGlzIHNvbWV3aGF0IHVudXN1YWwgaW4gdGhlIHNlbnNlIHRoYXQgaXQgaXMgcGVyZm9ybWVkIHZpYSBhIHBpZWNld2lzZSBmdW5jdGlvblxyXG4gICAqIHdoaWNoIHJlbGllcyBvbiB0aHJlZSBjb2xvcnMgYW5kIHRocmVlIGVsZWN0cmljIHBvdGVudGlhbCBhbmNob3JzLiBJdCBpcyBlc3NlbnRpYWxseSB0d28gbGluZWFyIGludGVycG9sYXRpb25cclxuICAgKiBmdW5jdGlvbnMgcHV0IGVuZCB0byBlbmQgc28gdGhhdCB0aGUgZW50aXJlIGRvbWFpbiBpcyBjb3ZlcmVkLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGVsZWN0cmljUG90ZW50aWFsXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSAtIHVzZWZ1bCB0byBzZXQgdHJhbnNwYXJlbmN5XHJcbiAgICogQHJldHVybnMge3N0cmluZ30gY29sb3IgLSAgZS5nLiAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKSdcclxuICAgKi9cclxuICBnZXRFbGVjdHJpY1BvdGVudGlhbENvbG9yKCBlbGVjdHJpY1BvdGVudGlhbCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBsZXQgZmluYWxDb2xvcjsgLy8ge3N0cmluZ30gZS5nLiAncmdiYSgwLDAsMCwxKSdcclxuICAgIGxldCBkaXN0YW5jZTsgLy8ge251bWJlcn0gIGJldHdlZW4gMCBhbmQgMVxyXG5cclxuICAgIC8vIGZvciBwb3NpdGl2ZSBlbGVjdHJpYyBwb3RlbnRpYWxcclxuICAgIGlmICggZWxlY3RyaWNQb3RlbnRpYWwgPiAwICkge1xyXG5cclxuICAgICAgLy8gY2xhbXBlZCBsaW5lYXIgaW50ZXJwb2xhdGlvbiBmdW5jdGlvbiwgb3V0cHV0IGxpZXMgYmV0d2VlbiAwIGFuZCAxO1xyXG4gICAgICBkaXN0YW5jZSA9IEVMRUNUUklDX1BPVEVOVElBTF9QT1NJVElWRV9MSU5FQVJfRlVOQ1RJT04uZXZhbHVhdGUoIGVsZWN0cmljUG90ZW50aWFsICk7XHJcbiAgICAgIGZpbmFsQ29sb3IgPSB0aGlzLmludGVycG9sYXRlUkdCQShcclxuICAgICAgICAvLyB7Q29sb3J9IGNvbG9yIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIEVsZWN0cmljIFBvdGVudGlhbCBiZWluZyB6ZXJvXHJcbiAgICAgICAgQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5lbGVjdHJpY1BvdGVudGlhbEdyaWRaZXJvUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgLy8ge0NvbG9yfSBjb2xvciBvZiBNYXggRWxlY3RyaWMgUG90ZW50aWFsXHJcbiAgICAgICAgQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5lbGVjdHJpY1BvdGVudGlhbEdyaWRTYXR1cmF0aW9uUG9zaXRpdmVQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICBkaXN0YW5jZSwgLy8ge251bWJlcn0gZGlzdGFuY2UgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFcclxuICAgICAgICBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgICAvLyBmb3IgbmVnYXRpdmUgKG9yIHplcm8pIGVsZWN0cmljIHBvdGVudGlhbFxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBjbGFtcGVkIGxpbmVhciBpbnRlcnBvbGF0aW9uIGZ1bmN0aW9uLCBvdXRwdXQgbGllcyBiZXR3ZWVuIDAgYW5kIDFcclxuICAgICAgZGlzdGFuY2UgPSBFTEVDVFJJQ19QT1RFTlRJQUxfTkVHQVRJVkVfTElORUFSX0ZVTkNUSU9OLmV2YWx1YXRlKCBlbGVjdHJpY1BvdGVudGlhbCApO1xyXG4gICAgICBmaW5hbENvbG9yID0gdGhpcy5pbnRlcnBvbGF0ZVJHQkEoXHJcbiAgICAgICAgLy8ge0NvbG9yfSBjb2xvciB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBsb3dlc3QgKGkuZS4gbmVnYXRpdmUpIEVsZWN0cmljIFBvdGVudGlhbFxyXG4gICAgICAgIENoYXJnZXNBbmRGaWVsZHNDb2xvcnMuZWxlY3RyaWNQb3RlbnRpYWxHcmlkU2F0dXJhdGlvbk5lZ2F0aXZlUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgLy8ge0NvbG9yfSBjb2xvciB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSBFbGVjdHJpYyBQb3RlbnRpYWwgYmVpbmcgemVybyB6ZXJvXHJcbiAgICAgICAgQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5lbGVjdHJpY1BvdGVudGlhbEdyaWRaZXJvUHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgZGlzdGFuY2UsIC8vIHtudW1iZXJ9IGRpc3RhbmNlIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxXHJcbiAgICAgICAgb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpbmFsQ29sb3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGdW5jdGlvbiB0aGF0IHJldHVybnMgYSBjb2xvciB0aGF0IGlzIHByb3BvcnRpb25hbCB0byB0aGUgbWFnbml0dWRlIG9mIHRoZSBlbGVjdHJpYyBGaWVsZC5cclxuICAgKiBUaGUgY29sb3IgaW50ZXJwb2xhdGVzIGJldHdlZW4gQ2hhcmdlc0FuZEZpZWxkc0NvbG9ycy5lbGVjdHJpY0ZpZWxkR3JpZFplcm8gKGZvciBhblxyXG4gICAqIGVsZWN0cmljIGZpZWxkIHZhbHVlIG9mIHplcm8pIGFuZCBDaGFyZ2VzQW5kRmllbGRzQ29sb3JzLmVsZWN0cmljRmllbGRHcmlkU2F0dXJhdGlvbiAod2hpY2ggY29ycmVzcG9uZHMgdG8gYW5cclxuICAgKiBlbGVjdHJpYyBmaWVsZCB2YWx1ZSBvZiBFRklFTERfQ09MT1JfU0FUX01BR05JVFVERSkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZWxlY3RyaWNGaWVsZE1hZ25pdHVkZSAtIGEgbm9uIG5lZ2F0aXZlIG51bWJlclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gLSB1c2VmdWwgdG8gc2V0IHRyYW5zcGFyZW5jeVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbG9yIC0gZS5nLiAncmdiYSgyNTUsIDI1NSwgMjU1LCAxKSdcclxuICAgKlxyXG4gICAqL1xyXG4gIGdldEVsZWN0cmljRmllbGRNYWduaXR1ZGVDb2xvciggZWxlY3RyaWNGaWVsZE1hZ25pdHVkZSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBFTEVDVFJJQ19GSUVMRF9MSU5FQVJfRlVOQ1RJT04gaXMgYSBjbGFtcGVkIGxpbmVhciBmdW5jdGlvblxyXG4gICAgY29uc3QgZGlzdGFuY2UgPSBFTEVDVFJJQ19GSUVMRF9MSU5FQVJfRlVOQ1RJT04uZXZhbHVhdGUoIGVsZWN0cmljRmllbGRNYWduaXR1ZGUgKTsgLy8gYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDFcclxuXHJcbiAgICByZXR1cm4gdGhpcy5pbnRlcnBvbGF0ZVJHQkEoXHJcbiAgICAgIENoYXJnZXNBbmRGaWVsZHNDb2xvcnMuZWxlY3RyaWNGaWVsZEdyaWRaZXJvUHJvcGVydHkuZ2V0KCksIC8vIHtDb2xvcn0gY29sb3IgdGhhdCBjb3JyZXNwb25kcyB0byB6ZXJvIGVsZWN0cmljIEZpZWxkXHJcbiAgICAgIENoYXJnZXNBbmRGaWVsZHNDb2xvcnMuZWxlY3RyaWNGaWVsZEdyaWRTYXR1cmF0aW9uUHJvcGVydHkuZ2V0KCksIC8vIHtDb2xvcn0gY29sb3IgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgbGFyZ2VzdCBlbGVjdHJpYyBmaWVsZFxyXG4gICAgICBkaXN0YW5jZSwgLy8ge251bWJlcn0gZGlzdGFuY2UgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDFcclxuICAgICAgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gdGhhdCBpbnRlcnBvbGF0ZXMgYmV0d2VlbiB0d28gY29sb3IuIFRoZSB0cmFuc3BhcmVuY3kgY2FuIGJlIHNldCB2aXMgYSBkZWZhdWx0IG9wdGlvbnNcclxuICAgKiBUaGUgZnVuY3Rpb24gcmV0dXJucyBhIHN0cmluZyBpbiBvcmRlciB0byBtaW5pbWl6ZSB0aGUgbnVtYmVyIG9mIGFsbG9jYXRpb25zXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge0NvbG9yfSBjb2xvcjFcclxuICAgKiBAcGFyYW0ge0NvbG9yfSBjb2xvcjJcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGlzdGFuY2UgLSBhIHZhbHVlIGZyb20gMCB0byAxXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbG9yIC0gZS5nLiAncmdiYSgwLDAsMCwxKSdcclxuICAgKi9cclxuICBpbnRlcnBvbGF0ZVJHQkEoIGNvbG9yMSwgY29sb3IyLCBkaXN0YW5jZSwgb3B0aW9ucyApIHtcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICAvLyBkZWZhdWx0c1xyXG4gICAgICB0cmFuc3BhcmVuY3k6IDFcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBpZiAoIGRpc3RhbmNlIDwgMCB8fCBkaXN0YW5jZSA+IDEgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYGRpc3RhbmNlIG11c3QgYmUgYmV0d2VlbiAwIGFuZCAxOiAke2Rpc3RhbmNlfWAgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHIgPSBNYXRoLmZsb29yKCBsaW5lYXIoIDAsIDEsIGNvbG9yMS5yLCBjb2xvcjIuciwgZGlzdGFuY2UgKSApO1xyXG4gICAgY29uc3QgZyA9IE1hdGguZmxvb3IoIGxpbmVhciggMCwgMSwgY29sb3IxLmcsIGNvbG9yMi5nLCBkaXN0YW5jZSApICk7XHJcbiAgICBjb25zdCBiID0gTWF0aC5mbG9vciggbGluZWFyKCAwLCAxLCBjb2xvcjEuYiwgY29sb3IyLmIsIGRpc3RhbmNlICkgKTtcclxuICAgIHJldHVybiBgcmdiYSgke3J9LCR7Z30sJHtifSwke29wdGlvbnMudHJhbnNwYXJlbmN5fSlgO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRnVuY3Rpb24gcmVzcG9uc2libGUgZm9yIHRoZSBsYXlvdXQgb2YgdGhlIFNjcmVlblZpZXcuXHJcbiAgICogSXQgb3ZlcnJpZGVzIHRoZSBsYXlvdXQgc3RyYXRlZ3kgaW4gU2NyZWVuVmlldy5qc1xyXG4gICAqIEl0IHNjYWxlcyB0aGUgc2NlbmUgZ3JhcGggdXAgYW5kIGRvd24gd2l0aFxyXG4gICAqIHRoZSBzaXplIG9mIHRoZSBzY3JlZW4gdG8gZW5zdXJlIGEgbWluaW1hbGx5IHZpc2libGUgYXJlYSxcclxuICAgKiBidXQga2VlcGluZyBpdCBjZW50ZXJlZCBhdCB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gdmlld0JvdW5kc1xyXG4gICAqL1xyXG4gIGxheW91dCggdmlld0JvdW5kcyApIHtcclxuXHJcbiAgICB0aGlzLnJlc2V0VHJhbnNmb3JtKCk7XHJcblxyXG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLmdldExheW91dFNjYWxlKCB2aWV3Qm91bmRzICk7IC8vIHtudW1iZXJ9XHJcbiAgICB0aGlzLnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xyXG5cclxuICAgIGNvbnN0IHdpZHRoID0gdmlld0JvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHZpZXdCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIGxldCBvZmZzZXRYID0gMDtcclxuICAgIGxldCBvZmZzZXRZID0gMDtcclxuXHJcbiAgICAvLyBNb3ZlIHRvIGJvdHRvbSB2ZXJ0aWNhbGx5XHJcbiAgICBpZiAoIHNjYWxlID09PSB3aWR0aCAvIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICkge1xyXG4gICAgICBvZmZzZXRZID0gKCBoZWlnaHQgLyBzY2FsZSAtIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNlbnRlciBob3Jpem9udGFsbHlcclxuICAgIGVsc2UgaWYgKCBzY2FsZSA9PT0gaGVpZ2h0IC8gdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICkge1xyXG4gICAgICBvZmZzZXRYID0gKCB3aWR0aCAvIHNjYWxlIC0gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKSAvIDI7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYW5zbGF0ZSggb2Zmc2V0WCArIHZpZXdCb3VuZHMubGVmdCAvIHNjYWxlLCBvZmZzZXRZICsgdmlld0JvdW5kcy50b3AgLyBzY2FsZSApO1xyXG5cclxuICAgIGNvbnN0IG5vbWluYWxWaWV3Qm91bmRzID0gbmV3IFJlY3RhbmdsZSggLW9mZnNldFgsIC1vZmZzZXRZLCB3aWR0aCAvIHNjYWxlLCBoZWlnaHQgLyBzY2FsZSApO1xyXG5cclxuICAgIC8vIHRoZSBtb2RlbEJvdW5kcyBhcmUgdGhlIG5vbWluYWwgdmlld0JvdW5kcyAoaW4gbW9kZWwgY29vcmRpbmF0ZXMpIG9yIHRoZSBtb2RlbC5lbmxhcmdlZEJvdW5kcywgd2hpY2hldmVyIGlzIHNtYWxsZXIuXHJcbiAgICB0aGlzLmF2YWlsYWJsZU1vZGVsQm91bmRzUHJvcGVydHkuc2V0KCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggbm9taW5hbFZpZXdCb3VuZHMgKS5pbnRlcnNlY3Rpb24oIHRoaXMubW9kZWwuZW5sYXJnZWRCb3VuZHMgKSApO1xyXG4gIH1cclxufVxyXG5cclxuY2hhcmdlc0FuZEZpZWxkcy5yZWdpc3RlciggJ0NoYXJnZXNBbmRGaWVsZHNTY3JlZW5WaWV3JywgQ2hhcmdlc0FuZEZpZWxkc1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ2hhcmdlc0FuZEZpZWxkc1NjcmVlblZpZXc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGNBQWMsTUFBTSxzQ0FBc0M7QUFDakUsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUN2RCxPQUFPQyxRQUFRLE1BQU0sNkJBQTZCLENBQUMsQ0FBQztBQUNwRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLG1CQUFtQixNQUFNLHVEQUF1RDtBQUN2RixPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxLQUFLLFFBQVEsbUNBQW1DO0FBQ3JFLE9BQU9DLHFCQUFxQixNQUFNLHFEQUFxRDtBQUN2RixPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQyw0QkFBNEIsTUFBTSxtQ0FBbUM7QUFD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