// Copyright 2016-2022, University of Colorado Boulder

/**
 * Applied Force Slider of the Motion screens.  If the model velocity is larger than the max allowed value,
 * one half of the slider will become disabled depending on the direction of velocity.  The slider is also disabled
 * when the pusher has fallen over and there is no friction in the model.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Slider from '../../../../sun/js/Slider.js';
import SliderKnob from '../../common/view/SliderKnob.js';
import forcesAndMotionBasics from '../../forcesAndMotionBasics.js';
class AppliedForceSlider extends HSlider {
  /**
   * @param {MotionModel} model
   * @param {Range} range - the range of values for the slider
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(model, range, tandem, options) {
    const thumbNode = new SliderKnob(tandem.createTandem(Slider.THUMB_NODE_TANDEM_NAME));
    const enabledRangeProperty = new Property(range);
    super(model.appliedForceProperty, range, merge({
      trackSize: new Dimension2(300, 6),
      majorTickLength: 30,
      minorTickLength: 22,
      tickLabelSpacing: 3,
      thumbNode: thumbNode,
      enabledRangeProperty: enabledRangeProperty,
      tandem: tandem,
      // round so that applied force is not more precise than friction force
      constrainValue: value => Utils.roundSymmetric(value),
      // snap to zero on release - when the model is paused, the slider should not snap to a value so the user can set
      // up a state of forces
      endDrag: () => {
        if (model.playProperty.get()) {
          model.appliedForceProperty.set(0);
        }
      }
    }, options));
    this.range = range;

    // Note: I do not like this method of canceling, it relies on the assumption that the slider will end drag
    // when thisSlider.enabled is set to false. This solution should be fine until we have general support for
    // this kind of thing in scenery
    const cancelDrag = () => {
      this.enabled = false;
      this.enabled = true;
    };
    Multilink.multilink([model.speedClassificationProperty, model.frictionProperty], (speedClassification, friction) => {
      if (friction > 0) {
        // if we have any friction, all we want to do is cancel the drag so the pusher does not
        // rapidly stand up again
        if (speedClassification !== 'WITHIN_ALLOWED_RANGE') {
          cancelDrag();
        } else {
          enabledRangeProperty.value = new Range(range.min, range.max);
        }
      } else {
        // otherwise, we will want to disable a portion of the slider depending on the direciton of the stacks
        if (speedClassification === 'RIGHT_SPEED_EXCEEDED') {
          enabledRangeProperty.value = new Range(range.min, 0);
        } else if (speedClassification === 'LEFT_SPEED_EXCEEDED') {
          enabledRangeProperty.value = new Range(0, range.max);
        } else {
          enabledRangeProperty.value = new Range(range.min, range.max);
        }
      }
    });

    // when the slider is disabled, the thumb should be disabled as well
    // no need for dispose, slider exist for lifetime of sim
    this.enabledProperty.link(enabled => {
      thumbNode.enabledProperty.value = enabled;
    });

    //Add ticks at regular intervals in 8 divisions
    const initialTickValue = range.min;

    //Constants and functions for creating the ticks
    const numDivisions = 10; //e.g. divide the ruler into 1/8ths
    const numTicks = numDivisions + 1; //ticks on the end
    const delta = (range.max - range.min) / numDivisions;
    const isMajor = tickIndex => tickIndex % 5 === 0;

    //Generate each of the ticks and add to the parent
    _.range(numTicks).forEach(i => {
      const position = initialTickValue + i * delta;
      if (isMajor(i)) {
        const label = new Text(position, {
          font: new PhetFont(16),
          tandem: tandem.createTandem(`tick${i}Text`)
        });
        this.addMajorTick(position, label);
      } else {
        this.addMinorTick(position);
      }
    });
  }
}
forcesAndMotionBasics.register('AppliedForceSlider', AppliedForceSlider);
export default AppliedForceSlider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJSYW5nZSIsIlV0aWxzIiwibWVyZ2UiLCJQaGV0Rm9udCIsIlRleHQiLCJIU2xpZGVyIiwiU2xpZGVyIiwiU2xpZGVyS25vYiIsImZvcmNlc0FuZE1vdGlvbkJhc2ljcyIsIkFwcGxpZWRGb3JjZVNsaWRlciIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJyYW5nZSIsInRhbmRlbSIsIm9wdGlvbnMiLCJ0aHVtYk5vZGUiLCJjcmVhdGVUYW5kZW0iLCJUSFVNQl9OT0RFX1RBTkRFTV9OQU1FIiwiZW5hYmxlZFJhbmdlUHJvcGVydHkiLCJhcHBsaWVkRm9yY2VQcm9wZXJ0eSIsInRyYWNrU2l6ZSIsIm1ham9yVGlja0xlbmd0aCIsIm1pbm9yVGlja0xlbmd0aCIsInRpY2tMYWJlbFNwYWNpbmciLCJjb25zdHJhaW5WYWx1ZSIsInZhbHVlIiwicm91bmRTeW1tZXRyaWMiLCJlbmREcmFnIiwicGxheVByb3BlcnR5IiwiZ2V0Iiwic2V0IiwiY2FuY2VsRHJhZyIsImVuYWJsZWQiLCJtdWx0aWxpbmsiLCJzcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHkiLCJmcmljdGlvblByb3BlcnR5Iiwic3BlZWRDbGFzc2lmaWNhdGlvbiIsImZyaWN0aW9uIiwibWluIiwibWF4IiwiZW5hYmxlZFByb3BlcnR5IiwibGluayIsImluaXRpYWxUaWNrVmFsdWUiLCJudW1EaXZpc2lvbnMiLCJudW1UaWNrcyIsImRlbHRhIiwiaXNNYWpvciIsInRpY2tJbmRleCIsIl8iLCJmb3JFYWNoIiwiaSIsInBvc2l0aW9uIiwibGFiZWwiLCJmb250IiwiYWRkTWFqb3JUaWNrIiwiYWRkTWlub3JUaWNrIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJBcHBsaWVkRm9yY2VTbGlkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQXBwbGllZCBGb3JjZSBTbGlkZXIgb2YgdGhlIE1vdGlvbiBzY3JlZW5zLiAgSWYgdGhlIG1vZGVsIHZlbG9jaXR5IGlzIGxhcmdlciB0aGFuIHRoZSBtYXggYWxsb3dlZCB2YWx1ZSxcclxuICogb25lIGhhbGYgb2YgdGhlIHNsaWRlciB3aWxsIGJlY29tZSBkaXNhYmxlZCBkZXBlbmRpbmcgb24gdGhlIGRpcmVjdGlvbiBvZiB2ZWxvY2l0eS4gIFRoZSBzbGlkZXIgaXMgYWxzbyBkaXNhYmxlZFxyXG4gKiB3aGVuIHRoZSBwdXNoZXIgaGFzIGZhbGxlbiBvdmVyIGFuZCB0aGVyZSBpcyBubyBmcmljdGlvbiBpbiB0aGUgbW9kZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IFNsaWRlciBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvU2xpZGVyLmpzJztcclxuaW1wb3J0IFNsaWRlcktub2IgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU2xpZGVyS25vYi5qcyc7XHJcbmltcG9ydCBmb3JjZXNBbmRNb3Rpb25CYXNpY3MgZnJvbSAnLi4vLi4vZm9yY2VzQW5kTW90aW9uQmFzaWNzLmpzJztcclxuXHJcbmNsYXNzIEFwcGxpZWRGb3JjZVNsaWRlciBleHRlbmRzIEhTbGlkZXIge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge01vdGlvbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlIC0gdGhlIHJhbmdlIG9mIHZhbHVlcyBmb3IgdGhlIHNsaWRlclxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCByYW5nZSwgdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IHRodW1iTm9kZSA9IG5ldyBTbGlkZXJLbm9iKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCBTbGlkZXIuVEhVTUJfTk9ERV9UQU5ERU1fTkFNRSApICk7XHJcblxyXG4gICAgY29uc3QgZW5hYmxlZFJhbmdlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHJhbmdlICk7XHJcblxyXG4gICAgc3VwZXIoIG1vZGVsLmFwcGxpZWRGb3JjZVByb3BlcnR5LCByYW5nZSwgbWVyZ2UoIHtcclxuICAgICAgdHJhY2tTaXplOiBuZXcgRGltZW5zaW9uMiggMzAwLCA2ICksXHJcbiAgICAgIG1ham9yVGlja0xlbmd0aDogMzAsXHJcbiAgICAgIG1pbm9yVGlja0xlbmd0aDogMjIsXHJcbiAgICAgIHRpY2tMYWJlbFNwYWNpbmc6IDMsXHJcbiAgICAgIHRodW1iTm9kZTogdGh1bWJOb2RlLFxyXG4gICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eTogZW5hYmxlZFJhbmdlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLFxyXG5cclxuICAgICAgLy8gcm91bmQgc28gdGhhdCBhcHBsaWVkIGZvcmNlIGlzIG5vdCBtb3JlIHByZWNpc2UgdGhhbiBmcmljdGlvbiBmb3JjZVxyXG4gICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4gVXRpbHMucm91bmRTeW1tZXRyaWMoIHZhbHVlICksXHJcblxyXG4gICAgICAvLyBzbmFwIHRvIHplcm8gb24gcmVsZWFzZSAtIHdoZW4gdGhlIG1vZGVsIGlzIHBhdXNlZCwgdGhlIHNsaWRlciBzaG91bGQgbm90IHNuYXAgdG8gYSB2YWx1ZSBzbyB0aGUgdXNlciBjYW4gc2V0XHJcbiAgICAgIC8vIHVwIGEgc3RhdGUgb2YgZm9yY2VzXHJcbiAgICAgIGVuZERyYWc6ICgpID0+IHtcclxuICAgICAgICBpZiAoIG1vZGVsLnBsYXlQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICAgIG1vZGVsLmFwcGxpZWRGb3JjZVByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucyApICk7XHJcblxyXG4gICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xyXG5cclxuICAgIC8vIE5vdGU6IEkgZG8gbm90IGxpa2UgdGhpcyBtZXRob2Qgb2YgY2FuY2VsaW5nLCBpdCByZWxpZXMgb24gdGhlIGFzc3VtcHRpb24gdGhhdCB0aGUgc2xpZGVyIHdpbGwgZW5kIGRyYWdcclxuICAgIC8vIHdoZW4gdGhpc1NsaWRlci5lbmFibGVkIGlzIHNldCB0byBmYWxzZS4gVGhpcyBzb2x1dGlvbiBzaG91bGQgYmUgZmluZSB1bnRpbCB3ZSBoYXZlIGdlbmVyYWwgc3VwcG9ydCBmb3JcclxuICAgIC8vIHRoaXMga2luZCBvZiB0aGluZyBpbiBzY2VuZXJ5XHJcbiAgICBjb25zdCBjYW5jZWxEcmFnID0gKCkgPT4ge1xyXG4gICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcclxuICAgIH07XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBtb2RlbC5zcGVlZENsYXNzaWZpY2F0aW9uUHJvcGVydHksIG1vZGVsLmZyaWN0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCBzcGVlZENsYXNzaWZpY2F0aW9uLCBmcmljdGlvbiApID0+IHtcclxuICAgICAgICBpZiAoIGZyaWN0aW9uID4gMCApIHtcclxuICAgICAgICAgIC8vIGlmIHdlIGhhdmUgYW55IGZyaWN0aW9uLCBhbGwgd2Ugd2FudCB0byBkbyBpcyBjYW5jZWwgdGhlIGRyYWcgc28gdGhlIHB1c2hlciBkb2VzIG5vdFxyXG4gICAgICAgICAgLy8gcmFwaWRseSBzdGFuZCB1cCBhZ2FpblxyXG4gICAgICAgICAgaWYgKCBzcGVlZENsYXNzaWZpY2F0aW9uICE9PSAnV0lUSElOX0FMTE9XRURfUkFOR0UnICkge1xyXG4gICAgICAgICAgICBjYW5jZWxEcmFnKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHkudmFsdWUgPSBuZXcgUmFuZ2UoIHJhbmdlLm1pbiwgcmFuZ2UubWF4ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIG90aGVyd2lzZSwgd2Ugd2lsbCB3YW50IHRvIGRpc2FibGUgYSBwb3J0aW9uIG9mIHRoZSBzbGlkZXIgZGVwZW5kaW5nIG9uIHRoZSBkaXJlY2l0b24gb2YgdGhlIHN0YWNrc1xyXG4gICAgICAgICAgaWYgKCBzcGVlZENsYXNzaWZpY2F0aW9uID09PSAnUklHSFRfU1BFRURfRVhDRUVERUQnICkge1xyXG4gICAgICAgICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggcmFuZ2UubWluLCAwICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIGlmICggc3BlZWRDbGFzc2lmaWNhdGlvbiA9PT0gJ0xFRlRfU1BFRURfRVhDRUVERUQnICkge1xyXG4gICAgICAgICAgICBlbmFibGVkUmFuZ2VQcm9wZXJ0eS52YWx1ZSA9IG5ldyBSYW5nZSggMCwgcmFuZ2UubWF4ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZW5hYmxlZFJhbmdlUHJvcGVydHkudmFsdWUgPSBuZXcgUmFuZ2UoIHJhbmdlLm1pbiwgcmFuZ2UubWF4ICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gd2hlbiB0aGUgc2xpZGVyIGlzIGRpc2FibGVkLCB0aGUgdGh1bWIgc2hvdWxkIGJlIGRpc2FibGVkIGFzIHdlbGxcclxuICAgIC8vIG5vIG5lZWQgZm9yIGRpc3Bvc2UsIHNsaWRlciBleGlzdCBmb3IgbGlmZXRpbWUgb2Ygc2ltXHJcbiAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5saW5rKCBlbmFibGVkID0+IHtcclxuICAgICAgdGh1bWJOb2RlLmVuYWJsZWRQcm9wZXJ0eS52YWx1ZSA9IGVuYWJsZWQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9BZGQgdGlja3MgYXQgcmVndWxhciBpbnRlcnZhbHMgaW4gOCBkaXZpc2lvbnNcclxuICAgIGNvbnN0IGluaXRpYWxUaWNrVmFsdWUgPSByYW5nZS5taW47XHJcblxyXG4gICAgLy9Db25zdGFudHMgYW5kIGZ1bmN0aW9ucyBmb3IgY3JlYXRpbmcgdGhlIHRpY2tzXHJcbiAgICBjb25zdCBudW1EaXZpc2lvbnMgPSAxMDsgLy9lLmcuIGRpdmlkZSB0aGUgcnVsZXIgaW50byAxLzh0aHNcclxuICAgIGNvbnN0IG51bVRpY2tzID0gbnVtRGl2aXNpb25zICsgMTsgLy90aWNrcyBvbiB0aGUgZW5kXHJcbiAgICBjb25zdCBkZWx0YSA9ICggcmFuZ2UubWF4IC0gcmFuZ2UubWluICkgLyBudW1EaXZpc2lvbnM7XHJcblxyXG4gICAgY29uc3QgaXNNYWpvciA9IHRpY2tJbmRleCA9PiAoIHRpY2tJbmRleCAlIDUgPT09IDAgKTtcclxuXHJcbiAgICAvL0dlbmVyYXRlIGVhY2ggb2YgdGhlIHRpY2tzIGFuZCBhZGQgdG8gdGhlIHBhcmVudFxyXG4gICAgXy5yYW5nZSggbnVtVGlja3MgKS5mb3JFYWNoKCBpID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gaW5pdGlhbFRpY2tWYWx1ZSArIGkgKiBkZWx0YTtcclxuICAgICAgaWYgKCBpc01ham9yKCBpICkgKSB7XHJcbiAgICAgICAgY29uc3QgbGFiZWwgPSBuZXcgVGV4dCggcG9zaXRpb24sIHtcclxuICAgICAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTYgKSxcclxuICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggYHRpY2ske2l9VGV4dGAgKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLmFkZE1ham9yVGljayggcG9zaXRpb24sIGxhYmVsICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5hZGRNaW5vclRpY2soIHBvc2l0aW9uICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmZvcmNlc0FuZE1vdGlvbkJhc2ljcy5yZWdpc3RlciggJ0FwcGxpZWRGb3JjZVNsaWRlcicsIEFwcGxpZWRGb3JjZVNsaWRlciApO1xyXG5leHBvcnQgZGVmYXVsdCBBcHBsaWVkRm9yY2VTbGlkZXI7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxL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