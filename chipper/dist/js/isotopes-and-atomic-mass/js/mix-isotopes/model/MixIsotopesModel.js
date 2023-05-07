// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model portion of "Mix Isotopes" module. This model contains a mixture of isotopes and allows a user to move various
 * different isotopes in and out of the "Isotope Test Chamber", and simply keeps track of the average mass within the chamber.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author James Smith
 * @author Aadish Gupta
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Color } from '../../../../scenery/js/imports.js';
import AtomIdentifier from '../../../../shred/js/AtomIdentifier.js';
import NumberAtom from '../../../../shred/js/model/NumberAtom.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
import ImmutableAtomConfig from './ImmutableAtomConfig.js';
import IsotopeTestChamber from './IsotopeTestChamber.js';
import MonoIsotopeBucket from './MonoIsotopeBucket.js';
import MovableAtom from './MovableAtom.js';
import NumericalIsotopeQuantityControl from './NumericalIsotopeQuantityControl.js';

// constants
const DEFAULT_ATOM_CONFIG = new ImmutableAtomConfig(1, 0, 1); // Hydrogen.
const BUCKET_SIZE = new Dimension2(120, 50); // Size of the buckets that will hold the isotopes.

// Within this model, the isotopes come in two sizes, small and large, and atoms are either one size or another,
// and all atoms that are shown at a given time are all the same size. The larger size is based somewhat on reality.
// The smaller size is used when we want to show a lot of atoms at once.
const LARGE_ISOTOPE_RADIUS = 10;
const SMALL_ISOTOPE_RADIUS = 4;
const NUM_LARGE_ISOTOPES_PER_BUCKET = 10; // Numbers of isotopes that are placed into the buckets

// List of colors which will be used to represent the various isotopes.
const ISOTOPE_COLORS = [new Color(180, 82, 205), Color.green, new Color(255, 69, 0), new Color(72, 137, 161)];

/*
 * Enum of the possible interactivity types. The user is dragging large isotopes between the test chamber and a set of
 * buckets. The user is adding and removing small isotopes to/from the chamber using sliders.
 */
const InteractivityMode = {
  BUCKETS_AND_LARGE_ATOMS: 'BUCKETS_AND_LARGE_ATOMS',
  SLIDERS_AND_SMALL_ATOMS: 'SLIDERS_AND_SMALL_ATOMS'
};
const NUM_NATURES_MIX_ATOMS = 1000; // Total number of atoms placed in the chamber when depicting nature's mix.

class MixIsotopesModel {
  /**
   * Constructor for the Mix Isotopes Model
   **/
  constructor() {
    // Property that determines the type of user interactivity that is set.
    this.interactivityModeProperty = new Property(InteractivityMode.BUCKETS_AND_LARGE_ATOMS); // @public

    // This property contains the list of isotopes that exist in nature as variations of the current "prototype isotope".
    // In other words, this contains a list of all stable isotopes that match the atomic weight of the currently
    // configured isotope. There should be only one of each possible isotope.
    this.possibleIsotopesProperty = new Property([]); // @public {Read-Only}

    // Property that determines whether the user's mix or nature's mix is being displayed.
    this.showingNaturesMixProperty = new Property(false); // @public

    // @public - events emitted by instances of this type
    this.naturesIsotopeUpdated = new Emitter();

    // @public
    this.selectedAtomConfig = new NumberAtom({
      protonCount: DEFAULT_ATOM_CONFIG.protonCount,
      neutronCount: DEFAULT_ATOM_CONFIG.neutronCount,
      electronCount: DEFAULT_ATOM_CONFIG.electronCount
    });

    // @public - the test chamber into and out of which the isotopes can be moved
    this.testChamber = new IsotopeTestChamber(this);

    // @private
    this.prototypeIsotope = new NumberAtom();

    // @public (read-only) {ObservableArrayDef.<MonoIsotopeBucket>} - list of the isotope buckets
    this.bucketList = createObservableArray();

    // @public (read-only) {ObservableArrayDef.<MovableAtom>} - This is a list of the "My Mix" isotopes that are
    // present in the model, either in the test chamber or the bucket.  This does NOT track the "Nature's Mix" isotopes.
    this.isotopesList = createObservableArray();

    // @public (read-only) {ObservableArrayDef.<MovableAtom>}
    this.naturesIsotopesList = createObservableArray();

    // @public (read-only) {ObservableArrayDef.<NumericalIsotopeQuantityControl>} - List of the numerical controls that,
    // when present, can be used to add or remove isotopes to/from the test chamber.
    this.numericalControllerList = createObservableArray();

    // @private - map of elements to user mixes. These are restored when switching between elements
    this.mapIsotopeConfigToUserMixState = {}; // @private
    this.updatePossibleIsotopesList();

    // watch for external updates to the configuration and match them (the periodic table can cause this)
    this.selectedAtomConfig.atomUpdated.addListener(() => {
      this.setAtomConfiguration(this.selectedAtomConfig);
    });

    // Set the initial atom configuration.
    this.setAtomConfiguration(this.selectedAtomConfig);

    // Listen to "showing nature's mix" property and show/hide the appropriate isotopes when the value changes.
    // Doesn't need unlink as it stays through out the sim life
    this.showingNaturesMixProperty.lazyLink(() => {
      if (this.showingNaturesMixProperty.get()) {
        // Get the current user's mix state.
        const usersMixState = this.getState();

        // Tweak the users mix state. This is necessary since the state is being saved inside a property change observer.
        usersMixState.showingNaturesMix = false;

        // Save the user's mix state.
        if (this.mapIsotopeConfigToUserMixState.hasOwnProperty(this.prototypeIsotope.protonCountProperty.get())) {
          this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()][this.interactivityModeProperty.get()] = usersMixState;
        } else {
          this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()] = {};
          this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()][this.interactivityModeProperty.get()] = usersMixState;
        }

        // Display nature's mix.
        this.showNaturesMix();
      } else {
        this.naturesIsotopesList.clear();
        if (this.mapIsotopeConfigToUserMixState.hasOwnProperty(this.prototypeIsotope.protonCountProperty.get())) {
          if (this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()].hasOwnProperty(this.interactivityModeProperty.get())) {
            this.setState(this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()][this.interactivityModeProperty.get()]);
          } else {
            this.setUpInitialUsersMix();
          }
        } else {
          this.setUpInitialUsersMix();
        }
      }
    });

    // Doesn't need unlink as it stays through out the sim life
    this.interactivityModeProperty.lazyLink((value, oldValue) => {
      const usersMixState = this.getState();
      usersMixState.interactivityMode = oldValue;
      if (this.mapIsotopeConfigToUserMixState.hasOwnProperty(this.prototypeIsotope.protonCountProperty.get())) {
        this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()][oldValue] = usersMixState;
      } else {
        this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()] = {};
        this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()][oldValue] = usersMixState;
      }
      if (this.mapIsotopeConfigToUserMixState.hasOwnProperty(this.prototypeIsotope.protonCountProperty.get())) {
        if (this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()].hasOwnProperty(value)) {
          this.setState(this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCountProperty.get()][value]);
        } else {
          this.removeAllIsotopesFromTestChamberAndModel();
          this.addIsotopeControllers();
        }
      }
    });
  }

  /**
   * Main model step function, called by the framework.
   * @param {number} dt
   * @public
   */
  step(dt) {
    // Update particle positions.
    this.isotopesList.forEach(isotope => {
      isotope.step(dt);
    });
  }

  /**
   * Place an isotope into the test chamber or a bucket based on its current position.
   * @param {MovableAtom} isotope
   * @param {MonoIsotopeBucket} bucket
   * @param {IsotopeTestChamber} testChamber
   * @private
   */
  placeIsotope(isotope, bucket, testChamber) {
    if (testChamber.isIsotopePositionedOverChamber(isotope)) {
      testChamber.addIsotopeToChamber(isotope, true);
      testChamber.adjustForOverlap();
    } else {
      bucket.addIsotopeInstanceNearestOpen(isotope, true);
    }
  }

  /**
   * Create and add an isotope of the specified configuration.  Where the isotope is initially placed depends upon the
   * current interactivity mode.
   * @param {NumberAtom} isotopeConfig
   * @param {boolean} animate
   * @private
   */
  createAndAddIsotope(isotopeConfig, animate) {
    let newIsotope;
    if (this.interactivityModeProperty.get() === InteractivityMode.BUCKETS_AND_LARGE_ATOMS) {
      // Create the specified isotope and add it to the appropriate bucket.
      newIsotope = new MovableAtom(isotopeConfig.protonCountProperty.get(), isotopeConfig.neutronCountProperty.get(), new Vector2(0, 0));
      newIsotope.color = this.getColorForIsotope(isotopeConfig);
      newIsotope.massNumber = isotopeConfig.massNumberProperty.get();
      newIsotope.protonCount = isotopeConfig.protonCountProperty.get();
      const bucket = this.getBucketForIsotope(isotopeConfig);
      bucket.addIsotopeInstanceFirstOpen(newIsotope, animate);

      // does not require unlink
      newIsotope.userControlledProperty.link(userControlled => {
        if (!userControlled && !bucket.containsParticle(newIsotope)) {
          this.placeIsotope(newIsotope, bucket, this.testChamber);
        }
      });
      this.isotopesList.add(newIsotope);
    }
    return newIsotope;
  }

  /**
   * Get the bucket where the given isotope can be placed.
   * @param {NumberAtom} isotope
   * @returns {MonoIsotopeBucket} A bucket that can hold the isotope if one exists, null if not.
   * @public
   */
  getBucketForIsotope(isotope) {
    let isotopeBucket = null;
    this.bucketList.forEach(bucket => {
      if (bucket.isIsotopeAllowed(isotope.protonCountProperty.get(), isotope.neutronCountProperty.get())) {
        isotopeBucket = bucket;
      }
    });
    return isotopeBucket;
  }

  /**
   * Add newBucket to bucketList.
   *
   * @param {MonoIsotopeBucket} newBucket
   *
   * @private
   */

  addBucket(newBucket) {
    this.bucketList.push(newBucket);
  }

  /**
   * Set up the initial user's mix for the currently configured element. This should set all state variables to be
   * consistent with the display of the initial users mix. This is generally called the first time an element is
   * selected after initialization or reset.
   *
   * @public
   */
  setUpInitialUsersMix() {
    this.removeAllIsotopesFromTestChamberAndModel();
    this.showingNaturesMixProperty.set(false);
    this.addIsotopeControllers();
  }

  /**
   * Returns the prototypeIsotope
   * @returns {NumberAtom} prototypeIsotope
   *
   * @public
   */
  getAtom() {
    return this.prototypeIsotope;
  }

  /**
   * Returns the state of the model.
   *
   * @private
   */
  getState() {
    // If any movable isotope instances are being dragged by the user at this moment, we need to force that isotope
    // instance into a state that indicates that it isn't.  Otherwise it can get lost, since it will neither be in a
    // bucket or in the test chamber.  This case can only occur in multi-touch situations, see
    // https://github.com/phetsims/isotopes-and-atomic-mass/issues/101.
    const userControlledMovableIsotopes = this.isotopesList.filter(isotope => isotope.userControlledProperty.value);
    userControlledMovableIsotopes.forEach(isotope => {
      isotope.userControlledProperty.set(false);
    });
    return new State(this);
  }

  /**
   * Set the state of the model based on a previously created state representation.
   * @param {State} modelState
   *
   * @private
   */
  setState(modelState) {
    // Clear out any particles that are currently in the test chamber.
    this.removeAllIsotopesFromTestChamberAndModel();

    // Restore the prototype isotope.
    this.prototypeIsotope = modelState.elementConfig;
    this.updatePossibleIsotopesList();
    assert && assert(modelState.showingNaturesMix === this.showingNaturesMixProperty.get());
    this.showingNaturesMixProperty.set(modelState.showingNaturesMix);

    // Add any particles that were in the test chamber.
    this.testChamber.setState(modelState.isotopeTestChamberState);
    this.testChamber.containedIsotopes.forEach(isotope => {
      this.isotopesList.add(isotope);
    });

    // Add the appropriate isotope controllers. This will create the controllers in their initial states.
    this.addIsotopeControllers();

    // Set up the isotope controllers to match whatever is in the test chamber.
    if (this.interactivityModeProperty.get() === InteractivityMode.BUCKETS_AND_LARGE_ATOMS) {
      // Add the buckets and the isotope instances that they contain.
      this.removeBuckets();
      modelState.bucketList.forEach(bucket => {
        this.bucketList.add(bucket);
        const particlesInThisBucket = modelState.bucketToParticleListMap.get(bucket);
        particlesInThisBucket.forEach(isotope => {
          this.isotopesList.add(isotope);
          bucket.addParticleFirstOpen(isotope, false);
        });
      });
    }
  }

  /**
   * Set the element that is currently in use, and for which all stable isotopes will be available for movement in and
   * out of the test chamber. In case you're wondering why this is done as an atom instead of just setting the atomic
   * number, it is so that this will play well with the existing controllers that already existed at the time this
   * class was created.
   *
   * For the sake of efficiency, clients should be careful not to call this when it isn't needed.
   *
   * @param {NumberAtom} atom
   * @public
   */
  setAtomConfiguration(atom) {
    if (!this.selectedAtomConfig.equals(atom)) {
      this.selectedAtomConfig.protonCountProperty.set(atom.protonCount);
      this.selectedAtomConfig.electronCountProperty.set(atom.electronCount);
      this.selectedAtomConfig.neutronCountProperty.set(atom.neutronCount);
    }
    if (this.showingNaturesMixProperty.value) {
      this.removeAllIsotopesFromTestChamberAndModel();
      this.prototypeIsotope.protonCountProperty.set(atom.protonCount);
      this.prototypeIsotope.neutronCountProperty.set(atom.neutronCount);
      this.prototypeIsotope.electronCountProperty.set(atom.electronCount);
      this.updatePossibleIsotopesList();
      this.showNaturesMix();
    } else {
      // Save the user's mix state for the current element before transitioning to the new one.
      if (this.prototypeIsotope !== atom) {
        if (!this.mapIsotopeConfigToUserMixState.hasOwnProperty(this.prototypeIsotope.protonCount)) {
          this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCount] = {};
        }

        // Store the state.
        this.mapIsotopeConfigToUserMixState[this.prototypeIsotope.protonCount][this.interactivityModeProperty.get()] = this.getState();
      }

      // Check whether previous state information was stored for this configuration.
      if (this.mapIsotopeConfigToUserMixState.hasOwnProperty(atom.protonCount) && this.mapIsotopeConfigToUserMixState[atom.protonCount].hasOwnProperty(this.interactivityModeProperty.get())) {
        // Restore the previous state information.
        this.setState(this.mapIsotopeConfigToUserMixState[atom.protonCount][this.interactivityModeProperty.get()]);
      } else {
        // Set initial default state for this isotope configuration.
        this.removeAllIsotopesFromTestChamberAndModel();
        this.prototypeIsotope.protonCountProperty.set(atom.protonCount);
        this.prototypeIsotope.neutronCountProperty.set(atom.neutronCount);
        this.prototypeIsotope.electronCountProperty.set(atom.electronCount);
        this.updatePossibleIsotopesList();

        // Set all model elements for the first time this element's user mix is shown.
        this.setUpInitialUsersMix();
      }
    }
  }

  /**
   * Get a list of the possible isotopes, sorted from lightest to heaviest.
   *
   * @private
   */
  updatePossibleIsotopesList() {
    const stableIsotopes = AtomIdentifier.getStableIsotopesOfElement(this.prototypeIsotope.protonCountProperty.get());
    const newIsotopesList = [];
    for (const index in stableIsotopes) {
      if (stableIsotopes.hasOwnProperty(index)) {
        newIsotopesList.push(new NumberAtom({
          protonCount: stableIsotopes[index][0],
          neutronCount: stableIsotopes[index][1],
          electronCount: stableIsotopes[index][2]
        }));
      }
    }

    // Sort from lightest to heaviest. Do not change this without careful considerations, since several areas of the
    // code count on this. This is kept in case someone adds another isotope to AtomIdentifier and doesn't add it
    // in order.
    newIsotopesList.sort((atom1, atom2) => atom1.getIsotopeAtomicMass() - atom2.getIsotopeAtomicMass());

    // Update the list of possible isotopes for this atomic configuration.
    this.possibleIsotopesProperty.set(newIsotopesList);
  }

  /**
   * Remove all buckets that are currently in the model, as well as the particles they contained.
   *
   * @public
   */
  removeBuckets() {
    this.bucketList.forEach(bucket => {
      bucket._particles.forEach(isotope => {
        this.isotopesList.remove(isotope);
      });
      bucket.reset();
    });
    this.bucketList.clear();
  }

  /**
   * Set up the appropriate isotope controllers based on the currently selected element, the interactivity mode, and
   * the mix setting (i.e. user's mix or nature's mix). This will remove any existing controllers. This will also add
   * the appropriate initial number of isotopes to any buckets that are created.
   *
   * @public
   */
  addIsotopeControllers() {
    // Remove existing controllers.
    this.removeBuckets();
    this.removeNumericalControllers();
    const buckets = this.interactivityModeProperty.get() === InteractivityMode.BUCKETS_AND_LARGE_ATOMS || this.showingNaturesMixProperty.get();

    // Set up layout variables.
    const controllerYOffsetBucket = -250; // empirically determined
    const controllerYOffsetSlider = -238; // empirically determined
    let interControllerDistanceX;
    let controllerXOffset;
    if (this.possibleIsotopesProperty.get().length < 4) {
      // We can fit 3 or less cleanly under the test chamber.
      interControllerDistanceX = this.testChamber.getTestChamberRect().getWidth() / this.possibleIsotopesProperty.get().length;
      controllerXOffset = this.testChamber.getTestChamberRect().minX + interControllerDistanceX / 2;
    } else {
      // Four controllers don't fit well under the chamber, so use a positioning algorithm where they are extended
      // a bit to the right.
      interControllerDistanceX = this.testChamber.getTestChamberRect().getWidth() * 1.10 / this.possibleIsotopesProperty.get().length;
      controllerXOffset = -180;
    }

    // Add the controllers.
    for (let i = 0; i < this.possibleIsotopesProperty.get().length; i++) {
      const isotopeConfig = this.possibleIsotopesProperty.get()[i];
      const isotopeCaption = `${AtomIdentifier.getName(isotopeConfig.protonCountProperty.get())}-${isotopeConfig.massNumberProperty.get()}`;
      if (buckets) {
        const newBucket = new MonoIsotopeBucket(isotopeConfig.protonCountProperty.get(), isotopeConfig.neutronCountProperty.get(), {
          position: new Vector2(controllerXOffset + interControllerDistanceX * i, controllerYOffsetBucket),
          size: BUCKET_SIZE,
          baseColor: this.getColorForIsotope(isotopeConfig),
          captionText: isotopeCaption,
          sphereRadius: LARGE_ISOTOPE_RADIUS
        });
        this.addBucket(newBucket);
        if (!this.showingNaturesMixProperty.get()) {
          // Create and add initial isotopes to the new bucket.
          _.times(NUM_LARGE_ISOTOPES_PER_BUCKET, () => {
            this.createAndAddIsotope(isotopeConfig, false);
          });
        }
      } else {
        // assume a numerical controller
        const newController = new NumericalIsotopeQuantityControl(this, isotopeConfig, new Vector2(controllerXOffset + interControllerDistanceX * i, controllerYOffsetSlider), isotopeCaption);
        const controllerIsotope = new MovableAtom(isotopeConfig.protonCountProperty.get(), isotopeConfig.neutronCountProperty.get(), new Vector2(0, 0));
        controllerIsotope.color = this.getColorForIsotope(isotopeConfig);
        controllerIsotope.radiusProperty.set(SMALL_ISOTOPE_RADIUS);
        newController.controllerIsotope = controllerIsotope;
        this.numericalControllerList.add(newController);
      }
    }
  }

  // @public
  removeNumericalControllers() {
    this.numericalControllerList.clear();
  }

  /**
   * @param {NumberAtom} isotope
   *
   * @public
   */
  getColorForIsotope(isotope) {
    const index = this.possibleIsotopesProperty.get().indexOf(isotope);
    return index >= 0 ? ISOTOPE_COLORS[this.possibleIsotopesProperty.get().indexOf(isotope)] : Color.WHITE;
  }

  // @private
  showNaturesMix() {
    assert && assert(this.showingNaturesMixProperty.get() === true);

    // Clear out anything that is in the test chamber. If anything needed to be stored, it should have been done by now.
    this.removeAllIsotopesFromTestChamberAndModel();
    this.naturesIsotopesList.clear();

    // Get the list of possible isotopes and then sort it by abundance so that the least abundant are added last, thus
    // assuring that they will be visible.
    const possibleIsotopesCopy = this.possibleIsotopesProperty.get().slice(0);
    const numDigitsForComparison = 10;
    possibleIsotopesCopy.sort((atom1, atom2) => AtomIdentifier.getNaturalAbundance(atom2, numDigitsForComparison) - AtomIdentifier.getNaturalAbundance(atom1, numDigitsForComparison));

    // Add the isotopes.
    possibleIsotopesCopy.forEach(isotopeConfig => {
      let numToCreate = Utils.roundSymmetric(NUM_NATURES_MIX_ATOMS * AtomIdentifier.getNaturalAbundance(isotopeConfig, 5));
      if (numToCreate === 0) {
        // The calculated quantity was 0, but we don't want to have no instances of this isotope in the chamber, so
        // add only one. This behavior was requested by the design team.
        numToCreate = 1;
      }
      const isotopesToAdd = [];
      for (let i = 0; i < numToCreate; i++) {
        const newIsotope = new MovableAtom(isotopeConfig.protonCountProperty.get(), isotopeConfig.neutronCountProperty.get(), this.testChamber.generateRandomPosition());
        newIsotope.color = this.getColorForIsotope(isotopeConfig);
        newIsotope.massNumber = isotopeConfig.massNumberProperty.get();
        newIsotope.protonCount = isotopeConfig.protonCountProperty.get();
        newIsotope.radiusProperty.set(SMALL_ISOTOPE_RADIUS);
        newIsotope.showLabel = false;
        isotopesToAdd.push(newIsotope);
        this.naturesIsotopesList.push(newIsotope);
      }
      this.testChamber.bulkAddIsotopesToChamber(isotopesToAdd);
    });
    this.naturesIsotopeUpdated.emit();

    // Add the isotope controllers (i.e. the buckets).
    this.addIsotopeControllers();
  }

  /**
   * Remove all isotopes from the test chamber, and then remove them from the model. This method does not add removed
   * isotopes back to the buckets or update the controllers.
   * @public
   */
  removeAllIsotopesFromTestChamberAndModel() {
    // Remove the isotopes from the test chamber.
    this.testChamber.removeAllIsotopes();

    // Reset the buckets so that they don't have references to the particles.
    this.bucketList.forEach(bucket => {
      bucket.reset();
    });

    // Clear the model-specific list of isotopes.
    this.isotopesList.clear();
  }

  // @public
  clearBox() {
    this.removeAllIsotopesFromTestChamberAndModel();
    this.addIsotopeControllers();
  }

  /**
   * Resets the model. Returns the default settings.
   *
   * @public
   */
  reset() {
    this.clearBox();

    // Remove any stored state for the default atom.
    // before clearing up the state clearing all the observable array stored in it

    this.mapIsotopeConfigToUserMixState = {};
    this.naturesIsotopesList.clear();
    this.interactivityModeProperty.reset();
    this.possibleIsotopesProperty.reset();
    this.showingNaturesMixProperty.reset();
    this.prototypeIsotope = new NumberAtom();

    // Set the default element
    this.setAtomConfiguration(DEFAULT_ATOM_CONFIG);

    // Remove all stored user's mix states.  This must be done after setting the default isotope because state could
    // have been saved when the default was set.
    this.mapIsotopeConfigToUserMixState = {};
  }
}

/**
 * Class that can be used to save the state of the model. This will be used for saving and restoring of the state when
 * switching between various modes.
 * @param {MixIsotopesModel} model
 */
class State {
  /**
   * @param {MixIsotopesModel} model
   */
  constructor(model) {
    this.elementConfig = new NumberAtom({
      protonCount: model.prototypeIsotope.protonCountProperty.get(),
      neutronCount: model.prototypeIsotope.neutronCountProperty.get(),
      electronCount: model.prototypeIsotope.electronCountProperty.get()
    });
    this.isotopeTestChamberState = model.testChamber.getState();
    this.interactivityMode = model.interactivityModeProperty.get();
    this.showingNaturesMix = model.showingNaturesMixProperty.get();

    // Make sure none of the isotope instances are in a state where they are being dragged by the user.  In the vast
    // majority of cases, they won't be when the state is recorded, so this will be a no-op, but there are some multi-
    // touch scenarios where it is possible, and it is problematic to try to store them in this state.  The view will
    // cancel interactions anyway, but there is no guarantee that the cancellation will have happened at this point in
    // time, so we have to do this here to be sure.  See https://github.com/phetsims/isotopes-and-atomic-mass/issues/101.
    model.isotopesList.forEach(isotopeInstance => {
      isotopeInstance.userControlledProperty.set(false);
    });

    // For the bucket state, we keep references to the actual buckets and particles that are being used.  This works for
    // this model because nothing else is done with a bucket after saving its state.  It is admittedly not very general,
    // but works fine for the needs of this model.  Note that we need to store the particle references separately so
    // that they can be added back during state restoration.
    this.bucketList = [...model.bucketList];
    this.bucketToParticleListMap = new Map();
    model.bucketList.forEach(bucket => {
      const particlesInThisBucket = [...bucket.getParticleList()];
      this.bucketToParticleListMap.set(bucket, particlesInThisBucket);
    });
  }
}

// statics
MixIsotopesModel.InteractivityMode = InteractivityMode;
isotopesAndAtomicMass.register('MixIsotopesModel', MixIsotopesModel);
export default MixIsotopesModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJFbWl0dGVyIiwiUHJvcGVydHkiLCJEaW1lbnNpb24yIiwiVXRpbHMiLCJWZWN0b3IyIiwiQ29sb3IiLCJBdG9tSWRlbnRpZmllciIsIk51bWJlckF0b20iLCJpc290b3Blc0FuZEF0b21pY01hc3MiLCJJbW11dGFibGVBdG9tQ29uZmlnIiwiSXNvdG9wZVRlc3RDaGFtYmVyIiwiTW9ub0lzb3RvcGVCdWNrZXQiLCJNb3ZhYmxlQXRvbSIsIk51bWVyaWNhbElzb3RvcGVRdWFudGl0eUNvbnRyb2wiLCJERUZBVUxUX0FUT01fQ09ORklHIiwiQlVDS0VUX1NJWkUiLCJMQVJHRV9JU09UT1BFX1JBRElVUyIsIlNNQUxMX0lTT1RPUEVfUkFESVVTIiwiTlVNX0xBUkdFX0lTT1RPUEVTX1BFUl9CVUNLRVQiLCJJU09UT1BFX0NPTE9SUyIsImdyZWVuIiwiSW50ZXJhY3Rpdml0eU1vZGUiLCJCVUNLRVRTX0FORF9MQVJHRV9BVE9NUyIsIlNMSURFUlNfQU5EX1NNQUxMX0FUT01TIiwiTlVNX05BVFVSRVNfTUlYX0FUT01TIiwiTWl4SXNvdG9wZXNNb2RlbCIsImNvbnN0cnVjdG9yIiwiaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eSIsInBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eSIsInNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkiLCJuYXR1cmVzSXNvdG9wZVVwZGF0ZWQiLCJzZWxlY3RlZEF0b21Db25maWciLCJwcm90b25Db3VudCIsIm5ldXRyb25Db3VudCIsImVsZWN0cm9uQ291bnQiLCJ0ZXN0Q2hhbWJlciIsInByb3RvdHlwZUlzb3RvcGUiLCJidWNrZXRMaXN0IiwiaXNvdG9wZXNMaXN0IiwibmF0dXJlc0lzb3RvcGVzTGlzdCIsIm51bWVyaWNhbENvbnRyb2xsZXJMaXN0IiwibWFwSXNvdG9wZUNvbmZpZ1RvVXNlck1peFN0YXRlIiwidXBkYXRlUG9zc2libGVJc290b3Blc0xpc3QiLCJhdG9tVXBkYXRlZCIsImFkZExpc3RlbmVyIiwic2V0QXRvbUNvbmZpZ3VyYXRpb24iLCJsYXp5TGluayIsImdldCIsInVzZXJzTWl4U3RhdGUiLCJnZXRTdGF0ZSIsInNob3dpbmdOYXR1cmVzTWl4IiwiaGFzT3duUHJvcGVydHkiLCJwcm90b25Db3VudFByb3BlcnR5Iiwic2hvd05hdHVyZXNNaXgiLCJjbGVhciIsInNldFN0YXRlIiwic2V0VXBJbml0aWFsVXNlcnNNaXgiLCJ2YWx1ZSIsIm9sZFZhbHVlIiwiaW50ZXJhY3Rpdml0eU1vZGUiLCJyZW1vdmVBbGxJc290b3Blc0Zyb21UZXN0Q2hhbWJlckFuZE1vZGVsIiwiYWRkSXNvdG9wZUNvbnRyb2xsZXJzIiwic3RlcCIsImR0IiwiZm9yRWFjaCIsImlzb3RvcGUiLCJwbGFjZUlzb3RvcGUiLCJidWNrZXQiLCJpc0lzb3RvcGVQb3NpdGlvbmVkT3ZlckNoYW1iZXIiLCJhZGRJc290b3BlVG9DaGFtYmVyIiwiYWRqdXN0Rm9yT3ZlcmxhcCIsImFkZElzb3RvcGVJbnN0YW5jZU5lYXJlc3RPcGVuIiwiY3JlYXRlQW5kQWRkSXNvdG9wZSIsImlzb3RvcGVDb25maWciLCJhbmltYXRlIiwibmV3SXNvdG9wZSIsIm5ldXRyb25Db3VudFByb3BlcnR5IiwiY29sb3IiLCJnZXRDb2xvckZvcklzb3RvcGUiLCJtYXNzTnVtYmVyIiwibWFzc051bWJlclByb3BlcnR5IiwiZ2V0QnVja2V0Rm9ySXNvdG9wZSIsImFkZElzb3RvcGVJbnN0YW5jZUZpcnN0T3BlbiIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJsaW5rIiwidXNlckNvbnRyb2xsZWQiLCJjb250YWluc1BhcnRpY2xlIiwiYWRkIiwiaXNvdG9wZUJ1Y2tldCIsImlzSXNvdG9wZUFsbG93ZWQiLCJhZGRCdWNrZXQiLCJuZXdCdWNrZXQiLCJwdXNoIiwic2V0IiwiZ2V0QXRvbSIsInVzZXJDb250cm9sbGVkTW92YWJsZUlzb3RvcGVzIiwiZmlsdGVyIiwiU3RhdGUiLCJtb2RlbFN0YXRlIiwiZWxlbWVudENvbmZpZyIsImFzc2VydCIsImlzb3RvcGVUZXN0Q2hhbWJlclN0YXRlIiwiY29udGFpbmVkSXNvdG9wZXMiLCJyZW1vdmVCdWNrZXRzIiwicGFydGljbGVzSW5UaGlzQnVja2V0IiwiYnVja2V0VG9QYXJ0aWNsZUxpc3RNYXAiLCJhZGRQYXJ0aWNsZUZpcnN0T3BlbiIsImF0b20iLCJlcXVhbHMiLCJlbGVjdHJvbkNvdW50UHJvcGVydHkiLCJzdGFibGVJc290b3BlcyIsImdldFN0YWJsZUlzb3RvcGVzT2ZFbGVtZW50IiwibmV3SXNvdG9wZXNMaXN0IiwiaW5kZXgiLCJzb3J0IiwiYXRvbTEiLCJhdG9tMiIsImdldElzb3RvcGVBdG9taWNNYXNzIiwiX3BhcnRpY2xlcyIsInJlbW92ZSIsInJlc2V0IiwicmVtb3ZlTnVtZXJpY2FsQ29udHJvbGxlcnMiLCJidWNrZXRzIiwiY29udHJvbGxlcllPZmZzZXRCdWNrZXQiLCJjb250cm9sbGVyWU9mZnNldFNsaWRlciIsImludGVyQ29udHJvbGxlckRpc3RhbmNlWCIsImNvbnRyb2xsZXJYT2Zmc2V0IiwibGVuZ3RoIiwiZ2V0VGVzdENoYW1iZXJSZWN0IiwiZ2V0V2lkdGgiLCJtaW5YIiwiaSIsImlzb3RvcGVDYXB0aW9uIiwiZ2V0TmFtZSIsInBvc2l0aW9uIiwic2l6ZSIsImJhc2VDb2xvciIsImNhcHRpb25UZXh0Iiwic3BoZXJlUmFkaXVzIiwiXyIsInRpbWVzIiwibmV3Q29udHJvbGxlciIsImNvbnRyb2xsZXJJc290b3BlIiwicmFkaXVzUHJvcGVydHkiLCJpbmRleE9mIiwiV0hJVEUiLCJwb3NzaWJsZUlzb3RvcGVzQ29weSIsInNsaWNlIiwibnVtRGlnaXRzRm9yQ29tcGFyaXNvbiIsImdldE5hdHVyYWxBYnVuZGFuY2UiLCJudW1Ub0NyZWF0ZSIsInJvdW5kU3ltbWV0cmljIiwiaXNvdG9wZXNUb0FkZCIsImdlbmVyYXRlUmFuZG9tUG9zaXRpb24iLCJzaG93TGFiZWwiLCJidWxrQWRkSXNvdG9wZXNUb0NoYW1iZXIiLCJlbWl0IiwicmVtb3ZlQWxsSXNvdG9wZXMiLCJjbGVhckJveCIsIm1vZGVsIiwiaXNvdG9wZUluc3RhbmNlIiwiTWFwIiwiZ2V0UGFydGljbGVMaXN0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaXhJc290b3Blc01vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIHBvcnRpb24gb2YgXCJNaXggSXNvdG9wZXNcIiBtb2R1bGUuIFRoaXMgbW9kZWwgY29udGFpbnMgYSBtaXh0dXJlIG9mIGlzb3RvcGVzIGFuZCBhbGxvd3MgYSB1c2VyIHRvIG1vdmUgdmFyaW91c1xyXG4gKiBkaWZmZXJlbnQgaXNvdG9wZXMgaW4gYW5kIG91dCBvZiB0aGUgXCJJc290b3BlIFRlc3QgQ2hhbWJlclwiLCBhbmQgc2ltcGx5IGtlZXBzIHRyYWNrIG9mIHRoZSBhdmVyYWdlIG1hc3Mgd2l0aGluIHRoZSBjaGFtYmVyLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqIEBhdXRob3IgSmFtZXMgU21pdGhcclxuICogQGF1dGhvciBBYWRpc2ggR3VwdGFcclxuICovXHJcblxyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEF0b21JZGVudGlmaWVyIGZyb20gJy4uLy4uLy4uLy4uL3NocmVkL2pzL0F0b21JZGVudGlmaWVyLmpzJztcclxuaW1wb3J0IE51bWJlckF0b20gZnJvbSAnLi4vLi4vLi4vLi4vc2hyZWQvanMvbW9kZWwvTnVtYmVyQXRvbS5qcyc7XHJcbmltcG9ydCBpc290b3Blc0FuZEF0b21pY01hc3MgZnJvbSAnLi4vLi4vaXNvdG9wZXNBbmRBdG9taWNNYXNzLmpzJztcclxuaW1wb3J0IEltbXV0YWJsZUF0b21Db25maWcgZnJvbSAnLi9JbW11dGFibGVBdG9tQ29uZmlnLmpzJztcclxuaW1wb3J0IElzb3RvcGVUZXN0Q2hhbWJlciBmcm9tICcuL0lzb3RvcGVUZXN0Q2hhbWJlci5qcyc7XHJcbmltcG9ydCBNb25vSXNvdG9wZUJ1Y2tldCBmcm9tICcuL01vbm9Jc290b3BlQnVja2V0LmpzJztcclxuaW1wb3J0IE1vdmFibGVBdG9tIGZyb20gJy4vTW92YWJsZUF0b20uanMnO1xyXG5pbXBvcnQgTnVtZXJpY2FsSXNvdG9wZVF1YW50aXR5Q29udHJvbCBmcm9tICcuL051bWVyaWNhbElzb3RvcGVRdWFudGl0eUNvbnRyb2wuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERFRkFVTFRfQVRPTV9DT05GSUcgPSBuZXcgSW1tdXRhYmxlQXRvbUNvbmZpZyggMSwgMCwgMSApOyAvLyBIeWRyb2dlbi5cclxuY29uc3QgQlVDS0VUX1NJWkUgPSBuZXcgRGltZW5zaW9uMiggMTIwLCA1MCApOyAvLyBTaXplIG9mIHRoZSBidWNrZXRzIHRoYXQgd2lsbCBob2xkIHRoZSBpc290b3Blcy5cclxuXHJcbi8vIFdpdGhpbiB0aGlzIG1vZGVsLCB0aGUgaXNvdG9wZXMgY29tZSBpbiB0d28gc2l6ZXMsIHNtYWxsIGFuZCBsYXJnZSwgYW5kIGF0b21zIGFyZSBlaXRoZXIgb25lIHNpemUgb3IgYW5vdGhlcixcclxuLy8gYW5kIGFsbCBhdG9tcyB0aGF0IGFyZSBzaG93biBhdCBhIGdpdmVuIHRpbWUgYXJlIGFsbCB0aGUgc2FtZSBzaXplLiBUaGUgbGFyZ2VyIHNpemUgaXMgYmFzZWQgc29tZXdoYXQgb24gcmVhbGl0eS5cclxuLy8gVGhlIHNtYWxsZXIgc2l6ZSBpcyB1c2VkIHdoZW4gd2Ugd2FudCB0byBzaG93IGEgbG90IG9mIGF0b21zIGF0IG9uY2UuXHJcbmNvbnN0IExBUkdFX0lTT1RPUEVfUkFESVVTID0gMTA7XHJcbmNvbnN0IFNNQUxMX0lTT1RPUEVfUkFESVVTID0gNDtcclxuY29uc3QgTlVNX0xBUkdFX0lTT1RPUEVTX1BFUl9CVUNLRVQgPSAxMDsgLy8gTnVtYmVycyBvZiBpc290b3BlcyB0aGF0IGFyZSBwbGFjZWQgaW50byB0aGUgYnVja2V0c1xyXG5cclxuLy8gTGlzdCBvZiBjb2xvcnMgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIHJlcHJlc2VudCB0aGUgdmFyaW91cyBpc290b3Blcy5cclxuY29uc3QgSVNPVE9QRV9DT0xPUlMgPSBbIG5ldyBDb2xvciggMTgwLCA4MiwgMjA1ICksIENvbG9yLmdyZWVuLCBuZXcgQ29sb3IoIDI1NSwgNjksIDAgKSwgbmV3IENvbG9yKCA3MiwgMTM3LCAxNjEgKSBdO1xyXG5cclxuLypcclxuICogRW51bSBvZiB0aGUgcG9zc2libGUgaW50ZXJhY3Rpdml0eSB0eXBlcy4gVGhlIHVzZXIgaXMgZHJhZ2dpbmcgbGFyZ2UgaXNvdG9wZXMgYmV0d2VlbiB0aGUgdGVzdCBjaGFtYmVyIGFuZCBhIHNldCBvZlxyXG4gKiBidWNrZXRzLiBUaGUgdXNlciBpcyBhZGRpbmcgYW5kIHJlbW92aW5nIHNtYWxsIGlzb3RvcGVzIHRvL2Zyb20gdGhlIGNoYW1iZXIgdXNpbmcgc2xpZGVycy5cclxuICovXHJcbmNvbnN0IEludGVyYWN0aXZpdHlNb2RlID0ge1xyXG4gIEJVQ0tFVFNfQU5EX0xBUkdFX0FUT01TOiAnQlVDS0VUU19BTkRfTEFSR0VfQVRPTVMnLFxyXG4gIFNMSURFUlNfQU5EX1NNQUxMX0FUT01TOiAnU0xJREVSU19BTkRfU01BTExfQVRPTVMnXHJcbn07XHJcbmNvbnN0IE5VTV9OQVRVUkVTX01JWF9BVE9NUyA9IDEwMDA7IC8vIFRvdGFsIG51bWJlciBvZiBhdG9tcyBwbGFjZWQgaW4gdGhlIGNoYW1iZXIgd2hlbiBkZXBpY3RpbmcgbmF0dXJlJ3MgbWl4LlxyXG5cclxuY2xhc3MgTWl4SXNvdG9wZXNNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB0aGUgTWl4IElzb3RvcGVzIE1vZGVsXHJcbiAgICoqL1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG5cclxuICAgIC8vIFByb3BlcnR5IHRoYXQgZGV0ZXJtaW5lcyB0aGUgdHlwZSBvZiB1c2VyIGludGVyYWN0aXZpdHkgdGhhdCBpcyBzZXQuXHJcbiAgICB0aGlzLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIEludGVyYWN0aXZpdHlNb2RlLkJVQ0tFVFNfQU5EX0xBUkdFX0FUT01TICk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBUaGlzIHByb3BlcnR5IGNvbnRhaW5zIHRoZSBsaXN0IG9mIGlzb3RvcGVzIHRoYXQgZXhpc3QgaW4gbmF0dXJlIGFzIHZhcmlhdGlvbnMgb2YgdGhlIGN1cnJlbnQgXCJwcm90b3R5cGUgaXNvdG9wZVwiLlxyXG4gICAgLy8gSW4gb3RoZXIgd29yZHMsIHRoaXMgY29udGFpbnMgYSBsaXN0IG9mIGFsbCBzdGFibGUgaXNvdG9wZXMgdGhhdCBtYXRjaCB0aGUgYXRvbWljIHdlaWdodCBvZiB0aGUgY3VycmVudGx5XHJcbiAgICAvLyBjb25maWd1cmVkIGlzb3RvcGUuIFRoZXJlIHNob3VsZCBiZSBvbmx5IG9uZSBvZiBlYWNoIHBvc3NpYmxlIGlzb3RvcGUuXHJcbiAgICB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggW10gKTsgLy8gQHB1YmxpYyB7UmVhZC1Pbmx5fVxyXG5cclxuICAgIC8vIFByb3BlcnR5IHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB1c2VyJ3MgbWl4IG9yIG5hdHVyZSdzIG1peCBpcyBiZWluZyBkaXNwbGF5ZWQuXHJcbiAgICB0aGlzLnNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7IC8vIEBwdWJsaWNcclxuXHJcbiAgICAvLyBAcHVibGljIC0gZXZlbnRzIGVtaXR0ZWQgYnkgaW5zdGFuY2VzIG9mIHRoaXMgdHlwZVxyXG4gICAgdGhpcy5uYXR1cmVzSXNvdG9wZVVwZGF0ZWQgPSBuZXcgRW1pdHRlcigpO1xyXG5cclxuICAgIC8vIEBwdWJsaWNcclxuICAgIHRoaXMuc2VsZWN0ZWRBdG9tQ29uZmlnID0gbmV3IE51bWJlckF0b20oIHtcclxuICAgICAgcHJvdG9uQ291bnQ6IERFRkFVTFRfQVRPTV9DT05GSUcucHJvdG9uQ291bnQsXHJcbiAgICAgIG5ldXRyb25Db3VudDogREVGQVVMVF9BVE9NX0NPTkZJRy5uZXV0cm9uQ291bnQsXHJcbiAgICAgIGVsZWN0cm9uQ291bnQ6IERFRkFVTFRfQVRPTV9DT05GSUcuZWxlY3Ryb25Db3VudFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgLSB0aGUgdGVzdCBjaGFtYmVyIGludG8gYW5kIG91dCBvZiB3aGljaCB0aGUgaXNvdG9wZXMgY2FuIGJlIG1vdmVkXHJcbiAgICB0aGlzLnRlc3RDaGFtYmVyID0gbmV3IElzb3RvcGVUZXN0Q2hhbWJlciggdGhpcyApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLnByb3RvdHlwZUlzb3RvcGUgPSBuZXcgTnVtYmVyQXRvbSgpO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge09ic2VydmFibGVBcnJheURlZi48TW9ub0lzb3RvcGVCdWNrZXQ+fSAtIGxpc3Qgb2YgdGhlIGlzb3RvcGUgYnVja2V0c1xyXG4gICAgdGhpcy5idWNrZXRMaXN0ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7T2JzZXJ2YWJsZUFycmF5RGVmLjxNb3ZhYmxlQXRvbT59IC0gVGhpcyBpcyBhIGxpc3Qgb2YgdGhlIFwiTXkgTWl4XCIgaXNvdG9wZXMgdGhhdCBhcmVcclxuICAgIC8vIHByZXNlbnQgaW4gdGhlIG1vZGVsLCBlaXRoZXIgaW4gdGhlIHRlc3QgY2hhbWJlciBvciB0aGUgYnVja2V0LiAgVGhpcyBkb2VzIE5PVCB0cmFjayB0aGUgXCJOYXR1cmUncyBNaXhcIiBpc290b3Blcy5cclxuICAgIHRoaXMuaXNvdG9wZXNMaXN0ID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7T2JzZXJ2YWJsZUFycmF5RGVmLjxNb3ZhYmxlQXRvbT59XHJcbiAgICB0aGlzLm5hdHVyZXNJc290b3Blc0xpc3QgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtPYnNlcnZhYmxlQXJyYXlEZWYuPE51bWVyaWNhbElzb3RvcGVRdWFudGl0eUNvbnRyb2w+fSAtIExpc3Qgb2YgdGhlIG51bWVyaWNhbCBjb250cm9scyB0aGF0LFxyXG4gICAgLy8gd2hlbiBwcmVzZW50LCBjYW4gYmUgdXNlZCB0byBhZGQgb3IgcmVtb3ZlIGlzb3RvcGVzIHRvL2Zyb20gdGhlIHRlc3QgY2hhbWJlci5cclxuICAgIHRoaXMubnVtZXJpY2FsQ29udHJvbGxlckxpc3QgPSBjcmVhdGVPYnNlcnZhYmxlQXJyYXkoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIG1hcCBvZiBlbGVtZW50cyB0byB1c2VyIG1peGVzLiBUaGVzZSBhcmUgcmVzdG9yZWQgd2hlbiBzd2l0Y2hpbmcgYmV0d2VlbiBlbGVtZW50c1xyXG4gICAgdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGUgPSB7fTsgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudXBkYXRlUG9zc2libGVJc290b3Blc0xpc3QoKTtcclxuXHJcbiAgICAvLyB3YXRjaCBmb3IgZXh0ZXJuYWwgdXBkYXRlcyB0byB0aGUgY29uZmlndXJhdGlvbiBhbmQgbWF0Y2ggdGhlbSAodGhlIHBlcmlvZGljIHRhYmxlIGNhbiBjYXVzZSB0aGlzKVxyXG4gICAgdGhpcy5zZWxlY3RlZEF0b21Db25maWcuYXRvbVVwZGF0ZWQuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5zZXRBdG9tQ29uZmlndXJhdGlvbiggdGhpcy5zZWxlY3RlZEF0b21Db25maWcgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZXQgdGhlIGluaXRpYWwgYXRvbSBjb25maWd1cmF0aW9uLlxyXG4gICAgdGhpcy5zZXRBdG9tQ29uZmlndXJhdGlvbiggdGhpcy5zZWxlY3RlZEF0b21Db25maWcgKTtcclxuXHJcbiAgICAvLyBMaXN0ZW4gdG8gXCJzaG93aW5nIG5hdHVyZSdzIG1peFwiIHByb3BlcnR5IGFuZCBzaG93L2hpZGUgdGhlIGFwcHJvcHJpYXRlIGlzb3RvcGVzIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXMuXHJcbiAgICAvLyBEb2Vzbid0IG5lZWQgdW5saW5rIGFzIGl0IHN0YXlzIHRocm91Z2ggb3V0IHRoZSBzaW0gbGlmZVxyXG4gICAgdGhpcy5zaG93aW5nTmF0dXJlc01peFByb3BlcnR5LmxhenlMaW5rKCAoKSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy5zaG93aW5nTmF0dXJlc01peFByb3BlcnR5LmdldCgpICkge1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgdXNlcidzIG1peCBzdGF0ZS5cclxuICAgICAgICBjb25zdCB1c2Vyc01peFN0YXRlID0gdGhpcy5nZXRTdGF0ZSgpO1xyXG5cclxuICAgICAgICAvLyBUd2VhayB0aGUgdXNlcnMgbWl4IHN0YXRlLiBUaGlzIGlzIG5lY2Vzc2FyeSBzaW5jZSB0aGUgc3RhdGUgaXMgYmVpbmcgc2F2ZWQgaW5zaWRlIGEgcHJvcGVydHkgY2hhbmdlIG9ic2VydmVyLlxyXG4gICAgICAgIHVzZXJzTWl4U3RhdGUuc2hvd2luZ05hdHVyZXNNaXggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gU2F2ZSB0aGUgdXNlcidzIG1peCBzdGF0ZS5cclxuICAgICAgICBpZiAoIHRoaXMubWFwSXNvdG9wZUNvbmZpZ1RvVXNlck1peFN0YXRlLmhhc093blByb3BlcnR5KCB0aGlzLnByb3RvdHlwZUlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgICAgdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGVbIHRoaXMucHJvdG90eXBlSXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpIF1bIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSBdID1cclxuICAgICAgICAgICAgdXNlcnNNaXhTdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgXSA9IHt9O1xyXG4gICAgICAgICAgdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGVbIHRoaXMucHJvdG90eXBlSXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpIF1bIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSBdID1cclxuICAgICAgICAgICAgdXNlcnNNaXhTdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgbmF0dXJlJ3MgbWl4LlxyXG4gICAgICAgIHRoaXMuc2hvd05hdHVyZXNNaXgoKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLm5hdHVyZXNJc290b3Blc0xpc3QuY2xlYXIoKTtcclxuICAgICAgICBpZiAoIHRoaXMubWFwSXNvdG9wZUNvbmZpZ1RvVXNlck1peFN0YXRlLmhhc093blByb3BlcnR5KCB0aGlzLnByb3RvdHlwZUlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgICAgaWYgKCB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgXVxyXG4gICAgICAgICAgICAuaGFzT3duUHJvcGVydHkoIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKFxyXG4gICAgICAgICAgICAgIHRoaXMubWFwSXNvdG9wZUNvbmZpZ1RvVXNlck1peFN0YXRlWyB0aGlzLnByb3RvdHlwZUlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSBdWyB0aGlzLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkuZ2V0KCkgXVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0VXBJbml0aWFsVXNlcnNNaXgoKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnNldFVwSW5pdGlhbFVzZXJzTWl4KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gRG9lc24ndCBuZWVkIHVubGluayBhcyBpdCBzdGF5cyB0aHJvdWdoIG91dCB0aGUgc2ltIGxpZmVcclxuICAgIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5sYXp5TGluayggKCB2YWx1ZSwgb2xkVmFsdWUgKSA9PiB7XHJcbiAgICAgIGNvbnN0IHVzZXJzTWl4U3RhdGUgPSB0aGlzLmdldFN0YXRlKCk7XHJcbiAgICAgIHVzZXJzTWl4U3RhdGUuaW50ZXJhY3Rpdml0eU1vZGUgPSBvbGRWYWx1ZTtcclxuICAgICAgaWYgKCB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZS5oYXNPd25Qcm9wZXJ0eSggdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgKSApIHtcclxuICAgICAgICB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgXVsgb2xkVmFsdWUgXSA9IHVzZXJzTWl4U3RhdGU7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGVbIHRoaXMucHJvdG90eXBlSXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpIF0gPSB7fTtcclxuICAgICAgICB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgXVsgb2xkVmFsdWUgXSA9IHVzZXJzTWl4U3RhdGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICggdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGUuaGFzT3duUHJvcGVydHkoIHRoaXMucHJvdG90eXBlSXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpICkgKSB7XHJcbiAgICAgICAgaWYgKCB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCkgXS5oYXNPd25Qcm9wZXJ0eSggdmFsdWUgKSApIHtcclxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoIHRoaXMubWFwSXNvdG9wZUNvbmZpZ1RvVXNlck1peFN0YXRlWyB0aGlzLnByb3RvdHlwZUlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSBdWyB2YWx1ZSBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxJc290b3Blc0Zyb21UZXN0Q2hhbWJlckFuZE1vZGVsKCk7XHJcbiAgICAgICAgICB0aGlzLmFkZElzb3RvcGVDb250cm9sbGVycygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWFpbiBtb2RlbCBzdGVwIGZ1bmN0aW9uLCBjYWxsZWQgYnkgdGhlIGZyYW1ld29yay5cclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHRcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcblxyXG4gICAgLy8gVXBkYXRlIHBhcnRpY2xlIHBvc2l0aW9ucy5cclxuICAgIHRoaXMuaXNvdG9wZXNMaXN0LmZvckVhY2goIGlzb3RvcGUgPT4ge1xyXG4gICAgICBpc290b3BlLnN0ZXAoIGR0ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBQbGFjZSBhbiBpc290b3BlIGludG8gdGhlIHRlc3QgY2hhbWJlciBvciBhIGJ1Y2tldCBiYXNlZCBvbiBpdHMgY3VycmVudCBwb3NpdGlvbi5cclxuICAgKiBAcGFyYW0ge01vdmFibGVBdG9tfSBpc290b3BlXHJcbiAgICogQHBhcmFtIHtNb25vSXNvdG9wZUJ1Y2tldH0gYnVja2V0XHJcbiAgICogQHBhcmFtIHtJc290b3BlVGVzdENoYW1iZXJ9IHRlc3RDaGFtYmVyXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBwbGFjZUlzb3RvcGUoIGlzb3RvcGUsIGJ1Y2tldCwgdGVzdENoYW1iZXIgKSB7XHJcbiAgICBpZiAoIHRlc3RDaGFtYmVyLmlzSXNvdG9wZVBvc2l0aW9uZWRPdmVyQ2hhbWJlciggaXNvdG9wZSApICkge1xyXG4gICAgICB0ZXN0Q2hhbWJlci5hZGRJc290b3BlVG9DaGFtYmVyKCBpc290b3BlLCB0cnVlICk7XHJcbiAgICAgIHRlc3RDaGFtYmVyLmFkanVzdEZvck92ZXJsYXAoKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBidWNrZXQuYWRkSXNvdG9wZUluc3RhbmNlTmVhcmVzdE9wZW4oIGlzb3RvcGUsIHRydWUgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhbmQgYWRkIGFuIGlzb3RvcGUgb2YgdGhlIHNwZWNpZmllZCBjb25maWd1cmF0aW9uLiAgV2hlcmUgdGhlIGlzb3RvcGUgaXMgaW5pdGlhbGx5IHBsYWNlZCBkZXBlbmRzIHVwb24gdGhlXHJcbiAgICogY3VycmVudCBpbnRlcmFjdGl2aXR5IG1vZGUuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBpc290b3BlQ29uZmlnXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBhbmltYXRlXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBjcmVhdGVBbmRBZGRJc290b3BlKCBpc290b3BlQ29uZmlnLCBhbmltYXRlICkge1xyXG4gICAgbGV0IG5ld0lzb3RvcGU7XHJcbiAgICBpZiAoIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSA9PT0gSW50ZXJhY3Rpdml0eU1vZGUuQlVDS0VUU19BTkRfTEFSR0VfQVRPTVMgKSB7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgdGhlIHNwZWNpZmllZCBpc290b3BlIGFuZCBhZGQgaXQgdG8gdGhlIGFwcHJvcHJpYXRlIGJ1Y2tldC5cclxuICAgICAgbmV3SXNvdG9wZSA9IG5ldyBNb3ZhYmxlQXRvbShcclxuICAgICAgICBpc290b3BlQ29uZmlnLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgaXNvdG9wZUNvbmZpZy5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSwgbmV3IFZlY3RvcjIoIDAsIDAgKVxyXG4gICAgICApO1xyXG4gICAgICBuZXdJc290b3BlLmNvbG9yID0gdGhpcy5nZXRDb2xvckZvcklzb3RvcGUoIGlzb3RvcGVDb25maWcgKTtcclxuICAgICAgbmV3SXNvdG9wZS5tYXNzTnVtYmVyID0gaXNvdG9wZUNvbmZpZy5tYXNzTnVtYmVyUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgIG5ld0lzb3RvcGUucHJvdG9uQ291bnQgPSBpc290b3BlQ29uZmlnLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCk7XHJcblxyXG4gICAgICBjb25zdCBidWNrZXQgPSB0aGlzLmdldEJ1Y2tldEZvcklzb3RvcGUoIGlzb3RvcGVDb25maWcgKTtcclxuICAgICAgYnVja2V0LmFkZElzb3RvcGVJbnN0YW5jZUZpcnN0T3BlbiggbmV3SXNvdG9wZSwgYW5pbWF0ZSApO1xyXG5cclxuICAgICAgLy8gZG9lcyBub3QgcmVxdWlyZSB1bmxpbmtcclxuICAgICAgbmV3SXNvdG9wZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LmxpbmsoIHVzZXJDb250cm9sbGVkID0+IHtcclxuICAgICAgICBpZiAoICF1c2VyQ29udHJvbGxlZCAmJiAhYnVja2V0LmNvbnRhaW5zUGFydGljbGUoIG5ld0lzb3RvcGUgKSApIHtcclxuICAgICAgICAgIHRoaXMucGxhY2VJc290b3BlKCBuZXdJc290b3BlLCBidWNrZXQsIHRoaXMudGVzdENoYW1iZXIgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgICAgdGhpcy5pc290b3Blc0xpc3QuYWRkKCBuZXdJc290b3BlICk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3SXNvdG9wZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYnVja2V0IHdoZXJlIHRoZSBnaXZlbiBpc290b3BlIGNhbiBiZSBwbGFjZWQuXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBpc290b3BlXHJcbiAgICogQHJldHVybnMge01vbm9Jc290b3BlQnVja2V0fSBBIGJ1Y2tldCB0aGF0IGNhbiBob2xkIHRoZSBpc290b3BlIGlmIG9uZSBleGlzdHMsIG51bGwgaWYgbm90LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCdWNrZXRGb3JJc290b3BlKCBpc290b3BlICkge1xyXG4gICAgbGV0IGlzb3RvcGVCdWNrZXQgPSBudWxsO1xyXG4gICAgdGhpcy5idWNrZXRMaXN0LmZvckVhY2goIGJ1Y2tldCA9PiB7XHJcbiAgICAgIGlmICggYnVja2V0LmlzSXNvdG9wZUFsbG93ZWQoIGlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSwgaXNvdG9wZS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSApICkge1xyXG4gICAgICAgIGlzb3RvcGVCdWNrZXQgPSBidWNrZXQ7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIHJldHVybiBpc290b3BlQnVja2V0O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIG5ld0J1Y2tldCB0byBidWNrZXRMaXN0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtNb25vSXNvdG9wZUJ1Y2tldH0gbmV3QnVja2V0XHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG5cclxuICBhZGRCdWNrZXQoIG5ld0J1Y2tldCApIHtcclxuICAgIHRoaXMuYnVja2V0TGlzdC5wdXNoKCBuZXdCdWNrZXQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB1cCB0aGUgaW5pdGlhbCB1c2VyJ3MgbWl4IGZvciB0aGUgY3VycmVudGx5IGNvbmZpZ3VyZWQgZWxlbWVudC4gVGhpcyBzaG91bGQgc2V0IGFsbCBzdGF0ZSB2YXJpYWJsZXMgdG8gYmVcclxuICAgKiBjb25zaXN0ZW50IHdpdGggdGhlIGRpc3BsYXkgb2YgdGhlIGluaXRpYWwgdXNlcnMgbWl4LiBUaGlzIGlzIGdlbmVyYWxseSBjYWxsZWQgdGhlIGZpcnN0IHRpbWUgYW4gZWxlbWVudCBpc1xyXG4gICAqIHNlbGVjdGVkIGFmdGVyIGluaXRpYWxpemF0aW9uIG9yIHJlc2V0LlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFVwSW5pdGlhbFVzZXJzTWl4KCkge1xyXG4gICAgdGhpcy5yZW1vdmVBbGxJc290b3Blc0Zyb21UZXN0Q2hhbWJlckFuZE1vZGVsKCk7XHJcbiAgICB0aGlzLnNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkuc2V0KCBmYWxzZSApO1xyXG4gICAgdGhpcy5hZGRJc290b3BlQ29udHJvbGxlcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHByb3RvdHlwZUlzb3RvcGVcclxuICAgKiBAcmV0dXJucyB7TnVtYmVyQXRvbX0gcHJvdG90eXBlSXNvdG9wZVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldEF0b20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wcm90b3R5cGVJc290b3BlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgc3RhdGUgb2YgdGhlIG1vZGVsLlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICBnZXRTdGF0ZSgpIHtcclxuXHJcbiAgICAvLyBJZiBhbnkgbW92YWJsZSBpc290b3BlIGluc3RhbmNlcyBhcmUgYmVpbmcgZHJhZ2dlZCBieSB0aGUgdXNlciBhdCB0aGlzIG1vbWVudCwgd2UgbmVlZCB0byBmb3JjZSB0aGF0IGlzb3RvcGVcclxuICAgIC8vIGluc3RhbmNlIGludG8gYSBzdGF0ZSB0aGF0IGluZGljYXRlcyB0aGF0IGl0IGlzbid0LiAgT3RoZXJ3aXNlIGl0IGNhbiBnZXQgbG9zdCwgc2luY2UgaXQgd2lsbCBuZWl0aGVyIGJlIGluIGFcclxuICAgIC8vIGJ1Y2tldCBvciBpbiB0aGUgdGVzdCBjaGFtYmVyLiAgVGhpcyBjYXNlIGNhbiBvbmx5IG9jY3VyIGluIG11bHRpLXRvdWNoIHNpdHVhdGlvbnMsIHNlZVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2lzb3RvcGVzLWFuZC1hdG9taWMtbWFzcy9pc3N1ZXMvMTAxLlxyXG4gICAgY29uc3QgdXNlckNvbnRyb2xsZWRNb3ZhYmxlSXNvdG9wZXMgPSB0aGlzLmlzb3RvcGVzTGlzdC5maWx0ZXIoIGlzb3RvcGUgPT4gaXNvdG9wZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnZhbHVlICk7XHJcbiAgICB1c2VyQ29udHJvbGxlZE1vdmFibGVJc290b3Blcy5mb3JFYWNoKCBpc290b3BlID0+IHtcclxuICAgICAgaXNvdG9wZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnNldCggZmFsc2UgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICByZXR1cm4gbmV3IFN0YXRlKCB0aGlzICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHN0YXRlIG9mIHRoZSBtb2RlbCBiYXNlZCBvbiBhIHByZXZpb3VzbHkgY3JlYXRlZCBzdGF0ZSByZXByZXNlbnRhdGlvbi5cclxuICAgKiBAcGFyYW0ge1N0YXRlfSBtb2RlbFN0YXRlXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHNldFN0YXRlKCBtb2RlbFN0YXRlICkge1xyXG5cclxuICAgIC8vIENsZWFyIG91dCBhbnkgcGFydGljbGVzIHRoYXQgYXJlIGN1cnJlbnRseSBpbiB0aGUgdGVzdCBjaGFtYmVyLlxyXG4gICAgdGhpcy5yZW1vdmVBbGxJc290b3Blc0Zyb21UZXN0Q2hhbWJlckFuZE1vZGVsKCk7XHJcblxyXG4gICAgLy8gUmVzdG9yZSB0aGUgcHJvdG90eXBlIGlzb3RvcGUuXHJcbiAgICB0aGlzLnByb3RvdHlwZUlzb3RvcGUgPSBtb2RlbFN0YXRlLmVsZW1lbnRDb25maWc7XHJcbiAgICB0aGlzLnVwZGF0ZVBvc3NpYmxlSXNvdG9wZXNMaXN0KCk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggbW9kZWxTdGF0ZS5zaG93aW5nTmF0dXJlc01peCA9PT0gdGhpcy5zaG93aW5nTmF0dXJlc01peFByb3BlcnR5LmdldCgpICk7XHJcbiAgICB0aGlzLnNob3dpbmdOYXR1cmVzTWl4UHJvcGVydHkuc2V0KCBtb2RlbFN0YXRlLnNob3dpbmdOYXR1cmVzTWl4ICk7XHJcblxyXG4gICAgLy8gQWRkIGFueSBwYXJ0aWNsZXMgdGhhdCB3ZXJlIGluIHRoZSB0ZXN0IGNoYW1iZXIuXHJcbiAgICB0aGlzLnRlc3RDaGFtYmVyLnNldFN0YXRlKCBtb2RlbFN0YXRlLmlzb3RvcGVUZXN0Q2hhbWJlclN0YXRlICk7XHJcbiAgICB0aGlzLnRlc3RDaGFtYmVyLmNvbnRhaW5lZElzb3RvcGVzLmZvckVhY2goIGlzb3RvcGUgPT4ge1xyXG4gICAgICB0aGlzLmlzb3RvcGVzTGlzdC5hZGQoIGlzb3RvcGUgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGFwcHJvcHJpYXRlIGlzb3RvcGUgY29udHJvbGxlcnMuIFRoaXMgd2lsbCBjcmVhdGUgdGhlIGNvbnRyb2xsZXJzIGluIHRoZWlyIGluaXRpYWwgc3RhdGVzLlxyXG4gICAgdGhpcy5hZGRJc290b3BlQ29udHJvbGxlcnMoKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgdGhlIGlzb3RvcGUgY29udHJvbGxlcnMgdG8gbWF0Y2ggd2hhdGV2ZXIgaXMgaW4gdGhlIHRlc3QgY2hhbWJlci5cclxuICAgIGlmICggdGhpcy5pbnRlcmFjdGl2aXR5TW9kZVByb3BlcnR5LmdldCgpID09PSBJbnRlcmFjdGl2aXR5TW9kZS5CVUNLRVRTX0FORF9MQVJHRV9BVE9NUyApIHtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGUgYnVja2V0cyBhbmQgdGhlIGlzb3RvcGUgaW5zdGFuY2VzIHRoYXQgdGhleSBjb250YWluLlxyXG4gICAgICB0aGlzLnJlbW92ZUJ1Y2tldHMoKTtcclxuICAgICAgbW9kZWxTdGF0ZS5idWNrZXRMaXN0LmZvckVhY2goIGJ1Y2tldCA9PiB7XHJcbiAgICAgICAgdGhpcy5idWNrZXRMaXN0LmFkZCggYnVja2V0ICk7XHJcbiAgICAgICAgY29uc3QgcGFydGljbGVzSW5UaGlzQnVja2V0ID0gbW9kZWxTdGF0ZS5idWNrZXRUb1BhcnRpY2xlTGlzdE1hcC5nZXQoIGJ1Y2tldCApO1xyXG4gICAgICAgIHBhcnRpY2xlc0luVGhpc0J1Y2tldC5mb3JFYWNoKCBpc290b3BlID0+IHtcclxuICAgICAgICAgIHRoaXMuaXNvdG9wZXNMaXN0LmFkZCggaXNvdG9wZSApO1xyXG4gICAgICAgICAgYnVja2V0LmFkZFBhcnRpY2xlRmlyc3RPcGVuKCBpc290b3BlLCBmYWxzZSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBlbGVtZW50IHRoYXQgaXMgY3VycmVudGx5IGluIHVzZSwgYW5kIGZvciB3aGljaCBhbGwgc3RhYmxlIGlzb3RvcGVzIHdpbGwgYmUgYXZhaWxhYmxlIGZvciBtb3ZlbWVudCBpbiBhbmRcclxuICAgKiBvdXQgb2YgdGhlIHRlc3QgY2hhbWJlci4gSW4gY2FzZSB5b3UncmUgd29uZGVyaW5nIHdoeSB0aGlzIGlzIGRvbmUgYXMgYW4gYXRvbSBpbnN0ZWFkIG9mIGp1c3Qgc2V0dGluZyB0aGUgYXRvbWljXHJcbiAgICogbnVtYmVyLCBpdCBpcyBzbyB0aGF0IHRoaXMgd2lsbCBwbGF5IHdlbGwgd2l0aCB0aGUgZXhpc3RpbmcgY29udHJvbGxlcnMgdGhhdCBhbHJlYWR5IGV4aXN0ZWQgYXQgdGhlIHRpbWUgdGhpc1xyXG4gICAqIGNsYXNzIHdhcyBjcmVhdGVkLlxyXG4gICAqXHJcbiAgICogRm9yIHRoZSBzYWtlIG9mIGVmZmljaWVuY3ksIGNsaWVudHMgc2hvdWxkIGJlIGNhcmVmdWwgbm90IHRvIGNhbGwgdGhpcyB3aGVuIGl0IGlzbid0IG5lZWRlZC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7TnVtYmVyQXRvbX0gYXRvbVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBzZXRBdG9tQ29uZmlndXJhdGlvbiggYXRvbSApIHtcclxuXHJcbiAgICBpZiAoICF0aGlzLnNlbGVjdGVkQXRvbUNvbmZpZy5lcXVhbHMoIGF0b20gKSApIHtcclxuICAgICAgdGhpcy5zZWxlY3RlZEF0b21Db25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS5zZXQoIGF0b20ucHJvdG9uQ291bnQgKTtcclxuICAgICAgdGhpcy5zZWxlY3RlZEF0b21Db25maWcuZWxlY3Ryb25Db3VudFByb3BlcnR5LnNldCggYXRvbS5lbGVjdHJvbkNvdW50ICk7XHJcbiAgICAgIHRoaXMuc2VsZWN0ZWRBdG9tQ29uZmlnLm5ldXRyb25Db3VudFByb3BlcnR5LnNldCggYXRvbS5uZXV0cm9uQ291bnQgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIHRoaXMuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVBbGxJc290b3Blc0Zyb21UZXN0Q2hhbWJlckFuZE1vZGVsKCk7XHJcbiAgICAgIHRoaXMucHJvdG90eXBlSXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LnNldCggYXRvbS5wcm90b25Db3VudCApO1xyXG4gICAgICB0aGlzLnByb3RvdHlwZUlzb3RvcGUubmV1dHJvbkNvdW50UHJvcGVydHkuc2V0KCBhdG9tLm5ldXRyb25Db3VudCApO1xyXG4gICAgICB0aGlzLnByb3RvdHlwZUlzb3RvcGUuZWxlY3Ryb25Db3VudFByb3BlcnR5LnNldCggYXRvbS5lbGVjdHJvbkNvdW50ICk7XHJcbiAgICAgIHRoaXMudXBkYXRlUG9zc2libGVJc290b3Blc0xpc3QoKTtcclxuICAgICAgdGhpcy5zaG93TmF0dXJlc01peCgpO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBTYXZlIHRoZSB1c2VyJ3MgbWl4IHN0YXRlIGZvciB0aGUgY3VycmVudCBlbGVtZW50IGJlZm9yZSB0cmFuc2l0aW9uaW5nIHRvIHRoZSBuZXcgb25lLlxyXG4gICAgICBpZiAoIHRoaXMucHJvdG90eXBlSXNvdG9wZSAhPT0gYXRvbSApIHtcclxuICAgICAgICBpZiAoICF0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZS5oYXNPd25Qcm9wZXJ0eSggdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50ICkgKSB7XHJcbiAgICAgICAgICB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50IF0gPSB7fTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN0b3JlIHRoZSBzdGF0ZS5cclxuICAgICAgICB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZVsgdGhpcy5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50IF1bIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSBdID0gdGhpcy5nZXRTdGF0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayB3aGV0aGVyIHByZXZpb3VzIHN0YXRlIGluZm9ybWF0aW9uIHdhcyBzdG9yZWQgZm9yIHRoaXMgY29uZmlndXJhdGlvbi5cclxuICAgICAgaWYgKCB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZS5oYXNPd25Qcm9wZXJ0eSggYXRvbS5wcm90b25Db3VudCApICYmXHJcbiAgICAgICAgICAgdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGVbIGF0b20ucHJvdG9uQ291bnQgXS5oYXNPd25Qcm9wZXJ0eSggdGhpcy5pbnRlcmFjdGl2aXR5TW9kZVByb3BlcnR5LmdldCgpICkgKSB7XHJcblxyXG4gICAgICAgIC8vIFJlc3RvcmUgdGhlIHByZXZpb3VzIHN0YXRlIGluZm9ybWF0aW9uLlxyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoIHRoaXMubWFwSXNvdG9wZUNvbmZpZ1RvVXNlck1peFN0YXRlWyBhdG9tLnByb3RvbkNvdW50IF1bIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5nZXQoKSBdICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFNldCBpbml0aWFsIGRlZmF1bHQgc3RhdGUgZm9yIHRoaXMgaXNvdG9wZSBjb25maWd1cmF0aW9uLlxyXG4gICAgICAgIHRoaXMucmVtb3ZlQWxsSXNvdG9wZXNGcm9tVGVzdENoYW1iZXJBbmRNb2RlbCgpO1xyXG5cclxuICAgICAgICB0aGlzLnByb3RvdHlwZUlzb3RvcGUucHJvdG9uQ291bnRQcm9wZXJ0eS5zZXQoIGF0b20ucHJvdG9uQ291bnQgKTtcclxuICAgICAgICB0aGlzLnByb3RvdHlwZUlzb3RvcGUubmV1dHJvbkNvdW50UHJvcGVydHkuc2V0KCBhdG9tLm5ldXRyb25Db3VudCApO1xyXG4gICAgICAgIHRoaXMucHJvdG90eXBlSXNvdG9wZS5lbGVjdHJvbkNvdW50UHJvcGVydHkuc2V0KCBhdG9tLmVsZWN0cm9uQ291bnQgKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVBvc3NpYmxlSXNvdG9wZXNMaXN0KCk7XHJcblxyXG4gICAgICAgIC8vIFNldCBhbGwgbW9kZWwgZWxlbWVudHMgZm9yIHRoZSBmaXJzdCB0aW1lIHRoaXMgZWxlbWVudCdzIHVzZXIgbWl4IGlzIHNob3duLlxyXG4gICAgICAgIHRoaXMuc2V0VXBJbml0aWFsVXNlcnNNaXgoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGEgbGlzdCBvZiB0aGUgcG9zc2libGUgaXNvdG9wZXMsIHNvcnRlZCBmcm9tIGxpZ2h0ZXN0IHRvIGhlYXZpZXN0LlxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKi9cclxuICB1cGRhdGVQb3NzaWJsZUlzb3RvcGVzTGlzdCgpIHtcclxuICAgIGNvbnN0IHN0YWJsZUlzb3RvcGVzID0gQXRvbUlkZW50aWZpZXIuZ2V0U3RhYmxlSXNvdG9wZXNPZkVsZW1lbnQoIHRoaXMucHJvdG90eXBlSXNvdG9wZS5wcm90b25Db3VudFByb3BlcnR5LmdldCgpICk7XHJcbiAgICBjb25zdCBuZXdJc290b3Blc0xpc3QgPSBbXTtcclxuICAgIGZvciAoIGNvbnN0IGluZGV4IGluIHN0YWJsZUlzb3RvcGVzICkge1xyXG4gICAgICBpZiAoIHN0YWJsZUlzb3RvcGVzLmhhc093blByb3BlcnR5KCBpbmRleCApICkge1xyXG4gICAgICAgIG5ld0lzb3RvcGVzTGlzdC5wdXNoKCBuZXcgTnVtYmVyQXRvbSgge1xyXG4gICAgICAgICAgcHJvdG9uQ291bnQ6IHN0YWJsZUlzb3RvcGVzWyBpbmRleCBdWyAwIF0sXHJcbiAgICAgICAgICBuZXV0cm9uQ291bnQ6IHN0YWJsZUlzb3RvcGVzWyBpbmRleCBdWyAxIF0sXHJcbiAgICAgICAgICBlbGVjdHJvbkNvdW50OiBzdGFibGVJc290b3Blc1sgaW5kZXggXVsgMiBdXHJcbiAgICAgICAgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBTb3J0IGZyb20gbGlnaHRlc3QgdG8gaGVhdmllc3QuIERvIG5vdCBjaGFuZ2UgdGhpcyB3aXRob3V0IGNhcmVmdWwgY29uc2lkZXJhdGlvbnMsIHNpbmNlIHNldmVyYWwgYXJlYXMgb2YgdGhlXHJcbiAgICAvLyBjb2RlIGNvdW50IG9uIHRoaXMuIFRoaXMgaXMga2VwdCBpbiBjYXNlIHNvbWVvbmUgYWRkcyBhbm90aGVyIGlzb3RvcGUgdG8gQXRvbUlkZW50aWZpZXIgYW5kIGRvZXNuJ3QgYWRkIGl0XHJcbiAgICAvLyBpbiBvcmRlci5cclxuICAgIG5ld0lzb3RvcGVzTGlzdC5zb3J0KCAoIGF0b20xLCBhdG9tMiApID0+IGF0b20xLmdldElzb3RvcGVBdG9taWNNYXNzKCkgLSBhdG9tMi5nZXRJc290b3BlQXRvbWljTWFzcygpICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBsaXN0IG9mIHBvc3NpYmxlIGlzb3RvcGVzIGZvciB0aGlzIGF0b21pYyBjb25maWd1cmF0aW9uLlxyXG4gICAgdGhpcy5wb3NzaWJsZUlzb3RvcGVzUHJvcGVydHkuc2V0KCBuZXdJc290b3Blc0xpc3QgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbGwgYnVja2V0cyB0aGF0IGFyZSBjdXJyZW50bHkgaW4gdGhlIG1vZGVsLCBhcyB3ZWxsIGFzIHRoZSBwYXJ0aWNsZXMgdGhleSBjb250YWluZWQuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVtb3ZlQnVja2V0cygpIHtcclxuICAgIHRoaXMuYnVja2V0TGlzdC5mb3JFYWNoKCBidWNrZXQgPT4ge1xyXG4gICAgICBidWNrZXQuX3BhcnRpY2xlcy5mb3JFYWNoKCBpc290b3BlID0+IHtcclxuICAgICAgICB0aGlzLmlzb3RvcGVzTGlzdC5yZW1vdmUoIGlzb3RvcGUgKTtcclxuICAgICAgfSApO1xyXG4gICAgICBidWNrZXQucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYnVja2V0TGlzdC5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHVwIHRoZSBhcHByb3ByaWF0ZSBpc290b3BlIGNvbnRyb2xsZXJzIGJhc2VkIG9uIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZWxlbWVudCwgdGhlIGludGVyYWN0aXZpdHkgbW9kZSwgYW5kXHJcbiAgICogdGhlIG1peCBzZXR0aW5nIChpLmUuIHVzZXIncyBtaXggb3IgbmF0dXJlJ3MgbWl4KS4gVGhpcyB3aWxsIHJlbW92ZSBhbnkgZXhpc3RpbmcgY29udHJvbGxlcnMuIFRoaXMgd2lsbCBhbHNvIGFkZFxyXG4gICAqIHRoZSBhcHByb3ByaWF0ZSBpbml0aWFsIG51bWJlciBvZiBpc290b3BlcyB0byBhbnkgYnVja2V0cyB0aGF0IGFyZSBjcmVhdGVkLlxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZElzb3RvcGVDb250cm9sbGVycygpIHtcclxuXHJcbiAgICAvLyBSZW1vdmUgZXhpc3RpbmcgY29udHJvbGxlcnMuXHJcbiAgICB0aGlzLnJlbW92ZUJ1Y2tldHMoKTtcclxuICAgIHRoaXMucmVtb3ZlTnVtZXJpY2FsQ29udHJvbGxlcnMoKTtcclxuXHJcbiAgICBjb25zdCBidWNrZXRzID0gdGhpcy5pbnRlcmFjdGl2aXR5TW9kZVByb3BlcnR5LmdldCgpID09PSBJbnRlcmFjdGl2aXR5TW9kZS5CVUNLRVRTX0FORF9MQVJHRV9BVE9NUyB8fFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgbGF5b3V0IHZhcmlhYmxlcy5cclxuICAgIGNvbnN0IGNvbnRyb2xsZXJZT2Zmc2V0QnVja2V0ID0gLTI1MDsgLy8gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgY29uc3QgY29udHJvbGxlcllPZmZzZXRTbGlkZXIgPSAtMjM4OyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICBsZXQgaW50ZXJDb250cm9sbGVyRGlzdGFuY2VYO1xyXG4gICAgbGV0IGNvbnRyb2xsZXJYT2Zmc2V0O1xyXG4gICAgaWYgKCB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eS5nZXQoKS5sZW5ndGggPCA0ICkge1xyXG5cclxuICAgICAgLy8gV2UgY2FuIGZpdCAzIG9yIGxlc3MgY2xlYW5seSB1bmRlciB0aGUgdGVzdCBjaGFtYmVyLlxyXG4gICAgICBpbnRlckNvbnRyb2xsZXJEaXN0YW5jZVggPSB0aGlzLnRlc3RDaGFtYmVyLmdldFRlc3RDaGFtYmVyUmVjdCgpLmdldFdpZHRoKCkgLyB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eS5nZXQoKS5sZW5ndGg7XHJcbiAgICAgIGNvbnRyb2xsZXJYT2Zmc2V0ID0gdGhpcy50ZXN0Q2hhbWJlci5nZXRUZXN0Q2hhbWJlclJlY3QoKS5taW5YICsgaW50ZXJDb250cm9sbGVyRGlzdGFuY2VYIC8gMjtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gRm91ciBjb250cm9sbGVycyBkb24ndCBmaXQgd2VsbCB1bmRlciB0aGUgY2hhbWJlciwgc28gdXNlIGEgcG9zaXRpb25pbmcgYWxnb3JpdGhtIHdoZXJlIHRoZXkgYXJlIGV4dGVuZGVkXHJcbiAgICAgIC8vIGEgYml0IHRvIHRoZSByaWdodC5cclxuICAgICAgaW50ZXJDb250cm9sbGVyRGlzdGFuY2VYID0gKCB0aGlzLnRlc3RDaGFtYmVyLmdldFRlc3RDaGFtYmVyUmVjdCgpLmdldFdpZHRoKCkgKiAxLjEwICkgL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eS5nZXQoKS5sZW5ndGg7XHJcbiAgICAgIGNvbnRyb2xsZXJYT2Zmc2V0ID0gLTE4MDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGQgdGhlIGNvbnRyb2xsZXJzLlxyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5wb3NzaWJsZUlzb3RvcGVzUHJvcGVydHkuZ2V0KCkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IGlzb3RvcGVDb25maWcgPSB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eS5nZXQoKVsgaSBdO1xyXG4gICAgICBjb25zdCBpc290b3BlQ2FwdGlvbiA9IGAke0F0b21JZGVudGlmaWVyLmdldE5hbWUoIGlzb3RvcGVDb25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSApXHJcbiAgICAgIH0tJHtpc290b3BlQ29uZmlnLm1hc3NOdW1iZXJQcm9wZXJ0eS5nZXQoKX1gO1xyXG4gICAgICBpZiAoIGJ1Y2tldHMgKSB7XHJcbiAgICAgICAgY29uc3QgbmV3QnVja2V0ID0gbmV3IE1vbm9Jc290b3BlQnVja2V0KFxyXG4gICAgICAgICAgaXNvdG9wZUNvbmZpZy5wcm90b25Db3VudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICAgICAgaXNvdG9wZUNvbmZpZy5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgcG9zaXRpb246IG5ldyBWZWN0b3IyKCBjb250cm9sbGVyWE9mZnNldCArIGludGVyQ29udHJvbGxlckRpc3RhbmNlWCAqIGksIGNvbnRyb2xsZXJZT2Zmc2V0QnVja2V0ICksXHJcbiAgICAgICAgICAgIHNpemU6IEJVQ0tFVF9TSVpFLFxyXG4gICAgICAgICAgICBiYXNlQ29sb3I6IHRoaXMuZ2V0Q29sb3JGb3JJc290b3BlKCBpc290b3BlQ29uZmlnICksXHJcbiAgICAgICAgICAgIGNhcHRpb25UZXh0OiBpc290b3BlQ2FwdGlvbixcclxuICAgICAgICAgICAgc3BoZXJlUmFkaXVzOiBMQVJHRV9JU09UT1BFX1JBRElVU1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdGhpcy5hZGRCdWNrZXQoIG5ld0J1Y2tldCApO1xyXG4gICAgICAgIGlmICggIXRoaXMuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKSApIHtcclxuXHJcbiAgICAgICAgICAvLyBDcmVhdGUgYW5kIGFkZCBpbml0aWFsIGlzb3RvcGVzIHRvIHRoZSBuZXcgYnVja2V0LlxyXG4gICAgICAgICAgXy50aW1lcyggTlVNX0xBUkdFX0lTT1RPUEVTX1BFUl9CVUNLRVQsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVBbmRBZGRJc290b3BlKCBpc290b3BlQ29uZmlnLCBmYWxzZSApO1xyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gYXNzdW1lIGEgbnVtZXJpY2FsIGNvbnRyb2xsZXJcclxuICAgICAgICBjb25zdCBuZXdDb250cm9sbGVyID0gbmV3IE51bWVyaWNhbElzb3RvcGVRdWFudGl0eUNvbnRyb2woXHJcbiAgICAgICAgICB0aGlzLFxyXG4gICAgICAgICAgaXNvdG9wZUNvbmZpZyxcclxuICAgICAgICAgIG5ldyBWZWN0b3IyKCBjb250cm9sbGVyWE9mZnNldCArIGludGVyQ29udHJvbGxlckRpc3RhbmNlWCAqIGksIGNvbnRyb2xsZXJZT2Zmc2V0U2xpZGVyICksXHJcbiAgICAgICAgICBpc290b3BlQ2FwdGlvblxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgY29udHJvbGxlcklzb3RvcGUgPSBuZXcgTW92YWJsZUF0b20oXHJcbiAgICAgICAgICBpc290b3BlQ29uZmlnLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgICBpc290b3BlQ29uZmlnLm5ldXRyb25Db3VudFByb3BlcnR5LmdldCgpLFxyXG4gICAgICAgICAgbmV3IFZlY3RvcjIoIDAsIDAgKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29udHJvbGxlcklzb3RvcGUuY29sb3IgPSB0aGlzLmdldENvbG9yRm9ySXNvdG9wZSggaXNvdG9wZUNvbmZpZyApO1xyXG4gICAgICAgIGNvbnRyb2xsZXJJc290b3BlLnJhZGl1c1Byb3BlcnR5LnNldCggU01BTExfSVNPVE9QRV9SQURJVVMgKTtcclxuICAgICAgICBuZXdDb250cm9sbGVyLmNvbnRyb2xsZXJJc290b3BlID0gY29udHJvbGxlcklzb3RvcGU7XHJcbiAgICAgICAgdGhpcy5udW1lcmljYWxDb250cm9sbGVyTGlzdC5hZGQoIG5ld0NvbnRyb2xsZXIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gQHB1YmxpY1xyXG4gIHJlbW92ZU51bWVyaWNhbENvbnRyb2xsZXJzKCkge1xyXG4gICAgdGhpcy5udW1lcmljYWxDb250cm9sbGVyTGlzdC5jbGVhcigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOdW1iZXJBdG9tfSBpc290b3BlXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0Q29sb3JGb3JJc290b3BlKCBpc290b3BlICkge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eS5nZXQoKS5pbmRleE9mKCBpc290b3BlICk7XHJcbiAgICByZXR1cm4gaW5kZXggPj0gMCA/IElTT1RPUEVfQ09MT1JTWyB0aGlzLnBvc3NpYmxlSXNvdG9wZXNQcm9wZXJ0eS5nZXQoKS5pbmRleE9mKCBpc290b3BlICkgXSA6IENvbG9yLldISVRFO1xyXG4gIH1cclxuXHJcbiAgLy8gQHByaXZhdGVcclxuICBzaG93TmF0dXJlc01peCgpIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKSA9PT0gdHJ1ZSApO1xyXG5cclxuICAgIC8vIENsZWFyIG91dCBhbnl0aGluZyB0aGF0IGlzIGluIHRoZSB0ZXN0IGNoYW1iZXIuIElmIGFueXRoaW5nIG5lZWRlZCB0byBiZSBzdG9yZWQsIGl0IHNob3VsZCBoYXZlIGJlZW4gZG9uZSBieSBub3cuXHJcbiAgICB0aGlzLnJlbW92ZUFsbElzb3RvcGVzRnJvbVRlc3RDaGFtYmVyQW5kTW9kZWwoKTtcclxuICAgIHRoaXMubmF0dXJlc0lzb3RvcGVzTGlzdC5jbGVhcigpO1xyXG5cclxuICAgIC8vIEdldCB0aGUgbGlzdCBvZiBwb3NzaWJsZSBpc290b3BlcyBhbmQgdGhlbiBzb3J0IGl0IGJ5IGFidW5kYW5jZSBzbyB0aGF0IHRoZSBsZWFzdCBhYnVuZGFudCBhcmUgYWRkZWQgbGFzdCwgdGh1c1xyXG4gICAgLy8gYXNzdXJpbmcgdGhhdCB0aGV5IHdpbGwgYmUgdmlzaWJsZS5cclxuICAgIGNvbnN0IHBvc3NpYmxlSXNvdG9wZXNDb3B5ID0gdGhpcy5wb3NzaWJsZUlzb3RvcGVzUHJvcGVydHkuZ2V0KCkuc2xpY2UoIDAgKTtcclxuICAgIGNvbnN0IG51bURpZ2l0c0ZvckNvbXBhcmlzb24gPSAxMDtcclxuICAgIHBvc3NpYmxlSXNvdG9wZXNDb3B5LnNvcnQoICggYXRvbTEsIGF0b20yICkgPT4gQXRvbUlkZW50aWZpZXIuZ2V0TmF0dXJhbEFidW5kYW5jZSggYXRvbTIsIG51bURpZ2l0c0ZvckNvbXBhcmlzb24gKSAtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF0b21JZGVudGlmaWVyLmdldE5hdHVyYWxBYnVuZGFuY2UoIGF0b20xLCBudW1EaWdpdHNGb3JDb21wYXJpc29uICkgKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGlzb3RvcGVzLlxyXG4gICAgcG9zc2libGVJc290b3Blc0NvcHkuZm9yRWFjaCggaXNvdG9wZUNvbmZpZyA9PiB7XHJcbiAgICAgIGxldCBudW1Ub0NyZWF0ZSA9IFV0aWxzLnJvdW5kU3ltbWV0cmljKFxyXG4gICAgICAgIE5VTV9OQVRVUkVTX01JWF9BVE9NUyAqIEF0b21JZGVudGlmaWVyLmdldE5hdHVyYWxBYnVuZGFuY2UoIGlzb3RvcGVDb25maWcsIDUgKVxyXG4gICAgICApO1xyXG4gICAgICBpZiAoIG51bVRvQ3JlYXRlID09PSAwICkge1xyXG4gICAgICAgIC8vIFRoZSBjYWxjdWxhdGVkIHF1YW50aXR5IHdhcyAwLCBidXQgd2UgZG9uJ3Qgd2FudCB0byBoYXZlIG5vIGluc3RhbmNlcyBvZiB0aGlzIGlzb3RvcGUgaW4gdGhlIGNoYW1iZXIsIHNvXHJcbiAgICAgICAgLy8gYWRkIG9ubHkgb25lLiBUaGlzIGJlaGF2aW9yIHdhcyByZXF1ZXN0ZWQgYnkgdGhlIGRlc2lnbiB0ZWFtLlxyXG4gICAgICAgIG51bVRvQ3JlYXRlID0gMTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBpc290b3Blc1RvQWRkID0gW107XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bVRvQ3JlYXRlOyBpKysgKSB7XHJcbiAgICAgICAgY29uc3QgbmV3SXNvdG9wZSA9IG5ldyBNb3ZhYmxlQXRvbShcclxuICAgICAgICAgIGlzb3RvcGVDb25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgICAgIGlzb3RvcGVDb25maWcubmV1dHJvbkNvdW50UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgICAgICB0aGlzLnRlc3RDaGFtYmVyLmdlbmVyYXRlUmFuZG9tUG9zaXRpb24oKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgbmV3SXNvdG9wZS5jb2xvciA9IHRoaXMuZ2V0Q29sb3JGb3JJc290b3BlKCBpc290b3BlQ29uZmlnICk7XHJcbiAgICAgICAgbmV3SXNvdG9wZS5tYXNzTnVtYmVyID0gaXNvdG9wZUNvbmZpZy5tYXNzTnVtYmVyUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgbmV3SXNvdG9wZS5wcm90b25Db3VudCA9IGlzb3RvcGVDb25maWcucHJvdG9uQ291bnRQcm9wZXJ0eS5nZXQoKTtcclxuICAgICAgICBuZXdJc290b3BlLnJhZGl1c1Byb3BlcnR5LnNldCggU01BTExfSVNPVE9QRV9SQURJVVMgKTtcclxuICAgICAgICBuZXdJc290b3BlLnNob3dMYWJlbCA9IGZhbHNlO1xyXG4gICAgICAgIGlzb3RvcGVzVG9BZGQucHVzaCggbmV3SXNvdG9wZSApO1xyXG4gICAgICAgIHRoaXMubmF0dXJlc0lzb3RvcGVzTGlzdC5wdXNoKCBuZXdJc290b3BlICk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy50ZXN0Q2hhbWJlci5idWxrQWRkSXNvdG9wZXNUb0NoYW1iZXIoIGlzb3RvcGVzVG9BZGQgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMubmF0dXJlc0lzb3RvcGVVcGRhdGVkLmVtaXQoKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIGlzb3RvcGUgY29udHJvbGxlcnMgKGkuZS4gdGhlIGJ1Y2tldHMpLlxyXG4gICAgdGhpcy5hZGRJc290b3BlQ29udHJvbGxlcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZSBhbGwgaXNvdG9wZXMgZnJvbSB0aGUgdGVzdCBjaGFtYmVyLCBhbmQgdGhlbiByZW1vdmUgdGhlbSBmcm9tIHRoZSBtb2RlbC4gVGhpcyBtZXRob2QgZG9lcyBub3QgYWRkIHJlbW92ZWRcclxuICAgKiBpc290b3BlcyBiYWNrIHRvIHRoZSBidWNrZXRzIG9yIHVwZGF0ZSB0aGUgY29udHJvbGxlcnMuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlbW92ZUFsbElzb3RvcGVzRnJvbVRlc3RDaGFtYmVyQW5kTW9kZWwoKSB7XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRoZSBpc290b3BlcyBmcm9tIHRoZSB0ZXN0IGNoYW1iZXIuXHJcbiAgICB0aGlzLnRlc3RDaGFtYmVyLnJlbW92ZUFsbElzb3RvcGVzKCk7XHJcblxyXG4gICAgLy8gUmVzZXQgdGhlIGJ1Y2tldHMgc28gdGhhdCB0aGV5IGRvbid0IGhhdmUgcmVmZXJlbmNlcyB0byB0aGUgcGFydGljbGVzLlxyXG4gICAgdGhpcy5idWNrZXRMaXN0LmZvckVhY2goIGJ1Y2tldCA9PiB7XHJcbiAgICAgIGJ1Y2tldC5yZXNldCgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENsZWFyIHRoZSBtb2RlbC1zcGVjaWZpYyBsaXN0IG9mIGlzb3RvcGVzLlxyXG4gICAgdGhpcy5pc290b3Blc0xpc3QuY2xlYXIoKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBjbGVhckJveCgpIHtcclxuICAgIHRoaXMucmVtb3ZlQWxsSXNvdG9wZXNGcm9tVGVzdENoYW1iZXJBbmRNb2RlbCgpO1xyXG4gICAgdGhpcy5hZGRJc290b3BlQ29udHJvbGxlcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0cyB0aGUgbW9kZWwuIFJldHVybnMgdGhlIGRlZmF1bHQgc2V0dGluZ3MuXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmNsZWFyQm94KCk7XHJcblxyXG4gICAgLy8gUmVtb3ZlIGFueSBzdG9yZWQgc3RhdGUgZm9yIHRoZSBkZWZhdWx0IGF0b20uXHJcbiAgICAvLyBiZWZvcmUgY2xlYXJpbmcgdXAgdGhlIHN0YXRlIGNsZWFyaW5nIGFsbCB0aGUgb2JzZXJ2YWJsZSBhcnJheSBzdG9yZWQgaW4gaXRcclxuXHJcbiAgICB0aGlzLm1hcElzb3RvcGVDb25maWdUb1VzZXJNaXhTdGF0ZSA9IHt9O1xyXG5cclxuICAgIHRoaXMubmF0dXJlc0lzb3RvcGVzTGlzdC5jbGVhcigpO1xyXG5cclxuICAgIHRoaXMuaW50ZXJhY3Rpdml0eU1vZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5wb3NzaWJsZUlzb3RvcGVzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMucHJvdG90eXBlSXNvdG9wZSA9IG5ldyBOdW1iZXJBdG9tKCk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0IGVsZW1lbnRcclxuICAgIHRoaXMuc2V0QXRvbUNvbmZpZ3VyYXRpb24oIERFRkFVTFRfQVRPTV9DT05GSUcgKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgYWxsIHN0b3JlZCB1c2VyJ3MgbWl4IHN0YXRlcy4gIFRoaXMgbXVzdCBiZSBkb25lIGFmdGVyIHNldHRpbmcgdGhlIGRlZmF1bHQgaXNvdG9wZSBiZWNhdXNlIHN0YXRlIGNvdWxkXHJcbiAgICAvLyBoYXZlIGJlZW4gc2F2ZWQgd2hlbiB0aGUgZGVmYXVsdCB3YXMgc2V0LlxyXG4gICAgdGhpcy5tYXBJc290b3BlQ29uZmlnVG9Vc2VyTWl4U3RhdGUgPSB7fTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDbGFzcyB0aGF0IGNhbiBiZSB1c2VkIHRvIHNhdmUgdGhlIHN0YXRlIG9mIHRoZSBtb2RlbC4gVGhpcyB3aWxsIGJlIHVzZWQgZm9yIHNhdmluZyBhbmQgcmVzdG9yaW5nIG9mIHRoZSBzdGF0ZSB3aGVuXHJcbiAqIHN3aXRjaGluZyBiZXR3ZWVuIHZhcmlvdXMgbW9kZXMuXHJcbiAqIEBwYXJhbSB7TWl4SXNvdG9wZXNNb2RlbH0gbW9kZWxcclxuICovXHJcbmNsYXNzIFN0YXRlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtNaXhJc290b3Blc01vZGVsfSBtb2RlbFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCApIHtcclxuICAgIHRoaXMuZWxlbWVudENvbmZpZyA9IG5ldyBOdW1iZXJBdG9tKCB7XHJcbiAgICAgIHByb3RvbkNvdW50OiBtb2RlbC5wcm90b3R5cGVJc290b3BlLnByb3RvbkNvdW50UHJvcGVydHkuZ2V0KCksXHJcbiAgICAgIG5ldXRyb25Db3VudDogbW9kZWwucHJvdG90eXBlSXNvdG9wZS5uZXV0cm9uQ291bnRQcm9wZXJ0eS5nZXQoKSxcclxuICAgICAgZWxlY3Ryb25Db3VudDogbW9kZWwucHJvdG90eXBlSXNvdG9wZS5lbGVjdHJvbkNvdW50UHJvcGVydHkuZ2V0KClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuaXNvdG9wZVRlc3RDaGFtYmVyU3RhdGUgPSBtb2RlbC50ZXN0Q2hhbWJlci5nZXRTdGF0ZSgpO1xyXG4gICAgdGhpcy5pbnRlcmFjdGl2aXR5TW9kZSA9IG1vZGVsLmludGVyYWN0aXZpdHlNb2RlUHJvcGVydHkuZ2V0KCk7XHJcbiAgICB0aGlzLnNob3dpbmdOYXR1cmVzTWl4ID0gbW9kZWwuc2hvd2luZ05hdHVyZXNNaXhQcm9wZXJ0eS5nZXQoKTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgbm9uZSBvZiB0aGUgaXNvdG9wZSBpbnN0YW5jZXMgYXJlIGluIGEgc3RhdGUgd2hlcmUgdGhleSBhcmUgYmVpbmcgZHJhZ2dlZCBieSB0aGUgdXNlci4gIEluIHRoZSB2YXN0XHJcbiAgICAvLyBtYWpvcml0eSBvZiBjYXNlcywgdGhleSB3b24ndCBiZSB3aGVuIHRoZSBzdGF0ZSBpcyByZWNvcmRlZCwgc28gdGhpcyB3aWxsIGJlIGEgbm8tb3AsIGJ1dCB0aGVyZSBhcmUgc29tZSBtdWx0aS1cclxuICAgIC8vIHRvdWNoIHNjZW5hcmlvcyB3aGVyZSBpdCBpcyBwb3NzaWJsZSwgYW5kIGl0IGlzIHByb2JsZW1hdGljIHRvIHRyeSB0byBzdG9yZSB0aGVtIGluIHRoaXMgc3RhdGUuICBUaGUgdmlldyB3aWxsXHJcbiAgICAvLyBjYW5jZWwgaW50ZXJhY3Rpb25zIGFueXdheSwgYnV0IHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoZSBjYW5jZWxsYXRpb24gd2lsbCBoYXZlIGhhcHBlbmVkIGF0IHRoaXMgcG9pbnQgaW5cclxuICAgIC8vIHRpbWUsIHNvIHdlIGhhdmUgdG8gZG8gdGhpcyBoZXJlIHRvIGJlIHN1cmUuICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2lzb3RvcGVzLWFuZC1hdG9taWMtbWFzcy9pc3N1ZXMvMTAxLlxyXG4gICAgbW9kZWwuaXNvdG9wZXNMaXN0LmZvckVhY2goIGlzb3RvcGVJbnN0YW5jZSA9PiB7IGlzb3RvcGVJbnN0YW5jZS51c2VyQ29udHJvbGxlZFByb3BlcnR5LnNldCggZmFsc2UgKTsgfSApO1xyXG5cclxuICAgIC8vIEZvciB0aGUgYnVja2V0IHN0YXRlLCB3ZSBrZWVwIHJlZmVyZW5jZXMgdG8gdGhlIGFjdHVhbCBidWNrZXRzIGFuZCBwYXJ0aWNsZXMgdGhhdCBhcmUgYmVpbmcgdXNlZC4gIFRoaXMgd29ya3MgZm9yXHJcbiAgICAvLyB0aGlzIG1vZGVsIGJlY2F1c2Ugbm90aGluZyBlbHNlIGlzIGRvbmUgd2l0aCBhIGJ1Y2tldCBhZnRlciBzYXZpbmcgaXRzIHN0YXRlLiAgSXQgaXMgYWRtaXR0ZWRseSBub3QgdmVyeSBnZW5lcmFsLFxyXG4gICAgLy8gYnV0IHdvcmtzIGZpbmUgZm9yIHRoZSBuZWVkcyBvZiB0aGlzIG1vZGVsLiAgTm90ZSB0aGF0IHdlIG5lZWQgdG8gc3RvcmUgdGhlIHBhcnRpY2xlIHJlZmVyZW5jZXMgc2VwYXJhdGVseSBzb1xyXG4gICAgLy8gdGhhdCB0aGV5IGNhbiBiZSBhZGRlZCBiYWNrIGR1cmluZyBzdGF0ZSByZXN0b3JhdGlvbi5cclxuICAgIHRoaXMuYnVja2V0TGlzdCA9IFsgLi4ubW9kZWwuYnVja2V0TGlzdCBdO1xyXG4gICAgdGhpcy5idWNrZXRUb1BhcnRpY2xlTGlzdE1hcCA9IG5ldyBNYXAoKTtcclxuICAgIG1vZGVsLmJ1Y2tldExpc3QuZm9yRWFjaCggYnVja2V0ID0+IHtcclxuICAgICAgY29uc3QgcGFydGljbGVzSW5UaGlzQnVja2V0ID0gWyAuLi5idWNrZXQuZ2V0UGFydGljbGVMaXN0KCkgXTtcclxuICAgICAgdGhpcy5idWNrZXRUb1BhcnRpY2xlTGlzdE1hcC5zZXQoIGJ1Y2tldCwgcGFydGljbGVzSW5UaGlzQnVja2V0ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBzdGF0aWNzXHJcbk1peElzb3RvcGVzTW9kZWwuSW50ZXJhY3Rpdml0eU1vZGUgPSBJbnRlcmFjdGl2aXR5TW9kZTtcclxuXHJcbmlzb3RvcGVzQW5kQXRvbWljTWFzcy5yZWdpc3RlciggJ01peElzb3RvcGVzTW9kZWwnLCBNaXhJc290b3Blc01vZGVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNaXhJc290b3Blc01vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxxQkFBcUIsTUFBTSw4Q0FBOEM7QUFDaEYsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUNwRCxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELFNBQVNDLEtBQUssUUFBUSxtQ0FBbUM7QUFDekQsT0FBT0MsY0FBYyxNQUFNLHdDQUF3QztBQUNuRSxPQUFPQyxVQUFVLE1BQU0sMENBQTBDO0FBQ2pFLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFDMUQsT0FBT0Msa0JBQWtCLE1BQU0seUJBQXlCO0FBQ3hELE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUN0RCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBQzFDLE9BQU9DLCtCQUErQixNQUFN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