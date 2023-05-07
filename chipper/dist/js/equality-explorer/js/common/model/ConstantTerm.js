// Copyright 2018-2022, University of Colorado Boulder

/**
 * Term whose value is a constant.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import Term from './Term.js';
import UniversalOperator from './UniversalOperator.js';
export default class ConstantTerm extends Term {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      constantValue: EqualityExplorerConstants.DEFAULT_CONSTANT_VALUE
    }, providedOptions);
    assert && assert(options.constantValue.isReduced(), `constantValue must be reduced: ${options.constantValue}`);
    super(options.constantValue, options);
    this.constantValue = options.constantValue;
  }

  /**
   * Constant terms do not have an associated variable.
   */
  getVariable() {
    return null;
  }

  /**
   * For debugging only. Do not rely on the format of toString.
   */
  toString() {
    return `ConstantTerm: ${this.constantValue}`;
  }

  /**
   * Creates the options that would be needed to instantiate a copy of this object.
   */
  copyOptions() {
    return combineOptions({}, super.copyOptions(), {
      constantValue: this.constantValue.copy()
    });
  }

  /**
   * Creates a copy of this term, with modifications through options.
   */
  copy(providedOptions) {
    return new ConstantTerm(combineOptions({}, this.copyOptions(), providedOptions)); //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
  }

  /**
   * The weight of a constant term is the same as its value.
   */
  get weight() {
    return this.constantValue;
  }

  /**
   * Are this term and the specified term 'like terms'? All constant terms are like terms.
   */
  isLikeTerm(term) {
    return term instanceof ConstantTerm;
  }

  /**
   * Applies an operation to this term, resulting in a new term.
   * Returns null if the operation is not applicable to this term.
   */
  applyOperation(operation) {
    let term = null;

    // constant operands only
    if (operation.operand instanceof ConstantTerm) {
      if (operation.operator === UniversalOperator.PLUS) {
        term = this.plus(operation.operand);
      } else if (operation.operator === UniversalOperator.MINUS) {
        term = this.minus(operation.operand);
      } else if (operation.operator === UniversalOperator.TIMES) {
        term = this.times(operation.operand);
      } else if (operation.operator === UniversalOperator.DIVIDE) {
        term = this.divided(operation.operand);
      }
    }
    return term;
  }

  /**
   * Adds a term to this term to create a new term.
   */
  plus(term) {
    return this.copy({
      constantValue: this.constantValue.plus(term.constantValue).reduce()
    });
  }

  /**
   * Subtracts a term from this term to create a new term.
   */
  minus(term) {
    return this.copy({
      constantValue: this.constantValue.minus(term.constantValue).reduce()
    });
  }

  /**
   * Multiplies this term by another term to create a new term.
   */
  times(term) {
    return this.copy({
      constantValue: this.constantValue.times(term.constantValue).reduce()
    });
  }

  /**
   * Divides this term by another term to create a new term.
   */
  divided(term) {
    assert && assert(term.constantValue.getValue() !== 0, 'attempt to divide by zero');
    return this.copy({
      constantValue: this.constantValue.divided(term.constantValue).reduce()
    });
  }
}
equalityExplorer.register('ConstantTerm', ConstantTerm);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsImVxdWFsaXR5RXhwbG9yZXIiLCJFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzIiwiVGVybSIsIlVuaXZlcnNhbE9wZXJhdG9yIiwiQ29uc3RhbnRUZXJtIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiY29uc3RhbnRWYWx1ZSIsIkRFRkFVTFRfQ09OU1RBTlRfVkFMVUUiLCJhc3NlcnQiLCJpc1JlZHVjZWQiLCJnZXRWYXJpYWJsZSIsInRvU3RyaW5nIiwiY29weU9wdGlvbnMiLCJjb3B5Iiwid2VpZ2h0IiwiaXNMaWtlVGVybSIsInRlcm0iLCJhcHBseU9wZXJhdGlvbiIsIm9wZXJhdGlvbiIsIm9wZXJhbmQiLCJvcGVyYXRvciIsIlBMVVMiLCJwbHVzIiwiTUlOVVMiLCJtaW51cyIsIlRJTUVTIiwidGltZXMiLCJESVZJREUiLCJkaXZpZGVkIiwicmVkdWNlIiwiZ2V0VmFsdWUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbnN0YW50VGVybS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUZXJtIHdob3NlIHZhbHVlIGlzIGEgY29uc3RhbnQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFRlcm0sIHsgVGVybU9wdGlvbnMgfSBmcm9tICcuL1Rlcm0uanMnO1xyXG5pbXBvcnQgVW5pdmVyc2FsT3BlcmF0aW9uIGZyb20gJy4vVW5pdmVyc2FsT3BlcmF0aW9uLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlIGZyb20gJy4vVmFyaWFibGUuanMnO1xyXG5pbXBvcnQgVW5pdmVyc2FsT3BlcmF0b3IgZnJvbSAnLi9Vbml2ZXJzYWxPcGVyYXRvci5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGNvbnN0YW50VmFsdWU/OiBGcmFjdGlvbjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIENvbnN0YW50VGVybU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFRlcm1PcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uc3RhbnRUZXJtIGV4dGVuZHMgVGVybSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBjb25zdGFudFZhbHVlOiBGcmFjdGlvbjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBDb25zdGFudFRlcm1PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q29uc3RhbnRUZXJtT3B0aW9ucywgU2VsZk9wdGlvbnMsIFRlcm1PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBjb25zdGFudFZhbHVlOiBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLkRFRkFVTFRfQ09OU1RBTlRfVkFMVUVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuY29uc3RhbnRWYWx1ZS5pc1JlZHVjZWQoKSwgYGNvbnN0YW50VmFsdWUgbXVzdCBiZSByZWR1Y2VkOiAke29wdGlvbnMuY29uc3RhbnRWYWx1ZX1gICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMuY29uc3RhbnRWYWx1ZSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuY29uc3RhbnRWYWx1ZSA9IG9wdGlvbnMuY29uc3RhbnRWYWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0YW50IHRlcm1zIGRvIG5vdCBoYXZlIGFuIGFzc29jaWF0ZWQgdmFyaWFibGUuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGdldFZhcmlhYmxlKCk6IFZhcmlhYmxlIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciBkZWJ1Z2dpbmcgb25seS4gRG8gbm90IHJlbHkgb24gdGhlIGZvcm1hdCBvZiB0b1N0cmluZy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgQ29uc3RhbnRUZXJtOiAke3RoaXMuY29uc3RhbnRWYWx1ZX1gO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgb3B0aW9ucyB0aGF0IHdvdWxkIGJlIG5lZWRlZCB0byBpbnN0YW50aWF0ZSBhIGNvcHkgb2YgdGhpcyBvYmplY3QuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvcHlPcHRpb25zKCk6IENvbnN0YW50VGVybU9wdGlvbnMge1xyXG4gICAgcmV0dXJuIGNvbWJpbmVPcHRpb25zPENvbnN0YW50VGVybU9wdGlvbnM+KCB7fSwgc3VwZXIuY29weU9wdGlvbnMoKSwge1xyXG4gICAgICBjb25zdGFudFZhbHVlOiB0aGlzLmNvbnN0YW50VmFsdWUuY29weSgpXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgY29weSBvZiB0aGlzIHRlcm0sIHdpdGggbW9kaWZpY2F0aW9ucyB0aHJvdWdoIG9wdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNvcHkoIHByb3ZpZGVkT3B0aW9ucz86IENvbnN0YW50VGVybU9wdGlvbnMgKTogQ29uc3RhbnRUZXJtIHtcclxuICAgIHJldHVybiBuZXcgQ29uc3RhbnRUZXJtKCBjb21iaW5lT3B0aW9uczxDb25zdGFudFRlcm1PcHRpb25zPigge30sIHRoaXMuY29weU9wdGlvbnMoKSwgcHJvdmlkZWRPcHRpb25zICkgKTsgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMjAwIGR5bmFtaWNcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFRoZSB3ZWlnaHQgb2YgYSBjb25zdGFudCB0ZXJtIGlzIHRoZSBzYW1lIGFzIGl0cyB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0IHdlaWdodCgpOiBGcmFjdGlvbiB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25zdGFudFZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXJlIHRoaXMgdGVybSBhbmQgdGhlIHNwZWNpZmllZCB0ZXJtICdsaWtlIHRlcm1zJz8gQWxsIGNvbnN0YW50IHRlcm1zIGFyZSBsaWtlIHRlcm1zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBpc0xpa2VUZXJtKCB0ZXJtOiBUZXJtICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuICggdGVybSBpbnN0YW5jZW9mIENvbnN0YW50VGVybSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbGllcyBhbiBvcGVyYXRpb24gdG8gdGhpcyB0ZXJtLCByZXN1bHRpbmcgaW4gYSBuZXcgdGVybS5cclxuICAgKiBSZXR1cm5zIG51bGwgaWYgdGhlIG9wZXJhdGlvbiBpcyBub3QgYXBwbGljYWJsZSB0byB0aGlzIHRlcm0uXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGFwcGx5T3BlcmF0aW9uKCBvcGVyYXRpb246IFVuaXZlcnNhbE9wZXJhdGlvbiApOiBDb25zdGFudFRlcm0gfCBudWxsIHtcclxuXHJcbiAgICBsZXQgdGVybSA9IG51bGw7XHJcblxyXG4gICAgLy8gY29uc3RhbnQgb3BlcmFuZHMgb25seVxyXG4gICAgaWYgKCBvcGVyYXRpb24ub3BlcmFuZCBpbnN0YW5jZW9mIENvbnN0YW50VGVybSApIHtcclxuXHJcbiAgICAgIGlmICggb3BlcmF0aW9uLm9wZXJhdG9yID09PSBVbml2ZXJzYWxPcGVyYXRvci5QTFVTICkge1xyXG4gICAgICAgIHRlcm0gPSB0aGlzLnBsdXMoIG9wZXJhdGlvbi5vcGVyYW5kICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIG9wZXJhdGlvbi5vcGVyYXRvciA9PT0gVW5pdmVyc2FsT3BlcmF0b3IuTUlOVVMgKSB7XHJcbiAgICAgICAgdGVybSA9IHRoaXMubWludXMoIG9wZXJhdGlvbi5vcGVyYW5kICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIG9wZXJhdGlvbi5vcGVyYXRvciA9PT0gVW5pdmVyc2FsT3BlcmF0b3IuVElNRVMgKSB7XHJcbiAgICAgICAgdGVybSA9IHRoaXMudGltZXMoIG9wZXJhdGlvbi5vcGVyYW5kICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIG9wZXJhdGlvbi5vcGVyYXRvciA9PT0gVW5pdmVyc2FsT3BlcmF0b3IuRElWSURFICkge1xyXG4gICAgICAgIHRlcm0gPSB0aGlzLmRpdmlkZWQoIG9wZXJhdGlvbi5vcGVyYW5kICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGVybTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSB0ZXJtIHRvIHRoaXMgdGVybSB0byBjcmVhdGUgYSBuZXcgdGVybS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgcGx1cyggdGVybTogQ29uc3RhbnRUZXJtICk6IENvbnN0YW50VGVybSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb3B5KCB7XHJcbiAgICAgIGNvbnN0YW50VmFsdWU6IHRoaXMuY29uc3RhbnRWYWx1ZS5wbHVzKCB0ZXJtLmNvbnN0YW50VmFsdWUgKS5yZWR1Y2UoKVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3VidHJhY3RzIGEgdGVybSBmcm9tIHRoaXMgdGVybSB0byBjcmVhdGUgYSBuZXcgdGVybS5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgbWludXMoIHRlcm06IENvbnN0YW50VGVybSApOiBDb25zdGFudFRlcm0ge1xyXG4gICAgcmV0dXJuIHRoaXMuY29weSgge1xyXG4gICAgICBjb25zdGFudFZhbHVlOiB0aGlzLmNvbnN0YW50VmFsdWUubWludXMoIHRlcm0uY29uc3RhbnRWYWx1ZSApLnJlZHVjZSgpXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNdWx0aXBsaWVzIHRoaXMgdGVybSBieSBhbm90aGVyIHRlcm0gdG8gY3JlYXRlIGEgbmV3IHRlcm0uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSB0aW1lcyggdGVybTogQ29uc3RhbnRUZXJtICk6IENvbnN0YW50VGVybSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb3B5KCB7XHJcbiAgICAgIGNvbnN0YW50VmFsdWU6IHRoaXMuY29uc3RhbnRWYWx1ZS50aW1lcyggdGVybS5jb25zdGFudFZhbHVlICkucmVkdWNlKClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpdmlkZXMgdGhpcyB0ZXJtIGJ5IGFub3RoZXIgdGVybSB0byBjcmVhdGUgYSBuZXcgdGVybS5cclxuICAgKi9cclxuICBwcml2YXRlIGRpdmlkZWQoIHRlcm06IENvbnN0YW50VGVybSApOiBDb25zdGFudFRlcm0ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGVybS5jb25zdGFudFZhbHVlLmdldFZhbHVlKCkgIT09IDAsICdhdHRlbXB0IHRvIGRpdmlkZSBieSB6ZXJvJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuY29weSgge1xyXG4gICAgICBjb25zdGFudFZhbHVlOiB0aGlzLmNvbnN0YW50VmFsdWUuZGl2aWRlZCggdGVybS5jb25zdGFudFZhbHVlICkucmVkdWNlKClcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXIucmVnaXN0ZXIoICdDb25zdGFudFRlcm0nLCBDb25zdGFudFRlcm0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxJQUFJQyxjQUFjLFFBQVEsdUNBQXVDO0FBRWpGLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0MsSUFBSSxNQUF1QixXQUFXO0FBRzdDLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQVF0RCxlQUFlLE1BQU1DLFlBQVksU0FBU0YsSUFBSSxDQUFDO0VBSXRDRyxXQUFXQSxDQUFFQyxlQUFxQyxFQUFHO0lBRTFELE1BQU1DLE9BQU8sR0FBR1QsU0FBUyxDQUFnRCxDQUFDLENBQUU7TUFFMUU7TUFDQVUsYUFBYSxFQUFFUCx5QkFBeUIsQ0FBQ1E7SUFDM0MsQ0FBQyxFQUFFSCxlQUFnQixDQUFDO0lBRXBCSSxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsT0FBTyxDQUFDQyxhQUFhLENBQUNHLFNBQVMsQ0FBQyxDQUFDLEVBQUcsa0NBQWlDSixPQUFPLENBQUNDLGFBQWMsRUFBRSxDQUFDO0lBRWhILEtBQUssQ0FBRUQsT0FBTyxDQUFDQyxhQUFhLEVBQUVELE9BQVEsQ0FBQztJQUV2QyxJQUFJLENBQUNDLGFBQWEsR0FBR0QsT0FBTyxDQUFDQyxhQUFhO0VBQzVDOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkksV0FBV0EsQ0FBQSxFQUFvQjtJQUM3QyxPQUFPLElBQUk7RUFDYjs7RUFFQTtBQUNGO0FBQ0E7RUFDa0JDLFFBQVFBLENBQUEsRUFBVztJQUNqQyxPQUFRLGlCQUFnQixJQUFJLENBQUNMLGFBQWMsRUFBQztFQUM5Qzs7RUFFQTtBQUNGO0FBQ0E7RUFDa0JNLFdBQVdBLENBQUEsRUFBd0I7SUFDakQsT0FBT2YsY0FBYyxDQUF1QixDQUFDLENBQUMsRUFBRSxLQUFLLENBQUNlLFdBQVcsQ0FBQyxDQUFDLEVBQUU7TUFDbkVOLGFBQWEsRUFBRSxJQUFJLENBQUNBLGFBQWEsQ0FBQ08sSUFBSSxDQUFDO0lBQ3pDLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtFQUNrQkEsSUFBSUEsQ0FBRVQsZUFBcUMsRUFBaUI7SUFDMUUsT0FBTyxJQUFJRixZQUFZLENBQUVMLGNBQWMsQ0FBdUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDZSxXQUFXLENBQUMsQ0FBQyxFQUFFUixlQUFnQixDQUFFLENBQUMsQ0FBQyxDQUFDO0VBQzdHOztFQUVBO0FBQ0Y7QUFDQTtFQUNFLElBQW9CVSxNQUFNQSxDQUFBLEVBQWE7SUFDckMsT0FBTyxJQUFJLENBQUNSLGFBQWE7RUFDM0I7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCUyxVQUFVQSxDQUFFQyxJQUFVLEVBQVk7SUFDaEQsT0FBU0EsSUFBSSxZQUFZZCxZQUFZO0VBQ3ZDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ2tCZSxjQUFjQSxDQUFFQyxTQUE2QixFQUF3QjtJQUVuRixJQUFJRixJQUFJLEdBQUcsSUFBSTs7SUFFZjtJQUNBLElBQUtFLFNBQVMsQ0FBQ0MsT0FBTyxZQUFZakIsWUFBWSxFQUFHO01BRS9DLElBQUtnQixTQUFTLENBQUNFLFFBQVEsS0FBS25CLGlCQUFpQixDQUFDb0IsSUFBSSxFQUFHO1FBQ25ETCxJQUFJLEdBQUcsSUFBSSxDQUFDTSxJQUFJLENBQUVKLFNBQVMsQ0FBQ0MsT0FBUSxDQUFDO01BQ3ZDLENBQUMsTUFDSSxJQUFLRCxTQUFTLENBQUNFLFFBQVEsS0FBS25CLGlCQUFpQixDQUFDc0IsS0FBSyxFQUFHO1FBQ3pEUCxJQUFJLEdBQUcsSUFBSSxDQUFDUSxLQUFLLENBQUVOLFNBQVMsQ0FBQ0MsT0FBUSxDQUFDO01BQ3hDLENBQUMsTUFDSSxJQUFLRCxTQUFTLENBQUNFLFFBQVEsS0FBS25CLGlCQUFpQixDQUFDd0IsS0FBSyxFQUFHO1FBQ3pEVCxJQUFJLEdBQUcsSUFBSSxDQUFDVSxLQUFLLENBQUVSLFNBQVMsQ0FBQ0MsT0FBUSxDQUFDO01BQ3hDLENBQUMsTUFDSSxJQUFLRCxTQUFTLENBQUNFLFFBQVEsS0FBS25CLGlCQUFpQixDQUFDMEIsTUFBTSxFQUFHO1FBQzFEWCxJQUFJLEdBQUcsSUFBSSxDQUFDWSxPQUFPLENBQUVWLFNBQVMsQ0FBQ0MsT0FBUSxDQUFDO01BQzFDO0lBQ0Y7SUFFQSxPQUFPSCxJQUFJO0VBQ2I7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCTSxJQUFJQSxDQUFFTixJQUFrQixFQUFpQjtJQUN2RCxPQUFPLElBQUksQ0FBQ0gsSUFBSSxDQUFFO01BQ2hCUCxhQUFhLEVBQUUsSUFBSSxDQUFDQSxhQUFhLENBQUNnQixJQUFJLENBQUVOLElBQUksQ0FBQ1YsYUFBYyxDQUFDLENBQUN1QixNQUFNLENBQUM7SUFDdEUsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCTCxLQUFLQSxDQUFFUixJQUFrQixFQUFpQjtJQUN4RCxPQUFPLElBQUksQ0FBQ0gsSUFBSSxDQUFFO01BQ2hCUCxhQUFhLEVBQUUsSUFBSSxDQUFDQSxhQUFhLENBQUNrQixLQUFLLENBQUVSLElBQUksQ0FBQ1YsYUFBYyxDQUFDLENBQUN1QixNQUFNLENBQUM7SUFDdkUsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0VBQ1VILEtBQUtBLENBQUVWLElBQWtCLEVBQWlCO0lBQ2hELE9BQU8sSUFBSSxDQUFDSCxJQUFJLENBQUU7TUFDaEJQLGFBQWEsRUFBRSxJQUFJLENBQUNBLGFBQWEsQ0FBQ29CLEtBQUssQ0FBRVYsSUFBSSxDQUFDVixhQUFjLENBQUMsQ0FBQ3VCLE1BQU0sQ0FBQztJQUN2RSxDQUFFLENBQUM7RUFDTDs7RUFFQTtBQUNGO0FBQ0E7RUFDVUQsT0FBT0EsQ0FBRVosSUFBa0IsRUFBaUI7SUFDbERSLE1BQU0sSUFBSUEsTUFBTSxDQUFFUSxJQUFJLENBQUNWLGFBQWEsQ0FBQ3dCLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLDJCQUE0QixDQUFDO0lBQ3BGLE9BQU8sSUFBSSxDQUFDakIsSUFBSSxDQUFFO01BQ2hCUCxhQUFhLEVBQUUsSUFBSSxDQUFDQSxhQUFhLENBQUNzQixPQUFPLENBQUVaLElBQUksQ0FBQ1YsYUFBYyxDQUFDLENBQUN1QixNQUFNLENBQUM7SUFDekUsQ0FBRSxDQUFDO0VBQ0w7QUFDRjtBQUVBL0IsZ0JBQWdCLENBQUNpQyxRQUFRLENBQUUsY0FBYyxFQUFFN0IsWUFBYSxDQUFDIn0=