// Copyright 2017-2023, University of Colorado Boulder

/**
 * View Properties that are specific to visibility of vectors
 *
 * @author Andrea Lin (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationDeprecatedProperty from '../../../../axon/js/EnumerationDeprecatedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import ProjectileMotionViewProperties from '../../common/view/ProjectileMotionViewProperties.js';
import VectorsDisplayEnumeration from '../../common/view/VectorsDisplayEnumeration.js';
import projectileMotion from '../../projectileMotion.js';
class DragViewProperties extends ProjectileMotionViewProperties {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    super({
      accelerationProperties: false
    });

    // @public vectors visibility for velocity and force, total or component
    this.velocityVectorsOnProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('velocityVectorsOnProperty'),
      phetioDocumentation: 'Whether to display velocity vectors for flying projectiles'
    });
    this.forceVectorsOnProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('forceVectorsOnProperty'),
      phetioDocumentation: 'Whether to display the force vectors in a free body diagram for flying projectiles'
    });
    this.vectorsDisplayProperty = new EnumerationDeprecatedProperty(VectorsDisplayEnumeration, VectorsDisplayEnumeration.TOTAL, {
      tandem: tandem.createTandem('vectorsDisplayProperty'),
      phetioDocumentation: 'Property for which type of vectors are displayed for flying projectiles: either component ' + 'vectors or total vectors.'
    });

    // update which vectors to show based on controls
    // Doesn't need to be disposed because it lasts for the lifetime of the sim
    Multilink.multilink([this.velocityVectorsOnProperty, this.forceVectorsOnProperty, this.vectorsDisplayProperty], this.updateVectorVisibilities.bind(this));
  }

  /**
   * Reset these Properties
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.velocityVectorsOnProperty.reset();
    this.forceVectorsOnProperty.reset();
    this.vectorsDisplayProperty.reset();
  }

  /**
   * Update vector visibilities based on whether velocity and/or force vectors are on, and whether total or components
   * @private
   *
   * @param {boolean} velocityVectorsOn
   * @param {boolean} forceVectorsOn
   * @param {string} vectorsDisplay
   */
  updateVectorVisibilities(velocityVectorsOn, forceVectorsOn, vectorsDisplay) {
    const displayTotal = vectorsDisplay === VectorsDisplayEnumeration.TOTAL;
    const displayComponents = vectorsDisplay === VectorsDisplayEnumeration.COMPONENTS;
    this.totalVelocityVectorOnProperty.set(velocityVectorsOn && displayTotal);
    this.componentsVelocityVectorsOnProperty.set(velocityVectorsOn && displayComponents);
    this.totalForceVectorOnProperty.set(forceVectorsOn && displayTotal);
    this.componentsForceVectorsOnProperty.set(forceVectorsOn && displayComponents);
  }
}
projectileMotion.register('DragViewProperties', DragViewProperties);
export default DragViewProperties;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvbkRlcHJlY2F0ZWRQcm9wZXJ0eSIsIk11bHRpbGluayIsIlByb2plY3RpbGVNb3Rpb25WaWV3UHJvcGVydGllcyIsIlZlY3RvcnNEaXNwbGF5RW51bWVyYXRpb24iLCJwcm9qZWN0aWxlTW90aW9uIiwiRHJhZ1ZpZXdQcm9wZXJ0aWVzIiwiY29uc3RydWN0b3IiLCJ0YW5kZW0iLCJhY2NlbGVyYXRpb25Qcm9wZXJ0aWVzIiwidmVsb2NpdHlWZWN0b3JzT25Qcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJmb3JjZVZlY3RvcnNPblByb3BlcnR5IiwidmVjdG9yc0Rpc3BsYXlQcm9wZXJ0eSIsIlRPVEFMIiwibXVsdGlsaW5rIiwidXBkYXRlVmVjdG9yVmlzaWJpbGl0aWVzIiwiYmluZCIsInJlc2V0IiwidmVsb2NpdHlWZWN0b3JzT24iLCJmb3JjZVZlY3RvcnNPbiIsInZlY3RvcnNEaXNwbGF5IiwiZGlzcGxheVRvdGFsIiwiZGlzcGxheUNvbXBvbmVudHMiLCJDT01QT05FTlRTIiwidG90YWxWZWxvY2l0eVZlY3Rvck9uUHJvcGVydHkiLCJzZXQiLCJjb21wb25lbnRzVmVsb2NpdHlWZWN0b3JzT25Qcm9wZXJ0eSIsInRvdGFsRm9yY2VWZWN0b3JPblByb3BlcnR5IiwiY29tcG9uZW50c0ZvcmNlVmVjdG9yc09uUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRyYWdWaWV3UHJvcGVydGllcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IFByb3BlcnRpZXMgdGhhdCBhcmUgc3BlY2lmaWMgdG8gdmlzaWJpbGl0eSBvZiB2ZWN0b3JzXHJcbiAqXHJcbiAqIEBhdXRob3IgQW5kcmVhIExpbiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uRGVwcmVjYXRlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFByb2plY3RpbGVNb3Rpb25WaWV3UHJvcGVydGllcyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Qcm9qZWN0aWxlTW90aW9uVmlld1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgVmVjdG9yc0Rpc3BsYXlFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi9jb21tb24vdmlldy9WZWN0b3JzRGlzcGxheUVudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IHByb2plY3RpbGVNb3Rpb24gZnJvbSAnLi4vLi4vcHJvamVjdGlsZU1vdGlvbi5qcyc7XHJcblxyXG5jbGFzcyBEcmFnVmlld1Byb3BlcnRpZXMgZXh0ZW5kcyBQcm9qZWN0aWxlTW90aW9uVmlld1Byb3BlcnRpZXMge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHtcclxuICAgICAgYWNjZWxlcmF0aW9uUHJvcGVydGllczogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHZlY3RvcnMgdmlzaWJpbGl0eSBmb3IgdmVsb2NpdHkgYW5kIGZvcmNlLCB0b3RhbCBvciBjb21wb25lbnRcclxuICAgIHRoaXMudmVsb2NpdHlWZWN0b3JzT25Qcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZlbG9jaXR5VmVjdG9yc09uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdXaGV0aGVyIHRvIGRpc3BsYXkgdmVsb2NpdHkgdmVjdG9ycyBmb3IgZmx5aW5nIHByb2plY3RpbGVzJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5mb3JjZVZlY3RvcnNPblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZm9yY2VWZWN0b3JzT25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1doZXRoZXIgdG8gZGlzcGxheSB0aGUgZm9yY2UgdmVjdG9ycyBpbiBhIGZyZWUgYm9keSBkaWFncmFtIGZvciBmbHlpbmcgcHJvamVjdGlsZXMnXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnZlY3RvcnNEaXNwbGF5UHJvcGVydHkgPSBuZXcgRW51bWVyYXRpb25EZXByZWNhdGVkUHJvcGVydHkoIFZlY3RvcnNEaXNwbGF5RW51bWVyYXRpb24sIFZlY3RvcnNEaXNwbGF5RW51bWVyYXRpb24uVE9UQUwsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmVjdG9yc0Rpc3BsYXlQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1Byb3BlcnR5IGZvciB3aGljaCB0eXBlIG9mIHZlY3RvcnMgYXJlIGRpc3BsYXllZCBmb3IgZmx5aW5nIHByb2plY3RpbGVzOiBlaXRoZXIgY29tcG9uZW50ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAndmVjdG9ycyBvciB0b3RhbCB2ZWN0b3JzLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgd2hpY2ggdmVjdG9ycyB0byBzaG93IGJhc2VkIG9uIGNvbnRyb2xzXHJcbiAgICAvLyBEb2Vzbid0IG5lZWQgdG8gYmUgZGlzcG9zZWQgYmVjYXVzZSBpdCBsYXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW1cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgdGhpcy52ZWxvY2l0eVZlY3RvcnNPblByb3BlcnR5LFxyXG4gICAgICB0aGlzLmZvcmNlVmVjdG9yc09uUHJvcGVydHksXHJcbiAgICAgIHRoaXMudmVjdG9yc0Rpc3BsYXlQcm9wZXJ0eVxyXG4gICAgXSwgdGhpcy51cGRhdGVWZWN0b3JWaXNpYmlsaXRpZXMuYmluZCggdGhpcyApICk7XHJcblxyXG4gIH1cclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZXNlIFByb3BlcnRpZXNcclxuICAgKiBAcHVibGljXHJcbiAgICogQG92ZXJyaWRlXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gICAgdGhpcy52ZWxvY2l0eVZlY3RvcnNPblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmZvcmNlVmVjdG9yc09uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmVjdG9yc0Rpc3BsYXlQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHZlY3RvciB2aXNpYmlsaXRpZXMgYmFzZWQgb24gd2hldGhlciB2ZWxvY2l0eSBhbmQvb3IgZm9yY2UgdmVjdG9ycyBhcmUgb24sIGFuZCB3aGV0aGVyIHRvdGFsIG9yIGNvbXBvbmVudHNcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB2ZWxvY2l0eVZlY3RvcnNPblxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2VWZWN0b3JzT25cclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmVjdG9yc0Rpc3BsYXlcclxuICAgKi9cclxuICB1cGRhdGVWZWN0b3JWaXNpYmlsaXRpZXMoIHZlbG9jaXR5VmVjdG9yc09uLCBmb3JjZVZlY3RvcnNPbiwgdmVjdG9yc0Rpc3BsYXkgKSB7XHJcbiAgICBjb25zdCBkaXNwbGF5VG90YWwgPSB2ZWN0b3JzRGlzcGxheSA9PT0gVmVjdG9yc0Rpc3BsYXlFbnVtZXJhdGlvbi5UT1RBTDtcclxuICAgIGNvbnN0IGRpc3BsYXlDb21wb25lbnRzID0gdmVjdG9yc0Rpc3BsYXkgPT09IFZlY3RvcnNEaXNwbGF5RW51bWVyYXRpb24uQ09NUE9ORU5UUztcclxuXHJcbiAgICB0aGlzLnRvdGFsVmVsb2NpdHlWZWN0b3JPblByb3BlcnR5LnNldCggdmVsb2NpdHlWZWN0b3JzT24gJiYgZGlzcGxheVRvdGFsICk7XHJcbiAgICB0aGlzLmNvbXBvbmVudHNWZWxvY2l0eVZlY3RvcnNPblByb3BlcnR5LnNldCggdmVsb2NpdHlWZWN0b3JzT24gJiYgZGlzcGxheUNvbXBvbmVudHMgKTtcclxuICAgIHRoaXMudG90YWxGb3JjZVZlY3Rvck9uUHJvcGVydHkuc2V0KCBmb3JjZVZlY3RvcnNPbiAmJiBkaXNwbGF5VG90YWwgKTtcclxuICAgIHRoaXMuY29tcG9uZW50c0ZvcmNlVmVjdG9yc09uUHJvcGVydHkuc2V0KCBmb3JjZVZlY3RvcnNPbiAmJiBkaXNwbGF5Q29tcG9uZW50cyApO1xyXG4gIH1cclxufVxyXG5cclxucHJvamVjdGlsZU1vdGlvbi5yZWdpc3RlciggJ0RyYWdWaWV3UHJvcGVydGllcycsIERyYWdWaWV3UHJvcGVydGllcyApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRHJhZ1ZpZXdQcm9wZXJ0aWVzOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLDZCQUE2QixNQUFNLHNEQUFzRDtBQUNoRyxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBQ3hELE9BQU9DLDhCQUE4QixNQUFNLHFEQUFxRDtBQUNoRyxPQUFPQyx5QkFBeUIsTUFBTSxnREFBZ0Q7QUFDdEYsT0FBT0MsZ0JBQWdCLE1BQU0sMkJBQTJCO0FBRXhELE1B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