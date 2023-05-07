// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model of 2 springs in parallel, pulled by a robotic arm.
 *
 * Feq = F1 + F2
 * keq = k1 + k2
 * xeq = x1 = x2
 * Eeq = E1 + E2
 *
 * where:
 *
 * F = applied force, N/m
 * k = spring constant, N/m
 * x = displacement from equilibrium position, m
 * E = stored energy, J
 * subscript "1" is for the top spring
 * subscript "2" is for the bottom spring
 * subscript "eq" is a spring that is equivalent to the 2 springs in parallel
 *
 * In the equations above, subscript "1" applies to the top spring, "2" applied to the bottom spring.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import RoboticArm from '../../common/model/RoboticArm.js';
import Spring from '../../common/model/Spring.js';
import hookesLaw from '../../hookesLaw.js';
export default class ParallelSystem {
  // bottom spring, in parallel with top spring, with identical configuration
  // the single spring that is equivalent to the 2 springs in parallel
  // robotic arm, connected to the right end of the equivalent spring

  constructor(tandem) {
    //------------------------------------------------
    // Components of the system

    this.topSpring = new Spring({
      logName: 'topSpring',
      left: 0,
      // x position of the left end of the spring, units = m
      equilibriumLength: 1.5,
      // length of the spring at equilibrium, units = m
      springConstantRange: new RangeWithValue(200, 600, 200),
      // range and initial value of k1, units = N/m
      appliedForceRange: new RangeWithValue(-100, 100, 0),
      // range and initial value of F1, units = N
      tandem: tandem.createTandem('topSpring'),
      phetioDocumentation: 'The top spring in the parallel system'
    });
    this.bottomSpring = new Spring({
      logName: 'bottomSpring',
      left: this.topSpring.leftProperty.value,
      equilibriumLength: this.topSpring.equilibriumLength,
      springConstantRange: this.topSpring.springConstantRange,
      appliedForceRange: this.topSpring.appliedForceRange,
      tandem: tandem.createTandem('bottomSpring'),
      phetioDocumentation: 'The bottom spring in the parallel system'
    });

    // verify that springs are indeed parallel
    assert && assert(this.topSpring.leftProperty.value === this.bottomSpring.leftProperty.value, 'top and bottom springs must have same left');
    assert && assert(this.topSpring.rightProperty.value === this.bottomSpring.rightProperty.value, 'top and bottom springs must have same right');
    assert && assert(this.topSpring.equilibriumXProperty.value === this.bottomSpring.equilibriumXProperty.value, 'top and bottom springs must have same equilibrium position');
    this.equivalentSpring = new Spring({
      logName: 'equivalentSpring',
      left: this.topSpring.leftProperty.value,
      equilibriumLength: this.topSpring.equilibriumLength,
      // keq = k1 + k2
      springConstantRange: new RangeWithValue(this.topSpring.springConstantRange.min + this.bottomSpring.springConstantRange.min, this.topSpring.springConstantRange.max + this.bottomSpring.springConstantRange.max, this.topSpring.springConstantRange.defaultValue + this.bottomSpring.springConstantRange.defaultValue),
      // Feq = F1 + F2
      appliedForceRange: this.topSpring.appliedForceRange,
      tandem: tandem.createTandem('equivalentSpring'),
      phetioDocumentation: 'The single spring that is equivalent to the 2 springs in parallel'
    });
    assert && assert(this.equivalentSpring.displacementProperty.value === 0); // equivalent spring is at equilibrium

    this.roboticArm = new RoboticArm({
      left: this.equivalentSpring.rightProperty.value,
      right: this.equivalentSpring.rightProperty.value + this.equivalentSpring.lengthProperty.value,
      tandem: tandem.createTandem('roboticArm')
    });

    //------------------------------------------------
    // Property observers

    // xeq = x1 = x2
    this.equivalentSpring.displacementProperty.link(displacement => {
      this.topSpring.displacementProperty.value = displacement; // x1 = xeq
      this.bottomSpring.displacementProperty.value = displacement; // x2 = xeq
    });

    // keq = k1 + k2
    const updateEquivalentSpringConstant = () => {
      const topSpringConstant = this.topSpring.springConstantProperty.value;
      const bottomSpringConstant = this.bottomSpring.springConstantProperty.value;
      this.equivalentSpring.springConstantProperty.value = topSpringConstant + bottomSpringConstant;
    };
    this.topSpring.springConstantProperty.link(updateEquivalentSpringConstant);
    this.bottomSpring.springConstantProperty.link(updateEquivalentSpringConstant);

    // Robotic arm sets displacement of equivalent spring.
    let ignoreUpdates = false; // Used to prevent updates until both springs have been modified.
    this.roboticArm.leftProperty.link(left => {
      if (!ignoreUpdates) {
        // this will affect the displacement of both springs
        ignoreUpdates = true;
        this.equivalentSpring.displacementProperty.value = left - this.equivalentSpring.equilibriumXProperty.value;
        ignoreUpdates = false;
      }
    });

    // Connect robotic arm to equivalent spring.
    this.equivalentSpring.rightProperty.link(right => {
      this.roboticArm.leftProperty.value = right;
    });

    //------------------------------------------------
    // Check for violations of the general Spring model

    this.topSpring.leftProperty.lazyLink(left => {
      throw new Error(`Left end of top spring must remain fixed, left=${left}`);
    });
    this.bottomSpring.leftProperty.lazyLink(left => {
      throw new Error(`Left end of bottom spring must remain fixed, left=${left}`);
    });
    this.equivalentSpring.leftProperty.lazyLink(left => {
      throw new Error(`Left end of equivalent spring must remain fixed, left=${left}`);
    });
    this.equivalentSpring.equilibriumXProperty.lazyLink(equilibriumX => {
      throw new Error(`Equilibrium position of equivalent spring must remain fixed, equilibriumX=${equilibriumX}`);
    });
  }
  reset() {
    this.topSpring.reset();
    this.bottomSpring.reset();
    this.roboticArm.reset();
    this.equivalentSpring.reset();
  }
}
hookesLaw.register('ParallelSystem', ParallelSystem);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZVdpdGhWYWx1ZSIsIlJvYm90aWNBcm0iLCJTcHJpbmciLCJob29rZXNMYXciLCJQYXJhbGxlbFN5c3RlbSIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwidG9wU3ByaW5nIiwibG9nTmFtZSIsImxlZnQiLCJlcXVpbGlicml1bUxlbmd0aCIsInNwcmluZ0NvbnN0YW50UmFuZ2UiLCJhcHBsaWVkRm9yY2VSYW5nZSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJib3R0b21TcHJpbmciLCJsZWZ0UHJvcGVydHkiLCJ2YWx1ZSIsImFzc2VydCIsInJpZ2h0UHJvcGVydHkiLCJlcXVpbGlicml1bVhQcm9wZXJ0eSIsImVxdWl2YWxlbnRTcHJpbmciLCJtaW4iLCJtYXgiLCJkZWZhdWx0VmFsdWUiLCJkaXNwbGFjZW1lbnRQcm9wZXJ0eSIsInJvYm90aWNBcm0iLCJyaWdodCIsImxlbmd0aFByb3BlcnR5IiwibGluayIsImRpc3BsYWNlbWVudCIsInVwZGF0ZUVxdWl2YWxlbnRTcHJpbmdDb25zdGFudCIsInRvcFNwcmluZ0NvbnN0YW50Iiwic3ByaW5nQ29uc3RhbnRQcm9wZXJ0eSIsImJvdHRvbVNwcmluZ0NvbnN0YW50IiwiaWdub3JlVXBkYXRlcyIsImxhenlMaW5rIiwiRXJyb3IiLCJlcXVpbGlicml1bVgiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFyYWxsZWxTeXN0ZW0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTW9kZWwgb2YgMiBzcHJpbmdzIGluIHBhcmFsbGVsLCBwdWxsZWQgYnkgYSByb2JvdGljIGFybS5cclxuICpcclxuICogRmVxID0gRjEgKyBGMlxyXG4gKiBrZXEgPSBrMSArIGsyXHJcbiAqIHhlcSA9IHgxID0geDJcclxuICogRWVxID0gRTEgKyBFMlxyXG4gKlxyXG4gKiB3aGVyZTpcclxuICpcclxuICogRiA9IGFwcGxpZWQgZm9yY2UsIE4vbVxyXG4gKiBrID0gc3ByaW5nIGNvbnN0YW50LCBOL21cclxuICogeCA9IGRpc3BsYWNlbWVudCBmcm9tIGVxdWlsaWJyaXVtIHBvc2l0aW9uLCBtXHJcbiAqIEUgPSBzdG9yZWQgZW5lcmd5LCBKXHJcbiAqIHN1YnNjcmlwdCBcIjFcIiBpcyBmb3IgdGhlIHRvcCBzcHJpbmdcclxuICogc3Vic2NyaXB0IFwiMlwiIGlzIGZvciB0aGUgYm90dG9tIHNwcmluZ1xyXG4gKiBzdWJzY3JpcHQgXCJlcVwiIGlzIGEgc3ByaW5nIHRoYXQgaXMgZXF1aXZhbGVudCB0byB0aGUgMiBzcHJpbmdzIGluIHBhcmFsbGVsXHJcbiAqXHJcbiAqIEluIHRoZSBlcXVhdGlvbnMgYWJvdmUsIHN1YnNjcmlwdCBcIjFcIiBhcHBsaWVzIHRvIHRoZSB0b3Agc3ByaW5nLCBcIjJcIiBhcHBsaWVkIHRvIHRoZSBib3R0b20gc3ByaW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBSYW5nZVdpdGhWYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2VXaXRoVmFsdWUuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgUm9ib3RpY0FybSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUm9ib3RpY0FybS5qcyc7XHJcbmltcG9ydCBTcHJpbmcgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NwcmluZy5qcyc7XHJcbmltcG9ydCBob29rZXNMYXcgZnJvbSAnLi4vLi4vaG9va2VzTGF3LmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhcmFsbGVsU3lzdGVtIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHRvcFNwcmluZzogU3ByaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBib3R0b21TcHJpbmc6IFNwcmluZzsgLy8gYm90dG9tIHNwcmluZywgaW4gcGFyYWxsZWwgd2l0aCB0b3Agc3ByaW5nLCB3aXRoIGlkZW50aWNhbCBjb25maWd1cmF0aW9uXHJcbiAgcHVibGljIHJlYWRvbmx5IGVxdWl2YWxlbnRTcHJpbmc6IFNwcmluZzsgLy8gdGhlIHNpbmdsZSBzcHJpbmcgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSAyIHNwcmluZ3MgaW4gcGFyYWxsZWxcclxuICBwdWJsaWMgcmVhZG9ubHkgcm9ib3RpY0FybTogUm9ib3RpY0FybTsgLy8gcm9ib3RpYyBhcm0sIGNvbm5lY3RlZCB0byB0aGUgcmlnaHQgZW5kIG9mIHRoZSBlcXVpdmFsZW50IHNwcmluZ1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBDb21wb25lbnRzIG9mIHRoZSBzeXN0ZW1cclxuXHJcbiAgICB0aGlzLnRvcFNwcmluZyA9IG5ldyBTcHJpbmcoIHtcclxuICAgICAgbG9nTmFtZTogJ3RvcFNwcmluZycsXHJcbiAgICAgIGxlZnQ6IDAsIC8vIHggcG9zaXRpb24gb2YgdGhlIGxlZnQgZW5kIG9mIHRoZSBzcHJpbmcsIHVuaXRzID0gbVxyXG4gICAgICBlcXVpbGlicml1bUxlbmd0aDogMS41LCAvLyBsZW5ndGggb2YgdGhlIHNwcmluZyBhdCBlcXVpbGlicml1bSwgdW5pdHMgPSBtXHJcbiAgICAgIHNwcmluZ0NvbnN0YW50UmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggMjAwLCA2MDAsIDIwMCApLCAvLyByYW5nZSBhbmQgaW5pdGlhbCB2YWx1ZSBvZiBrMSwgdW5pdHMgPSBOL21cclxuICAgICAgYXBwbGllZEZvcmNlUmFuZ2U6IG5ldyBSYW5nZVdpdGhWYWx1ZSggLTEwMCwgMTAwLCAwICksIC8vIHJhbmdlIGFuZCBpbml0aWFsIHZhbHVlIG9mIEYxLCB1bml0cyA9IE5cclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9wU3ByaW5nJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHRvcCBzcHJpbmcgaW4gdGhlIHBhcmFsbGVsIHN5c3RlbSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJvdHRvbVNwcmluZyA9IG5ldyBTcHJpbmcoIHtcclxuICAgICAgbG9nTmFtZTogJ2JvdHRvbVNwcmluZycsXHJcbiAgICAgIGxlZnQ6IHRoaXMudG9wU3ByaW5nLmxlZnRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgZXF1aWxpYnJpdW1MZW5ndGg6IHRoaXMudG9wU3ByaW5nLmVxdWlsaWJyaXVtTGVuZ3RoLFxyXG4gICAgICBzcHJpbmdDb25zdGFudFJhbmdlOiB0aGlzLnRvcFNwcmluZy5zcHJpbmdDb25zdGFudFJhbmdlLFxyXG4gICAgICBhcHBsaWVkRm9yY2VSYW5nZTogdGhpcy50b3BTcHJpbmcuYXBwbGllZEZvcmNlUmFuZ2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JvdHRvbVNwcmluZycgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBib3R0b20gc3ByaW5nIGluIHRoZSBwYXJhbGxlbCBzeXN0ZW0nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdmVyaWZ5IHRoYXQgc3ByaW5ncyBhcmUgaW5kZWVkIHBhcmFsbGVsXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnRvcFNwcmluZy5sZWZ0UHJvcGVydHkudmFsdWUgPT09IHRoaXMuYm90dG9tU3ByaW5nLmxlZnRQcm9wZXJ0eS52YWx1ZSwgJ3RvcCBhbmQgYm90dG9tIHNwcmluZ3MgbXVzdCBoYXZlIHNhbWUgbGVmdCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudG9wU3ByaW5nLnJpZ2h0UHJvcGVydHkudmFsdWUgPT09IHRoaXMuYm90dG9tU3ByaW5nLnJpZ2h0UHJvcGVydHkudmFsdWUsICd0b3AgYW5kIGJvdHRvbSBzcHJpbmdzIG11c3QgaGF2ZSBzYW1lIHJpZ2h0JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50b3BTcHJpbmcuZXF1aWxpYnJpdW1YUHJvcGVydHkudmFsdWUgPT09IHRoaXMuYm90dG9tU3ByaW5nLmVxdWlsaWJyaXVtWFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICAndG9wIGFuZCBib3R0b20gc3ByaW5ncyBtdXN0IGhhdmUgc2FtZSBlcXVpbGlicml1bSBwb3NpdGlvbicgKTtcclxuXHJcbiAgICB0aGlzLmVxdWl2YWxlbnRTcHJpbmcgPSBuZXcgU3ByaW5nKCB7XHJcbiAgICAgIGxvZ05hbWU6ICdlcXVpdmFsZW50U3ByaW5nJyxcclxuICAgICAgbGVmdDogdGhpcy50b3BTcHJpbmcubGVmdFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBlcXVpbGlicml1bUxlbmd0aDogdGhpcy50b3BTcHJpbmcuZXF1aWxpYnJpdW1MZW5ndGgsXHJcbiAgICAgIC8vIGtlcSA9IGsxICsgazJcclxuICAgICAgc3ByaW5nQ29uc3RhbnRSYW5nZTogbmV3IFJhbmdlV2l0aFZhbHVlKFxyXG4gICAgICAgIHRoaXMudG9wU3ByaW5nLnNwcmluZ0NvbnN0YW50UmFuZ2UubWluICsgdGhpcy5ib3R0b21TcHJpbmcuc3ByaW5nQ29uc3RhbnRSYW5nZS5taW4sXHJcbiAgICAgICAgdGhpcy50b3BTcHJpbmcuc3ByaW5nQ29uc3RhbnRSYW5nZS5tYXggKyB0aGlzLmJvdHRvbVNwcmluZy5zcHJpbmdDb25zdGFudFJhbmdlLm1heCxcclxuICAgICAgICB0aGlzLnRvcFNwcmluZy5zcHJpbmdDb25zdGFudFJhbmdlLmRlZmF1bHRWYWx1ZSArIHRoaXMuYm90dG9tU3ByaW5nLnNwcmluZ0NvbnN0YW50UmFuZ2UuZGVmYXVsdFZhbHVlICksXHJcbiAgICAgIC8vIEZlcSA9IEYxICsgRjJcclxuICAgICAgYXBwbGllZEZvcmNlUmFuZ2U6IHRoaXMudG9wU3ByaW5nLmFwcGxpZWRGb3JjZVJhbmdlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlcXVpdmFsZW50U3ByaW5nJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHNpbmdsZSBzcHJpbmcgdGhhdCBpcyBlcXVpdmFsZW50IHRvIHRoZSAyIHNwcmluZ3MgaW4gcGFyYWxsZWwnXHJcbiAgICB9ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVxdWl2YWxlbnRTcHJpbmcuZGlzcGxhY2VtZW50UHJvcGVydHkudmFsdWUgPT09IDAgKTsgLy8gZXF1aXZhbGVudCBzcHJpbmcgaXMgYXQgZXF1aWxpYnJpdW1cclxuXHJcbiAgICB0aGlzLnJvYm90aWNBcm0gPSBuZXcgUm9ib3RpY0FybSgge1xyXG4gICAgICBsZWZ0OiB0aGlzLmVxdWl2YWxlbnRTcHJpbmcucmlnaHRQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgcmlnaHQ6IHRoaXMuZXF1aXZhbGVudFNwcmluZy5yaWdodFByb3BlcnR5LnZhbHVlICsgdGhpcy5lcXVpdmFsZW50U3ByaW5nLmxlbmd0aFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyb2JvdGljQXJtJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIFByb3BlcnR5IG9ic2VydmVyc1xyXG5cclxuICAgIC8vIHhlcSA9IHgxID0geDJcclxuICAgIHRoaXMuZXF1aXZhbGVudFNwcmluZy5kaXNwbGFjZW1lbnRQcm9wZXJ0eS5saW5rKCBkaXNwbGFjZW1lbnQgPT4ge1xyXG4gICAgICB0aGlzLnRvcFNwcmluZy5kaXNwbGFjZW1lbnRQcm9wZXJ0eS52YWx1ZSA9IGRpc3BsYWNlbWVudDsgLy8geDEgPSB4ZXFcclxuICAgICAgdGhpcy5ib3R0b21TcHJpbmcuZGlzcGxhY2VtZW50UHJvcGVydHkudmFsdWUgPSBkaXNwbGFjZW1lbnQ7IC8vIHgyID0geGVxXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8ga2VxID0gazEgKyBrMlxyXG4gICAgY29uc3QgdXBkYXRlRXF1aXZhbGVudFNwcmluZ0NvbnN0YW50ID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB0b3BTcHJpbmdDb25zdGFudCA9IHRoaXMudG9wU3ByaW5nLnNwcmluZ0NvbnN0YW50UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGNvbnN0IGJvdHRvbVNwcmluZ0NvbnN0YW50ID0gdGhpcy5ib3R0b21TcHJpbmcuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgdGhpcy5lcXVpdmFsZW50U3ByaW5nLnNwcmluZ0NvbnN0YW50UHJvcGVydHkudmFsdWUgPSAoIHRvcFNwcmluZ0NvbnN0YW50ICsgYm90dG9tU3ByaW5nQ29uc3RhbnQgKTtcclxuICAgIH07XHJcbiAgICB0aGlzLnRvcFNwcmluZy5zcHJpbmdDb25zdGFudFByb3BlcnR5LmxpbmsoIHVwZGF0ZUVxdWl2YWxlbnRTcHJpbmdDb25zdGFudCApO1xyXG4gICAgdGhpcy5ib3R0b21TcHJpbmcuc3ByaW5nQ29uc3RhbnRQcm9wZXJ0eS5saW5rKCB1cGRhdGVFcXVpdmFsZW50U3ByaW5nQ29uc3RhbnQgKTtcclxuXHJcbiAgICAvLyBSb2JvdGljIGFybSBzZXRzIGRpc3BsYWNlbWVudCBvZiBlcXVpdmFsZW50IHNwcmluZy5cclxuICAgIGxldCBpZ25vcmVVcGRhdGVzID0gZmFsc2U7IC8vIFVzZWQgdG8gcHJldmVudCB1cGRhdGVzIHVudGlsIGJvdGggc3ByaW5ncyBoYXZlIGJlZW4gbW9kaWZpZWQuXHJcbiAgICB0aGlzLnJvYm90aWNBcm0ubGVmdFByb3BlcnR5LmxpbmsoIGxlZnQgPT4ge1xyXG4gICAgICBpZiAoICFpZ25vcmVVcGRhdGVzICkge1xyXG4gICAgICAgIC8vIHRoaXMgd2lsbCBhZmZlY3QgdGhlIGRpc3BsYWNlbWVudCBvZiBib3RoIHNwcmluZ3NcclxuICAgICAgICBpZ25vcmVVcGRhdGVzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmVxdWl2YWxlbnRTcHJpbmcuZGlzcGxhY2VtZW50UHJvcGVydHkudmFsdWUgPSAoIGxlZnQgLSB0aGlzLmVxdWl2YWxlbnRTcHJpbmcuZXF1aWxpYnJpdW1YUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICBpZ25vcmVVcGRhdGVzID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDb25uZWN0IHJvYm90aWMgYXJtIHRvIGVxdWl2YWxlbnQgc3ByaW5nLlxyXG4gICAgdGhpcy5lcXVpdmFsZW50U3ByaW5nLnJpZ2h0UHJvcGVydHkubGluayggcmlnaHQgPT4ge1xyXG4gICAgICB0aGlzLnJvYm90aWNBcm0ubGVmdFByb3BlcnR5LnZhbHVlID0gcmlnaHQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIENoZWNrIGZvciB2aW9sYXRpb25zIG9mIHRoZSBnZW5lcmFsIFNwcmluZyBtb2RlbFxyXG5cclxuICAgIHRoaXMudG9wU3ByaW5nLmxlZnRQcm9wZXJ0eS5sYXp5TGluayggbGVmdCA9PiB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYExlZnQgZW5kIG9mIHRvcCBzcHJpbmcgbXVzdCByZW1haW4gZml4ZWQsIGxlZnQ9JHtsZWZ0fWAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJvdHRvbVNwcmluZy5sZWZ0UHJvcGVydHkubGF6eUxpbmsoIGxlZnQgPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBMZWZ0IGVuZCBvZiBib3R0b20gc3ByaW5nIG11c3QgcmVtYWluIGZpeGVkLCBsZWZ0PSR7bGVmdH1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5lcXVpdmFsZW50U3ByaW5nLmxlZnRQcm9wZXJ0eS5sYXp5TGluayggbGVmdCA9PiB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYExlZnQgZW5kIG9mIGVxdWl2YWxlbnQgc3ByaW5nIG11c3QgcmVtYWluIGZpeGVkLCBsZWZ0PSR7bGVmdH1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5lcXVpdmFsZW50U3ByaW5nLmVxdWlsaWJyaXVtWFByb3BlcnR5LmxhenlMaW5rKCBlcXVpbGlicml1bVggPT4ge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGBFcXVpbGlicml1bSBwb3NpdGlvbiBvZiBlcXVpdmFsZW50IHNwcmluZyBtdXN0IHJlbWFpbiBmaXhlZCwgZXF1aWxpYnJpdW1YPSR7ZXF1aWxpYnJpdW1YfWAgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMudG9wU3ByaW5nLnJlc2V0KCk7XHJcbiAgICB0aGlzLmJvdHRvbVNwcmluZy5yZXNldCgpO1xyXG4gICAgdGhpcy5yb2JvdGljQXJtLnJlc2V0KCk7XHJcbiAgICB0aGlzLmVxdWl2YWxlbnRTcHJpbmcucmVzZXQoKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ1BhcmFsbGVsU3lzdGVtJywgUGFyYWxsZWxTeXN0ZW0gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSxzQ0FBc0M7QUFFakUsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFFMUMsZUFBZSxNQUFNQyxjQUFjLENBQUM7RUFHSTtFQUNJO0VBQ0Y7O0VBRWpDQyxXQUFXQSxDQUFF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