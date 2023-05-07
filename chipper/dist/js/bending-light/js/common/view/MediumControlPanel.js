// Copyright 2015-2023, University of Colorado Boulder

/**
 * Controls for changing and viewing the medium type, including its current index of refraction
 * (depends on the laser wavelength through the dispersion function).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chandrashekar Bemagoni (Actual Concepts)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../BendingLightConstants.js';
import DispersionFunction from '../model/DispersionFunction.js';
import Medium from '../model/Medium.js';
import Substance from '../model/Substance.js';
import Multilink from '../../../../axon/js/Multilink.js';
import optionize from '../../../../phet-core/js/optionize.js';
const airStringProperty = BendingLightStrings.airStringProperty;
const customStringProperty = BendingLightStrings.customStringProperty;
const glassStringProperty = BendingLightStrings.glassStringProperty;
const indexOfRefractionStringProperty = BendingLightStrings.indexOfRefractionStringProperty;
const unknownStringProperty = BendingLightStrings.unknownStringProperty;
const waterStringProperty = BendingLightStrings.waterStringProperty;

// constants
const INDEX_OF_REFRACTION_MIN = Substance.AIR.indexForRed;
const INDEX_OF_REFRACTION_MAX = 1.6;
const PLUS_MINUS_SPACING = 4;
const INSET = 10;
class MediumControlPanel extends Node {
  /**
   * @param view - view of the simulation
   * @param mediumColorFactory - for turning index of refraction into color
   * @param mediumProperty - specifies medium
   * @param nameProperty - name of the medium material
   * @param textFieldVisible - whether to display index of refraction value
   * @param laserWavelength - wavelength of laser
   * @param decimalPlaces - decimalPlaces to show for index of refraction
   * @param [providedOptions] - options that can be passed on to the underlying node
   */
  constructor(view, mediumColorFactory, mediumProperty, nameProperty, textFieldVisible, laserWavelength, decimalPlaces, providedOptions) {
    super();
    this.mediumColorFactory = mediumColorFactory;
    const options = optionize()({
      xMargin: 10,
      yMargin: 10,
      fill: '#f2fa6a',
      stroke: '#696969',
      lineWidth: 1.5,
      comboBoxListPosition: 'above'
    }, providedOptions);
    this.mediumProperty = mediumProperty;
    this.laserWavelengthProperty = laserWavelength;
    const initialSubstance = mediumProperty.get().substance;

    // store the value the user used last (unless it was mystery), so we can revert to it when going to custom.
    // if we kept the same index of refraction, the user could use that to easily look up the mystery values.
    let lastNonMysteryIndexAtRed = initialSubstance.indexOfRefractionForRedLight;

    // dummy state for putting the combo box in "custom" mode, meaning none of the other named substances are selected
    const customState = new Substance(customStringProperty, Substance.MYSTERY_B.indexOfRefractionForRedLight + 1.2, false, true);
    let custom = true;

    // add material combo box
    const materialTitleWidth = textFieldVisible ? 80 : 90;
    const materialTitle = new Text(nameProperty, {
      font: new PhetFont(12),
      fontWeight: 'bold'
    });
    if (materialTitle.width > materialTitleWidth) {
      materialTitle.scale(materialTitleWidth / materialTitle.width);
    }
    const textOptionsOfComboBoxStrings = {
      font: new PhetFont(10)
    };
    const createItem = item => {
      return {
        value: item,
        createNode: () => {
          const comboBoxTextWidth = textFieldVisible ? 130 : 75;
          const itemName = new Text(item.nameProperty, textOptionsOfComboBoxStrings);
          if (itemName.width > comboBoxTextWidth) {
            itemName.scale(comboBoxTextWidth / itemName.width);
          }
          return itemName;
        }
      };
    };

    // states to choose from (and indicate) in the combo box
    const substances = [Substance.AIR, Substance.WATER, Substance.GLASS, Substance.MYSTERY_A, Substance.MYSTERY_B, customState];
    const comboBoxSubstanceProperty = new Property(initialSubstance);

    // update combo box
    const updateComboBox = () => {
      let selected = -1;
      for (let i = 0; i < substances.length; i++) {
        const substance = substances[i];
        if (substance.dispersionFunction.getIndexOfRefraction(laserWavelength.get()) === mediumProperty.get().getIndexOfRefraction(laserWavelength.get())) {
          selected = i;
        }
      }

      // only set to a different substance if "custom" wasn't specified.
      // otherwise pressing "air" then "custom" will make the combo box jump back to "air"
      if (selected !== -1 && !mediumProperty.get().substance.custom) {
        comboBoxSubstanceProperty.set(substances[selected]);
        custom = false;
      } else {
        // no match to a named medium, so it must be a custom medium
        comboBoxSubstanceProperty.set(customState);
        custom = true;
      }
    };

    // items
    const items = [];
    for (let i = 0; i < substances.length; i++) {
      items[i] = createItem(substances[i]);
    }
    // add a combo box
    const materialComboBox = new ComboBox(comboBoxSubstanceProperty, items, view, {
      listPosition: options.comboBoxListPosition,
      xMargin: 7,
      yMargin: 4,
      // TODO: arrowHeight doesn't exist in ComboBox, should we add that feature?
      // arrowHeight: 6,
      cornerRadius: 3
    });
    const materialControl = new HBox({
      spacing: 10,
      children: [materialTitle, materialComboBox]
    });

    // add index of refraction text and value
    const textOptions = {
      font: new PhetFont(12)
    };
    const indexOfRefractionLabelWidth = textFieldVisible ? 152 : 208;
    const indexOfRefractionLabel = new Text(indexOfRefractionStringProperty, {
      font: new PhetFont(12),
      maxWidth: 165
    });
    if (indexOfRefractionLabel.width > indexOfRefractionLabelWidth) {
      indexOfRefractionLabel.scale(indexOfRefractionLabelWidth / indexOfRefractionLabel.width);
    }
    this.mediumIndexProperty = new Property(mediumProperty.get().getIndexOfRefraction(laserWavelength.get()), {
      // See https://github.com/phetsims/bending-light/issues/378
      reentrant: true
    });
    const readoutString = Utils.toFixed(this.mediumIndexProperty.get(), decimalPlaces);
    const indexOfRefractionValueText = new Text(readoutString, textOptions);
    const indexOfRefractionReadoutBoxShape = new Rectangle(0, 0, 45, 20, 2, 2, {
      fill: 'white',
      stroke: 'black'
    });

    // add plus button for index of refraction text
    const plusButton = new ArrowButton('right', () => {
      custom = true;
      this.mediumIndexProperty.set(Utils.toFixedNumber(Math.min(this.mediumIndexProperty.get() + 1 / Math.pow(10, decimalPlaces), INDEX_OF_REFRACTION_MAX), decimalPlaces));
    }, {
      scale: 0.7,
      xMargin: 5,
      yMargin: 5,
      arrowHeight: 15,
      arrowWidth: 15
    });

    // touch area
    plusButton.touchArea = new Bounds2(plusButton.localBounds.minX - 20, plusButton.localBounds.minY - 5, plusButton.localBounds.maxX + 20, plusButton.localBounds.maxY + 20);

    // add minus button for index of refraction text
    const minusButton = new ArrowButton('left', () => {
      custom = true;
      this.mediumIndexProperty.set(Utils.toFixedNumber(Math.max(this.mediumIndexProperty.get() - 1 / Math.pow(10, decimalPlaces), INDEX_OF_REFRACTION_MIN), decimalPlaces));
    }, {
      scale: 0.7,
      xMargin: 5,
      yMargin: 5,
      arrowHeight: 15,
      arrowWidth: 15
    });
    // touch area
    minusButton.touchArea = new Bounds2(minusButton.localBounds.minX - 20, minusButton.localBounds.minY - 5, minusButton.localBounds.maxX + 20, minusButton.localBounds.maxY + 20);

    // adjust index of refraction value to the center of the readout box
    indexOfRefractionValueText.centerX = indexOfRefractionReadoutBoxShape.centerX;
    indexOfRefractionValueText.centerY = indexOfRefractionReadoutBoxShape.centerY;

    // plus button to the right of the value
    plusButton.left = indexOfRefractionReadoutBoxShape.right + PLUS_MINUS_SPACING;
    plusButton.centerY = indexOfRefractionReadoutBoxShape.centerY;

    // minus button to the left of the value
    minusButton.right = indexOfRefractionReadoutBoxShape.left - PLUS_MINUS_SPACING;
    minusButton.centerY = indexOfRefractionReadoutBoxShape.centerY;
    indexOfRefractionLabel.right = minusButton.left - INSET;
    indexOfRefractionLabel.centerY = minusButton.centerY;
    const indexOfRefractionNode = new Node({
      children: textFieldVisible ? [indexOfRefractionLabel, minusButton, indexOfRefractionReadoutBoxShape, indexOfRefractionValueText, plusButton] : [indexOfRefractionLabel]
    });

    // handling long strings, bring the slider in enough that moving the knob to the right doesn't resize the parent
    // panel.
    const sliderWidth = Math.max(materialControl.width, indexOfRefractionNode.width) - 12;
    const labelWidth = sliderWidth * 0.25;
    const airTitle = new Text(airStringProperty);
    if (airTitle.width > labelWidth) {
      airTitle.scale(labelWidth / airTitle.width);
    }
    const waterTitle = new Text(waterStringProperty);
    if (waterTitle.width > labelWidth) {
      waterTitle.scale(labelWidth / waterTitle.width);
    }
    const glassTitle = new Text(glassStringProperty);
    if (glassTitle.width > labelWidth) {
      glassTitle.scale(labelWidth / glassTitle.width);
    }

    // add slider for index of refraction
    const indexOfRefractionSlider = new HSlider(this.mediumIndexProperty, new Range(INDEX_OF_REFRACTION_MIN, INDEX_OF_REFRACTION_MAX), {
      trackFillEnabled: 'white',
      trackSize: new Dimension2(sliderWidth, 1),
      thumbSize: new Dimension2(10, 20),
      thumbTouchAreaYDilation: 8,
      // So it will not overlap the tweaker buttons
      majorTickLength: 11,
      tickLabelSpacing: 3,
      startDrag: () => {
        custom = true;
      }
    });
    indexOfRefractionSlider.addMajorTick(Substance.AIR.indexOfRefractionForRedLight, airTitle);
    indexOfRefractionSlider.addMajorTick(Substance.WATER.indexOfRefractionForRedLight, waterTitle);
    indexOfRefractionSlider.addMajorTick(Substance.GLASS.indexOfRefractionForRedLight, glassTitle);
    indexOfRefractionSlider.addMajorTick(1.6);

    // add a text to display when mystery is selected
    const unknown = new Text(unknownStringProperty, {
      font: new PhetFont(16),
      centerX: indexOfRefractionSlider.centerX,
      centerY: indexOfRefractionSlider.centerY,
      maxWidth: indexOfRefractionSlider.width * 0.8
    });

    // position the indexOfRefractionNode and indexOfRefractionSlider
    indexOfRefractionNode.top = materialControl.bottom + INSET;
    indexOfRefractionNode.left = materialControl.left;
    indexOfRefractionSlider.left = materialControl.left;
    indexOfRefractionSlider.top = indexOfRefractionNode.bottom + INSET / 2;
    unknown.centerX = materialControl.centerX;
    unknown.centerY = indexOfRefractionNode.bottom + INSET;

    // add all the nodes to mediumPanelNode
    const mediumPanelNode = new Node({
      children: [materialControl, indexOfRefractionNode, indexOfRefractionSlider, unknown],
      // @ts-expect-error TODO: Spacing isn't on Node
      spacing: 10
    });
    const mediumPanel = new Panel(mediumPanelNode, {
      fill: '#EEEEEE',
      stroke: '#696969',
      xMargin: 13.5,
      // Adjusted manually so that the panels will align in English and the slider knob won't go outside
      // the panel
      yMargin: options.yMargin,
      cornerRadius: 5,
      lineWidth: options.lineWidth,
      resize: false // Don't resize when the slider knob encroaches on the right border
    });

    this.addChild(mediumPanel);
    Multilink.multilink([mediumProperty, this.laserWavelengthProperty], () => {
      custom = mediumProperty.get().substance.custom;
      indexOfRefractionValueText.string = Utils.toFixed(mediumProperty.get().getIndexOfRefraction(laserWavelength.get()), decimalPlaces);
    });
    mediumProperty.link(() => {
      indexOfRefractionNode.setVisible(!mediumProperty.get().isMystery());
      unknown.setVisible(mediumProperty.get().isMystery());
      indexOfRefractionSlider.setVisible(!mediumProperty.get().isMystery());
      if (!mediumProperty.get().isMystery()) {
        lastNonMysteryIndexAtRed = mediumProperty.get().getIndexOfRefraction(BendingLightConstants.WAVELENGTH_RED);
        this.mediumIndexProperty.set(lastNonMysteryIndexAtRed);
      }
      updateComboBox();
    });
    comboBoxSubstanceProperty.link(selected => {
      if (!selected.custom) {
        this.setSubstance(selected);
      } else {
        // if it was custom, then use the index of refraction but keep the name as "custom"
        this.setSubstance(new Substance(selected.nameProperty, lastNonMysteryIndexAtRed, selected.mystery, selected.custom));
      }
    });

    // disable the plus button when wavelength is at max and minus button at min wavelength
    this.mediumIndexProperty.link(indexOfRefraction => {
      if (custom) {
        this.setCustomIndexOfRefraction(indexOfRefraction);
      }
      const slack = Math.pow(10, -decimalPlaces);
      plusButton.enabled = indexOfRefraction < INDEX_OF_REFRACTION_MAX - slack / 2;
      minusButton.enabled = indexOfRefraction > INDEX_OF_REFRACTION_MIN + slack / 2;
    });
  }

  /**
   */
  reset() {
    this.mediumIndexProperty.reset();
  }

  /**
   * Called when the user enters a new index of refraction (with text box or slider),
   * updates the model with the specified value
   * @param indexOfRefraction - indexOfRefraction of medium
   */
  setCustomIndexOfRefraction(indexOfRefraction) {
    // have to pass the value through the dispersion function to account for the
    // current wavelength of the laser (since index of refraction is a function of wavelength)
    const dispersionFunction = new DispersionFunction(indexOfRefraction, this.laserWavelengthProperty.get());
    this.setMedium(new Medium(this.mediumProperty.get().shape, new Substance(customStringProperty, indexOfRefraction, false, true), this.mediumColorFactory.getColor(dispersionFunction.getIndexOfRefractionForRed())));
  }

  /**
   * Update the medium state from the combo box
   * @param substance - specifies state of the medium
   */
  setSubstance(substance) {
    const color = this.mediumColorFactory.getColor(substance.indexOfRefractionForRedLight);
    this.setMedium(new Medium(this.mediumProperty.get().shape, substance, color));
  }

  /**
   * Update the medium
   * @param medium - specifies medium
   */
  setMedium(medium) {
    this.mediumProperty.set(medium);
  }
}
bendingLight.register('MediumControlPanel', MediumControlPanel);
export default MediumControlPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJVdGlscyIsIlBoZXRGb250IiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiQXJyb3dCdXR0b24iLCJDb21ib0JveCIsIkhTbGlkZXIiLCJQYW5lbCIsIkJlbmRpbmdMaWdodFN0cmluZ3MiLCJiZW5kaW5nTGlnaHQiLCJCZW5kaW5nTGlnaHRDb25zdGFudHMiLCJEaXNwZXJzaW9uRnVuY3Rpb24iLCJNZWRpdW0iLCJTdWJzdGFuY2UiLCJNdWx0aWxpbmsiLCJvcHRpb25pemUiLCJhaXJTdHJpbmdQcm9wZXJ0eSIsImN1c3RvbVN0cmluZ1Byb3BlcnR5IiwiZ2xhc3NTdHJpbmdQcm9wZXJ0eSIsImluZGV4T2ZSZWZyYWN0aW9uU3RyaW5nUHJvcGVydHkiLCJ1bmtub3duU3RyaW5nUHJvcGVydHkiLCJ3YXRlclN0cmluZ1Byb3BlcnR5IiwiSU5ERVhfT0ZfUkVGUkFDVElPTl9NSU4iLCJBSVIiLCJpbmRleEZvclJlZCIsIklOREVYX09GX1JFRlJBQ1RJT05fTUFYIiwiUExVU19NSU5VU19TUEFDSU5HIiwiSU5TRVQiLCJNZWRpdW1Db250cm9sUGFuZWwiLCJjb25zdHJ1Y3RvciIsInZpZXciLCJtZWRpdW1Db2xvckZhY3RvcnkiLCJtZWRpdW1Qcm9wZXJ0eSIsIm5hbWVQcm9wZXJ0eSIsInRleHRGaWVsZFZpc2libGUiLCJsYXNlcldhdmVsZW5ndGgiLCJkZWNpbWFsUGxhY2VzIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiZmlsbCIsInN0cm9rZSIsImxpbmVXaWR0aCIsImNvbWJvQm94TGlzdFBvc2l0aW9uIiwibGFzZXJXYXZlbGVuZ3RoUHJvcGVydHkiLCJpbml0aWFsU3Vic3RhbmNlIiwiZ2V0Iiwic3Vic3RhbmNlIiwibGFzdE5vbk15c3RlcnlJbmRleEF0UmVkIiwiaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCIsImN1c3RvbVN0YXRlIiwiTVlTVEVSWV9CIiwiY3VzdG9tIiwibWF0ZXJpYWxUaXRsZVdpZHRoIiwibWF0ZXJpYWxUaXRsZSIsImZvbnQiLCJmb250V2VpZ2h0Iiwid2lkdGgiLCJzY2FsZSIsInRleHRPcHRpb25zT2ZDb21ib0JveFN0cmluZ3MiLCJjcmVhdGVJdGVtIiwiaXRlbSIsInZhbHVlIiwiY3JlYXRlTm9kZSIsImNvbWJvQm94VGV4dFdpZHRoIiwiaXRlbU5hbWUiLCJzdWJzdGFuY2VzIiwiV0FURVIiLCJHTEFTUyIsIk1ZU1RFUllfQSIsImNvbWJvQm94U3Vic3RhbmNlUHJvcGVydHkiLCJ1cGRhdGVDb21ib0JveCIsInNlbGVjdGVkIiwiaSIsImxlbmd0aCIsImRpc3BlcnNpb25GdW5jdGlvbiIsImdldEluZGV4T2ZSZWZyYWN0aW9uIiwic2V0IiwiaXRlbXMiLCJtYXRlcmlhbENvbWJvQm94IiwibGlzdFBvc2l0aW9uIiwiY29ybmVyUmFkaXVzIiwibWF0ZXJpYWxDb250cm9sIiwic3BhY2luZyIsImNoaWxkcmVuIiwidGV4dE9wdGlvbnMiLCJpbmRleE9mUmVmcmFjdGlvbkxhYmVsV2lkdGgiLCJpbmRleE9mUmVmcmFjdGlvbkxhYmVsIiwibWF4V2lkdGgiLCJtZWRpdW1JbmRleFByb3BlcnR5IiwicmVlbnRyYW50IiwicmVhZG91dFN0cmluZyIsInRvRml4ZWQiLCJpbmRleE9mUmVmcmFjdGlvblZhbHVlVGV4dCIsImluZGV4T2ZSZWZyYWN0aW9uUmVhZG91dEJveFNoYXBlIiwicGx1c0J1dHRvbiIsInRvRml4ZWROdW1iZXIiLCJNYXRoIiwibWluIiwicG93IiwiYXJyb3dIZWlnaHQiLCJhcnJvd1dpZHRoIiwidG91Y2hBcmVhIiwibG9jYWxCb3VuZHMiLCJtaW5YIiwibWluWSIsIm1heFgiLCJtYXhZIiwibWludXNCdXR0b24iLCJtYXgiLCJjZW50ZXJYIiwiY2VudGVyWSIsImxlZnQiLCJyaWdodCIsImluZGV4T2ZSZWZyYWN0aW9uTm9kZSIsInNsaWRlcldpZHRoIiwibGFiZWxXaWR0aCIsImFpclRpdGxlIiwid2F0ZXJUaXRsZSIsImdsYXNzVGl0bGUiLCJpbmRleE9mUmVmcmFjdGlvblNsaWRlciIsInRyYWNrRmlsbEVuYWJsZWQiLCJ0cmFja1NpemUiLCJ0aHVtYlNpemUiLCJ0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbiIsIm1ham9yVGlja0xlbmd0aCIsInRpY2tMYWJlbFNwYWNpbmciLCJzdGFydERyYWciLCJhZGRNYWpvclRpY2siLCJ1bmtub3duIiwidG9wIiwiYm90dG9tIiwibWVkaXVtUGFuZWxOb2RlIiwibWVkaXVtUGFuZWwiLCJyZXNpemUiLCJhZGRDaGlsZCIsIm11bHRpbGluayIsInN0cmluZyIsImxpbmsiLCJzZXRWaXNpYmxlIiwiaXNNeXN0ZXJ5IiwiV0FWRUxFTkdUSF9SRUQiLCJzZXRTdWJzdGFuY2UiLCJteXN0ZXJ5IiwiaW5kZXhPZlJlZnJhY3Rpb24iLCJzZXRDdXN0b21JbmRleE9mUmVmcmFjdGlvbiIsInNsYWNrIiwiZW5hYmxlZCIsInJlc2V0Iiwic2V0TWVkaXVtIiwic2hhcGUiLCJnZXRDb2xvciIsImdldEluZGV4T2ZSZWZyYWN0aW9uRm9yUmVkIiwiY29sb3IiLCJtZWRpdW0iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1lZGl1bUNvbnRyb2xQYW5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb250cm9scyBmb3IgY2hhbmdpbmcgYW5kIHZpZXdpbmcgdGhlIG1lZGl1bSB0eXBlLCBpbmNsdWRpbmcgaXRzIGN1cnJlbnQgaW5kZXggb2YgcmVmcmFjdGlvblxyXG4gKiAoZGVwZW5kcyBvbiB0aGUgbGFzZXIgd2F2ZWxlbmd0aCB0aHJvdWdoIHRoZSBkaXNwZXJzaW9uIGZ1bmN0aW9uKS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaGFuZHJhc2hla2FyIEJlbWFnb25pIChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgSEJveCwgTm9kZSwgTm9kZU9wdGlvbnMsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBcnJvd0J1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9BcnJvd0J1dHRvbi5qcyc7XHJcbmltcG9ydCBDb21ib0JveCwgeyBDb21ib0JveExpc3RQb3NpdGlvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9Db21ib0JveC5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBCZW5kaW5nTGlnaHRTdHJpbmdzIGZyb20gJy4uLy4uL0JlbmRpbmdMaWdodFN0cmluZ3MuanMnO1xyXG5pbXBvcnQgYmVuZGluZ0xpZ2h0IGZyb20gJy4uLy4uL2JlbmRpbmdMaWdodC5qcyc7XHJcbmltcG9ydCBCZW5kaW5nTGlnaHRDb25zdGFudHMgZnJvbSAnLi4vQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IERpc3BlcnNpb25GdW5jdGlvbiBmcm9tICcuLi9tb2RlbC9EaXNwZXJzaW9uRnVuY3Rpb24uanMnO1xyXG5pbXBvcnQgTWVkaXVtIGZyb20gJy4uL21vZGVsL01lZGl1bS5qcyc7XHJcbmltcG9ydCBTdWJzdGFuY2UgZnJvbSAnLi4vbW9kZWwvU3Vic3RhbmNlLmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodFNjcmVlblZpZXcgZnJvbSAnLi9CZW5kaW5nTGlnaHRTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IE1lZGl1bUNvbG9yRmFjdG9yeSBmcm9tICcuLi9tb2RlbC9NZWRpdW1Db2xvckZhY3RvcnkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5cclxuY29uc3QgYWlyU3RyaW5nUHJvcGVydHkgPSBCZW5kaW5nTGlnaHRTdHJpbmdzLmFpclN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBjdXN0b21TdHJpbmdQcm9wZXJ0eSA9IEJlbmRpbmdMaWdodFN0cmluZ3MuY3VzdG9tU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGdsYXNzU3RyaW5nUHJvcGVydHkgPSBCZW5kaW5nTGlnaHRTdHJpbmdzLmdsYXNzU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IGluZGV4T2ZSZWZyYWN0aW9uU3RyaW5nUHJvcGVydHkgPSBCZW5kaW5nTGlnaHRTdHJpbmdzLmluZGV4T2ZSZWZyYWN0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHVua25vd25TdHJpbmdQcm9wZXJ0eSA9IEJlbmRpbmdMaWdodFN0cmluZ3MudW5rbm93blN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCB3YXRlclN0cmluZ1Byb3BlcnR5ID0gQmVuZGluZ0xpZ2h0U3RyaW5ncy53YXRlclN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElOREVYX09GX1JFRlJBQ1RJT05fTUlOID0gU3Vic3RhbmNlLkFJUi5pbmRleEZvclJlZDtcclxuY29uc3QgSU5ERVhfT0ZfUkVGUkFDVElPTl9NQVggPSAxLjY7XHJcbmNvbnN0IFBMVVNfTUlOVVNfU1BBQ0lORyA9IDQ7XHJcbmNvbnN0IElOU0VUID0gMTA7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGNvbWJvQm94TGlzdFBvc2l0aW9uPzogQ29tYm9Cb3hMaXN0UG9zaXRpb247XHJcbiAgeE1hcmdpbj86IG51bWJlcjtcclxuICB5TWFyZ2luPzogbnVtYmVyO1xyXG4gIGxpbmVXaWR0aD86IG51bWJlcjtcclxuICBmaWxsPzogc3RyaW5nO1xyXG4gIHN0cm9rZT86IHN0cmluZztcclxufTtcclxuXHJcbnR5cGUgTWVkaXVtQ29udHJvbFBhbmVsT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZU9wdGlvbnM7XHJcblxyXG5jbGFzcyBNZWRpdW1Db250cm9sUGFuZWwgZXh0ZW5kcyBOb2RlIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1lZGl1bUNvbG9yRmFjdG9yeTogTWVkaXVtQ29sb3JGYWN0b3J5O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWVkaXVtUHJvcGVydHk6IFByb3BlcnR5PE1lZGl1bT47XHJcbiAgcHJpdmF0ZSByZWFkb25seSBsYXNlcldhdmVsZW5ndGhQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1lZGl1bUluZGV4UHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB2aWV3IC0gdmlldyBvZiB0aGUgc2ltdWxhdGlvblxyXG4gICAqIEBwYXJhbSBtZWRpdW1Db2xvckZhY3RvcnkgLSBmb3IgdHVybmluZyBpbmRleCBvZiByZWZyYWN0aW9uIGludG8gY29sb3JcclxuICAgKiBAcGFyYW0gbWVkaXVtUHJvcGVydHkgLSBzcGVjaWZpZXMgbWVkaXVtXHJcbiAgICogQHBhcmFtIG5hbWVQcm9wZXJ0eSAtIG5hbWUgb2YgdGhlIG1lZGl1bSBtYXRlcmlhbFxyXG4gICAqIEBwYXJhbSB0ZXh0RmllbGRWaXNpYmxlIC0gd2hldGhlciB0byBkaXNwbGF5IGluZGV4IG9mIHJlZnJhY3Rpb24gdmFsdWVcclxuICAgKiBAcGFyYW0gbGFzZXJXYXZlbGVuZ3RoIC0gd2F2ZWxlbmd0aCBvZiBsYXNlclxyXG4gICAqIEBwYXJhbSBkZWNpbWFsUGxhY2VzIC0gZGVjaW1hbFBsYWNlcyB0byBzaG93IGZvciBpbmRleCBvZiByZWZyYWN0aW9uXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdIC0gb3B0aW9ucyB0aGF0IGNhbiBiZSBwYXNzZWQgb24gdG8gdGhlIHVuZGVybHlpbmcgbm9kZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmlldzogQmVuZGluZ0xpZ2h0U2NyZWVuVmlldywgbWVkaXVtQ29sb3JGYWN0b3J5OiBNZWRpdW1Db2xvckZhY3RvcnksIG1lZGl1bVByb3BlcnR5OiBQcm9wZXJ0eTxNZWRpdW0+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxzdHJpbmc+LCB0ZXh0RmllbGRWaXNpYmxlOiBib29sZWFuLCBsYXNlcldhdmVsZW5ndGg6IFByb3BlcnR5PG51bWJlcj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFsUGxhY2VzOiBudW1iZXIsIHByb3ZpZGVkT3B0aW9ucz86IE1lZGl1bUNvbnRyb2xQYW5lbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMubWVkaXVtQ29sb3JGYWN0b3J5ID0gbWVkaXVtQ29sb3JGYWN0b3J5O1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TWVkaXVtQ29udHJvbFBhbmVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcbiAgICAgIHhNYXJnaW46IDEwLFxyXG4gICAgICB5TWFyZ2luOiAxMCxcclxuICAgICAgZmlsbDogJyNmMmZhNmEnLFxyXG4gICAgICBzdHJva2U6ICcjNjk2OTY5JyxcclxuICAgICAgbGluZVdpZHRoOiAxLjUsXHJcbiAgICAgIGNvbWJvQm94TGlzdFBvc2l0aW9uOiAnYWJvdmUnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKSBhcyBNZWRpdW1Db250cm9sUGFuZWxPcHRpb25zO1xyXG5cclxuICAgIHRoaXMubWVkaXVtUHJvcGVydHkgPSBtZWRpdW1Qcm9wZXJ0eTtcclxuICAgIHRoaXMubGFzZXJXYXZlbGVuZ3RoUHJvcGVydHkgPSBsYXNlcldhdmVsZW5ndGg7XHJcbiAgICBjb25zdCBpbml0aWFsU3Vic3RhbmNlID0gbWVkaXVtUHJvcGVydHkuZ2V0KCkuc3Vic3RhbmNlO1xyXG5cclxuICAgIC8vIHN0b3JlIHRoZSB2YWx1ZSB0aGUgdXNlciB1c2VkIGxhc3QgKHVubGVzcyBpdCB3YXMgbXlzdGVyeSksIHNvIHdlIGNhbiByZXZlcnQgdG8gaXQgd2hlbiBnb2luZyB0byBjdXN0b20uXHJcbiAgICAvLyBpZiB3ZSBrZXB0IHRoZSBzYW1lIGluZGV4IG9mIHJlZnJhY3Rpb24sIHRoZSB1c2VyIGNvdWxkIHVzZSB0aGF0IHRvIGVhc2lseSBsb29rIHVwIHRoZSBteXN0ZXJ5IHZhbHVlcy5cclxuICAgIGxldCBsYXN0Tm9uTXlzdGVyeUluZGV4QXRSZWQgPSBpbml0aWFsU3Vic3RhbmNlLmluZGV4T2ZSZWZyYWN0aW9uRm9yUmVkTGlnaHQ7XHJcblxyXG4gICAgLy8gZHVtbXkgc3RhdGUgZm9yIHB1dHRpbmcgdGhlIGNvbWJvIGJveCBpbiBcImN1c3RvbVwiIG1vZGUsIG1lYW5pbmcgbm9uZSBvZiB0aGUgb3RoZXIgbmFtZWQgc3Vic3RhbmNlcyBhcmUgc2VsZWN0ZWRcclxuICAgIGNvbnN0IGN1c3RvbVN0YXRlID0gbmV3IFN1YnN0YW5jZShcclxuICAgICAgY3VzdG9tU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIFN1YnN0YW5jZS5NWVNURVJZX0IuaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCArIDEuMixcclxuICAgICAgZmFsc2UsXHJcbiAgICAgIHRydWVcclxuICAgICk7XHJcbiAgICBsZXQgY3VzdG9tID0gdHJ1ZTtcclxuXHJcbiAgICAvLyBhZGQgbWF0ZXJpYWwgY29tYm8gYm94XHJcbiAgICBjb25zdCBtYXRlcmlhbFRpdGxlV2lkdGggPSB0ZXh0RmllbGRWaXNpYmxlID8gODAgOiA5MDtcclxuICAgIGNvbnN0IG1hdGVyaWFsVGl0bGUgPSBuZXcgVGV4dCggbmFtZVByb3BlcnR5LCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSwgZm9udFdlaWdodDogJ2JvbGQnIH0gKTtcclxuICAgIGlmICggbWF0ZXJpYWxUaXRsZS53aWR0aCA+IG1hdGVyaWFsVGl0bGVXaWR0aCApIHtcclxuICAgICAgbWF0ZXJpYWxUaXRsZS5zY2FsZSggbWF0ZXJpYWxUaXRsZVdpZHRoIC8gbWF0ZXJpYWxUaXRsZS53aWR0aCApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zT2ZDb21ib0JveFN0cmluZ3MgPSB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTAgKSB9O1xyXG5cclxuICAgIGNvbnN0IGNyZWF0ZUl0ZW0gPSAoIGl0ZW06IFN1YnN0YW5jZSApID0+IHtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsdWU6IGl0ZW0sXHJcbiAgICAgICAgY3JlYXRlTm9kZTogKCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgY29tYm9Cb3hUZXh0V2lkdGggPSB0ZXh0RmllbGRWaXNpYmxlID8gMTMwIDogNzU7XHJcbiAgICAgICAgICBjb25zdCBpdGVtTmFtZSA9IG5ldyBUZXh0KCBpdGVtLm5hbWVQcm9wZXJ0eSwgdGV4dE9wdGlvbnNPZkNvbWJvQm94U3RyaW5ncyApO1xyXG4gICAgICAgICAgaWYgKCBpdGVtTmFtZS53aWR0aCA+IGNvbWJvQm94VGV4dFdpZHRoICkge1xyXG4gICAgICAgICAgICBpdGVtTmFtZS5zY2FsZSggY29tYm9Cb3hUZXh0V2lkdGggLyBpdGVtTmFtZS53aWR0aCApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGl0ZW1OYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gc3RhdGVzIHRvIGNob29zZSBmcm9tIChhbmQgaW5kaWNhdGUpIGluIHRoZSBjb21ibyBib3hcclxuICAgIGNvbnN0IHN1YnN0YW5jZXMgPSBbXHJcbiAgICAgIFN1YnN0YW5jZS5BSVIsXHJcbiAgICAgIFN1YnN0YW5jZS5XQVRFUixcclxuICAgICAgU3Vic3RhbmNlLkdMQVNTLFxyXG4gICAgICBTdWJzdGFuY2UuTVlTVEVSWV9BLFxyXG4gICAgICBTdWJzdGFuY2UuTVlTVEVSWV9CLFxyXG4gICAgICBjdXN0b21TdGF0ZVxyXG4gICAgXTtcclxuICAgIGNvbnN0IGNvbWJvQm94U3Vic3RhbmNlUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8U3Vic3RhbmNlPiggaW5pdGlhbFN1YnN0YW5jZSApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSBjb21ibyBib3hcclxuICAgIGNvbnN0IHVwZGF0ZUNvbWJvQm94ID0gKCkgPT4ge1xyXG4gICAgICBsZXQgc2VsZWN0ZWQgPSAtMTtcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgc3Vic3RhbmNlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBjb25zdCBzdWJzdGFuY2UgPSBzdWJzdGFuY2VzWyBpIF07XHJcbiAgICAgICAgaWYgKCBzdWJzdGFuY2UuZGlzcGVyc2lvbkZ1bmN0aW9uLmdldEluZGV4T2ZSZWZyYWN0aW9uKCBsYXNlcldhdmVsZW5ndGguZ2V0KCkgKSA9PT1cclxuICAgICAgICAgICAgIG1lZGl1bVByb3BlcnR5LmdldCgpLmdldEluZGV4T2ZSZWZyYWN0aW9uKCBsYXNlcldhdmVsZW5ndGguZ2V0KCkgKSApIHtcclxuICAgICAgICAgIHNlbGVjdGVkID0gaTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG9ubHkgc2V0IHRvIGEgZGlmZmVyZW50IHN1YnN0YW5jZSBpZiBcImN1c3RvbVwiIHdhc24ndCBzcGVjaWZpZWQuXHJcbiAgICAgIC8vIG90aGVyd2lzZSBwcmVzc2luZyBcImFpclwiIHRoZW4gXCJjdXN0b21cIiB3aWxsIG1ha2UgdGhlIGNvbWJvIGJveCBqdW1wIGJhY2sgdG8gXCJhaXJcIlxyXG4gICAgICBpZiAoIHNlbGVjdGVkICE9PSAtMSAmJiAhbWVkaXVtUHJvcGVydHkuZ2V0KCkuc3Vic3RhbmNlLmN1c3RvbSApIHtcclxuICAgICAgICBjb21ib0JveFN1YnN0YW5jZVByb3BlcnR5LnNldCggc3Vic3RhbmNlc1sgc2VsZWN0ZWQgXSApO1xyXG4gICAgICAgIGN1c3RvbSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIG5vIG1hdGNoIHRvIGEgbmFtZWQgbWVkaXVtLCBzbyBpdCBtdXN0IGJlIGEgY3VzdG9tIG1lZGl1bVxyXG4gICAgICAgIGNvbWJvQm94U3Vic3RhbmNlUHJvcGVydHkuc2V0KCBjdXN0b21TdGF0ZSApO1xyXG4gICAgICAgIGN1c3RvbSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gaXRlbXNcclxuICAgIGNvbnN0IGl0ZW1zID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdWJzdGFuY2VzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpdGVtc1sgaSBdID0gY3JlYXRlSXRlbSggc3Vic3RhbmNlc1sgaSBdICk7XHJcbiAgICB9XHJcbiAgICAvLyBhZGQgYSBjb21ibyBib3hcclxuICAgIGNvbnN0IG1hdGVyaWFsQ29tYm9Cb3ggPSBuZXcgQ29tYm9Cb3goIGNvbWJvQm94U3Vic3RhbmNlUHJvcGVydHksIGl0ZW1zLCB2aWV3LCB7XHJcbiAgICAgIGxpc3RQb3NpdGlvbjogb3B0aW9ucy5jb21ib0JveExpc3RQb3NpdGlvbixcclxuICAgICAgeE1hcmdpbjogNyxcclxuICAgICAgeU1hcmdpbjogNCxcclxuICAgICAgLy8gVE9ETzogYXJyb3dIZWlnaHQgZG9lc24ndCBleGlzdCBpbiBDb21ib0JveCwgc2hvdWxkIHdlIGFkZCB0aGF0IGZlYXR1cmU/XHJcbiAgICAgIC8vIGFycm93SGVpZ2h0OiA2LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDNcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBtYXRlcmlhbENvbnRyb2wgPSBuZXcgSEJveCgge1xyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICBtYXRlcmlhbFRpdGxlLFxyXG4gICAgICAgIG1hdGVyaWFsQ29tYm9Cb3hcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCBpbmRleCBvZiByZWZyYWN0aW9uIHRleHQgYW5kIHZhbHVlXHJcbiAgICBjb25zdCB0ZXh0T3B0aW9ucyA9IHsgZm9udDogbmV3IFBoZXRGb250KCAxMiApIH07XHJcbiAgICBjb25zdCBpbmRleE9mUmVmcmFjdGlvbkxhYmVsV2lkdGggPSB0ZXh0RmllbGRWaXNpYmxlID8gMTUyIDogMjA4O1xyXG4gICAgY29uc3QgaW5kZXhPZlJlZnJhY3Rpb25MYWJlbCA9IG5ldyBUZXh0KCBpbmRleE9mUmVmcmFjdGlvblN0cmluZ1Byb3BlcnR5LCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSxcclxuICAgICAgbWF4V2lkdGg6IDE2NVxyXG4gICAgfSApO1xyXG4gICAgaWYgKCBpbmRleE9mUmVmcmFjdGlvbkxhYmVsLndpZHRoID4gaW5kZXhPZlJlZnJhY3Rpb25MYWJlbFdpZHRoICkge1xyXG4gICAgICBpbmRleE9mUmVmcmFjdGlvbkxhYmVsLnNjYWxlKCBpbmRleE9mUmVmcmFjdGlvbkxhYmVsV2lkdGggLyBpbmRleE9mUmVmcmFjdGlvbkxhYmVsLndpZHRoICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLm1lZGl1bUluZGV4UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIG1lZGl1bVByb3BlcnR5LmdldCgpLmdldEluZGV4T2ZSZWZyYWN0aW9uKCBsYXNlcldhdmVsZW5ndGguZ2V0KCkgKSwge1xyXG5cclxuICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9iZW5kaW5nLWxpZ2h0L2lzc3Vlcy8zNzhcclxuICAgICAgcmVlbnRyYW50OiB0cnVlXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCByZWFkb3V0U3RyaW5nID0gVXRpbHMudG9GaXhlZCggdGhpcy5tZWRpdW1JbmRleFByb3BlcnR5LmdldCgpLCBkZWNpbWFsUGxhY2VzICk7XHJcbiAgICBjb25zdCBpbmRleE9mUmVmcmFjdGlvblZhbHVlVGV4dCA9IG5ldyBUZXh0KCByZWFkb3V0U3RyaW5nLCB0ZXh0T3B0aW9ucyApO1xyXG4gICAgY29uc3QgaW5kZXhPZlJlZnJhY3Rpb25SZWFkb3V0Qm94U2hhcGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA0NSwgMjAsIDIsIDIsIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIHBsdXMgYnV0dG9uIGZvciBpbmRleCBvZiByZWZyYWN0aW9uIHRleHRcclxuICAgIGNvbnN0IHBsdXNCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdyaWdodCcsICgpID0+IHtcclxuICAgICAgY3VzdG9tID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tZWRpdW1JbmRleFByb3BlcnR5LnNldChcclxuICAgICAgICBVdGlscy50b0ZpeGVkTnVtYmVyKCBNYXRoLm1pbiggdGhpcy5tZWRpdW1JbmRleFByb3BlcnR5LmdldCgpICsgMSAvIE1hdGgucG93KCAxMCwgZGVjaW1hbFBsYWNlcyApLFxyXG4gICAgICAgICAgSU5ERVhfT0ZfUkVGUkFDVElPTl9NQVggKSwgZGVjaW1hbFBsYWNlcyApICk7XHJcbiAgICB9LCB7XHJcbiAgICAgIHNjYWxlOiAwLjcsXHJcbiAgICAgIHhNYXJnaW46IDUsXHJcbiAgICAgIHlNYXJnaW46IDUsXHJcbiAgICAgIGFycm93SGVpZ2h0OiAxNSxcclxuICAgICAgYXJyb3dXaWR0aDogMTVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB0b3VjaCBhcmVhXHJcbiAgICBwbHVzQnV0dG9uLnRvdWNoQXJlYSA9IG5ldyBCb3VuZHMyKCBwbHVzQnV0dG9uLmxvY2FsQm91bmRzLm1pblggLSAyMCwgcGx1c0J1dHRvbi5sb2NhbEJvdW5kcy5taW5ZIC0gNSxcclxuICAgICAgcGx1c0J1dHRvbi5sb2NhbEJvdW5kcy5tYXhYICsgMjAsIHBsdXNCdXR0b24ubG9jYWxCb3VuZHMubWF4WSArIDIwICk7XHJcblxyXG4gICAgLy8gYWRkIG1pbnVzIGJ1dHRvbiBmb3IgaW5kZXggb2YgcmVmcmFjdGlvbiB0ZXh0XHJcbiAgICBjb25zdCBtaW51c0J1dHRvbiA9IG5ldyBBcnJvd0J1dHRvbiggJ2xlZnQnLCAoKSA9PiB7XHJcbiAgICAgIGN1c3RvbSA9IHRydWU7XHJcbiAgICAgIHRoaXMubWVkaXVtSW5kZXhQcm9wZXJ0eS5zZXQoXHJcbiAgICAgICAgVXRpbHMudG9GaXhlZE51bWJlciggTWF0aC5tYXgoIHRoaXMubWVkaXVtSW5kZXhQcm9wZXJ0eS5nZXQoKSAtIDEgLyBNYXRoLnBvdyggMTAsIGRlY2ltYWxQbGFjZXMgKSxcclxuICAgICAgICAgIElOREVYX09GX1JFRlJBQ1RJT05fTUlOICksIGRlY2ltYWxQbGFjZXMgKSApO1xyXG4gICAgfSwge1xyXG4gICAgICBzY2FsZTogMC43LFxyXG4gICAgICB4TWFyZ2luOiA1LFxyXG4gICAgICB5TWFyZ2luOiA1LFxyXG4gICAgICBhcnJvd0hlaWdodDogMTUsXHJcbiAgICAgIGFycm93V2lkdGg6IDE1XHJcbiAgICB9ICk7XHJcbiAgICAvLyB0b3VjaCBhcmVhXHJcbiAgICBtaW51c0J1dHRvbi50b3VjaEFyZWEgPSBuZXcgQm91bmRzMihcclxuICAgICAgbWludXNCdXR0b24ubG9jYWxCb3VuZHMubWluWCAtIDIwLCBtaW51c0J1dHRvbi5sb2NhbEJvdW5kcy5taW5ZIC0gNSxcclxuICAgICAgbWludXNCdXR0b24ubG9jYWxCb3VuZHMubWF4WCArIDIwLCBtaW51c0J1dHRvbi5sb2NhbEJvdW5kcy5tYXhZICsgMjBcclxuICAgICk7XHJcblxyXG4gICAgLy8gYWRqdXN0IGluZGV4IG9mIHJlZnJhY3Rpb24gdmFsdWUgdG8gdGhlIGNlbnRlciBvZiB0aGUgcmVhZG91dCBib3hcclxuICAgIGluZGV4T2ZSZWZyYWN0aW9uVmFsdWVUZXh0LmNlbnRlclggPSBpbmRleE9mUmVmcmFjdGlvblJlYWRvdXRCb3hTaGFwZS5jZW50ZXJYO1xyXG4gICAgaW5kZXhPZlJlZnJhY3Rpb25WYWx1ZVRleHQuY2VudGVyWSA9IGluZGV4T2ZSZWZyYWN0aW9uUmVhZG91dEJveFNoYXBlLmNlbnRlclk7XHJcblxyXG4gICAgLy8gcGx1cyBidXR0b24gdG8gdGhlIHJpZ2h0IG9mIHRoZSB2YWx1ZVxyXG4gICAgcGx1c0J1dHRvbi5sZWZ0ID0gaW5kZXhPZlJlZnJhY3Rpb25SZWFkb3V0Qm94U2hhcGUucmlnaHQgKyBQTFVTX01JTlVTX1NQQUNJTkc7XHJcbiAgICBwbHVzQnV0dG9uLmNlbnRlclkgPSBpbmRleE9mUmVmcmFjdGlvblJlYWRvdXRCb3hTaGFwZS5jZW50ZXJZO1xyXG5cclxuICAgIC8vIG1pbnVzIGJ1dHRvbiB0byB0aGUgbGVmdCBvZiB0aGUgdmFsdWVcclxuICAgIG1pbnVzQnV0dG9uLnJpZ2h0ID0gaW5kZXhPZlJlZnJhY3Rpb25SZWFkb3V0Qm94U2hhcGUubGVmdCAtIFBMVVNfTUlOVVNfU1BBQ0lORztcclxuICAgIG1pbnVzQnV0dG9uLmNlbnRlclkgPSBpbmRleE9mUmVmcmFjdGlvblJlYWRvdXRCb3hTaGFwZS5jZW50ZXJZO1xyXG5cclxuICAgIGluZGV4T2ZSZWZyYWN0aW9uTGFiZWwucmlnaHQgPSBtaW51c0J1dHRvbi5sZWZ0IC0gSU5TRVQ7XHJcbiAgICBpbmRleE9mUmVmcmFjdGlvbkxhYmVsLmNlbnRlclkgPSBtaW51c0J1dHRvbi5jZW50ZXJZO1xyXG5cclxuICAgIGNvbnN0IGluZGV4T2ZSZWZyYWN0aW9uTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiB0ZXh0RmllbGRWaXNpYmxlID8gW1xyXG4gICAgICAgIGluZGV4T2ZSZWZyYWN0aW9uTGFiZWwsXHJcbiAgICAgICAgbWludXNCdXR0b24sXHJcbiAgICAgICAgaW5kZXhPZlJlZnJhY3Rpb25SZWFkb3V0Qm94U2hhcGUsXHJcbiAgICAgICAgaW5kZXhPZlJlZnJhY3Rpb25WYWx1ZVRleHQsXHJcbiAgICAgICAgcGx1c0J1dHRvblxyXG4gICAgICBdIDogW1xyXG4gICAgICAgIGluZGV4T2ZSZWZyYWN0aW9uTGFiZWxcclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGhhbmRsaW5nIGxvbmcgc3RyaW5ncywgYnJpbmcgdGhlIHNsaWRlciBpbiBlbm91Z2ggdGhhdCBtb3ZpbmcgdGhlIGtub2IgdG8gdGhlIHJpZ2h0IGRvZXNuJ3QgcmVzaXplIHRoZSBwYXJlbnRcclxuICAgIC8vIHBhbmVsLlxyXG4gICAgY29uc3Qgc2xpZGVyV2lkdGggPSBNYXRoLm1heCggbWF0ZXJpYWxDb250cm9sLndpZHRoLCBpbmRleE9mUmVmcmFjdGlvbk5vZGUud2lkdGggKSAtIDEyO1xyXG4gICAgY29uc3QgbGFiZWxXaWR0aCA9IHNsaWRlcldpZHRoICogMC4yNTtcclxuICAgIGNvbnN0IGFpclRpdGxlID0gbmV3IFRleHQoIGFpclN0cmluZ1Byb3BlcnR5ICk7XHJcbiAgICBpZiAoIGFpclRpdGxlLndpZHRoID4gbGFiZWxXaWR0aCApIHtcclxuICAgICAgYWlyVGl0bGUuc2NhbGUoIGxhYmVsV2lkdGggLyBhaXJUaXRsZS53aWR0aCApO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgd2F0ZXJUaXRsZSA9IG5ldyBUZXh0KCB3YXRlclN0cmluZ1Byb3BlcnR5ICk7XHJcbiAgICBpZiAoIHdhdGVyVGl0bGUud2lkdGggPiBsYWJlbFdpZHRoICkge1xyXG4gICAgICB3YXRlclRpdGxlLnNjYWxlKCBsYWJlbFdpZHRoIC8gd2F0ZXJUaXRsZS53aWR0aCApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZ2xhc3NUaXRsZSA9IG5ldyBUZXh0KCBnbGFzc1N0cmluZ1Byb3BlcnR5ICk7XHJcbiAgICBpZiAoIGdsYXNzVGl0bGUud2lkdGggPiBsYWJlbFdpZHRoICkge1xyXG4gICAgICBnbGFzc1RpdGxlLnNjYWxlKCBsYWJlbFdpZHRoIC8gZ2xhc3NUaXRsZS53aWR0aCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFkZCBzbGlkZXIgZm9yIGluZGV4IG9mIHJlZnJhY3Rpb25cclxuICAgIGNvbnN0IGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyID0gbmV3IEhTbGlkZXIoIHRoaXMubWVkaXVtSW5kZXhQcm9wZXJ0eSxcclxuICAgICAgbmV3IFJhbmdlKCBJTkRFWF9PRl9SRUZSQUNUSU9OX01JTiwgSU5ERVhfT0ZfUkVGUkFDVElPTl9NQVggKSwge1xyXG4gICAgICAgIHRyYWNrRmlsbEVuYWJsZWQ6ICd3aGl0ZScsXHJcbiAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggc2xpZGVyV2lkdGgsIDEgKSxcclxuICAgICAgICB0aHVtYlNpemU6IG5ldyBEaW1lbnNpb24yKCAxMCwgMjAgKSxcclxuICAgICAgICB0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbjogOCwgLy8gU28gaXQgd2lsbCBub3Qgb3ZlcmxhcCB0aGUgdHdlYWtlciBidXR0b25zXHJcbiAgICAgICAgbWFqb3JUaWNrTGVuZ3RoOiAxMSxcclxuICAgICAgICB0aWNrTGFiZWxTcGFjaW5nOiAzLFxyXG4gICAgICAgIHN0YXJ0RHJhZzogKCkgPT4ge1xyXG4gICAgICAgICAgY3VzdG9tID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyLmFkZE1ham9yVGljayggU3Vic3RhbmNlLkFJUi5pbmRleE9mUmVmcmFjdGlvbkZvclJlZExpZ2h0LCBhaXJUaXRsZSApO1xyXG4gICAgaW5kZXhPZlJlZnJhY3Rpb25TbGlkZXIuYWRkTWFqb3JUaWNrKCBTdWJzdGFuY2UuV0FURVIuaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCwgd2F0ZXJUaXRsZSApO1xyXG4gICAgaW5kZXhPZlJlZnJhY3Rpb25TbGlkZXIuYWRkTWFqb3JUaWNrKCBTdWJzdGFuY2UuR0xBU1MuaW5kZXhPZlJlZnJhY3Rpb25Gb3JSZWRMaWdodCwgZ2xhc3NUaXRsZSApO1xyXG4gICAgaW5kZXhPZlJlZnJhY3Rpb25TbGlkZXIuYWRkTWFqb3JUaWNrKCAxLjYgKTtcclxuXHJcbiAgICAvLyBhZGQgYSB0ZXh0IHRvIGRpc3BsYXkgd2hlbiBteXN0ZXJ5IGlzIHNlbGVjdGVkXHJcbiAgICBjb25zdCB1bmtub3duID0gbmV3IFRleHQoIHVua25vd25TdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgIGNlbnRlclg6IGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyLmNlbnRlclgsXHJcbiAgICAgIGNlbnRlclk6IGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyLmNlbnRlclksXHJcbiAgICAgIG1heFdpZHRoOiBpbmRleE9mUmVmcmFjdGlvblNsaWRlci53aWR0aCAqIDAuOFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBvc2l0aW9uIHRoZSBpbmRleE9mUmVmcmFjdGlvbk5vZGUgYW5kIGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyXHJcbiAgICBpbmRleE9mUmVmcmFjdGlvbk5vZGUudG9wID0gbWF0ZXJpYWxDb250cm9sLmJvdHRvbSArIElOU0VUO1xyXG4gICAgaW5kZXhPZlJlZnJhY3Rpb25Ob2RlLmxlZnQgPSBtYXRlcmlhbENvbnRyb2wubGVmdDtcclxuICAgIGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyLmxlZnQgPSBtYXRlcmlhbENvbnRyb2wubGVmdDtcclxuICAgIGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyLnRvcCA9IGluZGV4T2ZSZWZyYWN0aW9uTm9kZS5ib3R0b20gKyBJTlNFVCAvIDI7XHJcbiAgICB1bmtub3duLmNlbnRlclggPSBtYXRlcmlhbENvbnRyb2wuY2VudGVyWDtcclxuICAgIHVua25vd24uY2VudGVyWSA9IGluZGV4T2ZSZWZyYWN0aW9uTm9kZS5ib3R0b20gKyBJTlNFVDtcclxuXHJcbiAgICAvLyBhZGQgYWxsIHRoZSBub2RlcyB0byBtZWRpdW1QYW5lbE5vZGVcclxuICAgIGNvbnN0IG1lZGl1bVBhbmVsTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIG1hdGVyaWFsQ29udHJvbCwgaW5kZXhPZlJlZnJhY3Rpb25Ob2RlLCBpbmRleE9mUmVmcmFjdGlvblNsaWRlciwgdW5rbm93biBdLFxyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IFNwYWNpbmcgaXNuJ3Qgb24gTm9kZVxyXG4gICAgICBzcGFjaW5nOiAxMFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG1lZGl1bVBhbmVsID0gbmV3IFBhbmVsKCBtZWRpdW1QYW5lbE5vZGUsIHtcclxuICAgICAgZmlsbDogJyNFRUVFRUUnLFxyXG4gICAgICBzdHJva2U6ICcjNjk2OTY5JyxcclxuICAgICAgeE1hcmdpbjogMTMuNSwgLy8gQWRqdXN0ZWQgbWFudWFsbHkgc28gdGhhdCB0aGUgcGFuZWxzIHdpbGwgYWxpZ24gaW4gRW5nbGlzaCBhbmQgdGhlIHNsaWRlciBrbm9iIHdvbid0IGdvIG91dHNpZGVcclxuICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHBhbmVsXHJcbiAgICAgIHlNYXJnaW46IG9wdGlvbnMueU1hcmdpbixcclxuICAgICAgY29ybmVyUmFkaXVzOiA1LFxyXG4gICAgICBsaW5lV2lkdGg6IG9wdGlvbnMubGluZVdpZHRoLFxyXG4gICAgICByZXNpemU6IGZhbHNlIC8vIERvbid0IHJlc2l6ZSB3aGVuIHRoZSBzbGlkZXIga25vYiBlbmNyb2FjaGVzIG9uIHRoZSByaWdodCBib3JkZXJcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG1lZGl1bVBhbmVsICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIG1lZGl1bVByb3BlcnR5LCB0aGlzLmxhc2VyV2F2ZWxlbmd0aFByb3BlcnR5IF0sXHJcbiAgICAgICgpID0+IHtcclxuICAgICAgICBjdXN0b20gPSBtZWRpdW1Qcm9wZXJ0eS5nZXQoKS5zdWJzdGFuY2UuY3VzdG9tO1xyXG4gICAgICAgIGluZGV4T2ZSZWZyYWN0aW9uVmFsdWVUZXh0LnN0cmluZyA9IFV0aWxzLnRvRml4ZWQoXHJcbiAgICAgICAgICBtZWRpdW1Qcm9wZXJ0eS5nZXQoKS5nZXRJbmRleE9mUmVmcmFjdGlvbiggbGFzZXJXYXZlbGVuZ3RoLmdldCgpICksIGRlY2ltYWxQbGFjZXMgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIG1lZGl1bVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgaW5kZXhPZlJlZnJhY3Rpb25Ob2RlLnNldFZpc2libGUoICFtZWRpdW1Qcm9wZXJ0eS5nZXQoKS5pc015c3RlcnkoKSApO1xyXG4gICAgICB1bmtub3duLnNldFZpc2libGUoIG1lZGl1bVByb3BlcnR5LmdldCgpLmlzTXlzdGVyeSgpICk7XHJcbiAgICAgIGluZGV4T2ZSZWZyYWN0aW9uU2xpZGVyLnNldFZpc2libGUoICFtZWRpdW1Qcm9wZXJ0eS5nZXQoKS5pc015c3RlcnkoKSApO1xyXG4gICAgICBpZiAoICFtZWRpdW1Qcm9wZXJ0eS5nZXQoKS5pc015c3RlcnkoKSApIHtcclxuICAgICAgICBsYXN0Tm9uTXlzdGVyeUluZGV4QXRSZWQgPSBtZWRpdW1Qcm9wZXJ0eS5nZXQoKS5nZXRJbmRleE9mUmVmcmFjdGlvbiggQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLldBVkVMRU5HVEhfUkVEICk7XHJcbiAgICAgICAgdGhpcy5tZWRpdW1JbmRleFByb3BlcnR5LnNldCggbGFzdE5vbk15c3RlcnlJbmRleEF0UmVkICk7XHJcbiAgICAgIH1cclxuICAgICAgdXBkYXRlQ29tYm9Cb3goKTtcclxuICAgIH0gKTtcclxuICAgIGNvbWJvQm94U3Vic3RhbmNlUHJvcGVydHkubGluayggc2VsZWN0ZWQgPT4ge1xyXG4gICAgICBpZiAoICFzZWxlY3RlZC5jdXN0b20gKSB7XHJcbiAgICAgICAgdGhpcy5zZXRTdWJzdGFuY2UoIHNlbGVjdGVkICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGlmIGl0IHdhcyBjdXN0b20sIHRoZW4gdXNlIHRoZSBpbmRleCBvZiByZWZyYWN0aW9uIGJ1dCBrZWVwIHRoZSBuYW1lIGFzIFwiY3VzdG9tXCJcclxuICAgICAgICB0aGlzLnNldFN1YnN0YW5jZSggbmV3IFN1YnN0YW5jZSggc2VsZWN0ZWQubmFtZVByb3BlcnR5LCBsYXN0Tm9uTXlzdGVyeUluZGV4QXRSZWQsIHNlbGVjdGVkLm15c3RlcnksIHNlbGVjdGVkLmN1c3RvbSApICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBkaXNhYmxlIHRoZSBwbHVzIGJ1dHRvbiB3aGVuIHdhdmVsZW5ndGggaXMgYXQgbWF4IGFuZCBtaW51cyBidXR0b24gYXQgbWluIHdhdmVsZW5ndGhcclxuICAgIHRoaXMubWVkaXVtSW5kZXhQcm9wZXJ0eS5saW5rKCBpbmRleE9mUmVmcmFjdGlvbiA9PiB7XHJcbiAgICAgIGlmICggY3VzdG9tICkge1xyXG4gICAgICAgIHRoaXMuc2V0Q3VzdG9tSW5kZXhPZlJlZnJhY3Rpb24oIGluZGV4T2ZSZWZyYWN0aW9uICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHNsYWNrID0gTWF0aC5wb3coIDEwLCAtZGVjaW1hbFBsYWNlcyApO1xyXG4gICAgICBwbHVzQnV0dG9uLmVuYWJsZWQgPSAoIGluZGV4T2ZSZWZyYWN0aW9uIDwgSU5ERVhfT0ZfUkVGUkFDVElPTl9NQVggLSBzbGFjayAvIDIgKTtcclxuICAgICAgbWludXNCdXR0b24uZW5hYmxlZCA9ICggaW5kZXhPZlJlZnJhY3Rpb24gPiBJTkRFWF9PRl9SRUZSQUNUSU9OX01JTiArIHNsYWNrIC8gMiApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tZWRpdW1JbmRleFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDYWxsZWQgd2hlbiB0aGUgdXNlciBlbnRlcnMgYSBuZXcgaW5kZXggb2YgcmVmcmFjdGlvbiAod2l0aCB0ZXh0IGJveCBvciBzbGlkZXIpLFxyXG4gICAqIHVwZGF0ZXMgdGhlIG1vZGVsIHdpdGggdGhlIHNwZWNpZmllZCB2YWx1ZVxyXG4gICAqIEBwYXJhbSBpbmRleE9mUmVmcmFjdGlvbiAtIGluZGV4T2ZSZWZyYWN0aW9uIG9mIG1lZGl1bVxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0Q3VzdG9tSW5kZXhPZlJlZnJhY3Rpb24oIGluZGV4T2ZSZWZyYWN0aW9uOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gaGF2ZSB0byBwYXNzIHRoZSB2YWx1ZSB0aHJvdWdoIHRoZSBkaXNwZXJzaW9uIGZ1bmN0aW9uIHRvIGFjY291bnQgZm9yIHRoZVxyXG4gICAgLy8gY3VycmVudCB3YXZlbGVuZ3RoIG9mIHRoZSBsYXNlciAoc2luY2UgaW5kZXggb2YgcmVmcmFjdGlvbiBpcyBhIGZ1bmN0aW9uIG9mIHdhdmVsZW5ndGgpXHJcbiAgICBjb25zdCBkaXNwZXJzaW9uRnVuY3Rpb24gPSBuZXcgRGlzcGVyc2lvbkZ1bmN0aW9uKCBpbmRleE9mUmVmcmFjdGlvbiwgdGhpcy5sYXNlcldhdmVsZW5ndGhQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgdGhpcy5zZXRNZWRpdW0oIG5ldyBNZWRpdW0oIHRoaXMubWVkaXVtUHJvcGVydHkuZ2V0KCkuc2hhcGUsXHJcbiAgICAgIG5ldyBTdWJzdGFuY2UoIGN1c3RvbVN0cmluZ1Byb3BlcnR5LCBpbmRleE9mUmVmcmFjdGlvbiwgZmFsc2UsIHRydWUgKSxcclxuICAgICAgdGhpcy5tZWRpdW1Db2xvckZhY3RvcnkuZ2V0Q29sb3IoIGRpc3BlcnNpb25GdW5jdGlvbi5nZXRJbmRleE9mUmVmcmFjdGlvbkZvclJlZCgpIClcclxuICAgICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgbWVkaXVtIHN0YXRlIGZyb20gdGhlIGNvbWJvIGJveFxyXG4gICAqIEBwYXJhbSBzdWJzdGFuY2UgLSBzcGVjaWZpZXMgc3RhdGUgb2YgdGhlIG1lZGl1bVxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0U3Vic3RhbmNlKCBzdWJzdGFuY2U6IFN1YnN0YW5jZSApOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbG9yID0gdGhpcy5tZWRpdW1Db2xvckZhY3RvcnkuZ2V0Q29sb3IoIHN1YnN0YW5jZS5pbmRleE9mUmVmcmFjdGlvbkZvclJlZExpZ2h0ICk7XHJcbiAgICB0aGlzLnNldE1lZGl1bSggbmV3IE1lZGl1bSggdGhpcy5tZWRpdW1Qcm9wZXJ0eS5nZXQoKS5zaGFwZSwgc3Vic3RhbmNlLCBjb2xvciApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIG1lZGl1bVxyXG4gICAqIEBwYXJhbSBtZWRpdW0gLSBzcGVjaWZpZXMgbWVkaXVtXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRNZWRpdW0oIG1lZGl1bTogTWVkaXVtICk6IHZvaWQge1xyXG4gICAgdGhpcy5tZWRpdW1Qcm9wZXJ0eS5zZXQoIG1lZGl1bSApO1xyXG4gIH1cclxufVxyXG5cclxuYmVuZGluZ0xpZ2h0LnJlZ2lzdGVyKCAnTWVkaXVtQ29udHJvbFBhbmVsJywgTWVkaXVtQ29udHJvbFBhbmVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNZWRpdW1Db250cm9sUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxJQUFJLEVBQUVDLElBQUksRUFBZUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzVGLE9BQU9DLFdBQVcsTUFBTSwyQ0FBMkM7QUFDbkUsT0FBT0MsUUFBUSxNQUFnQyxnQ0FBZ0M7QUFDL0UsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUM5RCxPQUFPQyxZQUFZLE1BQU0sdUJBQXVCO0FBQ2hELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUMvRCxPQUFPQyxrQkFBa0IsTUFBTSxnQ0FBZ0M7QUFDL0QsT0FBT0MsTUFBTSxNQUFNLG9CQUFvQjtBQUN2QyxPQUFPQyxTQUFTLE1BQU0sdUJBQXVCO0FBRzdDLE9BQU9DLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUc3RCxNQUFNQyxpQkFBaUIsR0FBR1IsbUJBQW1CLENBQUNRLGlCQUFpQjtBQUMvRCxNQUFNQyxvQkFBb0IsR0FBR1QsbUJBQW1CLENBQUNTLG9CQUFvQjtBQUNyRSxNQUFNQyxtQkFBbUIsR0FBR1YsbUJBQW1CLENBQUNVLG1CQUFtQjtBQUNuRSxNQUFNQywr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