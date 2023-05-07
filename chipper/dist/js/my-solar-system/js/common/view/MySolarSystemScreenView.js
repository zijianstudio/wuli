// Copyright 2022-2023, University of Colorado Boulder

/**
 * Screen view for the My Solar System Screen
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import { AlignBox, HBox, Node, Path, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import SolarSystemCommonConstants from '../../../../solar-system-common/js/SolarSystemCommonConstants.js';
import MySolarSystemControls from './MySolarSystemControls.js';
import mySolarSystem from '../../mySolarSystem.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import SolarSystemCommonScreenView from '../../../../solar-system-common/js/view/SolarSystemCommonScreenView.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import SolarSystemCommonCheckbox from '../../../../solar-system-common/js/view/SolarSystemCommonCheckbox.js';
import FullDataPanel from './FullDataPanel.js';
import MySolarSystemStrings from '../../MySolarSystemStrings.js';
import NumberSpinner from '../../../../sun/js/NumberSpinner.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import Range from '../../../../dot/js/Range.js';
import ViewSynchronizer from '../../../../scenery-phet/js/ViewSynchronizer.js';
import BodyNode from '../../../../solar-system-common/js/view/BodyNode.js';
import VectorNode from '../../../../solar-system-common/js/view/VectorNode.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dialog from '../../../../sun/js/Dialog.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import PathsCanvasNode from './PathsCanvasNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import CenterOfMassNode from './CenterOfMassNode.js';
import LabModeComboBox from './LabModeComboBox.js';
import TextPushButton from '../../../../sun/js/buttons/TextPushButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SolarSystemCommonStrings from '../../../../solar-system-common/js/SolarSystemCommonStrings.js';
import { Shape } from '../../../../kite/js/imports.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import nullSoundPlayer from '../../../../tambo/js/shared-sound-players/nullSoundPlayer.js';
export default class MySolarSystemScreenView extends SolarSystemCommonScreenView {
  constructor(model, providedOptions) {
    super(model, {
      centerOrbitOffset: new Vector2(SolarSystemCommonConstants.GRID_SPACING, SolarSystemCommonConstants.GRID_SPACING),
      ...providedOptions
    });

    // Body and Arrows Creation =================================================================================================
    // Setting the Factory functions that will create the necessary Nodes

    this.dragDebugPath = new Path(null, {
      stroke: 'red',
      fill: 'rgba(255,0,0,0.2)'
    });
    if (phet.chipper.queryParameters.dev) {
      this.addChild(this.dragDebugPath);
    }
    this.bodyNodeSynchronizer = new ViewSynchronizer(this.bodiesLayer, body => {
      const bodyNode = new BodyNode(body, this.modelViewTransformProperty, {
        valuesVisibleProperty: model.valuesVisibleProperty,
        mapPosition: this.constrainBoundaryViewPoint.bind(this),
        soundViewNode: this
      });
      return bodyNode;
    });
    const velocityVectorSynchronizer = new ViewSynchronizer(this.componentsLayer, this.createDraggableVectorNode);
    const forceVectorSynchronizer = new ViewSynchronizer(this.componentsLayer, body => new VectorNode(body, this.modelViewTransformProperty, model.gravityVisibleProperty, body.forceProperty, model.forceScaleProperty, {
      fill: PhetColorScheme.GRAVITATIONAL_FORCE,
      constrainSize: true
    }));

    // The ViewSynchronizers handle the creation and disposal of Model-View pairs
    const trackers = [this.bodyNodeSynchronizer, velocityVectorSynchronizer, forceVectorSynchronizer];

    // Create bodyNodes and arrows for every body
    model.bodies.forEach(body => trackers.forEach(tracker => tracker.add(body)));

    // Set up listeners for object creation and disposal
    model.bodies.elementAddedEmitter.addListener(body => {
      trackers.forEach(tracker => tracker.add(body));
    });
    model.bodies.elementRemovedEmitter.addListener(body => {
      trackers.forEach(tracker => tracker.remove(body));
    });

    // Center of Mass Node
    const centerOfMassNode = new CenterOfMassNode(model.centerOfMass, this.modelViewTransformProperty);
    this.componentsLayer.addChild(centerOfMassNode);

    // UI Elements ===================================================================================================

    // Zoom Buttons ---------------------------------------------------------------------------
    this.zoomButtons = new MagnifyingGlassZoomButtonGroup(model.zoomLevelProperty, {
      spacing: 8,
      magnifyingGlassNodeOptions: {
        glassRadius: 8
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: 5
    });
    const labModeComboBox = new LabModeComboBox(model, this.topLayer, {
      widthSizable: false,
      layoutOptions: {
        align: 'center'
      }
    });
    const checkboxesControlPanel = new MySolarSystemControls(model, this.topLayer, {
      tandem: providedOptions.tandem.createTandem('controlPanel')
    });
    this.topRightControlBox = new VBox({
      spacing: 7.5,
      stretch: true,
      children: [new Panel(new Node({
        children: [labModeComboBox],
        visible: model.isLab
      }), SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS), this.timeBox, new Panel(checkboxesControlPanel, SolarSystemCommonConstants.CONTROL_PANEL_OPTIONS)]
    });

    // Full Data Panel --------------------------------------------------------------------------------------------
    this.fullDataPanel = new FullDataPanel(model);
    this.followCenterOfMassButton = new TextPushButton(MySolarSystemStrings.followCenterOfMassStringProperty, {
      visibleProperty: model.userControlledProperty,
      listener: () => {
        model.systemCenteredProperty.value = true;
        model.userControlledProperty.value = false;
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: SolarSystemCommonConstants.CHECKBOX_SPACING / 2,
      font: SolarSystemCommonConstants.PANEL_FONT,
      maxTextWidth: 200,
      baseColor: 'orange'
    });
    const numberSpinnerTandem = model.isLab ? providedOptions.tandem.createTandem('numberSpinner') : Tandem.OPT_OUT;
    this.numberSpinnerBox = new VBox({
      children: [new Text(MySolarSystemStrings.dataPanel.bodiesStringProperty, combineOptions({
        maxWidth: 70
      }, SolarSystemCommonConstants.TEXT_OPTIONS)), new NumberSpinner(model.numberOfActiveBodiesProperty, new TinyProperty(new Range(1, SolarSystemCommonConstants.NUM_BODIES)), {
        deltaValue: 1,
        touchAreaXDilation: 20,
        touchAreaYDilation: 10,
        mouseAreaXDilation: 10,
        mouseAreaYDilation: 5,
        arrowsPosition: 'bothRight',
        arrowsSoundPlayer: nullSoundPlayer,
        numberDisplayOptions: {
          decimalPlaces: 0,
          align: 'center',
          xMargin: 10,
          yMargin: 3,
          textOptions: {
            font: new PhetFont(28)
          }
        },
        accessibleName: MySolarSystemStrings.a11y.numberOfBodiesStringProperty
      })],
      visible: model.isLab,
      spacing: 5,
      tandem: numberSpinnerTandem
    });
    const infoButtonTandem = model.isLab ? providedOptions.tandem.createTandem('unitsInfoButton') : Tandem.OPT_OUT;
    const moreDataCheckboxTandem = model.isLab ? providedOptions.tandem.createTandem('moreDataCheckbox') : Tandem.OPT_OUT;
    this.dataPanelTopRow = new HBox({
      stretch: true,
      visible: model.isLab,
      children: [new SolarSystemCommonCheckbox(model.moreDataProperty, new Text(MySolarSystemStrings.dataPanel.moreDataStringProperty, combineOptions({
        maxWidth: 300
      }, SolarSystemCommonConstants.TEXT_OPTIONS)), combineOptions({
        accessibleName: MySolarSystemStrings.a11y.moreDataStringProperty,
        touchAreaXDilation: 10,
        touchAreaYDilation: 10,
        tandem: moreDataCheckboxTandem
      }, SolarSystemCommonConstants.CHECKBOX_OPTIONS)), new InfoButton({
        accessibleName: MySolarSystemStrings.a11y.infoStringProperty,
        scale: 0.5,
        iconFill: 'rgb( 41, 106, 163 )',
        touchAreaDilation: 20,
        listener: () => unitsDialog.show(),
        tandem: infoButtonTandem
      })]
    });
    const notesStringProperty = new DerivedProperty([MySolarSystemStrings.unitsInfo.contentStringProperty, MySolarSystemStrings.unitsInfo.content2StringProperty, MySolarSystemStrings.unitsInfo.content3StringProperty], (content, content2, content3) => {
      return content + '<br><br>' + content2 + '<br><br>' + content3;
    });
    const unitsDialog = new Dialog(new RichText(notesStringProperty, {
      lineWrap: 600
    }), {
      titleAlign: 'center',
      title: new Text(MySolarSystemStrings.unitsInfo.titleStringProperty, {
        font: new PhetFont(32)
      }),
      tandem: providedOptions.tandem.createTandem('unitsDialog')
    });

    // Masses Panel --------------------------------------------------------------------------------------------
    const dataGridbox = new HBox({
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: 'Data Panel',
      align: 'bottom',
      spacing: 10,
      children: [new VBox({
        spacing: 3,
        stretch: true,
        children: [this.dataPanelTopRow, this.fullDataPanel]
      }), new HBox({
        align: 'bottom',
        spacing: 10,
        children: [this.numberSpinnerBox, this.followCenterOfMassButton]
      })]
    });
    const controlsAlignBox = new AlignBox(dataGridbox, {
      alignBoundsProperty: this.availableBoundsProperty,
      margin: SolarSystemCommonConstants.MARGIN,
      xAlign: 'left',
      yAlign: 'bottom'
    });
    const resetAlignBox = new AlignBox(this.resetAllButton, {
      alignBoundsProperty: this.availableBoundsProperty,
      margin: SolarSystemCommonConstants.MARGIN,
      xAlign: 'right',
      yAlign: 'bottom'
    });
    const zoomButtonsBox = new AlignBox(this.zoomButtons, {
      alignBoundsProperty: this.availableBoundsProperty,
      margin: SolarSystemCommonConstants.MARGIN,
      xAlign: 'left',
      yAlign: 'top'
    });
    const offScaleMessage = new Text(SolarSystemCommonStrings.offscaleMessageStringProperty, combineOptions({
      visibleProperty: DerivedProperty.and([model.gravityVisibleProperty, model.isAnyForceOffscaleProperty]),
      maxWidth: SolarSystemCommonConstants.TEXT_MAX_WIDTH * 1.6
    }, SolarSystemCommonConstants.TEXT_OPTIONS));
    const returnBodiesButton = new TextPushButton(MySolarSystemStrings.returnBodiesStringProperty, {
      visibleProperty: model.isAnyBodyEscapedProperty,
      listener: () => {
        model.restart();
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      font: SolarSystemCommonConstants.PANEL_FONT,
      maxTextWidth: 190,
      containerTagName: 'div'
    });
    const topCenterButtonBox = new AlignBox(new HBox({
      spacing: 20,
      heightSizable: false,
      preferredHeight: returnBodiesButton.height,
      children: [returnBodiesButton, offScaleMessage]
    }), {
      alignBoundsProperty: this.availableBoundsProperty,
      margin: SolarSystemCommonConstants.MARGIN,
      centerX: -checkboxesControlPanel.width / 2,
      xAlign: 'center',
      yAlign: 'top'
    });
    this.interfaceLayer.addChild(topCenterButtonBox);
    this.interfaceLayer.addChild(resetAlignBox);
    this.interfaceLayer.addChild(controlsAlignBox);
    this.interfaceLayer.addChild(new AlignBox(this.topRightControlBox, {
      alignBoundsProperty: this.availableBoundsProperty,
      margin: SolarSystemCommonConstants.MARGIN,
      xAlign: 'right',
      yAlign: 'top'
    }));
    this.interfaceLayer.addChild(zoomButtonsBox);

    // ZoomBox should be first in the PDOM Order
    this.interfaceLayer.pdomOrder = [labModeComboBox, this.timeBox, topCenterButtonBox, dataGridbox, checkboxesControlPanel, this.zoomButtons, this.resetAllButton];
    this.bottomLayer.addChild(new PathsCanvasNode(model.bodies, this.modelViewTransformProperty, this.visibleBoundsProperty, {
      visibleProperty: model.pathVisibleProperty
    }));
  }
  constrainBoundaryViewPoint(point, radius) {
    if (!_.every([this.topRightControlBox, this.zoomButtons, this.dataPanelTopRow, this.fullDataPanel, this.numberSpinnerBox, this.followCenterOfMassButton, this.dragDebugPath])) {
      return point;
    }
    const mvt = this.modelViewTransformProperty.value;
    const expandToTop = bounds => bounds.withMinY(this.layoutBounds.minY);
    const expandToBottom = bounds => bounds.withMaxY(this.layoutBounds.maxY);
    const expandToLeft = bounds => bounds.withMinX(this.visibleBoundsProperty.value.minX);
    const expandToRight = bounds => bounds.withMaxX(this.visibleBoundsProperty.value.maxX);

    // Use visible bounds (horizontally) and layout bounds (vertically) to create the main shape
    const shape = Shape.bounds(mvt.viewToModelBounds(expandToLeft(expandToRight(this.layoutBounds)).eroded(radius)))
    // Top-right controls
    .shapeDifference(Shape.bounds(mvt.viewToModelBounds(expandToTop(expandToRight(this.topRightControlBox.bounds)).dilated(radius))))
    // Zoom buttons
    .shapeDifference(Shape.bounds(mvt.viewToModelBounds(expandToTop(expandToLeft(this.zoomButtons.bounds)).dilated(radius))))
    // Reset all button
    .shapeDifference(Shape.bounds(mvt.viewToModelBounds(expandToBottom(expandToRight(this.resetAllButton.bounds)).dilated(radius))))
    // Bottom-left controls, all with individual scopes (all expanded bottom-left)
    .shapeDifference(Shape.union([this.dataPanelTopRow, this.fullDataPanel, this.numberSpinnerBox, this.followCenterOfMassButton].map(item => {
      const viewBounds = expandToLeft(expandToBottom(this.boundsOf(item)));
      const modelBounds = mvt.viewToModelBounds(viewBounds.dilated(radius));
      return Shape.bounds(modelBounds);
    })));

    // Only show drag debug path if ?dev is specified, temporarily for https://github.com/phetsims/my-solar-system/issues/129
    if (phet.chipper.queryParameters.dev) {
      this.dragDebugPath.shape = mvt.modelToViewShape(shape);
    }
    if (shape.containsPoint(point)) {
      return point;
    } else {
      return shape.getClosestPoint(point);
    }
  }
  step(dt) {
    super.step(dt);
    this.bodyNodeSynchronizer.getViews().forEach(bodyNode => {
      if (this.model.isPlayingProperty.value) {
        bodyNode.playSound();
      } else {
        bodyNode.stopSound();
      }
    });
  }
}
mySolarSystem.register('MySolarSystemScreenView', MySolarSystemScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbGlnbkJveCIsIkhCb3giLCJOb2RlIiwiUGF0aCIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJQYW5lbCIsIlNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIiwiTXlTb2xhclN5c3RlbUNvbnRyb2xzIiwibXlTb2xhclN5c3RlbSIsImNvbWJpbmVPcHRpb25zIiwiU29sYXJTeXN0ZW1Db21tb25TY3JlZW5WaWV3IiwiTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIiwiU29sYXJTeXN0ZW1Db21tb25DaGVja2JveCIsIkZ1bGxEYXRhUGFuZWwiLCJNeVNvbGFyU3lzdGVtU3RyaW5ncyIsIk51bWJlclNwaW5uZXIiLCJUaW55UHJvcGVydHkiLCJSYW5nZSIsIlZpZXdTeW5jaHJvbml6ZXIiLCJCb2R5Tm9kZSIsIlZlY3Rvck5vZGUiLCJQaGV0Q29sb3JTY2hlbWUiLCJEZXJpdmVkUHJvcGVydHkiLCJEaWFsb2ciLCJJbmZvQnV0dG9uIiwiUGF0aHNDYW52YXNOb2RlIiwiUGhldEZvbnQiLCJDZW50ZXJPZk1hc3NOb2RlIiwiTGFiTW9kZUNvbWJvQm94IiwiVGV4dFB1c2hCdXR0b24iLCJUYW5kZW0iLCJTb2xhclN5c3RlbUNvbW1vblN0cmluZ3MiLCJTaGFwZSIsIlZlY3RvcjIiLCJudWxsU291bmRQbGF5ZXIiLCJNeVNvbGFyU3lzdGVtU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJwcm92aWRlZE9wdGlvbnMiLCJjZW50ZXJPcmJpdE9mZnNldCIsIkdSSURfU1BBQ0lORyIsImRyYWdEZWJ1Z1BhdGgiLCJzdHJva2UiLCJmaWxsIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJkZXYiLCJhZGRDaGlsZCIsImJvZHlOb2RlU3luY2hyb25pemVyIiwiYm9kaWVzTGF5ZXIiLCJib2R5IiwiYm9keU5vZGUiLCJtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSIsInZhbHVlc1Zpc2libGVQcm9wZXJ0eSIsIm1hcFBvc2l0aW9uIiwiY29uc3RyYWluQm91bmRhcnlWaWV3UG9pbnQiLCJiaW5kIiwic291bmRWaWV3Tm9kZSIsInZlbG9jaXR5VmVjdG9yU3luY2hyb25pemVyIiwiY29tcG9uZW50c0xheWVyIiwiY3JlYXRlRHJhZ2dhYmxlVmVjdG9yTm9kZSIsImZvcmNlVmVjdG9yU3luY2hyb25pemVyIiwiZ3Jhdml0eVZpc2libGVQcm9wZXJ0eSIsImZvcmNlUHJvcGVydHkiLCJmb3JjZVNjYWxlUHJvcGVydHkiLCJHUkFWSVRBVElPTkFMX0ZPUkNFIiwiY29uc3RyYWluU2l6ZSIsInRyYWNrZXJzIiwiYm9kaWVzIiwiZm9yRWFjaCIsInRyYWNrZXIiLCJhZGQiLCJlbGVtZW50QWRkZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJlbGVtZW50UmVtb3ZlZEVtaXR0ZXIiLCJyZW1vdmUiLCJjZW50ZXJPZk1hc3NOb2RlIiwiY2VudGVyT2ZNYXNzIiwiem9vbUJ1dHRvbnMiLCJ6b29tTGV2ZWxQcm9wZXJ0eSIsInNwYWNpbmciLCJtYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucyIsImdsYXNzUmFkaXVzIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibGFiTW9kZUNvbWJvQm94IiwidG9wTGF5ZXIiLCJ3aWR0aFNpemFibGUiLCJsYXlvdXRPcHRpb25zIiwiYWxpZ24iLCJjaGVja2JveGVzQ29udHJvbFBhbmVsIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwidG9wUmlnaHRDb250cm9sQm94Iiwic3RyZXRjaCIsImNoaWxkcmVuIiwidmlzaWJsZSIsImlzTGFiIiwiQ09OVFJPTF9QQU5FTF9PUFRJT05TIiwidGltZUJveCIsImZ1bGxEYXRhUGFuZWwiLCJmb2xsb3dDZW50ZXJPZk1hc3NCdXR0b24iLCJmb2xsb3dDZW50ZXJPZk1hc3NTdHJpbmdQcm9wZXJ0eSIsInZpc2libGVQcm9wZXJ0eSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJsaXN0ZW5lciIsInN5c3RlbUNlbnRlcmVkUHJvcGVydHkiLCJ2YWx1ZSIsIkNIRUNLQk9YX1NQQUNJTkciLCJmb250IiwiUEFORUxfRk9OVCIsIm1heFRleHRXaWR0aCIsImJhc2VDb2xvciIsIm51bWJlclNwaW5uZXJUYW5kZW0iLCJPUFRfT1VUIiwibnVtYmVyU3Bpbm5lckJveCIsImRhdGFQYW5lbCIsImJvZGllc1N0cmluZ1Byb3BlcnR5IiwibWF4V2lkdGgiLCJURVhUX09QVElPTlMiLCJudW1iZXJPZkFjdGl2ZUJvZGllc1Byb3BlcnR5IiwiTlVNX0JPRElFUyIsImRlbHRhVmFsdWUiLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFZRGlsYXRpb24iLCJhcnJvd3NQb3NpdGlvbiIsImFycm93c1NvdW5kUGxheWVyIiwibnVtYmVyRGlzcGxheU9wdGlvbnMiLCJkZWNpbWFsUGxhY2VzIiwieE1hcmdpbiIsInlNYXJnaW4iLCJ0ZXh0T3B0aW9ucyIsImFjY2Vzc2libGVOYW1lIiwiYTExeSIsIm51bWJlck9mQm9kaWVzU3RyaW5nUHJvcGVydHkiLCJpbmZvQnV0dG9uVGFuZGVtIiwibW9yZURhdGFDaGVja2JveFRhbmRlbSIsImRhdGFQYW5lbFRvcFJvdyIsIm1vcmVEYXRhUHJvcGVydHkiLCJtb3JlRGF0YVN0cmluZ1Byb3BlcnR5IiwiQ0hFQ0tCT1hfT1BUSU9OUyIsImluZm9TdHJpbmdQcm9wZXJ0eSIsInNjYWxlIiwiaWNvbkZpbGwiLCJ0b3VjaEFyZWFEaWxhdGlvbiIsInVuaXRzRGlhbG9nIiwic2hvdyIsIm5vdGVzU3RyaW5nUHJvcGVydHkiLCJ1bml0c0luZm8iLCJjb250ZW50U3RyaW5nUHJvcGVydHkiLCJjb250ZW50MlN0cmluZ1Byb3BlcnR5IiwiY29udGVudDNTdHJpbmdQcm9wZXJ0eSIsImNvbnRlbnQiLCJjb250ZW50MiIsImNvbnRlbnQzIiwibGluZVdyYXAiLCJ0aXRsZUFsaWduIiwidGl0bGUiLCJ0aXRsZVN0cmluZ1Byb3BlcnR5IiwiZGF0YUdyaWRib3giLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiY29udHJvbHNBbGlnbkJveCIsImFsaWduQm91bmRzUHJvcGVydHkiLCJhdmFpbGFibGVCb3VuZHNQcm9wZXJ0eSIsIm1hcmdpbiIsIk1BUkdJTiIsInhBbGlnbiIsInlBbGlnbiIsInJlc2V0QWxpZ25Cb3giLCJyZXNldEFsbEJ1dHRvbiIsInpvb21CdXR0b25zQm94Iiwib2ZmU2NhbGVNZXNzYWdlIiwib2Zmc2NhbGVNZXNzYWdlU3RyaW5nUHJvcGVydHkiLCJhbmQiLCJpc0FueUZvcmNlT2Zmc2NhbGVQcm9wZXJ0eSIsIlRFWFRfTUFYX1dJRFRIIiwicmV0dXJuQm9kaWVzQnV0dG9uIiwicmV0dXJuQm9kaWVzU3RyaW5nUHJvcGVydHkiLCJpc0FueUJvZHlFc2NhcGVkUHJvcGVydHkiLCJyZXN0YXJ0IiwiY29udGFpbmVyVGFnTmFtZSIsInRvcENlbnRlckJ1dHRvbkJveCIsImhlaWdodFNpemFibGUiLCJwcmVmZXJyZWRIZWlnaHQiLCJoZWlnaHQiLCJjZW50ZXJYIiwid2lkdGgiLCJpbnRlcmZhY2VMYXllciIsInBkb21PcmRlciIsImJvdHRvbUxheWVyIiwidmlzaWJsZUJvdW5kc1Byb3BlcnR5IiwicGF0aFZpc2libGVQcm9wZXJ0eSIsInBvaW50IiwicmFkaXVzIiwiXyIsImV2ZXJ5IiwibXZ0IiwiZXhwYW5kVG9Ub3AiLCJib3VuZHMiLCJ3aXRoTWluWSIsImxheW91dEJvdW5kcyIsIm1pblkiLCJleHBhbmRUb0JvdHRvbSIsIndpdGhNYXhZIiwibWF4WSIsImV4cGFuZFRvTGVmdCIsIndpdGhNaW5YIiwibWluWCIsImV4cGFuZFRvUmlnaHQiLCJ3aXRoTWF4WCIsIm1heFgiLCJzaGFwZSIsInZpZXdUb01vZGVsQm91bmRzIiwiZXJvZGVkIiwic2hhcGVEaWZmZXJlbmNlIiwiZGlsYXRlZCIsInVuaW9uIiwibWFwIiwiaXRlbSIsInZpZXdCb3VuZHMiLCJib3VuZHNPZiIsIm1vZGVsQm91bmRzIiwibW9kZWxUb1ZpZXdTaGFwZSIsImNvbnRhaW5zUG9pbnQiLCJnZXRDbG9zZXN0UG9pbnQiLCJzdGVwIiwiZHQiLCJnZXRWaWV3cyIsImlzUGxheWluZ1Byb3BlcnR5IiwicGxheVNvdW5kIiwic3RvcFNvdW5kIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNeVNvbGFyU3lzdGVtU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY3JlZW4gdmlldyBmb3IgdGhlIE15IFNvbGFyIFN5c3RlbSBTY3JlZW5cclxuICpcclxuICogQGF1dGhvciBBZ3VzdMOtbiBWYWxsZWpvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IEFsaWduQm94LCBIQm94LCBOb2RlLCBQYXRoLCBSaWNoVGV4dCwgVGV4dCwgVGV4dE9wdGlvbnMsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgTXlTb2xhclN5c3RlbUNvbnRyb2xzIGZyb20gJy4vTXlTb2xhclN5c3RlbUNvbnRyb2xzLmpzJztcclxuaW1wb3J0IG15U29sYXJTeXN0ZW0gZnJvbSAnLi4vLi4vbXlTb2xhclN5c3RlbS5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTb2xhclN5c3RlbUNvbW1vblNjcmVlblZpZXcsIHsgU29sYXJTeXN0ZW1Db21tb25TY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvdmlldy9Tb2xhclN5c3RlbUNvbW1vblNjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgTWFnbmlmeWluZ0dsYXNzWm9vbUJ1dHRvbkdyb3VwIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgU29sYXJTeXN0ZW1Db21tb25DaGVja2JveCBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL3ZpZXcvU29sYXJTeXN0ZW1Db21tb25DaGVja2JveC5qcyc7XHJcbmltcG9ydCBGdWxsRGF0YVBhbmVsIGZyb20gJy4vRnVsbERhdGFQYW5lbC5qcyc7XHJcbmltcG9ydCBNeVNvbGFyU3lzdGVtU3RyaW5ncyBmcm9tICcuLi8uLi9NeVNvbGFyU3lzdGVtU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBOdW1iZXJTcGlubmVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJTcGlubmVyLmpzJztcclxuaW1wb3J0IFRpbnlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RpbnlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmlld1N5bmNocm9uaXplciBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvVmlld1N5bmNocm9uaXplci5qcyc7XHJcbmltcG9ydCBCb2R5IGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvbW9kZWwvQm9keS5qcyc7XHJcbmltcG9ydCBCb2R5Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL3ZpZXcvQm9keU5vZGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zb2xhci1zeXN0ZW0tY29tbW9uL2pzL3ZpZXcvVmVjdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGlhbG9nIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9EaWFsb2cuanMnO1xyXG5pbXBvcnQgSW5mb0J1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9JbmZvQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQ2hlY2tib3hPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFBhdGhzQ2FudmFzTm9kZSBmcm9tICcuL1BhdGhzQ2FudmFzTm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgTXlTb2xhclN5c3RlbU1vZGVsIGZyb20gJy4uL21vZGVsL015U29sYXJTeXN0ZW1Nb2RlbC5qcyc7XHJcbmltcG9ydCBDZW50ZXJPZk1hc3NOb2RlIGZyb20gJy4vQ2VudGVyT2ZNYXNzTm9kZS5qcyc7XHJcbmltcG9ydCBMYWJNb2RlQ29tYm9Cb3ggZnJvbSAnLi9MYWJNb2RlQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgVGV4dFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvVGV4dFB1c2hCdXR0b24uanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzIGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvU29sYXJTeXN0ZW1Db21tb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IG51bGxTb3VuZFBsYXllciBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zaGFyZWQtc291bmQtcGxheWVycy9udWxsU291bmRQbGF5ZXIuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgSW50cm9MYWJTY3JlZW5WaWV3T3B0aW9ucyA9IFNvbGFyU3lzdGVtQ29tbW9uU2NyZWVuVmlld09wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNeVNvbGFyU3lzdGVtU2NyZWVuVmlldyBleHRlbmRzIFNvbGFyU3lzdGVtQ29tbW9uU2NyZWVuVmlldyB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYm9keU5vZGVTeW5jaHJvbml6ZXI6IFZpZXdTeW5jaHJvbml6ZXI8Qm9keSwgQm9keU5vZGU+O1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHRvcFJpZ2h0Q29udHJvbEJveDogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHpvb21CdXR0b25zOiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGF0YVBhbmVsVG9wUm93OiBOb2RlO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZnVsbERhdGFQYW5lbDogTm9kZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IG51bWJlclNwaW5uZXJCb3g6IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBmb2xsb3dDZW50ZXJPZk1hc3NCdXR0b246IE5vZGU7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBkcmFnRGVidWdQYXRoOiBQYXRoO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1vZGVsOiBNeVNvbGFyU3lzdGVtTW9kZWwsIHByb3ZpZGVkT3B0aW9uczogSW50cm9MYWJTY3JlZW5WaWV3T3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCBtb2RlbCwge1xyXG4gICAgICBjZW50ZXJPcmJpdE9mZnNldDogbmV3IFZlY3RvcjIoIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLkdSSURfU1BBQ0lORywgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuR1JJRF9TUEFDSU5HICksXHJcbiAgICAgIC4uLnByb3ZpZGVkT3B0aW9uc1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEJvZHkgYW5kIEFycm93cyBDcmVhdGlvbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgICAvLyBTZXR0aW5nIHRoZSBGYWN0b3J5IGZ1bmN0aW9ucyB0aGF0IHdpbGwgY3JlYXRlIHRoZSBuZWNlc3NhcnkgTm9kZXNcclxuXHJcbiAgICB0aGlzLmRyYWdEZWJ1Z1BhdGggPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBzdHJva2U6ICdyZWQnLFxyXG4gICAgICBmaWxsOiAncmdiYSgyNTUsMCwwLDAuMiknXHJcbiAgICB9ICk7XHJcbiAgICBpZiAoIHBoZXQuY2hpcHBlci5xdWVyeVBhcmFtZXRlcnMuZGV2ICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmRyYWdEZWJ1Z1BhdGggKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJvZHlOb2RlU3luY2hyb25pemVyID0gbmV3IFZpZXdTeW5jaHJvbml6ZXIoIHRoaXMuYm9kaWVzTGF5ZXIsICggYm9keTogQm9keSApID0+IHtcclxuICAgICAgY29uc3QgYm9keU5vZGUgPSBuZXcgQm9keU5vZGUoIGJvZHksIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHksIHtcclxuICAgICAgICB2YWx1ZXNWaXNpYmxlUHJvcGVydHk6IG1vZGVsLnZhbHVlc1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgICBtYXBQb3NpdGlvbjogdGhpcy5jb25zdHJhaW5Cb3VuZGFyeVZpZXdQb2ludC5iaW5kKCB0aGlzICksXHJcbiAgICAgICAgc291bmRWaWV3Tm9kZTogdGhpc1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICByZXR1cm4gYm9keU5vZGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdmVsb2NpdHlWZWN0b3JTeW5jaHJvbml6ZXIgPSBuZXcgVmlld1N5bmNocm9uaXplciggdGhpcy5jb21wb25lbnRzTGF5ZXIsIHRoaXMuY3JlYXRlRHJhZ2dhYmxlVmVjdG9yTm9kZSApO1xyXG5cclxuICAgIGNvbnN0IGZvcmNlVmVjdG9yU3luY2hyb25pemVyID0gbmV3IFZpZXdTeW5jaHJvbml6ZXIoIHRoaXMuY29tcG9uZW50c0xheWVyLCAoIGJvZHk6IEJvZHkgKSA9PlxyXG4gICAgICBuZXcgVmVjdG9yTm9kZSggYm9keSwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSwgbW9kZWwuZ3Jhdml0eVZpc2libGVQcm9wZXJ0eSwgYm9keS5mb3JjZVByb3BlcnR5LCBtb2RlbC5mb3JjZVNjYWxlUHJvcGVydHksIHtcclxuICAgICAgICBmaWxsOiBQaGV0Q29sb3JTY2hlbWUuR1JBVklUQVRJT05BTF9GT1JDRSxcclxuICAgICAgICBjb25zdHJhaW5TaXplOiB0cnVlXHJcbiAgICAgIH0gKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUaGUgVmlld1N5bmNocm9uaXplcnMgaGFuZGxlIHRoZSBjcmVhdGlvbiBhbmQgZGlzcG9zYWwgb2YgTW9kZWwtVmlldyBwYWlyc1xyXG4gICAgY29uc3QgdHJhY2tlcnMgPSBbXHJcbiAgICAgIHRoaXMuYm9keU5vZGVTeW5jaHJvbml6ZXIsIHZlbG9jaXR5VmVjdG9yU3luY2hyb25pemVyLCBmb3JjZVZlY3RvclN5bmNocm9uaXplclxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYm9keU5vZGVzIGFuZCBhcnJvd3MgZm9yIGV2ZXJ5IGJvZHlcclxuICAgIG1vZGVsLmJvZGllcy5mb3JFYWNoKCBib2R5ID0+IHRyYWNrZXJzLmZvckVhY2goIHRyYWNrZXIgPT4gdHJhY2tlci5hZGQoIGJvZHkgKSApICk7XHJcblxyXG4gICAgLy8gU2V0IHVwIGxpc3RlbmVycyBmb3Igb2JqZWN0IGNyZWF0aW9uIGFuZCBkaXNwb3NhbFxyXG4gICAgbW9kZWwuYm9kaWVzLmVsZW1lbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGJvZHkgPT4ge1xyXG4gICAgICB0cmFja2Vycy5mb3JFYWNoKCB0cmFja2VyID0+IHRyYWNrZXIuYWRkKCBib2R5ICkgKTtcclxuICAgIH0gKTtcclxuICAgIG1vZGVsLmJvZGllcy5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGJvZHkgPT4ge1xyXG4gICAgICB0cmFja2Vycy5mb3JFYWNoKCB0cmFja2VyID0+IHRyYWNrZXIucmVtb3ZlKCBib2R5ICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDZW50ZXIgb2YgTWFzcyBOb2RlXHJcbiAgICBjb25zdCBjZW50ZXJPZk1hc3NOb2RlID0gbmV3IENlbnRlck9mTWFzc05vZGUoIG1vZGVsLmNlbnRlck9mTWFzcywgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSApO1xyXG4gICAgdGhpcy5jb21wb25lbnRzTGF5ZXIuYWRkQ2hpbGQoIGNlbnRlck9mTWFzc05vZGUgKTtcclxuXHJcblxyXG4gICAgLy8gVUkgRWxlbWVudHMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gICAgLy8gWm9vbSBCdXR0b25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgdGhpcy56b29tQnV0dG9ucyA9IG5ldyBNYWduaWZ5aW5nR2xhc3Nab29tQnV0dG9uR3JvdXAoXHJcbiAgICAgIG1vZGVsLnpvb21MZXZlbFByb3BlcnR5LFxyXG4gICAgICB7XHJcbiAgICAgICAgc3BhY2luZzogOCxcclxuICAgICAgICBtYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9uczoge1xyXG4gICAgICAgICAgZ2xhc3NSYWRpdXM6IDhcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDVcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxhYk1vZGVDb21ib0JveCA9IG5ldyBMYWJNb2RlQ29tYm9Cb3goIG1vZGVsLCB0aGlzLnRvcExheWVyLCB7XHJcbiAgICAgIHdpZHRoU2l6YWJsZTogZmFsc2UsXHJcbiAgICAgIGxheW91dE9wdGlvbnM6IHtcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcidcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNoZWNrYm94ZXNDb250cm9sUGFuZWwgPSBuZXcgTXlTb2xhclN5c3RlbUNvbnRyb2xzKCBtb2RlbCwgdGhpcy50b3BMYXllciwge1xyXG4gICAgICB0YW5kZW06IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udHJvbFBhbmVsJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy50b3BSaWdodENvbnRyb2xCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBzcGFjaW5nOiA3LjUsXHJcbiAgICAgIHN0cmV0Y2g6IHRydWUsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFBhbmVsKCBuZXcgTm9kZSggeyBjaGlsZHJlbjogWyBsYWJNb2RlQ29tYm9Cb3ggXSwgdmlzaWJsZTogbW9kZWwuaXNMYWIgfSApLCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5DT05UUk9MX1BBTkVMX09QVElPTlMgKSxcclxuICAgICAgICB0aGlzLnRpbWVCb3gsXHJcbiAgICAgICAgbmV3IFBhbmVsKCBjaGVja2JveGVzQ29udHJvbFBhbmVsLCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5DT05UUk9MX1BBTkVMX09QVElPTlMgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRnVsbCBEYXRhIFBhbmVsIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICB0aGlzLmZ1bGxEYXRhUGFuZWwgPSBuZXcgRnVsbERhdGFQYW5lbCggbW9kZWwgKTtcclxuXHJcbiAgICB0aGlzLmZvbGxvd0NlbnRlck9mTWFzc0J1dHRvbiA9IG5ldyBUZXh0UHVzaEJ1dHRvbiggTXlTb2xhclN5c3RlbVN0cmluZ3MuZm9sbG93Q2VudGVyT2ZNYXNzU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC51c2VyQ29udHJvbGxlZFByb3BlcnR5LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLnN5c3RlbUNlbnRlcmVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIG1vZGVsLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgfSxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLkNIRUNLQk9YX1NQQUNJTkcgLyAyLFxyXG4gICAgICBmb250OiBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5QQU5FTF9GT05ULFxyXG4gICAgICBtYXhUZXh0V2lkdGg6IDIwMCxcclxuICAgICAgYmFzZUNvbG9yOiAnb3JhbmdlJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG51bWJlclNwaW5uZXJUYW5kZW0gPSBtb2RlbC5pc0xhYiA/IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyU3Bpbm5lcicgKSA6IFRhbmRlbS5PUFRfT1VUO1xyXG5cclxuICAgIHRoaXMubnVtYmVyU3Bpbm5lckJveCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFRleHQoIE15U29sYXJTeXN0ZW1TdHJpbmdzLmRhdGFQYW5lbC5ib2RpZXNTdHJpbmdQcm9wZXJ0eSwgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICBtYXhXaWR0aDogNzBcclxuICAgICAgICB9LCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5URVhUX09QVElPTlMgKSApLFxyXG4gICAgICAgIG5ldyBOdW1iZXJTcGlubmVyKCBtb2RlbC5udW1iZXJPZkFjdGl2ZUJvZGllc1Byb3BlcnR5LCBuZXcgVGlueVByb3BlcnR5KCBuZXcgUmFuZ2UoIDEsIFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLk5VTV9CT0RJRVMgKSApLFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBkZWx0YVZhbHVlOiAxLFxyXG4gICAgICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDIwLFxyXG4gICAgICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDEwLFxyXG4gICAgICAgICAgICBtb3VzZUFyZWFYRGlsYXRpb246IDEwLFxyXG4gICAgICAgICAgICBtb3VzZUFyZWFZRGlsYXRpb246IDUsXHJcbiAgICAgICAgICAgIGFycm93c1Bvc2l0aW9uOiAnYm90aFJpZ2h0JyxcclxuICAgICAgICAgICAgYXJyb3dzU291bmRQbGF5ZXI6IG51bGxTb3VuZFBsYXllcixcclxuICAgICAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBkZWNpbWFsUGxhY2VzOiAwLFxyXG4gICAgICAgICAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgICAgICAgICB5TWFyZ2luOiAzLFxyXG4gICAgICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDI4IClcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFjY2Vzc2libGVOYW1lOiBNeVNvbGFyU3lzdGVtU3RyaW5ncy5hMTF5Lm51bWJlck9mQm9kaWVzU3RyaW5nUHJvcGVydHlcclxuICAgICAgICAgIH0gKVxyXG4gICAgICBdLFxyXG4gICAgICB2aXNpYmxlOiBtb2RlbC5pc0xhYixcclxuICAgICAgc3BhY2luZzogNSxcclxuICAgICAgdGFuZGVtOiBudW1iZXJTcGlubmVyVGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaW5mb0J1dHRvblRhbmRlbSA9IG1vZGVsLmlzTGFiID8gcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd1bml0c0luZm9CdXR0b24nICkgOiBUYW5kZW0uT1BUX09VVDtcclxuICAgIGNvbnN0IG1vcmVEYXRhQ2hlY2tib3hUYW5kZW0gPSBtb2RlbC5pc0xhYiA/IHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbW9yZURhdGFDaGVja2JveCcgKSA6IFRhbmRlbS5PUFRfT1VUO1xyXG5cclxuICAgIHRoaXMuZGF0YVBhbmVsVG9wUm93ID0gbmV3IEhCb3goIHtcclxuICAgICAgc3RyZXRjaDogdHJ1ZSxcclxuICAgICAgdmlzaWJsZTogbW9kZWwuaXNMYWIsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFNvbGFyU3lzdGVtQ29tbW9uQ2hlY2tib3goXHJcbiAgICAgICAgICBtb2RlbC5tb3JlRGF0YVByb3BlcnR5LFxyXG4gICAgICAgICAgbmV3IFRleHQoIE15U29sYXJTeXN0ZW1TdHJpbmdzLmRhdGFQYW5lbC5tb3JlRGF0YVN0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgbWF4V2lkdGg6IDMwMFxyXG4gICAgICAgICAgfSwgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVEVYVF9PUFRJT05TICkgKSxcclxuICAgICAgICAgIGNvbWJpbmVPcHRpb25zPENoZWNrYm94T3B0aW9ucz4oIHtcclxuICAgICAgICAgICAgYWNjZXNzaWJsZU5hbWU6IE15U29sYXJTeXN0ZW1TdHJpbmdzLmExMXkubW9yZURhdGFTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAxMCxcclxuICAgICAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMCxcclxuICAgICAgICAgICAgdGFuZGVtOiBtb3JlRGF0YUNoZWNrYm94VGFuZGVtXHJcbiAgICAgICAgICB9LCBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5DSEVDS0JPWF9PUFRJT05TIClcclxuICAgICAgICApLFxyXG4gICAgICAgIG5ldyBJbmZvQnV0dG9uKCB7XHJcbiAgICAgICAgICBhY2Nlc3NpYmxlTmFtZTogTXlTb2xhclN5c3RlbVN0cmluZ3MuYTExeS5pbmZvU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgICBzY2FsZTogMC41LFxyXG4gICAgICAgICAgaWNvbkZpbGw6ICdyZ2IoIDQxLCAxMDYsIDE2MyApJyxcclxuICAgICAgICAgIHRvdWNoQXJlYURpbGF0aW9uOiAyMCxcclxuICAgICAgICAgIGxpc3RlbmVyOiAoKSA9PiB1bml0c0RpYWxvZy5zaG93KCksXHJcbiAgICAgICAgICB0YW5kZW06IGluZm9CdXR0b25UYW5kZW1cclxuICAgICAgICB9IClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG5vdGVzU3RyaW5nUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbXHJcbiAgICAgICAgTXlTb2xhclN5c3RlbVN0cmluZ3MudW5pdHNJbmZvLmNvbnRlbnRTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBNeVNvbGFyU3lzdGVtU3RyaW5ncy51bml0c0luZm8uY29udGVudDJTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgICBNeVNvbGFyU3lzdGVtU3RyaW5ncy51bml0c0luZm8uY29udGVudDNTdHJpbmdQcm9wZXJ0eVxyXG4gICAgICBdLFxyXG4gICAgICAoIGNvbnRlbnQsIGNvbnRlbnQyLCBjb250ZW50MyApID0+IHtcclxuICAgICAgICByZXR1cm4gY29udGVudCArICc8YnI+PGJyPicgKyBjb250ZW50MiArICc8YnI+PGJyPicgKyBjb250ZW50MztcclxuICAgICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHVuaXRzRGlhbG9nID0gbmV3IERpYWxvZyggbmV3IFJpY2hUZXh0KCBub3Rlc1N0cmluZ1Byb3BlcnR5LCB7IGxpbmVXcmFwOiA2MDAgfSApLCB7XHJcbiAgICAgIHRpdGxlQWxpZ246ICdjZW50ZXInLFxyXG4gICAgICB0aXRsZTogbmV3IFRleHQoIE15U29sYXJTeXN0ZW1TdHJpbmdzLnVuaXRzSW5mby50aXRsZVN0cmluZ1Byb3BlcnR5LCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMzIgKSB9ICksXHJcbiAgICAgIHRhbmRlbTogcHJvdmlkZWRPcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd1bml0c0RpYWxvZycgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE1hc3NlcyBQYW5lbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgY29uc3QgZGF0YUdyaWRib3ggPSBuZXcgSEJveCgge1xyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgbGFiZWxUYWdOYW1lOiAnaDMnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6ICdEYXRhIFBhbmVsJyxcclxuICAgICAgYWxpZ246ICdib3R0b20nLFxyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVkJveCgge1xyXG4gICAgICAgICAgc3BhY2luZzogMyxcclxuICAgICAgICAgIHN0cmV0Y2g6IHRydWUsXHJcbiAgICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFQYW5lbFRvcFJvdyxcclxuICAgICAgICAgICAgdGhpcy5mdWxsRGF0YVBhbmVsXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgfSApLFxyXG4gICAgICAgIG5ldyBIQm94KCB7XHJcbiAgICAgICAgICBhbGlnbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICAgIHRoaXMubnVtYmVyU3Bpbm5lckJveCxcclxuICAgICAgICAgICAgdGhpcy5mb2xsb3dDZW50ZXJPZk1hc3NCdXR0b25cclxuICAgICAgICAgIF1cclxuICAgICAgICB9IClcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNvbnRyb2xzQWxpZ25Cb3ggPSBuZXcgQWxpZ25Cb3goIGRhdGFHcmlkYm94LCB7XHJcbiAgICAgIGFsaWduQm91bmRzUHJvcGVydHk6IHRoaXMuYXZhaWxhYmxlQm91bmRzUHJvcGVydHksXHJcbiAgICAgIG1hcmdpbjogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuTUFSR0lOLFxyXG4gICAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgICAgeUFsaWduOiAnYm90dG9tJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHJlc2V0QWxpZ25Cb3ggPSBuZXcgQWxpZ25Cb3goIHRoaXMucmVzZXRBbGxCdXR0b24sIHtcclxuICAgICAgYWxpZ25Cb3VuZHNQcm9wZXJ0eTogdGhpcy5hdmFpbGFibGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgbWFyZ2luOiBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5NQVJHSU4sXHJcbiAgICAgIHhBbGlnbjogJ3JpZ2h0JyxcclxuICAgICAgeUFsaWduOiAnYm90dG9tJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHpvb21CdXR0b25zQm94ID0gbmV3IEFsaWduQm94KCB0aGlzLnpvb21CdXR0b25zLCB7XHJcbiAgICAgIGFsaWduQm91bmRzUHJvcGVydHk6IHRoaXMuYXZhaWxhYmxlQm91bmRzUHJvcGVydHksXHJcbiAgICAgIG1hcmdpbjogU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuTUFSR0lOLFxyXG4gICAgICB4QWxpZ246ICdsZWZ0JyxcclxuICAgICAgeUFsaWduOiAndG9wJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG9mZlNjYWxlTWVzc2FnZSA9IG5ldyBUZXh0KCBTb2xhclN5c3RlbUNvbW1vblN0cmluZ3Mub2Zmc2NhbGVNZXNzYWdlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBEZXJpdmVkUHJvcGVydHkuYW5kKCBbIG1vZGVsLmdyYXZpdHlWaXNpYmxlUHJvcGVydHksIG1vZGVsLmlzQW55Rm9yY2VPZmZzY2FsZVByb3BlcnR5IF0gKSxcclxuICAgICAgICAgIG1heFdpZHRoOiBTb2xhclN5c3RlbUNvbW1vbkNvbnN0YW50cy5URVhUX01BWF9XSURUSCAqIDEuNlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgU29sYXJTeXN0ZW1Db21tb25Db25zdGFudHMuVEVYVF9PUFRJT05TIClcclxuICAgICk7XHJcbiAgICBjb25zdCByZXR1cm5Cb2RpZXNCdXR0b24gPSBuZXcgVGV4dFB1c2hCdXR0b24oIE15U29sYXJTeXN0ZW1TdHJpbmdzLnJldHVybkJvZGllc1N0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuaXNBbnlCb2R5RXNjYXBlZFByb3BlcnR5LFxyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIG1vZGVsLnJlc3RhcnQoKTtcclxuICAgICAgfSxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA1LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDUsXHJcbiAgICAgIGZvbnQ6IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLlBBTkVMX0ZPTlQsXHJcbiAgICAgIG1heFRleHRXaWR0aDogMTkwLFxyXG4gICAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2J1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRvcENlbnRlckJ1dHRvbkJveCA9IG5ldyBBbGlnbkJveCggbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogMjAsXHJcbiAgICAgIGhlaWdodFNpemFibGU6IGZhbHNlLFxyXG4gICAgICBwcmVmZXJyZWRIZWlnaHQ6IHJldHVybkJvZGllc0J1dHRvbi5oZWlnaHQsXHJcbiAgICAgIGNoaWxkcmVuOiBbIHJldHVybkJvZGllc0J1dHRvbiwgb2ZmU2NhbGVNZXNzYWdlIF1cclxuICAgIH0gKSwge1xyXG4gICAgICBhbGlnbkJvdW5kc1Byb3BlcnR5OiB0aGlzLmF2YWlsYWJsZUJvdW5kc1Byb3BlcnR5LFxyXG4gICAgICBtYXJnaW46IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLk1BUkdJTixcclxuICAgICAgY2VudGVyWDogLWNoZWNrYm94ZXNDb250cm9sUGFuZWwud2lkdGggLyAyLFxyXG4gICAgICB4QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICB5QWxpZ246ICd0b3AnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbnRlcmZhY2VMYXllci5hZGRDaGlsZCggdG9wQ2VudGVyQnV0dG9uQm94ICk7XHJcbiAgICB0aGlzLmludGVyZmFjZUxheWVyLmFkZENoaWxkKCByZXNldEFsaWduQm94ICk7XHJcbiAgICB0aGlzLmludGVyZmFjZUxheWVyLmFkZENoaWxkKCBjb250cm9sc0FsaWduQm94ICk7XHJcbiAgICB0aGlzLmludGVyZmFjZUxheWVyLmFkZENoaWxkKCBuZXcgQWxpZ25Cb3goXHJcbiAgICAgIHRoaXMudG9wUmlnaHRDb250cm9sQm94LCB7XHJcbiAgICAgICAgYWxpZ25Cb3VuZHNQcm9wZXJ0eTogdGhpcy5hdmFpbGFibGVCb3VuZHNQcm9wZXJ0eSxcclxuICAgICAgICBtYXJnaW46IFNvbGFyU3lzdGVtQ29tbW9uQ29uc3RhbnRzLk1BUkdJTixcclxuICAgICAgICB4QWxpZ246ICdyaWdodCcsXHJcbiAgICAgICAgeUFsaWduOiAndG9wJ1xyXG4gICAgICB9ICkgKTtcclxuICAgIHRoaXMuaW50ZXJmYWNlTGF5ZXIuYWRkQ2hpbGQoIHpvb21CdXR0b25zQm94ICk7XHJcblxyXG4gICAgLy8gWm9vbUJveCBzaG91bGQgYmUgZmlyc3QgaW4gdGhlIFBET00gT3JkZXJcclxuICAgIHRoaXMuaW50ZXJmYWNlTGF5ZXIucGRvbU9yZGVyID0gW1xyXG4gICAgICBsYWJNb2RlQ29tYm9Cb3gsXHJcbiAgICAgIHRoaXMudGltZUJveCxcclxuICAgICAgdG9wQ2VudGVyQnV0dG9uQm94LFxyXG4gICAgICBkYXRhR3JpZGJveCxcclxuICAgICAgY2hlY2tib3hlc0NvbnRyb2xQYW5lbCxcclxuICAgICAgdGhpcy56b29tQnV0dG9ucyxcclxuICAgICAgdGhpcy5yZXNldEFsbEJ1dHRvblxyXG4gICAgXTtcclxuXHJcblxyXG4gICAgdGhpcy5ib3R0b21MYXllci5hZGRDaGlsZCggbmV3IFBhdGhzQ2FudmFzTm9kZSggbW9kZWwuYm9kaWVzLCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eSwge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IG1vZGVsLnBhdGhWaXNpYmxlUHJvcGVydHlcclxuICAgIH0gKSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvbnN0cmFpbkJvdW5kYXJ5Vmlld1BvaW50KCBwb2ludDogVmVjdG9yMiwgcmFkaXVzOiBudW1iZXIgKTogVmVjdG9yMiB7XHJcblxyXG4gICAgaWYgKCAhXy5ldmVyeSggW1xyXG4gICAgICB0aGlzLnRvcFJpZ2h0Q29udHJvbEJveCxcclxuICAgICAgdGhpcy56b29tQnV0dG9ucyxcclxuICAgICAgdGhpcy5kYXRhUGFuZWxUb3BSb3csXHJcbiAgICAgIHRoaXMuZnVsbERhdGFQYW5lbCxcclxuICAgICAgdGhpcy5udW1iZXJTcGlubmVyQm94LFxyXG4gICAgICB0aGlzLmZvbGxvd0NlbnRlck9mTWFzc0J1dHRvbixcclxuICAgICAgdGhpcy5kcmFnRGVidWdQYXRoXHJcbiAgICBdICkgKSB7XHJcbiAgICAgIHJldHVybiBwb2ludDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgY29uc3QgbXZ0ID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBjb25zdCBleHBhbmRUb1RvcCA9ICggYm91bmRzOiBCb3VuZHMyICkgPT4gYm91bmRzLndpdGhNaW5ZKCB0aGlzLmxheW91dEJvdW5kcy5taW5ZICk7XHJcbiAgICBjb25zdCBleHBhbmRUb0JvdHRvbSA9ICggYm91bmRzOiBCb3VuZHMyICkgPT4gYm91bmRzLndpdGhNYXhZKCB0aGlzLmxheW91dEJvdW5kcy5tYXhZICk7XHJcbiAgICBjb25zdCBleHBhbmRUb0xlZnQgPSAoIGJvdW5kczogQm91bmRzMiApID0+IGJvdW5kcy53aXRoTWluWCggdGhpcy52aXNpYmxlQm91bmRzUHJvcGVydHkudmFsdWUubWluWCApO1xyXG4gICAgY29uc3QgZXhwYW5kVG9SaWdodCA9ICggYm91bmRzOiBCb3VuZHMyICkgPT4gYm91bmRzLndpdGhNYXhYKCB0aGlzLnZpc2libGVCb3VuZHNQcm9wZXJ0eS52YWx1ZS5tYXhYICk7XHJcblxyXG4gICAgLy8gVXNlIHZpc2libGUgYm91bmRzIChob3Jpem9udGFsbHkpIGFuZCBsYXlvdXQgYm91bmRzICh2ZXJ0aWNhbGx5KSB0byBjcmVhdGUgdGhlIG1haW4gc2hhcGVcclxuICAgIGNvbnN0IHNoYXBlID0gU2hhcGUuYm91bmRzKCBtdnQudmlld1RvTW9kZWxCb3VuZHMoIGV4cGFuZFRvTGVmdCggZXhwYW5kVG9SaWdodCggdGhpcy5sYXlvdXRCb3VuZHMgKSApLmVyb2RlZCggcmFkaXVzICkgKSApXHJcbiAgICAgIC8vIFRvcC1yaWdodCBjb250cm9sc1xyXG4gICAgICAuc2hhcGVEaWZmZXJlbmNlKCBTaGFwZS5ib3VuZHMoIG12dC52aWV3VG9Nb2RlbEJvdW5kcyggZXhwYW5kVG9Ub3AoIGV4cGFuZFRvUmlnaHQoIHRoaXMudG9wUmlnaHRDb250cm9sQm94LmJvdW5kcyApICkuZGlsYXRlZCggcmFkaXVzICkgKSApIClcclxuICAgICAgLy8gWm9vbSBidXR0b25zXHJcbiAgICAgIC5zaGFwZURpZmZlcmVuY2UoIFNoYXBlLmJvdW5kcyggbXZ0LnZpZXdUb01vZGVsQm91bmRzKCBleHBhbmRUb1RvcCggZXhwYW5kVG9MZWZ0KCB0aGlzLnpvb21CdXR0b25zLmJvdW5kcyApICkuZGlsYXRlZCggcmFkaXVzICkgKSApIClcclxuICAgICAgLy8gUmVzZXQgYWxsIGJ1dHRvblxyXG4gICAgICAuc2hhcGVEaWZmZXJlbmNlKCBTaGFwZS5ib3VuZHMoIG12dC52aWV3VG9Nb2RlbEJvdW5kcyggZXhwYW5kVG9Cb3R0b20oIGV4cGFuZFRvUmlnaHQoIHRoaXMucmVzZXRBbGxCdXR0b24uYm91bmRzICkgKS5kaWxhdGVkKCByYWRpdXMgKSApICkgKVxyXG4gICAgICAvLyBCb3R0b20tbGVmdCBjb250cm9scywgYWxsIHdpdGggaW5kaXZpZHVhbCBzY29wZXMgKGFsbCBleHBhbmRlZCBib3R0b20tbGVmdClcclxuICAgICAgLnNoYXBlRGlmZmVyZW5jZSggU2hhcGUudW5pb24oIFtcclxuICAgICAgICB0aGlzLmRhdGFQYW5lbFRvcFJvdyxcclxuICAgICAgICB0aGlzLmZ1bGxEYXRhUGFuZWwsXHJcbiAgICAgICAgdGhpcy5udW1iZXJTcGlubmVyQm94LFxyXG4gICAgICAgIHRoaXMuZm9sbG93Q2VudGVyT2ZNYXNzQnV0dG9uXHJcbiAgICAgIF0ubWFwKCBpdGVtID0+IHtcclxuICAgICAgICBjb25zdCB2aWV3Qm91bmRzID0gZXhwYW5kVG9MZWZ0KCBleHBhbmRUb0JvdHRvbSggdGhpcy5ib3VuZHNPZiggaXRlbSApICkgKTtcclxuICAgICAgICBjb25zdCBtb2RlbEJvdW5kcyA9IG12dC52aWV3VG9Nb2RlbEJvdW5kcyggdmlld0JvdW5kcy5kaWxhdGVkKCByYWRpdXMgKSApO1xyXG4gICAgICAgIHJldHVybiBTaGFwZS5ib3VuZHMoIG1vZGVsQm91bmRzICk7XHJcbiAgICAgIH0gKSApICk7XHJcblxyXG4gICAgLy8gT25seSBzaG93IGRyYWcgZGVidWcgcGF0aCBpZiA/ZGV2IGlzIHNwZWNpZmllZCwgdGVtcG9yYXJpbHkgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9teS1zb2xhci1zeXN0ZW0vaXNzdWVzLzEyOVxyXG4gICAgaWYgKCBwaGV0LmNoaXBwZXIucXVlcnlQYXJhbWV0ZXJzLmRldiApIHtcclxuICAgICAgdGhpcy5kcmFnRGVidWdQYXRoLnNoYXBlID0gbXZ0Lm1vZGVsVG9WaWV3U2hhcGUoIHNoYXBlICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBzaGFwZS5jb250YWluc1BvaW50KCBwb2ludCApICkge1xyXG4gICAgICByZXR1cm4gcG9pbnQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIHNoYXBlLmdldENsb3Nlc3RQb2ludCggcG9pbnQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgc3VwZXIuc3RlcCggZHQgKTtcclxuXHJcbiAgICB0aGlzLmJvZHlOb2RlU3luY2hyb25pemVyLmdldFZpZXdzKCkuZm9yRWFjaCggYm9keU5vZGUgPT4ge1xyXG4gICAgICBpZiAoIHRoaXMubW9kZWwuaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgYm9keU5vZGUucGxheVNvdW5kKCk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYm9keU5vZGUuc3RvcFNvdW5kKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm15U29sYXJTeXN0ZW0ucmVnaXN0ZXIoICdNeVNvbGFyU3lzdGVtU2NyZWVuVmlldycsIE15U29sYXJTeXN0ZW1TY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxJQUFJLEVBQWVDLElBQUksUUFBUSxtQ0FBbUM7QUFDakgsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQywwQkFBMEIsTUFBTSxrRUFBa0U7QUFDekcsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFDbEQsU0FBU0MsY0FBYyxRQUFRLHVDQUF1QztBQUN0RSxPQUFPQywyQkFBMkIsTUFBOEMsd0VBQXdFO0FBQ3hKLE9BQU9DLDhCQUE4QixNQUFNLCtEQUErRDtBQUMxRyxPQUFPQyx5QkFBeUIsTUFBTSxzRUFBc0U7QUFDNUcsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7QUFDaEUsT0FBT0MsYUFBYSxNQUFNLHFDQUFxQztBQUMvRCxPQUFPQyxZQUFZLE1BQU0scUNBQXFDO0FBQzlELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsZ0JBQWdCLE1BQU0saURBQWlEO0FBRTlFLE9BQU9DLFFBQVEsTUFBTSxxREFBcUQ7QUFDMUUsT0FBT0MsVUFBVSxNQUFNLHVEQUF1RDtBQUM5RSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsTUFBTSxNQUFNLDhCQUE4QjtBQUNqRCxPQUFPQyxVQUFVLE1BQU0sbURBQW1EO0FBRTFFLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUU5RCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxjQUFjLE1BQU0sOENBQThDO0FBQ3pFLE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0Msd0JBQXdCLE1BQU0sZ0VBQWdFO0FBQ3JHLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxPQUFPQyxlQUFlLE1BQU0sOERBQThEO0FBSTFGLGVBQWUsTUFBTUMsdUJBQXVCLFNBQVN6QiwyQkFBMkIsQ0FBQztFQVl4RTBCLFdBQVdBLENBQUVDLEtBQXlCLEVBQUVDLGVBQTBDLEVBQUc7SUFDMUYsS0FBSyxDQUFFRCxLQUFLLEVBQUU7TUFDWkUsaUJBQWlCLEVBQUUsSUFBSU4sT0FBTyxDQUFFM0IsMEJBQTBCLENBQUNrQyxZQUFZLEVBQUVsQywwQkFBMEIsQ0FBQ2tDLFlBQWEsQ0FBQztNQUNsSCxHQUFHRjtJQUNMLENBQUUsQ0FBQzs7SUFFSDtJQUNBOztJQUVBLElBQUksQ0FBQ0csYUFBYSxHQUFHLElBQUl4QyxJQUFJLENBQUUsSUFBSSxFQUFFO01BQ25DeUMsTUFBTSxFQUFFLEtBQUs7TUFDYkMsSUFBSSxFQUFFO0lBQ1IsQ0FBRSxDQUFDO0lBQ0gsSUFBS0MsSUFBSSxDQUFDQyxPQUFPLENBQUNDLGVBQWUsQ0FBQ0MsR0FBRyxFQUFHO01BQ3RDLElBQUksQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ1AsYUFBYyxDQUFDO0lBQ3JDO0lBRUEsSUFBSSxDQUFDUSxvQkFBb0IsR0FBRyxJQUFJL0IsZ0JBQWdCLENBQUUsSUFBSSxDQUFDZ0MsV0FBVyxFQUFJQyxJQUFVLElBQU07TUFDcEYsTUFBTUMsUUFBUSxHQUFHLElBQUlqQyxRQUFRLENBQUVnQyxJQUFJLEVBQUUsSUFBSSxDQUFDRSwwQkFBMEIsRUFBRTtRQUNwRUMscUJBQXFCLEVBQUVqQixLQUFLLENBQUNpQixxQkFBcUI7UUFDbERDLFdBQVcsRUFBRSxJQUFJLENBQUNDLDBCQUEwQixDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFDO1FBQ3pEQyxhQUFhLEVBQUU7TUFDakIsQ0FBRSxDQUFDO01BRUgsT0FBT04sUUFBUTtJQUNqQixDQUFFLENBQUM7SUFFSCxNQUFNTywwQkFBMEIsR0FBRyxJQUFJekMsZ0JBQWdCLENBQUUsSUFBSSxDQUFDMEMsZUFBZSxFQUFFLElBQUksQ0FBQ0MseUJBQTBCLENBQUM7SUFFL0csTUFBTUMsdUJBQXVCLEdBQUcsSUFBSTVDLGdCQUFnQixDQUFFLElBQUksQ0FBQzBDLGVBQWUsRUFBSVQsSUFBVSxJQUN0RixJQUFJL0IsVUFBVSxDQUFFK0IsSUFBSSxFQUFFLElBQUksQ0FBQ0UsMEJBQTBCLEVBQUVoQixLQUFLLENBQUMwQixzQkFBc0IsRUFBRVosSUFBSSxDQUFDYSxhQUFhLEVBQUUzQixLQUFLLENBQUM0QixrQkFBa0IsRUFBRTtNQUNqSXRCLElBQUksRUFBRXRCLGVBQWUsQ0FBQzZDLG1CQUFtQjtNQUN6Q0MsYUFBYSxFQUFFO0lBQ2pCLENBQUUsQ0FDSixDQUFDOztJQUVEO0lBQ0EsTUFBTUMsUUFBUSxHQUFHLENBQ2YsSUFBSSxDQUFDbkIsb0JBQW9CLEVBQUVVLDBCQUEwQixFQUFFRyx1QkFBdUIsQ0FDL0U7O0lBRUQ7SUFDQXpCLEtBQUssQ0FBQ2dDLE1BQU0sQ0FBQ0MsT0FBTyxDQUFFbkIsSUFBSSxJQUFJaUIsUUFBUSxDQUFDRSxPQUFPLENBQUVDLE9BQU8sSUFBSUEsT0FBTyxDQUFDQyxHQUFHLENBQUVyQixJQUFLLENBQUUsQ0FBRSxDQUFDOztJQUVsRjtJQUNBZCxLQUFLLENBQUNnQyxNQUFNLENBQUNJLG1CQUFtQixDQUFDQyxXQUFXLENBQUV2QixJQUFJLElBQUk7TUFDcERpQixRQUFRLENBQUNFLE9BQU8sQ0FBRUMsT0FBTyxJQUFJQSxPQUFPLENBQUNDLEdBQUcsQ0FBRXJCLElBQUssQ0FBRSxDQUFDO0lBQ3BELENBQUUsQ0FBQztJQUNIZCxLQUFLLENBQUNnQyxNQUFNLENBQUNNLHFCQUFxQixDQUFDRCxXQUFXLENBQUV2QixJQUFJLElBQUk7TUFDdERpQixRQUFRLENBQUNFLE9BQU8sQ0FBRUMsT0FBTyxJQUFJQSxPQUFPLENBQUNLLE1BQU0sQ0FBRXpCLElBQUssQ0FBRSxDQUFDO0lBQ3ZELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU0wQixnQkFBZ0IsR0FBRyxJQUFJbEQsZ0JBQWdCLENBQUVVLEtBQUssQ0FBQ3lDLFlBQVksRUFBRSxJQUFJLENBQUN6QiwwQkFBMkIsQ0FBQztJQUNwRyxJQUFJLENBQUNPLGVBQWUsQ0FBQ1osUUFBUSxDQUFFNkIsZ0JBQWlCLENBQUM7O0lBR2pEOztJQUVBO0lBQ0EsSUFBSSxDQUFDRSxXQUFXLEdBQUcsSUFBSXBFLDhCQUE4QixDQUNuRDBCLEtBQUssQ0FBQzJDLGlCQUFpQixFQUN2QjtNQUNFQyxPQUFPLEVBQUUsQ0FBQztNQUNWQywwQkFBMEIsRUFBRTtRQUMxQkMsV0FBVyxFQUFFO01BQ2YsQ0FBQztNQUNEQyxrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxrQkFBa0IsRUFBRTtJQUN0QixDQUFFLENBQUM7SUFFTCxNQUFNQyxlQUFlLEdBQUcsSUFBSTFELGVBQWUsQ0FBRVMsS0FBSyxFQUFFLElBQUksQ0FBQ2tELFFBQVEsRUFBRTtNQUNqRUMsWUFBWSxFQUFFLEtBQUs7TUFDbkJDLGFBQWEsRUFBRTtRQUNiQyxLQUFLLEVBQUU7TUFDVDtJQUNGLENBQUUsQ0FBQztJQUVILE1BQU1DLHNCQUFzQixHQUFHLElBQUlwRixxQkFBcUIsQ0FBRThCLEtBQUssRUFBRSxJQUFJLENBQUNrRCxRQUFRLEVBQUU7TUFDOUVLLE1BQU0sRUFBRXRELGVBQWUsQ0FBQ3NELE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGNBQWU7SUFDOUQsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyxrQkFBa0IsR0FBRyxJQUFJMUYsSUFBSSxDQUFFO01BQ2xDNkUsT0FBTyxFQUFFLEdBQUc7TUFDWmMsT0FBTyxFQUFFLElBQUk7TUFDYkMsUUFBUSxFQUFFLENBQ1IsSUFBSTNGLEtBQUssQ0FBRSxJQUFJTCxJQUFJLENBQUU7UUFBRWdHLFFBQVEsRUFBRSxDQUFFVixlQUFlLENBQUU7UUFBRVcsT0FBTyxFQUFFNUQsS0FBSyxDQUFDNkQ7TUFBTSxDQUFFLENBQUMsRUFBRTVGLDBCQUEwQixDQUFDNkYscUJBQXNCLENBQUMsRUFDbEksSUFBSSxDQUFDQyxPQUFPLEVBQ1osSUFBSS9GLEtBQUssQ0FBRXNGLHNCQUFzQixFQUFFckYsMEJBQTBCLENBQUM2RixxQkFBc0IsQ0FBQztJQUV6RixDQUFFLENBQUM7O0lBRUg7SUFDQSxJQUFJLENBQUNFLGFBQWEsR0FBRyxJQUFJeEYsYUFBYSxDQUFFd0IsS0FBTSxDQUFDO0lBRS9DLElBQUksQ0FBQ2lFLHdCQUF3QixHQUFHLElBQUl6RSxjQUFjLENBQUVmLG9CQUFvQixDQUFDeUYsZ0NBQWdDLEVBQUU7TUFDekdDLGVBQWUsRUFBRW5FLEtBQUssQ0FBQ29FLHNCQUFzQjtNQUM3Q0MsUUFBUSxFQUFFQSxDQUFBLEtBQU07UUFDZHJFLEtBQUssQ0FBQ3NFLHNCQUFzQixDQUFDQyxLQUFLLEdBQUcsSUFBSTtRQUN6Q3ZFLEtBQUssQ0FBQ29FLHNCQUFzQixDQUFDRyxLQUFLLEdBQUcsS0FBSztNQUM1QyxDQUFDO01BQ0R4QixrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxrQkFBa0IsRUFBRS9FLDBCQUEwQixDQUFDdUcsZ0JBQWdCLEdBQUcsQ0FBQztNQUNuRUMsSUFBSSxFQUFFeEcsMEJBQTBCLENBQUN5RyxVQUFVO01BQzNDQyxZQUFZLEVBQUUsR0FBRztNQUNqQkMsU0FBUyxFQUFFO0lBQ2IsQ0FBRSxDQUFDO0lBRUgsTUFBTUMsbUJBQW1CLEdBQUc3RSxLQUFLLENBQUM2RCxLQUFLLEdBQUc1RCxlQUFlLENBQUNzRCxNQUFNLENBQUNDLFlBQVksQ0FBRSxlQUFnQixDQUFDLEdBQUcvRCxNQUFNLENBQUNxRixPQUFPO0lBRWpILElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSWhILElBQUksQ0FBRTtNQUNoQzRGLFFBQVEsRUFBRSxDQUNSLElBQUk3RixJQUFJLENBQUVXLG9CQUFvQixDQUFDdUcsU0FBUyxDQUFDQyxvQkFBb0IsRUFBRTdHLGNBQWMsQ0FBZTtRQUMxRjhHLFFBQVEsRUFBRTtNQUNaLENBQUMsRUFBRWpILDBCQUEwQixDQUFDa0gsWUFBYSxDQUFFLENBQUMsRUFDOUMsSUFBSXpHLGFBQWEsQ0FBRXNCLEtBQUssQ0FBQ29GLDRCQUE0QixFQUFFLElBQUl6RyxZQUFZLENBQUUsSUFBSUMsS0FBSyxDQUFFLENBQUMsRUFBRVgsMEJBQTBCLENBQUNvSCxVQUFXLENBQUUsQ0FBQyxFQUM5SDtRQUNFQyxVQUFVLEVBQUUsQ0FBQztRQUNidkMsa0JBQWtCLEVBQUUsRUFBRTtRQUN0QkMsa0JBQWtCLEVBQUUsRUFBRTtRQUN0QnVDLGtCQUFrQixFQUFFLEVBQUU7UUFDdEJDLGtCQUFrQixFQUFFLENBQUM7UUFDckJDLGNBQWMsRUFBRSxXQUFXO1FBQzNCQyxpQkFBaUIsRUFBRTdGLGVBQWU7UUFDbEM4RixvQkFBb0IsRUFBRTtVQUNwQkMsYUFBYSxFQUFFLENBQUM7VUFDaEJ2QyxLQUFLLEVBQUUsUUFBUTtVQUNmd0MsT0FBTyxFQUFFLEVBQUU7VUFDWEMsT0FBTyxFQUFFLENBQUM7VUFDVkMsV0FBVyxFQUFFO1lBQ1h0QixJQUFJLEVBQUUsSUFBSXBGLFFBQVEsQ0FBRSxFQUFHO1VBQ3pCO1FBQ0YsQ0FBQztRQUNEMkcsY0FBYyxFQUFFdkgsb0JBQW9CLENBQUN3SCxJQUFJLENBQUNDO01BQzVDLENBQUUsQ0FBQyxDQUNOO01BQ0R0QyxPQUFPLEVBQUU1RCxLQUFLLENBQUM2RCxLQUFLO01BQ3BCakIsT0FBTyxFQUFFLENBQUM7TUFDVlcsTUFBTSxFQUFFc0I7SUFDVixDQUFFLENBQUM7SUFFSCxNQUFNc0IsZ0JBQWdCLEdBQUduRyxLQUFLLENBQUM2RCxLQUFLLEdBQUc1RCxlQUFlLENBQUNzRCxNQUFNLENBQUNDLFlBQVksQ0FBRSxpQkFBa0IsQ0FBQyxHQUFHL0QsTUFBTSxDQUFDcUYsT0FBTztJQUNoSCxNQUFNc0Isc0JBQXNCLEdBQUdwRyxLQUFLLENBQUM2RCxLQUFLLEdBQUc1RCxlQUFlLENBQUNzRCxNQUFNLENBQUNDLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQyxHQUFHL0QsTUFBTSxDQUFDcUYsT0FBTztJQUV2SCxJQUFJLENBQUN1QixlQUFlLEdBQUcsSUFBSTNJLElBQUksQ0FBRTtNQUMvQmdHLE9BQU8sRUFBRSxJQUFJO01BQ2JFLE9BQU8sRUFBRTVELEtBQUssQ0FBQzZELEtBQUs7TUFDcEJGLFFBQVEsRUFBRSxDQUNSLElBQUlwRix5QkFBeUIsQ0FDM0J5QixLQUFLLENBQUNzRyxnQkFBZ0IsRUFDdEIsSUFBSXhJLElBQUksQ0FBRVcsb0JBQW9CLENBQUN1RyxTQUFTLENBQUN1QixzQkFBc0IsRUFBRW5JLGNBQWMsQ0FBZTtRQUM1RjhHLFFBQVEsRUFBRTtNQUNaLENBQUMsRUFBRWpILDBCQUEwQixDQUFDa0gsWUFBYSxDQUFFLENBQUMsRUFDOUMvRyxjQUFjLENBQW1CO1FBQy9CNEgsY0FBYyxFQUFFdkgsb0JBQW9CLENBQUN3SCxJQUFJLENBQUNNLHNCQUFzQjtRQUNoRXhELGtCQUFrQixFQUFFLEVBQUU7UUFDdEJDLGtCQUFrQixFQUFFLEVBQUU7UUFDdEJPLE1BQU0sRUFBRTZDO01BQ1YsQ0FBQyxFQUFFbkksMEJBQTBCLENBQUN1SSxnQkFBaUIsQ0FDakQsQ0FBQyxFQUNELElBQUlySCxVQUFVLENBQUU7UUFDZDZHLGNBQWMsRUFBRXZILG9CQUFvQixDQUFDd0gsSUFBSSxDQUFDUSxrQkFBa0I7UUFDNURDLEtBQUssRUFBRSxHQUFHO1FBQ1ZDLFFBQVEsRUFBRSxxQkFBcUI7UUFDL0JDLGlCQUFpQixFQUFFLEVBQUU7UUFDckJ2QyxRQUFRLEVBQUVBLENBQUEsS0FBTXdDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDLENBQUM7UUFDbEN2RCxNQUFNLEVBQUU0QztNQUNWLENBQUUsQ0FBQztJQUVQLENBQUUsQ0FBQztJQUVILE1BQU1ZLG1CQUFtQixHQUFHLElBQUk5SCxlQUFlLENBQUUsQ0FDN0NSLG9CQUFvQixDQUFDdUksU0FBUyxDQUFDQyxxQkFBcUIsRUFDcER4SSxvQkFBb0IsQ0FBQ3VJLFNBQVMsQ0FBQ0Usc0JBQXNCLEVBQ3JEekksb0JBQW9CLENBQUN1SSxTQUFTLENBQUNHLHNCQUFzQixDQUN0RCxFQUNELENBQUVDLE9BQU8sRUFBRUMsUUFBUSxFQUFFQyxRQUFRLEtBQU07TUFDakMsT0FBT0YsT0FBTyxHQUFHLFVBQVUsR0FBR0MsUUFBUSxHQUFHLFVBQVUsR0FBR0MsUUFBUTtJQUNoRSxDQUFFLENBQUM7SUFFTCxNQUFNVCxXQUFXLEdBQUcsSUFBSTNILE1BQU0sQ0FBRSxJQUFJckIsUUFBUSxDQUFFa0osbUJBQW1CLEVBQUU7TUFBRVEsUUFBUSxFQUFFO0lBQUksQ0FBRSxDQUFDLEVBQUU7TUFDdEZDLFVBQVUsRUFBRSxRQUFRO01BQ3BCQyxLQUFLLEVBQUUsSUFBSTNKLElBQUksQ0FBRVcsb0JBQW9CLENBQUN1SSxTQUFTLENBQUNVLG1CQUFtQixFQUFFO1FBQUVqRCxJQUFJLEVBQUUsSUFBSXBGLFFBQVEsQ0FBRSxFQUFHO01BQUUsQ0FBRSxDQUFDO01BQ25Ha0UsTUFBTSxFQUFFdEQsZUFBZSxDQUFDc0QsTUFBTSxDQUFDQyxZQUFZLENBQUUsYUFBYztJQUM3RCxDQUFFLENBQUM7O0lBRUg7SUFDQSxNQUFNbUUsV0FBVyxHQUFHLElBQUlqSyxJQUFJLENBQUU7TUFDNUJrSyxPQUFPLEVBQUUsS0FBSztNQUNkQyxZQUFZLEVBQUUsSUFBSTtNQUNsQkMsWUFBWSxFQUFFLFlBQVk7TUFDMUJ6RSxLQUFLLEVBQUUsUUFBUTtNQUNmVCxPQUFPLEVBQUUsRUFBRTtNQUNYZSxRQUFRLEVBQUUsQ0FDUixJQUFJNUYsSUFBSSxDQUFFO1FBQ1I2RSxPQUFPLEVBQUUsQ0FBQztRQUNWYyxPQUFPLEVBQUUsSUFBSTtRQUNiQyxRQUFRLEVBQUUsQ0FDUixJQUFJLENBQUMwQyxlQUFlLEVBQ3BCLElBQUksQ0FBQ3JDLGFBQWE7TUFFdEIsQ0FBRSxDQUFDLEVBQ0gsSUFBSXRHLElBQUksQ0FBRTtRQUNSMkYsS0FBSyxFQUFFLFFBQVE7UUFDZlQsT0FBTyxFQUFFLEVBQUU7UUFDWGUsUUFBUSxFQUFFLENBQ1IsSUFBSSxDQUFDb0IsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQ2Qsd0JBQXdCO01BRWpDLENBQUUsQ0FBQztJQUVQLENBQUUsQ0FBQztJQUVILE1BQU04RCxnQkFBZ0IsR0FBRyxJQUFJdEssUUFBUSxDQUFFa0ssV0FBVyxFQUFFO01BQ2xESyxtQkFBbUIsRUFBRSxJQUFJLENBQUNDLHVCQUF1QjtNQUNqREMsTUFBTSxFQUFFakssMEJBQTBCLENBQUNrSyxNQUFNO01BQ3pDQyxNQUFNLEVBQUUsTUFBTTtNQUNkQyxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7SUFFSCxNQUFNQyxhQUFhLEdBQUcsSUFBSTdLLFFBQVEsQ0FBRSxJQUFJLENBQUM4SyxjQUFjLEVBQUU7TUFDdkRQLG1CQUFtQixFQUFFLElBQUksQ0FBQ0MsdUJBQXVCO01BQ2pEQyxNQUFNLEVBQUVqSywwQkFBMEIsQ0FBQ2tLLE1BQU07TUFDekNDLE1BQU0sRUFBRSxPQUFPO01BQ2ZDLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQztJQUVILE1BQU1HLGNBQWMsR0FBRyxJQUFJL0ssUUFBUSxDQUFFLElBQUksQ0FBQ2lGLFdBQVcsRUFBRTtNQUNyRHNGLG1CQUFtQixFQUFFLElBQUksQ0FBQ0MsdUJBQXVCO01BQ2pEQyxNQUFNLEVBQUVqSywwQkFBMEIsQ0FBQ2tLLE1BQU07TUFDekNDLE1BQU0sRUFBRSxNQUFNO01BQ2RDLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQztJQUVILE1BQU1JLGVBQWUsR0FBRyxJQUFJM0ssSUFBSSxDQUFFNEIsd0JBQXdCLENBQUNnSiw2QkFBNkIsRUFDdEZ0SyxjQUFjLENBQWU7TUFDekIrRixlQUFlLEVBQUVsRixlQUFlLENBQUMwSixHQUFHLENBQUUsQ0FBRTNJLEtBQUssQ0FBQzBCLHNCQUFzQixFQUFFMUIsS0FBSyxDQUFDNEksMEJBQTBCLENBQUcsQ0FBQztNQUMxRzFELFFBQVEsRUFBRWpILDBCQUEwQixDQUFDNEssY0FBYyxHQUFHO0lBQ3hELENBQUMsRUFDRDVLLDBCQUEwQixDQUFDa0gsWUFBYSxDQUM1QyxDQUFDO0lBQ0QsTUFBTTJELGtCQUFrQixHQUFHLElBQUl0SixjQUFjLENBQUVmLG9CQUFvQixDQUFDc0ssMEJBQTBCLEVBQUU7TUFDOUY1RSxlQUFlLEVBQUVuRSxLQUFLLENBQUNnSix3QkFBd0I7TUFDL0MzRSxRQUFRLEVBQUVBLENBQUEsS0FBTTtRQUNkckUsS0FBSyxDQUFDaUosT0FBTyxDQUFDLENBQUM7TUFDakIsQ0FBQztNQUNEbEcsa0JBQWtCLEVBQUUsQ0FBQztNQUNyQkMsa0JBQWtCLEVBQUUsQ0FBQztNQUNyQnlCLElBQUksRUFBRXhHLDBCQUEwQixDQUFDeUcsVUFBVTtNQUMzQ0MsWUFBWSxFQUFFLEdBQUc7TUFDakJ1RSxnQkFBZ0IsRUFBRTtJQUNwQixDQUFFLENBQUM7SUFFSCxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJMUwsUUFBUSxDQUFFLElBQUlDLElBQUksQ0FBRTtNQUNqRGtGLE9BQU8sRUFBRSxFQUFFO01BQ1h3RyxhQUFhLEVBQUUsS0FBSztNQUNwQkMsZUFBZSxFQUFFUCxrQkFBa0IsQ0FBQ1EsTUFBTTtNQUMxQzNGLFFBQVEsRUFBRSxDQUFFbUYsa0JBQWtCLEVBQUVMLGVBQWU7SUFDakQsQ0FBRSxDQUFDLEVBQUU7TUFDSFQsbUJBQW1CLEVBQUUsSUFBSSxDQUFDQyx1QkFBdUI7TUFDakRDLE1BQU0sRUFBRWpLLDBCQUEwQixDQUFDa0ssTUFBTTtNQUN6Q29CLE9BQU8sRUFBRSxDQUFDakcsc0JBQXNCLENBQUNrRyxLQUFLLEdBQUcsQ0FBQztNQUMxQ3BCLE1BQU0sRUFBRSxRQUFRO01BQ2hCQyxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNvQixjQUFjLENBQUM5SSxRQUFRLENBQUV3SSxrQkFBbUIsQ0FBQztJQUNsRCxJQUFJLENBQUNNLGNBQWMsQ0FBQzlJLFFBQVEsQ0FBRTJILGFBQWMsQ0FBQztJQUM3QyxJQUFJLENBQUNtQixjQUFjLENBQUM5SSxRQUFRLENBQUVvSCxnQkFBaUIsQ0FBQztJQUNoRCxJQUFJLENBQUMwQixjQUFjLENBQUM5SSxRQUFRLENBQUUsSUFBSWxELFFBQVEsQ0FDeEMsSUFBSSxDQUFDZ0csa0JBQWtCLEVBQUU7TUFDdkJ1RSxtQkFBbUIsRUFBRSxJQUFJLENBQUNDLHVCQUF1QjtNQUNqREMsTUFBTSxFQUFFakssMEJBQTBCLENBQUNrSyxNQUFNO01BQ3pDQyxNQUFNLEVBQUUsT0FBTztNQUNmQyxNQUFNLEVBQUU7SUFDVixDQUFFLENBQUUsQ0FBQztJQUNQLElBQUksQ0FBQ29CLGNBQWMsQ0FBQzlJLFFBQVEsQ0FBRTZILGNBQWUsQ0FBQzs7SUFFOUM7SUFDQSxJQUFJLENBQUNpQixjQUFjLENBQUNDLFNBQVMsR0FBRyxDQUM5QnpHLGVBQWUsRUFDZixJQUFJLENBQUNjLE9BQU8sRUFDWm9GLGtCQUFrQixFQUNsQnhCLFdBQVcsRUFDWHJFLHNCQUFzQixFQUN0QixJQUFJLENBQUNaLFdBQVcsRUFDaEIsSUFBSSxDQUFDNkYsY0FBYyxDQUNwQjtJQUdELElBQUksQ0FBQ29CLFdBQVcsQ0FBQ2hKLFFBQVEsQ0FBRSxJQUFJdkIsZUFBZSxDQUFFWSxLQUFLLENBQUNnQyxNQUFNLEVBQUUsSUFBSSxDQUFDaEIsMEJBQTBCLEVBQUUsSUFBSSxDQUFDNEkscUJBQXFCLEVBQUU7TUFDekh6RixlQUFlLEVBQUVuRSxLQUFLLENBQUM2SjtJQUN6QixDQUFFLENBQUUsQ0FBQztFQUNQO0VBRWdCMUksMEJBQTBCQSxDQUFFMkksS0FBYyxFQUFFQyxNQUFjLEVBQVk7SUFFcEYsSUFBSyxDQUFDQyxDQUFDLENBQUNDLEtBQUssQ0FBRSxDQUNiLElBQUksQ0FBQ3hHLGtCQUFrQixFQUN2QixJQUFJLENBQUNmLFdBQVcsRUFDaEIsSUFBSSxDQUFDMkQsZUFBZSxFQUNwQixJQUFJLENBQUNyQyxhQUFhLEVBQ2xCLElBQUksQ0FBQ2UsZ0JBQWdCLEVBQ3JCLElBQUksQ0FBQ2Qsd0JBQXdCLEVBQzdCLElBQUksQ0FBQzdELGFBQWEsQ0FDbEIsQ0FBQyxFQUFHO01BQ0osT0FBTzBKLEtBQUs7SUFDZDtJQUdBLE1BQU1JLEdBQUcsR0FBRyxJQUFJLENBQUNsSiwwQkFBMEIsQ0FBQ3VELEtBQUs7SUFFakQsTUFBTTRGLFdBQVcsR0FBS0MsTUFBZSxJQUFNQSxNQUFNLENBQUNDLFFBQVEsQ0FBRSxJQUFJLENBQUNDLFlBQVksQ0FBQ0MsSUFBSyxDQUFDO0lBQ3BGLE1BQU1DLGNBQWMsR0FBS0osTUFBZSxJQUFNQSxNQUFNLENBQUNLLFFBQVEsQ0FBRSxJQUFJLENBQUNILFlBQVksQ0FBQ0ksSUFBSyxDQUFDO0lBQ3ZGLE1BQU1DLFlBQVksR0FBS1AsTUFBZSxJQUFNQSxNQUFNLENBQUNRLFFBQVEsQ0FBRSxJQUFJLENBQUNoQixxQkFBcUIsQ0FBQ3JGLEtBQUssQ0FBQ3NHLElBQUssQ0FBQztJQUNwRyxNQUFNQyxhQUFhLEdBQUtWLE1BQWUsSUFBTUEsTUFBTSxDQUFDVyxRQUFRLENBQUUsSUFBSSxDQUFDbkIscUJBQXFCLENBQUNyRixLQUFLLENBQUN5RyxJQUFLLENBQUM7O0lBRXJHO0lBQ0EsTUFBTUMsS0FBSyxHQUFHdEwsS0FBSyxDQUFDeUssTUFBTSxDQUFFRixHQUFHLENBQUNnQixpQkFBaUIsQ0FBRVAsWUFBWSxDQUFFRyxhQUFhLENBQUUsSUFBSSxDQUFDUixZQUFhLENBQUUsQ0FBQyxDQUFDYSxNQUFNLENBQUVwQixNQUFPLENBQUUsQ0FBRTtJQUN2SDtJQUFBLENBQ0NxQixlQUFlLENBQUV6TCxLQUFLLENBQUN5SyxNQUFNLENBQUVGLEdBQUcsQ0FBQ2dCLGlCQUFpQixDQUFFZixXQUFXLENBQUVXLGFBQWEsQ0FBRSxJQUFJLENBQUNySCxrQkFBa0IsQ0FBQzJHLE1BQU8sQ0FBRSxDQUFDLENBQUNpQixPQUFPLENBQUV0QixNQUFPLENBQUUsQ0FBRSxDQUFFO0lBQzVJO0lBQUEsQ0FDQ3FCLGVBQWUsQ0FBRXpMLEtBQUssQ0FBQ3lLLE1BQU0sQ0FBRUYsR0FBRyxDQUFDZ0IsaUJBQWlCLENBQUVmLFdBQVcsQ0FBRVEsWUFBWSxDQUFFLElBQUksQ0FBQ2pJLFdBQVcsQ0FBQzBILE1BQU8sQ0FBRSxDQUFDLENBQUNpQixPQUFPLENBQUV0QixNQUFPLENBQUUsQ0FBRSxDQUFFO0lBQ3BJO0lBQUEsQ0FDQ3FCLGVBQWUsQ0FBRXpMLEtBQUssQ0FBQ3lLLE1BQU0sQ0FBRUYsR0FBRyxDQUFDZ0IsaUJBQWlCLENBQUVWLGNBQWMsQ0FBRU0sYUFBYSxDQUFFLElBQUksQ0FBQ3ZDLGNBQWMsQ0FBQzZCLE1BQU8sQ0FBRSxDQUFDLENBQUNpQixPQUFPLENBQUV0QixNQUFPLENBQUUsQ0FBRSxDQUFFO0lBQzNJO0lBQUEsQ0FDQ3FCLGVBQWUsQ0FBRXpMLEtBQUssQ0FBQzJMLEtBQUssQ0FBRSxDQUM3QixJQUFJLENBQUNqRixlQUFlLEVBQ3BCLElBQUksQ0FBQ3JDLGFBQWEsRUFDbEIsSUFBSSxDQUFDZSxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDZCx3QkFBd0IsQ0FDOUIsQ0FBQ3NILEdBQUcsQ0FBRUMsSUFBSSxJQUFJO01BQ2IsTUFBTUMsVUFBVSxHQUFHZCxZQUFZLENBQUVILGNBQWMsQ0FBRSxJQUFJLENBQUNrQixRQUFRLENBQUVGLElBQUssQ0FBRSxDQUFFLENBQUM7TUFDMUUsTUFBTUcsV0FBVyxHQUFHekIsR0FBRyxDQUFDZ0IsaUJBQWlCLENBQUVPLFVBQVUsQ0FBQ0osT0FBTyxDQUFFdEIsTUFBTyxDQUFFLENBQUM7TUFDekUsT0FBT3BLLEtBQUssQ0FBQ3lLLE1BQU0sQ0FBRXVCLFdBQVksQ0FBQztJQUNwQyxDQUFFLENBQUUsQ0FBRSxDQUFDOztJQUVUO0lBQ0EsSUFBS3BMLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxlQUFlLENBQUNDLEdBQUcsRUFBRztNQUN0QyxJQUFJLENBQUNOLGFBQWEsQ0FBQzZLLEtBQUssR0FBR2YsR0FBRyxDQUFDMEIsZ0JBQWdCLENBQUVYLEtBQU0sQ0FBQztJQUMxRDtJQUVBLElBQUtBLEtBQUssQ0FBQ1ksYUFBYSxDQUFFL0IsS0FBTSxDQUFDLEVBQUc7TUFDbEMsT0FBT0EsS0FBSztJQUNkLENBQUMsTUFDSTtNQUNILE9BQU9tQixLQUFLLENBQUNhLGVBQWUsQ0FBRWhDLEtBQU0sQ0FBQztJQUN2QztFQUNGO0VBRWdCaUMsSUFBSUEsQ0FBRUMsRUFBVSxFQUFTO0lBQ3ZDLEtBQUssQ0FBQ0QsSUFBSSxDQUFFQyxFQUFHLENBQUM7SUFFaEIsSUFBSSxDQUFDcEwsb0JBQW9CLENBQUNxTCxRQUFRLENBQUMsQ0FBQyxDQUFDaEssT0FBTyxDQUFFbEIsUUFBUSxJQUFJO01BQ3hELElBQUssSUFBSSxDQUFDZixLQUFLLENBQUNrTSxpQkFBaUIsQ0FBQzNILEtBQUssRUFBRztRQUN4Q3hELFFBQVEsQ0FBQ29MLFNBQVMsQ0FBQyxDQUFDO01BQ3RCLENBQUMsTUFDSTtRQUNIcEwsUUFBUSxDQUFDcUwsU0FBUyxDQUFDLENBQUM7TUFDdEI7SUFDRixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFqTyxhQUFhLENBQUNrTyxRQUFRLENBQUUseUJBQXlCLEVBQUV2TSx1QkFBd0IsQ0FBQyJ9