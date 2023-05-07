// Copyright 2020-2023, University of Colorado Boulder

/**
 * Responsible for handling Property-specific logic associated with setting PhET-iO state. This file will defer Properties
 * from taking their final value, and notifying on that value until after state has been set on every Property. It is
 * also responsible for keeping track of order dependencies between different Properties, and making sure that undeferral
 * and notifications go out in the appropriate orders. See https://github.com/phetsims/axon/issues/276 for implementation details.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Tandem from '../../tandem/js/Tandem.js';
import axon from './axon.js';
import PropertyStatePhase from './PropertyStatePhase.js';
import ReadOnlyProperty from './ReadOnlyProperty.js';
class PropertyStateHandler {
  initialized = false;
  constructor() {
    // Properties support setDeferred(). We defer setting their values so all changes take effect
    // at once. This keeps track of finalization actions (embodied in a PhaseCallback) that must take place after all
    // Property values have changed. This keeps track of both types of PropertyStatePhase: undeferring and notification.
    this.phaseCallbackSets = new PhaseCallbackSets();

    // each pair has a Map optimized for looking up based on the "before phetioID" and the "after phetioID"
    // of the dependency. Having a data structure set up for both directions of look-up makes each operation O(1). See https://github.com/phetsims/axon/issues/316
    this.undeferBeforeUndeferMapPair = new OrderDependencyMapPair(PropertyStatePhase.UNDEFER, PropertyStatePhase.UNDEFER);
    this.undeferBeforeNotifyMapPair = new OrderDependencyMapPair(PropertyStatePhase.UNDEFER, PropertyStatePhase.NOTIFY);
    this.notifyBeforeUndeferMapPair = new OrderDependencyMapPair(PropertyStatePhase.NOTIFY, PropertyStatePhase.UNDEFER);
    this.notifyBeforeNotifyMapPair = new OrderDependencyMapPair(PropertyStatePhase.NOTIFY, PropertyStatePhase.NOTIFY);

    // keep a list of all map pairs for easier iteration
    this.mapPairs = [this.undeferBeforeUndeferMapPair, this.undeferBeforeNotifyMapPair, this.notifyBeforeUndeferMapPair, this.notifyBeforeNotifyMapPair];
  }
  initialize(phetioStateEngine) {
    assert && assert(!this.initialized, 'cannot initialize twice');
    phetioStateEngine.onBeforeApplyStateEmitter.addListener(phetioObject => {
      // withhold AXON/Property notifications until all values have been set to avoid inconsistent intermediate states,
      // see https://github.com/phetsims/phet-io-wrappers/issues/229
      // only do this if the PhetioObject is already not deferred
      if (phetioObject instanceof ReadOnlyProperty && !phetioObject.isDeferred) {
        phetioObject.setDeferred(true);
        const phetioID = phetioObject.tandem.phetioID;
        const listener = () => {
          const potentialListener = phetioObject.setDeferred(false);

          // Always add a PhaseCallback so that we can track the order dependency, even though setDeferred can return null.
          this.phaseCallbackSets.addNotifyPhaseCallback(new PhaseCallback(phetioID, PropertyStatePhase.NOTIFY, potentialListener || _.noop));
        };
        this.phaseCallbackSets.addUndeferPhaseCallback(new PhaseCallback(phetioID, PropertyStatePhase.UNDEFER, listener));
      }
    });
    phetioStateEngine.stateSetEmitter.addListener(state => {
      // Properties set to final values and notify of any value changes.
      this.undeferAndNotifyProperties(new Set(Object.keys(state)));
    });
    phetioStateEngine.isSettingStateProperty.lazyLink(isSettingState => {
      assert && !isSettingState && assert(this.phaseCallbackSets.size === 0, 'PhaseCallbacks should have all been applied');
    });
    this.initialized = true;
  }
  static validateInstrumentedProperty(property) {
    assert && Tandem.VALIDATION && assert(property instanceof ReadOnlyProperty && property.isPhetioInstrumented(), `must be an instrumented Property: ${property}`);
  }
  validatePropertyPhasePair(property, phase) {
    PropertyStateHandler.validateInstrumentedProperty(property);
  }

  /**
   * Get the MapPair associated with the proved PropertyStatePhases
   */
  getMapPairFromPhases(beforePhase, afterPhase) {
    const matchedPairs = this.mapPairs.filter(mapPair => beforePhase === mapPair.beforePhase && afterPhase === mapPair.afterPhase);
    assert && assert(matchedPairs.length === 1, 'one and only one map should match the provided phases');
    return matchedPairs[0];
  }

  /**
   * Register that one Property must have a "Phase" applied for PhET-iO state before another Property's Phase. A Phase
   * is an ending state in PhET-iO state set where Property values solidify, notifications for value changes are called.
   * The PhET-iO state engine will always undefer a Property before it notifies its listeners. This is for registering
   * two different Properties.
   *
   * @param beforeProperty - the Property that needs to be set before the second; must be instrumented for PhET-iO
   * @param beforePhase
   * @param afterProperty - must be instrumented for PhET-iO
   * @param afterPhase
   */
  registerPhetioOrderDependency(beforeProperty, beforePhase, afterProperty, afterPhase) {
    if (Tandem.PHET_IO_ENABLED) {
      this.validatePropertyPhasePair(beforeProperty, beforePhase);
      this.validatePropertyPhasePair(afterProperty, afterPhase);
      assert && beforeProperty === afterProperty && assert(beforePhase !== afterPhase, 'cannot set same Property to same phase');
      const mapPair = this.getMapPairFromPhases(beforePhase, afterPhase);
      mapPair.addOrderDependency(beforeProperty.tandem.phetioID, afterProperty.tandem.phetioID);
    }
  }

  /**
   * {Property} property - must be instrumented for PhET-iO
   * {boolean} - true if Property is in any order dependency
   */
  propertyInAnOrderDependency(property) {
    PropertyStateHandler.validateInstrumentedProperty(property);
    return _.some(this.mapPairs, mapPair => mapPair.usesPhetioID(property.tandem.phetioID));
  }

  /**
   * Unregisters all order dependencies for the given Property
   * {ReadOnlyProperty} property - must be instrumented for PhET-iO
   */
  unregisterOrderDependenciesForProperty(property) {
    if (Tandem.PHET_IO_ENABLED) {
      PropertyStateHandler.validateInstrumentedProperty(property);

      // Be graceful if given a Property that is not registered in an order dependency.
      if (this.propertyInAnOrderDependency(property)) {
        assert && assert(this.propertyInAnOrderDependency(property), 'Property must be registered in an order dependency to be unregistered');
        this.mapPairs.forEach(mapPair => mapPair.unregisterOrderDependenciesForProperty(property));
      }
    }
  }

  /**
   * Given registered Property Phase order dependencies, undefer all AXON/Property PhET-iO elements to take their
   * correct values and have each notify their listeners.
   * {Set.<string>} phetioIDsInState - set of phetioIDs that were set in state
   */
  undeferAndNotifyProperties(phetioIDsInState) {
    assert && assert(this.initialized, 'must be initialized before getting called');

    // {Object.<string,boolean>} - true if a phetioID + phase pair has been applied, keys are the combination of
    // phetioIDs and phase, see PhaseCallback.getTerm()
    const completedPhases = {};

    // to support failing out instead of infinite loop
    let numberOfIterations = 0;

    // Normally we would like to undefer things before notify, but make sure this is done in accordance with the order dependencies.
    while (this.phaseCallbackSets.size > 0) {
      numberOfIterations++;

      // Error case logging
      if (numberOfIterations > 5000) {
        this.errorInUndeferAndNotifyStep(completedPhases);
      }

      // Try to undefer as much as possible before notifying
      this.attemptToApplyPhases(PropertyStatePhase.UNDEFER, completedPhases, phetioIDsInState);
      this.attemptToApplyPhases(PropertyStatePhase.NOTIFY, completedPhases, phetioIDsInState);
    }
  }
  errorInUndeferAndNotifyStep(completedPhases) {
    // combine phetioID and Phase into a single string to keep this process specific.
    const stillToDoIDPhasePairs = [];
    this.phaseCallbackSets.forEach(phaseCallback => stillToDoIDPhasePairs.push(phaseCallback.getTerm()));
    const relevantOrderDependencies = [];
    this.mapPairs.forEach(mapPair => {
      const beforeMap = mapPair.beforeMap;
      for (const [beforePhetioID, afterPhetioIDs] of beforeMap) {
        afterPhetioIDs.forEach(afterPhetioID => {
          const beforeTerm = beforePhetioID + beforeMap.beforePhase;
          const afterTerm = afterPhetioID + beforeMap.afterPhase;
          if (stillToDoIDPhasePairs.includes(beforeTerm) || stillToDoIDPhasePairs.includes(afterTerm)) {
            relevantOrderDependencies.push({
              beforeTerm: beforeTerm,
              afterTerm: afterTerm
            });
          }
        });
      }
    });
    let string = '';
    console.log('still to be undeferred', this.phaseCallbackSets.undeferSet);
    console.log('still to be notified', this.phaseCallbackSets.notifySet);
    console.log('order dependencies that apply to the still todos', relevantOrderDependencies);
    relevantOrderDependencies.forEach(orderDependency => {
      string += `${orderDependency.beforeTerm}\t${orderDependency.afterTerm}\n`;
    });
    console.log('\n\nin graphable form:\n\n', string);
    const assertMessage = 'Impossible set state: from undeferAndNotifyProperties; ordering constraints cannot be satisfied';
    assert && assert(false, assertMessage);

    // We must exit here even if assertions are disabled so it wouldn't lock up the browser.
    if (!assert) {
      throw new Error(assertMessage);
    }
  }

  /**
   * Only for Testing!
   * Get the number of order dependencies registered in this class
   *
   */
  getNumberOfOrderDependencies() {
    let count = 0;
    this.mapPairs.forEach(mapPair => {
      mapPair.afterMap.forEach(valueSet => {
        count += valueSet.size;
      });
    });
    return count;
  }

  /**
   * Go through all phases still to be applied, and apply them if the order dependencies allow it. Only apply for the
   * particular phase provided. In general UNDEFER must occur before the same phetioID gets NOTIFY.
   *
   * @param phase - only apply PhaseCallbacks for this particular PropertyStatePhase
   * @param completedPhases - map that keeps track of completed phases
   * @param phetioIDsInState - set of phetioIDs that were set in state
   */
  attemptToApplyPhases(phase, completedPhases, phetioIDsInState) {
    const phaseCallbackSet = this.phaseCallbackSets.getSetFromPhase(phase);
    for (const phaseCallbackToPotentiallyApply of phaseCallbackSet) {
      assert && assert(phaseCallbackToPotentiallyApply.phase === phase, 'phaseCallbackSet should only include callbacks for provided phase');

      // only try to check the order dependencies to see if this has to be after something that is incomplete.
      if (this.phetioIDCanApplyPhase(phaseCallbackToPotentiallyApply.phetioID, phase, completedPhases, phetioIDsInState)) {
        // Fire the listener;
        phaseCallbackToPotentiallyApply.listener();

        // Remove it from the master list so that it doesn't get called again.
        phaseCallbackSet.delete(phaseCallbackToPotentiallyApply);

        // Keep track of all completed PhaseCallbacks
        completedPhases[phaseCallbackToPotentiallyApply.getTerm()] = true;
      }
    }
  }

  /**
   * @param phetioID - think of this as the "afterPhetioID" since there may be some phases that need to be applied before it has this phase done.
   * @param phase
   * @param completedPhases - map that keeps track of completed phases
   * @param phetioIDsInState - set of phetioIDs that were set in state
   * @param - if the provided phase can be applied given the dependency order dependencies of the state engine.
   */
  phetioIDCanApplyPhase(phetioID, phase, completedPhases, phetioIDsInState) {
    // Undefer must happen before notify
    if (phase === PropertyStatePhase.NOTIFY && !completedPhases[phetioID + PropertyStatePhase.UNDEFER]) {
      return false;
    }

    // Get a list of the maps for this phase being applies.
    const mapsToCheck = [];
    this.mapPairs.forEach(mapPair => {
      if (mapPair.afterPhase === phase) {
        // Use the "afterMap" because below looks up what needs to come before.
        mapsToCheck.push(mapPair.afterMap);
      }
    });

    // O(2)
    for (let i = 0; i < mapsToCheck.length; i++) {
      const mapToCheck = mapsToCheck[i];
      if (!mapToCheck.has(phetioID)) {
        return true;
      }
      const setOfThingsThatShouldComeFirst = mapToCheck.get(phetioID);
      assert && assert(setOfThingsThatShouldComeFirst, 'must have this set');

      // O(K) where K is the number of elements that should come before Property X
      for (const beforePhetioID of setOfThingsThatShouldComeFirst) {
        // check if the before phase for this order dependency has already been completed
        // Make sure that we only care about elements that were actually set during this state set
        if (!completedPhases[beforePhetioID + mapToCheck.beforePhase] && phetioIDsInState.has(beforePhetioID) && phetioIDsInState.has(phetioID)) {
          return false;
        }
      }
    }
    return true;
  }
}

// POJSO for a callback for a specific Phase in a Property's state set lifecycle. See undeferAndNotifyProperties()
class PhaseCallback {
  constructor(phetioID, phase, listener = _.noop) {
    this.phetioID = phetioID;
    this.phase = phase;
    this.listener = listener;
  }

  /**
   * {string} - unique term for the id/phase pair
   */
  getTerm() {
    return this.phetioID + this.phase;
  }
}
class OrderDependencyMapPair {
  constructor(beforePhase, afterPhase) {
    // @ts-expect-error, it is easiest to fudge here since we are adding the PhaseMap properties just below here.
    this.beforeMap = new Map();
    this.beforeMap.beforePhase = beforePhase;
    this.beforeMap.afterPhase = afterPhase;

    // @ts-expect-error, it is easiest to fudge here since we are adding the PhaseMap properties just below here.
    this.afterMap = new Map();
    this.afterMap.beforePhase = beforePhase;
    this.afterMap.afterPhase = afterPhase;
    this.beforeMap.otherMap = this.afterMap;
    this.afterMap.otherMap = this.beforeMap;
    this.beforePhase = beforePhase;
    this.afterPhase = afterPhase;
  }

  /**
   * Register an order dependency between two phetioIDs. This will add data to maps in "both direction". If accessing
   * with just the beforePhetioID, or with the afterPhetioID.
   */
  addOrderDependency(beforePhetioID, afterPhetioID) {
    if (!this.beforeMap.has(beforePhetioID)) {
      this.beforeMap.set(beforePhetioID, new Set());
    }
    this.beforeMap.get(beforePhetioID).add(afterPhetioID);
    if (!this.afterMap.has(afterPhetioID)) {
      this.afterMap.set(afterPhetioID, new Set());
    }
    this.afterMap.get(afterPhetioID).add(beforePhetioID);
  }

  /**
   * Unregister all order dependencies for the provided Property
   */
  unregisterOrderDependenciesForProperty(property) {
    const phetioIDToRemove = property.tandem.phetioID;
    [this.beforeMap, this.afterMap].forEach(map => {
      map.has(phetioIDToRemove) && map.get(phetioIDToRemove).forEach(phetioID => {
        const setOfAfterMapIDs = map.otherMap.get(phetioID);
        setOfAfterMapIDs && setOfAfterMapIDs.delete(phetioIDToRemove);

        // Clear out empty entries to avoid having lots of empty Sets sitting around
        setOfAfterMapIDs.size === 0 && map.otherMap.delete(phetioID);
      });
      map.delete(phetioIDToRemove);
    });

    // Look through every dependency and make sure the phetioID to remove has been completely removed.
    assertSlow && [this.beforeMap, this.afterMap].forEach(map => {
      map.forEach((valuePhetioIDs, key) => {
        assertSlow && assertSlow(key !== phetioIDToRemove, 'should not be a key');
        assertSlow && assertSlow(!valuePhetioIDs.has(phetioIDToRemove), 'should not be in a value list');
      });
    });
  }
  usesPhetioID(phetioID) {
    return this.beforeMap.has(phetioID) || this.afterMap.has(phetioID);
  }
}

// POJSO to keep track of PhaseCallbacks while providing O(1) lookup time because it is built on Set
class PhaseCallbackSets {
  undeferSet = new Set();
  notifySet = new Set();
  get size() {
    return this.undeferSet.size + this.notifySet.size;
  }
  forEach(callback) {
    this.undeferSet.forEach(callback);
    this.notifySet.forEach(callback);
  }
  addUndeferPhaseCallback(phaseCallback) {
    this.undeferSet.add(phaseCallback);
  }
  addNotifyPhaseCallback(phaseCallback) {
    this.notifySet.add(phaseCallback);
  }
  getSetFromPhase(phase) {
    return phase === PropertyStatePhase.NOTIFY ? this.notifySet : this.undeferSet;
  }
}
axon.register('PropertyStateHandler', PropertyStateHandler);
export default PropertyStateHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYW5kZW0iLCJheG9uIiwiUHJvcGVydHlTdGF0ZVBoYXNlIiwiUmVhZE9ubHlQcm9wZXJ0eSIsIlByb3BlcnR5U3RhdGVIYW5kbGVyIiwiaW5pdGlhbGl6ZWQiLCJjb25zdHJ1Y3RvciIsInBoYXNlQ2FsbGJhY2tTZXRzIiwiUGhhc2VDYWxsYmFja1NldHMiLCJ1bmRlZmVyQmVmb3JlVW5kZWZlck1hcFBhaXIiLCJPcmRlckRlcGVuZGVuY3lNYXBQYWlyIiwiVU5ERUZFUiIsInVuZGVmZXJCZWZvcmVOb3RpZnlNYXBQYWlyIiwiTk9USUZZIiwibm90aWZ5QmVmb3JlVW5kZWZlck1hcFBhaXIiLCJub3RpZnlCZWZvcmVOb3RpZnlNYXBQYWlyIiwibWFwUGFpcnMiLCJpbml0aWFsaXplIiwicGhldGlvU3RhdGVFbmdpbmUiLCJhc3NlcnQiLCJvbkJlZm9yZUFwcGx5U3RhdGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJwaGV0aW9PYmplY3QiLCJpc0RlZmVycmVkIiwic2V0RGVmZXJyZWQiLCJwaGV0aW9JRCIsInRhbmRlbSIsImxpc3RlbmVyIiwicG90ZW50aWFsTGlzdGVuZXIiLCJhZGROb3RpZnlQaGFzZUNhbGxiYWNrIiwiUGhhc2VDYWxsYmFjayIsIl8iLCJub29wIiwiYWRkVW5kZWZlclBoYXNlQ2FsbGJhY2siLCJzdGF0ZVNldEVtaXR0ZXIiLCJzdGF0ZSIsInVuZGVmZXJBbmROb3RpZnlQcm9wZXJ0aWVzIiwiU2V0IiwiT2JqZWN0Iiwia2V5cyIsImlzU2V0dGluZ1N0YXRlUHJvcGVydHkiLCJsYXp5TGluayIsImlzU2V0dGluZ1N0YXRlIiwic2l6ZSIsInZhbGlkYXRlSW5zdHJ1bWVudGVkUHJvcGVydHkiLCJwcm9wZXJ0eSIsIlZBTElEQVRJT04iLCJpc1BoZXRpb0luc3RydW1lbnRlZCIsInZhbGlkYXRlUHJvcGVydHlQaGFzZVBhaXIiLCJwaGFzZSIsImdldE1hcFBhaXJGcm9tUGhhc2VzIiwiYmVmb3JlUGhhc2UiLCJhZnRlclBoYXNlIiwibWF0Y2hlZFBhaXJzIiwiZmlsdGVyIiwibWFwUGFpciIsImxlbmd0aCIsInJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5IiwiYmVmb3JlUHJvcGVydHkiLCJhZnRlclByb3BlcnR5IiwiUEhFVF9JT19FTkFCTEVEIiwiYWRkT3JkZXJEZXBlbmRlbmN5IiwicHJvcGVydHlJbkFuT3JkZXJEZXBlbmRlbmN5Iiwic29tZSIsInVzZXNQaGV0aW9JRCIsInVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5IiwiZm9yRWFjaCIsInBoZXRpb0lEc0luU3RhdGUiLCJjb21wbGV0ZWRQaGFzZXMiLCJudW1iZXJPZkl0ZXJhdGlvbnMiLCJlcnJvckluVW5kZWZlckFuZE5vdGlmeVN0ZXAiLCJhdHRlbXB0VG9BcHBseVBoYXNlcyIsInN0aWxsVG9Eb0lEUGhhc2VQYWlycyIsInBoYXNlQ2FsbGJhY2siLCJwdXNoIiwiZ2V0VGVybSIsInJlbGV2YW50T3JkZXJEZXBlbmRlbmNpZXMiLCJiZWZvcmVNYXAiLCJiZWZvcmVQaGV0aW9JRCIsImFmdGVyUGhldGlvSURzIiwiYWZ0ZXJQaGV0aW9JRCIsImJlZm9yZVRlcm0iLCJhZnRlclRlcm0iLCJpbmNsdWRlcyIsInN0cmluZyIsImNvbnNvbGUiLCJsb2ciLCJ1bmRlZmVyU2V0Iiwibm90aWZ5U2V0Iiwib3JkZXJEZXBlbmRlbmN5IiwiYXNzZXJ0TWVzc2FnZSIsIkVycm9yIiwiZ2V0TnVtYmVyT2ZPcmRlckRlcGVuZGVuY2llcyIsImNvdW50IiwiYWZ0ZXJNYXAiLCJ2YWx1ZVNldCIsInBoYXNlQ2FsbGJhY2tTZXQiLCJnZXRTZXRGcm9tUGhhc2UiLCJwaGFzZUNhbGxiYWNrVG9Qb3RlbnRpYWxseUFwcGx5IiwicGhldGlvSURDYW5BcHBseVBoYXNlIiwiZGVsZXRlIiwibWFwc1RvQ2hlY2siLCJpIiwibWFwVG9DaGVjayIsImhhcyIsInNldE9mVGhpbmdzVGhhdFNob3VsZENvbWVGaXJzdCIsImdldCIsIk1hcCIsIm90aGVyTWFwIiwic2V0IiwiYWRkIiwicGhldGlvSURUb1JlbW92ZSIsIm1hcCIsInNldE9mQWZ0ZXJNYXBJRHMiLCJhc3NlcnRTbG93IiwidmFsdWVQaGV0aW9JRHMiLCJrZXkiLCJjYWxsYmFjayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUHJvcGVydHlTdGF0ZUhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVzcG9uc2libGUgZm9yIGhhbmRsaW5nIFByb3BlcnR5LXNwZWNpZmljIGxvZ2ljIGFzc29jaWF0ZWQgd2l0aCBzZXR0aW5nIFBoRVQtaU8gc3RhdGUuIFRoaXMgZmlsZSB3aWxsIGRlZmVyIFByb3BlcnRpZXNcclxuICogZnJvbSB0YWtpbmcgdGhlaXIgZmluYWwgdmFsdWUsIGFuZCBub3RpZnlpbmcgb24gdGhhdCB2YWx1ZSB1bnRpbCBhZnRlciBzdGF0ZSBoYXMgYmVlbiBzZXQgb24gZXZlcnkgUHJvcGVydHkuIEl0IGlzXHJcbiAqIGFsc28gcmVzcG9uc2libGUgZm9yIGtlZXBpbmcgdHJhY2sgb2Ygb3JkZXIgZGVwZW5kZW5jaWVzIGJldHdlZW4gZGlmZmVyZW50IFByb3BlcnRpZXMsIGFuZCBtYWtpbmcgc3VyZSB0aGF0IHVuZGVmZXJyYWxcclxuICogYW5kIG5vdGlmaWNhdGlvbnMgZ28gb3V0IGluIHRoZSBhcHByb3ByaWF0ZSBvcmRlcnMuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMjc2IGZvciBpbXBsZW1lbnRhdGlvbiBkZXRhaWxzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEludGVudGlvbmFsQW55IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9JbnRlbnRpb25hbEFueS5qcyc7XHJcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eVN0YXRlUGhhc2UgZnJvbSAnLi9Qcm9wZXJ0eVN0YXRlUGhhc2UuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUGhldGlvT2JqZWN0IGZyb20gJy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBURW1pdHRlciBmcm9tICcuL1RFbWl0dGVyLmpzJztcclxuaW1wb3J0IHsgRnVsbFBoZXRpb1N0YXRlIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbUNvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFBoZXRpb1N0YXRlRW5naW5lU3R1YiA9IHtcclxuICBvbkJlZm9yZUFwcGx5U3RhdGVFbWl0dGVyOiBURW1pdHRlcjxbIFBoZXRpb09iamVjdCBdPjtcclxuICBzdGF0ZVNldEVtaXR0ZXI6IFRFbWl0dGVyPFsgRnVsbFBoZXRpb1N0YXRlLCBUYW5kZW0gXT47XHJcbiAgaXNTZXR0aW5nU3RhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcbn07XHJcblxyXG50eXBlIFBoYXNlTWFwID0ge1xyXG4gIGJlZm9yZVBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2U7XHJcbiAgYWZ0ZXJQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlO1xyXG4gIG90aGVyTWFwOiBQaGFzZU1hcDtcclxufSAmIE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PjtcclxuXHJcbnR5cGUgT3JkZXJEZXBlbmRlbmN5ID0ge1xyXG4gIGJlZm9yZVRlcm06IHN0cmluZztcclxuICBhZnRlclRlcm06IHN0cmluZztcclxufTtcclxuXHJcbmNsYXNzIFByb3BlcnR5U3RhdGVIYW5kbGVyIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IHBoYXNlQ2FsbGJhY2tTZXRzOiBQaGFzZUNhbGxiYWNrU2V0cztcclxuICBwcml2YXRlIHJlYWRvbmx5IHVuZGVmZXJCZWZvcmVVbmRlZmVyTWFwUGFpcjogT3JkZXJEZXBlbmRlbmN5TWFwUGFpcjtcclxuICBwcml2YXRlIHJlYWRvbmx5IHVuZGVmZXJCZWZvcmVOb3RpZnlNYXBQYWlyOiBPcmRlckRlcGVuZGVuY3lNYXBQYWlyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbm90aWZ5QmVmb3JlVW5kZWZlck1hcFBhaXI6IE9yZGVyRGVwZW5kZW5jeU1hcFBhaXI7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBub3RpZnlCZWZvcmVOb3RpZnlNYXBQYWlyOiBPcmRlckRlcGVuZGVuY3lNYXBQYWlyO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbWFwUGFpcnM6IE9yZGVyRGVwZW5kZW5jeU1hcFBhaXJbXTtcclxuICBwcml2YXRlIGluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICAvLyBQcm9wZXJ0aWVzIHN1cHBvcnQgc2V0RGVmZXJyZWQoKS4gV2UgZGVmZXIgc2V0dGluZyB0aGVpciB2YWx1ZXMgc28gYWxsIGNoYW5nZXMgdGFrZSBlZmZlY3RcclxuICAgIC8vIGF0IG9uY2UuIFRoaXMga2VlcHMgdHJhY2sgb2YgZmluYWxpemF0aW9uIGFjdGlvbnMgKGVtYm9kaWVkIGluIGEgUGhhc2VDYWxsYmFjaykgdGhhdCBtdXN0IHRha2UgcGxhY2UgYWZ0ZXIgYWxsXHJcbiAgICAvLyBQcm9wZXJ0eSB2YWx1ZXMgaGF2ZSBjaGFuZ2VkLiBUaGlzIGtlZXBzIHRyYWNrIG9mIGJvdGggdHlwZXMgb2YgUHJvcGVydHlTdGF0ZVBoYXNlOiB1bmRlZmVycmluZyBhbmQgbm90aWZpY2F0aW9uLlxyXG4gICAgdGhpcy5waGFzZUNhbGxiYWNrU2V0cyA9IG5ldyBQaGFzZUNhbGxiYWNrU2V0cygpO1xyXG5cclxuICAgIC8vIGVhY2ggcGFpciBoYXMgYSBNYXAgb3B0aW1pemVkIGZvciBsb29raW5nIHVwIGJhc2VkIG9uIHRoZSBcImJlZm9yZSBwaGV0aW9JRFwiIGFuZCB0aGUgXCJhZnRlciBwaGV0aW9JRFwiXHJcbiAgICAvLyBvZiB0aGUgZGVwZW5kZW5jeS4gSGF2aW5nIGEgZGF0YSBzdHJ1Y3R1cmUgc2V0IHVwIGZvciBib3RoIGRpcmVjdGlvbnMgb2YgbG9vay11cCBtYWtlcyBlYWNoIG9wZXJhdGlvbiBPKDEpLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzMxNlxyXG4gICAgdGhpcy51bmRlZmVyQmVmb3JlVW5kZWZlck1hcFBhaXIgPSBuZXcgT3JkZXJEZXBlbmRlbmN5TWFwUGFpciggUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSICk7XHJcbiAgICB0aGlzLnVuZGVmZXJCZWZvcmVOb3RpZnlNYXBQYWlyID0gbmV3IE9yZGVyRGVwZW5kZW5jeU1hcFBhaXIoIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLCBQcm9wZXJ0eVN0YXRlUGhhc2UuTk9USUZZICk7XHJcbiAgICB0aGlzLm5vdGlmeUJlZm9yZVVuZGVmZXJNYXBQYWlyID0gbmV3IE9yZGVyRGVwZW5kZW5jeU1hcFBhaXIoIFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRlksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSICk7XHJcbiAgICB0aGlzLm5vdGlmeUJlZm9yZU5vdGlmeU1hcFBhaXIgPSBuZXcgT3JkZXJEZXBlbmRlbmN5TWFwUGFpciggUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSApO1xyXG5cclxuICAgIC8vIGtlZXAgYSBsaXN0IG9mIGFsbCBtYXAgcGFpcnMgZm9yIGVhc2llciBpdGVyYXRpb25cclxuICAgIHRoaXMubWFwUGFpcnMgPSBbXHJcbiAgICAgIHRoaXMudW5kZWZlckJlZm9yZVVuZGVmZXJNYXBQYWlyLFxyXG4gICAgICB0aGlzLnVuZGVmZXJCZWZvcmVOb3RpZnlNYXBQYWlyLFxyXG4gICAgICB0aGlzLm5vdGlmeUJlZm9yZVVuZGVmZXJNYXBQYWlyLFxyXG4gICAgICB0aGlzLm5vdGlmeUJlZm9yZU5vdGlmeU1hcFBhaXJcclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaW5pdGlhbGl6ZSggcGhldGlvU3RhdGVFbmdpbmU6IFBoZXRpb1N0YXRlRW5naW5lU3R1YiApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmluaXRpYWxpemVkLCAnY2Fubm90IGluaXRpYWxpemUgdHdpY2UnICk7XHJcblxyXG4gICAgcGhldGlvU3RhdGVFbmdpbmUub25CZWZvcmVBcHBseVN0YXRlRW1pdHRlci5hZGRMaXN0ZW5lciggcGhldGlvT2JqZWN0ID0+IHtcclxuXHJcbiAgICAgIC8vIHdpdGhob2xkIEFYT04vUHJvcGVydHkgbm90aWZpY2F0aW9ucyB1bnRpbCBhbGwgdmFsdWVzIGhhdmUgYmVlbiBzZXQgdG8gYXZvaWQgaW5jb25zaXN0ZW50IGludGVybWVkaWF0ZSBzdGF0ZXMsXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby13cmFwcGVycy9pc3N1ZXMvMjI5XHJcbiAgICAgIC8vIG9ubHkgZG8gdGhpcyBpZiB0aGUgUGhldGlvT2JqZWN0IGlzIGFscmVhZHkgbm90IGRlZmVycmVkXHJcbiAgICAgIGlmICggcGhldGlvT2JqZWN0IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSAmJiAhcGhldGlvT2JqZWN0LmlzRGVmZXJyZWQgKSB7XHJcbiAgICAgICAgcGhldGlvT2JqZWN0LnNldERlZmVycmVkKCB0cnVlICk7XHJcbiAgICAgICAgY29uc3QgcGhldGlvSUQgPSBwaGV0aW9PYmplY3QudGFuZGVtLnBoZXRpb0lEO1xyXG5cclxuICAgICAgICBjb25zdCBsaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBvdGVudGlhbExpc3RlbmVyID0gcGhldGlvT2JqZWN0LnNldERlZmVycmVkKCBmYWxzZSApO1xyXG5cclxuICAgICAgICAgIC8vIEFsd2F5cyBhZGQgYSBQaGFzZUNhbGxiYWNrIHNvIHRoYXQgd2UgY2FuIHRyYWNrIHRoZSBvcmRlciBkZXBlbmRlbmN5LCBldmVuIHRob3VnaCBzZXREZWZlcnJlZCBjYW4gcmV0dXJuIG51bGwuXHJcbiAgICAgICAgICB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzLmFkZE5vdGlmeVBoYXNlQ2FsbGJhY2soIG5ldyBQaGFzZUNhbGxiYWNrKCBwaGV0aW9JRCwgUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgcG90ZW50aWFsTGlzdGVuZXIgfHwgXy5ub29wICkgKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMucGhhc2VDYWxsYmFja1NldHMuYWRkVW5kZWZlclBoYXNlQ2FsbGJhY2soIG5ldyBQaGFzZUNhbGxiYWNrKCBwaGV0aW9JRCwgUHJvcGVydHlTdGF0ZVBoYXNlLlVOREVGRVIsIGxpc3RlbmVyICkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHBoZXRpb1N0YXRlRW5naW5lLnN0YXRlU2V0RW1pdHRlci5hZGRMaXN0ZW5lciggc3RhdGUgPT4ge1xyXG5cclxuICAgICAgLy8gUHJvcGVydGllcyBzZXQgdG8gZmluYWwgdmFsdWVzIGFuZCBub3RpZnkgb2YgYW55IHZhbHVlIGNoYW5nZXMuXHJcbiAgICAgIHRoaXMudW5kZWZlckFuZE5vdGlmeVByb3BlcnRpZXMoIG5ldyBTZXQoIE9iamVjdC5rZXlzKCBzdGF0ZSApICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBwaGV0aW9TdGF0ZUVuZ2luZS5pc1NldHRpbmdTdGF0ZVByb3BlcnR5LmxhenlMaW5rKCBpc1NldHRpbmdTdGF0ZSA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiAhaXNTZXR0aW5nU3RhdGUgJiYgYXNzZXJ0KCB0aGlzLnBoYXNlQ2FsbGJhY2tTZXRzLnNpemUgPT09IDAsICdQaGFzZUNhbGxiYWNrcyBzaG91bGQgaGF2ZSBhbGwgYmVlbiBhcHBsaWVkJyApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzdGF0aWMgdmFsaWRhdGVJbnN0cnVtZW50ZWRQcm9wZXJ0eSggcHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgVGFuZGVtLlZBTElEQVRJT04gJiYgYXNzZXJ0KCBwcm9wZXJ0eSBpbnN0YW5jZW9mIFJlYWRPbmx5UHJvcGVydHkgJiYgcHJvcGVydHkuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSwgYG11c3QgYmUgYW4gaW5zdHJ1bWVudGVkIFByb3BlcnR5OiAke3Byb3BlcnR5fWAgKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgdmFsaWRhdGVQcm9wZXJ0eVBoYXNlUGFpciggcHJvcGVydHk6IFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4sIHBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UgKTogdm9pZCB7XHJcbiAgICBQcm9wZXJ0eVN0YXRlSGFuZGxlci52YWxpZGF0ZUluc3RydW1lbnRlZFByb3BlcnR5KCBwcm9wZXJ0eSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBNYXBQYWlyIGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvdmVkIFByb3BlcnR5U3RhdGVQaGFzZXNcclxuICAgKi9cclxuICBwcml2YXRlIGdldE1hcFBhaXJGcm9tUGhhc2VzKCBiZWZvcmVQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBhZnRlclBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UgKTogT3JkZXJEZXBlbmRlbmN5TWFwUGFpciB7XHJcbiAgICBjb25zdCBtYXRjaGVkUGFpcnMgPSB0aGlzLm1hcFBhaXJzLmZpbHRlciggbWFwUGFpciA9PiBiZWZvcmVQaGFzZSA9PT0gbWFwUGFpci5iZWZvcmVQaGFzZSAmJiBhZnRlclBoYXNlID09PSBtYXBQYWlyLmFmdGVyUGhhc2UgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG1hdGNoZWRQYWlycy5sZW5ndGggPT09IDEsICdvbmUgYW5kIG9ubHkgb25lIG1hcCBzaG91bGQgbWF0Y2ggdGhlIHByb3ZpZGVkIHBoYXNlcycgKTtcclxuICAgIHJldHVybiBtYXRjaGVkUGFpcnNbIDAgXTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlZ2lzdGVyIHRoYXQgb25lIFByb3BlcnR5IG11c3QgaGF2ZSBhIFwiUGhhc2VcIiBhcHBsaWVkIGZvciBQaEVULWlPIHN0YXRlIGJlZm9yZSBhbm90aGVyIFByb3BlcnR5J3MgUGhhc2UuIEEgUGhhc2VcclxuICAgKiBpcyBhbiBlbmRpbmcgc3RhdGUgaW4gUGhFVC1pTyBzdGF0ZSBzZXQgd2hlcmUgUHJvcGVydHkgdmFsdWVzIHNvbGlkaWZ5LCBub3RpZmljYXRpb25zIGZvciB2YWx1ZSBjaGFuZ2VzIGFyZSBjYWxsZWQuXHJcbiAgICogVGhlIFBoRVQtaU8gc3RhdGUgZW5naW5lIHdpbGwgYWx3YXlzIHVuZGVmZXIgYSBQcm9wZXJ0eSBiZWZvcmUgaXQgbm90aWZpZXMgaXRzIGxpc3RlbmVycy4gVGhpcyBpcyBmb3IgcmVnaXN0ZXJpbmdcclxuICAgKiB0d28gZGlmZmVyZW50IFByb3BlcnRpZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYmVmb3JlUHJvcGVydHkgLSB0aGUgUHJvcGVydHkgdGhhdCBuZWVkcyB0byBiZSBzZXQgYmVmb3JlIHRoZSBzZWNvbmQ7IG11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPXHJcbiAgICogQHBhcmFtIGJlZm9yZVBoYXNlXHJcbiAgICogQHBhcmFtIGFmdGVyUHJvcGVydHkgLSBtdXN0IGJlIGluc3RydW1lbnRlZCBmb3IgUGhFVC1pT1xyXG4gICAqIEBwYXJhbSBhZnRlclBoYXNlXHJcbiAgICovXHJcbiAgcHVibGljIHJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5KCBiZWZvcmVQcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTxJbnRlbnRpb25hbEFueT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBhZnRlclByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFmdGVyUGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZSApOiB2b2lkIHtcclxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcclxuXHJcbiAgICAgIHRoaXMudmFsaWRhdGVQcm9wZXJ0eVBoYXNlUGFpciggYmVmb3JlUHJvcGVydHksIGJlZm9yZVBoYXNlICk7XHJcbiAgICAgIHRoaXMudmFsaWRhdGVQcm9wZXJ0eVBoYXNlUGFpciggYWZ0ZXJQcm9wZXJ0eSwgYWZ0ZXJQaGFzZSApO1xyXG4gICAgICBhc3NlcnQgJiYgYmVmb3JlUHJvcGVydHkgPT09IGFmdGVyUHJvcGVydHkgJiYgYXNzZXJ0KCBiZWZvcmVQaGFzZSAhPT0gYWZ0ZXJQaGFzZSwgJ2Nhbm5vdCBzZXQgc2FtZSBQcm9wZXJ0eSB0byBzYW1lIHBoYXNlJyApO1xyXG5cclxuICAgICAgY29uc3QgbWFwUGFpciA9IHRoaXMuZ2V0TWFwUGFpckZyb21QaGFzZXMoIGJlZm9yZVBoYXNlLCBhZnRlclBoYXNlICk7XHJcblxyXG4gICAgICBtYXBQYWlyLmFkZE9yZGVyRGVwZW5kZW5jeSggYmVmb3JlUHJvcGVydHkudGFuZGVtLnBoZXRpb0lELCBhZnRlclByb3BlcnR5LnRhbmRlbS5waGV0aW9JRCApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICoge1Byb3BlcnR5fSBwcm9wZXJ0eSAtIG11c3QgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPXHJcbiAgICoge2Jvb2xlYW59IC0gdHJ1ZSBpZiBQcm9wZXJ0eSBpcyBpbiBhbnkgb3JkZXIgZGVwZW5kZW5jeVxyXG4gICAqL1xyXG4gIHByaXZhdGUgcHJvcGVydHlJbkFuT3JkZXJEZXBlbmRlbmN5KCBwcm9wZXJ0eTogUmVhZE9ubHlQcm9wZXJ0eTx1bmtub3duPiApOiBib29sZWFuIHtcclxuICAgIFByb3BlcnR5U3RhdGVIYW5kbGVyLnZhbGlkYXRlSW5zdHJ1bWVudGVkUHJvcGVydHkoIHByb3BlcnR5ICk7XHJcbiAgICByZXR1cm4gXy5zb21lKCB0aGlzLm1hcFBhaXJzLCBtYXBQYWlyID0+IG1hcFBhaXIudXNlc1BoZXRpb0lEKCBwcm9wZXJ0eS50YW5kZW0ucGhldGlvSUQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5yZWdpc3RlcnMgYWxsIG9yZGVyIGRlcGVuZGVuY2llcyBmb3IgdGhlIGdpdmVuIFByb3BlcnR5XHJcbiAgICoge1JlYWRPbmx5UHJvcGVydHl9IHByb3BlcnR5IC0gbXVzdCBiZSBpbnN0cnVtZW50ZWQgZm9yIFBoRVQtaU9cclxuICAgKi9cclxuICBwdWJsaWMgdW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkoIHByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PEludGVudGlvbmFsQW55PiApOiB2b2lkIHtcclxuICAgIGlmICggVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCApIHtcclxuICAgICAgUHJvcGVydHlTdGF0ZUhhbmRsZXIudmFsaWRhdGVJbnN0cnVtZW50ZWRQcm9wZXJ0eSggcHJvcGVydHkgKTtcclxuXHJcbiAgICAgIC8vIEJlIGdyYWNlZnVsIGlmIGdpdmVuIGEgUHJvcGVydHkgdGhhdCBpcyBub3QgcmVnaXN0ZXJlZCBpbiBhbiBvcmRlciBkZXBlbmRlbmN5LlxyXG4gICAgICBpZiAoIHRoaXMucHJvcGVydHlJbkFuT3JkZXJEZXBlbmRlbmN5KCBwcm9wZXJ0eSApICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMucHJvcGVydHlJbkFuT3JkZXJEZXBlbmRlbmN5KCBwcm9wZXJ0eSApLCAnUHJvcGVydHkgbXVzdCBiZSByZWdpc3RlcmVkIGluIGFuIG9yZGVyIGRlcGVuZGVuY3kgdG8gYmUgdW5yZWdpc3RlcmVkJyApO1xyXG5cclxuICAgICAgICB0aGlzLm1hcFBhaXJzLmZvckVhY2goIG1hcFBhaXIgPT4gbWFwUGFpci51bnJlZ2lzdGVyT3JkZXJEZXBlbmRlbmNpZXNGb3JQcm9wZXJ0eSggcHJvcGVydHkgKSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiByZWdpc3RlcmVkIFByb3BlcnR5IFBoYXNlIG9yZGVyIGRlcGVuZGVuY2llcywgdW5kZWZlciBhbGwgQVhPTi9Qcm9wZXJ0eSBQaEVULWlPIGVsZW1lbnRzIHRvIHRha2UgdGhlaXJcclxuICAgKiBjb3JyZWN0IHZhbHVlcyBhbmQgaGF2ZSBlYWNoIG5vdGlmeSB0aGVpciBsaXN0ZW5lcnMuXHJcbiAgICoge1NldC48c3RyaW5nPn0gcGhldGlvSURzSW5TdGF0ZSAtIHNldCBvZiBwaGV0aW9JRHMgdGhhdCB3ZXJlIHNldCBpbiBzdGF0ZVxyXG4gICAqL1xyXG4gIHByaXZhdGUgdW5kZWZlckFuZE5vdGlmeVByb3BlcnRpZXMoIHBoZXRpb0lEc0luU3RhdGU6IFNldDxzdHJpbmc+ICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5pbml0aWFsaXplZCwgJ211c3QgYmUgaW5pdGlhbGl6ZWQgYmVmb3JlIGdldHRpbmcgY2FsbGVkJyApO1xyXG5cclxuICAgIC8vIHtPYmplY3QuPHN0cmluZyxib29sZWFuPn0gLSB0cnVlIGlmIGEgcGhldGlvSUQgKyBwaGFzZSBwYWlyIGhhcyBiZWVuIGFwcGxpZWQsIGtleXMgYXJlIHRoZSBjb21iaW5hdGlvbiBvZlxyXG4gICAgLy8gcGhldGlvSURzIGFuZCBwaGFzZSwgc2VlIFBoYXNlQ2FsbGJhY2suZ2V0VGVybSgpXHJcbiAgICBjb25zdCBjb21wbGV0ZWRQaGFzZXMgPSB7fTtcclxuXHJcbiAgICAvLyB0byBzdXBwb3J0IGZhaWxpbmcgb3V0IGluc3RlYWQgb2YgaW5maW5pdGUgbG9vcFxyXG4gICAgbGV0IG51bWJlck9mSXRlcmF0aW9ucyA9IDA7XHJcblxyXG4gICAgLy8gTm9ybWFsbHkgd2Ugd291bGQgbGlrZSB0byB1bmRlZmVyIHRoaW5ncyBiZWZvcmUgbm90aWZ5LCBidXQgbWFrZSBzdXJlIHRoaXMgaXMgZG9uZSBpbiBhY2NvcmRhbmNlIHdpdGggdGhlIG9yZGVyIGRlcGVuZGVuY2llcy5cclxuICAgIHdoaWxlICggdGhpcy5waGFzZUNhbGxiYWNrU2V0cy5zaXplID4gMCApIHtcclxuICAgICAgbnVtYmVyT2ZJdGVyYXRpb25zKys7XHJcblxyXG4gICAgICAvLyBFcnJvciBjYXNlIGxvZ2dpbmdcclxuICAgICAgaWYgKCBudW1iZXJPZkl0ZXJhdGlvbnMgPiA1MDAwICkge1xyXG4gICAgICAgIHRoaXMuZXJyb3JJblVuZGVmZXJBbmROb3RpZnlTdGVwKCBjb21wbGV0ZWRQaGFzZXMgKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVHJ5IHRvIHVuZGVmZXIgYXMgbXVjaCBhcyBwb3NzaWJsZSBiZWZvcmUgbm90aWZ5aW5nXHJcbiAgICAgIHRoaXMuYXR0ZW1wdFRvQXBwbHlQaGFzZXMoIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLCBjb21wbGV0ZWRQaGFzZXMsIHBoZXRpb0lEc0luU3RhdGUgKTtcclxuICAgICAgdGhpcy5hdHRlbXB0VG9BcHBseVBoYXNlcyggUHJvcGVydHlTdGF0ZVBoYXNlLk5PVElGWSwgY29tcGxldGVkUGhhc2VzLCBwaGV0aW9JRHNJblN0YXRlICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgcHJpdmF0ZSBlcnJvckluVW5kZWZlckFuZE5vdGlmeVN0ZXAoIGNvbXBsZXRlZFBoYXNlczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gY29tYmluZSBwaGV0aW9JRCBhbmQgUGhhc2UgaW50byBhIHNpbmdsZSBzdHJpbmcgdG8ga2VlcCB0aGlzIHByb2Nlc3Mgc3BlY2lmaWMuXHJcbiAgICBjb25zdCBzdGlsbFRvRG9JRFBoYXNlUGFpcnM6IEFycmF5PHN0cmluZz4gPSBbXTtcclxuICAgIHRoaXMucGhhc2VDYWxsYmFja1NldHMuZm9yRWFjaCggcGhhc2VDYWxsYmFjayA9PiBzdGlsbFRvRG9JRFBoYXNlUGFpcnMucHVzaCggcGhhc2VDYWxsYmFjay5nZXRUZXJtKCkgKSApO1xyXG5cclxuICAgIGNvbnN0IHJlbGV2YW50T3JkZXJEZXBlbmRlbmNpZXM6IEFycmF5PE9yZGVyRGVwZW5kZW5jeT4gPSBbXTtcclxuXHJcbiAgICB0aGlzLm1hcFBhaXJzLmZvckVhY2goIG1hcFBhaXIgPT4ge1xyXG4gICAgICBjb25zdCBiZWZvcmVNYXAgPSBtYXBQYWlyLmJlZm9yZU1hcDtcclxuICAgICAgZm9yICggY29uc3QgWyBiZWZvcmVQaGV0aW9JRCwgYWZ0ZXJQaGV0aW9JRHMgXSBvZiBiZWZvcmVNYXAgKSB7XHJcbiAgICAgICAgYWZ0ZXJQaGV0aW9JRHMuZm9yRWFjaCggYWZ0ZXJQaGV0aW9JRCA9PiB7XHJcbiAgICAgICAgICBjb25zdCBiZWZvcmVUZXJtID0gYmVmb3JlUGhldGlvSUQgKyBiZWZvcmVNYXAuYmVmb3JlUGhhc2U7XHJcbiAgICAgICAgICBjb25zdCBhZnRlclRlcm0gPSBhZnRlclBoZXRpb0lEICsgYmVmb3JlTWFwLmFmdGVyUGhhc2U7XHJcbiAgICAgICAgICBpZiAoIHN0aWxsVG9Eb0lEUGhhc2VQYWlycy5pbmNsdWRlcyggYmVmb3JlVGVybSApIHx8IHN0aWxsVG9Eb0lEUGhhc2VQYWlycy5pbmNsdWRlcyggYWZ0ZXJUZXJtICkgKSB7XHJcbiAgICAgICAgICAgIHJlbGV2YW50T3JkZXJEZXBlbmRlbmNpZXMucHVzaCgge1xyXG4gICAgICAgICAgICAgIGJlZm9yZVRlcm06IGJlZm9yZVRlcm0sXHJcbiAgICAgICAgICAgICAgYWZ0ZXJUZXJtOiBhZnRlclRlcm1cclxuICAgICAgICAgICAgfSApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGxldCBzdHJpbmcgPSAnJztcclxuICAgIGNvbnNvbGUubG9nKCAnc3RpbGwgdG8gYmUgdW5kZWZlcnJlZCcsIHRoaXMucGhhc2VDYWxsYmFja1NldHMudW5kZWZlclNldCApO1xyXG4gICAgY29uc29sZS5sb2coICdzdGlsbCB0byBiZSBub3RpZmllZCcsIHRoaXMucGhhc2VDYWxsYmFja1NldHMubm90aWZ5U2V0ICk7XHJcbiAgICBjb25zb2xlLmxvZyggJ29yZGVyIGRlcGVuZGVuY2llcyB0aGF0IGFwcGx5IHRvIHRoZSBzdGlsbCB0b2RvcycsIHJlbGV2YW50T3JkZXJEZXBlbmRlbmNpZXMgKTtcclxuICAgIHJlbGV2YW50T3JkZXJEZXBlbmRlbmNpZXMuZm9yRWFjaCggb3JkZXJEZXBlbmRlbmN5ID0+IHtcclxuICAgICAgc3RyaW5nICs9IGAke29yZGVyRGVwZW5kZW5jeS5iZWZvcmVUZXJtfVxcdCR7b3JkZXJEZXBlbmRlbmN5LmFmdGVyVGVybX1cXG5gO1xyXG4gICAgfSApO1xyXG4gICAgY29uc29sZS5sb2coICdcXG5cXG5pbiBncmFwaGFibGUgZm9ybTpcXG5cXG4nLCBzdHJpbmcgKTtcclxuXHJcbiAgICBjb25zdCBhc3NlcnRNZXNzYWdlID0gJ0ltcG9zc2libGUgc2V0IHN0YXRlOiBmcm9tIHVuZGVmZXJBbmROb3RpZnlQcm9wZXJ0aWVzOyBvcmRlcmluZyBjb25zdHJhaW50cyBjYW5ub3QgYmUgc2F0aXNmaWVkJztcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCBhc3NlcnRNZXNzYWdlICk7XHJcblxyXG4gICAgLy8gV2UgbXVzdCBleGl0IGhlcmUgZXZlbiBpZiBhc3NlcnRpb25zIGFyZSBkaXNhYmxlZCBzbyBpdCB3b3VsZG4ndCBsb2NrIHVwIHRoZSBicm93c2VyLlxyXG4gICAgaWYgKCAhYXNzZXJ0ICkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoIGFzc2VydE1lc3NhZ2UgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9ubHkgZm9yIFRlc3RpbmchXHJcbiAgICogR2V0IHRoZSBudW1iZXIgb2Ygb3JkZXIgZGVwZW5kZW5jaWVzIHJlZ2lzdGVyZWQgaW4gdGhpcyBjbGFzc1xyXG4gICAqXHJcbiAgICovXHJcbiAgcHVibGljIGdldE51bWJlck9mT3JkZXJEZXBlbmRlbmNpZXMoKTogbnVtYmVyIHtcclxuICAgIGxldCBjb3VudCA9IDA7XHJcbiAgICB0aGlzLm1hcFBhaXJzLmZvckVhY2goIG1hcFBhaXIgPT4ge1xyXG4gICAgICBtYXBQYWlyLmFmdGVyTWFwLmZvckVhY2goIHZhbHVlU2V0ID0+IHsgY291bnQgKz0gdmFsdWVTZXQuc2l6ZTsgfSApO1xyXG4gICAgfSApO1xyXG4gICAgcmV0dXJuIGNvdW50O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR28gdGhyb3VnaCBhbGwgcGhhc2VzIHN0aWxsIHRvIGJlIGFwcGxpZWQsIGFuZCBhcHBseSB0aGVtIGlmIHRoZSBvcmRlciBkZXBlbmRlbmNpZXMgYWxsb3cgaXQuIE9ubHkgYXBwbHkgZm9yIHRoZVxyXG4gICAqIHBhcnRpY3VsYXIgcGhhc2UgcHJvdmlkZWQuIEluIGdlbmVyYWwgVU5ERUZFUiBtdXN0IG9jY3VyIGJlZm9yZSB0aGUgc2FtZSBwaGV0aW9JRCBnZXRzIE5PVElGWS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwaGFzZSAtIG9ubHkgYXBwbHkgUGhhc2VDYWxsYmFja3MgZm9yIHRoaXMgcGFydGljdWxhciBQcm9wZXJ0eVN0YXRlUGhhc2VcclxuICAgKiBAcGFyYW0gY29tcGxldGVkUGhhc2VzIC0gbWFwIHRoYXQga2VlcHMgdHJhY2sgb2YgY29tcGxldGVkIHBoYXNlc1xyXG4gICAqIEBwYXJhbSBwaGV0aW9JRHNJblN0YXRlIC0gc2V0IG9mIHBoZXRpb0lEcyB0aGF0IHdlcmUgc2V0IGluIHN0YXRlXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBhdHRlbXB0VG9BcHBseVBoYXNlcyggcGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZSwgY29tcGxldGVkUGhhc2VzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiwgcGhldGlvSURzSW5TdGF0ZTogU2V0PHN0cmluZz4gKTogdm9pZCB7XHJcblxyXG4gICAgY29uc3QgcGhhc2VDYWxsYmFja1NldCA9IHRoaXMucGhhc2VDYWxsYmFja1NldHMuZ2V0U2V0RnJvbVBoYXNlKCBwaGFzZSApO1xyXG5cclxuICAgIGZvciAoIGNvbnN0IHBoYXNlQ2FsbGJhY2tUb1BvdGVudGlhbGx5QXBwbHkgb2YgcGhhc2VDYWxsYmFja1NldCApIHtcclxuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHBoYXNlQ2FsbGJhY2tUb1BvdGVudGlhbGx5QXBwbHkucGhhc2UgPT09IHBoYXNlLCAncGhhc2VDYWxsYmFja1NldCBzaG91bGQgb25seSBpbmNsdWRlIGNhbGxiYWNrcyBmb3IgcHJvdmlkZWQgcGhhc2UnICk7XHJcblxyXG4gICAgICAvLyBvbmx5IHRyeSB0byBjaGVjayB0aGUgb3JkZXIgZGVwZW5kZW5jaWVzIHRvIHNlZSBpZiB0aGlzIGhhcyB0byBiZSBhZnRlciBzb21ldGhpbmcgdGhhdCBpcyBpbmNvbXBsZXRlLlxyXG4gICAgICBpZiAoIHRoaXMucGhldGlvSURDYW5BcHBseVBoYXNlKCBwaGFzZUNhbGxiYWNrVG9Qb3RlbnRpYWxseUFwcGx5LnBoZXRpb0lELCBwaGFzZSwgY29tcGxldGVkUGhhc2VzLCBwaGV0aW9JRHNJblN0YXRlICkgKSB7XHJcblxyXG4gICAgICAgIC8vIEZpcmUgdGhlIGxpc3RlbmVyO1xyXG4gICAgICAgIHBoYXNlQ2FsbGJhY2tUb1BvdGVudGlhbGx5QXBwbHkubGlzdGVuZXIoKTtcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGl0IGZyb20gdGhlIG1hc3RlciBsaXN0IHNvIHRoYXQgaXQgZG9lc24ndCBnZXQgY2FsbGVkIGFnYWluLlxyXG4gICAgICAgIHBoYXNlQ2FsbGJhY2tTZXQuZGVsZXRlKCBwaGFzZUNhbGxiYWNrVG9Qb3RlbnRpYWxseUFwcGx5ICk7XHJcblxyXG4gICAgICAgIC8vIEtlZXAgdHJhY2sgb2YgYWxsIGNvbXBsZXRlZCBQaGFzZUNhbGxiYWNrc1xyXG4gICAgICAgIGNvbXBsZXRlZFBoYXNlc1sgcGhhc2VDYWxsYmFja1RvUG90ZW50aWFsbHlBcHBseS5nZXRUZXJtKCkgXSA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBwaGV0aW9JRCAtIHRoaW5rIG9mIHRoaXMgYXMgdGhlIFwiYWZ0ZXJQaGV0aW9JRFwiIHNpbmNlIHRoZXJlIG1heSBiZSBzb21lIHBoYXNlcyB0aGF0IG5lZWQgdG8gYmUgYXBwbGllZCBiZWZvcmUgaXQgaGFzIHRoaXMgcGhhc2UgZG9uZS5cclxuICAgKiBAcGFyYW0gcGhhc2VcclxuICAgKiBAcGFyYW0gY29tcGxldGVkUGhhc2VzIC0gbWFwIHRoYXQga2VlcHMgdHJhY2sgb2YgY29tcGxldGVkIHBoYXNlc1xyXG4gICAqIEBwYXJhbSBwaGV0aW9JRHNJblN0YXRlIC0gc2V0IG9mIHBoZXRpb0lEcyB0aGF0IHdlcmUgc2V0IGluIHN0YXRlXHJcbiAgICogQHBhcmFtIC0gaWYgdGhlIHByb3ZpZGVkIHBoYXNlIGNhbiBiZSBhcHBsaWVkIGdpdmVuIHRoZSBkZXBlbmRlbmN5IG9yZGVyIGRlcGVuZGVuY2llcyBvZiB0aGUgc3RhdGUgZW5naW5lLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgcGhldGlvSURDYW5BcHBseVBoYXNlKCBwaGV0aW9JRDogc3RyaW5nLCBwaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBjb21wbGV0ZWRQaGFzZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LCBwaGV0aW9JRHNJblN0YXRlOiBTZXQ8c3RyaW5nPiApOiBib29sZWFuIHtcclxuXHJcbiAgICAvLyBVbmRlZmVyIG11c3QgaGFwcGVuIGJlZm9yZSBub3RpZnlcclxuICAgIGlmICggcGhhc2UgPT09IFByb3BlcnR5U3RhdGVQaGFzZS5OT1RJRlkgJiYgIWNvbXBsZXRlZFBoYXNlc1sgcGhldGlvSUQgKyBQcm9wZXJ0eVN0YXRlUGhhc2UuVU5ERUZFUiBdICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IGEgbGlzdCBvZiB0aGUgbWFwcyBmb3IgdGhpcyBwaGFzZSBiZWluZyBhcHBsaWVzLlxyXG4gICAgY29uc3QgbWFwc1RvQ2hlY2s6IEFycmF5PFBoYXNlTWFwPiA9IFtdO1xyXG4gICAgdGhpcy5tYXBQYWlycy5mb3JFYWNoKCBtYXBQYWlyID0+IHtcclxuICAgICAgaWYgKCBtYXBQYWlyLmFmdGVyUGhhc2UgPT09IHBoYXNlICkge1xyXG5cclxuICAgICAgICAvLyBVc2UgdGhlIFwiYWZ0ZXJNYXBcIiBiZWNhdXNlIGJlbG93IGxvb2tzIHVwIHdoYXQgbmVlZHMgdG8gY29tZSBiZWZvcmUuXHJcbiAgICAgICAgbWFwc1RvQ2hlY2sucHVzaCggbWFwUGFpci5hZnRlck1hcCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTygyKVxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbWFwc1RvQ2hlY2subGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IG1hcFRvQ2hlY2sgPSBtYXBzVG9DaGVja1sgaSBdO1xyXG4gICAgICBpZiAoICFtYXBUb0NoZWNrLmhhcyggcGhldGlvSUQgKSApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBzZXRPZlRoaW5nc1RoYXRTaG91bGRDb21lRmlyc3QgPSBtYXBUb0NoZWNrLmdldCggcGhldGlvSUQgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2V0T2ZUaGluZ3NUaGF0U2hvdWxkQ29tZUZpcnN0LCAnbXVzdCBoYXZlIHRoaXMgc2V0JyApO1xyXG5cclxuICAgICAgLy8gTyhLKSB3aGVyZSBLIGlzIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhhdCBzaG91bGQgY29tZSBiZWZvcmUgUHJvcGVydHkgWFxyXG4gICAgICBmb3IgKCBjb25zdCBiZWZvcmVQaGV0aW9JRCBvZiBzZXRPZlRoaW5nc1RoYXRTaG91bGRDb21lRmlyc3QhICkge1xyXG5cclxuICAgICAgICAvLyBjaGVjayBpZiB0aGUgYmVmb3JlIHBoYXNlIGZvciB0aGlzIG9yZGVyIGRlcGVuZGVuY3kgaGFzIGFscmVhZHkgYmVlbiBjb21wbGV0ZWRcclxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBvbmx5IGNhcmUgYWJvdXQgZWxlbWVudHMgdGhhdCB3ZXJlIGFjdHVhbGx5IHNldCBkdXJpbmcgdGhpcyBzdGF0ZSBzZXRcclxuICAgICAgICBpZiAoICFjb21wbGV0ZWRQaGFzZXNbIGJlZm9yZVBoZXRpb0lEICsgbWFwVG9DaGVjay5iZWZvcmVQaGFzZSBdICYmXHJcbiAgICAgICAgICAgICBwaGV0aW9JRHNJblN0YXRlLmhhcyggYmVmb3JlUGhldGlvSUQgKSAmJiBwaGV0aW9JRHNJblN0YXRlLmhhcyggcGhldGlvSUQgKSApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUE9KU08gZm9yIGEgY2FsbGJhY2sgZm9yIGEgc3BlY2lmaWMgUGhhc2UgaW4gYSBQcm9wZXJ0eSdzIHN0YXRlIHNldCBsaWZlY3ljbGUuIFNlZSB1bmRlZmVyQW5kTm90aWZ5UHJvcGVydGllcygpXHJcbmNsYXNzIFBoYXNlQ2FsbGJhY2sge1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcclxuICAgIHB1YmxpYyByZWFkb25seSBwaGV0aW9JRDogc3RyaW5nLFxyXG4gICAgcHVibGljIHJlYWRvbmx5IHBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UsXHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGlzdGVuZXI6ICggKCkgPT4gdm9pZCApID0gXy5ub29wICkge1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICoge3N0cmluZ30gLSB1bmlxdWUgdGVybSBmb3IgdGhlIGlkL3BoYXNlIHBhaXJcclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VGVybSgpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMucGhldGlvSUQgKyB0aGlzLnBoYXNlO1xyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgT3JkZXJEZXBlbmRlbmN5TWFwUGFpciB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBiZWZvcmVNYXA6IFBoYXNlTWFwO1xyXG4gIHB1YmxpYyByZWFkb25seSBhZnRlck1hcDogUGhhc2VNYXA7XHJcbiAgcHVibGljIHJlYWRvbmx5IGJlZm9yZVBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2U7XHJcbiAgcHVibGljIHJlYWRvbmx5IGFmdGVyUGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBiZWZvcmVQaGFzZTogUHJvcGVydHlTdGF0ZVBoYXNlLCBhZnRlclBoYXNlOiBQcm9wZXJ0eVN0YXRlUGhhc2UgKSB7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciwgaXQgaXMgZWFzaWVzdCB0byBmdWRnZSBoZXJlIHNpbmNlIHdlIGFyZSBhZGRpbmcgdGhlIFBoYXNlTWFwIHByb3BlcnRpZXMganVzdCBiZWxvdyBoZXJlLlxyXG4gICAgdGhpcy5iZWZvcmVNYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB0aGlzLmJlZm9yZU1hcC5iZWZvcmVQaGFzZSA9IGJlZm9yZVBoYXNlO1xyXG4gICAgdGhpcy5iZWZvcmVNYXAuYWZ0ZXJQaGFzZSA9IGFmdGVyUGhhc2U7XHJcblxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciwgaXQgaXMgZWFzaWVzdCB0byBmdWRnZSBoZXJlIHNpbmNlIHdlIGFyZSBhZGRpbmcgdGhlIFBoYXNlTWFwIHByb3BlcnRpZXMganVzdCBiZWxvdyBoZXJlLlxyXG4gICAgdGhpcy5hZnRlck1hcCA9IG5ldyBNYXAoKTtcclxuICAgIHRoaXMuYWZ0ZXJNYXAuYmVmb3JlUGhhc2UgPSBiZWZvcmVQaGFzZTtcclxuICAgIHRoaXMuYWZ0ZXJNYXAuYWZ0ZXJQaGFzZSA9IGFmdGVyUGhhc2U7XHJcblxyXG4gICAgdGhpcy5iZWZvcmVNYXAub3RoZXJNYXAgPSB0aGlzLmFmdGVyTWFwO1xyXG4gICAgdGhpcy5hZnRlck1hcC5vdGhlck1hcCA9IHRoaXMuYmVmb3JlTWFwO1xyXG5cclxuICAgIHRoaXMuYmVmb3JlUGhhc2UgPSBiZWZvcmVQaGFzZTtcclxuICAgIHRoaXMuYWZ0ZXJQaGFzZSA9IGFmdGVyUGhhc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWdpc3RlciBhbiBvcmRlciBkZXBlbmRlbmN5IGJldHdlZW4gdHdvIHBoZXRpb0lEcy4gVGhpcyB3aWxsIGFkZCBkYXRhIHRvIG1hcHMgaW4gXCJib3RoIGRpcmVjdGlvblwiLiBJZiBhY2Nlc3NpbmdcclxuICAgKiB3aXRoIGp1c3QgdGhlIGJlZm9yZVBoZXRpb0lELCBvciB3aXRoIHRoZSBhZnRlclBoZXRpb0lELlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRPcmRlckRlcGVuZGVuY3koIGJlZm9yZVBoZXRpb0lEOiBzdHJpbmcsIGFmdGVyUGhldGlvSUQ6IHN0cmluZyApOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMuYmVmb3JlTWFwLmhhcyggYmVmb3JlUGhldGlvSUQgKSApIHtcclxuICAgICAgdGhpcy5iZWZvcmVNYXAuc2V0KCBiZWZvcmVQaGV0aW9JRCwgbmV3IFNldDxzdHJpbmc+KCkgKTtcclxuICAgIH1cclxuICAgIHRoaXMuYmVmb3JlTWFwLmdldCggYmVmb3JlUGhldGlvSUQgKSEuYWRkKCBhZnRlclBoZXRpb0lEICk7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5hZnRlck1hcC5oYXMoIGFmdGVyUGhldGlvSUQgKSApIHtcclxuICAgICAgdGhpcy5hZnRlck1hcC5zZXQoIGFmdGVyUGhldGlvSUQsIG5ldyBTZXQoKSApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hZnRlck1hcC5nZXQoIGFmdGVyUGhldGlvSUQgKSEuYWRkKCBiZWZvcmVQaGV0aW9JRCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVW5yZWdpc3RlciBhbGwgb3JkZXIgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHJvdmlkZWQgUHJvcGVydHlcclxuICAgKi9cclxuICBwdWJsaWMgdW5yZWdpc3Rlck9yZGVyRGVwZW5kZW5jaWVzRm9yUHJvcGVydHkoIHByb3BlcnR5OiBSZWFkT25seVByb3BlcnR5PHVua25vd24+ICk6IHZvaWQge1xyXG4gICAgY29uc3QgcGhldGlvSURUb1JlbW92ZSA9IHByb3BlcnR5LnRhbmRlbS5waGV0aW9JRDtcclxuXHJcbiAgICBbIHRoaXMuYmVmb3JlTWFwLCB0aGlzLmFmdGVyTWFwIF0uZm9yRWFjaCggbWFwID0+IHtcclxuICAgICAgbWFwLmhhcyggcGhldGlvSURUb1JlbW92ZSApICYmIG1hcC5nZXQoIHBoZXRpb0lEVG9SZW1vdmUgKSEuZm9yRWFjaCggcGhldGlvSUQgPT4ge1xyXG4gICAgICAgIGNvbnN0IHNldE9mQWZ0ZXJNYXBJRHMgPSBtYXAub3RoZXJNYXAuZ2V0KCBwaGV0aW9JRCApO1xyXG4gICAgICAgIHNldE9mQWZ0ZXJNYXBJRHMgJiYgc2V0T2ZBZnRlck1hcElEcy5kZWxldGUoIHBoZXRpb0lEVG9SZW1vdmUgKTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYXIgb3V0IGVtcHR5IGVudHJpZXMgdG8gYXZvaWQgaGF2aW5nIGxvdHMgb2YgZW1wdHkgU2V0cyBzaXR0aW5nIGFyb3VuZFxyXG4gICAgICAgIHNldE9mQWZ0ZXJNYXBJRHMhLnNpemUgPT09IDAgJiYgbWFwLm90aGVyTWFwLmRlbGV0ZSggcGhldGlvSUQgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBtYXAuZGVsZXRlKCBwaGV0aW9JRFRvUmVtb3ZlICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gTG9vayB0aHJvdWdoIGV2ZXJ5IGRlcGVuZGVuY3kgYW5kIG1ha2Ugc3VyZSB0aGUgcGhldGlvSUQgdG8gcmVtb3ZlIGhhcyBiZWVuIGNvbXBsZXRlbHkgcmVtb3ZlZC5cclxuICAgIGFzc2VydFNsb3cgJiYgWyB0aGlzLmJlZm9yZU1hcCwgdGhpcy5hZnRlck1hcCBdLmZvckVhY2goIG1hcCA9PiB7XHJcbiAgICAgIG1hcC5mb3JFYWNoKCAoIHZhbHVlUGhldGlvSURzLCBrZXkgKSA9PiB7XHJcbiAgICAgICAgYXNzZXJ0U2xvdyAmJiBhc3NlcnRTbG93KCBrZXkgIT09IHBoZXRpb0lEVG9SZW1vdmUsICdzaG91bGQgbm90IGJlIGEga2V5JyApO1xyXG4gICAgICAgIGFzc2VydFNsb3cgJiYgYXNzZXJ0U2xvdyggIXZhbHVlUGhldGlvSURzLmhhcyggcGhldGlvSURUb1JlbW92ZSApLCAnc2hvdWxkIG5vdCBiZSBpbiBhIHZhbHVlIGxpc3QnICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1c2VzUGhldGlvSUQoIHBoZXRpb0lEOiBzdHJpbmcgKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5iZWZvcmVNYXAuaGFzKCBwaGV0aW9JRCApIHx8IHRoaXMuYWZ0ZXJNYXAuaGFzKCBwaGV0aW9JRCApO1xyXG4gIH1cclxufVxyXG5cclxuLy8gUE9KU08gdG8ga2VlcCB0cmFjayBvZiBQaGFzZUNhbGxiYWNrcyB3aGlsZSBwcm92aWRpbmcgTygxKSBsb29rdXAgdGltZSBiZWNhdXNlIGl0IGlzIGJ1aWx0IG9uIFNldFxyXG5jbGFzcyBQaGFzZUNhbGxiYWNrU2V0cyB7XHJcbiAgcHVibGljIHJlYWRvbmx5IHVuZGVmZXJTZXQgPSBuZXcgU2V0PFBoYXNlQ2FsbGJhY2s+KCk7XHJcbiAgcHVibGljIHJlYWRvbmx5IG5vdGlmeVNldCA9IG5ldyBTZXQ8UGhhc2VDYWxsYmFjaz4oKTtcclxuXHJcbiAgcHVibGljIGdldCBzaXplKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy51bmRlZmVyU2V0LnNpemUgKyB0aGlzLm5vdGlmeVNldC5zaXplO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZvckVhY2goIGNhbGxiYWNrOiAoIHBoYXNlQ2FsbGJhY2s6IFBoYXNlQ2FsbGJhY2sgKSA9PiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnVuZGVmZXJTZXQuZm9yRWFjaCggY2FsbGJhY2sgKTtcclxuICAgIHRoaXMubm90aWZ5U2V0LmZvckVhY2goIGNhbGxiYWNrICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkVW5kZWZlclBoYXNlQ2FsbGJhY2soIHBoYXNlQ2FsbGJhY2s6IFBoYXNlQ2FsbGJhY2sgKTogdm9pZCB7XHJcbiAgICB0aGlzLnVuZGVmZXJTZXQuYWRkKCBwaGFzZUNhbGxiYWNrICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgYWRkTm90aWZ5UGhhc2VDYWxsYmFjayggcGhhc2VDYWxsYmFjazogUGhhc2VDYWxsYmFjayApOiB2b2lkIHtcclxuICAgIHRoaXMubm90aWZ5U2V0LmFkZCggcGhhc2VDYWxsYmFjayApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFNldEZyb21QaGFzZSggcGhhc2U6IFByb3BlcnR5U3RhdGVQaGFzZSApOiBTZXQ8UGhhc2VDYWxsYmFjaz4ge1xyXG4gICAgcmV0dXJuIHBoYXNlID09PSBQcm9wZXJ0eVN0YXRlUGhhc2UuTk9USUZZID8gdGhpcy5ub3RpZnlTZXQgOiB0aGlzLnVuZGVmZXJTZXQ7XHJcbiAgfVxyXG59XHJcblxyXG5heG9uLnJlZ2lzdGVyKCAnUHJvcGVydHlTdGF0ZUhhbmRsZXInLCBQcm9wZXJ0eVN0YXRlSGFuZGxlciApO1xyXG5leHBvcnQgZGVmYXVsdCBQcm9wZXJ0eVN0YXRlSGFuZGxlcjsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsTUFBTSxNQUFNLDJCQUEyQjtB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