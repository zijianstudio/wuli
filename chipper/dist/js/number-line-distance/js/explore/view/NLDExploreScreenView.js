// Copyright 2020-2023, University of Colorado Boulder

/**
 * View of the 'Explore' screen for the Number Line Distance simulation
 *
 * @author Saurabh Totey
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import birdInAir_png from '../../../../number-line-common/images/birdInAir_png.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import { Image, Rectangle } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import house_png from '../../../mipmaps/house_png.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import DistanceSceneView from './DistanceSceneView.js';
import ElevationSceneView from './ElevationSceneView.js';
import TemperatureSceneView from './TemperatureSceneView.js';
const ICON_SIZE = new Dimension2(38, 38);
class NLDExploreScreenView extends ScreenView {
  /**
   * @param {NLDExploreModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // Add scene views as children.
    const distanceSceneView = new DistanceSceneView(model.distanceSceneModel);
    this.addChild(distanceSceneView);
    const temperatureSceneView = new TemperatureSceneView(model.temperatureSceneModel);
    this.addChild(temperatureSceneView);
    const elevationSceneView = new ElevationSceneView(model.elevationSceneModel);
    this.addChild(elevationSceneView);

    // Link each specific scene view's visibility with whether it is selected in the model.
    const sceneViews = [distanceSceneView, temperatureSceneView, elevationSceneView];
    model.selectedSceneModelProperty.link(selectedSceneModel => {
      sceneViews.forEach(sceneView => {
        sceneView.visible = sceneView.model === selectedSceneModel;
      });
    });

    // Map the scene selection icons to their enum values (used in the radio button group).
    const thermometerSceneIcon = new Rectangle(0, 0, ICON_SIZE.width, ICON_SIZE.height);
    const thermometerNode = new ThermometerNode(new NumberProperty(0.5), 0, 1);
    thermometerNode.setScaleMagnitude(ICON_SIZE.height / thermometerNode.height);
    thermometerNode.center = thermometerSceneIcon.center;
    thermometerSceneIcon.addChild(thermometerNode);
    const sceneSelectionButtonsContent = [{
      value: distanceSceneView.model,
      createNode: () => new Rectangle(0, 0, ICON_SIZE.width, ICON_SIZE.height, {
        children: [new Image(house_png, {
          maxWidth: ICON_SIZE.width,
          maxHeight: ICON_SIZE.height
        })]
      })
    }, {
      value: temperatureSceneView.model,
      createNode: () => thermometerSceneIcon
    }, {
      value: elevationSceneView.model,
      createNode: () => new Rectangle(0, 0, ICON_SIZE.width, ICON_SIZE.height, {
        children: [new Image(birdInAir_png, {
          maxWidth: ICON_SIZE.width,
          maxHeight: ICON_SIZE.height
        })]
      })
    }];
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        distanceSceneView.reset();
        temperatureSceneView.reset();
        elevationSceneView.reset();
      },
      right: this.layoutBounds.maxX - NLDConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - NLDConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);

    // Create scene selector radio buttons.
    const sceneSelectorRadioButtonGroup = new RectangularRadioButtonGroup(model.selectedSceneModelProperty, sceneSelectionButtonsContent, {
      orientation: 'horizontal',
      spacing: 7,
      touchAreaXDilation: 3,
      touchAreaYDilation: 3,
      radioButtonOptions: {
        xMargin: 5,
        yMargin: 5,
        baseColor: 'white',
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          deselectedLineWidth: 0.5,
          deselectedButtonOpacity: 0.25
        }
      },
      center: resetAllButton.centerTop.plus(NLDConstants.BOTTOM_BOX_BOUNDS.rightCenter).dividedScalar(2)
    });
    this.addChild(sceneSelectorRadioButtonGroup);
  }
}
numberLineDistance.register('NLDExploreScreenView', NLDExploreScreenView);
export default NLDExploreScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJTY3JlZW5WaWV3IiwiYmlyZEluQWlyX3BuZyIsIlJlc2V0QWxsQnV0dG9uIiwiVGhlcm1vbWV0ZXJOb2RlIiwiSW1hZ2UiLCJSZWN0YW5nbGUiLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJob3VzZV9wbmciLCJOTERDb25zdGFudHMiLCJudW1iZXJMaW5lRGlzdGFuY2UiLCJEaXN0YW5jZVNjZW5lVmlldyIsIkVsZXZhdGlvblNjZW5lVmlldyIsIlRlbXBlcmF0dXJlU2NlbmVWaWV3IiwiSUNPTl9TSVpFIiwiTkxERXhwbG9yZVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwiZGlzdGFuY2VTY2VuZVZpZXciLCJkaXN0YW5jZVNjZW5lTW9kZWwiLCJhZGRDaGlsZCIsInRlbXBlcmF0dXJlU2NlbmVWaWV3IiwidGVtcGVyYXR1cmVTY2VuZU1vZGVsIiwiZWxldmF0aW9uU2NlbmVWaWV3IiwiZWxldmF0aW9uU2NlbmVNb2RlbCIsInNjZW5lVmlld3MiLCJzZWxlY3RlZFNjZW5lTW9kZWxQcm9wZXJ0eSIsImxpbmsiLCJzZWxlY3RlZFNjZW5lTW9kZWwiLCJmb3JFYWNoIiwic2NlbmVWaWV3IiwidmlzaWJsZSIsInRoZXJtb21ldGVyU2NlbmVJY29uIiwid2lkdGgiLCJoZWlnaHQiLCJ0aGVybW9tZXRlck5vZGUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImNlbnRlciIsInNjZW5lU2VsZWN0aW9uQnV0dG9uc0NvbnRlbnQiLCJ2YWx1ZSIsImNyZWF0ZU5vZGUiLCJjaGlsZHJlbiIsIm1heFdpZHRoIiwibWF4SGVpZ2h0IiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJlc2V0IiwicmlnaHQiLCJsYXlvdXRCb3VuZHMiLCJtYXhYIiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJib3R0b20iLCJtYXhZIiwiU0NSRUVOX1ZJRVdfWV9NQVJHSU4iLCJjcmVhdGVUYW5kZW0iLCJzY2VuZVNlbGVjdG9yUmFkaW9CdXR0b25Hcm91cCIsIm9yaWVudGF0aW9uIiwic3BhY2luZyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInJhZGlvQnV0dG9uT3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYmFzZUNvbG9yIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkTGluZVdpZHRoIiwiZGVzZWxlY3RlZExpbmVXaWR0aCIsImRlc2VsZWN0ZWRCdXR0b25PcGFjaXR5IiwiY2VudGVyVG9wIiwicGx1cyIsIkJPVFRPTV9CT1hfQk9VTkRTIiwicmlnaHRDZW50ZXIiLCJkaXZpZGVkU2NhbGFyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOTERFeHBsb3JlU2NyZWVuVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IG9mIHRoZSAnRXhwbG9yZScgc2NyZWVuIGZvciB0aGUgTnVtYmVyIExpbmUgRGlzdGFuY2Ugc2ltdWxhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhdXJhYmggVG90ZXlcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBiaXJkSW5BaXJfcG5nIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9pbWFnZXMvYmlyZEluQWlyX3BuZy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBUaGVybW9tZXRlck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1RoZXJtb21ldGVyTm9kZS5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBob3VzZV9wbmcgZnJvbSAnLi4vLi4vLi4vbWlwbWFwcy9ob3VzZV9wbmcuanMnO1xyXG5pbXBvcnQgTkxEQ29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9OTERDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZURpc3RhbmNlIGZyb20gJy4uLy4uL251bWJlckxpbmVEaXN0YW5jZS5qcyc7XHJcbmltcG9ydCBEaXN0YW5jZVNjZW5lVmlldyBmcm9tICcuL0Rpc3RhbmNlU2NlbmVWaWV3LmpzJztcclxuaW1wb3J0IEVsZXZhdGlvblNjZW5lVmlldyBmcm9tICcuL0VsZXZhdGlvblNjZW5lVmlldy5qcyc7XHJcbmltcG9ydCBUZW1wZXJhdHVyZVNjZW5lVmlldyBmcm9tICcuL1RlbXBlcmF0dXJlU2NlbmVWaWV3LmpzJztcclxuXHJcbmNvbnN0IElDT05fU0laRSA9IG5ldyBEaW1lbnNpb24yKCAzOCwgMzggKTtcclxuXHJcbmNsYXNzIE5MREV4cGxvcmVTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TkxERXhwbG9yZU1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIHRhbmRlbSApIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQWRkIHNjZW5lIHZpZXdzIGFzIGNoaWxkcmVuLlxyXG4gICAgY29uc3QgZGlzdGFuY2VTY2VuZVZpZXcgPSBuZXcgRGlzdGFuY2VTY2VuZVZpZXcoIG1vZGVsLmRpc3RhbmNlU2NlbmVNb2RlbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZGlzdGFuY2VTY2VuZVZpZXcgKTtcclxuICAgIGNvbnN0IHRlbXBlcmF0dXJlU2NlbmVWaWV3ID0gbmV3IFRlbXBlcmF0dXJlU2NlbmVWaWV3KCBtb2RlbC50ZW1wZXJhdHVyZVNjZW5lTW9kZWwgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRlbXBlcmF0dXJlU2NlbmVWaWV3ICk7XHJcbiAgICBjb25zdCBlbGV2YXRpb25TY2VuZVZpZXcgPSBuZXcgRWxldmF0aW9uU2NlbmVWaWV3KCBtb2RlbC5lbGV2YXRpb25TY2VuZU1vZGVsICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBlbGV2YXRpb25TY2VuZVZpZXcgKTtcclxuXHJcbiAgICAvLyBMaW5rIGVhY2ggc3BlY2lmaWMgc2NlbmUgdmlldydzIHZpc2liaWxpdHkgd2l0aCB3aGV0aGVyIGl0IGlzIHNlbGVjdGVkIGluIHRoZSBtb2RlbC5cclxuICAgIGNvbnN0IHNjZW5lVmlld3MgPSBbIGRpc3RhbmNlU2NlbmVWaWV3LCB0ZW1wZXJhdHVyZVNjZW5lVmlldywgZWxldmF0aW9uU2NlbmVWaWV3IF07XHJcbiAgICBtb2RlbC5zZWxlY3RlZFNjZW5lTW9kZWxQcm9wZXJ0eS5saW5rKCBzZWxlY3RlZFNjZW5lTW9kZWwgPT4ge1xyXG4gICAgICBzY2VuZVZpZXdzLmZvckVhY2goIHNjZW5lVmlldyA9PiB7IHNjZW5lVmlldy52aXNpYmxlID0gc2NlbmVWaWV3Lm1vZGVsID09PSBzZWxlY3RlZFNjZW5lTW9kZWw7IH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBNYXAgdGhlIHNjZW5lIHNlbGVjdGlvbiBpY29ucyB0byB0aGVpciBlbnVtIHZhbHVlcyAodXNlZCBpbiB0aGUgcmFkaW8gYnV0dG9uIGdyb3VwKS5cclxuICAgIGNvbnN0IHRoZXJtb21ldGVyU2NlbmVJY29uID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgSUNPTl9TSVpFLndpZHRoLCBJQ09OX1NJWkUuaGVpZ2h0ICk7XHJcbiAgICBjb25zdCB0aGVybW9tZXRlck5vZGUgPSBuZXcgVGhlcm1vbWV0ZXJOb2RlKCBuZXcgTnVtYmVyUHJvcGVydHkoIDAuNSApLCAwLCAxICk7XHJcbiAgICB0aGVybW9tZXRlck5vZGUuc2V0U2NhbGVNYWduaXR1ZGUoIElDT05fU0laRS5oZWlnaHQgLyB0aGVybW9tZXRlck5vZGUuaGVpZ2h0ICk7XHJcbiAgICB0aGVybW9tZXRlck5vZGUuY2VudGVyID0gdGhlcm1vbWV0ZXJTY2VuZUljb24uY2VudGVyO1xyXG4gICAgdGhlcm1vbWV0ZXJTY2VuZUljb24uYWRkQ2hpbGQoIHRoZXJtb21ldGVyTm9kZSApO1xyXG4gICAgY29uc3Qgc2NlbmVTZWxlY3Rpb25CdXR0b25zQ29udGVudCA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHZhbHVlOiBkaXN0YW5jZVNjZW5lVmlldy5tb2RlbCxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBJQ09OX1NJWkUud2lkdGgsIElDT05fU0laRS5oZWlnaHQsIHtcclxuICAgICAgICAgIGNoaWxkcmVuOiBbIG5ldyBJbWFnZSggaG91c2VfcG5nLCB7IG1heFdpZHRoOiBJQ09OX1NJWkUud2lkdGgsIG1heEhlaWdodDogSUNPTl9TSVpFLmhlaWdodCB9ICkgXVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IHRlbXBlcmF0dXJlU2NlbmVWaWV3Lm1vZGVsLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IHRoZXJtb21ldGVyU2NlbmVJY29uXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogZWxldmF0aW9uU2NlbmVWaWV3Lm1vZGVsLFxyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBSZWN0YW5nbGUoIDAsIDAsIElDT05fU0laRS53aWR0aCwgSUNPTl9TSVpFLmhlaWdodCwge1xyXG4gICAgICAgICAgY2hpbGRyZW46IFsgbmV3IEltYWdlKCBiaXJkSW5BaXJfcG5nLCB7IG1heFdpZHRoOiBJQ09OX1NJWkUud2lkdGgsIG1heEhlaWdodDogSUNPTl9TSVpFLmhlaWdodCB9ICkgXVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTsgLy8gY2FuY2VsIGludGVyYWN0aW9ucyB0aGF0IG1heSBiZSBpbiBwcm9ncmVzc1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgZGlzdGFuY2VTY2VuZVZpZXcucmVzZXQoKTtcclxuICAgICAgICB0ZW1wZXJhdHVyZVNjZW5lVmlldy5yZXNldCgpO1xyXG4gICAgICAgIGVsZXZhdGlvblNjZW5lVmlldy5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMubWF4WCAtIE5MRENvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgYm90dG9tOiB0aGlzLmxheW91dEJvdW5kcy5tYXhZIC0gTkxEQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgc2NlbmUgc2VsZWN0b3IgcmFkaW8gYnV0dG9ucy5cclxuICAgIGNvbnN0IHNjZW5lU2VsZWN0b3JSYWRpb0J1dHRvbkdyb3VwID0gbmV3IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cChcclxuICAgICAgbW9kZWwuc2VsZWN0ZWRTY2VuZU1vZGVsUHJvcGVydHksXHJcbiAgICAgIHNjZW5lU2VsZWN0aW9uQnV0dG9uc0NvbnRlbnQsXHJcbiAgICAgIHtcclxuICAgICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICAgIHNwYWNpbmc6IDcsXHJcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAzLFxyXG4gICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMyxcclxuICAgICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHhNYXJnaW46IDUsXHJcbiAgICAgICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICAgICAgYmFzZUNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgICBzZWxlY3RlZExpbmVXaWR0aDogMixcclxuICAgICAgICAgICAgZGVzZWxlY3RlZExpbmVXaWR0aDogMC41LFxyXG4gICAgICAgICAgICBkZXNlbGVjdGVkQnV0dG9uT3BhY2l0eTogMC4yNVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2VudGVyOiByZXNldEFsbEJ1dHRvbi5jZW50ZXJUb3AucGx1cyggTkxEQ29uc3RhbnRzLkJPVFRPTV9CT1hfQk9VTkRTLnJpZ2h0Q2VudGVyICkuZGl2aWRlZFNjYWxhciggMiApXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzY2VuZVNlbGVjdG9yUmFkaW9CdXR0b25Hcm91cCApO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbm51bWJlckxpbmVEaXN0YW5jZS5yZWdpc3RlciggJ05MREV4cGxvcmVTY3JlZW5WaWV3JywgTkxERXhwbG9yZVNjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgTkxERXhwbG9yZVNjcmVlblZpZXc7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxPQUFPQyxhQUFhLE1BQU0sd0RBQXdEO0FBQ2xGLE9BQU9DLGNBQWMsTUFBTSx1REFBdUQ7QUFDbEYsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxLQUFLLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDcEUsT0FBT0MsMkJBQTJCLE1BQU0sMkRBQTJEO0FBQ25HLE9BQU9DLFNBQVMsTUFBTSwrQkFBK0I7QUFDckQsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBQ3RELE9BQU9DLGtCQUFrQixNQUFNLHlCQUF5QjtBQUN4RCxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFFNUQsTUFBTUMsU0FBUyxHQUFHLElBQUlkLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO0FBRTFDLE1BQU1lLG9CQUFvQixTQUFTZCxVQUFVLENBQUM7RUFFNUM7QUFDRjtBQUNBO0FBQ0E7RUFDRWUsV0FBV0EsQ0FBRUMsS0FBSyxFQUFFQyxNQUFNLEVBQUc7SUFDM0IsS0FBSyxDQUFFO01BQ0xBLE1BQU0sRUFBRUE7SUFDVixDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJUixpQkFBaUIsQ0FBRU0sS0FBSyxDQUFDRyxrQkFBbUIsQ0FBQztJQUMzRSxJQUFJLENBQUNDLFFBQVEsQ0FBRUYsaUJBQWtCLENB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