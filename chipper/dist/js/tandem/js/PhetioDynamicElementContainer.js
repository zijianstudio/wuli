// Copyright 2019-2023, University of Colorado Boulder

/**
 * Supertype for containers that hold dynamic elements that are PhET-iO instrumented. This type handles common
 * features like creating the archetype for the PhET-iO API, and managing created/disposed data stream events.
 *
 * "Dynamic" is an overloaded term, so allow me to explain what it means in the context of this type. A "dynamic element"
 * is an instrumented PhET-iO element that is conditionally in the PhET-iO API. Most commonly this is because elements
 * can be created and destroyed during the runtime of the sim. Another "dynamic element" for the PhET-iO project is when
 * an element may or may not be created based on a query parameter. In this case, even if the object then exists for the
 * lifetime of the sim, we may still call this "dynamic" as it pertains to this type, and the PhET-iO API.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Emitter from '../../axon/js/Emitter.js';
import validate from '../../axon/js/validate.js';
import arrayRemove from '../../phet-core/js/arrayRemove.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import DynamicTandem from './DynamicTandem.js';
import PhetioObject from './PhetioObject.js';
import Tandem, { DYNAMIC_ARCHETYPE_NAME } from './Tandem.js';
import tandemNamespace from './tandemNamespace.js';
import StringIO from './types/StringIO.js';

// constants
const DEFAULT_CONTAINER_SUFFIX = 'Container';
function archetypeCast(archetype) {
  if (archetype === null) {
    throw new Error('archetype should exist');
  }
  return archetype;
}
class PhetioDynamicElementContainer extends PhetioObject {
  // (phet-io internal)

  // Arguments passed to the archetype when creating it.

  /**
   * @param createElement - function that creates a dynamic readonly element to be housed in
   * this container. All of this dynamic element container's elements will be created from this function, including the
   * archetype.
   * @param defaultArguments - arguments passed to createElement when creating the archetype
   * @param [providedOptions] - describe the Group itself
   */
  constructor(createElement, defaultArguments, providedOptions) {
    const options = optionize()({
      phetioState: false,
      // elements are included in state, but the container will exist in the downstream sim.

      // Many PhET-iO instrumented types live in common code used by multiple sims, and may only be instrumented in a subset of their usages.
      tandem: Tandem.OPTIONAL,
      supportsDynamicState: true,
      containerSuffix: DEFAULT_CONTAINER_SUFFIX,
      // TODO: https://github.com/phetsims/tandem/issues/254
      // @ts-expect-error - this is filled in below
      phetioDynamicElementName: undefined
    }, providedOptions);
    assert && assert(Array.isArray(defaultArguments) || typeof defaultArguments === 'function', 'defaultArguments should be an array or a function');
    if (Array.isArray(defaultArguments)) {
      // createElement expects a Tandem as the first arg
      assert && assert(createElement.length === defaultArguments.length + 1, 'mismatched number of arguments');
    }
    assert && Tandem.VALIDATION && assert(!!options.phetioType, 'phetioType must be supplied');
    assert && Tandem.VALIDATION && assert(Array.isArray(options.phetioType.parameterTypes), 'phetioType must supply its parameter types');
    assert && Tandem.VALIDATION && assert(options.phetioType.parameterTypes.length === 1, 'PhetioDynamicElementContainer\'s phetioType must have exactly one parameter type');
    assert && Tandem.VALIDATION && assert(!!options.phetioType.parameterTypes[0], 'PhetioDynamicElementContainer\'s phetioType\'s parameterType must be truthy');
    if (assert && options.tandem.supplied) {
      assert && Tandem.VALIDATION && assert(options.tandem.name.endsWith(options.containerSuffix), 'PhetioDynamicElementContainer tandems should end with options.containerSuffix');
    }

    // options that depend on other options
    options.phetioDynamicElementName = options.tandem.name.slice(0, options.tandem.name.length - options.containerSuffix.length);
    super(options);
    this.supportsDynamicState = options.supportsDynamicState;
    this.phetioDynamicElementName = options.phetioDynamicElementName;
    this.createElement = createElement;
    this.defaultArguments = defaultArguments;

    // Can be used as an argument to create other archetypes, but otherwise
    // access should not be needed. This will only be non-null when generating the PhET-iO API, see createArchetype().
    this._archetype = this.createArchetype();

    // subtypes expected to fire this according to individual implementations
    this.elementCreatedEmitter = new Emitter({
      parameters: [{
        valueType: PhetioObject,
        phetioType: options.phetioType.parameterTypes[0],
        name: 'element'
      }, {
        name: 'phetioID',
        phetioType: StringIO
      }],
      tandem: options.tandem.createTandem('elementCreatedEmitter'),
      phetioDocumentation: 'Emitter that fires whenever a new dynamic element is added to the container.'
    });

    // called on disposal of an element
    this.elementDisposedEmitter = new Emitter({
      parameters: [{
        valueType: PhetioObject,
        phetioType: options.phetioType.parameterTypes[0],
        name: 'element'
      }, {
        name: 'phetioID',
        phetioType: StringIO
      }],
      tandem: options.tandem.createTandem('elementDisposedEmitter'),
      phetioDocumentation: 'Emitter that fires whenever a dynamic element is removed from the container.'
    });

    // Emit to the data stream on element creation/disposal, no need to do this in PhET brand
    if (Tandem.PHET_IO_ENABLED) {
      this.elementCreatedEmitter.addListener(element => this.createdEventListener(element));
      this.elementDisposedEmitter.addListener(element => this.disposedEventListener(element));
    }

    // a way to delay creation notifications to a later time, for phet-io state engine support
    this.notificationsDeferred = false;

    // lists to keep track of the created and disposed elements when notifications are deferred.
    // These are used to then flush notifications when they are set to no longer be deferred.
    this.deferredCreations = [];
    this.deferredDisposals = [];

    // provide a way to opt out of containers clearing dynamic state, useful if group elements exist for the lifetime of
    // the sim, see https://github.com/phetsims/tandem/issues/132
    if (Tandem.PHET_IO_ENABLED && this.supportsDynamicState &&
    // don't clear archetypes because they are static.
    !this.phetioIsArchetype) {
      assert && assert(_.hasIn(window, 'phet.phetio.phetioEngine.phetioStateEngine'), 'PhetioDynamicElementContainers must be created once phetioEngine has been constructed');
      const phetioStateEngine = phet.phetio.phetioEngine.phetioStateEngine;

      // On state start, clear out the container and set to defer notifications.
      phetioStateEngine.clearDynamicElementsEmitter.addListener((state, scopeTandem) => {
        // Only clear if this PhetioDynamicElementContainer is in scope of the state to be set
        if (this.tandem.hasAncestor(scopeTandem)) {
          this.clear();
          this.setNotificationsDeferred(true);
        }
      });

      // done with state setting
      phetioStateEngine.stateSetEmitter.addListener(() => {
        if (this.notificationsDeferred) {
          this.setNotificationsDeferred(false);
        }
      });
      phetioStateEngine.addSetStateHelper((state, stillToSetIDs) => {
        let creationNotified = false;
        let iterationCount = 0;
        while (this.deferredCreations.length > 0) {
          if (iterationCount > 200) {
            throw new Error('Too many iterations in deferred creations, stillToSetIDs = ' + stillToSetIDs.join(', '));
          }
          const deferredCreatedElement = this.deferredCreations[0];
          if (this.stateSetOnAllChildrenOfDynamicElement(deferredCreatedElement.tandem.phetioID, stillToSetIDs)) {
            this.notifyElementCreatedWhileDeferred(deferredCreatedElement);
            creationNotified = true;
          }
          iterationCount++;
        }
        return creationNotified;
      });
    }
  }

  /**
   * @returns true if all children of a single dynamic element (based on phetioID) have had their state set already.
   */
  stateSetOnAllChildrenOfDynamicElement(dynamicElementID, stillToSetIDs) {
    for (let i = 0; i < stillToSetIDs.length; i++) {
      if (phetio.PhetioIDUtils.isAncestor(dynamicElementID, stillToSetIDs[i])) {
        return false;
      }
    }
    return true; // No elements in state that aren't in the completed list
  }

  /**
   * Archetypes are created to generate the baseline file, or to validate against an existing baseline file.  They are
   * PhetioObjects and registered with the phetioEngine, but not send out via notifications from PhetioEngine.phetioElementAddedEmitter(),
   * because they are intended for internal usage only.  Archetypes should not be created in production code.
   */
  createArchetype() {
    // Once the sim has started, any archetypes being created are likely done so because they are nested PhetioGroups.
    if (_.hasIn(window, 'phet.joist.sim') && phet.joist.sim.isConstructionCompleteProperty.value) {
      assert && assert(false, 'nested DynacmicElementContainers are not currently supported');
      return null;
    }

    // When generating the baseline, output the schema for the archetype
    if (Tandem.PHET_IO_ENABLED && phet.preloads.phetio.createArchetypes) {
      const defaultArgs = Array.isArray(this.defaultArguments) ? this.defaultArguments : this.defaultArguments();

      // The create function takes a tandem plus the default args
      assert && assert(this.createElement.length === defaultArgs.length + 1, 'mismatched number of arguments');
      const archetype = this.createElement(this.tandem.createTandem(DYNAMIC_ARCHETYPE_NAME), ...defaultArgs);

      // Mark the archetype for inclusion in the baseline schema
      if (this.isPhetioInstrumented()) {
        archetype.markDynamicElementArchetype();
      }
      return archetype;
    } else {
      return null;
    }
  }

  /**
   * Create a dynamic PhetioObject element for this container
   * @param componentName
   * @param argsForCreateFunction
   * @param containerParameterType - null in PhET brand
   */
  createDynamicElement(componentName, argsForCreateFunction, containerParameterType) {
    assert && assert(Array.isArray(argsForCreateFunction), 'should be array');

    // create with default state and substructure, details will need to be set by setter methods.

    let createdObjectTandem;
    if (!this.tandem.hasChild(componentName)) {
      createdObjectTandem = new DynamicTandem(this.tandem, componentName, this.tandem.getExtendedOptions());
    } else {
      createdObjectTandem = this.tandem.createTandem(componentName, this.tandem.getExtendedOptions());
      assert && assert(createdObjectTandem instanceof DynamicTandem, 'createdObjectTandem should be an instance of DynamicTandem'); // eslint-disable-line no-simple-type-checking-assertions
    }

    const createdObject = this.createElement(createdObjectTandem, ...argsForCreateFunction);

    // This validation is only needed for PhET-iO brand
    if (Tandem.PHET_IO_ENABLED) {
      assert && assert(containerParameterType !== null, 'containerParameterType must be provided in PhET-iO brand');

      // Make sure the new group element matches the schema for elements.
      validate(createdObject, containerParameterType.validator);
      assert && assert(createdObject.phetioType.extends(containerParameterType), 'dynamic element container expected its created instance\'s phetioType to match its parameterType.');
    }
    assert && this.assertDynamicPhetioObject(createdObject);
    return createdObject;
  }

  /**
   * A dynamic element should be an instrumented PhetioObject with phetioDynamicElement: true
   */
  assertDynamicPhetioObject(phetioObject) {
    if (Tandem.PHET_IO_ENABLED && Tandem.VALIDATION) {
      assert && assert(phetioObject.isPhetioInstrumented(), 'instance should be instrumented');
      assert && assert(phetioObject.phetioDynamicElement, 'instance should be marked as phetioDynamicElement:true');
    }
  }

  /**
   * Emit a created or disposed event.
   */
  emitDataStreamEvent(dynamicElement, eventName, additionalData) {
    this.phetioStartEvent(eventName, {
      data: merge({
        phetioID: dynamicElement.tandem.phetioID
      }, additionalData)
    });
    this.phetioEndEvent();
  }

  /**
   * Emit events when dynamic elements are created.
   */
  createdEventListener(dynamicElement) {
    const additionalData = dynamicElement.phetioState ? {
      state: this.phetioType.parameterTypes[0].toStateObject(dynamicElement)
    } : null;
    this.emitDataStreamEvent(dynamicElement, 'created', additionalData);
  }

  /**
   * Emit events when dynamic elements are disposed.
   */
  disposedEventListener(dynamicElement) {
    this.emitDataStreamEvent(dynamicElement, 'disposed');
  }
  dispose() {
    // If hitting this assertion because of nested dynamic element containers, please discuss with a phet-io team member.
    assert && assert(false, 'PhetioDynamicElementContainers are not intended for disposal');
  }

  /**
   * Dispose a contained element
   * @param element
   */
  disposeElement(element) {
    element.dispose();
    assert && this.supportsDynamicState && _.hasIn(window, 'phet.joist.sim') && assert(
    // We do not want to be disposing dynamic elements when state setting EXCEPT when we are clearing all dynamic
    // elements (which is ok and expected to do at the beginning of setting state).
    !(phet.joist.sim.isSettingPhetioStateProperty.value && !phet.joist.sim.isClearingPhetioDynamicElementsProperty), 'should not dispose a dynamic element while setting phet-io state');
    if (this.notificationsDeferred) {
      this.deferredDisposals.push(element);
    } else {
      this.elementDisposedEmitter.emit(element, element.tandem.phetioID);
    }
  }
  /**
   * Flush a single element from the list of deferred disposals that have not yet notified about the disposal. This
   * should never be called publicly, instead see `disposeElement`
   */
  notifyElementDisposedWhileDeferred(disposedElement) {
    assert && assert(this.notificationsDeferred, 'should only be called when notifications are deferred');
    assert && assert(this.deferredDisposals.includes(disposedElement), 'disposedElement should not have been already notified');
    this.elementDisposedEmitter.emit(disposedElement, disposedElement.tandem.phetioID);
    arrayRemove(this.deferredDisposals, disposedElement);
  }

  /**
   * Should be called by subtypes upon element creation, see PhetioGroup as an example.
   */
  notifyElementCreated(createdElement) {
    if (this.notificationsDeferred) {
      this.deferredCreations.push(createdElement);
    } else {
      this.elementCreatedEmitter.emit(createdElement, createdElement.tandem.phetioID);
    }
  }

  /**
   * Flush a single element from the list of deferred creations that have not yet notified about the disposal. This
   * is only public to support specific order dependencies in the PhetioStateEngine, otherwise see `this.notifyElementCreated()`
   * (PhetioGroupTests, phet-io) - only the PhetioStateEngine should notify individual elements created.
   */
  notifyElementCreatedWhileDeferred(createdElement) {
    assert && assert(this.notificationsDeferred, 'should only be called when notifications are deferred');
    assert && assert(this.deferredCreations.includes(createdElement), 'createdElement should not have been already notified');
    this.elementCreatedEmitter.emit(createdElement, createdElement.tandem.phetioID);
    arrayRemove(this.deferredCreations, createdElement);
  }

  /**
   * When set to true, creation and disposal notifications will be deferred until set to false. When set to false,
   * this function will flush all of the notifications for created and disposed elements (in that order) that occurred
   * while this container was deferring its notifications.
   */
  setNotificationsDeferred(notificationsDeferred) {
    assert && assert(notificationsDeferred !== this.notificationsDeferred, 'should not be the same as current value');

    // Flush all notifications when setting to be no longer deferred
    if (!notificationsDeferred) {
      while (this.deferredCreations.length > 0) {
        this.notifyElementCreatedWhileDeferred(this.deferredCreations[0]);
      }
      while (this.deferredDisposals.length > 0) {
        this.notifyElementDisposedWhileDeferred(this.deferredDisposals[0]);
      }
    }
    assert && assert(this.deferredCreations.length === 0, 'creations should be clear');
    assert && assert(this.deferredDisposals.length === 0, 'disposals should be clear');
    this.notificationsDeferred = notificationsDeferred;
  }

  /**
   * @throws error if trying to access when archetypes aren't being created.
   */
  get archetype() {
    return archetypeCast(this._archetype);
  }

  /**
   * Add the phetioDynamicElementName for API tracking
   */
  getMetadata(object) {
    const metadata = super.getMetadata(object);
    assert && assert(!metadata.hasOwnProperty('phetioDynamicElementName'), 'PhetioDynamicElementContainer sets the phetioDynamicElementName metadata key');
    return merge({
      phetioDynamicElementName: this.phetioDynamicElementName
    }, metadata);
  }
}
tandemNamespace.register('PhetioDynamicElementContainer', PhetioDynamicElementContainer);
export default PhetioDynamicElementContainer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWl0dGVyIiwidmFsaWRhdGUiLCJhcnJheVJlbW92ZSIsIm1lcmdlIiwib3B0aW9uaXplIiwiRHluYW1pY1RhbmRlbSIsIlBoZXRpb09iamVjdCIsIlRhbmRlbSIsIkRZTkFNSUNfQVJDSEVUWVBFX05BTUUiLCJ0YW5kZW1OYW1lc3BhY2UiLCJTdHJpbmdJTyIsIkRFRkFVTFRfQ09OVEFJTkVSX1NVRkZJWCIsImFyY2hldHlwZUNhc3QiLCJhcmNoZXR5cGUiLCJFcnJvciIsIlBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIiwiY29uc3RydWN0b3IiLCJjcmVhdGVFbGVtZW50IiwiZGVmYXVsdEFyZ3VtZW50cyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJwaGV0aW9TdGF0ZSIsInRhbmRlbSIsIk9QVElPTkFMIiwic3VwcG9ydHNEeW5hbWljU3RhdGUiLCJjb250YWluZXJTdWZmaXgiLCJwaGV0aW9EeW5hbWljRWxlbWVudE5hbWUiLCJ1bmRlZmluZWQiLCJhc3NlcnQiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJWQUxJREFUSU9OIiwicGhldGlvVHlwZSIsInBhcmFtZXRlclR5cGVzIiwic3VwcGxpZWQiLCJuYW1lIiwiZW5kc1dpdGgiLCJzbGljZSIsIl9hcmNoZXR5cGUiLCJjcmVhdGVBcmNoZXR5cGUiLCJlbGVtZW50Q3JlYXRlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwidmFsdWVUeXBlIiwiY3JlYXRlVGFuZGVtIiwicGhldGlvRG9jdW1lbnRhdGlvbiIsImVsZW1lbnREaXNwb3NlZEVtaXR0ZXIiLCJQSEVUX0lPX0VOQUJMRUQiLCJhZGRMaXN0ZW5lciIsImVsZW1lbnQiLCJjcmVhdGVkRXZlbnRMaXN0ZW5lciIsImRpc3Bvc2VkRXZlbnRMaXN0ZW5lciIsIm5vdGlmaWNhdGlvbnNEZWZlcnJlZCIsImRlZmVycmVkQ3JlYXRpb25zIiwiZGVmZXJyZWREaXNwb3NhbHMiLCJwaGV0aW9Jc0FyY2hldHlwZSIsIl8iLCJoYXNJbiIsIndpbmRvdyIsInBoZXRpb1N0YXRlRW5naW5lIiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsImNsZWFyRHluYW1pY0VsZW1lbnRzRW1pdHRlciIsInN0YXRlIiwic2NvcGVUYW5kZW0iLCJoYXNBbmNlc3RvciIsImNsZWFyIiwic2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkIiwic3RhdGVTZXRFbWl0dGVyIiwiYWRkU2V0U3RhdGVIZWxwZXIiLCJzdGlsbFRvU2V0SURzIiwiY3JlYXRpb25Ob3RpZmllZCIsIml0ZXJhdGlvbkNvdW50Iiwiam9pbiIsImRlZmVycmVkQ3JlYXRlZEVsZW1lbnQiLCJzdGF0ZVNldE9uQWxsQ2hpbGRyZW5PZkR5bmFtaWNFbGVtZW50IiwicGhldGlvSUQiLCJub3RpZnlFbGVtZW50Q3JlYXRlZFdoaWxlRGVmZXJyZWQiLCJkeW5hbWljRWxlbWVudElEIiwiaSIsIlBoZXRpb0lEVXRpbHMiLCJpc0FuY2VzdG9yIiwiam9pc3QiLCJzaW0iLCJpc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkiLCJ2YWx1ZSIsInByZWxvYWRzIiwiY3JlYXRlQXJjaGV0eXBlcyIsImRlZmF1bHRBcmdzIiwiaXNQaGV0aW9JbnN0cnVtZW50ZWQiLCJtYXJrRHluYW1pY0VsZW1lbnRBcmNoZXR5cGUiLCJjcmVhdGVEeW5hbWljRWxlbWVudCIsImNvbXBvbmVudE5hbWUiLCJhcmdzRm9yQ3JlYXRlRnVuY3Rpb24iLCJjb250YWluZXJQYXJhbWV0ZXJUeXBlIiwiY3JlYXRlZE9iamVjdFRhbmRlbSIsImhhc0NoaWxkIiwiZ2V0RXh0ZW5kZWRPcHRpb25zIiwiY3JlYXRlZE9iamVjdCIsInZhbGlkYXRvciIsImV4dGVuZHMiLCJhc3NlcnREeW5hbWljUGhldGlvT2JqZWN0IiwicGhldGlvT2JqZWN0IiwicGhldGlvRHluYW1pY0VsZW1lbnQiLCJlbWl0RGF0YVN0cmVhbUV2ZW50IiwiZHluYW1pY0VsZW1lbnQiLCJldmVudE5hbWUiLCJhZGRpdGlvbmFsRGF0YSIsInBoZXRpb1N0YXJ0RXZlbnQiLCJkYXRhIiwicGhldGlvRW5kRXZlbnQiLCJ0b1N0YXRlT2JqZWN0IiwiZGlzcG9zZSIsImRpc3Bvc2VFbGVtZW50IiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsImlzQ2xlYXJpbmdQaGV0aW9EeW5hbWljRWxlbWVudHNQcm9wZXJ0eSIsInB1c2giLCJlbWl0Iiwibm90aWZ5RWxlbWVudERpc3Bvc2VkV2hpbGVEZWZlcnJlZCIsImRpc3Bvc2VkRWxlbWVudCIsImluY2x1ZGVzIiwibm90aWZ5RWxlbWVudENyZWF0ZWQiLCJjcmVhdGVkRWxlbWVudCIsImdldE1ldGFkYXRhIiwib2JqZWN0IiwibWV0YWRhdGEiLCJoYXNPd25Qcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU3VwZXJ0eXBlIGZvciBjb250YWluZXJzIHRoYXQgaG9sZCBkeW5hbWljIGVsZW1lbnRzIHRoYXQgYXJlIFBoRVQtaU8gaW5zdHJ1bWVudGVkLiBUaGlzIHR5cGUgaGFuZGxlcyBjb21tb25cclxuICogZmVhdHVyZXMgbGlrZSBjcmVhdGluZyB0aGUgYXJjaGV0eXBlIGZvciB0aGUgUGhFVC1pTyBBUEksIGFuZCBtYW5hZ2luZyBjcmVhdGVkL2Rpc3Bvc2VkIGRhdGEgc3RyZWFtIGV2ZW50cy5cclxuICpcclxuICogXCJEeW5hbWljXCIgaXMgYW4gb3ZlcmxvYWRlZCB0ZXJtLCBzbyBhbGxvdyBtZSB0byBleHBsYWluIHdoYXQgaXQgbWVhbnMgaW4gdGhlIGNvbnRleHQgb2YgdGhpcyB0eXBlLiBBIFwiZHluYW1pYyBlbGVtZW50XCJcclxuICogaXMgYW4gaW5zdHJ1bWVudGVkIFBoRVQtaU8gZWxlbWVudCB0aGF0IGlzIGNvbmRpdGlvbmFsbHkgaW4gdGhlIFBoRVQtaU8gQVBJLiBNb3N0IGNvbW1vbmx5IHRoaXMgaXMgYmVjYXVzZSBlbGVtZW50c1xyXG4gKiBjYW4gYmUgY3JlYXRlZCBhbmQgZGVzdHJveWVkIGR1cmluZyB0aGUgcnVudGltZSBvZiB0aGUgc2ltLiBBbm90aGVyIFwiZHluYW1pYyBlbGVtZW50XCIgZm9yIHRoZSBQaEVULWlPIHByb2plY3QgaXMgd2hlblxyXG4gKiBhbiBlbGVtZW50IG1heSBvciBtYXkgbm90IGJlIGNyZWF0ZWQgYmFzZWQgb24gYSBxdWVyeSBwYXJhbWV0ZXIuIEluIHRoaXMgY2FzZSwgZXZlbiBpZiB0aGUgb2JqZWN0IHRoZW4gZXhpc3RzIGZvciB0aGVcclxuICogbGlmZXRpbWUgb2YgdGhlIHNpbSwgd2UgbWF5IHN0aWxsIGNhbGwgdGhpcyBcImR5bmFtaWNcIiBhcyBpdCBwZXJ0YWlucyB0byB0aGlzIHR5cGUsIGFuZCB0aGUgUGhFVC1pTyBBUEkuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBLYXV6bWFubiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRW1pdHRlciBmcm9tICcuLi8uLi9heG9uL2pzL0VtaXR0ZXIuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgRHluYW1pY1RhbmRlbSBmcm9tICcuL0R5bmFtaWNUYW5kZW0uanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0LCB7IFBoZXRpb09iamVjdE1ldGFkYXRhSW5wdXQsIFBoZXRpb09iamVjdE9wdGlvbnMgfSBmcm9tICcuL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0sIHsgRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSB9IGZyb20gJy4vVGFuZGVtLmpzJztcclxuaW1wb3J0IHRhbmRlbU5hbWVzcGFjZSBmcm9tICcuL3RhbmRlbU5hbWVzcGFjZS5qcyc7XHJcbmltcG9ydCBJT1R5cGUgZnJvbSAnLi90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgeyBQaGV0aW9PYmplY3RNZXRhZGF0YSwgUGhldGlvU3RhdGUgfSBmcm9tICcuL1RhbmRlbUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi4vLi4vYXhvbi9qcy9URW1pdHRlci5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuL3R5cGVzL1N0cmluZ0lPLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX0NPTlRBSU5FUl9TVUZGSVggPSAnQ29udGFpbmVyJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIEJ5IGRlZmF1bHQsIGEgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIncyBlbGVtZW50cyBhcmUgaW5jbHVkZWQgaW4gc3RhdGUgc3VjaCB0aGF0IG9uIGV2ZXJ5IHNldFN0YXRlIGNhbGwsXHJcbiAgLy8gdGhlIGVsZW1lbnRzIGFyZSBjbGVhcmVkIG91dCBieSB0aGUgcGhldGlvU3RhdGVFbmdpbmUgc28gZWxlbWVudHMgaW4gdGhlIHN0YXRlIGNhbiBiZSBhZGRlZCB0byB0aGUgZW1wdHkgZ3JvdXAuXHJcbiAgLy8gVGhpcyBvcHRpb24gaXMgZm9yIG9wdGluZyBvdXQgb2YgdGhhdCBiZWhhdmlvci4gV2hlbiBmYWxzZSwgdGhpcyBjb250YWluZXIgd2lsbCBub3QgaGF2ZSBpdHMgZWxlbWVudHMgY2xlYXJlZFxyXG4gIC8vIHdoZW4gYmVnaW5uaW5nIHRvIHNldCBQaEVULWlPIHN0YXRlLiBGdXJ0aGVybW9yZSwgdmlldyBlbGVtZW50cyBmb2xsb3dpbmcgdGhlIFwib25seSB0aGUgbW9kZWxzIGFyZSBzdGF0ZWZ1bFwiXHJcbiAgLy8gcGF0dGVybiBtdXN0IG1hcmsgdGhpcyBhcyBmYWxzZSwgb3RoZXJ3aXNlIHRoZSBzdGF0ZSBlbmdpbmUgd2lsbCB0cnkgdG8gY3JlYXRlIHRoZXNlIGVsZW1lbnRzIGluc3RlYWQgb2YgbGV0dGluZ1xyXG4gIC8vIHRoZSBtb2RlbCBub3RpZmljYXRpb25zIGhhbmRsZSB0aGlzLlxyXG4gIHN1cHBvcnRzRHluYW1pY1N0YXRlPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gVGhlIGNvbnRhaW5lcidzIHRhbmRlbSBuYW1lIG11c3QgaGF2ZSB0aGlzIHN1ZmZpeCwgYW5kIHRoZSBiYXNlIHRhbmRlbSBuYW1lIGZvciBlbGVtZW50cyBpblxyXG4gIC8vIHRoZSBjb250YWluZXIgd2lsbCBjb25zaXN0IG9mIHRoZSBncm91cCdzIHRhbmRlbSBuYW1lIHdpdGggdGhpcyBzdWZmaXggc3RyaXBwZWQgb2ZmLlxyXG4gIGNvbnRhaW5lclN1ZmZpeD86IHN0cmluZztcclxuXHJcbiAgLy8gdGFuZGVtIG5hbWUgZm9yIGVsZW1lbnRzIGluIHRoZSBjb250YWluZXIgaXMgdGhlIGNvbnRhaW5lcidzIHRhbmRlbSBuYW1lIHdpdGhvdXQgY29udGFpbmVyU3VmZml4XHJcbiAgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lPzogc3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJPcHRpb25zID1cclxuICBTZWxmT3B0aW9uc1xyXG4gICYgU3RyaWN0T21pdDxQaGV0aW9PYmplY3RPcHRpb25zLCAncGhldGlvRHluYW1pY0VsZW1lbnQnPlxyXG4gICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICdwaGV0aW9UeXBlJz47XHJcblxyXG5mdW5jdGlvbiBhcmNoZXR5cGVDYXN0PFQ+KCBhcmNoZXR5cGU6IFQgfCBudWxsICk6IFQge1xyXG4gIGlmICggYXJjaGV0eXBlID09PSBudWxsICkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCAnYXJjaGV0eXBlIHNob3VsZCBleGlzdCcgKTtcclxuICB9XHJcbiAgcmV0dXJuIGFyY2hldHlwZTtcclxufVxyXG5cclxuYWJzdHJhY3QgY2xhc3MgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXI8VCBleHRlbmRzIFBoZXRpb09iamVjdCwgUCBleHRlbmRzIEludGVudGlvbmFsQW55W10gPSBbXT4gZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgX2FyY2hldHlwZTogVCB8IG51bGw7XHJcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnRDcmVhdGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBULCBzdHJpbmcgXT47XHJcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnREaXNwb3NlZEVtaXR0ZXI6IFRFbWl0dGVyPFsgVCwgc3RyaW5nIF0+O1xyXG4gIHByaXZhdGUgbm90aWZpY2F0aW9uc0RlZmVycmVkOiBib29sZWFuO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGVmZXJyZWRDcmVhdGlvbnM6IFRbXTtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRlZmVycmVkRGlzcG9zYWxzOiBUW107XHJcbiAgcHVibGljIHJlYWRvbmx5IHN1cHBvcnRzRHluYW1pY1N0YXRlOiBib29sZWFuOyAvLyAocGhldC1pbyBpbnRlcm5hbClcclxuICBwcm90ZWN0ZWQgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lOiBzdHJpbmc7XHJcbiAgcHJvdGVjdGVkIGNyZWF0ZUVsZW1lbnQ6ICggdDogVGFuZGVtLCAuLi5hcmdzOiBQICkgPT4gVDtcclxuXHJcbiAgLy8gQXJndW1lbnRzIHBhc3NlZCB0byB0aGUgYXJjaGV0eXBlIHdoZW4gY3JlYXRpbmcgaXQuXHJcbiAgcHJvdGVjdGVkIGRlZmF1bHRBcmd1bWVudHM6IFAgfCAoICgpID0+IFAgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGNyZWF0ZUVsZW1lbnQgLSBmdW5jdGlvbiB0aGF0IGNyZWF0ZXMgYSBkeW5hbWljIHJlYWRvbmx5IGVsZW1lbnQgdG8gYmUgaG91c2VkIGluXHJcbiAgICogdGhpcyBjb250YWluZXIuIEFsbCBvZiB0aGlzIGR5bmFtaWMgZWxlbWVudCBjb250YWluZXIncyBlbGVtZW50cyB3aWxsIGJlIGNyZWF0ZWQgZnJvbSB0aGlzIGZ1bmN0aW9uLCBpbmNsdWRpbmcgdGhlXHJcbiAgICogYXJjaGV0eXBlLlxyXG4gICAqIEBwYXJhbSBkZWZhdWx0QXJndW1lbnRzIC0gYXJndW1lbnRzIHBhc3NlZCB0byBjcmVhdGVFbGVtZW50IHdoZW4gY3JlYXRpbmcgdGhlIGFyY2hldHlwZVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXSAtIGRlc2NyaWJlIHRoZSBHcm91cCBpdHNlbGZcclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNyZWF0ZUVsZW1lbnQ6ICggdDogVGFuZGVtLCAuLi5hcmdzOiBQICkgPT4gVCwgZGVmYXVsdEFyZ3VtZW50czogUCB8ICggKCkgPT4gUCApLCBwcm92aWRlZE9wdGlvbnM/OiBQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lck9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lck9wdGlvbnMsIFNlbGZPcHRpb25zLCBQaGV0aW9PYmplY3RPcHRpb25zPigpKCB7XHJcbiAgICAgIHBoZXRpb1N0YXRlOiBmYWxzZSwgLy8gZWxlbWVudHMgYXJlIGluY2x1ZGVkIGluIHN0YXRlLCBidXQgdGhlIGNvbnRhaW5lciB3aWxsIGV4aXN0IGluIHRoZSBkb3duc3RyZWFtIHNpbS5cclxuXHJcbiAgICAgIC8vIE1hbnkgUGhFVC1pTyBpbnN0cnVtZW50ZWQgdHlwZXMgbGl2ZSBpbiBjb21tb24gY29kZSB1c2VkIGJ5IG11bHRpcGxlIHNpbXMsIGFuZCBtYXkgb25seSBiZSBpbnN0cnVtZW50ZWQgaW4gYSBzdWJzZXQgb2YgdGhlaXIgdXNhZ2VzLlxyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgc3VwcG9ydHNEeW5hbWljU3RhdGU6IHRydWUsXHJcbiAgICAgIGNvbnRhaW5lclN1ZmZpeDogREVGQVVMVF9DT05UQUlORVJfU1VGRklYLFxyXG5cclxuICAgICAgLy8gVE9ETzogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvMjU0XHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSB0aGlzIGlzIGZpbGxlZCBpbiBiZWxvd1xyXG4gICAgICBwaGV0aW9EeW5hbWljRWxlbWVudE5hbWU6IHVuZGVmaW5lZFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggZGVmYXVsdEFyZ3VtZW50cyApIHx8IHR5cGVvZiBkZWZhdWx0QXJndW1lbnRzID09PSAnZnVuY3Rpb24nLCAnZGVmYXVsdEFyZ3VtZW50cyBzaG91bGQgYmUgYW4gYXJyYXkgb3IgYSBmdW5jdGlvbicgKTtcclxuICAgIGlmICggQXJyYXkuaXNBcnJheSggZGVmYXVsdEFyZ3VtZW50cyApICkge1xyXG5cclxuICAgICAgLy8gY3JlYXRlRWxlbWVudCBleHBlY3RzIGEgVGFuZGVtIGFzIHRoZSBmaXJzdCBhcmdcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3JlYXRlRWxlbWVudC5sZW5ndGggPT09IGRlZmF1bHRBcmd1bWVudHMubGVuZ3RoICsgMSwgJ21pc21hdGNoZWQgbnVtYmVyIG9mIGFyZ3VtZW50cycgKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCAhIW9wdGlvbnMucGhldGlvVHlwZSwgJ3BoZXRpb1R5cGUgbXVzdCBiZSBzdXBwbGllZCcgKTtcclxuICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIG9wdGlvbnMucGhldGlvVHlwZS5wYXJhbWV0ZXJUeXBlcyApLFxyXG4gICAgICAncGhldGlvVHlwZSBtdXN0IHN1cHBseSBpdHMgcGFyYW1ldGVyIHR5cGVzJyApO1xyXG4gICAgYXNzZXJ0ICYmIFRhbmRlbS5WQUxJREFUSU9OICYmIGFzc2VydCggb3B0aW9ucy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIS5sZW5ndGggPT09IDEsXHJcbiAgICAgICdQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lclxcJ3MgcGhldGlvVHlwZSBtdXN0IGhhdmUgZXhhY3RseSBvbmUgcGFyYW1ldGVyIHR5cGUnICk7XHJcbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCAhIW9wdGlvbnMucGhldGlvVHlwZS5wYXJhbWV0ZXJUeXBlcyFbIDAgXSxcclxuICAgICAgJ1BoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyXFwncyBwaGV0aW9UeXBlXFwncyBwYXJhbWV0ZXJUeXBlIG11c3QgYmUgdHJ1dGh5JyApO1xyXG4gICAgaWYgKCBhc3NlcnQgJiYgb3B0aW9ucy50YW5kZW0uc3VwcGxpZWQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoIG9wdGlvbnMudGFuZGVtLm5hbWUuZW5kc1dpdGgoIG9wdGlvbnMuY29udGFpbmVyU3VmZml4ICksXHJcbiAgICAgICAgJ1BoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIHRhbmRlbXMgc2hvdWxkIGVuZCB3aXRoIG9wdGlvbnMuY29udGFpbmVyU3VmZml4JyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG9wdGlvbnMgdGhhdCBkZXBlbmQgb24gb3RoZXIgb3B0aW9uc1xyXG4gICAgb3B0aW9ucy5waGV0aW9EeW5hbWljRWxlbWVudE5hbWUgPSBvcHRpb25zLnRhbmRlbS5uYW1lLnNsaWNlKCAwLCBvcHRpb25zLnRhbmRlbS5uYW1lLmxlbmd0aCAtIG9wdGlvbnMuY29udGFpbmVyU3VmZml4Lmxlbmd0aCApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zdXBwb3J0c0R5bmFtaWNTdGF0ZSA9IG9wdGlvbnMuc3VwcG9ydHNEeW5hbWljU3RhdGU7XHJcbiAgICB0aGlzLnBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSA9IG9wdGlvbnMucGhldGlvRHluYW1pY0VsZW1lbnROYW1lO1xyXG5cclxuICAgIHRoaXMuY3JlYXRlRWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQ7XHJcbiAgICB0aGlzLmRlZmF1bHRBcmd1bWVudHMgPSBkZWZhdWx0QXJndW1lbnRzO1xyXG5cclxuICAgIC8vIENhbiBiZSB1c2VkIGFzIGFuIGFyZ3VtZW50IHRvIGNyZWF0ZSBvdGhlciBhcmNoZXR5cGVzLCBidXQgb3RoZXJ3aXNlXHJcbiAgICAvLyBhY2Nlc3Mgc2hvdWxkIG5vdCBiZSBuZWVkZWQuIFRoaXMgd2lsbCBvbmx5IGJlIG5vbi1udWxsIHdoZW4gZ2VuZXJhdGluZyB0aGUgUGhFVC1pTyBBUEksIHNlZSBjcmVhdGVBcmNoZXR5cGUoKS5cclxuICAgIHRoaXMuX2FyY2hldHlwZSA9IHRoaXMuY3JlYXRlQXJjaGV0eXBlKCk7XHJcblxyXG4gICAgLy8gc3VidHlwZXMgZXhwZWN0ZWQgdG8gZmlyZSB0aGlzIGFjY29yZGluZyB0byBpbmRpdmlkdWFsIGltcGxlbWVudGF0aW9uc1xyXG4gICAgdGhpcy5lbGVtZW50Q3JlYXRlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIFQsIHN0cmluZyBdPigge1xyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyB2YWx1ZVR5cGU6IFBoZXRpb09iamVjdCwgcGhldGlvVHlwZTogb3B0aW9ucy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIVsgMCBdLCBuYW1lOiAnZWxlbWVudCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdwaGV0aW9JRCcsIHBoZXRpb1R5cGU6IFN0cmluZ0lPIH1cclxuICAgICAgXSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVtZW50Q3JlYXRlZEVtaXR0ZXInICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdFbWl0dGVyIHRoYXQgZmlyZXMgd2hlbmV2ZXIgYSBuZXcgZHluYW1pYyBlbGVtZW50IGlzIGFkZGVkIHRvIHRoZSBjb250YWluZXIuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGNhbGxlZCBvbiBkaXNwb3NhbCBvZiBhbiBlbGVtZW50XHJcbiAgICB0aGlzLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIFQsIHN0cmluZyBdPigge1xyXG4gICAgICBwYXJhbWV0ZXJzOiBbXHJcbiAgICAgICAgeyB2YWx1ZVR5cGU6IFBoZXRpb09iamVjdCwgcGhldGlvVHlwZTogb3B0aW9ucy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIVsgMCBdLCBuYW1lOiAnZWxlbWVudCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdwaGV0aW9JRCcsIHBoZXRpb1R5cGU6IFN0cmluZ0lPIH1cclxuICAgICAgXSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVtZW50RGlzcG9zZWRFbWl0dGVyJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHRlciB0aGF0IGZpcmVzIHdoZW5ldmVyIGEgZHluYW1pYyBlbGVtZW50IGlzIHJlbW92ZWQgZnJvbSB0aGUgY29udGFpbmVyLidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBFbWl0IHRvIHRoZSBkYXRhIHN0cmVhbSBvbiBlbGVtZW50IGNyZWF0aW9uL2Rpc3Bvc2FsLCBubyBuZWVkIHRvIGRvIHRoaXMgaW4gUGhFVCBicmFuZFxyXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICkge1xyXG4gICAgICB0aGlzLmVsZW1lbnRDcmVhdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggZWxlbWVudCA9PiB0aGlzLmNyZWF0ZWRFdmVudExpc3RlbmVyKCBlbGVtZW50ICkgKTtcclxuICAgICAgdGhpcy5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBlbGVtZW50ID0+IHRoaXMuZGlzcG9zZWRFdmVudExpc3RlbmVyKCBlbGVtZW50ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhIHdheSB0byBkZWxheSBjcmVhdGlvbiBub3RpZmljYXRpb25zIHRvIGEgbGF0ZXIgdGltZSwgZm9yIHBoZXQtaW8gc3RhdGUgZW5naW5lIHN1cHBvcnRcclxuICAgIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkID0gZmFsc2U7XHJcblxyXG4gICAgLy8gbGlzdHMgdG8ga2VlcCB0cmFjayBvZiB0aGUgY3JlYXRlZCBhbmQgZGlzcG9zZWQgZWxlbWVudHMgd2hlbiBub3RpZmljYXRpb25zIGFyZSBkZWZlcnJlZC5cclxuICAgIC8vIFRoZXNlIGFyZSB1c2VkIHRvIHRoZW4gZmx1c2ggbm90aWZpY2F0aW9ucyB3aGVuIHRoZXkgYXJlIHNldCB0byBubyBsb25nZXIgYmUgZGVmZXJyZWQuXHJcbiAgICB0aGlzLmRlZmVycmVkQ3JlYXRpb25zID0gW107XHJcbiAgICB0aGlzLmRlZmVycmVkRGlzcG9zYWxzID0gW107XHJcblxyXG4gICAgLy8gcHJvdmlkZSBhIHdheSB0byBvcHQgb3V0IG9mIGNvbnRhaW5lcnMgY2xlYXJpbmcgZHluYW1pYyBzdGF0ZSwgdXNlZnVsIGlmIGdyb3VwIGVsZW1lbnRzIGV4aXN0IGZvciB0aGUgbGlmZXRpbWUgb2ZcclxuICAgIC8vIHRoZSBzaW0sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdGFuZGVtL2lzc3Vlcy8xMzJcclxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiB0aGlzLnN1cHBvcnRzRHluYW1pY1N0YXRlICYmXHJcblxyXG4gICAgICAgICAvLyBkb24ndCBjbGVhciBhcmNoZXR5cGVzIGJlY2F1c2UgdGhleSBhcmUgc3RhdGljLlxyXG4gICAgICAgICAhdGhpcy5waGV0aW9Jc0FyY2hldHlwZSApIHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9TdGF0ZUVuZ2luZScgKSxcclxuICAgICAgICAnUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXJzIG11c3QgYmUgY3JlYXRlZCBvbmNlIHBoZXRpb0VuZ2luZSBoYXMgYmVlbiBjb25zdHJ1Y3RlZCcgKTtcclxuXHJcbiAgICAgIGNvbnN0IHBoZXRpb1N0YXRlRW5naW5lID0gcGhldC5waGV0aW8ucGhldGlvRW5naW5lLnBoZXRpb1N0YXRlRW5naW5lO1xyXG5cclxuICAgICAgLy8gT24gc3RhdGUgc3RhcnQsIGNsZWFyIG91dCB0aGUgY29udGFpbmVyIGFuZCBzZXQgdG8gZGVmZXIgbm90aWZpY2F0aW9ucy5cclxuICAgICAgcGhldGlvU3RhdGVFbmdpbmUuY2xlYXJEeW5hbWljRWxlbWVudHNFbWl0dGVyLmFkZExpc3RlbmVyKCAoIHN0YXRlOiBQaGV0aW9TdGF0ZSwgc2NvcGVUYW5kZW06IFRhbmRlbSApID0+IHtcclxuXHJcbiAgICAgICAgLy8gT25seSBjbGVhciBpZiB0aGlzIFBoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIGlzIGluIHNjb3BlIG9mIHRoZSBzdGF0ZSB0byBiZSBzZXRcclxuICAgICAgICBpZiAoIHRoaXMudGFuZGVtLmhhc0FuY2VzdG9yKCBzY29wZVRhbmRlbSApICkge1xyXG4gICAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgICAgdGhpcy5zZXROb3RpZmljYXRpb25zRGVmZXJyZWQoIHRydWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIGRvbmUgd2l0aCBzdGF0ZSBzZXR0aW5nXHJcbiAgICAgIHBoZXRpb1N0YXRlRW5naW5lLnN0YXRlU2V0RW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICAgIGlmICggdGhpcy5ub3RpZmljYXRpb25zRGVmZXJyZWQgKSB7XHJcbiAgICAgICAgICB0aGlzLnNldE5vdGlmaWNhdGlvbnNEZWZlcnJlZCggZmFsc2UgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHBoZXRpb1N0YXRlRW5naW5lLmFkZFNldFN0YXRlSGVscGVyKCAoIHN0YXRlOiBQaGV0aW9TdGF0ZSwgc3RpbGxUb1NldElEczogc3RyaW5nW10gKSA9PiB7XHJcbiAgICAgICAgbGV0IGNyZWF0aW9uTm90aWZpZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGl0ZXJhdGlvbkNvdW50ID0gMDtcclxuXHJcbiAgICAgICAgd2hpbGUgKCB0aGlzLmRlZmVycmVkQ3JlYXRpb25zLmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICAgICAgaWYgKCBpdGVyYXRpb25Db3VudCA+IDIwMCApIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCAnVG9vIG1hbnkgaXRlcmF0aW9ucyBpbiBkZWZlcnJlZCBjcmVhdGlvbnMsIHN0aWxsVG9TZXRJRHMgPSAnICsgc3RpbGxUb1NldElEcy5qb2luKCAnLCAnICkgKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBkZWZlcnJlZENyZWF0ZWRFbGVtZW50ID0gdGhpcy5kZWZlcnJlZENyZWF0aW9uc1sgMCBdO1xyXG4gICAgICAgICAgaWYgKCB0aGlzLnN0YXRlU2V0T25BbGxDaGlsZHJlbk9mRHluYW1pY0VsZW1lbnQoIGRlZmVycmVkQ3JlYXRlZEVsZW1lbnQudGFuZGVtLnBoZXRpb0lELCBzdGlsbFRvU2V0SURzICkgKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm90aWZ5RWxlbWVudENyZWF0ZWRXaGlsZURlZmVycmVkKCBkZWZlcnJlZENyZWF0ZWRFbGVtZW50ICk7XHJcbiAgICAgICAgICAgIGNyZWF0aW9uTm90aWZpZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGl0ZXJhdGlvbkNvdW50Kys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjcmVhdGlvbk5vdGlmaWVkO1xyXG4gICAgICB9ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcmV0dXJucyB0cnVlIGlmIGFsbCBjaGlsZHJlbiBvZiBhIHNpbmdsZSBkeW5hbWljIGVsZW1lbnQgKGJhc2VkIG9uIHBoZXRpb0lEKSBoYXZlIGhhZCB0aGVpciBzdGF0ZSBzZXQgYWxyZWFkeS5cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRlU2V0T25BbGxDaGlsZHJlbk9mRHluYW1pY0VsZW1lbnQoIGR5bmFtaWNFbGVtZW50SUQ6IHN0cmluZywgc3RpbGxUb1NldElEczogc3RyaW5nW10gKTogYm9vbGVhbiB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzdGlsbFRvU2V0SURzLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgaWYgKCBwaGV0aW8uUGhldGlvSURVdGlscy5pc0FuY2VzdG9yKCBkeW5hbWljRWxlbWVudElELCBzdGlsbFRvU2V0SURzWyBpIF0gKSApIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlOyAvLyBObyBlbGVtZW50cyBpbiBzdGF0ZSB0aGF0IGFyZW4ndCBpbiB0aGUgY29tcGxldGVkIGxpc3RcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFyY2hldHlwZXMgYXJlIGNyZWF0ZWQgdG8gZ2VuZXJhdGUgdGhlIGJhc2VsaW5lIGZpbGUsIG9yIHRvIHZhbGlkYXRlIGFnYWluc3QgYW4gZXhpc3RpbmcgYmFzZWxpbmUgZmlsZS4gIFRoZXkgYXJlXHJcbiAgICogUGhldGlvT2JqZWN0cyBhbmQgcmVnaXN0ZXJlZCB3aXRoIHRoZSBwaGV0aW9FbmdpbmUsIGJ1dCBub3Qgc2VuZCBvdXQgdmlhIG5vdGlmaWNhdGlvbnMgZnJvbSBQaGV0aW9FbmdpbmUucGhldGlvRWxlbWVudEFkZGVkRW1pdHRlcigpLFxyXG4gICAqIGJlY2F1c2UgdGhleSBhcmUgaW50ZW5kZWQgZm9yIGludGVybmFsIHVzYWdlIG9ubHkuICBBcmNoZXR5cGVzIHNob3VsZCBub3QgYmUgY3JlYXRlZCBpbiBwcm9kdWN0aW9uIGNvZGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjcmVhdGVBcmNoZXR5cGUoKTogVCB8IG51bGwge1xyXG5cclxuICAgIC8vIE9uY2UgdGhlIHNpbSBoYXMgc3RhcnRlZCwgYW55IGFyY2hldHlwZXMgYmVpbmcgY3JlYXRlZCBhcmUgbGlrZWx5IGRvbmUgc28gYmVjYXVzZSB0aGV5IGFyZSBuZXN0ZWQgUGhldGlvR3JvdXBzLlxyXG4gICAgaWYgKCBfLmhhc0luKCB3aW5kb3csICdwaGV0LmpvaXN0LnNpbScgKSAmJiBwaGV0LmpvaXN0LnNpbS5pc0NvbnN0cnVjdGlvbkNvbXBsZXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnbmVzdGVkIER5bmFjbWljRWxlbWVudENvbnRhaW5lcnMgYXJlIG5vdCBjdXJyZW50bHkgc3VwcG9ydGVkJyApO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXaGVuIGdlbmVyYXRpbmcgdGhlIGJhc2VsaW5lLCBvdXRwdXQgdGhlIHNjaGVtYSBmb3IgdGhlIGFyY2hldHlwZVxyXG4gICAgaWYgKCBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHBoZXQucHJlbG9hZHMucGhldGlvLmNyZWF0ZUFyY2hldHlwZXMgKSB7XHJcbiAgICAgIGNvbnN0IGRlZmF1bHRBcmdzID0gQXJyYXkuaXNBcnJheSggdGhpcy5kZWZhdWx0QXJndW1lbnRzICkgPyB0aGlzLmRlZmF1bHRBcmd1bWVudHMgOiB0aGlzLmRlZmF1bHRBcmd1bWVudHMoKTtcclxuXHJcbiAgICAgIC8vIFRoZSBjcmVhdGUgZnVuY3Rpb24gdGFrZXMgYSB0YW5kZW0gcGx1cyB0aGUgZGVmYXVsdCBhcmdzXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY3JlYXRlRWxlbWVudC5sZW5ndGggPT09IGRlZmF1bHRBcmdzLmxlbmd0aCArIDEsICdtaXNtYXRjaGVkIG51bWJlciBvZiBhcmd1bWVudHMnICk7XHJcblxyXG4gICAgICBjb25zdCBhcmNoZXR5cGUgPSB0aGlzLmNyZWF0ZUVsZW1lbnQoIHRoaXMudGFuZGVtLmNyZWF0ZVRhbmRlbSggRFlOQU1JQ19BUkNIRVRZUEVfTkFNRSApLCAuLi5kZWZhdWx0QXJncyApO1xyXG5cclxuICAgICAgLy8gTWFyayB0aGUgYXJjaGV0eXBlIGZvciBpbmNsdXNpb24gaW4gdGhlIGJhc2VsaW5lIHNjaGVtYVxyXG4gICAgICBpZiAoIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSApIHtcclxuICAgICAgICBhcmNoZXR5cGUubWFya0R5bmFtaWNFbGVtZW50QXJjaGV0eXBlKCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFyY2hldHlwZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIGR5bmFtaWMgUGhldGlvT2JqZWN0IGVsZW1lbnQgZm9yIHRoaXMgY29udGFpbmVyXHJcbiAgICogQHBhcmFtIGNvbXBvbmVudE5hbWVcclxuICAgKiBAcGFyYW0gYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uXHJcbiAgICogQHBhcmFtIGNvbnRhaW5lclBhcmFtZXRlclR5cGUgLSBudWxsIGluIFBoRVQgYnJhbmRcclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlRHluYW1pY0VsZW1lbnQoIGNvbXBvbmVudE5hbWU6IHN0cmluZywgYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uOiBQLCBjb250YWluZXJQYXJhbWV0ZXJUeXBlOiBJT1R5cGUgfCBudWxsICk6IFQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uICksICdzaG91bGQgYmUgYXJyYXknICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHdpdGggZGVmYXVsdCBzdGF0ZSBhbmQgc3Vic3RydWN0dXJlLCBkZXRhaWxzIHdpbGwgbmVlZCB0byBiZSBzZXQgYnkgc2V0dGVyIG1ldGhvZHMuXHJcblxyXG4gICAgbGV0IGNyZWF0ZWRPYmplY3RUYW5kZW07XHJcbiAgICBpZiAoICF0aGlzLnRhbmRlbS5oYXNDaGlsZCggY29tcG9uZW50TmFtZSApICkge1xyXG4gICAgICBjcmVhdGVkT2JqZWN0VGFuZGVtID0gbmV3IER5bmFtaWNUYW5kZW0oIHRoaXMudGFuZGVtLCBjb21wb25lbnROYW1lLCB0aGlzLnRhbmRlbS5nZXRFeHRlbmRlZE9wdGlvbnMoKSApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGNyZWF0ZWRPYmplY3RUYW5kZW0gPSB0aGlzLnRhbmRlbS5jcmVhdGVUYW5kZW0oIGNvbXBvbmVudE5hbWUsIHRoaXMudGFuZGVtLmdldEV4dGVuZGVkT3B0aW9ucygpICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNyZWF0ZWRPYmplY3RUYW5kZW0gaW5zdGFuY2VvZiBEeW5hbWljVGFuZGVtLCAnY3JlYXRlZE9iamVjdFRhbmRlbSBzaG91bGQgYmUgYW4gaW5zdGFuY2Ugb2YgRHluYW1pY1RhbmRlbScgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zaW1wbGUtdHlwZS1jaGVja2luZy1hc3NlcnRpb25zXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY3JlYXRlZE9iamVjdCA9IHRoaXMuY3JlYXRlRWxlbWVudCggY3JlYXRlZE9iamVjdFRhbmRlbSwgLi4uYXJnc0ZvckNyZWF0ZUZ1bmN0aW9uICk7XHJcblxyXG4gICAgLy8gVGhpcyB2YWxpZGF0aW9uIGlzIG9ubHkgbmVlZGVkIGZvciBQaEVULWlPIGJyYW5kXHJcbiAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbnRhaW5lclBhcmFtZXRlclR5cGUgIT09IG51bGwsICdjb250YWluZXJQYXJhbWV0ZXJUeXBlIG11c3QgYmUgcHJvdmlkZWQgaW4gUGhFVC1pTyBicmFuZCcgKTtcclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgbmV3IGdyb3VwIGVsZW1lbnQgbWF0Y2hlcyB0aGUgc2NoZW1hIGZvciBlbGVtZW50cy5cclxuICAgICAgdmFsaWRhdGUoIGNyZWF0ZWRPYmplY3QsIGNvbnRhaW5lclBhcmFtZXRlclR5cGUhLnZhbGlkYXRvciApO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3JlYXRlZE9iamVjdC5waGV0aW9UeXBlLmV4dGVuZHMoIGNvbnRhaW5lclBhcmFtZXRlclR5cGUhICksXHJcbiAgICAgICAgJ2R5bmFtaWMgZWxlbWVudCBjb250YWluZXIgZXhwZWN0ZWQgaXRzIGNyZWF0ZWQgaW5zdGFuY2VcXCdzIHBoZXRpb1R5cGUgdG8gbWF0Y2ggaXRzIHBhcmFtZXRlclR5cGUuJyApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiB0aGlzLmFzc2VydER5bmFtaWNQaGV0aW9PYmplY3QoIGNyZWF0ZWRPYmplY3QgKTtcclxuXHJcbiAgICByZXR1cm4gY3JlYXRlZE9iamVjdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgZHluYW1pYyBlbGVtZW50IHNob3VsZCBiZSBhbiBpbnN0cnVtZW50ZWQgUGhldGlvT2JqZWN0IHdpdGggcGhldGlvRHluYW1pY0VsZW1lbnQ6IHRydWVcclxuICAgKi9cclxuICBwcml2YXRlIGFzc2VydER5bmFtaWNQaGV0aW9PYmplY3QoIHBoZXRpb09iamVjdDogVCApOiB2b2lkIHtcclxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiBUYW5kZW0uVkFMSURBVElPTiApIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldGlvT2JqZWN0LmlzUGhldGlvSW5zdHJ1bWVudGVkKCksICdpbnN0YW5jZSBzaG91bGQgYmUgaW5zdHJ1bWVudGVkJyApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwaGV0aW9PYmplY3QucGhldGlvRHluYW1pY0VsZW1lbnQsICdpbnN0YW5jZSBzaG91bGQgYmUgbWFya2VkIGFzIHBoZXRpb0R5bmFtaWNFbGVtZW50OnRydWUnICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbWl0IGEgY3JlYXRlZCBvciBkaXNwb3NlZCBldmVudC5cclxuICAgKi9cclxuICBwcml2YXRlIGVtaXREYXRhU3RyZWFtRXZlbnQoIGR5bmFtaWNFbGVtZW50OiBULCBldmVudE5hbWU6IHN0cmluZywgYWRkaXRpb25hbERhdGE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IG51bGwgKTogdm9pZCB7XHJcbiAgICB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoIGV2ZW50TmFtZSwge1xyXG4gICAgICBkYXRhOiBtZXJnZSgge1xyXG4gICAgICAgIHBoZXRpb0lEOiBkeW5hbWljRWxlbWVudC50YW5kZW0ucGhldGlvSURcclxuICAgICAgfSwgYWRkaXRpb25hbERhdGEgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5waGV0aW9FbmRFdmVudCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRW1pdCBldmVudHMgd2hlbiBkeW5hbWljIGVsZW1lbnRzIGFyZSBjcmVhdGVkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY3JlYXRlZEV2ZW50TGlzdGVuZXIoIGR5bmFtaWNFbGVtZW50OiBUICk6IHZvaWQge1xyXG4gICAgY29uc3QgYWRkaXRpb25hbERhdGEgPSBkeW5hbWljRWxlbWVudC5waGV0aW9TdGF0ZSA/IHtcclxuXHJcbiAgICAgIHN0YXRlOiB0aGlzLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0udG9TdGF0ZU9iamVjdCggZHluYW1pY0VsZW1lbnQgKVxyXG4gICAgfSA6IG51bGw7XHJcbiAgICB0aGlzLmVtaXREYXRhU3RyZWFtRXZlbnQoIGR5bmFtaWNFbGVtZW50LCAnY3JlYXRlZCcsIGFkZGl0aW9uYWxEYXRhICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBFbWl0IGV2ZW50cyB3aGVuIGR5bmFtaWMgZWxlbWVudHMgYXJlIGRpc3Bvc2VkLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGlzcG9zZWRFdmVudExpc3RlbmVyKCBkeW5hbWljRWxlbWVudDogVCApOiB2b2lkIHtcclxuICAgIHRoaXMuZW1pdERhdGFTdHJlYW1FdmVudCggZHluYW1pY0VsZW1lbnQsICdkaXNwb3NlZCcgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIElmIGhpdHRpbmcgdGhpcyBhc3NlcnRpb24gYmVjYXVzZSBvZiBuZXN0ZWQgZHluYW1pYyBlbGVtZW50IGNvbnRhaW5lcnMsIHBsZWFzZSBkaXNjdXNzIHdpdGggYSBwaGV0LWlvIHRlYW0gbWVtYmVyLlxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdQaGV0aW9EeW5hbWljRWxlbWVudENvbnRhaW5lcnMgYXJlIG5vdCBpbnRlbmRlZCBmb3IgZGlzcG9zYWwnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlIGEgY29udGFpbmVkIGVsZW1lbnRcclxuICAgKiBAcGFyYW0gZWxlbWVudFxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBkaXNwb3NlRWxlbWVudCggZWxlbWVudDogVCApOiB2b2lkIHtcclxuICAgIGVsZW1lbnQuZGlzcG9zZSgpO1xyXG5cclxuICAgIGFzc2VydCAmJiB0aGlzLnN1cHBvcnRzRHluYW1pY1N0YXRlICYmIF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuam9pc3Quc2ltJyApICYmIGFzc2VydChcclxuICAgICAgLy8gV2UgZG8gbm90IHdhbnQgdG8gYmUgZGlzcG9zaW5nIGR5bmFtaWMgZWxlbWVudHMgd2hlbiBzdGF0ZSBzZXR0aW5nIEVYQ0VQVCB3aGVuIHdlIGFyZSBjbGVhcmluZyBhbGwgZHluYW1pY1xyXG4gICAgICAvLyBlbGVtZW50cyAod2hpY2ggaXMgb2sgYW5kIGV4cGVjdGVkIHRvIGRvIGF0IHRoZSBiZWdpbm5pbmcgb2Ygc2V0dGluZyBzdGF0ZSkuXHJcbiAgICAgICEoIHBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgJiYgIXBoZXQuam9pc3Quc2ltLmlzQ2xlYXJpbmdQaGV0aW9EeW5hbWljRWxlbWVudHNQcm9wZXJ0eSApLFxyXG4gICAgICAnc2hvdWxkIG5vdCBkaXNwb3NlIGEgZHluYW1pYyBlbGVtZW50IHdoaWxlIHNldHRpbmcgcGhldC1pbyBzdGF0ZScgKTtcclxuXHJcbiAgICBpZiAoIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkICkge1xyXG4gICAgICB0aGlzLmRlZmVycmVkRGlzcG9zYWxzLnB1c2goIGVsZW1lbnQgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmVsZW1lbnREaXNwb3NlZEVtaXR0ZXIuZW1pdCggZWxlbWVudCwgZWxlbWVudC50YW5kZW0ucGhldGlvSUQgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBhYnN0cmFjdCBjbGVhcigpOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBGbHVzaCBhIHNpbmdsZSBlbGVtZW50IGZyb20gdGhlIGxpc3Qgb2YgZGVmZXJyZWQgZGlzcG9zYWxzIHRoYXQgaGF2ZSBub3QgeWV0IG5vdGlmaWVkIGFib3V0IHRoZSBkaXNwb3NhbC4gVGhpc1xyXG4gICAqIHNob3VsZCBuZXZlciBiZSBjYWxsZWQgcHVibGljbHksIGluc3RlYWQgc2VlIGBkaXNwb3NlRWxlbWVudGBcclxuICAgKi9cclxuICBwcml2YXRlIG5vdGlmeUVsZW1lbnREaXNwb3NlZFdoaWxlRGVmZXJyZWQoIGRpc3Bvc2VkRWxlbWVudDogVCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkLCAnc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gbm90aWZpY2F0aW9ucyBhcmUgZGVmZXJyZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRlZmVycmVkRGlzcG9zYWxzLmluY2x1ZGVzKCBkaXNwb3NlZEVsZW1lbnQgKSwgJ2Rpc3Bvc2VkRWxlbWVudCBzaG91bGQgbm90IGhhdmUgYmVlbiBhbHJlYWR5IG5vdGlmaWVkJyApO1xyXG4gICAgdGhpcy5lbGVtZW50RGlzcG9zZWRFbWl0dGVyLmVtaXQoIGRpc3Bvc2VkRWxlbWVudCwgZGlzcG9zZWRFbGVtZW50LnRhbmRlbS5waGV0aW9JRCApO1xyXG4gICAgYXJyYXlSZW1vdmUoIHRoaXMuZGVmZXJyZWREaXNwb3NhbHMsIGRpc3Bvc2VkRWxlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2hvdWxkIGJlIGNhbGxlZCBieSBzdWJ0eXBlcyB1cG9uIGVsZW1lbnQgY3JlYXRpb24sIHNlZSBQaGV0aW9Hcm91cCBhcyBhbiBleGFtcGxlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBub3RpZnlFbGVtZW50Q3JlYXRlZCggY3JlYXRlZEVsZW1lbnQ6IFQgKTogdm9pZCB7XHJcbiAgICBpZiAoIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkICkge1xyXG4gICAgICB0aGlzLmRlZmVycmVkQ3JlYXRpb25zLnB1c2goIGNyZWF0ZWRFbGVtZW50ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5lbGVtZW50Q3JlYXRlZEVtaXR0ZXIuZW1pdCggY3JlYXRlZEVsZW1lbnQsIGNyZWF0ZWRFbGVtZW50LnRhbmRlbS5waGV0aW9JRCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmx1c2ggYSBzaW5nbGUgZWxlbWVudCBmcm9tIHRoZSBsaXN0IG9mIGRlZmVycmVkIGNyZWF0aW9ucyB0aGF0IGhhdmUgbm90IHlldCBub3RpZmllZCBhYm91dCB0aGUgZGlzcG9zYWwuIFRoaXNcclxuICAgKiBpcyBvbmx5IHB1YmxpYyB0byBzdXBwb3J0IHNwZWNpZmljIG9yZGVyIGRlcGVuZGVuY2llcyBpbiB0aGUgUGhldGlvU3RhdGVFbmdpbmUsIG90aGVyd2lzZSBzZWUgYHRoaXMubm90aWZ5RWxlbWVudENyZWF0ZWQoKWBcclxuICAgKiAoUGhldGlvR3JvdXBUZXN0cywgcGhldC1pbykgLSBvbmx5IHRoZSBQaGV0aW9TdGF0ZUVuZ2luZSBzaG91bGQgbm90aWZ5IGluZGl2aWR1YWwgZWxlbWVudHMgY3JlYXRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgbm90aWZ5RWxlbWVudENyZWF0ZWRXaGlsZURlZmVycmVkKCBjcmVhdGVkRWxlbWVudDogVCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkLCAnc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdoZW4gbm90aWZpY2F0aW9ucyBhcmUgZGVmZXJyZWQnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmRlZmVycmVkQ3JlYXRpb25zLmluY2x1ZGVzKCBjcmVhdGVkRWxlbWVudCApLCAnY3JlYXRlZEVsZW1lbnQgc2hvdWxkIG5vdCBoYXZlIGJlZW4gYWxyZWFkeSBub3RpZmllZCcgKTtcclxuICAgIHRoaXMuZWxlbWVudENyZWF0ZWRFbWl0dGVyLmVtaXQoIGNyZWF0ZWRFbGVtZW50LCBjcmVhdGVkRWxlbWVudC50YW5kZW0ucGhldGlvSUQgKTtcclxuICAgIGFycmF5UmVtb3ZlKCB0aGlzLmRlZmVycmVkQ3JlYXRpb25zLCBjcmVhdGVkRWxlbWVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBzZXQgdG8gdHJ1ZSwgY3JlYXRpb24gYW5kIGRpc3Bvc2FsIG5vdGlmaWNhdGlvbnMgd2lsbCBiZSBkZWZlcnJlZCB1bnRpbCBzZXQgdG8gZmFsc2UuIFdoZW4gc2V0IHRvIGZhbHNlLFxyXG4gICAqIHRoaXMgZnVuY3Rpb24gd2lsbCBmbHVzaCBhbGwgb2YgdGhlIG5vdGlmaWNhdGlvbnMgZm9yIGNyZWF0ZWQgYW5kIGRpc3Bvc2VkIGVsZW1lbnRzIChpbiB0aGF0IG9yZGVyKSB0aGF0IG9jY3VycmVkXHJcbiAgICogd2hpbGUgdGhpcyBjb250YWluZXIgd2FzIGRlZmVycmluZyBpdHMgbm90aWZpY2F0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0Tm90aWZpY2F0aW9uc0RlZmVycmVkKCBub3RpZmljYXRpb25zRGVmZXJyZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBub3RpZmljYXRpb25zRGVmZXJyZWQgIT09IHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkLCAnc2hvdWxkIG5vdCBiZSB0aGUgc2FtZSBhcyBjdXJyZW50IHZhbHVlJyApO1xyXG5cclxuICAgIC8vIEZsdXNoIGFsbCBub3RpZmljYXRpb25zIHdoZW4gc2V0dGluZyB0byBiZSBubyBsb25nZXIgZGVmZXJyZWRcclxuICAgIGlmICggIW5vdGlmaWNhdGlvbnNEZWZlcnJlZCApIHtcclxuICAgICAgd2hpbGUgKCB0aGlzLmRlZmVycmVkQ3JlYXRpb25zLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgICAgdGhpcy5ub3RpZnlFbGVtZW50Q3JlYXRlZFdoaWxlRGVmZXJyZWQoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnNbIDAgXSApO1xyXG4gICAgICB9XHJcbiAgICAgIHdoaWxlICggdGhpcy5kZWZlcnJlZERpc3Bvc2Fscy5sZW5ndGggPiAwICkge1xyXG4gICAgICAgIHRoaXMubm90aWZ5RWxlbWVudERpc3Bvc2VkV2hpbGVEZWZlcnJlZCggdGhpcy5kZWZlcnJlZERpc3Bvc2Fsc1sgMCBdICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGVmZXJyZWRDcmVhdGlvbnMubGVuZ3RoID09PSAwLCAnY3JlYXRpb25zIHNob3VsZCBiZSBjbGVhcicgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuZGVmZXJyZWREaXNwb3NhbHMubGVuZ3RoID09PSAwLCAnZGlzcG9zYWxzIHNob3VsZCBiZSBjbGVhcicgKTtcclxuICAgIHRoaXMubm90aWZpY2F0aW9uc0RlZmVycmVkID0gbm90aWZpY2F0aW9uc0RlZmVycmVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHRocm93cyBlcnJvciBpZiB0cnlpbmcgdG8gYWNjZXNzIHdoZW4gYXJjaGV0eXBlcyBhcmVuJ3QgYmVpbmcgY3JlYXRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0IGFyY2hldHlwZSgpOiBUIHtcclxuICAgIHJldHVybiBhcmNoZXR5cGVDYXN0KCB0aGlzLl9hcmNoZXR5cGUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCB0aGUgcGhldGlvRHluYW1pY0VsZW1lbnROYW1lIGZvciBBUEkgdHJhY2tpbmdcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgZ2V0TWV0YWRhdGEoIG9iamVjdDogUGhldGlvT2JqZWN0TWV0YWRhdGFJbnB1dCApOiBQaGV0aW9PYmplY3RNZXRhZGF0YSB7XHJcbiAgICBjb25zdCBtZXRhZGF0YSA9IHN1cGVyLmdldE1ldGFkYXRhKCBvYmplY3QgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICFtZXRhZGF0YS5oYXNPd25Qcm9wZXJ0eSggJ3BoZXRpb0R5bmFtaWNFbGVtZW50TmFtZScgKSxcclxuICAgICAgJ1BoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyIHNldHMgdGhlIHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZSBtZXRhZGF0YSBrZXknXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIG1lcmdlKCB7IHBoZXRpb0R5bmFtaWNFbGVtZW50TmFtZTogdGhpcy5waGV0aW9EeW5hbWljRWxlbWVudE5hbWUgfSwgbWV0YWRhdGEgKTtcclxuICB9XHJcbn1cclxuXHJcbnRhbmRlbU5hbWVzcGFjZS5yZWdpc3RlciggJ1BoZXRpb0R5bmFtaWNFbGVtZW50Q29udGFpbmVyJywgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgUGhldGlvRHluYW1pY0VsZW1lbnRDb250YWluZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLDBCQUEwQjtBQUU5QyxPQUFPQyxRQUFRLE1BQU0sMkJBQTJCO0FBQ2hELE9BQU9DLFdBQVcsTUFBTSxtQ0FBbUM7QUFDM0QsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUUvQyxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsWUFBWSxNQUEwRCxtQkFBbUI7QUFDaEcsT0FBT0MsTUFBTSxJQUFJQyxzQkFBc0IsUUFBUSxhQUFhO0FBQzVELE9BQU9DLGVBQWUsTUFBTSxzQkFBc0I7QUFLbEQsT0FBT0MsUUFBUSxNQUFNLHFCQUFxQjs7QUFFMUM7QUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxXQUFXO0FBeUI1QyxTQUFTQyxhQUFhQSxDQUFLQyxTQUFtQixFQUFNO0VBQ2xELElBQUtBLFNBQVMsS0FBSyxJQUFJLEVBQUc7SUFDeEIsTUFBTSxJQUFJQyxLQUFLLENBQUUsd0JBQXlCLENBQUM7RUFDN0M7RUFDQSxPQUFPRCxTQUFTO0FBQ2xCO0FBRUEsTUFBZUUsNkJBQTZCLFNBQWtFVCxZQUFZLENBQUM7RUFPMUU7O0VBSS9DOztFQUdBO0FBQ0Y7QUFD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