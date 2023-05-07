// Copyright 2016-2023, University of Colorado Boulder

/**
 * Control panel allows the user to change a projectile's parameters
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import { HBox, HSeparator, HStrut, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ProjectileMotionConstants from '../../common/ProjectileMotionConstants.js';
import projectileMotion from '../../projectileMotion.js';
import ProjectileMotionStrings from '../../ProjectileMotionStrings.js';
import CustomProjectileObjectTypeControl from './CustomProjectileObjectTypeControl.js';
import ProjectileObjectTypeControl from './ProjectileObjectTypeControl.js';
const airResistanceString = ProjectileMotionStrings.airResistance;
const altitudeString = ProjectileMotionStrings.altitude;
const diameterString = ProjectileMotionStrings.diameter;
const dragCoefficientString = ProjectileMotionStrings.dragCoefficient;
const gravityString = ProjectileMotionStrings.gravity;
const kgString = ProjectileMotionStrings.kg;
const massString = ProjectileMotionStrings.mass;
const metersPerSecondSquaredString = ProjectileMotionStrings.metersPerSecondSquared;
const mString = ProjectileMotionStrings.m;
const pattern0Value1UnitsWithSpaceString = ProjectileMotionStrings.pattern0Value1UnitsWithSpace;

// constants
const LABEL_OPTIONS = ProjectileMotionConstants.PANEL_LABEL_OPTIONS;
const TEXT_FONT = ProjectileMotionConstants.PANEL_LABEL_OPTIONS.font;
const READOUT_X_MARGIN = 4;
const AIR_RESISTANCE_ICON = ProjectileMotionConstants.AIR_RESISTANCE_ICON;
const GRAVITY_READOUT_X_MARGIN = 6;
class LabProjectileControlPanel extends Node {
  /**
   * @param {Node} comboBoxListParent - node for containing the combo box
   * @param {KeypadLayer} keypadLayer - for entering values
   * @param {LabModel} model
   * @param {Object} [options]
   */
  constructor(comboBoxListParent, keypadLayer, model, options) {
    super();

    // convenience variables as much of the logic in this type is in prototype functions only called on construction.
    // @private
    this.objectTypes = model.objectTypes;
    this.objectTypeControls = []; // {Array.<ProjectileObjectTypeControl>} same size as objectTypes, holds a Node that is the controls;
    this.keypadLayer = keypadLayer;
    this.model = model; // @private

    // The first object is a placeholder so none of the others get mutated
    // The second object is the default, in the constants files
    // The third object is options specific to this panel, which overrides the defaults
    // The fourth object is options given at time of construction, which overrides all the others
    options = merge({}, ProjectileMotionConstants.RIGHTSIDE_PANEL_OPTIONS, {
      tandem: Tandem.REQUIRED
    }, options);

    // @private save them for later
    this.options = options;

    // @private - these number controls don't change between all "benchmarked" elements (not custom), so we can reuse them
    this.gravityNumberControl = null;
    this.altitudeNumberControl = null;

    // @private;
    this.textDisplayWidth = options.textDisplayWidth * 1.4;

    // @private - toggle the visibility of all ProjectileObjectType mass NumberControls with a single Property. Created
    // for PhET-iO.
    this.massNumberControlsVisibleProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('massNumberControlsVisibleProperty')
    });

    // @private - toggle the visibility of all ProjectileObjectType diameter NumberControls with a single Property. Created
    // for PhET-iO.
    this.diameterNumberControlsVisibleProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('diameterNumberControlsVisibleProperty')
    });

    // maxWidth empirically determined for labels in the dropdown
    const itemNodeOptions = merge({}, LABEL_OPTIONS, {
      maxWidth: 170
    });
    const firstItemNode = new VBox({
      align: 'left',
      children: [new Text(this.objectTypes[0].name, itemNodeOptions)]
    });
    const comboBoxWidth = options.minWidth - 2 * options.xMargin;
    const itemXMargin = 6;
    const buttonXMargin = 10;
    const comboBoxLineWidth = 1;

    // first item contains horizontal strut that sets width of combo box
    const firstItemNodeWidth = comboBoxWidth - itemXMargin - 0.5 * firstItemNode.height - 4 * buttonXMargin - 2 * itemXMargin - 2 * comboBoxLineWidth;
    firstItemNode.addChild(new HStrut(firstItemNodeWidth));
    const comboBoxItems = [];
    for (let i = 0; i < this.objectTypes.length; i++) {
      const projectileType = this.objectTypes[i];
      comboBoxItems[i] = {
        value: projectileType,
        createNode: () => i === 0 ? firstItemNode : new Text(projectileType.name, itemNodeOptions),
        tandemName: `${projectileType.benchmark}${ComboBox.ITEM_TANDEM_NAME_SUFFIX}`
      };

      // Create the controls for the projectileType too.
      this.objectTypeControls.push(this.createControlsForObjectType(projectileType, options.tandem, options.tandem.createTandem(`${projectileType.benchmark}Control`)));
    }

    // creating the controls for each object type changes these values because of enabledRangeProperty listeners in the
    // NumberControls. Here reset back to the selectedProjectileObjectType to fix things. See
    // https://github.com/phetsims/projectile-motion/issues/213
    model.resetModelValuesToInitial();

    // create view for the dropdown
    const projectileChoiceComboBox = new ComboBox(model.selectedProjectileObjectTypeProperty, comboBoxItems, comboBoxListParent, {
      xMargin: 12,
      yMargin: 8,
      cornerRadius: 4,
      buttonLineWidth: comboBoxLineWidth,
      listLineWidth: comboBoxLineWidth,
      tandem: options.tandem.createTandem('projectileChoiceComboBox'),
      phetioDocumentation: 'Combo box that selects what projectile type to launch from the cannon'
    });

    // @private make visible to methods
    this.projectileChoiceComboBox = projectileChoiceComboBox;

    // readout, slider, and tweakers

    // These containers are added into the Panel as desired, and their children are changed as the object type does.
    const massBox = new Node({
      excludeInvisibleChildrenFromBounds: true
    });
    const diameterBox = new Node({
      excludeInvisibleChildrenFromBounds: true
    });
    const dragCoefficientBox = new Node({
      excludeInvisibleChildrenFromBounds: true
    });
    const altitudeBox = new Node({
      excludeInvisibleChildrenFromBounds: true
    });
    const gravityBox = new Node({
      excludeInvisibleChildrenFromBounds: true
    });

    // update the type of control based on the objectType
    model.selectedProjectileObjectTypeProperty.link(objectType => {
      const objectTypeControls = this.objectTypeControls[this.objectTypes.indexOf(objectType)];
      massBox.children = [objectTypeControls.massControl];
      diameterBox.children = [objectTypeControls.diameterControl];
      dragCoefficientBox.children = [objectTypeControls.dragCoefficientControl];
      altitudeBox.children = [objectTypeControls.altitudeControl];
      gravityBox.children = [objectTypeControls.gravityControl];
    });

    // disabling and enabling drag and altitude controls depending on whether air resistance is on
    model.airResistanceOnProperty.link(airResistanceOn => {
      const opacity = airResistanceOn ? 1 : 0.5;
      altitudeBox.opacity = opacity;
      dragCoefficientBox.opacity = opacity;
      altitudeBox.setPickable(airResistanceOn);
      dragCoefficientBox.setPickable(airResistanceOn);
    });

    // air resistance
    const airResistanceLabel = new Text(airResistanceString, LABEL_OPTIONS);
    const airResistanceLabelAndIcon = new HBox({
      spacing: options.xMargin,
      children: [airResistanceLabel, new Node({
        children: [AIR_RESISTANCE_ICON]
      })]
    });
    const airResistanceCheckbox = new Checkbox(model.airResistanceOnProperty, airResistanceLabelAndIcon, {
      maxWidth: options.minWidth - AIR_RESISTANCE_ICON.width - 3 * options.xMargin,
      boxWidth: 18,
      tandem: options.tandem.createTandem('airResistanceCheckbox')
    });

    // The contents of the control panel
    const content = new VBox({
      align: 'left',
      spacing: options.controlsVerticalSpace,
      children: [projectileChoiceComboBox, massBox, diameterBox, new HSeparator({
        stroke: ProjectileMotionConstants.SEPARATOR_COLOR
      }), gravityBox, new HSeparator({
        stroke: ProjectileMotionConstants.SEPARATOR_COLOR
      }), airResistanceCheckbox, altitudeBox, dragCoefficientBox]
    });
    this.addChild(new Panel(content, options));
  }

  /**
   * for use by screen view
   * @public
   */
  hideComboBoxList() {
    this.projectileChoiceComboBox.hideListBox();
  }

  /**
   * Given an objectType, create the controls needed for that type.
   * @param {ProjectileObjectType} objectType
   * @param {Tandem} generalComponentTandem - used for the elements that can be reused between all elements
   * @param {Tandem} objectSpecificTandem - used for the elements that change for each object type
   * @returns {ProjectileObjectTypeControl}
   * @private
   */
  createControlsForObjectType(objectType, generalComponentTandem, objectSpecificTandem) {
    if (objectType.benchmark === 'custom') {
      return new CustomProjectileObjectTypeControl(this.model, this.keypadLayer, objectType, objectSpecificTandem, {
        xMargin: this.options.xMargin,
        minWidth: this.options.minWidth,
        readoutXMargin: this.options.readoutXMargin,
        textDisplayWidth: this.textDisplayWidth
      });
    } else {
      const defaultNumberControlOptions = {
        titleNodeOptions: {
          font: TEXT_FONT,
          // panel width - margins - numberDisplay margins and maxWidth
          maxWidth: this.options.minWidth - 3 * this.options.xMargin - 2 * READOUT_X_MARGIN - this.textDisplayWidth
        },
        numberDisplayOptions: {
          maxWidth: this.textDisplayWidth,
          align: 'right',
          xMargin: READOUT_X_MARGIN,
          yMargin: 4,
          textOptions: {
            font: TEXT_FONT
          }
        },
        sliderOptions: {
          majorTickLength: 5,
          trackSize: new Dimension2(this.options.minWidth - 2 * this.options.xMargin - 80, 0.5),
          thumbSize: new Dimension2(13, 22),
          thumbTouchAreaXDilation: 6,
          thumbTouchAreaYDilation: 4
        },
        arrowButtonOptions: {
          scale: 0.56,
          touchAreaXDilation: 20,
          touchAreaYDilation: 20
        },
        layoutFunction: NumberControl.createLayoutFunction4({
          arrowButtonSpacing: 10
        })
      };
      const massNumberControl = new NumberControl(massString, this.model.projectileMassProperty, objectType.massRange, merge({
        delta: objectType.massRound,
        numberDisplayOptions: {
          // '{{value}} kg'
          valuePattern: StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
            units: kgString
          }),
          decimalPlaces: Math.ceil(-Utils.log10(objectType.massRound))
        },
        sliderOptions: {
          constrainValue: value => Utils.roundSymmetric(value / objectType.massRound) * objectType.massRound,
          majorTicks: [{
            value: objectType.massRange.min,
            label: new Text(objectType.massRange.min, LABEL_OPTIONS)
          }, {
            value: objectType.massRange.max,
            label: new Text(objectType.massRange.max, LABEL_OPTIONS)
          }]
        },
        tandem: objectSpecificTandem.createTandem('massNumberControl'),
        phetioDocumentation: 'UI control to adjust the mass of the projectile'
      }, defaultNumberControlOptions));
      const diameterNumberControl = new NumberControl(diameterString, this.model.projectileDiameterProperty, objectType.diameterRange, merge({
        delta: objectType.diameterRound,
        numberDisplayOptions: {
          // '{{value}} m'
          valuePattern: StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
            units: mString
          }),
          decimalPlaces: Math.ceil(-Utils.log10(objectType.diameterRound))
        },
        sliderOptions: {
          constrainValue: value => Utils.roundSymmetric(value / objectType.diameterRound) * objectType.diameterRound,
          majorTicks: [{
            value: objectType.diameterRange.min,
            label: new Text(objectType.diameterRange.min, LABEL_OPTIONS)
          }, {
            value: objectType.diameterRange.max,
            label: new Text(objectType.diameterRange.max, LABEL_OPTIONS)
          }]
        },
        tandem: objectSpecificTandem.createTandem('diameterNumberControl'),
        phetioDocumentation: 'UI control to adjust the diameter of the projectile'
      }, defaultNumberControlOptions));
      const gravityNumberControl = this.gravityNumberControl || new NumberControl(gravityString, this.model.gravityProperty, ProjectileMotionConstants.GRAVITY_RANGE, merge({
        delta: 0.01,
        numberDisplayOptions: {
          // '{{value}} m/s^2
          valuePattern: StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
            units: metersPerSecondSquaredString
          }),
          decimalPlaces: 2,
          xMargin: GRAVITY_READOUT_X_MARGIN,
          maxWidth: this.textDisplayWidth + GRAVITY_READOUT_X_MARGIN
        },
        sliderOptions: {
          constrainValue: value => Utils.roundSymmetric(value * 100) / 100
        },
        tandem: generalComponentTandem.createTandem('gravityNumberControl'),
        phetioDocumentation: 'UI control to adjust the force of gravity on the projectile'
      }, defaultNumberControlOptions));
      this.gravityNumberControl = gravityNumberControl;
      const altitudeNumberControl = this.altitudeNumberControl || new NumberControl(altitudeString, this.model.altitudeProperty, ProjectileMotionConstants.ALTITUDE_RANGE, merge({
        delta: 100,
        numberDisplayOptions: {
          // '{{value}} m'
          valuePattern: StringUtils.fillIn(pattern0Value1UnitsWithSpaceString, {
            units: mString
          }),
          decimalPlaces: 0
        },
        sliderOptions: {
          constrainValue: value => Utils.roundSymmetric(value / 100) * 100
        },
        tandem: generalComponentTandem.createTandem('altitudeNumberControl'),
        phetioDocumentation: 'UI control to adjust the altitude of position where the projectile is being launched'
      }, defaultNumberControlOptions));
      this.altitudeNumberControl = altitudeNumberControl;
      const dragCoefficientText = new Text('', merge({}, LABEL_OPTIONS, {
        maxWidth: this.options.minWidth - 2 * this.options.xMargin
      }));

      // exists for the lifetime of the simulation
      this.model.projectileDragCoefficientProperty.link(dragCoefficient => {
        dragCoefficientText.string = `${dragCoefficientString}: ${Utils.toFixed(dragCoefficient, 2)}`;
      });

      // One direction of control. Instead of linking both to each other. This allows a single, global control to switch
      // all types' visibility at once, while also allowing a single numberControl the flexibility to hide itself.
      this.massNumberControlsVisibleProperty.link(visible => {
        massNumberControl.visibleProperty.value = visible;
      });
      this.diameterNumberControlsVisibleProperty.link(visible => {
        diameterNumberControl.visibleProperty.value = visible;
      });
      return new ProjectileObjectTypeControl(massNumberControl, diameterNumberControl, gravityNumberControl, altitudeNumberControl, dragCoefficientText);
    }
  }
}
projectileMotion.register('LabProjectileControlPanel', LabProjectileControlPanel);
export default LabProjectileControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiVXRpbHMiLCJtZXJnZSIsIlN0cmluZ1V0aWxzIiwiTnVtYmVyQ29udHJvbCIsIkhCb3giLCJIU2VwYXJhdG9yIiwiSFN0cnV0IiwiTm9kZSIsIlRleHQiLCJWQm94IiwiQ2hlY2tib3giLCJDb21ib0JveCIsIlBhbmVsIiwiVGFuZGVtIiwiUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cyIsInByb2plY3RpbGVNb3Rpb24iLCJQcm9qZWN0aWxlTW90aW9uU3RyaW5ncyIsIkN1c3RvbVByb2plY3RpbGVPYmplY3RUeXBlQ29udHJvbCIsIlByb2plY3RpbGVPYmplY3RUeXBlQ29udHJvbCIsImFpclJlc2lzdGFuY2VTdHJpbmciLCJhaXJSZXNpc3RhbmNlIiwiYWx0aXR1ZGVTdHJpbmciLCJhbHRpdHVkZSIsImRpYW1ldGVyU3RyaW5nIiwiZGlhbWV0ZXIiLCJkcmFnQ29lZmZpY2llbnRTdHJpbmciLCJkcmFnQ29lZmZpY2llbnQiLCJncmF2aXR5U3RyaW5nIiwiZ3Jhdml0eSIsImtnU3RyaW5nIiwia2ciLCJtYXNzU3RyaW5nIiwibWFzcyIsIm1ldGVyc1BlclNlY29uZFNxdWFyZWRTdHJpbmciLCJtZXRlcnNQZXJTZWNvbmRTcXVhcmVkIiwibVN0cmluZyIsIm0iLCJwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nIiwicGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZSIsIkxBQkVMX09QVElPTlMiLCJQQU5FTF9MQUJFTF9PUFRJT05TIiwiVEVYVF9GT05UIiwiZm9udCIsIlJFQURPVVRfWF9NQVJHSU4iLCJBSVJfUkVTSVNUQU5DRV9JQ09OIiwiR1JBVklUWV9SRUFET1VUX1hfTUFSR0lOIiwiTGFiUHJvamVjdGlsZUNvbnRyb2xQYW5lbCIsImNvbnN0cnVjdG9yIiwiY29tYm9Cb3hMaXN0UGFyZW50Iiwia2V5cGFkTGF5ZXIiLCJtb2RlbCIsIm9wdGlvbnMiLCJvYmplY3RUeXBlcyIsIm9iamVjdFR5cGVDb250cm9scyIsIlJJR0hUU0lERV9QQU5FTF9PUFRJT05TIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJncmF2aXR5TnVtYmVyQ29udHJvbCIsImFsdGl0dWRlTnVtYmVyQ29udHJvbCIsInRleHREaXNwbGF5V2lkdGgiLCJtYXNzTnVtYmVyQ29udHJvbHNWaXNpYmxlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJkaWFtZXRlck51bWJlckNvbnRyb2xzVmlzaWJsZVByb3BlcnR5IiwiaXRlbU5vZGVPcHRpb25zIiwibWF4V2lkdGgiLCJmaXJzdEl0ZW1Ob2RlIiwiYWxpZ24iLCJjaGlsZHJlbiIsIm5hbWUiLCJjb21ib0JveFdpZHRoIiwibWluV2lkdGgiLCJ4TWFyZ2luIiwiaXRlbVhNYXJnaW4iLCJidXR0b25YTWFyZ2luIiwiY29tYm9Cb3hMaW5lV2lkdGgiLCJmaXJzdEl0ZW1Ob2RlV2lkdGgiLCJoZWlnaHQiLCJhZGRDaGlsZCIsImNvbWJvQm94SXRlbXMiLCJpIiwibGVuZ3RoIiwicHJvamVjdGlsZVR5cGUiLCJ2YWx1ZSIsImNyZWF0ZU5vZGUiLCJ0YW5kZW1OYW1lIiwiYmVuY2htYXJrIiwiSVRFTV9UQU5ERU1fTkFNRV9TVUZGSVgiLCJwdXNoIiwiY3JlYXRlQ29udHJvbHNGb3JPYmplY3RUeXBlIiwicmVzZXRNb2RlbFZhbHVlc1RvSW5pdGlhbCIsInByb2plY3RpbGVDaG9pY2VDb21ib0JveCIsInNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eSIsInlNYXJnaW4iLCJjb3JuZXJSYWRpdXMiLCJidXR0b25MaW5lV2lkdGgiLCJsaXN0TGluZVdpZHRoIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsIm1hc3NCb3giLCJleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzIiwiZGlhbWV0ZXJCb3giLCJkcmFnQ29lZmZpY2llbnRCb3giLCJhbHRpdHVkZUJveCIsImdyYXZpdHlCb3giLCJsaW5rIiwib2JqZWN0VHlwZSIsImluZGV4T2YiLCJtYXNzQ29udHJvbCIsImRpYW1ldGVyQ29udHJvbCIsImRyYWdDb2VmZmljaWVudENvbnRyb2wiLCJhbHRpdHVkZUNvbnRyb2wiLCJncmF2aXR5Q29udHJvbCIsImFpclJlc2lzdGFuY2VPblByb3BlcnR5IiwiYWlyUmVzaXN0YW5jZU9uIiwib3BhY2l0eSIsInNldFBpY2thYmxlIiwiYWlyUmVzaXN0YW5jZUxhYmVsIiwiYWlyUmVzaXN0YW5jZUxhYmVsQW5kSWNvbiIsInNwYWNpbmciLCJhaXJSZXNpc3RhbmNlQ2hlY2tib3giLCJ3aWR0aCIsImJveFdpZHRoIiwiY29udGVudCIsImNvbnRyb2xzVmVydGljYWxTcGFjZSIsInN0cm9rZSIsIlNFUEFSQVRPUl9DT0xPUiIsImhpZGVDb21ib0JveExpc3QiLCJoaWRlTGlzdEJveCIsImdlbmVyYWxDb21wb25lbnRUYW5kZW0iLCJvYmplY3RTcGVjaWZpY1RhbmRlbSIsInJlYWRvdXRYTWFyZ2luIiwiZGVmYXVsdE51bWJlckNvbnRyb2xPcHRpb25zIiwidGl0bGVOb2RlT3B0aW9ucyIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwidGV4dE9wdGlvbnMiLCJzbGlkZXJPcHRpb25zIiwibWFqb3JUaWNrTGVuZ3RoIiwidHJhY2tTaXplIiwidGh1bWJTaXplIiwidGh1bWJUb3VjaEFyZWFYRGlsYXRpb24iLCJ0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiIsImFycm93QnV0dG9uT3B0aW9ucyIsInNjYWxlIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwibGF5b3V0RnVuY3Rpb24iLCJjcmVhdGVMYXlvdXRGdW5jdGlvbjQiLCJhcnJvd0J1dHRvblNwYWNpbmciLCJtYXNzTnVtYmVyQ29udHJvbCIsInByb2plY3RpbGVNYXNzUHJvcGVydHkiLCJtYXNzUmFuZ2UiLCJkZWx0YSIsIm1hc3NSb3VuZCIsInZhbHVlUGF0dGVybiIsImZpbGxJbiIsInVuaXRzIiwiZGVjaW1hbFBsYWNlcyIsIk1hdGgiLCJjZWlsIiwibG9nMTAiLCJjb25zdHJhaW5WYWx1ZSIsInJvdW5kU3ltbWV0cmljIiwibWFqb3JUaWNrcyIsIm1pbiIsImxhYmVsIiwibWF4IiwiZGlhbWV0ZXJOdW1iZXJDb250cm9sIiwicHJvamVjdGlsZURpYW1ldGVyUHJvcGVydHkiLCJkaWFtZXRlclJhbmdlIiwiZGlhbWV0ZXJSb3VuZCIsImdyYXZpdHlQcm9wZXJ0eSIsIkdSQVZJVFlfUkFOR0UiLCJhbHRpdHVkZVByb3BlcnR5IiwiQUxUSVRVREVfUkFOR0UiLCJkcmFnQ29lZmZpY2llbnRUZXh0IiwicHJvamVjdGlsZURyYWdDb2VmZmljaWVudFByb3BlcnR5Iiwic3RyaW5nIiwidG9GaXhlZCIsInZpc2libGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkxhYlByb2plY3RpbGVDb250cm9sUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbCBwYW5lbCBhbGxvd3MgdGhlIHVzZXIgdG8gY2hhbmdlIGEgcHJvamVjdGlsZSdzIHBhcmFtZXRlcnNcclxuICpcclxuICogQGF1dGhvciBBbmRyZWEgTGluIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCBOdW1iZXJDb250cm9sIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJDb250cm9sLmpzJztcclxuaW1wb3J0IHsgSEJveCwgSFNlcGFyYXRvciwgSFN0cnV0LCBOb2RlLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBDb21ib0JveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQ29tYm9Cb3guanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1Byb2plY3RpbGVNb3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgcHJvamVjdGlsZU1vdGlvbiBmcm9tICcuLi8uLi9wcm9qZWN0aWxlTW90aW9uLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzIGZyb20gJy4uLy4uL1Byb2plY3RpbGVNb3Rpb25TdHJpbmdzLmpzJztcclxuaW1wb3J0IEN1c3RvbVByb2plY3RpbGVPYmplY3RUeXBlQ29udHJvbCBmcm9tICcuL0N1c3RvbVByb2plY3RpbGVPYmplY3RUeXBlQ29udHJvbC5qcyc7XHJcbmltcG9ydCBQcm9qZWN0aWxlT2JqZWN0VHlwZUNvbnRyb2wgZnJvbSAnLi9Qcm9qZWN0aWxlT2JqZWN0VHlwZUNvbnRyb2wuanMnO1xyXG5cclxuY29uc3QgYWlyUmVzaXN0YW5jZVN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLmFpclJlc2lzdGFuY2U7XHJcbmNvbnN0IGFsdGl0dWRlU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuYWx0aXR1ZGU7XHJcbmNvbnN0IGRpYW1ldGVyU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MuZGlhbWV0ZXI7XHJcbmNvbnN0IGRyYWdDb2VmZmljaWVudFN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLmRyYWdDb2VmZmljaWVudDtcclxuY29uc3QgZ3Jhdml0eVN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLmdyYXZpdHk7XHJcbmNvbnN0IGtnU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3Mua2c7XHJcbmNvbnN0IG1hc3NTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5tYXNzO1xyXG5jb25zdCBtZXRlcnNQZXJTZWNvbmRTcXVhcmVkU3RyaW5nID0gUHJvamVjdGlsZU1vdGlvblN0cmluZ3MubWV0ZXJzUGVyU2Vjb25kU3F1YXJlZDtcclxuY29uc3QgbVN0cmluZyA9IFByb2plY3RpbGVNb3Rpb25TdHJpbmdzLm07XHJcbmNvbnN0IHBhdHRlcm4wVmFsdWUxVW5pdHNXaXRoU3BhY2VTdHJpbmcgPSBQcm9qZWN0aWxlTW90aW9uU3RyaW5ncy5wYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IExBQkVMX09QVElPTlMgPSBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlBBTkVMX0xBQkVMX09QVElPTlM7XHJcbmNvbnN0IFRFWFRfRk9OVCA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUEFORUxfTEFCRUxfT1BUSU9OUy5mb250O1xyXG5jb25zdCBSRUFET1VUX1hfTUFSR0lOID0gNDtcclxuY29uc3QgQUlSX1JFU0lTVEFOQ0VfSUNPTiA9IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuQUlSX1JFU0lTVEFOQ0VfSUNPTjtcclxuY29uc3QgR1JBVklUWV9SRUFET1VUX1hfTUFSR0lOID0gNjtcclxuXHJcbmNsYXNzIExhYlByb2plY3RpbGVDb250cm9sUGFuZWwgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOb2RlfSBjb21ib0JveExpc3RQYXJlbnQgLSBub2RlIGZvciBjb250YWluaW5nIHRoZSBjb21ibyBib3hcclxuICAgKiBAcGFyYW0ge0tleXBhZExheWVyfSBrZXlwYWRMYXllciAtIGZvciBlbnRlcmluZyB2YWx1ZXNcclxuICAgKiBAcGFyYW0ge0xhYk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29tYm9Cb3hMaXN0UGFyZW50LCBrZXlwYWRMYXllciwgbW9kZWwsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBjb252ZW5pZW5jZSB2YXJpYWJsZXMgYXMgbXVjaCBvZiB0aGUgbG9naWMgaW4gdGhpcyB0eXBlIGlzIGluIHByb3RvdHlwZSBmdW5jdGlvbnMgb25seSBjYWxsZWQgb24gY29uc3RydWN0aW9uLlxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMub2JqZWN0VHlwZXMgPSBtb2RlbC5vYmplY3RUeXBlcztcclxuICAgIHRoaXMub2JqZWN0VHlwZUNvbnRyb2xzID0gW107IC8vIHtBcnJheS48UHJvamVjdGlsZU9iamVjdFR5cGVDb250cm9sPn0gc2FtZSBzaXplIGFzIG9iamVjdFR5cGVzLCBob2xkcyBhIE5vZGUgdGhhdCBpcyB0aGUgY29udHJvbHM7XHJcbiAgICB0aGlzLmtleXBhZExheWVyID0ga2V5cGFkTGF5ZXI7XHJcbiAgICB0aGlzLm1vZGVsID0gbW9kZWw7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gVGhlIGZpcnN0IG9iamVjdCBpcyBhIHBsYWNlaG9sZGVyIHNvIG5vbmUgb2YgdGhlIG90aGVycyBnZXQgbXV0YXRlZFxyXG4gICAgLy8gVGhlIHNlY29uZCBvYmplY3QgaXMgdGhlIGRlZmF1bHQsIGluIHRoZSBjb25zdGFudHMgZmlsZXNcclxuICAgIC8vIFRoZSB0aGlyZCBvYmplY3QgaXMgb3B0aW9ucyBzcGVjaWZpYyB0byB0aGlzIHBhbmVsLCB3aGljaCBvdmVycmlkZXMgdGhlIGRlZmF1bHRzXHJcbiAgICAvLyBUaGUgZm91cnRoIG9iamVjdCBpcyBvcHRpb25zIGdpdmVuIGF0IHRpbWUgb2YgY29uc3RydWN0aW9uLCB3aGljaCBvdmVycmlkZXMgYWxsIHRoZSBvdGhlcnNcclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge30sIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuUklHSFRTSURFX1BBTkVMX09QVElPTlMsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSBzYXZlIHRoZW0gZm9yIGxhdGVyXHJcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gdGhlc2UgbnVtYmVyIGNvbnRyb2xzIGRvbid0IGNoYW5nZSBiZXR3ZWVuIGFsbCBcImJlbmNobWFya2VkXCIgZWxlbWVudHMgKG5vdCBjdXN0b20pLCBzbyB3ZSBjYW4gcmV1c2UgdGhlbVxyXG4gICAgdGhpcy5ncmF2aXR5TnVtYmVyQ29udHJvbCA9IG51bGw7XHJcbiAgICB0aGlzLmFsdGl0dWRlTnVtYmVyQ29udHJvbCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGU7XHJcbiAgICB0aGlzLnRleHREaXNwbGF5V2lkdGggPSBvcHRpb25zLnRleHREaXNwbGF5V2lkdGggKiAxLjQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB0b2dnbGUgdGhlIHZpc2liaWxpdHkgb2YgYWxsIFByb2plY3RpbGVPYmplY3RUeXBlIG1hc3MgTnVtYmVyQ29udHJvbHMgd2l0aCBhIHNpbmdsZSBQcm9wZXJ0eS4gQ3JlYXRlZFxyXG4gICAgLy8gZm9yIFBoRVQtaU8uXHJcbiAgICB0aGlzLm1hc3NOdW1iZXJDb250cm9sc1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXNzTnVtYmVyQ29udHJvbHNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHRvZ2dsZSB0aGUgdmlzaWJpbGl0eSBvZiBhbGwgUHJvamVjdGlsZU9iamVjdFR5cGUgZGlhbWV0ZXIgTnVtYmVyQ29udHJvbHMgd2l0aCBhIHNpbmdsZSBQcm9wZXJ0eS4gQ3JlYXRlZFxyXG4gICAgLy8gZm9yIFBoRVQtaU8uXHJcbiAgICB0aGlzLmRpYW1ldGVyTnVtYmVyQ29udHJvbHNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlhbWV0ZXJOdW1iZXJDb250cm9sc1Zpc2libGVQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG1heFdpZHRoIGVtcGlyaWNhbGx5IGRldGVybWluZWQgZm9yIGxhYmVscyBpbiB0aGUgZHJvcGRvd25cclxuICAgIGNvbnN0IGl0ZW1Ob2RlT3B0aW9ucyA9IG1lcmdlKCB7fSwgTEFCRUxfT1BUSU9OUywgeyBtYXhXaWR0aDogMTcwIH0gKTtcclxuXHJcbiAgICBjb25zdCBmaXJzdEl0ZW1Ob2RlID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBuZXcgVGV4dCggdGhpcy5vYmplY3RUeXBlc1sgMCBdLm5hbWUsIGl0ZW1Ob2RlT3B0aW9ucyApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb21ib0JveFdpZHRoID0gb3B0aW9ucy5taW5XaWR0aCAtIDIgKiBvcHRpb25zLnhNYXJnaW47XHJcbiAgICBjb25zdCBpdGVtWE1hcmdpbiA9IDY7XHJcbiAgICBjb25zdCBidXR0b25YTWFyZ2luID0gMTA7XHJcbiAgICBjb25zdCBjb21ib0JveExpbmVXaWR0aCA9IDE7XHJcblxyXG4gICAgLy8gZmlyc3QgaXRlbSBjb250YWlucyBob3Jpem9udGFsIHN0cnV0IHRoYXQgc2V0cyB3aWR0aCBvZiBjb21ibyBib3hcclxuICAgIGNvbnN0IGZpcnN0SXRlbU5vZGVXaWR0aCA9IGNvbWJvQm94V2lkdGggLSBpdGVtWE1hcmdpbiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLjUgKiBmaXJzdEl0ZW1Ob2RlLmhlaWdodCAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA0ICogYnV0dG9uWE1hcmdpbiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAyICogaXRlbVhNYXJnaW4gLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMiAqIGNvbWJvQm94TGluZVdpZHRoO1xyXG4gICAgZmlyc3RJdGVtTm9kZS5hZGRDaGlsZCggbmV3IEhTdHJ1dCggZmlyc3RJdGVtTm9kZVdpZHRoICkgKTtcclxuXHJcbiAgICBjb25zdCBjb21ib0JveEl0ZW1zID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLm9iamVjdFR5cGVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBwcm9qZWN0aWxlVHlwZSA9IHRoaXMub2JqZWN0VHlwZXNbIGkgXTtcclxuXHJcbiAgICAgIGNvbWJvQm94SXRlbXNbIGkgXSA9IHtcclxuICAgICAgICB2YWx1ZTogcHJvamVjdGlsZVR5cGUsXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4gKCBpID09PSAwICkgPyBmaXJzdEl0ZW1Ob2RlIDogbmV3IFRleHQoIHByb2plY3RpbGVUeXBlLm5hbWUsIGl0ZW1Ob2RlT3B0aW9ucyApLFxyXG4gICAgICAgIHRhbmRlbU5hbWU6IGAke3Byb2plY3RpbGVUeXBlLmJlbmNobWFya30ke0NvbWJvQm94LklURU1fVEFOREVNX05BTUVfU1VGRklYfWBcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSB0aGUgY29udHJvbHMgZm9yIHRoZSBwcm9qZWN0aWxlVHlwZSB0b28uXHJcbiAgICAgIHRoaXMub2JqZWN0VHlwZUNvbnRyb2xzLnB1c2goIHRoaXMuY3JlYXRlQ29udHJvbHNGb3JPYmplY3RUeXBlKCBwcm9qZWN0aWxlVHlwZSwgb3B0aW9ucy50YW5kZW0sIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggYCR7cHJvamVjdGlsZVR5cGUuYmVuY2htYXJrfUNvbnRyb2xgICkgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0aW5nIHRoZSBjb250cm9scyBmb3IgZWFjaCBvYmplY3QgdHlwZSBjaGFuZ2VzIHRoZXNlIHZhbHVlcyBiZWNhdXNlIG9mIGVuYWJsZWRSYW5nZVByb3BlcnR5IGxpc3RlbmVycyBpbiB0aGVcclxuICAgIC8vIE51bWJlckNvbnRyb2xzLiBIZXJlIHJlc2V0IGJhY2sgdG8gdGhlIHNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGUgdG8gZml4IHRoaW5ncy4gU2VlXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcHJvamVjdGlsZS1tb3Rpb24vaXNzdWVzLzIxM1xyXG4gICAgbW9kZWwucmVzZXRNb2RlbFZhbHVlc1RvSW5pdGlhbCgpO1xyXG5cclxuICAgIC8vIGNyZWF0ZSB2aWV3IGZvciB0aGUgZHJvcGRvd25cclxuICAgIGNvbnN0IHByb2plY3RpbGVDaG9pY2VDb21ib0JveCA9IG5ldyBDb21ib0JveCggbW9kZWwuc2VsZWN0ZWRQcm9qZWN0aWxlT2JqZWN0VHlwZVByb3BlcnR5LCBjb21ib0JveEl0ZW1zLCBjb21ib0JveExpc3RQYXJlbnQsIHtcclxuICAgICAgeE1hcmdpbjogMTIsXHJcbiAgICAgIHlNYXJnaW46IDgsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNCxcclxuICAgICAgYnV0dG9uTGluZVdpZHRoOiBjb21ib0JveExpbmVXaWR0aCxcclxuICAgICAgbGlzdExpbmVXaWR0aDogY29tYm9Cb3hMaW5lV2lkdGgsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvamVjdGlsZUNob2ljZUNvbWJvQm94JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ29tYm8gYm94IHRoYXQgc2VsZWN0cyB3aGF0IHByb2plY3RpbGUgdHlwZSB0byBsYXVuY2ggZnJvbSB0aGUgY2Fubm9uJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIG1ha2UgdmlzaWJsZSB0byBtZXRob2RzXHJcbiAgICB0aGlzLnByb2plY3RpbGVDaG9pY2VDb21ib0JveCA9IHByb2plY3RpbGVDaG9pY2VDb21ib0JveDtcclxuXHJcbiAgICAvLyByZWFkb3V0LCBzbGlkZXIsIGFuZCB0d2Vha2Vyc1xyXG5cclxuICAgIC8vIFRoZXNlIGNvbnRhaW5lcnMgYXJlIGFkZGVkIGludG8gdGhlIFBhbmVsIGFzIGRlc2lyZWQsIGFuZCB0aGVpciBjaGlsZHJlbiBhcmUgY2hhbmdlZCBhcyB0aGUgb2JqZWN0IHR5cGUgZG9lcy5cclxuICAgIGNvbnN0IG1hc3NCb3ggPSBuZXcgTm9kZSggeyBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlIH0gKTtcclxuICAgIGNvbnN0IGRpYW1ldGVyQm94ID0gbmV3IE5vZGUoIHsgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogdHJ1ZSB9ICk7XHJcbiAgICBjb25zdCBkcmFnQ29lZmZpY2llbnRCb3ggPSBuZXcgTm9kZSggeyBleGNsdWRlSW52aXNpYmxlQ2hpbGRyZW5Gcm9tQm91bmRzOiB0cnVlIH0gKTtcclxuICAgIGNvbnN0IGFsdGl0dWRlQm94ID0gbmV3IE5vZGUoIHsgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogdHJ1ZSB9ICk7XHJcbiAgICBjb25zdCBncmF2aXR5Qm94ID0gbmV3IE5vZGUoIHsgZXhjbHVkZUludmlzaWJsZUNoaWxkcmVuRnJvbUJvdW5kczogdHJ1ZSB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSB0eXBlIG9mIGNvbnRyb2wgYmFzZWQgb24gdGhlIG9iamVjdFR5cGVcclxuICAgIG1vZGVsLnNlbGVjdGVkUHJvamVjdGlsZU9iamVjdFR5cGVQcm9wZXJ0eS5saW5rKCBvYmplY3RUeXBlID0+IHtcclxuICAgICAgY29uc3Qgb2JqZWN0VHlwZUNvbnRyb2xzID0gdGhpcy5vYmplY3RUeXBlQ29udHJvbHNbIHRoaXMub2JqZWN0VHlwZXMuaW5kZXhPZiggb2JqZWN0VHlwZSApIF07XHJcbiAgICAgIG1hc3NCb3guY2hpbGRyZW4gPSBbIG9iamVjdFR5cGVDb250cm9scy5tYXNzQ29udHJvbCBdO1xyXG4gICAgICBkaWFtZXRlckJveC5jaGlsZHJlbiA9IFsgb2JqZWN0VHlwZUNvbnRyb2xzLmRpYW1ldGVyQ29udHJvbCBdO1xyXG4gICAgICBkcmFnQ29lZmZpY2llbnRCb3guY2hpbGRyZW4gPSBbIG9iamVjdFR5cGVDb250cm9scy5kcmFnQ29lZmZpY2llbnRDb250cm9sIF07XHJcbiAgICAgIGFsdGl0dWRlQm94LmNoaWxkcmVuID0gWyBvYmplY3RUeXBlQ29udHJvbHMuYWx0aXR1ZGVDb250cm9sIF07XHJcbiAgICAgIGdyYXZpdHlCb3guY2hpbGRyZW4gPSBbIG9iamVjdFR5cGVDb250cm9scy5ncmF2aXR5Q29udHJvbCBdO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGRpc2FibGluZyBhbmQgZW5hYmxpbmcgZHJhZyBhbmQgYWx0aXR1ZGUgY29udHJvbHMgZGVwZW5kaW5nIG9uIHdoZXRoZXIgYWlyIHJlc2lzdGFuY2UgaXMgb25cclxuICAgIG1vZGVsLmFpclJlc2lzdGFuY2VPblByb3BlcnR5LmxpbmsoIGFpclJlc2lzdGFuY2VPbiA9PiB7XHJcbiAgICAgIGNvbnN0IG9wYWNpdHkgPSBhaXJSZXNpc3RhbmNlT24gPyAxIDogMC41O1xyXG4gICAgICBhbHRpdHVkZUJveC5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgZHJhZ0NvZWZmaWNpZW50Qm94Lm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICBhbHRpdHVkZUJveC5zZXRQaWNrYWJsZSggYWlyUmVzaXN0YW5jZU9uICk7XHJcbiAgICAgIGRyYWdDb2VmZmljaWVudEJveC5zZXRQaWNrYWJsZSggYWlyUmVzaXN0YW5jZU9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWlyIHJlc2lzdGFuY2VcclxuICAgIGNvbnN0IGFpclJlc2lzdGFuY2VMYWJlbCA9IG5ldyBUZXh0KCBhaXJSZXNpc3RhbmNlU3RyaW5nLCBMQUJFTF9PUFRJT05TICk7XHJcbiAgICBjb25zdCBhaXJSZXNpc3RhbmNlTGFiZWxBbmRJY29uID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogb3B0aW9ucy54TWFyZ2luLFxyXG4gICAgICBjaGlsZHJlbjogWyBhaXJSZXNpc3RhbmNlTGFiZWwsIG5ldyBOb2RlKCB7IGNoaWxkcmVuOiBbIEFJUl9SRVNJU1RBTkNFX0lDT04gXSB9ICkgXVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYWlyUmVzaXN0YW5jZUNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBtb2RlbC5haXJSZXNpc3RhbmNlT25Qcm9wZXJ0eSwgYWlyUmVzaXN0YW5jZUxhYmVsQW5kSWNvbiwge1xyXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5taW5XaWR0aCAtIEFJUl9SRVNJU1RBTkNFX0lDT04ud2lkdGggLSAzICogb3B0aW9ucy54TWFyZ2luLFxyXG4gICAgICBib3hXaWR0aDogMTgsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWlyUmVzaXN0YW5jZUNoZWNrYm94JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlIGNvbnRlbnRzIG9mIHRoZSBjb250cm9sIHBhbmVsXHJcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogb3B0aW9ucy5jb250cm9sc1ZlcnRpY2FsU3BhY2UsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgcHJvamVjdGlsZUNob2ljZUNvbWJvQm94LFxyXG4gICAgICAgIG1hc3NCb3gsXHJcbiAgICAgICAgZGlhbWV0ZXJCb3gsXHJcbiAgICAgICAgbmV3IEhTZXBhcmF0b3IoIHsgc3Ryb2tlOiBQcm9qZWN0aWxlTW90aW9uQ29uc3RhbnRzLlNFUEFSQVRPUl9DT0xPUiB9ICksXHJcbiAgICAgICAgZ3Jhdml0eUJveCxcclxuICAgICAgICBuZXcgSFNlcGFyYXRvciggeyBzdHJva2U6IFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuU0VQQVJBVE9SX0NPTE9SIH0gKSxcclxuICAgICAgICBhaXJSZXNpc3RhbmNlQ2hlY2tib3gsXHJcbiAgICAgICAgYWx0aXR1ZGVCb3gsXHJcbiAgICAgICAgZHJhZ0NvZWZmaWNpZW50Qm94XHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGFuZWwoIGNvbnRlbnQsIG9wdGlvbnMgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogZm9yIHVzZSBieSBzY3JlZW4gdmlld1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBoaWRlQ29tYm9Cb3hMaXN0KCkge1xyXG4gICAgdGhpcy5wcm9qZWN0aWxlQ2hvaWNlQ29tYm9Cb3guaGlkZUxpc3RCb3goKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdpdmVuIGFuIG9iamVjdFR5cGUsIGNyZWF0ZSB0aGUgY29udHJvbHMgbmVlZGVkIGZvciB0aGF0IHR5cGUuXHJcbiAgICogQHBhcmFtIHtQcm9qZWN0aWxlT2JqZWN0VHlwZX0gb2JqZWN0VHlwZVxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSBnZW5lcmFsQ29tcG9uZW50VGFuZGVtIC0gdXNlZCBmb3IgdGhlIGVsZW1lbnRzIHRoYXQgY2FuIGJlIHJldXNlZCBiZXR3ZWVuIGFsbCBlbGVtZW50c1xyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSBvYmplY3RTcGVjaWZpY1RhbmRlbSAtIHVzZWQgZm9yIHRoZSBlbGVtZW50cyB0aGF0IGNoYW5nZSBmb3IgZWFjaCBvYmplY3QgdHlwZVxyXG4gICAqIEByZXR1cm5zIHtQcm9qZWN0aWxlT2JqZWN0VHlwZUNvbnRyb2x9XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVDb250cm9sc0Zvck9iamVjdFR5cGUoIG9iamVjdFR5cGUsIGdlbmVyYWxDb21wb25lbnRUYW5kZW0sIG9iamVjdFNwZWNpZmljVGFuZGVtICkge1xyXG5cclxuICAgIGlmICggb2JqZWN0VHlwZS5iZW5jaG1hcmsgPT09ICdjdXN0b20nICkge1xyXG4gICAgICByZXR1cm4gbmV3IEN1c3RvbVByb2plY3RpbGVPYmplY3RUeXBlQ29udHJvbCggdGhpcy5tb2RlbCwgdGhpcy5rZXlwYWRMYXllciwgb2JqZWN0VHlwZSwgb2JqZWN0U3BlY2lmaWNUYW5kZW0sIHtcclxuICAgICAgICB4TWFyZ2luOiB0aGlzLm9wdGlvbnMueE1hcmdpbixcclxuICAgICAgICBtaW5XaWR0aDogdGhpcy5vcHRpb25zLm1pbldpZHRoLFxyXG4gICAgICAgIHJlYWRvdXRYTWFyZ2luOiB0aGlzLm9wdGlvbnMucmVhZG91dFhNYXJnaW4sXHJcbiAgICAgICAgdGV4dERpc3BsYXlXaWR0aDogdGhpcy50ZXh0RGlzcGxheVdpZHRoXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgY29uc3QgZGVmYXVsdE51bWJlckNvbnRyb2xPcHRpb25zID0ge1xyXG4gICAgICAgIHRpdGxlTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICAgIGZvbnQ6IFRFWFRfRk9OVCxcclxuXHJcbiAgICAgICAgICAvLyBwYW5lbCB3aWR0aCAtIG1hcmdpbnMgLSBudW1iZXJEaXNwbGF5IG1hcmdpbnMgYW5kIG1heFdpZHRoXHJcbiAgICAgICAgICBtYXhXaWR0aDogdGhpcy5vcHRpb25zLm1pbldpZHRoIC0gMyAqIHRoaXMub3B0aW9ucy54TWFyZ2luIC0gMiAqIFJFQURPVVRfWF9NQVJHSU4gLSB0aGlzLnRleHREaXNwbGF5V2lkdGhcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgICBtYXhXaWR0aDogdGhpcy50ZXh0RGlzcGxheVdpZHRoLFxyXG4gICAgICAgICAgYWxpZ246ICdyaWdodCcsXHJcbiAgICAgICAgICB4TWFyZ2luOiBSRUFET1VUX1hfTUFSR0lOLFxyXG4gICAgICAgICAgeU1hcmdpbjogNCxcclxuICAgICAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGZvbnQ6IFRFWFRfRk9OVFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgICAgbWFqb3JUaWNrTGVuZ3RoOiA1LFxyXG4gICAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggdGhpcy5vcHRpb25zLm1pbldpZHRoIC0gMiAqIHRoaXMub3B0aW9ucy54TWFyZ2luIC0gODAsIDAuNSApLFxyXG4gICAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTMsIDIyICksXHJcbiAgICAgICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogNixcclxuICAgICAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiA0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhcnJvd0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICAgIHNjYWxlOiAwLjU2LFxyXG4gICAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiAyMCxcclxuICAgICAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogMjBcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uNCgge1xyXG4gICAgICAgICAgYXJyb3dCdXR0b25TcGFjaW5nOiAxMFxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29uc3QgbWFzc051bWJlckNvbnRyb2wgPSBuZXcgTnVtYmVyQ29udHJvbChcclxuICAgICAgICBtYXNzU3RyaW5nLFxyXG4gICAgICAgIHRoaXMubW9kZWwucHJvamVjdGlsZU1hc3NQcm9wZXJ0eSxcclxuICAgICAgICBvYmplY3RUeXBlLm1hc3NSYW5nZSxcclxuICAgICAgICBtZXJnZSgge1xyXG4gICAgICAgICAgZGVsdGE6IG9iamVjdFR5cGUubWFzc1JvdW5kLFxyXG4gICAgICAgICAgbnVtYmVyRGlzcGxheU9wdGlvbnM6IHtcclxuXHJcbiAgICAgICAgICAgIC8vICd7e3ZhbHVlfX0ga2cnXHJcbiAgICAgICAgICAgIHZhbHVlUGF0dGVybjogU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nLCB7IHVuaXRzOiBrZ1N0cmluZyB9ICksXHJcbiAgICAgICAgICAgIGRlY2ltYWxQbGFjZXM6IE1hdGguY2VpbCggLVV0aWxzLmxvZzEwKCBvYmplY3RUeXBlLm1hc3NSb3VuZCApIClcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgLyBvYmplY3RUeXBlLm1hc3NSb3VuZCApICogb2JqZWN0VHlwZS5tYXNzUm91bmQsXHJcbiAgICAgICAgICAgIG1ham9yVGlja3M6IFsge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBvYmplY3RUeXBlLm1hc3NSYW5nZS5taW4sXHJcbiAgICAgICAgICAgICAgbGFiZWw6IG5ldyBUZXh0KCBvYmplY3RUeXBlLm1hc3NSYW5nZS5taW4sIExBQkVMX09QVElPTlMgKVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IG9iamVjdFR5cGUubWFzc1JhbmdlLm1heCxcclxuICAgICAgICAgICAgICBsYWJlbDogbmV3IFRleHQoIG9iamVjdFR5cGUubWFzc1JhbmdlLm1heCwgTEFCRUxfT1BUSU9OUyApXHJcbiAgICAgICAgICAgIH0gXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRhbmRlbTogb2JqZWN0U3BlY2lmaWNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnbWFzc051bWJlckNvbnRyb2wnICksXHJcbiAgICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVUkgY29udHJvbCB0byBhZGp1c3QgdGhlIG1hc3Mgb2YgdGhlIHByb2plY3RpbGUnXHJcbiAgICAgICAgfSwgZGVmYXVsdE51bWJlckNvbnRyb2xPcHRpb25zICkgKTtcclxuXHJcbiAgICAgIGNvbnN0IGRpYW1ldGVyTnVtYmVyQ29udHJvbCA9IG5ldyBOdW1iZXJDb250cm9sKFxyXG4gICAgICAgIGRpYW1ldGVyU3RyaW5nLCB0aGlzLm1vZGVsLnByb2plY3RpbGVEaWFtZXRlclByb3BlcnR5LFxyXG4gICAgICAgIG9iamVjdFR5cGUuZGlhbWV0ZXJSYW5nZSxcclxuICAgICAgICBtZXJnZSgge1xyXG4gICAgICAgICAgZGVsdGE6IG9iamVjdFR5cGUuZGlhbWV0ZXJSb3VuZCxcclxuICAgICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgICAvLyAne3t2YWx1ZX19IG0nXHJcbiAgICAgICAgICAgIHZhbHVlUGF0dGVybjogU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nLCB7IHVuaXRzOiBtU3RyaW5nIH0gKSxcclxuICAgICAgICAgICAgZGVjaW1hbFBsYWNlczogTWF0aC5jZWlsKCAtVXRpbHMubG9nMTAoIG9iamVjdFR5cGUuZGlhbWV0ZXJSb3VuZCApIClcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgLyBvYmplY3RUeXBlLmRpYW1ldGVyUm91bmQgKSAqIG9iamVjdFR5cGUuZGlhbWV0ZXJSb3VuZCxcclxuICAgICAgICAgICAgbWFqb3JUaWNrczogWyB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IG9iamVjdFR5cGUuZGlhbWV0ZXJSYW5nZS5taW4sXHJcbiAgICAgICAgICAgICAgbGFiZWw6IG5ldyBUZXh0KCBvYmplY3RUeXBlLmRpYW1ldGVyUmFuZ2UubWluLCBMQUJFTF9PUFRJT05TIClcclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiBvYmplY3RUeXBlLmRpYW1ldGVyUmFuZ2UubWF4LFxyXG4gICAgICAgICAgICAgIGxhYmVsOiBuZXcgVGV4dCggb2JqZWN0VHlwZS5kaWFtZXRlclJhbmdlLm1heCwgTEFCRUxfT1BUSU9OUyApXHJcbiAgICAgICAgICAgIH0gXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRhbmRlbTogb2JqZWN0U3BlY2lmaWNUYW5kZW0uY3JlYXRlVGFuZGVtKCAnZGlhbWV0ZXJOdW1iZXJDb250cm9sJyApLFxyXG4gICAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1VJIGNvbnRyb2wgdG8gYWRqdXN0IHRoZSBkaWFtZXRlciBvZiB0aGUgcHJvamVjdGlsZSdcclxuICAgICAgICB9LCBkZWZhdWx0TnVtYmVyQ29udHJvbE9wdGlvbnMgKSApO1xyXG5cclxuICAgICAgY29uc3QgZ3Jhdml0eU51bWJlckNvbnRyb2wgPSB0aGlzLmdyYXZpdHlOdW1iZXJDb250cm9sIHx8IG5ldyBOdW1iZXJDb250cm9sKFxyXG4gICAgICAgIGdyYXZpdHlTdHJpbmcsXHJcbiAgICAgICAgdGhpcy5tb2RlbC5ncmF2aXR5UHJvcGVydHksXHJcbiAgICAgICAgUHJvamVjdGlsZU1vdGlvbkNvbnN0YW50cy5HUkFWSVRZX1JBTkdFLFxyXG4gICAgICAgIG1lcmdlKCB7XHJcbiAgICAgICAgICBkZWx0YTogMC4wMSxcclxuICAgICAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcblxyXG4gICAgICAgICAgICAvLyAne3t2YWx1ZX19IG0vc14yXHJcbiAgICAgICAgICAgIHZhbHVlUGF0dGVybjogU3RyaW5nVXRpbHMuZmlsbEluKCBwYXR0ZXJuMFZhbHVlMVVuaXRzV2l0aFNwYWNlU3RyaW5nLCB7XHJcbiAgICAgICAgICAgICAgdW5pdHM6IG1ldGVyc1BlclNlY29uZFNxdWFyZWRTdHJpbmdcclxuICAgICAgICAgICAgfSApLFxyXG4gICAgICAgICAgICBkZWNpbWFsUGxhY2VzOiAyLFxyXG4gICAgICAgICAgICB4TWFyZ2luOiBHUkFWSVRZX1JFQURPVVRfWF9NQVJHSU4sXHJcbiAgICAgICAgICAgIG1heFdpZHRoOiB0aGlzLnRleHREaXNwbGF5V2lkdGggKyBHUkFWSVRZX1JFQURPVVRfWF9NQVJHSU5cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgKiAxMDAgKSAvIDEwMFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRhbmRlbTogZ2VuZXJhbENvbXBvbmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmF2aXR5TnVtYmVyQ29udHJvbCcgKSxcclxuICAgICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdVSSBjb250cm9sIHRvIGFkanVzdCB0aGUgZm9yY2Ugb2YgZ3Jhdml0eSBvbiB0aGUgcHJvamVjdGlsZSdcclxuICAgICAgICB9LCBkZWZhdWx0TnVtYmVyQ29udHJvbE9wdGlvbnMgKVxyXG4gICAgICApO1xyXG4gICAgICB0aGlzLmdyYXZpdHlOdW1iZXJDb250cm9sID0gZ3Jhdml0eU51bWJlckNvbnRyb2w7XHJcblxyXG4gICAgICBjb25zdCBhbHRpdHVkZU51bWJlckNvbnRyb2wgPSB0aGlzLmFsdGl0dWRlTnVtYmVyQ29udHJvbCB8fCBuZXcgTnVtYmVyQ29udHJvbChcclxuICAgICAgICBhbHRpdHVkZVN0cmluZywgdGhpcy5tb2RlbC5hbHRpdHVkZVByb3BlcnR5LFxyXG4gICAgICAgIFByb2plY3RpbGVNb3Rpb25Db25zdGFudHMuQUxUSVRVREVfUkFOR0UsXHJcbiAgICAgICAgbWVyZ2UoIHtcclxuICAgICAgICAgIGRlbHRhOiAxMDAsXHJcbiAgICAgICAgICBudW1iZXJEaXNwbGF5T3B0aW9uczoge1xyXG5cclxuICAgICAgICAgICAgLy8gJ3t7dmFsdWV9fSBtJ1xyXG4gICAgICAgICAgICB2YWx1ZVBhdHRlcm46IFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybjBWYWx1ZTFVbml0c1dpdGhTcGFjZVN0cmluZywgeyB1bml0czogbVN0cmluZyB9ICksXHJcbiAgICAgICAgICAgIGRlY2ltYWxQbGFjZXM6IDBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIGNvbnN0cmFpblZhbHVlOiB2YWx1ZSA9PiBVdGlscy5yb3VuZFN5bW1ldHJpYyggdmFsdWUgLyAxMDAgKSAqIDEwMFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHRhbmRlbTogZ2VuZXJhbENvbXBvbmVudFRhbmRlbS5jcmVhdGVUYW5kZW0oICdhbHRpdHVkZU51bWJlckNvbnRyb2wnICksXHJcbiAgICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVUkgY29udHJvbCB0byBhZGp1c3QgdGhlIGFsdGl0dWRlIG9mIHBvc2l0aW9uIHdoZXJlIHRoZSBwcm9qZWN0aWxlIGlzIGJlaW5nIGxhdW5jaGVkJ1xyXG4gICAgICAgIH0sIGRlZmF1bHROdW1iZXJDb250cm9sT3B0aW9ucyApXHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMuYWx0aXR1ZGVOdW1iZXJDb250cm9sID0gYWx0aXR1ZGVOdW1iZXJDb250cm9sO1xyXG5cclxuICAgICAgY29uc3QgZHJhZ0NvZWZmaWNpZW50VGV4dCA9IG5ldyBUZXh0KCAnJywgbWVyZ2UoIHt9LCBMQUJFTF9PUFRJT05TLCB7XHJcbiAgICAgICAgbWF4V2lkdGg6IHRoaXMub3B0aW9ucy5taW5XaWR0aCAtIDIgKiB0aGlzLm9wdGlvbnMueE1hcmdpblxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAgIC8vIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW11bGF0aW9uXHJcbiAgICAgIHRoaXMubW9kZWwucHJvamVjdGlsZURyYWdDb2VmZmljaWVudFByb3BlcnR5LmxpbmsoIGRyYWdDb2VmZmljaWVudCA9PiB7XHJcbiAgICAgICAgZHJhZ0NvZWZmaWNpZW50VGV4dC5zdHJpbmcgPSBgJHtkcmFnQ29lZmZpY2llbnRTdHJpbmd9OiAke1V0aWxzLnRvRml4ZWQoIGRyYWdDb2VmZmljaWVudCwgMiApfWA7XHJcbiAgICAgIH0gKTtcclxuXHJcblxyXG4gICAgICAvLyBPbmUgZGlyZWN0aW9uIG9mIGNvbnRyb2wuIEluc3RlYWQgb2YgbGlua2luZyBib3RoIHRvIGVhY2ggb3RoZXIuIFRoaXMgYWxsb3dzIGEgc2luZ2xlLCBnbG9iYWwgY29udHJvbCB0byBzd2l0Y2hcclxuICAgICAgLy8gYWxsIHR5cGVzJyB2aXNpYmlsaXR5IGF0IG9uY2UsIHdoaWxlIGFsc28gYWxsb3dpbmcgYSBzaW5nbGUgbnVtYmVyQ29udHJvbCB0aGUgZmxleGliaWxpdHkgdG8gaGlkZSBpdHNlbGYuXHJcbiAgICAgIHRoaXMubWFzc051bWJlckNvbnRyb2xzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICAgIG1hc3NOdW1iZXJDb250cm9sLnZpc2libGVQcm9wZXJ0eS52YWx1ZSA9IHZpc2libGU7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5kaWFtZXRlck51bWJlckNvbnRyb2xzVmlzaWJsZVByb3BlcnR5LmxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICAgIGRpYW1ldGVyTnVtYmVyQ29udHJvbC52aXNpYmxlUHJvcGVydHkudmFsdWUgPSB2aXNpYmxlO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3IFByb2plY3RpbGVPYmplY3RUeXBlQ29udHJvbChcclxuICAgICAgICBtYXNzTnVtYmVyQ29udHJvbCxcclxuICAgICAgICBkaWFtZXRlck51bWJlckNvbnRyb2wsXHJcbiAgICAgICAgZ3Jhdml0eU51bWJlckNvbnRyb2wsXHJcbiAgICAgICAgYWx0aXR1ZGVOdW1iZXJDb250cm9sLFxyXG4gICAgICAgIGRyYWdDb2VmZmljaWVudFRleHQgKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbnByb2plY3RpbGVNb3Rpb24ucmVnaXN0ZXIoICdMYWJQcm9qZWN0aWxlQ29udHJvbFBhbmVsJywgTGFiUHJvamVjdGlsZUNvbnRyb2xQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBMYWJQcm9qZWN0aWxlQ29udHJvbFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxTQUFTQyxJQUFJLEVBQUVDLFVBQVUsRUFBRUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RixPQUFPQyxRQUFRLE1BQU0sZ0NBQWdDO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSxnQ0FBZ0M7QUFDckQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxNQUFNLE1BQU0saUNBQWlD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