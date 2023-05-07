// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model class which the 'Decay' and 'Nuclide Chart' screen will extend.
 *
 * @author Luisa Vargas
 */

import buildANucleus from '../../buildANucleus.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import Range from '../../../../dot/js/Range.js';
import ParticleType from '../view/ParticleType.js';
import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Animation from '../../../../twixt/js/Animation.js';
import Vector2 from '../../../../dot/js/Vector2.js';

class BANModel<T extends ParticleAtom> {

  // the stability of the nuclide
  public readonly isStableBooleanProperty: TReadOnlyProperty<boolean>;

  // if a nuclide exists
  public readonly doesNuclideExistBooleanProperty: TReadOnlyProperty<boolean>;

  // arrays of all Particle's that exist in all places
  public readonly particles: ObservableArray<Particle>;

  // the atom that the user will build, modify, and generally play with.
  public readonly particleAtom: T;

  // the range of the number of protons allowed
  public readonly protonCountRange: Range;

  // the range of the number of neutrons allowed
  public readonly neutronCountRange: Range;

  // array of particles sent to the nucleus but not there yet
  public readonly incomingProtons: ObservableArray<Particle>;
  public readonly incomingNeutrons: ObservableArray<Particle>;

  // keep track of when the double arrow buttons are clicked or when the single arrow buttons are clicked
  public readonly doubleArrowButtonClickedBooleanProperty: TProperty<boolean>;

  // keep track of any particle related animations that may need to be cancelled at some point
  public readonly particleAnimations: ObservableArray<Animation | null>;

  public readonly userControlledProtons: ObservableArray<Particle>;
  public readonly userControlledNeutrons: ObservableArray<Particle>;

  // array of all emitted particles
  public readonly outgoingParticles: ObservableArray<Particle>;

  protected constructor( maximumProtonNumber: number, maximumNeutronNumber: number, particleAtom: T ) {

    // Create the atom
    this.particleAtom = particleAtom;

    this.particles = createObservableArray();

    this.incomingProtons = createObservableArray();
    this.incomingNeutrons = createObservableArray();

    this.userControlledProtons = createObservableArray();
    this.userControlledNeutrons = createObservableArray();

    this.outgoingParticles = createObservableArray();

    this.particleAnimations = createObservableArray();
    this.particleAnimations.addItemRemovedListener( animation => {
      animation && animation.stop();
      animation = null;
    } );

    this.doubleArrowButtonClickedBooleanProperty = new BooleanProperty( false );

    this.protonCountRange = new Range( 0, maximumProtonNumber );
    this.neutronCountRange = new Range( 0, maximumNeutronNumber );

    // the stability of the nuclide is determined by the given number of protons and neutrons
    this.isStableBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.isStable( protonCount, neutronCount )
    );

    // if a nuclide with a given number of protons and neutrons exists
    this.doesNuclideExistBooleanProperty = new DerivedProperty( [ this.particleAtom.protonCountProperty, this.particleAtom.neutronCountProperty ],
      ( protonCount: number, neutronCount: number ) => AtomIdentifier.doesExist( protonCount, neutronCount )
    );

    // TODO: this might be causing bugs since it's being called twice
    // reconfigure the nucleus when the massNumber changes
    this.particleAtom.massNumberProperty.link( () => this.particleAtom.reconfigureNucleus() );
  }

  /**
   * Select the particle closest to its creator node.
   */
  public getParticleToReturn( particleType: ParticleType, creatorNodePosition: Vector2 ): Particle {
    const sortedParticles = _.sortBy( this.getParticlesByType( particleType ), particle => {
      return particle.positionProperty.value.distance( creatorNodePosition );
    } );

    // We know that sortedParticles is not empty, and does not contain null.
    return sortedParticles.shift()!;
  }

  /**
   * Return array of all the particles that are of particleType and part of the particleAtom
   */
  public getParticlesByType( particleType: ParticleType ): Particle[] {
    const filteredParticles = _.filter( this.particles, particle => {
      return this.particleAtom.containsParticle( particle ) && particle.type === particleType.name.toLowerCase();
    } );

    assert && assert( filteredParticles.length !== 0, 'No particles of particleType ' + particleType.name + ' are in the particleAtom.' );

    return filteredParticles;
  }

  /**
   * Return the destination of a particle when it's added to the particle atom
   */
  public getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    return this.particleAtom.positionProperty.value;
  }

  /**
   * Add a Particle to the model
   */
  public addParticle( particle: Particle ): void {
    assert && assert( _.some( ParticleType.enumeration.values, particleType => {
        return particle.type === particleType.name.toLowerCase();
      } ),
      'Particles must be one of the types in ParticleType ' + particle.type );
    this.particles.push( particle );
  }

  /**
   * Remove a Particle from the model
   */
  public removeParticle( particle: Particle ): void {
    this.particles.remove( particle );
  }

  public reset(): void {
    this.particleAtom.clear();
    this.particles.clear();
    this.incomingProtons.clear();
    this.incomingNeutrons.clear();
    this.outgoingParticles.clear();
    this.userControlledProtons.clear();
    this.userControlledNeutrons.clear();
    this.particleAnimations.clear();
  }

  /**
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {

    // Update particle positions
    this.particles.forEach( particle => {
      particle.step( dt );
    } );
  }
}

buildANucleus.register( 'BANModel', BANModel );
export default BANModel;