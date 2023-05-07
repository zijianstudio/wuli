// Copyright 2023, University of Colorado Boulder

/**
 * Screen view for the My Solar System Screen
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import Multilink from '../../../axon/js/Multilink.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import { HBox, Node, VBox } from '../../../scenery/js/imports.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import SolarSystemCommonTimeControlNode from './SolarSystemCommonTimeControlNode.js';
import TextPushButton from '../../../sun/js/buttons/TextPushButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import SolarSystemCommonStrings from '../../../solar-system-common/js/SolarSystemCommonStrings.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import MeasuringTapeNode from '../../../scenery-phet/js/MeasuringTapeNode.js';
import Property from '../../../axon/js/Property.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import DraggableVectorNode from './DraggableVectorNode.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import NumberDisplay from '../../../scenery-phet/js/NumberDisplay.js';
import Panel from '../../../sun/js/Panel.js';
import Range from '../../../dot/js/Range.js';
import solarSystemCommon from '../solarSystemCommon.js';
import BodySoundManager from './BodySoundManager.js';
import GridNode from '../../../scenery-phet/js/GridNode.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Grab_Sound_mp3 from '../../sounds/Grab_Sound_mp3.js';
import Release_Sound_mp3 from '../../sounds/Release_Sound_mp3.js';
export default class SolarSystemCommonScreenView extends ScreenView {
  bodiesLayer = new Node();
  componentsLayer = new Node();
  interfaceLayer = new Node();
  topLayer = new Node();
  bottomLayer = new Node();

  // Derived from visibleBoundsProperty to keep the UI elements centered on narrow screens
  // Tracks only the vertical bounds and constrains them to layoutBounds
  constructor(model, providedOptions) {
    const options = optionize()({
      playingAllowedProperty: new Property(true),
      centerOrbitOffset: Vector2.ZERO
    }, providedOptions);
    super(options);
    this.model = model;
    this.availableBoundsProperty = new DerivedProperty([this.visibleBoundsProperty], visibleBounds => {
      return visibleBounds.withMinY(this.layoutBounds.minY).withMaxY(this.layoutBounds.maxY);
    });
    this.addChild(this.bottomLayer);
    this.addChild(this.bodiesLayer);
    this.addChild(this.componentsLayer);
    this.addChild(this.interfaceLayer);
    this.addChild(this.topLayer);
    this.pdomPlayAreaNode.pdomOrder = [this.bodiesLayer, this.componentsLayer, this.topLayer];
    this.pdomControlAreaNode.pdomOrder = [this.bottomLayer, this.interfaceLayer];
    this.bodySoundManager = new BodySoundManager(model);
    model.availableBodies.forEach(body => {
      body.collidedEmitter.addListener(() => {
        this.bodySoundManager.playBodyRemovedSound(3); // Plays the collision sound instead of body index
      });
    });

    this.modelViewTransformProperty = new DerivedProperty([model.zoomProperty], zoom => {
      return ModelViewTransform2.createSinglePointScaleInvertedYMapping(Vector2.ZERO, new Vector2(this.layoutBounds.center.x - options.centerOrbitOffset.x, this.layoutBounds.center.y - options.centerOrbitOffset.y), zoom);
    });

    // Add the node for the overlay grid, setting its visibility based on the model.showGridProperty
    this.interfaceLayer.addChild(new GridNode(this.modelViewTransformProperty, SolarSystemCommonConstants.GRID_SPACING, Vector2.ZERO, 100, {
      stroke: SolarSystemCommonColors.gridIconStrokeColorProperty,
      visibleProperty: model.gridVisibleProperty
    }));
    this.createDraggableVectorNode = (body, options) => {
      return new DraggableVectorNode(body, this.modelViewTransformProperty, model.velocityVisibleProperty, body.velocityProperty, body.positionProperty, 1, SolarSystemCommonStrings.VStringProperty, combineOptions({
        fill: PhetColorScheme.VELOCITY,
        soundViewNode: this,
        mapPosition: this.constrainBoundaryViewPoint.bind(this)
      }, options));
    };

    // UI Elements ===================================================================================================

    const measuringTapeUnitsProperty = new Property({
      name: 'AU',
      multiplier: 0.01
    });
    const dragClipOptions = {
      initialOutputLevel: 2 * SolarSystemCommonConstants.DEFAULT_SOUND_OUTPUT_LEVEL
    };
    const grabClip = new SoundClip(Grab_Sound_mp3, dragClipOptions);
    const releaseClip = new SoundClip(Release_Sound_mp3, dragClipOptions);
    soundManager.addSoundGenerator(grabClip);
    soundManager.addSoundGenerator(releaseClip);

    // Add the MeasuringTapeNode
    const measuringTapeNode = new MeasuringTapeNode(measuringTapeUnitsProperty, {
      visibleProperty: model.measuringTapeVisibleProperty,
      textColor: 'black',
      textBackgroundColor: 'rgba( 255, 255, 255, 0.5 )',
      // translucent red
      textBackgroundXMargin: 10,
      textBackgroundYMargin: 3,
      textBackgroundCornerRadius: 5,
      basePositionProperty: new Vector2Property(new Vector2(0, 100)),
      tipPositionProperty: new Vector2Property(new Vector2(100, 100)),
      tandem: providedOptions.tandem.createTandem('measuringTapeNode'),
      significantFigures: 2,
      baseDragStarted: () => grabClip.play(),
      baseDragEnded: () => releaseClip.play()
    });
    this.topLayer.addChild(measuringTapeNode);
    const timeControlNode = new SolarSystemCommonTimeControlNode(model, {
      enabledProperty: options.playingAllowedProperty || null,
      restartListener: () => model.restart(),
      stepForwardListener: () => model.stepOnce(1 / 8),
      tandem: options.tandem.createTandem('timeControlNode')
    });
    const timeStringPatternProperty = new PatternStringProperty(SolarSystemCommonStrings.pattern.labelUnitsStringProperty, {
      units: SolarSystemCommonStrings.units.yearsStringProperty
    });
    const clockNode = new HBox({
      children: [new NumberDisplay(model.timeProperty, new Range(0, 1000), {
        backgroundFill: null,
        backgroundStroke: null,
        textOptions: combineOptions({
          maxWidth: 80
        }, SolarSystemCommonConstants.TEXT_OPTIONS),
        xMargin: 0,
        yMargin: 0,
        valuePattern: timeStringPatternProperty,
        decimalPlaces: 1
      }), new TextPushButton(SolarSystemCommonStrings.clearStringProperty, {
        font: new PhetFont(16),
        enabledProperty: new DerivedProperty([model.timeProperty], time => time > 0),
        listener: () => model.timeProperty.reset(),
        maxTextWidth: 65,
        tandem: providedOptions.tandem.createTandem('clearButton'),
        touchAreaXDilation: 10,
        touchAreaYDilation: 5
      })],
      spacing: 8
    });
    this.timeBox = new Panel(new VBox({
      children: [timeControlNode, clockNode],
      spacing: 10
    }), SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS);
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        measuringTapeNode.reset();
      },
      touchAreaDilation: 10,
      tandem: providedOptions.tandem.createTandem('resetAllButton')
    });
    Multilink.multilink([this.visibleBoundsProperty, this.modelViewTransformProperty], (visibleBounds, modelViewTransform) => {
      measuringTapeNode.setDragBounds(modelViewTransform.viewToModelBounds(visibleBounds.eroded(50)));
      measuringTapeNode.modelViewTransformProperty.value = modelViewTransform;
    });
  }
  constrainBoundaryViewPoint(point, radius) {
    return point;
  }
}
solarSystemCommon.register('SolarSystemCommonScreenView', SolarSystemCommonScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiTXVsdGlsaW5rIiwiU2NyZWVuVmlldyIsIk1vZGVsVmlld1RyYW5zZm9ybTIiLCJSZXNldEFsbEJ1dHRvbiIsIkhCb3giLCJOb2RlIiwiVkJveCIsIlNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIiwiU29sYXJTeXN0ZW1Db21tb25UaW1lQ29udHJvbE5vZGUiLCJUZXh0UHVzaEJ1dHRvbiIsIlBoZXRGb250IiwiRGVyaXZlZFByb3BlcnR5IiwiU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJNZWFzdXJpbmdUYXBlTm9kZSIsIlByb3BlcnR5IiwiVmVjdG9yMlByb3BlcnR5IiwiRHJhZ2dhYmxlVmVjdG9yTm9kZSIsIlBoZXRDb2xvclNjaGVtZSIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIk51bWJlckRpc3BsYXkiLCJQYW5lbCIsIlJhbmdlIiwic29sYXJTeXN0ZW1Db21tb24iLCJCb2R5U291bmRNYW5hZ2VyIiwiR3JpZE5vZGUiLCJTb2xhclN5c3RlbUNvbW1vbkNvbG9ycyIsIlNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsIkdyYWJfU291bmRfbXAzIiwiUmVsZWFzZV9Tb3VuZF9tcDMiLCJTb2xhclN5c3RlbUNvbW1vblNjcmVlblZpZXciLCJib2RpZXNMYXllciIsImNvbXBvbmVudHNMYXllciIsImludGVyZmFjZUxheWVyIiwidG9wTGF5ZXIiLCJib3R0b21MYXllciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGxheWluZ0FsbG93ZWRQcm9wZXJ0eSIsImNlbnRlck9yYml0T2Zmc2V0IiwiWkVSTyIsImF2YWlsYWJsZUJvdW5kc1Byb3BlcnR5IiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwidmlzaWJsZUJvdW5kcyIsIndpdGhNaW5ZIiwibGF5b3V0Qm91bmRzIiwibWluWSIsIndpdGhNYXhZIiwibWF4WSIsImFkZENoaWxkIiwicGRvbVBsYXlBcmVhTm9kZSIsInBkb21PcmRlciIsInBkb21Db250cm9sQXJlYU5vZGUiLCJib2R5U291bmRNYW5hZ2VyIiwiYXZhaWxhYmxlQm9kaWVzIiwiZm9yRWFjaCIsImJvZHkiLCJjb2xsaWRlZEVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsInBsYXlCb2R5UmVtb3ZlZFNvdW5kIiwibW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkiLCJ6b29tUHJvcGVydHkiLCJ6b29tIiwiY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmciLCJjZW50ZXIiLCJ4IiwieSIsIkdSSURfU1BBQ0lORyIsInN0cm9rZSIsImdyaWRJY29uU3Ryb2tlQ29sb3JQcm9wZXJ0eSIsInZpc2libGVQcm9wZXJ0eSIsImdyaWRWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVEcmFnZ2FibGVWZWN0b3JOb2RlIiwidmVsb2NpdHlWaXNpYmxlUHJvcGVydHkiLCJ2ZWxvY2l0eVByb3BlcnR5IiwicG9zaXRpb25Qcm9wZXJ0eSIsIlZTdHJpbmdQcm9wZXJ0eSIsImZpbGwiLCJWRUxPQ0lUWSIsInNvdW5kVmlld05vZGUiLCJtYXBQb3NpdGlvbiIsImNvbnN0cmFpbkJvdW5kYXJ5Vmlld1BvaW50IiwiYmluZCIsIm1lYXN1cmluZ1RhcGVVbml0c1Byb3BlcnR5IiwibmFtZSIsIm11bHRpcGxpZXIiLCJkcmFnQ2xpcE9wdGlvbnMiLCJpbml0aWFsT3V0cHV0TGV2ZWwiLCJERUZBVUxUX1NPVU5EX09VVFBVVF9MRVZFTCIsImdyYWJDbGlwIiwicmVsZWFzZUNsaXAiLCJhZGRTb3VuZEdlbmVyYXRvciIsIm1lYXN1cmluZ1RhcGVOb2RlIiwibWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSIsInRleHRDb2xvciIsInRleHRCYWNrZ3JvdW5kQ29sb3IiLCJ0ZXh0QmFja2dyb3VuZFhNYXJnaW4iLCJ0ZXh0QmFja2dyb3VuZFlNYXJnaW4iLCJ0ZXh0QmFja2dyb3VuZENvcm5lclJhZGl1cyIsImJhc2VQb3NpdGlvblByb3BlcnR5IiwidGlwUG9zaXRpb25Qcm9wZXJ0eSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInNpZ25pZmljYW50RmlndXJlcyIsImJhc2VEcmFnU3RhcnRlZCIsInBsYXkiLCJiYXNlRHJhZ0VuZGVkIiwidGltZUNvbnRyb2xOb2RlIiwiZW5hYmxlZFByb3BlcnR5IiwicmVzdGFydExpc3RlbmVyIiwicmVzdGFydCIsInN0ZXBGb3J3YXJkTGlzdGVuZXIiLCJzdGVwT25jZSIsInRpbWVTdHJpbmdQYXR0ZXJuUHJvcGVydHkiLCJwYXR0ZXJuIiwibGFiZWxVbml0c1N0cmluZ1Byb3BlcnR5IiwidW5pdHMiLCJ5ZWFyc1N0cmluZ1Byb3BlcnR5IiwiY2xvY2tOb2RlIiwiY2hpbGRyZW4iLCJ0aW1lUHJvcGVydHkiLCJiYWNrZ3JvdW5kRmlsbCIsImJhY2tncm91bmRTdHJva2UiLCJ0ZXh0T3B0aW9ucyIsIm1heFdpZHRoIiwiVEVYVF9PUFRJT05TIiwieE1hcmdpbiIsInlNYXJnaW4iLCJ2YWx1ZVBhdHRlcm4iLCJkZWNpbWFsUGxhY2VzIiwiY2xlYXJTdHJpbmdQcm9wZXJ0eSIsImZvbnQiLCJ0aW1lIiwibGlzdGVuZXIiLCJyZXNldCIsIm1heFRleHRXaWR0aCIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInNwYWNpbmciLCJ0aW1lQm94IiwiQ09OVFJPTF9QQU5FTF9PUFRJT05TIiwicmVzZXRBbGxCdXR0b24iLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsIm11bHRpbGluayIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInNldERyYWdCb3VuZHMiLCJ2aWV3VG9Nb2RlbEJvdW5kcyIsImVyb2RlZCIsInZhbHVlIiwicG9pbnQiLCJyYWRpdXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNvbGFyU3lzdGVtQ29tbW9uU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NyZWVuIHZpZXcgZm9yIHRoZSBNeSBTb2xhciBTeXN0ZW0gU2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgQWd1c3TDrW4gVmFsbGVqbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldywgeyBTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTW9kZWxWaWV3VHJhbnNmb3JtMiBmcm9tICcuLi8uLi8uLi9waGV0Y29tbW9uL2pzL3ZpZXcvTW9kZWxWaWV3VHJhbnNmb3JtMi5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIE5vZGUsIFRleHRPcHRpb25zLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uL1NvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uVGltZUNvbnRyb2xOb2RlIGZyb20gJy4vU29sYXJTeXN0ZW1Db21tb25UaW1lQ29udHJvbE5vZGUuanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uTW9kZWwgZnJvbSAnLi4vbW9kZWwvU29sYXJTeXN0ZW1Db21tb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzIGZyb20gJy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgTWVhc3VyaW5nVGFwZU5vZGUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01lYXN1cmluZ1RhcGVOb2RlLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm9keSBmcm9tICcuLi9tb2RlbC9Cb2R5LmpzJztcclxuaW1wb3J0IERyYWdnYWJsZVZlY3Rvck5vZGUsIHsgRHJhZ2dhYmxlVmVjdG9yTm9kZU9wdGlvbnMgfSBmcm9tICcuL0RyYWdnYWJsZVZlY3Rvck5vZGUuanMnO1xyXG5pbXBvcnQgUGhldENvbG9yU2NoZW1lIGZyb20gJy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bWJlckRpc3BsYXkgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckRpc3BsYXkuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgc29sYXJTeXN0ZW1Db21tb24gZnJvbSAnLi4vc29sYXJTeXN0ZW1Db21tb24uanMnO1xyXG5pbXBvcnQgQm9keVNvdW5kTWFuYWdlciBmcm9tICcuL0JvZHlTb3VuZE1hbmFnZXIuanMnO1xyXG5pbXBvcnQgR3JpZE5vZGUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0dyaWROb2RlLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ29sb3JzIGZyb20gJy4uL1NvbGFyU3lzdGVtQ29tbW9uQ29sb3JzLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IEdyYWJfU291bmRfbXAzIGZyb20gJy4uLy4uL3NvdW5kcy9HcmFiX1NvdW5kX21wMy5qcyc7XHJcbmltcG9ydCBSZWxlYXNlX1NvdW5kX21wMyBmcm9tICcuLi8uLi9zb3VuZHMvUmVsZWFzZV9Tb3VuZF9tcDMuanMnO1xyXG5cclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcGxheWluZ0FsbG93ZWRQcm9wZXJ0eT86IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIGNlbnRlck9yYml0T2Zmc2V0PzogVmVjdG9yMjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFNvbGFyU3lzdGVtQ29tbW9uU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNjcmVlblZpZXdPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29sYXJTeXN0ZW1Db21tb25TY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJvZGllc0xheWVyID0gbmV3IE5vZGUoKTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgY29tcG9uZW50c0xheWVyID0gbmV3IE5vZGUoKTtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgaW50ZXJmYWNlTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gIHByb3RlY3RlZCByZWFkb25seSB0b3BMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGJvdHRvbUxheWVyID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHRpbWVCb3g6IFBhbmVsO1xyXG5cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYm9keVNvdW5kTWFuYWdlcjogQm9keVNvdW5kTWFuYWdlcjtcclxuXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IGNyZWF0ZURyYWdnYWJsZVZlY3Rvck5vZGU6ICggYm9keTogQm9keSwgb3B0aW9ucz86IERyYWdnYWJsZVZlY3Rvck5vZGVPcHRpb25zICkgPT4gRHJhZ2dhYmxlVmVjdG9yTm9kZTtcclxuXHJcbiAgcHJvdGVjdGVkIHJlYWRvbmx5IG1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PE1vZGVsVmlld1RyYW5zZm9ybTI+O1xyXG5cclxuICAvLyBEZXJpdmVkIGZyb20gdmlzaWJsZUJvdW5kc1Byb3BlcnR5IHRvIGtlZXAgdGhlIFVJIGVsZW1lbnRzIGNlbnRlcmVkIG9uIG5hcnJvdyBzY3JlZW5zXHJcbiAgLy8gVHJhY2tzIG9ubHkgdGhlIHZlcnRpY2FsIGJvdW5kcyBhbmQgY29uc3RyYWlucyB0aGVtIHRvIGxheW91dEJvdW5kc1xyXG4gIHByb3RlY3RlZCByZWFkb25seSBhdmFpbGFibGVCb3VuZHNQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Qm91bmRzMj47XHJcblxyXG4gIHByb3RlY3RlZCByZWFkb25seSByZXNldEFsbEJ1dHRvbjogUmVzZXRBbGxCdXR0b247XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHVibGljIHJlYWRvbmx5IG1vZGVsOiBTb2xhclN5c3RlbUNvbW1vbk1vZGVsLCBwcm92aWRlZE9wdGlvbnM6IFNvbGFyU3lzdGVtQ29tbW9uU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTb2xhclN5c3RlbUNvbW1vblNjcmVlblZpZXdPcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcclxuICAgICAgcGxheWluZ0FsbG93ZWRQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCB0cnVlICksXHJcblxyXG4gICAgICBjZW50ZXJPcmJpdE9mZnNldDogVmVjdG9yMi5aRVJPXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuYXZhaWxhYmxlQm91bmRzUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMudmlzaWJsZUJvdW5kc1Byb3BlcnR5IF0sXHJcbiAgICAgIHZpc2libGVCb3VuZHMgPT4ge1xyXG4gICAgICAgIHJldHVybiB2aXNpYmxlQm91bmRzLndpdGhNaW5ZKCB0aGlzLmxheW91dEJvdW5kcy5taW5ZICkud2l0aE1heFkoIHRoaXMubGF5b3V0Qm91bmRzLm1heFkgKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmJvdHRvbUxheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmJvZGllc0xheWVyICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmNvbXBvbmVudHNMYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5pbnRlcmZhY2VMYXllciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy50b3BMYXllciApO1xyXG5cclxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHRoaXMuYm9kaWVzTGF5ZXIsXHJcbiAgICAgIHRoaXMuY29tcG9uZW50c0xheWVyLFxyXG4gICAgICB0aGlzLnRvcExheWVyXHJcbiAgICBdO1xyXG5cclxuICAgIHRoaXMucGRvbUNvbnRyb2xBcmVhTm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHRoaXMuYm90dG9tTGF5ZXIsXHJcbiAgICAgIHRoaXMuaW50ZXJmYWNlTGF5ZXJcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5ib2R5U291bmRNYW5hZ2VyID0gbmV3IEJvZHlTb3VuZE1hbmFnZXIoIG1vZGVsICk7XHJcbiAgICBtb2RlbC5hdmFpbGFibGVCb2RpZXMuZm9yRWFjaCggYm9keSA9PiB7XHJcbiAgICAgIGJvZHkuY29sbGlkZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5ib2R5U291bmRNYW5hZ2VyLnBsYXlCb2R5UmVtb3ZlZFNvdW5kKCAzICk7IC8vIFBsYXlzIHRoZSBjb2xsaXNpb24gc291bmQgaW5zdGVhZCBvZiBib2R5IGluZGV4XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBtb2RlbC56b29tUHJvcGVydHkgXSxcclxuICAgICAgem9vbSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIE1vZGVsVmlld1RyYW5zZm9ybTIuY3JlYXRlU2luZ2xlUG9pbnRTY2FsZUludmVydGVkWU1hcHBpbmcoXHJcbiAgICAgICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgICAgICBuZXcgVmVjdG9yMihcclxuICAgICAgICAgICAgdGhpcy5sYXlvdXRCb3VuZHMuY2VudGVyLnggLSBvcHRpb25zLmNlbnRlck9yYml0T2Zmc2V0LngsXHJcbiAgICAgICAgICAgIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlci55IC0gb3B0aW9ucy5jZW50ZXJPcmJpdE9mZnNldC55ICksXHJcbiAgICAgICAgICB6b29tICk7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIG5vZGUgZm9yIHRoZSBvdmVybGF5IGdyaWQsIHNldHRpbmcgaXRzIHZpc2liaWxpdHkgYmFzZWQgb24gdGhlIG1vZGVsLnNob3dHcmlkUHJvcGVydHlcclxuICAgIHRoaXMuaW50ZXJmYWNlTGF5ZXIuYWRkQ2hpbGQoIG5ldyBHcmlkTm9kZShcclxuICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSxcclxuICAgICAgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuR1JJRF9TUEFDSU5HLFxyXG4gICAgICBWZWN0b3IyLlpFUk8sXHJcbiAgICAgIDEwMCxcclxuICAgICAge1xyXG4gICAgICAgIHN0cm9rZTogU29sYXJTeXN0ZW1Db21tb25Db2xvcnMuZ3JpZEljb25TdHJva2VDb2xvclByb3BlcnR5LFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuZ3JpZFZpc2libGVQcm9wZXJ0eVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmNyZWF0ZURyYWdnYWJsZVZlY3Rvck5vZGUgPSAoIGJvZHk6IEJvZHksIG9wdGlvbnM/OiBEcmFnZ2FibGVWZWN0b3JOb2RlT3B0aW9ucyApID0+IHtcclxuICAgICAgcmV0dXJuIG5ldyBEcmFnZ2FibGVWZWN0b3JOb2RlKFxyXG4gICAgICAgIGJvZHksXHJcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSxcclxuICAgICAgICBtb2RlbC52ZWxvY2l0eVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICBib2R5LnZlbG9jaXR5UHJvcGVydHksXHJcbiAgICAgICAgYm9keS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgIDEsXHJcbiAgICAgICAgU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLlZTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBjb21iaW5lT3B0aW9uczxEcmFnZ2FibGVWZWN0b3JOb2RlT3B0aW9ucz4oIHtcclxuICAgICAgICAgIGZpbGw6IFBoZXRDb2xvclNjaGVtZS5WRUxPQ0lUWSxcclxuICAgICAgICAgIHNvdW5kVmlld05vZGU6IHRoaXMsXHJcbiAgICAgICAgICBtYXBQb3NpdGlvbjogdGhpcy5jb25zdHJhaW5Cb3VuZGFyeVZpZXdQb2ludC5iaW5kKCB0aGlzIClcclxuICAgICAgICB9LCBvcHRpb25zIClcclxuICAgICAgKTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gVUkgRWxlbWVudHMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZVVuaXRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHsgbmFtZTogJ0FVJywgbXVsdGlwbGllcjogMC4wMSB9ICk7XHJcblxyXG4gICAgY29uc3QgZHJhZ0NsaXBPcHRpb25zID0ge1xyXG4gICAgICBpbml0aWFsT3V0cHV0TGV2ZWw6IDIgKiBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5ERUZBVUxUX1NPVU5EX09VVFBVVF9MRVZFTFxyXG4gICAgfTtcclxuICAgIGNvbnN0IGdyYWJDbGlwID0gbmV3IFNvdW5kQ2xpcCggR3JhYl9Tb3VuZF9tcDMsIGRyYWdDbGlwT3B0aW9ucyApO1xyXG4gICAgY29uc3QgcmVsZWFzZUNsaXAgPSBuZXcgU291bmRDbGlwKCBSZWxlYXNlX1NvdW5kX21wMywgZHJhZ0NsaXBPcHRpb25zICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIGdyYWJDbGlwICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHJlbGVhc2VDbGlwICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBNZWFzdXJpbmdUYXBlTm9kZVxyXG4gICAgY29uc3QgbWVhc3VyaW5nVGFwZU5vZGUgPSBuZXcgTWVhc3VyaW5nVGFwZU5vZGUoIG1lYXN1cmluZ1RhcGVVbml0c1Byb3BlcnR5LCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwubWVhc3VyaW5nVGFwZVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGV4dENvbG9yOiAnYmxhY2snLFxyXG4gICAgICB0ZXh0QmFja2dyb3VuZENvbG9yOiAncmdiYSggMjU1LCAyNTUsIDI1NSwgMC41ICknLCAvLyB0cmFuc2x1Y2VudCByZWRcclxuICAgICAgdGV4dEJhY2tncm91bmRYTWFyZ2luOiAxMCxcclxuICAgICAgdGV4dEJhY2tncm91bmRZTWFyZ2luOiAzLFxyXG4gICAgICB0ZXh0QmFja2dyb3VuZENvcm5lclJhZGl1czogNSxcclxuICAgICAgYmFzZVBvc2l0aW9uUHJvcGVydHk6IG5ldyBWZWN0b3IyUHJvcGVydHkoIG5ldyBWZWN0b3IyKCAwLCAxMDAgKSApLFxyXG4gICAgICB0aXBQb3NpdGlvblByb3BlcnR5OiBuZXcgVmVjdG9yMlByb3BlcnR5KCBuZXcgVmVjdG9yMiggMTAwLCAxMDAgKSApLFxyXG4gICAgICB0YW5kZW06IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWVhc3VyaW5nVGFwZU5vZGUnICksXHJcbiAgICAgIHNpZ25pZmljYW50RmlndXJlczogMixcclxuICAgICAgYmFzZURyYWdTdGFydGVkOiAoKSA9PiBncmFiQ2xpcC5wbGF5KCksXHJcbiAgICAgIGJhc2VEcmFnRW5kZWQ6ICgpID0+IHJlbGVhc2VDbGlwLnBsYXkoKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy50b3BMYXllci5hZGRDaGlsZCggbWVhc3VyaW5nVGFwZU5vZGUgKTtcclxuXHJcblxyXG4gICAgY29uc3QgdGltZUNvbnRyb2xOb2RlID0gbmV3IFNvbGFyU3lzdGVtQ29tbW9uVGltZUNvbnRyb2xOb2RlKCBtb2RlbCxcclxuICAgICAge1xyXG4gICAgICAgIGVuYWJsZWRQcm9wZXJ0eTogb3B0aW9ucy5wbGF5aW5nQWxsb3dlZFByb3BlcnR5IHx8IG51bGwsXHJcbiAgICAgICAgcmVzdGFydExpc3RlbmVyOiAoKSA9PiBtb2RlbC5yZXN0YXJ0KCksXHJcbiAgICAgICAgc3RlcEZvcndhcmRMaXN0ZW5lcjogKCkgPT4gbW9kZWwuc3RlcE9uY2UoIDEgLyA4ICksXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbE5vZGUnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRpbWVTdHJpbmdQYXR0ZXJuUHJvcGVydHkgPSBuZXcgUGF0dGVyblN0cmluZ1Byb3BlcnR5KCBTb2xhclN5c3RlbUNvbW1vblN0cmluZ3MucGF0dGVybi5sYWJlbFVuaXRzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgdW5pdHM6IFNvbGFyU3lzdGVtQ29tbW9uU3RyaW5ncy51bml0cy55ZWFyc1N0cmluZ1Byb3BlcnR5XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2xvY2tOb2RlID0gbmV3IEhCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgTnVtYmVyRGlzcGxheSggbW9kZWwudGltZVByb3BlcnR5LCBuZXcgUmFuZ2UoIDAsIDEwMDAgKSwge1xyXG4gICAgICAgICAgYmFja2dyb3VuZEZpbGw6IG51bGwsXHJcbiAgICAgICAgICBiYWNrZ3JvdW5kU3Ryb2tlOiBudWxsLFxyXG4gICAgICAgICAgdGV4dE9wdGlvbnM6IGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgICAgICBtYXhXaWR0aDogODBcclxuICAgICAgICAgIH0sIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlRFWFRfT1BUSU9OUyApLFxyXG4gICAgICAgICAgeE1hcmdpbjogMCxcclxuICAgICAgICAgIHlNYXJnaW46IDAsXHJcbiAgICAgICAgICB2YWx1ZVBhdHRlcm46IHRpbWVTdHJpbmdQYXR0ZXJuUHJvcGVydHksXHJcbiAgICAgICAgICBkZWNpbWFsUGxhY2VzOiAxXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBUZXh0UHVzaEJ1dHRvbiggU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLmNsZWFyU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICAgICAgICAgIGVuYWJsZWRQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBtb2RlbC50aW1lUHJvcGVydHkgXSwgdGltZSA9PiB0aW1lID4gMCApLFxyXG4gICAgICAgICAgbGlzdGVuZXI6ICgpID0+IG1vZGVsLnRpbWVQcm9wZXJ0eS5yZXNldCgpLFxyXG4gICAgICAgICAgbWF4VGV4dFdpZHRoOiA2NSxcclxuICAgICAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjbGVhckJ1dHRvbicgKSxcclxuICAgICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTAsXHJcbiAgICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDVcclxuICAgICAgICB9IClcclxuICAgICAgXSxcclxuICAgICAgc3BhY2luZzogOFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudGltZUJveCA9IG5ldyBQYW5lbCggbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGltZUNvbnRyb2xOb2RlLCBjbG9ja05vZGUgXSxcclxuICAgICAgc3BhY2luZzogMTBcclxuICAgIH0gKSwgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuQ09OVFJPTF9QQU5FTF9PUFRJT05TICk7XHJcblxyXG4gICAgdGhpcy5yZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBtYXkgYmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIG1lYXN1cmluZ1RhcGVOb2RlLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiAxMCxcclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHZpc2libGVCb3VuZHMsIG1vZGVsVmlld1RyYW5zZm9ybSApID0+IHtcclxuICAgICAgICBtZWFzdXJpbmdUYXBlTm9kZS5zZXREcmFnQm91bmRzKCBtb2RlbFZpZXdUcmFuc2Zvcm0udmlld1RvTW9kZWxCb3VuZHMoIHZpc2libGVCb3VuZHMuZXJvZGVkKCA1MCApICkgKTtcclxuICAgICAgICBtZWFzdXJpbmdUYXBlTm9kZS5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBjb25zdHJhaW5Cb3VuZGFyeVZpZXdQb2ludCggcG9pbnQ6IFZlY3RvcjIsIHJhZGl1czogbnVtYmVyICk6IFZlY3RvcjIge1xyXG4gICAgcmV0dXJuIHBvaW50O1xyXG4gIH1cclxufVxyXG5cclxuc29sYXJTeXN0ZW1Db21tb24ucmVnaXN0ZXIoICdTb2xhclN5c3RlbUNvbW1vblNjcmVlblZpZXcnLCBTb2xhclN5c3RlbUNvbW1vblNjcmVlblZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxTQUFTLE1BQU0sK0JBQStCO0FBQ3JELE9BQU9DLFVBQVUsTUFBNkIsaUNBQWlDO0FBQy9FLE9BQU9DLG1CQUFtQixNQUFNLG9EQUFvRDtBQUNwRixPQUFPQyxjQUFjLE1BQU0sb0RBQW9EO0FBQy9FLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFlQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQzlFLE9BQU9DLDBCQUEwQixNQUFNLGtDQUFrQztBQUN6RSxPQUFPQyxnQ0FBZ0MsTUFBTSx1Q0FBdUM7QUFDcEYsT0FBT0MsY0FBYyxNQUFNLDJDQUEyQztBQUN0RSxPQUFPQyxRQUFRLE1BQU0sc0NBQXNDO0FBRTNELE9BQU9DLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0Msd0JBQXdCLE1BQU0sNkRBQTZEO0FBQ2xHLE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLG9DQUFvQztBQUM5RSxPQUFPQyxpQkFBaUIsTUFBTSwrQ0FBK0M7QUFDN0UsT0FBT0MsUUFBUSxNQUFNLDhCQUE4QjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sb0NBQW9DO0FBR2hFLE9BQU9DLG1CQUFtQixNQUFzQywwQkFBMEI7QUFDMUYsT0FBT0MsZUFBZSxNQUFNLDZDQUE2QztBQUN6RSxPQUFPQyxxQkFBcUIsTUFBTSwyQ0FBMkM7QUFDN0UsT0FBT0MsYUFBYSxNQUFNLDJDQUEyQztBQUNyRSxPQUFPQyxLQUFLLE1BQU0sMEJBQTBCO0FBRTVDLE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFFNUMsT0FB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