// Copyright 2017-2023, University of Colorado Boulder

/**
 * Base type that provides PhET-iO features. An instrumented PhetioObject is referred to on the wrapper side/design side
 * as a "PhET-iO element".  Note that sims may have hundreds or thousands of PhetioObjects, so performance and memory
 * considerations are important.  For this reason, initializePhetioObject is only called in PhET-iO brand, which means
 * many of the getters such as `phetioState` and `phetioDocumentation` will not work in other brands. We have opted
 * to have these getters throw assertion errors in other brands to help identify problems if these are called
 * unexpectedly.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import animationFrameTimer from '../../axon/js/animationFrameTimer.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import validate from '../../axon/js/validate.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import merge from '../../phet-core/js/merge.js';
import optionize, { combineOptions, EmptySelfOptions, OptionizeDefaults } from '../../phet-core/js/optionize.js';
import EventType from './EventType.js';
import LinkedElementIO from './LinkedElementIO.js';
import phetioAPIValidation from './phetioAPIValidation.js';
import Tandem from './Tandem.js';
import TandemConstants, { PhetioID, PhetioObjectMetadata } from './TandemConstants.js';
import tandemNamespace from './tandemNamespace.js';
import IOType from './types/IOType.js';
import IntentionalAny from '../../phet-core/js/types/IntentionalAny.js';
import Disposable from '../../axon/js/Disposable.js';
import LinkableElement from './LinkableElement.js';

// constants
const PHET_IO_ENABLED = Tandem.PHET_IO_ENABLED;
const IO_TYPE_VALIDATOR = { valueType: IOType, validationMessage: 'phetioType must be an IOType' };
const BOOLEAN_VALIDATOR = { valueType: 'boolean' };

// use "<br>" instead of newlines
const PHET_IO_DOCUMENTATION_VALIDATOR = {
  valueType: 'string',
  isValidValue: ( doc: string ) => !doc.includes( '\n' ),
  validationMessage: 'phetioDocumentation must be provided in the right format'
};
const PHET_IO_EVENT_TYPE_VALIDATOR = {
  valueType: EventType,
  validationMessage: 'invalid phetioEventType'
};
const OBJECT_VALIDATOR = { valueType: [ Object, null ] };

const objectToPhetioID = ( phetioObject: PhetioObject ) => phetioObject.tandem.phetioID;

type StartEventOptions = {
  data?: Record<string, IntentionalAny> | null;
  getData?: ( () => Record<string, IntentionalAny> ) | null;
};

// When an event is suppressed from the data stream, we keep track of it with this token.
const SKIPPING_MESSAGE = -1;

const DEFAULTS: OptionizeDefaults<StrictOmit<SelfOptions, 'phetioDynamicElementName'>> = {

  // Subtypes can use `Tandem.tandemRequired` to require a named tandem passed in
  tandem: Tandem.OPTIONAL,

  // Defines API methods, events and serialization
  phetioType: IOType.ObjectIO,

  // Useful notes about an instrumented PhetioObject, shown in the PhET-iO Studio Wrapper. It's an html
  // string, so "<br>" tags are required instead of "\n" characters for proper rendering in Studio
  phetioDocumentation: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDocumentation,

  // When true, includes the PhetioObject in the PhET-iO state (not automatically recursive, must be specified for
  // children explicitly)
  phetioState: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioState,

  // This option controls how PhET-iO wrappers can interface with this PhetioObject. Predominately this occurs via
  // public methods defined on this PhetioObject's phetioType, in which some method are not executable when this flag
  // is true. See `ObjectIO.methods` for further documentation, especially regarding `invocableForReadOnlyElements`.
  // NOTE: PhetioObjects with {phetioState: true} AND {phetioReadOnly: true} are restored during via setState.
  phetioReadOnly: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioReadOnly,

  // Category of event type, can be overridden in phetioStartEvent options.  Cannot be supplied through TandemConstants because
  // that would create an import loop
  phetioEventType: EventType.MODEL,

  // High frequency events such as mouse moves can be omitted from data stream, see ?phetioEmitHighFrequencyEvents
  // and Client.launchSim option
  // @deprecated - see https://github.com/phetsims/phet-io/issues/1629#issuecomment-608002410
  phetioHighFrequency: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioHighFrequency,

  // When true, emits events for data streams for playback, see handlePlaybackEvent.js
  phetioPlayback: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioPlayback,

  // When true, this is categorized as an important "featured" element in Studio.
  phetioFeatured: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioFeatured,

  // indicates that an object may or may not have been created. Applies recursively automatically
  // and should only be set manually on the root dynamic element. Dynamic archetypes will have this overwritten to
  // false even if explicitly provided as true, as archetypes cannot be dynamic.
  phetioDynamicElement: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDynamicElement,

  // Marking phetioDesigned: true opts-in to API change detection tooling that can be used to catch inadvertent
  // changes to a designed API.  A phetioDesigned:true PhetioObject (or any of its tandem descendants) will throw
  // assertion errors on CT (or when running with ?phetioCompareAPI) when the following are true:
  // (a) its package.json lists compareDesignedAPIChanges:true in the "phet-io" section
  // (b) the simulation is listed in perennial/data/phet-io-api-stable
  // (c) any of its metadata values deviate from the reference API
  phetioDesigned: TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDesigned,

  // delivered with each event, if specified. phetioPlayback is appended here, if true.
  // Note: unlike other options, this option can be mutated downstream, and hence should be created newly for each instance.
  phetioEventMetadata: null,

  tandemNameSuffix: null
};

// If you run into a type error here, feel free to add any type that is supported by the browsers "structured cloning algorithm" https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
type EventMetadata = Record<string, string | boolean | number | Array<string | boolean | number>>;

assert && assert( EventType.phetioType.toStateObject( DEFAULTS.phetioEventType ) === TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioEventType,
  'phetioEventType must have the same default as the default metadata values.' );

// Options for creating a PhetioObject
type SelfOptions = StrictOmit<Partial<PhetioObjectMetadata>, 'phetioTypeName' | 'phetioArchetypePhetioID' |
  'phetioIsArchetype' | 'phetioEventType'> & {
  tandem?: Tandem;
  phetioType?: IOType;
  phetioEventType?: EventType;
  phetioEventMetadata?: EventMetadata | null;

  // Require that the given tandem's name ends in the provided string. This is help with naming conventions. If an
  // array of multiple suffixes are provided, require that the provided tandem matches any of the supplied
  // tandemNameSuffix values. First character is not case sensitive to support cases like
  // sim.screen1.view.thermometerNode
  // sim.screen1.view.upperThermometerNode
  tandemNameSuffix?: string | string[] | null;
};
export type PhetioObjectOptions = SelfOptions;

type PhetioObjectMetadataKeys = keyof ( StrictOmit<PhetioObjectMetadata, 'phetioTypeName' | 'phetioDynamicElementName'> ) | 'phetioType';
export type PhetioObjectMetadataInput = Pick<PhetioObject, PhetioObjectMetadataKeys>;

class PhetioObject extends Disposable {

  // assigned in initializePhetioObject - see docs at DEFAULTS declaration
  public tandem: Tandem;

  // track whether the object has been initialized.  This is necessary because initialization can happen in the
  // constructor or in a subsequent call to initializePhetioObject (to support scenery Node)
  private phetioObjectInitialized: boolean;

  // See documentation in DEFAULTS
  public phetioIsArchetype!: boolean;
  public phetioBaselineMetadata!: PhetioObjectMetadata | null;
  private _phetioType!: IOType;
  private _phetioState!: boolean;
  private _phetioReadOnly!: boolean;
  private _phetioDocumentation!: string;
  private _phetioEventType!: EventType;
  private _phetioHighFrequency!: boolean;
  private _phetioPlayback!: boolean;
  private _phetioDynamicElement!: boolean;
  private _phetioFeatured!: boolean;
  private _phetioEventMetadata!: EventMetadata | null;
  private _phetioDesigned!: boolean;

  // Public only for PhetioObjectMetadataInput
  public phetioArchetypePhetioID!: string | null;
  private linkedElements!: LinkedElement[] | null;
  public phetioNotifiedObjectCreated!: boolean;
  private phetioMessageStack!: number[];
  public static readonly DEFAULT_OPTIONS = DEFAULTS;
  public phetioID: PhetioID;

  public constructor( options?: PhetioObjectOptions ) {
    super();

    this.tandem = DEFAULTS.tandem;
    this.phetioID = this.tandem.phetioID;
    this.phetioObjectInitialized = false;

    if ( options ) {
      this.initializePhetioObject( {}, options );
    }
  }

  /**
   * Like SCENERY/Node, PhetioObject can be configured during construction or later with a mutate call.
   * Noop if provided options keys don't intersect with any key in DEFAULTS; baseOptions are ignored for this calculation.
   */
  protected initializePhetioObject( baseOptions: Partial<PhetioObjectOptions>, providedOptions: PhetioObjectOptions ): void {
    assert && assert( providedOptions, 'initializePhetioObject must be called with providedOptions' );

    // call before we exit early to support logging unsupplied Tandems.
    providedOptions.tandem && Tandem.onMissingTandem( providedOptions.tandem );

    // Make sure that required tandems are supplied
    if ( Tandem.VALIDATION && providedOptions.tandem && providedOptions.tandem.required ) {
      assert && assert( providedOptions.tandem.supplied, 'required tandems must be supplied' );
    }

    // The presence of `tandem` indicates if this PhetioObject can be initialized. If not yet initialized, perhaps
    // it will be initialized later on, as in Node.mutate().
    if ( !( PHET_IO_ENABLED && providedOptions.tandem && providedOptions.tandem.supplied ) ) {
      assert && !providedOptions.tandem && assert( !specifiesNonTandemPhetioObjectKey( providedOptions ), 'only specify metadata when providing a Tandem' );

      // In this case, the PhetioObject is not initialized, but still set tandem to maintain a consistent API for
      // creating the Tandem tree.
      if ( providedOptions.tandem ) {
        this.tandem = providedOptions.tandem;
        this.phetioID = this.tandem.phetioID;
      }
      return;
    }

    // assert this after the `specifiesPhetioObjectKey check to support something like:
    assert && assert( !this.phetioObjectInitialized, 'cannot initialize twice' );

    // Guard validation on assert to avoid calling a large number of no-ops when assertions are disabled, see https://github.com/phetsims/tandem/issues/200
    assert && validate( providedOptions.tandem, { valueType: Tandem } );

    const defaults = combineOptions<OptionizeDefaults<PhetioObjectOptions>>( {}, DEFAULTS, baseOptions );

    let options = optionize<PhetioObjectOptions>()( defaults, providedOptions );

    // validate options before assigning to properties
    assert && validate( options.phetioType, IO_TYPE_VALIDATOR );
    assert && validate( options.phetioState, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioState must be a boolean' } ) );
    assert && validate( options.phetioReadOnly, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioReadOnly must be a boolean' } ) );
    assert && validate( options.phetioEventType, PHET_IO_EVENT_TYPE_VALIDATOR );
    assert && validate( options.phetioDocumentation, PHET_IO_DOCUMENTATION_VALIDATOR );
    assert && validate( options.phetioHighFrequency, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioHighFrequency must be a boolean' } ) );
    assert && validate( options.phetioPlayback, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioPlayback must be a boolean' } ) );
    assert && validate( options.phetioFeatured, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioFeatured must be a boolean' } ) );
    assert && validate( options.phetioEventMetadata, merge( {}, OBJECT_VALIDATOR, { validationMessage: 'object literal expected' } ) );
    assert && validate( options.phetioDynamicElement, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioDynamicElement must be a boolean' } ) );
    assert && validate( options.phetioDesigned, merge( {}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioDesigned must be a boolean' } ) );

    assert && assert( this.linkedElements !== null, 'this means addLinkedElement was called before instrumentation of this PhetioObject' );

    // optional - Indicates that an object is a archetype for a dynamic class. Settable only by
    // PhetioEngine and by classes that create dynamic elements when creating their archetype (like PhetioGroup) through
    // PhetioObject.markDynamicElementArchetype().
    // if true, items will be excluded from phetioState. This applies recursively automatically.
    this.phetioIsArchetype = false;

    // (phetioEngine)
    // Store the full baseline for usage in validation or for usage in studio.  Do this before applying overrides. The
    // baseline is created when a sim is run with assertions to assist in phetioAPIValidation.  However, even when
    // assertions are disabled, some wrappers such as studio need to generate the baseline anyway.
    // not all metadata are passed through via options, so store baseline for these additional properties
    this.phetioBaselineMetadata = ( phetioAPIValidation.enabled || phet.preloads.phetio.queryParameters.phetioEmitAPIBaseline ) ?
                                  this.getMetadata( merge( {
                                    phetioIsArchetype: this.phetioIsArchetype,
                                    phetioArchetypePhetioID: this.phetioArchetypePhetioID
                                  }, options ) ) :
                                  null;

    // Dynamic elements should compare to their "archetypal" counterparts.  For example, this means that a Particle
    // in a PhetioGroup will take its overrides from the PhetioGroup archetype.
    const archetypalPhetioID = options.tandem.getArchetypalPhetioID();

    // Overrides are only defined for simulations, not for unit tests.  See https://github.com/phetsims/phet-io/issues/1461
    // Patch in the desired values from overrides, if any.
    if ( window.phet.preloads.phetio.phetioElementsOverrides ) {
      const overrides = window.phet.preloads.phetio.phetioElementsOverrides[ archetypalPhetioID ];
      if ( overrides ) {

        // No need to make a new object, since this "options" variable was created in the previous merge call above.
        options = optionize<PhetioObjectOptions>()( options, overrides );
      }
    }

    // (read-only) see docs at DEFAULTS declaration
    this.tandem = options.tandem!;
    this.phetioID = this.tandem.phetioID;

    // (read-only) see docs at DEFAULTS declaration
    this._phetioType = options.phetioType;

    // (read-only) see docs at DEFAULTS declaration
    this._phetioState = options.phetioState;

    // (read-only) see docs at DEFAULTS declaration
    this._phetioReadOnly = options.phetioReadOnly;

    // (read-only) see docs at DEFAULTS declaration
    this._phetioDocumentation = options.phetioDocumentation;

    // see docs at DEFAULTS declaration
    this._phetioEventType = options.phetioEventType;

    // see docs at DEFAULTS declaration
    this._phetioHighFrequency = options.phetioHighFrequency;

    // see docs at DEFAULTS declaration
    this._phetioPlayback = options.phetioPlayback;

    // (PhetioEngine) see docs at DEFAULTS declaration - in order to recursively pass this value to
    // children, the setPhetioDynamicElement() function must be used instead of setting this attribute directly
    this._phetioDynamicElement = options.phetioDynamicElement;

    // (read-only) see docs at DEFAULTS declaration
    this._phetioFeatured = options.phetioFeatured;

    this._phetioEventMetadata = options.phetioEventMetadata;

    this._phetioDesigned = options.phetioDesigned;

    // for phetioDynamicElements, the corresponding phetioID for the element in the archetype subtree
    this.phetioArchetypePhetioID = null;

    //keep track of LinkedElements for disposal. Null out to support asserting on
    // edge error cases, see this.addLinkedElement()
    this.linkedElements = [];

    // (phet-io) set to true when this PhetioObject has been sent over to the parent.
    this.phetioNotifiedObjectCreated = false;

    // tracks the indices of started messages so that dataStream can check that ends match starts.
    this.phetioMessageStack = [];

    // Make sure playback shows in the phetioEventMetadata
    if ( this._phetioPlayback ) {
      this._phetioEventMetadata = this._phetioEventMetadata || {};
      assert && assert( !this._phetioEventMetadata.hasOwnProperty( 'playback' ), 'phetioEventMetadata.playback should not already exist' );
      this._phetioEventMetadata.playback = true;
    }

    // Alert that this PhetioObject is ready for cross-frame communication (thus becoming a "PhET-iO element" on the wrapper side.
    this.tandem.addPhetioObject( this );
    this.phetioObjectInitialized = true;

    if ( assert && Tandem.VALIDATION && this.isPhetioInstrumented() && options.tandemNameSuffix ) {

      const suffixArray = Array.isArray( options.tandemNameSuffix ) ? options.tandemNameSuffix : [ options.tandemNameSuffix ];
      const matches = suffixArray.filter( suffix => {
        return this.tandem.name.endsWith( suffix ) ||
               this.tandem.name.endsWith( PhetioObject.swapCaseOfFirstCharacter( suffix ) );
      } );
      assert && assert( matches.length > 0, 'Incorrect Tandem suffix, expected = ' + suffixArray.join( ', ' ) + '. actual = ' + this.tandem.phetioID );
    }
  }

  public static swapCaseOfFirstCharacter( string: string ): string {
    const firstChar = string[ 0 ];
    const newFirstChar = firstChar === firstChar.toLowerCase() ? firstChar.toUpperCase() : firstChar.toLowerCase();
    return newFirstChar + string.substring( 1 );
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioType(): IOType {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioType only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioType;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioState(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioState only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioState;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioReadOnly(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioReadOnly only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioReadOnly;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioDocumentation(): string {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDocumentation only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioDocumentation;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioEventType(): EventType {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventType only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioEventType;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioHighFrequency(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioHighFrequency only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioHighFrequency;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioPlayback(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioPlayback only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioPlayback;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioDynamicElement(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDynamicElement only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioDynamicElement;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioFeatured(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioFeatured only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioFeatured;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioEventMetadata(): EventMetadata | null {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventMetadata only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioEventMetadata;
  }

  // throws an assertion error in brands other than PhET-iO
  public get phetioDesigned(): boolean {
    assert && assert( PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDesigned only accessible for instrumented objects in PhET-iO brand.' );
    return this._phetioDesigned;
  }

  /**
   * Start an event for the nested PhET-iO data stream.
   *
   * @param event - the name of the event
   * @param [providedOptions]
   */
  public phetioStartEvent( event: string, providedOptions?: StartEventOptions ): void {
    if ( PHET_IO_ENABLED && this.isPhetioInstrumented() ) {

      // only one or the other can be provided
      assert && assertMutuallyExclusiveOptions( providedOptions, [ 'data' ], [ 'getData' ] );
      const options = optionize<StartEventOptions>()( {

        data: null,

        // function that, when called gets the data.
        getData: null
      }, providedOptions );

      assert && assert( this.phetioObjectInitialized, 'phetioObject should be initialized' );
      assert && options.data && assert( typeof options.data === 'object' );
      assert && options.getData && assert( typeof options.getData === 'function' );
      assert && assert( arguments.length === 1 || arguments.length === 2, 'Prevent usage of incorrect signature' );

      // TODO: don't drop PhET-iO events if they are created before we have a dataStream global. https://github.com/phetsims/phet-io/issues/1875
      if ( !_.hasIn( window, 'phet.phetio.dataStream' ) ) {

        // If you hit this, then it is likely related to https://github.com/phetsims/scenery/issues/1124 and we would like to know about it!
        // assert && assert( false, 'trying to create an event before the data stream exists' );

        this.phetioMessageStack.push( SKIPPING_MESSAGE );
        return;
      }

      // Opt out of certain events if queryParameter override is provided. Even for a low frequency data stream, high
      // frequency events can still be emitted when they have a low frequency ancestor.
      const skipHighFrequencyEvent = this.phetioHighFrequency &&
                                     _.hasIn( window, 'phet.preloads.phetio.queryParameters' ) &&
                                     !window.phet.preloads.phetio.queryParameters.phetioEmitHighFrequencyEvents &&
                                     !phet.phetio.dataStream.isEmittingLowFrequencyEvent();

      // TODO: If there is no dataStream global defined, then we should handle this differently as to not drop the event that is triggered, see https://github.com/phetsims/phet-io/issues/1846
      const skipFromUndefinedDatastream = !assert && !_.hasIn( window, 'phet.phetio.dataStream' );

      if ( skipHighFrequencyEvent || this.phetioEventType === EventType.OPT_OUT || skipFromUndefinedDatastream ) {
        this.phetioMessageStack.push( SKIPPING_MESSAGE );
        return;
      }

      // Only get the args if we are actually going to send the event.
      const data = options.getData ? options.getData() : options.data;

      this.phetioMessageStack.push(
        phet.phetio.dataStream.start( this.phetioEventType, this.tandem.phetioID, this.phetioType, event, data, this.phetioEventMetadata, this.phetioHighFrequency )
      );

      // To support PhET-iO playback, any potential playback events downstream of this playback event must be marked as
      // non playback events. This is to prevent the PhET-iO playback engine from repeating those events. See
      // https://github.com/phetsims/phet-io/issues/1693
      this.phetioPlayback && phet.phetio.dataStream.pushNonPlaybackable();
    }
  }

  /**
   * End an event on the nested PhET-iO data stream. It this object was disposed or dataStream.start was not called,
   * this is a no-op.
   */
  public phetioEndEvent(): void {
    if ( PHET_IO_ENABLED && this.isPhetioInstrumented() ) {

      assert && assert( this.phetioMessageStack.length > 0, 'Must have messages to pop' );
      const topMessageIndex = this.phetioMessageStack.pop();

      // The message was started as a high frequency event to be skipped, so the end is a no-op
      if ( topMessageIndex === SKIPPING_MESSAGE ) {
        return;
      }
      this.phetioPlayback && phet.phetio.dataStream.popNonPlaybackable();
      phet.phetio.dataStream.end( topMessageIndex );
    }
  }

  /**
   * Set any instrumented descendants of this PhetioObject to the same value as this.phetioDynamicElement.
   */
  public propagateDynamicFlagsToDescendants(): void {
    assert && assert( Tandem.PHET_IO_ENABLED, 'phet-io should be enabled' );
    assert && assert( phet.phetio && phet.phetio.phetioEngine, 'Dynamic elements cannot be created statically before phetioEngine exists.' );
    const phetioEngine = phet.phetio.phetioEngine;

    // in the same order as bufferedPhetioObjects
    const unlaunchedPhetioIDs = !Tandem.launched ? Tandem.bufferedPhetioObjects.map( objectToPhetioID ) : [];

    this.tandem.iterateDescendants( tandem => {
      const phetioID = tandem.phetioID;

      if ( phetioEngine.hasPhetioObject( phetioID ) || ( !Tandem.launched && unlaunchedPhetioIDs.includes( phetioID ) ) ) {
        assert && assert( this.isPhetioInstrumented() );
        const phetioObject = phetioEngine.hasPhetioObject( phetioID ) ? phetioEngine.getPhetioObject( phetioID ) :
                             Tandem.bufferedPhetioObjects[ unlaunchedPhetioIDs.indexOf( phetioID ) ];

        assert && assert( phetioObject, 'should have a phetioObject here' );

        // Order matters here! The phetioIsArchetype needs to be first to ensure that the setPhetioDynamicElement
        // setter can opt out for archetypes.
        phetioObject.phetioIsArchetype = this.phetioIsArchetype;
        phetioObject.setPhetioDynamicElement( this.phetioDynamicElement );

        if ( phetioObject.phetioBaselineMetadata ) {
          phetioObject.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
        }
      }
    } );
  }

  /**
   * Used in PhetioEngine
   */
  public setPhetioDynamicElement( phetioDynamicElement: boolean ): void {
    assert && assert( !this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.' );
    assert && assert( this.isPhetioInstrumented() );

    // All archetypes are static (non-dynamic)
    this._phetioDynamicElement = this.phetioIsArchetype ? false : phetioDynamicElement;

    // For dynamic elements, indicate the corresponding archetype element so that clients like Studio can leverage
    // the archetype metadata. Static elements don't have archetypes.
    this.phetioArchetypePhetioID = phetioDynamicElement ? this.tandem.getArchetypalPhetioID() : null;

    // Keep the baseline metadata in sync.
    if ( this.phetioBaselineMetadata ) {
      this.phetioBaselineMetadata.phetioDynamicElement = this.phetioDynamicElement;
    }
  }

  /**
   * Mark this PhetioObject as an archetype for dynamic elements.
   */
  public markDynamicElementArchetype(): void {
    assert && assert( !this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.' );

    this.phetioIsArchetype = true;
    this.setPhetioDynamicElement( false ); // because archetypes aren't dynamic elements

    if ( this.phetioBaselineMetadata ) {
      this.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
    }

    // recompute for children also, but only if phet-io is enabled
    Tandem.PHET_IO_ENABLED && this.propagateDynamicFlagsToDescendants();
  }

  /**
   * A PhetioObject will only be instrumented if the tandem that was passed in was "supplied". See Tandem.supplied
   * for more info.
   */
  public isPhetioInstrumented(): boolean {
    return this.tandem && this.tandem.supplied;
  }

  /**
   * When an instrumented PhetioObject is linked with another instrumented PhetioObject, this creates a one-way
   * association which is rendered in Studio as a "symbolic" link or hyperlink. Many common code UI elements use this
   * automatically. To keep client sites simple, this has a graceful opt-out mechanism which makes this function a
   * no-op if either this PhetioObject or the target PhetioObject is not instrumented.
   * @param element - the target element. Must be instrumented for a LinkedElement to be created-- otherwise gracefully opts out
   * @param [options]
   */
  public addLinkedElement( element: LinkableElement, options?: LinkedElementOptions ): void {
    if ( !this.isPhetioInstrumented() ) {

      // set this to null so that you can't addLinkedElement on an uninitialized PhetioObject and then instrument
      // it afterwards.
      this.linkedElements = null;
      return;
    }

    // In some cases, UI components need to be wired up to a private (internal) Property which should neither be
    // instrumented nor linked.
    if ( PHET_IO_ENABLED && element.isPhetioInstrumented() ) {
      assert && assert( Array.isArray( this.linkedElements ), 'linkedElements should be an array' );
      this.linkedElements!.push( new LinkedElement( element, options ) );
    }
  }

  /**
   * Remove all linked elements linking to the provided PhetioObject. This will dispose all removed LinkedElements. This
   * will be graceful, and doesn't assume or assert that the provided PhetioObject has LinkedElement(s), it will just
   * remove them if they are there.
   */
  public removeLinkedElements( potentiallyLinkedElement: PhetioObject ): void {
    if ( this.isPhetioInstrumented() && this.linkedElements ) {
      assert && assert( potentiallyLinkedElement.isPhetioInstrumented() );

      const toRemove = this.linkedElements.filter( linkedElement => linkedElement.element === potentiallyLinkedElement );
      toRemove.forEach( linkedElement => {
        linkedElement.dispose();
        arrayRemove( this.linkedElements, linkedElement );
      } );
    }
  }

  /**
   * Performs cleanup after the sim's construction has finished.
   */
  public onSimulationConstructionCompleted(): void {

    // deletes the phetioBaselineMetadata, as it's no longer needed since validation is complete.
    this.phetioBaselineMetadata = null;
  }

  /**
   * Remove this phetioObject from PhET-iO. After disposal, this object is no longer interoperable. Also release any
   * other references created during its lifetime.
   *
   * In order to support the structured data stream, PhetioObjects must end the messages in the correct
   * sequence, without being interrupted by dispose() calls.  Therefore, we do not clear out any of the state
   * related to the endEvent.  Note this means it is acceptable (and expected) for endEvent() to be called on
   * disposed PhetioObjects.
   */
  public override dispose(): void {

    // The phetioEvent stack should resolve by the next frame, so that's when we check it.
    if ( assert && Tandem.PHET_IO_ENABLED && this.tandem.supplied ) {

      const descendants: PhetioObject[] = [];
      this.tandem.iterateDescendants( tandem => {
        if ( phet.phetio.phetioEngine.hasPhetioObject( tandem.phetioID ) ) {
          descendants.push( phet.phetio.phetioEngine.getPhetioObject( tandem.phetioID ) );
        }
      } );

      animationFrameTimer.runOnNextTick( () => {

        // Uninstrumented PhetioObjects don't have a phetioMessageStack attribute.
        assert && assert( !this.hasOwnProperty( 'phetioMessageStack' ) || this.phetioMessageStack.length === 0,
          'phetioMessageStack should be clear' );

        descendants.forEach( descendant => {
          assert && assert( descendant.isDisposed, `All descendants must be disposed by the next frame: ${descendant.tandem.phetioID}` );
        } );
      } );
    }

    // Detach from listeners and dispose the corresponding tandem. This must happen in PhET-iO brand and PhET brand
    // because in PhET brand, PhetioDynamicElementContainer dynamic elements would memory leak tandems (parent tandems
    // would retain references to their children).
    this.tandem.removePhetioObject( this );

    // Dispose LinkedElements
    if ( this.linkedElements ) {
      this.linkedElements.forEach( linkedElement => linkedElement.dispose() );
      this.linkedElements.length = 0;
    }

    super.dispose();
  }

  /**
   * JSONifiable metadata that describes the nature of the PhetioObject.  We must be able to read this
   * for baseline (before object fully constructed we use object) and after fully constructed
   * which includes overrides.
   * @param [object] - used to get metadata keys, can be a PhetioObject, or an options object
   *                          (see usage initializePhetioObject). If not provided, will instead use the value of "this"
   * @returns - metadata plucked from the passed in parameter
   */
  public getMetadata( object?: PhetioObjectMetadataInput ): PhetioObjectMetadata {
    object = object || this;
    const metadata: PhetioObjectMetadata = {
      phetioTypeName: object.phetioType.typeName,
      phetioDocumentation: object.phetioDocumentation,
      phetioState: object.phetioState,
      phetioReadOnly: object.phetioReadOnly,
      phetioEventType: EventType.phetioType.toStateObject( object.phetioEventType ),
      phetioHighFrequency: object.phetioHighFrequency,
      phetioPlayback: object.phetioPlayback,
      phetioDynamicElement: object.phetioDynamicElement,
      phetioIsArchetype: object.phetioIsArchetype,
      phetioFeatured: object.phetioFeatured,
      phetioDesigned: object.phetioDesigned
    };
    if ( object.phetioArchetypePhetioID ) {

      metadata.phetioArchetypePhetioID = object.phetioArchetypePhetioID;
    }
    return metadata;
  }

  // Public facing documentation, no need to include metadata that may we don't want clients knowing about
  public static readonly METADATA_DOCUMENTATION = 'Get metadata about the PhET-iO element. This includes the following keys:<ul>' +
                                                  '<li><strong>phetioTypeName:</strong> The name of the PhET-iO Type\n</li>' +
                                                  '<li><strong>phetioDocumentation:</strong> default - null. Useful notes about a PhET-iO element, shown in the PhET-iO Studio Wrapper</li>' +
                                                  '<li><strong>phetioState:</strong> default - true. When true, includes the PhET-iO element in the PhET-iO state\n</li>' +
                                                  '<li><strong>phetioReadOnly:</strong> default - false. When true, you can only get values from the PhET-iO element; no setting allowed.\n</li>' +
                                                  '<li><strong>phetioEventType:</strong> default - MODEL. The category of event that this element emits to the PhET-iO Data Stream.\n</li>' +
                                                  '<li><strong>phetioDynamicElement:</strong> default - false. If this element is a "dynamic element" that can be created and destroyed throughout the lifetime of the sim (as opposed to existing forever).\n</li>' +
                                                  '<li><strong>phetioIsArchetype:</strong> default - false. If this element is an archetype for a dynamic element.\n</li>' +
                                                  '<li><strong>phetioFeatured:</strong> default - false. If this is a featured PhET-iO element.\n</li>' +
                                                  '<li><strong>phetioArchetypePhetioID:</strong> default - \'\'. If an applicable dynamic element, this is the phetioID of its archetype.\n</li></ul>';


  public static create( options?: PhetioObjectOptions ): PhetioObject {
    return new PhetioObject( options );
  }
}

/**
 * Determine if any of the options keys are intended for PhetioObject. Semantically equivalent to
 * _.intersection( _.keys( options ), _.keys( DEFAULTS) ).length>0 but implemented imperatively to avoid memory or
 * performance issues. Also handles options.tandem differently.
 */
const specifiesNonTandemPhetioObjectKey = ( options: Record<string, IntentionalAny> ): boolean => {
  for ( const key in options ) {
    if ( key !== 'tandem' && options.hasOwnProperty( key ) && DEFAULTS.hasOwnProperty( key ) ) {
      return true;
    }
  }
  return false;
};

type LinkedElementOptions = PhetioObjectOptions;

/**
 * Internal class to avoid cyclic dependencies.
 */
class LinkedElement extends PhetioObject {
  public readonly element: LinkableElement;

  public constructor( coreElement: LinkableElement, providedOptions?: LinkedElementOptions ) {
    assert && assert( !!coreElement, 'coreElement should be defined' );

    const options = optionize<LinkedElementOptions, EmptySelfOptions, PhetioObjectOptions>()( {
      phetioType: LinkedElementIO,
      phetioState: true
    }, providedOptions );

    // References cannot be changed by PhET-iO
    assert && assert( !options.hasOwnProperty( 'phetioReadOnly' ), 'phetioReadOnly set by LinkedElement' );
    options.phetioReadOnly = true;

    // By default, this linked element's baseline value is the overridden value of the coreElement. This allows
    // the them to be in sync by default, but also allows the linked element to be overridden in studio.
    assert && assert( !options.hasOwnProperty( 'phetioFeatured' ), 'phetioFeatured set by LinkedElement' );
    options.phetioFeatured = coreElement.phetioFeatured;

    super( options );

    this.element = coreElement;
  }

  /**
   * LinkedElements listen to their core elements for phetioFeatured, so to avoid a dependency on overrides metadata
   * (when the core element's phetioFeatured is specified in the overrides file), ignore phetioFeatured for LinkedElements.
   * @param object - used to get metadata keys, can be a PhetioObject, or an options object
   *                          (see usage initializePhetioObject)
   * @returns - metadata plucked from the passed in parameter
   */
  public override getMetadata( object: PhetioObjectMetadataInput ): PhetioObjectMetadata {
    const phetioObjectMetadata = super.getMetadata( object );

    delete phetioObjectMetadata.phetioFeatured;
    return phetioObjectMetadata;
  }
}

tandemNamespace.register( 'PhetioObject', PhetioObject );
export { PhetioObject as default, LinkedElement };
