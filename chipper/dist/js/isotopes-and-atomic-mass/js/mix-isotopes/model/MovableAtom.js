// Copyright 2015-2020, University of Colorado Boulder

/**
 * This class represents an atom that can move around but is otherwise immutable. It was created due to a need to
 * represent atoms as single entities rather than as a collection of particles. At the time of this writing, this class
 * is used only in the Isotopes flavor of this simulation.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 */

//modules
import Particle from '../../../../shred/js/model/Particle.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ImmutableAtomConfig from './ImmutableAtomConfig.js';

// class variables
let instanceCount = 0;
class MovableAtom extends Particle {
  /**
   * @param {number} numProtons
   * @param {number} numNeutrons
   * @param {Vector2} initialPosition
   * @constructor
   */
  constructor(numProtons, numNeutrons, initialPosition) {
    super('Isotope');
    this.positionProperty.set(initialPosition); // @public
    this.destinationProperty.set(initialPosition); // @public

    // @public
    this.atomConfiguration = new ImmutableAtomConfig(numProtons, numNeutrons, numProtons);
    this.showLabel = true; // @public
    this.instanceCount = instanceCount++;
  }
}
isotopesAndAtomicMass.register('MovableAtom', MovableAtom);
export default MovableAtom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYXJ0aWNsZSIsImlzb3RvcGVzQW5kQXRvbWljTWFzcyIsIkltbXV0YWJsZUF0b21Db25maWciLCJpbnN0YW5jZUNvdW50IiwiTW92YWJsZUF0b20iLCJjb25zdHJ1Y3RvciIsIm51bVByb3RvbnMiLCJudW1OZXV0cm9ucyIsImluaXRpYWxQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJzZXQiLCJkZXN0aW5hdGlvblByb3BlcnR5IiwiYXRvbUNvbmZpZ3VyYXRpb24iLCJzaG93TGFiZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1vdmFibGVBdG9tLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjAsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoaXMgY2xhc3MgcmVwcmVzZW50cyBhbiBhdG9tIHRoYXQgY2FuIG1vdmUgYXJvdW5kIGJ1dCBpcyBvdGhlcndpc2UgaW1tdXRhYmxlLiBJdCB3YXMgY3JlYXRlZCBkdWUgdG8gYSBuZWVkIHRvXHJcbiAqIHJlcHJlc2VudCBhdG9tcyBhcyBzaW5nbGUgZW50aXRpZXMgcmF0aGVyIHRoYW4gYXMgYSBjb2xsZWN0aW9uIG9mIHBhcnRpY2xlcy4gQXQgdGhlIHRpbWUgb2YgdGhpcyB3cml0aW5nLCB0aGlzIGNsYXNzXHJcbiAqIGlzIHVzZWQgb25seSBpbiB0aGUgSXNvdG9wZXMgZmxhdm9yIG9mIHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKiBAYXV0aG9yIEphbWVzIFNtaXRoXHJcbiAqL1xyXG5cclxuXHJcbi8vbW9kdWxlc1xyXG5pbXBvcnQgUGFydGljbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGUuanMnO1xyXG5pbXBvcnQgaXNvdG9wZXNBbmRBdG9taWNNYXNzIGZyb20gJy4uLy4uL2lzb3RvcGVzQW5kQXRvbWljTWFzcy5qcyc7XHJcbmltcG9ydCBJbW11dGFibGVBdG9tQ29uZmlnIGZyb20gJy4vSW1tdXRhYmxlQXRvbUNvbmZpZy5qcyc7XHJcblxyXG4vLyBjbGFzcyB2YXJpYWJsZXNcclxubGV0IGluc3RhbmNlQ291bnQgPSAwO1xyXG5cclxuY2xhc3MgTW92YWJsZUF0b20gZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Qcm90b25zXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bU5ldXRyb25zXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsUG9zaXRpb25cclxuICAgKiBAY29uc3RydWN0b3JcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMsIGluaXRpYWxQb3NpdGlvbiApIHtcclxuICAgIHN1cGVyKCAnSXNvdG9wZScgKTtcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5zZXQoIGluaXRpYWxQb3NpdGlvbiApOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCBpbml0aWFsUG9zaXRpb24gKTsgLy8gQHB1YmxpY1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuYXRvbUNvbmZpZ3VyYXRpb24gPSBuZXcgSW1tdXRhYmxlQXRvbUNvbmZpZyggbnVtUHJvdG9ucywgbnVtTmV1dHJvbnMsIG51bVByb3RvbnMgKTtcclxuICAgIHRoaXMuc2hvd0xhYmVsID0gdHJ1ZTsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5pbnN0YW5jZUNvdW50ID0gaW5zdGFuY2VDb3VudCsrO1xyXG4gIH1cclxufVxyXG5cclxuaXNvdG9wZXNBbmRBdG9taWNNYXNzLnJlZ2lzdGVyKCAnTW92YWJsZUF0b20nLCBNb3ZhYmxlQXRvbSApO1xyXG5leHBvcnQgZGVmYXVsdCBNb3ZhYmxlQXRvbTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQTtBQUNBLE9BQU9BLFFBQVEsTUFBTSx3Q0FBd0M7QUFDN0QsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjs7QUFFMUQ7QUFDQSxJQUFJQyxhQUFhLEdBQUcsQ0FBQztBQUVyQixNQUFNQyxXQUFXLFNBQVNKLFFBQVEsQ0FBQztFQUVqQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUssV0FBV0EsQ0FBRUMsVUFBVSxFQUFFQyxXQUFXLEVBQUVDLGVBQWUsRUFBRztJQUN0RCxLQUFLLENBQUUsU0FBVSxDQUFDO0lBQ2xCLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNDLEdBQUcsQ0FBRUYsZUFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDOUMsSUFBSSxDQUFDRyxtQkFBbUIsQ0FBQ0QsR0FBRyxDQUFFRixlQUFnQixDQUFDLENBQUMsQ0FBQzs7SUFFakQ7SUFDQSxJQUFJLENBQUNJLGlCQUFpQixHQUFHLElBQUlWLG1CQUFtQixDQUFFSSxVQUFVLEVBQUVDLFdBQVcsRUFBRUQsVUFBVyxDQUFDO0lBQ3ZGLElBQUksQ0FBQ08sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLElBQUksQ0FBQ1YsYUFBYSxHQUFHQSxhQUFhLEVBQUU7RUFDdEM7QUFDRjtBQUVBRixxQkFBcUIsQ0FBQ2EsUUFBUSxDQUFFLGFBQWEsRUFBRVYsV0FBWSxDQUFDO0FBQzVELGVBQWVBLFdBQVcifQ==