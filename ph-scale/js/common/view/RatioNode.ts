// Copyright 2013-2023, University of Colorado Boulder

/**
 * Visual representation of H3O+/OH- ratio.
 *
 * Particles are drawn as flat circles, directly to Canvas for performance.
 * In the pH range is close to neutral, the relationship between number of particles and pH is log.
 * Outside that range, we can't possibly draw that many particles, so we fake it using a linear relationship.
 *
 * Note: The implementation refers to 'majority' or 'minority' species throughout.
 * This is a fancy was of saying 'the particles that has the larger (or smaller) count'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { CanvasNode, Circle, Node, NodeOptions, Text } from '../../../../scenery/js/imports.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import phScale from '../../phScale.js';
import PHModel, { PHValue } from '../model/PHModel.js';
import PHScaleColors from '../PHScaleColors.js';
import PHScaleConstants from '../PHScaleConstants.js';
import PHScaleQueryParameters from '../PHScaleQueryParameters.js';
import Beaker from '../model/Beaker.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';

// constants
const TOTAL_PARTICLES_AT_PH_7 = 100;
const MAX_MAJORITY_PARTICLES = 3000;
const MIN_MINORITY_PARTICLES = 5; // any non-zero number of particles will be set to this number
const LOG_PH_RANGE = new Range( 6, 8 ); // in this range, number of particles is computed using log

const H3O_RADIUS = 3;
const OH_RADIUS = H3O_RADIUS;

const MAJORITY_ALPHA = 0.55; // alpha of the majority species, [0-1], transparent-opaque
const MINORITY_ALPHA = 1.0; // alpha of the minority species, [0-1], transparent-opaque
const H3O_STROKE = 'black'; // optional stroke around H3O+ particles
const H3O_LINE_WIDTH = 0.25; // width of stroke around H3O+ particles, ignored if H3O_STROKE is null
const OH_STROKE = 'black'; // optional stroke around OH- particles
const OH_LINE_WIDTH = 0.25; // width of stroke around OH- particles, ignored if OH_STROKE is null

type SelfOptions = EmptySelfOptions;

type RatioNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem' | 'visibleProperty'>;

export default class RatioNode extends Node {

  private readonly pHProperty: TReadOnlyProperty<PHValue>;
  private readonly particlesNode: ParticlesCanvas;
  private readonly ratioText: Text | null;
  private readonly beakerBounds: Bounds2;

  public constructor( beaker: Beaker,
                      pHProperty: TReadOnlyProperty<PHValue>,
                      totalVolumeProperty: TReadOnlyProperty<number>,
                      modelViewTransform: ModelViewTransform2,
                      providedOptions: RatioNodeOptions ) {

    const options = providedOptions;

    super();

    this.pHProperty = pHProperty;

    // bounds of the beaker, in view coordinates
    this.beakerBounds = modelViewTransform.modelToViewBounds( beaker.bounds );

    // parent for all particles
    this.particlesNode = new ParticlesCanvas( this.beakerBounds );
    this.addChild( this.particlesNode );

    // Show the ratio of particles
    this.ratioText = null;
    if ( PHScaleQueryParameters.showRatio ) {
      this.ratioText = new Text( '?', {
        font: new PhetFont( 30 ),
        fill: 'black'
      } );
      this.addChild( this.ratioText );
    }

    // call before registering for Property notifications, because 'visible' significantly affects initialization time
    this.mutate( options );

    // sync view with model
    pHProperty.link( this.update.bind( this ) );

    // This Property was added for PhET-iO, to show the actual H3O+/OH- ratio of the solution. It is not used
    // elsewhere, hence the eslint-disable comment below. See https://github.com/phetsims/ph-scale/issues/112
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ratioProperty = new DerivedProperty( [ pHProperty ],
      pH => {
        if ( pH === null ) {
          return null;
        }
        else {
          const concentrationH3O = PHModel.pHToConcentrationH3O( pH )!;
          assert && assert( concentrationH3O !== null );
          const concentrationOH = PHModel.pHToConcentrationOH( pH )!;
          assert && assert( concentrationOH !== null && concentrationOH !== 0 );
          return concentrationH3O / concentrationOH;
        }
      }, {
        tandem: options.tandem.createTandem( 'ratioProperty' ),
        phetioValueType: NullableIO( NumberIO ),
        phetioDocumentation: 'the H<sub>3</sub>O<sup>+</sup>/OH<sup>-</sup> ratio of the solution in the beaker, null if the beaker is empty',
        phetioHighFrequency: true
      } );

    // clip to the shape of the solution in the beaker
    totalVolumeProperty.link( totalVolume => {
      if ( totalVolume === 0 ) {
        this.clipArea = null;
      }
      else {
        const solutionHeight = this.beakerBounds.getHeight() * totalVolume / beaker.volume;
        this.clipArea = Shape.rectangle( this.beakerBounds.minX, this.beakerBounds.maxY - solutionHeight, this.beakerBounds.getWidth(), solutionHeight );
      }
      this.particlesNode.invalidatePaint(); //WORKAROUND: #25, scenery#200
    } );

    // Update this Node when it becomes visible.
    this.visibleProperty.link( visible => visible && this.update() );
  }

  /**
   * Updates the number of particles when the pH (as displayed on the meter) changes.
   * If total volume changes, we don't create more particles, we just expose more of them.
   */
  private update(): void {

    // don't update if not visible
    if ( !this.visible ) { return; }

    let pH = this.pHProperty.value;
    if ( pH !== null ) {
      pH = Utils.toFixedNumber( pH, PHScaleConstants.PH_METER_DECIMAL_PLACES );
    }

    let numberOfH3O = 0;
    let numberOfOH = 0;

    if ( pH !== null ) {

      // compute number of particles
      if ( LOG_PH_RANGE.contains( pH ) ) {

        // number of particles varies logarithmically in this range
        numberOfH3O = Math.max( MIN_MINORITY_PARTICLES, computeNumberOfH3O( pH ) );
        numberOfOH = Math.max( MIN_MINORITY_PARTICLES, computeNumberOfOH( pH ) );
      }
      else {

        // number of particles varies linearly in this range
        // N is the number of particles to add for each 1 unit of pH above or below the thresholds
        const N = ( MAX_MAJORITY_PARTICLES - computeNumberOfOH( LOG_PH_RANGE.max ) ) / ( PHScaleConstants.PH_RANGE.max - LOG_PH_RANGE.max );
        let pHDiff;
        if ( pH > LOG_PH_RANGE.max ) {

          // strong base
          pHDiff = pH - LOG_PH_RANGE.max;
          numberOfH3O = Math.max( MIN_MINORITY_PARTICLES, ( computeNumberOfH3O( LOG_PH_RANGE.max ) - pHDiff ) );
          numberOfOH = computeNumberOfOH( LOG_PH_RANGE.max ) + ( pHDiff * N );
        }
        else {

          // strong acid
          pHDiff = LOG_PH_RANGE.min - pH;
          numberOfH3O = computeNumberOfH3O( LOG_PH_RANGE.min ) + ( pHDiff * N );
          numberOfOH = Math.max( MIN_MINORITY_PARTICLES, ( computeNumberOfOH( LOG_PH_RANGE.min ) - pHDiff ) );
        }
      }

      // convert to integer values
      numberOfH3O = Utils.roundSymmetric( numberOfH3O );
      numberOfOH = Utils.roundSymmetric( numberOfOH );
    }

    // update particles
    this.particlesNode.setNumberOfParticles( numberOfH3O, numberOfOH );

    // update ratio counts
    if ( this.ratioText ) {
      this.ratioText.string = `${numberOfH3O} / ${numberOfOH}`;
      this.ratioText.centerX = this.beakerBounds.centerX;
      this.ratioText.bottom = this.beakerBounds.maxY - 20;
    }
  }
}

// Creates a random x-coordinate inside some {Bounds2} bounds. Integer values improve Canvas performance.
function createRandomX( bounds: Bounds2 ): number {
  return dotRandom.nextIntBetween( bounds.minX, bounds.maxX );
}

// Creates a random y-coordinate inside some {Bounds2} bounds. Integer values improve Canvas performance.
function createRandomY( bounds: Bounds2 ): number {
  return dotRandom.nextIntBetween( bounds.minY, bounds.maxY );
}

// Computes the number of H3O+ particles for some pH.
function computeNumberOfH3O( pH: PHValue ): number {
  if ( pH === null ) {
    return 0;
  }
  else {
    const concentrationH3O = PHModel.pHToConcentrationH3O( pH )!;
    assert && assert( concentrationH3O !== null, 'concentrationH3O is not expected to be null when pH !== null' );
    return Utils.roundSymmetric( concentrationH3O * ( TOTAL_PARTICLES_AT_PH_7 / 2 ) / 1E-7 );
  }
}

// Computes the number of OH- particles for some pH.
function computeNumberOfOH( pH: PHValue ): number {
  if ( pH === null ) {
    return 0;
  }
  else {
    const concentrationOH = PHModel.pHToConcentrationOH( pH )!;
    assert && assert( concentrationOH !== null, 'concentrationOH is not expected to be null when pH !== null' );
    return Utils.roundSymmetric( concentrationOH * ( TOTAL_PARTICLES_AT_PH_7 / 2 ) / 1E-7 );
  }
}

/**
 * Draws all particles directly to Canvas.
 */
class ParticlesCanvas extends CanvasNode {

  private readonly beakerBounds: Bounds2;
  private particleCountH3O: number;
  private particleCountOH: number;

  // x and y coordinates for particles
  private readonly xH3O: Float32Array;
  private readonly yH3O: Float32Array;
  private readonly xOH: Float32Array;
  private readonly yOH: Float32Array;

  // majority and minority images for each particle type
  private imageH3OMajority: HTMLCanvasElement | null;
  private imageH3OMinority: HTMLCanvasElement | null;
  private imageOHMajority: HTMLCanvasElement | null;
  private imageOHMinority: HTMLCanvasElement | null;

  /**
   * @param beakerBounds - beaker bounds in view coordinate frame
   */
  public constructor( beakerBounds: Bounds2 ) {

    super( { canvasBounds: beakerBounds } );

    this.beakerBounds = beakerBounds;
    this.particleCountH3O = 0;
    this.particleCountOH = 0;

    // use typed array if available, it will use less memory and be faster
    const ArrayConstructor = window.Float32Array || window.Array;

    // pre-allocate arrays for particles x and y coordinates, to eliminate allocation in critical code
    this.xH3O = new ArrayConstructor( MAX_MAJORITY_PARTICLES );
    this.yH3O = new ArrayConstructor( MAX_MAJORITY_PARTICLES );
    this.xOH = new ArrayConstructor( MAX_MAJORITY_PARTICLES );
    this.yOH = new ArrayConstructor( MAX_MAJORITY_PARTICLES );

    // Generate majority and minority {HTMLCanvasElement} for each particle type
    this.imageH3OMajority = null;
    new Circle( H3O_RADIUS, {
      fill: PHScaleColors.H3O_PARTICLES.withAlpha( MAJORITY_ALPHA ),
      stroke: H3O_STROKE,
      lineWidth: H3O_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageH3OMajority = canvas;
      } );

    this.imageH3OMinority = null;
    new Circle( H3O_RADIUS, {
      fill: PHScaleColors.H3O_PARTICLES.withAlpha( MINORITY_ALPHA ),
      stroke: H3O_STROKE,
      lineWidth: H3O_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageH3OMinority = canvas;
      } );

    this.imageOHMajority = null;
    new Circle( OH_RADIUS, {
      fill: PHScaleColors.OH_PARTICLES.withAlpha( MAJORITY_ALPHA ),
      stroke: OH_STROKE,
      lineWidth: OH_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageOHMajority = canvas;
      } );

    this.imageOHMinority = null;
    new Circle( OH_RADIUS, {
      fill: PHScaleColors.OH_PARTICLES.withAlpha( MINORITY_ALPHA ),
      stroke: OH_STROKE,
      lineWidth: OH_LINE_WIDTH
    } )
      .toCanvas( ( canvas, x, y, width, height ) => {
        this.imageOHMinority = canvas;
      } );
  }

  /**
   * Sets the number of particles to display. Called when the solution's pH changes.
   */
  public setNumberOfParticles( particleCountH3O: number, particleCountOH: number ): void {
    if ( particleCountH3O !== this.particleCountH3O || particleCountOH !== this.particleCountOH ) {

      /*
       * paintCanvas may be called when other things in beakerBounds change,
       * and we don't want the particle positions to change when the pH remains constant.
       * So generate and store particle coordinates here, reusing the arrays.
       * See https://github.com/phetsims/ph-scale/issues/25
       */
      let i;
      for ( i = 0; i < particleCountH3O; i++ ) {
        this.xH3O[ i ] = createRandomX( this.beakerBounds );
        this.yH3O[ i ] = createRandomY( this.beakerBounds );
      }
      for ( i = 0; i < particleCountOH; i++ ) {
        this.xOH[ i ] = createRandomX( this.beakerBounds );
        this.yOH[ i ] = createRandomY( this.beakerBounds );
      }

      // remember how many entries in coordinate arrays are significant
      this.particleCountH3O = particleCountH3O;
      this.particleCountOH = particleCountOH;

      this.invalidatePaint(); // results in paintCanvas being called
    }
  }

  /**
   * Paints particles to the Canvas.
   */
  public override paintCanvas( context: CanvasRenderingContext2D ): void {

    // draw majority species behind minority species
    if ( this.particleCountH3O > this.particleCountOH ) {
      this.drawParticles( context, this.imageH3OMajority!, this.particleCountH3O, this.xH3O, this.yH3O );
      this.drawParticles( context, this.imageOHMinority!, this.particleCountOH, this.xOH, this.yOH );
    }
    else {
      this.drawParticles( context, this.imageOHMajority!, this.particleCountOH, this.xOH, this.yOH );
      this.drawParticles( context, this.imageH3OMinority!, this.particleCountH3O, this.xH3O, this.yH3O );
    }
  }

  /**
   * Draws one species of particle. Using drawImage is faster than arc.
   */
  private drawParticles( context: CanvasRenderingContext2D, image: HTMLCanvasElement, particleCount: number,
                         xCoordinates: Float32Array, yCoordinates: Float32Array ): void {
    assert && assert( image, 'HTMLCanvasElement is not loaded yet' );

    // images are generated asynchronously, so test just in case they aren't available when this is first called
    if ( image ) {
      for ( let i = 0; i < particleCount; i++ ) {
        context.drawImage( image, xCoordinates[ i ], yCoordinates[ i ] );
      }
    }
  }
}

phScale.register( 'RatioNode', RatioNode );