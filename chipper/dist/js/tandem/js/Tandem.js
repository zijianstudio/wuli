// Copyright 2015-2023, University of Colorado Boulder

/**
 * Tandem defines a set of trees that are used to assign unique identifiers to PhetioObjects in PhET simulations and
 * notify listeners when the associated PhetioObjects have been added/removed. It is used to support PhET-iO.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import arrayRemove from '../../phet-core/js/arrayRemove.js';
import merge from '../../phet-core/js/merge.js';
import optionize from '../../phet-core/js/optionize.js';
import tandemNamespace from './tandemNamespace.js';

// constants
// Tandem can't depend on joist, so cannot use packageJSON module
const packageJSON = _.hasIn(window, 'phet.chipper.packageObject') ? phet.chipper.packageObject : {
  name: 'placeholder'
};
const PHET_IO_ENABLED = _.hasIn(window, 'phet.preloads.phetio');
const PRINT_MISSING_TANDEMS = PHET_IO_ENABLED && phet.preloads.phetio.queryParameters.phetioPrintMissingTandems;

// Validation defaults to true, but can be overridden to be false in package.json.
const IS_VALIDATION_DEFAULT = _.hasIn(packageJSON, 'phet.phet-io.validation') ? !!packageJSON.phet['phet-io'].validation : true;

// The default value for validation can be overridden with a query parameter ?phetioValidation={true|false}.
const IS_VALIDATION_QUERY_PARAMETER_SPECIFIED = window.QueryStringMachine && QueryStringMachine.containsKey('phetioValidation');
const IS_VALIDATION_SPECIFIED = PHET_IO_ENABLED && IS_VALIDATION_QUERY_PARAMETER_SPECIFIED ? !!phet.preloads.phetio.queryParameters.phetioValidation : PHET_IO_ENABLED && IS_VALIDATION_DEFAULT;
const VALIDATION = PHET_IO_ENABLED && IS_VALIDATION_SPECIFIED && !PRINT_MISSING_TANDEMS;
const UNALLOWED_TANDEM_NAMES = ['pickableProperty',
// use inputEnabled instead

// in https://github.com/phetsims/phet-io/issues/1915 we decided to prefer the scenery listener types
// ('dragListener' etc). If you encounter this and feel like inputListener is preferable, let's discuss!
'inputListener', 'dragHandler' // prefer dragListener
];

const REQUIRED_TANDEM_NAME = 'requiredTandem';
const OPTIONAL_TANDEM_NAME = 'optionalTandem';
const TEST_TANDEM_NAME = 'test';
const INTER_TERM_SEPARATOR = phetio.PhetioIDUtils.INTER_TERM_SEPARATOR;
export const DYNAMIC_ARCHETYPE_NAME = 'archetype';

// used to keep track of missing tandems
const missingTandems = {
  required: [],
  optional: []
};
// Listeners that will be notified when items are registered/deregistered. See doc in addPhetioObjectListener
const phetioObjectListeners = [];

// keep track of listeners to fire when Tandem.launch() is called.
const launchListeners = [];
class Tandem {
  // Treat as readonly.  Only marked as writable so it can be eliminated on dispose

  // the last part of the tandem (after the last .), used e.g., in Joist for creating button
  // names dynamically based on screen names
  children = {};
  isDisposed = false;
  static SCREEN_TANDEM_NAME_SUFFIX = 'Screen';

  /**
   * Typically, sims will create tandems using `tandem.createTandem`.  This constructor is used internally or when
   * a tandem must be created from scratch.
   *
   * @param parentTandem - parent for a child tandem, or null for a root tandem
   * @param name - component name for this level, like 'resetAllButton'
   * @param [providedOptions]
   */
  constructor(parentTandem, name, providedOptions) {
    assert && assert(parentTandem === null || parentTandem instanceof Tandem, 'parentTandem should be null or Tandem');
    assert && assert(name !== Tandem.METADATA_KEY, 'name cannot match Tandem.METADATA_KEY');
    this.parentTandem = parentTandem;
    this.name = name;
    this.phetioID = this.parentTandem ? window.phetio.PhetioIDUtils.append(this.parentTandem.phetioID, this.name) : this.name;

    // options (even subtype options) must be stored so they can be passed through to children
    // Note: Make sure that added options here are also added to options for inheritance and/or for composition
    // (createTandem/parentTandem/getExtendedOptions) as appropriate.
    const options = optionize()({
      // required === false means it is an optional tandem
      required: true,
      // if the tandem is required but not supplied, an error will be thrown.
      supplied: true,
      isValidTandemName: name => /^[a-zA-Z0-9[\],]+$/.test(name)
    }, providedOptions);
    assert && assert(options.isValidTandemName(name), `invalid tandem name: ${name}`);
    this.children = {};
    if (this.parentTandem) {
      assert && assert(!this.parentTandem.hasChild(name), `parent should not have child: ${name}`);
      this.parentTandem.addChild(name, this);
    }
    this.required = options.required;
    this.supplied = options.supplied;
  }

  /**
   * If the provided tandem is not supplied, support the ?printMissingTandems query parameter for extra logging during
   * initial instrumentation.
   */
  static onMissingTandem(tandem) {
    // When the query parameter phetioPrintMissingTandems is true, report tandems that are required but not supplied
    if (PRINT_MISSING_TANDEMS && !tandem.supplied) {
      const stackTrace = new Error().stack;
      if (tandem.required) {
        missingTandems.required.push({
          phetioID: tandem.phetioID,
          stack: stackTrace
        });
      } else {
        // When the query parameter phetioPrintMissingTandems is true, report tandems that are optional but not
        // supplied, but not for Fonts because they are too numerous.
        if (!stackTrace.includes('Font')) {
          missingTandems.optional.push({
            phetioID: tandem.phetioID,
            stack: stackTrace
          });
        }
      }
    }
  }

  /**
   * Adds a PhetioObject.  For example, it could be an axon Property, SCENERY/Node or SUN/RoundPushButton.
   * phetioEngine listens for when PhetioObjects are added and removed to keep track of them for PhET-iO.
   */
  addPhetioObject(phetioObject) {
    if (PHET_IO_ENABLED) {
      // Throw an error if the tandem is required but not supplied
      assert && Tandem.VALIDATION && assert(!(this.required && !this.supplied), 'Tandem was required but not supplied');

      // If tandem is optional and not supplied, then ignore it.
      if (!this.required && !this.supplied) {
        // Optionally instrumented types without tandems are not added.
        return;
      }
      if (!Tandem.launched) {
        Tandem.bufferedPhetioObjects.push(phetioObject);
      } else {
        for (let i = 0; i < phetioObjectListeners.length; i++) {
          phetioObjectListeners[i].addPhetioObject(phetioObject);
        }
      }
    }
  }

  /**
   * Returns true if this Tandem has the specified ancestor Tandem.
   */
  hasAncestor(ancestor) {
    return this.parentTandem === ancestor || !!(this.parentTandem && this.parentTandem.hasAncestor(ancestor));
  }

  /**
   * Removes a PhetioObject and signifies to listeners that it has been removed.
   */
  removePhetioObject(phetioObject) {
    if (!this.required && !this.supplied) {
      return;
    }

    // Only active when running as phet-io
    if (PHET_IO_ENABLED) {
      if (!Tandem.launched) {
        assert && assert(Tandem.bufferedPhetioObjects.includes(phetioObject), 'should contain item');
        arrayRemove(Tandem.bufferedPhetioObjects, phetioObject);
      } else {
        for (let i = 0; i < phetioObjectListeners.length; i++) {
          phetioObjectListeners[i].removePhetioObject(phetioObject);
        }
      }
    }
    phetioObject.tandem.dispose();
  }

  /**
   * Used for creating new tandems, extends this Tandem's options with the passed-in options.
   */
  getExtendedOptions(options) {
    // Any child of something should be passed all inherited options. Make sure that this extend call includes all
    // that make sense from the constructor's extend call.
    return merge({
      supplied: this.supplied,
      required: this.required
    }, options);
  }

  /**
   * Create a new Tandem by appending the given id, or if the child Tandem already exists, return it instead.
   */
  createTandem(name, options) {
    assert && Tandem.VALIDATION && assert(!UNALLOWED_TANDEM_NAMES.includes(name), 'tandem name is not allowed: ' + name);
    options = this.getExtendedOptions(options);

    // re-use the child if it already exists, but make sure it behaves the same.
    if (this.hasChild(name)) {
      const currentChild = this.children[name];
      assert && assert(currentChild.required === options.required);
      assert && assert(currentChild.supplied === options.supplied);
      return currentChild;
    } else {
      return new Tandem(this, name, options);
    }
  }
  hasChild(name) {
    return this.children.hasOwnProperty(name);
  }
  addChild(name, tandem) {
    assert && assert(!this.hasChild(name));
    this.children[name] = tandem;
  }

  /**
   * Fire a callback on all descendants of this Tandem
   */
  iterateDescendants(callback) {
    for (const childName in this.children) {
      if (this.children.hasOwnProperty(childName)) {
        callback(this.children[childName]);
        this.children[childName].iterateDescendants(callback);
      }
    }
  }
  removeChild(childName) {
    assert && assert(this.hasChild(childName));
    delete this.children[childName];
  }
  dispose() {
    assert && assert(!this.isDisposed, 'already disposed');
    this.parentTandem.removeChild(this.name);
    this.parentTandem = null;
    this.isDisposed = true;
  }

  /**
   * For API validation, each PhetioObject has a corresponding concrete PhetioObject for comparison. Non-dynamic
   * PhetioObjects have the trivial case where its archetypal phetioID is the same as its phetioID.
   */
  getArchetypalPhetioID() {
    // Dynamic elements always have a parent container, hence since this does not have a parent, it must already be concrete
    const result = this.parentTandem ? window.phetio.PhetioIDUtils.append(this.parentTandem.getArchetypalPhetioID(), this.name) : this.phetioID;

    // For https://github.com/phetsims/axon/issues/408, we need to access archetypes for Tandems from createTandemFromPhetioID
    if (result.includes('_')) {
      const terms = result.split(INTER_TERM_SEPARATOR);
      const mapped = terms.map(term => term.includes('_') ? DYNAMIC_ARCHETYPE_NAME : term);
      return mapped.join(INTER_TERM_SEPARATOR);
    } else {
      return result;
    }
  }

  /**
   * Creates a group tandem for creating multiple indexed child tandems, such as:
   * sim.screen.model.electron0
   * sim.screen.model.electron1
   *
   * In this case, 'sim.screen.model.electron' is the string passed to createGroupTandem.
   *
   * Used for arrays, observable arrays, or when many elements of the same type are created and they do not otherwise
   * have unique identifiers.
   */
  createGroupTandem(name) {
    if (this.children[name]) {
      return this.children[name];
    }
    return new GroupTandem(this, name);
  }
  equals(tandem) {
    return this.phetioID === tandem.phetioID;
  }

  /**
   * Adds a listener that will be notified when items are registered/deregistered
   */
  static addPhetioObjectListener(phetioObjectListener) {
    phetioObjectListeners.push(phetioObjectListener);
  }

  /**
   * After all listeners have been added, then Tandem can be launched.  This registers all of the buffered PhetioObjects
   * and subsequent PhetioObjects will be registered directly.
   */
  static launch() {
    assert && assert(!Tandem.launched, 'Tandem cannot be launched twice');
    Tandem.launched = true;
    while (launchListeners.length > 0) {
      launchListeners.shift()();
    }
    assert && assert(launchListeners.length === 0);
  }

  /**
   * ONLY FOR TESTING!!!!
   * This was created to "undo" launch so that tests can better expose cases around calling Tandem.launch()
   */
  static unlaunch() {
    Tandem.launched = false;
    Tandem.bufferedPhetioObjects.length = 0;
    launchListeners.length = 0;
  }

  /**
   * Add a listener that will fire when Tandem is launched
   */
  static addLaunchListener(listener) {
    assert && assert(!Tandem.launched, 'tandem has already been launched, cannot add listener for that hook.');
    launchListeners.push(listener);
  }

  /**
   * Expose collected missing tandems only populated from specific query parameter, see phetioPrintMissingTandems
   * (phet-io internal)
   */
  static missingTandems = missingTandems;

  /**
   * If PhET-iO is enabled in this runtime.
   */
  static PHET_IO_ENABLED = PHET_IO_ENABLED;

  /**
   * When generating an API (whether to output a file or for in-memory comparison), this is marked as true.
   */
  static API_GENERATION = Tandem.PHET_IO_ENABLED && (phet.preloads.phetio.queryParameters.phetioPrintAPI || phet.preloads.phetio.queryParameters.phetioCompareAPI);

  /**
   * If PhET-iO is running with validation enabled.
   */
  static VALIDATION = VALIDATION;

  /**
   * For the API file, the key name for the metadata section.
   */
  static METADATA_KEY = '_metadata';

  /**
   * For the API file, the key name for the data section.
   */
  static DATA_KEY = '_data';

  // Before listeners are wired up, tandems are buffered.  When listeners are wired up, Tandem.launch() is called and
  // buffered tandems are flushed, then subsequent tandems are delivered to listeners directly
  static launched = false;

  // a list of PhetioObjects ready to be sent out to listeners, but can't because Tandem hasn't been launched yet.
  static bufferedPhetioObjects = [];
  createTandemFromPhetioID(phetioID) {
    return this.createTandem(phetioID.split(window.phetio.PhetioIDUtils.SEPARATOR).join(INTER_TERM_SEPARATOR), {
      isValidTandemName: name => /^[a-zA-Z0-9[\],-_]+$/.test(name)
    });
  }
  static RootTandem = class RootTandem extends Tandem {
    /**
     * RootTandems only accept specifically named children.
     */
    createTandem(name, options) {
      if (Tandem.VALIDATION) {
        const allowedOnRoot = name === window.phetio.PhetioIDUtils.GLOBAL_COMPONENT_NAME || name === REQUIRED_TANDEM_NAME || name === OPTIONAL_TANDEM_NAME || name === TEST_TANDEM_NAME || name === window.phetio.PhetioIDUtils.GENERAL_COMPONENT_NAME || _.endsWith(name, Tandem.SCREEN_TANDEM_NAME_SUFFIX);
        assert && assert(allowedOnRoot, `tandem name not allowed on root: "${name}"; perhaps try putting it under general or global`);
      }
      return super.createTandem(name, options);
    }
  };

  /**
   * The root tandem for a simulation
   */
  static ROOT = new Tandem.RootTandem(null, _.camelCase(packageJSON.name));

  /**
   * Many simulation elements are nested under "general". This tandem is for elements that exists in all sims. For a
   * place to put simulation specific globals, see `GLOBAL`
   *
   * @constant
   * @type {Tandem}
   */
  static GENERAL = Tandem.ROOT.createTandem(window.phetio.PhetioIDUtils.GENERAL_COMPONENT_NAME);

  /**
   * Used in unit tests
   */
  static ROOT_TEST = Tandem.ROOT.createTandem(TEST_TANDEM_NAME);

  /**
   * Tandem for model simulation elements that are general to all sims.
   */
  static GENERAL_MODEL = Tandem.GENERAL.createTandem(window.phetio.PhetioIDUtils.MODEL_COMPONENT_NAME);

  /**
   * Tandem for view simulation elements that are general to all sims.
   */
  static GENERAL_VIEW = Tandem.GENERAL.createTandem(window.phetio.PhetioIDUtils.VIEW_COMPONENT_NAME);

  /**
   * Tandem for controller simulation elements that are general to all sims.
   */
  static GENERAL_CONTROLLER = Tandem.GENERAL.createTandem(window.phetio.PhetioIDUtils.CONTROLLER_COMPONENT_NAME);

  /**
   * Simulation elements that don't belong in screens should be nested under "global". Note that this tandem should only
   * have simulation specific elements in them. Instrument items used by all sims under `Tandem.GENERAL`. Most
   * likely simulations elements should not be directly under this, but instead either under the model or view sub
   * tandems.
   *
   * @constant
   * @type {Tandem}
   */
  static GLOBAL = Tandem.ROOT.createTandem(window.phetio.PhetioIDUtils.GLOBAL_COMPONENT_NAME);

  /**
   * Model simulation elements that don't belong in specific screens should be nested under this Tandem. Note that this
   * tandem should only have simulation specific elements in them.
   */
  static GLOBAL_MODEL = Tandem.GLOBAL.createTandem(window.phetio.PhetioIDUtils.MODEL_COMPONENT_NAME);

  /**
   * View simulation elements that don't belong in specific screens should be nested under this Tandem. Note that this
   * tandem should only have simulation specific elements in them.
   */
  static GLOBAL_VIEW = Tandem.GLOBAL.createTandem(window.phetio.PhetioIDUtils.VIEW_COMPONENT_NAME);

  /**
   * Colors used in the simulation.
   */
  static COLORS = Tandem.GLOBAL_VIEW.createTandem(window.phetio.PhetioIDUtils.COLORS_COMPONENT_NAME);

  /**
   * Used to indicate a common code component that supports tandem, but doesn't not require it.  If a tandem is not
   * passed in, then it will not be instrumented.
   */
  static OPTIONAL = Tandem.ROOT.createTandem(OPTIONAL_TANDEM_NAME, {
    required: false,
    supplied: false
  });

  /**
   * To be used exclusively to opt out of situations where a tandem is required, see https://github.com/phetsims/tandem/issues/97.
   */
  static OPT_OUT = Tandem.OPTIONAL;

  /**
   * Some common code (such as Checkbox or RadioButton) must always be instrumented.
   */
  static REQUIRED = Tandem.ROOT.createTandem(REQUIRED_TANDEM_NAME, {
    // let phetioPrintMissingTandems bypass this
    required: VALIDATION || PRINT_MISSING_TANDEMS,
    supplied: false
  });

  /**
   * Use this as the parent tandem for Properties that are related to sim-specific preferences.
   */
  static PREFERENCES = Tandem.GLOBAL_MODEL.createTandem('preferences');
}
Tandem.addLaunchListener(() => {
  while (Tandem.bufferedPhetioObjects.length > 0) {
    const phetioObject = Tandem.bufferedPhetioObjects.shift();
    phetioObject.tandem.addPhetioObject(phetioObject);
  }
  assert && assert(Tandem.bufferedPhetioObjects.length === 0, 'bufferedPhetioObjects should be empty');
});

/**
 * Group Tandem -- Declared in the same file to avoid circular reference errors in module loading.
 */
class GroupTandem extends Tandem {
  // for generating indices from a pool

  /**
   * create with Tandem.createGroupTandem
   */
  constructor(parentTandem, name) {
    super(parentTandem, name);
    this.groupName = name;
    this.groupMemberIndex = 0;
  }

  /**
   * Creates the next tandem in the group.
   */
  createNextTandem() {
    const tandem = this.parentTandem.createTandem(`${this.groupName}${this.groupMemberIndex}`);
    this.groupMemberIndex++;
    return tandem;
  }
}
tandemNamespace.register('Tandem', Tandem);
export default Tandem;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhcnJheVJlbW92ZSIsIm1lcmdlIiwib3B0aW9uaXplIiwidGFuZGVtTmFtZXNwYWNlIiwicGFja2FnZUpTT04iLCJfIiwiaGFzSW4iLCJ3aW5kb3ciLCJwaGV0IiwiY2hpcHBlciIsInBhY2thZ2VPYmplY3QiLCJuYW1lIiwiUEhFVF9JT19FTkFCTEVEIiwiUFJJTlRfTUlTU0lOR19UQU5ERU1TIiwicHJlbG9hZHMiLCJwaGV0aW8iLCJxdWVyeVBhcmFtZXRlcnMiLCJwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zIiwiSVNfVkFMSURBVElPTl9ERUZBVUxUIiwidmFsaWRhdGlvbiIsIklTX1ZBTElEQVRJT05fUVVFUllfUEFSQU1FVEVSX1NQRUNJRklFRCIsIlF1ZXJ5U3RyaW5nTWFjaGluZSIsImNvbnRhaW5zS2V5IiwiSVNfVkFMSURBVElPTl9TUEVDSUZJRUQiLCJwaGV0aW9WYWxpZGF0aW9uIiwiVkFMSURBVElPTiIsIlVOQUxMT1dFRF9UQU5ERU1fTkFNRVMiLCJSRVFVSVJFRF9UQU5ERU1fTkFNRSIsIk9QVElPTkFMX1RBTkRFTV9OQU1FIiwiVEVTVF9UQU5ERU1fTkFNRSIsIklOVEVSX1RFUk1fU0VQQVJBVE9SIiwiUGhldGlvSURVdGlscyIsIkRZTkFNSUNfQVJDSEVUWVBFX05BTUUiLCJtaXNzaW5nVGFuZGVtcyIsInJlcXVpcmVkIiwib3B0aW9uYWwiLCJwaGV0aW9PYmplY3RMaXN0ZW5lcnMiLCJsYXVuY2hMaXN0ZW5lcnMiLCJUYW5kZW0iLCJjaGlsZHJlbiIsImlzRGlzcG9zZWQiLCJTQ1JFRU5fVEFOREVNX05BTUVfU1VGRklYIiwiY29uc3RydWN0b3IiLCJwYXJlbnRUYW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJhc3NlcnQiLCJNRVRBREFUQV9LRVkiLCJwaGV0aW9JRCIsImFwcGVuZCIsIm9wdGlvbnMiLCJzdXBwbGllZCIsImlzVmFsaWRUYW5kZW1OYW1lIiwidGVzdCIsImhhc0NoaWxkIiwiYWRkQ2hpbGQiLCJvbk1pc3NpbmdUYW5kZW0iLCJ0YW5kZW0iLCJzdGFja1RyYWNlIiwiRXJyb3IiLCJzdGFjayIsInB1c2giLCJpbmNsdWRlcyIsImFkZFBoZXRpb09iamVjdCIsInBoZXRpb09iamVjdCIsImxhdW5jaGVkIiwiYnVmZmVyZWRQaGV0aW9PYmplY3RzIiwiaSIsImxlbmd0aCIsImhhc0FuY2VzdG9yIiwiYW5jZXN0b3IiLCJyZW1vdmVQaGV0aW9PYmplY3QiLCJkaXNwb3NlIiwiZ2V0RXh0ZW5kZWRPcHRpb25zIiwiY3JlYXRlVGFuZGVtIiwiY3VycmVudENoaWxkIiwiaGFzT3duUHJvcGVydHkiLCJpdGVyYXRlRGVzY2VuZGFudHMiLCJjYWxsYmFjayIsImNoaWxkTmFtZSIsInJlbW92ZUNoaWxkIiwiZ2V0QXJjaGV0eXBhbFBoZXRpb0lEIiwicmVzdWx0IiwidGVybXMiLCJzcGxpdCIsIm1hcHBlZCIsIm1hcCIsInRlcm0iLCJqb2luIiwiY3JlYXRlR3JvdXBUYW5kZW0iLCJHcm91cFRhbmRlbSIsImVxdWFscyIsImFkZFBoZXRpb09iamVjdExpc3RlbmVyIiwicGhldGlvT2JqZWN0TGlzdGVuZXIiLCJsYXVuY2giLCJzaGlmdCIsInVubGF1bmNoIiwiYWRkTGF1bmNoTGlzdGVuZXIiLCJsaXN0ZW5lciIsIkFQSV9HRU5FUkFUSU9OIiwicGhldGlvUHJpbnRBUEkiLCJwaGV0aW9Db21wYXJlQVBJIiwiREFUQV9LRVkiLCJjcmVhdGVUYW5kZW1Gcm9tUGhldGlvSUQiLCJTRVBBUkFUT1IiLCJSb290VGFuZGVtIiwiYWxsb3dlZE9uUm9vdCIsIkdMT0JBTF9DT01QT05FTlRfTkFNRSIsIkdFTkVSQUxfQ09NUE9ORU5UX05BTUUiLCJlbmRzV2l0aCIsIlJPT1QiLCJjYW1lbENhc2UiLCJHRU5FUkFMIiwiUk9PVF9URVNUIiwiR0VORVJBTF9NT0RFTCIsIk1PREVMX0NPTVBPTkVOVF9OQU1FIiwiR0VORVJBTF9WSUVXIiwiVklFV19DT01QT05FTlRfTkFNRSIsIkdFTkVSQUxfQ09OVFJPTExFUiIsIkNPTlRST0xMRVJfQ09NUE9ORU5UX05BTUUiLCJHTE9CQUwiLCJHTE9CQUxfTU9ERUwiLCJHTE9CQUxfVklFVyIsIkNPTE9SUyIsIkNPTE9SU19DT01QT05FTlRfTkFNRSIsIk9QVElPTkFMIiwiT1BUX09VVCIsIlJFUVVJUkVEIiwiUFJFRkVSRU5DRVMiLCJncm91cE5hbWUiLCJncm91cE1lbWJlckluZGV4IiwiY3JlYXRlTmV4dFRhbmRlbSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGFuZGVtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRhbmRlbSBkZWZpbmVzIGEgc2V0IG9mIHRyZWVzIHRoYXQgYXJlIHVzZWQgdG8gYXNzaWduIHVuaXF1ZSBpZGVudGlmaWVycyB0byBQaGV0aW9PYmplY3RzIGluIFBoRVQgc2ltdWxhdGlvbnMgYW5kXHJcbiAqIG5vdGlmeSBsaXN0ZW5lcnMgd2hlbiB0aGUgYXNzb2NpYXRlZCBQaGV0aW9PYmplY3RzIGhhdmUgYmVlbiBhZGRlZC9yZW1vdmVkLiBJdCBpcyB1c2VkIHRvIHN1cHBvcnQgUGhFVC1pTy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBhcnJheVJlbW92ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvYXJyYXlSZW1vdmUuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuL1BoZXRpb09iamVjdC5qcyc7XHJcbmltcG9ydCB7IFBoZXRpb0lEIH0gZnJvbSAnLi9UYW5kZW1Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgdGFuZGVtTmFtZXNwYWNlIGZyb20gJy4vdGFuZGVtTmFtZXNwYWNlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG4vLyBUYW5kZW0gY2FuJ3QgZGVwZW5kIG9uIGpvaXN0LCBzbyBjYW5ub3QgdXNlIHBhY2thZ2VKU09OIG1vZHVsZVxyXG5jb25zdCBwYWNrYWdlSlNPTiA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQuY2hpcHBlci5wYWNrYWdlT2JqZWN0JyApID8gcGhldC5jaGlwcGVyLnBhY2thZ2VPYmplY3QgOiB7IG5hbWU6ICdwbGFjZWhvbGRlcicgfTtcclxuXHJcbmNvbnN0IFBIRVRfSU9fRU5BQkxFRCA9IF8uaGFzSW4oIHdpbmRvdywgJ3BoZXQucHJlbG9hZHMucGhldGlvJyApO1xyXG5jb25zdCBQUklOVF9NSVNTSU5HX1RBTkRFTVMgPSBQSEVUX0lPX0VOQUJMRUQgJiYgcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXM7XHJcblxyXG4vLyBWYWxpZGF0aW9uIGRlZmF1bHRzIHRvIHRydWUsIGJ1dCBjYW4gYmUgb3ZlcnJpZGRlbiB0byBiZSBmYWxzZSBpbiBwYWNrYWdlLmpzb24uXHJcbmNvbnN0IElTX1ZBTElEQVRJT05fREVGQVVMVCA9IF8uaGFzSW4oIHBhY2thZ2VKU09OLCAncGhldC5waGV0LWlvLnZhbGlkYXRpb24nICkgPyAhIXBhY2thZ2VKU09OLnBoZXRbICdwaGV0LWlvJyBdLnZhbGlkYXRpb24gOiB0cnVlO1xyXG5cclxuLy8gVGhlIGRlZmF1bHQgdmFsdWUgZm9yIHZhbGlkYXRpb24gY2FuIGJlIG92ZXJyaWRkZW4gd2l0aCBhIHF1ZXJ5IHBhcmFtZXRlciA/cGhldGlvVmFsaWRhdGlvbj17dHJ1ZXxmYWxzZX0uXHJcbmNvbnN0IElTX1ZBTElEQVRJT05fUVVFUllfUEFSQU1FVEVSX1NQRUNJRklFRCA9IHdpbmRvdy5RdWVyeVN0cmluZ01hY2hpbmUgJiYgUXVlcnlTdHJpbmdNYWNoaW5lLmNvbnRhaW5zS2V5KCAncGhldGlvVmFsaWRhdGlvbicgKTtcclxuY29uc3QgSVNfVkFMSURBVElPTl9TUEVDSUZJRUQgPSAoIFBIRVRfSU9fRU5BQkxFRCAmJiBJU19WQUxJREFUSU9OX1FVRVJZX1BBUkFNRVRFUl9TUEVDSUZJRUQgKSA/ICEhcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb1ZhbGlkYXRpb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggUEhFVF9JT19FTkFCTEVEICYmIElTX1ZBTElEQVRJT05fREVGQVVMVCApO1xyXG5cclxuY29uc3QgVkFMSURBVElPTiA9IFBIRVRfSU9fRU5BQkxFRCAmJiBJU19WQUxJREFUSU9OX1NQRUNJRklFRCAmJiAhUFJJTlRfTUlTU0lOR19UQU5ERU1TO1xyXG5cclxuY29uc3QgVU5BTExPV0VEX1RBTkRFTV9OQU1FUyA9IFtcclxuICAncGlja2FibGVQcm9wZXJ0eScsIC8vIHVzZSBpbnB1dEVuYWJsZWQgaW5zdGVhZFxyXG5cclxuICAvLyBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcGhldC1pby9pc3N1ZXMvMTkxNSB3ZSBkZWNpZGVkIHRvIHByZWZlciB0aGUgc2NlbmVyeSBsaXN0ZW5lciB0eXBlc1xyXG4gIC8vICgnZHJhZ0xpc3RlbmVyJyBldGMpLiBJZiB5b3UgZW5jb3VudGVyIHRoaXMgYW5kIGZlZWwgbGlrZSBpbnB1dExpc3RlbmVyIGlzIHByZWZlcmFibGUsIGxldCdzIGRpc2N1c3MhXHJcbiAgJ2lucHV0TGlzdGVuZXInLFxyXG4gICdkcmFnSGFuZGxlcicgLy8gcHJlZmVyIGRyYWdMaXN0ZW5lclxyXG5dO1xyXG5cclxuY29uc3QgUkVRVUlSRURfVEFOREVNX05BTUUgPSAncmVxdWlyZWRUYW5kZW0nO1xyXG5jb25zdCBPUFRJT05BTF9UQU5ERU1fTkFNRSA9ICdvcHRpb25hbFRhbmRlbSc7XHJcbmNvbnN0IFRFU1RfVEFOREVNX05BTUUgPSAndGVzdCc7XHJcbmNvbnN0IElOVEVSX1RFUk1fU0VQQVJBVE9SID0gcGhldGlvLlBoZXRpb0lEVXRpbHMuSU5URVJfVEVSTV9TRVBBUkFUT1I7XHJcbmV4cG9ydCBjb25zdCBEWU5BTUlDX0FSQ0hFVFlQRV9OQU1FID0gJ2FyY2hldHlwZSc7XHJcblxyXG4vLyB1c2VkIHRvIGtlZXAgdHJhY2sgb2YgbWlzc2luZyB0YW5kZW1zXHJcbmNvbnN0IG1pc3NpbmdUYW5kZW1zOiB7XHJcbiAgcmVxdWlyZWQ6IEFycmF5PHsgcGhldGlvSUQ6IFBoZXRpb0lEOyBzdGFjazogc3RyaW5nIH0+O1xyXG4gIG9wdGlvbmFsOiBBcnJheTx7IHBoZXRpb0lEOiBQaGV0aW9JRDsgc3RhY2s6IHN0cmluZyB9PjtcclxufSA9IHtcclxuICByZXF1aXJlZDogW10sXHJcbiAgb3B0aW9uYWw6IFtdXHJcbn07XHJcblxyXG50eXBlIFBoZXRpb09iamVjdExpc3RlbmVyID0ge1xyXG4gIGFkZFBoZXRpb09iamVjdDogKCBwaGV0aW9PYmplY3Q6IFBoZXRpb09iamVjdCApID0+IHZvaWQ7XHJcbiAgcmVtb3ZlUGhldGlvT2JqZWN0OiAoIHBoZXRpb09iamVjdDogUGhldGlvT2JqZWN0ICkgPT4gdm9pZDtcclxufTtcclxuXHJcbi8vIExpc3RlbmVycyB0aGF0IHdpbGwgYmUgbm90aWZpZWQgd2hlbiBpdGVtcyBhcmUgcmVnaXN0ZXJlZC9kZXJlZ2lzdGVyZWQuIFNlZSBkb2MgaW4gYWRkUGhldGlvT2JqZWN0TGlzdGVuZXJcclxuY29uc3QgcGhldGlvT2JqZWN0TGlzdGVuZXJzOiBBcnJheTxQaGV0aW9PYmplY3RMaXN0ZW5lcj4gPSBbXTtcclxuXHJcbi8vIGtlZXAgdHJhY2sgb2YgbGlzdGVuZXJzIHRvIGZpcmUgd2hlbiBUYW5kZW0ubGF1bmNoKCkgaXMgY2FsbGVkLlxyXG5jb25zdCBsYXVuY2hMaXN0ZW5lcnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XHJcblxyXG5leHBvcnQgdHlwZSBUYW5kZW1PcHRpb25zID0ge1xyXG4gIHJlcXVpcmVkPzogYm9vbGVhbjtcclxuICBzdXBwbGllZD86IGJvb2xlYW47XHJcbiAgaXNWYWxpZFRhbmRlbU5hbWU/OiAoIG5hbWU6IHN0cmluZyApID0+IGJvb2xlYW47XHJcbn07XHJcblxyXG5jbGFzcyBUYW5kZW0ge1xyXG5cclxuICAvLyBUcmVhdCBhcyByZWFkb25seS4gIE9ubHkgbWFya2VkIGFzIHdyaXRhYmxlIHNvIGl0IGNhbiBiZSBlbGltaW5hdGVkIG9uIGRpc3Bvc2VcclxuICBwdWJsaWMgcGFyZW50VGFuZGVtOiBUYW5kZW0gfCBudWxsO1xyXG5cclxuICAvLyB0aGUgbGFzdCBwYXJ0IG9mIHRoZSB0YW5kZW0gKGFmdGVyIHRoZSBsYXN0IC4pLCB1c2VkIGUuZy4sIGluIEpvaXN0IGZvciBjcmVhdGluZyBidXR0b25cclxuICAvLyBuYW1lcyBkeW5hbWljYWxseSBiYXNlZCBvbiBzY3JlZW4gbmFtZXNcclxuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xyXG4gIHB1YmxpYyByZWFkb25seSBwaGV0aW9JRDogUGhldGlvSUQ7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBjaGlsZHJlbjogUmVjb3JkPHN0cmluZywgVGFuZGVtPiA9IHt9O1xyXG4gIHB1YmxpYyByZWFkb25seSByZXF1aXJlZDogYm9vbGVhbjtcclxuICBwdWJsaWMgcmVhZG9ubHkgc3VwcGxpZWQ6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBpc0Rpc3Bvc2VkID0gZmFsc2U7XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU0NSRUVOX1RBTkRFTV9OQU1FX1NVRkZJWCA9ICdTY3JlZW4nO1xyXG5cclxuICAvKipcclxuICAgKiBUeXBpY2FsbHksIHNpbXMgd2lsbCBjcmVhdGUgdGFuZGVtcyB1c2luZyBgdGFuZGVtLmNyZWF0ZVRhbmRlbWAuICBUaGlzIGNvbnN0cnVjdG9yIGlzIHVzZWQgaW50ZXJuYWxseSBvciB3aGVuXHJcbiAgICogYSB0YW5kZW0gbXVzdCBiZSBjcmVhdGVkIGZyb20gc2NyYXRjaC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBwYXJlbnRUYW5kZW0gLSBwYXJlbnQgZm9yIGEgY2hpbGQgdGFuZGVtLCBvciBudWxsIGZvciBhIHJvb3QgdGFuZGVtXHJcbiAgICogQHBhcmFtIG5hbWUgLSBjb21wb25lbnQgbmFtZSBmb3IgdGhpcyBsZXZlbCwgbGlrZSAncmVzZXRBbGxCdXR0b24nXHJcbiAgICogQHBhcmFtIFtwcm92aWRlZE9wdGlvbnNdXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwYXJlbnRUYW5kZW06IFRhbmRlbSB8IG51bGwsIG5hbWU6IHN0cmluZywgcHJvdmlkZWRPcHRpb25zPzogVGFuZGVtT3B0aW9ucyApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBhcmVudFRhbmRlbSA9PT0gbnVsbCB8fCBwYXJlbnRUYW5kZW0gaW5zdGFuY2VvZiBUYW5kZW0sICdwYXJlbnRUYW5kZW0gc2hvdWxkIGJlIG51bGwgb3IgVGFuZGVtJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbmFtZSAhPT0gVGFuZGVtLk1FVEFEQVRBX0tFWSwgJ25hbWUgY2Fubm90IG1hdGNoIFRhbmRlbS5NRVRBREFUQV9LRVknICk7XHJcblxyXG4gICAgdGhpcy5wYXJlbnRUYW5kZW0gPSBwYXJlbnRUYW5kZW07XHJcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG5cclxuICAgIHRoaXMucGhldGlvSUQgPSB0aGlzLnBhcmVudFRhbmRlbSA/IHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5hcHBlbmQoIHRoaXMucGFyZW50VGFuZGVtLnBoZXRpb0lELCB0aGlzLm5hbWUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdGhpcy5uYW1lO1xyXG5cclxuICAgIC8vIG9wdGlvbnMgKGV2ZW4gc3VidHlwZSBvcHRpb25zKSBtdXN0IGJlIHN0b3JlZCBzbyB0aGV5IGNhbiBiZSBwYXNzZWQgdGhyb3VnaCB0byBjaGlsZHJlblxyXG4gICAgLy8gTm90ZTogTWFrZSBzdXJlIHRoYXQgYWRkZWQgb3B0aW9ucyBoZXJlIGFyZSBhbHNvIGFkZGVkIHRvIG9wdGlvbnMgZm9yIGluaGVyaXRhbmNlIGFuZC9vciBmb3IgY29tcG9zaXRpb25cclxuICAgIC8vIChjcmVhdGVUYW5kZW0vcGFyZW50VGFuZGVtL2dldEV4dGVuZGVkT3B0aW9ucykgYXMgYXBwcm9wcmlhdGUuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRhbmRlbU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIHJlcXVpcmVkID09PSBmYWxzZSBtZWFucyBpdCBpcyBhbiBvcHRpb25hbCB0YW5kZW1cclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcblxyXG4gICAgICAvLyBpZiB0aGUgdGFuZGVtIGlzIHJlcXVpcmVkIGJ1dCBub3Qgc3VwcGxpZWQsIGFuIGVycm9yIHdpbGwgYmUgdGhyb3duLlxyXG4gICAgICBzdXBwbGllZDogdHJ1ZSxcclxuXHJcbiAgICAgIGlzVmFsaWRUYW5kZW1OYW1lOiAoIG5hbWU6IHN0cmluZyApID0+IC9eW2EtekEtWjAtOVtcXF0sXSskLy50ZXN0KCBuYW1lIClcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMuaXNWYWxpZFRhbmRlbU5hbWUoIG5hbWUgKSwgYGludmFsaWQgdGFuZGVtIG5hbWU6ICR7bmFtZX1gICk7XHJcblxyXG4gICAgdGhpcy5jaGlsZHJlbiA9IHt9O1xyXG5cclxuICAgIGlmICggdGhpcy5wYXJlbnRUYW5kZW0gKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnBhcmVudFRhbmRlbS5oYXNDaGlsZCggbmFtZSApLCBgcGFyZW50IHNob3VsZCBub3QgaGF2ZSBjaGlsZDogJHtuYW1lfWAgKTtcclxuICAgICAgdGhpcy5wYXJlbnRUYW5kZW0uYWRkQ2hpbGQoIG5hbWUsIHRoaXMgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJlcXVpcmVkID0gb3B0aW9ucy5yZXF1aXJlZDtcclxuICAgIHRoaXMuc3VwcGxpZWQgPSBvcHRpb25zLnN1cHBsaWVkO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgdGhlIHByb3ZpZGVkIHRhbmRlbSBpcyBub3Qgc3VwcGxpZWQsIHN1cHBvcnQgdGhlID9wcmludE1pc3NpbmdUYW5kZW1zIHF1ZXJ5IHBhcmFtZXRlciBmb3IgZXh0cmEgbG9nZ2luZyBkdXJpbmdcclxuICAgKiBpbml0aWFsIGluc3RydW1lbnRhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIG9uTWlzc2luZ1RhbmRlbSggdGFuZGVtOiBUYW5kZW0gKTogdm9pZCB7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgcXVlcnkgcGFyYW1ldGVyIHBoZXRpb1ByaW50TWlzc2luZ1RhbmRlbXMgaXMgdHJ1ZSwgcmVwb3J0IHRhbmRlbXMgdGhhdCBhcmUgcmVxdWlyZWQgYnV0IG5vdCBzdXBwbGllZFxyXG4gICAgaWYgKCBQUklOVF9NSVNTSU5HX1RBTkRFTVMgJiYgIXRhbmRlbS5zdXBwbGllZCApIHtcclxuICAgICAgY29uc3Qgc3RhY2tUcmFjZSA9IG5ldyBFcnJvcigpLnN0YWNrITtcclxuICAgICAgaWYgKCB0YW5kZW0ucmVxdWlyZWQgKSB7XHJcbiAgICAgICAgbWlzc2luZ1RhbmRlbXMucmVxdWlyZWQucHVzaCggeyBwaGV0aW9JRDogdGFuZGVtLnBoZXRpb0lELCBzdGFjazogc3RhY2tUcmFjZSB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFdoZW4gdGhlIHF1ZXJ5IHBhcmFtZXRlciBwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zIGlzIHRydWUsIHJlcG9ydCB0YW5kZW1zIHRoYXQgYXJlIG9wdGlvbmFsIGJ1dCBub3RcclxuICAgICAgICAvLyBzdXBwbGllZCwgYnV0IG5vdCBmb3IgRm9udHMgYmVjYXVzZSB0aGV5IGFyZSB0b28gbnVtZXJvdXMuXHJcbiAgICAgICAgaWYgKCAhc3RhY2tUcmFjZS5pbmNsdWRlcyggJ0ZvbnQnICkgKSB7XHJcbiAgICAgICAgICBtaXNzaW5nVGFuZGVtcy5vcHRpb25hbC5wdXNoKCB7IHBoZXRpb0lEOiB0YW5kZW0ucGhldGlvSUQsIHN0YWNrOiBzdGFja1RyYWNlIH0gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBQaGV0aW9PYmplY3QuICBGb3IgZXhhbXBsZSwgaXQgY291bGQgYmUgYW4gYXhvbiBQcm9wZXJ0eSwgU0NFTkVSWS9Ob2RlIG9yIFNVTi9Sb3VuZFB1c2hCdXR0b24uXHJcbiAgICogcGhldGlvRW5naW5lIGxpc3RlbnMgZm9yIHdoZW4gUGhldGlvT2JqZWN0cyBhcmUgYWRkZWQgYW5kIHJlbW92ZWQgdG8ga2VlcCB0cmFjayBvZiB0aGVtIGZvciBQaEVULWlPLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZGRQaGV0aW9PYmplY3QoIHBoZXRpb09iamVjdDogUGhldGlvT2JqZWN0ICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggUEhFVF9JT19FTkFCTEVEICkge1xyXG5cclxuICAgICAgLy8gVGhyb3cgYW4gZXJyb3IgaWYgdGhlIHRhbmRlbSBpcyByZXF1aXJlZCBidXQgbm90IHN1cHBsaWVkXHJcbiAgICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoICEoIHRoaXMucmVxdWlyZWQgJiYgIXRoaXMuc3VwcGxpZWQgKSwgJ1RhbmRlbSB3YXMgcmVxdWlyZWQgYnV0IG5vdCBzdXBwbGllZCcgKTtcclxuXHJcbiAgICAgIC8vIElmIHRhbmRlbSBpcyBvcHRpb25hbCBhbmQgbm90IHN1cHBsaWVkLCB0aGVuIGlnbm9yZSBpdC5cclxuICAgICAgaWYgKCAhdGhpcy5yZXF1aXJlZCAmJiAhdGhpcy5zdXBwbGllZCApIHtcclxuXHJcbiAgICAgICAgLy8gT3B0aW9uYWxseSBpbnN0cnVtZW50ZWQgdHlwZXMgd2l0aG91dCB0YW5kZW1zIGFyZSBub3QgYWRkZWQuXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoICFUYW5kZW0ubGF1bmNoZWQgKSB7XHJcbiAgICAgICAgVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0cy5wdXNoKCBwaGV0aW9PYmplY3QgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBwaGV0aW9PYmplY3RMaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBwaGV0aW9PYmplY3RMaXN0ZW5lcnNbIGkgXS5hZGRQaGV0aW9PYmplY3QoIHBoZXRpb09iamVjdCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgVGFuZGVtIGhhcyB0aGUgc3BlY2lmaWVkIGFuY2VzdG9yIFRhbmRlbS5cclxuICAgKi9cclxuICBwdWJsaWMgaGFzQW5jZXN0b3IoIGFuY2VzdG9yOiBUYW5kZW0gKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5wYXJlbnRUYW5kZW0gPT09IGFuY2VzdG9yIHx8ICEhKCB0aGlzLnBhcmVudFRhbmRlbSAmJiB0aGlzLnBhcmVudFRhbmRlbS5oYXNBbmNlc3RvciggYW5jZXN0b3IgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhIFBoZXRpb09iamVjdCBhbmQgc2lnbmlmaWVzIHRvIGxpc3RlbmVycyB0aGF0IGl0IGhhcyBiZWVuIHJlbW92ZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVBoZXRpb09iamVjdCggcGhldGlvT2JqZWN0OiBQaGV0aW9PYmplY3QgKTogdm9pZCB7XHJcblxyXG4gICAgaWYgKCAhdGhpcy5yZXF1aXJlZCAmJiAhdGhpcy5zdXBwbGllZCApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9ubHkgYWN0aXZlIHdoZW4gcnVubmluZyBhcyBwaGV0LWlvXHJcbiAgICBpZiAoIFBIRVRfSU9fRU5BQkxFRCApIHtcclxuICAgICAgaWYgKCAhVGFuZGVtLmxhdW5jaGVkICkge1xyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoIFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMuaW5jbHVkZXMoIHBoZXRpb09iamVjdCApLCAnc2hvdWxkIGNvbnRhaW4gaXRlbScgKTtcclxuICAgICAgICBhcnJheVJlbW92ZSggVGFuZGVtLmJ1ZmZlcmVkUGhldGlvT2JqZWN0cywgcGhldGlvT2JqZWN0ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgcGhldGlvT2JqZWN0TGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgICAgcGhldGlvT2JqZWN0TGlzdGVuZXJzWyBpIF0ucmVtb3ZlUGhldGlvT2JqZWN0KCBwaGV0aW9PYmplY3QgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwaGV0aW9PYmplY3QudGFuZGVtLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVzZWQgZm9yIGNyZWF0aW5nIG5ldyB0YW5kZW1zLCBleHRlbmRzIHRoaXMgVGFuZGVtJ3Mgb3B0aW9ucyB3aXRoIHRoZSBwYXNzZWQtaW4gb3B0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RXh0ZW5kZWRPcHRpb25zKCBvcHRpb25zPzogVGFuZGVtT3B0aW9ucyApOiBUYW5kZW1PcHRpb25zIHtcclxuXHJcbiAgICAvLyBBbnkgY2hpbGQgb2Ygc29tZXRoaW5nIHNob3VsZCBiZSBwYXNzZWQgYWxsIGluaGVyaXRlZCBvcHRpb25zLiBNYWtlIHN1cmUgdGhhdCB0aGlzIGV4dGVuZCBjYWxsIGluY2x1ZGVzIGFsbFxyXG4gICAgLy8gdGhhdCBtYWtlIHNlbnNlIGZyb20gdGhlIGNvbnN0cnVjdG9yJ3MgZXh0ZW5kIGNhbGwuXHJcbiAgICByZXR1cm4gbWVyZ2UoIHtcclxuICAgICAgc3VwcGxpZWQ6IHRoaXMuc3VwcGxpZWQsXHJcbiAgICAgIHJlcXVpcmVkOiB0aGlzLnJlcXVpcmVkXHJcbiAgICB9LCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgVGFuZGVtIGJ5IGFwcGVuZGluZyB0aGUgZ2l2ZW4gaWQsIG9yIGlmIHRoZSBjaGlsZCBUYW5kZW0gYWxyZWFkeSBleGlzdHMsIHJldHVybiBpdCBpbnN0ZWFkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVUYW5kZW0oIG5hbWU6IHN0cmluZywgb3B0aW9ucz86IFRhbmRlbU9wdGlvbnMgKTogVGFuZGVtIHtcclxuICAgIGFzc2VydCAmJiBUYW5kZW0uVkFMSURBVElPTiAmJiBhc3NlcnQoICFVTkFMTE9XRURfVEFOREVNX05BTUVTLmluY2x1ZGVzKCBuYW1lICksICd0YW5kZW0gbmFtZSBpcyBub3QgYWxsb3dlZDogJyArIG5hbWUgKTtcclxuXHJcbiAgICBvcHRpb25zID0gdGhpcy5nZXRFeHRlbmRlZE9wdGlvbnMoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyByZS11c2UgdGhlIGNoaWxkIGlmIGl0IGFscmVhZHkgZXhpc3RzLCBidXQgbWFrZSBzdXJlIGl0IGJlaGF2ZXMgdGhlIHNhbWUuXHJcbiAgICBpZiAoIHRoaXMuaGFzQ2hpbGQoIG5hbWUgKSApIHtcclxuICAgICAgY29uc3QgY3VycmVudENoaWxkID0gdGhpcy5jaGlsZHJlblsgbmFtZSBdO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjdXJyZW50Q2hpbGQucmVxdWlyZWQgPT09IG9wdGlvbnMucmVxdWlyZWQgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggY3VycmVudENoaWxkLnN1cHBsaWVkID09PSBvcHRpb25zLnN1cHBsaWVkICk7XHJcbiAgICAgIHJldHVybiBjdXJyZW50Q2hpbGQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBUYW5kZW0oIHRoaXMsIG5hbWUsIG9wdGlvbnMgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNDaGlsZCggbmFtZTogc3RyaW5nICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuY2hpbGRyZW4uaGFzT3duUHJvcGVydHkoIG5hbWUgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBhZGRDaGlsZCggbmFtZTogc3RyaW5nLCB0YW5kZW06IFRhbmRlbSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLmhhc0NoaWxkKCBuYW1lICkgKTtcclxuICAgIHRoaXMuY2hpbGRyZW5bIG5hbWUgXSA9IHRhbmRlbTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZpcmUgYSBjYWxsYmFjayBvbiBhbGwgZGVzY2VuZGFudHMgb2YgdGhpcyBUYW5kZW1cclxuICAgKi9cclxuICBwdWJsaWMgaXRlcmF0ZURlc2NlbmRhbnRzKCBjYWxsYmFjazogKCB0OiBUYW5kZW0gKSA9PiB2b2lkICk6IHZvaWQge1xyXG4gICAgZm9yICggY29uc3QgY2hpbGROYW1lIGluIHRoaXMuY2hpbGRyZW4gKSB7XHJcbiAgICAgIGlmICggdGhpcy5jaGlsZHJlbi5oYXNPd25Qcm9wZXJ0eSggY2hpbGROYW1lICkgKSB7XHJcbiAgICAgICAgY2FsbGJhY2soIHRoaXMuY2hpbGRyZW5bIGNoaWxkTmFtZSBdICk7XHJcbiAgICAgICAgdGhpcy5jaGlsZHJlblsgY2hpbGROYW1lIF0uaXRlcmF0ZURlc2NlbmRhbnRzKCBjYWxsYmFjayApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHJlbW92ZUNoaWxkKCBjaGlsZE5hbWU6IHN0cmluZyApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaGFzQ2hpbGQoIGNoaWxkTmFtZSApICk7XHJcbiAgICBkZWxldGUgdGhpcy5jaGlsZHJlblsgY2hpbGROYW1lIF07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc0Rpc3Bvc2VkLCAnYWxyZWFkeSBkaXNwb3NlZCcgKTtcclxuXHJcbiAgICB0aGlzLnBhcmVudFRhbmRlbSEucmVtb3ZlQ2hpbGQoIHRoaXMubmFtZSApO1xyXG4gICAgdGhpcy5wYXJlbnRUYW5kZW0gPSBudWxsO1xyXG5cclxuICAgIHRoaXMuaXNEaXNwb3NlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGb3IgQVBJIHZhbGlkYXRpb24sIGVhY2ggUGhldGlvT2JqZWN0IGhhcyBhIGNvcnJlc3BvbmRpbmcgY29uY3JldGUgUGhldGlvT2JqZWN0IGZvciBjb21wYXJpc29uLiBOb24tZHluYW1pY1xyXG4gICAqIFBoZXRpb09iamVjdHMgaGF2ZSB0aGUgdHJpdmlhbCBjYXNlIHdoZXJlIGl0cyBhcmNoZXR5cGFsIHBoZXRpb0lEIGlzIHRoZSBzYW1lIGFzIGl0cyBwaGV0aW9JRC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0QXJjaGV0eXBhbFBoZXRpb0lEKCk6IFBoZXRpb0lEIHtcclxuXHJcbiAgICAvLyBEeW5hbWljIGVsZW1lbnRzIGFsd2F5cyBoYXZlIGEgcGFyZW50IGNvbnRhaW5lciwgaGVuY2Ugc2luY2UgdGhpcyBkb2VzIG5vdCBoYXZlIGEgcGFyZW50LCBpdCBtdXN0IGFscmVhZHkgYmUgY29uY3JldGVcclxuICAgIGNvbnN0IHJlc3VsdDogUGhldGlvSUQgPSB0aGlzLnBhcmVudFRhbmRlbSA/IHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5hcHBlbmQoIHRoaXMucGFyZW50VGFuZGVtLmdldEFyY2hldHlwYWxQaGV0aW9JRCgpLCB0aGlzLm5hbWUgKSA6IHRoaXMucGhldGlvSUQ7XHJcblxyXG4gICAgLy8gRm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9heG9uL2lzc3Vlcy80MDgsIHdlIG5lZWQgdG8gYWNjZXNzIGFyY2hldHlwZXMgZm9yIFRhbmRlbXMgZnJvbSBjcmVhdGVUYW5kZW1Gcm9tUGhldGlvSURcclxuICAgIGlmICggcmVzdWx0LmluY2x1ZGVzKCAnXycgKSApIHtcclxuICAgICAgY29uc3QgdGVybXMgPSByZXN1bHQuc3BsaXQoIElOVEVSX1RFUk1fU0VQQVJBVE9SICk7XHJcbiAgICAgIGNvbnN0IG1hcHBlZCA9IHRlcm1zLm1hcCggdGVybSA9PiB0ZXJtLmluY2x1ZGVzKCAnXycgKSA/IERZTkFNSUNfQVJDSEVUWVBFX05BTUUgOiB0ZXJtICk7XHJcbiAgICAgIHJldHVybiBtYXBwZWQuam9pbiggSU5URVJfVEVSTV9TRVBBUkFUT1IgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGdyb3VwIHRhbmRlbSBmb3IgY3JlYXRpbmcgbXVsdGlwbGUgaW5kZXhlZCBjaGlsZCB0YW5kZW1zLCBzdWNoIGFzOlxyXG4gICAqIHNpbS5zY3JlZW4ubW9kZWwuZWxlY3Ryb24wXHJcbiAgICogc2ltLnNjcmVlbi5tb2RlbC5lbGVjdHJvbjFcclxuICAgKlxyXG4gICAqIEluIHRoaXMgY2FzZSwgJ3NpbS5zY3JlZW4ubW9kZWwuZWxlY3Ryb24nIGlzIHRoZSBzdHJpbmcgcGFzc2VkIHRvIGNyZWF0ZUdyb3VwVGFuZGVtLlxyXG4gICAqXHJcbiAgICogVXNlZCBmb3IgYXJyYXlzLCBvYnNlcnZhYmxlIGFycmF5cywgb3Igd2hlbiBtYW55IGVsZW1lbnRzIG9mIHRoZSBzYW1lIHR5cGUgYXJlIGNyZWF0ZWQgYW5kIHRoZXkgZG8gbm90IG90aGVyd2lzZVxyXG4gICAqIGhhdmUgdW5pcXVlIGlkZW50aWZpZXJzLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBjcmVhdGVHcm91cFRhbmRlbSggbmFtZTogc3RyaW5nICk6IEdyb3VwVGFuZGVtIHtcclxuICAgIGlmICggdGhpcy5jaGlsZHJlblsgbmFtZSBdICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jaGlsZHJlblsgbmFtZSBdIGFzIEdyb3VwVGFuZGVtO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBHcm91cFRhbmRlbSggdGhpcywgbmFtZSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVxdWFscyggdGFuZGVtOiBUYW5kZW0gKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5waGV0aW9JRCA9PT0gdGFuZGVtLnBoZXRpb0lEO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBub3RpZmllZCB3aGVuIGl0ZW1zIGFyZSByZWdpc3RlcmVkL2RlcmVnaXN0ZXJlZFxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgYWRkUGhldGlvT2JqZWN0TGlzdGVuZXIoIHBoZXRpb09iamVjdExpc3RlbmVyOiBQaGV0aW9PYmplY3RMaXN0ZW5lciApOiB2b2lkIHtcclxuICAgIHBoZXRpb09iamVjdExpc3RlbmVycy5wdXNoKCBwaGV0aW9PYmplY3RMaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWZ0ZXIgYWxsIGxpc3RlbmVycyBoYXZlIGJlZW4gYWRkZWQsIHRoZW4gVGFuZGVtIGNhbiBiZSBsYXVuY2hlZC4gIFRoaXMgcmVnaXN0ZXJzIGFsbCBvZiB0aGUgYnVmZmVyZWQgUGhldGlvT2JqZWN0c1xyXG4gICAqIGFuZCBzdWJzZXF1ZW50IFBoZXRpb09iamVjdHMgd2lsbCBiZSByZWdpc3RlcmVkIGRpcmVjdGx5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgbGF1bmNoKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIVRhbmRlbS5sYXVuY2hlZCwgJ1RhbmRlbSBjYW5ub3QgYmUgbGF1bmNoZWQgdHdpY2UnICk7XHJcbiAgICBUYW5kZW0ubGF1bmNoZWQgPSB0cnVlO1xyXG5cclxuICAgIHdoaWxlICggbGF1bmNoTGlzdGVuZXJzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIGxhdW5jaExpc3RlbmVycy5zaGlmdCgpISgpO1xyXG4gICAgfVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbGF1bmNoTGlzdGVuZXJzLmxlbmd0aCA9PT0gMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogT05MWSBGT1IgVEVTVElORyEhISFcclxuICAgKiBUaGlzIHdhcyBjcmVhdGVkIHRvIFwidW5kb1wiIGxhdW5jaCBzbyB0aGF0IHRlc3RzIGNhbiBiZXR0ZXIgZXhwb3NlIGNhc2VzIGFyb3VuZCBjYWxsaW5nIFRhbmRlbS5sYXVuY2goKVxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgdW5sYXVuY2goKTogdm9pZCB7XHJcbiAgICBUYW5kZW0ubGF1bmNoZWQgPSBmYWxzZTtcclxuICAgIFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMubGVuZ3RoID0gMDtcclxuICAgIGxhdW5jaExpc3RlbmVycy5sZW5ndGggPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgbGlzdGVuZXIgdGhhdCB3aWxsIGZpcmUgd2hlbiBUYW5kZW0gaXMgbGF1bmNoZWRcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGFkZExhdW5jaExpc3RlbmVyKCBsaXN0ZW5lcjogKCkgPT4gdm9pZCApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFUYW5kZW0ubGF1bmNoZWQsICd0YW5kZW0gaGFzIGFscmVhZHkgYmVlbiBsYXVuY2hlZCwgY2Fubm90IGFkZCBsaXN0ZW5lciBmb3IgdGhhdCBob29rLicgKTtcclxuICAgIGxhdW5jaExpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRXhwb3NlIGNvbGxlY3RlZCBtaXNzaW5nIHRhbmRlbXMgb25seSBwb3B1bGF0ZWQgZnJvbSBzcGVjaWZpYyBxdWVyeSBwYXJhbWV0ZXIsIHNlZSBwaGV0aW9QcmludE1pc3NpbmdUYW5kZW1zXHJcbiAgICogKHBoZXQtaW8gaW50ZXJuYWwpXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBtaXNzaW5nVGFuZGVtcyA9IG1pc3NpbmdUYW5kZW1zO1xyXG5cclxuICAvKipcclxuICAgKiBJZiBQaEVULWlPIGlzIGVuYWJsZWQgaW4gdGhpcyBydW50aW1lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUEhFVF9JT19FTkFCTEVEID0gUEhFVF9JT19FTkFCTEVEO1xyXG5cclxuICAvKipcclxuICAgKiBXaGVuIGdlbmVyYXRpbmcgYW4gQVBJICh3aGV0aGVyIHRvIG91dHB1dCBhIGZpbGUgb3IgZm9yIGluLW1lbW9yeSBjb21wYXJpc29uKSwgdGhpcyBpcyBtYXJrZWQgYXMgdHJ1ZS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEFQSV9HRU5FUkFUSU9OID0gVGFuZGVtLlBIRVRfSU9fRU5BQkxFRCAmJiAoIHBoZXQucHJlbG9hZHMucGhldGlvLnF1ZXJ5UGFyYW1ldGVycy5waGV0aW9QcmludEFQSSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzLnBoZXRpb0NvbXBhcmVBUEkgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogSWYgUGhFVC1pTyBpcyBydW5uaW5nIHdpdGggdmFsaWRhdGlvbiBlbmFibGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgVkFMSURBVElPTiA9IFZBTElEQVRJT047XHJcblxyXG4gIC8qKlxyXG4gICAqIEZvciB0aGUgQVBJIGZpbGUsIHRoZSBrZXkgbmFtZSBmb3IgdGhlIG1ldGFkYXRhIHNlY3Rpb24uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBNRVRBREFUQV9LRVkgPSAnX21ldGFkYXRhJztcclxuXHJcbiAgLyoqXHJcbiAgICogRm9yIHRoZSBBUEkgZmlsZSwgdGhlIGtleSBuYW1lIGZvciB0aGUgZGF0YSBzZWN0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgREFUQV9LRVkgPSAnX2RhdGEnO1xyXG5cclxuICAvLyBCZWZvcmUgbGlzdGVuZXJzIGFyZSB3aXJlZCB1cCwgdGFuZGVtcyBhcmUgYnVmZmVyZWQuICBXaGVuIGxpc3RlbmVycyBhcmUgd2lyZWQgdXAsIFRhbmRlbS5sYXVuY2goKSBpcyBjYWxsZWQgYW5kXHJcbiAgLy8gYnVmZmVyZWQgdGFuZGVtcyBhcmUgZmx1c2hlZCwgdGhlbiBzdWJzZXF1ZW50IHRhbmRlbXMgYXJlIGRlbGl2ZXJlZCB0byBsaXN0ZW5lcnMgZGlyZWN0bHlcclxuICBwdWJsaWMgc3RhdGljIGxhdW5jaGVkID0gZmFsc2U7XHJcblxyXG4gIC8vIGEgbGlzdCBvZiBQaGV0aW9PYmplY3RzIHJlYWR5IHRvIGJlIHNlbnQgb3V0IHRvIGxpc3RlbmVycywgYnV0IGNhbid0IGJlY2F1c2UgVGFuZGVtIGhhc24ndCBiZWVuIGxhdW5jaGVkIHlldC5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGJ1ZmZlcmVkUGhldGlvT2JqZWN0czogUGhldGlvT2JqZWN0W10gPSBbXTtcclxuXHJcbiAgcHVibGljIGNyZWF0ZVRhbmRlbUZyb21QaGV0aW9JRCggcGhldGlvSUQ6IFBoZXRpb0lEICk6IFRhbmRlbSB7XHJcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVUYW5kZW0oIHBoZXRpb0lELnNwbGl0KCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuU0VQQVJBVE9SICkuam9pbiggSU5URVJfVEVSTV9TRVBBUkFUT1IgKSwge1xyXG4gICAgICBpc1ZhbGlkVGFuZGVtTmFtZTogKCBuYW1lOiBzdHJpbmcgKSA9PiAvXlthLXpBLVowLTlbXFxdLC1fXSskLy50ZXN0KCBuYW1lIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFJvb3RUYW5kZW0gPSBjbGFzcyBSb290VGFuZGVtIGV4dGVuZHMgVGFuZGVtIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJvb3RUYW5kZW1zIG9ubHkgYWNjZXB0IHNwZWNpZmljYWxseSBuYW1lZCBjaGlsZHJlbi5cclxuICAgICAqL1xyXG4gICAgcHVibGljIG92ZXJyaWRlIGNyZWF0ZVRhbmRlbSggbmFtZTogc3RyaW5nLCBvcHRpb25zPzogVGFuZGVtT3B0aW9ucyApOiBUYW5kZW0ge1xyXG4gICAgICBpZiAoIFRhbmRlbS5WQUxJREFUSU9OICkge1xyXG4gICAgICAgIGNvbnN0IGFsbG93ZWRPblJvb3QgPSBuYW1lID09PSB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuR0xPQkFMX0NPTVBPTkVOVF9OQU1FIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPT09IFJFUVVJUkVEX1RBTkRFTV9OQU1FIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPT09IE9QVElPTkFMX1RBTkRFTV9OQU1FIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUgPT09IFRFU1RfVEFOREVNX05BTUUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSA9PT0gd2luZG93LnBoZXRpby5QaGV0aW9JRFV0aWxzLkdFTkVSQUxfQ09NUE9ORU5UX05BTUUgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5lbmRzV2l0aCggbmFtZSwgVGFuZGVtLlNDUkVFTl9UQU5ERU1fTkFNRV9TVUZGSVggKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBhbGxvd2VkT25Sb290LCBgdGFuZGVtIG5hbWUgbm90IGFsbG93ZWQgb24gcm9vdDogXCIke25hbWV9XCI7IHBlcmhhcHMgdHJ5IHB1dHRpbmcgaXQgdW5kZXIgZ2VuZXJhbCBvciBnbG9iYWxgICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBzdXBlci5jcmVhdGVUYW5kZW0oIG5hbWUsIG9wdGlvbnMgKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBUaGUgcm9vdCB0YW5kZW0gZm9yIGEgc2ltdWxhdGlvblxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgUk9PVCA9IG5ldyBUYW5kZW0uUm9vdFRhbmRlbSggbnVsbCwgXy5jYW1lbENhc2UoIHBhY2thZ2VKU09OLm5hbWUgKSApO1xyXG5cclxuICAvKipcclxuICAgKiBNYW55IHNpbXVsYXRpb24gZWxlbWVudHMgYXJlIG5lc3RlZCB1bmRlciBcImdlbmVyYWxcIi4gVGhpcyB0YW5kZW0gaXMgZm9yIGVsZW1lbnRzIHRoYXQgZXhpc3RzIGluIGFsbCBzaW1zLiBGb3IgYVxyXG4gICAqIHBsYWNlIHRvIHB1dCBzaW11bGF0aW9uIHNwZWNpZmljIGdsb2JhbHMsIHNlZSBgR0xPQkFMYFxyXG4gICAqXHJcbiAgICogQGNvbnN0YW50XHJcbiAgICogQHR5cGUge1RhbmRlbX1cclxuICAgKi9cclxuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBHRU5FUkFMID0gVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuR0VORVJBTF9DT01QT05FTlRfTkFNRSApO1xyXG5cclxuICAvKipcclxuICAgKiBVc2VkIGluIHVuaXQgdGVzdHNcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJPT1RfVEVTVCA9IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggVEVTVF9UQU5ERU1fTkFNRSApO1xyXG5cclxuICAvKipcclxuICAgKiBUYW5kZW0gZm9yIG1vZGVsIHNpbXVsYXRpb24gZWxlbWVudHMgdGhhdCBhcmUgZ2VuZXJhbCB0byBhbGwgc2ltcy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdFTkVSQUxfTU9ERUwgPSBUYW5kZW0uR0VORVJBTC5jcmVhdGVUYW5kZW0oIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5NT0RFTF9DT01QT05FTlRfTkFNRSApO1xyXG5cclxuICAvKipcclxuICAgKiBUYW5kZW0gZm9yIHZpZXcgc2ltdWxhdGlvbiBlbGVtZW50cyB0aGF0IGFyZSBnZW5lcmFsIHRvIGFsbCBzaW1zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgR0VORVJBTF9WSUVXID0gVGFuZGVtLkdFTkVSQUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuVklFV19DT01QT05FTlRfTkFNRSApO1xyXG5cclxuICAvKipcclxuICAgKiBUYW5kZW0gZm9yIGNvbnRyb2xsZXIgc2ltdWxhdGlvbiBlbGVtZW50cyB0aGF0IGFyZSBnZW5lcmFsIHRvIGFsbCBzaW1zLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgR0VORVJBTF9DT05UUk9MTEVSID0gVGFuZGVtLkdFTkVSQUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuQ09OVFJPTExFUl9DT01QT05FTlRfTkFNRSApO1xyXG5cclxuICAvKipcclxuICAgKiBTaW11bGF0aW9uIGVsZW1lbnRzIHRoYXQgZG9uJ3QgYmVsb25nIGluIHNjcmVlbnMgc2hvdWxkIGJlIG5lc3RlZCB1bmRlciBcImdsb2JhbFwiLiBOb3RlIHRoYXQgdGhpcyB0YW5kZW0gc2hvdWxkIG9ubHlcclxuICAgKiBoYXZlIHNpbXVsYXRpb24gc3BlY2lmaWMgZWxlbWVudHMgaW4gdGhlbS4gSW5zdHJ1bWVudCBpdGVtcyB1c2VkIGJ5IGFsbCBzaW1zIHVuZGVyIGBUYW5kZW0uR0VORVJBTGAuIE1vc3RcclxuICAgKiBsaWtlbHkgc2ltdWxhdGlvbnMgZWxlbWVudHMgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSB1bmRlciB0aGlzLCBidXQgaW5zdGVhZCBlaXRoZXIgdW5kZXIgdGhlIG1vZGVsIG9yIHZpZXcgc3ViXHJcbiAgICogdGFuZGVtcy5cclxuICAgKlxyXG4gICAqIEBjb25zdGFudFxyXG4gICAqIEB0eXBlIHtUYW5kZW19XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgR0xPQkFMID0gVGFuZGVtLlJPT1QuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuR0xPQkFMX0NPTVBPTkVOVF9OQU1FICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vZGVsIHNpbXVsYXRpb24gZWxlbWVudHMgdGhhdCBkb24ndCBiZWxvbmcgaW4gc3BlY2lmaWMgc2NyZWVucyBzaG91bGQgYmUgbmVzdGVkIHVuZGVyIHRoaXMgVGFuZGVtLiBOb3RlIHRoYXQgdGhpc1xyXG4gICAqIHRhbmRlbSBzaG91bGQgb25seSBoYXZlIHNpbXVsYXRpb24gc3BlY2lmaWMgZWxlbWVudHMgaW4gdGhlbS5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IEdMT0JBTF9NT0RFTCA9IFRhbmRlbS5HTE9CQUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuTU9ERUxfQ09NUE9ORU5UX05BTUUgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogVmlldyBzaW11bGF0aW9uIGVsZW1lbnRzIHRoYXQgZG9uJ3QgYmVsb25nIGluIHNwZWNpZmljIHNjcmVlbnMgc2hvdWxkIGJlIG5lc3RlZCB1bmRlciB0aGlzIFRhbmRlbS4gTm90ZSB0aGF0IHRoaXNcclxuICAgKiB0YW5kZW0gc2hvdWxkIG9ubHkgaGF2ZSBzaW11bGF0aW9uIHNwZWNpZmljIGVsZW1lbnRzIGluIHRoZW0uXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBHTE9CQUxfVklFVyA9IFRhbmRlbS5HTE9CQUwuY3JlYXRlVGFuZGVtKCB3aW5kb3cucGhldGlvLlBoZXRpb0lEVXRpbHMuVklFV19DT01QT05FTlRfTkFNRSApO1xyXG5cclxuICAvKipcclxuICAgKiBDb2xvcnMgdXNlZCBpbiB0aGUgc2ltdWxhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPTE9SUyA9IFRhbmRlbS5HTE9CQUxfVklFVy5jcmVhdGVUYW5kZW0oIHdpbmRvdy5waGV0aW8uUGhldGlvSURVdGlscy5DT0xPUlNfQ09NUE9ORU5UX05BTUUgKTtcclxuXHJcbiAgLyoqXHJcbiAgICogVXNlZCB0byBpbmRpY2F0ZSBhIGNvbW1vbiBjb2RlIGNvbXBvbmVudCB0aGF0IHN1cHBvcnRzIHRhbmRlbSwgYnV0IGRvZXNuJ3Qgbm90IHJlcXVpcmUgaXQuICBJZiBhIHRhbmRlbSBpcyBub3RcclxuICAgKiBwYXNzZWQgaW4sIHRoZW4gaXQgd2lsbCBub3QgYmUgaW5zdHJ1bWVudGVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgT1BUSU9OQUwgPSBUYW5kZW0uUk9PVC5jcmVhdGVUYW5kZW0oIE9QVElPTkFMX1RBTkRFTV9OQU1FLCB7XHJcbiAgICByZXF1aXJlZDogZmFsc2UsXHJcbiAgICBzdXBwbGllZDogZmFsc2VcclxuICB9ICk7XHJcblxyXG4gIC8qKlxyXG4gICAqIFRvIGJlIHVzZWQgZXhjbHVzaXZlbHkgdG8gb3B0IG91dCBvZiBzaXR1YXRpb25zIHdoZXJlIGEgdGFuZGVtIGlzIHJlcXVpcmVkLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3RhbmRlbS9pc3N1ZXMvOTcuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBPUFRfT1VUID0gVGFuZGVtLk9QVElPTkFMO1xyXG5cclxuICAvKipcclxuICAgKiBTb21lIGNvbW1vbiBjb2RlIChzdWNoIGFzIENoZWNrYm94IG9yIFJhZGlvQnV0dG9uKSBtdXN0IGFsd2F5cyBiZSBpbnN0cnVtZW50ZWQuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBSRVFVSVJFRCA9IFRhbmRlbS5ST09ULmNyZWF0ZVRhbmRlbSggUkVRVUlSRURfVEFOREVNX05BTUUsIHtcclxuXHJcbiAgICAvLyBsZXQgcGhldGlvUHJpbnRNaXNzaW5nVGFuZGVtcyBieXBhc3MgdGhpc1xyXG4gICAgcmVxdWlyZWQ6IFZBTElEQVRJT04gfHwgUFJJTlRfTUlTU0lOR19UQU5ERU1TLFxyXG4gICAgc3VwcGxpZWQ6IGZhbHNlXHJcbiAgfSApO1xyXG5cclxuICAvKipcclxuICAgKiBVc2UgdGhpcyBhcyB0aGUgcGFyZW50IHRhbmRlbSBmb3IgUHJvcGVydGllcyB0aGF0IGFyZSByZWxhdGVkIHRvIHNpbS1zcGVjaWZpYyBwcmVmZXJlbmNlcy5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFBSRUZFUkVOQ0VTID0gVGFuZGVtLkdMT0JBTF9NT0RFTC5jcmVhdGVUYW5kZW0oICdwcmVmZXJlbmNlcycgKTtcclxuXHJcblxyXG59XHJcblxyXG5UYW5kZW0uYWRkTGF1bmNoTGlzdGVuZXIoICgpID0+IHtcclxuICB3aGlsZSAoIFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMubGVuZ3RoID4gMCApIHtcclxuICAgIGNvbnN0IHBoZXRpb09iamVjdCA9IFRhbmRlbS5idWZmZXJlZFBoZXRpb09iamVjdHMuc2hpZnQoKTtcclxuICAgIHBoZXRpb09iamVjdCEudGFuZGVtLmFkZFBoZXRpb09iamVjdCggcGhldGlvT2JqZWN0ISApO1xyXG4gIH1cclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBUYW5kZW0uYnVmZmVyZWRQaGV0aW9PYmplY3RzLmxlbmd0aCA9PT0gMCwgJ2J1ZmZlcmVkUGhldGlvT2JqZWN0cyBzaG91bGQgYmUgZW1wdHknICk7XHJcbn0gKTtcclxuXHJcbi8qKlxyXG4gKiBHcm91cCBUYW5kZW0gLS0gRGVjbGFyZWQgaW4gdGhlIHNhbWUgZmlsZSB0byBhdm9pZCBjaXJjdWxhciByZWZlcmVuY2UgZXJyb3JzIGluIG1vZHVsZSBsb2FkaW5nLlxyXG4gKi9cclxuY2xhc3MgR3JvdXBUYW5kZW0gZXh0ZW5kcyBUYW5kZW0ge1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBOYW1lOiBzdHJpbmc7XHJcblxyXG4gIC8vIGZvciBnZW5lcmF0aW5nIGluZGljZXMgZnJvbSBhIHBvb2xcclxuICBwcml2YXRlIGdyb3VwTWVtYmVySW5kZXg6IG51bWJlcjtcclxuXHJcbiAgLyoqXHJcbiAgICogY3JlYXRlIHdpdGggVGFuZGVtLmNyZWF0ZUdyb3VwVGFuZGVtXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwYXJlbnRUYW5kZW06IFRhbmRlbSwgbmFtZTogc3RyaW5nICkge1xyXG4gICAgc3VwZXIoIHBhcmVudFRhbmRlbSwgbmFtZSApO1xyXG5cclxuICAgIHRoaXMuZ3JvdXBOYW1lID0gbmFtZTtcclxuICAgIHRoaXMuZ3JvdXBNZW1iZXJJbmRleCA9IDA7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBuZXh0IHRhbmRlbSBpbiB0aGUgZ3JvdXAuXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZU5leHRUYW5kZW0oKTogVGFuZGVtIHtcclxuICAgIGNvbnN0IHRhbmRlbSA9IHRoaXMucGFyZW50VGFuZGVtIS5jcmVhdGVUYW5kZW0oIGAke3RoaXMuZ3JvdXBOYW1lfSR7dGhpcy5ncm91cE1lbWJlckluZGV4fWAgKTtcclxuICAgIHRoaXMuZ3JvdXBNZW1iZXJJbmRleCsrO1xyXG4gICAgcmV0dXJuIHRhbmRlbTtcclxuICB9XHJcbn1cclxuXHJcbnRhbmRlbU5hbWVzcGFjZS5yZWdpc3RlciggJ1RhbmRlbScsIFRhbmRlbSApO1xyXG5leHBvcnQgZGVmYXVsdCBUYW5kZW07Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxXQUFXLE1BQU0sbUNBQW1DO0FBQzNELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsU0FBUyxNQUFNLGlDQUFpQztBQUd2RCxPQUFPQyxlQUFlLE1BQU0sc0JB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