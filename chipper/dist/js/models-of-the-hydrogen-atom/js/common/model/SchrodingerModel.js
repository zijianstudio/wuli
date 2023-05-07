// Copyright 2019-2022, University of Colorado Boulder

/**
 * SchrodingerModel is a predictive model of the hydrogen atom.
 *
 * Physical representation:
 * Electron is a probability density field. Proton is at the center, visible only when the probability density
 * field strength is below a threshold value. The atom's state has 3 components (n,l,m). See transition rules below.
 *
 * Wavefunction:
 * This implementation solves the 3D Schrodinger wavefunction, used to compute probability density values in 3D space.
 *
 * Collision behavior:
 * Identical to the "brightness" views of de Broglie, which is why this class is an extension of DeBroglieModel.
 *
 * Absorption behavior:
 * Identical to Bohr and de Broglie.
 *
 * Emission behavior:
 * Both spontaneous and stimulated emission are similar to Bohr and de Broglie, but the rules for transitions (see below)
 * are more complicated.
 *
 * Transition rules:
 * All the following rules must be obeyed when choosing a transition. Note that transitions from state nlm=(2,0,0)
 * are a special case. The lower state (1,0,0) is not possible since it violates the abs(l-l')=1 rule. The only way to
 * get out of this state (2,0,0) is by going to a higher state.
 *
 *   n = [1...6] as in Bohr and de Broglie
 *   l = [0...n-1]
 *   m = [-l...+l]
 *   abs(l-l') = 1
 *   abs(m-m') < 1
 *   n transitions have varying transition strengths
 *   valid l and m transitions have equal probability
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import schrodingerButton_png from '../../../images/schrodingerButton_png.js';
import optionize from '../../../../phet-core/js/optionize.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import DeBroglieModel from './DeBroglieModel.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import MOTHAConstants from '../MOTHAConstants.js';
import BohrModel from './BohrModel.js';
import ProbabilisticChooser from './ProbabilisticChooser.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import MOTHAUtils from '../MOTHAUtils.js';
import solveAssociatedLegendrePolynomial from './solveAssociatedLegendrePolynomial.js';
import Tandem from '../../../../tandem/js/Tandem.js';

/*
 * This table defines the transition strengths for the primary state component (n).
 * Some entries in this table are nonsensical, but their strengths are zero, and it helps to have a symmetrical table.
 * This table was taken from the Java simulation design document.
 *
 * Note that the table indexing is zero-indexed, while transitions are 1-based.
 * Here's an example that shows how the table is indexed:
 * TRANSITION_STRENGTH[5][0] is the transition strength from n=6 to n=1
 */
const TRANSITION_STRENGTH = [[0, 0, 0, 0, 0], [12.53, 0, 0, 0, 0], [3.34, 0.87, 0, 0, 0], [1.36, 0.24, 0.07, 0, 0], [0.69, 0.11, 0, 0.04, 0], [0.39, 0.06, 0.02, 0, 0]];
assert && assert(TRANSITION_STRENGTH.length === BohrModel.getNumberOfStates());
export default class SchrodingerModel extends DeBroglieModel {
  //TODO electronStateTupleProperty: Property<{ n: number, l: number, m: number }>

  // secondary electron state number (l)

  // tertiary electron state number (m)

  constructor(zoomedInBox, providedOptions) {
    const options = optionize()({
      // DeBroglieModelOptions
      displayNameProperty: ModelsOfTheHydrogenAtomStrings.schrodingerStringProperty,
      iconHTMLImageElement: schrodingerButton_png
    }, providedOptions);
    super(zoomedInBox, options);
    this.secondaryElectronStateProperty = new NumberProperty(0, {
      numberType: 'Integer',
      //TODO range is dynamic [0,n-1]
      tandem: options.tandem.createTandem('secondaryElectronStateProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'secondary electron state (l)'
    });
    this.tertiaryElectronStateProperty = new NumberProperty(0, {
      numberType: 'Integer',
      //TODO range is dynamic [-l,+l]
      tandem: options.tandem.createTandem('tertiaryElectronStateProperty'),
      phetioReadOnly: true,
      phetioDocumentation: 'tertiary electron state (m)',
      //TODO do we need to opt out here?
      rangePropertyOptions: {
        tandem: Tandem.OPT_OUT
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  step(dt) {
    //TODO
  }
  movePhoton(photon, dt) {
    //TODO
    photon.move(dt);
  }

  /**
   * Is this atom's electron in the specified state?
   */
  isInState(n, l, m) {
    return this.getElectronState() === n && this.secondaryElectronStateProperty.value === l && this.tertiaryElectronStateProperty.value === m;
  }

  /**
   * Probabilistically determines whether to absorb a photon.
   * Typically, we defer to the superclass implementation. But if we're in state (2,0,0), the probability is 100%.
   * This is not physically correct, but we want to make it easier to get out of state (2,0,0).
   */
  absorptionIsCertain() {
    if (this.getElectronState() === 2 && this.secondaryElectronStateProperty.value === 0) {
      return true;
    }
    return super.absorptionIsCertain();
  }

  /**
   * Determines if a proposed state transition caused by stimulated emission is allowed.
   */
  stimulatedEmissionIsAllowed(nOld, nNew) {
    let allowed = true;
    if (nNew === nOld) {
      allowed = false;
    } else if (nNew === 1 && this.secondaryElectronStateProperty.value === 0) {
      // transition from (n,0,0) to (1,?,?) cannot satisfy the abs(l-l')=1 rule
      allowed = false;
    } else if (nNew === 1 && this.secondaryElectronStateProperty.value !== 1) {
      // the only way to get to (1,0,0) is from (n,1,?)
      allowed = false;
    }
    return allowed;
  }

  /**
   * Chooses a new primary state (n) for the electron, -1 if there is no valid transition.
   */
  chooseLowerElectronState() {
    return getLowerPrimaryState(this.getElectronState(), this.secondaryElectronStateProperty.value);
  }

  /**
   * Sets the electron's primary state. Randomly chooses the values for the secondary and tertiary states,
   * according to state transition rules.
   */
  setElectronState(nNew) {
    const n = this.getElectronState();
    const l = this.secondaryElectronStateProperty.value;
    const m = this.tertiaryElectronStateProperty.value;
    const lNew = getNewSecondaryElectronState(nNew, l);
    const mNew = getNewTertiaryElectronState(lNew, m);

    // Verify that no transition rules have been broken.
    const valid = isaValidTransition(n, l, m, nNew, lNew, mNew, BohrModel.getNumberOfStates());
    if (valid) {
      super.setElectronState(nNew);
      this.secondaryElectronStateProperty.value = lNew;
      this.tertiaryElectronStateProperty.value = mNew;
    } else {
      // There's a bug in the implementation of the transition rules.
      // Fall back to (1,0,0) if running without assertions.
      assert && assert(false, `bad transition attempted from (${n},${l},${m}) to (${nNew},${lNew},${mNew})`);
      super.setElectronState(1);
      this.secondaryElectronStateProperty.value = 0;
      this.tertiaryElectronStateProperty.value = 0;
    }
  }

  /**
   * Our Schrodinger model emits photons from a random point on the first Bohr orbit.
   */
  getSpontaneousEmissionPosition() {
    // random point on the orbit, in polar coordinates
    const radius = this.getElectronOrbitRadius(MOTHAConstants.GROUND_STATE);
    const angle = MOTHAUtils.nextAngle();

    // convert to Cartesian coordinates, adjust for atom's position
    const x = radius * Math.cos(angle) + this.position.x;
    const y = radius * Math.sin(angle) + this.position.y;
    return new Vector2(x, y);
  }
  fireOneAbsorbablePhoton() {
    //TODO port MetastableHandler
  }

  //----------------------------------------------------------------------------
  // Wave function
  //----------------------------------------------------------------------------

  /**
   * Probability Density. This algorithm is undefined for (x,y,z) = (0,0,0).
   * @param n primary state
   * @param l secondary state
   * @param m tertiary state
   * @param x coordinate on horizontal axis
   * @param y coordinate on axis the is perpendicular to the screen
   * @param z coordinate on vertical axis
   */
  getProbabilityDensity(n, l, m, x, y, z) {
    //TODO validate state (n,l,m)
    assert && assert(!(x === 0 && y === 0 && z === 0), 'undefined for (x,y,z)=(0,0,0)');

    // convert to Polar coordinates
    const r = Math.sqrt(x * x + y * y + z * z);
    const cosTheta = Math.abs(z) / r;

    // calculate wave function
    const w = this.getWaveFunction(n, l, m, r, cosTheta);

    // square the wave function
    return w * w;
  }

  /**
   * Wavefunction.
   */
  getWaveFunction(n, l, m, r, cosTheta) {
    const t1 = this.getGeneralizedLaguerrePolynomial(n, l, r);
    const t2 = solveAssociatedLegendrePolynomial(l, Math.abs(m), cosTheta);
    return t1 * t2;
  }

  /**
   * Generalized Laguerre Polynomial.
   * Codified from design document.
   */
  getGeneralizedLaguerrePolynomial(n, l, r) {
    const a = this.getElectronOrbitRadius(n) / (n * n);
    const multiplier = Math.pow(r, l) * Math.exp(-r / (n * a));
    const b0 = 2.0 * Math.pow(n * a, -1.5); // b0
    const limit = n - l - 1;
    let bj = b0;
    let sum = b0; // j==0
    for (let j = 1; j <= limit; j++) {
      bj = 2.0 / (n * a) * ((j + l - n) / (j * (j + 2.0 * l + 1.0))) * bj;
      sum += bj * Math.pow(r, j);
    }
    return multiplier * sum;
  }
}

/**
 * Chooses a new lower value for the primary state (n).
 * The possible values of n are limited by the current value of l, since abs(l-l') must be 1.
 * The probability of each possible n transition is determined by its transition strength.
 *
 * @param nOld - the existing primary state
 * @param l - the current secondary state
 * @returns the new primary state, -1 there is no valid transition
 */
function getLowerPrimaryState(nOld, l) {
  let nNew = -1;
  if (nOld < 2) {
    // no state is lower than (1,0,0)
    return -1;
  } else if (nOld === 2) {
    if (l === 0) {
      // transition from (2,0,?) to (1,0,?) cannot satisfy the abs(l-l')=1 rule
      return -1;
    } else {
      // the only transition from (2,1,?) is (1,0,0)
      nNew = 1;
    }
  } else if (nOld > 2) {
    // determine the possible range of n
    const nMax = nOld - 1;
    let nMin = Math.max(l, 1);
    if (l === 0) {
      // transition from (n,0,0) to (1,?,?) cannot satisfy the abs(l-l')=1 rule
      nMin = 2;
    }

    // Get the strengths for each possible transition.
    const numberOfEntries = nMax - nMin + 1;
    const entries = [];
    let strengthSum = 0;
    for (let i = 0; i < numberOfEntries; i++) {
      const state = nMin + i;
      const transitionStrength = TRANSITION_STRENGTH[nOld - 1][state - 1];
      entries.push({
        value: state,
        weight: transitionStrength
      });
      strengthSum += transitionStrength;
    }

    // all transitions had zero strength, none are possible
    if (strengthSum === 0) {
      return -1;
    }

    // choose a transition
    const chooser = new ProbabilisticChooser(entries);
    const value = chooser.getNext();
    if (value === null) {
      return -1;
    }
    nNew = value;
  }
  return nNew;
}

/*
 * Chooses a value for the secondary electron state (l) based on the primary state (n).
 * The new value l' must be in [0,...n-1], and l-l' must be in [-1,1].
 * This is a direct port from the Java version.
 *
 * @param nNew - the new primary state
 * @param lOld - the existing secondary state
 */
function getNewSecondaryElectronState(nNew, lOld) {
  assert && assert(Number.isInteger(nNew));
  assert && assert(Number.isInteger(lOld));
  let lNew = 0;
  if (lOld === 0) {
    lNew = 1;
  } else if (lOld === nNew) {
    lNew = lOld - 1;
  } else if (lOld === nNew - 1) {
    lNew = lOld - 1;
  } else {
    if (dotRandom.nextBoolean()) {
      lNew = lOld + 1;
    } else {
      lNew = lOld - 1;
    }
  }
  assert && assert(Number.isInteger(lNew));
  assert && assert(Math.abs(lNew - lOld) === 1);
  return lNew;
}

/*
 * Chooses a value for the tertiary electron state (m) based on the primary state (l).
 * The new value m' must be in [-l,...,+l], and m-m' must be in [-1,0,1].
 * This is a direct port from the Java version.
 *
 * @param lNew - the new secondary state
 * @param mOld - the existing tertiary state
 */
function getNewTertiaryElectronState(lNew, mOld) {
  assert && assert(Number.isInteger(lNew));
  assert && assert(Number.isInteger(mOld));
  let mNew = 0;
  if (lNew === 0) {
    mNew = 0;
  } else if (mOld > lNew) {
    mNew = lNew;
  } else if (mOld < -lNew) {
    mNew = -lNew;
  } else if (mOld === lNew) {
    const a = dotRandom.nextInt(2);
    if (a === 0) {
      mNew = mOld;
    } else {
      mNew = mOld - 1;
    }
  } else if (mOld === -lNew) {
    const a = dotRandom.nextInt(2);
    if (a === 0) {
      mNew = mOld;
    } else {
      mNew = mOld + 1;
    }
  } else {
    const a = dotRandom.nextInt(3);
    if (a === 0) {
      mNew = mOld + 1;
    } else if (a === 1) {
      mNew = mOld - 1;
    } else {
      mNew = mOld;
    }
  }
  assert && assert(Number.isInteger(mNew));
  assert && assert(mNew >= -lNew && mNew <= lNew);
  assert && assert(mNew === -1 || mNew === 0 || mNew === 1);
  return mNew;
}

/**
 * Checks state transition rules to see if a proposed transition is valid.
 */
function isaValidTransition(nOld, lOld, mOld, nNew, lNew, mNew, numberOfStates) {
  assert && assert(Number.isInteger(nOld));
  assert && assert(Number.isInteger(lOld));
  assert && assert(Number.isInteger(mOld));
  assert && assert(Number.isInteger(nNew));
  assert && assert(Number.isInteger(lNew));
  assert && assert(Number.isInteger(mNew));
  assert && assert(Number.isInteger(numberOfStates) && numberOfStates > 0);
  return isValidState(nNew, lNew, mNew, numberOfStates) && nOld !== nNew && lNew >= 0 && lNew <= nNew - 1 && Math.abs(lOld - lNew) === 1 && Math.abs(mOld - mNew) <= 1;
}

/**
 * Validates an electron state.
 */
function isValidState(n, l, m, numberOfStates) {
  assert && assert(Number.isInteger(n));
  assert && assert(Number.isInteger(l));
  assert && assert(Number.isInteger(m));
  assert && assert(Number.isInteger(numberOfStates) && numberOfStates > 0);
  return n >= MOTHAConstants.GROUND_STATE && n <= MOTHAConstants.GROUND_STATE + numberOfStates && l >= 0 && l <= n - 1 && m >= -l && m <= l;
}
modelsOfTheHydrogenAtom.register('SchrodingerModel', SchrodingerModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzY2hyb2RpbmdlckJ1dHRvbl9wbmciLCJvcHRpb25pemUiLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIk1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncyIsIkRlQnJvZ2xpZU1vZGVsIiwiTnVtYmVyUHJvcGVydHkiLCJkb3RSYW5kb20iLCJNT1RIQUNvbnN0YW50cyIsIkJvaHJNb2RlbCIsIlByb2JhYmlsaXN0aWNDaG9vc2VyIiwiVmVjdG9yMiIsIk1PVEhBVXRpbHMiLCJzb2x2ZUFzc29jaWF0ZWRMZWdlbmRyZVBvbHlub21pYWwiLCJUYW5kZW0iLCJUUkFOU0lUSU9OX1NUUkVOR1RIIiwiYXNzZXJ0IiwibGVuZ3RoIiwiZ2V0TnVtYmVyT2ZTdGF0ZXMiLCJTY2hyb2Rpbmdlck1vZGVsIiwiY29uc3RydWN0b3IiLCJ6b29tZWRJbkJveCIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJkaXNwbGF5TmFtZVByb3BlcnR5Iiwic2Nocm9kaW5nZXJTdHJpbmdQcm9wZXJ0eSIsImljb25IVE1MSW1hZ2VFbGVtZW50Iiwic2Vjb25kYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5IiwibnVtYmVyVHlwZSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1JlYWRPbmx5IiwicGhldGlvRG9jdW1lbnRhdGlvbiIsInRlcnRpYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5IiwicmFuZ2VQcm9wZXJ0eU9wdGlvbnMiLCJPUFRfT1VUIiwiZGlzcG9zZSIsInN0ZXAiLCJkdCIsIm1vdmVQaG90b24iLCJwaG90b24iLCJtb3ZlIiwiaXNJblN0YXRlIiwibiIsImwiLCJtIiwiZ2V0RWxlY3Ryb25TdGF0ZSIsInZhbHVlIiwiYWJzb3JwdGlvbklzQ2VydGFpbiIsInN0aW11bGF0ZWRFbWlzc2lvbklzQWxsb3dlZCIsIm5PbGQiLCJuTmV3IiwiYWxsb3dlZCIsImNob29zZUxvd2VyRWxlY3Ryb25TdGF0ZSIsImdldExvd2VyUHJpbWFyeVN0YXRlIiwic2V0RWxlY3Ryb25TdGF0ZSIsImxOZXciLCJnZXROZXdTZWNvbmRhcnlFbGVjdHJvblN0YXRlIiwibU5ldyIsImdldE5ld1RlcnRpYXJ5RWxlY3Ryb25TdGF0ZSIsInZhbGlkIiwiaXNhVmFsaWRUcmFuc2l0aW9uIiwiZ2V0U3BvbnRhbmVvdXNFbWlzc2lvblBvc2l0aW9uIiwicmFkaXVzIiwiZ2V0RWxlY3Ryb25PcmJpdFJhZGl1cyIsIkdST1VORF9TVEFURSIsImFuZ2xlIiwibmV4dEFuZ2xlIiwieCIsIk1hdGgiLCJjb3MiLCJwb3NpdGlvbiIsInkiLCJzaW4iLCJmaXJlT25lQWJzb3JiYWJsZVBob3RvbiIsImdldFByb2JhYmlsaXR5RGVuc2l0eSIsInoiLCJyIiwic3FydCIsImNvc1RoZXRhIiwiYWJzIiwidyIsImdldFdhdmVGdW5jdGlvbiIsInQxIiwiZ2V0R2VuZXJhbGl6ZWRMYWd1ZXJyZVBvbHlub21pYWwiLCJ0MiIsImEiLCJtdWx0aXBsaWVyIiwicG93IiwiZXhwIiwiYjAiLCJsaW1pdCIsImJqIiwic3VtIiwiaiIsIm5NYXgiLCJuTWluIiwibWF4IiwibnVtYmVyT2ZFbnRyaWVzIiwiZW50cmllcyIsInN0cmVuZ3RoU3VtIiwiaSIsInN0YXRlIiwidHJhbnNpdGlvblN0cmVuZ3RoIiwicHVzaCIsIndlaWdodCIsImNob29zZXIiLCJnZXROZXh0IiwibE9sZCIsIk51bWJlciIsImlzSW50ZWdlciIsIm5leHRCb29sZWFuIiwibU9sZCIsIm5leHRJbnQiLCJudW1iZXJPZlN0YXRlcyIsImlzVmFsaWRTdGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiU2Nocm9kaW5nZXJNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2hyb2Rpbmdlck1vZGVsIGlzIGEgcHJlZGljdGl2ZSBtb2RlbCBvZiB0aGUgaHlkcm9nZW4gYXRvbS5cclxuICpcclxuICogUGh5c2ljYWwgcmVwcmVzZW50YXRpb246XHJcbiAqIEVsZWN0cm9uIGlzIGEgcHJvYmFiaWxpdHkgZGVuc2l0eSBmaWVsZC4gUHJvdG9uIGlzIGF0IHRoZSBjZW50ZXIsIHZpc2libGUgb25seSB3aGVuIHRoZSBwcm9iYWJpbGl0eSBkZW5zaXR5XHJcbiAqIGZpZWxkIHN0cmVuZ3RoIGlzIGJlbG93IGEgdGhyZXNob2xkIHZhbHVlLiBUaGUgYXRvbSdzIHN0YXRlIGhhcyAzIGNvbXBvbmVudHMgKG4sbCxtKS4gU2VlIHRyYW5zaXRpb24gcnVsZXMgYmVsb3cuXHJcbiAqXHJcbiAqIFdhdmVmdW5jdGlvbjpcclxuICogVGhpcyBpbXBsZW1lbnRhdGlvbiBzb2x2ZXMgdGhlIDNEIFNjaHJvZGluZ2VyIHdhdmVmdW5jdGlvbiwgdXNlZCB0byBjb21wdXRlIHByb2JhYmlsaXR5IGRlbnNpdHkgdmFsdWVzIGluIDNEIHNwYWNlLlxyXG4gKlxyXG4gKiBDb2xsaXNpb24gYmVoYXZpb3I6XHJcbiAqIElkZW50aWNhbCB0byB0aGUgXCJicmlnaHRuZXNzXCIgdmlld3Mgb2YgZGUgQnJvZ2xpZSwgd2hpY2ggaXMgd2h5IHRoaXMgY2xhc3MgaXMgYW4gZXh0ZW5zaW9uIG9mIERlQnJvZ2xpZU1vZGVsLlxyXG4gKlxyXG4gKiBBYnNvcnB0aW9uIGJlaGF2aW9yOlxyXG4gKiBJZGVudGljYWwgdG8gQm9ociBhbmQgZGUgQnJvZ2xpZS5cclxuICpcclxuICogRW1pc3Npb24gYmVoYXZpb3I6XHJcbiAqIEJvdGggc3BvbnRhbmVvdXMgYW5kIHN0aW11bGF0ZWQgZW1pc3Npb24gYXJlIHNpbWlsYXIgdG8gQm9ociBhbmQgZGUgQnJvZ2xpZSwgYnV0IHRoZSBydWxlcyBmb3IgdHJhbnNpdGlvbnMgKHNlZSBiZWxvdylcclxuICogYXJlIG1vcmUgY29tcGxpY2F0ZWQuXHJcbiAqXHJcbiAqIFRyYW5zaXRpb24gcnVsZXM6XHJcbiAqIEFsbCB0aGUgZm9sbG93aW5nIHJ1bGVzIG11c3QgYmUgb2JleWVkIHdoZW4gY2hvb3NpbmcgYSB0cmFuc2l0aW9uLiBOb3RlIHRoYXQgdHJhbnNpdGlvbnMgZnJvbSBzdGF0ZSBubG09KDIsMCwwKVxyXG4gKiBhcmUgYSBzcGVjaWFsIGNhc2UuIFRoZSBsb3dlciBzdGF0ZSAoMSwwLDApIGlzIG5vdCBwb3NzaWJsZSBzaW5jZSBpdCB2aW9sYXRlcyB0aGUgYWJzKGwtbCcpPTEgcnVsZS4gVGhlIG9ubHkgd2F5IHRvXHJcbiAqIGdldCBvdXQgb2YgdGhpcyBzdGF0ZSAoMiwwLDApIGlzIGJ5IGdvaW5nIHRvIGEgaGlnaGVyIHN0YXRlLlxyXG4gKlxyXG4gKiAgIG4gPSBbMS4uLjZdIGFzIGluIEJvaHIgYW5kIGRlIEJyb2dsaWVcclxuICogICBsID0gWzAuLi5uLTFdXHJcbiAqICAgbSA9IFstbC4uLitsXVxyXG4gKiAgIGFicyhsLWwnKSA9IDFcclxuICogICBhYnMobS1tJykgPCAxXHJcbiAqICAgbiB0cmFuc2l0aW9ucyBoYXZlIHZhcnlpbmcgdHJhbnNpdGlvbiBzdHJlbmd0aHNcclxuICogICB2YWxpZCBsIGFuZCBtIHRyYW5zaXRpb25zIGhhdmUgZXF1YWwgcHJvYmFiaWxpdHlcclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgc2Nocm9kaW5nZXJCdXR0b25fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9zY2hyb2RpbmdlckJ1dHRvbl9wbmcuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIGZyb20gJy4uLy4uL21vZGVsc09mVGhlSHlkcm9nZW5BdG9tLmpzJztcclxuaW1wb3J0IE1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncyBmcm9tICcuLi8uLi9Nb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MuanMnO1xyXG5pbXBvcnQgWm9vbWVkSW5Cb3ggZnJvbSAnLi9ab29tZWRJbkJveC5qcyc7XHJcbmltcG9ydCBQaG90b24gZnJvbSAnLi9QaG90b24uanMnO1xyXG5pbXBvcnQgRGVCcm9nbGllTW9kZWwsIHsgRGVCcm9nbGllTW9kZWxPcHRpb25zIH0gZnJvbSAnLi9EZUJyb2dsaWVNb2RlbC5qcyc7XHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IGRvdFJhbmRvbSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvZG90UmFuZG9tLmpzJztcclxuaW1wb3J0IE1PVEhBQ29uc3RhbnRzIGZyb20gJy4uL01PVEhBQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEJvaHJNb2RlbCBmcm9tICcuL0JvaHJNb2RlbC5qcyc7XHJcbmltcG9ydCBQcm9iYWJpbGlzdGljQ2hvb3NlciwgeyBQcm9iYWJpbGlzdGljQ2hvb3NlckVudHJ5IH0gZnJvbSAnLi9Qcm9iYWJpbGlzdGljQ2hvb3Nlci5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IE1PVEhBVXRpbHMgZnJvbSAnLi4vTU9USEFVdGlscy5qcyc7XHJcbmltcG9ydCBzb2x2ZUFzc29jaWF0ZWRMZWdlbmRyZVBvbHlub21pYWwgZnJvbSAnLi9zb2x2ZUFzc29jaWF0ZWRMZWdlbmRyZVBvbHlub21pYWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuLypcclxuICogVGhpcyB0YWJsZSBkZWZpbmVzIHRoZSB0cmFuc2l0aW9uIHN0cmVuZ3RocyBmb3IgdGhlIHByaW1hcnkgc3RhdGUgY29tcG9uZW50IChuKS5cclxuICogU29tZSBlbnRyaWVzIGluIHRoaXMgdGFibGUgYXJlIG5vbnNlbnNpY2FsLCBidXQgdGhlaXIgc3RyZW5ndGhzIGFyZSB6ZXJvLCBhbmQgaXQgaGVscHMgdG8gaGF2ZSBhIHN5bW1ldHJpY2FsIHRhYmxlLlxyXG4gKiBUaGlzIHRhYmxlIHdhcyB0YWtlbiBmcm9tIHRoZSBKYXZhIHNpbXVsYXRpb24gZGVzaWduIGRvY3VtZW50LlxyXG4gKlxyXG4gKiBOb3RlIHRoYXQgdGhlIHRhYmxlIGluZGV4aW5nIGlzIHplcm8taW5kZXhlZCwgd2hpbGUgdHJhbnNpdGlvbnMgYXJlIDEtYmFzZWQuXHJcbiAqIEhlcmUncyBhbiBleGFtcGxlIHRoYXQgc2hvd3MgaG93IHRoZSB0YWJsZSBpcyBpbmRleGVkOlxyXG4gKiBUUkFOU0lUSU9OX1NUUkVOR1RIWzVdWzBdIGlzIHRoZSB0cmFuc2l0aW9uIHN0cmVuZ3RoIGZyb20gbj02IHRvIG49MVxyXG4gKi9cclxuY29uc3QgVFJBTlNJVElPTl9TVFJFTkdUSCA9IFtcclxuICBbIDAsIDAsIDAsIDAsIDAgXSxcclxuICBbIDEyLjUzLCAwLCAwLCAwLCAwIF0sXHJcbiAgWyAzLjM0LCAwLjg3LCAwLCAwLCAwIF0sXHJcbiAgWyAxLjM2LCAwLjI0LCAwLjA3LCAwLCAwIF0sXHJcbiAgWyAwLjY5LCAwLjExLCAwLCAwLjA0LCAwIF0sXHJcbiAgWyAwLjM5LCAwLjA2LCAwLjAyLCAwLCAwIF1cclxuXTtcclxuYXNzZXJ0ICYmIGFzc2VydCggVFJBTlNJVElPTl9TVFJFTkdUSC5sZW5ndGggPT09IEJvaHJNb2RlbC5nZXROdW1iZXJPZlN0YXRlcygpICk7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIFNjaHJvZGluZ2VyTW9kZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBEZUJyb2dsaWVNb2RlbE9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hyb2Rpbmdlck1vZGVsIGV4dGVuZHMgRGVCcm9nbGllTW9kZWwge1xyXG5cclxuICAvL1RPRE8gZWxlY3Ryb25TdGF0ZVR1cGxlUHJvcGVydHk6IFByb3BlcnR5PHsgbjogbnVtYmVyLCBsOiBudW1iZXIsIG06IG51bWJlciB9PlxyXG5cclxuICAvLyBzZWNvbmRhcnkgZWxlY3Ryb24gc3RhdGUgbnVtYmVyIChsKVxyXG4gIHB1YmxpYyByZWFkb25seSBzZWNvbmRhcnlFbGVjdHJvblN0YXRlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG5cclxuICAvLyB0ZXJ0aWFyeSBlbGVjdHJvbiBzdGF0ZSBudW1iZXIgKG0pXHJcbiAgcHVibGljIHJlYWRvbmx5IHRlcnRpYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5OiBOdW1iZXJQcm9wZXJ0eTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB6b29tZWRJbkJveDogWm9vbWVkSW5Cb3gsIHByb3ZpZGVkT3B0aW9uczogU2Nocm9kaW5nZXJNb2RlbE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxTY2hyb2Rpbmdlck1vZGVsT3B0aW9ucywgU2VsZk9wdGlvbnMsIERlQnJvZ2xpZU1vZGVsT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gRGVCcm9nbGllTW9kZWxPcHRpb25zXHJcbiAgICAgIGRpc3BsYXlOYW1lUHJvcGVydHk6IE1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5zY2hyb2RpbmdlclN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBpY29uSFRNTEltYWdlRWxlbWVudDogc2Nocm9kaW5nZXJCdXR0b25fcG5nXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggem9vbWVkSW5Cb3gsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnNlY29uZGFyeUVsZWN0cm9uU3RhdGVQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIC8vVE9ETyByYW5nZSBpcyBkeW5hbWljIFswLG4tMV1cclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdzZWNvbmRhcnlFbGVjdHJvblN0YXRlUHJvcGVydHknICksXHJcbiAgICAgIHBoZXRpb1JlYWRPbmx5OiB0cnVlLFxyXG4gICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnc2Vjb25kYXJ5IGVsZWN0cm9uIHN0YXRlIChsKSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnRlcnRpYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5ID0gbmV3IE51bWJlclByb3BlcnR5KCAwLCB7XHJcbiAgICAgIG51bWJlclR5cGU6ICdJbnRlZ2VyJyxcclxuICAgICAgLy9UT0RPIHJhbmdlIGlzIGR5bmFtaWMgWy1sLCtsXVxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RlcnRpYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5JyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ3RlcnRpYXJ5IGVsZWN0cm9uIHN0YXRlIChtKScsXHJcbiAgICAgIC8vVE9ETyBkbyB3ZSBuZWVkIHRvIG9wdCBvdXQgaGVyZT9cclxuICAgICAgcmFuZ2VQcm9wZXJ0eU9wdGlvbnM6IHtcclxuICAgICAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIC8vVE9ET1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIG1vdmVQaG90b24oIHBob3RvbjogUGhvdG9uLCBkdDogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgLy9UT0RPXHJcbiAgICBwaG90b24ubW92ZSggZHQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIElzIHRoaXMgYXRvbSdzIGVsZWN0cm9uIGluIHRoZSBzcGVjaWZpZWQgc3RhdGU/XHJcbiAgICovXHJcbiAgcHVibGljIGlzSW5TdGF0ZSggbjogbnVtYmVyLCBsOiBudW1iZXIsIG06IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIHJldHVybiAoIHRoaXMuZ2V0RWxlY3Ryb25TdGF0ZSgpID09PSBuICkgJiZcclxuICAgICAgICAgICAoIHRoaXMuc2Vjb25kYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlID09PSBsICkgJiZcclxuICAgICAgICAgICAoIHRoaXMudGVydGlhcnlFbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWUgPT09IG0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFByb2JhYmlsaXN0aWNhbGx5IGRldGVybWluZXMgd2hldGhlciB0byBhYnNvcmIgYSBwaG90b24uXHJcbiAgICogVHlwaWNhbGx5LCB3ZSBkZWZlciB0byB0aGUgc3VwZXJjbGFzcyBpbXBsZW1lbnRhdGlvbi4gQnV0IGlmIHdlJ3JlIGluIHN0YXRlICgyLDAsMCksIHRoZSBwcm9iYWJpbGl0eSBpcyAxMDAlLlxyXG4gICAqIFRoaXMgaXMgbm90IHBoeXNpY2FsbHkgY29ycmVjdCwgYnV0IHdlIHdhbnQgdG8gbWFrZSBpdCBlYXNpZXIgdG8gZ2V0IG91dCBvZiBzdGF0ZSAoMiwwLDApLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBhYnNvcnB0aW9uSXNDZXJ0YWluKCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCB0aGlzLmdldEVsZWN0cm9uU3RhdGUoKSA9PT0gMiAmJiB0aGlzLnNlY29uZGFyeUVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9PT0gMCApIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3VwZXIuYWJzb3JwdGlvbklzQ2VydGFpbigpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGV0ZXJtaW5lcyBpZiBhIHByb3Bvc2VkIHN0YXRlIHRyYW5zaXRpb24gY2F1c2VkIGJ5IHN0aW11bGF0ZWQgZW1pc3Npb24gaXMgYWxsb3dlZC5cclxuICAgKi9cclxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgc3RpbXVsYXRlZEVtaXNzaW9uSXNBbGxvd2VkKCBuT2xkOiBudW1iZXIsIG5OZXc6IG51bWJlciApOiBib29sZWFuIHtcclxuICAgIGxldCBhbGxvd2VkID0gdHJ1ZTtcclxuICAgIGlmICggbk5ldyA9PT0gbk9sZCApIHtcclxuICAgICAgYWxsb3dlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIG5OZXcgPT09IDEgJiYgdGhpcy5zZWNvbmRhcnlFbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWUgPT09IDAgKSB7XHJcblxyXG4gICAgICAvLyB0cmFuc2l0aW9uIGZyb20gKG4sMCwwKSB0byAoMSw/LD8pIGNhbm5vdCBzYXRpc2Z5IHRoZSBhYnMobC1sJyk9MSBydWxlXHJcbiAgICAgIGFsbG93ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCBuTmV3ID09PSAxICYmIHRoaXMuc2Vjb25kYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlICE9PSAxICkge1xyXG5cclxuICAgICAgLy8gdGhlIG9ubHkgd2F5IHRvIGdldCB0byAoMSwwLDApIGlzIGZyb20gKG4sMSw/KVxyXG4gICAgICBhbGxvd2VkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsbG93ZWQ7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDaG9vc2VzIGEgbmV3IHByaW1hcnkgc3RhdGUgKG4pIGZvciB0aGUgZWxlY3Ryb24sIC0xIGlmIHRoZXJlIGlzIG5vIHZhbGlkIHRyYW5zaXRpb24uXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNob29zZUxvd2VyRWxlY3Ryb25TdGF0ZSgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGdldExvd2VyUHJpbWFyeVN0YXRlKCB0aGlzLmdldEVsZWN0cm9uU3RhdGUoKSwgdGhpcy5zZWNvbmRhcnlFbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGVsZWN0cm9uJ3MgcHJpbWFyeSBzdGF0ZS4gUmFuZG9tbHkgY2hvb3NlcyB0aGUgdmFsdWVzIGZvciB0aGUgc2Vjb25kYXJ5IGFuZCB0ZXJ0aWFyeSBzdGF0ZXMsXHJcbiAgICogYWNjb3JkaW5nIHRvIHN0YXRlIHRyYW5zaXRpb24gcnVsZXMuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHNldEVsZWN0cm9uU3RhdGUoIG5OZXc6IG51bWJlciApOiB2b2lkIHtcclxuXHJcbiAgICBjb25zdCBuID0gdGhpcy5nZXRFbGVjdHJvblN0YXRlKCk7XHJcbiAgICBjb25zdCBsID0gdGhpcy5zZWNvbmRhcnlFbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBtID0gdGhpcy50ZXJ0aWFyeUVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBjb25zdCBsTmV3ID0gZ2V0TmV3U2Vjb25kYXJ5RWxlY3Ryb25TdGF0ZSggbk5ldywgbCApO1xyXG4gICAgY29uc3QgbU5ldyA9IGdldE5ld1RlcnRpYXJ5RWxlY3Ryb25TdGF0ZSggbE5ldywgbSApO1xyXG5cclxuICAgIC8vIFZlcmlmeSB0aGF0IG5vIHRyYW5zaXRpb24gcnVsZXMgaGF2ZSBiZWVuIGJyb2tlbi5cclxuICAgIGNvbnN0IHZhbGlkID0gaXNhVmFsaWRUcmFuc2l0aW9uKCBuLCBsLCBtLCBuTmV3LCBsTmV3LCBtTmV3LCBCb2hyTW9kZWwuZ2V0TnVtYmVyT2ZTdGF0ZXMoKSApO1xyXG4gICAgaWYgKCB2YWxpZCApIHtcclxuICAgICAgc3VwZXIuc2V0RWxlY3Ryb25TdGF0ZSggbk5ldyApO1xyXG4gICAgICB0aGlzLnNlY29uZGFyeUVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IGxOZXc7XHJcbiAgICAgIHRoaXMudGVydGlhcnlFbGVjdHJvblN0YXRlUHJvcGVydHkudmFsdWUgPSBtTmV3O1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBUaGVyZSdzIGEgYnVnIGluIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgdHJhbnNpdGlvbiBydWxlcy5cclxuICAgICAgLy8gRmFsbCBiYWNrIHRvICgxLDAsMCkgaWYgcnVubmluZyB3aXRob3V0IGFzc2VydGlvbnMuXHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCBgYmFkIHRyYW5zaXRpb24gYXR0ZW1wdGVkIGZyb20gKCR7bn0sJHtsfSwke219KSB0byAoJHtuTmV3fSwke2xOZXd9LCR7bU5ld30pYCApO1xyXG4gICAgICBzdXBlci5zZXRFbGVjdHJvblN0YXRlKCAxICk7XHJcbiAgICAgIHRoaXMuc2Vjb25kYXJ5RWxlY3Ryb25TdGF0ZVByb3BlcnR5LnZhbHVlID0gMDtcclxuICAgICAgdGhpcy50ZXJ0aWFyeUVsZWN0cm9uU3RhdGVQcm9wZXJ0eS52YWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBPdXIgU2Nocm9kaW5nZXIgbW9kZWwgZW1pdHMgcGhvdG9ucyBmcm9tIGEgcmFuZG9tIHBvaW50IG9uIHRoZSBmaXJzdCBCb2hyIG9yYml0LlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBnZXRTcG9udGFuZW91c0VtaXNzaW9uUG9zaXRpb24oKTogVmVjdG9yMiB7XHJcblxyXG4gICAgLy8gcmFuZG9tIHBvaW50IG9uIHRoZSBvcmJpdCwgaW4gcG9sYXIgY29vcmRpbmF0ZXNcclxuICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuZ2V0RWxlY3Ryb25PcmJpdFJhZGl1cyggTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICk7XHJcbiAgICBjb25zdCBhbmdsZSA9IE1PVEhBVXRpbHMubmV4dEFuZ2xlKCk7XHJcblxyXG4gICAgLy8gY29udmVydCB0byBDYXJ0ZXNpYW4gY29vcmRpbmF0ZXMsIGFkanVzdCBmb3IgYXRvbSdzIHBvc2l0aW9uXHJcbiAgICBjb25zdCB4ID0gKCByYWRpdXMgKiBNYXRoLmNvcyggYW5nbGUgKSApICsgdGhpcy5wb3NpdGlvbi54O1xyXG4gICAgY29uc3QgeSA9ICggcmFkaXVzICogTWF0aC5zaW4oIGFuZ2xlICkgKSArIHRoaXMucG9zaXRpb24ueTtcclxuICAgIHJldHVybiBuZXcgVmVjdG9yMiggeCwgeSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGZpcmVPbmVBYnNvcmJhYmxlUGhvdG9uKCk6IHZvaWQge1xyXG4gICAgLy9UT0RPIHBvcnQgTWV0YXN0YWJsZUhhbmRsZXJcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gIC8vIFdhdmUgZnVuY3Rpb25cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLyoqXHJcbiAgICogUHJvYmFiaWxpdHkgRGVuc2l0eS4gVGhpcyBhbGdvcml0aG0gaXMgdW5kZWZpbmVkIGZvciAoeCx5LHopID0gKDAsMCwwKS5cclxuICAgKiBAcGFyYW0gbiBwcmltYXJ5IHN0YXRlXHJcbiAgICogQHBhcmFtIGwgc2Vjb25kYXJ5IHN0YXRlXHJcbiAgICogQHBhcmFtIG0gdGVydGlhcnkgc3RhdGVcclxuICAgKiBAcGFyYW0geCBjb29yZGluYXRlIG9uIGhvcml6b250YWwgYXhpc1xyXG4gICAqIEBwYXJhbSB5IGNvb3JkaW5hdGUgb24gYXhpcyB0aGUgaXMgcGVycGVuZGljdWxhciB0byB0aGUgc2NyZWVuXHJcbiAgICogQHBhcmFtIHogY29vcmRpbmF0ZSBvbiB2ZXJ0aWNhbCBheGlzXHJcbiAgICovXHJcbiAgcHVibGljIGdldFByb2JhYmlsaXR5RGVuc2l0eSggbjogbnVtYmVyLCBsOiBudW1iZXIsIG06IG51bWJlciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgLy9UT0RPIHZhbGlkYXRlIHN0YXRlIChuLGwsbSlcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICEoIHggPT09IDAgJiYgeSA9PT0gMCAmJiB6ID09PSAwICksICd1bmRlZmluZWQgZm9yICh4LHkseik9KDAsMCwwKScgKTtcclxuXHJcbiAgICAvLyBjb252ZXJ0IHRvIFBvbGFyIGNvb3JkaW5hdGVzXHJcbiAgICBjb25zdCByID0gTWF0aC5zcXJ0KCAoIHggKiB4ICkgKyAoIHkgKiB5ICkgKyAoIHogKiB6ICkgKTtcclxuICAgIGNvbnN0IGNvc1RoZXRhID0gTWF0aC5hYnMoIHogKSAvIHI7XHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHdhdmUgZnVuY3Rpb25cclxuICAgIGNvbnN0IHcgPSB0aGlzLmdldFdhdmVGdW5jdGlvbiggbiwgbCwgbSwgciwgY29zVGhldGEgKTtcclxuXHJcbiAgICAvLyBzcXVhcmUgdGhlIHdhdmUgZnVuY3Rpb25cclxuICAgIHJldHVybiAoIHcgKiB3ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBXYXZlZnVuY3Rpb24uXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRXYXZlRnVuY3Rpb24oIG46IG51bWJlciwgbDogbnVtYmVyLCBtOiBudW1iZXIsIHI6IG51bWJlciwgY29zVGhldGE6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgY29uc3QgdDEgPSB0aGlzLmdldEdlbmVyYWxpemVkTGFndWVycmVQb2x5bm9taWFsKCBuLCBsLCByICk7XHJcbiAgICBjb25zdCB0MiA9IHNvbHZlQXNzb2NpYXRlZExlZ2VuZHJlUG9seW5vbWlhbCggbCwgTWF0aC5hYnMoIG0gKSwgY29zVGhldGEgKTtcclxuICAgIHJldHVybiAoIHQxICogdDIgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYWxpemVkIExhZ3VlcnJlIFBvbHlub21pYWwuXHJcbiAgICogQ29kaWZpZWQgZnJvbSBkZXNpZ24gZG9jdW1lbnQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBnZXRHZW5lcmFsaXplZExhZ3VlcnJlUG9seW5vbWlhbCggbjogbnVtYmVyLCBsOiBudW1iZXIsIHI6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgY29uc3QgYSA9IHRoaXMuZ2V0RWxlY3Ryb25PcmJpdFJhZGl1cyggbiApIC8gKCBuICogbiApO1xyXG4gICAgY29uc3QgbXVsdGlwbGllciA9IE1hdGgucG93KCByLCBsICkgKiBNYXRoLmV4cCggLXIgLyAoIG4gKiBhICkgKTtcclxuICAgIGNvbnN0IGIwID0gMi4wICogTWF0aC5wb3coICggbiAqIGEgKSwgKCAtMS41ICkgKTsgLy8gYjBcclxuICAgIGNvbnN0IGxpbWl0ID0gbiAtIGwgLSAxO1xyXG4gICAgbGV0IGJqID0gYjA7XHJcbiAgICBsZXQgc3VtID0gYjA7IC8vIGo9PTBcclxuICAgIGZvciAoIGxldCBqID0gMTsgaiA8PSBsaW1pdDsgaisrICkge1xyXG4gICAgICBiaiA9ICggMi4wIC8gKCBuICogYSApICkgKiAoICggaiArIGwgLSBuICkgLyAoIGogKiAoIGogKyAoIDIuMCAqIGwgKSArIDEuMCApICkgKSAqIGJqO1xyXG4gICAgICBzdW0gKz0gKCBiaiAqIE1hdGgucG93KCByLCBqICkgKTtcclxuICAgIH1cclxuICAgIHJldHVybiAoIG11bHRpcGxpZXIgKiBzdW0gKTtcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaG9vc2VzIGEgbmV3IGxvd2VyIHZhbHVlIGZvciB0aGUgcHJpbWFyeSBzdGF0ZSAobikuXHJcbiAqIFRoZSBwb3NzaWJsZSB2YWx1ZXMgb2YgbiBhcmUgbGltaXRlZCBieSB0aGUgY3VycmVudCB2YWx1ZSBvZiBsLCBzaW5jZSBhYnMobC1sJykgbXVzdCBiZSAxLlxyXG4gKiBUaGUgcHJvYmFiaWxpdHkgb2YgZWFjaCBwb3NzaWJsZSBuIHRyYW5zaXRpb24gaXMgZGV0ZXJtaW5lZCBieSBpdHMgdHJhbnNpdGlvbiBzdHJlbmd0aC5cclxuICpcclxuICogQHBhcmFtIG5PbGQgLSB0aGUgZXhpc3RpbmcgcHJpbWFyeSBzdGF0ZVxyXG4gKiBAcGFyYW0gbCAtIHRoZSBjdXJyZW50IHNlY29uZGFyeSBzdGF0ZVxyXG4gKiBAcmV0dXJucyB0aGUgbmV3IHByaW1hcnkgc3RhdGUsIC0xIHRoZXJlIGlzIG5vIHZhbGlkIHRyYW5zaXRpb25cclxuICovXHJcbmZ1bmN0aW9uIGdldExvd2VyUHJpbWFyeVN0YXRlKCBuT2xkOiBudW1iZXIsIGw6IG51bWJlciApOiBudW1iZXIge1xyXG5cclxuICBsZXQgbk5ldyA9IC0xO1xyXG5cclxuICBpZiAoIG5PbGQgPCAyICkge1xyXG4gICAgLy8gbm8gc3RhdGUgaXMgbG93ZXIgdGhhbiAoMSwwLDApXHJcbiAgICByZXR1cm4gLTE7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBuT2xkID09PSAyICkge1xyXG4gICAgaWYgKCBsID09PSAwICkge1xyXG5cclxuICAgICAgLy8gdHJhbnNpdGlvbiBmcm9tICgyLDAsPykgdG8gKDEsMCw/KSBjYW5ub3Qgc2F0aXNmeSB0aGUgYWJzKGwtbCcpPTEgcnVsZVxyXG4gICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIHRoZSBvbmx5IHRyYW5zaXRpb24gZnJvbSAoMiwxLD8pIGlzICgxLDAsMClcclxuICAgICAgbk5ldyA9IDE7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBuT2xkID4gMiApIHtcclxuXHJcbiAgICAvLyBkZXRlcm1pbmUgdGhlIHBvc3NpYmxlIHJhbmdlIG9mIG5cclxuICAgIGNvbnN0IG5NYXggPSBuT2xkIC0gMTtcclxuICAgIGxldCBuTWluID0gTWF0aC5tYXgoIGwsIDEgKTtcclxuICAgIGlmICggbCA9PT0gMCApIHtcclxuXHJcbiAgICAgIC8vIHRyYW5zaXRpb24gZnJvbSAobiwwLDApIHRvICgxLD8sPykgY2Fubm90IHNhdGlzZnkgdGhlIGFicyhsLWwnKT0xIHJ1bGVcclxuICAgICAgbk1pbiA9IDI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHRoZSBzdHJlbmd0aHMgZm9yIGVhY2ggcG9zc2libGUgdHJhbnNpdGlvbi5cclxuICAgIGNvbnN0IG51bWJlck9mRW50cmllcyA9IG5NYXggLSBuTWluICsgMTtcclxuICAgIGNvbnN0IGVudHJpZXM6IFByb2JhYmlsaXN0aWNDaG9vc2VyRW50cnk8bnVtYmVyPltdID0gW107XHJcbiAgICBsZXQgc3RyZW5ndGhTdW0gPSAwO1xyXG4gICAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZFbnRyaWVzOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHN0YXRlID0gbk1pbiArIGk7XHJcbiAgICAgIGNvbnN0IHRyYW5zaXRpb25TdHJlbmd0aCA9IFRSQU5TSVRJT05fU1RSRU5HVEhbIG5PbGQgLSAxIF1bIHN0YXRlIC0gMSBdO1xyXG4gICAgICBlbnRyaWVzLnB1c2goIHsgdmFsdWU6IHN0YXRlLCB3ZWlnaHQ6IHRyYW5zaXRpb25TdHJlbmd0aCB9ICk7XHJcbiAgICAgIHN0cmVuZ3RoU3VtICs9IHRyYW5zaXRpb25TdHJlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhbGwgdHJhbnNpdGlvbnMgaGFkIHplcm8gc3RyZW5ndGgsIG5vbmUgYXJlIHBvc3NpYmxlXHJcbiAgICBpZiAoIHN0cmVuZ3RoU3VtID09PSAwICkge1xyXG4gICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hvb3NlIGEgdHJhbnNpdGlvblxyXG4gICAgY29uc3QgY2hvb3NlciA9IG5ldyBQcm9iYWJpbGlzdGljQ2hvb3NlciggZW50cmllcyApO1xyXG4gICAgY29uc3QgdmFsdWUgPSBjaG9vc2VyLmdldE5leHQoKTtcclxuICAgIGlmICggdmFsdWUgPT09IG51bGwgKSB7XHJcbiAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIG5OZXcgPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBuTmV3O1xyXG59XHJcblxyXG4vKlxyXG4gKiBDaG9vc2VzIGEgdmFsdWUgZm9yIHRoZSBzZWNvbmRhcnkgZWxlY3Ryb24gc3RhdGUgKGwpIGJhc2VkIG9uIHRoZSBwcmltYXJ5IHN0YXRlIChuKS5cclxuICogVGhlIG5ldyB2YWx1ZSBsJyBtdXN0IGJlIGluIFswLC4uLm4tMV0sIGFuZCBsLWwnIG11c3QgYmUgaW4gWy0xLDFdLlxyXG4gKiBUaGlzIGlzIGEgZGlyZWN0IHBvcnQgZnJvbSB0aGUgSmF2YSB2ZXJzaW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0gbk5ldyAtIHRoZSBuZXcgcHJpbWFyeSBzdGF0ZVxyXG4gKiBAcGFyYW0gbE9sZCAtIHRoZSBleGlzdGluZyBzZWNvbmRhcnkgc3RhdGVcclxuICovXHJcbmZ1bmN0aW9uIGdldE5ld1NlY29uZGFyeUVsZWN0cm9uU3RhdGUoIG5OZXc6IG51bWJlciwgbE9sZDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbk5ldyApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbE9sZCApICk7XHJcblxyXG4gIGxldCBsTmV3ID0gMDtcclxuXHJcbiAgaWYgKCBsT2xkID09PSAwICkge1xyXG4gICAgbE5ldyA9IDE7XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBsT2xkID09PSBuTmV3ICkge1xyXG4gICAgbE5ldyA9IGxPbGQgLSAxO1xyXG4gIH1cclxuICBlbHNlIGlmICggbE9sZCA9PT0gbk5ldyAtIDEgKSB7XHJcbiAgICBsTmV3ID0gbE9sZCAtIDE7XHJcbiAgfVxyXG4gIGVsc2Uge1xyXG4gICAgaWYgKCBkb3RSYW5kb20ubmV4dEJvb2xlYW4oKSApIHtcclxuICAgICAgbE5ldyA9IGxPbGQgKyAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGxOZXcgPSBsT2xkIC0gMTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGxOZXcgKSApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE1hdGguYWJzKCBsTmV3IC0gbE9sZCApID09PSAxICk7XHJcbiAgcmV0dXJuIGxOZXc7XHJcbn1cclxuXHJcbi8qXHJcbiAqIENob29zZXMgYSB2YWx1ZSBmb3IgdGhlIHRlcnRpYXJ5IGVsZWN0cm9uIHN0YXRlIChtKSBiYXNlZCBvbiB0aGUgcHJpbWFyeSBzdGF0ZSAobCkuXHJcbiAqIFRoZSBuZXcgdmFsdWUgbScgbXVzdCBiZSBpbiBbLWwsLi4uLCtsXSwgYW5kIG0tbScgbXVzdCBiZSBpbiBbLTEsMCwxXS5cclxuICogVGhpcyBpcyBhIGRpcmVjdCBwb3J0IGZyb20gdGhlIEphdmEgdmVyc2lvbi5cclxuICpcclxuICogQHBhcmFtIGxOZXcgLSB0aGUgbmV3IHNlY29uZGFyeSBzdGF0ZVxyXG4gKiBAcGFyYW0gbU9sZCAtIHRoZSBleGlzdGluZyB0ZXJ0aWFyeSBzdGF0ZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0TmV3VGVydGlhcnlFbGVjdHJvblN0YXRlKCBsTmV3OiBudW1iZXIsIG1PbGQ6IG51bWJlciApOiBudW1iZXIge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGxOZXcgKSApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG1PbGQgKSApO1xyXG5cclxuICBsZXQgbU5ldyA9IDA7XHJcblxyXG4gIGlmICggbE5ldyA9PT0gMCApIHtcclxuICAgIG1OZXcgPSAwO1xyXG4gIH1cclxuICBlbHNlIGlmICggbU9sZCA+IGxOZXcgKSB7XHJcbiAgICBtTmV3ID0gbE5ldztcclxuICB9XHJcbiAgZWxzZSBpZiAoIG1PbGQgPCAtbE5ldyApIHtcclxuICAgIG1OZXcgPSAtbE5ldztcclxuICB9XHJcbiAgZWxzZSBpZiAoIG1PbGQgPT09IGxOZXcgKSB7XHJcbiAgICBjb25zdCBhID0gZG90UmFuZG9tLm5leHRJbnQoIDIgKTtcclxuICAgIGlmICggYSA9PT0gMCApIHtcclxuICAgICAgbU5ldyA9IG1PbGQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbU5ldyA9IG1PbGQgLSAxO1xyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIGlmICggbU9sZCA9PT0gLWxOZXcgKSB7XHJcbiAgICBjb25zdCBhID0gZG90UmFuZG9tLm5leHRJbnQoIDIgKTtcclxuICAgIGlmICggYSA9PT0gMCApIHtcclxuICAgICAgbU5ldyA9IG1PbGQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbU5ldyA9IG1PbGQgKyAxO1xyXG4gICAgfVxyXG4gIH1cclxuICBlbHNlIHtcclxuICAgIGNvbnN0IGEgPSBkb3RSYW5kb20ubmV4dEludCggMyApO1xyXG4gICAgaWYgKCBhID09PSAwICkge1xyXG4gICAgICBtTmV3ID0gbU9sZCArIDE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggYSA9PT0gMSApIHtcclxuICAgICAgbU5ldyA9IG1PbGQgLSAxO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIG1OZXcgPSBtT2xkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbU5ldyApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggbU5ldyA+PSAtbE5ldyAmJiBtTmV3IDw9IGxOZXcgKTtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBtTmV3ID09PSAtMSB8fCBtTmV3ID09PSAwIHx8IG1OZXcgPT09IDEgKTtcclxuICByZXR1cm4gbU5ldztcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBzdGF0ZSB0cmFuc2l0aW9uIHJ1bGVzIHRvIHNlZSBpZiBhIHByb3Bvc2VkIHRyYW5zaXRpb24gaXMgdmFsaWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc2FWYWxpZFRyYW5zaXRpb24oIG5PbGQ6IG51bWJlciwgbE9sZDogbnVtYmVyLCBtT2xkOiBudW1iZXIsIG5OZXc6IG51bWJlciwgbE5ldzogbnVtYmVyLCBtTmV3OiBudW1iZXIsIG51bWJlck9mU3RhdGVzOiBudW1iZXIgKTogYm9vbGVhbiB7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbk9sZCApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbE9sZCApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbU9sZCApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbk5ldyApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbE5ldyApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbU5ldyApICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbnVtYmVyT2ZTdGF0ZXMgKSAmJiBudW1iZXJPZlN0YXRlcyA+IDAgKTtcclxuXHJcbiAgcmV0dXJuIGlzVmFsaWRTdGF0ZSggbk5ldywgbE5ldywgbU5ldywgbnVtYmVyT2ZTdGF0ZXMgKSAmJlxyXG4gICAgICAgICAoIG5PbGQgIT09IG5OZXcgKSAmJlxyXG4gICAgICAgICAoIGxOZXcgPj0gMCAmJiBsTmV3IDw9IG5OZXcgLSAxICkgJiZcclxuICAgICAgICAgKCBNYXRoLmFicyggbE9sZCAtIGxOZXcgKSA9PT0gMSApICYmXHJcbiAgICAgICAgICggTWF0aC5hYnMoIG1PbGQgLSBtTmV3ICkgPD0gMSApO1xyXG59XHJcblxyXG4vKipcclxuICogVmFsaWRhdGVzIGFuIGVsZWN0cm9uIHN0YXRlLlxyXG4gKi9cclxuZnVuY3Rpb24gaXNWYWxpZFN0YXRlKCBuOiBudW1iZXIsIGw6IG51bWJlciwgbTogbnVtYmVyLCBudW1iZXJPZlN0YXRlczogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG4gKSApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIGwgKSApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG0gKSApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG51bWJlck9mU3RhdGVzICkgJiYgbnVtYmVyT2ZTdGF0ZXMgPiAwICk7XHJcblxyXG4gIHJldHVybiAoIG4gPj0gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICYmIG4gPD0gTU9USEFDb25zdGFudHMuR1JPVU5EX1NUQVRFICsgbnVtYmVyT2ZTdGF0ZXMgKSAmJlxyXG4gICAgICAgICAoIGwgPj0gMCAmJiBsIDw9IG4gLSAxICkgJiZcclxuICAgICAgICAgKCBtID49IC1sICYmIG0gPD0gbCApO1xyXG59XHJcblxyXG5tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5yZWdpc3RlciggJ1NjaHJvZGluZ2VyTW9kZWwnLCBTY2hyb2Rpbmdlck1vZGVsICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLHFCQUFxQixNQUFNLDBDQUEwQztBQUM1RSxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUNuRixPQUFPQyx1QkFBdUIsTUFBTSxrQ0FBa0M7QUFDdEUsT0FBT0MsOEJBQThCLE1BQU0seUNBQXlDO0FBR3BGLE9BQU9DLGNB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