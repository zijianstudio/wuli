// Copyright 2019-2023, University of Colorado Boulder

/**
 * PlumPudding is a predictive model of the hydrogen atom.
 *
 * Physical representation:
 * The proton is a blob of pudding (or "goo"), modeled as a circle. An electron oscillates inside the goo along a
 * straight line that passes through the center of the goo and has its end points on the circle.
 *
 * Collision behavior:
 * Photons collide with the electron when they are "close".
 *
 * Absorption behavior:
 * The electron can absorb N photons. When any photon collides with the electron, it is absorbed with some probability,
 * and (if absorbed) causes the electron to start oscillating.
 *
 * Emission behavior:
 * The electron can emit one UV photon for each photon absorbed. Photons are emitted at the electron's location.
 * No photons are emitted until the electron has completed one oscillation cycle, and after emitting its last photon,
 * the electron completes its current oscillation cycles, coming to rest at the atom's center.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import plumPuddingButton_png from '../../../images/plumPuddingButton_png.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import HydrogenAtom from './HydrogenAtom.js';
import Electron from './Electron.js';
import Photon from './Photon.js';
import MOTHAUtils from '../MOTHAUtils.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import MOTHAConstants from '../MOTHAConstants.js';
const MAX_PHOTONS_ABSORBED = 1; // maximum number of photons that can be absorbed. WARNING: Untested with values !== 1
const PHOTON_EMISSION_WAVELENGTH = 150; // wavelength (in nm) of emitted photons
const PHOTON_EMISSION_PROBABILITY = 0.1; // probability [0,1] that a photon will be emitted
const PHOTON_ABSORPTION_PROBABILITY = 0.5; // probability [0,1] that a photon will be absorbed

export default class PlumPuddingModel extends HydrogenAtom {
  radius = MOTHAConstants.PLUM_PUDDING_RADIUS;

  // the line on which the electron oscillates, in coordinates relative to the atom's position

  // offset of the electron relative to the atom's position

  // the electron's direction of motion, relative to the (horizontal) x-axis

  // Is the electron moving?

  // how many times the electron has crossed the atom's center since it started moving

  // the amplitude of the electron just before emitting its last photon

  // the number of photons the atom has absorbed and is "holding"

  constructor(zoomedInBox, providedOptions) {
    const options = optionize()({
      // HydrogenAtomOptions
      displayNameProperty: ModelsOfTheHydrogenAtomStrings.plumPuddingStringProperty,
      iconHTMLImageElement: plumPuddingButton_png,
      hasTransitionWavelengths: false
    }, providedOptions);
    super(zoomedInBox, options);
    this.electron = new Electron({
      //TODO position is not properly initialized
      tandem: options.tandem.createTandem('electron')
    });

    //TODO make this go away, just set electron.positionProperty directly
    this.electronOffsetProperty = new Vector2Property(Vector2.ZERO, {
      tandem: options.tandem.createTandem('electronOffsetProperty'),
      phetioReadOnly: true
    });
    this.electronOffsetProperty.link(electronOffset => {
      this.electron.positionProperty.value = this.position.plus(electronOffset);
    });
    this.electronLineProperty = new Property(nextElectronLine(this.radius), {
      //TODO tandem
      //TODO phetioType: ElectronLineIO
      //TODO phetioReadOnly: true
    });

    //TODO this.electron.directionProperty is unused
    this.electronDirectionPositiveProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('electronDirectionPositiveProperty'),
      phetioReadOnly: true
    });

    //TODO this.electron.speedProperty is unused
    this.electronIsMovingProperty = new BooleanProperty(false, {
      tandem: options.tandem.createTandem('electronIsMovingProperty'),
      phetioReadOnly: true
    });
    this.numberOfZeroCrossingsProperty = new NumberProperty(0, {
      numberType: 'Integer',
      tandem: options.tandem.createTandem('numberOfZeroCrossingsProperty'),
      phetioReadOnly: true
    });

    //TODO should this affect this.electron.speedProperty?
    this.previousAmplitudeProperty = new NumberProperty(0, {
      range: new Range(0, 1),
      tandem: options.tandem.createTandem('previousAmplitudeProperty'),
      phetioReadOnly: true
    });
    this.numberOfPhotonsAbsorbedProperty = new NumberProperty(0, {
      numberType: 'Integer',
      tandem: options.tandem.createTandem('numberOfPhotonsAbsorbedProperty'),
      phetioReadOnly: true
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.electron.reset();
    this.electronLineProperty.reset();
    this.electronOffsetProperty.reset();
    this.electronDirectionPositiveProperty.reset();
    this.electronIsMovingProperty.reset();
    this.numberOfZeroCrossingsProperty.reset();
    this.previousAmplitudeProperty.reset();
    this.numberOfPhotonsAbsorbedProperty.reset();
    super.reset();
  }

  /**
   * Oscillates the electron inside the atom. Emits a photon at a random time.
   * After emitting its last photon, the electron completes its oscillation and returns to (0,0).
   */
  step(dt) {
    if (this.numberOfPhotonsAbsorbedProperty.value > 0) {
      this.electronIsMovingProperty.value = true;

      // Move the electron
      const amplitude = this.getElectronAmplitude();
      this.moveElectron(dt, amplitude);

      // Randomly emit a photon after completing an oscillation cycle
      if (this.getNumberOfElectronOscillations() !== 0) {
        if (dotRandom.nextDouble() < PHOTON_EMISSION_PROBABILITY) {
          this.emitPhoton();

          // If we have not more photons, remember amplitude, so we can complete oscillation.
          if (this.numberOfPhotonsAbsorbedProperty.value === 0) {
            this.previousAmplitudeProperty.value = amplitude;
          }
        }
      }
    } else if (this.electronIsMovingProperty.value && this.numberOfPhotonsAbsorbedProperty.value === 0) {
      // Before moving the electron
      const before = this.getNumberOfElectronOscillations();

      // After moving the electron
      this.moveElectron(dt, this.previousAmplitudeProperty.value);
      const after = this.getNumberOfElectronOscillations();

      // Stop the electron when it completes its current oscillation
      if (before !== after) {
        this.electronIsMovingProperty.value = false;
        this.numberOfZeroCrossingsProperty.value = 0;
        this.previousAmplitudeProperty.value = 0;
        this.electronLineProperty.value = nextElectronLine(this.radius);
        this.electronOffsetProperty.value = Vector2.ZERO;
        this.electronDirectionPositiveProperty.value = dotRandom.nextBoolean();
      }
    }
  }

  /**
   * Moves the electron along its oscillation path with some amplitude.
   */
  moveElectron(dt, amplitude) {
    const electronLine = this.electronLineProperty.value;

    // Assumptions about the electron's oscillation line
    assert && assert(electronLine.x1 < electronLine.x2);
    assert && assert(Math.abs(electronLine.x1) === Math.abs(electronLine.x2));
    assert && assert(Math.abs(electronLine.y1) === Math.abs(electronLine.y2));

    // Remember the old offset
    const x0 = this.electronOffsetProperty.value.x;
    const y0 = this.electronOffsetProperty.value.y;

    // Determine dx and dy
    //TODO include electron speed?
    //TODO should electron move faster, to match the Java version?
    const distanceDelta = dt * amplitude * (2 * this.radius);
    let dx = Math.abs(electronLine.x1) * (distanceDelta / this.radius);
    let dy = Math.abs(electronLine.y1) * (distanceDelta / this.radius);

    // Adjust signs for electron's horizontal direction
    const sign = this.electronDirectionPositiveProperty.value ? 1 : -1;
    dx *= sign;
    dy *= sign; //TODO why are we adjusting dy?
    if (electronLine.y1 > electronLine.y2) {
      dy *= -1;
    }

    // Electron's new offset
    let x = x0 + dx;
    let y = y0 + dy;

    // If the new offset is past the end of the oscillation line, limit the electron position and change direction.
    if (Math.abs(x) > Math.abs(electronLine.x1) || Math.abs(y) > Math.abs(electronLine.y1)) {
      if (this.electronDirectionPositiveProperty.value) {
        x = electronLine.x2;
        y = electronLine.y2;
      } else {
        x = electronLine.x1;
        y = electronLine.y1;
      }

      // Change direction
      this.electronDirectionPositiveProperty.value = !this.electronDirectionPositiveProperty.value;
    }

    // Did we cross the origin?
    //TODO why is ( x === 0 && y === 0 ) considered a zero crossing?
    if (x === 0 && y === 0 || signIsDifferent(x, x0) || signIsDifferent(y, y0)) {
      this.numberOfZeroCrossingsProperty.value += 1;
    }
    this.electronOffsetProperty.value = new Vector2(x, y);
  }

  //TODO Decouple interacting with photon from moving it.
  /**
   * Tries to absorb a photon. If it is not absorbed, the photon is moved.
   */
  movePhoton(photon, dt) {
    if (!this.absorbPhoton(photon)) {
      photon.move(dt);
    }
  }

  /**
   * Gets the electron's amplitude. This is ratio of the number of photons actually absorbed to the number of photons
   * the electron is capable of absorbing.
   */
  getElectronAmplitude() {
    return this.numberOfPhotonsAbsorbedProperty.value / MAX_PHOTONS_ABSORBED;
  }

  /**
   * Gets the number of oscillations that the electron has completed since it started moving. This is a function of
   * the number of times the electron has crossed the center of the atom.
   */
  getNumberOfElectronOscillations() {
    return this.numberOfZeroCrossingsProperty.value % 2;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Photon Absorption
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Cannot absorb a photon if any of these are true:
   * - the photon was emitted by the atom
   * - we've already absorbed the max
   * - we've emitted out last photon and haven't completed oscillation.
   */
  canAbsorb(photon) {
    return !(photon.wasEmitted || this.numberOfPhotonsAbsorbedProperty.value === MAX_PHOTONS_ABSORBED || this.numberOfPhotonsAbsorbedProperty.value === 0 && this.electronIsMovingProperty.value);
  }

  /**
   * Attempts to absorb the specified photon.
   * @param photon
   * @returns true if the photon was absorbed, false if it was not absorbed
   */
  absorbPhoton(photon) {
    let absorbed = false;
    if (this.canAbsorb(photon)) {
      const electronPosition = this.electron.positionProperty.value;
      const photonPosition = photon.positionProperty.value;
      const collisionCloseness = photon.radius + this.electron.radius;
      if (this.pointsCollide(electronPosition, photonPosition, collisionCloseness)) {
        if (dotRandom.nextDouble() < PHOTON_ABSORPTION_PROBABILITY) {
          this.numberOfPhotonsAbsorbedProperty.value += 1;
          assert && assert(this.numberOfPhotonsAbsorbedProperty.value <= MAX_PHOTONS_ABSORBED);
          this.photonAbsorbedEmitter.emit(photon);
          absorbed = true;
        }
      }
    }
    return absorbed;
  }

  //--------------------------------------------------------------------------------------------------------------------
  // Photon Emission
  //--------------------------------------------------------------------------------------------------------------------

  /**
   * Emits a photon from the electron's location, at a random orientation.
   */
  emitPhoton() {
    if (this.numberOfPhotonsAbsorbedProperty.value > 0) {
      this.numberOfPhotonsAbsorbedProperty.value -= 1;

      // Create and emit a photon
      this.photonEmittedEmitter.emit(new Photon({
        wavelength: PHOTON_EMISSION_WAVELENGTH,
        position: this.electron.positionProperty.value,
        // at the electron's position
        direction: MOTHAUtils.nextAngle(),
        // in a random direction
        wasEmitted: true,
        tandem: Tandem.OPT_OUT //TODO create via PhetioGroup
      }));
    }
  }
}

// Defines the straight-line path that the electron follows.
class ElectronLine {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

/**
 * Gets the next random line that describes the electron's oscillation path.
 * The line is specified in coordinates relative to the atom (in the atom's local coordinate frame).
 */
function nextElectronLine(radius) {
  const angle = MOTHAUtils.nextAngle();
  const x = Math.abs(radius * Math.sin(angle));
  const y = MOTHAUtils.nextSign() * radius * Math.cos(angle);
  return new ElectronLine(-x, -y, x, y);
}

/**
 * Determines if the sign of two numbers is different. False if either value is zero.
 */
function signIsDifferent(n1, n2) {
  return n1 > 0 && n2 < 0 || n1 < 0 && n2 > 0;
}
modelsOfTheHydrogenAtom.register('PlumPuddingModel', PlumPuddingModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiZG90UmFuZG9tIiwiUmFuZ2UiLCJWZWN0b3IyIiwiVmVjdG9yMlByb3BlcnR5Iiwib3B0aW9uaXplIiwicGx1bVB1ZGRpbmdCdXR0b25fcG5nIiwibW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20iLCJNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MiLCJIeWRyb2dlbkF0b20iLCJFbGVjdHJvbiIsIlBob3RvbiIsIk1PVEhBVXRpbHMiLCJUYW5kZW0iLCJNT1RIQUNvbnN0YW50cyIsIk1BWF9QSE9UT05TX0FCU09SQkVEIiwiUEhPVE9OX0VNSVNTSU9OX1dBVkVMRU5HVEgiLCJQSE9UT05fRU1JU1NJT05fUFJPQkFCSUxJVFkiLCJQSE9UT05fQUJTT1JQVElPTl9QUk9CQUJJTElUWSIsIlBsdW1QdWRkaW5nTW9kZWwiLCJyYWRpdXMiLCJQTFVNX1BVRERJTkdfUkFESVVTIiwiY29uc3RydWN0b3IiLCJ6b29tZWRJbkJveCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkaXNwbGF5TmFtZVByb3BlcnR5IiwicGx1bVB1ZGRpbmdTdHJpbmdQcm9wZXJ0eSIsImljb25IVE1MSW1hZ2VFbGVtZW50IiwiaGFzVHJhbnNpdGlvbldhdmVsZW5ndGhzIiwiZWxlY3Ryb24iLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJlbGVjdHJvbk9mZnNldFByb3BlcnR5IiwiWkVSTyIsInBoZXRpb1JlYWRPbmx5IiwibGluayIsImVsZWN0cm9uT2Zmc2V0IiwicG9zaXRpb25Qcm9wZXJ0eSIsInZhbHVlIiwicG9zaXRpb24iLCJwbHVzIiwiZWxlY3Ryb25MaW5lUHJvcGVydHkiLCJuZXh0RWxlY3Ryb25MaW5lIiwiZWxlY3Ryb25EaXJlY3Rpb25Qb3NpdGl2ZVByb3BlcnR5IiwiZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5IiwibnVtYmVyT2ZaZXJvQ3Jvc3NpbmdzUHJvcGVydHkiLCJudW1iZXJUeXBlIiwicHJldmlvdXNBbXBsaXR1ZGVQcm9wZXJ0eSIsInJhbmdlIiwibnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZXNldCIsInN0ZXAiLCJkdCIsImFtcGxpdHVkZSIsImdldEVsZWN0cm9uQW1wbGl0dWRlIiwibW92ZUVsZWN0cm9uIiwiZ2V0TnVtYmVyT2ZFbGVjdHJvbk9zY2lsbGF0aW9ucyIsIm5leHREb3VibGUiLCJlbWl0UGhvdG9uIiwiYmVmb3JlIiwiYWZ0ZXIiLCJuZXh0Qm9vbGVhbiIsImVsZWN0cm9uTGluZSIsIngxIiwieDIiLCJNYXRoIiwiYWJzIiwieTEiLCJ5MiIsIngwIiwieCIsInkwIiwieSIsImRpc3RhbmNlRGVsdGEiLCJkeCIsImR5Iiwic2lnbiIsInNpZ25Jc0RpZmZlcmVudCIsIm1vdmVQaG90b24iLCJwaG90b24iLCJhYnNvcmJQaG90b24iLCJtb3ZlIiwiY2FuQWJzb3JiIiwid2FzRW1pdHRlZCIsImFic29yYmVkIiwiZWxlY3Ryb25Qb3NpdGlvbiIsInBob3RvblBvc2l0aW9uIiwiY29sbGlzaW9uQ2xvc2VuZXNzIiwicG9pbnRzQ29sbGlkZSIsInBob3RvbkFic29yYmVkRW1pdHRlciIsImVtaXQiLCJwaG90b25FbWl0dGVkRW1pdHRlciIsIndhdmVsZW5ndGgiLCJkaXJlY3Rpb24iLCJuZXh0QW5nbGUiLCJPUFRfT1VUIiwiRWxlY3Ryb25MaW5lIiwiYW5nbGUiLCJzaW4iLCJuZXh0U2lnbiIsImNvcyIsIm4xIiwibjIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBsdW1QdWRkaW5nTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGx1bVB1ZGRpbmcgaXMgYSBwcmVkaWN0aXZlIG1vZGVsIG9mIHRoZSBoeWRyb2dlbiBhdG9tLlxyXG4gKlxyXG4gKiBQaHlzaWNhbCByZXByZXNlbnRhdGlvbjpcclxuICogVGhlIHByb3RvbiBpcyBhIGJsb2Igb2YgcHVkZGluZyAob3IgXCJnb29cIiksIG1vZGVsZWQgYXMgYSBjaXJjbGUuIEFuIGVsZWN0cm9uIG9zY2lsbGF0ZXMgaW5zaWRlIHRoZSBnb28gYWxvbmcgYVxyXG4gKiBzdHJhaWdodCBsaW5lIHRoYXQgcGFzc2VzIHRocm91Z2ggdGhlIGNlbnRlciBvZiB0aGUgZ29vIGFuZCBoYXMgaXRzIGVuZCBwb2ludHMgb24gdGhlIGNpcmNsZS5cclxuICpcclxuICogQ29sbGlzaW9uIGJlaGF2aW9yOlxyXG4gKiBQaG90b25zIGNvbGxpZGUgd2l0aCB0aGUgZWxlY3Ryb24gd2hlbiB0aGV5IGFyZSBcImNsb3NlXCIuXHJcbiAqXHJcbiAqIEFic29ycHRpb24gYmVoYXZpb3I6XHJcbiAqIFRoZSBlbGVjdHJvbiBjYW4gYWJzb3JiIE4gcGhvdG9ucy4gV2hlbiBhbnkgcGhvdG9uIGNvbGxpZGVzIHdpdGggdGhlIGVsZWN0cm9uLCBpdCBpcyBhYnNvcmJlZCB3aXRoIHNvbWUgcHJvYmFiaWxpdHksXHJcbiAqIGFuZCAoaWYgYWJzb3JiZWQpIGNhdXNlcyB0aGUgZWxlY3Ryb24gdG8gc3RhcnQgb3NjaWxsYXRpbmcuXHJcbiAqXHJcbiAqIEVtaXNzaW9uIGJlaGF2aW9yOlxyXG4gKiBUaGUgZWxlY3Ryb24gY2FuIGVtaXQgb25lIFVWIHBob3RvbiBmb3IgZWFjaCBwaG90b24gYWJzb3JiZWQuIFBob3RvbnMgYXJlIGVtaXR0ZWQgYXQgdGhlIGVsZWN0cm9uJ3MgbG9jYXRpb24uXHJcbiAqIE5vIHBob3RvbnMgYXJlIGVtaXR0ZWQgdW50aWwgdGhlIGVsZWN0cm9uIGhhcyBjb21wbGV0ZWQgb25lIG9zY2lsbGF0aW9uIGN5Y2xlLCBhbmQgYWZ0ZXIgZW1pdHRpbmcgaXRzIGxhc3QgcGhvdG9uLFxyXG4gKiB0aGUgZWxlY3Ryb24gY29tcGxldGVzIGl0cyBjdXJyZW50IG9zY2lsbGF0aW9uIGN5Y2xlcywgY29taW5nIHRvIHJlc3QgYXQgdGhlIGF0b20ncyBjZW50ZXIuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgcGx1bVB1ZGRpbmdCdXR0b25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wbHVtUHVkZGluZ0J1dHRvbl9wbmcuanMnO1xyXG5pbXBvcnQgbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20gZnJvbSAnLi4vLi4vbW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzIGZyb20gJy4uLy4uL01vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBIeWRyb2dlbkF0b20sIHsgSHlkcm9nZW5BdG9tT3B0aW9ucyB9IGZyb20gJy4vSHlkcm9nZW5BdG9tLmpzJztcclxuaW1wb3J0IEVsZWN0cm9uIGZyb20gJy4vRWxlY3Ryb24uanMnO1xyXG5pbXBvcnQgUGhvdG9uIGZyb20gJy4vUGhvdG9uLmpzJztcclxuaW1wb3J0IFpvb21lZEluQm94IGZyb20gJy4vWm9vbWVkSW5Cb3guanMnO1xyXG5pbXBvcnQgTU9USEFVdGlscyBmcm9tICcuLi9NT1RIQVV0aWxzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE1PVEhBQ29uc3RhbnRzIGZyb20gJy4uL01PVEhBQ29uc3RhbnRzLmpzJztcclxuXHJcbmNvbnN0IE1BWF9QSE9UT05TX0FCU09SQkVEID0gMTsgLy8gbWF4aW11bSBudW1iZXIgb2YgcGhvdG9ucyB0aGF0IGNhbiBiZSBhYnNvcmJlZC4gV0FSTklORzogVW50ZXN0ZWQgd2l0aCB2YWx1ZXMgIT09IDFcclxuY29uc3QgUEhPVE9OX0VNSVNTSU9OX1dBVkVMRU5HVEggPSAxNTA7IC8vIHdhdmVsZW5ndGggKGluIG5tKSBvZiBlbWl0dGVkIHBob3RvbnNcclxuY29uc3QgUEhPVE9OX0VNSVNTSU9OX1BST0JBQklMSVRZID0gMC4xOyAvLyBwcm9iYWJpbGl0eSBbMCwxXSB0aGF0IGEgcGhvdG9uIHdpbGwgYmUgZW1pdHRlZFxyXG5jb25zdCBQSE9UT05fQUJTT1JQVElPTl9QUk9CQUJJTElUWSA9IDAuNTsgLy8gcHJvYmFiaWxpdHkgWzAsMV0gdGhhdCBhIHBob3RvbiB3aWxsIGJlIGFic29yYmVkXHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgUGx1bVB1ZGRpbmdNb2RlbE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgU3RyaWN0T21pdDxIeWRyb2dlbkF0b21PcHRpb25zLCAnZGlzcGxheU5hbWVQcm9wZXJ0eScgfCAnaWNvbkhUTUxJbWFnZUVsZW1lbnQnIHwgJ2hhc1RyYW5zaXRpb25XYXZlbGVuZ3Rocyc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGx1bVB1ZGRpbmdNb2RlbCBleHRlbmRzIEh5ZHJvZ2VuQXRvbSB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSByYWRpdXMgPSBNT1RIQUNvbnN0YW50cy5QTFVNX1BVRERJTkdfUkFESVVTO1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgZWxlY3Ryb246IEVsZWN0cm9uO1xyXG5cclxuICAvLyB0aGUgbGluZSBvbiB3aGljaCB0aGUgZWxlY3Ryb24gb3NjaWxsYXRlcywgaW4gY29vcmRpbmF0ZXMgcmVsYXRpdmUgdG8gdGhlIGF0b20ncyBwb3NpdGlvblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlY3Ryb25MaW5lUHJvcGVydHk6IFByb3BlcnR5PEVsZWN0cm9uTGluZT47XHJcblxyXG4gIC8vIG9mZnNldCBvZiB0aGUgZWxlY3Ryb24gcmVsYXRpdmUgdG8gdGhlIGF0b20ncyBwb3NpdGlvblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlY3Ryb25PZmZzZXRQcm9wZXJ0eTogUHJvcGVydHk8VmVjdG9yMj47XHJcblxyXG4gIC8vIHRoZSBlbGVjdHJvbidzIGRpcmVjdGlvbiBvZiBtb3Rpb24sIHJlbGF0aXZlIHRvIHRoZSAoaG9yaXpvbnRhbCkgeC1heGlzXHJcbiAgcHJpdmF0ZSByZWFkb25seSBlbGVjdHJvbkRpcmVjdGlvblBvc2l0aXZlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBJcyB0aGUgZWxlY3Ryb24gbW92aW5nP1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gaG93IG1hbnkgdGltZXMgdGhlIGVsZWN0cm9uIGhhcyBjcm9zc2VkIHRoZSBhdG9tJ3MgY2VudGVyIHNpbmNlIGl0IHN0YXJ0ZWQgbW92aW5nXHJcbiAgcHJpdmF0ZSByZWFkb25seSBudW1iZXJPZlplcm9Dcm9zc2luZ3NQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gdGhlIGFtcGxpdHVkZSBvZiB0aGUgZWxlY3Ryb24ganVzdCBiZWZvcmUgZW1pdHRpbmcgaXRzIGxhc3QgcGhvdG9uXHJcbiAgcHJpdmF0ZSByZWFkb25seSBwcmV2aW91c0FtcGxpdHVkZVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+O1xyXG5cclxuICAvLyB0aGUgbnVtYmVyIG9mIHBob3RvbnMgdGhlIGF0b20gaGFzIGFic29yYmVkIGFuZCBpcyBcImhvbGRpbmdcIlxyXG4gIHByaXZhdGUgcmVhZG9ubHkgbnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB6b29tZWRJbkJveDogWm9vbWVkSW5Cb3gsIHByb3ZpZGVkT3B0aW9uczogUGx1bVB1ZGRpbmdNb2RlbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxQbHVtUHVkZGluZ01vZGVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIEh5ZHJvZ2VuQXRvbU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEh5ZHJvZ2VuQXRvbU9wdGlvbnNcclxuICAgICAgZGlzcGxheU5hbWVQcm9wZXJ0eTogTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLnBsdW1QdWRkaW5nU3RyaW5nUHJvcGVydHksXHJcbiAgICAgIGljb25IVE1MSW1hZ2VFbGVtZW50OiBwbHVtUHVkZGluZ0J1dHRvbl9wbmcsXHJcbiAgICAgIGhhc1RyYW5zaXRpb25XYXZlbGVuZ3RoczogZmFsc2VcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCB6b29tZWRJbkJveCwgb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZWxlY3Ryb24gPSBuZXcgRWxlY3Ryb24oIHtcclxuICAgICAgLy9UT0RPIHBvc2l0aW9uIGlzIG5vdCBwcm9wZXJseSBpbml0aWFsaXplZFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2VsZWN0cm9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9UT0RPIG1ha2UgdGhpcyBnbyBhd2F5LCBqdXN0IHNldCBlbGVjdHJvbi5wb3NpdGlvblByb3BlcnR5IGRpcmVjdGx5XHJcbiAgICB0aGlzLmVsZWN0cm9uT2Zmc2V0UHJvcGVydHkgPSBuZXcgVmVjdG9yMlByb3BlcnR5KCBWZWN0b3IyLlpFUk8sIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbk9mZnNldFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZWxlY3Ryb25PZmZzZXRQcm9wZXJ0eS5saW5rKCBlbGVjdHJvbk9mZnNldCA9PiB7XHJcbiAgICAgIHRoaXMuZWxlY3Ryb24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSA9IHRoaXMucG9zaXRpb24ucGx1cyggZWxlY3Ryb25PZmZzZXQgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uTGluZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5PEVsZWN0cm9uTGluZT4oIG5leHRFbGVjdHJvbkxpbmUoIHRoaXMucmFkaXVzICksIHtcclxuICAgICAgLy9UT0RPIHRhbmRlbVxyXG4gICAgICAvL1RPRE8gcGhldGlvVHlwZTogRWxlY3Ryb25MaW5lSU9cclxuICAgICAgLy9UT0RPIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9UT0RPIHRoaXMuZWxlY3Ryb24uZGlyZWN0aW9uUHJvcGVydHkgaXMgdW51c2VkXHJcbiAgICB0aGlzLmVsZWN0cm9uRGlyZWN0aW9uUG9zaXRpdmVQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbkRpcmVjdGlvblBvc2l0aXZlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9UT0RPIHRoaXMuZWxlY3Ryb24uc3BlZWRQcm9wZXJ0eSBpcyB1bnVzZWRcclxuICAgIHRoaXMuZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbklzTW92aW5nUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5udW1iZXJPZlplcm9Dcm9zc2luZ3NQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyT2ZaZXJvQ3Jvc3NpbmdzUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9UT0RPIHNob3VsZCB0aGlzIGFmZmVjdCB0aGlzLmVsZWN0cm9uLnNwZWVkUHJvcGVydHk/XHJcbiAgICB0aGlzLnByZXZpb3VzQW1wbGl0dWRlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIDAsIHtcclxuICAgICAgcmFuZ2U6IG5ldyBSYW5nZSggMCwgMSApLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ByZXZpb3VzQW1wbGl0dWRlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5udW1iZXJPZlBob3RvbnNBYnNvcmJlZFByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdudW1iZXJPZlBob3RvbnNBYnNvcmJlZFByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZWxlY3Ryb24ucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb25MaW5lUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb25PZmZzZXRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbGVjdHJvbkRpcmVjdGlvblBvc2l0aXZlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLm51bWJlck9mWmVyb0Nyb3NzaW5nc1Byb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnByZXZpb3VzQW1wbGl0dWRlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgc3VwZXIucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE9zY2lsbGF0ZXMgdGhlIGVsZWN0cm9uIGluc2lkZSB0aGUgYXRvbS4gRW1pdHMgYSBwaG90b24gYXQgYSByYW5kb20gdGltZS5cclxuICAgKiBBZnRlciBlbWl0dGluZyBpdHMgbGFzdCBwaG90b24sIHRoZSBlbGVjdHJvbiBjb21wbGV0ZXMgaXRzIG9zY2lsbGF0aW9uIGFuZCByZXR1cm5zIHRvICgwLDApLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBzdGVwKCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGlmICggdGhpcy5udW1iZXJPZlBob3RvbnNBYnNvcmJlZFByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuXHJcbiAgICAgIHRoaXMuZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vIE1vdmUgdGhlIGVsZWN0cm9uXHJcbiAgICAgIGNvbnN0IGFtcGxpdHVkZSA9IHRoaXMuZ2V0RWxlY3Ryb25BbXBsaXR1ZGUoKTtcclxuICAgICAgdGhpcy5tb3ZlRWxlY3Ryb24oIGR0LCBhbXBsaXR1ZGUgKTtcclxuXHJcbiAgICAgIC8vIFJhbmRvbWx5IGVtaXQgYSBwaG90b24gYWZ0ZXIgY29tcGxldGluZyBhbiBvc2NpbGxhdGlvbiBjeWNsZVxyXG4gICAgICBpZiAoIHRoaXMuZ2V0TnVtYmVyT2ZFbGVjdHJvbk9zY2lsbGF0aW9ucygpICE9PSAwICkge1xyXG4gICAgICAgIGlmICggZG90UmFuZG9tLm5leHREb3VibGUoKSA8IFBIT1RPTl9FTUlTU0lPTl9QUk9CQUJJTElUWSApIHtcclxuICAgICAgICAgIHRoaXMuZW1pdFBob3RvbigpO1xyXG5cclxuICAgICAgICAgIC8vIElmIHdlIGhhdmUgbm90IG1vcmUgcGhvdG9ucywgcmVtZW1iZXIgYW1wbGl0dWRlLCBzbyB3ZSBjYW4gY29tcGxldGUgb3NjaWxsYXRpb24uXHJcbiAgICAgICAgICBpZiAoIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuICAgICAgICAgICAgdGhpcy5wcmV2aW91c0FtcGxpdHVkZVByb3BlcnR5LnZhbHVlID0gYW1wbGl0dWRlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMuZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5LnZhbHVlICYmIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuXHJcbiAgICAgIC8vIEJlZm9yZSBtb3ZpbmcgdGhlIGVsZWN0cm9uXHJcbiAgICAgIGNvbnN0IGJlZm9yZSA9IHRoaXMuZ2V0TnVtYmVyT2ZFbGVjdHJvbk9zY2lsbGF0aW9ucygpO1xyXG5cclxuICAgICAgLy8gQWZ0ZXIgbW92aW5nIHRoZSBlbGVjdHJvblxyXG4gICAgICB0aGlzLm1vdmVFbGVjdHJvbiggZHQsIHRoaXMucHJldmlvdXNBbXBsaXR1ZGVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICBjb25zdCBhZnRlciA9IHRoaXMuZ2V0TnVtYmVyT2ZFbGVjdHJvbk9zY2lsbGF0aW9ucygpO1xyXG5cclxuICAgICAgLy8gU3RvcCB0aGUgZWxlY3Ryb24gd2hlbiBpdCBjb21wbGV0ZXMgaXRzIGN1cnJlbnQgb3NjaWxsYXRpb25cclxuICAgICAgaWYgKCBiZWZvcmUgIT09IGFmdGVyICkge1xyXG4gICAgICAgIHRoaXMuZWxlY3Ryb25Jc01vdmluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5udW1iZXJPZlplcm9Dcm9zc2luZ3NQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5wcmV2aW91c0FtcGxpdHVkZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgICB0aGlzLmVsZWN0cm9uTGluZVByb3BlcnR5LnZhbHVlID0gbmV4dEVsZWN0cm9uTGluZSggdGhpcy5yYWRpdXMgKTtcclxuICAgICAgICB0aGlzLmVsZWN0cm9uT2Zmc2V0UHJvcGVydHkudmFsdWUgPSBWZWN0b3IyLlpFUk87XHJcbiAgICAgICAgdGhpcy5lbGVjdHJvbkRpcmVjdGlvblBvc2l0aXZlUHJvcGVydHkudmFsdWUgPSBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTW92ZXMgdGhlIGVsZWN0cm9uIGFsb25nIGl0cyBvc2NpbGxhdGlvbiBwYXRoIHdpdGggc29tZSBhbXBsaXR1ZGUuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBtb3ZlRWxlY3Ryb24oIGR0OiBudW1iZXIsIGFtcGxpdHVkZTogbnVtYmVyICk6IHZvaWQge1xyXG5cclxuICAgIGNvbnN0IGVsZWN0cm9uTGluZSA9IHRoaXMuZWxlY3Ryb25MaW5lUHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgLy8gQXNzdW1wdGlvbnMgYWJvdXQgdGhlIGVsZWN0cm9uJ3Mgb3NjaWxsYXRpb24gbGluZVxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZWxlY3Ryb25MaW5lLngxIDwgZWxlY3Ryb25MaW5lLngyICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBNYXRoLmFicyggZWxlY3Ryb25MaW5lLngxICkgPT09IE1hdGguYWJzKCBlbGVjdHJvbkxpbmUueDIgKSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTWF0aC5hYnMoIGVsZWN0cm9uTGluZS55MSApID09PSBNYXRoLmFicyggZWxlY3Ryb25MaW5lLnkyICkgKTtcclxuXHJcbiAgICAvLyBSZW1lbWJlciB0aGUgb2xkIG9mZnNldFxyXG4gICAgY29uc3QgeDAgPSB0aGlzLmVsZWN0cm9uT2Zmc2V0UHJvcGVydHkudmFsdWUueDtcclxuICAgIGNvbnN0IHkwID0gdGhpcy5lbGVjdHJvbk9mZnNldFByb3BlcnR5LnZhbHVlLnk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIGR4IGFuZCBkeVxyXG4gICAgLy9UT0RPIGluY2x1ZGUgZWxlY3Ryb24gc3BlZWQ/XHJcbiAgICAvL1RPRE8gc2hvdWxkIGVsZWN0cm9uIG1vdmUgZmFzdGVyLCB0byBtYXRjaCB0aGUgSmF2YSB2ZXJzaW9uP1xyXG4gICAgY29uc3QgZGlzdGFuY2VEZWx0YSA9IGR0ICogYW1wbGl0dWRlICogKCAyICogdGhpcy5yYWRpdXMgKTtcclxuICAgIGxldCBkeCA9IE1hdGguYWJzKCBlbGVjdHJvbkxpbmUueDEgKSAqICggZGlzdGFuY2VEZWx0YSAvIHRoaXMucmFkaXVzICk7XHJcbiAgICBsZXQgZHkgPSBNYXRoLmFicyggZWxlY3Ryb25MaW5lLnkxICkgKiAoIGRpc3RhbmNlRGVsdGEgLyB0aGlzLnJhZGl1cyApO1xyXG5cclxuICAgIC8vIEFkanVzdCBzaWducyBmb3IgZWxlY3Ryb24ncyBob3Jpem9udGFsIGRpcmVjdGlvblxyXG4gICAgY29uc3Qgc2lnbiA9ICggdGhpcy5lbGVjdHJvbkRpcmVjdGlvblBvc2l0aXZlUHJvcGVydHkudmFsdWUgPyAxIDogLTEgKTtcclxuICAgIGR4ICo9IHNpZ247XHJcbiAgICBkeSAqPSBzaWduOyAvL1RPRE8gd2h5IGFyZSB3ZSBhZGp1c3RpbmcgZHk/XHJcbiAgICBpZiAoIGVsZWN0cm9uTGluZS55MSA+IGVsZWN0cm9uTGluZS55MiApIHtcclxuICAgICAgZHkgKj0gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRWxlY3Ryb24ncyBuZXcgb2Zmc2V0XHJcbiAgICBsZXQgeCA9IHgwICsgZHg7XHJcbiAgICBsZXQgeSA9IHkwICsgZHk7XHJcblxyXG4gICAgLy8gSWYgdGhlIG5ldyBvZmZzZXQgaXMgcGFzdCB0aGUgZW5kIG9mIHRoZSBvc2NpbGxhdGlvbiBsaW5lLCBsaW1pdCB0aGUgZWxlY3Ryb24gcG9zaXRpb24gYW5kIGNoYW5nZSBkaXJlY3Rpb24uXHJcbiAgICBpZiAoIE1hdGguYWJzKCB4ICkgPiBNYXRoLmFicyggZWxlY3Ryb25MaW5lLngxICkgfHwgTWF0aC5hYnMoIHkgKSA+IE1hdGguYWJzKCBlbGVjdHJvbkxpbmUueTEgKSApIHtcclxuICAgICAgaWYgKCB0aGlzLmVsZWN0cm9uRGlyZWN0aW9uUG9zaXRpdmVQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB4ID0gZWxlY3Ryb25MaW5lLngyO1xyXG4gICAgICAgIHkgPSBlbGVjdHJvbkxpbmUueTI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgeCA9IGVsZWN0cm9uTGluZS54MTtcclxuICAgICAgICB5ID0gZWxlY3Ryb25MaW5lLnkxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGFuZ2UgZGlyZWN0aW9uXHJcbiAgICAgIHRoaXMuZWxlY3Ryb25EaXJlY3Rpb25Qb3NpdGl2ZVByb3BlcnR5LnZhbHVlID0gIXRoaXMuZWxlY3Ryb25EaXJlY3Rpb25Qb3NpdGl2ZVByb3BlcnR5LnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERpZCB3ZSBjcm9zcyB0aGUgb3JpZ2luP1xyXG4gICAgLy9UT0RPIHdoeSBpcyAoIHggPT09IDAgJiYgeSA9PT0gMCApIGNvbnNpZGVyZWQgYSB6ZXJvIGNyb3NzaW5nP1xyXG4gICAgaWYgKCAoIHggPT09IDAgJiYgeSA9PT0gMCApIHx8IHNpZ25Jc0RpZmZlcmVudCggeCwgeDAgKSB8fCBzaWduSXNEaWZmZXJlbnQoIHksIHkwICkgKSB7XHJcbiAgICAgIHRoaXMubnVtYmVyT2ZaZXJvQ3Jvc3NpbmdzUHJvcGVydHkudmFsdWUgKz0gMTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uT2Zmc2V0UHJvcGVydHkudmFsdWUgPSBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgLy9UT0RPIERlY291cGxlIGludGVyYWN0aW5nIHdpdGggcGhvdG9uIGZyb20gbW92aW5nIGl0LlxyXG4gIC8qKlxyXG4gICAqIFRyaWVzIHRvIGFic29yYiBhIHBob3Rvbi4gSWYgaXQgaXMgbm90IGFic29yYmVkLCB0aGUgcGhvdG9uIGlzIG1vdmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBtb3ZlUGhvdG9uKCBwaG90b246IFBob3RvbiwgZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMuYWJzb3JiUGhvdG9uKCBwaG90b24gKSApIHtcclxuICAgICAgcGhvdG9uLm1vdmUoIGR0ICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBlbGVjdHJvbidzIGFtcGxpdHVkZS4gVGhpcyBpcyByYXRpbyBvZiB0aGUgbnVtYmVyIG9mIHBob3RvbnMgYWN0dWFsbHkgYWJzb3JiZWQgdG8gdGhlIG51bWJlciBvZiBwaG90b25zXHJcbiAgICogdGhlIGVsZWN0cm9uIGlzIGNhcGFibGUgb2YgYWJzb3JiaW5nLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0RWxlY3Ryb25BbXBsaXR1ZGUoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiAoIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSAvIE1BWF9QSE9UT05TX0FCU09SQkVEICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2Ygb3NjaWxsYXRpb25zIHRoYXQgdGhlIGVsZWN0cm9uIGhhcyBjb21wbGV0ZWQgc2luY2UgaXQgc3RhcnRlZCBtb3ZpbmcuIFRoaXMgaXMgYSBmdW5jdGlvbiBvZlxyXG4gICAqIHRoZSBudW1iZXIgb2YgdGltZXMgdGhlIGVsZWN0cm9uIGhhcyBjcm9zc2VkIHRoZSBjZW50ZXIgb2YgdGhlIGF0b20uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXROdW1iZXJPZkVsZWN0cm9uT3NjaWxsYXRpb25zKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gKCB0aGlzLm51bWJlck9mWmVyb0Nyb3NzaW5nc1Byb3BlcnR5LnZhbHVlICUgMiApO1xyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFBob3RvbiBBYnNvcnB0aW9uXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAvKipcclxuICAgKiBDYW5ub3QgYWJzb3JiIGEgcGhvdG9uIGlmIGFueSBvZiB0aGVzZSBhcmUgdHJ1ZTpcclxuICAgKiAtIHRoZSBwaG90b24gd2FzIGVtaXR0ZWQgYnkgdGhlIGF0b21cclxuICAgKiAtIHdlJ3ZlIGFscmVhZHkgYWJzb3JiZWQgdGhlIG1heFxyXG4gICAqIC0gd2UndmUgZW1pdHRlZCBvdXQgbGFzdCBwaG90b24gYW5kIGhhdmVuJ3QgY29tcGxldGVkIG9zY2lsbGF0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY2FuQWJzb3JiKCBwaG90b246IFBob3RvbiApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAhKCBwaG90b24ud2FzRW1pdHRlZCB8fFxyXG4gICAgICAgICAgICAgIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSA9PT0gTUFYX1BIT1RPTlNfQUJTT1JCRUQgfHxcclxuICAgICAgICAgICAgICAoIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSA9PT0gMCAmJiB0aGlzLmVsZWN0cm9uSXNNb3ZpbmdQcm9wZXJ0eS52YWx1ZSApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBdHRlbXB0cyB0byBhYnNvcmIgdGhlIHNwZWNpZmllZCBwaG90b24uXHJcbiAgICogQHBhcmFtIHBob3RvblxyXG4gICAqIEByZXR1cm5zIHRydWUgaWYgdGhlIHBob3RvbiB3YXMgYWJzb3JiZWQsIGZhbHNlIGlmIGl0IHdhcyBub3QgYWJzb3JiZWRcclxuICAgKi9cclxuICBwcml2YXRlIGFic29yYlBob3RvbiggcGhvdG9uOiBQaG90b24gKTogYm9vbGVhbiB7XHJcbiAgICBsZXQgYWJzb3JiZWQgPSBmYWxzZTtcclxuICAgIGlmICggdGhpcy5jYW5BYnNvcmIoIHBob3RvbiApICkge1xyXG5cclxuICAgICAgY29uc3QgZWxlY3Ryb25Qb3NpdGlvbiA9IHRoaXMuZWxlY3Ryb24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgcGhvdG9uUG9zaXRpb24gPSBwaG90b24ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgY29sbGlzaW9uQ2xvc2VuZXNzID0gcGhvdG9uLnJhZGl1cyArIHRoaXMuZWxlY3Ryb24ucmFkaXVzO1xyXG5cclxuICAgICAgaWYgKCB0aGlzLnBvaW50c0NvbGxpZGUoIGVsZWN0cm9uUG9zaXRpb24sIHBob3RvblBvc2l0aW9uLCBjb2xsaXNpb25DbG9zZW5lc3MgKSApIHtcclxuICAgICAgICBpZiAoIGRvdFJhbmRvbS5uZXh0RG91YmxlKCkgPCBQSE9UT05fQUJTT1JQVElPTl9QUk9CQUJJTElUWSApIHtcclxuICAgICAgICAgIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSArPSAxO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5udW1iZXJPZlBob3RvbnNBYnNvcmJlZFByb3BlcnR5LnZhbHVlIDw9IE1BWF9QSE9UT05TX0FCU09SQkVEICk7XHJcbiAgICAgICAgICB0aGlzLnBob3RvbkFic29yYmVkRW1pdHRlci5lbWl0KCBwaG90b24gKTtcclxuICAgICAgICAgIGFic29yYmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhYnNvcmJlZDtcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQaG90b24gRW1pc3Npb25cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gIC8qKlxyXG4gICAqIEVtaXRzIGEgcGhvdG9uIGZyb20gdGhlIGVsZWN0cm9uJ3MgbG9jYXRpb24sIGF0IGEgcmFuZG9tIG9yaWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZW1pdFBob3RvbigpOiB2b2lkIHtcclxuICAgIGlmICggdGhpcy5udW1iZXJPZlBob3RvbnNBYnNvcmJlZFByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuXHJcbiAgICAgIHRoaXMubnVtYmVyT2ZQaG90b25zQWJzb3JiZWRQcm9wZXJ0eS52YWx1ZSAtPSAxO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGFuZCBlbWl0IGEgcGhvdG9uXHJcbiAgICAgIHRoaXMucGhvdG9uRW1pdHRlZEVtaXR0ZXIuZW1pdCggbmV3IFBob3Rvbigge1xyXG4gICAgICAgIHdhdmVsZW5ndGg6IFBIT1RPTl9FTUlTU0lPTl9XQVZFTEVOR1RILFxyXG4gICAgICAgIHBvc2l0aW9uOiB0aGlzLmVsZWN0cm9uLnBvc2l0aW9uUHJvcGVydHkudmFsdWUsIC8vIGF0IHRoZSBlbGVjdHJvbidzIHBvc2l0aW9uXHJcbiAgICAgICAgZGlyZWN0aW9uOiBNT1RIQVV0aWxzLm5leHRBbmdsZSgpLCAvLyBpbiBhIHJhbmRvbSBkaXJlY3Rpb25cclxuICAgICAgICB3YXNFbWl0dGVkOiB0cnVlLFxyXG4gICAgICAgIHRhbmRlbTogVGFuZGVtLk9QVF9PVVQgLy9UT0RPIGNyZWF0ZSB2aWEgUGhldGlvR3JvdXBcclxuICAgICAgfSApICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyBEZWZpbmVzIHRoZSBzdHJhaWdodC1saW5lIHBhdGggdGhhdCB0aGUgZWxlY3Ryb24gZm9sbG93cy5cclxuY2xhc3MgRWxlY3Ryb25MaW5lIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHgxOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHkxOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHgyOiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHkyOiBudW1iZXI7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggeDE6IG51bWJlciwgeTE6IG51bWJlciwgeDI6IG51bWJlciwgeTI6IG51bWJlciApIHtcclxuICAgIHRoaXMueDEgPSB4MTtcclxuICAgIHRoaXMueTEgPSB5MTtcclxuICAgIHRoaXMueDIgPSB4MjtcclxuICAgIHRoaXMueTIgPSB5MjtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBHZXRzIHRoZSBuZXh0IHJhbmRvbSBsaW5lIHRoYXQgZGVzY3JpYmVzIHRoZSBlbGVjdHJvbidzIG9zY2lsbGF0aW9uIHBhdGguXHJcbiAqIFRoZSBsaW5lIGlzIHNwZWNpZmllZCBpbiBjb29yZGluYXRlcyByZWxhdGl2ZSB0byB0aGUgYXRvbSAoaW4gdGhlIGF0b20ncyBsb2NhbCBjb29yZGluYXRlIGZyYW1lKS5cclxuICovXHJcbmZ1bmN0aW9uIG5leHRFbGVjdHJvbkxpbmUoIHJhZGl1czogbnVtYmVyICk6IEVsZWN0cm9uTGluZSB7XHJcbiAgY29uc3QgYW5nbGUgPSBNT1RIQVV0aWxzLm5leHRBbmdsZSgpO1xyXG4gIGNvbnN0IHggPSBNYXRoLmFicyggcmFkaXVzICogTWF0aC5zaW4oIGFuZ2xlICkgKTtcclxuICBjb25zdCB5ID0gTU9USEFVdGlscy5uZXh0U2lnbigpICogcmFkaXVzICogTWF0aC5jb3MoIGFuZ2xlICk7XHJcbiAgcmV0dXJuIG5ldyBFbGVjdHJvbkxpbmUoIC14LCAteSwgeCwgeSApO1xyXG59XHJcblxyXG4vKipcclxuICogRGV0ZXJtaW5lcyBpZiB0aGUgc2lnbiBvZiB0d28gbnVtYmVycyBpcyBkaWZmZXJlbnQuIEZhbHNlIGlmIGVpdGhlciB2YWx1ZSBpcyB6ZXJvLlxyXG4gKi9cclxuZnVuY3Rpb24gc2lnbklzRGlmZmVyZW50KCBuMTogbnVtYmVyLCBuMjogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gIHJldHVybiAoICggbjEgPiAwICYmIG4yIDwgMCApIHx8ICggbjEgPCAwICYmIG4yID4gMCApICk7XHJcbn1cclxuXHJcbm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tLnJlZ2lzdGVyKCAnUGx1bVB1ZGRpbmdNb2RlbCcsIFBsdW1QdWRkaW5nTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBRXBFLE9BQU9DLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLHFCQUFxQixNQUFNLDBDQUEwQztBQUM1RSxPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsOEJBQThCLE1BQU0seUNBQXlDO0FBQ3BGLE9BQU9DLFlBQVksTUFBK0IsbUJBQW1CO0FBQ3JFLE9BQU9DLFFBQVEsTUFBTSxlQUFlO0FBQ3BDLE9BQU9DLE1BQU0sTUFBTSxhQUFhO0FBRWhDLE9BQU9DLFVBQVUsTUFBTSxrQkFBa0I7QUFDekMsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFP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