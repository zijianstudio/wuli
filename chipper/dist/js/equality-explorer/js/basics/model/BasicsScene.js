// Copyright 2017-2022, University of Colorado Boulder

/**
 * Base class for scenes in the 'Basics' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import ConstantTermCreator from '../../common/model/ConstantTermCreator.js';
import EqualityExplorerScene from '../../common/model/EqualityExplorerScene.js';
import equalityExplorer from '../../equalityExplorer.js';
import ObjectTermCreator from '../../common/model/ObjectTermCreator.js';
export default class BasicsScene extends EqualityExplorerScene {
  /**
   * @param variables - in the order that they appear in the toolbox and equations
   * @param providedOptions
   */
  constructor(variables, providedOptions) {
    const options = optionize()({
      // SelfOptions
      hasConstantTerms: false,
      // EqualityExplorerSceneOptions
      hasNegativeTermsInToolbox: false,
      variables: variables,
      lockable: false
    }, providedOptions);
    const createLeftTermCreators = (lockedProperty, tandem) => createTermCreators(variables, lockedProperty, options.hasConstantTerms, tandem);
    const createRightTermCreators = (lockedProperty, tandem) => createTermCreators(variables, lockedProperty, options.hasConstantTerms, tandem);
    super(createLeftTermCreators, createRightTermCreators, options);
  }
}
function createTermCreators(variables, lockedProperty, hasConstantTerms, parentTandem) {
  const termCreators = [];

  // creators for object terms
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    termCreators.push(new ObjectTermCreator(variable, {
      lockedProperty: lockedProperty,
      tandem: parentTandem.createTandem(`${variable.symbol}TermCreator`)
    }));
  }

  // creator for constant terms
  if (hasConstantTerms) {
    termCreators.push(new ConstantTermCreator({
      lockedProperty: lockedProperty,
      tandem: parentTandem.createTandem('constantTermCreator')
    }));
  }
  return termCreators;
}
equalityExplorer.register('BasicsScene', BasicsScene);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDb25zdGFudFRlcm1DcmVhdG9yIiwiRXF1YWxpdHlFeHBsb3JlclNjZW5lIiwiZXF1YWxpdHlFeHBsb3JlciIsIk9iamVjdFRlcm1DcmVhdG9yIiwiQmFzaWNzU2NlbmUiLCJjb25zdHJ1Y3RvciIsInZhcmlhYmxlcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJoYXNDb25zdGFudFRlcm1zIiwiaGFzTmVnYXRpdmVUZXJtc0luVG9vbGJveCIsImxvY2thYmxlIiwiY3JlYXRlTGVmdFRlcm1DcmVhdG9ycyIsImxvY2tlZFByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGVybUNyZWF0b3JzIiwiY3JlYXRlUmlnaHRUZXJtQ3JlYXRvcnMiLCJwYXJlbnRUYW5kZW0iLCJ0ZXJtQ3JlYXRvcnMiLCJpIiwibGVuZ3RoIiwidmFyaWFibGUiLCJwdXNoIiwiY3JlYXRlVGFuZGVtIiwic3ltYm9sIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXNpY3NTY2VuZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIGZvciBzY2VuZXMgaW4gdGhlICdCYXNpY3MnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IENvbnN0YW50VGVybUNyZWF0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0NvbnN0YW50VGVybUNyZWF0b3IuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlclNjZW5lLCB7IEVxdWFsaXR5RXhwbG9yZXJTY2VuZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvRXF1YWxpdHlFeHBsb3JlclNjZW5lLmpzJztcclxuaW1wb3J0IFRlcm1DcmVhdG9yIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9UZXJtQ3JlYXRvci5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgT2JqZWN0VGVybUNyZWF0b3IgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL09iamVjdFRlcm1DcmVhdG9yLmpzJztcclxuaW1wb3J0IE9iamVjdFZhcmlhYmxlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9PYmplY3RWYXJpYWJsZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGhhc0NvbnN0YW50VGVybXM/OiBib29sZWFuOyAvLyBkb2VzIHRoaXMgc2NlbmUgYWxsb3cgeW91IHRvIGNyZWF0ZSBjb25zdGFudCB0ZXJtcz9cclxufTtcclxuXHJcbnR5cGUgQmFzaWNzU2NlbmVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEVxdWFsaXR5RXhwbG9yZXJTY2VuZU9wdGlvbnMsICd2YXJpYWJsZXMnIHwgJ2xvY2thYmxlJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNpY3NTY2VuZSBleHRlbmRzIEVxdWFsaXR5RXhwbG9yZXJTY2VuZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB2YXJpYWJsZXMgLSBpbiB0aGUgb3JkZXIgdGhhdCB0aGV5IGFwcGVhciBpbiB0aGUgdG9vbGJveCBhbmQgZXF1YXRpb25zXHJcbiAgICogQHBhcmFtIHByb3ZpZGVkT3B0aW9uc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdmFyaWFibGVzOiBPYmplY3RWYXJpYWJsZVtdLCBwcm92aWRlZE9wdGlvbnM6IEJhc2ljc1NjZW5lT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEJhc2ljc1NjZW5lT3B0aW9ucywgU2VsZk9wdGlvbnMsIEVxdWFsaXR5RXhwbG9yZXJTY2VuZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGhhc0NvbnN0YW50VGVybXM6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gRXF1YWxpdHlFeHBsb3JlclNjZW5lT3B0aW9uc1xyXG4gICAgICBoYXNOZWdhdGl2ZVRlcm1zSW5Ub29sYm94OiBmYWxzZSxcclxuICAgICAgdmFyaWFibGVzOiB2YXJpYWJsZXMsXHJcbiAgICAgIGxvY2thYmxlOiBmYWxzZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlTGVmdFRlcm1DcmVhdG9ycyA9ICggbG9ja2VkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbCwgdGFuZGVtOiBUYW5kZW0gKSA9PlxyXG4gICAgICBjcmVhdGVUZXJtQ3JlYXRvcnMoIHZhcmlhYmxlcywgbG9ja2VkUHJvcGVydHksIG9wdGlvbnMuaGFzQ29uc3RhbnRUZXJtcywgdGFuZGVtICk7XHJcblxyXG4gICAgY29uc3QgY3JlYXRlUmlnaHRUZXJtQ3JlYXRvcnMgPSAoIGxvY2tlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiB8IG51bGwsIHRhbmRlbTogVGFuZGVtICkgPT5cclxuICAgICAgY3JlYXRlVGVybUNyZWF0b3JzKCB2YXJpYWJsZXMsIGxvY2tlZFByb3BlcnR5LCBvcHRpb25zLmhhc0NvbnN0YW50VGVybXMsIHRhbmRlbSApO1xyXG5cclxuICAgIHN1cGVyKCBjcmVhdGVMZWZ0VGVybUNyZWF0b3JzLCBjcmVhdGVSaWdodFRlcm1DcmVhdG9ycywgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlVGVybUNyZWF0b3JzKCB2YXJpYWJsZXM6IE9iamVjdFZhcmlhYmxlW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9ja2VkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDb25zdGFudFRlcm1zOiBib29sZWFuLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudFRhbmRlbTogVGFuZGVtICk6IFRlcm1DcmVhdG9yW10ge1xyXG5cclxuICBjb25zdCB0ZXJtQ3JlYXRvcnM6IFRlcm1DcmVhdG9yW10gPSBbXTtcclxuXHJcbiAgLy8gY3JlYXRvcnMgZm9yIG9iamVjdCB0ZXJtc1xyXG4gIGZvciAoIGxldCBpID0gMDsgaSA8IHZhcmlhYmxlcy5sZW5ndGg7IGkrKyApIHtcclxuICAgIGNvbnN0IHZhcmlhYmxlID0gdmFyaWFibGVzWyBpIF07XHJcbiAgICB0ZXJtQ3JlYXRvcnMucHVzaCggbmV3IE9iamVjdFRlcm1DcmVhdG9yKCB2YXJpYWJsZSwge1xyXG4gICAgICBsb2NrZWRQcm9wZXJ0eTogbG9ja2VkUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogcGFyZW50VGFuZGVtLmNyZWF0ZVRhbmRlbSggYCR7dmFyaWFibGUuc3ltYm9sfVRlcm1DcmVhdG9yYCApXHJcbiAgICB9ICkgKTtcclxuICB9XHJcblxyXG4gIC8vIGNyZWF0b3IgZm9yIGNvbnN0YW50IHRlcm1zXHJcbiAgaWYgKCBoYXNDb25zdGFudFRlcm1zICkge1xyXG4gICAgdGVybUNyZWF0b3JzLnB1c2goIG5ldyBDb25zdGFudFRlcm1DcmVhdG9yKCB7XHJcbiAgICAgIGxvY2tlZFByb3BlcnR5OiBsb2NrZWRQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiBwYXJlbnRUYW5kZW0uY3JlYXRlVGFuZGVtKCAnY29uc3RhbnRUZXJtQ3JlYXRvcicgKVxyXG4gICAgfSApICk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGVybUNyZWF0b3JzO1xyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnQmFzaWNzU2NlbmUnLCBCYXNpY3NTY2VuZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLE1BQU0sdUNBQXVDO0FBRzdELE9BQU9DLG1CQUFtQixNQUFNLDJDQUEyQztBQUMzRSxPQUFPQyxxQkFBcUIsTUFBd0MsNkNBQTZDO0FBRWpILE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyxpQkFBaUIsTUFBTSx5Q0FBeUM7QUFTdkUsZUFBZSxNQUFNQyxXQUFXLFNBQVNILHFCQUFxQixDQUFDO0VBRTdEO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLFNBQTJCLEVBQUVDLGVBQW1DLEVBQUc7SUFFckYsTUFBTUMsT0FBTyxHQUFHVCxTQUFTLENBQWdFLENBQUMsQ0FBRTtNQUUxRjtNQUNBVSxnQkFBZ0IsRUFBRSxLQUFLO01BRXZCO01BQ0FDLHlCQUF5QixFQUFFLEtBQUs7TUFDaENKLFNBQVMsRUFBRUEsU0FBUztNQUNwQkssUUFBUSxFQUFFO0lBQ1osQ0FBQyxFQUFFSixlQUFnQixDQUFDO0lBRXBCLE1BQU1LLHNCQUFzQixHQUFHQSxDQUFFQyxjQUF3QyxFQUFFQyxNQUFjLEtBQ3ZGQyxrQkFBa0IsQ0FBRVQsU0FBUyxFQUFFTyxjQUFjLEVBQUVMLE9BQU8sQ0FBQ0MsZ0JBQWdCLEVBQUVLLE1BQU8sQ0FBQztJQUVuRixNQUFNRSx1QkFBdUIsR0FBR0EsQ0FBRUgsY0FBd0MsRUFBRUMsTUFBYyxLQUN4RkMsa0JBQWtCLENBQUVULFNBQVMsRUFBRU8sY0FBYyxFQUFFTCxPQUFPLENBQUNDLGdCQUFnQixFQUFFSyxNQUFPLENBQUM7SUFFbkYsS0FBSyxDQUFFRixzQkFBc0IsRUFBRUksdUJBQXVCLEVBQUVSLE9BQVEsQ0FBQztFQUNuRTtBQUNGO0FBRUEsU0FBU08sa0JBQWtCQSxDQUFFVCxTQUEyQixFQUMzQk8sY0FBd0MsRUFDeENKLGdCQUF5QixFQUN6QlEsWUFBb0IsRUFBa0I7RUFFakUsTUFBTUMsWUFBMkIsR0FBRyxFQUFFOztFQUV0QztFQUNBLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHYixTQUFTLENBQUNjLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7SUFDM0MsTUFBTUUsUUFBUSxHQUFHZixTQUFTLENBQUVhLENBQUMsQ0FBRTtJQUMvQkQsWUFBWSxDQUFDSSxJQUFJLENBQUUsSUFBSW5CLGlCQUFpQixDQUFFa0IsUUFBUSxFQUFFO01BQ2xEUixjQUFjLEVBQUVBLGNBQWM7TUFDOUJDLE1BQU0sRUFBRUcsWUFBWSxDQUFDTSxZQUFZLENBQUcsR0FBRUYsUUFBUSxDQUFDRyxNQUFPLGFBQWE7SUFDckUsQ0FBRSxDQUFFLENBQUM7RUFDUDs7RUFFQTtFQUNBLElBQUtmLGdCQUFnQixFQUFHO0lBQ3RCUyxZQUFZLENBQUNJLElBQUksQ0FBRSxJQUFJdEIsbUJBQW1CLENBQUU7TUFDMUNhLGNBQWMsRUFBRUEsY0FBYztNQUM5QkMsTUFBTSxFQUFFRyxZQUFZLENBQUNNLFlBQVksQ0FBRSxxQkFBc0I7SUFDM0QsQ0FBRSxDQUFFLENBQUM7RUFDUDtFQUVBLE9BQU9MLFlBQVk7QUFDckI7QUFFQWhCLGdCQUFnQixDQUFDdUIsUUFBUSxDQUFFLGFBQWEsRUFBRXJCLFdBQVksQ0FBQyJ9