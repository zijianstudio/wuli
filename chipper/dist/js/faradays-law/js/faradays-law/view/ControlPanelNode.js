// Copyright 2014-2023, University of Colorado Boulder

/**
 * Strip of controls at the bottom of the screen, which are not shown in a visible panel.  It contains controls
 * for showing field lines, switching between 1 vs 2 coils, flipping the magnet and the reset all button.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import OrientationEnum from '../model/OrientationEnum.js';
import CoilNode from './CoilNode.js';
import CoilTypeEnum from './CoilTypeEnum.js';
import FaradaysLawAlertManager from './FaradaysLawAlertManager.js';
import FlipMagnetButton from './FlipMagnetButton.js';

// constants
const faradaysLawShowFieldLinesString = FaradaysLawStrings['faradays-law'].showFieldLines;
const faradaysLawVoltmeterString = FaradaysLawStrings['faradays-law'].voltmeter;
const voltmeterString = FaradaysLawStrings.a11y.voltmeter;
const voltmeterDescriptionString = FaradaysLawStrings.a11y.voltmeterDescription;
const numberOneCoilString = FaradaysLawStrings.a11y.numberOneCoil;
const numberTwoCoilString = FaradaysLawStrings.a11y.numberTwoCoil;
const circuitModeString = FaradaysLawStrings.a11y.circuitMode;
const fieldLinesString = FaradaysLawStrings.a11y.fieldLines;
const fieldLinesDescriptionString = FaradaysLawStrings.a11y.fieldLinesDescription;
class ControlPanelNode extends Node {
  /**
   * @param {FaradaysLawModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      tagName: 'ul'
    });

    // reset button - added at end of constructor for a11y ordering
    const resetAllButton = new ResetAllButton({
      listener: model.reset.bind(model),
      right: model.bounds.maxX - 10,
      bottom: 0,
      scale: 0.75,
      // pdom
      containerTagName: 'li',
      // phet-io
      tandem: tandem.createTandem('resetAllButton')
    });

    // flip magnet button
    this.flipMagnetButton = new FlipMagnetButton(tandem.createTandem('flipMagnetButton'), {
      listener: () => {
        const orientation = model.magnet.orientationProperty.value;
        model.magnet.orientationProperty.set(orientation === OrientationEnum.NS ? OrientationEnum.SN : OrientationEnum.NS);
      },
      bottom: 0,
      right: model.bounds.maxX - 110
    });
    this.addChild(this.flipMagnetButton);

    // add radio button group for showing/hiding the second coil
    const coilButtonGroupOptions = {
      spacing: 10,
      align: 'left',
      scale: 0.21
    };
    const coilButtonGroupContents = [{
      value: false,
      createNode: () => new VBox(merge({
        children: [new CoilNode(CoilTypeEnum.TWO_COIL, {
          visible: false
        }), new CoilNode(CoilTypeEnum.FOUR_COIL)],
        excludeInvisibleChildrenFromBounds: false
      }, coilButtonGroupOptions)),
      tandemName: 'singleCoilRadioButton',
      phetioDocumentation: 'Radio button that selects a single coil.',
      labelContent: numberOneCoilString
    }, {
      value: true,
      createNode: () => new VBox(merge({
        children: [new CoilNode(CoilTypeEnum.TWO_COIL), new CoilNode(CoilTypeEnum.FOUR_COIL)],
        excludeInvisibleChildrenFromBounds: false
      }, coilButtonGroupOptions)),
      tandemName: 'doubleCoilRadioButton',
      phetioDocumentation: 'Radio button that selects double coils.',
      labelContent: numberTwoCoilString
    }];
    const coilRadioButtonGroup = new RectangularRadioButtonGroup(model.topCoilVisibleProperty, coilButtonGroupContents, {
      radioButtonOptions: {
        xMargin: 20,
        yMargin: 4,
        baseColor: '#cdd5f6',
        // lavender-ish
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 3,
          deselectedLineWidth: 1
        }
      },
      left: 377,
      bottom: 0,
      orientation: 'horizontal',
      tandem: tandem.createTandem('coilRadioButtonGroup'),
      phetioDocumentation: 'Radio button group that selects between one or two coils.',
      containerTagName: 'li',
      labelContent: circuitModeString
    });
    model.topCoilVisibleProperty.lazyLink(showTopCoil => {
      FaradaysLawAlertManager.coilConnectionAlert(showTopCoil);
    });
    const showVoltmeterLabel = new Text(faradaysLawVoltmeterString, {
      font: new PhetFont(16)
    });
    showVoltmeterLabel.scale(Math.min(150 / showVoltmeterLabel.width, 1));
    const voltmeterCheckbox = new Checkbox(model.voltmeterVisibleProperty, showVoltmeterLabel, {
      x: 174,
      centerY: coilRadioButtonGroup.centerY - 20,
      tandem: tandem.createTandem('voltmeterCheckbox'),
      phetioDocumentation: 'Checkbox that selects whether the voltmeter will be shown.',
      containerTagName: 'li',
      labelTagName: 'label',
      labelContent: voltmeterString,
      descriptionContent: voltmeterDescriptionString
    });
    voltmeterCheckbox.touchArea = voltmeterCheckbox.localBounds.dilated(8);
    this.addChild(voltmeterCheckbox);
    model.voltmeterVisibleProperty.lazyLink(showVoltmeter => {
      FaradaysLawAlertManager.voltmeterAttachmentAlert(showVoltmeter);
    });

    // Create the label for the "Show Field Lines" checkbox, scaling it if it's too long.
    const showFieldLinesLabel = new Text(faradaysLawShowFieldLinesString, {
      font: new PhetFont(16)
    });
    showFieldLinesLabel.scale(Math.min(150 / showFieldLinesLabel.width, 1)); // max width empirically determined

    // show field lines
    const fieldLinesCheckbox = new Checkbox(model.magnet.fieldLinesVisibleProperty, showFieldLinesLabel, {
      x: 174,
      centerY: coilRadioButtonGroup.centerY + 20,
      tandem: tandem.createTandem('fieldLinesCheckbox'),
      phetioDocumentation: 'Checkbox that selects whether the magnetic field lines will be shown.',
      containerTagName: 'li',
      labelTagName: 'label',
      labelContent: fieldLinesString,
      descriptionContent: fieldLinesDescriptionString
    });
    fieldLinesCheckbox.touchArea = fieldLinesCheckbox.localBounds.dilated(8);
    this.addChild(fieldLinesCheckbox);
    model.magnet.fieldLinesVisibleProperty.lazyLink(showLines => {
      FaradaysLawAlertManager.fieldLinesVisibilityAlert(showLines);
    });
    this.addChild(coilRadioButtonGroup);

    // for a11y ordering
    this.addChild(resetAllButton);
    this.bottom = model.bounds.maxY - 10;

    // pdom keyboard nav order
    this.pdomOrder = [voltmeterCheckbox, fieldLinesCheckbox, coilRadioButtonGroup];
  }
}
faradaysLaw.register('ControlPanelNode', ControlPanelNode);
export default ControlPanelNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlJlc2V0QWxsQnV0dG9uIiwiUGhldEZvbnQiLCJOb2RlIiwiVGV4dCIsIlZCb3giLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJDaGVja2JveCIsImZhcmFkYXlzTGF3IiwiRmFyYWRheXNMYXdTdHJpbmdzIiwiT3JpZW50YXRpb25FbnVtIiwiQ29pbE5vZGUiLCJDb2lsVHlwZUVudW0iLCJGYXJhZGF5c0xhd0FsZXJ0TWFuYWdlciIsIkZsaXBNYWduZXRCdXR0b24iLCJmYXJhZGF5c0xhd1Nob3dGaWVsZExpbmVzU3RyaW5nIiwic2hvd0ZpZWxkTGluZXMiLCJmYXJhZGF5c0xhd1ZvbHRtZXRlclN0cmluZyIsInZvbHRtZXRlciIsInZvbHRtZXRlclN0cmluZyIsImExMXkiLCJ2b2x0bWV0ZXJEZXNjcmlwdGlvblN0cmluZyIsInZvbHRtZXRlckRlc2NyaXB0aW9uIiwibnVtYmVyT25lQ29pbFN0cmluZyIsIm51bWJlck9uZUNvaWwiLCJudW1iZXJUd29Db2lsU3RyaW5nIiwibnVtYmVyVHdvQ29pbCIsImNpcmN1aXRNb2RlU3RyaW5nIiwiY2lyY3VpdE1vZGUiLCJmaWVsZExpbmVzU3RyaW5nIiwiZmllbGRMaW5lcyIsImZpZWxkTGluZXNEZXNjcmlwdGlvblN0cmluZyIsImZpZWxkTGluZXNEZXNjcmlwdGlvbiIsIkNvbnRyb2xQYW5lbE5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwidGFnTmFtZSIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJyZXNldCIsImJpbmQiLCJyaWdodCIsImJvdW5kcyIsIm1heFgiLCJib3R0b20iLCJzY2FsZSIsImNvbnRhaW5lclRhZ05hbWUiLCJjcmVhdGVUYW5kZW0iLCJmbGlwTWFnbmV0QnV0dG9uIiwib3JpZW50YXRpb24iLCJtYWduZXQiLCJvcmllbnRhdGlvblByb3BlcnR5IiwidmFsdWUiLCJzZXQiLCJOUyIsIlNOIiwiYWRkQ2hpbGQiLCJjb2lsQnV0dG9uR3JvdXBPcHRpb25zIiwic3BhY2luZyIsImFsaWduIiwiY29pbEJ1dHRvbkdyb3VwQ29udGVudHMiLCJjcmVhdGVOb2RlIiwiY2hpbGRyZW4iLCJUV09fQ09JTCIsInZpc2libGUiLCJGT1VSX0NPSUwiLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwidGFuZGVtTmFtZSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJsYWJlbENvbnRlbnQiLCJjb2lsUmFkaW9CdXR0b25Hcm91cCIsInRvcENvaWxWaXNpYmxlUHJvcGVydHkiLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJhc2VDb2xvciIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJzZWxlY3RlZExpbmVXaWR0aCIsImRlc2VsZWN0ZWRMaW5lV2lkdGgiLCJsZWZ0IiwibGF6eUxpbmsiLCJzaG93VG9wQ29pbCIsImNvaWxDb25uZWN0aW9uQWxlcnQiLCJzaG93Vm9sdG1ldGVyTGFiZWwiLCJmb250IiwiTWF0aCIsIm1pbiIsIndpZHRoIiwidm9sdG1ldGVyQ2hlY2tib3giLCJ2b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJ4IiwiY2VudGVyWSIsImxhYmVsVGFnTmFtZSIsImRlc2NyaXB0aW9uQ29udGVudCIsInRvdWNoQXJlYSIsImxvY2FsQm91bmRzIiwiZGlsYXRlZCIsInNob3dWb2x0bWV0ZXIiLCJ2b2x0bWV0ZXJBdHRhY2htZW50QWxlcnQiLCJzaG93RmllbGRMaW5lc0xhYmVsIiwiZmllbGRMaW5lc0NoZWNrYm94IiwiZmllbGRMaW5lc1Zpc2libGVQcm9wZXJ0eSIsInNob3dMaW5lcyIsImZpZWxkTGluZXNWaXNpYmlsaXR5QWxlcnQiLCJtYXhZIiwicGRvbU9yZGVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb250cm9sUGFuZWxOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0cmlwIG9mIGNvbnRyb2xzIGF0IHRoZSBib3R0b20gb2YgdGhlIHNjcmVlbiwgd2hpY2ggYXJlIG5vdCBzaG93biBpbiBhIHZpc2libGUgcGFuZWwuICBJdCBjb250YWlucyBjb250cm9sc1xyXG4gKiBmb3Igc2hvd2luZyBmaWVsZCBsaW5lcywgc3dpdGNoaW5nIGJldHdlZW4gMSB2cyAyIGNvaWxzLCBmbGlwcGluZyB0aGUgbWFnbmV0IGFuZCB0aGUgcmVzZXQgYWxsIGJ1dHRvbi5cclxuICpcclxuICogQGF1dGhvciBWYXNpbHkgU2hha2hvdiAoTUxlYXJuZXIpXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IGZhcmFkYXlzTGF3IGZyb20gJy4uLy4uL2ZhcmFkYXlzTGF3LmpzJztcclxuaW1wb3J0IEZhcmFkYXlzTGF3U3RyaW5ncyBmcm9tICcuLi8uLi9GYXJhZGF5c0xhd1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb25FbnVtIGZyb20gJy4uL21vZGVsL09yaWVudGF0aW9uRW51bS5qcyc7XHJcbmltcG9ydCBDb2lsTm9kZSBmcm9tICcuL0NvaWxOb2RlLmpzJztcclxuaW1wb3J0IENvaWxUeXBlRW51bSBmcm9tICcuL0NvaWxUeXBlRW51bS5qcyc7XHJcbmltcG9ydCBGYXJhZGF5c0xhd0FsZXJ0TWFuYWdlciBmcm9tICcuL0ZhcmFkYXlzTGF3QWxlcnRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IEZsaXBNYWduZXRCdXR0b24gZnJvbSAnLi9GbGlwTWFnbmV0QnV0dG9uLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBmYXJhZGF5c0xhd1Nob3dGaWVsZExpbmVzU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzWyAnZmFyYWRheXMtbGF3JyBdLnNob3dGaWVsZExpbmVzO1xyXG5jb25zdCBmYXJhZGF5c0xhd1ZvbHRtZXRlclN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5nc1sgJ2ZhcmFkYXlzLWxhdycgXS52b2x0bWV0ZXI7XHJcbmNvbnN0IHZvbHRtZXRlclN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LnZvbHRtZXRlcjtcclxuY29uc3Qgdm9sdG1ldGVyRGVzY3JpcHRpb25TdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS52b2x0bWV0ZXJEZXNjcmlwdGlvbjtcclxuY29uc3QgbnVtYmVyT25lQ29pbFN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5Lm51bWJlck9uZUNvaWw7XHJcbmNvbnN0IG51bWJlclR3b0NvaWxTdHJpbmcgPSBGYXJhZGF5c0xhd1N0cmluZ3MuYTExeS5udW1iZXJUd29Db2lsO1xyXG5jb25zdCBjaXJjdWl0TW9kZVN0cmluZyA9IEZhcmFkYXlzTGF3U3RyaW5ncy5hMTF5LmNpcmN1aXRNb2RlO1xyXG5jb25zdCBmaWVsZExpbmVzU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuZmllbGRMaW5lcztcclxuY29uc3QgZmllbGRMaW5lc0Rlc2NyaXB0aW9uU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuZmllbGRMaW5lc0Rlc2NyaXB0aW9uO1xyXG5cclxuY2xhc3MgQ29udHJvbFBhbmVsTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZhcmFkYXlzTGF3TW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhZ05hbWU6ICd1bCdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyByZXNldCBidXR0b24gLSBhZGRlZCBhdCBlbmQgb2YgY29uc3RydWN0b3IgZm9yIGExMXkgb3JkZXJpbmdcclxuICAgIGNvbnN0IHJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiBtb2RlbC5yZXNldC5iaW5kKCBtb2RlbCApLFxyXG4gICAgICByaWdodDogbW9kZWwuYm91bmRzLm1heFggLSAxMCxcclxuICAgICAgYm90dG9tOiAwLFxyXG4gICAgICBzY2FsZTogMC43NSxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2xpJyxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmVzZXRBbGxCdXR0b24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBmbGlwIG1hZ25ldCBidXR0b25cclxuICAgIHRoaXMuZmxpcE1hZ25ldEJ1dHRvbiA9IG5ldyBGbGlwTWFnbmV0QnV0dG9uKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZmxpcE1hZ25ldEJ1dHRvbicgKSwge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gbW9kZWwubWFnbmV0Lm9yaWVudGF0aW9uUHJvcGVydHkudmFsdWU7XHJcbiAgICAgICAgbW9kZWwubWFnbmV0Lm9yaWVudGF0aW9uUHJvcGVydHkuc2V0KCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb25FbnVtLk5TID8gT3JpZW50YXRpb25FbnVtLlNOIDogT3JpZW50YXRpb25FbnVtLk5TICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGJvdHRvbTogMCxcclxuICAgICAgcmlnaHQ6IG1vZGVsLmJvdW5kcy5tYXhYIC0gMTEwXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmZsaXBNYWduZXRCdXR0b24gKTtcclxuXHJcbiAgICAvLyBhZGQgcmFkaW8gYnV0dG9uIGdyb3VwIGZvciBzaG93aW5nL2hpZGluZyB0aGUgc2Vjb25kIGNvaWxcclxuICAgIGNvbnN0IGNvaWxCdXR0b25Hcm91cE9wdGlvbnMgPSB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzY2FsZTogMC4yMVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBjb2lsQnV0dG9uR3JvdXBDb250ZW50cyA9IFsge1xyXG4gICAgICB2YWx1ZTogZmFsc2UsXHJcbiAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBWQm94KCBtZXJnZSgge1xyXG4gICAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgICBuZXcgQ29pbE5vZGUoIENvaWxUeXBlRW51bS5UV09fQ09JTCwgeyB2aXNpYmxlOiBmYWxzZSB9ICksXHJcbiAgICAgICAgICBuZXcgQ29pbE5vZGUoIENvaWxUeXBlRW51bS5GT1VSX0NPSUwgKVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgICAgfSwgY29pbEJ1dHRvbkdyb3VwT3B0aW9ucyApICksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdzaW5nbGVDb2lsUmFkaW9CdXR0b24nLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnUmFkaW8gYnV0dG9uIHRoYXQgc2VsZWN0cyBhIHNpbmdsZSBjb2lsLicsXHJcbiAgICAgIGxhYmVsQ29udGVudDogbnVtYmVyT25lQ29pbFN0cmluZ1xyXG4gICAgfSwge1xyXG4gICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgY3JlYXRlTm9kZTogKCkgPT4gbmV3IFZCb3goIG1lcmdlKCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIG5ldyBDb2lsTm9kZSggQ29pbFR5cGVFbnVtLlRXT19DT0lMICksXHJcbiAgICAgICAgICBuZXcgQ29pbE5vZGUoIENvaWxUeXBlRW51bS5GT1VSX0NPSUwgKVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogZmFsc2VcclxuICAgICAgfSwgY29pbEJ1dHRvbkdyb3VwT3B0aW9ucyApICksXHJcbiAgICAgIHRhbmRlbU5hbWU6ICdkb3VibGVDb2lsUmFkaW9CdXR0b24nLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnUmFkaW8gYnV0dG9uIHRoYXQgc2VsZWN0cyBkb3VibGUgY29pbHMuJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBudW1iZXJUd29Db2lsU3RyaW5nXHJcbiAgICB9IF07XHJcblxyXG4gICAgY29uc3QgY29pbFJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKCBtb2RlbC50b3BDb2lsVmlzaWJsZVByb3BlcnR5LCBjb2lsQnV0dG9uR3JvdXBDb250ZW50cywge1xyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICB4TWFyZ2luOiAyMCxcclxuICAgICAgICB5TWFyZ2luOiA0LFxyXG4gICAgICAgIGJhc2VDb2xvcjogJyNjZGQ1ZjYnLCAvLyBsYXZlbmRlci1pc2hcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XHJcbiAgICAgICAgICBzZWxlY3RlZExpbmVXaWR0aDogMyxcclxuICAgICAgICAgIGRlc2VsZWN0ZWRMaW5lV2lkdGg6IDFcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGxlZnQ6IDM3NyxcclxuICAgICAgYm90dG9tOiAwLFxyXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb2lsUmFkaW9CdXR0b25Hcm91cCcgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1JhZGlvIGJ1dHRvbiBncm91cCB0aGF0IHNlbGVjdHMgYmV0d2VlbiBvbmUgb3IgdHdvIGNvaWxzLicsXHJcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdsaScsXHJcbiAgICAgIGxhYmVsQ29udGVudDogY2lyY3VpdE1vZGVTdHJpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICBtb2RlbC50b3BDb2lsVmlzaWJsZVByb3BlcnR5LmxhenlMaW5rKCBzaG93VG9wQ29pbCA9PiB7XHJcbiAgICAgIEZhcmFkYXlzTGF3QWxlcnRNYW5hZ2VyLmNvaWxDb25uZWN0aW9uQWxlcnQoIHNob3dUb3BDb2lsICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2hvd1ZvbHRtZXRlckxhYmVsID0gbmV3IFRleHQoIGZhcmFkYXlzTGF3Vm9sdG1ldGVyU3RyaW5nLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSB9ICk7XHJcbiAgICBzaG93Vm9sdG1ldGVyTGFiZWwuc2NhbGUoIE1hdGgubWluKCAxNTAgLyBzaG93Vm9sdG1ldGVyTGFiZWwud2lkdGgsIDEgKSApO1xyXG5cclxuICAgIGNvbnN0IHZvbHRtZXRlckNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBtb2RlbC52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHksIHNob3dWb2x0bWV0ZXJMYWJlbCwge1xyXG4gICAgICB4OiAxNzQsXHJcbiAgICAgIGNlbnRlclk6IGNvaWxSYWRpb0J1dHRvbkdyb3VwLmNlbnRlclkgLSAyMCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdG1ldGVyQ2hlY2tib3gnICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDaGVja2JveCB0aGF0IHNlbGVjdHMgd2hldGhlciB0aGUgdm9sdG1ldGVyIHdpbGwgYmUgc2hvd24uJyxcclxuICAgICAgY29udGFpbmVyVGFnTmFtZTogJ2xpJyxcclxuICAgICAgbGFiZWxUYWdOYW1lOiAnbGFiZWwnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6IHZvbHRtZXRlclN0cmluZyxcclxuICAgICAgZGVzY3JpcHRpb25Db250ZW50OiB2b2x0bWV0ZXJEZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgdm9sdG1ldGVyQ2hlY2tib3gudG91Y2hBcmVhID0gdm9sdG1ldGVyQ2hlY2tib3gubG9jYWxCb3VuZHMuZGlsYXRlZCggOCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdm9sdG1ldGVyQ2hlY2tib3ggKTtcclxuXHJcbiAgICBtb2RlbC52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHNob3dWb2x0bWV0ZXIgPT4ge1xyXG4gICAgICBGYXJhZGF5c0xhd0FsZXJ0TWFuYWdlci52b2x0bWV0ZXJBdHRhY2htZW50QWxlcnQoIHNob3dWb2x0bWV0ZXIgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGxhYmVsIGZvciB0aGUgXCJTaG93IEZpZWxkIExpbmVzXCIgY2hlY2tib3gsIHNjYWxpbmcgaXQgaWYgaXQncyB0b28gbG9uZy5cclxuICAgIGNvbnN0IHNob3dGaWVsZExpbmVzTGFiZWwgPSBuZXcgVGV4dCggZmFyYWRheXNMYXdTaG93RmllbGRMaW5lc1N0cmluZywgeyBmb250OiBuZXcgUGhldEZvbnQoIDE2ICkgfSApO1xyXG4gICAgc2hvd0ZpZWxkTGluZXNMYWJlbC5zY2FsZSggTWF0aC5taW4oIDE1MCAvIHNob3dGaWVsZExpbmVzTGFiZWwud2lkdGgsIDEgKSApOyAvLyBtYXggd2lkdGggZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG5cclxuICAgIC8vIHNob3cgZmllbGQgbGluZXNcclxuICAgIGNvbnN0IGZpZWxkTGluZXNDaGVja2JveCA9IG5ldyBDaGVja2JveCggbW9kZWwubWFnbmV0LmZpZWxkTGluZXNWaXNpYmxlUHJvcGVydHksIHNob3dGaWVsZExpbmVzTGFiZWwsIHtcclxuICAgICAgeDogMTc0LFxyXG4gICAgICBjZW50ZXJZOiBjb2lsUmFkaW9CdXR0b25Hcm91cC5jZW50ZXJZICsgMjAsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZpZWxkTGluZXNDaGVja2JveCcgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0NoZWNrYm94IHRoYXQgc2VsZWN0cyB3aGV0aGVyIHRoZSBtYWduZXRpYyBmaWVsZCBsaW5lcyB3aWxsIGJlIHNob3duLicsXHJcbiAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdsaScsXHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBmaWVsZExpbmVzU3RyaW5nLFxyXG4gICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IGZpZWxkTGluZXNEZXNjcmlwdGlvblN0cmluZ1xyXG4gICAgfSApO1xyXG4gICAgZmllbGRMaW5lc0NoZWNrYm94LnRvdWNoQXJlYSA9IGZpZWxkTGluZXNDaGVja2JveC5sb2NhbEJvdW5kcy5kaWxhdGVkKCA4ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBmaWVsZExpbmVzQ2hlY2tib3ggKTtcclxuXHJcbiAgICBtb2RlbC5tYWduZXQuZmllbGRMaW5lc1Zpc2libGVQcm9wZXJ0eS5sYXp5TGluayggc2hvd0xpbmVzID0+IHtcclxuICAgICAgRmFyYWRheXNMYXdBbGVydE1hbmFnZXIuZmllbGRMaW5lc1Zpc2liaWxpdHlBbGVydCggc2hvd0xpbmVzICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggY29pbFJhZGlvQnV0dG9uR3JvdXAgKTtcclxuXHJcbiAgICAvLyBmb3IgYTExeSBvcmRlcmluZ1xyXG4gICAgdGhpcy5hZGRDaGlsZCggcmVzZXRBbGxCdXR0b24gKTtcclxuXHJcbiAgICB0aGlzLmJvdHRvbSA9IG1vZGVsLmJvdW5kcy5tYXhZIC0gMTA7XHJcblxyXG4gICAgLy8gcGRvbSBrZXlib2FyZCBuYXYgb3JkZXJcclxuICAgIHRoaXMucGRvbU9yZGVyID0gW1xyXG4gICAgICB2b2x0bWV0ZXJDaGVja2JveCxcclxuICAgICAgZmllbGRMaW5lc0NoZWNrYm94LFxyXG4gICAgICBjb2lsUmFkaW9CdXR0b25Hcm91cFxyXG4gICAgXTtcclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnQ29udHJvbFBhbmVsTm9kZScsIENvbnRyb2xQYW5lbE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ29udHJvbFBhbmVsTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3BFLE9BQU9DLDJCQUEyQixNQUFNLDJEQUEyRDtBQUNuRyxPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLGVBQWUsTUFBTSw2QkFBNkI7QUFDekQsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyx1QkFBdUIs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