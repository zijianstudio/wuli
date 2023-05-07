// Copyright 2020-2023, University of Colorado Boulder

/**
 * IO Types form a synthetic type system used to describe PhET-iO Elements. A PhET-iO Element is an instrumented PhetioObject
 * that is interoperable from the "wrapper" frame (outside the sim frame). An IO Type includes documentation, methods,
 * names, serialization, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import Validation, { Validator } from '../../../axon/js/Validation.js';
import optionize from '../../../phet-core/js/optionize.js';
import PhetioConstants from '../PhetioConstants.js';
import TandemConstants, { IOTypeName, PhetioObjectMetadata } from '../TandemConstants.js';
import tandemNamespace from '../tandemNamespace.js';
import StateSchema, { CompositeSchema, CompositeStateObjectType } from './StateSchema.js';
import type PhetioObject from '../PhetioObject.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import PhetioDynamicElementContainer from '../PhetioDynamicElementContainer.js';

// constants
const VALIDATE_OPTIONS_FALSE = { validateValidator: false };

/**
 * Estimate the core type name from a given IO Type name.
 */
const getCoreTypeName = ( ioTypeName: IOTypeName ): string => {
  const index = ioTypeName.indexOf( PhetioConstants.IO_TYPE_SUFFIX );
  assert && assert( index >= 0, 'IO should be in the type name' );
  return ioTypeName.substring( 0, index );
};

type AddChildElement = ( group: PhetioDynamicElementContainer<PhetioObject>, componentName: string, stateObject: unknown ) => PhetioObject;

export type IOTypeMethod = {
  returnType: IOType;
  parameterTypes: IOType[];

  //the function to execute when this method is called. This function's parameters will be based on `parameterTypes`,
  // and should return the type specified by `returnType`
  implementation: ( ...args: IntentionalAny[] ) => unknown;
  documentation: string;

  // by default, all methods are invocable for all elements. However, for some read-only elements, certain methods
  // should not be invocable. In that case, they are marked as invocableForReadOnlyElements: false.
  invocableForReadOnlyElements?: boolean;
};

type DeserializationType = 'fromStateObject' | 'applyState';

type StateSchemaOption<T, StateType> = (
  ( ioType: IOType<T, StateType> ) => CompositeSchema ) |
  StateSchema<T, StateType> |
  CompositeSchema |
  null;

type SelfOptions<T, StateType> = {

  // IO Types form an object tree like a type hierarchy. If the supertype is specified, attributes such as
  // toStateObject, fromStateObject, stateObjectToCreateElementArguments, applyState, addChildElement
  // will be inherited from the supertype (unless overridden).  It is also used in features such as schema validation,
  // data/metadata default calculations.
  supertype?: IOType | null;

  // The list of events that can be emitted at this level (does not include events from supertypes).
  events?: string[];

  // Key/value pairs indicating the defaults for the IO Type data, just for this level (do not specify parent defaults)
  dataDefaults?: Record<string, unknown>;

  // Key/value pairs indicating the defaults for the IO Type metadata.
  // If anything is provided here, then corresponding PhetioObjects that use this IOType should override
  // PhetioObject.getMetadata() to add what keys they need for their specific type.  Cannot specify redundant values
  // (that an ancestor already specified).
  metadataDefaults?: Partial<PhetioObjectMetadata>;

  // Text that describes the IO Type, presented to the PhET-iO Client in Studio, supports HTML markup.
  documentation?: string;

  // The public methods available for this IO Type. Each method is not just a function,
  // but a collection of metadata about the method to be able to serialize parameters and return types and provide
  // better documentation.
  methods?: Record<string, IOTypeMethod>;

  // IO Types can specify the order that methods appear in the documentation by putting their names in this
  // list. This list is only for the methods defined at this level in the type hierarchy. After the methodOrder
  // specified, the methods follow in the order declared in the implementation (which isn't necessarily stable).
  methodOrder?: string[];

  // For parametric types, they must indicate the types of the parameters here. Empty array if non-parametric.
  parameterTypes?: IOType[];

  // For internal phet-io use only. Functions cannot be sent from one iframe to another, so must be wrapped. See
  // phetioCommandProcessor.wrapFunction
  isFunctionType?: boolean;

  // ******** STATE ******** //

  // The specification for how the PhET-iO state will look for instances of this type. null specifies that the object
  // is not serialized. A composite StateSchema can supply a toStateObject and applyState serialization strategy. This
  // default serialization strategy only applies to this level, and does not recurse to parents. If you need to add
  // serialization from parent levels, this can be done by manually implementing a custom toStateObject. By default, it
  // will assume that each composite child of this stateSchema deserializes via "fromStateObject", if instead it uses
  // applyState, please specify that per IOType with defaultDeserializationMethod.
  // For phetioState: true objects, this should be required, but may be specified in the parent IOType, like in DerivedPropertyIO
  stateSchema?: StateSchemaOption<T, StateType>;

  // Serialize the core object. Most often this looks like an object literal that holds data about the PhetioObject
  // instance. This is likely superfluous to just providing a stateSchema of composite key/IOType values, which will
  // create a default toStateObject based on the schema.
  toStateObject?: ( t: T ) => StateType;

  // ******** DESERIALIZATION ******** //

  // For Data Type Deserialization. Decodes the object from a state (see toStateObject) into an instance of the core type.
  // see https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#three-types-of-deserialization
  fromStateObject?: ( s: StateType ) => T;

  // For Dynamic Element Deserialization: converts the state object to arguments
  // for a `create` function in PhetioGroup or other PhetioDynamicElementContainer creation function. Note that
  // other non-serialized args (not dealt with here) may be supplied as closure variables. This function only needs
  // to be implemented on IO Types whose core type is phetioDynamicElement: true, such as PhetioDynamicElementContainer
  // elements.
  // see https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#three-types-of-deserialization
  stateObjectToCreateElementArguments?: ( s: StateType ) => unknown[];

  // For Reference Type Deserialization:  Applies the state (see toStateObject)
  // value to the instance. When setting PhET-iO state, this function will be called on an instrumented instance to set the
  // stateObject's value to it. StateSchema makes this method often superfluous. A composite stateSchema can be used
  // to automatically formulate the applyState function. If using stateSchema for the applyState method, make sure that
  // each compose IOType has the correct defaultDeserializationMethod. Most of the time, composite IOTypes use fromStateObject
  // to deserialize each sub-component, but in some circumstances, you will want your child to deserialize by also using applyState.
  // See options.defaultDeserializationMethod to configure this case.
  // see https://github.com/phetsims/phet-io/blob/master/doc/phet-io-instrumentation-technical-guide.md#three-types-of-deserialization
  applyState?: ( t: T, state: StateType ) => void;

  // For use when this IOType is part of a composite stateSchema in another IOType.  When
  // using serialization methods by supplying only stateSchema, then deserialization
  // can take a variety of forms, and this will vary based on the IOType. In most cases deserialization of a component
  // is done via fromStateObject. If not, specify this option so that the stateSchema will be able to know to call
  // the appropriate deserialization method when deserializing something of this IOType.
  defaultDeserializationMethod?: DeserializationType;

  // For dynamic element containers, see examples in IOTypes for PhetioDynamicElementContainer classes
  addChildElement?: AddChildElement;
};

type IOTypeOptions<T, StateType> = SelfOptions<T, StateType> & Validator<T>;

// TODO: not any, but do we have to serialize type parameters? https://github.com/phetsims/tandem/issues/263
export default class IOType<T = any, StateType = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  public readonly supertype?: IOType;
  public readonly documentation?: string;
  public readonly methods?: Record<string, IOTypeMethod>;

  public readonly events: string[];
  public readonly metadataDefaults?: Partial<PhetioObjectMetadata>;

  public readonly dataDefaults?: Record<string, unknown>;
  public readonly methodOrder?: string[];
  public readonly parameterTypes?: IOType[];

  public readonly toStateObject: ( t: T ) => StateType;
  public readonly fromStateObject: ( state: StateType ) => T;
  public readonly stateObjectToCreateElementArguments: ( s: StateType ) => unknown[]; // TODO: instead of unknown this is the second parameter type for PhetioDynamicElementContainer. How? https://github.com/phetsims/tandem/issues/261
  public readonly applyState: ( object: T, state: StateType ) => void;
  public readonly addChildElement: AddChildElement;
  public readonly validator: Validator<T>;
  public readonly defaultDeserializationMethod: DeserializationType;
  public readonly stateSchema: StateSchema<T, StateType>;
  public readonly isFunctionType: boolean;

  public static ObjectIO: IOType;

  /**
   * @param typeName - The name that this IOType will have in the public PhET-iO API. In general, this should
   *    only be word characters, ending in "IO". Parametric types are a special subset of IOTypes that include their
   *    parameters in their typeName. If an IOType's parameters are other IO Type(s), then they should be included within
   *    angle brackets, like "PropertyIO<BooleanIO>". Some other types use a more custom format for displaying their
   *    parameter types, in this case the parameter section of the type name (immediately following "IO") should begin
   *    with an open paren, "(". Thus the schema for a typeName could be defined (using regex) as `[A-Z]\w*IO([(<].*){0,1}`.
   *    Parameterized types should also include a `parameterTypes` field on the IOType.
   * @param providedOptions
   */
  public constructor( public readonly typeName: IOTypeName, providedOptions: IOTypeOptions<T, StateType> ) {

    // For reference in the options
    const supertype = providedOptions.supertype || IOType.ObjectIO;
    const toStateObjectSupplied = !!( providedOptions.toStateObject );
    const applyStateSupplied = !!( providedOptions.applyState );
    const stateSchemaSupplied = !!( providedOptions.stateSchema );

    const options = optionize<IOTypeOptions<T, StateType>, SelfOptions<T, StateType>>()( {

      supertype: IOType.ObjectIO,
      methods: {},
      events: [],
      metadataDefaults: {},

      //  Most likely this will remain PhET-iO internal, and shouldn't need to be used when creating IOTypes outside of tandem/.
      dataDefaults: {},
      methodOrder: [],
      parameterTypes: [],
      documentation: `IO Type for ${getCoreTypeName( typeName )}`,
      isFunctionType: false,

      /**** STATE ****/

      toStateObject: supertype && supertype.toStateObject,
      fromStateObject: supertype && supertype.fromStateObject,
      stateObjectToCreateElementArguments: supertype && supertype.stateObjectToCreateElementArguments,
      applyState: supertype && supertype.applyState,

      stateSchema: null,
      defaultDeserializationMethod: 'fromStateObject',
      addChildElement: supertype && supertype.addChildElement
    }, providedOptions );

    if ( assert && supertype ) {
      ( Object.keys( options.metadataDefaults ) as ( keyof PhetioObjectMetadata )[] ).forEach( metadataDefaultKey => {
        assert && supertype.getAllMetadataDefaults().hasOwnProperty( metadataDefaultKey ) &&
        assert( supertype.getAllMetadataDefaults()[ metadataDefaultKey ] !== options.metadataDefaults[ metadataDefaultKey ],
          `${metadataDefaultKey} should not have the same default value as the ancestor metadata default.` );
      } );
    }
    this.supertype = supertype;
    this.documentation = options.documentation;
    this.methods = options.methods;
    this.events = options.events;
    this.metadataDefaults = options.metadataDefaults; // just for this level, see getAllMetadataDefaults()
    this.dataDefaults = options.dataDefaults; // just for this level, see getAllDataDefaults()
    this.methodOrder = options.methodOrder;
    this.parameterTypes = options.parameterTypes;

    // Validation
    this.validator = _.pick( options, Validation.VALIDATOR_KEYS );
    this.validator.validationMessage = this.validator.validationMessage || `Validation failed IOType Validator: ${this.typeName}`;

    this.defaultDeserializationMethod = options.defaultDeserializationMethod;

    if ( options.stateSchema === null || options.stateSchema instanceof StateSchema ) {
      // @ts-expect-error https://github.com/phetsims/tandem/issues/263
      this.stateSchema = options.stateSchema;
    }
    else {
      const compositeSchema = typeof options.stateSchema === 'function' ? options.stateSchema( this ) : options.stateSchema;

      this.stateSchema = new StateSchema<T, StateType>( { compositeSchema: compositeSchema } );
    }

    // Assert that toStateObject method is provided for value StateSchemas. Do this with the following logic:
    // 1. It is acceptable to not provide a stateSchema (for IOTypes that aren't stateful)
    // 2. You must either provide a toStateObject, or have a composite StateSchema. Composite state schemas support default serialization methods.
    assert && assert( !this.stateSchema || ( toStateObjectSupplied || this.stateSchema.isComposite() ),
      'toStateObject method must be provided for value StateSchemas' );

    this.toStateObject = ( coreObject: T ) => {
      validate( coreObject, this.validator, VALIDATE_OPTIONS_FALSE );

      let toStateObject;

      // Only do this non-standard toStateObject function if there is a stateSchema but no toStateObject provided
      if ( !toStateObjectSupplied && stateSchemaSupplied && this.stateSchema && this.stateSchema.isComposite() ) {
        toStateObject = this.stateSchema.defaultToStateObject( coreObject );
      }
      else {
        toStateObject = options.toStateObject( coreObject );
      }

      // Validate, but only if this IOType instance has more to validate than the supertype
      if ( toStateObjectSupplied || stateSchemaSupplied ) {

        // Only validate the stateObject if it is phetioState:true.
        // This is an n*m algorithm because for each time toStateObject is called and needs validation, this.validateStateObject
        // looks all the way up the IOType hierarchy. This is not efficient, but gains us the ability to make sure that
        // the stateObject doesn't have any superfluous, unexpected keys. The "m" portion is based on how many sub-properties
        // in a state call `toStateObject`, and the "n" portion is based on how many IOTypes in the hierarchy define a
        // toStateObject or stateSchema. In the future we could potentially improve performance by having validateStateObject
        // only check against the schema at this level, but then extra keys in the stateObject would not be caught. From work done in https://github.com/phetsims/phet-io/issues/1774
        assert && this.validateStateObject( toStateObject );
      }
      return toStateObject;
    };
    this.fromStateObject = options.fromStateObject;
    this.stateObjectToCreateElementArguments = options.stateObjectToCreateElementArguments;

    this.applyState = ( coreObject: T, stateObject: StateType ) => {
      validate( coreObject, this.validator, VALIDATE_OPTIONS_FALSE );

      // Validate, but only if this IOType instance has more to validate than the supertype
      if ( applyStateSupplied || stateSchemaSupplied ) {

        // Validate that the provided stateObject is of the expected schema
        // NOTE: Cannot use this.validateStateObject because options adopts supertype.applyState, which is bounds to the
        // parent IO Type. This prevents correct validation because the supertype doesn't know about the subtype schemas.
        // @ts-expect-error we cannot type check against PhetioObject from this file
        assert && coreObject.phetioType.validateStateObject( stateObject );
      }

      // Only do this non-standard applyState function from stateSchema if there is a stateSchema but no applyState provided
      if ( !applyStateSupplied && stateSchemaSupplied && this.stateSchema && this.stateSchema.isComposite() ) {
        this.stateSchema.defaultApplyState( coreObject, stateObject as CompositeStateObjectType );
      }
      else {
        options.applyState( coreObject, stateObject );
      }
    };

    this.isFunctionType = options.isFunctionType;
    this.addChildElement = options.addChildElement;

    if ( assert ) {

      assert && assert( supertype || this.typeName === 'ObjectIO', 'supertype is required' );
      assert && assert( !this.typeName.includes( '.' ), 'Dots should not appear in type names' );
      assert && assert( this.typeName.split( /[<(]/ )[ 0 ].endsWith( PhetioConstants.IO_TYPE_SUFFIX ), `IO Type name must end with ${PhetioConstants.IO_TYPE_SUFFIX}` );
      assert && assert( this.hasOwnProperty( 'typeName' ), 'this.typeName is required' );

      // assert that each public method adheres to the expected schema
      this.methods && Object.values( this.methods ).forEach( ( methodObject: IOTypeMethod ) => {
        if ( typeof methodObject === 'object' ) {
          assert && methodObject.invocableForReadOnlyElements && assert( typeof methodObject.invocableForReadOnlyElements === 'boolean',
            `invocableForReadOnlyElements must be of type boolean: ${methodObject.invocableForReadOnlyElements}` );
        }
      } );
      assert && assert( this.documentation.length > 0, 'documentation must be provided' );

      this.methods && this.hasOwnProperty( 'methodOrder' ) && this.methodOrder.forEach( methodName => {
        assert && assert( this.methods![ methodName ], `methodName not in public methods: ${methodName}` );
      } );

      if ( supertype ) {
        const typeHierarchy = supertype.getTypeHierarchy();
        assert && this.events && this.events.forEach( event => {

          // Make sure events are not listed again
          assert && assert( !_.some( typeHierarchy, t => t.events.includes( event ) ), `IOType should not declare event that parent also has: ${event}` );
        } );
      }
      else {

        // The root IOType must supply all 4 state methods.
        assert && assert( typeof options.toStateObject === 'function', 'toStateObject must be defined' );
        assert && assert( typeof options.fromStateObject === 'function', 'fromStateObject must be defined' );
        assert && assert( typeof options.stateObjectToCreateElementArguments === 'function', 'stateObjectToCreateElementArguments must be defined' );
        assert && assert( typeof options.applyState === 'function', 'applyState must be defined' );
      }
    }
  }

  /**
   * Gets an array of IOTypes of the self type and all the supertype ancestors.
   */
  private getTypeHierarchy(): IOType<unknown, unknown>[] {
    const array = [];

    // @ts-expect-error Still working out this stuff, https://github.com/phetsims/tandem/issues/263
    let ioType: IOType<unknown, unknown> = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
    while ( ioType ) {
      array.push( ioType );
      ioType = ioType.supertype!;
    }
    return array;
  }

  /**
   * Returns true if this IOType is a subtype of the passed-in type (or if they are the same).
   */
  public extends( type: IOType<unknown, unknown> ): boolean {

    // memory-based implementation OK since this method is only used in assertions
    return this.getTypeHierarchy().includes( type );
  }

  /**
   * Return all the metadata defaults (for the entire IO Type hierarchy)
   */
  public getAllMetadataDefaults(): Partial<PhetioObjectMetadata> {
    return _.merge( {}, this.supertype ? this.supertype.getAllMetadataDefaults() : {}, this.metadataDefaults );
  }

  /**
   * Return all the data defaults (for the entire IO Type hierarchy)
   */
  public getAllDataDefaults(): Record<string, unknown> {
    return _.merge( {}, this.supertype ? this.supertype.getAllDataDefaults() : {}, this.dataDefaults );
  }

  /**
   * @param stateObject - the stateObject to validate against
   * @param toAssert=false - whether to assert when invalid
   * @param schemaKeysPresentInStateObject=[]
   * @returns if the stateObject is valid or not.
   */
  public isStateObjectValid( stateObject: StateType, toAssert = false, schemaKeysPresentInStateObject: string[] = [] ): boolean {

    // Set to false when invalid
    let valid = true;

    // make sure the stateObject has everything the schema requires and nothing more
    if ( this.stateSchema ) {
      const validSoFar = this.stateSchema.checkStateObjectValid( stateObject, toAssert, schemaKeysPresentInStateObject );

      // null as a marker to keep checking up the hierarchy, otherwise we reached our based case because the stateSchema was a value, not a composite
      if ( validSoFar !== null ) {
        return validSoFar;
      }
    }

    if ( this.supertype ) {
      return valid && this.supertype.isStateObjectValid( stateObject, toAssert, schemaKeysPresentInStateObject );
    }

    // When we reach the root, make sure there isn't anything in the stateObject that isn't described by a schema
    if ( !this.supertype && stateObject && typeof stateObject !== 'string' && !Array.isArray( stateObject ) ) {

      // Visit the state
      Object.keys( stateObject ).forEach( key => {
        const keyValid = schemaKeysPresentInStateObject.includes( key );
        if ( !keyValid ) {
          valid = false;
        }
        assert && toAssert && assert( keyValid, `stateObject provided a key that is not in the schema: ${key}` );
      } );

      return valid;
    }
    return true;
  }

  /**
   * Assert if the provided stateObject is not valid to this IOType's stateSchema
   */
  public validateStateObject( stateObject: StateType ): void {
    this.isStateObjectValid( stateObject, true );
  }

  public toString(): IOTypeName {
    return this.typeName;
  }
}

// default state value
const DEFAULT_STATE = null;

IOType.ObjectIO = new IOType<PhetioObject, null>( TandemConstants.OBJECT_IO_TYPE_NAME, {
  isValidValue: () => true,
  supertype: null,
  documentation: 'The root of the IO Type hierarchy',
  toStateObject: ( coreObject: PhetioObject ) => {

    if ( phet && phet.tandem && phet.tandem.Tandem.VALIDATION ) {

      assert && assert( coreObject.tandem, 'coreObject must be PhET-iO object' );

      assert && assert( !coreObject.phetioState,
        `fell back to root serialization state for ${coreObject.tandem.phetioID}. Potential solutions:
         * mark the type as phetioState: false
         * create a custom toStateObject method in your IO Type
         * perhaps you have everything right, but forgot to pass in the IOType via phetioType in the constructor` );
    }
    return DEFAULT_STATE;
  },
  fromStateObject: () => {
    throw new Error( 'ObjectIO.fromStateObject should not be called' );
  },
  stateObjectToCreateElementArguments: () => [],
  applyState: _.noop,
  metadataDefaults: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS,
  dataDefaults: {
    initialState: DEFAULT_STATE
  },
  stateSchema: null
} );

tandemNamespace.register( 'IOType', IOType );