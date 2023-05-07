// Copyright 2016-2023, University of Colorado Boulder

/**
 * Common view for a screen.
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import platform from '../../../../phet-core/js/platform.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { Image, Node } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import david_png from '../../../images/david_png.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
import ProjectileMotionConstants from '../ProjectileMotionConstants.js';
import BackgroundNode from './BackgroundNode.js';
import CannonNode from './CannonNode.js';
import DataProbeNode from './DataProbeNode.js';
import FireButton from './FireButton.js';
import TargetNode from './TargetNode.js';
import ToolboxPanel from './ToolboxPanel.js';
import TrajectoryNode from './TrajectoryNode.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
const initialSpeedString = ProjectileMotionStrings.initialSpeed;
const initialAngleString = ProjectileMotionStrings.angle;
const metersPerSecondString = ProjectileMotionStrings.metersPerSecond;
const metersString = ProjectileMotionStrings.meters;
const degreesString = MathSymbols.DEGREES;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;
const pattern0Value1UnitsString = ProjectileMotionStrings.pattern0Value1Units;

// constants
const DEFAULT_SCALE = 30;
const TEXT_FONT = ProjectileMotionConstants.PANEL_LABEL_OPTIONS.font;
const PLAY_CONTROLS_INSET = ProjectileMotionConstants.PLAY_CONTROLS_HORIZONTAL_INSET;
const TEXT_MAX_WIDTH = ProjectileMotionConstants.PLAY_CONTROLS_TEXT_MAX_WIDTH;
const X_MARGIN = 10;
const Y_MARGIN = 5;
const FIRE_BUTTON_MARGIN_X = 40;
const FLATIRONS_RANGE = new Range(1500, 1700);
class ProjectileMotionScreenView extends ScreenView {
  /**
   * @param topRightPanel - the projectile control panel at the top right
   * @param bottomRightPanel - the vectors control panel at the bottom right
   * @param viewProperties - Properties that determine which vectors are shown
   */
  constructor(model, topRightPanel, bottomRightPanel, viewProperties, providedOptions) {
    const options = optionize()({
      cannonNodeOptions: {
        renderer: platform.mobileSafari ? 'canvas' : null,
        preciseCannonDelta: false
      },
      addFlatirons: true,
      // if false, then flatirons easteregg will never be shown
      maxTrajectories: ProjectileMotionConstants.MAX_NUMBER_OF_TRAJECTORIES,
      // max number of trajectories that can be shown
      showPaths: true,
      // if false, trajectory paths will not be drawn
      constantTrajectoryOpacity: false // if true, trajectory paths will not be faded when new ones are added
    }, providedOptions);
    super(options);
    const tandem = options.tandem;

    // If on mobile device, don't draw things beyond boundary. For performance.
    if (platform.mobileSafari) {
      this.visibleBoundsProperty.link(bounds => {
        this.clipArea = Shape.bounds(bounds);
      });
    }

    // model view transform
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, ProjectileMotionConstants.VIEW_ORIGIN, DEFAULT_SCALE);

    // tracks changes to modelViewTransform
    const transformProperty = new Property(modelViewTransform);

    // target
    const targetNode = new TargetNode(model.target, transformProperty, this, {
      tandem: tandem.createTandem('targetNode'),
      phetioDocumentation: 'The target to aim for when firing a projectile'
    });

    // trajectories layer, so all trajectories are in front of control panel but behind measuring tape
    const trajectoriesLayer = new Node();
    const handleTrajectoryAdded = addedTrajectory => {
      // create the view representation for added trajectory
      const trajectoryNode = new TrajectoryNode(viewProperties, addedTrajectory, transformProperty, options.maxTrajectories, options.showPaths, options.constantTrajectoryOpacity);

      // add the view to scene graph
      trajectoriesLayer.addChild(trajectoryNode);

      // Add the removal listener for if and when this trajectory is removed from the model.
      model.trajectoryGroup.elementDisposedEmitter.addListener(function removalListener(removedTrajectory) {
        if (removedTrajectory === addedTrajectory) {
          trajectoryNode.dispose();
          model.trajectoryGroup.elementDisposedEmitter.removeListener(removalListener);
        }
      });
    };

    // view listens to whether a trajectory has been added in the model
    model.trajectoryGroup.forEach(handleTrajectoryAdded);
    model.trajectoryGroup.elementCreatedEmitter.addListener(handleTrajectoryAdded);

    // cannon
    const cannonNode = new CannonNode(model.cannonHeightProperty, model.cannonAngleProperty, model.muzzleFlashStepper, transformProperty, this, combineOptions({
      tandem: tandem.createTandem('cannonNode')
    }, options.cannonNodeOptions));

    // results in '{{value}} m/s'
    const valuePatternSpeed = StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
      units: metersPerSecondString
    });

    // results in '{{value}} degrees'
    const valuePatternAngle = StringUtils.fillIn(pattern0Value1UnitsString, {
      units: degreesString
    });
    const angleIncrement = options.cannonNodeOptions.preciseCannonDelta ? 1 : 5;
    const initialSpeedPanelTandem = tandem.createTandem('initialSpeedPanel');
    const initialAnglePanelTandem = tandem.createTandem('initialAnglePanel');

    // initial speed readout, slider, and tweakers
    const initialSpeedNumberControl = new NumberControl(initialSpeedString, model.initialSpeedProperty, ProjectileMotionConstants.LAUNCH_VELOCITY_RANGE, {
      titleNodeOptions: {
        font: TEXT_FONT,
        maxWidth: 120 // empirically determined
      },

      numberDisplayOptions: {
        valuePattern: valuePatternSpeed,
        align: 'right',
        textOptions: {
          font: TEXT_FONT
        },
        maxWidth: 80 // empirically determined
      },

      sliderOptions: {
        constrainValue: value => Utils.roundSymmetric(value),
        trackSize: new Dimension2(120, 0.5),
        // width is empirically determined
        thumbSize: new Dimension2(13, 22)
      },
      arrowButtonOptions: {
        scale: 0.56,
        touchAreaXDilation: 20,
        touchAreaYDilation: 20
      },
      tandem: initialSpeedPanelTandem.createTandem('numberControl'),
      phetioDocumentation: 'the control for the initial speed as a projectile leaves the cannon'
    });

    // initial angle readout, slider, and tweakers
    const initialAngleNumberControl = new NumberControl(initialAngleString, model.cannonAngleProperty, ProjectileMotionConstants.CANNON_ANGLE_RANGE, {
      titleNodeOptions: {
        font: TEXT_FONT,
        maxWidth: 120 // empirically determined
      },

      numberDisplayOptions: {
        valuePattern: valuePatternAngle,
        align: 'right',
        textOptions: {
          font: TEXT_FONT
        },
        maxWidth: 80 // empirically determined
      },

      sliderOptions: {
        constrainValue: value => Utils.roundToInterval(value, angleIncrement),
        trackSize: new Dimension2(120, 0.5),
        // width is empirically determined
        thumbSize: new Dimension2(13, 22)
      },
      delta: angleIncrement,
      arrowButtonOptions: {
        scale: 0.56,
        touchAreaXDilation: 20,
        touchAreaYDilation: 20
      },
      tandem: initialAnglePanelTandem.createTandem('numberControl'),
      phetioDocumentation: 'the control for the initial angle as a projectile leaves the cannon'
    });

    // panel under the cannon, controls initial speed of projectiles
    const initialSpeedPanel = new Panel(initialSpeedNumberControl, combineOptions({
      left: this.layoutBounds.left + X_MARGIN,
      bottom: this.layoutBounds.bottom - 10,
      tandem: initialSpeedPanelTandem
    }, ProjectileMotionConstants.INITIAL_VALUE_PANEL_OPTIONS));

    // panel under the cannon, controls initial speed of projectiles
    const initialAnglePanel = new Panel(initialAngleNumberControl, combineOptions({
      left: initialSpeedPanel.right + X_MARGIN,
      bottom: initialSpeedPanel.bottom,
      tandem: initialAnglePanelTandem
    }, ProjectileMotionConstants.INITIAL_VALUE_PANEL_OPTIONS));

    // Create a measuring tape (set to invisible initially)
    const measuringTapeNode = new MeasuringTapeNode(new Property({
      name: metersString,
      multiplier: 1
    }), {
      visibleProperty: model.measuringTape.isActiveProperty,
      modelViewTransform: transformProperty.get(),
      basePositionProperty: model.measuringTape.basePositionProperty,
      tipPositionProperty: model.measuringTape.tipPositionProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.6 )',
      // translucent white background
      significantFigures: 2,
      textFont: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      tandem: tandem.createTandem('measuringTapeNode'),
      phetioDocumentation: 'the Node for the measuring tape'
    });

    // {DerivedProperty.<Bounds2>} The measuring tape's drag bounds in model coordinates, constrained
    // so that it remains easily visible and grabbable. Unlike DataProbeNode, MeasuringTapeNode does
    // not have dynamic drag bounds, so we need to create out own DerivedProperty and associated listener here.
    // See https://github.com/phetsims/projectile-motion/issues/145.
    const measuringTapeDragBoundsProperty = new DerivedProperty([transformProperty, this.visibleBoundsProperty], (transform, visibleBounds) => transform.viewToModelBounds(visibleBounds.eroded(20)));
    // unlink unnecessary
    measuringTapeDragBoundsProperty.link(bounds => {
      measuringTapeNode.setDragBounds(bounds);
    });

    // add view for dataProbe
    const dataProbeNode = new DataProbeNode(model.dataProbe, transformProperty, this, {
      tandem: tandem.createTandem('dataProbeNode'),
      phetioDocumentation: 'the Node for the dataProbe tool'
    });
    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup(model.zoomProperty, {
      applyZoomIn: currentZoom => currentZoom * 2,
      applyZoomOut: currentZoom => currentZoom / 2,
      spacing: X_MARGIN,
      touchAreaXDilation: 3,
      touchAreaYDilation: 6,
      magnifyingGlassNodeOptions: {
        glassRadius: 8
      },
      buttonOptions: {
        xMargin: 3,
        yMargin: 3,
        baseColor: '#E7E8E9'
      },
      // phet-io
      tandem: tandem.createTandem('zoomButtonGroup'),
      phetioDocumentation: 'Container for the zoom in and out buttons'
    });

    // Watch the zoomProperty and update transform Property accordingly
    model.zoomProperty.link(zoomFactor => {
      transformProperty.set(ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, ProjectileMotionConstants.VIEW_ORIGIN, DEFAULT_SCALE * zoomFactor // scale for meters to view units, with zoom taken into consideration
      ));
    });

    // toolbox panel contains measuring tape. lab screen will add a dataProbe tool
    const toolboxPanel = new ToolboxPanel(model.measuringTape, model.dataProbe, measuringTapeNode, dataProbeNode, transformProperty, {
      tandem: tandem.createTandem('toolboxPanel')
    });

    // reset all button, also a closure for and measuringTape
    const resetAllButton = new ResetAllButton({
      listener: () => {
        // reset zoom (in model) before the target is reset, so that the transform is correct
        model.reset();
        viewProperties.reset();
        targetNode.reset();
        cannonNode.reset();
      },
      centerY: initialSpeedPanel.centerY,
      tandem: tandem.createTandem('resetAllButton'),
      phetioDocumentation: 'button to reset the entire screen'
    });

    // eraser button
    const eraserButton = new EraserButton({
      minWidth: 50,
      iconWidth: 30,
      minHeight: 40,
      listener: () => {
        model.eraseTrajectories();
      },
      centerY: initialSpeedPanel.centerY,
      tandem: tandem.createTandem('eraserButton'),
      phetioDocumentation: 'button to erase all of the trajectories'
    });

    // fire button
    const fireButton = new FireButton({
      minWidth: 75,
      iconWidth: 35,
      minHeight: 42,
      listener: () => {
        model.fireNumProjectiles(1);
        cannonNode.flashMuzzle();
      },
      left: initialAnglePanel.right + FIRE_BUTTON_MARGIN_X,
      centerY: initialSpeedPanel.centerY,
      tandem: tandem.createTandem('fireButton'),
      phetioDocumentation: 'button to launch a projectile'
    });
    model.fireEnabledProperty.link(enable => {
      fireButton.setEnabled(enable);
    });
    const timeControlNode = new TimeControlNode(model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      playPauseStepButtonOptions: {
        playPauseButtonOptions: {
          radius: 18,
          scaleFactorWhenNotPlaying: 1.25,
          touchAreaDilation: 2
        },
        stepForwardButtonOptions: {
          listener: () => {
            model.stepModelElements(ProjectileMotionConstants.TIME_PER_DATA_POINT / 1000);
          },
          radius: 12,
          stroke: 'black',
          iconFill: '#005566',
          touchAreaDilation: 4
        }
      },
      speedRadioButtonGroupOptions: {
        labelOptions: {
          font: new PhetFont(15),
          maxWidth: TEXT_MAX_WIDTH,
          stroke: 'rgb( 0, 173, 78 )',
          lineWidth: 0.3
        },
        radioButtonOptions: {
          radius: 8
        }
      },
      buttonGroupXSpacing: 2 * PLAY_CONTROLS_INSET,
      centerY: initialSpeedPanel.centerY,
      left: fireButton.right + FIRE_BUTTON_MARGIN_X,
      // empirically determined
      tandem: tandem.createTandem('timeControlNode')
    });

    // David
    const davidNode = new Image(david_png, {
      tandem: tandem.createTandem('davidNode')
    });

    // background, including grass, road, sky, flatirons
    const backgroundNode = new BackgroundNode(this.layoutBounds);

    // listen to transform Property
    transformProperty.link(transform => {
      measuringTapeNode.modelViewTransformProperty.value = transform;
      davidNode.maxHeight = Math.abs(transform.modelToViewDeltaY(model.davidHeight));
      davidNode.centerX = transform.modelToViewX(model.davidPosition.x);
      davidNode.bottom = transformProperty.get().modelToViewY(model.davidPosition.y);
      backgroundNode.updateFlatironsPosition(transform);
    });
    this.cannonNode = cannonNode;
    this.topRightPanel = topRightPanel;
    this.bottomRightPanel = bottomRightPanel;
    this.toolboxPanel = toolboxPanel;
    this.resetAllButton = resetAllButton;
    this.backgroundNode = backgroundNode;
    this.zoomButtonGroup = zoomButtonGroup;
    this.eraserButton = eraserButton;
    this.fireButton = fireButton;
    this.timeControlNode = timeControlNode;
    this.initialSpeedPanel = initialSpeedPanel;
    this.initialAnglePanel = initialAnglePanel;
    if (options.addFlatirons) {
      // For PhET-iO support to turn off the flat irons easter egg without instrumenting anything in the BackgroundNode.
      const flatironsVisibleProperty = new BooleanProperty(true, {
        tandem: tandem.createTandem('flatironsVisibleProperty'),
        phetioDocumentation: 'when false, the flat irons "easter egg" will not display when at the appropriate altitude.'
      });

      // flatirons
      Multilink.multilink([model.altitudeProperty, flatironsVisibleProperty], altitude => {
        backgroundNode.showOrHideFlatirons(flatironsVisibleProperty.value && altitude >= FLATIRONS_RANGE.min && altitude <= FLATIRONS_RANGE.max);
      });
    }

    // rendering order
    this.setChildren([backgroundNode, targetNode, davidNode, cannonNode, trajectoriesLayer, initialSpeedPanel, initialAnglePanel, bottomRightPanel, topRightPanel, toolboxPanel, fireButton, eraserButton, timeControlNode, zoomButtonGroup, resetAllButton, measuringTapeNode, dataProbeNode]);

    // Links in this constructor last for the life time of the sim, so they don't need to be disposed
    // Panels last for the life time of the sim, so their links don't need to be disposed
  }

  layout(viewBounds) {
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

    // call on backgroundNode's function to lay it out
    this.backgroundNode.layout(offsetX, offsetY, width, height, scale);

    // layout controls
    this.topRightPanel.right = width / scale - offsetX - X_MARGIN;
    this.topRightPanel.top = Y_MARGIN - offsetY;
    this.bottomRightPanel.setRightTop(this.topRightPanel.rightBottom.plusXY(0, Y_MARGIN));
    this.toolboxPanel.setRightTop(this.topRightPanel.leftTop.minusXY(X_MARGIN, 0));
    this.resetAllButton.right = this.topRightPanel.right;
    this.eraserButton.right = this.resetAllButton.left - X_MARGIN;
    this.zoomButtonGroup.top = 2 * Y_MARGIN - offsetY;
    this.zoomButtonGroup.left = this.layoutBounds.minX + X_MARGIN;

    // set visible bounds, which are different from layout bounds
    this.visibleBoundsProperty.set(new Bounds2(-offsetX, -offsetY, width / scale - offsetX, height / scale - offsetY));
  }
}
projectileMotion.register('ProjectileMotionScreenView', ProjectileMotionScreenView);
export default ProjectileMotionScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwiU2hhcGUiLCJwbGF0Zm9ybSIsIlN0cmluZ1V0aWxzIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIkVyYXNlckJ1dHRvbiIsIlJlc2V0QWxsQnV0dG9uIiwiTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIiwiTWF0aFN5bWJvbHMiLCJNZWFzdXJpbmdUYXBlTm9kZSIsIk51bWJlckNvbnRyb2wiLCJQaGV0Rm9udCIsIlRpbWVDb250cm9sTm9kZSIsIkltYWdlIiwiTm9kZSIsIlBhbmVsIiwiZGF2aWRfcG5nIiwicHJvamVjdGlsZU1vdGlvbiIsIlByb2plY3RpbGVNb3Rpb25TdHJpbmdzIiwiUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyIsIkJhY2tncm91bmROb2RlIiwiQ2Fubm9uTm9kZSIsIkRhdGFQcm9iZU5vZGUiLCJGaXJlQnV0dG9uIiwiVGFyZ2V0Tm9kZSIsIlRvb2xib3hQYW5lbCIsIlRyYWplY3RvcnlOb2RlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJpbml0aWFsU3BlZWRTdHJpbmciLCJpbml0aWFsU3BlZWQiLCJpbml0aWFsQW5nbGVTdHJpbmciLCJhbmdsZSIsIm1ldGVyc1BlclNlY29uZFN0cmluZyIsIm1ldGVyc1BlclNlY29uZCIsIm1ldGVyc1N0cmluZyIsIm1ldGVycyIsImRlZ3JlZXNTdHJpbmciLCJERUdSRUVTIiwicGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZyIsInBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2UiLCJwYXR0ZXJuMFZhbHVlMVVuaXRzU3RyaW5nIiwicGF0dGVybjBWYWx1ZTFVbml0cyIsIkRFRkFVTFRfU0NBTEUiLCJURVhUX0ZPTlQiLCJQQU5FTF9MQUJFTF9PUFRJT05TIiwiZm9udCIsIlBMQVlfQ09OVFJPTFNfSU5TRVQiLCJQTEFZX0NPTlRST0xTX0hPUklaT05UQUxfSU5TRVQiLCJURVhUX01BWF9XSURUSCIsIlBMQVlfQ09OVFJPTFNfVEVYVF9NQVhfV0lEVEgiLCJYX01BUkdJTiIsIllfTUFSR0lOIiwiRklSRV9CVVRUT05fTUFSR0lOX1giLCJGTEFUSVJPTlNfUkFOR0UiLCJQcm9qZWN0aWxlTW90aW9uU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJ0b3BSaWdodFBhbmVsIiwiYm90dG9tUmlnaHRQYW5lbCIsInZpZXdQcm9wZXJ0aWVzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImNhbm5vbk5vZGVPcHRpb25zIiwicmVuZGVyZXIiLCJtb2JpbGVTYWZhcmkiLCJwcmVjaXNlQ2Fubm9uRGVsdGEiLCJhZGRGbGF0aXJvbnMiLCJtYXhUcmFqZWN0b3JpZXMiLCJNQVhfTlVNQkVSX09GX1RSQUpFQ1RPUklFUyIsInNob3dQYXRocyIsImNvbnN0YW50VHJhamVjdG9yeU9wYWNpdHkiLCJ0YW5kZW0iLCJ2aXNpYmxlQm91bmRzUHJvcGVydHkiLCJsaW5rIiwiYm91bmRzIiwiY2xpcEFyZWEiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyIsIlpFUk8iLCJWSUVXX09SSUdJTiIsInRyYW5zZm9ybVByb3BlcnR5IiwidGFyZ2V0Tm9kZSIsInRhcmdldCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ0cmFqZWN0b3JpZXNMYXllciIsImhhbmRsZVRyYWplY3RvcnlBZGRlZCIsImFkZGVkVHJhamVjdG9yeSIsInRyYWplY3RvcnlOb2RlIiwiYWRkQ2hpbGQiLCJ0cmFqZWN0b3J5R3JvdXAiLCJlbGVtZW50RGlzcG9zZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJyZW1vdmFsTGlzdGVuZXIiLCJyZW1vdmVkVHJhamVjdG9yeSIsImRpc3Bvc2UiLCJyZW1vdmVMaXN0ZW5lciIsImZvckVhY2giLCJlbGVtZW50Q3JlYXRlZEVtaXR0ZXIiLCJjYW5ub25Ob2RlIiwiY2Fubm9uSGVpZ2h0UHJvcGVydHkiLCJjYW5ub25BbmdsZVByb3BlcnR5IiwibXV6emxlRmxhc2hTdGVwcGVyIiwidmFsdWVQYXR0ZXJuU3BlZWQiLCJmaWxsSW4iLCJ1bml0cyIsInZhbHVlUGF0dGVybkFuZ2xlIiwiYW5nbGVJbmNyZW1lbnQiLCJpbml0aWFsU3BlZWRQYW5lbFRhbmRlbSIsImluaXRpYWxBbmdsZVBhbmVsVGFuZGVtIiwiaW5pdGlhbFNwZWVkTnVtYmVyQ29udHJvbCIsImluaXRpYWxTcGVlZFByb3BlcnR5IiwiTEFVTkNIX1ZFTE9DSVRZX1JBTkdFIiwidGl0bGVOb2RlT3B0aW9ucyIsIm1heFdpZHRoIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJ2YWx1ZVBhdHRlcm4iLCJhbGlnbiIsInRleHRPcHRpb25zIiwic2xpZGVyT3B0aW9ucyIsImNvbnN0cmFpblZhbHVlIiwidmFsdWUiLCJyb3VuZFN5bW1ldHJpYyIsInRyYWNrU2l6ZSIsInRodW1iU2l6ZSIsImFycm93QnV0dG9uT3B0aW9ucyIsInNjYWxlIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwiaW5pdGlhbEFuZ2xlTnVtYmVyQ29udHJvbCIsIkNBTk5PTl9BTkdMRV9SQU5HRSIsInJvdW5kVG9JbnRlcnZhbCIsImRlbHRhIiwiaW5pdGlhbFNwZWVkUGFuZWwiLCJsZWZ0IiwibGF5b3V0Qm91bmRzIiwiYm90dG9tIiwiSU5JVElBTF9WQUxVRV9QQU5FTF9PUFRJT05TIiwiaW5pdGlhbEFuZ2xlUGFuZWwiLCJyaWdodCIsIm1lYXN1cmluZ1RhcGVOb2RlIiwibmFtZSIsIm11bHRpcGxpZXIiLCJ2aXNpYmxlUHJvcGVydHkiLCJtZWFzdXJpbmdUYXBlIiwiaXNBY3RpdmVQcm9wZXJ0eSIsImdldCIsImJhc2VQb3NpdGlvblByb3BlcnR5IiwidGlwUG9zaXRpb25Qcm9wZXJ0eSIsInRleHRDb2xvciIsInRleHRCYWNrZ3JvdW5kQ29sb3IiLCJzaWduaWZpY2FudEZpZ3VyZXMiLCJ0ZXh0Rm9udCIsInNpemUiLCJ3ZWlnaHQiLCJtZWFzdXJpbmdUYXBlRHJhZ0JvdW5kc1Byb3BlcnR5IiwidHJhbnNmb3JtIiwidmlzaWJsZUJvdW5kcyIsInZpZXdUb01vZGVsQm91bmRzIiwiZXJvZGVkIiwic2V0RHJhZ0JvdW5kcyIsImRhdGFQcm9iZU5vZGUiLCJkYXRhUHJvYmUiLCJ6b29tQnV0dG9uR3JvdXAiLCJ6b29tUHJvcGVydHkiLCJhcHBseVpvb21JbiIsImN1cnJlbnRab29tIiwiYXBwbHlab29tT3V0Iiwic3BhY2luZyIsIm1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zIiwiZ2xhc3NSYWRpdXMiLCJidXR0b25PcHRpb25zIiwieE1hcmdpbiIsInlNYXJnaW4iLCJiYXNlQ29sb3IiLCJ6b29tRmFjdG9yIiwic2V0IiwidG9vbGJveFBhbmVsIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwiY2VudGVyWSIsImVyYXNlckJ1dHRvbiIsIm1pbldpZHRoIiwiaWNvbldpZHRoIiwibWluSGVpZ2h0IiwiZXJhc2VUcmFqZWN0b3JpZXMiLCJmaXJlQnV0dG9uIiwiZmlyZU51bVByb2plY3RpbGVzIiwiZmxhc2hNdXp6bGUiLCJmaXJlRW5hYmxlZFByb3BlcnR5IiwiZW5hYmxlIiwic2V0RW5hYmxlZCIsInRpbWVDb250cm9sTm9kZSIsImlzUGxheWluZ1Byb3BlcnR5IiwidGltZVNwZWVkUHJvcGVydHkiLCJwbGF5UGF1c2VTdGVwQnV0dG9uT3B0aW9ucyIsInBsYXlQYXVzZUJ1dHRvbk9wdGlvbnMiLCJyYWRpdXMiLCJzY2FsZUZhY3RvcldoZW5Ob3RQbGF5aW5nIiwidG91Y2hBcmVhRGlsYXRpb24iLCJzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnMiLCJzdGVwTW9kZWxFbGVtZW50cyIsIlRJTUVfUEVSX0RBVEFfUE9JTlQiLCJzdHJva2UiLCJpY29uRmlsbCIsInNwZWVkUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMiLCJsYWJlbE9wdGlvbnMiLCJsaW5lV2lkdGgiLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJidXR0b25Hcm91cFhTcGFjaW5nIiwiZGF2aWROb2RlIiwiYmFja2dyb3VuZE5vZGUiLCJtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSIsIm1heEhlaWdodCIsIk1hdGgiLCJhYnMiLCJtb2RlbFRvVmlld0RlbHRhWSIsImRhdmlkSGVpZ2h0IiwiY2VudGVyWCIsIm1vZGVsVG9WaWV3WCIsImRhdmlkUG9zaXRpb24iLCJ4IiwibW9kZWxUb1ZpZXdZIiwieSIsInVwZGF0ZUZsYXRpcm9uc1Bvc2l0aW9uIiwiZmxhdGlyb25zVmlzaWJsZVByb3BlcnR5IiwibXVsdGlsaW5rIiwiYWx0aXR1ZGVQcm9wZXJ0eSIsImFsdGl0dWRlIiwic2hvd09ySGlkZUZsYXRpcm9ucyIsIm1pbiIsIm1heCIsInNldENoaWxkcmVuIiwibGF5b3V0Iiwidmlld0JvdW5kcyIsInJlc2V0VHJhbnNmb3JtIiwiZ2V0TGF5b3V0U2NhbGUiLCJ3aWR0aCIsImhlaWdodCIsInNldFNjYWxlTWFnbml0dWRlIiwib2Zmc2V0WCIsIm9mZnNldFkiLCJ0cmFuc2xhdGUiLCJ0b3AiLCJzZXRSaWdodFRvcCIsInJpZ2h0Qm90dG9tIiwicGx1c1hZIiwibGVmdFRvcCIsIm1pbnVzWFkiLCJtaW5YIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJQcm9qZWN0aWxlTW90aW9uU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb21tb24gdmlldyBmb3IgYSBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcsIHsgU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcGxhdGZvcm0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3BsYXRmb3JtLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IEVyYXNlckJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9FcmFzZXJCdXR0b24uanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IE1lYXN1cmluZ1RhcGVOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NZWFzdXJpbmdUYXBlTm9kZS5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBUaW1lQ29udHJvbE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBkYXZpZF9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2RhdmlkX3BuZy5qcyc7XHJcbmltcG9ydCBwcm9qZWN0aWxlTW90aW9uIGZyb20gJy4uLy4uL3Byb2plY3RpbGVNb3Rpb24uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvblN0cmluZ3MgZnJvbSAnLi4vLi4vUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvbk1vZGVsIGZyb20gJy4uL21vZGVsL1Byb2plY3RpbGVNb3Rpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzIGZyb20gJy4uL1Byb2plY3RpbGVNb3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmFja2dyb3VuZE5vZGUgZnJvbSAnLi9CYWNrZ3JvdW5kTm9kZS5qcyc7XHJcbmltcG9ydCB0eXBlIHsgQ2Fubm9uTm9kZU9wdGlvbnMgfSBmcm9tICcuL0Nhbm5vbk5vZGUuanMnO1xyXG5pbXBvcnQgQ2Fubm9uTm9kZSBmcm9tICcuL0Nhbm5vbk5vZGUuanMnO1xyXG5pbXBvcnQgRGF0YVByb2JlTm9kZSBmcm9tICcuL0RhdGFQcm9iZU5vZGUuanMnO1xyXG5pbXBvcnQgRmlyZUJ1dHRvbiBmcm9tICcuL0ZpcmVCdXR0b24uanMnO1xyXG5pbXBvcnQgUHJvamVjdGlsZU1vdGlvblZpZXdQcm9wZXJ0aWVzIGZyb20gJy4vUHJvamVjdGlsZU1vdGlvblZpZXdQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IFRhcmdldE5vZGUgZnJvbSAnLi9UYXJnZXROb2RlLmpzJztcclxuaW1wb3J0IFRvb2xib3hQYW5lbCBmcm9tICcuL1Rvb2xib3hQYW5lbC5qcyc7XHJcbmltcG9ydCBUcmFqZWN0b3J5Tm9kZSBmcm9tICcuL1RyYWplY3RvcnlOb2RlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVHJhamVjdG9yeSBmcm9tICcuLi9tb2RlbC9UcmFqZWN0b3J5LmpzJztcclxuXHJcbmNvbnN0IGluaXRpYWxTcGVlZFN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLmluaXRpYWxTcGVlZDtcclxuY29uc3QgaW5pdGlhbEFuZ2xlU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuYW5nbGU7XHJcbmNvbnN0IG1ldGVyc1BlclNlY29uZFN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLm1ldGVyc1BlclNlY29uZDtcclxuY29uc3QgbWV0ZXJzU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MubWV0ZXJzO1xyXG5jb25zdCBkZWdyZWVzU3RyaW5nID0gTWF0aFN5bWJvbHMuREVHUkVFUztcclxuY29uc3QgcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLnBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2U7XHJcbmNvbnN0IHBhdHRlcm4wVmFsdWUxVW5pdHNTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5wYXR0ZXJuMFZhbHVlMVVuaXRzO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfU0NBTEUgPSAzMDtcclxuY29uc3QgVEVYVF9GT05UID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5QQU5FTF9MQUJFTF9PUFRJT05TLmZvbnQ7XHJcbmNvbnN0IFBMQVlfQ09OVFJPTFNfSU5TRVQgPVxyXG4gIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUExBWV9DT05UUk9MU19IT1JJWk9OVEFMX0lOU0VUO1xyXG5jb25zdCBURVhUX01BWF9XSURUSCA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUExBWV9DT05UUk9MU19URVhUX01BWF9XSURUSDtcclxuY29uc3QgWF9NQVJHSU4gPSAxMDtcclxuY29uc3QgWV9NQVJHSU4gPSA1O1xyXG5jb25zdCBGSVJFX0JVVFRPTl9NQVJHSU5fWCA9IDQwO1xyXG5jb25zdCBGTEFUSVJPTlNfUkFOR0UgPSBuZXcgUmFuZ2UoIDE1MDAsIDE3MDAgKTtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgY2Fubm9uTm9kZU9wdGlvbnM/OiBDYW5ub25Ob2RlT3B0aW9ucztcclxuICBhZGRGbGF0aXJvbnM/OiBib29sZWFuO1xyXG4gIG1heFRyYWplY3Rvcmllcz86IG51bWJlcjtcclxuICBzaG93UGF0aHM/OiBib29sZWFuO1xyXG4gIGNvbnN0YW50VHJhamVjdG9yeU9wYWNpdHk/OiBib29sZWFuO1xyXG59O1xyXG50eXBlIFByb2plY3RpbGVNb3Rpb25TY3JlZW5WaWV3T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU2NyZWVuVmlld09wdGlvbnM7XHJcblxyXG5jbGFzcyBQcm9qZWN0aWxlTW90aW9uU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG4gIHByaXZhdGUgY2Fubm9uTm9kZTogQ2Fubm9uTm9kZTtcclxuICBwcml2YXRlIHRvcFJpZ2h0UGFuZWw6IFBhbmVsO1xyXG4gIHByaXZhdGUgYm90dG9tUmlnaHRQYW5lbDogUGFuZWw7XHJcbiAgcHJpdmF0ZSB0b29sYm94UGFuZWw6IFRvb2xib3hQYW5lbDtcclxuICBwcml2YXRlIHJlc2V0QWxsQnV0dG9uOiBSZXNldEFsbEJ1dHRvbjtcclxuICBwcml2YXRlIGJhY2tncm91bmROb2RlOiBCYWNrZ3JvdW5kTm9kZTtcclxuICBwcml2YXRlIHpvb21CdXR0b25Hcm91cDogTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwO1xyXG4gIHByaXZhdGUgZXJhc2VyQnV0dG9uOiBFcmFzZXJCdXR0b247XHJcbiAgcHJpdmF0ZSBmaXJlQnV0dG9uOiBGaXJlQnV0dG9uO1xyXG4gIHByaXZhdGUgdGltZUNvbnRyb2xOb2RlOiBUaW1lQ29udHJvbE5vZGU7XHJcbiAgcHJpdmF0ZSBpbml0aWFsU3BlZWRQYW5lbDogUGFuZWw7XHJcbiAgcHJpdmF0ZSBpbml0aWFsQW5nbGVQYW5lbDogUGFuZWw7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB0b3BSaWdodFBhbmVsIC0gdGhlIHByb2plY3RpbGUgY29udHJvbCBwYW5lbCBhdCB0aGUgdG9wIHJpZ2h0XHJcbiAgICogQHBhcmFtIGJvdHRvbVJpZ2h0UGFuZWwgLSB0aGUgdmVjdG9ycyBjb250cm9sIHBhbmVsIGF0IHRoZSBib3R0b20gcmlnaHRcclxuICAgKiBAcGFyYW0gdmlld1Byb3BlcnRpZXMgLSBQcm9wZXJ0aWVzIHRoYXQgZGV0ZXJtaW5lIHdoaWNoIHZlY3RvcnMgYXJlIHNob3duXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogUHJvamVjdGlsZU1vdGlvbk1vZGVsLCB0b3BSaWdodFBhbmVsOiBQYW5lbCwgYm90dG9tUmlnaHRQYW5lbDogUGFuZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICB2aWV3UHJvcGVydGllczogUHJvamVjdGlsZU1vdGlvblZpZXdQcm9wZXJ0aWVzLCBwcm92aWRlZE9wdGlvbnM/OiBQcm9qZWN0aWxlTW90aW9uU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQcm9qZWN0aWxlTW90aW9uU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5WaWV3T3B0aW9ucz4oKSgge1xyXG4gICAgICBjYW5ub25Ob2RlT3B0aW9uczogeyByZW5kZXJlcjogcGxhdGZvcm0ubW9iaWxlU2FmYXJpID8gJ2NhbnZhcycgOiBudWxsLCBwcmVjaXNlQ2Fubm9uRGVsdGE6IGZhbHNlIH0sXHJcbiAgICAgIGFkZEZsYXRpcm9uczogdHJ1ZSwgLy8gaWYgZmFsc2UsIHRoZW4gZmxhdGlyb25zIGVhc3RlcmVnZyB3aWxsIG5ldmVyIGJlIHNob3duXHJcbiAgICAgIG1heFRyYWplY3RvcmllczogUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5NQVhfTlVNQkVSX09GX1RSQUpFQ1RPUklFUywgLy8gbWF4IG51bWJlciBvZiB0cmFqZWN0b3JpZXMgdGhhdCBjYW4gYmUgc2hvd25cclxuICAgICAgc2hvd1BhdGhzOiB0cnVlLCAvLyBpZiBmYWxzZSwgdHJhamVjdG9yeSBwYXRocyB3aWxsIG5vdCBiZSBkcmF3blxyXG4gICAgICBjb25zdGFudFRyYWplY3RvcnlPcGFjaXR5OiBmYWxzZSAvLyBpZiB0cnVlLCB0cmFqZWN0b3J5IHBhdGhzIHdpbGwgbm90IGJlIGZhZGVkIHdoZW4gbmV3IG9uZXMgYXJlIGFkZGVkXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRhbmRlbSA9IG9wdGlvbnMudGFuZGVtO1xyXG5cclxuICAgIC8vIElmIG9uIG1vYmlsZSBkZXZpY2UsIGRvbid0IGRyYXcgdGhpbmdzIGJleW9uZCBib3VuZGFyeS4gRm9yIHBlcmZvcm1hbmNlLlxyXG4gICAgaWYgKCBwbGF0Zm9ybS5tb2JpbGVTYWZhcmkgKSB7XHJcbiAgICAgIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcbiAgICAgICAgdGhpcy5jbGlwQXJlYSA9IFNoYXBlLmJvdW5kcyggYm91bmRzICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBtb2RlbCB2aWV3IHRyYW5zZm9ybVxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlSW52ZXJ0ZWRZTWFwcGluZyggVmVjdG9yMi5aRVJPLCBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlZJRVdfT1JJR0lOLCBERUZBVUxUX1NDQUxFICk7XHJcblxyXG4gICAgLy8gdHJhY2tzIGNoYW5nZXMgdG8gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICBjb25zdCB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbW9kZWxWaWV3VHJhbnNmb3JtICk7XHJcblxyXG4gICAgLy8gdGFyZ2V0XHJcbiAgICBjb25zdCB0YXJnZXROb2RlID0gbmV3IFRhcmdldE5vZGUoIG1vZGVsLnRhcmdldCwgdHJhbnNmb3JtUHJvcGVydHksIHRoaXMsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndGFyZ2V0Tm9kZScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSB0YXJnZXQgdG8gYWltIGZvciB3aGVuIGZpcmluZyBhIHByb2plY3RpbGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdHJhamVjdG9yaWVzIGxheWVyLCBzbyBhbGwgdHJhamVjdG9yaWVzIGFyZSBpbiBmcm9udCBvZiBjb250cm9sIHBhbmVsIGJ1dCBiZWhpbmQgbWVhc3VyaW5nIHRhcGVcclxuICAgIGNvbnN0IHRyYWplY3Rvcmllc0xheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICBjb25zdCBoYW5kbGVUcmFqZWN0b3J5QWRkZWQgPSAoIGFkZGVkVHJhamVjdG9yeTogVHJhamVjdG9yeSApOiB2b2lkID0+IHtcclxuICAgICAgLy8gY3JlYXRlIHRoZSB2aWV3IHJlcHJlc2VudGF0aW9uIGZvciBhZGRlZCB0cmFqZWN0b3J5XHJcbiAgICAgIGNvbnN0IHRyYWplY3RvcnlOb2RlID0gbmV3IFRyYWplY3RvcnlOb2RlKCB2aWV3UHJvcGVydGllcywgYWRkZWRUcmFqZWN0b3J5LCB0cmFuc2Zvcm1Qcm9wZXJ0eSwgb3B0aW9ucy5tYXhUcmFqZWN0b3JpZXMsXHJcbiAgICAgICAgb3B0aW9ucy5zaG93UGF0aHMsIG9wdGlvbnMuY29uc3RhbnRUcmFqZWN0b3J5T3BhY2l0eSApO1xyXG5cclxuICAgICAgLy8gYWRkIHRoZSB2aWV3IHRvIHNjZW5lIGdyYXBoXHJcbiAgICAgIHRyYWplY3Rvcmllc0xheWVyLmFkZENoaWxkKCB0cmFqZWN0b3J5Tm9kZSApO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSByZW1vdmFsIGxpc3RlbmVyIGZvciBpZiBhbmQgd2hlbiB0aGlzIHRyYWplY3RvcnkgaXMgcmVtb3ZlZCBmcm9tIHRoZSBtb2RlbC5cclxuICAgICAgbW9kZWwudHJhamVjdG9yeUdyb3VwLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZhbExpc3RlbmVyKCByZW1vdmVkVHJhamVjdG9yeSApIHtcclxuICAgICAgICAgIGlmICggcmVtb3ZlZFRyYWplY3RvcnkgPT09IGFkZGVkVHJhamVjdG9yeSApIHtcclxuICAgICAgICAgICAgdHJhamVjdG9yeU5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICBtb2RlbC50cmFqZWN0b3J5R3JvdXAuZWxlbWVudERpc3Bvc2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggcmVtb3ZhbExpc3RlbmVyICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyB2aWV3IGxpc3RlbnMgdG8gd2hldGhlciBhIHRyYWplY3RvcnkgaGFzIGJlZW4gYWRkZWQgaW4gdGhlIG1vZGVsXHJcbiAgICBtb2RlbC50cmFqZWN0b3J5R3JvdXAuZm9yRWFjaCggaGFuZGxlVHJhamVjdG9yeUFkZGVkICk7XHJcbiAgICBtb2RlbC50cmFqZWN0b3J5R3JvdXAuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBoYW5kbGVUcmFqZWN0b3J5QWRkZWQgKTtcclxuXHJcbiAgICAvLyBjYW5ub25cclxuICAgIGNvbnN0IGNhbm5vbk5vZGUgPSBuZXcgQ2Fubm9uTm9kZSggbW9kZWwuY2Fubm9uSGVpZ2h0UHJvcGVydHksIG1vZGVsLmNhbm5vbkFuZ2xlUHJvcGVydHksIG1vZGVsLm11enpsZUZsYXNoU3RlcHBlciwgdHJhbnNmb3JtUHJvcGVydHksIHRoaXMsXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPENhbm5vbk5vZGVPcHRpb25zPiggeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjYW5ub25Ob2RlJyApIH0sIG9wdGlvbnMuY2Fubm9uTm9kZU9wdGlvbnMgKSApO1xyXG5cclxuICAgIC8vIHJlc3VsdHMgaW4gJ3t7dmFsdWV9fSBtL3MnXHJcbiAgICBjb25zdCB2YWx1ZVBhdHRlcm5TcGVlZCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZywgeyB1bml0czogbWV0ZXJzUGVyU2Vjb25kU3RyaW5nIH0gKTtcclxuXHJcbiAgICAvLyByZXN1bHRzIGluICd7e3ZhbHVlfX0gZGVncmVlcydcclxuICAgIGNvbnN0IHZhbHVlUGF0dGVybkFuZ2xlID0gU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuMFZhbHVlMVVuaXRzU3RyaW5nLCB7IHVuaXRzOiBkZWdyZWVzU3RyaW5nIH0gKTtcclxuXHJcbiAgICBjb25zdCBhbmdsZUluY3JlbWVudCA9IG9wdGlvbnMuY2Fubm9uTm9kZU9wdGlvbnMucHJlY2lzZUNhbm5vbkRlbHRhID8gMSA6IDU7XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbFNwZWVkUGFuZWxUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5pdGlhbFNwZWVkUGFuZWwnICk7XHJcbiAgICBjb25zdCBpbml0aWFsQW5nbGVQYW5lbFRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdpbml0aWFsQW5nbGVQYW5lbCcgKTtcclxuXHJcbiAgICAvLyBpbml0aWFsIHNwZWVkIHJlYWRvdXQsIHNsaWRlciwgYW5kIHR3ZWFrZXJzXHJcbiAgICBjb25zdCBpbml0aWFsU3BlZWROdW1iZXJDb250cm9sID0gbmV3IE51bWJlckNvbnRyb2woXHJcbiAgICAgIGluaXRpYWxTcGVlZFN0cmluZyxcclxuICAgICAgbW9kZWwuaW5pdGlhbFNwZWVkUHJvcGVydHksXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuTEFVTkNIX1ZFTE9DSVRZX1JBTkdFLCB7XHJcbiAgICAgICAgdGl0bGVOb2RlT3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogVEVYVF9GT05ULFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDEyMCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgICAgfSxcclxuICAgICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG4gICAgICAgICAgdmFsdWVQYXR0ZXJuOiB2YWx1ZVBhdHRlcm5TcGVlZCxcclxuICAgICAgICAgIGFsaWduOiAncmlnaHQnLFxyXG4gICAgICAgICAgdGV4dE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgZm9udDogVEVYVF9GT05UXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgbWF4V2lkdGg6IDgwIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNsaWRlck9wdGlvbnM6IHtcclxuICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKSxcclxuICAgICAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDEyMCwgMC41ICksIC8vIHdpZHRoIGlzIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDEzLCAyMiApXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHNjYWxlOiAwLjU2LFxyXG4gICAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAyMCxcclxuICAgICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMjBcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRhbmRlbTogaW5pdGlhbFNwZWVkUGFuZWxUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyQ29udHJvbCcgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOlxyXG4gICAgICAgICAgJ3RoZSBjb250cm9sIGZvciB0aGUgaW5pdGlhbCBzcGVlZCBhcyBhIHByb2plY3RpbGUgbGVhdmVzIHRoZSBjYW5ub24nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBpbml0aWFsIGFuZ2xlIHJlYWRvdXQsIHNsaWRlciwgYW5kIHR3ZWFrZXJzXHJcbiAgICBjb25zdCBpbml0aWFsQW5nbGVOdW1iZXJDb250cm9sID0gbmV3IE51bWJlckNvbnRyb2woXHJcbiAgICAgIGluaXRpYWxBbmdsZVN0cmluZyxcclxuICAgICAgbW9kZWwuY2Fubm9uQW5nbGVQcm9wZXJ0eSxcclxuICAgICAgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5DQU5OT05fQU5HTEVfUkFOR0UsIHtcclxuICAgICAgICB0aXRsZU5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgICBmb250OiBURVhUX0ZPTlQsXHJcbiAgICAgICAgICBtYXhXaWR0aDogMTIwIC8vIGVtcGlyaWNhbGx5IGRldGVybWluZWRcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICB2YWx1ZVBhdHRlcm46IHZhbHVlUGF0dGVybkFuZ2xlLFxyXG4gICAgICAgICAgYWxpZ246ICdyaWdodCcsXHJcbiAgICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgICBmb250OiBURVhUX0ZPTlRcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBtYXhXaWR0aDogODAgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgICAgY29uc3RyYWluVmFsdWU6IHZhbHVlID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggdmFsdWUsIGFuZ2xlSW5jcmVtZW50ICksXHJcbiAgICAgICAgICB0cmFja1NpemU6IG5ldyBEaW1lbnNpb24yKCAxMjAsIDAuNSApLCAvLyB3aWR0aCBpcyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgICAgICB0aHVtYlNpemU6IG5ldyBEaW1lbnNpb24yKCAxMywgMjIgKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsdGE6IGFuZ2xlSW5jcmVtZW50LFxyXG4gICAgICAgIGFycm93QnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgICAgc2NhbGU6IDAuNTYsXHJcbiAgICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDIwLFxyXG4gICAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAyMFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGFuZGVtOiBpbml0aWFsQW5nbGVQYW5lbFRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJDb250cm9sJyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246XHJcbiAgICAgICAgICAndGhlIGNvbnRyb2wgZm9yIHRoZSBpbml0aWFsIGFuZ2xlIGFzIGEgcHJvamVjdGlsZSBsZWF2ZXMgdGhlIGNhbm5vbidcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHBhbmVsIHVuZGVyIHRoZSBjYW5ub24sIGNvbnRyb2xzIGluaXRpYWwgc3BlZWQgb2YgcHJvamVjdGlsZXNcclxuICAgIGNvbnN0IGluaXRpYWxTcGVlZFBhbmVsID0gbmV3IFBhbmVsKCBpbml0aWFsU3BlZWROdW1iZXJDb250cm9sLCBjb21iaW5lT3B0aW9uczxQYW5lbE9wdGlvbnM+KCB7XHJcbiAgICAgICAgbGVmdDogdGhpcy5sYXlvdXRCb3VuZHMubGVmdCArIFhfTUFSR0lOLFxyXG4gICAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gMTAsXHJcbiAgICAgICAgdGFuZGVtOiBpbml0aWFsU3BlZWRQYW5lbFRhbmRlbVxyXG4gICAgICB9LFxyXG4gICAgICBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLklOSVRJQUxfVkFMVUVfUEFORUxfT1BUSU9OU1xyXG4gICAgKSApO1xyXG5cclxuICAgIC8vIHBhbmVsIHVuZGVyIHRoZSBjYW5ub24sIGNvbnRyb2xzIGluaXRpYWwgc3BlZWQgb2YgcHJvamVjdGlsZXNcclxuICAgIGNvbnN0IGluaXRpYWxBbmdsZVBhbmVsID0gbmV3IFBhbmVsKCBpbml0aWFsQW5nbGVOdW1iZXJDb250cm9sLCBjb21iaW5lT3B0aW9uczxQYW5lbE9wdGlvbnM+KCB7XHJcbiAgICAgICAgbGVmdDogaW5pdGlhbFNwZWVkUGFuZWwucmlnaHQgKyBYX01BUkdJTixcclxuICAgICAgICBib3R0b206IGluaXRpYWxTcGVlZFBhbmVsLmJvdHRvbSxcclxuICAgICAgICB0YW5kZW06IGluaXRpYWxBbmdsZVBhbmVsVGFuZGVtXHJcbiAgICAgIH0sXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuSU5JVElBTF9WQUxVRV9QQU5FTF9PUFRJT05TXHJcbiAgICApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgbWVhc3VyaW5nIHRhcGUgKHNldCB0byBpbnZpc2libGUgaW5pdGlhbGx5KVxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgTWVhc3VyaW5nVGFwZU5vZGUoIG5ldyBQcm9wZXJ0eSggeyBuYW1lOiBtZXRlcnNTdHJpbmcsIG11bHRpcGxpZXI6IDEgfSApLCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwubWVhc3VyaW5nVGFwZS5pc0FjdGl2ZVByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm06IHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLFxyXG4gICAgICBiYXNlUG9zaXRpb25Qcm9wZXJ0eTogbW9kZWwubWVhc3VyaW5nVGFwZS5iYXNlUG9zaXRpb25Qcm9wZXJ0eSxcclxuICAgICAgdGlwUG9zaXRpb25Qcm9wZXJ0eTogbW9kZWwubWVhc3VyaW5nVGFwZS50aXBQb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB0ZXh0Q29sb3I6ICdibGFjaycsXHJcbiAgICAgIHRleHRCYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKCAyNTUsIDI1NSwgMjU1LCAwLjYgKScsIC8vIHRyYW5zbHVjZW50IHdoaXRlIGJhY2tncm91bmRcclxuICAgICAgc2lnbmlmaWNhbnRGaWd1cmVzOiAyLFxyXG4gICAgICB0ZXh0Rm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE2LCB3ZWlnaHQ6ICdib2xkJyB9ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21lYXN1cmluZ1RhcGVOb2RlJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAndGhlIE5vZGUgZm9yIHRoZSBtZWFzdXJpbmcgdGFwZSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB7RGVyaXZlZFByb3BlcnR5LjxCb3VuZHMyPn0gVGhlIG1lYXN1cmluZyB0YXBlJ3MgZHJhZyBib3VuZHMgaW4gbW9kZWwgY29vcmRpbmF0ZXMsIGNvbnN0cmFpbmVkXHJcbiAgICAvLyBzbyB0aGF0IGl0IHJlbWFpbnMgZWFzaWx5IHZpc2libGUgYW5kIGdyYWJiYWJsZS4gVW5saWtlIERhdGFQcm9iZU5vZGUsIE1lYXN1cmluZ1RhcGVOb2RlIGRvZXNcclxuICAgIC8vIG5vdCBoYXZlIGR5bmFtaWMgZHJhZyBib3VuZHMsIHNvIHdlIG5lZWQgdG8gY3JlYXRlIG91dCBvd24gRGVyaXZlZFByb3BlcnR5IGFuZCBhc3NvY2lhdGVkIGxpc3RlbmVyIGhlcmUuXHJcbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3Byb2plY3RpbGUtbW90aW9uL2lzc3Vlcy8xNDUuXHJcbiAgICBjb25zdCBtZWFzdXJpbmdUYXBlRHJhZ0JvdW5kc1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0cmFuc2Zvcm1Qcm9wZXJ0eSwgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkgXSxcclxuICAgICAgKCB0cmFuc2Zvcm0sIHZpc2libGVCb3VuZHMgKSA9PlxyXG4gICAgICAgIHRyYW5zZm9ybS52aWV3VG9Nb2RlbEJvdW5kcyggdmlzaWJsZUJvdW5kcy5lcm9kZWQoIDIwICkgKVxyXG4gICAgKTtcclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeVxyXG4gICAgbWVhc3VyaW5nVGFwZURyYWdCb3VuZHNQcm9wZXJ0eS5saW5rKCBib3VuZHMgPT4ge1xyXG4gICAgICBtZWFzdXJpbmdUYXBlTm9kZS5zZXREcmFnQm91bmRzKCBib3VuZHMgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgdmlldyBmb3IgZGF0YVByb2JlXHJcbiAgICBjb25zdCBkYXRhUHJvYmVOb2RlID0gbmV3IERhdGFQcm9iZU5vZGUoIG1vZGVsLmRhdGFQcm9iZSwgdHJhbnNmb3JtUHJvcGVydHksIHRoaXMsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGF0YVByb2JlTm9kZScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RoZSBOb2RlIGZvciB0aGUgZGF0YVByb2JlIHRvb2wnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgem9vbUJ1dHRvbkdyb3VwID0gbmV3IE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCggbW9kZWwuem9vbVByb3BlcnR5LCB7XHJcbiAgICAgIGFwcGx5Wm9vbUluOiBjdXJyZW50Wm9vbSA9PiBjdXJyZW50Wm9vbSAqIDIsXHJcbiAgICAgIGFwcGx5Wm9vbU91dDogY3VycmVudFpvb20gPT4gY3VycmVudFpvb20gLyAyLFxyXG4gICAgICBzcGFjaW5nOiBYX01BUkdJTixcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAzLFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDYsXHJcbiAgICAgIG1hZ25pZnlpbmdHbGFzc05vZGVPcHRpb25zOiB7IGdsYXNzUmFkaXVzOiA4IH0sXHJcbiAgICAgIGJ1dHRvbk9wdGlvbnM6IHsgeE1hcmdpbjogMywgeU1hcmdpbjogMywgYmFzZUNvbG9yOiAnI0U3RThFOScgfSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnem9vbUJ1dHRvbkdyb3VwJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ29udGFpbmVyIGZvciB0aGUgem9vbSBpbiBhbmQgb3V0IGJ1dHRvbnMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2F0Y2ggdGhlIHpvb21Qcm9wZXJ0eSBhbmQgdXBkYXRlIHRyYW5zZm9ybSBQcm9wZXJ0eSBhY2NvcmRpbmdseVxyXG4gICAgbW9kZWwuem9vbVByb3BlcnR5LmxpbmsoIHpvb21GYWN0b3IgPT4ge1xyXG4gICAgICB0cmFuc2Zvcm1Qcm9wZXJ0eS5zZXQoIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoIFZlY3RvcjIuWkVSTywgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5WSUVXX09SSUdJTixcclxuICAgICAgICBERUZBVUxUX1NDQUxFICogem9vbUZhY3RvciAvLyBzY2FsZSBmb3IgbWV0ZXJzIHRvIHZpZXcgdW5pdHMsIHdpdGggem9vbSB0YWtlbiBpbnRvIGNvbnNpZGVyYXRpb25cclxuICAgICAgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHRvb2xib3ggcGFuZWwgY29udGFpbnMgbWVhc3VyaW5nIHRhcGUuIGxhYiBzY3JlZW4gd2lsbCBhZGQgYSBkYXRhUHJvYmUgdG9vbFxyXG4gICAgY29uc3QgdG9vbGJveFBhbmVsID0gbmV3IFRvb2xib3hQYW5lbChcclxuICAgICAgbW9kZWwubWVhc3VyaW5nVGFwZSxcclxuICAgICAgbW9kZWwuZGF0YVByb2JlLFxyXG4gICAgICBtZWFzdXJpbmdUYXBlTm9kZSxcclxuICAgICAgZGF0YVByb2JlTm9kZSxcclxuICAgICAgdHJhbnNmb3JtUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b29sYm94UGFuZWwnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHJlc2V0IGFsbCBidXR0b24sIGFsc28gYSBjbG9zdXJlIGZvciBhbmQgbWVhc3VyaW5nVGFwZVxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICAvLyByZXNldCB6b29tIChpbiBtb2RlbCkgYmVmb3JlIHRoZSB0YXJnZXQgaXMgcmVzZXQsIHNvIHRoYXQgdGhlIHRyYW5zZm9ybSBpcyBjb3JyZWN0XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuXHJcbiAgICAgICAgdmlld1Byb3BlcnRpZXMucmVzZXQoKTtcclxuICAgICAgICB0YXJnZXROb2RlLnJlc2V0KCk7XHJcbiAgICAgICAgY2Fubm9uTm9kZS5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBjZW50ZXJZOiBpbml0aWFsU3BlZWRQYW5lbC5jZW50ZXJZLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2J1dHRvbiB0byByZXNldCB0aGUgZW50aXJlIHNjcmVlbidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBlcmFzZXIgYnV0dG9uXHJcbiAgICBjb25zdCBlcmFzZXJCdXR0b24gPSBuZXcgRXJhc2VyQnV0dG9uKCB7XHJcbiAgICAgIG1pbldpZHRoOiA1MCxcclxuICAgICAgaWNvbldpZHRoOiAzMCxcclxuICAgICAgbWluSGVpZ2h0OiA0MCxcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5lcmFzZVRyYWplY3RvcmllcygpO1xyXG4gICAgICB9LFxyXG4gICAgICBjZW50ZXJZOiBpbml0aWFsU3BlZWRQYW5lbC5jZW50ZXJZLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlcmFzZXJCdXR0b24nICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdidXR0b24gdG8gZXJhc2UgYWxsIG9mIHRoZSB0cmFqZWN0b3JpZXMnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gZmlyZSBidXR0b25cclxuICAgIGNvbnN0IGZpcmVCdXR0b24gPSBuZXcgRmlyZUJ1dHRvbigge1xyXG4gICAgICBtaW5XaWR0aDogNzUsXHJcbiAgICAgIGljb25XaWR0aDogMzUsXHJcbiAgICAgIG1pbkhlaWdodDogNDIsXHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgbW9kZWwuZmlyZU51bVByb2plY3RpbGVzKCAxICk7XHJcbiAgICAgICAgY2Fubm9uTm9kZS5mbGFzaE11enpsZSgpO1xyXG4gICAgICB9LFxyXG4gICAgICBsZWZ0OiBpbml0aWFsQW5nbGVQYW5lbC5yaWdodCArIEZJUkVfQlVUVE9OX01BUkdJTl9YLFxyXG4gICAgICBjZW50ZXJZOiBpbml0aWFsU3BlZWRQYW5lbC5jZW50ZXJZLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmaXJlQnV0dG9uJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnYnV0dG9uIHRvIGxhdW5jaCBhIHByb2plY3RpbGUnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgbW9kZWwuZmlyZUVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGUgPT4ge1xyXG4gICAgICBmaXJlQnV0dG9uLnNldEVuYWJsZWQoIGVuYWJsZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRpbWVDb250cm9sTm9kZSA9IG5ldyBUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHRpbWVTcGVlZFByb3BlcnR5OiBtb2RlbC50aW1lU3BlZWRQcm9wZXJ0eSxcclxuICAgICAgcGxheVBhdXNlU3RlcEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBwbGF5UGF1c2VCdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICByYWRpdXM6IDE4LFxyXG4gICAgICAgICAgc2NhbGVGYWN0b3JXaGVuTm90UGxheWluZzogMS4yNSxcclxuICAgICAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzdGVwRm9yd2FyZEJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgICAgIG1vZGVsLnN0ZXBNb2RlbEVsZW1lbnRzKFxyXG4gICAgICAgICAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuVElNRV9QRVJfREFUQV9QT0lOVCAvIDEwMDBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICByYWRpdXM6IDEyLFxyXG4gICAgICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICAgICAgaWNvbkZpbGw6ICcjMDA1NTY2JyxcclxuICAgICAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiA0XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBzcGVlZFJhZGlvQnV0dG9uR3JvdXBPcHRpb25zOiB7XHJcbiAgICAgICAgbGFiZWxPcHRpb25zOiB7XHJcbiAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE1ICksXHJcbiAgICAgICAgICBtYXhXaWR0aDogVEVYVF9NQVhfV0lEVEgsXHJcbiAgICAgICAgICBzdHJva2U6ICdyZ2IoIDAsIDE3MywgNzggKScsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDAuM1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmFkaW9CdXR0b25PcHRpb25zOiB7XHJcbiAgICAgICAgICByYWRpdXM6IDhcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGJ1dHRvbkdyb3VwWFNwYWNpbmc6IDIgKiBQTEFZX0NPTlRST0xTX0lOU0VULFxyXG5cclxuICAgICAgY2VudGVyWTogaW5pdGlhbFNwZWVkUGFuZWwuY2VudGVyWSxcclxuICAgICAgbGVmdDogZmlyZUJ1dHRvbi5yaWdodCArIEZJUkVfQlVUVE9OX01BUkdJTl9YLCAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpbWVDb250cm9sTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERhdmlkXHJcbiAgICBjb25zdCBkYXZpZE5vZGUgPSBuZXcgSW1hZ2UoIGRhdmlkX3BuZywge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkYXZpZE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBiYWNrZ3JvdW5kLCBpbmNsdWRpbmcgZ3Jhc3MsIHJvYWQsIHNreSwgZmxhdGlyb25zXHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kTm9kZSA9IG5ldyBCYWNrZ3JvdW5kTm9kZSggdGhpcy5sYXlvdXRCb3VuZHMgKTtcclxuXHJcbiAgICAvLyBsaXN0ZW4gdG8gdHJhbnNmb3JtIFByb3BlcnR5XHJcbiAgICB0cmFuc2Zvcm1Qcm9wZXJ0eS5saW5rKCB0cmFuc2Zvcm0gPT4ge1xyXG4gICAgICBtZWFzdXJpbmdUYXBlTm9kZS5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZSA9IHRyYW5zZm9ybTtcclxuICAgICAgZGF2aWROb2RlLm1heEhlaWdodCA9IE1hdGguYWJzKCB0cmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIG1vZGVsLmRhdmlkSGVpZ2h0ICkgKTtcclxuICAgICAgZGF2aWROb2RlLmNlbnRlclggPSB0cmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBtb2RlbC5kYXZpZFBvc2l0aW9uLnggKTtcclxuICAgICAgZGF2aWROb2RlLmJvdHRvbSA9IHRyYW5zZm9ybVByb3BlcnR5LmdldCgpLm1vZGVsVG9WaWV3WSggbW9kZWwuZGF2aWRQb3NpdGlvbi55ICk7XHJcbiAgICAgIGJhY2tncm91bmROb2RlLnVwZGF0ZUZsYXRpcm9uc1Bvc2l0aW9uKCB0cmFuc2Zvcm0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNhbm5vbk5vZGUgPSBjYW5ub25Ob2RlO1xyXG4gICAgdGhpcy50b3BSaWdodFBhbmVsID0gdG9wUmlnaHRQYW5lbDtcclxuICAgIHRoaXMuYm90dG9tUmlnaHRQYW5lbCA9IGJvdHRvbVJpZ2h0UGFuZWw7XHJcbiAgICB0aGlzLnRvb2xib3hQYW5lbCA9IHRvb2xib3hQYW5lbDtcclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24gPSByZXNldEFsbEJ1dHRvbjtcclxuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUgPSBiYWNrZ3JvdW5kTm9kZTtcclxuICAgIHRoaXMuem9vbUJ1dHRvbkdyb3VwID0gem9vbUJ1dHRvbkdyb3VwO1xyXG4gICAgdGhpcy5lcmFzZXJCdXR0b24gPSBlcmFzZXJCdXR0b247XHJcbiAgICB0aGlzLmZpcmVCdXR0b24gPSBmaXJlQnV0dG9uO1xyXG4gICAgdGhpcy50aW1lQ29udHJvbE5vZGUgPSB0aW1lQ29udHJvbE5vZGU7XHJcbiAgICB0aGlzLmluaXRpYWxTcGVlZFBhbmVsID0gaW5pdGlhbFNwZWVkUGFuZWw7XHJcbiAgICB0aGlzLmluaXRpYWxBbmdsZVBhbmVsID0gaW5pdGlhbEFuZ2xlUGFuZWw7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLmFkZEZsYXRpcm9ucyApIHtcclxuICAgICAgLy8gRm9yIFBoRVQtaU8gc3VwcG9ydCB0byB0dXJuIG9mZiB0aGUgZmxhdCBpcm9ucyBlYXN0ZXIgZWdnIHdpdGhvdXQgaW5zdHJ1bWVudGluZyBhbnl0aGluZyBpbiB0aGUgQmFja2dyb3VuZE5vZGUuXHJcbiAgICAgIGNvbnN0IGZsYXRpcm9uc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdmbGF0aXJvbnNWaXNpYmxlUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZW4gZmFsc2UsIHRoZSBmbGF0IGlyb25zIFwiZWFzdGVyIGVnZ1wiIHdpbGwgbm90IGRpc3BsYXkgd2hlbiBhdCB0aGUgYXBwcm9wcmlhdGUgYWx0aXR1ZGUuJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyBmbGF0aXJvbnNcclxuICAgICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBtb2RlbC5hbHRpdHVkZVByb3BlcnR5LCBmbGF0aXJvbnNWaXNpYmxlUHJvcGVydHkgXSwgYWx0aXR1ZGUgPT4ge1xyXG4gICAgICAgIGJhY2tncm91bmROb2RlLnNob3dPckhpZGVGbGF0aXJvbnMoIGZsYXRpcm9uc1Zpc2libGVQcm9wZXJ0eS52YWx1ZSAmJiBhbHRpdHVkZSA+PSBGTEFUSVJPTlNfUkFOR0UubWluICYmIGFsdGl0dWRlIDw9IEZMQVRJUk9OU19SQU5HRS5tYXhcclxuICAgICAgICApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLnNldENoaWxkcmVuKCBbXHJcbiAgICAgIGJhY2tncm91bmROb2RlLFxyXG4gICAgICB0YXJnZXROb2RlLFxyXG4gICAgICBkYXZpZE5vZGUsXHJcbiAgICAgIGNhbm5vbk5vZGUsXHJcbiAgICAgIHRyYWplY3Rvcmllc0xheWVyLFxyXG4gICAgICBpbml0aWFsU3BlZWRQYW5lbCxcclxuICAgICAgaW5pdGlhbEFuZ2xlUGFuZWwsXHJcbiAgICAgIGJvdHRvbVJpZ2h0UGFuZWwsXHJcbiAgICAgIHRvcFJpZ2h0UGFuZWwsXHJcbiAgICAgIHRvb2xib3hQYW5lbCxcclxuICAgICAgZmlyZUJ1dHRvbixcclxuICAgICAgZXJhc2VyQnV0dG9uLFxyXG4gICAgICB0aW1lQ29udHJvbE5vZGUsXHJcbiAgICAgIHpvb21CdXR0b25Hcm91cCxcclxuICAgICAgcmVzZXRBbGxCdXR0b24sXHJcbiAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLFxyXG4gICAgICBkYXRhUHJvYmVOb2RlXHJcbiAgICBdICk7XHJcblxyXG4gICAgLy8gTGlua3MgaW4gdGhpcyBjb25zdHJ1Y3RvciBsYXN0IGZvciB0aGUgbGlmZSB0aW1lIG9mIHRoZSBzaW0sIHNvIHRoZXkgZG9uJ3QgbmVlZCB0byBiZSBkaXNwb3NlZFxyXG4gICAgLy8gUGFuZWxzIGxhc3QgZm9yIHRoZSBsaWZlIHRpbWUgb2YgdGhlIHNpbSwgc28gdGhlaXIgbGlua3MgZG9uJ3QgbmVlZCB0byBiZSBkaXNwb3NlZFxyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGxheW91dCggdmlld0JvdW5kczogQm91bmRzMiApOiB2b2lkIHtcclxuICAgIHRoaXMucmVzZXRUcmFuc2Zvcm0oKTtcclxuXHJcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuZ2V0TGF5b3V0U2NhbGUoIHZpZXdCb3VuZHMgKTtcclxuICAgIGNvbnN0IHdpZHRoID0gdmlld0JvdW5kcy53aWR0aDtcclxuICAgIGNvbnN0IGhlaWdodCA9IHZpZXdCb3VuZHMuaGVpZ2h0O1xyXG5cclxuICAgIHRoaXMuc2V0U2NhbGVNYWduaXR1ZGUoIHNjYWxlICk7XHJcblxyXG4gICAgbGV0IG9mZnNldFggPSAwO1xyXG4gICAgbGV0IG9mZnNldFkgPSAwO1xyXG5cclxuICAgIC8vIE1vdmUgdG8gYm90dG9tIHZlcnRpY2FsbHlcclxuICAgIGlmICggc2NhbGUgPT09IHdpZHRoIC8gdGhpcy5sYXlvdXRCb3VuZHMud2lkdGggKSB7XHJcbiAgICAgIG9mZnNldFkgPSBoZWlnaHQgLyBzY2FsZSAtIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XHJcbiAgICBlbHNlIGlmICggc2NhbGUgPT09IGhlaWdodCAvIHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCApIHtcclxuICAgICAgb2Zmc2V0WCA9ICggd2lkdGggLSB0aGlzLmxheW91dEJvdW5kcy53aWR0aCAqIHNjYWxlICkgLyAyIC8gc2NhbGU7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRyYW5zbGF0ZShcclxuICAgICAgb2Zmc2V0WCArIHZpZXdCb3VuZHMubGVmdCAvIHNjYWxlLFxyXG4gICAgICBvZmZzZXRZICsgdmlld0JvdW5kcy50b3AgLyBzY2FsZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjYWxsIG9uIGJhY2tncm91bmROb2RlJ3MgZnVuY3Rpb24gdG8gbGF5IGl0IG91dFxyXG4gICAgdGhpcy5iYWNrZ3JvdW5kTm9kZS5sYXlvdXQoIG9mZnNldFgsIG9mZnNldFksIHdpZHRoLCBoZWlnaHQsIHNjYWxlICk7XHJcblxyXG4gICAgLy8gbGF5b3V0IGNvbnRyb2xzXHJcbiAgICB0aGlzLnRvcFJpZ2h0UGFuZWwucmlnaHQgPSB3aWR0aCAvIHNjYWxlIC0gb2Zmc2V0WCAtIFhfTUFSR0lOO1xyXG4gICAgdGhpcy50b3BSaWdodFBhbmVsLnRvcCA9IFlfTUFSR0lOIC0gb2Zmc2V0WTtcclxuICAgIHRoaXMuYm90dG9tUmlnaHRQYW5lbC5zZXRSaWdodFRvcCggdGhpcy50b3BSaWdodFBhbmVsLnJpZ2h0Qm90dG9tLnBsdXNYWSggMCwgWV9NQVJHSU4gKSApO1xyXG4gICAgdGhpcy50b29sYm94UGFuZWwuc2V0UmlnaHRUb3AoIHRoaXMudG9wUmlnaHRQYW5lbC5sZWZ0VG9wLm1pbnVzWFkoIFhfTUFSR0lOLCAwICkgKTtcclxuICAgIHRoaXMucmVzZXRBbGxCdXR0b24ucmlnaHQgPSB0aGlzLnRvcFJpZ2h0UGFuZWwucmlnaHQ7XHJcbiAgICB0aGlzLmVyYXNlckJ1dHRvbi5yaWdodCA9IHRoaXMucmVzZXRBbGxCdXR0b24ubGVmdCAtIFhfTUFSR0lOO1xyXG4gICAgdGhpcy56b29tQnV0dG9uR3JvdXAudG9wID0gMiAqIFlfTUFSR0lOIC0gb2Zmc2V0WTtcclxuICAgIHRoaXMuem9vbUJ1dHRvbkdyb3VwLmxlZnQgPSB0aGlzLmxheW91dEJvdW5kcy5taW5YICsgWF9NQVJHSU47XHJcblxyXG4gICAgLy8gc2V0IHZpc2libGUgYm91bmRzLCB3aGljaCBhcmUgZGlmZmVyZW50IGZyb20gbGF5b3V0IGJvdW5kc1xyXG4gICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkuc2V0KCBuZXcgQm91bmRzMiggLW9mZnNldFgsIC1vZmZzZXRZLCB3aWR0aCAvIHNjYWxlIC0gb2Zmc2V0WCwgaGVpZ2h0IC8gc2NhbGUgLSBvZmZzZXRZICkgKTtcclxuICB9XHJcbn1cclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdQcm9qZWN0aWxlTW90aW9uU2NyZWVuVmlldycsIFByb2plY3RpbGVNb3Rpb25TY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IFByb2plY3RpbGVNb3Rpb25TY3JlZW5WaWV3O1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUE2QixvQ0FBb0M7QUFDbEYsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBQzNELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLFlBQVksTUFBTSxxREFBcUQ7QUFDOUUsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyw4QkFBOEIsTUFBTSwrREFBK0Q7QUFDMUcsT0FBT0MsV0FBVyxNQUFNLDRDQUE0QztBQUNwRSxPQUFPQyxpQkFBaUIsTUFBTSxrREFBa0Q7QUFDaEYsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLGVBQWUsTUFBTSxnREFBZ0Q7QUFDNUUsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9ELE9BQU9DLEtBQUssTUFBd0IsNkJBQTZCO0FBQ2pFLE9BQU9D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