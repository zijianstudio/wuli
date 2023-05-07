// Copyright 2014-2023, University of Colorado Boulder

/**
 * A model element that represents an atom that is composed of a set of modeled subatomic particles. This model element
 * manages the positions and motion of all particles that are a part of the atom.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import LinearFunction from '../../../dot/js/LinearFunction.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import arrayRemove from '../../../phet-core/js/arrayRemove.js';
import merge from '../../../phet-core/js/merge.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import { Color } from '../../../scenery/js/imports.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import Animation from '../../../twixt/js/Animation.js';
import Easing from '../../../twixt/js/Easing.js';
import AtomIdentifier from '../AtomIdentifier.js';
import shred from '../shred.js';
import ShredConstants from '../ShredConstants.js';
import Utils from '../Utils.js';
import Particle from './Particle.js';

// constants
const NUM_ELECTRON_POSITIONS = 10; // first two electron shells, i.e. 2 + 8

// color gradient between the color of a proton and a neutron
const NUCLEON_COLOR_GRADIENT = [PhetColorScheme.RED_COLORBLIND, new Color('#e06020'),
// 1/4 point
new Color('#c06b40'),
// half-way point
new Color('#a07660'),
// 3/4 point
Color.GRAY];
class ParticleAtom extends PhetioObject {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      innerElectronShellRadius: 85,
      outerElectronShellRadius: 130,
      nucleonRadius: ShredConstants.NUCLEON_RADIUS,
      tandem: Tandem.REQUIRED,
      phetioType: ParticleAtom.ParticleAtomIO
    }, options);
    super(options);
    this.nucleonRadius = options.nucleonRadius; // @private

    // @public
    this.positionProperty = new Vector2Property(Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: options.tandem.createTandem('positionProperty')
    });
    this.nucleusOffsetProperty = new Vector2Property(Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: options.tandem.createTandem('nucleusOffsetProperty')
    });

    // @private - particle collections
    this.protons = createObservableArray({
      // tandem: options.tandem.createTandem( 'protons' ),
      phetioType: createObservableArray.ObservableArrayIO(Particle.ParticleIO)
    });
    this.neutrons = createObservableArray({
      // tandem: options.tandem.createTandem( 'neutrons' ),
      phetioType: createObservableArray.ObservableArrayIO(Particle.ParticleIO)
    });
    this.electrons = createObservableArray({
      // tandem: options.tandem.createTandem( 'electrons' ),
      phetioType: createObservableArray.ObservableArrayIO(Particle.ParticleIO)
    });

    // array of all live animations
    this.liveAnimations = createObservableArray();
    this.liveAnimations.addItemRemovedListener(animation => {
      animation && animation.stop();
      animation = null;
    });

    // @public (read-only) - individual count properties for each particle type
    this.protonCountProperty = this.protons.lengthProperty;
    this.neutronCountProperty = this.neutrons.lengthProperty;
    this.electronCountProperty = this.electrons.lengthProperty;

    // @public (read-only) - derived properties based on the number of particles present in the atom
    this.chargeProperty = new DerivedProperty([this.protonCountProperty, this.electronCountProperty], (protonCount, electronCount) => {
      return protonCount - electronCount;
    }, {
      tandem: options.tandem.createTandem('chargeProperty'),
      numberType: 'Integer',
      phetioValueType: NumberIO
    });
    this.massNumberProperty = new DerivedProperty([this.protonCountProperty, this.neutronCountProperty], (protonCount, neutronCount) => {
      return protonCount + neutronCount;
    }, {
      tandem: options.tandem.createTandem('massNumberProperty'),
      numberType: 'Integer',
      phetioValueType: NumberIO
    });
    this.particleCountProperty = new DerivedProperty([this.protonCountProperty, this.neutronCountProperty, this.electronCountProperty], (protonCount, neutronCount, electronCount) => {
      return protonCount + neutronCount + electronCount;
    }, {
      tandem: options.tandem.createTandem('particleCountProperty'),
      numberType: 'Integer',
      phetioValueType: NumberIO
    });

    // Make shell radii publicly accessible.
    this.innerElectronShellRadius = options.innerElectronShellRadius; // @public
    this.outerElectronShellRadius = options.outerElectronShellRadius; // @public

    // Set the default electron add/remove mode.  Valid values are 'proximal' and 'random'.
    this.electronAddMode = 'proximal'; // @private

    // Initialize the positions where an electron can be placed.
    this.electronShellPositions = new Array(NUM_ELECTRON_POSITIONS); // @private
    this.electronShellPositions[0] = {
      electron: null,
      position: new Vector2(this.innerElectronShellRadius, 0)
    };
    this.electronShellPositions[1] = {
      electron: null,
      position: new Vector2(-this.innerElectronShellRadius, 0)
    };
    const numSlotsInOuterShell = 8;

    // Stagger inner and outer electron shell positions, tweaked a bit for better interaction with labels.
    let angle = Math.PI / numSlotsInOuterShell * 1.2;
    for (let i = 0; i < numSlotsInOuterShell; i++) {
      this.electronShellPositions[i + 2] = {
        electron: null,
        position: new Vector2(Math.cos(angle) * this.outerElectronShellRadius, Math.sin(angle) * this.outerElectronShellRadius)
      };
      angle += 2 * Math.PI / numSlotsInOuterShell;
    }

    // When an electron is removed, clear the corresponding shell position.
    const self = this;
    this.electrons.addItemRemovedListener(electron => {
      self.electronShellPositions.forEach(electronShellPosition => {
        if (electronShellPosition.electron === electron) {
          electronShellPosition.electron = null;
          if (Math.abs(electronShellPosition.position.magnitude - self.innerElectronShellRadius) < 1E-5) {
            // An inner-shell electron was removed.  If there are electrons in the outer shell, move one of them in.
            let occupiedOuterShellPositions = _.filter(self.electronShellPositions, electronShellPosition => {
              return electronShellPosition.electron !== null && Utils.roughlyEqual(electronShellPosition.position.magnitude, self.outerElectronShellRadius, 1E-5);
            });
            occupiedOuterShellPositions = _.sortBy(occupiedOuterShellPositions, occupiedShellPosition => {
              return occupiedShellPosition.position.distance(electronShellPosition.position);
            });
            if (occupiedOuterShellPositions.length > 0) {
              // Move outer electron to inner spot.
              electronShellPosition.electron = occupiedOuterShellPositions[0].electron;
              occupiedOuterShellPositions[0].electron = null;
              electronShellPosition.electron.destinationProperty.set(electronShellPosition.position);
            }
          }
        }
      });
    });

    // Utility function to translate all particles.
    const translateParticle = function (particle, translation) {
      if (particle.positionProperty.get().equals(particle.destinationProperty.get())) {
        particle.setPositionAndDestination(particle.positionProperty.get().plus(translation));
      } else {
        // Particle is moving, only change the destination.
        particle.destinationProperty.set(particle.destinationProperty.get().plus(translation));
      }
    };

    // When the nucleus offset changes, update all nucleon positions.
    this.nucleusOffsetProperty.link((newOffset, oldOffset) => {
      const translation = oldOffset === null ? Vector2.ZERO : newOffset.minus(oldOffset);
      this.protons.forEach(particle => {
        translateParticle(particle, translation);
      });
      this.neutrons.forEach(particle => {
        translateParticle(particle, translation);
      });
    });

    // When the particle position changes, update all nucleon positions.  This is to be used in Isotopes and Atomic
    // Mass when a particle gets moved to sit at the correct spot on the scale.
    this.positionProperty.link((newOffset, oldOffset) => {
      const translation = oldOffset === null ? Vector2.ZERO : newOffset.minus(oldOffset);
      this.protons.forEach(particle => {
        translateParticle(particle, translation);
      });
      this.neutrons.forEach(particle => {
        translateParticle(particle, translation);
      });
    });
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.particleCountProperty.dispose();
    this.massNumberProperty.dispose();
    this.chargeProperty.dispose();
    this.positionProperty.dispose();
    this.nucleusOffsetProperty.dispose();

    // @private - particle collections
    this.protons.dispose();
    this.neutrons.dispose();
    this.electrons.dispose();
    super.dispose();
  }

  /**
   * Test that this particle atom contains a particular particle.
   * @param {Particle} particle
   * @returns {boolean}
   * @public
   */
  containsParticle(particle) {
    return this.protons.includes(particle) || this.neutrons.includes(particle) || this.electrons.includes(particle);
  }

  /**
   * Add a particle to the atom.
   * @param {Particle} particle
   * @public
   */
  addParticle(particle) {
    // In phet-io mode we can end up with attempts being made to add the same particle twice when state is being set, so
    // test for that case and bail if needed.
    if (Tandem.PHET_IO_ENABLED && this.containsParticle(particle)) {
      // Looks like someone beat us to it.
      return;
    }
    const self = this;
    if (particle.type === 'proton' || particle.type === 'neutron') {
      // Create a listener that will be called when this particle is removed.
      const nucleonRemovedListener = function (userControlled) {
        if (userControlled && particleArray.includes(particle)) {
          particleArray.remove(particle);
          self.reconfigureNucleus();
          particle.zLayerProperty.set(0);
          particle.userControlledProperty.unlink(nucleonRemovedListener);
          delete particle.particleAtomRemovalListener;
        }
      };
      particle.userControlledProperty.lazyLink(nucleonRemovedListener);

      // Attach the listener to the particle so that it can be unlinked when the particle is removed.
      particle.particleAtomRemovalListener = nucleonRemovedListener;

      // Add the particle and update the counts.
      const particleArray = particle.type === 'proton' ? this.protons : this.neutrons;
      particleArray.push(particle);
      this.reconfigureNucleus();
    } else if (particle.type === 'electron') {
      this.electrons.push(particle);

      // Find an open position in the electron shell.
      const openPositions = this.electronShellPositions.filter(electronPosition => {
        return electronPosition.electron === null;
      });
      let sortedOpenPositions;
      if (this.electronAddMode === 'proximal') {
        sortedOpenPositions = openPositions.sort((p1, p2) => {
          // Sort first by distance to particle.
          return particle.positionProperty.get().distance(p1.position) - particle.positionProperty.get().distance(p2.position);
        });
      } else {
        sortedOpenPositions = dotRandom.shuffle(openPositions);
      }

      // Put the inner shell positions in front.
      sortedOpenPositions = sortedOpenPositions.sort((p1, p2) => {
        return self.positionProperty.get().distance(p1.position) - self.positionProperty.get().distance(p2.position);
      });
      assert && assert(sortedOpenPositions.length > 0, 'No open positions found for electrons');
      sortedOpenPositions[0].electron = particle;
      particle.destinationProperty.set(sortedOpenPositions[0].position);

      // Listen for removal of the electron and handle it.
      const electronRemovedListener = function (userControlled) {
        if (userControlled && self.electrons.includes(particle)) {
          self.electrons.remove(particle);
          particle.zLayerProperty.set(0);
          particle.userControlledProperty.unlink(electronRemovedListener);
          delete particle.particleAtomRemovalListener;
        }
      };
      particle.userControlledProperty.lazyLink(electronRemovedListener);

      // Set the listener as an attribute of the particle to aid unlinking in some cases.
      particle.particleAtomRemovalListener = electronRemovedListener;
    } else {
      assert && assert(false, 'Unexpected particle type ' + particle.type);
    }
  }

  /**
   * Remove the specified particle from this particle atom.
   * @param {Particle} particle
   * @public
   */
  removeParticle(particle) {
    if (this.protons.includes(particle)) {
      this.protons.remove(particle);
    } else if (this.neutrons.includes(particle)) {
      this.neutrons.remove(particle);
    } else if (this.electrons.includes(particle)) {
      this.electrons.remove(particle);
    } else {
      throw new Error('Attempt to remove particle that is not in this particle atom.');
    }
    assert && assert(typeof particle.particleAtomRemovalListener === 'function', 'No particle removal listener attached to particle.');
    particle.userControlledProperty.unlink(particle.particleAtomRemovalListener);
    delete particle.particleAtomRemovalListener;
  }

  /**
   * Extract an arbitrary instance of the specified particle, assuming one exists.
   * @param {string} particleType
   * @returns {Particle} particle
   * @public
   */
  extractParticle(particleType) {
    let particle = null;
    switch (particleType) {
      case 'proton':
        if (this.protons.length > 0) {
          particle = this.protons.get(this.protons.length - 1);
        }
        break;
      case 'neutron':
        if (this.neutrons.length > 0) {
          particle = this.neutrons.get(this.neutrons.length - 1);
        }
        break;
      case 'electron':
        if (this.electrons.length > 0) {
          particle = this.electrons.get(this.electrons.length - 1);
        }
        break;
      default:
        throw new Error('Attempt to remove unknown particle type.');
    }
    if (particle !== null) {
      this.removeParticle(particle);
    }
    return particle;
  }

  /**
   * Remove all the particles but don't reconfigure the nucleus as they go. This makes it a quicker operation.
   * @public
   */
  clear() {
    const protons = [...this.protons];
    protons.forEach(particle => {
      this.removeParticle(particle);
    });
    const neutrons = [...this.neutrons];
    neutrons.forEach(particle => {
      this.removeParticle(particle);
    });
    const electrons = [...this.electrons];
    electrons.forEach(particle => {
      this.removeParticle(particle);
    });
    this.liveAnimations.clear();
  }

  /**
   * Move all the particles to their destinations. This is generally used when animation is not desired.
   * @public
   */
  moveAllParticlesToDestination() {
    this.protons.forEach(p => {
      p.moveImmediatelyToDestination();
    });
    this.neutrons.forEach(p => {
      p.moveImmediatelyToDestination();
    });
    this.electrons.forEach(p => {
      p.moveImmediatelyToDestination();
    });
  }

  // @public
  getWeight() {
    return this.protonCountProperty.get() + this.neutronCountProperty.get();
  }

  // @public
  getCharge() {
    return this.protonCountProperty.get() - this.electronCountProperty.get();
  }

  // @public
  getIsotopeAtomicMass() {
    return AtomIdentifier.getIsotopeAtomicMass(this.protonCountProperty.get(), this.neutronCountProperty.get());
  }

  // @public
  reconfigureNucleus() {
    // Convenience variables.
    const centerX = this.positionProperty.get().x + this.nucleusOffsetProperty.get().x;
    const centerY = this.positionProperty.get().y + this.nucleusOffsetProperty.get().y;
    const nucleonRadius = this.nucleonRadius;
    let angle;
    let distFromCenter;

    // Create an array of interspersed protons and neutrons for configuring.
    const nucleons = [];
    let protonIndex = 0;
    let neutronIndex = 0;
    const neutronsPerProton = this.neutrons.length / this.protons.length;
    let neutronsToAdd = 0;
    while (nucleons.length < this.neutrons.length + this.protons.length) {
      neutronsToAdd += neutronsPerProton;
      while (neutronsToAdd >= 1 && neutronIndex < this.neutrons.length) {
        nucleons.push(this.neutrons.get(neutronIndex++));
        neutronsToAdd -= 1;
      }
      if (protonIndex < this.protons.length) {
        nucleons.push(this.protons.get(protonIndex++));
      }
    }
    if (nucleons.length === 1) {
      // There is only one nucleon present, so place it in the center of the atom.
      nucleons[0].destinationProperty.set(new Vector2(centerX, centerY));
      nucleons[0].zLayerProperty.set(0);
    } else if (nucleons.length === 2) {
      // Two nucleons - place them side by side with their meeting point in the center.
      angle = 0.2 * 2 * Math.PI; // Angle arbitrarily chosen.
      nucleons[0].destinationProperty.set(new Vector2(centerX + nucleonRadius * Math.cos(angle), centerY + nucleonRadius * Math.sin(angle)));
      nucleons[0].zLayerProperty.set(0);
      nucleons[1].destinationProperty.set(new Vector2(centerX - nucleonRadius * Math.cos(angle), centerY - nucleonRadius * Math.sin(angle)));
      nucleons[1].zLayerProperty.set(0);
    } else if (nucleons.length === 3) {
      // Three nucleons - form a triangle where they all touch.
      angle = 0.7 * 2 * Math.PI; // Angle arbitrarily chosen.
      distFromCenter = nucleonRadius * 1.155;
      nucleons[0].destinationProperty.set(new Vector2(centerX + distFromCenter * Math.cos(angle), centerY + distFromCenter * Math.sin(angle)));
      nucleons[0].zLayerProperty.set(0);
      nucleons[1].destinationProperty.set(new Vector2(centerX + distFromCenter * Math.cos(angle + 2 * Math.PI / 3), centerY + distFromCenter * Math.sin(angle + 2 * Math.PI / 3)));
      nucleons[1].zLayerProperty.set(0);
      nucleons[2].destinationProperty.set(new Vector2(centerX + distFromCenter * Math.cos(angle + 4 * Math.PI / 3), centerY + distFromCenter * Math.sin(angle + 4 * Math.PI / 3)));
      nucleons[2].zLayerProperty.set(0);
    } else if (nucleons.length === 4) {
      // Four nucleons - make a sort of diamond shape with some overlap.
      angle = 1.4 * 2 * Math.PI; // Angle arbitrarily chosen.
      nucleons[0].destinationProperty.set(new Vector2(centerX + nucleonRadius * Math.cos(angle), centerY + nucleonRadius * Math.sin(angle)));
      nucleons[0].zLayerProperty.set(0);
      nucleons[2].destinationProperty.set(new Vector2(centerX - nucleonRadius * Math.cos(angle), centerY - nucleonRadius * Math.sin(angle)));
      nucleons[2].zLayerProperty.set(0);
      distFromCenter = nucleonRadius * 2 * Math.cos(Math.PI / 3);
      nucleons[1].destinationProperty.set(new Vector2(centerX + distFromCenter * Math.cos(angle + Math.PI / 2), centerY + distFromCenter * Math.sin(angle + Math.PI / 2)));
      nucleons[1].zLayerProperty.set(1);
      nucleons[3].destinationProperty.set(new Vector2(centerX - distFromCenter * Math.cos(angle + Math.PI / 2), centerY - distFromCenter * Math.sin(angle + Math.PI / 2)));
      nucleons[3].zLayerProperty.set(1);
    } else if (nucleons.length >= 5) {
      // This is a generalized algorithm that should work for five or more nucleons.
      let placementRadius = 0;
      let numAtThisRadius = 1;
      let level = 0;
      let placementAngle = 0;
      let placementAngleDelta = 0;

      // Scale correction for the next placement radius, linear map determined empirically. As the nucleon size
      // increases, we want the scale factor and change in placement radius to decrease since larger nucleons are
      // easier to see with larger area. Map values determined in cases which use a wide range in number of nucleons
      // and in cases where the nucleon radius scaled from 3 to 10 (in screen coordinates - roughly pixels).
      const radiusA = 3;
      const radiusB = 10;
      const scaleFactorA = 2.4;
      const scaleFactorB = 1.35;
      const scaleFunction = new LinearFunction(radiusA, radiusB, scaleFactorA, scaleFactorB, this.nucleonRadius);
      const scaleFactor = scaleFunction.evaluate(this.nucleonRadius);
      for (let i = 0; i < nucleons.length; i++) {
        nucleons[i].destinationProperty.set(new Vector2(centerX + placementRadius * Math.cos(placementAngle), centerY + placementRadius * Math.sin(placementAngle)));
        nucleons[i].zLayerProperty.set(level);
        numAtThisRadius--;
        if (numAtThisRadius > 0) {
          // Stay at the same radius and update the placement angle.
          placementAngle += placementAngleDelta;
        } else {
          // Move out to the next radius.
          level++;
          placementRadius += nucleonRadius * scaleFactor / level;
          placementAngle += 2 * Math.PI * 0.2 + level * Math.PI; // Arbitrary value chosen based on looks.
          numAtThisRadius = Math.floor(placementRadius * Math.PI / nucleonRadius);
          placementAngleDelta = 2 * Math.PI / numAtThisRadius;
        }
      }
    }
  }

  /**
   * Change the nucleon type of the provided particle to the other nucleon type.
   * @param {Particle} particle
   * @param animateAndRemoveParticle
   * @returns {Animation}
   * @public
   */
  changeNucleonType(particle, animateAndRemoveParticle) {
    assert && assert(this.containsParticle(particle), 'ParticleAtom does not contain this particle ' + particle.id);
    assert && assert(particle.type === 'proton' || particle.type === 'neutron', 'Particle type must be a proton or a neutron.');
    const isParticleTypeProton = particle.type === 'proton';
    const particleTypes = {
      newParticleType: isParticleTypeProton ? 'neutron' : 'proton',
      oldParticleArray: isParticleTypeProton ? this.protons : this.neutrons,
      newParticleArray: isParticleTypeProton ? this.neutrons : this.protons
    };
    particle.typeProperty.value = particleTypes.newParticleType;
    let nucleonChangeColorChange;
    if (particle.typeProperty.value === 'proton') {
      nucleonChangeColorChange = NUCLEON_COLOR_GRADIENT.slice().reverse();
    } else if (particle.typeProperty.value === 'neutron') {
      nucleonChangeColorChange = NUCLEON_COLOR_GRADIENT.slice();
    }

    // Animate through the values in nucleonColorChange to 'slowly' change the color of the nucleon.
    const initialColorChangeAnimation = new Animation({
      from: particle.colorGradientIndexNumberProperty.initialValue,
      to: 1,
      setValue: indexValue => {
        particle.colorGradientIndexNumberProperty.value = indexValue;
      },
      duration: 0.1,
      easing: Easing.LINEAR
    });
    const finalColorChangeAnimation = new Animation({
      from: 1,
      to: nucleonChangeColorChange.length - 1,
      setValue: indexValue => {
        particle.colorGradientIndexNumberProperty.value = indexValue;
      },
      duration: 0.4,
      easing: Easing.LINEAR
    });
    this.liveAnimations.push(initialColorChangeAnimation);
    this.liveAnimations.push(finalColorChangeAnimation);
    initialColorChangeAnimation.then(finalColorChangeAnimation);
    initialColorChangeAnimation.start();
    initialColorChangeAnimation.finishEmitter.addListener(() => {
      animateAndRemoveParticle();
    });

    // Defer the massNumberProperty links until the particle arrays are correct so the nucleus does not reconfigure.
    this.massNumberProperty.setDeferred(true);
    arrayRemove(particleTypes.oldParticleArray, particle);
    particleTypes.newParticleArray.push(particle);
    this.massNumberProperty.setDeferred(false);
    return initialColorChangeAnimation;
  }
}

// helper function for retrieving the tandem for a particle
const ParticleReferenceIO = ReferenceIO(Particle.ParticleIO);
const NullableParticleReferenceIO = NullableIO(ReferenceIO(Particle.ParticleIO));
ParticleAtom.ParticleAtomIO = new IOType('ParticleAtomIO', {
  valueType: ParticleAtom,
  documentation: 'A model of an atom that tracks and arranges the subatomic particles, i.e. protons, neutrons, ' + 'and electrons, of which it is comprised.  When particles are added, they are moved into the ' + 'appropriate places.  This object also keeps track of things like atomic number, mass number, and ' + 'charge.',
  toStateObject: particleAtom => ({
    // an array of all the particles currently contained within the particle atom
    residentParticleIDs: particleAtom.protons.map(ParticleReferenceIO.toStateObject).concat(particleAtom.neutrons.map(ParticleReferenceIO.toStateObject)).concat(particleAtom.electrons.map(ParticleReferenceIO.toStateObject)),
    // an ordered array that tracks which electron, if any, is in each shell position
    electronShellOccupantIDs: particleAtom.electronShellPositions.map(e => e.electron).map(NullableParticleReferenceIO.toStateObject)
  }),
  stateSchema: {
    residentParticleIDs: ArrayIO(ParticleReferenceIO),
    electronShellOccupantIDs: ArrayIO(NullableParticleReferenceIO)
  },
  applyState: (particleAtom, stateObject) => {
    // Remove all the particles from the observable arrays.
    particleAtom.clear();
    const deserializedState = {
      residentParticles: stateObject.residentParticleIDs.map(ParticleReferenceIO.fromStateObject),
      electronShellOccupants: stateObject.electronShellOccupantIDs.map(NullableParticleReferenceIO.fromStateObject)
    };

    // Add back the particles.
    deserializedState.residentParticles.forEach(value => {
      particleAtom.addParticle(value);
    });

    // Set the electron shell occupancy state.
    deserializedState.electronShellOccupants.forEach((electron, index) => {
      particleAtom.electronShellPositions[index].electron = electron;
    });
  }
});
shred.register('ParticleAtom', ParticleAtom);
export default ParticleAtom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJkb3RSYW5kb20iLCJMaW5lYXJGdW5jdGlvbiIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJhcnJheVJlbW92ZSIsIm1lcmdlIiwiUGhldENvbG9yU2NoZW1lIiwiQ29sb3IiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJBcnJheUlPIiwiSU9UeXBlIiwiTnVsbGFibGVJTyIsIk51bWJlcklPIiwiUmVmZXJlbmNlSU8iLCJBbmltYXRpb24iLCJFYXNpbmciLCJBdG9tSWRlbnRpZmllciIsInNocmVkIiwiU2hyZWRDb25zdGFudHMiLCJVdGlscyIsIlBhcnRpY2xlIiwiTlVNX0VMRUNUUk9OX1BPU0lUSU9OUyIsIk5VQ0xFT05fQ09MT1JfR1JBRElFTlQiLCJSRURfQ09MT1JCTElORCIsIkdSQVkiLCJQYXJ0aWNsZUF0b20iLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJpbm5lckVsZWN0cm9uU2hlbGxSYWRpdXMiLCJvdXRlckVsZWN0cm9uU2hlbGxSYWRpdXMiLCJudWNsZW9uUmFkaXVzIiwiTlVDTEVPTl9SQURJVVMiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsInBoZXRpb1R5cGUiLCJQYXJ0aWNsZUF0b21JTyIsInBvc2l0aW9uUHJvcGVydHkiLCJaRVJPIiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJjcmVhdGVUYW5kZW0iLCJudWNsZXVzT2Zmc2V0UHJvcGVydHkiLCJwcm90b25zIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJQYXJ0aWNsZUlPIiwibmV1dHJvbnMiLCJlbGVjdHJvbnMiLCJsaXZlQW5pbWF0aW9ucyIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJhbmltYXRpb24iLCJzdG9wIiwicHJvdG9uQ291bnRQcm9wZXJ0eSIsImxlbmd0aFByb3BlcnR5IiwibmV1dHJvbkNvdW50UHJvcGVydHkiLCJlbGVjdHJvbkNvdW50UHJvcGVydHkiLCJjaGFyZ2VQcm9wZXJ0eSIsInByb3RvbkNvdW50IiwiZWxlY3Ryb25Db3VudCIsIm51bWJlclR5cGUiLCJwaGV0aW9WYWx1ZVR5cGUiLCJtYXNzTnVtYmVyUHJvcGVydHkiLCJuZXV0cm9uQ291bnQiLCJwYXJ0aWNsZUNvdW50UHJvcGVydHkiLCJlbGVjdHJvbkFkZE1vZGUiLCJlbGVjdHJvblNoZWxsUG9zaXRpb25zIiwiQXJyYXkiLCJlbGVjdHJvbiIsInBvc2l0aW9uIiwibnVtU2xvdHNJbk91dGVyU2hlbGwiLCJhbmdsZSIsIk1hdGgiLCJQSSIsImkiLCJjb3MiLCJzaW4iLCJzZWxmIiwiZm9yRWFjaCIsImVsZWN0cm9uU2hlbGxQb3NpdGlvbiIsImFicyIsIm1hZ25pdHVkZSIsIm9jY3VwaWVkT3V0ZXJTaGVsbFBvc2l0aW9ucyIsIl8iLCJmaWx0ZXIiLCJyb3VnaGx5RXF1YWwiLCJzb3J0QnkiLCJvY2N1cGllZFNoZWxsUG9zaXRpb24iLCJkaXN0YW5jZSIsImxlbmd0aCIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJzZXQiLCJ0cmFuc2xhdGVQYXJ0aWNsZSIsInBhcnRpY2xlIiwidHJhbnNsYXRpb24iLCJnZXQiLCJlcXVhbHMiLCJzZXRQb3NpdGlvbkFuZERlc3RpbmF0aW9uIiwicGx1cyIsImxpbmsiLCJuZXdPZmZzZXQiLCJvbGRPZmZzZXQiLCJtaW51cyIsImRpc3Bvc2UiLCJjb250YWluc1BhcnRpY2xlIiwiaW5jbHVkZXMiLCJhZGRQYXJ0aWNsZSIsIlBIRVRfSU9fRU5BQkxFRCIsInR5cGUiLCJudWNsZW9uUmVtb3ZlZExpc3RlbmVyIiwidXNlckNvbnRyb2xsZWQiLCJwYXJ0aWNsZUFycmF5IiwicmVtb3ZlIiwicmVjb25maWd1cmVOdWNsZXVzIiwiekxheWVyUHJvcGVydHkiLCJ1c2VyQ29udHJvbGxlZFByb3BlcnR5IiwidW5saW5rIiwicGFydGljbGVBdG9tUmVtb3ZhbExpc3RlbmVyIiwibGF6eUxpbmsiLCJwdXNoIiwib3BlblBvc2l0aW9ucyIsImVsZWN0cm9uUG9zaXRpb24iLCJzb3J0ZWRPcGVuUG9zaXRpb25zIiwic29ydCIsInAxIiwicDIiLCJzaHVmZmxlIiwiYXNzZXJ0IiwiZWxlY3Ryb25SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVQYXJ0aWNsZSIsIkVycm9yIiwiZXh0cmFjdFBhcnRpY2xlIiwicGFydGljbGVUeXBlIiwiY2xlYXIiLCJtb3ZlQWxsUGFydGljbGVzVG9EZXN0aW5hdGlvbiIsInAiLCJtb3ZlSW1tZWRpYXRlbHlUb0Rlc3RpbmF0aW9uIiwiZ2V0V2VpZ2h0IiwiZ2V0Q2hhcmdlIiwiZ2V0SXNvdG9wZUF0b21pY01hc3MiLCJjZW50ZXJYIiwieCIsImNlbnRlclkiLCJ5IiwiZGlzdEZyb21DZW50ZXIiLCJudWNsZW9ucyIsInByb3RvbkluZGV4IiwibmV1dHJvbkluZGV4IiwibmV1dHJvbnNQZXJQcm90b24iLCJuZXV0cm9uc1RvQWRkIiwicGxhY2VtZW50UmFkaXVzIiwibnVtQXRUaGlzUmFkaXVzIiwibGV2ZWwiLCJwbGFjZW1lbnRBbmdsZSIsInBsYWNlbWVudEFuZ2xlRGVsdGEiLCJyYWRpdXNBIiwicmFkaXVzQiIsInNjYWxlRmFjdG9yQSIsInNjYWxlRmFjdG9yQiIsInNjYWxlRnVuY3Rpb24iLCJzY2FsZUZhY3RvciIsImV2YWx1YXRlIiwiZmxvb3IiLCJjaGFuZ2VOdWNsZW9uVHlwZSIsImFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZSIsImlkIiwiaXNQYXJ0aWNsZVR5cGVQcm90b24iLCJwYXJ0aWNsZVR5cGVzIiwibmV3UGFydGljbGVUeXBlIiwib2xkUGFydGljbGVBcnJheSIsIm5ld1BhcnRpY2xlQXJyYXkiLCJ0eXBlUHJvcGVydHkiLCJ2YWx1ZSIsIm51Y2xlb25DaGFuZ2VDb2xvckNoYW5nZSIsInNsaWNlIiwicmV2ZXJzZSIsImluaXRpYWxDb2xvckNoYW5nZUFuaW1hdGlvbiIsImZyb20iLCJjb2xvckdyYWRpZW50SW5kZXhOdW1iZXJQcm9wZXJ0eSIsImluaXRpYWxWYWx1ZSIsInRvIiwic2V0VmFsdWUiLCJpbmRleFZhbHVlIiwiZHVyYXRpb24iLCJlYXNpbmciLCJMSU5FQVIiLCJmaW5hbENvbG9yQ2hhbmdlQW5pbWF0aW9uIiwidGhlbiIsInN0YXJ0IiwiZmluaXNoRW1pdHRlciIsImFkZExpc3RlbmVyIiwic2V0RGVmZXJyZWQiLCJQYXJ0aWNsZVJlZmVyZW5jZUlPIiwiTnVsbGFibGVQYXJ0aWNsZVJlZmVyZW5jZUlPIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInRvU3RhdGVPYmplY3QiLCJwYXJ0aWNsZUF0b20iLCJyZXNpZGVudFBhcnRpY2xlSURzIiwibWFwIiwiY29uY2F0IiwiZWxlY3Ryb25TaGVsbE9jY3VwYW50SURzIiwiZSIsInN0YXRlU2NoZW1hIiwiYXBwbHlTdGF0ZSIsInN0YXRlT2JqZWN0IiwiZGVzZXJpYWxpemVkU3RhdGUiLCJyZXNpZGVudFBhcnRpY2xlcyIsImZyb21TdGF0ZU9iamVjdCIsImVsZWN0cm9uU2hlbGxPY2N1cGFudHMiLCJpbmRleCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGFydGljbGVBdG9tLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEEgbW9kZWwgZWxlbWVudCB0aGF0IHJlcHJlc2VudHMgYW4gYXRvbSB0aGF0IGlzIGNvbXBvc2VkIG9mIGEgc2V0IG9mIG1vZGVsZWQgc3ViYXRvbWljIHBhcnRpY2xlcy4gVGhpcyBtb2RlbCBlbGVtZW50XHJcbiAqIG1hbmFnZXMgdGhlIHBvc2l0aW9ucyBhbmQgbW90aW9uIG9mIGFsbCBwYXJ0aWNsZXMgdGhhdCBhcmUgYSBwYXJ0IG9mIHRoZSBhdG9tLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IGNyZWF0ZU9ic2VydmFibGVBcnJheSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL2NyZWF0ZU9ic2VydmFibGVBcnJheS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgTGluZWFyRnVuY3Rpb24gZnJvbSAnLi4vLi4vLi4vZG90L2pzL0xpbmVhckZ1bmN0aW9uLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMlByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Q29sb3JTY2hlbWUgZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRDb2xvclNjaGVtZS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBOdW1iZXJJTyBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvdHlwZXMvTnVtYmVySU8uanMnO1xyXG5pbXBvcnQgUmVmZXJlbmNlSU8gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1JlZmVyZW5jZUlPLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi8uLi8uLi90d2l4dC9qcy9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uLy4uLy4uL3R3aXh0L2pzL0Vhc2luZy5qcyc7XHJcbmltcG9ydCBBdG9tSWRlbnRpZmllciBmcm9tICcuLi9BdG9tSWRlbnRpZmllci5qcyc7XHJcbmltcG9ydCBzaHJlZCBmcm9tICcuLi9zaHJlZC5qcyc7XHJcbmltcG9ydCBTaHJlZENvbnN0YW50cyBmcm9tICcuLi9TaHJlZENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi9VdGlscy5qcyc7XHJcbmltcG9ydCBQYXJ0aWNsZSBmcm9tICcuL1BhcnRpY2xlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBOVU1fRUxFQ1RST05fUE9TSVRJT05TID0gMTA7IC8vIGZpcnN0IHR3byBlbGVjdHJvbiBzaGVsbHMsIGkuZS4gMiArIDhcclxuXHJcbi8vIGNvbG9yIGdyYWRpZW50IGJldHdlZW4gdGhlIGNvbG9yIG9mIGEgcHJvdG9uIGFuZCBhIG5ldXRyb25cclxuY29uc3QgTlVDTEVPTl9DT0xPUl9HUkFESUVOVCA9IFtcclxuICBQaGV0Q29sb3JTY2hlbWUuUkVEX0NPTE9SQkxJTkQsXHJcbiAgbmV3IENvbG9yKCAnI2UwNjAyMCcgKSwgLy8gMS80IHBvaW50XHJcbiAgbmV3IENvbG9yKCAnI2MwNmI0MCcgKSwgLy8gaGFsZi13YXkgcG9pbnRcclxuICBuZXcgQ29sb3IoICcjYTA3NjYwJyApLCAvLyAzLzQgcG9pbnRcclxuICBDb2xvci5HUkFZXHJcbl07XHJcblxyXG5jbGFzcyBQYXJ0aWNsZUF0b20gZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGlubmVyRWxlY3Ryb25TaGVsbFJhZGl1czogODUsXHJcbiAgICAgIG91dGVyRWxlY3Ryb25TaGVsbFJhZGl1czogMTMwLFxyXG4gICAgICBudWNsZW9uUmFkaXVzOiBTaHJlZENvbnN0YW50cy5OVUNMRU9OX1JBRElVUyxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHBoZXRpb1R5cGU6IFBhcnRpY2xlQXRvbS5QYXJ0aWNsZUF0b21JT1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5udWNsZW9uUmFkaXVzID0gb3B0aW9ucy5udWNsZW9uUmFkaXVzOyAvLyBAcHJpdmF0ZVxyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMucG9zaXRpb25Qcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwb3NpdGlvblByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLm51Y2xldXNPZmZzZXRQcm9wZXJ0eSA9IG5ldyBWZWN0b3IyUHJvcGVydHkoIFZlY3RvcjIuWkVSTywge1xyXG4gICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdudWNsZXVzT2Zmc2V0UHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHBhcnRpY2xlIGNvbGxlY3Rpb25zXHJcbiAgICB0aGlzLnByb3RvbnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgLy8gdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwcm90b25zJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFBhcnRpY2xlLlBhcnRpY2xlSU8gKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5uZXV0cm9ucyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgge1xyXG4gICAgICAvLyB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ25ldXRyb25zJyApLFxyXG4gICAgICBwaGV0aW9UeXBlOiBjcmVhdGVPYnNlcnZhYmxlQXJyYXkuT2JzZXJ2YWJsZUFycmF5SU8oIFBhcnRpY2xlLlBhcnRpY2xlSU8gKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5lbGVjdHJvbnMgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoIHtcclxuICAgICAgLy8gdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbnMnICksXHJcbiAgICAgIHBoZXRpb1R5cGU6IGNyZWF0ZU9ic2VydmFibGVBcnJheS5PYnNlcnZhYmxlQXJyYXlJTyggUGFydGljbGUuUGFydGljbGVJTyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYXJyYXkgb2YgYWxsIGxpdmUgYW5pbWF0aW9uc1xyXG4gICAgdGhpcy5saXZlQW5pbWF0aW9ucyA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG4gICAgdGhpcy5saXZlQW5pbWF0aW9ucy5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCBhbmltYXRpb24gPT4ge1xyXG4gICAgICBhbmltYXRpb24gJiYgYW5pbWF0aW9uLnN0b3AoKTtcclxuICAgICAgYW5pbWF0aW9uID0gbnVsbDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gaW5kaXZpZHVhbCBjb3VudCBwcm9wZXJ0aWVzIGZvciBlYWNoIHBhcnRpY2xlIHR5cGVcclxuICAgIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eSA9IHRoaXMucHJvdG9ucy5sZW5ndGhQcm9wZXJ0eTtcclxuICAgIHRoaXMubmV1dHJvbkNvdW50UHJvcGVydHkgPSB0aGlzLm5ldXRyb25zLmxlbmd0aFByb3BlcnR5O1xyXG4gICAgdGhpcy5lbGVjdHJvbkNvdW50UHJvcGVydHkgPSB0aGlzLmVsZWN0cm9ucy5sZW5ndGhQcm9wZXJ0eTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIC0gZGVyaXZlZCBwcm9wZXJ0aWVzIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgcGFydGljbGVzIHByZXNlbnQgaW4gdGhlIGF0b21cclxuICAgIHRoaXMuY2hhcmdlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eSwgdGhpcy5lbGVjdHJvbkNvdW50UHJvcGVydHkgXSxcclxuICAgICAgKCAoIHByb3RvbkNvdW50LCBlbGVjdHJvbkNvdW50ICkgPT4ge1xyXG4gICAgICAgIHJldHVybiBwcm90b25Db3VudCAtIGVsZWN0cm9uQ291bnQ7XHJcbiAgICAgIH0gKSxcclxuICAgICAge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnY2hhcmdlUHJvcGVydHknICksXHJcbiAgICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMubWFzc051bWJlclByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyB0aGlzLnByb3RvbkNvdW50UHJvcGVydHksIHRoaXMubmV1dHJvbkNvdW50UHJvcGVydHkgXSxcclxuICAgICAgKCAoIHByb3RvbkNvdW50LCBuZXV0cm9uQ291bnQgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvbkNvdW50ICsgbmV1dHJvbkNvdW50O1xyXG4gICAgICB9ICksXHJcbiAgICAgIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3NOdW1iZXJQcm9wZXJ0eScgKSxcclxuICAgICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdW1iZXJJT1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5wYXJ0aWNsZUNvdW50UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eSwgdGhpcy5uZXV0cm9uQ291bnRQcm9wZXJ0eSwgdGhpcy5lbGVjdHJvbkNvdW50UHJvcGVydHkgXSxcclxuICAgICAgKCAoIHByb3RvbkNvdW50LCBuZXV0cm9uQ291bnQsIGVsZWN0cm9uQ291bnQgKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHByb3RvbkNvdW50ICsgbmV1dHJvbkNvdW50ICsgZWxlY3Ryb25Db3VudDtcclxuICAgICAgfSApLFxyXG4gICAgICB7XHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXJ0aWNsZUNvdW50UHJvcGVydHknICksXHJcbiAgICAgICAgbnVtYmVyVHlwZTogJ0ludGVnZXInLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBNYWtlIHNoZWxsIHJhZGlpIHB1YmxpY2x5IGFjY2Vzc2libGUuXHJcbiAgICB0aGlzLmlubmVyRWxlY3Ryb25TaGVsbFJhZGl1cyA9IG9wdGlvbnMuaW5uZXJFbGVjdHJvblNoZWxsUmFkaXVzOyAvLyBAcHVibGljXHJcbiAgICB0aGlzLm91dGVyRWxlY3Ryb25TaGVsbFJhZGl1cyA9IG9wdGlvbnMub3V0ZXJFbGVjdHJvblNoZWxsUmFkaXVzOyAvLyBAcHVibGljXHJcblxyXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0IGVsZWN0cm9uIGFkZC9yZW1vdmUgbW9kZS4gIFZhbGlkIHZhbHVlcyBhcmUgJ3Byb3hpbWFsJyBhbmQgJ3JhbmRvbScuXHJcbiAgICB0aGlzLmVsZWN0cm9uQWRkTW9kZSA9ICdwcm94aW1hbCc7IC8vIEBwcml2YXRlXHJcblxyXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgcG9zaXRpb25zIHdoZXJlIGFuIGVsZWN0cm9uIGNhbiBiZSBwbGFjZWQuXHJcbiAgICB0aGlzLmVsZWN0cm9uU2hlbGxQb3NpdGlvbnMgPSBuZXcgQXJyYXkoIE5VTV9FTEVDVFJPTl9QT1NJVElPTlMgKTsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZWxlY3Ryb25TaGVsbFBvc2l0aW9uc1sgMCBdID0ge1xyXG4gICAgICBlbGVjdHJvbjogbnVsbCxcclxuICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCB0aGlzLmlubmVyRWxlY3Ryb25TaGVsbFJhZGl1cywgMCApXHJcbiAgICB9O1xyXG4gICAgdGhpcy5lbGVjdHJvblNoZWxsUG9zaXRpb25zWyAxIF0gPSB7XHJcbiAgICAgIGVsZWN0cm9uOiBudWxsLFxyXG4gICAgICBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC10aGlzLmlubmVyRWxlY3Ryb25TaGVsbFJhZGl1cywgMCApXHJcbiAgICB9O1xyXG4gICAgY29uc3QgbnVtU2xvdHNJbk91dGVyU2hlbGwgPSA4O1xyXG5cclxuICAgIC8vIFN0YWdnZXIgaW5uZXIgYW5kIG91dGVyIGVsZWN0cm9uIHNoZWxsIHBvc2l0aW9ucywgdHdlYWtlZCBhIGJpdCBmb3IgYmV0dGVyIGludGVyYWN0aW9uIHdpdGggbGFiZWxzLlxyXG4gICAgbGV0IGFuZ2xlID0gTWF0aC5QSSAvIG51bVNsb3RzSW5PdXRlclNoZWxsICogMS4yO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtU2xvdHNJbk91dGVyU2hlbGw7IGkrKyApIHtcclxuICAgICAgdGhpcy5lbGVjdHJvblNoZWxsUG9zaXRpb25zWyBpICsgMiBdID0ge1xyXG4gICAgICAgIGVsZWN0cm9uOiBudWxsLFxyXG4gICAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMihcclxuICAgICAgICAgIE1hdGguY29zKCBhbmdsZSApICogdGhpcy5vdXRlckVsZWN0cm9uU2hlbGxSYWRpdXMsXHJcbiAgICAgICAgICBNYXRoLnNpbiggYW5nbGUgKSAqIHRoaXMub3V0ZXJFbGVjdHJvblNoZWxsUmFkaXVzXHJcbiAgICAgICAgKVxyXG4gICAgICB9O1xyXG4gICAgICBhbmdsZSArPSAyICogTWF0aC5QSSAvIG51bVNsb3RzSW5PdXRlclNoZWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFdoZW4gYW4gZWxlY3Ryb24gaXMgcmVtb3ZlZCwgY2xlYXIgdGhlIGNvcnJlc3BvbmRpbmcgc2hlbGwgcG9zaXRpb24uXHJcbiAgICBjb25zdCBzZWxmID0gdGhpcztcclxuICAgIHRoaXMuZWxlY3Ryb25zLmFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIoIGVsZWN0cm9uID0+IHtcclxuICAgICAgc2VsZi5lbGVjdHJvblNoZWxsUG9zaXRpb25zLmZvckVhY2goIGVsZWN0cm9uU2hlbGxQb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgaWYgKCBlbGVjdHJvblNoZWxsUG9zaXRpb24uZWxlY3Ryb24gPT09IGVsZWN0cm9uICkge1xyXG4gICAgICAgICAgZWxlY3Ryb25TaGVsbFBvc2l0aW9uLmVsZWN0cm9uID0gbnVsbDtcclxuICAgICAgICAgIGlmICggTWF0aC5hYnMoIGVsZWN0cm9uU2hlbGxQb3NpdGlvbi5wb3NpdGlvbi5tYWduaXR1ZGUgLSBzZWxmLmlubmVyRWxlY3Ryb25TaGVsbFJhZGl1cyApIDwgMUUtNSApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEFuIGlubmVyLXNoZWxsIGVsZWN0cm9uIHdhcyByZW1vdmVkLiAgSWYgdGhlcmUgYXJlIGVsZWN0cm9ucyBpbiB0aGUgb3V0ZXIgc2hlbGwsIG1vdmUgb25lIG9mIHRoZW0gaW4uXHJcbiAgICAgICAgICAgIGxldCBvY2N1cGllZE91dGVyU2hlbGxQb3NpdGlvbnMgPSBfLmZpbHRlciggc2VsZi5lbGVjdHJvblNoZWxsUG9zaXRpb25zLCBlbGVjdHJvblNoZWxsUG9zaXRpb24gPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiAoIGVsZWN0cm9uU2hlbGxQb3NpdGlvbi5lbGVjdHJvbiAhPT0gbnVsbCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgIFV0aWxzLnJvdWdobHlFcXVhbCggZWxlY3Ryb25TaGVsbFBvc2l0aW9uLnBvc2l0aW9uLm1hZ25pdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub3V0ZXJFbGVjdHJvblNoZWxsUmFkaXVzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgMUUtNVxyXG4gICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICAgIG9jY3VwaWVkT3V0ZXJTaGVsbFBvc2l0aW9ucyA9IF8uc29ydEJ5KCBvY2N1cGllZE91dGVyU2hlbGxQb3NpdGlvbnMsIG9jY3VwaWVkU2hlbGxQb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG9jY3VwaWVkU2hlbGxQb3NpdGlvbi5wb3NpdGlvbi5kaXN0YW5jZSggZWxlY3Ryb25TaGVsbFBvc2l0aW9uLnBvc2l0aW9uICk7XHJcbiAgICAgICAgICAgIH0gKTtcclxuICAgICAgICAgICAgaWYgKCBvY2N1cGllZE91dGVyU2hlbGxQb3NpdGlvbnMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgICAgICAvLyBNb3ZlIG91dGVyIGVsZWN0cm9uIHRvIGlubmVyIHNwb3QuXHJcbiAgICAgICAgICAgICAgZWxlY3Ryb25TaGVsbFBvc2l0aW9uLmVsZWN0cm9uID0gb2NjdXBpZWRPdXRlclNoZWxsUG9zaXRpb25zWyAwIF0uZWxlY3Ryb247XHJcbiAgICAgICAgICAgICAgb2NjdXBpZWRPdXRlclNoZWxsUG9zaXRpb25zWyAwIF0uZWxlY3Ryb24gPSBudWxsO1xyXG4gICAgICAgICAgICAgIGVsZWN0cm9uU2hlbGxQb3NpdGlvbi5lbGVjdHJvbi5kZXN0aW5hdGlvblByb3BlcnR5LnNldCggZWxlY3Ryb25TaGVsbFBvc2l0aW9uLnBvc2l0aW9uICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVdGlsaXR5IGZ1bmN0aW9uIHRvIHRyYW5zbGF0ZSBhbGwgcGFydGljbGVzLlxyXG4gICAgY29uc3QgdHJhbnNsYXRlUGFydGljbGUgPSBmdW5jdGlvbiggcGFydGljbGUsIHRyYW5zbGF0aW9uICkge1xyXG4gICAgICBpZiAoIHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZXF1YWxzKCBwYXJ0aWNsZS5kZXN0aW5hdGlvblByb3BlcnR5LmdldCgpICkgKSB7XHJcbiAgICAgICAgcGFydGljbGUuc2V0UG9zaXRpb25BbmREZXN0aW5hdGlvbiggcGFydGljbGUucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5wbHVzKCB0cmFuc2xhdGlvbiApICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgLy8gUGFydGljbGUgaXMgbW92aW5nLCBvbmx5IGNoYW5nZSB0aGUgZGVzdGluYXRpb24uXHJcbiAgICAgICAgcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIHBhcnRpY2xlLmRlc3RpbmF0aW9uUHJvcGVydHkuZ2V0KCkucGx1cyggdHJhbnNsYXRpb24gKSApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIG51Y2xldXMgb2Zmc2V0IGNoYW5nZXMsIHVwZGF0ZSBhbGwgbnVjbGVvbiBwb3NpdGlvbnMuXHJcbiAgICB0aGlzLm51Y2xldXNPZmZzZXRQcm9wZXJ0eS5saW5rKCAoIG5ld09mZnNldCwgb2xkT2Zmc2V0ICkgPT4ge1xyXG4gICAgICBjb25zdCB0cmFuc2xhdGlvbiA9IG9sZE9mZnNldCA9PT0gbnVsbCA/IFZlY3RvcjIuWkVSTyA6IG5ld09mZnNldC5taW51cyggb2xkT2Zmc2V0ICk7XHJcbiAgICAgIHRoaXMucHJvdG9ucy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7XHJcbiAgICAgICAgdHJhbnNsYXRlUGFydGljbGUoIHBhcnRpY2xlLCB0cmFuc2xhdGlvbiApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMubmV1dHJvbnMuZm9yRWFjaCggcGFydGljbGUgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZVBhcnRpY2xlKCBwYXJ0aWNsZSwgdHJhbnNsYXRpb24gKTtcclxuICAgICAgfSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHBhcnRpY2xlIHBvc2l0aW9uIGNoYW5nZXMsIHVwZGF0ZSBhbGwgbnVjbGVvbiBwb3NpdGlvbnMuICBUaGlzIGlzIHRvIGJlIHVzZWQgaW4gSXNvdG9wZXMgYW5kIEF0b21pY1xyXG4gICAgLy8gTWFzcyB3aGVuIGEgcGFydGljbGUgZ2V0cyBtb3ZlZCB0byBzaXQgYXQgdGhlIGNvcnJlY3Qgc3BvdCBvbiB0aGUgc2NhbGUuXHJcbiAgICB0aGlzLnBvc2l0aW9uUHJvcGVydHkubGluayggKCBuZXdPZmZzZXQsIG9sZE9mZnNldCApID0+IHtcclxuICAgICAgY29uc3QgdHJhbnNsYXRpb24gPSBvbGRPZmZzZXQgPT09IG51bGwgPyBWZWN0b3IyLlpFUk8gOiBuZXdPZmZzZXQubWludXMoIG9sZE9mZnNldCApO1xyXG4gICAgICB0aGlzLnByb3RvbnMuZm9yRWFjaCggcGFydGljbGUgPT4ge1xyXG4gICAgICAgIHRyYW5zbGF0ZVBhcnRpY2xlKCBwYXJ0aWNsZSwgdHJhbnNsYXRpb24gKTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLm5ldXRyb25zLmZvckVhY2goIHBhcnRpY2xlID0+IHtcclxuICAgICAgICB0cmFuc2xhdGVQYXJ0aWNsZSggcGFydGljbGUsIHRyYW5zbGF0aW9uICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG5cclxuICAgIHRoaXMucGFydGljbGVDb3VudFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMubWFzc051bWJlclByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuY2hhcmdlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5wb3NpdGlvblByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMubnVjbGV1c09mZnNldFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIHBhcnRpY2xlIGNvbGxlY3Rpb25zXHJcbiAgICB0aGlzLnByb3RvbnMuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5uZXV0cm9ucy5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmVsZWN0cm9ucy5kaXNwb3NlKCk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVzdCB0aGF0IHRoaXMgcGFydGljbGUgYXRvbSBjb250YWlucyBhIHBhcnRpY3VsYXIgcGFydGljbGUuXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZX0gcGFydGljbGVcclxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgY29udGFpbnNQYXJ0aWNsZSggcGFydGljbGUgKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wcm90b25zLmluY2x1ZGVzKCBwYXJ0aWNsZSApIHx8XHJcbiAgICAgICAgICAgdGhpcy5uZXV0cm9ucy5pbmNsdWRlcyggcGFydGljbGUgKSB8fFxyXG4gICAgICAgICAgIHRoaXMuZWxlY3Ryb25zLmluY2x1ZGVzKCBwYXJ0aWNsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgcGFydGljbGUgdG8gdGhlIGF0b20uXHJcbiAgICogQHBhcmFtIHtQYXJ0aWNsZX0gcGFydGljbGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkUGFydGljbGUoIHBhcnRpY2xlICkge1xyXG5cclxuICAgIC8vIEluIHBoZXQtaW8gbW9kZSB3ZSBjYW4gZW5kIHVwIHdpdGggYXR0ZW1wdHMgYmVpbmcgbWFkZSB0byBhZGQgdGhlIHNhbWUgcGFydGljbGUgdHdpY2Ugd2hlbiBzdGF0ZSBpcyBiZWluZyBzZXQsIHNvXHJcbiAgICAvLyB0ZXN0IGZvciB0aGF0IGNhc2UgYW5kIGJhaWwgaWYgbmVlZGVkLlxyXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuY29udGFpbnNQYXJ0aWNsZSggcGFydGljbGUgKSApIHtcclxuXHJcbiAgICAgIC8vIExvb2tzIGxpa2Ugc29tZW9uZSBiZWF0IHVzIHRvIGl0LlxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICBpZiAoIHBhcnRpY2xlLnR5cGUgPT09ICdwcm90b24nIHx8IHBhcnRpY2xlLnR5cGUgPT09ICduZXV0cm9uJyApIHtcclxuXHJcbiAgICAgIC8vIENyZWF0ZSBhIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGlzIHBhcnRpY2xlIGlzIHJlbW92ZWQuXHJcbiAgICAgIGNvbnN0IG51Y2xlb25SZW1vdmVkTGlzdGVuZXIgPSBmdW5jdGlvbiggdXNlckNvbnRyb2xsZWQgKSB7XHJcbiAgICAgICAgaWYgKCB1c2VyQ29udHJvbGxlZCAmJiBwYXJ0aWNsZUFycmF5LmluY2x1ZGVzKCBwYXJ0aWNsZSApICkge1xyXG4gICAgICAgICAgcGFydGljbGVBcnJheS5yZW1vdmUoIHBhcnRpY2xlICk7XHJcbiAgICAgICAgICBzZWxmLnJlY29uZmlndXJlTnVjbGV1cygpO1xyXG4gICAgICAgICAgcGFydGljbGUuekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgICAgICBwYXJ0aWNsZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggbnVjbGVvblJlbW92ZWRMaXN0ZW5lciApO1xyXG4gICAgICAgICAgZGVsZXRlIHBhcnRpY2xlLnBhcnRpY2xlQXRvbVJlbW92YWxMaXN0ZW5lcjtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIHBhcnRpY2xlLnVzZXJDb250cm9sbGVkUHJvcGVydHkubGF6eUxpbmsoIG51Y2xlb25SZW1vdmVkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAgIC8vIEF0dGFjaCB0aGUgbGlzdGVuZXIgdG8gdGhlIHBhcnRpY2xlIHNvIHRoYXQgaXQgY2FuIGJlIHVubGlua2VkIHdoZW4gdGhlIHBhcnRpY2xlIGlzIHJlbW92ZWQuXHJcbiAgICAgIHBhcnRpY2xlLnBhcnRpY2xlQXRvbVJlbW92YWxMaXN0ZW5lciA9IG51Y2xlb25SZW1vdmVkTGlzdGVuZXI7XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIHBhcnRpY2xlIGFuZCB1cGRhdGUgdGhlIGNvdW50cy5cclxuICAgICAgY29uc3QgcGFydGljbGVBcnJheSA9IHBhcnRpY2xlLnR5cGUgPT09ICdwcm90b24nID8gdGhpcy5wcm90b25zIDogdGhpcy5uZXV0cm9ucztcclxuICAgICAgcGFydGljbGVBcnJheS5wdXNoKCBwYXJ0aWNsZSApO1xyXG4gICAgICB0aGlzLnJlY29uZmlndXJlTnVjbGV1cygpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHBhcnRpY2xlLnR5cGUgPT09ICdlbGVjdHJvbicgKSB7XHJcbiAgICAgIHRoaXMuZWxlY3Ryb25zLnB1c2goIHBhcnRpY2xlICk7XHJcblxyXG4gICAgICAvLyBGaW5kIGFuIG9wZW4gcG9zaXRpb24gaW4gdGhlIGVsZWN0cm9uIHNoZWxsLlxyXG4gICAgICBjb25zdCBvcGVuUG9zaXRpb25zID0gdGhpcy5lbGVjdHJvblNoZWxsUG9zaXRpb25zLmZpbHRlciggZWxlY3Ryb25Qb3NpdGlvbiA9PiB7XHJcbiAgICAgICAgcmV0dXJuICggZWxlY3Ryb25Qb3NpdGlvbi5lbGVjdHJvbiA9PT0gbnVsbCApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGxldCBzb3J0ZWRPcGVuUG9zaXRpb25zO1xyXG4gICAgICBpZiAoIHRoaXMuZWxlY3Ryb25BZGRNb2RlID09PSAncHJveGltYWwnICkge1xyXG4gICAgICAgIHNvcnRlZE9wZW5Qb3NpdGlvbnMgPSBvcGVuUG9zaXRpb25zLnNvcnQoICggcDEsIHAyICkgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIFNvcnQgZmlyc3QgYnkgZGlzdGFuY2UgdG8gcGFydGljbGUuXHJcbiAgICAgICAgICByZXR1cm4gKCBwYXJ0aWNsZS5wb3NpdGlvblByb3BlcnR5LmdldCgpLmRpc3RhbmNlKCBwMS5wb3NpdGlvbiApIC1cclxuICAgICAgICAgICAgICAgICAgIHBhcnRpY2xlLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHAyLnBvc2l0aW9uICkgKTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgc29ydGVkT3BlblBvc2l0aW9ucyA9IGRvdFJhbmRvbS5zaHVmZmxlKCBvcGVuUG9zaXRpb25zICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFB1dCB0aGUgaW5uZXIgc2hlbGwgcG9zaXRpb25zIGluIGZyb250LlxyXG4gICAgICBzb3J0ZWRPcGVuUG9zaXRpb25zID0gc29ydGVkT3BlblBvc2l0aW9ucy5zb3J0KCAoIHAxLCBwMiApID0+IHtcclxuICAgICAgICByZXR1cm4gKCBzZWxmLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkuZGlzdGFuY2UoIHAxLnBvc2l0aW9uICkgLVxyXG4gICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS5kaXN0YW5jZSggcDIucG9zaXRpb24gKSApO1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzb3J0ZWRPcGVuUG9zaXRpb25zLmxlbmd0aCA+IDAsICdObyBvcGVuIHBvc2l0aW9ucyBmb3VuZCBmb3IgZWxlY3Ryb25zJyApO1xyXG4gICAgICBzb3J0ZWRPcGVuUG9zaXRpb25zWyAwIF0uZWxlY3Ryb24gPSBwYXJ0aWNsZTtcclxuICAgICAgcGFydGljbGUuZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIHNvcnRlZE9wZW5Qb3NpdGlvbnNbIDAgXS5wb3NpdGlvbiApO1xyXG5cclxuICAgICAgLy8gTGlzdGVuIGZvciByZW1vdmFsIG9mIHRoZSBlbGVjdHJvbiBhbmQgaGFuZGxlIGl0LlxyXG4gICAgICBjb25zdCBlbGVjdHJvblJlbW92ZWRMaXN0ZW5lciA9IGZ1bmN0aW9uKCB1c2VyQ29udHJvbGxlZCApIHtcclxuICAgICAgICBpZiAoIHVzZXJDb250cm9sbGVkICYmIHNlbGYuZWxlY3Ryb25zLmluY2x1ZGVzKCBwYXJ0aWNsZSApICkge1xyXG4gICAgICAgICAgc2VsZi5lbGVjdHJvbnMucmVtb3ZlKCBwYXJ0aWNsZSApO1xyXG4gICAgICAgICAgcGFydGljbGUuekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgICAgICBwYXJ0aWNsZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggZWxlY3Ryb25SZW1vdmVkTGlzdGVuZXIgKTtcclxuICAgICAgICAgIGRlbGV0ZSBwYXJ0aWNsZS5wYXJ0aWNsZUF0b21SZW1vdmFsTGlzdGVuZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBwYXJ0aWNsZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxhenlMaW5rKCBlbGVjdHJvblJlbW92ZWRMaXN0ZW5lciApO1xyXG5cclxuICAgICAgLy8gU2V0IHRoZSBsaXN0ZW5lciBhcyBhbiBhdHRyaWJ1dGUgb2YgdGhlIHBhcnRpY2xlIHRvIGFpZCB1bmxpbmtpbmcgaW4gc29tZSBjYXNlcy5cclxuICAgICAgcGFydGljbGUucGFydGljbGVBdG9tUmVtb3ZhbExpc3RlbmVyID0gZWxlY3Ryb25SZW1vdmVkTGlzdGVuZXI7XHJcblxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnVW5leHBlY3RlZCBwYXJ0aWNsZSB0eXBlICcgKyBwYXJ0aWNsZS50eXBlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgdGhlIHNwZWNpZmllZCBwYXJ0aWNsZSBmcm9tIHRoaXMgcGFydGljbGUgYXRvbS5cclxuICAgKiBAcGFyYW0ge1BhcnRpY2xlfSBwYXJ0aWNsZVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZW1vdmVQYXJ0aWNsZSggcGFydGljbGUgKSB7XHJcblxyXG4gICAgaWYgKCB0aGlzLnByb3RvbnMuaW5jbHVkZXMoIHBhcnRpY2xlICkgKSB7XHJcbiAgICAgIHRoaXMucHJvdG9ucy5yZW1vdmUoIHBhcnRpY2xlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5uZXV0cm9ucy5pbmNsdWRlcyggcGFydGljbGUgKSApIHtcclxuICAgICAgdGhpcy5uZXV0cm9ucy5yZW1vdmUoIHBhcnRpY2xlICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdGhpcy5lbGVjdHJvbnMuaW5jbHVkZXMoIHBhcnRpY2xlICkgKSB7XHJcbiAgICAgIHRoaXMuZWxlY3Ryb25zLnJlbW92ZSggcGFydGljbGUgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoICdBdHRlbXB0IHRvIHJlbW92ZSBwYXJ0aWNsZSB0aGF0IGlzIG5vdCBpbiB0aGlzIHBhcnRpY2xlIGF0b20uJyApO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdHlwZW9mIChcclxuICAgICAgcGFydGljbGUucGFydGljbGVBdG9tUmVtb3ZhbExpc3RlbmVyICkgPT09ICdmdW5jdGlvbicsXHJcbiAgICAgICdObyBwYXJ0aWNsZSByZW1vdmFsIGxpc3RlbmVyIGF0dGFjaGVkIHRvIHBhcnRpY2xlLidcclxuICAgICk7XHJcbiAgICBwYXJ0aWNsZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnVubGluayggcGFydGljbGUucGFydGljbGVBdG9tUmVtb3ZhbExpc3RlbmVyICk7XHJcblxyXG4gICAgZGVsZXRlIHBhcnRpY2xlLnBhcnRpY2xlQXRvbVJlbW92YWxMaXN0ZW5lcjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4dHJhY3QgYW4gYXJiaXRyYXJ5IGluc3RhbmNlIG9mIHRoZSBzcGVjaWZpZWQgcGFydGljbGUsIGFzc3VtaW5nIG9uZSBleGlzdHMuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhcnRpY2xlVHlwZVxyXG4gICAqIEByZXR1cm5zIHtQYXJ0aWNsZX0gcGFydGljbGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZXh0cmFjdFBhcnRpY2xlKCBwYXJ0aWNsZVR5cGUgKSB7XHJcbiAgICBsZXQgcGFydGljbGUgPSBudWxsO1xyXG4gICAgc3dpdGNoKCBwYXJ0aWNsZVR5cGUgKSB7XHJcbiAgICAgIGNhc2UgJ3Byb3Rvbic6XHJcbiAgICAgICAgaWYgKCB0aGlzLnByb3RvbnMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wcm90b25zLmdldCggdGhpcy5wcm90b25zLmxlbmd0aCAtIDEgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICBjYXNlICduZXV0cm9uJzpcclxuICAgICAgICBpZiAoIHRoaXMubmV1dHJvbnMubGVuZ3RoID4gMCApIHtcclxuICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5uZXV0cm9ucy5nZXQoIHRoaXMubmV1dHJvbnMubGVuZ3RoIC0gMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGNhc2UgJ2VsZWN0cm9uJzpcclxuICAgICAgICBpZiAoIHRoaXMuZWxlY3Ryb25zLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgICBwYXJ0aWNsZSA9IHRoaXMuZWxlY3Ryb25zLmdldCggdGhpcy5lbGVjdHJvbnMubGVuZ3RoIC0gMSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnQXR0ZW1wdCB0byByZW1vdmUgdW5rbm93biBwYXJ0aWNsZSB0eXBlLicgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHBhcnRpY2xlICE9PSBudWxsICkge1xyXG4gICAgICB0aGlzLnJlbW92ZVBhcnRpY2xlKCBwYXJ0aWNsZSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXJ0aWNsZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbGwgdGhlIHBhcnRpY2xlcyBidXQgZG9uJ3QgcmVjb25maWd1cmUgdGhlIG51Y2xldXMgYXMgdGhleSBnby4gVGhpcyBtYWtlcyBpdCBhIHF1aWNrZXIgb3BlcmF0aW9uLlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBjbGVhcigpIHtcclxuICAgIGNvbnN0IHByb3RvbnMgPSBbIC4uLnRoaXMucHJvdG9ucyBdO1xyXG4gICAgcHJvdG9ucy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7IHRoaXMucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7IH0gKTtcclxuICAgIGNvbnN0IG5ldXRyb25zID0gWyAuLi50aGlzLm5ldXRyb25zIF07XHJcbiAgICBuZXV0cm9ucy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7IHRoaXMucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7IH0gKTtcclxuICAgIGNvbnN0IGVsZWN0cm9ucyA9IFsgLi4udGhpcy5lbGVjdHJvbnMgXTtcclxuICAgIGVsZWN0cm9ucy5mb3JFYWNoKCBwYXJ0aWNsZSA9PiB7IHRoaXMucmVtb3ZlUGFydGljbGUoIHBhcnRpY2xlICk7IH0gKTtcclxuXHJcbiAgICB0aGlzLmxpdmVBbmltYXRpb25zLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlIGFsbCB0aGUgcGFydGljbGVzIHRvIHRoZWlyIGRlc3RpbmF0aW9ucy4gVGhpcyBpcyBnZW5lcmFsbHkgdXNlZCB3aGVuIGFuaW1hdGlvbiBpcyBub3QgZGVzaXJlZC5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbW92ZUFsbFBhcnRpY2xlc1RvRGVzdGluYXRpb24oKSB7XHJcbiAgICB0aGlzLnByb3RvbnMuZm9yRWFjaCggcCA9PiB7IHAubW92ZUltbWVkaWF0ZWx5VG9EZXN0aW5hdGlvbigpOyB9ICk7XHJcbiAgICB0aGlzLm5ldXRyb25zLmZvckVhY2goIHAgPT4geyBwLm1vdmVJbW1lZGlhdGVseVRvRGVzdGluYXRpb24oKTsgfSApO1xyXG4gICAgdGhpcy5lbGVjdHJvbnMuZm9yRWFjaCggcCA9PiB7IHAubW92ZUltbWVkaWF0ZWx5VG9EZXN0aW5hdGlvbigpOyB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0V2VpZ2h0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSArIHRoaXMubmV1dHJvbkNvdW50UHJvcGVydHkuZ2V0KCk7XHJcbiAgfVxyXG5cclxuICAvLyBAcHVibGljXHJcbiAgZ2V0Q2hhcmdlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSAtIHRoaXMuZWxlY3Ryb25Db3VudFByb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIGdldElzb3RvcGVBdG9taWNNYXNzKCkge1xyXG4gICAgcmV0dXJuIEF0b21JZGVudGlmaWVyLmdldElzb3RvcGVBdG9taWNNYXNzKCB0aGlzLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCksIHRoaXMubmV1dHJvbkNvdW50UHJvcGVydHkuZ2V0KCkgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICByZWNvbmZpZ3VyZU51Y2xldXMoKSB7XHJcblxyXG4gICAgLy8gQ29udmVuaWVuY2UgdmFyaWFibGVzLlxyXG4gICAgY29uc3QgY2VudGVyWCA9IHRoaXMucG9zaXRpb25Qcm9wZXJ0eS5nZXQoKS54ICsgdGhpcy5udWNsZXVzT2Zmc2V0UHJvcGVydHkuZ2V0KCkueDtcclxuICAgIGNvbnN0IGNlbnRlclkgPSB0aGlzLnBvc2l0aW9uUHJvcGVydHkuZ2V0KCkueSArIHRoaXMubnVjbGV1c09mZnNldFByb3BlcnR5LmdldCgpLnk7XHJcbiAgICBjb25zdCBudWNsZW9uUmFkaXVzID0gdGhpcy5udWNsZW9uUmFkaXVzO1xyXG4gICAgbGV0IGFuZ2xlO1xyXG4gICAgbGV0IGRpc3RGcm9tQ2VudGVyO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBpbnRlcnNwZXJzZWQgcHJvdG9ucyBhbmQgbmV1dHJvbnMgZm9yIGNvbmZpZ3VyaW5nLlxyXG4gICAgY29uc3QgbnVjbGVvbnMgPSBbXTtcclxuICAgIGxldCBwcm90b25JbmRleCA9IDA7XHJcbiAgICBsZXQgbmV1dHJvbkluZGV4ID0gMDtcclxuICAgIGNvbnN0IG5ldXRyb25zUGVyUHJvdG9uID0gdGhpcy5uZXV0cm9ucy5sZW5ndGggLyB0aGlzLnByb3RvbnMubGVuZ3RoO1xyXG4gICAgbGV0IG5ldXRyb25zVG9BZGQgPSAwO1xyXG4gICAgd2hpbGUgKCBudWNsZW9ucy5sZW5ndGggPCB0aGlzLm5ldXRyb25zLmxlbmd0aCArIHRoaXMucHJvdG9ucy5sZW5ndGggKSB7XHJcbiAgICAgIG5ldXRyb25zVG9BZGQgKz0gbmV1dHJvbnNQZXJQcm90b247XHJcbiAgICAgIHdoaWxlICggbmV1dHJvbnNUb0FkZCA+PSAxICYmIG5ldXRyb25JbmRleCA8IHRoaXMubmV1dHJvbnMubGVuZ3RoICkge1xyXG4gICAgICAgIG51Y2xlb25zLnB1c2goIHRoaXMubmV1dHJvbnMuZ2V0KCBuZXV0cm9uSW5kZXgrKyApICk7XHJcbiAgICAgICAgbmV1dHJvbnNUb0FkZCAtPSAxO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggcHJvdG9uSW5kZXggPCB0aGlzLnByb3RvbnMubGVuZ3RoICkge1xyXG4gICAgICAgIG51Y2xlb25zLnB1c2goIHRoaXMucHJvdG9ucy5nZXQoIHByb3RvbkluZGV4KysgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBudWNsZW9ucy5sZW5ndGggPT09IDEgKSB7XHJcblxyXG4gICAgICAvLyBUaGVyZSBpcyBvbmx5IG9uZSBudWNsZW9uIHByZXNlbnQsIHNvIHBsYWNlIGl0IGluIHRoZSBjZW50ZXIgb2YgdGhlIGF0b20uXHJcbiAgICAgIG51Y2xlb25zWyAwIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBjZW50ZXJYLCBjZW50ZXJZICkgKTtcclxuICAgICAgbnVjbGVvbnNbIDAgXS56TGF5ZXJQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBudWNsZW9ucy5sZW5ndGggPT09IDIgKSB7XHJcblxyXG4gICAgICAvLyBUd28gbnVjbGVvbnMgLSBwbGFjZSB0aGVtIHNpZGUgYnkgc2lkZSB3aXRoIHRoZWlyIG1lZXRpbmcgcG9pbnQgaW4gdGhlIGNlbnRlci5cclxuICAgICAgYW5nbGUgPSAwLjIgKiAyICogTWF0aC5QSTsgLy8gQW5nbGUgYXJiaXRyYXJpbHkgY2hvc2VuLlxyXG4gICAgICBudWNsZW9uc1sgMCBdLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggY2VudGVyWCArIG51Y2xlb25SYWRpdXMgKiBNYXRoLmNvcyggYW5nbGUgKSxcclxuICAgICAgICBjZW50ZXJZICsgbnVjbGVvblJhZGl1cyAqIE1hdGguc2luKCBhbmdsZSApICkgKTtcclxuICAgICAgbnVjbGVvbnNbIDAgXS56TGF5ZXJQcm9wZXJ0eS5zZXQoIDAgKTtcclxuICAgICAgbnVjbGVvbnNbIDEgXS5kZXN0aW5hdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIGNlbnRlclggLSBudWNsZW9uUmFkaXVzICogTWF0aC5jb3MoIGFuZ2xlICksXHJcbiAgICAgICAgY2VudGVyWSAtIG51Y2xlb25SYWRpdXMgKiBNYXRoLnNpbiggYW5nbGUgKSApICk7XHJcbiAgICAgIG51Y2xlb25zWyAxIF0uekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbnVjbGVvbnMubGVuZ3RoID09PSAzICkge1xyXG5cclxuICAgICAgLy8gVGhyZWUgbnVjbGVvbnMgLSBmb3JtIGEgdHJpYW5nbGUgd2hlcmUgdGhleSBhbGwgdG91Y2guXHJcbiAgICAgIGFuZ2xlID0gMC43ICogMiAqIE1hdGguUEk7IC8vIEFuZ2xlIGFyYml0cmFyaWx5IGNob3Nlbi5cclxuICAgICAgZGlzdEZyb21DZW50ZXIgPSBudWNsZW9uUmFkaXVzICogMS4xNTU7XHJcbiAgICAgIG51Y2xlb25zWyAwIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBjZW50ZXJYICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLmNvcyggYW5nbGUgKSxcclxuICAgICAgICBjZW50ZXJZICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLnNpbiggYW5nbGUgKSApICk7XHJcbiAgICAgIG51Y2xlb25zWyAwIF0uekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgIG51Y2xlb25zWyAxIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBjZW50ZXJYICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLmNvcyggYW5nbGUgKyAyICogTWF0aC5QSSAvIDMgKSxcclxuICAgICAgICBjZW50ZXJZICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLnNpbiggYW5nbGUgKyAyICogTWF0aC5QSSAvIDMgKSApICk7XHJcbiAgICAgIG51Y2xlb25zWyAxIF0uekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgIG51Y2xlb25zWyAyIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBjZW50ZXJYICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLmNvcyggYW5nbGUgKyA0ICogTWF0aC5QSSAvIDMgKSxcclxuICAgICAgICBjZW50ZXJZICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLnNpbiggYW5nbGUgKyA0ICogTWF0aC5QSSAvIDMgKSApICk7XHJcbiAgICAgIG51Y2xlb25zWyAyIF0uekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbnVjbGVvbnMubGVuZ3RoID09PSA0ICkge1xyXG5cclxuICAgICAgLy8gRm91ciBudWNsZW9ucyAtIG1ha2UgYSBzb3J0IG9mIGRpYW1vbmQgc2hhcGUgd2l0aCBzb21lIG92ZXJsYXAuXHJcbiAgICAgIGFuZ2xlID0gMS40ICogMiAqIE1hdGguUEk7IC8vIEFuZ2xlIGFyYml0cmFyaWx5IGNob3Nlbi5cclxuICAgICAgbnVjbGVvbnNbIDAgXS5kZXN0aW5hdGlvblByb3BlcnR5LnNldCggbmV3IFZlY3RvcjIoIGNlbnRlclggKyBudWNsZW9uUmFkaXVzICogTWF0aC5jb3MoIGFuZ2xlICksXHJcbiAgICAgICAgY2VudGVyWSArIG51Y2xlb25SYWRpdXMgKiBNYXRoLnNpbiggYW5nbGUgKSApICk7XHJcbiAgICAgIG51Y2xlb25zWyAwIF0uekxheWVyUHJvcGVydHkuc2V0KCAwICk7XHJcbiAgICAgIG51Y2xlb25zWyAyIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBjZW50ZXJYIC0gbnVjbGVvblJhZGl1cyAqIE1hdGguY29zKCBhbmdsZSApLFxyXG4gICAgICAgIGNlbnRlclkgLSBudWNsZW9uUmFkaXVzICogTWF0aC5zaW4oIGFuZ2xlICkgKSApO1xyXG4gICAgICBudWNsZW9uc1sgMiBdLnpMYXllclByb3BlcnR5LnNldCggMCApO1xyXG4gICAgICBkaXN0RnJvbUNlbnRlciA9IG51Y2xlb25SYWRpdXMgKiAyICogTWF0aC5jb3MoIE1hdGguUEkgLyAzICk7XHJcbiAgICAgIG51Y2xlb25zWyAxIF0uZGVzdGluYXRpb25Qcm9wZXJ0eS5zZXQoIG5ldyBWZWN0b3IyKCBjZW50ZXJYICsgZGlzdEZyb21DZW50ZXIgKiBNYXRoLmNvcyggYW5nbGUgKyBNYXRoLlBJIC8gMiApLFxyXG4gICAgICAgIGNlbnRlclkgKyBkaXN0RnJvbUNlbnRlciAqIE1hdGguc2luKCBhbmdsZSArIE1hdGguUEkgLyAyICkgKSApO1xyXG4gICAgICBudWNsZW9uc1sgMSBdLnpMYXllclByb3BlcnR5LnNldCggMSApO1xyXG4gICAgICBudWNsZW9uc1sgMyBdLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggY2VudGVyWCAtIGRpc3RGcm9tQ2VudGVyICogTWF0aC5jb3MoIGFuZ2xlICsgTWF0aC5QSSAvIDIgKSxcclxuICAgICAgICBjZW50ZXJZIC0gZGlzdEZyb21DZW50ZXIgKiBNYXRoLnNpbiggYW5nbGUgKyBNYXRoLlBJIC8gMiApICkgKTtcclxuICAgICAgbnVjbGVvbnNbIDMgXS56TGF5ZXJQcm9wZXJ0eS5zZXQoIDEgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBudWNsZW9ucy5sZW5ndGggPj0gNSApIHtcclxuXHJcbiAgICAgIC8vIFRoaXMgaXMgYSBnZW5lcmFsaXplZCBhbGdvcml0aG0gdGhhdCBzaG91bGQgd29yayBmb3IgZml2ZSBvciBtb3JlIG51Y2xlb25zLlxyXG4gICAgICBsZXQgcGxhY2VtZW50UmFkaXVzID0gMDtcclxuICAgICAgbGV0IG51bUF0VGhpc1JhZGl1cyA9IDE7XHJcbiAgICAgIGxldCBsZXZlbCA9IDA7XHJcbiAgICAgIGxldCBwbGFjZW1lbnRBbmdsZSA9IDA7XHJcbiAgICAgIGxldCBwbGFjZW1lbnRBbmdsZURlbHRhID0gMDtcclxuXHJcbiAgICAgIC8vIFNjYWxlIGNvcnJlY3Rpb24gZm9yIHRoZSBuZXh0IHBsYWNlbWVudCByYWRpdXMsIGxpbmVhciBtYXAgZGV0ZXJtaW5lZCBlbXBpcmljYWxseS4gQXMgdGhlIG51Y2xlb24gc2l6ZVxyXG4gICAgICAvLyBpbmNyZWFzZXMsIHdlIHdhbnQgdGhlIHNjYWxlIGZhY3RvciBhbmQgY2hhbmdlIGluIHBsYWNlbWVudCByYWRpdXMgdG8gZGVjcmVhc2Ugc2luY2UgbGFyZ2VyIG51Y2xlb25zIGFyZVxyXG4gICAgICAvLyBlYXNpZXIgdG8gc2VlIHdpdGggbGFyZ2VyIGFyZWEuIE1hcCB2YWx1ZXMgZGV0ZXJtaW5lZCBpbiBjYXNlcyB3aGljaCB1c2UgYSB3aWRlIHJhbmdlIGluIG51bWJlciBvZiBudWNsZW9uc1xyXG4gICAgICAvLyBhbmQgaW4gY2FzZXMgd2hlcmUgdGhlIG51Y2xlb24gcmFkaXVzIHNjYWxlZCBmcm9tIDMgdG8gMTAgKGluIHNjcmVlbiBjb29yZGluYXRlcyAtIHJvdWdobHkgcGl4ZWxzKS5cclxuICAgICAgY29uc3QgcmFkaXVzQSA9IDM7XHJcbiAgICAgIGNvbnN0IHJhZGl1c0IgPSAxMDtcclxuICAgICAgY29uc3Qgc2NhbGVGYWN0b3JBID0gMi40O1xyXG4gICAgICBjb25zdCBzY2FsZUZhY3RvckIgPSAxLjM1O1xyXG4gICAgICBjb25zdCBzY2FsZUZ1bmN0aW9uID0gbmV3IExpbmVhckZ1bmN0aW9uKCByYWRpdXNBLCByYWRpdXNCLCBzY2FsZUZhY3RvckEsIHNjYWxlRmFjdG9yQiwgdGhpcy5udWNsZW9uUmFkaXVzICk7XHJcbiAgICAgIGNvbnN0IHNjYWxlRmFjdG9yID0gc2NhbGVGdW5jdGlvbi5ldmFsdWF0ZSggdGhpcy5udWNsZW9uUmFkaXVzICk7XHJcblxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudWNsZW9ucy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgICBudWNsZW9uc1sgaSBdLmRlc3RpbmF0aW9uUHJvcGVydHkuc2V0KCBuZXcgVmVjdG9yMiggY2VudGVyWCArIHBsYWNlbWVudFJhZGl1cyAqIE1hdGguY29zKCBwbGFjZW1lbnRBbmdsZSApLFxyXG4gICAgICAgICAgY2VudGVyWSArIHBsYWNlbWVudFJhZGl1cyAqIE1hdGguc2luKCBwbGFjZW1lbnRBbmdsZSApICkgKTtcclxuICAgICAgICBudWNsZW9uc1sgaSBdLnpMYXllclByb3BlcnR5LnNldCggbGV2ZWwgKTtcclxuICAgICAgICBudW1BdFRoaXNSYWRpdXMtLTtcclxuICAgICAgICBpZiAoIG51bUF0VGhpc1JhZGl1cyA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgLy8gU3RheSBhdCB0aGUgc2FtZSByYWRpdXMgYW5kIHVwZGF0ZSB0aGUgcGxhY2VtZW50IGFuZ2xlLlxyXG4gICAgICAgICAgcGxhY2VtZW50QW5nbGUgKz0gcGxhY2VtZW50QW5nbGVEZWx0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gTW92ZSBvdXQgdG8gdGhlIG5leHQgcmFkaXVzLlxyXG4gICAgICAgICAgbGV2ZWwrKztcclxuICAgICAgICAgIHBsYWNlbWVudFJhZGl1cyArPSBudWNsZW9uUmFkaXVzICogc2NhbGVGYWN0b3IgLyBsZXZlbDtcclxuICAgICAgICAgIHBsYWNlbWVudEFuZ2xlICs9IDIgKiBNYXRoLlBJICogMC4yICsgbGV2ZWwgKiBNYXRoLlBJOyAvLyBBcmJpdHJhcnkgdmFsdWUgY2hvc2VuIGJhc2VkIG9uIGxvb2tzLlxyXG4gICAgICAgICAgbnVtQXRUaGlzUmFkaXVzID0gTWF0aC5mbG9vciggcGxhY2VtZW50UmFkaXVzICogTWF0aC5QSSAvIG51Y2xlb25SYWRpdXMgKTtcclxuICAgICAgICAgIHBsYWNlbWVudEFuZ2xlRGVsdGEgPSAyICogTWF0aC5QSSAvIG51bUF0VGhpc1JhZGl1cztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENoYW5nZSB0aGUgbnVjbGVvbiB0eXBlIG9mIHRoZSBwcm92aWRlZCBwYXJ0aWNsZSB0byB0aGUgb3RoZXIgbnVjbGVvbiB0eXBlLlxyXG4gICAqIEBwYXJhbSB7UGFydGljbGV9IHBhcnRpY2xlXHJcbiAgICogQHBhcmFtIGFuaW1hdGVBbmRSZW1vdmVQYXJ0aWNsZVxyXG4gICAqIEByZXR1cm5zIHtBbmltYXRpb259XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGNoYW5nZU51Y2xlb25UeXBlKCBwYXJ0aWNsZSwgYW5pbWF0ZUFuZFJlbW92ZVBhcnRpY2xlICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb250YWluc1BhcnRpY2xlKCBwYXJ0aWNsZSApLCAnUGFydGljbGVBdG9tIGRvZXMgbm90IGNvbnRhaW4gdGhpcyBwYXJ0aWNsZSAnICsgcGFydGljbGUuaWQgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcnRpY2xlLnR5cGUgPT09ICdwcm90b24nIHx8IHBhcnRpY2xlLnR5cGUgPT09ICduZXV0cm9uJywgJ1BhcnRpY2xlIHR5cGUgbXVzdCBiZSBhIHByb3RvbiBvciBhIG5ldXRyb24uJyApO1xyXG5cclxuICAgIGNvbnN0IGlzUGFydGljbGVUeXBlUHJvdG9uID0gcGFydGljbGUudHlwZSA9PT0gJ3Byb3Rvbic7XHJcbiAgICBjb25zdCBwYXJ0aWNsZVR5cGVzID0ge1xyXG4gICAgICBuZXdQYXJ0aWNsZVR5cGU6IGlzUGFydGljbGVUeXBlUHJvdG9uID8gJ25ldXRyb24nIDogJ3Byb3RvbicsXHJcbiAgICAgIG9sZFBhcnRpY2xlQXJyYXk6IGlzUGFydGljbGVUeXBlUHJvdG9uID8gdGhpcy5wcm90b25zIDogdGhpcy5uZXV0cm9ucyxcclxuICAgICAgbmV3UGFydGljbGVBcnJheTogaXNQYXJ0aWNsZVR5cGVQcm90b24gPyB0aGlzLm5ldXRyb25zIDogdGhpcy5wcm90b25zXHJcbiAgICB9O1xyXG4gICAgcGFydGljbGUudHlwZVByb3BlcnR5LnZhbHVlID0gcGFydGljbGVUeXBlcy5uZXdQYXJ0aWNsZVR5cGU7XHJcblxyXG4gICAgbGV0IG51Y2xlb25DaGFuZ2VDb2xvckNoYW5nZTtcclxuICAgIGlmICggcGFydGljbGUudHlwZVByb3BlcnR5LnZhbHVlID09PSAncHJvdG9uJyApIHtcclxuICAgICAgbnVjbGVvbkNoYW5nZUNvbG9yQ2hhbmdlID0gTlVDTEVPTl9DT0xPUl9HUkFESUVOVC5zbGljZSgpLnJldmVyc2UoKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBwYXJ0aWNsZS50eXBlUHJvcGVydHkudmFsdWUgPT09ICduZXV0cm9uJyApIHtcclxuICAgICAgbnVjbGVvbkNoYW5nZUNvbG9yQ2hhbmdlID0gTlVDTEVPTl9DT0xPUl9HUkFESUVOVC5zbGljZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFuaW1hdGUgdGhyb3VnaCB0aGUgdmFsdWVzIGluIG51Y2xlb25Db2xvckNoYW5nZSB0byAnc2xvd2x5JyBjaGFuZ2UgdGhlIGNvbG9yIG9mIHRoZSBudWNsZW9uLlxyXG4gICAgY29uc3QgaW5pdGlhbENvbG9yQ2hhbmdlQW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBmcm9tOiBwYXJ0aWNsZS5jb2xvckdyYWRpZW50SW5kZXhOdW1iZXJQcm9wZXJ0eS5pbml0aWFsVmFsdWUsXHJcbiAgICAgIHRvOiAxLFxyXG4gICAgICBzZXRWYWx1ZTogaW5kZXhWYWx1ZSA9PiB7IHBhcnRpY2xlLmNvbG9yR3JhZGllbnRJbmRleE51bWJlclByb3BlcnR5LnZhbHVlID0gaW5kZXhWYWx1ZTsgfSxcclxuICAgICAgZHVyYXRpb246IDAuMSxcclxuICAgICAgZWFzaW5nOiBFYXNpbmcuTElORUFSXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZmluYWxDb2xvckNoYW5nZUFuaW1hdGlvbiA9IG5ldyBBbmltYXRpb24oIHtcclxuICAgICAgZnJvbTogMSxcclxuICAgICAgdG86IG51Y2xlb25DaGFuZ2VDb2xvckNoYW5nZS5sZW5ndGggLSAxLFxyXG4gICAgICBzZXRWYWx1ZTogaW5kZXhWYWx1ZSA9PiB7IHBhcnRpY2xlLmNvbG9yR3JhZGllbnRJbmRleE51bWJlclByb3BlcnR5LnZhbHVlID0gaW5kZXhWYWx1ZTsgfSxcclxuICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgZWFzaW5nOiBFYXNpbmcuTElORUFSXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5saXZlQW5pbWF0aW9ucy5wdXNoKCBpbml0aWFsQ29sb3JDaGFuZ2VBbmltYXRpb24gKTtcclxuICAgIHRoaXMubGl2ZUFuaW1hdGlvbnMucHVzaCggZmluYWxDb2xvckNoYW5nZUFuaW1hdGlvbiApO1xyXG5cclxuICAgIGluaXRpYWxDb2xvckNoYW5nZUFuaW1hdGlvbi50aGVuKCBmaW5hbENvbG9yQ2hhbmdlQW5pbWF0aW9uICk7XHJcbiAgICBpbml0aWFsQ29sb3JDaGFuZ2VBbmltYXRpb24uc3RhcnQoKTtcclxuXHJcbiAgICBpbml0aWFsQ29sb3JDaGFuZ2VBbmltYXRpb24uZmluaXNoRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICBhbmltYXRlQW5kUmVtb3ZlUGFydGljbGUoKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBEZWZlciB0aGUgbWFzc051bWJlclByb3BlcnR5IGxpbmtzIHVudGlsIHRoZSBwYXJ0aWNsZSBhcnJheXMgYXJlIGNvcnJlY3Qgc28gdGhlIG51Y2xldXMgZG9lcyBub3QgcmVjb25maWd1cmUuXHJcbiAgICB0aGlzLm1hc3NOdW1iZXJQcm9wZXJ0eS5zZXREZWZlcnJlZCggdHJ1ZSApO1xyXG4gICAgYXJyYXlSZW1vdmUoIHBhcnRpY2xlVHlwZXMub2xkUGFydGljbGVBcnJheSwgcGFydGljbGUgKTtcclxuICAgIHBhcnRpY2xlVHlwZXMubmV3UGFydGljbGVBcnJheS5wdXNoKCBwYXJ0aWNsZSApO1xyXG4gICAgdGhpcy5tYXNzTnVtYmVyUHJvcGVydHkuc2V0RGVmZXJyZWQoIGZhbHNlICk7XHJcblxyXG4gICAgcmV0dXJuIGluaXRpYWxDb2xvckNoYW5nZUFuaW1hdGlvbjtcclxuICB9XHJcbn1cclxuXHJcbi8vIGhlbHBlciBmdW5jdGlvbiBmb3IgcmV0cmlldmluZyB0aGUgdGFuZGVtIGZvciBhIHBhcnRpY2xlXHJcbmNvbnN0IFBhcnRpY2xlUmVmZXJlbmNlSU8gPSBSZWZlcmVuY2VJTyggUGFydGljbGUuUGFydGljbGVJTyApO1xyXG5jb25zdCBOdWxsYWJsZVBhcnRpY2xlUmVmZXJlbmNlSU8gPSBOdWxsYWJsZUlPKCBSZWZlcmVuY2VJTyggUGFydGljbGUuUGFydGljbGVJTyApICk7XHJcblxyXG5QYXJ0aWNsZUF0b20uUGFydGljbGVBdG9tSU8gPSBuZXcgSU9UeXBlKCAnUGFydGljbGVBdG9tSU8nLCB7XHJcbiAgdmFsdWVUeXBlOiBQYXJ0aWNsZUF0b20sXHJcbiAgZG9jdW1lbnRhdGlvbjogJ0EgbW9kZWwgb2YgYW4gYXRvbSB0aGF0IHRyYWNrcyBhbmQgYXJyYW5nZXMgdGhlIHN1YmF0b21pYyBwYXJ0aWNsZXMsIGkuZS4gcHJvdG9ucywgbmV1dHJvbnMsICcgK1xyXG4gICAgICAgICAgICAgICAgICdhbmQgZWxlY3Ryb25zLCBvZiB3aGljaCBpdCBpcyBjb21wcmlzZWQuICBXaGVuIHBhcnRpY2xlcyBhcmUgYWRkZWQsIHRoZXkgYXJlIG1vdmVkIGludG8gdGhlICcgK1xyXG4gICAgICAgICAgICAgICAgICdhcHByb3ByaWF0ZSBwbGFjZXMuICBUaGlzIG9iamVjdCBhbHNvIGtlZXBzIHRyYWNrIG9mIHRoaW5ncyBsaWtlIGF0b21pYyBudW1iZXIsIG1hc3MgbnVtYmVyLCBhbmQgJyArXHJcbiAgICAgICAgICAgICAgICAgJ2NoYXJnZS4nLFxyXG4gIHRvU3RhdGVPYmplY3Q6IHBhcnRpY2xlQXRvbSA9PiAoIHtcclxuXHJcbiAgICAvLyBhbiBhcnJheSBvZiBhbGwgdGhlIHBhcnRpY2xlcyBjdXJyZW50bHkgY29udGFpbmVkIHdpdGhpbiB0aGUgcGFydGljbGUgYXRvbVxyXG4gICAgcmVzaWRlbnRQYXJ0aWNsZUlEczogcGFydGljbGVBdG9tLnByb3RvbnMubWFwKCBQYXJ0aWNsZVJlZmVyZW5jZUlPLnRvU3RhdGVPYmplY3QgKVxyXG4gICAgICAuY29uY2F0KCBwYXJ0aWNsZUF0b20ubmV1dHJvbnMubWFwKCBQYXJ0aWNsZVJlZmVyZW5jZUlPLnRvU3RhdGVPYmplY3QgKSApXHJcbiAgICAgIC5jb25jYXQoIHBhcnRpY2xlQXRvbS5lbGVjdHJvbnMubWFwKCBQYXJ0aWNsZVJlZmVyZW5jZUlPLnRvU3RhdGVPYmplY3QgKSApLFxyXG5cclxuICAgIC8vIGFuIG9yZGVyZWQgYXJyYXkgdGhhdCB0cmFja3Mgd2hpY2ggZWxlY3Ryb24sIGlmIGFueSwgaXMgaW4gZWFjaCBzaGVsbCBwb3NpdGlvblxyXG4gICAgZWxlY3Ryb25TaGVsbE9jY3VwYW50SURzOiBwYXJ0aWNsZUF0b20uZWxlY3Ryb25TaGVsbFBvc2l0aW9ucy5tYXAoIGUgPT4gZS5lbGVjdHJvbiApLm1hcCggTnVsbGFibGVQYXJ0aWNsZVJlZmVyZW5jZUlPLnRvU3RhdGVPYmplY3QgKVxyXG4gIH0gKSxcclxuICBzdGF0ZVNjaGVtYToge1xyXG4gICAgcmVzaWRlbnRQYXJ0aWNsZUlEczogQXJyYXlJTyggUGFydGljbGVSZWZlcmVuY2VJTyApLFxyXG4gICAgZWxlY3Ryb25TaGVsbE9jY3VwYW50SURzOiBBcnJheUlPKCBOdWxsYWJsZVBhcnRpY2xlUmVmZXJlbmNlSU8gKVxyXG4gIH0sXHJcbiAgYXBwbHlTdGF0ZTogKCBwYXJ0aWNsZUF0b20sIHN0YXRlT2JqZWN0ICkgPT4ge1xyXG5cclxuICAgIC8vIFJlbW92ZSBhbGwgdGhlIHBhcnRpY2xlcyBmcm9tIHRoZSBvYnNlcnZhYmxlIGFycmF5cy5cclxuICAgIHBhcnRpY2xlQXRvbS5jbGVhcigpO1xyXG5cclxuICAgIGNvbnN0IGRlc2VyaWFsaXplZFN0YXRlID0ge1xyXG4gICAgICByZXNpZGVudFBhcnRpY2xlczogc3RhdGVPYmplY3QucmVzaWRlbnRQYXJ0aWNsZUlEcy5tYXAoIFBhcnRpY2xlUmVmZXJlbmNlSU8uZnJvbVN0YXRlT2JqZWN0ICksXHJcbiAgICAgIGVsZWN0cm9uU2hlbGxPY2N1cGFudHM6IHN0YXRlT2JqZWN0LmVsZWN0cm9uU2hlbGxPY2N1cGFudElEcy5tYXAoIE51bGxhYmxlUGFydGljbGVSZWZlcmVuY2VJTy5mcm9tU3RhdGVPYmplY3QgKVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBBZGQgYmFjayB0aGUgcGFydGljbGVzLlxyXG4gICAgZGVzZXJpYWxpemVkU3RhdGUucmVzaWRlbnRQYXJ0aWNsZXMuZm9yRWFjaCggdmFsdWUgPT4geyBwYXJ0aWNsZUF0b20uYWRkUGFydGljbGUoIHZhbHVlICk7IH0gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIGVsZWN0cm9uIHNoZWxsIG9jY3VwYW5jeSBzdGF0ZS5cclxuICAgIGRlc2VyaWFsaXplZFN0YXRlLmVsZWN0cm9uU2hlbGxPY2N1cGFudHMuZm9yRWFjaCggKCBlbGVjdHJvbiwgaW5kZXggKSA9PiB7XHJcbiAgICAgIHBhcnRpY2xlQXRvbS5lbGVjdHJvblNoZWxsUG9zaXRpb25zWyBpbmRleCBdLmVsZWN0cm9uID0gZWxlY3Ryb247XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59ICk7XHJcblxyXG5zaHJlZC5yZWdpc3RlciggJ1BhcnRpY2xlQXRvbScsIFBhcnRpY2xlQXRvbSApO1xyXG5leHBvcnQgZGVmYXVsdCBQYXJ0aWNsZUF0b207Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EscUJBQXFCLE1BQU0sMkNBQTJDO0FBQzdFLE9BQU9DLGVBQWUsTUFBTSxxQ0FBcUM7QUFDakUsT0FBT0MsU0FBUyxNQUFNLDhCQUE4QjtBQUNwRCxPQUFPQyxjQUFjLE1BQU0sbUNBQW1DO0FBQzlELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsZUFBZSxNQUFNLG9DQUFvQztBQUNoRSxPQUFPQyxXQUFXLE1BQU0sc0NBQXNDO0FBQzlELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsT0FBT0MsZUFBZSxNQUFNLDZDQUE2QztBQUN6RSxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FB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