// Copyright 2015-2021, University of Colorado Boulder

/**
 * Barometer for r^2 deviation.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import curveFitting from '../../curveFitting.js';
import BarometerNode from './BarometerNode.js';
class BarometerR2Node extends BarometerNode {
  /**
   * @param {Property.<number>} rSquaredProperty - Property that represents r-deviation.
   * @param {Property.<boolean>} curveVisibleProperty
   * @param {Object} [options] for graph node.
   */
  constructor(rSquaredProperty, curveVisibleProperty, options) {
    options = merge({
      fill: 'blue',
      tickWidth: 20
    }, options);
    const tickPositionsToLabels = {
      0: '0',
      0.25: '0.25',
      0.5: '0.5',
      0.75: '0.75',
      1: '1'
    };

    // Property that maps rSquared -> rSquared, unless rSquared is NaN, where it maps NaN -> 0
    // No dispose necessary, present for the lifetime of the sim
    const modifiedRSquaredProperty = new DerivedProperty([rSquaredProperty], rSquared => isNaN(rSquared) ? 0 : rSquared, {
      valueType: 'number',
      isValidValue: value => value >= 0 && value <= 1
    });
    super(modifiedRSquaredProperty, curveVisibleProperty, tickPositionsToLabels, options);
  }
}
curveFitting.register('BarometerR2Node', BarometerR2Node);
export default BarometerR2Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJtZXJnZSIsImN1cnZlRml0dGluZyIsIkJhcm9tZXRlck5vZGUiLCJCYXJvbWV0ZXJSMk5vZGUiLCJjb25zdHJ1Y3RvciIsInJTcXVhcmVkUHJvcGVydHkiLCJjdXJ2ZVZpc2libGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJmaWxsIiwidGlja1dpZHRoIiwidGlja1Bvc2l0aW9uc1RvTGFiZWxzIiwibW9kaWZpZWRSU3F1YXJlZFByb3BlcnR5IiwiclNxdWFyZWQiLCJpc05hTiIsInZhbHVlVHlwZSIsImlzVmFsaWRWYWx1ZSIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXJvbWV0ZXJSMk5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFyb21ldGVyIGZvciByXjIgZGV2aWF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJleSBaZWxlbmtvdiAoTWxlYXJuZXIpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IGN1cnZlRml0dGluZyBmcm9tICcuLi8uLi9jdXJ2ZUZpdHRpbmcuanMnO1xyXG5pbXBvcnQgQmFyb21ldGVyTm9kZSBmcm9tICcuL0Jhcm9tZXRlck5vZGUuanMnO1xyXG5cclxuY2xhc3MgQmFyb21ldGVyUjJOb2RlIGV4dGVuZHMgQmFyb21ldGVyTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPG51bWJlcj59IHJTcXVhcmVkUHJvcGVydHkgLSBQcm9wZXJ0eSB0aGF0IHJlcHJlc2VudHMgci1kZXZpYXRpb24uXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGN1cnZlVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBmb3IgZ3JhcGggbm9kZS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggclNxdWFyZWRQcm9wZXJ0eSwgY3VydmVWaXNpYmxlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGZpbGw6ICdibHVlJyxcclxuICAgICAgdGlja1dpZHRoOiAyMFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRpY2tQb3NpdGlvbnNUb0xhYmVscyA9IHtcclxuICAgICAgMDogJzAnLFxyXG4gICAgICAwLjI1OiAnMC4yNScsXHJcbiAgICAgIDAuNTogJzAuNScsXHJcbiAgICAgIDAuNzU6ICcwLjc1JyxcclxuICAgICAgMTogJzEnXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFByb3BlcnR5IHRoYXQgbWFwcyByU3F1YXJlZCAtPiByU3F1YXJlZCwgdW5sZXNzIHJTcXVhcmVkIGlzIE5hTiwgd2hlcmUgaXQgbWFwcyBOYU4gLT4gMFxyXG4gICAgLy8gTm8gZGlzcG9zZSBuZWNlc3NhcnksIHByZXNlbnQgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBjb25zdCBtb2RpZmllZFJTcXVhcmVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHJTcXVhcmVkUHJvcGVydHkgXSxcclxuICAgICAgclNxdWFyZWQgPT4gaXNOYU4oIHJTcXVhcmVkICkgPyAwIDogclNxdWFyZWQsXHJcbiAgICAgIHsgdmFsdWVUeXBlOiAnbnVtYmVyJywgaXNWYWxpZFZhbHVlOiB2YWx1ZSA9PiB2YWx1ZSA+PSAwICYmIHZhbHVlIDw9IDEgfVxyXG4gICAgKTtcclxuXHJcbiAgICBzdXBlciggbW9kaWZpZWRSU3F1YXJlZFByb3BlcnR5LCBjdXJ2ZVZpc2libGVQcm9wZXJ0eSwgdGlja1Bvc2l0aW9uc1RvTGFiZWxzLCBvcHRpb25zICk7XHJcblxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmN1cnZlRml0dGluZy5yZWdpc3RlciggJ0Jhcm9tZXRlclIyTm9kZScsIEJhcm9tZXRlclIyTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBCYXJvbWV0ZXJSMk5vZGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUU5QyxNQUFNQyxlQUFlLFNBQVNELGFBQWEsQ0FBQztFQUUxQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VFLFdBQVdBLENBQUVDLGdCQUFnQixFQUFFQyxvQkFBb0IsRUFBRUMsT0FBTyxFQUFHO0lBRTdEQSxPQUFPLEdBQUdQLEtBQUssQ0FBRTtNQUNmUSxJQUFJLEVBQUUsTUFBTTtNQUNaQyxTQUFTLEVBQUU7SUFDYixDQUFDLEVBQUVGLE9BQVEsQ0FBQztJQUVaLE1BQU1HLHFCQUFxQixHQUFHO01BQzVCLENBQUMsRUFBRSxHQUFHO01BQ04sSUFBSSxFQUFFLE1BQU07TUFDWixHQUFHLEVBQUUsS0FBSztNQUNWLElBQUksRUFBRSxNQUFNO01BQ1osQ0FBQyxFQUFFO0lBQ0wsQ0FBQzs7SUFFRDtJQUNBO0lBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsSUFBSVosZUFBZSxDQUNsRCxDQUFFTSxnQkFBZ0IsQ0FBRSxFQUNwQk8sUUFBUSxJQUFJQyxLQUFLLENBQUVELFFBQVMsQ0FBQyxHQUFHLENBQUMsR0FBR0EsUUFBUSxFQUM1QztNQUFFRSxTQUFTLEVBQUUsUUFBUTtNQUFFQyxZQUFZLEVBQUVDLEtBQUssSUFBSUEsS0FBSyxJQUFJLENBQUMsSUFBSUEsS0FBSyxJQUFJO0lBQUUsQ0FDekUsQ0FBQztJQUVELEtBQUssQ0FBRUwsd0JBQXdCLEVBQUVMLG9CQUFvQixFQUFFSSxxQkFBcUIsRUFBRUgsT0FBUSxDQUFDO0VBRXpGO0FBRUY7QUFFQU4sWUFBWSxDQUFDZ0IsUUFBUSxDQUFFLGlCQUFpQixFQUFFZCxlQUFnQixDQUFDO0FBQzNELGVBQWVBLGVBQWUifQ==