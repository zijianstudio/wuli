// Copyright 2021-2023, University of Colorado Boulder

import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import PickRequired from '../../phet-core/js/types/PickRequired.js';
import tandemNamespace from './tandemNamespace.js';

/**
 * Factored-out constant values for use in Tandem.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

const OBJECT_IO_TYPE_NAME = 'ObjectIO';
const EVENT_TYPE_MODEL = 'MODEL';

export type PhetioID = string;

export type PhetioElementData = {
  initialState: Record<string, unknown>;
};

export type PhetioElement = {
  _metadata: PhetioObjectMetadata;
  _data?: PhetioElementData;
};

// In tree structure
export type PhetioElements = {

  // Each string is a component name of a PhetioID
  [ name: string ]: PhetioElements;
} & PhetioElement;

export type Method = {
  returnType: string;
  parameterTypes: string[];
  documentation: string;
  invocableForReadOnlyElements?: boolean;
};

export type PhetioObjectState = Record<string, IntentionalAny>;
export type PhetioState = Record<PhetioID, PhetioObjectState>;
export type FullPhetioState = Record<PhetioID, PhetioObjectState | 'DELETED'>;

export type Methods = Record<string, Method>;

export type PhetioType = {
  methods: Methods;
  supertype?: string; // no supertype for root of hierarchy
  typeName: string;
  documentation?: string;
  events: string[];
  metadataDefaults?: Partial<PhetioObjectMetadata>;
  dataDefaults?: Record<string, unknown>;
  methodOrder?: string[];
  stateSchema?: string | Record<string, string>;
  parameterTypes?: string[]; // each typeName
};
export type PhetioTypes = Record<string, PhetioType>;

export type PhetioOverrides = Record<string, Partial<PhetioObjectMetadata>>;

// Like the generate API files
export type PhetioAPI = {
  version: {
    major: number;
    minor: number;
  };
  phetioFullAPI?: boolean;
  sim: string;
  phetioElements: PhetioElements;
  phetioTypes: PhetioTypes;
};

// Like the old API schema, where keys are the full, dot-separated phetioID
export type APIFlat = Record<PhetioID, PhetioElement>;

export type IOTypeName = string;

export type PhetioObjectMetadata = {

  // Used in PhetioObjectOptions
  phetioState: boolean;
  phetioReadOnly: boolean;
  phetioEventType: string;
  phetioDocumentation: string;
  phetioHighFrequency: boolean; // @deprecated
  phetioPlayback: boolean;
  phetioFeatured?: boolean; // LinkedElements have no phetioFeatured because they defer to their core element
  phetioDynamicElement: boolean;
  phetioDesigned: boolean;

  // Specific to Metadata
  phetioTypeName: IOTypeName;
  phetioIsArchetype: boolean;
  phetioArchetypePhetioID?: string | null;

  // For PhetioDynamicElementContainer.  TODO: https://github.com/phetsims/tandem/issues/263 can this be elsewhere?
  phetioDynamicElementName?: string | null;
};

const metadataDefaults: PhetioObjectMetadata & PickRequired<PhetioObjectMetadata, 'phetioFeatured'> = {
  phetioTypeName: OBJECT_IO_TYPE_NAME,
  phetioDocumentation: '',
  phetioState: true,
  phetioReadOnly: false,

  // NOTE: Relies on the details about how Enumerations are serialized (via name), like EventType.phetioType.toStateObject( object.phetioEventType )
  phetioEventType: EVENT_TYPE_MODEL,
  phetioHighFrequency: false,
  phetioPlayback: false,
  phetioDynamicElement: false,
  phetioIsArchetype: false,
  phetioFeatured: false,
  phetioDesigned: false,
  phetioArchetypePhetioID: null
};


const TandemConstants = {
  OBJECT_IO_TYPE_NAME: OBJECT_IO_TYPE_NAME,
  EVENT_TYPE_MODEL: EVENT_TYPE_MODEL,

  // Default metadata set for an ObjectIO in the PhET-iO API.  These are used as the default options in PhetioObject
  // and when outputting an API (since values that match the defaults are omitted)
  PHET_IO_OBJECT_METADATA_DEFAULTS: metadataDefaults,

  METADATA_KEY_NAME: '_metadata',
  DATA_KEY_NAME: '_data'

} as const;

tandemNamespace.register( 'TandemConstants', TandemConstants );
export default TandemConstants;