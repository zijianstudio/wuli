// Copyright 2018-2023, University of Colorado Boulder

/**
 * A view that is responsible for controlling graph axes
 * Handles labels for displaying regions of the electromagnetic spectrum
 * Also handles axes labels and tick labels
 * Most important functionality is handling conversions between logical values and screen coordinates
 *
 * @author Saurabh Totey
 * @author Arnab Purkayastha
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ScientificNotationNode from '../../../../scenery-phet/js/ScientificNotationNode.js';
import { Node, Path, RichText, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BlackbodyConstants from '../../BlackbodyConstants.js';
import blackbodySpectrum from '../../blackbodySpectrum.js';
import BlackbodySpectrumStrings from '../../BlackbodySpectrumStrings.js';
import BlackbodyColors from './BlackbodyColors.js';

// from nm to m to the fifth power (1e45) and Mega/micron (1e-12)
const SPECTRAL_POWER_DENSITY_CONVERSION_FACTOR = 1e33;
const ELECTROMAGNETIC_SPECTRUM_LABEL_CUTOFF = 20;
const infraredString = BlackbodySpectrumStrings.infrared;
const spectralPowerDensityLabelString = BlackbodySpectrumStrings.spectralPowerDensityLabel;
const subtitleLabelString = BlackbodySpectrumStrings.subtitleLabel;
const ultravioletString = BlackbodySpectrumStrings.ultraviolet;
const visibleString = BlackbodySpectrumStrings.visible;
const wavelengthLabelString = BlackbodySpectrumStrings.wavelengthLabel;
const xRayString = BlackbodySpectrumStrings.xRay;

// Max wavelengths for each region of the electromagnetic spectrum in nm, type Object
const ELECTROMAGNETIC_SPECTRUM_LABEL_VALUES = {
  xray: {
    label: xRayString,
    maxWavelength: BlackbodyConstants.xRayWavelength
  },
  ultraviolet: {
    label: ultravioletString,
    maxWavelength: BlackbodyConstants.ultravioletWavelength
  },
  visible: {
    label: visibleString,
    maxWavelength: BlackbodyConstants.visibleWavelength
  },
  infrared: {
    label: infraredString,
    maxWavelength: BlackbodyConstants.infraredWavelength
  }
};
class ZoomableAxesView extends Node {
  /**
   * Makes a ZoomableAxesView
   * @param {BlackbodySpectrumModel} model
   * @param {Object} [options]
   */
  constructor(model, options) {
    // Default options
    options = merge({
      axesWidth: 550,
      axesHeight: 400,
      axesPathOptions: {
        stroke: BlackbodyColors.graphAxesStrokeProperty,
        lineWidth: 3,
        lineCap: 'round',
        lineJoin: 'round'
      },
      ticksPathOptions: {
        stroke: BlackbodyColors.graphAxesStrokeProperty,
        lineWidth: 1,
        lineCap: 'butt',
        lineJoin: 'bevel'
      },
      wavelengthPerTick: 100,
      minorTicksPerMajorTick: 5,
      minorTickLength: 10,
      majorTickLength: 20,
      horizontalZoomFactor: 2,
      verticalZoomFactor: 5,
      defaultHorizontalZoom: model.wavelengthMax,
      defaultVerticalZoom: 100.0,
      minorTickMaxHorizontalZoom: 12000,
      axisBoundsLabelColor: BlackbodyColors.titlesTextProperty,
      axisLabelColor: BlackbodyColors.titlesTextProperty,
      electromagneticSpectrumLabelTextOptions: {
        font: new PhetFont(14),
        fill: BlackbodyColors.titlesTextProperty
      },
      tandem: Tandem.REQUIRED
    }, options);

    // Call to node superconstructor: no options passed in
    super();

    // @private
    this.model = model;

    // Axes dimensions
    // @public {number}
    this.horizontalAxisLength = options.axesWidth;
    this.verticalAxisLength = options.axesHeight;

    // @public (read-only) - How each axis scales
    this.horizontalZoomScale = options.horizontalZoomFactor;
    this.verticalZoomScale = options.verticalZoomFactor;

    // @private The path for the actual axes themselves
    this.axesPath = new Path(new Shape().moveTo(this.horizontalAxisLength, -5).lineTo(this.horizontalAxisLength, 0).lineTo(0, 0).lineTo(0, -this.verticalAxisLength).lineTo(5, -this.verticalAxisLength), options.axesPathOptions);

    // @public Clipping shape for keeping elements inside graph axes - clips the paths to the axes bounds, pushed
    // shape down 1 pixel to prevent performance degradation when clipping at low temperatures
    this.clipShape = Shape.rectangle(0, 1, this.horizontalAxisLength, -this.verticalAxisLength - 1);

    // @private Path for the horizontal axes ticks
    this.horizontalTicksPath = new Path(null, options.ticksPathOptions);

    // @private Components for the electromagnetic spectrum labels
    this.electromagneticSpectrumAxisPath = new Path(new Shape().moveTo(0, -this.verticalAxisLength).lineTo(this.horizontalAxisLength, -this.verticalAxisLength), merge(options.axesPathOptions, {
      lineWidth: 1
    }));
    this.electromagneticSpectrumTicksPath = new Path(null, options.ticksPathOptions);
    this.electromagneticSpectrumLabelTexts = new Node({
      children: _.values(ELECTROMAGNETIC_SPECTRUM_LABEL_VALUES).map(config => {
        const regionLabel = new Text(config.label, options.electromagneticSpectrumLabelTextOptions);
        regionLabel.bottom = this.electromagneticSpectrumAxisPath.top;
        return regionLabel;
      })
    });

    // @private Horizontal tick settings
    this.wavelengthPerTick = options.wavelengthPerTick;
    this.minorTicksPerMajorTick = options.minorTicksPerMajorTick;
    this.minorTickLength = options.minorTickLength;
    this.majorTickLength = options.majorTickLength;
    this.minorTickMaxHorizontalZoom = options.minorTickMaxHorizontalZoom;

    // Labels for the axes
    const verticalAxisLabelNode = new Text(spectralPowerDensityLabelString, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisLabelColor,
      rotation: -Math.PI / 2,
      maxWidth: options.axesHeight
    });
    const axesWidth = options.axesWidth * 0.8;
    const horizontalAxisTopLabelNode = new Text(wavelengthLabelString, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisLabelColor,
      maxWidth: axesWidth
    });
    const horizontalAxisBottomLabelText = new Text(subtitleLabelString, {
      font: new PhetFont(16),
      fill: options.axisLabelColor,
      maxWidth: axesWidth,
      tandem: options.tandem.createTandem('horizontalAxisSubtitleLabelText')
    });
    const horizontalAxisLabelNode = new Node({
      children: [horizontalAxisTopLabelNode, horizontalAxisBottomLabelText]
    });

    // @public {Property.<number>} current zoom values
    this.horizontalZoomProperty = new NumberProperty(options.defaultHorizontalZoom, {
      range: new Range(BlackbodyConstants.minHorizontalZoom, BlackbodyConstants.maxHorizontalZoom),
      tandem: options.tandem.createTandem('horizontalZoomProperty')
    });
    this.verticalZoomProperty = new NumberProperty(options.defaultVerticalZoom, {
      range: new Range(BlackbodyConstants.minVerticalZoom, BlackbodyConstants.maxVerticalZoom),
      tandem: options.tandem.createTandem('verticalZoomProperty')
    });

    // @public {number} zoom bounds
    this.minHorizontalZoom = BlackbodyConstants.minHorizontalZoom;
    this.maxHorizontalZoom = BlackbodyConstants.maxHorizontalZoom;
    this.minVerticalZoom = BlackbodyConstants.minVerticalZoom;
    this.maxVerticalZoom = BlackbodyConstants.maxVerticalZoom;

    // @public Links the horizontal zoom Property to update the model for the max wavelength
    this.horizontalZoomProperty.link(horizontalZoom => {
      model.wavelengthMax = horizontalZoom;
    });

    // @public Links the horizontal zoom Property to update horizontal ticks and the EM spectrum labels on change
    this.horizontalZoomProperty.link(() => {
      this.redrawHorizontalTicks();
      this.redrawElectromagneticSpectrumLabel();
    });

    // @public Links the model's labelsVisibleProperty with the electromagnetic spectrum label's visibility
    this.model.labelsVisibleProperty.link(labelsVisible => {
      this.electromagneticSpectrumAxisPath.visible = labelsVisible;
      this.electromagneticSpectrumTicksPath.visible = labelsVisible;
      this.electromagneticSpectrumLabelTexts.visible = labelsVisible;
    });

    // @private Labels for axes bounds
    this.horizontalTickLabelZero = new Text('0', {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisBoundsLabelColor
    });
    this.horizontalTickLabelMax = new Text(model.wavelengthMax / 1000, {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisBoundsLabelColor
    });
    this.verticalTickLabelMax = new RichText(this.truncateNum(this.verticalZoomProperty.value, 3, 5), {
      font: BlackbodyConstants.LABEL_FONT,
      fill: options.axisBoundsLabelColor,
      maxWidth: 60
    });

    // Set layout of labels relative to axes, these objects are static
    // Remaining object layouts are set in update() below
    this.horizontalTickLabelZero.top = this.axesPath.bottom;
    this.horizontalTickLabelZero.right = this.axesPath.left;
    this.horizontalTickLabelMax.top = this.axesPath.bottom;
    this.horizontalTickLabelMax.left = this.axesPath.right;
    verticalAxisLabelNode.centerX = this.axesPath.left - 90;
    verticalAxisLabelNode.centerY = this.axesPath.centerY;
    horizontalAxisTopLabelNode.centerX = this.axesPath.centerX;
    horizontalAxisBottomLabelText.top = horizontalAxisTopLabelNode.bottom + 5;
    horizontalAxisBottomLabelText.centerX = this.axesPath.centerX;
    horizontalAxisLabelNode.centerY = this.axesPath.bottom + 59;

    // Adds children in rendering order
    this.addChild(verticalAxisLabelNode);
    this.addChild(horizontalAxisLabelNode);
    this.addChild(this.horizontalTickLabelZero);
    this.addChild(this.horizontalTickLabelMax);
    this.addChild(this.verticalTickLabelMax);
    this.addChild(this.axesPath);
    this.addChild(this.horizontalTicksPath);
    this.addChild(this.electromagneticSpectrumAxisPath);
    this.addChild(this.electromagneticSpectrumTicksPath);
    this.addChild(this.electromagneticSpectrumLabelTexts);
  }

  /**
   * Resets the axes to their default state
   * @public
   */
  reset() {
    this.horizontalZoomProperty.reset();
    this.verticalZoomProperty.reset();
  }

  /**
   * Updates the ZoomableAxesView's horizontal ticks to comply with any new changes
   * @private
   */
  redrawHorizontalTicks() {
    const horizontalTicksShape = new Shape();
    for (let i = 0; i < this.model.wavelengthMax / this.wavelengthPerTick; i++) {
      let tickHeight = this.minorTickLength;
      if (this.model.wavelengthMax > this.minorTickMaxHorizontalZoom) {
        tickHeight = 0;
      }
      if (i % this.minorTicksPerMajorTick === 0) {
        tickHeight = this.majorTickLength;
      }
      const x = this.wavelengthToViewX(i * this.wavelengthPerTick);
      horizontalTicksShape.moveTo(x, 0).lineTo(x, -tickHeight);
    }
    this.horizontalTicksPath.shape = horizontalTicksShape;
  }

  /**
   * Updates the ZoomableAxesView's electromagnetic spectrum label to comply with any new changes
   * @private
   */
  redrawElectromagneticSpectrumLabel() {
    // Makes the ticks for demarcating regions of the electromagnetic spectrum
    const labelsTickShape = new Shape();
    const tickPositions = _.values(ELECTROMAGNETIC_SPECTRUM_LABEL_VALUES).filter(config => {
      return config.maxWavelength <= this.model.wavelengthMax;
    }).map(config => {
      return this.wavelengthToViewX(config.maxWavelength);
    });
    tickPositions.forEach(x => {
      const bottomY = -this.verticalAxisLength + this.minorTickLength / 2;
      labelsTickShape.moveTo(x, bottomY).lineTo(x, bottomY - this.minorTickLength);
    });
    this.electromagneticSpectrumTicksPath.shape = labelsTickShape;

    // Makes all text labels invisible
    this.electromagneticSpectrumLabelTexts.children.forEach(regionLabel => {
      regionLabel.visible = false;
    });

    // Using the positions for tick placement, updates positions of electromagnetic spectrum text labels
    const labelBounds = [0].concat(tickPositions).concat(this.horizontalAxisLength);
    for (let i = 0; i < labelBounds.length - 1; i++) {
      const lowerBound = labelBounds[i];
      const upperBound = labelBounds[i + 1];
      assert && assert(upperBound > lowerBound, 'Label tick positions are not in order');
      const regionLabel = this.electromagneticSpectrumLabelTexts.children[i];
      if (upperBound - lowerBound < ELECTROMAGNETIC_SPECTRUM_LABEL_CUTOFF) {
        continue;
      }
      regionLabel.visible = true;
      regionLabel.maxWidth = upperBound - lowerBound;
      regionLabel.centerX = (upperBound + lowerBound) / 2;
    }
  }

  /**
   * Converts a given wavelength in nm to an x distance along the view
   * @param {number} wavelength
   * @returns {number}
   * @public
   */
  wavelengthToViewX(wavelength) {
    return Utils.linear(0, this.model.wavelengthMax, 0, this.horizontalAxisLength, wavelength);
  }

  /**
   * Converts a given x distance along the view to a wavelength in nm
   * @param {number} viewX
   * @returns {number}
   * @public
   */
  viewXToWavelength(viewX) {
    return Utils.linear(0, this.horizontalAxisLength, 0, this.model.wavelengthMax, viewX);
  }

  /**
   * Converts a given spectral power density to a y distance along the view
   * @param {number} spectralPowerDensity
   * @returns {number}
   * @public
   */
  spectralPowerDensityToViewY(spectralPowerDensity) {
    return -SPECTRAL_POWER_DENSITY_CONVERSION_FACTOR * Utils.linear(0, this.verticalZoomProperty.value, 0, this.verticalAxisLength, spectralPowerDensity);
  }

  /**
   * Converts a given y distance along the view to a spectral power density
   * @param {number} viewY
   * @returns {number}
   * @public
   */
  viewYToSpectralPowerDensity(viewY) {
    return Utils.linear(0, this.verticalAxisLength, 0, this.verticalZoomProperty.value, viewY) / -SPECTRAL_POWER_DENSITY_CONVERSION_FACTOR;
  }

  /**
   * Zooms the horizontal axis in
   * @public
   */
  zoomInHorizontal() {
    this.horizontalZoomProperty.value = Utils.clamp(this.horizontalZoomProperty.value / this.horizontalZoomScale, this.minHorizontalZoom, this.maxHorizontalZoom);
  }

  /**
   * Zooms the horizontal axis out
   * @public
   */
  zoomOutHorizontal() {
    this.horizontalZoomProperty.value = Utils.clamp(this.horizontalZoomProperty.value * this.horizontalZoomScale, this.minHorizontalZoom, this.maxHorizontalZoom);
  }

  /**
   * Zooms the vertical axis in
   * @public
   */
  zoomInVertical() {
    this.verticalZoomProperty.value = Utils.clamp(this.verticalZoomProperty.value / this.verticalZoomScale, this.minVerticalZoom, this.maxVerticalZoom);
  }

  /**
   * Zooms the vertical axis out
   * @public
   */
  zoomOutVertical() {
    this.verticalZoomProperty.value = Utils.clamp(this.verticalZoomProperty.value * this.verticalZoomScale, this.minVerticalZoom, this.maxVerticalZoom);
  }

  /**
   * Updates everything in the axes view node
   * @public
   */
  update() {
    this.horizontalTickLabelMax.string = this.model.wavelengthMax / 1000; // Conversion from nm to microns
    if (this.verticalZoomProperty.value < 0.01) {
      const notationObject = ScientificNotationNode.toScientificNotation(this.verticalZoomProperty.value, {
        mantissaDecimalPlaces: 0
      });
      let formattedString = notationObject.mantissa;
      if (notationObject.exponent !== '0') {
        formattedString += `\u2009\u00D7\u200A10<sup>${notationObject.exponent}</sup>`;
      }
      this.verticalTickLabelMax.string = formattedString;
    } else {
      this.verticalTickLabelMax.string = this.truncateNum(this.verticalZoomProperty.value, 2, 2);
    }
    this.verticalTickLabelMax.right = this.axesPath.left;
    this.verticalTickLabelMax.bottom = this.axesPath.top;
  }

  /**
   * Sets sigfigs of a number, then truncates to decimal limit
   * Returns number as a string
   * @param {number} value
   * @param {number} significantFigures
   * @param {number} decimals
   * @private
   */
  truncateNum(value, significantFigures, decimals) {
    const sfNumber = parseFloat(value.toPrecision(significantFigures));
    return Utils.numberOfDecimalPlaces(sfNumber) > decimals ? Utils.toFixed(sfNumber, decimals) : sfNumber.toString();
  }
}
blackbodySpectrum.register('ZoomableAxesView', ZoomableAxesView);
export default ZoomableAxesView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwiVXRpbHMiLCJTaGFwZSIsIm1lcmdlIiwiUGhldEZvbnQiLCJTY2llbnRpZmljTm90YXRpb25Ob2RlIiwiTm9kZSIsIlBhdGgiLCJSaWNoVGV4dCIsIlRleHQiLCJUYW5kZW0iLCJCbGFja2JvZHlDb25zdGFudHMiLCJibGFja2JvZHlTcGVjdHJ1bSIsIkJsYWNrYm9keVNwZWN0cnVtU3RyaW5ncyIsIkJsYWNrYm9keUNvbG9ycyIsIlNQRUNUUkFMX1BPV0VSX0RFTlNJVFlfQ09OVkVSU0lPTl9GQUNUT1IiLCJFTEVDVFJPTUFHTkVUSUNfU1BFQ1RSVU1fTEFCRUxfQ1VUT0ZGIiwiaW5mcmFyZWRTdHJpbmciLCJpbmZyYXJlZCIsInNwZWN0cmFsUG93ZXJEZW5zaXR5TGFiZWxTdHJpbmciLCJzcGVjdHJhbFBvd2VyRGVuc2l0eUxhYmVsIiwic3VidGl0bGVMYWJlbFN0cmluZyIsInN1YnRpdGxlTGFiZWwiLCJ1bHRyYXZpb2xldFN0cmluZyIsInVsdHJhdmlvbGV0IiwidmlzaWJsZVN0cmluZyIsInZpc2libGUiLCJ3YXZlbGVuZ3RoTGFiZWxTdHJpbmciLCJ3YXZlbGVuZ3RoTGFiZWwiLCJ4UmF5U3RyaW5nIiwieFJheSIsIkVMRUNUUk9NQUdORVRJQ19TUEVDVFJVTV9MQUJFTF9WQUxVRVMiLCJ4cmF5IiwibGFiZWwiLCJtYXhXYXZlbGVuZ3RoIiwieFJheVdhdmVsZW5ndGgiLCJ1bHRyYXZpb2xldFdhdmVsZW5ndGgiLCJ2aXNpYmxlV2F2ZWxlbmd0aCIsImluZnJhcmVkV2F2ZWxlbmd0aCIsIlpvb21hYmxlQXhlc1ZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwib3B0aW9ucyIsImF4ZXNXaWR0aCIsImF4ZXNIZWlnaHQiLCJheGVzUGF0aE9wdGlvbnMiLCJzdHJva2UiLCJncmFwaEF4ZXNTdHJva2VQcm9wZXJ0eSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJsaW5lSm9pbiIsInRpY2tzUGF0aE9wdGlvbnMiLCJ3YXZlbGVuZ3RoUGVyVGljayIsIm1pbm9yVGlja3NQZXJNYWpvclRpY2siLCJtaW5vclRpY2tMZW5ndGgiLCJtYWpvclRpY2tMZW5ndGgiLCJob3Jpem9udGFsWm9vbUZhY3RvciIsInZlcnRpY2FsWm9vbUZhY3RvciIsImRlZmF1bHRIb3Jpem9udGFsWm9vbSIsIndhdmVsZW5ndGhNYXgiLCJkZWZhdWx0VmVydGljYWxab29tIiwibWlub3JUaWNrTWF4SG9yaXpvbnRhbFpvb20iLCJheGlzQm91bmRzTGFiZWxDb2xvciIsInRpdGxlc1RleHRQcm9wZXJ0eSIsImF4aXNMYWJlbENvbG9yIiwiZWxlY3Ryb21hZ25ldGljU3BlY3RydW1MYWJlbFRleHRPcHRpb25zIiwiZm9udCIsImZpbGwiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImhvcml6b250YWxBeGlzTGVuZ3RoIiwidmVydGljYWxBeGlzTGVuZ3RoIiwiaG9yaXpvbnRhbFpvb21TY2FsZSIsInZlcnRpY2FsWm9vbVNjYWxlIiwiYXhlc1BhdGgiLCJtb3ZlVG8iLCJsaW5lVG8iLCJjbGlwU2hhcGUiLCJyZWN0YW5nbGUiLCJob3Jpem9udGFsVGlja3NQYXRoIiwiZWxlY3Ryb21hZ25ldGljU3BlY3RydW1BeGlzUGF0aCIsImVsZWN0cm9tYWduZXRpY1NwZWN0cnVtVGlja3NQYXRoIiwiZWxlY3Ryb21hZ25ldGljU3BlY3RydW1MYWJlbFRleHRzIiwiY2hpbGRyZW4iLCJfIiwidmFsdWVzIiwibWFwIiwiY29uZmlnIiwicmVnaW9uTGFiZWwiLCJib3R0b20iLCJ0b3AiLCJ2ZXJ0aWNhbEF4aXNMYWJlbE5vZGUiLCJMQUJFTF9GT05UIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJtYXhXaWR0aCIsImhvcml6b250YWxBeGlzVG9wTGFiZWxOb2RlIiwiaG9yaXpvbnRhbEF4aXNCb3R0b21MYWJlbFRleHQiLCJjcmVhdGVUYW5kZW0iLCJob3Jpem9udGFsQXhpc0xhYmVsTm9kZSIsImhvcml6b250YWxab29tUHJvcGVydHkiLCJyYW5nZSIsIm1pbkhvcml6b250YWxab29tIiwibWF4SG9yaXpvbnRhbFpvb20iLCJ2ZXJ0aWNhbFpvb21Qcm9wZXJ0eSIsIm1pblZlcnRpY2FsWm9vbSIsIm1heFZlcnRpY2FsWm9vbSIsImxpbmsiLCJob3Jpem9udGFsWm9vbSIsInJlZHJhd0hvcml6b250YWxUaWNrcyIsInJlZHJhd0VsZWN0cm9tYWduZXRpY1NwZWN0cnVtTGFiZWwiLCJsYWJlbHNWaXNpYmxlUHJvcGVydHkiLCJsYWJlbHNWaXNpYmxlIiwiaG9yaXpvbnRhbFRpY2tMYWJlbFplcm8iLCJob3Jpem9udGFsVGlja0xhYmVsTWF4IiwidmVydGljYWxUaWNrTGFiZWxNYXgiLCJ0cnVuY2F0ZU51bSIsInZhbHVlIiwicmlnaHQiLCJsZWZ0IiwiY2VudGVyWCIsImNlbnRlclkiLCJhZGRDaGlsZCIsInJlc2V0IiwiaG9yaXpvbnRhbFRpY2tzU2hhcGUiLCJpIiwidGlja0hlaWdodCIsIngiLCJ3YXZlbGVuZ3RoVG9WaWV3WCIsInNoYXBlIiwibGFiZWxzVGlja1NoYXBlIiwidGlja1Bvc2l0aW9ucyIsImZpbHRlciIsImZvckVhY2giLCJib3R0b21ZIiwibGFiZWxCb3VuZHMiLCJjb25jYXQiLCJsZW5ndGgiLCJsb3dlckJvdW5kIiwidXBwZXJCb3VuZCIsImFzc2VydCIsIndhdmVsZW5ndGgiLCJsaW5lYXIiLCJ2aWV3WFRvV2F2ZWxlbmd0aCIsInZpZXdYIiwic3BlY3RyYWxQb3dlckRlbnNpdHlUb1ZpZXdZIiwic3BlY3RyYWxQb3dlckRlbnNpdHkiLCJ2aWV3WVRvU3BlY3RyYWxQb3dlckRlbnNpdHkiLCJ2aWV3WSIsInpvb21Jbkhvcml6b250YWwiLCJjbGFtcCIsInpvb21PdXRIb3Jpem9udGFsIiwiem9vbUluVmVydGljYWwiLCJ6b29tT3V0VmVydGljYWwiLCJ1cGRhdGUiLCJzdHJpbmciLCJub3RhdGlvbk9iamVjdCIsInRvU2NpZW50aWZpY05vdGF0aW9uIiwibWFudGlzc2FEZWNpbWFsUGxhY2VzIiwiZm9ybWF0dGVkU3RyaW5nIiwibWFudGlzc2EiLCJleHBvbmVudCIsInNpZ25pZmljYW50RmlndXJlcyIsImRlY2ltYWxzIiwic2ZOdW1iZXIiLCJwYXJzZUZsb2F0IiwidG9QcmVjaXNpb24iLCJudW1iZXJPZkRlY2ltYWxQbGFjZXMiLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlpvb21hYmxlQXhlc1ZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQSB2aWV3IHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIGNvbnRyb2xsaW5nIGdyYXBoIGF4ZXNcclxuICogSGFuZGxlcyBsYWJlbHMgZm9yIGRpc3BsYXlpbmcgcmVnaW9ucyBvZiB0aGUgZWxlY3Ryb21hZ25ldGljIHNwZWN0cnVtXHJcbiAqIEFsc28gaGFuZGxlcyBheGVzIGxhYmVscyBhbmQgdGljayBsYWJlbHNcclxuICogTW9zdCBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSBpcyBoYW5kbGluZyBjb252ZXJzaW9ucyBiZXR3ZWVuIGxvZ2ljYWwgdmFsdWVzIGFuZCBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICpcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqIEBhdXRob3IgQXJuYWIgUHVya2F5YXN0aGFcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCBTY2llbnRpZmljTm90YXRpb25Ob2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9TY2llbnRpZmljTm90YXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgUGF0aCwgUmljaFRleHQsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQmxhY2tib2R5Q29uc3RhbnRzIGZyb20gJy4uLy4uL0JsYWNrYm9keUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBibGFja2JvZHlTcGVjdHJ1bSBmcm9tICcuLi8uLi9ibGFja2JvZHlTcGVjdHJ1bS5qcyc7XHJcbmltcG9ydCBCbGFja2JvZHlTcGVjdHJ1bVN0cmluZ3MgZnJvbSAnLi4vLi4vQmxhY2tib2R5U3BlY3RydW1TdHJpbmdzLmpzJztcclxuaW1wb3J0IEJsYWNrYm9keUNvbG9ycyBmcm9tICcuL0JsYWNrYm9keUNvbG9ycy5qcyc7XHJcblxyXG4vLyBmcm9tIG5tIHRvIG0gdG8gdGhlIGZpZnRoIHBvd2VyICgxZTQ1KSBhbmQgTWVnYS9taWNyb24gKDFlLTEyKVxyXG5jb25zdCBTUEVDVFJBTF9QT1dFUl9ERU5TSVRZX0NPTlZFUlNJT05fRkFDVE9SID0gMWUzMztcclxuY29uc3QgRUxFQ1RST01BR05FVElDX1NQRUNUUlVNX0xBQkVMX0NVVE9GRiA9IDIwO1xyXG5cclxuY29uc3QgaW5mcmFyZWRTdHJpbmcgPSBCbGFja2JvZHlTcGVjdHJ1bVN0cmluZ3MuaW5mcmFyZWQ7XHJcbmNvbnN0IHNwZWN0cmFsUG93ZXJEZW5zaXR5TGFiZWxTdHJpbmcgPSBCbGFja2JvZHlTcGVjdHJ1bVN0cmluZ3Muc3BlY3RyYWxQb3dlckRlbnNpdHlMYWJlbDtcclxuY29uc3Qgc3VidGl0bGVMYWJlbFN0cmluZyA9IEJsYWNrYm9keVNwZWN0cnVtU3RyaW5ncy5zdWJ0aXRsZUxhYmVsO1xyXG5jb25zdCB1bHRyYXZpb2xldFN0cmluZyA9IEJsYWNrYm9keVNwZWN0cnVtU3RyaW5ncy51bHRyYXZpb2xldDtcclxuY29uc3QgdmlzaWJsZVN0cmluZyA9IEJsYWNrYm9keVNwZWN0cnVtU3RyaW5ncy52aXNpYmxlO1xyXG5jb25zdCB3YXZlbGVuZ3RoTGFiZWxTdHJpbmcgPSBCbGFja2JvZHlTcGVjdHJ1bVN0cmluZ3Mud2F2ZWxlbmd0aExhYmVsO1xyXG5jb25zdCB4UmF5U3RyaW5nID0gQmxhY2tib2R5U3BlY3RydW1TdHJpbmdzLnhSYXk7XHJcblxyXG4vLyBNYXggd2F2ZWxlbmd0aHMgZm9yIGVhY2ggcmVnaW9uIG9mIHRoZSBlbGVjdHJvbWFnbmV0aWMgc3BlY3RydW0gaW4gbm0sIHR5cGUgT2JqZWN0XHJcbmNvbnN0IEVMRUNUUk9NQUdORVRJQ19TUEVDVFJVTV9MQUJFTF9WQUxVRVMgPSB7XHJcbiAgeHJheToge1xyXG4gICAgbGFiZWw6IHhSYXlTdHJpbmcsXHJcbiAgICBtYXhXYXZlbGVuZ3RoOiBCbGFja2JvZHlDb25zdGFudHMueFJheVdhdmVsZW5ndGhcclxuICB9LFxyXG4gIHVsdHJhdmlvbGV0OiB7XHJcbiAgICBsYWJlbDogdWx0cmF2aW9sZXRTdHJpbmcsXHJcbiAgICBtYXhXYXZlbGVuZ3RoOiBCbGFja2JvZHlDb25zdGFudHMudWx0cmF2aW9sZXRXYXZlbGVuZ3RoXHJcbiAgfSxcclxuICB2aXNpYmxlOiB7XHJcbiAgICBsYWJlbDogdmlzaWJsZVN0cmluZyxcclxuICAgIG1heFdhdmVsZW5ndGg6IEJsYWNrYm9keUNvbnN0YW50cy52aXNpYmxlV2F2ZWxlbmd0aFxyXG4gIH0sXHJcbiAgaW5mcmFyZWQ6IHtcclxuICAgIGxhYmVsOiBpbmZyYXJlZFN0cmluZyxcclxuICAgIG1heFdhdmVsZW5ndGg6IEJsYWNrYm9keUNvbnN0YW50cy5pbmZyYXJlZFdhdmVsZW5ndGhcclxuICB9XHJcbn07XHJcblxyXG5jbGFzcyBab29tYWJsZUF4ZXNWaWV3IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1ha2VzIGEgWm9vbWFibGVBeGVzVmlld1xyXG4gICAqIEBwYXJhbSB7QmxhY2tib2R5U3BlY3RydW1Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBvcHRpb25zICkge1xyXG5cclxuICAgIC8vIERlZmF1bHQgb3B0aW9uc1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGF4ZXNXaWR0aDogNTUwLFxyXG4gICAgICBheGVzSGVpZ2h0OiA0MDAsXHJcbiAgICAgIGF4ZXNQYXRoT3B0aW9uczoge1xyXG4gICAgICAgIHN0cm9rZTogQmxhY2tib2R5Q29sb3JzLmdyYXBoQXhlc1N0cm9rZVByb3BlcnR5LFxyXG4gICAgICAgIGxpbmVXaWR0aDogMyxcclxuICAgICAgICBsaW5lQ2FwOiAncm91bmQnLFxyXG4gICAgICAgIGxpbmVKb2luOiAncm91bmQnXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpY2tzUGF0aE9wdGlvbnM6IHtcclxuICAgICAgICBzdHJva2U6IEJsYWNrYm9keUNvbG9ycy5ncmFwaEF4ZXNTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgICAgbGluZUNhcDogJ2J1dHQnLFxyXG4gICAgICAgIGxpbmVKb2luOiAnYmV2ZWwnXHJcbiAgICAgIH0sXHJcbiAgICAgIHdhdmVsZW5ndGhQZXJUaWNrOiAxMDAsXHJcbiAgICAgIG1pbm9yVGlja3NQZXJNYWpvclRpY2s6IDUsXHJcbiAgICAgIG1pbm9yVGlja0xlbmd0aDogMTAsXHJcbiAgICAgIG1ham9yVGlja0xlbmd0aDogMjAsXHJcbiAgICAgIGhvcml6b250YWxab29tRmFjdG9yOiAyLFxyXG4gICAgICB2ZXJ0aWNhbFpvb21GYWN0b3I6IDUsXHJcbiAgICAgIGRlZmF1bHRIb3Jpem9udGFsWm9vbTogbW9kZWwud2F2ZWxlbmd0aE1heCxcclxuICAgICAgZGVmYXVsdFZlcnRpY2FsWm9vbTogMTAwLjAsXHJcbiAgICAgIG1pbm9yVGlja01heEhvcml6b250YWxab29tOiAxMjAwMCxcclxuICAgICAgYXhpc0JvdW5kc0xhYmVsQ29sb3I6IEJsYWNrYm9keUNvbG9ycy50aXRsZXNUZXh0UHJvcGVydHksXHJcbiAgICAgIGF4aXNMYWJlbENvbG9yOiBCbGFja2JvZHlDb2xvcnMudGl0bGVzVGV4dFByb3BlcnR5LFxyXG4gICAgICBlbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bUxhYmVsVGV4dE9wdGlvbnM6IHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE0ICksXHJcbiAgICAgICAgZmlsbDogQmxhY2tib2R5Q29sb3JzLnRpdGxlc1RleHRQcm9wZXJ0eVxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENhbGwgdG8gbm9kZSBzdXBlcmNvbnN0cnVjdG9yOiBubyBvcHRpb25zIHBhc3NlZCBpblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIC8vIEF4ZXMgZGltZW5zaW9uc1xyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5ob3Jpem9udGFsQXhpc0xlbmd0aCA9IG9wdGlvbnMuYXhlc1dpZHRoO1xyXG4gICAgdGhpcy52ZXJ0aWNhbEF4aXNMZW5ndGggPSBvcHRpb25zLmF4ZXNIZWlnaHQ7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSAtIEhvdyBlYWNoIGF4aXMgc2NhbGVzXHJcbiAgICB0aGlzLmhvcml6b250YWxab29tU2NhbGUgPSBvcHRpb25zLmhvcml6b250YWxab29tRmFjdG9yO1xyXG4gICAgdGhpcy52ZXJ0aWNhbFpvb21TY2FsZSA9IG9wdGlvbnMudmVydGljYWxab29tRmFjdG9yO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIFRoZSBwYXRoIGZvciB0aGUgYWN0dWFsIGF4ZXMgdGhlbXNlbHZlc1xyXG4gICAgdGhpcy5heGVzUGF0aCA9IG5ldyBQYXRoKFxyXG4gICAgICBuZXcgU2hhcGUoKVxyXG4gICAgICAgIC5tb3ZlVG8oIHRoaXMuaG9yaXpvbnRhbEF4aXNMZW5ndGgsIC01IClcclxuICAgICAgICAubGluZVRvKCB0aGlzLmhvcml6b250YWxBeGlzTGVuZ3RoLCAwIClcclxuICAgICAgICAubGluZVRvKCAwLCAwIClcclxuICAgICAgICAubGluZVRvKCAwLCAtdGhpcy52ZXJ0aWNhbEF4aXNMZW5ndGggKVxyXG4gICAgICAgIC5saW5lVG8oIDUsIC10aGlzLnZlcnRpY2FsQXhpc0xlbmd0aCApLFxyXG4gICAgICBvcHRpb25zLmF4ZXNQYXRoT3B0aW9uc1xyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIENsaXBwaW5nIHNoYXBlIGZvciBrZWVwaW5nIGVsZW1lbnRzIGluc2lkZSBncmFwaCBheGVzIC0gY2xpcHMgdGhlIHBhdGhzIHRvIHRoZSBheGVzIGJvdW5kcywgcHVzaGVkXHJcbiAgICAvLyBzaGFwZSBkb3duIDEgcGl4ZWwgdG8gcHJldmVudCBwZXJmb3JtYW5jZSBkZWdyYWRhdGlvbiB3aGVuIGNsaXBwaW5nIGF0IGxvdyB0ZW1wZXJhdHVyZXNcclxuICAgIHRoaXMuY2xpcFNoYXBlID0gU2hhcGUucmVjdGFuZ2xlKCAwLCAxLCB0aGlzLmhvcml6b250YWxBeGlzTGVuZ3RoLCAtdGhpcy52ZXJ0aWNhbEF4aXNMZW5ndGggLSAxICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgUGF0aCBmb3IgdGhlIGhvcml6b250YWwgYXhlcyB0aWNrc1xyXG4gICAgdGhpcy5ob3Jpem9udGFsVGlja3NQYXRoID0gbmV3IFBhdGgoIG51bGwsIG9wdGlvbnMudGlja3NQYXRoT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIENvbXBvbmVudHMgZm9yIHRoZSBlbGVjdHJvbWFnbmV0aWMgc3BlY3RydW0gbGFiZWxzXHJcbiAgICB0aGlzLmVsZWN0cm9tYWduZXRpY1NwZWN0cnVtQXhpc1BhdGggPSBuZXcgUGF0aChcclxuICAgICAgbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAtdGhpcy52ZXJ0aWNhbEF4aXNMZW5ndGggKS5saW5lVG8oIHRoaXMuaG9yaXpvbnRhbEF4aXNMZW5ndGgsIC10aGlzLnZlcnRpY2FsQXhpc0xlbmd0aCApLFxyXG4gICAgICBtZXJnZSggb3B0aW9ucy5heGVzUGF0aE9wdGlvbnMsIHsgbGluZVdpZHRoOiAxIH0gKVxyXG4gICAgKTtcclxuICAgIHRoaXMuZWxlY3Ryb21hZ25ldGljU3BlY3RydW1UaWNrc1BhdGggPSBuZXcgUGF0aCggbnVsbCwgb3B0aW9ucy50aWNrc1BhdGhPcHRpb25zICk7XHJcbiAgICB0aGlzLmVsZWN0cm9tYWduZXRpY1NwZWN0cnVtTGFiZWxUZXh0cyA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBfLnZhbHVlcyggRUxFQ1RST01BR05FVElDX1NQRUNUUlVNX0xBQkVMX1ZBTFVFUyApLm1hcCggY29uZmlnID0+IHtcclxuICAgICAgICBjb25zdCByZWdpb25MYWJlbCA9IG5ldyBUZXh0KCBjb25maWcubGFiZWwsIG9wdGlvbnMuZWxlY3Ryb21hZ25ldGljU3BlY3RydW1MYWJlbFRleHRPcHRpb25zICk7XHJcbiAgICAgICAgcmVnaW9uTGFiZWwuYm90dG9tID0gdGhpcy5lbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bUF4aXNQYXRoLnRvcDtcclxuICAgICAgICByZXR1cm4gcmVnaW9uTGFiZWw7XHJcbiAgICAgIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIEhvcml6b250YWwgdGljayBzZXR0aW5nc1xyXG4gICAgdGhpcy53YXZlbGVuZ3RoUGVyVGljayA9IG9wdGlvbnMud2F2ZWxlbmd0aFBlclRpY2s7XHJcbiAgICB0aGlzLm1pbm9yVGlja3NQZXJNYWpvclRpY2sgPSBvcHRpb25zLm1pbm9yVGlja3NQZXJNYWpvclRpY2s7XHJcbiAgICB0aGlzLm1pbm9yVGlja0xlbmd0aCA9IG9wdGlvbnMubWlub3JUaWNrTGVuZ3RoO1xyXG4gICAgdGhpcy5tYWpvclRpY2tMZW5ndGggPSBvcHRpb25zLm1ham9yVGlja0xlbmd0aDtcclxuICAgIHRoaXMubWlub3JUaWNrTWF4SG9yaXpvbnRhbFpvb20gPSBvcHRpb25zLm1pbm9yVGlja01heEhvcml6b250YWxab29tO1xyXG5cclxuICAgIC8vIExhYmVscyBmb3IgdGhlIGF4ZXNcclxuICAgIGNvbnN0IHZlcnRpY2FsQXhpc0xhYmVsTm9kZSA9IG5ldyBUZXh0KCBzcGVjdHJhbFBvd2VyRGVuc2l0eUxhYmVsU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IEJsYWNrYm9keUNvbnN0YW50cy5MQUJFTF9GT05ULFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmF4aXNMYWJlbENvbG9yLFxyXG4gICAgICByb3RhdGlvbjogLU1hdGguUEkgLyAyLFxyXG4gICAgICBtYXhXaWR0aDogb3B0aW9ucy5heGVzSGVpZ2h0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgYXhlc1dpZHRoID0gb3B0aW9ucy5heGVzV2lkdGggKiAwLjg7XHJcbiAgICBjb25zdCBob3Jpem9udGFsQXhpc1RvcExhYmVsTm9kZSA9IG5ldyBUZXh0KCB3YXZlbGVuZ3RoTGFiZWxTdHJpbmcsIHtcclxuICAgICAgZm9udDogQmxhY2tib2R5Q29uc3RhbnRzLkxBQkVMX0ZPTlQsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuYXhpc0xhYmVsQ29sb3IsXHJcbiAgICAgIG1heFdpZHRoOiBheGVzV2lkdGhcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGhvcml6b250YWxBeGlzQm90dG9tTGFiZWxUZXh0ID0gbmV3IFRleHQoIHN1YnRpdGxlTGFiZWxTdHJpbmcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxNiApLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmF4aXNMYWJlbENvbG9yLFxyXG4gICAgICBtYXhXaWR0aDogYXhlc1dpZHRoLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hvcml6b250YWxBeGlzU3VidGl0bGVMYWJlbFRleHQnIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGhvcml6b250YWxBeGlzTGFiZWxOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgaG9yaXpvbnRhbEF4aXNUb3BMYWJlbE5vZGUsIGhvcml6b250YWxBeGlzQm90dG9tTGFiZWxUZXh0IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48bnVtYmVyPn0gY3VycmVudCB6b29tIHZhbHVlc1xyXG4gICAgdGhpcy5ob3Jpem9udGFsWm9vbVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBvcHRpb25zLmRlZmF1bHRIb3Jpem9udGFsWm9vbSwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBCbGFja2JvZHlDb25zdGFudHMubWluSG9yaXpvbnRhbFpvb20sIEJsYWNrYm9keUNvbnN0YW50cy5tYXhIb3Jpem9udGFsWm9vbSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2hvcml6b250YWxab29tUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMudmVydGljYWxab29tUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuZGVmYXVsdFZlcnRpY2FsWm9vbSwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBCbGFja2JvZHlDb25zdGFudHMubWluVmVydGljYWxab29tLCBCbGFja2JvZHlDb25zdGFudHMubWF4VmVydGljYWxab29tICksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVydGljYWxab29tUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtudW1iZXJ9IHpvb20gYm91bmRzXHJcbiAgICB0aGlzLm1pbkhvcml6b250YWxab29tID0gQmxhY2tib2R5Q29uc3RhbnRzLm1pbkhvcml6b250YWxab29tO1xyXG4gICAgdGhpcy5tYXhIb3Jpem9udGFsWm9vbSA9IEJsYWNrYm9keUNvbnN0YW50cy5tYXhIb3Jpem9udGFsWm9vbTtcclxuICAgIHRoaXMubWluVmVydGljYWxab29tID0gQmxhY2tib2R5Q29uc3RhbnRzLm1pblZlcnRpY2FsWm9vbTtcclxuICAgIHRoaXMubWF4VmVydGljYWxab29tID0gQmxhY2tib2R5Q29uc3RhbnRzLm1heFZlcnRpY2FsWm9vbTtcclxuXHJcbiAgICAvLyBAcHVibGljIExpbmtzIHRoZSBob3Jpem9udGFsIHpvb20gUHJvcGVydHkgdG8gdXBkYXRlIHRoZSBtb2RlbCBmb3IgdGhlIG1heCB3YXZlbGVuZ3RoXHJcbiAgICB0aGlzLmhvcml6b250YWxab29tUHJvcGVydHkubGluayggaG9yaXpvbnRhbFpvb20gPT4ge1xyXG4gICAgICBtb2RlbC53YXZlbGVuZ3RoTWF4ID0gaG9yaXpvbnRhbFpvb207XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBMaW5rcyB0aGUgaG9yaXpvbnRhbCB6b29tIFByb3BlcnR5IHRvIHVwZGF0ZSBob3Jpem9udGFsIHRpY2tzIGFuZCB0aGUgRU0gc3BlY3RydW0gbGFiZWxzIG9uIGNoYW5nZVxyXG4gICAgdGhpcy5ob3Jpem9udGFsWm9vbVByb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgdGhpcy5yZWRyYXdIb3Jpem9udGFsVGlja3MoKTtcclxuICAgICAgdGhpcy5yZWRyYXdFbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bUxhYmVsKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyBMaW5rcyB0aGUgbW9kZWwncyBsYWJlbHNWaXNpYmxlUHJvcGVydHkgd2l0aCB0aGUgZWxlY3Ryb21hZ25ldGljIHNwZWN0cnVtIGxhYmVsJ3MgdmlzaWJpbGl0eVxyXG4gICAgdGhpcy5tb2RlbC5sYWJlbHNWaXNpYmxlUHJvcGVydHkubGluayggbGFiZWxzVmlzaWJsZSA9PiB7XHJcbiAgICAgIHRoaXMuZWxlY3Ryb21hZ25ldGljU3BlY3RydW1BeGlzUGF0aC52aXNpYmxlID0gbGFiZWxzVmlzaWJsZTtcclxuICAgICAgdGhpcy5lbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bVRpY2tzUGF0aC52aXNpYmxlID0gbGFiZWxzVmlzaWJsZTtcclxuICAgICAgdGhpcy5lbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bUxhYmVsVGV4dHMudmlzaWJsZSA9IGxhYmVsc1Zpc2libGU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgTGFiZWxzIGZvciBheGVzIGJvdW5kc1xyXG4gICAgdGhpcy5ob3Jpem9udGFsVGlja0xhYmVsWmVybyA9IG5ldyBUZXh0KCAnMCcsIHtcclxuICAgICAgZm9udDogQmxhY2tib2R5Q29uc3RhbnRzLkxBQkVMX0ZPTlQsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMuYXhpc0JvdW5kc0xhYmVsQ29sb3JcclxuICAgIH0gKTtcclxuICAgIHRoaXMuaG9yaXpvbnRhbFRpY2tMYWJlbE1heCA9IG5ldyBUZXh0KCBtb2RlbC53YXZlbGVuZ3RoTWF4IC8gMTAwMCwge1xyXG4gICAgICBmb250OiBCbGFja2JvZHlDb25zdGFudHMuTEFCRUxfRk9OVCxcclxuICAgICAgZmlsbDogb3B0aW9ucy5heGlzQm91bmRzTGFiZWxDb2xvclxyXG4gICAgfSApO1xyXG4gICAgdGhpcy52ZXJ0aWNhbFRpY2tMYWJlbE1heCA9IG5ldyBSaWNoVGV4dCggdGhpcy50cnVuY2F0ZU51bSggdGhpcy52ZXJ0aWNhbFpvb21Qcm9wZXJ0eS52YWx1ZSwgMywgNSApLCB7XHJcbiAgICAgIGZvbnQ6IEJsYWNrYm9keUNvbnN0YW50cy5MQUJFTF9GT05ULFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmF4aXNCb3VuZHNMYWJlbENvbG9yLFxyXG4gICAgICBtYXhXaWR0aDogNjBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXQgbGF5b3V0IG9mIGxhYmVscyByZWxhdGl2ZSB0byBheGVzLCB0aGVzZSBvYmplY3RzIGFyZSBzdGF0aWNcclxuICAgIC8vIFJlbWFpbmluZyBvYmplY3QgbGF5b3V0cyBhcmUgc2V0IGluIHVwZGF0ZSgpIGJlbG93XHJcbiAgICB0aGlzLmhvcml6b250YWxUaWNrTGFiZWxaZXJvLnRvcCA9IHRoaXMuYXhlc1BhdGguYm90dG9tO1xyXG4gICAgdGhpcy5ob3Jpem9udGFsVGlja0xhYmVsWmVyby5yaWdodCA9IHRoaXMuYXhlc1BhdGgubGVmdDtcclxuICAgIHRoaXMuaG9yaXpvbnRhbFRpY2tMYWJlbE1heC50b3AgPSB0aGlzLmF4ZXNQYXRoLmJvdHRvbTtcclxuICAgIHRoaXMuaG9yaXpvbnRhbFRpY2tMYWJlbE1heC5sZWZ0ID0gdGhpcy5heGVzUGF0aC5yaWdodDtcclxuICAgIHZlcnRpY2FsQXhpc0xhYmVsTm9kZS5jZW50ZXJYID0gdGhpcy5heGVzUGF0aC5sZWZ0IC0gOTA7XHJcbiAgICB2ZXJ0aWNhbEF4aXNMYWJlbE5vZGUuY2VudGVyWSA9IHRoaXMuYXhlc1BhdGguY2VudGVyWTtcclxuICAgIGhvcml6b250YWxBeGlzVG9wTGFiZWxOb2RlLmNlbnRlclggPSB0aGlzLmF4ZXNQYXRoLmNlbnRlclg7XHJcbiAgICBob3Jpem9udGFsQXhpc0JvdHRvbUxhYmVsVGV4dC50b3AgPSBob3Jpem9udGFsQXhpc1RvcExhYmVsTm9kZS5ib3R0b20gKyA1O1xyXG4gICAgaG9yaXpvbnRhbEF4aXNCb3R0b21MYWJlbFRleHQuY2VudGVyWCA9IHRoaXMuYXhlc1BhdGguY2VudGVyWDtcclxuICAgIGhvcml6b250YWxBeGlzTGFiZWxOb2RlLmNlbnRlclkgPSB0aGlzLmF4ZXNQYXRoLmJvdHRvbSArIDU5O1xyXG5cclxuICAgIC8vIEFkZHMgY2hpbGRyZW4gaW4gcmVuZGVyaW5nIG9yZGVyXHJcbiAgICB0aGlzLmFkZENoaWxkKCB2ZXJ0aWNhbEF4aXNMYWJlbE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGhvcml6b250YWxBeGlzTGFiZWxOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmhvcml6b250YWxUaWNrTGFiZWxaZXJvICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmhvcml6b250YWxUaWNrTGFiZWxNYXggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudmVydGljYWxUaWNrTGFiZWxNYXggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuYXhlc1BhdGggKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuaG9yaXpvbnRhbFRpY2tzUGF0aCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5lbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bUF4aXNQYXRoICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmVsZWN0cm9tYWduZXRpY1NwZWN0cnVtVGlja3NQYXRoICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmVsZWN0cm9tYWduZXRpY1NwZWN0cnVtTGFiZWxUZXh0cyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzZXRzIHRoZSBheGVzIHRvIHRoZWlyIGRlZmF1bHQgc3RhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmhvcml6b250YWxab29tUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmVydGljYWxab29tUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIFpvb21hYmxlQXhlc1ZpZXcncyBob3Jpem9udGFsIHRpY2tzIHRvIGNvbXBseSB3aXRoIGFueSBuZXcgY2hhbmdlc1xyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVkcmF3SG9yaXpvbnRhbFRpY2tzKCkge1xyXG4gICAgY29uc3QgaG9yaXpvbnRhbFRpY2tzU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMubW9kZWwud2F2ZWxlbmd0aE1heCAvIHRoaXMud2F2ZWxlbmd0aFBlclRpY2s7IGkrKyApIHtcclxuICAgICAgbGV0IHRpY2tIZWlnaHQgPSB0aGlzLm1pbm9yVGlja0xlbmd0aDtcclxuICAgICAgaWYgKCB0aGlzLm1vZGVsLndhdmVsZW5ndGhNYXggPiB0aGlzLm1pbm9yVGlja01heEhvcml6b250YWxab29tICkge1xyXG4gICAgICAgIHRpY2tIZWlnaHQgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggaSAlIHRoaXMubWlub3JUaWNrc1Blck1ham9yVGljayA9PT0gMCApIHtcclxuICAgICAgICB0aWNrSGVpZ2h0ID0gdGhpcy5tYWpvclRpY2tMZW5ndGg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHggPSB0aGlzLndhdmVsZW5ndGhUb1ZpZXdYKCBpICogdGhpcy53YXZlbGVuZ3RoUGVyVGljayApO1xyXG4gICAgICBob3Jpem9udGFsVGlja3NTaGFwZS5tb3ZlVG8oIHgsIDAgKS5saW5lVG8oIHgsIC10aWNrSGVpZ2h0ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmhvcml6b250YWxUaWNrc1BhdGguc2hhcGUgPSBob3Jpem9udGFsVGlja3NTaGFwZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgdGhlIFpvb21hYmxlQXhlc1ZpZXcncyBlbGVjdHJvbWFnbmV0aWMgc3BlY3RydW0gbGFiZWwgdG8gY29tcGx5IHdpdGggYW55IG5ldyBjaGFuZ2VzXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICByZWRyYXdFbGVjdHJvbWFnbmV0aWNTcGVjdHJ1bUxhYmVsKCkge1xyXG5cclxuICAgIC8vIE1ha2VzIHRoZSB0aWNrcyBmb3IgZGVtYXJjYXRpbmcgcmVnaW9ucyBvZiB0aGUgZWxlY3Ryb21hZ25ldGljIHNwZWN0cnVtXHJcbiAgICBjb25zdCBsYWJlbHNUaWNrU2hhcGUgPSBuZXcgU2hhcGUoKTtcclxuICAgIGNvbnN0IHRpY2tQb3NpdGlvbnMgPSBfLnZhbHVlcyggRUxFQ1RST01BR05FVElDX1NQRUNUUlVNX0xBQkVMX1ZBTFVFUyApLmZpbHRlciggY29uZmlnID0+IHtcclxuICAgICAgcmV0dXJuIGNvbmZpZy5tYXhXYXZlbGVuZ3RoIDw9IHRoaXMubW9kZWwud2F2ZWxlbmd0aE1heDtcclxuICAgIH0gKS5tYXAoIGNvbmZpZyA9PiB7XHJcbiAgICAgIHJldHVybiB0aGlzLndhdmVsZW5ndGhUb1ZpZXdYKCBjb25maWcubWF4V2F2ZWxlbmd0aCApO1xyXG4gICAgfSApO1xyXG4gICAgdGlja1Bvc2l0aW9ucy5mb3JFYWNoKCB4ID0+IHtcclxuICAgICAgY29uc3QgYm90dG9tWSA9IC10aGlzLnZlcnRpY2FsQXhpc0xlbmd0aCArIHRoaXMubWlub3JUaWNrTGVuZ3RoIC8gMjtcclxuICAgICAgbGFiZWxzVGlja1NoYXBlLm1vdmVUbyggeCwgYm90dG9tWSApLmxpbmVUbyggeCwgYm90dG9tWSAtIHRoaXMubWlub3JUaWNrTGVuZ3RoICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmVsZWN0cm9tYWduZXRpY1NwZWN0cnVtVGlja3NQYXRoLnNoYXBlID0gbGFiZWxzVGlja1NoYXBlO1xyXG5cclxuICAgIC8vIE1ha2VzIGFsbCB0ZXh0IGxhYmVscyBpbnZpc2libGVcclxuICAgIHRoaXMuZWxlY3Ryb21hZ25ldGljU3BlY3RydW1MYWJlbFRleHRzLmNoaWxkcmVuLmZvckVhY2goIHJlZ2lvbkxhYmVsID0+IHtcclxuICAgICAgcmVnaW9uTGFiZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFVzaW5nIHRoZSBwb3NpdGlvbnMgZm9yIHRpY2sgcGxhY2VtZW50LCB1cGRhdGVzIHBvc2l0aW9ucyBvZiBlbGVjdHJvbWFnbmV0aWMgc3BlY3RydW0gdGV4dCBsYWJlbHNcclxuICAgIGNvbnN0IGxhYmVsQm91bmRzID0gWyAwIF0uY29uY2F0KCB0aWNrUG9zaXRpb25zICkuY29uY2F0KCB0aGlzLmhvcml6b250YWxBeGlzTGVuZ3RoICk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBsYWJlbEJvdW5kcy5sZW5ndGggLSAxOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGxvd2VyQm91bmQgPSBsYWJlbEJvdW5kc1sgaSBdO1xyXG4gICAgICBjb25zdCB1cHBlckJvdW5kID0gbGFiZWxCb3VuZHNbIGkgKyAxIF07XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHVwcGVyQm91bmQgPiBsb3dlckJvdW5kLCAnTGFiZWwgdGljayBwb3NpdGlvbnMgYXJlIG5vdCBpbiBvcmRlcicgKTtcclxuICAgICAgY29uc3QgcmVnaW9uTGFiZWwgPSB0aGlzLmVsZWN0cm9tYWduZXRpY1NwZWN0cnVtTGFiZWxUZXh0cy5jaGlsZHJlblsgaSBdO1xyXG4gICAgICBpZiAoIHVwcGVyQm91bmQgLSBsb3dlckJvdW5kIDwgRUxFQ1RST01BR05FVElDX1NQRUNUUlVNX0xBQkVMX0NVVE9GRiApIHtcclxuICAgICAgICBjb250aW51ZTtcclxuICAgICAgfVxyXG4gICAgICByZWdpb25MYWJlbC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgcmVnaW9uTGFiZWwubWF4V2lkdGggPSB1cHBlckJvdW5kIC0gbG93ZXJCb3VuZDtcclxuICAgICAgcmVnaW9uTGFiZWwuY2VudGVyWCA9ICggdXBwZXJCb3VuZCArIGxvd2VyQm91bmQgKSAvIDI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGdpdmVuIHdhdmVsZW5ndGggaW4gbm0gdG8gYW4geCBkaXN0YW5jZSBhbG9uZyB0aGUgdmlld1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB3YXZlbGVuZ3RoXHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgd2F2ZWxlbmd0aFRvVmlld1goIHdhdmVsZW5ndGggKSB7XHJcbiAgICByZXR1cm4gVXRpbHMubGluZWFyKCAwLCB0aGlzLm1vZGVsLndhdmVsZW5ndGhNYXgsIDAsIHRoaXMuaG9yaXpvbnRhbEF4aXNMZW5ndGgsIHdhdmVsZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgZ2l2ZW4geCBkaXN0YW5jZSBhbG9uZyB0aGUgdmlldyB0byBhIHdhdmVsZW5ndGggaW4gbm1cclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmlld1hcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB2aWV3WFRvV2F2ZWxlbmd0aCggdmlld1ggKSB7XHJcbiAgICByZXR1cm4gVXRpbHMubGluZWFyKCAwLCB0aGlzLmhvcml6b250YWxBeGlzTGVuZ3RoLCAwLCB0aGlzLm1vZGVsLndhdmVsZW5ndGhNYXgsIHZpZXdYICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0cyBhIGdpdmVuIHNwZWN0cmFsIHBvd2VyIGRlbnNpdHkgdG8gYSB5IGRpc3RhbmNlIGFsb25nIHRoZSB2aWV3XHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHNwZWN0cmFsUG93ZXJEZW5zaXR5XHJcbiAgICogQHJldHVybnMge251bWJlcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3BlY3RyYWxQb3dlckRlbnNpdHlUb1ZpZXdZKCBzcGVjdHJhbFBvd2VyRGVuc2l0eSApIHtcclxuICAgIHJldHVybiAtU1BFQ1RSQUxfUE9XRVJfREVOU0lUWV9DT05WRVJTSU9OX0ZBQ1RPUiAqXHJcbiAgICAgICAgICAgVXRpbHMubGluZWFyKCAwLCB0aGlzLnZlcnRpY2FsWm9vbVByb3BlcnR5LnZhbHVlLCAwLCB0aGlzLnZlcnRpY2FsQXhpc0xlbmd0aCwgc3BlY3RyYWxQb3dlckRlbnNpdHkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnRzIGEgZ2l2ZW4geSBkaXN0YW5jZSBhbG9uZyB0aGUgdmlldyB0byBhIHNwZWN0cmFsIHBvd2VyIGRlbnNpdHlcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmlld1lcclxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB2aWV3WVRvU3BlY3RyYWxQb3dlckRlbnNpdHkoIHZpZXdZICkge1xyXG4gICAgcmV0dXJuIFV0aWxzLmxpbmVhciggMCwgdGhpcy52ZXJ0aWNhbEF4aXNMZW5ndGgsIDAsIHRoaXMudmVydGljYWxab29tUHJvcGVydHkudmFsdWUsIHZpZXdZICkgL1xyXG4gICAgICAgICAgIC1TUEVDVFJBTF9QT1dFUl9ERU5TSVRZX0NPTlZFUlNJT05fRkFDVE9SO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogWm9vbXMgdGhlIGhvcml6b250YWwgYXhpcyBpblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICB6b29tSW5Ib3Jpem9udGFsKCkge1xyXG4gICAgdGhpcy5ob3Jpem9udGFsWm9vbVByb3BlcnR5LnZhbHVlID0gVXRpbHMuY2xhbXAoIHRoaXMuaG9yaXpvbnRhbFpvb21Qcm9wZXJ0eS52YWx1ZSAvIHRoaXMuaG9yaXpvbnRhbFpvb21TY2FsZSxcclxuICAgICAgdGhpcy5taW5Ib3Jpem9udGFsWm9vbSxcclxuICAgICAgdGhpcy5tYXhIb3Jpem9udGFsWm9vbVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFpvb21zIHRoZSBob3Jpem9udGFsIGF4aXMgb3V0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHpvb21PdXRIb3Jpem9udGFsKCkge1xyXG4gICAgdGhpcy5ob3Jpem9udGFsWm9vbVByb3BlcnR5LnZhbHVlID0gVXRpbHMuY2xhbXAoIHRoaXMuaG9yaXpvbnRhbFpvb21Qcm9wZXJ0eS52YWx1ZSAqIHRoaXMuaG9yaXpvbnRhbFpvb21TY2FsZSxcclxuICAgICAgdGhpcy5taW5Ib3Jpem9udGFsWm9vbSxcclxuICAgICAgdGhpcy5tYXhIb3Jpem9udGFsWm9vbVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFpvb21zIHRoZSB2ZXJ0aWNhbCBheGlzIGluXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHpvb21JblZlcnRpY2FsKCkge1xyXG4gICAgdGhpcy52ZXJ0aWNhbFpvb21Qcm9wZXJ0eS52YWx1ZSA9IFV0aWxzLmNsYW1wKCB0aGlzLnZlcnRpY2FsWm9vbVByb3BlcnR5LnZhbHVlIC8gdGhpcy52ZXJ0aWNhbFpvb21TY2FsZSxcclxuICAgICAgdGhpcy5taW5WZXJ0aWNhbFpvb20sXHJcbiAgICAgIHRoaXMubWF4VmVydGljYWxab29tXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogWm9vbXMgdGhlIHZlcnRpY2FsIGF4aXMgb3V0XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHpvb21PdXRWZXJ0aWNhbCgpIHtcclxuICAgIHRoaXMudmVydGljYWxab29tUHJvcGVydHkudmFsdWUgPSBVdGlscy5jbGFtcCggdGhpcy52ZXJ0aWNhbFpvb21Qcm9wZXJ0eS52YWx1ZSAqIHRoaXMudmVydGljYWxab29tU2NhbGUsXHJcbiAgICAgIHRoaXMubWluVmVydGljYWxab29tLFxyXG4gICAgICB0aGlzLm1heFZlcnRpY2FsWm9vbVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgZXZlcnl0aGluZyBpbiB0aGUgYXhlcyB2aWV3IG5vZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgdXBkYXRlKCkge1xyXG4gICAgdGhpcy5ob3Jpem9udGFsVGlja0xhYmVsTWF4LnN0cmluZyA9IHRoaXMubW9kZWwud2F2ZWxlbmd0aE1heCAvIDEwMDA7IC8vIENvbnZlcnNpb24gZnJvbSBubSB0byBtaWNyb25zXHJcbiAgICBpZiAoIHRoaXMudmVydGljYWxab29tUHJvcGVydHkudmFsdWUgPCAwLjAxICkge1xyXG4gICAgICBjb25zdCBub3RhdGlvbk9iamVjdCA9IFNjaWVudGlmaWNOb3RhdGlvbk5vZGUudG9TY2llbnRpZmljTm90YXRpb24oIHRoaXMudmVydGljYWxab29tUHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgICBtYW50aXNzYURlY2ltYWxQbGFjZXM6IDBcclxuICAgICAgfSApO1xyXG4gICAgICBsZXQgZm9ybWF0dGVkU3RyaW5nID0gbm90YXRpb25PYmplY3QubWFudGlzc2E7XHJcbiAgICAgIGlmICggbm90YXRpb25PYmplY3QuZXhwb25lbnQgIT09ICcwJyApIHtcclxuICAgICAgICBmb3JtYXR0ZWRTdHJpbmcgKz0gYFxcdTIwMDlcXHUwMEQ3XFx1MjAwQTEwPHN1cD4ke25vdGF0aW9uT2JqZWN0LmV4cG9uZW50fTwvc3VwPmA7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy52ZXJ0aWNhbFRpY2tMYWJlbE1heC5zdHJpbmcgPSBmb3JtYXR0ZWRTdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy52ZXJ0aWNhbFRpY2tMYWJlbE1heC5zdHJpbmcgPSB0aGlzLnRydW5jYXRlTnVtKCB0aGlzLnZlcnRpY2FsWm9vbVByb3BlcnR5LnZhbHVlLCAyLCAyICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52ZXJ0aWNhbFRpY2tMYWJlbE1heC5yaWdodCA9IHRoaXMuYXhlc1BhdGgubGVmdDtcclxuICAgIHRoaXMudmVydGljYWxUaWNrTGFiZWxNYXguYm90dG9tID0gdGhpcy5heGVzUGF0aC50b3A7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHNpZ2ZpZ3Mgb2YgYSBudW1iZXIsIHRoZW4gdHJ1bmNhdGVzIHRvIGRlY2ltYWwgbGltaXRcclxuICAgKiBSZXR1cm5zIG51bWJlciBhcyBhIHN0cmluZ1xyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaWduaWZpY2FudEZpZ3VyZXNcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHRydW5jYXRlTnVtKCB2YWx1ZSwgc2lnbmlmaWNhbnRGaWd1cmVzLCBkZWNpbWFscyApIHtcclxuICAgIGNvbnN0IHNmTnVtYmVyID0gcGFyc2VGbG9hdCggdmFsdWUudG9QcmVjaXNpb24oIHNpZ25pZmljYW50RmlndXJlcyApICk7XHJcbiAgICByZXR1cm4gKCBVdGlscy5udW1iZXJPZkRlY2ltYWxQbGFjZXMoIHNmTnVtYmVyICkgPiBkZWNpbWFscyApID8gVXRpbHMudG9GaXhlZCggc2ZOdW1iZXIsIGRlY2ltYWxzICkgOiBzZk51bWJlci50b1N0cmluZygpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbmJsYWNrYm9keVNwZWN0cnVtLnJlZ2lzdGVyKCAnWm9vbWFibGVBeGVzVmlldycsIFpvb21hYmxlQXhlc1ZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgWm9vbWFibGVBeGVzVmlldztcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsU0FBU0MsS0FBSyxRQUFRLGdDQUFnQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0Msc0JBQXNCLE1BQU0sdURBQXVEO0FBQzFGLFNBQVNDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDOUUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsaUJBQWlCLE1BQU0s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