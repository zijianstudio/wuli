// Copyright 2022-2023, University of Colorado Boulder

import { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleAtom from '../../../../shred/js/model/ParticleAtom.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import ParticleType from '../../common/view/ParticleType.js';
import EnergyLevelType from './EnergyLevelType.js';

/**
 * A model element that represents a nucleus that is made up of protons and neutrons. This model element
 * manages the positions and motion of all particles that are a part of the nucleus.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Luisa Vargas
 */

type ParticleShellPosition = {
  particle: Particle | undefined;
  xPosition: number; // 0 - 5
  type: ParticleType;
};

// constants

// row is yPosition, number is xPosition
const ALLOWED_PARTICLE_POSITIONS = [
  [ 2, 3 ],
  [ 0, 1, 2, 3, 4, 5 ],
  [ 0, 1, 2, 3, 4, 5 ]
];

class ParticleNucleus extends ParticleAtom {

  // allowed proton positions
  public readonly protonShellPositions: ParticleShellPosition[][];

  // allowed neutron positions
  public readonly neutronShellPositions: ParticleShellPosition[][];

  public readonly modelViewTransform: ModelViewTransform2;
  private readonly protonsLevelProperty: EnumerationProperty<EnergyLevelType>;
  private readonly neutronsLevelProperty: EnumerationProperty<EnergyLevelType>;

  public constructor() {
    super();

    this.modelViewTransform = BANConstants.NUCLEON_ENERGY_LEVEL_ARRAY_MVT;

    // Initialize the positions where a nucleon can be placed.
    this.protonShellPositions = [
      [], [], []
    ];
    this.neutronShellPositions = [
      [], [], []
    ];
    for ( let i = 0; i < ALLOWED_PARTICLE_POSITIONS.length; i++ ) {
      for ( let j = 0; j < ALLOWED_PARTICLE_POSITIONS[ i ].length; j++ ) {
        const shellPosition = { particle: undefined, xPosition: ALLOWED_PARTICLE_POSITIONS[ i ][ j ] };
        const protonShellPosition = { ...shellPosition, type: ParticleType.PROTON };
        const neutronShellPosition = { ...shellPosition, type: ParticleType.NEUTRON };
        this.protonShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = protonShellPosition;
        this.neutronShellPositions[ i ][ ALLOWED_PARTICLE_POSITIONS[ i ][ j ] ] = neutronShellPosition;
      }
    }

    // keep track of bound levels
    this.protonsLevelProperty = new EnumerationProperty( EnergyLevelType.NONE );
    this.neutronsLevelProperty = new EnumerationProperty( EnergyLevelType.NONE );

    // update bound levels based on nucleon counts
    this.protonCountProperty.link( protonCount => {
      if ( protonCount >= 9 ) {
        this.protonsLevelProperty.value = EnergyLevelType.SECOND;
      }
      else if ( protonCount >= 3 ) {
        this.protonsLevelProperty.value = EnergyLevelType.FIRST;
      }
      else {
        this.protonsLevelProperty.value = EnergyLevelType.NONE;
      }
    } );
    this.neutronCountProperty.link( neutronCount => {
      if ( neutronCount >= 9 ) {
        this.neutronsLevelProperty.value = EnergyLevelType.SECOND;
      }
      else if ( neutronCount >= 3 ) {
        this.neutronsLevelProperty.value = EnergyLevelType.FIRST;
      }
      else {
        this.neutronsLevelProperty.value = EnergyLevelType.NONE;
      }
    } );

    // update nucleon positions when the level state changes
    this.protonsLevelProperty.link( () =>
      this.updateNucleonPositions( this.protons, this.protonShellPositions, this.protonsLevelProperty, 0 ) );
    this.neutronsLevelProperty.link( () =>
      this.updateNucleonPositions( this.neutrons, this.neutronShellPositions, this.neutronsLevelProperty,
        BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS ) );
  }

  public getLastParticleInShell( particleType: ParticleType ): Particle | undefined {
    const nucleonShellPositions = particleType === ParticleType.NEUTRON ? this.neutronShellPositions : this.protonShellPositions;
    for ( let i = nucleonShellPositions.length - 1; i >= 0; i-- ) {
      const nucleonShellRow = nucleonShellPositions[ i ];
      for ( let j = nucleonShellRow.length - 1; j >= 0; j-- ) {
        if ( nucleonShellRow[ j ].particle !== undefined ) {
          return nucleonShellRow[ j ].particle!;
        }
      }
    }
    return undefined;
  }

  /**
   * Return the view destination of the next open position for the given particleType shell positions.
   */
  public getParticleDestination( particleType: ParticleType, particle: Particle ): Vector2 {
    const nucleonShellPositions = particleType === ParticleType.NEUTRON ? this.neutronShellPositions : this.protonShellPositions;
    let yPosition = 0;

    const openNucleonShellPositions = nucleonShellPositions.map( particleShellRow => {

      // remove any empty particleShellPosition's from particleShellRow
      const noEmptyPositions = particleShellRow.filter( particleShellPosition => particleShellPosition !== undefined );

      // get the first open shell position in this particleShellRow
      return noEmptyPositions.find( particleShellPosition => particleShellPosition.particle === undefined );
    } );

    // get the first open shell position available from all rows
    const openParticleShellPosition = openNucleonShellPositions.find( ( particleShellPosition, index ) => {
      yPosition = index;
      return particleShellPosition !== undefined;
    } );

    assert && assert( openParticleShellPosition !== undefined, 'To add a particle there must be an empty particleShellPosition.' );

    openParticleShellPosition!.particle = particle;
    // @ts-expect-error openParticleShellPosition should never be undefined
    const viewDestination = this.modelViewTransform.modelToViewXY( openParticleShellPosition.xPosition, yPosition );

    // add x offset for neutron particle to be aligned with its energy level position
    viewDestination.addXY( particleType === ParticleType.NEUTRON ? BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS : 0, 0 );
    return viewDestination;
  }

  public override reconfigureNucleus(): void {
    this.updateNucleonPositions( this.protons, this.protonShellPositions, this.protonsLevelProperty, 0 );
    this.updateNucleonPositions( this.neutrons, this.neutronShellPositions, this.neutronsLevelProperty,
      BANConstants.X_DISTANCE_BETWEEN_ENERGY_LEVELS );
  }

  public override removeParticle( particle: Particle ): void {
    const nucleonShellPositions = particle.type === ParticleType.PROTON.name.toLowerCase() ? this.protonShellPositions : this.neutronShellPositions;
    nucleonShellPositions.forEach( nucleonShellRow => {
      nucleonShellRow.forEach( nucleonShellPosition => {
        if ( nucleonShellPosition.particle === particle ) {
          nucleonShellPosition.particle = undefined;
        }
      } );
    } );

    super.removeParticle( particle );
  }

  /**
   * Fill all nucleons in open positions from bottom to top, left to right
   */
  private updateNucleonPositions( particleArray: ObservableArray<Particle>, particleShellPositions: ParticleShellPosition[][],
                                   levelFillProperty: EnumerationProperty<EnergyLevelType>, xOffset: number ): void {
    const levelWidth = this.modelViewTransform.modelToViewX( ALLOWED_PARTICLE_POSITIONS[ 1 ][ 5 ] ) -
                       this.modelViewTransform.modelToViewX( ALLOWED_PARTICLE_POSITIONS[ 1 ][ 0 ] );
    particleArray.forEach( ( particle, index ) => {
      const yPosition = index < 2 ? 0 : index < 8 ? 1 : 2;
      const xPosition = yPosition === 0 ? index + 2 : yPosition === 1 ? index - 2 : index - 8;

      // last level (yPosition === 2) never bound so don't need levelIndex condition for it
      const levelIndex = yPosition === 0 ? index : index - 2;
      const nucleonShellPosition = particleShellPositions[ yPosition ][ xPosition ];
      const unBoundXPosition = this.modelViewTransform.modelToViewX( nucleonShellPosition.xPosition ) + xOffset;

      nucleonShellPosition.particle = particle;

      let viewDestination;
      let inputEnabled;

      // if the yPosition of the levelFillProperty is higher than the current yPosition level, 'bind' the particles in
      // this level by removing the spaces between them
      if ( yPosition < levelFillProperty.value.yPosition ) {

        // each particle on the level has one 'particle radius' space except for one.
        // there are 2 particles on the y = 0 level and 6 particles on the y = 1 level.
        const numberOfRadiusSpaces = yPosition === 0 ? 2 - 1 : 6 - 1;

        // amount each particle moves so the space between it and the particle on its left is removed
        const boundOffset = levelWidth * ( levelIndex / ( 3 * 5 ) ); // 3 radius spaces / particle * 5 particle spaces

        // amount each particle has to move for all particles to be centered in middle of energy level
        const centerOffset = BANConstants.PARTICLE_RADIUS * numberOfRadiusSpaces / 2;

        const destinationX = unBoundXPosition - boundOffset + centerOffset;

        viewDestination = new Vector2( destinationX, this.modelViewTransform.modelToViewY( yPosition ) );
        inputEnabled = false;
      }
      else {
        viewDestination = this.modelViewTransform.modelToViewXY( nucleonShellPosition.xPosition, yPosition );
        viewDestination.addXY( xOffset, 0 );
        inputEnabled = true;
      }

      // add x offset so neutron particles are aligned with their energy levels
      particle.destinationProperty.set( viewDestination );
      particle.inputEnabledProperty.value = inputEnabled;
    } );
  }
}

buildANucleus.register( 'ParticleNucleus', ParticleNucleus );
export default ParticleNucleus;
