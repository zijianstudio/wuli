// Copyright 2021-2023, University of Colorado Boulder

/**
 * GOScreenView is the common ScreenView for this simulation.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import { HBox, Node, Rectangle } from '../../../../scenery/js/imports.js';
import geometricOptics from '../../geometricOptics.js';
import GOConstants from '../GOConstants.js';
import GOQueryParameters from '../GOQueryParameters.js';
import GOControlPanel from './GOControlPanel.js';
import OpticSurfaceTypeRadioButtonGroup from './OpticSurfaceTypeRadioButtonGroup.js';
import OpticalObjectChoiceComboBox from './OpticalObjectChoiceComboBox.js';
import LightPropagationToggleButton from './LightPropagationToggleButton.js';
import VisibleProperties from './VisibleProperties.js';
import FramedSceneNode from './FramedSceneNode.js';
import GORulerNode from './tools/GORulerNode.js';
import GOToolboxNode from './tools/GOToolboxNode.js';
import FramedLabelsNode from './labels/FramedLabelsNode.js';
import ArrowSceneNode from './ArrowSceneNode.js';
import ArrowLabelsNode from './labels/ArrowLabelsNode.js';
import LightSceneNode from './LightSceneNode.js';
import LightLabelsNode from './labels/LightLabelsNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ObjectDragModeToggleButton from './ObjectDragModeToggleButton.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import PositionMarkerNode from './tools/PositionMarkerNode.js';
import { ObjectDragModeValues } from './ObjectDragMode.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// Zoom scale factors, in ascending order.
// Careful! If you add values here, you may get undesirable tick intervals on rulers.
const ZOOM_SCALES = [0.25, 0.5, 1];

// view coordinates per cm when zoom scale is 1
const NOMINAL_MODEL_TO_VIEW_SCALE = 2;
export default class GOScreenView extends ScreenView {
  // See phetioDocumentation at instantiation

  // Button for toggling between 'freeDragging' and 'horizontalDragging'

  // Resets things that are specific to this class.

  constructor(model, providedOptions) {
    const options = optionize()({
      // GOScreenViewOptions
      objectDragMode: 'freeDragging',
      // ScreenViewOptions
      // Workaround for things shifting around while dragging
      // See https://github.com/phetsims/scenery/issues/1289 and https://github.com/phetsims/geometric-optics/issues/213
      preventFit: true
    }, providedOptions);
    super(options);
    const viewOrigin = options.getViewOrigin(this.layoutBounds);

    // convenience variable for laying out scenery Nodes
    const erodedLayoutBounds = this.layoutBounds.erodedXY(GOConstants.SCREEN_VIEW_X_MARGIN, GOConstants.SCREEN_VIEW_Y_MARGIN);

    // Create a y-inverted modelViewTransform with isometric scaling along x and y axes.
    // In the model coordinate frame, +x is right, +y is up.
    // This transform is applied to things in the scenesLayer, and does NOT include zoom scaling.
    const modelViewTransform = ModelViewTransform2.createOffsetXYScaleMapping(Vector2.ZERO, NOMINAL_MODEL_TO_VIEW_SCALE, -NOMINAL_MODEL_TO_VIEW_SCALE);

    // Properties  =====================================================================================================

    // Create visibleProperty instances for Nodes in the view.
    const visibleProperties = new VisibleProperties(model.optic, {
      tandem: options.tandem.createTandem('visibleProperties')
    });

    // Zoom level for scenes
    const zoomLevelProperty = new NumberProperty(ZOOM_SCALES.indexOf(1), {
      numberType: 'Integer',
      range: new Range(0, ZOOM_SCALES.length - 1),
      tandem: options.tandem.createTandem('zoomLevelProperty'),
      phetioFeatured: true,
      phetioDocumentation: 'This Property is controlled by the zoom buttons. ' + 'It is integer index that tells the sim how to scale the view. ' + 'Smaller values are more zoomed out. ' + 'See zoomScaleProperty for the actual scale value.'
    });

    // Scale factor for the current zoom level
    const zoomScaleProperty = new DerivedProperty([zoomLevelProperty], zoomLevel => ZOOM_SCALES[zoomLevel], {
      validValues: ZOOM_SCALES,
      tandem: options.tandem.createTandem('zoomScaleProperty'),
      phetioFeatured: true,
      phetioValueType: NumberIO,
      phetioDocumentation: 'Scale that is applied to the view. This Property is derived from zoomLevelProperty, ' + ' which is controlled by the zoom buttons.'
    });

    // Transform applied to tools and labels
    const zoomTransformProperty = new DerivedProperty([zoomScaleProperty], zoomScale => {
      const scale = NOMINAL_MODEL_TO_VIEW_SCALE * zoomScale;
      return ModelViewTransform2.createOffsetXYScaleMapping(viewOrigin, scale, -scale);
    });

    // ScreenView's visibleBounds in the model coordinate frame, with the zoom transform applied.
    const modelVisibleBoundsProperty = new DerivedProperty([this.visibleBoundsProperty, zoomTransformProperty], (visibleBounds, zoomTransform) => zoomTransform.viewToModelBounds(visibleBounds));

    // Portion of the ScreenView's visibleBounds that is dedicated to scenes, in the model coordinate frame,
    // with zoom transform applied. Run with ?debugModelBounds to see this rendered as a red rectangle.
    const sceneBoundsProperty = new DerivedProperty([modelVisibleBoundsProperty], modelVisibleBounds => {
      const y = GOConstants.MAX_DISTANCE_FROM_OBJECT_TO_OPTICAL_AXIS;
      return new Bounds2(modelVisibleBounds.minX, -y, modelVisibleBounds.maxX, y);
    });
    const objectDragModeProperty = new StringUnionProperty(options.objectDragMode, {
      validValues: ObjectDragModeValues,
      tandem: providedOptions.tandem.createTandem('objectDragModeProperty'),
      phetioFeatured: true,
      phetioReadOnly: true,
      phetioDocumentation: 'Controls dragging of the optical objects. ' + 'This Property is read-only because the sim controls it, based on the type of optical object that is selected.' + 'Values are:' + '<ul>' + '<li>freeDragging: objects can be dragged freely</li>' + '<li>horizontalDragging: dragging is constrained to horizontal, parallel to the optical axis</li>' + '</ul>'
    });

    // Tools (Rulers & Position Markers) ===============================================================================

    const toolsTandem = options.tandem.createTandem('tools');
    const horizontalRulerNode = new GORulerNode(model.horizontalRuler, model.optic.positionProperty, zoomTransformProperty, zoomScaleProperty, this.visibleBoundsProperty, {
      tandem: toolsTandem.createTandem('horizontalRulerNode'),
      iconTandemName: 'horizontalRulerIcon'
    });
    const verticalRulerNode = new GORulerNode(model.verticalRuler, model.optic.positionProperty, zoomTransformProperty, zoomScaleProperty, this.visibleBoundsProperty, {
      tandem: toolsTandem.createTandem('verticalRulerNode'),
      iconTandemName: 'verticalRulerIcon'
    });
    const positionMarker1Node = new PositionMarkerNode(model.positionMarker1, zoomTransformProperty, this.visibleBoundsProperty, {
      tandem: toolsTandem.createTandem('positionMarker1Node'),
      iconTandemName: 'positionMarker1Icon'
    });
    const positionMarker2Node = new PositionMarkerNode(model.positionMarker2, zoomTransformProperty, this.visibleBoundsProperty, {
      tandem: toolsTandem.createTandem('positionMarker2Node'),
      iconTandemName: 'positionMarker2Icon'
    });

    // Toolbox in the top-right corner of the screen
    const toolboxNode = new GOToolboxNode([horizontalRulerNode, verticalRulerNode, positionMarker1Node, positionMarker2Node], {
      tandem: toolsTandem.createTandem('toolboxNode')
    });

    // Icons in the toolbox can be hidden via iO. So keep the toolbox positioned in the rightTop corner.
    toolboxNode.boundsProperty.link(bounds => {
      toolboxNode.rightTop = erodedLayoutBounds.rightTop;
    });
    const toolNodes = [horizontalRulerNode, verticalRulerNode, positionMarker2Node, positionMarker1Node];
    const toolsLayer = new Node({
      children: toolNodes
    });

    // Controls  =======================================================================================================

    const controlsTandem = options.tandem.createTandem('controls');

    // Parent for any popups
    const popupsParent = new Node();

    // Combo box for choosing the optical object
    const opticalObjectChoiceComboBox = new OpticalObjectChoiceComboBox(model.opticalObjectChoiceProperty, popupsParent, {
      tandem: controlsTandem.createTandem('opticalObjectChoiceComboBox')
    });

    // Toggle button to switch between 'freeDragging' and 'horizontalDragging' of the optical object
    const objectDragModeToggleButton = new ObjectDragModeToggleButton(objectDragModeProperty, {
      tandem: controlsTandem.createTandem('objectDragModeToggleButton')
    });
    const objectHBox = new HBox({
      children: [opticalObjectChoiceComboBox, objectDragModeToggleButton],
      spacing: 25,
      align: 'center',
      left: this.layoutBounds.left + 100,
      top: erodedLayoutBounds.top
    });

    // Radio buttons for the surface type of the optic
    const opticSurfaceTypeRadioButtonGroup = new OpticSurfaceTypeRadioButtonGroup(model.optic, {
      isBasicsVersion: options.isBasicsVersion,
      centerX: erodedLayoutBounds.centerX,
      top: erodedLayoutBounds.top,
      // Do not instrument for the Mirror screen in Geometric Optics: Basics, where we have only a flat mirror.
      // See https://github.com/phetsims/geometric-optics/issues/463
      tandem: model.optic.isExclusivelyFlatMirror() ? Tandem.OPT_OUT : controlsTandem.createTandem('opticSurfaceTypeRadioButtonGroup')
    });

    // Disable the 'Virtual Image' checkbox for lights, see https://github.com/phetsims/geometric-optics/issues/216
    const virtualImageCheckboxEnabledProperty = new DerivedProperty([model.opticalObjectChoiceProperty], opticalObjectChoice => opticalObjectChoice.type !== 'light');

    // Control panel at the bottom-center of the screen
    const controlPanel = new GOControlPanel(model.optic, model.raysTypeProperty, visibleProperties, virtualImageCheckboxEnabledProperty, {
      bottom: erodedLayoutBounds.bottom,
      isBasicsVersion: options.isBasicsVersion,
      tandem: controlsTandem.createTandem('controlPanel')
    });

    // Zoom buttons
    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup(zoomLevelProperty, {
      orientation: 'horizontal',
      spacing: 8,
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      mouseAreaXDilation: 2,
      mouseAreaYDilation: 2,
      magnifyingGlassNodeOptions: {
        scale: 0.5
      },
      buttonOptions: {
        xMargin: 5,
        yMargin: 4
      },
      left: erodedLayoutBounds.left,
      top: controlPanel.top,
      visiblePropertyOptions: {
        phetioFeatured: true
      },
      tandem: controlsTandem.createTandem('zoomButtonGroup')
    });

    // Toggle button
    const lightPropagationToggleButton = new LightPropagationToggleButton(model.lightPropagationEnabledProperty, {
      tandem: controlsTandem.createTandem('lightPropagationToggleButton')
    });
    lightPropagationToggleButton.centerX = zoomButtonGroup.centerX;
    lightPropagationToggleButton.bottom = erodedLayoutBounds.bottom;

    // Reset All button at right-bottom
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.reset();
      },
      rightBottom: erodedLayoutBounds.rightBottom,
      tandem: controlsTandem.createTandem('resetAllButton')
    });

    // Center the control panel at the bottom of the screen, in the space between the controls that are to the left
    // and right of the control panel. The size of the control panel changes dynamically, based on whether the
    // 'direct' or 'indirect' focal-length model is selected.
    controlPanel.boundsProperty.link(() => {
      controlPanel.centerX = zoomButtonGroup.right + (resetAllButton.left - zoomButtonGroup.right) / 2;
      controlPanel.bottom = erodedLayoutBounds.bottom;
    });
    const controlsLayer = new Node({
      children: [objectHBox, opticSurfaceTypeRadioButtonGroup, toolboxNode, zoomButtonGroup, lightPropagationToggleButton, controlPanel, resetAllButton]
    });

    // Scenes ==========================================================================================================

    const scenesTandem = options.tandem.createTandem('scenes');
    const sceneNodes = [];
    const arrowSceneNodeTandem = scenesTandem.createTandem('arrowSceneNode');
    const arrowSceneNode = new ArrowSceneNode(model.arrowScene, visibleProperties, modelViewTransform, modelVisibleBoundsProperty, sceneBoundsProperty, model.raysTypeProperty, model.lightPropagationEnabledProperty, {
      createOpticNode: options.createOpticNode,
      objectDragModeProperty: objectDragModeProperty,
      visibleProperty: new DerivedProperty([model.opticalObjectChoiceProperty], opticalObjectChoice => opticalObjectChoice.type === 'arrow', {
        tandem: arrowSceneNodeTandem.createTandem('visibleProperty'),
        phetioValueType: BooleanIO
      }),
      tandem: arrowSceneNodeTandem
    });
    sceneNodes.push(arrowSceneNode);
    const frameSceneNodeTandem = scenesTandem.createTandem('framedSceneNode');
    const framedSceneNode = new FramedSceneNode(model.framedScene, visibleProperties, modelViewTransform, modelVisibleBoundsProperty, sceneBoundsProperty, model.raysTypeProperty, model.lightPropagationEnabledProperty, {
      createOpticNode: options.createOpticNode,
      objectDragModeProperty: objectDragModeProperty,
      visibleProperty: new DerivedProperty([model.opticalObjectChoiceProperty], opticalObjectChoice => opticalObjectChoice.type === 'framed', {
        tandem: frameSceneNodeTandem.createTandem('visibleProperty'),
        phetioValueType: BooleanIO
      }),
      tandem: frameSceneNodeTandem
    });
    sceneNodes.push(framedSceneNode);

    // Note that while the Light scene is specific to the Mirror screen, it was more straightforward to handle it
    // as an optional part of this base class.
    let lightSceneNode = null;
    if (model.lightScene) {
      const lightSceneNodeTandem = scenesTandem.createTandem('lightSceneNode');
      lightSceneNode = new LightSceneNode(model.lightScene, visibleProperties, modelViewTransform, modelVisibleBoundsProperty, sceneBoundsProperty, model.raysTypeProperty, model.lightPropagationEnabledProperty, {
        createOpticNode: options.createOpticNode,
        objectDragModeProperty: objectDragModeProperty,
        visibleProperty: new DerivedProperty([model.opticalObjectChoiceProperty], opticalObjectChoice => opticalObjectChoice.type === 'light', {
          tandem: lightSceneNodeTandem.createTandem('visibleProperty'),
          phetioValueType: BooleanIO
        }),
        tandem: lightSceneNodeTandem
      });
      sceneNodes.push(lightSceneNode);
    }

    // When a sceneNode becomes visible, use the scene's jump points for tools.
    sceneNodes.forEach(sceneNode => {
      sceneNode.visibleProperty.link(visible => {
        if (visible) {
          toolNodes.forEach(toolNode => toolNode.setJumpPoints(sceneNode.toolJumpPoints));
        }
      });
    });
    const scenesLayer = new Node({
      children: sceneNodes
    });

    // Show sceneBounds as a red rectangle.
    if (GOQueryParameters.debugSceneBounds) {
      const dragBoundsNode = new Rectangle(modelViewTransform.modelToViewBounds(sceneBoundsProperty.value), {
        stroke: 'red'
      });
      scenesLayer.addChild(dragBoundsNode);
      sceneBoundsProperty.link(sceneBounds => {
        const viewBounds = modelViewTransform.modelToViewBounds(sceneBounds);
        dragBoundsNode.setRect(viewBounds.x, viewBounds.y, viewBounds.width, viewBounds.height);
      });
    }

    // Scale the scene
    zoomScaleProperty.link(zoomScale => {
      scenesLayer.setScaleMagnitude(zoomScale);
      scenesLayer.translation = viewOrigin;
    });

    // Labels ==========================================================================================================

    const labelsLayer = new Node({
      visibleProperty: visibleProperties.labelsVisibleProperty
    });

    // Labels for things in the 'Arrow' scene
    const arrowLabelsNode = new ArrowLabelsNode(arrowSceneNode, zoomTransformProperty, modelVisibleBoundsProperty, {
      isBasicsVersion: options.isBasicsVersion,
      visibleProperty: arrowSceneNode.visibleProperty,
      tandem: arrowSceneNode.tandem.createTandem('labels'),
      // child of scene
      phetioDocumentation: `Labels for things in ${arrowSceneNode.tandem.name}`
    });
    labelsLayer.addChild(arrowLabelsNode);

    // Labels for things in the 'Framed Object' scene
    const framedLabelsNode = new FramedLabelsNode(framedSceneNode, zoomTransformProperty, modelVisibleBoundsProperty, {
      visibleProperty: framedSceneNode.visibleProperty,
      tandem: framedSceneNode.tandem.createTandem('labels'),
      // child of scene
      phetioDocumentation: `Labels for things in ${framedSceneNode.tandem.name}`
    });
    labelsLayer.addChild(framedLabelsNode);

    // Labels for things in the 'Light' scene. Note that while the Light scene is specific to the Mirror screen,
    // it was more straightforward to handle it as an optional part of this base class.
    let lightLabelsNode = null;
    if (model.lightScene && lightSceneNode) {
      lightLabelsNode = new LightLabelsNode(lightSceneNode, zoomTransformProperty, modelVisibleBoundsProperty, {
        isBasicsVersion: options.isBasicsVersion,
        visibleProperty: lightSceneNode.visibleProperty,
        tandem: lightSceneNode.tandem.createTandem('labels'),
        // child of scene
        phetioDocumentation: `Labels for things in ${lightSceneNode.tandem.name}`
      });
      labelsLayer.addChild(lightLabelsNode);
    }

    // Layout ==========================================================================================================

    const screenViewRootNode = new Node({
      children: [scenesLayer, labelsLayer, controlsLayer, toolsLayer, popupsParent]
    });
    this.addChild(screenViewRootNode);

    // Listeners =======================================================================================================

    // If light propagation is enabled, changing these Properties causes the light rays to animate.
    Multilink.multilink([model.lightPropagationEnabledProperty, model.raysTypeProperty], (lightPropagationEnabled, raysType) => {
      if (lightPropagationEnabled) {
        model.beginLightRaysAnimation();
      }
    });

    // Changing these things interrupts interactions
    const interrupt = () => this.interruptSubtreeInput();
    zoomLevelProperty.lazyLink(interrupt);
    model.opticalObjectChoiceProperty.lazyLink(interrupt);

    //==================================================================================================================

    this.resetGOScreenView = () => {
      visibleProperties.reset();
      zoomLevelProperty.reset();
      objectDragModeProperty.reset();
      arrowSceneNode.reset();
      framedSceneNode.reset();
      lightSceneNode && lightSceneNode.reset();
    };

    // pdom - traversal order
    screenViewRootNode.pdomOrder = [scenesLayer, horizontalRulerNode, verticalRulerNode, positionMarker1Node, positionMarker2Node, opticalObjectChoiceComboBox, objectDragModeToggleButton, opticSurfaceTypeRadioButtonGroup, toolboxNode, zoomButtonGroup, lightPropagationToggleButton, controlPanel, resetAllButton];
    this.objectDragModeProperty = objectDragModeProperty;
    this.objectDragModeToggleButton = objectDragModeToggleButton;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.resetGOScreenView();
  }
}
geometricOptics.register('GOScreenView', GOScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIkJvdW5kczIiLCJSYW5nZSIsIlZlY3RvcjIiLCJTY3JlZW5WaWV3IiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIlJlc2V0QWxsQnV0dG9uIiwiTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJnZW9tZXRyaWNPcHRpY3MiLCJHT0NvbnN0YW50cyIsIkdPUXVlcnlQYXJhbWV0ZXJzIiwiR09Db250cm9sUGFuZWwiLCJPcHRpY1N1cmZhY2VUeXBlUmFkaW9CdXR0b25Hcm91cCIsIk9wdGljYWxPYmplY3RDaG9pY2VDb21ib0JveCIsIkxpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24iLCJWaXNpYmxlUHJvcGVydGllcyIsIkZyYW1lZFNjZW5lTm9kZSIsIkdPUnVsZXJOb2RlIiwiR09Ub29sYm94Tm9kZSIsIkZyYW1lZExhYmVsc05vZGUiLCJBcnJvd1NjZW5lTm9kZSIsIkFycm93TGFiZWxzTm9kZSIsIkxpZ2h0U2NlbmVOb2RlIiwiTGlnaHRMYWJlbHNOb2RlIiwib3B0aW9uaXplIiwiT2JqZWN0RHJhZ01vZGVUb2dnbGVCdXR0b24iLCJOdW1iZXJJTyIsIlBvc2l0aW9uTWFya2VyTm9kZSIsIk9iamVjdERyYWdNb2RlVmFsdWVzIiwiQm9vbGVhbklPIiwiU3RyaW5nVW5pb25Qcm9wZXJ0eSIsIk11bHRpbGluayIsIlRhbmRlbSIsIlpPT01fU0NBTEVTIiwiTk9NSU5BTF9NT0RFTF9UT19WSUVXX1NDQUxFIiwiR09TY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJvYmplY3REcmFnTW9kZSIsInByZXZlbnRGaXQiLCJ2aWV3T3JpZ2luIiwiZ2V0Vmlld09yaWdpbiIsImxheW91dEJvdW5kcyIsImVyb2RlZExheW91dEJvdW5kcyIsImVyb2RlZFhZIiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImNyZWF0ZU9mZnNldFhZU2NhbGVNYXBwaW5nIiwiWkVSTyIsInZpc2libGVQcm9wZXJ0aWVzIiwib3B0aWMiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJ6b29tTGV2ZWxQcm9wZXJ0eSIsImluZGV4T2YiLCJudW1iZXJUeXBlIiwicmFuZ2UiLCJsZW5ndGgiLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJ6b29tU2NhbGVQcm9wZXJ0eSIsInpvb21MZXZlbCIsInZhbGlkVmFsdWVzIiwicGhldGlvVmFsdWVUeXBlIiwiem9vbVRyYW5zZm9ybVByb3BlcnR5Iiwiem9vbVNjYWxlIiwic2NhbGUiLCJtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInZpc2libGVCb3VuZHNQcm9wZXJ0eSIsInZpc2libGVCb3VuZHMiLCJ6b29tVHJhbnNmb3JtIiwidmlld1RvTW9kZWxCb3VuZHMiLCJzY2VuZUJvdW5kc1Byb3BlcnR5IiwibW9kZWxWaXNpYmxlQm91bmRzIiwieSIsIk1BWF9ESVNUQU5DRV9GUk9NX09CSkVDVF9UT19PUFRJQ0FMX0FYSVMiLCJtaW5YIiwibWF4WCIsIm9iamVjdERyYWdNb2RlUHJvcGVydHkiLCJwaGV0aW9SZWFkT25seSIsInRvb2xzVGFuZGVtIiwiaG9yaXpvbnRhbFJ1bGVyTm9kZSIsImhvcml6b250YWxSdWxlciIsInBvc2l0aW9uUHJvcGVydHkiLCJpY29uVGFuZGVtTmFtZSIsInZlcnRpY2FsUnVsZXJOb2RlIiwidmVydGljYWxSdWxlciIsInBvc2l0aW9uTWFya2VyMU5vZGUiLCJwb3NpdGlvbk1hcmtlcjEiLCJwb3NpdGlvbk1hcmtlcjJOb2RlIiwicG9zaXRpb25NYXJrZXIyIiwidG9vbGJveE5vZGUiLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJib3VuZHMiLCJyaWdodFRvcCIsInRvb2xOb2RlcyIsInRvb2xzTGF5ZXIiLCJjaGlsZHJlbiIsImNvbnRyb2xzVGFuZGVtIiwicG9wdXBzUGFyZW50Iiwib3B0aWNhbE9iamVjdENob2ljZUNvbWJvQm94Iiwib3B0aWNhbE9iamVjdENob2ljZVByb3BlcnR5Iiwib2JqZWN0RHJhZ01vZGVUb2dnbGVCdXR0b24iLCJvYmplY3RIQm94Iiwic3BhY2luZyIsImFsaWduIiwibGVmdCIsInRvcCIsIm9wdGljU3VyZmFjZVR5cGVSYWRpb0J1dHRvbkdyb3VwIiwiaXNCYXNpY3NWZXJzaW9uIiwiY2VudGVyWCIsImlzRXhjbHVzaXZlbHlGbGF0TWlycm9yIiwiT1BUX09VVCIsInZpcnR1YWxJbWFnZUNoZWNrYm94RW5hYmxlZFByb3BlcnR5Iiwib3B0aWNhbE9iamVjdENob2ljZSIsInR5cGUiLCJjb250cm9sUGFuZWwiLCJyYXlzVHlwZVByb3BlcnR5IiwiYm90dG9tIiwiem9vbUJ1dHRvbkdyb3VwIiwib3JpZW50YXRpb24iLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJ0b3VjaEFyZWFZRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJtYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyIsImJ1dHRvbk9wdGlvbnMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsInZpc2libGVQcm9wZXJ0eU9wdGlvbnMiLCJsaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uIiwibGlnaHRQcm9wYWdhdGlvbkVuYWJsZWRQcm9wZXJ0eSIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZXNldCIsInJpZ2h0Qm90dG9tIiwicmlnaHQiLCJjb250cm9sc0xheWVyIiwic2NlbmVzVGFuZGVtIiwic2NlbmVOb2RlcyIsImFycm93U2NlbmVOb2RlVGFuZGVtIiwiYXJyb3dTY2VuZU5vZGUiLCJhcnJvd1NjZW5lIiwiY3JlYXRlT3B0aWNOb2RlIiwidmlzaWJsZVByb3BlcnR5IiwicHVzaCIsImZyYW1lU2NlbmVOb2RlVGFuZGVtIiwiZnJhbWVkU2NlbmVOb2RlIiwiZnJhbWVkU2NlbmUiLCJsaWdodFNjZW5lTm9kZSIsImxpZ2h0U2NlbmUiLCJsaWdodFNjZW5lTm9kZVRhbmRlbSIsImZvckVhY2giLCJzY2VuZU5vZGUiLCJ2aXNpYmxlIiwidG9vbE5vZGUiLCJzZXRKdW1wUG9pbnRzIiwidG9vbEp1bXBQb2ludHMiLCJzY2VuZXNMYXllciIsImRlYnVnU2NlbmVCb3VuZHMiLCJkcmFnQm91bmRzTm9kZSIsIm1vZGVsVG9WaWV3Qm91bmRzIiwidmFsdWUiLCJzdHJva2UiLCJhZGRDaGlsZCIsInNjZW5lQm91bmRzIiwidmlld0JvdW5kcyIsInNldFJlY3QiLCJ4Iiwid2lkdGgiLCJoZWlnaHQiLCJzZXRTY2FsZU1hZ25pdHVkZSIsInRyYW5zbGF0aW9uIiwibGFiZWxzTGF5ZXIiLCJsYWJlbHNWaXNpYmxlUHJvcGVydHkiLCJhcnJvd0xhYmVsc05vZGUiLCJuYW1lIiwiZnJhbWVkTGFiZWxzTm9kZSIsImxpZ2h0TGFiZWxzTm9kZSIsInNjcmVlblZpZXdSb290Tm9kZSIsIm11bHRpbGluayIsImxpZ2h0UHJvcGFnYXRpb25FbmFibGVkIiwicmF5c1R5cGUiLCJiZWdpbkxpZ2h0UmF5c0FuaW1hdGlvbiIsImludGVycnVwdCIsImxhenlMaW5rIiwicmVzZXRHT1NjcmVlblZpZXciLCJwZG9tT3JkZXIiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHT1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR09TY3JlZW5WaWV3IGlzIHRoZSBjb21tb24gU2NyZWVuVmlldyBmb3IgdGhpcyBzaW11bGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcnRpbiBWZWlsbGV0dGVcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3LCB7IFNjcmVlblZpZXdPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IE1hZ25pZnlpbmdHbGFzc1pvb21CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwLmpzJztcclxuaW1wb3J0IHsgSEJveCwgTm9kZSwgUmVjdGFuZ2xlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgR09Db25zdGFudHMgZnJvbSAnLi4vR09Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgR09RdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vR09RdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgR09Nb2RlbCBmcm9tICcuLi9tb2RlbC9HT01vZGVsLmpzJztcclxuaW1wb3J0IEdPQ29udHJvbFBhbmVsIGZyb20gJy4vR09Db250cm9sUGFuZWwuanMnO1xyXG5pbXBvcnQgT3B0aWNTdXJmYWNlVHlwZVJhZGlvQnV0dG9uR3JvdXAgZnJvbSAnLi9PcHRpY1N1cmZhY2VUeXBlUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBPcHRpY2FsT2JqZWN0Q2hvaWNlQ29tYm9Cb3ggZnJvbSAnLi9PcHRpY2FsT2JqZWN0Q2hvaWNlQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgTGlnaHRQcm9wYWdhdGlvblRvZ2dsZUJ1dHRvbiBmcm9tICcuL0xpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgVmlzaWJsZVByb3BlcnRpZXMgZnJvbSAnLi9WaXNpYmxlUHJvcGVydGllcy5qcyc7XHJcbmltcG9ydCBGcmFtZWRTY2VuZU5vZGUgZnJvbSAnLi9GcmFtZWRTY2VuZU5vZGUuanMnO1xyXG5pbXBvcnQgR09SdWxlck5vZGUgZnJvbSAnLi90b29scy9HT1J1bGVyTm9kZS5qcyc7XHJcbmltcG9ydCBHT1Rvb2xib3hOb2RlIGZyb20gJy4vdG9vbHMvR09Ub29sYm94Tm9kZS5qcyc7XHJcbmltcG9ydCBGcmFtZWRMYWJlbHNOb2RlIGZyb20gJy4vbGFiZWxzL0ZyYW1lZExhYmVsc05vZGUuanMnO1xyXG5pbXBvcnQgQXJyb3dTY2VuZU5vZGUgZnJvbSAnLi9BcnJvd1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBBcnJvd0xhYmVsc05vZGUgZnJvbSAnLi9sYWJlbHMvQXJyb3dMYWJlbHNOb2RlLmpzJztcclxuaW1wb3J0IExpZ2h0U2NlbmVOb2RlIGZyb20gJy4vTGlnaHRTY2VuZU5vZGUuanMnO1xyXG5pbXBvcnQgTGlnaHRMYWJlbHNOb2RlIGZyb20gJy4vbGFiZWxzL0xpZ2h0TGFiZWxzTm9kZS5qcyc7XHJcbmltcG9ydCBHT1NjZW5lTm9kZSwgeyBHT1NjZW5lTm9kZU9wdGlvbnMgfSBmcm9tICcuL0dPU2NlbmVOb2RlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IE9iamVjdERyYWdNb2RlVG9nZ2xlQnV0dG9uIGZyb20gJy4vT2JqZWN0RHJhZ01vZGVUb2dnbGVCdXR0b24uanMnO1xyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcbmltcG9ydCBQb3NpdGlvbk1hcmtlck5vZGUgZnJvbSAnLi90b29scy9Qb3NpdGlvbk1hcmtlck5vZGUuanMnO1xyXG5pbXBvcnQgeyBPYmplY3REcmFnTW9kZSwgT2JqZWN0RHJhZ01vZGVWYWx1ZXMgfSBmcm9tICcuL09iamVjdERyYWdNb2RlLmpzJztcclxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcclxuaW1wb3J0IHsgR09TaW1PcHRpb25zIH0gZnJvbSAnLi4vLi4vR09TaW0uanMnO1xyXG5pbXBvcnQgR09Ub29sTm9kZSBmcm9tICcuL3Rvb2xzL0dPVG9vbE5vZGUuanMnO1xyXG5pbXBvcnQgU3RyaW5nVW5pb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1N0cmluZ1VuaW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbi8vIFpvb20gc2NhbGUgZmFjdG9ycywgaW4gYXNjZW5kaW5nIG9yZGVyLlxyXG4vLyBDYXJlZnVsISBJZiB5b3UgYWRkIHZhbHVlcyBoZXJlLCB5b3UgbWF5IGdldCB1bmRlc2lyYWJsZSB0aWNrIGludGVydmFscyBvbiBydWxlcnMuXHJcbmNvbnN0IFpPT01fU0NBTEVTID0gWyAwLjI1LCAwLjUsIDEgXTtcclxuXHJcbi8vIHZpZXcgY29vcmRpbmF0ZXMgcGVyIGNtIHdoZW4gem9vbSBzY2FsZSBpcyAxXHJcbmNvbnN0IE5PTUlOQUxfTU9ERUxfVE9fVklFV19TQ0FMRSA9IDI7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBJbml0aWFsIHZhbHVlIGZvciBvYmplY3REcmFnTW9kZVByb3BlcnR5XHJcbiAgb2JqZWN0RHJhZ01vZGU/OiBPYmplY3REcmFnTW9kZTtcclxuXHJcbiAgLy8gR2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIG1vZGVsIG9yaWdpbiBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgZ2V0Vmlld09yaWdpbjogKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKSA9PiBWZWN0b3IyO1xyXG5cclxufSAmIFBpY2tSZXF1aXJlZDxHT1NpbU9wdGlvbnMsICdpc0Jhc2ljc1ZlcnNpb24nPiAmIFBpY2tSZXF1aXJlZDxHT1NjZW5lTm9kZU9wdGlvbnMsICdjcmVhdGVPcHRpY05vZGUnPjtcclxuXHJcbmV4cG9ydCB0eXBlIEdPU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxTY3JlZW5WaWV3T3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR09TY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8vIFNlZSBwaGV0aW9Eb2N1bWVudGF0aW9uIGF0IGluc3RhbnRpYXRpb25cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgb2JqZWN0RHJhZ01vZGVQcm9wZXJ0eTogVFByb3BlcnR5PE9iamVjdERyYWdNb2RlPjtcclxuXHJcbiAgLy8gQnV0dG9uIGZvciB0b2dnbGluZyBiZXR3ZWVuICdmcmVlRHJhZ2dpbmcnIGFuZCAnaG9yaXpvbnRhbERyYWdnaW5nJ1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBvYmplY3REcmFnTW9kZVRvZ2dsZUJ1dHRvbjogTm9kZTtcclxuXHJcbiAgLy8gUmVzZXRzIHRoaW5ncyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIGNsYXNzLlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVzZXRHT1NjcmVlblZpZXc6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IEdPTW9kZWwsIHByb3ZpZGVkT3B0aW9uczogR09TY3JlZW5WaWV3T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEdPU2NyZWVuVmlld09wdGlvbnMsIFNlbGZPcHRpb25zLCBTY3JlZW5WaWV3T3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gR09TY3JlZW5WaWV3T3B0aW9uc1xyXG4gICAgICBvYmplY3REcmFnTW9kZTogJ2ZyZWVEcmFnZ2luZycsXHJcblxyXG4gICAgICAvLyBTY3JlZW5WaWV3T3B0aW9uc1xyXG4gICAgICAvLyBXb3JrYXJvdW5kIGZvciB0aGluZ3Mgc2hpZnRpbmcgYXJvdW5kIHdoaWxlIGRyYWdnaW5nXHJcbiAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS9pc3N1ZXMvMTI4OSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MvaXNzdWVzLzIxM1xyXG4gICAgICBwcmV2ZW50Rml0OiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHZpZXdPcmlnaW4gPSBvcHRpb25zLmdldFZpZXdPcmlnaW4oIHRoaXMubGF5b3V0Qm91bmRzICk7XHJcblxyXG4gICAgLy8gY29udmVuaWVuY2UgdmFyaWFibGUgZm9yIGxheWluZyBvdXQgc2NlbmVyeSBOb2Rlc1xyXG4gICAgY29uc3QgZXJvZGVkTGF5b3V0Qm91bmRzID0gdGhpcy5sYXlvdXRCb3VuZHMuZXJvZGVkWFkoXHJcbiAgICAgIEdPQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLCBHT0NvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTiApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHktaW52ZXJ0ZWQgbW9kZWxWaWV3VHJhbnNmb3JtIHdpdGggaXNvbWV0cmljIHNjYWxpbmcgYWxvbmcgeCBhbmQgeSBheGVzLlxyXG4gICAgLy8gSW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUsICt4IGlzIHJpZ2h0LCAreSBpcyB1cC5cclxuICAgIC8vIFRoaXMgdHJhbnNmb3JtIGlzIGFwcGxpZWQgdG8gdGhpbmdzIGluIHRoZSBzY2VuZXNMYXllciwgYW5kIGRvZXMgTk9UIGluY2x1ZGUgem9vbSBzY2FsaW5nLlxyXG4gICAgY29uc3QgbW9kZWxWaWV3VHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVPZmZzZXRYWVNjYWxlTWFwcGluZyggVmVjdG9yMi5aRVJPLFxyXG4gICAgICBOT01JTkFMX01PREVMX1RPX1ZJRVdfU0NBTEUsIC1OT01JTkFMX01PREVMX1RPX1ZJRVdfU0NBTEUgKTtcclxuXHJcbiAgICAvLyBQcm9wZXJ0aWVzICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIC8vIENyZWF0ZSB2aXNpYmxlUHJvcGVydHkgaW5zdGFuY2VzIGZvciBOb2RlcyBpbiB0aGUgdmlldy5cclxuICAgIGNvbnN0IHZpc2libGVQcm9wZXJ0aWVzID0gbmV3IFZpc2libGVQcm9wZXJ0aWVzKCBtb2RlbC5vcHRpYywge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Zpc2libGVQcm9wZXJ0aWVzJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gWm9vbSBsZXZlbCBmb3Igc2NlbmVzXHJcbiAgICBjb25zdCB6b29tTGV2ZWxQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggWk9PTV9TQ0FMRVMuaW5kZXhPZiggMSApLCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgWk9PTV9TQ0FMRVMubGVuZ3RoIC0gMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3pvb21MZXZlbFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgUHJvcGVydHkgaXMgY29udHJvbGxlZCBieSB0aGUgem9vbSBidXR0b25zLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0l0IGlzIGludGVnZXIgaW5kZXggdGhhdCB0ZWxscyB0aGUgc2ltIGhvdyB0byBzY2FsZSB0aGUgdmlldy4gJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdTbWFsbGVyIHZhbHVlcyBhcmUgbW9yZSB6b29tZWQgb3V0LiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1NlZSB6b29tU2NhbGVQcm9wZXJ0eSBmb3IgdGhlIGFjdHVhbCBzY2FsZSB2YWx1ZS4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2NhbGUgZmFjdG9yIGZvciB0aGUgY3VycmVudCB6b29tIGxldmVsXHJcbiAgICBjb25zdCB6b29tU2NhbGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgem9vbUxldmVsUHJvcGVydHkgXSxcclxuICAgICAgem9vbUxldmVsID0+IFpPT01fU0NBTEVTWyB6b29tTGV2ZWwgXSwge1xyXG4gICAgICAgIHZhbGlkVmFsdWVzOiBaT09NX1NDQUxFUyxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3pvb21TY2FsZVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU8sXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1NjYWxlIHRoYXQgaXMgYXBwbGllZCB0byB0aGUgdmlldy4gVGhpcyBQcm9wZXJ0eSBpcyBkZXJpdmVkIGZyb20gem9vbUxldmVsUHJvcGVydHksICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgd2hpY2ggaXMgY29udHJvbGxlZCBieSB0aGUgem9vbSBidXR0b25zLidcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFRyYW5zZm9ybSBhcHBsaWVkIHRvIHRvb2xzIGFuZCBsYWJlbHNcclxuICAgIGNvbnN0IHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgem9vbVNjYWxlUHJvcGVydHkgXSxcclxuICAgICAgem9vbVNjYWxlID0+IHtcclxuICAgICAgICBjb25zdCBzY2FsZSA9IE5PTUlOQUxfTU9ERUxfVE9fVklFV19TQ0FMRSAqIHpvb21TY2FsZTtcclxuICAgICAgICByZXR1cm4gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVPZmZzZXRYWVNjYWxlTWFwcGluZyggdmlld09yaWdpbiwgc2NhbGUsIC1zY2FsZSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gU2NyZWVuVmlldydzIHZpc2libGVCb3VuZHMgaW4gdGhlIG1vZGVsIGNvb3JkaW5hdGUgZnJhbWUsIHdpdGggdGhlIHpvb20gdHJhbnNmb3JtIGFwcGxpZWQuXHJcbiAgICBjb25zdCBtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHZpc2libGVCb3VuZHMsIHpvb21UcmFuc2Zvcm0gKSA9PiB6b29tVHJhbnNmb3JtLnZpZXdUb01vZGVsQm91bmRzKCB2aXNpYmxlQm91bmRzIClcclxuICAgICk7XHJcblxyXG4gICAgLy8gUG9ydGlvbiBvZiB0aGUgU2NyZWVuVmlldydzIHZpc2libGVCb3VuZHMgdGhhdCBpcyBkZWRpY2F0ZWQgdG8gc2NlbmVzLCBpbiB0aGUgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZSxcclxuICAgIC8vIHdpdGggem9vbSB0cmFuc2Zvcm0gYXBwbGllZC4gUnVuIHdpdGggP2RlYnVnTW9kZWxCb3VuZHMgdG8gc2VlIHRoaXMgcmVuZGVyZWQgYXMgYSByZWQgcmVjdGFuZ2xlLlxyXG4gICAgY29uc3Qgc2NlbmVCb3VuZHNQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHkgXSxcclxuICAgICAgbW9kZWxWaXNpYmxlQm91bmRzID0+IHtcclxuICAgICAgICBjb25zdCB5ID0gR09Db25zdGFudHMuTUFYX0RJU1RBTkNFX0ZST01fT0JKRUNUX1RPX09QVElDQUxfQVhJUztcclxuICAgICAgICByZXR1cm4gbmV3IEJvdW5kczIoIG1vZGVsVmlzaWJsZUJvdW5kcy5taW5YLCAteSwgbW9kZWxWaXNpYmxlQm91bmRzLm1heFgsIHkgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdERyYWdNb2RlUHJvcGVydHkgPSBuZXcgU3RyaW5nVW5pb25Qcm9wZXJ0eSggb3B0aW9ucy5vYmplY3REcmFnTW9kZSwge1xyXG4gICAgICB2YWxpZFZhbHVlczogT2JqZWN0RHJhZ01vZGVWYWx1ZXMsXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdvYmplY3REcmFnTW9kZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDb250cm9scyBkcmFnZ2luZyBvZiB0aGUgb3B0aWNhbCBvYmplY3RzLiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RoaXMgUHJvcGVydHkgaXMgcmVhZC1vbmx5IGJlY2F1c2UgdGhlIHNpbSBjb250cm9scyBpdCwgYmFzZWQgb24gdGhlIHR5cGUgb2Ygb3B0aWNhbCBvYmplY3QgdGhhdCBpcyBzZWxlY3RlZC4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1ZhbHVlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8dWw+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+ZnJlZURyYWdnaW5nOiBvYmplY3RzIGNhbiBiZSBkcmFnZ2VkIGZyZWVseTwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+aG9yaXpvbnRhbERyYWdnaW5nOiBkcmFnZ2luZyBpcyBjb25zdHJhaW5lZCB0byBob3Jpem9udGFsLCBwYXJhbGxlbCB0byB0aGUgb3B0aWNhbCBheGlzPC9saT4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJzwvdWw+J1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvb2xzIChSdWxlcnMgJiBQb3NpdGlvbiBNYXJrZXJzKSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY29uc3QgdG9vbHNUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0b29scycgKTtcclxuXHJcbiAgICBjb25zdCBob3Jpem9udGFsUnVsZXJOb2RlID0gbmV3IEdPUnVsZXJOb2RlKCBtb2RlbC5ob3Jpem9udGFsUnVsZXIsIG1vZGVsLm9wdGljLnBvc2l0aW9uUHJvcGVydHksXHJcbiAgICAgIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSwgem9vbVNjYWxlUHJvcGVydHksIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiB0b29sc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdob3Jpem9udGFsUnVsZXJOb2RlJyApLFxyXG4gICAgICAgIGljb25UYW5kZW1OYW1lOiAnaG9yaXpvbnRhbFJ1bGVySWNvbidcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHZlcnRpY2FsUnVsZXJOb2RlID0gbmV3IEdPUnVsZXJOb2RlKCBtb2RlbC52ZXJ0aWNhbFJ1bGVyLCBtb2RlbC5vcHRpYy5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICB6b29tVHJhbnNmb3JtUHJvcGVydHksIHpvb21TY2FsZVByb3BlcnR5LCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogdG9vbHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAndmVydGljYWxSdWxlck5vZGUnICksXHJcbiAgICAgICAgaWNvblRhbmRlbU5hbWU6ICd2ZXJ0aWNhbFJ1bGVySWNvbidcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBvc2l0aW9uTWFya2VyMU5vZGUgPSBuZXcgUG9zaXRpb25NYXJrZXJOb2RlKCBtb2RlbC5wb3NpdGlvbk1hcmtlcjEsIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSxcclxuICAgICAgdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHksIHtcclxuICAgICAgICB0YW5kZW06IHRvb2xzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Bvc2l0aW9uTWFya2VyMU5vZGUnICksXHJcbiAgICAgICAgaWNvblRhbmRlbU5hbWU6ICdwb3NpdGlvbk1hcmtlcjFJY29uJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcG9zaXRpb25NYXJrZXIyTm9kZSA9IG5ldyBQb3NpdGlvbk1hcmtlck5vZGUoIG1vZGVsLnBvc2l0aW9uTWFya2VyMiwgem9vbVRyYW5zZm9ybVByb3BlcnR5LFxyXG4gICAgICB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwge1xyXG4gICAgICAgIHRhbmRlbTogdG9vbHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAncG9zaXRpb25NYXJrZXIyTm9kZScgKSxcclxuICAgICAgICBpY29uVGFuZGVtTmFtZTogJ3Bvc2l0aW9uTWFya2VyMkljb24nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBUb29sYm94IGluIHRoZSB0b3AtcmlnaHQgY29ybmVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGNvbnN0IHRvb2xib3hOb2RlID0gbmV3IEdPVG9vbGJveE5vZGUoIFsgaG9yaXpvbnRhbFJ1bGVyTm9kZSwgdmVydGljYWxSdWxlck5vZGUsIHBvc2l0aW9uTWFya2VyMU5vZGUsIHBvc2l0aW9uTWFya2VyMk5vZGUgXSwge1xyXG4gICAgICB0YW5kZW06IHRvb2xzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Rvb2xib3hOb2RlJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gSWNvbnMgaW4gdGhlIHRvb2xib3ggY2FuIGJlIGhpZGRlbiB2aWEgaU8uIFNvIGtlZXAgdGhlIHRvb2xib3ggcG9zaXRpb25lZCBpbiB0aGUgcmlnaHRUb3AgY29ybmVyLlxyXG4gICAgdG9vbGJveE5vZGUuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgdG9vbGJveE5vZGUucmlnaHRUb3AgPSBlcm9kZWRMYXlvdXRCb3VuZHMucmlnaHRUb3A7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdG9vbE5vZGVzOiBHT1Rvb2xOb2RlW10gPSBbIGhvcml6b250YWxSdWxlck5vZGUsIHZlcnRpY2FsUnVsZXJOb2RlLCBwb3NpdGlvbk1hcmtlcjJOb2RlLCBwb3NpdGlvbk1hcmtlcjFOb2RlIF07XHJcblxyXG4gICAgY29uc3QgdG9vbHNMYXllciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiB0b29sTm9kZXNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb250cm9scyAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNvbnN0IGNvbnRyb2xzVGFuZGVtID0gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udHJvbHMnICk7XHJcblxyXG4gICAgLy8gUGFyZW50IGZvciBhbnkgcG9wdXBzXHJcbiAgICBjb25zdCBwb3B1cHNQYXJlbnQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIENvbWJvIGJveCBmb3IgY2hvb3NpbmcgdGhlIG9wdGljYWwgb2JqZWN0XHJcbiAgICBjb25zdCBvcHRpY2FsT2JqZWN0Q2hvaWNlQ29tYm9Cb3ggPSBuZXcgT3B0aWNhbE9iamVjdENob2ljZUNvbWJvQm94KCBtb2RlbC5vcHRpY2FsT2JqZWN0Q2hvaWNlUHJvcGVydHksIHBvcHVwc1BhcmVudCwge1xyXG4gICAgICB0YW5kZW06IGNvbnRyb2xzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ29wdGljYWxPYmplY3RDaG9pY2VDb21ib0JveCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRvZ2dsZSBidXR0b24gdG8gc3dpdGNoIGJldHdlZW4gJ2ZyZWVEcmFnZ2luZycgYW5kICdob3Jpem9udGFsRHJhZ2dpbmcnIG9mIHRoZSBvcHRpY2FsIG9iamVjdFxyXG4gICAgY29uc3Qgb2JqZWN0RHJhZ01vZGVUb2dnbGVCdXR0b24gPSBuZXcgT2JqZWN0RHJhZ01vZGVUb2dnbGVCdXR0b24oIG9iamVjdERyYWdNb2RlUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBjb250cm9sc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdvYmplY3REcmFnTW9kZVRvZ2dsZUJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG9iamVjdEhCb3ggPSBuZXcgSEJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBvcHRpY2FsT2JqZWN0Q2hvaWNlQ29tYm9Cb3gsIG9iamVjdERyYWdNb2RlVG9nZ2xlQnV0dG9uIF0sXHJcbiAgICAgIHNwYWNpbmc6IDI1LFxyXG4gICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAxMDAsXHJcbiAgICAgIHRvcDogZXJvZGVkTGF5b3V0Qm91bmRzLnRvcFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJhZGlvIGJ1dHRvbnMgZm9yIHRoZSBzdXJmYWNlIHR5cGUgb2YgdGhlIG9wdGljXHJcbiAgICBjb25zdCBvcHRpY1N1cmZhY2VUeXBlUmFkaW9CdXR0b25Hcm91cCA9IG5ldyBPcHRpY1N1cmZhY2VUeXBlUmFkaW9CdXR0b25Hcm91cCggbW9kZWwub3B0aWMsIHtcclxuICAgICAgaXNCYXNpY3NWZXJzaW9uOiBvcHRpb25zLmlzQmFzaWNzVmVyc2lvbixcclxuICAgICAgY2VudGVyWDogZXJvZGVkTGF5b3V0Qm91bmRzLmNlbnRlclgsXHJcbiAgICAgIHRvcDogZXJvZGVkTGF5b3V0Qm91bmRzLnRvcCxcclxuXHJcbiAgICAgIC8vIERvIG5vdCBpbnN0cnVtZW50IGZvciB0aGUgTWlycm9yIHNjcmVlbiBpbiBHZW9tZXRyaWMgT3B0aWNzOiBCYXNpY3MsIHdoZXJlIHdlIGhhdmUgb25seSBhIGZsYXQgbWlycm9yLlxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MvaXNzdWVzLzQ2M1xyXG4gICAgICB0YW5kZW06IG1vZGVsLm9wdGljLmlzRXhjbHVzaXZlbHlGbGF0TWlycm9yKCkgP1xyXG4gICAgICAgICAgICAgIFRhbmRlbS5PUFRfT1VUIDpcclxuICAgICAgICAgICAgICBjb250cm9sc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdvcHRpY1N1cmZhY2VUeXBlUmFkaW9CdXR0b25Hcm91cCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIERpc2FibGUgdGhlICdWaXJ0dWFsIEltYWdlJyBjaGVja2JveCBmb3IgbGlnaHRzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2dlb21ldHJpYy1vcHRpY3MvaXNzdWVzLzIxNlxyXG4gICAgY29uc3QgdmlydHVhbEltYWdlQ2hlY2tib3hFbmFibGVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIG1vZGVsLm9wdGljYWxPYmplY3RDaG9pY2VQcm9wZXJ0eSBdLFxyXG4gICAgICBvcHRpY2FsT2JqZWN0Q2hvaWNlID0+ICggb3B0aWNhbE9iamVjdENob2ljZS50eXBlICE9PSAnbGlnaHQnICkgKTtcclxuXHJcbiAgICAvLyBDb250cm9sIHBhbmVsIGF0IHRoZSBib3R0b20tY2VudGVyIG9mIHRoZSBzY3JlZW5cclxuICAgIGNvbnN0IGNvbnRyb2xQYW5lbCA9IG5ldyBHT0NvbnRyb2xQYW5lbCggbW9kZWwub3B0aWMsIG1vZGVsLnJheXNUeXBlUHJvcGVydHksIHZpc2libGVQcm9wZXJ0aWVzLFxyXG4gICAgICB2aXJ0dWFsSW1hZ2VDaGVja2JveEVuYWJsZWRQcm9wZXJ0eSwge1xyXG4gICAgICAgIGJvdHRvbTogZXJvZGVkTGF5b3V0Qm91bmRzLmJvdHRvbSxcclxuICAgICAgICBpc0Jhc2ljc1ZlcnNpb246IG9wdGlvbnMuaXNCYXNpY3NWZXJzaW9uLFxyXG4gICAgICAgIHRhbmRlbTogY29udHJvbHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udHJvbFBhbmVsJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBab29tIGJ1dHRvbnNcclxuICAgIGNvbnN0IHpvb21CdXR0b25Hcm91cCA9IG5ldyBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAoIHpvb21MZXZlbFByb3BlcnR5LCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXHJcbiAgICAgIHNwYWNpbmc6IDgsXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNixcclxuICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiA2LFxyXG4gICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDIsXHJcbiAgICAgIG1vdXNlQXJlYVlEaWxhdGlvbjogMixcclxuICAgICAgbWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBzY2FsZTogMC41XHJcbiAgICAgIH0sXHJcbiAgICAgIGJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICB4TWFyZ2luOiA1LFxyXG4gICAgICAgIHlNYXJnaW46IDRcclxuICAgICAgfSxcclxuICAgICAgbGVmdDogZXJvZGVkTGF5b3V0Qm91bmRzLmxlZnQsXHJcbiAgICAgIHRvcDogY29udHJvbFBhbmVsLnRvcCxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICAgIH0sXHJcbiAgICAgIHRhbmRlbTogY29udHJvbHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnem9vbUJ1dHRvbkdyb3VwJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVG9nZ2xlIGJ1dHRvblxyXG4gICAgY29uc3QgbGlnaHRQcm9wYWdhdGlvblRvZ2dsZUJ1dHRvbiA9IG5ldyBMaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uKCBtb2RlbC5saWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogY29udHJvbHNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbGlnaHRQcm9wYWdhdGlvblRvZ2dsZUJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgbGlnaHRQcm9wYWdhdGlvblRvZ2dsZUJ1dHRvbi5jZW50ZXJYID0gem9vbUJ1dHRvbkdyb3VwLmNlbnRlclg7XHJcbiAgICBsaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uLmJvdHRvbSA9IGVyb2RlZExheW91dEJvdW5kcy5ib3R0b207XHJcblxyXG4gICAgLy8gUmVzZXQgQWxsIGJ1dHRvbiBhdCByaWdodC1ib3R0b21cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTsgLy8gY2FuY2VsIGludGVyYWN0aW9ucyB0aGF0IG1heSBiZSBpbiBwcm9ncmVzc1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodEJvdHRvbTogZXJvZGVkTGF5b3V0Qm91bmRzLnJpZ2h0Qm90dG9tLFxyXG4gICAgICB0YW5kZW06IGNvbnRyb2xzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2VudGVyIHRoZSBjb250cm9sIHBhbmVsIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbiwgaW4gdGhlIHNwYWNlIGJldHdlZW4gdGhlIGNvbnRyb2xzIHRoYXQgYXJlIHRvIHRoZSBsZWZ0XHJcbiAgICAvLyBhbmQgcmlnaHQgb2YgdGhlIGNvbnRyb2wgcGFuZWwuIFRoZSBzaXplIG9mIHRoZSBjb250cm9sIHBhbmVsIGNoYW5nZXMgZHluYW1pY2FsbHksIGJhc2VkIG9uIHdoZXRoZXIgdGhlXHJcbiAgICAvLyAnZGlyZWN0JyBvciAnaW5kaXJlY3QnIGZvY2FsLWxlbmd0aCBtb2RlbCBpcyBzZWxlY3RlZC5cclxuICAgIGNvbnRyb2xQYW5lbC5ib3VuZHNQcm9wZXJ0eS5saW5rKCAoKSA9PiB7XHJcbiAgICAgIGNvbnRyb2xQYW5lbC5jZW50ZXJYID0gem9vbUJ1dHRvbkdyb3VwLnJpZ2h0ICsgKCByZXNldEFsbEJ1dHRvbi5sZWZ0IC0gem9vbUJ1dHRvbkdyb3VwLnJpZ2h0ICkgLyAyO1xyXG4gICAgICBjb250cm9sUGFuZWwuYm90dG9tID0gZXJvZGVkTGF5b3V0Qm91bmRzLmJvdHRvbTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sc0xheWVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBvYmplY3RIQm94LFxyXG4gICAgICAgIG9wdGljU3VyZmFjZVR5cGVSYWRpb0J1dHRvbkdyb3VwLFxyXG4gICAgICAgIHRvb2xib3hOb2RlLFxyXG4gICAgICAgIHpvb21CdXR0b25Hcm91cCxcclxuICAgICAgICBsaWdodFByb3BhZ2F0aW9uVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIGNvbnRyb2xQYW5lbCxcclxuICAgICAgICByZXNldEFsbEJ1dHRvblxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2NlbmVzID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgICBjb25zdCBzY2VuZXNUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzY2VuZXMnICk7XHJcblxyXG4gICAgY29uc3Qgc2NlbmVOb2RlczogR09TY2VuZU5vZGVbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0IGFycm93U2NlbmVOb2RlVGFuZGVtID0gc2NlbmVzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Fycm93U2NlbmVOb2RlJyApO1xyXG4gICAgY29uc3QgYXJyb3dTY2VuZU5vZGUgPSBuZXcgQXJyb3dTY2VuZU5vZGUoIG1vZGVsLmFycm93U2NlbmUsIHZpc2libGVQcm9wZXJ0aWVzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIG1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5LCBzY2VuZUJvdW5kc1Byb3BlcnR5LCBtb2RlbC5yYXlzVHlwZVByb3BlcnR5LCBtb2RlbC5saWdodFByb3BhZ2F0aW9uRW5hYmxlZFByb3BlcnR5LCB7XHJcbiAgICAgICAgY3JlYXRlT3B0aWNOb2RlOiBvcHRpb25zLmNyZWF0ZU9wdGljTm9kZSxcclxuICAgICAgICBvYmplY3REcmFnTW9kZVByb3BlcnR5OiBvYmplY3REcmFnTW9kZVByb3BlcnR5LFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC5vcHRpY2FsT2JqZWN0Q2hvaWNlUHJvcGVydHkgXSxcclxuICAgICAgICAgIG9wdGljYWxPYmplY3RDaG9pY2UgPT4gKCBvcHRpY2FsT2JqZWN0Q2hvaWNlLnR5cGUgPT09ICdhcnJvdycgKSwge1xyXG4gICAgICAgICAgICB0YW5kZW06IGFycm93U2NlbmVOb2RlVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Zpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb29sZWFuSU9cclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICB0YW5kZW06IGFycm93U2NlbmVOb2RlVGFuZGVtXHJcbiAgICAgIH0gKTtcclxuICAgIHNjZW5lTm9kZXMucHVzaCggYXJyb3dTY2VuZU5vZGUgKTtcclxuXHJcbiAgICBjb25zdCBmcmFtZVNjZW5lTm9kZVRhbmRlbSA9IHNjZW5lc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdmcmFtZWRTY2VuZU5vZGUnICk7XHJcbiAgICBjb25zdCBmcmFtZWRTY2VuZU5vZGUgPSBuZXcgRnJhbWVkU2NlbmVOb2RlKCBtb2RlbC5mcmFtZWRTY2VuZSwgdmlzaWJsZVByb3BlcnRpZXMsIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHksIHNjZW5lQm91bmRzUHJvcGVydHksIG1vZGVsLnJheXNUeXBlUHJvcGVydHksIG1vZGVsLmxpZ2h0UHJvcGFnYXRpb25FbmFibGVkUHJvcGVydHksIHtcclxuICAgICAgICBjcmVhdGVPcHRpY05vZGU6IG9wdGlvbnMuY3JlYXRlT3B0aWNOb2RlLFxyXG4gICAgICAgIG9iamVjdERyYWdNb2RlUHJvcGVydHk6IG9iamVjdERyYWdNb2RlUHJvcGVydHksXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIG1vZGVsLm9wdGljYWxPYmplY3RDaG9pY2VQcm9wZXJ0eSBdLFxyXG4gICAgICAgICAgb3B0aWNhbE9iamVjdENob2ljZSA9PiAoIG9wdGljYWxPYmplY3RDaG9pY2UudHlwZSA9PT0gJ2ZyYW1lZCcgKSwge1xyXG4gICAgICAgICAgICB0YW5kZW06IGZyYW1lU2NlbmVOb2RlVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Zpc2libGVQcm9wZXJ0eScgKSxcclxuICAgICAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb29sZWFuSU9cclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICB0YW5kZW06IGZyYW1lU2NlbmVOb2RlVGFuZGVtXHJcbiAgICAgIH0gKTtcclxuICAgIHNjZW5lTm9kZXMucHVzaCggZnJhbWVkU2NlbmVOb2RlICk7XHJcblxyXG4gICAgLy8gTm90ZSB0aGF0IHdoaWxlIHRoZSBMaWdodCBzY2VuZSBpcyBzcGVjaWZpYyB0byB0aGUgTWlycm9yIHNjcmVlbiwgaXQgd2FzIG1vcmUgc3RyYWlnaHRmb3J3YXJkIHRvIGhhbmRsZSBpdFxyXG4gICAgLy8gYXMgYW4gb3B0aW9uYWwgcGFydCBvZiB0aGlzIGJhc2UgY2xhc3MuXHJcbiAgICBsZXQgbGlnaHRTY2VuZU5vZGU6IExpZ2h0U2NlbmVOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBpZiAoIG1vZGVsLmxpZ2h0U2NlbmUgKSB7XHJcblxyXG4gICAgICBjb25zdCBsaWdodFNjZW5lTm9kZVRhbmRlbSA9IHNjZW5lc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdsaWdodFNjZW5lTm9kZScgKTtcclxuICAgICAgbGlnaHRTY2VuZU5vZGUgPSBuZXcgTGlnaHRTY2VuZU5vZGUoIG1vZGVsLmxpZ2h0U2NlbmUsIHZpc2libGVQcm9wZXJ0aWVzLFxyXG4gICAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSwgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHksIHNjZW5lQm91bmRzUHJvcGVydHksIG1vZGVsLnJheXNUeXBlUHJvcGVydHksXHJcbiAgICAgICAgbW9kZWwubGlnaHRQcm9wYWdhdGlvbkVuYWJsZWRQcm9wZXJ0eSwge1xyXG4gICAgICAgICAgY3JlYXRlT3B0aWNOb2RlOiBvcHRpb25zLmNyZWF0ZU9wdGljTm9kZSxcclxuICAgICAgICAgIG9iamVjdERyYWdNb2RlUHJvcGVydHk6IG9iamVjdERyYWdNb2RlUHJvcGVydHksXHJcbiAgICAgICAgICB2aXNpYmxlUHJvcGVydHk6IG5ldyBEZXJpdmVkUHJvcGVydHkoIFsgbW9kZWwub3B0aWNhbE9iamVjdENob2ljZVByb3BlcnR5IF0sXHJcbiAgICAgICAgICAgIG9wdGljYWxPYmplY3RDaG9pY2UgPT4gKCBvcHRpY2FsT2JqZWN0Q2hvaWNlLnR5cGUgPT09ICdsaWdodCcgKSwge1xyXG4gICAgICAgICAgICAgIHRhbmRlbTogbGlnaHRTY2VuZU5vZGVUYW5kZW0uY3JlYXRlVGFuZGVtKCAndmlzaWJsZVByb3BlcnR5JyApLFxyXG4gICAgICAgICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPXHJcbiAgICAgICAgICAgIH0gKSxcclxuICAgICAgICAgIHRhbmRlbTogbGlnaHRTY2VuZU5vZGVUYW5kZW1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIHNjZW5lTm9kZXMucHVzaCggbGlnaHRTY2VuZU5vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXaGVuIGEgc2NlbmVOb2RlIGJlY29tZXMgdmlzaWJsZSwgdXNlIHRoZSBzY2VuZSdzIGp1bXAgcG9pbnRzIGZvciB0b29scy5cclxuICAgIHNjZW5lTm9kZXMuZm9yRWFjaCggc2NlbmVOb2RlID0+IHtcclxuICAgICAgc2NlbmVOb2RlLnZpc2libGVQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcclxuICAgICAgICBpZiAoIHZpc2libGUgKSB7XHJcbiAgICAgICAgICB0b29sTm9kZXMuZm9yRWFjaCggdG9vbE5vZGUgPT4gdG9vbE5vZGUuc2V0SnVtcFBvaW50cyggc2NlbmVOb2RlLnRvb2xKdW1wUG9pbnRzICkgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzY2VuZXNMYXllciA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBzY2VuZU5vZGVzXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2hvdyBzY2VuZUJvdW5kcyBhcyBhIHJlZCByZWN0YW5nbGUuXHJcbiAgICBpZiAoIEdPUXVlcnlQYXJhbWV0ZXJzLmRlYnVnU2NlbmVCb3VuZHMgKSB7XHJcbiAgICAgIGNvbnN0IGRyYWdCb3VuZHNOb2RlID0gbmV3IFJlY3RhbmdsZSggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3Qm91bmRzKCBzY2VuZUJvdW5kc1Byb3BlcnR5LnZhbHVlICksIHtcclxuICAgICAgICBzdHJva2U6ICdyZWQnXHJcbiAgICAgIH0gKTtcclxuICAgICAgc2NlbmVzTGF5ZXIuYWRkQ2hpbGQoIGRyYWdCb3VuZHNOb2RlICk7XHJcbiAgICAgIHNjZW5lQm91bmRzUHJvcGVydHkubGluayggc2NlbmVCb3VuZHMgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZpZXdCb3VuZHMgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdCb3VuZHMoIHNjZW5lQm91bmRzICk7XHJcbiAgICAgICAgZHJhZ0JvdW5kc05vZGUuc2V0UmVjdCggdmlld0JvdW5kcy54LCB2aWV3Qm91bmRzLnksIHZpZXdCb3VuZHMud2lkdGgsIHZpZXdCb3VuZHMuaGVpZ2h0ICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTY2FsZSB0aGUgc2NlbmVcclxuICAgIHpvb21TY2FsZVByb3BlcnR5LmxpbmsoIHpvb21TY2FsZSA9PiB7XHJcbiAgICAgIHNjZW5lc0xheWVyLnNldFNjYWxlTWFnbml0dWRlKCB6b29tU2NhbGUgKTtcclxuICAgICAgc2NlbmVzTGF5ZXIudHJhbnNsYXRpb24gPSB2aWV3T3JpZ2luO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIExhYmVscyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY29uc3QgbGFiZWxzTGF5ZXIgPSBuZXcgTm9kZSgge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHZpc2libGVQcm9wZXJ0aWVzLmxhYmVsc1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIExhYmVscyBmb3IgdGhpbmdzIGluIHRoZSAnQXJyb3cnIHNjZW5lXHJcbiAgICBjb25zdCBhcnJvd0xhYmVsc05vZGUgPSBuZXcgQXJyb3dMYWJlbHNOb2RlKCBhcnJvd1NjZW5lTm9kZSxcclxuICAgICAgem9vbVRyYW5zZm9ybVByb3BlcnR5LCBtb2RlbFZpc2libGVCb3VuZHNQcm9wZXJ0eSwge1xyXG4gICAgICAgIGlzQmFzaWNzVmVyc2lvbjogb3B0aW9ucy5pc0Jhc2ljc1ZlcnNpb24sXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBhcnJvd1NjZW5lTm9kZS52aXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtOiBhcnJvd1NjZW5lTm9kZS50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGFiZWxzJyApLCAvLyBjaGlsZCBvZiBzY2VuZVxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IGBMYWJlbHMgZm9yIHRoaW5ncyBpbiAke2Fycm93U2NlbmVOb2RlLnRhbmRlbS5uYW1lfWBcclxuICAgICAgfSApO1xyXG4gICAgbGFiZWxzTGF5ZXIuYWRkQ2hpbGQoIGFycm93TGFiZWxzTm9kZSApO1xyXG5cclxuICAgIC8vIExhYmVscyBmb3IgdGhpbmdzIGluIHRoZSAnRnJhbWVkIE9iamVjdCcgc2NlbmVcclxuICAgIGNvbnN0IGZyYW1lZExhYmVsc05vZGUgPSBuZXcgRnJhbWVkTGFiZWxzTm9kZSggZnJhbWVkU2NlbmVOb2RlLFxyXG4gICAgICB6b29tVHJhbnNmb3JtUHJvcGVydHksIG1vZGVsVmlzaWJsZUJvdW5kc1Byb3BlcnR5LCB7XHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBmcmFtZWRTY2VuZU5vZGUudmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbTogZnJhbWVkU2NlbmVOb2RlLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbHMnICksIC8vIGNoaWxkIG9mIHNjZW5lXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogYExhYmVscyBmb3IgdGhpbmdzIGluICR7ZnJhbWVkU2NlbmVOb2RlLnRhbmRlbS5uYW1lfWBcclxuICAgICAgfSApO1xyXG4gICAgbGFiZWxzTGF5ZXIuYWRkQ2hpbGQoIGZyYW1lZExhYmVsc05vZGUgKTtcclxuXHJcbiAgICAvLyBMYWJlbHMgZm9yIHRoaW5ncyBpbiB0aGUgJ0xpZ2h0JyBzY2VuZS4gTm90ZSB0aGF0IHdoaWxlIHRoZSBMaWdodCBzY2VuZSBpcyBzcGVjaWZpYyB0byB0aGUgTWlycm9yIHNjcmVlbixcclxuICAgIC8vIGl0IHdhcyBtb3JlIHN0cmFpZ2h0Zm9yd2FyZCB0byBoYW5kbGUgaXQgYXMgYW4gb3B0aW9uYWwgcGFydCBvZiB0aGlzIGJhc2UgY2xhc3MuXHJcbiAgICBsZXQgbGlnaHRMYWJlbHNOb2RlOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBpZiAoIG1vZGVsLmxpZ2h0U2NlbmUgJiYgbGlnaHRTY2VuZU5vZGUgKSB7XHJcbiAgICAgIGxpZ2h0TGFiZWxzTm9kZSA9IG5ldyBMaWdodExhYmVsc05vZGUoIGxpZ2h0U2NlbmVOb2RlLFxyXG4gICAgICAgIHpvb21UcmFuc2Zvcm1Qcm9wZXJ0eSwgbW9kZWxWaXNpYmxlQm91bmRzUHJvcGVydHksIHtcclxuICAgICAgICAgIGlzQmFzaWNzVmVyc2lvbjogb3B0aW9ucy5pc0Jhc2ljc1ZlcnNpb24sXHJcbiAgICAgICAgICB2aXNpYmxlUHJvcGVydHk6IGxpZ2h0U2NlbmVOb2RlLnZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbTogbGlnaHRTY2VuZU5vZGUudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVscycgKSwgLy8gY2hpbGQgb2Ygc2NlbmVcclxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246IGBMYWJlbHMgZm9yIHRoaW5ncyBpbiAke2xpZ2h0U2NlbmVOb2RlLnRhbmRlbS5uYW1lfWBcclxuICAgICAgICB9ICk7XHJcbiAgICAgIGxhYmVsc0xheWVyLmFkZENoaWxkKCBsaWdodExhYmVsc05vZGUgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBMYXlvdXQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIGNvbnN0IHNjcmVlblZpZXdSb290Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgc2NlbmVzTGF5ZXIsXHJcbiAgICAgICAgbGFiZWxzTGF5ZXIsXHJcbiAgICAgICAgY29udHJvbHNMYXllcixcclxuICAgICAgICB0b29sc0xheWVyLFxyXG4gICAgICAgIHBvcHVwc1BhcmVudFxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzY3JlZW5WaWV3Um9vdE5vZGUgKTtcclxuXHJcbiAgICAvLyBMaXN0ZW5lcnMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIC8vIElmIGxpZ2h0IHByb3BhZ2F0aW9uIGlzIGVuYWJsZWQsIGNoYW5naW5nIHRoZXNlIFByb3BlcnRpZXMgY2F1c2VzIHRoZSBsaWdodCByYXlzIHRvIGFuaW1hdGUuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1vZGVsLmxpZ2h0UHJvcGFnYXRpb25FbmFibGVkUHJvcGVydHksIG1vZGVsLnJheXNUeXBlUHJvcGVydHkgXSxcclxuICAgICAgKCBsaWdodFByb3BhZ2F0aW9uRW5hYmxlZCwgcmF5c1R5cGUgKSA9PiB7XHJcbiAgICAgICAgaWYgKCBsaWdodFByb3BhZ2F0aW9uRW5hYmxlZCApIHtcclxuICAgICAgICAgIG1vZGVsLmJlZ2luTGlnaHRSYXlzQW5pbWF0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gQ2hhbmdpbmcgdGhlc2UgdGhpbmdzIGludGVycnVwdHMgaW50ZXJhY3Rpb25zXHJcbiAgICBjb25zdCBpbnRlcnJ1cHQgPSAoKSA9PiB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgem9vbUxldmVsUHJvcGVydHkubGF6eUxpbmsoIGludGVycnVwdCApO1xyXG4gICAgbW9kZWwub3B0aWNhbE9iamVjdENob2ljZVByb3BlcnR5LmxhenlMaW5rKCBpbnRlcnJ1cHQgKTtcclxuXHJcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICAgIHRoaXMucmVzZXRHT1NjcmVlblZpZXcgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0aWVzLnJlc2V0KCk7XHJcbiAgICAgIHpvb21MZXZlbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICAgIG9iamVjdERyYWdNb2RlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgYXJyb3dTY2VuZU5vZGUucmVzZXQoKTtcclxuICAgICAgZnJhbWVkU2NlbmVOb2RlLnJlc2V0KCk7XHJcbiAgICAgIGxpZ2h0U2NlbmVOb2RlICYmIGxpZ2h0U2NlbmVOb2RlLnJlc2V0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHBkb20gLSB0cmF2ZXJzYWwgb3JkZXJcclxuICAgIHNjcmVlblZpZXdSb290Tm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHNjZW5lc0xheWVyLFxyXG4gICAgICBob3Jpem9udGFsUnVsZXJOb2RlLFxyXG4gICAgICB2ZXJ0aWNhbFJ1bGVyTm9kZSxcclxuICAgICAgcG9zaXRpb25NYXJrZXIxTm9kZSxcclxuICAgICAgcG9zaXRpb25NYXJrZXIyTm9kZSxcclxuICAgICAgb3B0aWNhbE9iamVjdENob2ljZUNvbWJvQm94LFxyXG4gICAgICBvYmplY3REcmFnTW9kZVRvZ2dsZUJ1dHRvbixcclxuICAgICAgb3B0aWNTdXJmYWNlVHlwZVJhZGlvQnV0dG9uR3JvdXAsXHJcbiAgICAgIHRvb2xib3hOb2RlLFxyXG4gICAgICB6b29tQnV0dG9uR3JvdXAsXHJcbiAgICAgIGxpZ2h0UHJvcGFnYXRpb25Ub2dnbGVCdXR0b24sXHJcbiAgICAgIGNvbnRyb2xQYW5lbCxcclxuICAgICAgcmVzZXRBbGxCdXR0b25cclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5vYmplY3REcmFnTW9kZVByb3BlcnR5ID0gb2JqZWN0RHJhZ01vZGVQcm9wZXJ0eTtcclxuICAgIHRoaXMub2JqZWN0RHJhZ01vZGVUb2dnbGVCdXR0b24gPSBvYmplY3REcmFnTW9kZVRvZ2dsZUJ1dHRvbjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnJlc2V0R09TY3JlZW5WaWV3KCk7XHJcbiAgfVxyXG59XHJcblxyXG5nZW9tZXRyaWNPcHRpY3MucmVnaXN0ZXIoICdHT1NjcmVlblZpZXcnLCBHT1NjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUE2QixvQ0FBb0M7QUFDbEYsT0FBT0MsbUJBQW1CLE1BQU0sdURBQXVEO0FBQ3ZGLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsOEJBQThCLE1BQU0sK0RBQStEO0FBQzFHLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxTQUFTLFFBQVEsbUNBQW1DO0FBQ3pFLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLG1CQUFtQjtBQUMzQyxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFFdkQsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxnQ0FBZ0MsTUFBTSx1Q0FBdUM7QUFDcEYsT0FBT0MsMkJBQTJCLE1BQU0sa0NBQWtDO0FBQzFFLE9BQU9DLDRCQUE0QixNQUFNLG1DQUFtQztBQUM1RSxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFDdEQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxXQUFXLE1BQU0sd0JBQXdCO0FBQ2hELE9BQU9DLGFBQWEs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