// Copyright 2022-2023, University of Colorado Boulder

/**
 * Creates Particle's when pressed down on.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { DragListener, Node } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import Particle from '../../../../shred/js/model/Particle.js';
import BANConstants from '../BANConstants.js';
class NucleonCreatorNode extends Node {
  constructor(particleType, screenView, particleViewPositionVector) {
    super();
    const targetNode = new ParticleNode(particleType.name.toLowerCase(), BANConstants.PARTICLE_RADIUS);
    this.addChild(targetNode);
    this.touchArea = this.localBounds.dilated(10);
    this.addInputListener(DragListener.createForwardingListener(event => {
      // We want this relative to the screen view, so it is guaranteed to be the proper view coordinates.
      const viewPosition = screenView.globalToLocalPoint(event.pointer.point);
      const particle = new Particle(particleType.name.toLowerCase(), {
        maxZLayer: BANConstants.NUMBER_OF_NUCLEON_LAYERS - 1
      });
      particle.animationVelocityProperty.value = BANConstants.PARTICLE_ANIMATION_SPEED;

      // Once we have the number's bounds, we set the position so that our pointer is in the middle of the drag target.
      particle.setPositionAndDestination(viewPosition.minus(particleViewPositionVector).minus(particle.positionProperty.value));

      // Create and start dragging the new particle
      screenView.addAndDragParticle(event, particle);
    }));
  }
}
buildANucleus.register('NucleonCreatorNode', NucleonCreatorNode);
export default NucleonCreatorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFnTGlzdGVuZXIiLCJOb2RlIiwiYnVpbGRBTnVjbGV1cyIsIlBhcnRpY2xlTm9kZSIsIlBhcnRpY2xlIiwiQkFOQ29uc3RhbnRzIiwiTnVjbGVvbkNyZWF0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJwYXJ0aWNsZVR5cGUiLCJzY3JlZW5WaWV3IiwicGFydGljbGVWaWV3UG9zaXRpb25WZWN0b3IiLCJ0YXJnZXROb2RlIiwibmFtZSIsInRvTG93ZXJDYXNlIiwiUEFSVElDTEVfUkFESVVTIiwiYWRkQ2hpbGQiLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWQiLCJhZGRJbnB1dExpc3RlbmVyIiwiY3JlYXRlRm9yd2FyZGluZ0xpc3RlbmVyIiwiZXZlbnQiLCJ2aWV3UG9zaXRpb24iLCJnbG9iYWxUb0xvY2FsUG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJwYXJ0aWNsZSIsIm1heFpMYXllciIsIk5VTUJFUl9PRl9OVUNMRU9OX0xBWUVSUyIsImFuaW1hdGlvblZlbG9jaXR5UHJvcGVydHkiLCJ2YWx1ZSIsIlBBUlRJQ0xFX0FOSU1BVElPTl9TUEVFRCIsInNldFBvc2l0aW9uQW5kRGVzdGluYXRpb24iLCJtaW51cyIsInBvc2l0aW9uUHJvcGVydHkiLCJhZGRBbmREcmFnUGFydGljbGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk51Y2xlb25DcmVhdG9yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIFBhcnRpY2xlJ3Mgd2hlbiBwcmVzc2VkIGRvd24gb24uXHJcbiAqXHJcbiAqIEBhdXRob3IgTHVpc2EgVmFyZ2FzXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBEcmFnTGlzdGVuZXIsIE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgYnVpbGRBTnVjbGV1cyBmcm9tICcuLi8uLi9idWlsZEFOdWNsZXVzLmpzJztcclxuaW1wb3J0IEJBTlNjcmVlblZpZXcgZnJvbSAnLi9CQU5TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFBhcnRpY2xlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L1BhcnRpY2xlTm9kZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZVR5cGUgZnJvbSAnLi9QYXJ0aWNsZVR5cGUuanMnO1xyXG5pbXBvcnQgUGFydGljbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGUuanMnO1xyXG5pbXBvcnQgQkFOTW9kZWwgZnJvbSAnLi4vbW9kZWwvQkFOTW9kZWwuanMnO1xyXG5pbXBvcnQgQkFOQ29uc3RhbnRzIGZyb20gJy4uL0JBTkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZUF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGVBdG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5cclxuY2xhc3MgTnVjbGVvbkNyZWF0b3JOb2RlPFQgZXh0ZW5kcyBQYXJ0aWNsZUF0b20+IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcGFydGljbGVUeXBlOiBQYXJ0aWNsZVR5cGUsIHNjcmVlblZpZXc6IEJBTlNjcmVlblZpZXc8QkFOTW9kZWw8VD4+LCBwYXJ0aWNsZVZpZXdQb3NpdGlvblZlY3RvcjogVmVjdG9yMiApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgY29uc3QgdGFyZ2V0Tm9kZSA9IG5ldyBQYXJ0aWNsZU5vZGUoIHBhcnRpY2xlVHlwZS5uYW1lLnRvTG93ZXJDYXNlKCksIEJBTkNvbnN0YW50cy5QQVJUSUNMRV9SQURJVVMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRhcmdldE5vZGUgKTtcclxuICAgIHRoaXMudG91Y2hBcmVhID0gdGhpcy5sb2NhbEJvdW5kcy5kaWxhdGVkKCAxMCApO1xyXG5cclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggRHJhZ0xpc3RlbmVyLmNyZWF0ZUZvcndhcmRpbmdMaXN0ZW5lciggZXZlbnQgPT4ge1xyXG5cclxuICAgICAgLy8gV2Ugd2FudCB0aGlzIHJlbGF0aXZlIHRvIHRoZSBzY3JlZW4gdmlldywgc28gaXQgaXMgZ3VhcmFudGVlZCB0byBiZSB0aGUgcHJvcGVyIHZpZXcgY29vcmRpbmF0ZXMuXHJcbiAgICAgIGNvbnN0IHZpZXdQb3NpdGlvbiA9IHNjcmVlblZpZXcuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcbiAgICAgIGNvbnN0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKCBwYXJ0aWNsZVR5cGUubmFtZS50b0xvd2VyQ2FzZSgpLCB7XHJcbiAgICAgICAgbWF4WkxheWVyOiBCQU5Db25zdGFudHMuTlVNQkVSX09GX05VQ0xFT05fTEFZRVJTIC0gMVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHBhcnRpY2xlLmFuaW1hdGlvblZlbG9jaXR5UHJvcGVydHkudmFsdWUgPSBCQU5Db25zdGFudHMuUEFSVElDTEVfQU5JTUFUSU9OX1NQRUVEO1xyXG5cclxuICAgICAgLy8gT25jZSB3ZSBoYXZlIHRoZSBudW1iZXIncyBib3VuZHMsIHdlIHNldCB0aGUgcG9zaXRpb24gc28gdGhhdCBvdXIgcG9pbnRlciBpcyBpbiB0aGUgbWlkZGxlIG9mIHRoZSBkcmFnIHRhcmdldC5cclxuICAgICAgcGFydGljbGUuc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbihcclxuICAgICAgICB2aWV3UG9zaXRpb24ubWludXMoIHBhcnRpY2xlVmlld1Bvc2l0aW9uVmVjdG9yICkubWludXMoIHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBzdGFydCBkcmFnZ2luZyB0aGUgbmV3IHBhcnRpY2xlXHJcbiAgICAgIHNjcmVlblZpZXcuYWRkQW5kRHJhZ1BhcnRpY2xlKCBldmVudCwgcGFydGljbGUgKTtcclxuICAgIH0gKSApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTnVjbGV1cy5yZWdpc3RlciggJ051Y2xlb25DcmVhdG9yTm9kZScsIE51Y2xlb25DcmVhdG9yTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBOdWNsZW9uQ3JlYXRvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsWUFBWSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3RFLE9BQU9DLGFBQWEsTUFBTSx3QkFBd0I7QUFFbEQsT0FBT0MsWUFBWSxNQUFNLDJDQUEyQztBQUVwRSxPQUFPQyxRQUFRLE1BQU0sd0NBQXdDO0FBRTdELE9BQU9DLFlBQVksTUFBTSxvQkFBb0I7QUFJN0MsTUFBTUMsa0JBQWtCLFNBQWlDTCxJQUFJLENBQUM7RUFFckRNLFdBQVdBLENBQUVDLFlBQTBCLEVBQUVDLFVBQXNDLEVBQUVDLDBCQUFtQyxFQUFHO0lBQzVILEtBQUssQ0FBQyxDQUFDO0lBRVAsTUFBTUMsVUFBVSxHQUFHLElBQUlSLFlBQVksQ0FBRUssWUFBWSxDQUFDSSxJQUFJLENBQUNDLFdBQVcsQ0FBQyxDQUFDLEVBQUVSLFlBQVksQ0FBQ1MsZUFBZ0IsQ0FBQztJQUNwRyxJQUFJLENBQUNDLFFBQVEsQ0FBRUosVUFBVyxDQUFDO0lBQzNCLElBQUksQ0FBQ0ssU0FBUyxHQUFHLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxPQUFPLENBQUUsRUFBRyxDQUFDO0lBRS9DLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUVuQixZQUFZLENBQUNvQix3QkFBd0IsQ0FBRUMsS0FBSyxJQUFJO01BRXJFO01BQ0EsTUFBTUMsWUFBWSxHQUFHYixVQUFVLENBQUNjLGtCQUFrQixDQUFFRixLQUFLLENBQUNHLE9BQU8sQ0FBQ0MsS0FBTSxDQUFDO01BQ3pFLE1BQU1DLFFBQVEsR0FBRyxJQUFJdEIsUUFBUSxDQUFFSSxZQUFZLENBQUNJLElBQUksQ0FBQ0MsV0FBVyxDQUFDLENBQUMsRUFBRTtRQUM5RGMsU0FBUyxFQUFFdEIsWUFBWSxDQUFDdUIsd0JBQXdCLEdBQUc7TUFDckQsQ0FBRSxDQUFDO01BQ0hGLFFBQVEsQ0FBQ0cseUJBQXlCLENBQUNDLEtBQUssR0FBR3pCLFlBQVksQ0FBQzBCLHdCQUF3Qjs7TUFFaEY7TUFDQUwsUUFBUSxDQUFDTSx5QkFBeUIsQ0FDaENWLFlBQVksQ0FBQ1csS0FBSyxDQUFFdkIsMEJBQTJCLENBQUMsQ0FBQ3VCLEtBQUssQ0FBRVAsUUFBUSxDQUFDUSxnQkFBZ0IsQ0FBQ0osS0FBTSxDQUMxRixDQUFDOztNQUVEO01BQ0FyQixVQUFVLENBQUMwQixrQkFBa0IsQ0FBRWQsS0FBSyxFQUFFSyxRQUFTLENBQUM7SUFDbEQsQ0FBRSxDQUFFLENBQUM7RUFDUDtBQUNGO0FBRUF4QixhQUFhLENBQUNrQyxRQUFRLENBQUUsb0JBQW9CLEVBQUU5QixrQkFBbUIsQ0FBQztBQUNsRSxlQUFlQSxrQkFBa0IifQ==