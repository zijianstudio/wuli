// Copyright 2013-2022, University of Colorado Boulder

/**
 * The model for the Friction sim.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import friction from '../../friction.js';
import FrictionConstants from '../FrictionConstants.js';
import Atom from './Atom.js';

// constants
const ATOM_RADIUS = FrictionConstants.ATOM_RADIUS; // radius of single atom
const ATOM_SPACING_Y = 20; // y-distance between neighbors (atoms)
const INITIAL_ATOM_SPACING_Y = 25; // initial distance between top and bottom atoms
const VIBRATION_AMPLITUDE_MIN = 1; // min amplitude for an atom
const AMPLITUDE_SHEAR_OFF = 7; // amplitude for an atom to shear off
const VIBRATION_AMPLITUDE_MAX = 12; // atom's max amplitude
const TOP_BOOK_ATOMS_COLOR = FrictionConstants.TOP_BOOK_ATOMS_COLOR; // color of top book
const BOTTOM_BOOK_ATOMS_COLOR = FrictionConstants.BOTTOM_BOOK_ATOMS_COLOR; // color of bottom
const COOLING_RATE = 0.2; // proportion per second; adjust in order to change the cooling rate
const HEATING_MULTIPLIER = 0.0075; // multiplied by distance moved while in contact to control heating rate
const SHEAR_OFF_AMPLITUDE_REDUCTION = 0.01; // decrease in amplitude (a.k.a. temperature) when an atom shears off
const MAX_X_DISPLACEMENT = 600; // max allowed distance from center x
const MIN_Y_POSITION = -70; // empirically determined such that top book can't be completely dragged out of frame
const DEFAULT_ROW_START_X_POSITION = 50;

// atoms of top book, contains 5 rows, 4 of which can shear off and 1 that can't
const TOP_BOOK_ATOM_STRUCTURE = [
/*
 * First row:
 * contains 30 atoms that can not shear off.
 */
[{
  num: 30
}],
/*
 * Second row:
 * contains 29 atoms that can shear off.
 * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
 */
[{
  offset: 0.5,
  num: 29,
  canShearOff: true
}],
/*
 * Third row:
 * contains 29 atoms that can shear off.
 */
[{
  num: 29,
  canShearOff: true
}],
/*
 * Fourth row:
 * contains 24 atoms, separated into 5 groups that can shear off.
 * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
 */
[{
  offset: 0.5,
  num: 5,
  canShearOff: true
}, {
  offset: 6.5,
  num: 8,
  canShearOff: true
}, {
  offset: 15.5,
  num: 5,
  canShearOff: true
}, {
  offset: 21.5,
  num: 5,
  canShearOff: true
}, {
  offset: 27.5,
  num: 1,
  canShearOff: true
}],
/*
 * Fifth row:
 * contains 9 atoms, separated into 5 groups that can shear off.
 */
[{
  offset: 3,
  num: 2,
  canShearOff: true
}, {
  offset: 8,
  num: 1,
  canShearOff: true
}, {
  offset: 12,
  num: 2,
  canShearOff: true
}, {
  offset: 17,
  num: 2,
  canShearOff: true
}, {
  offset: 24,
  num: 2,
  canShearOff: true
}]];

// atoms of bottom book (contains 3 rows that can not shear off)
const BOTTOM_BOOK_ATOM_STRUCTURE = [
/*
 * First row:
 * contains 29 atoms that can not shear off.
 */
[{
  num: 29
}],
/*
 * Second row:
 * contains 28 atoms that can not shear off.
 * Have additional offset 0.5 of x-distance between atoms (to make the lattice of atoms).
 */
[{
  offset: 0.5,
  num: 28
}],
/*
 * Third row:
 * contains 29 atoms that can not shear off.
 */
[{
  num: 29
}]];

// pdom
// iterate through the constant to determine the number of atoms that can shear off from the top book structure
let atoms = 0;
TOP_BOOK_ATOM_STRUCTURE.forEach(row => {
  row.forEach(schema => {
    if (schema.canShearOff) {
      atoms += schema.num;
    }
  });
});

// the number of shearable atoms in the top book
const NUMBER_OF_SHEARABLE_ATOMS = atoms;

// information about the nature of the atoms that will be shown in the magnifier window
const MAGNIFIED_ATOMS_INFO = {
  radius: ATOM_RADIUS,
  distanceX: FrictionConstants.INITIAL_ATOM_SPACING_X,
  distanceY: FrictionConstants.INITIAL_ATOM_SPACING_Y,
  distance: INITIAL_ATOM_SPACING_Y,
  vibrationAmplitude: new Range(VIBRATION_AMPLITUDE_MIN, VIBRATION_AMPLITUDE_MAX),
  shearingLimit: AMPLITUDE_SHEAR_OFF,
  top: {
    color: TOP_BOOK_ATOMS_COLOR,
    layerDescriptions: TOP_BOOK_ATOM_STRUCTURE
  },
  bottom: {
    color: BOTTOM_BOOK_ATOMS_COLOR,
    layerDescriptions: BOTTOM_BOOK_ATOM_STRUCTURE
  }
};
class FrictionModel extends PhetioObject {
  /**
   * @param {number} width - width in view=model coordinates
   * @param {number} height - height in view=model coordinates
   * @param {Tandem} tandem
   */
  constructor(width, height, tandem) {
    super({
      tandem: tandem,
      phetioType: FrictionModel.FrictionModelIO
    });

    // @public (read-only) {Number} - the width for the model in model coordinates
    this.width = width;

    // @public (read-only) {Number} - the height for the model in model coordinates
    this.height = height;

    // @private {Number} - track how much to shear off in step() to prevent a Property loop
    this.scheduledShearingAmount = 0;

    // @public (phet-io) - Instrumented so that PhET-iO clients can get a message when an atom shears off
    this.shearedOffEmitter = new Emitter({
      tandem: tandem.createTandem('shearedOffEmitter'),
      phetioDocumentation: 'Emits when atoms shear off from the top book',
      phetioReadOnly: true
    });

    // @public (read-only) {Atom[][]}- array of all atoms which are able to shear off organized by row such that the
    // last rows should be sheared off first
    this.shearableAtomsByRow = [];

    // @public (read-only) {NumberProperty} - atoms temperature = amplitude of oscillation
    this.vibrationAmplitudeProperty = new NumberProperty(MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min, {
      range: MAGNIFIED_ATOMS_INFO.vibrationAmplitude,
      tandem: tandem.createTandem('vibrationAmplitudeProperty'),
      phetioDocumentation: 'A relative, qualitative value describing the amount of vibration of the atoms',
      phetioHighFrequency: true,
      phetioReadOnly: true
    });

    // @public - position of top book, can by dragged the user
    this.topBookPositionProperty = new Vector2Property(new Vector2(0, 0), {
      phetioDocumentation: 'The position of the top book. In view coordinates (model and view coordinates are the same in this simulation).',
      tandem: tandem.createTandem('topBookPositionProperty'),
      phetioHighFrequency: true
    });

    // @public {NumberProperty} - distance between books
    this.distanceBetweenBooksProperty = new NumberProperty(MAGNIFIED_ATOMS_INFO.distance, {
      tandem: tandem.createTandem('distanceBetweenBooksProperty'),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'The distance between the edges of the two books. In view coordinates.'
    });

    // @public (read-only) - The draggable bounds of the top book. This Bounds2 instance is never changed, but only mutated.
    // Each mutation triggers listener notification (without an "oldValue" param).
    this.topBookDragBoundsProperty = new Property(new Bounds2(-MAX_X_DISPLACEMENT,
    // left bound
    MIN_Y_POSITION,
    // top bound
    MAX_X_DISPLACEMENT,
    // right bound
    this.distanceBetweenBooksProperty.value), {
      phetioValueType: Bounds2.Bounds2IO,
      tandem: tandem.createTandem('topBookDragBoundsProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'The draggable bounds of the top book. This changes as rows of atoms shear off.'
    });

    // @public (read-only) {NumberProperty} -
    this.atomRowsToShearOffProperty = new NumberProperty(TOP_BOOK_ATOM_STRUCTURE.length - 1, {
      tandem: tandem.createTandem('atomRowsToShearOffProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'The number of rows of atoms available to shear off, goes down as atom rows shear off'
    });

    // @private - are books in contact?
    this.contactProperty = new DerivedProperty([this.distanceBetweenBooksProperty], distance => Math.floor(distance) <= 0, {
      tandem: tandem.createTandem('contactProperty'),
      phetioValueType: BooleanIO,
      phetioDocumentation: 'This Property will be true when the two books are in contact, with not space between their atoms.'
    });

    // @public {BooleanProperty} - Show hint icon. Only set by model and on a11y grab interaction.
    this.hintProperty = new BooleanProperty(true, {
      tandem: tandem.createTandem('hintProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'whether or not the sim is conveying the hint arrows. This is not editable, but can be ' + 'overridden by toggling the "hintArrowsNode.visibleProperty" in the view.'
    });

    // @public {Number} (read-only) - drag and drop book coordinates conversion coefficient
    this.bookDraggingScaleFactor = 0.025;

    // @public (read-only) {Atom[]} - array of atoms that are visible to the user in the magnifier window
    this.atoms = [];

    // @public (read-only)
    // {number} the count of how many atoms have been sheared off
    this.numberOfAtomsShearedOffProperty = new NumberProperty(0, {
      tandem: tandem.createTandem('numberOfAtomsShearedOffProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'The total number of atoms that have been sheared off of the top book.'
    });
    this.shearedOffEmitter.addListener(() => {
      this.numberOfAtomsShearedOffProperty.value += 1;
    });

    // @public (read-only)
    // {boolean} - has the atom been "successfully" interacted with. This subjective term is defined based on the
    // pedagogical goals of the sim (to rub the other book)
    this.successfullyInteractedWithProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('successfullyInteractedWithProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'This somewhat subjective term is defined based on the pedagogical goals of the sim, which ' + 'is to rub the book on the other to make friction. This Property will be true when any amount ' + 'of friction is created.'
    });
    this.vibrationAmplitudeProperty.link(amplitude => {
      if (!this.successfullyInteractedWithProperty.value && amplitude > FrictionModel.AMPLITUDE_SETTLED_THRESHOLD) {
        this.successfullyInteractedWithProperty.value = true;
      }
    });
    const atomsTandem = tandem.createTandem('atoms');

    // add the atoms that are visible in the top book
    MAGNIFIED_ATOMS_INFO.top.layerDescriptions.forEach((layerDescription, i) => {
      addAtomRow(this, layerDescription, DEFAULT_ROW_START_X_POSITION, FrictionConstants.MAGNIFIER_WINDOW_HEIGHT / 3 - INITIAL_ATOM_SPACING_Y + ATOM_SPACING_Y * i, true,
      // isTopAtom
      atomsTandem);
    });

    // add the atoms that are visible in the bottom book
    MAGNIFIED_ATOMS_INFO.bottom.layerDescriptions.forEach((layerDescription, i) => {
      addAtomRow(this, layerDescription, DEFAULT_ROW_START_X_POSITION, 2 * FrictionConstants.MAGNIFIER_WINDOW_HEIGHT / 3 + ATOM_SPACING_Y * i, false,
      // isTopAtom
      atomsTandem);
    });

    // set distance between atoms and set the amplitude if they are in contact
    this.topBookPositionProperty.link((newPosition, oldPosition) => {
      // don't do further calculations if setting state
      if (!phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.hintProperty.set(false);
        oldPosition = oldPosition || Vector2.ZERO;
        this.distanceBetweenBooksProperty.set(this.distanceBetweenBooksProperty.get() - newPosition.minus(oldPosition).y);
        if (this.contactProperty.get()) {
          const dx = Math.abs(newPosition.x - oldPosition.x);
          const newValue = this.vibrationAmplitudeProperty.get() + dx * HEATING_MULTIPLIER;
          this.vibrationAmplitudeProperty.set(Math.min(newValue, MAGNIFIED_ATOMS_INFO.vibrationAmplitude.max));
        }
      }
    });

    // shearing check
    this.vibrationAmplitudeProperty.link(amplitude => {
      if (amplitude > MAGNIFIED_ATOMS_INFO.shearingLimit && !phet.joist.sim.isSettingPhetioStateProperty.value) {
        this.tryToShearOff();
      }
    });
  }

  /**
   * Move forward in time
   * @param {number} dt - in seconds
   * @public
   */
  step(dt) {
    // step the atoms, which is how they vibrate and move away if they shear off
    for (let i = 0; i < this.atoms.length; i++) {
      this.atoms[i].step(dt);
    }

    // cool the atoms
    let amplitude = this.vibrationAmplitudeProperty.get() - this.scheduledShearingAmount;
    amplitude = Math.max(MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min, amplitude * (1 - dt * COOLING_RATE));
    this.vibrationAmplitudeProperty.set(amplitude);
    this.scheduledShearingAmount = 0;
  }

  /**
   * Restores the initial conditions.
   * @public
   */
  reset() {
    this.vibrationAmplitudeProperty.reset();
    this.topBookPositionProperty.reset();
    this.distanceBetweenBooksProperty.reset();
    this.topBookDragBoundsProperty.value.setMaxY(this.distanceBetweenBooksProperty.value);
    this.topBookDragBoundsProperty.notifyListenersStatic(); // Just to be safe
    this.atomRowsToShearOffProperty.reset();
    this.successfullyInteractedWithProperty.reset();
    this.hintProperty.reset();
    this.numberOfAtomsShearedOffProperty.reset();
    this.atoms.forEach(atom => {
      atom.reset();
    });
  }

  /**
   * determine whether an atom is available to be sheared off and, if so, shear off it
   * @private
   */
  tryToShearOff() {
    // only if this value points to a proper index in shearableAtomsByRow. If negative, there are likely no more shearable rows
    if (this.atomRowsToShearOffProperty.get() > 0) {
      // determine whether the current row is fully sheared off and, if so, move to the next row
      const currentRowOfShearableAtoms = this.shearableAtomsByRow[this.atomRowsToShearOffProperty.get() - 1];

      // if there are any rows of shearable atoms left, shear off one
      if (currentRowOfShearableAtoms.length > 0) {
        // make a list of all atoms in this row that have not yet sheared off
        const notYetShearedAtoms = currentRowOfShearableAtoms.filter(atom => !atom.isShearedOff);
        assert && assert(notYetShearedAtoms.length > 0, 'should never encounter this case, if we do, something is wrong in logic above');

        // randomly choose an non-sheared-off atom and shear off it
        const atomsToShearOff = dotRandom.sample(notYetShearedAtoms);
        atomsToShearOff.shearOff();
        this.shearedOffEmitter.emit();

        // cause some cooling due to shearing
        this.scheduledShearingAmount = this.scheduledShearingAmount + SHEAR_OFF_AMPLITUDE_REDUCTION;
      }
      const isCurrentRowFullyShearedOff = _.every(currentRowOfShearableAtoms, atom => atom.isShearedOff);

      // if all atoms in this row are sheared off, move on to the next row
      if (isCurrentRowFullyShearedOff) {
        // point one row higher because all of the previous row is sheared off
        this.atomRowsToShearOffProperty.set(this.atomRowsToShearOffProperty.get() - 1);

        // the current row is totally sheared off, so the distance between the books just increased "one row" worth.
        this.distanceBetweenBooksProperty.set(this.distanceBetweenBooksProperty.get() + MAGNIFIED_ATOMS_INFO.distanceY);
        this.topBookDragBoundsProperty.value.setMaxY(this.topBookDragBoundsProperty.value.bottom + MAGNIFIED_ATOMS_INFO.distanceY);
        this.topBookDragBoundsProperty.notifyListenersStatic(); // Just to be safe
      }
    }
  }
}

// statics
FrictionModel.MAGNIFIED_ATOMS_INFO = MAGNIFIED_ATOMS_INFO;
FrictionModel.THERMOMETER_MIN_TEMP = MAGNIFIED_ATOMS_INFO.vibrationAmplitude.min - 1.05; // about 0
FrictionModel.THERMOMETER_MAX_TEMP = MAGNIFIED_ATOMS_INFO.shearingLimit * 1.1; // ~7.7

// pdom
FrictionModel.NUMBER_OF_SHEARABLE_ATOMS = NUMBER_OF_SHEARABLE_ATOMS;

// pdom
FrictionModel.VIBRATION_AMPLITUDE_MIN = VIBRATION_AMPLITUDE_MIN;
FrictionModel.VIBRATION_AMPLITUDE_MAX = VIBRATION_AMPLITUDE_MAX;

// pdom - empirically determined value of when the atoms are "pretty much cool and settled"
FrictionModel.AMPLITUDE_SETTLED_THRESHOLD = VIBRATION_AMPLITUDE_MIN + 0.4;
FrictionModel.FrictionModelIO = new IOType('FrictionModelIO', {
  valueType: FrictionModel,
  documentation: 'model for the simulation',
  stateSchema: {
    width: NumberIO,
    height: NumberIO,
    bookDraggingScaleFactor: NumberIO,
    scheduledShearingAmount: NumberIO,
    shearableAtomsByRow: ArrayIO(ArrayIO(ReferenceIO(Atom.AtomIO))),
    atoms: ArrayIO(ReferenceIO(Atom.AtomIO))
  }
});

// helper function to add a layer of atoms to the model
function addAtomRow(frictionModel, layerDescription, rowStartXPos, rowYPos, isTopAtom, parentTandem) {
  let canShearOff;
  const shearableAtomsRow = [];
  for (let i = 0; i < layerDescription.length; i++) {
    const offset = layerDescription[i].offset || 0;
    canShearOff = layerDescription[i].canShearOff || false;
    for (let n = 0; n < layerDescription[i].num; n++) {
      const atom = new Atom(new Vector2(rowStartXPos + (offset + n) * MAGNIFIED_ATOMS_INFO.distanceX, rowYPos), frictionModel, isTopAtom, {
        parentTandem: parentTandem
      });
      frictionModel.atoms.push(atom);
      if (canShearOff) {
        shearableAtomsRow.push(atom);
      }
    }
  }
  if (canShearOff) {
    frictionModel.shearableAtomsByRow.push(shearableAtomsRow);
  }
}
friction.register('FrictionModel', FrictionModel);
export default FrictionModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiTnVtYmVyUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJkb3RSYW5kb20iLCJSYW5nZSIsIlZlY3RvcjIiLCJWZWN0b3IyUHJvcGVydHkiLCJQaGV0aW9PYmplY3QiLCJBcnJheUlPIiwiQm9vbGVhbklPIiwiSU9UeXBlIiwiTnVtYmVySU8iLCJSZWZlcmVuY2VJTyIsImZyaWN0aW9uIiwiRnJpY3Rpb25Db25zdGFudHMiLCJBdG9tIiwiQVRPTV9SQURJVVMiLCJBVE9NX1NQQUNJTkdfWSIsIklOSVRJQUxfQVRPTV9TUEFDSU5HX1kiLCJWSUJSQVRJT05fQU1QTElUVURFX01JTiIsIkFNUExJVFVERV9TSEVBUl9PRkYiLCJWSUJSQVRJT05fQU1QTElUVURFX01BWCIsIlRPUF9CT09LX0FUT01TX0NPTE9SIiwiQk9UVE9NX0JPT0tfQVRPTVNfQ09MT1IiLCJDT09MSU5HX1JBVEUiLCJIRUFUSU5HX01VTFRJUExJRVIiLCJTSEVBUl9PRkZfQU1QTElUVURFX1JFRFVDVElPTiIsIk1BWF9YX0RJU1BMQUNFTUVOVCIsIk1JTl9ZX1BPU0lUSU9OIiwiREVGQVVMVF9ST1dfU1RBUlRfWF9QT1NJVElPTiIsIlRPUF9CT09LX0FUT01fU1RSVUNUVVJFIiwibnVtIiwib2Zmc2V0IiwiY2FuU2hlYXJPZmYiLCJCT1RUT01fQk9PS19BVE9NX1NUUlVDVFVSRSIsImF0b21zIiwiZm9yRWFjaCIsInJvdyIsInNjaGVtYSIsIk5VTUJFUl9PRl9TSEVBUkFCTEVfQVRPTVMiLCJNQUdOSUZJRURfQVRPTVNfSU5GTyIsInJhZGl1cyIsImRpc3RhbmNlWCIsIklOSVRJQUxfQVRPTV9TUEFDSU5HX1giLCJkaXN0YW5jZVkiLCJkaXN0YW5jZSIsInZpYnJhdGlvbkFtcGxpdHVkZSIsInNoZWFyaW5nTGltaXQiLCJ0b3AiLCJjb2xvciIsImxheWVyRGVzY3JpcHRpb25zIiwiYm90dG9tIiwiRnJpY3Rpb25Nb2RlbCIsImNvbnN0cnVjdG9yIiwid2lkdGgiLCJoZWlnaHQiLCJ0YW5kZW0iLCJwaGV0aW9UeXBlIiwiRnJpY3Rpb25Nb2RlbElPIiwic2NoZWR1bGVkU2hlYXJpbmdBbW91bnQiLCJzaGVhcmVkT2ZmRW1pdHRlciIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9SZWFkT25seSIsInNoZWFyYWJsZUF0b21zQnlSb3ciLCJ2aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eSIsIm1pbiIsInJhbmdlIiwicGhldGlvSGlnaEZyZXF1ZW5jeSIsInRvcEJvb2tQb3NpdGlvblByb3BlcnR5IiwiZGlzdGFuY2VCZXR3ZWVuQm9va3NQcm9wZXJ0eSIsInRvcEJvb2tEcmFnQm91bmRzUHJvcGVydHkiLCJ2YWx1ZSIsInBoZXRpb1ZhbHVlVHlwZSIsIkJvdW5kczJJTyIsImF0b21Sb3dzVG9TaGVhck9mZlByb3BlcnR5IiwibGVuZ3RoIiwiY29udGFjdFByb3BlcnR5IiwiTWF0aCIsImZsb29yIiwiaGludFByb3BlcnR5IiwiYm9va0RyYWdnaW5nU2NhbGVGYWN0b3IiLCJudW1iZXJPZkF0b21zU2hlYXJlZE9mZlByb3BlcnR5IiwiYWRkTGlzdGVuZXIiLCJzdWNjZXNzZnVsbHlJbnRlcmFjdGVkV2l0aFByb3BlcnR5IiwibGluayIsImFtcGxpdHVkZSIsIkFNUExJVFVERV9TRVRUTEVEX1RIUkVTSE9MRCIsImF0b21zVGFuZGVtIiwibGF5ZXJEZXNjcmlwdGlvbiIsImkiLCJhZGRBdG9tUm93IiwiTUFHTklGSUVSX1dJTkRPV19IRUlHSFQiLCJuZXdQb3NpdGlvbiIsIm9sZFBvc2l0aW9uIiwicGhldCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInNldCIsIlpFUk8iLCJnZXQiLCJtaW51cyIsInkiLCJkeCIsImFicyIsIngiLCJuZXdWYWx1ZSIsIm1heCIsInRyeVRvU2hlYXJPZmYiLCJzdGVwIiwiZHQiLCJyZXNldCIsInNldE1heFkiLCJub3RpZnlMaXN0ZW5lcnNTdGF0aWMiLCJhdG9tIiwiY3VycmVudFJvd09mU2hlYXJhYmxlQXRvbXMiLCJub3RZZXRTaGVhcmVkQXRvbXMiLCJmaWx0ZXIiLCJpc1NoZWFyZWRPZmYiLCJhc3NlcnQiLCJhdG9tc1RvU2hlYXJPZmYiLCJzYW1wbGUiLCJzaGVhck9mZiIsImVtaXQiLCJpc0N1cnJlbnRSb3dGdWxseVNoZWFyZWRPZmYiLCJfIiwiZXZlcnkiLCJUSEVSTU9NRVRFUl9NSU5fVEVNUCIsIlRIRVJNT01FVEVSX01BWF9URU1QIiwidmFsdWVUeXBlIiwiZG9jdW1lbnRhdGlvbiIsInN0YXRlU2NoZW1hIiwiQXRvbUlPIiwiZnJpY3Rpb25Nb2RlbCIsInJvd1N0YXJ0WFBvcyIsInJvd1lQb3MiLCJpc1RvcEF0b20iLCJwYXJlbnRUYW5kZW0iLCJzaGVhcmFibGVBdG9tc1JvdyIsIm4iLCJwdXNoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGcmljdGlvbk1vZGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBtb2RlbCBmb3IgdGhlIEZyaWN0aW9uIHNpbS5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMlByb3BlcnR5LmpzJztcclxuaW1wb3J0IFBoZXRpb09iamVjdCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvT2JqZWN0LmpzJztcclxuaW1wb3J0IEFycmF5SU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0FycmF5SU8uanMnO1xyXG5pbXBvcnQgQm9vbGVhbklPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9Cb29sZWFuSU8uanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUlPIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9SZWZlcmVuY2VJTy5qcyc7XHJcbmltcG9ydCBmcmljdGlvbiBmcm9tICcuLi8uLi9mcmljdGlvbi5qcyc7XHJcbmltcG9ydCBGcmljdGlvbkNvbnN0YW50cyBmcm9tICcuLi9GcmljdGlvbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBdG9tIGZyb20gJy4vQXRvbS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQVRPTV9SQURJVVMgPSBGcmljdGlvbkNvbnN0YW50cy5BVE9NX1JBRElVUzsgLy8gcmFkaXVzIG9mIHNpbmdsZSBhdG9tXHJcbmNvbnN0IEFUT01fU1BBQ0lOR19ZID0gMjA7IC8vIHktZGlzdGFuY2UgYmV0d2VlbiBuZWlnaGJvcnMgKGF0b21zKVxyXG5jb25zdCBJTklUSUFMX0FUT01fU1BBQ0lOR19ZID0gMjU7IC8vIGluaXRpYWwgZGlzdGFuY2UgYmV0d2VlbiB0b3AgYW5kIGJvdHRvbSBhdG9tc1xyXG5jb25zdCBWSUJSQVRJT05fQU1QTElUVURFX01JTiA9IDE7IC8vIG1pbiBhbXBsaXR1ZGUgZm9yIGFuIGF0b21cclxuY29uc3QgQU1QTElUVURFX1NIRUFSX09GRiA9IDc7IC8vIGFtcGxpdHVkZSBmb3IgYW4gYXRvbSB0byBzaGVhciBvZmZcclxuY29uc3QgVklCUkFUSU9OX0FNUExJVFVERV9NQVggPSAxMjsgLy8gYXRvbSdzIG1heCBhbXBsaXR1ZGVcclxuY29uc3QgVE9QX0JPT0tfQVRPTVNfQ09MT1IgPSBGcmljdGlvbkNvbnN0YW50cy5UT1BfQk9PS19BVE9NU19DT0xPUjsgLy8gY29sb3Igb2YgdG9wIGJvb2tcclxuY29uc3QgQk9UVE9NX0JPT0tfQVRPTVNfQ09MT1IgPSBGcmljdGlvbkNvbnN0YW50cy5CT1RUT01fQk9PS19BVE9NU19DT0xPUjsgLy8gY29sb3Igb2YgYm90dG9tXHJcbmNvbnN0IENPT0xJTkdfUkFURSA9IDAuMjsgLy8gcHJvcG9ydGlvbiBwZXIgc2Vjb25kOyBhZGp1c3QgaW4gb3JkZXIgdG8gY2hhbmdlIHRoZSBjb29saW5nIHJhdGVcclxuY29uc3QgSEVBVElOR19NVUxUSVBMSUVSID0gMC4wMDc1OyAvLyBtdWx0aXBsaWVkIGJ5IGRpc3RhbmNlIG1vdmVkIHdoaWxlIGluIGNvbnRhY3QgdG8gY29udHJvbCBoZWF0aW5nIHJhdGVcclxuY29uc3QgU0hFQVJfT0ZGX0FNUExJVFVERV9SRURVQ1RJT04gPSAwLjAxOyAvLyBkZWNyZWFzZSBpbiBhbXBsaXR1ZGUgKGEuay5hLiB0ZW1wZXJhdHVyZSkgd2hlbiBhbiBhdG9tIHNoZWFycyBvZmZcclxuY29uc3QgTUFYX1hfRElTUExBQ0VNRU5UID0gNjAwOyAvLyBtYXggYWxsb3dlZCBkaXN0YW5jZSBmcm9tIGNlbnRlciB4XHJcbmNvbnN0IE1JTl9ZX1BPU0lUSU9OID0gLTcwOyAvLyBlbXBpcmljYWxseSBkZXRlcm1pbmVkIHN1Y2ggdGhhdCB0b3AgYm9vayBjYW4ndCBiZSBjb21wbGV0ZWx5IGRyYWdnZWQgb3V0IG9mIGZyYW1lXHJcbmNvbnN0IERFRkFVTFRfUk9XX1NUQVJUX1hfUE9TSVRJT04gPSA1MDtcclxuXHJcbi8vIGF0b21zIG9mIHRvcCBib29rLCBjb250YWlucyA1IHJvd3MsIDQgb2Ygd2hpY2ggY2FuIHNoZWFyIG9mZiBhbmQgMSB0aGF0IGNhbid0XHJcbmNvbnN0IFRPUF9CT09LX0FUT01fU1RSVUNUVVJFID0gW1xyXG5cclxuICAvKlxyXG4gICAqIEZpcnN0IHJvdzpcclxuICAgKiBjb250YWlucyAzMCBhdG9tcyB0aGF0IGNhbiBub3Qgc2hlYXIgb2ZmLlxyXG4gICAqL1xyXG4gIFtcclxuICAgIHsgbnVtOiAzMCB9XHJcbiAgXSxcclxuXHJcbiAgLypcclxuICAgKiBTZWNvbmQgcm93OlxyXG4gICAqIGNvbnRhaW5zIDI5IGF0b21zIHRoYXQgY2FuIHNoZWFyIG9mZi5cclxuICAgKiBIYXZlIGFkZGl0aW9uYWwgb2Zmc2V0IDAuNSBvZiB4LWRpc3RhbmNlIGJldHdlZW4gYXRvbXMgKHRvIG1ha2UgdGhlIGxhdHRpY2Ugb2YgYXRvbXMpLlxyXG4gICAqL1xyXG4gIFtcclxuICAgIHsgb2Zmc2V0OiAwLjUsIG51bTogMjksIGNhblNoZWFyT2ZmOiB0cnVlIH1cclxuICBdLFxyXG5cclxuICAvKlxyXG4gICAqIFRoaXJkIHJvdzpcclxuICAgKiBjb250YWlucyAyOSBhdG9tcyB0aGF0IGNhbiBzaGVhciBvZmYuXHJcbiAgICovXHJcbiAgW1xyXG4gICAgeyBudW06IDI5LCBjYW5TaGVhck9mZjogdHJ1ZSB9XHJcbiAgXSxcclxuXHJcbiAgLypcclxuICAgKiBGb3VydGggcm93OlxyXG4gICAqIGNvbnRhaW5zIDI0IGF0b21zLCBzZXBhcmF0ZWQgaW50byA1IGdyb3VwcyB0aGF0IGNhbiBzaGVhciBvZmYuXHJcbiAgICogSGF2ZSBhZGRpdGlvbmFsIG9mZnNldCAwLjUgb2YgeC1kaXN0YW5jZSBiZXR3ZWVuIGF0b21zICh0byBtYWtlIHRoZSBsYXR0aWNlIG9mIGF0b21zKS5cclxuICAgKi9cclxuICBbXHJcbiAgICB7IG9mZnNldDogMC41LCBudW06IDUsIGNhblNoZWFyT2ZmOiB0cnVlIH0sXHJcbiAgICB7IG9mZnNldDogNi41LCBudW06IDgsIGNhblNoZWFyT2ZmOiB0cnVlIH0sXHJcbiAgICB7IG9mZnNldDogMTUuNSwgbnVtOiA1LCBjYW5TaGVhck9mZjogdHJ1ZSB9LFxyXG4gICAgeyBvZmZzZXQ6IDIxLjUsIG51bTogNSwgY2FuU2hlYXJPZmY6IHRydWUgfSxcclxuICAgIHsgb2Zmc2V0OiAyNy41LCBudW06IDEsIGNhblNoZWFyT2ZmOiB0cnVlIH1cclxuICBdLFxyXG5cclxuICAvKlxyXG4gICAqIEZpZnRoIHJvdzpcclxuICAgKiBjb250YWlucyA5IGF0b21zLCBzZXBhcmF0ZWQgaW50byA1IGdyb3VwcyB0aGF0IGNhbiBzaGVhciBvZmYuXHJcbiAgICovXHJcbiAgW1xyXG4gICAgeyBvZmZzZXQ6IDMsIG51bTogMiwgY2FuU2hlYXJPZmY6IHRydWUgfSxcclxuICAgIHsgb2Zmc2V0OiA4LCBudW06IDEsIGNhblNoZWFyT2ZmOiB0cnVlIH0sXHJcbiAgICB7IG9mZnNldDogMTIsIG51bTogMiwgY2FuU2hlYXJPZmY6IHRydWUgfSxcclxuICAgIHsgb2Zmc2V0OiAxNywgbnVtOiAyLCBjYW5TaGVhck9mZjogdHJ1ZSB9LFxyXG4gICAgeyBvZmZzZXQ6IDI0LCBudW06IDIsIGNhblNoZWFyT2ZmOiB0cnVlIH1cclxuICBdXHJcbl07XHJcblxyXG4vLyBhdG9tcyBvZiBib3R0b20gYm9vayAoY29udGFpbnMgMyByb3dzIHRoYXQgY2FuIG5vdCBzaGVhciBvZmYpXHJcbmNvbnN0IEJPVFRPTV9CT09LX0FUT01fU1RSVUNUVVJFID0gW1xyXG5cclxuICAvKlxyXG4gICAqIEZpcnN0IHJvdzpcclxuICAgKiBjb250YWlucyAyOSBhdG9tcyB0aGF0IGNhbiBub3Qgc2hlYXIgb2ZmLlxyXG4gICAqL1xyXG4gIFtcclxuICAgIHsgbnVtOiAyOSB9XHJcbiAgXSxcclxuXHJcbiAgLypcclxuICAgKiBTZWNvbmQgcm93OlxyXG4gICAqIGNvbnRhaW5zIDI4IGF0b21zIHRoYXQgY2FuIG5vdCBzaGVhciBvZmYuXHJcbiAgICogSGF2ZSBhZGRpdGlvbmFsIG9mZnNldCAwLjUgb2YgeC1kaXN0YW5jZSBiZXR3ZWVuIGF0b21zICh0byBtYWtlIHRoZSBsYXR0aWNlIG9mIGF0b21zKS5cclxuICAgKi9cclxuICBbXHJcbiAgICB7IG9mZnNldDogMC41LCBudW06IDI4IH1cclxuICBdLFxyXG5cclxuICAvKlxyXG4gICAqIFRoaXJkIHJvdzpcclxuICAgKiBjb250YWlucyAyOSBhdG9tcyB0aGF0IGNhbiBub3Qgc2hlYXIgb2ZmLlxyXG4gICAqL1xyXG4gIFtcclxuICAgIHsgbnVtOiAyOSB9XHJcbiAgXVxyXG5dO1xyXG5cclxuXHJcbi8vIHBkb21cclxuLy8gaXRlcmF0ZSB0aHJvdWdoIHRoZSBjb25zdGFudCB0byBkZXRlcm1pbmUgdGhlIG51bWJlciBvZiBhdG9tcyB0aGF0IGNhbiBzaGVhciBvZmYgZnJvbSB0aGUgdG9wIGJvb2sgc3RydWN0dXJlXHJcbmxldCBhdG9tcyA9IDA7XHJcblRPUF9CT09LX0FUT01fU1RSVUNUVVJFLmZvckVhY2goIHJvdyA9PiB7XHJcbiAgcm93LmZvckVhY2goIHNjaGVtYSA9PiB7XHJcbiAgICBpZiAoIHNjaGVtYS5jYW5TaGVhck9mZiApIHtcclxuICAgICAgYXRvbXMgKz0gc2NoZW1hLm51bTtcclxuICAgIH1cclxuICB9ICk7XHJcbn0gKTtcclxuXHJcbi8vIHRoZSBudW1iZXIgb2Ygc2hlYXJhYmxlIGF0b21zIGluIHRoZSB0b3AgYm9va1xyXG5jb25zdCBOVU1CRVJfT0ZfU0hFQVJBQkxFX0FUT01TID0gYXRvbXM7XHJcblxyXG4vLyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbmF0dXJlIG9mIHRoZSBhdG9tcyB0aGF0IHdpbGwgYmUgc2hvd24gaW4gdGhlIG1hZ25pZmllciB3aW5kb3dcclxuY29uc3QgTUFHTklGSUVEX0FUT01TX0lORk8gPSB7XHJcbiAgcmFkaXVzOiBBVE9NX1JBRElVUyxcclxuICBkaXN0YW5jZVg6IEZyaWN0aW9uQ29uc3RhbnRzLklOSVRJQUxfQVRPTV9TUEFDSU5HX1gsXHJcbiAgZGlzdGFuY2VZOiBGcmljdGlvbkNvbnN0YW50cy5JTklUSUFMX0FUT01fU1BBQ0lOR19ZLFxyXG4gIGRpc3RhbmNlOiBJTklUSUFMX0FUT01fU1BBQ0lOR19ZLFxyXG4gIHZpYnJhdGlvbkFtcGxpdHVkZTogbmV3IFJhbmdlKCBWSUJSQVRJT05fQU1QTElUVURFX01JTiwgVklCUkFUSU9OX0FNUExJVFVERV9NQVggKSxcclxuICBzaGVhcmluZ0xpbWl0OiBBTVBMSVRVREVfU0hFQVJfT0ZGLFxyXG4gIHRvcDoge1xyXG4gICAgY29sb3I6IFRPUF9CT09LX0FUT01TX0NPTE9SLFxyXG4gICAgbGF5ZXJEZXNjcmlwdGlvbnM6IFRPUF9CT09LX0FUT01fU1RSVUNUVVJFXHJcbiAgfSxcclxuICBib3R0b206IHtcclxuICAgIGNvbG9yOiBCT1RUT01fQk9PS19BVE9NU19DT0xPUixcclxuICAgIGxheWVyRGVzY3JpcHRpb25zOiBCT1RUT01fQk9PS19BVE9NX1NUUlVDVFVSRVxyXG4gIH1cclxufTtcclxuXHJcbmNsYXNzIEZyaWN0aW9uTW9kZWwgZXh0ZW5kcyBQaGV0aW9PYmplY3Qge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gd2lkdGggLSB3aWR0aCBpbiB2aWV3PW1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCAtIGhlaWdodCBpbiB2aWV3PW1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB3aWR0aCwgaGVpZ2h0LCB0YW5kZW0gKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcbiAgICAgIHBoZXRpb1R5cGU6IEZyaWN0aW9uTW9kZWwuRnJpY3Rpb25Nb2RlbElPXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyfSAtIHRoZSB3aWR0aCBmb3IgdGhlIG1vZGVsIGluIG1vZGVsIGNvb3JkaW5hdGVzXHJcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7TnVtYmVyfSAtIHRoZSBoZWlnaHQgZm9yIHRoZSBtb2RlbCBpbiBtb2RlbCBjb29yZGluYXRlc1xyXG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge051bWJlcn0gLSB0cmFjayBob3cgbXVjaCB0byBzaGVhciBvZmYgaW4gc3RlcCgpIHRvIHByZXZlbnQgYSBQcm9wZXJ0eSBsb29wXHJcbiAgICB0aGlzLnNjaGVkdWxlZFNoZWFyaW5nQW1vdW50ID0gMDtcclxuXHJcbiAgICAvLyBAcHVibGljIChwaGV0LWlvKSAtIEluc3RydW1lbnRlZCBzbyB0aGF0IFBoRVQtaU8gY2xpZW50cyBjYW4gZ2V0IGEgbWVzc2FnZSB3aGVuIGFuIGF0b20gc2hlYXJzIG9mZlxyXG4gICAgdGhpcy5zaGVhcmVkT2ZmRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NoZWFyZWRPZmZFbWl0dGVyJyApLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnRW1pdHMgd2hlbiBhdG9tcyBzaGVhciBvZmYgZnJvbSB0aGUgdG9wIGJvb2snLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge0F0b21bXVtdfS0gYXJyYXkgb2YgYWxsIGF0b21zIHdoaWNoIGFyZSBhYmxlIHRvIHNoZWFyIG9mZiBvcmdhbml6ZWQgYnkgcm93IHN1Y2ggdGhhdCB0aGVcclxuICAgIC8vIGxhc3Qgcm93cyBzaG91bGQgYmUgc2hlYXJlZCBvZmYgZmlyc3RcclxuICAgIHRoaXMuc2hlYXJhYmxlQXRvbXNCeVJvdyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fSAtIGF0b21zIHRlbXBlcmF0dXJlID0gYW1wbGl0dWRlIG9mIG9zY2lsbGF0aW9uXHJcbiAgICB0aGlzLnZpYnJhdGlvbkFtcGxpdHVkZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBNQUdOSUZJRURfQVRPTVNfSU5GTy52aWJyYXRpb25BbXBsaXR1ZGUubWluLCB7XHJcbiAgICAgIHJhbmdlOiBNQUdOSUZJRURfQVRPTVNfSU5GTy52aWJyYXRpb25BbXBsaXR1ZGUsXHJcblxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ0EgcmVsYXRpdmUsIHF1YWxpdGF0aXZlIHZhbHVlIGRlc2NyaWJpbmcgdGhlIGFtb3VudCBvZiB2aWJyYXRpb24gb2YgdGhlIGF0b21zJyxcclxuICAgICAgcGhldGlvSGlnaEZyZXF1ZW5jeTogdHJ1ZSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIC0gcG9zaXRpb24gb2YgdG9wIGJvb2ssIGNhbiBieSBkcmFnZ2VkIHRoZSB1c2VyXHJcbiAgICB0aGlzLnRvcEJvb2tQb3NpdGlvblByb3BlcnR5ID0gbmV3IFZlY3RvcjJQcm9wZXJ0eSggbmV3IFZlY3RvcjIoIDAsIDAgKSwge1xyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIHBvc2l0aW9uIG9mIHRoZSB0b3AgYm9vay4gSW4gdmlldyBjb29yZGluYXRlcyAobW9kZWwgYW5kIHZpZXcgY29vcmRpbmF0ZXMgYXJlIHRoZSBzYW1lIGluIHRoaXMgc2ltdWxhdGlvbikuJyxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndG9wQm9va1Bvc2l0aW9uUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb0hpZ2hGcmVxdWVuY3k6IHRydWVcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJQcm9wZXJ0eX0gLSBkaXN0YW5jZSBiZXR3ZWVuIGJvb2tzXHJcbiAgICB0aGlzLmRpc3RhbmNlQmV0d2VlbkJvb2tzUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIE1BR05JRklFRF9BVE9NU19JTkZPLmRpc3RhbmNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2Rpc3RhbmNlQmV0d2VlbkJvb2tzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9IaWdoRnJlcXVlbmN5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGVkZ2VzIG9mIHRoZSB0d28gYm9va3MuIEluIHZpZXcgY29vcmRpbmF0ZXMuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgLSBUaGUgZHJhZ2dhYmxlIGJvdW5kcyBvZiB0aGUgdG9wIGJvb2suIFRoaXMgQm91bmRzMiBpbnN0YW5jZSBpcyBuZXZlciBjaGFuZ2VkLCBidXQgb25seSBtdXRhdGVkLlxyXG4gICAgLy8gRWFjaCBtdXRhdGlvbiB0cmlnZ2VycyBsaXN0ZW5lciBub3RpZmljYXRpb24gKHdpdGhvdXQgYW4gXCJvbGRWYWx1ZVwiIHBhcmFtKS5cclxuICAgIHRoaXMudG9wQm9va0RyYWdCb3VuZHNQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IEJvdW5kczIoXHJcbiAgICAgIC1NQVhfWF9ESVNQTEFDRU1FTlQsIC8vIGxlZnQgYm91bmRcclxuICAgICAgTUlOX1lfUE9TSVRJT04sIC8vIHRvcCBib3VuZFxyXG4gICAgICBNQVhfWF9ESVNQTEFDRU1FTlQsIC8vIHJpZ2h0IGJvdW5kXHJcbiAgICAgIHRoaXMuZGlzdGFuY2VCZXR3ZWVuQm9va3NQcm9wZXJ0eS52YWx1ZSApLCB7XHJcbiAgICAgIHBoZXRpb1ZhbHVlVHlwZTogQm91bmRzMi5Cb3VuZHMySU8sXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RvcEJvb2tEcmFnQm91bmRzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnVGhlIGRyYWdnYWJsZSBib3VuZHMgb2YgdGhlIHRvcCBib29rLiBUaGlzIGNoYW5nZXMgYXMgcm93cyBvZiBhdG9tcyBzaGVhciBvZmYuJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkge051bWJlclByb3BlcnR5fSAtXHJcbiAgICB0aGlzLmF0b21Sb3dzVG9TaGVhck9mZlByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCBUT1BfQk9PS19BVE9NX1NUUlVDVFVSRS5sZW5ndGggLSAxLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21Sb3dzVG9TaGVhck9mZlByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSBudW1iZXIgb2Ygcm93cyBvZiBhdG9tcyBhdmFpbGFibGUgdG8gc2hlYXIgb2ZmLCBnb2VzIGRvd24gYXMgYXRvbSByb3dzIHNoZWFyIG9mZidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSAtIGFyZSBib29rcyBpbiBjb250YWN0P1xyXG4gICAgdGhpcy5jb250YWN0UHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMuZGlzdGFuY2VCZXR3ZWVuQm9va3NQcm9wZXJ0eSBdLFxyXG4gICAgICBkaXN0YW5jZSA9PiBNYXRoLmZsb29yKCBkaXN0YW5jZSApIDw9IDAsIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250YWN0UHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb29sZWFuSU8sXHJcbiAgICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoaXMgUHJvcGVydHkgd2lsbCBiZSB0cnVlIHdoZW4gdGhlIHR3byBib29rcyBhcmUgaW4gY29udGFjdCwgd2l0aCBub3Qgc3BhY2UgYmV0d2VlbiB0aGVpciBhdG9tcy4nXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtCb29sZWFuUHJvcGVydHl9IC0gU2hvdyBoaW50IGljb24uIE9ubHkgc2V0IGJ5IG1vZGVsIGFuZCBvbiBhMTF5IGdyYWIgaW50ZXJhY3Rpb24uXHJcbiAgICB0aGlzLmhpbnRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaGludFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3doZXRoZXIgb3Igbm90IHRoZSBzaW0gaXMgY29udmV5aW5nIHRoZSBoaW50IGFycm93cy4gVGhpcyBpcyBub3QgZWRpdGFibGUsIGJ1dCBjYW4gYmUgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICdvdmVycmlkZGVuIGJ5IHRvZ2dsaW5nIHRoZSBcImhpbnRBcnJvd3NOb2RlLnZpc2libGVQcm9wZXJ0eVwiIGluIHRoZSB2aWV3LidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtOdW1iZXJ9IChyZWFkLW9ubHkpIC0gZHJhZyBhbmQgZHJvcCBib29rIGNvb3JkaW5hdGVzIGNvbnZlcnNpb24gY29lZmZpY2llbnRcclxuICAgIHRoaXMuYm9va0RyYWdnaW5nU2NhbGVGYWN0b3IgPSAwLjAyNTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtBdG9tW119IC0gYXJyYXkgb2YgYXRvbXMgdGhhdCBhcmUgdmlzaWJsZSB0byB0aGUgdXNlciBpbiB0aGUgbWFnbmlmaWVyIHdpbmRvd1xyXG4gICAgdGhpcy5hdG9tcyA9IFtdO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIC8vIHtudW1iZXJ9IHRoZSBjb3VudCBvZiBob3cgbWFueSBhdG9tcyBoYXZlIGJlZW4gc2hlYXJlZCBvZmZcclxuICAgIHRoaXMubnVtYmVyT2ZBdG9tc1NoZWFyZWRPZmZQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJPZkF0b21zU2hlYXJlZE9mZlByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ1RoZSB0b3RhbCBudW1iZXIgb2YgYXRvbXMgdGhhdCBoYXZlIGJlZW4gc2hlYXJlZCBvZmYgb2YgdGhlIHRvcCBib29rLidcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNoZWFyZWRPZmZFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHRoaXMubnVtYmVyT2ZBdG9tc1NoZWFyZWRPZmZQcm9wZXJ0eS52YWx1ZSArPSAxO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSlcclxuICAgIC8vIHtib29sZWFufSAtIGhhcyB0aGUgYXRvbSBiZWVuIFwic3VjY2Vzc2Z1bGx5XCIgaW50ZXJhY3RlZCB3aXRoLiBUaGlzIHN1YmplY3RpdmUgdGVybSBpcyBkZWZpbmVkIGJhc2VkIG9uIHRoZVxyXG4gICAgLy8gcGVkYWdvZ2ljYWwgZ29hbHMgb2YgdGhlIHNpbSAodG8gcnViIHRoZSBvdGhlciBib29rKVxyXG4gICAgdGhpcy5zdWNjZXNzZnVsbHlJbnRlcmFjdGVkV2l0aFByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3VjY2Vzc2Z1bGx5SW50ZXJhY3RlZFdpdGhQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdUaGlzIHNvbWV3aGF0IHN1YmplY3RpdmUgdGVybSBpcyBkZWZpbmVkIGJhc2VkIG9uIHRoZSBwZWRhZ29naWNhbCBnb2FscyBvZiB0aGUgc2ltLCB3aGljaCAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2lzIHRvIHJ1YiB0aGUgYm9vayBvbiB0aGUgb3RoZXIgdG8gbWFrZSBmcmljdGlvbi4gVGhpcyBQcm9wZXJ0eSB3aWxsIGJlIHRydWUgd2hlbiBhbnkgYW1vdW50ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAnb2YgZnJpY3Rpb24gaXMgY3JlYXRlZC4nXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy52aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eS5saW5rKCBhbXBsaXR1ZGUgPT4ge1xyXG4gICAgICBpZiAoICF0aGlzLnN1Y2Nlc3NmdWxseUludGVyYWN0ZWRXaXRoUHJvcGVydHkudmFsdWUgJiYgYW1wbGl0dWRlID4gRnJpY3Rpb25Nb2RlbC5BTVBMSVRVREVfU0VUVExFRF9USFJFU0hPTEQgKSB7XHJcbiAgICAgICAgdGhpcy5zdWNjZXNzZnVsbHlJbnRlcmFjdGVkV2l0aFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGF0b21zVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21zJyApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgYXRvbXMgdGhhdCBhcmUgdmlzaWJsZSBpbiB0aGUgdG9wIGJvb2tcclxuICAgIE1BR05JRklFRF9BVE9NU19JTkZPLnRvcC5sYXllckRlc2NyaXB0aW9ucy5mb3JFYWNoKCAoIGxheWVyRGVzY3JpcHRpb24sIGkgKSA9PiB7XHJcbiAgICAgIGFkZEF0b21Sb3coXHJcbiAgICAgICAgdGhpcyxcclxuICAgICAgICBsYXllckRlc2NyaXB0aW9uLFxyXG4gICAgICAgIERFRkFVTFRfUk9XX1NUQVJUX1hfUE9TSVRJT04sXHJcbiAgICAgICAgRnJpY3Rpb25Db25zdGFudHMuTUFHTklGSUVSX1dJTkRPV19IRUlHSFQgLyAzIC0gSU5JVElBTF9BVE9NX1NQQUNJTkdfWSArIEFUT01fU1BBQ0lOR19ZICogaSxcclxuICAgICAgICB0cnVlLCAvLyBpc1RvcEF0b21cclxuICAgICAgICBhdG9tc1RhbmRlbVxyXG4gICAgICApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGFkZCB0aGUgYXRvbXMgdGhhdCBhcmUgdmlzaWJsZSBpbiB0aGUgYm90dG9tIGJvb2tcclxuICAgIE1BR05JRklFRF9BVE9NU19JTkZPLmJvdHRvbS5sYXllckRlc2NyaXB0aW9ucy5mb3JFYWNoKCAoIGxheWVyRGVzY3JpcHRpb24sIGkgKSA9PiB7XHJcbiAgICAgIGFkZEF0b21Sb3coXHJcbiAgICAgICAgdGhpcyxcclxuICAgICAgICBsYXllckRlc2NyaXB0aW9uLFxyXG4gICAgICAgIERFRkFVTFRfUk9XX1NUQVJUX1hfUE9TSVRJT04sXHJcbiAgICAgICAgMiAqIEZyaWN0aW9uQ29uc3RhbnRzLk1BR05JRklFUl9XSU5ET1dfSEVJR0hUIC8gMyArIEFUT01fU1BBQ0lOR19ZICogaSxcclxuICAgICAgICBmYWxzZSwgLy8gaXNUb3BBdG9tXHJcbiAgICAgICAgYXRvbXNUYW5kZW1cclxuICAgICAgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzZXQgZGlzdGFuY2UgYmV0d2VlbiBhdG9tcyBhbmQgc2V0IHRoZSBhbXBsaXR1ZGUgaWYgdGhleSBhcmUgaW4gY29udGFjdFxyXG4gICAgdGhpcy50b3BCb29rUG9zaXRpb25Qcm9wZXJ0eS5saW5rKCAoIG5ld1Bvc2l0aW9uLCBvbGRQb3NpdGlvbiApID0+IHtcclxuXHJcbiAgICAgIC8vIGRvbid0IGRvIGZ1cnRoZXIgY2FsY3VsYXRpb25zIGlmIHNldHRpbmcgc3RhdGVcclxuICAgICAgaWYgKCAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLmhpbnRQcm9wZXJ0eS5zZXQoIGZhbHNlICk7XHJcblxyXG4gICAgICAgIG9sZFBvc2l0aW9uID0gb2xkUG9zaXRpb24gfHwgVmVjdG9yMi5aRVJPO1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2VCZXR3ZWVuQm9va3NQcm9wZXJ0eS5zZXQoIHRoaXMuZGlzdGFuY2VCZXR3ZWVuQm9va3NQcm9wZXJ0eS5nZXQoKSAtICggbmV3UG9zaXRpb24ubWludXMoIG9sZFBvc2l0aW9uICkgKS55ICk7XHJcbiAgICAgICAgaWYgKCB0aGlzLmNvbnRhY3RQcm9wZXJ0eS5nZXQoKSApIHtcclxuICAgICAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMoIG5ld1Bvc2l0aW9uLnggLSBvbGRQb3NpdGlvbi54ICk7XHJcbiAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMudmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkuZ2V0KCkgKyBkeCAqIEhFQVRJTkdfTVVMVElQTElFUjtcclxuICAgICAgICAgIHRoaXMudmlicmF0aW9uQW1wbGl0dWRlUHJvcGVydHkuc2V0KCBNYXRoLm1pbiggbmV3VmFsdWUsIE1BR05JRklFRF9BVE9NU19JTkZPLnZpYnJhdGlvbkFtcGxpdHVkZS5tYXggKSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNoZWFyaW5nIGNoZWNrXHJcbiAgICB0aGlzLnZpYnJhdGlvbkFtcGxpdHVkZVByb3BlcnR5LmxpbmsoIGFtcGxpdHVkZSA9PiB7XHJcbiAgICAgIGlmICggYW1wbGl0dWRlID4gTUFHTklGSUVEX0FUT01TX0lORk8uc2hlYXJpbmdMaW1pdCAmJiAhcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLnRyeVRvU2hlYXJPZmYoKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZSBmb3J3YXJkIGluIHRpbWVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gZHQgLSBpbiBzZWNvbmRzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHN0ZXAoIGR0ICkge1xyXG5cclxuICAgIC8vIHN0ZXAgdGhlIGF0b21zLCB3aGljaCBpcyBob3cgdGhleSB2aWJyYXRlIGFuZCBtb3ZlIGF3YXkgaWYgdGhleSBzaGVhciBvZmZcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuYXRvbXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgIHRoaXMuYXRvbXNbIGkgXS5zdGVwKCBkdCApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvb2wgdGhlIGF0b21zXHJcbiAgICBsZXQgYW1wbGl0dWRlID0gdGhpcy52aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eS5nZXQoKSAtIHRoaXMuc2NoZWR1bGVkU2hlYXJpbmdBbW91bnQ7XHJcbiAgICBhbXBsaXR1ZGUgPSBNYXRoLm1heCggTUFHTklGSUVEX0FUT01TX0lORk8udmlicmF0aW9uQW1wbGl0dWRlLm1pbiwgYW1wbGl0dWRlICogKCAxIC0gZHQgKiBDT09MSU5HX1JBVEUgKSApO1xyXG4gICAgdGhpcy52aWJyYXRpb25BbXBsaXR1ZGVQcm9wZXJ0eS5zZXQoIGFtcGxpdHVkZSApO1xyXG5cclxuICAgIHRoaXMuc2NoZWR1bGVkU2hlYXJpbmdBbW91bnQgPSAwO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVzdG9yZXMgdGhlIGluaXRpYWwgY29uZGl0aW9ucy5cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnZpYnJhdGlvbkFtcGxpdHVkZVByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnRvcEJvb2tQb3NpdGlvblByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLmRpc3RhbmNlQmV0d2VlbkJvb2tzUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudG9wQm9va0RyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZS5zZXRNYXhZKCB0aGlzLmRpc3RhbmNlQmV0d2VlbkJvb2tzUHJvcGVydHkudmFsdWUgKTtcclxuICAgIHRoaXMudG9wQm9va0RyYWdCb3VuZHNQcm9wZXJ0eS5ub3RpZnlMaXN0ZW5lcnNTdGF0aWMoKTsgLy8gSnVzdCB0byBiZSBzYWZlXHJcbiAgICB0aGlzLmF0b21Sb3dzVG9TaGVhck9mZlByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnN1Y2Nlc3NmdWxseUludGVyYWN0ZWRXaXRoUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuaGludFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm51bWJlck9mQXRvbXNTaGVhcmVkT2ZmUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuYXRvbXMuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIGF0b20ucmVzZXQoKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIGRldGVybWluZSB3aGV0aGVyIGFuIGF0b20gaXMgYXZhaWxhYmxlIHRvIGJlIHNoZWFyZWQgb2ZmIGFuZCwgaWYgc28sIHNoZWFyIG9mZiBpdFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdHJ5VG9TaGVhck9mZigpIHtcclxuXHJcbiAgICAvLyBvbmx5IGlmIHRoaXMgdmFsdWUgcG9pbnRzIHRvIGEgcHJvcGVyIGluZGV4IGluIHNoZWFyYWJsZUF0b21zQnlSb3cuIElmIG5lZ2F0aXZlLCB0aGVyZSBhcmUgbGlrZWx5IG5vIG1vcmUgc2hlYXJhYmxlIHJvd3NcclxuICAgIGlmICggdGhpcy5hdG9tUm93c1RvU2hlYXJPZmZQcm9wZXJ0eS5nZXQoKSA+IDAgKSB7XHJcblxyXG4gICAgICAvLyBkZXRlcm1pbmUgd2hldGhlciB0aGUgY3VycmVudCByb3cgaXMgZnVsbHkgc2hlYXJlZCBvZmYgYW5kLCBpZiBzbywgbW92ZSB0byB0aGUgbmV4dCByb3dcclxuICAgICAgY29uc3QgY3VycmVudFJvd09mU2hlYXJhYmxlQXRvbXMgPSB0aGlzLnNoZWFyYWJsZUF0b21zQnlSb3dbIHRoaXMuYXRvbVJvd3NUb1NoZWFyT2ZmUHJvcGVydHkuZ2V0KCkgLSAxIF07XHJcblxyXG4gICAgICAvLyBpZiB0aGVyZSBhcmUgYW55IHJvd3Mgb2Ygc2hlYXJhYmxlIGF0b21zIGxlZnQsIHNoZWFyIG9mZiBvbmVcclxuICAgICAgaWYgKCBjdXJyZW50Um93T2ZTaGVhcmFibGVBdG9tcy5sZW5ndGggPiAwICkge1xyXG5cclxuICAgICAgICAvLyBtYWtlIGEgbGlzdCBvZiBhbGwgYXRvbXMgaW4gdGhpcyByb3cgdGhhdCBoYXZlIG5vdCB5ZXQgc2hlYXJlZCBvZmZcclxuICAgICAgICBjb25zdCBub3RZZXRTaGVhcmVkQXRvbXMgPSBjdXJyZW50Um93T2ZTaGVhcmFibGVBdG9tcy5maWx0ZXIoIGF0b20gPT4gIWF0b20uaXNTaGVhcmVkT2ZmICk7XHJcblxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoXHJcbiAgICAgICAgICBub3RZZXRTaGVhcmVkQXRvbXMubGVuZ3RoID4gMCxcclxuICAgICAgICAgICdzaG91bGQgbmV2ZXIgZW5jb3VudGVyIHRoaXMgY2FzZSwgaWYgd2UgZG8sIHNvbWV0aGluZyBpcyB3cm9uZyBpbiBsb2dpYyBhYm92ZSdcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyByYW5kb21seSBjaG9vc2UgYW4gbm9uLXNoZWFyZWQtb2ZmIGF0b20gYW5kIHNoZWFyIG9mZiBpdFxyXG4gICAgICAgIGNvbnN0IGF0b21zVG9TaGVhck9mZiA9IGRvdFJhbmRvbS5zYW1wbGUoIG5vdFlldFNoZWFyZWRBdG9tcyApO1xyXG4gICAgICAgIGF0b21zVG9TaGVhck9mZi5zaGVhck9mZigpO1xyXG4gICAgICAgIHRoaXMuc2hlYXJlZE9mZkVtaXR0ZXIuZW1pdCgpO1xyXG5cclxuICAgICAgICAvLyBjYXVzZSBzb21lIGNvb2xpbmcgZHVlIHRvIHNoZWFyaW5nXHJcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRTaGVhcmluZ0Ftb3VudCA9IHRoaXMuc2NoZWR1bGVkU2hlYXJpbmdBbW91bnQgKyBTSEVBUl9PRkZfQU1QTElUVURFX1JFRFVDVElPTjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgaXNDdXJyZW50Um93RnVsbHlTaGVhcmVkT2ZmID0gXy5ldmVyeSggY3VycmVudFJvd09mU2hlYXJhYmxlQXRvbXMsIGF0b20gPT4gYXRvbS5pc1NoZWFyZWRPZmYgKTtcclxuXHJcbiAgICAgIC8vIGlmIGFsbCBhdG9tcyBpbiB0aGlzIHJvdyBhcmUgc2hlYXJlZCBvZmYsIG1vdmUgb24gdG8gdGhlIG5leHQgcm93XHJcbiAgICAgIGlmICggaXNDdXJyZW50Um93RnVsbHlTaGVhcmVkT2ZmICkge1xyXG5cclxuICAgICAgICAvLyBwb2ludCBvbmUgcm93IGhpZ2hlciBiZWNhdXNlIGFsbCBvZiB0aGUgcHJldmlvdXMgcm93IGlzIHNoZWFyZWQgb2ZmXHJcbiAgICAgICAgdGhpcy5hdG9tUm93c1RvU2hlYXJPZmZQcm9wZXJ0eS5zZXQoIHRoaXMuYXRvbVJvd3NUb1NoZWFyT2ZmUHJvcGVydHkuZ2V0KCkgLSAxICk7XHJcblxyXG4gICAgICAgIC8vIHRoZSBjdXJyZW50IHJvdyBpcyB0b3RhbGx5IHNoZWFyZWQgb2ZmLCBzbyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0aGUgYm9va3MganVzdCBpbmNyZWFzZWQgXCJvbmUgcm93XCIgd29ydGguXHJcbiAgICAgICAgdGhpcy5kaXN0YW5jZUJldHdlZW5Cb29rc1Byb3BlcnR5LnNldCggdGhpcy5kaXN0YW5jZUJldHdlZW5Cb29rc1Byb3BlcnR5LmdldCgpICsgTUFHTklGSUVEX0FUT01TX0lORk8uZGlzdGFuY2VZICk7XHJcblxyXG4gICAgICAgIHRoaXMudG9wQm9va0RyYWdCb3VuZHNQcm9wZXJ0eS52YWx1ZS5zZXRNYXhZKCB0aGlzLnRvcEJvb2tEcmFnQm91bmRzUHJvcGVydHkudmFsdWUuYm90dG9tICsgTUFHTklGSUVEX0FUT01TX0lORk8uZGlzdGFuY2VZICk7XHJcbiAgICAgICAgdGhpcy50b3BCb29rRHJhZ0JvdW5kc1Byb3BlcnR5Lm5vdGlmeUxpc3RlbmVyc1N0YXRpYygpOyAvLyBKdXN0IHRvIGJlIHNhZmVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vIHN0YXRpY3NcclxuRnJpY3Rpb25Nb2RlbC5NQUdOSUZJRURfQVRPTVNfSU5GTyA9IE1BR05JRklFRF9BVE9NU19JTkZPO1xyXG5GcmljdGlvbk1vZGVsLlRIRVJNT01FVEVSX01JTl9URU1QID0gTUFHTklGSUVEX0FUT01TX0lORk8udmlicmF0aW9uQW1wbGl0dWRlLm1pbiAtIDEuMDU7IC8vIGFib3V0IDBcclxuRnJpY3Rpb25Nb2RlbC5USEVSTU9NRVRFUl9NQVhfVEVNUCA9IE1BR05JRklFRF9BVE9NU19JTkZPLnNoZWFyaW5nTGltaXQgKiAxLjE7IC8vIH43LjdcclxuXHJcbi8vIHBkb21cclxuRnJpY3Rpb25Nb2RlbC5OVU1CRVJfT0ZfU0hFQVJBQkxFX0FUT01TID0gTlVNQkVSX09GX1NIRUFSQUJMRV9BVE9NUztcclxuXHJcbi8vIHBkb21cclxuRnJpY3Rpb25Nb2RlbC5WSUJSQVRJT05fQU1QTElUVURFX01JTiA9IFZJQlJBVElPTl9BTVBMSVRVREVfTUlOO1xyXG5GcmljdGlvbk1vZGVsLlZJQlJBVElPTl9BTVBMSVRVREVfTUFYID0gVklCUkFUSU9OX0FNUExJVFVERV9NQVg7XHJcblxyXG4vLyBwZG9tIC0gZW1waXJpY2FsbHkgZGV0ZXJtaW5lZCB2YWx1ZSBvZiB3aGVuIHRoZSBhdG9tcyBhcmUgXCJwcmV0dHkgbXVjaCBjb29sIGFuZCBzZXR0bGVkXCJcclxuRnJpY3Rpb25Nb2RlbC5BTVBMSVRVREVfU0VUVExFRF9USFJFU0hPTEQgPSBWSUJSQVRJT05fQU1QTElUVURFX01JTiArIDAuNDtcclxuXHJcbkZyaWN0aW9uTW9kZWwuRnJpY3Rpb25Nb2RlbElPID0gbmV3IElPVHlwZSggJ0ZyaWN0aW9uTW9kZWxJTycsIHtcclxuICB2YWx1ZVR5cGU6IEZyaWN0aW9uTW9kZWwsXHJcbiAgZG9jdW1lbnRhdGlvbjogJ21vZGVsIGZvciB0aGUgc2ltdWxhdGlvbicsXHJcbiAgc3RhdGVTY2hlbWE6IHtcclxuICAgIHdpZHRoOiBOdW1iZXJJTyxcclxuICAgIGhlaWdodDogTnVtYmVySU8sXHJcbiAgICBib29rRHJhZ2dpbmdTY2FsZUZhY3RvcjogTnVtYmVySU8sXHJcbiAgICBzY2hlZHVsZWRTaGVhcmluZ0Ftb3VudDogTnVtYmVySU8sXHJcbiAgICBzaGVhcmFibGVBdG9tc0J5Um93OiBBcnJheUlPKCBBcnJheUlPKCBSZWZlcmVuY2VJTyggQXRvbS5BdG9tSU8gKSApICksXHJcbiAgICBhdG9tczogQXJyYXlJTyggUmVmZXJlbmNlSU8oIEF0b20uQXRvbUlPICkgKVxyXG4gIH1cclxufSApO1xyXG5cclxuLy8gaGVscGVyIGZ1bmN0aW9uIHRvIGFkZCBhIGxheWVyIG9mIGF0b21zIHRvIHRoZSBtb2RlbFxyXG5mdW5jdGlvbiBhZGRBdG9tUm93KCBmcmljdGlvbk1vZGVsLCBsYXllckRlc2NyaXB0aW9uLCByb3dTdGFydFhQb3MsIHJvd1lQb3MsIGlzVG9wQXRvbSwgcGFyZW50VGFuZGVtICkge1xyXG5cclxuICBsZXQgY2FuU2hlYXJPZmY7XHJcbiAgY29uc3Qgc2hlYXJhYmxlQXRvbXNSb3cgPSBbXTtcclxuXHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbGF5ZXJEZXNjcmlwdGlvbi5sZW5ndGg7IGkrKyApIHtcclxuICAgIGNvbnN0IG9mZnNldCA9IGxheWVyRGVzY3JpcHRpb25bIGkgXS5vZmZzZXQgfHwgMDtcclxuICAgIGNhblNoZWFyT2ZmID0gbGF5ZXJEZXNjcmlwdGlvblsgaSBdLmNhblNoZWFyT2ZmIHx8IGZhbHNlO1xyXG4gICAgZm9yICggbGV0IG4gPSAwOyBuIDwgbGF5ZXJEZXNjcmlwdGlvblsgaSBdLm51bTsgbisrICkge1xyXG4gICAgICBjb25zdCBhdG9tID0gbmV3IEF0b20oXHJcbiAgICAgICAgbmV3IFZlY3RvcjIoIHJvd1N0YXJ0WFBvcyArICggb2Zmc2V0ICsgbiApICogTUFHTklGSUVEX0FUT01TX0lORk8uZGlzdGFuY2VYLCByb3dZUG9zICksXHJcbiAgICAgICAgZnJpY3Rpb25Nb2RlbCxcclxuICAgICAgICBpc1RvcEF0b20sIHtcclxuICAgICAgICAgIHBhcmVudFRhbmRlbTogcGFyZW50VGFuZGVtXHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgICBmcmljdGlvbk1vZGVsLmF0b21zLnB1c2goIGF0b20gKTtcclxuICAgICAgaWYgKCBjYW5TaGVhck9mZiApIHtcclxuICAgICAgICBzaGVhcmFibGVBdG9tc1Jvdy5wdXNoKCBhdG9tICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgaWYgKCBjYW5TaGVhck9mZiApIHtcclxuICAgIGZyaWN0aW9uTW9kZWwuc2hlYXJhYmxlQXRvbXNCeVJvdy5wdXNoKCBzaGVhcmFibGVBdG9tc1JvdyApO1xyXG4gIH1cclxufVxyXG5cclxuZnJpY3Rpb24ucmVnaXN0ZXIoICdGcmljdGlvbk1vZGVsJywgRnJpY3Rpb25Nb2RlbCApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgRnJpY3Rpb25Nb2RlbDsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxPQUFPLE1BQU0sZ0NBQWdDO0FBQ3BELE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLGVBQWUsTUFBTSx1Q0FBdUM7QUFDbkUsT0FBT0MsWUFBWSxNQUFNLHVDQUF1QztBQUNoRSxPQUFPQyxPQUFPLE1BQU0sd0NBQXdDO0FBQzVELE9BQU9DLFNBQVMsTUFBTSwwQ0FBMEM7QUFDaEUsT0FBT0MsTUFBTSxNQUFNLHVDQUF1QztBQUMxRCxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLG1CQUFtQjtBQUN4QyxPQUFPQyxpQkFBaUIsTUFBTSx5QkFBeUI7QUFDdkQsT0FBT0MsSUFBSSxNQUFNLFdBQVc7O0FBRTVCO0FBQ0EsTUFBTUMsV0FBVyxHQUFHRixpQkFBaUIsQ0FBQ0UsV0FBVyxDQUFDLENBQUM7QUFDbkQsTUFBTUMsY0FBYyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzNCLE1BQU1DLHNCQUFzQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLE1B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