// Copyright 2015-2022, University of Colorado Boulder

/**
 * Front of the HeaterCoolerNode.  It is independent from the HeaterCoolerBack so that one can easily layer objects
 * inside of the HeaterCoolerNode.  The HeaterCoolerFront contains the heater body, labels, and control slider.
 *
 * @author Siddhartha Chinthapally (Actual Concepts) on 20-11-2014.
 * @author Jesse Greenberg
 *
 */

import BooleanProperty from '../../axon/js/BooleanProperty.js';
import Dimension2 from '../../dot/js/Dimension2.js';
import Range from '../../dot/js/Range.js';
import { Shape } from '../../kite/js/imports.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { Color, LinearGradient, Node, Path, Text } from '../../scenery/js/imports.js';
import VSlider from '../../sun/js/VSlider.js';
import Tandem from '../../tandem/js/Tandem.js';
import HeaterCoolerBack from './HeaterCoolerBack.js';
import PhetFont from './PhetFont.js';
import sceneryPhet from './sceneryPhet.js';
import SceneryPhetStrings from './SceneryPhetStrings.js';
const DEFAULT_WIDTH = 120; // in screen coords, much of the rest of the size of the stove derives from this value

export default class HeaterCoolerFront extends Node {
  // please use judiciously, see https://github.com/phetsims/scenery-phet/issues/442

  static DEFAULT_BASE_COLOR = 'rgb( 159, 182, 205 )';

  /**
   * @param heatCoolAmountProperty +1 for max heating, -1 for max cooling
   * @param providedOptions
   */
  constructor(heatCoolAmountProperty, providedOptions) {
    super();
    const options = optionize()({
      // SelfOptions
      baseColor: HeaterCoolerFront.DEFAULT_BASE_COLOR,
      width: 120,
      heatEnabled: true,
      coolEnabled: true,
      snapToZero: true,
      snapToZeroThreshold: 0.1,
      heatString: SceneryPhetStrings.heatStringProperty,
      coolString: SceneryPhetStrings.coolStringProperty,
      labelFont: new PhetFont(14),
      labelMaxWidth: 35,
      thumbSize: new Dimension2(45, 22),
      thumbTouchAreaXDilation: 11,
      thumbTouchAreaYDilation: 11,
      thumbMouseAreaXDilation: 0,
      thumbMouseAreaYDilation: 0,
      thumbFill: '#71edff',
      thumbFillHighlighted: '#bff7ff',
      heaterCoolerBack: null,
      sliderOptions: {
        trackSize: new Dimension2(10, DEFAULT_WIDTH / 2),
        // height of the track depends on the width
        trackFillEnabled: new LinearGradient(0, 0, DEFAULT_WIDTH / 2, 0).addColorStop(0, '#0A00F0').addColorStop(1, '#EF000F'),
        thumbLineWidth: 1.4,
        thumbCenterLineStroke: 'black',
        majorTickLength: 15,
        minorTickLength: 12
      },
      phetioInstrument: true,
      // NodeOptions
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'HeaterCoolerNode',
      phetioType: Node.NodeIO
    }, providedOptions);
    assert && assert(options.heatEnabled || options.coolEnabled, 'Either heat or cool must be enabled.');
    assert && assert(options.snapToZeroThreshold >= 0 && options.snapToZeroThreshold <= 1, `options.snapToZeroThreshold must be between 0 and 1: ${options.snapToZeroThreshold}`);

    // Dimensions for the rest of the stove, dependent on the specified stove width.  Empirically determined, and could
    // be made into options if needed.
    const height = DEFAULT_WIDTH * 0.75;
    const burnerOpeningHeight = DEFAULT_WIDTH * HeaterCoolerBack.OPENING_HEIGHT_SCALE;
    const bottomWidth = DEFAULT_WIDTH * 0.80;

    // Create the body of the stove.
    const stoveBodyShape = new Shape().ellipticalArc(DEFAULT_WIDTH / 2, burnerOpeningHeight / 4, DEFAULT_WIDTH / 2, burnerOpeningHeight / 2, 0, 0, Math.PI, false).lineTo((DEFAULT_WIDTH - bottomWidth) / 2, height + burnerOpeningHeight / 2).ellipticalArc(DEFAULT_WIDTH / 2, height + burnerOpeningHeight / 4, bottomWidth / 2, burnerOpeningHeight, 0, Math.PI, 0, true).lineTo(DEFAULT_WIDTH, burnerOpeningHeight / 2);
    const stoveBaseColor = Color.toColor(options.baseColor);
    const stoveBody = new Path(stoveBodyShape, {
      stroke: 'black',
      fill: new LinearGradient(0, 0, DEFAULT_WIDTH, 0).addColorStop(0, stoveBaseColor.brighterColor(0.5)).addColorStop(1, stoveBaseColor.darkerColor(0.5))
    });
    this.snapToZeroProperty = new BooleanProperty(options.snapToZero, {
      tandem: options.tandem.createTandem('snapToZeroProperty'),
      phetioDocumentation: 'whether the slider will snap to the off position when released',
      phetioFeatured: true
    });
    const sliderRange = new Range(options.coolEnabled ? -1 : 0, options.heatEnabled ? 1 : 0);

    /**
     * determines if the slider is close enough to zero to snap to zero (even when snapToZeroProperty is false). It's
     * only applicable when both heating and cooling are enabled because that is the only configuration where it was
     * difficult for a user to set the slider to 0. This feature was requested by designers,
     * see https://github.com/phetsims/scenery-phet/issues/568.
     */
    const sliderIsCloseToZero = () => {
      return options.coolEnabled && options.heatEnabled && (heatCoolAmountProperty.value < 0 && heatCoolAmountProperty.value / sliderRange.min < options.snapToZeroThreshold || heatCoolAmountProperty.value > 0 && heatCoolAmountProperty.value / sliderRange.max < options.snapToZeroThreshold);
    };
    const setSliderToZero = () => {
      heatCoolAmountProperty.set(0);
    };
    this.slider = new VSlider(heatCoolAmountProperty, sliderRange, combineOptions({
      thumbTouchAreaXDilation: options.thumbTouchAreaXDilation,
      thumbTouchAreaYDilation: options.thumbTouchAreaYDilation,
      thumbMouseAreaXDilation: options.thumbMouseAreaXDilation,
      thumbMouseAreaYDilation: options.thumbMouseAreaYDilation,
      thumbFill: options.thumbFill,
      thumbSize: options.thumbSize,
      thumbFillHighlighted: options.thumbFillHighlighted,
      endDrag: () => {
        if (this.snapToZeroProperty.value || sliderIsCloseToZero()) {
          setSliderToZero();
        }
      },
      centerY: stoveBody.centerY,
      right: stoveBody.right - DEFAULT_WIDTH / 8,
      tandem: options.tandem.createTandem('slider')
    }, options.sliderOptions));

    // Create the tick labels.
    const labelOptions = {
      font: options.labelFont,
      maxWidth: options.labelMaxWidth
    };
    let heatTickText;
    if (options.heatEnabled) {
      heatTickText = new Text(options.heatString, labelOptions); // dispose required, may link to a StringProperty
      this.slider.addMajorTick(1, heatTickText);
    }
    this.slider.addMinorTick(0);
    let coolTickText;
    if (options.coolEnabled) {
      coolTickText = new Text(options.coolString, labelOptions); // dispose required, may link to a StringProperty
      this.slider.addMajorTick(-1, coolTickText);
    }
    this.addChild(stoveBody);
    this.addChild(this.slider);
    if (!options.phetioInstrument) {
      options.tandem = Tandem.OPT_OUT;
    }
    this.mutate(options);

    // update the back component if provided
    if (options.heaterCoolerBack) {
      const heaterCoolerBack = options.heaterCoolerBack;
      this.opacityProperty.lazyLink(opacity => {
        heaterCoolerBack.opacity = opacity;
      });
      this.pickableProperty.lazyLink(pickable => {
        heaterCoolerBack.pickable = pickable;
      });
      this.visibleProperty.lazyLink(visible => {
        heaterCoolerBack.visible = visible;
      });
    }

    // return the slider to its origin if snapToZero is changed to true
    this.snapToZeroProperty.link(snapToZero => {
      snapToZero && setSliderToZero();
    });
    this.disposeHeaterCoolerFront = () => {
      heatTickText && heatTickText.dispose();
      coolTickText && coolTickText.dispose();
    };
  }
  dispose() {
    this.disposeHeaterCoolerFront();
    super.dispose();
  }
}
sceneryPhet.register('HeaterCoolerFront', HeaterCoolerFront);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiUmFuZ2UiLCJTaGFwZSIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiQ29sb3IiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiVGV4dCIsIlZTbGlkZXIiLCJUYW5kZW0iLCJIZWF0ZXJDb29sZXJCYWNrIiwiUGhldEZvbnQiLCJzY2VuZXJ5UGhldCIsIlNjZW5lcnlQaGV0U3RyaW5ncyIsIkRFRkFVTFRfV0lEVEgiLCJIZWF0ZXJDb29sZXJGcm9udCIsIkRFRkFVTFRfQkFTRV9DT0xPUiIsImNvbnN0cnVjdG9yIiwiaGVhdENvb2xBbW91bnRQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJiYXNlQ29sb3IiLCJ3aWR0aCIsImhlYXRFbmFibGVkIiwiY29vbEVuYWJsZWQiLCJzbmFwVG9aZXJvIiwic25hcFRvWmVyb1RocmVzaG9sZCIsImhlYXRTdHJpbmciLCJoZWF0U3RyaW5nUHJvcGVydHkiLCJjb29sU3RyaW5nIiwiY29vbFN0cmluZ1Byb3BlcnR5IiwibGFiZWxGb250IiwibGFiZWxNYXhXaWR0aCIsInRodW1iU2l6ZSIsInRodW1iVG91Y2hBcmVhWERpbGF0aW9uIiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJ0aHVtYk1vdXNlQXJlYVhEaWxhdGlvbiIsInRodW1iTW91c2VBcmVhWURpbGF0aW9uIiwidGh1bWJGaWxsIiwidGh1bWJGaWxsSGlnaGxpZ2h0ZWQiLCJoZWF0ZXJDb29sZXJCYWNrIiwic2xpZGVyT3B0aW9ucyIsInRyYWNrU2l6ZSIsInRyYWNrRmlsbEVuYWJsZWQiLCJhZGRDb2xvclN0b3AiLCJ0aHVtYkxpbmVXaWR0aCIsInRodW1iQ2VudGVyTGluZVN0cm9rZSIsIm1ham9yVGlja0xlbmd0aCIsIm1pbm9yVGlja0xlbmd0aCIsInBoZXRpb0luc3RydW1lbnQiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInRhbmRlbU5hbWVTdWZmaXgiLCJwaGV0aW9UeXBlIiwiTm9kZUlPIiwiYXNzZXJ0IiwiaGVpZ2h0IiwiYnVybmVyT3BlbmluZ0hlaWdodCIsIk9QRU5JTkdfSEVJR0hUX1NDQUxFIiwiYm90dG9tV2lkdGgiLCJzdG92ZUJvZHlTaGFwZSIsImVsbGlwdGljYWxBcmMiLCJNYXRoIiwiUEkiLCJsaW5lVG8iLCJzdG92ZUJhc2VDb2xvciIsInRvQ29sb3IiLCJzdG92ZUJvZHkiLCJzdHJva2UiLCJmaWxsIiwiYnJpZ2h0ZXJDb2xvciIsImRhcmtlckNvbG9yIiwic25hcFRvWmVyb1Byb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInBoZXRpb0ZlYXR1cmVkIiwic2xpZGVyUmFuZ2UiLCJzbGlkZXJJc0Nsb3NlVG9aZXJvIiwidmFsdWUiLCJtaW4iLCJtYXgiLCJzZXRTbGlkZXJUb1plcm8iLCJzZXQiLCJzbGlkZXIiLCJlbmREcmFnIiwiY2VudGVyWSIsInJpZ2h0IiwibGFiZWxPcHRpb25zIiwiZm9udCIsIm1heFdpZHRoIiwiaGVhdFRpY2tUZXh0IiwiYWRkTWFqb3JUaWNrIiwiYWRkTWlub3JUaWNrIiwiY29vbFRpY2tUZXh0IiwiYWRkQ2hpbGQiLCJPUFRfT1VUIiwibXV0YXRlIiwib3BhY2l0eVByb3BlcnR5IiwibGF6eUxpbmsiLCJvcGFjaXR5IiwicGlja2FibGVQcm9wZXJ0eSIsInBpY2thYmxlIiwidmlzaWJsZVByb3BlcnR5IiwidmlzaWJsZSIsImxpbmsiLCJkaXNwb3NlSGVhdGVyQ29vbGVyRnJvbnQiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIZWF0ZXJDb29sZXJGcm9udC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBGcm9udCBvZiB0aGUgSGVhdGVyQ29vbGVyTm9kZS4gIEl0IGlzIGluZGVwZW5kZW50IGZyb20gdGhlIEhlYXRlckNvb2xlckJhY2sgc28gdGhhdCBvbmUgY2FuIGVhc2lseSBsYXllciBvYmplY3RzXHJcbiAqIGluc2lkZSBvZiB0aGUgSGVhdGVyQ29vbGVyTm9kZS4gIFRoZSBIZWF0ZXJDb29sZXJGcm9udCBjb250YWlucyB0aGUgaGVhdGVyIGJvZHksIGxhYmVscywgYW5kIGNvbnRyb2wgc2xpZGVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpIG9uIDIwLTExLTIwMTQuXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgRm9udCwgVENvbG9yLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgTm9kZU9wdGlvbnMsIFBhdGgsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgeyBTbGlkZXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vc3VuL2pzL1NsaWRlci5qcyc7XHJcbmltcG9ydCBWU2xpZGVyIGZyb20gJy4uLy4uL3N1bi9qcy9WU2xpZGVyLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEhlYXRlckNvb2xlckJhY2sgZnJvbSAnLi9IZWF0ZXJDb29sZXJCYWNrLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4vUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBTY2VuZXJ5UGhldFN0cmluZ3MgZnJvbSAnLi9TY2VuZXJ5UGhldFN0cmluZ3MuanMnO1xyXG5cclxuY29uc3QgREVGQVVMVF9XSURUSCA9IDEyMDsgLy8gaW4gc2NyZWVuIGNvb3JkcywgbXVjaCBvZiB0aGUgcmVzdCBvZiB0aGUgc2l6ZSBvZiB0aGUgc3RvdmUgZGVyaXZlcyBmcm9tIHRoaXMgdmFsdWVcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIGJhc2VDb2xvcj86IENvbG9yIHwgc3RyaW5nOyAvLyBCYXNlIGNvbG9yIHVzZWQgZm9yIHRoZSBzdG92ZSBib2R5LlxyXG4gIHdpZHRoPzogbnVtYmVyOyAvLyBJbiBzY3JlZW4gY29vcmRzLCBtdWNoIG9mIHRoZSByZXN0IG9mIHRoZSBzaXplIG9mIHRoZSBzdG92ZSBkZXJpdmVzIGZyb20gdGhpcyB2YWx1ZS5cclxuICBoZWF0RW5hYmxlZD86IGJvb2xlYW47IC8vIEFsbG93cyBzbGlkZXIgdG8gcmVhY2ggcG9zaXRpdmUgdmFsdWVzIChjb3JyZXNwb25kaW5nIHRvIGhlYXRpbmcpXHJcbiAgY29vbEVuYWJsZWQ/OiBib29sZWFuOyAvLyBBbGxvd3Mgc2xpZGVyIHRvIHJlYWNoIG5lZ2F0aXZlIHZhbHVlcyAoY29ycmVzcG9uZGluZyB0byBjb29saW5nKVxyXG4gIHNuYXBUb1plcm8/OiBib29sZWFuOyAvLyBzZWUgZG9jIGF0IHRoaXMuc25hcFRvWmVyb1Byb3BlcnR5XHJcblxyXG4gIC8vIHRoZSBwZXJjZW50YWdlIG9mIHRoZSBzbGlkZXIncyBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlIGF0IHdoaWNoIHRoZSBzbGlkZXIgc2hvdWxkIHNuYXAgdG8gemVybyB3aGVuXHJcbiAgLy8gcmVsZWFzZWQuIE5vdGUgdGhhdCBpdCdzIG9ubHkgdXNlZCB3aGVuIHRoaXMuc25hcFRvWmVyb1Byb3BlcnR5IGlzIGZhbHNlIGFuZCB3aGVuIGJvdGggaGVhdGluZyBhbmQgY29vbGluZ1xyXG4gIC8vIGFyZSBlbmFibGVkLiBBIHZhbHVlIG9mIDEgaXMgdGhlIHNhbWUgYXMgc25hcFRvWmVybzogdHJ1ZSwgYW5kIGEgdmFsdWUgb2YgMCByZW1vdmVzIHNuYXBwaW5nIGVudGlyZWx5LlxyXG4gIC8vIERlZmF1bHQgdmFsdWUgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5LXBoZXQvaXNzdWVzLzU2OFxyXG4gIHNuYXBUb1plcm9UaHJlc2hvbGQ/OiBudW1iZXI7XHJcblxyXG4gIC8vIHNsaWRlciBsYWJlbCBvcHRpb25zXHJcbiAgaGVhdFN0cmluZz86IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47IC8vIGxhYmVsIGZvciArMSBlbmQgb2Ygc2xpZGVyXHJcbiAgY29vbFN0cmluZz86IHN0cmluZyB8IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz47IC8vIHtzdHJpbmd9IGxhYmVsIGZvciAtMSBlbmQgb2Ygc2xpZGVyXHJcbiAgbGFiZWxGb250PzogRm9udDtcclxuICBsYWJlbE1heFdpZHRoPzogbnVtYmVyOyAvLyBtYXhXaWR0aCBvZiB0aGUgSGVhdCBhbmQgQ29vbCBsYWJlbHMsIGRldGVybWluZWQgZW1waXJpY2FsbHlcclxuXHJcbiAgLy8gc2xpZGVyIG9wdGlvbnNcclxuICB0aHVtYlNpemU/OiBEaW1lbnNpb24yO1xyXG4gIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iTW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iTW91c2VBcmVhWURpbGF0aW9uPzogbnVtYmVyO1xyXG4gIHRodW1iRmlsbD86IFRDb2xvcjtcclxuICB0aHVtYkZpbGxIaWdobGlnaHRlZD86IFRDb2xvcjtcclxuXHJcbiAgLy8gbGlua3MgdGhlIE5vZGVJTyBQcm9wZXJ0aWVzIG9mIHRoZSBwcm92aWRlZCBIZWF0ZXJDb29sZXJCYWNrIHRvIHRoaXMgSGVhdGVyQ29vbGVyRnJvbnRcclxuICBoZWF0ZXJDb29sZXJCYWNrPzogSGVhdGVyQ29vbGVyQmFjayB8IG51bGw7XHJcblxyXG4gIHNsaWRlck9wdGlvbnM/OiBTbGlkZXJPcHRpb25zO1xyXG5cclxuICAvLyBIZWF0ZXJDb29sZXJGcm9udCBpcyBzb21ldGltZXMgaW5zdHJ1bWVudGVkIGFzIGEgcGFyZW50IGNvbXBvbmVudCwgYW5kIGlzIHNvbWV0aW1lcyBhIHN1Yi1jb21wb2VudCB0b1xyXG4gIC8vIEhlYXRlckNvb2xlck5vZGUuanMuIFRoaXMgb3B0aW9uIHByb3ZpZGVzIHRoZSBhYmlsaXR5IHRvIGxpbWl0IHRoZSBudW1iZXIgb2YgaW50ZXJtZWRpYXRlIE5vZGVzIGluIHRoZVxyXG4gIC8vIGluc3RydW1lbnRlZCB0cmVlLiBUaGlzIGRvZXNuJ3QgYWZmZWN0IHRoZSBpbnN0cnVtZW50YXRpb24gb2Ygc3ViLWNvbXBvbmVudHMgbGlrZSB0aGUgc2xpZGVyLlxyXG4gIHBoZXRpb0luc3RydW1lbnQ/OiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgSGVhdGVyQ29vbGVyRnJvbnRPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhlYXRlckNvb2xlckZyb250IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8vIHBsZWFzZSB1c2UganVkaWNpb3VzbHksIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy80NDJcclxuICBwdWJsaWMgcmVhZG9ubHkgc2xpZGVyOiBWU2xpZGVyO1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHNuYXBUb1plcm9Qcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUhlYXRlckNvb2xlckZyb250OiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IERFRkFVTFRfQkFTRV9DT0xPUiA9ICdyZ2IoIDE1OSwgMTgyLCAyMDUgKSc7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBoZWF0Q29vbEFtb3VudFByb3BlcnR5ICsxIGZvciBtYXggaGVhdGluZywgLTEgZm9yIG1heCBjb29saW5nXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaGVhdENvb2xBbW91bnRQcm9wZXJ0eTogTnVtYmVyUHJvcGVydHksIHByb3ZpZGVkT3B0aW9ucz86IEhlYXRlckNvb2xlckZyb250T3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxIZWF0ZXJDb29sZXJGcm9udE9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgYmFzZUNvbG9yOiBIZWF0ZXJDb29sZXJGcm9udC5ERUZBVUxUX0JBU0VfQ09MT1IsXHJcbiAgICAgIHdpZHRoOiAxMjAsXHJcbiAgICAgIGhlYXRFbmFibGVkOiB0cnVlLFxyXG4gICAgICBjb29sRW5hYmxlZDogdHJ1ZSxcclxuICAgICAgc25hcFRvWmVybzogdHJ1ZSxcclxuICAgICAgc25hcFRvWmVyb1RocmVzaG9sZDogMC4xLFxyXG4gICAgICBoZWF0U3RyaW5nOiBTY2VuZXJ5UGhldFN0cmluZ3MuaGVhdFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBjb29sU3RyaW5nOiBTY2VuZXJ5UGhldFN0cmluZ3MuY29vbFN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBsYWJlbEZvbnQ6IG5ldyBQaGV0Rm9udCggMTQgKSxcclxuICAgICAgbGFiZWxNYXhXaWR0aDogMzUsXHJcbiAgICAgIHRodW1iU2l6ZTogbmV3IERpbWVuc2lvbjIoIDQ1LCAyMiApLFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVhEaWxhdGlvbjogMTEsXHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiAxMSxcclxuICAgICAgdGh1bWJNb3VzZUFyZWFYRGlsYXRpb246IDAsXHJcbiAgICAgIHRodW1iTW91c2VBcmVhWURpbGF0aW9uOiAwLFxyXG4gICAgICB0aHVtYkZpbGw6ICcjNzFlZGZmJyxcclxuICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6ICcjYmZmN2ZmJyxcclxuICAgICAgaGVhdGVyQ29vbGVyQmFjazogbnVsbCxcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIHRyYWNrU2l6ZTogbmV3IERpbWVuc2lvbjIoIDEwLCBERUZBVUxUX1dJRFRIIC8gMiApLCAvLyBoZWlnaHQgb2YgdGhlIHRyYWNrIGRlcGVuZHMgb24gdGhlIHdpZHRoXHJcbiAgICAgICAgdHJhY2tGaWxsRW5hYmxlZDogbmV3IExpbmVhckdyYWRpZW50KCAwLCAwLCBERUZBVUxUX1dJRFRIIC8gMiwgMCApXHJcbiAgICAgICAgICAuYWRkQ29sb3JTdG9wKCAwLCAnIzBBMDBGMCcgKVxyXG4gICAgICAgICAgLmFkZENvbG9yU3RvcCggMSwgJyNFRjAwMEYnICksXHJcbiAgICAgICAgdGh1bWJMaW5lV2lkdGg6IDEuNCxcclxuICAgICAgICB0aHVtYkNlbnRlckxpbmVTdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgbWFqb3JUaWNrTGVuZ3RoOiAxNSxcclxuICAgICAgICBtaW5vclRpY2tMZW5ndGg6IDEyXHJcbiAgICAgIH0sXHJcbiAgICAgIHBoZXRpb0luc3RydW1lbnQ6IHRydWUsXHJcblxyXG4gICAgICAvLyBOb2RlT3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRCxcclxuICAgICAgdGFuZGVtTmFtZVN1ZmZpeDogJ0hlYXRlckNvb2xlck5vZGUnLFxyXG4gICAgICBwaGV0aW9UeXBlOiBOb2RlLk5vZGVJT1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5oZWF0RW5hYmxlZCB8fCBvcHRpb25zLmNvb2xFbmFibGVkLCAnRWl0aGVyIGhlYXQgb3IgY29vbCBtdXN0IGJlIGVuYWJsZWQuJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5zbmFwVG9aZXJvVGhyZXNob2xkID49IDAgJiYgb3B0aW9ucy5zbmFwVG9aZXJvVGhyZXNob2xkIDw9IDEsXHJcbiAgICAgIGBvcHRpb25zLnNuYXBUb1plcm9UaHJlc2hvbGQgbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDE6ICR7b3B0aW9ucy5zbmFwVG9aZXJvVGhyZXNob2xkfWAgKTtcclxuXHJcbiAgICAvLyBEaW1lbnNpb25zIGZvciB0aGUgcmVzdCBvZiB0aGUgc3RvdmUsIGRlcGVuZGVudCBvbiB0aGUgc3BlY2lmaWVkIHN0b3ZlIHdpZHRoLiAgRW1waXJpY2FsbHkgZGV0ZXJtaW5lZCwgYW5kIGNvdWxkXHJcbiAgICAvLyBiZSBtYWRlIGludG8gb3B0aW9ucyBpZiBuZWVkZWQuXHJcbiAgICBjb25zdCBoZWlnaHQgPSBERUZBVUxUX1dJRFRIICogMC43NTtcclxuICAgIGNvbnN0IGJ1cm5lck9wZW5pbmdIZWlnaHQgPSBERUZBVUxUX1dJRFRIICogSGVhdGVyQ29vbGVyQmFjay5PUEVOSU5HX0hFSUdIVF9TQ0FMRTtcclxuICAgIGNvbnN0IGJvdHRvbVdpZHRoID0gREVGQVVMVF9XSURUSCAqIDAuODA7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBib2R5IG9mIHRoZSBzdG92ZS5cclxuICAgIGNvbnN0IHN0b3ZlQm9keVNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLmVsbGlwdGljYWxBcmMoIERFRkFVTFRfV0lEVEggLyAyLCBidXJuZXJPcGVuaW5nSGVpZ2h0IC8gNCwgREVGQVVMVF9XSURUSCAvIDIsIGJ1cm5lck9wZW5pbmdIZWlnaHQgLyAyLCAwLCAwLCBNYXRoLlBJLCBmYWxzZSApXHJcbiAgICAgIC5saW5lVG8oICggREVGQVVMVF9XSURUSCAtIGJvdHRvbVdpZHRoICkgLyAyLCBoZWlnaHQgKyBidXJuZXJPcGVuaW5nSGVpZ2h0IC8gMiApXHJcbiAgICAgIC5lbGxpcHRpY2FsQXJjKCBERUZBVUxUX1dJRFRIIC8gMiwgaGVpZ2h0ICsgYnVybmVyT3BlbmluZ0hlaWdodCAvIDQsIGJvdHRvbVdpZHRoIC8gMiwgYnVybmVyT3BlbmluZ0hlaWdodCxcclxuICAgICAgICAwLCBNYXRoLlBJLCAwLCB0cnVlICkubGluZVRvKCBERUZBVUxUX1dJRFRILCBidXJuZXJPcGVuaW5nSGVpZ2h0IC8gMiApO1xyXG5cclxuICAgIGNvbnN0IHN0b3ZlQmFzZUNvbG9yID0gQ29sb3IudG9Db2xvciggb3B0aW9ucy5iYXNlQ29sb3IgKTtcclxuICAgIGNvbnN0IHN0b3ZlQm9keSA9IG5ldyBQYXRoKCBzdG92ZUJvZHlTaGFwZSwge1xyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGZpbGw6IG5ldyBMaW5lYXJHcmFkaWVudCggMCwgMCwgREVGQVVMVF9XSURUSCwgMCApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMCwgc3RvdmVCYXNlQ29sb3IuYnJpZ2h0ZXJDb2xvciggMC41ICkgKVxyXG4gICAgICAgIC5hZGRDb2xvclN0b3AoIDEsIHN0b3ZlQmFzZUNvbG9yLmRhcmtlckNvbG9yKCAwLjUgKSApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5zbmFwVG9aZXJvUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBvcHRpb25zLnNuYXBUb1plcm8sIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzbmFwVG9aZXJvUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBzbGlkZXIgd2lsbCBzbmFwIHRvIHRoZSBvZmYgcG9zaXRpb24gd2hlbiByZWxlYXNlZCcsXHJcbiAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc2xpZGVyUmFuZ2UgPSBuZXcgUmFuZ2UoIG9wdGlvbnMuY29vbEVuYWJsZWQgPyAtMSA6IDAsIG9wdGlvbnMuaGVhdEVuYWJsZWQgPyAxIDogMCApO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogZGV0ZXJtaW5lcyBpZiB0aGUgc2xpZGVyIGlzIGNsb3NlIGVub3VnaCB0byB6ZXJvIHRvIHNuYXAgdG8gemVybyAoZXZlbiB3aGVuIHNuYXBUb1plcm9Qcm9wZXJ0eSBpcyBmYWxzZSkuIEl0J3NcclxuICAgICAqIG9ubHkgYXBwbGljYWJsZSB3aGVuIGJvdGggaGVhdGluZyBhbmQgY29vbGluZyBhcmUgZW5hYmxlZCBiZWNhdXNlIHRoYXQgaXMgdGhlIG9ubHkgY29uZmlndXJhdGlvbiB3aGVyZSBpdCB3YXNcclxuICAgICAqIGRpZmZpY3VsdCBmb3IgYSB1c2VyIHRvIHNldCB0aGUgc2xpZGVyIHRvIDAuIFRoaXMgZmVhdHVyZSB3YXMgcmVxdWVzdGVkIGJ5IGRlc2lnbmVycyxcclxuICAgICAqIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvc2NlbmVyeS1waGV0L2lzc3Vlcy81NjguXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHNsaWRlcklzQ2xvc2VUb1plcm8gPSAoKSA9PiB7XHJcbiAgICAgIHJldHVybiBvcHRpb25zLmNvb2xFbmFibGVkICYmIG9wdGlvbnMuaGVhdEVuYWJsZWQgJiYgKFxyXG4gICAgICAgIGhlYXRDb29sQW1vdW50UHJvcGVydHkudmFsdWUgPCAwICYmIGhlYXRDb29sQW1vdW50UHJvcGVydHkudmFsdWUgLyBzbGlkZXJSYW5nZS5taW4gPCBvcHRpb25zLnNuYXBUb1plcm9UaHJlc2hvbGQgfHxcclxuICAgICAgICBoZWF0Q29vbEFtb3VudFByb3BlcnR5LnZhbHVlID4gMCAmJiBoZWF0Q29vbEFtb3VudFByb3BlcnR5LnZhbHVlIC8gc2xpZGVyUmFuZ2UubWF4IDwgb3B0aW9ucy5zbmFwVG9aZXJvVGhyZXNob2xkICk7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHNldFNsaWRlclRvWmVybyA9ICgpID0+IHtcclxuICAgICAgaGVhdENvb2xBbW91bnRQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5zbGlkZXIgPSBuZXcgVlNsaWRlciggaGVhdENvb2xBbW91bnRQcm9wZXJ0eSwgc2xpZGVyUmFuZ2UsIGNvbWJpbmVPcHRpb25zPFNsaWRlck9wdGlvbnM+KCB7XHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWERpbGF0aW9uOiBvcHRpb25zLnRodW1iVG91Y2hBcmVhWERpbGF0aW9uLFxyXG4gICAgICB0aHVtYlRvdWNoQXJlYVlEaWxhdGlvbjogb3B0aW9ucy50aHVtYlRvdWNoQXJlYVlEaWxhdGlvbixcclxuICAgICAgdGh1bWJNb3VzZUFyZWFYRGlsYXRpb246IG9wdGlvbnMudGh1bWJNb3VzZUFyZWFYRGlsYXRpb24sXHJcbiAgICAgIHRodW1iTW91c2VBcmVhWURpbGF0aW9uOiBvcHRpb25zLnRodW1iTW91c2VBcmVhWURpbGF0aW9uLFxyXG4gICAgICB0aHVtYkZpbGw6IG9wdGlvbnMudGh1bWJGaWxsLFxyXG4gICAgICB0aHVtYlNpemU6IG9wdGlvbnMudGh1bWJTaXplLFxyXG4gICAgICB0aHVtYkZpbGxIaWdobGlnaHRlZDogb3B0aW9ucy50aHVtYkZpbGxIaWdobGlnaHRlZCxcclxuICAgICAgZW5kRHJhZzogKCkgPT4ge1xyXG4gICAgICAgIGlmICggdGhpcy5zbmFwVG9aZXJvUHJvcGVydHkudmFsdWUgfHwgc2xpZGVySXNDbG9zZVRvWmVybygpICkge1xyXG4gICAgICAgICAgc2V0U2xpZGVyVG9aZXJvKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjZW50ZXJZOiBzdG92ZUJvZHkuY2VudGVyWSxcclxuICAgICAgcmlnaHQ6IHN0b3ZlQm9keS5yaWdodCAtIERFRkFVTFRfV0lEVEggLyA4LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NsaWRlcicgKVxyXG4gICAgfSwgb3B0aW9ucy5zbGlkZXJPcHRpb25zICkgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHRpY2sgbGFiZWxzLlxyXG4gICAgY29uc3QgbGFiZWxPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBvcHRpb25zLmxhYmVsRm9udCxcclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMubGFiZWxNYXhXaWR0aFxyXG4gICAgfTtcclxuICAgIGxldCBoZWF0VGlja1RleHQ6IE5vZGU7XHJcbiAgICBpZiAoIG9wdGlvbnMuaGVhdEVuYWJsZWQgKSB7XHJcbiAgICAgIGhlYXRUaWNrVGV4dCA9IG5ldyBUZXh0KCBvcHRpb25zLmhlYXRTdHJpbmcsIGxhYmVsT3B0aW9ucyApOyAvLyBkaXNwb3NlIHJlcXVpcmVkLCBtYXkgbGluayB0byBhIFN0cmluZ1Byb3BlcnR5XHJcbiAgICAgIHRoaXMuc2xpZGVyLmFkZE1ham9yVGljayggMSwgaGVhdFRpY2tUZXh0ICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNsaWRlci5hZGRNaW5vclRpY2soIDAgKTtcclxuICAgIGxldCBjb29sVGlja1RleHQ6IE5vZGU7XHJcbiAgICBpZiAoIG9wdGlvbnMuY29vbEVuYWJsZWQgKSB7XHJcbiAgICAgIGNvb2xUaWNrVGV4dCA9IG5ldyBUZXh0KCBvcHRpb25zLmNvb2xTdHJpbmcsIGxhYmVsT3B0aW9ucyApOyAvLyBkaXNwb3NlIHJlcXVpcmVkLCBtYXkgbGluayB0byBhIFN0cmluZ1Byb3BlcnR5XHJcbiAgICAgIHRoaXMuc2xpZGVyLmFkZE1ham9yVGljayggLTEsIGNvb2xUaWNrVGV4dCApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHN0b3ZlQm9keSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5zbGlkZXIgKTtcclxuXHJcbiAgICBpZiAoICFvcHRpb25zLnBoZXRpb0luc3RydW1lbnQgKSB7XHJcbiAgICAgIG9wdGlvbnMudGFuZGVtID0gVGFuZGVtLk9QVF9PVVQ7XHJcbiAgICB9XHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgYmFjayBjb21wb25lbnQgaWYgcHJvdmlkZWRcclxuICAgIGlmICggb3B0aW9ucy5oZWF0ZXJDb29sZXJCYWNrICkge1xyXG4gICAgICBjb25zdCBoZWF0ZXJDb29sZXJCYWNrID0gb3B0aW9ucy5oZWF0ZXJDb29sZXJCYWNrO1xyXG4gICAgICB0aGlzLm9wYWNpdHlQcm9wZXJ0eS5sYXp5TGluayggb3BhY2l0eSA9PiB7XHJcbiAgICAgICAgaGVhdGVyQ29vbGVyQmFjay5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLnBpY2thYmxlUHJvcGVydHkubGF6eUxpbmsoIHBpY2thYmxlID0+IHtcclxuICAgICAgICBoZWF0ZXJDb29sZXJCYWNrLnBpY2thYmxlID0gcGlja2FibGU7XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy52aXNpYmxlUHJvcGVydHkubGF6eUxpbmsoIHZpc2libGUgPT4ge1xyXG4gICAgICAgIGhlYXRlckNvb2xlckJhY2sudmlzaWJsZSA9IHZpc2libGU7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyByZXR1cm4gdGhlIHNsaWRlciB0byBpdHMgb3JpZ2luIGlmIHNuYXBUb1plcm8gaXMgY2hhbmdlZCB0byB0cnVlXHJcbiAgICB0aGlzLnNuYXBUb1plcm9Qcm9wZXJ0eS5saW5rKCBzbmFwVG9aZXJvID0+IHtcclxuICAgICAgc25hcFRvWmVybyAmJiBzZXRTbGlkZXJUb1plcm8oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VIZWF0ZXJDb29sZXJGcm9udCA9ICgpID0+IHtcclxuICAgICAgaGVhdFRpY2tUZXh0ICYmIGhlYXRUaWNrVGV4dC5kaXNwb3NlKCk7XHJcbiAgICAgIGNvb2xUaWNrVGV4dCAmJiBjb29sVGlja1RleHQuZGlzcG9zZSgpO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlSGVhdGVyQ29vbGVyRnJvbnQoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbnNjZW5lcnlQaGV0LnJlZ2lzdGVyKCAnSGVhdGVyQ29vbGVyRnJvbnQnLCBIZWF0ZXJDb29sZXJGcm9udCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sa0NBQWtDO0FBSTlELE9BQU9DLFVBQVUsTUFBTSw0QkFBNEI7QUFDbkQsT0FBT0MsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxTQUFTQyxLQUFLLFFBQVEsMEJBQTBCO0FBQ2hELE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLGlDQUFpQztBQUMzRSxTQUFTQyxLQUFLLEVBQWdCQyxjQUFjLEVBQUVDLElBQUksRUFBZUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsNkJBQTZCO0FBRWhILE9BQU9DLE9BQU8sTUFBTSx5QkFBeUI7QUFDN0MsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0Ms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