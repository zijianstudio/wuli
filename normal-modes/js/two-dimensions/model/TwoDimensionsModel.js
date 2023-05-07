// Copyright 2020-2022, University of Colorado Boulder

/**
 * The model for the 'Two Dimensions' Screen.
 *
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import Mass from '../../common/model/Mass.js';
import NormalModesModel from '../../common/model/NormalModesModel.js';
import Spring from '../../common/model/Spring.js';
import NormalModesConstants from '../../common/NormalModesConstants.js';
import normalModes from '../../normalModes.js';

const MAX_MASSES = NormalModesConstants.MAX_MASSES_PER_ROW + 2;
const MAX_SPRINGS = MAX_MASSES - 1;

class TwoDimensionsModel extends NormalModesModel {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // @public {NumberProperty[][]} 2-dimensional arrays of Properties for each mode
    this.modeXAmplitudeProperties = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
    this.modeYAmplitudeProperties = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
    this.modeXPhaseProperties = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
    this.modeYPhaseProperties = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
    this.modeFrequencyProperties = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );

    for ( let i = 0; i < NormalModesConstants.MAX_MASSES_PER_ROW; i++ ) {

      this.modeXAmplitudeProperties[ i ] = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
      this.modeYAmplitudeProperties[ i ] = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
      this.modeXPhaseProperties[ i ] = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
      this.modeYPhaseProperties[ i ] = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
      this.modeFrequencyProperties[ i ] = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );

      for ( let j = 0; j < NormalModesConstants.MAX_MASSES_PER_ROW; ++j ) {

        // Use 1-based indexing for the tandem names. See https://github.com/phetsims/normal-modes/issues/55
        const tandemIndex1 = i + 1;
        const tandemIndex2 = j + 1;

        this.modeXAmplitudeProperties[ i ][ j ] = new NumberProperty( NormalModesConstants.INITIAL_AMPLITUDE, {
          tandem: options.tandem.createTandem( `modeXAmplitude[${tandemIndex1},${tandemIndex2}]Property` ),
          range: new Range( NormalModesConstants.MIN_AMPLITUDE, Number.POSITIVE_INFINITY )
        } );

        this.modeYAmplitudeProperties[ i ][ j ] = new NumberProperty( NormalModesConstants.INITIAL_AMPLITUDE, {
          tandem: options.tandem.createTandem( `modeYAmplitude[${tandemIndex1},${tandemIndex2}]Property` ),
          range: new Range( NormalModesConstants.MIN_AMPLITUDE, Number.POSITIVE_INFINITY )
        } );

        this.modeXPhaseProperties[ i ][ j ] = new NumberProperty( NormalModesConstants.INITIAL_PHASE, {
          tandem: options.tandem.createTandem( `modeXPhase[${tandemIndex1},${tandemIndex2}]Property` ),
          range: new Range( NormalModesConstants.MIN_PHASE, NormalModesConstants.MAX_PHASE )
        } );

        this.modeYPhaseProperties[ i ][ j ] = new NumberProperty( NormalModesConstants.INITIAL_PHASE, {
          tandem: options.tandem.createTandem( `modeYPhase[${tandemIndex1},${tandemIndex2}]Property` ),
          range: new Range( NormalModesConstants.MIN_PHASE, NormalModesConstants.MAX_PHASE )
        } );

        // dispose is unnecessary, since this class owns the dependency
        this.modeFrequencyProperties[ i ][ j ] = new DerivedProperty( [ this.numberOfMassesProperty ],
          numberMasses => {
            const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
            const m = NormalModesConstants.MASSES_MASS_VALUE;
            if ( i >= numberMasses || j >= numberMasses ) {
              return 0;
            }
            else {
              const omegaI = 2 * Math.sqrt( k / m ) * Math.sin( Math.PI / 2 * ( i + 1 ) / ( numberMasses + 1 ) );
              const omegaJ = 2 * Math.sqrt( k / m ) * Math.sin( Math.PI / 2 * ( j + 1 ) / ( numberMasses + 1 ) );
              return Math.sqrt( omegaI ** 2 + omegaJ ** 2 );
            }
          },
          {
            tandem: options.tandem.createTandem( `modeFrequency[${tandemIndex1},${tandemIndex2}]Property` ),
            phetioValueType: NumberIO
          }
        );
      }
    }

    // @public {Mass[][]} 2-dimensional array that will contain all of the masses.
    this.masses = new Array( MAX_MASSES );
    for ( let i = 0; i < MAX_MASSES; ++i ) {
      this.masses[ i ] = new Array( MAX_MASSES );
    }
    this.createDefaultMasses( options.tandem );

    // @public {Spring[][]} 2-dimensional array that will contain all of the springs.
    this.springsX = new Array( MAX_SPRINGS );
    this.springsY = new Array( MAX_SPRINGS );
    for ( let i = 0; i < MAX_SPRINGS; ++i ) {
      this.springsX[ i ] = new Array( MAX_SPRINGS );
      this.springsY[ i ] = new Array( MAX_SPRINGS );
    }
    this.createDefaultSprings();

    // @public {Property.<number[]|null>} the indexes of the mass being dragged (an object with and 'i' and a 'j')
    this.draggingMassIndexesProperty = new Property( null, {
      tandem: options.tandem.createTandem( 'draggingMassIndexesProperty' )
    } );

    // unlink is unnecessary, exists for the lifetime of the sim
    this.numberOfMassesProperty.link( this.changedNumberOfMasses.bind( this ) );

    // This is the way the original Flash sim does this.
    // The maximum range will be [0,baseMaxAmplitude] for 1 mass.
    const baseMaxAmplitude = 0.3;
    const maxAmplitudes = new Array( NormalModesConstants.MAX_MASSES_PER_ROW );
    for ( let i = 0; i < maxAmplitudes.length; i++ ) {
      const springLength = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / ( i + 2 );
      maxAmplitudes[ i ] = baseMaxAmplitude * springLength;
    }

    // @public
    this.maxAmplitudeProperty = new DerivedProperty( [ this.numberOfMassesProperty ],
      numberMasses => maxAmplitudes[ numberMasses - 1 ]
    );
  }

  /**
   * Calculates the sine products.
   * @param {number} numberMasses - the current number of visible masses in the simulation
   * @private
   */
  calculateSineProducts( numberMasses ) {
    const N = numberMasses;
    this.sineProduct = [];

    for ( let i = 1; i <= N; ++i ) {
      this.sineProduct[ i ] = [];
      for ( let j = 1; j <= N; ++j ) {
        this.sineProduct[ i ][ j ] = [];

        for ( let r = 1; r <= N; ++r ) {
          this.sineProduct[ i ][ j ][ r ] = [];

          // no need to recalculate this for each 's'
          const sin = Math.sin( j * r * Math.PI / ( N + 1 ) );

          for ( let s = 1; s <= N; ++s ) {
            this.sineProduct[ i ][ j ][ r ][ s ] = sin * Math.sin( i * s * Math.PI / ( N + 1 ) );
          }
        }
      }
    }
  }

  /**
   * Creates MAX_MASSES masses in the correct positions.
   * @param {number} numberMasses - the current number of visible masses in the simulation
   * @private
   */
  changedNumberOfMasses( numberMasses ) {

    let x = NormalModesConstants.LEFT_WALL_X_POS;
    const xStep = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / ( numberMasses + 1 );
    const xFinal = NormalModesConstants.LEFT_WALL_X_POS + NormalModesConstants.DISTANCE_BETWEEN_X_WALLS;

    let y = NormalModesConstants.TOP_WALL_Y_POS;
    const yStep = NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS / ( numberMasses + 1 );
    const yFinal = NormalModesConstants.TOP_WALL_Y_POS - NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS;

    for ( let i = 0; i < MAX_MASSES; i++ ) {
      x = NormalModesConstants.LEFT_WALL_X_POS;
      for ( let j = 0; j < MAX_MASSES; ++j ) {
        const visible = ( i <= numberMasses && j <= numberMasses );

        this.masses[ i ][ j ].equilibriumPositionProperty.set( new Vector2( x, y ) );
        this.masses[ i ][ j ].visibleProperty.set( visible );
        this.masses[ i ][ j ].zeroPosition();

        if ( x < xFinal - xStep / 2 ) {
          x += xStep;
        }

      }
      if ( y > yFinal + yStep / 2 ) {
        y -= yStep;
      }
    }

    this.calculateSineProducts( numberMasses );
    this.resetNormalModes();
  }

  /**
   * Creates MAX_MASSES masses in the correct positions.
   * @param {Tandem} tandem
   * @private
   */
  createDefaultMasses( tandem ) {
    const defaultMassesNumber = this.numberOfMassesProperty.get();

    let x = NormalModesConstants.LEFT_WALL_X_POS;
    const xStep = NormalModesConstants.DISTANCE_BETWEEN_X_WALLS / ( defaultMassesNumber + 1 );
    const xFinal = NormalModesConstants.LEFT_WALL_X_POS + NormalModesConstants.DISTANCE_BETWEEN_X_WALLS;

    let y = NormalModesConstants.TOP_WALL_Y_POS;
    const yStep = NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS / ( defaultMassesNumber + 1 );
    const yFinal = NormalModesConstants.TOP_WALL_Y_POS + NormalModesConstants.DISTANCE_BETWEEN_Y_WALLS;

    for ( let i = 0; i < MAX_MASSES; i++ ) {
      for ( let j = 0; j < MAX_MASSES; ++j ) {

        const visible = ( i <= defaultMassesNumber && j <= defaultMassesNumber );

        // All the masses needed are created at once, and exist for the lifetime of the sim.
        // Use 1-based indexing for the tandem names. See https://github.com/phetsims/normal-modes/issues/55
        this.masses[ i ][ j ] = new Mass(
          new Vector2( x, y ),
          visible,
          tandem.createTandem( `mass[${i + 1},${j + 1}]` )
        );

        if ( x < xFinal - xStep / 2 ) {
          x += xStep;
        }

      }
      if ( y < yFinal - yStep / 2 ) {
        y += yStep;
      }
    }
    this.calculateSineProducts( defaultMassesNumber );
  }

  /**
   * Creates MAX_SPRINGS springs, connecting to the correct masses.
   * @public
   */
  createDefaultSprings() {
    for ( let i = 0; i < MAX_SPRINGS; i++ ) {
      for ( let j = 0; j < MAX_SPRINGS; ++j ) {

        // All the springs needed are created at once, and exist for the lifetime of the sim
        if ( i !== MAX_SPRINGS - 1 ) {
          this.springsX[ i ][ j ] = new Spring( this.masses[ i + 1 ][ j ], this.masses[ i + 1 ][ j + 1 ] );
        }

        if ( j !== MAX_SPRINGS - 1 ) {
          this.springsY[ i ][ j ] = new Spring( this.masses[ i ][ j + 1 ], this.masses[ i + 1 ][ j + 1 ] );
        }
      }
    }
  }

  /**
   * Resets the normal modes' amplitude and phase.
   * @public
   */
  resetNormalModes() {
    for ( let i = 0; i < NormalModesConstants.MAX_MASSES_PER_ROW; i++ ) {
      for ( let j = 0; j < NormalModesConstants.MAX_MASSES_PER_ROW; j++ ) {
        this.modeXAmplitudeProperties[ i ][ j ].reset();
        this.modeYAmplitudeProperties[ i ][ j ].reset();
        this.modeXPhaseProperties[ i ][ j ].reset();
        this.modeYPhaseProperties[ i ][ j ].reset();
      }
    }
  }

  /**
   * Resets the model.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.draggingMassIndexesProperty.reset();
    this.zeroPositions(); // the amplitudes and phases are reset because of zeroPositions
  }

  /**
   * Returns masses to the initial position. The sim is paused and the time is set to 0.
   * @public
   */
  initialPositions() {
    this.playingProperty.set( false );
    this.timeProperty.reset();

    this.setExactPositions();
  }

  /**
   * Zeroes the masses' positions. The sim is not paused.
   * @public
   */
  zeroPositions() {
    for ( let i = 0; i < MAX_MASSES; i++ ) {
      for ( let j = 0; j < MAX_MASSES; j++ ) {
        this.masses[ i ][ j ].zeroPosition();
      }
    }

    this.resetNormalModes();
  }

  /**
   * Steps the model.
   * @param {number} dt - time step, in seconds
   * @public
   */
  step( dt ) {
    // If the time step > 0.15, ignore it - it probably means the user returned to the tab after
    // the tab or the browser was hidden for a while.
    dt = Math.min( dt, 0.15 );

    if ( this.playingProperty.get() ) {
      this.dt += dt;

      while ( this.dt >= NormalModesConstants.FIXED_DT ) {
        this.dt -= NormalModesConstants.FIXED_DT;
        this.singleStep( NormalModesConstants.FIXED_DT );
      }
    }
    else if ( this.draggingMassIndexesProperty.get() === null ) {
      // Even if the sim is paused, changing the amplitude direction or the amplitudes
      // and phases should move the masses

      this.setExactPositions();
    }
  }

  /**
   * Steps the model with a given dt.
   * @param {number} dt - time step, in seconds
   * @public
   */
  singleStep( dt ) {
    dt *= this.timeScaleProperty.get();
    this.timeProperty.set( this.timeProperty.get() + dt );
    if ( this.draggingMassIndexesProperty.get() !== null ) {
      this.setVerletPositions( dt );
    }
    else {
      this.setExactPositions();
    }
  }

  /**
   * Update positions of masses at next time step, using Velocity Verlet algorithm.
   * Needed when user has grabbed mass with mouse, making exact calculation of positions impossible.
   * @param {number} dt - time step, in seconds
   * @private
   */
  setVerletPositions( dt ) {
    const N = this.numberOfMassesProperty.get();
    for ( let i = 1; i <= N; ++i ) {
      for ( let j = 1; j <= N; ++j ) {
        const dragging = this.draggingMassIndexesProperty.get();
        if ( !dragging || dragging.i !== i || dragging.j !== j ) {

          const x = this.masses[ i ][ j ].displacementProperty.get();
          const v = this.masses[ i ][ j ].velocityProperty.get();
          const a = this.masses[ i ][ j ].accelerationProperty.get();

          const displacement = x.plus( v.timesScalar( dt ) ).add( a.timesScalar( dt * dt / 2 ) );
          this.masses[ i ][ j ].displacementProperty.set( displacement );
          this.masses[ i ][ j ].previousAccelerationProperty.set( a );

        }
      }
    }

    this.recalculateVelocityAndAcceleration( dt );

  }

  /**
   * Update velocity and acceleration.
   * @param {number} dt - time step, in seconds
   * @private
   */
  recalculateVelocityAndAcceleration( dt ) {
    const N = this.numberOfMassesProperty.get();
    for ( let i = 1; i <= N; ++i ) {
      for ( let j = 1; j <= N; ++j ) {
        const dragging = this.draggingMassIndexesProperty.get();
        if ( !dragging || dragging.i !== i || dragging.j !== j ) {

          const k = NormalModesConstants.SPRING_CONSTANT_VALUE;
          const m = NormalModesConstants.MASSES_MASS_VALUE;
          const sLeft = this.masses[ i ][ j - 1 ].displacementProperty.get();
          const sAbove = this.masses[ i - 1 ][ j ].displacementProperty.get();
          const s = this.masses[ i ][ j ].displacementProperty.get();
          const sRight = this.masses[ i ][ j + 1 ].displacementProperty.get();
          const sUnder = this.masses[ i + 1 ][ j ].displacementProperty.get();

          this.masses[ i ][ j ].accelerationProperty.set(
            sLeft.plus( sRight ).plus( sAbove ).plus( sUnder ).subtract( s.timesScalar( 4 ) ).multiplyScalar( k / m )
          );

          const v = this.masses[ i ][ j ].velocityProperty.get();
          const a = this.masses[ i ][ j ].accelerationProperty.get();
          const aLast = this.masses[ i ][ j ].previousAccelerationProperty.get();

          this.masses[ i ][ j ].velocityProperty.set( v.plus( a.plus( aLast ).multiplyScalar( dt / 2 ) ) );
        }
        else {
          this.masses[ i ][ j ].accelerationProperty.set( new Vector2( 0, 0 ) );
          this.masses[ i ][ j ].velocityProperty.set( new Vector2( 0, 0 ) );
        }
      }
    }
  }

  /**
   * Update positions of masses at next time step, using exact calculation.
   * Only used if no mass is grabbed by mouse.
   * @private
   */
  setExactPositions() {
    const N = this.numberOfMassesProperty.get();

    // The names of these arrays correspond to the formulas used to compute their values
    const amplitudeXTimesCos = [];
    const amplitudeYTimesCos = [];
    const frequencyTimesAmplitudeXTimesSin = [];
    const frequencyTimesAmplitudeYTimesSin = [];
    const frequencySquaredTimesAmplitudeXTimesCos = [];
    const frequencySquaredTimesAmplitudeYTimesCos = [];

    for ( let r = 1; r <= N; ++r ) {
      amplitudeXTimesCos[ r ] = [];
      amplitudeYTimesCos[ r ] = [];
      frequencyTimesAmplitudeXTimesSin[ r ] = [];
      frequencyTimesAmplitudeYTimesSin[ r ] = [];
      frequencySquaredTimesAmplitudeXTimesCos[ r ] = [];
      frequencySquaredTimesAmplitudeYTimesCos[ r ] = [];

      for ( let s = 1; s <= N; ++s ) {
        const modeAmplitudeX = this.modeXAmplitudeProperties[ r - 1 ][ s - 1 ].get();
        const modeAmplitudeY = this.modeYAmplitudeProperties[ r - 1 ][ s - 1 ].get();
        const modeFrequency = this.modeFrequencyProperties[ r - 1 ][ s - 1 ].get();
        const modePhaseX = this.modeXPhaseProperties[ r - 1 ][ s - 1 ].get();
        const modePhaseY = this.modeYPhaseProperties[ r - 1 ][ s - 1 ].get();

        const frequencyTimesTime = modeFrequency * this.timeProperty.get();
        const frequencyTimesTimeMinusPhaseX = frequencyTimesTime - modePhaseX;
        const frequencyTimesTimeMinusPhaseY = frequencyTimesTime - modePhaseY;

        // both values are used twice, so it's reasonable to calculate them here
        const frequencyTimesTimeMinusPhaseXCos = Math.cos( frequencyTimesTimeMinusPhaseX );
        const frequencyTimesTimeMinusPhaseYCos = Math.cos( frequencyTimesTimeMinusPhaseY );

        amplitudeXTimesCos[ r ][ s ] = modeAmplitudeX * frequencyTimesTimeMinusPhaseXCos;
        amplitudeYTimesCos[ r ][ s ] = modeAmplitudeY * frequencyTimesTimeMinusPhaseYCos;

        frequencyTimesAmplitudeXTimesSin[ r ][ s ] = -modeFrequency * modeAmplitudeX
                                                     * Math.sin( frequencyTimesTimeMinusPhaseX );

        frequencyTimesAmplitudeYTimesSin[ r ][ s ] = -modeFrequency * modeAmplitudeY
                                                     * Math.sin( frequencyTimesTimeMinusPhaseY );

        frequencySquaredTimesAmplitudeXTimesCos[ r ][ s ] = -( modeFrequency ** 2 ) * modeAmplitudeX
                                                            * frequencyTimesTimeMinusPhaseXCos;

        frequencySquaredTimesAmplitudeYTimesCos[ r ][ s ] = -( modeFrequency ** 2 ) * modeAmplitudeY
                                                            * frequencyTimesTimeMinusPhaseYCos;
      }
    }
    for ( let i = 1; i <= N; ++i ) {
      for ( let j = 1; j <= N; ++j ) {
        // for each mass

        const displacement = new Vector2( 0, 0 );
        const velocity = new Vector2( 0, 0 );
        const acceleration = new Vector2( 0, 0 );

        const sineProductMatrix = this.sineProduct[ i ][ j ];
        for ( let r = 1; r <= N; ++r ) {
          const sineProductArray = sineProductMatrix[ r ];
          for ( let s = 1; s <= N; ++s ) {
            // for each mode

            const sineProduct = sineProductArray[ s ];

            displacement.x += sineProduct * amplitudeXTimesCos[ r ][ s ];
            displacement.y -= sineProduct * amplitudeYTimesCos[ r ][ s ];

            velocity.x += sineProduct * frequencyTimesAmplitudeXTimesSin[ r ][ s ];
            velocity.y -= sineProduct * frequencyTimesAmplitudeYTimesSin[ r ][ s ];

            acceleration.x += sineProduct * frequencySquaredTimesAmplitudeXTimesCos[ r ][ s ];
            acceleration.y -= sineProduct * frequencySquaredTimesAmplitudeYTimesCos[ r ][ s ];
          }
        }

        this.masses[ i ][ j ].displacementProperty.set( displacement );
        this.masses[ i ][ j ].velocityProperty.set( velocity );
        this.masses[ i ][ j ].accelerationProperty.set( acceleration );

      }
    }
  }

  /**
   * Compute mode amplitudes and phases based on current masses displacement and velocity.
   * @private
   */
  computeModeAmplitudesAndPhases() {
    this.timeProperty.reset();
    const N = this.numberOfMassesProperty.get();
    for ( let r = 1; r <= N; ++r ) {
      for ( let s = 1; s <= N; ++s ) {
        // for each mode

        let AmplitudeTimesCosPhaseX = 0;
        let AmplitudeTimesSinPhaseX = 0;
        let AmplitudeTimesCosPhaseY = 0;
        let AmplitudeTimesSinPhaseY = 0;
        for ( let i = 1; i <= N; ++i ) {
          for ( let j = 1; j <= N; ++j ) {
            // for each mass

            const massDisplacement = this.masses[ i ][ j ].displacementProperty.get();
            const massVelocity = this.masses[ i ][ j ].velocityProperty.get();
            const modeFrequency = this.modeFrequencyProperties[ r - 1 ][ s - 1 ].get();
            const constantTimesSineProduct = ( 4 / ( ( N + 1 ) * ( N + 1 ) ) ) * this.sineProduct[ i ][ j ][ r ][ s ];

            AmplitudeTimesCosPhaseX += constantTimesSineProduct * massDisplacement.x;
            AmplitudeTimesCosPhaseY -= constantTimesSineProduct * massDisplacement.y;
            AmplitudeTimesSinPhaseX += ( constantTimesSineProduct / modeFrequency ) * massVelocity.x;
            AmplitudeTimesSinPhaseY -= ( constantTimesSineProduct / modeFrequency ) * massVelocity.y;
          }

        }
        this.modeXAmplitudeProperties[ r - 1 ][ s - 1 ].set(
          Math.sqrt( AmplitudeTimesCosPhaseX ** 2 + AmplitudeTimesSinPhaseX ** 2 )
        );
        this.modeYAmplitudeProperties[ r - 1 ][ s - 1 ].set(
          Math.sqrt( AmplitudeTimesCosPhaseY ** 2 + AmplitudeTimesSinPhaseY ** 2 )
        );

        this.modeXPhaseProperties[ r - 1 ][ s - 1 ].set(
          Math.atan2( AmplitudeTimesSinPhaseX, AmplitudeTimesCosPhaseX )
        );
        this.modeYPhaseProperties[ r - 1 ][ s - 1 ].set(
          Math.atan2( AmplitudeTimesSinPhaseY, AmplitudeTimesCosPhaseY )
        );
      }
    }
  }

  /**
   * Gets the indexes for a specified mass. This was moved here from MassNode2D.
   * @param {Mass} mass
   * @returns {{i: number, j: number}}
   * @public
   */
  getMassIndexes( mass ) {
    let foundIndex = -1;
    let foundArray = null;
    for ( let i = 0; i < this.masses.length; i++ ) {
      const array = this.masses[ i ];
      foundIndex = array.indexOf( mass );
      if ( foundIndex !== -1 ) {
        foundArray = array;
        break;
      }
    }
    assert && assert( foundIndex !== -1 );
    return {
      i: this.masses.indexOf( foundArray ),
      j: foundIndex
    };
  }
}

normalModes.register( 'TwoDimensionsModel', TwoDimensionsModel );
export default TwoDimensionsModel;