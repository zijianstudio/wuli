// Copyright 2014-2022, University of Colorado Boulder

/**
 * This is the primary model class for the Make Isotopes module. This class acts as the main interface for model
 * actions, and contains the constituent model elements. It watches all neutrons and, based on where they are placed by
 * the user, moves them between the neutron bucket and the atom. In this model, units are picometers (1E-12).
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Aadish Gupta
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import { Color } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import IsotopesAndAtomicMassStrings from '../../IsotopesAndAtomicMassStrings.js';
const neutronsString = IsotopesAndAtomicMassStrings.neutrons;

// constants
const DEFAULT_NUM_NEUTRONS_IN_BUCKET = 4;
const NUCLEUS_JUMP_PERIOD = 0.1; // In seconds
const MAX_NUCLEUS_JUMP = ShredConstants.NUCLEON_RADIUS * 0.5;
const JUMP_ANGLES = [Math.PI * 0.1, Math.PI * 1.6, Math.PI * 0.7, Math.PI * 1.1, Math.PI * 0.3];
const JUMP_DISTANCES = [MAX_NUCLEUS_JUMP * 0.4, MAX_NUCLEUS_JUMP * 0.8, MAX_NUCLEUS_JUMP * 0.2, MAX_NUCLEUS_JUMP * 0.9];
const NUCLEON_CAPTURE_RADIUS = 100; // maximum drop distance for a nucleon to be considered part of the particle
const BUCKET_SIZE = new Dimension2(130, 60);
const NEUTRON_BUCKET_POSITION = new Vector2(-220, -180);
const DEFAULT_ATOM_CONFIG = new NumberAtom({
  protonCount: 1,
  neutronCount: 0,
  electronCount: 1
}); // Hydrogen.

class MakeIsotopesModel {
  /**
   * Constructor for a make isotopes model.  This will construct the model with atoms initially in the bucket.
   *
   */
  constructor() {
    // @public - create the atom.
    this.particleAtom = new ParticleAtom();

    // @public - Make available a 'number atom' that tracks the state of the particle atom.
    this.numberAtom = new NumberAtom({
      protonCount: DEFAULT_ATOM_CONFIG.protonCountProperty.get(),
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCountProperty.get(),
      electronCount: DEFAULT_ATOM_CONFIG.electronCountProperty.get()
    });

    // @public - events emitted by instances of this type
    this.atomReconfigured = new Emitter();

    // Update the stability state and counter on changes.
    this.nucleusStable = true; // @public
    this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD; // @private
    this.nucleusOffset = Vector2.ZERO; // @private
    this.nucleusJumpCount = 0; // @private

    // Unlink in not required here as it is used through out the sim life
    this.particleAtom.massNumberProperty.link(massNumber => {
      const stable = massNumber > 0 ? AtomIdentifier.isStable(this.particleAtom.protonCountProperty.get(), this.particleAtom.neutronCountProperty.get()) : true;
      if (this.nucleusStable !== stable) {
        // Stability has changed.
        this.nucleusStable = stable;
        if (stable) {
          this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
          this.particleAtom.nucleusOffsetProperty.set(Vector2.ZERO);
        }
      }
      if (this.particleAtom.protonCountProperty.get() > 0 && this.particleAtom.neutronCountProperty.get() >= 0) {
        this.atomReconfigured.emit();
      }
    });

    // Arrays that contain the subatomic particles, whether they are in the  bucket or in the atom.  This is part of a
    // basic assumption about how the model works, which is that the model contains all the particles, and the particles
    // move back and forth from being in the bucket or in in the atom.
    this.neutrons = createObservableArray(); // @public
    this.protons = createObservableArray(); // @public
    this.electrons = createObservableArray(); // @public

    // The bucket that holds the neutrons that are not in the atom.
    // @public
    this.neutronBucket = new SphereBucket({
      position: NEUTRON_BUCKET_POSITION,
      size: BUCKET_SIZE,
      baseColor: Color.gray,
      captionText: neutronsString,
      sphereRadius: ShredConstants.NUCLEON_RADIUS
    });
    this.numberAtom.atomUpdated.addListener(() => {
      this.setAtomConfiguration(this.numberAtom);
    });

    // Set the initial atom configuration.
    this.setAtomConfiguration(DEFAULT_ATOM_CONFIG);
  }

  // Main model step function, called by the framework.
  // @public
  step(dt) {
    // Update particle positions.
    this.neutrons.forEach(neutron => {
      neutron.step(dt);
    });
    this.protons.forEach(neutron => {
      neutron.step(dt);
    });
    if (this.nucleusStable === false) {
      this.nucleusJumpCountdown -= dt;
      if (this.nucleusJumpCountdown <= 0) {
        this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
        if (this.particleAtom.nucleusOffsetProperty.get() === Vector2.ZERO) {
          this.nucleusJumpCount++;
          const angle = JUMP_ANGLES[this.nucleusJumpCount % JUMP_ANGLES.length];
          const distance = JUMP_DISTANCES[this.nucleusJumpCount % JUMP_DISTANCES.length];
          this.particleAtom.nucleusOffsetProperty.set(new Vector2(Math.cos(angle) * distance, Math.sin(angle) * distance));
        } else {
          this.particleAtom.nucleusOffsetProperty.set(Vector2.ZERO);
        }
      }
    }
  }

  /**
   * Get the current atom of this model, in its number representation
   * @public
   */
  getNumberAtom() {
    return this.numberAtom;
  }

  /**
   *
   * @param {Particle} particle
   * @param {SphereBucket} bucket
   * @param {ParticleAtom} atom
   * @public
   */
  placeNucleon(particle, bucket, atom) {
    if (particle.positionProperty.get().distance(atom.positionProperty.get()) < NUCLEON_CAPTURE_RADIUS) {
      atom.addParticle(particle);
    } else {
      bucket.addParticleNearestOpen(particle, true);
    }
  }

  /**
   *
   * @param {Particle} neutron
   * @param {boolean} lazyLink whether the linking has to be lazy or not
   * @private
   */
  linkNeutron(neutron, lazyLink) {
    const userControlledLink = userControlled => {
      this.atomReconfigured.emit();
      if (!userControlled && !this.neutronBucket.containsParticle(neutron)) {
        this.placeNucleon(neutron, this.neutronBucket, this.particleAtom);
        this.atomReconfigured.emit();
      }
    };
    if (lazyLink) {
      neutron.userControlledProperty.lazyLink(userControlledLink);
    } else {
      neutron.userControlledProperty.link(userControlledLink);
    }
    neutron.userControlledPropertyUnlink = () => {
      neutron.userControlledProperty.unlink(userControlledLink);
    };
  }

  // @public
  setNeutronBucketConfiguration() {
    // Add the neutrons to the neutron bucket.
    _.times(DEFAULT_NUM_NEUTRONS_IN_BUCKET, () => {
      const neutron = new Particle('neutron');
      this.neutronBucket.addParticleFirstOpen(neutron, false);
      this.linkNeutron(neutron, false);
      this.neutrons.add(neutron);
    });
  }

  /**
   * Set the configuration of the atom that the user interacts with.  Specifically, this sets the particle atom equal
   * to the current number atom.  This is done here rather than by directly accessing the atom so that the
   * appropriate notifications can be sent and the bucket can be
   * reinitialized.
   *
   * @param {NumberAtom} numberAtom - New configuration of atomic properties to which the atom should be set.
   * @public
   */
  setAtomConfiguration(numberAtom) {
    this.particleAtom.clear();
    this.protons.clear();
    this.electrons.clear();
    this.neutrons.forEach(neutron => {
      neutron.userControlledPropertyUnlink();
    });
    this.neutrons.clear();
    this.neutronBucket.reset();
    if (this.numberAtom !== numberAtom) {
      this.numberAtom.protonCountProperty.set(numberAtom.protonCountProperty.get());
      this.numberAtom.electronCountProperty.set(numberAtom.electronCountProperty.get());
      this.numberAtom.neutronCountProperty.set(numberAtom.neutronCountProperty.get());
    }

    // Add the particles.
    for (let i = 0; i < numberAtom.electronCountProperty.get(); i++) {
      const electron = new Particle('electron');
      this.particleAtom.addParticle(electron);
      this.electrons.add(electron);
    }
    for (let j = 0; j < numberAtom.protonCountProperty.get(); j++) {
      const proton = new Particle('proton');
      this.particleAtom.addParticle(proton);
      this.protons.add(proton);
    }
    _.times(numberAtom.neutronCountProperty.get(), () => {
      const neutron = new Particle('neutron');
      this.particleAtom.addParticle(neutron);
      this.neutrons.add(neutron);
      this.linkNeutron(neutron, true);
    });
    this.particleAtom.moveAllParticlesToDestination();
    this.setNeutronBucketConfiguration();
    this.atomReconfigured.emit();
  }

  /**
   * Reset the model. The sets the atom and the neutron bucket into their default initial states.
   * @public
   */
  reset() {
    // Reset the atom.  This also resets the neutron bucket.
    this.setAtomConfiguration(DEFAULT_ATOM_CONFIG);
  }

  /**
   * Get neutron bucket.
   *
   * @returns { SphereBucket }
   *
   * @public
   */
  getNeutronBucket() {
    return this.neutronBucket;
  }
}
isotopesAndAtomicMass.register('MakeIsotopesModel', MakeIsotopesModel);
export default MakeIsotopesModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJTcGhlcmVCdWNrZXQiLCJDb2xvciIsIkF0b21JZGVudGlmaWVyIiwiTnVtYmVyQXRvbSIsIlBhcnRpY2xlIiwiUGFydGljbGVBdG9tIiwiU2hyZWRDb25zdGFudHMiLCJpc290b3Blc0FuZEF0b21pY01hc3MiLCJJc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzIiwibmV1dHJvbnNTdHJpbmciLCJuZXV0cm9ucyIsIkRFRkFVTFRfTlVNX05FVVRST05TX0lOX0JVQ0tFVCIsIk5VQ0xFVVNfSlVNUF9QRVJJT0QiLCJNQVhfTlVDTEVVU19KVU1QIiwiTlVDTEVPTl9SQURJVVMiLCJKVU1QX0FOR0xFUyIsIk1hdGgiLCJQSSIsIkpVTVBfRElTVEFOQ0VTIiwiTlVDTEVPTl9DQVBUVVJFX1JBRElVUyIsIkJVQ0tFVF9TSVpFIiwiTkVVVFJPTl9CVUNLRVRfUE9TSVRJT04iLCJERUZBVUxUX0FUT01fQ09ORklHIiwicHJvdG9uQ291bnQiLCJuZXV0cm9uQ291bnQiLCJlbGVjdHJvbkNvdW50IiwiTWFrZUlzb3RvcGVzTW9kZWwiLCJjb25zdHJ1Y3RvciIsInBhcnRpY2xlQXRvbSIsIm51bWJlckF0b20iLCJwcm90b25Db3VudFByb3BlcnR5IiwiZ2V0IiwibmV1dHJvbkNvdW50UHJvcGVydHkiLCJlbGVjdHJvbkNvdW50UHJvcGVydHkiLCJhdG9tUmVjb25maWd1cmVkIiwibnVjbGV1c1N0YWJsZSIsIm51Y2xldXNKdW1wQ291bnRkb3duIiwibnVjbGV1c09mZnNldCIsIlpFUk8iLCJudWNsZXVzSnVtcENvdW50IiwibWFzc051bWJlclByb3BlcnR5IiwibGluayIsIm1hc3NOdW1iZXIiLCJzdGFibGUiLCJpc1N0YWJsZSIsIm51Y2xldXNPZmZzZXRQcm9wZXJ0eSIsInNldCIsImVtaXQiLCJwcm90b25zIiwiZWxlY3Ryb25zIiwibmV1dHJvbkJ1Y2tldCIsInBvc2l0aW9uIiwic2l6ZSIsImJhc2VDb2xvciIsImdyYXkiLCJjYXB0aW9uVGV4dCIsInNwaGVyZVJhZGl1cyIsImF0b21VcGRhdGVkIiwiYWRkTGlzdGVuZXIiLCJzZXRBdG9tQ29uZmlndXJhdGlvbiIsInN0ZXAiLCJkdCIsImZvckVhY2giLCJuZXV0cm9uIiwiYW5nbGUiLCJsZW5ndGgiLCJkaXN0YW5jZSIsImNvcyIsInNpbiIsImdldE51bWJlckF0b20iLCJwbGFjZU51Y2xlb24iLCJwYXJ0aWNsZSIsImJ1Y2tldCIsImF0b20iLCJwb3NpdGlvblByb3BlcnR5IiwiYWRkUGFydGljbGUiLCJhZGRQYXJ0aWNsZU5lYXJlc3RPcGVuIiwibGlua05ldXRyb24iLCJsYXp5TGluayIsInVzZXJDb250cm9sbGVkTGluayIsInVzZXJDb250cm9sbGVkIiwiY29udGFpbnNQYXJ0aWNsZSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5VW5saW5rIiwidW5saW5rIiwic2V0TmV1dHJvbkJ1Y2tldENvbmZpZ3VyYXRpb24iLCJfIiwidGltZXMiLCJhZGRQYXJ0aWNsZUZpcnN0T3BlbiIsImFkZCIsImNsZWFyIiwicmVzZXQiLCJpIiwiZWxlY3Ryb24iLCJqIiwicHJvdG9uIiwibW92ZUFsbFBhcnRpY2xlc1RvRGVzdGluYXRpb24iLCJnZXROZXV0cm9uQnVja2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYWtlSXNvdG9wZXNNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUaGlzIGlzIHRoZSBwcmltYXJ5IG1vZGVsIGNsYXNzIGZvciB0aGUgTWFrZSBJc290b3BlcyBtb2R1bGUuIFRoaXMgY2xhc3MgYWN0cyBhcyB0aGUgbWFpbiBpbnRlcmZhY2UgZm9yIG1vZGVsXHJcbiAqIGFjdGlvbnMsIGFuZCBjb250YWlucyB0aGUgY29uc3RpdHVlbnQgbW9kZWwgZWxlbWVudHMuIEl0IHdhdGNoZXMgYWxsIG5ldXRyb25zIGFuZCwgYmFzZWQgb24gd2hlcmUgdGhleSBhcmUgcGxhY2VkIGJ5XHJcbiAqIHRoZSB1c2VyLCBtb3ZlcyB0aGVtIGJldHdlZW4gdGhlIG5ldXRyb24gYnVja2V0IGFuZCB0aGUgYXRvbS4gSW4gdGhpcyBtb2RlbCwgdW5pdHMgYXJlIHBpY29tZXRlcnMgKDFFLTEyKS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZ1xyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YVxyXG4gKi9cclxuXHJcbmltcG9ydCBjcmVhdGVPYnNlcnZhYmxlQXJyYXkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9jcmVhdGVPYnNlcnZhYmxlQXJyYXkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFNwaGVyZUJ1Y2tldCBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL1NwaGVyZUJ1Y2tldC5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEF0b21JZGVudGlmaWVyIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL0F0b21JZGVudGlmaWVyLmpzJztcclxuaW1wb3J0IE51bWJlckF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvTnVtYmVyQXRvbS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9QYXJ0aWNsZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZUF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGVBdG9tLmpzJztcclxuaW1wb3J0IFNocmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL1NocmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGlzb3RvcGVzQW5kQXRvbWljTWFzcyBmcm9tICcuLi8uLi9pc290b3Blc0FuZEF0b21pY01hc3MuanMnO1xyXG5pbXBvcnQgSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncyBmcm9tICcuLi8uLi9Jc290b3Blc0FuZEF0b21pY01hc3NTdHJpbmdzLmpzJztcclxuXHJcbmNvbnN0IG5ldXRyb25zU3RyaW5nID0gSXNvdG9wZXNBbmRBdG9taWNNYXNzU3RyaW5ncy5uZXV0cm9ucztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX05VTV9ORVVUUk9OU19JTl9CVUNLRVQgPSA0O1xyXG5jb25zdCBOVUNMRVVTX0pVTVBfUEVSSU9EID0gMC4xOyAvLyBJbiBzZWNvbmRzXHJcbmNvbnN0IE1BWF9OVUNMRVVTX0pVTVAgPSBTaHJlZENvbnN0YW50cy5OVUNMRU9OX1JBRElVUyAqIDAuNTtcclxuY29uc3QgSlVNUF9BTkdMRVMgPSBbIE1hdGguUEkgKiAwLjEsIE1hdGguUEkgKiAxLjYsIE1hdGguUEkgKiAwLjcsIE1hdGguUEkgKiAxLjEsIE1hdGguUEkgKiAwLjMgXTtcclxuY29uc3QgSlVNUF9ESVNUQU5DRVMgPSBbIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjQsIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjgsIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjIsIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjkgXTtcclxuY29uc3QgTlVDTEVPTl9DQVBUVVJFX1JBRElVUyA9IDEwMDsgLy8gbWF4aW11bSBkcm9wIGRpc3RhbmNlIGZvciBhIG51Y2xlb24gdG8gYmUgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBwYXJ0aWNsZVxyXG5jb25zdCBCVUNLRVRfU0laRSA9IG5ldyBEaW1lbnNpb24yKCAxMzAsIDYwICk7XHJcbmNvbnN0IE5FVVRST05fQlVDS0VUX1BPU0lUSU9OID0gbmV3IFZlY3RvcjIoIC0yMjAsIC0xODAgKTtcclxuY29uc3QgREVGQVVMVF9BVE9NX0NPTkZJRyA9IG5ldyBOdW1iZXJBdG9tKCB7IHByb3RvbkNvdW50OiAxLCBuZXV0cm9uQ291bnQ6IDAsIGVsZWN0cm9uQ291bnQ6IDEgfSApOyAvLyBIeWRyb2dlbi5cclxuXHJcbmNsYXNzIE1ha2VJc290b3Blc01vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIGEgbWFrZSBpc290b3BlcyBtb2RlbC4gIFRoaXMgd2lsbCBjb25zdHJ1Y3QgdGhlIG1vZGVsIHdpdGggYXRvbXMgaW5pdGlhbGx5IGluIHRoZSBidWNrZXQuXHJcbiAgICpcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gY3JlYXRlIHRoZSBhdG9tLlxyXG4gICAgdGhpcy5wYXJ0aWNsZUF0b20gPSBuZXcgUGFydGljbGVBdG9tKCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIE1ha2UgYXZhaWxhYmxlIGEgJ251bWJlciBhdG9tJyB0aGF0IHRyYWNrcyB0aGUgc3RhdGUgb2YgdGhlIHBhcnRpY2xlIGF0b20uXHJcbiAgICB0aGlzLm51bWJlckF0b20gPSBuZXcgTnVtYmVyQXRvbSgge1xyXG4gICAgICBwcm90b25Db3VudDogREVGQVVMVF9BVE9NX0NPTkZJRy5wcm90b25Db3VudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICBuZXV0cm9uQ291bnQ6IERFRkFVTFRfQVRPTV9DT05GSUcubmV1dHJvbkNvdW50UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIGVsZWN0cm9uQ291bnQ6IERFRkFVTFRfQVRPTV9DT05GSUcuZWxlY3Ryb25Db3VudFByb3BlcnR5LmdldCgpXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAtIGV2ZW50cyBlbWl0dGVkIGJ5IGluc3RhbmNlcyBvZiB0aGlzIHR5cGVcclxuICAgIHRoaXMuYXRvbVJlY29uZmlndXJlZCA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBzdGFiaWxpdHkgc3RhdGUgYW5kIGNvdW50ZXIgb24gY2hhbmdlcy5cclxuICAgIHRoaXMubnVjbGV1c1N0YWJsZSA9IHRydWU7IC8vIEBwdWJsaWNcclxuICAgIHRoaXMubnVjbGV1c0p1bXBDb3VudGRvd24gPSBOVUNMRVVTX0pVTVBfUEVSSU9EOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5udWNsZXVzT2Zmc2V0ID0gVmVjdG9yMi5aRVJPOyAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5udWNsZXVzSnVtcENvdW50ID0gMDsgLy8gQHByaXZhdGVcclxuXHJcbiAgICAvLyBVbmxpbmsgaW4gbm90IHJlcXVpcmVkIGhlcmUgYXMgaXQgaXMgdXNlZCB0aHJvdWdoIG91dCB0aGUgc2ltIGxpZmVcclxuICAgIHRoaXMucGFydGljbGVBdG9tLm1hc3NOdW1iZXJQcm9wZXJ0eS5saW5rKCBtYXNzTnVtYmVyID0+IHtcclxuICAgICAgY29uc3Qgc3RhYmxlID0gbWFzc051bWJlciA+IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICBBdG9tSWRlbnRpZmllci5pc1N0YWJsZSggdGhpcy5wYXJ0aWNsZUF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSApIDogdHJ1ZTtcclxuICAgICAgaWYgKCB0aGlzLm51Y2xldXNTdGFibGUgIT09IHN0YWJsZSApIHtcclxuICAgICAgICAvLyBTdGFiaWxpdHkgaGFzIGNoYW5nZWQuXHJcbiAgICAgICAgdGhpcy5udWNsZXVzU3RhYmxlID0gc3RhYmxlO1xyXG4gICAgICAgIGlmICggc3RhYmxlICkge1xyXG4gICAgICAgICAgdGhpcy5udWNsZXVzSnVtcENvdW50ZG93biA9IE5VQ0xFVVNfSlVNUF9QRVJJT0Q7XHJcbiAgICAgICAgICB0aGlzLnBhcnRpY2xlQXRvbS5udWNsZXVzT2Zmc2V0UHJvcGVydHkuc2V0KCBWZWN0b3IyLlpFUk8gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCB0aGlzLnBhcnRpY2xlQXRvbS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpID4gMCAmJiB0aGlzLnBhcnRpY2xlQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSA+PSAwICkge1xyXG4gICAgICAgIHRoaXMuYXRvbVJlY29uZmlndXJlZC5lbWl0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBcnJheXMgdGhhdCBjb250YWluIHRoZSBzdWJhdG9taWMgcGFydGljbGVzLCB3aGV0aGVyIHRoZXkgYXJlIGluIHRoZSAgYnVja2V0IG9yIGluIHRoZSBhdG9tLiAgVGhpcyBpcyBwYXJ0IG9mIGFcclxuICAgIC8vIGJhc2ljIGFzc3VtcHRpb24gYWJvdXQgaG93IHRoZSBtb2RlbCB3b3Jrcywgd2hpY2ggaXMgdGhhdCB0aGUgbW9kZWwgY29udGFpbnMgYWxsIHRoZSBwYXJ0aWNsZXMsIGFuZCB0aGUgcGFydGljbGVzXHJcbiAgICAvLyBtb3ZlIGJhY2sgYW5kIGZvcnRoIGZyb20gYmVpbmcgaW4gdGhlIGJ1Y2tldCBvciBpbiBpbiB0aGUgYXRvbS5cclxuICAgIHRoaXMubmV1dHJvbnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTsgLy8gQHB1YmxpY1xyXG4gICAgdGhpcy5wcm90b25zID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7IC8vIEBwdWJsaWNcclxuICAgIHRoaXMuZWxlY3Ryb25zID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBUaGUgYnVja2V0IHRoYXQgaG9sZHMgdGhlIG5ldXRyb25zIHRoYXQgYXJlIG5vdCBpbiB0aGUgYXRvbS5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMubmV1dHJvbkJ1Y2tldCA9IG5ldyBTcGhlcmVCdWNrZXQoIHtcclxuICAgICAgcG9zaXRpb246IE5FVVRST05fQlVDS0VUX1BPU0lUSU9OLFxyXG4gICAgICBzaXplOiBCVUNLRVRfU0laRSxcclxuICAgICAgYmFzZUNvbG9yOiBDb2xvci5ncmF5LFxyXG4gICAgICBjYXB0aW9uVGV4dDogbmV1dHJvbnNTdHJpbmcsXHJcbiAgICAgIHNwaGVyZVJhZGl1czogU2hyZWRDb25zdGFudHMuTlVDTEVPTl9SQURJVVNcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm51bWJlckF0b20uYXRvbVVwZGF0ZWQuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5zZXRBdG9tQ29uZmlndXJhdGlvbiggdGhpcy5udW1iZXJBdG9tICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBpbml0aWFsIGF0b20gY29uZmlndXJhdGlvbi5cclxuICAgIHRoaXMuc2V0QXRvbUNvbmZpZ3VyYXRpb24oIERFRkFVTFRfQVRPTV9DT05GSUcgKTtcclxuXHJcbiAgfVxyXG5cclxuICAvLyBNYWluIG1vZGVsIHN0ZXAgZnVuY3Rpb24sIGNhbGxlZCBieSB0aGUgZnJhbWV3b3JrLlxyXG4gIC8vIEBwdWJsaWNcclxuICBzdGVwKCBkdCApIHtcclxuICAgIC8vIFVwZGF0ZSBwYXJ0aWNsZSBwb3NpdGlvbnMuXHJcbiAgICB0aGlzLm5ldXRyb25zLmZvckVhY2goIG5ldXRyb24gPT4ge1xyXG4gICAgICBuZXV0cm9uLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5wcm90b25zLmZvckVhY2goIG5ldXRyb24gPT4ge1xyXG4gICAgICBuZXV0cm9uLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCB0aGlzLm51Y2xldXNTdGFibGUgPT09IGZhbHNlICkge1xyXG4gICAgICB0aGlzLm51Y2xldXNKdW1wQ291bnRkb3duIC09IGR0O1xyXG4gICAgICBpZiAoIHRoaXMubnVjbGV1c0p1bXBDb3VudGRvd24gPD0gMCApIHtcclxuICAgICAgICB0aGlzLm51Y2xldXNKdW1wQ291bnRkb3duID0gTlVDTEVVU19KVU1QX1BFUklPRDtcclxuICAgICAgICBpZiAoIHRoaXMucGFydGljbGVBdG9tLm51Y2xldXNPZmZzZXRQcm9wZXJ0eS5nZXQoKSA9PT0gVmVjdG9yMi5aRVJPICkge1xyXG4gICAgICAgICAgdGhpcy5udWNsZXVzSnVtcENvdW50Kys7XHJcbiAgICAgICAgICBjb25zdCBhbmdsZSA9IEpVTVBfQU5HTEVTWyB0aGlzLm51Y2xldXNKdW1wQ291bnQgJSBKVU1QX0FOR0xFUy5sZW5ndGggXTtcclxuICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gSlVNUF9ESVNUQU5DRVNbIHRoaXMubnVjbGV1c0p1bXBDb3VudCAlIEpVTVBfRElTVEFOQ0VTLmxlbmd0aCBdO1xyXG4gICAgICAgICAgdGhpcy5wYXJ0aWNsZUF0b20ubnVjbGV1c09mZnNldFByb3BlcnR5LnNldChcclxuICAgICAgICAgICAgbmV3IFZlY3RvcjIoIE1hdGguY29zKCBhbmdsZSApICogZGlzdGFuY2UsIE1hdGguc2luKCBhbmdsZSApICogZGlzdGFuY2UgKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucGFydGljbGVBdG9tLm51Y2xldXNPZmZzZXRQcm9wZXJ0eS5zZXQoIFZlY3RvcjIuWkVSTyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBjdXJyZW50IGF0b20gb2YgdGhpcyBtb2RlbCwgaW4gaXRzIG51bWJlciByZXByZXNlbnRhdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROdW1iZXJBdG9tKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubnVtYmVyQXRvbTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZX0gcGFydGljbGVcclxuICAgKiBAcGFyYW0ge1NwaGVyZUJ1Y2tldH0gYnVja2V0XHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZUF0b219IGF0b21cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcGxhY2VOdWNsZW9uKCBwYXJ0aWNsZSwgYnVja2V0LCBhdG9tICkge1xyXG4gICAgaWYgKCBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBhdG9tLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSA8IE5VQ0xFT05fQ0FQVFVSRV9SQURJVVMgKSB7XHJcbiAgICAgIGF0b20uYWRkUGFydGljbGUoIHBhcnRpY2xlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYnVja2V0LmFkZFBhcnRpY2xlTmVhcmVzdE9wZW4oIHBhcnRpY2xlLCB0cnVlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UGFydGljbGV9IG5ldXRyb25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGxhenlMaW5rIHdoZXRoZXIgdGhlIGxpbmtpbmcgaGFzIHRvIGJlIGxhenkgb3Igbm90XHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBsaW5rTmV1dHJvbiggbmV1dHJvbiwgbGF6eUxpbmsgKSB7XHJcbiAgICBjb25zdCB1c2VyQ29udHJvbGxlZExpbmsgPSB1c2VyQ29udHJvbGxlZCA9PiB7XHJcbiAgICAgIHRoaXMuYXRvbVJlY29uZmlndXJlZC5lbWl0KCk7XHJcbiAgICAgIGlmICggIXVzZXJDb250cm9sbGVkICYmICF0aGlzLm5ldXRyb25CdWNrZXQuY29udGFpbnNQYXJ0aWNsZSggbmV1dHJvbiApICkge1xyXG4gICAgICAgIHRoaXMucGxhY2VOdWNsZW9uKCBuZXV0cm9uLCB0aGlzLm5ldXRyb25CdWNrZXQsIHRoaXMucGFydGljbGVBdG9tICk7XHJcbiAgICAgICAgdGhpcy5hdG9tUmVjb25maWd1cmVkLmVtaXQoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGlmICggbGF6eUxpbmsgKSB7XHJcbiAgICAgIG5ldXRyb24udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5sYXp5TGluayggdXNlckNvbnRyb2xsZWRMaW5rICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbmV1dHJvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkTGluayApO1xyXG4gICAgfVxyXG4gICAgbmV1dHJvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5VW5saW5rID0gKCkgPT4ge1xyXG4gICAgICBuZXV0cm9uLnVzZXJDb250cm9sbGVkUHJvcGVydHkudW5saW5rKCB1c2VyQ29udHJvbGxlZExpbmsgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgc2V0TmV1dHJvbkJ1Y2tldENvbmZpZ3VyYXRpb24oKSB7XHJcbiAgICAvLyBBZGQgdGhlIG5ldXRyb25zIHRvIHRoZSBuZXV0cm9uIGJ1Y2tldC5cclxuICAgIF8udGltZXMoIERFRkFVTFRfTlVNX05FVVRST05TX0lOX0JVQ0tFVCwgKCkgPT4ge1xyXG4gICAgICBjb25zdCBuZXV0cm9uID0gbmV3IFBhcnRpY2xlKCAnbmV1dHJvbicgKTtcclxuICAgICAgdGhpcy5uZXV0cm9uQnVja2V0LmFkZFBhcnRpY2xlRmlyc3RPcGVuKCBuZXV0cm9uLCBmYWxzZSApO1xyXG4gICAgICB0aGlzLmxpbmtOZXV0cm9uKCBuZXV0cm9uLCBmYWxzZSApO1xyXG4gICAgICB0aGlzLm5ldXRyb25zLmFkZCggbmV1dHJvbiApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBjb25maWd1cmF0aW9uIG9mIHRoZSBhdG9tIHRoYXQgdGhlIHVzZXIgaW50ZXJhY3RzIHdpdGguICBTcGVjaWZpY2FsbHksIHRoaXMgc2V0cyB0aGUgcGFydGljbGUgYXRvbSBlcXVhbFxyXG4gICAqIHRvIHRoZSBjdXJyZW50IG51bWJlciBhdG9tLiAgVGhpcyBpcyBkb25lIGhlcmUgcmF0aGVyIHRoYW4gYnkgZGlyZWN0bHkgYWNjZXNzaW5nIHRoZSBhdG9tIHNvIHRoYXQgdGhlXHJcbiAgICogYXBwcm9wcmlhdGUgbm90aWZpY2F0aW9ucyBjYW4gYmUgc2VudCBhbmQgdGhlIGJ1Y2tldCBjYW4gYmVcclxuICAgKiByZWluaXRpYWxpemVkLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBudW1iZXJBdG9tIC0gTmV3IGNvbmZpZ3VyYXRpb24gb2YgYXRvbWljIHByb3BlcnRpZXMgdG8gd2hpY2ggdGhlIGF0b20gc2hvdWxkIGJlIHNldC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0QXRvbUNvbmZpZ3VyYXRpb24oIG51bWJlckF0b20gKSB7XHJcbiAgICB0aGlzLnBhcnRpY2xlQXRvbS5jbGVhcigpO1xyXG4gICAgdGhpcy5wcm90b25zLmNsZWFyKCk7XHJcbiAgICB0aGlzLmVsZWN0cm9ucy5jbGVhcigpO1xyXG4gICAgdGhpcy5uZXV0cm9ucy5mb3JFYWNoKCBuZXV0cm9uID0+IHtcclxuICAgICAgbmV1dHJvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5VW5saW5rKCk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm5ldXRyb25zLmNsZWFyKCk7XHJcbiAgICB0aGlzLm5ldXRyb25CdWNrZXQucmVzZXQoKTtcclxuICAgIGlmICggdGhpcy5udW1iZXJBdG9tICE9PSBudW1iZXJBdG9tICkge1xyXG4gICAgICB0aGlzLm51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5zZXQoIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgICB0aGlzLm51bWJlckF0b20uZWxlY3Ryb25Db3VudFByb3BlcnR5LnNldCggbnVtYmVyQXRvbS5lbGVjdHJvbkNvdW50UHJvcGVydHkuZ2V0KCkgKTtcclxuICAgICAgdGhpcy5udW1iZXJBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LnNldCggbnVtYmVyQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFkZCB0aGUgcGFydGljbGVzLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyQXRvbS5lbGVjdHJvbkNvdW50UHJvcGVydHkuZ2V0KCk7IGkrKyApIHtcclxuICAgICAgY29uc3QgZWxlY3Ryb24gPSBuZXcgUGFydGljbGUoICdlbGVjdHJvbicgKTtcclxuICAgICAgdGhpcy5wYXJ0aWNsZUF0b20uYWRkUGFydGljbGUoIGVsZWN0cm9uICk7XHJcbiAgICAgIHRoaXMuZWxlY3Ryb25zLmFkZCggZWxlY3Ryb24gKTtcclxuICAgIH1cclxuICAgIGZvciAoIGxldCBqID0gMDsgaiA8IG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKTsgaisrICkge1xyXG4gICAgICBjb25zdCBwcm90b24gPSBuZXcgUGFydGljbGUoICdwcm90b24nICk7XHJcbiAgICAgIHRoaXMucGFydGljbGVBdG9tLmFkZFBhcnRpY2xlKCBwcm90b24gKTtcclxuICAgICAgdGhpcy5wcm90b25zLmFkZCggcHJvdG9uICk7XHJcbiAgICB9XHJcbiAgICBfLnRpbWVzKCBudW1iZXJBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5LmdldCgpLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG5ldXRyb24gPSBuZXcgUGFydGljbGUoICduZXV0cm9uJyApO1xyXG4gICAgICB0aGlzLnBhcnRpY2xlQXRvbS5hZGRQYXJ0aWNsZSggbmV1dHJvbiApO1xyXG4gICAgICB0aGlzLm5ldXRyb25zLmFkZCggbmV1dHJvbiApO1xyXG4gICAgICB0aGlzLmxpbmtOZXV0cm9uKCBuZXV0cm9uLCB0cnVlICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBhcnRpY2xlQXRvbS5tb3ZlQWxsUGFydGljbGVzVG9EZXN0aW5hdGlvbigpO1xyXG4gICAgdGhpcy5zZXROZXV0cm9uQnVja2V0Q29uZmlndXJhdGlvbigpO1xyXG4gICAgdGhpcy5hdG9tUmVjb25maWd1cmVkLmVtaXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoZSBtb2RlbC4gVGhlIHNldHMgdGhlIGF0b20gYW5kIHRoZSBuZXV0cm9uIGJ1Y2tldCBpbnRvIHRoZWlyIGRlZmF1bHQgaW5pdGlhbCBzdGF0ZXMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0KCkge1xyXG4gICAgLy8gUmVzZXQgdGhlIGF0b20uICBUaGlzIGFsc28gcmVzZXRzIHRoZSBuZXV0cm9uIGJ1Y2tldC5cclxuICAgIHRoaXMuc2V0QXRvbUNvbmZpZ3VyYXRpb24oIERFRkFVTFRfQVRPTV9DT05GSUcgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBuZXV0cm9uIGJ1Y2tldC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHsgU3BoZXJlQnVja2V0IH1cclxuICAgKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXROZXV0cm9uQnVja2V0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMubmV1dHJvbkJ1Y2tldDtcclxuICB9XHJcbn1cclxuXHJcbmlzb3RvcGVzQW5kQXRvbWljTWFzcy5yZWdpc3RlciggJ01ha2VJc290b3Blc01vZGVsJywgTWFrZUlzb3RvcGVzTW9kZWwgKTtcclxuZXhwb3J0IGRlZmF1bHQgTWFrZUlzb3RvcGVzTW9kZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sOENBQThDO0FBQ2hGLE9BQU9DLE9BQU8sTUFBTSxnQ0FBZ0M7QUFDcEQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFlBQVksTUFBTSxpREFB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