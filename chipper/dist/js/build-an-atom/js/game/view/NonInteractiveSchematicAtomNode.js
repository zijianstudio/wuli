// Copyright 2013-2022, University of Colorado Boulder

/**
 * A non-interactive representation of an atom where the individual sub-atomic particles are visible.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import { Node } from '../../../../scenery/js/imports.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import AtomNode from '../../../../shred/js/view/AtomNode.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import buildAnAtom from '../../buildAnAtom.js';
import BAAGlobalPreferences from '../../common/BAAGlobalPreferences.js';
import BAAScreenView from '../../common/view/BAAScreenView.js';
class NonInteractiveSchematicAtomNode extends Node {
  /**
   * @param {NumberAtom} numberAtom
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor(numberAtom, modelViewTransform, tandem) {
    super({
      pickable: false
    });

    // Add the electron shells.
    const particleAtom = new ParticleAtom({
      tandem: tandem.createTandem('particleAtom')
    });
    const atomNode = new AtomNode(particleAtom, modelViewTransform, {
      showElementNameProperty: new Property(false),
      showNeutralOrIonProperty: new Property(false),
      showStableOrUnstableProperty: new Property(false),
      tandem: tandem.createTandem('atomNode')
    });
    this.addChild(atomNode);

    // Layer where the particles go.
    const particleLayer = new Node();
    this.addChild(particleLayer);

    // Utility function to create and add particles.
    const particleTandem = tandem.createTandem('particles');
    const particleViewsTandem = tandem.createTandem('particleView');
    const particleViews = [];
    let modelParticles = []; // (phet-io) keep track for disposal
    const createAndAddParticles = (particleType, number) => {
      _.times(number, index => {
        const particle = new Particle(particleType, {
          tandem: particleTandem.createTandem(`particle${index}`),
          maxZLayer: BAAScreenView.NUM_NUCLEON_LAYERS - 1
        });
        modelParticles.push(particle);
        particleAtom.addParticle(particle);
        const particleView = new ParticleView(particle, modelViewTransform, {
          highContrastProperty: BAAGlobalPreferences.highContrastParticlesProperty,
          tandem: particleViewsTandem.createTandem(`particleView${index}`)
        });
        particleLayer.addChild(particleView);
        particleViews.push(particleView);
      });
    };

    // Create and add the individual particles.
    createAndAddParticles('proton', numberAtom.protonCountProperty.get());
    createAndAddParticles('neutron', numberAtom.neutronCountProperty.get());
    createAndAddParticles('electron', numberAtom.electronCountProperty.get());
    particleAtom.moveAllParticlesToDestination();

    // Layer the particle views so that the nucleus looks good, with the
    // particles closer to the center being higher in the z-order.
    let particleViewsInNucleus = _.filter(particleLayer.children, particleView => particleView.particle.destinationProperty.get().distance(particleAtom.positionProperty.get()) < particleAtom.innerElectronShellRadius);
    if (particleViewsInNucleus.length > 3) {
      particleViewsInNucleus = _.sortBy(particleViewsInNucleus, particleView => -particleView.particle.destinationProperty.get().distance(particleAtom.positionProperty.get()));
      particleViewsInNucleus.forEach(particleView => {
        particleLayer.removeChild(particleView);
        particleLayer.addChild(particleView);
      });
    }

    // @private called by dispose
    this.disposeNonInteractiveSchematicAtomNode = () => {
      particleViews.forEach(particleView => {
        particleView.dispose();
      });
      atomNode.dispose();
      particleAtom.dispose();
      particleLayer.children.forEach(particleView => {
        particleView.dispose();
      });
      particleLayer.dispose();
      modelParticles.forEach(particle => {
        particle.dispose();
      });
      modelParticles = [];
    };
  }

  // @public
  dispose() {
    this.disposeNonInteractiveSchematicAtomNode();
    super.dispose();
  }
}
buildAnAtom.register('NonInteractiveSchematicAtomNode', NonInteractiveSchematicAtomNode);
export default NonInteractiveSchematicAtomNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIk5vZGUiLCJQYXJ0aWNsZSIsIlBhcnRpY2xlQXRvbSIsIkF0b21Ob2RlIiwiUGFydGljbGVWaWV3IiwiYnVpbGRBbkF0b20iLCJCQUFHbG9iYWxQcmVmZXJlbmNlcyIsIkJBQVNjcmVlblZpZXciLCJOb25JbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b21Ob2RlIiwiY29uc3RydWN0b3IiLCJudW1iZXJBdG9tIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwidGFuZGVtIiwicGlja2FibGUiLCJwYXJ0aWNsZUF0b20iLCJjcmVhdGVUYW5kZW0iLCJhdG9tTm9kZSIsInNob3dFbGVtZW50TmFtZVByb3BlcnR5Iiwic2hvd05ldXRyYWxPcklvblByb3BlcnR5Iiwic2hvd1N0YWJsZU9yVW5zdGFibGVQcm9wZXJ0eSIsImFkZENoaWxkIiwicGFydGljbGVMYXllciIsInBhcnRpY2xlVGFuZGVtIiwicGFydGljbGVWaWV3c1RhbmRlbSIsInBhcnRpY2xlVmlld3MiLCJtb2RlbFBhcnRpY2xlcyIsImNyZWF0ZUFuZEFkZFBhcnRpY2xlcyIsInBhcnRpY2xlVHlwZSIsIm51bWJlciIsIl8iLCJ0aW1lcyIsImluZGV4IiwicGFydGljbGUiLCJtYXhaTGF5ZXIiLCJOVU1fTlVDTEVPTl9MQVlFUlMiLCJwdXNoIiwiYWRkUGFydGljbGUiLCJwYXJ0aWNsZVZpZXciLCJoaWdoQ29udHJhc3RQcm9wZXJ0eSIsImhpZ2hDb250cmFzdFBhcnRpY2xlc1Byb3BlcnR5IiwicHJvdG9uQ291bnRQcm9wZXJ0eSIsImdldCIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwiZWxlY3Ryb25Db3VudFByb3BlcnR5IiwibW92ZUFsbFBhcnRpY2xlc1RvRGVzdGluYXRpb24iLCJwYXJ0aWNsZVZpZXdzSW5OdWNsZXVzIiwiZmlsdGVyIiwiY2hpbGRyZW4iLCJkZXN0aW5hdGlvblByb3BlcnR5IiwiZGlzdGFuY2UiLCJwb3NpdGlvblByb3BlcnR5IiwiaW5uZXJFbGVjdHJvblNoZWxsUmFkaXVzIiwibGVuZ3RoIiwic29ydEJ5IiwiZm9yRWFjaCIsInJlbW92ZUNoaWxkIiwiZGlzcG9zZU5vbkludGVyYWN0aXZlU2NoZW1hdGljQXRvbU5vZGUiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOb25JbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b21Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbm9uLWludGVyYWN0aXZlIHJlcHJlc2VudGF0aW9uIG9mIGFuIGF0b20gd2hlcmUgdGhlIGluZGl2aWR1YWwgc3ViLWF0b21pYyBwYXJ0aWNsZXMgYXJlIHZpc2libGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUGFydGljbGUgZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGUuanMnO1xyXG5pbXBvcnQgUGFydGljbGVBdG9tIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL21vZGVsL1BhcnRpY2xlQXRvbS5qcyc7XHJcbmltcG9ydCBBdG9tTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L0F0b21Ob2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlVmlldyBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L1BhcnRpY2xlVmlldy5qcyc7XHJcbmltcG9ydCBidWlsZEFuQXRvbSBmcm9tICcuLi8uLi9idWlsZEFuQXRvbS5qcyc7XHJcbmltcG9ydCBCQUFHbG9iYWxQcmVmZXJlbmNlcyBmcm9tICcuLi8uLi9jb21tb24vQkFBR2xvYmFsUHJlZmVyZW5jZXMuanMnO1xyXG5pbXBvcnQgQkFBU2NyZWVuVmlldyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9CQUFTY3JlZW5WaWV3LmpzJztcclxuXHJcbmNsYXNzIE5vbkludGVyYWN0aXZlU2NoZW1hdGljQXRvbU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBudW1iZXJBdG9tXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge1RhbmRlbX0gdGFuZGVtXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG51bWJlckF0b20sIG1vZGVsVmlld1RyYW5zZm9ybSwgdGFuZGVtICkge1xyXG4gICAgc3VwZXIoIHsgcGlja2FibGU6IGZhbHNlIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGVsZWN0cm9uIHNoZWxscy5cclxuICAgIGNvbnN0IHBhcnRpY2xlQXRvbSA9IG5ldyBQYXJ0aWNsZUF0b20oIHsgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncGFydGljbGVBdG9tJyApIH0gKTtcclxuICAgIGNvbnN0IGF0b21Ob2RlID0gbmV3IEF0b21Ob2RlKCBwYXJ0aWNsZUF0b20sIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICBzaG93RWxlbWVudE5hbWVQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBmYWxzZSApLFxyXG4gICAgICBzaG93TmV1dHJhbE9ySW9uUHJvcGVydHk6IG5ldyBQcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgc2hvd1N0YWJsZU9yVW5zdGFibGVQcm9wZXJ0eTogbmV3IFByb3BlcnR5KCBmYWxzZSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdhdG9tTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggYXRvbU5vZGUgKTtcclxuXHJcbiAgICAvLyBMYXllciB3aGVyZSB0aGUgcGFydGljbGVzIGdvLlxyXG4gICAgY29uc3QgcGFydGljbGVMYXllciA9IG5ldyBOb2RlKCk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwYXJ0aWNsZUxheWVyICk7XHJcblxyXG4gICAgLy8gVXRpbGl0eSBmdW5jdGlvbiB0byBjcmVhdGUgYW5kIGFkZCBwYXJ0aWNsZXMuXHJcbiAgICBjb25zdCBwYXJ0aWNsZVRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXJ0aWNsZXMnICk7XHJcbiAgICBjb25zdCBwYXJ0aWNsZVZpZXdzVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcnRpY2xlVmlldycgKTtcclxuICAgIGNvbnN0IHBhcnRpY2xlVmlld3MgPSBbXTtcclxuICAgIGxldCBtb2RlbFBhcnRpY2xlcyA9IFtdOyAvLyAocGhldC1pbykga2VlcCB0cmFjayBmb3IgZGlzcG9zYWxcclxuICAgIGNvbnN0IGNyZWF0ZUFuZEFkZFBhcnRpY2xlcyA9ICggcGFydGljbGVUeXBlLCBudW1iZXIgKSA9PiB7XHJcbiAgICAgIF8udGltZXMoIG51bWJlciwgaW5kZXggPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlID0gbmV3IFBhcnRpY2xlKCBwYXJ0aWNsZVR5cGUsIHtcclxuICAgICAgICAgIHRhbmRlbTogcGFydGljbGVUYW5kZW0uY3JlYXRlVGFuZGVtKCBgcGFydGljbGUke2luZGV4fWAgKSxcclxuICAgICAgICAgIG1heFpMYXllcjogQkFBU2NyZWVuVmlldy5OVU1fTlVDTEVPTl9MQVlFUlMgLSAxXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIG1vZGVsUGFydGljbGVzLnB1c2goIHBhcnRpY2xlICk7XHJcbiAgICAgICAgcGFydGljbGVBdG9tLmFkZFBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlVmlldyA9IG5ldyBQYXJ0aWNsZVZpZXcoIHBhcnRpY2xlLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgICAgIGhpZ2hDb250cmFzdFByb3BlcnR5OiBCQUFHbG9iYWxQcmVmZXJlbmNlcy5oaWdoQ29udHJhc3RQYXJ0aWNsZXNQcm9wZXJ0eSxcclxuICAgICAgICAgIHRhbmRlbTogcGFydGljbGVWaWV3c1RhbmRlbS5jcmVhdGVUYW5kZW0oIGBwYXJ0aWNsZVZpZXcke2luZGV4fWAgKVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBwYXJ0aWNsZUxheWVyLmFkZENoaWxkKCBwYXJ0aWNsZVZpZXcgKTtcclxuICAgICAgICBwYXJ0aWNsZVZpZXdzLnB1c2goIHBhcnRpY2xlVmlldyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIHRoZSBpbmRpdmlkdWFsIHBhcnRpY2xlcy5cclxuICAgIGNyZWF0ZUFuZEFkZFBhcnRpY2xlcyggJ3Byb3RvbicsIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgY3JlYXRlQW5kQWRkUGFydGljbGVzKCAnbmV1dHJvbicsIG51bWJlckF0b20ubmV1dHJvbkNvdW50UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIGNyZWF0ZUFuZEFkZFBhcnRpY2xlcyggJ2VsZWN0cm9uJywgbnVtYmVyQXRvbS5lbGVjdHJvbkNvdW50UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIHBhcnRpY2xlQXRvbS5tb3ZlQWxsUGFydGljbGVzVG9EZXN0aW5hdGlvbigpO1xyXG5cclxuICAgIC8vIExheWVyIHRoZSBwYXJ0aWNsZSB2aWV3cyBzbyB0aGF0IHRoZSBudWNsZXVzIGxvb2tzIGdvb2QsIHdpdGggdGhlXHJcbiAgICAvLyBwYXJ0aWNsZXMgY2xvc2VyIHRvIHRoZSBjZW50ZXIgYmVpbmcgaGlnaGVyIGluIHRoZSB6LW9yZGVyLlxyXG4gICAgbGV0IHBhcnRpY2xlVmlld3NJbk51Y2xldXMgPSBfLmZpbHRlciggcGFydGljbGVMYXllci5jaGlsZHJlbiwgcGFydGljbGVWaWV3ID0+IHBhcnRpY2xlVmlldy5wYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBwYXJ0aWNsZUF0b20ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKSApIDwgcGFydGljbGVBdG9tLmlubmVyRWxlY3Ryb25TaGVsbFJhZGl1cyApO1xyXG5cclxuICAgIGlmICggcGFydGljbGVWaWV3c0luTnVjbGV1cy5sZW5ndGggPiAzICkge1xyXG4gICAgICBwYXJ0aWNsZVZpZXdzSW5OdWNsZXVzID0gXy5zb3J0QnkoIHBhcnRpY2xlVmlld3NJbk51Y2xldXMsIHBhcnRpY2xlVmlldyA9PiAtcGFydGljbGVWaWV3LnBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHBhcnRpY2xlQXRvbS5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgKTtcclxuICAgICAgcGFydGljbGVWaWV3c0luTnVjbGV1cy5mb3JFYWNoKCBwYXJ0aWNsZVZpZXcgPT4ge1xyXG4gICAgICAgIHBhcnRpY2xlTGF5ZXIucmVtb3ZlQ2hpbGQoIHBhcnRpY2xlVmlldyApO1xyXG4gICAgICAgIHBhcnRpY2xlTGF5ZXIuYWRkQ2hpbGQoIHBhcnRpY2xlVmlldyApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQHByaXZhdGUgY2FsbGVkIGJ5IGRpc3Bvc2VcclxuICAgIHRoaXMuZGlzcG9zZU5vbkludGVyYWN0aXZlU2NoZW1hdGljQXRvbU5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHBhcnRpY2xlVmlld3MuZm9yRWFjaCggcGFydGljbGVWaWV3ID0+IHtcclxuICAgICAgICBwYXJ0aWNsZVZpZXcuZGlzcG9zZSgpO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGF0b21Ob2RlLmRpc3Bvc2UoKTtcclxuICAgICAgcGFydGljbGVBdG9tLmRpc3Bvc2UoKTtcclxuICAgICAgcGFydGljbGVMYXllci5jaGlsZHJlbi5mb3JFYWNoKCBwYXJ0aWNsZVZpZXcgPT4geyBwYXJ0aWNsZVZpZXcuZGlzcG9zZSgpOyB9ICk7XHJcbiAgICAgIHBhcnRpY2xlTGF5ZXIuZGlzcG9zZSgpO1xyXG4gICAgICBtb2RlbFBhcnRpY2xlcy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7IHBhcnRpY2xlLmRpc3Bvc2UoKTsgfSApO1xyXG4gICAgICBtb2RlbFBhcnRpY2xlcyA9IFtdO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlTm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNBdG9tTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdOb25JbnRlcmFjdGl2ZVNjaGVtYXRpY0F0b21Ob2RlJywgTm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNBdG9tTm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgTm9uSW50ZXJhY3RpdmVTY2hlbWF0aWNBdG9tTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSx3Q0FBd0M7QUFDN0QsT0FBT0MsWUFBWSxNQUFNLDRDQUE0QztBQUNyRSxPQUFPQyxRQUFRLE1BQU0sdUNBQXVDO0FBQzVELE9BQU9DLFlBQVksTUFBTSwyQ0FBMkM7QUFDcEUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxvQkFBb0IsTUFBTSxzQ0FBc0M7QUFDdkUsT0FBT0MsYUFBYSxNQUFNLG9DQUFvQztBQUU5RCxNQUFNQywrQkFBK0IsU0FBU1IsSUFBSSxDQUFDO0VBRWpEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRVMsV0FBV0EsQ0FBRUMsVUFBVSxFQUFFQyxrQkFBa0IsRUFBRUMsTUFBTSxFQUFHO0lBQ3BELEtBQUssQ0FBRTtNQUFFQyxRQUFRLEVBQUU7SUFBTSxDQUFFLENBQUM7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