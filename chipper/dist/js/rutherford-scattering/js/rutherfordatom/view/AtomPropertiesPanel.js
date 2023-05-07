// Copyright 2016-2022, University of Colorado Boulder

/**
 * Control panel to adjust the number of protons and neutrons used in the sim
 *
 * @author Dave Schmitz (Schmitzware)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import { Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import RSColors from '../../common/RSColors.js';
import RSConstants from '../../common/RSConstants.js';
import rutherfordScattering from '../../rutherfordScattering.js';
import RutherfordScatteringStrings from '../../RutherfordScatteringStrings.js';

// constants
const atomString = RutherfordScatteringStrings.atom;
const numberOfNeutronsString = RutherfordScatteringStrings.numberOfNeutrons;
const numberOfProtonsString = RutherfordScatteringStrings.numberOfProtons;
const atomSettingsString = RutherfordScatteringStrings.a11y.atomSettings;

// TODO: make these template vars again when working on descriptions
const protonsValuePatternString = RutherfordScatteringStrings.a11y.protonsValuePattern;
const protonSliderDescriptionString = RutherfordScatteringStrings.a11y.protonSliderDescription;
const neutronsValuePatternString = RutherfordScatteringStrings.a11y.neutronsValuePattern;
const neutronSliderDescriptionString = RutherfordScatteringStrings.a11y.neutronSliderDescription;

// global, tracking where fingers are for multitouch support
// must persist beyond lifetime of the panel so that fingers are tracked when new
// panels are created for scene or color profile changes
const FINGER_TRACKER = {};

// specific interaction properties for the rutherford atom portion, for multitouch
// Not specific to an instance of an AtomPropertiesPanel, values of the interaction state Properties should
// persist beyond when scene or color profile changes
const interactionPropertyGroup = {
  leftProtonButtonInteractionProperty: new Property(false),
  rightProtonButtonInteractionProperty: new Property(false),
  protonSliderInteractionProperty: new Property(false),
  leftNeutronButtonInteractionProperty: new Property(false),
  rightNeutronButtonInteractionProperty: new Property(false),
  neutronSliderInteractionProperty: new Property(false)
};
class AtomPropertiesPanel extends Panel {
  /**
   * @param {AtomPropertiesPanelContent} content - Content contained by the panel
   * @param {Object} [options]
   */
  constructor(content, options) {
    // Add the title of the panel content
    const atomPropertiesText = new Text(atomString, {
      font: RSConstants.PANEL_TITLE_FONT,
      fontWeight: 'bold',
      fill: RSColors.panelTitleColorProperty,
      maxWidth: 225
    });
    const panelBox = new VBox({
      children: [atomPropertiesText, content],
      align: 'left',
      spacing: RSConstants.PANEL_CHILD_SPACING
    });
    options = merge({
      xMargin: RSConstants.PANEL_X_MARGIN,
      yMargin: 10,
      minWidth: RSConstants.PANEL_MIN_WIDTH,
      maxWidth: RSConstants.PANEL_MAX_WIDTH,
      align: 'center',
      resize: false,
      fill: RSColors.panelColorProperty,
      stroke: RSColors.panelBorderColorProperty,
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: atomSettingsString
    }, options);
    super(panelBox, options);

    // ensure that panel is eligible for garbage collection, a panel is created and destroyed every time
    // scene or color scheme changes so it si important that everything is disposed
    // @private
    this.disposeAtomPropertiesPanel = () => {
      content.dispose();
    };
  }

  /**
   * create content for the panel
   *
   * @param model
   * @returns {Node}
   * @public
   */
  static createPanelContent(model, options) {
    return new AtomPropertiesPanelContent(model, options);
  }

  /**
   * Dispose this panel - this panel can be created and destroyed frequently so
   * it is important to dispose of all panel elements.
   *
   * @public
   * @override
   */
  dispose() {
    super.dispose();
    this.disposeAtomPropertiesPanel();
  }
}
class AtomPropertiesPanelContent extends VBox {
  /**
   * Create the content for the AtomPropertiesPanel. This does not include the panel title.
   *
   * @param  {Property.<boolean>} protonInteractionProperty
   * @param  {Property.<boolean>} neutronInteractionProperty
   * @param  {Property.<number>} protonCountProperty
   * @param  {Property.<number>} neutronCountProperty
   * @param  {Object} [options]
   */
  constructor(model, options) {
    options = merge({
      xMargin: 15,
      yMargin: 8,
      minWidth: RSConstants.PANEL_MIN_WIDTH,
      maxWidth: RSConstants.PANEL_MAX_WIDTH,
      align: 'left',
      resize: false,
      fill: RSColors.panelColorProperty,
      stroke: RSColors.panelBorderColorProperty
    }, options);

    // each element must have a unique interaction property to support multitouch, see #104
    const leftProtonButtonInteractionProperty = interactionPropertyGroup.leftProtonButtonInteractionProperty;
    const rightProtonButtonInteractionProperty = interactionPropertyGroup.rightProtonButtonInteractionProperty;
    const leftNeutronButtonInteractionProperty = interactionPropertyGroup.leftNeutronButtonInteractionProperty;
    const rightNeutronButtonInteractionProperty = interactionPropertyGroup.leftProtonButtonInteractionProperty;
    const protonSliderInteractionProperty = interactionPropertyGroup.protonSliderInteractionProperty;
    const neutronSliderInteractionProperty = interactionPropertyGroup.neutronSliderInteractionProperty;

    // these properties are true when any of the dependencies are true
    const protonPanelInteractionProperty = DerivedProperty.or([leftProtonButtonInteractionProperty, rightProtonButtonInteractionProperty, protonSliderInteractionProperty]);
    const neutronPanelInteractionProperty = DerivedProperty.or([leftNeutronButtonInteractionProperty, rightNeutronButtonInteractionProperty, neutronSliderInteractionProperty]);

    // must be disposed
    const protonInteractionListener = protonInteraction => {
      model.protonInteractionProperty.set(protonInteraction);
    };
    const neutronInteractionListener = neutronInteraction => {
      model.neutronInteractionProperty.set(neutronInteraction);
    };
    protonPanelInteractionProperty.link(protonInteractionListener);
    neutronPanelInteractionProperty.link(neutronInteractionListener);
    // end of multitouch set up

    /**
     * Track fingers for multitouch, adding a finger count to a particular element and setting
     * the interaction properties correctly.
     *
     * @param  {string} sliderID
     * @param  {Property.<boolean>} interactionProperty
     */
    const addFinger = (sliderID, interactionProperty) => {
      interactionProperty.set(true);
      if (!FINGER_TRACKER[sliderID] && FINGER_TRACKER[sliderID] !== 0) {
        FINGER_TRACKER[sliderID] = 1; // first time finger is down on this thumb
      } else {
        FINGER_TRACKER[sliderID]++;
      }
    };

    /**
     * Remove a finger from an element for multitouch support, removing a finger count from a particular element
     * and setting the interaction properties appropriately.
     *
     * @param  {string} sliderID
     * @param  {Property.<boolean>} interactionProperty
     * @param  {Property.<number>} countProperty
     */
    const removeFinger = (sliderID, interactionProperty, countProperty) => {
      FINGER_TRACKER[sliderID]--;
      assert && assert(FINGER_TRACKER[sliderID] >= 0, 'at least 0 fingers must be using the slider');
      countProperty.set(Utils.roundSymmetric(countProperty.value)); // proper resolution for nucleons
      if (FINGER_TRACKER[sliderID] === 0) {
        interactionProperty.set(false);
      }
    };
    const sliderWidth = options.minWidth * 0.75;
    const numberControlOptions = {
      layoutFunction: NumberControl.createLayoutFunction3({
        ySpacing: 3,
        alignTitle: 'left',
        titleLeftIndent: options.minWidth * 0.05 // indent of the title
      }),

      titleNodeOptions: {
        font: RSConstants.PANEL_PROPERTY_FONT.copy({
          weight: 'bold'
        }),
        maxWidth: 210
      },
      numberDisplayOptions: {
        backgroundStroke: 'black',
        textOptions: {
          font: RSConstants.PANEL_VALUE_DISPLAY_FONT
        }
      },
      sliderOptions: {
        trackSize: new Dimension2(sliderWidth, 1),
        trackFill: RSColors.panelSliderLabelColorProperty,
        trackStroke: RSColors.panelSliderLabelColorProperty,
        thumbCenterLineStroke: 'white',
        thumbSize: RSConstants.PANEL_SLIDER_THUMB_DIMENSION,
        majorTickStroke: RSColors.panelSliderLabelColorProperty,
        majorTickLength: 15,
        tickLabelSpacing: 2,
        // pdom
        keyboardStep: 5,
        pageKeyboardStep: 10
      }
    };

    // allowable range for proton values
    const protonCountRange = new RangeWithValue(RSConstants.MIN_PROTON_COUNT, RSConstants.MAX_PROTON_COUNT, RSConstants.DEFAULT_PROTON_COUNT);
    const protonMajorTicks = [{
      value: protonCountRange.min,
      label: new Text(protonCountRange.min, {
        font: RSConstants.PANEL_TICK_FONT,
        fill: RSColors.panelSliderLabelColorProperty,
        pickable: false
      })
    }, {
      value: protonCountRange.max,
      label: new Text(protonCountRange.max, {
        font: RSConstants.PANEL_TICK_FONT,
        fill: RSColors.panelSliderLabelColorProperty,
        pickable: false
      })
    }];

    // will track whether we are pressing and holding arrow buttons down
    let rightProtonButtonDown = false;
    let leftProtonButtonDown = false;

    // Number control for protons
    const protonNumberControlOptions = merge({}, numberControlOptions);
    protonNumberControlOptions.titleNodeOptions = merge({}, numberControlOptions.titleNodeOptions, {
      fill: RSColors.protonsLabelColorProperty
    });
    protonNumberControlOptions.arrowButtonOptions = {
      leftStart: () => {
        leftProtonButtonDown = true;
      },
      leftEnd: () => {
        leftProtonButtonInteractionProperty.set(false);
        leftProtonButtonDown = false;
        model.removeAllParticles();
      },
      rightStart: () => {
        rightProtonButtonDown = true;
      },
      rightEnd: () => {
        rightProtonButtonInteractionProperty.set(false);
        rightProtonButtonDown = false;
        model.removeAllParticles();
      }
    };
    protonNumberControlOptions.sliderOptions = merge({}, numberControlOptions.sliderOptions, {
      majorTicks: protonMajorTicks,
      thumbFill: 'rgb(220, 58, 10)',
      thumbFillHighlighted: 'rgb(270, 108, 60)',
      // Individual callbacks for each component of the NumberControl to support multitouch
      startDrag: () => {
        addFinger('protonCountSlider', protonSliderInteractionProperty);
      },
      endDrag: () => {
        removeFinger('protonCountSlider', protonSliderInteractionProperty, this.protonCountProperty);
      },
      // pdom
      labelContent: protonsValuePatternString,
      labelTagName: 'label',
      descriptionContent: protonSliderDescriptionString,
      containerTagName: 'div'
    });
    const protonNumberControl = new NumberControl(numberOfProtonsString, model.protonCountProperty, protonCountRange, protonNumberControlOptions);
    function protonCountListener() {
      // if we are still pressing the arrow buttons while neutron count is changing, we are pressing and holding -
      // update the interaction Properties so that the dashed circle appears
      if (leftProtonButtonDown) {
        leftProtonButtonInteractionProperty.set(true);
      }
      if (rightProtonButtonDown) {
        rightProtonButtonInteractionProperty.set(true);
      }
    }
    model.protonCountProperty.link(protonCountListener);
    const neutronCountRange = new RangeWithValue(RSConstants.MIN_NEUTRON_COUNT, RSConstants.MAX_NEUTRON_COUNT, RSConstants.DEFAULT_NEUTRON_COUNT);
    const neutronMajorTicks = [{
      value: neutronCountRange.min,
      label: new Text(neutronCountRange.min, {
        font: RSConstants.PANEL_TICK_FONT,
        fill: RSColors.panelSliderLabelColorProperty,
        pickable: false
      })
    }, {
      value: neutronCountRange.max,
      label: new Text(neutronCountRange.max, {
        font: RSConstants.PANEL_TICK_FONT,
        fill: RSColors.panelSliderLabelColorProperty,
        pickable: false
      })
    }];

    // will track whether we are pressing and holding arrow buttons down
    let leftNeutronButtonDown = false;
    let rightNeutronButtonDown = false;

    // Number control for protons
    const neutronNumberControlOptions = merge({}, numberControlOptions);
    neutronNumberControlOptions.titleNodeOptions = merge({}, numberControlOptions.titleNodeOptions, {
      fill: RSColors.neutronsLabelColorProperty
    });
    neutronNumberControlOptions.sliderOptions = merge({}, numberControlOptions.sliderOptions, {
      majorTicks: neutronMajorTicks,
      thumbFill: 'rgb(130, 130, 130)',
      thumbFillHighlighted: 'rgb(180, 180, 180)',
      // Individual callbacks for each component of the NumberControl to support multitouch
      startDrag: () => {
        addFinger('neutronCountSlider', neutronSliderInteractionProperty);
      },
      endDrag: () => {
        removeFinger('neutronCountSlider', neutronSliderInteractionProperty, this.neutronCountProperty);
      },
      // pdom
      labelContent: neutronsValuePatternString,
      labelTagName: 'label',
      descriptionContent: neutronSliderDescriptionString,
      containerTagName: 'div'
    });
    neutronNumberControlOptions.arrowButtonOptions = {
      leftEnd: () => {
        leftNeutronButtonInteractionProperty.set(false);
        leftNeutronButtonDown = false;
        model.removeAllParticles();
      },
      rightEnd: () => {
        rightNeutronButtonInteractionProperty.set(false);
        rightNeutronButtonDown = false;
        model.removeAllParticles();
      },
      leftStart: () => {
        leftNeutronButtonDown = true;
      },
      rightStart: () => {
        rightNeutronButtonDown = true;
      }
    };
    const neutronNumberControl = new NumberControl(numberOfNeutronsString, model.neutronCountProperty, neutronCountRange, neutronNumberControlOptions);
    function neutronCountListener() {
      // if we are still pressing the arrow buttons while neutron count is changing, we are pressing and holding -
      // update the interaction Properties so that the dashed circle appears
      if (leftNeutronButtonDown) {
        leftNeutronButtonInteractionProperty.set(true);
      }
      if (rightNeutronButtonDown) {
        rightNeutronButtonInteractionProperty.set(true);
      }
    }

    // main panel content
    super({
      spacing: RSConstants.PANEL_CHILD_SPACING * 2.1,
      top: 0,
      right: 0,
      align: 'left',
      resize: false,
      children: [protonNumberControl, neutronNumberControl]
    });

    // @private
    this.protonInteractionProperty = model.protonInteractionProperty;
    this.neutronInteractionProperty = model.neutronInteractionProperty;
    this.neutronCountProperty = model.neutronCountProperty;
    this.protonCountProperty = model.protonCountProperty;
    this.neutronCountProperty.link(neutronCountListener);
    this.disposeContent = () => {
      // NOTE: Disposing arrow buttons causes an assertion failure, see axon #77.
      // However, there is no indication of a memory leak even though these are commented
      // dispose arrow buttons
      // this.protonMinusButton.dispose();
      // this.protonPlusButton.dispose();
      // this.neutronMinusButton.dispose();
      // this.neutronPlusButton.dispose();

      // dispose listeners attached to proton/neutron count Properties
      this.neutronCountProperty.unlink(neutronCountListener);
      this.protonCountProperty.unlink(protonCountListener);

      // dispose number controls
      protonNumberControl.dispose();
      neutronNumberControl.dispose();

      // dispose the derived properties
      protonPanelInteractionProperty.dispose();
      neutronPanelInteractionProperty.dispose();
    };
  }

  /**
   * Make eligible for garbage collection.
   * @public
   */
  dispose() {
    this.disposeContent();
    super.dispose();
  }
}
rutherfordScattering.register('AtomPropertiesPanelContent', AtomPropertiesPanelContent);
rutherfordScattering.register('AtomPropertiesPanel', AtomPropertiesPanel);
export default AtomPropertiesPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZVdpdGhWYWx1ZSIsIlV0aWxzIiwibWVyZ2UiLCJOdW1iZXJDb250cm9sIiwiVGV4dCIsIlZCb3giLCJQYW5lbCIsIlJTQ29sb3JzIiwiUlNDb25zdGFudHMiLCJydXRoZXJmb3JkU2NhdHRlcmluZyIsIlJ1dGhlcmZvcmRTY2F0dGVyaW5nU3RyaW5ncyIsImF0b21TdHJpbmciLCJhdG9tIiwibnVtYmVyT2ZOZXV0cm9uc1N0cmluZyIsIm51bWJlck9mTmV1dHJvbnMiLCJudW1iZXJPZlByb3RvbnNTdHJpbmciLCJudW1iZXJPZlByb3RvbnMiLCJhdG9tU2V0dGluZ3NTdHJpbmciLCJhMTF5IiwiYXRvbVNldHRpbmdzIiwicHJvdG9uc1ZhbHVlUGF0dGVyblN0cmluZyIsInByb3RvbnNWYWx1ZVBhdHRlcm4iLCJwcm90b25TbGlkZXJEZXNjcmlwdGlvblN0cmluZyIsInByb3RvblNsaWRlckRlc2NyaXB0aW9uIiwibmV1dHJvbnNWYWx1ZVBhdHRlcm5TdHJpbmciLCJuZXV0cm9uc1ZhbHVlUGF0dGVybiIsIm5ldXRyb25TbGlkZXJEZXNjcmlwdGlvblN0cmluZyIsIm5ldXRyb25TbGlkZXJEZXNjcmlwdGlvbiIsIkZJTkdFUl9UUkFDS0VSIiwiaW50ZXJhY3Rpb25Qcm9wZXJ0eUdyb3VwIiwibGVmdFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHkiLCJyaWdodFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHkiLCJwcm90b25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5IiwibGVmdE5ldXRyb25CdXR0b25JbnRlcmFjdGlvblByb3BlcnR5IiwicmlnaHROZXV0cm9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eSIsIm5ldXRyb25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5IiwiQXRvbVByb3BlcnRpZXNQYW5lbCIsImNvbnN0cnVjdG9yIiwiY29udGVudCIsIm9wdGlvbnMiLCJhdG9tUHJvcGVydGllc1RleHQiLCJmb250IiwiUEFORUxfVElUTEVfRk9OVCIsImZvbnRXZWlnaHQiLCJmaWxsIiwicGFuZWxUaXRsZUNvbG9yUHJvcGVydHkiLCJtYXhXaWR0aCIsInBhbmVsQm94IiwiY2hpbGRyZW4iLCJhbGlnbiIsInNwYWNpbmciLCJQQU5FTF9DSElMRF9TUEFDSU5HIiwieE1hcmdpbiIsIlBBTkVMX1hfTUFSR0lOIiwieU1hcmdpbiIsIm1pbldpZHRoIiwiUEFORUxfTUlOX1dJRFRIIiwiUEFORUxfTUFYX1dJRFRIIiwicmVzaXplIiwicGFuZWxDb2xvclByb3BlcnR5Iiwic3Ryb2tlIiwicGFuZWxCb3JkZXJDb2xvclByb3BlcnR5IiwidGFnTmFtZSIsImxhYmVsVGFnTmFtZSIsImxhYmVsQ29udGVudCIsImRpc3Bvc2VBdG9tUHJvcGVydGllc1BhbmVsIiwiZGlzcG9zZSIsImNyZWF0ZVBhbmVsQ29udGVudCIsIm1vZGVsIiwiQXRvbVByb3BlcnRpZXNQYW5lbENvbnRlbnQiLCJwcm90b25QYW5lbEludGVyYWN0aW9uUHJvcGVydHkiLCJvciIsIm5ldXRyb25QYW5lbEludGVyYWN0aW9uUHJvcGVydHkiLCJwcm90b25JbnRlcmFjdGlvbkxpc3RlbmVyIiwicHJvdG9uSW50ZXJhY3Rpb24iLCJwcm90b25JbnRlcmFjdGlvblByb3BlcnR5Iiwic2V0IiwibmV1dHJvbkludGVyYWN0aW9uTGlzdGVuZXIiLCJuZXV0cm9uSW50ZXJhY3Rpb24iLCJuZXV0cm9uSW50ZXJhY3Rpb25Qcm9wZXJ0eSIsImxpbmsiLCJhZGRGaW5nZXIiLCJzbGlkZXJJRCIsImludGVyYWN0aW9uUHJvcGVydHkiLCJyZW1vdmVGaW5nZXIiLCJjb3VudFByb3BlcnR5IiwiYXNzZXJ0Iiwicm91bmRTeW1tZXRyaWMiLCJ2YWx1ZSIsInNsaWRlcldpZHRoIiwibnVtYmVyQ29udHJvbE9wdGlvbnMiLCJsYXlvdXRGdW5jdGlvbiIsImNyZWF0ZUxheW91dEZ1bmN0aW9uMyIsInlTcGFjaW5nIiwiYWxpZ25UaXRsZSIsInRpdGxlTGVmdEluZGVudCIsInRpdGxlTm9kZU9wdGlvbnMiLCJQQU5FTF9QUk9QRVJUWV9GT05UIiwiY29weSIsIndlaWdodCIsIm51bWJlckRpc3BsYXlPcHRpb25zIiwiYmFja2dyb3VuZFN0cm9rZSIsInRleHRPcHRpb25zIiwiUEFORUxfVkFMVUVfRElTUExBWV9GT05UIiwic2xpZGVyT3B0aW9ucyIsInRyYWNrU2l6ZSIsInRyYWNrRmlsbCIsInBhbmVsU2xpZGVyTGFiZWxDb2xvclByb3BlcnR5IiwidHJhY2tTdHJva2UiLCJ0aHVtYkNlbnRlckxpbmVTdHJva2UiLCJ0aHVtYlNpemUiLCJQQU5FTF9TTElERVJfVEhVTUJfRElNRU5TSU9OIiwibWFqb3JUaWNrU3Ryb2tlIiwibWFqb3JUaWNrTGVuZ3RoIiwidGlja0xhYmVsU3BhY2luZyIsImtleWJvYXJkU3RlcCIsInBhZ2VLZXlib2FyZFN0ZXAiLCJwcm90b25Db3VudFJhbmdlIiwiTUlOX1BST1RPTl9DT1VOVCIsIk1BWF9QUk9UT05fQ09VTlQiLCJERUZBVUxUX1BST1RPTl9DT1VOVCIsInByb3Rvbk1ham9yVGlja3MiLCJtaW4iLCJsYWJlbCIsIlBBTkVMX1RJQ0tfRk9OVCIsInBpY2thYmxlIiwibWF4IiwicmlnaHRQcm90b25CdXR0b25Eb3duIiwibGVmdFByb3RvbkJ1dHRvbkRvd24iLCJwcm90b25OdW1iZXJDb250cm9sT3B0aW9ucyIsInByb3RvbnNMYWJlbENvbG9yUHJvcGVydHkiLCJhcnJvd0J1dHRvbk9wdGlvbnMiLCJsZWZ0U3RhcnQiLCJsZWZ0RW5kIiwicmVtb3ZlQWxsUGFydGljbGVzIiwicmlnaHRTdGFydCIsInJpZ2h0RW5kIiwibWFqb3JUaWNrcyIsInRodW1iRmlsbCIsInRodW1iRmlsbEhpZ2hsaWdodGVkIiwic3RhcnREcmFnIiwiZW5kRHJhZyIsInByb3RvbkNvdW50UHJvcGVydHkiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJjb250YWluZXJUYWdOYW1lIiwicHJvdG9uTnVtYmVyQ29udHJvbCIsInByb3RvbkNvdW50TGlzdGVuZXIiLCJuZXV0cm9uQ291bnRSYW5nZSIsIk1JTl9ORVVUUk9OX0NPVU5UIiwiTUFYX05FVVRST05fQ09VTlQiLCJERUZBVUxUX05FVVRST05fQ09VTlQiLCJuZXV0cm9uTWFqb3JUaWNrcyIsImxlZnROZXV0cm9uQnV0dG9uRG93biIsInJpZ2h0TmV1dHJvbkJ1dHRvbkRvd24iLCJuZXV0cm9uTnVtYmVyQ29udHJvbE9wdGlvbnMiLCJuZXV0cm9uc0xhYmVsQ29sb3JQcm9wZXJ0eSIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwibmV1dHJvbk51bWJlckNvbnRyb2wiLCJuZXV0cm9uQ291bnRMaXN0ZW5lciIsInRvcCIsInJpZ2h0IiwiZGlzcG9zZUNvbnRlbnQiLCJ1bmxpbmsiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkF0b21Qcm9wZXJ0aWVzUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbCBwYW5lbCB0byBhZGp1c3QgdGhlIG51bWJlciBvZiBwcm90b25zIGFuZCBuZXV0cm9ucyB1c2VkIGluIHRoZSBzaW1cclxuICpcclxuICogQGF1dGhvciBEYXZlIFNjaG1pdHogKFNjaG1pdHp3YXJlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlV2l0aFZhbHVlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZVdpdGhWYWx1ZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IE51bWJlckNvbnRyb2wgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL051bWJlckNvbnRyb2wuanMnO1xyXG5pbXBvcnQgeyBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBSU0NvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vUlNDb2xvcnMuanMnO1xyXG5pbXBvcnQgUlNDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1JTQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHJ1dGhlcmZvcmRTY2F0dGVyaW5nIGZyb20gJy4uLy4uL3J1dGhlcmZvcmRTY2F0dGVyaW5nLmpzJztcclxuaW1wb3J0IFJ1dGhlcmZvcmRTY2F0dGVyaW5nU3RyaW5ncyBmcm9tICcuLi8uLi9SdXRoZXJmb3JkU2NhdHRlcmluZ1N0cmluZ3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IGF0b21TdHJpbmcgPSBSdXRoZXJmb3JkU2NhdHRlcmluZ1N0cmluZ3MuYXRvbTtcclxuY29uc3QgbnVtYmVyT2ZOZXV0cm9uc1N0cmluZyA9IFJ1dGhlcmZvcmRTY2F0dGVyaW5nU3RyaW5ncy5udW1iZXJPZk5ldXRyb25zO1xyXG5jb25zdCBudW1iZXJPZlByb3RvbnNTdHJpbmcgPSBSdXRoZXJmb3JkU2NhdHRlcmluZ1N0cmluZ3MubnVtYmVyT2ZQcm90b25zO1xyXG5jb25zdCBhdG9tU2V0dGluZ3NTdHJpbmcgPSBSdXRoZXJmb3JkU2NhdHRlcmluZ1N0cmluZ3MuYTExeS5hdG9tU2V0dGluZ3M7XHJcblxyXG4vLyBUT0RPOiBtYWtlIHRoZXNlIHRlbXBsYXRlIHZhcnMgYWdhaW4gd2hlbiB3b3JraW5nIG9uIGRlc2NyaXB0aW9uc1xyXG5jb25zdCBwcm90b25zVmFsdWVQYXR0ZXJuU3RyaW5nID0gUnV0aGVyZm9yZFNjYXR0ZXJpbmdTdHJpbmdzLmExMXkucHJvdG9uc1ZhbHVlUGF0dGVybjtcclxuY29uc3QgcHJvdG9uU2xpZGVyRGVzY3JpcHRpb25TdHJpbmcgPSBSdXRoZXJmb3JkU2NhdHRlcmluZ1N0cmluZ3MuYTExeS5wcm90b25TbGlkZXJEZXNjcmlwdGlvbjtcclxuY29uc3QgbmV1dHJvbnNWYWx1ZVBhdHRlcm5TdHJpbmcgPSBSdXRoZXJmb3JkU2NhdHRlcmluZ1N0cmluZ3MuYTExeS5uZXV0cm9uc1ZhbHVlUGF0dGVybjtcclxuY29uc3QgbmV1dHJvblNsaWRlckRlc2NyaXB0aW9uU3RyaW5nID0gUnV0aGVyZm9yZFNjYXR0ZXJpbmdTdHJpbmdzLmExMXkubmV1dHJvblNsaWRlckRlc2NyaXB0aW9uO1xyXG5cclxuLy8gZ2xvYmFsLCB0cmFja2luZyB3aGVyZSBmaW5nZXJzIGFyZSBmb3IgbXVsdGl0b3VjaCBzdXBwb3J0XHJcbi8vIG11c3QgcGVyc2lzdCBiZXlvbmQgbGlmZXRpbWUgb2YgdGhlIHBhbmVsIHNvIHRoYXQgZmluZ2VycyBhcmUgdHJhY2tlZCB3aGVuIG5ld1xyXG4vLyBwYW5lbHMgYXJlIGNyZWF0ZWQgZm9yIHNjZW5lIG9yIGNvbG9yIHByb2ZpbGUgY2hhbmdlc1xyXG5jb25zdCBGSU5HRVJfVFJBQ0tFUiA9IHt9O1xyXG5cclxuLy8gc3BlY2lmaWMgaW50ZXJhY3Rpb24gcHJvcGVydGllcyBmb3IgdGhlIHJ1dGhlcmZvcmQgYXRvbSBwb3J0aW9uLCBmb3IgbXVsdGl0b3VjaFxyXG4vLyBOb3Qgc3BlY2lmaWMgdG8gYW4gaW5zdGFuY2Ugb2YgYW4gQXRvbVByb3BlcnRpZXNQYW5lbCwgdmFsdWVzIG9mIHRoZSBpbnRlcmFjdGlvbiBzdGF0ZSBQcm9wZXJ0aWVzIHNob3VsZFxyXG4vLyBwZXJzaXN0IGJleW9uZCB3aGVuIHNjZW5lIG9yIGNvbG9yIHByb2ZpbGUgY2hhbmdlc1xyXG5jb25zdCBpbnRlcmFjdGlvblByb3BlcnR5R3JvdXAgPSB7XHJcbiAgbGVmdFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZmFsc2UgKSxcclxuICByaWdodFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZmFsc2UgKSxcclxuICBwcm90b25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5OiBuZXcgUHJvcGVydHkoIGZhbHNlICksXHJcbiAgbGVmdE5ldXRyb25CdXR0b25JbnRlcmFjdGlvblByb3BlcnR5OiBuZXcgUHJvcGVydHkoIGZhbHNlICksXHJcbiAgcmlnaHROZXV0cm9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBmYWxzZSApLFxyXG4gIG5ldXRyb25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5OiBuZXcgUHJvcGVydHkoIGZhbHNlIClcclxufTtcclxuXHJcbmNsYXNzIEF0b21Qcm9wZXJ0aWVzUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtBdG9tUHJvcGVydGllc1BhbmVsQ29udGVudH0gY29udGVudCAtIENvbnRlbnQgY29udGFpbmVkIGJ5IHRoZSBwYW5lbFxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29udGVudCwgb3B0aW9ucyApIHtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHRpdGxlIG9mIHRoZSBwYW5lbCBjb250ZW50XHJcbiAgICBjb25zdCBhdG9tUHJvcGVydGllc1RleHQgPSBuZXcgVGV4dCggYXRvbVN0cmluZywge1xyXG4gICAgICBmb250OiBSU0NvbnN0YW50cy5QQU5FTF9USVRMRV9GT05ULFxyXG4gICAgICBmb250V2VpZ2h0OiAnYm9sZCcsXHJcbiAgICAgIGZpbGw6IFJTQ29sb3JzLnBhbmVsVGl0bGVDb2xvclByb3BlcnR5LFxyXG4gICAgICBtYXhXaWR0aDogMjI1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGFuZWxCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBhdG9tUHJvcGVydGllc1RleHQsIGNvbnRlbnQgXSxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogUlNDb25zdGFudHMuUEFORUxfQ0hJTERfU1BBQ0lOR1xyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICB4TWFyZ2luOiBSU0NvbnN0YW50cy5QQU5FTF9YX01BUkdJTixcclxuICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgIG1pbldpZHRoOiBSU0NvbnN0YW50cy5QQU5FTF9NSU5fV0lEVEgsXHJcbiAgICAgIG1heFdpZHRoOiBSU0NvbnN0YW50cy5QQU5FTF9NQVhfV0lEVEgsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgICAgcmVzaXplOiBmYWxzZSxcclxuICAgICAgZmlsbDogUlNDb2xvcnMucGFuZWxDb2xvclByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IFJTQ29sb3JzLnBhbmVsQm9yZGVyQ29sb3JQcm9wZXJ0eSxcclxuXHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMycsXHJcbiAgICAgIGxhYmVsQ29udGVudDogYXRvbVNldHRpbmdzU3RyaW5nXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHBhbmVsQm94LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gZW5zdXJlIHRoYXQgcGFuZWwgaXMgZWxpZ2libGUgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbiwgYSBwYW5lbCBpcyBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgZXZlcnkgdGltZVxyXG4gICAgLy8gc2NlbmUgb3IgY29sb3Igc2NoZW1lIGNoYW5nZXMgc28gaXQgc2kgaW1wb3J0YW50IHRoYXQgZXZlcnl0aGluZyBpcyBkaXNwb3NlZFxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZUF0b21Qcm9wZXJ0aWVzUGFuZWwgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnRlbnQuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBjb250ZW50IGZvciB0aGUgcGFuZWxcclxuICAgKlxyXG4gICAqIEBwYXJhbSBtb2RlbFxyXG4gICAqIEByZXR1cm5zIHtOb2RlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzdGF0aWMgY3JlYXRlUGFuZWxDb250ZW50KCBtb2RlbCwgb3B0aW9ucyApIHtcclxuICAgIHJldHVybiBuZXcgQXRvbVByb3BlcnRpZXNQYW5lbENvbnRlbnQoIG1vZGVsLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlIHRoaXMgcGFuZWwgLSB0aGlzIHBhbmVsIGNhbiBiZSBjcmVhdGVkIGFuZCBkZXN0cm95ZWQgZnJlcXVlbnRseSBzb1xyXG4gICAqIGl0IGlzIGltcG9ydGFudCB0byBkaXNwb3NlIG9mIGFsbCBwYW5lbCBlbGVtZW50cy5cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5kaXNwb3NlQXRvbVByb3BlcnRpZXNQYW5lbCgpO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQXRvbVByb3BlcnRpZXNQYW5lbENvbnRlbnQgZXh0ZW5kcyBWQm94IHtcclxuICAvKipcclxuICAgKiBDcmVhdGUgdGhlIGNvbnRlbnQgZm9yIHRoZSBBdG9tUHJvcGVydGllc1BhbmVsLiBUaGlzIGRvZXMgbm90IGluY2x1ZGUgdGhlIHBhbmVsIHRpdGxlLlxyXG4gICAqXHJcbiAgICogQHBhcmFtICB7UHJvcGVydHkuPGJvb2xlYW4+fSBwcm90b25JbnRlcmFjdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtICB7UHJvcGVydHkuPGJvb2xlYW4+fSBuZXV0cm9uSW50ZXJhY3Rpb25Qcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSAge1Byb3BlcnR5LjxudW1iZXI+fSBwcm90b25Db3VudFByb3BlcnR5XHJcbiAgICogQHBhcmFtICB7UHJvcGVydHkuPG51bWJlcj59IG5ldXRyb25Db3VudFByb3BlcnR5XHJcbiAgICogQHBhcmFtICB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHhNYXJnaW46IDE1LFxyXG4gICAgICB5TWFyZ2luOiA4LFxyXG4gICAgICBtaW5XaWR0aDogUlNDb25zdGFudHMuUEFORUxfTUlOX1dJRFRILFxyXG4gICAgICBtYXhXaWR0aDogUlNDb25zdGFudHMuUEFORUxfTUFYX1dJRFRILFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICByZXNpemU6IGZhbHNlLFxyXG4gICAgICBmaWxsOiBSU0NvbG9ycy5wYW5lbENvbG9yUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogUlNDb2xvcnMucGFuZWxCb3JkZXJDb2xvclByb3BlcnR5XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gZWFjaCBlbGVtZW50IG11c3QgaGF2ZSBhIHVuaXF1ZSBpbnRlcmFjdGlvbiBwcm9wZXJ0eSB0byBzdXBwb3J0IG11bHRpdG91Y2gsIHNlZSAjMTA0XHJcbiAgICBjb25zdCBsZWZ0UHJvdG9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eSA9IGludGVyYWN0aW9uUHJvcGVydHlHcm91cC5sZWZ0UHJvdG9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eTtcclxuICAgIGNvbnN0IHJpZ2h0UHJvdG9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eSA9IGludGVyYWN0aW9uUHJvcGVydHlHcm91cC5yaWdodFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHk7XHJcbiAgICBjb25zdCBsZWZ0TmV1dHJvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHkgPSBpbnRlcmFjdGlvblByb3BlcnR5R3JvdXAubGVmdE5ldXRyb25CdXR0b25JbnRlcmFjdGlvblByb3BlcnR5O1xyXG4gICAgY29uc3QgcmlnaHROZXV0cm9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eSA9IGludGVyYWN0aW9uUHJvcGVydHlHcm91cC5sZWZ0UHJvdG9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eTtcclxuICAgIGNvbnN0IHByb3RvblNsaWRlckludGVyYWN0aW9uUHJvcGVydHkgPSBpbnRlcmFjdGlvblByb3BlcnR5R3JvdXAucHJvdG9uU2xpZGVySW50ZXJhY3Rpb25Qcm9wZXJ0eTtcclxuICAgIGNvbnN0IG5ldXRyb25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5ID0gaW50ZXJhY3Rpb25Qcm9wZXJ0eUdyb3VwLm5ldXRyb25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5O1xyXG5cclxuICAgIC8vIHRoZXNlIHByb3BlcnRpZXMgYXJlIHRydWUgd2hlbiBhbnkgb2YgdGhlIGRlcGVuZGVuY2llcyBhcmUgdHJ1ZVxyXG4gICAgY29uc3QgcHJvdG9uUGFuZWxJbnRlcmFjdGlvblByb3BlcnR5ID0gRGVyaXZlZFByb3BlcnR5Lm9yKCBbIGxlZnRQcm90b25CdXR0b25JbnRlcmFjdGlvblByb3BlcnR5LCByaWdodFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHksIHByb3RvblNsaWRlckludGVyYWN0aW9uUHJvcGVydHkgXSApO1xyXG4gICAgY29uc3QgbmV1dHJvblBhbmVsSW50ZXJhY3Rpb25Qcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5vciggWyBsZWZ0TmV1dHJvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHksIHJpZ2h0TmV1dHJvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHksIG5ldXRyb25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5IF0gKTtcclxuXHJcbiAgICAvLyBtdXN0IGJlIGRpc3Bvc2VkXHJcbiAgICBjb25zdCBwcm90b25JbnRlcmFjdGlvbkxpc3RlbmVyID0gcHJvdG9uSW50ZXJhY3Rpb24gPT4ge1xyXG4gICAgICBtb2RlbC5wcm90b25JbnRlcmFjdGlvblByb3BlcnR5LnNldCggcHJvdG9uSW50ZXJhY3Rpb24gKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBuZXV0cm9uSW50ZXJhY3Rpb25MaXN0ZW5lciA9IG5ldXRyb25JbnRlcmFjdGlvbiA9PiB7XHJcbiAgICAgIG1vZGVsLm5ldXRyb25JbnRlcmFjdGlvblByb3BlcnR5LnNldCggbmV1dHJvbkludGVyYWN0aW9uICk7XHJcbiAgICB9O1xyXG4gICAgcHJvdG9uUGFuZWxJbnRlcmFjdGlvblByb3BlcnR5LmxpbmsoIHByb3RvbkludGVyYWN0aW9uTGlzdGVuZXIgKTtcclxuICAgIG5ldXRyb25QYW5lbEludGVyYWN0aW9uUHJvcGVydHkubGluayggbmV1dHJvbkludGVyYWN0aW9uTGlzdGVuZXIgKTtcclxuICAgIC8vIGVuZCBvZiBtdWx0aXRvdWNoIHNldCB1cFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVHJhY2sgZmluZ2VycyBmb3IgbXVsdGl0b3VjaCwgYWRkaW5nIGEgZmluZ2VyIGNvdW50IHRvIGEgcGFydGljdWxhciBlbGVtZW50IGFuZCBzZXR0aW5nXHJcbiAgICAgKiB0aGUgaW50ZXJhY3Rpb24gcHJvcGVydGllcyBjb3JyZWN0bHkuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBzbGlkZXJJRFxyXG4gICAgICogQHBhcmFtICB7UHJvcGVydHkuPGJvb2xlYW4+fSBpbnRlcmFjdGlvblByb3BlcnR5XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGFkZEZpbmdlciA9ICggc2xpZGVySUQsIGludGVyYWN0aW9uUHJvcGVydHkgKSA9PiB7XHJcbiAgICAgIGludGVyYWN0aW9uUHJvcGVydHkuc2V0KCB0cnVlICk7XHJcbiAgICAgIGlmICggIUZJTkdFUl9UUkFDS0VSWyBzbGlkZXJJRCBdICYmIEZJTkdFUl9UUkFDS0VSWyBzbGlkZXJJRCBdICE9PSAwICkge1xyXG4gICAgICAgIEZJTkdFUl9UUkFDS0VSWyBzbGlkZXJJRCBdID0gMTsgLy8gZmlyc3QgdGltZSBmaW5nZXIgaXMgZG93biBvbiB0aGlzIHRodW1iXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgRklOR0VSX1RSQUNLRVJbIHNsaWRlcklEIF0rKztcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSBhIGZpbmdlciBmcm9tIGFuIGVsZW1lbnQgZm9yIG11bHRpdG91Y2ggc3VwcG9ydCwgcmVtb3ZpbmcgYSBmaW5nZXIgY291bnQgZnJvbSBhIHBhcnRpY3VsYXIgZWxlbWVudFxyXG4gICAgICogYW5kIHNldHRpbmcgdGhlIGludGVyYWN0aW9uIHByb3BlcnRpZXMgYXBwcm9wcmlhdGVseS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IHNsaWRlcklEXHJcbiAgICAgKiBAcGFyYW0gIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGludGVyYWN0aW9uUHJvcGVydHlcclxuICAgICAqIEBwYXJhbSAge1Byb3BlcnR5LjxudW1iZXI+fSBjb3VudFByb3BlcnR5XHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHJlbW92ZUZpbmdlciA9ICggc2xpZGVySUQsIGludGVyYWN0aW9uUHJvcGVydHksIGNvdW50UHJvcGVydHkgKSA9PiB7XHJcbiAgICAgIEZJTkdFUl9UUkFDS0VSWyBzbGlkZXJJRCBdLS07XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEZJTkdFUl9UUkFDS0VSWyBzbGlkZXJJRCBdID49IDAsICdhdCBsZWFzdCAwIGZpbmdlcnMgbXVzdCBiZSB1c2luZyB0aGUgc2xpZGVyJyApO1xyXG4gICAgICBjb3VudFByb3BlcnR5LnNldCggVXRpbHMucm91bmRTeW1tZXRyaWMoIGNvdW50UHJvcGVydHkudmFsdWUgKSApOyAvLyBwcm9wZXIgcmVzb2x1dGlvbiBmb3IgbnVjbGVvbnNcclxuICAgICAgaWYgKCBGSU5HRVJfVFJBQ0tFUlsgc2xpZGVySUQgXSA9PT0gMCApIHtcclxuICAgICAgICBpbnRlcmFjdGlvblByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBzbGlkZXJXaWR0aCA9IG9wdGlvbnMubWluV2lkdGggKiAwLjc1O1xyXG4gICAgY29uc3QgbnVtYmVyQ29udHJvbE9wdGlvbnMgPSB7XHJcbiAgICAgIGxheW91dEZ1bmN0aW9uOiBOdW1iZXJDb250cm9sLmNyZWF0ZUxheW91dEZ1bmN0aW9uMygge1xyXG4gICAgICAgIHlTcGFjaW5nOiAzLFxyXG4gICAgICAgIGFsaWduVGl0bGU6ICdsZWZ0JyxcclxuICAgICAgICB0aXRsZUxlZnRJbmRlbnQ6IG9wdGlvbnMubWluV2lkdGggKiAwLjA1IC8vIGluZGVudCBvZiB0aGUgdGl0bGVcclxuICAgICAgfSApLFxyXG4gICAgICB0aXRsZU5vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogUlNDb25zdGFudHMuUEFORUxfUFJPUEVSVFlfRk9OVC5jb3B5KCB7IHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgICBtYXhXaWR0aDogMjEwXHJcbiAgICAgIH0sXHJcbiAgICAgIG51bWJlckRpc3BsYXlPcHRpb25zOiB7XHJcbiAgICAgICAgYmFja2dyb3VuZFN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogUlNDb25zdGFudHMuUEFORUxfVkFMVUVfRElTUExBWV9GT05UXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBzbGlkZXJPcHRpb25zOiB7XHJcbiAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggc2xpZGVyV2lkdGgsIDEgKSxcclxuICAgICAgICB0cmFja0ZpbGw6IFJTQ29sb3JzLnBhbmVsU2xpZGVyTGFiZWxDb2xvclByb3BlcnR5LFxyXG4gICAgICAgIHRyYWNrU3Ryb2tlOiBSU0NvbG9ycy5wYW5lbFNsaWRlckxhYmVsQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICB0aHVtYkNlbnRlckxpbmVTdHJva2U6ICd3aGl0ZScsXHJcbiAgICAgICAgdGh1bWJTaXplOiBSU0NvbnN0YW50cy5QQU5FTF9TTElERVJfVEhVTUJfRElNRU5TSU9OLFxyXG5cclxuICAgICAgICBtYWpvclRpY2tTdHJva2U6IFJTQ29sb3JzLnBhbmVsU2xpZGVyTGFiZWxDb2xvclByb3BlcnR5LFxyXG4gICAgICAgIG1ham9yVGlja0xlbmd0aDogMTUsXHJcbiAgICAgICAgdGlja0xhYmVsU3BhY2luZzogMixcclxuXHJcbiAgICAgICAgLy8gcGRvbVxyXG4gICAgICAgIGtleWJvYXJkU3RlcDogNSxcclxuICAgICAgICBwYWdlS2V5Ym9hcmRTdGVwOiAxMFxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIGFsbG93YWJsZSByYW5nZSBmb3IgcHJvdG9uIHZhbHVlc1xyXG4gICAgY29uc3QgcHJvdG9uQ291bnRSYW5nZSA9IG5ldyBSYW5nZVdpdGhWYWx1ZSggUlNDb25zdGFudHMuTUlOX1BST1RPTl9DT1VOVCwgUlNDb25zdGFudHMuTUFYX1BST1RPTl9DT1VOVCxcclxuICAgICAgUlNDb25zdGFudHMuREVGQVVMVF9QUk9UT05fQ09VTlQgKTtcclxuXHJcbiAgICBjb25zdCBwcm90b25NYWpvclRpY2tzID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdmFsdWU6IHByb3RvbkNvdW50UmFuZ2UubWluLFxyXG4gICAgICAgIGxhYmVsOiBuZXcgVGV4dCggcHJvdG9uQ291bnRSYW5nZS5taW4sIHtcclxuICAgICAgICAgIGZvbnQ6IFJTQ29uc3RhbnRzLlBBTkVMX1RJQ0tfRk9OVCxcclxuICAgICAgICAgIGZpbGw6IFJTQ29sb3JzLnBhbmVsU2xpZGVyTGFiZWxDb2xvclByb3BlcnR5LFxyXG4gICAgICAgICAgcGlja2FibGU6IGZhbHNlXHJcbiAgICAgICAgfSApXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogcHJvdG9uQ291bnRSYW5nZS5tYXgsXHJcbiAgICAgICAgbGFiZWw6IG5ldyBUZXh0KCBwcm90b25Db3VudFJhbmdlLm1heCwge1xyXG4gICAgICAgICAgZm9udDogUlNDb25zdGFudHMuUEFORUxfVElDS19GT05ULFxyXG4gICAgICAgICAgZmlsbDogUlNDb2xvcnMucGFuZWxTbGlkZXJMYWJlbENvbG9yUHJvcGVydHksXHJcbiAgICAgICAgICBwaWNrYWJsZTogZmFsc2VcclxuICAgICAgICB9IClcclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyB3aWxsIHRyYWNrIHdoZXRoZXIgd2UgYXJlIHByZXNzaW5nIGFuZCBob2xkaW5nIGFycm93IGJ1dHRvbnMgZG93blxyXG4gICAgbGV0IHJpZ2h0UHJvdG9uQnV0dG9uRG93biA9IGZhbHNlO1xyXG4gICAgbGV0IGxlZnRQcm90b25CdXR0b25Eb3duID0gZmFsc2U7XHJcblxyXG4gICAgLy8gTnVtYmVyIGNvbnRyb2wgZm9yIHByb3RvbnNcclxuICAgIGNvbnN0IHByb3Rvbk51bWJlckNvbnRyb2xPcHRpb25zID0gbWVyZ2UoIHt9LCBudW1iZXJDb250cm9sT3B0aW9ucyApO1xyXG4gICAgcHJvdG9uTnVtYmVyQ29udHJvbE9wdGlvbnMudGl0bGVOb2RlT3B0aW9ucyA9IG1lcmdlKCB7fSxcclxuICAgICAgbnVtYmVyQ29udHJvbE9wdGlvbnMudGl0bGVOb2RlT3B0aW9ucywgeyBmaWxsOiBSU0NvbG9ycy5wcm90b25zTGFiZWxDb2xvclByb3BlcnR5IH0gKTtcclxuICAgIHByb3Rvbk51bWJlckNvbnRyb2xPcHRpb25zLmFycm93QnV0dG9uT3B0aW9ucyA9IHtcclxuICAgICAgbGVmdFN0YXJ0OiAoKSA9PiB7XHJcbiAgICAgICAgbGVmdFByb3RvbkJ1dHRvbkRvd24gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICBsZWZ0RW5kOiAoKSA9PiB7XHJcbiAgICAgICAgbGVmdFByb3RvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIGxlZnRQcm90b25CdXR0b25Eb3duID0gZmFsc2U7XHJcbiAgICAgICAgbW9kZWwucmVtb3ZlQWxsUGFydGljbGVzKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0U3RhcnQ6ICgpID0+IHtcclxuICAgICAgICByaWdodFByb3RvbkJ1dHRvbkRvd24gPSB0cnVlO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodEVuZDogKCkgPT4ge1xyXG4gICAgICAgIHJpZ2h0UHJvdG9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcbiAgICAgICAgcmlnaHRQcm90b25CdXR0b25Eb3duID0gZmFsc2U7XHJcbiAgICAgICAgbW9kZWwucmVtb3ZlQWxsUGFydGljbGVzKCk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBwcm90b25OdW1iZXJDb250cm9sT3B0aW9ucy5zbGlkZXJPcHRpb25zID0gbWVyZ2UoIHt9LFxyXG4gICAgICBudW1iZXJDb250cm9sT3B0aW9ucy5zbGlkZXJPcHRpb25zLCB7XHJcbiAgICAgICAgbWFqb3JUaWNrczogcHJvdG9uTWFqb3JUaWNrcyxcclxuXHJcbiAgICAgICAgdGh1bWJGaWxsOiAncmdiKDIyMCwgNTgsIDEwKScsXHJcbiAgICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6ICdyZ2IoMjcwLCAxMDgsIDYwKScsXHJcblxyXG4gICAgICAgIC8vIEluZGl2aWR1YWwgY2FsbGJhY2tzIGZvciBlYWNoIGNvbXBvbmVudCBvZiB0aGUgTnVtYmVyQ29udHJvbCB0byBzdXBwb3J0IG11bHRpdG91Y2hcclxuICAgICAgICBzdGFydERyYWc6ICgpID0+IHsgYWRkRmluZ2VyKCAncHJvdG9uQ291bnRTbGlkZXInLCBwcm90b25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5ICk7IH0sXHJcbiAgICAgICAgZW5kRHJhZzogKCkgPT4geyByZW1vdmVGaW5nZXIoICdwcm90b25Db3VudFNsaWRlcicsIHByb3RvblNsaWRlckludGVyYWN0aW9uUHJvcGVydHksIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eSApOyB9LFxyXG5cclxuICAgICAgICAvLyBwZG9tXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBwcm90b25zVmFsdWVQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICAgICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IHByb3RvblNsaWRlckRlc2NyaXB0aW9uU3RyaW5nLFxyXG4gICAgICAgIGNvbnRhaW5lclRhZ05hbWU6ICdkaXYnXHJcbiAgICAgIH0gKTtcclxuICAgIGNvbnN0IHByb3Rvbk51bWJlckNvbnRyb2wgPSBuZXcgTnVtYmVyQ29udHJvbCggbnVtYmVyT2ZQcm90b25zU3RyaW5nLCBtb2RlbC5wcm90b25Db3VudFByb3BlcnR5LCBwcm90b25Db3VudFJhbmdlLCBwcm90b25OdW1iZXJDb250cm9sT3B0aW9ucyApO1xyXG5cclxuICAgIGZ1bmN0aW9uIHByb3RvbkNvdW50TGlzdGVuZXIoKSB7XHJcblxyXG4gICAgICAvLyBpZiB3ZSBhcmUgc3RpbGwgcHJlc3NpbmcgdGhlIGFycm93IGJ1dHRvbnMgd2hpbGUgbmV1dHJvbiBjb3VudCBpcyBjaGFuZ2luZywgd2UgYXJlIHByZXNzaW5nIGFuZCBob2xkaW5nIC1cclxuICAgICAgLy8gdXBkYXRlIHRoZSBpbnRlcmFjdGlvbiBQcm9wZXJ0aWVzIHNvIHRoYXQgdGhlIGRhc2hlZCBjaXJjbGUgYXBwZWFyc1xyXG4gICAgICBpZiAoIGxlZnRQcm90b25CdXR0b25Eb3duICkge1xyXG4gICAgICAgIGxlZnRQcm90b25CdXR0b25JbnRlcmFjdGlvblByb3BlcnR5LnNldCggdHJ1ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggcmlnaHRQcm90b25CdXR0b25Eb3duICkge1xyXG4gICAgICAgIHJpZ2h0UHJvdG9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vZGVsLnByb3RvbkNvdW50UHJvcGVydHkubGluayggcHJvdG9uQ291bnRMaXN0ZW5lciApO1xyXG5cclxuICAgIGNvbnN0IG5ldXRyb25Db3VudFJhbmdlID0gbmV3IFJhbmdlV2l0aFZhbHVlKCBSU0NvbnN0YW50cy5NSU5fTkVVVFJPTl9DT1VOVCwgUlNDb25zdGFudHMuTUFYX05FVVRST05fQ09VTlQsXHJcbiAgICAgIFJTQ29uc3RhbnRzLkRFRkFVTFRfTkVVVFJPTl9DT1VOVCApO1xyXG5cclxuICAgIGNvbnN0IG5ldXRyb25NYWpvclRpY2tzID0gWyB7XHJcbiAgICAgIHZhbHVlOiBuZXV0cm9uQ291bnRSYW5nZS5taW4sXHJcbiAgICAgIGxhYmVsOiBuZXcgVGV4dCggbmV1dHJvbkNvdW50UmFuZ2UubWluLCB7XHJcbiAgICAgICAgZm9udDogUlNDb25zdGFudHMuUEFORUxfVElDS19GT05ULFxyXG4gICAgICAgIGZpbGw6IFJTQ29sb3JzLnBhbmVsU2xpZGVyTGFiZWxDb2xvclByb3BlcnR5LFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgICB9IClcclxuICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB2YWx1ZTogbmV1dHJvbkNvdW50UmFuZ2UubWF4LFxyXG4gICAgICAgIGxhYmVsOiBuZXcgVGV4dCggbmV1dHJvbkNvdW50UmFuZ2UubWF4LCB7XHJcbiAgICAgICAgICBmb250OiBSU0NvbnN0YW50cy5QQU5FTF9USUNLX0ZPTlQsXHJcbiAgICAgICAgICBmaWxsOiBSU0NvbG9ycy5wYW5lbFNsaWRlckxhYmVsQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgICAgIH0gKVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG5cclxuICAgIC8vIHdpbGwgdHJhY2sgd2hldGhlciB3ZSBhcmUgcHJlc3NpbmcgYW5kIGhvbGRpbmcgYXJyb3cgYnV0dG9ucyBkb3duXHJcbiAgICBsZXQgbGVmdE5ldXRyb25CdXR0b25Eb3duID0gZmFsc2U7XHJcbiAgICBsZXQgcmlnaHROZXV0cm9uQnV0dG9uRG93biA9IGZhbHNlO1xyXG5cclxuICAgIC8vIE51bWJlciBjb250cm9sIGZvciBwcm90b25zXHJcbiAgICBjb25zdCBuZXV0cm9uTnVtYmVyQ29udHJvbE9wdGlvbnMgPSBtZXJnZSgge30sIG51bWJlckNvbnRyb2xPcHRpb25zICk7XHJcbiAgICBuZXV0cm9uTnVtYmVyQ29udHJvbE9wdGlvbnMudGl0bGVOb2RlT3B0aW9ucyA9IG1lcmdlKCB7fSxcclxuICAgICAgbnVtYmVyQ29udHJvbE9wdGlvbnMudGl0bGVOb2RlT3B0aW9ucywgeyBmaWxsOiBSU0NvbG9ycy5uZXV0cm9uc0xhYmVsQ29sb3JQcm9wZXJ0eSB9XHJcbiAgICApO1xyXG4gICAgbmV1dHJvbk51bWJlckNvbnRyb2xPcHRpb25zLnNsaWRlck9wdGlvbnMgPSBtZXJnZSgge30sXHJcbiAgICAgIG51bWJlckNvbnRyb2xPcHRpb25zLnNsaWRlck9wdGlvbnMsIHtcclxuICAgICAgICBtYWpvclRpY2tzOiBuZXV0cm9uTWFqb3JUaWNrcyxcclxuXHJcbiAgICAgICAgdGh1bWJGaWxsOiAncmdiKDEzMCwgMTMwLCAxMzApJyxcclxuICAgICAgICB0aHVtYkZpbGxIaWdobGlnaHRlZDogJ3JnYigxODAsIDE4MCwgMTgwKScsXHJcblxyXG4gICAgICAgIC8vIEluZGl2aWR1YWwgY2FsbGJhY2tzIGZvciBlYWNoIGNvbXBvbmVudCBvZiB0aGUgTnVtYmVyQ29udHJvbCB0byBzdXBwb3J0IG11bHRpdG91Y2hcclxuICAgICAgICBzdGFydERyYWc6ICgpID0+IHsgYWRkRmluZ2VyKCAnbmV1dHJvbkNvdW50U2xpZGVyJywgbmV1dHJvblNsaWRlckludGVyYWN0aW9uUHJvcGVydHkgKTsgfSxcclxuICAgICAgICBlbmREcmFnOiAoKSA9PiB7IHJlbW92ZUZpbmdlciggJ25ldXRyb25Db3VudFNsaWRlcicsIG5ldXRyb25TbGlkZXJJbnRlcmFjdGlvblByb3BlcnR5LCB0aGlzLm5ldXRyb25Db3VudFByb3BlcnR5ICk7IH0sXHJcblxyXG4gICAgICAgIC8vIHBkb21cclxuICAgICAgICBsYWJlbENvbnRlbnQ6IG5ldXRyb25zVmFsdWVQYXR0ZXJuU3RyaW5nLFxyXG4gICAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICAgICAgICBkZXNjcmlwdGlvbkNvbnRlbnQ6IG5ldXRyb25TbGlkZXJEZXNjcmlwdGlvblN0cmluZyxcclxuICAgICAgICBjb250YWluZXJUYWdOYW1lOiAnZGl2J1xyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIG5ldXRyb25OdW1iZXJDb250cm9sT3B0aW9ucy5hcnJvd0J1dHRvbk9wdGlvbnMgPSB7XHJcbiAgICAgIGxlZnRFbmQ6ICgpID0+IHtcclxuICAgICAgICBsZWZ0TmV1dHJvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIGxlZnROZXV0cm9uQnV0dG9uRG93biA9IGZhbHNlO1xyXG4gICAgICAgIG1vZGVsLnJlbW92ZUFsbFBhcnRpY2xlcygpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodEVuZDogKCkgPT4ge1xyXG4gICAgICAgIHJpZ2h0TmV1dHJvbkJ1dHRvbkludGVyYWN0aW9uUHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgICAgIHJpZ2h0TmV1dHJvbkJ1dHRvbkRvd24gPSBmYWxzZTtcclxuICAgICAgICBtb2RlbC5yZW1vdmVBbGxQYXJ0aWNsZXMoKTtcclxuICAgICAgfSxcclxuICAgICAgbGVmdFN0YXJ0OiAoKSA9PiB7XHJcbiAgICAgICAgbGVmdE5ldXRyb25CdXR0b25Eb3duID0gdHJ1ZTtcclxuICAgICAgfSxcclxuICAgICAgcmlnaHRTdGFydDogKCkgPT4ge1xyXG4gICAgICAgIHJpZ2h0TmV1dHJvbkJ1dHRvbkRvd24gPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgY29uc3QgbmV1dHJvbk51bWJlckNvbnRyb2wgPSBuZXcgTnVtYmVyQ29udHJvbCggbnVtYmVyT2ZOZXV0cm9uc1N0cmluZywgbW9kZWwubmV1dHJvbkNvdW50UHJvcGVydHksIG5ldXRyb25Db3VudFJhbmdlLCBuZXV0cm9uTnVtYmVyQ29udHJvbE9wdGlvbnMgKTtcclxuXHJcbiAgICBmdW5jdGlvbiBuZXV0cm9uQ291bnRMaXN0ZW5lcigpIHtcclxuXHJcbiAgICAgIC8vIGlmIHdlIGFyZSBzdGlsbCBwcmVzc2luZyB0aGUgYXJyb3cgYnV0dG9ucyB3aGlsZSBuZXV0cm9uIGNvdW50IGlzIGNoYW5naW5nLCB3ZSBhcmUgcHJlc3NpbmcgYW5kIGhvbGRpbmcgLVxyXG4gICAgICAvLyB1cGRhdGUgdGhlIGludGVyYWN0aW9uIFByb3BlcnRpZXMgc28gdGhhdCB0aGUgZGFzaGVkIGNpcmNsZSBhcHBlYXJzXHJcbiAgICAgIGlmICggbGVmdE5ldXRyb25CdXR0b25Eb3duICkge1xyXG4gICAgICAgIGxlZnROZXV0cm9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIHJpZ2h0TmV1dHJvbkJ1dHRvbkRvd24gKSB7XHJcbiAgICAgICAgcmlnaHROZXV0cm9uQnV0dG9uSW50ZXJhY3Rpb25Qcm9wZXJ0eS5zZXQoIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIG1haW4gcGFuZWwgY29udGVudFxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgc3BhY2luZzogUlNDb25zdGFudHMuUEFORUxfQ0hJTERfU1BBQ0lORyAqIDIuMSxcclxuICAgICAgdG9wOiAwLFxyXG4gICAgICByaWdodDogMCxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgcmVzaXplOiBmYWxzZSxcclxuICAgICAgY2hpbGRyZW46IFsgcHJvdG9uTnVtYmVyQ29udHJvbCwgbmV1dHJvbk51bWJlckNvbnRyb2wgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnByb3RvbkludGVyYWN0aW9uUHJvcGVydHkgPSBtb2RlbC5wcm90b25JbnRlcmFjdGlvblByb3BlcnR5O1xyXG4gICAgdGhpcy5uZXV0cm9uSW50ZXJhY3Rpb25Qcm9wZXJ0eSA9IG1vZGVsLm5ldXRyb25JbnRlcmFjdGlvblByb3BlcnR5O1xyXG4gICAgdGhpcy5uZXV0cm9uQ291bnRQcm9wZXJ0eSA9IG1vZGVsLm5ldXRyb25Db3VudFByb3BlcnR5O1xyXG4gICAgdGhpcy5wcm90b25Db3VudFByb3BlcnR5ID0gbW9kZWwucHJvdG9uQ291bnRQcm9wZXJ0eTtcclxuXHJcbiAgICB0aGlzLm5ldXRyb25Db3VudFByb3BlcnR5LmxpbmsoIG5ldXRyb25Db3VudExpc3RlbmVyICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlQ29udGVudCA9ICgpID0+IHtcclxuICAgICAgLy8gTk9URTogRGlzcG9zaW5nIGFycm93IGJ1dHRvbnMgY2F1c2VzIGFuIGFzc2VydGlvbiBmYWlsdXJlLCBzZWUgYXhvbiAjNzcuXHJcbiAgICAgIC8vIEhvd2V2ZXIsIHRoZXJlIGlzIG5vIGluZGljYXRpb24gb2YgYSBtZW1vcnkgbGVhayBldmVuIHRob3VnaCB0aGVzZSBhcmUgY29tbWVudGVkXHJcbiAgICAgIC8vIGRpc3Bvc2UgYXJyb3cgYnV0dG9uc1xyXG4gICAgICAvLyB0aGlzLnByb3Rvbk1pbnVzQnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgLy8gdGhpcy5wcm90b25QbHVzQnV0dG9uLmRpc3Bvc2UoKTtcclxuICAgICAgLy8gdGhpcy5uZXV0cm9uTWludXNCdXR0b24uZGlzcG9zZSgpO1xyXG4gICAgICAvLyB0aGlzLm5ldXRyb25QbHVzQnV0dG9uLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIC8vIGRpc3Bvc2UgbGlzdGVuZXJzIGF0dGFjaGVkIHRvIHByb3Rvbi9uZXV0cm9uIGNvdW50IFByb3BlcnRpZXNcclxuICAgICAgdGhpcy5uZXV0cm9uQ291bnRQcm9wZXJ0eS51bmxpbmsoIG5ldXRyb25Db3VudExpc3RlbmVyICk7XHJcbiAgICAgIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eS51bmxpbmsoIHByb3RvbkNvdW50TGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIC8vIGRpc3Bvc2UgbnVtYmVyIGNvbnRyb2xzXHJcbiAgICAgIHByb3Rvbk51bWJlckNvbnRyb2wuZGlzcG9zZSgpO1xyXG4gICAgICBuZXV0cm9uTnVtYmVyQ29udHJvbC5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBkaXNwb3NlIHRoZSBkZXJpdmVkIHByb3BlcnRpZXNcclxuICAgICAgcHJvdG9uUGFuZWxJbnRlcmFjdGlvblByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgICAgbmV1dHJvblBhbmVsSW50ZXJhY3Rpb25Qcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2UgZWxpZ2libGUgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUNvbnRlbnQoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnJ1dGhlcmZvcmRTY2F0dGVyaW5nLnJlZ2lzdGVyKCAnQXRvbVByb3BlcnRpZXNQYW5lbENvbnRlbnQnLCBBdG9tUHJvcGVydGllc1BhbmVsQ29udGVudCApO1xyXG5cclxucnV0aGVyZm9yZFNjYXR0ZXJpbmcucmVnaXN0ZXIoICdBdG9tUHJvcGVydGllc1BhbmVsJywgQXRvbVByb3BlcnRpZXNQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBBdG9tUHJvcGVydGllc1BhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFF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