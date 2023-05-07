// Copyright 2021-2023, University of Colorado Boulder

/**
 * This class defines a separate window that shows a representation of the electromagnetic spectrum.
 *
 * @author Jesse Greenberg
 * @author John Blanco
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import WavelengthSpectrumNode from '../../../../scenery-phet/js/WavelengthSpectrumNode.js';
import { Line, LinearGradient, Node, Path, PDOMPeer, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import greenhouseEffect from '../../greenhouseEffect.js';
import GreenhouseEffectStrings from '../../GreenhouseEffectStrings.js';
const spectrumWindowCyclesPerSecondUnitsStringProperty = GreenhouseEffectStrings.SpectrumWindow.cyclesPerSecondUnitsStringProperty;
const spectrumWindowFrequencyArrowLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.frequencyArrowLabelStringProperty;
const spectrumWindowGammaRayBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.gammaRayBandLabelStringProperty;
const spectrumWindowInfraredBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.infraredBandLabelStringProperty;
const spectrumWindowMetersUnitsStringProperty = GreenhouseEffectStrings.SpectrumWindow.metersUnitsStringProperty;
const spectrumWindowMicrowaveBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.microwaveBandLabelStringProperty;
const spectrumWindowRadioBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.radioBandLabelStringProperty;
const spectrumWindowTitleStringProperty = GreenhouseEffectStrings.SpectrumWindow.titleStringProperty;
const spectrumWindowUltravioletBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.ultravioletBandLabelStringProperty;
const spectrumWindowVisibleBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.visibleBandLabelStringProperty;
const spectrumWindowWavelengthArrowLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.wavelengthArrowLabelStringProperty;
const spectrumWindowXrayBandLabelStringProperty = GreenhouseEffectStrings.SpectrumWindow.xrayBandLabelStringProperty;
const spectrumWindowDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowDescriptionStringProperty;
const spectrumWindowEnergyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowEnergyDescriptionStringProperty;
const spectrumWindowSinWaveDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowSinWaveDescriptionStringProperty;
const spectrumWindowLabelledSpectrumLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumLabelStringProperty;
const spectrumWindowLabelledSpectrumDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumDescriptionStringProperty;
const spectrumWindowLabelledSpectrumRadioLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumRadioLabelStringProperty;
const spectrumWindowLabelledSpectrumMicrowaveLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumMicrowaveLabelStringProperty;
const spectrumWindowLabelledSpectrumInfraredLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumInfraredLabelStringProperty;
const spectrumWindowLabelledSpectrumVisibleLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumVisibleLabelStringProperty;
const spectrumWindowLabelledSpectrumUltravioletLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumUltravioletLabelStringProperty;
const spectrumWindowLabelledSpectrumXRayLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumXRayLabelStringProperty;
const spectrumWindowLabelledSpectrumGammaRayLabelStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumGammaRayLabelStringProperty;
const spectrumWindowLabelledSpectrumRadioFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumRadioFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumRadioWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumRadioWavelengthDescriptionStringProperty;
const spectrumWindowLabelledSpectrumMicrowaveFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumMicrowaveFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumMicrowaveWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumMicrowaveWavelengthDescriptionStringProperty;
const spectrumWindowLabelledSpectrumInfraredFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumInfraredFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumInfraredWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumInfraredWavelengthDescriptionStringProperty;
const spectrumWindowLabelledSpectrumVisibleFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumVisibleFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumVisibleWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumVisibleWavelengthDescriptionStringProperty;
const spectrumWindowLabelledSpectrumVisibleGraphicalDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumVisibleGraphicalDescriptionStringProperty;
const spectrumWindowLabelledSpectrumUltravioletFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumUltravioletFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumUltravioletWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumUltravioletWavelengthDescriptionStringProperty;
const spectrumWindowLabelledSpectrumXRayFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumXRayFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumXRayWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumXRayWavelengthDescriptionStringProperty;
const spectrumWindowLabelledSpectrumGammaRayFrequencyDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumGammaRayFrequencyDescriptionStringProperty;
const spectrumWindowLabelledSpectrumGammaRayWavelengthDescriptionStringProperty = GreenhouseEffectStrings.a11y.spectrumWindowLabelledSpectrumGammaRayWavelengthDescriptionStringProperty;

// shared constants
const LABEL_FONT = new PhetFont(21);
const SUBSECTION_WIDTH = 657; // width of each subsection on the window (arrows, chirp node, and labeled diagram).
const MAX_UNITS_WIDTH = SUBSECTION_WIDTH / 10; // maximum width of units text, necessary for long translated units strings.

// constants for LabeledSpectrumNode
const STRIP_HEIGHT = 87;
const MIN_FREQUENCY = 1E3;
const MAX_FREQUENCY = 1E21;
const TICK_MARK_HEIGHT = 11;
const TICK_MARK_FONT = new PhetFont(14.7);

// constants for labeledArrow
const ARROW_HEAD_HEIGHT = 54;
const ARROW_HEAD_WIDTH = 54;
const ARROW_TAIL_WIDTH = 34;
class SpectrumDiagram extends VBox {
  /**
   * Class that contains the diagram of the EM spectrum.  This class includes the arrows, the spectrum strip, the
   * wavelength indicator, etc.  In other words, it is the top level node within which the constituent parts that make
   * up the entire diagram are contained.
   *
   */
  constructor(tandem) {
    const children = [];

    // Add the title and scale for translations.
    const title = new Text(spectrumWindowTitleStringProperty, {
      font: new PhetFont(40),
      tagName: 'h1',
      innerContent: spectrumWindowTitleStringProperty.value,
      descriptionTagName: 'p',
      descriptionContent: spectrumWindowDescriptionStringProperty.value,
      // a general description for the entirety of the Dialog content
      appendDescription: true
    });
    if (title.width > SUBSECTION_WIDTH) {
      title.scale(SUBSECTION_WIDTH / title.width);
    }
    children.push(title);

    // Add the frequency arrow.
    const frequencyArrow = new LabeledArrow(SUBSECTION_WIDTH, 'right', spectrumWindowFrequencyArrowLabelStringProperty.value, 'white', 'rgb(5, 255,  255)', tandem.createTandem('frequencyArrow'), {
      tagName: 'p',
      innerContent: spectrumWindowEnergyDescriptionStringProperty.value
    });
    children.push(frequencyArrow);

    // Add the spectrum portion.
    const spectrum = new LabeledSpectrumNode(tandem.createTandem('spectrum'));
    children.push(spectrum);

    // Add the wavelength arrow.
    const wavelengthArrow = new LabeledArrow(SUBSECTION_WIDTH, 'left', spectrumWindowWavelengthArrowLabelStringProperty.value, 'white', 'rgb(255, 5, 255)', tandem.createTandem('wavelengthArrow'));
    children.push(wavelengthArrow);

    // Add the diagram that depicts the wave that gets shorter.
    const decreasingWavelengthNode = new ChirpNode({
      tagName: 'p',
      innerContent: spectrumWindowSinWaveDescriptionStringProperty.value
    });
    children.push(decreasingWavelengthNode);
    super({
      children: children,
      spacing: 20,
      // pdom
      tagName: 'div' // so that this Node can be aria-labelledby the title
    });

    // pdom - set label association so the title is read when focus enters the dialog
    this.addAriaLabelledbyAssociation({
      thisElementName: PDOMPeer.PRIMARY_SIBLING,
      otherNode: title,
      otherElementName: PDOMPeer.PRIMARY_SIBLING
    });

    // pdom - in descriptions, the decreasing wavelength comes before the spectrum
    this.pdomOrder = [title, frequencyArrow, decreasingWavelengthNode, spectrum];
  }
}

// @static
SpectrumDiagram.SUBSECTION_WIDTH = SUBSECTION_WIDTH;
greenhouseEffect.register('SpectrumDiagram', SpectrumDiagram);

/**
 * The labeled arrow in the spectrum window.
 */
class LabeledArrow extends ArrowNode {
  /**
   * @param {number} length - Length of the arrow
   * @param {string} orientation - options are 'left' or 'right'.  Determines direction of the arrow.
   * @param {string} captionText - Description of what the arrow node represents.
   * @param {string} leftColor
   * @param {string} rightColor
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(length, orientation, captionText, leftColor, rightColor, tandem, options) {
    options = merge({
      headHeight: ARROW_HEAD_HEIGHT,
      headWidth: ARROW_HEAD_WIDTH,
      tailWidth: ARROW_TAIL_WIDTH,
      lineWidth: 2.5,
      tandem: tandem
    }, options);
    const Orientation = {
      POINTING_LEFT: 'left',
      POINTING_RIGHT: 'right'
    };

    // Set arrow direction and fill based on desired orientation.
    let gradientPaint;
    // Point the node in the right direction.
    if (orientation === Orientation.POINTING_LEFT) {
      gradientPaint = new LinearGradient(0, 0, -length, 0).addColorStop(0, leftColor).addColorStop(1, rightColor);
      length = -length; // Negate the x component of the arrow head so that it points left.
    } else {
      assert && assert(orientation === Orientation.POINTING_RIGHT);
      gradientPaint = new LinearGradient(0, 0, length, 0).addColorStop(0, leftColor).addColorStop(1, rightColor);
    }
    assert && assert(options.fill === undefined, 'LabeledArrow sets fill');
    options.fill = gradientPaint;
    super(0, 0, length, 0, options);

    // Create and add the textual label.  Scale it so that it can handle translations.  Max label length is the arrow
    // length minus twice the head length.
    const label = new Text(captionText, {
      font: LABEL_FONT
    });
    if (label.width > this.width - 2 * ARROW_HEAD_WIDTH) {
      label.scale((this.width - 2 * ARROW_HEAD_WIDTH) / label.width);
    }
    label.center = this.center;
    this.addChild(label);
  }
}
greenhouseEffect.register('LabeledArrow', LabeledArrow);
class LabeledSpectrumNode extends Node {
  /**
   * Class that depicts the frequencies and wavelengths of the EM spectrum and labels the subsections
   * (e.g. "Infrared").
   *
   */
  constructor(tandem) {
    // Supertype constructor
    super({
      // the LabeledSpectrumNode is represented as a nested list describing the various ranges of wavelengths and frequencies
      tagName: 'ul',
      labelTagName: 'h2',
      labelContent: spectrumWindowLabelledSpectrumLabelStringProperty.value,
      descriptionTagName: 'p',
      descriptionContent: spectrumWindowLabelledSpectrumDescriptionStringProperty.value
    });

    // Create the "strip", which is the solid background portions that contains the different bands and that has tick
    // marks on the top and bottom.
    const strip = new Rectangle(0, 0, SUBSECTION_WIDTH, STRIP_HEIGHT, {
      fill: 'rgb(237, 243, 246)',
      lineWidth: 2.5,
      stroke: 'black'
    });
    this.addChild(strip);

    // Add the frequency tick marks to the top of the spectrum strip.
    for (let i = 4; i <= 20; i++) {
      const includeFrequencyLabel = i % 2 === 0;
      addFrequencyTickMark(this, Math.pow(10, i), strip.top, includeFrequencyLabel);
    }

    // Add the wavelength tick marks to the bottom of the spectrum.
    for (let j = -12; j <= 4; j++) {
      const includeWavelengthLabel = j % 2 === 0;
      addWavelengthTickMark(this, Math.pow(10, j), strip.bottom, includeWavelengthLabel);
    }

    // Add the various bands, labels include PDOM descriptions
    addBandLabel(this, 1E3, 1E9, spectrumWindowRadioBandLabelStringProperty.value, spectrumWindowLabelledSpectrumRadioLabelStringProperty.value, spectrumWindowLabelledSpectrumRadioFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumRadioWavelengthDescriptionStringProperty.value, tandem.createTandem('radioBandLabelText'));
    addBandDivider(this, 1E9);
    addBandLabel(this, 1E9, 3E11, spectrumWindowMicrowaveBandLabelStringProperty.value, spectrumWindowLabelledSpectrumMicrowaveLabelStringProperty.value, spectrumWindowLabelledSpectrumMicrowaveFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumMicrowaveWavelengthDescriptionStringProperty.value, tandem.createTandem('microwaveBandLabelText'));
    addBandDivider(this, 3E11);
    addBandLabel(this, 3E11, 6E14, spectrumWindowInfraredBandLabelStringProperty.value, spectrumWindowLabelledSpectrumInfraredLabelStringProperty.value, spectrumWindowLabelledSpectrumInfraredFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumInfraredWavelengthDescriptionStringProperty.value, tandem.createTandem('infraredBandLabelText'));

    // Add the visible spectrum, in order for PDOM descriptions
    const visSpectrumWidth = Utils.roundSymmetric(getOffsetFromFrequency(790E12) - getOffsetFromFrequency(400E12));
    const wavelengthSpectrumNode = new WavelengthSpectrumNode({
      size: new Dimension2(visSpectrumWidth, STRIP_HEIGHT - 2)
    });
    wavelengthSpectrumNode.rotate(Math.PI); // Flip the visible spectrum so that it is represented correctly in the diagram.
    wavelengthSpectrumNode.leftTop = new Vector2(getOffsetFromFrequency(400E12), strip.top + strip.lineWidth);
    this.addChild(wavelengthSpectrumNode);
    addBandLabel(this, 1E15, 8E15, spectrumWindowUltravioletBandLabelStringProperty.value, spectrumWindowLabelledSpectrumUltravioletLabelStringProperty.value, spectrumWindowLabelledSpectrumUltravioletFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumUltravioletWavelengthDescriptionStringProperty.value, tandem.createTandem('ultravioletBandLabelText'));
    addBandDivider(this, 1E16);
    addBandLabel(this, 1E16, 1E19, spectrumWindowXrayBandLabelStringProperty.value, spectrumWindowLabelledSpectrumXRayLabelStringProperty.value, spectrumWindowLabelledSpectrumXRayFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumXRayWavelengthDescriptionStringProperty.value, tandem.createTandem('xrayBandLabelText'));
    addBandDivider(this, 1E19);
    addBandLabel(this, 1E19, 1E21, spectrumWindowGammaRayBandLabelStringProperty.value, spectrumWindowLabelledSpectrumGammaRayLabelStringProperty.value, spectrumWindowLabelledSpectrumGammaRayFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumGammaRayWavelengthDescriptionStringProperty.value, tandem.createTandem('gammaRayBandLabelText'));
    addFrequencyAndLabelDescriptions(wavelengthSpectrumNode, spectrumWindowLabelledSpectrumVisibleLabelStringProperty.value, spectrumWindowLabelledSpectrumVisibleFrequencyDescriptionStringProperty.value, spectrumWindowLabelledSpectrumVisibleWavelengthDescriptionStringProperty.value, {
      graphicalDescription: spectrumWindowLabelledSpectrumVisibleGraphicalDescriptionStringProperty.value
    });

    // Add the label for the visible band.  Scale it down for translations.
    const visibleBandLabel = new Text(spectrumWindowVisibleBandLabelStringProperty.value, {
      font: new PhetFont(16)
    });
    const visibleBandCenterX = wavelengthSpectrumNode.centerX;
    if (visibleBandLabel.width > strip.width / 2) {
      visibleBandLabel.scale(strip.width / 2 / visibleBandLabel.width);
    }
    visibleBandLabel.center = new Vector2(visibleBandCenterX, -47);
    this.addChild(visibleBandLabel);

    // Add the arrow that connects the visible band label to the visible band itself.
    const visibleBandArrow = new ArrowNode(visibleBandCenterX, visibleBandLabel.bottom, visibleBandCenterX, -5, {
      tailWidth: 3,
      headWidth: 9,
      headHeight: 9,
      tandem: tandem.createTandem('visibleBandArrow')
    });
    this.addChild(visibleBandArrow);

    // Add the units and scale for translations
    const scaleUnits = text => {
      if (text.width > MAX_UNITS_WIDTH) {
        text.scale(MAX_UNITS_WIDTH / text.width);
      }
    };
    const frequencyUnits = new Text(spectrumWindowCyclesPerSecondUnitsStringProperty.value, {
      font: LABEL_FONT
    });
    scaleUnits(frequencyUnits);
    frequencyUnits.leftCenter = new Vector2(SUBSECTION_WIDTH, -TICK_MARK_HEIGHT - frequencyUnits.height / 2);
    this.addChild(frequencyUnits);
    const wavelengthUnits = new Text(spectrumWindowMetersUnitsStringProperty.value, {
      font: LABEL_FONT
    });
    scaleUnits(wavelengthUnits);
    wavelengthUnits.leftCenter = new Vector2(SUBSECTION_WIDTH, STRIP_HEIGHT + TICK_MARK_HEIGHT + frequencyUnits.height / 2);
    this.addChild(wavelengthUnits);

    // workaround for iOS Safari, which has a bug that pronounces the nested list item role as "unpronouncable" -
    // removing the default bullet style and setting the role explicitly gets around the problem
    this.ariaRole = 'list';
    this.setPDOMAttribute('style', 'list-style: none;');
  }
}

// functions for LabeledSpectrumNode
/**
 * Convert the given frequency to an offset from the left edge of the spectrum strip.
 *
 * @param {number} frequency - Frequency in Hz.
 * @returns {number}
 */
const getOffsetFromFrequency = frequency => {
  assert && assert(frequency >= MIN_FREQUENCY && frequency <= MAX_FREQUENCY);
  const logarithmicRange = log10(MAX_FREQUENCY) - log10(MIN_FREQUENCY);
  const logarithmicFrequency = log10(frequency);
  return (logarithmicFrequency - log10(MIN_FREQUENCY)) / logarithmicRange * SUBSECTION_WIDTH;
};

/**
 * Create a label for the tick marks on the spectrum diagram.
 *
 * @param {number} value -  Wavelength or frequency to be described by the label.
 * @returns {RichText}
 */
const createExponentialLabel = value => {
  const superscript = Utils.roundSymmetric(log10(value));
  return new RichText(`10<sup>${superscript}</sup>`, {
    font: TICK_MARK_FONT,
    supScale: 0.65,
    supYOffset: 1
  });
};

/**
 * Convert the given wavelength to an offset from the left edge of the spectrum strip.  The frequency of an
 * electromagnetic wave is equal to the speed of light divided by the wavelength.
 *
 * @param {number} wavelength - wavelength in meters
 * @returns {number}
 */
const getOffsetFromWavelength = wavelength => {
  // The constant 299792458 is equal to the speed of light in meters per second.
  return getOffsetFromFrequency(299792458 / wavelength);
};

/**
 * Calculate the log base 10 of a value.
 *
 * @param value
 * @returns {number}
 */
const log10 = value => {
  return Math.log(value) / Math.LN10;
};

/**
 * Add a tick mark for the specified frequency.  Frequency tick marks go on top of the strip.
 *
 * @param {LabeledSpectrumNode} thisNode
 * @param {number} frequency
 * @param {boolean} addLabel - Whether a label should be added to the tick mark.
 * @param {number} bottom - bottom y position of the tick mark.  x position calculated with getOffsetFromFrequency()
 */
const addFrequencyTickMark = (thisNode, frequency, bottom, addLabel) => {
  // Create and add the tick mark line.
  const tickMarkNode = new Line(0, 0, 0, -TICK_MARK_HEIGHT, {
    stroke: 'black',
    lineWidth: 2
  });
  tickMarkNode.centerBottom = new Vector2(getOffsetFromFrequency(frequency), bottom);
  thisNode.addChild(tickMarkNode);
  if (addLabel) {
    // Create and add the label.
    const label = createExponentialLabel(frequency);
    // Calculate x offset for label.  Allows the base number of the label to centered with the tick mark.
    const xOffset = new Text('10', {
      font: TICK_MARK_FONT
    }).width / 2;
    label.leftCenter = new Vector2(tickMarkNode.centerX - xOffset, tickMarkNode.top - label.height / 2);
    thisNode.addChild(label);
  }
};

/**
 * Add a tick mark for the specified wavelength.  Wavelength tick marks go on the bottom of the strip.
 *
 * @param {LabeledSpectrumNode} thisNode
 * @param {number} wavelength
 * * @param {number} top
 * @param {boolean} addLabel
 */
const addWavelengthTickMark = (thisNode, wavelength, top, addLabel) => {
  // Create and add the tick mark line.
  const tickMarkNode = new Line(0, 0, 0, TICK_MARK_HEIGHT, {
    stroke: 'black',
    lineWidth: 2
  });
  tickMarkNode.centerTop = new Vector2(getOffsetFromWavelength(wavelength), top);
  thisNode.addChild(tickMarkNode);
  if (addLabel) {
    // Create and add the label.
    const label = createExponentialLabel(wavelength);
    // Calculate x offset for label.  Allows the base number of the label to be centered with the tick mark.
    label.center = new Vector2(tickMarkNode.centerX, tickMarkNode.top + label.height + 2);
    thisNode.addChild(label);
  }
};

/**
 * Add a label to a band which sections the spectrum diagram.  Using VBox will format the strings so that new
 * lines do not need to be coded with HTML.
 *
 * @param {LabeledSpectrumNode} thisNode
 * @param {number} lowEndFrequency
 * @param {number} highEndFrequency
 * @param {string} labelString - label string describing the band on the electromagnetic spectrum.
 * @param {string} pdomLabel - label for the content in the PDOM
 * @param {string} frequencyDescription - describes the range of frequencies in the PDOM
 * @param {string} wavelengthDescription - describes the range of wavelengths in the PDOM
 * @param {Tandem} tandem
 */
const addBandLabel = (thisNode, lowEndFrequency, highEndFrequency, labelString, pdomLabel, frequencyDescription, wavelengthDescription, tandem) => {
  // Argument validation.
  assert && assert(highEndFrequency >= lowEndFrequency);

  // Set up values needed for calculations.
  const leftBoundaryX = getOffsetFromFrequency(lowEndFrequency);
  const rightBoundaryX = getOffsetFromFrequency(highEndFrequency);
  const width = rightBoundaryX - leftBoundaryX;
  const centerX = leftBoundaryX + width / 2;

  // Create and add the label.
  const labelText = new RichText(labelString, {
    replaceNewlines: true,
    align: 'center',
    font: LABEL_FONT,
    tandem: tandem
  });
  thisNode.addChild(labelText);
  if (labelText.width + 10 > width) {
    // Scale the label to fit with a little bit of padding on each side.
    labelText.scale(width / (labelText.width + 10));
  }
  labelText.setCenter(new Vector2(centerX, STRIP_HEIGHT / 2));

  // pdom
  addFrequencyAndLabelDescriptions(labelText, pdomLabel, frequencyDescription, wavelengthDescription);
};

/**
 * Add a "band divider" at the given frequency.  A band divider is a dotted line that spans the spectrum strip in
 * the vertical direction.
 *
 * @param{LabeledSpectrumNode} thisNode
 * @param {number} frequency
 */
const addBandDivider = (thisNode, frequency) => {
  const drawDividerSegment = () => new Line(0, 0, 0, STRIP_HEIGHT / 9, {
    stroke: 'black',
    lineWidth: 2.5
  });
  for (let i = 0; i < 5; i++) {
    const dividerSegment = drawDividerSegment();
    dividerSegment.centerTop = new Vector2(getOffsetFromFrequency(frequency), 2 * i * STRIP_HEIGHT / 9);
    thisNode.addChild(dividerSegment);
  }
};

/**
 * Sets and decorates the Node with accessible content describing the wavelengths and frequencies of a particular range.
 * @param {Node} node
 * @param {string} label
 * @param {string} frequencyDescription
 * @param {string} wavelengthDescription
 * @param {Object} [options]
 */
const addFrequencyAndLabelDescriptions = (node, label, frequencyDescription, wavelengthDescription, options) => {
  options = merge({
    // {string|null} optional description for the graphical representation in the simulation for this range of frequency/wavelength
    graphicalDescription: null
  }, options);

  // assumes that some ancestor of the Node is an unordered list
  node.containerTagName = 'li';
  node.tagName = 'ul';
  node.labelTagName = 'span';
  node.labelContent = label;

  // workaround for iOS Safari, which has a bug that pronounces the nested list item role as "unpronouncable" -
  // removing the default bullet style and setting the role explicitly gets around the problem
  node.ariaRole = 'list';
  node.setPDOMAttribute('style', 'list-style: none;');
  if (options.graphicalDescription) {
    node.addChild(new Node({
      tagName: 'li',
      innerContent: options.graphicalDescription
    }));
  }

  // add to the nested list
  node.addChild(new Node({
    tagName: 'li',
    innerContent: frequencyDescription
  }));
  node.addChild(new Node({
    tagName: 'li',
    innerContent: wavelengthDescription
  }));
};
class ChirpNode extends Rectangle {
  /**
   *  Class that depicts a wave that gets progressively shorter in wavelength from left to right, which is called a
   *  chirp.
   *
   *  @constructor
   */
  constructor(options) {
    options = merge({
      fill: 'rgb(237, 243, 246)',
      lineWidth: 2.5,
      stroke: 'black'
    }, options);

    // Create and add the boundary and background.
    const boundingBoxHeight = SUBSECTION_WIDTH * 0.1; // Arbitrary, adjust as needed.
    super(0, 0, SUBSECTION_WIDTH, boundingBoxHeight, options);
    const chirpShape = new Shape();
    chirpShape.moveTo(0, this.centerY); // Move starting point to left center of bounding box.
    const numPointsOnLine = 1500;
    for (let i = 0; i < numPointsOnLine; i++) {
      const x = i * (SUBSECTION_WIDTH / (numPointsOnLine - 1));
      const t = x / SUBSECTION_WIDTH;
      const f0 = 1;
      const k = 2;
      const tScale = 4.5;
      const sinTerm = Math.sin(2 * Math.PI * f0 * (Math.pow(k, t * tScale) - 1) / Math.log(k));
      const y = sinTerm * boundingBoxHeight * 0.40 + boundingBoxHeight / 2;
      chirpShape.lineTo(x, y);
    }

    // Create the chirp node, but create it first with a null shape, then override computeShapeBounds, then set the
    // shape.  This makes the creation of this node far faster.
    const chirpNode = new Path(null, {
      lineWidth: 2.5,
      stroke: 'black',
      lineJoin: 'bevel'
    });
    chirpNode.computeShapeBounds = () => chirpShape.bounds.dilated(4);
    chirpNode.shape = chirpShape;
    this.addChild(chirpNode);
  }
}
export default SpectrumDiagram;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJWZWN0b3IyIiwiU2hhcGUiLCJtZXJnZSIsIkFycm93Tm9kZSIsIlBoZXRGb250IiwiV2F2ZWxlbmd0aFNwZWN0cnVtTm9kZSIsIkxpbmUiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUERPTVBlZXIiLCJSZWN0YW5nbGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWQm94IiwiZ3JlZW5ob3VzZUVmZmVjdCIsIkdyZWVuaG91c2VFZmZlY3RTdHJpbmdzIiwic3BlY3RydW1XaW5kb3dDeWNsZXNQZXJTZWNvbmRVbml0c1N0cmluZ1Byb3BlcnR5IiwiU3BlY3RydW1XaW5kb3ciLCJjeWNsZXNQZXJTZWNvbmRVbml0c1N0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dGcmVxdWVuY3lBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHkiLCJmcmVxdWVuY3lBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0dhbW1hUmF5QmFuZExhYmVsU3RyaW5nUHJvcGVydHkiLCJnYW1tYVJheUJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dJbmZyYXJlZEJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5IiwiaW5mcmFyZWRCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TWV0ZXJzVW5pdHNTdHJpbmdQcm9wZXJ0eSIsIm1ldGVyc1VuaXRzU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd01pY3Jvd2F2ZUJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5IiwibWljcm93YXZlQmFuZExhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd1JhZGlvQmFuZExhYmVsU3RyaW5nUHJvcGVydHkiLCJyYWRpb0JhbmRMYWJlbFN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dUaXRsZVN0cmluZ1Byb3BlcnR5IiwidGl0bGVTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93VWx0cmF2aW9sZXRCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInVsdHJhdmlvbGV0QmFuZExhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd1Zpc2libGVCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInZpc2libGVCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93V2F2ZWxlbmd0aEFycm93TGFiZWxTdHJpbmdQcm9wZXJ0eSIsIndhdmVsZW5ndGhBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd1hyYXlCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInhyYXlCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImExMXkiLCJzcGVjdHJ1bVdpbmRvd0VuZXJneURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd1NpbldhdmVEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtTGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1SYWRpb0xhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1NaWNyb3dhdmVMYWJlbFN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtSW5mcmFyZWRMYWJlbFN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVmlzaWJsZUxhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1VbHRyYXZpb2xldExhYmVsU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1YUmF5TGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUdhbW1hUmF5TGFiZWxTdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVJhZGlvRnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVJhZGlvV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1NaWNyb3dhdmVGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtTWljcm93YXZlV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1JbmZyYXJlZEZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1JbmZyYXJlZFdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5Iiwic3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVmlzaWJsZUZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1WaXNpYmxlV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1WaXNpYmxlR3JhcGhpY2FsRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVVsdHJhdmlvbGV0RnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVVsdHJhdmlvbGV0V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1YUmF5RnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVhSYXlXYXZlbGVuZ3RoRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUdhbW1hUmF5RnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsInNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUdhbW1hUmF5V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJMQUJFTF9GT05UIiwiU1VCU0VDVElPTl9XSURUSCIsIk1BWF9VTklUU19XSURUSCIsIlNUUklQX0hFSUdIVCIsIk1JTl9GUkVRVUVOQ1kiLCJNQVhfRlJFUVVFTkNZIiwiVElDS19NQVJLX0hFSUdIVCIsIlRJQ0tfTUFSS19GT05UIiwiQVJST1dfSEVBRF9IRUlHSFQiLCJBUlJPV19IRUFEX1dJRFRIIiwiQVJST1dfVEFJTF9XSURUSCIsIlNwZWN0cnVtRGlhZ3JhbSIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwiY2hpbGRyZW4iLCJ0aXRsZSIsImZvbnQiLCJ0YWdOYW1lIiwiaW5uZXJDb250ZW50IiwidmFsdWUiLCJkZXNjcmlwdGlvblRhZ05hbWUiLCJkZXNjcmlwdGlvbkNvbnRlbnQiLCJhcHBlbmREZXNjcmlwdGlvbiIsIndpZHRoIiwic2NhbGUiLCJwdXNoIiwiZnJlcXVlbmN5QXJyb3ciLCJMYWJlbGVkQXJyb3ciLCJjcmVhdGVUYW5kZW0iLCJzcGVjdHJ1bSIsIkxhYmVsZWRTcGVjdHJ1bU5vZGUiLCJ3YXZlbGVuZ3RoQXJyb3ciLCJkZWNyZWFzaW5nV2F2ZWxlbmd0aE5vZGUiLCJDaGlycE5vZGUiLCJzcGFjaW5nIiwiYWRkQXJpYUxhYmVsbGVkYnlBc3NvY2lhdGlvbiIsInRoaXNFbGVtZW50TmFtZSIsIlBSSU1BUllfU0lCTElORyIsIm90aGVyTm9kZSIsIm90aGVyRWxlbWVudE5hbWUiLCJwZG9tT3JkZXIiLCJyZWdpc3RlciIsImxlbmd0aCIsIm9yaWVudGF0aW9uIiwiY2FwdGlvblRleHQiLCJsZWZ0Q29sb3IiLCJyaWdodENvbG9yIiwib3B0aW9ucyIsImhlYWRIZWlnaHQiLCJoZWFkV2lkdGgiLCJ0YWlsV2lkdGgiLCJsaW5lV2lkdGgiLCJPcmllbnRhdGlvbiIsIlBPSU5USU5HX0xFRlQiLCJQT0lOVElOR19SSUdIVCIsImdyYWRpZW50UGFpbnQiLCJhZGRDb2xvclN0b3AiLCJhc3NlcnQiLCJmaWxsIiwidW5kZWZpbmVkIiwibGFiZWwiLCJjZW50ZXIiLCJhZGRDaGlsZCIsImxhYmVsVGFnTmFtZSIsImxhYmVsQ29udGVudCIsInN0cmlwIiwic3Ryb2tlIiwiaSIsImluY2x1ZGVGcmVxdWVuY3lMYWJlbCIsImFkZEZyZXF1ZW5jeVRpY2tNYXJrIiwiTWF0aCIsInBvdyIsInRvcCIsImoiLCJpbmNsdWRlV2F2ZWxlbmd0aExhYmVsIiwiYWRkV2F2ZWxlbmd0aFRpY2tNYXJrIiwiYm90dG9tIiwiYWRkQmFuZExhYmVsIiwiYWRkQmFuZERpdmlkZXIiLCJ2aXNTcGVjdHJ1bVdpZHRoIiwicm91bmRTeW1tZXRyaWMiLCJnZXRPZmZzZXRGcm9tRnJlcXVlbmN5Iiwid2F2ZWxlbmd0aFNwZWN0cnVtTm9kZSIsInNpemUiLCJyb3RhdGUiLCJQSSIsImxlZnRUb3AiLCJhZGRGcmVxdWVuY3lBbmRMYWJlbERlc2NyaXB0aW9ucyIsImdyYXBoaWNhbERlc2NyaXB0aW9uIiwidmlzaWJsZUJhbmRMYWJlbCIsInZpc2libGVCYW5kQ2VudGVyWCIsImNlbnRlclgiLCJ2aXNpYmxlQmFuZEFycm93Iiwic2NhbGVVbml0cyIsInRleHQiLCJmcmVxdWVuY3lVbml0cyIsImxlZnRDZW50ZXIiLCJoZWlnaHQiLCJ3YXZlbGVuZ3RoVW5pdHMiLCJhcmlhUm9sZSIsInNldFBET01BdHRyaWJ1dGUiLCJmcmVxdWVuY3kiLCJsb2dhcml0aG1pY1JhbmdlIiwibG9nMTAiLCJsb2dhcml0aG1pY0ZyZXF1ZW5jeSIsImNyZWF0ZUV4cG9uZW50aWFsTGFiZWwiLCJzdXBlcnNjcmlwdCIsInN1cFNjYWxlIiwic3VwWU9mZnNldCIsImdldE9mZnNldEZyb21XYXZlbGVuZ3RoIiwid2F2ZWxlbmd0aCIsImxvZyIsIkxOMTAiLCJ0aGlzTm9kZSIsImFkZExhYmVsIiwidGlja01hcmtOb2RlIiwiY2VudGVyQm90dG9tIiwieE9mZnNldCIsImNlbnRlclRvcCIsImxvd0VuZEZyZXF1ZW5jeSIsImhpZ2hFbmRGcmVxdWVuY3kiLCJsYWJlbFN0cmluZyIsInBkb21MYWJlbCIsImZyZXF1ZW5jeURlc2NyaXB0aW9uIiwid2F2ZWxlbmd0aERlc2NyaXB0aW9uIiwibGVmdEJvdW5kYXJ5WCIsInJpZ2h0Qm91bmRhcnlYIiwibGFiZWxUZXh0IiwicmVwbGFjZU5ld2xpbmVzIiwiYWxpZ24iLCJzZXRDZW50ZXIiLCJkcmF3RGl2aWRlclNlZ21lbnQiLCJkaXZpZGVyU2VnbWVudCIsIm5vZGUiLCJjb250YWluZXJUYWdOYW1lIiwiYm91bmRpbmdCb3hIZWlnaHQiLCJjaGlycFNoYXBlIiwibW92ZVRvIiwiY2VudGVyWSIsIm51bVBvaW50c09uTGluZSIsIngiLCJ0IiwiZjAiLCJrIiwidFNjYWxlIiwic2luVGVybSIsInNpbiIsInkiLCJsaW5lVG8iLCJjaGlycE5vZGUiLCJsaW5lSm9pbiIsImNvbXB1dGVTaGFwZUJvdW5kcyIsImJvdW5kcyIsImRpbGF0ZWQiLCJzaGFwZSJdLCJzb3VyY2VzIjpbIlNwZWN0cnVtRGlhZ3JhbS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGNsYXNzIGRlZmluZXMgYSBzZXBhcmF0ZSB3aW5kb3cgdGhhdCBzaG93cyBhIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlbGVjdHJvbWFnbmV0aWMgc3BlY3RydW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBBcnJvd05vZGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93Tm9kZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgV2F2ZWxlbmd0aFNwZWN0cnVtTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvV2F2ZWxlbmd0aFNwZWN0cnVtTm9kZS5qcyc7XHJcbmltcG9ydCB7IExpbmUsIExpbmVhckdyYWRpZW50LCBOb2RlLCBQYXRoLCBQRE9NUGVlciwgUmVjdGFuZ2xlLCBSaWNoVGV4dCwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBncmVlbmhvdXNlRWZmZWN0IGZyb20gJy4uLy4uL2dyZWVuaG91c2VFZmZlY3QuanMnO1xyXG5pbXBvcnQgR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MgZnJvbSAnLi4vLi4vR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuanMnO1xyXG5cclxuY29uc3Qgc3BlY3RydW1XaW5kb3dDeWNsZXNQZXJTZWNvbmRVbml0c1N0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuU3BlY3RydW1XaW5kb3cuY3ljbGVzUGVyU2Vjb25kVW5pdHNTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dGcmVxdWVuY3lBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5TcGVjdHJ1bVdpbmRvdy5mcmVxdWVuY3lBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93R2FtbWFSYXlCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLlNwZWN0cnVtV2luZG93LmdhbW1hUmF5QmFuZExhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93SW5mcmFyZWRCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLlNwZWN0cnVtV2luZG93LmluZnJhcmVkQmFuZExhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TWV0ZXJzVW5pdHNTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLlNwZWN0cnVtV2luZG93Lm1ldGVyc1VuaXRzU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TWljcm93YXZlQmFuZExhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5TcGVjdHJ1bVdpbmRvdy5taWNyb3dhdmVCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dSYWRpb0JhbmRMYWJlbFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuU3BlY3RydW1XaW5kb3cucmFkaW9CYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dUaXRsZVN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuU3BlY3RydW1XaW5kb3cudGl0bGVTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dVbHRyYXZpb2xldEJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuU3BlY3RydW1XaW5kb3cudWx0cmF2aW9sZXRCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dWaXNpYmxlQmFuZExhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5TcGVjdHJ1bVdpbmRvdy52aXNpYmxlQmFuZExhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93V2F2ZWxlbmd0aEFycm93TGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLlNwZWN0cnVtV2luZG93LndhdmVsZW5ndGhBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93WHJheUJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuU3BlY3RydW1XaW5kb3cueHJheUJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzcGVjdHJ1bVdpbmRvd0Rlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dFbmVyZ3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0VuZXJneURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93U2luV2F2ZURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93U2luV2F2ZURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUxhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUxhYmVsU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVJhZGlvTGFiZWxTdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtUmFkaW9MYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1NaWNyb3dhdmVMYWJlbFN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1NaWNyb3dhdmVMYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1JbmZyYXJlZExhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUluZnJhcmVkTGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVmlzaWJsZUxhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVZpc2libGVMYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1VbHRyYXZpb2xldExhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVVsdHJhdmlvbGV0TGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtWFJheUxhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVhSYXlMYWJlbFN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1HYW1tYVJheUxhYmVsU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUdhbW1hUmF5TGFiZWxTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtUmFkaW9GcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1SYWRpb0ZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVJhZGlvV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVJhZGlvV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bU1pY3Jvd2F2ZUZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bU1pY3Jvd2F2ZUZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bU1pY3Jvd2F2ZVdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1NaWNyb3dhdmVXYXZlbGVuZ3RoRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtSW5mcmFyZWRGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1JbmZyYXJlZEZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUluZnJhcmVkV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUluZnJhcmVkV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVZpc2libGVGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1WaXNpYmxlRnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVmlzaWJsZVdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1WaXNpYmxlV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVZpc2libGVHcmFwaGljYWxEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1WaXNpYmxlR3JhcGhpY2FsRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVWx0cmF2aW9sZXRGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1VbHRyYXZpb2xldEZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVVsdHJhdmlvbGV0V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkgPSBHcmVlbmhvdXNlRWZmZWN0U3RyaW5ncy5hMTF5LnNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVVsdHJhdmlvbGV0V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVhSYXlGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1YUmF5RnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtWFJheVdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1YUmF5V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUdhbW1hUmF5RnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSA9IEdyZWVuaG91c2VFZmZlY3RTdHJpbmdzLmExMXkuc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtR2FtbWFSYXlGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5O1xyXG5jb25zdCBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1HYW1tYVJheVdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5ID0gR3JlZW5ob3VzZUVmZmVjdFN0cmluZ3MuYTExeS5zcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1HYW1tYVJheVdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5O1xyXG5cclxuLy8gc2hhcmVkIGNvbnN0YW50c1xyXG5jb25zdCBMQUJFTF9GT05UID0gbmV3IFBoZXRGb250KCAyMSApO1xyXG5jb25zdCBTVUJTRUNUSU9OX1dJRFRIID0gNjU3OyAvLyB3aWR0aCBvZiBlYWNoIHN1YnNlY3Rpb24gb24gdGhlIHdpbmRvdyAoYXJyb3dzLCBjaGlycCBub2RlLCBhbmQgbGFiZWxlZCBkaWFncmFtKS5cclxuY29uc3QgTUFYX1VOSVRTX1dJRFRIID0gU1VCU0VDVElPTl9XSURUSCAvIDEwOyAvLyBtYXhpbXVtIHdpZHRoIG9mIHVuaXRzIHRleHQsIG5lY2Vzc2FyeSBmb3IgbG9uZyB0cmFuc2xhdGVkIHVuaXRzIHN0cmluZ3MuXHJcblxyXG4vLyBjb25zdGFudHMgZm9yIExhYmVsZWRTcGVjdHJ1bU5vZGVcclxuY29uc3QgU1RSSVBfSEVJR0hUID0gODc7XHJcbmNvbnN0IE1JTl9GUkVRVUVOQ1kgPSAxRTM7XHJcbmNvbnN0IE1BWF9GUkVRVUVOQ1kgPSAxRTIxO1xyXG5jb25zdCBUSUNLX01BUktfSEVJR0hUID0gMTE7XHJcbmNvbnN0IFRJQ0tfTUFSS19GT05UID0gbmV3IFBoZXRGb250KCAxNC43ICk7XHJcblxyXG4vLyBjb25zdGFudHMgZm9yIGxhYmVsZWRBcnJvd1xyXG5jb25zdCBBUlJPV19IRUFEX0hFSUdIVCA9IDU0O1xyXG5jb25zdCBBUlJPV19IRUFEX1dJRFRIID0gNTQ7XHJcbmNvbnN0IEFSUk9XX1RBSUxfV0lEVEggPSAzNDtcclxuXHJcbmNsYXNzIFNwZWN0cnVtRGlhZ3JhbSBleHRlbmRzIFZCb3gge1xyXG4gIC8qKlxyXG4gICAqIENsYXNzIHRoYXQgY29udGFpbnMgdGhlIGRpYWdyYW0gb2YgdGhlIEVNIHNwZWN0cnVtLiAgVGhpcyBjbGFzcyBpbmNsdWRlcyB0aGUgYXJyb3dzLCB0aGUgc3BlY3RydW0gc3RyaXAsIHRoZVxyXG4gICAqIHdhdmVsZW5ndGggaW5kaWNhdG9yLCBldGMuICBJbiBvdGhlciB3b3JkcywgaXQgaXMgdGhlIHRvcCBsZXZlbCBub2RlIHdpdGhpbiB3aGljaCB0aGUgY29uc3RpdHVlbnQgcGFydHMgdGhhdCBtYWtlXHJcbiAgICogdXAgdGhlIGVudGlyZSBkaWFncmFtIGFyZSBjb250YWluZWQuXHJcbiAgICpcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gW107XHJcblxyXG4gICAgLy8gQWRkIHRoZSB0aXRsZSBhbmQgc2NhbGUgZm9yIHRyYW5zbGF0aW9ucy5cclxuICAgIGNvbnN0IHRpdGxlID0gbmV3IFRleHQoIHNwZWN0cnVtV2luZG93VGl0bGVTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDQwICksXHJcblxyXG4gICAgICB0YWdOYW1lOiAnaDEnLFxyXG4gICAgICBpbm5lckNvbnRlbnQ6IHNwZWN0cnVtV2luZG93VGl0bGVTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgZGVzY3JpcHRpb25UYWdOYW1lOiAncCcsXHJcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogc3BlY3RydW1XaW5kb3dEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LnZhbHVlLCAvLyBhIGdlbmVyYWwgZGVzY3JpcHRpb24gZm9yIHRoZSBlbnRpcmV0eSBvZiB0aGUgRGlhbG9nIGNvbnRlbnRcclxuICAgICAgYXBwZW5kRGVzY3JpcHRpb246IHRydWVcclxuICAgIH0gKTtcclxuICAgIGlmICggdGl0bGUud2lkdGggPiBTVUJTRUNUSU9OX1dJRFRIICkge1xyXG4gICAgICB0aXRsZS5zY2FsZSggU1VCU0VDVElPTl9XSURUSCAvIHRpdGxlLndpZHRoICk7XHJcbiAgICB9XHJcbiAgICBjaGlsZHJlbi5wdXNoKCB0aXRsZSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZnJlcXVlbmN5IGFycm93LlxyXG4gICAgY29uc3QgZnJlcXVlbmN5QXJyb3cgPSBuZXcgTGFiZWxlZEFycm93KFxyXG4gICAgICBTVUJTRUNUSU9OX1dJRFRILFxyXG4gICAgICAncmlnaHQnLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0ZyZXF1ZW5jeUFycm93TGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgJ3doaXRlJyxcclxuICAgICAgJ3JnYig1LCAyNTUsICAyNTUpJyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2ZyZXF1ZW5jeUFycm93JyApLCB7XHJcblxyXG4gICAgICAgIHRhZ05hbWU6ICdwJyxcclxuICAgICAgICBpbm5lckNvbnRlbnQ6IHNwZWN0cnVtV2luZG93RW5lcmd5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgY2hpbGRyZW4ucHVzaCggZnJlcXVlbmN5QXJyb3cgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHNwZWN0cnVtIHBvcnRpb24uXHJcbiAgICBjb25zdCBzcGVjdHJ1bSA9IG5ldyBMYWJlbGVkU3BlY3RydW1Ob2RlKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3BlY3RydW0nICkgKTtcclxuICAgIGNoaWxkcmVuLnB1c2goIHNwZWN0cnVtICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSB3YXZlbGVuZ3RoIGFycm93LlxyXG4gICAgY29uc3Qgd2F2ZWxlbmd0aEFycm93ID0gbmV3IExhYmVsZWRBcnJvdyhcclxuICAgICAgU1VCU0VDVElPTl9XSURUSCxcclxuICAgICAgJ2xlZnQnLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd1dhdmVsZW5ndGhBcnJvd0xhYmVsU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICd3aGl0ZScsXHJcbiAgICAgICdyZ2IoMjU1LCA1LCAyNTUpJyxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdmVsZW5ndGhBcnJvdycgKVxyXG4gICAgKTtcclxuICAgIGNoaWxkcmVuLnB1c2goIHdhdmVsZW5ndGhBcnJvdyApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZGlhZ3JhbSB0aGF0IGRlcGljdHMgdGhlIHdhdmUgdGhhdCBnZXRzIHNob3J0ZXIuXHJcbiAgICBjb25zdCBkZWNyZWFzaW5nV2F2ZWxlbmd0aE5vZGUgPSBuZXcgQ2hpcnBOb2RlKCB7XHJcbiAgICAgIHRhZ05hbWU6ICdwJyxcclxuICAgICAgaW5uZXJDb250ZW50OiBzcGVjdHJ1bVdpbmRvd1NpbldhdmVEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LnZhbHVlXHJcbiAgICB9ICk7XHJcbiAgICBjaGlsZHJlbi5wdXNoKCBkZWNyZWFzaW5nV2F2ZWxlbmd0aE5vZGUgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogY2hpbGRyZW4sXHJcbiAgICAgIHNwYWNpbmc6IDIwLFxyXG5cclxuICAgICAgLy8gcGRvbVxyXG4gICAgICB0YWdOYW1lOiAnZGl2JyAvLyBzbyB0aGF0IHRoaXMgTm9kZSBjYW4gYmUgYXJpYS1sYWJlbGxlZGJ5IHRoZSB0aXRsZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBkb20gLSBzZXQgbGFiZWwgYXNzb2NpYXRpb24gc28gdGhlIHRpdGxlIGlzIHJlYWQgd2hlbiBmb2N1cyBlbnRlcnMgdGhlIGRpYWxvZ1xyXG4gICAgdGhpcy5hZGRBcmlhTGFiZWxsZWRieUFzc29jaWF0aW9uKCB7XHJcbiAgICAgIHRoaXNFbGVtZW50TmFtZTogUERPTVBlZXIuUFJJTUFSWV9TSUJMSU5HLFxyXG4gICAgICBvdGhlck5vZGU6IHRpdGxlLFxyXG4gICAgICBvdGhlckVsZW1lbnROYW1lOiBQRE9NUGVlci5QUklNQVJZX1NJQkxJTkdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBwZG9tIC0gaW4gZGVzY3JpcHRpb25zLCB0aGUgZGVjcmVhc2luZyB3YXZlbGVuZ3RoIGNvbWVzIGJlZm9yZSB0aGUgc3BlY3RydW1cclxuICAgIHRoaXMucGRvbU9yZGVyID0gWyB0aXRsZSwgZnJlcXVlbmN5QXJyb3csIGRlY3JlYXNpbmdXYXZlbGVuZ3RoTm9kZSwgc3BlY3RydW0gXTtcclxuICB9XHJcblxyXG5cclxufVxyXG5cclxuXHJcbi8vIEBzdGF0aWNcclxuU3BlY3RydW1EaWFncmFtLlNVQlNFQ1RJT05fV0lEVEggPSBTVUJTRUNUSU9OX1dJRFRIO1xyXG5cclxuZ3JlZW5ob3VzZUVmZmVjdC5yZWdpc3RlciggJ1NwZWN0cnVtRGlhZ3JhbScsIFNwZWN0cnVtRGlhZ3JhbSApO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBsYWJlbGVkIGFycm93IGluIHRoZSBzcGVjdHJ1bSB3aW5kb3cuXHJcbiAqL1xyXG5jbGFzcyBMYWJlbGVkQXJyb3cgZXh0ZW5kcyBBcnJvd05vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZW5ndGggLSBMZW5ndGggb2YgdGhlIGFycm93XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWVudGF0aW9uIC0gb3B0aW9ucyBhcmUgJ2xlZnQnIG9yICdyaWdodCcuICBEZXRlcm1pbmVzIGRpcmVjdGlvbiBvZiB0aGUgYXJyb3cuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNhcHRpb25UZXh0IC0gRGVzY3JpcHRpb24gb2Ygd2hhdCB0aGUgYXJyb3cgbm9kZSByZXByZXNlbnRzLlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsZWZ0Q29sb3JcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmlnaHRDb2xvclxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxlbmd0aCwgb3JpZW50YXRpb24sIGNhcHRpb25UZXh0LCBsZWZ0Q29sb3IsIHJpZ2h0Q29sb3IsIHRhbmRlbSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgaGVhZEhlaWdodDogQVJST1dfSEVBRF9IRUlHSFQsXHJcbiAgICAgIGhlYWRXaWR0aDogQVJST1dfSEVBRF9XSURUSCxcclxuICAgICAgdGFpbFdpZHRoOiBBUlJPV19UQUlMX1dJRFRILFxyXG4gICAgICBsaW5lV2lkdGg6IDIuNSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBPcmllbnRhdGlvbiA9IHtcclxuICAgICAgUE9JTlRJTkdfTEVGVDogJ2xlZnQnLFxyXG4gICAgICBQT0lOVElOR19SSUdIVDogJ3JpZ2h0J1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBTZXQgYXJyb3cgZGlyZWN0aW9uIGFuZCBmaWxsIGJhc2VkIG9uIGRlc2lyZWQgb3JpZW50YXRpb24uXHJcbiAgICBsZXQgZ3JhZGllbnRQYWludDtcclxuICAgIC8vIFBvaW50IHRoZSBub2RlIGluIHRoZSByaWdodCBkaXJlY3Rpb24uXHJcbiAgICBpZiAoIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5QT0lOVElOR19MRUZUICkge1xyXG4gICAgICBncmFkaWVudFBhaW50ID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCAtbGVuZ3RoLCAwICkuYWRkQ29sb3JTdG9wKCAwLCBsZWZ0Q29sb3IgKS5hZGRDb2xvclN0b3AoIDEsIHJpZ2h0Q29sb3IgKTtcclxuICAgICAgbGVuZ3RoID0gLWxlbmd0aDsgLy8gTmVnYXRlIHRoZSB4IGNvbXBvbmVudCBvZiB0aGUgYXJyb3cgaGVhZCBzbyB0aGF0IGl0IHBvaW50cyBsZWZ0LlxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG9yaWVudGF0aW9uID09PSBPcmllbnRhdGlvbi5QT0lOVElOR19SSUdIVCApO1xyXG4gICAgICBncmFkaWVudFBhaW50ID0gbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCBsZW5ndGgsIDAgKS5hZGRDb2xvclN0b3AoIDAsIGxlZnRDb2xvciApLmFkZENvbG9yU3RvcCggMSwgcmlnaHRDb2xvciApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5maWxsID09PSB1bmRlZmluZWQsICdMYWJlbGVkQXJyb3cgc2V0cyBmaWxsJyApO1xyXG4gICAgb3B0aW9ucy5maWxsID0gZ3JhZGllbnRQYWludDtcclxuXHJcbiAgICBzdXBlciggMCwgMCwgbGVuZ3RoLCAwLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIHRleHR1YWwgbGFiZWwuICBTY2FsZSBpdCBzbyB0aGF0IGl0IGNhbiBoYW5kbGUgdHJhbnNsYXRpb25zLiAgTWF4IGxhYmVsIGxlbmd0aCBpcyB0aGUgYXJyb3dcclxuICAgIC8vIGxlbmd0aCBtaW51cyB0d2ljZSB0aGUgaGVhZCBsZW5ndGguXHJcbiAgICBjb25zdCBsYWJlbCA9IG5ldyBUZXh0KCBjYXB0aW9uVGV4dCwgeyBmb250OiBMQUJFTF9GT05UIH0gKTtcclxuICAgIGlmICggbGFiZWwud2lkdGggPiB0aGlzLndpZHRoIC0gMiAqIEFSUk9XX0hFQURfV0lEVEggKSB7XHJcbiAgICAgIGxhYmVsLnNjYWxlKCAoIHRoaXMud2lkdGggLSAyICogQVJST1dfSEVBRF9XSURUSCApIC8gbGFiZWwud2lkdGggKTtcclxuICAgIH1cclxuICAgIGxhYmVsLmNlbnRlciA9IHRoaXMuY2VudGVyO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWwgKTtcclxuICB9XHJcbn1cclxuXHJcbmdyZWVuaG91c2VFZmZlY3QucmVnaXN0ZXIoICdMYWJlbGVkQXJyb3cnLCBMYWJlbGVkQXJyb3cgKTtcclxuXHJcbmNsYXNzIExhYmVsZWRTcGVjdHJ1bU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBDbGFzcyB0aGF0IGRlcGljdHMgdGhlIGZyZXF1ZW5jaWVzIGFuZCB3YXZlbGVuZ3RocyBvZiB0aGUgRU0gc3BlY3RydW0gYW5kIGxhYmVscyB0aGUgc3Vic2VjdGlvbnNcclxuICAgKiAoZS5nLiBcIkluZnJhcmVkXCIpLlxyXG4gICAqXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIHRhbmRlbSApIHtcclxuXHJcbiAgICAvLyBTdXBlcnR5cGUgY29uc3RydWN0b3JcclxuICAgIHN1cGVyKCB7XHJcblxyXG4gICAgICAvLyB0aGUgTGFiZWxlZFNwZWN0cnVtTm9kZSBpcyByZXByZXNlbnRlZCBhcyBhIG5lc3RlZCBsaXN0IGRlc2NyaWJpbmcgdGhlIHZhcmlvdXMgcmFuZ2VzIG9mIHdhdmVsZW5ndGhzIGFuZCBmcmVxdWVuY2llc1xyXG4gICAgICB0YWdOYW1lOiAndWwnLFxyXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMicsXHJcbiAgICAgIGxhYmVsQ29udGVudDogc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgZGVzY3JpcHRpb25UYWdOYW1lOiAncCcsXHJcbiAgICAgIGRlc2NyaXB0aW9uQ29udGVudDogc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgXCJzdHJpcFwiLCB3aGljaCBpcyB0aGUgc29saWQgYmFja2dyb3VuZCBwb3J0aW9ucyB0aGF0IGNvbnRhaW5zIHRoZSBkaWZmZXJlbnQgYmFuZHMgYW5kIHRoYXQgaGFzIHRpY2tcclxuICAgIC8vIG1hcmtzIG9uIHRoZSB0b3AgYW5kIGJvdHRvbS5cclxuICAgIGNvbnN0IHN0cmlwID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgU1VCU0VDVElPTl9XSURUSCwgU1RSSVBfSEVJR0hULCB7XHJcbiAgICAgIGZpbGw6ICdyZ2IoMjM3LCAyNDMsIDI0NiknLFxyXG4gICAgICBsaW5lV2lkdGg6IDIuNSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzdHJpcCApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgZnJlcXVlbmN5IHRpY2sgbWFya3MgdG8gdGhlIHRvcCBvZiB0aGUgc3BlY3RydW0gc3RyaXAuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDQ7IGkgPD0gMjA7IGkrKyApIHtcclxuICAgICAgY29uc3QgaW5jbHVkZUZyZXF1ZW5jeUxhYmVsID0gKCBpICUgMiA9PT0gMCApO1xyXG4gICAgICBhZGRGcmVxdWVuY3lUaWNrTWFyayggdGhpcywgTWF0aC5wb3coIDEwLCBpICksIHN0cmlwLnRvcCwgaW5jbHVkZUZyZXF1ZW5jeUxhYmVsICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWRkIHRoZSB3YXZlbGVuZ3RoIHRpY2sgbWFya3MgdG8gdGhlIGJvdHRvbSBvZiB0aGUgc3BlY3RydW0uXHJcbiAgICBmb3IgKCBsZXQgaiA9IC0xMjsgaiA8PSA0OyBqKysgKSB7XHJcbiAgICAgIGNvbnN0IGluY2x1ZGVXYXZlbGVuZ3RoTGFiZWwgPSAoIGogJSAyID09PSAwICk7XHJcbiAgICAgIGFkZFdhdmVsZW5ndGhUaWNrTWFyayggdGhpcywgTWF0aC5wb3coIDEwLCBqICksIHN0cmlwLmJvdHRvbSwgaW5jbHVkZVdhdmVsZW5ndGhMYWJlbCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgdmFyaW91cyBiYW5kcywgbGFiZWxzIGluY2x1ZGUgUERPTSBkZXNjcmlwdGlvbnNcclxuICAgIGFkZEJhbmRMYWJlbCggdGhpcywgMUUzLCAxRTksIHNwZWN0cnVtV2luZG93UmFkaW9CYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtUmFkaW9MYWJlbFN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1SYWRpb0ZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVJhZGlvV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyYWRpb0JhbmRMYWJlbFRleHQnIClcclxuICAgICk7XHJcbiAgICBhZGRCYW5kRGl2aWRlciggdGhpcywgMUU5ICk7XHJcbiAgICBhZGRCYW5kTGFiZWwoIHRoaXMsIDFFOSwgM0UxMSwgc3BlY3RydW1XaW5kb3dNaWNyb3dhdmVCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtTWljcm93YXZlTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtTWljcm93YXZlRnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtTWljcm93YXZlV2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtaWNyb3dhdmVCYW5kTGFiZWxUZXh0JyApXHJcbiAgICApO1xyXG4gICAgYWRkQmFuZERpdmlkZXIoIHRoaXMsIDNFMTEgKTtcclxuICAgIGFkZEJhbmRMYWJlbCggdGhpcywgM0UxMSwgNkUxNCwgc3BlY3RydW1XaW5kb3dJbmZyYXJlZEJhbmRMYWJlbFN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1JbmZyYXJlZExhYmVsU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUluZnJhcmVkRnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtSW5mcmFyZWRXYXZlbGVuZ3RoRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2luZnJhcmVkQmFuZExhYmVsVGV4dCcgKVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHZpc2libGUgc3BlY3RydW0sIGluIG9yZGVyIGZvciBQRE9NIGRlc2NyaXB0aW9uc1xyXG4gICAgY29uc3QgdmlzU3BlY3RydW1XaWR0aCA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKCBnZXRPZmZzZXRGcm9tRnJlcXVlbmN5KCA3OTBFMTIgKSAtIGdldE9mZnNldEZyb21GcmVxdWVuY3koIDQwMEUxMiApICk7XHJcbiAgICBjb25zdCB3YXZlbGVuZ3RoU3BlY3RydW1Ob2RlID0gbmV3IFdhdmVsZW5ndGhTcGVjdHJ1bU5vZGUoIHsgc2l6ZTogbmV3IERpbWVuc2lvbjIoIHZpc1NwZWN0cnVtV2lkdGgsIFNUUklQX0hFSUdIVCAtIDIgKSB9ICk7XHJcbiAgICB3YXZlbGVuZ3RoU3BlY3RydW1Ob2RlLnJvdGF0ZSggTWF0aC5QSSApOyAvLyBGbGlwIHRoZSB2aXNpYmxlIHNwZWN0cnVtIHNvIHRoYXQgaXQgaXMgcmVwcmVzZW50ZWQgY29ycmVjdGx5IGluIHRoZSBkaWFncmFtLlxyXG4gICAgd2F2ZWxlbmd0aFNwZWN0cnVtTm9kZS5sZWZ0VG9wID0gbmV3IFZlY3RvcjIoIGdldE9mZnNldEZyb21GcmVxdWVuY3koIDQwMEUxMiApLCBzdHJpcC50b3AgKyBzdHJpcC5saW5lV2lkdGggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHdhdmVsZW5ndGhTcGVjdHJ1bU5vZGUgKTtcclxuXHJcbiAgICBhZGRCYW5kTGFiZWwoIHRoaXMsIDFFMTUsIDhFMTUsIHNwZWN0cnVtV2luZG93VWx0cmF2aW9sZXRCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVWx0cmF2aW9sZXRMYWJlbFN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1VbHRyYXZpb2xldEZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVVsdHJhdmlvbGV0V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd1bHRyYXZpb2xldEJhbmRMYWJlbFRleHQnIClcclxuICAgICk7XHJcbiAgICBhZGRCYW5kRGl2aWRlciggdGhpcywgMUUxNiApO1xyXG4gICAgYWRkQmFuZExhYmVsKCB0aGlzLCAxRTE2LCAxRTE5LCBzcGVjdHJ1bVdpbmRvd1hyYXlCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtWFJheUxhYmVsU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVhSYXlGcmVxdWVuY3lEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1YUmF5V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICd4cmF5QmFuZExhYmVsVGV4dCcgKVxyXG4gICAgKTtcclxuICAgIGFkZEJhbmREaXZpZGVyKCB0aGlzLCAxRTE5ICk7XHJcbiAgICBhZGRCYW5kTGFiZWwoIHRoaXMsIDFFMTksIDFFMjEsIHNwZWN0cnVtV2luZG93R2FtbWFSYXlCYW5kTGFiZWxTdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtR2FtbWFSYXlMYWJlbFN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1HYW1tYVJheUZyZXF1ZW5jeURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bUdhbW1hUmF5V2F2ZWxlbmd0aERlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkudmFsdWUsXHJcbiAgICAgIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdnYW1tYVJheUJhbmRMYWJlbFRleHQnIClcclxuICAgICk7XHJcblxyXG4gICAgYWRkRnJlcXVlbmN5QW5kTGFiZWxEZXNjcmlwdGlvbnMoXHJcbiAgICAgIHdhdmVsZW5ndGhTcGVjdHJ1bU5vZGUsXHJcbiAgICAgIHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVZpc2libGVMYWJlbFN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICBzcGVjdHJ1bVdpbmRvd0xhYmVsbGVkU3BlY3RydW1WaXNpYmxlRnJlcXVlbmN5RGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgc3BlY3RydW1XaW5kb3dMYWJlbGxlZFNwZWN0cnVtVmlzaWJsZVdhdmVsZW5ndGhEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICB7XHJcbiAgICAgICAgZ3JhcGhpY2FsRGVzY3JpcHRpb246IHNwZWN0cnVtV2luZG93TGFiZWxsZWRTcGVjdHJ1bVZpc2libGVHcmFwaGljYWxEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LnZhbHVlXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBsYWJlbCBmb3IgdGhlIHZpc2libGUgYmFuZC4gIFNjYWxlIGl0IGRvd24gZm9yIHRyYW5zbGF0aW9ucy5cclxuICAgIGNvbnN0IHZpc2libGVCYW5kTGFiZWwgPSBuZXcgVGV4dCggc3BlY3RydW1XaW5kb3dWaXNpYmxlQmFuZExhYmVsU3RyaW5nUHJvcGVydHkudmFsdWUsIHsgZm9udDogbmV3IFBoZXRGb250KCAxNiApIH0gKTtcclxuICAgIGNvbnN0IHZpc2libGVCYW5kQ2VudGVyWCA9IHdhdmVsZW5ndGhTcGVjdHJ1bU5vZGUuY2VudGVyWDtcclxuICAgIGlmICggdmlzaWJsZUJhbmRMYWJlbC53aWR0aCA+IHN0cmlwLndpZHRoIC8gMiApIHtcclxuICAgICAgdmlzaWJsZUJhbmRMYWJlbC5zY2FsZSggKCBzdHJpcC53aWR0aCAvIDIgKSAvIHZpc2libGVCYW5kTGFiZWwud2lkdGggKTtcclxuICAgIH1cclxuICAgIHZpc2libGVCYW5kTGFiZWwuY2VudGVyID0gbmV3IFZlY3RvcjIoIHZpc2libGVCYW5kQ2VudGVyWCwgLTQ3ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB2aXNpYmxlQmFuZExhYmVsICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBhcnJvdyB0aGF0IGNvbm5lY3RzIHRoZSB2aXNpYmxlIGJhbmQgbGFiZWwgdG8gdGhlIHZpc2libGUgYmFuZCBpdHNlbGYuXHJcbiAgICBjb25zdCB2aXNpYmxlQmFuZEFycm93ID0gbmV3IEFycm93Tm9kZSggdmlzaWJsZUJhbmRDZW50ZXJYLCB2aXNpYmxlQmFuZExhYmVsLmJvdHRvbSwgdmlzaWJsZUJhbmRDZW50ZXJYLCAtNSwge1xyXG4gICAgICB0YWlsV2lkdGg6IDMsXHJcbiAgICAgIGhlYWRXaWR0aDogOSxcclxuICAgICAgaGVhZEhlaWdodDogOSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlzaWJsZUJhbmRBcnJvdycgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmlzaWJsZUJhbmRBcnJvdyApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgdW5pdHMgYW5kIHNjYWxlIGZvciB0cmFuc2xhdGlvbnNcclxuICAgIGNvbnN0IHNjYWxlVW5pdHMgPSB0ZXh0ID0+IHtcclxuICAgICAgaWYgKCB0ZXh0LndpZHRoID4gTUFYX1VOSVRTX1dJRFRIICkge1xyXG4gICAgICAgIHRleHQuc2NhbGUoIE1BWF9VTklUU19XSURUSCAvIHRleHQud2lkdGggKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGNvbnN0IGZyZXF1ZW5jeVVuaXRzID0gbmV3IFRleHQoIHNwZWN0cnVtV2luZG93Q3ljbGVzUGVyU2Vjb25kVW5pdHNTdHJpbmdQcm9wZXJ0eS52YWx1ZSwgeyBmb250OiBMQUJFTF9GT05UIH0gKTtcclxuICAgIHNjYWxlVW5pdHMoIGZyZXF1ZW5jeVVuaXRzICk7XHJcbiAgICBmcmVxdWVuY3lVbml0cy5sZWZ0Q2VudGVyID0gbmV3IFZlY3RvcjIoIFNVQlNFQ1RJT05fV0lEVEgsIC1USUNLX01BUktfSEVJR0hUIC0gZnJlcXVlbmN5VW5pdHMuaGVpZ2h0IC8gMiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZnJlcXVlbmN5VW5pdHMgKTtcclxuXHJcbiAgICBjb25zdCB3YXZlbGVuZ3RoVW5pdHMgPSBuZXcgVGV4dCggc3BlY3RydW1XaW5kb3dNZXRlcnNVbml0c1N0cmluZ1Byb3BlcnR5LnZhbHVlLCB7IGZvbnQ6IExBQkVMX0ZPTlQgfSApO1xyXG4gICAgc2NhbGVVbml0cyggd2F2ZWxlbmd0aFVuaXRzICk7XHJcbiAgICB3YXZlbGVuZ3RoVW5pdHMubGVmdENlbnRlciA9IG5ldyBWZWN0b3IyKCBTVUJTRUNUSU9OX1dJRFRILCBTVFJJUF9IRUlHSFQgKyBUSUNLX01BUktfSEVJR0hUICsgZnJlcXVlbmN5VW5pdHMuaGVpZ2h0IC8gMiApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggd2F2ZWxlbmd0aFVuaXRzICk7XHJcblxyXG4gICAgLy8gd29ya2Fyb3VuZCBmb3IgaU9TIFNhZmFyaSwgd2hpY2ggaGFzIGEgYnVnIHRoYXQgcHJvbm91bmNlcyB0aGUgbmVzdGVkIGxpc3QgaXRlbSByb2xlIGFzIFwidW5wcm9ub3VuY2FibGVcIiAtXHJcbiAgICAvLyByZW1vdmluZyB0aGUgZGVmYXVsdCBidWxsZXQgc3R5bGUgYW5kIHNldHRpbmcgdGhlIHJvbGUgZXhwbGljaXRseSBnZXRzIGFyb3VuZCB0aGUgcHJvYmxlbVxyXG4gICAgdGhpcy5hcmlhUm9sZSA9ICdsaXN0JztcclxuICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ3N0eWxlJywgJ2xpc3Qtc3R5bGU6IG5vbmU7JyApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gZnVuY3Rpb25zIGZvciBMYWJlbGVkU3BlY3RydW1Ob2RlXHJcbi8qKlxyXG4gKiBDb252ZXJ0IHRoZSBnaXZlbiBmcmVxdWVuY3kgdG8gYW4gb2Zmc2V0IGZyb20gdGhlIGxlZnQgZWRnZSBvZiB0aGUgc3BlY3RydW0gc3RyaXAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmcmVxdWVuY3kgLSBGcmVxdWVuY3kgaW4gSHouXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAqL1xyXG5jb25zdCBnZXRPZmZzZXRGcm9tRnJlcXVlbmN5ID0gZnJlcXVlbmN5ID0+IHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBmcmVxdWVuY3kgPj0gTUlOX0ZSRVFVRU5DWSAmJiBmcmVxdWVuY3kgPD0gTUFYX0ZSRVFVRU5DWSApO1xyXG4gIGNvbnN0IGxvZ2FyaXRobWljUmFuZ2UgPSBsb2cxMCggTUFYX0ZSRVFVRU5DWSApIC0gbG9nMTAoIE1JTl9GUkVRVUVOQ1kgKTtcclxuICBjb25zdCBsb2dhcml0aG1pY0ZyZXF1ZW5jeSA9IGxvZzEwKCBmcmVxdWVuY3kgKTtcclxuICByZXR1cm4gKCBsb2dhcml0aG1pY0ZyZXF1ZW5jeSAtIGxvZzEwKCBNSU5fRlJFUVVFTkNZICkgKSAvIGxvZ2FyaXRobWljUmFuZ2UgKiBTVUJTRUNUSU9OX1dJRFRIO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIGxhYmVsIGZvciB0aGUgdGljayBtYXJrcyBvbiB0aGUgc3BlY3RydW0gZGlhZ3JhbS5cclxuICpcclxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gIFdhdmVsZW5ndGggb3IgZnJlcXVlbmN5IHRvIGJlIGRlc2NyaWJlZCBieSB0aGUgbGFiZWwuXHJcbiAqIEByZXR1cm5zIHtSaWNoVGV4dH1cclxuICovXHJcbmNvbnN0IGNyZWF0ZUV4cG9uZW50aWFsTGFiZWwgPSB2YWx1ZSA9PiB7XHJcblxyXG4gIGNvbnN0IHN1cGVyc2NyaXB0ID0gVXRpbHMucm91bmRTeW1tZXRyaWMoIGxvZzEwKCB2YWx1ZSApICk7XHJcbiAgcmV0dXJuIG5ldyBSaWNoVGV4dCggYDEwPHN1cD4ke3N1cGVyc2NyaXB0fTwvc3VwPmAsIHtcclxuICAgIGZvbnQ6IFRJQ0tfTUFSS19GT05ULFxyXG4gICAgc3VwU2NhbGU6IDAuNjUsXHJcbiAgICBzdXBZT2Zmc2V0OiAxXHJcbiAgfSApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENvbnZlcnQgdGhlIGdpdmVuIHdhdmVsZW5ndGggdG8gYW4gb2Zmc2V0IGZyb20gdGhlIGxlZnQgZWRnZSBvZiB0aGUgc3BlY3RydW0gc3RyaXAuICBUaGUgZnJlcXVlbmN5IG9mIGFuXHJcbiAqIGVsZWN0cm9tYWduZXRpYyB3YXZlIGlzIGVxdWFsIHRvIHRoZSBzcGVlZCBvZiBsaWdodCBkaXZpZGVkIGJ5IHRoZSB3YXZlbGVuZ3RoLlxyXG4gKlxyXG4gKiBAcGFyYW0ge251bWJlcn0gd2F2ZWxlbmd0aCAtIHdhdmVsZW5ndGggaW4gbWV0ZXJzXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAqL1xyXG5jb25zdCBnZXRPZmZzZXRGcm9tV2F2ZWxlbmd0aCA9IHdhdmVsZW5ndGggPT4ge1xyXG4gIC8vIFRoZSBjb25zdGFudCAyOTk3OTI0NTggaXMgZXF1YWwgdG8gdGhlIHNwZWVkIG9mIGxpZ2h0IGluIG1ldGVycyBwZXIgc2Vjb25kLlxyXG4gIHJldHVybiBnZXRPZmZzZXRGcm9tRnJlcXVlbmN5KCAyOTk3OTI0NTggLyB3YXZlbGVuZ3RoICk7XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSBsb2cgYmFzZSAxMCBvZiBhIHZhbHVlLlxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsdWVcclxuICogQHJldHVybnMge251bWJlcn1cclxuICovXHJcbmNvbnN0IGxvZzEwID0gdmFsdWUgPT4ge1xyXG4gIHJldHVybiBNYXRoLmxvZyggdmFsdWUgKSAvIE1hdGguTE4xMDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYSB0aWNrIG1hcmsgZm9yIHRoZSBzcGVjaWZpZWQgZnJlcXVlbmN5LiAgRnJlcXVlbmN5IHRpY2sgbWFya3MgZ28gb24gdG9wIG9mIHRoZSBzdHJpcC5cclxuICpcclxuICogQHBhcmFtIHtMYWJlbGVkU3BlY3RydW1Ob2RlfSB0aGlzTm9kZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZnJlcXVlbmN5XHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWRkTGFiZWwgLSBXaGV0aGVyIGEgbGFiZWwgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSB0aWNrIG1hcmsuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gLSBib3R0b20geSBwb3NpdGlvbiBvZiB0aGUgdGljayBtYXJrLiAgeCBwb3NpdGlvbiBjYWxjdWxhdGVkIHdpdGggZ2V0T2Zmc2V0RnJvbUZyZXF1ZW5jeSgpXHJcbiAqL1xyXG5jb25zdCBhZGRGcmVxdWVuY3lUaWNrTWFyayA9ICggdGhpc05vZGUsIGZyZXF1ZW5jeSwgYm90dG9tLCBhZGRMYWJlbCApID0+IHtcclxuICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgdGljayBtYXJrIGxpbmUuXHJcbiAgY29uc3QgdGlja01hcmtOb2RlID0gbmV3IExpbmUoIDAsIDAsIDAsIC1USUNLX01BUktfSEVJR0hULCB7IHN0cm9rZTogJ2JsYWNrJywgbGluZVdpZHRoOiAyIH0gKTtcclxuICB0aWNrTWFya05vZGUuY2VudGVyQm90dG9tID0gbmV3IFZlY3RvcjIoIGdldE9mZnNldEZyb21GcmVxdWVuY3koIGZyZXF1ZW5jeSApLCBib3R0b20gKTtcclxuICB0aGlzTm9kZS5hZGRDaGlsZCggdGlja01hcmtOb2RlICk7XHJcblxyXG4gIGlmICggYWRkTGFiZWwgKSB7XHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgbGFiZWwuXHJcbiAgICBjb25zdCBsYWJlbCA9IGNyZWF0ZUV4cG9uZW50aWFsTGFiZWwoIGZyZXF1ZW5jeSApO1xyXG4gICAgLy8gQ2FsY3VsYXRlIHggb2Zmc2V0IGZvciBsYWJlbC4gIEFsbG93cyB0aGUgYmFzZSBudW1iZXIgb2YgdGhlIGxhYmVsIHRvIGNlbnRlcmVkIHdpdGggdGhlIHRpY2sgbWFyay5cclxuICAgIGNvbnN0IHhPZmZzZXQgPSBuZXcgVGV4dCggJzEwJywgeyBmb250OiBUSUNLX01BUktfRk9OVCB9ICkud2lkdGggLyAyO1xyXG4gICAgbGFiZWwubGVmdENlbnRlciA9IG5ldyBWZWN0b3IyKCB0aWNrTWFya05vZGUuY2VudGVyWCAtIHhPZmZzZXQsIHRpY2tNYXJrTm9kZS50b3AgLSBsYWJlbC5oZWlnaHQgLyAyICk7XHJcbiAgICB0aGlzTm9kZS5hZGRDaGlsZCggbGFiZWwgKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQWRkIGEgdGljayBtYXJrIGZvciB0aGUgc3BlY2lmaWVkIHdhdmVsZW5ndGguICBXYXZlbGVuZ3RoIHRpY2sgbWFya3MgZ28gb24gdGhlIGJvdHRvbSBvZiB0aGUgc3RyaXAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7TGFiZWxlZFNwZWN0cnVtTm9kZX0gdGhpc05vZGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHdhdmVsZW5ndGhcclxuICogKiBAcGFyYW0ge251bWJlcn0gdG9wXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYWRkTGFiZWxcclxuICovXHJcbmNvbnN0IGFkZFdhdmVsZW5ndGhUaWNrTWFyayA9ICggdGhpc05vZGUsIHdhdmVsZW5ndGgsIHRvcCwgYWRkTGFiZWwgKSA9PiB7XHJcblxyXG4gIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSB0aWNrIG1hcmsgbGluZS5cclxuICBjb25zdCB0aWNrTWFya05vZGUgPSBuZXcgTGluZSggMCwgMCwgMCwgVElDS19NQVJLX0hFSUdIVCwgeyBzdHJva2U6ICdibGFjaycsIGxpbmVXaWR0aDogMiB9ICk7XHJcbiAgdGlja01hcmtOb2RlLmNlbnRlclRvcCA9IG5ldyBWZWN0b3IyKCBnZXRPZmZzZXRGcm9tV2F2ZWxlbmd0aCggd2F2ZWxlbmd0aCApLCB0b3AgKTtcclxuICB0aGlzTm9kZS5hZGRDaGlsZCggdGlja01hcmtOb2RlICk7XHJcbiAgaWYgKCBhZGRMYWJlbCApIHtcclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBsYWJlbC5cclxuICAgIGNvbnN0IGxhYmVsID0gY3JlYXRlRXhwb25lbnRpYWxMYWJlbCggd2F2ZWxlbmd0aCApO1xyXG4gICAgLy8gQ2FsY3VsYXRlIHggb2Zmc2V0IGZvciBsYWJlbC4gIEFsbG93cyB0aGUgYmFzZSBudW1iZXIgb2YgdGhlIGxhYmVsIHRvIGJlIGNlbnRlcmVkIHdpdGggdGhlIHRpY2sgbWFyay5cclxuICAgIGxhYmVsLmNlbnRlciA9IG5ldyBWZWN0b3IyKCB0aWNrTWFya05vZGUuY2VudGVyWCwgdGlja01hcmtOb2RlLnRvcCArIGxhYmVsLmhlaWdodCArIDIgKTtcclxuICAgIHRoaXNOb2RlLmFkZENoaWxkKCBsYWJlbCApO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYSBsYWJlbCB0byBhIGJhbmQgd2hpY2ggc2VjdGlvbnMgdGhlIHNwZWN0cnVtIGRpYWdyYW0uICBVc2luZyBWQm94IHdpbGwgZm9ybWF0IHRoZSBzdHJpbmdzIHNvIHRoYXQgbmV3XHJcbiAqIGxpbmVzIGRvIG5vdCBuZWVkIHRvIGJlIGNvZGVkIHdpdGggSFRNTC5cclxuICpcclxuICogQHBhcmFtIHtMYWJlbGVkU3BlY3RydW1Ob2RlfSB0aGlzTm9kZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gbG93RW5kRnJlcXVlbmN5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoRW5kRnJlcXVlbmN5XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBsYWJlbFN0cmluZyAtIGxhYmVsIHN0cmluZyBkZXNjcmliaW5nIHRoZSBiYW5kIG9uIHRoZSBlbGVjdHJvbWFnbmV0aWMgc3BlY3RydW0uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwZG9tTGFiZWwgLSBsYWJlbCBmb3IgdGhlIGNvbnRlbnQgaW4gdGhlIFBET01cclxuICogQHBhcmFtIHtzdHJpbmd9IGZyZXF1ZW5jeURlc2NyaXB0aW9uIC0gZGVzY3JpYmVzIHRoZSByYW5nZSBvZiBmcmVxdWVuY2llcyBpbiB0aGUgUERPTVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gd2F2ZWxlbmd0aERlc2NyaXB0aW9uIC0gZGVzY3JpYmVzIHRoZSByYW5nZSBvZiB3YXZlbGVuZ3RocyBpbiB0aGUgUERPTVxyXG4gKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAqL1xyXG5jb25zdCBhZGRCYW5kTGFiZWwgPSAoIHRoaXNOb2RlLCBsb3dFbmRGcmVxdWVuY3ksIGhpZ2hFbmRGcmVxdWVuY3ksIGxhYmVsU3RyaW5nLCBwZG9tTGFiZWwsIGZyZXF1ZW5jeURlc2NyaXB0aW9uLCB3YXZlbGVuZ3RoRGVzY3JpcHRpb24sIHRhbmRlbSApID0+IHtcclxuXHJcbiAgLy8gQXJndW1lbnQgdmFsaWRhdGlvbi5cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBoaWdoRW5kRnJlcXVlbmN5ID49IGxvd0VuZEZyZXF1ZW5jeSApO1xyXG5cclxuICAvLyBTZXQgdXAgdmFsdWVzIG5lZWRlZCBmb3IgY2FsY3VsYXRpb25zLlxyXG4gIGNvbnN0IGxlZnRCb3VuZGFyeVggPSBnZXRPZmZzZXRGcm9tRnJlcXVlbmN5KCBsb3dFbmRGcmVxdWVuY3kgKTtcclxuICBjb25zdCByaWdodEJvdW5kYXJ5WCA9IGdldE9mZnNldEZyb21GcmVxdWVuY3koIGhpZ2hFbmRGcmVxdWVuY3kgKTtcclxuICBjb25zdCB3aWR0aCA9IHJpZ2h0Qm91bmRhcnlYIC0gbGVmdEJvdW5kYXJ5WDtcclxuICBjb25zdCBjZW50ZXJYID0gbGVmdEJvdW5kYXJ5WCArIHdpZHRoIC8gMjtcclxuXHJcbiAgLy8gQ3JlYXRlIGFuZCBhZGQgdGhlIGxhYmVsLlxyXG4gIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBSaWNoVGV4dCggbGFiZWxTdHJpbmcsIHtcclxuICAgIHJlcGxhY2VOZXdsaW5lczogdHJ1ZSxcclxuICAgIGFsaWduOiAnY2VudGVyJyxcclxuICAgIGZvbnQ6IExBQkVMX0ZPTlQsXHJcbiAgICB0YW5kZW06IHRhbmRlbVxyXG4gIH0gKTtcclxuICB0aGlzTm9kZS5hZGRDaGlsZCggbGFiZWxUZXh0ICk7XHJcblxyXG4gIGlmICggKCBsYWJlbFRleHQud2lkdGggKyAxMCApID4gd2lkdGggKSB7XHJcbiAgICAvLyBTY2FsZSB0aGUgbGFiZWwgdG8gZml0IHdpdGggYSBsaXR0bGUgYml0IG9mIHBhZGRpbmcgb24gZWFjaCBzaWRlLlxyXG4gICAgbGFiZWxUZXh0LnNjYWxlKCB3aWR0aCAvICggbGFiZWxUZXh0LndpZHRoICsgMTAgKSApO1xyXG4gIH1cclxuICBsYWJlbFRleHQuc2V0Q2VudGVyKCBuZXcgVmVjdG9yMiggY2VudGVyWCwgU1RSSVBfSEVJR0hUIC8gMiApICk7XHJcblxyXG4gIC8vIHBkb21cclxuICBhZGRGcmVxdWVuY3lBbmRMYWJlbERlc2NyaXB0aW9ucyggbGFiZWxUZXh0LCBwZG9tTGFiZWwsIGZyZXF1ZW5jeURlc2NyaXB0aW9uLCB3YXZlbGVuZ3RoRGVzY3JpcHRpb24gKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYSBcImJhbmQgZGl2aWRlclwiIGF0IHRoZSBnaXZlbiBmcmVxdWVuY3kuICBBIGJhbmQgZGl2aWRlciBpcyBhIGRvdHRlZCBsaW5lIHRoYXQgc3BhbnMgdGhlIHNwZWN0cnVtIHN0cmlwIGluXHJcbiAqIHRoZSB2ZXJ0aWNhbCBkaXJlY3Rpb24uXHJcbiAqXHJcbiAqIEBwYXJhbXtMYWJlbGVkU3BlY3RydW1Ob2RlfSB0aGlzTm9kZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZnJlcXVlbmN5XHJcbiAqL1xyXG5jb25zdCBhZGRCYW5kRGl2aWRlciA9ICggdGhpc05vZGUsIGZyZXF1ZW5jeSApID0+IHtcclxuICBjb25zdCBkcmF3RGl2aWRlclNlZ21lbnQgPSAoKSA9PiBuZXcgTGluZSggMCwgMCwgMCwgU1RSSVBfSEVJR0hUIC8gOSwge1xyXG4gICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgbGluZVdpZHRoOiAyLjVcclxuICB9ICk7XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgNTsgaSsrICkge1xyXG4gICAgY29uc3QgZGl2aWRlclNlZ21lbnQgPSBkcmF3RGl2aWRlclNlZ21lbnQoKTtcclxuICAgIGRpdmlkZXJTZWdtZW50LmNlbnRlclRvcCA9IG5ldyBWZWN0b3IyKCBnZXRPZmZzZXRGcm9tRnJlcXVlbmN5KCBmcmVxdWVuY3kgKSwgMiAqIGkgKiBTVFJJUF9IRUlHSFQgLyA5ICk7XHJcbiAgICB0aGlzTm9kZS5hZGRDaGlsZCggZGl2aWRlclNlZ21lbnQgKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0cyBhbmQgZGVjb3JhdGVzIHRoZSBOb2RlIHdpdGggYWNjZXNzaWJsZSBjb250ZW50IGRlc2NyaWJpbmcgdGhlIHdhdmVsZW5ndGhzIGFuZCBmcmVxdWVuY2llcyBvZiBhIHBhcnRpY3VsYXIgcmFuZ2UuXHJcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxyXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxcclxuICogQHBhcmFtIHtzdHJpbmd9IGZyZXF1ZW5jeURlc2NyaXB0aW9uXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB3YXZlbGVuZ3RoRGVzY3JpcHRpb25cclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gKi9cclxuY29uc3QgYWRkRnJlcXVlbmN5QW5kTGFiZWxEZXNjcmlwdGlvbnMgPSAoIG5vZGUsIGxhYmVsLCBmcmVxdWVuY3lEZXNjcmlwdGlvbiwgd2F2ZWxlbmd0aERlc2NyaXB0aW9uLCBvcHRpb25zICkgPT4ge1xyXG4gIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgIC8vIHtzdHJpbmd8bnVsbH0gb3B0aW9uYWwgZGVzY3JpcHRpb24gZm9yIHRoZSBncmFwaGljYWwgcmVwcmVzZW50YXRpb24gaW4gdGhlIHNpbXVsYXRpb24gZm9yIHRoaXMgcmFuZ2Ugb2YgZnJlcXVlbmN5L3dhdmVsZW5ndGhcclxuICAgIGdyYXBoaWNhbERlc2NyaXB0aW9uOiBudWxsXHJcbiAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAvLyBhc3N1bWVzIHRoYXQgc29tZSBhbmNlc3RvciBvZiB0aGUgTm9kZSBpcyBhbiB1bm9yZGVyZWQgbGlzdFxyXG4gIG5vZGUuY29udGFpbmVyVGFnTmFtZSA9ICdsaSc7XHJcbiAgbm9kZS50YWdOYW1lID0gJ3VsJztcclxuICBub2RlLmxhYmVsVGFnTmFtZSA9ICdzcGFuJztcclxuICBub2RlLmxhYmVsQ29udGVudCA9IGxhYmVsO1xyXG5cclxuICAvLyB3b3JrYXJvdW5kIGZvciBpT1MgU2FmYXJpLCB3aGljaCBoYXMgYSBidWcgdGhhdCBwcm9ub3VuY2VzIHRoZSBuZXN0ZWQgbGlzdCBpdGVtIHJvbGUgYXMgXCJ1bnByb25vdW5jYWJsZVwiIC1cclxuICAvLyByZW1vdmluZyB0aGUgZGVmYXVsdCBidWxsZXQgc3R5bGUgYW5kIHNldHRpbmcgdGhlIHJvbGUgZXhwbGljaXRseSBnZXRzIGFyb3VuZCB0aGUgcHJvYmxlbVxyXG4gIG5vZGUuYXJpYVJvbGUgPSAnbGlzdCc7XHJcbiAgbm9kZS5zZXRQRE9NQXR0cmlidXRlKCAnc3R5bGUnLCAnbGlzdC1zdHlsZTogbm9uZTsnICk7XHJcblxyXG5cclxuICBpZiAoIG9wdGlvbnMuZ3JhcGhpY2FsRGVzY3JpcHRpb24gKSB7XHJcbiAgICBub2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyB0YWdOYW1lOiAnbGknLCBpbm5lckNvbnRlbnQ6IG9wdGlvbnMuZ3JhcGhpY2FsRGVzY3JpcHRpb24gfSApICk7XHJcbiAgfVxyXG5cclxuICAvLyBhZGQgdG8gdGhlIG5lc3RlZCBsaXN0XHJcbiAgbm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgdGFnTmFtZTogJ2xpJywgaW5uZXJDb250ZW50OiBmcmVxdWVuY3lEZXNjcmlwdGlvbiB9ICkgKTtcclxuICBub2RlLmFkZENoaWxkKCBuZXcgTm9kZSggeyB0YWdOYW1lOiAnbGknLCBpbm5lckNvbnRlbnQ6IHdhdmVsZW5ndGhEZXNjcmlwdGlvbiB9ICkgKTtcclxufTtcclxuXHJcbmNsYXNzIENoaXJwTm9kZSBleHRlbmRzIFJlY3RhbmdsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqICBDbGFzcyB0aGF0IGRlcGljdHMgYSB3YXZlIHRoYXQgZ2V0cyBwcm9ncmVzc2l2ZWx5IHNob3J0ZXIgaW4gd2F2ZWxlbmd0aCBmcm9tIGxlZnQgdG8gcmlnaHQsIHdoaWNoIGlzIGNhbGxlZCBhXHJcbiAgICogIGNoaXJwLlxyXG4gICAqXHJcbiAgICogIEBjb25zdHJ1Y3RvclxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmaWxsOiAncmdiKDIzNywgMjQzLCAyNDYpJyxcclxuICAgICAgbGluZVdpZHRoOiAyLjUsXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBib3VuZGFyeSBhbmQgYmFja2dyb3VuZC5cclxuICAgIGNvbnN0IGJvdW5kaW5nQm94SGVpZ2h0ID0gU1VCU0VDVElPTl9XSURUSCAqIDAuMTsgLy8gQXJiaXRyYXJ5LCBhZGp1c3QgYXMgbmVlZGVkLlxyXG4gICAgc3VwZXIoIDAsIDAsIFNVQlNFQ1RJT05fV0lEVEgsIGJvdW5kaW5nQm94SGVpZ2h0LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY2hpcnBTaGFwZSA9IG5ldyBTaGFwZSgpO1xyXG4gICAgY2hpcnBTaGFwZS5tb3ZlVG8oIDAsIHRoaXMuY2VudGVyWSApOyAvLyBNb3ZlIHN0YXJ0aW5nIHBvaW50IHRvIGxlZnQgY2VudGVyIG9mIGJvdW5kaW5nIGJveC5cclxuICAgIGNvbnN0IG51bVBvaW50c09uTGluZSA9IDE1MDA7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1Qb2ludHNPbkxpbmU7IGkrKyApIHtcclxuICAgICAgY29uc3QgeCA9IGkgKiAoIFNVQlNFQ1RJT05fV0lEVEggLyAoIG51bVBvaW50c09uTGluZSAtIDEgKSApO1xyXG4gICAgICBjb25zdCB0ID0geCAvIFNVQlNFQ1RJT05fV0lEVEg7XHJcblxyXG4gICAgICBjb25zdCBmMCA9IDE7XHJcbiAgICAgIGNvbnN0IGsgPSAyO1xyXG4gICAgICBjb25zdCB0U2NhbGUgPSA0LjU7XHJcbiAgICAgIGNvbnN0IHNpblRlcm0gPSBNYXRoLnNpbiggMiAqIE1hdGguUEkgKiBmMCAqICggTWF0aC5wb3coIGssIHQgKiB0U2NhbGUgKSAtIDEgKSAvIE1hdGgubG9nKCBrICkgKTtcclxuXHJcbiAgICAgIGNvbnN0IHkgPSAoIHNpblRlcm0gKiBib3VuZGluZ0JveEhlaWdodCAqIDAuNDAgKyBib3VuZGluZ0JveEhlaWdodCAvIDIgKTtcclxuICAgICAgY2hpcnBTaGFwZS5saW5lVG8oIHgsIHkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNoaXJwIG5vZGUsIGJ1dCBjcmVhdGUgaXQgZmlyc3Qgd2l0aCBhIG51bGwgc2hhcGUsIHRoZW4gb3ZlcnJpZGUgY29tcHV0ZVNoYXBlQm91bmRzLCB0aGVuIHNldCB0aGVcclxuICAgIC8vIHNoYXBlLiAgVGhpcyBtYWtlcyB0aGUgY3JlYXRpb24gb2YgdGhpcyBub2RlIGZhciBmYXN0ZXIuXHJcbiAgICBjb25zdCBjaGlycE5vZGUgPSBuZXcgUGF0aCggbnVsbCwge1xyXG4gICAgICBsaW5lV2lkdGg6IDIuNSxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICBsaW5lSm9pbjogJ2JldmVsJ1xyXG4gICAgfSApO1xyXG4gICAgY2hpcnBOb2RlLmNvbXB1dGVTaGFwZUJvdW5kcyA9ICgpID0+IGNoaXJwU2hhcGUuYm91bmRzLmRpbGF0ZWQoIDQgKTtcclxuICAgIGNoaXJwTm9kZS5zaGFwZSA9IGNoaXJwU2hhcGU7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggY2hpcnBOb2RlICk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTcGVjdHJ1bURpYWdyYW07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5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