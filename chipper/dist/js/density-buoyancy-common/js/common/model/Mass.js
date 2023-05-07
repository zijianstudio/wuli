// Copyright 2019-2023, University of Colorado Boulder

/**
 * Represents a mass that interacts in the scene, and can potentially float or displace liquid.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import { Color, ColorProperty } from '../../../../scenery/js/imports.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import InterpolatedProperty from './InterpolatedProperty.js';
import Material from './Material.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { MassShape } from './MassShape.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import StringIO from '../../../../tandem/js/types/StringIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';

// constants
export class MassTag extends EnumerationValue {
  static PRIMARY = new MassTag();
  static SECONDARY = new MassTag();
  static NONE = new MassTag();
  static ONE_A = new MassTag();
  static ONE_B = new MassTag();
  static ONE_C = new MassTag();
  static ONE_D = new MassTag();
  static ONE_E = new MassTag();
  static TWO_A = new MassTag();
  static TWO_B = new MassTag();
  static TWO_C = new MassTag();
  static TWO_D = new MassTag();
  static TWO_E = new MassTag();
  static THREE_A = new MassTag();
  static THREE_B = new MassTag();
  static THREE_C = new MassTag();
  static THREE_D = new MassTag();
  static THREE_E = new MassTag();
  static A = new MassTag();
  static B = new MassTag();
  static C = new MassTag();
  static D = new MassTag();
  static E = new MassTag();
  static enumeration = new Enumeration(MassTag, {
    phetioDocumentation: 'Label for a mass'
  });
}
const blockStringMap = {
  [MassTag.ONE_A.name]: DensityBuoyancyCommonStrings.massLabel['1aStringProperty'],
  [MassTag.ONE_B.name]: DensityBuoyancyCommonStrings.massLabel['1bStringProperty'],
  [MassTag.ONE_C.name]: DensityBuoyancyCommonStrings.massLabel['1cStringProperty'],
  [MassTag.ONE_D.name]: DensityBuoyancyCommonStrings.massLabel['1dStringProperty'],
  [MassTag.ONE_E.name]: DensityBuoyancyCommonStrings.massLabel['1eStringProperty'],
  [MassTag.TWO_A.name]: DensityBuoyancyCommonStrings.massLabel['2aStringProperty'],
  [MassTag.TWO_B.name]: DensityBuoyancyCommonStrings.massLabel['2bStringProperty'],
  [MassTag.TWO_C.name]: DensityBuoyancyCommonStrings.massLabel['2cStringProperty'],
  [MassTag.TWO_D.name]: DensityBuoyancyCommonStrings.massLabel['2dStringProperty'],
  [MassTag.TWO_E.name]: DensityBuoyancyCommonStrings.massLabel['2eStringProperty'],
  [MassTag.THREE_A.name]: DensityBuoyancyCommonStrings.massLabel['3aStringProperty'],
  [MassTag.THREE_B.name]: DensityBuoyancyCommonStrings.massLabel['3bStringProperty'],
  [MassTag.THREE_C.name]: DensityBuoyancyCommonStrings.massLabel['3cStringProperty'],
  [MassTag.THREE_D.name]: DensityBuoyancyCommonStrings.massLabel['3dStringProperty'],
  [MassTag.THREE_E.name]: DensityBuoyancyCommonStrings.massLabel['3eStringProperty'],
  [MassTag.A.name]: DensityBuoyancyCommonStrings.massLabel.aStringProperty,
  [MassTag.B.name]: DensityBuoyancyCommonStrings.massLabel.bStringProperty,
  [MassTag.C.name]: DensityBuoyancyCommonStrings.massLabel.cStringProperty,
  [MassTag.D.name]: DensityBuoyancyCommonStrings.massLabel.dStringProperty,
  [MassTag.E.name]: DensityBuoyancyCommonStrings.massLabel.eStringProperty
};
class MaterialEnumeration extends EnumerationValue {
  static ALUMINUM = new MaterialEnumeration();
  static BRICK = new MaterialEnumeration();
  static COPPER = new MaterialEnumeration();
  static ICE = new MaterialEnumeration();
  static PLATINUM = new MaterialEnumeration();
  static STEEL = new MaterialEnumeration();
  static STYROFOAM = new MaterialEnumeration();
  static WOOD = new MaterialEnumeration();
  static CUSTOM = new MaterialEnumeration();
  static enumeration = new Enumeration(MaterialEnumeration, {
    phetioDocumentation: 'Material values'
  });
}
class GuardedNumberProperty extends NumberProperty {
  constructor(value, options) {
    super(value, {
      phetioOuterType: () => GuardedNumberPropertyIO,
      ...options
    });
    this.getPhetioSpecificValidationError = options.getPhetioSpecificValidationError;
  }
}
const GuardedNumberPropertyIO = new IOType('GuardedNumberPropertyIO', {
  supertype: NumberProperty.NumberPropertyIO,
  parameterTypes: [NumberIO],
  methods: {
    getValidationError: {
      returnType: NullableIO(StringIO),
      parameterTypes: [NumberIO],
      implementation: function (value) {
        // Fails early on the first error, checking the superclass validation first
        return this.getValidationError(value) || this.getPhetioSpecificValidationError(value);
      },
      documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
    }
  }
});
const materialToEnum = material => MaterialEnumeration[material.identifier || 'CUSTOM'];

// For the Buoyancy Shapes screen, but needed here because setRatios is included in each core type
// See https://github.com/phetsims/buoyancy/issues/29
export const MASS_MIN_SHAPES_DIMENSION = 0.1; // 10cm => 1L square
export const MASS_MAX_SHAPES_DIMENSION = Math.pow(0.01, 1 / 3); // 10L square

export default class Mass extends PhetioObject {
  // Without the matrix applied (effectively in "local" model coordinates)

  // Here just for instrumentation, see https://github.com/phetsims/density/issues/112
  // This can only hide it, but won't make it visible.
  // for phet-io support (to control the materialProperty)
  // for phet-io support (to control the materialProperty)
  // for phet-io support (to control the materialProperty)
  // Whether we are modifying the volumeProperty directly
  // Whether we are modifying the massProperty directly
  // In m^3 (cubic meters)
  // In kg (kilograms), added to the normal mass (computed from density and volume)
  // (read-only) In kg (kilograms) - written to by other processes
  // The following offset will be added onto the body's position to determine ours.
  // The 3D offset from the center-of-mass where the mass-label should be shown from.
  // The mass label will use this position (plus the masses' position) to determine a view point, then will use the
  // massOffsetOrientationProperty to position based on that point.
  // Orientation multiplied by 1/2 width,height for an offset in view space
  // Transform matrix set before/after the physics engine steps, to be used to adjust/read the mass's position/transform.
  // Transform matrix set in the internal physics engine steps, used by masses to determine their per-step information.
  // Fired when this mass's input (drag) should be interrupted.
  // Set by the model
  // Required internal-physics-step properties that should be set by subtypes in
  // updateStepInformation(). There may exist more set by the subtype (that will be used for e.g. volume/area
  // calculations). These are updated more often than simulation steps. These specific values will be used by external
  // code for determining liquid height.
  // x-value of the position
  // minimum y value of the mass
  // maximum y value of the mass
  constructor(engine, providedConfig) {
    const config = optionize()({
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
    }, providedConfig);
    assert && assert(config.body, 'config.body required');
    assert && assert(config.shape instanceof Shape, 'config.shape required as a Shape');
    assert && assert(config.material instanceof Material, 'config.material required as a Material');
    assert && assert(config.volume > 0, 'non-zero config.volume required');
    super(config);
    const tandem = config.tandem;
    this.engine = engine;
    this.body = config.body;
    this.massShape = config.massShape;
    this.shapeProperty = new Property(config.shape, {
      valueType: Shape
    });
    this.userControlledProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('userControlledProperty'),
      phetioReadOnly: true
    });
    this.inputEnabledProperty = new BooleanProperty(true, combineOptions({
      tandem: tandem.createTandem('inputEnabledProperty'),
      phetioDocumentation: 'Sets whether the element will have input enabled, and hence be interactive'
    }, config.inputEnabledPropertyOptions));
    this.internalVisibleProperty = new BooleanProperty(config.visible, {
      tandem: Tandem.OPT_OUT
    });
    this.studioVisibleProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('visibleProperty')
    });
    this.visibleProperty = DerivedProperty.and([this.internalVisibleProperty, this.studioVisibleProperty], {
      tandem: Tandem.OPT_OUT
    });
    this.materialProperty = new Property(config.material, combineOptions({
      valueType: Material,
      reentrant: true,
      tandem: tandem.createTandem('materialProperty'),
      phetioValueType: Material.MaterialIO
    }, config.materialPropertyOptions));
    if (config.adjustableMaterial) {
      this.materialEnumProperty = new EnumerationProperty(materialToEnum(config.material), {
        tandem: tandem.createTandem('materialEnumProperty'),
        phetioDocumentation: 'Current material of the block. Changing the material will result in changes to the mass, but the volume will remain the same.'
      });
      this.customDensityProperty = new NumberProperty(config.material.density, {
        tandem: tandem.createTandem('customDensityProperty'),
        phetioDocumentation: 'Density of the block when the material is set to “CUSTOM”.',
        range: new Range(150, 23000),
        units: 'kg/m^3'
      });
      this.customColorProperty = new ColorProperty(config.material.customColor ? config.material.customColor.value : Color.WHITE, {
        tandem: tandem.createTandem('customColorProperty')
      });
      this.materialProperty.addPhetioStateDependencies([this.materialEnumProperty, this.customDensityProperty, this.customColorProperty]);

      // Hook up phet-io Properties for interoperation with the normal ones
      let enumLock = false;
      let densityLock = false;
      let colorLock = false;
      const colorListener = color => {
        if (!colorLock) {
          colorLock = true;
          this.customColorProperty.value = color;
          colorLock = false;
        }
      };
      this.materialProperty.link((material, oldMaterial) => {
        if (!enumLock) {
          enumLock = true;
          this.materialEnumProperty.value = materialToEnum(material);
          enumLock = false;
        }
        if (!densityLock) {
          densityLock = true;
          this.customDensityProperty.value = material.density;
          densityLock = false;
        }
        if (oldMaterial && oldMaterial.customColor) {
          oldMaterial.customColor.unlink(colorListener);
        }
        if (material && material.customColor) {
          material.customColor.link(colorListener);
        }
      });
      Multilink.lazyMultilink([this.materialEnumProperty, this.customDensityProperty, this.customColorProperty], (materialEnum, density, color) => {
        // See if it's an external change
        if (!enumLock && !densityLock && !colorLock) {
          enumLock = true;
          densityLock = true;
          colorLock = true;
          if (materialEnum === MaterialEnumeration.CUSTOM) {
            this.materialProperty.value = Material.createCustomSolidMaterial({
              density: this.customDensityProperty.value,
              customColor: this.customColorProperty
            });
          } else {
            this.materialProperty.value = Material[materialEnum.name];
          }
          enumLock = false;
          densityLock = false;
          colorLock = false;
        }
      });
    }
    this.volumeLock = false;
    this.volumeProperty = new NumberProperty(config.volume, combineOptions({
      tandem: tandem.createTandem('volumeProperty'),
      range: new Range(config.minVolume, config.maxVolume),
      phetioReadOnly: true,
      phetioDocumentation: 'Current volume of the block. Changing the volume will result in changes to the mass, but will not change the material or density.',
      units: 'm^3',
      reentrant: true
    }, config.volumePropertyOptions));
    this.containedMassProperty = new NumberProperty(0, {
      range: new Range(0, Number.POSITIVE_INFINITY),
      tandem: Tandem.OPT_OUT
    });
    this.massLock = false;
    this.massProperty = new GuardedNumberProperty(this.materialProperty.value.density * this.volumeProperty.value + this.containedMassProperty.value, combineOptions({
      tandem: tandem.createTandem('massProperty'),
      phetioReadOnly: true,
      phetioState: false,
      phetioDocumentation: 'Current mass of the block. Changing the mass will result in changes to the volume (Intro and ' + 'Mystery Screens) or density (Compare Screen). Since the volume is computed as a function of ' + 'the mass, you can only set a mass that will keep the volume in range.',
      units: 'kg',
      reentrant: true,
      range: new Range(Number.MIN_VALUE, Number.POSITIVE_INFINITY),
      getPhetioSpecificValidationError: proposedMass => {
        // density = mass/ volume
        const proposedVolume = proposedMass / this.materialProperty.value.density;
        const isProposedVolumeInRange = this.volumeProperty.range.contains(proposedVolume);
        const maxAllowedMass = this.materialProperty.value.density * this.volumeProperty.range.max;
        const minAllowedMass = this.materialProperty.value.density * this.volumeProperty.range.min;
        return isProposedVolumeInRange ? null : `The proposed mass ${proposedMass} kg would result in a volume ${proposedVolume} m^3 that is out of range. At the current density, the allowed range is [${minAllowedMass}, ${maxAllowedMass}] kg.`;
      }
    }, config.massPropertyOptions));
    Multilink.multilink([this.materialProperty, this.volumeProperty, this.containedMassProperty], (material, volume, containedMass) => {
      this.massLock = true;
      this.massProperty.value = material.density * volume + containedMass;
      this.massLock = false;
    });
    this.bodyOffsetProperty = new Vector2Property(Vector2.ZERO, {
      tandem: Tandem.OPT_OUT
    });
    this.gravityForceInterpolatedProperty = new InterpolatedProperty(Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem('gravityForceInterpolatedProperty'),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    });
    this.buoyancyForceInterpolatedProperty = new InterpolatedProperty(Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem('buoyancyForceInterpolatedProperty'),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    });
    this.contactForceInterpolatedProperty = new InterpolatedProperty(Vector2.ZERO, {
      interpolate: InterpolatedProperty.interpolateVector2,
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem('contactForceInterpolatedProperty'),
      phetioValueType: Vector2.Vector2IO,
      phetioReadOnly: true,
      units: 'N',
      phetioHighFrequency: true
    });
    this.forceOffsetProperty = new Property(Vector3.ZERO, {
      valueType: Vector3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    });
    this.massOffsetProperty = new Property(Vector3.ZERO, {
      valueType: Vector3,
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    });
    this.massOffsetOrientationProperty = new Vector2Property(Vector2.ZERO, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: Tandem.OPT_OUT
    });
    this.matrix = config.matrix;
    this.stepMatrix = new Matrix3();
    this.transformedEmitter = new Emitter();
    this.interruptedEmitter = new Emitter();
    this.canRotate = config.canRotate;
    this.canMove = config.canMove;
    this.tag = config.tag;
    this.nameProperty = blockStringMap[config.tag.name] || new TinyProperty('');
    if (blockStringMap[config.tag.name]) {
      this.addLinkedElement(this.nameProperty, {
        tandem: config.tandem.createTandem('nameProperty')
      });
    }
    this.containingBasin = null;
    this.originalMatrix = this.matrix.copy();
    Multilink.multilink([this.shapeProperty, this.massProperty], () => {
      // Don't allow a fully-zero value for the physics engines
      engine.bodySetMass(this.body, Math.max(this.massProperty.value, 0.01), {
        canRotate: config.canRotate
      });
    });
    this.writeData();
    this.engine.bodySynchronizePrevious(this.body);

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
  isBoat() {
    return false;
  }

  /**
   * Returns the cross-sectional area of this object at a given y level.
   */

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   */

  /**
   * Sets the current location to be the proper position for the mass when it is reset.
   */
  setResetLocation() {
    this.originalMatrix = this.matrix.copy();
  }

  /**
   * Reads transform/velocity from the physics model engine.
   */
  readData() {
    this.engine.bodyGetMatrixTransform(this.body, this.matrix);

    // Apply the body offset
    this.matrix.set02(this.matrix.m02() + this.bodyOffsetProperty.value.x);
    this.matrix.set12(this.matrix.m12() + this.bodyOffsetProperty.value.y);
    this.transformedEmitter.emit();
  }

  /**
   * Writes position/velocity/etc. to the physics model engine.
   */
  writeData() {
    this.engine.bodySetPosition(this.body, this.matrix.translation.minus(this.bodyOffsetProperty.value));
    this.engine.bodySetRotation(this.body, this.matrix.rotation);
  }

  /**
   * Starts a physics model engine drag at the given 2d (x,y) model position.
   */
  startDrag(position) {
    this.userControlledProperty.value = true;
    this.engine.addPointerConstraint(this.body, position);
  }

  /**
   * Updates a current drag with a new 2d (x,y) model position.
   */
  updateDrag(position) {
    this.engine.updatePointerConstraint(this.body, position);
  }

  /**
   * Ends a physics model engine drag.
   */
  endDrag() {
    this.engine.removePointerConstraint(this.body);
    this.userControlledProperty.value = false;
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop (as those are
   * used for determining basin volumes and cross sections)
   */
  updateStepInformation() {
    this.engine.bodyGetStepMatrixTransform(this.body, this.stepMatrix);

    // Apply the body offset
    this.stepMatrix.set02(this.stepMatrix.m02() + this.bodyOffsetProperty.value.x);
    this.stepMatrix.set12(this.stepMatrix.m12() + this.bodyOffsetProperty.value.y);
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  intersect(ray, isTouch) {
    // TODO: should this be abstract
    return null;
  }

  /**
   * Steps forward in time.
   *
   * @param dt - In seconds
   * @param interpolationRatio
   */
  step(dt, interpolationRatio) {
    this.readData();
    this.transformedEmitter.emit();
    this.contactForceInterpolatedProperty.setRatio(interpolationRatio);
    this.buoyancyForceInterpolatedProperty.setRatio(interpolationRatio);
    this.gravityForceInterpolatedProperty.setRatio(interpolationRatio);
  }

  /**
   * Moves the mass to its initial position
   */
  resetPosition() {
    this.matrix.set(this.originalMatrix);
    this.writeData();
    this.engine.bodySynchronizePrevious(this.body);
    this.transformedEmitter.emit();
  }

  /**
   * Resets things to their original values.
   */
  reset() {
    this.engine.bodyResetHidden(this.body);
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
  dispose() {
    assert && assert(!this.isDisposed);
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
  static evaluatePiecewiseLinear(values, ratio) {
    const logicalIndex = ratio * (values.length - 1);
    if (logicalIndex % 1 === 0) {
      return values[logicalIndex];
    } else {
      const a = values[Math.floor(logicalIndex)];
      const b = values[Math.ceil(logicalIndex)];
      return Utils.linear(Math.floor(logicalIndex), Math.ceil(logicalIndex), a, b, logicalIndex);
    }
  }
  static MassIO = new IOType('MassIO', {
    valueType: Mass,
    documentation: 'Represents a mass that interacts in the scene, and can potentially float or displace liquid.',
    stateSchema: {
      matrix: Matrix3.Matrix3IO,
      stepMatrix: Matrix3.Matrix3IO,
      originalMatrix: Matrix3.Matrix3IO,
      canRotate: BooleanIO,
      canMove: BooleanIO,
      tag: EnumerationIO(MassTag),
      massShape: EnumerationIO(MassShape),
      // engine.bodyToStateObject
      position: Vector2.Vector2IO,
      velocity: Vector2.Vector2IO,
      force: Vector2.Vector2IO
    },
    toStateObject(mass) {
      return combineOptions({
        matrix: Matrix3.toStateObject(mass.matrix),
        stepMatrix: Matrix3.toStateObject(mass.stepMatrix),
        originalMatrix: Matrix3.toStateObject(mass.originalMatrix),
        canRotate: mass.canRotate,
        canMove: mass.canMove,
        tag: EnumerationIO(MassTag).toStateObject(mass.tag),
        massShape: EnumerationIO(MassShape).toStateObject(mass.massShape)
      }, mass.engine.bodyToStateObject(mass.body));
    },
    applyState(mass, obj) {
      mass.matrix.set(Matrix3.fromStateObject(obj.matrix));
      mass.stepMatrix.set(Matrix3.fromStateObject(obj.stepMatrix));
      mass.originalMatrix.set(Matrix3.fromStateObject(obj.originalMatrix));
      mass.canRotate = obj.canRotate;
      mass.canMove = obj.canMove;
      mass.tag = EnumerationIO(MassTag).fromStateObject(obj.tag);
      mass.engine.bodyApplyState(mass.body, obj);
      mass.transformedEmitter.emit();
    },
    stateObjectToCreateElementArguments: stateObject => [EnumerationIO(MassShape).fromStateObject(stateObject.massShape)]
  });
}
densityBuoyancyCommon.register('Mass', Mass);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiRW51bWVyYXRpb25Qcm9wZXJ0eSIsIk51bWJlclByb3BlcnR5IiwiUHJvcGVydHkiLCJNYXRyaXgzIiwiUmFuZ2UiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJWZWN0b3IzIiwiU2hhcGUiLCJFbnVtZXJhdGlvbklPIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJDb2xvciIsIkNvbG9yUHJvcGVydHkiLCJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJCb29sZWFuSU8iLCJJT1R5cGUiLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIiwiSW50ZXJwb2xhdGVkUHJvcGVydHkiLCJNYXRlcmlhbCIsIkVudW1lcmF0aW9uVmFsdWUiLCJFbnVtZXJhdGlvbiIsIk11bHRpbGluayIsIk1hc3NTaGFwZSIsIlRpbnlQcm9wZXJ0eSIsIk51bGxhYmxlSU8iLCJTdHJpbmdJTyIsIk51bWJlcklPIiwiTWFzc1RhZyIsIlBSSU1BUlkiLCJTRUNPTkRBUlkiLCJOT05FIiwiT05FX0EiLCJPTkVfQiIsIk9ORV9DIiwiT05FX0QiLCJPTkVfRSIsIlRXT19BIiwiVFdPX0IiLCJUV09fQyIsIlRXT19EIiwiVFdPX0UiLCJUSFJFRV9BIiwiVEhSRUVfQiIsIlRIUkVFX0MiLCJUSFJFRV9EIiwiVEhSRUVfRSIsIkEiLCJCIiwiQyIsIkQiLCJFIiwiZW51bWVyYXRpb24iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYmxvY2tTdHJpbmdNYXAiLCJuYW1lIiwibWFzc0xhYmVsIiwiYVN0cmluZ1Byb3BlcnR5IiwiYlN0cmluZ1Byb3BlcnR5IiwiY1N0cmluZ1Byb3BlcnR5IiwiZFN0cmluZ1Byb3BlcnR5IiwiZVN0cmluZ1Byb3BlcnR5IiwiTWF0ZXJpYWxFbnVtZXJhdGlvbiIsIkFMVU1JTlVNIiwiQlJJQ0siLCJDT1BQRVIiLCJJQ0UiLCJQTEFUSU5VTSIsIlNURUVMIiwiU1RZUk9GT0FNIiwiV09PRCIsIkNVU1RPTSIsIkd1YXJkZWROdW1iZXJQcm9wZXJ0eSIsImNvbnN0cnVjdG9yIiwidmFsdWUiLCJvcHRpb25zIiwicGhldGlvT3V0ZXJUeXBlIiwiR3VhcmRlZE51bWJlclByb3BlcnR5SU8iLCJnZXRQaGV0aW9TcGVjaWZpY1ZhbGlkYXRpb25FcnJvciIsInN1cGVydHlwZSIsIk51bWJlclByb3BlcnR5SU8iLCJwYXJhbWV0ZXJUeXBlcyIsIm1ldGhvZHMiLCJnZXRWYWxpZGF0aW9uRXJyb3IiLCJyZXR1cm5UeXBlIiwiaW1wbGVtZW50YXRpb24iLCJkb2N1bWVudGF0aW9uIiwibWF0ZXJpYWxUb0VudW0iLCJtYXRlcmlhbCIsImlkZW50aWZpZXIiLCJNQVNTX01JTl9TSEFQRVNfRElNRU5TSU9OIiwiTUFTU19NQVhfU0hBUEVTX0RJTUVOU0lPTiIsIk1hdGgiLCJwb3ciLCJNYXNzIiwiZW5naW5lIiwicHJvdmlkZWRDb25maWciLCJjb25maWciLCJ2aXNpYmxlIiwibWF0cml4IiwiY2FuUm90YXRlIiwiY2FuTW92ZSIsImFkanVzdGFibGVNYXRlcmlhbCIsInRhZyIsInRhbmRlbSIsIk9QVElPTkFMIiwicGhldGlvVHlwZSIsIk1hc3NJTyIsImlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucyIsIm1hdGVyaWFsUHJvcGVydHlPcHRpb25zIiwidm9sdW1lUHJvcGVydHlPcHRpb25zIiwibWFzc1Byb3BlcnR5T3B0aW9ucyIsIm1pblZvbHVtZSIsIm1heFZvbHVtZSIsIk51bWJlciIsIlBPU0lUSVZFX0lORklOSVRZIiwiYXNzZXJ0IiwiYm9keSIsInNoYXBlIiwidm9sdW1lIiwibWFzc1NoYXBlIiwic2hhcGVQcm9wZXJ0eSIsInZhbHVlVHlwZSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9SZWFkT25seSIsImlucHV0RW5hYmxlZFByb3BlcnR5IiwiaW50ZXJuYWxWaXNpYmxlUHJvcGVydHkiLCJPUFRfT1VUIiwic3R1ZGlvVmlzaWJsZVByb3BlcnR5IiwidmlzaWJsZVByb3BlcnR5IiwiYW5kIiwibWF0ZXJpYWxQcm9wZXJ0eSIsInJlZW50cmFudCIsInBoZXRpb1ZhbHVlVHlwZSIsIk1hdGVyaWFsSU8iLCJtYXRlcmlhbEVudW1Qcm9wZXJ0eSIsImN1c3RvbURlbnNpdHlQcm9wZXJ0eSIsImRlbnNpdHkiLCJyYW5nZSIsInVuaXRzIiwiY3VzdG9tQ29sb3JQcm9wZXJ0eSIsImN1c3RvbUNvbG9yIiwiV0hJVEUiLCJhZGRQaGV0aW9TdGF0ZURlcGVuZGVuY2llcyIsImVudW1Mb2NrIiwiZGVuc2l0eUxvY2siLCJjb2xvckxvY2siLCJjb2xvckxpc3RlbmVyIiwiY29sb3IiLCJsaW5rIiwib2xkTWF0ZXJpYWwiLCJ1bmxpbmsiLCJsYXp5TXVsdGlsaW5rIiwibWF0ZXJpYWxFbnVtIiwiY3JlYXRlQ3VzdG9tU29saWRNYXRlcmlhbCIsInZvbHVtZUxvY2siLCJ2b2x1bWVQcm9wZXJ0eSIsImNvbnRhaW5lZE1hc3NQcm9wZXJ0eSIsIm1hc3NMb2NrIiwibWFzc1Byb3BlcnR5IiwicGhldGlvU3RhdGUiLCJNSU5fVkFMVUUiLCJwcm9wb3NlZE1hc3MiLCJwcm9wb3NlZFZvbHVtZSIsImlzUHJvcG9zZWRWb2x1bWVJblJhbmdlIiwiY29udGFpbnMiLCJtYXhBbGxvd2VkTWFzcyIsIm1heCIsIm1pbkFsbG93ZWRNYXNzIiwibWluIiwibXVsdGlsaW5rIiwiY29udGFpbmVkTWFzcyIsImJvZHlPZmZzZXRQcm9wZXJ0eSIsIlpFUk8iLCJncmF2aXR5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eSIsImludGVycG9sYXRlIiwiaW50ZXJwb2xhdGVWZWN0b3IyIiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJWZWN0b3IySU8iLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwiYnVveWFuY3lGb3JjZUludGVycG9sYXRlZFByb3BlcnR5IiwiY29udGFjdEZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkiLCJmb3JjZU9mZnNldFByb3BlcnR5IiwibWFzc09mZnNldFByb3BlcnR5IiwibWFzc09mZnNldE9yaWVudGF0aW9uUHJvcGVydHkiLCJzdGVwTWF0cml4IiwidHJhbnNmb3JtZWRFbWl0dGVyIiwiaW50ZXJydXB0ZWRFbWl0dGVyIiwibmFtZVByb3BlcnR5IiwiYWRkTGlua2VkRWxlbWVudCIsImNvbnRhaW5pbmdCYXNpbiIsIm9yaWdpbmFsTWF0cml4IiwiY29weSIsImJvZHlTZXRNYXNzIiwid3JpdGVEYXRhIiwiYm9keVN5bmNocm9uaXplUHJldmlvdXMiLCJzdGVwWCIsInN0ZXBCb3R0b20iLCJzdGVwVG9wIiwiaXNCb2F0Iiwic2V0UmVzZXRMb2NhdGlvbiIsInJlYWREYXRhIiwiYm9keUdldE1hdHJpeFRyYW5zZm9ybSIsInNldDAyIiwibTAyIiwieCIsInNldDEyIiwibTEyIiwieSIsImVtaXQiLCJib2R5U2V0UG9zaXRpb24iLCJ0cmFuc2xhdGlvbiIsIm1pbnVzIiwiYm9keVNldFJvdGF0aW9uIiwicm90YXRpb24iLCJzdGFydERyYWciLCJwb3NpdGlvbiIsImFkZFBvaW50ZXJDb25zdHJhaW50IiwidXBkYXRlRHJhZyIsInVwZGF0ZVBvaW50ZXJDb25zdHJhaW50IiwiZW5kRHJhZyIsInJlbW92ZVBvaW50ZXJDb25zdHJhaW50IiwidXBkYXRlU3RlcEluZm9ybWF0aW9uIiwiYm9keUdldFN0ZXBNYXRyaXhUcmFuc2Zvcm0iLCJpbnRlcnNlY3QiLCJyYXkiLCJpc1RvdWNoIiwic3RlcCIsImR0IiwiaW50ZXJwb2xhdGlvblJhdGlvIiwic2V0UmF0aW8iLCJyZXNldFBvc2l0aW9uIiwic2V0IiwicmVzZXQiLCJib2R5UmVzZXRIaWRkZW4iLCJkaXNwb3NlIiwiaXNEaXNwb3NlZCIsImV2YWx1YXRlUGllY2V3aXNlTGluZWFyIiwidmFsdWVzIiwicmF0aW8iLCJsb2dpY2FsSW5kZXgiLCJsZW5ndGgiLCJhIiwiZmxvb3IiLCJiIiwiY2VpbCIsImxpbmVhciIsInN0YXRlU2NoZW1hIiwiTWF0cml4M0lPIiwidmVsb2NpdHkiLCJmb3JjZSIsInRvU3RhdGVPYmplY3QiLCJtYXNzIiwiYm9keVRvU3RhdGVPYmplY3QiLCJhcHBseVN0YXRlIiwib2JqIiwiZnJvbVN0YXRlT2JqZWN0IiwiYm9keUFwcGx5U3RhdGUiLCJzdGF0ZU9iamVjdFRvQ3JlYXRlRWxlbWVudEFyZ3VtZW50cyIsInN0YXRlT2JqZWN0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYXNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudHMgYSBtYXNzIHRoYXQgaW50ZXJhY3RzIGluIHRoZSBzY2VuZSwgYW5kIGNhbiBwb3RlbnRpYWxseSBmbG9hdCBvciBkaXNwbGFjZSBsaXF1aWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5LCB7IEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHksIHsgTnVtYmVyUHJvcGVydHlPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSwgeyBQcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IE1hdHJpeDMsIHsgTWF0cml4M1N0YXRlT2JqZWN0IH0gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9FbnVtZXJhdGlvbklPLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBDb2xvciwgQ29sb3JQcm9wZXJ0eSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzIGZyb20gJy4uLy4uL0RlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgSW50ZXJwb2xhdGVkUHJvcGVydHkgZnJvbSAnLi9JbnRlcnBvbGF0ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNYXRlcmlhbCBmcm9tICcuL01hdGVyaWFsLmpzJztcclxuaW1wb3J0IEVudW1lcmF0aW9uVmFsdWUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uVmFsdWUuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL0VudW1lcmF0aW9uLmpzJztcclxuaW1wb3J0IFBoeXNpY3NFbmdpbmUsIHsgUGh5c2ljc0VuZ2luZUJvZHkgfSBmcm9tICcuL1BoeXNpY3NFbmdpbmUuanMnO1xyXG5pbXBvcnQgQmFzaW4gZnJvbSAnLi9CYXNpbi5qcyc7XHJcbmltcG9ydCBSYXkzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYXkzLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgTWFzc1NoYXBlIH0gZnJvbSAnLi9NYXNzU2hhcGUuanMnO1xyXG5pbXBvcnQgeyBCb2R5U3RhdGVPYmplY3QgfSBmcm9tICcuL1AyRW5naW5lLmpzJztcclxuaW1wb3J0IFRFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVEVtaXR0ZXIuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVGlueVByb3BlcnR5LmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgU3RyaW5nSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuaW1wb3J0IE51bWJlcklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9OdW1iZXJJTy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuZXhwb3J0IGNsYXNzIE1hc3NUYWcgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBSSU1BUlkgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0VDT05EQVJZID0gbmV3IE1hc3NUYWcoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE5PTkUgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT05FX0EgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT05FX0IgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT05FX0MgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT05FX0QgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT05FX0UgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFdPX0EgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFdPX0IgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFdPX0MgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFdPX0QgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVFdPX0UgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVEhSRUVfQSA9IG5ldyBNYXNzVGFnKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSFJFRV9CID0gbmV3IE1hc3NUYWcoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRIUkVFX0MgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVEhSRUVfRCA9IG5ldyBNYXNzVGFnKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBUSFJFRV9FID0gbmV3IE1hc3NUYWcoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEEgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgQiA9IG5ldyBNYXNzVGFnKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDID0gbmV3IE1hc3NUYWcoKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEQgPSBuZXcgTWFzc1RhZygpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgRSA9IG5ldyBNYXNzVGFnKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIE1hc3NUYWcsIHtcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdMYWJlbCBmb3IgYSBtYXNzJ1xyXG4gIH0gKTtcclxufVxyXG5cclxuY29uc3QgYmxvY2tTdHJpbmdNYXAgPSB7XHJcbiAgWyBNYXNzVGFnLk9ORV9BLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICcxYVN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5PTkVfQi5uYW1lIF06IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWFzc0xhYmVsWyAnMWJTdHJpbmdQcm9wZXJ0eScgXSxcclxuICBbIE1hc3NUYWcuT05FX0MubmFtZSBdOiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hc3NMYWJlbFsgJzFjU3RyaW5nUHJvcGVydHknIF0sXHJcbiAgWyBNYXNzVGFnLk9ORV9ELm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICcxZFN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5PTkVfRS5uYW1lIF06IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWFzc0xhYmVsWyAnMWVTdHJpbmdQcm9wZXJ0eScgXSxcclxuICBbIE1hc3NUYWcuVFdPX0EubmFtZSBdOiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hc3NMYWJlbFsgJzJhU3RyaW5nUHJvcGVydHknIF0sXHJcbiAgWyBNYXNzVGFnLlRXT19CLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICcyYlN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5UV09fQy5uYW1lIF06IERlbnNpdHlCdW95YW5jeUNvbW1vblN0cmluZ3MubWFzc0xhYmVsWyAnMmNTdHJpbmdQcm9wZXJ0eScgXSxcclxuICBbIE1hc3NUYWcuVFdPX0QubmFtZSBdOiBEZW5zaXR5QnVveWFuY3lDb21tb25TdHJpbmdzLm1hc3NMYWJlbFsgJzJkU3RyaW5nUHJvcGVydHknIF0sXHJcbiAgWyBNYXNzVGFnLlRXT19FLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICcyZVN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5USFJFRV9BLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICczYVN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5USFJFRV9CLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICczYlN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5USFJFRV9DLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICczY1N0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5USFJFRV9ELm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICczZFN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5USFJFRV9FLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWxbICczZVN0cmluZ1Byb3BlcnR5JyBdLFxyXG4gIFsgTWFzc1RhZy5BLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwuYVN0cmluZ1Byb3BlcnR5LFxyXG4gIFsgTWFzc1RhZy5CLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwuYlN0cmluZ1Byb3BlcnR5LFxyXG4gIFsgTWFzc1RhZy5DLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwuY1N0cmluZ1Byb3BlcnR5LFxyXG4gIFsgTWFzc1RhZy5ELm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwuZFN0cmluZ1Byb3BlcnR5LFxyXG4gIFsgTWFzc1RhZy5FLm5hbWUgXTogRGVuc2l0eUJ1b3lhbmN5Q29tbW9uU3RyaW5ncy5tYXNzTGFiZWwuZVN0cmluZ1Byb3BlcnR5XHJcbn07XHJcblxyXG5jbGFzcyBNYXRlcmlhbEVudW1lcmF0aW9uIGV4dGVuZHMgRW51bWVyYXRpb25WYWx1ZSB7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBBTFVNSU5VTSA9IG5ldyBNYXRlcmlhbEVudW1lcmF0aW9uKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBCUklDSyA9IG5ldyBNYXRlcmlhbEVudW1lcmF0aW9uKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBDT1BQRVIgPSBuZXcgTWF0ZXJpYWxFbnVtZXJhdGlvbigpO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSUNFID0gbmV3IE1hdGVyaWFsRW51bWVyYXRpb24oKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBMQVRJTlVNID0gbmV3IE1hdGVyaWFsRW51bWVyYXRpb24oKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNURUVMID0gbmV3IE1hdGVyaWFsRW51bWVyYXRpb24oKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNUWVJPRk9BTSA9IG5ldyBNYXRlcmlhbEVudW1lcmF0aW9uKCk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBXT09EID0gbmV3IE1hdGVyaWFsRW51bWVyYXRpb24oKTtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENVU1RPTSA9IG5ldyBNYXRlcmlhbEVudW1lcmF0aW9uKCk7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgZW51bWVyYXRpb24gPSBuZXcgRW51bWVyYXRpb24oIE1hdGVyaWFsRW51bWVyYXRpb24sIHtcclxuICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdNYXRlcmlhbCB2YWx1ZXMnXHJcbiAgfSApO1xyXG59XHJcblxyXG50eXBlIEd1YXJkZWROdW1iZXJQcm9wZXJ0eU9wdGlvbnMgPSBOdW1iZXJQcm9wZXJ0eU9wdGlvbnMgJiB7IGdldFBoZXRpb1NwZWNpZmljVmFsaWRhdGlvbkVycm9yOiAoIHZhbHVlOiBudW1iZXIgKSA9PiBzdHJpbmcgfCBudWxsIH07XHJcblxyXG5jbGFzcyBHdWFyZGVkTnVtYmVyUHJvcGVydHkgZXh0ZW5kcyBOdW1iZXJQcm9wZXJ0eSB7XHJcbiAgcHVibGljIHJlYWRvbmx5IGdldFBoZXRpb1NwZWNpZmljVmFsaWRhdGlvbkVycm9yOiAoIG51bWJlcjogbnVtYmVyICkgPT4gc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB2YWx1ZTogbnVtYmVyLCBvcHRpb25zOiBHdWFyZGVkTnVtYmVyUHJvcGVydHlPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIHZhbHVlLCB7XHJcbiAgICAgIHBoZXRpb091dGVyVHlwZTogKCkgPT4gR3VhcmRlZE51bWJlclByb3BlcnR5SU8sXHJcbiAgICAgIC4uLm9wdGlvbnNcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmdldFBoZXRpb1NwZWNpZmljVmFsaWRhdGlvbkVycm9yID0gb3B0aW9ucy5nZXRQaGV0aW9TcGVjaWZpY1ZhbGlkYXRpb25FcnJvcjtcclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IEd1YXJkZWROdW1iZXJQcm9wZXJ0eUlPID0gbmV3IElPVHlwZSggJ0d1YXJkZWROdW1iZXJQcm9wZXJ0eUlPJywge1xyXG4gIHN1cGVydHlwZTogTnVtYmVyUHJvcGVydHkuTnVtYmVyUHJvcGVydHlJTyxcclxuICBwYXJhbWV0ZXJUeXBlczogWyBOdW1iZXJJTyBdLFxyXG4gIG1ldGhvZHM6IHtcclxuICAgIGdldFZhbGlkYXRpb25FcnJvcjoge1xyXG4gICAgICByZXR1cm5UeXBlOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLFxyXG4gICAgICBwYXJhbWV0ZXJUeXBlczogWyBOdW1iZXJJTyBdLFxyXG4gICAgICBpbXBsZW1lbnRhdGlvbjogZnVuY3Rpb24oIHRoaXM6IEd1YXJkZWROdW1iZXJQcm9wZXJ0eSwgdmFsdWU6IG51bWJlciApIHtcclxuXHJcbiAgICAgICAgLy8gRmFpbHMgZWFybHkgb24gdGhlIGZpcnN0IGVycm9yLCBjaGVja2luZyB0aGUgc3VwZXJjbGFzcyB2YWxpZGF0aW9uIGZpcnN0XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSApIHx8IHRoaXMuZ2V0UGhldGlvU3BlY2lmaWNWYWxpZGF0aW9uRXJyb3IoIHZhbHVlICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGRvY3VtZW50YXRpb246ICdDaGVja3MgdG8gc2VlIGlmIGEgcHJvcG9zZWQgdmFsdWUgaXMgdmFsaWQuIFJldHVybnMgdGhlIGZpcnN0IHZhbGlkYXRpb24gZXJyb3IsIG9yIG51bGwgaWYgdGhlIHZhbHVlIGlzIHZhbGlkLidcclxuICAgIH1cclxuICB9XHJcbn0gKTtcclxuXHJcbnR5cGUgTWF0ZXJpYWxOb25DdXN0b21JZGVudGlmaWVyID0gJ0FMVU1JTlVNJyB8ICdCUklDSycgfCAnQ09QUEVSJyB8ICdJQ0UnIHwgJ1BMQVRJTlVNJyB8ICdTVEVFTCcgfCAnU1RZUk9GT0FNJyB8ICdXT09EJztcclxudHlwZSBNYXRlcmlhbElkZW50aWZpZXIgPSBNYXRlcmlhbE5vbkN1c3RvbUlkZW50aWZpZXIgfCAnQ1VTVE9NJztcclxuXHJcbmNvbnN0IG1hdGVyaWFsVG9FbnVtID0gKCBtYXRlcmlhbDogTWF0ZXJpYWwgKTogTWF0ZXJpYWxFbnVtZXJhdGlvbiA9PiBNYXRlcmlhbEVudW1lcmF0aW9uWyAoICggbWF0ZXJpYWwuaWRlbnRpZmllciBhcyBNYXRlcmlhbElkZW50aWZpZXIgfCBudWxsICkgfHwgJ0NVU1RPTScgKSBdO1xyXG5cclxuLy8gRm9yIHRoZSBCdW95YW5jeSBTaGFwZXMgc2NyZWVuLCBidXQgbmVlZGVkIGhlcmUgYmVjYXVzZSBzZXRSYXRpb3MgaXMgaW5jbHVkZWQgaW4gZWFjaCBjb3JlIHR5cGVcclxuLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9idW95YW5jeS9pc3N1ZXMvMjlcclxuZXhwb3J0IGNvbnN0IE1BU1NfTUlOX1NIQVBFU19ESU1FTlNJT04gPSAwLjE7IC8vIDEwY20gPT4gMUwgc3F1YXJlXHJcbmV4cG9ydCBjb25zdCBNQVNTX01BWF9TSEFQRVNfRElNRU5TSU9OID0gTWF0aC5wb3coIDAuMDEsIDEgLyAzICk7IC8vIDEwTCBzcXVhcmVcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgLy8gUmVxdWlyZWRcclxuICBib2R5OiBQaHlzaWNzRW5naW5lQm9keTtcclxuICBzaGFwZTogU2hhcGU7XHJcbiAgbWF0ZXJpYWw6IE1hdGVyaWFsO1xyXG4gIHZvbHVtZTogbnVtYmVyO1xyXG4gIG1hc3NTaGFwZTogTWFzc1NoYXBlO1xyXG5cclxuICB2aXNpYmxlPzogYm9vbGVhbjtcclxuICBtYXRyaXg/OiBNYXRyaXgzO1xyXG4gIGNhblJvdGF0ZT86IGJvb2xlYW47XHJcbiAgY2FuTW92ZT86IGJvb2xlYW47XHJcbiAgYWRqdXN0YWJsZU1hdGVyaWFsPzogYm9vbGVhbjtcclxuICB0YWc/OiBNYXNzVGFnO1xyXG4gIHRhbmRlbT86IFRhbmRlbTtcclxuICBwaGV0aW9UeXBlPzogSU9UeXBlO1xyXG4gIGlucHV0RW5hYmxlZFByb3BlcnR5T3B0aW9ucz86IEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnM7XHJcbiAgbWF0ZXJpYWxQcm9wZXJ0eU9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8TWF0ZXJpYWw+O1xyXG4gIHZvbHVtZVByb3BlcnR5T3B0aW9ucz86IE51bWJlclByb3BlcnR5T3B0aW9ucztcclxuICBtYXNzUHJvcGVydHlPcHRpb25zPzogTnVtYmVyUHJvcGVydHlPcHRpb25zO1xyXG5cclxuICBtaW5Wb2x1bWU/OiBudW1iZXI7XHJcbiAgbWF4Vm9sdW1lPzogbnVtYmVyO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTWFzc09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBoZXRpb09iamVjdE9wdGlvbnM7XHJcbmV4cG9ydCB0eXBlIEluc3RydW1lbnRlZE1hc3NPcHRpb25zID0gTWFzc09wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8TWFzc09wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCB0eXBlIE1hc3NJT1N0YXRlT2JqZWN0ID0ge1xyXG4gIG1hdHJpeDogTWF0cml4M1N0YXRlT2JqZWN0O1xyXG4gIHN0ZXBNYXRyaXg6IE1hdHJpeDNTdGF0ZU9iamVjdDtcclxuICBvcmlnaW5hbE1hdHJpeDogTWF0cml4M1N0YXRlT2JqZWN0O1xyXG4gIGNhblJvdGF0ZTogYm9vbGVhbjtcclxuICBjYW5Nb3ZlOiBib29sZWFuO1xyXG4gIHRhZzogc3RyaW5nO1xyXG4gIG1hc3NTaGFwZTogc3RyaW5nO1xyXG59ICYgQm9keVN0YXRlT2JqZWN0O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYWJzdHJhY3QgY2xhc3MgTWFzcyBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBlbmdpbmU6IFBoeXNpY3NFbmdpbmU7XHJcbiAgcHVibGljIHJlYWRvbmx5IGJvZHk6IFBoeXNpY3NFbmdpbmVCb2R5O1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgbWFzc1NoYXBlOiBNYXNzU2hhcGU7XHJcblxyXG4gIC8vIFdpdGhvdXQgdGhlIG1hdHJpeCBhcHBsaWVkIChlZmZlY3RpdmVseSBpbiBcImxvY2FsXCIgbW9kZWwgY29vcmRpbmF0ZXMpXHJcbiAgcHVibGljIHJlYWRvbmx5IHNoYXBlUHJvcGVydHk6IFByb3BlcnR5PFNoYXBlPjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHVzZXJDb250cm9sbGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHB1YmxpYyByZWFkb25seSBpbnB1dEVuYWJsZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IHZpc2libGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGludGVybmFsVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gSGVyZSBqdXN0IGZvciBpbnN0cnVtZW50YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZGVuc2l0eS9pc3N1ZXMvMTEyXHJcbiAgLy8gVGhpcyBjYW4gb25seSBoaWRlIGl0LCBidXQgd29uJ3QgbWFrZSBpdCB2aXNpYmxlLlxyXG4gIHB1YmxpYyByZWFkb25seSBzdHVkaW9WaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgbWF0ZXJpYWxQcm9wZXJ0eTogUHJvcGVydHk8TWF0ZXJpYWw+O1xyXG5cclxuICAvLyBmb3IgcGhldC1pbyBzdXBwb3J0ICh0byBjb250cm9sIHRoZSBtYXRlcmlhbFByb3BlcnR5KVxyXG4gIHB1YmxpYyByZWFkb25seSBtYXRlcmlhbEVudW1Qcm9wZXJ0eT86IFByb3BlcnR5PE1hdGVyaWFsRW51bWVyYXRpb24+O1xyXG5cclxuICAvLyBmb3IgcGhldC1pbyBzdXBwb3J0ICh0byBjb250cm9sIHRoZSBtYXRlcmlhbFByb3BlcnR5KVxyXG4gIHB1YmxpYyByZWFkb25seSBjdXN0b21EZW5zaXR5UHJvcGVydHk/OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyBmb3IgcGhldC1pbyBzdXBwb3J0ICh0byBjb250cm9sIHRoZSBtYXRlcmlhbFByb3BlcnR5KVxyXG4gIHB1YmxpYyByZWFkb25seSBjdXN0b21Db2xvclByb3BlcnR5PzogUHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICAvLyBXaGV0aGVyIHdlIGFyZSBtb2RpZnlpbmcgdGhlIHZvbHVtZVByb3BlcnR5IGRpcmVjdGx5XHJcbiAgcHJvdGVjdGVkIHZvbHVtZUxvY2s6IGJvb2xlYW47XHJcblxyXG4gIC8vIFdoZXRoZXIgd2UgYXJlIG1vZGlmeWluZyB0aGUgbWFzc1Byb3BlcnR5IGRpcmVjdGx5XHJcbiAgcHJvdGVjdGVkIG1hc3NMb2NrOiBib29sZWFuO1xyXG5cclxuICAvLyBJbiBtXjMgKGN1YmljIG1ldGVycylcclxuICBwdWJsaWMgcmVhZG9ubHkgdm9sdW1lUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyBJbiBrZyAoa2lsb2dyYW1zKSwgYWRkZWQgdG8gdGhlIG5vcm1hbCBtYXNzIChjb21wdXRlZCBmcm9tIGRlbnNpdHkgYW5kIHZvbHVtZSlcclxuICBwdWJsaWMgcmVhZG9ubHkgY29udGFpbmVkTWFzc1Byb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyAocmVhZC1vbmx5KSBJbiBrZyAoa2lsb2dyYW1zKSAtIHdyaXR0ZW4gdG8gYnkgb3RoZXIgcHJvY2Vzc2VzXHJcbiAgcHVibGljIHJlYWRvbmx5IG1hc3NQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gVGhlIGZvbGxvd2luZyBvZmZzZXQgd2lsbCBiZSBhZGRlZCBvbnRvIHRoZSBib2R5J3MgcG9zaXRpb24gdG8gZGV0ZXJtaW5lIG91cnMuXHJcbiAgcHVibGljIHJlYWRvbmx5IGJvZHlPZmZzZXRQcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj47XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBncmF2aXR5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eTogSW50ZXJwb2xhdGVkUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGJ1b3lhbmN5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eTogSW50ZXJwb2xhdGVkUHJvcGVydHk8VmVjdG9yMj47XHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbnRhY3RGb3JjZUludGVycG9sYXRlZFByb3BlcnR5OiBJbnRlcnBvbGF0ZWRQcm9wZXJ0eTxWZWN0b3IyPjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGZvcmNlT2Zmc2V0UHJvcGVydHk6IFByb3BlcnR5PFZlY3RvcjM+O1xyXG5cclxuICAvLyBUaGUgM0Qgb2Zmc2V0IGZyb20gdGhlIGNlbnRlci1vZi1tYXNzIHdoZXJlIHRoZSBtYXNzLWxhYmVsIHNob3VsZCBiZSBzaG93biBmcm9tLlxyXG4gIC8vIFRoZSBtYXNzIGxhYmVsIHdpbGwgdXNlIHRoaXMgcG9zaXRpb24gKHBsdXMgdGhlIG1hc3NlcycgcG9zaXRpb24pIHRvIGRldGVybWluZSBhIHZpZXcgcG9pbnQsIHRoZW4gd2lsbCB1c2UgdGhlXHJcbiAgLy8gbWFzc09mZnNldE9yaWVudGF0aW9uUHJvcGVydHkgdG8gcG9zaXRpb24gYmFzZWQgb24gdGhhdCBwb2ludC5cclxuICBwdWJsaWMgcmVhZG9ubHkgbWFzc09mZnNldFByb3BlcnR5OiBQcm9wZXJ0eTxWZWN0b3IzPjtcclxuXHJcbiAgLy8gT3JpZW50YXRpb24gbXVsdGlwbGllZCBieSAxLzIgd2lkdGgsaGVpZ2h0IGZvciBhbiBvZmZzZXQgaW4gdmlldyBzcGFjZVxyXG4gIHB1YmxpYyByZWFkb25seSBtYXNzT2Zmc2V0T3JpZW50YXRpb25Qcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj47XHJcblxyXG4gIC8vIFRyYW5zZm9ybSBtYXRyaXggc2V0IGJlZm9yZS9hZnRlciB0aGUgcGh5c2ljcyBlbmdpbmUgc3RlcHMsIHRvIGJlIHVzZWQgdG8gYWRqdXN0L3JlYWQgdGhlIG1hc3MncyBwb3NpdGlvbi90cmFuc2Zvcm0uXHJcbiAgcHVibGljIHJlYWRvbmx5IG1hdHJpeDogTWF0cml4MztcclxuXHJcbiAgLy8gVHJhbnNmb3JtIG1hdHJpeCBzZXQgaW4gdGhlIGludGVybmFsIHBoeXNpY3MgZW5naW5lIHN0ZXBzLCB1c2VkIGJ5IG1hc3NlcyB0byBkZXRlcm1pbmUgdGhlaXIgcGVyLXN0ZXAgaW5mb3JtYXRpb24uXHJcbiAgcHVibGljIHJlYWRvbmx5IHN0ZXBNYXRyaXg6IE1hdHJpeDM7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSB0cmFuc2Zvcm1lZEVtaXR0ZXI6IFRFbWl0dGVyO1xyXG5cclxuICAvLyBGaXJlZCB3aGVuIHRoaXMgbWFzcydzIGlucHV0IChkcmFnKSBzaG91bGQgYmUgaW50ZXJydXB0ZWQuXHJcbiAgcHVibGljIHJlYWRvbmx5IGludGVycnVwdGVkRW1pdHRlcjogVEVtaXR0ZXI7XHJcblxyXG4gIHB1YmxpYyBjYW5Sb3RhdGU6IGJvb2xlYW47XHJcbiAgcHVibGljIGNhbk1vdmU6IGJvb2xlYW47XHJcbiAgcHVibGljIHRhZzogTWFzc1RhZztcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IG5hbWVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPjtcclxuXHJcbiAgLy8gU2V0IGJ5IHRoZSBtb2RlbFxyXG4gIHB1YmxpYyBjb250YWluaW5nQmFzaW46IEJhc2luIHwgbnVsbDtcclxuXHJcbiAgcHVibGljIG9yaWdpbmFsTWF0cml4OiBNYXRyaXgzO1xyXG5cclxuICAvLyBSZXF1aXJlZCBpbnRlcm5hbC1waHlzaWNzLXN0ZXAgcHJvcGVydGllcyB0aGF0IHNob3VsZCBiZSBzZXQgYnkgc3VidHlwZXMgaW5cclxuICAvLyB1cGRhdGVTdGVwSW5mb3JtYXRpb24oKS4gVGhlcmUgbWF5IGV4aXN0IG1vcmUgc2V0IGJ5IHRoZSBzdWJ0eXBlICh0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZS5nLiB2b2x1bWUvYXJlYVxyXG4gIC8vIGNhbGN1bGF0aW9ucykuIFRoZXNlIGFyZSB1cGRhdGVkIG1vcmUgb2Z0ZW4gdGhhbiBzaW11bGF0aW9uIHN0ZXBzLiBUaGVzZSBzcGVjaWZpYyB2YWx1ZXMgd2lsbCBiZSB1c2VkIGJ5IGV4dGVybmFsXHJcbiAgLy8gY29kZSBmb3IgZGV0ZXJtaW5pbmcgbGlxdWlkIGhlaWdodC5cclxuICBwdWJsaWMgc3RlcFg6IG51bWJlcjsgLy8geC12YWx1ZSBvZiB0aGUgcG9zaXRpb25cclxuICBwdWJsaWMgc3RlcEJvdHRvbTogbnVtYmVyOyAvLyBtaW5pbXVtIHkgdmFsdWUgb2YgdGhlIG1hc3NcclxuICBwdWJsaWMgc3RlcFRvcDogbnVtYmVyOyAvLyBtYXhpbXVtIHkgdmFsdWUgb2YgdGhlIG1hc3NcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBlbmdpbmU6IFBoeXNpY3NFbmdpbmUsIHByb3ZpZGVkQ29uZmlnOiBNYXNzT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBjb25maWcgPSBvcHRpb25pemU8TWFzc09wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcbiAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgIG1hdHJpeDogbmV3IE1hdHJpeDMoKSxcclxuICAgICAgY2FuUm90YXRlOiBmYWxzZSxcclxuICAgICAgY2FuTW92ZTogdHJ1ZSxcclxuICAgICAgYWRqdXN0YWJsZU1hdGVyaWFsOiBmYWxzZSxcclxuICAgICAgdGFnOiBNYXNzVGFnLk5PTkUsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMLFxyXG4gICAgICBwaGV0aW9UeXBlOiBNYXNzLk1hc3NJTyxcclxuICAgICAgaW5wdXRFbmFibGVkUHJvcGVydHlPcHRpb25zOiB7fSxcclxuICAgICAgbWF0ZXJpYWxQcm9wZXJ0eU9wdGlvbnM6IHt9LFxyXG4gICAgICB2b2x1bWVQcm9wZXJ0eU9wdGlvbnM6IHt9LFxyXG4gICAgICBtYXNzUHJvcGVydHlPcHRpb25zOiB7fSxcclxuXHJcbiAgICAgIG1pblZvbHVtZTogMCxcclxuICAgICAgbWF4Vm9sdW1lOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcclxuICAgIH0sIHByb3ZpZGVkQ29uZmlnICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLmJvZHksICdjb25maWcuYm9keSByZXF1aXJlZCcgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbmZpZy5zaGFwZSBpbnN0YW5jZW9mIFNoYXBlLCAnY29uZmlnLnNoYXBlIHJlcXVpcmVkIGFzIGEgU2hhcGUnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb25maWcubWF0ZXJpYWwgaW5zdGFuY2VvZiBNYXRlcmlhbCwgJ2NvbmZpZy5tYXRlcmlhbCByZXF1aXJlZCBhcyBhIE1hdGVyaWFsJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggY29uZmlnLnZvbHVtZSA+IDAsICdub24temVybyBjb25maWcudm9sdW1lIHJlcXVpcmVkJyApO1xyXG5cclxuICAgIHN1cGVyKCBjb25maWcgKTtcclxuXHJcbiAgICBjb25zdCB0YW5kZW0gPSBjb25maWcudGFuZGVtO1xyXG5cclxuICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xyXG4gICAgdGhpcy5ib2R5ID0gY29uZmlnLmJvZHk7XHJcbiAgICB0aGlzLm1hc3NTaGFwZSA9IGNvbmZpZy5tYXNzU2hhcGU7XHJcblxyXG4gICAgdGhpcy5zaGFwZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBjb25maWcuc2hhcGUsIHtcclxuICAgICAgdmFsdWVUeXBlOiBTaGFwZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3VzZXJDb250cm9sbGVkUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5pbnB1dEVuYWJsZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIGNvbWJpbmVPcHRpb25zPEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnM+KCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lucHV0RW5hYmxlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnU2V0cyB3aGV0aGVyIHRoZSBlbGVtZW50IHdpbGwgaGF2ZSBpbnB1dCBlbmFibGVkLCBhbmQgaGVuY2UgYmUgaW50ZXJhY3RpdmUnXHJcbiAgICB9LCBjb25maWcuaW5wdXRFbmFibGVkUHJvcGVydHlPcHRpb25zICkgKTtcclxuXHJcbiAgICB0aGlzLmludGVybmFsVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggY29uZmlnLnZpc2libGUsIHtcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3R1ZGlvVmlzaWJsZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggdHJ1ZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnZpc2libGVQcm9wZXJ0eSA9IERlcml2ZWRQcm9wZXJ0eS5hbmQoIFsgdGhpcy5pbnRlcm5hbFZpc2libGVQcm9wZXJ0eSwgdGhpcy5zdHVkaW9WaXNpYmxlUHJvcGVydHkgXSwge1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tYXRlcmlhbFByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBjb25maWcubWF0ZXJpYWwsIGNvbWJpbmVPcHRpb25zPFByb3BlcnR5T3B0aW9uczxNYXRlcmlhbD4+KCB7XHJcbiAgICAgIHZhbHVlVHlwZTogTWF0ZXJpYWwsXHJcbiAgICAgIHJlZW50cmFudDogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbWF0ZXJpYWxQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBNYXRlcmlhbC5NYXRlcmlhbElPXHJcbiAgICB9LCBjb25maWcubWF0ZXJpYWxQcm9wZXJ0eU9wdGlvbnMgKSApO1xyXG5cclxuICAgIGlmICggY29uZmlnLmFkanVzdGFibGVNYXRlcmlhbCApIHtcclxuICAgICAgdGhpcy5tYXRlcmlhbEVudW1Qcm9wZXJ0eSA9IG5ldyBFbnVtZXJhdGlvblByb3BlcnR5KCBtYXRlcmlhbFRvRW51bSggY29uZmlnLm1hdGVyaWFsICksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXRlcmlhbEVudW1Qcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnQ3VycmVudCBtYXRlcmlhbCBvZiB0aGUgYmxvY2suIENoYW5naW5nIHRoZSBtYXRlcmlhbCB3aWxsIHJlc3VsdCBpbiBjaGFuZ2VzIHRvIHRoZSBtYXNzLCBidXQgdGhlIHZvbHVtZSB3aWxsIHJlbWFpbiB0aGUgc2FtZS4nXHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5jdXN0b21EZW5zaXR5UHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIGNvbmZpZy5tYXRlcmlhbC5kZW5zaXR5LCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY3VzdG9tRGVuc2l0eVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdEZW5zaXR5IG9mIHRoZSBibG9jayB3aGVuIHRoZSBtYXRlcmlhbCBpcyBzZXQgdG8g4oCcQ1VTVE9N4oCdLicsXHJcbiAgICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMTUwLCAyMzAwMCApLFxyXG4gICAgICAgIHVuaXRzOiAna2cvbV4zJ1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHRoaXMuY3VzdG9tQ29sb3JQcm9wZXJ0eSA9IG5ldyBDb2xvclByb3BlcnR5KCBjb25maWcubWF0ZXJpYWwuY3VzdG9tQ29sb3IgPyBjb25maWcubWF0ZXJpYWwuY3VzdG9tQ29sb3IudmFsdWUgOiBDb2xvci5XSElURSwge1xyXG4gICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2N1c3RvbUNvbG9yUHJvcGVydHknIClcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgdGhpcy5tYXRlcmlhbFByb3BlcnR5LmFkZFBoZXRpb1N0YXRlRGVwZW5kZW5jaWVzKCBbIHRoaXMubWF0ZXJpYWxFbnVtUHJvcGVydHksIHRoaXMuY3VzdG9tRGVuc2l0eVByb3BlcnR5LCB0aGlzLmN1c3RvbUNvbG9yUHJvcGVydHkgXSApO1xyXG5cclxuICAgICAgLy8gSG9vayB1cCBwaGV0LWlvIFByb3BlcnRpZXMgZm9yIGludGVyb3BlcmF0aW9uIHdpdGggdGhlIG5vcm1hbCBvbmVzXHJcbiAgICAgIGxldCBlbnVtTG9jayA9IGZhbHNlO1xyXG4gICAgICBsZXQgZGVuc2l0eUxvY2sgPSBmYWxzZTtcclxuICAgICAgbGV0IGNvbG9yTG9jayA9IGZhbHNlO1xyXG4gICAgICBjb25zdCBjb2xvckxpc3RlbmVyID0gKCBjb2xvcjogQ29sb3IgKSA9PiB7XHJcbiAgICAgICAgaWYgKCAhY29sb3JMb2NrICkge1xyXG4gICAgICAgICAgY29sb3JMb2NrID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuY3VzdG9tQ29sb3JQcm9wZXJ0eSEudmFsdWUgPSBjb2xvcjtcclxuICAgICAgICAgIGNvbG9yTG9jayA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgdGhpcy5tYXRlcmlhbFByb3BlcnR5LmxpbmsoICggbWF0ZXJpYWwsIG9sZE1hdGVyaWFsICkgPT4ge1xyXG4gICAgICAgIGlmICggIWVudW1Mb2NrICkge1xyXG4gICAgICAgICAgZW51bUxvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5tYXRlcmlhbEVudW1Qcm9wZXJ0eSEudmFsdWUgPSBtYXRlcmlhbFRvRW51bSggbWF0ZXJpYWwgKTtcclxuICAgICAgICAgIGVudW1Mb2NrID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggIWRlbnNpdHlMb2NrICkge1xyXG4gICAgICAgICAgZGVuc2l0eUxvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgdGhpcy5jdXN0b21EZW5zaXR5UHJvcGVydHkhLnZhbHVlID0gbWF0ZXJpYWwuZGVuc2l0eTtcclxuICAgICAgICAgIGRlbnNpdHlMb2NrID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggb2xkTWF0ZXJpYWwgJiYgb2xkTWF0ZXJpYWwuY3VzdG9tQ29sb3IgKSB7XHJcbiAgICAgICAgICBvbGRNYXRlcmlhbC5jdXN0b21Db2xvci51bmxpbmsoIGNvbG9yTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBtYXRlcmlhbCAmJiBtYXRlcmlhbC5jdXN0b21Db2xvciApIHtcclxuICAgICAgICAgIG1hdGVyaWFsLmN1c3RvbUNvbG9yLmxpbmsoIGNvbG9yTGlzdGVuZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgTXVsdGlsaW5rLmxhenlNdWx0aWxpbmsoIFsgdGhpcy5tYXRlcmlhbEVudW1Qcm9wZXJ0eSwgdGhpcy5jdXN0b21EZW5zaXR5UHJvcGVydHksIHRoaXMuY3VzdG9tQ29sb3JQcm9wZXJ0eSBdLCAoIG1hdGVyaWFsRW51bSwgZGVuc2l0eSwgY29sb3IgKSA9PiB7XHJcbiAgICAgICAgLy8gU2VlIGlmIGl0J3MgYW4gZXh0ZXJuYWwgY2hhbmdlXHJcbiAgICAgICAgaWYgKCAhZW51bUxvY2sgJiYgIWRlbnNpdHlMb2NrICYmICFjb2xvckxvY2sgKSB7XHJcbiAgICAgICAgICBlbnVtTG9jayA9IHRydWU7XHJcbiAgICAgICAgICBkZW5zaXR5TG9jayA9IHRydWU7XHJcbiAgICAgICAgICBjb2xvckxvY2sgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKCBtYXRlcmlhbEVudW0gPT09IE1hdGVyaWFsRW51bWVyYXRpb24uQ1VTVE9NICkge1xyXG4gICAgICAgICAgICB0aGlzLm1hdGVyaWFsUHJvcGVydHkudmFsdWUgPSBNYXRlcmlhbC5jcmVhdGVDdXN0b21Tb2xpZE1hdGVyaWFsKCB7XHJcbiAgICAgICAgICAgICAgZGVuc2l0eTogdGhpcy5jdXN0b21EZW5zaXR5UHJvcGVydHkhLnZhbHVlLFxyXG4gICAgICAgICAgICAgIGN1c3RvbUNvbG9yOiB0aGlzLmN1c3RvbUNvbG9yUHJvcGVydHlcclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZSA9IE1hdGVyaWFsWyBtYXRlcmlhbEVudW0ubmFtZSBhcyBNYXRlcmlhbE5vbkN1c3RvbUlkZW50aWZpZXIgXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVudW1Mb2NrID0gZmFsc2U7XHJcbiAgICAgICAgICBkZW5zaXR5TG9jayA9IGZhbHNlO1xyXG4gICAgICAgICAgY29sb3JMb2NrID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy52b2x1bWVMb2NrID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy52b2x1bWVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggY29uZmlnLnZvbHVtZSwgY29tYmluZU9wdGlvbnM8TnVtYmVyUHJvcGVydHlPcHRpb25zPigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2b2x1bWVQcm9wZXJ0eScgKSxcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggY29uZmlnLm1pblZvbHVtZSwgY29uZmlnLm1heFZvbHVtZSApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0N1cnJlbnQgdm9sdW1lIG9mIHRoZSBibG9jay4gQ2hhbmdpbmcgdGhlIHZvbHVtZSB3aWxsIHJlc3VsdCBpbiBjaGFuZ2VzIHRvIHRoZSBtYXNzLCBidXQgd2lsbCBub3QgY2hhbmdlIHRoZSBtYXRlcmlhbCBvciBkZW5zaXR5LicsXHJcbiAgICAgIHVuaXRzOiAnbV4zJyxcclxuICAgICAgcmVlbnRyYW50OiB0cnVlXHJcbiAgICB9LCBjb25maWcudm9sdW1lUHJvcGVydHlPcHRpb25zICkgKTtcclxuXHJcbiAgICB0aGlzLmNvbnRhaW5lZE1hc3NQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCAwLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubWFzc0xvY2sgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLm1hc3NQcm9wZXJ0eSA9IG5ldyBHdWFyZGVkTnVtYmVyUHJvcGVydHkoIHRoaXMubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZS5kZW5zaXR5ICogdGhpcy52b2x1bWVQcm9wZXJ0eS52YWx1ZSArIHRoaXMuY29udGFpbmVkTWFzc1Byb3BlcnR5LnZhbHVlLCBjb21iaW5lT3B0aW9uczxHdWFyZGVkTnVtYmVyUHJvcGVydHlPcHRpb25zPigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXNzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2UsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdDdXJyZW50IG1hc3Mgb2YgdGhlIGJsb2NrLiBDaGFuZ2luZyB0aGUgbWFzcyB3aWxsIHJlc3VsdCBpbiBjaGFuZ2VzIHRvIHRoZSB2b2x1bWUgKEludHJvIGFuZCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ015c3RlcnkgU2NyZWVucykgb3IgZGVuc2l0eSAoQ29tcGFyZSBTY3JlZW4pLiBTaW5jZSB0aGUgdm9sdW1lIGlzIGNvbXB1dGVkIGFzIGEgZnVuY3Rpb24gb2YgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICd0aGUgbWFzcywgeW91IGNhbiBvbmx5IHNldCBhIG1hc3MgdGhhdCB3aWxsIGtlZXAgdGhlIHZvbHVtZSBpbiByYW5nZS4nLFxyXG4gICAgICB1bml0czogJ2tnJyxcclxuICAgICAgcmVlbnRyYW50OiB0cnVlLFxyXG4gICAgICByYW5nZTogbmV3IFJhbmdlKCBOdW1iZXIuTUlOX1ZBTFVFLCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgKSxcclxuXHJcbiAgICAgIGdldFBoZXRpb1NwZWNpZmljVmFsaWRhdGlvbkVycm9yOiBwcm9wb3NlZE1hc3MgPT4ge1xyXG5cclxuICAgICAgICAvLyBkZW5zaXR5ID0gbWFzcy8gdm9sdW1lXHJcbiAgICAgICAgY29uc3QgcHJvcG9zZWRWb2x1bWUgPSBwcm9wb3NlZE1hc3MgLyB0aGlzLm1hdGVyaWFsUHJvcGVydHkudmFsdWUuZGVuc2l0eTtcclxuICAgICAgICBjb25zdCBpc1Byb3Bvc2VkVm9sdW1lSW5SYW5nZSA9IHRoaXMudm9sdW1lUHJvcGVydHkucmFuZ2UuY29udGFpbnMoIHByb3Bvc2VkVm9sdW1lICk7XHJcblxyXG4gICAgICAgIGNvbnN0IG1heEFsbG93ZWRNYXNzID0gdGhpcy5tYXRlcmlhbFByb3BlcnR5LnZhbHVlLmRlbnNpdHkgKiB0aGlzLnZvbHVtZVByb3BlcnR5LnJhbmdlLm1heDtcclxuICAgICAgICBjb25zdCBtaW5BbGxvd2VkTWFzcyA9IHRoaXMubWF0ZXJpYWxQcm9wZXJ0eS52YWx1ZS5kZW5zaXR5ICogdGhpcy52b2x1bWVQcm9wZXJ0eS5yYW5nZS5taW47XHJcblxyXG4gICAgICAgIHJldHVybiBpc1Byb3Bvc2VkVm9sdW1lSW5SYW5nZSA/IG51bGwgOlxyXG4gICAgICAgICAgICAgICBgVGhlIHByb3Bvc2VkIG1hc3MgJHtwcm9wb3NlZE1hc3N9IGtnIHdvdWxkIHJlc3VsdCBpbiBhIHZvbHVtZSAke3Byb3Bvc2VkVm9sdW1lfSBtXjMgdGhhdCBpcyBvdXQgb2YgcmFuZ2UuIEF0IHRoZSBjdXJyZW50IGRlbnNpdHksIHRoZSBhbGxvd2VkIHJhbmdlIGlzIFske21pbkFsbG93ZWRNYXNzfSwgJHttYXhBbGxvd2VkTWFzc31dIGtnLmA7XHJcbiAgICAgIH1cclxuICAgIH0sIGNvbmZpZy5tYXNzUHJvcGVydHlPcHRpb25zICkgKTtcclxuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMubWF0ZXJpYWxQcm9wZXJ0eSwgdGhpcy52b2x1bWVQcm9wZXJ0eSwgdGhpcy5jb250YWluZWRNYXNzUHJvcGVydHkgXSwgKCBtYXRlcmlhbCwgdm9sdW1lLCBjb250YWluZWRNYXNzICkgPT4ge1xyXG4gICAgICB0aGlzLm1hc3NMb2NrID0gdHJ1ZTtcclxuICAgICAgdGhpcy5tYXNzUHJvcGVydHkudmFsdWUgPSBtYXRlcmlhbC5kZW5zaXR5ICogdm9sdW1lICsgY29udGFpbmVkTWFzcztcclxuICAgICAgdGhpcy5tYXNzTG9jayA9IGZhbHNlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYm9keU9mZnNldFByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmdyYXZpdHlGb3JjZUludGVycG9sYXRlZFByb3BlcnR5ID0gbmV3IEludGVycG9sYXRlZFByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgaW50ZXJwb2xhdGU6IEludGVycG9sYXRlZFByb3BlcnR5LmludGVycG9sYXRlVmVjdG9yMixcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXZpdHlGb3JjZUludGVycG9sYXRlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFZlY3RvcjIuVmVjdG9yMklPLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdW5pdHM6ICdOJyxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYnVveWFuY3lGb3JjZUludGVycG9sYXRlZFByb3BlcnR5ID0gbmV3IEludGVycG9sYXRlZFByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgaW50ZXJwb2xhdGU6IEludGVycG9sYXRlZFByb3BlcnR5LmludGVycG9sYXRlVmVjdG9yMixcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1b3lhbmN5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBWZWN0b3IyLlZlY3RvcjJJTyxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHVuaXRzOiAnTicsXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmNvbnRhY3RGb3JjZUludGVycG9sYXRlZFByb3BlcnR5ID0gbmV3IEludGVycG9sYXRlZFByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgaW50ZXJwb2xhdGU6IEludGVycG9sYXRlZFByb3BlcnR5LmludGVycG9sYXRlVmVjdG9yMixcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2NvbnRhY3RGb3JjZUludGVycG9sYXRlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9WYWx1ZVR5cGU6IFZlY3RvcjIuVmVjdG9yMklPLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgdW5pdHM6ICdOJyxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZm9yY2VPZmZzZXRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggVmVjdG9yMy5aRVJPLCB7XHJcbiAgICAgIHZhbHVlVHlwZTogVmVjdG9yMyxcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1hc3NPZmZzZXRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggVmVjdG9yMy5aRVJPLCB7XHJcbiAgICAgIHZhbHVlVHlwZTogVmVjdG9yMyxcclxuICAgICAgdmFsdWVDb21wYXJpc29uU3RyYXRlZ3k6ICdlcXVhbHNGdW5jdGlvbicsXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVRcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1hc3NPZmZzZXRPcmllbnRhdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggVmVjdG9yMi5aRVJPLCB7XHJcbiAgICAgIHZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5OiAnZXF1YWxzRnVuY3Rpb24nLFxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tYXRyaXggPSBjb25maWcubWF0cml4O1xyXG4gICAgdGhpcy5zdGVwTWF0cml4ID0gbmV3IE1hdHJpeDMoKTtcclxuXHJcbiAgICB0aGlzLnRyYW5zZm9ybWVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcbiAgICB0aGlzLmludGVycnVwdGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5jYW5Sb3RhdGUgPSBjb25maWcuY2FuUm90YXRlO1xyXG4gICAgdGhpcy5jYW5Nb3ZlID0gY29uZmlnLmNhbk1vdmU7XHJcbiAgICB0aGlzLnRhZyA9IGNvbmZpZy50YWc7XHJcblxyXG4gICAgdGhpcy5uYW1lUHJvcGVydHkgPSBibG9ja1N0cmluZ01hcFsgY29uZmlnLnRhZy5uYW1lIF0gfHwgbmV3IFRpbnlQcm9wZXJ0eSggJycgKTtcclxuICAgIGlmICggYmxvY2tTdHJpbmdNYXBbIGNvbmZpZy50YWcubmFtZSBdICkge1xyXG4gICAgICB0aGlzLmFkZExpbmtlZEVsZW1lbnQoIHRoaXMubmFtZVByb3BlcnR5IGFzIFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwge1xyXG4gICAgICAgIHRhbmRlbTogY29uZmlnLnRhbmRlbS5jcmVhdGVUYW5kZW0oICduYW1lUHJvcGVydHknIClcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY29udGFpbmluZ0Jhc2luID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLm9yaWdpbmFsTWF0cml4ID0gdGhpcy5tYXRyaXguY29weSgpO1xyXG5cclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoIFtcclxuICAgICAgdGhpcy5zaGFwZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLm1hc3NQcm9wZXJ0eVxyXG4gICAgXSwgKCkgPT4ge1xyXG4gICAgICAvLyBEb24ndCBhbGxvdyBhIGZ1bGx5LXplcm8gdmFsdWUgZm9yIHRoZSBwaHlzaWNzIGVuZ2luZXNcclxuICAgICAgZW5naW5lLmJvZHlTZXRNYXNzKCB0aGlzLmJvZHksIE1hdGgubWF4KCB0aGlzLm1hc3NQcm9wZXJ0eS52YWx1ZSwgMC4wMSApLCB7XHJcbiAgICAgICAgY2FuUm90YXRlOiBjb25maWcuY2FuUm90YXRlXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLndyaXRlRGF0YSgpO1xyXG4gICAgdGhpcy5lbmdpbmUuYm9keVN5bmNocm9uaXplUHJldmlvdXMoIHRoaXMuYm9keSApO1xyXG5cclxuICAgIC8vIChyZWFkLW9ubHkpIHtudW1iZXJ9IC0gUmVxdWlyZWQgaW50ZXJuYWwtcGh5c2ljcy1zdGVwIHByb3BlcnRpZXMgdGhhdCBzaG91bGQgYmUgc2V0IGJ5IHN1YnR5cGVzIGluXHJcbiAgICAvLyB1cGRhdGVTdGVwSW5mb3JtYXRpb24oKS4gVGhlcmUgbWF5IGV4aXN0IG1vcmUgc2V0IGJ5IHRoZSBzdWJ0eXBlICh0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZS5nLiB2b2x1bWUvYXJlYVxyXG4gICAgLy8gY2FsY3VsYXRpb25zKS4gVGhlc2UgYXJlIHVwZGF0ZWQgbW9yZSBvZnRlbiB0aGFuIHNpbXVsYXRpb24gc3RlcHMuIFRoZXNlIHNwZWNpZmljIHZhbHVlcyB3aWxsIGJlIHVzZWQgYnkgZXh0ZXJuYWxcclxuICAgIC8vIGNvZGUgZm9yIGRldGVybWluaW5nIGxpcXVpZCBoZWlnaHQuXHJcbiAgICB0aGlzLnN0ZXBYID0gMDsgLy8geC12YWx1ZSBvZiB0aGUgcG9zaXRpb25cclxuICAgIHRoaXMuc3RlcEJvdHRvbSA9IDA7IC8vIG1pbmltdW0geSB2YWx1ZSBvZiB0aGUgbWFzc1xyXG4gICAgdGhpcy5zdGVwVG9wID0gMDsgLy8gbWF4bWltdW0geSB2YWx1ZSBvZiB0aGUgbWFzc1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoaXMgaXMgYSBib2F0IChhcyBtb3JlIGNvbXBsaWNhdGVkIGhhbmRsaW5nIGlzIG5lZWRlZCBpbiB0aGlzIGNhc2UpLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBpc0JvYXQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjcm9zcy1zZWN0aW9uYWwgYXJlYSBvZiB0aGlzIG9iamVjdCBhdCBhIGdpdmVuIHkgbGV2ZWwuXHJcbiAgICovXHJcbiAgcHVibGljIGFic3RyYWN0IGdldERpc3BsYWNlZEFyZWEoIGxpcXVpZExldmVsOiBudW1iZXIgKTogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjdW11bGF0aXZlIGRpc3BsYWNlZCB2b2x1bWUgb2YgdGhpcyBvYmplY3QgdXAgdG8gYSBnaXZlbiB5IGxldmVsLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhYnN0cmFjdCBnZXREaXNwbGFjZWRWb2x1bWUoIGxpcXVpZExldmVsOiBudW1iZXIgKTogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHRoZSBjdXJyZW50IGxvY2F0aW9uIHRvIGJlIHRoZSBwcm9wZXIgcG9zaXRpb24gZm9yIHRoZSBtYXNzIHdoZW4gaXQgaXMgcmVzZXQuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFJlc2V0TG9jYXRpb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLm9yaWdpbmFsTWF0cml4ID0gdGhpcy5tYXRyaXguY29weSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVhZHMgdHJhbnNmb3JtL3ZlbG9jaXR5IGZyb20gdGhlIHBoeXNpY3MgbW9kZWwgZW5naW5lLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcmVhZERhdGEoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuZ2luZS5ib2R5R2V0TWF0cml4VHJhbnNmb3JtKCB0aGlzLmJvZHksIHRoaXMubWF0cml4ICk7XHJcblxyXG4gICAgLy8gQXBwbHkgdGhlIGJvZHkgb2Zmc2V0XHJcbiAgICB0aGlzLm1hdHJpeC5zZXQwMiggdGhpcy5tYXRyaXgubTAyKCkgKyB0aGlzLmJvZHlPZmZzZXRQcm9wZXJ0eS52YWx1ZS54ICk7XHJcbiAgICB0aGlzLm1hdHJpeC5zZXQxMiggdGhpcy5tYXRyaXgubTEyKCkgKyB0aGlzLmJvZHlPZmZzZXRQcm9wZXJ0eS52YWx1ZS55ICk7XHJcblxyXG4gICAgdGhpcy50cmFuc2Zvcm1lZEVtaXR0ZXIuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV3JpdGVzIHBvc2l0aW9uL3ZlbG9jaXR5L2V0Yy4gdG8gdGhlIHBoeXNpY3MgbW9kZWwgZW5naW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB3cml0ZURhdGEoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuZ2luZS5ib2R5U2V0UG9zaXRpb24oIHRoaXMuYm9keSwgdGhpcy5tYXRyaXgudHJhbnNsYXRpb24ubWludXMoIHRoaXMuYm9keU9mZnNldFByb3BlcnR5LnZhbHVlICkgKTtcclxuICAgIHRoaXMuZW5naW5lLmJvZHlTZXRSb3RhdGlvbiggdGhpcy5ib2R5LCB0aGlzLm1hdHJpeC5yb3RhdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnRzIGEgcGh5c2ljcyBtb2RlbCBlbmdpbmUgZHJhZyBhdCB0aGUgZ2l2ZW4gMmQgKHgseSkgbW9kZWwgcG9zaXRpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXJ0RHJhZyggcG9zaXRpb246IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgdGhpcy5lbmdpbmUuYWRkUG9pbnRlckNvbnN0cmFpbnQoIHRoaXMuYm9keSwgcG9zaXRpb24gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgYSBjdXJyZW50IGRyYWcgd2l0aCBhIG5ldyAyZCAoeCx5KSBtb2RlbCBwb3NpdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlRHJhZyggcG9zaXRpb246IFZlY3RvcjIgKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuZ2luZS51cGRhdGVQb2ludGVyQ29uc3RyYWludCggdGhpcy5ib2R5LCBwb3NpdGlvbiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW5kcyBhIHBoeXNpY3MgbW9kZWwgZW5naW5lIGRyYWcuXHJcbiAgICovXHJcbiAgcHVibGljIGVuZERyYWcoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuZ2luZS5yZW1vdmVQb2ludGVyQ29uc3RyYWludCggdGhpcy5ib2R5ICk7XHJcbiAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGdlbmVyYWwgc2l6ZSBvZiB0aGUgbWFzcyBiYXNlZCBvbiBhIGdlbmVyYWwgc2l6ZSBzY2FsZS5cclxuICAgKi9cclxuICBwdWJsaWMgYWJzdHJhY3Qgc2V0UmF0aW9zKCB3aWR0aFJhdGlvOiBudW1iZXIsIGhlaWdodFJhdGlvOiBudW1iZXIgKTogdm9pZDtcclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGFmdGVyIGEgZW5naW5lLXBoeXNpY3MtbW9kZWwgc3RlcCBvbmNlIGJlZm9yZSBkb2luZyBvdGhlciBvcGVyYXRpb25zIChsaWtlIGNvbXB1dGluZyBidW95YW50IGZvcmNlcyxcclxuICAgKiBkaXNwbGFjZW1lbnQsIGV0Yy4pIHNvIHRoYXQgaXQgY2FuIHNldCBoaWdoLXBlcmZvcm1hbmNlIGZsYWdzIHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cclxuICAgKlxyXG4gICAqIFR5cGUtc3BlY2lmaWMgdmFsdWVzIGFyZSBsaWtlbHkgdG8gYmUgc2V0LCBidXQgdGhpcyBzaG91bGQgc2V0IGF0IGxlYXN0IHN0ZXBYL3N0ZXBCb3R0b20vc3RlcFRvcCAoYXMgdGhvc2UgYXJlXHJcbiAgICogdXNlZCBmb3IgZGV0ZXJtaW5pbmcgYmFzaW4gdm9sdW1lcyBhbmQgY3Jvc3Mgc2VjdGlvbnMpXHJcbiAgICovXHJcbiAgcHVibGljIHVwZGF0ZVN0ZXBJbmZvcm1hdGlvbigpOiB2b2lkIHtcclxuICAgIHRoaXMuZW5naW5lLmJvZHlHZXRTdGVwTWF0cml4VHJhbnNmb3JtKCB0aGlzLmJvZHksIHRoaXMuc3RlcE1hdHJpeCApO1xyXG5cclxuICAgIC8vIEFwcGx5IHRoZSBib2R5IG9mZnNldFxyXG4gICAgdGhpcy5zdGVwTWF0cml4LnNldDAyKCB0aGlzLnN0ZXBNYXRyaXgubTAyKCkgKyB0aGlzLmJvZHlPZmZzZXRQcm9wZXJ0eS52YWx1ZS54ICk7XHJcbiAgICB0aGlzLnN0ZXBNYXRyaXguc2V0MTIoIHRoaXMuc3RlcE1hdHJpeC5tMTIoKSArIHRoaXMuYm9keU9mZnNldFByb3BlcnR5LnZhbHVlLnkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElmIHRoZXJlIGlzIGFuIGludGVyc2VjdGlvbiB3aXRoIHRoZSByYXkgYW5kIHRoaXMgbWFzcywgdGhlIHQtdmFsdWUgKGRpc3RhbmNlIHRoZSByYXkgd291bGQgbmVlZCB0byB0cmF2ZWwgdG9cclxuICAgKiByZWFjaCB0aGUgaW50ZXJzZWN0aW9uLCBlLmcuIHJheS5wb3NpdGlvbiArIHJheS5kaXN0YW5jZSAqIHQgPT09IGludGVyc2VjdGlvblBvaW50KSB3aWxsIGJlIHJldHVybmVkLiBPdGhlcndpc2VcclxuICAgKiBpZiB0aGVyZSBpcyBubyBpbnRlcnNlY3Rpb24sIG51bGwgd2lsbCBiZSByZXR1cm5lZC5cclxuICAgKi9cclxuICBwdWJsaWMgaW50ZXJzZWN0KCByYXk6IFJheTMsIGlzVG91Y2g6IGJvb2xlYW4gKTogbnVtYmVyIHwgbnVsbCB7XHJcbiAgICAvLyBUT0RPOiBzaG91bGQgdGhpcyBiZSBhYnN0cmFjdFxyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGVwcyBmb3J3YXJkIGluIHRpbWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZHQgLSBJbiBzZWNvbmRzXHJcbiAgICogQHBhcmFtIGludGVycG9sYXRpb25SYXRpb1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyLCBpbnRlcnBvbGF0aW9uUmF0aW86IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMucmVhZERhdGEoKTtcclxuXHJcbiAgICB0aGlzLnRyYW5zZm9ybWVkRW1pdHRlci5lbWl0KCk7XHJcblxyXG4gICAgdGhpcy5jb250YWN0Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5zZXRSYXRpbyggaW50ZXJwb2xhdGlvblJhdGlvICk7XHJcbiAgICB0aGlzLmJ1b3lhbmN5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5zZXRSYXRpbyggaW50ZXJwb2xhdGlvblJhdGlvICk7XHJcbiAgICB0aGlzLmdyYXZpdHlGb3JjZUludGVycG9sYXRlZFByb3BlcnR5LnNldFJhdGlvKCBpbnRlcnBvbGF0aW9uUmF0aW8gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIHRoZSBtYXNzIHRvIGl0cyBpbml0aWFsIHBvc2l0aW9uXHJcbiAgICovXHJcbiAgcHVibGljIHJlc2V0UG9zaXRpb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLm1hdHJpeC5zZXQoIHRoaXMub3JpZ2luYWxNYXRyaXggKTtcclxuICAgIHRoaXMud3JpdGVEYXRhKCk7XHJcbiAgICB0aGlzLmVuZ2luZS5ib2R5U3luY2hyb25pemVQcmV2aW91cyggdGhpcy5ib2R5ICk7XHJcbiAgICB0aGlzLnRyYW5zZm9ybWVkRW1pdHRlci5lbWl0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhpbmdzIHRvIHRoZWlyIG9yaWdpbmFsIHZhbHVlcy5cclxuICAgKi9cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmVuZ2luZS5ib2R5UmVzZXRIaWRkZW4oIHRoaXMuYm9keSApO1xyXG5cclxuICAgIHRoaXMuaW50ZXJuYWxWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hhcGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5tYXRlcmlhbFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnZvbHVtZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmNvbnRhaW5lZE1hc3NQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LnJlc2V0KCk7XHJcblxyXG4gICAgdGhpcy5ncmF2aXR5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5idW95YW5jeUZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuY29udGFjdEZvcmNlSW50ZXJwb2xhdGVkUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAvLyBOT1RFOiBOT1QgcmVzZXR0aW5nIGJvZHlPZmZzZXRQcm9wZXJ0eS9mb3JjZU9mZnNldFByb3BlcnR5L21hc3NPZmZzZXRQcm9wZXJ0eS9tYXNzT2Zmc2V0T3JpZW50YXRpb25Qcm9wZXJ0eSBvblxyXG4gICAgLy8gcHVycG9zZSwgaXQgd2lsbCBiZSBhZGp1c3RlZCBieSBzdWJ0eXBlcyB3aGVuZXZlciBuZWNlc3NhcnksIGFuZCBhIHJlc2V0IG1heSBicmVhayB0aGluZ3MgaGVyZS5cclxuXHJcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2VzIHJlZmVyZW5jZXNcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkICk7XHJcblxyXG4gICAgdGhpcy51c2VyQ29udHJvbGxlZFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMuaW5wdXRFbmFibGVkUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5zdHVkaW9WaXNpYmxlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5tYXRlcmlhbFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIHRoaXMudm9sdW1lUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5tYXNzUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5uYW1lUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy5ncmF2aXR5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmJ1b3lhbmN5Rm9yY2VJbnRlcnBvbGF0ZWRQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzLmNvbnRhY3RGb3JjZUludGVycG9sYXRlZFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIGxpc3Qgb2YgdmFsdWVzIGFuZCBhIHJhdGlvIGZyb20gMCAodGhlIHN0YXJ0KSB0byAxICh0aGUgZW5kKSwgcmV0dXJuIGFuIGludGVycG9sYXRlZCB2YWx1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGV2YWx1YXRlUGllY2V3aXNlTGluZWFyKCB2YWx1ZXM6IG51bWJlcltdLCByYXRpbzogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBjb25zdCBsb2dpY2FsSW5kZXggPSByYXRpbyAqICggdmFsdWVzLmxlbmd0aCAtIDEgKTtcclxuICAgIGlmICggbG9naWNhbEluZGV4ICUgMSA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIHZhbHVlc1sgbG9naWNhbEluZGV4IF07XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgYSA9IHZhbHVlc1sgTWF0aC5mbG9vciggbG9naWNhbEluZGV4ICkgXTtcclxuICAgICAgY29uc3QgYiA9IHZhbHVlc1sgTWF0aC5jZWlsKCBsb2dpY2FsSW5kZXggKSBdO1xyXG4gICAgICByZXR1cm4gVXRpbHMubGluZWFyKCBNYXRoLmZsb29yKCBsb2dpY2FsSW5kZXggKSwgTWF0aC5jZWlsKCBsb2dpY2FsSW5kZXggKSwgYSwgYiwgbG9naWNhbEluZGV4ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1hc3NJTyA9IG5ldyBJT1R5cGU8TWFzcywgTWFzc0lPU3RhdGVPYmplY3Q+KCAnTWFzc0lPJywge1xyXG4gICAgdmFsdWVUeXBlOiBNYXNzLFxyXG4gICAgZG9jdW1lbnRhdGlvbjogJ1JlcHJlc2VudHMgYSBtYXNzIHRoYXQgaW50ZXJhY3RzIGluIHRoZSBzY2VuZSwgYW5kIGNhbiBwb3RlbnRpYWxseSBmbG9hdCBvciBkaXNwbGFjZSBsaXF1aWQuJyxcclxuICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgIG1hdHJpeDogTWF0cml4My5NYXRyaXgzSU8sXHJcbiAgICAgIHN0ZXBNYXRyaXg6IE1hdHJpeDMuTWF0cml4M0lPLFxyXG4gICAgICBvcmlnaW5hbE1hdHJpeDogTWF0cml4My5NYXRyaXgzSU8sXHJcbiAgICAgIGNhblJvdGF0ZTogQm9vbGVhbklPLFxyXG4gICAgICBjYW5Nb3ZlOiBCb29sZWFuSU8sXHJcbiAgICAgIHRhZzogRW51bWVyYXRpb25JTyggTWFzc1RhZyApLFxyXG4gICAgICBtYXNzU2hhcGU6IEVudW1lcmF0aW9uSU8oIE1hc3NTaGFwZSApLFxyXG5cclxuICAgICAgLy8gZW5naW5lLmJvZHlUb1N0YXRlT2JqZWN0XHJcbiAgICAgIHBvc2l0aW9uOiBWZWN0b3IyLlZlY3RvcjJJTyxcclxuICAgICAgdmVsb2NpdHk6IFZlY3RvcjIuVmVjdG9yMklPLFxyXG4gICAgICBmb3JjZTogVmVjdG9yMi5WZWN0b3IySU9cclxuICAgIH0sXHJcbiAgICB0b1N0YXRlT2JqZWN0KCBtYXNzOiBNYXNzICk6IE1hc3NJT1N0YXRlT2JqZWN0IHtcclxuICAgICAgcmV0dXJuIGNvbWJpbmVPcHRpb25zPE1hc3NJT1N0YXRlT2JqZWN0Pigge1xyXG4gICAgICAgIG1hdHJpeDogTWF0cml4My50b1N0YXRlT2JqZWN0KCBtYXNzLm1hdHJpeCApLFxyXG4gICAgICAgIHN0ZXBNYXRyaXg6IE1hdHJpeDMudG9TdGF0ZU9iamVjdCggbWFzcy5zdGVwTWF0cml4ICksXHJcbiAgICAgICAgb3JpZ2luYWxNYXRyaXg6IE1hdHJpeDMudG9TdGF0ZU9iamVjdCggbWFzcy5vcmlnaW5hbE1hdHJpeCApLFxyXG4gICAgICAgIGNhblJvdGF0ZTogbWFzcy5jYW5Sb3RhdGUsXHJcbiAgICAgICAgY2FuTW92ZTogbWFzcy5jYW5Nb3ZlLFxyXG4gICAgICAgIHRhZzogRW51bWVyYXRpb25JTyggTWFzc1RhZyApLnRvU3RhdGVPYmplY3QoIG1hc3MudGFnICksXHJcbiAgICAgICAgbWFzc1NoYXBlOiBFbnVtZXJhdGlvbklPKCBNYXNzU2hhcGUgKS50b1N0YXRlT2JqZWN0KCBtYXNzLm1hc3NTaGFwZSApXHJcbiAgICAgIH0sIG1hc3MuZW5naW5lLmJvZHlUb1N0YXRlT2JqZWN0KCBtYXNzLmJvZHkgKSApO1xyXG4gICAgfSxcclxuICAgIGFwcGx5U3RhdGUoIG1hc3M6IE1hc3MsIG9iajogTWFzc0lPU3RhdGVPYmplY3QgKSB7XHJcbiAgICAgIG1hc3MubWF0cml4LnNldCggTWF0cml4My5mcm9tU3RhdGVPYmplY3QoIG9iai5tYXRyaXggKSApO1xyXG4gICAgICBtYXNzLnN0ZXBNYXRyaXguc2V0KCBNYXRyaXgzLmZyb21TdGF0ZU9iamVjdCggb2JqLnN0ZXBNYXRyaXggKSApO1xyXG4gICAgICBtYXNzLm9yaWdpbmFsTWF0cml4LnNldCggTWF0cml4My5mcm9tU3RhdGVPYmplY3QoIG9iai5vcmlnaW5hbE1hdHJpeCApICk7XHJcbiAgICAgIG1hc3MuY2FuUm90YXRlID0gb2JqLmNhblJvdGF0ZTtcclxuICAgICAgbWFzcy5jYW5Nb3ZlID0gb2JqLmNhbk1vdmU7XHJcbiAgICAgIG1hc3MudGFnID0gRW51bWVyYXRpb25JTyggTWFzc1RhZyApLmZyb21TdGF0ZU9iamVjdCggb2JqLnRhZyApO1xyXG4gICAgICBtYXNzLmVuZ2luZS5ib2R5QXBwbHlTdGF0ZSggbWFzcy5ib2R5LCBvYmogKTtcclxuICAgICAgbWFzcy50cmFuc2Zvcm1lZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfSxcclxuICAgIHN0YXRlT2JqZWN0VG9DcmVhdGVFbGVtZW50QXJndW1lbnRzOiAoIHN0YXRlT2JqZWN0OiBNYXNzSU9TdGF0ZU9iamVjdCApID0+IFsgRW51bWVyYXRpb25JTyggTWFzc1NoYXBlICkuZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC5tYXNzU2hhcGUgKSBdXHJcbiAgfSApO1xyXG59XHJcblxyXG5kZW5zaXR5QnVveWFuY3lDb21tb24ucmVnaXN0ZXIoICdNYXNzJywgTWFzcyApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFrQyx3Q0FBd0M7QUFDaEcsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLG1CQUFtQixNQUFNLDRDQUE0QztBQUM1RSxPQUFPQyxjQUFjLE1BQWlDLHVDQUF1QztBQUM3RixPQUFPQyxRQUFR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