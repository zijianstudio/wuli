// Copyright 2022-2023, University of Colorado Boulder

/**
 * Node that represents the nucleon shells, aka straight horizontal lines above the buckets, in the view.
 *
 * @author Luisa Vargas
 */

import { Color, Line, Node, NodeOptions } from '../../../../scenery/js/imports.js';
import buildANucleus from '../../buildANucleus.js';
import BANConstants from '../../common/BANConstants.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Particle from '../../../../shred/js/model/Particle.js';
import BANColors from '../../common/BANColors.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import ParticleType from '../../common/view/ParticleType.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';

type SelfOptions = {
  xOffset?: number;
};
type EnergyLevelNodeOptions = SelfOptions & NodeOptions;
type ParticleShellPosition = {
  particle: Particle | undefined;
  xPosition: number; // 0 - 5
};

// nucleon number to energy level stroke color
const neutronNumberToColorLowerLevel = [
  Color.BLACK, // 0
  new Color( 64, 64, 64 ), // 1
  BANColors.neutronColorProperty.value // 2
];
const neutronNumberToColorUpperLevel = [
  Color.BLACK, // 0
  new Color( 21, 21, 21 ), // 1
  new Color( 43, 43, 43 ), // 2
  new Color( 64, 64, 64 ), // 3
  new Color( 85, 85, 85 ), // 4
  new Color( 107, 107, 107 ), // 5
  BANColors.neutronColorProperty.value // 6
];
const protonNumberToColorLowerLevel = [
  Color.BLACK, // 0
  new Color( 128, 43, 0 ), // 1
  BANColors.protonColorProperty.value // 2
];
const protonNumberToColorUpperLevel = [
  Color.BLACK, // 0
  new Color( 43, 14, 0 ), // 1
  new Color( 85, 28, 0 ), // 2
  new Color( 128, 43, 0 ), // 3
  new Color( 170, 57, 0 ), // 4
  new Color( 213, 71, 0 ), // 5
  BANColors.protonColorProperty.value // 6
];

class NucleonShellView extends Node {
  private modelViewTransform: ModelViewTransform2;

  public constructor( particleType: ParticleType, nucleonShellPositions: ParticleShellPosition[][],
                      nucleonCountProperty: TReadOnlyProperty<number>, particleViewPositionVector: Vector2,
                      providedOptions?: EnergyLevelNodeOptions ) {

    const options = optionize<EnergyLevelNodeOptions, SelfOptions, NodeOptions>()( {
      xOffset: 0
    }, providedOptions );
    super( options );

    this.y = particleViewPositionVector.y + BANConstants.PARTICLE_RADIUS;
    this.x = particleViewPositionVector.x + options.xOffset - BANConstants.PARTICLE_RADIUS;

    this.modelViewTransform = BANConstants.NUCLEON_ENERGY_LEVEL_ARRAY_MVT;

    // create and add the nucleon energy levels
    const energyLevels: Line[] = [];
    nucleonShellPositions.forEach( ( particleShellRow, energyLevel ) => {
      const particleLength = 2 * BANConstants.PARTICLE_RADIUS;
      energyLevels.push(
        new Line(
          this.modelViewTransform.modelToViewX( particleShellRow[ energyLevel === 0 ? 2 : 0 ].xPosition ),
          this.modelViewTransform.modelToViewY( energyLevel ),

          // extend the energyLevel to the outer edge of the last particle
          this.modelViewTransform.modelToViewX( particleShellRow[ particleShellRow.length - 1 ].xPosition ) + particleLength,
          this.modelViewTransform.modelToViewY( energyLevel ),
          {
            stroke: 'black'
          }
        )
      );
    } );
    energyLevels.forEach( energyLevel => this.addChild( energyLevel ) );

    // update the stroke color and width of the respective energy levels as the nucleon count changes
    const boldEnergyLevelWidth = 4;
    const defaultEnergyLevelWidth = 1;
    const nucleonCountToColorLowerLevel = particleType === ParticleType.PROTON ? protonNumberToColorLowerLevel :
                                          neutronNumberToColorLowerLevel;
    const nucleonCountToColorUpperLevel = particleType === ParticleType.PROTON ? protonNumberToColorUpperLevel :
                                          neutronNumberToColorUpperLevel;
    nucleonCountProperty.link( nucleonCount => {
      if ( nucleonCount <= 2 ) {
        energyLevels[ 0 ].stroke = nucleonCountToColorLowerLevel[ nucleonCount ];

        // if the energy level is full (2 particles on the lower energy level), double the lineWidth
        energyLevels[ 0 ].lineWidth = nucleonCount === 2 ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
      else {
        let energyLevelNumber = 1;
        if ( nucleonCount > 8 ) {
          nucleonCount -= 6;
          energyLevelNumber = 2;
        }
        nucleonCount -= 2;
        energyLevels[ energyLevelNumber ].stroke = nucleonCountToColorUpperLevel[ nucleonCount ];

        // if the energy level is full (6 particles on the upper and middle energy levels), double the lineWidth
        energyLevels[ energyLevelNumber ].lineWidth = nucleonCount === 6 ? boldEnergyLevelWidth : defaultEnergyLevelWidth;
      }
    } );
  }
}

buildANucleus.register( 'NucleonShellView', NucleonShellView );
export default NucleonShellView;