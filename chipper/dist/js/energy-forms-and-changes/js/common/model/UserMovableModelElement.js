// Copyright 2014-2020, University of Colorado Boulder

/**
 * base class for model elements that can be moved around by the user
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ModelElement from './ModelElement.js';
class UserMovableModelElement extends ModelElement {
  /**
   * @param {Vector2} initialPosition
   * @param {Object} [options]
   */
  constructor(initialPosition, options) {
    options = merge({
      tandem: Tandem.REQUIRED,
      userControllable: true
    }, options);
    super(initialPosition, options);

    // @protected {HorizontalSurface|null} - The surface upon which this model element is resting.  This is null if the
    // element is not resting on a movable surface.  This should only be set through the getter/setter methods below.
    this.supportingSurface = null;

    // @public {NumberProperty} - in meters/second
    this.verticalVelocityProperty = new NumberProperty(0, {
      range: new Range(-4, 0) // empirically determined
    });

    // @public (read-only) - for phet-io: assign tandem in the model so the corresponding names can be leveraged in
    // the view
    this.tandem = options.tandem;

    // create userControlledProperty unless opted out
    if (options.userControllable) {
      // @public {BooleanProperty}
      this.userControlledProperty = new BooleanProperty(false, {
        tandem: options.tandem.createTandem('userControlledProperty'),
        phetioReadOnly: true,
        phetioDocumentation: 'whether the element is being directly held or moved by a user'
      });

      // update internal state when the user picks up this model element
      this.userControlledProperty.link(userControlled => {
        if (userControlled) {
          // the user has picked up this model element, so it is no longer sitting on any surface
          this.clearSupportingSurface();
        }
      });
    }

    // @private - observer that moves this model element if and when the surface that is supporting it moves
    this.surfaceMotionObserver = position => {
      this.positionProperty.value = position;
    };
  }

  /**
   * restore initial state
   * @public
   */
  reset() {
    this.clearSupportingSurface();
    this.userControlledProperty && this.userControlledProperty.reset();
    this.verticalVelocityProperty.reset();
    super.reset();
  }

  /**
   * Set the supporting surface of this model element
   * @param {HorizontalSurface} supportingSurface
   * @override
   * @public
   */
  setSupportingSurface(supportingSurface) {
    // state and parameter checking
    assert && assert(supportingSurface !== null, 'this method should not be used to clear the supporting surface');
    assert && assert(this.supportingSurface === null, 'a supporting surface was already set');
    supportingSurface.positionProperty.link(this.surfaceMotionObserver);
    this.supportingSurface = supportingSurface;
  }

  /**
   * clear the supporting surface so that this model element is no longer sitting on a surface
   * @private
   */
  clearSupportingSurface() {
    // only do something if the supporting surface was set
    if (this.supportingSurface !== null) {
      this.supportingSurface.positionProperty.unlink(this.surfaceMotionObserver);
      this.supportingSurface.elementOnSurfaceProperty.set(null);
      this.supportingSurface = null;
    }
  }

  /**
   * get a value that indicates whether this element is stacked upon the given model element
   * @param {ModelElement} element - model element to be checked
   * @returns {boolean} - true if this model element is stacked anywhere on top of the provided element, which
   * includes cases where one or more elements are in between.
   * @public
   * @override
   */
  isStackedUpon(element) {
    const surface = this.supportingSurface ? this.supportingSurface : null;
    return surface !== null && (surface.owner === element || surface.owner.isStackedUpon(element));
  }
}
energyFormsAndChanges.register('UserMovableModelElement', UserMovableModelElement);
export default UserMovableModelElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwibWVyZ2UiLCJUYW5kZW0iLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJNb2RlbEVsZW1lbnQiLCJVc2VyTW92YWJsZU1vZGVsRWxlbWVudCIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFBvc2l0aW9uIiwib3B0aW9ucyIsInRhbmRlbSIsIlJFUVVJUkVEIiwidXNlckNvbnRyb2xsYWJsZSIsInN1cHBvcnRpbmdTdXJmYWNlIiwidmVydGljYWxWZWxvY2l0eVByb3BlcnR5IiwicmFuZ2UiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwiY3JlYXRlVGFuZGVtIiwicGhldGlvUmVhZE9ubHkiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwibGluayIsInVzZXJDb250cm9sbGVkIiwiY2xlYXJTdXBwb3J0aW5nU3VyZmFjZSIsInN1cmZhY2VNb3Rpb25PYnNlcnZlciIsInBvc2l0aW9uIiwicG9zaXRpb25Qcm9wZXJ0eSIsInZhbHVlIiwicmVzZXQiLCJzZXRTdXBwb3J0aW5nU3VyZmFjZSIsImFzc2VydCIsInVubGluayIsImVsZW1lbnRPblN1cmZhY2VQcm9wZXJ0eSIsInNldCIsImlzU3RhY2tlZFVwb24iLCJlbGVtZW50Iiwic3VyZmFjZSIsIm93bmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJVc2VyTW92YWJsZU1vZGVsRWxlbWVudC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIwLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBiYXNlIGNsYXNzIGZvciBtb2RlbCBlbGVtZW50cyB0aGF0IGNhbiBiZSBtb3ZlZCBhcm91bmQgYnkgdGhlIHVzZXJcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGVuZXJneUZvcm1zQW5kQ2hhbmdlcyBmcm9tICcuLi8uLi9lbmVyZ3lGb3Jtc0FuZENoYW5nZXMuanMnO1xyXG5pbXBvcnQgTW9kZWxFbGVtZW50IGZyb20gJy4vTW9kZWxFbGVtZW50LmpzJztcclxuXHJcbmNsYXNzIFVzZXJNb3ZhYmxlTW9kZWxFbGVtZW50IGV4dGVuZHMgTW9kZWxFbGVtZW50IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsUG9zaXRpb25cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGluaXRpYWxQb3NpdGlvbiwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHVzZXJDb250cm9sbGFibGU6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggaW5pdGlhbFBvc2l0aW9uLCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByb3RlY3RlZCB7SG9yaXpvbnRhbFN1cmZhY2V8bnVsbH0gLSBUaGUgc3VyZmFjZSB1cG9uIHdoaWNoIHRoaXMgbW9kZWwgZWxlbWVudCBpcyByZXN0aW5nLiAgVGhpcyBpcyBudWxsIGlmIHRoZVxyXG4gICAgLy8gZWxlbWVudCBpcyBub3QgcmVzdGluZyBvbiBhIG1vdmFibGUgc3VyZmFjZS4gIFRoaXMgc2hvdWxkIG9ubHkgYmUgc2V0IHRocm91Z2ggdGhlIGdldHRlci9zZXR0ZXIgbWV0aG9kcyBiZWxvdy5cclxuICAgIHRoaXMuc3VwcG9ydGluZ1N1cmZhY2UgPSBudWxsO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge051bWJlclByb3BlcnR5fSAtIGluIG1ldGVycy9zZWNvbmRcclxuICAgIHRoaXMudmVydGljYWxWZWxvY2l0eVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIHJhbmdlOiBuZXcgUmFuZ2UoIC00LCAwICkgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBmb3IgcGhldC1pbzogYXNzaWduIHRhbmRlbSBpbiB0aGUgbW9kZWwgc28gdGhlIGNvcnJlc3BvbmRpbmcgbmFtZXMgY2FuIGJlIGxldmVyYWdlZCBpblxyXG4gICAgLy8gdGhlIHZpZXdcclxuICAgIHRoaXMudGFuZGVtID0gb3B0aW9ucy50YW5kZW07XHJcblxyXG4gICAgLy8gY3JlYXRlIHVzZXJDb250cm9sbGVkUHJvcGVydHkgdW5sZXNzIG9wdGVkIG91dFxyXG4gICAgaWYgKCBvcHRpb25zLnVzZXJDb250cm9sbGFibGUgKSB7XHJcblxyXG4gICAgICAvLyBAcHVibGljIHtCb29sZWFuUHJvcGVydHl9XHJcbiAgICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd1c2VyQ29udHJvbGxlZFByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICd3aGV0aGVyIHRoZSBlbGVtZW50IGlzIGJlaW5nIGRpcmVjdGx5IGhlbGQgb3IgbW92ZWQgYnkgYSB1c2VyJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICAvLyB1cGRhdGUgaW50ZXJuYWwgc3RhdGUgd2hlbiB0aGUgdXNlciBwaWNrcyB1cCB0aGlzIG1vZGVsIGVsZW1lbnRcclxuICAgICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgICBpZiAoIHVzZXJDb250cm9sbGVkICkge1xyXG5cclxuICAgICAgICAgIC8vIHRoZSB1c2VyIGhhcyBwaWNrZWQgdXAgdGhpcyBtb2RlbCBlbGVtZW50LCBzbyBpdCBpcyBubyBsb25nZXIgc2l0dGluZyBvbiBhbnkgc3VyZmFjZVxyXG4gICAgICAgICAgdGhpcy5jbGVhclN1cHBvcnRpbmdTdXJmYWNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBvYnNlcnZlciB0aGF0IG1vdmVzIHRoaXMgbW9kZWwgZWxlbWVudCBpZiBhbmQgd2hlbiB0aGUgc3VyZmFjZSB0aGF0IGlzIHN1cHBvcnRpbmcgaXQgbW92ZXNcclxuICAgIHRoaXMuc3VyZmFjZU1vdGlvbk9ic2VydmVyID0gcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSBwb3NpdGlvbjtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiByZXN0b3JlIGluaXRpYWwgc3RhdGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmNsZWFyU3VwcG9ydGluZ1N1cmZhY2UoKTtcclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSAmJiB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmVydGljYWxWZWxvY2l0eVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICBzdXBlci5yZXNldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBzdXBwb3J0aW5nIHN1cmZhY2Ugb2YgdGhpcyBtb2RlbCBlbGVtZW50XHJcbiAgICogQHBhcmFtIHtIb3Jpem9udGFsU3VyZmFjZX0gc3VwcG9ydGluZ1N1cmZhY2VcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0U3VwcG9ydGluZ1N1cmZhY2UoIHN1cHBvcnRpbmdTdXJmYWNlICkge1xyXG5cclxuICAgIC8vIHN0YXRlIGFuZCBwYXJhbWV0ZXIgY2hlY2tpbmdcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgIHN1cHBvcnRpbmdTdXJmYWNlICE9PSBudWxsLFxyXG4gICAgICAndGhpcyBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkIHRvIGNsZWFyIHRoZSBzdXBwb3J0aW5nIHN1cmZhY2UnXHJcbiAgICApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydChcclxuICAgICAgdGhpcy5zdXBwb3J0aW5nU3VyZmFjZSA9PT0gbnVsbCxcclxuICAgICAgJ2Egc3VwcG9ydGluZyBzdXJmYWNlIHdhcyBhbHJlYWR5IHNldCdcclxuICAgICk7XHJcblxyXG4gICAgc3VwcG9ydGluZ1N1cmZhY2UucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCB0aGlzLnN1cmZhY2VNb3Rpb25PYnNlcnZlciApO1xyXG4gICAgdGhpcy5zdXBwb3J0aW5nU3VyZmFjZSA9IHN1cHBvcnRpbmdTdXJmYWNlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogY2xlYXIgdGhlIHN1cHBvcnRpbmcgc3VyZmFjZSBzbyB0aGF0IHRoaXMgbW9kZWwgZWxlbWVudCBpcyBubyBsb25nZXIgc2l0dGluZyBvbiBhIHN1cmZhY2VcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGNsZWFyU3VwcG9ydGluZ1N1cmZhY2UoKSB7XHJcblxyXG4gICAgLy8gb25seSBkbyBzb21ldGhpbmcgaWYgdGhlIHN1cHBvcnRpbmcgc3VyZmFjZSB3YXMgc2V0XHJcbiAgICBpZiAoIHRoaXMuc3VwcG9ydGluZ1N1cmZhY2UgIT09IG51bGwgKSB7XHJcbiAgICAgIHRoaXMuc3VwcG9ydGluZ1N1cmZhY2UucG9zaXRpb25Qcm9wZXJ0eS51bmxpbmsoIHRoaXMuc3VyZmFjZU1vdGlvbk9ic2VydmVyICk7XHJcbiAgICAgIHRoaXMuc3VwcG9ydGluZ1N1cmZhY2UuZWxlbWVudE9uU3VyZmFjZVByb3BlcnR5LnNldCggbnVsbCApO1xyXG4gICAgICB0aGlzLnN1cHBvcnRpbmdTdXJmYWNlID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGdldCBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgdGhpcyBlbGVtZW50IGlzIHN0YWNrZWQgdXBvbiB0aGUgZ2l2ZW4gbW9kZWwgZWxlbWVudFxyXG4gICAqIEBwYXJhbSB7TW9kZWxFbGVtZW50fSBlbGVtZW50IC0gbW9kZWwgZWxlbWVudCB0byBiZSBjaGVja2VkXHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59IC0gdHJ1ZSBpZiB0aGlzIG1vZGVsIGVsZW1lbnQgaXMgc3RhY2tlZCBhbnl3aGVyZSBvbiB0b3Agb2YgdGhlIHByb3ZpZGVkIGVsZW1lbnQsIHdoaWNoXHJcbiAgICogaW5jbHVkZXMgY2FzZXMgd2hlcmUgb25lIG9yIG1vcmUgZWxlbWVudHMgYXJlIGluIGJldHdlZW4uXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGlzU3RhY2tlZFVwb24oIGVsZW1lbnQgKSB7XHJcbiAgICBjb25zdCBzdXJmYWNlID0gdGhpcy5zdXBwb3J0aW5nU3VyZmFjZSA/IHRoaXMuc3VwcG9ydGluZ1N1cmZhY2UgOiBudWxsO1xyXG4gICAgcmV0dXJuICggc3VyZmFjZSAhPT0gbnVsbCApICYmICggc3VyZmFjZS5vd25lciA9PT0gZWxlbWVudCB8fCBzdXJmYWNlLm93bmVyLmlzU3RhY2tlZFVwb24oIGVsZW1lbnQgKSApO1xyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnVXNlck1vdmFibGVNb2RlbEVsZW1lbnQnLCBVc2VyTW92YWJsZU1vZGVsRWxlbWVudCApO1xyXG5leHBvcnQgZGVmYXVsdCBVc2VyTW92YWJsZU1vZGVsRWxlbWVudDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxjQUFjLE1BQU0sdUNBQXVDO0FBQ2xFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDLE1BQU1DLHVCQUF1QixTQUFTRCxZQUFZLENBQUM7RUFFakQ7QUFDRjtBQUNBO0FBQ0E7RUFDRUUsV0FBV0EsQ0FBRUMsZUFBZSxFQUFFQyxPQUFPLEVBQUc7SUFFdENBLE9BQU8sR0FBR1AsS0FBSyxDQUFFO01BQ2ZRLE1BQU0sRUFBRVAsTUFBTSxDQUFDUSxRQUFRO01BQ3ZCQyxnQkFBZ0IsRUFBRTtJQUNwQixDQUFDLEVBQUVILE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FBRUQsZUFBZSxFQUFFQyxPQUFRLENBQUM7O0lBRWpDO0lBQ0E7SUFDQSxJQUFJLENBQUNJLGlCQUFpQixHQUFHLElBQUk7O0lBRTdCO0lBQ0EsSUFBSSxDQUFDQyx3QkFBd0IsR0FBRyxJQUFJZCxjQUFjLENBQUUsQ0FBQyxFQUFFO01BQ3JEZSxLQUFLLEVBQUUsSUFBSWQsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0EsSUFBSSxDQUFDUyxNQUFNLEdBQUdELE9BQU8sQ0FBQ0MsTUFBTTs7SUFFNUI7SUFDQSxJQUFLRCxPQUFPLENBQUNH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