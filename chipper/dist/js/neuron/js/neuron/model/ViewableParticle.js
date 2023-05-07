// Copyright 2014-2020, University of Colorado Boulder

/**
 * Interface for a particle that can be viewed, i.e. displayed to the user.
 *
 * @author John Blanco
 * @author Sharfudeen Ashraf (for Ghent University)
 */

import neuron from '../../neuron.js';
class ViewableParticle {
  constructor() {}

  // @public, subclasses must implement
  getType() {
    throw new Error('getType should be implemented in descendant classes.');
  }

  // @public, subclasses must implement
  getPositionX() {
    throw new Error('getPositionX should be implemented in descendant classes.');
  }

  // @public, subclasses must implement
  getPositionY() {
    throw new Error('getPositionY should be implemented in descendant classes.');
  }

  /**
   * Get the radius of this particle in nano meters.  This is approximate in the case of non-round particles.
   * @public
   */
  getRadius() {
    throw new Error('getRadius should be implemented in descendant classes.');
  }

  /**
   * Get the base color to be used when representing this particle.
   * @public
   */
  getRepresentationColor() {
    throw new Error('getRepresentationColor should be implemented in descendant classes.');
  }

  // @public, subclasses must implement
  getOpacity() {
    throw new Error('getOpacity should be implemented in descendant classes.');
  }
}
neuron.register('ViewableParticle', ViewableParticle);
export default ViewableParticle;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJuZXVyb24iLCJWaWV3YWJsZVBhcnRpY2xlIiwiY29uc3RydWN0b3IiLCJnZXRUeXBlIiwiRXJyb3IiLCJnZXRQb3NpdGlvblgiLCJnZXRQb3NpdGlvblkiLCJnZXRSYWRpdXMiLCJnZXRSZXByZXNlbnRhdGlvbkNvbG9yIiwiZ2V0T3BhY2l0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVmlld2FibGVQYXJ0aWNsZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBJbnRlcmZhY2UgZm9yIGEgcGFydGljbGUgdGhhdCBjYW4gYmUgdmlld2VkLCBpLmUuIGRpc3BsYXllZCB0byB0aGUgdXNlci5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIFNoYXJmdWRlZW4gQXNocmFmIChmb3IgR2hlbnQgVW5pdmVyc2l0eSlcclxuICovXHJcblxyXG5pbXBvcnQgbmV1cm9uIGZyb20gJy4uLy4uL25ldXJvbi5qcyc7XHJcblxyXG5jbGFzcyBWaWV3YWJsZVBhcnRpY2xlIHtcclxuXHJcbiAgY29uc3RydWN0b3IoKSB7fVxyXG5cclxuICAvLyBAcHVibGljLCBzdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50XHJcbiAgZ2V0VHlwZSgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldFR5cGUgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIGRlc2NlbmRhbnQgY2xhc3Nlcy4nICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljLCBzdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50XHJcbiAgZ2V0UG9zaXRpb25YKCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnZ2V0UG9zaXRpb25YIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYywgc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudFxyXG4gIGdldFBvc2l0aW9uWSgpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldFBvc2l0aW9uWSBzaG91bGQgYmUgaW1wbGVtZW50ZWQgaW4gZGVzY2VuZGFudCBjbGFzc2VzLicgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgcmFkaXVzIG9mIHRoaXMgcGFydGljbGUgaW4gbmFubyBtZXRlcnMuICBUaGlzIGlzIGFwcHJveGltYXRlIGluIHRoZSBjYXNlIG9mIG5vbi1yb3VuZCBwYXJ0aWNsZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFJhZGl1cygpIHtcclxuICAgIHRocm93IG5ldyBFcnJvciggJ2dldFJhZGl1cyBzaG91bGQgYmUgaW1wbGVtZW50ZWQgaW4gZGVzY2VuZGFudCBjbGFzc2VzLicgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYmFzZSBjb2xvciB0byBiZSB1c2VkIHdoZW4gcmVwcmVzZW50aW5nIHRoaXMgcGFydGljbGUuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFJlcHJlc2VudGF0aW9uQ29sb3IoKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdnZXRSZXByZXNlbnRhdGlvbkNvbG9yIHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMuJyApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpYywgc3ViY2xhc3NlcyBtdXN0IGltcGxlbWVudFxyXG4gIGdldE9wYWNpdHkoKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoICdnZXRPcGFjaXR5IHNob3VsZCBiZSBpbXBsZW1lbnRlZCBpbiBkZXNjZW5kYW50IGNsYXNzZXMuJyApO1xyXG4gIH1cclxufVxyXG5cclxubmV1cm9uLnJlZ2lzdGVyKCAnVmlld2FibGVQYXJ0aWNsZScsIFZpZXdhYmxlUGFydGljbGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFZpZXdhYmxlUGFydGljbGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLGlCQUFpQjtBQUVwQyxNQUFNQyxnQkFBZ0IsQ0FBQztFQUVyQkMsV0FBV0EsQ0FBQSxFQUFHLENBQUM7O0VBRWY7RUFDQUMsT0FBT0EsQ0FBQSxFQUFHO0lBQ1IsTUFBTSxJQUFJQyxLQUFLLENBQUUsc0RBQXVELENBQUM7RUFDM0U7O0VBRUE7RUFDQUMsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsTUFBTSxJQUFJRCxLQUFLLENBQUUsMkRBQTRELENBQUM7RUFDaEY7O0VBRUE7RUFDQUUsWUFBWUEsQ0FBQSxFQUFHO0lBQ2IsTUFBTSxJQUFJRixLQUFLLENBQUUsMkRBQTRELENBQUM7RUFDaEY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUcsU0FBU0EsQ0FBQSxFQUFHO0lBQ1YsTUFBTSxJQUFJSCxLQUFLLENBQUUsd0RBQXlELENBQUM7RUFDN0U7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRUksc0JBQXNCQSxDQUFBLEVBQUc7SUFDdkIsTUFBTSxJQUFJSixLQUFLLENBQUUscUVBQXNFLENBQUM7RUFDMUY7O0VBRUE7RUFDQUssVUFBVUEsQ0FBQSxFQUFHO0lBQ1gsTUFBTSxJQUFJTCxLQUFLLENBQUUseURBQTBELENBQUM7RUFDOUU7QUFDRjtBQUVBSixNQUFNLENBQUNVLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRVQsZ0JBQWlCLENBQUM7QUFFdkQsZUFBZUEsZ0JBQWdCIn0=