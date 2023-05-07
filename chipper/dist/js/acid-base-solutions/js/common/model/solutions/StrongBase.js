// Copyright 2014-2022, University of Colorado Boulder

/**
 * StrongBase is an aqueous solution whose solute is a strong base.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import acidBaseSolutions from '../../../acidBaseSolutions.js';
import ABSConstants from '../../ABSConstants.js';
import AqueousSolution from './AqueousSolution.js';
import ABSColors from '../../ABSColors.js';
export default class StrongBase extends AqueousSolution {
  constructor(tandem) {
    // particles found in this solution
    const particles = [{
      key: 'MOH',
      color: ABSColors.MOH,
      getConcentration: () => this.getSoluteConcentration()
    }, {
      key: 'M',
      color: ABSColors.M,
      getConcentration: () => this.getProductConcentration()
    }, {
      key: 'OH',
      color: ABSColors.OH,
      getConcentration: () => this.getOHConcentration()
    }];
    super('strongBase', ABSConstants.STRONG_STRENGTH, ABSConstants.CONCENTRATION_RANGE.defaultValue, particles, tandem);
  }

  // [MOH] = 0
  getSoluteConcentration() {
    return 0;
  }

  // [M+] = c
  getProductConcentration() {
    return this.getConcentration();
  }

  // [H3O+] = Kw / [OH-]
  getH3OConcentration() {
    return ABSConstants.WATER_EQUILIBRIUM_CONSTANT / this.getOHConcentration();
  }

  // [OH-] = c
  getOHConcentration() {
    return this.getConcentration();
  }

  // [H2O] = W
  getH2OConcentration() {
    return ABSConstants.WATER_CONCENTRATION;
  }

  // Strong strength is a constant.
  isValidStrength(strength) {
    return strength === ABSConstants.STRONG_STRENGTH;
  }
}
acidBaseSolutions.register('StrongBase', StrongBase);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhY2lkQmFzZVNvbHV0aW9ucyIsIkFCU0NvbnN0YW50cyIsIkFxdWVvdXNTb2x1dGlvbiIsIkFCU0NvbG9ycyIsIlN0cm9uZ0Jhc2UiLCJjb25zdHJ1Y3RvciIsInRhbmRlbSIsInBhcnRpY2xlcyIsImtleSIsImNvbG9yIiwiTU9IIiwiZ2V0Q29uY2VudHJhdGlvbiIsImdldFNvbHV0ZUNvbmNlbnRyYXRpb24iLCJNIiwiZ2V0UHJvZHVjdENvbmNlbnRyYXRpb24iLCJPSCIsImdldE9IQ29uY2VudHJhdGlvbiIsIlNUUk9OR19TVFJFTkdUSCIsIkNPTkNFTlRSQVRJT05fUkFOR0UiLCJkZWZhdWx0VmFsdWUiLCJnZXRIM09Db25jZW50cmF0aW9uIiwiV0FURVJfRVFVSUxJQlJJVU1fQ09OU1RBTlQiLCJnZXRIMk9Db25jZW50cmF0aW9uIiwiV0FURVJfQ09OQ0VOVFJBVElPTiIsImlzVmFsaWRTdHJlbmd0aCIsInN0cmVuZ3RoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTdHJvbmdCYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFN0cm9uZ0Jhc2UgaXMgYW4gYXF1ZW91cyBzb2x1dGlvbiB3aG9zZSBzb2x1dGUgaXMgYSBzdHJvbmcgYmFzZS5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBhY2lkQmFzZVNvbHV0aW9ucyBmcm9tICcuLi8uLi8uLi9hY2lkQmFzZVNvbHV0aW9ucy5qcyc7XHJcbmltcG9ydCBBQlNDb25zdGFudHMgZnJvbSAnLi4vLi4vQUJTQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEFxdWVvdXNTb2x1dGlvbiBmcm9tICcuL0FxdWVvdXNTb2x1dGlvbi5qcyc7XHJcbmltcG9ydCBBQlNDb2xvcnMgZnJvbSAnLi4vLi4vQUJTQ29sb3JzLmpzJztcclxuaW1wb3J0IHsgUGFydGljbGUgfSBmcm9tICcuL1BhcnRpY2xlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0cm9uZ0Jhc2UgZXh0ZW5kcyBBcXVlb3VzU29sdXRpb24ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIC8vIHBhcnRpY2xlcyBmb3VuZCBpbiB0aGlzIHNvbHV0aW9uXHJcbiAgICBjb25zdCBwYXJ0aWNsZXM6IFBhcnRpY2xlW10gPSBbXHJcbiAgICAgIHsga2V5OiAnTU9IJywgY29sb3I6IEFCU0NvbG9ycy5NT0gsIGdldENvbmNlbnRyYXRpb246ICgpID0+IHRoaXMuZ2V0U29sdXRlQ29uY2VudHJhdGlvbigpIH0sXHJcbiAgICAgIHsga2V5OiAnTScsIGNvbG9yOiBBQlNDb2xvcnMuTSwgZ2V0Q29uY2VudHJhdGlvbjogKCkgPT4gdGhpcy5nZXRQcm9kdWN0Q29uY2VudHJhdGlvbigpIH0sXHJcbiAgICAgIHsga2V5OiAnT0gnLCBjb2xvcjogQUJTQ29sb3JzLk9ILCBnZXRDb25jZW50cmF0aW9uOiAoKSA9PiB0aGlzLmdldE9IQ29uY2VudHJhdGlvbigpIH1cclxuICAgIF07XHJcblxyXG4gICAgc3VwZXIoICdzdHJvbmdCYXNlJywgQUJTQ29uc3RhbnRzLlNUUk9OR19TVFJFTkdUSCwgQUJTQ29uc3RhbnRzLkNPTkNFTlRSQVRJT05fUkFOR0UuZGVmYXVsdFZhbHVlLCBwYXJ0aWNsZXMsIHRhbmRlbSApO1xyXG4gIH1cclxuXHJcbiAgLy8gW01PSF0gPSAwXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFNvbHV0ZUNvbmNlbnRyYXRpb24oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuXHJcbiAgLy8gW00rXSA9IGNcclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0UHJvZHVjdENvbmNlbnRyYXRpb24oKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmdldENvbmNlbnRyYXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8vIFtIM08rXSA9IEt3IC8gW09ILV1cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0SDNPQ29uY2VudHJhdGlvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIEFCU0NvbnN0YW50cy5XQVRFUl9FUVVJTElCUklVTV9DT05TVEFOVCAvIHRoaXMuZ2V0T0hDb25jZW50cmF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvLyBbT0gtXSA9IGNcclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0T0hDb25jZW50cmF0aW9uKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRDb25jZW50cmF0aW9uKCk7XHJcbiAgfVxyXG5cclxuICAvLyBbSDJPXSA9IFdcclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0SDJPQ29uY2VudHJhdGlvbigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIEFCU0NvbnN0YW50cy5XQVRFUl9DT05DRU5UUkFUSU9OO1xyXG4gIH1cclxuXHJcbiAgLy8gU3Ryb25nIHN0cmVuZ3RoIGlzIGEgY29uc3RhbnQuXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGlzVmFsaWRTdHJlbmd0aCggc3RyZW5ndGg6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHN0cmVuZ3RoID09PSBBQlNDb25zdGFudHMuU1RST05HX1NUUkVOR1RIICk7XHJcbiAgfVxyXG59XHJcblxyXG5hY2lkQmFzZVNvbHV0aW9ucy5yZWdpc3RlciggJ1N0cm9uZ0Jhc2UnLCBTdHJvbmdCYXNlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsaUJBQWlCLE1BQU0sK0JBQStCO0FBQzdELE9BQU9DLFlBQVksTUFBTSx1QkFBdUI7QUFDaEQsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBSTFDLGVBQWUsTUFBTUMsVUFBVSxTQUFTRixlQUFlLENBQUM7RUFFL0NHLFdBQVdBLENBQUVDLE1BQWMsRUFBRztJQUVuQztJQUNBLE1BQU1DLFNBQXFCLEdBQUcsQ0FDNUI7TUFBRUMsR0FBRyxFQUFFLEtBQUs7TUFBRUMsS0FBSyxFQUFFTixTQUFTLENBQUNPLEdBQUc7TUFBRUMsZ0JBQWdCLEVBQUVBLENBQUEsS0FBTSxJQUFJLENBQUNDLHNCQUFzQixDQUFDO0lBQUUsQ0FBQyxFQUMzRjtNQUFFSixHQUFHLEVBQUUsR0FBRztNQUFFQyxLQUFLLEVBQUVOLFNBQVMsQ0FBQ1UsQ0FBQztNQUFFRixnQkFBZ0IsRUFBRUEsQ0FBQSxLQUFNLElBQUksQ0FBQ0csdUJBQXVCLENBQUM7SUFBRSxDQUFDLEVBQ3hGO01BQUVOLEdBQUcsRUFBRSxJQUFJO01BQUVDLEtBQUssRUFBRU4sU0FBUyxDQUFDWSxFQUFFO01BQUVKLGdCQUFnQixFQUFFQSxDQUFBLEtBQU0sSUFBSSxDQUFDSyxrQkFBa0IsQ0FBQztJQUFFLENBQUMsQ0FDdEY7SUFFRCxLQUFLLENBQUUsWUFBWSxFQUFFZixZQUFZLENBQUNnQixlQUFlLEVBQUVoQixZQUFZLENBQUNpQixtQkFBbUIsQ0FBQ0MsWUFBWSxFQUFFWixTQUFTLEVBQUVELE1BQU8sQ0FBQztFQUN2SDs7RUFFQTtFQUNnQk0sc0JBQXNCQSxDQUFBLEVBQVc7SUFDL0MsT0FBTyxDQUFDO0VBQ1Y7O0VBRUE7RUFDZ0JFLHVCQUF1QkEsQ0FBQSxFQUFXO0lBQ2hELE9BQU8sSUFBSSxDQUFDSCxnQkFBZ0IsQ0FBQyxDQUFDO0VBQ2hDOztFQUVBO0VBQ2dCUyxtQkFBbUJBLENBQUEsRUFBVztJQUM1QyxPQUFPbkIsWUFBWSxDQUFDb0IsMEJBQTBCLEdBQUcsSUFBSSxDQUFDTCxrQkFBa0IsQ0FBQyxDQUFDO0VBQzVFOztFQUVBO0VBQ2dCQSxrQkFBa0JBLENBQUEsRUFBVztJQUMzQyxPQUFPLElBQUksQ0FBQ0wsZ0JBQWdCLENBQUMsQ0FBQztFQUNoQzs7RUFFQTtFQUNnQlcsbUJBQW1CQSxDQUFBLEVBQVc7SUFDNUMsT0FBT3JCLFlBQVksQ0FBQ3NCLG1CQUFtQjtFQUN6Qzs7RUFFQTtFQUNtQkMsZUFBZUEsQ0FBRUMsUUFBZ0IsRUFBWTtJQUM5RCxPQUFTQSxRQUFRLEtBQUt4QixZQUFZLENBQUNnQixlQUFlO0VBQ3BEO0FBQ0Y7QUFFQWpCLGlCQUFpQixDQUFDMEIsUUFBUSxDQUFFLFlBQVksRUFBRXRCLFVBQVcsQ0FBQyJ9