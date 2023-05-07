// Copyright 2023, University of Colorado Boulder

/**
 * Main model for My Solar System.
 * In charge of keeping track of the position and states of the bodies,
 * their center of mass, and the time.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Tandem from '../../../tandem/js/Tandem.js';
import solarSystemCommon from '../solarSystemCommon.js';
import Body from './Body.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import TimeSpeed from '../../../scenery-phet/js/TimeSpeed.js';
import createObservableArray, { ObservableArray } from '../../../axon/js/createObservableArray.js';
import Engine from './Engine.js';
import Range from '../../../dot/js/Range.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import SolarSystemCommonColors from '../SolarSystemCommonColors.js';
import Multilink from '../../../axon/js/Multilink.js';
import SolarSystemCommonConstants from '../SolarSystemCommonConstants.js';
import Emitter from '../../../axon/js/Emitter.js';
import LabMode from './LabMode.js';
import optionize from '../../../phet-core/js/optionize.js';
import TinyEmitter from '../../../axon/js/TinyEmitter.js';

const timeFormatter = new Map<TimeSpeed, number>( [
  [ TimeSpeed.FAST, 7 / 4 ],
  [ TimeSpeed.NORMAL, 1 ],
  [ TimeSpeed.SLOW, 1 / 4 ]
] );

type SelfOptions<EngineType extends Engine> = {
  engineFactory: ( bodies: ObservableArray<Body> ) => EngineType;
  isLab: boolean;
  tandem: Tandem;
  timeScale?: number;
  timeMultiplier?: number;
};

export type BodyInfo = {
  mass: number;
  position: Vector2;
  velocity: Vector2;
  active: boolean;
};

export type CommonModelOptions<EngineType extends Engine> = SelfOptions<EngineType>;

export default abstract class SolarSystemCommonModel<EngineType extends Engine = Engine> {

  // Bodies will consist of all bodies from availableBodies that have isActiveProperty.value === true, and will be in
  // order.
  public readonly bodies: ObservableArray<Body> = createObservableArray();
  public readonly availableBodies: Body[];
  public readonly userControlledProperty = new BooleanProperty( false );

  public numberOfActiveBodiesProperty: NumberProperty;
  public engine: EngineType;

  public readonly userInteractingEmitter = new Emitter();

  // Time control parameters
  public timeScale: number; // Scale of the model's dt
  public timeMultiplier: number; // Transform between model's and view's times
  public readonly timeProperty: NumberProperty;
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;
  public readonly hasPlayedProperty = new BooleanProperty( false );

  public readonly pathVisibleProperty: BooleanProperty;
  public readonly gravityVisibleProperty: BooleanProperty;
  public readonly velocityVisibleProperty: BooleanProperty;
  public readonly gridVisibleProperty: BooleanProperty;
  public readonly measuringTapeVisibleProperty: BooleanProperty;
  public readonly valuesVisibleProperty: BooleanProperty;
  public readonly moreDataProperty: BooleanProperty;
  public readonly realUnitsProperty: BooleanProperty;

  public readonly zoomLevelProperty: NumberProperty;
  public readonly zoomProperty: ReadOnlyProperty<number>;
  public readonly isLab: boolean;
  public readonly labModeProperty: EnumerationProperty<LabMode>;

  public readonly bodyAddedEmitter: TinyEmitter = new TinyEmitter();
  public readonly bodyRemovedEmitter: TinyEmitter = new TinyEmitter();

  // Indicates if any body is far from the play area
  public readonly isAnyBodyEscapedProperty: ReadOnlyProperty<boolean>;
  public readonly isAnyBodyCollidedProperty = new BooleanProperty( false );

  // Indicates if any force arrow is currently off scale
  public readonly forceScaleProperty: NumberProperty; // Power of 10 to which the force is scaled
  public readonly isAnyForceOffscaleProperty: ReadOnlyProperty<boolean>;

  // Define the mode bodies will go to when restarted. Is updated when the user changes a body.
  private startingBodyState: BodyInfo[] = [
    { active: true, mass: 250, position: new Vector2( 0, 0 ), velocity: new Vector2( 0, -11.1 ) },
    { active: true, mass: 25, position: new Vector2( 200, 0 ), velocity: new Vector2( 0, 111 ) }
  ];
  protected defaultBodyState: BodyInfo[];

  protected constructor( providedOptions: CommonModelOptions<EngineType> ) {

    const options = optionize<CommonModelOptions<EngineType>, SelfOptions<EngineType>>()( {
      timeScale: 1,
      timeMultiplier: SolarSystemCommonConstants.TIME_MULTIPLIER
    }, providedOptions );

    const tandem = options.tandem;

    this.isLab = options.isLab;
    this.labModeProperty = new EnumerationProperty( LabMode.SUN_PLANET, {
      tandem: tandem.createTandem( 'labModeProperty' )
    } );

    this.availableBodies = [
      new Body( 0, 250, new Vector2( 0, 0 ), new Vector2( 0, -11.1 ), this.userControlledProperty, SolarSystemCommonColors.firstBodyColorProperty ),
      new Body( 1, 25, new Vector2( 200, 0 ), new Vector2( 0, 111 ), this.userControlledProperty, SolarSystemCommonColors.secondBodyColorProperty ),
      new Body( 2, 0.1, new Vector2( 100, 0 ), new Vector2( 0, 150 ), this.userControlledProperty, SolarSystemCommonColors.thirdBodyColorProperty ),
      new Body( 3, 0.1, new Vector2( -100, -100 ), new Vector2( 120, 0 ), this.userControlledProperty, SolarSystemCommonColors.fourthBodyColorProperty )
    ];

    // Activate the first two bodies by default
    this.availableBodies[ 0 ].isActiveProperty.value = true;
    this.availableBodies[ 1 ].isActiveProperty.value = true;

    // Define the default mode the bodies will show up in
    this.defaultBodyState = this.availableBodies.map( body => body.info );

    // We want to synchronize availableBodies and bodies, so that bodies is effectively availableBodies.filter( isActive )
    // Order matters, AND we don't want to remove items unnecessarily, so some additional logic is required.
    Multilink.multilinkAny( this.availableBodies.map( body => body.isActiveProperty ), () => {
      const idealBodies = this.availableBodies.filter( body => body.isActiveProperty.value );

      // Remove all inactive bodies
      this.bodies.filter( body => !body.isActiveProperty.value ).forEach( body => {
        this.bodies.remove( body );
        body.reset();
      } );

      // Add in active bodies (in order)
      for ( let i = 0; i < idealBodies.length; i++ ) {
        if ( this.bodies[ i ] !== idealBodies[ i ] ) {
          this.bodies.splice( i, 0, idealBodies[ i ] );
        }
      }
    } );

    this.isAnyBodyEscapedProperty = DerivedProperty.or( [ ...this.availableBodies.map( body => body.escapedProperty ), this.isAnyBodyCollidedProperty ] );

    this.isAnyForceOffscaleProperty = DerivedProperty.or( this.availableBodies.map( body => body.forceOffscaleProperty ) );

    this.availableBodies.forEach( body => {
      body.collidedEmitter.addListener( () => {
        this.isAnyBodyCollidedProperty.value = true;
      } );

      Multilink.lazyMultilink(
        [ body.userControlledPositionProperty, body.userControlledVelocityProperty, body.userControlledMassProperty ],
        ( userControlledPosition: boolean, userControlledVelocity: boolean, userControlledMass: boolean ) => {
          if ( userControlledPosition || userControlledVelocity ) {
            this.isPlayingProperty.value = false;
          }
          if ( !this.isAnyBodyEscapedProperty.value ) {
            this.saveStartingBodyState();
          }
          this.userInteractingEmitter.emit();
          this.userControlledProperty.value = true;
        }
      );
    } );

    this.loadBodyStates( this.startingBodyState );
    this.numberOfActiveBodiesProperty = new NumberProperty( this.bodies.length );
    this.engine = options.engineFactory( this.bodies );
    this.engine.reset();


    // Time settings
    // timeScale controls the velocity of time
    this.timeScale = options.timeScale;
    this.timeMultiplier = options.timeMultiplier;
    this.timeProperty = new NumberProperty( 0 );
    this.isPlayingProperty = new BooleanProperty( false );
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL );

    // Visibility properties for checkboxes
    this.pathVisibleProperty = new BooleanProperty( true, { tandem: tandem.createTandem( 'pathVisibleProperty' ) } );
    this.gravityVisibleProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'gravityVisibleProperty' ) } );
    this.velocityVisibleProperty = new BooleanProperty( true, { tandem: tandem.createTandem( 'velocityVisibleProperty' ) } );
    this.gridVisibleProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'gridVisibleProperty' ) } );
    this.measuringTapeVisibleProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'measuringTapeVisibleProperty' ) } );
    this.valuesVisibleProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'valuesVisibleProperty' ) } );
    this.moreDataProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'moreDataProperty' ) } );
    this.realUnitsProperty = new BooleanProperty( false, { tandem: tandem.createTandem( 'realUnitsProperty' ) } );


    this.forceScaleProperty = new NumberProperty( 0, {
      range: new Range( -2, 8 )
    } );
    this.zoomLevelProperty = new NumberProperty( 4, {
      range: new Range( 1, 6 ),
      tandem: tandem.createTandem( 'zoomLevelProperty' ),
      numberType: 'Integer'
    } );
    this.zoomProperty = new DerivedProperty( [ this.zoomLevelProperty ], zoomLevel => {
      return Utils.linear( 1, 6, 0.25, 1.25, zoomLevel );
    } );

    this.pathVisibleProperty.link( visible => {
      this.clearPaths();
    } );
  }

  public saveStartingBodyState(): void {
    this.startingBodyState = this.availableBodies.map( body => body.info );
  }

  /**
   * Sets the available bodies initial states according to bodiesInfo
   */
  public loadBodyStates( bodiesInfo: BodyInfo[], preventCollision = false ): void {
    for ( let i = 0; i < SolarSystemCommonConstants.NUM_BODIES; i++ ) {
      const bodyInfo = bodiesInfo[ i ];

      if ( bodyInfo ) {
        this.availableBodies[ i ].isActiveProperty.value = bodyInfo.active;

        // Setting initial values and then resetting the body to make sure the body is in the correct state
        this.availableBodies[ i ].massProperty.setInitialValue( bodyInfo.mass );
        this.availableBodies[ i ].positionProperty.setInitialValue( bodyInfo.position );
        this.availableBodies[ i ].velocityProperty.setInitialValue( bodyInfo.velocity );
        this.availableBodies[ i ].reset();
        if ( preventCollision ) {
          this.availableBodies[ i ].preventCollision( this.bodies );
        }
      }
      else {
        this.availableBodies[ i ].isActiveProperty.value = false;
      }
    }

    this.saveStartingBodyState();
  }

  /**
   * Adds the next available body to the system and checks that is doesn't collide with any other bodies.
   */
  public addNextBody(): void {
    const newBody = this.availableBodies.find( body => !body.isActiveProperty.value );
    if ( newBody ) {
      newBody.reset();
      newBody.preventCollision( this.bodies );
      newBody.isActiveProperty.value = true;
    }
    this.saveStartingBodyState();

    this.bodyAddedEmitter.emit();
    this.isAnyBodyCollidedProperty.reset();
  }

  public removeLastBody(): void {
    const numberOfActiveBodies = this.bodies.length - 1;
    const lastBody = this.bodies[ numberOfActiveBodies ];
    lastBody.isActiveProperty.value = false;
    this.saveStartingBodyState();

    this.bodyRemovedEmitter.emit();
    this.isAnyBodyCollidedProperty.reset();
  }

  public reset(): void {
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeSpeedProperty.reset();
    this.zoomLevelProperty.reset();
    this.pathVisibleProperty.reset();
    this.gravityVisibleProperty.reset();
    this.velocityVisibleProperty.reset();
    this.gridVisibleProperty.reset();
    this.measuringTapeVisibleProperty.reset();
    this.valuesVisibleProperty.reset();
    this.moreDataProperty.reset();
    this.realUnitsProperty.reset();
    this.userControlledProperty.reset();
    this.forceScaleProperty.reset();

    this.startingBodyState = this.defaultBodyState;

    this.restart();
  }

  // Restart is for when the time controls are brought back to 0
  // Bodies move to their last modified position
  public restart(): void {
    this.isAnyBodyCollidedProperty.reset();
    this.hasPlayedProperty.value = false;
    this.isPlayingProperty.value = false; // Pause the sim
    this.timeProperty.reset(); // Reset the time
    this.loadBodyStates( this.startingBodyState ); // Reset the bodies
    this.update();
  }

  /**
   * Updating for when the bodies are changed
   */
  public update(): void {
    this.engine.update( this.bodies );
    this.numberOfActiveBodiesProperty.value = this.bodies.length;
  }

  public stepOnce( dt: number ): void {
    this.hasPlayedProperty.value = true;
    let adjustedDT = dt * timeFormatter.get( this.timeSpeedProperty.value )! * this.timeScale;
    const count = Math.ceil( adjustedDT / 0.02 );
    adjustedDT /= count;

    for ( let i = 0; i < count; i++ ) {
      // Only modify the properties on the last step
      const updateProperties = i === count - 1;
      this.engine.run( adjustedDT, updateProperties );
      this.engine.checkCollisions();
      this.timeProperty.value += adjustedDT * this.timeMultiplier;
      if ( this.pathVisibleProperty ) {
        this.bodies.forEach( body => body.addPathPoint() );
      }
    }
  }

  public step( dt: number ): void {
    this.update();

    if ( this.isPlayingProperty.value ) {
      this.stepOnce( dt );
    }
  }

  public clearPaths(): void {
    this.bodies.forEach( body => {
      body.clearPath();
    } );
  }
}

solarSystemCommon.register( 'SolarSystemCommonModel', SolarSystemCommonModel );