// Copyright 2018-2023, University of Colorado Boulder

/**
 * TermCreator is the abstract base type for creating and managing terms.
 *
 * Terms can be created in 3 ways:
 * - by dragging them out of a toolbox below a plate
 * - by restoring a snapshot
 * - by using the 'universal operation' control.
 *
 * TermCreators operate in one of two modes, based on the value of {boolean} this.combineLikeTermsEnabled:
 * true: each term *type* occupies one cell on the scale, and all like terms are combined
 * false: each term *instance* occupies one cell on the scale, and terms are combined only if they sum to zero
 *
 * See https://github.com/phetsims/equality-explorer/blob/master/doc/implementation-notes.md
 * for a detailed description of how the PhET 'creator pattern' is applied in this simulation.
 *
 * Note that TermCreator is not involved with Terms that are created for snapshots. Those terms are created
 * and managed by Snapshot. See https://github.com/phetsims/equality-explorer/issues/199
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import Fraction from '../../../../phetcommon/js/model/Fraction.js';
import { SceneryEvent } from '../../../../scenery/js/imports.js';
import equalityExplorer from '../../equalityExplorer.js';
import EqualityExplorerConstants from '../EqualityExplorerConstants.js';
import Term from './Term.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';

// sign that will be applied to terms that are created

// options to createTerm, createTermProtected, and createZeroTerm

export default class TermCreator extends PhetioObject {
  // The plate that this term creator is associated with.
  // null during deferred initialization, see set plate() for notes.
  // Positions of the associated positive and negative TermCreatorNodes.
  // null during deferred initialization, see set positivePosition() and set negativePosition() for notes.
  // like terms will be combined in this cell in the plate's 2D grid
  // Convenience property, so we don't need to test the type of likeTermsCell.
  // drag bounds for terms created
  // All 'managed' terms that currently exist. Managed terms include those on the balance scale, those being dragged
  // by the user, and those that are animating. It does not include terms that are part of a snapshot.
  // terms that are on the plate, a subset of this.allTerms
  // number of term on the associated plate, so we don't have to make this.termsOnPlate public
  // Weight of the terms that are on the plate
  // Emit is called when a term is created.
  // The event arg is non-null if the term was created as the result of a user interaction.
  // Emit is called when adding a term to the plate would cause EqualityExplorerQueryParameters.maxInteger
  // to be exceeded. See https://github.com/phetsims/equality-explorer/issues/48
  // Optional equivalent term creator on the opposite side of the scale. This is needed
  // for the lock feature, which involves creating an equivalent term on the opposite side of the scale.
  // Example: When locked, if you drag -x out of the left toolbox, -x must also drag out of the right toolbox.
  // Because this is a 2-way association, initialization is deferred until after instantiation.
  // See set equivalentTermCreator() for notes.
  // indicates whether this term creator is locked to _equivalentTermCreator
  // called when a term is disposed
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      variable: null,
      dragBounds: Bounds2.EVERYTHING,
      likeTermsCell: null,
      lockedProperty: null,
      // PhetioObjectOptions
      phetioState: false
    }, providedOptions);
    super(options);
    this.variable = options.variable;
    this._plate = null;
    this._positivePosition = null;
    this._negativePosition = null;
    this.likeTermsCell = options.likeTermsCell;
    this.combineLikeTermsEnabled = options.likeTermsCell !== null;
    this.dragBounds = options.dragBounds;
    this.allTerms = createObservableArray();
    this.termsOnPlate = createObservableArray();
    this.numberOfTermsOnPlateProperty = new DerivedProperty([this.termsOnPlate.lengthProperty], length => length, {
      tandem: options.tandem.createTandem('numberOfTermsOnPlateProperty'),
      phetioValueType: NumberIO,
      phetioDocumentation: 'Number of terms on the plate that were created by this term creator'
    });
    const weightOnPlateDependencies = [this.numberOfTermsOnPlateProperty];
    if (options.variable) {
      weightOnPlateDependencies.push(options.variable.valueProperty);
    }
    this.weightOnPlateProperty = DerivedProperty.deriveAny(weightOnPlateDependencies, () => {
      let weight = Fraction.fromInteger(0);
      for (let i = 0; i < this.termsOnPlate.length; i++) {
        weight = weight.plus(this.termsOnPlate.get(i).weight).reduced();
      }
      return weight;
    }, {
      valueType: Fraction,
      valueComparisonStrategy: 'equalsFunction',
      // set value only if truly different, prevents costly unnecessary notifications
      tandem: options.tandem.createTandem('weightOnPlateProperty'),
      phetioValueType: Fraction.FractionIO,
      phetioDocumentation: 'Weight of the terms on the plate that were created by this term creator'
    });
    this.termCreatedEmitter = new Emitter({
      parameters: [{
        valueType: TermCreator
      }, {
        valueType: Term
      }, {
        valueType: [SceneryEvent, null]
      }]
    });
    this.maxIntegerExceededEmitter = new Emitter();
    this._equivalentTermCreator = null;

    // If options.lockedProperty was not provided, then create a Property that permanently turns this feature off.
    this.lockedProperty = options.lockedProperty || new BooleanProperty(false, {
      validValues: [false]
      // Do not instrument, this feature is off.
    });

    this.termDisposedListener = term => this.unmanageTerm(term);

    // When locked changes...
    this.lockedProperty.lazyLink(locked => {
      // If lock feature is turned on, verify that an equivalentTermCreator has been provided.
      assert && assert(!locked || this.equivalentTermCreator, 'lock feature requires equivalentTermCreator');

      // Changing lock state causes all terms that are not on the plate to be disposed.
      this.disposeTermsNotOnPlate();
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }

  /**
   * Initializes the plate that this TermCreator is associated with. This association necessarily occurs
   * after instantiation, since TermCreators are instantiated before Plates, and the association is 2-way.
   */
  set plate(value) {
    assert && assert(!this._plate, 'attempted to initialize plate twice');
    this._plate = value;
  }

  /**
   * Gets the plate that this TermCreator is associated with.
   */
  get plate() {
    const plate = this._plate;
    assert && assert(plate, 'attempt to access plate before it was initialized');
    return plate;
  }

  /**
   * Initializes the position of the positive TermCreatorNode.
   * The value is dependent on the view and is unknowable until the sim has loaded.
   * See TermCreatorNode.frameStartedCallback for initialization.
   */
  set positivePosition(value) {
    assert && assert(!this._positivePosition, 'attempted to initialize positivePosition twice');
    this._positivePosition = value;
  }

  /**
   * Gets the position of the positive TermCreatorNode.
   */
  get positivePosition() {
    const position = this._positivePosition;
    assert && assert(position, 'attempt to access positivePosition before it was initialized');
    return position;
  }

  /**
   * Initializes the position of the optional negative TermCreatorNode.
   * The value is dependent on the view and is unknowable until the sim has loaded.
   * See TermCreatorNode.frameStartedCallback for initialization.
   */
  set negativePosition(value) {
    assert && assert(!this._negativePosition, 'attempted to initialize negativePosition twice');
    this._negativePosition = value;
  }

  /**
   * Gets the position of the optional negative TermCreatorNode.
   */
  get negativePosition() {
    const position = this._negativePosition;
    assert && assert(position, 'attempt to access negativePosition before it was initialized');
    return position;
  }

  /**
   * Initializes the optional equivalent TermCreator for the opposite plate, required for the optional 'lock' feature.
   * This association necessarily occurs after instantiation because it's a 2-way association.
   */
  set equivalentTermCreator(value) {
    assert && assert(!this._equivalentTermCreator, 'attempted to initialize equivalentTermCreator twice');
    assert && assert(this.isLikeTermCreator(value), `value is not a like TermCreator: ${value}`);
    this._equivalentTermCreator = value;
  }

  /**
   * Gets the optional equivalent TermCreator for the opposite plate.
   */
  get equivalentTermCreator() {
    const equivalentTermCreator = this._equivalentTermCreator;
    assert && assert(equivalentTermCreator, 'attempt to access equivalentTermCreator before it was initialized');
    return equivalentTermCreator;
  }

  /**
   * Given a term, gets the position for an equivalent term on the opposite side of the scale.
   * When locked, equivalent terms track the y coordinate of their associated term, but their
   * x coordinate is offset by the distance between their associated toolbox positions.
   */
  getEquivalentTermPosition(term) {
    assert && assert(this.isManagedTerm(term), `term is not managed by this TermCreator: ${term}`);
    let xOffset;
    if (term.significantValue.getValue() >= 0) {
      xOffset = this.equivalentTermCreator.positivePosition.x - this.positivePosition.x;
    } else {
      xOffset = this.equivalentTermCreator.negativePosition.x - this.negativePosition.x;
    }
    return term.positionProperty.value.plusXY(xOffset, 0);
  }

  /**
   * Animates terms.
   * @param dt - time since the previous step, in seconds
   */
  step(dt) {
    // operate on a copy, since step may involve modifying the array
    const allTermsCopy = this.allTerms.getArrayCopy();
    for (let i = 0; i < allTermsCopy.length; i++) {
      const term = allTermsCopy[i];

      // Stepping a term may result in other term(s) being disposed, so only step terms
      // that have not been disposed. See https://github.com/phetsims/equality-explorer/issues/94.
      if (!term.isDisposed) {
        allTermsCopy[i].step(dt);
      }
    }
  }

  /**
   * Creates a term. Subclasses must override this method to expand the type definition of providedOptions, including
   * properties that are specific to the subclass. The subclass implementation will then call super.createTerm.
   *
   * NOTE: Using TypeScript generics to parameterize the type of providedOptions would have been preferred if this sim
   * had originally been written in TypeScript. But that was not possible with the current JavaScript implementation.
   * Generics introduced other problems that were not straightforward to resolve.
   */
  createTerm(providedOptions) {
    const options = combineOptions({
      sign: 1,
      event: null
    }, providedOptions);

    // create term
    const term = this.createTermProtected(options);

    // manage the term
    this.manageTerm(term, options.event);
    return term;
  }

  /**
   * Tells this term creator to manage a term.  Once managed, a term cannot be unmanaged - it's a life commitment!
   * @param term
   * @param event - non-null if term was created as the result of a user interaction
   */
  manageTerm(term, event = null) {
    assert && assert(!term.isDisposed, `term is disposed: ${term}`);
    assert && assert(!this.isManagedTerm(term), `term is already managed: ${term}`);
    this.allTerms.add(term);

    // set the term's drag bounds
    term.dragBounds = this.dragBounds;

    // set the term's toolboxPosition, so that it knows how to animate back to the toolbox
    if (term.significantValue.getValue() >= 0) {
      term.toolboxPosition = this.positivePosition;
    } else {
      assert && assert(this.negativePosition, 'negativePosition has not been initialized');
      term.toolboxPosition = this.negativePosition;
    }

    // Clean up when the term is disposed.
    // removeListener required when the term is disposed, see termWasDisposed.
    term.disposedEmitter.addListener(this.termDisposedListener);

    // Notify listeners that a term is being managed by this term creator.
    // This will result in creation of the corresponding view.
    this.termCreatedEmitter.emit(this, term, event);
  }

  /**
   * Called when Term.dispose is called.
   */
  unmanageTerm(term) {
    // ORDER IS VERY IMPORTANT HERE!
    if (this.isTermOnPlate(term)) {
      this.removeTermFromPlate(term);
    }
    if (this.allTerms.includes(term)) {
      this.allTerms.remove(term);
    }
    if (term.disposedEmitter.hasListener(this.termDisposedListener)) {
      term.disposedEmitter.removeListener(this.termDisposedListener);
    }
  }

  /**
   * Is the specified term managed by this term creator?
   */
  isManagedTerm(term) {
    return this.allTerms.includes(term);
  }

  /**
   * Puts a term on the plate. If the term wasn't already managed, it becomes managed.
   * @param term
   * @param [cell] - cell in the plate's 2D grid, defaults to this.likeTermsCell when combining like terms
   */
  putTermOnPlate(term, cell) {
    assert && assert(!this.termsOnPlate.includes(term), `term already on plate: ${term}`);
    if (cell === undefined && this.combineLikeTermsEnabled) {
      const likeTermsCell = this.likeTermsCell;
      assert && assert(likeTermsCell !== null);
      cell = likeTermsCell;
    }
    assert && assert(cell !== undefined, 'cell is undefined');

    // ORDER IS VERY IMPORTANT HERE!
    if (!this.isManagedTerm(term)) {
      this.manageTerm(term, null);
    }
    this.plate.addTerm(term, cell);
    this.termsOnPlate.push(term);
    term.onPlateProperty.value = true;
    assert && assert(!this.combineLikeTermsEnabled || this.termsOnPlate.length <= 1, `when combineLikeTermsEnabled, there should be at most 1 term on plate: ${this.termsOnPlate.length}`);
  }

  /**
   * Removes a term from the plate.
   * @param term
   * @returns the cell that the term was removed from
   */
  removeTermFromPlate(term) {
    assert && assert(this.allTerms.includes(term), `term not found: ${term}`);
    assert && assert(this.termsOnPlate.includes(term), `term not on plate: ${term}`);

    // ORDER IS VERY IMPORTANT HERE!
    const cell = this.plate.removeTerm(term);
    this.termsOnPlate.remove(term);
    if (!term.onPlateProperty.isDisposed) {
      term.onPlateProperty.value = false;
    }
    return cell;
  }

  /**
   * Is the specified term on the plate?
   */
  isTermOnPlate(term) {
    return this.termsOnPlate.includes(term);
  }

  /**
   * Gets the terms that are on the plate.
   */
  getTermsOnPlate() {
    return this.termsOnPlate.getArrayCopy(); // defensive copy
  }

  /**
   * Gets the positive terms on the plate.
   */
  getPositiveTermsOnPlate() {
    return _.filter(this.termsOnPlate, term => term.sign === 1);
  }

  /**
   * Gets the negative terms on the plate.
   */
  getNegativeTermsOnPlate() {
    return _.filter(this.termsOnPlate, term => term.sign === -1);
  }

  /**
   * Gets the term that occupies the 'like terms' cell on the plate.
   */
  getLikeTermOnPlate() {
    assert && assert(this.combineLikeTermsEnabled, 'getLikeTermOnPlate is only supported when combineLikeTermsEnabled');
    assert && assert(this.termsOnPlate.length <= 1, 'expected at most 1 term on plate');
    const likeTermsCell = this.likeTermsCell;
    assert && assert(likeTermsCell !== null);
    return this.plate.getTermInCell(likeTermsCell);
  }

  /**
   * Disposes of all terms.
   */
  disposeAllTerms() {
    // operate on a copy, since dispose causes the ObservableArrayDef to be modified
    this.disposeTerms(this.allTerms.getArrayCopy());
  }

  /**
   * Disposes of all terms that are on the plate.
   */
  disposeTermsOnPlate() {
    // operate on a copy, since dispose causes the ObservableArrayDef to be modified
    this.disposeTerms(this.termsOnPlate.getArrayCopy());
    this.hideAllTermHalos();
  }

  /**
   * Disposes of all terms that are NOT on the plate.
   */
  disposeTermsNotOnPlate() {
    this.disposeTerms(_.difference(this.allTerms, this.termsOnPlate));
    this.hideAllTermHalos();
  }

  /**
   * Disposes of some collection of terms.
   */
  disposeTerms(terms) {
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      if (!term.isDisposed) {
        term.dispose(); // results in call to unmanageTerm
      } else {
        // workaround for https://github.com/phetsims/equality-explorer/issues/88
        phet.log && phet.log(`Oops! term was already disposed, cleaning up: ${term}`, {
          color: 'red'
        });
        this.unmanageTerm(term);
      }
    }
  }

  /**
   * Hides halos for all terms. This is done as part of disposeTermsOnPlate and disposeTermsNotOnPlate,
   * so that some term is not left with its halo visible after the term that it overlapped disappears.
   * See https://github.com/phetsims/equality-explorer/issues/59.
   */
  hideAllTermHalos() {
    for (let i = 0; i < this.allTerms.length; i++) {
      this.allTerms.get(i).haloVisibleProperty.value = false;
    }
  }

  /**
   * Do this TermCreator and the specified TermCreator create like terms?
   */
  isLikeTermCreator(termCreator) {
    // Create 2 terms via createTermProtected, not createTerm, so that they are not managed.
    const thisTerm = this.createTermProtected();
    const thatTerm = termCreator.createTermProtected();

    // If the 2 terms are 'like' then the creators are 'like'.
    const isLike = thisTerm.isLikeTerm(thatTerm);

    // Dispose of the terms.
    thisTerm.dispose();
    thatTerm.dispose();
    return isLike;
  }

  /**
   * Applies an operation to terms on the plate.
   * @param operation
   * @returns true if the operation resulted in a term on the plate becoming zero, false otherwise
   */
  applyOperation(operation) {
    assert && assert(this.combineLikeTermsEnabled, 'applyOperation is only supported when combining like terms');
    assert && assert(this.termsOnPlate.length <= 1, `expected at most 1 term on plate: ${this.termsOnPlate.length}`);
    let summedToZero = false;
    let plateWasEmpty = false;
    const likeTermsInCell = this.likeTermsCell;
    assert && assert(likeTermsInCell !== null);

    // Get the term on the plate, or use zero term
    let term = this.plate.getTermInCell(likeTermsInCell);
    if (!term) {
      plateWasEmpty = true;
      term = this.createZeroTerm({
        diameter: EqualityExplorerConstants.BIG_TERM_DIAMETER
      });
    }

    // Apply the operation to the term. Returns null if the operation was not applicable to the term.
    const newTerm = term.applyOperation(operation);
    if (newTerm) {
      // dispose of the term
      term.dispose();
      if (newTerm.sign === 0) {
        summedToZero = !plateWasEmpty;
      } else {
        // manage the new term and put it on the plate
        this.putTermOnPlate(newTerm, likeTermsInCell);
      }
    }
    return summedToZero;
  }

  //-------------------------------------------------------------------------------------------------
  // Below here are @abstract methods, to be implemented by subclasses
  //-------------------------------------------------------------------------------------------------

  /**
   * Creates the icon used to represent this term in the TermsToolboxNode and equations.
   */
  /**
   * Instantiates a term.
   */
  /**
   * Creates a term whose significant value is zero. This is used when applying an operation to an empty plate.
   * The term is not managed by the TermCreator, so the implementation in subclasses should typically call
   * createTermProtected instead of createTerm.
   */
  /**
   * Instantiates the Node that corresponds to a term.
   */
  /**
   * Subclasses must implement this method to provide 'useful information', to appease
   * TS ESLint rule @typescript-eslint/no-base-to-string. See https://github.com/phetsims/chipper/issues/1338
   */
}
equalityExplorer.register('TermCreator', TermCreator);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJjcmVhdGVPYnNlcnZhYmxlQXJyYXkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiQm91bmRzMiIsIm9wdGlvbml6ZSIsImNvbWJpbmVPcHRpb25zIiwiRnJhY3Rpb24iLCJTY2VuZXJ5RXZlbnQiLCJlcXVhbGl0eUV4cGxvcmVyIiwiRXF1YWxpdHlFeHBsb3JlckNvbnN0YW50cyIsIlRlcm0iLCJQaGV0aW9PYmplY3QiLCJOdW1iZXJJTyIsIlRlcm1DcmVhdG9yIiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidmFyaWFibGUiLCJkcmFnQm91bmRzIiwiRVZFUllUSElORyIsImxpa2VUZXJtc0NlbGwiLCJsb2NrZWRQcm9wZXJ0eSIsInBoZXRpb1N0YXRlIiwiX3BsYXRlIiwiX3Bvc2l0aXZlUG9zaXRpb24iLCJfbmVnYXRpdmVQb3NpdGlvbiIsImNvbWJpbmVMaWtlVGVybXNFbmFibGVkIiwiYWxsVGVybXMiLCJ0ZXJtc09uUGxhdGUiLCJudW1iZXJPZlRlcm1zT25QbGF0ZVByb3BlcnR5IiwibGVuZ3RoUHJvcGVydHkiLCJsZW5ndGgiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9WYWx1ZVR5cGUiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwid2VpZ2h0T25QbGF0ZURlcGVuZGVuY2llcyIsInB1c2giLCJ2YWx1ZVByb3BlcnR5Iiwid2VpZ2h0T25QbGF0ZVByb3BlcnR5IiwiZGVyaXZlQW55Iiwid2VpZ2h0IiwiZnJvbUludGVnZXIiLCJpIiwicGx1cyIsImdldCIsInJlZHVjZWQiLCJ2YWx1ZVR5cGUiLCJ2YWx1ZUNvbXBhcmlzb25TdHJhdGVneSIsIkZyYWN0aW9uSU8iLCJ0ZXJtQ3JlYXRlZEVtaXR0ZXIiLCJwYXJhbWV0ZXJzIiwibWF4SW50ZWdlckV4Y2VlZGVkRW1pdHRlciIsIl9lcXVpdmFsZW50VGVybUNyZWF0b3IiLCJ2YWxpZFZhbHVlcyIsInRlcm1EaXNwb3NlZExpc3RlbmVyIiwidGVybSIsInVubWFuYWdlVGVybSIsImxhenlMaW5rIiwibG9ja2VkIiwiYXNzZXJ0IiwiZXF1aXZhbGVudFRlcm1DcmVhdG9yIiwiZGlzcG9zZVRlcm1zTm90T25QbGF0ZSIsImRpc3Bvc2UiLCJwbGF0ZSIsInZhbHVlIiwicG9zaXRpdmVQb3NpdGlvbiIsInBvc2l0aW9uIiwibmVnYXRpdmVQb3NpdGlvbiIsImlzTGlrZVRlcm1DcmVhdG9yIiwiZ2V0RXF1aXZhbGVudFRlcm1Qb3NpdGlvbiIsImlzTWFuYWdlZFRlcm0iLCJ4T2Zmc2V0Iiwic2lnbmlmaWNhbnRWYWx1ZSIsImdldFZhbHVlIiwieCIsInBvc2l0aW9uUHJvcGVydHkiLCJwbHVzWFkiLCJzdGVwIiwiZHQiLCJhbGxUZXJtc0NvcHkiLCJnZXRBcnJheUNvcHkiLCJpc0Rpc3Bvc2VkIiwiY3JlYXRlVGVybSIsInNpZ24iLCJldmVudCIsImNyZWF0ZVRlcm1Qcm90ZWN0ZWQiLCJtYW5hZ2VUZXJtIiwiYWRkIiwidG9vbGJveFBvc2l0aW9uIiwiZGlzcG9zZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJlbWl0IiwiaXNUZXJtT25QbGF0ZSIsInJlbW92ZVRlcm1Gcm9tUGxhdGUiLCJpbmNsdWRlcyIsInJlbW92ZSIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJwdXRUZXJtT25QbGF0ZSIsImNlbGwiLCJ1bmRlZmluZWQiLCJhZGRUZXJtIiwib25QbGF0ZVByb3BlcnR5IiwicmVtb3ZlVGVybSIsImdldFRlcm1zT25QbGF0ZSIsImdldFBvc2l0aXZlVGVybXNPblBsYXRlIiwiXyIsImZpbHRlciIsImdldE5lZ2F0aXZlVGVybXNPblBsYXRlIiwiZ2V0TGlrZVRlcm1PblBsYXRlIiwiZ2V0VGVybUluQ2VsbCIsImRpc3Bvc2VBbGxUZXJtcyIsImRpc3Bvc2VUZXJtcyIsImRpc3Bvc2VUZXJtc09uUGxhdGUiLCJoaWRlQWxsVGVybUhhbG9zIiwiZGlmZmVyZW5jZSIsInRlcm1zIiwicGhldCIsImxvZyIsImNvbG9yIiwiaGFsb1Zpc2libGVQcm9wZXJ0eSIsInRlcm1DcmVhdG9yIiwidGhpc1Rlcm0iLCJ0aGF0VGVybSIsImlzTGlrZSIsImlzTGlrZVRlcm0iLCJhcHBseU9wZXJhdGlvbiIsIm9wZXJhdGlvbiIsInN1bW1lZFRvWmVybyIsInBsYXRlV2FzRW1wdHkiLCJsaWtlVGVybXNJbkNlbGwiLCJjcmVhdGVaZXJvVGVybSIsImRpYW1ldGVyIiwiQklHX1RFUk1fRElBTUVURVIiLCJuZXdUZXJtIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJUZXJtQ3JlYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUZXJtQ3JlYXRvciBpcyB0aGUgYWJzdHJhY3QgYmFzZSB0eXBlIGZvciBjcmVhdGluZyBhbmQgbWFuYWdpbmcgdGVybXMuXHJcbiAqXHJcbiAqIFRlcm1zIGNhbiBiZSBjcmVhdGVkIGluIDMgd2F5czpcclxuICogLSBieSBkcmFnZ2luZyB0aGVtIG91dCBvZiBhIHRvb2xib3ggYmVsb3cgYSBwbGF0ZVxyXG4gKiAtIGJ5IHJlc3RvcmluZyBhIHNuYXBzaG90XHJcbiAqIC0gYnkgdXNpbmcgdGhlICd1bml2ZXJzYWwgb3BlcmF0aW9uJyBjb250cm9sLlxyXG4gKlxyXG4gKiBUZXJtQ3JlYXRvcnMgb3BlcmF0ZSBpbiBvbmUgb2YgdHdvIG1vZGVzLCBiYXNlZCBvbiB0aGUgdmFsdWUgb2Yge2Jvb2xlYW59IHRoaXMuY29tYmluZUxpa2VUZXJtc0VuYWJsZWQ6XHJcbiAqIHRydWU6IGVhY2ggdGVybSAqdHlwZSogb2NjdXBpZXMgb25lIGNlbGwgb24gdGhlIHNjYWxlLCBhbmQgYWxsIGxpa2UgdGVybXMgYXJlIGNvbWJpbmVkXHJcbiAqIGZhbHNlOiBlYWNoIHRlcm0gKmluc3RhbmNlKiBvY2N1cGllcyBvbmUgY2VsbCBvbiB0aGUgc2NhbGUsIGFuZCB0ZXJtcyBhcmUgY29tYmluZWQgb25seSBpZiB0aGV5IHN1bSB0byB6ZXJvXHJcbiAqXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvYmxvYi9tYXN0ZXIvZG9jL2ltcGxlbWVudGF0aW9uLW5vdGVzLm1kXHJcbiAqIGZvciBhIGRldGFpbGVkIGRlc2NyaXB0aW9uIG9mIGhvdyB0aGUgUGhFVCAnY3JlYXRvciBwYXR0ZXJuJyBpcyBhcHBsaWVkIGluIHRoaXMgc2ltdWxhdGlvbi5cclxuICpcclxuICogTm90ZSB0aGF0IFRlcm1DcmVhdG9yIGlzIG5vdCBpbnZvbHZlZCB3aXRoIFRlcm1zIHRoYXQgYXJlIGNyZWF0ZWQgZm9yIHNuYXBzaG90cy4gVGhvc2UgdGVybXMgYXJlIGNyZWF0ZWRcclxuICogYW5kIG1hbmFnZWQgYnkgU25hcHNob3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzE5OVxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgY3JlYXRlT2JzZXJ2YWJsZUFycmF5LCB7IE9ic2VydmFibGVBcnJheSB9IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvY3JlYXRlT2JzZXJ2YWJsZUFycmF5LmpzJztcclxuaW1wb3J0IERlcml2ZWRQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Rlcml2ZWRQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBFbWl0dGVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRW1pdHRlci5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgRnJhY3Rpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy9tb2RlbC9GcmFjdGlvbi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFByZXNzTGlzdGVuZXJFdmVudCwgU2NlbmVyeUV2ZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzIGZyb20gJy4uL0VxdWFsaXR5RXhwbG9yZXJDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUGxhdGUgZnJvbSAnLi9QbGF0ZS5qcyc7XHJcbmltcG9ydCBUZXJtLCB7IFRlcm1PcHRpb25zIH0gZnJvbSAnLi9UZXJtLmpzJztcclxuaW1wb3J0IFVuaXZlcnNhbE9wZXJhdGlvbiBmcm9tICcuL1VuaXZlcnNhbE9wZXJhdGlvbi5qcyc7XHJcbmltcG9ydCBWYXJpYWJsZSBmcm9tICcuL1ZhcmlhYmxlLmpzJztcclxuaW1wb3J0IHR5cGUgVGVybU5vZGUgZnJvbSAnLi4vdmlldy9UZXJtTm9kZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBQaGV0aW9PYmplY3QsIHsgUGhldGlvT2JqZWN0T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9QaGV0aW9PYmplY3QuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIG51bGwgaWYgdGhlIHRlcm0gaXMgYSBjb25zdGFudFxyXG4gIHZhcmlhYmxlPzogVmFyaWFibGUgfCBudWxsO1xyXG5cclxuICAvLyBkcmFnZ2luZyBpcyBjb25zdHJhaW5lZCB0byB0aGVzZSBib3VuZHNcclxuICBkcmFnQm91bmRzPzogQm91bmRzMjtcclxuXHJcbiAgLy8gTGlrZSB0ZXJtcyB3aWxsIG9jY3VweSB0aGlzIGNlbGwgaW4gdGhlIHBsYXRlJ3MgMkQgZ3JpZC5cclxuICAvLyBudWxsIG1lYW5zICdubyBjZWxsJywgYW5kIGxpa2UgdGVybXMgd2lsbCBub3QgYmUgY29tYmluZWQuXHJcbiAgbGlrZVRlcm1zQ2VsbD86IG51bWJlciB8IG51bGw7XHJcblxyXG4gIC8vIGxvY2tzIGVxdWl2YWxlbnQgdGVybXMsIG51bGwgaWYgdGhpcyBmZWF0dXJlIGlzIG5vdCBzdXBwb3J0ZWRcclxuICBsb2NrZWRQcm9wZXJ0eT86IFByb3BlcnR5PGJvb2xlYW4+IHwgbnVsbDtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFRlcm1DcmVhdG9yT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgUGlja1JlcXVpcmVkPFBoZXRpb09iamVjdE9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbi8vIHNpZ24gdGhhdCB3aWxsIGJlIGFwcGxpZWQgdG8gdGVybXMgdGhhdCBhcmUgY3JlYXRlZFxyXG5leHBvcnQgdHlwZSBUZXJtQ3JlYXRvclNpZ24gPSAxIHwgLTE7XHJcblxyXG4vLyBvcHRpb25zIHRvIGNyZWF0ZVRlcm0sIGNyZWF0ZVRlcm1Qcm90ZWN0ZWQsIGFuZCBjcmVhdGVaZXJvVGVybVxyXG5leHBvcnQgdHlwZSBDcmVhdGVUZXJtT3B0aW9ucyA9IHtcclxuICBzaWduPzogVGVybUNyZWF0b3JTaWduO1xyXG4gIGV2ZW50PzogUHJlc3NMaXN0ZW5lckV2ZW50IHwgbnVsbDsgLy8gbm9uLW51bGwgaWYgdGhlIHRlcm0gaXMgY3JlYXRlZCBhcyB0aGUgcmVzdWx0IG9mIGEgdXNlciBpbnRlcmFjdGlvblxyXG59ICYgVGVybU9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBUZXJtQ3JlYXRvciBleHRlbmRzIFBoZXRpb09iamVjdCB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSB2YXJpYWJsZTogVmFyaWFibGUgfCBudWxsO1xyXG5cclxuICAvLyBUaGUgcGxhdGUgdGhhdCB0aGlzIHRlcm0gY3JlYXRvciBpcyBhc3NvY2lhdGVkIHdpdGguXHJcbiAgLy8gbnVsbCBkdXJpbmcgZGVmZXJyZWQgaW5pdGlhbGl6YXRpb24sIHNlZSBzZXQgcGxhdGUoKSBmb3Igbm90ZXMuXHJcbiAgcHJpdmF0ZSBfcGxhdGU6IFBsYXRlIHwgbnVsbDtcclxuXHJcbiAgLy8gUG9zaXRpb25zIG9mIHRoZSBhc3NvY2lhdGVkIHBvc2l0aXZlIGFuZCBuZWdhdGl2ZSBUZXJtQ3JlYXRvck5vZGVzLlxyXG4gIC8vIG51bGwgZHVyaW5nIGRlZmVycmVkIGluaXRpYWxpemF0aW9uLCBzZWUgc2V0IHBvc2l0aXZlUG9zaXRpb24oKSBhbmQgc2V0IG5lZ2F0aXZlUG9zaXRpb24oKSBmb3Igbm90ZXMuXHJcbiAgcHJpdmF0ZSBfcG9zaXRpdmVQb3NpdGlvbjogVmVjdG9yMiB8IG51bGw7XHJcbiAgcHJpdmF0ZSBfbmVnYXRpdmVQb3NpdGlvbjogVmVjdG9yMiB8IG51bGw7XHJcblxyXG4gIC8vIGxpa2UgdGVybXMgd2lsbCBiZSBjb21iaW5lZCBpbiB0aGlzIGNlbGwgaW4gdGhlIHBsYXRlJ3MgMkQgZ3JpZFxyXG4gIHB1YmxpYyByZWFkb25seSBsaWtlVGVybXNDZWxsOiBudW1iZXIgfCBudWxsO1xyXG5cclxuICAvLyBDb252ZW5pZW5jZSBwcm9wZXJ0eSwgc28gd2UgZG9uJ3QgbmVlZCB0byB0ZXN0IHRoZSB0eXBlIG9mIGxpa2VUZXJtc0NlbGwuXHJcbiAgcHVibGljIHJlYWRvbmx5IGNvbWJpbmVMaWtlVGVybXNFbmFibGVkOiBib29sZWFuO1xyXG5cclxuICAvLyBkcmFnIGJvdW5kcyBmb3IgdGVybXMgY3JlYXRlZFxyXG4gIHB1YmxpYyBkcmFnQm91bmRzOiBCb3VuZHMyO1xyXG5cclxuICAvLyBBbGwgJ21hbmFnZWQnIHRlcm1zIHRoYXQgY3VycmVudGx5IGV4aXN0LiBNYW5hZ2VkIHRlcm1zIGluY2x1ZGUgdGhvc2Ugb24gdGhlIGJhbGFuY2Ugc2NhbGUsIHRob3NlIGJlaW5nIGRyYWdnZWRcclxuICAvLyBieSB0aGUgdXNlciwgYW5kIHRob3NlIHRoYXQgYXJlIGFuaW1hdGluZy4gSXQgZG9lcyBub3QgaW5jbHVkZSB0ZXJtcyB0aGF0IGFyZSBwYXJ0IG9mIGEgc25hcHNob3QuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBhbGxUZXJtczogT2JzZXJ2YWJsZUFycmF5PFRlcm0+O1xyXG5cclxuICAvLyB0ZXJtcyB0aGF0IGFyZSBvbiB0aGUgcGxhdGUsIGEgc3Vic2V0IG9mIHRoaXMuYWxsVGVybXNcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgdGVybXNPblBsYXRlOiBPYnNlcnZhYmxlQXJyYXk8VGVybT47XHJcblxyXG4gIC8vIG51bWJlciBvZiB0ZXJtIG9uIHRoZSBhc3NvY2lhdGVkIHBsYXRlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIG1ha2UgdGhpcy50ZXJtc09uUGxhdGUgcHVibGljXHJcbiAgcHVibGljIHJlYWRvbmx5IG51bWJlck9mVGVybXNPblBsYXRlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIFdlaWdodCBvZiB0aGUgdGVybXMgdGhhdCBhcmUgb24gdGhlIHBsYXRlXHJcbiAgcHVibGljIHJlYWRvbmx5IHdlaWdodE9uUGxhdGVQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8RnJhY3Rpb24+O1xyXG5cclxuICAvLyBFbWl0IGlzIGNhbGxlZCB3aGVuIGEgdGVybSBpcyBjcmVhdGVkLlxyXG4gIC8vIFRoZSBldmVudCBhcmcgaXMgbm9uLW51bGwgaWYgdGhlIHRlcm0gd2FzIGNyZWF0ZWQgYXMgdGhlIHJlc3VsdCBvZiBhIHVzZXIgaW50ZXJhY3Rpb24uXHJcbiAgcHVibGljIHJlYWRvbmx5IHRlcm1DcmVhdGVkRW1pdHRlcjogRW1pdHRlcjxbIFRlcm1DcmVhdG9yLCBUZXJtLCBQcmVzc0xpc3RlbmVyRXZlbnQgfCBudWxsIF0+O1xyXG5cclxuICAvLyBFbWl0IGlzIGNhbGxlZCB3aGVuIGFkZGluZyBhIHRlcm0gdG8gdGhlIHBsYXRlIHdvdWxkIGNhdXNlIEVxdWFsaXR5RXhwbG9yZXJRdWVyeVBhcmFtZXRlcnMubWF4SW50ZWdlclxyXG4gIC8vIHRvIGJlIGV4Y2VlZGVkLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2VxdWFsaXR5LWV4cGxvcmVyL2lzc3Vlcy80OFxyXG4gIHB1YmxpYyByZWFkb25seSBtYXhJbnRlZ2VyRXhjZWVkZWRFbWl0dGVyOiBFbWl0dGVyO1xyXG5cclxuICAvLyBPcHRpb25hbCBlcXVpdmFsZW50IHRlcm0gY3JlYXRvciBvbiB0aGUgb3Bwb3NpdGUgc2lkZSBvZiB0aGUgc2NhbGUuIFRoaXMgaXMgbmVlZGVkXHJcbiAgLy8gZm9yIHRoZSBsb2NrIGZlYXR1cmUsIHdoaWNoIGludm9sdmVzIGNyZWF0aW5nIGFuIGVxdWl2YWxlbnQgdGVybSBvbiB0aGUgb3Bwb3NpdGUgc2lkZSBvZiB0aGUgc2NhbGUuXHJcbiAgLy8gRXhhbXBsZTogV2hlbiBsb2NrZWQsIGlmIHlvdSBkcmFnIC14IG91dCBvZiB0aGUgbGVmdCB0b29sYm94LCAteCBtdXN0IGFsc28gZHJhZyBvdXQgb2YgdGhlIHJpZ2h0IHRvb2xib3guXHJcbiAgLy8gQmVjYXVzZSB0aGlzIGlzIGEgMi13YXkgYXNzb2NpYXRpb24sIGluaXRpYWxpemF0aW9uIGlzIGRlZmVycmVkIHVudGlsIGFmdGVyIGluc3RhbnRpYXRpb24uXHJcbiAgLy8gU2VlIHNldCBlcXVpdmFsZW50VGVybUNyZWF0b3IoKSBmb3Igbm90ZXMuXHJcbiAgcHJpdmF0ZSBfZXF1aXZhbGVudFRlcm1DcmVhdG9yOiBUZXJtQ3JlYXRvciB8IG51bGw7XHJcblxyXG4gIC8vIGluZGljYXRlcyB3aGV0aGVyIHRoaXMgdGVybSBjcmVhdG9yIGlzIGxvY2tlZCB0byBfZXF1aXZhbGVudFRlcm1DcmVhdG9yXHJcbiAgcHVibGljIHJlYWRvbmx5IGxvY2tlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gY2FsbGVkIHdoZW4gYSB0ZXJtIGlzIGRpc3Bvc2VkXHJcbiAgcHJpdmF0ZSByZWFkb25seSB0ZXJtRGlzcG9zZWRMaXN0ZW5lcjogKCB0ZXJtOiBUZXJtICkgPT4gdm9pZDtcclxuXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM6IFRlcm1DcmVhdG9yT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFRlcm1DcmVhdG9yT3B0aW9ucywgU2VsZk9wdGlvbnMsIFBoZXRpb09iamVjdE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIHZhcmlhYmxlOiBudWxsLFxyXG4gICAgICBkcmFnQm91bmRzOiBCb3VuZHMyLkVWRVJZVEhJTkcsXHJcbiAgICAgIGxpa2VUZXJtc0NlbGw6IG51bGwsXHJcbiAgICAgIGxvY2tlZFByb3BlcnR5OiBudWxsLFxyXG5cclxuICAgICAgLy8gUGhldGlvT2JqZWN0T3B0aW9uc1xyXG4gICAgICBwaGV0aW9TdGF0ZTogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy52YXJpYWJsZSA9IG9wdGlvbnMudmFyaWFibGU7XHJcbiAgICB0aGlzLl9wbGF0ZSA9IG51bGw7XHJcbiAgICB0aGlzLl9wb3NpdGl2ZVBvc2l0aW9uID0gbnVsbDtcclxuICAgIHRoaXMuX25lZ2F0aXZlUG9zaXRpb24gPSBudWxsO1xyXG4gICAgdGhpcy5saWtlVGVybXNDZWxsID0gb3B0aW9ucy5saWtlVGVybXNDZWxsO1xyXG4gICAgdGhpcy5jb21iaW5lTGlrZVRlcm1zRW5hYmxlZCA9ICggb3B0aW9ucy5saWtlVGVybXNDZWxsICE9PSBudWxsICk7XHJcbiAgICB0aGlzLmRyYWdCb3VuZHMgPSBvcHRpb25zLmRyYWdCb3VuZHM7XHJcbiAgICB0aGlzLmFsbFRlcm1zID0gY3JlYXRlT2JzZXJ2YWJsZUFycmF5KCk7XHJcbiAgICB0aGlzLnRlcm1zT25QbGF0ZSA9IGNyZWF0ZU9ic2VydmFibGVBcnJheSgpO1xyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZUZXJtc09uUGxhdGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy50ZXJtc09uUGxhdGUubGVuZ3RoUHJvcGVydHkgXSwgbGVuZ3RoID0+IGxlbmd0aCwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyT2ZUZXJtc09uUGxhdGVQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IE51bWJlcklPLFxyXG4gICAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdOdW1iZXIgb2YgdGVybXMgb24gdGhlIHBsYXRlIHRoYXQgd2VyZSBjcmVhdGVkIGJ5IHRoaXMgdGVybSBjcmVhdG9yJ1xyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgd2VpZ2h0T25QbGF0ZURlcGVuZGVuY2llcyA9IFsgdGhpcy5udW1iZXJPZlRlcm1zT25QbGF0ZVByb3BlcnR5IF07XHJcbiAgICBpZiAoIG9wdGlvbnMudmFyaWFibGUgKSB7XHJcbiAgICAgIHdlaWdodE9uUGxhdGVEZXBlbmRlbmNpZXMucHVzaCggb3B0aW9ucy52YXJpYWJsZS52YWx1ZVByb3BlcnR5ICk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy53ZWlnaHRPblBsYXRlUHJvcGVydHkgPSBEZXJpdmVkUHJvcGVydHkuZGVyaXZlQW55KCB3ZWlnaHRPblBsYXRlRGVwZW5kZW5jaWVzLFxyXG4gICAgICAoKSA9PiB7XHJcbiAgICAgICAgbGV0IHdlaWdodCA9IEZyYWN0aW9uLmZyb21JbnRlZ2VyKCAwICk7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy50ZXJtc09uUGxhdGUubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICB3ZWlnaHQgPSB3ZWlnaHQucGx1cyggdGhpcy50ZXJtc09uUGxhdGUuZ2V0KCBpICkud2VpZ2h0ICkucmVkdWNlZCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd2VpZ2h0O1xyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdmFsdWVUeXBlOiBGcmFjdGlvbixcclxuICAgICAgICB2YWx1ZUNvbXBhcmlzb25TdHJhdGVneTogJ2VxdWFsc0Z1bmN0aW9uJywgLy8gc2V0IHZhbHVlIG9ubHkgaWYgdHJ1bHkgZGlmZmVyZW50LCBwcmV2ZW50cyBjb3N0bHkgdW5uZWNlc3Nhcnkgbm90aWZpY2F0aW9uc1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2VpZ2h0T25QbGF0ZVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogRnJhY3Rpb24uRnJhY3Rpb25JTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnV2VpZ2h0IG9mIHRoZSB0ZXJtcyBvbiB0aGUgcGxhdGUgdGhhdCB3ZXJlIGNyZWF0ZWQgYnkgdGhpcyB0ZXJtIGNyZWF0b3InXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRlcm1DcmVhdGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHBhcmFtZXRlcnM6IFtcclxuICAgICAgICB7IHZhbHVlVHlwZTogVGVybUNyZWF0b3IgfSxcclxuICAgICAgICB7IHZhbHVlVHlwZTogVGVybSB9LFxyXG4gICAgICAgIHsgdmFsdWVUeXBlOiBbIFNjZW5lcnlFdmVudCwgbnVsbCBdIH1cclxuICAgICAgXVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubWF4SW50ZWdlckV4Y2VlZGVkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XHJcblxyXG4gICAgdGhpcy5fZXF1aXZhbGVudFRlcm1DcmVhdG9yID0gbnVsbDtcclxuXHJcbiAgICAvLyBJZiBvcHRpb25zLmxvY2tlZFByb3BlcnR5IHdhcyBub3QgcHJvdmlkZWQsIHRoZW4gY3JlYXRlIGEgUHJvcGVydHkgdGhhdCBwZXJtYW5lbnRseSB0dXJucyB0aGlzIGZlYXR1cmUgb2ZmLlxyXG4gICAgdGhpcy5sb2NrZWRQcm9wZXJ0eSA9IG9wdGlvbnMubG9ja2VkUHJvcGVydHkgfHwgbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdmFsaWRWYWx1ZXM6IFsgZmFsc2UgXVxyXG4gICAgICAvLyBEbyBub3QgaW5zdHJ1bWVudCwgdGhpcyBmZWF0dXJlIGlzIG9mZi5cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRlcm1EaXNwb3NlZExpc3RlbmVyID0gKCB0ZXJtOiBUZXJtICkgPT4gdGhpcy51bm1hbmFnZVRlcm0oIHRlcm0gKTtcclxuXHJcbiAgICAvLyBXaGVuIGxvY2tlZCBjaGFuZ2VzLi4uXHJcbiAgICB0aGlzLmxvY2tlZFByb3BlcnR5LmxhenlMaW5rKCBsb2NrZWQgPT4ge1xyXG5cclxuICAgICAgLy8gSWYgbG9jayBmZWF0dXJlIGlzIHR1cm5lZCBvbiwgdmVyaWZ5IHRoYXQgYW4gZXF1aXZhbGVudFRlcm1DcmVhdG9yIGhhcyBiZWVuIHByb3ZpZGVkLlxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhbG9ja2VkIHx8IHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLCAnbG9jayBmZWF0dXJlIHJlcXVpcmVzIGVxdWl2YWxlbnRUZXJtQ3JlYXRvcicgKTtcclxuXHJcbiAgICAgIC8vIENoYW5naW5nIGxvY2sgc3RhdGUgY2F1c2VzIGFsbCB0ZXJtcyB0aGF0IGFyZSBub3Qgb24gdGhlIHBsYXRlIHRvIGJlIGRpc3Bvc2VkLlxyXG4gICAgICB0aGlzLmRpc3Bvc2VUZXJtc05vdE9uUGxhdGUoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBJbml0aWFsaXplcyB0aGUgcGxhdGUgdGhhdCB0aGlzIFRlcm1DcmVhdG9yIGlzIGFzc29jaWF0ZWQgd2l0aC4gVGhpcyBhc3NvY2lhdGlvbiBuZWNlc3NhcmlseSBvY2N1cnNcclxuICAgKiBhZnRlciBpbnN0YW50aWF0aW9uLCBzaW5jZSBUZXJtQ3JlYXRvcnMgYXJlIGluc3RhbnRpYXRlZCBiZWZvcmUgUGxhdGVzLCBhbmQgdGhlIGFzc29jaWF0aW9uIGlzIDItd2F5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcGxhdGUoIHZhbHVlOiBQbGF0ZSApIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLl9wbGF0ZSwgJ2F0dGVtcHRlZCB0byBpbml0aWFsaXplIHBsYXRlIHR3aWNlJyApO1xyXG4gICAgdGhpcy5fcGxhdGUgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHBsYXRlIHRoYXQgdGhpcyBUZXJtQ3JlYXRvciBpcyBhc3NvY2lhdGVkIHdpdGguXHJcbiAgICovXHJcbiAgcHVibGljIGdldCBwbGF0ZSgpOiBQbGF0ZSB7XHJcbiAgICBjb25zdCBwbGF0ZSA9IHRoaXMuX3BsYXRlITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHBsYXRlLCAnYXR0ZW1wdCB0byBhY2Nlc3MgcGxhdGUgYmVmb3JlIGl0IHdhcyBpbml0aWFsaXplZCcgKTtcclxuICAgIHJldHVybiBwbGF0ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcG9zaXRpdmUgVGVybUNyZWF0b3JOb2RlLlxyXG4gICAqIFRoZSB2YWx1ZSBpcyBkZXBlbmRlbnQgb24gdGhlIHZpZXcgYW5kIGlzIHVua25vd2FibGUgdW50aWwgdGhlIHNpbSBoYXMgbG9hZGVkLlxyXG4gICAqIFNlZSBUZXJtQ3JlYXRvck5vZGUuZnJhbWVTdGFydGVkQ2FsbGJhY2sgZm9yIGluaXRpYWxpemF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgcG9zaXRpdmVQb3NpdGlvbiggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5fcG9zaXRpdmVQb3NpdGlvbiwgJ2F0dGVtcHRlZCB0byBpbml0aWFsaXplIHBvc2l0aXZlUG9zaXRpb24gdHdpY2UnICk7XHJcbiAgICB0aGlzLl9wb3NpdGl2ZVBvc2l0aW9uID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcG9zaXRpdmUgVGVybUNyZWF0b3JOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgcG9zaXRpdmVQb3NpdGlvbigpOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5fcG9zaXRpdmVQb3NpdGlvbiE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbiwgJ2F0dGVtcHQgdG8gYWNjZXNzIHBvc2l0aXZlUG9zaXRpb24gYmVmb3JlIGl0IHdhcyBpbml0aWFsaXplZCcgKTtcclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3B0aW9uYWwgbmVnYXRpdmUgVGVybUNyZWF0b3JOb2RlLlxyXG4gICAqIFRoZSB2YWx1ZSBpcyBkZXBlbmRlbnQgb24gdGhlIHZpZXcgYW5kIGlzIHVua25vd2FibGUgdW50aWwgdGhlIHNpbSBoYXMgbG9hZGVkLlxyXG4gICAqIFNlZSBUZXJtQ3JlYXRvck5vZGUuZnJhbWVTdGFydGVkQ2FsbGJhY2sgZm9yIGluaXRpYWxpemF0aW9uLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzZXQgbmVnYXRpdmVQb3NpdGlvbiggdmFsdWU6IFZlY3RvcjIgKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5fbmVnYXRpdmVQb3NpdGlvbiwgJ2F0dGVtcHRlZCB0byBpbml0aWFsaXplIG5lZ2F0aXZlUG9zaXRpb24gdHdpY2UnICk7XHJcbiAgICB0aGlzLl9uZWdhdGl2ZVBvc2l0aW9uID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgb3B0aW9uYWwgbmVnYXRpdmUgVGVybUNyZWF0b3JOb2RlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgbmVnYXRpdmVQb3NpdGlvbigpOiBWZWN0b3IyIHtcclxuICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5fbmVnYXRpdmVQb3NpdGlvbiE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBwb3NpdGlvbiwgJ2F0dGVtcHQgdG8gYWNjZXNzIG5lZ2F0aXZlUG9zaXRpb24gYmVmb3JlIGl0IHdhcyBpbml0aWFsaXplZCcgKTtcclxuICAgIHJldHVybiBwb3NpdGlvbjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBvcHRpb25hbCBlcXVpdmFsZW50IFRlcm1DcmVhdG9yIGZvciB0aGUgb3Bwb3NpdGUgcGxhdGUsIHJlcXVpcmVkIGZvciB0aGUgb3B0aW9uYWwgJ2xvY2snIGZlYXR1cmUuXHJcbiAgICogVGhpcyBhc3NvY2lhdGlvbiBuZWNlc3NhcmlseSBvY2N1cnMgYWZ0ZXIgaW5zdGFudGlhdGlvbiBiZWNhdXNlIGl0J3MgYSAyLXdheSBhc3NvY2lhdGlvbi5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0IGVxdWl2YWxlbnRUZXJtQ3JlYXRvciggdmFsdWU6IFRlcm1DcmVhdG9yICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuX2VxdWl2YWxlbnRUZXJtQ3JlYXRvciwgJ2F0dGVtcHRlZCB0byBpbml0aWFsaXplIGVxdWl2YWxlbnRUZXJtQ3JlYXRvciB0d2ljZScgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuaXNMaWtlVGVybUNyZWF0b3IoIHZhbHVlICksIGB2YWx1ZSBpcyBub3QgYSBsaWtlIFRlcm1DcmVhdG9yOiAke3ZhbHVlfWAgKTtcclxuICAgIHRoaXMuX2VxdWl2YWxlbnRUZXJtQ3JlYXRvciA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgb3B0aW9uYWwgZXF1aXZhbGVudCBUZXJtQ3JlYXRvciBmb3IgdGhlIG9wcG9zaXRlIHBsYXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXQgZXF1aXZhbGVudFRlcm1DcmVhdG9yKCk6IFRlcm1DcmVhdG9yIHtcclxuICAgIGNvbnN0IGVxdWl2YWxlbnRUZXJtQ3JlYXRvciA9IHRoaXMuX2VxdWl2YWxlbnRUZXJtQ3JlYXRvciE7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBlcXVpdmFsZW50VGVybUNyZWF0b3IsICdhdHRlbXB0IHRvIGFjY2VzcyBlcXVpdmFsZW50VGVybUNyZWF0b3IgYmVmb3JlIGl0IHdhcyBpbml0aWFsaXplZCcgKTtcclxuICAgIHJldHVybiBlcXVpdmFsZW50VGVybUNyZWF0b3I7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHaXZlbiBhIHRlcm0sIGdldHMgdGhlIHBvc2l0aW9uIGZvciBhbiBlcXVpdmFsZW50IHRlcm0gb24gdGhlIG9wcG9zaXRlIHNpZGUgb2YgdGhlIHNjYWxlLlxyXG4gICAqIFdoZW4gbG9ja2VkLCBlcXVpdmFsZW50IHRlcm1zIHRyYWNrIHRoZSB5IGNvb3JkaW5hdGUgb2YgdGhlaXIgYXNzb2NpYXRlZCB0ZXJtLCBidXQgdGhlaXJcclxuICAgKiB4IGNvb3JkaW5hdGUgaXMgb2Zmc2V0IGJ5IHRoZSBkaXN0YW5jZSBiZXR3ZWVuIHRoZWlyIGFzc29jaWF0ZWQgdG9vbGJveCBwb3NpdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldEVxdWl2YWxlbnRUZXJtUG9zaXRpb24oIHRlcm06IFRlcm0gKTogVmVjdG9yMiB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmlzTWFuYWdlZFRlcm0oIHRlcm0gKSwgYHRlcm0gaXMgbm90IG1hbmFnZWQgYnkgdGhpcyBUZXJtQ3JlYXRvcjogJHt0ZXJtfWAgKTtcclxuXHJcbiAgICBsZXQgeE9mZnNldDtcclxuICAgIGlmICggdGVybS5zaWduaWZpY2FudFZhbHVlLmdldFZhbHVlKCkgPj0gMCApIHtcclxuICAgICAgeE9mZnNldCA9IHRoaXMuZXF1aXZhbGVudFRlcm1DcmVhdG9yLnBvc2l0aXZlUG9zaXRpb24ueCAtIHRoaXMucG9zaXRpdmVQb3NpdGlvbi54O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHhPZmZzZXQgPSB0aGlzLmVxdWl2YWxlbnRUZXJtQ3JlYXRvci5uZWdhdGl2ZVBvc2l0aW9uLnggLSB0aGlzLm5lZ2F0aXZlUG9zaXRpb24ueDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGVybS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLnBsdXNYWSggeE9mZnNldCwgMCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQW5pbWF0ZXMgdGVybXMuXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzaW5jZSB0aGUgcHJldmlvdXMgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIC8vIG9wZXJhdGUgb24gYSBjb3B5LCBzaW5jZSBzdGVwIG1heSBpbnZvbHZlIG1vZGlmeWluZyB0aGUgYXJyYXlcclxuICAgIGNvbnN0IGFsbFRlcm1zQ29weSA9IHRoaXMuYWxsVGVybXMuZ2V0QXJyYXlDb3B5KCk7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBhbGxUZXJtc0NvcHkubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHRlcm0gPSBhbGxUZXJtc0NvcHlbIGkgXTtcclxuXHJcbiAgICAgIC8vIFN0ZXBwaW5nIGEgdGVybSBtYXkgcmVzdWx0IGluIG90aGVyIHRlcm0ocykgYmVpbmcgZGlzcG9zZWQsIHNvIG9ubHkgc3RlcCB0ZXJtc1xyXG4gICAgICAvLyB0aGF0IGhhdmUgbm90IGJlZW4gZGlzcG9zZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzk0LlxyXG4gICAgICBpZiAoICF0ZXJtLmlzRGlzcG9zZWQgKSB7XHJcbiAgICAgICAgYWxsVGVybXNDb3B5WyBpIF0uc3RlcCggZHQgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHRlcm0uIFN1YmNsYXNzZXMgbXVzdCBvdmVycmlkZSB0aGlzIG1ldGhvZCB0byBleHBhbmQgdGhlIHR5cGUgZGVmaW5pdGlvbiBvZiBwcm92aWRlZE9wdGlvbnMsIGluY2x1ZGluZ1xyXG4gICAqIHByb3BlcnRpZXMgdGhhdCBhcmUgc3BlY2lmaWMgdG8gdGhlIHN1YmNsYXNzLiBUaGUgc3ViY2xhc3MgaW1wbGVtZW50YXRpb24gd2lsbCB0aGVuIGNhbGwgc3VwZXIuY3JlYXRlVGVybS5cclxuICAgKlxyXG4gICAqIE5PVEU6IFVzaW5nIFR5cGVTY3JpcHQgZ2VuZXJpY3MgdG8gcGFyYW1ldGVyaXplIHRoZSB0eXBlIG9mIHByb3ZpZGVkT3B0aW9ucyB3b3VsZCBoYXZlIGJlZW4gcHJlZmVycmVkIGlmIHRoaXMgc2ltXHJcbiAgICogaGFkIG9yaWdpbmFsbHkgYmVlbiB3cml0dGVuIGluIFR5cGVTY3JpcHQuIEJ1dCB0aGF0IHdhcyBub3QgcG9zc2libGUgd2l0aCB0aGUgY3VycmVudCBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uLlxyXG4gICAqIEdlbmVyaWNzIGludHJvZHVjZWQgb3RoZXIgcHJvYmxlbXMgdGhhdCB3ZXJlIG5vdCBzdHJhaWdodGZvcndhcmQgdG8gcmVzb2x2ZS5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlVGVybSggcHJvdmlkZWRPcHRpb25zPzogQ3JlYXRlVGVybU9wdGlvbnMgKTogVGVybSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IGNvbWJpbmVPcHRpb25zPENyZWF0ZVRlcm1PcHRpb25zPigge1xyXG4gICAgICBzaWduOiAxLFxyXG4gICAgICBldmVudDogbnVsbFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRlcm1cclxuICAgIGNvbnN0IHRlcm0gPSB0aGlzLmNyZWF0ZVRlcm1Qcm90ZWN0ZWQoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBtYW5hZ2UgdGhlIHRlcm1cclxuICAgIHRoaXMubWFuYWdlVGVybSggdGVybSwgb3B0aW9ucy5ldmVudCApO1xyXG5cclxuICAgIHJldHVybiB0ZXJtO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVGVsbHMgdGhpcyB0ZXJtIGNyZWF0b3IgdG8gbWFuYWdlIGEgdGVybS4gIE9uY2UgbWFuYWdlZCwgYSB0ZXJtIGNhbm5vdCBiZSB1bm1hbmFnZWQgLSBpdCdzIGEgbGlmZSBjb21taXRtZW50IVxyXG4gICAqIEBwYXJhbSB0ZXJtXHJcbiAgICogQHBhcmFtIGV2ZW50IC0gbm9uLW51bGwgaWYgdGVybSB3YXMgY3JlYXRlZCBhcyB0aGUgcmVzdWx0IG9mIGEgdXNlciBpbnRlcmFjdGlvblxyXG4gICAqL1xyXG4gIHByaXZhdGUgbWFuYWdlVGVybSggdGVybTogVGVybSwgZXZlbnQ6IFByZXNzTGlzdGVuZXJFdmVudCB8IG51bGwgPSBudWxsICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRlcm0uaXNEaXNwb3NlZCwgYHRlcm0gaXMgZGlzcG9zZWQ6ICR7dGVybX1gICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy5pc01hbmFnZWRUZXJtKCB0ZXJtICksIGB0ZXJtIGlzIGFscmVhZHkgbWFuYWdlZDogJHt0ZXJtfWAgKTtcclxuXHJcbiAgICB0aGlzLmFsbFRlcm1zLmFkZCggdGVybSApO1xyXG5cclxuICAgIC8vIHNldCB0aGUgdGVybSdzIGRyYWcgYm91bmRzXHJcbiAgICB0ZXJtLmRyYWdCb3VuZHMgPSB0aGlzLmRyYWdCb3VuZHM7XHJcblxyXG4gICAgLy8gc2V0IHRoZSB0ZXJtJ3MgdG9vbGJveFBvc2l0aW9uLCBzbyB0aGF0IGl0IGtub3dzIGhvdyB0byBhbmltYXRlIGJhY2sgdG8gdGhlIHRvb2xib3hcclxuICAgIGlmICggdGVybS5zaWduaWZpY2FudFZhbHVlLmdldFZhbHVlKCkgPj0gMCApIHtcclxuICAgICAgdGVybS50b29sYm94UG9zaXRpb24gPSB0aGlzLnBvc2l0aXZlUG9zaXRpb247XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5uZWdhdGl2ZVBvc2l0aW9uLCAnbmVnYXRpdmVQb3NpdGlvbiBoYXMgbm90IGJlZW4gaW5pdGlhbGl6ZWQnICk7XHJcbiAgICAgIHRlcm0udG9vbGJveFBvc2l0aW9uID0gdGhpcy5uZWdhdGl2ZVBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENsZWFuIHVwIHdoZW4gdGhlIHRlcm0gaXMgZGlzcG9zZWQuXHJcbiAgICAvLyByZW1vdmVMaXN0ZW5lciByZXF1aXJlZCB3aGVuIHRoZSB0ZXJtIGlzIGRpc3Bvc2VkLCBzZWUgdGVybVdhc0Rpc3Bvc2VkLlxyXG4gICAgdGVybS5kaXNwb3NlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMudGVybURpc3Bvc2VkTGlzdGVuZXIgKTtcclxuXHJcbiAgICAvLyBOb3RpZnkgbGlzdGVuZXJzIHRoYXQgYSB0ZXJtIGlzIGJlaW5nIG1hbmFnZWQgYnkgdGhpcyB0ZXJtIGNyZWF0b3IuXHJcbiAgICAvLyBUaGlzIHdpbGwgcmVzdWx0IGluIGNyZWF0aW9uIG9mIHRoZSBjb3JyZXNwb25kaW5nIHZpZXcuXHJcbiAgICB0aGlzLnRlcm1DcmVhdGVkRW1pdHRlci5lbWl0KCB0aGlzLCB0ZXJtLCBldmVudCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIHdoZW4gVGVybS5kaXNwb3NlIGlzIGNhbGxlZC5cclxuICAgKi9cclxuICBwcml2YXRlIHVubWFuYWdlVGVybSggdGVybTogVGVybSApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBPUkRFUiBJUyBWRVJZIElNUE9SVEFOVCBIRVJFIVxyXG4gICAgaWYgKCB0aGlzLmlzVGVybU9uUGxhdGUoIHRlcm0gKSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVUZXJtRnJvbVBsYXRlKCB0ZXJtICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0aGlzLmFsbFRlcm1zLmluY2x1ZGVzKCB0ZXJtICkgKSB7XHJcbiAgICAgIHRoaXMuYWxsVGVybXMucmVtb3ZlKCB0ZXJtICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCB0ZXJtLmRpc3Bvc2VkRW1pdHRlci5oYXNMaXN0ZW5lciggdGhpcy50ZXJtRGlzcG9zZWRMaXN0ZW5lciApICkge1xyXG4gICAgICB0ZXJtLmRpc3Bvc2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggdGhpcy50ZXJtRGlzcG9zZWRMaXN0ZW5lciApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdGhlIHNwZWNpZmllZCB0ZXJtIG1hbmFnZWQgYnkgdGhpcyB0ZXJtIGNyZWF0b3I/XHJcbiAgICovXHJcbiAgcHJpdmF0ZSBpc01hbmFnZWRUZXJtKCB0ZXJtOiBUZXJtICk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuYWxsVGVybXMuaW5jbHVkZXMoIHRlcm0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1dHMgYSB0ZXJtIG9uIHRoZSBwbGF0ZS4gSWYgdGhlIHRlcm0gd2Fzbid0IGFscmVhZHkgbWFuYWdlZCwgaXQgYmVjb21lcyBtYW5hZ2VkLlxyXG4gICAqIEBwYXJhbSB0ZXJtXHJcbiAgICogQHBhcmFtIFtjZWxsXSAtIGNlbGwgaW4gdGhlIHBsYXRlJ3MgMkQgZ3JpZCwgZGVmYXVsdHMgdG8gdGhpcy5saWtlVGVybXNDZWxsIHdoZW4gY29tYmluaW5nIGxpa2UgdGVybXNcclxuICAgKi9cclxuICBwdWJsaWMgcHV0VGVybU9uUGxhdGUoIHRlcm06IFRlcm0sIGNlbGw/OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhdGhpcy50ZXJtc09uUGxhdGUuaW5jbHVkZXMoIHRlcm0gKSwgYHRlcm0gYWxyZWFkeSBvbiBwbGF0ZTogJHt0ZXJtfWAgKTtcclxuXHJcbiAgICBpZiAoIGNlbGwgPT09IHVuZGVmaW5lZCAmJiB0aGlzLmNvbWJpbmVMaWtlVGVybXNFbmFibGVkICkge1xyXG4gICAgICBjb25zdCBsaWtlVGVybXNDZWxsID0gdGhpcy5saWtlVGVybXNDZWxsITtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGlrZVRlcm1zQ2VsbCAhPT0gbnVsbCApO1xyXG4gICAgICBjZWxsID0gbGlrZVRlcm1zQ2VsbDtcclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNlbGwgIT09IHVuZGVmaW5lZCwgJ2NlbGwgaXMgdW5kZWZpbmVkJyApO1xyXG5cclxuICAgIC8vIE9SREVSIElTIFZFUlkgSU1QT1JUQU5UIEhFUkUhXHJcbiAgICBpZiAoICF0aGlzLmlzTWFuYWdlZFRlcm0oIHRlcm0gKSApIHtcclxuICAgICAgdGhpcy5tYW5hZ2VUZXJtKCB0ZXJtLCBudWxsICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnBsYXRlLmFkZFRlcm0oIHRlcm0sIGNlbGwhICk7XHJcbiAgICB0aGlzLnRlcm1zT25QbGF0ZS5wdXNoKCB0ZXJtICk7XHJcbiAgICB0ZXJtLm9uUGxhdGVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuY29tYmluZUxpa2VUZXJtc0VuYWJsZWQgfHwgdGhpcy50ZXJtc09uUGxhdGUubGVuZ3RoIDw9IDEsXHJcbiAgICAgIGB3aGVuIGNvbWJpbmVMaWtlVGVybXNFbmFibGVkLCB0aGVyZSBzaG91bGQgYmUgYXQgbW9zdCAxIHRlcm0gb24gcGxhdGU6ICR7dGhpcy50ZXJtc09uUGxhdGUubGVuZ3RofWAgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbW92ZXMgYSB0ZXJtIGZyb20gdGhlIHBsYXRlLlxyXG4gICAqIEBwYXJhbSB0ZXJtXHJcbiAgICogQHJldHVybnMgdGhlIGNlbGwgdGhhdCB0aGUgdGVybSB3YXMgcmVtb3ZlZCBmcm9tXHJcbiAgICovXHJcbiAgcHVibGljIHJlbW92ZVRlcm1Gcm9tUGxhdGUoIHRlcm06IFRlcm0gKTogbnVtYmVyIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYWxsVGVybXMuaW5jbHVkZXMoIHRlcm0gKSwgYHRlcm0gbm90IGZvdW5kOiAke3Rlcm19YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50ZXJtc09uUGxhdGUuaW5jbHVkZXMoIHRlcm0gKSwgYHRlcm0gbm90IG9uIHBsYXRlOiAke3Rlcm19YCApO1xyXG5cclxuICAgIC8vIE9SREVSIElTIFZFUlkgSU1QT1JUQU5UIEhFUkUhXHJcbiAgICBjb25zdCBjZWxsID0gdGhpcy5wbGF0ZS5yZW1vdmVUZXJtKCB0ZXJtICk7XHJcbiAgICB0aGlzLnRlcm1zT25QbGF0ZS5yZW1vdmUoIHRlcm0gKTtcclxuICAgIGlmICggIXRlcm0ub25QbGF0ZVByb3BlcnR5LmlzRGlzcG9zZWQgKSB7XHJcbiAgICAgIHRlcm0ub25QbGF0ZVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gY2VsbDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoZSBzcGVjaWZpZWQgdGVybSBvbiB0aGUgcGxhdGU/XHJcbiAgICovXHJcbiAgcHVibGljIGlzVGVybU9uUGxhdGUoIHRlcm06IFRlcm0gKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy50ZXJtc09uUGxhdGUuaW5jbHVkZXMoIHRlcm0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRlcm1zIHRoYXQgYXJlIG9uIHRoZSBwbGF0ZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0VGVybXNPblBsYXRlKCk6IFRlcm1bXSB7XHJcbiAgICByZXR1cm4gdGhpcy50ZXJtc09uUGxhdGUuZ2V0QXJyYXlDb3B5KCk7IC8vIGRlZmVuc2l2ZSBjb3B5XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBwb3NpdGl2ZSB0ZXJtcyBvbiB0aGUgcGxhdGUuXHJcbiAgICovXHJcbiAgcHVibGljIGdldFBvc2l0aXZlVGVybXNPblBsYXRlKCk6IFRlcm1bXSB7XHJcbiAgICByZXR1cm4gXy5maWx0ZXIoIHRoaXMudGVybXNPblBsYXRlLCB0ZXJtID0+ICggdGVybS5zaWduID09PSAxICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG5lZ2F0aXZlIHRlcm1zIG9uIHRoZSBwbGF0ZS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TmVnYXRpdmVUZXJtc09uUGxhdGUoKTogVGVybVtdIHtcclxuICAgIHJldHVybiBfLmZpbHRlciggdGhpcy50ZXJtc09uUGxhdGUsIHRlcm0gPT4gKCB0ZXJtLnNpZ24gPT09IC0xICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIHRlcm0gdGhhdCBvY2N1cGllcyB0aGUgJ2xpa2UgdGVybXMnIGNlbGwgb24gdGhlIHBsYXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRMaWtlVGVybU9uUGxhdGUoKTogVGVybSB8IG51bGwge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5jb21iaW5lTGlrZVRlcm1zRW5hYmxlZCwgJ2dldExpa2VUZXJtT25QbGF0ZSBpcyBvbmx5IHN1cHBvcnRlZCB3aGVuIGNvbWJpbmVMaWtlVGVybXNFbmFibGVkJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50ZXJtc09uUGxhdGUubGVuZ3RoIDw9IDEsICdleHBlY3RlZCBhdCBtb3N0IDEgdGVybSBvbiBwbGF0ZScgKTtcclxuXHJcbiAgICBjb25zdCBsaWtlVGVybXNDZWxsID0gdGhpcy5saWtlVGVybXNDZWxsITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpa2VUZXJtc0NlbGwgIT09IG51bGwgKTtcclxuICAgIHJldHVybiB0aGlzLnBsYXRlLmdldFRlcm1JbkNlbGwoIGxpa2VUZXJtc0NlbGwgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIG9mIGFsbCB0ZXJtcy5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzcG9zZUFsbFRlcm1zKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIG9wZXJhdGUgb24gYSBjb3B5LCBzaW5jZSBkaXNwb3NlIGNhdXNlcyB0aGUgT2JzZXJ2YWJsZUFycmF5RGVmIHRvIGJlIG1vZGlmaWVkXHJcbiAgICB0aGlzLmRpc3Bvc2VUZXJtcyggdGhpcy5hbGxUZXJtcy5nZXRBcnJheUNvcHkoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlzcG9zZXMgb2YgYWxsIHRlcm1zIHRoYXQgYXJlIG9uIHRoZSBwbGF0ZS5cclxuICAgKi9cclxuICBwdWJsaWMgZGlzcG9zZVRlcm1zT25QbGF0ZSgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBvcGVyYXRlIG9uIGEgY29weSwgc2luY2UgZGlzcG9zZSBjYXVzZXMgdGhlIE9ic2VydmFibGVBcnJheURlZiB0byBiZSBtb2RpZmllZFxyXG4gICAgdGhpcy5kaXNwb3NlVGVybXMoIHRoaXMudGVybXNPblBsYXRlLmdldEFycmF5Q29weSgpICk7XHJcbiAgICB0aGlzLmhpZGVBbGxUZXJtSGFsb3MoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIG9mIGFsbCB0ZXJtcyB0aGF0IGFyZSBOT1Qgb24gdGhlIHBsYXRlLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBkaXNwb3NlVGVybXNOb3RPblBsYXRlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlVGVybXMoIF8uZGlmZmVyZW5jZSggdGhpcy5hbGxUZXJtcywgdGhpcy50ZXJtc09uUGxhdGUgKSApO1xyXG4gICAgdGhpcy5oaWRlQWxsVGVybUhhbG9zKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlcyBvZiBzb21lIGNvbGxlY3Rpb24gb2YgdGVybXMuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkaXNwb3NlVGVybXMoIHRlcm1zOiBUZXJtW10gKTogdm9pZCB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0ZXJtcy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgY29uc3QgdGVybSA9IHRlcm1zWyBpIF07XHJcbiAgICAgIGlmICggIXRlcm0uaXNEaXNwb3NlZCApIHtcclxuICAgICAgICB0ZXJtLmRpc3Bvc2UoKTsgLy8gcmVzdWx0cyBpbiBjYWxsIHRvIHVubWFuYWdlVGVybVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9lcXVhbGl0eS1leHBsb3Jlci9pc3N1ZXMvODhcclxuICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYE9vcHMhIHRlcm0gd2FzIGFscmVhZHkgZGlzcG9zZWQsIGNsZWFuaW5nIHVwOiAke3Rlcm19YCwgeyBjb2xvcjogJ3JlZCcgfSApO1xyXG4gICAgICAgIHRoaXMudW5tYW5hZ2VUZXJtKCB0ZXJtICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhpZGVzIGhhbG9zIGZvciBhbGwgdGVybXMuIFRoaXMgaXMgZG9uZSBhcyBwYXJ0IG9mIGRpc3Bvc2VUZXJtc09uUGxhdGUgYW5kIGRpc3Bvc2VUZXJtc05vdE9uUGxhdGUsXHJcbiAgICogc28gdGhhdCBzb21lIHRlcm0gaXMgbm90IGxlZnQgd2l0aCBpdHMgaGFsbyB2aXNpYmxlIGFmdGVyIHRoZSB0ZXJtIHRoYXQgaXQgb3ZlcmxhcHBlZCBkaXNhcHBlYXJzLlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZXF1YWxpdHktZXhwbG9yZXIvaXNzdWVzLzU5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaGlkZUFsbFRlcm1IYWxvcygpOiB2b2lkIHtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYWxsVGVybXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYWxsVGVybXMuZ2V0KCBpICkuaGFsb1Zpc2libGVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRG8gdGhpcyBUZXJtQ3JlYXRvciBhbmQgdGhlIHNwZWNpZmllZCBUZXJtQ3JlYXRvciBjcmVhdGUgbGlrZSB0ZXJtcz9cclxuICAgKi9cclxuICBwdWJsaWMgaXNMaWtlVGVybUNyZWF0b3IoIHRlcm1DcmVhdG9yOiBUZXJtQ3JlYXRvciApOiBib29sZWFuIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgMiB0ZXJtcyB2aWEgY3JlYXRlVGVybVByb3RlY3RlZCwgbm90IGNyZWF0ZVRlcm0sIHNvIHRoYXQgdGhleSBhcmUgbm90IG1hbmFnZWQuXHJcbiAgICBjb25zdCB0aGlzVGVybSA9IHRoaXMuY3JlYXRlVGVybVByb3RlY3RlZCgpO1xyXG4gICAgY29uc3QgdGhhdFRlcm0gPSB0ZXJtQ3JlYXRvci5jcmVhdGVUZXJtUHJvdGVjdGVkKCk7XHJcblxyXG4gICAgLy8gSWYgdGhlIDIgdGVybXMgYXJlICdsaWtlJyB0aGVuIHRoZSBjcmVhdG9ycyBhcmUgJ2xpa2UnLlxyXG4gICAgY29uc3QgaXNMaWtlID0gdGhpc1Rlcm0uaXNMaWtlVGVybSggdGhhdFRlcm0gKTtcclxuXHJcbiAgICAvLyBEaXNwb3NlIG9mIHRoZSB0ZXJtcy5cclxuICAgIHRoaXNUZXJtLmRpc3Bvc2UoKTtcclxuICAgIHRoYXRUZXJtLmRpc3Bvc2UoKTtcclxuXHJcbiAgICByZXR1cm4gaXNMaWtlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQXBwbGllcyBhbiBvcGVyYXRpb24gdG8gdGVybXMgb24gdGhlIHBsYXRlLlxyXG4gICAqIEBwYXJhbSBvcGVyYXRpb25cclxuICAgKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBvcGVyYXRpb24gcmVzdWx0ZWQgaW4gYSB0ZXJtIG9uIHRoZSBwbGF0ZSBiZWNvbWluZyB6ZXJvLCBmYWxzZSBvdGhlcndpc2VcclxuICAgKi9cclxuICBwdWJsaWMgYXBwbHlPcGVyYXRpb24oIG9wZXJhdGlvbjogVW5pdmVyc2FsT3BlcmF0aW9uICk6IGJvb2xlYW4ge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuY29tYmluZUxpa2VUZXJtc0VuYWJsZWQsXHJcbiAgICAgICdhcHBseU9wZXJhdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCB3aGVuIGNvbWJpbmluZyBsaWtlIHRlcm1zJyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy50ZXJtc09uUGxhdGUubGVuZ3RoIDw9IDEsXHJcbiAgICAgIGBleHBlY3RlZCBhdCBtb3N0IDEgdGVybSBvbiBwbGF0ZTogJHt0aGlzLnRlcm1zT25QbGF0ZS5sZW5ndGh9YCApO1xyXG5cclxuICAgIGxldCBzdW1tZWRUb1plcm8gPSBmYWxzZTtcclxuICAgIGxldCBwbGF0ZVdhc0VtcHR5ID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3QgbGlrZVRlcm1zSW5DZWxsID0gdGhpcy5saWtlVGVybXNDZWxsITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpa2VUZXJtc0luQ2VsbCAhPT0gbnVsbCApO1xyXG5cclxuICAgIC8vIEdldCB0aGUgdGVybSBvbiB0aGUgcGxhdGUsIG9yIHVzZSB6ZXJvIHRlcm1cclxuICAgIGxldCB0ZXJtID0gdGhpcy5wbGF0ZS5nZXRUZXJtSW5DZWxsKCBsaWtlVGVybXNJbkNlbGwgKTtcclxuICAgIGlmICggIXRlcm0gKSB7XHJcbiAgICAgIHBsYXRlV2FzRW1wdHkgPSB0cnVlO1xyXG4gICAgICB0ZXJtID0gdGhpcy5jcmVhdGVaZXJvVGVybSgge1xyXG4gICAgICAgIGRpYW1ldGVyOiBFcXVhbGl0eUV4cGxvcmVyQ29uc3RhbnRzLkJJR19URVJNX0RJQU1FVEVSXHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBcHBseSB0aGUgb3BlcmF0aW9uIHRvIHRoZSB0ZXJtLiBSZXR1cm5zIG51bGwgaWYgdGhlIG9wZXJhdGlvbiB3YXMgbm90IGFwcGxpY2FibGUgdG8gdGhlIHRlcm0uXHJcbiAgICBjb25zdCBuZXdUZXJtID0gdGVybS5hcHBseU9wZXJhdGlvbiggb3BlcmF0aW9uICk7XHJcblxyXG4gICAgaWYgKCBuZXdUZXJtICkge1xyXG5cclxuICAgICAgLy8gZGlzcG9zZSBvZiB0aGUgdGVybVxyXG4gICAgICB0ZXJtLmRpc3Bvc2UoKTtcclxuXHJcbiAgICAgIGlmICggbmV3VGVybS5zaWduID09PSAwICkge1xyXG4gICAgICAgIHN1bW1lZFRvWmVybyA9ICFwbGF0ZVdhc0VtcHR5O1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICAvLyBtYW5hZ2UgdGhlIG5ldyB0ZXJtIGFuZCBwdXQgaXQgb24gdGhlIHBsYXRlXHJcbiAgICAgICAgdGhpcy5wdXRUZXJtT25QbGF0ZSggbmV3VGVybSwgbGlrZVRlcm1zSW5DZWxsICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3VtbWVkVG9aZXJvO1xyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gQmVsb3cgaGVyZSBhcmUgQGFic3RyYWN0IG1ldGhvZHMsIHRvIGJlIGltcGxlbWVudGVkIGJ5IHN1YmNsYXNzZXNcclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyB0aGUgaWNvbiB1c2VkIHRvIHJlcHJlc2VudCB0aGlzIHRlcm0gaW4gdGhlIFRlcm1zVG9vbGJveE5vZGUgYW5kIGVxdWF0aW9ucy5cclxuICAgKi9cclxuICBwdWJsaWMgYWJzdHJhY3QgY3JlYXRlSWNvbiggc2lnbj86IFRlcm1DcmVhdG9yU2lnbiApOiBOb2RlO1xyXG5cclxuICAvKipcclxuICAgKiBJbnN0YW50aWF0ZXMgYSB0ZXJtLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBhYnN0cmFjdCBjcmVhdGVUZXJtUHJvdGVjdGVkKCBwcm92aWRlZE9wdGlvbnM/OiBDcmVhdGVUZXJtT3B0aW9ucyApOiBUZXJtO1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgdGVybSB3aG9zZSBzaWduaWZpY2FudCB2YWx1ZSBpcyB6ZXJvLiBUaGlzIGlzIHVzZWQgd2hlbiBhcHBseWluZyBhbiBvcGVyYXRpb24gdG8gYW4gZW1wdHkgcGxhdGUuXHJcbiAgICogVGhlIHRlcm0gaXMgbm90IG1hbmFnZWQgYnkgdGhlIFRlcm1DcmVhdG9yLCBzbyB0aGUgaW1wbGVtZW50YXRpb24gaW4gc3ViY2xhc3NlcyBzaG91bGQgdHlwaWNhbGx5IGNhbGxcclxuICAgKiBjcmVhdGVUZXJtUHJvdGVjdGVkIGluc3RlYWQgb2YgY3JlYXRlVGVybS5cclxuICAgKi9cclxuICBwdWJsaWMgYWJzdHJhY3QgY3JlYXRlWmVyb1Rlcm0oIHByb3ZpZGVkT3B0aW9ucz86IENyZWF0ZVRlcm1PcHRpb25zICk6IFRlcm07XHJcblxyXG4gIC8qKlxyXG4gICAqIEluc3RhbnRpYXRlcyB0aGUgTm9kZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGEgdGVybS5cclxuICAgKi9cclxuICBwdWJsaWMgYWJzdHJhY3QgY3JlYXRlVGVybU5vZGUoIHRlcm06IFRlcm0gKTogVGVybU5vZGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIFN1YmNsYXNzZXMgbXVzdCBpbXBsZW1lbnQgdGhpcyBtZXRob2QgdG8gcHJvdmlkZSAndXNlZnVsIGluZm9ybWF0aW9uJywgdG8gYXBwZWFzZVxyXG4gICAqIFRTIEVTTGludCBydWxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1iYXNlLXRvLXN0cmluZy4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jaGlwcGVyL2lzc3Vlcy8xMzM4XHJcbiAgICovXHJcbiAgcHVibGljIGFic3RyYWN0IG92ZXJyaWRlIHRvU3RyaW5nKCk6IHN0cmluZztcclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ1Rlcm1DcmVhdG9yJywgVGVybUNyZWF0b3IgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBMkIsOENBQThDO0FBQ3JHLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUdwRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELE9BQU9DLFNBQVMsSUFBSUMsY0FBYyxRQUFRLHVDQUF1QztBQUNqRixPQUFPQyxRQUFRLE1BQU0sNkNBQTZDO0FBQ2xF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