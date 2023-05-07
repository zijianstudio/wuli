// Copyright 2018-2023, University of Colorado Boulder
// @ts-nocheck
/**
 * View for the "Waves" screen.  Extended for the Interference and Slits screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import platform from '../../../../phet-core/js/platform.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import { Color, DragListener, Node, Rectangle, RichText, Text, Utils } from '../../../../scenery/js/imports.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import grab_mp3 from '../../../../tambo/sounds/grab_mp3.js';
import release_mp3 from '../../../../tambo/sounds/release_mp3.js';
import PhetioAction from '../../../../tandem/js/PhetioAction.js';
import SoundScene from '../../common/model/SoundScene.js';
import DashedLineNode from '../../common/view/DashedLineNode.js';
import DisturbanceTypeRadioButtonGroup from '../../common/view/DisturbanceTypeRadioButtonGroup.js';
import IntensityGraphPanel from '../../common/view/IntensityGraphPanel.js';
import LatticeCanvasNode from '../../common/view/LatticeCanvasNode.js';
import LengthScaleIndicatorNode from '../../common/view/LengthScaleIndicatorNode.js';
import LightScreenNode from '../../common/view/LightScreenNode.js';
import LightWaveGeneratorNode from '../../common/view/LightWaveGeneratorNode.js';
import Perspective3DNode from '../../common/view/Perspective3DNode.js';
import SceneToggleNode from '../../common/view/SceneToggleNode.js';
import SoundParticleCanvasLayer from '../../common/view/SoundParticleCanvasLayer.js';
import SoundParticleImageLayer from '../../common/view/SoundParticleImageLayer.js';
import SoundWaveGeneratorNode from '../../common/view/SoundWaveGeneratorNode.js';
import ToolboxPanel from '../../common/view/ToolboxPanel.js';
import ViewpointRadioButtonGroup from '../../common/view/ViewpointRadioButtonGroup.js';
import WaterDropLayer from '../../common/view/WaterDropLayer.js';
import WaterSideViewNode from '../../common/view/WaterSideViewNode.js';
import WaterWaveGeneratorNode from '../../common/view/WaterWaveGeneratorNode.js';
import WaveAreaGraphNode from '../../common/view/WaveAreaGraphNode.js';
import WaveAreaNode from '../../common/view/WaveAreaNode.js';
import WaveInterferenceControlPanel from '../../common/view/WaveInterferenceControlPanel.js';
import WaveInterferenceStopwatchNode from '../../common/view/WaveInterferenceStopwatchNode.js';
import WaveMeterNode from '../../common/view/WaveMeterNode.js';
import WaveInterferenceConstants from '../../common/WaveInterferenceConstants.js';
import WaveInterferenceUtils from '../../common/WaveInterferenceUtils.js';
import waveInterference from '../../waveInterference.js';
import WavesModel from '../model/WavesModel.js';
import WavesScreenSoundView from './WavesScreenSoundView.js';

// constants
const MARGIN = WaveInterferenceConstants.MARGIN;
const SPACING = 6;
const WAVE_MARGIN = 8; // Additional margin shown around the wave lattice
const WATER_BLUE = WaveInterferenceConstants.WATER_SIDE_COLOR;
const fromFemto = WaveInterferenceUtils.fromFemto;
class WavesScreenView extends ScreenView {
  // shows the background of the wave area for sound view and used for layout

  /**
   * @param model
   * @param alignGroup - for aligning the control panels on the right side of the lattice
   * @param [options]
   */
  constructor(model, alignGroup, options) {
    options = merge({
      // Only allow side view in single source/no slits context
      showViewpointRadioButtonGroup: false,
      // Allow the user to choose between pulse and continuous.
      showPulseContinuousRadioButtons: true,
      // If true, Nodes will be added that show each wave generator, otherwise none are shown.
      showSceneSpecificWaveGeneratorNodes: true,
      // Scale factor for the brightness on the LightScreenNode,
      // see https://github.com/phetsims/wave-interference/issues/161
      piecewiseLinearBrightness: false,
      lightScreenAveragingWindowSize: 3,
      // Nested options as discussed in https://github.com/phetsims/tasks/issues/730,
      // see WaveInterferenceControlPanel for keys/values
      controlPanelOptions: {},
      audioEnabled: false
    }, options);
    super();

    // Sounds for grab and release
    const soundClipOptions = {
      initialOutputLevel: 0.4
    };
    const grabSound = new SoundClip(grab_mp3, soundClipOptions);
    soundManager.addSoundGenerator(grabSound, {
      categoryName: 'user-interface'
    });
    const releaseSound = new SoundClip(release_mp3, soundClipOptions);
    soundManager.addSoundGenerator(releaseSound, {
      categoryName: 'user-interface'
    });

    // @private
    this.model = model;

    // @private - shows the background of the wave area for sound view and used for layout
    this.waveAreaNode = new WaveAreaNode({
      top: MARGIN + WAVE_MARGIN + 15,
      centerX: this.layoutBounds.centerX - 142
    });
    this.addChild(this.waveAreaNode);

    // Initialize the view-related transforms in Scene
    model.scenes.forEach(scene => scene.setViewBounds(this.waveAreaNode.bounds));

    // Thin border to distinguish between the lattice node and the light screen.  This is not part of the
    // waveAreaNode because that would extend its bounds
    const borderNode = Rectangle.bounds(this.waveAreaNode.bounds.dilated(1), {
      stroke: 'white',
      lineWidth: 1
    });

    // @protected {Node} placeholder for z-ordering for subclasses
    this.afterWaveAreaNode = new Node();

    // show the length scale at the top left of the wave area
    const lengthScaleIndicatorNode = new SceneToggleNode(model, scene => new LengthScaleIndicatorNode(scene.scaleIndicatorLength * this.waveAreaNode.width / scene.waveAreaWidth, scene.scaleIndicatorText), {
      alignChildren: ToggleNode.LEFT,
      bottom: this.waveAreaNode.top - 2,
      left: this.waveAreaNode.left
    });
    this.addChild(lengthScaleIndicatorNode);

    // show the time scale at the top right of the wave area
    const timeScaleIndicatorNode = new SceneToggleNode(model, scene => new RichText(scene.timeScaleString, {
      font: WaveInterferenceConstants.TIME_AND_LENGTH_SCALE_INDICATOR_FONT
    }), {
      alignChildren: ToggleNode.RIGHT,
      bottom: this.waveAreaNode.top - 2,
      right: this.waveAreaNode.right,
      maxWidth: 300
    });
    this.addChild(timeScaleIndicatorNode);
    const waveAreaGraphNode = new WaveAreaGraphNode(model, this.waveAreaNode.bounds, {
      x: this.waveAreaNode.left,
      centerY: this.waveAreaNode.top + this.waveAreaNode.height * 0.75
    });
    const dashedLineNode = new DashedLineNode({
      x: this.waveAreaNode.left,
      centerY: this.waveAreaNode.centerY
    });
    const resetAllButton = new ResetAllButton({
      listener: () => model.reset(),
      right: this.layoutBounds.right - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    });

    // Create the canvases to render the lattices

    let waterDropLayer = null;
    if (model.waterScene) {
      this.waterCanvasNode = new LatticeCanvasNode(model.waterScene.lattice, {
        baseColor: WATER_BLUE
      });
      waterDropLayer = new WaterDropLayer(model, this.waveAreaNode.bounds);
    }
    let soundParticleLayer = null;
    if (model.soundScene) {
      this.soundCanvasNode = new LatticeCanvasNode(model.soundScene.lattice, {
        baseColor: Color.white
      });
      const createSoundParticleLayer = () => {
        // Too much garbage on firefox, so only opt in to WebGL for mobile safari (where it is needed most)
        // and where the garbage doesn't seem to slow it down much.
        const useWebgl = phet.chipper.queryParameters.webgl && platform.mobileSafari && Utils.isWebGLSupported;
        const node = useWebgl ? new SoundParticleImageLayer(model, this.waveAreaNode.bounds, {
          center: this.waveAreaNode.center
        }) : new SoundParticleCanvasLayer(model, this.waveAreaNode.bounds, {
          center: this.waveAreaNode.center
        });

        // Don't let the particles appear outside of the wave area.  This works on the canvas layer but not webgl.
        node.clipArea = Shape.bounds(this.waveAreaNode.bounds).transformed(Matrix3.translation(-node.x, -node.y));

        // Note: Clipping is not enabled on mobileSafari, see https://github.com/phetsims/wave-interference/issues/322
        return node;
      };

      // Show the sound particles for the sound Scene, or a placeholder for the Slits screen, which does not show
      // SoundParticles
      soundParticleLayer = model.soundScene.showSoundParticles ? createSoundParticleLayer() : new Node();
    }
    if (model.lightScene) {
      this.lightCanvasNode = new LatticeCanvasNode(model.lightScene.lattice);
    }
    this.sceneToNode = scene => scene === model.waterScene ? this.waterCanvasNode : scene === model.soundScene ? this.soundCanvasNode : this.lightCanvasNode;
    this.latticeNode = new SceneToggleNode(model, this.sceneToNode);
    model.showWavesProperty.linkAttribute(this.latticeNode, 'visible');
    const latticeScale = this.waveAreaNode.width / this.latticeNode.width;
    this.latticeNode.mutate({
      scale: latticeScale,
      center: this.waveAreaNode.center
    });
    let lightScreenNode = null;
    if (model.lightScene) {
      lightScreenNode = new LightScreenNode(model.lightScene.lattice, model.lightScene.intensitySample, {
        piecewiseLinearBrightness: options.piecewiseLinearBrightness,
        lightScreenAveragingWindowSize: options.lightScreenAveragingWindowSize,
        scale: latticeScale,
        left: this.waveAreaNode.right + 5,
        y: this.waveAreaNode.top
      });

      // Screen & Intensity graph should only be available for light scenes. Remove it from water and sound.
      Multilink.multilink([model.showScreenProperty, model.sceneProperty], (showScreen, scene) => {
        lightScreenNode.visible = showScreen && scene === model.lightScene;
      });

      // Set the color of highlight on the screen and lattice
      model.lightScene.frequencyProperty.link(lightFrequency => {
        const baseColor = VisibleColor.frequencyToColor(fromFemto(lightFrequency));
        this.lightCanvasNode.setBaseColor(baseColor);
        this.lightCanvasNode.vacuumColor = Color.black;
        lightScreenNode.setBaseColor(baseColor);
      });
      model.showScreenProperty.linkAttribute(lightScreenNode, 'visible');
      this.addChild(lightScreenNode);
    }
    this.addChild(this.latticeNode);
    this.addChild(borderNode);
    if (model.lightScene) {
      // Match the size of the scale indicator
      const numberGridLines = model.lightScene.waveAreaWidth / model.lightScene.scaleIndicatorLength;
      const intensityGraphPanel = new IntensityGraphPanel(this.latticeNode.height, model.lightScene.intensitySample, numberGridLines, model.resetEmitter, {
        left: lightScreenNode.right + 5
      });
      Multilink.multilink([model.showScreenProperty, model.showIntensityGraphProperty, model.sceneProperty], (showScreen, showIntensityGraph, scene) => {
        // Screen & Intensity graph should only be available for light scenes. Remove it from water and sound.
        intensityGraphPanel.visible = showScreen && showIntensityGraph && scene === model.lightScene;
      });
      this.addChild(intensityGraphPanel);

      // Make sure the charting area is perfectly aligned with the wave area
      intensityGraphPanel.translate(0, this.latticeNode.globalBounds.top - intensityGraphPanel.getChartGlobalBounds().top);
    }

    /**
     * Return the measuring tape Property value for the specified scene.  See MeasuringTapeNode constructor docs.
     * @param scene
     */
    const getMeasuringTapeValue = scene => {
      return {
        name: scene.translatedPositionUnits,
        // The measuring tape tip and tail are in the view coordinate frame, this scale factor converts to model
        // coordinates according to the scene
        multiplier: scene.waveAreaWidth / this.waveAreaNode.width
      };
    };
    const measuringTapeProperty = new Property(getMeasuringTapeValue(model.sceneProperty.value));
    model.sceneProperty.link(scene => measuringTapeProperty.set(getMeasuringTapeValue(scene)));

    /**
     * Checks if the toolbox intersects the given bounds, to see if a tool can be dropped back into the toolbox.
     */
    const toolboxIntersects = b => toolboxPanel.parentToGlobalBounds(toolboxPanel.bounds).intersectsBounds(b);
    const measuringTapeNode = new MeasuringTapeNode(measuringTapeProperty, {
      // translucent white background, same value as in Projectile Motion, see https://github.com/phetsims/projectile-motion/issues/156
      textBackgroundColor: 'rgba( 255, 255, 255, 0.6 )',
      textColor: 'black',
      basePositionProperty: model.measuringTapeBasePositionProperty,
      tipPositionProperty: model.measuringTapeTipPositionProperty,
      baseDragStarted: () => {
        grabSound.play();
      },
      // Drop in toolbox
      baseDragEnded: () => {
        releaseSound.play();
        if (toolboxIntersects(measuringTapeNode.localToGlobalBounds(measuringTapeNode.getLocalBaseBounds()))) {
          model.isMeasuringTapeInPlayAreaProperty.value = false;

          // Reset the rotation and length of the Measuring Tape when it is returned to the toolbox.
          measuringTapeNode.reset();
        }
      }
    });
    this.visibleBoundsProperty.link(visibleBounds => measuringTapeNode.setDragBounds(visibleBounds.eroded(20)));
    model.isMeasuringTapeInPlayAreaProperty.linkAttribute(measuringTapeNode, 'visible');
    const stopwatchNode = new WaveInterferenceStopwatchNode(model, {
      dragBoundsProperty: this.visibleBoundsProperty,
      dragListenerOptions: {
        start: () => {
          grabSound.play();
        },
        end: () => {
          releaseSound.play();
          if (toolboxIntersects(stopwatchNode.parentToGlobalBounds(stopwatchNode.bounds))) {
            model.stopwatch.reset();
          }
        }
      }
    });
    const waveMeterNode = new WaveMeterNode(model, this);
    model.resetEmitter.addListener(() => waveMeterNode.reset());
    model.resetEmitter.addListener(() => measuringTapeNode.reset());
    model.isWaveMeterInPlayAreaProperty.link(inPlayArea => waveMeterNode.setVisible(inPlayArea));

    // Original bounds of the waveMeterNode so we can set the draggable bounds accordingly, so it can go edge to edge
    // in every dimension.
    const bounds = waveMeterNode.backgroundNode.bounds.copy();

    // Subtract the dimensions from the visible bounds so that it will abut the edge of the screen
    const waveMeterBoundsProperty = new DerivedProperty([this.visibleBoundsProperty], visibleBounds => {
      return new Bounds2(visibleBounds.minX - bounds.minX, visibleBounds.minY - bounds.minY, visibleBounds.maxX - bounds.maxX, visibleBounds.maxY - bounds.maxY);
    });

    // Keep the WaveMeterNode in bounds when the window is reshaped.
    waveMeterBoundsProperty.link(bounds => {
      const closestPointInBounds = bounds.closestPointTo(waveMeterNode.backgroundNode.translation);
      return waveMeterNode.backgroundNode.setTranslation(closestPointInBounds);
    });
    this.waveMeterNode = waveMeterNode;
    waveMeterNode.setDragListener(new DragListener({
      dragBoundsProperty: waveMeterBoundsProperty,
      translateNode: true,
      start: () => {
        grabSound.play();
        waveMeterNode.moveToFront();
        if (waveMeterNode.synchronizeProbePositions) {
          // Align the probes each time the waveMeterNode translates, so they will stay in sync
          waveMeterNode.alignProbesEmitter.emit();
        }
      },
      drag: () => {
        if (waveMeterNode.synchronizeProbePositions) {
          // Align the probes each time the waveMeterNode translates, so they will stay in sync
          waveMeterNode.alignProbesEmitter.emit();
        }
      },
      end: () => {
        releaseSound.play();
        // Drop in toolbox, using the bounds of the entire waveMeterNode since it cannot be centered over the toolbox
        // (too close to the edge of the screen)
        if (toolboxIntersects(waveMeterNode.getBackgroundNodeGlobalBounds())) {
          waveMeterNode.reset();
          model.isWaveMeterInPlayAreaProperty.value = false;
        }

        // Move probes to center line (if water side view model)
        waveMeterNode.droppedEmitter.emit();
        waveMeterNode.synchronizeProbePositions = false;
      }
    }));
    const toolboxPanel = new ToolboxPanel(measuringTapeNode, stopwatchNode, waveMeterNode, alignGroup, model.isMeasuringTapeInPlayAreaProperty, model.measuringTapeTipPositionProperty, model.stopwatch.isVisibleProperty, model.isWaveMeterInPlayAreaProperty);
    const updateToolboxPosition = () => {
      toolboxPanel.mutate({
        right: this.layoutBounds.right - MARGIN,
        top: MARGIN
      });
    };
    updateToolboxPosition();

    // When the alignGroup changes the size of the slitsControlPanel, readjust its positioning.
    toolboxPanel.boundsProperty.lazyLink(updateToolboxPosition);
    this.addChild(toolboxPanel);

    // @protected {WaveInterferenceControlPanel} for subtype layout
    this.controlPanel = new WaveInterferenceControlPanel(model, alignGroup, options.controlPanelOptions, {
      audioEnabled: options.audioEnabled
    });
    const updateControlPanelPosition = () => {
      this.controlPanel.mutate({
        right: this.layoutBounds.right - MARGIN,
        top: toolboxPanel.bottom + SPACING
      });
    };
    updateControlPanelPosition();

    // When the alignGroup changes the size of the slitsControlPanel, readjust its positioning.
    this.controlPanel.boundsProperty.lazyLink(updateControlPanelPosition);
    this.addChild(this.controlPanel);
    if (options.showPulseContinuousRadioButtons) {
      this.addChild(new SceneToggleNode(model, scene => new DisturbanceTypeRadioButtonGroup(scene.disturbanceTypeProperty), {
        bottom: this.waveAreaNode.bottom,
        centerX: (this.waveAreaNode.left + this.layoutBounds.left) / 2
      }));
    }
    if (options.showViewpointRadioButtonGroup) {
      const OFFSET_TO_ALIGN_WITH_TIME_CONTROL_RADIO_BUTTONS = 1.8;
      this.addChild(new ViewpointRadioButtonGroup(model.viewpointProperty, {
        // Match size with TimeControlNode
        radioButtonOptions: {
          radius: new Text('test', {
            font: WaveInterferenceConstants.DEFAULT_FONT
          }).height / 2
        },
        bottom: this.layoutBounds.bottom - MARGIN - OFFSET_TO_ALIGN_WITH_TIME_CONTROL_RADIO_BUTTONS,
        left: this.waveAreaNode.left
      }));
    }
    const timeControlNode = new TimeControlNode(model.isRunningProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      bottom: this.layoutBounds.bottom - MARGIN,
      left: this.waveAreaNode.centerX,
      speedRadioButtonGroupOptions: {
        labelOptions: {
          font: WaveInterferenceConstants.DEFAULT_FONT,
          maxWidth: WaveInterferenceConstants.MAX_WIDTH_VIEWPORT_BUTTON_TEXT
        }
      },
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          // If we need to move forward further than one frame, call advanceTime several times rather than increasing the
          // dt, so the model will behave the same,
          // see https://github.com/phetsims/wave-interference/issues/254
          // and https://github.com/phetsims/wave-interference/issues/226
          listener: () => model.advanceTime(1 / WavesModel.EVENT_RATE, true)
        }
      }
    });

    // Center in the play area
    timeControlNode.center = new Vector2(this.waveAreaNode.centerX, timeControlNode.centerY);

    // @private
    this.stepAction = null;

    // Show the side of the water, when fully rotated and in WATER scene
    let waterSideViewNode = null;
    if (model.waterScene) {
      // Show a gray background for the water to make it easier to see the dotted line in the middle of the screen,
      // and visually partition the play area
      const waterGrayBackground = Rectangle.bounds(this.waveAreaNode.bounds, {
        fill: '#e2e3e5'
      });
      this.addChild(waterGrayBackground);
      waterSideViewNode = new WaterSideViewNode(this.waveAreaNode.bounds, model.waterScene);
      Multilink.multilink([model.rotationAmountProperty, model.sceneProperty], (rotationAmount, scene) => {
        waterSideViewNode.visible = rotationAmount === 1.0 && scene === model.waterScene;
        waterGrayBackground.visible = rotationAmount !== 0 && scene === model.waterScene;
      });
      this.stepAction = new PhetioAction(() => waterDropLayer.step(waterSideViewNode));
    }

    // Update the visibility of the waveAreaNode, latticeNode and soundParticleLayer
    Multilink.multilink([model.rotationAmountProperty, model.isRotatingProperty, model.sceneProperty, model.showWavesProperty, ...(model.soundScene ? [model.soundScene.soundViewTypeProperty] : [])], (rotationAmount, isRotating, scene, showWaves, soundViewType) => {
      const isWaterSideView = rotationAmount === 1 && scene === model.waterScene;
      const isVisiblePerspective = !isRotating && !isWaterSideView;
      this.waveAreaNode.visible = isVisiblePerspective;
      const showLattice = scene === model.soundScene ? isVisiblePerspective && showWaves && soundViewType !== SoundScene.SoundViewType.PARTICLES : isVisiblePerspective;
      this.latticeNode.visible = showLattice;
      if (soundParticleLayer) {
        soundParticleLayer.visible = (soundViewType === SoundScene.SoundViewType.PARTICLES || soundViewType === SoundScene.SoundViewType.BOTH) && scene === model.soundScene && isVisiblePerspective;
      }
      if (waterDropLayer) {
        waterDropLayer.visible = scene === model.waterScene;
      }
    });
    Multilink.multilink([model.rotationAmountProperty, model.isRotatingProperty, model.showGraphProperty], (rotationAmount, isRotating, showGraph) => {
      waveAreaGraphNode.visible = !isRotating && showGraph;
      dashedLineNode.visible = !isRotating && showGraph;
    });
    const perspective3DNode = new Perspective3DNode(this.waveAreaNode.bounds, model.rotationAmountProperty, model.isRotatingProperty);

    // Initialize and update the colors based on the scene
    const colorLinkProperties = [model.sceneProperty];
    if (model.lightScene) {
      colorLinkProperties.push(model.lightScene.frequencyProperty);
    }
    Multilink.multilink(colorLinkProperties, (scene, frequency) => {
      perspective3DNode.setTopFaceColor(scene === model.waterScene ? '#3981a9' : scene === model.soundScene ? 'gray' : VisibleColor.frequencyToColor(fromFemto(frequency)));
      perspective3DNode.setSideFaceColor(scene === model.waterScene ? WaveInterferenceConstants.WATER_SIDE_COLOR : scene === model.soundScene ? 'darkGray' : VisibleColor.frequencyToColor(fromFemto(frequency)).colorUtilsDarker(0.15));
    });

    /**
     * Creates a ToggleNode that shows the primary or secondary source
     * @param isPrimarySource - true if it should show the primary source
     */
    const createWaveGeneratorToggleNode = isPrimarySource => {
      const toggleNodeElements = [];
      model.waterScene && toggleNodeElements.push({
        value: model.waterScene,
        createNode: () => new WaterWaveGeneratorNode(model.waterScene, this.waveAreaNode, isPrimarySource)
      });
      model.soundScene && toggleNodeElements.push({
        value: model.soundScene,
        createNode: () => new SoundWaveGeneratorNode(model.soundScene, this.waveAreaNode, isPrimarySource)
      });
      model.lightScene && toggleNodeElements.push({
        value: model.lightScene,
        createNode: () => new LightWaveGeneratorNode(model.lightScene, this.waveAreaNode, isPrimarySource)
      });
      return new ToggleNode(model.sceneProperty, toggleNodeElements, {
        alignChildren: ToggleNode.NONE
      });
    };
    this.addChild(perspective3DNode);
    if (model.waterScene) {
      this.addChild(waterDropLayer);
      this.addChild(waterSideViewNode);
    }
    if (options.showSceneSpecificWaveGeneratorNodes) {
      const primaryWaveGeneratorToggleNode = createWaveGeneratorToggleNode(true);
      this.addChild(primaryWaveGeneratorToggleNode); // Primary source

      this.pdomPlayAreaNode.pdomOrder = [primaryWaveGeneratorToggleNode, null];

      // Secondary source
      if (model.numberOfSources === 2) {
        this.addChild(createWaveGeneratorToggleNode(false));
      }
    } else {
      // @protected - placeholder for alternative wave generator nodes
      this.waveGeneratorLayer = new Node();
      this.addChild(this.waveGeneratorLayer);
    }
    this.addChild(timeControlNode);
    this.addChild(resetAllButton);
    soundParticleLayer && this.addChild(soundParticleLayer);
    this.addChild(dashedLineNode);
    this.addChild(this.afterWaveAreaNode);
    this.addChild(waveAreaGraphNode);
    this.addChild(measuringTapeNode);
    this.addChild(stopwatchNode);
    this.addChild(waveMeterNode);

    // Only start up the audio system if sound is enabled for this screen
    if (options.audioEnabled) {
      // @private
      this.wavesScreenSoundView = new WavesScreenSoundView(model, this, options);
    }
  }
  globalToLatticeCoordinate(point) {
    const latticeNode = this.sceneToNode(this.model.sceneProperty.value);
    const localPoint = latticeNode.globalToLocalPoint(point);
    return LatticeCanvasNode.localPointToLatticePoint(localPoint);
  }

  /**
   * Notify listeners of the step phase.
   */
  step(dt) {
    this.stepAction && this.stepAction.execute();
  }
}

/**
 * @static
 * @public
 */
WavesScreenView.SPACING = SPACING;
waveInterference.register('WavesScreenView', WavesScreenView);
export default WavesScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRyaXgzIiwiVmVjdG9yMiIsIlNjcmVlblZpZXciLCJTaGFwZSIsIm1lcmdlIiwicGxhdGZvcm0iLCJSZXNldEFsbEJ1dHRvbiIsIk1lYXN1cmluZ1RhcGVOb2RlIiwiVGltZUNvbnRyb2xOb2RlIiwiVmlzaWJsZUNvbG9yIiwiQ29sb3IiLCJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiUmljaFRleHQiLCJUZXh0IiwiVXRpbHMiLCJUb2dnbGVOb2RlIiwiU291bmRDbGlwIiwic291bmRNYW5hZ2VyIiwiZ3JhYl9tcDMiLCJyZWxlYXNlX21wMyIsIlBoZXRpb0FjdGlvbiIsIlNvdW5kU2NlbmUiLCJEYXNoZWRMaW5lTm9kZSIsIkRpc3R1cmJhbmNlVHlwZVJhZGlvQnV0dG9uR3JvdXAiLCJJbnRlbnNpdHlHcmFwaFBhbmVsIiwiTGF0dGljZUNhbnZhc05vZGUiLCJMZW5ndGhTY2FsZUluZGljYXRvck5vZGUiLCJMaWdodFNjcmVlbk5vZGUiLCJMaWdodFdhdmVHZW5lcmF0b3JOb2RlIiwiUGVyc3BlY3RpdmUzRE5vZGUiLCJTY2VuZVRvZ2dsZU5vZGUiLCJTb3VuZFBhcnRpY2xlQ2FudmFzTGF5ZXIiLCJTb3VuZFBhcnRpY2xlSW1hZ2VMYXllciIsIlNvdW5kV2F2ZUdlbmVyYXRvck5vZGUiLCJUb29sYm94UGFuZWwiLCJWaWV3cG9pbnRSYWRpb0J1dHRvbkdyb3VwIiwiV2F0ZXJEcm9wTGF5ZXIiLCJXYXRlclNpZGVWaWV3Tm9kZSIsIldhdGVyV2F2ZUdlbmVyYXRvck5vZGUiLCJXYXZlQXJlYUdyYXBoTm9kZSIsIldhdmVBcmVhTm9kZSIsIldhdmVJbnRlcmZlcmVuY2VDb250cm9sUGFuZWwiLCJXYXZlSW50ZXJmZXJlbmNlU3RvcHdhdGNoTm9kZSIsIldhdmVNZXRlck5vZGUiLCJXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIiwiV2F2ZUludGVyZmVyZW5jZVV0aWxzIiwid2F2ZUludGVyZmVyZW5jZSIsIldhdmVzTW9kZWwiLCJXYXZlc1NjcmVlblNvdW5kVmlldyIsIk1BUkdJTiIsIlNQQUNJTkciLCJXQVZFX01BUkdJTiIsIldBVEVSX0JMVUUiLCJXQVRFUl9TSURFX0NPTE9SIiwiZnJvbUZlbXRvIiwiV2F2ZXNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImFsaWduR3JvdXAiLCJvcHRpb25zIiwic2hvd1ZpZXdwb2ludFJhZGlvQnV0dG9uR3JvdXAiLCJzaG93UHVsc2VDb250aW51b3VzUmFkaW9CdXR0b25zIiwic2hvd1NjZW5lU3BlY2lmaWNXYXZlR2VuZXJhdG9yTm9kZXMiLCJwaWVjZXdpc2VMaW5lYXJCcmlnaHRuZXNzIiwibGlnaHRTY3JlZW5BdmVyYWdpbmdXaW5kb3dTaXplIiwiY29udHJvbFBhbmVsT3B0aW9ucyIsImF1ZGlvRW5hYmxlZCIsInNvdW5kQ2xpcE9wdGlvbnMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJncmFiU291bmQiLCJhZGRTb3VuZEdlbmVyYXRvciIsImNhdGVnb3J5TmFtZSIsInJlbGVhc2VTb3VuZCIsIndhdmVBcmVhTm9kZSIsInRvcCIsImNlbnRlclgiLCJsYXlvdXRCb3VuZHMiLCJhZGRDaGlsZCIsInNjZW5lcyIsImZvckVhY2giLCJzY2VuZSIsInNldFZpZXdCb3VuZHMiLCJib3VuZHMiLCJib3JkZXJOb2RlIiwiZGlsYXRlZCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImFmdGVyV2F2ZUFyZWFOb2RlIiwibGVuZ3RoU2NhbGVJbmRpY2F0b3JOb2RlIiwic2NhbGVJbmRpY2F0b3JMZW5ndGgiLCJ3aWR0aCIsIndhdmVBcmVhV2lkdGgiLCJzY2FsZUluZGljYXRvclRleHQiLCJhbGlnbkNoaWxkcmVuIiwiTEVGVCIsImJvdHRvbSIsImxlZnQiLCJ0aW1lU2NhbGVJbmRpY2F0b3JOb2RlIiwidGltZVNjYWxlU3RyaW5nIiwiZm9udCIsIlRJTUVfQU5EX0xFTkdUSF9TQ0FMRV9JTkRJQ0FUT1JfRk9OVCIsIlJJR0hUIiwicmlnaHQiLCJtYXhXaWR0aCIsIndhdmVBcmVhR3JhcGhOb2RlIiwieCIsImNlbnRlclkiLCJoZWlnaHQiLCJkYXNoZWRMaW5lTm9kZSIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJyZXNldCIsIndhdGVyRHJvcExheWVyIiwid2F0ZXJTY2VuZSIsIndhdGVyQ2FudmFzTm9kZSIsImxhdHRpY2UiLCJiYXNlQ29sb3IiLCJzb3VuZFBhcnRpY2xlTGF5ZXIiLCJzb3VuZFNjZW5lIiwic291bmRDYW52YXNOb2RlIiwid2hpdGUiLCJjcmVhdGVTb3VuZFBhcnRpY2xlTGF5ZXIiLCJ1c2VXZWJnbCIsInBoZXQiLCJjaGlwcGVyIiwicXVlcnlQYXJhbWV0ZXJzIiwid2ViZ2wiLCJtb2JpbGVTYWZhcmkiLCJpc1dlYkdMU3VwcG9ydGVkIiwibm9kZSIsImNlbnRlciIsImNsaXBBcmVhIiwidHJhbnNmb3JtZWQiLCJ0cmFuc2xhdGlvbiIsInkiLCJzaG93U291bmRQYXJ0aWNsZXMiLCJsaWdodFNjZW5lIiwibGlnaHRDYW52YXNOb2RlIiwic2NlbmVUb05vZGUiLCJsYXR0aWNlTm9kZSIsInNob3dXYXZlc1Byb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImxhdHRpY2VTY2FsZSIsIm11dGF0ZSIsInNjYWxlIiwibGlnaHRTY3JlZW5Ob2RlIiwiaW50ZW5zaXR5U2FtcGxlIiwibXVsdGlsaW5rIiwic2hvd1NjcmVlblByb3BlcnR5Iiwic2NlbmVQcm9wZXJ0eSIsInNob3dTY3JlZW4iLCJ2aXNpYmxlIiwiZnJlcXVlbmN5UHJvcGVydHkiLCJsaW5rIiwibGlnaHRGcmVxdWVuY3kiLCJmcmVxdWVuY3lUb0NvbG9yIiwic2V0QmFzZUNvbG9yIiwidmFjdXVtQ29sb3IiLCJibGFjayIsIm51bWJlckdyaWRMaW5lcyIsImludGVuc2l0eUdyYXBoUGFuZWwiLCJyZXNldEVtaXR0ZXIiLCJzaG93SW50ZW5zaXR5R3JhcGhQcm9wZXJ0eSIsInNob3dJbnRlbnNpdHlHcmFwaCIsInRyYW5zbGF0ZSIsImdsb2JhbEJvdW5kcyIsImdldENoYXJ0R2xvYmFsQm91bmRzIiwiZ2V0TWVhc3VyaW5nVGFwZVZhbHVlIiwibmFtZSIsInRyYW5zbGF0ZWRQb3NpdGlvblVuaXRzIiwibXVsdGlwbGllciIsIm1lYXN1cmluZ1RhcGVQcm9wZXJ0eSIsInZhbHVlIiwic2V0IiwidG9vbGJveEludGVyc2VjdHMiLCJiIiwidG9vbGJveFBhbmVsIiwicGFyZW50VG9HbG9iYWxCb3VuZHMiLCJpbnRlcnNlY3RzQm91bmRzIiwibWVhc3VyaW5nVGFwZU5vZGUiLCJ0ZXh0QmFja2dyb3VuZENvbG9yIiwidGV4dENvbG9yIiwiYmFzZVBvc2l0aW9uUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlQmFzZVBvc2l0aW9uUHJvcGVydHkiLCJ0aXBQb3NpdGlvblByb3BlcnR5IiwibWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkiLCJiYXNlRHJhZ1N0YXJ0ZWQiLCJwbGF5IiwiYmFzZURyYWdFbmRlZCIsImxvY2FsVG9HbG9iYWxCb3VuZHMiLCJnZXRMb2NhbEJhc2VCb3VuZHMiLCJpc01lYXN1cmluZ1RhcGVJblBsYXlBcmVhUHJvcGVydHkiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJ2aXNpYmxlQm91bmRzIiwic2V0RHJhZ0JvdW5kcyIsImVyb2RlZCIsInN0b3B3YXRjaE5vZGUiLCJkcmFnQm91bmRzUHJvcGVydHkiLCJkcmFnTGlzdGVuZXJPcHRpb25zIiwic3RhcnQiLCJlbmQiLCJzdG9wd2F0Y2giLCJ3YXZlTWV0ZXJOb2RlIiwiYWRkTGlzdGVuZXIiLCJpc1dhdmVNZXRlckluUGxheUFyZWFQcm9wZXJ0eSIsImluUGxheUFyZWEiLCJzZXRWaXNpYmxlIiwiYmFja2dyb3VuZE5vZGUiLCJjb3B5Iiwid2F2ZU1ldGVyQm91bmRzUHJvcGVydHkiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwiY2xvc2VzdFBvaW50SW5Cb3VuZHMiLCJjbG9zZXN0UG9pbnRUbyIsInNldFRyYW5zbGF0aW9uIiwic2V0RHJhZ0xpc3RlbmVyIiwidHJhbnNsYXRlTm9kZSIsIm1vdmVUb0Zyb250Iiwic3luY2hyb25pemVQcm9iZVBvc2l0aW9ucyIsImFsaWduUHJvYmVzRW1pdHRlciIsImVtaXQiLCJkcmFnIiwiZ2V0QmFja2dyb3VuZE5vZGVHbG9iYWxCb3VuZHMiLCJkcm9wcGVkRW1pdHRlciIsImlzVmlzaWJsZVByb3BlcnR5IiwidXBkYXRlVG9vbGJveFBvc2l0aW9uIiwiYm91bmRzUHJvcGVydHkiLCJsYXp5TGluayIsImNvbnRyb2xQYW5lbCIsInVwZGF0ZUNvbnRyb2xQYW5lbFBvc2l0aW9uIiwiZGlzdHVyYmFuY2VUeXBlUHJvcGVydHkiLCJPRkZTRVRfVE9fQUxJR05fV0lUSF9USU1FX0NPTlRST0xfUkFESU9fQlVUVE9OUyIsInZpZXdwb2ludFByb3BlcnR5IiwicmFkaW9CdXR0b25PcHRpb25zIiwicmFkaXVzIiwiREVGQVVMVF9GT05UIiwidGltZUNvbnRyb2xOb2RlIiwiaXNSdW5uaW5nUHJvcGVydHkiLCJ0aW1lU3BlZWRQcm9wZXJ0eSIsInNwZWVkUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMiLCJsYWJlbE9wdGlvbnMiLCJNQVhfV0lEVEhfVklFV1BPUlRfQlVUVE9OX1RFWFQiLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsInN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9ucyIsImFkdmFuY2VUaW1lIiwiRVZFTlRfUkFURSIsInN0ZXBBY3Rpb24iLCJ3YXRlclNpZGVWaWV3Tm9kZSIsIndhdGVyR3JheUJhY2tncm91bmQiLCJmaWxsIiwicm90YXRpb25BbW91bnRQcm9wZXJ0eSIsInJvdGF0aW9uQW1vdW50Iiwic3RlcCIsImlzUm90YXRpbmdQcm9wZXJ0eSIsInNvdW5kVmlld1R5cGVQcm9wZXJ0eSIsImlzUm90YXRpbmciLCJzaG93V2F2ZXMiLCJzb3VuZFZpZXdUeXBlIiwiaXNXYXRlclNpZGVWaWV3IiwiaXNWaXNpYmxlUGVyc3BlY3RpdmUiLCJzaG93TGF0dGljZSIsIlNvdW5kVmlld1R5cGUiLCJQQVJUSUNMRVMiLCJCT1RIIiwic2hvd0dyYXBoUHJvcGVydHkiLCJzaG93R3JhcGgiLCJwZXJzcGVjdGl2ZTNETm9kZSIsImNvbG9yTGlua1Byb3BlcnRpZXMiLCJwdXNoIiwiZnJlcXVlbmN5Iiwic2V0VG9wRmFjZUNvbG9yIiwic2V0U2lkZUZhY2VDb2xvciIsImNvbG9yVXRpbHNEYXJrZXIiLCJjcmVhdGVXYXZlR2VuZXJhdG9yVG9nZ2xlTm9kZSIsImlzUHJpbWFyeVNvdXJjZSIsInRvZ2dsZU5vZGVFbGVtZW50cyIsImNyZWF0ZU5vZGUiLCJOT05FIiwicHJpbWFyeVdhdmVHZW5lcmF0b3JUb2dnbGVOb2RlIiwicGRvbVBsYXlBcmVhTm9kZSIsInBkb21PcmRlciIsIm51bWJlck9mU291cmNlcyIsIndhdmVHZW5lcmF0b3JMYXllciIsIndhdmVzU2NyZWVuU291bmRWaWV3IiwiZ2xvYmFsVG9MYXR0aWNlQ29vcmRpbmF0ZSIsInBvaW50IiwibG9jYWxQb2ludCIsImdsb2JhbFRvTG9jYWxQb2ludCIsImxvY2FsUG9pbnRUb0xhdHRpY2VQb2ludCIsImR0IiwiZXhlY3V0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F2ZXNTY3JlZW5WaWV3LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBAdHMtbm9jaGVja1xyXG4vKipcclxuICogVmlldyBmb3IgdGhlIFwiV2F2ZXNcIiBzY3JlZW4uICBFeHRlbmRlZCBmb3IgdGhlIEludGVyZmVyZW5jZSBhbmQgU2xpdHMgc2NyZWVucy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0cml4MyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTWF0cml4My5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBwbGF0Zm9ybSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgTWVhc3VyaW5nVGFwZU5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01lYXN1cmluZ1RhcGVOb2RlLmpzJztcclxuaW1wb3J0IFRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVGltZUNvbnRyb2xOb2RlLmpzJztcclxuaW1wb3J0IFZpc2libGVDb2xvciBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVmlzaWJsZUNvbG9yLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIERyYWdMaXN0ZW5lciwgTm9kZSwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCwgVXRpbHMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVG9nZ2xlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVG9nZ2xlTm9kZS5qcyc7XHJcbmltcG9ydCBTb3VuZENsaXAgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmQtZ2VuZXJhdG9ycy9Tb3VuZENsaXAuanMnO1xyXG5pbXBvcnQgc291bmRNYW5hZ2VyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NvdW5kTWFuYWdlci5qcyc7XHJcbmltcG9ydCBncmFiX21wMyBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9zb3VuZHMvZ3JhYl9tcDMuanMnO1xyXG5pbXBvcnQgcmVsZWFzZV9tcDMgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vc291bmRzL3JlbGVhc2VfbXAzLmpzJztcclxuaW1wb3J0IFBoZXRpb0FjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvQWN0aW9uLmpzJztcclxuaW1wb3J0IFNvdW5kU2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NvdW5kU2NlbmUuanMnO1xyXG5pbXBvcnQgRGFzaGVkTGluZU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRGFzaGVkTGluZU5vZGUuanMnO1xyXG5pbXBvcnQgRGlzdHVyYmFuY2VUeXBlUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9EaXN0dXJiYW5jZVR5cGVSYWRpb0J1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IEludGVuc2l0eUdyYXBoUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvSW50ZW5zaXR5R3JhcGhQYW5lbC5qcyc7XHJcbmltcG9ydCBMYXR0aWNlQ2FudmFzTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MYXR0aWNlQ2FudmFzTm9kZS5qcyc7XHJcbmltcG9ydCBMZW5ndGhTY2FsZUluZGljYXRvck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvTGVuZ3RoU2NhbGVJbmRpY2F0b3JOb2RlLmpzJztcclxuaW1wb3J0IExpZ2h0U2NyZWVuTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MaWdodFNjcmVlbk5vZGUuanMnO1xyXG5pbXBvcnQgTGlnaHRXYXZlR2VuZXJhdG9yTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9MaWdodFdhdmVHZW5lcmF0b3JOb2RlLmpzJztcclxuaW1wb3J0IFBlcnNwZWN0aXZlM0ROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1BlcnNwZWN0aXZlM0ROb2RlLmpzJztcclxuaW1wb3J0IFNjZW5lVG9nZ2xlTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TY2VuZVRvZ2dsZU5vZGUuanMnO1xyXG5pbXBvcnQgU291bmRQYXJ0aWNsZUNhbnZhc0xheWVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NvdW5kUGFydGljbGVDYW52YXNMYXllci5qcyc7XHJcbmltcG9ydCBTb3VuZFBhcnRpY2xlSW1hZ2VMYXllciBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Tb3VuZFBhcnRpY2xlSW1hZ2VMYXllci5qcyc7XHJcbmltcG9ydCBTb3VuZFdhdmVHZW5lcmF0b3JOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NvdW5kV2F2ZUdlbmVyYXRvck5vZGUuanMnO1xyXG5pbXBvcnQgVG9vbGJveFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1Rvb2xib3hQYW5lbC5qcyc7XHJcbmltcG9ydCBWaWV3cG9pbnRSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1ZpZXdwb2ludFJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgV2F0ZXJEcm9wTGF5ZXIgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvV2F0ZXJEcm9wTGF5ZXIuanMnO1xyXG5pbXBvcnQgV2F0ZXJTaWRlVmlld05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvV2F0ZXJTaWRlVmlld05vZGUuanMnO1xyXG5pbXBvcnQgV2F0ZXJXYXZlR2VuZXJhdG9yTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9XYXRlcldhdmVHZW5lcmF0b3JOb2RlLmpzJztcclxuaW1wb3J0IFdhdmVBcmVhR3JhcGhOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1dhdmVBcmVhR3JhcGhOb2RlLmpzJztcclxuaW1wb3J0IFdhdmVBcmVhTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9XYXZlQXJlYU5vZGUuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnRyb2xQYW5lbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9XYXZlSW50ZXJmZXJlbmNlQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VTdG9wd2F0Y2hOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1dhdmVJbnRlcmZlcmVuY2VTdG9wd2F0Y2hOb2RlLmpzJztcclxuaW1wb3J0IFdhdmVNZXRlck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvV2F2ZU1ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VVdGlscyBmcm9tICcuLi8uLi9jb21tb24vV2F2ZUludGVyZmVyZW5jZVV0aWxzLmpzJztcclxuaW1wb3J0IHdhdmVJbnRlcmZlcmVuY2UgZnJvbSAnLi4vLi4vd2F2ZUludGVyZmVyZW5jZS5qcyc7XHJcbmltcG9ydCBXYXZlc01vZGVsIGZyb20gJy4uL21vZGVsL1dhdmVzTW9kZWwuanMnO1xyXG5pbXBvcnQgV2F2ZXNTY3JlZW5Tb3VuZFZpZXcgZnJvbSAnLi9XYXZlc1NjcmVlblNvdW5kVmlldy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgTUFSR0lOID0gV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5NQVJHSU47XHJcbmNvbnN0IFNQQUNJTkcgPSA2O1xyXG5jb25zdCBXQVZFX01BUkdJTiA9IDg7IC8vIEFkZGl0aW9uYWwgbWFyZ2luIHNob3duIGFyb3VuZCB0aGUgd2F2ZSBsYXR0aWNlXHJcbmNvbnN0IFdBVEVSX0JMVUUgPSBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLldBVEVSX1NJREVfQ09MT1I7XHJcbmNvbnN0IGZyb21GZW10byA9IFdhdmVJbnRlcmZlcmVuY2VVdGlscy5mcm9tRmVtdG87XHJcblxyXG5jbGFzcyBXYXZlc1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLy8gc2hvd3MgdGhlIGJhY2tncm91bmQgb2YgdGhlIHdhdmUgYXJlYSBmb3Igc291bmQgdmlldyBhbmQgdXNlZCBmb3IgbGF5b3V0XHJcbiAgcHVibGljIHJlYWRvbmx5IHdhdmVBcmVhTm9kZTogV2F2ZUFyZWFOb2RlO1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gbW9kZWxcclxuICAgKiBAcGFyYW0gYWxpZ25Hcm91cCAtIGZvciBhbGlnbmluZyB0aGUgY29udHJvbCBwYW5lbHMgb24gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGxhdHRpY2VcclxuICAgKiBAcGFyYW0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbCwgYWxpZ25Hcm91cCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIE9ubHkgYWxsb3cgc2lkZSB2aWV3IGluIHNpbmdsZSBzb3VyY2Uvbm8gc2xpdHMgY29udGV4dFxyXG4gICAgICBzaG93Vmlld3BvaW50UmFkaW9CdXR0b25Hcm91cDogZmFsc2UsXHJcblxyXG4gICAgICAvLyBBbGxvdyB0aGUgdXNlciB0byBjaG9vc2UgYmV0d2VlbiBwdWxzZSBhbmQgY29udGludW91cy5cclxuICAgICAgc2hvd1B1bHNlQ29udGludW91c1JhZGlvQnV0dG9uczogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIElmIHRydWUsIE5vZGVzIHdpbGwgYmUgYWRkZWQgdGhhdCBzaG93IGVhY2ggd2F2ZSBnZW5lcmF0b3IsIG90aGVyd2lzZSBub25lIGFyZSBzaG93bi5cclxuICAgICAgc2hvd1NjZW5lU3BlY2lmaWNXYXZlR2VuZXJhdG9yTm9kZXM6IHRydWUsXHJcblxyXG4gICAgICAvLyBTY2FsZSBmYWN0b3IgZm9yIHRoZSBicmlnaHRuZXNzIG9uIHRoZSBMaWdodFNjcmVlbk5vZGUsXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvd2F2ZS1pbnRlcmZlcmVuY2UvaXNzdWVzLzE2MVxyXG4gICAgICBwaWVjZXdpc2VMaW5lYXJCcmlnaHRuZXNzOiBmYWxzZSxcclxuXHJcbiAgICAgIGxpZ2h0U2NyZWVuQXZlcmFnaW5nV2luZG93U2l6ZTogMyxcclxuXHJcbiAgICAgIC8vIE5lc3RlZCBvcHRpb25zIGFzIGRpc2N1c3NlZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFza3MvaXNzdWVzLzczMCxcclxuICAgICAgLy8gc2VlIFdhdmVJbnRlcmZlcmVuY2VDb250cm9sUGFuZWwgZm9yIGtleXMvdmFsdWVzXHJcbiAgICAgIGNvbnRyb2xQYW5lbE9wdGlvbnM6IHt9LFxyXG5cclxuICAgICAgYXVkaW9FbmFibGVkOiBmYWxzZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBTb3VuZHMgZm9yIGdyYWIgYW5kIHJlbGVhc2VcclxuICAgIGNvbnN0IHNvdW5kQ2xpcE9wdGlvbnMgPSB7IGluaXRpYWxPdXRwdXRMZXZlbDogMC40IH07XHJcbiAgICBjb25zdCBncmFiU291bmQgPSBuZXcgU291bmRDbGlwKCBncmFiX21wMywgc291bmRDbGlwT3B0aW9ucyApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBncmFiU291bmQsIHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH0gKTtcclxuXHJcbiAgICBjb25zdCByZWxlYXNlU291bmQgPSBuZXcgU291bmRDbGlwKCByZWxlYXNlX21wMywgc291bmRDbGlwT3B0aW9ucyApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCByZWxlYXNlU291bmQsIHsgY2F0ZWdvcnlOYW1lOiAndXNlci1pbnRlcmZhY2UnIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gc2hvd3MgdGhlIGJhY2tncm91bmQgb2YgdGhlIHdhdmUgYXJlYSBmb3Igc291bmQgdmlldyBhbmQgdXNlZCBmb3IgbGF5b3V0XHJcbiAgICB0aGlzLndhdmVBcmVhTm9kZSA9IG5ldyBXYXZlQXJlYU5vZGUoIHtcclxuICAgICAgdG9wOiBNQVJHSU4gKyBXQVZFX01BUkdJTiArIDE1LFxyXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYIC0gMTQyXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLndhdmVBcmVhTm9kZSApO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdGhlIHZpZXctcmVsYXRlZCB0cmFuc2Zvcm1zIGluIFNjZW5lXHJcbiAgICBtb2RlbC5zY2VuZXMuZm9yRWFjaCggc2NlbmUgPT4gc2NlbmUuc2V0Vmlld0JvdW5kcyggdGhpcy53YXZlQXJlYU5vZGUuYm91bmRzICkgKTtcclxuXHJcbiAgICAvLyBUaGluIGJvcmRlciB0byBkaXN0aW5ndWlzaCBiZXR3ZWVuIHRoZSBsYXR0aWNlIG5vZGUgYW5kIHRoZSBsaWdodCBzY3JlZW4uICBUaGlzIGlzIG5vdCBwYXJ0IG9mIHRoZVxyXG4gICAgLy8gd2F2ZUFyZWFOb2RlIGJlY2F1c2UgdGhhdCB3b3VsZCBleHRlbmQgaXRzIGJvdW5kc1xyXG4gICAgY29uc3QgYm9yZGVyTm9kZSA9IFJlY3RhbmdsZS5ib3VuZHMoIHRoaXMud2F2ZUFyZWFOb2RlLmJvdW5kcy5kaWxhdGVkKCAxICksIHtcclxuICAgICAgc3Ryb2tlOiAnd2hpdGUnLFxyXG4gICAgICBsaW5lV2lkdGg6IDFcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtOb2RlfSBwbGFjZWhvbGRlciBmb3Igei1vcmRlcmluZyBmb3Igc3ViY2xhc3Nlc1xyXG4gICAgdGhpcy5hZnRlcldhdmVBcmVhTm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gc2hvdyB0aGUgbGVuZ3RoIHNjYWxlIGF0IHRoZSB0b3AgbGVmdCBvZiB0aGUgd2F2ZSBhcmVhXHJcbiAgICBjb25zdCBsZW5ndGhTY2FsZUluZGljYXRvck5vZGUgPSBuZXcgU2NlbmVUb2dnbGVOb2RlKFxyXG4gICAgICBtb2RlbCxcclxuICAgICAgc2NlbmUgPT4gbmV3IExlbmd0aFNjYWxlSW5kaWNhdG9yTm9kZSggc2NlbmUuc2NhbGVJbmRpY2F0b3JMZW5ndGggKiB0aGlzLndhdmVBcmVhTm9kZS53aWR0aCAvIHNjZW5lLndhdmVBcmVhV2lkdGgsIHNjZW5lLnNjYWxlSW5kaWNhdG9yVGV4dCApLCB7XHJcbiAgICAgICAgYWxpZ25DaGlsZHJlbjogVG9nZ2xlTm9kZS5MRUZULFxyXG4gICAgICAgIGJvdHRvbTogdGhpcy53YXZlQXJlYU5vZGUudG9wIC0gMixcclxuICAgICAgICBsZWZ0OiB0aGlzLndhdmVBcmVhTm9kZS5sZWZ0XHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGxlbmd0aFNjYWxlSW5kaWNhdG9yTm9kZSApO1xyXG5cclxuICAgIC8vIHNob3cgdGhlIHRpbWUgc2NhbGUgYXQgdGhlIHRvcCByaWdodCBvZiB0aGUgd2F2ZSBhcmVhXHJcbiAgICBjb25zdCB0aW1lU2NhbGVJbmRpY2F0b3JOb2RlID0gbmV3IFNjZW5lVG9nZ2xlTm9kZShcclxuICAgICAgbW9kZWwsXHJcbiAgICAgIHNjZW5lID0+IG5ldyBSaWNoVGV4dCggc2NlbmUudGltZVNjYWxlU3RyaW5nLCB7IGZvbnQ6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuVElNRV9BTkRfTEVOR1RIX1NDQUxFX0lORElDQVRPUl9GT05UIH0gKSwge1xyXG4gICAgICAgIGFsaWduQ2hpbGRyZW46IFRvZ2dsZU5vZGUuUklHSFQsXHJcbiAgICAgICAgYm90dG9tOiB0aGlzLndhdmVBcmVhTm9kZS50b3AgLSAyLFxyXG4gICAgICAgIHJpZ2h0OiB0aGlzLndhdmVBcmVhTm9kZS5yaWdodCxcclxuICAgICAgICBtYXhXaWR0aDogMzAwXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVTY2FsZUluZGljYXRvck5vZGUgKTtcclxuXHJcbiAgICBjb25zdCB3YXZlQXJlYUdyYXBoTm9kZSA9IG5ldyBXYXZlQXJlYUdyYXBoTm9kZSggbW9kZWwsIHRoaXMud2F2ZUFyZWFOb2RlLmJvdW5kcywge1xyXG4gICAgICB4OiB0aGlzLndhdmVBcmVhTm9kZS5sZWZ0LFxyXG4gICAgICBjZW50ZXJZOiB0aGlzLndhdmVBcmVhTm9kZS50b3AgKyB0aGlzLndhdmVBcmVhTm9kZS5oZWlnaHQgKiAwLjc1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZGFzaGVkTGluZU5vZGUgPSBuZXcgRGFzaGVkTGluZU5vZGUoIHtcclxuICAgICAgeDogdGhpcy53YXZlQXJlYU5vZGUubGVmdCxcclxuICAgICAgY2VudGVyWTogdGhpcy53YXZlQXJlYU5vZGUuY2VudGVyWVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBtb2RlbC5yZXNldCgpLFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSBNQVJHSU4sXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gTUFSR0lOXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYW52YXNlcyB0byByZW5kZXIgdGhlIGxhdHRpY2VzXHJcblxyXG4gICAgbGV0IHdhdGVyRHJvcExheWVyID0gbnVsbDtcclxuICAgIGlmICggbW9kZWwud2F0ZXJTY2VuZSApIHtcclxuICAgICAgdGhpcy53YXRlckNhbnZhc05vZGUgPSBuZXcgTGF0dGljZUNhbnZhc05vZGUoIG1vZGVsLndhdGVyU2NlbmUubGF0dGljZSwgeyBiYXNlQ29sb3I6IFdBVEVSX0JMVUUgfSApO1xyXG4gICAgICB3YXRlckRyb3BMYXllciA9IG5ldyBXYXRlckRyb3BMYXllciggbW9kZWwsIHRoaXMud2F2ZUFyZWFOb2RlLmJvdW5kcyApO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBzb3VuZFBhcnRpY2xlTGF5ZXIgPSBudWxsO1xyXG4gICAgaWYgKCBtb2RlbC5zb3VuZFNjZW5lICkge1xyXG4gICAgICB0aGlzLnNvdW5kQ2FudmFzTm9kZSA9IG5ldyBMYXR0aWNlQ2FudmFzTm9kZSggbW9kZWwuc291bmRTY2VuZS5sYXR0aWNlLCB7IGJhc2VDb2xvcjogQ29sb3Iud2hpdGUgfSApO1xyXG5cclxuICAgICAgY29uc3QgY3JlYXRlU291bmRQYXJ0aWNsZUxheWVyID0gKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBUb28gbXVjaCBnYXJiYWdlIG9uIGZpcmVmb3gsIHNvIG9ubHkgb3B0IGluIHRvIFdlYkdMIGZvciBtb2JpbGUgc2FmYXJpICh3aGVyZSBpdCBpcyBuZWVkZWQgbW9zdClcclxuICAgICAgICAvLyBhbmQgd2hlcmUgdGhlIGdhcmJhZ2UgZG9lc24ndCBzZWVtIHRvIHNsb3cgaXQgZG93biBtdWNoLlxyXG4gICAgICAgIGNvbnN0IHVzZVdlYmdsID0gcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy53ZWJnbCAmJiBwbGF0Zm9ybS5tb2JpbGVTYWZhcmkgJiYgVXRpbHMuaXNXZWJHTFN1cHBvcnRlZDtcclxuICAgICAgICBjb25zdCBub2RlID0gdXNlV2ViZ2wgP1xyXG4gICAgICAgICAgICAgICAgICAgICBuZXcgU291bmRQYXJ0aWNsZUltYWdlTGF5ZXIoIG1vZGVsLCB0aGlzLndhdmVBcmVhTm9kZS5ib3VuZHMsIHsgY2VudGVyOiB0aGlzLndhdmVBcmVhTm9kZS5jZW50ZXIgfSApIDpcclxuICAgICAgICAgICAgICAgICAgICAgbmV3IFNvdW5kUGFydGljbGVDYW52YXNMYXllciggbW9kZWwsIHRoaXMud2F2ZUFyZWFOb2RlLmJvdW5kcywgeyBjZW50ZXI6IHRoaXMud2F2ZUFyZWFOb2RlLmNlbnRlciB9ICk7XHJcblxyXG4gICAgICAgIC8vIERvbid0IGxldCB0aGUgcGFydGljbGVzIGFwcGVhciBvdXRzaWRlIG9mIHRoZSB3YXZlIGFyZWEuICBUaGlzIHdvcmtzIG9uIHRoZSBjYW52YXMgbGF5ZXIgYnV0IG5vdCB3ZWJnbC5cclxuICAgICAgICBub2RlLmNsaXBBcmVhID0gU2hhcGUuYm91bmRzKCB0aGlzLndhdmVBcmVhTm9kZS5ib3VuZHMgKS50cmFuc2Zvcm1lZCggTWF0cml4My50cmFuc2xhdGlvbiggLW5vZGUueCwgLW5vZGUueSApICk7XHJcblxyXG4gICAgICAgIC8vIE5vdGU6IENsaXBwaW5nIGlzIG5vdCBlbmFibGVkIG9uIG1vYmlsZVNhZmFyaSwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMzIyXHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvLyBTaG93IHRoZSBzb3VuZCBwYXJ0aWNsZXMgZm9yIHRoZSBzb3VuZCBTY2VuZSwgb3IgYSBwbGFjZWhvbGRlciBmb3IgdGhlIFNsaXRzIHNjcmVlbiwgd2hpY2ggZG9lcyBub3Qgc2hvd1xyXG4gICAgICAvLyBTb3VuZFBhcnRpY2xlc1xyXG4gICAgICBzb3VuZFBhcnRpY2xlTGF5ZXIgPSBtb2RlbC5zb3VuZFNjZW5lLnNob3dTb3VuZFBhcnRpY2xlcyA/IGNyZWF0ZVNvdW5kUGFydGljbGVMYXllcigpIDogbmV3IE5vZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIG1vZGVsLmxpZ2h0U2NlbmUgKSB7XHJcbiAgICAgIHRoaXMubGlnaHRDYW52YXNOb2RlID0gbmV3IExhdHRpY2VDYW52YXNOb2RlKCBtb2RlbC5saWdodFNjZW5lLmxhdHRpY2UgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNjZW5lVG9Ob2RlID0gc2NlbmUgPT4gc2NlbmUgPT09IG1vZGVsLndhdGVyU2NlbmUgPyB0aGlzLndhdGVyQ2FudmFzTm9kZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmUgPT09IG1vZGVsLnNvdW5kU2NlbmUgPyB0aGlzLnNvdW5kQ2FudmFzTm9kZSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saWdodENhbnZhc05vZGU7XHJcbiAgICB0aGlzLmxhdHRpY2VOb2RlID0gbmV3IFNjZW5lVG9nZ2xlTm9kZSggbW9kZWwsIHRoaXMuc2NlbmVUb05vZGUgKTtcclxuICAgIG1vZGVsLnNob3dXYXZlc1Byb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMubGF0dGljZU5vZGUsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIGNvbnN0IGxhdHRpY2VTY2FsZSA9IHRoaXMud2F2ZUFyZWFOb2RlLndpZHRoIC8gdGhpcy5sYXR0aWNlTm9kZS53aWR0aDtcclxuICAgIHRoaXMubGF0dGljZU5vZGUubXV0YXRlKCB7XHJcbiAgICAgIHNjYWxlOiBsYXR0aWNlU2NhbGUsXHJcbiAgICAgIGNlbnRlcjogdGhpcy53YXZlQXJlYU5vZGUuY2VudGVyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgbGV0IGxpZ2h0U2NyZWVuTm9kZSA9IG51bGw7XHJcblxyXG4gICAgaWYgKCBtb2RlbC5saWdodFNjZW5lICkge1xyXG4gICAgICBsaWdodFNjcmVlbk5vZGUgPSBuZXcgTGlnaHRTY3JlZW5Ob2RlKCBtb2RlbC5saWdodFNjZW5lLmxhdHRpY2UsIG1vZGVsLmxpZ2h0U2NlbmUuaW50ZW5zaXR5U2FtcGxlLCB7XHJcbiAgICAgICAgcGllY2V3aXNlTGluZWFyQnJpZ2h0bmVzczogb3B0aW9ucy5waWVjZXdpc2VMaW5lYXJCcmlnaHRuZXNzLFxyXG4gICAgICAgIGxpZ2h0U2NyZWVuQXZlcmFnaW5nV2luZG93U2l6ZTogb3B0aW9ucy5saWdodFNjcmVlbkF2ZXJhZ2luZ1dpbmRvd1NpemUsXHJcbiAgICAgICAgc2NhbGU6IGxhdHRpY2VTY2FsZSxcclxuICAgICAgICBsZWZ0OiB0aGlzLndhdmVBcmVhTm9kZS5yaWdodCArIDUsXHJcbiAgICAgICAgeTogdGhpcy53YXZlQXJlYU5vZGUudG9wXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIFNjcmVlbiAmIEludGVuc2l0eSBncmFwaCBzaG91bGQgb25seSBiZSBhdmFpbGFibGUgZm9yIGxpZ2h0IHNjZW5lcy4gUmVtb3ZlIGl0IGZyb20gd2F0ZXIgYW5kIHNvdW5kLlxyXG4gICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLnNob3dTY3JlZW5Qcm9wZXJ0eSwgbW9kZWwuc2NlbmVQcm9wZXJ0eSBdLCAoIHNob3dTY3JlZW4sIHNjZW5lICkgPT4ge1xyXG4gICAgICAgIGxpZ2h0U2NyZWVuTm9kZS52aXNpYmxlID0gc2hvd1NjcmVlbiAmJiBzY2VuZSA9PT0gbW9kZWwubGlnaHRTY2VuZTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSBjb2xvciBvZiBoaWdobGlnaHQgb24gdGhlIHNjcmVlbiBhbmQgbGF0dGljZVxyXG4gICAgICBtb2RlbC5saWdodFNjZW5lLmZyZXF1ZW5jeVByb3BlcnR5LmxpbmsoIGxpZ2h0RnJlcXVlbmN5ID0+IHtcclxuICAgICAgICBjb25zdCBiYXNlQ29sb3IgPSBWaXNpYmxlQ29sb3IuZnJlcXVlbmN5VG9Db2xvciggZnJvbUZlbXRvKCBsaWdodEZyZXF1ZW5jeSApICk7XHJcbiAgICAgICAgdGhpcy5saWdodENhbnZhc05vZGUuc2V0QmFzZUNvbG9yKCBiYXNlQ29sb3IgKTtcclxuICAgICAgICB0aGlzLmxpZ2h0Q2FudmFzTm9kZS52YWN1dW1Db2xvciA9IENvbG9yLmJsYWNrO1xyXG4gICAgICAgIGxpZ2h0U2NyZWVuTm9kZS5zZXRCYXNlQ29sb3IoIGJhc2VDb2xvciApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIG1vZGVsLnNob3dTY3JlZW5Qcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBsaWdodFNjcmVlbk5vZGUsICd2aXNpYmxlJyApO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZCggbGlnaHRTY3JlZW5Ob2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5sYXR0aWNlTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYm9yZGVyTm9kZSApO1xyXG5cclxuICAgIGlmICggbW9kZWwubGlnaHRTY2VuZSApIHtcclxuXHJcbiAgICAgIC8vIE1hdGNoIHRoZSBzaXplIG9mIHRoZSBzY2FsZSBpbmRpY2F0b3JcclxuICAgICAgY29uc3QgbnVtYmVyR3JpZExpbmVzID0gbW9kZWwubGlnaHRTY2VuZS53YXZlQXJlYVdpZHRoIC8gbW9kZWwubGlnaHRTY2VuZS5zY2FsZUluZGljYXRvckxlbmd0aDtcclxuICAgICAgY29uc3QgaW50ZW5zaXR5R3JhcGhQYW5lbCA9IG5ldyBJbnRlbnNpdHlHcmFwaFBhbmVsKFxyXG4gICAgICAgIHRoaXMubGF0dGljZU5vZGUuaGVpZ2h0LFxyXG4gICAgICAgIG1vZGVsLmxpZ2h0U2NlbmUuaW50ZW5zaXR5U2FtcGxlLFxyXG4gICAgICAgIG51bWJlckdyaWRMaW5lcyxcclxuICAgICAgICBtb2RlbC5yZXNldEVtaXR0ZXIsIHtcclxuICAgICAgICAgIGxlZnQ6IGxpZ2h0U2NyZWVuTm9kZS5yaWdodCArIDVcclxuICAgICAgICB9ICk7XHJcbiAgICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFsgbW9kZWwuc2hvd1NjcmVlblByb3BlcnR5LCBtb2RlbC5zaG93SW50ZW5zaXR5R3JhcGhQcm9wZXJ0eSwgbW9kZWwuc2NlbmVQcm9wZXJ0eSBdLFxyXG4gICAgICAgICggc2hvd1NjcmVlbiwgc2hvd0ludGVuc2l0eUdyYXBoLCBzY2VuZSApID0+IHtcclxuXHJcbiAgICAgICAgICAvLyBTY3JlZW4gJiBJbnRlbnNpdHkgZ3JhcGggc2hvdWxkIG9ubHkgYmUgYXZhaWxhYmxlIGZvciBsaWdodCBzY2VuZXMuIFJlbW92ZSBpdCBmcm9tIHdhdGVyIGFuZCBzb3VuZC5cclxuICAgICAgICAgIGludGVuc2l0eUdyYXBoUGFuZWwudmlzaWJsZSA9IHNob3dTY3JlZW4gJiYgc2hvd0ludGVuc2l0eUdyYXBoICYmIHNjZW5lID09PSBtb2RlbC5saWdodFNjZW5lO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggaW50ZW5zaXR5R3JhcGhQYW5lbCApO1xyXG5cclxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSBjaGFydGluZyBhcmVhIGlzIHBlcmZlY3RseSBhbGlnbmVkIHdpdGggdGhlIHdhdmUgYXJlYVxyXG4gICAgICBpbnRlbnNpdHlHcmFwaFBhbmVsLnRyYW5zbGF0ZShcclxuICAgICAgICAwLCB0aGlzLmxhdHRpY2VOb2RlLmdsb2JhbEJvdW5kcy50b3AgLSBpbnRlbnNpdHlHcmFwaFBhbmVsLmdldENoYXJ0R2xvYmFsQm91bmRzKCkudG9wXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIG1lYXN1cmluZyB0YXBlIFByb3BlcnR5IHZhbHVlIGZvciB0aGUgc3BlY2lmaWVkIHNjZW5lLiAgU2VlIE1lYXN1cmluZ1RhcGVOb2RlIGNvbnN0cnVjdG9yIGRvY3MuXHJcbiAgICAgKiBAcGFyYW0gc2NlbmVcclxuICAgICAqL1xyXG4gICAgY29uc3QgZ2V0TWVhc3VyaW5nVGFwZVZhbHVlID0gc2NlbmUgPT4ge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWU6IHNjZW5lLnRyYW5zbGF0ZWRQb3NpdGlvblVuaXRzLFxyXG5cclxuICAgICAgICAvLyBUaGUgbWVhc3VyaW5nIHRhcGUgdGlwIGFuZCB0YWlsIGFyZSBpbiB0aGUgdmlldyBjb29yZGluYXRlIGZyYW1lLCB0aGlzIHNjYWxlIGZhY3RvciBjb252ZXJ0cyB0byBtb2RlbFxyXG4gICAgICAgIC8vIGNvb3JkaW5hdGVzIGFjY29yZGluZyB0byB0aGUgc2NlbmVcclxuICAgICAgICBtdWx0aXBsaWVyOiBzY2VuZS53YXZlQXJlYVdpZHRoIC8gdGhpcy53YXZlQXJlYU5vZGUud2lkdGhcclxuICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBnZXRNZWFzdXJpbmdUYXBlVmFsdWUoIG1vZGVsLnNjZW5lUHJvcGVydHkudmFsdWUgKSApO1xyXG4gICAgbW9kZWwuc2NlbmVQcm9wZXJ0eS5saW5rKCBzY2VuZSA9PiBtZWFzdXJpbmdUYXBlUHJvcGVydHkuc2V0KCBnZXRNZWFzdXJpbmdUYXBlVmFsdWUoIHNjZW5lICkgKSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSB0b29sYm94IGludGVyc2VjdHMgdGhlIGdpdmVuIGJvdW5kcywgdG8gc2VlIGlmIGEgdG9vbCBjYW4gYmUgZHJvcHBlZCBiYWNrIGludG8gdGhlIHRvb2xib3guXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHRvb2xib3hJbnRlcnNlY3RzID0gYiA9PiB0b29sYm94UGFuZWwucGFyZW50VG9HbG9iYWxCb3VuZHMoIHRvb2xib3hQYW5lbC5ib3VuZHMgKS5pbnRlcnNlY3RzQm91bmRzKCBiICk7XHJcblxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgTWVhc3VyaW5nVGFwZU5vZGUoIG1lYXN1cmluZ1RhcGVQcm9wZXJ0eSwge1xyXG5cclxuICAgICAgLy8gdHJhbnNsdWNlbnQgd2hpdGUgYmFja2dyb3VuZCwgc2FtZSB2YWx1ZSBhcyBpbiBQcm9qZWN0aWxlIE1vdGlvbiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9wcm9qZWN0aWxlLW1vdGlvbi9pc3N1ZXMvMTU2XHJcbiAgICAgIHRleHRCYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKCAyNTUsIDI1NSwgMjU1LCAwLjYgKScsXHJcbiAgICAgIHRleHRDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgYmFzZVBvc2l0aW9uUHJvcGVydHk6IG1vZGVsLm1lYXN1cmluZ1RhcGVCYXNlUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdGlwUG9zaXRpb25Qcm9wZXJ0eTogbW9kZWwubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHksXHJcblxyXG4gICAgICBiYXNlRHJhZ1N0YXJ0ZWQ6ICgpID0+IHtcclxuICAgICAgICBncmFiU291bmQucGxheSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gRHJvcCBpbiB0b29sYm94XHJcbiAgICAgIGJhc2VEcmFnRW5kZWQ6ICgpID0+IHtcclxuICAgICAgICByZWxlYXNlU291bmQucGxheSgpO1xyXG4gICAgICAgIGlmICggdG9vbGJveEludGVyc2VjdHMoIG1lYXN1cmluZ1RhcGVOb2RlLmxvY2FsVG9HbG9iYWxCb3VuZHMoIG1lYXN1cmluZ1RhcGVOb2RlLmdldExvY2FsQmFzZUJvdW5kcygpICkgKSApIHtcclxuICAgICAgICAgIG1vZGVsLmlzTWVhc3VyaW5nVGFwZUluUGxheUFyZWFQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgIC8vIFJlc2V0IHRoZSByb3RhdGlvbiBhbmQgbGVuZ3RoIG9mIHRoZSBNZWFzdXJpbmcgVGFwZSB3aGVuIGl0IGlzIHJldHVybmVkIHRvIHRoZSB0b29sYm94LlxyXG4gICAgICAgICAgbWVhc3VyaW5nVGFwZU5vZGUucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LmxpbmsoIHZpc2libGVCb3VuZHMgPT4gbWVhc3VyaW5nVGFwZU5vZGUuc2V0RHJhZ0JvdW5kcyggdmlzaWJsZUJvdW5kcy5lcm9kZWQoIDIwICkgKSApO1xyXG4gICAgbW9kZWwuaXNNZWFzdXJpbmdUYXBlSW5QbGF5QXJlYVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIG1lYXN1cmluZ1RhcGVOb2RlLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICBjb25zdCBzdG9wd2F0Y2hOb2RlID0gbmV3IFdhdmVJbnRlcmZlcmVuY2VTdG9wd2F0Y2hOb2RlKCBtb2RlbCwge1xyXG4gICAgICBkcmFnQm91bmRzUHJvcGVydHk6IHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LFxyXG5cclxuICAgICAgZHJhZ0xpc3RlbmVyT3B0aW9uczoge1xyXG4gICAgICAgIHN0YXJ0OiAoKSA9PiB7XHJcbiAgICAgICAgICBncmFiU291bmQucGxheSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgICByZWxlYXNlU291bmQucGxheSgpO1xyXG4gICAgICAgICAgaWYgKCB0b29sYm94SW50ZXJzZWN0cyggc3RvcHdhdGNoTm9kZS5wYXJlbnRUb0dsb2JhbEJvdW5kcyggc3RvcHdhdGNoTm9kZS5ib3VuZHMgKSApICkge1xyXG4gICAgICAgICAgICBtb2RlbC5zdG9wd2F0Y2gucmVzZXQoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB3YXZlTWV0ZXJOb2RlID0gbmV3IFdhdmVNZXRlck5vZGUoIG1vZGVsLCB0aGlzICk7XHJcbiAgICBtb2RlbC5yZXNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHdhdmVNZXRlck5vZGUucmVzZXQoKSApO1xyXG4gICAgbW9kZWwucmVzZXRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiBtZWFzdXJpbmdUYXBlTm9kZS5yZXNldCgpICk7XHJcbiAgICBtb2RlbC5pc1dhdmVNZXRlckluUGxheUFyZWFQcm9wZXJ0eS5saW5rKCBpblBsYXlBcmVhID0+IHdhdmVNZXRlck5vZGUuc2V0VmlzaWJsZSggaW5QbGF5QXJlYSApICk7XHJcblxyXG4gICAgLy8gT3JpZ2luYWwgYm91bmRzIG9mIHRoZSB3YXZlTWV0ZXJOb2RlIHNvIHdlIGNhbiBzZXQgdGhlIGRyYWdnYWJsZSBib3VuZHMgYWNjb3JkaW5nbHksIHNvIGl0IGNhbiBnbyBlZGdlIHRvIGVkZ2VcclxuICAgIC8vIGluIGV2ZXJ5IGRpbWVuc2lvbi5cclxuICAgIGNvbnN0IGJvdW5kcyA9IHdhdmVNZXRlck5vZGUuYmFja2dyb3VuZE5vZGUuYm91bmRzLmNvcHkoKTtcclxuXHJcbiAgICAvLyBTdWJ0cmFjdCB0aGUgZGltZW5zaW9ucyBmcm9tIHRoZSB2aXNpYmxlIGJvdW5kcyBzbyB0aGF0IGl0IHdpbGwgYWJ1dCB0aGUgZWRnZSBvZiB0aGUgc2NyZWVuXHJcbiAgICBjb25zdCB3YXZlTWV0ZXJCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkgXSwgdmlzaWJsZUJvdW5kcyA9PiB7XHJcbiAgICAgIHJldHVybiBuZXcgQm91bmRzMihcclxuICAgICAgICB2aXNpYmxlQm91bmRzLm1pblggLSBib3VuZHMubWluWCwgdmlzaWJsZUJvdW5kcy5taW5ZIC0gYm91bmRzLm1pblksXHJcbiAgICAgICAgdmlzaWJsZUJvdW5kcy5tYXhYIC0gYm91bmRzLm1heFgsIHZpc2libGVCb3VuZHMubWF4WSAtIGJvdW5kcy5tYXhZXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gS2VlcCB0aGUgV2F2ZU1ldGVyTm9kZSBpbiBib3VuZHMgd2hlbiB0aGUgd2luZG93IGlzIHJlc2hhcGVkLlxyXG4gICAgd2F2ZU1ldGVyQm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgY29uc3QgY2xvc2VzdFBvaW50SW5Cb3VuZHMgPSBib3VuZHMuY2xvc2VzdFBvaW50VG8oIHdhdmVNZXRlck5vZGUuYmFja2dyb3VuZE5vZGUudHJhbnNsYXRpb24gKTtcclxuICAgICAgcmV0dXJuIHdhdmVNZXRlck5vZGUuYmFja2dyb3VuZE5vZGUuc2V0VHJhbnNsYXRpb24oIGNsb3Nlc3RQb2ludEluQm91bmRzICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLndhdmVNZXRlck5vZGUgPSB3YXZlTWV0ZXJOb2RlO1xyXG4gICAgd2F2ZU1ldGVyTm9kZS5zZXREcmFnTGlzdGVuZXIoIG5ldyBEcmFnTGlzdGVuZXIoIHtcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiB3YXZlTWV0ZXJCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgdHJhbnNsYXRlTm9kZTogdHJ1ZSxcclxuICAgICAgc3RhcnQ6ICgpID0+IHtcclxuICAgICAgICBncmFiU291bmQucGxheSgpO1xyXG4gICAgICAgIHdhdmVNZXRlck5vZGUubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICBpZiAoIHdhdmVNZXRlck5vZGUuc3luY2hyb25pemVQcm9iZVBvc2l0aW9ucyApIHtcclxuXHJcbiAgICAgICAgICAvLyBBbGlnbiB0aGUgcHJvYmVzIGVhY2ggdGltZSB0aGUgd2F2ZU1ldGVyTm9kZSB0cmFuc2xhdGVzLCBzbyB0aGV5IHdpbGwgc3RheSBpbiBzeW5jXHJcbiAgICAgICAgICB3YXZlTWV0ZXJOb2RlLmFsaWduUHJvYmVzRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBkcmFnOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB3YXZlTWV0ZXJOb2RlLnN5bmNocm9uaXplUHJvYmVQb3NpdGlvbnMgKSB7XHJcblxyXG4gICAgICAgICAgLy8gQWxpZ24gdGhlIHByb2JlcyBlYWNoIHRpbWUgdGhlIHdhdmVNZXRlck5vZGUgdHJhbnNsYXRlcywgc28gdGhleSB3aWxsIHN0YXkgaW4gc3luY1xyXG4gICAgICAgICAgd2F2ZU1ldGVyTm9kZS5hbGlnblByb2Jlc0VtaXR0ZXIuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgcmVsZWFzZVNvdW5kLnBsYXkoKTtcclxuICAgICAgICAvLyBEcm9wIGluIHRvb2xib3gsIHVzaW5nIHRoZSBib3VuZHMgb2YgdGhlIGVudGlyZSB3YXZlTWV0ZXJOb2RlIHNpbmNlIGl0IGNhbm5vdCBiZSBjZW50ZXJlZCBvdmVyIHRoZSB0b29sYm94XHJcbiAgICAgICAgLy8gKHRvbyBjbG9zZSB0byB0aGUgZWRnZSBvZiB0aGUgc2NyZWVuKVxyXG4gICAgICAgIGlmICggdG9vbGJveEludGVyc2VjdHMoIHdhdmVNZXRlck5vZGUuZ2V0QmFja2dyb3VuZE5vZGVHbG9iYWxCb3VuZHMoKSApICkge1xyXG4gICAgICAgICAgd2F2ZU1ldGVyTm9kZS5yZXNldCgpO1xyXG4gICAgICAgICAgbW9kZWwuaXNXYXZlTWV0ZXJJblBsYXlBcmVhUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE1vdmUgcHJvYmVzIHRvIGNlbnRlciBsaW5lIChpZiB3YXRlciBzaWRlIHZpZXcgbW9kZWwpXHJcbiAgICAgICAgd2F2ZU1ldGVyTm9kZS5kcm9wcGVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgd2F2ZU1ldGVyTm9kZS5zeW5jaHJvbml6ZVByb2JlUG9zaXRpb25zID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IHRvb2xib3hQYW5lbCA9IG5ldyBUb29sYm94UGFuZWwoIG1lYXN1cmluZ1RhcGVOb2RlLCBzdG9wd2F0Y2hOb2RlLCB3YXZlTWV0ZXJOb2RlLCBhbGlnbkdyb3VwLFxyXG4gICAgICBtb2RlbC5pc01lYXN1cmluZ1RhcGVJblBsYXlBcmVhUHJvcGVydHksIG1vZGVsLm1lYXN1cmluZ1RhcGVUaXBQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5zdG9wd2F0Y2guaXNWaXNpYmxlUHJvcGVydHksIG1vZGVsLmlzV2F2ZU1ldGVySW5QbGF5QXJlYVByb3BlcnR5XHJcbiAgICApO1xyXG4gICAgY29uc3QgdXBkYXRlVG9vbGJveFBvc2l0aW9uID0gKCkgPT4ge1xyXG4gICAgICB0b29sYm94UGFuZWwubXV0YXRlKCB7XHJcbiAgICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gTUFSR0lOLFxyXG4gICAgICAgIHRvcDogTUFSR0lOXHJcbiAgICAgIH0gKTtcclxuICAgIH07XHJcbiAgICB1cGRhdGVUb29sYm94UG9zaXRpb24oKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSBhbGlnbkdyb3VwIGNoYW5nZXMgdGhlIHNpemUgb2YgdGhlIHNsaXRzQ29udHJvbFBhbmVsLCByZWFkanVzdCBpdHMgcG9zaXRpb25pbmcuXHJcbiAgICB0b29sYm94UGFuZWwuYm91bmRzUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZVRvb2xib3hQb3NpdGlvbiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdG9vbGJveFBhbmVsICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCB7V2F2ZUludGVyZmVyZW5jZUNvbnRyb2xQYW5lbH0gZm9yIHN1YnR5cGUgbGF5b3V0XHJcbiAgICB0aGlzLmNvbnRyb2xQYW5lbCA9IG5ldyBXYXZlSW50ZXJmZXJlbmNlQ29udHJvbFBhbmVsKCBtb2RlbCwgYWxpZ25Hcm91cCwgb3B0aW9ucy5jb250cm9sUGFuZWxPcHRpb25zLCB7XHJcbiAgICAgIGF1ZGlvRW5hYmxlZDogb3B0aW9ucy5hdWRpb0VuYWJsZWRcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCB1cGRhdGVDb250cm9sUGFuZWxQb3NpdGlvbiA9ICgpID0+IHtcclxuICAgICAgdGhpcy5jb250cm9sUGFuZWwubXV0YXRlKCB7XHJcbiAgICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gTUFSR0lOLFxyXG4gICAgICAgIHRvcDogdG9vbGJveFBhbmVsLmJvdHRvbSArIFNQQUNJTkdcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuICAgIHVwZGF0ZUNvbnRyb2xQYW5lbFBvc2l0aW9uKCk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgYWxpZ25Hcm91cCBjaGFuZ2VzIHRoZSBzaXplIG9mIHRoZSBzbGl0c0NvbnRyb2xQYW5lbCwgcmVhZGp1c3QgaXRzIHBvc2l0aW9uaW5nLlxyXG4gICAgdGhpcy5jb250cm9sUGFuZWwuYm91bmRzUHJvcGVydHkubGF6eUxpbmsoIHVwZGF0ZUNvbnRyb2xQYW5lbFBvc2l0aW9uICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5zaG93UHVsc2VDb250aW51b3VzUmFkaW9CdXR0b25zICkge1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IFNjZW5lVG9nZ2xlTm9kZShcclxuICAgICAgICBtb2RlbCxcclxuICAgICAgICBzY2VuZSA9PiBuZXcgRGlzdHVyYmFuY2VUeXBlUmFkaW9CdXR0b25Hcm91cCggc2NlbmUuZGlzdHVyYmFuY2VUeXBlUHJvcGVydHkgKSwge1xyXG4gICAgICAgICAgYm90dG9tOiB0aGlzLndhdmVBcmVhTm9kZS5ib3R0b20sXHJcbiAgICAgICAgICBjZW50ZXJYOiAoIHRoaXMud2F2ZUFyZWFOb2RlLmxlZnQgKyB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICkgLyAyXHJcbiAgICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dWaWV3cG9pbnRSYWRpb0J1dHRvbkdyb3VwICkge1xyXG5cclxuICAgICAgY29uc3QgT0ZGU0VUX1RPX0FMSUdOX1dJVEhfVElNRV9DT05UUk9MX1JBRElPX0JVVFRPTlMgPSAxLjg7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBWaWV3cG9pbnRSYWRpb0J1dHRvbkdyb3VwKCBtb2RlbC52aWV3cG9pbnRQcm9wZXJ0eSwge1xyXG5cclxuICAgICAgICAvLyBNYXRjaCBzaXplIHdpdGggVGltZUNvbnRyb2xOb2RlXHJcbiAgICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICByYWRpdXM6IG5ldyBUZXh0KCAndGVzdCcsIHtcclxuICAgICAgICAgICAgZm9udDogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5ERUZBVUxUX0ZPTlRcclxuICAgICAgICAgIH0gKS5oZWlnaHQgLyAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIE1BUkdJTiAtIE9GRlNFVF9UT19BTElHTl9XSVRIX1RJTUVfQ09OVFJPTF9SQURJT19CVVRUT05TLFxyXG4gICAgICAgIGxlZnQ6IHRoaXMud2F2ZUFyZWFOb2RlLmxlZnRcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGltZUNvbnRyb2xOb2RlID0gbmV3IFRpbWVDb250cm9sTm9kZSggbW9kZWwuaXNSdW5uaW5nUHJvcGVydHksIHtcclxuICAgICAgdGltZVNwZWVkUHJvcGVydHk6IG1vZGVsLnRpbWVTcGVlZFByb3BlcnR5LFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIE1BUkdJTixcclxuICAgICAgbGVmdDogdGhpcy53YXZlQXJlYU5vZGUuY2VudGVyWCxcclxuICAgICAgc3BlZWRSYWRpb0J1dHRvbkdyb3VwT3B0aW9uczoge1xyXG4gICAgICAgIGxhYmVsT3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5ERUZBVUxUX0ZPTlQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5NQVhfV0lEVEhfVklFV1BPUlRfQlVUVE9OX1RFWFRcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgc3RlcEZvcndhcmRCdXR0b25PcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgLy8gSWYgd2UgbmVlZCB0byBtb3ZlIGZvcndhcmQgZnVydGhlciB0aGFuIG9uZSBmcmFtZSwgY2FsbCBhZHZhbmNlVGltZSBzZXZlcmFsIHRpbWVzIHJhdGhlciB0aGFuIGluY3JlYXNpbmcgdGhlXHJcbiAgICAgICAgICAvLyBkdCwgc28gdGhlIG1vZGVsIHdpbGwgYmVoYXZlIHRoZSBzYW1lLFxyXG4gICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy93YXZlLWludGVyZmVyZW5jZS9pc3N1ZXMvMjU0XHJcbiAgICAgICAgICAvLyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3dhdmUtaW50ZXJmZXJlbmNlL2lzc3Vlcy8yMjZcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiBtb2RlbC5hZHZhbmNlVGltZSggMSAvIFdhdmVzTW9kZWwuRVZFTlRfUkFURSwgdHJ1ZSApXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2VudGVyIGluIHRoZSBwbGF5IGFyZWFcclxuICAgIHRpbWVDb250cm9sTm9kZS5jZW50ZXIgPSBuZXcgVmVjdG9yMiggdGhpcy53YXZlQXJlYU5vZGUuY2VudGVyWCwgdGltZUNvbnRyb2xOb2RlLmNlbnRlclkgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5zdGVwQWN0aW9uID0gbnVsbDtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBzaWRlIG9mIHRoZSB3YXRlciwgd2hlbiBmdWxseSByb3RhdGVkIGFuZCBpbiBXQVRFUiBzY2VuZVxyXG4gICAgbGV0IHdhdGVyU2lkZVZpZXdOb2RlID0gbnVsbDtcclxuICAgIGlmICggbW9kZWwud2F0ZXJTY2VuZSApIHtcclxuXHJcbiAgICAgIC8vIFNob3cgYSBncmF5IGJhY2tncm91bmQgZm9yIHRoZSB3YXRlciB0byBtYWtlIGl0IGVhc2llciB0byBzZWUgdGhlIGRvdHRlZCBsaW5lIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNjcmVlbixcclxuICAgICAgLy8gYW5kIHZpc3VhbGx5IHBhcnRpdGlvbiB0aGUgcGxheSBhcmVhXHJcbiAgICAgIGNvbnN0IHdhdGVyR3JheUJhY2tncm91bmQgPSBSZWN0YW5nbGUuYm91bmRzKCB0aGlzLndhdmVBcmVhTm9kZS5ib3VuZHMsIHsgZmlsbDogJyNlMmUzZTUnIH0gKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggd2F0ZXJHcmF5QmFja2dyb3VuZCApO1xyXG5cclxuICAgICAgd2F0ZXJTaWRlVmlld05vZGUgPSBuZXcgV2F0ZXJTaWRlVmlld05vZGUoIHRoaXMud2F2ZUFyZWFOb2RlLmJvdW5kcywgbW9kZWwud2F0ZXJTY2VuZSApO1xyXG4gICAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLnJvdGF0aW9uQW1vdW50UHJvcGVydHksIG1vZGVsLnNjZW5lUHJvcGVydHkgXSwgKCByb3RhdGlvbkFtb3VudCwgc2NlbmUgKSA9PiB7XHJcbiAgICAgICAgd2F0ZXJTaWRlVmlld05vZGUudmlzaWJsZSA9IHJvdGF0aW9uQW1vdW50ID09PSAxLjAgJiYgc2NlbmUgPT09IG1vZGVsLndhdGVyU2NlbmU7XHJcbiAgICAgICAgd2F0ZXJHcmF5QmFja2dyb3VuZC52aXNpYmxlID0gcm90YXRpb25BbW91bnQgIT09IDAgJiYgc2NlbmUgPT09IG1vZGVsLndhdGVyU2NlbmU7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5zdGVwQWN0aW9uID0gbmV3IFBoZXRpb0FjdGlvbiggKCkgPT4gd2F0ZXJEcm9wTGF5ZXIuc3RlcCggd2F0ZXJTaWRlVmlld05vZGUgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgd2F2ZUFyZWFOb2RlLCBsYXR0aWNlTm9kZSBhbmQgc291bmRQYXJ0aWNsZUxheWVyXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgICAgbW9kZWwucm90YXRpb25BbW91bnRQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5pc1JvdGF0aW5nUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwuc2NlbmVQcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC5zaG93V2F2ZXNQcm9wZXJ0eSxcclxuICAgICAgICAuLi4oIG1vZGVsLnNvdW5kU2NlbmUgPyBbIG1vZGVsLnNvdW5kU2NlbmUuc291bmRWaWV3VHlwZVByb3BlcnR5IF0gOiBbXSApXHJcbiAgICAgIF0sXHJcbiAgICAgICggcm90YXRpb25BbW91bnQsIGlzUm90YXRpbmcsIHNjZW5lLCBzaG93V2F2ZXMsIHNvdW5kVmlld1R5cGUgKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaXNXYXRlclNpZGVWaWV3ID0gcm90YXRpb25BbW91bnQgPT09IDEgJiYgc2NlbmUgPT09IG1vZGVsLndhdGVyU2NlbmU7XHJcbiAgICAgICAgY29uc3QgaXNWaXNpYmxlUGVyc3BlY3RpdmUgPSAhaXNSb3RhdGluZyAmJiAhaXNXYXRlclNpZGVWaWV3O1xyXG4gICAgICAgIHRoaXMud2F2ZUFyZWFOb2RlLnZpc2libGUgPSBpc1Zpc2libGVQZXJzcGVjdGl2ZTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hvd0xhdHRpY2UgPSBzY2VuZSA9PT0gbW9kZWwuc291bmRTY2VuZSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIGlzVmlzaWJsZVBlcnNwZWN0aXZlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dXYXZlcyAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VuZFZpZXdUeXBlICE9PSBTb3VuZFNjZW5lLlNvdW5kVmlld1R5cGUuUEFSVElDTEVTXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVmlzaWJsZVBlcnNwZWN0aXZlO1xyXG4gICAgICAgIHRoaXMubGF0dGljZU5vZGUudmlzaWJsZSA9IHNob3dMYXR0aWNlO1xyXG5cclxuICAgICAgICBpZiAoIHNvdW5kUGFydGljbGVMYXllciApIHtcclxuICAgICAgICAgIHNvdW5kUGFydGljbGVMYXllci52aXNpYmxlID0gKCBzb3VuZFZpZXdUeXBlID09PSBTb3VuZFNjZW5lLlNvdW5kVmlld1R5cGUuUEFSVElDTEVTIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc291bmRWaWV3VHlwZSA9PT0gU291bmRTY2VuZS5Tb3VuZFZpZXdUeXBlLkJPVEggKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY2VuZSA9PT0gbW9kZWwuc291bmRTY2VuZSAmJiBpc1Zpc2libGVQZXJzcGVjdGl2ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCB3YXRlckRyb3BMYXllciApIHtcclxuICAgICAgICAgIHdhdGVyRHJvcExheWVyLnZpc2libGUgPSBzY2VuZSA9PT0gbW9kZWwud2F0ZXJTY2VuZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKFxyXG4gICAgICBbIG1vZGVsLnJvdGF0aW9uQW1vdW50UHJvcGVydHksIG1vZGVsLmlzUm90YXRpbmdQcm9wZXJ0eSwgbW9kZWwuc2hvd0dyYXBoUHJvcGVydHkgXSxcclxuICAgICAgKCByb3RhdGlvbkFtb3VudCwgaXNSb3RhdGluZywgc2hvd0dyYXBoICkgPT4ge1xyXG4gICAgICAgIHdhdmVBcmVhR3JhcGhOb2RlLnZpc2libGUgPSAhaXNSb3RhdGluZyAmJiBzaG93R3JhcGg7XHJcbiAgICAgICAgZGFzaGVkTGluZU5vZGUudmlzaWJsZSA9ICFpc1JvdGF0aW5nICYmIHNob3dHcmFwaDtcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBlcnNwZWN0aXZlM0ROb2RlID0gbmV3IFBlcnNwZWN0aXZlM0ROb2RlKCB0aGlzLndhdmVBcmVhTm9kZS5ib3VuZHMsIG1vZGVsLnJvdGF0aW9uQW1vdW50UHJvcGVydHksXHJcbiAgICAgIG1vZGVsLmlzUm90YXRpbmdQcm9wZXJ0eSApO1xyXG5cclxuXHJcbiAgICAvLyBJbml0aWFsaXplIGFuZCB1cGRhdGUgdGhlIGNvbG9ycyBiYXNlZCBvbiB0aGUgc2NlbmVcclxuICAgIGNvbnN0IGNvbG9yTGlua1Byb3BlcnRpZXMgPSBbIG1vZGVsLnNjZW5lUHJvcGVydHkgXTtcclxuICAgIGlmICggbW9kZWwubGlnaHRTY2VuZSApIHtcclxuICAgICAgY29sb3JMaW5rUHJvcGVydGllcy5wdXNoKCBtb2RlbC5saWdodFNjZW5lLmZyZXF1ZW5jeVByb3BlcnR5ICk7XHJcbiAgICB9XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBjb2xvckxpbmtQcm9wZXJ0aWVzLCAoIHNjZW5lLCBmcmVxdWVuY3kgKSA9PiB7XHJcbiAgICAgIHBlcnNwZWN0aXZlM0ROb2RlLnNldFRvcEZhY2VDb2xvciggc2NlbmUgPT09IG1vZGVsLndhdGVyU2NlbmUgPyAnIzM5ODFhOScgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjZW5lID09PSBtb2RlbC5zb3VuZFNjZW5lID8gJ2dyYXknIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaXNpYmxlQ29sb3IuZnJlcXVlbmN5VG9Db2xvciggZnJvbUZlbXRvKCBmcmVxdWVuY3kgKSApICk7XHJcbiAgICAgIHBlcnNwZWN0aXZlM0ROb2RlLnNldFNpZGVGYWNlQ29sb3IoIHNjZW5lID09PSBtb2RlbC53YXRlclNjZW5lID8gV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5XQVRFUl9TSURFX0NPTE9SIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NlbmUgPT09IG1vZGVsLnNvdW5kU2NlbmUgPyAnZGFya0dyYXknIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVmlzaWJsZUNvbG9yLmZyZXF1ZW5jeVRvQ29sb3IoIGZyb21GZW10byggZnJlcXVlbmN5ICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jb2xvclV0aWxzRGFya2VyKCAwLjE1ICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBUb2dnbGVOb2RlIHRoYXQgc2hvd3MgdGhlIHByaW1hcnkgb3Igc2Vjb25kYXJ5IHNvdXJjZVxyXG4gICAgICogQHBhcmFtIGlzUHJpbWFyeVNvdXJjZSAtIHRydWUgaWYgaXQgc2hvdWxkIHNob3cgdGhlIHByaW1hcnkgc291cmNlXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGNyZWF0ZVdhdmVHZW5lcmF0b3JUb2dnbGVOb2RlID0gaXNQcmltYXJ5U291cmNlID0+IHtcclxuICAgICAgY29uc3QgdG9nZ2xlTm9kZUVsZW1lbnRzID0gW107XHJcbiAgICAgIG1vZGVsLndhdGVyU2NlbmUgJiYgdG9nZ2xlTm9kZUVsZW1lbnRzLnB1c2goIHtcclxuICAgICAgICB2YWx1ZTogbW9kZWwud2F0ZXJTY2VuZSxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgV2F0ZXJXYXZlR2VuZXJhdG9yTm9kZSggbW9kZWwud2F0ZXJTY2VuZSwgdGhpcy53YXZlQXJlYU5vZGUsIGlzUHJpbWFyeVNvdXJjZSApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIG1vZGVsLnNvdW5kU2NlbmUgJiYgdG9nZ2xlTm9kZUVsZW1lbnRzLnB1c2goIHtcclxuICAgICAgICB2YWx1ZTogbW9kZWwuc291bmRTY2VuZSxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgU291bmRXYXZlR2VuZXJhdG9yTm9kZSggbW9kZWwuc291bmRTY2VuZSwgdGhpcy53YXZlQXJlYU5vZGUsIGlzUHJpbWFyeVNvdXJjZSApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIG1vZGVsLmxpZ2h0U2NlbmUgJiYgdG9nZ2xlTm9kZUVsZW1lbnRzLnB1c2goIHtcclxuICAgICAgICB2YWx1ZTogbW9kZWwubGlnaHRTY2VuZSxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgTGlnaHRXYXZlR2VuZXJhdG9yTm9kZSggbW9kZWwubGlnaHRTY2VuZSwgdGhpcy53YXZlQXJlYU5vZGUsIGlzUHJpbWFyeVNvdXJjZSApXHJcbiAgICAgIH0gKTtcclxuICAgICAgcmV0dXJuIG5ldyBUb2dnbGVOb2RlKCBtb2RlbC5zY2VuZVByb3BlcnR5LCB0b2dnbGVOb2RlRWxlbWVudHMsIHtcclxuICAgICAgICBhbGlnbkNoaWxkcmVuOiBUb2dnbGVOb2RlLk5PTkVcclxuICAgICAgfSApO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBwZXJzcGVjdGl2ZTNETm9kZSApO1xyXG5cclxuICAgIGlmICggbW9kZWwud2F0ZXJTY2VuZSApIHtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggd2F0ZXJEcm9wTGF5ZXIgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggd2F0ZXJTaWRlVmlld05vZGUgKTtcclxuICAgIH1cclxuICAgIGlmICggb3B0aW9ucy5zaG93U2NlbmVTcGVjaWZpY1dhdmVHZW5lcmF0b3JOb2RlcyApIHtcclxuICAgICAgY29uc3QgcHJpbWFyeVdhdmVHZW5lcmF0b3JUb2dnbGVOb2RlID0gY3JlYXRlV2F2ZUdlbmVyYXRvclRvZ2dsZU5vZGUoIHRydWUgKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggcHJpbWFyeVdhdmVHZW5lcmF0b3JUb2dnbGVOb2RlICk7IC8vIFByaW1hcnkgc291cmNlXHJcblxyXG4gICAgICB0aGlzLnBkb21QbGF5QXJlYU5vZGUucGRvbU9yZGVyID0gWyBwcmltYXJ5V2F2ZUdlbmVyYXRvclRvZ2dsZU5vZGUsIG51bGwgXTtcclxuXHJcbiAgICAgIC8vIFNlY29uZGFyeSBzb3VyY2VcclxuICAgICAgaWYgKCBtb2RlbC5udW1iZXJPZlNvdXJjZXMgPT09IDIgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCggY3JlYXRlV2F2ZUdlbmVyYXRvclRvZ2dsZU5vZGUoIGZhbHNlICkgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBAcHJvdGVjdGVkIC0gcGxhY2Vob2xkZXIgZm9yIGFsdGVybmF0aXZlIHdhdmUgZ2VuZXJhdG9yIG5vZGVzXHJcbiAgICAgIHRoaXMud2F2ZUdlbmVyYXRvckxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCggdGhpcy53YXZlR2VuZXJhdG9yTGF5ZXIgKTtcclxuICAgIH1cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVDb250cm9sTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcclxuICAgIHNvdW5kUGFydGljbGVMYXllciAmJiB0aGlzLmFkZENoaWxkKCBzb3VuZFBhcnRpY2xlTGF5ZXIgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGRhc2hlZExpbmVOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmFmdGVyV2F2ZUFyZWFOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB3YXZlQXJlYUdyYXBoTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbWVhc3VyaW5nVGFwZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN0b3B3YXRjaE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHdhdmVNZXRlck5vZGUgKTtcclxuXHJcbiAgICAvLyBPbmx5IHN0YXJ0IHVwIHRoZSBhdWRpbyBzeXN0ZW0gaWYgc291bmQgaXMgZW5hYmxlZCBmb3IgdGhpcyBzY3JlZW5cclxuICAgIGlmICggb3B0aW9ucy5hdWRpb0VuYWJsZWQgKSB7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZVxyXG4gICAgICB0aGlzLndhdmVzU2NyZWVuU291bmRWaWV3ID0gbmV3IFdhdmVzU2NyZWVuU291bmRWaWV3KCBtb2RlbCwgdGhpcywgb3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGdsb2JhbFRvTGF0dGljZUNvb3JkaW5hdGUoIHBvaW50OiBWZWN0b3IyICk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgbGF0dGljZU5vZGUgPSB0aGlzLnNjZW5lVG9Ob2RlKCB0aGlzLm1vZGVsLnNjZW5lUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICBjb25zdCBsb2NhbFBvaW50ID0gbGF0dGljZU5vZGUuZ2xvYmFsVG9Mb2NhbFBvaW50KCBwb2ludCApO1xyXG4gICAgcmV0dXJuIExhdHRpY2VDYW52YXNOb2RlLmxvY2FsUG9pbnRUb0xhdHRpY2VQb2ludCggbG9jYWxQb2ludCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTm90aWZ5IGxpc3RlbmVycyBvZiB0aGUgc3RlcCBwaGFzZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMuc3RlcEFjdGlvbiAmJiB0aGlzLnN0ZXBBY3Rpb24uZXhlY3V0ZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBzdGF0aWNcclxuICogQHB1YmxpY1xyXG4gKi9cclxuV2F2ZXNTY3JlZW5WaWV3LlNQQUNJTkcgPSBTUEFDSU5HO1xyXG5cclxud2F2ZUludGVyZmVyZW5jZS5yZWdpc3RlciggJ1dhdmVzU2NyZWVuVmlldycsIFdhdmVzU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBXYXZlc1NjcmVlblZpZXc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQs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