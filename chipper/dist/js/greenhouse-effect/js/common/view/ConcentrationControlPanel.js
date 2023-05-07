// Copyright 2021-2023, University of Colorado Boulder

/**
 * Controls for the concentration of greenhouse gases in the sim. Concentration can be modified directly by value or
 * greenhouse gas concentration can be selected from a particular date.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Circle, Color, FlowBox, HBox, Line, Node, Path, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import calendarAltRegularShape from '../../../../sherpa/js/fontawesome-5/calendarAltRegularShape.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import VSlider from '../../../../sun/js/VSlider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
import GreenhouseEffectColors from '../GreenhouseEffectColors.js';
import GreenhouseEffectConstants from '../GreenhouseEffectConstants.js';
import ConcentrationModel, { ConcentrationControlMode, ConcentrationDate } from '../model/ConcentrationModel.js';
import ConcentrationSliderSoundGenerator from './ConcentrationSliderSoundGenerator.js';
import ConcentrationDescriber from './describers/ConcentrationDescriber.js';
// constants
const lotsStringProperty = GreenhouseEffectStrings.concentrationPanel.lotsStringProperty;
const noneStringProperty = GreenhouseEffectStrings.concentrationPanel.noneStringProperty;
const carbonDioxideConcentrationPatternStringProperty = GreenhouseEffectStrings.concentrationPanel.carbonDioxideConcentrationPatternStringProperty;
const methaneConcentrationPatternStringProperty = GreenhouseEffectStrings.concentrationPanel.methaneConcentrationPatternStringProperty;
const nitrousOxideConcentrationPatternStringProperty = GreenhouseEffectStrings.concentrationPanel.nitrousOxideConcentrationPatternStringProperty;

// Height in view coordinates of the concentration slider track (when controlling concentration by value) and the
// concentration meter graphic (when controlling by date). These are the same height so that the positions of values
// along the slider are at the same positions of values along the concentration meter.
const CONCENTRATION_SLIDER_TRACK_HEIGHT = 150;

// tick sizes for the concentration meter
const CONCENTRATION_METER_MACRO_BOX_WIDTH = 30;
const CONCENTRATION_METER_NUMBER_OF_MICRO_TICKS = 14;

// margins between content and panel borders
const PANEL_MARGINS = 5;

// spacing between contents within the panel
const CONTENT_SPACING = 10;

// for text labels for the slider and meter
const LABEL_OPTIONS = {
  font: GreenhouseEffectConstants.CONTENT_FONT,
  maxWidth: 60
};

// spacing between the slider and the labels at the top and bottom
const SLIDER_TRACK_TO_LABEL_SPACING = 10;

// line width for the slider thumb
const SLIDER_THUMB_LINE_WIDTH = 1;

// color of meters and controls in this panel
const CONCENTRATION_CONTROLS_STROKE = 'black';
const RADIO_BUTTON_GROUP_OPTIONS = {
  radioButtonOptions: {
    baseColor: GreenhouseEffectColors.controlPanelBackgroundColorProperty,
    buttonAppearanceStrategyOptions: {
      selectedStroke: GreenhouseEffectColors.radioButtonGroupSelectedStrokeColorProperty,
      selectedLineWidth: 2
    }
  }
};
class ConcentrationControlPanel extends Panel {
  /**
   * @param width - overall width of the panel
   * @param concentrationModel
   * @param radiationDescriber
   * @param [providedOptions]
   */
  constructor(width, concentrationModel, radiationDescriber, providedOptions) {
    const options = optionize()({
      minWidth: width,
      maxWidth: width,
      includeCompositionData: false,
      xMargin: PANEL_MARGINS,
      yMargin: PANEL_MARGINS,
      fill: GreenhouseEffectColors.controlPanelBackgroundColorProperty,
      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.titleStringProperty,
      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions);

    // title for the whole panel
    const titleText = new Text(GreenhouseEffectStrings.concentrationPanel.greenhouseGasConcentrationStringProperty, {
      font: GreenhouseEffectConstants.TITLE_FONT,
      maxWidth: width - PANEL_MARGINS * 2,
      tandem: options.tandem.createTandem('titleText')
    });

    // controls the concentration directly by value
    const concentrationSlider = new ConcentrationSlider(concentrationModel, radiationDescriber, options.tandem.createTandem('concentrationSlider'));

    // controls to select greenhouse gas concentration by date, and a meter displaying relative concentration
    const dateControl = new DateControl(concentrationModel.dateProperty, concentrationModel.concentrationProperty, concentrationModel.concentrationControlModeProperty, options.tandem.createTandem('dateControl'));

    // selects how the user is controlling concentration, by date or by value
    const controlRadioButtonGroup = new ConcentrationControlRadioButtonGroup(concentrationModel.concentrationControlModeProperty, options.tandem.createTandem('controlRadioButtonGroup'));

    // Put the two concentration controls into a single node where only one is visible at a time.
    const concentrationControlsParentNode = new FlowBox({
      children: [concentrationSlider, dateControl],
      minContentHeight: Math.max(concentrationSlider.height, dateControl.height)
    });
    const contentChildren = [titleText, concentrationControlsParentNode, controlRadioButtonGroup];
    let compositionDataNode = null;
    if (options.includeCompositionData) {
      compositionDataNode = new CompositionDataNode(concentrationModel.dateProperty, width);
      contentChildren.push(compositionDataNode);
    }
    const content = new VBox({
      children: contentChildren,
      spacing: CONTENT_SPACING,
      align: 'center'
    });
    super(content, options);

    // Only one form of controls is visible at a time.
    concentrationModel.concentrationControlModeProperty.link(concentrationControl => {
      concentrationSlider.visible = ConcentrationControlMode.BY_VALUE === concentrationControl;
      dateControl.visible = ConcentrationControlMode.BY_DATE === concentrationControl;
      if (compositionDataNode) {
        compositionDataNode.visible = dateControl.visible;
      }
    });
  }
}

/**
 * Inner class containing controls for selecting a concentration by date as well as a concentration meter showing
 * relative greenhouse gas concentration in time. The visualization has a "macro" line spanning from "none" to "lots"
 * of concentration and a "micro" line that is a zoomed in portion of the "macro". The "micro" line shows the
 * value of concentration relative to the range of values that can be selected by date.
 */
class DateControl extends HBox {
  /**
   * @param dateProperty
   * @param concentrationProperty - setting date will modify concentration
   * @param concentrationControlModeProperty - setting date will modify concentration
   * @param tandem
   */
  constructor(dateProperty, concentrationProperty, concentrationControlModeProperty, tandem) {
    // numeric date representations are not translatable, see https://github.com/phetsims/greenhouse-effect/issues/21
    const twentyTwentyLabel = '2020';
    const nineteenFiftyLabel = '1950';
    const seventeenFiftyLabel = '1750';
    const iceAgeLabel = GreenhouseEffectStrings.concentrationPanel.iceAgeStringProperty.value;

    // the radio buttons for the date control
    const items = [{
      createNode: () => new Text(twentyTwentyLabel, LABEL_OPTIONS),
      value: ConcentrationDate.TWENTY_TWENTY,
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.timePeriod.yearTwentyTwentyStringProperty,
      tandemName: 'twentyTwentyRadioButton'
    }, {
      createNode: () => new Text(nineteenFiftyLabel, LABEL_OPTIONS),
      value: ConcentrationDate.NINETEEN_FIFTY,
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.timePeriod.yearNineteenFiftyStringProperty,
      tandemName: 'nineteenFiftyRadioButton'
    }, {
      createNode: () => new Text(seventeenFiftyLabel, LABEL_OPTIONS),
      value: ConcentrationDate.SEVENTEEN_FIFTY,
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.timePeriod.yearSeventeenFiftyStringProperty,
      tandemName: 'seventeenFiftyRadioButton'
    }, {
      createNode: () => new Text(iceAgeLabel, LABEL_OPTIONS),
      value: ConcentrationDate.ICE_AGE,
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.timePeriod.iceAgeStringProperty,
      tandemName: 'iceAgeRadioButton'
    }];
    const dateRadioButtonGroup = new RectangularRadioButtonGroup(dateProperty, items, combineOptions({
      // pdom
      labelTagName: 'h4',
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.timePeriod.labelStringProperty,
      helpText: GreenhouseEffectStrings.a11y.concentrationPanel.timePeriod.helpTextStringProperty,
      // phet-io
      tandem: tandem.createTandem('dateRadioButtonGroup')
    }, RADIO_BUTTON_GROUP_OPTIONS));

    // relative concentration graphic
    const meterLineOptions = {
      stroke: CONCENTRATION_CONTROLS_STROKE,
      lineWidth: 2
    };
    const macroConcentrationLine = new Line(0, 0, 0, CONCENTRATION_SLIDER_TRACK_HEIGHT, meterLineOptions);
    const microConcentrationLine = new Line(0, 0, 0, CONCENTRATION_SLIDER_TRACK_HEIGHT, meterLineOptions);

    // Create the macroBox, which is the little rectangle that depicts the area that is being magnified.  This is sized
    // to automatically hold all possible concentration values associated with dates.
    const macroBoxProportionateHeight = ConcentrationModel.DATE_CONCENTRATION_RANGE.getLength() / ConcentrationModel.CONCENTRATION_RANGE.getLength() * 1.2;
    const macroBoxProportionateCenterY = ConcentrationModel.DATE_CONCENTRATION_RANGE.getCenter() / ConcentrationModel.CONCENTRATION_RANGE.getLength();
    const macroValueBox = new Rectangle(0, 0, CONCENTRATION_METER_MACRO_BOX_WIDTH, CONCENTRATION_SLIDER_TRACK_HEIGHT * macroBoxProportionateHeight, {
      stroke: CONCENTRATION_CONTROLS_STROKE
    });

    // minor ticks on the micro line
    const minorTickLineOptions = {
      stroke: 'grey'
    };
    for (let i = 0; i <= CONCENTRATION_METER_NUMBER_OF_MICRO_TICKS; i++) {
      const tick = new Line(0, 0, 9, 0, minorTickLineOptions);
      tick.center = microConcentrationLine.centerTop.plusXY(0, i * CONCENTRATION_SLIDER_TRACK_HEIGHT / CONCENTRATION_METER_NUMBER_OF_MICRO_TICKS);
      microConcentrationLine.addChild(tick);
    }

    // labels for the macro line
    const lotsText = new Text(lotsStringProperty, LABEL_OPTIONS);
    const noneText = new Text(noneStringProperty, LABEL_OPTIONS);

    // lines between macro and micro lines showing that the micro line is a zoomed in view of the macro line, end
    // points are set after layout
    const connectionLineOptions = {
      stroke: 'gray',
      lineDash: [5, 5]
    };
    const topConnectionLine = new Line(0, 0, 0, 0, connectionLineOptions);
    const bottomConnectionLine = new Line(0, 0, 0, 0, connectionLineOptions);
    const valueCircle = new Circle(5, {
      fill: 'black'
    });

    // Put the macro line in a VBox with the labels that go at the top and the bottom of it for easier alignment and
    // handling of dynamic strings.
    const labeledMacroLine = new VBox({
      children: [lotsText, macroConcentrationLine, noneText],
      spacing: SLIDER_TRACK_TO_LABEL_SPACING
    });

    // Put all the elements that comprise the concentration range graphic together into one node.
    const concentrationRangeGraphic = new Node({
      children: [macroValueBox, labeledMacroLine, microConcentrationLine, topConnectionLine, bottomConnectionLine, valueCircle]
    });

    // Lay out the graphic based on the position of the macro line.  This will do the initial layout and will update the
    // layout when the strings that label the macro line are updated.
    labeledMacroLine.boundsProperty.link(bounds => {
      // Position the box that indicates the blown up region.
      macroValueBox.center = bounds.center.plusXY(0, -CONCENTRATION_SLIDER_TRACK_HEIGHT * (macroBoxProportionateCenterY - 0.5));

      // Position the micro line, which represents the blown up region.
      microConcentrationLine.center = bounds.center.plusXY(70, 0);

      // Update the lines that go from the corners of the macro box to the blown up line.
      topConnectionLine.setPoint1(macroValueBox.rightTop);
      topConnectionLine.setPoint2(microConcentrationLine.centerTop);
      bottomConnectionLine.setPoint1(macroValueBox.rightBottom);
      bottomConnectionLine.setPoint2(microConcentrationLine.centerBottom);

      // Center the value indicator in the horizontal direction.
      valueCircle.center = microConcentrationLine.center;
    });

    // Update the vertical position of the concentration indicator when the concentration changes.
    const concentrationRangeLength = ConcentrationModel.CONCENTRATION_RANGE.getLength();
    const concentrationHeightFunction = new LinearFunction(concentrationRangeLength * (macroBoxProportionateCenterY - macroBoxProportionateHeight / 2), concentrationRangeLength * (macroBoxProportionateCenterY + macroBoxProportionateHeight / 2), microConcentrationLine.bottom, microConcentrationLine.top);
    Multilink.multilink([concentrationProperty, concentrationControlModeProperty], (concentration, concentrationControlMode) => {
      if (concentrationControlMode === ConcentrationControlMode.BY_DATE) {
        valueCircle.centerY = concentrationHeightFunction.evaluate(concentration);
      }
    });

    // Put the graphical zoom in representation and the radio buttons next to each other in an HBox.
    super({
      children: [concentrationRangeGraphic, dateRadioButtonGroup],
      spacing: CONTENT_SPACING
    });
  }
}

/**
 * Inner class representing a labeled VSlider that directly controls greenhouse gas concentration.
 */
class ConcentrationSlider extends VBox {
  constructor(concentrationModel, radiationDescriber, tandem) {
    const sliderRange = concentrationModel.manuallyControlledConcentrationProperty.range;
    const sliderSoundGenerator = new ConcentrationSliderSoundGenerator(concentrationModel.concentrationProperty, sliderRange);
    const slider = new VSlider(concentrationModel.manuallyControlledConcentrationProperty, sliderRange, {
      trackSize: new Dimension2(1, CONCENTRATION_SLIDER_TRACK_HEIGHT),
      thumbSize: GreenhouseEffectConstants.VERTICAL_SLIDER_THUMB_SIZE,
      thumbLineWidth: SLIDER_THUMB_LINE_WIDTH,
      // constrain the value a bit to avoid some oddities with floating point math
      constrainValue: n => Utils.toFixedNumber(n, 6),
      // sound generation
      soundGenerator: sliderSoundGenerator,
      // pdom
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.concentration.greenhouseGasConcentrationStringProperty,
      labelTagName: 'label',
      helpText: GreenhouseEffectStrings.a11y.concentrationPanel.concentration.concentrationSliderHelpTextStringProperty,
      keyboardStep: 0.05,
      shiftKeyboardStep: 0.01,
      // finer grain
      pageKeyboardStep: 0.2,
      // coarser grain,
      a11yCreateAriaValueText: value => {
        return ConcentrationDescriber.getConcentrationDescriptionWithValue(value, true, false);
      },
      // phet-io
      tandem: tandem.createTandem('slider')
    });
    slider.scale(-1, 1);

    // labels
    const lotsText = new Text(lotsStringProperty, LABEL_OPTIONS);
    const noneText = new Text(noneStringProperty, LABEL_OPTIONS);

    // Position the labels at the top and bottom such that they will be the same distance from the ends of the slider
    // track as they will be in the concentration range graphic.
    const sliderToLabelSpacing = SLIDER_TRACK_TO_LABEL_SPACING - GreenhouseEffectConstants.VERTICAL_SLIDER_THUMB_SIZE.height / 2 - SLIDER_THUMB_LINE_WIDTH;
    assert && assert(sliderToLabelSpacing >= 0, 'slider-to-label spacing less than zero, adjust constants to make this work');

    // Put the labels and the slider together into the VBox.
    super({
      children: [lotsText, slider, noneText],
      spacing: sliderToLabelSpacing,
      tandem: tandem
    });
  }
}
class CompositionDataNode extends VBox {
  constructor(dateProperty, panelWidth) {
    const textOptions = {
      font: GreenhouseEffectConstants.CONTENT_FONT,
      maxWidth: panelWidth - 2 * PANEL_MARGINS
    };

    // Set up the data and text that will be used for the concentration display.  Note that H2O is handled as a special
    // case in this code because it can have a null value, since we don't have data for it's value during the ice age.
    assert && assert(GREENHOUSE_GAS_CONCENTRATIONS.has(dateProperty.value), `no concentration data for ${dateProperty.value}`);
    const initialConcentrationData = GREENHOUSE_GAS_CONCENTRATIONS.get(dateProperty.value);
    const carbonDioxideConcentrationProperty = new NumberProperty(initialConcentrationData.carbonDioxideConcentration);
    const methaneConcentrationProperty = new NumberProperty(initialConcentrationData.methaneConcentration);
    const nitrousOxideConcentrationProperty = new NumberProperty(initialConcentrationData.nitrousOxideConcentration);
    dateProperty.link(date => {
      assert && assert(GREENHOUSE_GAS_CONCENTRATIONS.has(date), `no concentration data for ${date}`);
      const concentrationData = GREENHOUSE_GAS_CONCENTRATIONS.get(date);
      carbonDioxideConcentrationProperty.set(concentrationData.carbonDioxideConcentration);
      methaneConcentrationProperty.set(concentrationData.methaneConcentration);
      nitrousOxideConcentrationProperty.set(concentrationData.nitrousOxideConcentration);
    });
    const carbonDioxideTextProperty = new PatternStringProperty(carbonDioxideConcentrationPatternStringProperty, {
      value: carbonDioxideConcentrationProperty
    });
    const carbonDioxideText = new RichText(carbonDioxideTextProperty, textOptions);
    const methaneTextProperty = new PatternStringProperty(methaneConcentrationPatternStringProperty, {
      value: methaneConcentrationProperty
    });
    const methaneText = new RichText(methaneTextProperty, textOptions);
    const nitrousOxideTextProperty = new PatternStringProperty(nitrousOxideConcentrationPatternStringProperty, {
      value: nitrousOxideConcentrationProperty
    });
    const nitrousOxideText = new RichText(nitrousOxideTextProperty, textOptions);
    super({
      children: [carbonDioxideText, methaneText, nitrousOxideText],
      align: 'left'
    });
  }
}

/**
 * data-only class used for mapping the concentrations of various greenhouse gasses to points in time
 */
class GreenhouseGasConcentrationData {
  // relative humidity, in percent, null indicates "unknown"

  // concentration of CO2, in PPM

  // concentration of CH4, in PPB

  // concentration of N2O, in PPB

  /**
   * @param relativeHumidity - percentage
   * @param carbonDioxideConcentration - in ppm
   * @param methaneConcentration - in ppb
   * @param nitrousOxideConcentration - in ppb
   */
  constructor(relativeHumidity, carbonDioxideConcentration, methaneConcentration, nitrousOxideConcentration) {
    this.relativeHumidity = relativeHumidity;
    this.carbonDioxideConcentration = carbonDioxideConcentration;
    this.methaneConcentration = methaneConcentration;
    this.nitrousOxideConcentration = nitrousOxideConcentration;
  }
}

// Map the dates to greenhouse gas concentration data.  The values came from the design document.
const GREENHOUSE_GAS_CONCENTRATIONS = new Map([[ConcentrationDate.TWENTY_TWENTY, new GreenhouseGasConcentrationData(70, 413, 1889, 333)], [ConcentrationDate.NINETEEN_FIFTY, new GreenhouseGasConcentrationData(70, 311, 1116, 288)], [ConcentrationDate.SEVENTEEN_FIFTY, new GreenhouseGasConcentrationData(70, 277, 694, 271)], [ConcentrationDate.ICE_AGE, new GreenhouseGasConcentrationData(null, 180, 380, 215)]]);

/**
 * An inner class for the control panel that creates a RadioButtonGroup that selects between controlling concentration
 * by date or by value.
 */
class ConcentrationControlRadioButtonGroup extends RectangularRadioButtonGroup {
  /**
   * @param property - Property for the method of controlling concentration
   * @param tandem
   */
  constructor(property, tandem) {
    const dateIcon = new Path(calendarAltRegularShape, {
      fill: 'black'
    });

    // the CalendarAlt isn't square, scale it down and produce a square button
    dateIcon.setScaleMagnitude(34 / dateIcon.width, 34 / dateIcon.height);
    const dummyProperty = new NumberProperty(5, {
      range: new Range(0, 10)
    });
    const items = [{
      createNode: () => new VSlider(dummyProperty, dummyProperty.range, {
        trackSize: new Dimension2(2, dateIcon.height - 9),
        thumbSize: new Dimension2(18, 9),
        thumbFill: Color.LIGHT_GRAY,
        thumbCenterLineStroke: Color.DARK_GRAY,
        trackFillEnabled: 'black',
        pickable: false,
        // slider icon should not have representation in the PDOM, accessibility is managed by the checkbox
        tagName: null,
        // phet-io - opting out of the Tandem for the icon
        tandem: Tandem.OPT_OUT
      }),
      value: ConcentrationControlMode.BY_VALUE,
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.byConcentrationStringProperty,
      tandemName: 'byConcentrationRadioButton'
    }, {
      createNode: () => dateIcon,
      value: ConcentrationControlMode.BY_DATE,
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.byTimePeriodStringProperty,
      tandemName: 'byTimePeriodRadioButton'
    }];
    super(property, items, combineOptions({
      orientation: 'horizontal',
      // pdom
      labelTagName: 'h4',
      labelContent: GreenhouseEffectStrings.a11y.concentrationPanel.experimentModeStringProperty,
      helpText: GreenhouseEffectStrings.a11y.concentrationPanel.experimentModeHelpTextStringProperty,
      // phet-io
      tandem: tandem
    }, RADIO_BUTTON_GROUP_OPTIONS));
  }
}
greenhouseEffect.register('ConcentrationControlPanel', ConcentrationControlPanel);
export default ConcentrationControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlBhdHRlcm5TdHJpbmdQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJMaW5lYXJGdW5jdGlvbiIsIlJhbmdlIiwiVXRpbHMiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkNpcmNsZSIsIkNvbG9yIiwiRmxvd0JveCIsIkhCb3giLCJMaW5lIiwiTm9kZSIsIlBhdGgiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiY2FsZW5kYXJBbHRSZWd1bGFyU2hhcGUiLCJSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAiLCJQYW5lbCIsIlZTbGlkZXIiLCJUYW5kZW0iLCJncmVlbmhvdXNlRWZmZWN0IiwiR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MiLCJHcmVlbmhvdXNlRWZmZWN0Q29sb3JzIiwiR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cyIsIkNvbmNlbnRyYXRpb25Nb2RlbCIsIkNvbmNlbnRyYXRpb25Db250cm9sTW9kZSIsIkNvbmNlbnRyYXRpb25EYXRlIiwiQ29uY2VudHJhdGlvblNsaWRlclNvdW5kR2VuZXJhdG9yIiwiQ29uY2VudHJhdGlvbkRlc2NyaWJlciIsImxvdHNTdHJpbmdQcm9wZXJ0eSIsImNvbmNlbnRyYXRpb25QYW5lbCIsIm5vbmVTdHJpbmdQcm9wZXJ0eSIsImNhcmJvbkRpb3hpZGVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwibWV0aGFuZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkiLCJuaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5IiwiQ09OQ0VOVFJBVElPTl9TTElERVJfVFJBQ0tfSEVJR0hUIiwiQ09OQ0VOVFJBVElPTl9NRVRFUl9NQUNST19CT1hfV0lEVEgiLCJDT05DRU5UUkFUSU9OX01FVEVSX05VTUJFUl9PRl9NSUNST19USUNLUyIsIlBBTkVMX01BUkdJTlMiLCJDT05URU5UX1NQQUNJTkciLCJMQUJFTF9PUFRJT05TIiwiZm9udCIsIkNPTlRFTlRfRk9OVCIsIm1heFdpZHRoIiwiU0xJREVSX1RSQUNLX1RPX0xBQkVMX1NQQUNJTkciLCJTTElERVJfVEhVTUJfTElORV9XSURUSCIsIkNPTkNFTlRSQVRJT05fQ09OVFJPTFNfU1RST0tFIiwiUkFESU9fQlVUVE9OX0dST1VQX09QVElPTlMiLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJiYXNlQ29sb3IiLCJjb250cm9sUGFuZWxCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsImJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnMiLCJzZWxlY3RlZFN0cm9rZSIsInJhZGlvQnV0dG9uR3JvdXBTZWxlY3RlZFN0cm9rZUNvbG9yUHJvcGVydHkiLCJzZWxlY3RlZExpbmVXaWR0aCIsIkNvbmNlbnRyYXRpb25Db250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsIndpZHRoIiwiY29uY2VudHJhdGlvbk1vZGVsIiwicmFkaWF0aW9uRGVzY3JpYmVyIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsIm1pbldpZHRoIiwiaW5jbHVkZUNvbXBvc2l0aW9uRGF0YSIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZmlsbCIsInRhZ05hbWUiLCJsYWJlbFRhZ05hbWUiLCJsYWJlbENvbnRlbnQiLCJhMTF5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGl0bGVUZXh0IiwiZ3JlZW5ob3VzZUdhc0NvbmNlbnRyYXRpb25TdHJpbmdQcm9wZXJ0eSIsIlRJVExFX0ZPTlQiLCJjcmVhdGVUYW5kZW0iLCJjb25jZW50cmF0aW9uU2xpZGVyIiwiQ29uY2VudHJhdGlvblNsaWRlciIsImRhdGVDb250cm9sIiwiRGF0ZUNvbnRyb2wiLCJkYXRlUHJvcGVydHkiLCJjb25jZW50cmF0aW9uUHJvcGVydHkiLCJjb25jZW50cmF0aW9uQ29udHJvbE1vZGVQcm9wZXJ0eSIsImNvbnRyb2xSYWRpb0J1dHRvbkdyb3VwIiwiQ29uY2VudHJhdGlvbkNvbnRyb2xSYWRpb0J1dHRvbkdyb3VwIiwiY29uY2VudHJhdGlvbkNvbnRyb2xzUGFyZW50Tm9kZSIsImNoaWxkcmVuIiwibWluQ29udGVudEhlaWdodCIsIk1hdGgiLCJtYXgiLCJoZWlnaHQiLCJjb250ZW50Q2hpbGRyZW4iLCJjb21wb3NpdGlvbkRhdGFOb2RlIiwiQ29tcG9zaXRpb25EYXRhTm9kZSIsInB1c2giLCJjb250ZW50Iiwic3BhY2luZyIsImFsaWduIiwibGluayIsImNvbmNlbnRyYXRpb25Db250cm9sIiwidmlzaWJsZSIsIkJZX1ZBTFVFIiwiQllfREFURSIsInR3ZW50eVR3ZW50eUxhYmVsIiwibmluZXRlZW5GaWZ0eUxhYmVsIiwic2V2ZW50ZWVuRmlmdHlMYWJlbCIsImljZUFnZUxhYmVsIiwiaWNlQWdlU3RyaW5nUHJvcGVydHkiLCJ2YWx1ZSIsIml0ZW1zIiwiY3JlYXRlTm9kZSIsIlRXRU5UWV9UV0VOVFkiLCJ0aW1lUGVyaW9kIiwieWVhclR3ZW50eVR3ZW50eVN0cmluZ1Byb3BlcnR5IiwidGFuZGVtTmFtZSIsIk5JTkVURUVOX0ZJRlRZIiwieWVhck5pbmV0ZWVuRmlmdHlTdHJpbmdQcm9wZXJ0eSIsIlNFVkVOVEVFTl9GSUZUWSIsInllYXJTZXZlbnRlZW5GaWZ0eVN0cmluZ1Byb3BlcnR5IiwiSUNFX0FHRSIsImRhdGVSYWRpb0J1dHRvbkdyb3VwIiwibGFiZWxTdHJpbmdQcm9wZXJ0eSIsImhlbHBUZXh0IiwiaGVscFRleHRTdHJpbmdQcm9wZXJ0eSIsIm1ldGVyTGluZU9wdGlvbnMiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJtYWNyb0NvbmNlbnRyYXRpb25MaW5lIiwibWljcm9Db25jZW50cmF0aW9uTGluZSIsIm1hY3JvQm94UHJvcG9ydGlvbmF0ZUhlaWdodCIsIkRBVEVfQ09OQ0VOVFJBVElPTl9SQU5HRSIsImdldExlbmd0aCIsIkNPTkNFTlRSQVRJT05fUkFOR0UiLCJtYWNyb0JveFByb3BvcnRpb25hdGVDZW50ZXJZIiwiZ2V0Q2VudGVyIiwibWFjcm9WYWx1ZUJveCIsIm1pbm9yVGlja0xpbmVPcHRpb25zIiwiaSIsInRpY2siLCJjZW50ZXIiLCJjZW50ZXJUb3AiLCJwbHVzWFkiLCJhZGRDaGlsZCIsImxvdHNUZXh0Iiwibm9uZVRleHQiLCJjb25uZWN0aW9uTGluZU9wdGlvbnMiLCJsaW5lRGFzaCIsInRvcENvbm5lY3Rpb25MaW5lIiwiYm90dG9tQ29ubmVjdGlvbkxpbmUiLCJ2YWx1ZUNpcmNsZSIsImxhYmVsZWRNYWNyb0xpbmUiLCJjb25jZW50cmF0aW9uUmFuZ2VHcmFwaGljIiwiYm91bmRzUHJvcGVydHkiLCJib3VuZHMiLCJzZXRQb2ludDEiLCJyaWdodFRvcCIsInNldFBvaW50MiIsInJpZ2h0Qm90dG9tIiwiY2VudGVyQm90dG9tIiwiY29uY2VudHJhdGlvblJhbmdlTGVuZ3RoIiwiY29uY2VudHJhdGlvbkhlaWdodEZ1bmN0aW9uIiwiYm90dG9tIiwidG9wIiwibXVsdGlsaW5rIiwiY29uY2VudHJhdGlvbiIsImNvbmNlbnRyYXRpb25Db250cm9sTW9kZSIsImNlbnRlclkiLCJldmFsdWF0ZSIsInNsaWRlclJhbmdlIiwibWFudWFsbHlDb250cm9sbGVkQ29uY2VudHJhdGlvblByb3BlcnR5IiwicmFuZ2UiLCJzbGlkZXJTb3VuZEdlbmVyYXRvciIsInNsaWRlciIsInRyYWNrU2l6ZSIsInRodW1iU2l6ZSIsIlZFUlRJQ0FMX1NMSURFUl9USFVNQl9TSVpFIiwidGh1bWJMaW5lV2lkdGgiLCJjb25zdHJhaW5WYWx1ZSIsIm4iLCJ0b0ZpeGVkTnVtYmVyIiwic291bmRHZW5lcmF0b3IiLCJjb25jZW50cmF0aW9uU2xpZGVySGVscFRleHRTdHJpbmdQcm9wZXJ0eSIsImtleWJvYXJkU3RlcCIsInNoaWZ0S2V5Ym9hcmRTdGVwIiwicGFnZUtleWJvYXJkU3RlcCIsImExMXlDcmVhdGVBcmlhVmFsdWVUZXh0IiwiZ2V0Q29uY2VudHJhdGlvbkRlc2NyaXB0aW9uV2l0aFZhbHVlIiwic2NhbGUiLCJzbGlkZXJUb0xhYmVsU3BhY2luZyIsImFzc2VydCIsInBhbmVsV2lkdGgiLCJ0ZXh0T3B0aW9ucyIsIkdSRUVOSE9VU0VfR0FTX0NPTkNFTlRSQVRJT05TIiwiaGFzIiwiaW5pdGlhbENvbmNlbnRyYXRpb25EYXRhIiwiZ2V0IiwiY2FyYm9uRGlveGlkZUNvbmNlbnRyYXRpb25Qcm9wZXJ0eSIsImNhcmJvbkRpb3hpZGVDb25jZW50cmF0aW9uIiwibWV0aGFuZUNvbmNlbnRyYXRpb25Qcm9wZXJ0eSIsIm1ldGhhbmVDb25jZW50cmF0aW9uIiwibml0cm91c094aWRlQ29uY2VudHJhdGlvblByb3BlcnR5Iiwibml0cm91c094aWRlQ29uY2VudHJhdGlvbiIsImRhdGUiLCJjb25jZW50cmF0aW9uRGF0YSIsInNldCIsImNhcmJvbkRpb3hpZGVUZXh0UHJvcGVydHkiLCJjYXJib25EaW94aWRlVGV4dCIsIm1ldGhhbmVUZXh0UHJvcGVydHkiLCJtZXRoYW5lVGV4dCIsIm5pdHJvdXNPeGlkZVRleHRQcm9wZXJ0eSIsIm5pdHJvdXNPeGlkZVRleHQiLCJHcmVlbmhvdXNlR2FzQ29uY2VudHJhdGlvbkRhdGEiLCJyZWxhdGl2ZUh1bWlkaXR5IiwiTWFwIiwicHJvcGVydHkiLCJkYXRlSWNvbiIsInNldFNjYWxlTWFnbml0dWRlIiwiZHVtbXlQcm9wZXJ0eSIsInRodW1iRmlsbCIsIkxJR0hUX0dSQVkiLCJ0aHVtYkNlbnRlckxpbmVTdHJva2UiLCJEQVJLX0dSQVkiLCJ0cmFja0ZpbGxFbmFibGVkIiwicGlja2FibGUiLCJPUFRfT1VUIiwiYnlDb25jZW50cmF0aW9uU3RyaW5nUHJvcGVydHkiLCJieVRpbWVQZXJpb2RTdHJpbmdQcm9wZXJ0eSIsIm9yaWVudGF0aW9uIiwiZXhwZXJpbWVudE1vZGVTdHJpbmdQcm9wZXJ0eSIsImV4cGVyaW1lbnRNb2RlSGVscFRleHRTdHJpbmdQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29uY2VudHJhdGlvbkNvbnRyb2xQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9scyBmb3IgdGhlIGNvbmNlbnRyYXRpb24gb2YgZ3JlZW5ob3VzZSBnYXNlcyBpbiB0aGUgc2ltLiBDb25jZW50cmF0aW9uIGNhbiBiZSBtb2RpZmllZCBkaXJlY3RseSBieSB2YWx1ZSBvclxyXG4gKiBncmVlbmhvdXNlIGdhcyBjb25jZW50cmF0aW9uIGNhbiBiZSBzZWxlY3RlZCBmcm9tIGEgcGFydGljdWxhciBkYXRlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGF0dGVyblN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUGF0dGVyblN0cmluZ1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBMaW5lYXJGdW5jdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvTGluZWFyRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgQ2lyY2xlLCBDb2xvciwgRmxvd0JveCwgSEJveCwgTGluZSwgTm9kZSwgUGF0aCwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjYWxlbmRhckFsdFJlZ3VsYXJTaGFwZSBmcm9tICcuLi8uLi8uLi8uLi9zaGVycGEvanMvZm9udGF3ZXNvbWUtNS9jYWxlbmRhckFsdFJlZ3VsYXJTaGFwZS5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAsIHsgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBQYW5lbCwgeyBQYW5lbE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgVlNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvVlNsaWRlci5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdENvbG9ycyBmcm9tICcuLi9HcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmpzJztcclxuaW1wb3J0IEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMgZnJvbSAnLi4vR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDb25jZW50cmF0aW9uTW9kZWwsIHsgQ29uY2VudHJhdGlvbkNvbnRyb2xNb2RlLCBDb25jZW50cmF0aW9uRGF0ZSB9IGZyb20gJy4uL21vZGVsL0NvbmNlbnRyYXRpb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBDb25jZW50cmF0aW9uU2xpZGVyU291bmRHZW5lcmF0b3IgZnJvbSAnLi9Db25jZW50cmF0aW9uU2xpZGVyU291bmRHZW5lcmF0b3IuanMnO1xyXG5pbXBvcnQgQ29uY2VudHJhdGlvbkRlc2NyaWJlciBmcm9tICcuL2Rlc2NyaWJlcnMvQ29uY2VudHJhdGlvbkRlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBSYWRpYXRpb25EZXNjcmliZXIgZnJvbSAnLi9kZXNjcmliZXJzL1JhZGlhdGlvbkRlc2NyaWJlci5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgbG90c1N0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuY29uY2VudHJhdGlvblBhbmVsLmxvdHNTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgbm9uZVN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuY29uY2VudHJhdGlvblBhbmVsLm5vbmVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3QgY2FyYm9uRGlveGlkZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5jb25jZW50cmF0aW9uUGFuZWwuY2FyYm9uRGlveGlkZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IG1ldGhhbmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuY29uY2VudHJhdGlvblBhbmVsLm1ldGhhbmVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBuaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuY29uY2VudHJhdGlvblBhbmVsLm5pdHJvdXNPeGlkZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHk7XHJcblxyXG4vLyBIZWlnaHQgaW4gdmlldyBjb29yZGluYXRlcyBvZiB0aGUgY29uY2VudHJhdGlvbiBzbGlkZXIgdHJhY2sgKHdoZW4gY29udHJvbGxpbmcgY29uY2VudHJhdGlvbiBieSB2YWx1ZSkgYW5kIHRoZVxyXG4vLyBjb25jZW50cmF0aW9uIG1ldGVyIGdyYXBoaWMgKHdoZW4gY29udHJvbGxpbmcgYnkgZGF0ZSkuIFRoZXNlIGFyZSB0aGUgc2FtZSBoZWlnaHQgc28gdGhhdCB0aGUgcG9zaXRpb25zIG9mIHZhbHVlc1xyXG4vLyBhbG9uZyB0aGUgc2xpZGVyIGFyZSBhdCB0aGUgc2FtZSBwb3NpdGlvbnMgb2YgdmFsdWVzIGFsb25nIHRoZSBjb25jZW50cmF0aW9uIG1ldGVyLlxyXG5jb25zdCBDT05DRU5UUkFUSU9OX1NMSURFUl9UUkFDS19IRUlHSFQgPSAxNTA7XHJcblxyXG4vLyB0aWNrIHNpemVzIGZvciB0aGUgY29uY2VudHJhdGlvbiBtZXRlclxyXG5jb25zdCBDT05DRU5UUkFUSU9OX01FVEVSX01BQ1JPX0JPWF9XSURUSCA9IDMwO1xyXG5jb25zdCBDT05DRU5UUkFUSU9OX01FVEVSX05VTUJFUl9PRl9NSUNST19USUNLUyA9IDE0O1xyXG5cclxuLy8gbWFyZ2lucyBiZXR3ZWVuIGNvbnRlbnQgYW5kIHBhbmVsIGJvcmRlcnNcclxuY29uc3QgUEFORUxfTUFSR0lOUyA9IDU7XHJcblxyXG4vLyBzcGFjaW5nIGJldHdlZW4gY29udGVudHMgd2l0aGluIHRoZSBwYW5lbFxyXG5jb25zdCBDT05URU5UX1NQQUNJTkcgPSAxMDtcclxuXHJcbi8vIGZvciB0ZXh0IGxhYmVscyBmb3IgdGhlIHNsaWRlciBhbmQgbWV0ZXJcclxuY29uc3QgTEFCRUxfT1BUSU9OUyA9IHsgZm9udDogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5DT05URU5UX0ZPTlQsIG1heFdpZHRoOiA2MCB9O1xyXG5cclxuLy8gc3BhY2luZyBiZXR3ZWVuIHRoZSBzbGlkZXIgYW5kIHRoZSBsYWJlbHMgYXQgdGhlIHRvcCBhbmQgYm90dG9tXHJcbmNvbnN0IFNMSURFUl9UUkFDS19UT19MQUJFTF9TUEFDSU5HID0gMTA7XHJcblxyXG4vLyBsaW5lIHdpZHRoIGZvciB0aGUgc2xpZGVyIHRodW1iXHJcbmNvbnN0IFNMSURFUl9USFVNQl9MSU5FX1dJRFRIID0gMTtcclxuXHJcbi8vIGNvbG9yIG9mIG1ldGVycyBhbmQgY29udHJvbHMgaW4gdGhpcyBwYW5lbFxyXG5jb25zdCBDT05DRU5UUkFUSU9OX0NPTlRST0xTX1NUUk9LRSA9ICdibGFjayc7XHJcblxyXG5jb25zdCBSQURJT19CVVRUT05fR1JPVVBfT1BUSU9OUyA9IHtcclxuICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgIGJhc2VDb2xvcjogR3JlZW5ob3VzZUVmZmVjdENvbG9ycy5jb250cm9sUGFuZWxCYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSxcclxuICAgIGJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneU9wdGlvbnM6IHtcclxuICAgICAgc2VsZWN0ZWRTdHJva2U6IEdyZWVuaG91c2VFZmZlY3RDb2xvcnMucmFkaW9CdXR0b25Hcm91cFNlbGVjdGVkU3Ryb2tlQ29sb3JQcm9wZXJ0eSxcclxuICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDJcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG5cclxuICAvLyBJZiB0cnVlLCB0aGUgcGFuZWwgd2lsbCBpbmNsdWRlIGEgcmVhZG91dCBvZiB0aGUgY29tcG9zaXRpb24gb2YgZ3JlZW5ob3VzZSBnYXNlcyB3aGVuIHNlbGVjdGluZyBjb25jZW50cmF0aW9ucyBieVxyXG4gIC8vIGRhdGUuXHJcbiAgaW5jbHVkZUNvbXBvc2l0aW9uRGF0YT86IGJvb2xlYW47XHJcbn07XHJcbnR5cGUgQ29uY2VudHJhdGlvbkNvbnRyb2xQYW5lbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBhbmVsT3B0aW9ucztcclxuXHJcbmNsYXNzIENvbmNlbnRyYXRpb25Db250cm9sUGFuZWwgZXh0ZW5kcyBQYW5lbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB3aWR0aCAtIG92ZXJhbGwgd2lkdGggb2YgdGhlIHBhbmVsXHJcbiAgICogQHBhcmFtIGNvbmNlbnRyYXRpb25Nb2RlbFxyXG4gICAqIEBwYXJhbSByYWRpYXRpb25EZXNjcmliZXJcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBjb25jZW50cmF0aW9uTW9kZWw6IENvbmNlbnRyYXRpb25Nb2RlbCxcclxuICAgICAgICAgICAgICAgICAgICAgIHJhZGlhdGlvbkRlc2NyaWJlcjogUmFkaWF0aW9uRGVzY3JpYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zPzogQ29uY2VudHJhdGlvbkNvbnRyb2xQYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxDb25jZW50cmF0aW9uQ29udHJvbFBhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBhbmVsT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgbWluV2lkdGg6IHdpZHRoLFxyXG4gICAgICBtYXhXaWR0aDogd2lkdGgsXHJcbiAgICAgIGluY2x1ZGVDb21wb3NpdGlvbkRhdGE6IGZhbHNlLFxyXG4gICAgICB4TWFyZ2luOiBQQU5FTF9NQVJHSU5TLFxyXG4gICAgICB5TWFyZ2luOiBQQU5FTF9NQVJHSU5TLFxyXG4gICAgICBmaWxsOiBHcmVlbmhvdXNlRWZmZWN0Q29sb3JzLmNvbnRyb2xQYW5lbEJhY2tncm91bmRDb2xvclByb3BlcnR5LFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyxcclxuICAgICAgbGFiZWxUYWdOYW1lOiAnaDMnLFxyXG4gICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLnRpdGxlU3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyB0aXRsZSBmb3IgdGhlIHdob2xlIHBhbmVsXHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuY29uY2VudHJhdGlvblBhbmVsLmdyZWVuaG91c2VHYXNDb25jZW50cmF0aW9uU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgZm9udDogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5USVRMRV9GT05ULFxyXG4gICAgICBtYXhXaWR0aDogd2lkdGggLSBQQU5FTF9NQVJHSU5TICogMixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aXRsZVRleHQnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjb250cm9scyB0aGUgY29uY2VudHJhdGlvbiBkaXJlY3RseSBieSB2YWx1ZVxyXG4gICAgY29uc3QgY29uY2VudHJhdGlvblNsaWRlciA9IG5ldyBDb25jZW50cmF0aW9uU2xpZGVyKFxyXG4gICAgICBjb25jZW50cmF0aW9uTW9kZWwsXHJcbiAgICAgIHJhZGlhdGlvbkRlc2NyaWJlcixcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uY2VudHJhdGlvblNsaWRlcicgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBjb250cm9scyB0byBzZWxlY3QgZ3JlZW5ob3VzZSBnYXMgY29uY2VudHJhdGlvbiBieSBkYXRlLCBhbmQgYSBtZXRlciBkaXNwbGF5aW5nIHJlbGF0aXZlIGNvbmNlbnRyYXRpb25cclxuICAgIGNvbnN0IGRhdGVDb250cm9sID0gbmV3IERhdGVDb250cm9sKFxyXG4gICAgICBjb25jZW50cmF0aW9uTW9kZWwuZGF0ZVByb3BlcnR5LFxyXG4gICAgICBjb25jZW50cmF0aW9uTW9kZWwuY29uY2VudHJhdGlvblByb3BlcnR5LFxyXG4gICAgICBjb25jZW50cmF0aW9uTW9kZWwuY29uY2VudHJhdGlvbkNvbnRyb2xNb2RlUHJvcGVydHksXHJcbiAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RhdGVDb250cm9sJyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHNlbGVjdHMgaG93IHRoZSB1c2VyIGlzIGNvbnRyb2xsaW5nIGNvbmNlbnRyYXRpb24sIGJ5IGRhdGUgb3IgYnkgdmFsdWVcclxuICAgIGNvbnN0IGNvbnRyb2xSYWRpb0J1dHRvbkdyb3VwID0gbmV3IENvbmNlbnRyYXRpb25Db250cm9sUmFkaW9CdXR0b25Hcm91cChcclxuICAgICAgY29uY2VudHJhdGlvbk1vZGVsLmNvbmNlbnRyYXRpb25Db250cm9sTW9kZVByb3BlcnR5LFxyXG4gICAgICBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUmFkaW9CdXR0b25Hcm91cCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIHR3byBjb25jZW50cmF0aW9uIGNvbnRyb2xzIGludG8gYSBzaW5nbGUgbm9kZSB3aGVyZSBvbmx5IG9uZSBpcyB2aXNpYmxlIGF0IGEgdGltZS5cclxuICAgIGNvbnN0IGNvbmNlbnRyYXRpb25Db250cm9sc1BhcmVudE5vZGUgPSBuZXcgRmxvd0JveCgge1xyXG4gICAgICBjaGlsZHJlbjogWyBjb25jZW50cmF0aW9uU2xpZGVyLCBkYXRlQ29udHJvbCBdLFxyXG4gICAgICBtaW5Db250ZW50SGVpZ2h0OiBNYXRoLm1heCggY29uY2VudHJhdGlvblNsaWRlci5oZWlnaHQsIGRhdGVDb250cm9sLmhlaWdodCApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY29udGVudENoaWxkcmVuID0gWyB0aXRsZVRleHQsIGNvbmNlbnRyYXRpb25Db250cm9sc1BhcmVudE5vZGUsIGNvbnRyb2xSYWRpb0J1dHRvbkdyb3VwIF07XHJcblxyXG4gICAgbGV0IGNvbXBvc2l0aW9uRGF0YU5vZGU6IENvbXBvc2l0aW9uRGF0YU5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIGlmICggb3B0aW9ucy5pbmNsdWRlQ29tcG9zaXRpb25EYXRhICkge1xyXG4gICAgICBjb21wb3NpdGlvbkRhdGFOb2RlID0gbmV3IENvbXBvc2l0aW9uRGF0YU5vZGUoIGNvbmNlbnRyYXRpb25Nb2RlbC5kYXRlUHJvcGVydHksIHdpZHRoICk7XHJcbiAgICAgIGNvbnRlbnRDaGlsZHJlbi5wdXNoKCBjb21wb3NpdGlvbkRhdGFOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29udGVudCA9IG5ldyBWQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBjb250ZW50Q2hpbGRyZW4sXHJcbiAgICAgIHNwYWNpbmc6IENPTlRFTlRfU1BBQ0lORyxcclxuICAgICAgYWxpZ246ICdjZW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBPbmx5IG9uZSBmb3JtIG9mIGNvbnRyb2xzIGlzIHZpc2libGUgYXQgYSB0aW1lLlxyXG4gICAgY29uY2VudHJhdGlvbk1vZGVsLmNvbmNlbnRyYXRpb25Db250cm9sTW9kZVByb3BlcnR5LmxpbmsoIGNvbmNlbnRyYXRpb25Db250cm9sID0+IHtcclxuICAgICAgY29uY2VudHJhdGlvblNsaWRlci52aXNpYmxlID0gQ29uY2VudHJhdGlvbkNvbnRyb2xNb2RlLkJZX1ZBTFVFID09PSBjb25jZW50cmF0aW9uQ29udHJvbDtcclxuICAgICAgZGF0ZUNvbnRyb2wudmlzaWJsZSA9IENvbmNlbnRyYXRpb25Db250cm9sTW9kZS5CWV9EQVRFID09PSBjb25jZW50cmF0aW9uQ29udHJvbDtcclxuXHJcbiAgICAgIGlmICggY29tcG9zaXRpb25EYXRhTm9kZSApIHtcclxuICAgICAgICBjb21wb3NpdGlvbkRhdGFOb2RlLnZpc2libGUgPSBkYXRlQ29udHJvbC52aXNpYmxlO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSW5uZXIgY2xhc3MgY29udGFpbmluZyBjb250cm9scyBmb3Igc2VsZWN0aW5nIGEgY29uY2VudHJhdGlvbiBieSBkYXRlIGFzIHdlbGwgYXMgYSBjb25jZW50cmF0aW9uIG1ldGVyIHNob3dpbmdcclxuICogcmVsYXRpdmUgZ3JlZW5ob3VzZSBnYXMgY29uY2VudHJhdGlvbiBpbiB0aW1lLiBUaGUgdmlzdWFsaXphdGlvbiBoYXMgYSBcIm1hY3JvXCIgbGluZSBzcGFubmluZyBmcm9tIFwibm9uZVwiIHRvIFwibG90c1wiXHJcbiAqIG9mIGNvbmNlbnRyYXRpb24gYW5kIGEgXCJtaWNyb1wiIGxpbmUgdGhhdCBpcyBhIHpvb21lZCBpbiBwb3J0aW9uIG9mIHRoZSBcIm1hY3JvXCIuIFRoZSBcIm1pY3JvXCIgbGluZSBzaG93cyB0aGVcclxuICogdmFsdWUgb2YgY29uY2VudHJhdGlvbiByZWxhdGl2ZSB0byB0aGUgcmFuZ2Ugb2YgdmFsdWVzIHRoYXQgY2FuIGJlIHNlbGVjdGVkIGJ5IGRhdGUuXHJcbiAqL1xyXG5jbGFzcyBEYXRlQ29udHJvbCBleHRlbmRzIEhCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZGF0ZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIGNvbmNlbnRyYXRpb25Qcm9wZXJ0eSAtIHNldHRpbmcgZGF0ZSB3aWxsIG1vZGlmeSBjb25jZW50cmF0aW9uXHJcbiAgICogQHBhcmFtIGNvbmNlbnRyYXRpb25Db250cm9sTW9kZVByb3BlcnR5IC0gc2V0dGluZyBkYXRlIHdpbGwgbW9kaWZ5IGNvbmNlbnRyYXRpb25cclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYXRlUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8Q29uY2VudHJhdGlvbkRhdGU+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29uY2VudHJhdGlvblByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgY29uY2VudHJhdGlvbkNvbnRyb2xNb2RlUHJvcGVydHk6IEVudW1lcmF0aW9uUHJvcGVydHk8Q29uY2VudHJhdGlvbkNvbnRyb2xNb2RlPixcclxuICAgICAgICAgICAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIC8vIG51bWVyaWMgZGF0ZSByZXByZXNlbnRhdGlvbnMgYXJlIG5vdCB0cmFuc2xhdGFibGUsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3JlZW5ob3VzZS1lZmZlY3QvaXNzdWVzLzIxXHJcbiAgICBjb25zdCB0d2VudHlUd2VudHlMYWJlbCA9ICcyMDIwJztcclxuICAgIGNvbnN0IG5pbmV0ZWVuRmlmdHlMYWJlbCA9ICcxOTUwJztcclxuICAgIGNvbnN0IHNldmVudGVlbkZpZnR5TGFiZWwgPSAnMTc1MCc7XHJcbiAgICBjb25zdCBpY2VBZ2VMYWJlbCA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmNvbmNlbnRyYXRpb25QYW5lbC5pY2VBZ2VTdHJpbmdQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAvLyB0aGUgcmFkaW8gYnV0dG9ucyBmb3IgdGhlIGRhdGUgY29udHJvbFxyXG4gICAgY29uc3QgaXRlbXMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggdHdlbnR5VHdlbnR5TGFiZWwsIExBQkVMX09QVElPTlMgKSxcclxuICAgICAgICB2YWx1ZTogQ29uY2VudHJhdGlvbkRhdGUuVFdFTlRZX1RXRU5UWSxcclxuICAgICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLnRpbWVQZXJpb2QueWVhclR3ZW50eVR3ZW50eVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbU5hbWU6ICd0d2VudHlUd2VudHlSYWRpb0J1dHRvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBuaW5ldGVlbkZpZnR5TGFiZWwsIExBQkVMX09QVElPTlMgKSxcclxuICAgICAgICB2YWx1ZTogQ29uY2VudHJhdGlvbkRhdGUuTklORVRFRU5fRklGVFksXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmNvbmNlbnRyYXRpb25QYW5lbC50aW1lUGVyaW9kLnllYXJOaW5ldGVlbkZpZnR5U3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ25pbmV0ZWVuRmlmdHlSYWRpb0J1dHRvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IG5ldyBUZXh0KCBzZXZlbnRlZW5GaWZ0eUxhYmVsLCBMQUJFTF9PUFRJT05TICksXHJcbiAgICAgICAgdmFsdWU6IENvbmNlbnRyYXRpb25EYXRlLlNFVkVOVEVFTl9GSUZUWSxcclxuICAgICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLnRpbWVQZXJpb2QueWVhclNldmVudGVlbkZpZnR5U3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ3NldmVudGVlbkZpZnR5UmFkaW9CdXR0b24nXHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVGV4dCggaWNlQWdlTGFiZWwsIExBQkVMX09QVElPTlMgKSxcclxuICAgICAgICB2YWx1ZTogQ29uY2VudHJhdGlvbkRhdGUuSUNFX0FHRSxcclxuICAgICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLnRpbWVQZXJpb2QuaWNlQWdlU3RyaW5nUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtTmFtZTogJ2ljZUFnZVJhZGlvQnV0dG9uJ1xyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgY29uc3QgZGF0ZVJhZGlvQnV0dG9uR3JvdXAgPSBuZXcgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwKFxyXG4gICAgICBkYXRlUHJvcGVydHksXHJcbiAgICAgIGl0ZW1zLFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBPcHRpb25zPigge1xyXG5cclxuICAgICAgICAvLyBwZG9tXHJcbiAgICAgICAgbGFiZWxUYWdOYW1lOiAnaDQnLFxyXG4gICAgICAgIGxhYmVsQ29udGVudDogR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5jb25jZW50cmF0aW9uUGFuZWwudGltZVBlcmlvZC5sYWJlbFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIGhlbHBUZXh0OiBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmNvbmNlbnRyYXRpb25QYW5lbC50aW1lUGVyaW9kLmhlbHBUZXh0U3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdkYXRlUmFkaW9CdXR0b25Hcm91cCcgKVxyXG4gICAgICB9LCBSQURJT19CVVRUT05fR1JPVVBfT1BUSU9OUyApXHJcbiAgICApO1xyXG5cclxuICAgIC8vIHJlbGF0aXZlIGNvbmNlbnRyYXRpb24gZ3JhcGhpY1xyXG4gICAgY29uc3QgbWV0ZXJMaW5lT3B0aW9ucyA9IHsgc3Ryb2tlOiBDT05DRU5UUkFUSU9OX0NPTlRST0xTX1NUUk9LRSwgbGluZVdpZHRoOiAyIH07XHJcbiAgICBjb25zdCBtYWNyb0NvbmNlbnRyYXRpb25MaW5lID0gbmV3IExpbmUoIDAsIDAsIDAsIENPTkNFTlRSQVRJT05fU0xJREVSX1RSQUNLX0hFSUdIVCwgbWV0ZXJMaW5lT3B0aW9ucyApO1xyXG4gICAgY29uc3QgbWljcm9Db25jZW50cmF0aW9uTGluZSA9IG5ldyBMaW5lKCAwLCAwLCAwLCBDT05DRU5UUkFUSU9OX1NMSURFUl9UUkFDS19IRUlHSFQsIG1ldGVyTGluZU9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIG1hY3JvQm94LCB3aGljaCBpcyB0aGUgbGl0dGxlIHJlY3RhbmdsZSB0aGF0IGRlcGljdHMgdGhlIGFyZWEgdGhhdCBpcyBiZWluZyBtYWduaWZpZWQuICBUaGlzIGlzIHNpemVkXHJcbiAgICAvLyB0byBhdXRvbWF0aWNhbGx5IGhvbGQgYWxsIHBvc3NpYmxlIGNvbmNlbnRyYXRpb24gdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBkYXRlcy5cclxuICAgIGNvbnN0IG1hY3JvQm94UHJvcG9ydGlvbmF0ZUhlaWdodCA9IENvbmNlbnRyYXRpb25Nb2RlbC5EQVRFX0NPTkNFTlRSQVRJT05fUkFOR0UuZ2V0TGVuZ3RoKCkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29uY2VudHJhdGlvbk1vZGVsLkNPTkNFTlRSQVRJT05fUkFOR0UuZ2V0TGVuZ3RoKCkgKlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMS4yO1xyXG4gICAgY29uc3QgbWFjcm9Cb3hQcm9wb3J0aW9uYXRlQ2VudGVyWSA9IENvbmNlbnRyYXRpb25Nb2RlbC5EQVRFX0NPTkNFTlRSQVRJT05fUkFOR0UuZ2V0Q2VudGVyKCkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbmNlbnRyYXRpb25Nb2RlbC5DT05DRU5UUkFUSU9OX1JBTkdFLmdldExlbmd0aCgpO1xyXG4gICAgY29uc3QgbWFjcm9WYWx1ZUJveCA9IG5ldyBSZWN0YW5nbGUoXHJcbiAgICAgIDAsXHJcbiAgICAgIDAsXHJcbiAgICAgIENPTkNFTlRSQVRJT05fTUVURVJfTUFDUk9fQk9YX1dJRFRILFxyXG4gICAgICBDT05DRU5UUkFUSU9OX1NMSURFUl9UUkFDS19IRUlHSFQgKiBtYWNyb0JveFByb3BvcnRpb25hdGVIZWlnaHQsXHJcbiAgICAgIHtcclxuICAgICAgICBzdHJva2U6IENPTkNFTlRSQVRJT05fQ09OVFJPTFNfU1RST0tFXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gbWlub3IgdGlja3Mgb24gdGhlIG1pY3JvIGxpbmVcclxuICAgIGNvbnN0IG1pbm9yVGlja0xpbmVPcHRpb25zID0geyBzdHJva2U6ICdncmV5JyB9O1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IENPTkNFTlRSQVRJT05fTUVURVJfTlVNQkVSX09GX01JQ1JPX1RJQ0tTOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRpY2sgPSBuZXcgTGluZSggMCwgMCwgOSwgMCwgbWlub3JUaWNrTGluZU9wdGlvbnMgKTtcclxuXHJcbiAgICAgIHRpY2suY2VudGVyID0gbWljcm9Db25jZW50cmF0aW9uTGluZS5jZW50ZXJUb3AucGx1c1hZKFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgaSAqIENPTkNFTlRSQVRJT05fU0xJREVSX1RSQUNLX0hFSUdIVCAvIENPTkNFTlRSQVRJT05fTUVURVJfTlVNQkVSX09GX01JQ1JPX1RJQ0tTXHJcbiAgICAgICk7XHJcbiAgICAgIG1pY3JvQ29uY2VudHJhdGlvbkxpbmUuYWRkQ2hpbGQoIHRpY2sgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBsYWJlbHMgZm9yIHRoZSBtYWNybyBsaW5lXHJcbiAgICBjb25zdCBsb3RzVGV4dCA9IG5ldyBUZXh0KCBsb3RzU3RyaW5nUHJvcGVydHksIExBQkVMX09QVElPTlMgKTtcclxuICAgIGNvbnN0IG5vbmVUZXh0ID0gbmV3IFRleHQoIG5vbmVTdHJpbmdQcm9wZXJ0eSwgTEFCRUxfT1BUSU9OUyApO1xyXG5cclxuICAgIC8vIGxpbmVzIGJldHdlZW4gbWFjcm8gYW5kIG1pY3JvIGxpbmVzIHNob3dpbmcgdGhhdCB0aGUgbWljcm8gbGluZSBpcyBhIHpvb21lZCBpbiB2aWV3IG9mIHRoZSBtYWNybyBsaW5lLCBlbmRcclxuICAgIC8vIHBvaW50cyBhcmUgc2V0IGFmdGVyIGxheW91dFxyXG4gICAgY29uc3QgY29ubmVjdGlvbkxpbmVPcHRpb25zID0geyBzdHJva2U6ICdncmF5JywgbGluZURhc2g6IFsgNSwgNSBdIH07XHJcbiAgICBjb25zdCB0b3BDb25uZWN0aW9uTGluZSA9IG5ldyBMaW5lKCAwLCAwLCAwLCAwLCBjb25uZWN0aW9uTGluZU9wdGlvbnMgKTtcclxuICAgIGNvbnN0IGJvdHRvbUNvbm5lY3Rpb25MaW5lID0gbmV3IExpbmUoIDAsIDAsIDAsIDAsIGNvbm5lY3Rpb25MaW5lT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHZhbHVlQ2lyY2xlID0gbmV3IENpcmNsZSggNSwgeyBmaWxsOiAnYmxhY2snIH0gKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIG1hY3JvIGxpbmUgaW4gYSBWQm94IHdpdGggdGhlIGxhYmVscyB0aGF0IGdvIGF0IHRoZSB0b3AgYW5kIHRoZSBib3R0b20gb2YgaXQgZm9yIGVhc2llciBhbGlnbm1lbnQgYW5kXHJcbiAgICAvLyBoYW5kbGluZyBvZiBkeW5hbWljIHN0cmluZ3MuXHJcbiAgICBjb25zdCBsYWJlbGVkTWFjcm9MaW5lID0gbmV3IFZCb3goIHtcclxuICAgICAgY2hpbGRyZW46IFsgbG90c1RleHQsIG1hY3JvQ29uY2VudHJhdGlvbkxpbmUsIG5vbmVUZXh0IF0sXHJcbiAgICAgIHNwYWNpbmc6IFNMSURFUl9UUkFDS19UT19MQUJFTF9TUEFDSU5HXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUHV0IGFsbCB0aGUgZWxlbWVudHMgdGhhdCBjb21wcmlzZSB0aGUgY29uY2VudHJhdGlvbiByYW5nZSBncmFwaGljIHRvZ2V0aGVyIGludG8gb25lIG5vZGUuXHJcbiAgICBjb25zdCBjb25jZW50cmF0aW9uUmFuZ2VHcmFwaGljID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBtYWNyb1ZhbHVlQm94LFxyXG4gICAgICAgIGxhYmVsZWRNYWNyb0xpbmUsXHJcbiAgICAgICAgbWljcm9Db25jZW50cmF0aW9uTGluZSxcclxuICAgICAgICB0b3BDb25uZWN0aW9uTGluZSxcclxuICAgICAgICBib3R0b21Db25uZWN0aW9uTGluZSxcclxuICAgICAgICB2YWx1ZUNpcmNsZVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTGF5IG91dCB0aGUgZ3JhcGhpYyBiYXNlZCBvbiB0aGUgcG9zaXRpb24gb2YgdGhlIG1hY3JvIGxpbmUuICBUaGlzIHdpbGwgZG8gdGhlIGluaXRpYWwgbGF5b3V0IGFuZCB3aWxsIHVwZGF0ZSB0aGVcclxuICAgIC8vIGxheW91dCB3aGVuIHRoZSBzdHJpbmdzIHRoYXQgbGFiZWwgdGhlIG1hY3JvIGxpbmUgYXJlIHVwZGF0ZWQuXHJcbiAgICBsYWJlbGVkTWFjcm9MaW5lLmJvdW5kc1Byb3BlcnR5LmxpbmsoIGJvdW5kcyA9PiB7XHJcblxyXG4gICAgICAvLyBQb3NpdGlvbiB0aGUgYm94IHRoYXQgaW5kaWNhdGVzIHRoZSBibG93biB1cCByZWdpb24uXHJcbiAgICAgIG1hY3JvVmFsdWVCb3guY2VudGVyID0gYm91bmRzLmNlbnRlci5wbHVzWFkoXHJcbiAgICAgICAgMCxcclxuICAgICAgICAtQ09OQ0VOVFJBVElPTl9TTElERVJfVFJBQ0tfSEVJR0hUICogKCBtYWNyb0JveFByb3BvcnRpb25hdGVDZW50ZXJZIC0gMC41IClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFBvc2l0aW9uIHRoZSBtaWNybyBsaW5lLCB3aGljaCByZXByZXNlbnRzIHRoZSBibG93biB1cCByZWdpb24uXHJcbiAgICAgIG1pY3JvQ29uY2VudHJhdGlvbkxpbmUuY2VudGVyID0gYm91bmRzLmNlbnRlci5wbHVzWFkoIDcwLCAwICk7XHJcblxyXG4gICAgICAvLyBVcGRhdGUgdGhlIGxpbmVzIHRoYXQgZ28gZnJvbSB0aGUgY29ybmVycyBvZiB0aGUgbWFjcm8gYm94IHRvIHRoZSBibG93biB1cCBsaW5lLlxyXG4gICAgICB0b3BDb25uZWN0aW9uTGluZS5zZXRQb2ludDEoIG1hY3JvVmFsdWVCb3gucmlnaHRUb3AgKTtcclxuICAgICAgdG9wQ29ubmVjdGlvbkxpbmUuc2V0UG9pbnQyKCBtaWNyb0NvbmNlbnRyYXRpb25MaW5lLmNlbnRlclRvcCApO1xyXG4gICAgICBib3R0b21Db25uZWN0aW9uTGluZS5zZXRQb2ludDEoIG1hY3JvVmFsdWVCb3gucmlnaHRCb3R0b20gKTtcclxuICAgICAgYm90dG9tQ29ubmVjdGlvbkxpbmUuc2V0UG9pbnQyKCBtaWNyb0NvbmNlbnRyYXRpb25MaW5lLmNlbnRlckJvdHRvbSApO1xyXG5cclxuICAgICAgLy8gQ2VudGVyIHRoZSB2YWx1ZSBpbmRpY2F0b3IgaW4gdGhlIGhvcml6b250YWwgZGlyZWN0aW9uLlxyXG4gICAgICB2YWx1ZUNpcmNsZS5jZW50ZXIgPSBtaWNyb0NvbmNlbnRyYXRpb25MaW5lLmNlbnRlcjtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHZlcnRpY2FsIHBvc2l0aW9uIG9mIHRoZSBjb25jZW50cmF0aW9uIGluZGljYXRvciB3aGVuIHRoZSBjb25jZW50cmF0aW9uIGNoYW5nZXMuXHJcbiAgICBjb25zdCBjb25jZW50cmF0aW9uUmFuZ2VMZW5ndGggPSBDb25jZW50cmF0aW9uTW9kZWwuQ09OQ0VOVFJBVElPTl9SQU5HRS5nZXRMZW5ndGgoKTtcclxuICAgIGNvbnN0IGNvbmNlbnRyYXRpb25IZWlnaHRGdW5jdGlvbiA9IG5ldyBMaW5lYXJGdW5jdGlvbihcclxuICAgICAgY29uY2VudHJhdGlvblJhbmdlTGVuZ3RoICogKCBtYWNyb0JveFByb3BvcnRpb25hdGVDZW50ZXJZIC0gbWFjcm9Cb3hQcm9wb3J0aW9uYXRlSGVpZ2h0IC8gMiApLFxyXG4gICAgICBjb25jZW50cmF0aW9uUmFuZ2VMZW5ndGggKiAoIG1hY3JvQm94UHJvcG9ydGlvbmF0ZUNlbnRlclkgKyBtYWNyb0JveFByb3BvcnRpb25hdGVIZWlnaHQgLyAyICksXHJcbiAgICAgIG1pY3JvQ29uY2VudHJhdGlvbkxpbmUuYm90dG9tLFxyXG4gICAgICBtaWNyb0NvbmNlbnRyYXRpb25MaW5lLnRvcFxyXG4gICAgKTtcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgY29uY2VudHJhdGlvblByb3BlcnR5LCBjb25jZW50cmF0aW9uQ29udHJvbE1vZGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGNvbmNlbnRyYXRpb24sIGNvbmNlbnRyYXRpb25Db250cm9sTW9kZSApID0+IHtcclxuICAgICAgICBpZiAoIGNvbmNlbnRyYXRpb25Db250cm9sTW9kZSA9PT0gQ29uY2VudHJhdGlvbkNvbnRyb2xNb2RlLkJZX0RBVEUgKSB7XHJcbiAgICAgICAgICB2YWx1ZUNpcmNsZS5jZW50ZXJZID0gY29uY2VudHJhdGlvbkhlaWdodEZ1bmN0aW9uLmV2YWx1YXRlKCBjb25jZW50cmF0aW9uICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIFB1dCB0aGUgZ3JhcGhpY2FsIHpvb20gaW4gcmVwcmVzZW50YXRpb24gYW5kIHRoZSByYWRpbyBidXR0b25zIG5leHQgdG8gZWFjaCBvdGhlciBpbiBhbiBIQm94LlxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgY29uY2VudHJhdGlvblJhbmdlR3JhcGhpYywgZGF0ZVJhZGlvQnV0dG9uR3JvdXAgXSxcclxuICAgICAgc3BhY2luZzogQ09OVEVOVF9TUEFDSU5HXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSW5uZXIgY2xhc3MgcmVwcmVzZW50aW5nIGEgbGFiZWxlZCBWU2xpZGVyIHRoYXQgZGlyZWN0bHkgY29udHJvbHMgZ3JlZW5ob3VzZSBnYXMgY29uY2VudHJhdGlvbi5cclxuICovXHJcbmNsYXNzIENvbmNlbnRyYXRpb25TbGlkZXIgZXh0ZW5kcyBWQm94IHtcclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbmNlbnRyYXRpb25Nb2RlbDogQ29uY2VudHJhdGlvbk1vZGVsLCByYWRpYXRpb25EZXNjcmliZXI6IFJhZGlhdGlvbkRlc2NyaWJlciwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3Qgc2xpZGVyUmFuZ2UgPSBjb25jZW50cmF0aW9uTW9kZWwubWFudWFsbHlDb250cm9sbGVkQ29uY2VudHJhdGlvblByb3BlcnR5LnJhbmdlO1xyXG4gICAgY29uc3Qgc2xpZGVyU291bmRHZW5lcmF0b3IgPSBuZXcgQ29uY2VudHJhdGlvblNsaWRlclNvdW5kR2VuZXJhdG9yKFxyXG4gICAgICBjb25jZW50cmF0aW9uTW9kZWwuY29uY2VudHJhdGlvblByb3BlcnR5LFxyXG4gICAgICBzbGlkZXJSYW5nZVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgVlNsaWRlciggY29uY2VudHJhdGlvbk1vZGVsLm1hbnVhbGx5Q29udHJvbGxlZENvbmNlbnRyYXRpb25Qcm9wZXJ0eSwgc2xpZGVyUmFuZ2UsIHtcclxuICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggMSwgQ09OQ0VOVFJBVElPTl9TTElERVJfVFJBQ0tfSEVJR0hUICksXHJcbiAgICAgIHRodW1iU2l6ZTogR3JlZW5ob3VzZUVmZmVjdENvbnN0YW50cy5WRVJUSUNBTF9TTElERVJfVEhVTUJfU0laRSxcclxuICAgICAgdGh1bWJMaW5lV2lkdGg6IFNMSURFUl9USFVNQl9MSU5FX1dJRFRILFxyXG5cclxuICAgICAgLy8gY29uc3RyYWluIHRoZSB2YWx1ZSBhIGJpdCB0byBhdm9pZCBzb21lIG9kZGl0aWVzIHdpdGggZmxvYXRpbmcgcG9pbnQgbWF0aFxyXG4gICAgICBjb25zdHJhaW5WYWx1ZTogbiA9PiBVdGlscy50b0ZpeGVkTnVtYmVyKCBuLCA2ICksXHJcblxyXG4gICAgICAvLyBzb3VuZCBnZW5lcmF0aW9uXHJcbiAgICAgIHNvdW5kR2VuZXJhdG9yOiBzbGlkZXJTb3VuZEdlbmVyYXRvcixcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgbGFiZWxDb250ZW50OiBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmNvbmNlbnRyYXRpb25QYW5lbC5jb25jZW50cmF0aW9uLmdyZWVuaG91c2VHYXNDb25jZW50cmF0aW9uU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICAgICAgaGVscFRleHQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLmNvbmNlbnRyYXRpb24uY29uY2VudHJhdGlvblNsaWRlckhlbHBUZXh0U3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGtleWJvYXJkU3RlcDogMC4wNSxcclxuICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IDAuMDEsIC8vIGZpbmVyIGdyYWluXHJcbiAgICAgIHBhZ2VLZXlib2FyZFN0ZXA6IDAuMiwgLy8gY29hcnNlciBncmFpbixcclxuICAgICAgYTExeUNyZWF0ZUFyaWFWYWx1ZVRleHQ6ICggdmFsdWU6IG51bWJlciApID0+IHtcclxuICAgICAgICByZXR1cm4gQ29uY2VudHJhdGlvbkRlc2NyaWJlci5nZXRDb25jZW50cmF0aW9uRGVzY3JpcHRpb25XaXRoVmFsdWUoIHZhbHVlLCB0cnVlLCBmYWxzZSApO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbGlkZXInIClcclxuICAgIH0gKTtcclxuICAgIHNsaWRlci5zY2FsZSggLTEsIDEgKTtcclxuXHJcbiAgICAvLyBsYWJlbHNcclxuICAgIGNvbnN0IGxvdHNUZXh0ID0gbmV3IFRleHQoIGxvdHNTdHJpbmdQcm9wZXJ0eSwgTEFCRUxfT1BUSU9OUyApO1xyXG4gICAgY29uc3Qgbm9uZVRleHQgPSBuZXcgVGV4dCggbm9uZVN0cmluZ1Byb3BlcnR5LCBMQUJFTF9PUFRJT05TICk7XHJcblxyXG4gICAgLy8gUG9zaXRpb24gdGhlIGxhYmVscyBhdCB0aGUgdG9wIGFuZCBib3R0b20gc3VjaCB0aGF0IHRoZXkgd2lsbCBiZSB0aGUgc2FtZSBkaXN0YW5jZSBmcm9tIHRoZSBlbmRzIG9mIHRoZSBzbGlkZXJcclxuICAgIC8vIHRyYWNrIGFzIHRoZXkgd2lsbCBiZSBpbiB0aGUgY29uY2VudHJhdGlvbiByYW5nZSBncmFwaGljLlxyXG4gICAgY29uc3Qgc2xpZGVyVG9MYWJlbFNwYWNpbmcgPSBTTElERVJfVFJBQ0tfVE9fTEFCRUxfU1BBQ0lORyAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdyZWVuaG91c2VFZmZlY3RDb25zdGFudHMuVkVSVElDQUxfU0xJREVSX1RIVU1CX1NJWkUuaGVpZ2h0IC8gMiAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNMSURFUl9USFVNQl9MSU5FX1dJRFRIO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgc2xpZGVyVG9MYWJlbFNwYWNpbmcgPj0gMCxcclxuICAgICAgJ3NsaWRlci10by1sYWJlbCBzcGFjaW5nIGxlc3MgdGhhbiB6ZXJvLCBhZGp1c3QgY29uc3RhbnRzIHRvIG1ha2UgdGhpcyB3b3JrJ1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBQdXQgdGhlIGxhYmVscyBhbmQgdGhlIHNsaWRlciB0b2dldGhlciBpbnRvIHRoZSBWQm94LlxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY2hpbGRyZW46IFsgbG90c1RleHQsIHNsaWRlciwgbm9uZVRleHQgXSxcclxuICAgICAgc3BhY2luZzogc2xpZGVyVG9MYWJlbFNwYWNpbmcsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBDb21wb3NpdGlvbkRhdGFOb2RlIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGF0ZVByb3BlcnR5OiBFbnVtZXJhdGlvblByb3BlcnR5PENvbmNlbnRyYXRpb25EYXRlPiwgcGFuZWxXaWR0aDogbnVtYmVyICkge1xyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBHcmVlbmhvdXNlRWZmZWN0Q29uc3RhbnRzLkNPTlRFTlRfRk9OVCxcclxuICAgICAgbWF4V2lkdGg6IHBhbmVsV2lkdGggLSAyICogUEFORUxfTUFSR0lOU1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXQgdXAgdGhlIGRhdGEgYW5kIHRleHQgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIHRoZSBjb25jZW50cmF0aW9uIGRpc3BsYXkuICBOb3RlIHRoYXQgSDJPIGlzIGhhbmRsZWQgYXMgYSBzcGVjaWFsXHJcbiAgICAvLyBjYXNlIGluIHRoaXMgY29kZSBiZWNhdXNlIGl0IGNhbiBoYXZlIGEgbnVsbCB2YWx1ZSwgc2luY2Ugd2UgZG9uJ3QgaGF2ZSBkYXRhIGZvciBpdCdzIHZhbHVlIGR1cmluZyB0aGUgaWNlIGFnZS5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEdSRUVOSE9VU0VfR0FTX0NPTkNFTlRSQVRJT05TLmhhcyggZGF0ZVByb3BlcnR5LnZhbHVlICksIGBubyBjb25jZW50cmF0aW9uIGRhdGEgZm9yICR7ZGF0ZVByb3BlcnR5LnZhbHVlfWAgKTtcclxuICAgIGNvbnN0IGluaXRpYWxDb25jZW50cmF0aW9uRGF0YSA9IEdSRUVOSE9VU0VfR0FTX0NPTkNFTlRSQVRJT05TLmdldCggZGF0ZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICBjb25zdCBjYXJib25EaW94aWRlQ29uY2VudHJhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsQ29uY2VudHJhdGlvbkRhdGEhLmNhcmJvbkRpb3hpZGVDb25jZW50cmF0aW9uICk7XHJcbiAgICBjb25zdCBtZXRoYW5lQ29uY2VudHJhdGlvblByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBpbml0aWFsQ29uY2VudHJhdGlvbkRhdGEhLm1ldGhhbmVDb25jZW50cmF0aW9uICk7XHJcbiAgICBjb25zdCBuaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGluaXRpYWxDb25jZW50cmF0aW9uRGF0YSEubml0cm91c094aWRlQ29uY2VudHJhdGlvbiApO1xyXG4gICAgZGF0ZVByb3BlcnR5LmxpbmsoIGRhdGUgPT4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBHUkVFTkhPVVNFX0dBU19DT05DRU5UUkFUSU9OUy5oYXMoIGRhdGUgKSwgYG5vIGNvbmNlbnRyYXRpb24gZGF0YSBmb3IgJHtkYXRlfWAgKTtcclxuICAgICAgY29uc3QgY29uY2VudHJhdGlvbkRhdGEgPSBHUkVFTkhPVVNFX0dBU19DT05DRU5UUkFUSU9OUy5nZXQoIGRhdGUgKTtcclxuICAgICAgY2FyYm9uRGlveGlkZUNvbmNlbnRyYXRpb25Qcm9wZXJ0eS5zZXQoIGNvbmNlbnRyYXRpb25EYXRhIS5jYXJib25EaW94aWRlQ29uY2VudHJhdGlvbiApO1xyXG4gICAgICBtZXRoYW5lQ29uY2VudHJhdGlvblByb3BlcnR5LnNldCggY29uY2VudHJhdGlvbkRhdGEhLm1ldGhhbmVDb25jZW50cmF0aW9uICk7XHJcbiAgICAgIG5pdHJvdXNPeGlkZUNvbmNlbnRyYXRpb25Qcm9wZXJ0eS5zZXQoIGNvbmNlbnRyYXRpb25EYXRhIS5uaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2FyYm9uRGlveGlkZVRleHRQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIGNhcmJvbkRpb3hpZGVDb25jZW50cmF0aW9uUGF0dGVyblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIHZhbHVlOiBjYXJib25EaW94aWRlQ29uY2VudHJhdGlvblByb3BlcnR5XHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjYXJib25EaW94aWRlVGV4dCA9IG5ldyBSaWNoVGV4dCggY2FyYm9uRGlveGlkZVRleHRQcm9wZXJ0eSwgdGV4dE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBtZXRoYW5lVGV4dFByb3BlcnR5ID0gbmV3IFBhdHRlcm5TdHJpbmdQcm9wZXJ0eSggbWV0aGFuZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgdmFsdWU6IG1ldGhhbmVDb25jZW50cmF0aW9uUHJvcGVydHlcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IG1ldGhhbmVUZXh0ID0gbmV3IFJpY2hUZXh0KCBtZXRoYW5lVGV4dFByb3BlcnR5LCB0ZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IG5pdHJvdXNPeGlkZVRleHRQcm9wZXJ0eSA9IG5ldyBQYXR0ZXJuU3RyaW5nUHJvcGVydHkoIG5pdHJvdXNPeGlkZUNvbmNlbnRyYXRpb25QYXR0ZXJuU3RyaW5nUHJvcGVydHksIHtcclxuICAgICAgdmFsdWU6IG5pdHJvdXNPeGlkZUNvbmNlbnRyYXRpb25Qcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgY29uc3Qgbml0cm91c094aWRlVGV4dCA9IG5ldyBSaWNoVGV4dCggbml0cm91c094aWRlVGV4dFByb3BlcnR5LCB0ZXh0T3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGNhcmJvbkRpb3hpZGVUZXh0LCBtZXRoYW5lVGV4dCwgbml0cm91c094aWRlVGV4dCBdLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogZGF0YS1vbmx5IGNsYXNzIHVzZWQgZm9yIG1hcHBpbmcgdGhlIGNvbmNlbnRyYXRpb25zIG9mIHZhcmlvdXMgZ3JlZW5ob3VzZSBnYXNzZXMgdG8gcG9pbnRzIGluIHRpbWVcclxuICovXHJcbmNsYXNzIEdyZWVuaG91c2VHYXNDb25jZW50cmF0aW9uRGF0YSB7XHJcblxyXG4gIC8vIHJlbGF0aXZlIGh1bWlkaXR5LCBpbiBwZXJjZW50LCBudWxsIGluZGljYXRlcyBcInVua25vd25cIlxyXG4gIHB1YmxpYyByZWFkb25seSByZWxhdGl2ZUh1bWlkaXR5OiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvLyBjb25jZW50cmF0aW9uIG9mIENPMiwgaW4gUFBNXHJcbiAgcHVibGljIHJlYWRvbmx5IGNhcmJvbkRpb3hpZGVDb25jZW50cmF0aW9uOiBudW1iZXI7XHJcblxyXG4gIC8vIGNvbmNlbnRyYXRpb24gb2YgQ0g0LCBpbiBQUEJcclxuICBwdWJsaWMgcmVhZG9ubHkgbWV0aGFuZUNvbmNlbnRyYXRpb246IG51bWJlcjtcclxuXHJcbiAgLy8gY29uY2VudHJhdGlvbiBvZiBOMk8sIGluIFBQQlxyXG4gIHB1YmxpYyByZWFkb25seSBuaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uOiBudW1iZXI7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSByZWxhdGl2ZUh1bWlkaXR5IC0gcGVyY2VudGFnZVxyXG4gICAqIEBwYXJhbSBjYXJib25EaW94aWRlQ29uY2VudHJhdGlvbiAtIGluIHBwbVxyXG4gICAqIEBwYXJhbSBtZXRoYW5lQ29uY2VudHJhdGlvbiAtIGluIHBwYlxyXG4gICAqIEBwYXJhbSBuaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uIC0gaW4gcHBiXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCByZWxhdGl2ZUh1bWlkaXR5OiBudW1iZXIgfCBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgY2FyYm9uRGlveGlkZUNvbmNlbnRyYXRpb246IG51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICAgIG1ldGhhbmVDb25jZW50cmF0aW9uOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBuaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uOiBudW1iZXIgKSB7XHJcbiAgICB0aGlzLnJlbGF0aXZlSHVtaWRpdHkgPSByZWxhdGl2ZUh1bWlkaXR5O1xyXG4gICAgdGhpcy5jYXJib25EaW94aWRlQ29uY2VudHJhdGlvbiA9IGNhcmJvbkRpb3hpZGVDb25jZW50cmF0aW9uO1xyXG4gICAgdGhpcy5tZXRoYW5lQ29uY2VudHJhdGlvbiA9IG1ldGhhbmVDb25jZW50cmF0aW9uO1xyXG4gICAgdGhpcy5uaXRyb3VzT3hpZGVDb25jZW50cmF0aW9uID0gbml0cm91c094aWRlQ29uY2VudHJhdGlvbjtcclxuICB9XHJcbn1cclxuXHJcbi8vIE1hcCB0aGUgZGF0ZXMgdG8gZ3JlZW5ob3VzZSBnYXMgY29uY2VudHJhdGlvbiBkYXRhLiAgVGhlIHZhbHVlcyBjYW1lIGZyb20gdGhlIGRlc2lnbiBkb2N1bWVudC5cclxuY29uc3QgR1JFRU5IT1VTRV9HQVNfQ09OQ0VOVFJBVElPTlMgPSBuZXcgTWFwKCBbXHJcbiAgWyBDb25jZW50cmF0aW9uRGF0ZS5UV0VOVFlfVFdFTlRZLCBuZXcgR3JlZW5ob3VzZUdhc0NvbmNlbnRyYXRpb25EYXRhKCA3MCwgNDEzLCAxODg5LCAzMzMgKSBdLFxyXG4gIFsgQ29uY2VudHJhdGlvbkRhdGUuTklORVRFRU5fRklGVFksIG5ldyBHcmVlbmhvdXNlR2FzQ29uY2VudHJhdGlvbkRhdGEoIDcwLCAzMTEsIDExMTYsIDI4OCApIF0sXHJcbiAgWyBDb25jZW50cmF0aW9uRGF0ZS5TRVZFTlRFRU5fRklGVFksIG5ldyBHcmVlbmhvdXNlR2FzQ29uY2VudHJhdGlvbkRhdGEoIDcwLCAyNzcsIDY5NCwgMjcxICkgXSxcclxuICBbIENvbmNlbnRyYXRpb25EYXRlLklDRV9BR0UsIG5ldyBHcmVlbmhvdXNlR2FzQ29uY2VudHJhdGlvbkRhdGEoIG51bGwsIDE4MCwgMzgwLCAyMTUgKSBdXHJcbl0gKTtcclxuXHJcbi8qKlxyXG4gKiBBbiBpbm5lciBjbGFzcyBmb3IgdGhlIGNvbnRyb2wgcGFuZWwgdGhhdCBjcmVhdGVzIGEgUmFkaW9CdXR0b25Hcm91cCB0aGF0IHNlbGVjdHMgYmV0d2VlbiBjb250cm9sbGluZyBjb25jZW50cmF0aW9uXHJcbiAqIGJ5IGRhdGUgb3IgYnkgdmFsdWUuXHJcbiAqL1xyXG5jbGFzcyBDb25jZW50cmF0aW9uQ29udHJvbFJhZGlvQnV0dG9uR3JvdXAgZXh0ZW5kcyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXA8Q29uY2VudHJhdGlvbkNvbnRyb2xNb2RlPiB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBwcm9wZXJ0eSAtIFByb3BlcnR5IGZvciB0aGUgbWV0aG9kIG9mIGNvbnRyb2xsaW5nIGNvbmNlbnRyYXRpb25cclxuICAgKiBAcGFyYW0gdGFuZGVtXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eTogRW51bWVyYXRpb25Qcm9wZXJ0eTxDb25jZW50cmF0aW9uQ29udHJvbE1vZGU+LCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBjb25zdCBkYXRlSWNvbiA9IG5ldyBQYXRoKCBjYWxlbmRhckFsdFJlZ3VsYXJTaGFwZSwge1xyXG4gICAgICBmaWxsOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdGhlIENhbGVuZGFyQWx0IGlzbid0IHNxdWFyZSwgc2NhbGUgaXQgZG93biBhbmQgcHJvZHVjZSBhIHNxdWFyZSBidXR0b25cclxuICAgIGRhdGVJY29uLnNldFNjYWxlTWFnbml0dWRlKCAzNCAvIGRhdGVJY29uLndpZHRoLCAzNCAvIGRhdGVJY29uLmhlaWdodCApO1xyXG5cclxuICAgIGNvbnN0IGR1bW15UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDUsIHsgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMTAgKSB9ICk7XHJcblxyXG4gICAgY29uc3QgaXRlbXMgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBjcmVhdGVOb2RlOiAoKSA9PiBuZXcgVlNsaWRlciggZHVtbXlQcm9wZXJ0eSwgZHVtbXlQcm9wZXJ0eS5yYW5nZSwge1xyXG4gICAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggMiwgZGF0ZUljb24uaGVpZ2h0IC0gOSApLFxyXG4gICAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggMTgsIDkgKSxcclxuICAgICAgICAgIHRodW1iRmlsbDogQ29sb3IuTElHSFRfR1JBWSxcclxuICAgICAgICAgIHRodW1iQ2VudGVyTGluZVN0cm9rZTogQ29sb3IuREFSS19HUkFZLFxyXG4gICAgICAgICAgdHJhY2tGaWxsRW5hYmxlZDogJ2JsYWNrJyxcclxuICAgICAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAvLyBzbGlkZXIgaWNvbiBzaG91bGQgbm90IGhhdmUgcmVwcmVzZW50YXRpb24gaW4gdGhlIFBET00sIGFjY2Vzc2liaWxpdHkgaXMgbWFuYWdlZCBieSB0aGUgY2hlY2tib3hcclxuICAgICAgICAgIHRhZ05hbWU6IG51bGwsXHJcblxyXG4gICAgICAgICAgLy8gcGhldC1pbyAtIG9wdGluZyBvdXQgb2YgdGhlIFRhbmRlbSBmb3IgdGhlIGljb25cclxuICAgICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgICAgICB9ICksXHJcbiAgICAgICAgdmFsdWU6IENvbmNlbnRyYXRpb25Db250cm9sTW9kZS5CWV9WQUxVRSxcclxuICAgICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLmJ5Q29uY2VudHJhdGlvblN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbU5hbWU6ICdieUNvbmNlbnRyYXRpb25SYWRpb0J1dHRvbidcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIGNyZWF0ZU5vZGU6ICgpID0+IGRhdGVJY29uLFxyXG4gICAgICAgIHZhbHVlOiBDb25jZW50cmF0aW9uQ29udHJvbE1vZGUuQllfREFURSxcclxuICAgICAgICBsYWJlbENvbnRlbnQ6IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuY29uY2VudHJhdGlvblBhbmVsLmJ5VGltZVBlcmlvZFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbU5hbWU6ICdieVRpbWVQZXJpb2RSYWRpb0J1dHRvbidcclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgcHJvcGVydHksXHJcbiAgICAgIGl0ZW1zLFxyXG4gICAgICBjb21iaW5lT3B0aW9uczxSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBPcHRpb25zPigge1xyXG4gICAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcgYXMgY29uc3QsXHJcblxyXG4gICAgICAgIC8vIHBkb21cclxuICAgICAgICBsYWJlbFRhZ05hbWU6ICdoNCcsXHJcbiAgICAgICAgbGFiZWxDb250ZW50OiBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmNvbmNlbnRyYXRpb25QYW5lbC5leHBlcmltZW50TW9kZVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICAgIGhlbHBUZXh0OiBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LmNvbmNlbnRyYXRpb25QYW5lbC5leHBlcmltZW50TW9kZUhlbHBUZXh0U3RyaW5nUHJvcGVydHksXHJcblxyXG4gICAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgICB9LCBSQURJT19CVVRUT05fR1JPVVBfT1BUSU9OUyApICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmVlbmhvdXNlRWZmZWN0LnJlZ2lzdGVyKCAnQ29uY2VudHJhdGlvbkNvbnRyb2xQYW5lbCcsIENvbmNlbnRyYXRpb25Db250cm9sUGFuZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ29uY2VudHJhdGlvbkNvbnRyb2xQYW5lbDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MscUJBQXFCLE1BQU0sOENBQThDO0FBRWhGLE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsY0FBYyxNQUFNLHNDQUFzQztBQUNqRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsdUNBQXVDO0FBQ2pGLFNBQVNDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxPQUFPLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUNuSSxPQUFPQyx1QkFBdUIsTUFBTSxnRUFBZ0U7QUFDcEcsT0FBT0MsMkJBQTJCLE1BQThDLDJEQUEyRDtBQUMzSSxPQUFPQyxLQUFLLE1BQXdCLDZCQUE2QjtBQUNqRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MseUJBQXlCLE1BQU0saUNBQWlDO0FBQ3ZFLE9BQU9DLGtCQUFrQixJQUFJQyx3QkFBd0IsRUFBRUMsaUJBQWlCLFFBQVEsZ0NBQWdDO0FBQ2hILE9BQU9DLGlDQUFpQyxNQUFNLHdDQUF3QztBQUN0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