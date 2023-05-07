// Copyright 2022-2023, University of Colorado Boulder

/**
 * Control panel that allows users to choose what kind of projectile to fire
 * and view the properties of this projectile.
 * Also includes a checkbox for turning on and off air resistance.
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { HSeparator, HStrut, Text, VBox } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ProjectileMotionConstants from '../../common/ProjectileMotionConstants.js';
import AirResistanceControl from '../../common/view/AirResistanceControl.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
const diameterString = ProjectileMotionStrings.diameter;
const kgString = ProjectileMotionStrings.kg;
const massString = ProjectileMotionStrings.mass;
const mString = ProjectileMotionStrings.m;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;

// constants
const LABEL_OPTIONS = ProjectileMotionConstants.PANEL_LABEL_OPTIONS;
class StatsProjectileControlPanel extends Panel {
  /**
   * @param {Array.<ProjectileObjectType>} objectTypes - types of objects available for the dropdown model
   * @param {Property.<ProjectileObjectType>} selectedProjectileObjectTypeProperty - currently selected type of object
   * @param {Node} comboBoxListParent - node for containing the combo box
   * @param {Property.<number>} projectileMassProperty
   * @param {Property.<number>} projectileDiameterProperty
   * @param {Property.<number>} projectileDragCoefficientProperty
   * @param {Property.<boolean>} airResistanceOnProperty - whether air resistance is on
   * @param {Object} [options]
   */
  constructor(objectTypes, selectedProjectileObjectTypeProperty, comboBoxListParent, projectileMassProperty, projectileDiameterProperty, projectileDragCoefficientProperty, airResistanceOnProperty, options) {
    // The first object is a placeholder so none of the others get mutated
    // The second object is the default, in the constants files
    // The third object is options specific to this panel, which overrides the defaults
    // The fourth object is options given at time of construction, which overrides all the others
    options = merge({}, ProjectileMotionConstants.RIGHTSIDE_PANEL_OPTIONS, {
      tandem: Tandem.REQUIRED
    }, options);

    // maxWidth of the labels within the dropdown empirically determined
    const itemNodeOptions = merge({}, LABEL_OPTIONS, {
      maxWidth: 170
    });
    const firstItemNode = new VBox({
      align: 'left',
      children: [new Text(objectTypes[0].name, itemNodeOptions)]
    });
    const comboBoxWidth = options.minWidth - 2 * options.xMargin;
    const itemXMargin = 6;
    const buttonXMargin = 10;
    const comboBoxLineWidth = 1;

    // first item contains horizontal strut that sets width of combo box
    const firstItemNodeWidth = comboBoxWidth - itemXMargin - 0.5 * firstItemNode.height - 4 * buttonXMargin - 2 * itemXMargin - 2 * comboBoxLineWidth;
    firstItemNode.addChild(new HStrut(firstItemNodeWidth));
    const comboBoxItems = [];
    for (let i = 0; i < objectTypes.length; i++) {
      const projectileType = objectTypes[i];
      assert && assert(projectileType.benchmark, 'benchmark needed for tandemName');
      comboBoxItems[i] = {
        value: projectileType,
        createNode: () => i === 0 ? firstItemNode : new Text(projectileType.name, itemNodeOptions),
        tandemName: `${projectileType.benchmark}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      };
    }

    // create view for dropdown
    const projectileChoiceComboBox = new ComboBox(selectedProjectileObjectTypeProperty, comboBoxItems, comboBoxListParent, {
      xMargin: 12,
      yMargin: 7,
      cornerRadius: 4,
      buttonLineWidth: comboBoxLineWidth,
      listLineWidth: comboBoxLineWidth,
      tandem: options.tandem.createTandem('projectileChoiceComboBox'),
      phetioDocumentation: 'Combo box that selects what projectile type to launch from the cannon'
    });

    // local var for layout and formatting
    const parameterLabelOptions = merge({}, LABEL_OPTIONS, {
      maxWidth: options.minWidth - 2 * options.xMargin
    });

    /**
     * Auxiliary function that creates vbox for a parameter label and readouts
     * @private
     *
     * @param {string} labelString - label for the parameter
     * @param {string} unitsString - units
     * @param {Property.<number>} valueProperty - the Property that is set and linked to
     * @param {Tandem} tandem
     * @returns {VBox}
     */
    function createReadout(labelString, unitsString, valueProperty, tandem) {
      const parameterLabel = new Text('', merge({
        tandem: tandem,
        stringPropertyOptions: {
          phetioReadOnly: true
        }
      }, parameterLabelOptions));
      parameterLabel.setBoundsMethod('accurate');
      valueProperty.link(value => {
        const valueReadout = unitsString ? StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
          value: value,
          units: unitsString
        }) : Utils.toFixed(value, 2);
        parameterLabel.setString(`${labelString}: ${valueReadout}`);
      });
      return new VBox({
        align: 'left',
        children: [parameterLabel, new HStrut(parameterLabelOptions.maxWidth)]
      });
    }
    const massText = createReadout(massString, kgString, projectileMassProperty, options.tandem.createTandem('massText'));
    const diameterText = createReadout(diameterString, mString, projectileDiameterProperty, options.tandem.createTandem('diameterText'));

    // The contents of the control panel
    const content = new VBox({
      align: 'left',
      spacing: options.controlsVerticalSpace,
      children: [projectileChoiceComboBox, massText, diameterText, new HSeparator({
        stroke: ProjectileMotionConstants.SEPARATOR_COLOR
      }), new AirResistanceControl(airResistanceOnProperty, projectileDragCoefficientProperty, {
        labelOptions: LABEL_OPTIONS,
        minWidth: options.minWidth,
        xMargin: options.xMargin,
        spacing: options.controlsVerticalSpace,
        tandem: options.tandem.createTandem('airResistanceControl')
      })]
    });
    super(content, options);

    // @private make visible to methods
    this.projectileChoiceComboBox = projectileChoiceComboBox;
  }

  // @public for use by screen view
  hideComboBoxList() {
    this.projectileChoiceComboBox.hideListBox();
  }
}
projectileMotion.register('StatsProjectileControlPanel', StatsProjectileControlPanel);
export default StatsProjectileControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm1lcmdlIiwiU3RyaW5nVXRpbHMiLCJIU2VwYXJhdG9yIiwiSFN0cnV0IiwiVGV4dCIsIlZCb3giLCJDb21ib0JveCIsIlBhbmVsIiwiVGFuZGVtIiwiUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyIsIkFpclJlc2lzdGFuY2VDb250cm9sIiwicHJvamVjdGlsZU1vdGlvbiIsIlByb2plY3RpbGVNb3Rpb25TdHJpbmdzIiwiZGlhbWV0ZXJTdHJpbmciLCJkaWFtZXRlciIsImtnU3RyaW5nIiwia2ciLCJtYXNzU3RyaW5nIiwibWFzcyIsIm1TdHJpbmciLCJtIiwicGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZyIsInBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2UiLCJMQUJFTF9PUFRJT05TIiwiUEFORUxfTEFCRUxfT1BUSU9OUyIsIlN0YXRzUHJvamVjdGlsZUNvbnRyb2xQYW5lbCIsImNvbnN0cnVjdG9yIiwib2JqZWN0VHlwZXMiLCJzZWxlY3RlZFByb2plY3RpbGVPYmplY3RUeXBlUHJvcGVydHkiLCJjb21ib0JveExpc3RQYXJlbnQiLCJwcm9qZWN0aWxlTWFzc1Byb3BlcnR5IiwicHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHkiLCJwcm9qZWN0aWxlRHJhZ0NvZWZmaWNpZW50UHJvcGVydHkiLCJhaXJSZXNpc3RhbmNlT25Qcm9wZXJ0eSIsIm9wdGlvbnMiLCJSSUdIVFNJREVfUEFORUxfT1BUSU9OUyIsInRhbmRlbSIsIlJFUVVJUkVEIiwiaXRlbU5vZGVPcHRpb25zIiwibWF4V2lkdGgiLCJmaXJzdEl0ZW1Ob2RlIiwiYWxpZ24iLCJjaGlsZHJlbiIsIm5hbWUiLCJjb21ib0JveFdpZHRoIiwibWluV2lkdGgiLCJ4TWFyZ2luIiwiaXRlbVhNYXJnaW4iLCJidXR0b25YTWFyZ2luIiwiY29tYm9Cb3hMaW5lV2lkdGgiLCJmaXJzdEl0ZW1Ob2RlV2lkdGgiLCJoZWlnaHQiLCJhZGRDaGlsZCIsImNvbWJvQm94SXRlbXMiLCJpIiwibGVuZ3RoIiwicHJvamVjdGlsZVR5cGUiLCJhc3NlcnQiLCJiZW5jaG1hcmsiLCJ2YWx1ZSIsImNyZWF0ZU5vZGUiLCJ0YW5kZW1OYW1lIiwiSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVgiLCJwcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3giLCJ5TWFyZ2luIiwiY29ybmVyUmFkaXVzIiwiYnV0dG9uTGluZVdpZHRoIiwibGlzdExpbmVXaWR0aCIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwYXJhbWV0ZXJMYWJlbE9wdGlvbnMiLCJjcmVhdGVSZWFkb3V0IiwibGFiZWxTdHJpbmciLCJ1bml0c1N0cmluZyIsInZhbHVlUHJvcGVydHkiLCJwYXJhbWV0ZXJMYWJlbCIsInN0cmluZ1Byb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5Iiwic2V0Qm91bmRzTWV0aG9kIiwibGluayIsInZhbHVlUmVhZG91dCIsImZpbGxJbiIsInVuaXRzIiwidG9GaXhlZCIsInNldFN0cmluZyIsIm1hc3NUZXh0IiwiZGlhbWV0ZXJUZXh0IiwiY29udGVudCIsInNwYWNpbmciLCJjb250cm9sc1ZlcnRpY2FsU3BhY2UiLCJzdHJva2UiLCJTRVBBUkFUT1JfQ09MT1IiLCJsYWJlbE9wdGlvbnMiLCJoaWRlQ29tYm9Cb3hMaXN0IiwiaGlkZUxpc3RCb3giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN0YXRzUHJvamVjdGlsZUNvbnRyb2xQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9sIHBhbmVsIHRoYXQgYWxsb3dzIHVzZXJzIHRvIGNob29zZSB3aGF0IGtpbmQgb2YgcHJvamVjdGlsZSB0byBmaXJlXHJcbiAqIGFuZCB2aWV3IHRoZSBwcm9wZXJ0aWVzIG9mIHRoaXMgcHJvamVjdGlsZS5cclxuICogQWxzbyBpbmNsdWRlcyBhIGNoZWNrYm94IGZvciB0dXJuaW5nIG9uIGFuZCBvZmYgYWlyIHJlc2lzdGFuY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNYXR0aGV3IEJsYWNrbWFuIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IEhTZXBhcmF0b3IsIEhTdHJ1dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1Byb2plY3RpbGVNb3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQWlyUmVzaXN0YW5jZUNvbnRyb2wgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQWlyUmVzaXN0YW5jZUNvbnRyb2wuanMnO1xyXG5pbXBvcnQgcHJvamVjdGlsZU1vdGlvbiBmcm9tICcuLi8uLi9wcm9qZWN0aWxlTW90aW9uLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzIGZyb20gJy4uLy4uL1Byb2plY3RpbGVNb3Rpb25TdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IGRpYW1ldGVyU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuZGlhbWV0ZXI7XHJcbmNvbnN0IGtnU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3Mua2c7XHJcbmNvbnN0IG1hc3NTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5tYXNzO1xyXG5jb25zdCBtU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MubTtcclxuY29uc3QgcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZyA9XHJcbiAgUHJvamVjdGlsZU1vdGlvblN0cmluZ3MucGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBMQUJFTF9PUFRJT05TID0gUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5QQU5FTF9MQUJFTF9PUFRJT05TO1xyXG5cclxuY2xhc3MgU3RhdHNQcm9qZWN0aWxlQ29udHJvbFBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QXJyYXkuPFByb2plY3RpbGVPYmplY3RUeXBlPn0gb2JqZWN0VHlwZXMgLSB0eXBlcyBvZiBvYmplY3RzIGF2YWlsYWJsZSBmb3IgdGhlIGRyb3Bkb3duIG1vZGVsXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48UHJvamVjdGlsZU9iamVjdFR5cGU+fSBzZWxlY3RlZFByb2plY3RpbGVPYmplY3RUeXBlUHJvcGVydHkgLSBjdXJyZW50bHkgc2VsZWN0ZWQgdHlwZSBvZiBvYmplY3RcclxuICAgKiBAcGFyYW0ge05vZGV9IGNvbWJvQm94TGlzdFBhcmVudCAtIG5vZGUgZm9yIGNvbnRhaW5pbmcgdGhlIGNvbWJvIGJveFxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHByb2plY3RpbGVNYXNzUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBwcm9qZWN0aWxlRGlhbWV0ZXJQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHByb2plY3RpbGVEcmFnQ29lZmZpY2llbnRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBhaXJSZXNpc3RhbmNlT25Qcm9wZXJ0eSAtIHdoZXRoZXIgYWlyIHJlc2lzdGFuY2UgaXMgb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBvYmplY3RUeXBlcyxcclxuICAgIHNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eSxcclxuICAgIGNvbWJvQm94TGlzdFBhcmVudCxcclxuICAgIHByb2plY3RpbGVNYXNzUHJvcGVydHksXHJcbiAgICBwcm9qZWN0aWxlRGlhbWV0ZXJQcm9wZXJ0eSxcclxuICAgIHByb2plY3RpbGVEcmFnQ29lZmZpY2llbnRQcm9wZXJ0eSxcclxuICAgIGFpclJlc2lzdGFuY2VPblByb3BlcnR5LFxyXG4gICAgb3B0aW9uc1xyXG4gICkge1xyXG4gICAgLy8gVGhlIGZpcnN0IG9iamVjdCBpcyBhIHBsYWNlaG9sZGVyIHNvIG5vbmUgb2YgdGhlIG90aGVycyBnZXQgbXV0YXRlZFxyXG4gICAgLy8gVGhlIHNlY29uZCBvYmplY3QgaXMgdGhlIGRlZmF1bHQsIGluIHRoZSBjb25zdGFudHMgZmlsZXNcclxuICAgIC8vIFRoZSB0aGlyZCBvYmplY3QgaXMgb3B0aW9ucyBzcGVjaWZpYyB0byB0aGlzIHBhbmVsLCB3aGljaCBvdmVycmlkZXMgdGhlIGRlZmF1bHRzXHJcbiAgICAvLyBUaGUgZm91cnRoIG9iamVjdCBpcyBvcHRpb25zIGdpdmVuIGF0IHRpbWUgb2YgY29uc3RydWN0aW9uLCB3aGljaCBvdmVycmlkZXMgYWxsIHRoZSBvdGhlcnNcclxuICAgIG9wdGlvbnMgPSBtZXJnZShcclxuICAgICAge30sXHJcbiAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUklHSFRTSURFX1BBTkVMX09QVElPTlMsXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgICB9LFxyXG4gICAgICBvcHRpb25zXHJcbiAgICApO1xyXG5cclxuICAgIC8vIG1heFdpZHRoIG9mIHRoZSBsYWJlbHMgd2l0aGluIHRoZSBkcm9wZG93biBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICBjb25zdCBpdGVtTm9kZU9wdGlvbnMgPSBtZXJnZSgge30sIExBQkVMX09QVElPTlMsIHsgbWF4V2lkdGg6IDE3MCB9ICk7XHJcblxyXG4gICAgY29uc3QgZmlyc3RJdGVtTm9kZSA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGFsaWduOiAnbGVmdCcsXHJcbiAgICAgIGNoaWxkcmVuOiBbIG5ldyBUZXh0KCBvYmplY3RUeXBlc1sgMCBdLm5hbWUsIGl0ZW1Ob2RlT3B0aW9ucyApIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb21ib0JveFdpZHRoID0gb3B0aW9ucy5taW5XaWR0aCAtIDIgKiBvcHRpb25zLnhNYXJnaW47XHJcbiAgICBjb25zdCBpdGVtWE1hcmdpbiA9IDY7XHJcbiAgICBjb25zdCBidXR0b25YTWFyZ2luID0gMTA7XHJcbiAgICBjb25zdCBjb21ib0JveExpbmVXaWR0aCA9IDE7XHJcblxyXG4gICAgLy8gZmlyc3QgaXRlbSBjb250YWlucyBob3Jpem9udGFsIHN0cnV0IHRoYXQgc2V0cyB3aWR0aCBvZiBjb21ibyBib3hcclxuICAgIGNvbnN0IGZpcnN0SXRlbU5vZGVXaWR0aCA9XHJcbiAgICAgIGNvbWJvQm94V2lkdGggLVxyXG4gICAgICBpdGVtWE1hcmdpbiAtXHJcbiAgICAgIDAuNSAqIGZpcnN0SXRlbU5vZGUuaGVpZ2h0IC1cclxuICAgICAgNCAqIGJ1dHRvblhNYXJnaW4gLVxyXG4gICAgICAyICogaXRlbVhNYXJnaW4gLVxyXG4gICAgICAyICogY29tYm9Cb3hMaW5lV2lkdGg7XHJcbiAgICBmaXJzdEl0ZW1Ob2RlLmFkZENoaWxkKCBuZXcgSFN0cnV0KCBmaXJzdEl0ZW1Ob2RlV2lkdGggKSApO1xyXG5cclxuICAgIGNvbnN0IGNvbWJvQm94SXRlbXMgPSBbXTtcclxuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBvYmplY3RUeXBlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgcHJvamVjdGlsZVR5cGUgPSBvYmplY3RUeXBlc1sgaSBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwcm9qZWN0aWxlVHlwZS5iZW5jaG1hcmssICdiZW5jaG1hcmsgbmVlZGVkIGZvciB0YW5kZW1OYW1lJyApO1xyXG5cclxuICAgICAgY29tYm9Cb3hJdGVtc1sgaSBdID0ge1xyXG4gICAgICAgIHZhbHVlOiBwcm9qZWN0aWxlVHlwZSxcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBpID09PSAwID8gZmlyc3RJdGVtTm9kZSA6IG5ldyBUZXh0KCBwcm9qZWN0aWxlVHlwZS5uYW1lLCBpdGVtTm9kZU9wdGlvbnMgKSxcclxuICAgICAgICB0YW5kZW1OYW1lOiBgJHtwcm9qZWN0aWxlVHlwZS5iZW5jaG1hcmt9JHtDb21ib0JveC5JVEVNX1RBTkRFTV9OQU1FX1NVRkZJWH1gXHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlIHZpZXcgZm9yIGRyb3Bkb3duXHJcbiAgICBjb25zdCBwcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3ggPSBuZXcgQ29tYm9Cb3goXHJcbiAgICAgIHNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eSxcclxuICAgICAgY29tYm9Cb3hJdGVtcyxcclxuICAgICAgY29tYm9Cb3hMaXN0UGFyZW50LFxyXG4gICAgICB7XHJcbiAgICAgICAgeE1hcmdpbjogMTIsXHJcbiAgICAgICAgeU1hcmdpbjogNyxcclxuICAgICAgICBjb3JuZXJSYWRpdXM6IDQsXHJcbiAgICAgICAgYnV0dG9uTGluZVdpZHRoOiBjb21ib0JveExpbmVXaWR0aCxcclxuICAgICAgICBsaXN0TGluZVdpZHRoOiBjb21ib0JveExpbmVXaWR0aCxcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Byb2plY3RpbGVDaG9pY2VDb21ib0JveCcgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOlxyXG4gICAgICAgICAgJ0NvbWJvIGJveCB0aGF0IHNlbGVjdHMgd2hhdCBwcm9qZWN0aWxlIHR5cGUgdG8gbGF1bmNoIGZyb20gdGhlIGNhbm5vbidcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBsb2NhbCB2YXIgZm9yIGxheW91dCBhbmQgZm9ybWF0dGluZ1xyXG4gICAgY29uc3QgcGFyYW1ldGVyTGFiZWxPcHRpb25zID0gbWVyZ2UoIHt9LCBMQUJFTF9PUFRJT05TLCB7XHJcbiAgICAgIG1heFdpZHRoOiBvcHRpb25zLm1pbldpZHRoIC0gMiAqIG9wdGlvbnMueE1hcmdpblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXV4aWxpYXJ5IGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyB2Ym94IGZvciBhIHBhcmFtZXRlciBsYWJlbCBhbmQgcmVhZG91dHNcclxuICAgICAqIEBwcml2YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsU3RyaW5nIC0gbGFiZWwgZm9yIHRoZSBwYXJhbWV0ZXJcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB1bml0c1N0cmluZyAtIHVuaXRzXHJcbiAgICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSB2YWx1ZVByb3BlcnR5IC0gdGhlIFByb3BlcnR5IHRoYXQgaXMgc2V0IGFuZCBsaW5rZWQgdG9cclxuICAgICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgICAqIEByZXR1cm5zIHtWQm94fVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVSZWFkb3V0KCBsYWJlbFN0cmluZywgdW5pdHNTdHJpbmcsIHZhbHVlUHJvcGVydHksIHRhbmRlbSApIHtcclxuICAgICAgY29uc3QgcGFyYW1ldGVyTGFiZWwgPSBuZXcgVGV4dChcclxuICAgICAgICAnJyxcclxuICAgICAgICBtZXJnZShcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgICAgICAgIHN0cmluZ1Byb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgcGFyYW1ldGVyTGFiZWxPcHRpb25zXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgcGFyYW1ldGVyTGFiZWwuc2V0Qm91bmRzTWV0aG9kKCAnYWNjdXJhdGUnICk7XHJcblxyXG4gICAgICB2YWx1ZVByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgICBjb25zdCB2YWx1ZVJlYWRvdXQgPSB1bml0c1N0cmluZyA/IFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZywge1xyXG4gICAgICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICAgICAgdW5pdHM6IHVuaXRzU3RyaW5nXHJcbiAgICAgICAgfSApIDogVXRpbHMudG9GaXhlZCggdmFsdWUsIDIgKTtcclxuICAgICAgICBwYXJhbWV0ZXJMYWJlbC5zZXRTdHJpbmcoIGAke2xhYmVsU3RyaW5nfTogJHt2YWx1ZVJlYWRvdXR9YCApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IFZCb3goIHtcclxuICAgICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICAgIGNoaWxkcmVuOiBbIHBhcmFtZXRlckxhYmVsLCBuZXcgSFN0cnV0KCBwYXJhbWV0ZXJMYWJlbE9wdGlvbnMubWF4V2lkdGggKSBdXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYXNzVGV4dCA9IGNyZWF0ZVJlYWRvdXQoXHJcbiAgICAgIG1hc3NTdHJpbmcsXHJcbiAgICAgIGtnU3RyaW5nLFxyXG4gICAgICBwcm9qZWN0aWxlTWFzc1Byb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXNzVGV4dCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBkaWFtZXRlclRleHQgPSBjcmVhdGVSZWFkb3V0KFxyXG4gICAgICBkaWFtZXRlclN0cmluZyxcclxuICAgICAgbVN0cmluZyxcclxuICAgICAgcHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RpYW1ldGVyVGV4dCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBUaGUgY29udGVudHMgb2YgdGhlIGNvbnRyb2wgcGFuZWxcclxuICAgIGNvbnN0IGNvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiBvcHRpb25zLmNvbnRyb2xzVmVydGljYWxTcGFjZSxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBwcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3gsXHJcbiAgICAgICAgbWFzc1RleHQsXHJcbiAgICAgICAgZGlhbWV0ZXJUZXh0LFxyXG4gICAgICAgIG5ldyBIU2VwYXJhdG9yKCB7IHN0cm9rZTogUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5TRVBBUkFUT1JfQ09MT1IgfSApLFxyXG4gICAgICAgIG5ldyBBaXJSZXNpc3RhbmNlQ29udHJvbChcclxuICAgICAgICAgIGFpclJlc2lzdGFuY2VPblByb3BlcnR5LFxyXG4gICAgICAgICAgcHJvamVjdGlsZURyYWdDb2VmZmljaWVudFByb3BlcnR5LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBsYWJlbE9wdGlvbnM6IExBQkVMX09QVElPTlMsXHJcbiAgICAgICAgICAgIG1pbldpZHRoOiBvcHRpb25zLm1pbldpZHRoLFxyXG4gICAgICAgICAgICB4TWFyZ2luOiBvcHRpb25zLnhNYXJnaW4sXHJcbiAgICAgICAgICAgIHNwYWNpbmc6IG9wdGlvbnMuY29udHJvbHNWZXJ0aWNhbFNwYWNlLFxyXG4gICAgICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FpclJlc2lzdGFuY2VDb250cm9sJyApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBtYWtlIHZpc2libGUgdG8gbWV0aG9kc1xyXG4gICAgdGhpcy5wcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3ggPSBwcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3g7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIGZvciB1c2UgYnkgc2NyZWVuIHZpZXdcclxuICBoaWRlQ29tYm9Cb3hMaXN0KCkge1xyXG4gICAgdGhpcy5wcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3guaGlkZUxpc3RCb3goKTtcclxuICB9XHJcbn1cclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdTdGF0c1Byb2plY3RpbGVDb250cm9sUGFuZWwnLCBTdGF0c1Byb2plY3RpbGVDb250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgU3RhdHNQcm9qZWN0aWxlQ29udHJvbFBhbmVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsU0FBU0MsVUFBVSxFQUFFQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNsRixPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JE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