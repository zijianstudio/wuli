// Copyright 2023, University of Colorado Boulder

import buildANucleus from '../../buildANucleus.js';
import { Circle, Color, Node, RadialGradient } from '../../../../scenery/js/imports.js';
import { ParticleViewMap } from '../../common/view/BANScreenView.js';
import BANConstants from '../../common/BANConstants.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import Particle from '../../../../shred/js/model/Particle.js';
import ParticleView from '../../../../shred/js/view/ParticleView.js';
import Range from '../../../../dot/js/Range.js';

/**
 * Node that holds the ParticleView's from ParticleAtom. Rearranges particles in different node layers using z-indexing.
 *
 * @author Luisa Vargas
 * @author Marla Schulz (PhET Interactive Simulations)
 */

// empirically determined, from the ElectronCloudView radius
const MIN_ELECTRON_CLOUD_RADIUS = 42.5;

class ParticleAtomNode extends Node {
  
  private nucleonLayers: Node[];
  public readonly electronCloud: Circle;
  private readonly atomCenter: Vector2;
  private protonCountRange: Range;
  private readonly particleViewMap: ParticleViewMap;
  public readonly emptyAtomCircle: Circle;
  
  public constructor( particleViewMap: ParticleViewMap, atomCenter: Vector2, protonCountRange: Range ) {

    // Add the nucleonLayers
    const nucleonLayers: Node[] = [];
    _.times( BANConstants.NUMBER_OF_NUCLEON_LAYERS, () => {
      const nucleonLayer = new Node();
      nucleonLayers.push( nucleonLayer );
    } );

    // create and add the electron cloud
    const electronCloud = new Circle( {
      radius: MIN_ELECTRON_CLOUD_RADIUS,
      fill: new RadialGradient( 0, 0, 0, 0, 0, MIN_ELECTRON_CLOUD_RADIUS )
        .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
        .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' )
    } );
    electronCloud.center = atomCenter;

    // create and add the dashed empty circle at the center
    const lineWidth = 1;
    const emptyAtomCircle = new Circle( {
      radius: BANConstants.PARTICLE_RADIUS - lineWidth,
      stroke: Color.GRAY,
      lineDash: [ 2, 2 ],
      lineWidth: lineWidth
    } );
    emptyAtomCircle.center = atomCenter;

    super( { children: [ emptyAtomCircle, electronCloud, ...nucleonLayers ] } );

    this.nucleonLayers = nucleonLayers;
    this.nucleonLayers.reverse(); // Set up the nucleon layers so that layer 0 is in front.

    this.particleViewMap = particleViewMap;
    this.atomCenter = atomCenter;
    this.protonCountRange = protonCountRange;
    this.electronCloud = electronCloud;
    this.emptyAtomCircle = emptyAtomCircle;
  }


  /**
   * Add ParticleView to the correct nucleonLayer.
   */
  public addParticleView( particle: Particle ): void {
    const particleView = this.particleViewMap[ particle.id ];
    this.nucleonLayers[ particle.zLayerProperty.get() ].addChild( particleView );

    // Add a listener that adjusts a nucleon's z-order layering.
    particle.zLayerProperty.link( zLayer => {
      assert && assert(
        this.nucleonLayers.length > zLayer,
        'zLayer for nucleon exceeds number of layers, max number may need increasing.'
      );

      // Determine whether nucleon view is on the correct layer.
      let onCorrectLayer = false;
      const nucleonLayersChildren = this.nucleonLayers[ zLayer ].getChildren() as ParticleView[];
      nucleonLayersChildren.forEach( particleView => {
        if ( particleView.particle === particle ) {
          onCorrectLayer = true;
        }
      } );

      if ( !onCorrectLayer ) {

        // Remove particle view from its current layer.
        let particleView = null;
        for ( let layerIndex = 0; layerIndex < this.nucleonLayers.length && particleView === null; layerIndex++ ) {
          for ( let childIndex = 0; childIndex < this.nucleonLayers[ layerIndex ].children.length; childIndex++ ) {
            const nucleonLayersChildren = this.nucleonLayers[ layerIndex ].getChildren() as ParticleView[];
            if ( nucleonLayersChildren[ childIndex ].particle === particle ) {
              particleView = nucleonLayersChildren[ childIndex ];
              this.nucleonLayers[ layerIndex ].removeChildAt( childIndex );
              break;
            }
          }
        }

        // Add the particle view to its new layer.
        assert && assert( particleView, 'Particle view not found during relayering' );
        this.nucleonLayers[ zLayer ].addChild( particleView! );
      }
    } );
  }

  /**
   * This method increases the value of the smaller radius values and decreases the value of the larger ones.
   * This effectively reduces the range of radii values used.
   * This is a very specialized function for the purposes of this class.
   *
   * minChangedRadius and maxChangedRadius define the way in which an input value is increased or decreased. These values
   * can be adjusted as needed to make the cloud size appear as desired.
   */
  private static reduceRadiusRange( value: number, minShellRadius: number, maxShellRadius: number,
                                    minChangedRadius: number, maxChangedRadius: number ): number {
    const compressionFunction = new LinearFunction( minShellRadius, maxShellRadius, minChangedRadius, maxChangedRadius );
    return compressionFunction.evaluate( value );
  }

  /**
   * Maps a number of electrons to a diameter in screen coordinates for the electron shell.  This mapping function is
   * based on the real size relationships between the various atoms, but has some tweakable parameters to reduce the
   * range and scale to provide values that are usable for our needs on the canvas.
   */
  private getElectronShellDiameter( numElectrons: number, minChangedRadius: number, maxChangedRadius: number ): number {
    const maxElectrons = this.protonCountRange.max;
    const atomicRadius = AtomIdentifier.getAtomicRadius( numElectrons );
    if ( atomicRadius ) {
      return ParticleAtomNode.reduceRadiusRange( atomicRadius, this.protonCountRange.min + 1, maxElectrons,
        minChangedRadius, maxChangedRadius );
    }
    else {
      assert && assert( numElectrons <= maxElectrons, `Atom has more than supported number of electrons, ${numElectrons}` );
      return 0;
    }
  }

  /**
   * Update size of electron cloud based on protonNumber since the nuclides created are neutral, meaning the number of
   * electrons is the same as the number of protons.
   */
  public updateCloudSize( protonCount: number, factor: number, minChangedRadius: number, maxChangedRadius: number ): void {
    if ( protonCount === 0 ) {
      this.electronCloud.radius = 1E-5; // arbitrary non-zero value
      this.electronCloud.fill = 'transparent';
    }
    else {
      const radius = this.atomCenter.x - ( this.getElectronShellDiameter( protonCount, minChangedRadius, maxChangedRadius ) / 2 );
      this.electronCloud.radius = radius * factor;
      this.electronCloud.fill = new RadialGradient( 0, 0, 0, 0, 0, radius * factor )
        .addColorStop( 0, 'rgba( 0, 0, 255, 200 )' )
        .addColorStop( 0.9, 'rgba( 0, 0, 255, 0 )' );
    }
  }

}

buildANucleus.register( 'ParticleAtomNode', ParticleAtomNode );
export default ParticleAtomNode;
