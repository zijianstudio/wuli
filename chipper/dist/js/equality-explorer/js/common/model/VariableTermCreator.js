// Copyright 2017-2023, University of Colorado Boulder

/**
 * VariableTermCreator creates and manages variable terms (e.g. 'x').
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerColors from '../EqualityExplorerColors.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import VariableTermNode from '../view/VariableTermNode.js'; // eslint-disable-line no-view-imported-from-model
import TermCreator from './TermCreator.js';
import VariableTerm from './VariableTerm.js';

// options to createTermProtected and createZeroTerm

export default class VariableTermCreator extends TermCreator {
  constructor(variable, providedOptions) {
    const options = optionize()({
      // SelfOptions
      positiveFill: EqualityExplorerColors.POSITIVE_X_FILL,
      // fill for the background of positive terms
      negativeFill: EqualityExplorerColors.NEGATIVE_X_FILL,
      // fill for the background of negative terms

      // TermCreatorOptions
      variable: variable
    }, providedOptions);
    super(options);
    this.positiveFill = options.positiveFill;
    this.negativeFill = options.negativeFill;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  toString() {
    const variable = this.variable;
    assert && assert(variable);
    return `VariableTermCreator variable={${variable}}`;
  }

  /**
   * Returns the sum of coefficients for all terms on the plate.
   */
  sumCoefficientsOnPlate() {
    let sum = Fraction.fromInteger(0);
    for (let i = 0; i < this.termsOnPlate.length; i++) {
      const term = this.termsOnPlate.get(i);
      assert && assert(term instanceof VariableTerm); // eslint-disable-line no-simple-type-checking-assertions
      sum = sum.plus(term.coefficient).reduced();
    }
    return sum;
  }

  /**
   * Overridden so that we can expand the type definition of providedOptions, so that it includes properties
   * that are specific to this class. Note that super.createTerm calls createTermProtected.
   */
  createTerm(providedOptions) {
    return super.createTerm(providedOptions);
  }

  //-------------------------------------------------------------------------------------------------
  // Below here is the implementation of the TermCreator API
  //-------------------------------------------------------------------------------------------------

  /**
   * Creates the icon used to represent this term in the TermsToolboxNode and equations.
   */
  createIcon(sign = 1) {
    const coefficient = EqualityExplorerConstants.DEFAULT_COEFFICIENT.timesInteger(sign);
    const variable = this.variable;
    assert && assert(variable);
    return VariableTermNode.createInteractiveTermNode(coefficient, variable.symbolProperty, {
      positiveFill: this.positiveFill,
      negativeFill: this.negativeFill
    });
  }

  /**
   * Instantiates a VariableTerm.
   */
  createTermProtected(providedOptions) {
    const options = combineOptions({
      sign: 1,
      coefficient: EqualityExplorerConstants.DEFAULT_COEFFICIENT
    }, providedOptions);

    // Adjust the sign
    assert && assert(options.sign !== undefined);
    assert && assert(options.coefficient !== undefined);
    options.coefficient = options.coefficient.timesInteger(options.sign);
    const variable = this.variable;
    assert && assert(variable);
    return new VariableTerm(variable, options); //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
  }

  /**
   * Creates a term whose significant value is zero. This is used when applying an operation to an empty plate.
   * The term is not managed by the TermCreator, so we call createTermProtected instead of createTerm.
   */
  createZeroTerm(providedOptions) {
    const options = providedOptions || {};
    assert && assert(!options.coefficient, 'VariableTermCreator sets coefficient');
    options.coefficient = Fraction.fromInteger(0);
    return this.createTermProtected(options);
  }

  /**
   * Instantiates the Node that corresponds to this term.
   */
  createTermNode(term) {
    return new VariableTermNode(this, term, {
      //TODO https://github.com/phetsims/equality-explorer/issues/200 dynamic
      interactiveTermNodeOptions: {
        positiveFill: this.positiveFill,
        negativeFill: this.negativeFill
      }
    });
  }
}
equalityExplorer.register('VariableTermCreator', VariableTermCreator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkZyYWN0aW9uIiwiZXF1YWxpdHlFeHBsb3JlciIsIkVxdWFsaXR5RXhwbG9yZXJDb2xvcnMiLCJFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzIiwiVmFyaWFibGVUZXJtTm9kZSIsIlRlcm1DcmVhdG9yIiwiVmFyaWFibGVUZXJtIiwiVmFyaWFibGVUZXJtQ3JlYXRvciIsImNvbnN0cnVjdG9yIiwidmFyaWFibGUiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicG9zaXRpdmVGaWxsIiwiUE9TSVRJVkVfWF9GSUxMIiwibmVnYXRpdmVGaWxsIiwiTkVHQVRJVkVfWF9GSUxMIiwiZGlzcG9zZSIsImFzc2VydCIsInRvU3RyaW5nIiwic3VtQ29lZmZpY2llbnRzT25QbGF0ZSIsInN1bSIsImZyb21JbnRlZ2VyIiwiaSIsInRlcm1zT25QbGF0ZSIsImxlbmd0aCIsInRlcm0iLCJnZXQiLCJwbHVzIiwiY29lZmZpY2llbnQiLCJyZWR1Y2VkIiwiY3JlYXRlVGVybSIsImNyZWF0ZUljb24iLCJzaWduIiwiREVGQVVMVF9DT0VGRklDSUVOVCIsInRpbWVzSW50ZWdlciIsImNyZWF0ZUludGVyYWN0aXZlVGVybU5vZGUiLCJzeW1ib2xQcm9wZXJ0eSIsImNyZWF0ZVRlcm1Qcm90ZWN0ZWQiLCJ1bmRlZmluZWQiLCJjcmVhdGVaZXJvVGVybSIsImNyZWF0ZVRlcm1Ob2RlIiwiaW50ZXJhY3RpdmVUZXJtTm9kZU9wdGlvbnMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZhcmlhYmxlVGVybUNyZWF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmFyaWFibGVUZXJtQ3JlYXRvciBjcmVhdGVzIGFuZCBtYW5hZ2VzIHZhcmlhYmxlIHRlcm1zIChlLmcuICd4JykuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBGcmFjdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL0ZyYWN0aW9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzIGZyb20gJy4uL0VxdWFsaXR5RXhwbG9yZXJDb2xvcnMuanMnO1xyXG5pbXBvcnQgRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyBmcm9tICcuLi9FcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFZhcmlhYmxlVGVybU5vZGUgZnJvbSAnLi4vdmlldy9WYXJpYWJsZVRlcm1Ob2RlLmpzJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby12aWV3LWltcG9ydGVkLWZyb20tbW9kZWxcclxuaW1wb3J0IFRlcm1DcmVhdG9yLCB7IENyZWF0ZVRlcm1PcHRpb25zLCBUZXJtQ3JlYXRvck9wdGlvbnMsIFRlcm1DcmVhdG9yU2lnbiB9IGZyb20gJy4vVGVybUNyZWF0b3IuanMnO1xyXG5pbXBvcnQgVmFyaWFibGUgZnJvbSAnLi9WYXJpYWJsZS5qcyc7XHJcbmltcG9ydCBWYXJpYWJsZVRlcm0sIHsgVmFyaWFibGVUZXJtT3B0aW9ucyB9IGZyb20gJy4vVmFyaWFibGVUZXJtLmpzJztcclxuaW1wb3J0IFRlcm0gZnJvbSAnLi9UZXJtLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgcG9zaXRpdmVGaWxsPzogVENvbG9yOyAvLyBmaWxsIGZvciB0aGUgYmFja2dyb3VuZCBvZiBwb3NpdGl2ZSB0ZXJtc1xyXG4gIG5lZ2F0aXZlRmlsbD86IFRDb2xvcjsgIC8vIGZpbGwgZm9yIHRoZSBiYWNrZ3JvdW5kIG9mIG5lZ2F0aXZlIHRlcm1zXHJcbn07XHJcblxyXG50eXBlIFZhcmlhYmxlVGVybUNyZWF0b3JPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PFRlcm1DcmVhdG9yT3B0aW9ucywgJ3ZhcmlhYmxlJz47XHJcblxyXG4vLyBvcHRpb25zIHRvIGNyZWF0ZVRlcm1Qcm90ZWN0ZWQgYW5kIGNyZWF0ZVplcm9UZXJtXHJcbnR5cGUgQ3JlYXRlVmFyaWFibGVUZXJtT3B0aW9ucyA9IENyZWF0ZVRlcm1PcHRpb25zICYgVmFyaWFibGVUZXJtT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZhcmlhYmxlVGVybUNyZWF0b3IgZXh0ZW5kcyBUZXJtQ3JlYXRvciB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcG9zaXRpdmVGaWxsOiBUQ29sb3I7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBuZWdhdGl2ZUZpbGw6IFRDb2xvcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YXJpYWJsZTogVmFyaWFibGUsIHByb3ZpZGVkT3B0aW9uczogVmFyaWFibGVUZXJtQ3JlYXRvck9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxWYXJpYWJsZVRlcm1DcmVhdG9yT3B0aW9ucywgU2VsZk9wdGlvbnMsIFRlcm1DcmVhdG9yT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gU2VsZk9wdGlvbnNcclxuICAgICAgcG9zaXRpdmVGaWxsOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLlBPU0lUSVZFX1hfRklMTCwgLy8gZmlsbCBmb3IgdGhlIGJhY2tncm91bmQgb2YgcG9zaXRpdmUgdGVybXNcclxuICAgICAgbmVnYXRpdmVGaWxsOiBFcXVhbGl0eUV4cGxvcmVyQ29sb3JzLk5FR0FUSVZFX1hfRklMTCwgIC8vIGZpbGwgZm9yIHRoZSBiYWNrZ3JvdW5kIG9mIG5lZ2F0aXZlIHRlcm1zXHJcblxyXG4gICAgICAvLyBUZXJtQ3JlYXRvck9wdGlvbnNcclxuICAgICAgdmFyaWFibGU6IHZhcmlhYmxlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMucG9zaXRpdmVGaWxsID0gb3B0aW9ucy5wb3NpdGl2ZUZpbGw7XHJcbiAgICB0aGlzLm5lZ2F0aXZlRmlsbCA9IG9wdGlvbnMubmVnYXRpdmVGaWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgdmFyaWFibGUgPSB0aGlzLnZhcmlhYmxlITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhcmlhYmxlICk7XHJcbiAgICByZXR1cm4gYFZhcmlhYmxlVGVybUNyZWF0b3IgdmFyaWFibGU9eyR7dmFyaWFibGV9fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBzdW0gb2YgY29lZmZpY2llbnRzIGZvciBhbGwgdGVybXMgb24gdGhlIHBsYXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdW1Db2VmZmljaWVudHNPblBsYXRlKCk6IEZyYWN0aW9uIHtcclxuICAgIGxldCBzdW0gPSBGcmFjdGlvbi5mcm9tSW50ZWdlciggMCApO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50ZXJtc09uUGxhdGUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRlcm0gPSB0aGlzLnRlcm1zT25QbGF0ZS5nZXQoIGkgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGVybSBpbnN0YW5jZW9mIFZhcmlhYmxlVGVybSApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNpbXBsZS10eXBlLWNoZWNraW5nLWFzc2VydGlvbnNcclxuICAgICAgc3VtID0gc3VtLnBsdXMoICggdGVybSBhcyBWYXJpYWJsZVRlcm0gKS5jb2VmZmljaWVudCApLnJlZHVjZWQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdW07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdmVycmlkZGVuIHNvIHRoYXQgd2UgY2FuIGV4cGFuZCB0aGUgdHlwZSBkZWZpbml0aW9uIG9mIHByb3ZpZGVkT3B0aW9ucywgc28gdGhhdCBpdCBpbmNsdWRlcyBwcm9wZXJ0aWVzXHJcbiAgICogdGhhdCBhcmUgc3BlY2lmaWMgdG8gdGhpcyBjbGFzcy4gTm90ZSB0aGF0IHN1cGVyLmNyZWF0ZVRlcm0gY2FsbHMgY3JlYXRlVGVybVByb3RlY3RlZC5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlVGVybSggcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlVmFyaWFibGVUZXJtT3B0aW9ucyApOiBUZXJtIHtcclxuICAgIHJldHVybiBzdXBlci5jcmVhdGVUZXJtKCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIEJlbG93IGhlcmUgaXMgdGhlIGltcGxlbWVudGF0aW9uIG9mIHRoZSBUZXJtQ3JlYXRvciBBUElcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiB1c2VkIHRvIHJlcHJlc2VudCB0aGlzIHRlcm0gaW4gdGhlIFRlcm1zVG9vbGJveE5vZGUgYW5kIGVxdWF0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgY3JlYXRlSWNvbiggc2lnbjogVGVybUNyZWF0b3JTaWduID0gMSApOiBOb2RlIHtcclxuXHJcbiAgICBjb25zdCBjb2VmZmljaWVudCA9IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuREVGQVVMVF9DT0VGRklDSUVOVC50aW1lc0ludGVnZXIoIHNpZ24gKTtcclxuICAgIGNvbnN0IHZhcmlhYmxlID0gdGhpcy52YXJpYWJsZSE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB2YXJpYWJsZSApO1xyXG5cclxuICAgIHJldHVybiBWYXJpYWJsZVRlcm1Ob2RlLmNyZWF0ZUludGVyYWN0aXZlVGVybU5vZGUoIGNvZWZmaWNpZW50LCB2YXJpYWJsZS5zeW1ib2xQcm9wZXJ0eSwge1xyXG4gICAgICBwb3NpdGl2ZUZpbGw6IHRoaXMucG9zaXRpdmVGaWxsLFxyXG4gICAgICBuZWdhdGl2ZUZpbGw6IHRoaXMubmVnYXRpdmVGaWxsXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnN0YW50aWF0ZXMgYSBWYXJpYWJsZVRlcm0uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNyZWF0ZVRlcm1Qcm90ZWN0ZWQoIHByb3ZpZGVkT3B0aW9ucz86IENyZWF0ZVZhcmlhYmxlVGVybU9wdGlvbnMgKTogVmFyaWFibGVUZXJtIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gY29tYmluZU9wdGlvbnM8Q3JlYXRlVmFyaWFibGVUZXJtT3B0aW9ucz4oIHtcclxuICAgICAgc2lnbjogMSxcclxuICAgICAgY29lZmZpY2llbnQ6IEVxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuREVGQVVMVF9DT0VGRklDSUVOVFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gQWRqdXN0IHRoZSBzaWduXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnNpZ24gIT09IHVuZGVmaW5lZCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5jb2VmZmljaWVudCAhPT0gdW5kZWZpbmVkICk7XHJcbiAgICBvcHRpb25zLmNvZWZmaWNpZW50ID0gb3B0aW9ucy5jb2VmZmljaWVudCEudGltZXNJbnRlZ2VyKCBvcHRpb25zLnNpZ24hICk7XHJcblxyXG4gICAgY29uc3QgdmFyaWFibGUgPSB0aGlzLnZhcmlhYmxlITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhcmlhYmxlICk7XHJcblxyXG4gICAgcmV0dXJuIG5ldyBWYXJpYWJsZVRlcm0oIHZhcmlhYmxlLCBvcHRpb25zICk7IC8vVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzIwMCBkeW5hbWljXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgdGVybSB3aG9zZSBzaWduaWZpY2FudCB2YWx1ZSBpcyB6ZXJvLiBUaGlzIGlzIHVzZWQgd2hlbiBhcHBseWluZyBhbiBvcGVyYXRpb24gdG8gYW4gZW1wdHkgcGxhdGUuXHJcbiAgICogVGhlIHRlcm0gaXMgbm90IG1hbmFnZWQgYnkgdGhlIFRlcm1DcmVhdG9yLCBzbyB3ZSBjYWxsIGNyZWF0ZVRlcm1Qcm90ZWN0ZWQgaW5zdGVhZCBvZiBjcmVhdGVUZXJtLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBjcmVhdGVaZXJvVGVybSggcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlVmFyaWFibGVUZXJtT3B0aW9ucyApOiBWYXJpYWJsZVRlcm0ge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IHByb3ZpZGVkT3B0aW9ucyB8fCB7fTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNvZWZmaWNpZW50LCAnVmFyaWFibGVUZXJtQ3JlYXRvciBzZXRzIGNvZWZmaWNpZW50JyApO1xyXG4gICAgb3B0aW9ucy5jb2VmZmljaWVudCA9IEZyYWN0aW9uLmZyb21JbnRlZ2VyKCAwICk7XHJcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVUZXJtUHJvdGVjdGVkKCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnN0YW50aWF0ZXMgdGhlIE5vZGUgdGhhdCBjb3JyZXNwb25kcyB0byB0aGlzIHRlcm0uXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVRlcm1Ob2RlKCB0ZXJtOiBWYXJpYWJsZVRlcm0gKTogVmFyaWFibGVUZXJtTm9kZSB7XHJcbiAgICByZXR1cm4gbmV3IFZhcmlhYmxlVGVybU5vZGUoIHRoaXMsIHRlcm0sIHsgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvMjAwIGR5bmFtaWNcclxuICAgICAgaW50ZXJhY3RpdmVUZXJtTm9kZU9wdGlvbnM6IHtcclxuICAgICAgICBwb3NpdGl2ZUZpbGw6IHRoaXMucG9zaXRpdmVGaWxsLFxyXG4gICAgICAgIG5lZ2F0aXZlRmlsbDogdGhpcy5uZWdhdGl2ZUZpbGxcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ1ZhcmlhYmxlVGVybUNyZWF0b3InLCBWYXJpYWJsZVRlcm1DcmVhdG9yICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsSUFBSUMsY0FBYyxRQUFRLHVDQUF1QztBQUVqRixPQUFPQyxRQUFRLE1BQU0sNkNBQTZDO0FB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