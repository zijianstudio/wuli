// Copyright 2018-2022, University of Colorado Boulder
// @ts-nocheck
/**
 * Slider abstraction for the frequency and amplitude sliders--but note that light frequency slider uses spectrum for
 * track and thumb.  All instances exist for the lifetime of the sim and do not require disposal.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import HSlider from '../../../../sun/js/HSlider.js';
import waveInterference from '../../waveInterference.js';
import WaveInterferenceStrings from '../../WaveInterferenceStrings.js';
import WaveInterferenceConstants from '../WaveInterferenceConstants.js';
import WaveInterferenceText from './WaveInterferenceText.js';

// constants
const TOLERANCE = 1E-6;
const maxString = WaveInterferenceStrings.max;
const minString = WaveInterferenceStrings.min;
const LABEL_OPTIONS = {
  fontSize: WaveInterferenceConstants.TICK_FONT_SIZE,
  maxWidth: WaveInterferenceConstants.TICK_MAX_WIDTH
};
const MAJOR_TICK_MODULUS = 5;
class WaveInterferenceSlider extends HSlider {
  constructor(property, options) {
    const maxTickIndex = options && options.maxTickIndex ? options.maxTickIndex : 10;
    assert && assert(property.range, 'WaveInterferenceSlider.property requires range');
    const min = property.range.min;
    const max = property.range.max;
    const minLabel = new WaveInterferenceText(min === 0 ? '0' : minString, LABEL_OPTIONS);
    const maxLabel = new WaveInterferenceText(maxString, LABEL_OPTIONS);
    const ticks = _.range(0, maxTickIndex + 1).map(index => {
      return {
        value: Utils.linear(0, maxTickIndex, min, max, index),
        type: index % MAJOR_TICK_MODULUS === 0 ? 'major' : 'minor',
        label: index === 0 ? minLabel : index === maxTickIndex ? maxLabel : null
      };
    });
    options = merge({
      // Match the number of sounds generated to the number of tickmarks.  The count is reduced by two to account for
      // the first and last ticks.
      valueChangeSoundGeneratorOptions: {
        numberOfMiddleThresholds: ticks.length - 2
      },
      // Ticks are created for all sliders for sonification, but not shown for the Light Frequency slider
      showTicks: true,
      constrainValue: value => {
        if (Math.abs(value - property.range.min) <= TOLERANCE) {
          return property.range.min;
        } else if (Math.abs(value - property.range.max) <= TOLERANCE) {
          return property.range.max;
        } else {
          return value;
        }
      }
    }, options);

    // ticks
    if (options.showTicks) {
      options = merge({
        tickLabelSpacing: 2,
        majorTickLength: WaveInterferenceConstants.MAJOR_TICK_LENGTH,
        minorTickLength: 8
      }, options);
    }
    if (!options.thumbNode) {
      options.thumbSize = WaveInterferenceConstants.THUMB_SIZE;
    }
    if (!options.trackNode) {
      options.trackSize = new Dimension2(150, 1);
    }
    super(property, property.range, options);
    options.showTicks && ticks.forEach(tick => {
      if (tick.type === 'major') {
        this.addMajorTick(tick.value, tick.label);
      } else {
        this.addMinorTick(tick.value, tick.label);
      }
    });
  }
}
waveInterference.register('WaveInterferenceSlider', WaveInterferenceSlider);
export default WaveInterferenceSlider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVXRpbHMiLCJtZXJnZSIsIkhTbGlkZXIiLCJ3YXZlSW50ZXJmZXJlbmNlIiwiV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MiLCJXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzIiwiV2F2ZUludGVyZmVyZW5jZVRleHQiLCJUT0xFUkFOQ0UiLCJtYXhTdHJpbmciLCJtYXgiLCJtaW5TdHJpbmciLCJtaW4iLCJMQUJFTF9PUFRJT05TIiwiZm9udFNpemUiLCJUSUNLX0ZPTlRfU0laRSIsIm1heFdpZHRoIiwiVElDS19NQVhfV0lEVEgiLCJNQUpPUl9USUNLX01PRFVMVVMiLCJXYXZlSW50ZXJmZXJlbmNlU2xpZGVyIiwiY29uc3RydWN0b3IiLCJwcm9wZXJ0eSIsIm9wdGlvbnMiLCJtYXhUaWNrSW5kZXgiLCJhc3NlcnQiLCJyYW5nZSIsIm1pbkxhYmVsIiwibWF4TGFiZWwiLCJ0aWNrcyIsIl8iLCJtYXAiLCJpbmRleCIsInZhbHVlIiwibGluZWFyIiwidHlwZSIsImxhYmVsIiwidmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnMiLCJudW1iZXJPZk1pZGRsZVRocmVzaG9sZHMiLCJsZW5ndGgiLCJzaG93VGlja3MiLCJjb25zdHJhaW5WYWx1ZSIsIk1hdGgiLCJhYnMiLCJ0aWNrTGFiZWxTcGFjaW5nIiwibWFqb3JUaWNrTGVuZ3RoIiwiTUFKT1JfVElDS19MRU5HVEgiLCJtaW5vclRpY2tMZW5ndGgiLCJ0aHVtYk5vZGUiLCJ0aHVtYlNpemUiLCJUSFVNQl9TSVpFIiwidHJhY2tOb2RlIiwidHJhY2tTaXplIiwiZm9yRWFjaCIsInRpY2siLCJhZGRNYWpvclRpY2siLCJhZGRNaW5vclRpY2siLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldhdmVJbnRlcmZlcmVuY2VTbGlkZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcbi8vIEB0cy1ub2NoZWNrXHJcbi8qKlxyXG4gKiBTbGlkZXIgYWJzdHJhY3Rpb24gZm9yIHRoZSBmcmVxdWVuY3kgYW5kIGFtcGxpdHVkZSBzbGlkZXJzLS1idXQgbm90ZSB0aGF0IGxpZ2h0IGZyZXF1ZW5jeSBzbGlkZXIgdXNlcyBzcGVjdHJ1bSBmb3JcclxuICogdHJhY2sgYW5kIHRodW1iLiAgQWxsIGluc3RhbmNlcyBleGlzdCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0gYW5kIGRvIG5vdCByZXF1aXJlIGRpc3Bvc2FsLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IEhTbGlkZXIsIHsgSFNsaWRlck9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvSFNsaWRlci5qcyc7XHJcbmltcG9ydCB3YXZlSW50ZXJmZXJlbmNlIGZyb20gJy4uLy4uL3dhdmVJbnRlcmZlcmVuY2UuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MgZnJvbSAnLi4vLi4vV2F2ZUludGVyZmVyZW5jZVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cyBmcm9tICcuLi9XYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFdhdmVJbnRlcmZlcmVuY2VUZXh0IGZyb20gJy4vV2F2ZUludGVyZmVyZW5jZVRleHQuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRPTEVSQU5DRSA9IDFFLTY7XHJcblxyXG5jb25zdCBtYXhTdHJpbmcgPSBXYXZlSW50ZXJmZXJlbmNlU3RyaW5ncy5tYXg7XHJcbmNvbnN0IG1pblN0cmluZyA9IFdhdmVJbnRlcmZlcmVuY2VTdHJpbmdzLm1pbjtcclxuXHJcbmNvbnN0IExBQkVMX09QVElPTlMgPSB7XHJcbiAgZm9udFNpemU6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuVElDS19GT05UX1NJWkUsXHJcbiAgbWF4V2lkdGg6IFdhdmVJbnRlcmZlcmVuY2VDb25zdGFudHMuVElDS19NQVhfV0lEVEhcclxufTtcclxuY29uc3QgTUFKT1JfVElDS19NT0RVTFVTID0gNTtcclxuXHJcbmNsYXNzIFdhdmVJbnRlcmZlcmVuY2VTbGlkZXIgZXh0ZW5kcyBIU2xpZGVyIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm9wZXJ0eTogVFByb3BlcnR5PG51bWJlcj4sIG9wdGlvbnM/OiBIU2xpZGVyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBtYXhUaWNrSW5kZXggPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5tYXhUaWNrSW5kZXggKSA/IG9wdGlvbnMubWF4VGlja0luZGV4IDogMTA7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydHkucmFuZ2UsICdXYXZlSW50ZXJmZXJlbmNlU2xpZGVyLnByb3BlcnR5IHJlcXVpcmVzIHJhbmdlJyApO1xyXG4gICAgY29uc3QgbWluID0gcHJvcGVydHkucmFuZ2UubWluO1xyXG4gICAgY29uc3QgbWF4ID0gcHJvcGVydHkucmFuZ2UubWF4O1xyXG4gICAgY29uc3QgbWluTGFiZWwgPSBuZXcgV2F2ZUludGVyZmVyZW5jZVRleHQoIG1pbiA9PT0gMCA/ICcwJyA6IG1pblN0cmluZywgTEFCRUxfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgbWF4TGFiZWwgPSBuZXcgV2F2ZUludGVyZmVyZW5jZVRleHQoIG1heFN0cmluZywgTEFCRUxfT1BUSU9OUyApO1xyXG4gICAgY29uc3QgdGlja3MgPSBfLnJhbmdlKCAwLCBtYXhUaWNrSW5kZXggKyAxICkubWFwKCBpbmRleCA9PiB7XHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgdmFsdWU6IFV0aWxzLmxpbmVhciggMCwgbWF4VGlja0luZGV4LCBtaW4sIG1heCwgaW5kZXggKSxcclxuICAgICAgICB0eXBlOiBpbmRleCAlIE1BSk9SX1RJQ0tfTU9EVUxVUyA9PT0gMCA/ICdtYWpvcicgOiAnbWlub3InLFxyXG4gICAgICAgIGxhYmVsOiBpbmRleCA9PT0gMCA/IG1pbkxhYmVsIDpcclxuICAgICAgICAgICAgICAgaW5kZXggPT09IG1heFRpY2tJbmRleCA/IG1heExhYmVsIDpcclxuICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICB9O1xyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG5cclxuICAgICAgLy8gTWF0Y2ggdGhlIG51bWJlciBvZiBzb3VuZHMgZ2VuZXJhdGVkIHRvIHRoZSBudW1iZXIgb2YgdGlja21hcmtzLiAgVGhlIGNvdW50IGlzIHJlZHVjZWQgYnkgdHdvIHRvIGFjY291bnQgZm9yXHJcbiAgICAgIC8vIHRoZSBmaXJzdCBhbmQgbGFzdCB0aWNrcy5cclxuICAgICAgdmFsdWVDaGFuZ2VTb3VuZEdlbmVyYXRvck9wdGlvbnM6IHsgbnVtYmVyT2ZNaWRkbGVUaHJlc2hvbGRzOiB0aWNrcy5sZW5ndGggLSAyIH0sXHJcblxyXG4gICAgICAvLyBUaWNrcyBhcmUgY3JlYXRlZCBmb3IgYWxsIHNsaWRlcnMgZm9yIHNvbmlmaWNhdGlvbiwgYnV0IG5vdCBzaG93biBmb3IgdGhlIExpZ2h0IEZyZXF1ZW5jeSBzbGlkZXJcclxuICAgICAgc2hvd1RpY2tzOiB0cnVlLFxyXG4gICAgICBjb25zdHJhaW5WYWx1ZTogdmFsdWUgPT4ge1xyXG4gICAgICAgIGlmICggTWF0aC5hYnMoIHZhbHVlIC0gcHJvcGVydHkucmFuZ2UubWluICkgPD0gVE9MRVJBTkNFICkge1xyXG4gICAgICAgICAgcmV0dXJuIHByb3BlcnR5LnJhbmdlLm1pbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoIE1hdGguYWJzKCB2YWx1ZSAtIHByb3BlcnR5LnJhbmdlLm1heCApIDw9IFRPTEVSQU5DRSApIHtcclxuICAgICAgICAgIHJldHVybiBwcm9wZXJ0eS5yYW5nZS5tYXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHRpY2tzXHJcbiAgICBpZiAoIG9wdGlvbnMuc2hvd1RpY2tzICkge1xyXG4gICAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgICB0aWNrTGFiZWxTcGFjaW5nOiAyLFxyXG4gICAgICAgIG1ham9yVGlja0xlbmd0aDogV2F2ZUludGVyZmVyZW5jZUNvbnN0YW50cy5NQUpPUl9USUNLX0xFTkdUSCxcclxuICAgICAgICBtaW5vclRpY2tMZW5ndGg6IDhcclxuXHJcbiAgICAgIH0sIG9wdGlvbnMgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoICFvcHRpb25zLnRodW1iTm9kZSApIHtcclxuICAgICAgb3B0aW9ucy50aHVtYlNpemUgPSBXYXZlSW50ZXJmZXJlbmNlQ29uc3RhbnRzLlRIVU1CX1NJWkU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCAhb3B0aW9ucy50cmFja05vZGUgKSB7XHJcbiAgICAgIG9wdGlvbnMudHJhY2tTaXplID0gbmV3IERpbWVuc2lvbjIoIDE1MCwgMSApO1xyXG4gICAgfVxyXG5cclxuICAgIHN1cGVyKCBwcm9wZXJ0eSwgcHJvcGVydHkucmFuZ2UsIG9wdGlvbnMgKTtcclxuXHJcbiAgICBvcHRpb25zLnNob3dUaWNrcyAmJiB0aWNrcy5mb3JFYWNoKCB0aWNrID0+IHtcclxuICAgICAgaWYgKCB0aWNrLnR5cGUgPT09ICdtYWpvcicgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRNYWpvclRpY2soIHRpY2sudmFsdWUsIHRpY2subGFiZWwgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmFkZE1pbm9yVGljayggdGljay52YWx1ZSwgdGljay5sYWJlbCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG53YXZlSW50ZXJmZXJlbmNlLnJlZ2lzdGVyKCAnV2F2ZUludGVyZmVyZW5jZVNsaWRlcicsIFdhdmVJbnRlcmZlcmVuY2VTbGlkZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgV2F2ZUludGVyZmVyZW5jZVNsaWRlcjsiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsT0FBTyxNQUEwQiwrQkFBK0I7QUFDdkUsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBQ3hELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0Msb0JBQW9CLE1BQU0sMkJBQTJCOztBQUU1RDtBQUNBLE1BQU1DLFNBQVMsR0FBRyxJQUFJO0FBRXRCLE1BQU1DLFNBQVMsR0FBR0osdUJBQXVCLENBQUNLLEdBQUc7QUFDN0MsTUFBTUMsU0FBUyxHQUFHTix1QkFBdUIsQ0FBQ08sR0FBRztBQUU3QyxNQUFNQyxhQUFhLEdBQUc7RUFDcEJDLFFBQVEsRUFBRVIseUJBQXlCLENBQUNTLGNBQWM7RUFDbERDLFFBQVEsRUFBRVYseUJBQXlCLENBQUNXO0FBQ3RDLENBQUM7QUFDRCxNQUFNQyxrQkFBa0IsR0FBRyxDQUFDO0FBRTVCLE1BQU1DLHNCQUFzQixTQUFTaEIsT0FBTyxDQUFDO0VBRXBDaUIsV0FB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