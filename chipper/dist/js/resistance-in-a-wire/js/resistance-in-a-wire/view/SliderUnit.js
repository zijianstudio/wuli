// Copyright 2017-2023, University of Colorado Boulder

/**
 * Slider unit with a vertical slider, a title above the slider and a readout display below the slider. Layout is dynamic
 * based on the center of the slider.
 * @author Martin Veillette (Berea College)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import { Node, RichText, Text } from '../../../../scenery/js/imports.js';
import VSlider from '../../../../sun/js/VSlider.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';
class SliderUnit extends Node {
  /**
   * @param {Property.<number>} property
   * @param {RangeWithValue} range
   * @param {string} symbolString
   * @param {string} nameString
   * @param {string} unitString
   * @param {string} labelContent - a11y, label read by a screen reader
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(property, range, symbolString, nameString, unitString, labelContent, tandem, options) {
    super();
    options = merge({
      sliderOptions: {
        trackFillEnabled: 'black',
        trackSize: new Dimension2(4, ResistanceInAWireConstants.SLIDER_HEIGHT - 30),
        thumbSize: new Dimension2(45, 22),
        thumbFill: '#c3c4c5',
        thumbFillHighlighted: '#dedede',
        // physical values in this sim can have up to 2 decimals
        constrainValue: value => Utils.toFixedNumber(value, 2),
        startDrag: _.noop,
        endDrag: _.noop,
        // Turn off default sound generation, since this does its own in a highly customized way.
        soundGenerator: null,
        // pdom
        keyboardStep: 1,
        // delta for keyboard step
        shiftKeyboardStep: 0.01,
        // delta when holding shift
        roundToStepSize: true,
        // default keyboard step rounds to pedagogically useful values
        containerTagName: 'li',
        labelContent: labelContent,
        labelTagName: 'label',
        a11yMapPDOMValue: value => Utils.toFixedNumber(value, 2),
        // phet-io
        tandem: tandem.createTandem('slider')
      },
      // {number}
      decimalPlaces: 0
    }, options);

    // override the start and end drag functions in the options
    const providedStartDragFunction = options.startDrag;
    options.sliderOptions.startDrag = event => {
      if (event.type === 'keydown') {
        this.keyboardDragging = true;
      }
      providedStartDragFunction && providedStartDragFunction();
    };
    const providedEndDragFunction = options.endDrag;
    options.sliderOptions.endDrag = () => {
      this.keyboardDragging = false;
      providedEndDragFunction && providedEndDragFunction();
    };

    // text for the symbol, text bounds must be accurate for correct layout
    const symbolText = new Text(symbolString, {
      font: ResistanceInAWireConstants.SYMBOL_FONT,
      fill: ResistanceInAWireConstants.BLUE_COLOR,
      maxWidth: ResistanceInAWireConstants.SLIDER_WIDTH,
      boundsMethod: 'accurate',
      tandem: tandem.createTandem('symbolText')
    });
    const nameText = new Text(nameString, {
      font: ResistanceInAWireConstants.NAME_FONT,
      fill: ResistanceInAWireConstants.BLUE_COLOR,
      maxWidth: ResistanceInAWireConstants.SLIDER_WIDTH,
      tandem: tandem.createTandem('nameText')
    });

    // @public (read-only) {boolean} - flag that indicates whether the slider is being dragged by the keyboard
    this.keyboardDragging = false;

    // @private
    const slider = new VSlider(property, range, options.sliderOptions);
    const valueText = new Text(Utils.toFixed(range.max, 2), {
      font: ResistanceInAWireConstants.READOUT_FONT,
      fill: ResistanceInAWireConstants.BLACK_COLOR,
      maxWidth: ResistanceInAWireConstants.SLIDER_WIDTH,
      tandem: tandem.createTandem('valueText')
    });
    const unitText = new RichText(unitString, {
      font: ResistanceInAWireConstants.UNIT_FONT,
      fill: ResistanceInAWireConstants.BLUE_COLOR,
      maxWidth: ResistanceInAWireConstants.SLIDER_WIDTH,
      boundsMethod: 'accurate',
      tandem: tandem.createTandem('unitText')
    });

    // units text at the bottom, everything stacked on top of it
    unitText.y = 0;
    valueText.centerX = unitText.centerX;

    // value text above unitText
    valueText.y = unitText.y - 35;

    // sliders along the top of values
    slider.bottom = valueText.y - 30;
    slider.centerX = unitText.centerX;

    // names along the top of the slider
    nameText.y = slider.top - 5;
    nameText.centerX = slider.centerX;

    // symbol texts along the top
    symbolText.bottom = nameText.y - 20;
    symbolText.centerX = nameText.centerX;

    // Add children, from top to bottom of the slider unit
    this.addChild(symbolText);
    this.addChild(nameText);
    this.addChild(slider);
    this.addChild(valueText);
    this.addChild(unitText);

    // Update value of the readout. No need to unlink, present for the lifetime of the simulation.
    property.link(value => {
      valueText.string = Utils.toFixed(value, 2);
      valueText.centerX = unitText.centerX;
    });
    this.mutate(options);
  }
}
resistanceInAWire.register('SliderUnit', SliderUnit);
export default SliderUnit;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJtZXJnZSIsIk5vZGUiLCJSaWNoVGV4dCIsIlRleHQiLCJWU2xpZGVyIiwicmVzaXN0YW5jZUluQVdpcmUiLCJSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cyIsIlNsaWRlclVuaXQiLCJjb25zdHJ1Y3RvciIsInByb3BlcnR5IiwicmFuZ2UiLCJzeW1ib2xTdHJpbmciLCJuYW1lU3RyaW5nIiwidW5pdFN0cmluZyIsImxhYmVsQ29udGVudCIsInRhbmRlbSIsIm9wdGlvbnMiLCJzbGlkZXJPcHRpb25zIiwidHJhY2tGaWxsRW5hYmxlZCIsInRyYWNrU2l6ZSIsIlNMSURFUl9IRUlHSFQiLCJ0aHVtYlNpemUiLCJ0aHVtYkZpbGwiLCJ0aHVtYkZpbGxIaWdobGlnaHRlZCIsImNvbnN0cmFpblZhbHVlIiwidmFsdWUiLCJ0b0ZpeGVkTnVtYmVyIiwic3RhcnREcmFnIiwiXyIsIm5vb3AiLCJlbmREcmFnIiwic291bmRHZW5lcmF0b3IiLCJrZXlib2FyZFN0ZXAiLCJzaGlmdEtleWJvYXJkU3RlcCIsInJvdW5kVG9TdGVwU2l6ZSIsImNvbnRhaW5lclRhZ05hbWUiLCJsYWJlbFRhZ05hbWUiLCJhMTF5TWFwUERPTVZhbHVlIiwiY3JlYXRlVGFuZGVtIiwiZGVjaW1hbFBsYWNlcyIsInByb3ZpZGVkU3RhcnREcmFnRnVuY3Rpb24iLCJldmVudCIsInR5cGUiLCJrZXlib2FyZERyYWdnaW5nIiwicHJvdmlkZWRFbmREcmFnRnVuY3Rpb24iLCJzeW1ib2xUZXh0IiwiZm9udCIsIlNZTUJPTF9GT05UIiwiZmlsbCIsIkJMVUVfQ09MT1IiLCJtYXhXaWR0aCIsIlNMSURFUl9XSURUSCIsImJvdW5kc01ldGhvZCIsIm5hbWVUZXh0IiwiTkFNRV9GT05UIiwic2xpZGVyIiwidmFsdWVUZXh0IiwidG9GaXhlZCIsIm1heCIsIlJFQURPVVRfRk9OVCIsIkJMQUNLX0NPTE9SIiwidW5pdFRleHQiLCJVTklUX0ZPTlQiLCJ5IiwiY2VudGVyWCIsImJvdHRvbSIsInRvcCIsImFkZENoaWxkIiwibGluayIsInN0cmluZyIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2xpZGVyVW5pdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTbGlkZXIgdW5pdCB3aXRoIGEgdmVydGljYWwgc2xpZGVyLCBhIHRpdGxlIGFib3ZlIHRoZSBzbGlkZXIgYW5kIGEgcmVhZG91dCBkaXNwbGF5IGJlbG93IHRoZSBzbGlkZXIuIExheW91dCBpcyBkeW5hbWljXHJcbiAqIGJhc2VkIG9uIHRoZSBjZW50ZXIgb2YgdGhlIHNsaWRlci5cclxuICogQGF1dGhvciBNYXJ0aW4gVmVpbGxldHRlIChCZXJlYSBDb2xsZWdlKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSaWNoVGV4dCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBWU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9WU2xpZGVyLmpzJztcclxuaW1wb3J0IHJlc2lzdGFuY2VJbkFXaXJlIGZyb20gJy4uLy4uL3Jlc2lzdGFuY2VJbkFXaXJlLmpzJztcclxuaW1wb3J0IFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzIGZyb20gJy4uL1Jlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIFNsaWRlclVuaXQgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1Byb3BlcnR5LjxudW1iZXI+fSBwcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UmFuZ2VXaXRoVmFsdWV9IHJhbmdlXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN5bWJvbFN0cmluZ1xyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lU3RyaW5nXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVuaXRTdHJpbmdcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxDb250ZW50IC0gYTExeSwgbGFiZWwgcmVhZCBieSBhIHNjcmVlbiByZWFkZXJcclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eSwgcmFuZ2UsIHN5bWJvbFN0cmluZywgbmFtZVN0cmluZywgdW5pdFN0cmluZywgbGFiZWxDb250ZW50LCB0YW5kZW0sIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgc2xpZGVyT3B0aW9uczoge1xyXG4gICAgICAgIHRyYWNrRmlsbEVuYWJsZWQ6ICdibGFjaycsXHJcbiAgICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggNCwgUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuU0xJREVSX0hFSUdIVCAtIDMwICksXHJcbiAgICAgICAgdGh1bWJTaXplOiBuZXcgRGltZW5zaW9uMiggNDUsIDIyICksXHJcbiAgICAgICAgdGh1bWJGaWxsOiAnI2MzYzRjNScsXHJcbiAgICAgICAgdGh1bWJGaWxsSGlnaGxpZ2h0ZWQ6ICcjZGVkZWRlJyxcclxuXHJcbiAgICAgICAgLy8gcGh5c2ljYWwgdmFsdWVzIGluIHRoaXMgc2ltIGNhbiBoYXZlIHVwIHRvIDIgZGVjaW1hbHNcclxuICAgICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4gVXRpbHMudG9GaXhlZE51bWJlciggdmFsdWUsIDIgKSxcclxuICAgICAgICBzdGFydERyYWc6IF8ubm9vcCxcclxuICAgICAgICBlbmREcmFnOiBfLm5vb3AsXHJcblxyXG4gICAgICAgIC8vIFR1cm4gb2ZmIGRlZmF1bHQgc291bmQgZ2VuZXJhdGlvbiwgc2luY2UgdGhpcyBkb2VzIGl0cyBvd24gaW4gYSBoaWdobHkgY3VzdG9taXplZCB3YXkuXHJcbiAgICAgICAgc291bmRHZW5lcmF0b3I6IG51bGwsXHJcblxyXG4gICAgICAgIC8vIHBkb21cclxuICAgICAgICBrZXlib2FyZFN0ZXA6IDEsIC8vIGRlbHRhIGZvciBrZXlib2FyZCBzdGVwXHJcbiAgICAgICAgc2hpZnRLZXlib2FyZFN0ZXA6IDAuMDEsIC8vIGRlbHRhIHdoZW4gaG9sZGluZyBzaGlmdFxyXG4gICAgICAgIHJvdW5kVG9TdGVwU2l6ZTogdHJ1ZSwgLy8gZGVmYXVsdCBrZXlib2FyZCBzdGVwIHJvdW5kcyB0byBwZWRhZ29naWNhbGx5IHVzZWZ1bCB2YWx1ZXNcclxuICAgICAgICBjb250YWluZXJUYWdOYW1lOiAnbGknLFxyXG4gICAgICAgIGxhYmVsQ29udGVudDogbGFiZWxDb250ZW50LFxyXG4gICAgICAgIGxhYmVsVGFnTmFtZTogJ2xhYmVsJyxcclxuICAgICAgICBhMTF5TWFwUERPTVZhbHVlOiB2YWx1ZSA9PiBVdGlscy50b0ZpeGVkTnVtYmVyKCB2YWx1ZSwgMiApLFxyXG5cclxuICAgICAgICAvLyBwaGV0LWlvXHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2xpZGVyJyApXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyB7bnVtYmVyfVxyXG4gICAgICBkZWNpbWFsUGxhY2VzOiAwXHJcblxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIG92ZXJyaWRlIHRoZSBzdGFydCBhbmQgZW5kIGRyYWcgZnVuY3Rpb25zIGluIHRoZSBvcHRpb25zXHJcbiAgICBjb25zdCBwcm92aWRlZFN0YXJ0RHJhZ0Z1bmN0aW9uID0gb3B0aW9ucy5zdGFydERyYWc7XHJcbiAgICBvcHRpb25zLnNsaWRlck9wdGlvbnMuc3RhcnREcmFnID0gZXZlbnQgPT4ge1xyXG4gICAgICBpZiAoIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyApIHtcclxuICAgICAgICB0aGlzLmtleWJvYXJkRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHByb3ZpZGVkU3RhcnREcmFnRnVuY3Rpb24gJiYgcHJvdmlkZWRTdGFydERyYWdGdW5jdGlvbigpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHByb3ZpZGVkRW5kRHJhZ0Z1bmN0aW9uID0gb3B0aW9ucy5lbmREcmFnO1xyXG4gICAgb3B0aW9ucy5zbGlkZXJPcHRpb25zLmVuZERyYWcgPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMua2V5Ym9hcmREcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICBwcm92aWRlZEVuZERyYWdGdW5jdGlvbiAmJiBwcm92aWRlZEVuZERyYWdGdW5jdGlvbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyB0ZXh0IGZvciB0aGUgc3ltYm9sLCB0ZXh0IGJvdW5kcyBtdXN0IGJlIGFjY3VyYXRlIGZvciBjb3JyZWN0IGxheW91dFxyXG4gICAgY29uc3Qgc3ltYm9sVGV4dCA9IG5ldyBUZXh0KCBzeW1ib2xTdHJpbmcsIHtcclxuICAgICAgZm9udDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuU1lNQk9MX0ZPTlQsXHJcbiAgICAgIGZpbGw6IFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLkJMVUVfQ09MT1IsXHJcbiAgICAgIG1heFdpZHRoOiBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5TTElERVJfV0lEVEgsXHJcbiAgICAgIGJvdW5kc01ldGhvZDogJ2FjY3VyYXRlJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ltYm9sVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IG5hbWVUZXh0ID0gbmV3IFRleHQoIG5hbWVTdHJpbmcsIHtcclxuICAgICAgZm9udDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuTkFNRV9GT05ULFxyXG4gICAgICBmaWxsOiBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5CTFVFX0NPTE9SLFxyXG4gICAgICBtYXhXaWR0aDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuU0xJREVSX1dJRFRILFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICduYW1lVGV4dCcgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge2Jvb2xlYW59IC0gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoZSBzbGlkZXIgaXMgYmVpbmcgZHJhZ2dlZCBieSB0aGUga2V5Ym9hcmRcclxuICAgIHRoaXMua2V5Ym9hcmREcmFnZ2luZyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgVlNsaWRlciggcHJvcGVydHksIHJhbmdlLCBvcHRpb25zLnNsaWRlck9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCB2YWx1ZVRleHQgPSBuZXcgVGV4dCggVXRpbHMudG9GaXhlZCggcmFuZ2UubWF4LCAyICksIHtcclxuICAgICAgZm9udDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuUkVBRE9VVF9GT05ULFxyXG4gICAgICBmaWxsOiBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5CTEFDS19DT0xPUixcclxuICAgICAgbWF4V2lkdGg6IFJlc2lzdGFuY2VJbkFXaXJlQ29uc3RhbnRzLlNMSURFUl9XSURUSCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFsdWVUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgdW5pdFRleHQgPSBuZXcgUmljaFRleHQoIHVuaXRTdHJpbmcsIHtcclxuICAgICAgZm9udDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuVU5JVF9GT05ULFxyXG4gICAgICBmaWxsOiBSZXNpc3RhbmNlSW5BV2lyZUNvbnN0YW50cy5CTFVFX0NPTE9SLFxyXG4gICAgICBtYXhXaWR0aDogUmVzaXN0YW5jZUluQVdpcmVDb25zdGFudHMuU0xJREVSX1dJRFRILFxyXG4gICAgICBib3VuZHNNZXRob2Q6ICdhY2N1cmF0ZScsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3VuaXRUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdW5pdHMgdGV4dCBhdCB0aGUgYm90dG9tLCBldmVyeXRoaW5nIHN0YWNrZWQgb24gdG9wIG9mIGl0XHJcbiAgICB1bml0VGV4dC55ID0gMDtcclxuICAgIHZhbHVlVGV4dC5jZW50ZXJYID0gdW5pdFRleHQuY2VudGVyWDtcclxuXHJcbiAgICAvLyB2YWx1ZSB0ZXh0IGFib3ZlIHVuaXRUZXh0XHJcbiAgICB2YWx1ZVRleHQueSA9IHVuaXRUZXh0LnkgLSAzNTtcclxuXHJcbiAgICAvLyBzbGlkZXJzIGFsb25nIHRoZSB0b3Agb2YgdmFsdWVzXHJcbiAgICBzbGlkZXIuYm90dG9tID0gdmFsdWVUZXh0LnkgLSAzMDtcclxuICAgIHNsaWRlci5jZW50ZXJYID0gdW5pdFRleHQuY2VudGVyWDtcclxuXHJcbiAgICAvLyBuYW1lcyBhbG9uZyB0aGUgdG9wIG9mIHRoZSBzbGlkZXJcclxuICAgIG5hbWVUZXh0LnkgPSBzbGlkZXIudG9wIC0gNTtcclxuICAgIG5hbWVUZXh0LmNlbnRlclggPSBzbGlkZXIuY2VudGVyWDtcclxuXHJcbiAgICAvLyBzeW1ib2wgdGV4dHMgYWxvbmcgdGhlIHRvcFxyXG4gICAgc3ltYm9sVGV4dC5ib3R0b20gPSBuYW1lVGV4dC55IC0gMjA7XHJcbiAgICBzeW1ib2xUZXh0LmNlbnRlclggPSBuYW1lVGV4dC5jZW50ZXJYO1xyXG5cclxuICAgIC8vIEFkZCBjaGlsZHJlbiwgZnJvbSB0b3AgdG8gYm90dG9tIG9mIHRoZSBzbGlkZXIgdW5pdFxyXG4gICAgdGhpcy5hZGRDaGlsZCggc3ltYm9sVGV4dCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmFtZVRleHQgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNsaWRlciApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmFsdWVUZXh0ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB1bml0VGV4dCApO1xyXG5cclxuICAgIC8vIFVwZGF0ZSB2YWx1ZSBvZiB0aGUgcmVhZG91dC4gTm8gbmVlZCB0byB1bmxpbmssIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltdWxhdGlvbi5cclxuICAgIHByb3BlcnR5LmxpbmsoIHZhbHVlID0+IHtcclxuICAgICAgdmFsdWVUZXh0LnN0cmluZyA9IFV0aWxzLnRvRml4ZWQoIHZhbHVlLCAyICk7XHJcbiAgICAgIHZhbHVlVGV4dC5jZW50ZXJYID0gdW5pdFRleHQuY2VudGVyWDtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxucmVzaXN0YW5jZUluQVdpcmUucmVnaXN0ZXIoICdTbGlkZXJVbml0JywgU2xpZGVyVW5pdCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2xpZGVyVW5pdDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsU0FBU0MsSUFBSSxFQUFFQyxRQUFRLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDeEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0MsMEJBQTBCLE1BQU0sa0NBQWtDO0FBRXpFLE1BQU1DLFVBQVUsU0FBU04sSUFBSSxDQUFDO0VBQzVCO0FBQ0Y7QUFDQTtBQUNBO0FB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