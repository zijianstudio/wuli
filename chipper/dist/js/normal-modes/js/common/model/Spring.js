// Copyright 2020, University of Colorado Boulder

/**
 * This Spring class models a spring that connects two masses and is visible when the left one is visible.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import normalModes from '../../normalModes.js';
class Spring {
  /**
   * @param {Mass} leftMass
   * @param {Mass} rightMass
   */
  constructor(leftMass, rightMass) {
    // @private (read-only) Non-property attributes
    this.leftMass = leftMass;
    this.rightMass = rightMass;

    // @public {Property.<boolean>} determines the visibility of the spring
    // dispose is unnecessary because all masses and springs exist for the lifetime of the sim
    this.visibleProperty = new DerivedProperty([this.leftMass.visibleProperty, this.rightMass.visibleProperty], (leftVisible, rightVisible) => {
      return leftVisible;
    });
  }
}
normalModes.register('Spring', Spring);
export default Spring;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJub3JtYWxNb2RlcyIsIlNwcmluZyIsImNvbnN0cnVjdG9yIiwibGVmdE1hc3MiLCJyaWdodE1hc3MiLCJ2aXNpYmxlUHJvcGVydHkiLCJsZWZ0VmlzaWJsZSIsInJpZ2h0VmlzaWJsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU3ByaW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIFNwcmluZyBjbGFzcyBtb2RlbHMgYSBzcHJpbmcgdGhhdCBjb25uZWN0cyB0d28gbWFzc2VzIGFuZCBpcyB2aXNpYmxlIHdoZW4gdGhlIGxlZnQgb25lIGlzIHZpc2libGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgVGhpYWdvIGRlIE1lbmRvbsOnYSBNaWxkZW1iZXJnZXIgKFVURlBSKVxyXG4gKi9cclxuXHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbm9ybWFsTW9kZXMgZnJvbSAnLi4vLi4vbm9ybWFsTW9kZXMuanMnO1xyXG5cclxuY2xhc3MgU3ByaW5nIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNYXNzfSBsZWZ0TWFzc1xyXG4gICAqIEBwYXJhbSB7TWFzc30gcmlnaHRNYXNzXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxlZnRNYXNzLCByaWdodE1hc3MgKSB7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgKHJlYWQtb25seSkgTm9uLXByb3BlcnR5IGF0dHJpYnV0ZXNcclxuICAgIHRoaXMubGVmdE1hc3MgPSBsZWZ0TWFzcztcclxuICAgIHRoaXMucmlnaHRNYXNzID0gcmlnaHRNYXNzO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5Ljxib29sZWFuPn0gZGV0ZXJtaW5lcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgc3ByaW5nXHJcbiAgICAvLyBkaXNwb3NlIGlzIHVubmVjZXNzYXJ5IGJlY2F1c2UgYWxsIG1hc3NlcyBhbmQgc3ByaW5ncyBleGlzdCBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIHRoaXMudmlzaWJsZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLmxlZnRNYXNzLnZpc2libGVQcm9wZXJ0eSwgdGhpcy5yaWdodE1hc3MudmlzaWJsZVByb3BlcnR5IF0sXHJcbiAgICAgICggbGVmdFZpc2libGUsIHJpZ2h0VmlzaWJsZSApID0+IHtcclxuICAgICAgICByZXR1cm4gbGVmdFZpc2libGU7XHJcbiAgICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm5vcm1hbE1vZGVzLnJlZ2lzdGVyKCAnU3ByaW5nJywgU3ByaW5nICk7XHJcbmV4cG9ydCBkZWZhdWx0IFNwcmluZzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBRTlDLE1BQU1DLE1BQU0sQ0FBQztFQUVYO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLFFBQVEsRUFBRUMsU0FBUyxFQUFHO0lBRWpDO0lBQ0EsSUFBSSxDQUFDRCxRQUFRLEdBQUdBLFFBQVE7SUFDeEIsSUFBSSxDQUFDQyxTQUFTLEdBQUdBLFNBQVM7O0lBRTFCO0lBQ0E7SUFDQSxJQUFJLENBQUNDLGVBQWUsR0FBRyxJQUFJTixlQUFlLENBQ3hDLENBQUUsSUFBSSxDQUFDSSxRQUFRLENBQUNFLGVBQWUsRUFBRSxJQUFJLENBQUNELFNBQVMsQ0FBQ0MsZUFBZSxDQUFFLEVBQ2pFLENBQUVDLFdBQVcsRUFBRUMsWUFBWSxLQUFNO01BQy9CLE9BQU9ELFdBQVc7SUFDcEIsQ0FBRSxDQUFDO0VBQ1A7QUFDRjtBQUVBTixXQUFXLENBQUNRLFFBQVEsQ0FBRSxRQUFRLEVBQUVQLE1BQU8sQ0FBQztBQUN4QyxlQUFlQSxNQUFNIn0=