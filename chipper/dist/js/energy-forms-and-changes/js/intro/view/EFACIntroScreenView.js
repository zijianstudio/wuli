// Copyright 2014-2022, University of Colorado Boulder

/**
 * main view for the 'Intro' screen of the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import flame_png from '../../../../scenery-phet/images/flame_png.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import HeaterCoolerBack from '../../../../scenery-phet/js/HeaterCoolerBack.js';
import HeaterCoolerFront from '../../../../scenery-phet/js/HeaterCoolerFront.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { DownUpListener, HBox, Image, KeyboardUtils, Node, Rectangle, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import gasPipeIntro_png from '../../../images/gasPipeIntro_png.js';
import shelf_png from '../../../images/shelf_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import BeakerType from '../../common/model/BeakerType.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import BurnerStandNode from '../../common/view/BurnerStandNode.js';
import EFACTemperatureAndColorSensorNode from '../../common/view/EFACTemperatureAndColorSensorNode.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import SkyNode from '../../common/view/SkyNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import efacPositionConstrainer from '../model/efacPositionConstrainer.js';
import AirNode from './AirNode.js';
import BeakerContainerView from './BeakerContainerView.js';
import BlockNode from './BlockNode.js';
const energySymbolsString = EnergyFormsAndChangesStrings.energySymbols;
const linkHeatersString = EnergyFormsAndChangesStrings.linkHeaters;
const oliveOilString = EnergyFormsAndChangesStrings.oliveOil;
const waterString = EnergyFormsAndChangesStrings.water;

// constants
const EDGE_INSET = 10; // screen edge padding, in screen coordinates
const THERMOMETER_JUMP_ON_EXTRACTION = new Vector2(5, 5); // in screen coordinates
const THERMOMETER_ANIMATION_SPEED = 0.2; // in meters per second
const MAX_THERMOMETER_ANIMATION_TIME = 1; // max time for thermometer return animation to complete, in seconds

class EFACIntroScreenView extends ScreenView {
  /**
   * @param {EFACIntroModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // @private {EFACIntroModel}
    this.model = model;

    // Create the model-view transform. The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model appears in the
    // view.
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(Utils.roundSymmetric(this.layoutBounds.width * 0.5), Utils.roundSymmetric(this.layoutBounds.height * 0.85)), EFACConstants.INTRO_MVT_SCALE_FACTOR);

    // create nodes that will act as layers in order to create the needed Z-order behavior
    const backLayer = new Node();
    this.addChild(backLayer);
    const beakerBackLayer = new Node();
    this.addChild(beakerBackLayer);
    const beakerGrabLayer = new Node();
    this.addChild(beakerGrabLayer);
    const blockLayer = new Node();
    this.addChild(blockLayer);
    const airLayer = new Node();
    this.addChild(airLayer);
    const leftBurnerEnergyChunkLayer = new EnergyChunkLayer(model.leftBurner.energyChunkList, modelViewTransform);
    this.addChild(leftBurnerEnergyChunkLayer);
    const rightBurnerEnergyChunkLayer = new EnergyChunkLayer(model.rightBurner.energyChunkList, modelViewTransform);
    this.addChild(rightBurnerEnergyChunkLayer);
    const heaterCoolerFrontLayer = new Node();
    this.addChild(heaterCoolerFrontLayer);
    const beakerFrontLayer = new Node();
    this.addChild(beakerFrontLayer);

    // create the lab bench surface image
    const labBenchSurfaceImage = new Image(shelf_png, {
      centerX: modelViewTransform.modelToViewX(0),
      centerY: modelViewTransform.modelToViewY(0) + 10 // slight tweak required due to nature of the image
    });

    // create a rectangle that will act as the background below the lab bench surface, basically like the side of the
    // bench
    const benchWidth = labBenchSurfaceImage.width * 0.95;
    const benchHeight = 1000; // arbitrary large number, user should never see the bottom of this
    const labBenchSide = new Rectangle(labBenchSurfaceImage.centerX - benchWidth / 2, labBenchSurfaceImage.centerY, benchWidth, benchHeight, {
      fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR
    });

    // add the bench side and top to the scene - the lab bench side must be behind the bench top
    backLayer.addChild(labBenchSide);
    backLayer.addChild(labBenchSurfaceImage);

    // Determine the vertical center between the lower edge of the top of the bench and the bottom of the canvas, used
    // for layout.
    const centerYBelowSurface = (this.layoutBounds.height + labBenchSurfaceImage.bottom) / 2;

    // add the play/pause and step buttons
    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      timeSpeedProperty: EFACQueryParameters.showSpeedControls ? model.timeSpeedProperty : null,
      timeSpeeds: [TimeSpeed.NORMAL, TimeSpeed.FAST],
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => model.manualStep()
        }
      },
      tandem: tandem.createTandem('timeControlNode')
    });

    // center time controls below the lab bench
    timeControlNode.center = new Vector2(this.layoutBounds.centerX, centerYBelowSurface);
    backLayer.addChild(timeControlNode);

    // add the burners
    const burnerProjectionAmount = modelViewTransform.modelToViewDeltaX(model.leftBurner.getBounds().height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO);

    // create left burner node
    const leftBurnerStand = new BurnerStandNode(modelViewTransform.modelToViewShape(model.leftBurner.getBounds()), burnerProjectionAmount);

    /**
     * Creates a gas pipe image used as part of the HeaterCoolerNodes for this screen and links its NodeIO Properties
     * so the gas pipe follows any changes that occur to the provided Node. It also uses the provided node to correctly
     * position itself.
     *
     * @param (Node} node
     * @returns {Node}
     */
    const createAndLinkPipeImageNode = node => {
      const gasPipeNode = new Image(gasPipeIntro_png, {
        right: node.left + 15,
        bottom: node.bottom - 6,
        scale: 0.4
      });
      node.opacityProperty.lazyLink(() => {
        gasPipeNode.opacity = node.opacity;
      });
      node.pickableProperty.lazyLink(() => {
        gasPipeNode.pickable = node.pickable;
      });
      node.visibleProperty.lazyLink(() => {
        gasPipeNode.visible = node.visible;
      });
      return gasPipeNode;
    };

    // for testing - option to keep the heater coolers sticky
    const snapToZero = !EFACQueryParameters.stickyBurners;

    // set up left heater-cooler node, front and back are added separately to support layering of energy chunks
    const leftHeaterCoolerBack = new HeaterCoolerBack(model.leftBurner.heatCoolLevelProperty, {
      centerX: modelViewTransform.modelToViewX(model.leftBurner.getBounds().centerX),
      bottom: modelViewTransform.modelToViewY(model.leftBurner.getBounds().minY),
      minWidth: leftBurnerStand.width / 1.5,
      maxWidth: leftBurnerStand.width / 1.5
    });
    const leftHeaterCoolerFront = new HeaterCoolerFront(model.leftBurner.heatCoolLevelProperty, {
      leftTop: leftHeaterCoolerBack.getHeaterFrontPosition(),
      minWidth: leftBurnerStand.width / 1.5,
      maxWidth: leftBurnerStand.width / 1.5,
      thumbSize: new Dimension2(36, 18),
      snapToZero: snapToZero,
      heaterCoolerBack: leftHeaterCoolerBack,
      tandem: tandem.createTandem('leftHeaterCoolerNode'),
      phetioDocumentation: 'the heater/cooler on the left'
    });
    const leftGasPipe = createAndLinkPipeImageNode(leftHeaterCoolerFront);
    heaterCoolerFrontLayer.addChild(leftHeaterCoolerFront);
    backLayer.addChild(leftHeaterCoolerBack);
    backLayer.addChild(leftBurnerStand);
    backLayer.addChild(leftGasPipe);
    let rightBurnerBounds = null;

    // only add the right burner and handle linking heaters if the right one exists in the model
    if (model.twoBurners) {
      // create right burner node
      const rightBurnerStand = new BurnerStandNode(modelViewTransform.modelToViewShape(model.rightBurner.getBounds()), burnerProjectionAmount);

      // set up right heater-cooler node
      const rightHeaterCoolerBack = new HeaterCoolerBack(model.rightBurner.heatCoolLevelProperty, {
        centerX: modelViewTransform.modelToViewX(model.rightBurner.getBounds().centerX),
        bottom: modelViewTransform.modelToViewY(model.rightBurner.getBounds().minY),
        minWidth: rightBurnerStand.width / 1.5,
        maxWidth: rightBurnerStand.width / 1.5
      });
      const rightHeaterCoolerFront = new HeaterCoolerFront(model.rightBurner.heatCoolLevelProperty, {
        leftTop: rightHeaterCoolerBack.getHeaterFrontPosition(),
        minWidth: rightBurnerStand.width / 1.5,
        maxWidth: rightBurnerStand.width / 1.5,
        thumbSize: new Dimension2(36, 18),
        snapToZero: snapToZero,
        heaterCoolerBack: rightHeaterCoolerBack,
        tandem: tandem.createTandem('rightHeaterCoolerNode'),
        phetioDocumentation: 'the heater/cooler on the right, which may not exist in the simulation'
      });
      const rightGasPipe = createAndLinkPipeImageNode(rightHeaterCoolerFront);
      heaterCoolerFrontLayer.addChild(rightHeaterCoolerFront);
      backLayer.addChild(rightHeaterCoolerBack);
      backLayer.addChild(rightBurnerStand);
      backLayer.addChild(rightGasPipe);

      // make the heat cool levels equal if they become linked
      model.linkedHeatersProperty.link(linked => {
        if (linked) {
          model.leftBurner.heatCoolLevelProperty.value = model.rightBurner.heatCoolLevelProperty.value;
        }
      });

      // if the heaters are linked, changing the left heater will change the right to match
      model.leftBurner.heatCoolLevelProperty.link(leftHeatCoolAmount => {
        if (model.linkedHeatersProperty.value) {
          model.rightBurner.heatCoolLevelProperty.value = leftHeatCoolAmount;
        }
      });

      // if the heaters are linked, changing the right heater will change the left to match
      model.rightBurner.heatCoolLevelProperty.link(rightHeatCoolAmount => {
        if (model.linkedHeatersProperty.value) {
          model.leftBurner.heatCoolLevelProperty.value = rightHeatCoolAmount;
        }
      });
      const leftHeaterCoolerDownInputAction = () => {
        // make the right heater-cooler un-pickable if the heaters are linked
        if (model.linkedHeatersProperty.value) {
          rightHeaterCoolerFront.interruptSubtreeInput();
          rightHeaterCoolerFront.pickable = false;
        }
      };
      const leftHeaterCoolerUpInputAction = () => {
        rightHeaterCoolerFront.pickable = true;
      };

      // listen to pointer events on the left heater-cooler
      leftHeaterCoolerFront.addInputListener(new DownUpListener({
        down: leftHeaterCoolerDownInputAction,
        up: leftHeaterCoolerUpInputAction
      }));

      // listen to keyboard events on the left heater-cooler
      leftHeaterCoolerFront.addInputListener({
        keydown: event => {
          if (KeyboardUtils.isRangeKey(event.domEvent)) {
            leftHeaterCoolerDownInputAction();
          }
        },
        keyup: event => {
          if (KeyboardUtils.isRangeKey(event.domEvent)) {
            leftHeaterCoolerUpInputAction();
          }
        }
      });
      const rightHeaterCoolerDownInputAction = () => {
        // make the left heater-cooler un-pickable if the heaters are linked
        if (model.linkedHeatersProperty.value) {
          leftHeaterCoolerFront.interruptSubtreeInput();
          leftHeaterCoolerFront.pickable = false;
        }
      };
      const rightHeaterCoolerUpInputAction = () => {
        leftHeaterCoolerFront.pickable = true;
      };

      // listen to pointer events on the right heater-cooler
      rightHeaterCoolerFront.addInputListener(new DownUpListener({
        down: rightHeaterCoolerDownInputAction,
        up: rightHeaterCoolerUpInputAction
      }));

      // listen to keyboard events on the right heater-cooler
      rightHeaterCoolerFront.addInputListener({
        keydown: event => {
          if (KeyboardUtils.isRangeKey(event.domEvent)) {
            rightHeaterCoolerDownInputAction();
          }
        },
        keyup: event => {
          if (KeyboardUtils.isRangeKey(event.domEvent)) {
            rightHeaterCoolerUpInputAction();
          }
        }
      });
      rightBurnerBounds = model.rightBurner.getBounds();
    }

    // Pre-calculate the space occupied by the burners, since they don't move.  This is used when validating
    // positions of movable model elements.  The space is extended a bit to the left to avoid awkward z-ordering
    // issues when preventing overlap.
    const leftBurnerBounds = model.leftBurner.getBounds();
    const burnerPerspectiveExtension = leftBurnerBounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos(EFACConstants.BURNER_PERSPECTIVE_ANGLE) / 2;
    // @private {Bounds2}
    this.burnerBlockingRect = new Bounds2(leftBurnerBounds.minX - burnerPerspectiveExtension, leftBurnerBounds.minY, rightBurnerBounds ? rightBurnerBounds.maxX : leftBurnerBounds.maxX, rightBurnerBounds ? rightBurnerBounds.maxY : leftBurnerBounds.maxY);

    // add the air
    airLayer.addChild(new AirNode(model.air, modelViewTransform));

    // create a reusable bounds in order to reduce memory allocations
    const reusableConstraintBounds = Bounds2.NOTHING.copy();

    /**
     * limits the model element motion based on both view and model constraints
     * @param {ModelElement} modelElement
     * @param {Vector2} proposedPosition
     * @returns {Vector2}
     */
    const constrainMovableElementMotion = (modelElement, proposedPosition) => {
      // constrain the model element to stay within the play area
      const viewConstrainedPosition = constrainToPlayArea(modelElement, proposedPosition, this.layoutBounds, modelViewTransform, reusableConstraintBounds);

      // constrain the model element to move legally within the model, which generally means not moving through things
      const viewAndModelConstrainedPosition = efacPositionConstrainer.constrainPosition(modelElement, viewConstrainedPosition, model.beakerGroup, model.blockGroup, this.burnerBlockingRect);

      // return the position as constrained by both the model and the view
      return viewAndModelConstrainedPosition;
    };
    const blockNodeGroup = new PhetioGroup((tandem, block) => {
      return new BlockNode(block, modelViewTransform, constrainMovableElementMotion, model.isPlayingProperty, {
        setApproachingEnergyChunkParentNode: airLayer,
        tandem: tandem,
        phetioDynamicElement: true
      });
    }, () => [model.blockGroup.archetype], {
      tandem: tandem.createTandem('blockNodeGroup'),
      phetioInputEnabledPropertyInstrumented: true,
      phetioType: PhetioGroup.PhetioGroupIO(Node.NodeIO),
      supportsDynamicState: false
    });
    const blockListener = addedBlock => {
      const blockNode = blockNodeGroup.createCorrespondingGroupElement(addedBlock.tandem.name, addedBlock);
      blockLayer.addChild(blockNode);

      // Add the removal listener for if and when this electric field sensor is removed from the model.
      model.blockGroup.elementDisposedEmitter.addListener(function removalListener(removedBlock) {
        if (removedBlock === addedBlock) {
          // blockNode.dispose();
          model.blockGroup.elementDisposedEmitter.removeListener(removalListener);
        }
      });
    };
    model.blockGroup.forEach(blockListener);
    model.blockGroup.elementCreatedEmitter.addListener(blockListener);

    // @private {PhetioGroup.<BeakerContainerView>}
    this.beakerProxyNodeGroup = new PhetioGroup((tandem, beaker) => {
      const label = beaker.beakerType === BeakerType.WATER ? waterString : oliveOilString;
      return new BeakerContainerView(beaker, model, modelViewTransform, constrainMovableElementMotion, {
        label: label,
        tandem: tandem,
        phetioDynamicElement: true,
        phetioInputEnabledPropertyInstrumented: true
      });
    }, () => [model.beakerGroup.archetype], {
      tandem: tandem.createTandem('beakerProxyNodeGroup'),
      phetioType: PhetioGroup.PhetioGroupIO(ReferenceIO(IOType.ObjectIO)),
      phetioInputEnabledPropertyInstrumented: true,
      supportsDynamicState: false
    });
    const beakerListener = addedBeaker => {
      const beakerProxyNode = this.beakerProxyNodeGroup.createCorrespondingGroupElement(addedBeaker.tandem.name, addedBeaker);
      beakerFrontLayer.addChild(beakerProxyNode.frontNode);
      beakerBackLayer.addChild(beakerProxyNode.backNode);
      beakerGrabLayer.addChild(beakerProxyNode.grabNode);

      // Add the removal listener for if and when this electric field sensor is removed from the model.
      model.beakerGroup.elementDisposedEmitter.addListener(function removalListener(removedBeaker) {
        if (removedBeaker === addedBeaker) {
          // beakerNode.dispose();
          model.beakerGroup.elementDisposedEmitter.removeListener(removalListener);
        }
      });
    };
    model.beakerGroup.forEach(beakerListener);
    model.beakerGroup.elementCreatedEmitter.addListener(beakerListener);

    // the thermometer layer needs to be above the movable objects
    const thermometerLayer = new Node();
    this.addChild(thermometerLayer);

    // create and add the temperature and color thermometer nodes, which look like a thermometer with a triangle on the side
    const thermometerNodes = [];
    const nodeString = 'Node';
    let thermometerNodeWidth = 0;
    let thermometerNodeHeight = 0;
    model.thermometers.forEach(thermometer => {
      const thermometerNode = new EFACTemperatureAndColorSensorNode(thermometer, {
        modelViewTransform: modelViewTransform,
        dragBounds: modelViewTransform.viewToModelBounds(this.layoutBounds),
        draggable: true,
        tandem: tandem.createTandem(thermometer.tandem.name + nodeString)
      });

      // thermometers need to be behind blocks and beakers while in storage, but in front when them while in use
      thermometer.activeProperty.link(active => {
        if (active) {
          if (backLayer.hasChild(thermometerNode)) {
            backLayer.removeChild(thermometerNode);
          }
          thermometerLayer.addChild(thermometerNode);
        } else {
          if (thermometerLayer.hasChild(thermometerNode)) {
            thermometerLayer.removeChild(thermometerNode);
          }
          backLayer.addChild(thermometerNode);
        }
      });
      thermometerNodes.push(thermometerNode);

      // update the variables that will be used to create the storage area
      thermometerNodeHeight = thermometerNodeHeight || thermometerNode.height;
      thermometerNodeWidth = thermometerNodeWidth || thermometerNode.width;
    });

    // create the storage area for the thermometers
    const thermometerStorageAreaNode = new Rectangle(0, 0, thermometerNodeWidth * 2, thermometerNodeHeight * 1.15, EFACConstants.CONTROL_PANEL_CORNER_RADIUS, EFACConstants.CONTROL_PANEL_CORNER_RADIUS, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      left: EDGE_INSET,
      top: EDGE_INSET,
      tandem: tandem.createTandem('thermometerStorageAreaNode'),
      phetioDocumentation: 'panel where the thermometers are stored'
    });
    backLayer.addChild(thermometerStorageAreaNode);
    thermometerStorageAreaNode.moveToBack(); // move behind the thermometerNodes when they are being stored

    // set initial position for thermometers in the storage area, hook up listeners to handle interaction with storage area
    const interThermometerSpacing = (thermometerStorageAreaNode.width - thermometerNodeWidth) / 2;
    const offsetFromBottomOfStorageArea = 25; // empirically determined
    const thermometerNodePositionX = thermometerStorageAreaNode.left + interThermometerSpacing;
    const thermometerPositionInStorageArea = new Vector2(modelViewTransform.viewToModelX(thermometerNodePositionX), modelViewTransform.viewToModelY(thermometerStorageAreaNode.bottom - offsetFromBottomOfStorageArea));
    model.thermometers.forEach((thermometer, index) => {
      // add a listener for when the thermometer is removed from or returned to the storage area
      thermometer.userControlledProperty.link(userControlled => {
        if (userControlled) {
          // the user has picked up this thermometer
          if (!thermometer.activeProperty.get()) {
            // The thermometer was inactive, which means that it was in the storage area.  In this case, we make it jump
            // a little to cue the user that this is a movable object.
            thermometer.positionProperty.set(thermometer.positionProperty.get().plus(modelViewTransform.viewToModelDelta(THERMOMETER_JUMP_ON_EXTRACTION)));

            // activate the thermometer
            thermometer.activeProperty.set(true);
          }
        } else {
          // the user has released this thermometer - test if it should go back in the storage area
          const thermometerNode = thermometerNodes[index];
          const colorIndicatorBounds = thermometerNode.localToParentBounds(thermometerNode.temperatureAndColorSensorNode.colorIndicatorBounds);
          const thermometerBounds = thermometerNode.localToParentBounds(thermometerNode.temperatureAndColorSensorNode.thermometerBounds);
          if (colorIndicatorBounds.intersectsBounds(thermometerStorageAreaNode.bounds) || thermometerBounds.intersectsBounds(thermometerStorageAreaNode.bounds)) {
            returnThermometerToStorageArea(thermometer, true, thermometerNode);
          }
        }
      });
    });

    /**
     * return a thermometer to its initial position in the storage area
     * @param {StickyTemperatureAndColorSensor} thermometer
     * @param {Boolean} doAnimation - whether the thermometer animates back to the storage area
     * @param {EFACTemperatureAndColorSensorNode} [thermometerNode]
     */
    const returnThermometerToStorageArea = (thermometer, doAnimation, thermometerNode) => {
      const currentPosition = thermometer.positionProperty.get();
      if (!currentPosition.equals(thermometerPositionInStorageArea) && doAnimation) {
        // calculate the time needed to get to the destination
        const animationDuration = Math.min(thermometer.positionProperty.get().distance(thermometerPositionInStorageArea) / THERMOMETER_ANIMATION_SPEED, MAX_THERMOMETER_ANIMATION_TIME);
        const animationOptions = {
          property: thermometer.positionProperty,
          to: thermometerPositionInStorageArea,
          duration: animationDuration,
          easing: Easing.CUBIC_IN_OUT
        };
        const translateAnimation = new Animation(animationOptions);

        // make the thermometer unpickable while it's animating back to the storage area
        translateAnimation.animatingProperty.link(isAnimating => {
          thermometerNode && (thermometerNode.pickable = !isAnimating);
        });
        translateAnimation.start();
      } else if (!currentPosition.equals(thermometerPositionInStorageArea) && !doAnimation) {
        // set the initial position for this thermometer
        thermometer.positionProperty.set(thermometerPositionInStorageArea);
      }

      // thermometers are inactive when in the storage area
      thermometer.activeProperty.set(false);
    };

    // returns all thermometers to the storage area
    const returnAllThermometersToStorageArea = () => {
      model.thermometers.forEach(thermometer => {
        returnThermometerToStorageArea(thermometer, false);
      });
    };

    // put all of the temperature and color thermometers into the storage area as part of initialization process
    returnAllThermometersToStorageArea();

    // updates the Z-order of the blocks when their position changes
    const blockChangeListener = position => {
      const blocks = [...model.blockGroup.getArray()];
      blocks.sort((a, b) => {
        // a block that's completely to the right of another block should always be in front
        if (a.bounds.minX >= b.bounds.maxX) {
          return 1;
        } else if (a.bounds.maxX <= b.bounds.minX) {
          return -1;
        }

        // a block that's above another should always be in front if they overlap in the x direction
        if (a.bounds.minY > b.bounds.minY) {
          return 1;
        } else if (b.bounds.minY > a.bounds.minY) {
          return -1;
        } else {
          return 0;
        }
      });
      for (let i = 0; i < blocks.length; i++) {
        blocks[i].zIndex = i; // mark so the model is aware of its z-index (the sensors need to know this).
        blockNodeGroup.forEach(blockNode => {
          if (blockNode.block === blocks[i]) {
            // @samreid and @chrisklus looked for any performance bottlenecks caused by re-layering every frame but
            // could not find anything so we suspect Scenery know not to if the order is already correct
            blockNode.moveToFront();
          }
        });
      }
    };

    // no need to link z-order-changing listener if there is only one block
    if (model.blockGroup.count > 1) {
      model.blockGroup.forEach(block => {
        block.positionProperty.link(blockChangeListener);
      });
    }

    // no need to link z-order-changing listener if there is only one beaker
    if (model.beakerGroup.count > 1) {
      // this particular listener could be generalized to support more than 2 beakers (see the block listener above),
      // but since other code in this sim limits the number of beakers to 2, i (@chrisklus) think it's better to
      // leave this listener as simple as it is, since a general version could only worsen performance.
      assert && assert(model.beakerGroup.count <= 2, `Only 2 beakers are allowed: ${model.beakerGroup.count}`);
      const beakerOneIndex = 0;
      const beakerTwoIndex = 1;

      // updates the Z-order of the beakers whenever their position changes
      const beakerChangeListener = () => {
        if (model.beakerGroup.getElement(beakerOneIndex).getBounds().centerY > model.beakerGroup.getElement(beakerTwoIndex).getBounds().centerY) {
          this.beakerProxyNodeGroup.getElement(beakerOneIndex).moveToFront();
        } else {
          this.beakerProxyNodeGroup.getElement(beakerTwoIndex).moveToFront();
        }
      };
      model.beakerGroup.forEach(beaker => {
        beaker.positionProperty.link(beakerChangeListener);
      });
    }

    // use this Tandem for the checkboxes, too, so they appear as a child of the control panel
    const controlPanelTandem = tandem.createTandem('controlPanel');

    // Create the control for showing/hiding energy chunks.  The elements of this control are created separately to
    // allow each to be independently scaled. The EnergyChunk that is created here is not going to be used in the
    // simulation, it is only needed for the EnergyChunkNode that is displayed in the show/hide energy chunks toggle.
    const energyChunkNode = new EnergyChunkNode(new EnergyChunk(EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, new BooleanProperty(true), {
      tandem: Tandem.OPT_OUT
    }), modelViewTransform);
    energyChunkNode.pickable = false;
    const energySymbolsText = new Text(energySymbolsString, {
      font: new PhetFont(20),
      maxWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH
    });
    const showEnergyCheckbox = new Checkbox(model.energyChunksVisibleProperty, new HBox({
      children: [energySymbolsText, energyChunkNode],
      spacing: 5
    }), {
      tandem: controlPanelTandem.createTandem('showEnergySymbolsCheckbox'),
      phetioDocumentation: 'checkbox that shows the energy symbols'
    });
    showEnergyCheckbox.touchArea = showEnergyCheckbox.localBounds.dilatedY(EFACConstants.ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION);

    // variables needed if the right burner exists
    let controlPanelCheckboxes = null;
    const flameNode = new Image(flame_png, {
      maxWidth: EFACConstants.ENERGY_CHUNK_WIDTH,
      maxHeight: EFACConstants.ENERGY_CHUNK_WIDTH
    });
    const linkHeatersText = new Text(linkHeatersString, {
      font: new PhetFont(20),
      maxWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH
    });
    const linkHeatersCheckbox = new Checkbox(model.linkedHeatersProperty, new HBox({
      children: [linkHeatersText, flameNode],
      spacing: 5
    }), {
      tandem: controlPanelTandem.createTandem('linkHeatersCheckbox'),
      phetioDocumentation: 'checkbox that links the heaters together. only appears in the simulation when two burners exist'
    });
    linkHeatersCheckbox.touchArea = linkHeatersCheckbox.localBounds.dilatedY(EFACConstants.ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION);

    // Create the control for linking/un-linking the heaters, if the right burner exists
    if (model.twoBurners) {
      controlPanelCheckboxes = new VBox({
        children: [showEnergyCheckbox, linkHeatersCheckbox],
        spacing: 10,
        align: 'left'
      });
    }

    // Add the checkbox controls
    const controlPanel = new Panel(controlPanelCheckboxes || showEnergyCheckbox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS,
      rightTop: new Vector2(this.layoutBounds.width - EDGE_INSET, EDGE_INSET),
      minWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_MIN_WIDTH,
      tandem: controlPanelTandem,
      phetioDocumentation: 'panel in the upper right corner of the screen'
    });
    backLayer.addChild(controlPanel);

    // create and add the "Reset All" button in the bottom right
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        returnAllThermometersToStorageArea();
        this.beakerProxyNodeGroup.forEach(beakerProxyNode => {
          beakerProxyNode.reset();
        });
      },
      radius: EFACConstants.RESET_ALL_BUTTON_RADIUS,
      right: this.layoutBounds.maxX - EDGE_INSET,
      centerY: (labBenchSurfaceImage.bounds.maxY + this.layoutBounds.maxY) / 2,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // add a floating sky high above the sim
    const skyNode = new SkyNode(this.layoutBounds, modelViewTransform.modelToViewY(EFACConstants.INTRO_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT) + EFACConstants.ENERGY_CHUNK_WIDTH);
    this.addChild(skyNode);

    // listen to the manualStepEmitter in the model
    model.manualStepEmitter.addListener(dt => {
      this.manualStep(dt);
    });

    /**
     * constrains the provided model element's position to the play area
     * @param {ModelElement} modelElement
     * @param {Vector2} proposedPosition
     * @param {Bounds2} playAreaBounds
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Bounds2} reusuableBounds
     * @returns {Vector2}
     */
    const constrainToPlayArea = (modelElement, proposedPosition, playAreaBounds, modelViewTransform, reusuableBounds) => {
      const viewConstrainedPosition = proposedPosition.copy();
      const elementViewBounds = modelViewTransform.modelToViewBounds(modelElement.getCompositeBoundsForPosition(proposedPosition, reusuableBounds));

      // constrain the model element to stay within the play area
      let deltaX = 0;
      let deltaY = 0;
      if (elementViewBounds.maxX >= playAreaBounds.maxX) {
        deltaX = modelViewTransform.viewToModelDeltaX(playAreaBounds.maxX - elementViewBounds.maxX);
      } else if (elementViewBounds.minX <= playAreaBounds.minX) {
        deltaX = modelViewTransform.viewToModelDeltaX(playAreaBounds.minX - elementViewBounds.minX);
      }
      if (elementViewBounds.minY <= playAreaBounds.minY) {
        deltaY = modelViewTransform.viewToModelDeltaY(playAreaBounds.minY - elementViewBounds.minY);
      } else if (proposedPosition.y < 0) {
        deltaY = -proposedPosition.y;
      }
      viewConstrainedPosition.setXY(viewConstrainedPosition.x + deltaX, viewConstrainedPosition.y + deltaY);

      // return the position as constrained by both the model and the view
      return viewConstrainedPosition;
    };
  }

  /**
   * step this view element, called by the framework
   * @param dt - time step, in seconds
   * @public
   */
  step(dt) {
    if (this.model.isPlayingProperty.get()) {
      this.stepView(dt);
    }
  }

  /**
   * step forward by one fixed nominal frame time
   * @param dt - time step, in seconds
   * @public
   */
  manualStep(dt) {
    this.stepView(dt);
  }

  /**
   * update the state of the non-model associated view elements for a given time amount
   * @param dt - time step, in seconds
   * @public
   */
  stepView(dt) {
    this.beakerProxyNodeGroup.forEach(beakerProxyNode => {
      beakerProxyNode.step(dt);
    });
  }

  /**
   * Custom layout function for this view so that it floats to the bottom of the window.
   *
   * @param {Bounds2} viewBounds
   * @override
   * @public
   */
  layout(viewBounds) {
    this.resetTransform();
    const scale = this.getLayoutScale(viewBounds);
    const width = viewBounds.width;
    const height = viewBounds.height;
    this.setScaleMagnitude(scale);
    let dx = 0;
    let offsetY = 0;

    // Move to bottom vertically (custom for this sim)
    if (scale === width / this.layoutBounds.width) {
      offsetY = height / scale - this.layoutBounds.height;
    }

    // center horizontally (default behavior for ScreenView)
    else if (scale === height / this.layoutBounds.height) {
      dx = (width - this.layoutBounds.width * scale) / 2 / scale;
    }
    this.translate(dx + viewBounds.left / scale, offsetY + viewBounds.top / scale);

    // update the visible bounds of the screen view
    this.visibleBoundsProperty.set(new Bounds2(-dx, -offsetY, width / scale - dx, height / scale - offsetY));
  }
}
energyFormsAndChanges.register('EFACIntroScreenView', EFACIntroScreenView);
export default EFACIntroScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlV0aWxzIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJNb2RlbFZpZXdUcmFuc2Zvcm0yIiwiZmxhbWVfcG5nIiwiUmVzZXRBbGxCdXR0b24iLCJIZWF0ZXJDb29sZXJCYWNrIiwiSGVhdGVyQ29vbGVyRnJvbnQiLCJQaGV0Rm9udCIsIlRpbWVDb250cm9sTm9kZSIsIlRpbWVTcGVlZCIsIkRvd25VcExpc3RlbmVyIiwiSEJveCIsIkltYWdlIiwiS2V5Ym9hcmRVdGlscyIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiUGFuZWwiLCJQaGV0aW9Hcm91cCIsIlRhbmRlbSIsIklPVHlwZSIsIlJlZmVyZW5jZUlPIiwiQW5pbWF0aW9uIiwiRWFzaW5nIiwiZ2FzUGlwZUludHJvX3BuZyIsInNoZWxmX3BuZyIsIkVGQUNDb25zdGFudHMiLCJFRkFDUXVlcnlQYXJhbWV0ZXJzIiwiQmVha2VyVHlwZSIsIkVuZXJneUNodW5rIiwiRW5lcmd5VHlwZSIsIkJ1cm5lclN0YW5kTm9kZSIsIkVGQUNUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZSIsIkVuZXJneUNodW5rTGF5ZXIiLCJFbmVyZ3lDaHVua05vZGUiLCJTa3lOb2RlIiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncyIsImVmYWNQb3NpdGlvbkNvbnN0cmFpbmVyIiwiQWlyTm9kZSIsIkJlYWtlckNvbnRhaW5lclZpZXciLCJCbG9ja05vZGUiLCJlbmVyZ3lTeW1ib2xzU3RyaW5nIiwiZW5lcmd5U3ltYm9scyIsImxpbmtIZWF0ZXJzU3RyaW5nIiwibGlua0hlYXRlcnMiLCJvbGl2ZU9pbFN0cmluZyIsIm9saXZlT2lsIiwid2F0ZXJTdHJpbmciLCJ3YXRlciIsIkVER0VfSU5TRVQiLCJUSEVSTU9NRVRFUl9KVU1QX09OX0VYVFJBQ1RJT04iLCJUSEVSTU9NRVRFUl9BTklNQVRJT05fU1BFRUQiLCJNQVhfVEhFUk1PTUVURVJfQU5JTUFUSU9OX1RJTUUiLCJFRkFDSW50cm9TY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nIiwiWkVSTyIsInJvdW5kU3ltbWV0cmljIiwibGF5b3V0Qm91bmRzIiwid2lkdGgiLCJoZWlnaHQiLCJJTlRST19NVlRfU0NBTEVfRkFDVE9SIiwiYmFja0xheWVyIiwiYWRkQ2hpbGQiLCJiZWFrZXJCYWNrTGF5ZXIiLCJiZWFrZXJHcmFiTGF5ZXIiLCJibG9ja0xheWVyIiwiYWlyTGF5ZXIiLCJsZWZ0QnVybmVyRW5lcmd5Q2h1bmtMYXllciIsImxlZnRCdXJuZXIiLCJlbmVyZ3lDaHVua0xpc3QiLCJyaWdodEJ1cm5lckVuZXJneUNodW5rTGF5ZXIiLCJyaWdodEJ1cm5lciIsImhlYXRlckNvb2xlckZyb250TGF5ZXIiLCJiZWFrZXJGcm9udExheWVyIiwibGFiQmVuY2hTdXJmYWNlSW1hZ2UiLCJjZW50ZXJYIiwibW9kZWxUb1ZpZXdYIiwiY2VudGVyWSIsIm1vZGVsVG9WaWV3WSIsImJlbmNoV2lkdGgiLCJiZW5jaEhlaWdodCIsImxhYkJlbmNoU2lkZSIsImZpbGwiLCJDTE9DS19DT05UUk9MX0JBQ0tHUk9VTkRfQ09MT1IiLCJjZW50ZXJZQmVsb3dTdXJmYWNlIiwiYm90dG9tIiwidGltZUNvbnRyb2xOb2RlIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsInNob3dTcGVlZENvbnRyb2xzIiwidGltZVNwZWVkcyIsIk5PUk1BTCIsIkZBU1QiLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsInN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9ucyIsImxpc3RlbmVyIiwibWFudWFsU3RlcCIsImNyZWF0ZVRhbmRlbSIsImNlbnRlciIsImJ1cm5lclByb2plY3Rpb25BbW91bnQiLCJtb2RlbFRvVmlld0RlbHRhWCIsImdldEJvdW5kcyIsIkJVUk5FUl9FREdFX1RPX0hFSUdIVF9SQVRJTyIsImxlZnRCdXJuZXJTdGFuZCIsIm1vZGVsVG9WaWV3U2hhcGUiLCJjcmVhdGVBbmRMaW5rUGlwZUltYWdlTm9kZSIsIm5vZGUiLCJnYXNQaXBlTm9kZSIsInJpZ2h0IiwibGVmdCIsInNjYWxlIiwib3BhY2l0eVByb3BlcnR5IiwibGF6eUxpbmsiLCJvcGFjaXR5IiwicGlja2FibGVQcm9wZXJ0eSIsInBpY2thYmxlIiwidmlzaWJsZVByb3BlcnR5IiwidmlzaWJsZSIsInNuYXBUb1plcm8iLCJzdGlja3lCdXJuZXJzIiwibGVmdEhlYXRlckNvb2xlckJhY2siLCJoZWF0Q29vbExldmVsUHJvcGVydHkiLCJtaW5ZIiwibWluV2lkdGgiLCJtYXhXaWR0aCIsImxlZnRIZWF0ZXJDb29sZXJGcm9udCIsImxlZnRUb3AiLCJnZXRIZWF0ZXJGcm9udFBvc2l0aW9uIiwidGh1bWJTaXplIiwiaGVhdGVyQ29vbGVyQmFjayIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJsZWZ0R2FzUGlwZSIsInJpZ2h0QnVybmVyQm91bmRzIiwidHdvQnVybmVycyIsInJpZ2h0QnVybmVyU3RhbmQiLCJyaWdodEhlYXRlckNvb2xlckJhY2siLCJyaWdodEhlYXRlckNvb2xlckZyb250IiwicmlnaHRHYXNQaXBlIiwibGlua2VkSGVhdGVyc1Byb3BlcnR5IiwibGluayIsImxpbmtlZCIsInZhbHVlIiwibGVmdEhlYXRDb29sQW1vdW50IiwicmlnaHRIZWF0Q29vbEFtb3VudCIsImxlZnRIZWF0ZXJDb29sZXJEb3duSW5wdXRBY3Rpb24iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJsZWZ0SGVhdGVyQ29vbGVyVXBJbnB1dEFjdGlvbiIsImFkZElucHV0TGlzdGVuZXIiLCJkb3duIiwidXAiLCJrZXlkb3duIiwiZXZlbnQiLCJpc1JhbmdlS2V5IiwiZG9tRXZlbnQiLCJrZXl1cCIsInJpZ2h0SGVhdGVyQ29vbGVyRG93bklucHV0QWN0aW9uIiwicmlnaHRIZWF0ZXJDb29sZXJVcElucHV0QWN0aW9uIiwibGVmdEJ1cm5lckJvdW5kcyIsImJ1cm5lclBlcnNwZWN0aXZlRXh0ZW5zaW9uIiwiTWF0aCIsImNvcyIsIkJVUk5FUl9QRVJTUEVDVElWRV9BTkdMRSIsImJ1cm5lckJsb2NraW5nUmVjdCIsIm1pblgiLCJtYXhYIiwibWF4WSIsImFpciIsInJldXNhYmxlQ29uc3RyYWludEJvdW5kcyIsIk5PVEhJTkciLCJjb3B5IiwiY29uc3RyYWluTW92YWJsZUVsZW1lbnRNb3Rpb24iLCJtb2RlbEVsZW1lbnQiLCJwcm9wb3NlZFBvc2l0aW9uIiwidmlld0NvbnN0cmFpbmVkUG9zaXRpb24iLCJjb25zdHJhaW5Ub1BsYXlBcmVhIiwidmlld0FuZE1vZGVsQ29uc3RyYWluZWRQb3NpdGlvbiIsImNvbnN0cmFpblBvc2l0aW9uIiwiYmVha2VyR3JvdXAiLCJibG9ja0dyb3VwIiwiYmxvY2tOb2RlR3JvdXAiLCJibG9jayIsInNldEFwcHJvYWNoaW5nRW5lcmd5Q2h1bmtQYXJlbnROb2RlIiwicGhldGlvRHluYW1pY0VsZW1lbnQiLCJhcmNoZXR5cGUiLCJwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsInBoZXRpb1R5cGUiLCJQaGV0aW9Hcm91cElPIiwiTm9kZUlPIiwic3VwcG9ydHNEeW5hbWljU3RhdGUiLCJibG9ja0xpc3RlbmVyIiwiYWRkZWRCbG9jayIsImJsb2NrTm9kZSIsImNyZWF0ZUNvcnJlc3BvbmRpbmdHcm91cEVsZW1lbnQiLCJuYW1lIiwiZWxlbWVudERpc3Bvc2VkRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVtb3ZhbExpc3RlbmVyIiwicmVtb3ZlZEJsb2NrIiwicmVtb3ZlTGlzdGVuZXIiLCJmb3JFYWNoIiwiZWxlbWVudENyZWF0ZWRFbWl0dGVyIiwiYmVha2VyUHJveHlOb2RlR3JvdXAiLCJiZWFrZXIiLCJsYWJlbCIsImJlYWtlclR5cGUiLCJXQVRFUiIsIk9iamVjdElPIiwiYmVha2VyTGlzdGVuZXIiLCJhZGRlZEJlYWtlciIsImJlYWtlclByb3h5Tm9kZSIsImZyb250Tm9kZSIsImJhY2tOb2RlIiwiZ3JhYk5vZGUiLCJyZW1vdmVkQmVha2VyIiwidGhlcm1vbWV0ZXJMYXllciIsInRoZXJtb21ldGVyTm9kZXMiLCJub2RlU3RyaW5nIiwidGhlcm1vbWV0ZXJOb2RlV2lkdGgiLCJ0aGVybW9tZXRlck5vZGVIZWlnaHQiLCJ0aGVybW9tZXRlcnMiLCJ0aGVybW9tZXRlciIsInRoZXJtb21ldGVyTm9kZSIsImRyYWdCb3VuZHMiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImRyYWdnYWJsZSIsImFjdGl2ZVByb3BlcnR5IiwiYWN0aXZlIiwiaGFzQ2hpbGQiLCJyZW1vdmVDaGlsZCIsInB1c2giLCJ0aGVybW9tZXRlclN0b3JhZ2VBcmVhTm9kZSIsIkNPTlRST0xfUEFORUxfQ09STkVSX1JBRElVUyIsIkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUiIsInN0cm9rZSIsIkNPTlRST0xfUEFORUxfT1VUTElORV9TVFJPS0UiLCJsaW5lV2lkdGgiLCJDT05UUk9MX1BBTkVMX09VVExJTkVfTElORV9XSURUSCIsInRvcCIsIm1vdmVUb0JhY2siLCJpbnRlclRoZXJtb21ldGVyU3BhY2luZyIsIm9mZnNldEZyb21Cb3R0b21PZlN0b3JhZ2VBcmVhIiwidGhlcm1vbWV0ZXJOb2RlUG9zaXRpb25YIiwidGhlcm1vbWV0ZXJQb3NpdGlvbkluU3RvcmFnZUFyZWEiLCJ2aWV3VG9Nb2RlbFgiLCJ2aWV3VG9Nb2RlbFkiLCJpbmRleCIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZCIsImdldCIsInBvc2l0aW9uUHJvcGVydHkiLCJzZXQiLCJwbHVzIiwidmlld1RvTW9kZWxEZWx0YSIsImNvbG9ySW5kaWNhdG9yQm91bmRzIiwibG9jYWxUb1BhcmVudEJvdW5kcyIsInRlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlIiwidGhlcm1vbWV0ZXJCb3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwiYm91bmRzIiwicmV0dXJuVGhlcm1vbWV0ZXJUb1N0b3JhZ2VBcmVhIiwiZG9BbmltYXRpb24iLCJjdXJyZW50UG9zaXRpb24iLCJlcXVhbHMiLCJhbmltYXRpb25EdXJhdGlvbiIsIm1pbiIsImRpc3RhbmNlIiwiYW5pbWF0aW9uT3B0aW9ucyIsInByb3BlcnR5IiwidG8iLCJkdXJhdGlvbiIsImVhc2luZyIsIkNVQklDX0lOX09VVCIsInRyYW5zbGF0ZUFuaW1hdGlvbiIsImFuaW1hdGluZ1Byb3BlcnR5IiwiaXNBbmltYXRpbmciLCJzdGFydCIsInJldHVybkFsbFRoZXJtb21ldGVyc1RvU3RvcmFnZUFyZWEiLCJibG9ja0NoYW5nZUxpc3RlbmVyIiwicG9zaXRpb24iLCJibG9ja3MiLCJnZXRBcnJheSIsInNvcnQiLCJhIiwiYiIsImkiLCJsZW5ndGgiLCJ6SW5kZXgiLCJtb3ZlVG9Gcm9udCIsImNvdW50IiwiYXNzZXJ0IiwiYmVha2VyT25lSW5kZXgiLCJiZWFrZXJUd29JbmRleCIsImJlYWtlckNoYW5nZUxpc3RlbmVyIiwiZ2V0RWxlbWVudCIsImNvbnRyb2xQYW5lbFRhbmRlbSIsImVuZXJneUNodW5rTm9kZSIsIlRIRVJNQUwiLCJPUFRfT1VUIiwiZW5lcmd5U3ltYm9sc1RleHQiLCJmb250IiwiRU5FUkdZX1NZTUJPTFNfUEFORUxfVEVYVF9NQVhfV0lEVEgiLCJzaG93RW5lcmd5Q2hlY2tib3giLCJlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkiLCJjaGlsZHJlbiIsInNwYWNpbmciLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRZIiwiRU5FUkdZX1NZTUJPTFNfUEFORUxfQ0hFQ0tCT1hfWV9ESUxBVElPTiIsImNvbnRyb2xQYW5lbENoZWNrYm94ZXMiLCJmbGFtZU5vZGUiLCJFTkVSR1lfQ0hVTktfV0lEVEgiLCJtYXhIZWlnaHQiLCJsaW5rSGVhdGVyc1RleHQiLCJsaW5rSGVhdGVyc0NoZWNrYm94IiwiYWxpZ24iLCJjb250cm9sUGFuZWwiLCJjb3JuZXJSYWRpdXMiLCJFTkVSR1lfU1lNQk9MU19QQU5FTF9DT1JORVJfUkFESVVTIiwicmlnaHRUb3AiLCJFTkVSR1lfU1lNQk9MU19QQU5FTF9NSU5fV0lEVEgiLCJyZXNldEFsbEJ1dHRvbiIsInJlc2V0IiwicmFkaXVzIiwiUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMiLCJza3lOb2RlIiwiSU5UUk9fU0NSRUVOX0VORVJHWV9DSFVOS19NQVhfVFJBVkVMX0hFSUdIVCIsIm1hbnVhbFN0ZXBFbWl0dGVyIiwiZHQiLCJwbGF5QXJlYUJvdW5kcyIsInJldXN1YWJsZUJvdW5kcyIsImVsZW1lbnRWaWV3Qm91bmRzIiwibW9kZWxUb1ZpZXdCb3VuZHMiLCJnZXRDb21wb3NpdGVCb3VuZHNGb3JQb3NpdGlvbiIsImRlbHRhWCIsImRlbHRhWSIsInZpZXdUb01vZGVsRGVsdGFYIiwidmlld1RvTW9kZWxEZWx0YVkiLCJ5Iiwic2V0WFkiLCJ4Iiwic3RlcCIsInN0ZXBWaWV3IiwibGF5b3V0Iiwidmlld0JvdW5kcyIsInJlc2V0VHJhbnNmb3JtIiwiZ2V0TGF5b3V0U2NhbGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImR4Iiwib2Zmc2V0WSIsInRyYW5zbGF0ZSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRUZBQ0ludHJvU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBtYWluIHZpZXcgZm9yIHRoZSAnSW50cm8nIHNjcmVlbiBvZiB0aGUgRW5lcmd5IEZvcm1zIGFuZCBDaGFuZ2VzIHNpbXVsYXRpb25cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGUgKEJlcmVhIENvbGxlZ2UpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqIEBhdXRob3IgQW5kcmV3IEFkYXJlXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBmbGFtZV9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2ltYWdlcy9mbGFtZV9wbmcuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgSGVhdGVyQ29vbGVyQmFjayBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvSGVhdGVyQ29vbGVyQmFjay5qcyc7XHJcbmltcG9ydCBIZWF0ZXJDb29sZXJGcm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvSGVhdGVyQ29vbGVyRnJvbnQuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IFRpbWVTcGVlZCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZVNwZWVkLmpzJztcclxuaW1wb3J0IHsgRG93blVwTGlzdGVuZXIsIEhCb3gsIEltYWdlLCBLZXlib2FyZFV0aWxzLCBOb2RlLCBSZWN0YW5nbGUsIFRleHQsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBQaGV0aW9Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvR3JvdXAuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBnYXNQaXBlSW50cm9fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9nYXNQaXBlSW50cm9fcG5nLmpzJztcclxuaW1wb3J0IHNoZWxmX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc2hlbGZfcG5nLmpzJztcclxuaW1wb3J0IEVGQUNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0VGQUNDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRUZBQ1F1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBCZWFrZXJUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9CZWFrZXJUeXBlLmpzJztcclxuaW1wb3J0IEVuZXJneUNodW5rIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lDaHVuay5qcyc7XHJcbmltcG9ydCBFbmVyZ3lUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9FbmVyZ3lUeXBlLmpzJztcclxuaW1wb3J0IEJ1cm5lclN0YW5kTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9CdXJuZXJTdGFuZE5vZGUuanMnO1xyXG5pbXBvcnQgRUZBQ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VGQUNUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua0xheWVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VuZXJneUNodW5rTGF5ZXIuanMnO1xyXG5pbXBvcnQgRW5lcmd5Q2h1bmtOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VuZXJneUNodW5rTm9kZS5qcyc7XHJcbmltcG9ydCBTa3lOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NreU5vZGUuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgZWZhY1Bvc2l0aW9uQ29uc3RyYWluZXIgZnJvbSAnLi4vbW9kZWwvZWZhY1Bvc2l0aW9uQ29uc3RyYWluZXIuanMnO1xyXG5pbXBvcnQgQWlyTm9kZSBmcm9tICcuL0Fpck5vZGUuanMnO1xyXG5pbXBvcnQgQmVha2VyQ29udGFpbmVyVmlldyBmcm9tICcuL0JlYWtlckNvbnRhaW5lclZpZXcuanMnO1xyXG5pbXBvcnQgQmxvY2tOb2RlIGZyb20gJy4vQmxvY2tOb2RlLmpzJztcclxuXHJcbmNvbnN0IGVuZXJneVN5bWJvbHNTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmVuZXJneVN5bWJvbHM7XHJcbmNvbnN0IGxpbmtIZWF0ZXJzU3RyaW5nID0gRW5lcmd5Rm9ybXNBbmRDaGFuZ2VzU3RyaW5ncy5saW5rSGVhdGVycztcclxuY29uc3Qgb2xpdmVPaWxTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLm9saXZlT2lsO1xyXG5jb25zdCB3YXRlclN0cmluZyA9IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3Mud2F0ZXI7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgRURHRV9JTlNFVCA9IDEwOyAvLyBzY3JlZW4gZWRnZSBwYWRkaW5nLCBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcclxuY29uc3QgVEhFUk1PTUVURVJfSlVNUF9PTl9FWFRSQUNUSU9OID0gbmV3IFZlY3RvcjIoIDUsIDUgKTsgLy8gaW4gc2NyZWVuIGNvb3JkaW5hdGVzXHJcbmNvbnN0IFRIRVJNT01FVEVSX0FOSU1BVElPTl9TUEVFRCA9IDAuMjsgLy8gaW4gbWV0ZXJzIHBlciBzZWNvbmRcclxuY29uc3QgTUFYX1RIRVJNT01FVEVSX0FOSU1BVElPTl9USU1FID0gMTsgLy8gbWF4IHRpbWUgZm9yIHRoZXJtb21ldGVyIHJldHVybiBhbmltYXRpb24gdG8gY29tcGxldGUsIGluIHNlY29uZHNcclxuXHJcbmNsYXNzIEVGQUNJbnRyb1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFRkFDSW50cm9Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCB0YW5kZW0gKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtFRkFDSW50cm9Nb2RlbH1cclxuICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIG1vZGVsLXZpZXcgdHJhbnNmb3JtLiBUaGUgcHJpbWFyeSB1bml0cyB1c2VkIGluIHRoZSBtb2RlbCBhcmUgbWV0ZXJzLCBzbyBzaWduaWZpY2FudCB6b29tIGlzIHVzZWQuXHJcbiAgICAvLyBUaGUgbXVsdGlwbGllcnMgZm9yIHRoZSAybmQgcGFyYW1ldGVyIGNhbiBiZSB1c2VkIHRvIGFkanVzdCB3aGVyZSB0aGUgcG9pbnQgKDAsIDApIGluIHRoZSBtb2RlbCBhcHBlYXJzIGluIHRoZVxyXG4gICAgLy8gdmlldy5cclxuICAgIGNvbnN0IG1vZGVsVmlld1RyYW5zZm9ybSA9IE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgIFZlY3RvcjIuWkVSTyxcclxuICAgICAgbmV3IFZlY3RvcjIoXHJcbiAgICAgICAgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoICogMC41ICksXHJcbiAgICAgICAgVXRpbHMucm91bmRTeW1tZXRyaWMoIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCAqIDAuODUgKVxyXG4gICAgICApLFxyXG4gICAgICBFRkFDQ29uc3RhbnRzLklOVFJPX01WVF9TQ0FMRV9GQUNUT1JcclxuICAgICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIG5vZGVzIHRoYXQgd2lsbCBhY3QgYXMgbGF5ZXJzIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgbmVlZGVkIFotb3JkZXIgYmVoYXZpb3JcclxuICAgIGNvbnN0IGJhY2tMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiYWNrTGF5ZXIgKTtcclxuICAgIGNvbnN0IGJlYWtlckJhY2tMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiZWFrZXJCYWNrTGF5ZXIgKTtcclxuICAgIGNvbnN0IGJlYWtlckdyYWJMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBiZWFrZXJHcmFiTGF5ZXIgKTtcclxuICAgIGNvbnN0IGJsb2NrTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYmxvY2tMYXllciApO1xyXG4gICAgY29uc3QgYWlyTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYWlyTGF5ZXIgKTtcclxuICAgIGNvbnN0IGxlZnRCdXJuZXJFbmVyZ3lDaHVua0xheWVyID0gbmV3IEVuZXJneUNodW5rTGF5ZXIoIG1vZGVsLmxlZnRCdXJuZXIuZW5lcmd5Q2h1bmtMaXN0LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxlZnRCdXJuZXJFbmVyZ3lDaHVua0xheWVyICk7XHJcbiAgICBjb25zdCByaWdodEJ1cm5lckVuZXJneUNodW5rTGF5ZXIgPSBuZXcgRW5lcmd5Q2h1bmtMYXllciggbW9kZWwucmlnaHRCdXJuZXIuZW5lcmd5Q2h1bmtMaXN0LCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJpZ2h0QnVybmVyRW5lcmd5Q2h1bmtMYXllciApO1xyXG4gICAgY29uc3QgaGVhdGVyQ29vbGVyRnJvbnRMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBoZWF0ZXJDb29sZXJGcm9udExheWVyICk7XHJcbiAgICBjb25zdCBiZWFrZXJGcm9udExheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJlYWtlckZyb250TGF5ZXIgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgdGhlIGxhYiBiZW5jaCBzdXJmYWNlIGltYWdlXHJcbiAgICBjb25zdCBsYWJCZW5jaFN1cmZhY2VJbWFnZSA9IG5ldyBJbWFnZSggc2hlbGZfcG5nLCB7XHJcbiAgICAgIGNlbnRlclg6IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIDAgKSxcclxuICAgICAgY2VudGVyWTogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggMCApICsgMTAgLy8gc2xpZ2h0IHR3ZWFrIHJlcXVpcmVkIGR1ZSB0byBuYXR1cmUgb2YgdGhlIGltYWdlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGEgcmVjdGFuZ2xlIHRoYXQgd2lsbCBhY3QgYXMgdGhlIGJhY2tncm91bmQgYmVsb3cgdGhlIGxhYiBiZW5jaCBzdXJmYWNlLCBiYXNpY2FsbHkgbGlrZSB0aGUgc2lkZSBvZiB0aGVcclxuICAgIC8vIGJlbmNoXHJcbiAgICBjb25zdCBiZW5jaFdpZHRoID0gbGFiQmVuY2hTdXJmYWNlSW1hZ2Uud2lkdGggKiAwLjk1O1xyXG4gICAgY29uc3QgYmVuY2hIZWlnaHQgPSAxMDAwOyAvLyBhcmJpdHJhcnkgbGFyZ2UgbnVtYmVyLCB1c2VyIHNob3VsZCBuZXZlciBzZWUgdGhlIGJvdHRvbSBvZiB0aGlzXHJcbiAgICBjb25zdCBsYWJCZW5jaFNpZGUgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICBsYWJCZW5jaFN1cmZhY2VJbWFnZS5jZW50ZXJYIC0gYmVuY2hXaWR0aCAvIDIsXHJcbiAgICAgIGxhYkJlbmNoU3VyZmFjZUltYWdlLmNlbnRlclksXHJcbiAgICAgIGJlbmNoV2lkdGgsXHJcbiAgICAgIGJlbmNoSGVpZ2h0LFxyXG4gICAgICB7IGZpbGw6IEVGQUNDb25zdGFudHMuQ0xPQ0tfQ09OVFJPTF9CQUNLR1JPVU5EX0NPTE9SIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBiZW5jaCBzaWRlIGFuZCB0b3AgdG8gdGhlIHNjZW5lIC0gdGhlIGxhYiBiZW5jaCBzaWRlIG11c3QgYmUgYmVoaW5kIHRoZSBiZW5jaCB0b3BcclxuICAgIGJhY2tMYXllci5hZGRDaGlsZCggbGFiQmVuY2hTaWRlICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIGxhYkJlbmNoU3VyZmFjZUltYWdlICk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRoZSB2ZXJ0aWNhbCBjZW50ZXIgYmV0d2VlbiB0aGUgbG93ZXIgZWRnZSBvZiB0aGUgdG9wIG9mIHRoZSBiZW5jaCBhbmQgdGhlIGJvdHRvbSBvZiB0aGUgY2FudmFzLCB1c2VkXHJcbiAgICAvLyBmb3IgbGF5b3V0LlxyXG4gICAgY29uc3QgY2VudGVyWUJlbG93U3VyZmFjZSA9ICggdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICsgbGFiQmVuY2hTdXJmYWNlSW1hZ2UuYm90dG9tICkgLyAyO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgcGxheS9wYXVzZSBhbmQgc3RlcCBidXR0b25zXHJcbiAgICBjb25zdCB0aW1lQ29udHJvbE5vZGUgPSBuZXcgVGltZUNvbnRyb2xOb2RlKCBtb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSwge1xyXG4gICAgICB0aW1lU3BlZWRQcm9wZXJ0eTogRUZBQ1F1ZXJ5UGFyYW1ldGVycy5zaG93U3BlZWRDb250cm9scyA/IG1vZGVsLnRpbWVTcGVlZFByb3BlcnR5IDogbnVsbCxcclxuICAgICAgdGltZVNwZWVkczogWyBUaW1lU3BlZWQuTk9STUFMLCBUaW1lU3BlZWQuRkFTVCBdLFxyXG4gICAgICBwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IG1vZGVsLm1hbnVhbFN0ZXAoKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUNvbnRyb2xOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gY2VudGVyIHRpbWUgY29udHJvbHMgYmVsb3cgdGhlIGxhYiBiZW5jaFxyXG4gICAgdGltZUNvbnRyb2xOb2RlLmNlbnRlciA9IG5ldyBWZWN0b3IyKCB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYLCBjZW50ZXJZQmVsb3dTdXJmYWNlICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIHRpbWVDb250cm9sTm9kZSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgYnVybmVyc1xyXG4gICAgY29uc3QgYnVybmVyUHJvamVjdGlvbkFtb3VudCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWChcclxuICAgICAgbW9kZWwubGVmdEJ1cm5lci5nZXRCb3VuZHMoKS5oZWlnaHQgKiBFRkFDQ29uc3RhbnRzLkJVUk5FUl9FREdFX1RPX0hFSUdIVF9SQVRJT1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgbGVmdCBidXJuZXIgbm9kZVxyXG4gICAgY29uc3QgbGVmdEJ1cm5lclN0YW5kID0gbmV3IEJ1cm5lclN0YW5kTm9kZShcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3U2hhcGUoIG1vZGVsLmxlZnRCdXJuZXIuZ2V0Qm91bmRzKCkgKSxcclxuICAgICAgYnVybmVyUHJvamVjdGlvbkFtb3VudFxyXG4gICAgKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBnYXMgcGlwZSBpbWFnZSB1c2VkIGFzIHBhcnQgb2YgdGhlIEhlYXRlckNvb2xlck5vZGVzIGZvciB0aGlzIHNjcmVlbiBhbmQgbGlua3MgaXRzIE5vZGVJTyBQcm9wZXJ0aWVzXHJcbiAgICAgKiBzbyB0aGUgZ2FzIHBpcGUgZm9sbG93cyBhbnkgY2hhbmdlcyB0aGF0IG9jY3VyIHRvIHRoZSBwcm92aWRlZCBOb2RlLiBJdCBhbHNvIHVzZXMgdGhlIHByb3ZpZGVkIG5vZGUgdG8gY29ycmVjdGx5XHJcbiAgICAgKiBwb3NpdGlvbiBpdHNlbGYuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIChOb2RlfSBub2RlXHJcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgICAqL1xyXG4gICAgY29uc3QgY3JlYXRlQW5kTGlua1BpcGVJbWFnZU5vZGUgPSBub2RlID0+IHtcclxuICAgICAgY29uc3QgZ2FzUGlwZU5vZGUgPSBuZXcgSW1hZ2UoIGdhc1BpcGVJbnRyb19wbmcsIHtcclxuICAgICAgICByaWdodDogbm9kZS5sZWZ0ICsgMTUsXHJcbiAgICAgICAgYm90dG9tOiBub2RlLmJvdHRvbSAtIDYsXHJcbiAgICAgICAgc2NhbGU6IDAuNFxyXG4gICAgICB9ICk7XHJcbiAgICAgIG5vZGUub3BhY2l0eVByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgICAgZ2FzUGlwZU5vZGUub3BhY2l0eSA9IG5vZGUub3BhY2l0eTtcclxuICAgICAgfSApO1xyXG4gICAgICBub2RlLnBpY2thYmxlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgICBnYXNQaXBlTm9kZS5waWNrYWJsZSA9IG5vZGUucGlja2FibGU7XHJcbiAgICAgIH0gKTtcclxuICAgICAgbm9kZS52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgICBnYXNQaXBlTm9kZS52aXNpYmxlID0gbm9kZS52aXNpYmxlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICByZXR1cm4gZ2FzUGlwZU5vZGU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGZvciB0ZXN0aW5nIC0gb3B0aW9uIHRvIGtlZXAgdGhlIGhlYXRlciBjb29sZXJzIHN0aWNreVxyXG4gICAgY29uc3Qgc25hcFRvWmVybyA9ICFFRkFDUXVlcnlQYXJhbWV0ZXJzLnN0aWNreUJ1cm5lcnM7XHJcblxyXG4gICAgLy8gc2V0IHVwIGxlZnQgaGVhdGVyLWNvb2xlciBub2RlLCBmcm9udCBhbmQgYmFjayBhcmUgYWRkZWQgc2VwYXJhdGVseSB0byBzdXBwb3J0IGxheWVyaW5nIG9mIGVuZXJneSBjaHVua3NcclxuICAgIGNvbnN0IGxlZnRIZWF0ZXJDb29sZXJCYWNrID0gbmV3IEhlYXRlckNvb2xlckJhY2soIG1vZGVsLmxlZnRCdXJuZXIuaGVhdENvb2xMZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgIGNlbnRlclg6IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goIG1vZGVsLmxlZnRCdXJuZXIuZ2V0Qm91bmRzKCkuY2VudGVyWCApLFxyXG4gICAgICBib3R0b206IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIG1vZGVsLmxlZnRCdXJuZXIuZ2V0Qm91bmRzKCkubWluWSApLFxyXG4gICAgICBtaW5XaWR0aDogbGVmdEJ1cm5lclN0YW5kLndpZHRoIC8gMS41LFxyXG4gICAgICBtYXhXaWR0aDogbGVmdEJ1cm5lclN0YW5kLndpZHRoIC8gMS41XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBsZWZ0SGVhdGVyQ29vbGVyRnJvbnQgPSBuZXcgSGVhdGVyQ29vbGVyRnJvbnQoIG1vZGVsLmxlZnRCdXJuZXIuaGVhdENvb2xMZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgIGxlZnRUb3A6IGxlZnRIZWF0ZXJDb29sZXJCYWNrLmdldEhlYXRlckZyb250UG9zaXRpb24oKSxcclxuICAgICAgbWluV2lkdGg6IGxlZnRCdXJuZXJTdGFuZC53aWR0aCAvIDEuNSxcclxuICAgICAgbWF4V2lkdGg6IGxlZnRCdXJuZXJTdGFuZC53aWR0aCAvIDEuNSxcclxuICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMzYsIDE4ICksXHJcbiAgICAgIHNuYXBUb1plcm86IHNuYXBUb1plcm8sXHJcbiAgICAgIGhlYXRlckNvb2xlckJhY2s6IGxlZnRIZWF0ZXJDb29sZXJCYWNrLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZWZ0SGVhdGVyQ29vbGVyTm9kZScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBoZWF0ZXIvY29vbGVyIG9uIHRoZSBsZWZ0J1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbGVmdEdhc1BpcGUgPSBjcmVhdGVBbmRMaW5rUGlwZUltYWdlTm9kZSggbGVmdEhlYXRlckNvb2xlckZyb250ICk7XHJcblxyXG4gICAgaGVhdGVyQ29vbGVyRnJvbnRMYXllci5hZGRDaGlsZCggbGVmdEhlYXRlckNvb2xlckZyb250ICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIGxlZnRIZWF0ZXJDb29sZXJCYWNrICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIGxlZnRCdXJuZXJTdGFuZCApO1xyXG4gICAgYmFja0xheWVyLmFkZENoaWxkKCBsZWZ0R2FzUGlwZSApO1xyXG5cclxuICAgIGxldCByaWdodEJ1cm5lckJvdW5kcyA9IG51bGw7XHJcblxyXG4gICAgLy8gb25seSBhZGQgdGhlIHJpZ2h0IGJ1cm5lciBhbmQgaGFuZGxlIGxpbmtpbmcgaGVhdGVycyBpZiB0aGUgcmlnaHQgb25lIGV4aXN0cyBpbiB0aGUgbW9kZWxcclxuICAgIGlmICggbW9kZWwudHdvQnVybmVycyApIHtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSByaWdodCBidXJuZXIgbm9kZVxyXG4gICAgICBjb25zdCByaWdodEJ1cm5lclN0YW5kID0gbmV3IEJ1cm5lclN0YW5kTm9kZShcclxuICAgICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdTaGFwZSggbW9kZWwucmlnaHRCdXJuZXIuZ2V0Qm91bmRzKCkgKSxcclxuICAgICAgICBidXJuZXJQcm9qZWN0aW9uQW1vdW50XHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyBzZXQgdXAgcmlnaHQgaGVhdGVyLWNvb2xlciBub2RlXHJcbiAgICAgIGNvbnN0IHJpZ2h0SGVhdGVyQ29vbGVyQmFjayA9IG5ldyBIZWF0ZXJDb29sZXJCYWNrKCBtb2RlbC5yaWdodEJ1cm5lci5oZWF0Q29vbExldmVsUHJvcGVydHksIHtcclxuICAgICAgICBjZW50ZXJYOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBtb2RlbC5yaWdodEJ1cm5lci5nZXRCb3VuZHMoKS5jZW50ZXJYICksXHJcbiAgICAgICAgYm90dG9tOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBtb2RlbC5yaWdodEJ1cm5lci5nZXRCb3VuZHMoKS5taW5ZICksXHJcbiAgICAgICAgbWluV2lkdGg6IHJpZ2h0QnVybmVyU3RhbmQud2lkdGggLyAxLjUsXHJcbiAgICAgICAgbWF4V2lkdGg6IHJpZ2h0QnVybmVyU3RhbmQud2lkdGggLyAxLjVcclxuICAgICAgfSApO1xyXG4gICAgICBjb25zdCByaWdodEhlYXRlckNvb2xlckZyb250ID0gbmV3IEhlYXRlckNvb2xlckZyb250KCBtb2RlbC5yaWdodEJ1cm5lci5oZWF0Q29vbExldmVsUHJvcGVydHksIHtcclxuICAgICAgICBsZWZ0VG9wOiByaWdodEhlYXRlckNvb2xlckJhY2suZ2V0SGVhdGVyRnJvbnRQb3NpdGlvbigpLFxyXG4gICAgICAgIG1pbldpZHRoOiByaWdodEJ1cm5lclN0YW5kLndpZHRoIC8gMS41LFxyXG4gICAgICAgIG1heFdpZHRoOiByaWdodEJ1cm5lclN0YW5kLndpZHRoIC8gMS41LFxyXG4gICAgICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDM2LCAxOCApLFxyXG4gICAgICAgIHNuYXBUb1plcm86IHNuYXBUb1plcm8sXHJcbiAgICAgICAgaGVhdGVyQ29vbGVyQmFjazogcmlnaHRIZWF0ZXJDb29sZXJCYWNrLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JpZ2h0SGVhdGVyQ29vbGVyTm9kZScgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIGhlYXRlci9jb29sZXIgb24gdGhlIHJpZ2h0LCB3aGljaCBtYXkgbm90IGV4aXN0IGluIHRoZSBzaW11bGF0aW9uJ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGNvbnN0IHJpZ2h0R2FzUGlwZSA9IGNyZWF0ZUFuZExpbmtQaXBlSW1hZ2VOb2RlKCByaWdodEhlYXRlckNvb2xlckZyb250ICk7XHJcblxyXG4gICAgICBoZWF0ZXJDb29sZXJGcm9udExheWVyLmFkZENoaWxkKCByaWdodEhlYXRlckNvb2xlckZyb250ICk7XHJcbiAgICAgIGJhY2tMYXllci5hZGRDaGlsZCggcmlnaHRIZWF0ZXJDb29sZXJCYWNrICk7XHJcbiAgICAgIGJhY2tMYXllci5hZGRDaGlsZCggcmlnaHRCdXJuZXJTdGFuZCApO1xyXG4gICAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIHJpZ2h0R2FzUGlwZSApO1xyXG5cclxuICAgICAgLy8gbWFrZSB0aGUgaGVhdCBjb29sIGxldmVscyBlcXVhbCBpZiB0aGV5IGJlY29tZSBsaW5rZWRcclxuICAgICAgbW9kZWwubGlua2VkSGVhdGVyc1Byb3BlcnR5LmxpbmsoIGxpbmtlZCA9PiB7XHJcbiAgICAgICAgaWYgKCBsaW5rZWQgKSB7XHJcbiAgICAgICAgICBtb2RlbC5sZWZ0QnVybmVyLmhlYXRDb29sTGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IG1vZGVsLnJpZ2h0QnVybmVyLmhlYXRDb29sTGV2ZWxQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSBoZWF0ZXJzIGFyZSBsaW5rZWQsIGNoYW5naW5nIHRoZSBsZWZ0IGhlYXRlciB3aWxsIGNoYW5nZSB0aGUgcmlnaHQgdG8gbWF0Y2hcclxuICAgICAgbW9kZWwubGVmdEJ1cm5lci5oZWF0Q29vbExldmVsUHJvcGVydHkubGluayggbGVmdEhlYXRDb29sQW1vdW50ID0+IHtcclxuICAgICAgICBpZiAoIG1vZGVsLmxpbmtlZEhlYXRlcnNQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIG1vZGVsLnJpZ2h0QnVybmVyLmhlYXRDb29sTGV2ZWxQcm9wZXJ0eS52YWx1ZSA9IGxlZnRIZWF0Q29vbEFtb3VudDtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGlmIHRoZSBoZWF0ZXJzIGFyZSBsaW5rZWQsIGNoYW5naW5nIHRoZSByaWdodCBoZWF0ZXIgd2lsbCBjaGFuZ2UgdGhlIGxlZnQgdG8gbWF0Y2hcclxuICAgICAgbW9kZWwucmlnaHRCdXJuZXIuaGVhdENvb2xMZXZlbFByb3BlcnR5LmxpbmsoIHJpZ2h0SGVhdENvb2xBbW91bnQgPT4ge1xyXG4gICAgICAgIGlmICggbW9kZWwubGlua2VkSGVhdGVyc1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgICAgbW9kZWwubGVmdEJ1cm5lci5oZWF0Q29vbExldmVsUHJvcGVydHkudmFsdWUgPSByaWdodEhlYXRDb29sQW1vdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgbGVmdEhlYXRlckNvb2xlckRvd25JbnB1dEFjdGlvbiA9ICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gbWFrZSB0aGUgcmlnaHQgaGVhdGVyLWNvb2xlciB1bi1waWNrYWJsZSBpZiB0aGUgaGVhdGVycyBhcmUgbGlua2VkXHJcbiAgICAgICAgaWYgKCBtb2RlbC5saW5rZWRIZWF0ZXJzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICByaWdodEhlYXRlckNvb2xlckZyb250LmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgICAgcmlnaHRIZWF0ZXJDb29sZXJGcm9udC5waWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgY29uc3QgbGVmdEhlYXRlckNvb2xlclVwSW5wdXRBY3Rpb24gPSAoKSA9PiB7XHJcbiAgICAgICAgcmlnaHRIZWF0ZXJDb29sZXJGcm9udC5waWNrYWJsZSA9IHRydWU7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBsaXN0ZW4gdG8gcG9pbnRlciBldmVudHMgb24gdGhlIGxlZnQgaGVhdGVyLWNvb2xlclxyXG4gICAgICBsZWZ0SGVhdGVyQ29vbGVyRnJvbnQuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERvd25VcExpc3RlbmVyKCB7XHJcbiAgICAgICAgZG93bjogbGVmdEhlYXRlckNvb2xlckRvd25JbnB1dEFjdGlvbixcclxuICAgICAgICB1cDogbGVmdEhlYXRlckNvb2xlclVwSW5wdXRBY3Rpb25cclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICAvLyBsaXN0ZW4gdG8ga2V5Ym9hcmQgZXZlbnRzIG9uIHRoZSBsZWZ0IGhlYXRlci1jb29sZXJcclxuICAgICAgbGVmdEhlYXRlckNvb2xlckZyb250LmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgICAgICBrZXlkb3duOiBldmVudCA9PiB7XHJcbiAgICAgICAgICBpZiAoIEtleWJvYXJkVXRpbHMuaXNSYW5nZUtleSggZXZlbnQuZG9tRXZlbnQgKSApIHtcclxuICAgICAgICAgICAgbGVmdEhlYXRlckNvb2xlckRvd25JbnB1dEFjdGlvbigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAga2V5dXA6IGV2ZW50ID0+IHtcclxuICAgICAgICAgIGlmICggS2V5Ym9hcmRVdGlscy5pc1JhbmdlS2V5KCBldmVudC5kb21FdmVudCApICkge1xyXG4gICAgICAgICAgICBsZWZ0SGVhdGVyQ29vbGVyVXBJbnB1dEFjdGlvbigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgY29uc3QgcmlnaHRIZWF0ZXJDb29sZXJEb3duSW5wdXRBY3Rpb24gPSAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIG1ha2UgdGhlIGxlZnQgaGVhdGVyLWNvb2xlciB1bi1waWNrYWJsZSBpZiB0aGUgaGVhdGVycyBhcmUgbGlua2VkXHJcbiAgICAgICAgaWYgKCBtb2RlbC5saW5rZWRIZWF0ZXJzUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICBsZWZ0SGVhdGVyQ29vbGVyRnJvbnQuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgICBsZWZ0SGVhdGVyQ29vbGVyRnJvbnQucGlja2FibGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IHJpZ2h0SGVhdGVyQ29vbGVyVXBJbnB1dEFjdGlvbiA9ICgpID0+IHtcclxuICAgICAgICBsZWZ0SGVhdGVyQ29vbGVyRnJvbnQucGlja2FibGUgPSB0cnVlO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgLy8gbGlzdGVuIHRvIHBvaW50ZXIgZXZlbnRzIG9uIHRoZSByaWdodCBoZWF0ZXItY29vbGVyXHJcbiAgICAgIHJpZ2h0SGVhdGVyQ29vbGVyRnJvbnQuYWRkSW5wdXRMaXN0ZW5lciggbmV3IERvd25VcExpc3RlbmVyKCB7XHJcbiAgICAgICAgZG93bjogcmlnaHRIZWF0ZXJDb29sZXJEb3duSW5wdXRBY3Rpb24sXHJcbiAgICAgICAgdXA6IHJpZ2h0SGVhdGVyQ29vbGVyVXBJbnB1dEFjdGlvblxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAgIC8vIGxpc3RlbiB0byBrZXlib2FyZCBldmVudHMgb24gdGhlIHJpZ2h0IGhlYXRlci1jb29sZXJcclxuICAgICAgcmlnaHRIZWF0ZXJDb29sZXJGcm9udC5hZGRJbnB1dExpc3RlbmVyKCB7XHJcbiAgICAgICAga2V5ZG93bjogZXZlbnQgPT4ge1xyXG4gICAgICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzUmFuZ2VLZXkoIGV2ZW50LmRvbUV2ZW50ICkgKSB7XHJcbiAgICAgICAgICAgIHJpZ2h0SGVhdGVyQ29vbGVyRG93bklucHV0QWN0aW9uKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBrZXl1cDogZXZlbnQgPT4ge1xyXG4gICAgICAgICAgaWYgKCBLZXlib2FyZFV0aWxzLmlzUmFuZ2VLZXkoIGV2ZW50LmRvbUV2ZW50ICkgKSB7XHJcbiAgICAgICAgICAgIHJpZ2h0SGVhdGVyQ29vbGVyVXBJbnB1dEFjdGlvbigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgcmlnaHRCdXJuZXJCb3VuZHMgPSBtb2RlbC5yaWdodEJ1cm5lci5nZXRCb3VuZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcmUtY2FsY3VsYXRlIHRoZSBzcGFjZSBvY2N1cGllZCBieSB0aGUgYnVybmVycywgc2luY2UgdGhleSBkb24ndCBtb3ZlLiAgVGhpcyBpcyB1c2VkIHdoZW4gdmFsaWRhdGluZ1xyXG4gICAgLy8gcG9zaXRpb25zIG9mIG1vdmFibGUgbW9kZWwgZWxlbWVudHMuICBUaGUgc3BhY2UgaXMgZXh0ZW5kZWQgYSBiaXQgdG8gdGhlIGxlZnQgdG8gYXZvaWQgYXdrd2FyZCB6LW9yZGVyaW5nXHJcbiAgICAvLyBpc3N1ZXMgd2hlbiBwcmV2ZW50aW5nIG92ZXJsYXAuXHJcbiAgICBjb25zdCBsZWZ0QnVybmVyQm91bmRzID0gbW9kZWwubGVmdEJ1cm5lci5nZXRCb3VuZHMoKTtcclxuICAgIGNvbnN0IGJ1cm5lclBlcnNwZWN0aXZlRXh0ZW5zaW9uID0gbGVmdEJ1cm5lckJvdW5kcy5oZWlnaHQgKiBFRkFDQ29uc3RhbnRzLkJVUk5FUl9FREdFX1RPX0hFSUdIVF9SQVRJTyAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zKCBFRkFDQ29uc3RhbnRzLkJVUk5FUl9QRVJTUEVDVElWRV9BTkdMRSApIC8gMjtcclxuICAgIC8vIEBwcml2YXRlIHtCb3VuZHMyfVxyXG4gICAgdGhpcy5idXJuZXJCbG9ja2luZ1JlY3QgPSBuZXcgQm91bmRzMihcclxuICAgICAgbGVmdEJ1cm5lckJvdW5kcy5taW5YIC0gYnVybmVyUGVyc3BlY3RpdmVFeHRlbnNpb24sXHJcbiAgICAgIGxlZnRCdXJuZXJCb3VuZHMubWluWSxcclxuICAgICAgcmlnaHRCdXJuZXJCb3VuZHMgPyByaWdodEJ1cm5lckJvdW5kcy5tYXhYIDogbGVmdEJ1cm5lckJvdW5kcy5tYXhYLFxyXG4gICAgICByaWdodEJ1cm5lckJvdW5kcyA/IHJpZ2h0QnVybmVyQm91bmRzLm1heFkgOiBsZWZ0QnVybmVyQm91bmRzLm1heFlcclxuICAgICk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBhaXJcclxuICAgIGFpckxheWVyLmFkZENoaWxkKCBuZXcgQWlyTm9kZSggbW9kZWwuYWlyLCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhIHJldXNhYmxlIGJvdW5kcyBpbiBvcmRlciB0byByZWR1Y2UgbWVtb3J5IGFsbG9jYXRpb25zXHJcbiAgICBjb25zdCByZXVzYWJsZUNvbnN0cmFpbnRCb3VuZHMgPSBCb3VuZHMyLk5PVEhJTkcuY29weSgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogbGltaXRzIHRoZSBtb2RlbCBlbGVtZW50IG1vdGlvbiBiYXNlZCBvbiBib3RoIHZpZXcgYW5kIG1vZGVsIGNvbnN0cmFpbnRzXHJcbiAgICAgKiBAcGFyYW0ge01vZGVsRWxlbWVudH0gbW9kZWxFbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHByb3Bvc2VkUG9zaXRpb25cclxuICAgICAqIEByZXR1cm5zIHtWZWN0b3IyfVxyXG4gICAgICovXHJcbiAgICBjb25zdCBjb25zdHJhaW5Nb3ZhYmxlRWxlbWVudE1vdGlvbiA9ICggbW9kZWxFbGVtZW50LCBwcm9wb3NlZFBvc2l0aW9uICkgPT4ge1xyXG5cclxuICAgICAgLy8gY29uc3RyYWluIHRoZSBtb2RlbCBlbGVtZW50IHRvIHN0YXkgd2l0aGluIHRoZSBwbGF5IGFyZWFcclxuICAgICAgY29uc3Qgdmlld0NvbnN0cmFpbmVkUG9zaXRpb24gPSBjb25zdHJhaW5Ub1BsYXlBcmVhKFxyXG4gICAgICAgIG1vZGVsRWxlbWVudCxcclxuICAgICAgICBwcm9wb3NlZFBvc2l0aW9uLFxyXG4gICAgICAgIHRoaXMubGF5b3V0Qm91bmRzLFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgICByZXVzYWJsZUNvbnN0cmFpbnRCb3VuZHNcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIGNvbnN0cmFpbiB0aGUgbW9kZWwgZWxlbWVudCB0byBtb3ZlIGxlZ2FsbHkgd2l0aGluIHRoZSBtb2RlbCwgd2hpY2ggZ2VuZXJhbGx5IG1lYW5zIG5vdCBtb3ZpbmcgdGhyb3VnaCB0aGluZ3NcclxuICAgICAgY29uc3Qgdmlld0FuZE1vZGVsQ29uc3RyYWluZWRQb3NpdGlvbiA9IGVmYWNQb3NpdGlvbkNvbnN0cmFpbmVyLmNvbnN0cmFpblBvc2l0aW9uKFxyXG4gICAgICAgIG1vZGVsRWxlbWVudCxcclxuICAgICAgICB2aWV3Q29uc3RyYWluZWRQb3NpdGlvbixcclxuICAgICAgICBtb2RlbC5iZWFrZXJHcm91cCxcclxuICAgICAgICBtb2RlbC5ibG9ja0dyb3VwLFxyXG4gICAgICAgIHRoaXMuYnVybmVyQmxvY2tpbmdSZWN0XHJcbiAgICAgICk7XHJcblxyXG4gICAgICAvLyByZXR1cm4gdGhlIHBvc2l0aW9uIGFzIGNvbnN0cmFpbmVkIGJ5IGJvdGggdGhlIG1vZGVsIGFuZCB0aGUgdmlld1xyXG4gICAgICByZXR1cm4gdmlld0FuZE1vZGVsQ29uc3RyYWluZWRQb3NpdGlvbjtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgYmxvY2tOb2RlR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoICggdGFuZGVtLCBibG9jayApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBCbG9ja05vZGUoXHJcbiAgICAgICAgYmxvY2ssXHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgIGNvbnN0cmFpbk1vdmFibGVFbGVtZW50TW90aW9uLFxyXG4gICAgICAgIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgICAgICBzZXRBcHByb2FjaGluZ0VuZXJneUNodW5rUGFyZW50Tm9kZTogYWlyTGF5ZXIsXHJcbiAgICAgICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgICAgIHBoZXRpb0R5bmFtaWNFbGVtZW50OiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfSwgKCkgPT4gWyBtb2RlbC5ibG9ja0dyb3VwLmFyY2hldHlwZSBdLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Jsb2NrTm9kZUdyb3VwJyApLFxyXG4gICAgICBwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZDogdHJ1ZSxcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggTm9kZS5Ob2RlSU8gKSxcclxuICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYmxvY2tMaXN0ZW5lciA9IGFkZGVkQmxvY2sgPT4ge1xyXG4gICAgICBjb25zdCBibG9ja05vZGUgPSBibG9ja05vZGVHcm91cC5jcmVhdGVDb3JyZXNwb25kaW5nR3JvdXBFbGVtZW50KCBhZGRlZEJsb2NrLnRhbmRlbS5uYW1lLCBhZGRlZEJsb2NrICk7XHJcblxyXG4gICAgICBibG9ja0xheWVyLmFkZENoaWxkKCBibG9ja05vZGUgKTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgcmVtb3ZhbCBsaXN0ZW5lciBmb3IgaWYgYW5kIHdoZW4gdGhpcyBlbGVjdHJpYyBmaWVsZCBzZW5zb3IgaXMgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbC5cclxuICAgICAgbW9kZWwuYmxvY2tHcm91cC5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBmdW5jdGlvbiByZW1vdmFsTGlzdGVuZXIoIHJlbW92ZWRCbG9jayApIHtcclxuICAgICAgICBpZiAoIHJlbW92ZWRCbG9jayA9PT0gYWRkZWRCbG9jayApIHtcclxuICAgICAgICAgIC8vIGJsb2NrTm9kZS5kaXNwb3NlKCk7XHJcbiAgICAgICAgICBtb2RlbC5ibG9ja0dyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2RlbC5ibG9ja0dyb3VwLmZvckVhY2goIGJsb2NrTGlzdGVuZXIgKTtcclxuICAgIG1vZGVsLmJsb2NrR3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBibG9ja0xpc3RlbmVyICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1BoZXRpb0dyb3VwLjxCZWFrZXJDb250YWluZXJWaWV3Pn1cclxuICAgIHRoaXMuYmVha2VyUHJveHlOb2RlR3JvdXAgPSBuZXcgUGhldGlvR3JvdXAoICggdGFuZGVtLCBiZWFrZXIgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGxhYmVsID0gYmVha2VyLmJlYWtlclR5cGUgPT09IEJlYWtlclR5cGUuV0FURVIgPyB3YXRlclN0cmluZyA6IG9saXZlT2lsU3RyaW5nO1xyXG4gICAgICByZXR1cm4gbmV3IEJlYWtlckNvbnRhaW5lclZpZXcoXHJcbiAgICAgICAgYmVha2VyLFxyXG4gICAgICAgIG1vZGVsLFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgICBjb25zdHJhaW5Nb3ZhYmxlRWxlbWVudE1vdGlvbiwge1xyXG4gICAgICAgICAgbGFiZWw6IGxhYmVsLFxyXG4gICAgICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgICAgICBwaGV0aW9EeW5hbWljRWxlbWVudDogdHJ1ZSxcclxuICAgICAgICAgIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfSwgKCkgPT4gWyBtb2RlbC5iZWFrZXJHcm91cC5hcmNoZXR5cGUgXSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiZWFrZXJQcm94eU5vZGVHcm91cCcgKSxcclxuICAgICAgcGhldGlvVHlwZTogUGhldGlvR3JvdXAuUGhldGlvR3JvdXBJTyggUmVmZXJlbmNlSU8oIElPVHlwZS5PYmplY3RJTyApICksXHJcbiAgICAgIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlLFxyXG4gICAgICBzdXBwb3J0c0R5bmFtaWNTdGF0ZTogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBiZWFrZXJMaXN0ZW5lciA9IGFkZGVkQmVha2VyID0+IHtcclxuICAgICAgY29uc3QgYmVha2VyUHJveHlOb2RlID0gdGhpcy5iZWFrZXJQcm94eU5vZGVHcm91cC5jcmVhdGVDb3JyZXNwb25kaW5nR3JvdXBFbGVtZW50KCBhZGRlZEJlYWtlci50YW5kZW0ubmFtZSwgYWRkZWRCZWFrZXIgKTtcclxuXHJcbiAgICAgIGJlYWtlckZyb250TGF5ZXIuYWRkQ2hpbGQoIGJlYWtlclByb3h5Tm9kZS5mcm9udE5vZGUgKTtcclxuICAgICAgYmVha2VyQmFja0xheWVyLmFkZENoaWxkKCBiZWFrZXJQcm94eU5vZGUuYmFja05vZGUgKTtcclxuICAgICAgYmVha2VyR3JhYkxheWVyLmFkZENoaWxkKCBiZWFrZXJQcm94eU5vZGUuZ3JhYk5vZGUgKTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgcmVtb3ZhbCBsaXN0ZW5lciBmb3IgaWYgYW5kIHdoZW4gdGhpcyBlbGVjdHJpYyBmaWVsZCBzZW5zb3IgaXMgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbC5cclxuICAgICAgbW9kZWwuYmVha2VyR3JvdXAuZWxlbWVudERpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkQmVha2VyICkge1xyXG4gICAgICAgIGlmICggcmVtb3ZlZEJlYWtlciA9PT0gYWRkZWRCZWFrZXIgKSB7XHJcbiAgICAgICAgICAvLyBiZWFrZXJOb2RlLmRpc3Bvc2UoKTtcclxuICAgICAgICAgIG1vZGVsLmJlYWtlckdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHJlbW92YWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBtb2RlbC5iZWFrZXJHcm91cC5mb3JFYWNoKCBiZWFrZXJMaXN0ZW5lciApO1xyXG4gICAgbW9kZWwuYmVha2VyR3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBiZWFrZXJMaXN0ZW5lciApO1xyXG5cclxuICAgIC8vIHRoZSB0aGVybW9tZXRlciBsYXllciBuZWVkcyB0byBiZSBhYm92ZSB0aGUgbW92YWJsZSBvYmplY3RzXHJcbiAgICBjb25zdCB0aGVybW9tZXRlckxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoZXJtb21ldGVyTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgdGVtcGVyYXR1cmUgYW5kIGNvbG9yIHRoZXJtb21ldGVyIG5vZGVzLCB3aGljaCBsb29rIGxpa2UgYSB0aGVybW9tZXRlciB3aXRoIGEgdHJpYW5nbGUgb24gdGhlIHNpZGVcclxuICAgIGNvbnN0IHRoZXJtb21ldGVyTm9kZXMgPSBbXTtcclxuICAgIGNvbnN0IG5vZGVTdHJpbmcgPSAnTm9kZSc7XHJcbiAgICBsZXQgdGhlcm1vbWV0ZXJOb2RlV2lkdGggPSAwO1xyXG4gICAgbGV0IHRoZXJtb21ldGVyTm9kZUhlaWdodCA9IDA7XHJcbiAgICBtb2RlbC50aGVybW9tZXRlcnMuZm9yRWFjaCggdGhlcm1vbWV0ZXIgPT4ge1xyXG4gICAgICBjb25zdCB0aGVybW9tZXRlck5vZGUgPSBuZXcgRUZBQ1RlbXBlcmF0dXJlQW5kQ29sb3JTZW5zb3JOb2RlKCB0aGVybW9tZXRlciwge1xyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybTogbW9kZWxWaWV3VHJhbnNmb3JtLFxyXG4gICAgICAgIGRyYWdCb3VuZHM6IG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggdGhpcy5sYXlvdXRCb3VuZHMgKSxcclxuICAgICAgICBkcmFnZ2FibGU6IHRydWUsXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCB0aGVybW9tZXRlci50YW5kZW0ubmFtZSArIG5vZGVTdHJpbmcgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyB0aGVybW9tZXRlcnMgbmVlZCB0byBiZSBiZWhpbmQgYmxvY2tzIGFuZCBiZWFrZXJzIHdoaWxlIGluIHN0b3JhZ2UsIGJ1dCBpbiBmcm9udCB3aGVuIHRoZW0gd2hpbGUgaW4gdXNlXHJcbiAgICAgIHRoZXJtb21ldGVyLmFjdGl2ZVByb3BlcnR5LmxpbmsoIGFjdGl2ZSA9PiB7XHJcbiAgICAgICAgaWYgKCBhY3RpdmUgKSB7XHJcbiAgICAgICAgICBpZiAoIGJhY2tMYXllci5oYXNDaGlsZCggdGhlcm1vbWV0ZXJOb2RlICkgKSB7XHJcbiAgICAgICAgICAgIGJhY2tMYXllci5yZW1vdmVDaGlsZCggdGhlcm1vbWV0ZXJOb2RlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGVybW9tZXRlckxheWVyLmFkZENoaWxkKCB0aGVybW9tZXRlck5vZGUgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBpZiAoIHRoZXJtb21ldGVyTGF5ZXIuaGFzQ2hpbGQoIHRoZXJtb21ldGVyTm9kZSApICkge1xyXG4gICAgICAgICAgICB0aGVybW9tZXRlckxheWVyLnJlbW92ZUNoaWxkKCB0aGVybW9tZXRlck5vZGUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJhY2tMYXllci5hZGRDaGlsZCggdGhlcm1vbWV0ZXJOb2RlICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICB0aGVybW9tZXRlck5vZGVzLnB1c2goIHRoZXJtb21ldGVyTm9kZSApO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSB2YXJpYWJsZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gY3JlYXRlIHRoZSBzdG9yYWdlIGFyZWFcclxuICAgICAgdGhlcm1vbWV0ZXJOb2RlSGVpZ2h0ID0gdGhlcm1vbWV0ZXJOb2RlSGVpZ2h0IHx8IHRoZXJtb21ldGVyTm9kZS5oZWlnaHQ7XHJcbiAgICAgIHRoZXJtb21ldGVyTm9kZVdpZHRoID0gdGhlcm1vbWV0ZXJOb2RlV2lkdGggfHwgdGhlcm1vbWV0ZXJOb2RlLndpZHRoO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB0aGUgc3RvcmFnZSBhcmVhIGZvciB0aGUgdGhlcm1vbWV0ZXJzXHJcbiAgICBjb25zdCB0aGVybW9tZXRlclN0b3JhZ2VBcmVhTm9kZSA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIHRoZXJtb21ldGVyTm9kZVdpZHRoICogMixcclxuICAgICAgdGhlcm1vbWV0ZXJOb2RlSGVpZ2h0ICogMS4xNSxcclxuICAgICAgRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX0NPUk5FUl9SQURJVVMsXHJcbiAgICAgIEVGQUNDb25zdGFudHMuQ09OVFJPTF9QQU5FTF9DT1JORVJfUkFESVVTLCB7XHJcbiAgICAgICAgZmlsbDogRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX0JBQ0tHUk9VTkRfQ09MT1IsXHJcbiAgICAgICAgc3Ryb2tlOiBFRkFDQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfT1VUTElORV9TVFJPS0UsXHJcbiAgICAgICAgbGluZVdpZHRoOiBFRkFDQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfT1VUTElORV9MSU5FX1dJRFRILFxyXG4gICAgICAgIGxlZnQ6IEVER0VfSU5TRVQsXHJcbiAgICAgICAgdG9wOiBFREdFX0lOU0VULFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RoZXJtb21ldGVyU3RvcmFnZUFyZWFOb2RlJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwYW5lbCB3aGVyZSB0aGUgdGhlcm1vbWV0ZXJzIGFyZSBzdG9yZWQnXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIHRoZXJtb21ldGVyU3RvcmFnZUFyZWFOb2RlICk7XHJcbiAgICB0aGVybW9tZXRlclN0b3JhZ2VBcmVhTm9kZS5tb3ZlVG9CYWNrKCk7IC8vIG1vdmUgYmVoaW5kIHRoZSB0aGVybW9tZXRlck5vZGVzIHdoZW4gdGhleSBhcmUgYmVpbmcgc3RvcmVkXHJcblxyXG4gICAgLy8gc2V0IGluaXRpYWwgcG9zaXRpb24gZm9yIHRoZXJtb21ldGVycyBpbiB0aGUgc3RvcmFnZSBhcmVhLCBob29rIHVwIGxpc3RlbmVycyB0byBoYW5kbGUgaW50ZXJhY3Rpb24gd2l0aCBzdG9yYWdlIGFyZWFcclxuICAgIGNvbnN0IGludGVyVGhlcm1vbWV0ZXJTcGFjaW5nID0gKCB0aGVybW9tZXRlclN0b3JhZ2VBcmVhTm9kZS53aWR0aCAtIHRoZXJtb21ldGVyTm9kZVdpZHRoICkgLyAyO1xyXG4gICAgY29uc3Qgb2Zmc2V0RnJvbUJvdHRvbU9mU3RvcmFnZUFyZWEgPSAyNTsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgY29uc3QgdGhlcm1vbWV0ZXJOb2RlUG9zaXRpb25YID0gdGhlcm1vbWV0ZXJTdG9yYWdlQXJlYU5vZGUubGVmdCArIGludGVyVGhlcm1vbWV0ZXJTcGFjaW5nO1xyXG4gICAgY29uc3QgdGhlcm1vbWV0ZXJQb3NpdGlvbkluU3RvcmFnZUFyZWEgPSBuZXcgVmVjdG9yMihcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsWCggdGhlcm1vbWV0ZXJOb2RlUG9zaXRpb25YICksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS52aWV3VG9Nb2RlbFkoIHRoZXJtb21ldGVyU3RvcmFnZUFyZWFOb2RlLmJvdHRvbSAtIG9mZnNldEZyb21Cb3R0b21PZlN0b3JhZ2VBcmVhICkgKTtcclxuXHJcbiAgICBtb2RlbC50aGVybW9tZXRlcnMuZm9yRWFjaCggKCB0aGVybW9tZXRlciwgaW5kZXggKSA9PiB7XHJcblxyXG4gICAgICAvLyBhZGQgYSBsaXN0ZW5lciBmb3Igd2hlbiB0aGUgdGhlcm1vbWV0ZXIgaXMgcmVtb3ZlZCBmcm9tIG9yIHJldHVybmVkIHRvIHRoZSBzdG9yYWdlIGFyZWFcclxuICAgICAgdGhlcm1vbWV0ZXIudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5saW5rKCB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCApIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgdXNlciBoYXMgcGlja2VkIHVwIHRoaXMgdGhlcm1vbWV0ZXJcclxuICAgICAgICAgIGlmICggIXRoZXJtb21ldGVyLmFjdGl2ZVByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIHRoZXJtb21ldGVyIHdhcyBpbmFjdGl2ZSwgd2hpY2ggbWVhbnMgdGhhdCBpdCB3YXMgaW4gdGhlIHN0b3JhZ2UgYXJlYS4gIEluIHRoaXMgY2FzZSwgd2UgbWFrZSBpdCBqdW1wXHJcbiAgICAgICAgICAgIC8vIGEgbGl0dGxlIHRvIGN1ZSB0aGUgdXNlciB0aGF0IHRoaXMgaXMgYSBtb3ZhYmxlIG9iamVjdC5cclxuICAgICAgICAgICAgdGhlcm1vbWV0ZXIucG9zaXRpb25Qcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgICAgICAgdGhlcm1vbWV0ZXIucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5wbHVzKCBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YSggVEhFUk1PTUVURVJfSlVNUF9PTl9FWFRSQUNUSU9OICkgKVxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgLy8gYWN0aXZhdGUgdGhlIHRoZXJtb21ldGVyXHJcbiAgICAgICAgICAgIHRoZXJtb21ldGVyLmFjdGl2ZVByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyB0aGUgdXNlciBoYXMgcmVsZWFzZWQgdGhpcyB0aGVybW9tZXRlciAtIHRlc3QgaWYgaXQgc2hvdWxkIGdvIGJhY2sgaW4gdGhlIHN0b3JhZ2UgYXJlYVxyXG4gICAgICAgICAgY29uc3QgdGhlcm1vbWV0ZXJOb2RlID0gdGhlcm1vbWV0ZXJOb2Rlc1sgaW5kZXggXTtcclxuICAgICAgICAgIGNvbnN0IGNvbG9ySW5kaWNhdG9yQm91bmRzID0gdGhlcm1vbWV0ZXJOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoXHJcbiAgICAgICAgICAgIHRoZXJtb21ldGVyTm9kZS50ZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZS5jb2xvckluZGljYXRvckJvdW5kc1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNvbnN0IHRoZXJtb21ldGVyQm91bmRzID0gdGhlcm1vbWV0ZXJOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoXHJcbiAgICAgICAgICAgIHRoZXJtb21ldGVyTm9kZS50ZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yTm9kZS50aGVybW9tZXRlckJvdW5kc1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGlmICggY29sb3JJbmRpY2F0b3JCb3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggdGhlcm1vbWV0ZXJTdG9yYWdlQXJlYU5vZGUuYm91bmRzICkgfHxcclxuICAgICAgICAgICAgICAgdGhlcm1vbWV0ZXJCb3VuZHMuaW50ZXJzZWN0c0JvdW5kcyggdGhlcm1vbWV0ZXJTdG9yYWdlQXJlYU5vZGUuYm91bmRzICkgKSB7XHJcbiAgICAgICAgICAgIHJldHVyblRoZXJtb21ldGVyVG9TdG9yYWdlQXJlYSggdGhlcm1vbWV0ZXIsIHRydWUsIHRoZXJtb21ldGVyTm9kZSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogcmV0dXJuIGEgdGhlcm1vbWV0ZXIgdG8gaXRzIGluaXRpYWwgcG9zaXRpb24gaW4gdGhlIHN0b3JhZ2UgYXJlYVxyXG4gICAgICogQHBhcmFtIHtTdGlja3lUZW1wZXJhdHVyZUFuZENvbG9yU2Vuc29yfSB0aGVybW9tZXRlclxyXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBkb0FuaW1hdGlvbiAtIHdoZXRoZXIgdGhlIHRoZXJtb21ldGVyIGFuaW1hdGVzIGJhY2sgdG8gdGhlIHN0b3JhZ2UgYXJlYVxyXG4gICAgICogQHBhcmFtIHtFRkFDVGVtcGVyYXR1cmVBbmRDb2xvclNlbnNvck5vZGV9IFt0aGVybW9tZXRlck5vZGVdXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHJldHVyblRoZXJtb21ldGVyVG9TdG9yYWdlQXJlYSA9ICggdGhlcm1vbWV0ZXIsIGRvQW5pbWF0aW9uLCB0aGVybW9tZXRlck5vZGUgKSA9PiB7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IHRoZXJtb21ldGVyLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIGlmICggIWN1cnJlbnRQb3NpdGlvbi5lcXVhbHMoIHRoZXJtb21ldGVyUG9zaXRpb25JblN0b3JhZ2VBcmVhICkgJiYgZG9BbmltYXRpb24gKSB7XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgdGltZSBuZWVkZWQgdG8gZ2V0IHRvIHRoZSBkZXN0aW5hdGlvblxyXG4gICAgICAgIGNvbnN0IGFuaW1hdGlvbkR1cmF0aW9uID0gTWF0aC5taW4oXHJcbiAgICAgICAgICB0aGVybW9tZXRlci5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCB0aGVybW9tZXRlclBvc2l0aW9uSW5TdG9yYWdlQXJlYSApIC8gVEhFUk1PTUVURVJfQU5JTUFUSU9OX1NQRUVELFxyXG4gICAgICAgICAgTUFYX1RIRVJNT01FVEVSX0FOSU1BVElPTl9USU1FXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBhbmltYXRpb25PcHRpb25zID0ge1xyXG4gICAgICAgICAgcHJvcGVydHk6IHRoZXJtb21ldGVyLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgICB0bzogdGhlcm1vbWV0ZXJQb3NpdGlvbkluU3RvcmFnZUFyZWEsXHJcbiAgICAgICAgICBkdXJhdGlvbjogYW5pbWF0aW9uRHVyYXRpb24sXHJcbiAgICAgICAgICBlYXNpbmc6IEVhc2luZy5DVUJJQ19JTl9PVVRcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIGFuaW1hdGlvbk9wdGlvbnMgKTtcclxuXHJcbiAgICAgICAgLy8gbWFrZSB0aGUgdGhlcm1vbWV0ZXIgdW5waWNrYWJsZSB3aGlsZSBpdCdzIGFuaW1hdGluZyBiYWNrIHRvIHRoZSBzdG9yYWdlIGFyZWFcclxuICAgICAgICB0cmFuc2xhdGVBbmltYXRpb24uYW5pbWF0aW5nUHJvcGVydHkubGluayggaXNBbmltYXRpbmcgPT4ge1xyXG4gICAgICAgICAgdGhlcm1vbWV0ZXJOb2RlICYmICggdGhlcm1vbWV0ZXJOb2RlLnBpY2thYmxlID0gIWlzQW5pbWF0aW5nICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIHRyYW5zbGF0ZUFuaW1hdGlvbi5zdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhY3VycmVudFBvc2l0aW9uLmVxdWFscyggdGhlcm1vbWV0ZXJQb3NpdGlvbkluU3RvcmFnZUFyZWEgKSAmJiAhZG9BbmltYXRpb24gKSB7XHJcblxyXG4gICAgICAgIC8vIHNldCB0aGUgaW5pdGlhbCBwb3NpdGlvbiBmb3IgdGhpcyB0aGVybW9tZXRlclxyXG4gICAgICAgIHRoZXJtb21ldGVyLnBvc2l0aW9uUHJvcGVydHkuc2V0KCB0aGVybW9tZXRlclBvc2l0aW9uSW5TdG9yYWdlQXJlYSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0aGVybW9tZXRlcnMgYXJlIGluYWN0aXZlIHdoZW4gaW4gdGhlIHN0b3JhZ2UgYXJlYVxyXG4gICAgICB0aGVybW9tZXRlci5hY3RpdmVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHJldHVybnMgYWxsIHRoZXJtb21ldGVycyB0byB0aGUgc3RvcmFnZSBhcmVhXHJcbiAgICBjb25zdCByZXR1cm5BbGxUaGVybW9tZXRlcnNUb1N0b3JhZ2VBcmVhID0gKCkgPT4ge1xyXG4gICAgICBtb2RlbC50aGVybW9tZXRlcnMuZm9yRWFjaCggdGhlcm1vbWV0ZXIgPT4ge1xyXG4gICAgICAgIHJldHVyblRoZXJtb21ldGVyVG9TdG9yYWdlQXJlYSggdGhlcm1vbWV0ZXIsIGZhbHNlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gcHV0IGFsbCBvZiB0aGUgdGVtcGVyYXR1cmUgYW5kIGNvbG9yIHRoZXJtb21ldGVycyBpbnRvIHRoZSBzdG9yYWdlIGFyZWEgYXMgcGFydCBvZiBpbml0aWFsaXphdGlvbiBwcm9jZXNzXHJcbiAgICByZXR1cm5BbGxUaGVybW9tZXRlcnNUb1N0b3JhZ2VBcmVhKCk7XHJcblxyXG4gICAgLy8gdXBkYXRlcyB0aGUgWi1vcmRlciBvZiB0aGUgYmxvY2tzIHdoZW4gdGhlaXIgcG9zaXRpb24gY2hhbmdlc1xyXG4gICAgY29uc3QgYmxvY2tDaGFuZ2VMaXN0ZW5lciA9IHBvc2l0aW9uID0+IHtcclxuICAgICAgY29uc3QgYmxvY2tzID0gWyAuLi5tb2RlbC5ibG9ja0dyb3VwLmdldEFycmF5KCkgXTtcclxuXHJcbiAgICAgIGJsb2Nrcy5zb3J0KCAoIGEsIGIgKSA9PiB7XHJcbiAgICAgICAgLy8gYSBibG9jayB0aGF0J3MgY29tcGxldGVseSB0byB0aGUgcmlnaHQgb2YgYW5vdGhlciBibG9jayBzaG91bGQgYWx3YXlzIGJlIGluIGZyb250XHJcbiAgICAgICAgaWYgKCBhLmJvdW5kcy5taW5YID49IGIuYm91bmRzLm1heFggKSB7XHJcbiAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIGEuYm91bmRzLm1heFggPD0gYi5ib3VuZHMubWluWCApIHtcclxuICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGEgYmxvY2sgdGhhdCdzIGFib3ZlIGFub3RoZXIgc2hvdWxkIGFsd2F5cyBiZSBpbiBmcm9udCBpZiB0aGV5IG92ZXJsYXAgaW4gdGhlIHggZGlyZWN0aW9uXHJcbiAgICAgICAgaWYgKCBhLmJvdW5kcy5taW5ZID4gYi5ib3VuZHMubWluWSApIHtcclxuICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggYi5ib3VuZHMubWluWSA+IGEuYm91bmRzLm1pblkgKSB7XHJcbiAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBibG9ja3MubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgYmxvY2tzWyBpIF0uekluZGV4ID0gaTsgLy8gbWFyayBzbyB0aGUgbW9kZWwgaXMgYXdhcmUgb2YgaXRzIHotaW5kZXggKHRoZSBzZW5zb3JzIG5lZWQgdG8ga25vdyB0aGlzKS5cclxuICAgICAgICBibG9ja05vZGVHcm91cC5mb3JFYWNoKCBibG9ja05vZGUgPT4ge1xyXG4gICAgICAgICAgaWYgKCBibG9ja05vZGUuYmxvY2sgPT09IGJsb2Nrc1sgaSBdICkge1xyXG4gICAgICAgICAgICAvLyBAc2FtcmVpZCBhbmQgQGNocmlza2x1cyBsb29rZWQgZm9yIGFueSBwZXJmb3JtYW5jZSBib3R0bGVuZWNrcyBjYXVzZWQgYnkgcmUtbGF5ZXJpbmcgZXZlcnkgZnJhbWUgYnV0XHJcbiAgICAgICAgICAgIC8vIGNvdWxkIG5vdCBmaW5kIGFueXRoaW5nIHNvIHdlIHN1c3BlY3QgU2NlbmVyeSBrbm93IG5vdCB0byBpZiB0aGUgb3JkZXIgaXMgYWxyZWFkeSBjb3JyZWN0XHJcbiAgICAgICAgICAgIGJsb2NrTm9kZS5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBubyBuZWVkIHRvIGxpbmsgei1vcmRlci1jaGFuZ2luZyBsaXN0ZW5lciBpZiB0aGVyZSBpcyBvbmx5IG9uZSBibG9ja1xyXG4gICAgaWYgKCBtb2RlbC5ibG9ja0dyb3VwLmNvdW50ID4gMSApIHtcclxuICAgICAgbW9kZWwuYmxvY2tHcm91cC5mb3JFYWNoKCBibG9jayA9PiB7XHJcbiAgICAgICAgYmxvY2sucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBibG9ja0NoYW5nZUxpc3RlbmVyICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBubyBuZWVkIHRvIGxpbmsgei1vcmRlci1jaGFuZ2luZyBsaXN0ZW5lciBpZiB0aGVyZSBpcyBvbmx5IG9uZSBiZWFrZXJcclxuICAgIGlmICggbW9kZWwuYmVha2VyR3JvdXAuY291bnQgPiAxICkge1xyXG5cclxuICAgICAgLy8gdGhpcyBwYXJ0aWN1bGFyIGxpc3RlbmVyIGNvdWxkIGJlIGdlbmVyYWxpemVkIHRvIHN1cHBvcnQgbW9yZSB0aGFuIDIgYmVha2VycyAoc2VlIHRoZSBibG9jayBsaXN0ZW5lciBhYm92ZSksXHJcbiAgICAgIC8vIGJ1dCBzaW5jZSBvdGhlciBjb2RlIGluIHRoaXMgc2ltIGxpbWl0cyB0aGUgbnVtYmVyIG9mIGJlYWtlcnMgdG8gMiwgaSAoQGNocmlza2x1cykgdGhpbmsgaXQncyBiZXR0ZXIgdG9cclxuICAgICAgLy8gbGVhdmUgdGhpcyBsaXN0ZW5lciBhcyBzaW1wbGUgYXMgaXQgaXMsIHNpbmNlIGEgZ2VuZXJhbCB2ZXJzaW9uIGNvdWxkIG9ubHkgd29yc2VuIHBlcmZvcm1hbmNlLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtb2RlbC5iZWFrZXJHcm91cC5jb3VudCA8PSAyLCBgT25seSAyIGJlYWtlcnMgYXJlIGFsbG93ZWQ6ICR7bW9kZWwuYmVha2VyR3JvdXAuY291bnR9YCApO1xyXG5cclxuICAgICAgY29uc3QgYmVha2VyT25lSW5kZXggPSAwO1xyXG4gICAgICBjb25zdCBiZWFrZXJUd29JbmRleCA9IDE7XHJcblxyXG4gICAgICAvLyB1cGRhdGVzIHRoZSBaLW9yZGVyIG9mIHRoZSBiZWFrZXJzIHdoZW5ldmVyIHRoZWlyIHBvc2l0aW9uIGNoYW5nZXNcclxuICAgICAgY29uc3QgYmVha2VyQ2hhbmdlTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCBtb2RlbC5iZWFrZXJHcm91cC5nZXRFbGVtZW50KCBiZWFrZXJPbmVJbmRleCApLmdldEJvdW5kcygpLmNlbnRlclkgPlxyXG4gICAgICAgICAgICAgbW9kZWwuYmVha2VyR3JvdXAuZ2V0RWxlbWVudCggYmVha2VyVHdvSW5kZXggKS5nZXRCb3VuZHMoKS5jZW50ZXJZICkge1xyXG4gICAgICAgICAgdGhpcy5iZWFrZXJQcm94eU5vZGVHcm91cC5nZXRFbGVtZW50KCBiZWFrZXJPbmVJbmRleCApLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5iZWFrZXJQcm94eU5vZGVHcm91cC5nZXRFbGVtZW50KCBiZWFrZXJUd29JbmRleCApLm1vdmVUb0Zyb250KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBtb2RlbC5iZWFrZXJHcm91cC5mb3JFYWNoKCBiZWFrZXIgPT4ge1xyXG4gICAgICAgIGJlYWtlci5wb3NpdGlvblByb3BlcnR5LmxpbmsoIGJlYWtlckNoYW5nZUxpc3RlbmVyICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB1c2UgdGhpcyBUYW5kZW0gZm9yIHRoZSBjaGVja2JveGVzLCB0b28sIHNvIHRoZXkgYXBwZWFyIGFzIGEgY2hpbGQgb2YgdGhlIGNvbnRyb2wgcGFuZWxcclxuICAgIGNvbnN0IGNvbnRyb2xQYW5lbFRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUGFuZWwnICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBjb250cm9sIGZvciBzaG93aW5nL2hpZGluZyBlbmVyZ3kgY2h1bmtzLiAgVGhlIGVsZW1lbnRzIG9mIHRoaXMgY29udHJvbCBhcmUgY3JlYXRlZCBzZXBhcmF0ZWx5IHRvXHJcbiAgICAvLyBhbGxvdyBlYWNoIHRvIGJlIGluZGVwZW5kZW50bHkgc2NhbGVkLiBUaGUgRW5lcmd5Q2h1bmsgdGhhdCBpcyBjcmVhdGVkIGhlcmUgaXMgbm90IGdvaW5nIHRvIGJlIHVzZWQgaW4gdGhlXHJcbiAgICAvLyBzaW11bGF0aW9uLCBpdCBpcyBvbmx5IG5lZWRlZCBmb3IgdGhlIEVuZXJneUNodW5rTm9kZSB0aGF0IGlzIGRpc3BsYXllZCBpbiB0aGUgc2hvdy9oaWRlIGVuZXJneSBjaHVua3MgdG9nZ2xlLlxyXG4gICAgY29uc3QgZW5lcmd5Q2h1bmtOb2RlID0gbmV3IEVuZXJneUNodW5rTm9kZShcclxuICAgICAgbmV3IEVuZXJneUNodW5rKCBFbmVyZ3lUeXBlLlRIRVJNQUwsIFZlY3RvcjIuWkVSTywgVmVjdG9yMi5aRVJPLCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksIHsgdGFuZGVtOiBUYW5kZW0uT1BUX09VVCB9ICksXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAgKTtcclxuICAgIGVuZXJneUNodW5rTm9kZS5waWNrYWJsZSA9IGZhbHNlO1xyXG4gICAgY29uc3QgZW5lcmd5U3ltYm9sc1RleHQgPSBuZXcgVGV4dCggZW5lcmd5U3ltYm9sc1N0cmluZywge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwICksXHJcbiAgICAgIG1heFdpZHRoOiBFRkFDQ29uc3RhbnRzLkVORVJHWV9TWU1CT0xTX1BBTkVMX1RFWFRfTUFYX1dJRFRIXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzaG93RW5lcmd5Q2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIG1vZGVsLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSwgbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgZW5lcmd5U3ltYm9sc1RleHQsIGVuZXJneUNodW5rTm9kZSBdLFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9ICksIHtcclxuICAgICAgdGFuZGVtOiBjb250cm9sUGFuZWxUYW5kZW0uY3JlYXRlVGFuZGVtKCAnc2hvd0VuZXJneVN5bWJvbHNDaGVja2JveCcgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NoZWNrYm94IHRoYXQgc2hvd3MgdGhlIGVuZXJneSBzeW1ib2xzJ1xyXG4gICAgfSApO1xyXG4gICAgc2hvd0VuZXJneUNoZWNrYm94LnRvdWNoQXJlYSA9XHJcbiAgICAgIHNob3dFbmVyZ3lDaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkWSggRUZBQ0NvbnN0YW50cy5FTkVSR1lfU1lNQk9MU19QQU5FTF9DSEVDS0JPWF9ZX0RJTEFUSU9OICk7XHJcblxyXG4gICAgLy8gdmFyaWFibGVzIG5lZWRlZCBpZiB0aGUgcmlnaHQgYnVybmVyIGV4aXN0c1xyXG4gICAgbGV0IGNvbnRyb2xQYW5lbENoZWNrYm94ZXMgPSBudWxsO1xyXG4gICAgY29uc3QgZmxhbWVOb2RlID0gbmV3IEltYWdlKCBmbGFtZV9wbmcsIHtcclxuICAgICAgbWF4V2lkdGg6IEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1dJRFRILFxyXG4gICAgICBtYXhIZWlnaHQ6IEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1dJRFRIXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBsaW5rSGVhdGVyc1RleHQgPSBuZXcgVGV4dCggbGlua0hlYXRlcnNTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAyMCApLFxyXG4gICAgICBtYXhXaWR0aDogRUZBQ0NvbnN0YW50cy5FTkVSR1lfU1lNQk9MU19QQU5FTF9URVhUX01BWF9XSURUSFxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgbGlua0hlYXRlcnNDaGVja2JveCA9IG5ldyBDaGVja2JveCggbW9kZWwubGlua2VkSGVhdGVyc1Byb3BlcnR5LCBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBsaW5rSGVhdGVyc1RleHQsIGZsYW1lTm9kZSBdLFxyXG4gICAgICBzcGFjaW5nOiA1XHJcbiAgICB9ICksIHtcclxuICAgICAgdGFuZGVtOiBjb250cm9sUGFuZWxUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbGlua0hlYXRlcnNDaGVja2JveCcgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2NoZWNrYm94IHRoYXQgbGlua3MgdGhlIGhlYXRlcnMgdG9nZXRoZXIuIG9ubHkgYXBwZWFycyBpbiB0aGUgc2ltdWxhdGlvbiB3aGVuIHR3byBidXJuZXJzIGV4aXN0J1xyXG4gICAgfSApO1xyXG4gICAgbGlua0hlYXRlcnNDaGVja2JveC50b3VjaEFyZWEgPVxyXG4gICAgICBsaW5rSGVhdGVyc0NoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRZKCBFRkFDQ29uc3RhbnRzLkVORVJHWV9TWU1CT0xTX1BBTkVMX0NIRUNLQk9YX1lfRElMQVRJT04gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNvbnRyb2wgZm9yIGxpbmtpbmcvdW4tbGlua2luZyB0aGUgaGVhdGVycywgaWYgdGhlIHJpZ2h0IGJ1cm5lciBleGlzdHNcclxuICAgIGlmICggbW9kZWwudHdvQnVybmVycyApIHtcclxuICAgICAgY29udHJvbFBhbmVsQ2hlY2tib3hlcyA9IG5ldyBWQm94KCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFsgc2hvd0VuZXJneUNoZWNrYm94LCBsaW5rSGVhdGVyc0NoZWNrYm94IF0sXHJcbiAgICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgICAgYWxpZ246ICdsZWZ0J1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSBjaGVja2JveCBjb250cm9sc1xyXG4gICAgY29uc3QgY29udHJvbFBhbmVsID0gbmV3IFBhbmVsKCBjb250cm9sUGFuZWxDaGVja2JveGVzIHx8IHNob3dFbmVyZ3lDaGVja2JveCwge1xyXG4gICAgICBmaWxsOiBFRkFDQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfQkFDS0dST1VORF9DT0xPUixcclxuICAgICAgc3Ryb2tlOiBFRkFDQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfT1VUTElORV9TVFJPS0UsXHJcbiAgICAgIGxpbmVXaWR0aDogRUZBQ0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX09VVExJTkVfTElORV9XSURUSCxcclxuICAgICAgY29ybmVyUmFkaXVzOiBFRkFDQ29uc3RhbnRzLkVORVJHWV9TWU1CT0xTX1BBTkVMX0NPUk5FUl9SQURJVVMsXHJcbiAgICAgIHJpZ2h0VG9wOiBuZXcgVmVjdG9yMiggdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggLSBFREdFX0lOU0VULCBFREdFX0lOU0VUICksXHJcbiAgICAgIG1pbldpZHRoOiBFRkFDQ29uc3RhbnRzLkVORVJHWV9TWU1CT0xTX1BBTkVMX01JTl9XSURUSCxcclxuICAgICAgdGFuZGVtOiBjb250cm9sUGFuZWxUYW5kZW0sXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdwYW5lbCBpbiB0aGUgdXBwZXIgcmlnaHQgY29ybmVyIG9mIHRoZSBzY3JlZW4nXHJcbiAgICB9ICk7XHJcbiAgICBiYWNrTGF5ZXIuYWRkQ2hpbGQoIGNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIC8vIGNyZWF0ZSBhbmQgYWRkIHRoZSBcIlJlc2V0IEFsbFwiIGJ1dHRvbiBpbiB0aGUgYm90dG9tIHJpZ2h0XHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgICByZXR1cm5BbGxUaGVybW9tZXRlcnNUb1N0b3JhZ2VBcmVhKCk7XHJcbiAgICAgICAgdGhpcy5iZWFrZXJQcm94eU5vZGVHcm91cC5mb3JFYWNoKCBiZWFrZXJQcm94eU5vZGUgPT4ge1xyXG4gICAgICAgICAgYmVha2VyUHJveHlOb2RlLnJlc2V0KCk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9LFxyXG4gICAgICByYWRpdXM6IEVGQUNDb25zdGFudHMuUkVTRVRfQUxMX0JVVFRPTl9SQURJVVMsXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gRURHRV9JTlNFVCxcclxuICAgICAgY2VudGVyWTogKCBsYWJCZW5jaFN1cmZhY2VJbWFnZS5ib3VuZHMubWF4WSArIHRoaXMubGF5b3V0Qm91bmRzLm1heFkgKSAvIDIsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIC8vIGFkZCBhIGZsb2F0aW5nIHNreSBoaWdoIGFib3ZlIHRoZSBzaW1cclxuICAgIGNvbnN0IHNreU5vZGUgPSBuZXcgU2t5Tm9kZShcclxuICAgICAgdGhpcy5sYXlvdXRCb3VuZHMsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIEVGQUNDb25zdGFudHMuSU5UUk9fU0NSRUVOX0VORVJHWV9DSFVOS19NQVhfVFJBVkVMX0hFSUdIVCApICsgRUZBQ0NvbnN0YW50cy5FTkVSR1lfQ0hVTktfV0lEVEhcclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBza3lOb2RlICk7XHJcblxyXG4gICAgLy8gbGlzdGVuIHRvIHRoZSBtYW51YWxTdGVwRW1pdHRlciBpbiB0aGUgbW9kZWxcclxuICAgIG1vZGVsLm1hbnVhbFN0ZXBFbWl0dGVyLmFkZExpc3RlbmVyKCBkdCA9PiB7XHJcbiAgICAgIHRoaXMubWFudWFsU3RlcCggZHQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIGNvbnN0cmFpbnMgdGhlIHByb3ZpZGVkIG1vZGVsIGVsZW1lbnQncyBwb3NpdGlvbiB0byB0aGUgcGxheSBhcmVhXHJcbiAgICAgKiBAcGFyYW0ge01vZGVsRWxlbWVudH0gbW9kZWxFbGVtZW50XHJcbiAgICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IHByb3Bvc2VkUG9zaXRpb25cclxuICAgICAqIEBwYXJhbSB7Qm91bmRzMn0gcGxheUFyZWFCb3VuZHNcclxuICAgICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICAgKiBAcGFyYW0ge0JvdW5kczJ9IHJldXN1YWJsZUJvdW5kc1xyXG4gICAgICogQHJldHVybnMge1ZlY3RvcjJ9XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGNvbnN0cmFpblRvUGxheUFyZWEgPSAoIG1vZGVsRWxlbWVudCwgcHJvcG9zZWRQb3NpdGlvbiwgcGxheUFyZWFCb3VuZHMsIG1vZGVsVmlld1RyYW5zZm9ybSwgcmV1c3VhYmxlQm91bmRzICkgPT4ge1xyXG4gICAgICBjb25zdCB2aWV3Q29uc3RyYWluZWRQb3NpdGlvbiA9IHByb3Bvc2VkUG9zaXRpb24uY29weSgpO1xyXG5cclxuICAgICAgY29uc3QgZWxlbWVudFZpZXdCb3VuZHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoXHJcbiAgICAgICAgbW9kZWxFbGVtZW50LmdldENvbXBvc2l0ZUJvdW5kc0ZvclBvc2l0aW9uKCBwcm9wb3NlZFBvc2l0aW9uLCByZXVzdWFibGVCb3VuZHMgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gY29uc3RyYWluIHRoZSBtb2RlbCBlbGVtZW50IHRvIHN0YXkgd2l0aGluIHRoZSBwbGF5IGFyZWFcclxuICAgICAgbGV0IGRlbHRhWCA9IDA7XHJcbiAgICAgIGxldCBkZWx0YVkgPSAwO1xyXG4gICAgICBpZiAoIGVsZW1lbnRWaWV3Qm91bmRzLm1heFggPj0gcGxheUFyZWFCb3VuZHMubWF4WCApIHtcclxuICAgICAgICBkZWx0YVggPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVgoIHBsYXlBcmVhQm91bmRzLm1heFggLSBlbGVtZW50Vmlld0JvdW5kcy5tYXhYICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGVsZW1lbnRWaWV3Qm91bmRzLm1pblggPD0gcGxheUFyZWFCb3VuZHMubWluWCApIHtcclxuICAgICAgICBkZWx0YVggPSBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxEZWx0YVgoIHBsYXlBcmVhQm91bmRzLm1pblggLSBlbGVtZW50Vmlld0JvdW5kcy5taW5YICk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCBlbGVtZW50Vmlld0JvdW5kcy5taW5ZIDw9IHBsYXlBcmVhQm91bmRzLm1pblkgKSB7XHJcbiAgICAgICAgZGVsdGFZID0gbW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsRGVsdGFZKCBwbGF5QXJlYUJvdW5kcy5taW5ZIC0gZWxlbWVudFZpZXdCb3VuZHMubWluWSApO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCBwcm9wb3NlZFBvc2l0aW9uLnkgPCAwICkge1xyXG4gICAgICAgIGRlbHRhWSA9IC1wcm9wb3NlZFBvc2l0aW9uLnk7XHJcbiAgICAgIH1cclxuICAgICAgdmlld0NvbnN0cmFpbmVkUG9zaXRpb24uc2V0WFkoIHZpZXdDb25zdHJhaW5lZFBvc2l0aW9uLnggKyBkZWx0YVgsIHZpZXdDb25zdHJhaW5lZFBvc2l0aW9uLnkgKyBkZWx0YVkgKTtcclxuXHJcbiAgICAgIC8vIHJldHVybiB0aGUgcG9zaXRpb24gYXMgY29uc3RyYWluZWQgYnkgYm90aCB0aGUgbW9kZWwgYW5kIHRoZSB2aWV3XHJcbiAgICAgIHJldHVybiB2aWV3Q29uc3RyYWluZWRQb3NpdGlvbjtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBzdGVwIHRoaXMgdmlldyBlbGVtZW50LCBjYWxsZWQgYnkgdGhlIGZyYW1ld29ya1xyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGVwKCBkdCApIHtcclxuICAgIGlmICggdGhpcy5tb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgdGhpcy5zdGVwVmlldyggZHQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0ZXAgZm9yd2FyZCBieSBvbmUgZml4ZWQgbm9taW5hbCBmcmFtZSB0aW1lXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIG1hbnVhbFN0ZXAoIGR0ICkge1xyXG4gICAgdGhpcy5zdGVwVmlldyggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHVwZGF0ZSB0aGUgc3RhdGUgb2YgdGhlIG5vbi1tb2RlbCBhc3NvY2lhdGVkIHZpZXcgZWxlbWVudHMgZm9yIGEgZ2l2ZW4gdGltZSBhbW91bnRcclxuICAgKiBAcGFyYW0gZHQgLSB0aW1lIHN0ZXAsIGluIHNlY29uZHNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcFZpZXcoIGR0ICkge1xyXG4gICAgdGhpcy5iZWFrZXJQcm94eU5vZGVHcm91cC5mb3JFYWNoKCBiZWFrZXJQcm94eU5vZGUgPT4ge1xyXG4gICAgICBiZWFrZXJQcm94eU5vZGUuc3RlcCggZHQgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEN1c3RvbSBsYXlvdXQgZnVuY3Rpb24gZm9yIHRoaXMgdmlldyBzbyB0aGF0IGl0IGZsb2F0cyB0byB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IHZpZXdCb3VuZHNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbGF5b3V0KCB2aWV3Qm91bmRzICkge1xyXG4gICAgdGhpcy5yZXNldFRyYW5zZm9ybSgpO1xyXG5cclxuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5nZXRMYXlvdXRTY2FsZSggdmlld0JvdW5kcyApO1xyXG4gICAgY29uc3Qgd2lkdGggPSB2aWV3Qm91bmRzLndpZHRoO1xyXG4gICAgY29uc3QgaGVpZ2h0ID0gdmlld0JvdW5kcy5oZWlnaHQ7XHJcbiAgICB0aGlzLnNldFNjYWxlTWFnbml0dWRlKCBzY2FsZSApO1xyXG5cclxuICAgIGxldCBkeCA9IDA7XHJcbiAgICBsZXQgb2Zmc2V0WSA9IDA7XHJcblxyXG4gICAgLy8gTW92ZSB0byBib3R0b20gdmVydGljYWxseSAoY3VzdG9tIGZvciB0aGlzIHNpbSlcclxuICAgIGlmICggc2NhbGUgPT09IHdpZHRoIC8gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKSB7XHJcbiAgICAgIG9mZnNldFkgPSAoIGhlaWdodCAvIHNjYWxlIC0gdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2VudGVyIGhvcml6b250YWxseSAoZGVmYXVsdCBiZWhhdmlvciBmb3IgU2NyZWVuVmlldylcclxuICAgIGVsc2UgaWYgKCBzY2FsZSA9PT0gaGVpZ2h0IC8gdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICkge1xyXG4gICAgICBkeCA9ICggd2lkdGggLSB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAqIHNjYWxlICkgLyAyIC8gc2NhbGU7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYW5zbGF0ZSggZHggKyB2aWV3Qm91bmRzLmxlZnQgLyBzY2FsZSwgb2Zmc2V0WSArIHZpZXdCb3VuZHMudG9wIC8gc2NhbGUgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIHZpc2libGUgYm91bmRzIG9mIHRoZSBzY3JlZW4gdmlld1xyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkuc2V0KCBuZXcgQm91bmRzMiggLWR4LCAtb2Zmc2V0WSwgd2lkdGggLyBzY2FsZSAtIGR4LCBoZWlnaHQgLyBzY2FsZSAtIG9mZnNldFkgKSApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnRUZBQ0ludHJvU2NyZWVuVmlldycsIEVGQUNJbnRyb1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgRUZBQ0ludHJvU2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxtQkFBbUIsTUFBTSx1REFBdUQ7QUFDdkYsT0FBT0MsU0FBUyxNQUFNLDhDQUE4QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLGdCQUFnQixNQUFNLGlEQUFpRDtBQUM5RSxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsU0FBU0MsY0FBYyxFQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsYUFBYSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzNILE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FB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