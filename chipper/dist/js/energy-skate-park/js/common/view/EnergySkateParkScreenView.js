// Copyright 2013-2022, University of Colorado Boulder

/**
 * Scenery node for the Energy Skate Park view (includes everything you see).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import DotRectangle from '../../../../dot/js/Rectangle.js'; // eslint-disable-line default-import-match-filename
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import ValueGaugeNode from '../../../../scenery-phet/js/ValueGaugeNode.js';
import { Image, Node, Path, Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import skater1_set1_left_png from '../../../images/skater1_set1_left_png.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkStrings from '../../EnergySkateParkStrings.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import AttachDetachToggleButtons from './AttachDetachToggleButtons.js';
import BackgroundNode from './BackgroundNode.js';
import EnergyBarGraphAccordionBox from './EnergyBarGraphAccordionBox.js';
import EnergySkateParkColorScheme from './EnergySkateParkColorScheme.js';
import EnergySkateParkControlPanel from './EnergySkateParkControlPanel.js';
import EnergySkateParkGridNode from './EnergySkateParkGridNode.js';
import PieChartLegend from './PieChartLegend.js';
import PieChartNode from './PieChartNode.js';
import ReferenceHeightLine from './ReferenceHeightLine.js';
import SkaterNode from './SkaterNode.js';
import ToolboxPanel from './ToolboxPanel.js';
import TrackNode from './TrackNode.js';
import VisibilityControlsPanel from './VisibilityControlsPanel.js';
const controlsRestartSkaterString = EnergySkateParkStrings.skaterControls.restartSkaterStringProperty;
const propertiesSpeedStringProperty = EnergySkateParkStrings.speedometer.labelStringProperty;
const speedometerMetersPerSecondPatternString = EnergySkateParkStrings.speedometer.metersPerSecondPatternStringProperty;
const measuringTapeUnitsString = EnergySkateParkStrings.measuringTape.unitsStringProperty;

// constants
// for wider screens, panels can float to the left and right by this much beyond dev bounds in view coordinates
const EXTRA_FLOAT = 51.5;

// Debug flag to show the view bounds, the region within which the skater can move
const showAvailableBounds = false;
class EnergySkateParkScreenView extends ScreenView {
  /**
   * @param {EnergySkateParkModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, tandem, options) {
    options = merge({
      // options for the bar graph, see composite type options below
      barGraphOptions: null,
      // {boolean} - whether or not this ScreenView should have a bar graph
      showBarGraph: true,
      // {boolean} - whether or not to show buttons that select premade tracks
      showTrackButtons: true,
      // {boolean} - whether or not this ScreenView will show the skater path along the track
      showSkaterPath: false,
      // {boolean} - whether or not the bar graph should include zoom buttons
      showBarGraphZoomButtons: true,
      // {boolean} - whether or not the screen will include radio buttons to control skater attaching/detaching
      // from the tracks
      showAttachDetachRadioButtons: false,
      // {boolean} - whether or not this ScreenView will show the reference height
      showReferenceHeight: true,
      // {boolean} - whether or not to include a toolbox that contains a ruler and a measuring tape
      showToolbox: true,
      // {boolean} - if true, the "grid" and "reference height" visibility controls will be displayed in a separate
      // panel near the bottom of the screen
      showSeparateVisibilityControlsPanel: true,
      // {Object} - options passed along to EnergySkateParkControlPanel
      controlPanelOptions: null,
      // {Object} passed to EnergySkateParkControlPanel, options for the EnergySkateParkVisibilityControls in that
      // panel
      visibilityControlsOptions: null
    }, options);
    super({
      tandem: tandem
    });
    const modelPoint = new Vector2(0, 0);

    // earth is 86px high in stage coordinates
    const viewPoint = new Vector2(this.layoutBounds.width / 2, this.layoutBounds.height - BackgroundNode.earthHeight);

    // scale chosen so that displayed model is the same as it was for energy-skate-park-basics when that sim
    // used non-default layout bounds
    const scale = 61.40;
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(modelPoint, viewPoint, scale);
    this.modelViewTransform = modelViewTransform;
    this.availableModelBoundsProperty = new Property(new Bounds2(0, 0, 0, 0), {
      valueType: [Bounds2]
    });
    this.availableModelBoundsProperty.link(bounds => {
      model.availableModelBoundsProperty.set(bounds);
    });

    // Mimic the PhetioGroup API until we implement the full instrumentation
    this.trackNodeGroup = {
      createNextElement(track, modelViewTransform, availableBoundsProperty, options) {
        assert && options && assert(!options.hasOwnProperty('tandem'), 'tandem is managed by the PhetioGroup');
        return new TrackNode(track, modelViewTransform, availableBoundsProperty, Tandem.OPT_OUT, options);
      }
    };

    // @protected
    this.model = model;

    // @private - whether or not this screen view should include a measuring tape
    this.showToolbox = options.showToolbox;

    // @private {boolean} - visibility of various view components
    this.showBarGraph = options.showBarGraph;
    this.showSkaterPath = options.showSkaterPath;
    this.showReferenceHeight = options.showReferenceHeight;
    this.showTrackButtons = options.showTrackButtons;
    this.showSeparateVisibilityControlsPanel = options.showSeparateVisibilityControlsPanel;

    // @protected {null|number} - defines the min and max edges horizontally for floating layout, null until first
    // layout() - includes padding so elements won't touch the edge
    this.fixedRight = null;
    this.fixedLeft = null;

    // @private - Layers for nodes in the sim. The bottom layer contains the background and UI components that should
    // be behind the animating skater and other draggable things, which are in the topLayer.
    this.bottomLayer = new Node();
    this.topLayer = new Node();
    this.children = [this.bottomLayer, this.topLayer];

    // @protected (read-only)
    this.skaterNode = new SkaterNode(model.skater, this, model.userControlledPropertySet.skaterControlledProperty, modelViewTransform, model.getClosestTrackAndPositionAndParameter.bind(model), model.getPhysicalTracks.bind(model), tandem.createTandem('skaterNode'));

    // The background
    this.backgroundNode = new BackgroundNode(this.layoutBounds, this.visibleBoundsProperty, tandem.createTandem('backgroundNode'));
    this.bottomLayer.addChild(this.backgroundNode);
    this.gridNode = new EnergySkateParkGridNode(model.gridVisibleProperty, model.skater.referenceHeightProperty, this.visibleBoundsProperty, modelViewTransform, tandem.createTandem('energySkateParkGridNode'));
    this.bottomLayer.addChild(this.gridNode);
    this.controlPanel = new EnergySkateParkControlPanel(model, this, tandem.createTandem('controlPanel'), options.controlPanelOptions);
    this.bottomLayer.addChild(this.controlPanel);

    // @private - node that shows the energy legend for the pie chart
    this.pieChartLegend = new PieChartLegend(model.skater, model.clearThermal.bind(model), model.pieChartVisibleProperty, tandem.createTandem('pieChartLegend'));
    this.bottomLayer.addChild(this.pieChartLegend);

    // For the playground screen, show attach/detach toggle buttons
    if (options.showAttachDetachRadioButtons) {
      const property = model.tracksDraggable ? new Property(true) : new DerivedProperty([model.sceneProperty], scene => {
        scene === 2;
      });
      this.attachDetachToggleButtons = new AttachDetachToggleButtons(model.stickingToTrackProperty, property, 184, tandem.createTandem('attachDetachToggleButtons'));
      this.bottomLayer.addChild(this.attachDetachToggleButtons);
    }

    // @private - the bar chart showing energy distribution
    if (this.showBarGraph) {
      this.energyBarGraphAccordionBox = new EnergyBarGraphAccordionBox(model.skater, model.barGraphScaleProperty, model.barGraphVisibleProperty, tandem.createTandem('energyBarGraphAccordionBox'), {
        barGraphOptions: {
          showBarGraphZoomButtons: options.showBarGraphZoomButtons
        }
      });
      this.energyBarGraphAccordionBox.leftTop = new Vector2(5, 5);
      this.bottomLayer.addChild(this.energyBarGraphAccordionBox);
    }
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      // Align vertically with other controls, see #134
      centerY: (modelViewTransform.modelToViewY(0) + this.layoutBounds.maxY) / 2,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.bottomLayer.addChild(this.resetAllButton);

    // The button to return the skater
    this.returnSkaterButton = new RectangularPushButton({
      content: new Text(controlsRestartSkaterString, {
        tandem: tandem.createTandem('restartSkaterText'),
        maxWidth: 90,
        font: EnergySkateParkConstants.CONTROL_LABEL_FONT
      }),
      listener: model.returnSkater.bind(model),
      centerY: this.resetAllButton.centerY,
      // X updated in layoutBounds since the reset all button can move horizontally
      tandem: tandem.createTandem('returnSkaterButton')
    });

    // Disable the return skater button when the skater is already at his initial coordinates
    model.skater.movedProperty.linkAttribute(this.returnSkaterButton, 'enabled');
    this.bottomLayer.addChild(this.returnSkaterButton);
    const gaugeRadius = 76;

    // @protected (read-only) - for layout or repositioning in subtypes
    this.speedometerNode = new ValueGaugeNode(model.skater.speedProperty, propertiesSpeedStringProperty, new Range(0, 30), {
      numberDisplayOptions: {
        valuePattern: speedometerMetersPerSecondPatternString,
        decimalPlaces: 1,
        textOptions: {
          maxWidth: gaugeRadius * 1.3,
          font: new PhetFont(20)
        }
      },
      updateWhenInvisible: false,
      pickable: false,
      radius: gaugeRadius,
      tandem: tandem.createTandem('speedometerNode')
    });
    model.speedometerVisibleProperty.linkAttribute(this.speedometerNode, 'visible');
    model.speedValueVisibleProperty.link(visible => {
      this.speedometerNode.setNumberDisplayVisible(visible);
    });

    // default layout, but may change in subtypes
    this.speedometerNode.centerX = this.layoutBounds.centerX;
    this.speedometerNode.top = this.layoutBounds.minY + 5;
    this.bottomLayer.addChild(this.speedometerNode);

    // @public (for layout) - Layer which will contain all of the tracks
    this.trackLayer = new Node({
      tandem: tandem.createTandem('trackLayer')
    });

    // tracks on top of panels and non-interactive visualizations
    this.topLayer.addChild(this.trackLayer);

    // add a measuring tape, on top of tracks, below the skater
    if (options.showToolbox) {
      const unitsProperty = new Property({
        name: measuringTapeUnitsString,
        multiplier: 1
      });

      // @private {MeasuringTapeNode}
      this.measuringTapeNode = new MeasuringTapeNode(unitsProperty, {
        visibleProperty: model.measuringTapeVisibleProperty,
        basePositionProperty: model.measuringTapeBasePositionProperty,
        tipPositionProperty: model.measuringTapeTipPositionProperty,
        modelViewTransform: modelViewTransform,
        dragBounds: this.availableModelBoundsProperty.get(),
        textBackgroundColor: EnergySkateParkColorScheme.transparentPanelFill,
        textColor: 'black',
        textFont: new PhetFont({
          size: 14.7
        }),
        baseDragEnded: () => {
          if (this.measuringTapeNode.getLocalBaseBounds().intersectsBounds(this.toolboxPanel.bounds)) {
            model.measuringTapeVisibleProperty.set(false);
          }
        },
        tandem: tandem.createTandem('measuringTapeNode')
      });

      // @private
      this.stopwatchNode = new StopwatchNode(model.stopwatch, {
        dragBoundsProperty: this.visibleBoundsProperty,
        tandem: tandem.createTandem('stopwatchNode'),
        numberDisplayOptions: {
          numberFormatter: StopwatchNode.createRichTextNumberFormatter({
            bigNumberFont: 25,
            smallNumberFont: 17
          })
        },
        dragListenerOptions: {
          end: () => {
            if (this.stopwatchNode.bounds.intersectsBounds(this.toolboxPanel.bounds)) {
              model.stopwatch.isVisibleProperty.value = false;
            }
          }
        }
      });
      this.topLayer.addChild(this.stopwatchNode);
      this.topLayer.addChild(this.measuringTapeNode);

      // @private {ToolboxPanel} - so it can float to the layout bounds, see layout()
      this.toolboxPanel = new ToolboxPanel(model, this, tandem.createTandem('toolboxPanel'), {
        minWidth: this.controlPanel.width
      });
      this.bottomLayer.addChild(this.toolboxPanel);
    }

    // @private {ReferenceHeightLine} - above the track because it is draggable, but below the skater because
    // it is important for the skater center of mass representation to always be visible
    this.referenceHeightLine = new ReferenceHeightLine(modelViewTransform, model.skater.referenceHeightProperty, model.referenceHeightVisibleProperty, model.userControlledPropertySet.referenceHeightControlledProperty, tandem.createTandem('referenceHeightLine'));
    this.topLayer.addChild(this.referenceHeightLine);

    // skaterNode is above most things as it is the primary draggable object
    this.topLayer.addChild(this.skaterNode);
    const pieChartNode = new PieChartNode(model.skater, model.pieChartVisibleProperty, modelViewTransform, tandem.createTandem('pieChartNode'));
    this.topLayer.addChild(pieChartNode);

    // relative to the control panel, but this will not float with the layout
    this.referenceHeightLine.centerX = this.layoutBounds.centerX;

    // Buttons to return the skater when she is offscreen, see #219
    const iconScale = 0.19;
    const returnSkaterToPreviousStartingPositionButtonImage = new Image(skater1_set1_left_png, {
      scale: iconScale,
      tandem: tandem.createTandem('skaterIconImage1')
    });
    const returnSkaterToPreviousStartingPositionButton = new RectangularPushButton({
      content: returnSkaterToPreviousStartingPositionButtonImage,
      // green means "go" since the skater will likely start moving at this point
      baseColor: EnergySkateParkColorScheme.kineticEnergy,
      listener: model.returnSkater.bind(model),
      tandem: tandem.createTandem('returnSkaterToPreviousStartingPositionButton')
    });
    const returnSkaterToGroundButtonImage = new Image(skater1_set1_left_png, {
      scale: iconScale,
      tandem: tandem.createTandem('skaterIconImage2')
    });
    const returnSkaterToGroundButton = new RectangularPushButton({
      content: returnSkaterToGroundButtonImage,
      centerBottom: modelViewTransform.modelToViewPosition(model.skater.startingPositionProperty.value),
      baseColor: '#f4514e',
      // red for stop, since the skater will be stopped on the ground.
      listener: () => {
        // resetting the skater position will change state of simulation
        model.userControlledPropertySet.skaterControlledProperty.set(true);
        model.skater.resetPosition();
        model.userControlledPropertySet.skaterControlledProperty.set(false);
      },
      tandem: tandem.createTandem('returnSkaterToGroundButton')
    });
    model.preferencesModel.skaterCharacterSetProperty.link(skaterCharacterSet => {
      returnSkaterToPreviousStartingPositionButtonImage.setImage(skaterCharacterSet.imageSet1.leftImage);
      returnSkaterToGroundButtonImage.setImage(skaterCharacterSet.imageSet1.leftImage);
    });

    // the "return skater" buttons are in the top layer so that they can be on top of the track and easily visible
    // when the skater goes off screen
    this.topLayer.addChild(returnSkaterToPreviousStartingPositionButton);
    this.topLayer.addChild(returnSkaterToGroundButton);
    const playingProperty = new BooleanProperty(!model.pausedProperty.value, {
      tandem: tandem.createTandem('playingProperty')
    });
    model.pausedProperty.link(paused => {
      playingProperty.set(!paused);
    });
    playingProperty.link(playing => {
      model.pausedProperty.set(!playing);
    });

    // play/pause and step buttons are same size until playingProperty is false
    this.timeControlNode = new TimeControlNode(playingProperty, {
      tandem: tandem.createTandem('timeControlNode'),
      timeSpeedProperty: model.timeSpeedProperty,
      buttonGroupXSpacing: 23.3,
      // extra spacing avoids pointer area overlap when play pause button size increases
      playPauseStepButtonOptions: {
        playPauseButtonOptions: {
          radius: 22.1
        },
        stepForwardButtonOptions: {
          radius: 16,
          listener: model.manualStep.bind(model)
        }
      },
      speedRadioButtonGroupOptions: {
        labelOptions: {
          font: new PhetFont(17)
        },
        radioButtonOptions: {
          radius: 10
        }
      }
    });
    this.topLayer.addChild(this.timeControlNode);
    this.timeControlNode.setCenterBottom(this.layoutBounds.centerBottom.minusXY(0, 15));

    // grid and reference height visibility are controlled from a separate panel
    if (this.showSeparateVisibilityControlsPanel) {
      // @protected (read-only) - for layout
      this.visibilityControlsPanel = new VisibilityControlsPanel(model, tandem.createTandem('visibilityControlsPanel'), {
        centerY: this.timeControlNode.centerY
      });
      this.addToBottomLayer(this.visibilityControlsPanel);
    }

    // When the skater goes off screen, make the "return skater" button big
    model.skaterInBoundsProperty.link(inBounds => {
      const buttonsVisible = !inBounds;
      returnSkaterToGroundButton.visible = buttonsVisible;
      returnSkaterToPreviousStartingPositionButton.visible = buttonsVisible;
      if (buttonsVisible) {
        // Put the button where the skater will appear.  Nudge it up a bit so the mouse can hit it from the drop site,
        // without being moved at all (to simplify repeat runs).
        const viewPosition = modelViewTransform.modelToViewPosition(model.skater.startingPositionProperty.value).plusXY(0, 5);
        returnSkaterToPreviousStartingPositionButton.centerBottom = viewPosition;

        // If the return skater button went offscreen, move it back on the screen, see #222 and #355
        if (returnSkaterToPreviousStartingPositionButton.top < 5) {
          returnSkaterToPreviousStartingPositionButton.top = 5;
        }
        if (returnSkaterToPreviousStartingPositionButton.left < 5) {
          returnSkaterToPreviousStartingPositionButton.left = 5;
        }
        if (returnSkaterToPreviousStartingPositionButton.right > this.layoutBounds.right - 5) {
          returnSkaterToPreviousStartingPositionButton.right = this.layoutBounds.right - 5;
        }
      }
    });

    // When the model resets, go back to the default skater for the selected set (character set itself does not reset)
    this.model.resetEmitter.addListener(() => {
      this.skaterNode.skaterImageSetProperty.value = model.preferencesModel.skaterCharacterSetProperty.value.imageSet1;
    });

    // For debugging the visible bounds
    if (showAvailableBounds) {
      this.viewBoundsPath = new Path(null, {
        pickable: false,
        stroke: 'red',
        lineWidth: 10,
        tandem: tandem.createTandem('viewBoundsPath')
      });
      this.topLayer.addChild(this.viewBoundsPath);
    }
    this.visibleBoundsProperty.lazyLink(visibleBounds => {
      // Compute the visible model bounds so we will know when a model object like the skater has gone offscreen
      this.availableModelBounds = this.modelViewTransform.viewToModelBounds(visibleBounds);
      this.availableModelBoundsProperty.value = this.availableModelBounds;

      // limit measuring tape to available area
      if (options.showToolbox) {
        this.measuringTapeNode.setDragBounds(this.availableModelBounds);
      }

      // Show it for debugging
      if (showAvailableBounds) {
        this.viewBoundsPath.shape = Shape.bounds(this.visibleBoundsProperty.get());
      }
    });
  }

  /**
   * Layout the EnergySkateParkScreenView, scaling it up and down with the size of the screen to ensure a
   * minimally visible area, but keeping it centered at the bottom of the screen, so there is more area in the +y
   * direction to build tracks and move the skater.
   * @public
   * @override
   *
   * @param {Bounds2} viewBounds
   */
  layout(viewBounds) {
    assert && assert(this.controlPanel, 'much of component layout based on control panel, one should be created.');
    this.resetTransform();
    const scale = this.getLayoutScale(viewBounds);
    const width = viewBounds.width;
    const height = viewBounds.height;
    this.setScaleMagnitude(scale);
    let offsetX = 0;
    let offsetY = 0;

    // Move to bottom vertically
    if (scale === width / this.layoutBounds.width) {
      offsetY = height / scale - this.layoutBounds.height;
    }

    // center horizontally
    else if (scale === height / this.layoutBounds.height) {
      offsetX = (width - this.layoutBounds.width * scale) / 2 / scale;
    }
    this.translate(offsetX + viewBounds.left / scale, offsetY + viewBounds.top / scale);

    // availableViewBounds in this sim is the visible area above ground (y=0)
    this.visibleBoundsProperty.set(new DotRectangle(-offsetX, -offsetY, width / scale, this.modelViewTransform.modelToViewY(0) + Math.abs(offsetY)));
    const maxFloatAmount = this.layoutBounds.right + EXTRA_FLOAT;
    const minFloatAmount = this.layoutBounds.left - EXTRA_FLOAT;

    // for use in subtypes
    this.fixedRight = Math.min(maxFloatAmount, this.visibleBoundsProperty.get().maxX) - 6;
    this.fixedLeft = Math.max(minFloatAmount, this.visibleBoundsProperty.get().minX) + 6;
    this.controlPanel.top = 6;
    this.controlPanel.right = this.fixedRight;
    if (this.attachDetachToggleButtons) {
      this.attachDetachToggleButtons.top = this.controlPanel.bottom + 5;
      this.attachDetachToggleButtons.centerX = this.controlPanel.centerX;
    }
    this.resetAllButton.right = this.controlPanel.right;
    this.returnSkaterButton.right = this.resetAllButton.left - 10;
    if (this.showToolbox) {
      this.toolboxPanel.top = this.controlPanel.bottom + 5;
      this.toolboxPanel.right = this.controlPanel.right;
    }

    // pie chart legend position is dependent on whether or not the screen includes an energy bar graph
    let pieChartLegendLeftTop = null;
    if (this.showBarGraph) {
      this.energyBarGraphAccordionBox.x = this.fixedLeft;
      pieChartLegendLeftTop = new Vector2(this.energyBarGraphAccordionBox.right + 45, this.energyBarGraphAccordionBox.top);
    } else {
      pieChartLegendLeftTop = new Vector2(this.fixedLeft, this.controlPanel.top);
    }
    if (this.showSeparateVisibilityControlsPanel) {
      this.visibilityControlsPanel.left = this.fixedLeft;
    }

    // Put the pie chart legend to the right of the bar chart, see #60, #192
    this.pieChartLegend.mutate({
      leftTop: pieChartLegendLeftTop
    });
  }

  /**
   * Add a node to the front of the bottom layer (the end of this.backLayer children array). This layer is behind
   * animating or movable things in the sim like the skater. This is useful for adding specific control-panel like
   * things in subtypes that should be behind the skater.
   * @protected
   *
   * @param {Node} node
   */
  addToBottomLayer(node) {
    this.bottomLayer.addChild(node);
  }
}
energySkatePark.register('EnergySkateParkScreenView', EnergySkateParkScreenView);
export default EnergySkateParkScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIkRvdFJlY3RhbmdsZSIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwiU2hhcGUiLCJtZXJnZSIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJSZXNldEFsbEJ1dHRvbiIsIk1lYXN1cmluZ1RhcGVOb2RlIiwiUGhldEZvbnQiLCJTdG9wd2F0Y2hOb2RlIiwiVGltZUNvbnRyb2xOb2RlIiwiVmFsdWVHYXVnZU5vZGUiLCJJbWFnZSIsIk5vZGUiLCJQYXRoIiwiVGV4dCIsIlJlY3Rhbmd1bGFyUHVzaEJ1dHRvbiIsIlRhbmRlbSIsInNrYXRlcjFfc2V0MV9sZWZ0X3BuZyIsImVuZXJneVNrYXRlUGFyayIsIkVuZXJneVNrYXRlUGFya1N0cmluZ3MiLCJFbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMiLCJBdHRhY2hEZXRhY2hUb2dnbGVCdXR0b25zIiwiQmFja2dyb3VuZE5vZGUiLCJFbmVyZ3lCYXJHcmFwaEFjY29yZGlvbkJveCIsIkVuZXJneVNrYXRlUGFya0NvbG9yU2NoZW1lIiwiRW5lcmd5U2thdGVQYXJrQ29udHJvbFBhbmVsIiwiRW5lcmd5U2thdGVQYXJrR3JpZE5vZGUiLCJQaWVDaGFydExlZ2VuZCIsIlBpZUNoYXJ0Tm9kZSIsIlJlZmVyZW5jZUhlaWdodExpbmUiLCJTa2F0ZXJOb2RlIiwiVG9vbGJveFBhbmVsIiwiVHJhY2tOb2RlIiwiVmlzaWJpbGl0eUNvbnRyb2xzUGFuZWwiLCJjb250cm9sc1Jlc3RhcnRTa2F0ZXJTdHJpbmciLCJza2F0ZXJDb250cm9scyIsInJlc3RhcnRTa2F0ZXJTdHJpbmdQcm9wZXJ0eSIsInByb3BlcnRpZXNTcGVlZFN0cmluZ1Byb3BlcnR5Iiwic3BlZWRvbWV0ZXIiLCJsYWJlbFN0cmluZ1Byb3BlcnR5Iiwic3BlZWRvbWV0ZXJNZXRlcnNQZXJTZWNvbmRQYXR0ZXJuU3RyaW5nIiwibWV0ZXJzUGVyU2Vjb25kUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwibWVhc3VyaW5nVGFwZVVuaXRzU3RyaW5nIiwibWVhc3VyaW5nVGFwZSIsInVuaXRzU3RyaW5nUHJvcGVydHkiLCJFWFRSQV9GTE9BVCIsInNob3dBdmFpbGFibGVCb3VuZHMiLCJFbmVyZ3lTa2F0ZVBhcmtTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsIm9wdGlvbnMiLCJiYXJHcmFwaE9wdGlvbnMiLCJzaG93QmFyR3JhcGgiLCJzaG93VHJhY2tCdXR0b25zIiwic2hvd1NrYXRlclBhdGgiLCJzaG93QmFyR3JhcGhab29tQnV0dG9ucyIsInNob3dBdHRhY2hEZXRhY2hSYWRpb0J1dHRvbnMiLCJzaG93UmVmZXJlbmNlSGVpZ2h0Iiwic2hvd1Rvb2xib3giLCJzaG93U2VwYXJhdGVWaXNpYmlsaXR5Q29udHJvbHNQYW5lbCIsImNvbnRyb2xQYW5lbE9wdGlvbnMiLCJ2aXNpYmlsaXR5Q29udHJvbHNPcHRpb25zIiwibW9kZWxQb2ludCIsInZpZXdQb2ludCIsImxheW91dEJvdW5kcyIsIndpZHRoIiwiaGVpZ2h0IiwiZWFydGhIZWlnaHQiLCJzY2FsZSIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZVNpbmdsZVBvaW50U2NhbGVJbnZlcnRlZFlNYXBwaW5nIiwiYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eSIsInZhbHVlVHlwZSIsImxpbmsiLCJib3VuZHMiLCJzZXQiLCJ0cmFja05vZGVHcm91cCIsImNyZWF0ZU5leHRFbGVtZW50IiwidHJhY2siLCJhdmFpbGFibGVCb3VuZHNQcm9wZXJ0eSIsImFzc2VydCIsImhhc093blByb3BlcnR5IiwiT1BUX09VVCIsImZpeGVkUmlnaHQiLCJmaXhlZExlZnQiLCJib3R0b21MYXllciIsInRvcExheWVyIiwiY2hpbGRyZW4iLCJza2F0ZXJOb2RlIiwic2thdGVyIiwidXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldCIsInNrYXRlckNvbnRyb2xsZWRQcm9wZXJ0eSIsImdldENsb3Nlc3RUcmFja0FuZFBvc2l0aW9uQW5kUGFyYW1ldGVyIiwiYmluZCIsImdldFBoeXNpY2FsVHJhY2tzIiwiY3JlYXRlVGFuZGVtIiwiYmFja2dyb3VuZE5vZGUiLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJhZGRDaGlsZCIsImdyaWROb2RlIiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsInJlZmVyZW5jZUhlaWdodFByb3BlcnR5IiwiY29udHJvbFBhbmVsIiwicGllQ2hhcnRMZWdlbmQiLCJjbGVhclRoZXJtYWwiLCJwaWVDaGFydFZpc2libGVQcm9wZXJ0eSIsInByb3BlcnR5IiwidHJhY2tzRHJhZ2dhYmxlIiwic2NlbmVQcm9wZXJ0eSIsInNjZW5lIiwiYXR0YWNoRGV0YWNoVG9nZ2xlQnV0dG9ucyIsInN0aWNraW5nVG9UcmFja1Byb3BlcnR5IiwiZW5lcmd5QmFyR3JhcGhBY2NvcmRpb25Cb3giLCJiYXJHcmFwaFNjYWxlUHJvcGVydHkiLCJiYXJHcmFwaFZpc2libGVQcm9wZXJ0eSIsImxlZnRUb3AiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicmVzZXQiLCJjZW50ZXJZIiwibW9kZWxUb1ZpZXdZIiwibWF4WSIsInJldHVyblNrYXRlckJ1dHRvbiIsImNvbnRlbnQiLCJtYXhXaWR0aCIsImZvbnQiLCJDT05UUk9MX0xBQkVMX0ZPTlQiLCJyZXR1cm5Ta2F0ZXIiLCJtb3ZlZFByb3BlcnR5IiwibGlua0F0dHJpYnV0ZSIsImdhdWdlUmFkaXVzIiwic3BlZWRvbWV0ZXJOb2RlIiwic3BlZWRQcm9wZXJ0eSIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidmFsdWVQYXR0ZXJuIiwiZGVjaW1hbFBsYWNlcyIsInRleHRPcHRpb25zIiwidXBkYXRlV2hlbkludmlzaWJsZSIsInBpY2thYmxlIiwicmFkaXVzIiwic3BlZWRvbWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJzcGVlZFZhbHVlVmlzaWJsZVByb3BlcnR5IiwidmlzaWJsZSIsInNldE51bWJlckRpc3BsYXlWaXNpYmxlIiwiY2VudGVyWCIsInRvcCIsIm1pblkiLCJ0cmFja0xheWVyIiwidW5pdHNQcm9wZXJ0eSIsIm5hbWUiLCJtdWx0aXBsaWVyIiwibWVhc3VyaW5nVGFwZU5vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5IiwiYmFzZVBvc2l0aW9uUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlQmFzZVBvc2l0aW9uUHJvcGVydHkiLCJ0aXBQb3NpdGlvblByb3BlcnR5IiwibWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHkiLCJkcmFnQm91bmRzIiwiZ2V0IiwidGV4dEJhY2tncm91bmRDb2xvciIsInRyYW5zcGFyZW50UGFuZWxGaWxsIiwidGV4dENvbG9yIiwidGV4dEZvbnQiLCJzaXplIiwiYmFzZURyYWdFbmRlZCIsImdldExvY2FsQmFzZUJvdW5kcyIsImludGVyc2VjdHNCb3VuZHMiLCJ0b29sYm94UGFuZWwiLCJzdG9wd2F0Y2hOb2RlIiwic3RvcHdhdGNoIiwiZHJhZ0JvdW5kc1Byb3BlcnR5IiwibnVtYmVyRm9ybWF0dGVyIiwiY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIiLCJiaWdOdW1iZXJGb250Iiwic21hbGxOdW1iZXJGb250IiwiZHJhZ0xpc3RlbmVyT3B0aW9ucyIsImVuZCIsImlzVmlzaWJsZVByb3BlcnR5IiwidmFsdWUiLCJtaW5XaWR0aCIsInJlZmVyZW5jZUhlaWdodExpbmUiLCJyZWZlcmVuY2VIZWlnaHRWaXNpYmxlUHJvcGVydHkiLCJyZWZlcmVuY2VIZWlnaHRDb250cm9sbGVkUHJvcGVydHkiLCJwaWVDaGFydE5vZGUiLCJpY29uU2NhbGUiLCJyZXR1cm5Ta2F0ZXJUb1ByZXZpb3VzU3RhcnRpbmdQb3NpdGlvbkJ1dHRvbkltYWdlIiwicmV0dXJuU2thdGVyVG9QcmV2aW91c1N0YXJ0aW5nUG9zaXRpb25CdXR0b24iLCJiYXNlQ29sb3IiLCJraW5ldGljRW5lcmd5IiwicmV0dXJuU2thdGVyVG9Hcm91bmRCdXR0b25JbWFnZSIsInJldHVyblNrYXRlclRvR3JvdW5kQnV0dG9uIiwiY2VudGVyQm90dG9tIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInN0YXJ0aW5nUG9zaXRpb25Qcm9wZXJ0eSIsInJlc2V0UG9zaXRpb24iLCJwcmVmZXJlbmNlc01vZGVsIiwic2thdGVyQ2hhcmFjdGVyU2V0UHJvcGVydHkiLCJza2F0ZXJDaGFyYWN0ZXJTZXQiLCJzZXRJbWFnZSIsImltYWdlU2V0MSIsImxlZnRJbWFnZSIsInBsYXlpbmdQcm9wZXJ0eSIsInBhdXNlZFByb3BlcnR5IiwicGF1c2VkIiwicGxheWluZyIsInRpbWVDb250cm9sTm9kZSIsInRpbWVTcGVlZFByb3BlcnR5IiwiYnV0dG9uR3JvdXBYU3BhY2luZyIsInBsYXlQYXVzZVN0ZXBCdXR0b25PcHRpb25zIiwicGxheVBhdXNlQnV0dG9uT3B0aW9ucyIsInN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9ucyIsIm1hbnVhbFN0ZXAiLCJzcGVlZFJhZGlvQnV0dG9uR3JvdXBPcHRpb25zIiwibGFiZWxPcHRpb25zIiwicmFkaW9CdXR0b25PcHRpb25zIiwic2V0Q2VudGVyQm90dG9tIiwibWludXNYWSIsInZpc2liaWxpdHlDb250cm9sc1BhbmVsIiwiYWRkVG9Cb3R0b21MYXllciIsInNrYXRlckluQm91bmRzUHJvcGVydHkiLCJpbkJvdW5kcyIsImJ1dHRvbnNWaXNpYmxlIiwidmlld1Bvc2l0aW9uIiwicGx1c1hZIiwibGVmdCIsInJpZ2h0IiwicmVzZXRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJza2F0ZXJJbWFnZVNldFByb3BlcnR5Iiwidmlld0JvdW5kc1BhdGgiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJsYXp5TGluayIsInZpc2libGVCb3VuZHMiLCJhdmFpbGFibGVNb2RlbEJvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwic2V0RHJhZ0JvdW5kcyIsInNoYXBlIiwibGF5b3V0Iiwidmlld0JvdW5kcyIsInJlc2V0VHJhbnNmb3JtIiwiZ2V0TGF5b3V0U2NhbGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsIm9mZnNldFgiLCJvZmZzZXRZIiwidHJhbnNsYXRlIiwiTWF0aCIsImFicyIsIm1heEZsb2F0QW1vdW50IiwibWluRmxvYXRBbW91bnQiLCJtaW4iLCJtYXhYIiwibWF4IiwibWluWCIsImJvdHRvbSIsInBpZUNoYXJ0TGVnZW5kTGVmdFRvcCIsIngiLCJtdXRhdGUiLCJub2RlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbmVyZ3lTa2F0ZVBhcmtTY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjZW5lcnkgbm9kZSBmb3IgdGhlIEVuZXJneSBTa2F0ZSBQYXJrIHZpZXcgKGluY2x1ZGVzIGV2ZXJ5dGhpbmcgeW91IHNlZSkuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgRG90UmVjdGFuZ2xlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SZWN0YW5nbGUuanMnOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlZmF1bHQtaW1wb3J0LW1hdGNoLWZpbGVuYW1lXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IE1lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NZWFzdXJpbmdUYXBlTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgU3RvcHdhdGNoTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU3RvcHdhdGNoTm9kZS5qcyc7XHJcbmltcG9ydCBUaW1lQ29udHJvbE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCBWYWx1ZUdhdWdlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVmFsdWVHYXVnZU5vZGUuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgTm9kZSwgUGF0aCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUmVjdGFuZ3VsYXJQdXNoQnV0dG9uLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHNrYXRlcjFfc2V0MV9sZWZ0X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc2thdGVyMV9zZXQxX2xlZnRfcG5nLmpzJztcclxuaW1wb3J0IGVuZXJneVNrYXRlUGFyayBmcm9tICcuLi8uLi9lbmVyZ3lTa2F0ZVBhcmsuanMnO1xyXG5pbXBvcnQgRW5lcmd5U2thdGVQYXJrU3RyaW5ncyBmcm9tICcuLi8uLi9FbmVyZ3lTa2F0ZVBhcmtTdHJpbmdzLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cyBmcm9tICcuLi9FbmVyZ3lTa2F0ZVBhcmtDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXR0YWNoRGV0YWNoVG9nZ2xlQnV0dG9ucyBmcm9tICcuL0F0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnMuanMnO1xyXG5pbXBvcnQgQmFja2dyb3VuZE5vZGUgZnJvbSAnLi9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCBFbmVyZ3lCYXJHcmFwaEFjY29yZGlvbkJveCBmcm9tICcuL0VuZXJneUJhckdyYXBoQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0NvbG9yU2NoZW1lIGZyb20gJy4vRW5lcmd5U2thdGVQYXJrQ29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgRW5lcmd5U2thdGVQYXJrQ29udHJvbFBhbmVsIGZyb20gJy4vRW5lcmd5U2thdGVQYXJrQ29udHJvbFBhbmVsLmpzJztcclxuaW1wb3J0IEVuZXJneVNrYXRlUGFya0dyaWROb2RlIGZyb20gJy4vRW5lcmd5U2thdGVQYXJrR3JpZE5vZGUuanMnO1xyXG5pbXBvcnQgUGllQ2hhcnRMZWdlbmQgZnJvbSAnLi9QaWVDaGFydExlZ2VuZC5qcyc7XHJcbmltcG9ydCBQaWVDaGFydE5vZGUgZnJvbSAnLi9QaWVDaGFydE5vZGUuanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSGVpZ2h0TGluZSBmcm9tICcuL1JlZmVyZW5jZUhlaWdodExpbmUuanMnO1xyXG5pbXBvcnQgU2thdGVyTm9kZSBmcm9tICcuL1NrYXRlck5vZGUuanMnO1xyXG5pbXBvcnQgVG9vbGJveFBhbmVsIGZyb20gJy4vVG9vbGJveFBhbmVsLmpzJztcclxuaW1wb3J0IFRyYWNrTm9kZSBmcm9tICcuL1RyYWNrTm9kZS5qcyc7XHJcbmltcG9ydCBWaXNpYmlsaXR5Q29udHJvbHNQYW5lbCBmcm9tICcuL1Zpc2liaWxpdHlDb250cm9sc1BhbmVsLmpzJztcclxuXHJcbmNvbnN0IGNvbnRyb2xzUmVzdGFydFNrYXRlclN0cmluZyA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3Muc2thdGVyQ29udHJvbHMucmVzdGFydFNrYXRlclN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBwcm9wZXJ0aWVzU3BlZWRTdHJpbmdQcm9wZXJ0eSA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3Muc3BlZWRvbWV0ZXIubGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlZWRvbWV0ZXJNZXRlcnNQZXJTZWNvbmRQYXR0ZXJuU3RyaW5nID0gRW5lcmd5U2thdGVQYXJrU3RyaW5ncy5zcGVlZG9tZXRlci5tZXRlcnNQZXJTZWNvbmRQYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG1lYXN1cmluZ1RhcGVVbml0c1N0cmluZyA9IEVuZXJneVNrYXRlUGFya1N0cmluZ3MubWVhc3VyaW5nVGFwZS51bml0c1N0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbi8vIGZvciB3aWRlciBzY3JlZW5zLCBwYW5lbHMgY2FuIGZsb2F0IHRvIHRoZSBsZWZ0IGFuZCByaWdodCBieSB0aGlzIG11Y2ggYmV5b25kIGRldiBib3VuZHMgaW4gdmlldyBjb29yZGluYXRlc1xyXG5jb25zdCBFWFRSQV9GTE9BVCA9IDUxLjU7XHJcblxyXG4vLyBEZWJ1ZyBmbGFnIHRvIHNob3cgdGhlIHZpZXcgYm91bmRzLCB0aGUgcmVnaW9uIHdpdGhpbiB3aGljaCB0aGUgc2thdGVyIGNhbiBtb3ZlXHJcbmNvbnN0IHNob3dBdmFpbGFibGVCb3VuZHMgPSBmYWxzZTtcclxuXHJcbmNsYXNzIEVuZXJneVNrYXRlUGFya1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtFbmVyZ3lTa2F0ZVBhcmtNb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtLCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBvcHRpb25zIGZvciB0aGUgYmFyIGdyYXBoLCBzZWUgY29tcG9zaXRlIHR5cGUgb3B0aW9ucyBiZWxvd1xyXG4gICAgICBiYXJHcmFwaE9wdGlvbnM6IG51bGwsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSB3aGV0aGVyIG9yIG5vdCB0aGlzIFNjcmVlblZpZXcgc2hvdWxkIGhhdmUgYSBiYXIgZ3JhcGhcclxuICAgICAgc2hvd0JhckdyYXBoOiB0cnVlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdG8gc2hvdyBidXR0b25zIHRoYXQgc2VsZWN0IHByZW1hZGUgdHJhY2tzXHJcbiAgICAgIHNob3dUcmFja0J1dHRvbnM6IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSB3aGV0aGVyIG9yIG5vdCB0aGlzIFNjcmVlblZpZXcgd2lsbCBzaG93IHRoZSBza2F0ZXIgcGF0aCBhbG9uZyB0aGUgdHJhY2tcclxuICAgICAgc2hvd1NrYXRlclBhdGg6IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhlIGJhciBncmFwaCBzaG91bGQgaW5jbHVkZSB6b29tIGJ1dHRvbnNcclxuICAgICAgc2hvd0JhckdyYXBoWm9vbUJ1dHRvbnM6IHRydWUsXHJcblxyXG4gICAgICAvLyB7Ym9vbGVhbn0gLSB3aGV0aGVyIG9yIG5vdCB0aGUgc2NyZWVuIHdpbGwgaW5jbHVkZSByYWRpbyBidXR0b25zIHRvIGNvbnRyb2wgc2thdGVyIGF0dGFjaGluZy9kZXRhY2hpbmdcclxuICAgICAgLy8gZnJvbSB0aGUgdHJhY2tzXHJcbiAgICAgIHNob3dBdHRhY2hEZXRhY2hSYWRpb0J1dHRvbnM6IGZhbHNlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdGhpcyBTY3JlZW5WaWV3IHdpbGwgc2hvdyB0aGUgcmVmZXJlbmNlIGhlaWdodFxyXG4gICAgICBzaG93UmVmZXJlbmNlSGVpZ2h0OiB0cnVlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gd2hldGhlciBvciBub3QgdG8gaW5jbHVkZSBhIHRvb2xib3ggdGhhdCBjb250YWlucyBhIHJ1bGVyIGFuZCBhIG1lYXN1cmluZyB0YXBlXHJcbiAgICAgIHNob3dUb29sYm94OiB0cnVlLFxyXG5cclxuICAgICAgLy8ge2Jvb2xlYW59IC0gaWYgdHJ1ZSwgdGhlIFwiZ3JpZFwiIGFuZCBcInJlZmVyZW5jZSBoZWlnaHRcIiB2aXNpYmlsaXR5IGNvbnRyb2xzIHdpbGwgYmUgZGlzcGxheWVkIGluIGEgc2VwYXJhdGVcclxuICAgICAgLy8gcGFuZWwgbmVhciB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW5cclxuICAgICAgc2hvd1NlcGFyYXRlVmlzaWJpbGl0eUNvbnRyb2xzUGFuZWw6IHRydWUsXHJcblxyXG4gICAgICAvLyB7T2JqZWN0fSAtIG9wdGlvbnMgcGFzc2VkIGFsb25nIHRvIEVuZXJneVNrYXRlUGFya0NvbnRyb2xQYW5lbFxyXG4gICAgICBjb250cm9sUGFuZWxPcHRpb25zOiBudWxsLFxyXG5cclxuICAgICAgLy8ge09iamVjdH0gcGFzc2VkIHRvIEVuZXJneVNrYXRlUGFya0NvbnRyb2xQYW5lbCwgb3B0aW9ucyBmb3IgdGhlIEVuZXJneVNrYXRlUGFya1Zpc2liaWxpdHlDb250cm9scyBpbiB0aGF0XHJcbiAgICAgIC8vIHBhbmVsXHJcbiAgICAgIHZpc2liaWxpdHlDb250cm9sc09wdGlvbnM6IG51bGxcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG1vZGVsUG9pbnQgPSBuZXcgVmVjdG9yMiggMCwgMCApO1xyXG5cclxuICAgIC8vIGVhcnRoIGlzIDg2cHggaGlnaCBpbiBzdGFnZSBjb29yZGluYXRlc1xyXG4gICAgY29uc3Qgdmlld1BvaW50ID0gbmV3IFZlY3RvcjIoIHRoaXMubGF5b3V0Qm91bmRzLndpZHRoIC8gMiwgdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0IC0gQmFja2dyb3VuZE5vZGUuZWFydGhIZWlnaHQgKTtcclxuXHJcbiAgICAvLyBzY2FsZSBjaG9zZW4gc28gdGhhdCBkaXNwbGF5ZWQgbW9kZWwgaXMgdGhlIHNhbWUgYXMgaXQgd2FzIGZvciBlbmVyZ3ktc2thdGUtcGFyay1iYXNpY3Mgd2hlbiB0aGF0IHNpbVxyXG4gICAgLy8gdXNlZCBub24tZGVmYXVsdCBsYXlvdXQgYm91bmRzXHJcbiAgICBjb25zdCBzY2FsZSA9IDYxLjQwO1xyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyggbW9kZWxQb2ludCwgdmlld1BvaW50LCBzY2FsZSApO1xyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07XHJcblxyXG4gICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBuZXcgQm91bmRzMiggMCwgMCwgMCwgMCApLCB7XHJcbiAgICAgIHZhbHVlVHlwZTogWyBCb3VuZHMyIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eS5saW5rKCBib3VuZHMgPT4ge1xyXG4gICAgICBtb2RlbC5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LnNldCggYm91bmRzICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTWltaWMgdGhlIFBoZXRpb0dyb3VwIEFQSSB1bnRpbCB3ZSBpbXBsZW1lbnQgdGhlIGZ1bGwgaW5zdHJ1bWVudGF0aW9uXHJcbiAgICB0aGlzLnRyYWNrTm9kZUdyb3VwID0ge1xyXG4gICAgICBjcmVhdGVOZXh0RWxlbWVudCggdHJhY2ssIG1vZGVsVmlld1RyYW5zZm9ybSwgYXZhaWxhYmxlQm91bmRzUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIG9wdGlvbnMgJiYgYXNzZXJ0KCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3RhbmRlbScgKSwgJ3RhbmRlbSBpcyBtYW5hZ2VkIGJ5IHRoZSBQaGV0aW9Hcm91cCcgKTtcclxuICAgICAgICByZXR1cm4gbmV3IFRyYWNrTm9kZSggdHJhY2ssIG1vZGVsVmlld1RyYW5zZm9ybSwgYXZhaWxhYmxlQm91bmRzUHJvcGVydHksIFRhbmRlbS5PUFRfT1VULCBvcHRpb25zICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZFxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gd2hldGhlciBvciBub3QgdGhpcyBzY3JlZW4gdmlldyBzaG91bGQgaW5jbHVkZSBhIG1lYXN1cmluZyB0YXBlXHJcbiAgICB0aGlzLnNob3dUb29sYm94ID0gb3B0aW9ucy5zaG93VG9vbGJveDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gLSB2aXNpYmlsaXR5IG9mIHZhcmlvdXMgdmlldyBjb21wb25lbnRzXHJcbiAgICB0aGlzLnNob3dCYXJHcmFwaCA9IG9wdGlvbnMuc2hvd0JhckdyYXBoO1xyXG4gICAgdGhpcy5zaG93U2thdGVyUGF0aCA9IG9wdGlvbnMuc2hvd1NrYXRlclBhdGg7XHJcbiAgICB0aGlzLnNob3dSZWZlcmVuY2VIZWlnaHQgPSBvcHRpb25zLnNob3dSZWZlcmVuY2VIZWlnaHQ7XHJcbiAgICB0aGlzLnNob3dUcmFja0J1dHRvbnMgPSBvcHRpb25zLnNob3dUcmFja0J1dHRvbnM7XHJcbiAgICB0aGlzLnNob3dTZXBhcmF0ZVZpc2liaWxpdHlDb250cm9sc1BhbmVsID0gb3B0aW9ucy5zaG93U2VwYXJhdGVWaXNpYmlsaXR5Q29udHJvbHNQYW5lbDtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIHtudWxsfG51bWJlcn0gLSBkZWZpbmVzIHRoZSBtaW4gYW5kIG1heCBlZGdlcyBob3Jpem9udGFsbHkgZm9yIGZsb2F0aW5nIGxheW91dCwgbnVsbCB1bnRpbCBmaXJzdFxyXG4gICAgLy8gbGF5b3V0KCkgLSBpbmNsdWRlcyBwYWRkaW5nIHNvIGVsZW1lbnRzIHdvbid0IHRvdWNoIHRoZSBlZGdlXHJcbiAgICB0aGlzLmZpeGVkUmlnaHQgPSBudWxsO1xyXG4gICAgdGhpcy5maXhlZExlZnQgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gTGF5ZXJzIGZvciBub2RlcyBpbiB0aGUgc2ltLiBUaGUgYm90dG9tIGxheWVyIGNvbnRhaW5zIHRoZSBiYWNrZ3JvdW5kIGFuZCBVSSBjb21wb25lbnRzIHRoYXQgc2hvdWxkXHJcbiAgICAvLyBiZSBiZWhpbmQgdGhlIGFuaW1hdGluZyBza2F0ZXIgYW5kIG90aGVyIGRyYWdnYWJsZSB0aGluZ3MsIHdoaWNoIGFyZSBpbiB0aGUgdG9wTGF5ZXIuXHJcbiAgICB0aGlzLmJvdHRvbUxheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMudG9wTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5jaGlsZHJlbiA9IFsgdGhpcy5ib3R0b21MYXllciwgdGhpcy50b3BMYXllciBdO1xyXG5cclxuICAgIC8vIEBwcm90ZWN0ZWQgKHJlYWQtb25seSlcclxuICAgIHRoaXMuc2thdGVyTm9kZSA9IG5ldyBTa2F0ZXJOb2RlKFxyXG4gICAgICBtb2RlbC5za2F0ZXIsXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIG1vZGVsLnVzZXJDb250cm9sbGVkUHJvcGVydHlTZXQuc2thdGVyQ29udHJvbGxlZFByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vZGVsLmdldENsb3Nlc3RUcmFja0FuZFBvc2l0aW9uQW5kUGFyYW1ldGVyLmJpbmQoIG1vZGVsICksXHJcbiAgICAgIG1vZGVsLmdldFBoeXNpY2FsVHJhY2tzLmJpbmQoIG1vZGVsICksXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdza2F0ZXJOb2RlJyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIFRoZSBiYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmJhY2tncm91bmROb2RlID0gbmV3IEJhY2tncm91bmROb2RlKCB0aGlzLmxheW91dEJvdW5kcywgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdiYWNrZ3JvdW5kTm9kZScgKSApO1xyXG4gICAgdGhpcy5ib3R0b21MYXllci5hZGRDaGlsZCggdGhpcy5iYWNrZ3JvdW5kTm9kZSApO1xyXG5cclxuICAgIHRoaXMuZ3JpZE5vZGUgPSBuZXcgRW5lcmd5U2thdGVQYXJrR3JpZE5vZGUoIG1vZGVsLmdyaWRWaXNpYmxlUHJvcGVydHksIG1vZGVsLnNrYXRlci5yZWZlcmVuY2VIZWlnaHRQcm9wZXJ0eSwgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VuZXJneVNrYXRlUGFya0dyaWROb2RlJyApICk7XHJcbiAgICB0aGlzLmJvdHRvbUxheWVyLmFkZENoaWxkKCB0aGlzLmdyaWROb2RlICk7XHJcblxyXG4gICAgdGhpcy5jb250cm9sUGFuZWwgPSBuZXcgRW5lcmd5U2thdGVQYXJrQ29udHJvbFBhbmVsKCBtb2RlbCwgdGhpcywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRyb2xQYW5lbCcgKSwgb3B0aW9ucy5jb250cm9sUGFuZWxPcHRpb25zICk7XHJcbiAgICB0aGlzLmJvdHRvbUxheWVyLmFkZENoaWxkKCB0aGlzLmNvbnRyb2xQYW5lbCApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gbm9kZSB0aGF0IHNob3dzIHRoZSBlbmVyZ3kgbGVnZW5kIGZvciB0aGUgcGllIGNoYXJ0XHJcbiAgICB0aGlzLnBpZUNoYXJ0TGVnZW5kID0gbmV3IFBpZUNoYXJ0TGVnZW5kKFxyXG4gICAgICBtb2RlbC5za2F0ZXIsXHJcbiAgICAgIG1vZGVsLmNsZWFyVGhlcm1hbC5iaW5kKCBtb2RlbCApLFxyXG4gICAgICBtb2RlbC5waWVDaGFydFZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BpZUNoYXJ0TGVnZW5kJyApXHJcbiAgICApO1xyXG4gICAgdGhpcy5ib3R0b21MYXllci5hZGRDaGlsZCggdGhpcy5waWVDaGFydExlZ2VuZCApO1xyXG5cclxuICAgIC8vIEZvciB0aGUgcGxheWdyb3VuZCBzY3JlZW4sIHNob3cgYXR0YWNoL2RldGFjaCB0b2dnbGUgYnV0dG9uc1xyXG4gICAgaWYgKCBvcHRpb25zLnNob3dBdHRhY2hEZXRhY2hSYWRpb0J1dHRvbnMgKSB7XHJcbiAgICAgIGNvbnN0IHByb3BlcnR5ID0gbW9kZWwudHJhY2tzRHJhZ2dhYmxlID8gbmV3IFByb3BlcnR5KCB0cnVlICkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgIG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbW9kZWwuc2NlbmVQcm9wZXJ0eSBdLCBzY2VuZSA9PiB7IHNjZW5lID09PSAyOyB9ICk7XHJcbiAgICAgIHRoaXMuYXR0YWNoRGV0YWNoVG9nZ2xlQnV0dG9ucyA9IG5ldyBBdHRhY2hEZXRhY2hUb2dnbGVCdXR0b25zKCBtb2RlbC5zdGlja2luZ1RvVHJhY2tQcm9wZXJ0eSwgcHJvcGVydHksIDE4NCwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnMnICkgKTtcclxuICAgICAgdGhpcy5ib3R0b21MYXllci5hZGRDaGlsZCggdGhpcy5hdHRhY2hEZXRhY2hUb2dnbGVCdXR0b25zICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB0aGUgYmFyIGNoYXJ0IHNob3dpbmcgZW5lcmd5IGRpc3RyaWJ1dGlvblxyXG4gICAgaWYgKCB0aGlzLnNob3dCYXJHcmFwaCApIHtcclxuICAgICAgdGhpcy5lbmVyZ3lCYXJHcmFwaEFjY29yZGlvbkJveCA9IG5ldyBFbmVyZ3lCYXJHcmFwaEFjY29yZGlvbkJveCggbW9kZWwuc2thdGVyLCBtb2RlbC5iYXJHcmFwaFNjYWxlUHJvcGVydHksIG1vZGVsLmJhckdyYXBoVmlzaWJsZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZW5lcmd5QmFyR3JhcGhBY2NvcmRpb25Cb3gnICksIHtcclxuICAgICAgICBiYXJHcmFwaE9wdGlvbnM6IHtcclxuICAgICAgICAgIHNob3dCYXJHcmFwaFpvb21CdXR0b25zOiBvcHRpb25zLnNob3dCYXJHcmFwaFpvb21CdXR0b25zXHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuZW5lcmd5QmFyR3JhcGhBY2NvcmRpb25Cb3gubGVmdFRvcCA9IG5ldyBWZWN0b3IyKCA1LCA1ICk7XHJcbiAgICAgIHRoaXMuYm90dG9tTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuZW5lcmd5QmFyR3JhcGhBY2NvcmRpb25Cb3ggKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gQWxpZ24gdmVydGljYWxseSB3aXRoIG90aGVyIGNvbnRyb2xzLCBzZWUgIzEzNFxyXG4gICAgICBjZW50ZXJZOiAoIG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIDAgKSArIHRoaXMubGF5b3V0Qm91bmRzLm1heFkgKSAvIDIsXHJcblxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ib3R0b21MYXllci5hZGRDaGlsZCggdGhpcy5yZXNldEFsbEJ1dHRvbiApO1xyXG5cclxuICAgIC8vIFRoZSBidXR0b24gdG8gcmV0dXJuIHRoZSBza2F0ZXJcclxuICAgIHRoaXMucmV0dXJuU2thdGVyQnV0dG9uID0gbmV3IFJlY3Rhbmd1bGFyUHVzaEJ1dHRvbigge1xyXG4gICAgICBjb250ZW50OiBuZXcgVGV4dCggY29udHJvbHNSZXN0YXJ0U2thdGVyU3RyaW5nLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzdGFydFNrYXRlclRleHQnICksXHJcbiAgICAgICAgbWF4V2lkdGg6IDkwLFxyXG4gICAgICAgIGZvbnQ6IEVuZXJneVNrYXRlUGFya0NvbnN0YW50cy5DT05UUk9MX0xBQkVMX0ZPTlRcclxuICAgICAgfSApLFxyXG4gICAgICBsaXN0ZW5lcjogbW9kZWwucmV0dXJuU2thdGVyLmJpbmQoIG1vZGVsICksXHJcbiAgICAgIGNlbnRlclk6IHRoaXMucmVzZXRBbGxCdXR0b24uY2VudGVyWSxcclxuICAgICAgLy8gWCB1cGRhdGVkIGluIGxheW91dEJvdW5kcyBzaW5jZSB0aGUgcmVzZXQgYWxsIGJ1dHRvbiBjYW4gbW92ZSBob3Jpem9udGFsbHlcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmV0dXJuU2thdGVyQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRGlzYWJsZSB0aGUgcmV0dXJuIHNrYXRlciBidXR0b24gd2hlbiB0aGUgc2thdGVyIGlzIGFscmVhZHkgYXQgaGlzIGluaXRpYWwgY29vcmRpbmF0ZXNcclxuICAgIG1vZGVsLnNrYXRlci5tb3ZlZFByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRoaXMucmV0dXJuU2thdGVyQnV0dG9uLCAnZW5hYmxlZCcgKTtcclxuICAgIHRoaXMuYm90dG9tTGF5ZXIuYWRkQ2hpbGQoIHRoaXMucmV0dXJuU2thdGVyQnV0dG9uICk7XHJcblxyXG4gICAgY29uc3QgZ2F1Z2VSYWRpdXMgPSA3NjtcclxuXHJcbiAgICAvLyBAcHJvdGVjdGVkIChyZWFkLW9ubHkpIC0gZm9yIGxheW91dCBvciByZXBvc2l0aW9uaW5nIGluIHN1YnR5cGVzXHJcbiAgICB0aGlzLnNwZWVkb21ldGVyTm9kZSA9IG5ldyBWYWx1ZUdhdWdlTm9kZSggbW9kZWwuc2thdGVyLnNwZWVkUHJvcGVydHksIHByb3BlcnRpZXNTcGVlZFN0cmluZ1Byb3BlcnR5LCBuZXcgUmFuZ2UoIDAsIDMwICksIHtcclxuICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICB2YWx1ZVBhdHRlcm46IHNwZWVkb21ldGVyTWV0ZXJzUGVyU2Vjb25kUGF0dGVyblN0cmluZyxcclxuICAgICAgICBkZWNpbWFsUGxhY2VzOiAxLFxyXG4gICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICBtYXhXaWR0aDogZ2F1Z2VSYWRpdXMgKiAxLjMsXHJcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDIwIClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHVwZGF0ZVdoZW5JbnZpc2libGU6IGZhbHNlLFxyXG4gICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIHJhZGl1czogZ2F1Z2VSYWRpdXMsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NwZWVkb21ldGVyTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgbW9kZWwuc3BlZWRvbWV0ZXJWaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcy5zcGVlZG9tZXRlck5vZGUsICd2aXNpYmxlJyApO1xyXG4gICAgbW9kZWwuc3BlZWRWYWx1ZVZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHsgdGhpcy5zcGVlZG9tZXRlck5vZGUuc2V0TnVtYmVyRGlzcGxheVZpc2libGUoIHZpc2libGUgKTsgfSApO1xyXG5cclxuICAgIC8vIGRlZmF1bHQgbGF5b3V0LCBidXQgbWF5IGNoYW5nZSBpbiBzdWJ0eXBlc1xyXG4gICAgdGhpcy5zcGVlZG9tZXRlck5vZGUuY2VudGVyWCA9IHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclg7XHJcbiAgICB0aGlzLnNwZWVkb21ldGVyTm9kZS50b3AgPSB0aGlzLmxheW91dEJvdW5kcy5taW5ZICsgNTtcclxuICAgIHRoaXMuYm90dG9tTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuc3BlZWRvbWV0ZXJOb2RlICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAoZm9yIGxheW91dCkgLSBMYXllciB3aGljaCB3aWxsIGNvbnRhaW4gYWxsIG9mIHRoZSB0cmFja3NcclxuICAgIHRoaXMudHJhY2tMYXllciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RyYWNrTGF5ZXInIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0cmFja3Mgb24gdG9wIG9mIHBhbmVscyBhbmQgbm9uLWludGVyYWN0aXZlIHZpc3VhbGl6YXRpb25zXHJcbiAgICB0aGlzLnRvcExheWVyLmFkZENoaWxkKCB0aGlzLnRyYWNrTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBhZGQgYSBtZWFzdXJpbmcgdGFwZSwgb24gdG9wIG9mIHRyYWNrcywgYmVsb3cgdGhlIHNrYXRlclxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dUb29sYm94ICkge1xyXG5cclxuICAgICAgY29uc3QgdW5pdHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggeyBuYW1lOiBtZWFzdXJpbmdUYXBlVW5pdHNTdHJpbmcsIG11bHRpcGxpZXI6IDEgfSApO1xyXG5cclxuICAgICAgLy8gQHByaXZhdGUge01lYXN1cmluZ1RhcGVOb2RlfVxyXG4gICAgICB0aGlzLm1lYXN1cmluZ1RhcGVOb2RlID0gbmV3IE1lYXN1cmluZ1RhcGVOb2RlKCB1bml0c1Byb3BlcnR5LCB7XHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC5tZWFzdXJpbmdUYXBlVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIGJhc2VQb3NpdGlvblByb3BlcnR5OiBtb2RlbC5tZWFzdXJpbmdUYXBlQmFzZVBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgdGlwUG9zaXRpb25Qcm9wZXJ0eTogbW9kZWwubWVhc3VyaW5nVGFwZVRpcFBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtOiBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgICAgZHJhZ0JvdW5kczogdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kc1Byb3BlcnR5LmdldCgpLFxyXG4gICAgICAgIHRleHRCYWNrZ3JvdW5kQ29sb3I6IEVuZXJneVNrYXRlUGFya0NvbG9yU2NoZW1lLnRyYW5zcGFyZW50UGFuZWxGaWxsLFxyXG4gICAgICAgIHRleHRDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgICB0ZXh0Rm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE0LjcgfSApLFxyXG4gICAgICAgIGJhc2VEcmFnRW5kZWQ6ICgpID0+IHtcclxuICAgICAgICAgIGlmICggdGhpcy5tZWFzdXJpbmdUYXBlTm9kZS5nZXRMb2NhbEJhc2VCb3VuZHMoKS5pbnRlcnNlY3RzQm91bmRzKCB0aGlzLnRvb2xib3hQYW5lbC5ib3VuZHMgKSApIHtcclxuICAgICAgICAgICAgbW9kZWwubWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtZWFzdXJpbmdUYXBlTm9kZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBAcHJpdmF0ZVxyXG4gICAgICB0aGlzLnN0b3B3YXRjaE5vZGUgPSBuZXcgU3RvcHdhdGNoTm9kZSggbW9kZWwuc3RvcHdhdGNoLCB7XHJcbiAgICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzdG9wd2F0Y2hOb2RlJyApLFxyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICBudW1iZXJGb3JtYXR0ZXI6IFN0b3B3YXRjaE5vZGUuY3JlYXRlUmljaFRleHROdW1iZXJGb3JtYXR0ZXIoIHtcclxuICAgICAgICAgICAgYmlnTnVtYmVyRm9udDogMjUsXHJcbiAgICAgICAgICAgIHNtYWxsTnVtYmVyRm9udDogMTdcclxuICAgICAgICAgIH0gKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZHJhZ0xpc3RlbmVyT3B0aW9uczoge1xyXG4gICAgICAgICAgZW5kOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICggdGhpcy5zdG9wd2F0Y2hOb2RlLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCB0aGlzLnRvb2xib3hQYW5lbC5ib3VuZHMgKSApIHtcclxuICAgICAgICAgICAgICBtb2RlbC5zdG9wd2F0Y2guaXNWaXNpYmxlUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggdGhpcy5zdG9wd2F0Y2hOb2RlICk7XHJcbiAgICAgIHRoaXMudG9wTGF5ZXIuYWRkQ2hpbGQoIHRoaXMubWVhc3VyaW5nVGFwZU5vZGUgKTtcclxuXHJcbiAgICAgIC8vIEBwcml2YXRlIHtUb29sYm94UGFuZWx9IC0gc28gaXQgY2FuIGZsb2F0IHRvIHRoZSBsYXlvdXQgYm91bmRzLCBzZWUgbGF5b3V0KClcclxuICAgICAgdGhpcy50b29sYm94UGFuZWwgPSBuZXcgVG9vbGJveFBhbmVsKCBtb2RlbCwgdGhpcywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Rvb2xib3hQYW5lbCcgKSwge1xyXG4gICAgICAgIG1pbldpZHRoOiB0aGlzLmNvbnRyb2xQYW5lbC53aWR0aFxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuYm90dG9tTGF5ZXIuYWRkQ2hpbGQoIHRoaXMudG9vbGJveFBhbmVsICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1JlZmVyZW5jZUhlaWdodExpbmV9IC0gYWJvdmUgdGhlIHRyYWNrIGJlY2F1c2UgaXQgaXMgZHJhZ2dhYmxlLCBidXQgYmVsb3cgdGhlIHNrYXRlciBiZWNhdXNlXHJcbiAgICAvLyBpdCBpcyBpbXBvcnRhbnQgZm9yIHRoZSBza2F0ZXIgY2VudGVyIG9mIG1hc3MgcmVwcmVzZW50YXRpb24gdG8gYWx3YXlzIGJlIHZpc2libGVcclxuICAgIHRoaXMucmVmZXJlbmNlSGVpZ2h0TGluZSA9IG5ldyBSZWZlcmVuY2VIZWlnaHRMaW5lKFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vZGVsLnNrYXRlci5yZWZlcmVuY2VIZWlnaHRQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwucmVmZXJlbmNlSGVpZ2h0VmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbC51c2VyQ29udHJvbGxlZFByb3BlcnR5U2V0LnJlZmVyZW5jZUhlaWdodENvbnRyb2xsZWRQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZmVyZW5jZUhlaWdodExpbmUnIClcclxuICAgICk7XHJcbiAgICB0aGlzLnRvcExheWVyLmFkZENoaWxkKCB0aGlzLnJlZmVyZW5jZUhlaWdodExpbmUgKTtcclxuXHJcbiAgICAvLyBza2F0ZXJOb2RlIGlzIGFib3ZlIG1vc3QgdGhpbmdzIGFzIGl0IGlzIHRoZSBwcmltYXJ5IGRyYWdnYWJsZSBvYmplY3RcclxuICAgIHRoaXMudG9wTGF5ZXIuYWRkQ2hpbGQoIHRoaXMuc2thdGVyTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IHBpZUNoYXJ0Tm9kZSA9IG5ldyBQaWVDaGFydE5vZGUoIG1vZGVsLnNrYXRlciwgbW9kZWwucGllQ2hhcnRWaXNpYmxlUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BpZUNoYXJ0Tm9kZScgKSApO1xyXG4gICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggcGllQ2hhcnROb2RlICk7XHJcblxyXG4gICAgLy8gcmVsYXRpdmUgdG8gdGhlIGNvbnRyb2wgcGFuZWwsIGJ1dCB0aGlzIHdpbGwgbm90IGZsb2F0IHdpdGggdGhlIGxheW91dFxyXG4gICAgdGhpcy5yZWZlcmVuY2VIZWlnaHRMaW5lLmNlbnRlclggPSB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYO1xyXG5cclxuICAgIC8vIEJ1dHRvbnMgdG8gcmV0dXJuIHRoZSBza2F0ZXIgd2hlbiBzaGUgaXMgb2Zmc2NyZWVuLCBzZWUgIzIxOVxyXG4gICAgY29uc3QgaWNvblNjYWxlID0gMC4xOTtcclxuICAgIGNvbnN0IHJldHVyblNrYXRlclRvUHJldmlvdXNTdGFydGluZ1Bvc2l0aW9uQnV0dG9uSW1hZ2UgPSBuZXcgSW1hZ2UoIHNrYXRlcjFfc2V0MV9sZWZ0X3BuZywge1xyXG4gICAgICBzY2FsZTogaWNvblNjYWxlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdza2F0ZXJJY29uSW1hZ2UxJyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByZXR1cm5Ta2F0ZXJUb1ByZXZpb3VzU3RhcnRpbmdQb3NpdGlvbkJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogcmV0dXJuU2thdGVyVG9QcmV2aW91c1N0YXJ0aW5nUG9zaXRpb25CdXR0b25JbWFnZSxcclxuXHJcbiAgICAgIC8vIGdyZWVuIG1lYW5zIFwiZ29cIiBzaW5jZSB0aGUgc2thdGVyIHdpbGwgbGlrZWx5IHN0YXJ0IG1vdmluZyBhdCB0aGlzIHBvaW50XHJcbiAgICAgIGJhc2VDb2xvcjogRW5lcmd5U2thdGVQYXJrQ29sb3JTY2hlbWUua2luZXRpY0VuZXJneSxcclxuICAgICAgbGlzdGVuZXI6IG1vZGVsLnJldHVyblNrYXRlci5iaW5kKCBtb2RlbCApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXR1cm5Ta2F0ZXJUb1ByZXZpb3VzU3RhcnRpbmdQb3NpdGlvbkJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJldHVyblNrYXRlclRvR3JvdW5kQnV0dG9uSW1hZ2UgPSBuZXcgSW1hZ2UoIHNrYXRlcjFfc2V0MV9sZWZ0X3BuZywge1xyXG4gICAgICBzY2FsZTogaWNvblNjYWxlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdza2F0ZXJJY29uSW1hZ2UyJyApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByZXR1cm5Ta2F0ZXJUb0dyb3VuZEJ1dHRvbiA9IG5ldyBSZWN0YW5ndWxhclB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogcmV0dXJuU2thdGVyVG9Hcm91bmRCdXR0b25JbWFnZSxcclxuICAgICAgY2VudGVyQm90dG9tOiBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggbW9kZWwuc2thdGVyLnN0YXJ0aW5nUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApLFxyXG4gICAgICBiYXNlQ29sb3I6ICcjZjQ1MTRlJywgLy8gcmVkIGZvciBzdG9wLCBzaW5jZSB0aGUgc2thdGVyIHdpbGwgYmUgc3RvcHBlZCBvbiB0aGUgZ3JvdW5kLlxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyByZXNldHRpbmcgdGhlIHNrYXRlciBwb3NpdGlvbiB3aWxsIGNoYW5nZSBzdGF0ZSBvZiBzaW11bGF0aW9uXHJcbiAgICAgICAgbW9kZWwudXNlckNvbnRyb2xsZWRQcm9wZXJ0eVNldC5za2F0ZXJDb250cm9sbGVkUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgICAgbW9kZWwuc2thdGVyLnJlc2V0UG9zaXRpb24oKTtcclxuICAgICAgICBtb2RlbC51c2VyQ29udHJvbGxlZFByb3BlcnR5U2V0LnNrYXRlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JldHVyblNrYXRlclRvR3JvdW5kQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwucHJlZmVyZW5jZXNNb2RlbC5za2F0ZXJDaGFyYWN0ZXJTZXRQcm9wZXJ0eS5saW5rKCBza2F0ZXJDaGFyYWN0ZXJTZXQgPT4ge1xyXG4gICAgICByZXR1cm5Ta2F0ZXJUb1ByZXZpb3VzU3RhcnRpbmdQb3NpdGlvbkJ1dHRvbkltYWdlLnNldEltYWdlKCBza2F0ZXJDaGFyYWN0ZXJTZXQuaW1hZ2VTZXQxLmxlZnRJbWFnZSApO1xyXG4gICAgICByZXR1cm5Ta2F0ZXJUb0dyb3VuZEJ1dHRvbkltYWdlLnNldEltYWdlKCBza2F0ZXJDaGFyYWN0ZXJTZXQuaW1hZ2VTZXQxLmxlZnRJbWFnZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRoZSBcInJldHVybiBza2F0ZXJcIiBidXR0b25zIGFyZSBpbiB0aGUgdG9wIGxheWVyIHNvIHRoYXQgdGhleSBjYW4gYmUgb24gdG9wIG9mIHRoZSB0cmFjayBhbmQgZWFzaWx5IHZpc2libGVcclxuICAgIC8vIHdoZW4gdGhlIHNrYXRlciBnb2VzIG9mZiBzY3JlZW5cclxuICAgIHRoaXMudG9wTGF5ZXIuYWRkQ2hpbGQoIHJldHVyblNrYXRlclRvUHJldmlvdXNTdGFydGluZ1Bvc2l0aW9uQnV0dG9uICk7XHJcbiAgICB0aGlzLnRvcExheWVyLmFkZENoaWxkKCByZXR1cm5Ta2F0ZXJUb0dyb3VuZEJ1dHRvbiApO1xyXG5cclxuICAgIGNvbnN0IHBsYXlpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoICFtb2RlbC5wYXVzZWRQcm9wZXJ0eS52YWx1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwbGF5aW5nUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIG1vZGVsLnBhdXNlZFByb3BlcnR5LmxpbmsoIHBhdXNlZCA9PiB7XHJcbiAgICAgIHBsYXlpbmdQcm9wZXJ0eS5zZXQoICFwYXVzZWQgKTtcclxuICAgIH0gKTtcclxuICAgIHBsYXlpbmdQcm9wZXJ0eS5saW5rKCBwbGF5aW5nID0+IHtcclxuICAgICAgbW9kZWwucGF1c2VkUHJvcGVydHkuc2V0KCAhcGxheWluZyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBsYXkvcGF1c2UgYW5kIHN0ZXAgYnV0dG9ucyBhcmUgc2FtZSBzaXplIHVudGlsIHBsYXlpbmdQcm9wZXJ0eSBpcyBmYWxzZVxyXG4gICAgdGhpcy50aW1lQ29udHJvbE5vZGUgPSBuZXcgVGltZUNvbnRyb2xOb2RlKCBwbGF5aW5nUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGltZUNvbnRyb2xOb2RlJyApLFxyXG4gICAgICB0aW1lU3BlZWRQcm9wZXJ0eTogbW9kZWwudGltZVNwZWVkUHJvcGVydHksXHJcbiAgICAgIGJ1dHRvbkdyb3VwWFNwYWNpbmc6IDIzLjMsIC8vIGV4dHJhIHNwYWNpbmcgYXZvaWRzIHBvaW50ZXIgYXJlYSBvdmVybGFwIHdoZW4gcGxheSBwYXVzZSBidXR0b24gc2l6ZSBpbmNyZWFzZXNcclxuICAgICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBwbGF5UGF1c2VCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICByYWRpdXM6IDIyLjFcclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0ZXBGb3J3YXJkQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgcmFkaXVzOiAxNixcclxuICAgICAgICAgIGxpc3RlbmVyOiBtb2RlbC5tYW51YWxTdGVwLmJpbmQoIG1vZGVsIClcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHNwZWVkUmFkaW9CdXR0b25Hcm91cE9wdGlvbnM6IHtcclxuICAgICAgICBsYWJlbE9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTcgKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICByYWRpdXM6IDEwXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggdGhpcy50aW1lQ29udHJvbE5vZGUgKTtcclxuXHJcbiAgICB0aGlzLnRpbWVDb250cm9sTm9kZS5zZXRDZW50ZXJCb3R0b20oIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlckJvdHRvbS5taW51c1hZKCAwLCAxNSApICk7XHJcblxyXG4gICAgLy8gZ3JpZCBhbmQgcmVmZXJlbmNlIGhlaWdodCB2aXNpYmlsaXR5IGFyZSBjb250cm9sbGVkIGZyb20gYSBzZXBhcmF0ZSBwYW5lbFxyXG4gICAgaWYgKCB0aGlzLnNob3dTZXBhcmF0ZVZpc2liaWxpdHlDb250cm9sc1BhbmVsICkge1xyXG5cclxuICAgICAgLy8gQHByb3RlY3RlZCAocmVhZC1vbmx5KSAtIGZvciBsYXlvdXRcclxuICAgICAgdGhpcy52aXNpYmlsaXR5Q29udHJvbHNQYW5lbCA9IG5ldyBWaXNpYmlsaXR5Q29udHJvbHNQYW5lbCggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aXNpYmlsaXR5Q29udHJvbHNQYW5lbCcgKSwge1xyXG4gICAgICAgIGNlbnRlclk6IHRoaXMudGltZUNvbnRyb2xOb2RlLmNlbnRlcllcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZFRvQm90dG9tTGF5ZXIoIHRoaXMudmlzaWJpbGl0eUNvbnRyb2xzUGFuZWwgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXaGVuIHRoZSBza2F0ZXIgZ29lcyBvZmYgc2NyZWVuLCBtYWtlIHRoZSBcInJldHVybiBza2F0ZXJcIiBidXR0b24gYmlnXHJcbiAgICBtb2RlbC5za2F0ZXJJbkJvdW5kc1Byb3BlcnR5LmxpbmsoIGluQm91bmRzID0+IHtcclxuICAgICAgY29uc3QgYnV0dG9uc1Zpc2libGUgPSAhaW5Cb3VuZHM7XHJcbiAgICAgIHJldHVyblNrYXRlclRvR3JvdW5kQnV0dG9uLnZpc2libGUgPSBidXR0b25zVmlzaWJsZTtcclxuICAgICAgcmV0dXJuU2thdGVyVG9QcmV2aW91c1N0YXJ0aW5nUG9zaXRpb25CdXR0b24udmlzaWJsZSA9IGJ1dHRvbnNWaXNpYmxlO1xyXG5cclxuICAgICAgaWYgKCBidXR0b25zVmlzaWJsZSApIHtcclxuXHJcbiAgICAgICAgLy8gUHV0IHRoZSBidXR0b24gd2hlcmUgdGhlIHNrYXRlciB3aWxsIGFwcGVhci4gIE51ZGdlIGl0IHVwIGEgYml0IHNvIHRoZSBtb3VzZSBjYW4gaGl0IGl0IGZyb20gdGhlIGRyb3Agc2l0ZSxcclxuICAgICAgICAvLyB3aXRob3V0IGJlaW5nIG1vdmVkIGF0IGFsbCAodG8gc2ltcGxpZnkgcmVwZWF0IHJ1bnMpLlxyXG4gICAgICAgIGNvbnN0IHZpZXdQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1Bvc2l0aW9uKCBtb2RlbC5za2F0ZXIuc3RhcnRpbmdQb3NpdGlvblByb3BlcnR5LnZhbHVlICkucGx1c1hZKCAwLCA1ICk7XHJcbiAgICAgICAgcmV0dXJuU2thdGVyVG9QcmV2aW91c1N0YXJ0aW5nUG9zaXRpb25CdXR0b24uY2VudGVyQm90dG9tID0gdmlld1Bvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgcmV0dXJuIHNrYXRlciBidXR0b24gd2VudCBvZmZzY3JlZW4sIG1vdmUgaXQgYmFjayBvbiB0aGUgc2NyZWVuLCBzZWUgIzIyMiBhbmQgIzM1NVxyXG4gICAgICAgIGlmICggcmV0dXJuU2thdGVyVG9QcmV2aW91c1N0YXJ0aW5nUG9zaXRpb25CdXR0b24udG9wIDwgNSApIHtcclxuICAgICAgICAgIHJldHVyblNrYXRlclRvUHJldmlvdXNTdGFydGluZ1Bvc2l0aW9uQnV0dG9uLnRvcCA9IDU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggcmV0dXJuU2thdGVyVG9QcmV2aW91c1N0YXJ0aW5nUG9zaXRpb25CdXR0b24ubGVmdCA8IDUgKSB7XHJcbiAgICAgICAgICByZXR1cm5Ta2F0ZXJUb1ByZXZpb3VzU3RhcnRpbmdQb3NpdGlvbkJ1dHRvbi5sZWZ0ID0gNTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCByZXR1cm5Ta2F0ZXJUb1ByZXZpb3VzU3RhcnRpbmdQb3NpdGlvbkJ1dHRvbi5yaWdodCA+IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gNSApIHtcclxuICAgICAgICAgIHJldHVyblNrYXRlclRvUHJldmlvdXNTdGFydGluZ1Bvc2l0aW9uQnV0dG9uLnJpZ2h0ID0gdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSA1O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIG1vZGVsIHJlc2V0cywgZ28gYmFjayB0byB0aGUgZGVmYXVsdCBza2F0ZXIgZm9yIHRoZSBzZWxlY3RlZCBzZXQgKGNoYXJhY3RlciBzZXQgaXRzZWxmIGRvZXMgbm90IHJlc2V0KVxyXG4gICAgdGhpcy5tb2RlbC5yZXNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5za2F0ZXJOb2RlLnNrYXRlckltYWdlU2V0UHJvcGVydHkudmFsdWUgPSBtb2RlbC5wcmVmZXJlbmNlc01vZGVsLnNrYXRlckNoYXJhY3RlclNldFByb3BlcnR5LnZhbHVlLmltYWdlU2V0MTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBGb3IgZGVidWdnaW5nIHRoZSB2aXNpYmxlIGJvdW5kc1xyXG4gICAgaWYgKCBzaG93QXZhaWxhYmxlQm91bmRzICkge1xyXG4gICAgICB0aGlzLnZpZXdCb3VuZHNQYXRoID0gbmV3IFBhdGgoIG51bGwsIHtcclxuICAgICAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgICAgc3Ryb2tlOiAncmVkJyxcclxuICAgICAgICBsaW5lV2lkdGg6IDEwLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXdCb3VuZHNQYXRoJyApXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggdGhpcy52aWV3Qm91bmRzUGF0aCApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LmxhenlMaW5rKCB2aXNpYmxlQm91bmRzID0+IHtcclxuXHJcbiAgICAgIC8vIENvbXB1dGUgdGhlIHZpc2libGUgbW9kZWwgYm91bmRzIHNvIHdlIHdpbGwga25vdyB3aGVuIGEgbW9kZWwgb2JqZWN0IGxpa2UgdGhlIHNrYXRlciBoYXMgZ29uZSBvZmZzY3JlZW5cclxuICAgICAgdGhpcy5hdmFpbGFibGVNb2RlbEJvdW5kcyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCB2aXNpYmxlQm91bmRzICk7XHJcbiAgICAgIHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHNQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuYXZhaWxhYmxlTW9kZWxCb3VuZHM7XHJcblxyXG4gICAgICAvLyBsaW1pdCBtZWFzdXJpbmcgdGFwZSB0byBhdmFpbGFibGUgYXJlYVxyXG4gICAgICBpZiAoIG9wdGlvbnMuc2hvd1Rvb2xib3ggKSB7XHJcbiAgICAgICAgdGhpcy5tZWFzdXJpbmdUYXBlTm9kZS5zZXREcmFnQm91bmRzKCB0aGlzLmF2YWlsYWJsZU1vZGVsQm91bmRzICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNob3cgaXQgZm9yIGRlYnVnZ2luZ1xyXG4gICAgICBpZiAoIHNob3dBdmFpbGFibGVCb3VuZHMgKSB7XHJcbiAgICAgICAgdGhpcy52aWV3Qm91bmRzUGF0aC5zaGFwZSA9IFNoYXBlLmJvdW5kcyggdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGF5b3V0IHRoZSBFbmVyZ3lTa2F0ZVBhcmtTY3JlZW5WaWV3LCBzY2FsaW5nIGl0IHVwIGFuZCBkb3duIHdpdGggdGhlIHNpemUgb2YgdGhlIHNjcmVlbiB0byBlbnN1cmUgYVxyXG4gICAqIG1pbmltYWxseSB2aXNpYmxlIGFyZWEsIGJ1dCBrZWVwaW5nIGl0IGNlbnRlcmVkIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbiwgc28gdGhlcmUgaXMgbW9yZSBhcmVhIGluIHRoZSAreVxyXG4gICAqIGRpcmVjdGlvbiB0byBidWlsZCB0cmFja3MgYW5kIG1vdmUgdGhlIHNrYXRlci5cclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IHZpZXdCb3VuZHNcclxuICAgKi9cclxuICBsYXlvdXQoIHZpZXdCb3VuZHMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmNvbnRyb2xQYW5lbCwgJ211Y2ggb2YgY29tcG9uZW50IGxheW91dCBiYXNlZCBvbiBjb250cm9sIHBhbmVsLCBvbmUgc2hvdWxkIGJlIGNyZWF0ZWQuJyApO1xyXG5cclxuICAgIHRoaXMucmVzZXRUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuZ2V0TGF5b3V0U2NhbGUoIHZpZXdCb3VuZHMgKTtcclxuICAgIGNvbnN0IHdpZHRoID0gdmlld0JvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHZpZXdCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICk7XHJcblxyXG4gICAgbGV0IG9mZnNldFggPSAwO1xyXG4gICAgbGV0IG9mZnNldFkgPSAwO1xyXG5cclxuICAgIC8vIE1vdmUgdG8gYm90dG9tIHZlcnRpY2FsbHlcclxuICAgIGlmICggc2NhbGUgPT09IHdpZHRoIC8gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKSB7XHJcbiAgICAgIG9mZnNldFkgPSAoIGhlaWdodCAvIHNjYWxlIC0gdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2VudGVyIGhvcml6b250YWxseVxyXG4gICAgZWxzZSBpZiAoIHNjYWxlID09PSBoZWlnaHQgLyB0aGlzLmxheW91dEJvdW5kcy5oZWlnaHQgKSB7XHJcbiAgICAgIG9mZnNldFggPSAoIHdpZHRoIC0gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKiBzY2FsZSApIC8gMiAvIHNjYWxlO1xyXG4gICAgfVxyXG4gICAgdGhpcy50cmFuc2xhdGUoIG9mZnNldFggKyB2aWV3Qm91bmRzLmxlZnQgLyBzY2FsZSwgb2Zmc2V0WSArIHZpZXdCb3VuZHMudG9wIC8gc2NhbGUgKTtcclxuXHJcbiAgICAvLyBhdmFpbGFibGVWaWV3Qm91bmRzIGluIHRoaXMgc2ltIGlzIHRoZSB2aXNpYmxlIGFyZWEgYWJvdmUgZ3JvdW5kICh5PTApXHJcbiAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS5zZXQoIG5ldyBEb3RSZWN0YW5nbGUoIC1vZmZzZXRYLCAtb2Zmc2V0WSwgd2lkdGggLyBzY2FsZSwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCAwICkgKyBNYXRoLmFicyggb2Zmc2V0WSApICkgKTtcclxuXHJcbiAgICBjb25zdCBtYXhGbG9hdEFtb3VudCA9IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0ICsgRVhUUkFfRkxPQVQ7XHJcbiAgICBjb25zdCBtaW5GbG9hdEFtb3VudCA9IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgLSBFWFRSQV9GTE9BVDtcclxuXHJcbiAgICAvLyBmb3IgdXNlIGluIHN1YnR5cGVzXHJcbiAgICB0aGlzLmZpeGVkUmlnaHQgPSBNYXRoLm1pbiggbWF4RmxvYXRBbW91bnQsIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LmdldCgpLm1heFggKSAtIDY7XHJcbiAgICB0aGlzLmZpeGVkTGVmdCA9IE1hdGgubWF4KCBtaW5GbG9hdEFtb3VudCwgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkuZ2V0KCkubWluWCApICsgNjtcclxuXHJcbiAgICB0aGlzLmNvbnRyb2xQYW5lbC50b3AgPSA2O1xyXG4gICAgdGhpcy5jb250cm9sUGFuZWwucmlnaHQgPSB0aGlzLmZpeGVkUmlnaHQ7XHJcblxyXG4gICAgaWYgKCB0aGlzLmF0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnMgKSB7XHJcbiAgICAgIHRoaXMuYXR0YWNoRGV0YWNoVG9nZ2xlQnV0dG9ucy50b3AgPSB0aGlzLmNvbnRyb2xQYW5lbC5ib3R0b20gKyA1O1xyXG4gICAgICB0aGlzLmF0dGFjaERldGFjaFRvZ2dsZUJ1dHRvbnMuY2VudGVyWCA9IHRoaXMuY29udHJvbFBhbmVsLmNlbnRlclg7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5yZXNldEFsbEJ1dHRvbi5yaWdodCA9IHRoaXMuY29udHJvbFBhbmVsLnJpZ2h0O1xyXG4gICAgdGhpcy5yZXR1cm5Ta2F0ZXJCdXR0b24ucmlnaHQgPSB0aGlzLnJlc2V0QWxsQnV0dG9uLmxlZnQgLSAxMDtcclxuXHJcbiAgICBpZiAoIHRoaXMuc2hvd1Rvb2xib3ggKSB7XHJcbiAgICAgIHRoaXMudG9vbGJveFBhbmVsLnRvcCA9IHRoaXMuY29udHJvbFBhbmVsLmJvdHRvbSArIDU7XHJcbiAgICAgIHRoaXMudG9vbGJveFBhbmVsLnJpZ2h0ID0gdGhpcy5jb250cm9sUGFuZWwucmlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcGllIGNoYXJ0IGxlZ2VuZCBwb3NpdGlvbiBpcyBkZXBlbmRlbnQgb24gd2hldGhlciBvciBub3QgdGhlIHNjcmVlbiBpbmNsdWRlcyBhbiBlbmVyZ3kgYmFyIGdyYXBoXHJcbiAgICBsZXQgcGllQ2hhcnRMZWdlbmRMZWZ0VG9wID0gbnVsbDtcclxuICAgIGlmICggdGhpcy5zaG93QmFyR3JhcGggKSB7XHJcbiAgICAgIHRoaXMuZW5lcmd5QmFyR3JhcGhBY2NvcmRpb25Cb3gueCA9IHRoaXMuZml4ZWRMZWZ0O1xyXG4gICAgICBwaWVDaGFydExlZ2VuZExlZnRUb3AgPSBuZXcgVmVjdG9yMiggdGhpcy5lbmVyZ3lCYXJHcmFwaEFjY29yZGlvbkJveC5yaWdodCArIDQ1LCB0aGlzLmVuZXJneUJhckdyYXBoQWNjb3JkaW9uQm94LnRvcCApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHBpZUNoYXJ0TGVnZW5kTGVmdFRvcCA9IG5ldyBWZWN0b3IyKCB0aGlzLmZpeGVkTGVmdCwgdGhpcy5jb250cm9sUGFuZWwudG9wICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLnNob3dTZXBhcmF0ZVZpc2liaWxpdHlDb250cm9sc1BhbmVsICkge1xyXG4gICAgICB0aGlzLnZpc2liaWxpdHlDb250cm9sc1BhbmVsLmxlZnQgPSB0aGlzLmZpeGVkTGVmdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQdXQgdGhlIHBpZSBjaGFydCBsZWdlbmQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBiYXIgY2hhcnQsIHNlZSAjNjAsICMxOTJcclxuICAgIHRoaXMucGllQ2hhcnRMZWdlbmQubXV0YXRlKCB7IGxlZnRUb3A6IHBpZUNoYXJ0TGVnZW5kTGVmdFRvcCB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBub2RlIHRvIHRoZSBmcm9udCBvZiB0aGUgYm90dG9tIGxheWVyICh0aGUgZW5kIG9mIHRoaXMuYmFja0xheWVyIGNoaWxkcmVuIGFycmF5KS4gVGhpcyBsYXllciBpcyBiZWhpbmRcclxuICAgKiBhbmltYXRpbmcgb3IgbW92YWJsZSB0aGluZ3MgaW4gdGhlIHNpbSBsaWtlIHRoZSBza2F0ZXIuIFRoaXMgaXMgdXNlZnVsIGZvciBhZGRpbmcgc3BlY2lmaWMgY29udHJvbC1wYW5lbCBsaWtlXHJcbiAgICogdGhpbmdzIGluIHN1YnR5cGVzIHRoYXQgc2hvdWxkIGJlIGJlaGluZCB0aGUgc2thdGVyLlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gICAqL1xyXG4gIGFkZFRvQm90dG9tTGF5ZXIoIG5vZGUgKSB7XHJcbiAgICB0aGlzLmJvdHRvbUxheWVyLmFkZENoaWxkKCBub2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG5lbmVyZ3lTa2F0ZVBhcmsucmVnaXN0ZXIoICdFbmVyZ3lTa2F0ZVBhcmtTY3JlZW5WaWV3JywgRW5lcmd5U2thdGVQYXJrU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBFbmVyZ3lTa2F0ZVBhcmtTY3JlZW5WaWV3OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxZQUFZLE1BQU0saUNBQWlDLENBQUMs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