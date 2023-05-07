// Copyright 2019-2023, University of Colorado Boulder

/**
 * Represents a mass that interacts in the scene, and can potentially float or displace liquid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty, { BooleanPropertyOptions } from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property, { PropertyOptions } from '../../../../axon/js/Property.js';
import Matrix3, { Matrix3StateObject } from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty } from '../../../../scenery/js/imports.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Material from './Material.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import PhysicsEngine, { PhysicsEngineBody } from './PhysicsEngine.js';
import Basin from './Basin.js';
import Ray3 from '../../../../dot/js/Ray3.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { MassShape } from './MassShape.js';
import { BodyStateObject } from './P2Engine.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import ReadOnlyProperty from '../../../../axon/js/ReadOnlyProperty.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';

// constants
export class MassTag extends EnumerationValue {
  public static readonly PRIMARY = new MassTag();
  public static readonly SECONDARY = new MassTag();
  public static readonly NONE = new MassTag();
  public static readonly ONE_A = new MassTag();
  public static readonly ONE_B = new MassTag();
  public static readonly ONE_C = new MassTag();
  public static readonly ONE_D = new MassTag();
  public static readonly ONE_E = new MassTag();
  public static readonly TWO_A = new MassTag();
  public static readonly TWO_B = new MassTag();
  public static readonly TWO_C = new MassTag();
  public static readonly TWO_D = new MassTag();
  public static readonly TWO_E = new MassTag();
  public static readonly THREE_A = new MassTag();
  public static readonly THREE_B = new MassTag();
  public static readonly THREE_C = new MassTag();
  public static readonly THREE_D = new MassTag();
  public static readonly THREE_E = new MassTag();
  public static readonly A = new MassTag();
  public static readonly B = new MassTag();
  public static readonly C = new MassTag();
  public static readonly D = new MassTag();
  public static readonly E = new MassTag();

  public static readonly enumeration = new Enumeration( MassTag, {
    phetioDocumentation: 'Label for a mass'
  } );
}

const blockStringMap = {
  [ MassTag.ONE_A.name ]: DensityBuoyancyCommonStrings.massLabel[ '1aStringProperty' ],
  [ MassTag.ONE_B.name ]: DensityBuoyancyCommonStrings.massLabel[ '1bStringProperty' ],
  [ MassTag.ONE_C.name ]: DensityBuoyancyCommonStrings.massLabel[ '1cStringProperty' ],
  [ MassTag.ONE_D.name ]: DensityBuoyancyCommonStrings.massLabel[ '1dStringProperty' ],
  [ MassTag.ONE_E.name ]: DensityBuoyancyCommonStrings.massLabel[ '1eStringProperty' ],
  [ MassTag.TWO_A.name ]: DensityBuoyancyCommonStrings.massLabel[ '2aStringProperty' ],
  [ MassTag.TWO_B.name ]: DensityBuoyancyCommonStrings.massLabel[ '2bStringProperty' ],
  [ MassTag.TWO_C.name ]: DensityBuoyancyCommonStrings.massLabel[ '2cStringProperty' ],
  [ MassTag.TWO_D.name ]: DensityBuoyancyCommonStrings.massLabel[ '2dStringProperty' ],
  [ MassTag.TWO_E.name ]: DensityBuoyancyCommonStrings.massLabel[ '2eStringProperty' ],
  [ MassTag.THREE_A.name ]: DensityBuoyancyCommonStrings.massLabel[ '3aStringProperty' ],
  [ MassTag.THREE_B.name ]: DensityBuoyancyCommonStrings.massLabel[ '3bStringProperty' ],
  [ MassTag.THREE_C.name ]: DensityBuoyancyCommonStrings.massLabel[ '3cStringProperty' ],
  [ MassTag.THREE_D.name ]: DensityBuoyancyCommonStrings.massLabel[ '3dStringProperty' ],
  [ MassTag.THREE_E.name ]: DensityBuoyancyCommonStrings.massLabel[ '3eStringProperty' ],
  [ MassTag.A.name ]: DensityBuoyancyCommonStrings.massLabel.aStringProperty,
  [ MassTag.B.name ]: DensityBuoyancyCommonStrings.massLabel.bStringProperty,
  [ MassTag.C.name ]: DensityBuoyancyCommonStrings.massLabel.cStringProperty,
  [ MassTag.D.name ]: DensityBuoyancyCommonStrings.massLabel.dStringProperty,
  [ MassTag.E.name ]: DensityBuoyancyCommonStrings.massLabel.eStringProperty
};

class MaterialEnumeration extends EnumerationValue {
  public static readonly ALUMINUM = new MaterialEnumeration();
  public static readonly BRICK = new MaterialEnumeration();
  public static readonly COPPER = new MaterialEnumeration();
  public static readonly ICE = new MaterialEnumeration();
  public static readonly PLATINUM = new MaterialEnumeration();
  public static readonly STEEL = new MaterialEnumeration();
  public static readonly STYROFOAM = new MaterialEnumeration();
  public static readonly WOOD = new MaterialEnumeration();
  public static readonly CUSTOM = new MaterialEnumeration();

  public static readonly enumeration = new Enumeration( MaterialEnumeration, {
    phetioDocumentation: 'Material values'
  } );
}

type GuardedNumberPropertyOptions = NumberPropertyOptions & { getPhetioSpecificValidationError: ( value: number ) => string | null };

class GuardedNumberProperty extends NumberProperty {
  public readonly getPhetioSpecificValidationError: ( number: number ) => string | null;

  public constructor( value: number, options: GuardedNumberPropertyOptions ) {
    super( value, {
      phetioOuterType: () => GuardedNumberPropertyIO,
      ...options
    } );

    this.getPhetioSpecificValidationError = options.getPhetioSpecificValidationError;
  }
}

const GuardedNumberPropertyIO = new IOType( 'GuardedNumberPropertyIO', {
  supertype: NumberProperty.NumberPropertyIO,
  parameterTypes: [ NumberIO ],
  methods: {
    getValidationError: {
      returnType: NullableIO( StringIO ),
      parameterTypes: [ NumberIO ],
      implementation: function( this: GuardedNumberProperty, value: number ) {

        // Fails early on the first error, checking the superclass validation first
        return this.getValidationError( value ) || this.getPhetioSpecificValidationError( value );
      },
      documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
    }
  }
} );

type MaterialNonCustomIdentifier = 'ALUMINUM' | 'BRICK' | 'COPPER' | 'ICE' | 'PLATINUM' | 'STEEL' | 'STYROFOAM' | 'WOOD';
type MaterialIdentifier = MaterialNonCustomIdentifier | 'CUSTOM';

const materialToEnum = ( material: Material ): MaterialEnumeration => MaterialEnumeration[ ( ( material.identifier as MaterialIdentifier | null ) || 'CUSTOM' ) ];

// For the Buoyancy Shapes screen, but needed here because setRatios is included in each core type
// See https://github.com/phetsims/buoyancy/issues/29
export const MASS_MIN_SHAPES_DIMENSION = 0.1; // 10cm => 1L square
export const MASS_MAX_SHAPES_DIMENSION = Math.pow( 0.01, 1 / 3 ); // 10L square

type SelfOptions = {
  // Required
  body: PhysicsEngineBody;
  shape: Shape;
  material: Material;
  volume: number;
  massShape: MassShape;

  visible?: boolean;
  matrix?: Matrix3;
  canRotate?: boolean;
  canMove?: boolean;
  adjustableMaterial?: boolean;
  tag?: MassTag;
  tandem?: Tandem;
  phetioType?: IOType;
  inputEnabledPropertyOptions?: BooleanPropertyOptions;
  materialPropertyOptions?: PropertyOptions<Material>;
  volumePropertyOptions?: NumberPropertyOptions;
  massPropertyOptions?: NumberPropertyOptions;

  minVolume?: number;
  maxVolume?: number;
};

export type MassOptions = SelfOptions & PhetioObjectOptions;
export type InstrumentedMassOptions = MassOptions & PickRequired<MassOptions, 'tandem'>;

export type MassIOStateObject = {
  matrix: Matrix3StateObject;
  stepMatrix: Matrix3StateObject;
  originalMatrix: Matrix3StateObject;
  canRotate: boolean;
  canMove: boolean;
  tag: string;
  massShape: string;
} & BodyStateObject;

export default abstract class Mass extends PhetioObject {

  public readonly engine: PhysicsEngine;
  public readonly body: PhysicsEngineBody;

  public readonly massShape: MassShape;

  // Without the matrix applied (effectively in "local" model coordinates)
  public readonly shapeProperty: Property<Shape>;

  public readonly userControlledProperty: Property<boolean>;
  public readonly inputEnabledProperty: Property<boolean>;
  public readonly visibleProperty: TReadOnlyProperty<boolean>;
  public readonly internalVisibleProperty: Property<boolean>;

  // Here just for instrumentation, see https://github.com/phetsims/density/issues/112
  // This can only hide it, but won't make it visible.
  public readonly studioVisibleProperty: Property<boolean>;

  public readonly materialProperty: Property<Material>;

  // for phet-io support (to control the materialProperty)
  public readonly materialEnumProperty?: Property<MaterialEnumeration>;

  // for phet-io support (to control the materialProperty)
  public readonly customDensityProperty?: Property<number>;

  // for phet-io support (to control the materialProperty)
  public readonly customColorProperty?: Property<Color>;

  // Whether we are modifying the volumeProperty directly
  protected volumeLock: boolean;

  // Whether we are modifying the massProperty directly
  protected massLock: boolean;

  // In m^3 (cubic meters)
  public readonly volumeProperty: NumberProperty;

  // In kg (kilograms), added to the normal mass (computed from density and volume)
  public readonly containedMassProperty: Property<number>;

  // (read-only) In kg (kilograms) - written to by other processes
  public readonly massProperty: Property<number>;

  // The following offset will be added onto the body's position to determine ours.
  public readonly bodyOffsetProperty: Property<Vector2>;

  public readonly gravityForceInterpolatedProperty: InterpolatedProperty<Vector2>;
  public readonly buoyancyForceInterpolatedProperty: InterpolatedProperty<Vector2>;
  public readonly contactForceInterpolatedProperty: InterpolatedProperty<Vector2>;

  public readonly forceOffsetProperty: Property<Vector3>;

  // The 3D offset from the center-of-mass where the mass-label should be shown from.
  // The mass label will use this position (plus the masses' position) to determine a view point, then will use the
  // massOffsetOrientationProperty to position based on that point.
  public readonly massOffsetProperty: Property<Vector3>;

  // Orientation multiplied by 1/2 width,height for an offset in view space
  public readonly massOffsetOrientationProperty: Property<Vector2>;

  // Transform matrix set before/after the physics engine steps, to be used to adjust/read the mass's position/transform.
  public readonly matrix: Matrix3;

  // Transform matrix set in the internal physics engine steps, used by masses to determine their per-step information.
  public readonly stepMatrix: Matrix3;

  public readonly transformedEmitter: TEmitter;

  // Fired when this mass's input (drag) should be interrupted.
  public readonly interruptedEmitter: TEmitter;

  public canRotate: boolean;
  public canMove: boolean;
  public tag: MassTag;

  public readonly nameProperty: TReadOnlyProperty<string>;

  // Set by the model
  public containingBasin: Basin | null;

  public originalMatrix: Matrix3;

  // Required internal-physics-step properties that should be set by subtypes in
  // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
  // calculations). These are updated more often than simulation steps. These specific values will be used by external
  // code for determining liquid height.
  public stepX: number; // x-value of the position
  public stepBottom: number; // minimum y value of the mass
  public stepTop: number; // maximum y value of the mass

  protected constructor( engine: PhysicsEngine, providedConfig: MassOptions ) {

    const config = optionize<MassOptions, SelfOptions, PhetioObjectOptions>()( {
      visible: true,
      matrix: new Matrix3(),
      canRotate: false,
      canMove: true,
      adjustableMaterial: false,
      tag: MassTag.NONE,
      tandem: Tandem.OPTIONAL,
      phetioType: Mass.MassIO,
      inputEnabledPropertyOptions: {},
      materialPropertyOptions: {},
      volumePropertyOptions: {},
      massPropertyOptions: {},

      minVolume: 0,
      maxVolume: Number.POSITIVE_INFINITY
    }, providedConfig );

    assert && assert( config.body, 'config.body required' );
    assert && assert( config.shape instanceof Shape, 'config.shape required as a Shape' );
    assert && assert( config.material instanceof Material, 'config.material required as a Material' );
    assert && assert( config.volume > 0, 'non-zero config.volume required' );

    super( config );

    const tandem = config.tandem;

    this.engine = engine;
    this.body = config.body;
    this.massShape = config.massShape;

    this.shapeProperty = new Property( config.shape, {
      valueType: Shape
    } );

    this.userControlledProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'userControlledProperty' ),
      phetioReadOnly: true
    } );

    this.inputEnabledProperty = new BooleanProperty( true, combineOptions<BooleanPropertyOptions>( {
      tandem: tandem.createTandem( 'inputEnabledProperty' ),
      phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive'
    }, config.inputEnabledPropertyOptions ) );

    this.internalVisibleProperty = new BooleanProperty( config.visible, {
      tandem: Tandem.OPT_OUT
    } );

    this.studioVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'visibleProperty' )
    } );

    this.visibleProperty = DerivedProperty.and( [ this.internalVisibleProperty, this.studioVisibleProperty ], {
      tandem: Tandem.OPT_OUT
    } );

    this.materialProperty = new Property( config.material, combineOptions<PropertyOptions<Material>>( {
      valueType: Material,
      reentrant: true,
      tandem: tandem.createTandem( 'materialProperty' ),
      phetioValueType: Material.MaterialIO
    }, config.materialPropertyOptions ) );

    if ( config.adjustableMaterial ) {
      this.materialEnumProperty = new EnumerationProperty( materialToEnum( config.material ), {
        tandem: tandem.createTandem( 'materialEnumProperty' ),
        phetioDocumentation: 'Current material of the block. Changing the material will result in changes to the mass, but the volume will remain the same.'
      } );
      this.customDensityProperty = new NumberProperty( config.material.density, {
        tandem: tandem.createTandem( 'customDensityProperty' ),
        phetioDocumentation: 'Density of the block when the material is set to “CUSTOM”.',
        range: new Range( 150, 23000 ),
        units: 'kg/m^3'
      } );
      this.customColorProperty = new ColorProperty( config.material.customColor ? config.material.customColor.value : Color.WHITE, {
        tandem: tandem.createTandem( 'customColorProperty' )
      } );

      this.materialProperty.addPhetioStateDependencies( [ this.materialEnumProperty, this.customDensityProperty, this.customColorProperty ] );

      // Hook up phet-io Properties for interoperation with the normal ones
      let enumLock = false;
      let densityLock = false;
      let colorLock = false;
      const colorListener = ( color: Color ) => {
        if ( !colorLock ) {
          colorLock = true;
          this.customColorProperty!.value = color;
          colorLock = false;
        }
      };
      this.materialProperty.link( ( material, oldMaterial ) => {
        if ( !enumLock ) {
          enumLock = true;
          this.materialEnumProperty!.value = materialToEnum( material );
          enumLock = false;
        }
        if ( !densityLock ) {
          densityLock = true;
          this.customDensityProperty!.value = material.density;
          densityLock = false;
        }
        if ( oldMaterial && oldMaterial.customColor ) {
          oldMaterial.customColor.unlink( colorListener );
        }
        if ( material && material.customColor ) {
          material.customColor.link( colorListener );
        }
      } );
      Multilink.lazyMultilink( [ this.materialEnumProperty, this.customDensityProperty, this.customColorProperty ], ( materialEnum, density, color ) => {
        // See if it's an external change
        if ( !enumLock && !densityLock && !colorLock ) {
          enumLock = true;
          densityLock = true;
          colorLock = true;
          if ( materialEnum === MaterialEnumeration.CUSTOM ) {
            this.materialProperty.value = Material.createCustomSolidMaterial( {
              density: this.customDensityProperty!.value,
              customColor: this.customColorProperty
            } );
          }
          else {
            this.materialProperty.value = Material[ materialEnum.name as MaterialNonCustomIdentifier ];
          }
          enumLock = false;
          densityLock = false;
          colorLock = false;
        }
      } );
    }

    this.volumeLock = false;

    this.volumeProperty = new NumberProperty( config.volume, combineOptions<NumberPropertyOptions>( {
      tandem: tandem.createTandem( 'volumeProperty' ),
      range: new Range( config.minVolume, config.maxVolume ),
      phetioReadOnly: true,
      phetioDocumentation: 'Current volume of the block. Changing the volume will result in changes to the mass, but will not change the material or density.',
      units: 'm^3',
      reentrant: true
    }, config.volumePropertyOptions ) );

    this.containedMassProperty = new NumberProperty( 0, {
      range: new Range( 0, Number.POSITIVE_INFINITY ),
      tandem: Tandem.OPT_OUT
    } );

    this.massLock = false;

    this.massProperty = new GuardedNumberProperty( this.materialProperty.value.density * this.volumeProperty.value + this.containedMassProperty.value, combineOptions<GuardedNumberPropertyOptions>( {
      tandem: tandem.createTandem( 'massProperty' ),
      phetioReadOnly: true,
      phetioState: false,
      phetioDocumentation: 'Current mass of the block. Changing the mass will result in changes to the volume (Intro and ' +
                           'Mystery Screens) or density (Compare Screen). Since the volume is computed as a function of ' +
                           'the mass, you can only set a mass that will keep the volume in range.',
      units: 'kg',
      reentrant: true,
      range: new Range( Number.MIN_VALUE, Number.POSITIVE_INFINITY ),

      getPhetioSpecificValidationError: proposedMass => {

        // density = mass/ volume
        const proposedVolume = proposedMass / this.materialProperty.value.density;
        const isProposedVolumeInRange = this.volumeProperty.range.contains( proposedVolume );

        const maxAllowedMass = this.materialProperty.value.density * this.volumeProperty.range.max;
        const minAllowedMass = this.materialProperty.value.density * this.volumeProperty.range.min;

        return isProposedVolumeInRange ? null :
               `The proposed mass ${proposedMass} kg would result in a volume ${proposedVolume} m^3 that is out of range. At the current density, the allowed range is [${minAllowedMass}, ${maxAllowedMass}] kg.`;
      }
    }, config.massPropertyOptions ) );

    Multilink.multilink( [ this.materialProperty, this.volumeProperty, this.containedMassProperty ], ( material, volume, containedMass ) => {
      this.massLock = true;
      this.massProperty.value = material.density * volume + containedMass;
      this.massLock = false;
    } );

    this.bodyOffsetProperty = new Vector2Property( Vector2.ZERO, {
      tandem: Tandem.OPT_OUT
    } );

    this.gravityForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'gravityForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.buoyancyForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'buoyancyForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.contactForceInterpolatedProperty = new InterpolatedProperty( Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'contactForceInterpolatedProperty' ),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    } );

    this.forceOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    } );

    this.massOffsetProperty = new Property( Vector3.ZERO, {
      valueType: Vector3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    } );

    this.massOffsetOrientationProperty = new Vector2Property( Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    } );

    this.matrix = config.matrix;
    this.stepMatrix = new Matrix3();

    this.transformedEmitter = new Emitter();
    this.interruptedEmitter = new Emitter();

    this.canRotate = config.canRotate;
    this.canMove = config.canMove;
    this.tag = config.tag;

    this.nameProperty = blockStringMap[ config.tag.name ] || new TinyProperty( '' );
    if ( blockStringMap[ config.tag.name ] ) {
      this.addLinkedElement( this.nameProperty as ReadOnlyProperty<string>, {
        tandem: config.tandem.createTandem( 'nameProperty' )
      } );
    }

    this.containingBasin = null;

    this.originalMatrix = this.matrix.copy();

    Multilink.multilink( [
      this.shapeProperty,
      this.massProperty
    ], () => {
      // Don't allow a fully-zero value for the physics engines
      engine.bodySetMass( this.body, Math.max( this.massProperty.value, 0.01 ), {
        canRotate: config.canRotate
      } );
    } );

    this.writeData();
    this.engine.bodySynchronizePrevious( this.body );

    // (read-only) {number} - Required internal-physics-step properties that should be set by subtypes in
    // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
    // calculations). These are updated more often than simulation steps. These specific values will be used by external
    // code for determining liquid height.
    this.stepX = 0; // x-value of the position
    this.stepBottom = 0; // minimum y value of the mass
    this.stepTop = 0; // maxmimum y value of the mass
  }

  /**
   * Returns whether this is a boat (as more complicated handling is needed in this case).
   */
  public isBoat(): boolean {
    return false;
  }

  /**
   * Returns the cross-sectional area of this object at a given y level.
   */
  public abstract getDisplacedArea( liquidLevel: number ): number;

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   */
  public abstract getDisplacedVolume( liquidLevel: number ): number;

  /**
   * Sets the current location to be the proper position for the mass when it is reset.
   */
  public setResetLocation(): void {
    this.originalMatrix = this.matrix.copy();
  }

  /**
   * Reads transform/velocity from the physics model engine.
   */
  private readData(): void {
    this.engine.bodyGetMatrixTransform( this.body, this.matrix );

    // Apply the body offset
    this.matrix.set02( this.matrix.m02() + this.bodyOffsetProperty.value.x );
    this.matrix.set12( this.matrix.m12() + this.bodyOffsetProperty.value.y );

    this.transformedEmitter.emit();
  }

  /**
   * Writes position/velocity/etc. to the physics model engine.
   */
  public writeData(): void {
    this.engine.bodySetPosition( this.body, this.matrix.translation.minus( this.bodyOffsetProperty.value ) );
    this.engine.bodySetRotation( this.body, this.matrix.rotation );
  }

  /**
   * Starts a physics model engine drag at the given 2d (x,y) model position.
   */
  public startDrag( position: Vector2 ): void {
    this.userControlledProperty.value = true;
    this.engine.addPointerConstraint( this.body, position );
  }

  /**
   * Updates a current drag with a new 2d (x,y) model position.
   */
  public updateDrag( position: Vector2 ): void {
    this.engine.updatePointerConstraint( this.body, position );
  }

  /**
   * Ends a physics model engine drag.
   */
  public endDrag(): void {
    this.engine.removePointerConstraint( this.body );
    this.userControlledProperty.value = false;
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  public abstract setRatios( widthRatio: number, heightRatio: number ): void;

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop (as those are
   * used for determining basin volumes and cross sections)
   */
  public updateStepInformation(): void {
    this.engine.bodyGetStepMatrixTransform( this.body, this.stepMatrix );

    // Apply the body offset
    this.stepMatrix.set02( this.stepMatrix.m02() + this.bodyOffsetProperty.value.x );
    this.stepMatrix.set12( this.stepMatrix.m12() + this.bodyOffsetProperty.value.y );
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  public intersect( ray: Ray3, isTouch: boolean ): number | null {
    // TODO: should this be abstract
    return null;
  }

  /**
   * Steps forward in time.
   *
   * @param dt - In seconds
   * @param interpolationRatio
   */
  public step( dt: number, interpolationRatio: number ): void {
    this.readData();

    this.transformedEmitter.emit();

    this.contactForceInterpolatedProperty.setRatio( interpolationRatio );
    this.buoyancyForceInterpolatedProperty.setRatio( interpolationRatio );
    this.gravityForceInterpolatedProperty.setRatio( interpolationRatio );
  }

  /**
   * Moves the mass to its initial position
   */
  public resetPosition(): void {
    this.matrix.set( this.originalMatrix );
    this.writeData();
    this.engine.bodySynchronizePrevious( this.body );
    this.transformedEmitter.emit();
  }

  /**
   * Resets things to their original values.
   */
  public reset(): void {
    this.engine.bodyResetHidden( this.body );

    this.internalVisibleProperty.reset();
    this.shapeProperty.reset();
    this.materialProperty.reset();
    this.volumeProperty.reset();
    this.containedMassProperty.reset();
    this.userControlledProperty.reset();

    this.gravityForceInterpolatedProperty.reset();
    this.buoyancyForceInterpolatedProperty.reset();
    this.contactForceInterpolatedProperty.reset();

    // NOTE: NOT resetting bodyOffsetProperty/forceOffsetProperty/massOffsetProperty/massOffsetOrientationProperty on
    // purpose, it will be adjusted by subtypes whenever necessary, and a reset may break things here.

    this.resetPosition();
  }

  /**
   * Releases references
   */
  public override dispose(): void {

    assert && assert( !this.isDisposed );

    this.userControlledProperty.dispose();
    this.inputEnabledProperty.dispose();
    this.studioVisibleProperty.dispose();
    this.materialProperty.dispose();
    this.volumeProperty.dispose();
    this.massProperty.dispose();
    this.nameProperty.dispose();
    this.gravityForceInterpolatedProperty.dispose();
    this.buoyancyForceInterpolatedProperty.dispose();
    this.contactForceInterpolatedProperty.dispose();

    super.dispose();
  }

  /**
   * Given a list of values and a ratio from 0 (the start) to 1 (the end), return an interpolated value.
   */
  public static evaluatePiecewiseLinear( values: number[], ratio: number ): number {
    const logicalIndex = ratio * ( values.length - 1 );
    if ( logicalIndex % 1 === 0 ) {
      return values[ logicalIndex ];
    }
    else {
      const a = values[ Math.floor( logicalIndex ) ];
      const b = values[ Math.ceil( logicalIndex ) ];
      return Utils.linear( Math.floor( logicalIndex ), Math.ceil( logicalIndex ), a, b, logicalIndex );
    }
  }

  public static readonly MassIO = new IOType<Mass, MassIOStateObject>( 'MassIO', {
    valueType: Mass,
    documentation: 'Represents a mass that interacts in the scene, and can potentially float or displace liquid.',
    stateSchema: {
      matrix: Matrix3.Matrix3IO,
      stepMatrix: Matrix3.Matrix3IO,
      originalMatrix: Matrix3.Matrix3IO,
      canRotate: BooleanIO,
      canMove: BooleanIO,
      tag: EnumerationIO( MassTag ),
      massShape: EnumerationIO( MassShape ),

      // engine.bodyToStateObject
      position: Vector2.Vector2IO,
      velocity: Vector2.Vector2IO,
      force: Vector2.Vector2IO
    },
    toStateObject( mass: Mass ): MassIOStateObject {
      return combineOptions<MassIOStateObject>( {
        matrix: Matrix3.toStateObject( mass.matrix ),
        stepMatrix: Matrix3.toStateObject( mass.stepMatrix ),
        originalMatrix: Matrix3.toStateObject( mass.originalMatrix ),
        canRotate: mass.canRotate,
        canMove: mass.canMove,
        tag: EnumerationIO( MassTag ).toStateObject( mass.tag ),
        massShape: EnumerationIO( MassShape ).toStateObject( mass.massShape )
      }, mass.engine.bodyToStateObject( mass.body ) );
    },
    applyState( mass: Mass, obj: MassIOStateObject ) {
      mass.matrix.set( Matrix3.fromStateObject( obj.matrix ) );
      mass.stepMatrix.set( Matrix3.fromStateObject( obj.stepMatrix ) );
      mass.originalMatrix.set( Matrix3.fromStateObject( obj.originalMatrix ) );
      mass.canRotate = obj.canRotate;
      mass.canMove = obj.canMove;
      mass.tag = EnumerationIO( MassTag ).fromStateObject( obj.tag );
      mass.engine.bodyApplyState( mass.body, obj );
      mass.transformedEmitter.emit();
    },
    stateObjectToCreateElementArguments: ( stateObject: MassIOStateObject ) => [ EnumerationIO( MassShape ).fromStateObject( stateObject.massShape ) ]
  } );
}

densityBuoyancyCommon.register( 'Mass', Mass );
