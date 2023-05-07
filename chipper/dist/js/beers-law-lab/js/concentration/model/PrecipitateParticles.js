// Copyright 2013-2023, University of Colorado Boulder

/**
 * PrecipitateParticles manages the creation and deletion of solute particles that form on the bottom of
 * the beaker as precipitate.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import beersLawLab from '../../beersLawLab.js';
import SoluteParticles from './SoluteParticles.js';
export default class PrecipitateParticles extends SoluteParticles {
  constructor(solution, beaker, providedOptions) {
    const options = optionize()({
      // SoluteParticlesOptions
      particleGroupDocumentation: 'Dynamically creates solute particles for the precipitate'
    }, providedOptions);
    super(solution.soluteProperty, options);
    this.solution = solution;
    this.beaker = beaker;

    // when the saturation changes, update the number of precipitate particles
    this.solution.precipitateMolesProperty.link(() => this.updateParticles());

    // when the solute changes, remove all particles and create new particles for the solute
    this.solution.soluteProperty.link(solute => {
      // Remove all particles, unless solute was being restored by PhET-iO. Particles will be restored by particleGroup.
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.removeAllParticles();
        this.updateParticles();
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }

  /*
   * Adds/removes particles to match the model. To optimize performance, clients who register for the 'change'
   * callback will assume that particles are added/removed from the end of the 'particles' array.
   * See https://github.com/phetsims/beers-law-lab/issues/48
   */
  updateParticles() {
    // number of particles desired after this update
    const numberOfParticles = this.solution.getNumberOfPrecipitateParticles();
    if (numberOfParticles === this.numberOfParticles) {
      return; // no change, do nothing
    } else if (numberOfParticles < this.numberOfParticles) {
      this.removeParticles(this.numberOfParticles - numberOfParticles);
    } else {
      this.addParticles(numberOfParticles - this.numberOfParticles);
    }
    assert && assert(this.numberOfParticles === numberOfParticles);
  }

  /**
   * Adds a specified number of particles to the precipitate.
   */
  addParticles(numberToAdd) {
    assert && assert(numberToAdd > 0, `invalid numberToAdd: ${numberToAdd}`);
    for (let i = 0; i < numberToAdd; i++) {
      this.createParticle(this.solution.soluteProperty.value, this.getRandomPosition(), PrecipitateParticles.getRandomOrientation(), Vector2.ZERO, Vector2.ZERO);
    }
  }

  /**
   * Removes a specified number of particles from the precipitate.
   */
  removeParticles(numberToRemove) {
    const numberBefore = this.numberOfParticles;
    const particles = this.getParticlesReference();
    assert && assert(numberToRemove > 0 && numberToRemove <= particles.length, `invalid numberToRemove: ${numberToRemove}`);

    // Remove from the end of the array.
    for (let i = 0; i < numberToRemove; i++) {
      this.disposeLastParticle();
    }
    assert && assert(this.numberOfParticles + numberToRemove === numberBefore, `unexpected number of particles removed: expected ${numberToRemove}, removed ${numberBefore - this.numberOfParticles}`);
  }

  /**
   * Gets a random position at the bottom of the beaker, in the global model coordinate frame.
   */
  getRandomPosition() {
    const particleSize = this.solution.soluteProperty.value.particleSize;

    // Particles are square, so the largest margin required is the diagonal length.
    const margin = Math.sqrt(particleSize * particleSize);
    const x = this.beaker.position.x - this.beaker.size.width / 2 + margin + dotRandom.nextDouble() * (this.beaker.size.width - 2 * margin);
    const y = this.beaker.position.y - margin; // this was tweaked based on the lineWidth used to stroke the beaker
    return new Vector2(x, y);
  }
}
beersLawLab.register('PrecipitateParticles', PrecipitateParticles);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJWZWN0b3IyIiwib3B0aW9uaXplIiwiYmVlcnNMYXdMYWIiLCJTb2x1dGVQYXJ0aWNsZXMiLCJQcmVjaXBpdGF0ZVBhcnRpY2xlcyIsImNvbnN0cnVjdG9yIiwic29sdXRpb24iLCJiZWFrZXIiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwicGFydGljbGVHcm91cERvY3VtZW50YXRpb24iLCJzb2x1dGVQcm9wZXJ0eSIsInByZWNpcGl0YXRlTW9sZXNQcm9wZXJ0eSIsImxpbmsiLCJ1cGRhdGVQYXJ0aWNsZXMiLCJzb2x1dGUiLCJwaGV0Iiwiam9pc3QiLCJzaW0iLCJpc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5IiwidmFsdWUiLCJyZW1vdmVBbGxQYXJ0aWNsZXMiLCJkaXNwb3NlIiwiYXNzZXJ0IiwibnVtYmVyT2ZQYXJ0aWNsZXMiLCJnZXROdW1iZXJPZlByZWNpcGl0YXRlUGFydGljbGVzIiwicmVtb3ZlUGFydGljbGVzIiwiYWRkUGFydGljbGVzIiwibnVtYmVyVG9BZGQiLCJpIiwiY3JlYXRlUGFydGljbGUiLCJnZXRSYW5kb21Qb3NpdGlvbiIsImdldFJhbmRvbU9yaWVudGF0aW9uIiwiWkVSTyIsIm51bWJlclRvUmVtb3ZlIiwibnVtYmVyQmVmb3JlIiwicGFydGljbGVzIiwiZ2V0UGFydGljbGVzUmVmZXJlbmNlIiwibGVuZ3RoIiwiZGlzcG9zZUxhc3RQYXJ0aWNsZSIsInBhcnRpY2xlU2l6ZSIsIm1hcmdpbiIsIk1hdGgiLCJzcXJ0IiwieCIsInBvc2l0aW9uIiwic2l6ZSIsIndpZHRoIiwibmV4dERvdWJsZSIsInkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByZWNpcGl0YXRlUGFydGljbGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByZWNpcGl0YXRlUGFydGljbGVzIG1hbmFnZXMgdGhlIGNyZWF0aW9uIGFuZCBkZWxldGlvbiBvZiBzb2x1dGUgcGFydGljbGVzIHRoYXQgZm9ybSBvbiB0aGUgYm90dG9tIG9mXHJcbiAqIHRoZSBiZWFrZXIgYXMgcHJlY2lwaXRhdGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IGJlZXJzTGF3TGFiIGZyb20gJy4uLy4uL2JlZXJzTGF3TGFiLmpzJztcclxuaW1wb3J0IEJlYWtlciBmcm9tICcuL0JlYWtlci5qcyc7XHJcbmltcG9ydCBDb25jZW50cmF0aW9uU29sdXRpb24gZnJvbSAnLi9Db25jZW50cmF0aW9uU29sdXRpb24uanMnO1xyXG5pbXBvcnQgU29sdXRlUGFydGljbGVzLCB7IFNvbHV0ZVBhcnRpY2xlc09wdGlvbnMgfSBmcm9tICcuL1NvbHV0ZVBhcnRpY2xlcy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgUHJlY2lwaXRhdGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U29sdXRlUGFydGljbGVzT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJlY2lwaXRhdGVQYXJ0aWNsZXMgZXh0ZW5kcyBTb2x1dGVQYXJ0aWNsZXMge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IHNvbHV0aW9uOiBDb25jZW50cmF0aW9uU29sdXRpb247XHJcbiAgcHJpdmF0ZSByZWFkb25seSBiZWFrZXI6IEJlYWtlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzb2x1dGlvbjogQ29uY2VudHJhdGlvblNvbHV0aW9uLCBiZWFrZXI6IEJlYWtlciwgcHJvdmlkZWRPcHRpb25zOiBQcmVjaXBpdGF0ZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQcmVjaXBpdGF0ZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBTb2x1dGVQYXJ0aWNsZXNPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTb2x1dGVQYXJ0aWNsZXNPcHRpb25zXHJcbiAgICAgIHBhcnRpY2xlR3JvdXBEb2N1bWVudGF0aW9uOiAnRHluYW1pY2FsbHkgY3JlYXRlcyBzb2x1dGUgcGFydGljbGVzIGZvciB0aGUgcHJlY2lwaXRhdGUnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggc29sdXRpb24uc29sdXRlUHJvcGVydHksIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnNvbHV0aW9uID0gc29sdXRpb247XHJcbiAgICB0aGlzLmJlYWtlciA9IGJlYWtlcjtcclxuXHJcbiAgICAvLyB3aGVuIHRoZSBzYXR1cmF0aW9uIGNoYW5nZXMsIHVwZGF0ZSB0aGUgbnVtYmVyIG9mIHByZWNpcGl0YXRlIHBhcnRpY2xlc1xyXG4gICAgdGhpcy5zb2x1dGlvbi5wcmVjaXBpdGF0ZU1vbGVzUHJvcGVydHkubGluayggKCkgPT4gdGhpcy51cGRhdGVQYXJ0aWNsZXMoKSApO1xyXG5cclxuICAgIC8vIHdoZW4gdGhlIHNvbHV0ZSBjaGFuZ2VzLCByZW1vdmUgYWxsIHBhcnRpY2xlcyBhbmQgY3JlYXRlIG5ldyBwYXJ0aWNsZXMgZm9yIHRoZSBzb2x1dGVcclxuICAgIHRoaXMuc29sdXRpb24uc29sdXRlUHJvcGVydHkubGluayggc29sdXRlID0+IHtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSBhbGwgcGFydGljbGVzLCB1bmxlc3Mgc29sdXRlIHdhcyBiZWluZyByZXN0b3JlZCBieSBQaEVULWlPLiBQYXJ0aWNsZXMgd2lsbCBiZSByZXN0b3JlZCBieSBwYXJ0aWNsZUdyb3VwLlxyXG4gICAgICBpZiAoICFwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsUGFydGljbGVzKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNsZXMoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgICogQWRkcy9yZW1vdmVzIHBhcnRpY2xlcyB0byBtYXRjaCB0aGUgbW9kZWwuIFRvIG9wdGltaXplIHBlcmZvcm1hbmNlLCBjbGllbnRzIHdobyByZWdpc3RlciBmb3IgdGhlICdjaGFuZ2UnXHJcbiAgICogY2FsbGJhY2sgd2lsbCBhc3N1bWUgdGhhdCBwYXJ0aWNsZXMgYXJlIGFkZGVkL3JlbW92ZWQgZnJvbSB0aGUgZW5kIG9mIHRoZSAncGFydGljbGVzJyBhcnJheS5cclxuICAgKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2JlZXJzLWxhdy1sYWIvaXNzdWVzLzQ4XHJcbiAgICovXHJcbiAgcHJpdmF0ZSB1cGRhdGVQYXJ0aWNsZXMoKTogdm9pZCB7XHJcblxyXG4gICAgLy8gbnVtYmVyIG9mIHBhcnRpY2xlcyBkZXNpcmVkIGFmdGVyIHRoaXMgdXBkYXRlXHJcbiAgICBjb25zdCBudW1iZXJPZlBhcnRpY2xlcyA9IHRoaXMuc29sdXRpb24uZ2V0TnVtYmVyT2ZQcmVjaXBpdGF0ZVBhcnRpY2xlcygpO1xyXG5cclxuICAgIGlmICggbnVtYmVyT2ZQYXJ0aWNsZXMgPT09IHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXMgKSB7XHJcbiAgICAgIHJldHVybjsgLy8gbm8gY2hhbmdlLCBkbyBub3RoaW5nXHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbnVtYmVyT2ZQYXJ0aWNsZXMgPCB0aGlzLm51bWJlck9mUGFydGljbGVzICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlcyggdGhpcy5udW1iZXJPZlBhcnRpY2xlcyAtIG51bWJlck9mUGFydGljbGVzICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5hZGRQYXJ0aWNsZXMoIG51bWJlck9mUGFydGljbGVzIC0gdGhpcy5udW1iZXJPZlBhcnRpY2xlcyApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5udW1iZXJPZlBhcnRpY2xlcyA9PT0gbnVtYmVyT2ZQYXJ0aWNsZXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBzcGVjaWZpZWQgbnVtYmVyIG9mIHBhcnRpY2xlcyB0byB0aGUgcHJlY2lwaXRhdGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhZGRQYXJ0aWNsZXMoIG51bWJlclRvQWRkOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJUb0FkZCA+IDAsIGBpbnZhbGlkIG51bWJlclRvQWRkOiAke251bWJlclRvQWRkfWAgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlclRvQWRkOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuY3JlYXRlUGFydGljbGUoIHRoaXMuc29sdXRpb24uc29sdXRlUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgdGhpcy5nZXRSYW5kb21Qb3NpdGlvbigpLFxyXG4gICAgICAgIFByZWNpcGl0YXRlUGFydGljbGVzLmdldFJhbmRvbU9yaWVudGF0aW9uKCksXHJcbiAgICAgICAgVmVjdG9yMi5aRVJPLFxyXG4gICAgICAgIFZlY3RvcjIuWkVST1xyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIHNwZWNpZmllZCBudW1iZXIgb2YgcGFydGljbGVzIGZyb20gdGhlIHByZWNpcGl0YXRlLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVtb3ZlUGFydGljbGVzKCBudW1iZXJUb1JlbW92ZTogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IG51bWJlckJlZm9yZSA9IHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXM7XHJcblxyXG4gICAgY29uc3QgcGFydGljbGVzID0gdGhpcy5nZXRQYXJ0aWNsZXNSZWZlcmVuY2UoKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG51bWJlclRvUmVtb3ZlID4gMCAmJiBudW1iZXJUb1JlbW92ZSA8PSBwYXJ0aWNsZXMubGVuZ3RoLCBgaW52YWxpZCBudW1iZXJUb1JlbW92ZTogJHtudW1iZXJUb1JlbW92ZX1gICk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGZyb20gdGhlIGVuZCBvZiB0aGUgYXJyYXkuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1iZXJUb1JlbW92ZTsgaSsrICkge1xyXG4gICAgICB0aGlzLmRpc3Bvc2VMYXN0UGFydGljbGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLm51bWJlck9mUGFydGljbGVzICsgbnVtYmVyVG9SZW1vdmUgPT09IG51bWJlckJlZm9yZSxcclxuICAgICAgYHVuZXhwZWN0ZWQgbnVtYmVyIG9mIHBhcnRpY2xlcyByZW1vdmVkOiBleHBlY3RlZCAke251bWJlclRvUmVtb3ZlfSwgcmVtb3ZlZCAke251bWJlckJlZm9yZSAtIHRoaXMubnVtYmVyT2ZQYXJ0aWNsZXN9YCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyBhIHJhbmRvbSBwb3NpdGlvbiBhdCB0aGUgYm90dG9tIG9mIHRoZSBiZWFrZXIsIGluIHRoZSBnbG9iYWwgbW9kZWwgY29vcmRpbmF0ZSBmcmFtZS5cclxuICAgKi9cclxuICBwcml2YXRlIGdldFJhbmRvbVBvc2l0aW9uKCk6IFZlY3RvcjIge1xyXG4gICAgY29uc3QgcGFydGljbGVTaXplID0gdGhpcy5zb2x1dGlvbi5zb2x1dGVQcm9wZXJ0eS52YWx1ZS5wYXJ0aWNsZVNpemU7XHJcblxyXG4gICAgLy8gUGFydGljbGVzIGFyZSBzcXVhcmUsIHNvIHRoZSBsYXJnZXN0IG1hcmdpbiByZXF1aXJlZCBpcyB0aGUgZGlhZ29uYWwgbGVuZ3RoLlxyXG4gICAgY29uc3QgbWFyZ2luID0gTWF0aC5zcXJ0KCBwYXJ0aWNsZVNpemUgKiBwYXJ0aWNsZVNpemUgKTtcclxuXHJcbiAgICBjb25zdCB4ID0gdGhpcy5iZWFrZXIucG9zaXRpb24ueCAtICggdGhpcy5iZWFrZXIuc2l6ZS53aWR0aCAvIDIgKSArIG1hcmdpbiArICggZG90UmFuZG9tLm5leHREb3VibGUoKSAqICggdGhpcy5iZWFrZXIuc2l6ZS53aWR0aCAtICggMiAqIG1hcmdpbiApICkgKTtcclxuICAgIGNvbnN0IHkgPSB0aGlzLmJlYWtlci5wb3NpdGlvbi55IC0gbWFyZ2luOyAvLyB0aGlzIHdhcyB0d2Vha2VkIGJhc2VkIG9uIHRoZSBsaW5lV2lkdGggdXNlZCB0byBzdHJva2UgdGhlIGJlYWtlclxyXG4gICAgcmV0dXJuIG5ldyBWZWN0b3IyKCB4LCB5ICk7XHJcbiAgfVxyXG59XHJcblxyXG5iZWVyc0xhd0xhYi5yZWdpc3RlciggJ1ByZWNpcGl0YXRlUGFydGljbGVzJywgUHJlY2lwaXRhdGVQYXJ0aWNsZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQs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