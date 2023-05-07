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
import validate from '../../axon/js/validate.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import merge from '../../phet-core/js/merge.js';
import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import EventType from './EventType.js';
import LinkedElementIO from './LinkedElementIO.js';
import phetioAPIValidation from './phetioAPIValidation.js';
import Tandem from './Tandem.js';
import TandemConstants from './TandemConstants.js';
import tandemNamespace from './tandemNamespace.js';
import IOType from './types/IOType.js';
import Disposable from '../../axon/js/Disposable.js';
// constants
const PHET_IO_ENABLED = Tandem.PHET_IO_ENABLED;
const IO_TYPE_VALIDATOR = {
  valueType: IOType,
  validationMessage: 'phetioType must be an IOType'
};
const BOOLEAN_VALIDATOR = {
  valueType: 'boolean'
};

// use "<br>" instead of newlines
const PHET_IO_DOCUMENTATION_VALIDATOR = {
  valueType: 'string',
  isValidValue: doc => !doc.includes('\n'),
  validationMessage: 'phetioDocumentation must be provided in the right format'
};
const PHET_IO_EVENT_TYPE_VALIDATOR = {
  valueType: EventType,
  validationMessage: 'invalid phetioEventType'
};
const OBJECT_VALIDATOR = {
  valueType: [Object, null]
};
const objectToPhetioID = phetioObject => phetioObject.tandem.phetioID;
// When an event is suppressed from the data stream, we keep track of it with this token.
const SKIPPING_MESSAGE = -1;
const DEFAULTS = {
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

assert && assert(EventType.phetioType.toStateObject(DEFAULTS.phetioEventType) === TandemConstants.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioEventType, 'phetioEventType must have the same default as the default metadata values.');

// Options for creating a PhetioObject

class PhetioObject extends Disposable {
  // assigned in initializePhetioObject - see docs at DEFAULTS declaration

  // track whether the object has been initialized.  This is necessary because initialization can happen in the
  // constructor or in a subsequent call to initializePhetioObject (to support scenery Node)
  // See documentation in DEFAULTS
  // Public only for PhetioObjectMetadataInput
  static DEFAULT_OPTIONS = DEFAULTS;
  constructor(options) {
    super();
    this.tandem = DEFAULTS.tandem;
    this.phetioID = this.tandem.phetioID;
    this.phetioObjectInitialized = false;
    if (options) {
      this.initializePhetioObject({}, options);
    }
  }

  /**
   * Like SCENERY/Node, PhetioObject can be configured during construction or later with a mutate call.
   * Noop if provided options keys don't intersect with any key in DEFAULTS; baseOptions are ignored for this calculation.
   */
  initializePhetioObject(baseOptions, providedOptions) {
    assert && assert(providedOptions, 'initializePhetioObject must be called with providedOptions');

    // call before we exit early to support logging unsupplied Tandems.
    providedOptions.tandem && Tandem.onMissingTandem(providedOptions.tandem);

    // Make sure that required tandems are supplied
    if (Tandem.VALIDATION && providedOptions.tandem && providedOptions.tandem.required) {
      assert && assert(providedOptions.tandem.supplied, 'required tandems must be supplied');
    }

    // The presence of `tandem` indicates if this PhetioObject can be initialized. If not yet initialized, perhaps
    // it will be initialized later on, as in Node.mutate().
    if (!(PHET_IO_ENABLED && providedOptions.tandem && providedOptions.tandem.supplied)) {
      assert && !providedOptions.tandem && assert(!specifiesNonTandemPhetioObjectKey(providedOptions), 'only specify metadata when providing a Tandem');

      // In this case, the PhetioObject is not initialized, but still set tandem to maintain a consistent API for
      // creating the Tandem tree.
      if (providedOptions.tandem) {
        this.tandem = providedOptions.tandem;
        this.phetioID = this.tandem.phetioID;
      }
      return;
    }

    // assert this after the `specifiesPhetioObjectKey check to support something like:
    assert && assert(!this.phetioObjectInitialized, 'cannot initialize twice');

    // Guard validation on assert to avoid calling a large number of no-ops when assertions are disabled, see https://github.com/phetsims/tandem/issues/200
    assert && validate(providedOptions.tandem, {
      valueType: Tandem
    });
    const defaults = combineOptions({}, DEFAULTS, baseOptions);
    let options = optionize()(defaults, providedOptions);

    // validate options before assigning to properties
    assert && validate(options.phetioType, IO_TYPE_VALIDATOR);
    assert && validate(options.phetioState, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioState must be a boolean'
    }));
    assert && validate(options.phetioReadOnly, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioReadOnly must be a boolean'
    }));
    assert && validate(options.phetioEventType, PHET_IO_EVENT_TYPE_VALIDATOR);
    assert && validate(options.phetioDocumentation, PHET_IO_DOCUMENTATION_VALIDATOR);
    assert && validate(options.phetioHighFrequency, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioHighFrequency must be a boolean'
    }));
    assert && validate(options.phetioPlayback, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioPlayback must be a boolean'
    }));
    assert && validate(options.phetioFeatured, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioFeatured must be a boolean'
    }));
    assert && validate(options.phetioEventMetadata, merge({}, OBJECT_VALIDATOR, {
      validationMessage: 'object literal expected'
    }));
    assert && validate(options.phetioDynamicElement, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioDynamicElement must be a boolean'
    }));
    assert && validate(options.phetioDesigned, merge({}, BOOLEAN_VALIDATOR, {
      validationMessage: 'phetioDesigned must be a boolean'
    }));
    assert && assert(this.linkedElements !== null, 'this means addLinkedElement was called before instrumentation of this PhetioObject');

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
    this.phetioBaselineMetadata = phetioAPIValidation.enabled || phet.preloads.phetio.queryParameters.phetioEmitAPIBaseline ? this.getMetadata(merge({
      phetioIsArchetype: this.phetioIsArchetype,
      phetioArchetypePhetioID: this.phetioArchetypePhetioID
    }, options)) : null;

    // Dynamic elements should compare to their "archetypal" counterparts.  For example, this means that a Particle
    // in a PhetioGroup will take its overrides from the PhetioGroup archetype.
    const archetypalPhetioID = options.tandem.getArchetypalPhetioID();

    // Overrides are only defined for simulations, not for unit tests.  See https://github.com/phetsims/phet-io/issues/1461
    // Patch in the desired values from overrides, if any.
    if (window.phet.preloads.phetio.phetioElementsOverrides) {
      const overrides = window.phet.preloads.phetio.phetioElementsOverrides[archetypalPhetioID];
      if (overrides) {
        // No need to make a new object, since this "options" variable was created in the previous merge call above.
        options = optionize()(options, overrides);
      }
    }

    // (read-only) see docs at DEFAULTS declaration
    this.tandem = options.tandem;
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
    if (this._phetioPlayback) {
      this._phetioEventMetadata = this._phetioEventMetadata || {};
      assert && assert(!this._phetioEventMetadata.hasOwnProperty('playback'), 'phetioEventMetadata.playback should not already exist');
      this._phetioEventMetadata.playback = true;
    }

    // Alert that this PhetioObject is ready for cross-frame communication (thus becoming a "PhET-iO element" on the wrapper side.
    this.tandem.addPhetioObject(this);
    this.phetioObjectInitialized = true;
    if (assert && Tandem.VALIDATION && this.isPhetioInstrumented() && options.tandemNameSuffix) {
      const suffixArray = Array.isArray(options.tandemNameSuffix) ? options.tandemNameSuffix : [options.tandemNameSuffix];
      const matches = suffixArray.filter(suffix => {
        return this.tandem.name.endsWith(suffix) || this.tandem.name.endsWith(PhetioObject.swapCaseOfFirstCharacter(suffix));
      });
      assert && assert(matches.length > 0, 'Incorrect Tandem suffix, expected = ' + suffixArray.join(', ') + '. actual = ' + this.tandem.phetioID);
    }
  }
  static swapCaseOfFirstCharacter(string) {
    const firstChar = string[0];
    const newFirstChar = firstChar === firstChar.toLowerCase() ? firstChar.toUpperCase() : firstChar.toLowerCase();
    return newFirstChar + string.substring(1);
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioType() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioType only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioType;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioState() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioState only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioState;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioReadOnly() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioReadOnly only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioReadOnly;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioDocumentation() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDocumentation only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioDocumentation;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioEventType() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventType only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioEventType;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioHighFrequency() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioHighFrequency only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioHighFrequency;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioPlayback() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioPlayback only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioPlayback;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioDynamicElement() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDynamicElement only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioDynamicElement;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioFeatured() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioFeatured only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioFeatured;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioEventMetadata() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventMetadata only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioEventMetadata;
  }

  // throws an assertion error in brands other than PhET-iO
  get phetioDesigned() {
    assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDesigned only accessible for instrumented objects in PhET-iO brand.');
    return this._phetioDesigned;
  }

  /**
   * Start an event for the nested PhET-iO data stream.
   *
   * @param event - the name of the event
   * @param [providedOptions]
   */
  phetioStartEvent(event, providedOptions) {
    if (PHET_IO_ENABLED && this.isPhetioInstrumented()) {
      // only one or the other can be provided
      assert && assertMutuallyExclusiveOptions(providedOptions, ['data'], ['getData']);
      const options = optionize()({
        data: null,
        // function that, when called gets the data.
        getData: null
      }, providedOptions);
      assert && assert(this.phetioObjectInitialized, 'phetioObject should be initialized');
      assert && options.data && assert(typeof options.data === 'object');
      assert && options.getData && assert(typeof options.getData === 'function');
      assert && assert(arguments.length === 1 || arguments.length === 2, 'Prevent usage of incorrect signature');

      // TODO: don't drop PhET-iO events if they are created before we have a dataStream global. https://github.com/phetsims/phet-io/issues/1875
      if (!_.hasIn(window, 'phet.phetio.dataStream')) {
        // If you hit this, then it is likely related to https://github.com/phetsims/scenery/issues/1124 and we would like to know about it!
        // assert && assert( false, 'trying to create an event before the data stream exists' );

        this.phetioMessageStack.push(SKIPPING_MESSAGE);
        return;
      }

      // Opt out of certain events if queryParameter override is provided. Even for a low frequency data stream, high
      // frequency events can still be emitted when they have a low frequency ancestor.
      const skipHighFrequencyEvent = this.phetioHighFrequency && _.hasIn(window, 'phet.preloads.phetio.queryParameters') && !window.phet.preloads.phetio.queryParameters.phetioEmitHighFrequencyEvents && !phet.phetio.dataStream.isEmittingLowFrequencyEvent();

      // TODO: If there is no dataStream global defined, then we should handle this differently as to not drop the event that is triggered, see https://github.com/phetsims/phet-io/issues/1846
      const skipFromUndefinedDatastream = !assert && !_.hasIn(window, 'phet.phetio.dataStream');
      if (skipHighFrequencyEvent || this.phetioEventType === EventType.OPT_OUT || skipFromUndefinedDatastream) {
        this.phetioMessageStack.push(SKIPPING_MESSAGE);
        return;
      }

      // Only get the args if we are actually going to send the event.
      const data = options.getData ? options.getData() : options.data;
      this.phetioMessageStack.push(phet.phetio.dataStream.start(this.phetioEventType, this.tandem.phetioID, this.phetioType, event, data, this.phetioEventMetadata, this.phetioHighFrequency));

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
  phetioEndEvent() {
    if (PHET_IO_ENABLED && this.isPhetioInstrumented()) {
      assert && assert(this.phetioMessageStack.length > 0, 'Must have messages to pop');
      const topMessageIndex = this.phetioMessageStack.pop();

      // The message was started as a high frequency event to be skipped, so the end is a no-op
      if (topMessageIndex === SKIPPING_MESSAGE) {
        return;
      }
      this.phetioPlayback && phet.phetio.dataStream.popNonPlaybackable();
      phet.phetio.dataStream.end(topMessageIndex);
    }
  }

  /**
   * Set any instrumented descendants of this PhetioObject to the same value as this.phetioDynamicElement.
   */
  propagateDynamicFlagsToDescendants() {
    assert && assert(Tandem.PHET_IO_ENABLED, 'phet-io should be enabled');
    assert && assert(phet.phetio && phet.phetio.phetioEngine, 'Dynamic elements cannot be created statically before phetioEngine exists.');
    const phetioEngine = phet.phetio.phetioEngine;

    // in the same order as bufferedPhetioObjects
    const unlaunchedPhetioIDs = !Tandem.launched ? Tandem.bufferedPhetioObjects.map(objectToPhetioID) : [];
    this.tandem.iterateDescendants(tandem => {
      const phetioID = tandem.phetioID;
      if (phetioEngine.hasPhetioObject(phetioID) || !Tandem.launched && unlaunchedPhetioIDs.includes(phetioID)) {
        assert && assert(this.isPhetioInstrumented());
        const phetioObject = phetioEngine.hasPhetioObject(phetioID) ? phetioEngine.getPhetioObject(phetioID) : Tandem.bufferedPhetioObjects[unlaunchedPhetioIDs.indexOf(phetioID)];
        assert && assert(phetioObject, 'should have a phetioObject here');

        // Order matters here! The phetioIsArchetype needs to be first to ensure that the setPhetioDynamicElement
        // setter can opt out for archetypes.
        phetioObject.phetioIsArchetype = this.phetioIsArchetype;
        phetioObject.setPhetioDynamicElement(this.phetioDynamicElement);
        if (phetioObject.phetioBaselineMetadata) {
          phetioObject.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
        }
      }
    });
  }

  /**
   * Used in PhetioEngine
   */
  setPhetioDynamicElement(phetioDynamicElement) {
    assert && assert(!this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.');
    assert && assert(this.isPhetioInstrumented());

    // All archetypes are static (non-dynamic)
    this._phetioDynamicElement = this.phetioIsArchetype ? false : phetioDynamicElement;

    // For dynamic elements, indicate the corresponding archetype element so that clients like Studio can leverage
    // the archetype metadata. Static elements don't have archetypes.
    this.phetioArchetypePhetioID = phetioDynamicElement ? this.tandem.getArchetypalPhetioID() : null;

    // Keep the baseline metadata in sync.
    if (this.phetioBaselineMetadata) {
      this.phetioBaselineMetadata.phetioDynamicElement = this.phetioDynamicElement;
    }
  }

  /**
   * Mark this PhetioObject as an archetype for dynamic elements.
   */
  markDynamicElementArchetype() {
    assert && assert(!this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.');
    this.phetioIsArchetype = true;
    this.setPhetioDynamicElement(false); // because archetypes aren't dynamic elements

    if (this.phetioBaselineMetadata) {
      this.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
    }

    // recompute for children also, but only if phet-io is enabled
    Tandem.PHET_IO_ENABLED && this.propagateDynamicFlagsToDescendants();
  }

  /**
   * A PhetioObject will only be instrumented if the tandem that was passed in was "supplied". See Tandem.supplied
   * for more info.
   */
  isPhetioInstrumented() {
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
  addLinkedElement(element, options) {
    if (!this.isPhetioInstrumented()) {
      // set this to null so that you can't addLinkedElement on an uninitialized PhetioObject and then instrument
      // it afterwards.
      this.linkedElements = null;
      return;
    }

    // In some cases, UI components need to be wired up to a private (internal) Property which should neither be
    // instrumented nor linked.
    if (PHET_IO_ENABLED && element.isPhetioInstrumented()) {
      assert && assert(Array.isArray(this.linkedElements), 'linkedElements should be an array');
      this.linkedElements.push(new LinkedElement(element, options));
    }
  }

  /**
   * Remove all linked elements linking to the provided PhetioObject. This will dispose all removed LinkedElements. This
   * will be graceful, and doesn't assume or assert that the provided PhetioObject has LinkedElement(s), it will just
   * remove them if they are there.
   */
  removeLinkedElements(potentiallyLinkedElement) {
    if (this.isPhetioInstrumented() && this.linkedElements) {
      assert && assert(potentiallyLinkedElement.isPhetioInstrumented());
      const toRemove = this.linkedElements.filter(linkedElement => linkedElement.element === potentiallyLinkedElement);
      toRemove.forEach(linkedElement => {
        linkedElement.dispose();
        arrayRemove(this.linkedElements, linkedElement);
      });
    }
  }

  /**
   * Performs cleanup after the sim's construction has finished.
   */
  onSimulationConstructionCompleted() {
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
  dispose() {
    // The phetioEvent stack should resolve by the next frame, so that's when we check it.
    if (assert && Tandem.PHET_IO_ENABLED && this.tandem.supplied) {
      const descendants = [];
      this.tandem.iterateDescendants(tandem => {
        if (phet.phetio.phetioEngine.hasPhetioObject(tandem.phetioID)) {
          descendants.push(phet.phetio.phetioEngine.getPhetioObject(tandem.phetioID));
        }
      });
      animationFrameTimer.runOnNextTick(() => {
        // Uninstrumented PhetioObjects don't have a phetioMessageStack attribute.
        assert && assert(!this.hasOwnProperty('phetioMessageStack') || this.phetioMessageStack.length === 0, 'phetioMessageStack should be clear');
        descendants.forEach(descendant => {
          assert && assert(descendant.isDisposed, `All descendants must be disposed by the next frame: ${descendant.tandem.phetioID}`);
        });
      });
    }

    // Detach from listeners and dispose the corresponding tandem. This must happen in PhET-iO brand and PhET brand
    // because in PhET brand, PhetioDynamicElementContainer dynamic elements would memory leak tandems (parent tandems
    // would retain references to their children).
    this.tandem.removePhetioObject(this);

    // Dispose LinkedElements
    if (this.linkedElements) {
      this.linkedElements.forEach(linkedElement => linkedElement.dispose());
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
  getMetadata(object) {
    object = object || this;
    const metadata = {
      phetioTypeName: object.phetioType.typeName,
      phetioDocumentation: object.phetioDocumentation,
      phetioState: object.phetioState,
      phetioReadOnly: object.phetioReadOnly,
      phetioEventType: EventType.phetioType.toStateObject(object.phetioEventType),
      phetioHighFrequency: object.phetioHighFrequency,
      phetioPlayback: object.phetioPlayback,
      phetioDynamicElement: object.phetioDynamicElement,
      phetioIsArchetype: object.phetioIsArchetype,
      phetioFeatured: object.phetioFeatured,
      phetioDesigned: object.phetioDesigned
    };
    if (object.phetioArchetypePhetioID) {
      metadata.phetioArchetypePhetioID = object.phetioArchetypePhetioID;
    }
    return metadata;
  }

  // Public facing documentation, no need to include metadata that may we don't want clients knowing about
  static METADATA_DOCUMENTATION = 'Get metadata about the PhET-iO element. This includes the following keys:<ul>' + '<li><strong>phetioTypeName:</strong> The name of the PhET-iO Type\n</li>' + '<li><strong>phetioDocumentation:</strong> default - null. Useful notes about a PhET-iO element, shown in the PhET-iO Studio Wrapper</li>' + '<li><strong>phetioState:</strong> default - true. When true, includes the PhET-iO element in the PhET-iO state\n</li>' + '<li><strong>phetioReadOnly:</strong> default - false. When true, you can only get values from the PhET-iO element; no setting allowed.\n</li>' + '<li><strong>phetioEventType:</strong> default - MODEL. The category of event that this element emits to the PhET-iO Data Stream.\n</li>' + '<li><strong>phetioDynamicElement:</strong> default - false. If this element is a "dynamic element" that can be created and destroyed throughout the lifetime of the sim (as opposed to existing forever).\n</li>' + '<li><strong>phetioIsArchetype:</strong> default - false. If this element is an archetype for a dynamic element.\n</li>' + '<li><strong>phetioFeatured:</strong> default - false. If this is a featured PhET-iO element.\n</li>' + '<li><strong>phetioArchetypePhetioID:</strong> default - \'\'. If an applicable dynamic element, this is the phetioID of its archetype.\n</li></ul>';
  static create(options) {
    return new PhetioObject(options);
  }
}

/**
 * Determine if any of the options keys are intended for PhetioObject. Semantically equivalent to
 * _.intersection( _.keys( options ), _.keys( DEFAULTS) ).length>0 but implemented imperatively to avoid memory or
 * performance issues. Also handles options.tandem differently.
 */
const specifiesNonTandemPhetioObjectKey = options => {
  for (const key in options) {
    if (key !== 'tandem' && options.hasOwnProperty(key) && DEFAULTS.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
};
/**
 * Internal class to avoid cyclic dependencies.
 */
class LinkedElement extends PhetioObject {
  constructor(coreElement, providedOptions) {
    assert && assert(!!coreElement, 'coreElement should be defined');
    const options = optionize()({
      phetioType: LinkedElementIO,
      phetioState: true
    }, providedOptions);

    // References cannot be changed by PhET-iO
    assert && assert(!options.hasOwnProperty('phetioReadOnly'), 'phetioReadOnly set by LinkedElement');
    options.phetioReadOnly = true;

    // By default, this linked element's baseline value is the overridden value of the coreElement. This allows
    // the them to be in sync by default, but also allows the linked element to be overridden in studio.
    assert && assert(!options.hasOwnProperty('phetioFeatured'), 'phetioFeatured set by LinkedElement');
    options.phetioFeatured = coreElement.phetioFeatured;
    super(options);
    this.element = coreElement;
  }

  /**
   * LinkedElements listen to their core elements for phetioFeatured, so to avoid a dependency on overrides metadata
   * (when the core element's phetioFeatured is specified in the overrides file), ignore phetioFeatured for LinkedElements.
   * @param object - used to get metadata keys, can be a PhetioObject, or an options object
   *                          (see usage initializePhetioObject)
   * @returns - metadata plucked from the passed in parameter
   */
  getMetadata(object) {
    const phetioObjectMetadata = super.getMetadata(object);
    delete phetioObjectMetadata.phetioFeatured;
    return phetioObjectMetadata;
  }
}
tandemNamespace.register('PhetioObject', PhetioObject);
export { PhetioObject as default, LinkedElement };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbmltYXRpb25GcmFtZVRpbWVyIiwidmFsaWRhdGUiLCJhcnJheVJlbW92ZSIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm1lcmdlIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJFdmVudFR5cGUiLCJMaW5rZWRFbGVtZW50SU8iLCJwaGV0aW9BUElWYWxpZGF0aW9uIiwiVGFuZGVtIiwiVGFuZGVtQ29uc3RhbnRzIiwidGFuZGVtTmFtZXNwYWNlIiwiSU9UeXBlIiwiRGlzcG9zYWJsZSIsIlBIRVRfSU9fRU5BQkxFRCIsIklPX1RZUEVfVkFMSURBVE9SIiwidmFsdWVUeXBlIiwidmFsaWRhdGlvbk1lc3NhZ2UiLCJCT09MRUFOX1ZBTElEQVRPUiIsIlBIRVRfSU9fRE9DVU1FTlRBVElPTl9WQUxJREFUT1IiLCJpc1ZhbGlkVmFsdWUiLCJkb2MiLCJpbmNsdWRlcyIsIlBIRVRfSU9fRVZFTlRfVFlQRV9WQUxJREFUT1IiLCJPQkpFQ1RfVkFMSURBVE9SIiwiT2JqZWN0Iiwib2JqZWN0VG9QaGV0aW9JRCIsInBoZXRpb09iamVjdCIsInRhbmRlbSIsInBoZXRpb0lEIiwiU0tJUFBJTkdfTUVTU0FHRSIsIkRFRkFVTFRTIiwiT1BUSU9OQUwiLCJwaGV0aW9UeXBlIiwiT2JqZWN0SU8iLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMiLCJwaGV0aW9TdGF0ZSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRXZlbnRUeXBlIiwiTU9ERUwiLCJwaGV0aW9IaWdoRnJlcXVlbmN5IiwicGhldGlvUGxheWJhY2siLCJwaGV0aW9GZWF0dXJlZCIsInBoZXRpb0R5bmFtaWNFbGVtZW50IiwicGhldGlvRGVzaWduZWQiLCJwaGV0aW9FdmVudE1ldGFkYXRhIiwidGFuZGVtTmFtZVN1ZmZpeCIsImFzc2VydCIsInRvU3RhdGVPYmplY3QiLCJQaGV0aW9PYmplY3QiLCJERUZBVUxUX09QVElPTlMiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJwaGV0aW9PYmplY3RJbml0aWFsaXplZCIsImluaXRpYWxpemVQaGV0aW9PYmplY3QiLCJiYXNlT3B0aW9ucyIsInByb3ZpZGVkT3B0aW9ucyIsIm9uTWlzc2luZ1RhbmRlbSIsIlZBTElEQVRJT04iLCJyZXF1aXJlZCIsInN1cHBsaWVkIiwic3BlY2lmaWVzTm9uVGFuZGVtUGhldGlvT2JqZWN0S2V5IiwiZGVmYXVsdHMiLCJsaW5rZWRFbGVtZW50cyIsInBoZXRpb0lzQXJjaGV0eXBlIiwicGhldGlvQmFzZWxpbmVNZXRhZGF0YSIsImVuYWJsZWQiLCJwaGV0IiwicHJlbG9hZHMiLCJwaGV0aW8iLCJxdWVyeVBhcmFtZXRlcnMiLCJwaGV0aW9FbWl0QVBJQmFzZWxpbmUiLCJnZXRNZXRhZGF0YSIsInBoZXRpb0FyY2hldHlwZVBoZXRpb0lEIiwiYXJjaGV0eXBhbFBoZXRpb0lEIiwiZ2V0QXJjaGV0eXBhbFBoZXRpb0lEIiwid2luZG93IiwicGhldGlvRWxlbWVudHNPdmVycmlkZXMiLCJvdmVycmlkZXMiLCJfcGhldGlvVHlwZSIsIl9waGV0aW9TdGF0ZSIsIl9waGV0aW9SZWFkT25seSIsIl9waGV0aW9Eb2N1bWVudGF0aW9uIiwiX3BoZXRpb0V2ZW50VHlwZSIsIl9waGV0aW9IaWdoRnJlcXVlbmN5IiwiX3BoZXRpb1BsYXliYWNrIiwiX3BoZXRpb0R5bmFtaWNFbGVtZW50IiwiX3BoZXRpb0ZlYXR1cmVkIiwiX3BoZXRpb0V2ZW50TWV0YWRhdGEiLCJfcGhldGlvRGVzaWduZWQiLCJwaGV0aW9Ob3RpZmllZE9iamVjdENyZWF0ZWQiLCJwaGV0aW9NZXNzYWdlU3RhY2siLCJoYXNPd25Qcm9wZXJ0eSIsInBsYXliYWNrIiwiYWRkUGhldGlvT2JqZWN0IiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJzdWZmaXhBcnJheSIsIkFycmF5IiwiaXNBcnJheSIsIm1hdGNoZXMiLCJmaWx0ZXIiLCJzdWZmaXgiLCJuYW1lIiwiZW5kc1dpdGgiLCJzd2FwQ2FzZU9mRmlyc3RDaGFyYWN0ZXIiLCJsZW5ndGgiLCJqb2luIiwic3RyaW5nIiwiZmlyc3RDaGFyIiwibmV3Rmlyc3RDaGFyIiwidG9Mb3dlckNhc2UiLCJ0b1VwcGVyQ2FzZSIsInN1YnN0cmluZyIsInBoZXRpb1N0YXJ0RXZlbnQiLCJldmVudCIsImRhdGEiLCJnZXREYXRhIiwiYXJndW1lbnRzIiwiXyIsImhhc0luIiwicHVzaCIsInNraXBIaWdoRnJlcXVlbmN5RXZlbnQiLCJwaGV0aW9FbWl0SGlnaEZyZXF1ZW5jeUV2ZW50cyIsImRhdGFTdHJlYW0iLCJpc0VtaXR0aW5nTG93RnJlcXVlbmN5RXZlbnQiLCJza2lwRnJvbVVuZGVmaW5lZERhdGFzdHJlYW0iLCJPUFRfT1VUIiwic3RhcnQiLCJwdXNoTm9uUGxheWJhY2thYmxlIiwicGhldGlvRW5kRXZlbnQiLCJ0b3BNZXNzYWdlSW5kZXgiLCJwb3AiLCJwb3BOb25QbGF5YmFja2FibGUiLCJlbmQiLCJwcm9wYWdhdGVEeW5hbWljRmxhZ3NUb0Rlc2NlbmRhbnRzIiwicGhldGlvRW5naW5lIiwidW5sYXVuY2hlZFBoZXRpb0lEcyIsImxhdW5jaGVkIiwiYnVmZmVyZWRQaGV0aW9PYmplY3RzIiwibWFwIiwiaXRlcmF0ZURlc2NlbmRhbnRzIiwiaGFzUGhldGlvT2JqZWN0IiwiZ2V0UGhldGlvT2JqZWN0IiwiaW5kZXhPZiIsInNldFBoZXRpb0R5bmFtaWNFbGVtZW50IiwibWFya0R5bmFtaWNFbGVtZW50QXJjaGV0eXBlIiwiYWRkTGlua2VkRWxlbWVudCIsImVsZW1lbnQiLCJMaW5rZWRFbGVtZW50IiwicmVtb3ZlTGlua2VkRWxlbWVudHMiLCJwb3RlbnRpYWxseUxpbmtlZEVsZW1lbnQiLCJ0b1JlbW92ZSIsImxpbmtlZEVsZW1lbnQiLCJmb3JFYWNoIiwiZGlzcG9zZSIsIm9uU2ltdWxhdGlvbkNvbnN0cnVjdGlvbkNvbXBsZXRlZCIsImRlc2NlbmRhbnRzIiwicnVuT25OZXh0VGljayIsImRlc2NlbmRhbnQiLCJpc0Rpc3Bvc2VkIiwicmVtb3ZlUGhldGlvT2JqZWN0Iiwib2JqZWN0IiwibWV0YWRhdGEiLCJwaGV0aW9UeXBlTmFtZSIsInR5cGVOYW1lIiwiTUVUQURBVEFfRE9DVU1FTlRBVElPTiIsImNyZWF0ZSIsImtleSIsImNvcmVFbGVtZW50IiwicGhldGlvT2JqZWN0TWV0YWRhdGEiLCJyZWdpc3RlciIsImRlZmF1bHQiXSwic291cmNlcyI6WyJQaGV0aW9PYmplY3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSB0eXBlIHRoYXQgcHJvdmlkZXMgUGhFVC1pTyBmZWF0dXJlcy4gQW4gaW5zdHJ1bWVudGVkIFBoZXRpb09iamVjdCBpcyByZWZlcnJlZCB0byBvbiB0aGUgd3JhcHBlciBzaWRlL2Rlc2lnbiBzaWRlXHJcbiAqIGFzIGEgXCJQaEVULWlPIGVsZW1lbnRcIi4gIE5vdGUgdGhhdCBzaW1zIG1heSBoYXZlIGh1bmRyZWRzIG9yIHRob3VzYW5kcyBvZiBQaGV0aW9PYmplY3RzLCBzbyBwZXJmb3JtYW5jZSBhbmQgbWVtb3J5XHJcbiAqIGNvbnNpZGVyYXRpb25zIGFyZSBpbXBvcnRhbnQuICBGb3IgdGhpcyByZWFzb24sIGluaXRpYWxpemVQaGV0aW9PYmplY3QgaXMgb25seSBjYWxsZWQgaW4gUGhFVC1pTyBicmFuZCwgd2hpY2ggbWVhbnNcclxuICogbWFueSBvZiB0aGUgZ2V0dGVycyBzdWNoIGFzIGBwaGV0aW9TdGF0ZWAgYW5kIGBwaGV0aW9Eb2N1bWVudGF0aW9uYCB3aWxsIG5vdCB3b3JrIGluIG90aGVyIGJyYW5kcy4gV2UgaGF2ZSBvcHRlZFxyXG4gKiB0byBoYXZlIHRoZXNlIGdldHRlcnMgdGhyb3cgYXNzZXJ0aW9uIGVycm9ycyBpbiBvdGhlciBicmFuZHMgdG8gaGVscCBpZGVudGlmeSBwcm9ibGVtcyBpZiB0aGVzZSBhcmUgY2FsbGVkXHJcbiAqIHVuZXhwZWN0ZWRseS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBhbmltYXRpb25GcmFtZVRpbWVyIGZyb20gJy4uLy4uL2F4b24vanMvYW5pbWF0aW9uRnJhbWVUaW1lci5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4uLy4uL2F4b24vanMvdmFsaWRhdGUuanMnO1xyXG5pbXBvcnQgYXJyYXlSZW1vdmUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL2FycmF5UmVtb3ZlLmpzJztcclxuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIE9wdGlvbml6ZURlZmF1bHRzIH0gZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBFdmVudFR5cGUgZnJvbSAnLi9FdmVudFR5cGUuanMnO1xyXG5pbXBvcnQgTGlua2VkRWxlbWVudElPIGZyb20gJy4vTGlua2VkRWxlbWVudElPLmpzJztcclxuaW1wb3J0IHBoZXRpb0FQSVZhbGlkYXRpb24gZnJvbSAnLi9waGV0aW9BUElWYWxpZGF0aW9uLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBUYW5kZW1Db25zdGFudHMsIHsgUGhldGlvSUQsIFBoZXRpb09iamVjdE1ldGFkYXRhIH0gZnJvbSAnLi9UYW5kZW1Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4vdGFuZGVtTmFtZXNwYWNlLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuL3R5cGVzL0lPVHlwZS5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgRGlzcG9zYWJsZSBmcm9tICcuLi8uLi9heG9uL2pzL0Rpc3Bvc2FibGUuanMnO1xyXG5pbXBvcnQgTGlua2FibGVFbGVtZW50IGZyb20gJy4vTGlua2FibGVFbGVtZW50LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBQSEVUX0lPX0VOQUJMRUQgPSBUYW5kZW0uUEhFVF9JT19FTkFCTEVEO1xyXG5jb25zdCBJT19UWVBFX1ZBTElEQVRPUiA9IHsgdmFsdWVUeXBlOiBJT1R5cGUsIHZhbGlkYXRpb25NZXNzYWdlOiAncGhldGlvVHlwZSBtdXN0IGJlIGFuIElPVHlwZScgfTtcclxuY29uc3QgQk9PTEVBTl9WQUxJREFUT1IgPSB7IHZhbHVlVHlwZTogJ2Jvb2xlYW4nIH07XHJcblxyXG4vLyB1c2UgXCI8YnI+XCIgaW5zdGVhZCBvZiBuZXdsaW5lc1xyXG5jb25zdCBQSEVUX0lPX0RPQ1VNRU5UQVRJT05fVkFMSURBVE9SID0ge1xyXG4gIHZhbHVlVHlwZTogJ3N0cmluZycsXHJcbiAgaXNWYWxpZFZhbHVlOiAoIGRvYzogc3RyaW5nICkgPT4gIWRvYy5pbmNsdWRlcyggJ1xcbicgKSxcclxuICB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb0RvY3VtZW50YXRpb24gbXVzdCBiZSBwcm92aWRlZCBpbiB0aGUgcmlnaHQgZm9ybWF0J1xyXG59O1xyXG5jb25zdCBQSEVUX0lPX0VWRU5UX1RZUEVfVkFMSURBVE9SID0ge1xyXG4gIHZhbHVlVHlwZTogRXZlbnRUeXBlLFxyXG4gIHZhbGlkYXRpb25NZXNzYWdlOiAnaW52YWxpZCBwaGV0aW9FdmVudFR5cGUnXHJcbn07XHJcbmNvbnN0IE9CSkVDVF9WQUxJREFUT1IgPSB7IHZhbHVlVHlwZTogWyBPYmplY3QsIG51bGwgXSB9O1xyXG5cclxuY29uc3Qgb2JqZWN0VG9QaGV0aW9JRCA9ICggcGhldGlvT2JqZWN0OiBQaGV0aW9PYmplY3QgKSA9PiBwaGV0aW9PYmplY3QudGFuZGVtLnBoZXRpb0lEO1xyXG5cclxudHlwZSBTdGFydEV2ZW50T3B0aW9ucyA9IHtcclxuICBkYXRhPzogUmVjb3JkPHN0cmluZywgSW50ZW50aW9uYWxBbnk+IHwgbnVsbDtcclxuICBnZXREYXRhPzogKCAoKSA9PiBSZWNvcmQ8c3RyaW5nLCBJbnRlbnRpb25hbEFueT4gKSB8IG51bGw7XHJcbn07XHJcblxyXG4vLyBXaGVuIGFuIGV2ZW50IGlzIHN1cHByZXNzZWQgZnJvbSB0aGUgZGF0YSBzdHJlYW0sIHdlIGtlZXAgdHJhY2sgb2YgaXQgd2l0aCB0aGlzIHRva2VuLlxyXG5jb25zdCBTS0lQUElOR19NRVNTQUdFID0gLTE7XHJcblxyXG5jb25zdCBERUZBVUxUUzogT3B0aW9uaXplRGVmYXVsdHM8U3RyaWN0T21pdDxTZWxmT3B0aW9ucywgJ3BoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSc+PiA9IHtcclxuXHJcbiAgLy8gU3VidHlwZXMgY2FuIHVzZSBgVGFuZGVtLnRhbmRlbVJlcXVpcmVkYCB0byByZXF1aXJlIGEgbmFtZWQgdGFuZGVtIHBhc3NlZCBpblxyXG4gIHRhbmRlbTogVGFuZGVtLk9QVElPTkFMLFxyXG5cclxuICAvLyBEZWZpbmVzIEFQSSBtZXRob2RzLCBldmVudHMgYW5kIHNlcmlhbGl6YXRpb25cclxuICBwaGV0aW9UeXBlOiBJT1R5cGUuT2JqZWN0SU8sXHJcblxyXG4gIC8vIFVzZWZ1bCBub3RlcyBhYm91dCBhbiBpbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0LCBzaG93biBpbiB0aGUgUGhFVC1pTyBTdHVkaW8gV3JhcHBlci4gSXQncyBhbiBodG1sXHJcbiAgLy8gc3RyaW5nLCBzbyBcIjxicj5cIiB0YWdzIGFyZSByZXF1aXJlZCBpbnN0ZWFkIG9mIFwiXFxuXCIgY2hhcmFjdGVycyBmb3IgcHJvcGVyIHJlbmRlcmluZyBpbiBTdHVkaW9cclxuICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvRG9jdW1lbnRhdGlvbixcclxuXHJcbiAgLy8gV2hlbiB0cnVlLCBpbmNsdWRlcyB0aGUgUGhldGlvT2JqZWN0IGluIHRoZSBQaEVULWlPIHN0YXRlIChub3QgYXV0b21hdGljYWxseSByZWN1cnNpdmUsIG11c3QgYmUgc3BlY2lmaWVkIGZvclxyXG4gIC8vIGNoaWxkcmVuIGV4cGxpY2l0bHkpXHJcbiAgcGhldGlvU3RhdGU6IFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9TdGF0ZSxcclxuXHJcbiAgLy8gVGhpcyBvcHRpb24gY29udHJvbHMgaG93IFBoRVQtaU8gd3JhcHBlcnMgY2FuIGludGVyZmFjZSB3aXRoIHRoaXMgUGhldGlvT2JqZWN0LiBQcmVkb21pbmF0ZWx5IHRoaXMgb2NjdXJzIHZpYVxyXG4gIC8vIHB1YmxpYyBtZXRob2RzIGRlZmluZWQgb24gdGhpcyBQaGV0aW9PYmplY3QncyBwaGV0aW9UeXBlLCBpbiB3aGljaCBzb21lIG1ldGhvZCBhcmUgbm90IGV4ZWN1dGFibGUgd2hlbiB0aGlzIGZsYWdcclxuICAvLyBpcyB0cnVlLiBTZWUgYE9iamVjdElPLm1ldGhvZHNgIGZvciBmdXJ0aGVyIGRvY3VtZW50YXRpb24sIGVzcGVjaWFsbHkgcmVnYXJkaW5nIGBpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzYC5cclxuICAvLyBOT1RFOiBQaGV0aW9PYmplY3RzIHdpdGgge3BoZXRpb1N0YXRlOiB0cnVlfSBBTkQge3BoZXRpb1JlYWRPbmx5OiB0cnVlfSBhcmUgcmVzdG9yZWQgZHVyaW5nIHZpYSBzZXRTdGF0ZS5cclxuICBwaGV0aW9SZWFkT25seTogVGFuZGVtQ29uc3RhbnRzLlBIRVRfSU9fT0JKRUNUX01FVEFEQVRBX0RFRkFVTFRTLnBoZXRpb1JlYWRPbmx5LFxyXG5cclxuICAvLyBDYXRlZ29yeSBvZiBldmVudCB0eXBlLCBjYW4gYmUgb3ZlcnJpZGRlbiBpbiBwaGV0aW9TdGFydEV2ZW50IG9wdGlvbnMuICBDYW5ub3QgYmUgc3VwcGxpZWQgdGhyb3VnaCBUYW5kZW1Db25zdGFudHMgYmVjYXVzZVxyXG4gIC8vIHRoYXQgd291bGQgY3JlYXRlIGFuIGltcG9ydCBsb29wXHJcbiAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUuTU9ERUwsXHJcblxyXG4gIC8vIEhpZ2ggZnJlcXVlbmN5IGV2ZW50cyBzdWNoIGFzIG1vdXNlIG1vdmVzIGNhbiBiZSBvbWl0dGVkIGZyb20gZGF0YSBzdHJlYW0sIHNlZSA/cGhldGlvRW1pdEhpZ2hGcmVxdWVuY3lFdmVudHNcclxuICAvLyBhbmQgQ2xpZW50LmxhdW5jaFNpbSBvcHRpb25cclxuICAvLyBAZGVwcmVjYXRlZCAtIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTYyOSNpc3N1ZWNvbW1lbnQtNjA4MDAyNDEwXHJcbiAgcGhldGlvSGlnaEZyZXF1ZW5jeTogVGFuZGVtQ29uc3RhbnRzLlBIRVRfSU9fT0JKRUNUX01FVEFEQVRBX0RFRkFVTFRTLnBoZXRpb0hpZ2hGcmVxdWVuY3ksXHJcblxyXG4gIC8vIFdoZW4gdHJ1ZSwgZW1pdHMgZXZlbnRzIGZvciBkYXRhIHN0cmVhbXMgZm9yIHBsYXliYWNrLCBzZWUgaGFuZGxlUGxheWJhY2tFdmVudC5qc1xyXG4gIHBoZXRpb1BsYXliYWNrOiBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvUGxheWJhY2ssXHJcblxyXG4gIC8vIFdoZW4gdHJ1ZSwgdGhpcyBpcyBjYXRlZ29yaXplZCBhcyBhbiBpbXBvcnRhbnQgXCJmZWF0dXJlZFwiIGVsZW1lbnQgaW4gU3R1ZGlvLlxyXG4gIHBoZXRpb0ZlYXR1cmVkOiBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvRmVhdHVyZWQsXHJcblxyXG4gIC8vIGluZGljYXRlcyB0aGF0IGFuIG9iamVjdCBtYXkgb3IgbWF5IG5vdCBoYXZlIGJlZW4gY3JlYXRlZC4gQXBwbGllcyByZWN1cnNpdmVseSBhdXRvbWF0aWNhbGx5XHJcbiAgLy8gYW5kIHNob3VsZCBvbmx5IGJlIHNldCBtYW51YWxseSBvbiB0aGUgcm9vdCBkeW5hbWljIGVsZW1lbnQuIER5bmFtaWMgYXJjaGV0eXBlcyB3aWxsIGhhdmUgdGhpcyBvdmVyd3JpdHRlbiB0b1xyXG4gIC8vIGZhbHNlIGV2ZW4gaWYgZXhwbGljaXRseSBwcm92aWRlZCBhcyB0cnVlLCBhcyBhcmNoZXR5cGVzIGNhbm5vdCBiZSBkeW5hbWljLlxyXG4gIHBoZXRpb0R5bmFtaWNFbGVtZW50OiBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvRHluYW1pY0VsZW1lbnQsXHJcblxyXG4gIC8vIE1hcmtpbmcgcGhldGlvRGVzaWduZWQ6IHRydWUgb3B0cy1pbiB0byBBUEkgY2hhbmdlIGRldGVjdGlvbiB0b29saW5nIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2F0Y2ggaW5hZHZlcnRlbnRcclxuICAvLyBjaGFuZ2VzIHRvIGEgZGVzaWduZWQgQVBJLiAgQSBwaGV0aW9EZXNpZ25lZDp0cnVlIFBoZXRpb09iamVjdCAob3IgYW55IG9mIGl0cyB0YW5kZW0gZGVzY2VuZGFudHMpIHdpbGwgdGhyb3dcclxuICAvLyBhc3NlcnRpb24gZXJyb3JzIG9uIENUIChvciB3aGVuIHJ1bm5pbmcgd2l0aCA/cGhldGlvQ29tcGFyZUFQSSkgd2hlbiB0aGUgZm9sbG93aW5nIGFyZSB0cnVlOlxyXG4gIC8vIChhKSBpdHMgcGFja2FnZS5qc29uIGxpc3RzIGNvbXBhcmVEZXNpZ25lZEFQSUNoYW5nZXM6dHJ1ZSBpbiB0aGUgXCJwaGV0LWlvXCIgc2VjdGlvblxyXG4gIC8vIChiKSB0aGUgc2ltdWxhdGlvbiBpcyBsaXN0ZWQgaW4gcGVyZW5uaWFsL2RhdGEvcGhldC1pby1hcGktc3RhYmxlXHJcbiAgLy8gKGMpIGFueSBvZiBpdHMgbWV0YWRhdGEgdmFsdWVzIGRldmlhdGUgZnJvbSB0aGUgcmVmZXJlbmNlIEFQSVxyXG4gIHBoZXRpb0Rlc2lnbmVkOiBUYW5kZW1Db25zdGFudHMuUEhFVF9JT19PQkpFQ1RfTUVUQURBVEFfREVGQVVMVFMucGhldGlvRGVzaWduZWQsXHJcblxyXG4gIC8vIGRlbGl2ZXJlZCB3aXRoIGVhY2ggZXZlbnQsIGlmIHNwZWNpZmllZC4gcGhldGlvUGxheWJhY2sgaXMgYXBwZW5kZWQgaGVyZSwgaWYgdHJ1ZS5cclxuICAvLyBOb3RlOiB1bmxpa2Ugb3RoZXIgb3B0aW9ucywgdGhpcyBvcHRpb24gY2FuIGJlIG11dGF0ZWQgZG93bnN0cmVhbSwgYW5kIGhlbmNlIHNob3VsZCBiZSBjcmVhdGVkIG5ld2x5IGZvciBlYWNoIGluc3RhbmNlLlxyXG4gIHBoZXRpb0V2ZW50TWV0YWRhdGE6IG51bGwsXHJcblxyXG4gIHRhbmRlbU5hbWVTdWZmaXg6IG51bGxcclxufTtcclxuXHJcbi8vIElmIHlvdSBydW4gaW50byBhIHR5cGUgZXJyb3IgaGVyZSwgZmVlbCBmcmVlIHRvIGFkZCBhbnkgdHlwZSB0aGF0IGlzIHN1cHBvcnRlZCBieSB0aGUgYnJvd3NlcnMgXCJzdHJ1Y3R1cmVkIGNsb25pbmcgYWxnb3JpdGhtXCIgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYl9Xb3JrZXJzX0FQSS9TdHJ1Y3R1cmVkX2Nsb25lX2FsZ29yaXRobVxyXG50eXBlIEV2ZW50TWV0YWRhdGEgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyIHwgQXJyYXk8c3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlcj4+O1xyXG5cclxuYXNzZXJ0ICYmIGFzc2VydCggRXZlbnRUeXBlLnBoZXRpb1R5cGUudG9TdGF0ZU9iamVjdCggREVGQVVMVFMucGhldGlvRXZlbnRUeXBlICkgPT09IFRhbmRlbUNvbnN0YW50cy5QSEVUX0lPX09CSkVDVF9NRVRBREFUQV9ERUZBVUxUUy5waGV0aW9FdmVudFR5cGUsXHJcbiAgJ3BoZXRpb0V2ZW50VHlwZSBtdXN0IGhhdmUgdGhlIHNhbWUgZGVmYXVsdCBhcyB0aGUgZGVmYXVsdCBtZXRhZGF0YSB2YWx1ZXMuJyApO1xyXG5cclxuLy8gT3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBQaGV0aW9PYmplY3RcclxudHlwZSBTZWxmT3B0aW9ucyA9IFN0cmljdE9taXQ8UGFydGlhbDxQaGV0aW9PYmplY3RNZXRhZGF0YT4sICdwaGV0aW9UeXBlTmFtZScgfCAncGhldGlvQXJjaGV0eXBlUGhldGlvSUQnIHxcclxuICAncGhldGlvSXNBcmNoZXR5cGUnIHwgJ3BoZXRpb0V2ZW50VHlwZSc+ICYge1xyXG4gIHRhbmRlbT86IFRhbmRlbTtcclxuICBwaGV0aW9UeXBlPzogSU9UeXBlO1xyXG4gIHBoZXRpb0V2ZW50VHlwZT86IEV2ZW50VHlwZTtcclxuICBwaGV0aW9FdmVudE1ldGFkYXRhPzogRXZlbnRNZXRhZGF0YSB8IG51bGw7XHJcblxyXG4gIC8vIFJlcXVpcmUgdGhhdCB0aGUgZ2l2ZW4gdGFuZGVtJ3MgbmFtZSBlbmRzIGluIHRoZSBwcm92aWRlZCBzdHJpbmcuIFRoaXMgaXMgaGVscCB3aXRoIG5hbWluZyBjb252ZW50aW9ucy4gSWYgYW5cclxuICAvLyBhcnJheSBvZiBtdWx0aXBsZSBzdWZmaXhlcyBhcmUgcHJvdmlkZWQsIHJlcXVpcmUgdGhhdCB0aGUgcHJvdmlkZWQgdGFuZGVtIG1hdGNoZXMgYW55IG9mIHRoZSBzdXBwbGllZFxyXG4gIC8vIHRhbmRlbU5hbWVTdWZmaXggdmFsdWVzLiBGaXJzdCBjaGFyYWN0ZXIgaXMgbm90IGNhc2Ugc2Vuc2l0aXZlIHRvIHN1cHBvcnQgY2FzZXMgbGlrZVxyXG4gIC8vIHNpbS5zY3JlZW4xLnZpZXcudGhlcm1vbWV0ZXJOb2RlXHJcbiAgLy8gc2ltLnNjcmVlbjEudmlldy51cHBlclRoZXJtb21ldGVyTm9kZVxyXG4gIHRhbmRlbU5hbWVTdWZmaXg/OiBzdHJpbmcgfCBzdHJpbmdbXSB8IG51bGw7XHJcbn07XHJcbmV4cG9ydCB0eXBlIFBoZXRpb09iamVjdE9wdGlvbnMgPSBTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgUGhldGlvT2JqZWN0TWV0YWRhdGFLZXlzID0ga2V5b2YgKCBTdHJpY3RPbWl0PFBoZXRpb09iamVjdE1ldGFkYXRhLCAncGhldGlvVHlwZU5hbWUnIHwgJ3BoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSc+ICkgfCAncGhldGlvVHlwZSc7XHJcbmV4cG9ydCB0eXBlIFBoZXRpb09iamVjdE1ldGFkYXRhSW5wdXQgPSBQaWNrPFBoZXRpb09iamVjdCwgUGhldGlvT2JqZWN0TWV0YWRhdGFLZXlzPjtcclxuXHJcbmNsYXNzIFBoZXRpb09iamVjdCBleHRlbmRzIERpc3Bvc2FibGUge1xyXG5cclxuICAvLyBhc3NpZ25lZCBpbiBpbml0aWFsaXplUGhldGlvT2JqZWN0IC0gc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cclxuICBwdWJsaWMgdGFuZGVtOiBUYW5kZW07XHJcblxyXG4gIC8vIHRyYWNrIHdoZXRoZXIgdGhlIG9iamVjdCBoYXMgYmVlbiBpbml0aWFsaXplZC4gIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgaW5pdGlhbGl6YXRpb24gY2FuIGhhcHBlbiBpbiB0aGVcclxuICAvLyBjb25zdHJ1Y3RvciBvciBpbiBhIHN1YnNlcXVlbnQgY2FsbCB0byBpbml0aWFsaXplUGhldGlvT2JqZWN0ICh0byBzdXBwb3J0IHNjZW5lcnkgTm9kZSlcclxuICBwcml2YXRlIHBoZXRpb09iamVjdEluaXRpYWxpemVkOiBib29sZWFuO1xyXG5cclxuICAvLyBTZWUgZG9jdW1lbnRhdGlvbiBpbiBERUZBVUxUU1xyXG4gIHB1YmxpYyBwaGV0aW9Jc0FyY2hldHlwZSE6IGJvb2xlYW47XHJcbiAgcHVibGljIHBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEhOiBQaGV0aW9PYmplY3RNZXRhZGF0YSB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfcGhldGlvVHlwZSE6IElPVHlwZTtcclxuICBwcml2YXRlIF9waGV0aW9TdGF0ZSE6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBfcGhldGlvUmVhZE9ubHkhOiBib29sZWFuO1xyXG4gIHByaXZhdGUgX3BoZXRpb0RvY3VtZW50YXRpb24hOiBzdHJpbmc7XHJcbiAgcHJpdmF0ZSBfcGhldGlvRXZlbnRUeXBlITogRXZlbnRUeXBlO1xyXG4gIHByaXZhdGUgX3BoZXRpb0hpZ2hGcmVxdWVuY3khOiBib29sZWFuO1xyXG4gIHByaXZhdGUgX3BoZXRpb1BsYXliYWNrITogYm9vbGVhbjtcclxuICBwcml2YXRlIF9waGV0aW9EeW5hbWljRWxlbWVudCE6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBfcGhldGlvRmVhdHVyZWQhOiBib29sZWFuO1xyXG4gIHByaXZhdGUgX3BoZXRpb0V2ZW50TWV0YWRhdGEhOiBFdmVudE1ldGFkYXRhIHwgbnVsbDtcclxuICBwcml2YXRlIF9waGV0aW9EZXNpZ25lZCE6IGJvb2xlYW47XHJcblxyXG4gIC8vIFB1YmxpYyBvbmx5IGZvciBQaGV0aW9PYmplY3RNZXRhZGF0YUlucHV0XHJcbiAgcHVibGljIHBoZXRpb0FyY2hldHlwZVBoZXRpb0lEITogc3RyaW5nIHwgbnVsbDtcclxuICBwcml2YXRlIGxpbmtlZEVsZW1lbnRzITogTGlua2VkRWxlbWVudFtdIHwgbnVsbDtcclxuICBwdWJsaWMgcGhldGlvTm90aWZpZWRPYmplY3RDcmVhdGVkITogYm9vbGVhbjtcclxuICBwcml2YXRlIHBoZXRpb01lc3NhZ2VTdGFjayE6IG51bWJlcltdO1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREVGQVVMVF9PUFRJT05TID0gREVGQVVMVFM7XHJcbiAgcHVibGljIHBoZXRpb0lEOiBQaGV0aW9JRDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogUGhldGlvT2JqZWN0T3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy50YW5kZW0gPSBERUZBVUxUUy50YW5kZW07XHJcbiAgICB0aGlzLnBoZXRpb0lEID0gdGhpcy50YW5kZW0ucGhldGlvSUQ7XHJcbiAgICB0aGlzLnBoZXRpb09iamVjdEluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKCBvcHRpb25zICkge1xyXG4gICAgICB0aGlzLmluaXRpYWxpemVQaGV0aW9PYmplY3QoIHt9LCBvcHRpb25zICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBMaWtlIFNDRU5FUlkvTm9kZSwgUGhldGlvT2JqZWN0IGNhbiBiZSBjb25maWd1cmVkIGR1cmluZyBjb25zdHJ1Y3Rpb24gb3IgbGF0ZXIgd2l0aCBhIG11dGF0ZSBjYWxsLlxyXG4gICAqIE5vb3AgaWYgcHJvdmlkZWQgb3B0aW9ucyBrZXlzIGRvbid0IGludGVyc2VjdCB3aXRoIGFueSBrZXkgaW4gREVGQVVMVFM7IGJhc2VPcHRpb25zIGFyZSBpZ25vcmVkIGZvciB0aGlzIGNhbGN1bGF0aW9uLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBpbml0aWFsaXplUGhldGlvT2JqZWN0KCBiYXNlT3B0aW9uczogUGFydGlhbDxQaGV0aW9PYmplY3RPcHRpb25zPiwgcHJvdmlkZWRPcHRpb25zOiBQaGV0aW9PYmplY3RPcHRpb25zICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvdmlkZWRPcHRpb25zLCAnaW5pdGlhbGl6ZVBoZXRpb09iamVjdCBtdXN0IGJlIGNhbGxlZCB3aXRoIHByb3ZpZGVkT3B0aW9ucycgKTtcclxuXHJcbiAgICAvLyBjYWxsIGJlZm9yZSB3ZSBleGl0IGVhcmx5IHRvIHN1cHBvcnQgbG9nZ2luZyB1bnN1cHBsaWVkIFRhbmRlbXMuXHJcbiAgICBwcm92aWRlZE9wdGlvbnMudGFuZGVtICYmIFRhbmRlbS5vbk1pc3NpbmdUYW5kZW0oIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0gKTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgdGhhdCByZXF1aXJlZCB0YW5kZW1zIGFyZSBzdXBwbGllZFxyXG4gICAgaWYgKCBUYW5kZW0uVkFMSURBVElPTiAmJiBwcm92aWRlZE9wdGlvbnMudGFuZGVtICYmIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0ucmVxdWlyZWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uc3VwcGxpZWQsICdyZXF1aXJlZCB0YW5kZW1zIG11c3QgYmUgc3VwcGxpZWQnICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhlIHByZXNlbmNlIG9mIGB0YW5kZW1gIGluZGljYXRlcyBpZiB0aGlzIFBoZXRpb09iamVjdCBjYW4gYmUgaW5pdGlhbGl6ZWQuIElmIG5vdCB5ZXQgaW5pdGlhbGl6ZWQsIHBlcmhhcHNcclxuICAgIC8vIGl0IHdpbGwgYmUgaW5pdGlhbGl6ZWQgbGF0ZXIgb24sIGFzIGluIE5vZGUubXV0YXRlKCkuXHJcbiAgICBpZiAoICEoIFBIRVRfSU9fRU5BQkxFRCAmJiBwcm92aWRlZE9wdGlvbnMudGFuZGVtICYmIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0uc3VwcGxpZWQgKSApIHtcclxuICAgICAgYXNzZXJ0ICYmICFwcm92aWRlZE9wdGlvbnMudGFuZGVtICYmIGFzc2VydCggIXNwZWNpZmllc05vblRhbmRlbVBoZXRpb09iamVjdEtleSggcHJvdmlkZWRPcHRpb25zICksICdvbmx5IHNwZWNpZnkgbWV0YWRhdGEgd2hlbiBwcm92aWRpbmcgYSBUYW5kZW0nICk7XHJcblxyXG4gICAgICAvLyBJbiB0aGlzIGNhc2UsIHRoZSBQaGV0aW9PYmplY3QgaXMgbm90IGluaXRpYWxpemVkLCBidXQgc3RpbGwgc2V0IHRhbmRlbSB0byBtYWludGFpbiBhIGNvbnNpc3RlbnQgQVBJIGZvclxyXG4gICAgICAvLyBjcmVhdGluZyB0aGUgVGFuZGVtIHRyZWUuXHJcbiAgICAgIGlmICggcHJvdmlkZWRPcHRpb25zLnRhbmRlbSApIHtcclxuICAgICAgICB0aGlzLnRhbmRlbSA9IHByb3ZpZGVkT3B0aW9ucy50YW5kZW07XHJcbiAgICAgICAgdGhpcy5waGV0aW9JRCA9IHRoaXMudGFuZGVtLnBoZXRpb0lEO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhc3NlcnQgdGhpcyBhZnRlciB0aGUgYHNwZWNpZmllc1BoZXRpb09iamVjdEtleSBjaGVjayB0byBzdXBwb3J0IHNvbWV0aGluZyBsaWtlOlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucGhldGlvT2JqZWN0SW5pdGlhbGl6ZWQsICdjYW5ub3QgaW5pdGlhbGl6ZSB0d2ljZScgKTtcclxuXHJcbiAgICAvLyBHdWFyZCB2YWxpZGF0aW9uIG9uIGFzc2VydCB0byBhdm9pZCBjYWxsaW5nIGEgbGFyZ2UgbnVtYmVyIG9mIG5vLW9wcyB3aGVuIGFzc2VydGlvbnMgYXJlIGRpc2FibGVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvMjAwXHJcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIHByb3ZpZGVkT3B0aW9ucy50YW5kZW0sIHsgdmFsdWVUeXBlOiBUYW5kZW0gfSApO1xyXG5cclxuICAgIGNvbnN0IGRlZmF1bHRzID0gY29tYmluZU9wdGlvbnM8T3B0aW9uaXplRGVmYXVsdHM8UGhldGlvT2JqZWN0T3B0aW9ucz4+KCB7fSwgREVGQVVMVFMsIGJhc2VPcHRpb25zICk7XHJcblxyXG4gICAgbGV0IG9wdGlvbnMgPSBvcHRpb25pemU8UGhldGlvT2JqZWN0T3B0aW9ucz4oKSggZGVmYXVsdHMsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZhbGlkYXRlIG9wdGlvbnMgYmVmb3JlIGFzc2lnbmluZyB0byBwcm9wZXJ0aWVzXHJcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIG9wdGlvbnMucGhldGlvVHlwZSwgSU9fVFlQRV9WQUxJREFUT1IgKTtcclxuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9TdGF0ZSwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb1N0YXRlIG11c3QgYmUgYSBib29sZWFuJyB9ICkgKTtcclxuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9SZWFkT25seSwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb1JlYWRPbmx5IG11c3QgYmUgYSBib29sZWFuJyB9ICkgKTtcclxuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9FdmVudFR5cGUsIFBIRVRfSU9fRVZFTlRfVFlQRV9WQUxJREFUT1IgKTtcclxuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9Eb2N1bWVudGF0aW9uLCBQSEVUX0lPX0RPQ1VNRU5UQVRJT05fVkFMSURBVE9SICk7XHJcbiAgICBhc3NlcnQgJiYgdmFsaWRhdGUoIG9wdGlvbnMucGhldGlvSGlnaEZyZXF1ZW5jeSwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb0hpZ2hGcmVxdWVuY3kgbXVzdCBiZSBhIGJvb2xlYW4nIH0gKSApO1xyXG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb1BsYXliYWNrLCBtZXJnZSgge30sIEJPT0xFQU5fVkFMSURBVE9SLCB7IHZhbGlkYXRpb25NZXNzYWdlOiAncGhldGlvUGxheWJhY2sgbXVzdCBiZSBhIGJvb2xlYW4nIH0gKSApO1xyXG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkLCBtZXJnZSgge30sIEJPT0xFQU5fVkFMSURBVE9SLCB7IHZhbGlkYXRpb25NZXNzYWdlOiAncGhldGlvRmVhdHVyZWQgbXVzdCBiZSBhIGJvb2xlYW4nIH0gKSApO1xyXG4gICAgYXNzZXJ0ICYmIHZhbGlkYXRlKCBvcHRpb25zLnBoZXRpb0V2ZW50TWV0YWRhdGEsIG1lcmdlKCB7fSwgT0JKRUNUX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ29iamVjdCBsaXRlcmFsIGV4cGVjdGVkJyB9ICkgKTtcclxuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9EeW5hbWljRWxlbWVudCwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb0R5bmFtaWNFbGVtZW50IG11c3QgYmUgYSBib29sZWFuJyB9ICkgKTtcclxuICAgIGFzc2VydCAmJiB2YWxpZGF0ZSggb3B0aW9ucy5waGV0aW9EZXNpZ25lZCwgbWVyZ2UoIHt9LCBCT09MRUFOX1ZBTElEQVRPUiwgeyB2YWxpZGF0aW9uTWVzc2FnZTogJ3BoZXRpb0Rlc2lnbmVkIG11c3QgYmUgYSBib29sZWFuJyB9ICkgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmxpbmtlZEVsZW1lbnRzICE9PSBudWxsLCAndGhpcyBtZWFucyBhZGRMaW5rZWRFbGVtZW50IHdhcyBjYWxsZWQgYmVmb3JlIGluc3RydW1lbnRhdGlvbiBvZiB0aGlzIFBoZXRpb09iamVjdCcgKTtcclxuXHJcbiAgICAvLyBvcHRpb25hbCAtIEluZGljYXRlcyB0aGF0IGFuIG9iamVjdCBpcyBhIGFyY2hldHlwZSBmb3IgYSBkeW5hbWljIGNsYXNzLiBTZXR0YWJsZSBvbmx5IGJ5XHJcbiAgICAvLyBQaGV0aW9FbmdpbmUgYW5kIGJ5IGNsYXNzZXMgdGhhdCBjcmVhdGUgZHluYW1pYyBlbGVtZW50cyB3aGVuIGNyZWF0aW5nIHRoZWlyIGFyY2hldHlwZSAobGlrZSBQaGV0aW9Hcm91cCkgdGhyb3VnaFxyXG4gICAgLy8gUGhldGlvT2JqZWN0Lm1hcmtEeW5hbWljRWxlbWVudEFyY2hldHlwZSgpLlxyXG4gICAgLy8gaWYgdHJ1ZSwgaXRlbXMgd2lsbCBiZSBleGNsdWRlZCBmcm9tIHBoZXRpb1N0YXRlLiBUaGlzIGFwcGxpZXMgcmVjdXJzaXZlbHkgYXV0b21hdGljYWxseS5cclxuICAgIHRoaXMucGhldGlvSXNBcmNoZXR5cGUgPSBmYWxzZTtcclxuXHJcbiAgICAvLyAocGhldGlvRW5naW5lKVxyXG4gICAgLy8gU3RvcmUgdGhlIGZ1bGwgYmFzZWxpbmUgZm9yIHVzYWdlIGluIHZhbGlkYXRpb24gb3IgZm9yIHVzYWdlIGluIHN0dWRpby4gIERvIHRoaXMgYmVmb3JlIGFwcGx5aW5nIG92ZXJyaWRlcy4gVGhlXHJcbiAgICAvLyBiYXNlbGluZSBpcyBjcmVhdGVkIHdoZW4gYSBzaW0gaXMgcnVuIHdpdGggYXNzZXJ0aW9ucyB0byBhc3Npc3QgaW4gcGhldGlvQVBJVmFsaWRhdGlvbi4gIEhvd2V2ZXIsIGV2ZW4gd2hlblxyXG4gICAgLy8gYXNzZXJ0aW9ucyBhcmUgZGlzYWJsZWQsIHNvbWUgd3JhcHBlcnMgc3VjaCBhcyBzdHVkaW8gbmVlZCB0byBnZW5lcmF0ZSB0aGUgYmFzZWxpbmUgYW55d2F5LlxyXG4gICAgLy8gbm90IGFsbCBtZXRhZGF0YSBhcmUgcGFzc2VkIHRocm91Z2ggdmlhIG9wdGlvbnMsIHNvIHN0b3JlIGJhc2VsaW5lIGZvciB0aGVzZSBhZGRpdGlvbmFsIHByb3BlcnRpZXNcclxuICAgIHRoaXMucGhldGlvQmFzZWxpbmVNZXRhZGF0YSA9ICggcGhldGlvQVBJVmFsaWRhdGlvbi5lbmFibGVkIHx8IHBoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycy5waGV0aW9FbWl0QVBJQmFzZWxpbmUgKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE1ldGFkYXRhKCBtZXJnZSgge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaGV0aW9Jc0FyY2hldHlwZTogdGhpcy5waGV0aW9Jc0FyY2hldHlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldGlvQXJjaGV0eXBlUGhldGlvSUQ6IHRoaXMucGhldGlvQXJjaGV0eXBlUGhldGlvSURcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9wdGlvbnMgKSApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGw7XHJcblxyXG4gICAgLy8gRHluYW1pYyBlbGVtZW50cyBzaG91bGQgY29tcGFyZSB0byB0aGVpciBcImFyY2hldHlwYWxcIiBjb3VudGVycGFydHMuICBGb3IgZXhhbXBsZSwgdGhpcyBtZWFucyB0aGF0IGEgUGFydGljbGVcclxuICAgIC8vIGluIGEgUGhldGlvR3JvdXAgd2lsbCB0YWtlIGl0cyBvdmVycmlkZXMgZnJvbSB0aGUgUGhldGlvR3JvdXAgYXJjaGV0eXBlLlxyXG4gICAgY29uc3QgYXJjaGV0eXBhbFBoZXRpb0lEID0gb3B0aW9ucy50YW5kZW0uZ2V0QXJjaGV0eXBhbFBoZXRpb0lEKCk7XHJcblxyXG4gICAgLy8gT3ZlcnJpZGVzIGFyZSBvbmx5IGRlZmluZWQgZm9yIHNpbXVsYXRpb25zLCBub3QgZm9yIHVuaXQgdGVzdHMuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE0NjFcclxuICAgIC8vIFBhdGNoIGluIHRoZSBkZXNpcmVkIHZhbHVlcyBmcm9tIG92ZXJyaWRlcywgaWYgYW55LlxyXG4gICAgaWYgKCB3aW5kb3cucGhldC5wcmVsb2Fkcy5waGV0aW8ucGhldGlvRWxlbWVudHNPdmVycmlkZXMgKSB7XHJcbiAgICAgIGNvbnN0IG92ZXJyaWRlcyA9IHdpbmRvdy5waGV0LnByZWxvYWRzLnBoZXRpby5waGV0aW9FbGVtZW50c092ZXJyaWRlc1sgYXJjaGV0eXBhbFBoZXRpb0lEIF07XHJcbiAgICAgIGlmICggb3ZlcnJpZGVzICkge1xyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIG1ha2UgYSBuZXcgb2JqZWN0LCBzaW5jZSB0aGlzIFwib3B0aW9uc1wiIHZhcmlhYmxlIHdhcyBjcmVhdGVkIGluIHRoZSBwcmV2aW91cyBtZXJnZSBjYWxsIGFib3ZlLlxyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25pemU8UGhldGlvT2JqZWN0T3B0aW9ucz4oKSggb3B0aW9ucywgb3ZlcnJpZGVzICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyAocmVhZC1vbmx5KSBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxyXG4gICAgdGhpcy50YW5kZW0gPSBvcHRpb25zLnRhbmRlbSE7XHJcbiAgICB0aGlzLnBoZXRpb0lEID0gdGhpcy50YW5kZW0ucGhldGlvSUQ7XHJcblxyXG4gICAgLy8gKHJlYWQtb25seSkgc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cclxuICAgIHRoaXMuX3BoZXRpb1R5cGUgPSBvcHRpb25zLnBoZXRpb1R5cGU7XHJcblxyXG4gICAgLy8gKHJlYWQtb25seSkgc2VlIGRvY3MgYXQgREVGQVVMVFMgZGVjbGFyYXRpb25cclxuICAgIHRoaXMuX3BoZXRpb1N0YXRlID0gb3B0aW9ucy5waGV0aW9TdGF0ZTtcclxuXHJcbiAgICAvLyAocmVhZC1vbmx5KSBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxyXG4gICAgdGhpcy5fcGhldGlvUmVhZE9ubHkgPSBvcHRpb25zLnBoZXRpb1JlYWRPbmx5O1xyXG5cclxuICAgIC8vIChyZWFkLW9ubHkpIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uXHJcbiAgICB0aGlzLl9waGV0aW9Eb2N1bWVudGF0aW9uID0gb3B0aW9ucy5waGV0aW9Eb2N1bWVudGF0aW9uO1xyXG5cclxuICAgIC8vIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uXHJcbiAgICB0aGlzLl9waGV0aW9FdmVudFR5cGUgPSBvcHRpb25zLnBoZXRpb0V2ZW50VHlwZTtcclxuXHJcbiAgICAvLyBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxyXG4gICAgdGhpcy5fcGhldGlvSGlnaEZyZXF1ZW5jeSA9IG9wdGlvbnMucGhldGlvSGlnaEZyZXF1ZW5jeTtcclxuXHJcbiAgICAvLyBzZWUgZG9jcyBhdCBERUZBVUxUUyBkZWNsYXJhdGlvblxyXG4gICAgdGhpcy5fcGhldGlvUGxheWJhY2sgPSBvcHRpb25zLnBoZXRpb1BsYXliYWNrO1xyXG5cclxuICAgIC8vIChQaGV0aW9FbmdpbmUpIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uIC0gaW4gb3JkZXIgdG8gcmVjdXJzaXZlbHkgcGFzcyB0aGlzIHZhbHVlIHRvXHJcbiAgICAvLyBjaGlsZHJlbiwgdGhlIHNldFBoZXRpb0R5bmFtaWNFbGVtZW50KCkgZnVuY3Rpb24gbXVzdCBiZSB1c2VkIGluc3RlYWQgb2Ygc2V0dGluZyB0aGlzIGF0dHJpYnV0ZSBkaXJlY3RseVxyXG4gICAgdGhpcy5fcGhldGlvRHluYW1pY0VsZW1lbnQgPSBvcHRpb25zLnBoZXRpb0R5bmFtaWNFbGVtZW50O1xyXG5cclxuICAgIC8vIChyZWFkLW9ubHkpIHNlZSBkb2NzIGF0IERFRkFVTFRTIGRlY2xhcmF0aW9uXHJcbiAgICB0aGlzLl9waGV0aW9GZWF0dXJlZCA9IG9wdGlvbnMucGhldGlvRmVhdHVyZWQ7XHJcblxyXG4gICAgdGhpcy5fcGhldGlvRXZlbnRNZXRhZGF0YSA9IG9wdGlvbnMucGhldGlvRXZlbnRNZXRhZGF0YTtcclxuXHJcbiAgICB0aGlzLl9waGV0aW9EZXNpZ25lZCA9IG9wdGlvbnMucGhldGlvRGVzaWduZWQ7XHJcblxyXG4gICAgLy8gZm9yIHBoZXRpb0R5bmFtaWNFbGVtZW50cywgdGhlIGNvcnJlc3BvbmRpbmcgcGhldGlvSUQgZm9yIHRoZSBlbGVtZW50IGluIHRoZSBhcmNoZXR5cGUgc3VidHJlZVxyXG4gICAgdGhpcy5waGV0aW9BcmNoZXR5cGVQaGV0aW9JRCA9IG51bGw7XHJcblxyXG4gICAgLy9rZWVwIHRyYWNrIG9mIExpbmtlZEVsZW1lbnRzIGZvciBkaXNwb3NhbC4gTnVsbCBvdXQgdG8gc3VwcG9ydCBhc3NlcnRpbmcgb25cclxuICAgIC8vIGVkZ2UgZXJyb3IgY2FzZXMsIHNlZSB0aGlzLmFkZExpbmtlZEVsZW1lbnQoKVxyXG4gICAgdGhpcy5saW5rZWRFbGVtZW50cyA9IFtdO1xyXG5cclxuICAgIC8vIChwaGV0LWlvKSBzZXQgdG8gdHJ1ZSB3aGVuIHRoaXMgUGhldGlvT2JqZWN0IGhhcyBiZWVuIHNlbnQgb3ZlciB0byB0aGUgcGFyZW50LlxyXG4gICAgdGhpcy5waGV0aW9Ob3RpZmllZE9iamVjdENyZWF0ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAvLyB0cmFja3MgdGhlIGluZGljZXMgb2Ygc3RhcnRlZCBtZXNzYWdlcyBzbyB0aGF0IGRhdGFTdHJlYW0gY2FuIGNoZWNrIHRoYXQgZW5kcyBtYXRjaCBzdGFydHMuXHJcbiAgICB0aGlzLnBoZXRpb01lc3NhZ2VTdGFjayA9IFtdO1xyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSBwbGF5YmFjayBzaG93cyBpbiB0aGUgcGhldGlvRXZlbnRNZXRhZGF0YVxyXG4gICAgaWYgKCB0aGlzLl9waGV0aW9QbGF5YmFjayApIHtcclxuICAgICAgdGhpcy5fcGhldGlvRXZlbnRNZXRhZGF0YSA9IHRoaXMuX3BoZXRpb0V2ZW50TWV0YWRhdGEgfHwge307XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9waGV0aW9FdmVudE1ldGFkYXRhLmhhc093blByb3BlcnR5KCAncGxheWJhY2snICksICdwaGV0aW9FdmVudE1ldGFkYXRhLnBsYXliYWNrIHNob3VsZCBub3QgYWxyZWFkeSBleGlzdCcgKTtcclxuICAgICAgdGhpcy5fcGhldGlvRXZlbnRNZXRhZGF0YS5wbGF5YmFjayA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWxlcnQgdGhhdCB0aGlzIFBoZXRpb09iamVjdCBpcyByZWFkeSBmb3IgY3Jvc3MtZnJhbWUgY29tbXVuaWNhdGlvbiAodGh1cyBiZWNvbWluZyBhIFwiUGhFVC1pTyBlbGVtZW50XCIgb24gdGhlIHdyYXBwZXIgc2lkZS5cclxuICAgIHRoaXMudGFuZGVtLmFkZFBoZXRpb09iamVjdCggdGhpcyApO1xyXG4gICAgdGhpcy5waGV0aW9PYmplY3RJbml0aWFsaXplZCA9IHRydWU7XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIG9wdGlvbnMudGFuZGVtTmFtZVN1ZmZpeCApIHtcclxuXHJcbiAgICAgIGNvbnN0IHN1ZmZpeEFycmF5ID0gQXJyYXkuaXNBcnJheSggb3B0aW9ucy50YW5kZW1OYW1lU3VmZml4ICkgPyBvcHRpb25zLnRhbmRlbU5hbWVTdWZmaXggOiBbIG9wdGlvbnMudGFuZGVtTmFtZVN1ZmZpeCBdO1xyXG4gICAgICBjb25zdCBtYXRjaGVzID0gc3VmZml4QXJyYXkuZmlsdGVyKCBzdWZmaXggPT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRhbmRlbS5uYW1lLmVuZHNXaXRoKCBzdWZmaXggKSB8fFxyXG4gICAgICAgICAgICAgICB0aGlzLnRhbmRlbS5uYW1lLmVuZHNXaXRoKCBQaGV0aW9PYmplY3Quc3dhcENhc2VPZkZpcnN0Q2hhcmFjdGVyKCBzdWZmaXggKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdGNoZXMubGVuZ3RoID4gMCwgJ0luY29ycmVjdCBUYW5kZW0gc3VmZml4LCBleHBlY3RlZCA9ICcgKyBzdWZmaXhBcnJheS5qb2luKCAnLCAnICkgKyAnLiBhY3R1YWwgPSAnICsgdGhpcy50YW5kZW0ucGhldGlvSUQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgc3dhcENhc2VPZkZpcnN0Q2hhcmFjdGVyKCBzdHJpbmc6IHN0cmluZyApOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZmlyc3RDaGFyID0gc3RyaW5nWyAwIF07XHJcbiAgICBjb25zdCBuZXdGaXJzdENoYXIgPSBmaXJzdENoYXIgPT09IGZpcnN0Q2hhci50b0xvd2VyQ2FzZSgpID8gZmlyc3RDaGFyLnRvVXBwZXJDYXNlKCkgOiBmaXJzdENoYXIudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiBuZXdGaXJzdENoYXIgKyBzdHJpbmcuc3Vic3RyaW5nKCAxICk7XHJcbiAgfVxyXG5cclxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb1R5cGUoKTogSU9UeXBlIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9UeXBlIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fcGhldGlvVHlwZTtcclxuICB9XHJcblxyXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xyXG4gIHB1YmxpYyBnZXQgcGhldGlvU3RhdGUoKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAncGhldGlvU3RhdGUgb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcclxuICAgIHJldHVybiB0aGlzLl9waGV0aW9TdGF0ZTtcclxuICB9XHJcblxyXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xyXG4gIHB1YmxpYyBnZXQgcGhldGlvUmVhZE9ubHkoKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAncGhldGlvUmVhZE9ubHkgb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcclxuICAgIHJldHVybiB0aGlzLl9waGV0aW9SZWFkT25seTtcclxuICB9XHJcblxyXG4gIC8vIHRocm93cyBhbiBhc3NlcnRpb24gZXJyb3IgaW4gYnJhbmRzIG90aGVyIHRoYW4gUGhFVC1pT1xyXG4gIHB1YmxpYyBnZXQgcGhldGlvRG9jdW1lbnRhdGlvbigpOiBzdHJpbmcge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb0RvY3VtZW50YXRpb24gb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcclxuICAgIHJldHVybiB0aGlzLl9waGV0aW9Eb2N1bWVudGF0aW9uO1xyXG4gIH1cclxuXHJcbiAgLy8gdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpbiBicmFuZHMgb3RoZXIgdGhhbiBQaEVULWlPXHJcbiAgcHVibGljIGdldCBwaGV0aW9FdmVudFR5cGUoKTogRXZlbnRUeXBlIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9FdmVudFR5cGUgb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcclxuICAgIHJldHVybiB0aGlzLl9waGV0aW9FdmVudFR5cGU7XHJcbiAgfVxyXG5cclxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb0hpZ2hGcmVxdWVuY3koKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBQSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpLCAncGhldGlvSGlnaEZyZXF1ZW5jeSBvbmx5IGFjY2Vzc2libGUgZm9yIGluc3RydW1lbnRlZCBvYmplY3RzIGluIFBoRVQtaU8gYnJhbmQuJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb0hpZ2hGcmVxdWVuY3k7XHJcbiAgfVxyXG5cclxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb1BsYXliYWNrKCk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb1BsYXliYWNrIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fcGhldGlvUGxheWJhY2s7XHJcbiAgfVxyXG5cclxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb0R5bmFtaWNFbGVtZW50KCk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb0R5bmFtaWNFbGVtZW50IG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fcGhldGlvRHluYW1pY0VsZW1lbnQ7XHJcbiAgfVxyXG5cclxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb0ZlYXR1cmVkKCk6IGJvb2xlYW4ge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb0ZlYXR1cmVkIG9ubHkgYWNjZXNzaWJsZSBmb3IgaW5zdHJ1bWVudGVkIG9iamVjdHMgaW4gUGhFVC1pTyBicmFuZC4nICk7XHJcbiAgICByZXR1cm4gdGhpcy5fcGhldGlvRmVhdHVyZWQ7XHJcbiAgfVxyXG5cclxuICAvLyB0aHJvd3MgYW4gYXNzZXJ0aW9uIGVycm9yIGluIGJyYW5kcyBvdGhlciB0aGFuIFBoRVQtaU9cclxuICBwdWJsaWMgZ2V0IHBoZXRpb0V2ZW50TWV0YWRhdGEoKTogRXZlbnRNZXRhZGF0YSB8IG51bGwge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgJ3BoZXRpb0V2ZW50TWV0YWRhdGEgb25seSBhY2Nlc3NpYmxlIGZvciBpbnN0cnVtZW50ZWQgb2JqZWN0cyBpbiBQaEVULWlPIGJyYW5kLicgKTtcclxuICAgIHJldHVybiB0aGlzLl9waGV0aW9FdmVudE1ldGFkYXRhO1xyXG4gIH1cclxuXHJcbiAgLy8gdGhyb3dzIGFuIGFzc2VydGlvbiBlcnJvciBpbiBicmFuZHMgb3RoZXIgdGhhbiBQaEVULWlPXHJcbiAgcHVibGljIGdldCBwaGV0aW9EZXNpZ25lZCgpOiBib29sZWFuIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdwaGV0aW9EZXNpZ25lZCBvbmx5IGFjY2Vzc2libGUgZm9yIGluc3RydW1lbnRlZCBvYmplY3RzIGluIFBoRVQtaU8gYnJhbmQuJyApO1xyXG4gICAgcmV0dXJuIHRoaXMuX3BoZXRpb0Rlc2lnbmVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhcnQgYW4gZXZlbnQgZm9yIHRoZSBuZXN0ZWQgUGhFVC1pTyBkYXRhIHN0cmVhbS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBldmVudCAtIHRoZSBuYW1lIG9mIHRoZSBldmVudFxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBwaGV0aW9TdGFydEV2ZW50KCBldmVudDogc3RyaW5nLCBwcm92aWRlZE9wdGlvbnM/OiBTdGFydEV2ZW50T3B0aW9ucyApOiB2b2lkIHtcclxuICAgIGlmICggUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcclxuXHJcbiAgICAgIC8vIG9ubHkgb25lIG9yIHRoZSBvdGhlciBjYW4gYmUgcHJvdmlkZWRcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyggcHJvdmlkZWRPcHRpb25zLCBbICdkYXRhJyBdLCBbICdnZXREYXRhJyBdICk7XHJcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8U3RhcnRFdmVudE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgICAgZGF0YTogbnVsbCxcclxuXHJcbiAgICAgICAgLy8gZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQgZ2V0cyB0aGUgZGF0YS5cclxuICAgICAgICBnZXREYXRhOiBudWxsXHJcbiAgICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5waGV0aW9PYmplY3RJbml0aWFsaXplZCwgJ3BoZXRpb09iamVjdCBzaG91bGQgYmUgaW5pdGlhbGl6ZWQnICk7XHJcbiAgICAgIGFzc2VydCAmJiBvcHRpb25zLmRhdGEgJiYgYXNzZXJ0KCB0eXBlb2Ygb3B0aW9ucy5kYXRhID09PSAnb2JqZWN0JyApO1xyXG4gICAgICBhc3NlcnQgJiYgb3B0aW9ucy5nZXREYXRhICYmIGFzc2VydCggdHlwZW9mIG9wdGlvbnMuZ2V0RGF0YSA9PT0gJ2Z1bmN0aW9uJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAxIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIsICdQcmV2ZW50IHVzYWdlIG9mIGluY29ycmVjdCBzaWduYXR1cmUnICk7XHJcblxyXG4gICAgICAvLyBUT0RPOiBkb24ndCBkcm9wIFBoRVQtaU8gZXZlbnRzIGlmIHRoZXkgYXJlIGNyZWF0ZWQgYmVmb3JlIHdlIGhhdmUgYSBkYXRhU3RyZWFtIGdsb2JhbC4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NzVcclxuICAgICAgaWYgKCAhXy5oYXNJbiggd2luZG93LCAncGhldC5waGV0aW8uZGF0YVN0cmVhbScgKSApIHtcclxuXHJcbiAgICAgICAgLy8gSWYgeW91IGhpdCB0aGlzLCB0aGVuIGl0IGlzIGxpa2VseSByZWxhdGVkIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zY2VuZXJ5L2lzc3Vlcy8xMTI0IGFuZCB3ZSB3b3VsZCBsaWtlIHRvIGtub3cgYWJvdXQgaXQhXHJcbiAgICAgICAgLy8gYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICd0cnlpbmcgdG8gY3JlYXRlIGFuIGV2ZW50IGJlZm9yZSB0aGUgZGF0YSBzdHJlYW0gZXhpc3RzJyApO1xyXG5cclxuICAgICAgICB0aGlzLnBoZXRpb01lc3NhZ2VTdGFjay5wdXNoKCBTS0lQUElOR19NRVNTQUdFICk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBPcHQgb3V0IG9mIGNlcnRhaW4gZXZlbnRzIGlmIHF1ZXJ5UGFyYW1ldGVyIG92ZXJyaWRlIGlzIHByb3ZpZGVkLiBFdmVuIGZvciBhIGxvdyBmcmVxdWVuY3kgZGF0YSBzdHJlYW0sIGhpZ2hcclxuICAgICAgLy8gZnJlcXVlbmN5IGV2ZW50cyBjYW4gc3RpbGwgYmUgZW1pdHRlZCB3aGVuIHRoZXkgaGF2ZSBhIGxvdyBmcmVxdWVuY3kgYW5jZXN0b3IuXHJcbiAgICAgIGNvbnN0IHNraXBIaWdoRnJlcXVlbmN5RXZlbnQgPSB0aGlzLnBoZXRpb0hpZ2hGcmVxdWVuY3kgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycycgKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXdpbmRvdy5waGV0LnByZWxvYWRzLnBoZXRpby5xdWVyeVBhcmFtZXRlcnMucGhldGlvRW1pdEhpZ2hGcmVxdWVuY3lFdmVudHMgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFwaGV0LnBoZXRpby5kYXRhU3RyZWFtLmlzRW1pdHRpbmdMb3dGcmVxdWVuY3lFdmVudCgpO1xyXG5cclxuICAgICAgLy8gVE9ETzogSWYgdGhlcmUgaXMgbm8gZGF0YVN0cmVhbSBnbG9iYWwgZGVmaW5lZCwgdGhlbiB3ZSBzaG91bGQgaGFuZGxlIHRoaXMgZGlmZmVyZW50bHkgYXMgdG8gbm90IGRyb3AgdGhlIGV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE4NDZcclxuICAgICAgY29uc3Qgc2tpcEZyb21VbmRlZmluZWREYXRhc3RyZWFtID0gIWFzc2VydCAmJiAhXy5oYXNJbiggd2luZG93LCAncGhldC5waGV0aW8uZGF0YVN0cmVhbScgKTtcclxuXHJcbiAgICAgIGlmICggc2tpcEhpZ2hGcmVxdWVuY3lFdmVudCB8fCB0aGlzLnBoZXRpb0V2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk9QVF9PVVQgfHwgc2tpcEZyb21VbmRlZmluZWREYXRhc3RyZWFtICkge1xyXG4gICAgICAgIHRoaXMucGhldGlvTWVzc2FnZVN0YWNrLnB1c2goIFNLSVBQSU5HX01FU1NBR0UgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE9ubHkgZ2V0IHRoZSBhcmdzIGlmIHdlIGFyZSBhY3R1YWxseSBnb2luZyB0byBzZW5kIHRoZSBldmVudC5cclxuICAgICAgY29uc3QgZGF0YSA9IG9wdGlvbnMuZ2V0RGF0YSA/IG9wdGlvbnMuZ2V0RGF0YSgpIDogb3B0aW9ucy5kYXRhO1xyXG5cclxuICAgICAgdGhpcy5waGV0aW9NZXNzYWdlU3RhY2sucHVzaChcclxuICAgICAgICBwaGV0LnBoZXRpby5kYXRhU3RyZWFtLnN0YXJ0KCB0aGlzLnBoZXRpb0V2ZW50VHlwZSwgdGhpcy50YW5kZW0ucGhldGlvSUQsIHRoaXMucGhldGlvVHlwZSwgZXZlbnQsIGRhdGEsIHRoaXMucGhldGlvRXZlbnRNZXRhZGF0YSwgdGhpcy5waGV0aW9IaWdoRnJlcXVlbmN5IClcclxuICAgICAgKTtcclxuXHJcbiAgICAgIC8vIFRvIHN1cHBvcnQgUGhFVC1pTyBwbGF5YmFjaywgYW55IHBvdGVudGlhbCBwbGF5YmFjayBldmVudHMgZG93bnN0cmVhbSBvZiB0aGlzIHBsYXliYWNrIGV2ZW50IG11c3QgYmUgbWFya2VkIGFzXHJcbiAgICAgIC8vIG5vbiBwbGF5YmFjayBldmVudHMuIFRoaXMgaXMgdG8gcHJldmVudCB0aGUgUGhFVC1pTyBwbGF5YmFjayBlbmdpbmUgZnJvbSByZXBlYXRpbmcgdGhvc2UgZXZlbnRzLiBTZWVcclxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE2OTNcclxuICAgICAgdGhpcy5waGV0aW9QbGF5YmFjayAmJiBwaGV0LnBoZXRpby5kYXRhU3RyZWFtLnB1c2hOb25QbGF5YmFja2FibGUoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEVuZCBhbiBldmVudCBvbiB0aGUgbmVzdGVkIFBoRVQtaU8gZGF0YSBzdHJlYW0uIEl0IHRoaXMgb2JqZWN0IHdhcyBkaXNwb3NlZCBvciBkYXRhU3RyZWFtLnN0YXJ0IHdhcyBub3QgY2FsbGVkLFxyXG4gICAqIHRoaXMgaXMgYSBuby1vcC5cclxuICAgKi9cclxuICBwdWJsaWMgcGhldGlvRW5kRXZlbnQoKTogdm9pZCB7XHJcbiAgICBpZiAoIFBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnBoZXRpb01lc3NhZ2VTdGFjay5sZW5ndGggPiAwLCAnTXVzdCBoYXZlIG1lc3NhZ2VzIHRvIHBvcCcgKTtcclxuICAgICAgY29uc3QgdG9wTWVzc2FnZUluZGV4ID0gdGhpcy5waGV0aW9NZXNzYWdlU3RhY2sucG9wKCk7XHJcblxyXG4gICAgICAvLyBUaGUgbWVzc2FnZSB3YXMgc3RhcnRlZCBhcyBhIGhpZ2ggZnJlcXVlbmN5IGV2ZW50IHRvIGJlIHNraXBwZWQsIHNvIHRoZSBlbmQgaXMgYSBuby1vcFxyXG4gICAgICBpZiAoIHRvcE1lc3NhZ2VJbmRleCA9PT0gU0tJUFBJTkdfTUVTU0FHRSApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5waGV0aW9QbGF5YmFjayAmJiBwaGV0LnBoZXRpby5kYXRhU3RyZWFtLnBvcE5vblBsYXliYWNrYWJsZSgpO1xyXG4gICAgICBwaGV0LnBoZXRpby5kYXRhU3RyZWFtLmVuZCggdG9wTWVzc2FnZUluZGV4ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgYW55IGluc3RydW1lbnRlZCBkZXNjZW5kYW50cyBvZiB0aGlzIFBoZXRpb09iamVjdCB0byB0aGUgc2FtZSB2YWx1ZSBhcyB0aGlzLnBoZXRpb0R5bmFtaWNFbGVtZW50LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBwcm9wYWdhdGVEeW5hbWljRmxhZ3NUb0Rlc2NlbmRhbnRzKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCwgJ3BoZXQtaW8gc2hvdWxkIGJlIGVuYWJsZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0LnBoZXRpbyAmJiBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUsICdEeW5hbWljIGVsZW1lbnRzIGNhbm5vdCBiZSBjcmVhdGVkIHN0YXRpY2FsbHkgYmVmb3JlIHBoZXRpb0VuZ2luZSBleGlzdHMuJyApO1xyXG4gICAgY29uc3QgcGhldGlvRW5naW5lID0gcGhldC5waGV0aW8ucGhldGlvRW5naW5lO1xyXG5cclxuICAgIC8vIGluIHRoZSBzYW1lIG9yZGVyIGFzIGJ1ZmZlcmVkUGhldGlvT2JqZWN0c1xyXG4gICAgY29uc3QgdW5sYXVuY2hlZFBoZXRpb0lEcyA9ICFUYW5kZW0ubGF1bmNoZWQgPyBUYW5kZW0uYnVmZmVyZWRQaGV0aW9PYmplY3RzLm1hcCggb2JqZWN0VG9QaGV0aW9JRCApIDogW107XHJcblxyXG4gICAgdGhpcy50YW5kZW0uaXRlcmF0ZURlc2NlbmRhbnRzKCB0YW5kZW0gPT4ge1xyXG4gICAgICBjb25zdCBwaGV0aW9JRCA9IHRhbmRlbS5waGV0aW9JRDtcclxuXHJcbiAgICAgIGlmICggcGhldGlvRW5naW5lLmhhc1BoZXRpb09iamVjdCggcGhldGlvSUQgKSB8fCAoICFUYW5kZW0ubGF1bmNoZWQgJiYgdW5sYXVuY2hlZFBoZXRpb0lEcy5pbmNsdWRlcyggcGhldGlvSUQgKSApICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApO1xyXG4gICAgICAgIGNvbnN0IHBoZXRpb09iamVjdCA9IHBoZXRpb0VuZ2luZS5oYXNQaGV0aW9PYmplY3QoIHBoZXRpb0lEICkgPyBwaGV0aW9FbmdpbmUuZ2V0UGhldGlvT2JqZWN0KCBwaGV0aW9JRCApIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUYW5kZW0uYnVmZmVyZWRQaGV0aW9PYmplY3RzWyB1bmxhdW5jaGVkUGhldGlvSURzLmluZGV4T2YoIHBoZXRpb0lEICkgXTtcclxuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldGlvT2JqZWN0LCAnc2hvdWxkIGhhdmUgYSBwaGV0aW9PYmplY3QgaGVyZScgKTtcclxuXHJcbiAgICAgICAgLy8gT3JkZXIgbWF0dGVycyBoZXJlISBUaGUgcGhldGlvSXNBcmNoZXR5cGUgbmVlZHMgdG8gYmUgZmlyc3QgdG8gZW5zdXJlIHRoYXQgdGhlIHNldFBoZXRpb0R5bmFtaWNFbGVtZW50XHJcbiAgICAgICAgLy8gc2V0dGVyIGNhbiBvcHQgb3V0IGZvciBhcmNoZXR5cGVzLlxyXG4gICAgICAgIHBoZXRpb09iamVjdC5waGV0aW9Jc0FyY2hldHlwZSA9IHRoaXMucGhldGlvSXNBcmNoZXR5cGU7XHJcbiAgICAgICAgcGhldGlvT2JqZWN0LnNldFBoZXRpb0R5bmFtaWNFbGVtZW50KCB0aGlzLnBoZXRpb0R5bmFtaWNFbGVtZW50ICk7XHJcblxyXG4gICAgICAgIGlmICggcGhldGlvT2JqZWN0LnBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEgKSB7XHJcbiAgICAgICAgICBwaGV0aW9PYmplY3QucGhldGlvQmFzZWxpbmVNZXRhZGF0YS5waGV0aW9Jc0FyY2hldHlwZSA9IHRoaXMucGhldGlvSXNBcmNoZXR5cGU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVc2VkIGluIFBoZXRpb0VuZ2luZVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXRQaGV0aW9EeW5hbWljRWxlbWVudCggcGhldGlvRHluYW1pY0VsZW1lbnQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5waGV0aW9Ob3RpZmllZE9iamVjdENyZWF0ZWQsICdzaG91bGQgbm90IGNoYW5nZSBkeW5hbWljIGVsZW1lbnQgZmxhZ3MgYWZ0ZXIgbm90aWZ5aW5nIHRoaXMgUGhldGlvT2JqZWN0XFwncyBjcmVhdGlvbi4nICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKTtcclxuXHJcbiAgICAvLyBBbGwgYXJjaGV0eXBlcyBhcmUgc3RhdGljIChub24tZHluYW1pYylcclxuICAgIHRoaXMuX3BoZXRpb0R5bmFtaWNFbGVtZW50ID0gdGhpcy5waGV0aW9Jc0FyY2hldHlwZSA/IGZhbHNlIDogcGhldGlvRHluYW1pY0VsZW1lbnQ7XHJcblxyXG4gICAgLy8gRm9yIGR5bmFtaWMgZWxlbWVudHMsIGluZGljYXRlIHRoZSBjb3JyZXNwb25kaW5nIGFyY2hldHlwZSBlbGVtZW50IHNvIHRoYXQgY2xpZW50cyBsaWtlIFN0dWRpbyBjYW4gbGV2ZXJhZ2VcclxuICAgIC8vIHRoZSBhcmNoZXR5cGUgbWV0YWRhdGEuIFN0YXRpYyBlbGVtZW50cyBkb24ndCBoYXZlIGFyY2hldHlwZXMuXHJcbiAgICB0aGlzLnBoZXRpb0FyY2hldHlwZVBoZXRpb0lEID0gcGhldGlvRHluYW1pY0VsZW1lbnQgPyB0aGlzLnRhbmRlbS5nZXRBcmNoZXR5cGFsUGhldGlvSUQoKSA6IG51bGw7XHJcblxyXG4gICAgLy8gS2VlcCB0aGUgYmFzZWxpbmUgbWV0YWRhdGEgaW4gc3luYy5cclxuICAgIGlmICggdGhpcy5waGV0aW9CYXNlbGluZU1ldGFkYXRhICkge1xyXG4gICAgICB0aGlzLnBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEucGhldGlvRHluYW1pY0VsZW1lbnQgPSB0aGlzLnBoZXRpb0R5bmFtaWNFbGVtZW50O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFyayB0aGlzIFBoZXRpb09iamVjdCBhcyBhbiBhcmNoZXR5cGUgZm9yIGR5bmFtaWMgZWxlbWVudHMuXHJcbiAgICovXHJcbiAgcHVibGljIG1hcmtEeW5hbWljRWxlbWVudEFyY2hldHlwZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnBoZXRpb05vdGlmaWVkT2JqZWN0Q3JlYXRlZCwgJ3Nob3VsZCBub3QgY2hhbmdlIGR5bmFtaWMgZWxlbWVudCBmbGFncyBhZnRlciBub3RpZnlpbmcgdGhpcyBQaGV0aW9PYmplY3RcXCdzIGNyZWF0aW9uLicgKTtcclxuXHJcbiAgICB0aGlzLnBoZXRpb0lzQXJjaGV0eXBlID0gdHJ1ZTtcclxuICAgIHRoaXMuc2V0UGhldGlvRHluYW1pY0VsZW1lbnQoIGZhbHNlICk7IC8vIGJlY2F1c2UgYXJjaGV0eXBlcyBhcmVuJ3QgZHluYW1pYyBlbGVtZW50c1xyXG5cclxuICAgIGlmICggdGhpcy5waGV0aW9CYXNlbGluZU1ldGFkYXRhICkge1xyXG4gICAgICB0aGlzLnBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEucGhldGlvSXNBcmNoZXR5cGUgPSB0aGlzLnBoZXRpb0lzQXJjaGV0eXBlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlY29tcHV0ZSBmb3IgY2hpbGRyZW4gYWxzbywgYnV0IG9ubHkgaWYgcGhldC1pbyBpcyBlbmFibGVkXHJcbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMucHJvcGFnYXRlRHluYW1pY0ZsYWdzVG9EZXNjZW5kYW50cygpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQSBQaGV0aW9PYmplY3Qgd2lsbCBvbmx5IGJlIGluc3RydW1lbnRlZCBpZiB0aGUgdGFuZGVtIHRoYXQgd2FzIHBhc3NlZCBpbiB3YXMgXCJzdXBwbGllZFwiLiBTZWUgVGFuZGVtLnN1cHBsaWVkXHJcbiAgICogZm9yIG1vcmUgaW5mby5cclxuICAgKi9cclxuICBwdWJsaWMgaXNQaGV0aW9JbnN0cnVtZW50ZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50YW5kZW0gJiYgdGhpcy50YW5kZW0uc3VwcGxpZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGFuIGluc3RydW1lbnRlZCBQaGV0aW9PYmplY3QgaXMgbGlua2VkIHdpdGggYW5vdGhlciBpbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0LCB0aGlzIGNyZWF0ZXMgYSBvbmUtd2F5XHJcbiAgICogYXNzb2NpYXRpb24gd2hpY2ggaXMgcmVuZGVyZWQgaW4gU3R1ZGlvIGFzIGEgXCJzeW1ib2xpY1wiIGxpbmsgb3IgaHlwZXJsaW5rLiBNYW55IGNvbW1vbiBjb2RlIFVJIGVsZW1lbnRzIHVzZSB0aGlzXHJcbiAgICogYXV0b21hdGljYWxseS4gVG8ga2VlcCBjbGllbnQgc2l0ZXMgc2ltcGxlLCB0aGlzIGhhcyBhIGdyYWNlZnVsIG9wdC1vdXQgbWVjaGFuaXNtIHdoaWNoIG1ha2VzIHRoaXMgZnVuY3Rpb24gYVxyXG4gICAqIG5vLW9wIGlmIGVpdGhlciB0aGlzIFBoZXRpb09iamVjdCBvciB0aGUgdGFyZ2V0IFBoZXRpb09iamVjdCBpcyBub3QgaW5zdHJ1bWVudGVkLlxyXG4gICAqIEBwYXJhbSBlbGVtZW50IC0gdGhlIHRhcmdldCBlbGVtZW50LiBNdXN0IGJlIGluc3RydW1lbnRlZCBmb3IgYSBMaW5rZWRFbGVtZW50IHRvIGJlIGNyZWF0ZWQtLSBvdGhlcndpc2UgZ3JhY2VmdWxseSBvcHRzIG91dFxyXG4gICAqIEBwYXJhbSBbb3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgYWRkTGlua2VkRWxlbWVudCggZWxlbWVudDogTGlua2FibGVFbGVtZW50LCBvcHRpb25zPzogTGlua2VkRWxlbWVudE9wdGlvbnMgKTogdm9pZCB7XHJcbiAgICBpZiAoICF0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICAvLyBzZXQgdGhpcyB0byBudWxsIHNvIHRoYXQgeW91IGNhbid0IGFkZExpbmtlZEVsZW1lbnQgb24gYW4gdW5pbml0aWFsaXplZCBQaGV0aW9PYmplY3QgYW5kIHRoZW4gaW5zdHJ1bWVudFxyXG4gICAgICAvLyBpdCBhZnRlcndhcmRzLlxyXG4gICAgICB0aGlzLmxpbmtlZEVsZW1lbnRzID0gbnVsbDtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEluIHNvbWUgY2FzZXMsIFVJIGNvbXBvbmVudHMgbmVlZCB0byBiZSB3aXJlZCB1cCB0byBhIHByaXZhdGUgKGludGVybmFsKSBQcm9wZXJ0eSB3aGljaCBzaG91bGQgbmVpdGhlciBiZVxyXG4gICAgLy8gaW5zdHJ1bWVudGVkIG5vciBsaW5rZWQuXHJcbiAgICBpZiAoIFBIRVRfSU9fRU5BQkxFRCAmJiBlbGVtZW50LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIHRoaXMubGlua2VkRWxlbWVudHMgKSwgJ2xpbmtlZEVsZW1lbnRzIHNob3VsZCBiZSBhbiBhcnJheScgKTtcclxuICAgICAgdGhpcy5saW5rZWRFbGVtZW50cyEucHVzaCggbmV3IExpbmtlZEVsZW1lbnQoIGVsZW1lbnQsIG9wdGlvbnMgKSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlIGFsbCBsaW5rZWQgZWxlbWVudHMgbGlua2luZyB0byB0aGUgcHJvdmlkZWQgUGhldGlvT2JqZWN0LiBUaGlzIHdpbGwgZGlzcG9zZSBhbGwgcmVtb3ZlZCBMaW5rZWRFbGVtZW50cy4gVGhpc1xyXG4gICAqIHdpbGwgYmUgZ3JhY2VmdWwsIGFuZCBkb2Vzbid0IGFzc3VtZSBvciBhc3NlcnQgdGhhdCB0aGUgcHJvdmlkZWQgUGhldGlvT2JqZWN0IGhhcyBMaW5rZWRFbGVtZW50KHMpLCBpdCB3aWxsIGp1c3RcclxuICAgKiByZW1vdmUgdGhlbSBpZiB0aGV5IGFyZSB0aGVyZS5cclxuICAgKi9cclxuICBwdWJsaWMgcmVtb3ZlTGlua2VkRWxlbWVudHMoIHBvdGVudGlhbGx5TGlua2VkRWxlbWVudDogUGhldGlvT2JqZWN0ICk6IHZvaWQge1xyXG4gICAgaWYgKCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgJiYgdGhpcy5saW5rZWRFbGVtZW50cyApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcG90ZW50aWFsbHlMaW5rZWRFbGVtZW50LmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKTtcclxuXHJcbiAgICAgIGNvbnN0IHRvUmVtb3ZlID0gdGhpcy5saW5rZWRFbGVtZW50cy5maWx0ZXIoIGxpbmtlZEVsZW1lbnQgPT4gbGlua2VkRWxlbWVudC5lbGVtZW50ID09PSBwb3RlbnRpYWxseUxpbmtlZEVsZW1lbnQgKTtcclxuICAgICAgdG9SZW1vdmUuZm9yRWFjaCggbGlua2VkRWxlbWVudCA9PiB7XHJcbiAgICAgICAgbGlua2VkRWxlbWVudC5kaXNwb3NlKCk7XHJcbiAgICAgICAgYXJyYXlSZW1vdmUoIHRoaXMubGlua2VkRWxlbWVudHMsIGxpbmtlZEVsZW1lbnQgKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUGVyZm9ybXMgY2xlYW51cCBhZnRlciB0aGUgc2ltJ3MgY29uc3RydWN0aW9uIGhhcyBmaW5pc2hlZC5cclxuICAgKi9cclxuICBwdWJsaWMgb25TaW11bGF0aW9uQ29uc3RydWN0aW9uQ29tcGxldGVkKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIGRlbGV0ZXMgdGhlIHBoZXRpb0Jhc2VsaW5lTWV0YWRhdGEsIGFzIGl0J3Mgbm8gbG9uZ2VyIG5lZWRlZCBzaW5jZSB2YWxpZGF0aW9uIGlzIGNvbXBsZXRlLlxyXG4gICAgdGhpcy5waGV0aW9CYXNlbGluZU1ldGFkYXRhID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSB0aGlzIHBoZXRpb09iamVjdCBmcm9tIFBoRVQtaU8uIEFmdGVyIGRpc3Bvc2FsLCB0aGlzIG9iamVjdCBpcyBubyBsb25nZXIgaW50ZXJvcGVyYWJsZS4gQWxzbyByZWxlYXNlIGFueVxyXG4gICAqIG90aGVyIHJlZmVyZW5jZXMgY3JlYXRlZCBkdXJpbmcgaXRzIGxpZmV0aW1lLlxyXG4gICAqXHJcbiAgICogSW4gb3JkZXIgdG8gc3VwcG9ydCB0aGUgc3RydWN0dXJlZCBkYXRhIHN0cmVhbSwgUGhldGlvT2JqZWN0cyBtdXN0IGVuZCB0aGUgbWVzc2FnZXMgaW4gdGhlIGNvcnJlY3RcclxuICAgKiBzZXF1ZW5jZSwgd2l0aG91dCBiZWluZyBpbnRlcnJ1cHRlZCBieSBkaXNwb3NlKCkgY2FsbHMuICBUaGVyZWZvcmUsIHdlIGRvIG5vdCBjbGVhciBvdXQgYW55IG9mIHRoZSBzdGF0ZVxyXG4gICAqIHJlbGF0ZWQgdG8gdGhlIGVuZEV2ZW50LiAgTm90ZSB0aGlzIG1lYW5zIGl0IGlzIGFjY2VwdGFibGUgKGFuZCBleHBlY3RlZCkgZm9yIGVuZEV2ZW50KCkgdG8gYmUgY2FsbGVkIG9uXHJcbiAgICogZGlzcG9zZWQgUGhldGlvT2JqZWN0cy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBUaGUgcGhldGlvRXZlbnQgc3RhY2sgc2hvdWxkIHJlc29sdmUgYnkgdGhlIG5leHQgZnJhbWUsIHNvIHRoYXQncyB3aGVuIHdlIGNoZWNrIGl0LlxyXG4gICAgaWYgKCBhc3NlcnQgJiYgVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLnRhbmRlbS5zdXBwbGllZCApIHtcclxuXHJcbiAgICAgIGNvbnN0IGRlc2NlbmRhbnRzOiBQaGV0aW9PYmplY3RbXSA9IFtdO1xyXG4gICAgICB0aGlzLnRhbmRlbS5pdGVyYXRlRGVzY2VuZGFudHMoIHRhbmRlbSA9PiB7XHJcbiAgICAgICAgaWYgKCBwaGV0LnBoZXRpby5waGV0aW9FbmdpbmUuaGFzUGhldGlvT2JqZWN0KCB0YW5kZW0ucGhldGlvSUQgKSApIHtcclxuICAgICAgICAgIGRlc2NlbmRhbnRzLnB1c2goIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5nZXRQaGV0aW9PYmplY3QoIHRhbmRlbS5waGV0aW9JRCApICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgICBhbmltYXRpb25GcmFtZVRpbWVyLnJ1bk9uTmV4dFRpY2soICgpID0+IHtcclxuXHJcbiAgICAgICAgLy8gVW5pbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0cyBkb24ndCBoYXZlIGEgcGhldGlvTWVzc2FnZVN0YWNrIGF0dHJpYnV0ZS5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5oYXNPd25Qcm9wZXJ0eSggJ3BoZXRpb01lc3NhZ2VTdGFjaycgKSB8fCB0aGlzLnBoZXRpb01lc3NhZ2VTdGFjay5sZW5ndGggPT09IDAsXHJcbiAgICAgICAgICAncGhldGlvTWVzc2FnZVN0YWNrIHNob3VsZCBiZSBjbGVhcicgKTtcclxuXHJcbiAgICAgICAgZGVzY2VuZGFudHMuZm9yRWFjaCggZGVzY2VuZGFudCA9PiB7XHJcbiAgICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBkZXNjZW5kYW50LmlzRGlzcG9zZWQsIGBBbGwgZGVzY2VuZGFudHMgbXVzdCBiZSBkaXNwb3NlZCBieSB0aGUgbmV4dCBmcmFtZTogJHtkZXNjZW5kYW50LnRhbmRlbS5waGV0aW9JRH1gICk7XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGV0YWNoIGZyb20gbGlzdGVuZXJzIGFuZCBkaXNwb3NlIHRoZSBjb3JyZXNwb25kaW5nIHRhbmRlbS4gVGhpcyBtdXN0IGhhcHBlbiBpbiBQaEVULWlPIGJyYW5kIGFuZCBQaEVUIGJyYW5kXHJcbiAgICAvLyBiZWNhdXNlIGluIFBoRVQgYnJhbmQsIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIGR5bmFtaWMgZWxlbWVudHMgd291bGQgbWVtb3J5IGxlYWsgdGFuZGVtcyAocGFyZW50IHRhbmRlbXNcclxuICAgIC8vIHdvdWxkIHJldGFpbiByZWZlcmVuY2VzIHRvIHRoZWlyIGNoaWxkcmVuKS5cclxuICAgIHRoaXMudGFuZGVtLnJlbW92ZVBoZXRpb09iamVjdCggdGhpcyApO1xyXG5cclxuICAgIC8vIERpc3Bvc2UgTGlua2VkRWxlbWVudHNcclxuICAgIGlmICggdGhpcy5saW5rZWRFbGVtZW50cyApIHtcclxuICAgICAgdGhpcy5saW5rZWRFbGVtZW50cy5mb3JFYWNoKCBsaW5rZWRFbGVtZW50ID0+IGxpbmtlZEVsZW1lbnQuZGlzcG9zZSgpICk7XHJcbiAgICAgIHRoaXMubGlua2VkRWxlbWVudHMubGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBKU09OaWZpYWJsZSBtZXRhZGF0YSB0aGF0IGRlc2NyaWJlcyB0aGUgbmF0dXJlIG9mIHRoZSBQaGV0aW9PYmplY3QuICBXZSBtdXN0IGJlIGFibGUgdG8gcmVhZCB0aGlzXHJcbiAgICogZm9yIGJhc2VsaW5lIChiZWZvcmUgb2JqZWN0IGZ1bGx5IGNvbnN0cnVjdGVkIHdlIHVzZSBvYmplY3QpIGFuZCBhZnRlciBmdWxseSBjb25zdHJ1Y3RlZFxyXG4gICAqIHdoaWNoIGluY2x1ZGVzIG92ZXJyaWRlcy5cclxuICAgKiBAcGFyYW0gW29iamVjdF0gLSB1c2VkIHRvIGdldCBtZXRhZGF0YSBrZXlzLCBjYW4gYmUgYSBQaGV0aW9PYmplY3QsIG9yIGFuIG9wdGlvbnMgb2JqZWN0XHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgIChzZWUgdXNhZ2UgaW5pdGlhbGl6ZVBoZXRpb09iamVjdCkuIElmIG5vdCBwcm92aWRlZCwgd2lsbCBpbnN0ZWFkIHVzZSB0aGUgdmFsdWUgb2YgXCJ0aGlzXCJcclxuICAgKiBAcmV0dXJucyAtIG1ldGFkYXRhIHBsdWNrZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlclxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRNZXRhZGF0YSggb2JqZWN0PzogUGhldGlvT2JqZWN0TWV0YWRhdGFJbnB1dCApOiBQaGV0aW9PYmplY3RNZXRhZGF0YSB7XHJcbiAgICBvYmplY3QgPSBvYmplY3QgfHwgdGhpcztcclxuICAgIGNvbnN0IG1ldGFkYXRhOiBQaGV0aW9PYmplY3RNZXRhZGF0YSA9IHtcclxuICAgICAgcGhldGlvVHlwZU5hbWU6IG9iamVjdC5waGV0aW9UeXBlLnR5cGVOYW1lLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiBvYmplY3QucGhldGlvRG9jdW1lbnRhdGlvbixcclxuICAgICAgcGhldGlvU3RhdGU6IG9iamVjdC5waGV0aW9TdGF0ZSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IG9iamVjdC5waGV0aW9SZWFkT25seSxcclxuICAgICAgcGhldGlvRXZlbnRUeXBlOiBFdmVudFR5cGUucGhldGlvVHlwZS50b1N0YXRlT2JqZWN0KCBvYmplY3QucGhldGlvRXZlbnRUeXBlICksXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IG9iamVjdC5waGV0aW9IaWdoRnJlcXVlbmN5LFxyXG4gICAgICBwaGV0aW9QbGF5YmFjazogb2JqZWN0LnBoZXRpb1BsYXliYWNrLFxyXG4gICAgICBwaGV0aW9EeW5hbWljRWxlbWVudDogb2JqZWN0LnBoZXRpb0R5bmFtaWNFbGVtZW50LFxyXG4gICAgICBwaGV0aW9Jc0FyY2hldHlwZTogb2JqZWN0LnBoZXRpb0lzQXJjaGV0eXBlLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogb2JqZWN0LnBoZXRpb0ZlYXR1cmVkLFxyXG4gICAgICBwaGV0aW9EZXNpZ25lZDogb2JqZWN0LnBoZXRpb0Rlc2lnbmVkXHJcbiAgICB9O1xyXG4gICAgaWYgKCBvYmplY3QucGhldGlvQXJjaGV0eXBlUGhldGlvSUQgKSB7XHJcblxyXG4gICAgICBtZXRhZGF0YS5waGV0aW9BcmNoZXR5cGVQaGV0aW9JRCA9IG9iamVjdC5waGV0aW9BcmNoZXR5cGVQaGV0aW9JRDtcclxuICAgIH1cclxuICAgIHJldHVybiBtZXRhZGF0YTtcclxuICB9XHJcblxyXG4gIC8vIFB1YmxpYyBmYWNpbmcgZG9jdW1lbnRhdGlvbiwgbm8gbmVlZCB0byBpbmNsdWRlIG1ldGFkYXRhIHRoYXQgbWF5IHdlIGRvbid0IHdhbnQgY2xpZW50cyBrbm93aW5nIGFib3V0XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNRVRBREFUQV9ET0NVTUVOVEFUSU9OID0gJ0dldCBtZXRhZGF0YSBhYm91dCB0aGUgUGhFVC1pTyBlbGVtZW50LiBUaGlzIGluY2x1ZGVzIHRoZSBmb2xsb3dpbmcga2V5czo8dWw+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnBoZXRpb1R5cGVOYW1lOjwvc3Ryb25nPiBUaGUgbmFtZSBvZiB0aGUgUGhFVC1pTyBUeXBlXFxuPC9saT4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvRG9jdW1lbnRhdGlvbjo8L3N0cm9uZz4gZGVmYXVsdCAtIG51bGwuIFVzZWZ1bCBub3RlcyBhYm91dCBhIFBoRVQtaU8gZWxlbWVudCwgc2hvd24gaW4gdGhlIFBoRVQtaU8gU3R1ZGlvIFdyYXBwZXI8L2xpPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5waGV0aW9TdGF0ZTo8L3N0cm9uZz4gZGVmYXVsdCAtIHRydWUuIFdoZW4gdHJ1ZSwgaW5jbHVkZXMgdGhlIFBoRVQtaU8gZWxlbWVudCBpbiB0aGUgUGhFVC1pTyBzdGF0ZVxcbjwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnBoZXRpb1JlYWRPbmx5Ojwvc3Ryb25nPiBkZWZhdWx0IC0gZmFsc2UuIFdoZW4gdHJ1ZSwgeW91IGNhbiBvbmx5IGdldCB2YWx1ZXMgZnJvbSB0aGUgUGhFVC1pTyBlbGVtZW50OyBubyBzZXR0aW5nIGFsbG93ZWQuXFxuPC9saT4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvRXZlbnRUeXBlOjwvc3Ryb25nPiBkZWZhdWx0IC0gTU9ERUwuIFRoZSBjYXRlZ29yeSBvZiBldmVudCB0aGF0IHRoaXMgZWxlbWVudCBlbWl0cyB0byB0aGUgUGhFVC1pTyBEYXRhIFN0cmVhbS5cXG48L2xpPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICc8bGk+PHN0cm9uZz5waGV0aW9EeW5hbWljRWxlbWVudDo8L3N0cm9uZz4gZGVmYXVsdCAtIGZhbHNlLiBJZiB0aGlzIGVsZW1lbnQgaXMgYSBcImR5bmFtaWMgZWxlbWVudFwiIHRoYXQgY2FuIGJlIGNyZWF0ZWQgYW5kIGRlc3Ryb3llZCB0aHJvdWdob3V0IHRoZSBsaWZldGltZSBvZiB0aGUgc2ltIChhcyBvcHBvc2VkIHRvIGV4aXN0aW5nIGZvcmV2ZXIpLlxcbjwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnBoZXRpb0lzQXJjaGV0eXBlOjwvc3Ryb25nPiBkZWZhdWx0IC0gZmFsc2UuIElmIHRoaXMgZWxlbWVudCBpcyBhbiBhcmNoZXR5cGUgZm9yIGEgZHluYW1pYyBlbGVtZW50LlxcbjwvbGk+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJzxsaT48c3Ryb25nPnBoZXRpb0ZlYXR1cmVkOjwvc3Ryb25nPiBkZWZhdWx0IC0gZmFsc2UuIElmIHRoaXMgaXMgYSBmZWF0dXJlZCBQaEVULWlPIGVsZW1lbnQuXFxuPC9saT4nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnPGxpPjxzdHJvbmc+cGhldGlvQXJjaGV0eXBlUGhldGlvSUQ6PC9zdHJvbmc+IGRlZmF1bHQgLSBcXCdcXCcuIElmIGFuIGFwcGxpY2FibGUgZHluYW1pYyBlbGVtZW50LCB0aGlzIGlzIHRoZSBwaGV0aW9JRCBvZiBpdHMgYXJjaGV0eXBlLlxcbjwvbGk+PC91bD4nO1xyXG5cclxuXHJcbiAgcHVibGljIHN0YXRpYyBjcmVhdGUoIG9wdGlvbnM/OiBQaGV0aW9PYmplY3RPcHRpb25zICk6IFBoZXRpb09iamVjdCB7XHJcbiAgICByZXR1cm4gbmV3IFBoZXRpb09iamVjdCggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIERldGVybWluZSBpZiBhbnkgb2YgdGhlIG9wdGlvbnMga2V5cyBhcmUgaW50ZW5kZWQgZm9yIFBoZXRpb09iamVjdC4gU2VtYW50aWNhbGx5IGVxdWl2YWxlbnQgdG9cclxuICogXy5pbnRlcnNlY3Rpb24oIF8ua2V5cyggb3B0aW9ucyApLCBfLmtleXMoIERFRkFVTFRTKSApLmxlbmd0aD4wIGJ1dCBpbXBsZW1lbnRlZCBpbXBlcmF0aXZlbHkgdG8gYXZvaWQgbWVtb3J5IG9yXHJcbiAqIHBlcmZvcm1hbmNlIGlzc3Vlcy4gQWxzbyBoYW5kbGVzIG9wdGlvbnMudGFuZGVtIGRpZmZlcmVudGx5LlxyXG4gKi9cclxuY29uc3Qgc3BlY2lmaWVzTm9uVGFuZGVtUGhldGlvT2JqZWN0S2V5ID0gKCBvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCBJbnRlbnRpb25hbEFueT4gKTogYm9vbGVhbiA9PiB7XHJcbiAgZm9yICggY29uc3Qga2V5IGluIG9wdGlvbnMgKSB7XHJcbiAgICBpZiAoIGtleSAhPT0gJ3RhbmRlbScgJiYgb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSgga2V5ICkgJiYgREVGQVVMVFMuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxudHlwZSBMaW5rZWRFbGVtZW50T3B0aW9ucyA9IFBoZXRpb09iamVjdE9wdGlvbnM7XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgY2xhc3MgdG8gYXZvaWQgY3ljbGljIGRlcGVuZGVuY2llcy5cclxuICovXHJcbmNsYXNzIExpbmtlZEVsZW1lbnQgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBMaW5rYWJsZUVsZW1lbnQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29yZUVsZW1lbnQ6IExpbmthYmxlRWxlbWVudCwgcHJvdmlkZWRPcHRpb25zPzogTGlua2VkRWxlbWVudE9wdGlvbnMgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhIWNvcmVFbGVtZW50LCAnY29yZUVsZW1lbnQgc2hvdWxkIGJlIGRlZmluZWQnICk7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxMaW5rZWRFbGVtZW50T3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgUGhldGlvT2JqZWN0T3B0aW9ucz4oKSgge1xyXG4gICAgICBwaGV0aW9UeXBlOiBMaW5rZWRFbGVtZW50SU8sXHJcbiAgICAgIHBoZXRpb1N0YXRlOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBSZWZlcmVuY2VzIGNhbm5vdCBiZSBjaGFuZ2VkIGJ5IFBoRVQtaU9cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmhhc093blByb3BlcnR5KCAncGhldGlvUmVhZE9ubHknICksICdwaGV0aW9SZWFkT25seSBzZXQgYnkgTGlua2VkRWxlbWVudCcgKTtcclxuICAgIG9wdGlvbnMucGhldGlvUmVhZE9ubHkgPSB0cnVlO1xyXG5cclxuICAgIC8vIEJ5IGRlZmF1bHQsIHRoaXMgbGlua2VkIGVsZW1lbnQncyBiYXNlbGluZSB2YWx1ZSBpcyB0aGUgb3ZlcnJpZGRlbiB2YWx1ZSBvZiB0aGUgY29yZUVsZW1lbnQuIFRoaXMgYWxsb3dzXHJcbiAgICAvLyB0aGUgdGhlbSB0byBiZSBpbiBzeW5jIGJ5IGRlZmF1bHQsIGJ1dCBhbHNvIGFsbG93cyB0aGUgbGlua2VkIGVsZW1lbnQgdG8gYmUgb3ZlcnJpZGRlbiBpbiBzdHVkaW8uXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eSggJ3BoZXRpb0ZlYXR1cmVkJyApLCAncGhldGlvRmVhdHVyZWQgc2V0IGJ5IExpbmtlZEVsZW1lbnQnICk7XHJcbiAgICBvcHRpb25zLnBoZXRpb0ZlYXR1cmVkID0gY29yZUVsZW1lbnQucGhldGlvRmVhdHVyZWQ7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmVsZW1lbnQgPSBjb3JlRWxlbWVudDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpbmtlZEVsZW1lbnRzIGxpc3RlbiB0byB0aGVpciBjb3JlIGVsZW1lbnRzIGZvciBwaGV0aW9GZWF0dXJlZCwgc28gdG8gYXZvaWQgYSBkZXBlbmRlbmN5IG9uIG92ZXJyaWRlcyBtZXRhZGF0YVxyXG4gICAqICh3aGVuIHRoZSBjb3JlIGVsZW1lbnQncyBwaGV0aW9GZWF0dXJlZCBpcyBzcGVjaWZpZWQgaW4gdGhlIG92ZXJyaWRlcyBmaWxlKSwgaWdub3JlIHBoZXRpb0ZlYXR1cmVkIGZvciBMaW5rZWRFbGVtZW50cy5cclxuICAgKiBAcGFyYW0gb2JqZWN0IC0gdXNlZCB0byBnZXQgbWV0YWRhdGEga2V5cywgY2FuIGJlIGEgUGhldGlvT2JqZWN0LCBvciBhbiBvcHRpb25zIG9iamVjdFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAoc2VlIHVzYWdlIGluaXRpYWxpemVQaGV0aW9PYmplY3QpXHJcbiAgICogQHJldHVybnMgLSBtZXRhZGF0YSBwbHVja2VkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0TWV0YWRhdGEoIG9iamVjdDogUGhldGlvT2JqZWN0TWV0YWRhdGFJbnB1dCApOiBQaGV0aW9PYmplY3RNZXRhZGF0YSB7XHJcbiAgICBjb25zdCBwaGV0aW9PYmplY3RNZXRhZGF0YSA9IHN1cGVyLmdldE1ldGFkYXRhKCBvYmplY3QgKTtcclxuXHJcbiAgICBkZWxldGUgcGhldGlvT2JqZWN0TWV0YWRhdGEucGhldGlvRmVhdHVyZWQ7XHJcbiAgICByZXR1cm4gcGhldGlvT2JqZWN0TWV0YWRhdGE7XHJcbiAgfVxyXG59XHJcblxyXG50YW5kZW1OYW1lc3BhY2UucmVnaXN0ZXIoICdQaGV0aW9PYmplY3QnLCBQaGV0aW9PYmplY3QgKTtcclxuZXhwb3J0IHsgUGhldGlvT2JqZWN0IGFzIGRlZmF1bHQsIExpbmtlZEVsZW1lbnQgfTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLG1CQUFtQixNQUFNLHNDQUFzQztBQUV0RSxPQUFPQyxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsOEJBQThCLE1BQU0sc0RBQXNEO0FBQ2pHLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQTZDLGlDQUFpQztBQUNoSCxPQUFPQyxTQUFTLE1BQU0sZ0JBQWdCO0FBQ3RDLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsbUJBQW1CLE1BQU0sMEJBQTBCO0FBQzFELE9BQU9DLE1BQU0sTUFBTSxhQUFhO0FBQ2hDLE9BQU9DLGVBQWUsTUFBMEMsc0JBQXNCO0FBQ3RGLE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFDbEQsT0FBT0MsTUFBTSxNQUFNLG1CQUFtQjtBQUV0QyxPQUFPQyxVQUFVLE1BQU0sNkJBQTZCO0FBR3BEO0FBQ0EsTUFBTUMsZUFBZSxHQUFHTCxNQUFNLENBQUNLLGVBQWU7QUFDOUMsTUFBTUMsaUJBQWlCLEdBQUc7RUFBRUMsU0FBUyxFQUFFSixNQUFNO0VBQUVLLGlCQUFpQixFQUFFO0FBQStCLENBQUM7QUFDbEcsTUFBTUMsaUJBQWlCLEdBQUc7RUFBRUYsU0FBUyxFQUFFO0FBQVUsQ0FBQzs7QUFFbEQ7QUFD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