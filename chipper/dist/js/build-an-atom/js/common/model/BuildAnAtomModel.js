// Copyright 2013-2022, University of Colorado Boulder

/**
 * A model of a set of subatomic particles - protons, neutrons, and electrons - that can be assembled into atoms.
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import SphereBucket from '../../../../phetcommon/js/model/SphereBucket.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import ShredConstants from '../../../../shred/js/ShredConstants.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import buildAnAtom from '../../buildAnAtom.js';
import BuildAnAtomStrings from '../../BuildAnAtomStrings.js';
import BAAScreenView from '../view/BAAScreenView.js';
const electronsString = BuildAnAtomStrings.electrons;
const neutronsString = BuildAnAtomStrings.neutrons;
const protonsString = BuildAnAtomStrings.protons;

// constants
const NUM_PROTONS = 10;
const NUM_NEUTRONS = 13;
const NUM_ELECTRONS = 10;
const NUCLEON_CAPTURE_RADIUS = 100;
const BUCKET_WIDTH = 120;
const BUCKET_HEIGHT = BUCKET_WIDTH * 0.45;
const BUCKET_Y_OFFSET = -205;
const NUCLEUS_JUMP_PERIOD = 0.1; // in seconds
const MAX_NUCLEUS_JUMP = ShredConstants.NUCLEON_RADIUS * 0.5;
const JUMP_ANGLES = [Math.PI * 0.1, Math.PI * 1.6, Math.PI * 0.7, Math.PI * 1.1, Math.PI * 0.3];
const JUMP_DISTANCES = [MAX_NUCLEUS_JUMP * 0.4, MAX_NUCLEUS_JUMP * 0.8, MAX_NUCLEUS_JUMP * 0.2, MAX_NUCLEUS_JUMP * 0.9];
class BuildAnAtomModel {
  /**
   * Constructor for main model object.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor(tandem, options) {
    options = merge({
      phetioState: true
    }, options);

    // Properties that control label visibility in the view.
    this.showElementNameProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('showElementNameProperty'),
      phetioState: options.phetioState
    });
    this.showNeutralOrIonProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('showNeutralOrIonProperty'),
      phetioState: options.phetioState
    });
    this.showStableOrUnstableProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('showStableOrUnstableProperty'),
      phetioState: options.phetioState
    });

    // Property that controls electron depiction in the view.
    this.electronShellDepictionProperty = new StringProperty('orbits', {
      tandem: tandem.createTandem('electronShellDepictionProperty'),
      phetioState: options.phetioState,
      validValues: ['orbits', 'cloud']
    });

    // Create the atom that the user will build, modify, and generally play with.
    this.particleAtom = new ParticleAtom({
      tandem: tandem.createTandem('particleAtom'),
      phetioState: options.phetioState
    });

    // Create the buckets that will hold the sub-atomic particles.
    this.buckets = {
      protonBucket: new SphereBucket({
        position: new Vector2(-BUCKET_WIDTH * 1.1, BUCKET_Y_OFFSET),
        size: new Dimension2(BUCKET_WIDTH, BUCKET_HEIGHT),
        sphereRadius: ShredConstants.NUCLEON_RADIUS,
        baseColor: PhetColorScheme.RED_COLORBLIND,
        captionText: protonsString,
        captionColor: 'white',
        tandem: tandem.createTandem('protonBucket'),
        phetioState: options.phetioState
      }),
      neutronBucket: new SphereBucket({
        position: new Vector2(0, BUCKET_Y_OFFSET),
        size: new Dimension2(BUCKET_WIDTH, BUCKET_HEIGHT),
        sphereRadius: ShredConstants.NUCLEON_RADIUS,
        baseColor: 'rgb( 100, 100, 100 )',
        captionText: neutronsString,
        captionColor: 'white',
        tandem: tandem.createTandem('neutronBucket'),
        phetioState: options.phetioState
      }),
      electronBucket: new SphereBucket({
        position: new Vector2(BUCKET_WIDTH * 1.1, BUCKET_Y_OFFSET),
        size: new Dimension2(BUCKET_WIDTH, BUCKET_HEIGHT),
        sphereRadius: ShredConstants.ELECTRON_RADIUS,
        usableWidthProportion: 0.8,
        baseColor: 'blue',
        captionText: electronsString,
        captionColor: 'white',
        tandem: tandem.createTandem('electronBucket'),
        phetioState: options.phetioState
      })
    };

    // Define a function that will decide where to put nucleons.
    function placeNucleon(particle, bucket, atom) {
      if (particle.positionProperty.get().distance(atom.positionProperty.get()) < NUCLEON_CAPTURE_RADIUS) {
        atom.addParticle(particle);
      } else {
        bucket.addParticleNearestOpen(particle, true);
      }
    }

    // Define the arrays where the subatomic particles will reside.
    this.nucleons = [];
    this.electrons = [];

    // Add the protons.
    const protonTandem = tandem.createTandem('protons');
    const neutronTandem = tandem.createTandem('neutrons');
    const electronTandem = tandem.createTandem('electrons');
    _.times(NUM_PROTONS, index => {
      const proton = new Particle('proton', {
        tandem: protonTandem.createTandem(`proton${index}`),
        maxZLayer: BAAScreenView.NUM_NUCLEON_LAYERS - 1
      });
      this.nucleons.push(proton);
      this.buckets.protonBucket.addParticleFirstOpen(proton, false);
      proton.userControlledProperty.link(userControlled => {
        if (!userControlled && !this.buckets.protonBucket.containsParticle(proton)) {
          placeNucleon(proton, this.buckets.protonBucket, this.particleAtom);
        }
      });
    });

    // Add the neutrons.
    _.times(NUM_NEUTRONS, index => {
      const neutron = new Particle('neutron', {
        tandem: neutronTandem.createTandem(`neutron${index}`),
        maxZLayer: BAAScreenView.NUM_NUCLEON_LAYERS - 1
      });
      this.nucleons.push(neutron);
      this.buckets.neutronBucket.addParticleFirstOpen(neutron, false);
      neutron.userControlledProperty.link(userControlled => {
        if (!userControlled && !this.buckets.neutronBucket.containsParticle(neutron)) {
          placeNucleon(neutron, this.buckets.neutronBucket, this.particleAtom);
        }
      });
    });

    // Add the electrons.
    _.times(NUM_ELECTRONS, index => {
      const electron = new Particle('electron', {
        tandem: electronTandem.createTandem(`electron${index}`),
        maxZLayer: BAAScreenView.NUM_NUCLEON_LAYERS - 1
      });
      this.electrons.push(electron);
      this.buckets.electronBucket.addParticleFirstOpen(electron, false);
      electron.userControlledProperty.link(userControlled => {
        if (!userControlled && !this.buckets.electronBucket.containsParticle(electron)) {
          if (electron.positionProperty.get().distance(Vector2.ZERO) < this.particleAtom.outerElectronShellRadius * 1.1) {
            this.particleAtom.addParticle(electron);
          } else {
            this.buckets.electronBucket.addParticleNearestOpen(electron, true);
          }
        }
      });
    });

    // Update the stability state and counter on changes.
    this.nucleusStableProperty = new DerivedProperty([this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty], (protonCount, neutronCount) => protonCount + neutronCount > 0 ? AtomIdentifier.isStable(protonCount, neutronCount) : true, {
      tandem: tandem.createTandem('nucleusStableProperty'),
      phetioState: options.phetioState,
      phetioValueType: BooleanIO
    });

    // @private - variables used to animate the nucleus when it is unstable
    this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
    this.nucleusOffset = Vector2.ZERO;

    // add a variable used when making the nucleus jump in order to indicate instability
    this.nucleusJumpCount = 0;
  }

  /**
   * release references
   * @public
   */
  dispose() {
    // DerivedProperties should be disposed first, see https://github.com/phetsims/axon/issues/167
    this.nucleusStableProperty.dispose();

    // next dispose the root (non-derived) properties
    this.showElementNameProperty.dispose();
    this.showNeutralOrIonProperty.dispose();
    this.showStableOrUnstableProperty.dispose();
    this.electronShellDepictionProperty.dispose();

    // etc...
    this.particleAtom.dispose();
    this.buckets.protonBucket.dispose();
    this.buckets.electronBucket.dispose();
    this.buckets.neutronBucket.dispose();
    this.electrons.forEach(electron => {
      electron.dispose();
    });
    this.nucleons.forEach(nucleon => {
      nucleon.dispose();
    });
  }

  // @public - main model step function, called by the framework
  step(dt) {
    // Update particle positions.
    this.nucleons.forEach(nucleon => {
      nucleon.step(dt);
    });
    this.electrons.forEach(electron => {
      electron.step(dt);
    });

    // Animate the unstable nucleus by making it jump periodically.
    if (!this.nucleusStableProperty.get() && this.showStableOrUnstableProperty.get()) {
      this.nucleusJumpCountdown -= dt;
      if (this.nucleusJumpCountdown <= 0) {
        this.nucleusJumpCountdown = NUCLEUS_JUMP_PERIOD;
        if (this.particleAtom.nucleusOffsetProperty.set(Vector2.ZERO)) {
          this.nucleusJumpCount++;
          const angle = JUMP_ANGLES[this.nucleusJumpCount % JUMP_ANGLES.length];
          const distance = JUMP_DISTANCES[this.nucleusJumpCount % JUMP_DISTANCES.length];
          this.particleAtom.nucleusOffsetProperty.set(new Vector2(Math.cos(angle) * distance, Math.sin(angle) * distance));
        } else {
          this.particleAtom.nucleusOffsetProperty.set(Vector2.ZERO);
        }
      }
    } else if (this.particleAtom.nucleusOffsetProperty.get() !== Vector2.ZERO) {
      // animation is not running, make sure nucleus is in center of atom
      this.particleAtom.nucleusOffsetProperty.set(Vector2.ZERO);
    }
  }

  // @private
  _moveParticlesFromAtomToBucket(particleCollection, bucket) {
    const particlesToRemove = [];
    // Copy the observable particle collection into a regular array.
    for (let i = 0; i < particleCollection.length; i++) {
      particlesToRemove[i] = particleCollection.get(i);
    }
    particlesToRemove.forEach(particle => {
      this.particleAtom.removeParticle(particle);
      bucket.addParticleFirstOpen(particle);
    });
  }

  // @public
  reset() {
    this.showElementNameProperty.reset();
    this.showNeutralOrIonProperty.reset();
    this.showStableOrUnstableProperty.reset();
    this.electronShellDepictionProperty.reset();

    // Move any particles that are in transit back to its bucket.
    this.nucleons.forEach(nucleon => {
      if (!nucleon.positionProperty.get().equals(nucleon.destinationProperty.get())) {
        nucleon.moveImmediatelyToDestination();
      }
    });
    this.electrons.forEach(electron => {
      if (!electron.positionProperty.get().equals(electron.destinationProperty.get())) {
        electron.moveImmediatelyToDestination();
      }
    });

    // Remove all particles from the particle atom.
    this.particleAtom.clear();

    // Remove all particles from the buckets.
    this.buckets.protonBucket.reset();
    this.buckets.neutronBucket.reset();
    this.buckets.electronBucket.reset();

    // Add all the particles back to their buckets so that they are
    // stacked in their original configurations.
    this.nucleons.forEach(nucleon => {
      if (nucleon.type === 'proton') {
        this.buckets.protonBucket.addParticleFirstOpen(nucleon, false);
      } else {
        this.buckets.neutronBucket.addParticleFirstOpen(nucleon, false);
      }
    });
    this.electrons.forEach(electron => {
      this.buckets.electronBucket.addParticleFirstOpen(electron, false);
    });
  }

  // @public - set the atom to the specified configuration
  setAtomConfiguration(numberAtom) {
    // Define a function for transferring particles from buckets to atom.
    const atomCenter = this.particleAtom.positionProperty.get();
    const moveParticlesToAtom = (currentCountInAtom, targetCountInAtom, particlesInAtom, bucket) => {
      while (currentCountInAtom < targetCountInAtom) {
        const particle = bucket.extractClosestParticle(atomCenter);
        particle.setPositionAndDestination(atomCenter);
        particle.userControlledProperty.set(false); // Necessary to make it look like user released particle.
        currentCountInAtom++;
      }
      while (currentCountInAtom > targetCountInAtom) {
        this._moveParticlesFromAtomToBucket(particlesInAtom, bucket);
        currentCountInAtom--;
      }
    };

    // Move the particles.
    moveParticlesToAtom(this.particleAtom.protons.length, numberAtom.protonCountProperty.get(), this.particleAtom.protons, this.buckets.protonBucket);
    moveParticlesToAtom(this.particleAtom.neutrons.length, numberAtom.neutronCountProperty.get(), this.particleAtom.neutrons, this.buckets.neutronBucket);
    moveParticlesToAtom(this.particleAtom.electrons.length, numberAtom.electronCountProperty.get(), this.particleAtom.electrons, this.buckets.electronBucket);

    // Finalize particle positions.
    this.particleAtom.moveAllParticlesToDestination();
  }
}

// Externally visible constants
BuildAnAtomModel.MAX_CHARGE = Math.max(NUM_PROTONS, NUM_ELECTRONS);
BuildAnAtomModel.MAX_ELECTRONS = NUM_ELECTRONS;
buildAnAtom.register('BuildAnAtomModel', BuildAnAtomModel);
export default BuildAnAtomModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJTdHJpbmdQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJWZWN0b3IyIiwibWVyZ2UiLCJTcGhlcmVCdWNrZXQiLCJQaGV0Q29sb3JTY2hlbWUiLCJBdG9tSWRlbnRpZmllciIsIlBhcnRpY2xlIiwiUGFydGljbGVBdG9tIiwiU2hyZWRDb25zdGFudHMiLCJCb29sZWFuSU8iLCJidWlsZEFuQXRvbSIsIkJ1aWxkQW5BdG9tU3RyaW5ncyIsIkJBQVNjcmVlblZpZXciLCJlbGVjdHJvbnNTdHJpbmciLCJlbGVjdHJvbnMiLCJuZXV0cm9uc1N0cmluZyIsIm5ldXRyb25zIiwicHJvdG9uc1N0cmluZyIsInByb3RvbnMiLCJOVU1fUFJPVE9OUyIsIk5VTV9ORVVUUk9OUyIsIk5VTV9FTEVDVFJPTlMiLCJOVUNMRU9OX0NBUFRVUkVfUkFESVVTIiwiQlVDS0VUX1dJRFRIIiwiQlVDS0VUX0hFSUdIVCIsIkJVQ0tFVF9ZX09GRlNFVCIsIk5VQ0xFVVNfSlVNUF9QRVJJT0QiLCJNQVhfTlVDTEVVU19KVU1QIiwiTlVDTEVPTl9SQURJVVMiLCJKVU1QX0FOR0xFUyIsIk1hdGgiLCJQSSIsIkpVTVBfRElTVEFOQ0VTIiwiQnVpbGRBbkF0b21Nb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwib3B0aW9ucyIsInBoZXRpb1N0YXRlIiwic2hvd0VsZW1lbnROYW1lUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJzaG93TmV1dHJhbE9ySW9uUHJvcGVydHkiLCJzaG93U3RhYmxlT3JVbnN0YWJsZVByb3BlcnR5IiwiZWxlY3Ryb25TaGVsbERlcGljdGlvblByb3BlcnR5IiwidmFsaWRWYWx1ZXMiLCJwYXJ0aWNsZUF0b20iLCJidWNrZXRzIiwicHJvdG9uQnVja2V0IiwicG9zaXRpb24iLCJzaXplIiwic3BoZXJlUmFkaXVzIiwiYmFzZUNvbG9yIiwiUkVEX0NPTE9SQkxJTkQiLCJjYXB0aW9uVGV4dCIsImNhcHRpb25Db2xvciIsIm5ldXRyb25CdWNrZXQiLCJlbGVjdHJvbkJ1Y2tldCIsIkVMRUNUUk9OX1JBRElVUyIsInVzYWJsZVdpZHRoUHJvcG9ydGlvbiIsInBsYWNlTnVjbGVvbiIsInBhcnRpY2xlIiwiYnVja2V0IiwiYXRvbSIsInBvc2l0aW9uUHJvcGVydHkiLCJnZXQiLCJkaXN0YW5jZSIsImFkZFBhcnRpY2xlIiwiYWRkUGFydGljbGVOZWFyZXN0T3BlbiIsIm51Y2xlb25zIiwicHJvdG9uVGFuZGVtIiwibmV1dHJvblRhbmRlbSIsImVsZWN0cm9uVGFuZGVtIiwiXyIsInRpbWVzIiwiaW5kZXgiLCJwcm90b24iLCJtYXhaTGF5ZXIiLCJOVU1fTlVDTEVPTl9MQVlFUlMiLCJwdXNoIiwiYWRkUGFydGljbGVGaXJzdE9wZW4iLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwibGluayIsInVzZXJDb250cm9sbGVkIiwiY29udGFpbnNQYXJ0aWNsZSIsIm5ldXRyb24iLCJlbGVjdHJvbiIsIlpFUk8iLCJvdXRlckVsZWN0cm9uU2hlbGxSYWRpdXMiLCJudWNsZXVzU3RhYmxlUHJvcGVydHkiLCJwcm90b25Db3VudFByb3BlcnR5IiwibmV1dHJvbkNvdW50UHJvcGVydHkiLCJwcm90b25Db3VudCIsIm5ldXRyb25Db3VudCIsImlzU3RhYmxlIiwicGhldGlvVmFsdWVUeXBlIiwibnVjbGV1c0p1bXBDb3VudGRvd24iLCJudWNsZXVzT2Zmc2V0IiwibnVjbGV1c0p1bXBDb3VudCIsImRpc3Bvc2UiLCJmb3JFYWNoIiwibnVjbGVvbiIsInN0ZXAiLCJkdCIsIm51Y2xldXNPZmZzZXRQcm9wZXJ0eSIsInNldCIsImFuZ2xlIiwibGVuZ3RoIiwiY29zIiwic2luIiwiX21vdmVQYXJ0aWNsZXNGcm9tQXRvbVRvQnVja2V0IiwicGFydGljbGVDb2xsZWN0aW9uIiwicGFydGljbGVzVG9SZW1vdmUiLCJpIiwicmVtb3ZlUGFydGljbGUiLCJyZXNldCIsImVxdWFscyIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJtb3ZlSW1tZWRpYXRlbHlUb0Rlc3RpbmF0aW9uIiwiY2xlYXIiLCJ0eXBlIiwic2V0QXRvbUNvbmZpZ3VyYXRpb24iLCJudW1iZXJBdG9tIiwiYXRvbUNlbnRlciIsIm1vdmVQYXJ0aWNsZXNUb0F0b20iLCJjdXJyZW50Q291bnRJbkF0b20iLCJ0YXJnZXRDb3VudEluQXRvbSIsInBhcnRpY2xlc0luQXRvbSIsImV4dHJhY3RDbG9zZXN0UGFydGljbGUiLCJzZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uIiwiZWxlY3Ryb25Db3VudFByb3BlcnR5IiwibW92ZUFsbFBhcnRpY2xlc1RvRGVzdGluYXRpb24iLCJNQVhfQ0hBUkdFIiwibWF4IiwiTUFYX0VMRUNUUk9OUyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQnVpbGRBbkF0b21Nb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIG1vZGVsIG9mIGEgc2V0IG9mIHN1YmF0b21pYyBwYXJ0aWNsZXMgLSBwcm90b25zLCBuZXV0cm9ucywgYW5kIGVsZWN0cm9ucyAtIHRoYXQgY2FuIGJlIGFzc2VtYmxlZCBpbnRvIGF0b21zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgU3RyaW5nUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9TdHJpbmdQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IFNwaGVyZUJ1Y2tldCBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL21vZGVsL1NwaGVyZUJ1Y2tldC5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCBBdG9tSWRlbnRpZmllciBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9BdG9tSWRlbnRpZmllci5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy9tb2RlbC9QYXJ0aWNsZS5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZUF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvUGFydGljbGVBdG9tLmpzJztcclxuaW1wb3J0IFNocmVkQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL1NocmVkQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJvb2xlYW5JTyBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvQm9vbGVhbklPLmpzJztcclxuaW1wb3J0IGJ1aWxkQW5BdG9tIGZyb20gJy4uLy4uL2J1aWxkQW5BdG9tLmpzJztcclxuaW1wb3J0IEJ1aWxkQW5BdG9tU3RyaW5ncyBmcm9tICcuLi8uLi9CdWlsZEFuQXRvbVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgQkFBU2NyZWVuVmlldyBmcm9tICcuLi92aWV3L0JBQVNjcmVlblZpZXcuanMnO1xyXG5cclxuY29uc3QgZWxlY3Ryb25zU3RyaW5nID0gQnVpbGRBbkF0b21TdHJpbmdzLmVsZWN0cm9ucztcclxuY29uc3QgbmV1dHJvbnNTdHJpbmcgPSBCdWlsZEFuQXRvbVN0cmluZ3MubmV1dHJvbnM7XHJcbmNvbnN0IHByb3RvbnNTdHJpbmcgPSBCdWlsZEFuQXRvbVN0cmluZ3MucHJvdG9ucztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVU1fUFJPVE9OUyA9IDEwO1xyXG5jb25zdCBOVU1fTkVVVFJPTlMgPSAxMztcclxuY29uc3QgTlVNX0VMRUNUUk9OUyA9IDEwO1xyXG5jb25zdCBOVUNMRU9OX0NBUFRVUkVfUkFESVVTID0gMTAwO1xyXG5jb25zdCBCVUNLRVRfV0lEVEggPSAxMjA7XHJcbmNvbnN0IEJVQ0tFVF9IRUlHSFQgPSBCVUNLRVRfV0lEVEggKiAwLjQ1O1xyXG5jb25zdCBCVUNLRVRfWV9PRkZTRVQgPSAtMjA1O1xyXG5jb25zdCBOVUNMRVVTX0pVTVBfUEVSSU9EID0gMC4xOyAvLyBpbiBzZWNvbmRzXHJcbmNvbnN0IE1BWF9OVUNMRVVTX0pVTVAgPSBTaHJlZENvbnN0YW50cy5OVUNMRU9OX1JBRElVUyAqIDAuNTtcclxuY29uc3QgSlVNUF9BTkdMRVMgPSBbIE1hdGguUEkgKiAwLjEsIE1hdGguUEkgKiAxLjYsIE1hdGguUEkgKiAwLjcsIE1hdGguUEkgKiAxLjEsIE1hdGguUEkgKiAwLjMgXTtcclxuY29uc3QgSlVNUF9ESVNUQU5DRVMgPSBbIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjQsIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjgsIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjIsIE1BWF9OVUNMRVVTX0pVTVAgKiAwLjkgXTtcclxuXHJcbmNsYXNzIEJ1aWxkQW5BdG9tTW9kZWwge1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3RvciBmb3IgbWFpbiBtb2RlbCBvYmplY3QuXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBwaGV0aW9TdGF0ZTogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFByb3BlcnRpZXMgdGhhdCBjb250cm9sIGxhYmVsIHZpc2liaWxpdHkgaW4gdGhlIHZpZXcuXHJcbiAgICB0aGlzLnNob3dFbGVtZW50TmFtZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93RWxlbWVudE5hbWVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IG9wdGlvbnMucGhldGlvU3RhdGVcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2hvd05ldXRyYWxPcklvblByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93TmV1dHJhbE9ySW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnNob3dTdGFibGVPclVuc3RhYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzaG93U3RhYmxlT3JVbnN0YWJsZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogb3B0aW9ucy5waGV0aW9TdGF0ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFByb3BlcnR5IHRoYXQgY29udHJvbHMgZWxlY3Ryb24gZGVwaWN0aW9uIGluIHRoZSB2aWV3LlxyXG4gICAgdGhpcy5lbGVjdHJvblNoZWxsRGVwaWN0aW9uUHJvcGVydHkgPSBuZXcgU3RyaW5nUHJvcGVydHkoICdvcmJpdHMnLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uU2hlbGxEZXBpY3Rpb25Qcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IG9wdGlvbnMucGhldGlvU3RhdGUsXHJcbiAgICAgIHZhbGlkVmFsdWVzOiBbICdvcmJpdHMnLCAnY2xvdWQnIF1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGF0b20gdGhhdCB0aGUgdXNlciB3aWxsIGJ1aWxkLCBtb2RpZnksIGFuZCBnZW5lcmFsbHkgcGxheSB3aXRoLlxyXG4gICAgdGhpcy5wYXJ0aWNsZUF0b20gPSBuZXcgUGFydGljbGVBdG9tKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcnRpY2xlQXRvbScgKSxcclxuICAgICAgcGhldGlvU3RhdGU6IG9wdGlvbnMucGhldGlvU3RhdGVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGJ1Y2tldHMgdGhhdCB3aWxsIGhvbGQgdGhlIHN1Yi1hdG9taWMgcGFydGljbGVzLlxyXG4gICAgdGhpcy5idWNrZXRzID0ge1xyXG4gICAgICBwcm90b25CdWNrZXQ6IG5ldyBTcGhlcmVCdWNrZXQoIHtcclxuICAgICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC1CVUNLRVRfV0lEVEggKiAxLjEsIEJVQ0tFVF9ZX09GRlNFVCApLFxyXG4gICAgICAgIHNpemU6IG5ldyBEaW1lbnNpb24yKCBCVUNLRVRfV0lEVEgsIEJVQ0tFVF9IRUlHSFQgKSxcclxuICAgICAgICBzcGhlcmVSYWRpdXM6IFNocmVkQ29uc3RhbnRzLk5VQ0xFT05fUkFESVVTLFxyXG4gICAgICAgIGJhc2VDb2xvcjogUGhldENvbG9yU2NoZW1lLlJFRF9DT0xPUkJMSU5ELFxyXG4gICAgICAgIGNhcHRpb25UZXh0OiBwcm90b25zU3RyaW5nLFxyXG4gICAgICAgIGNhcHRpb25Db2xvcjogJ3doaXRlJyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcm90b25CdWNrZXQnICksXHJcbiAgICAgICAgcGhldGlvU3RhdGU6IG9wdGlvbnMucGhldGlvU3RhdGVcclxuICAgICAgfSApLFxyXG4gICAgICBuZXV0cm9uQnVja2V0OiBuZXcgU3BoZXJlQnVja2V0KCB7XHJcbiAgICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCBCVUNLRVRfWV9PRkZTRVQgKSxcclxuICAgICAgICBzaXplOiBuZXcgRGltZW5zaW9uMiggQlVDS0VUX1dJRFRILCBCVUNLRVRfSEVJR0hUICksXHJcbiAgICAgICAgc3BoZXJlUmFkaXVzOiBTaHJlZENvbnN0YW50cy5OVUNMRU9OX1JBRElVUyxcclxuICAgICAgICBiYXNlQ29sb3I6ICdyZ2IoIDEwMCwgMTAwLCAxMDAgKScsXHJcbiAgICAgICAgY2FwdGlvblRleHQ6IG5ldXRyb25zU3RyaW5nLFxyXG4gICAgICAgIGNhcHRpb25Db2xvcjogJ3doaXRlJyxcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICduZXV0cm9uQnVja2V0JyApLFxyXG4gICAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlXHJcbiAgICAgIH0gKSxcclxuICAgICAgZWxlY3Ryb25CdWNrZXQ6IG5ldyBTcGhlcmVCdWNrZXQoIHtcclxuICAgICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIEJVQ0tFVF9XSURUSCAqIDEuMSwgQlVDS0VUX1lfT0ZGU0VUICksXHJcbiAgICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIEJVQ0tFVF9XSURUSCwgQlVDS0VUX0hFSUdIVCApLFxyXG4gICAgICAgIHNwaGVyZVJhZGl1czogU2hyZWRDb25zdGFudHMuRUxFQ1RST05fUkFESVVTLFxyXG4gICAgICAgIHVzYWJsZVdpZHRoUHJvcG9ydGlvbjogMC44LFxyXG4gICAgICAgIGJhc2VDb2xvcjogJ2JsdWUnLFxyXG4gICAgICAgIGNhcHRpb25UZXh0OiBlbGVjdHJvbnNTdHJpbmcsXHJcbiAgICAgICAgY2FwdGlvbkNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uQnVja2V0JyApLFxyXG4gICAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlXHJcbiAgICAgIH0gKVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBEZWZpbmUgYSBmdW5jdGlvbiB0aGF0IHdpbGwgZGVjaWRlIHdoZXJlIHRvIHB1dCBudWNsZW9ucy5cclxuICAgIGZ1bmN0aW9uIHBsYWNlTnVjbGVvbiggcGFydGljbGUsIGJ1Y2tldCwgYXRvbSApIHtcclxuICAgICAgaWYgKCBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBhdG9tLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkgKSA8IE5VQ0xFT05fQ0FQVFVSRV9SQURJVVMgKSB7XHJcbiAgICAgICAgYXRvbS5hZGRQYXJ0aWNsZSggcGFydGljbGUgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBidWNrZXQuYWRkUGFydGljbGVOZWFyZXN0T3BlbiggcGFydGljbGUsIHRydWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIERlZmluZSB0aGUgYXJyYXlzIHdoZXJlIHRoZSBzdWJhdG9taWMgcGFydGljbGVzIHdpbGwgcmVzaWRlLlxyXG4gICAgdGhpcy5udWNsZW9ucyA9IFtdO1xyXG4gICAgdGhpcy5lbGVjdHJvbnMgPSBbXTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHByb3RvbnMuXHJcbiAgICBjb25zdCBwcm90b25UYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvdG9ucycgKTtcclxuICAgIGNvbnN0IG5ldXRyb25UYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbmV1dHJvbnMnICk7XHJcbiAgICBjb25zdCBlbGVjdHJvblRhbmRlbSA9IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbnMnICk7XHJcbiAgICBfLnRpbWVzKCBOVU1fUFJPVE9OUywgaW5kZXggPT4ge1xyXG4gICAgICBjb25zdCBwcm90b24gPSBuZXcgUGFydGljbGUoICdwcm90b24nLCB7XHJcbiAgICAgICAgdGFuZGVtOiBwcm90b25UYW5kZW0uY3JlYXRlVGFuZGVtKCBgcHJvdG9uJHtpbmRleH1gICksXHJcbiAgICAgICAgbWF4WkxheWVyOiBCQUFTY3JlZW5WaWV3Lk5VTV9OVUNMRU9OX0xBWUVSUyAtIDFcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLm51Y2xlb25zLnB1c2goIHByb3RvbiApO1xyXG4gICAgICB0aGlzLmJ1Y2tldHMucHJvdG9uQnVja2V0LmFkZFBhcnRpY2xlRmlyc3RPcGVuKCBwcm90b24sIGZhbHNlICk7XHJcbiAgICAgIHByb3Rvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgICBpZiAoICF1c2VyQ29udHJvbGxlZCAmJiAhdGhpcy5idWNrZXRzLnByb3RvbkJ1Y2tldC5jb250YWluc1BhcnRpY2xlKCBwcm90b24gKSApIHtcclxuICAgICAgICAgIHBsYWNlTnVjbGVvbiggcHJvdG9uLCB0aGlzLmJ1Y2tldHMucHJvdG9uQnVja2V0LCB0aGlzLnBhcnRpY2xlQXRvbSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbmV1dHJvbnMuXHJcbiAgICBfLnRpbWVzKCBOVU1fTkVVVFJPTlMsIGluZGV4ID0+IHtcclxuICAgICAgY29uc3QgbmV1dHJvbiA9IG5ldyBQYXJ0aWNsZSggJ25ldXRyb24nLCB7XHJcbiAgICAgICAgdGFuZGVtOiBuZXV0cm9uVGFuZGVtLmNyZWF0ZVRhbmRlbSggYG5ldXRyb24ke2luZGV4fWAgKSxcclxuICAgICAgICBtYXhaTGF5ZXI6IEJBQVNjcmVlblZpZXcuTlVNX05VQ0xFT05fTEFZRVJTIC0gMVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMubnVjbGVvbnMucHVzaCggbmV1dHJvbiApO1xyXG4gICAgICB0aGlzLmJ1Y2tldHMubmV1dHJvbkJ1Y2tldC5hZGRQYXJ0aWNsZUZpcnN0T3BlbiggbmV1dHJvbiwgZmFsc2UgKTtcclxuICAgICAgbmV1dHJvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgICBpZiAoICF1c2VyQ29udHJvbGxlZCAmJiAhdGhpcy5idWNrZXRzLm5ldXRyb25CdWNrZXQuY29udGFpbnNQYXJ0aWNsZSggbmV1dHJvbiApICkge1xyXG4gICAgICAgICAgcGxhY2VOdWNsZW9uKCBuZXV0cm9uLCB0aGlzLmJ1Y2tldHMubmV1dHJvbkJ1Y2tldCwgdGhpcy5wYXJ0aWNsZUF0b20gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGVsZWN0cm9ucy5cclxuICAgIF8udGltZXMoIE5VTV9FTEVDVFJPTlMsIGluZGV4ID0+IHtcclxuICAgICAgY29uc3QgZWxlY3Ryb24gPSBuZXcgUGFydGljbGUoICdlbGVjdHJvbicsIHtcclxuICAgICAgICB0YW5kZW06IGVsZWN0cm9uVGFuZGVtLmNyZWF0ZVRhbmRlbSggYGVsZWN0cm9uJHtpbmRleH1gICksXHJcbiAgICAgICAgbWF4WkxheWVyOiBCQUFTY3JlZW5WaWV3Lk5VTV9OVUNMRU9OX0xBWUVSUyAtIDFcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmVsZWN0cm9ucy5wdXNoKCBlbGVjdHJvbiApO1xyXG4gICAgICB0aGlzLmJ1Y2tldHMuZWxlY3Ryb25CdWNrZXQuYWRkUGFydGljbGVGaXJzdE9wZW4oIGVsZWN0cm9uLCBmYWxzZSApO1xyXG4gICAgICBlbGVjdHJvbi51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgICBpZiAoICF1c2VyQ29udHJvbGxlZCAmJiAhdGhpcy5idWNrZXRzLmVsZWN0cm9uQnVja2V0LmNvbnRhaW5zUGFydGljbGUoIGVsZWN0cm9uICkgKSB7XHJcbiAgICAgICAgICBpZiAoIGVsZWN0cm9uLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIFZlY3RvcjIuWkVSTyApIDwgdGhpcy5wYXJ0aWNsZUF0b20ub3V0ZXJFbGVjdHJvblNoZWxsUmFkaXVzICogMS4xICkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlQXRvbS5hZGRQYXJ0aWNsZSggZWxlY3Ryb24gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmJ1Y2tldHMuZWxlY3Ryb25CdWNrZXQuYWRkUGFydGljbGVOZWFyZXN0T3BlbiggZWxlY3Ryb24sIHRydWUgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHN0YWJpbGl0eSBzdGF0ZSBhbmQgY291bnRlciBvbiBjaGFuZ2VzLlxyXG4gICAgdGhpcy5udWNsZXVzU3RhYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMucGFydGljbGVBdG9tLnByb3RvbkNvdW50UHJvcGVydHksIHRoaXMucGFydGljbGVBdG9tLm5ldXRyb25Db3VudFByb3BlcnR5IF0sXHJcbiAgICAgICggcHJvdG9uQ291bnQsIG5ldXRyb25Db3VudCApID0+IHByb3RvbkNvdW50ICsgbmV1dHJvbkNvdW50ID4gMCA/IEF0b21JZGVudGlmaWVyLmlzU3RhYmxlKCBwcm90b25Db3VudCwgbmV1dHJvbkNvdW50ICkgOiB0cnVlLFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVjbGV1c1N0YWJsZVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1N0YXRlOiBvcHRpb25zLnBoZXRpb1N0YXRlLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm9vbGVhbklPXHJcbiAgICAgIH1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSB2YXJpYWJsZXMgdXNlZCB0byBhbmltYXRlIHRoZSBudWNsZXVzIHdoZW4gaXQgaXMgdW5zdGFibGVcclxuICAgIHRoaXMubnVjbGV1c0p1bXBDb3VudGRvd24gPSBOVUNMRVVTX0pVTVBfUEVSSU9EO1xyXG4gICAgdGhpcy5udWNsZXVzT2Zmc2V0ID0gVmVjdG9yMi5aRVJPO1xyXG5cclxuICAgIC8vIGFkZCBhIHZhcmlhYmxlIHVzZWQgd2hlbiBtYWtpbmcgdGhlIG51Y2xldXMganVtcCBpbiBvcmRlciB0byBpbmRpY2F0ZSBpbnN0YWJpbGl0eVxyXG4gICAgdGhpcy5udWNsZXVzSnVtcENvdW50ID0gMDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlbGVhc2UgcmVmZXJlbmNlc1xyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG5cclxuICAgIC8vIERlcml2ZWRQcm9wZXJ0aWVzIHNob3VsZCBiZSBkaXNwb3NlZCBmaXJzdCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8xNjdcclxuICAgIHRoaXMubnVjbGV1c1N0YWJsZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuXHJcbiAgICAvLyBuZXh0IGRpc3Bvc2UgdGhlIHJvb3QgKG5vbi1kZXJpdmVkKSBwcm9wZXJ0aWVzXHJcbiAgICB0aGlzLnNob3dFbGVtZW50TmFtZVByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuc2hvd05ldXRyYWxPcklvblByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuc2hvd1N0YWJsZU9yVW5zdGFibGVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmVsZWN0cm9uU2hlbGxEZXBpY3Rpb25Qcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgLy8gZXRjLi4uXHJcbiAgICB0aGlzLnBhcnRpY2xlQXRvbS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmJ1Y2tldHMucHJvdG9uQnVja2V0LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuYnVja2V0cy5lbGVjdHJvbkJ1Y2tldC5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmJ1Y2tldHMubmV1dHJvbkJ1Y2tldC5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmVsZWN0cm9ucy5mb3JFYWNoKCBlbGVjdHJvbiA9PiB7IGVsZWN0cm9uLmRpc3Bvc2UoKTt9ICk7XHJcbiAgICB0aGlzLm51Y2xlb25zLmZvckVhY2goIG51Y2xlb24gPT4geyBudWNsZW9uLmRpc3Bvc2UoKTt9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljIC0gbWFpbiBtb2RlbCBzdGVwIGZ1bmN0aW9uLCBjYWxsZWQgYnkgdGhlIGZyYW1ld29ya1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIFVwZGF0ZSBwYXJ0aWNsZSBwb3NpdGlvbnMuXHJcbiAgICB0aGlzLm51Y2xlb25zLmZvckVhY2goIG51Y2xlb24gPT4ge1xyXG4gICAgICBudWNsZW9uLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmVsZWN0cm9ucy5mb3JFYWNoKCBlbGVjdHJvbiA9PiB7XHJcbiAgICAgIGVsZWN0cm9uLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQW5pbWF0ZSB0aGUgdW5zdGFibGUgbnVjbGV1cyBieSBtYWtpbmcgaXQganVtcCBwZXJpb2RpY2FsbHkuXHJcbiAgICBpZiAoICF0aGlzLm51Y2xldXNTdGFibGVQcm9wZXJ0eS5nZXQoKSAmJiB0aGlzLnNob3dTdGFibGVPclVuc3RhYmxlUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMubnVjbGV1c0p1bXBDb3VudGRvd24gLT0gZHQ7XHJcbiAgICAgIGlmICggdGhpcy5udWNsZXVzSnVtcENvdW50ZG93biA8PSAwICkge1xyXG4gICAgICAgIHRoaXMubnVjbGV1c0p1bXBDb3VudGRvd24gPSBOVUNMRVVTX0pVTVBfUEVSSU9EO1xyXG4gICAgICAgIGlmICggdGhpcy5wYXJ0aWNsZUF0b20ubnVjbGV1c09mZnNldFByb3BlcnR5LnNldCggVmVjdG9yMi5aRVJPICkgKSB7XHJcbiAgICAgICAgICB0aGlzLm51Y2xldXNKdW1wQ291bnQrKztcclxuICAgICAgICAgIGNvbnN0IGFuZ2xlID0gSlVNUF9BTkdMRVNbIHRoaXMubnVjbGV1c0p1bXBDb3VudCAlIEpVTVBfQU5HTEVTLmxlbmd0aCBdO1xyXG4gICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBKVU1QX0RJU1RBTkNFU1sgdGhpcy5udWNsZXVzSnVtcENvdW50ICUgSlVNUF9ESVNUQU5DRVMubGVuZ3RoIF07XHJcbiAgICAgICAgICB0aGlzLnBhcnRpY2xlQXRvbS5udWNsZXVzT2Zmc2V0UHJvcGVydHkuc2V0KFxyXG4gICAgICAgICAgICBuZXcgVmVjdG9yMiggTWF0aC5jb3MoIGFuZ2xlICkgKiBkaXN0YW5jZSwgTWF0aC5zaW4oIGFuZ2xlICkgKiBkaXN0YW5jZSApXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucGFydGljbGVBdG9tLm51Y2xldXNPZmZzZXRQcm9wZXJ0eS5zZXQoIFZlY3RvcjIuWkVSTyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMucGFydGljbGVBdG9tLm51Y2xldXNPZmZzZXRQcm9wZXJ0eS5nZXQoKSAhPT0gVmVjdG9yMi5aRVJPICkge1xyXG5cclxuICAgICAgLy8gYW5pbWF0aW9uIGlzIG5vdCBydW5uaW5nLCBtYWtlIHN1cmUgbnVjbGV1cyBpcyBpbiBjZW50ZXIgb2YgYXRvbVxyXG4gICAgICB0aGlzLnBhcnRpY2xlQXRvbS5udWNsZXVzT2Zmc2V0UHJvcGVydHkuc2V0KCBWZWN0b3IyLlpFUk8gKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEBwcml2YXRlXHJcbiAgX21vdmVQYXJ0aWNsZXNGcm9tQXRvbVRvQnVja2V0KCBwYXJ0aWNsZUNvbGxlY3Rpb24sIGJ1Y2tldCApIHtcclxuICAgIGNvbnN0IHBhcnRpY2xlc1RvUmVtb3ZlID0gW107XHJcbiAgICAvLyBDb3B5IHRoZSBvYnNlcnZhYmxlIHBhcnRpY2xlIGNvbGxlY3Rpb24gaW50byBhIHJlZ3VsYXIgYXJyYXkuXHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwYXJ0aWNsZUNvbGxlY3Rpb24ubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHBhcnRpY2xlc1RvUmVtb3ZlWyBpIF0gPSBwYXJ0aWNsZUNvbGxlY3Rpb24uZ2V0KCBpICk7XHJcbiAgICB9XHJcbiAgICBwYXJ0aWNsZXNUb1JlbW92ZS5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgdGhpcy5wYXJ0aWNsZUF0b20ucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7XHJcbiAgICAgICAgYnVja2V0LmFkZFBhcnRpY2xlRmlyc3RPcGVuKCBwYXJ0aWNsZSApO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlc2V0KCkge1xyXG4gICAgdGhpcy5zaG93RWxlbWVudE5hbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5zaG93TmV1dHJhbE9ySW9uUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd1N0YWJsZU9yVW5zdGFibGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbGVjdHJvblNoZWxsRGVwaWN0aW9uUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBNb3ZlIGFueSBwYXJ0aWNsZXMgdGhhdCBhcmUgaW4gdHJhbnNpdCBiYWNrIHRvIGl0cyBidWNrZXQuXHJcbiAgICB0aGlzLm51Y2xlb25zLmZvckVhY2goIG51Y2xlb24gPT4ge1xyXG4gICAgICBpZiAoICFudWNsZW9uLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZXF1YWxzKCBudWNsZW9uLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkgKSApIHtcclxuICAgICAgICBudWNsZW9uLm1vdmVJbW1lZGlhdGVseVRvRGVzdGluYXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5lbGVjdHJvbnMuZm9yRWFjaCggZWxlY3Ryb24gPT4ge1xyXG4gICAgICBpZiAoICFlbGVjdHJvbi5wb3NpdGlvblByb3BlcnR5LmdldCgpLmVxdWFscyggZWxlY3Ryb24uZGVzdGluYXRpb25Qcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgIGVsZWN0cm9uLm1vdmVJbW1lZGlhdGVseVRvRGVzdGluYXRpb24oKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFJlbW92ZSBhbGwgcGFydGljbGVzIGZyb20gdGhlIHBhcnRpY2xlIGF0b20uXHJcbiAgICB0aGlzLnBhcnRpY2xlQXRvbS5jbGVhcigpO1xyXG5cclxuICAgIC8vIFJlbW92ZSBhbGwgcGFydGljbGVzIGZyb20gdGhlIGJ1Y2tldHMuXHJcbiAgICB0aGlzLmJ1Y2tldHMucHJvdG9uQnVja2V0LnJlc2V0KCk7XHJcbiAgICB0aGlzLmJ1Y2tldHMubmV1dHJvbkJ1Y2tldC5yZXNldCgpO1xyXG4gICAgdGhpcy5idWNrZXRzLmVsZWN0cm9uQnVja2V0LnJlc2V0KCk7XHJcblxyXG4gICAgLy8gQWRkIGFsbCB0aGUgcGFydGljbGVzIGJhY2sgdG8gdGhlaXIgYnVja2V0cyBzbyB0aGF0IHRoZXkgYXJlXHJcbiAgICAvLyBzdGFja2VkIGluIHRoZWlyIG9yaWdpbmFsIGNvbmZpZ3VyYXRpb25zLlxyXG4gICAgdGhpcy5udWNsZW9ucy5mb3JFYWNoKCBudWNsZW9uID0+IHtcclxuICAgICAgaWYgKCBudWNsZW9uLnR5cGUgPT09ICdwcm90b24nICkge1xyXG4gICAgICAgIHRoaXMuYnVja2V0cy5wcm90b25CdWNrZXQuYWRkUGFydGljbGVGaXJzdE9wZW4oIG51Y2xlb24sIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5idWNrZXRzLm5ldXRyb25CdWNrZXQuYWRkUGFydGljbGVGaXJzdE9wZW4oIG51Y2xlb24sIGZhbHNlICk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuZWxlY3Ryb25zLmZvckVhY2goIGVsZWN0cm9uID0+IHtcclxuICAgICAgdGhpcy5idWNrZXRzLmVsZWN0cm9uQnVja2V0LmFkZFBhcnRpY2xlRmlyc3RPcGVuKCBlbGVjdHJvbiwgZmFsc2UgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWMgLSBzZXQgdGhlIGF0b20gdG8gdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uXHJcbiAgc2V0QXRvbUNvbmZpZ3VyYXRpb24oIG51bWJlckF0b20gKSB7XHJcblxyXG4gICAgLy8gRGVmaW5lIGEgZnVuY3Rpb24gZm9yIHRyYW5zZmVycmluZyBwYXJ0aWNsZXMgZnJvbSBidWNrZXRzIHRvIGF0b20uXHJcbiAgICBjb25zdCBhdG9tQ2VudGVyID0gdGhpcy5wYXJ0aWNsZUF0b20ucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKTtcclxuICAgIGNvbnN0IG1vdmVQYXJ0aWNsZXNUb0F0b20gPSAoIGN1cnJlbnRDb3VudEluQXRvbSwgdGFyZ2V0Q291bnRJbkF0b20sIHBhcnRpY2xlc0luQXRvbSwgYnVja2V0ICkgPT4ge1xyXG4gICAgICB3aGlsZSAoIGN1cnJlbnRDb3VudEluQXRvbSA8IHRhcmdldENvdW50SW5BdG9tICkge1xyXG4gICAgICAgIGNvbnN0IHBhcnRpY2xlID0gYnVja2V0LmV4dHJhY3RDbG9zZXN0UGFydGljbGUoIGF0b21DZW50ZXIgKTtcclxuICAgICAgICBwYXJ0aWNsZS5zZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uKCBhdG9tQ2VudGVyICk7XHJcbiAgICAgICAgcGFydGljbGUudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7IC8vIE5lY2Vzc2FyeSB0byBtYWtlIGl0IGxvb2sgbGlrZSB1c2VyIHJlbGVhc2VkIHBhcnRpY2xlLlxyXG4gICAgICAgIGN1cnJlbnRDb3VudEluQXRvbSsrO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlICggY3VycmVudENvdW50SW5BdG9tID4gdGFyZ2V0Q291bnRJbkF0b20gKSB7XHJcbiAgICAgICAgdGhpcy5fbW92ZVBhcnRpY2xlc0Zyb21BdG9tVG9CdWNrZXQoIHBhcnRpY2xlc0luQXRvbSwgYnVja2V0ICk7XHJcbiAgICAgICAgY3VycmVudENvdW50SW5BdG9tLS07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgcGFydGljbGVzLlxyXG4gICAgbW92ZVBhcnRpY2xlc1RvQXRvbSggdGhpcy5wYXJ0aWNsZUF0b20ucHJvdG9ucy5sZW5ndGgsXHJcbiAgICAgIG51bWJlckF0b20ucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5wYXJ0aWNsZUF0b20ucHJvdG9ucyxcclxuICAgICAgdGhpcy5idWNrZXRzLnByb3RvbkJ1Y2tldFxyXG4gICAgKTtcclxuICAgIG1vdmVQYXJ0aWNsZXNUb0F0b20oXHJcbiAgICAgIHRoaXMucGFydGljbGVBdG9tLm5ldXRyb25zLmxlbmd0aCxcclxuICAgICAgbnVtYmVyQXRvbS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgdGhpcy5wYXJ0aWNsZUF0b20ubmV1dHJvbnMsXHJcbiAgICAgIHRoaXMuYnVja2V0cy5uZXV0cm9uQnVja2V0XHJcbiAgICApO1xyXG4gICAgbW92ZVBhcnRpY2xlc1RvQXRvbShcclxuICAgICAgdGhpcy5wYXJ0aWNsZUF0b20uZWxlY3Ryb25zLmxlbmd0aCxcclxuICAgICAgbnVtYmVyQXRvbS5lbGVjdHJvbkNvdW50UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIHRoaXMucGFydGljbGVBdG9tLmVsZWN0cm9ucyxcclxuICAgICAgdGhpcy5idWNrZXRzLmVsZWN0cm9uQnVja2V0XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEZpbmFsaXplIHBhcnRpY2xlIHBvc2l0aW9ucy5cclxuICAgIHRoaXMucGFydGljbGVBdG9tLm1vdmVBbGxQYXJ0aWNsZXNUb0Rlc3RpbmF0aW9uKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBFeHRlcm5hbGx5IHZpc2libGUgY29uc3RhbnRzXHJcbkJ1aWxkQW5BdG9tTW9kZWwuTUFYX0NIQVJHRSA9IE1hdGgubWF4KCBOVU1fUFJPVE9OUywgTlVNX0VMRUNUUk9OUyApO1xyXG5CdWlsZEFuQXRvbU1vZGVsLk1BWF9FTEVDVFJPTlMgPSBOVU1fRUxFQ1RST05TO1xyXG5cclxuYnVpbGRBbkF0b20ucmVnaXN0ZXIoICdCdWlsZEFuQXRvbU1vZGVsJywgQnVpbGRBbkF0b21Nb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQnVpbGRBbkF0b21Nb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsWUFBWSxNQUFNLGlEQUFpRDtBQUMxRSxPQUFPQyxlQUFlLE1BQU0sZ0RBQWdEO0FBQzVFLE9BQU9DLGNBQWMsTUFBTSx3Q0FBd0M7QUFDbkUsT0FBT0MsUUFBUSxNQUFNLHdDQUF3QztBQUM3RCxPQUFPQyxZQUFZLE1BQU0sNENBQTRDO0FBQ3JFLE9BQU9DLGNBQWMsTUFBTSx3Q0FBd0M7QUFDbkUsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxhQUFhLE1BQU0sMEJBQTBCO0FBRXBELE1BQU1DLGVBQWUsR0FBR0Ysa0JBQWtCLENBQUNHLFNBQVM7QUFDcEQsTUFBTUMsY0FBYyxHQUFHSixrQkFBa0IsQ0FBQ0ssUUFBUTtBQUNsRCxNQUFNQyxhQUFh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