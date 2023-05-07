// Copyright 2013-2023, University of Colorado Boulder
/**
 * An observable property which notifies listeners when the value changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import FunctionIO from '../../tandem/js/types/FunctionIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import NullableIO from '../../tandem/js/types/NullableIO.js';
import StringIO from '../../tandem/js/types/StringIO.js';
import VoidIO from '../../tandem/js/types/VoidIO.js';
import propertyStateHandlerSingleton from './propertyStateHandlerSingleton.js';
import PropertyStatePhase from './PropertyStatePhase.js';
import TinyProperty from './TinyProperty.js';
import units from './units.js';
import validate from './validate.js';
import optionize from '../../phet-core/js/optionize.js';
import Validation from './Validation.js';
import axon from './axon.js';

// constants
const VALIDATE_OPTIONS_FALSE = {
  validateValidator: false
};

// variables
let globalId = 0; // auto-incremented for unique IDs

// Cache each parameterized PropertyIO based on the parameter type, so that it is only created once
const cache = new Map();

// Options defined by Property

// Options that can be passed in

/**
 * Base class for Property, DerivedProperty, DynamicProperty.  Set methods are protected/not part of the public
 * interface.  Initial value and resetting is not defined here.
 */
export default class ReadOnlyProperty extends PhetioObject {
  // Unique identifier for this Property.

  // (phet-io) Units, if any.  See units.js for valid values

  // emit is called when the value changes (or on link)

  // whether we are in the process of notifying listeners; changed in some Property test files with @ts-expect-error

  // whether to allow reentry of calls to set

  // while deferred, new values neither take effect nor send notifications.  When isDeferred changes from
  // true to false, the final deferred value becomes the Property value.  An action is created which can be invoked to
  // send notifications.
  // the value that this Property will take after no longer deferred
  // whether a deferred value has been set
  static TANDEM_NAME_SUFFIX = 'Property';

  /**
   * This is protected to indicate to clients that subclasses should be used instead.
   * @param value - the initial value of the property
   * @param [providedOptions]
   */
  constructor(value, providedOptions) {
    const options = optionize()({
      units: null,
      reentrant: false,
      hasListenerOrderDependencies: false,
      // phet-io
      tandem: Tandem.OPTIONAL,
      phetioOuterType: ReadOnlyProperty.PropertyIO,
      phetioValueType: IOType.ObjectIO
    }, providedOptions);

    // Support non-validated Property
    if (!Validation.containsValidatorKey(options)) {
      options.isValidValue = () => true;
    }
    assert && options.units && assert(units.isValidUnits(options.units), `invalid units: ${options.units}`);
    if (options.units) {
      options.phetioEventMetadata = options.phetioEventMetadata || {};
      assert && assert(!options.phetioEventMetadata.hasOwnProperty('units'), 'units should be supplied by Property, not elsewhere');
      options.phetioEventMetadata.units = options.units;
    }
    if (assert && providedOptions) {
      // @ts-expect-error -- for checking JS code
      assert && assert(!providedOptions.phetioType, 'Set phetioType via phetioValueType');
    }

    // Construct the IO Type
    if (options.phetioOuterType && options.phetioValueType) {
      options.phetioType = options.phetioOuterType(options.phetioValueType);
    }
    super(options);
    this.id = globalId++;
    this.units = options.units;

    // When running as phet-io, if the tandem is specified, the type must be specified.
    if (Tandem.VALIDATION && this.isPhetioInstrumented()) {
      // This assertion helps in instrumenting code that has the tandem but not type
      assert && assert(this.phetioType, `phetioType passed to Property must be specified. Tandem.phetioID: ${this.tandem.phetioID}`);
      assert && assert(options.phetioType.parameterTypes[0], `phetioType parameter type must be specified (only one). Tandem.phetioID: ${this.tandem.phetioID}`);
    }
    assert && assert(!this.isPhetioInstrumented() || options.tandem.name.endsWith(ReadOnlyProperty.TANDEM_NAME_SUFFIX) || options.tandem.name === 'property', `Property tandem.name must end with Property: ${options.tandem.phetioID}`);
    this.validValues = options.validValues;
    this.tinyProperty = new TinyProperty(value, null, options.hasListenerOrderDependencies);

    // Since we are already in the heavyweight Property, we always assign TinyProperty.useDeepEquality for clarity.
    // @ts-expect-error
    this.tinyProperty.useDeepEquality = options.valueComparisonStrategy && options.valueComparisonStrategy === 'equalsFunction';
    this.notifying = false;
    this.reentrant = options.reentrant;
    this.isDeferred = false;
    this.deferredValue = null;
    this.hasDeferredValue = false;
    this.valueValidator = _.pick(options, Validation.VALIDATOR_KEYS);
    this.valueValidator.validationMessage = this.valueValidator.validationMessage || 'Property value not valid';
    if (this.valueValidator.phetioType) {
      // Validate the value type's phetioType of the Property, not the PropertyIO itself.
      // For example, for PropertyIO( BooleanIO ), assign this valueValidator's phetioType to be BooleanIO's validator.
      assert && assert(!!this.valueValidator.phetioType.parameterTypes[0], 'unexpected number of parameters for Property');

      // This is the validator for the value, not for the Property itself
      this.valueValidator.phetioType = this.valueValidator.phetioType.parameterTypes[0];
    }

    // Assertions regarding value validation
    if (assert) {
      Validation.validateValidator(this.valueValidator);

      // validate the initial value as well as any changes in the future
      this.link(value => validate(value, this.valueValidator, VALIDATE_OPTIONS_FALSE));
      if (Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioState && Tandem.VALIDATION) {
        assert && assert(options.phetioValueType !== IOType.ObjectIO, 'Stateful PhET-iO Properties must specify a phetioValueType: ' + this.phetioID);
      }
    }
  }

  /**
   * Returns true if the value can be set externally, using .value= or set()
   */
  isSettable() {
    return false;
  }

  /**
   * Gets the value.
   * You can also use the es5 getter (property.value) but this means is provided for inner loops
   * or internal code that must be fast.
   */
  get() {
    return this.tinyProperty.get();
  }

  /**
   * Sets the value and notifies listeners, unless deferred or disposed. You can also use the es5 getter
   * (property.value) but this means is provided for inner loops or internal code that must be fast. If the value
   * hasn't changed, this is a no-op.  For PhET-iO instrumented Properties that are phetioState: true, the value is only
   * set by the state and cannot be modified by other code while isSettingPhetioStateProperty === true
   */
  set(value) {
    const simGlobal = _.get(window, 'phet.joist.sim', null); // returns null if global isn't found

    // state is managed by the PhetioStateEngine.
    // We still want to set Properties when clearing dynamic elements, see https://github.com/phetsims/phet-io/issues/1906
    const setManagedByPhetioState = simGlobal && simGlobal.isSettingPhetioStateProperty && simGlobal.isSettingPhetioStateProperty.value && simGlobal.isClearingPhetioDynamicElementsProperty && !simGlobal.isClearingPhetioDynamicElementsProperty.value && this.isPhetioInstrumented() && this.phetioState &&
    // However, DerivedProperty should be able to update during PhET-iO state set
    this.isSettable();
    if (!setManagedByPhetioState) {
      this.unguardedSet(value);
    }
  }

  /**
   * For usage by the IO Type during PhET-iO state setting.
   */
  unguardedSet(value) {
    if (!this.isDisposed) {
      if (this.isDeferred) {
        this.deferredValue = value;
        this.hasDeferredValue = true;
      } else if (!this.equalsValue(value)) {
        const oldValue = this.get();
        this.setPropertyValue(value);
        this._notifyListeners(oldValue);
      }
    }
  }

  /**
   * Sets the value without notifying any listeners. This is a place to override if a subtype performs additional work
   * when setting the value.
   */
  setPropertyValue(value) {
    this.tinyProperty.setPropertyValue(value);
  }

  /**
   * Returns true if and only if the specified value equals the value of this property
   */
  equalsValue(value) {
    return this.areValuesEqual(value, this.get());
  }

  /**
   * See TinyProperty.areValuesEqual
   */
  areValuesEqual(a, b) {
    return this.tinyProperty.areValuesEqual(a, b);
  }

  /**
   * NOTE: a few sims are calling this even though they shouldn't
   */
  _notifyListeners(oldValue) {
    const newValue = this.get();

    // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
    // called so many times that it is worth the optimization for PhET brand.
    Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent(ReadOnlyProperty.CHANGED_EVENT_NAME, {
      getData: () => {
        const parameterType = this.phetioType.parameterTypes[0];
        return {
          oldValue: NullableIO(parameterType).toStateObject(oldValue),
          newValue: parameterType.toStateObject(newValue)
        };
      }
    });

    // notify listeners, optionally detect loops where this Property is set again before this completes.
    assert && assert(!this.notifying || this.reentrant, `reentry detected, value=${newValue}, oldValue=${oldValue}`);
    this.notifying = true;
    this.tinyProperty.emit(newValue, oldValue, this); // cannot use tinyProperty.notifyListeners because it uses the wrong this
    this.notifying = false;
    Tandem.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
  }

  /**
   * Use this method when mutating a value (not replacing with a new instance) and you want to send notifications about the change.
   * This is different from the normal axon strategy, but may be necessary to prevent memory allocations.
   * This method is unsafe for removing listeners because it assumes the listener list not modified, to save another allocation
   * Only provides the new reference as a callback (no oldvalue)
   * See https://github.com/phetsims/axon/issues/6
   */
  notifyListenersStatic() {
    this._notifyListeners(null);
  }

  /**
   * When deferred, set values do not take effect or send out notifications.  After defer ends, the Property takes
   * its deferred value (if any), and a follow-up action (return value) can be invoked to send out notifications
   * once other Properties have also taken their deferred values.
   *
   * @param isDeferred - whether the Property should be deferred or not
   * @returns - function to notify listeners after calling setDeferred(false),
   *          - null if isDeferred is true, or if the value is unchanged since calling setDeferred(true)
   */
  setDeferred(isDeferred) {
    assert && assert(!this.isDisposed, 'cannot defer Property if already disposed.');
    if (isDeferred) {
      assert && assert(!this.isDeferred, 'Property already deferred');
      this.isDeferred = true;
    } else {
      assert && assert(this.isDeferred, 'Property wasn\'t deferred');
      this.isDeferred = false;
      const oldValue = this.get();

      // Take the new value
      if (this.hasDeferredValue) {
        this.setPropertyValue(this.deferredValue);
        this.hasDeferredValue = false;
        this.deferredValue = null;
      }

      // If the value has changed, prepare to send out notifications (after all other Properties in this transaction
      // have their final values)
      if (!this.equalsValue(oldValue)) {
        return () => !this.isDisposed && this._notifyListeners(oldValue);
      }
    }

    // no action to signify change
    return null;
  }
  get value() {
    return this.get();
  }
  set value(newValue) {
    this.set(newValue);
  }

  /**
   * This function registers an order dependency between this Property and another. Basically this says that when
   * setting PhET-iO state, each dependency must take its final value before this Property fires its notifications.
   * See propertyStateHandlerSingleton.registerPhetioOrderDependency and https://github.com/phetsims/axon/issues/276 for more info.
   */
  addPhetioStateDependencies(dependencies) {
    assert && assert(Array.isArray(dependencies), 'Array expected');
    for (let i = 0; i < dependencies.length; i++) {
      const dependencyProperty = dependencies[i];

      // only if running in PhET-iO brand and both Properties are instrumenting
      if (dependencyProperty instanceof ReadOnlyProperty && dependencyProperty.isPhetioInstrumented() && this.isPhetioInstrumented()) {
        // The dependency should undefer (taking deferred value) before this Property notifies.
        propertyStateHandlerSingleton.registerPhetioOrderDependency(dependencyProperty, PropertyStatePhase.UNDEFER, this, PropertyStatePhase.NOTIFY);
      }
    }
  }

  /**
   * Adds listener and calls it immediately. If listener is already registered, this is a no-op. The initial
   * notification provides the current value for newValue and null for oldValue.
   *
   * @param listener - a function that takes a new value, old value, and this Property as arguments
   * @param [options]
   */
  link(listener, options) {
    if (options && options.phetioDependencies) {
      this.addPhetioStateDependencies(options.phetioDependencies);
    }
    this.tinyProperty.addListener(listener); // cannot use tinyProperty.link() because of wrong this
    listener(this.get(), null, this); // null should be used when an object is expected but unavailable
  }

  /**
   * Add a listener to the Property, without calling it back right away. This is used when you need to register a
   * listener without an immediate callback.
   */
  lazyLink(listener, options) {
    if (options && options.phetioDependencies) {
      this.addPhetioStateDependencies(options.phetioDependencies);
    }
    this.tinyProperty.lazyLink(listener);
  }

  /**
   * Removes a listener. If listener is not registered, this is a no-op.
   */
  unlink(listener) {
    this.tinyProperty.unlink(listener);
  }

  /**
   * Removes all listeners. If no listeners are registered, this is a no-op.
   */
  unlinkAll() {
    this.tinyProperty.unlinkAll();
  }

  /**
   * Links an object's named attribute to this property.  Returns a handle so it can be removed using Property.unlink();
   * Example: modelVisibleProperty.linkAttribute(view,'visible');
   *
   * NOTE: Duplicated with TinyProperty.linkAttribute
   */
  linkAttribute(object, attributeName) {
    const handle = value => {
      object[attributeName] = value;
    };
    this.link(handle);
    return handle;
  }

  /**
   * Provide toString for console debugging, see http://stackoverflow.com/questions/2485632/valueof-vs-tostring-in-javascript
   */
  toString() {
    return `Property#${this.id}{${this.get()}}`;
  }

  /**
   * Convenience function for debugging a Property's value. It prints the new value on registration and when changed.
   * @param name - debug name to be printed on the console
   * @returns - the handle to the linked listener in case it needs to be removed later
   */
  debug(name) {
    const listener = value => console.log(name, value);
    this.link(listener);
    return listener;
  }
  isValueValid(value) {
    return this.getValidationError(value) === null;
  }
  getValidationError(value) {
    return Validation.getValidationError(value, this.valueValidator, VALIDATE_OPTIONS_FALSE);
  }

  // Ensures that the Property is eligible for GC
  dispose() {
    // unregister any order dependencies for this Property for PhET-iO state
    if (this.isPhetioInstrumented()) {
      propertyStateHandlerSingleton.unregisterOrderDependenciesForProperty(this);
    }
    super.dispose();
    this.tinyProperty.dispose();
  }

  /**
   * Checks whether a listener is registered with this Property
   */
  hasListener(listener) {
    return this.tinyProperty.hasListener(listener);
  }

  /**
   * Returns the number of listeners.
   */
  getListenerCount() {
    return this.tinyProperty.getListenerCount();
  }

  /**
   * Invokes a callback once for each listener
   * @param callback - takes the listener as an argument
   */
  forEachListener(callback) {
    this.tinyProperty.forEachListener(callback);
  }

  /**
   * Returns true if there are any listeners.
   */
  hasListeners() {
    assert && assert(arguments.length === 0, 'Property.hasListeners should be called without arguments');
    return this.tinyProperty.hasListeners();
  }

  /**
   * An observable Property that triggers notifications when the value changes.
   * This caching implementation should be kept in sync with the other parametric IO Type caching implementations.
   */
  static PropertyIO(parameterType) {
    assert && assert(parameterType, 'PropertyIO needs parameterType');
    if (!cache.has(parameterType)) {
      cache.set(parameterType, new IOType(`PropertyIO<${parameterType.typeName}>`, {
        // We want PropertyIO to work for DynamicProperty and DerivedProperty, but they extend ReadOnlyProperty
        valueType: ReadOnlyProperty,
        documentation: 'Observable values that send out notifications when the value changes. This differs from the ' + 'traditional listener pattern in that added listeners also receive a callback with the current value ' + 'when the listeners are registered. This is a widely-used pattern in PhET-iO simulations.',
        methodOrder: ['link', 'lazyLink'],
        events: [ReadOnlyProperty.CHANGED_EVENT_NAME],
        parameterTypes: [parameterType],
        toStateObject: property => {
          assert && assert(parameterType.toStateObject, `toStateObject doesn't exist for ${parameterType.typeName}`);
          const stateObject = {
            value: parameterType.toStateObject(property.value),
            // Only include validValues if specified, so they only show up in PhET-iO Studio when supplied.
            validValues: property.validValues ? property.validValues.map(v => {
              return parameterType.toStateObject(v);
            }) : null,
            units: NullableIO(StringIO).toStateObject(property.units)
          };
          return stateObject;
        },
        applyState: (property, stateObject) => {
          const units = NullableIO(StringIO).fromStateObject(stateObject.units);
          assert && assert(property.units === units, 'Property units do not match');
          assert && assert(property.isSettable(), 'Property should be settable');
          property.unguardedSet(parameterType.fromStateObject(stateObject.value));
          if (stateObject.validValues) {
            property.validValues = stateObject.validValues.map(validValue => parameterType.fromStateObject(validValue));
          }
        },
        stateSchema: {
          value: parameterType,
          validValues: NullableIO(ArrayIO(parameterType)),
          units: NullableIO(StringIO)
        },
        methods: {
          getValue: {
            returnType: parameterType,
            parameterTypes: [],
            implementation: ReadOnlyProperty.prototype.get,
            documentation: 'Gets the current value.'
          },
          getValidationError: {
            returnType: NullableIO(StringIO),
            parameterTypes: [parameterType],
            implementation: ReadOnlyProperty.prototype.getValidationError,
            documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
          },
          setValue: {
            returnType: VoidIO,
            parameterTypes: [parameterType],
            implementation: function (value) {
              const validationError = Validation.getValidationError(value, this.valueValidator, VALIDATE_OPTIONS_FALSE);
              if (validationError) {
                throw new Error(`Validation error: ${validationError}`);
              } else {
                this.set(value);
              }
            },
            documentation: 'Sets the value of the Property. If the value differs from the previous value, listeners are ' + 'notified with the new value.',
            invocableForReadOnlyElements: false
          },
          link: {
            returnType: VoidIO,
            // oldValue will start as "null" the first time called
            parameterTypes: [FunctionIO(VoidIO, [parameterType, NullableIO(parameterType)])],
            implementation: ReadOnlyProperty.prototype.link,
            documentation: 'Adds a listener which will be called when the value changes. On registration, the listener is ' + 'also called with the current value. The listener takes two arguments, the new value and the ' + 'previous value.'
          },
          lazyLink: {
            returnType: VoidIO,
            // oldValue will start as "null" the first time called
            parameterTypes: [FunctionIO(VoidIO, [parameterType, NullableIO(parameterType)])],
            implementation: ReadOnlyProperty.prototype.lazyLink,
            documentation: 'Adds a listener which will be called when the value changes. This method is like "link", but ' + 'without the current-value callback on registration. The listener takes two arguments, the new ' + 'value and the previous value.'
          },
          unlink: {
            returnType: VoidIO,
            parameterTypes: [FunctionIO(VoidIO, [parameterType])],
            implementation: ReadOnlyProperty.prototype.unlink,
            documentation: 'Removes a listener.'
          }
        }
      }));
    }
    return cache.get(parameterType);
  }
  static CHANGED_EVENT_NAME = 'changed';
}
axon.register('ReadOnlyProperty', ReadOnlyProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0aW9PYmplY3QiLCJUYW5kZW0iLCJBcnJheUlPIiwiRnVuY3Rpb25JTyIsIklPVHlwZSIsIk51bGxhYmxlSU8iLCJTdHJpbmdJTyIsIlZvaWRJTyIsInByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uIiwiUHJvcGVydHlTdGF0ZVBoYXNlIiwiVGlueVByb3BlcnR5IiwidW5pdHMiLCJ2YWxpZGF0ZSIsIm9wdGlvbml6ZSIsIlZhbGlkYXRpb24iLCJheG9uIiwiVkFMSURBVEVfT1BUSU9OU19GQUxTRSIsInZhbGlkYXRlVmFsaWRhdG9yIiwiZ2xvYmFsSWQiLCJjYWNoZSIsIk1hcCIsIlJlYWRPbmx5UHJvcGVydHkiLCJUQU5ERU1fTkFNRV9TVUZGSVgiLCJjb25zdHJ1Y3RvciIsInZhbHVlIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInJlZW50cmFudCIsImhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMiLCJ0YW5kZW0iLCJPUFRJT05BTCIsInBoZXRpb091dGVyVHlwZSIsIlByb3BlcnR5SU8iLCJwaGV0aW9WYWx1ZVR5cGUiLCJPYmplY3RJTyIsImNvbnRhaW5zVmFsaWRhdG9yS2V5IiwiaXNWYWxpZFZhbHVlIiwiYXNzZXJ0IiwiaXNWYWxpZFVuaXRzIiwicGhldGlvRXZlbnRNZXRhZGF0YSIsImhhc093blByb3BlcnR5IiwicGhldGlvVHlwZSIsImlkIiwiVkFMSURBVElPTiIsImlzUGhldGlvSW5zdHJ1bWVudGVkIiwicGhldGlvSUQiLCJwYXJhbWV0ZXJUeXBlcyIsIm5hbWUiLCJlbmRzV2l0aCIsInZhbGlkVmFsdWVzIiwidGlueVByb3BlcnR5IiwidXNlRGVlcEVxdWFsaXR5IiwidmFsdWVDb21wYXJpc29uU3RyYXRlZ3kiLCJub3RpZnlpbmciLCJpc0RlZmVycmVkIiwiZGVmZXJyZWRWYWx1ZSIsImhhc0RlZmVycmVkVmFsdWUiLCJ2YWx1ZVZhbGlkYXRvciIsIl8iLCJwaWNrIiwiVkFMSURBVE9SX0tFWVMiLCJ2YWxpZGF0aW9uTWVzc2FnZSIsImxpbmsiLCJQSEVUX0lPX0VOQUJMRUQiLCJwaGV0aW9TdGF0ZSIsImlzU2V0dGFibGUiLCJnZXQiLCJzZXQiLCJzaW1HbG9iYWwiLCJ3aW5kb3ciLCJzZXRNYW5hZ2VkQnlQaGV0aW9TdGF0ZSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJpc0NsZWFyaW5nUGhldGlvRHluYW1pY0VsZW1lbnRzUHJvcGVydHkiLCJ1bmd1YXJkZWRTZXQiLCJpc0Rpc3Bvc2VkIiwiZXF1YWxzVmFsdWUiLCJvbGRWYWx1ZSIsInNldFByb3BlcnR5VmFsdWUiLCJfbm90aWZ5TGlzdGVuZXJzIiwiYXJlVmFsdWVzRXF1YWwiLCJhIiwiYiIsIm5ld1ZhbHVlIiwicGhldGlvU3RhcnRFdmVudCIsIkNIQU5HRURfRVZFTlRfTkFNRSIsImdldERhdGEiLCJwYXJhbWV0ZXJUeXBlIiwidG9TdGF0ZU9iamVjdCIsImVtaXQiLCJwaGV0aW9FbmRFdmVudCIsIm5vdGlmeUxpc3RlbmVyc1N0YXRpYyIsInNldERlZmVycmVkIiwiYWRkUGhldGlvU3RhdGVEZXBlbmRlbmNpZXMiLCJkZXBlbmRlbmNpZXMiLCJBcnJheSIsImlzQXJyYXkiLCJpIiwibGVuZ3RoIiwiZGVwZW5kZW5jeVByb3BlcnR5IiwicmVnaXN0ZXJQaGV0aW9PcmRlckRlcGVuZGVuY3kiLCJVTkRFRkVSIiwiTk9USUZZIiwibGlzdGVuZXIiLCJwaGV0aW9EZXBlbmRlbmNpZXMiLCJhZGRMaXN0ZW5lciIsImxhenlMaW5rIiwidW5saW5rIiwidW5saW5rQWxsIiwibGlua0F0dHJpYnV0ZSIsIm9iamVjdCIsImF0dHJpYnV0ZU5hbWUiLCJoYW5kbGUiLCJ0b1N0cmluZyIsImRlYnVnIiwiY29uc29sZSIsImxvZyIsImlzVmFsdWVWYWxpZCIsImdldFZhbGlkYXRpb25FcnJvciIsImRpc3Bvc2UiLCJ1bnJlZ2lzdGVyT3JkZXJEZXBlbmRlbmNpZXNGb3JQcm9wZXJ0eSIsImhhc0xpc3RlbmVyIiwiZ2V0TGlzdGVuZXJDb3VudCIsImZvckVhY2hMaXN0ZW5lciIsImNhbGxiYWNrIiwiaGFzTGlzdGVuZXJzIiwiYXJndW1lbnRzIiwiaGFzIiwidHlwZU5hbWUiLCJ2YWx1ZVR5cGUiLCJkb2N1bWVudGF0aW9uIiwibWV0aG9kT3JkZXIiLCJldmVudHMiLCJwcm9wZXJ0eSIsInN0YXRlT2JqZWN0IiwibWFwIiwidiIsImFwcGx5U3RhdGUiLCJmcm9tU3RhdGVPYmplY3QiLCJ2YWxpZFZhbHVlIiwic3RhdGVTY2hlbWEiLCJtZXRob2RzIiwiZ2V0VmFsdWUiLCJyZXR1cm5UeXBlIiwiaW1wbGVtZW50YXRpb24iLCJwcm90b3R5cGUiLCJzZXRWYWx1ZSIsInZhbGlkYXRpb25FcnJvciIsIkVycm9yIiwiaW52b2NhYmxlRm9yUmVhZE9ubHlFbGVtZW50cyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiUmVhZE9ubHlQcm9wZXJ0eS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuLyoqXHJcbiAqIEFuIG9ic2VydmFibGUgcHJvcGVydHkgd2hpY2ggbm90aWZpZXMgbGlzdGVuZXJzIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFBoZXRpb09iamVjdCwgeyBQaGV0aW9PYmplY3RPcHRpb25zIH0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IEZ1bmN0aW9uSU8gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Z1bmN0aW9uSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVsbGFibGVJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvTnVsbGFibGVJTy5qcyc7XHJcbmltcG9ydCBTdHJpbmdJTyBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvU3RyaW5nSU8uanMnO1xyXG5pbXBvcnQgVm9pZElPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Wb2lkSU8uanMnO1xyXG5pbXBvcnQgcHJvcGVydHlTdGF0ZUhhbmRsZXJTaW5nbGV0b24gZnJvbSAnLi9wcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbi5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eVN0YXRlUGhhc2UgZnJvbSAnLi9Qcm9wZXJ0eVN0YXRlUGhhc2UuanMnO1xyXG5pbXBvcnQgVGlueVByb3BlcnR5IGZyb20gJy4vVGlueVByb3BlcnR5LmpzJztcclxuaW1wb3J0IHVuaXRzIGZyb20gJy4vdW5pdHMuanMnO1xyXG5pbXBvcnQgdmFsaWRhdGUgZnJvbSAnLi92YWxpZGF0ZS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSwgeyBQcm9wZXJ0eUxhenlMaW5rTGlzdGVuZXIsIFByb3BlcnR5TGlua0xpc3RlbmVyLCBQcm9wZXJ0eUxpc3RlbmVyIH0gZnJvbSAnLi9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBWYWxpZGF0aW9uLCB7IFZhbGlkYXRvciB9IGZyb20gJy4vVmFsaWRhdGlvbi5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBheG9uIGZyb20gJy4vYXhvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgVkFMSURBVEVfT1BUSU9OU19GQUxTRSA9IHsgdmFsaWRhdGVWYWxpZGF0b3I6IGZhbHNlIH07XHJcblxyXG4vLyB2YXJpYWJsZXNcclxubGV0IGdsb2JhbElkID0gMDsgLy8gYXV0by1pbmNyZW1lbnRlZCBmb3IgdW5pcXVlIElEc1xyXG5cclxuLy8gQ2FjaGUgZWFjaCBwYXJhbWV0ZXJpemVkIFByb3BlcnR5SU8gYmFzZWQgb24gdGhlIHBhcmFtZXRlciB0eXBlLCBzbyB0aGF0IGl0IGlzIG9ubHkgY3JlYXRlZCBvbmNlXHJcbmNvbnN0IGNhY2hlID0gbmV3IE1hcDxJT1R5cGUsIElPVHlwZT4oKTtcclxuXHJcbmV4cG9ydCB0eXBlIFJlYWRPbmx5UHJvcGVydHlTdGF0ZTxTdGF0ZVR5cGU+ID0ge1xyXG4gIHZhbHVlOiBTdGF0ZVR5cGU7XHJcblxyXG4gIC8vIE9ubHkgaW5jbHVkZSB2YWxpZFZhbHVlcyBpZiBzcGVjaWZpZWQsIHNvIHRoZXkgb25seSBzaG93IHVwIGluIFBoRVQtaU8gU3R1ZGlvIHdoZW4gc3VwcGxpZWQuXHJcbiAgdmFsaWRWYWx1ZXM6IFN0YXRlVHlwZVtdIHwgbnVsbDtcclxuXHJcbiAgdW5pdHM6IHN0cmluZyB8IG51bGw7XHJcbn07XHJcblxyXG4vLyBPcHRpb25zIGRlZmluZWQgYnkgUHJvcGVydHlcclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuXHJcbiAgLy8gdW5pdHMgZm9yIHRoZSBudW1iZXIsIHNlZSB1bml0cy5qcy4gU2hvdWxkIHByZWZlciBhYmJyZXZpYXRlZCB1bml0cywgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy81MzBcclxuICB1bml0cz86IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIC8vIFdoZXRoZXIgcmVlbnRyYW50IGNhbGxzIHRvICdzZXQnIGFyZSBhbGxvd2VkLlxyXG4gIC8vIFVzZSB0aGlzIHRvIGRldGVjdCBvciBwcmV2ZW50IHVwZGF0ZSBjeWNsZXMuIFVwZGF0ZSBjeWNsZXMgbWF5IGJlIGR1ZSB0byBmbG9hdGluZyBwb2ludCBlcnJvcixcclxuICAvLyBmYXVsdHkgbG9naWMsIGV0Yy4gVGhpcyBtYXkgYmUgb2YgcGFydGljdWxhciBpbnRlcmVzdCBmb3IgUGhFVC1pTyBpbnN0cnVtZW50YXRpb24sIHdoZXJlIHN1Y2hcclxuICAvLyBjeWNsZXMgbWF5IHBvbGx1dGUgdGhlIGRhdGEgc3RyZWFtLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzE3OVxyXG4gIHJlZW50cmFudD86IGJvb2xlYW47XHJcblxyXG4gIC8vIEF0IHRoaXMgbGV2ZWwsIGl0IGRvZXNuJ3QgbWF0dGVyIHdoYXQgdGhlIHN0YXRlIHR5cGUgaXMsIHNvIGl0IGRlZmF1bHRzIHRvIEludGVudGlvbmFsQW55XHJcbiAgcGhldGlvVmFsdWVUeXBlPzogSU9UeXBlO1xyXG5cclxuICAvLyBUaGUgSU9UeXBlIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHBhcmFtZXRlcml6ZWQgSU9UeXBlIGJhc2VkIG9uIHRoZSB2YWx1ZVR5cGUuIFRoZXJlIGlzIGEgZ2VuZXJhbCBkZWZhdWx0LCBidXRcclxuICAvLyBzdWJ0eXBlcyBjYW4gaW1wbGVtZW50IHRoZWlyIG93biwgbW9yZSBzcGVjaWZpYyBJT1R5cGUuXHJcbiAgcGhldGlvT3V0ZXJUeXBlPzogKCBwYXJhbWV0ZXJUeXBlOiBJT1R5cGUgKSA9PiBJT1R5cGU7XHJcblxyXG4gIC8vIElmIHNwZWNpZmllZCBhcyB0cnVlLCB0aGlzIGZsYWcgd2lsbCBlbnN1cmUgdGhhdCBsaXN0ZW5lciBvcmRlciBuZXZlciBjaGFuZ2VzIChsaWtlIHZpYSA/bGlzdGVuZXJPcmRlcj1yYW5kb20pXHJcbiAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcz86IGJvb2xlYW47XHJcbn07XHJcblxyXG4vLyBPcHRpb25zIHRoYXQgY2FuIGJlIHBhc3NlZCBpblxyXG5leHBvcnQgdHlwZSBQcm9wZXJ0eU9wdGlvbnM8VD4gPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8VmFsaWRhdG9yPFQ+ICYgUGhldGlvT2JqZWN0T3B0aW9ucywgJ3BoZXRpb1R5cGUnPjtcclxuXHJcbmV4cG9ydCB0eXBlIExpbmtPcHRpb25zID0ge1xyXG4gIHBoZXRpb0RlcGVuZGVuY2llcz86IEFycmF5PFRSZWFkT25seVByb3BlcnR5PHVua25vd24+PjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNsYXNzIGZvciBQcm9wZXJ0eSwgRGVyaXZlZFByb3BlcnR5LCBEeW5hbWljUHJvcGVydHkuICBTZXQgbWV0aG9kcyBhcmUgcHJvdGVjdGVkL25vdCBwYXJ0IG9mIHRoZSBwdWJsaWNcclxuICogaW50ZXJmYWNlLiAgSW5pdGlhbCB2YWx1ZSBhbmQgcmVzZXR0aW5nIGlzIG5vdCBkZWZpbmVkIGhlcmUuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWFkT25seVByb3BlcnR5PFQ+IGV4dGVuZHMgUGhldGlvT2JqZWN0IGltcGxlbWVudHMgVFJlYWRPbmx5UHJvcGVydHk8VD4ge1xyXG5cclxuICAvLyBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhpcyBQcm9wZXJ0eS5cclxuICBwcml2YXRlIHJlYWRvbmx5IGlkOiBudW1iZXI7XHJcblxyXG4gIC8vIChwaGV0LWlvKSBVbml0cywgaWYgYW55LiAgU2VlIHVuaXRzLmpzIGZvciB2YWxpZCB2YWx1ZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgdW5pdHM6IHN0cmluZyB8IG51bGw7XHJcblxyXG4gIHB1YmxpYyB2YWxpZFZhbHVlcz86IHJlYWRvbmx5IFRbXTtcclxuXHJcbiAgLy8gZW1pdCBpcyBjYWxsZWQgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcyAob3Igb24gbGluaylcclxuICBwcml2YXRlIHRpbnlQcm9wZXJ0eTogVGlueVByb3BlcnR5PFQ+O1xyXG5cclxuICAvLyB3aGV0aGVyIHdlIGFyZSBpbiB0aGUgcHJvY2VzcyBvZiBub3RpZnlpbmcgbGlzdGVuZXJzOyBjaGFuZ2VkIGluIHNvbWUgUHJvcGVydHkgdGVzdCBmaWxlcyB3aXRoIEB0cy1leHBlY3QtZXJyb3JcclxuICBwcml2YXRlIG5vdGlmeWluZzogYm9vbGVhbjtcclxuXHJcbiAgLy8gd2hldGhlciB0byBhbGxvdyByZWVudHJ5IG9mIGNhbGxzIHRvIHNldFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgcmVlbnRyYW50OiBib29sZWFuO1xyXG5cclxuICAvLyB3aGlsZSBkZWZlcnJlZCwgbmV3IHZhbHVlcyBuZWl0aGVyIHRha2UgZWZmZWN0IG5vciBzZW5kIG5vdGlmaWNhdGlvbnMuICBXaGVuIGlzRGVmZXJyZWQgY2hhbmdlcyBmcm9tXHJcbiAgLy8gdHJ1ZSB0byBmYWxzZSwgdGhlIGZpbmFsIGRlZmVycmVkIHZhbHVlIGJlY29tZXMgdGhlIFByb3BlcnR5IHZhbHVlLiAgQW4gYWN0aW9uIGlzIGNyZWF0ZWQgd2hpY2ggY2FuIGJlIGludm9rZWQgdG9cclxuICAvLyBzZW5kIG5vdGlmaWNhdGlvbnMuXHJcbiAgcHVibGljIGlzRGVmZXJyZWQ6IGJvb2xlYW47XHJcblxyXG4gIC8vIHRoZSB2YWx1ZSB0aGF0IHRoaXMgUHJvcGVydHkgd2lsbCB0YWtlIGFmdGVyIG5vIGxvbmdlciBkZWZlcnJlZFxyXG4gIHByb3RlY3RlZCBkZWZlcnJlZFZhbHVlOiBUIHwgbnVsbDtcclxuXHJcbiAgLy8gd2hldGhlciBhIGRlZmVycmVkIHZhbHVlIGhhcyBiZWVuIHNldFxyXG4gIHByb3RlY3RlZCBoYXNEZWZlcnJlZFZhbHVlOiBib29sZWFuO1xyXG5cclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgdmFsdWVWYWxpZGF0b3I6IFZhbGlkYXRvcjxUPjtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFRBTkRFTV9OQU1FX1NVRkZJWDogc3RyaW5nID0gJ1Byb3BlcnR5JztcclxuXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBwcm90ZWN0ZWQgdG8gaW5kaWNhdGUgdG8gY2xpZW50cyB0aGF0IHN1YmNsYXNzZXMgc2hvdWxkIGJlIHVzZWQgaW5zdGVhZC5cclxuICAgKiBAcGFyYW0gdmFsdWUgLSB0aGUgaW5pdGlhbCB2YWx1ZSBvZiB0aGUgcHJvcGVydHlcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIHZhbHVlOiBULCBwcm92aWRlZE9wdGlvbnM/OiBQcm9wZXJ0eU9wdGlvbnM8VD4gKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFByb3BlcnR5T3B0aW9uczxUPiwgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuICAgICAgdW5pdHM6IG51bGwsXHJcbiAgICAgIHJlZW50cmFudDogZmFsc2UsXHJcbiAgICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IGZhbHNlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgcGhldGlvT3V0ZXJUeXBlOiBSZWFkT25seVByb3BlcnR5LlByb3BlcnR5SU8sXHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogSU9UeXBlLk9iamVjdElPXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBTdXBwb3J0IG5vbi12YWxpZGF0ZWQgUHJvcGVydHlcclxuICAgIGlmICggIVZhbGlkYXRpb24uY29udGFpbnNWYWxpZGF0b3JLZXkoIG9wdGlvbnMgKSApIHtcclxuXHJcbiAgICAgIG9wdGlvbnMuaXNWYWxpZFZhbHVlID0gKCkgPT4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnQgJiYgb3B0aW9ucy51bml0cyAmJiBhc3NlcnQoIHVuaXRzLmlzVmFsaWRVbml0cyggb3B0aW9ucy51bml0cyApLCBgaW52YWxpZCB1bml0czogJHtvcHRpb25zLnVuaXRzfWAgKTtcclxuICAgIGlmICggb3B0aW9ucy51bml0cyApIHtcclxuICAgICAgb3B0aW9ucy5waGV0aW9FdmVudE1ldGFkYXRhID0gb3B0aW9ucy5waGV0aW9FdmVudE1ldGFkYXRhIHx8IHt9O1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhb3B0aW9ucy5waGV0aW9FdmVudE1ldGFkYXRhLmhhc093blByb3BlcnR5KCAndW5pdHMnICksICd1bml0cyBzaG91bGQgYmUgc3VwcGxpZWQgYnkgUHJvcGVydHksIG5vdCBlbHNld2hlcmUnICk7XHJcbiAgICAgIG9wdGlvbnMucGhldGlvRXZlbnRNZXRhZGF0YS51bml0cyA9IG9wdGlvbnMudW5pdHM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBhc3NlcnQgJiYgcHJvdmlkZWRPcHRpb25zICkge1xyXG5cclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtLSBmb3IgY2hlY2tpbmcgSlMgY29kZVxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcHJvdmlkZWRPcHRpb25zLnBoZXRpb1R5cGUsICdTZXQgcGhldGlvVHlwZSB2aWEgcGhldGlvVmFsdWVUeXBlJyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbnN0cnVjdCB0aGUgSU8gVHlwZVxyXG4gICAgaWYgKCBvcHRpb25zLnBoZXRpb091dGVyVHlwZSAmJiBvcHRpb25zLnBoZXRpb1ZhbHVlVHlwZSApIHtcclxuICAgICAgb3B0aW9ucy5waGV0aW9UeXBlID0gb3B0aW9ucy5waGV0aW9PdXRlclR5cGUoIG9wdGlvbnMucGhldGlvVmFsdWVUeXBlICk7XHJcbiAgICB9XHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gICAgdGhpcy5pZCA9IGdsb2JhbElkKys7XHJcbiAgICB0aGlzLnVuaXRzID0gb3B0aW9ucy51bml0cztcclxuXHJcbiAgICAvLyBXaGVuIHJ1bm5pbmcgYXMgcGhldC1pbywgaWYgdGhlIHRhbmRlbSBpcyBzcGVjaWZpZWQsIHRoZSB0eXBlIG11c3QgYmUgc3BlY2lmaWVkLlxyXG4gICAgaWYgKCBUYW5kZW0uVkFMSURBVElPTiAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICAvLyBUaGlzIGFzc2VydGlvbiBoZWxwcyBpbiBpbnN0cnVtZW50aW5nIGNvZGUgdGhhdCBoYXMgdGhlIHRhbmRlbSBidXQgbm90IHR5cGVcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5waGV0aW9UeXBlLCBgcGhldGlvVHlwZSBwYXNzZWQgdG8gUHJvcGVydHkgbXVzdCBiZSBzcGVjaWZpZWQuIFRhbmRlbS5waGV0aW9JRDogJHt0aGlzLnRhbmRlbS5waGV0aW9JRH1gICk7XHJcblxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0sIGBwaGV0aW9UeXBlIHBhcmFtZXRlciB0eXBlIG11c3QgYmUgc3BlY2lmaWVkIChvbmx5IG9uZSkuIFRhbmRlbS5waGV0aW9JRDogJHt0aGlzLnRhbmRlbS5waGV0aW9JRH1gICk7XHJcbiAgICB9XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRhbmRlbS5uYW1lLmVuZHNXaXRoKCBSZWFkT25seVByb3BlcnR5LlRBTkRFTV9OQU1FX1NVRkZJWCApIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLnRhbmRlbS5uYW1lID09PSAncHJvcGVydHknLFxyXG4gICAgICBgUHJvcGVydHkgdGFuZGVtLm5hbWUgbXVzdCBlbmQgd2l0aCBQcm9wZXJ0eTogJHtvcHRpb25zLnRhbmRlbS5waGV0aW9JRH1gICk7XHJcblxyXG4gICAgdGhpcy52YWxpZFZhbHVlcyA9IG9wdGlvbnMudmFsaWRWYWx1ZXM7XHJcblxyXG4gICAgdGhpcy50aW55UHJvcGVydHkgPSBuZXcgVGlueVByb3BlcnR5KCB2YWx1ZSwgbnVsbCwgb3B0aW9ucy5oYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzICk7XHJcblxyXG4gICAgLy8gU2luY2Ugd2UgYXJlIGFscmVhZHkgaW4gdGhlIGhlYXZ5d2VpZ2h0IFByb3BlcnR5LCB3ZSBhbHdheXMgYXNzaWduIFRpbnlQcm9wZXJ0eS51c2VEZWVwRXF1YWxpdHkgZm9yIGNsYXJpdHkuXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS51c2VEZWVwRXF1YWxpdHkgPSBvcHRpb25zLnZhbHVlQ29tcGFyaXNvblN0cmF0ZWd5ICYmIG9wdGlvbnMudmFsdWVDb21wYXJpc29uU3RyYXRlZ3kgPT09ICdlcXVhbHNGdW5jdGlvbic7XHJcbiAgICB0aGlzLm5vdGlmeWluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5yZWVudHJhbnQgPSBvcHRpb25zLnJlZW50cmFudDtcclxuICAgIHRoaXMuaXNEZWZlcnJlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5kZWZlcnJlZFZhbHVlID0gbnVsbDtcclxuICAgIHRoaXMuaGFzRGVmZXJyZWRWYWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudmFsdWVWYWxpZGF0b3IgPSBfLnBpY2soIG9wdGlvbnMsIFZhbGlkYXRpb24uVkFMSURBVE9SX0tFWVMgKTtcclxuICAgIHRoaXMudmFsdWVWYWxpZGF0b3IudmFsaWRhdGlvbk1lc3NhZ2UgPSB0aGlzLnZhbHVlVmFsaWRhdG9yLnZhbGlkYXRpb25NZXNzYWdlIHx8ICdQcm9wZXJ0eSB2YWx1ZSBub3QgdmFsaWQnO1xyXG5cclxuICAgIGlmICggdGhpcy52YWx1ZVZhbGlkYXRvci5waGV0aW9UeXBlICkge1xyXG5cclxuICAgICAgLy8gVmFsaWRhdGUgdGhlIHZhbHVlIHR5cGUncyBwaGV0aW9UeXBlIG9mIHRoZSBQcm9wZXJ0eSwgbm90IHRoZSBQcm9wZXJ0eUlPIGl0c2VsZi5cclxuICAgICAgLy8gRm9yIGV4YW1wbGUsIGZvciBQcm9wZXJ0eUlPKCBCb29sZWFuSU8gKSwgYXNzaWduIHRoaXMgdmFsdWVWYWxpZGF0b3IncyBwaGV0aW9UeXBlIHRvIGJlIEJvb2xlYW5JTydzIHZhbGlkYXRvci5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggISF0aGlzLnZhbHVlVmFsaWRhdG9yLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0sICd1bmV4cGVjdGVkIG51bWJlciBvZiBwYXJhbWV0ZXJzIGZvciBQcm9wZXJ0eScgKTtcclxuXHJcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHZhbGlkYXRvciBmb3IgdGhlIHZhbHVlLCBub3QgZm9yIHRoZSBQcm9wZXJ0eSBpdHNlbGZcclxuICAgICAgdGhpcy52YWx1ZVZhbGlkYXRvci5waGV0aW9UeXBlID0gdGhpcy52YWx1ZVZhbGlkYXRvci5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIVsgMCBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFzc2VydGlvbnMgcmVnYXJkaW5nIHZhbHVlIHZhbGlkYXRpb25cclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG5cclxuICAgICAgVmFsaWRhdGlvbi52YWxpZGF0ZVZhbGlkYXRvciggdGhpcy52YWx1ZVZhbGlkYXRvciApO1xyXG5cclxuICAgICAgLy8gdmFsaWRhdGUgdGhlIGluaXRpYWwgdmFsdWUgYXMgd2VsbCBhcyBhbnkgY2hhbmdlcyBpbiB0aGUgZnV0dXJlXHJcbiAgICAgIHRoaXMubGluayggKCB2YWx1ZTogVCApID0+IHZhbGlkYXRlKCB2YWx1ZSwgdGhpcy52YWx1ZVZhbGlkYXRvciwgVkFMSURBVEVfT1BUSU9OU19GQUxTRSApICk7XHJcblxyXG4gICAgICBpZiAoIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIHRoaXMucGhldGlvU3RhdGUgJiYgVGFuZGVtLlZBTElEQVRJT04gKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggb3B0aW9ucy5waGV0aW9WYWx1ZVR5cGUgIT09IElPVHlwZS5PYmplY3RJTywgJ1N0YXRlZnVsIFBoRVQtaU8gUHJvcGVydGllcyBtdXN0IHNwZWNpZnkgYSBwaGV0aW9WYWx1ZVR5cGU6ICcgKyB0aGlzLnBoZXRpb0lEICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgY2FuIGJlIHNldCBleHRlcm5hbGx5LCB1c2luZyAudmFsdWU9IG9yIHNldCgpXHJcbiAgICovXHJcbiAgcHVibGljIGlzU2V0dGFibGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSB2YWx1ZS5cclxuICAgKiBZb3UgY2FuIGFsc28gdXNlIHRoZSBlczUgZ2V0dGVyIChwcm9wZXJ0eS52YWx1ZSkgYnV0IHRoaXMgbWVhbnMgaXMgcHJvdmlkZWQgZm9yIGlubmVyIGxvb3BzXHJcbiAgICogb3IgaW50ZXJuYWwgY29kZSB0aGF0IG11c3QgYmUgZmFzdC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0KCk6IFQge1xyXG4gICAgcmV0dXJuIHRoaXMudGlueVByb3BlcnR5LmdldCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWUgYW5kIG5vdGlmaWVzIGxpc3RlbmVycywgdW5sZXNzIGRlZmVycmVkIG9yIGRpc3Bvc2VkLiBZb3UgY2FuIGFsc28gdXNlIHRoZSBlczUgZ2V0dGVyXHJcbiAgICogKHByb3BlcnR5LnZhbHVlKSBidXQgdGhpcyBtZWFucyBpcyBwcm92aWRlZCBmb3IgaW5uZXIgbG9vcHMgb3IgaW50ZXJuYWwgY29kZSB0aGF0IG11c3QgYmUgZmFzdC4gSWYgdGhlIHZhbHVlXHJcbiAgICogaGFzbid0IGNoYW5nZWQsIHRoaXMgaXMgYSBuby1vcC4gIEZvciBQaEVULWlPIGluc3RydW1lbnRlZCBQcm9wZXJ0aWVzIHRoYXQgYXJlIHBoZXRpb1N0YXRlOiB0cnVlLCB0aGUgdmFsdWUgaXMgb25seVxyXG4gICAqIHNldCBieSB0aGUgc3RhdGUgYW5kIGNhbm5vdCBiZSBtb2RpZmllZCBieSBvdGhlciBjb2RlIHdoaWxlIGlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkgPT09IHRydWVcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgc2V0KCB2YWx1ZTogVCApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBzaW1HbG9iYWwgPSBfLmdldCggd2luZG93LCAncGhldC5qb2lzdC5zaW0nLCBudWxsICk7IC8vIHJldHVybnMgbnVsbCBpZiBnbG9iYWwgaXNuJ3QgZm91bmRcclxuXHJcbiAgICAvLyBzdGF0ZSBpcyBtYW5hZ2VkIGJ5IHRoZSBQaGV0aW9TdGF0ZUVuZ2luZS5cclxuICAgIC8vIFdlIHN0aWxsIHdhbnQgdG8gc2V0IFByb3BlcnRpZXMgd2hlbiBjbGVhcmluZyBkeW5hbWljIGVsZW1lbnRzLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoZXQtaW8vaXNzdWVzLzE5MDZcclxuICAgIGNvbnN0IHNldE1hbmFnZWRCeVBoZXRpb1N0YXRlID0gc2ltR2xvYmFsICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbUdsb2JhbC5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5ICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbUdsb2JhbC5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbUdsb2JhbC5pc0NsZWFyaW5nUGhldGlvRHluYW1pY0VsZW1lbnRzUHJvcGVydHkgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIXNpbUdsb2JhbC5pc0NsZWFyaW5nUGhldGlvRHluYW1pY0VsZW1lbnRzUHJvcGVydHkudmFsdWUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIHRoaXMucGhldGlvU3RhdGUgJiZcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhvd2V2ZXIsIERlcml2ZWRQcm9wZXJ0eSBzaG91bGQgYmUgYWJsZSB0byB1cGRhdGUgZHVyaW5nIFBoRVQtaU8gc3RhdGUgc2V0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZXR0YWJsZSgpO1xyXG5cclxuICAgIGlmICggIXNldE1hbmFnZWRCeVBoZXRpb1N0YXRlICkge1xyXG4gICAgICB0aGlzLnVuZ3VhcmRlZFNldCggdmFsdWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciB1c2FnZSBieSB0aGUgSU8gVHlwZSBkdXJpbmcgUGhFVC1pTyBzdGF0ZSBzZXR0aW5nLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCB1bmd1YXJkZWRTZXQoIHZhbHVlOiBUICk6IHZvaWQge1xyXG4gICAgaWYgKCAhdGhpcy5pc0Rpc3Bvc2VkICkge1xyXG4gICAgICBpZiAoIHRoaXMuaXNEZWZlcnJlZCApIHtcclxuICAgICAgICB0aGlzLmRlZmVycmVkVmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLmhhc0RlZmVycmVkVmFsdWUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCAhdGhpcy5lcXVhbHNWYWx1ZSggdmFsdWUgKSApIHtcclxuICAgICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMuZ2V0KCk7XHJcbiAgICAgICAgdGhpcy5zZXRQcm9wZXJ0eVZhbHVlKCB2YWx1ZSApO1xyXG4gICAgICAgIHRoaXMuX25vdGlmeUxpc3RlbmVycyggb2xkVmFsdWUgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0cyB0aGUgdmFsdWUgd2l0aG91dCBub3RpZnlpbmcgYW55IGxpc3RlbmVycy4gVGhpcyBpcyBhIHBsYWNlIHRvIG92ZXJyaWRlIGlmIGEgc3VidHlwZSBwZXJmb3JtcyBhZGRpdGlvbmFsIHdvcmtcclxuICAgKiB3aGVuIHNldHRpbmcgdGhlIHZhbHVlLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBzZXRQcm9wZXJ0eVZhbHVlKCB2YWx1ZTogVCApOiB2b2lkIHtcclxuICAgIHRoaXMudGlueVByb3BlcnR5LnNldFByb3BlcnR5VmFsdWUoIHZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgYW5kIG9ubHkgaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBlcXVhbHMgdGhlIHZhbHVlIG9mIHRoaXMgcHJvcGVydHlcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgZXF1YWxzVmFsdWUoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYXJlVmFsdWVzRXF1YWwoIHZhbHVlLCB0aGlzLmdldCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZWUgVGlueVByb3BlcnR5LmFyZVZhbHVlc0VxdWFsXHJcbiAgICovXHJcbiAgcHVibGljIGFyZVZhbHVlc0VxdWFsKCBhOiBULCBiOiBUICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudGlueVByb3BlcnR5LmFyZVZhbHVlc0VxdWFsKCBhLCBiICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBOT1RFOiBhIGZldyBzaW1zIGFyZSBjYWxsaW5nIHRoaXMgZXZlbiB0aG91Z2ggdGhleSBzaG91bGRuJ3RcclxuICAgKi9cclxuICBwcml2YXRlIF9ub3RpZnlMaXN0ZW5lcnMoIG9sZFZhbHVlOiBUIHwgbnVsbCApOiB2b2lkIHtcclxuICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5nZXQoKTtcclxuXHJcbiAgICAvLyBBbHRob3VnaCB0aGlzIGlzIG5vdCB0aGUgaWRpb21hdGljIHBhdHRlcm4gKHNpbmNlIGl0IGlzIGd1YXJkZWQgaW4gdGhlIHBoZXRpb1N0YXJ0RXZlbnQpLCB0aGlzIGZ1bmN0aW9uIGlzXHJcbiAgICAvLyBjYWxsZWQgc28gbWFueSB0aW1lcyB0aGF0IGl0IGlzIHdvcnRoIHRoZSBvcHRpbWl6YXRpb24gZm9yIFBoRVQgYnJhbmQuXHJcbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHRoaXMuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLnBoZXRpb1N0YXJ0RXZlbnQoIFJlYWRPbmx5UHJvcGVydHkuQ0hBTkdFRF9FVkVOVF9OQU1FLCB7XHJcbiAgICAgIGdldERhdGE6ICgpID0+IHtcclxuICAgICAgICBjb25zdCBwYXJhbWV0ZXJUeXBlID0gdGhpcy5waGV0aW9UeXBlLnBhcmFtZXRlclR5cGVzIVsgMCBdO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBvbGRWYWx1ZTogTnVsbGFibGVJTyggcGFyYW1ldGVyVHlwZSApLnRvU3RhdGVPYmplY3QoIG9sZFZhbHVlICksXHJcbiAgICAgICAgICBuZXdWYWx1ZTogcGFyYW1ldGVyVHlwZS50b1N0YXRlT2JqZWN0KCBuZXdWYWx1ZSApXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIG5vdGlmeSBsaXN0ZW5lcnMsIG9wdGlvbmFsbHkgZGV0ZWN0IGxvb3BzIHdoZXJlIHRoaXMgUHJvcGVydHkgaXMgc2V0IGFnYWluIGJlZm9yZSB0aGlzIGNvbXBsZXRlcy5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLm5vdGlmeWluZyB8fCB0aGlzLnJlZW50cmFudCxcclxuICAgICAgYHJlZW50cnkgZGV0ZWN0ZWQsIHZhbHVlPSR7bmV3VmFsdWV9LCBvbGRWYWx1ZT0ke29sZFZhbHVlfWAgKTtcclxuICAgIHRoaXMubm90aWZ5aW5nID0gdHJ1ZTtcclxuICAgIHRoaXMudGlueVByb3BlcnR5LmVtaXQoIG5ld1ZhbHVlLCBvbGRWYWx1ZSwgdGhpcyApOyAvLyBjYW5ub3QgdXNlIHRpbnlQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnMgYmVjYXVzZSBpdCB1c2VzIHRoZSB3cm9uZyB0aGlzXHJcbiAgICB0aGlzLm5vdGlmeWluZyA9IGZhbHNlO1xyXG5cclxuICAgIFRhbmRlbS5QSEVUX0lPX0VOQUJMRUQgJiYgdGhpcy5pc1BoZXRpb0luc3RydW1lbnRlZCgpICYmIHRoaXMucGhldGlvRW5kRXZlbnQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVzZSB0aGlzIG1ldGhvZCB3aGVuIG11dGF0aW5nIGEgdmFsdWUgKG5vdCByZXBsYWNpbmcgd2l0aCBhIG5ldyBpbnN0YW5jZSkgYW5kIHlvdSB3YW50IHRvIHNlbmQgbm90aWZpY2F0aW9ucyBhYm91dCB0aGUgY2hhbmdlLlxyXG4gICAqIFRoaXMgaXMgZGlmZmVyZW50IGZyb20gdGhlIG5vcm1hbCBheG9uIHN0cmF0ZWd5LCBidXQgbWF5IGJlIG5lY2Vzc2FyeSB0byBwcmV2ZW50IG1lbW9yeSBhbGxvY2F0aW9ucy5cclxuICAgKiBUaGlzIG1ldGhvZCBpcyB1bnNhZmUgZm9yIHJlbW92aW5nIGxpc3RlbmVycyBiZWNhdXNlIGl0IGFzc3VtZXMgdGhlIGxpc3RlbmVyIGxpc3Qgbm90IG1vZGlmaWVkLCB0byBzYXZlIGFub3RoZXIgYWxsb2NhdGlvblxyXG4gICAqIE9ubHkgcHJvdmlkZXMgdGhlIG5ldyByZWZlcmVuY2UgYXMgYSBjYWxsYmFjayAobm8gb2xkdmFsdWUpXHJcbiAgICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy82XHJcbiAgICovXHJcbiAgcHVibGljIG5vdGlmeUxpc3RlbmVyc1N0YXRpYygpOiB2b2lkIHtcclxuICAgIHRoaXMuX25vdGlmeUxpc3RlbmVycyggbnVsbCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogV2hlbiBkZWZlcnJlZCwgc2V0IHZhbHVlcyBkbyBub3QgdGFrZSBlZmZlY3Qgb3Igc2VuZCBvdXQgbm90aWZpY2F0aW9ucy4gIEFmdGVyIGRlZmVyIGVuZHMsIHRoZSBQcm9wZXJ0eSB0YWtlc1xyXG4gICAqIGl0cyBkZWZlcnJlZCB2YWx1ZSAoaWYgYW55KSwgYW5kIGEgZm9sbG93LXVwIGFjdGlvbiAocmV0dXJuIHZhbHVlKSBjYW4gYmUgaW52b2tlZCB0byBzZW5kIG91dCBub3RpZmljYXRpb25zXHJcbiAgICogb25jZSBvdGhlciBQcm9wZXJ0aWVzIGhhdmUgYWxzbyB0YWtlbiB0aGVpciBkZWZlcnJlZCB2YWx1ZXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gaXNEZWZlcnJlZCAtIHdoZXRoZXIgdGhlIFByb3BlcnR5IHNob3VsZCBiZSBkZWZlcnJlZCBvciBub3RcclxuICAgKiBAcmV0dXJucyAtIGZ1bmN0aW9uIHRvIG5vdGlmeSBsaXN0ZW5lcnMgYWZ0ZXIgY2FsbGluZyBzZXREZWZlcnJlZChmYWxzZSksXHJcbiAgICogICAgICAgICAgLSBudWxsIGlmIGlzRGVmZXJyZWQgaXMgdHJ1ZSwgb3IgaWYgdGhlIHZhbHVlIGlzIHVuY2hhbmdlZCBzaW5jZSBjYWxsaW5nIHNldERlZmVycmVkKHRydWUpXHJcbiAgICovXHJcbiAgcHVibGljIHNldERlZmVycmVkKCBpc0RlZmVycmVkOiBib29sZWFuICk6ICggKCkgPT4gdm9pZCApIHwgbnVsbCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkLCAnY2Fubm90IGRlZmVyIFByb3BlcnR5IGlmIGFscmVhZHkgZGlzcG9zZWQuJyApO1xyXG4gICAgaWYgKCBpc0RlZmVycmVkICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0RlZmVycmVkLCAnUHJvcGVydHkgYWxyZWFkeSBkZWZlcnJlZCcgKTtcclxuICAgICAgdGhpcy5pc0RlZmVycmVkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzRGVmZXJyZWQsICdQcm9wZXJ0eSB3YXNuXFwndCBkZWZlcnJlZCcgKTtcclxuICAgICAgdGhpcy5pc0RlZmVycmVkID0gZmFsc2U7XHJcblxyXG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHRoaXMuZ2V0KCk7XHJcblxyXG4gICAgICAvLyBUYWtlIHRoZSBuZXcgdmFsdWVcclxuICAgICAgaWYgKCB0aGlzLmhhc0RlZmVycmVkVmFsdWUgKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQcm9wZXJ0eVZhbHVlKCB0aGlzLmRlZmVycmVkVmFsdWUhICk7XHJcbiAgICAgICAgdGhpcy5oYXNEZWZlcnJlZFZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5kZWZlcnJlZFZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgdGhlIHZhbHVlIGhhcyBjaGFuZ2VkLCBwcmVwYXJlIHRvIHNlbmQgb3V0IG5vdGlmaWNhdGlvbnMgKGFmdGVyIGFsbCBvdGhlciBQcm9wZXJ0aWVzIGluIHRoaXMgdHJhbnNhY3Rpb25cclxuICAgICAgLy8gaGF2ZSB0aGVpciBmaW5hbCB2YWx1ZXMpXHJcbiAgICAgIGlmICggIXRoaXMuZXF1YWxzVmFsdWUoIG9sZFZhbHVlICkgKSB7XHJcbiAgICAgICAgcmV0dXJuICgpID0+ICF0aGlzLmlzRGlzcG9zZWQgJiYgdGhpcy5fbm90aWZ5TGlzdGVuZXJzKCBvbGRWYWx1ZSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbm8gYWN0aW9uIHRvIHNpZ25pZnkgY2hhbmdlXHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXQgdmFsdWUoKTogVCB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXQoKTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBzZXQgdmFsdWUoIG5ld1ZhbHVlOiBUICkge1xyXG4gICAgdGhpcy5zZXQoIG5ld1ZhbHVlICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBUaGlzIGZ1bmN0aW9uIHJlZ2lzdGVycyBhbiBvcmRlciBkZXBlbmRlbmN5IGJldHdlZW4gdGhpcyBQcm9wZXJ0eSBhbmQgYW5vdGhlci4gQmFzaWNhbGx5IHRoaXMgc2F5cyB0aGF0IHdoZW5cclxuICAgKiBzZXR0aW5nIFBoRVQtaU8gc3RhdGUsIGVhY2ggZGVwZW5kZW5jeSBtdXN0IHRha2UgaXRzIGZpbmFsIHZhbHVlIGJlZm9yZSB0aGlzIFByb3BlcnR5IGZpcmVzIGl0cyBub3RpZmljYXRpb25zLlxyXG4gICAqIFNlZSBwcm9wZXJ0eVN0YXRlSGFuZGxlclNpbmdsZXRvbi5yZWdpc3RlclBoZXRpb09yZGVyRGVwZW5kZW5jeSBhbmQgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzI3NiBmb3IgbW9yZSBpbmZvLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRQaGV0aW9TdGF0ZURlcGVuZGVuY2llcyggZGVwZW5kZW5jaWVzOiBBcnJheTxUUmVhZE9ubHlQcm9wZXJ0eTxJbnRlbnRpb25hbEFueT4+ICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggZGVwZW5kZW5jaWVzICksICdBcnJheSBleHBlY3RlZCcgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGRlcGVuZGVuY2llcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgZGVwZW5kZW5jeVByb3BlcnR5ID0gZGVwZW5kZW5jaWVzWyBpIF07XHJcblxyXG4gICAgICAvLyBvbmx5IGlmIHJ1bm5pbmcgaW4gUGhFVC1pTyBicmFuZCBhbmQgYm90aCBQcm9wZXJ0aWVzIGFyZSBpbnN0cnVtZW50aW5nXHJcbiAgICAgIGlmICggZGVwZW5kZW5jeVByb3BlcnR5IGluc3RhbmNlb2YgUmVhZE9ubHlQcm9wZXJ0eSAmJiBkZXBlbmRlbmN5UHJvcGVydHkuaXNQaGV0aW9JbnN0cnVtZW50ZWQoKSAmJiB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBkZXBlbmRlbmN5IHNob3VsZCB1bmRlZmVyICh0YWtpbmcgZGVmZXJyZWQgdmFsdWUpIGJlZm9yZSB0aGlzIFByb3BlcnR5IG5vdGlmaWVzLlxyXG4gICAgICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uLnJlZ2lzdGVyUGhldGlvT3JkZXJEZXBlbmRlbmN5KCBkZXBlbmRlbmN5UHJvcGVydHksIFByb3BlcnR5U3RhdGVQaGFzZS5VTkRFRkVSLCB0aGlzLCBQcm9wZXJ0eVN0YXRlUGhhc2UuTk9USUZZICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgbGlzdGVuZXIgYW5kIGNhbGxzIGl0IGltbWVkaWF0ZWx5LiBJZiBsaXN0ZW5lciBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQsIHRoaXMgaXMgYSBuby1vcC4gVGhlIGluaXRpYWxcclxuICAgKiBub3RpZmljYXRpb24gcHJvdmlkZXMgdGhlIGN1cnJlbnQgdmFsdWUgZm9yIG5ld1ZhbHVlIGFuZCBudWxsIGZvciBvbGRWYWx1ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBsaXN0ZW5lciAtIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhIG5ldyB2YWx1ZSwgb2xkIHZhbHVlLCBhbmQgdGhpcyBQcm9wZXJ0eSBhcyBhcmd1bWVudHNcclxuICAgKiBAcGFyYW0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGxpbmsoIGxpc3RlbmVyOiBQcm9wZXJ0eUxpbmtMaXN0ZW5lcjxUPiwgb3B0aW9ucz86IExpbmtPcHRpb25zICk6IHZvaWQge1xyXG4gICAgaWYgKCBvcHRpb25zICYmIG9wdGlvbnMucGhldGlvRGVwZW5kZW5jaWVzICkge1xyXG4gICAgICB0aGlzLmFkZFBoZXRpb1N0YXRlRGVwZW5kZW5jaWVzKCBvcHRpb25zLnBoZXRpb0RlcGVuZGVuY2llcyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudGlueVByb3BlcnR5LmFkZExpc3RlbmVyKCBsaXN0ZW5lciApOyAvLyBjYW5ub3QgdXNlIHRpbnlQcm9wZXJ0eS5saW5rKCkgYmVjYXVzZSBvZiB3cm9uZyB0aGlzXHJcbiAgICBsaXN0ZW5lciggdGhpcy5nZXQoKSwgbnVsbCwgdGhpcyApOyAvLyBudWxsIHNob3VsZCBiZSB1c2VkIHdoZW4gYW4gb2JqZWN0IGlzIGV4cGVjdGVkIGJ1dCB1bmF2YWlsYWJsZVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgbGlzdGVuZXIgdG8gdGhlIFByb3BlcnR5LCB3aXRob3V0IGNhbGxpbmcgaXQgYmFjayByaWdodCBhd2F5LiBUaGlzIGlzIHVzZWQgd2hlbiB5b3UgbmVlZCB0byByZWdpc3RlciBhXHJcbiAgICogbGlzdGVuZXIgd2l0aG91dCBhbiBpbW1lZGlhdGUgY2FsbGJhY2suXHJcbiAgICovXHJcbiAgcHVibGljIGxhenlMaW5rKCBsaXN0ZW5lcjogUHJvcGVydHlMYXp5TGlua0xpc3RlbmVyPFQ+LCBvcHRpb25zPzogTGlua09wdGlvbnMgKTogdm9pZCB7XHJcbiAgICBpZiAoIG9wdGlvbnMgJiYgb3B0aW9ucy5waGV0aW9EZXBlbmRlbmNpZXMgKSB7XHJcbiAgICAgIHRoaXMuYWRkUGhldGlvU3RhdGVEZXBlbmRlbmNpZXMoIG9wdGlvbnMucGhldGlvRGVwZW5kZW5jaWVzICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnRpbnlQcm9wZXJ0eS5sYXp5TGluayggbGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSBsaXN0ZW5lci4gSWYgbGlzdGVuZXIgaXMgbm90IHJlZ2lzdGVyZWQsIHRoaXMgaXMgYSBuby1vcC5cclxuICAgKi9cclxuICBwdWJsaWMgdW5saW5rKCBsaXN0ZW5lcjogUHJvcGVydHlMaXN0ZW5lcjxUPiApOiB2b2lkIHtcclxuICAgIHRoaXMudGlueVByb3BlcnR5LnVubGluayggbGlzdGVuZXIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycy4gSWYgbm8gbGlzdGVuZXJzIGFyZSByZWdpc3RlcmVkLCB0aGlzIGlzIGEgbm8tb3AuXHJcbiAgICovXHJcbiAgcHVibGljIHVubGlua0FsbCgpOiB2b2lkIHtcclxuICAgIHRoaXMudGlueVByb3BlcnR5LnVubGlua0FsbCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGlua3MgYW4gb2JqZWN0J3MgbmFtZWQgYXR0cmlidXRlIHRvIHRoaXMgcHJvcGVydHkuICBSZXR1cm5zIGEgaGFuZGxlIHNvIGl0IGNhbiBiZSByZW1vdmVkIHVzaW5nIFByb3BlcnR5LnVubGluaygpO1xyXG4gICAqIEV4YW1wbGU6IG1vZGVsVmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUodmlldywndmlzaWJsZScpO1xyXG4gICAqXHJcbiAgICogTk9URTogRHVwbGljYXRlZCB3aXRoIFRpbnlQcm9wZXJ0eS5saW5rQXR0cmlidXRlXHJcbiAgICovXHJcbiAgcHVibGljIGxpbmtBdHRyaWJ1dGUoIG9iamVjdDogSW50ZW50aW9uYWxBbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyApOiAoIHZhbHVlOiBUICkgPT4gdm9pZCB7XHJcbiAgICBjb25zdCBoYW5kbGUgPSAoIHZhbHVlOiBUICkgPT4geyBvYmplY3RbIGF0dHJpYnV0ZU5hbWUgXSA9IHZhbHVlOyB9O1xyXG4gICAgdGhpcy5saW5rKCBoYW5kbGUgKTtcclxuICAgIHJldHVybiBoYW5kbGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQcm92aWRlIHRvU3RyaW5nIGZvciBjb25zb2xlIGRlYnVnZ2luZywgc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjQ4NTYzMi92YWx1ZW9mLXZzLXRvc3RyaW5nLWluLWphdmFzY3JpcHRcclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgUHJvcGVydHkjJHt0aGlzLmlkfXske3RoaXMuZ2V0KCl9fWA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgZGVidWdnaW5nIGEgUHJvcGVydHkncyB2YWx1ZS4gSXQgcHJpbnRzIHRoZSBuZXcgdmFsdWUgb24gcmVnaXN0cmF0aW9uIGFuZCB3aGVuIGNoYW5nZWQuXHJcbiAgICogQHBhcmFtIG5hbWUgLSBkZWJ1ZyBuYW1lIHRvIGJlIHByaW50ZWQgb24gdGhlIGNvbnNvbGVcclxuICAgKiBAcmV0dXJucyAtIHRoZSBoYW5kbGUgdG8gdGhlIGxpbmtlZCBsaXN0ZW5lciBpbiBjYXNlIGl0IG5lZWRzIHRvIGJlIHJlbW92ZWQgbGF0ZXJcclxuICAgKi9cclxuICBwdWJsaWMgZGVidWcoIG5hbWU6IHN0cmluZyApOiAoIHZhbHVlOiBUICkgPT4gdm9pZCB7XHJcbiAgICBjb25zdCBsaXN0ZW5lciA9ICggdmFsdWU6IFQgKSA9PiBjb25zb2xlLmxvZyggbmFtZSwgdmFsdWUgKTtcclxuICAgIHRoaXMubGluayggbGlzdGVuZXIgKTtcclxuICAgIHJldHVybiBsaXN0ZW5lcjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc1ZhbHVlVmFsaWQoIHZhbHVlOiBUICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZ2V0VmFsaWRhdGlvbkVycm9yKCB2YWx1ZSApID09PSBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFZhbGlkYXRpb25FcnJvciggdmFsdWU6IFQgKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICByZXR1cm4gVmFsaWRhdGlvbi5nZXRWYWxpZGF0aW9uRXJyb3IoIHZhbHVlLCB0aGlzLnZhbHVlVmFsaWRhdG9yLCBWQUxJREFURV9PUFRJT05TX0ZBTFNFICk7XHJcbiAgfVxyXG5cclxuICAvLyBFbnN1cmVzIHRoYXQgdGhlIFByb3BlcnR5IGlzIGVsaWdpYmxlIGZvciBHQ1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIHVucmVnaXN0ZXIgYW55IG9yZGVyIGRlcGVuZGVuY2llcyBmb3IgdGhpcyBQcm9wZXJ0eSBmb3IgUGhFVC1pTyBzdGF0ZVxyXG4gICAgaWYgKCB0aGlzLmlzUGhldGlvSW5zdHJ1bWVudGVkKCkgKSB7XHJcbiAgICAgIHByb3BlcnR5U3RhdGVIYW5kbGVyU2luZ2xldG9uLnVucmVnaXN0ZXJPcmRlckRlcGVuZGVuY2llc0ZvclByb3BlcnR5KCB0aGlzICk7XHJcbiAgICB9XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gICAgdGhpcy50aW55UHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2hlY2tzIHdoZXRoZXIgYSBsaXN0ZW5lciBpcyByZWdpc3RlcmVkIHdpdGggdGhpcyBQcm9wZXJ0eVxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNMaXN0ZW5lciggbGlzdGVuZXI6IFByb3BlcnR5TGlua0xpc3RlbmVyPFQ+ICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMudGlueVByb3BlcnR5Lmhhc0xpc3RlbmVyKCBsaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycy5cclxuICAgKi9cclxuICBwcml2YXRlIGdldExpc3RlbmVyQ291bnQoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnRpbnlQcm9wZXJ0eS5nZXRMaXN0ZW5lckNvdW50KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbnZva2VzIGEgY2FsbGJhY2sgb25jZSBmb3IgZWFjaCBsaXN0ZW5lclxyXG4gICAqIEBwYXJhbSBjYWxsYmFjayAtIHRha2VzIHRoZSBsaXN0ZW5lciBhcyBhbiBhcmd1bWVudFxyXG4gICAqL1xyXG4gIHB1YmxpYyBmb3JFYWNoTGlzdGVuZXIoIGNhbGxiYWNrOiAoIHZhbHVlOiAoIC4uLmFyZ3M6IFsgVCwgVCB8IG51bGwsIFRpbnlQcm9wZXJ0eTxUPiB8IFJlYWRPbmx5UHJvcGVydHk8VD4gXSApID0+IHZvaWQgKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgdGhpcy50aW55UHJvcGVydHkuZm9yRWFjaExpc3RlbmVyKCBjYWxsYmFjayApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZXJlIGFyZSBhbnkgbGlzdGVuZXJzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBoYXNMaXN0ZW5lcnMoKTogYm9vbGVhbiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcmd1bWVudHMubGVuZ3RoID09PSAwLCAnUHJvcGVydHkuaGFzTGlzdGVuZXJzIHNob3VsZCBiZSBjYWxsZWQgd2l0aG91dCBhcmd1bWVudHMnICk7XHJcbiAgICByZXR1cm4gdGhpcy50aW55UHJvcGVydHkuaGFzTGlzdGVuZXJzKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLyoqXHJcbiAgICogQW4gb2JzZXJ2YWJsZSBQcm9wZXJ0eSB0aGF0IHRyaWdnZXJzIG5vdGlmaWNhdGlvbnMgd2hlbiB0aGUgdmFsdWUgY2hhbmdlcy5cclxuICAgKiBUaGlzIGNhY2hpbmcgaW1wbGVtZW50YXRpb24gc2hvdWxkIGJlIGtlcHQgaW4gc3luYyB3aXRoIHRoZSBvdGhlciBwYXJhbWV0cmljIElPIFR5cGUgY2FjaGluZyBpbXBsZW1lbnRhdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBQcm9wZXJ0eUlPPFQsIFN0YXRlVHlwZT4oIHBhcmFtZXRlclR5cGU6IElPVHlwZTxULCBTdGF0ZVR5cGU+ICk6IElPVHlwZSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwYXJhbWV0ZXJUeXBlLCAnUHJvcGVydHlJTyBuZWVkcyBwYXJhbWV0ZXJUeXBlJyApO1xyXG5cclxuICAgIGlmICggIWNhY2hlLmhhcyggcGFyYW1ldGVyVHlwZSApICkge1xyXG4gICAgICBjYWNoZS5zZXQoIHBhcmFtZXRlclR5cGUsIG5ldyBJT1R5cGU8UmVhZE9ubHlQcm9wZXJ0eTxUPiwgUmVhZE9ubHlQcm9wZXJ0eVN0YXRlPFN0YXRlVHlwZT4+KCBgUHJvcGVydHlJTzwke3BhcmFtZXRlclR5cGUudHlwZU5hbWV9PmAsIHtcclxuXHJcbiAgICAgICAgLy8gV2Ugd2FudCBQcm9wZXJ0eUlPIHRvIHdvcmsgZm9yIER5bmFtaWNQcm9wZXJ0eSBhbmQgRGVyaXZlZFByb3BlcnR5LCBidXQgdGhleSBleHRlbmQgUmVhZE9ubHlQcm9wZXJ0eVxyXG4gICAgICAgIHZhbHVlVHlwZTogUmVhZE9ubHlQcm9wZXJ0eSxcclxuICAgICAgICBkb2N1bWVudGF0aW9uOiAnT2JzZXJ2YWJsZSB2YWx1ZXMgdGhhdCBzZW5kIG91dCBub3RpZmljYXRpb25zIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuIFRoaXMgZGlmZmVycyBmcm9tIHRoZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAndHJhZGl0aW9uYWwgbGlzdGVuZXIgcGF0dGVybiBpbiB0aGF0IGFkZGVkIGxpc3RlbmVycyBhbHNvIHJlY2VpdmUgYSBjYWxsYmFjayB3aXRoIHRoZSBjdXJyZW50IHZhbHVlICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICd3aGVuIHRoZSBsaXN0ZW5lcnMgYXJlIHJlZ2lzdGVyZWQuIFRoaXMgaXMgYSB3aWRlbHktdXNlZCBwYXR0ZXJuIGluIFBoRVQtaU8gc2ltdWxhdGlvbnMuJyxcclxuICAgICAgICBtZXRob2RPcmRlcjogWyAnbGluaycsICdsYXp5TGluaycgXSxcclxuICAgICAgICBldmVudHM6IFsgUmVhZE9ubHlQcm9wZXJ0eS5DSEFOR0VEX0VWRU5UX05BTUUgXSxcclxuICAgICAgICBwYXJhbWV0ZXJUeXBlczogWyBwYXJhbWV0ZXJUeXBlIF0sXHJcbiAgICAgICAgdG9TdGF0ZU9iamVjdDogcHJvcGVydHkgPT4ge1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGFyYW1ldGVyVHlwZS50b1N0YXRlT2JqZWN0LCBgdG9TdGF0ZU9iamVjdCBkb2Vzbid0IGV4aXN0IGZvciAke3BhcmFtZXRlclR5cGUudHlwZU5hbWV9YCApO1xyXG4gICAgICAgICAgY29uc3Qgc3RhdGVPYmplY3Q6IFJlYWRPbmx5UHJvcGVydHlTdGF0ZTxTdGF0ZVR5cGU+ID0ge1xyXG4gICAgICAgICAgICB2YWx1ZTogcGFyYW1ldGVyVHlwZS50b1N0YXRlT2JqZWN0KCBwcm9wZXJ0eS52YWx1ZSApLFxyXG5cclxuICAgICAgICAgICAgLy8gT25seSBpbmNsdWRlIHZhbGlkVmFsdWVzIGlmIHNwZWNpZmllZCwgc28gdGhleSBvbmx5IHNob3cgdXAgaW4gUGhFVC1pTyBTdHVkaW8gd2hlbiBzdXBwbGllZC5cclxuICAgICAgICAgICAgdmFsaWRWYWx1ZXM6IHByb3BlcnR5LnZhbGlkVmFsdWVzID8gcHJvcGVydHkudmFsaWRWYWx1ZXMubWFwKCB2ID0+IHtcclxuICAgICAgICAgICAgICByZXR1cm4gcGFyYW1ldGVyVHlwZS50b1N0YXRlT2JqZWN0KCB2ICk7XHJcbiAgICAgICAgICAgIH0gKSA6IG51bGwsXHJcbiAgICAgICAgICAgIHVuaXRzOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApLnRvU3RhdGVPYmplY3QoIHByb3BlcnR5LnVuaXRzIClcclxuICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHN0YXRlT2JqZWN0O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXBwbHlTdGF0ZTogKCBwcm9wZXJ0eSwgc3RhdGVPYmplY3QgKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCB1bml0cyA9IE51bGxhYmxlSU8oIFN0cmluZ0lPICkuZnJvbVN0YXRlT2JqZWN0KCBzdGF0ZU9iamVjdC51bml0cyApO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydHkudW5pdHMgPT09IHVuaXRzLCAnUHJvcGVydHkgdW5pdHMgZG8gbm90IG1hdGNoJyApO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcHJvcGVydHkuaXNTZXR0YWJsZSgpLCAnUHJvcGVydHkgc2hvdWxkIGJlIHNldHRhYmxlJyApO1xyXG4gICAgICAgICAgcHJvcGVydHkudW5ndWFyZGVkU2V0KCBwYXJhbWV0ZXJUeXBlLmZyb21TdGF0ZU9iamVjdCggc3RhdGVPYmplY3QudmFsdWUgKSApO1xyXG5cclxuICAgICAgICAgIGlmICggc3RhdGVPYmplY3QudmFsaWRWYWx1ZXMgKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnR5LnZhbGlkVmFsdWVzID0gc3RhdGVPYmplY3QudmFsaWRWYWx1ZXMubWFwKCAoIHZhbGlkVmFsdWU6IFN0YXRlVHlwZSApID0+IHBhcmFtZXRlclR5cGUuZnJvbVN0YXRlT2JqZWN0KCB2YWxpZFZhbHVlICkgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgICAgICB2YWx1ZTogcGFyYW1ldGVyVHlwZSxcclxuICAgICAgICAgIHZhbGlkVmFsdWVzOiBOdWxsYWJsZUlPKCBBcnJheUlPKCBwYXJhbWV0ZXJUeXBlICkgKSxcclxuICAgICAgICAgIHVuaXRzOiBOdWxsYWJsZUlPKCBTdHJpbmdJTyApXHJcbiAgICAgICAgfSxcclxuICAgICAgICBtZXRob2RzOiB7XHJcbiAgICAgICAgICBnZXRWYWx1ZToge1xyXG4gICAgICAgICAgICByZXR1cm5UeXBlOiBwYXJhbWV0ZXJUeXBlLFxyXG4gICAgICAgICAgICBwYXJhbWV0ZXJUeXBlczogW10sXHJcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBSZWFkT25seVByb3BlcnR5LnByb3RvdHlwZS5nZXQsXHJcbiAgICAgICAgICAgIGRvY3VtZW50YXRpb246ICdHZXRzIHRoZSBjdXJyZW50IHZhbHVlLidcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBnZXRWYWxpZGF0aW9uRXJyb3I6IHtcclxuICAgICAgICAgICAgcmV0dXJuVHlwZTogTnVsbGFibGVJTyggU3RyaW5nSU8gKSxcclxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgcGFyYW1ldGVyVHlwZSBdLFxyXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogUmVhZE9ubHlQcm9wZXJ0eS5wcm90b3R5cGUuZ2V0VmFsaWRhdGlvbkVycm9yLFxyXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQ2hlY2tzIHRvIHNlZSBpZiBhIHByb3Bvc2VkIHZhbHVlIGlzIHZhbGlkLiBSZXR1cm5zIHRoZSBmaXJzdCB2YWxpZGF0aW9uIGVycm9yLCBvciBudWxsIGlmIHRoZSB2YWx1ZSBpcyB2YWxpZC4nXHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIHNldFZhbHVlOiB7XHJcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcclxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgcGFyYW1ldGVyVHlwZSBdLFxyXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogZnVuY3Rpb24oIHRoaXM6IFJlYWRPbmx5UHJvcGVydHk8dW5rbm93bj4sIHZhbHVlOiBUICkge1xyXG5cclxuICAgICAgICAgICAgICBjb25zdCB2YWxpZGF0aW9uRXJyb3IgPSBWYWxpZGF0aW9uLmdldFZhbGlkYXRpb25FcnJvciggdmFsdWUsIHRoaXMudmFsdWVWYWxpZGF0b3IsIFZBTElEQVRFX09QVElPTlNfRkFMU0UgKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKCB2YWxpZGF0aW9uRXJyb3IgKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoIGBWYWxpZGF0aW9uIGVycm9yOiAke3ZhbGlkYXRpb25FcnJvcn1gICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXQoIHZhbHVlICk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnU2V0cyB0aGUgdmFsdWUgb2YgdGhlIFByb3BlcnR5LiBJZiB0aGUgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBwcmV2aW91cyB2YWx1ZSwgbGlzdGVuZXJzIGFyZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ25vdGlmaWVkIHdpdGggdGhlIG5ldyB2YWx1ZS4nLFxyXG4gICAgICAgICAgICBpbnZvY2FibGVGb3JSZWFkT25seUVsZW1lbnRzOiBmYWxzZVxyXG4gICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICBsaW5rOiB7XHJcbiAgICAgICAgICAgIHJldHVyblR5cGU6IFZvaWRJTyxcclxuXHJcbiAgICAgICAgICAgIC8vIG9sZFZhbHVlIHdpbGwgc3RhcnQgYXMgXCJudWxsXCIgdGhlIGZpcnN0IHRpbWUgY2FsbGVkXHJcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIEZ1bmN0aW9uSU8oIFZvaWRJTywgWyBwYXJhbWV0ZXJUeXBlLCBOdWxsYWJsZUlPKCBwYXJhbWV0ZXJUeXBlICkgXSApIF0sXHJcbiAgICAgICAgICAgIGltcGxlbWVudGF0aW9uOiBSZWFkT25seVByb3BlcnR5LnByb3RvdHlwZS5saW5rLFxyXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQWRkcyBhIGxpc3RlbmVyIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuIE9uIHJlZ2lzdHJhdGlvbiwgdGhlIGxpc3RlbmVyIGlzICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnYWxzbyBjYWxsZWQgd2l0aCB0aGUgY3VycmVudCB2YWx1ZS4gVGhlIGxpc3RlbmVyIHRha2VzIHR3byBhcmd1bWVudHMsIHRoZSBuZXcgdmFsdWUgYW5kIHRoZSAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ByZXZpb3VzIHZhbHVlLidcclxuICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgbGF6eUxpbms6IHtcclxuICAgICAgICAgICAgcmV0dXJuVHlwZTogVm9pZElPLFxyXG5cclxuICAgICAgICAgICAgLy8gb2xkVmFsdWUgd2lsbCBzdGFydCBhcyBcIm51bGxcIiB0aGUgZmlyc3QgdGltZSBjYWxsZWRcclxuICAgICAgICAgICAgcGFyYW1ldGVyVHlwZXM6IFsgRnVuY3Rpb25JTyggVm9pZElPLCBbIHBhcmFtZXRlclR5cGUsIE51bGxhYmxlSU8oIHBhcmFtZXRlclR5cGUgKSBdICkgXSxcclxuICAgICAgICAgICAgaW1wbGVtZW50YXRpb246IFJlYWRPbmx5UHJvcGVydHkucHJvdG90eXBlLmxhenlMaW5rLFxyXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnQWRkcyBhIGxpc3RlbmVyIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuIFRoaXMgbWV0aG9kIGlzIGxpa2UgXCJsaW5rXCIsIGJ1dCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dpdGhvdXQgdGhlIGN1cnJlbnQtdmFsdWUgY2FsbGJhY2sgb24gcmVnaXN0cmF0aW9uLiBUaGUgbGlzdGVuZXIgdGFrZXMgdHdvIGFyZ3VtZW50cywgdGhlIG5ldyAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlIGFuZCB0aGUgcHJldmlvdXMgdmFsdWUuJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHVubGluazoge1xyXG4gICAgICAgICAgICByZXR1cm5UeXBlOiBWb2lkSU8sXHJcbiAgICAgICAgICAgIHBhcmFtZXRlclR5cGVzOiBbIEZ1bmN0aW9uSU8oIFZvaWRJTywgWyBwYXJhbWV0ZXJUeXBlIF0gKSBdLFxyXG4gICAgICAgICAgICBpbXBsZW1lbnRhdGlvbjogUmVhZE9ubHlQcm9wZXJ0eS5wcm90b3R5cGUudW5saW5rLFxyXG4gICAgICAgICAgICBkb2N1bWVudGF0aW9uOiAnUmVtb3ZlcyBhIGxpc3RlbmVyLidcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYWNoZS5nZXQoIHBhcmFtZXRlclR5cGUgKSE7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENIQU5HRURfRVZFTlRfTkFNRSA9ICdjaGFuZ2VkJztcclxufVxyXG5cclxuYXhvbi5yZWdpc3RlciggJ1JlYWRPbmx5UHJvcGVydHknLCBSZWFkT25seVByb3BlcnR5ICk7XHJc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