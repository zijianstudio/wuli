// Copyright 2014-2023, University of Colorado Boulder

/**
 * Creates challenges where level-of-difficulty is based on the number variables that
 * we're solving for, and whether the variables are 'Before' or 'After' terms.
 *
 * Behavior is:
 * - Level 1: one or two products random, Before (2 variables)
 * - Level 2: one product random, After
 * - Level 3: two products random, After (4 variables)
 *
 * Additional requirements:
 * - all coefficients will be > 0
 * - all reactant quantities will be > 0
 * - every game will contain exactly one zero-products challenge
 * - game will contain no duplicate reactions
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import BoxType from '../../common/model/BoxType.js';
import ReactionFactory from '../../common/model/ReactionFactory.js';
import RPALConstants from '../../common/RPALConstants.js';
import RPALQueryParameters from '../../common/RPALQueryParameters.js';
import DevStringUtils from '../../dev/DevStringUtils.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
import Challenge from './Challenge.js';
const CHALLENGES_PER_LEVEL = 5;
// level 2 is all the one-product reactions
const LEVEL2_POOL = [ReactionFactory.Reaction_PCl3_Cl2__PCl5,
// PCl5 is the largest molecule in this pool, so put this first for layout debugging
ReactionFactory.makeWater, ReactionFactory.Reaction_H2_F2__2HF, ReactionFactory.Reaction_H2_Cl2__2HCl, ReactionFactory.Reaction_CO_2H2__CH3OH, ReactionFactory.Reaction_CH2O_H2__CH3OH, ReactionFactory.Reaction_C2H4_H2__C2H6, ReactionFactory.Reaction_C2H2_2H2__C2H6, ReactionFactory.Reaction_C_O2__CO2, ReactionFactory.Reaction_2C_O2__2CO, ReactionFactory.Reaction_2CO_O2__2CO2, ReactionFactory.Reaction_C_CO2__2CO, ReactionFactory.Reaction_C_2S__CS2, ReactionFactory.makeAmmonia, ReactionFactory.Reaction_N2_O2__2NO, ReactionFactory.Reaction_2NO_O2__2NO2, ReactionFactory.Reaction_2N2_O2__2N2O, ReactionFactory.Reaction_P4_6H2__4PH3, ReactionFactory.Reaction_P4_6F2__4PF3, ReactionFactory.Reaction_P4_6Cl2__4PCl3, ReactionFactory.Reaction_2SO2_O2__2SO3];

// level 3 is all the two-product reactions
const LEVEL3_POOL = [ReactionFactory.Reaction_C2H5OH_3O2__2CO2_3H2O,
// C2H5OH has the most atoms in this pool, so put this first for performance debugging
ReactionFactory.Reaction_2C_2H2O__CH4_CO2, ReactionFactory.Reaction_CH4_H2O__3H2_CO, ReactionFactory.combustMethane, ReactionFactory.Reaction_2C2H6_7O2__4CO2_6H2O, ReactionFactory.Reaction_C2H4_3O2__2CO2_2H2O, ReactionFactory.Reaction_2C2H2_5O2__4CO2_2H2O, ReactionFactory.Reaction_C2H6_Cl2__C2H5Cl_HCl, ReactionFactory.Reaction_CH4_4S__CS2_2H2S, ReactionFactory.Reaction_CS2_3O2__CO2_2SO2, ReactionFactory.Reaction_4NH3_3O2__2N2_6H2O, ReactionFactory.Reaction_4NH3_5O2__4NO_6H2O, ReactionFactory.Reaction_4NH3_7O2__4NO2_6H2O, ReactionFactory.Reaction_4NH3_6NO__5N2_6H2O, ReactionFactory.Reaction_SO2_2H2__S_2H2O, ReactionFactory.Reaction_SO2_3H2__H2S_2H2O, ReactionFactory.Reaction_2F2_H2O__OF2_2HF, ReactionFactory.Reaction_OF2_H2O__O2_2HF];

// level 1 is all the reactions
const LEVEL1_POOL = LEVEL2_POOL.concat(LEVEL3_POOL);

// 'pools' of factory functions, indexed by level
const POOLS = [LEVEL1_POOL, LEVEL2_POOL, LEVEL3_POOL];

// which box is interactive, indexed by level
const INTERACTIVE_BOXES = [BoxType.BEFORE, BoxType.AFTER, BoxType.AFTER];
const ChallengeFactory = {
  /**
   * Creates a set of challenges.
   * @param level - game level, starting at zero
   * @param maxQuantity - maximum quantity of any substance in the reaction
   * @param [challengeOptions] - options passed to Challenge constructor
   */
  createChallenges(level, maxQuantity, challengeOptions) {
    assert && assert(Number.isInteger(level) && level >= 0 && level < POOLS.length);
    assert && assert(Number.isInteger(maxQuantity) && maxQuantity > 0);
    if (RPALQueryParameters.playAll) {
      return createChallengesPlayAll(level, maxQuantity, challengeOptions);
    } else {
      return createChallenges(level, maxQuantity, challengeOptions);
    }
  },
  /**
   * Gets the number of reactions in the 'pool' for a specified level.
   * @param level - game level, starting at zero
   */
  getNumberOfChallenges(level) {
    assert && assert(Number.isInteger(level) && level >= 0 && level < POOLS.length);
    return RPALQueryParameters.playAll ? POOLS[level].length : CHALLENGES_PER_LEVEL;
  },
  /**
   * DEBUG: Runs a sanity check for challenge creation. Prints diagnostics to the console.
   */
  test() {
    doTest();
  }
};

/**
 * Creates a set of random challenges.
 */
function createChallenges(level, maxQuantity, challengeOptions) {
  assert && assert(Number.isInteger(level) && level >= 0 && level < POOLS.length);
  assert && assert(Number.isInteger(maxQuantity) && maxQuantity > 0);
  const numberOfChallenges = CHALLENGES_PER_LEVEL;
  const factoryFunctions = POOLS[level].slice(0); // make a copy of the array for the specified level

  // Determine which challenge will have zero products.
  const zeroProductsIndex = dotRandom.nextInt(numberOfChallenges);
  const challenges = [];
  for (let i = 0; i < numberOfChallenges; i++) {
    // reaction with quantities
    let reaction;
    if (i === zeroProductsIndex) {
      reaction = createChallengeWithoutProducts(factoryFunctions);
    } else {
      reaction = createChallengeWithProducts(factoryFunctions, maxQuantity);
    }

    // Adjust quantities if they exceed the maximum. Do this before creating the challenge.
    fixQuantityRangeViolation(reaction, maxQuantity);
    challenges.push(new Challenge(reaction, INTERACTIVE_BOXES[level], challengeOptions));
  }
  assert && assert(challenges.length === numberOfChallenges);
  return challenges;
}

/**
 * DEBUG: This is called when 'playAll' query parameter is present.
 * A challenge is randomly generated for every reaction in the level's pool, and the reactions always
 * appear in the same order. Quantities are randomly generated, so they will vary each a level is played.
 *
 * @param level
 * @param maxQuantity
 * @param challengeOptions
 */
function createChallengesPlayAll(level, maxQuantity, challengeOptions) {
  const challenges = [];
  const factoryFunctions = POOLS[level].slice(0); // make a copy of the array for the specified level

  for (let i = 0; i < factoryFunctions.length; i++) {
    // Create a reaction with non-zero quantities of at least one product.
    const reaction = factoryFunctions[i]();
    reaction.reactants.forEach(reactant => {
      reactant.quantityProperty.value = dotRandom.nextIntBetween(reactant.coefficientProperty.value, maxQuantity);
    });

    // Adjust quantities if they exceed the maximum. Do this before creating the challenge.
    fixQuantityRangeViolation(reaction, maxQuantity);
    challenges.push(new Challenge(reaction, INTERACTIVE_BOXES[level], challengeOptions));
  }
  return challenges;
}

/**
 * Creates a reaction with non-zero quantities of at least one product.
 */
function createChallengeWithProducts(factoryFunctions, maxQuantity) {
  assert && assert(factoryFunctions.length > 0);
  assert && assert(Number.isInteger(maxQuantity) && maxQuantity > 0);

  // Choose a function and remove it from the further consideration.
  const randomIndex = dotRandom.nextIntBetween(0, factoryFunctions.length - 1);
  const factoryFunction = factoryFunctions[randomIndex];
  factoryFunctions.splice(randomIndex, 1);

  // Create a reaction with non-zero quantities of at least one product.
  const reaction = factoryFunction();
  reaction.reactants.forEach(reactant => {
    reactant.quantityProperty.value = dotRandom.nextIntBetween(reactant.coefficientProperty.value, maxQuantity);
  });
  return reaction;
}

/**
 * Creates a reaction with zero quantities of all products.
 */
function createChallengeWithoutProducts(factoryFunctions) {
  assert && assert(factoryFunctions.length > 0);

  // Choose a reaction that is capable of having no products when all reactant quantities are non-zero.
  let reaction;
  let retry = true;
  const disqualifiedFunctions = []; // functions that were disqualified
  while (retry) {
    assert && assert(factoryFunctions.length > 0);

    // Choose a function and remove it from the further consideration.
    const randomIndex = dotRandom.nextIntBetween(0, factoryFunctions.length - 1);
    const factoryFunction = factoryFunctions[randomIndex];
    factoryFunctions.splice(randomIndex, 1);

    // Create the reaction and test its coefficients.
    reaction = factoryFunction();
    retry = hasReactantCoefficientsAllOne(reaction);
    if (retry) {
      disqualifiedFunctions.push(factoryFunction);
    }
  }
  const generatedReaction = reaction;
  assert && assert(generatedReaction);

  // Put the functions that we didn't use back in the pool.
  disqualifiedFunctions.forEach(disqualifiedFunction => {
    factoryFunctions.push(disqualifiedFunction);
  });

  // set quantities
  generatedReaction.reactants.forEach(reactant => {
    reactant.quantityProperty.value = dotRandom.nextIntBetween(1, Math.max(1, reactant.coefficientProperty.value - 1));
  });
  return generatedReaction;
}

/**
 * Does this reaction have coefficient of 1 for all reactants? This type of reaction cannot produce
 * zero products with non-zero quantities, so we don't want to use it for that purpose.
 */
function hasReactantCoefficientsAllOne(reaction) {
  let allOne = true;
  reaction.reactants.forEach(reactant => {
    if (reactant.coefficientProperty.value !== 1) {
      allOne = false;
    }
  });
  return allOne;
}

/**
 * Checks a reaction for quantity range violations.
 */
function hasQuantityRangeViolation(reaction, maxQuantity) {
  assert && assert(Number.isInteger(maxQuantity) && maxQuantity > 0);
  let violation = false;
  let i;
  for (i = 0; !violation && i < reaction.reactants.length; i++) {
    violation = reaction.reactants[i].quantityProperty.value > maxQuantity;
  }
  for (i = 0; !violation && i < reaction.products.length; i++) {
    violation = reaction.products[i].quantityProperty.value > maxQuantity;
  }
  for (i = 0; !violation && i < reaction.leftovers.length; i++) {
    violation = reaction.leftovers[i].quantityProperty.value > maxQuantity;
  }
  return violation;
}

/**
 * Fixes any quantity-range violations in a reaction.
 * We do this by decrementing reactant quantities by 1, alternating reactants as we do so.
 * Each reactant must have a quantity of at least 1, in order to have a valid reaction.
 *
 * In the Java version of this simulation, this manifested itself as Unfuddle #2156.
 *
 * @param reaction
 * @param maxQuantity
 * @param [enableDebugOutput] - prints to the console when a violation is fixed
 */
function fixQuantityRangeViolation(reaction, maxQuantity, enableDebugOutput = false) {
  assert && assert(Number.isInteger(maxQuantity) && maxQuantity > 0);
  if (hasQuantityRangeViolation(reaction, maxQuantity)) {
    const beforeFixString = DevStringUtils.reactionString(reaction);

    // First, make sure all reactant quantities are in range.
    reaction.reactants.forEach(reactant => {
      if (reactant.quantityProperty.value > maxQuantity) {
        reactant.quantityProperty.value = maxQuantity;
      }
    });

    // Then incrementally reduce reactant quantities, alternating reactants.
    let reactantIndex = 0;
    let changed = false;
    while (hasQuantityRangeViolation(reaction, maxQuantity)) {
      const reactant = reaction.reactants[reactantIndex];
      const quantity = reactant.quantityProperty.value;
      if (quantity > 1) {
        reactant.quantityProperty.value = reactant.quantityProperty.value - 1;
        changed = true;
      }
      reactantIndex++;
      if (reactantIndex > reaction.reactants.length - 1) {
        reactantIndex = 0;
        if (!changed) {
          // we have not been able to reduce any reactant
          break;
        }
      }
    }

    // If all reactants have been reduced and we are still out of range, bail with a serious error.
    if (hasQuantityRangeViolation(reaction, maxQuantity)) {
      throw new Error(`ERROR: quantity-range violation cannot be fixed: ${beforeFixString}`);
    }
    if (enableDebugOutput) {
      console.log(`quantity range violation: ${beforeFixString} fixed: ${DevStringUtils.quantitiesString(reaction)}`);
    }
  }
}

/**
 * DEBUG
 * Runs a sanity check, looking for problems with reactions and the challenge-creation algorithm.
 * Intended to be run from the browser console via ChallengeFactory.test(), or run the simulation
 * with 'dev' query parameter and press the 'Test' button that appears on the Game's level-selection screen.
 * Output is printed to the console.
 */
function doTest() {
  assert && assert(!RPALQueryParameters.playAll); // test doesn't work with some query parameters

  // Cumulative counts for this test
  let numberOfChallengesGenerated = 0;
  let numberOfCoefficientRangeErrors = 0;
  let numberOfReactantErrors = 0;
  let numberOfProductErrors = 0;
  let numberOfQuantityRangeErrors = 0;

  // Print reactions by level. Put all reactions in a container, removing duplicates.
  const factoryFunctions = [];
  for (let level = 0; level < POOLS.length; level++) {
    console.log('----------------------------------------------------------');
    console.log(`Level ${level + 1}`);
    console.log('----------------------------------------------------------');
    for (let i = 0; i < POOLS[level].length; i++) {
      const factoryFunction = POOLS[level][i];
      const reaction = factoryFunction();
      console.log(DevStringUtils.equationString(reaction));
      if (factoryFunctions.includes(factoryFunction)) {
        factoryFunctions.push(factoryFunction);
      }
    }
  }

  // Look for reactions with coefficients > maxQuantity, we must have none of these.
  const maxQuantity = RPALConstants.QUANTITY_RANGE.max;
  console.log('----------------------------------------------------------');
  console.log('Looking for coefficient-range violations ...');
  console.log('----------------------------------------------------------');
  factoryFunctions.forEach(factoryFunction => {
    const reaction = factoryFunction();
    for (let i = 0; i < reaction.reactants.length; i++) {
      if (reaction.reactants[i].coefficientProperty.value > maxQuantity) {
        console.log(`ERROR: reactant coefficient out of range : ${DevStringUtils.equationString(reaction)}`);
        numberOfCoefficientRangeErrors++;
        break;
      }
    }
    for (let i = 0; i < reaction.products.length; i++) {
      if (reaction.products[i].coefficientProperty.value > maxQuantity) {
        console.log(`ERROR: product coefficient out of range : ${DevStringUtils.equationString(reaction)}`);
        numberOfCoefficientRangeErrors++;
        break;
      }
    }
  });

  /*
   * Look for quantity range violations in all reactions. We expect these, but require that they can be fixed.
   * This test will halt if we encounter a violation that can't be fixed.
   */
  console.log('-----------------------------------------------------------------');
  console.log('Looking for quantity-range violations that cannot be fixed ...');
  console.log('----------------------------------------------------------------');
  factoryFunctions.forEach(factoryFunction => {
    const reaction = factoryFunction();
    // set all reactant quantities to their max values.
    for (let i = 0; i < reaction.reactants.length; i++) {
      reaction.reactants[i].quantityProperty.value = maxQuantity;
    }
    // look for violations and try to fix them.
    fixQuantityRangeViolation(reaction, maxQuantity, true /* enableDebugOutput */);
  });

  // Generate many challenges for each level, and validate our expectations.
  console.log('----------------------------------------------------------');
  console.log('Testing challenge generation ...');
  console.log('----------------------------------------------------------');
  for (let level = 0; level < POOLS.length; level++) {
    for (let i = 0; i < 100; i++) {
      // create challenges
      const challenges = ChallengeFactory.createChallenges(level, maxQuantity);
      numberOfChallengesGenerated += challenges.length;

      // validate
      let numberWithZeroProducts = 0;
      for (let j = 0; j < challenges.length; j++) {
        const challenge = challenges[j];

        // verify that all reactant quantities are > 0
        let zeroReactants = false;
        challenge.reaction.reactants.forEach(reactant => {
          if (reactant.quantityProperty.value < 1) {
            zeroReactants = true;
          }
        });
        if (zeroReactants) {
          console.log(`ERROR: challenge has zero reactants, level=${level} : ${DevStringUtils.reactionString(challenge.reaction)}`);
          numberOfReactantErrors++;
        }

        // count how many challenges have zero products
        let nonZeroProducts = 0;
        challenge.reaction.products.forEach(product => {
          if (product.quantityProperty.value > 0) {
            nonZeroProducts++;
          }
        });
        if (nonZeroProducts === 0) {
          numberWithZeroProducts++;
        }

        // quantity-range violation?
        if (hasQuantityRangeViolation(challenge.reaction, maxQuantity)) {
          console.log(`ERROR: challenge has quantity-range violation, level=${level} : ${DevStringUtils.reactionString(challenge.reaction)}`);
          numberOfQuantityRangeErrors++;
        }
      }

      // should have exactly one challenge with zero products (irrelevant for 'playAll')
      if (numberWithZeroProducts !== 1 && !RPALQueryParameters.playAll) {
        numberOfProductErrors++;
        console.log(`ERROR: more than one challenge with zero products, level=${level} challenges=`);
        for (let j = 0; j < challenges.length; j++) {
          console.log(`${j}: ${DevStringUtils.reactionString(challenges[j].reaction)}`);
        }
      }
    }
  }

  // Inspect this bit of output when the test has completed. Errors should all be zero.
  console.log('----------------------------------------------------------');
  console.log('Summary');
  console.log('----------------------------------------------------------');
  console.log(`challenges generated = ${numberOfChallengesGenerated}`);
  console.log(`coefficient-range errors = ${numberOfCoefficientRangeErrors}`);
  console.log(`zero-reactant errors = ${numberOfReactantErrors}`);
  console.log(`zero-product errors = ${numberOfProductErrors}`);
  console.log(`quantity-range errors = ${numberOfQuantityRangeErrors}`);
  console.log('<done>');
}
reactantsProductsAndLeftovers.register('ChallengeFactory', ChallengeFactory);
export default ChallengeFactory;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkb3RSYW5kb20iLCJCb3hUeXBlIiwiUmVhY3Rpb25GYWN0b3J5IiwiUlBBTENvbnN0YW50cyIsIlJQQUxRdWVyeVBhcmFtZXRlcnMiLCJEZXZTdHJpbmdVdGlscyIsInJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIiwiQ2hhbGxlbmdlIiwiQ0hBTExFTkdFU19QRVJfTEVWRUwiLCJMRVZFTDJfUE9PTCIsIlJlYWN0aW9uX1BDbDNfQ2wyX19QQ2w1IiwibWFrZVdhdGVyIiwiUmVhY3Rpb25fSDJfRjJfXzJIRiIsIlJlYWN0aW9uX0gyX0NsMl9fMkhDbCIsIlJlYWN0aW9uX0NPXzJIMl9fQ0gzT0giLCJSZWFjdGlvbl9DSDJPX0gyX19DSDNPSCIsIlJlYWN0aW9uX0MySDRfSDJfX0MySDYiLCJSZWFjdGlvbl9DMkgyXzJIMl9fQzJINiIsIlJlYWN0aW9uX0NfTzJfX0NPMiIsIlJlYWN0aW9uXzJDX08yX18yQ08iLCJSZWFjdGlvbl8yQ09fTzJfXzJDTzIiLCJSZWFjdGlvbl9DX0NPMl9fMkNPIiwiUmVhY3Rpb25fQ18yU19fQ1MyIiwibWFrZUFtbW9uaWEiLCJSZWFjdGlvbl9OMl9PMl9fMk5PIiwiUmVhY3Rpb25fMk5PX08yX18yTk8yIiwiUmVhY3Rpb25fMk4yX08yX18yTjJPIiwiUmVhY3Rpb25fUDRfNkgyX180UEgzIiwiUmVhY3Rpb25fUDRfNkYyX180UEYzIiwiUmVhY3Rpb25fUDRfNkNsMl9fNFBDbDMiLCJSZWFjdGlvbl8yU08yX08yX18yU08zIiwiTEVWRUwzX1BPT0wiLCJSZWFjdGlvbl9DMkg1T0hfM08yX18yQ08yXzNIMk8iLCJSZWFjdGlvbl8yQ18ySDJPX19DSDRfQ08yIiwiUmVhY3Rpb25fQ0g0X0gyT19fM0gyX0NPIiwiY29tYnVzdE1ldGhhbmUiLCJSZWFjdGlvbl8yQzJINl83TzJfXzRDTzJfNkgyTyIsIlJlYWN0aW9uX0MySDRfM08yX18yQ08yXzJIMk8iLCJSZWFjdGlvbl8yQzJIMl81TzJfXzRDTzJfMkgyTyIsIlJlYWN0aW9uX0MySDZfQ2wyX19DMkg1Q2xfSENsIiwiUmVhY3Rpb25fQ0g0XzRTX19DUzJfMkgyUyIsIlJlYWN0aW9uX0NTMl8zTzJfX0NPMl8yU08yIiwiUmVhY3Rpb25fNE5IM18zTzJfXzJOMl82SDJPIiwiUmVhY3Rpb25fNE5IM181TzJfXzROT182SDJPIiwiUmVhY3Rpb25fNE5IM183TzJfXzROTzJfNkgyTyIsIlJlYWN0aW9uXzROSDNfNk5PX181TjJfNkgyTyIsIlJlYWN0aW9uX1NPMl8ySDJfX1NfMkgyTyIsIlJlYWN0aW9uX1NPMl8zSDJfX0gyU18ySDJPIiwiUmVhY3Rpb25fMkYyX0gyT19fT0YyXzJIRiIsIlJlYWN0aW9uX09GMl9IMk9fX08yXzJIRiIsIkxFVkVMMV9QT09MIiwiY29uY2F0IiwiUE9PTFMiLCJJTlRFUkFDVElWRV9CT1hFUyIsIkJFRk9SRSIsIkFGVEVSIiwiQ2hhbGxlbmdlRmFjdG9yeSIsImNyZWF0ZUNoYWxsZW5nZXMiLCJsZXZlbCIsIm1heFF1YW50aXR5IiwiY2hhbGxlbmdlT3B0aW9ucyIsImFzc2VydCIsIk51bWJlciIsImlzSW50ZWdlciIsImxlbmd0aCIsInBsYXlBbGwiLCJjcmVhdGVDaGFsbGVuZ2VzUGxheUFsbCIsImdldE51bWJlck9mQ2hhbGxlbmdlcyIsInRlc3QiLCJkb1Rlc3QiLCJudW1iZXJPZkNoYWxsZW5nZXMiLCJmYWN0b3J5RnVuY3Rpb25zIiwic2xpY2UiLCJ6ZXJvUHJvZHVjdHNJbmRleCIsIm5leHRJbnQiLCJjaGFsbGVuZ2VzIiwiaSIsInJlYWN0aW9uIiwiY3JlYXRlQ2hhbGxlbmdlV2l0aG91dFByb2R1Y3RzIiwiY3JlYXRlQ2hhbGxlbmdlV2l0aFByb2R1Y3RzIiwiZml4UXVhbnRpdHlSYW5nZVZpb2xhdGlvbiIsInB1c2giLCJyZWFjdGFudHMiLCJmb3JFYWNoIiwicmVhY3RhbnQiLCJxdWFudGl0eVByb3BlcnR5IiwidmFsdWUiLCJuZXh0SW50QmV0d2VlbiIsImNvZWZmaWNpZW50UHJvcGVydHkiLCJyYW5kb21JbmRleCIsImZhY3RvcnlGdW5jdGlvbiIsInNwbGljZSIsInJldHJ5IiwiZGlzcXVhbGlmaWVkRnVuY3Rpb25zIiwiaGFzUmVhY3RhbnRDb2VmZmljaWVudHNBbGxPbmUiLCJnZW5lcmF0ZWRSZWFjdGlvbiIsImRpc3F1YWxpZmllZEZ1bmN0aW9uIiwiTWF0aCIsIm1heCIsImFsbE9uZSIsImhhc1F1YW50aXR5UmFuZ2VWaW9sYXRpb24iLCJ2aW9sYXRpb24iLCJwcm9kdWN0cyIsImxlZnRvdmVycyIsImVuYWJsZURlYnVnT3V0cHV0IiwiYmVmb3JlRml4U3RyaW5nIiwicmVhY3Rpb25TdHJpbmciLCJyZWFjdGFudEluZGV4IiwiY2hhbmdlZCIsInF1YW50aXR5IiwiRXJyb3IiLCJjb25zb2xlIiwibG9nIiwicXVhbnRpdGllc1N0cmluZyIsIm51bWJlck9mQ2hhbGxlbmdlc0dlbmVyYXRlZCIsIm51bWJlck9mQ29lZmZpY2llbnRSYW5nZUVycm9ycyIsIm51bWJlck9mUmVhY3RhbnRFcnJvcnMiLCJudW1iZXJPZlByb2R1Y3RFcnJvcnMiLCJudW1iZXJPZlF1YW50aXR5UmFuZ2VFcnJvcnMiLCJlcXVhdGlvblN0cmluZyIsImluY2x1ZGVzIiwiUVVBTlRJVFlfUkFOR0UiLCJudW1iZXJXaXRoWmVyb1Byb2R1Y3RzIiwiaiIsImNoYWxsZW5nZSIsInplcm9SZWFjdGFudHMiLCJub25aZXJvUHJvZHVjdHMiLCJwcm9kdWN0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDaGFsbGVuZ2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgY2hhbGxlbmdlcyB3aGVyZSBsZXZlbC1vZi1kaWZmaWN1bHR5IGlzIGJhc2VkIG9uIHRoZSBudW1iZXIgdmFyaWFibGVzIHRoYXRcclxuICogd2UncmUgc29sdmluZyBmb3IsIGFuZCB3aGV0aGVyIHRoZSB2YXJpYWJsZXMgYXJlICdCZWZvcmUnIG9yICdBZnRlcicgdGVybXMuXHJcbiAqXHJcbiAqIEJlaGF2aW9yIGlzOlxyXG4gKiAtIExldmVsIDE6IG9uZSBvciB0d28gcHJvZHVjdHMgcmFuZG9tLCBCZWZvcmUgKDIgdmFyaWFibGVzKVxyXG4gKiAtIExldmVsIDI6IG9uZSBwcm9kdWN0IHJhbmRvbSwgQWZ0ZXJcclxuICogLSBMZXZlbCAzOiB0d28gcHJvZHVjdHMgcmFuZG9tLCBBZnRlciAoNCB2YXJpYWJsZXMpXHJcbiAqXHJcbiAqIEFkZGl0aW9uYWwgcmVxdWlyZW1lbnRzOlxyXG4gKiAtIGFsbCBjb2VmZmljaWVudHMgd2lsbCBiZSA+IDBcclxuICogLSBhbGwgcmVhY3RhbnQgcXVhbnRpdGllcyB3aWxsIGJlID4gMFxyXG4gKiAtIGV2ZXJ5IGdhbWUgd2lsbCBjb250YWluIGV4YWN0bHkgb25lIHplcm8tcHJvZHVjdHMgY2hhbGxlbmdlXHJcbiAqIC0gZ2FtZSB3aWxsIGNvbnRhaW4gbm8gZHVwbGljYXRlIHJlYWN0aW9uc1xyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBCb3hUeXBlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9Cb3hUeXBlLmpzJztcclxuaW1wb3J0IFJlYWN0aW9uRmFjdG9yeSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUmVhY3Rpb25GYWN0b3J5LmpzJztcclxuaW1wb3J0IFJQQUxDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1JQQUxDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgUlBBTFF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9jb21tb24vUlBBTFF1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBEZXZTdHJpbmdVdGlscyBmcm9tICcuLi8uLi9kZXYvRGV2U3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgcmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMgZnJvbSAnLi4vLi4vcmVhY3RhbnRzUHJvZHVjdHNBbmRMZWZ0b3ZlcnMuanMnO1xyXG5pbXBvcnQgQ2hhbGxlbmdlLCB7IENoYWxsZW5nZU9wdGlvbnMgfSBmcm9tICcuL0NoYWxsZW5nZS5qcyc7XHJcbmltcG9ydCBSZWFjdGlvbiBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvUmVhY3Rpb24uanMnO1xyXG5cclxuY29uc3QgQ0hBTExFTkdFU19QRVJfTEVWRUwgPSA1O1xyXG5cclxudHlwZSBGYWN0b3J5RnVuY3Rpb24gPSAoKSA9PiBSZWFjdGlvbjtcclxuXHJcbi8vIGxldmVsIDIgaXMgYWxsIHRoZSBvbmUtcHJvZHVjdCByZWFjdGlvbnNcclxuY29uc3QgTEVWRUwyX1BPT0w6IEZhY3RvcnlGdW5jdGlvbltdID0gW1xyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9QQ2wzX0NsMl9fUENsNSwgLy8gUENsNSBpcyB0aGUgbGFyZ2VzdCBtb2xlY3VsZSBpbiB0aGlzIHBvb2wsIHNvIHB1dCB0aGlzIGZpcnN0IGZvciBsYXlvdXQgZGVidWdnaW5nXHJcbiAgUmVhY3Rpb25GYWN0b3J5Lm1ha2VXYXRlcixcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fSDJfRjJfXzJIRixcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fSDJfQ2wyX18ySENsLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DT18ySDJfX0NIM09ILFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DSDJPX0gyX19DSDNPSCxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fQzJINF9IMl9fQzJINixcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fQzJIMl8ySDJfX0MySDYsXHJcbiAgUmVhY3Rpb25GYWN0b3J5LlJlYWN0aW9uX0NfTzJfX0NPMixcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fMkNfTzJfXzJDTyxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fMkNPX08yX18yQ08yLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DX0NPMl9fMkNPLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DXzJTX19DUzIsXHJcbiAgUmVhY3Rpb25GYWN0b3J5Lm1ha2VBbW1vbmlhLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9OMl9PMl9fMk5PLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl8yTk9fTzJfXzJOTzIsXHJcbiAgUmVhY3Rpb25GYWN0b3J5LlJlYWN0aW9uXzJOMl9PMl9fMk4yTyxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fUDRfNkgyX180UEgzLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9QNF82RjJfXzRQRjMsXHJcbiAgUmVhY3Rpb25GYWN0b3J5LlJlYWN0aW9uX1A0XzZDbDJfXzRQQ2wzLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl8yU08yX08yX18yU08zXHJcbl07XHJcblxyXG4vLyBsZXZlbCAzIGlzIGFsbCB0aGUgdHdvLXByb2R1Y3QgcmVhY3Rpb25zXHJcbmNvbnN0IExFVkVMM19QT09MOiBGYWN0b3J5RnVuY3Rpb25bXSA9IFtcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fQzJINU9IXzNPMl9fMkNPMl8zSDJPLCAvLyBDMkg1T0ggaGFzIHRoZSBtb3N0IGF0b21zIGluIHRoaXMgcG9vbCwgc28gcHV0IHRoaXMgZmlyc3QgZm9yIHBlcmZvcm1hbmNlIGRlYnVnZ2luZ1xyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl8yQ18ySDJPX19DSDRfQ08yLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DSDRfSDJPX18zSDJfQ08sXHJcbiAgUmVhY3Rpb25GYWN0b3J5LmNvbWJ1c3RNZXRoYW5lLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl8yQzJINl83TzJfXzRDTzJfNkgyTyxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fQzJINF8zTzJfXzJDTzJfMkgyTyxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fMkMySDJfNU8yX180Q08yXzJIMk8sXHJcbiAgUmVhY3Rpb25GYWN0b3J5LlJlYWN0aW9uX0MySDZfQ2wyX19DMkg1Q2xfSENsLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DSDRfNFNfX0NTMl8ySDJTLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9DUzJfM08yX19DTzJfMlNPMixcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fNE5IM18zTzJfXzJOMl82SDJPLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl80TkgzXzVPMl9fNE5PXzZIMk8sXHJcbiAgUmVhY3Rpb25GYWN0b3J5LlJlYWN0aW9uXzROSDNfN08yX180Tk8yXzZIMk8sXHJcbiAgUmVhY3Rpb25GYWN0b3J5LlJlYWN0aW9uXzROSDNfNk5PX181TjJfNkgyTyxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fU08yXzJIMl9fU18ySDJPLFxyXG4gIFJlYWN0aW9uRmFjdG9yeS5SZWFjdGlvbl9TTzJfM0gyX19IMlNfMkgyTyxcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fMkYyX0gyT19fT0YyXzJIRixcclxuICBSZWFjdGlvbkZhY3RvcnkuUmVhY3Rpb25fT0YyX0gyT19fTzJfMkhGXHJcbl07XHJcblxyXG4vLyBsZXZlbCAxIGlzIGFsbCB0aGUgcmVhY3Rpb25zXHJcbmNvbnN0IExFVkVMMV9QT09MOiBGYWN0b3J5RnVuY3Rpb25bXSA9IExFVkVMMl9QT09MLmNvbmNhdCggTEVWRUwzX1BPT0wgKTtcclxuXHJcbi8vICdwb29scycgb2YgZmFjdG9yeSBmdW5jdGlvbnMsIGluZGV4ZWQgYnkgbGV2ZWxcclxuY29uc3QgUE9PTFM6IEZhY3RvcnlGdW5jdGlvbltdW10gPSBbIExFVkVMMV9QT09MLCBMRVZFTDJfUE9PTCwgTEVWRUwzX1BPT0wgXTtcclxuXHJcbi8vIHdoaWNoIGJveCBpcyBpbnRlcmFjdGl2ZSwgaW5kZXhlZCBieSBsZXZlbFxyXG5jb25zdCBJTlRFUkFDVElWRV9CT1hFUyA9IFsgQm94VHlwZS5CRUZPUkUsIEJveFR5cGUuQUZURVIsIEJveFR5cGUuQUZURVIgXTtcclxuXHJcbmNvbnN0IENoYWxsZW5nZUZhY3RvcnkgPSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBzZXQgb2YgY2hhbGxlbmdlcy5cclxuICAgKiBAcGFyYW0gbGV2ZWwgLSBnYW1lIGxldmVsLCBzdGFydGluZyBhdCB6ZXJvXHJcbiAgICogQHBhcmFtIG1heFF1YW50aXR5IC0gbWF4aW11bSBxdWFudGl0eSBvZiBhbnkgc3Vic3RhbmNlIGluIHRoZSByZWFjdGlvblxyXG4gICAqIEBwYXJhbSBbY2hhbGxlbmdlT3B0aW9uc10gLSBvcHRpb25zIHBhc3NlZCB0byBDaGFsbGVuZ2UgY29uc3RydWN0b3JcclxuICAgKi9cclxuICBjcmVhdGVDaGFsbGVuZ2VzKCBsZXZlbDogbnVtYmVyLCBtYXhRdWFudGl0eTogbnVtYmVyLCBjaGFsbGVuZ2VPcHRpb25zPzogQ2hhbGxlbmdlT3B0aW9ucyApOiBDaGFsbGVuZ2VbXSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBsZXZlbCApICYmIGxldmVsID49IDAgJiYgbGV2ZWwgPCBQT09MUy5sZW5ndGggKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG1heFF1YW50aXR5ICkgJiYgbWF4UXVhbnRpdHkgPiAwICk7XHJcblxyXG4gICAgaWYgKCBSUEFMUXVlcnlQYXJhbWV0ZXJzLnBsYXlBbGwgKSB7XHJcbiAgICAgIHJldHVybiBjcmVhdGVDaGFsbGVuZ2VzUGxheUFsbCggbGV2ZWwsIG1heFF1YW50aXR5LCBjaGFsbGVuZ2VPcHRpb25zICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmV0dXJuIGNyZWF0ZUNoYWxsZW5nZXMoIGxldmVsLCBtYXhRdWFudGl0eSwgY2hhbGxlbmdlT3B0aW9ucyApO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiByZWFjdGlvbnMgaW4gdGhlICdwb29sJyBmb3IgYSBzcGVjaWZpZWQgbGV2ZWwuXHJcbiAgICogQHBhcmFtIGxldmVsIC0gZ2FtZSBsZXZlbCwgc3RhcnRpbmcgYXQgemVyb1xyXG4gICAqL1xyXG4gIGdldE51bWJlck9mQ2hhbGxlbmdlcyggbGV2ZWw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTnVtYmVyLmlzSW50ZWdlciggbGV2ZWwgKSAmJiBsZXZlbCA+PSAwICYmIGxldmVsIDwgUE9PTFMubGVuZ3RoICk7XHJcbiAgICByZXR1cm4gUlBBTFF1ZXJ5UGFyYW1ldGVycy5wbGF5QWxsID8gUE9PTFNbIGxldmVsIF0ubGVuZ3RoIDogQ0hBTExFTkdFU19QRVJfTEVWRUw7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogREVCVUc6IFJ1bnMgYSBzYW5pdHkgY2hlY2sgZm9yIGNoYWxsZW5nZSBjcmVhdGlvbi4gUHJpbnRzIGRpYWdub3N0aWNzIHRvIHRoZSBjb25zb2xlLlxyXG4gICAqL1xyXG4gIHRlc3QoKTogdm9pZCB7XHJcbiAgICBkb1Rlc3QoKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIHNldCBvZiByYW5kb20gY2hhbGxlbmdlcy5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoYWxsZW5nZXMoIGxldmVsOiBudW1iZXIsIG1heFF1YW50aXR5OiBudW1iZXIsIGNoYWxsZW5nZU9wdGlvbnM/OiBDaGFsbGVuZ2VPcHRpb25zICk6IENoYWxsZW5nZVtdIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBsZXZlbCApICYmIGxldmVsID49IDAgJiYgbGV2ZWwgPCBQT09MUy5sZW5ndGggKTtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBtYXhRdWFudGl0eSApICYmIG1heFF1YW50aXR5ID4gMCApO1xyXG5cclxuICBjb25zdCBudW1iZXJPZkNoYWxsZW5nZXMgPSBDSEFMTEVOR0VTX1BFUl9MRVZFTDtcclxuICBjb25zdCBmYWN0b3J5RnVuY3Rpb25zID0gUE9PTFNbIGxldmVsIF0uc2xpY2UoIDAgKTsgLy8gbWFrZSBhIGNvcHkgb2YgdGhlIGFycmF5IGZvciB0aGUgc3BlY2lmaWVkIGxldmVsXHJcblxyXG4gIC8vIERldGVybWluZSB3aGljaCBjaGFsbGVuZ2Ugd2lsbCBoYXZlIHplcm8gcHJvZHVjdHMuXHJcbiAgY29uc3QgemVyb1Byb2R1Y3RzSW5kZXggPSBkb3RSYW5kb20ubmV4dEludCggbnVtYmVyT2ZDaGFsbGVuZ2VzICk7XHJcblxyXG4gIGNvbnN0IGNoYWxsZW5nZXM6IENoYWxsZW5nZVtdID0gW107XHJcbiAgZm9yICggbGV0IGkgPSAwOyBpIDwgbnVtYmVyT2ZDaGFsbGVuZ2VzOyBpKysgKSB7XHJcblxyXG4gICAgLy8gcmVhY3Rpb24gd2l0aCBxdWFudGl0aWVzXHJcbiAgICBsZXQgcmVhY3Rpb246IFJlYWN0aW9uO1xyXG4gICAgaWYgKCBpID09PSB6ZXJvUHJvZHVjdHNJbmRleCApIHtcclxuICAgICAgcmVhY3Rpb24gPSBjcmVhdGVDaGFsbGVuZ2VXaXRob3V0UHJvZHVjdHMoIGZhY3RvcnlGdW5jdGlvbnMgKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICByZWFjdGlvbiA9IGNyZWF0ZUNoYWxsZW5nZVdpdGhQcm9kdWN0cyggZmFjdG9yeUZ1bmN0aW9ucywgbWF4UXVhbnRpdHkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBZGp1c3QgcXVhbnRpdGllcyBpZiB0aGV5IGV4Y2VlZCB0aGUgbWF4aW11bS4gRG8gdGhpcyBiZWZvcmUgY3JlYXRpbmcgdGhlIGNoYWxsZW5nZS5cclxuICAgIGZpeFF1YW50aXR5UmFuZ2VWaW9sYXRpb24oIHJlYWN0aW9uLCBtYXhRdWFudGl0eSApO1xyXG5cclxuICAgIGNoYWxsZW5nZXMucHVzaCggbmV3IENoYWxsZW5nZSggcmVhY3Rpb24sIElOVEVSQUNUSVZFX0JPWEVTWyBsZXZlbCBdLCBjaGFsbGVuZ2VPcHRpb25zICkgKTtcclxuICB9XHJcblxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIGNoYWxsZW5nZXMubGVuZ3RoID09PSBudW1iZXJPZkNoYWxsZW5nZXMgKTtcclxuICByZXR1cm4gY2hhbGxlbmdlcztcclxufVxyXG5cclxuLyoqXHJcbiAqIERFQlVHOiBUaGlzIGlzIGNhbGxlZCB3aGVuICdwbGF5QWxsJyBxdWVyeSBwYXJhbWV0ZXIgaXMgcHJlc2VudC5cclxuICogQSBjaGFsbGVuZ2UgaXMgcmFuZG9tbHkgZ2VuZXJhdGVkIGZvciBldmVyeSByZWFjdGlvbiBpbiB0aGUgbGV2ZWwncyBwb29sLCBhbmQgdGhlIHJlYWN0aW9ucyBhbHdheXNcclxuICogYXBwZWFyIGluIHRoZSBzYW1lIG9yZGVyLiBRdWFudGl0aWVzIGFyZSByYW5kb21seSBnZW5lcmF0ZWQsIHNvIHRoZXkgd2lsbCB2YXJ5IGVhY2ggYSBsZXZlbCBpcyBwbGF5ZWQuXHJcbiAqXHJcbiAqIEBwYXJhbSBsZXZlbFxyXG4gKiBAcGFyYW0gbWF4UXVhbnRpdHlcclxuICogQHBhcmFtIGNoYWxsZW5nZU9wdGlvbnNcclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZUNoYWxsZW5nZXNQbGF5QWxsKCBsZXZlbDogbnVtYmVyLCBtYXhRdWFudGl0eTogbnVtYmVyLCBjaGFsbGVuZ2VPcHRpb25zPzogQ2hhbGxlbmdlT3B0aW9ucyApOiBDaGFsbGVuZ2VbXSB7XHJcblxyXG4gIGNvbnN0IGNoYWxsZW5nZXM6IENoYWxsZW5nZVtdID0gW107XHJcbiAgY29uc3QgZmFjdG9yeUZ1bmN0aW9ucyA9IFBPT0xTWyBsZXZlbCBdLnNsaWNlKCAwICk7IC8vIG1ha2UgYSBjb3B5IG9mIHRoZSBhcnJheSBmb3IgdGhlIHNwZWNpZmllZCBsZXZlbFxyXG5cclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBmYWN0b3J5RnVuY3Rpb25zLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHJlYWN0aW9uIHdpdGggbm9uLXplcm8gcXVhbnRpdGllcyBvZiBhdCBsZWFzdCBvbmUgcHJvZHVjdC5cclxuICAgIGNvbnN0IHJlYWN0aW9uID0gZmFjdG9yeUZ1bmN0aW9uc1sgaSBdKCk7XHJcbiAgICByZWFjdGlvbi5yZWFjdGFudHMuZm9yRWFjaCggcmVhY3RhbnQgPT4ge1xyXG4gICAgICByZWFjdGFudC5xdWFudGl0eVByb3BlcnR5LnZhbHVlID0gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCByZWFjdGFudC5jb2VmZmljaWVudFByb3BlcnR5LnZhbHVlLCBtYXhRdWFudGl0eSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkanVzdCBxdWFudGl0aWVzIGlmIHRoZXkgZXhjZWVkIHRoZSBtYXhpbXVtLiBEbyB0aGlzIGJlZm9yZSBjcmVhdGluZyB0aGUgY2hhbGxlbmdlLlxyXG4gICAgZml4UXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggcmVhY3Rpb24sIG1heFF1YW50aXR5ICk7XHJcblxyXG4gICAgY2hhbGxlbmdlcy5wdXNoKCBuZXcgQ2hhbGxlbmdlKCByZWFjdGlvbiwgSU5URVJBQ1RJVkVfQk9YRVNbIGxldmVsIF0sIGNoYWxsZW5nZU9wdGlvbnMgKSApO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNoYWxsZW5nZXM7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgcmVhY3Rpb24gd2l0aCBub24temVybyBxdWFudGl0aWVzIG9mIGF0IGxlYXN0IG9uZSBwcm9kdWN0LlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlQ2hhbGxlbmdlV2l0aFByb2R1Y3RzKCBmYWN0b3J5RnVuY3Rpb25zOiBGYWN0b3J5RnVuY3Rpb25bXSwgbWF4UXVhbnRpdHk6IG51bWJlciApOiBSZWFjdGlvbiB7XHJcblxyXG4gIGFzc2VydCAmJiBhc3NlcnQoIGZhY3RvcnlGdW5jdGlvbnMubGVuZ3RoID4gMCApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG1heFF1YW50aXR5ICkgJiYgbWF4UXVhbnRpdHkgPiAwICk7XHJcblxyXG4gIC8vIENob29zZSBhIGZ1bmN0aW9uIGFuZCByZW1vdmUgaXQgZnJvbSB0aGUgZnVydGhlciBjb25zaWRlcmF0aW9uLlxyXG4gIGNvbnN0IHJhbmRvbUluZGV4ID0gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAwLCBmYWN0b3J5RnVuY3Rpb25zLmxlbmd0aCAtIDEgKTtcclxuICBjb25zdCBmYWN0b3J5RnVuY3Rpb24gPSBmYWN0b3J5RnVuY3Rpb25zWyByYW5kb21JbmRleCBdO1xyXG4gIGZhY3RvcnlGdW5jdGlvbnMuc3BsaWNlKCByYW5kb21JbmRleCwgMSApO1xyXG5cclxuICAvLyBDcmVhdGUgYSByZWFjdGlvbiB3aXRoIG5vbi16ZXJvIHF1YW50aXRpZXMgb2YgYXQgbGVhc3Qgb25lIHByb2R1Y3QuXHJcbiAgY29uc3QgcmVhY3Rpb24gPSBmYWN0b3J5RnVuY3Rpb24oKTtcclxuICByZWFjdGlvbi5yZWFjdGFudHMuZm9yRWFjaCggcmVhY3RhbnQgPT4ge1xyXG4gICAgcmVhY3RhbnQucXVhbnRpdHlQcm9wZXJ0eS52YWx1ZSA9IGRvdFJhbmRvbS5uZXh0SW50QmV0d2VlbiggcmVhY3RhbnQuY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSwgbWF4UXVhbnRpdHkgKTtcclxuICB9ICk7XHJcblxyXG4gIHJldHVybiByZWFjdGlvbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSByZWFjdGlvbiB3aXRoIHplcm8gcXVhbnRpdGllcyBvZiBhbGwgcHJvZHVjdHMuXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVDaGFsbGVuZ2VXaXRob3V0UHJvZHVjdHMoIGZhY3RvcnlGdW5jdGlvbnM6IEZhY3RvcnlGdW5jdGlvbltdICk6IFJlYWN0aW9uIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWN0b3J5RnVuY3Rpb25zLmxlbmd0aCA+IDAgKTtcclxuXHJcbiAgLy8gQ2hvb3NlIGEgcmVhY3Rpb24gdGhhdCBpcyBjYXBhYmxlIG9mIGhhdmluZyBubyBwcm9kdWN0cyB3aGVuIGFsbCByZWFjdGFudCBxdWFudGl0aWVzIGFyZSBub24temVyby5cclxuICBsZXQgcmVhY3Rpb246IFJlYWN0aW9uO1xyXG4gIGxldCByZXRyeSA9IHRydWU7XHJcbiAgY29uc3QgZGlzcXVhbGlmaWVkRnVuY3Rpb25zID0gW107IC8vIGZ1bmN0aW9ucyB0aGF0IHdlcmUgZGlzcXVhbGlmaWVkXHJcbiAgd2hpbGUgKCByZXRyeSApIHtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWN0b3J5RnVuY3Rpb25zLmxlbmd0aCA+IDAgKTtcclxuXHJcbiAgICAvLyBDaG9vc2UgYSBmdW5jdGlvbiBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGZ1cnRoZXIgY29uc2lkZXJhdGlvbi5cclxuICAgIGNvbnN0IHJhbmRvbUluZGV4ID0gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAwLCBmYWN0b3J5RnVuY3Rpb25zLmxlbmd0aCAtIDEgKTtcclxuICAgIGNvbnN0IGZhY3RvcnlGdW5jdGlvbiA9IGZhY3RvcnlGdW5jdGlvbnNbIHJhbmRvbUluZGV4IF07XHJcbiAgICBmYWN0b3J5RnVuY3Rpb25zLnNwbGljZSggcmFuZG9tSW5kZXgsIDEgKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIHJlYWN0aW9uIGFuZCB0ZXN0IGl0cyBjb2VmZmljaWVudHMuXHJcbiAgICByZWFjdGlvbiA9IGZhY3RvcnlGdW5jdGlvbigpO1xyXG4gICAgcmV0cnkgPSBoYXNSZWFjdGFudENvZWZmaWNpZW50c0FsbE9uZSggcmVhY3Rpb24gKTtcclxuXHJcbiAgICBpZiAoIHJldHJ5ICkge1xyXG4gICAgICBkaXNxdWFsaWZpZWRGdW5jdGlvbnMucHVzaCggZmFjdG9yeUZ1bmN0aW9uICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnN0IGdlbmVyYXRlZFJlYWN0aW9uID0gcmVhY3Rpb24hO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIGdlbmVyYXRlZFJlYWN0aW9uICk7XHJcblxyXG4gIC8vIFB1dCB0aGUgZnVuY3Rpb25zIHRoYXQgd2UgZGlkbid0IHVzZSBiYWNrIGluIHRoZSBwb29sLlxyXG4gIGRpc3F1YWxpZmllZEZ1bmN0aW9ucy5mb3JFYWNoKCBkaXNxdWFsaWZpZWRGdW5jdGlvbiA9PiB7XHJcbiAgICBmYWN0b3J5RnVuY3Rpb25zLnB1c2goIGRpc3F1YWxpZmllZEZ1bmN0aW9uICk7XHJcbiAgfSApO1xyXG5cclxuICAvLyBzZXQgcXVhbnRpdGllc1xyXG4gIGdlbmVyYXRlZFJlYWN0aW9uLnJlYWN0YW50cy5mb3JFYWNoKCByZWFjdGFudCA9PiB7XHJcbiAgICByZWFjdGFudC5xdWFudGl0eVByb3BlcnR5LnZhbHVlID0gZG90UmFuZG9tLm5leHRJbnRCZXR3ZWVuKCAxLCBNYXRoLm1heCggMSwgcmVhY3RhbnQuY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSAtIDEgKSApO1xyXG4gIH0gKTtcclxuXHJcbiAgcmV0dXJuIGdlbmVyYXRlZFJlYWN0aW9uO1xyXG59XHJcblxyXG4vKipcclxuICogRG9lcyB0aGlzIHJlYWN0aW9uIGhhdmUgY29lZmZpY2llbnQgb2YgMSBmb3IgYWxsIHJlYWN0YW50cz8gVGhpcyB0eXBlIG9mIHJlYWN0aW9uIGNhbm5vdCBwcm9kdWNlXHJcbiAqIHplcm8gcHJvZHVjdHMgd2l0aCBub24temVybyBxdWFudGl0aWVzLCBzbyB3ZSBkb24ndCB3YW50IHRvIHVzZSBpdCBmb3IgdGhhdCBwdXJwb3NlLlxyXG4gKi9cclxuZnVuY3Rpb24gaGFzUmVhY3RhbnRDb2VmZmljaWVudHNBbGxPbmUoIHJlYWN0aW9uOiBSZWFjdGlvbiApOiBib29sZWFuIHtcclxuICBsZXQgYWxsT25lID0gdHJ1ZTtcclxuICByZWFjdGlvbi5yZWFjdGFudHMuZm9yRWFjaCggcmVhY3RhbnQgPT4ge1xyXG4gICAgaWYgKCByZWFjdGFudC5jb2VmZmljaWVudFByb3BlcnR5LnZhbHVlICE9PSAxICkge1xyXG4gICAgICBhbGxPbmUgPSBmYWxzZTtcclxuICAgIH1cclxuICB9ICk7XHJcbiAgcmV0dXJuIGFsbE9uZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBhIHJlYWN0aW9uIGZvciBxdWFudGl0eSByYW5nZSB2aW9sYXRpb25zLlxyXG4gKi9cclxuZnVuY3Rpb24gaGFzUXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggcmVhY3Rpb246IFJlYWN0aW9uLCBtYXhRdWFudGl0eTogbnVtYmVyICk6IGJvb2xlYW4ge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG1heFF1YW50aXR5ICkgJiYgbWF4UXVhbnRpdHkgPiAwICk7XHJcblxyXG4gIGxldCB2aW9sYXRpb24gPSBmYWxzZTtcclxuICBsZXQgaTtcclxuICBmb3IgKCBpID0gMDsgIXZpb2xhdGlvbiAmJiBpIDwgcmVhY3Rpb24ucmVhY3RhbnRzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgdmlvbGF0aW9uID0gKCByZWFjdGlvbi5yZWFjdGFudHNbIGkgXS5xdWFudGl0eVByb3BlcnR5LnZhbHVlID4gbWF4UXVhbnRpdHkgKTtcclxuICB9XHJcbiAgZm9yICggaSA9IDA7ICF2aW9sYXRpb24gJiYgaSA8IHJlYWN0aW9uLnByb2R1Y3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgdmlvbGF0aW9uID0gKCByZWFjdGlvbi5wcm9kdWN0c1sgaSBdLnF1YW50aXR5UHJvcGVydHkudmFsdWUgPiBtYXhRdWFudGl0eSApO1xyXG4gIH1cclxuICBmb3IgKCBpID0gMDsgIXZpb2xhdGlvbiAmJiBpIDwgcmVhY3Rpb24ubGVmdG92ZXJzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgdmlvbGF0aW9uID0gKCByZWFjdGlvbi5sZWZ0b3ZlcnNbIGkgXS5xdWFudGl0eVByb3BlcnR5LnZhbHVlID4gbWF4UXVhbnRpdHkgKTtcclxuICB9XHJcbiAgcmV0dXJuIHZpb2xhdGlvbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZpeGVzIGFueSBxdWFudGl0eS1yYW5nZSB2aW9sYXRpb25zIGluIGEgcmVhY3Rpb24uXHJcbiAqIFdlIGRvIHRoaXMgYnkgZGVjcmVtZW50aW5nIHJlYWN0YW50IHF1YW50aXRpZXMgYnkgMSwgYWx0ZXJuYXRpbmcgcmVhY3RhbnRzIGFzIHdlIGRvIHNvLlxyXG4gKiBFYWNoIHJlYWN0YW50IG11c3QgaGF2ZSBhIHF1YW50aXR5IG9mIGF0IGxlYXN0IDEsIGluIG9yZGVyIHRvIGhhdmUgYSB2YWxpZCByZWFjdGlvbi5cclxuICpcclxuICogSW4gdGhlIEphdmEgdmVyc2lvbiBvZiB0aGlzIHNpbXVsYXRpb24sIHRoaXMgbWFuaWZlc3RlZCBpdHNlbGYgYXMgVW5mdWRkbGUgIzIxNTYuXHJcbiAqXHJcbiAqIEBwYXJhbSByZWFjdGlvblxyXG4gKiBAcGFyYW0gbWF4UXVhbnRpdHlcclxuICogQHBhcmFtIFtlbmFibGVEZWJ1Z091dHB1dF0gLSBwcmludHMgdG8gdGhlIGNvbnNvbGUgd2hlbiBhIHZpb2xhdGlvbiBpcyBmaXhlZFxyXG4gKi9cclxuZnVuY3Rpb24gZml4UXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggcmVhY3Rpb246IFJlYWN0aW9uLCBtYXhRdWFudGl0eTogbnVtYmVyLCBlbmFibGVEZWJ1Z091dHB1dCA9IGZhbHNlICk6IHZvaWQge1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIE51bWJlci5pc0ludGVnZXIoIG1heFF1YW50aXR5ICkgJiYgbWF4UXVhbnRpdHkgPiAwICk7XHJcblxyXG4gIGlmICggaGFzUXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggcmVhY3Rpb24sIG1heFF1YW50aXR5ICkgKSB7XHJcblxyXG4gICAgY29uc3QgYmVmb3JlRml4U3RyaW5nID0gRGV2U3RyaW5nVXRpbHMucmVhY3Rpb25TdHJpbmcoIHJlYWN0aW9uICk7XHJcblxyXG4gICAgLy8gRmlyc3QsIG1ha2Ugc3VyZSBhbGwgcmVhY3RhbnQgcXVhbnRpdGllcyBhcmUgaW4gcmFuZ2UuXHJcbiAgICByZWFjdGlvbi5yZWFjdGFudHMuZm9yRWFjaCggcmVhY3RhbnQgPT4ge1xyXG4gICAgICBpZiAoIHJlYWN0YW50LnF1YW50aXR5UHJvcGVydHkudmFsdWUgPiBtYXhRdWFudGl0eSApIHtcclxuICAgICAgICByZWFjdGFudC5xdWFudGl0eVByb3BlcnR5LnZhbHVlID0gbWF4UXVhbnRpdHk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBUaGVuIGluY3JlbWVudGFsbHkgcmVkdWNlIHJlYWN0YW50IHF1YW50aXRpZXMsIGFsdGVybmF0aW5nIHJlYWN0YW50cy5cclxuICAgIGxldCByZWFjdGFudEluZGV4ID0gMDtcclxuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XHJcbiAgICB3aGlsZSAoIGhhc1F1YW50aXR5UmFuZ2VWaW9sYXRpb24oIHJlYWN0aW9uLCBtYXhRdWFudGl0eSApICkge1xyXG4gICAgICBjb25zdCByZWFjdGFudCA9IHJlYWN0aW9uLnJlYWN0YW50c1sgcmVhY3RhbnRJbmRleCBdO1xyXG4gICAgICBjb25zdCBxdWFudGl0eSA9IHJlYWN0YW50LnF1YW50aXR5UHJvcGVydHkudmFsdWU7XHJcbiAgICAgIGlmICggcXVhbnRpdHkgPiAxICkge1xyXG4gICAgICAgIHJlYWN0YW50LnF1YW50aXR5UHJvcGVydHkudmFsdWUgPSByZWFjdGFudC5xdWFudGl0eVByb3BlcnR5LnZhbHVlIC0gMTtcclxuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZWFjdGFudEluZGV4Kys7XHJcbiAgICAgIGlmICggcmVhY3RhbnRJbmRleCA+IHJlYWN0aW9uLnJlYWN0YW50cy5sZW5ndGggLSAxICkge1xyXG4gICAgICAgIHJlYWN0YW50SW5kZXggPSAwO1xyXG4gICAgICAgIGlmICggIWNoYW5nZWQgKSB7XHJcbiAgICAgICAgICAvLyB3ZSBoYXZlIG5vdCBiZWVuIGFibGUgdG8gcmVkdWNlIGFueSByZWFjdGFudFxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgYWxsIHJlYWN0YW50cyBoYXZlIGJlZW4gcmVkdWNlZCBhbmQgd2UgYXJlIHN0aWxsIG91dCBvZiByYW5nZSwgYmFpbCB3aXRoIGEgc2VyaW91cyBlcnJvci5cclxuICAgIGlmICggaGFzUXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggcmVhY3Rpb24sIG1heFF1YW50aXR5ICkgKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvciggYEVSUk9SOiBxdWFudGl0eS1yYW5nZSB2aW9sYXRpb24gY2Fubm90IGJlIGZpeGVkOiAke2JlZm9yZUZpeFN0cmluZ31gICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBlbmFibGVEZWJ1Z091dHB1dCApIHtcclxuICAgICAgY29uc29sZS5sb2coIGBxdWFudGl0eSByYW5nZSB2aW9sYXRpb246ICR7YmVmb3JlRml4U3RyaW5nXHJcbiAgICAgIH0gZml4ZWQ6ICR7RGV2U3RyaW5nVXRpbHMucXVhbnRpdGllc1N0cmluZyggcmVhY3Rpb24gKX1gICk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogREVCVUdcclxuICogUnVucyBhIHNhbml0eSBjaGVjaywgbG9va2luZyBmb3IgcHJvYmxlbXMgd2l0aCByZWFjdGlvbnMgYW5kIHRoZSBjaGFsbGVuZ2UtY3JlYXRpb24gYWxnb3JpdGhtLlxyXG4gKiBJbnRlbmRlZCB0byBiZSBydW4gZnJvbSB0aGUgYnJvd3NlciBjb25zb2xlIHZpYSBDaGFsbGVuZ2VGYWN0b3J5LnRlc3QoKSwgb3IgcnVuIHRoZSBzaW11bGF0aW9uXHJcbiAqIHdpdGggJ2RldicgcXVlcnkgcGFyYW1ldGVyIGFuZCBwcmVzcyB0aGUgJ1Rlc3QnIGJ1dHRvbiB0aGF0IGFwcGVhcnMgb24gdGhlIEdhbWUncyBsZXZlbC1zZWxlY3Rpb24gc2NyZWVuLlxyXG4gKiBPdXRwdXQgaXMgcHJpbnRlZCB0byB0aGUgY29uc29sZS5cclxuICovXHJcbmZ1bmN0aW9uIGRvVGVzdCgpOiB2b2lkIHtcclxuXHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggIVJQQUxRdWVyeVBhcmFtZXRlcnMucGxheUFsbCApOyAvLyB0ZXN0IGRvZXNuJ3Qgd29yayB3aXRoIHNvbWUgcXVlcnkgcGFyYW1ldGVyc1xyXG5cclxuICAvLyBDdW11bGF0aXZlIGNvdW50cyBmb3IgdGhpcyB0ZXN0XHJcbiAgbGV0IG51bWJlck9mQ2hhbGxlbmdlc0dlbmVyYXRlZCA9IDA7XHJcbiAgbGV0IG51bWJlck9mQ29lZmZpY2llbnRSYW5nZUVycm9ycyA9IDA7XHJcbiAgbGV0IG51bWJlck9mUmVhY3RhbnRFcnJvcnMgPSAwO1xyXG4gIGxldCBudW1iZXJPZlByb2R1Y3RFcnJvcnMgPSAwO1xyXG4gIGxldCBudW1iZXJPZlF1YW50aXR5UmFuZ2VFcnJvcnMgPSAwO1xyXG5cclxuICAvLyBQcmludCByZWFjdGlvbnMgYnkgbGV2ZWwuIFB1dCBhbGwgcmVhY3Rpb25zIGluIGEgY29udGFpbmVyLCByZW1vdmluZyBkdXBsaWNhdGVzLlxyXG4gIGNvbnN0IGZhY3RvcnlGdW5jdGlvbnM6IEZhY3RvcnlGdW5jdGlvbltdID0gW107XHJcbiAgZm9yICggbGV0IGxldmVsID0gMDsgbGV2ZWwgPCBQT09MUy5sZW5ndGg7IGxldmVsKysgKSB7XHJcbiAgICBjb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XHJcbiAgICBjb25zb2xlLmxvZyggYExldmVsICR7bGV2ZWwgKyAxfWAgKTtcclxuICAgIGNvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IFBPT0xTWyBsZXZlbCBdLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBjb25zdCBmYWN0b3J5RnVuY3Rpb24gPSBQT09MU1sgbGV2ZWwgXVsgaSBdO1xyXG4gICAgICBjb25zdCByZWFjdGlvbiA9IGZhY3RvcnlGdW5jdGlvbigpO1xyXG4gICAgICBjb25zb2xlLmxvZyggRGV2U3RyaW5nVXRpbHMuZXF1YXRpb25TdHJpbmcoIHJlYWN0aW9uICkgKTtcclxuICAgICAgaWYgKCBmYWN0b3J5RnVuY3Rpb25zLmluY2x1ZGVzKCBmYWN0b3J5RnVuY3Rpb24gKSApIHtcclxuICAgICAgICBmYWN0b3J5RnVuY3Rpb25zLnB1c2goIGZhY3RvcnlGdW5jdGlvbiApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBMb29rIGZvciByZWFjdGlvbnMgd2l0aCBjb2VmZmljaWVudHMgPiBtYXhRdWFudGl0eSwgd2UgbXVzdCBoYXZlIG5vbmUgb2YgdGhlc2UuXHJcbiAgY29uc3QgbWF4UXVhbnRpdHkgPSBSUEFMQ29uc3RhbnRzLlFVQU5USVRZX1JBTkdFLm1heDtcclxuICBjb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XHJcbiAgY29uc29sZS5sb2coICdMb29raW5nIGZvciBjb2VmZmljaWVudC1yYW5nZSB2aW9sYXRpb25zIC4uLicgKTtcclxuICBjb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICk7XHJcbiAgZmFjdG9yeUZ1bmN0aW9ucy5mb3JFYWNoKCBmYWN0b3J5RnVuY3Rpb24gPT4ge1xyXG4gICAgY29uc3QgcmVhY3Rpb24gPSBmYWN0b3J5RnVuY3Rpb24oKTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlYWN0aW9uLnJlYWN0YW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgaWYgKCByZWFjdGlvbi5yZWFjdGFudHNbIGkgXS5jb2VmZmljaWVudFByb3BlcnR5LnZhbHVlID4gbWF4UXVhbnRpdHkgKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coIGBFUlJPUjogcmVhY3RhbnQgY29lZmZpY2llbnQgb3V0IG9mIHJhbmdlIDogJHtEZXZTdHJpbmdVdGlscy5lcXVhdGlvblN0cmluZyggcmVhY3Rpb24gKX1gICk7XHJcbiAgICAgICAgbnVtYmVyT2ZDb2VmZmljaWVudFJhbmdlRXJyb3JzKys7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlYWN0aW9uLnByb2R1Y3RzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICBpZiAoIHJlYWN0aW9uLnByb2R1Y3RzWyBpIF0uY29lZmZpY2llbnRQcm9wZXJ0eS52YWx1ZSA+IG1heFF1YW50aXR5ICkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBgRVJST1I6IHByb2R1Y3QgY29lZmZpY2llbnQgb3V0IG9mIHJhbmdlIDogJHtEZXZTdHJpbmdVdGlscy5lcXVhdGlvblN0cmluZyggcmVhY3Rpb24gKX1gICk7XHJcbiAgICAgICAgbnVtYmVyT2ZDb2VmZmljaWVudFJhbmdlRXJyb3JzKys7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9ICk7XHJcblxyXG4gIC8qXHJcbiAgICogTG9vayBmb3IgcXVhbnRpdHkgcmFuZ2UgdmlvbGF0aW9ucyBpbiBhbGwgcmVhY3Rpb25zLiBXZSBleHBlY3QgdGhlc2UsIGJ1dCByZXF1aXJlIHRoYXQgdGhleSBjYW4gYmUgZml4ZWQuXHJcbiAgICogVGhpcyB0ZXN0IHdpbGwgaGFsdCBpZiB3ZSBlbmNvdW50ZXIgYSB2aW9sYXRpb24gdGhhdCBjYW4ndCBiZSBmaXhlZC5cclxuICAgKi9cclxuICBjb25zb2xlLmxvZyggJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xyXG4gIGNvbnNvbGUubG9nKCAnTG9va2luZyBmb3IgcXVhbnRpdHktcmFuZ2UgdmlvbGF0aW9ucyB0aGF0IGNhbm5vdCBiZSBmaXhlZCAuLi4nICk7XHJcbiAgY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xyXG4gIGZhY3RvcnlGdW5jdGlvbnMuZm9yRWFjaCggZmFjdG9yeUZ1bmN0aW9uID0+IHtcclxuICAgIGNvbnN0IHJlYWN0aW9uID0gZmFjdG9yeUZ1bmN0aW9uKCk7XHJcbiAgICAvLyBzZXQgYWxsIHJlYWN0YW50IHF1YW50aXRpZXMgdG8gdGhlaXIgbWF4IHZhbHVlcy5cclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHJlYWN0aW9uLnJlYWN0YW50cy5sZW5ndGg7IGkrKyApIHtcclxuICAgICAgcmVhY3Rpb24ucmVhY3RhbnRzWyBpIF0ucXVhbnRpdHlQcm9wZXJ0eS52YWx1ZSA9IG1heFF1YW50aXR5O1xyXG4gICAgfVxyXG4gICAgLy8gbG9vayBmb3IgdmlvbGF0aW9ucyBhbmQgdHJ5IHRvIGZpeCB0aGVtLlxyXG4gICAgZml4UXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggcmVhY3Rpb24sIG1heFF1YW50aXR5LCB0cnVlIC8qIGVuYWJsZURlYnVnT3V0cHV0ICovICk7XHJcbiAgfSApO1xyXG5cclxuICAvLyBHZW5lcmF0ZSBtYW55IGNoYWxsZW5nZXMgZm9yIGVhY2ggbGV2ZWwsIGFuZCB2YWxpZGF0ZSBvdXIgZXhwZWN0YXRpb25zLlxyXG4gIGNvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcclxuICBjb25zb2xlLmxvZyggJ1Rlc3RpbmcgY2hhbGxlbmdlIGdlbmVyYXRpb24gLi4uJyApO1xyXG4gIGNvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcclxuXHJcbiAgZm9yICggbGV0IGxldmVsID0gMDsgbGV2ZWwgPCBQT09MUy5sZW5ndGg7IGxldmVsKysgKSB7XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKyApIHtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSBjaGFsbGVuZ2VzXHJcbiAgICAgIGNvbnN0IGNoYWxsZW5nZXMgPSBDaGFsbGVuZ2VGYWN0b3J5LmNyZWF0ZUNoYWxsZW5nZXMoIGxldmVsLCBtYXhRdWFudGl0eSApO1xyXG4gICAgICBudW1iZXJPZkNoYWxsZW5nZXNHZW5lcmF0ZWQgKz0gY2hhbGxlbmdlcy5sZW5ndGg7XHJcblxyXG4gICAgICAvLyB2YWxpZGF0ZVxyXG4gICAgICBsZXQgbnVtYmVyV2l0aFplcm9Qcm9kdWN0cyA9IDA7XHJcbiAgICAgIGZvciAoIGxldCBqID0gMDsgaiA8IGNoYWxsZW5nZXMubGVuZ3RoOyBqKysgKSB7XHJcbiAgICAgICAgY29uc3QgY2hhbGxlbmdlID0gY2hhbGxlbmdlc1sgaiBdO1xyXG5cclxuICAgICAgICAvLyB2ZXJpZnkgdGhhdCBhbGwgcmVhY3RhbnQgcXVhbnRpdGllcyBhcmUgPiAwXHJcbiAgICAgICAgbGV0IHplcm9SZWFjdGFudHMgPSBmYWxzZTtcclxuICAgICAgICBjaGFsbGVuZ2UucmVhY3Rpb24ucmVhY3RhbnRzLmZvckVhY2goIHJlYWN0YW50ID0+IHtcclxuICAgICAgICAgIGlmICggcmVhY3RhbnQucXVhbnRpdHlQcm9wZXJ0eS52YWx1ZSA8IDEgKSB7XHJcbiAgICAgICAgICAgIHplcm9SZWFjdGFudHMgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBpZiAoIHplcm9SZWFjdGFudHMgKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyggYEVSUk9SOiBjaGFsbGVuZ2UgaGFzIHplcm8gcmVhY3RhbnRzLCBsZXZlbD0ke2xldmVsfSA6ICR7XHJcbiAgICAgICAgICAgIERldlN0cmluZ1V0aWxzLnJlYWN0aW9uU3RyaW5nKCBjaGFsbGVuZ2UucmVhY3Rpb24gKX1gICk7XHJcbiAgICAgICAgICBudW1iZXJPZlJlYWN0YW50RXJyb3JzKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBjb3VudCBob3cgbWFueSBjaGFsbGVuZ2VzIGhhdmUgemVybyBwcm9kdWN0c1xyXG4gICAgICAgIGxldCBub25aZXJvUHJvZHVjdHMgPSAwO1xyXG4gICAgICAgIGNoYWxsZW5nZS5yZWFjdGlvbi5wcm9kdWN0cy5mb3JFYWNoKCBwcm9kdWN0ID0+IHtcclxuICAgICAgICAgIGlmICggcHJvZHVjdC5xdWFudGl0eVByb3BlcnR5LnZhbHVlID4gMCApIHtcclxuICAgICAgICAgICAgbm9uWmVyb1Byb2R1Y3RzKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGlmICggbm9uWmVyb1Byb2R1Y3RzID09PSAwICkge1xyXG4gICAgICAgICAgbnVtYmVyV2l0aFplcm9Qcm9kdWN0cysrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcXVhbnRpdHktcmFuZ2UgdmlvbGF0aW9uP1xyXG4gICAgICAgIGlmICggaGFzUXVhbnRpdHlSYW5nZVZpb2xhdGlvbiggY2hhbGxlbmdlLnJlYWN0aW9uLCBtYXhRdWFudGl0eSApICkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coIGBFUlJPUjogY2hhbGxlbmdlIGhhcyBxdWFudGl0eS1yYW5nZSB2aW9sYXRpb24sIGxldmVsPSR7bGV2ZWx9IDogJHtEZXZTdHJpbmdVdGlscy5yZWFjdGlvblN0cmluZyggY2hhbGxlbmdlLnJlYWN0aW9uICl9YCApO1xyXG4gICAgICAgICAgbnVtYmVyT2ZRdWFudGl0eVJhbmdlRXJyb3JzKys7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzaG91bGQgaGF2ZSBleGFjdGx5IG9uZSBjaGFsbGVuZ2Ugd2l0aCB6ZXJvIHByb2R1Y3RzIChpcnJlbGV2YW50IGZvciAncGxheUFsbCcpXHJcbiAgICAgIGlmICggbnVtYmVyV2l0aFplcm9Qcm9kdWN0cyAhPT0gMSAmJiAhUlBBTFF1ZXJ5UGFyYW1ldGVycy5wbGF5QWxsICkge1xyXG4gICAgICAgIG51bWJlck9mUHJvZHVjdEVycm9ycysrO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCBgRVJST1I6IG1vcmUgdGhhbiBvbmUgY2hhbGxlbmdlIHdpdGggemVybyBwcm9kdWN0cywgbGV2ZWw9JHtsZXZlbH0gY2hhbGxlbmdlcz1gICk7XHJcbiAgICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgY2hhbGxlbmdlcy5sZW5ndGg7IGorKyApIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCBgJHtqfTogJHtEZXZTdHJpbmdVdGlscy5yZWFjdGlvblN0cmluZyggY2hhbGxlbmdlc1sgaiBdLnJlYWN0aW9uICl9YCApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gSW5zcGVjdCB0aGlzIGJpdCBvZiBvdXRwdXQgd2hlbiB0aGUgdGVzdCBoYXMgY29tcGxldGVkLiBFcnJvcnMgc2hvdWxkIGFsbCBiZSB6ZXJvLlxyXG4gIGNvbnNvbGUubG9nKCAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgKTtcclxuICBjb25zb2xlLmxvZyggJ1N1bW1hcnknICk7XHJcbiAgY29uc29sZS5sb2coICctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJyApO1xyXG4gIGNvbnNvbGUubG9nKCBgY2hhbGxlbmdlcyBnZW5lcmF0ZWQgPSAke251bWJlck9mQ2hhbGxlbmdlc0dlbmVyYXRlZH1gICk7XHJcbiAgY29uc29sZS5sb2coIGBjb2VmZmljaWVudC1yYW5nZSBlcnJvcnMgPSAke251bWJlck9mQ29lZmZpY2llbnRSYW5nZUVycm9yc31gICk7XHJcbiAgY29uc29sZS5sb2coIGB6ZXJvLXJlYWN0YW50IGVycm9ycyA9ICR7bnVtYmVyT2ZSZWFjdGFudEVycm9yc31gICk7XHJcbiAgY29uc29sZS5sb2coIGB6ZXJvLXByb2R1Y3QgZXJyb3JzID0gJHtudW1iZXJPZlByb2R1Y3RFcnJvcnN9YCApO1xyXG4gIGNvbnNvbGUubG9nKCBgcXVhbnRpdHktcmFuZ2UgZXJyb3JzID0gJHtudW1iZXJPZlF1YW50aXR5UmFuZ2VFcnJvcnN9YCApO1xyXG4gIGNvbnNvbGUubG9nKCAnPGRvbmU+JyApO1xyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ0NoYWxsZW5nZUZhY3RvcnknLCBDaGFsbGVuZ2VGYWN0b3J5ICk7XHJcbmV4cG9ydCBkZWZhdWx0IENoYWxsZW5nZUZhY3Rvcnk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxlQUFlLE1BQU0sdUNBQXVDO0FBQ25FLE9BQU9DLGFBQWEsTUFBTSwrQkFBK0I7QUFDekQsT0FBT0MsbUJBQW1CLE1BQU0scUNBQXFDO0FBQ3JFLE9BQU9DLGNBQWMsTUFBTSw2QkFBNkI7QUFDeEQsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBQ2xGLE9BQU9DLFNBQVMsTUFBNEIsZ0JBQWdCO0FBRzVELE1BQU1DLG9CQUFvQixHQUFHLENBQUM7QUFJOUI7QUFDQSxNQUFNQyxXQUE4QixHQUFHLENBQ3JDUCxlQUFlLENBQUNRLHVCQUF1QjtBQUFFO0FBQ3pDUixlQUFlLENBQUNTLFNBQVMsRUFDekJULGVBQWUsQ0FBQ1UsbUJBQW1CLEVBQ25DVixlQUFlLENBQUNXLHFCQUFxQixFQUNyQ1gsZUFBZSxDQUFDWSxzQkFBc0IsRUFDdENaLGVBQWUsQ0FBQ2EsdUJBQXVCLEVBQ3ZDYixlQUFlLENBQUNjLHNCQUFzQixF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