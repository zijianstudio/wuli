// Copyright 2015-2023, University of Colorado Boulder

/**
 * SpectraScreenView is the view for the 'Spectra' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import { Node, Path, VBox } from '../../../../scenery/js/imports.js';
import MOTHAColors from '../../common/MOTHAColors.js';
import MOTHAConstants from '../../common/MOTHAConstants.js';
import BeamNode from '../../common/view/BeamNode.js';
import BoxOfHydrogenNode from '../../common/view/BoxOfHydrogenNode.js';
import ExperimentPredictionSwitch from '../../common/view/ExperimentPredictionSwitch.js';
import LegendAccordionBox from '../../common/view/LegendAccordionBox.js';
import LightModeRadioButtonGroup from '../../common/view/LightModeRadioButtonGroup.js';
import MonochromaticControls from '../../common/view/MonochromaticControls.js';
import MOTHATimeControlNode from '../../common/view/MOTHATimeControlNode.js';
import PredictionPanel from '../../common/view/PredictionPanel.js';
import SnapshotsDialog from '../../common/view/SnapshotsDialog.js';
import SpectrometerAccordionBox from '../../common/view/SpectrometerAccordionBox.js';
import TinyBox from '../../common/view/TinyBox.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import SpectraViewProperties from './SpectraViewProperties.js';
import ViewSnapshotsButton from '../../common/view/ViewSnapshotsButton.js';
import SpectraZoomedInBoxNode from './SpectraZoomedInBoxNode.js';
export default class SpectraScreenView extends ScreenView {
  constructor(model, providedOptions) {
    const options = optionize()({
      //TODO default values for options
    }, providedOptions);
    super(options);
    const viewProperties = new SpectraViewProperties({
      tandem: options.tandem.createTandem('viewProperties')
    });

    // Parent for any popups
    const popupsParent = new Node();

    // Legend (sic) to symbols
    const legendAccordionBox = new LegendAccordionBox({
      expandedProperty: viewProperties.keyExpandedProperty,
      left: this.layoutBounds.left + MOTHAConstants.SCREEN_VIEW_X_MARGIN,
      top: this.layoutBounds.top + MOTHAConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem('legendAccordionBox')
    });

    // Light Mode radio button group
    const lightModeRadioButtonGroup = new LightModeRadioButtonGroup(model.light.lightModeProperty, {
      left: this.layoutBounds.left + 30,
      bottom: 415,
      tandem: options.tandem.createTandem('lightModeRadioButtonGroup')
    });

    // Controls for monochromatic light
    const monochromaticControls = new MonochromaticControls(model.modelModeProperty, model.predictiveModelProperty, model.light.monochromaticWavelengthProperty, model.light.lightModeProperty, viewProperties.absorptionWavelengthsVisibleProperty, {
      left: lightModeRadioButtonGroup.left,
      top: lightModeRadioButtonGroup.bottom + 15,
      tandem: options.tandem.createTandem('monochromaticControls')
    });

    // Light
    const lightNode = new LaserPointerNode(model.light.onProperty, {
      bodySize: new Dimension2(88, 64),
      nozzleSize: new Dimension2(18, 50),
      buttonRadius: 19,
      rotation: -Math.PI / 2,
      // pointing up
      left: lightModeRadioButtonGroup.right + 20,
      bottom: lightModeRadioButtonGroup.bottom,
      tandem: options.tandem.createTandem('lightNode')
    });

    // Beam of light
    const beamNode = new BeamNode({
      visibleProperty: model.light.onProperty,
      fill: model.light.colorProperty,
      centerX: lightNode.centerX,
      bottom: lightNode.top + 1,
      tandem: options.tandem.createTandem('beamNode')
    });

    // Box of hydrogen
    const boxOfHydrogenNode = new BoxOfHydrogenNode({
      centerX: beamNode.centerX,
      bottom: beamNode.top + 1,
      tandem: options.tandem.createTandem('boxOfHydrogenNode')
    });

    // Tiny box that indicates what will be zoomed
    const tinyBoxNode = new TinyBox({
      right: boxOfHydrogenNode.right - 10,
      top: boxOfHydrogenNode.top + 20,
      tandem: options.tandem.createTandem('tinyBoxNode')
    });

    // Time controls
    const timeControlNode = new MOTHATimeControlNode(model.isPlayingProperty, model.timeSpeedProperty, model.stepOnce.bind(model), {
      left: monochromaticControls.left,
      top: monochromaticControls.bottom + 8,
      tandem: options.tandem.createTandem('timeControlNode')
    });

    // The zoomed-in view of the box of hydrogen
    const zoomedInBoxNode = new SpectraZoomedInBoxNode(model, popupsParent, {
      left: lightNode.right + 50,
      top: this.layoutBounds.top + 15,
      tandem: options.tandem.createTandem('zoomedInBoxNode')
    });

    // Dashed lines that connect the tiny box and zoom box
    const dashedLines = new Path(new Shape().moveTo(tinyBoxNode.left, tinyBoxNode.top).lineTo(zoomedInBoxNode.left, zoomedInBoxNode.top).moveTo(tinyBoxNode.left, tinyBoxNode.bottom).lineTo(zoomedInBoxNode.left, zoomedInBoxNode.bottom), {
      stroke: MOTHAColors.zoomedInBoxStrokeProperty,
      lineDash: [5, 5],
      tandem: options.tandem.createTandem('dashedLines')
    });

    // switches the model mode between Experiment and Prediction
    const experimentPredictionSwitch = new ExperimentPredictionSwitch(model.modelModeProperty, {
      tandem: options.tandem.createTandem('experimentPredictionSwitch')
    });

    // panel that contains radio buttons for selecting a predictive model
    const predictionPanel = new PredictionPanel(model.predictiveModelProperty, model.predictiveModels, model.modelModeProperty, {
      tandem: options.tandem.createTandem('predictionPanel')
    });
    const modelVBox = new VBox({
      children: [experimentPredictionSwitch, predictionPanel],
      align: 'center',
      spacing: 10,
      left: zoomedInBoxNode.right + 30,
      top: zoomedInBoxNode.top,
      excludeInvisibleChildrenFromBounds: false
    });

    // Spectrometer
    const spectrometerAccordionBox = new SpectrometerAccordionBox(viewProperties.numberOfSnapshotsProperty, {
      expandedProperty: viewProperties.spectrometerExpandedProperty,
      left: monochromaticControls.right + 10,
      top: monochromaticControls.top,
      tandem: options.tandem.createTandem('spectrometerAccordionBox')
    });

    // Constructed eagerly and reused to appease PhET-iO.
    const snapshotsDialog = new SnapshotsDialog(viewProperties.numberOfSnapshotsProperty, {
      tandem: options.tandem.createTandem('snapshotsDialog')
    });

    // View Snapshots button, above upper-right corner of spectrometer
    const viewSnapshotsButton = new ViewSnapshotsButton(viewProperties.numberOfSnapshotsProperty, {
      listener: () => snapshotsDialog.show(),
      right: spectrometerAccordionBox.right,
      bottom: spectrometerAccordionBox.top - 10,
      tandem: options.tandem.createTandem('viewSnapshotsButton')
    });

    // Reset All button
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.right - MOTHAConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.bottom - MOTHAConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem('resetAllButton')
    });

    // rendering order
    const screenViewRootNode = new Node({
      children: [legendAccordionBox, timeControlNode, beamNode, lightNode, lightModeRadioButtonGroup, monochromaticControls, boxOfHydrogenNode, tinyBoxNode, dashedLines, zoomedInBoxNode, modelVBox, spectrometerAccordionBox, viewSnapshotsButton, resetAllButton, popupsParent]
    });
    this.addChild(screenViewRootNode);

    // pdom - traversal order
    screenViewRootNode.pdomOrder = [lightModeRadioButtonGroup, lightNode, modelVBox, timeControlNode, spectrometerAccordionBox, viewSnapshotsButton];
    this.model = model;
    this.zoomedInBoxNode = zoomedInBoxNode;
  }
  step(dt) {
    if (this.model.isPlayingProperty.value) {
      this.zoomedInBoxNode.step(dt);
    }
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('SpectraScreenView', SpectraScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiU2NyZWVuVmlldyIsIlNoYXBlIiwib3B0aW9uaXplIiwiUmVzZXRBbGxCdXR0b24iLCJMYXNlclBvaW50ZXJOb2RlIiwiTm9kZSIsIlBhdGgiLCJWQm94IiwiTU9USEFDb2xvcnMiLCJNT1RIQUNvbnN0YW50cyIsIkJlYW1Ob2RlIiwiQm94T2ZIeWRyb2dlbk5vZGUiLCJFeHBlcmltZW50UHJlZGljdGlvblN3aXRjaCIsIkxlZ2VuZEFjY29yZGlvbkJveCIsIkxpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAiLCJNb25vY2hyb21hdGljQ29udHJvbHMiLCJNT1RIQVRpbWVDb250cm9sTm9kZSIsIlByZWRpY3Rpb25QYW5lbCIsIlNuYXBzaG90c0RpYWxvZyIsIlNwZWN0cm9tZXRlckFjY29yZGlvbkJveCIsIlRpbnlCb3giLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIlNwZWN0cmFWaWV3UHJvcGVydGllcyIsIlZpZXdTbmFwc2hvdHNCdXR0b24iLCJTcGVjdHJhWm9vbWVkSW5Cb3hOb2RlIiwiU3BlY3RyYVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInZpZXdQcm9wZXJ0aWVzIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwicG9wdXBzUGFyZW50IiwibGVnZW5kQWNjb3JkaW9uQm94IiwiZXhwYW5kZWRQcm9wZXJ0eSIsImtleUV4cGFuZGVkUHJvcGVydHkiLCJsZWZ0IiwibGF5b3V0Qm91bmRzIiwiU0NSRUVOX1ZJRVdfWF9NQVJHSU4iLCJ0b3AiLCJTQ1JFRU5fVklFV19ZX01BUkdJTiIsImxpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAiLCJsaWdodCIsImxpZ2h0TW9kZVByb3BlcnR5IiwiYm90dG9tIiwibW9ub2Nocm9tYXRpY0NvbnRyb2xzIiwibW9kZWxNb2RlUHJvcGVydHkiLCJwcmVkaWN0aXZlTW9kZWxQcm9wZXJ0eSIsIm1vbm9jaHJvbWF0aWNXYXZlbGVuZ3RoUHJvcGVydHkiLCJhYnNvcnB0aW9uV2F2ZWxlbmd0aHNWaXNpYmxlUHJvcGVydHkiLCJsaWdodE5vZGUiLCJvblByb3BlcnR5IiwiYm9keVNpemUiLCJub3p6bGVTaXplIiwiYnV0dG9uUmFkaXVzIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJyaWdodCIsImJlYW1Ob2RlIiwidmlzaWJsZVByb3BlcnR5IiwiZmlsbCIsImNvbG9yUHJvcGVydHkiLCJjZW50ZXJYIiwiYm94T2ZIeWRyb2dlbk5vZGUiLCJ0aW55Qm94Tm9kZSIsInRpbWVDb250cm9sTm9kZSIsImlzUGxheWluZ1Byb3BlcnR5IiwidGltZVNwZWVkUHJvcGVydHkiLCJzdGVwT25jZSIsImJpbmQiLCJ6b29tZWRJbkJveE5vZGUiLCJkYXNoZWRMaW5lcyIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsInpvb21lZEluQm94U3Ryb2tlUHJvcGVydHkiLCJsaW5lRGFzaCIsImV4cGVyaW1lbnRQcmVkaWN0aW9uU3dpdGNoIiwicHJlZGljdGlvblBhbmVsIiwicHJlZGljdGl2ZU1vZGVscyIsIm1vZGVsVkJveCIsImNoaWxkcmVuIiwiYWxpZ24iLCJzcGFjaW5nIiwiZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kcyIsInNwZWN0cm9tZXRlckFjY29yZGlvbkJveCIsIm51bWJlck9mU25hcHNob3RzUHJvcGVydHkiLCJzcGVjdHJvbWV0ZXJFeHBhbmRlZFByb3BlcnR5Iiwic25hcHNob3RzRGlhbG9nIiwidmlld1NuYXBzaG90c0J1dHRvbiIsImxpc3RlbmVyIiwic2hvdyIsInJlc2V0QWxsQnV0dG9uIiwicmVzZXQiLCJzY3JlZW5WaWV3Um9vdE5vZGUiLCJhZGRDaGlsZCIsInBkb21PcmRlciIsInN0ZXAiLCJkdCIsInZhbHVlIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3BlY3RyYVNjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3BlY3RyYVNjcmVlblZpZXcgaXMgdGhlIHZpZXcgZm9yIHRoZSAnU3BlY3RyYScgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcsIHsgU2NyZWVuVmlld09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IExhc2VyUG9pbnRlck5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0xhc2VyUG9pbnRlck5vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IE1PVEhBQ29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9NT1RIQUNvbG9ycy5qcyc7XHJcbmltcG9ydCBNT1RIQUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTU9USEFDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmVhbU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQmVhbU5vZGUuanMnO1xyXG5pbXBvcnQgQm94T2ZIeWRyb2dlbk5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQm94T2ZIeWRyb2dlbk5vZGUuanMnO1xyXG5pbXBvcnQgRXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2ggZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2guanMnO1xyXG5pbXBvcnQgTGVnZW5kQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xlZ2VuZEFjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBMaWdodE1vZGVSYWRpb0J1dHRvbkdyb3VwIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0xpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgTW9ub2Nocm9tYXRpY0NvbnRyb2xzIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L01vbm9jaHJvbWF0aWNDb250cm9scy5qcyc7XHJcbmltcG9ydCBNT1RIQVRpbWVDb250cm9sTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9NT1RIQVRpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCBQcmVkaWN0aW9uUGFuZWwgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUHJlZGljdGlvblBhbmVsLmpzJztcclxuaW1wb3J0IFNuYXBzaG90c0RpYWxvZyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TbmFwc2hvdHNEaWFsb2cuanMnO1xyXG5pbXBvcnQgU3BlY3Ryb21ldGVyQWNjb3JkaW9uQm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1NwZWN0cm9tZXRlckFjY29yZGlvbkJveC5qcyc7XHJcbmltcG9ydCBUaW55Qm94IGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1RpbnlCb3guanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgU3BlY3RyYU1vZGVsIGZyb20gJy4uL21vZGVsL1NwZWN0cmFNb2RlbC5qcyc7XHJcbmltcG9ydCBTcGVjdHJhVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9TcGVjdHJhVmlld1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgVmlld1NuYXBzaG90c0J1dHRvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9WaWV3U25hcHNob3RzQnV0dG9uLmpzJztcclxuaW1wb3J0IFNwZWN0cmFab29tZWRJbkJveE5vZGUgZnJvbSAnLi9TcGVjdHJhWm9vbWVkSW5Cb3hOb2RlLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG5cclxudHlwZSBTcGVjdHJhU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNjcmVlblZpZXdPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3BlY3RyYVNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBtb2RlbDogU3BlY3RyYU1vZGVsO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgem9vbWVkSW5Cb3hOb2RlOiBTcGVjdHJhWm9vbWVkSW5Cb3hOb2RlO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBTcGVjdHJhTW9kZWwsIHByb3ZpZGVkT3B0aW9uczogU3BlY3RyYVNjcmVlblZpZXdPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3BlY3RyYVNjcmVlblZpZXdPcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcclxuICAgICAgLy9UT0RPIGRlZmF1bHQgdmFsdWVzIGZvciBvcHRpb25zXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHZpZXdQcm9wZXJ0aWVzID0gbmV3IFNwZWN0cmFWaWV3UHJvcGVydGllcygge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXdQcm9wZXJ0aWVzJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFyZW50IGZvciBhbnkgcG9wdXBzXHJcbiAgICBjb25zdCBwb3B1cHNQYXJlbnQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIC8vIExlZ2VuZCAoc2ljKSB0byBzeW1ib2xzXHJcbiAgICBjb25zdCBsZWdlbmRBY2NvcmRpb25Cb3ggPSBuZXcgTGVnZW5kQWNjb3JkaW9uQm94KCB7XHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHk6IHZpZXdQcm9wZXJ0aWVzLmtleUV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyBNT1RIQUNvbnN0YW50cy5TQ1JFRU5fVklFV19YX01BUkdJTixcclxuICAgICAgdG9wOiB0aGlzLmxheW91dEJvdW5kcy50b3AgKyBNT1RIQUNvbnN0YW50cy5TQ1JFRU5fVklFV19ZX01BUkdJTixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsZWdlbmRBY2NvcmRpb25Cb3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMaWdodCBNb2RlIHJhZGlvIGJ1dHRvbiBncm91cFxyXG4gICAgY29uc3QgbGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cCA9IG5ldyBMaWdodE1vZGVSYWRpb0J1dHRvbkdyb3VwKCBtb2RlbC5saWdodC5saWdodE1vZGVQcm9wZXJ0eSwge1xyXG4gICAgICBsZWZ0OiB0aGlzLmxheW91dEJvdW5kcy5sZWZ0ICsgMzAsXHJcbiAgICAgIGJvdHRvbTogNDE1LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb250cm9scyBmb3IgbW9ub2Nocm9tYXRpYyBsaWdodFxyXG4gICAgY29uc3QgbW9ub2Nocm9tYXRpY0NvbnRyb2xzID0gbmV3IE1vbm9jaHJvbWF0aWNDb250cm9scyhcclxuICAgICAgbW9kZWwubW9kZWxNb2RlUHJvcGVydHksXHJcbiAgICAgIG1vZGVsLnByZWRpY3RpdmVNb2RlbFByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5saWdodC5tb25vY2hyb21hdGljV2F2ZWxlbmd0aFByb3BlcnR5LFxyXG4gICAgICBtb2RlbC5saWdodC5saWdodE1vZGVQcm9wZXJ0eSxcclxuICAgICAgdmlld1Byb3BlcnRpZXMuYWJzb3JwdGlvbldhdmVsZW5ndGhzVmlzaWJsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgbGVmdDogbGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cC5sZWZ0LFxyXG4gICAgICAgIHRvcDogbGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cC5ib3R0b20gKyAxNSxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vbm9jaHJvbWF0aWNDb250cm9scycgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gTGlnaHRcclxuICAgIGNvbnN0IGxpZ2h0Tm9kZSA9IG5ldyBMYXNlclBvaW50ZXJOb2RlKCBtb2RlbC5saWdodC5vblByb3BlcnR5LCB7XHJcbiAgICAgIGJvZHlTaXplOiBuZXcgRGltZW5zaW9uMiggODgsIDY0ICksXHJcbiAgICAgIG5venpsZVNpemU6IG5ldyBEaW1lbnNpb24yKCAxOCwgNTAgKSxcclxuICAgICAgYnV0dG9uUmFkaXVzOiAxOSxcclxuICAgICAgcm90YXRpb246IC1NYXRoLlBJIC8gMiwgLy8gcG9pbnRpbmcgdXBcclxuICAgICAgbGVmdDogbGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cC5yaWdodCArIDIwLFxyXG4gICAgICBib3R0b206IGxpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAuYm90dG9tLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpZ2h0Tm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEJlYW0gb2YgbGlnaHRcclxuICAgIGNvbnN0IGJlYW1Ob2RlID0gbmV3IEJlYW1Ob2RlKCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwubGlnaHQub25Qcm9wZXJ0eSxcclxuICAgICAgZmlsbDogbW9kZWwubGlnaHQuY29sb3JQcm9wZXJ0eSxcclxuICAgICAgY2VudGVyWDogbGlnaHROb2RlLmNlbnRlclgsXHJcbiAgICAgIGJvdHRvbTogbGlnaHROb2RlLnRvcCArIDEsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYmVhbU5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBCb3ggb2YgaHlkcm9nZW5cclxuICAgIGNvbnN0IGJveE9mSHlkcm9nZW5Ob2RlID0gbmV3IEJveE9mSHlkcm9nZW5Ob2RlKCB7XHJcbiAgICAgIGNlbnRlclg6IGJlYW1Ob2RlLmNlbnRlclgsXHJcbiAgICAgIGJvdHRvbTogYmVhbU5vZGUudG9wICsgMSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdib3hPZkh5ZHJvZ2VuTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRpbnkgYm94IHRoYXQgaW5kaWNhdGVzIHdoYXQgd2lsbCBiZSB6b29tZWRcclxuICAgIGNvbnN0IHRpbnlCb3hOb2RlID0gbmV3IFRpbnlCb3goIHtcclxuICAgICAgcmlnaHQ6IGJveE9mSHlkcm9nZW5Ob2RlLnJpZ2h0IC0gMTAsXHJcbiAgICAgIHRvcDogYm94T2ZIeWRyb2dlbk5vZGUudG9wICsgMjAsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGlueUJveE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaW1lIGNvbnRyb2xzXHJcbiAgICBjb25zdCB0aW1lQ29udHJvbE5vZGUgPSBuZXcgTU9USEFUaW1lQ29udHJvbE5vZGUoIG1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LCBtb2RlbC50aW1lU3BlZWRQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuc3RlcE9uY2UuYmluZCggbW9kZWwgKSwge1xyXG4gICAgICAgIGxlZnQ6IG1vbm9jaHJvbWF0aWNDb250cm9scy5sZWZ0LFxyXG4gICAgICAgIHRvcDogbW9ub2Nocm9tYXRpY0NvbnRyb2xzLmJvdHRvbSArIDgsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbE5vZGUnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSB6b29tZWQtaW4gdmlldyBvZiB0aGUgYm94IG9mIGh5ZHJvZ2VuXHJcbiAgICBjb25zdCB6b29tZWRJbkJveE5vZGUgPSBuZXcgU3BlY3RyYVpvb21lZEluQm94Tm9kZSggbW9kZWwsIHBvcHVwc1BhcmVudCwge1xyXG4gICAgICBsZWZ0OiBsaWdodE5vZGUucmlnaHQgKyA1MCxcclxuICAgICAgdG9wOiB0aGlzLmxheW91dEJvdW5kcy50b3AgKyAxNSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd6b29tZWRJbkJveE5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEYXNoZWQgbGluZXMgdGhhdCBjb25uZWN0IHRoZSB0aW55IGJveCBhbmQgem9vbSBib3hcclxuICAgIGNvbnN0IGRhc2hlZExpbmVzID0gbmV3IFBhdGgoIG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIHRpbnlCb3hOb2RlLmxlZnQsIHRpbnlCb3hOb2RlLnRvcCApXHJcbiAgICAgIC5saW5lVG8oIHpvb21lZEluQm94Tm9kZS5sZWZ0LCB6b29tZWRJbkJveE5vZGUudG9wIClcclxuICAgICAgLm1vdmVUbyggdGlueUJveE5vZGUubGVmdCwgdGlueUJveE5vZGUuYm90dG9tIClcclxuICAgICAgLmxpbmVUbyggem9vbWVkSW5Cb3hOb2RlLmxlZnQsIHpvb21lZEluQm94Tm9kZS5ib3R0b20gKSwge1xyXG4gICAgICBzdHJva2U6IE1PVEhBQ29sb3JzLnpvb21lZEluQm94U3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIGxpbmVEYXNoOiBbIDUsIDUgXSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkYXNoZWRMaW5lcycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHN3aXRjaGVzIHRoZSBtb2RlbCBtb2RlIGJldHdlZW4gRXhwZXJpbWVudCBhbmQgUHJlZGljdGlvblxyXG4gICAgY29uc3QgZXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2ggPSBuZXcgRXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2goIG1vZGVsLm1vZGVsTW9kZVByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXhwZXJpbWVudFByZWRpY3Rpb25Td2l0Y2gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwYW5lbCB0aGF0IGNvbnRhaW5zIHJhZGlvIGJ1dHRvbnMgZm9yIHNlbGVjdGluZyBhIHByZWRpY3RpdmUgbW9kZWxcclxuICAgIGNvbnN0IHByZWRpY3Rpb25QYW5lbCA9IG5ldyBQcmVkaWN0aW9uUGFuZWwoIG1vZGVsLnByZWRpY3RpdmVNb2RlbFByb3BlcnR5LCBtb2RlbC5wcmVkaWN0aXZlTW9kZWxzLCBtb2RlbC5tb2RlbE1vZGVQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZWRpY3Rpb25QYW5lbCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG1vZGVsVkJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGV4cGVyaW1lbnRQcmVkaWN0aW9uU3dpdGNoLCBwcmVkaWN0aW9uUGFuZWwgXSxcclxuICAgICAgYWxpZ246ICdjZW50ZXInLFxyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgbGVmdDogem9vbWVkSW5Cb3hOb2RlLnJpZ2h0ICsgMzAsXHJcbiAgICAgIHRvcDogem9vbWVkSW5Cb3hOb2RlLnRvcCxcclxuICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTcGVjdHJvbWV0ZXJcclxuICAgIGNvbnN0IHNwZWN0cm9tZXRlckFjY29yZGlvbkJveCA9IG5ldyBTcGVjdHJvbWV0ZXJBY2NvcmRpb25Cb3goIHZpZXdQcm9wZXJ0aWVzLm51bWJlck9mU25hcHNob3RzUHJvcGVydHksIHtcclxuICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogdmlld1Byb3BlcnRpZXMuc3BlY3Ryb21ldGVyRXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgbGVmdDogbW9ub2Nocm9tYXRpY0NvbnRyb2xzLnJpZ2h0ICsgMTAsXHJcbiAgICAgIHRvcDogbW9ub2Nocm9tYXRpY0NvbnRyb2xzLnRvcCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzcGVjdHJvbWV0ZXJBY2NvcmRpb25Cb3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3RlZCBlYWdlcmx5IGFuZCByZXVzZWQgdG8gYXBwZWFzZSBQaEVULWlPLlxyXG4gICAgY29uc3Qgc25hcHNob3RzRGlhbG9nID0gbmV3IFNuYXBzaG90c0RpYWxvZyggdmlld1Byb3BlcnRpZXMubnVtYmVyT2ZTbmFwc2hvdHNQcm9wZXJ0eSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NuYXBzaG90c0RpYWxvZycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZpZXcgU25hcHNob3RzIGJ1dHRvbiwgYWJvdmUgdXBwZXItcmlnaHQgY29ybmVyIG9mIHNwZWN0cm9tZXRlclxyXG4gICAgY29uc3Qgdmlld1NuYXBzaG90c0J1dHRvbiA9IG5ldyBWaWV3U25hcHNob3RzQnV0dG9uKCB2aWV3UHJvcGVydGllcy5udW1iZXJPZlNuYXBzaG90c1Byb3BlcnR5LCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiBzbmFwc2hvdHNEaWFsb2cuc2hvdygpLFxyXG4gICAgICByaWdodDogc3BlY3Ryb21ldGVyQWNjb3JkaW9uQm94LnJpZ2h0LFxyXG4gICAgICBib3R0b206IHNwZWN0cm9tZXRlckFjY29yZGlvbkJveC50b3AgLSAxMCxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3U25hcHNob3RzQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmVzZXQgQWxsIGJ1dHRvblxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHZpZXdQcm9wZXJ0aWVzLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIE1PVEhBQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1hfTUFSR0lOLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIE1PVEhBQ29uc3RhbnRzLlNDUkVFTl9WSUVXX1lfTUFSR0lOLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICBjb25zdCBzY3JlZW5WaWV3Um9vdE5vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIGxlZ2VuZEFjY29yZGlvbkJveCxcclxuICAgICAgICB0aW1lQ29udHJvbE5vZGUsXHJcbiAgICAgICAgYmVhbU5vZGUsXHJcbiAgICAgICAgbGlnaHROb2RlLFxyXG4gICAgICAgIGxpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAsXHJcbiAgICAgICAgbW9ub2Nocm9tYXRpY0NvbnRyb2xzLFxyXG4gICAgICAgIGJveE9mSHlkcm9nZW5Ob2RlLFxyXG4gICAgICAgIHRpbnlCb3hOb2RlLFxyXG4gICAgICAgIGRhc2hlZExpbmVzLFxyXG4gICAgICAgIHpvb21lZEluQm94Tm9kZSxcclxuICAgICAgICBtb2RlbFZCb3gsXHJcbiAgICAgICAgc3BlY3Ryb21ldGVyQWNjb3JkaW9uQm94LFxyXG4gICAgICAgIHZpZXdTbmFwc2hvdHNCdXR0b24sXHJcbiAgICAgICAgcmVzZXRBbGxCdXR0b24sXHJcbiAgICAgICAgcG9wdXBzUGFyZW50XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNjcmVlblZpZXdSb290Tm9kZSApO1xyXG5cclxuICAgIC8vIHBkb20gLSB0cmF2ZXJzYWwgb3JkZXJcclxuICAgIHNjcmVlblZpZXdSb290Tm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIGxpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXAsXHJcbiAgICAgIGxpZ2h0Tm9kZSxcclxuICAgICAgbW9kZWxWQm94LFxyXG4gICAgICB0aW1lQ29udHJvbE5vZGUsXHJcbiAgICAgIHNwZWN0cm9tZXRlckFjY29yZGlvbkJveCxcclxuICAgICAgdmlld1NuYXBzaG90c0J1dHRvblxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB0aGlzLnpvb21lZEluQm94Tm9kZSA9IHpvb21lZEluQm94Tm9kZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICB0aGlzLnpvb21lZEluQm94Tm9kZS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnU3BlY3RyYVNjcmVlblZpZXcnLCBTcGVjdHJhU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFVBQVUsTUFBNkIsb0NBQW9DO0FBQ2xGLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFDbkYsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxnQkFBZ0IsTUFBTSxpREFBaUQ7QUFDOUUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDcEUsT0FBT0MsV0FBVyxNQUFNLDZCQUE2QjtBQUNyRCxPQUFPQyxjQUFjLE1BQU0sZ0NBQWdDO0FBQzNELE9BQU9DLFFBQVEsTUFBTSwrQkFBK0I7QUFDcEQsT0FBT0MsaUJBQWlCLE1BQU0sd0NBQXdDO0FBQ3RFLE9BQU9DLDBCQUEwQixNQUFNLGlEQUFpRDtBQUN4RixPQUFPQyxrQkFBa0IsTUFBTSx5Q0FBeUM7QUFDeEUsT0FBT0MseUJBQXlCLE1BQU0sZ0RBQWdEO0FBQ3RGLE9BQU9DLHFCQUFxQixNQUFNLDRDQUE0QztBQUM5RSxPQUFPQyxvQkFBb0IsTUFBTSwyQ0FBMkM7QUFDNUUsT0FBT0MsZUFBZSxNQUFNLHNDQUFzQztBQUNsRSxPQUFPQyxlQUFlLE1BQU0sc0NBQXNDO0FBQ2xFLE9BQU9DLHdCQUF3QixNQUFNLCtDQUErQztBQUNwRixPQUFPQyxPQUFPLE1BQU0sOEJBQThCO0FBQ2xELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUV0RSxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFDOUQsT0FBT0MsbUJBQW1CLE1BQU0sMENBQTBDO0FBQzFFLE9BQU9DLHNCQUFzQixNQUFNLDZCQUE2QjtBQU1oRSxlQUFlLE1BQU1DLGlCQUFpQixTQUFTekIsVUFBVSxDQUFDO0VBS2pEMEIsV0FBV0EsQ0FBRUMsS0FBbUIsRUFBRUMsZUFBeUMsRUFBRztJQUVuRixNQUFNQyxPQUFPLEdBQUczQixTQUFTLENBQTJELENBQUMsQ0FBRTtNQUNyRjtJQUFBLENBQ0QsRUFBRTBCLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFQyxPQUFRLENBQUM7SUFFaEIsTUFBTUMsY0FBYyxHQUFHLElBQUlSLHFCQUFxQixDQUFFO01BQ2hEUyxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsZ0JBQWlCO0lBQ3hELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLFlBQVksR0FBRyxJQUFJNUIsSUFBSSxDQUFDLENBQUM7O0lBRS9CO0lBQ0EsTUFBTTZCLGtCQUFrQixHQUFHLElBQUlyQixrQkFBa0IsQ0FBRTtNQUNqRHNCLGdCQUFnQixFQUFFTCxjQUFjLENBQUNNLG1CQUFtQjtNQUNwREMsSUFBSSxFQUFFLElBQUksQ0FBQ0MsWUFBWSxDQUFDRCxJQUFJLEdBQUc1QixjQUFjLENBQUM4QixvQkFBb0I7TUFDbEVDLEdBQUcsRUFBRSxJQUFJLENBQUNGLFlBQVksQ0FBQ0UsR0FBRyxHQUFHL0IsY0FBYyxDQUFDZ0Msb0JBQW9CO01BQ2hFVixNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsb0JBQXFCO0lBQzVELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1VLHlCQUF5QixHQUFHLElBQUk1Qix5QkFBeUIsQ0FBRWEsS0FBSyxDQUFDZ0IsS0FBSyxDQUFDQyxpQkFBaUIsRUFBRTtNQUM5RlAsSUFBSSxFQUFFLElBQUksQ0FBQ0MsWUFBWSxDQUFDRCxJQUFJLEdBQUcsRUFBRTtNQUNqQ1EsTUFBTSxFQUFFLEdBQUc7TUFDWGQsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLDJCQUE0QjtJQUNuRSxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNYyxxQkFBcUIsR0FBRyxJQUFJL0IscUJBQXFCLENBQ3JEWSxLQUFLLENBQUNvQixpQkFBaUIsRUFDdkJwQixLQUFLLENBQUNxQix1QkFBdUIsRUFDN0JyQixLQUFLLENBQUNnQixLQUFLLENBQUNNLCtCQUErQixFQUMzQ3RCLEtBQUssQ0FBQ2dCLEtBQUssQ0FBQ0MsaUJBQWlCLEVBQzdCZCxjQUFjLENBQUNvQixvQ0FBb0MsRUFBRTtNQUNuRGIsSUFBSSxFQUFFSyx5QkFBeUIsQ0FBQ0wsSUFBSTtNQUNwQ0csR0FBRyxFQUFFRSx5QkFBeUIsQ0FBQ0csTUFBTSxHQUFHLEVBQUU7TUFDMUNkLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSx1QkFBd0I7SUFDL0QsQ0FBRSxDQUFDOztJQUVMO0lBQ0EsTUFBTW1CLFNBQVMsR0FBRyxJQUFJL0MsZ0JBQWdCLENBQUV1QixLQUFLLENBQUNnQixLQUFLLENBQUNTLFVBQVUsRUFBRTtNQUM5REMsUUFBUSxFQUFFLElBQUl0RCxVQUFVLENBQUUsRUFBRSxFQUFFLEVBQUcsQ0FBQztNQUNsQ3VELFVBQVUsRUFBRSxJQUFJdkQsVUFBVSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUM7TUFDcEN3RCxZQUFZLEVBQUUsRUFBRTtNQUNoQkMsUUFBUSxFQUFFLENBQUNDLElBQUksQ0FBQ0MsRUFBRSxHQUFHLENBQUM7TUFBRTtNQUN4QnJCLElBQUksRUFBRUsseUJBQXlCLENBQUNpQixLQUFLLEdBQUcsRUFBRTtNQUMxQ2QsTUFBTSxFQUFFSCx5QkFBeUIsQ0FBQ0csTUFBTTtNQUN4Q2QsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFdBQVk7SUFDbkQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTTRCLFFBQVEsR0FBRyxJQUFJbEQsUUFBUSxDQUFFO01BQzdCbUQsZUFBZSxFQUFFbEMsS0FBSyxDQUFDZ0IsS0FBSyxDQUFDUyxVQUFVO01BQ3ZDVSxJQUFJLEVBQUVuQyxLQUFLLENBQUNnQixLQUFLLENBQUNvQixhQUFhO01BQy9CQyxPQUFPLEVBQUViLFNBQVMsQ0FBQ2EsT0FBTztNQUMxQm5CLE1BQU0sRUFBRU0sU0FBUyxDQUFDWCxHQUFHLEdBQUcsQ0FBQztNQUN6QlQsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLFVBQVc7SUFDbEQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTWlDLGlCQUFpQixHQUFHLElBQUl0RCxpQkFBaUIsQ0FBRTtNQUMvQ3FELE9BQU8sRUFBRUosUUFBUSxDQUFDSSxPQUFPO01BQ3pCbkIsTUFBTSxFQUFFZSxRQUFRLENBQUNwQixHQUFHLEdBQUcsQ0FBQztNQUN4QlQsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLG1CQUFvQjtJQUMzRCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNa0MsV0FBVyxHQUFHLElBQUk5QyxPQUFPLENBQUU7TUFDL0J1QyxLQUFLLEVBQUVNLGlCQUFpQixDQUFDTixLQUFLLEdBQUcsRUFBRTtNQUNuQ25CLEdBQUcsRUFBRXlCLGlCQUFpQixDQUFDekIsR0FBRyxHQUFHLEVBQUU7TUFDL0JULE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxhQUFjO0lBQ3JELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1tQyxlQUFlLEdBQUcsSUFBSW5ELG9CQUFvQixDQUFFVyxLQUFLLENBQUN5QyxpQkFBaUIsRUFBRXpDLEtBQUssQ0FBQzBDLGlCQUFpQixFQUNoRzFDLEtBQUssQ0FBQzJDLFFBQVEsQ0FBQ0MsSUFBSSxDQUFFNUMsS0FBTSxDQUFDLEVBQUU7TUFDNUJVLElBQUksRUFBRVMscUJBQXFCLENBQUNULElBQUk7TUFDaENHLEdBQUcsRUFBRU0scUJBQXFCLENBQUNELE1BQU0sR0FBRyxDQUFDO01BQ3JDZCxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsaUJBQWtCO0lBQ3pELENBQUUsQ0FBQzs7SUFFTDtJQUNBLE1BQU13QyxlQUFlLEdBQUcsSUFBSWhELHNCQUFzQixDQUFFRyxLQUFLLEVBQUVNLFlBQVksRUFBRTtNQUN2RUksSUFBSSxFQUFFYyxTQUFTLENBQUNRLEtBQUssR0FBRyxFQUFFO01BQzFCbkIsR0FBRyxFQUFFLElBQUksQ0FBQ0YsWUFBWSxDQUFDRSxHQUFHLEdBQUcsRUFBRTtNQUMvQlQsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGlCQUFrQjtJQUN6RCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNeUMsV0FBVyxHQUFHLElBQUluRSxJQUFJLENBQUUsSUFBSUwsS0FBSyxDQUFDLENBQUMsQ0FDdEN5RSxNQUFNLENBQUVSLFdBQVcsQ0FBQzdCLElBQUksRUFBRTZCLFdBQVcsQ0FBQzFCLEdBQUksQ0FBQyxDQUMzQ21DLE1BQU0sQ0FBRUgsZUFBZSxDQUFDbkMsSUFBSSxFQUFFbUMsZUFBZSxDQUFDaEMsR0FBSSxDQUFDLENBQ25Ea0MsTUFBTSxDQUFFUixXQUFXLENBQUM3QixJQUFJLEVBQUU2QixXQUFXLENBQUNyQixNQUFPLENBQUMsQ0FDOUM4QixNQUFNLENBQUVILGVBQWUsQ0FBQ25DLElBQUksRUFBRW1DLGVBQWUsQ0FBQzNCLE1BQU8sQ0FBQyxFQUFFO01BQ3pEK0IsTUFBTSxFQUFFcEUsV0FBVyxDQUFDcUUseUJBQXlCO01BQzdDQyxRQUFRLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxDQUFFO01BQ2xCL0MsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGFBQWM7SUFDckQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTStDLDBCQUEwQixHQUFHLElBQUluRSwwQkFBMEIsQ0FBRWUsS0FBSyxDQUFDb0IsaUJBQWlCLEVBQUU7TUFDMUZoQixNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUsNEJBQTZCO0lBQ3BFLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1nRCxlQUFlLEdBQUcsSUFBSS9ELGVBQWUsQ0FBRVUsS0FBSyxDQUFDcUIsdUJBQXVCLEVBQUVyQixLQUFLLENBQUNzRCxnQkFBZ0IsRUFBRXRELEtBQUssQ0FBQ29CLGlCQUFpQixFQUFFO01BQzNIaEIsTUFBTSxFQUFFRixPQUFPLENBQUNFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGlCQUFrQjtJQUN6RCxDQUFFLENBQUM7SUFFSCxNQUFNa0QsU0FBUyxHQUFHLElBQUkzRSxJQUFJLENBQUU7TUFDMUI0RSxRQUFRLEVBQUUsQ0FBRUosMEJBQTBCLEVBQUVDLGVBQWUsQ0FBRTtNQUN6REksS0FBSyxFQUFFLFFBQVE7TUFDZkMsT0FBTyxFQUFFLEVBQUU7TUFDWGhELElBQUksRUFBRW1DLGVBQWUsQ0FBQ2IsS0FBSyxHQUFHLEVBQUU7TUFDaENuQixHQUFHLEVBQUVnQyxlQUFlLENBQUNoQyxHQUFHO01BQ3hCOEMsa0NBQWtDLEVBQUU7SUFDdEMsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSXBFLHdCQUF3QixDQUFFVyxjQUFjLENBQUMwRCx5QkFBeUIsRUFBRTtNQUN2R3JELGdCQUFnQixFQUFFTCxjQUFjLENBQUMyRCw0QkFBNEI7TUFDN0RwRCxJQUFJLEVBQUVTLHFCQUFxQixDQUFDYSxLQUFLLEdBQUcsRUFBRTtNQUN0Q25CLEdBQUcsRUFBRU0scUJBQXFCLENBQUNOLEdBQUc7TUFDOUJULE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSwwQkFBMkI7SUFDbEUsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTTBELGVBQWUsR0FBRyxJQUFJeEUsZUFBZSxDQUFFWSxjQUFjLENBQUMwRCx5QkFBeUIsRUFBRTtNQUNyRnpELE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxpQkFBa0I7SUFDekQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTTJELG1CQUFtQixHQUFHLElBQUlwRSxtQkFBbUIsQ0FBRU8sY0FBYyxDQUFDMEQseUJBQXlCLEVBQUU7TUFDN0ZJLFFBQVEsRUFBRUEsQ0FBQSxLQUFNRixlQUFlLENBQUNHLElBQUksQ0FBQyxDQUFDO01BQ3RDbEMsS0FBSyxFQUFFNEIsd0JBQXdCLENBQUM1QixLQUFLO01BQ3JDZCxNQUFNLEVBQUUwQyx3QkFBd0IsQ0FBQy9DLEdBQUcsR0FBRyxFQUFFO01BQ3pDVCxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDQyxZQUFZLENBQUUscUJBQXNCO0lBQzdELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU04RCxjQUFjLEdBQUcsSUFBSTNGLGNBQWMsQ0FBRTtNQUN6Q3lGLFFBQVEsRUFBRUEsQ0FBQSxLQUFNO1FBQ2RqRSxLQUFLLENBQUNvRSxLQUFLLENBQUMsQ0FBQztRQUNiakUsY0FBYyxDQUFDaUUsS0FBSyxDQUFDLENBQUM7TUFDeEIsQ0FBQztNQUNEcEMsS0FBSyxFQUFFLElBQUksQ0FBQ3JCLFlBQVksQ0FBQ3FCLEtBQUssR0FBR2xELGNBQWMsQ0FBQzhCLG9CQUFvQjtNQUNwRU0sTUFBTSxFQUFFLElBQUksQ0FBQ1AsWUFBWSxDQUFDTyxNQUFNLEdBQUdwQyxjQUFjLENBQUNnQyxvQkFBb0I7TUFDdEVWLE1BQU0sRUFBRUYsT0FBTyxDQUFDRSxNQUFNLENBQUNDLFlBQVksQ0FBRSxnQkFBaUI7SUFDeEQsQ0FBRSxDQUFDOztJQUVIO0lBQ0EsTUFBTWdFLGtCQUFrQixHQUFHLElBQUkzRixJQUFJLENBQUU7TUFDbkM4RSxRQUFRLEVBQUUsQ0FDUmpELGtCQUFrQixFQUNsQmlDLGVBQWUsRUFDZlAsUUFBUSxFQUNSVCxTQUFTLEVBQ1RULHlCQUF5QixFQUN6QkkscUJBQXFCLEVBQ3JCbUIsaUJBQWlCLEVBQ2pCQyxXQUFXLEVBQ1hPLFdBQVcsRUFDWEQsZUFBZSxFQUNmVSxTQUFTLEVBQ1RLLHdCQUF3QixFQUN4QkksbUJBQW1CLEVBQ25CRyxjQUFjLEVBQ2Q3RCxZQUFZO0lBRWhCLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ2dFLFFBQVEsQ0FBRUQsa0JBQW1CLENBQUM7O0lBRW5DO0lBQ0FBLGtCQUFrQixDQUFDRSxTQUFTLEdBQUcsQ0FDN0J4RCx5QkFBeUIsRUFDekJTLFNBQVMsRUFDVCtCLFNBQVMsRUFDVGYsZUFBZSxFQUNmb0Isd0JBQXdCLEVBQ3hCSSxtQkFBbUIsQ0FDcEI7SUFFRCxJQUFJLENBQUNoRSxLQUFLLEdBQUdBLEtBQUs7SUFDbEIsSUFBSSxDQUFDNkMsZUFBZSxHQUFHQSxlQUFlO0VBQ3hDO0VBRWdCMkIsSUFBSUEsQ0FBRUMsRUFBVSxFQUFTO0lBQ3ZDLElBQUssSUFBSSxDQUFDekUsS0FBSyxDQUFDeUMsaUJBQWlCLENBQUNpQyxLQUFLLEVBQUc7TUFDeEMsSUFBSSxDQUFDN0IsZUFBZSxDQUFDMkIsSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFDakM7RUFDRjtFQUVnQkUsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFqRix1QkFBdUIsQ0FBQ21GLFFBQVEsQ0FBRSxtQkFBbUIsRUFBRS9FLGlCQUFrQixDQUFDIn0=