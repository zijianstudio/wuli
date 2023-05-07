// Copyright 2020-2023, University of Colorado Boulder

// createObservableArray conforms to the Proxy interface, which is polluted with `any` types.  Therefore we disable
// this rule for this file.
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Creates an object that has the same API as an Array, but also supports notifications and PhET-iO. When an item
 * is added or removed, the lengthProperty changes before elementAddedEmitter or elementRemovedEmitter emit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import arrayRemove from '../../phet-core/js/arrayRemove.js';
import assertMutuallyExclusiveOptions from '../../phet-core/js/assertMutuallyExclusiveOptions.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import PhetioObject from '../../tandem/js/PhetioObject.js';
import Tandem from '../../tandem/js/Tandem.js';
import ArrayIO from '../../tandem/js/types/ArrayIO.js';
import IOType from '../../tandem/js/types/IOType.js';
import axon from './axon.js';
import Emitter from './Emitter.js';
import NumberProperty from './NumberProperty.js';
import Validation from './Validation.js';

// NOTE: Is this up-to-date and correct? Looks like we tack on phet-io stuff depending on the phetioType.

// eslint-disable-line -- futureproof type param if we type this
// // We don't import because of the repo dependency

// Typed for internal usage

const createObservableArray = providedOptions => {
  assertMutuallyExclusiveOptions(providedOptions, ['length'], ['elements']);
  const options = optionize()({
    hasListenerOrderDependencies: false,
    // Also supports phetioType or validator options.  If both are supplied, only the phetioType is respected

    length: 0,
    elements: [],
    tandem: Tandem.OPTIONAL,
    phetioFeatured: false
  }, providedOptions);
  let emitterParameterOptions = null;
  if (options.phetioType) {
    assert && assert(options.phetioType.typeName.startsWith('ObservableArrayIO'));
    emitterParameterOptions = {
      name: 'value',
      phetioType: options.phetioType.parameterTypes[0]
    };
  }
  // NOTE: Improve with Validation
  else if (!Validation.getValidatorValidationError(options)) {
    const validator = _.pick(options, Validation.VALIDATOR_KEYS);
    emitterParameterOptions = merge({
      name: 'value'
    }, validator);
  } else {
    emitterParameterOptions = merge({
      name: 'value'
    }, {
      isValidValue: _.stubTrue
    });
  }

  // notifies when an element has been added
  const elementAddedEmitter = new Emitter({
    tandem: options.tandem.createTandem('elementAddedEmitter'),
    parameters: [emitterParameterOptions],
    phetioReadOnly: true,
    phetioFeatured: options.phetioFeatured,
    hasListenerOrderDependencies: options.hasListenerOrderDependencies
  });

  // notifies when an element has been removed
  const elementRemovedEmitter = new Emitter({
    tandem: options.tandem.createTandem('elementRemovedEmitter'),
    parameters: [emitterParameterOptions],
    phetioReadOnly: true,
    phetioFeatured: options.phetioFeatured,
    hasListenerOrderDependencies: options.hasListenerOrderDependencies
  });

  // observe this, but don't set it. Updated when Array modifiers are called (except array.length=...)
  const lengthProperty = new NumberProperty(0, {
    numberType: 'Integer',
    tandem: options.tandem.createTandem('lengthProperty'),
    phetioReadOnly: true,
    phetioFeatured: options.phetioFeatured
  });

  // The underlying array which is wrapped by the Proxy
  const targetArray = [];

  // Verify that lengthProperty is updated before listeners are notified, but not when setting PhET-iO State,
  // This is because we cannot specify ordering dependencies between Properties and ObservableArrays,
  // TODO: Maybe this can be improved when we have better support for this in https://github.com/phetsims/phet-io/issues/1661
  assert && elementAddedEmitter.addListener(() => {
    if (assert) {
      const simGlobal = _.get(window, 'phet.joist.sim', null); // returns null if global isn't found

      if (!simGlobal || !simGlobal.isSettingPhetioStateProperty.value) {
        assert && assert(lengthProperty.value === targetArray.length, 'lengthProperty out of sync while adding element');
      }
    }
  });
  assert && elementRemovedEmitter.addListener(() => {
    if (assert) {
      const simGlobal = _.get(window, 'phet.joist.sim', null); // returns null if global isn't found

      if (!simGlobal || !simGlobal.isSettingPhetioStateProperty.value) {
        assert && assert(lengthProperty.value === targetArray.length, 'lengthProperty out of sync while removing element');
      }
    }
  });

  // The Proxy which will intercept method calls and trigger notifications.
  const observableArray = new Proxy(targetArray, {
    /**
     * Trap for getting a property or method.
     * @param array - the targetArray
     * @param key
     * @param receiver
     * @returns - the requested value
     */
    get: function (array, key, receiver) {
      assert && assert(array === targetArray, 'array should match the targetArray');
      if (methods.hasOwnProperty(key)) {
        return methods[key];
      } else {
        return Reflect.get(array, key, receiver);
      }
    },
    /**
     * Trap for setting a property value.
     * @param array - the targetArray
     * @param key
     * @param newValue
     * @returns - success
     */
    set: function (array, key, newValue) {
      assert && assert(array === targetArray, 'array should match the targetArray');
      const oldValue = array[key];
      let removedElements = null;

      // See which items are removed
      if (key === 'length') {
        removedElements = array.slice(newValue);
      }
      const returnValue = Reflect.set(array, key, newValue);

      // If we're using the bracket operator [index] of Array, then parse the index between the brackets.
      const numberKey = Number(key);
      if (Number.isInteger(numberKey) && numberKey >= 0 && oldValue !== newValue) {
        lengthProperty.value = array.length;
        if (oldValue !== undefined) {
          elementRemovedEmitter.emit(array[key]);
        }
        if (newValue !== undefined) {
          elementAddedEmitter.emit(newValue);
        }
      } else if (key === 'length') {
        lengthProperty.value = newValue;
        assert && assert(removedElements, 'removedElements should be defined for key===length');
        removedElements && removedElements.forEach(element => elementRemovedEmitter.emit(element));
      }
      return returnValue;
    },
    /**
     * This is the trap for the delete operator.
     */
    deleteProperty: function (array, key) {
      assert && assert(array === targetArray, 'array should match the targetArray');

      // If we're using the bracket operator [index] of Array, then parse the index between the brackets.
      const numberKey = Number(key);
      let removed;
      if (Number.isInteger(numberKey) && numberKey >= 0) {
        removed = array[key];
      }
      const returnValue = Reflect.deleteProperty(array, key);
      if (removed !== undefined) {
        elementRemovedEmitter.emit(removed);
      }
      return returnValue;
    }
  });
  observableArray.targetArray = targetArray;
  observableArray.elementAddedEmitter = elementAddedEmitter;
  observableArray.elementRemovedEmitter = elementRemovedEmitter;
  observableArray.lengthProperty = lengthProperty;
  const init = () => {
    if (options.length >= 0) {
      observableArray.length = options.length;
    }
    if (options.elements.length > 0) {
      Array.prototype.push.apply(observableArray, options.elements);
    }
  };
  init();

  //TODO https://github.com/phetsims/axon/issues/334 Move to "prototype" above or drop support
  observableArray.reset = () => {
    observableArray.length = 0;
    init();
  };

  /******************************************
   * PhET-iO support
   *******************************************/
  if (options.tandem.supplied) {
    assert && assert(options.phetioType);
    observableArray.phetioElementType = options.phetioType.parameterTypes[0];

    // for managing state in phet-io
    // Use the same tandem and phetioState options so it can "masquerade" as the real object.  When PhetioObject is a mixin this can be changed.
    observableArray._observableArrayPhetioObject = new ObservableArrayPhetioObject(observableArray, options);
  }
  return observableArray;
};

/**
 * Manages state save/load. This implementation uses Proxy and hence cannot be instrumented as a PhetioObject.  This type
 * provides that functionality.
 */
class ObservableArrayPhetioObject extends PhetioObject {
  // internal, don't use

  /**
   * @param observableArray
   * @param [providedOptions] - same as the options to the parent ObservableArrayDef
   */
  constructor(observableArray, providedOptions) {
    super(providedOptions);
    this.observableArray = observableArray;
  }
}

// Methods shared by all ObservableArrayDef instances
const methods = {
  /******************************************
   * Overridden Array methods
   *******************************************/

  pop(...args) {
    const thisArray = this;
    const initialLength = thisArray.targetArray.length;
    const returnValue = Array.prototype.pop.apply(thisArray.targetArray, args);
    thisArray.lengthProperty.value = thisArray.length;
    initialLength > 0 && thisArray.elementRemovedEmitter.emit(returnValue);
    return returnValue;
  },
  shift(...args) {
    const thisArray = this;
    const initialLength = thisArray.targetArray.length;
    const returnValue = Array.prototype.shift.apply(thisArray.targetArray, args);
    thisArray.lengthProperty.value = thisArray.length;
    initialLength > 0 && thisArray.elementRemovedEmitter.emit(returnValue);
    return returnValue;
  },
  push(...args) {
    const thisArray = this;
    const returnValue = Array.prototype.push.apply(thisArray.targetArray, args);
    thisArray.lengthProperty.value = thisArray.length;
    for (let i = 0; i < arguments.length; i++) {
      thisArray.elementAddedEmitter.emit(args[i]);
    }
    return returnValue;
  },
  unshift(...args) {
    const thisArray = this;
    const returnValue = Array.prototype.unshift.apply(thisArray.targetArray, args);
    thisArray.lengthProperty.value = thisArray.length;
    for (let i = 0; i < args.length; i++) {
      thisArray.elementAddedEmitter.emit(args[i]);
    }
    return returnValue;
  },
  splice(...args) {
    const thisArray = this;
    const returnValue = Array.prototype.splice.apply(thisArray.targetArray, args);
    thisArray.lengthProperty.value = thisArray.length;
    const deletedElements = returnValue;
    for (let i = 2; i < args.length; i++) {
      thisArray.elementAddedEmitter.emit(args[i]);
    }
    deletedElements.forEach(deletedElement => thisArray.elementRemovedEmitter.emit(deletedElement));
    return returnValue;
  },
  copyWithin(...args) {
    const thisArray = this;
    const before = thisArray.targetArray.slice();
    const returnValue = Array.prototype.copyWithin.apply(thisArray.targetArray, args);
    reportDifference(before, thisArray);
    return returnValue;
  },
  fill(...args) {
    const thisArray = this;
    const before = thisArray.targetArray.slice();
    const returnValue = Array.prototype.fill.apply(thisArray.targetArray, args);
    reportDifference(before, thisArray);
    return returnValue;
  },
  /******************************************
   * For compatibility with ObservableArrayDef
   * TODO https://github.com/phetsims/axon/issues/334 consider deleting after migration
   * TODO https://github.com/phetsims/axon/issues/334 if not deleted, rename 'Item' with 'Element'
   *******************************************/
  get: function (index) {
    return this[index];
  },
  addItemAddedListener: function (listener) {
    this.elementAddedEmitter.addListener(listener);
  },
  removeItemAddedListener: function (listener) {
    this.elementAddedEmitter.removeListener(listener);
  },
  addItemRemovedListener: function (listener) {
    this.elementRemovedEmitter.addListener(listener);
  },
  removeItemRemovedListener: function (listener) {
    this.elementRemovedEmitter.removeListener(listener);
  },
  add: function (element) {
    this.push(element);
  },
  addAll: function (elements) {
    this.push(...elements);
  },
  remove: function (element) {
    arrayRemove(this, element);
  },
  removeAll: function (elements) {
    elements.forEach(element => arrayRemove(this, element));
  },
  clear: function () {
    while (this.length > 0) {
      this.pop();
    }
  },
  count: function (predicate) {
    let count = 0;
    for (let i = 0; i < this.length; i++) {
      if (predicate(this[i])) {
        count++;
      }
    }
    return count;
  },
  find: function (predicate, fromIndex) {
    assert && fromIndex !== undefined && assert(typeof fromIndex === 'number', 'fromIndex must be numeric, if provided');
    assert && typeof fromIndex === 'number' && assert(fromIndex >= 0 && fromIndex < this.length, `fromIndex out of bounds: ${fromIndex}`);
    return _.find(this, predicate, fromIndex);
  },
  shuffle: function (random) {
    assert && assert(random, 'random must be supplied');

    // preserve the same _array reference in case any clients got a reference to it with getArray()
    const shuffled = random.shuffle(this);

    // Act on the targetArray so that removal and add notifications aren't sent.
    this.targetArray.length = 0;
    Array.prototype.push.apply(this.targetArray, shuffled);
  },
  // TODO https://github.com/phetsims/axon/issues/334 This also seems important to eliminate
  getArrayCopy: function () {
    return this.slice();
  },
  dispose: function () {
    const thisArray = this;
    thisArray.elementAddedEmitter.dispose();
    thisArray.elementRemovedEmitter.dispose();
    thisArray.lengthProperty.dispose();
    thisArray._observableArrayPhetioObject && thisArray._observableArrayPhetioObject.dispose();
  },
  /******************************************
   * PhET-iO
   *******************************************/
  toStateObject: function () {
    return {
      array: this.map(item => this.phetioElementType.toStateObject(item))
    };
  },
  applyState: function (stateObject) {
    this.length = 0;
    const elements = stateObject.array.map(paramStateObject => this.phetioElementType.fromStateObject(paramStateObject));
    this.push(...elements);
  }
};

/**
 * For copyWithin and fill, which have more complex behavior, we treat the array as a black box, making a shallow copy
 * before the operation in order to identify what has been added and removed.
 */
const reportDifference = (shallowCopy, observableArray) => {
  const before = shallowCopy;
  const after = observableArray.targetArray.slice();
  for (let i = 0; i < before.length; i++) {
    const beforeElement = before[i];
    const afterIndex = after.indexOf(beforeElement);
    if (afterIndex >= 0) {
      before.splice(i, 1);
      after.splice(afterIndex, 1);
      i--;
    }
  }
  before.forEach(element => observableArray.elementRemovedEmitter.emit(element));
  after.forEach(element => observableArray.elementAddedEmitter.emit(element));
};

// {Map.<cacheKey:function(new:ObservableArrayIO), function(new:ObservableArrayIO)>} - Cache each parameterized ObservableArrayIO
// based on the parameter type, so that it is only created once.
const cache = new Map();

/**
 * ObservableArrayIO is the IO Type for ObservableArrayDef. It delegates most of its implementation to ObservableArrayDef.
 * Instead of being a parametric type, it leverages the phetioElementType on ObservableArrayDef.
 */
const ObservableArrayIO = parameterType => {
  if (!cache.has(parameterType)) {
    cache.set(parameterType, new IOType(`ObservableArrayIO<${parameterType.typeName}>`, {
      valueType: ObservableArrayPhetioObject,
      parameterTypes: [parameterType],
      toStateObject: observableArrayPhetioObject => observableArrayPhetioObject.observableArray.toStateObject(),
      applyState: (observableArrayPhetioObject, state) => observableArrayPhetioObject.observableArray.applyState(state),
      stateSchema: {
        array: ArrayIO(parameterType)
      }
    }));
  }
  return cache.get(parameterType);
};
createObservableArray.ObservableArrayIO = ObservableArrayIO;
axon.register('createObservableArray', createObservableArray);
export default createObservableArray;
export { ObservableArrayIO };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsImFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyIsIm1lcmdlIiwib3B0aW9uaXplIiwiUGhldGlvT2JqZWN0IiwiVGFuZGVtIiwiQXJyYXlJTyIsIklPVHlwZSIsImF4b24iLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJWYWxpZGF0aW9uIiwiY3JlYXRlT2JzZXJ2YWJsZUFycmF5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXMiLCJsZW5ndGgiLCJlbGVtZW50cyIsInRhbmRlbSIsIk9QVElPTkFMIiwicGhldGlvRmVhdHVyZWQiLCJlbWl0dGVyUGFyYW1ldGVyT3B0aW9ucyIsInBoZXRpb1R5cGUiLCJhc3NlcnQiLCJ0eXBlTmFtZSIsInN0YXJ0c1dpdGgiLCJuYW1lIiwicGFyYW1ldGVyVHlwZXMiLCJnZXRWYWxpZGF0b3JWYWxpZGF0aW9uRXJyb3IiLCJ2YWxpZGF0b3IiLCJfIiwicGljayIsIlZBTElEQVRPUl9LRVlTIiwiaXNWYWxpZFZhbHVlIiwic3R1YlRydWUiLCJlbGVtZW50QWRkZWRFbWl0dGVyIiwiY3JlYXRlVGFuZGVtIiwicGFyYW1ldGVycyIsInBoZXRpb1JlYWRPbmx5IiwiZWxlbWVudFJlbW92ZWRFbWl0dGVyIiwibGVuZ3RoUHJvcGVydHkiLCJudW1iZXJUeXBlIiwidGFyZ2V0QXJyYXkiLCJhZGRMaXN0ZW5lciIsInNpbUdsb2JhbCIsImdldCIsIndpbmRvdyIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJ2YWx1ZSIsIm9ic2VydmFibGVBcnJheSIsIlByb3h5IiwiYXJyYXkiLCJrZXkiLCJyZWNlaXZlciIsIm1ldGhvZHMiLCJoYXNPd25Qcm9wZXJ0eSIsIlJlZmxlY3QiLCJzZXQiLCJuZXdWYWx1ZSIsIm9sZFZhbHVlIiwicmVtb3ZlZEVsZW1lbnRzIiwic2xpY2UiLCJyZXR1cm5WYWx1ZSIsIm51bWJlcktleSIsIk51bWJlciIsImlzSW50ZWdlciIsInVuZGVmaW5lZCIsImVtaXQiLCJmb3JFYWNoIiwiZWxlbWVudCIsImRlbGV0ZVByb3BlcnR5IiwicmVtb3ZlZCIsImluaXQiLCJBcnJheSIsInByb3RvdHlwZSIsInB1c2giLCJhcHBseSIsInJlc2V0Iiwic3VwcGxpZWQiLCJwaGV0aW9FbGVtZW50VHlwZSIsIl9vYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3QiLCJPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3QiLCJjb25zdHJ1Y3RvciIsInBvcCIsImFyZ3MiLCJ0aGlzQXJyYXkiLCJpbml0aWFsTGVuZ3RoIiwic2hpZnQiLCJpIiwiYXJndW1lbnRzIiwidW5zaGlmdCIsInNwbGljZSIsImRlbGV0ZWRFbGVtZW50cyIsImRlbGV0ZWRFbGVtZW50IiwiY29weVdpdGhpbiIsImJlZm9yZSIsInJlcG9ydERpZmZlcmVuY2UiLCJmaWxsIiwiaW5kZXgiLCJhZGRJdGVtQWRkZWRMaXN0ZW5lciIsImxpc3RlbmVyIiwicmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsImFkZEl0ZW1SZW1vdmVkTGlzdGVuZXIiLCJyZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyIiwiYWRkIiwiYWRkQWxsIiwicmVtb3ZlIiwicmVtb3ZlQWxsIiwiY2xlYXIiLCJjb3VudCIsInByZWRpY2F0ZSIsImZpbmQiLCJmcm9tSW5kZXgiLCJzaHVmZmxlIiwicmFuZG9tIiwic2h1ZmZsZWQiLCJnZXRBcnJheUNvcHkiLCJkaXNwb3NlIiwidG9TdGF0ZU9iamVjdCIsIm1hcCIsIml0ZW0iLCJhcHBseVN0YXRlIiwic3RhdGVPYmplY3QiLCJwYXJhbVN0YXRlT2JqZWN0IiwiZnJvbVN0YXRlT2JqZWN0Iiwic2hhbGxvd0NvcHkiLCJhZnRlciIsImJlZm9yZUVsZW1lbnQiLCJhZnRlckluZGV4IiwiaW5kZXhPZiIsImNhY2hlIiwiTWFwIiwiT2JzZXJ2YWJsZUFycmF5SU8iLCJwYXJhbWV0ZXJUeXBlIiwiaGFzIiwidmFsdWVUeXBlIiwib2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0Iiwic3RhdGUiLCJzdGF0ZVNjaGVtYSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiY3JlYXRlT2JzZXJ2YWJsZUFycmF5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLy8gY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGNvbmZvcm1zIHRvIHRoZSBQcm94eSBpbnRlcmZhY2UsIHdoaWNoIGlzIHBvbGx1dGVkIHdpdGggYGFueWAgdHlwZXMuICBUaGVyZWZvcmUgd2UgZGlzYWJsZVxyXG4vLyB0aGlzIHJ1bGUgZm9yIHRoaXMgZmlsZS5cclxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xyXG4vKipcclxuICogQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBoYXMgdGhlIHNhbWUgQVBJIGFzIGFuIEFycmF5LCBidXQgYWxzbyBzdXBwb3J0cyBub3RpZmljYXRpb25zIGFuZCBQaEVULWlPLiBXaGVuIGFuIGl0ZW1cclxuICogaXMgYWRkZWQgb3IgcmVtb3ZlZCwgdGhlIGxlbmd0aFByb3BlcnR5IGNoYW5nZXMgYmVmb3JlIGVsZW1lbnRBZGRlZEVtaXR0ZXIgb3IgZWxlbWVudFJlbW92ZWRFbWl0dGVyIGVtaXQuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IGFycmF5UmVtb3ZlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9hcnJheVJlbW92ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IGFzc2VydE11dHVhbGx5RXhjbHVzaXZlT3B0aW9ucyBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXNzZXJ0TXV0dWFsbHlFeGNsdXNpdmVPcHRpb25zLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QgZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBBcnJheUlPIGZyb20gJy4uLy4uL3RhbmRlbS9qcy90eXBlcy9BcnJheUlPLmpzJztcclxuaW1wb3J0IElPVHlwZSBmcm9tICcuLi8uLi90YW5kZW0vanMvdHlwZXMvSU9UeXBlLmpzJztcclxuaW1wb3J0IGF4b24gZnJvbSAnLi9heG9uLmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4vTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmFsaWRhdGlvbiBmcm9tICcuL1ZhbGlkYXRpb24uanMnO1xyXG5pbXBvcnQgVEVtaXR0ZXIgZnJvbSAnLi9URW1pdHRlci5qcyc7XHJcblxyXG4vLyBOT1RFOiBJcyB0aGlzIHVwLXRvLWRhdGUgYW5kIGNvcnJlY3Q/IExvb2tzIGxpa2Ugd2UgdGFjayBvbiBwaGV0LWlvIHN0dWZmIGRlcGVuZGluZyBvbiB0aGUgcGhldGlvVHlwZS5cclxudHlwZSBPYnNlcnZhYmxlQXJyYXlMaXN0ZW5lcjxUPiA9ICggZWxlbWVudDogVCApID0+IHZvaWQ7XHJcbnR5cGUgUHJlZGljYXRlPFQ+ID0gKCBlbGVtZW50OiBUICkgPT4gYm9vbGVhbjtcclxudHlwZSBPYnNlcnZhYmxlQXJyYXlTdGF0ZU9iamVjdDxUPiA9IHsgYXJyYXk6IGFueVtdIH07IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgLS0gZnV0dXJlcHJvb2YgdHlwZSBwYXJhbSBpZiB3ZSB0eXBlIHRoaXNcclxudHlwZSBGYWtlUmFuZG9tPFQ+ID0geyBzaHVmZmxlOiAoIGFycjogVFtdICkgPT4gVFtdIH07IC8vIC8vIFdlIGRvbid0IGltcG9ydCBiZWNhdXNlIG9mIHRoZSByZXBvIGRlcGVuZGVuY3lcclxuZXhwb3J0IHR5cGUgT2JzZXJ2YWJsZUFycmF5T3B0aW9uczxUPiA9IHtcclxuICBsZW5ndGg/OiBudW1iZXI7XHJcbiAgZWxlbWVudHM/OiBUW107XHJcbiAgaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llcz86IGJvb2xlYW47IC8vIFNlZSBUaW55RW1pdHRlci5oYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzXHJcbiAgdGFuZGVtPzogVGFuZGVtO1xyXG5cclxuICAvLyBQb3NzaWJseSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgRW1pdHRlcnNcclxuICBwaGV0aW9UeXBlPzogSU9UeXBlO1xyXG4gIHBoZXRpb1N0YXRlPzogYm9vbGVhbjtcclxuICBwaGV0aW9Eb2N1bWVudGF0aW9uPzogc3RyaW5nO1xyXG4gIHBoZXRpb0ZlYXR1cmVkPzogYm9vbGVhbjtcclxufTtcclxudHlwZSBPYnNlcnZhYmxlQXJyYXk8VD4gPSB7XHJcbiAgZ2V0OiAoIGluZGV4OiBudW1iZXIgKSA9PiBUO1xyXG4gIGFkZEl0ZW1BZGRlZExpc3RlbmVyOiAoIGxpc3RlbmVyOiBPYnNlcnZhYmxlQXJyYXlMaXN0ZW5lcjxUPiApID0+IHZvaWQ7XHJcbiAgcmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXI6ICggbGlzdGVuZXI6IE9ic2VydmFibGVBcnJheUxpc3RlbmVyPFQ+ICkgPT4gdm9pZDtcclxuICBhZGRJdGVtUmVtb3ZlZExpc3RlbmVyOiAoIGxpc3RlbmVyOiBPYnNlcnZhYmxlQXJyYXlMaXN0ZW5lcjxUPiApID0+IHZvaWQ7XHJcbiAgcmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lcjogKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8VD4gKSA9PiB2b2lkO1xyXG4gIGFkZDogKCBlbGVtZW50OiBUICkgPT4gdm9pZDtcclxuICBhZGRBbGw6ICggZWxlbWVudHM6IFRbXSApID0+IHZvaWQ7XHJcbiAgcmVtb3ZlOiAoIGVsZW1lbnQ6IFQgKSA9PiB2b2lkO1xyXG4gIHJlbW92ZUFsbDogKCBlbGVtZW50czogVFtdICkgPT4gdm9pZDtcclxuICBjbGVhcjogKCkgPT4gdm9pZDtcclxuICBjb3VudDogKCBwcmVkaWNhdGU6IFByZWRpY2F0ZTxUPiApID0+IG51bWJlcjtcclxuICBmaW5kOiAoIHByZWRpY2F0ZTogUHJlZGljYXRlPFQ+LCBmcm9tSW5kZXg/OiBudW1iZXIgKSA9PiBUIHwgdW5kZWZpbmVkO1xyXG4gIHNodWZmbGU6ICggcmFuZG9tOiBGYWtlUmFuZG9tPFQ+ICkgPT4gdm9pZDtcclxuICBnZXRBcnJheUNvcHk6ICgpID0+IFRbXTtcclxuICBkaXNwb3NlOiAoKSA9PiB2b2lkO1xyXG4gIHRvU3RhdGVPYmplY3Q6ICgpID0+IE9ic2VydmFibGVBcnJheVN0YXRlT2JqZWN0PFQ+O1xyXG4gIGFwcGx5U3RhdGU6ICggc3RhdGU6IE9ic2VydmFibGVBcnJheVN0YXRlT2JqZWN0PFQ+ICkgPT4gdm9pZDtcclxuXHJcbiAgLy8gbGlzdGVuIG9ubHkgcGxlYXNlXHJcbiAgZWxlbWVudEFkZGVkRW1pdHRlcjogVEVtaXR0ZXI8WyBUIF0+O1xyXG4gIGVsZW1lbnRSZW1vdmVkRW1pdHRlcjogVEVtaXR0ZXI8WyBUIF0+O1xyXG4gIGxlbmd0aFByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgLy9UT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8zMzQgTW92ZSB0byBcInByb3RvdHlwZVwiIGFib3ZlIG9yIGRyb3Agc3VwcG9ydFxyXG4gIHJlc2V0OiAoKSA9PiB2b2lkO1xyXG5cclxuICAvLyBQb3NzaWJseSBwYXNzZWQgdGhyb3VnaCB0byB0aGUgRW1pdHRlclxyXG4gIHBoZXRpb0VsZW1lbnRUeXBlPzogSU9UeXBlO1xyXG59ICYgVFtdO1xyXG5cclxuLy8gVHlwZWQgZm9yIGludGVybmFsIHVzYWdlXHJcbnR5cGUgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxUPiA9IHtcclxuICAvLyBNYWtlIGl0IHBvc3NpYmxlIHRvIHVzZSB0aGUgdGFyZ2V0QXJyYXkgaW4gdGhlIG92ZXJyaWRkZW4gbWV0aG9kcy5cclxuICB0YXJnZXRBcnJheTogVFtdO1xyXG5cclxuICBfb2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0PzogT2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0PFQ+O1xyXG59ICYgT2JzZXJ2YWJsZUFycmF5PFQ+O1xyXG5cclxudHlwZSBTcGVjaWZpZWRPYnNlcnZhYmxlQXJyYXlPcHRpb25zPFQ+ID0gU3RyaWN0T21pdDxPYnNlcnZhYmxlQXJyYXlPcHRpb25zPFQ+LCAncGhldGlvVHlwZScgfCAncGhldGlvU3RhdGUnIHwgJ3BoZXRpb0RvY3VtZW50YXRpb24nPjtcclxuXHJcbmNvbnN0IGNyZWF0ZU9ic2VydmFibGVBcnJheSA9IDxUPiggcHJvdmlkZWRPcHRpb25zPzogT2JzZXJ2YWJsZUFycmF5T3B0aW9uczxUPiApOiBPYnNlcnZhYmxlQXJyYXk8VD4gPT4ge1xyXG5cclxuICBhc3NlcnRNdXR1YWxseUV4Y2x1c2l2ZU9wdGlvbnMoIHByb3ZpZGVkT3B0aW9ucywgWyAnbGVuZ3RoJyBdLCBbICdlbGVtZW50cycgXSApO1xyXG5cclxuICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPE9ic2VydmFibGVBcnJheU9wdGlvbnM8VD4sIFNwZWNpZmllZE9ic2VydmFibGVBcnJheU9wdGlvbnM8VD4+KCkoIHtcclxuXHJcbiAgICBoYXNMaXN0ZW5lck9yZGVyRGVwZW5kZW5jaWVzOiBmYWxzZSxcclxuXHJcbiAgICAvLyBBbHNvIHN1cHBvcnRzIHBoZXRpb1R5cGUgb3IgdmFsaWRhdG9yIG9wdGlvbnMuICBJZiBib3RoIGFyZSBzdXBwbGllZCwgb25seSB0aGUgcGhldGlvVHlwZSBpcyByZXNwZWN0ZWRcclxuXHJcbiAgICBsZW5ndGg6IDAsXHJcbiAgICBlbGVtZW50czogW10sXHJcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRJT05BTCxcclxuICAgIHBoZXRpb0ZlYXR1cmVkOiBmYWxzZVxyXG4gIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICBsZXQgZW1pdHRlclBhcmFtZXRlck9wdGlvbnMgPSBudWxsO1xyXG4gIGlmICggb3B0aW9ucy5waGV0aW9UeXBlICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMucGhldGlvVHlwZS50eXBlTmFtZS5zdGFydHNXaXRoKCAnT2JzZXJ2YWJsZUFycmF5SU8nICkgKTtcclxuICAgIGVtaXR0ZXJQYXJhbWV0ZXJPcHRpb25zID0geyBuYW1lOiAndmFsdWUnLCBwaGV0aW9UeXBlOiBvcHRpb25zLnBoZXRpb1R5cGUucGFyYW1ldGVyVHlwZXMhWyAwIF0gfTtcclxuICB9XHJcbiAgLy8gTk9URTogSW1wcm92ZSB3aXRoIFZhbGlkYXRpb25cclxuICBlbHNlIGlmICggIVZhbGlkYXRpb24uZ2V0VmFsaWRhdG9yVmFsaWRhdGlvbkVycm9yKCBvcHRpb25zICkgKSB7XHJcbiAgICBjb25zdCB2YWxpZGF0b3IgPSBfLnBpY2soIG9wdGlvbnMsIFZhbGlkYXRpb24uVkFMSURBVE9SX0tFWVMgKTtcclxuICAgIGVtaXR0ZXJQYXJhbWV0ZXJPcHRpb25zID0gbWVyZ2UoIHsgbmFtZTogJ3ZhbHVlJyB9LCB2YWxpZGF0b3IgKTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICBlbWl0dGVyUGFyYW1ldGVyT3B0aW9ucyA9IG1lcmdlKCB7IG5hbWU6ICd2YWx1ZScgfSwgeyBpc1ZhbGlkVmFsdWU6IF8uc3R1YlRydWUgfSApO1xyXG4gIH1cclxuXHJcbiAgLy8gbm90aWZpZXMgd2hlbiBhbiBlbGVtZW50IGhhcyBiZWVuIGFkZGVkXHJcbiAgY29uc3QgZWxlbWVudEFkZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyPFsgVCBdPigge1xyXG4gICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVtZW50QWRkZWRFbWl0dGVyJyApLFxyXG4gICAgcGFyYW1ldGVyczogWyBlbWl0dGVyUGFyYW1ldGVyT3B0aW9ucyBdLFxyXG4gICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICBwaGV0aW9GZWF0dXJlZDogb3B0aW9ucy5waGV0aW9GZWF0dXJlZCxcclxuICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IG9wdGlvbnMuaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llc1xyXG4gIH0gKTtcclxuXHJcbiAgLy8gbm90aWZpZXMgd2hlbiBhbiBlbGVtZW50IGhhcyBiZWVuIHJlbW92ZWRcclxuICBjb25zdCBlbGVtZW50UmVtb3ZlZEVtaXR0ZXIgPSBuZXcgRW1pdHRlcjxbIFQgXT4oIHtcclxuICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlbWVudFJlbW92ZWRFbWl0dGVyJyApLFxyXG4gICAgcGFyYW1ldGVyczogWyBlbWl0dGVyUGFyYW1ldGVyT3B0aW9ucyBdLFxyXG4gICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICBwaGV0aW9GZWF0dXJlZDogb3B0aW9ucy5waGV0aW9GZWF0dXJlZCxcclxuICAgIGhhc0xpc3RlbmVyT3JkZXJEZXBlbmRlbmNpZXM6IG9wdGlvbnMuaGFzTGlzdGVuZXJPcmRlckRlcGVuZGVuY2llc1xyXG4gIH0gKTtcclxuXHJcbiAgLy8gb2JzZXJ2ZSB0aGlzLCBidXQgZG9uJ3Qgc2V0IGl0LiBVcGRhdGVkIHdoZW4gQXJyYXkgbW9kaWZpZXJzIGFyZSBjYWxsZWQgKGV4Y2VwdCBhcnJheS5sZW5ndGg9Li4uKVxyXG4gIGNvbnN0IGxlbmd0aFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xlbmd0aFByb3BlcnR5JyApLFxyXG4gICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICBwaGV0aW9GZWF0dXJlZDogb3B0aW9ucy5waGV0aW9GZWF0dXJlZFxyXG4gIH0gKTtcclxuXHJcbiAgLy8gVGhlIHVuZGVybHlpbmcgYXJyYXkgd2hpY2ggaXMgd3JhcHBlZCBieSB0aGUgUHJveHlcclxuICBjb25zdCB0YXJnZXRBcnJheTogVFtdID0gW107XHJcblxyXG4gIC8vIFZlcmlmeSB0aGF0IGxlbmd0aFByb3BlcnR5IGlzIHVwZGF0ZWQgYmVmb3JlIGxpc3RlbmVycyBhcmUgbm90aWZpZWQsIGJ1dCBub3Qgd2hlbiBzZXR0aW5nIFBoRVQtaU8gU3RhdGUsXHJcbiAgLy8gVGhpcyBpcyBiZWNhdXNlIHdlIGNhbm5vdCBzcGVjaWZ5IG9yZGVyaW5nIGRlcGVuZGVuY2llcyBiZXR3ZWVuIFByb3BlcnRpZXMgYW5kIE9ic2VydmFibGVBcnJheXMsXHJcbiAgLy8gVE9ETzogTWF5YmUgdGhpcyBjYW4gYmUgaW1wcm92ZWQgd2hlbiB3ZSBoYXZlIGJldHRlciBzdXBwb3J0IGZvciB0aGlzIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9waGV0LWlvL2lzc3Vlcy8xNjYxXHJcbiAgYXNzZXJ0ICYmIGVsZW1lbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBjb25zdCBzaW1HbG9iYWwgPSBfLmdldCggd2luZG93LCAncGhldC5qb2lzdC5zaW0nLCBudWxsICk7IC8vIHJldHVybnMgbnVsbCBpZiBnbG9iYWwgaXNuJ3QgZm91bmRcclxuXHJcbiAgICAgIGlmICggIXNpbUdsb2JhbCB8fCAhc2ltR2xvYmFsLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGVuZ3RoUHJvcGVydHkudmFsdWUgPT09IHRhcmdldEFycmF5Lmxlbmd0aCwgJ2xlbmd0aFByb3BlcnR5IG91dCBvZiBzeW5jIHdoaWxlIGFkZGluZyBlbGVtZW50JyApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSApO1xyXG4gIGFzc2VydCAmJiBlbGVtZW50UmVtb3ZlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgIGlmICggYXNzZXJ0ICkge1xyXG4gICAgICBjb25zdCBzaW1HbG9iYWwgPSBfLmdldCggd2luZG93LCAncGhldC5qb2lzdC5zaW0nLCBudWxsICk7IC8vIHJldHVybnMgbnVsbCBpZiBnbG9iYWwgaXNuJ3QgZm91bmRcclxuXHJcbiAgICAgIGlmICggIXNpbUdsb2JhbCB8fCAhc2ltR2xvYmFsLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGVuZ3RoUHJvcGVydHkudmFsdWUgPT09IHRhcmdldEFycmF5Lmxlbmd0aCwgJ2xlbmd0aFByb3BlcnR5IG91dCBvZiBzeW5jIHdoaWxlIHJlbW92aW5nIGVsZW1lbnQnICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIC8vIFRoZSBQcm94eSB3aGljaCB3aWxsIGludGVyY2VwdCBtZXRob2QgY2FsbHMgYW5kIHRyaWdnZXIgbm90aWZpY2F0aW9ucy5cclxuICBjb25zdCBvYnNlcnZhYmxlQXJyYXk6IFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8VD4gPSBuZXcgUHJveHkoIHRhcmdldEFycmF5LCB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFwIGZvciBnZXR0aW5nIGEgcHJvcGVydHkgb3IgbWV0aG9kLlxyXG4gICAgICogQHBhcmFtIGFycmF5IC0gdGhlIHRhcmdldEFycmF5XHJcbiAgICAgKiBAcGFyYW0ga2V5XHJcbiAgICAgKiBAcGFyYW0gcmVjZWl2ZXJcclxuICAgICAqIEByZXR1cm5zIC0gdGhlIHJlcXVlc3RlZCB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCBhcnJheTogVFtdLCBrZXk6IGtleW9mIHR5cGVvZiBtZXRob2RzLCByZWNlaXZlciApOiBhbnkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcnJheSA9PT0gdGFyZ2V0QXJyYXksICdhcnJheSBzaG91bGQgbWF0Y2ggdGhlIHRhcmdldEFycmF5JyApO1xyXG4gICAgICBpZiAoIG1ldGhvZHMuaGFzT3duUHJvcGVydHkoIGtleSApICkge1xyXG4gICAgICAgIHJldHVybiBtZXRob2RzWyBrZXkgXTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gUmVmbGVjdC5nZXQoIGFycmF5LCBrZXksIHJlY2VpdmVyICk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFwIGZvciBzZXR0aW5nIGEgcHJvcGVydHkgdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0gYXJyYXkgLSB0aGUgdGFyZ2V0QXJyYXlcclxuICAgICAqIEBwYXJhbSBrZXlcclxuICAgICAqIEBwYXJhbSBuZXdWYWx1ZVxyXG4gICAgICogQHJldHVybnMgLSBzdWNjZXNzXHJcbiAgICAgKi9cclxuICAgIHNldDogZnVuY3Rpb24oIGFycmF5OiBUW10sIGtleTogc3RyaW5nIHwgc3ltYm9sLCBuZXdWYWx1ZTogYW55ICk6IGJvb2xlYW4ge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhcnJheSA9PT0gdGFyZ2V0QXJyYXksICdhcnJheSBzaG91bGQgbWF0Y2ggdGhlIHRhcmdldEFycmF5JyApO1xyXG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IGFycmF5WyBrZXkgYXMgYW55IF07XHJcblxyXG4gICAgICBsZXQgcmVtb3ZlZEVsZW1lbnRzID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIFNlZSB3aGljaCBpdGVtcyBhcmUgcmVtb3ZlZFxyXG4gICAgICBpZiAoIGtleSA9PT0gJ2xlbmd0aCcgKSB7XHJcbiAgICAgICAgcmVtb3ZlZEVsZW1lbnRzID0gYXJyYXkuc2xpY2UoIG5ld1ZhbHVlICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gUmVmbGVjdC5zZXQoIGFycmF5LCBrZXksIG5ld1ZhbHVlICk7XHJcblxyXG4gICAgICAvLyBJZiB3ZSdyZSB1c2luZyB0aGUgYnJhY2tldCBvcGVyYXRvciBbaW5kZXhdIG9mIEFycmF5LCB0aGVuIHBhcnNlIHRoZSBpbmRleCBiZXR3ZWVuIHRoZSBicmFja2V0cy5cclxuICAgICAgY29uc3QgbnVtYmVyS2V5ID0gTnVtYmVyKCBrZXkgKTtcclxuICAgICAgaWYgKCBOdW1iZXIuaXNJbnRlZ2VyKCBudW1iZXJLZXkgKSAmJiBudW1iZXJLZXkgPj0gMCAmJiBvbGRWYWx1ZSAhPT0gbmV3VmFsdWUgKSB7XHJcbiAgICAgICAgbGVuZ3RoUHJvcGVydHkudmFsdWUgPSBhcnJheS5sZW5ndGg7XHJcblxyXG4gICAgICAgIGlmICggb2xkVmFsdWUgIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgIGVsZW1lbnRSZW1vdmVkRW1pdHRlci5lbWl0KCBhcnJheVsga2V5IGFzIGFueSBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICggbmV3VmFsdWUgIT09IHVuZGVmaW5lZCApIHtcclxuICAgICAgICAgIGVsZW1lbnRBZGRlZEVtaXR0ZXIuZW1pdCggbmV3VmFsdWUgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIGtleSA9PT0gJ2xlbmd0aCcgKSB7XHJcbiAgICAgICAgbGVuZ3RoUHJvcGVydHkudmFsdWUgPSBuZXdWYWx1ZTtcclxuXHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcmVtb3ZlZEVsZW1lbnRzLCAncmVtb3ZlZEVsZW1lbnRzIHNob3VsZCBiZSBkZWZpbmVkIGZvciBrZXk9PT1sZW5ndGgnICk7XHJcbiAgICAgICAgcmVtb3ZlZEVsZW1lbnRzICYmIHJlbW92ZWRFbGVtZW50cy5mb3JFYWNoKCBlbGVtZW50ID0+IGVsZW1lbnRSZW1vdmVkRW1pdHRlci5lbWl0KCBlbGVtZW50ICkgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhpcyBpcyB0aGUgdHJhcCBmb3IgdGhlIGRlbGV0ZSBvcGVyYXRvci5cclxuICAgICAqL1xyXG4gICAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uKCBhcnJheTogVFtdLCBrZXk6IHN0cmluZyB8IHN5bWJvbCApOiBib29sZWFuIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYXJyYXkgPT09IHRhcmdldEFycmF5LCAnYXJyYXkgc2hvdWxkIG1hdGNoIHRoZSB0YXJnZXRBcnJheScgKTtcclxuXHJcbiAgICAgIC8vIElmIHdlJ3JlIHVzaW5nIHRoZSBicmFja2V0IG9wZXJhdG9yIFtpbmRleF0gb2YgQXJyYXksIHRoZW4gcGFyc2UgdGhlIGluZGV4IGJldHdlZW4gdGhlIGJyYWNrZXRzLlxyXG4gICAgICBjb25zdCBudW1iZXJLZXkgPSBOdW1iZXIoIGtleSApO1xyXG5cclxuICAgICAgbGV0IHJlbW92ZWQ7XHJcbiAgICAgIGlmICggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyS2V5ICkgJiYgbnVtYmVyS2V5ID49IDAgKSB7XHJcbiAgICAgICAgcmVtb3ZlZCA9IGFycmF5WyBrZXkgYXMgYW55IF07XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgcmV0dXJuVmFsdWUgPSBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCBhcnJheSwga2V5ICk7XHJcbiAgICAgIGlmICggcmVtb3ZlZCAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgIGVsZW1lbnRSZW1vdmVkRW1pdHRlci5lbWl0KCByZW1vdmVkICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICAgIH1cclxuICB9ICkgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxUPjtcclxuXHJcbiAgb2JzZXJ2YWJsZUFycmF5LnRhcmdldEFycmF5ID0gdGFyZ2V0QXJyYXk7XHJcbiAgb2JzZXJ2YWJsZUFycmF5LmVsZW1lbnRBZGRlZEVtaXR0ZXIgPSBlbGVtZW50QWRkZWRFbWl0dGVyO1xyXG4gIG9ic2VydmFibGVBcnJheS5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIgPSBlbGVtZW50UmVtb3ZlZEVtaXR0ZXI7XHJcbiAgb2JzZXJ2YWJsZUFycmF5Lmxlbmd0aFByb3BlcnR5ID0gbGVuZ3RoUHJvcGVydHk7XHJcblxyXG4gIGNvbnN0IGluaXQgPSAoKSA9PiB7XHJcbiAgICBpZiAoIG9wdGlvbnMubGVuZ3RoID49IDAgKSB7XHJcbiAgICAgIG9ic2VydmFibGVBcnJheS5sZW5ndGggPSBvcHRpb25zLmxlbmd0aDtcclxuICAgIH1cclxuICAgIGlmICggb3B0aW9ucy5lbGVtZW50cy5sZW5ndGggPiAwICkge1xyXG4gICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggb2JzZXJ2YWJsZUFycmF5LCBvcHRpb25zLmVsZW1lbnRzICk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgaW5pdCgpO1xyXG5cclxuICAvL1RPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzMzNCBNb3ZlIHRvIFwicHJvdG90eXBlXCIgYWJvdmUgb3IgZHJvcCBzdXBwb3J0XHJcbiAgb2JzZXJ2YWJsZUFycmF5LnJlc2V0ID0gKCkgPT4ge1xyXG4gICAgb2JzZXJ2YWJsZUFycmF5Lmxlbmd0aCA9IDA7XHJcbiAgICBpbml0KCk7XHJcbiAgfTtcclxuXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAqIFBoRVQtaU8gc3VwcG9ydFxyXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gIGlmICggb3B0aW9ucy50YW5kZW0uc3VwcGxpZWQgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnBoZXRpb1R5cGUgKTtcclxuXHJcbiAgICBvYnNlcnZhYmxlQXJyYXkucGhldGlvRWxlbWVudFR5cGUgPSBvcHRpb25zLnBoZXRpb1R5cGUhLnBhcmFtZXRlclR5cGVzIVsgMCBdO1xyXG5cclxuICAgIC8vIGZvciBtYW5hZ2luZyBzdGF0ZSBpbiBwaGV0LWlvXHJcbiAgICAvLyBVc2UgdGhlIHNhbWUgdGFuZGVtIGFuZCBwaGV0aW9TdGF0ZSBvcHRpb25zIHNvIGl0IGNhbiBcIm1hc3F1ZXJhZGVcIiBhcyB0aGUgcmVhbCBvYmplY3QuICBXaGVuIFBoZXRpb09iamVjdCBpcyBhIG1peGluIHRoaXMgY2FuIGJlIGNoYW5nZWQuXHJcbiAgICBvYnNlcnZhYmxlQXJyYXkuX29ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCA9IG5ldyBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3QoIG9ic2VydmFibGVBcnJheSwgb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG9ic2VydmFibGVBcnJheTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBNYW5hZ2VzIHN0YXRlIHNhdmUvbG9hZC4gVGhpcyBpbXBsZW1lbnRhdGlvbiB1c2VzIFByb3h5IGFuZCBoZW5jZSBjYW5ub3QgYmUgaW5zdHJ1bWVudGVkIGFzIGEgUGhldGlvT2JqZWN0LiAgVGhpcyB0eXBlXHJcbiAqIHByb3ZpZGVzIHRoYXQgZnVuY3Rpb25hbGl0eS5cclxuICovXHJcbmNsYXNzIE9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdDxUPiBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIC8vIGludGVybmFsLCBkb24ndCB1c2VcclxuICBwdWJsaWMgb2JzZXJ2YWJsZUFycmF5OiBPYnNlcnZhYmxlQXJyYXk8VD47XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBvYnNlcnZhYmxlQXJyYXlcclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc10gLSBzYW1lIGFzIHRoZSBvcHRpb25zIHRvIHRoZSBwYXJlbnQgT2JzZXJ2YWJsZUFycmF5RGVmXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvYnNlcnZhYmxlQXJyYXk6IE9ic2VydmFibGVBcnJheTxUPiwgcHJvdmlkZWRPcHRpb25zPzogT2JzZXJ2YWJsZUFycmF5T3B0aW9uczxUPiApIHtcclxuXHJcbiAgICBzdXBlciggcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5vYnNlcnZhYmxlQXJyYXkgPSBvYnNlcnZhYmxlQXJyYXk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBNZXRob2RzIHNoYXJlZCBieSBhbGwgT2JzZXJ2YWJsZUFycmF5RGVmIGluc3RhbmNlc1xyXG5jb25zdCBtZXRob2RzID0ge1xyXG5cclxuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICogT3ZlcnJpZGRlbiBBcnJheSBtZXRob2RzXHJcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gIHBvcCggLi4uYXJnczogYW55W10gKTogYW55IHtcclxuICAgIGNvbnN0IHRoaXNBcnJheSA9IHRoaXMgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+O1xyXG5cclxuICAgIGNvbnN0IGluaXRpYWxMZW5ndGggPSB0aGlzQXJyYXkudGFyZ2V0QXJyYXkubGVuZ3RoO1xyXG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUucG9wLmFwcGx5KCB0aGlzQXJyYXkudGFyZ2V0QXJyYXksIGFyZ3MgYXMgYW55ICk7XHJcbiAgICB0aGlzQXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUgPSB0aGlzQXJyYXkubGVuZ3RoO1xyXG4gICAgaW5pdGlhbExlbmd0aCA+IDAgJiYgdGhpc0FycmF5LmVsZW1lbnRSZW1vdmVkRW1pdHRlci5lbWl0KCByZXR1cm5WYWx1ZSApO1xyXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIHNoaWZ0KCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xyXG4gICAgY29uc3QgdGhpc0FycmF5ID0gdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT47XHJcblxyXG4gICAgY29uc3QgaW5pdGlhbExlbmd0aCA9IHRoaXNBcnJheS50YXJnZXRBcnJheS5sZW5ndGg7XHJcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseSggdGhpc0FycmF5LnRhcmdldEFycmF5LCBhcmdzIGFzIGFueSApO1xyXG4gICAgdGhpc0FycmF5Lmxlbmd0aFByb3BlcnR5LnZhbHVlID0gdGhpc0FycmF5Lmxlbmd0aDtcclxuICAgIGluaXRpYWxMZW5ndGggPiAwICYmIHRoaXNBcnJheS5lbGVtZW50UmVtb3ZlZEVtaXR0ZXIuZW1pdCggcmV0dXJuVmFsdWUgKTtcclxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICB9LFxyXG5cclxuICBwdXNoKCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xyXG4gICAgY29uc3QgdGhpc0FycmF5ID0gdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT47XHJcblxyXG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseSggdGhpc0FycmF5LnRhcmdldEFycmF5LCBhcmdzICk7XHJcbiAgICB0aGlzQXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUgPSB0aGlzQXJyYXkubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzQXJyYXkuZWxlbWVudEFkZGVkRW1pdHRlci5lbWl0KCBhcmdzWyBpIF0gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICB9LFxyXG5cclxuICB1bnNoaWZ0KCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xyXG4gICAgY29uc3QgdGhpc0FycmF5ID0gdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT47XHJcblxyXG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseSggdGhpc0FycmF5LnRhcmdldEFycmF5LCBhcmdzICk7XHJcbiAgICB0aGlzQXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUgPSB0aGlzQXJyYXkubGVuZ3RoO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgdGhpc0FycmF5LmVsZW1lbnRBZGRlZEVtaXR0ZXIuZW1pdCggYXJnc1sgaSBdICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgc3BsaWNlKCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xyXG4gICAgY29uc3QgdGhpc0FycmF5ID0gdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT47XHJcblxyXG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmFwcGx5KCB0aGlzQXJyYXkudGFyZ2V0QXJyYXksIGFyZ3MgYXMgYW55ICk7XHJcbiAgICB0aGlzQXJyYXkubGVuZ3RoUHJvcGVydHkudmFsdWUgPSB0aGlzQXJyYXkubGVuZ3RoO1xyXG4gICAgY29uc3QgZGVsZXRlZEVsZW1lbnRzID0gcmV0dXJuVmFsdWU7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDI7IGkgPCBhcmdzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICB0aGlzQXJyYXkuZWxlbWVudEFkZGVkRW1pdHRlci5lbWl0KCBhcmdzWyBpIF0gKTtcclxuICAgIH1cclxuICAgIGRlbGV0ZWRFbGVtZW50cy5mb3JFYWNoKCBkZWxldGVkRWxlbWVudCA9PiB0aGlzQXJyYXkuZWxlbWVudFJlbW92ZWRFbWl0dGVyLmVtaXQoIGRlbGV0ZWRFbGVtZW50ICkgKTtcclxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcclxuICB9LFxyXG5cclxuICBjb3B5V2l0aGluKCAuLi5hcmdzOiBhbnlbXSApOiBhbnkge1xyXG4gICAgY29uc3QgdGhpc0FycmF5ID0gdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT47XHJcblxyXG4gICAgY29uc3QgYmVmb3JlID0gdGhpc0FycmF5LnRhcmdldEFycmF5LnNsaWNlKCk7XHJcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluLmFwcGx5KCB0aGlzQXJyYXkudGFyZ2V0QXJyYXksIGFyZ3MgYXMgYW55ICk7XHJcbiAgICByZXBvcnREaWZmZXJlbmNlKCBiZWZvcmUsIHRoaXNBcnJheSApO1xyXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gIH0sXHJcblxyXG4gIGZpbGwoIC4uLmFyZ3M6IGFueVtdICk6IGFueSB7XHJcbiAgICBjb25zdCB0aGlzQXJyYXkgPSB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PjtcclxuXHJcbiAgICBjb25zdCBiZWZvcmUgPSB0aGlzQXJyYXkudGFyZ2V0QXJyYXkuc2xpY2UoKTtcclxuICAgIGNvbnN0IHJldHVyblZhbHVlID0gQXJyYXkucHJvdG90eXBlLmZpbGwuYXBwbHkoIHRoaXNBcnJheS50YXJnZXRBcnJheSwgYXJncyBhcyBhbnkgKTtcclxuICAgIHJlcG9ydERpZmZlcmVuY2UoIGJlZm9yZSwgdGhpc0FycmF5ICk7XHJcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbiAgfSxcclxuXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAqIEZvciBjb21wYXRpYmlsaXR5IHdpdGggT2JzZXJ2YWJsZUFycmF5RGVmXHJcbiAgICogVE9ETyBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYXhvbi9pc3N1ZXMvMzM0IGNvbnNpZGVyIGRlbGV0aW5nIGFmdGVyIG1pZ3JhdGlvblxyXG4gICAqIFRPRE8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2F4b24vaXNzdWVzLzMzNCBpZiBub3QgZGVsZXRlZCwgcmVuYW1lICdJdGVtJyB3aXRoICdFbGVtZW50J1xyXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG4gIGdldDogZnVuY3Rpb24oIGluZGV4OiBudW1iZXIgKSB7IHJldHVybiAoIHRoaXMgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+IClbIGluZGV4IF07IH0sXHJcbiAgYWRkSXRlbUFkZGVkTGlzdGVuZXI6IGZ1bmN0aW9uKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8YW55PiApIHsgKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLmVsZW1lbnRBZGRlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGxpc3RlbmVyICk7IH0sXHJcbiAgcmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXI6IGZ1bmN0aW9uKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8YW55PiApIHsgKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLmVsZW1lbnRBZGRlZEVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIGxpc3RlbmVyICk7IH0sXHJcbiAgYWRkSXRlbVJlbW92ZWRMaXN0ZW5lcjogZnVuY3Rpb24oIGxpc3RlbmVyOiBPYnNlcnZhYmxlQXJyYXlMaXN0ZW5lcjxhbnk+ICkgeyAoIHRoaXMgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+ICkuZWxlbWVudFJlbW92ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCBsaXN0ZW5lciApOyB9LFxyXG4gIHJlbW92ZUl0ZW1SZW1vdmVkTGlzdGVuZXI6IGZ1bmN0aW9uKCBsaXN0ZW5lcjogT2JzZXJ2YWJsZUFycmF5TGlzdGVuZXI8YW55PiApIHsgKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLmVsZW1lbnRSZW1vdmVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggbGlzdGVuZXIgKTsgfSxcclxuICBhZGQ6IGZ1bmN0aW9uKCBlbGVtZW50OiBhbnkgKSB7ICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS5wdXNoKCBlbGVtZW50ICk7fSxcclxuICBhZGRBbGw6IGZ1bmN0aW9uKCBlbGVtZW50czogYW55W10gKSB7ICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS5wdXNoKCAuLi5lbGVtZW50cyApO30sXHJcbiAgcmVtb3ZlOiBmdW5jdGlvbiggZWxlbWVudDogYW55ICkgeyBhcnJheVJlbW92ZSggKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLCBlbGVtZW50ICk7fSxcclxuICByZW1vdmVBbGw6IGZ1bmN0aW9uKCBlbGVtZW50czogYW55W10gKSB7XHJcbiAgICBlbGVtZW50cy5mb3JFYWNoKCBlbGVtZW50ID0+IGFycmF5UmVtb3ZlKCAoIHRoaXMgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+ICksIGVsZW1lbnQgKSApO1xyXG4gIH0sXHJcbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgd2hpbGUgKCAoIHRoaXMgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+ICkubGVuZ3RoID4gMCApIHtcclxuICAgICAgKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLnBvcCgpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgY291bnQ6IGZ1bmN0aW9uKCBwcmVkaWNhdGU6IFByZWRpY2F0ZTxhbnk+ICkge1xyXG4gICAgbGV0IGNvdW50ID0gMDtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8ICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCBwcmVkaWNhdGUoICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKVsgaSBdICkgKSB7XHJcbiAgICAgICAgY291bnQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGNvdW50O1xyXG4gIH0sXHJcbiAgZmluZDogZnVuY3Rpb24oIHByZWRpY2F0ZTogUHJlZGljYXRlPGFueT4sIGZyb21JbmRleD86IG51bWJlciApIHtcclxuICAgIGFzc2VydCAmJiAoIGZyb21JbmRleCAhPT0gdW5kZWZpbmVkICkgJiYgYXNzZXJ0KCB0eXBlb2YgZnJvbUluZGV4ID09PSAnbnVtYmVyJywgJ2Zyb21JbmRleCBtdXN0IGJlIG51bWVyaWMsIGlmIHByb3ZpZGVkJyApO1xyXG4gICAgYXNzZXJ0ICYmICggdHlwZW9mIGZyb21JbmRleCA9PT0gJ251bWJlcicgKSAmJiBhc3NlcnQoIGZyb21JbmRleCA+PSAwICYmIGZyb21JbmRleCA8ICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS5sZW5ndGgsXHJcbiAgICAgIGBmcm9tSW5kZXggb3V0IG9mIGJvdW5kczogJHtmcm9tSW5kZXh9YCApO1xyXG4gICAgcmV0dXJuIF8uZmluZCggKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLCBwcmVkaWNhdGUsIGZyb21JbmRleCApO1xyXG4gIH0sXHJcbiAgc2h1ZmZsZTogZnVuY3Rpb24oIHJhbmRvbTogRmFrZVJhbmRvbTxhbnk+ICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggcmFuZG9tLCAncmFuZG9tIG11c3QgYmUgc3VwcGxpZWQnICk7XHJcblxyXG4gICAgLy8gcHJlc2VydmUgdGhlIHNhbWUgX2FycmF5IHJlZmVyZW5jZSBpbiBjYXNlIGFueSBjbGllbnRzIGdvdCBhIHJlZmVyZW5jZSB0byBpdCB3aXRoIGdldEFycmF5KClcclxuICAgIGNvbnN0IHNodWZmbGVkID0gcmFuZG9tLnNodWZmbGUoICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKSApO1xyXG5cclxuICAgIC8vIEFjdCBvbiB0aGUgdGFyZ2V0QXJyYXkgc28gdGhhdCByZW1vdmFsIGFuZCBhZGQgbm90aWZpY2F0aW9ucyBhcmVuJ3Qgc2VudC5cclxuICAgICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS50YXJnZXRBcnJheS5sZW5ndGggPSAwO1xyXG4gICAgQXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS50YXJnZXRBcnJheSwgc2h1ZmZsZWQgKTtcclxuICB9LFxyXG5cclxuICAvLyBUT0RPIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy8zMzQgVGhpcyBhbHNvIHNlZW1zIGltcG9ydGFudCB0byBlbGltaW5hdGVcclxuICBnZXRBcnJheUNvcHk6IGZ1bmN0aW9uKCkgeyByZXR1cm4gKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLnNsaWNlKCk7IH0sXHJcblxyXG4gIGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc3QgdGhpc0FycmF5ID0gdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT47XHJcbiAgICB0aGlzQXJyYXkuZWxlbWVudEFkZGVkRW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICB0aGlzQXJyYXkuZWxlbWVudFJlbW92ZWRFbWl0dGVyLmRpc3Bvc2UoKTtcclxuICAgIHRoaXNBcnJheS5sZW5ndGhQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB0aGlzQXJyYXkuX29ic2VydmFibGVBcnJheVBoZXRpb09iamVjdCAmJiB0aGlzQXJyYXkuX29ic2VydmFibGVBcnJheVBoZXRpb09iamVjdC5kaXNwb3NlKCk7XHJcbiAgfSxcclxuXHJcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAqIFBoRVQtaU9cclxuICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuICB0b1N0YXRlT2JqZWN0OiBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7IGFycmF5OiAoIHRoaXMgYXMgUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+ICkubWFwKCBpdGVtID0+ICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS5waGV0aW9FbGVtZW50VHlwZSEudG9TdGF0ZU9iamVjdCggaXRlbSApICkgfTtcclxuICB9LFxyXG4gIGFwcGx5U3RhdGU6IGZ1bmN0aW9uKCBzdGF0ZU9iamVjdDogT2JzZXJ2YWJsZUFycmF5U3RhdGVPYmplY3Q8YW55PiApIHtcclxuICAgICggdGhpcyBhcyBQcml2YXRlT2JzZXJ2YWJsZUFycmF5PGFueT4gKS5sZW5ndGggPSAwO1xyXG4gICAgY29uc3QgZWxlbWVudHMgPSBzdGF0ZU9iamVjdC5hcnJheS5tYXAoIHBhcmFtU3RhdGVPYmplY3QgPT4gKCB0aGlzIGFzIFByaXZhdGVPYnNlcnZhYmxlQXJyYXk8YW55PiApLnBoZXRpb0VsZW1lbnRUeXBlIS5mcm9tU3RhdGVPYmplY3QoIHBhcmFtU3RhdGVPYmplY3QgKSApO1xyXG4gICAgdGhpcy5wdXNoKCAuLi5lbGVtZW50cyApO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBGb3IgY29weVdpdGhpbiBhbmQgZmlsbCwgd2hpY2ggaGF2ZSBtb3JlIGNvbXBsZXggYmVoYXZpb3IsIHdlIHRyZWF0IHRoZSBhcnJheSBhcyBhIGJsYWNrIGJveCwgbWFraW5nIGEgc2hhbGxvdyBjb3B5XHJcbiAqIGJlZm9yZSB0aGUgb3BlcmF0aW9uIGluIG9yZGVyIHRvIGlkZW50aWZ5IHdoYXQgaGFzIGJlZW4gYWRkZWQgYW5kIHJlbW92ZWQuXHJcbiAqL1xyXG5jb25zdCByZXBvcnREaWZmZXJlbmNlID0gKCBzaGFsbG93Q29weTogYW55W10sIG9ic2VydmFibGVBcnJheTogUHJpdmF0ZU9ic2VydmFibGVBcnJheTxhbnk+ICkgPT4ge1xyXG5cclxuICBjb25zdCBiZWZvcmUgPSBzaGFsbG93Q29weTtcclxuICBjb25zdCBhZnRlciA9IG9ic2VydmFibGVBcnJheS50YXJnZXRBcnJheS5zbGljZSgpO1xyXG5cclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBiZWZvcmUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICBjb25zdCBiZWZvcmVFbGVtZW50ID0gYmVmb3JlWyBpIF07XHJcbiAgICBjb25zdCBhZnRlckluZGV4ID0gYWZ0ZXIuaW5kZXhPZiggYmVmb3JlRWxlbWVudCApO1xyXG4gICAgaWYgKCBhZnRlckluZGV4ID49IDAgKSB7XHJcbiAgICAgIGJlZm9yZS5zcGxpY2UoIGksIDEgKTtcclxuICAgICAgYWZ0ZXIuc3BsaWNlKCBhZnRlckluZGV4LCAxICk7XHJcbiAgICAgIGktLTtcclxuICAgIH1cclxuICB9XHJcbiAgYmVmb3JlLmZvckVhY2goIGVsZW1lbnQgPT4gb2JzZXJ2YWJsZUFycmF5LmVsZW1lbnRSZW1vdmVkRW1pdHRlci5lbWl0KCBlbGVtZW50ICkgKTtcclxuICBhZnRlci5mb3JFYWNoKCBlbGVtZW50ID0+IG9ic2VydmFibGVBcnJheS5lbGVtZW50QWRkZWRFbWl0dGVyLmVtaXQoIGVsZW1lbnQgKSApO1xyXG59O1xyXG5cclxuLy8ge01hcC48Y2FjaGVLZXk6ZnVuY3Rpb24obmV3Ok9ic2VydmFibGVBcnJheUlPKSwgZnVuY3Rpb24obmV3Ok9ic2VydmFibGVBcnJheUlPKT59IC0gQ2FjaGUgZWFjaCBwYXJhbWV0ZXJpemVkIE9ic2VydmFibGVBcnJheUlPXHJcbi8vIGJhc2VkIG9uIHRoZSBwYXJhbWV0ZXIgdHlwZSwgc28gdGhhdCBpdCBpcyBvbmx5IGNyZWF0ZWQgb25jZS5cclxuY29uc3QgY2FjaGUgPSBuZXcgTWFwKCk7XHJcblxyXG4vKipcclxuICogT2JzZXJ2YWJsZUFycmF5SU8gaXMgdGhlIElPIFR5cGUgZm9yIE9ic2VydmFibGVBcnJheURlZi4gSXQgZGVsZWdhdGVzIG1vc3Qgb2YgaXRzIGltcGxlbWVudGF0aW9uIHRvIE9ic2VydmFibGVBcnJheURlZi5cclxuICogSW5zdGVhZCBvZiBiZWluZyBhIHBhcmFtZXRyaWMgdHlwZSwgaXQgbGV2ZXJhZ2VzIHRoZSBwaGV0aW9FbGVtZW50VHlwZSBvbiBPYnNlcnZhYmxlQXJyYXlEZWYuXHJcbiAqL1xyXG5jb25zdCBPYnNlcnZhYmxlQXJyYXlJTyA9ICggcGFyYW1ldGVyVHlwZTogSU9UeXBlICk6IElPVHlwZSA9PiB7XHJcbiAgaWYgKCAhY2FjaGUuaGFzKCBwYXJhbWV0ZXJUeXBlICkgKSB7XHJcbiAgICBjYWNoZS5zZXQoIHBhcmFtZXRlclR5cGUsIG5ldyBJT1R5cGUoIGBPYnNlcnZhYmxlQXJyYXlJTzwke3BhcmFtZXRlclR5cGUudHlwZU5hbWV9PmAsIHtcclxuICAgICAgdmFsdWVUeXBlOiBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3QsXHJcbiAgICAgIHBhcmFtZXRlclR5cGVzOiBbIHBhcmFtZXRlclR5cGUgXSxcclxuICAgICAgdG9TdGF0ZU9iamVjdDogKCBvYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q6IE9ic2VydmFibGVBcnJheVBoZXRpb09iamVjdDxhbnk+ICkgPT4gb2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0Lm9ic2VydmFibGVBcnJheS50b1N0YXRlT2JqZWN0KCksXHJcbiAgICAgIGFwcGx5U3RhdGU6ICggb2JzZXJ2YWJsZUFycmF5UGhldGlvT2JqZWN0OiBPYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Q8YW55Piwgc3RhdGU6IE9ic2VydmFibGVBcnJheVN0YXRlT2JqZWN0PGFueT4gKSA9PiBvYnNlcnZhYmxlQXJyYXlQaGV0aW9PYmplY3Qub2JzZXJ2YWJsZUFycmF5LmFwcGx5U3RhdGUoIHN0YXRlICksXHJcbiAgICAgIHN0YXRlU2NoZW1hOiB7XHJcbiAgICAgICAgYXJyYXk6IEFycmF5SU8oIHBhcmFtZXRlclR5cGUgKVxyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuICB9XHJcbiAgcmV0dXJuIGNhY2hlLmdldCggcGFyYW1ldGVyVHlwZSApO1xyXG59O1xyXG5cclxuY3JlYXRlT2JzZXJ2YWJsZUFycmF5Lk9ic2VydmFibGVBcnJheUlPID0gT2JzZXJ2YWJsZUFycmF5SU87XHJcblxyXG5heG9uLnJlZ2lzdGVyKCAnY3JlYXRlT2JzZXJ2YWJsZUFycmF5JywgY3JlYXRlT2JzZXJ2YWJsZUFycmF5ICk7XHJcbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZU9ic2VydmFibGVBcnJheTtcclxuZXhwb3J0IHsgT2JzZXJ2YWJsZUFycmF5SU8gfTtcclxuZXhwb3J0IHR5cGUgeyBPYnNlcnZhYmxlQXJyYXkgfTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsV0FBVyxNQUFNLG1DQUFtQztBQUUzRCxPQUFPQyw4QkFBOEIsTUFBTSxzREFBc0Q7QUFDakcsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLFlBQVksTUFBTSxpQ0FBaUM7QUFDMUQsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsT0FBTyxNQUFNLGNBQWM7QUFDbEMsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxVQUFVLE1BQU0saUJBQWlCOztBQUd4Qzs7QUFHdUQ7QUFDQTs7QUE0Q3ZEOztBQVVBLE1BQU1DLHFCQUFxQixHQUFRQyxlQUEyQyxJQUEwQjtFQUV0R1osOEJBQThCLENBQUVZLGVBQWUsRUFBRSxDQUFFLFFBQVEsQ0FBRSxFQUFFLENBQUUsVUFBVSxDQUFHLENBQUM7RUFFL0UsTUFBTUMsT0FBTyxHQUFHWCxTQUFTLENBQWdFLENBQUMsQ0FBRTtJQUUxRlksNEJBQTRCLEVBQUUsS0FBSztJQUVuQzs7SUFFQUMsTUFBTSxFQUFFLENBQUM7SUFDVEMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsTUFBTSxFQUFFYixNQUFNLENBQUNjLFFBQVE7SUFDdkJDLGNBQWMsRUFBRTtF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