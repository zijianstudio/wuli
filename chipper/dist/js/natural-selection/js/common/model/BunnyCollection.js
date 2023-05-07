// Copyright 2020-2022, University of Colorado Boulder

/**
 * BunnyCollection is the collection of Bunny instances, with methods for managing that collection.
 * It encapsulates BunnyGroup (the PhetioGroup), hiding it from the rest of the sim.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import naturalSelection from '../../naturalSelection.js';
import NaturalSelectionConstants from '../NaturalSelectionConstants.js';
import NaturalSelectionQueryParameters from '../NaturalSelectionQueryParameters.js';
import BunnyGroup from './BunnyGroup.js';
import createBunnyArray from './createBunnyArray.js';
import PunnettSquare from './PunnettSquare.js';
import SelectedBunnyProperty from './SelectedBunnyProperty.js';
import NaturalSelectionUtils from '../NaturalSelectionUtils.js';

// constants

const LITTER_SIZE = 4;
assert && assert(LITTER_SIZE === 4, 'LITTER_SIZE must be 4, to correspond to the Punnett square that results from Mendel\'s Law of Segregation');

// Ranges for bunny rest time, as specified in https://github.com/phetsims/natural-selection/issues/129
// Bunnies rest longer as the population grows larger.
const BUNNY_REST_RANGE_SHORT = new Range(1, 3);
const BUNNY_REST_RANGE_MEDIUM = new Range(2, 7);
const BUNNY_REST_RANGE_LONG = new Range(6, 10);

// The maximum number of generations that a dead bunny needs to exist before it can be disposed.
// This is based on the Pedigree graph depth, because the Pedigree graph is the only place where
// dead bunnies appear. See https://github.com/phetsims/natural-selection/issues/112
const MAX_DEAD_BUNNY_GENERATIONS = NaturalSelectionQueryParameters.maxAge * (NaturalSelectionConstants.PEDIGREE_TREE_DEPTH - 1);
export default class BunnyCollection {
  // the live bunnies in bunnyGroup

  // the dead bunnies in bunnyGroup

  // Recessive mutants, to be mated eagerly so that their mutation appears in the phenotype as soon as possible.
  // Mutants are added to this array when born, and removed as soon as they have mated with another bunny that
  // has the same mutant allele. See also the 'Recessive Mutants' section of model.md at
  // https://github.com/phetsims/natural-selection/blob/master/doc/model.md#recessive-mutants.
  // The range of time that a bunny will reset between hops, in seconds.
  // This value is derived from population size, so that bunnies rest longer when the population is larger,
  // resulting in less motion on screen and fewer updates. dispose is not necessary.
  // Range values and populations sizes are specified in https://github.com/phetsims/natural-selection/issues/129
  // the bunny that is selected in the Pedigree graph
  // Notifies listeners when all bunnies have died. dispose is not necessary.
  // Notifies listeners when bunnies have taken over the world. dispose is not necessary.
  constructor(modelViewTransform, genePool, tandem) {
    this.liveBunnies = createBunnyArray({
      tandem: tandem.createTandem('liveBunnies')
    });
    this.deadBunnies = createBunnyArray({
      tandem: tandem.createTandem('deadBunnies')
    });
    this.recessiveMutants = createBunnyArray({
      tandem: tandem.createTandem('recessiveMutants'),
      phetioDocumentation: 'for internal PhET use only'
    });
    this.bunnyRestRangeProperty = new DerivedProperty([this.liveBunnies.lengthProperty], length => {
      if (length < 10) {
        return BUNNY_REST_RANGE_SHORT;
      } else if (length < 250) {
        return BUNNY_REST_RANGE_MEDIUM;
      } else {
        return BUNNY_REST_RANGE_LONG;
      }
    }, {
      tandem: tandem.createTandem('bunnyRestRangeProperty'),
      phetioValueType: Range.RangeIO,
      phetioDocumentation: 'for internal PhET use only'
    });

    // the PhetioGroup that manages Bunny instances as dynamic PhET-iO elements
    const bunnyGroup = new BunnyGroup(genePool, modelViewTransform, this.bunnyRestRangeProperty, {
      tandem: tandem.createTandem('bunnyGroup')
    });
    this.selectedBunnyProperty = new SelectedBunnyProperty({
      tandem: tandem.createTandem('selectedBunnyProperty')
    });

    // unlink is not necessary.
    phet.log && this.selectedBunnyProperty.link(selectedBunny => {
      phet.log && phet.log(`selectedBunny=${selectedBunny}`);
    });
    this.allBunniesHaveDiedEmitter = new Emitter({
      tandem: tandem.createTandem('allBunniesHaveDiedEmitter'),
      phetioReadOnly: true,
      phetioDocumentation: 'fires when all of the bunnies have died'
    });

    // removeListener is not necessary
    phet.log && this.allBunniesHaveDiedEmitter.addListener(() => {
      phet.log && phet.log('All of the bunnies have died.');
      phet.log && phet.log(`total live bunnies = ${this.liveBunnies.length}`);
      phet.log && phet.log(`total dead bunnies = ${this.deadBunnies.length}`);
    });
    this.bunniesHaveTakenOverTheWorldEmitter = new Emitter({
      tandem: tandem.createTandem('bunniesHaveTakenOverTheWorldEmitter'),
      phetioReadOnly: true,
      phetioDocumentation: 'fires when bunnies have taken over the world'
    });

    // removeListener is not necessary
    phet.log && this.bunniesHaveTakenOverTheWorldEmitter.addListener(() => {
      phet.log && phet.log('Bunnies have taken over the world.');
      phet.log && phet.log(`total live bunnies = ${this.liveBunnies.length}`);
      phet.log && phet.log(`total dead bunnies = ${this.deadBunnies.length}`);
    });

    // This listener is called when a bunny is created during normal running of the sim, or restored via PhET-iO.
    // removeListener is not necessary.
    bunnyGroup.elementCreatedEmitter.addListener(bunny => {
      if (bunny.isAlive) {
        // When the bunny dies, clean up.
        // removeListener is not necessary because Bunny.diedEmitter is disposed when the bunny dies or is disposed.
        bunny.diedEmitter.addListener(() => {
          const liveBunnyIndex = this.liveBunnies.indexOf(bunny);
          assert && assert(liveBunnyIndex !== -1, 'expected bunny to be in liveBunnies');
          this.liveBunnies.splice(liveBunnyIndex, 1);
          this.deadBunnies.push(bunny);
          const recessiveMutantsIndex = this.recessiveMutants.indexOf(bunny);
          if (recessiveMutantsIndex !== -1) {
            this.recessiveMutants.splice(recessiveMutantsIndex, 1);
          }
          if (this.liveBunnies.length === 0) {
            this.allBunniesHaveDiedEmitter.emit();
          }
        });
        this.liveBunnies.push(bunny);
      } else {
        assert && assert(phet.joist.sim.isSettingPhetioStateProperty.value, 'a dead bunny should only be created when restoring PhET-iO state');
        this.deadBunnies.push(bunny);
      }
    });

    // When a bunny is disposed, remove it from the appropriate arrays. removeListener is not necessary.
    bunnyGroup.elementDisposedEmitter.addListener(bunny => {
      const liveIndex = this.liveBunnies.indexOf(bunny);
      if (liveIndex !== -1) {
        this.liveBunnies.splice(liveIndex, 1);

        // If the bunny was in liveBunnies, it might also be in recessiveMutants.
        const recessiveIndex = this.recessiveMutants.indexOf(bunny);
        recessiveIndex !== -1 && this.recessiveMutants.splice(recessiveIndex, 1);
      } else {
        // If the bunny was not in liveBunnies, it might be in deadBunnies.
        const deadIndex = this.deadBunnies.indexOf(bunny);
        deadIndex !== -1 && this.deadBunnies.splice(deadIndex, 1);
      }

      // Verify that we don't have a logic error that results in retaining a reference to bunny.
      assert && assert(!this.liveBunnies.includes(bunny), 'bunny is still in liveBunnies');
      assert && assert(!this.deadBunnies.includes(bunny), 'bunny is still in deadBunnies');
      assert && assert(!this.recessiveMutants.includes(bunny), 'bunny is still in recessiveMutants');
    });
    this.genePool = genePool;
    this.bunnyGroup = bunnyGroup;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
  reset() {
    this.bunnyGroup.clear(); // calls dispose for all Bunny instances
    this.selectedBunnyProperty.reset();
    assert && this.assertValidCounts();
  }

  /**
   * Creates a Bunny.
   */
  createBunny(options) {
    return this.bunnyGroup.createNextElement(options);
  }

  /**
   * Creates a generation-zero Bunny, which has no parents since it's the first generation to exist.
   */
  createBunnyZero(providedOptions) {
    return this.createBunny(combineOptions({
      father: null,
      mother: null,
      generation: 0
    }, providedOptions));
  }

  /**
   * Moves all live bunnies.
   * @param dt - time step, in seconds
   */
  moveBunnies(dt) {
    assert && assert(dt >= 0, `invalid dt: ${dt}`);
    this.liveBunnies.forEach(bunny => bunny.move(dt));
  }

  /**
   * Ages all live bunnies. Bunnies that reach the maximum age will die. See also the 'Life Expectancy' section of
   * model.md at https://github.com/phetsims/natural-selection/blob/master/doc/model.md#life-expectancy.
   */
  ageBunnies() {
    assert && assert(_.every(this.liveBunnies, bunny => bunny.isAlive), 'liveBunnies contains one or more dead bunnies');
    let diedCount = 0;

    // liveBunnies will change if any bunnies die, so operate on a copy
    const liveBunniesCopy = this.liveBunnies.slice();
    liveBunniesCopy.forEach(bunny => {
      // bunny is one generation older
      bunny.age++;
      assert && assert(bunny.age <= NaturalSelectionQueryParameters.maxAge, `${bunny.tandem.name} age=${bunny.age} exceeds maxAge=${NaturalSelectionQueryParameters.maxAge}`);

      // bunny dies if it exceeds the maximum age
      if (bunny.age === NaturalSelectionQueryParameters.maxAge) {
        bunny.die();
        diedCount++;
      }
    });
    assert && this.assertValidCounts();
    phet.log && phet.log(`${diedCount} bunnies died of old age`);
  }

  /**
   * Mates all live bunnies by randomly pairing them up. Any bunny can mate with any other bunny, regardless of their
   * age or previous hereditary relationship. If there is an odd number of bunnies, then one of them will not mate.
   * Mutations (if any) are applied as the bunnies are born. See also the 'Reproduction' section of model.md at
   * https://github.com/phetsims/natural-selection/blob/master/doc/model.md#reproduction.
   */
  mateBunnies(generation) {
    assert && assert(NaturalSelectionUtils.isNonNegativeInteger(generation), 'invalid generation');

    // The number of bunnies born.
    let bornIndex = 0;

    // Shuffle the collection of live bunnies so that mating is random. shuffle returns a new array.
    const bunnies = dotRandom.shuffle(this.liveBunnies);
    phet.log && phet.log(`mating ${bunnies.length} bunnies`);

    // Prioritize mating of bunnies that have a recessive mutation, so that the mutation appears in the phenotype
    // as soon as possible. This is referred to as 'mating eagerly'.
    // See https://github.com/phetsims/natural-selection/issues/98.
    let numberOfRecessiveMutantOffspring = 0;
    if (this.recessiveMutants.length > 0) {
      numberOfRecessiveMutantOffspring = this.mateEagerly(generation, bunnies);
    }

    // The number of bunnies that we expect to be born.
    const numberToBeBorn = Math.floor(bunnies.length / 2) * LITTER_SIZE;

    // Determine which mutations should be applied, then reset the gene pool.
    const mutateFur = this.genePool.furGene.mutationComingProperty.value;
    const mutateEars = this.genePool.earsGene.mutationComingProperty.value;
    const mutateTeeth = this.genePool.teethGene.mutationComingProperty.value;
    this.genePool.resetMutationComing();

    // Indices (values of bornIndex) for the new bunnies that will be mutated.
    // Mutations are mutually exclusive, as are the values in these arrays.
    let furIndices = [];
    let earsIndices = [];
    let teethIndices = [];

    // If a mutation is to be applied...
    if (mutateFur || mutateEars || mutateTeeth) {
      // When a mutation is applied, this is the number of bunnies that will receive that mutation.
      const numberToMutate = Math.max(1, Utils.roundSymmetric(NaturalSelectionQueryParameters.mutationPercentage * numberToBeBorn));

      // Create indices of the new bunnies, for the purpose of applying mutations.
      let indices = [];
      for (let i = 0; i < numberToBeBorn; i++) {
        indices.push(i);
      }

      // Randomly shuffle the indices, so that we can just take how many we need from the beginning of the array.
      indices = dotRandom.shuffle(indices);

      // Select indices for each mutation that will be applied by taking indices from the beginning of the array.
      if (mutateFur) {
        furIndices = indices.splice(0, numberToMutate);
      }
      if (mutateEars) {
        earsIndices = indices.splice(0, numberToMutate);
      }
      if (mutateTeeth) {
        teethIndices = indices.splice(0, numberToMutate);
      }
    }
    assert && assert(Array.isArray(furIndices), 'expected an array');
    assert && assert(Array.isArray(earsIndices), 'expected an array');
    assert && assert(Array.isArray(teethIndices), 'expected an array');

    // Mate pairs from the collection, applying mutations where appropriate.
    for (let i = 1; i < bunnies.length; i = i + 2) {
      // Mate adjacent bunnies. In this sim, bunnies are sexless, so their sex is irrelevant.
      const father = bunnies[i];
      const mother = bunnies[i - 1];

      // Get the Punnett square (genetic cross) for each gene. The order of each cross is random.
      const furPunnetSquare = new PunnettSquare(father.genotype.furGenePair, mother.genotype.furGenePair);
      const earsPunnetSquare = new PunnettSquare(father.genotype.earsGenePair, mother.genotype.earsGenePair);
      const teethPunnetSquare = new PunnettSquare(father.genotype.teethGenePair, mother.genotype.teethGenePair);

      // Create a litter for this bunny pair
      for (let j = 0; j < LITTER_SIZE; j++) {
        // A bunny is born
        const bunny = this.createBunny({
          father: father,
          mother: mother,
          generation: generation,
          genotypeOptions: {
            // inherited alleles
            fatherFurAllele: furPunnetSquare.getCell(j).fatherAllele,
            motherFurAllele: furPunnetSquare.getCell(j).motherAllele,
            fatherEarsAllele: earsPunnetSquare.getCell(j).fatherAllele,
            motherEarsAllele: earsPunnetSquare.getCell(j).motherAllele,
            fatherTeethAllele: teethPunnetSquare.getCell(j).fatherAllele,
            motherTeethAllele: teethPunnetSquare.getCell(j).motherAllele,
            // mutations
            mutateFur: furIndices.includes(bornIndex),
            mutateEars: earsIndices.includes(bornIndex),
            mutateTeeth: teethIndices.includes(bornIndex)
          }
        });
        bornIndex++;

        // Keep track of recessive mutants, to be 'mated eagerly' when another bunny with the mutation exists.
        if (bunny.isOriginalMutant() && this.genePool.isRecessiveMutation(bunny.genotype.mutation)) {
          phet.log && phet.log(`adding to recessiveMutants: ${bunny}`);
          this.recessiveMutants.push(bunny);
        }
      }
    }
    assert && this.assertValidCounts();
    assert && assert(bornIndex === numberToBeBorn, 'unexpected number of bunnies were born');
    phet.log && phet.log(`${numberToBeBorn + numberOfRecessiveMutantOffspring} bunnies were born`);

    // Notify if bunnies have taken over the world.
    if (this.liveBunnies.lengthProperty.value >= NaturalSelectionQueryParameters.maxPopulation) {
      this.bunniesHaveTakenOverTheWorldEmitter.emit();
    }
  }

  /**
   * Mates each recessive mutant with a bunny that has the same mutation. This is referred to as 'mate eagerly', as
   * the purpose is to make the mutation appear in the phenotype sooner. This must be done separately from other mating
   * because we don't want to apply additional mutations. As a side-effect, bunnies that are successfully mated are
   * removed from the bunnies array. See also the 'Recessive Mutants' section of model.md at
   * https://github.com/phetsims/natural-selection/blob/master/doc/model.md#recessive-mutants.
   *
   * Note that some parts of this method look similar to method mateBunnies. There are in fact significant differences,
   * which made it difficult (and less clear) to factor out commonalities.
   *
   * @param generation
   * @param bunnies - the bunnies that are candidates for mating, modified as a side-effect
   * @returns the number of bunnies born
   */
  mateEagerly(generation, bunnies) {
    assert && assert(NaturalSelectionUtils.isNonNegativeInteger(generation), 'invalid generation');
    let numberOfRecessiveMutantsMated = 0;
    let numberBorn = 0;

    // Get a copy of the array. We'll be iterating over this until it's empty.
    const recessiveMutantsCopy = this.recessiveMutants.slice();

    // For each recessive mutant...
    while (recessiveMutantsCopy.length > 0) {
      const fatherIndex = 0;
      const mutantFather = recessiveMutantsCopy[fatherIndex];
      recessiveMutantsCopy.splice(fatherIndex, 1);

      // If we find a mate...
      const mutantMother = getMateForRecessiveMutant(mutantFather, bunnies);
      if (mutantMother) {
        phet.log && phet.log(`recessive mutant [${mutantFather}] is mating with [${mutantMother}]`);
        numberOfRecessiveMutantsMated++;

        // Get the Punnett square (genetic cross) for each gene. The order of each cross is random.
        const furPunnetSquare = new PunnettSquare(mutantFather.genotype.furGenePair, mutantMother.genotype.furGenePair);
        const earsPunnetSquare = new PunnettSquare(mutantFather.genotype.earsGenePair, mutantMother.genotype.earsGenePair);
        const teethPunnetSquare = new PunnettSquare(mutantFather.genotype.teethGenePair, mutantMother.genotype.teethGenePair);

        // Create a litter for this bunny pair
        for (let i = 0; i < LITTER_SIZE; i++) {
          // inherited alleles
          const genotypeOptions = {
            fatherFurAllele: furPunnetSquare.getCell(i).fatherAllele,
            motherFurAllele: furPunnetSquare.getCell(i).motherAllele,
            fatherEarsAllele: earsPunnetSquare.getCell(i).fatherAllele,
            motherEarsAllele: earsPunnetSquare.getCell(i).motherAllele,
            fatherTeethAllele: teethPunnetSquare.getCell(i).fatherAllele,
            motherTeethAllele: teethPunnetSquare.getCell(i).motherAllele
          };

          // A bunny is born
          this.createBunny({
            father: mutantFather,
            mother: mutantMother,
            generation: generation,
            genotypeOptions: genotypeOptions
          });
          numberBorn++;
        }

        // Create 1 additional offspring that is homozygous recessive, in order to make the recessive allele
        // propagate through the phenotype more quickly.
        // See https://github.com/phetsims/natural-selection/issues/98#issuecomment-646275437
        const mutantAllele = mutantFather.genotype.mutation;
        assert && assert(mutantAllele);
        const furCell = furPunnetSquare.getAdditionalCell(mutantAllele, this.genePool.furGene.dominantAlleleProperty.value);
        const earsCell = earsPunnetSquare.getAdditionalCell(mutantAllele, this.genePool.earsGene.dominantAlleleProperty.value);
        const teethCell = teethPunnetSquare.getAdditionalCell(mutantAllele, this.genePool.teethGene.dominantAlleleProperty.value);
        const genotypeOptions = {
          fatherFurAllele: furCell.fatherAllele,
          motherFurAllele: furCell.motherAllele,
          fatherEarsAllele: earsCell.fatherAllele,
          motherEarsAllele: earsCell.motherAllele,
          fatherTeethAllele: teethCell.fatherAllele,
          motherTeethAllele: teethCell.motherAllele
        };
        this.createBunny({
          father: mutantFather,
          mother: mutantMother,
          generation: generation,
          genotypeOptions: genotypeOptions
        });
        numberBorn++;

        // Remove the mutants from further consideration of mating.
        bunnies.splice(bunnies.indexOf(mutantFather), 1);
        bunnies.splice(bunnies.indexOf(mutantMother), 1);

        // Remove the mutant father from further consideration of mating eagerly.
        const mutantFatherIndex = this.recessiveMutants.indexOf(mutantFather);
        assert && assert(mutantFatherIndex !== -1, 'expected mutantFather to be in recessiveMutants');
        this.recessiveMutants.splice(mutantFatherIndex, 1);

        // Remove the mutant mother from further consideration of mating eagerly. Note that the mother may have been a
        // sibling (another original mutant created in the same generation) or a member of a later generation.
        const mutantMotherIndex = this.recessiveMutants.indexOf(mutantMother);
        if (mutantMotherIndex !== -1) {
          this.recessiveMutants.splice(mutantMotherIndex, 1);
          numberOfRecessiveMutantsMated++;
          const mutantMotherCopyIndex = recessiveMutantsCopy.indexOf(mutantMother);
          if (mutantMotherCopyIndex !== -1) {
            recessiveMutantsCopy.splice(mutantMotherCopyIndex, 1);
          }
        }
        assert && assert(!this.recessiveMutants.includes(mutantMother), 'mutantMother should not be in recessiveMutants');
        assert && assert(!recessiveMutantsCopy.includes(mutantMother), 'mutantMother should not be in recessiveMutantsCopy');
      }
    }
    if (numberOfRecessiveMutantsMated > 0) {
      phet.log && phet.log(`${numberOfRecessiveMutantsMated} recessive mutants mated eagerly to birth ${numberBorn} bunnies`);
    }
    return numberBorn;
  }

  /**
   * Moves all live bunnies to the ground, so that we don't have bunnies paused mid-hop.
   */
  moveBunniesToGround() {
    this.liveBunnies.forEach(bunny => bunny.interruptHop());
  }

  /**
   * Gets the bunnies that are candidates for natural selection due to environmental factors, in a random order.
   */
  getSelectionCandidates() {
    return dotRandom.shuffle(this.liveBunnies); // shuffle returns a new array
  }

  /**
   * Gets the live bunny counts (total and each phenotype).
   */
  getLiveBunnyCounts() {
    return this.liveBunnies.countsProperty.value;
  }

  /**
   * Gets the number of live bunnies.
   */
  getNumberOfLiveBunnies() {
    return this.liveBunnies.length;
  }

  /**
   * Gets the number of dead bunnies.
   */
  getNumberOfDeadBunnies() {
    return this.deadBunnies.length;
  }

  /**
   * Gets the number of recessive mutants that are waiting to mate eagerly.
   */
  getNumberOfRecessiveMutants() {
    return this.recessiveMutants.length;
  }

  /**
   * Disposes of dead bunnies that are guaranteed not to be needed by the Pedigree graph.
   * See https://github.com/phetsims/natural-selection/issues/112
   * @param generation - the current generation number
   */
  pruneDeadBunnies(generation) {
    assert && assert(NaturalSelectionUtils.isPositiveInteger(generation), 'invalid generation');
    let numberPruned = 0;

    // This modifies the array. Iterate backwards to avoid having to make a copy.
    for (let i = this.deadBunnies.length - 1; i >= 0; i--) {
      const bunny = this.deadBunnies[i];
      if (generation - bunny.generation > MAX_DEAD_BUNNY_GENERATIONS && this.selectedBunnyProperty.value !== bunny) {
        this.bunnyGroup.disposeElement(bunny);
        assert && assert(bunny.isDisposed, 'expect bunny to be disposed');
        numberPruned++;
      }
    }
    if (numberPruned > 0) {
      phet.log && phet.log(`${numberPruned} dead bunnies pruned`);
    }
  }

  /**
   * Asserts that collection counts are in-sync with the BunnyGroup.
   */
  assertValidCounts() {
    const live = this.liveBunnies.length;
    const dead = this.deadBunnies.length;
    const total = live + dead;
    const bunnyGroupLength = this.bunnyGroup.count;
    assert && assert(live + dead === total && total === bunnyGroupLength, `bunny counts are out of sync, live=${live}, dead=${dead}, total=${total} bunnyGroupLength=${bunnyGroupLength}`);
  }
}

/**
 * Gets a suitable mate for a recessive mutant.
 * The mate must have the same mutant allele that caused the recessive mutant to mutate.
 * @returns null if no mate is found
 */
function getMateForRecessiveMutant(father, bunnies) {
  assert && assert(father.isOriginalMutant(), 'father must be an original mutant');
  assert && assert(father.genotype.mutation, 'father must have a mutated genotype');
  let mother = null;
  for (let i = 0; i < bunnies.length && !mother; i++) {
    const bunny = bunnies[i];
    if (bunny !== father && bunny.genotype.hasAllele(father.genotype.mutation)) {
      mother = bunny;
    }
  }
  return mother;
}
naturalSelection.register('BunnyCollection', BunnyCollection);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJFbWl0dGVyIiwiZG90UmFuZG9tIiwiUmFuZ2UiLCJVdGlscyIsImNvbWJpbmVPcHRpb25zIiwibmF0dXJhbFNlbGVjdGlvbiIsIk5hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMiLCJOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzIiwiQnVubnlHcm91cCIsImNyZWF0ZUJ1bm55QXJyYXkiLCJQdW5uZXR0U3F1YXJlIiwiU2VsZWN0ZWRCdW5ueVByb3BlcnR5IiwiTmF0dXJhbFNlbGVjdGlvblV0aWxzIiwiTElUVEVSX1NJWkUiLCJhc3NlcnQiLCJCVU5OWV9SRVNUX1JBTkdFX1NIT1JUIiwiQlVOTllfUkVTVF9SQU5HRV9NRURJVU0iLCJCVU5OWV9SRVNUX1JBTkdFX0xPTkciLCJNQVhfREVBRF9CVU5OWV9HRU5FUkFUSU9OUyIsIm1heEFnZSIsIlBFRElHUkVFX1RSRUVfREVQVEgiLCJCdW5ueUNvbGxlY3Rpb24iLCJjb25zdHJ1Y3RvciIsIm1vZGVsVmlld1RyYW5zZm9ybSIsImdlbmVQb29sIiwidGFuZGVtIiwibGl2ZUJ1bm5pZXMiLCJjcmVhdGVUYW5kZW0iLCJkZWFkQnVubmllcyIsInJlY2Vzc2l2ZU11dGFudHMiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwiYnVubnlSZXN0UmFuZ2VQcm9wZXJ0eSIsImxlbmd0aFByb3BlcnR5IiwibGVuZ3RoIiwicGhldGlvVmFsdWVUeXBlIiwiUmFuZ2VJTyIsImJ1bm55R3JvdXAiLCJzZWxlY3RlZEJ1bm55UHJvcGVydHkiLCJwaGV0IiwibG9nIiwibGluayIsInNlbGVjdGVkQnVubnkiLCJhbGxCdW5uaWVzSGF2ZURpZWRFbWl0dGVyIiwicGhldGlvUmVhZE9ubHkiLCJhZGRMaXN0ZW5lciIsImJ1bm5pZXNIYXZlVGFrZW5PdmVyVGhlV29ybGRFbWl0dGVyIiwiZWxlbWVudENyZWF0ZWRFbWl0dGVyIiwiYnVubnkiLCJpc0FsaXZlIiwiZGllZEVtaXR0ZXIiLCJsaXZlQnVubnlJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJwdXNoIiwicmVjZXNzaXZlTXV0YW50c0luZGV4IiwiZW1pdCIsImpvaXN0Iiwic2ltIiwiaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eSIsInZhbHVlIiwiZWxlbWVudERpc3Bvc2VkRW1pdHRlciIsImxpdmVJbmRleCIsInJlY2Vzc2l2ZUluZGV4IiwiZGVhZEluZGV4IiwiaW5jbHVkZXMiLCJkaXNwb3NlIiwicmVzZXQiLCJjbGVhciIsImFzc2VydFZhbGlkQ291bnRzIiwiY3JlYXRlQnVubnkiLCJvcHRpb25zIiwiY3JlYXRlTmV4dEVsZW1lbnQiLCJjcmVhdGVCdW5ueVplcm8iLCJwcm92aWRlZE9wdGlvbnMiLCJmYXRoZXIiLCJtb3RoZXIiLCJnZW5lcmF0aW9uIiwibW92ZUJ1bm5pZXMiLCJkdCIsImZvckVhY2giLCJtb3ZlIiwiYWdlQnVubmllcyIsIl8iLCJldmVyeSIsImRpZWRDb3VudCIsImxpdmVCdW5uaWVzQ29weSIsInNsaWNlIiwiYWdlIiwibmFtZSIsImRpZSIsIm1hdGVCdW5uaWVzIiwiaXNOb25OZWdhdGl2ZUludGVnZXIiLCJib3JuSW5kZXgiLCJidW5uaWVzIiwic2h1ZmZsZSIsIm51bWJlck9mUmVjZXNzaXZlTXV0YW50T2Zmc3ByaW5nIiwibWF0ZUVhZ2VybHkiLCJudW1iZXJUb0JlQm9ybiIsIk1hdGgiLCJmbG9vciIsIm11dGF0ZUZ1ciIsImZ1ckdlbmUiLCJtdXRhdGlvbkNvbWluZ1Byb3BlcnR5IiwibXV0YXRlRWFycyIsImVhcnNHZW5lIiwibXV0YXRlVGVldGgiLCJ0ZWV0aEdlbmUiLCJyZXNldE11dGF0aW9uQ29taW5nIiwiZnVySW5kaWNlcyIsImVhcnNJbmRpY2VzIiwidGVldGhJbmRpY2VzIiwibnVtYmVyVG9NdXRhdGUiLCJtYXgiLCJyb3VuZFN5bW1ldHJpYyIsIm11dGF0aW9uUGVyY2VudGFnZSIsImluZGljZXMiLCJpIiwiQXJyYXkiLCJpc0FycmF5IiwiZnVyUHVubmV0U3F1YXJlIiwiZ2Vub3R5cGUiLCJmdXJHZW5lUGFpciIsImVhcnNQdW5uZXRTcXVhcmUiLCJlYXJzR2VuZVBhaXIiLCJ0ZWV0aFB1bm5ldFNxdWFyZSIsInRlZXRoR2VuZVBhaXIiLCJqIiwiZ2Vub3R5cGVPcHRpb25zIiwiZmF0aGVyRnVyQWxsZWxlIiwiZ2V0Q2VsbCIsImZhdGhlckFsbGVsZSIsIm1vdGhlckZ1ckFsbGVsZSIsIm1vdGhlckFsbGVsZSIsImZhdGhlckVhcnNBbGxlbGUiLCJtb3RoZXJFYXJzQWxsZWxlIiwiZmF0aGVyVGVldGhBbGxlbGUiLCJtb3RoZXJUZWV0aEFsbGVsZSIsImlzT3JpZ2luYWxNdXRhbnQiLCJpc1JlY2Vzc2l2ZU11dGF0aW9uIiwibXV0YXRpb24iLCJtYXhQb3B1bGF0aW9uIiwibnVtYmVyT2ZSZWNlc3NpdmVNdXRhbnRzTWF0ZWQiLCJudW1iZXJCb3JuIiwicmVjZXNzaXZlTXV0YW50c0NvcHkiLCJmYXRoZXJJbmRleCIsIm11dGFudEZhdGhlciIsIm11dGFudE1vdGhlciIsImdldE1hdGVGb3JSZWNlc3NpdmVNdXRhbnQiLCJtdXRhbnRBbGxlbGUiLCJmdXJDZWxsIiwiZ2V0QWRkaXRpb25hbENlbGwiLCJkb21pbmFudEFsbGVsZVByb3BlcnR5IiwiZWFyc0NlbGwiLCJ0ZWV0aENlbGwiLCJtdXRhbnRGYXRoZXJJbmRleCIsIm11dGFudE1vdGhlckluZGV4IiwibXV0YW50TW90aGVyQ29weUluZGV4IiwibW92ZUJ1bm5pZXNUb0dyb3VuZCIsImludGVycnVwdEhvcCIsImdldFNlbGVjdGlvbkNhbmRpZGF0ZXMiLCJnZXRMaXZlQnVubnlDb3VudHMiLCJjb3VudHNQcm9wZXJ0eSIsImdldE51bWJlck9mTGl2ZUJ1bm5pZXMiLCJnZXROdW1iZXJPZkRlYWRCdW5uaWVzIiwiZ2V0TnVtYmVyT2ZSZWNlc3NpdmVNdXRhbnRzIiwicHJ1bmVEZWFkQnVubmllcyIsImlzUG9zaXRpdmVJbnRlZ2VyIiwibnVtYmVyUHJ1bmVkIiwiZGlzcG9zZUVsZW1lbnQiLCJpc0Rpc3Bvc2VkIiwibGl2ZSIsImRlYWQiLCJ0b3RhbCIsImJ1bm55R3JvdXBMZW5ndGgiLCJjb3VudCIsImhhc0FsbGVsZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQnVubnlDb2xsZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJ1bm55Q29sbGVjdGlvbiBpcyB0aGUgY29sbGVjdGlvbiBvZiBCdW5ueSBpbnN0YW5jZXMsIHdpdGggbWV0aG9kcyBmb3IgbWFuYWdpbmcgdGhhdCBjb2xsZWN0aW9uLlxyXG4gKiBJdCBlbmNhcHN1bGF0ZXMgQnVubnlHcm91cCAodGhlIFBoZXRpb0dyb3VwKSwgaGlkaW5nIGl0IGZyb20gdGhlIHJlc3Qgb2YgdGhlIHNpbS5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEVtaXR0ZXIgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9FbWl0dGVyLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgZG90UmFuZG9tIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9kb3RSYW5kb20uanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBTdHJpY3RPbWl0IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9TdHJpY3RPbWl0LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzIGZyb20gJy4uL05hdHVyYWxTZWxlY3Rpb25Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi9OYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJ1bm55IGZyb20gJy4vQnVubnkuanMnO1xyXG5pbXBvcnQgQnVubnlHcm91cCwgeyBCdW5ueUdyb3VwQ3JlYXRlRWxlbWVudE9wdGlvbnMgfSBmcm9tICcuL0J1bm55R3JvdXAuanMnO1xyXG5pbXBvcnQgY3JlYXRlQnVubnlBcnJheSwgeyBCdW5ueUFycmF5IH0gZnJvbSAnLi9jcmVhdGVCdW5ueUFycmF5LmpzJztcclxuaW1wb3J0IEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtIGZyb20gJy4vRW52aXJvbm1lbnRNb2RlbFZpZXdUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgR2VuZVBvb2wgZnJvbSAnLi9HZW5lUG9vbC5qcyc7XHJcbmltcG9ydCBQdW5uZXR0U3F1YXJlIGZyb20gJy4vUHVubmV0dFNxdWFyZS5qcyc7XHJcbmltcG9ydCBTZWxlY3RlZEJ1bm55UHJvcGVydHkgZnJvbSAnLi9TZWxlY3RlZEJ1bm55UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQnVubnlDb3VudHMgZnJvbSAnLi9CdW5ueUNvdW50cy5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uVXRpbHMgZnJvbSAnLi4vTmF0dXJhbFNlbGVjdGlvblV0aWxzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5cclxuY29uc3QgTElUVEVSX1NJWkUgPSA0O1xyXG5hc3NlcnQgJiYgYXNzZXJ0KCBMSVRURVJfU0laRSA9PT0gNCxcclxuICAnTElUVEVSX1NJWkUgbXVzdCBiZSA0LCB0byBjb3JyZXNwb25kIHRvIHRoZSBQdW5uZXR0IHNxdWFyZSB0aGF0IHJlc3VsdHMgZnJvbSBNZW5kZWxcXCdzIExhdyBvZiBTZWdyZWdhdGlvbicgKTtcclxuXHJcbi8vIFJhbmdlcyBmb3IgYnVubnkgcmVzdCB0aW1lLCBhcyBzcGVjaWZpZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xMjlcclxuLy8gQnVubmllcyByZXN0IGxvbmdlciBhcyB0aGUgcG9wdWxhdGlvbiBncm93cyBsYXJnZXIuXHJcbmNvbnN0IEJVTk5ZX1JFU1RfUkFOR0VfU0hPUlQgPSBuZXcgUmFuZ2UoIDEsIDMgKTtcclxuY29uc3QgQlVOTllfUkVTVF9SQU5HRV9NRURJVU0gPSBuZXcgUmFuZ2UoIDIsIDcgKTtcclxuY29uc3QgQlVOTllfUkVTVF9SQU5HRV9MT05HID0gbmV3IFJhbmdlKCA2LCAxMCApO1xyXG5cclxuLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGdlbmVyYXRpb25zIHRoYXQgYSBkZWFkIGJ1bm55IG5lZWRzIHRvIGV4aXN0IGJlZm9yZSBpdCBjYW4gYmUgZGlzcG9zZWQuXHJcbi8vIFRoaXMgaXMgYmFzZWQgb24gdGhlIFBlZGlncmVlIGdyYXBoIGRlcHRoLCBiZWNhdXNlIHRoZSBQZWRpZ3JlZSBncmFwaCBpcyB0aGUgb25seSBwbGFjZSB3aGVyZVxyXG4vLyBkZWFkIGJ1bm5pZXMgYXBwZWFyLiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xMTJcclxuY29uc3QgTUFYX0RFQURfQlVOTllfR0VORVJBVElPTlMgPSBOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLm1heEFnZSAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCBOYXR1cmFsU2VsZWN0aW9uQ29uc3RhbnRzLlBFRElHUkVFX1RSRUVfREVQVEggLSAxICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdW5ueUNvbGxlY3Rpb24ge1xyXG5cclxuICBwcml2YXRlIHJlYWRvbmx5IGJ1bm55R3JvdXA6IEJ1bm55R3JvdXA7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBnZW5lUG9vbDogR2VuZVBvb2w7XHJcblxyXG4gIC8vIHRoZSBsaXZlIGJ1bm5pZXMgaW4gYnVubnlHcm91cFxyXG4gIHB1YmxpYyByZWFkb25seSBsaXZlQnVubmllczogQnVubnlBcnJheTtcclxuXHJcbiAgLy8gdGhlIGRlYWQgYnVubmllcyBpbiBidW5ueUdyb3VwXHJcbiAgcHVibGljIHJlYWRvbmx5IGRlYWRCdW5uaWVzOiBCdW5ueUFycmF5O1xyXG5cclxuICAvLyBSZWNlc3NpdmUgbXV0YW50cywgdG8gYmUgbWF0ZWQgZWFnZXJseSBzbyB0aGF0IHRoZWlyIG11dGF0aW9uIGFwcGVhcnMgaW4gdGhlIHBoZW5vdHlwZSBhcyBzb29uIGFzIHBvc3NpYmxlLlxyXG4gIC8vIE11dGFudHMgYXJlIGFkZGVkIHRvIHRoaXMgYXJyYXkgd2hlbiBib3JuLCBhbmQgcmVtb3ZlZCBhcyBzb29uIGFzIHRoZXkgaGF2ZSBtYXRlZCB3aXRoIGFub3RoZXIgYnVubnkgdGhhdFxyXG4gIC8vIGhhcyB0aGUgc2FtZSBtdXRhbnQgYWxsZWxlLiBTZWUgYWxzbyB0aGUgJ1JlY2Vzc2l2ZSBNdXRhbnRzJyBzZWN0aW9uIG9mIG1vZGVsLm1kIGF0XHJcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2Jsb2IvbWFzdGVyL2RvYy9tb2RlbC5tZCNyZWNlc3NpdmUtbXV0YW50cy5cclxuICBwcml2YXRlIHJlYWRvbmx5IHJlY2Vzc2l2ZU11dGFudHM6IEJ1bm55QXJyYXk7XHJcblxyXG4gIC8vIFRoZSByYW5nZSBvZiB0aW1lIHRoYXQgYSBidW5ueSB3aWxsIHJlc2V0IGJldHdlZW4gaG9wcywgaW4gc2Vjb25kcy5cclxuICAvLyBUaGlzIHZhbHVlIGlzIGRlcml2ZWQgZnJvbSBwb3B1bGF0aW9uIHNpemUsIHNvIHRoYXQgYnVubmllcyByZXN0IGxvbmdlciB3aGVuIHRoZSBwb3B1bGF0aW9uIGlzIGxhcmdlcixcclxuICAvLyByZXN1bHRpbmcgaW4gbGVzcyBtb3Rpb24gb24gc2NyZWVuIGFuZCBmZXdlciB1cGRhdGVzLiBkaXNwb3NlIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgLy8gUmFuZ2UgdmFsdWVzIGFuZCBwb3B1bGF0aW9ucyBzaXplcyBhcmUgc3BlY2lmaWVkIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMTI5XHJcbiAgcHJpdmF0ZSByZWFkb25seSBidW5ueVJlc3RSYW5nZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxSYW5nZT47XHJcblxyXG4gIC8vIHRoZSBidW5ueSB0aGF0IGlzIHNlbGVjdGVkIGluIHRoZSBQZWRpZ3JlZSBncmFwaFxyXG4gIHB1YmxpYyByZWFkb25seSBzZWxlY3RlZEJ1bm55UHJvcGVydHk6IFNlbGVjdGVkQnVubnlQcm9wZXJ0eTtcclxuXHJcbiAgLy8gTm90aWZpZXMgbGlzdGVuZXJzIHdoZW4gYWxsIGJ1bm5pZXMgaGF2ZSBkaWVkLiBkaXNwb3NlIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgcHVibGljIHJlYWRvbmx5IGFsbEJ1bm5pZXNIYXZlRGllZEVtaXR0ZXI6IEVtaXR0ZXI7XHJcblxyXG4gIC8vIE5vdGlmaWVzIGxpc3RlbmVycyB3aGVuIGJ1bm5pZXMgaGF2ZSB0YWtlbiBvdmVyIHRoZSB3b3JsZC4gZGlzcG9zZSBpcyBub3QgbmVjZXNzYXJ5LlxyXG4gIHB1YmxpYyByZWFkb25seSBidW5uaWVzSGF2ZVRha2VuT3ZlclRoZVdvcmxkRW1pdHRlcjogRW1pdHRlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbFZpZXdUcmFuc2Zvcm06IEVudmlyb25tZW50TW9kZWxWaWV3VHJhbnNmb3JtLCBnZW5lUG9vbDogR2VuZVBvb2wsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHRoaXMubGl2ZUJ1bm5pZXMgPSBjcmVhdGVCdW5ueUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xpdmVCdW5uaWVzJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5kZWFkQnVubmllcyA9IGNyZWF0ZUJ1bm55QXJyYXkoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZGVhZEJ1bm5pZXMnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnJlY2Vzc2l2ZU11dGFudHMgPSBjcmVhdGVCdW5ueUFycmF5KCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlY2Vzc2l2ZU11dGFudHMnICksXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdmb3IgaW50ZXJuYWwgUGhFVCB1c2Ugb25seSdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJ1bm55UmVzdFJhbmdlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIHRoaXMubGl2ZUJ1bm5pZXMubGVuZ3RoUHJvcGVydHkgXSxcclxuICAgICAgbGVuZ3RoID0+IHtcclxuICAgICAgICBpZiAoIGxlbmd0aCA8IDEwICkge1xyXG4gICAgICAgICAgcmV0dXJuIEJVTk5ZX1JFU1RfUkFOR0VfU0hPUlQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBsZW5ndGggPCAyNTAgKSB7XHJcbiAgICAgICAgICByZXR1cm4gQlVOTllfUkVTVF9SQU5HRV9NRURJVU07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIEJVTk5ZX1JFU1RfUkFOR0VfTE9ORztcclxuICAgICAgICB9XHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdidW5ueVJlc3RSYW5nZVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogUmFuZ2UuUmFuZ2VJTyxcclxuICAgICAgICBwaGV0aW9Eb2N1bWVudGF0aW9uOiAnZm9yIGludGVybmFsIFBoRVQgdXNlIG9ubHknXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyB0aGUgUGhldGlvR3JvdXAgdGhhdCBtYW5hZ2VzIEJ1bm55IGluc3RhbmNlcyBhcyBkeW5hbWljIFBoRVQtaU8gZWxlbWVudHNcclxuICAgIGNvbnN0IGJ1bm55R3JvdXAgPSBuZXcgQnVubnlHcm91cCggZ2VuZVBvb2wsIG1vZGVsVmlld1RyYW5zZm9ybSwgdGhpcy5idW5ueVJlc3RSYW5nZVByb3BlcnR5LCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1bm55R3JvdXAnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNlbGVjdGVkQnVubnlQcm9wZXJ0eSA9IG5ldyBTZWxlY3RlZEJ1bm55UHJvcGVydHkoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnc2VsZWN0ZWRCdW5ueVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdW5saW5rIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICBwaGV0LmxvZyAmJiB0aGlzLnNlbGVjdGVkQnVubnlQcm9wZXJ0eS5saW5rKCBzZWxlY3RlZEJ1bm55ID0+IHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGBzZWxlY3RlZEJ1bm55PSR7c2VsZWN0ZWRCdW5ueX1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hbGxCdW5uaWVzSGF2ZURpZWRFbWl0dGVyID0gbmV3IEVtaXR0ZXIoIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWxsQnVubmllc0hhdmVEaWVkRW1pdHRlcicgKSxcclxuICAgICAgcGhldGlvUmVhZE9ubHk6IHRydWUsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdmaXJlcyB3aGVuIGFsbCBvZiB0aGUgYnVubmllcyBoYXZlIGRpZWQnXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gcmVtb3ZlTGlzdGVuZXIgaXMgbm90IG5lY2Vzc2FyeVxyXG4gICAgcGhldC5sb2cgJiYgdGhpcy5hbGxCdW5uaWVzSGF2ZURpZWRFbWl0dGVyLmFkZExpc3RlbmVyKCAoKSA9PiB7XHJcbiAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCAnQWxsIG9mIHRoZSBidW5uaWVzIGhhdmUgZGllZC4nICk7XHJcbiAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgdG90YWwgbGl2ZSBidW5uaWVzID0gJHt0aGlzLmxpdmVCdW5uaWVzLmxlbmd0aH1gICk7XHJcbiAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgdG90YWwgZGVhZCBidW5uaWVzID0gJHt0aGlzLmRlYWRCdW5uaWVzLmxlbmd0aH1gICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5idW5uaWVzSGF2ZVRha2VuT3ZlclRoZVdvcmxkRW1pdHRlciA9IG5ldyBFbWl0dGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2J1bm5pZXNIYXZlVGFrZW5PdmVyVGhlV29ybGRFbWl0dGVyJyApLFxyXG4gICAgICBwaGV0aW9SZWFkT25seTogdHJ1ZSxcclxuICAgICAgcGhldGlvRG9jdW1lbnRhdGlvbjogJ2ZpcmVzIHdoZW4gYnVubmllcyBoYXZlIHRha2VuIG92ZXIgdGhlIHdvcmxkJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHJlbW92ZUxpc3RlbmVyIGlzIG5vdCBuZWNlc3NhcnlcclxuICAgIHBoZXQubG9nICYmIHRoaXMuYnVubmllc0hhdmVUYWtlbk92ZXJUaGVXb3JsZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coICdCdW5uaWVzIGhhdmUgdGFrZW4gb3ZlciB0aGUgd29ybGQuJyApO1xyXG4gICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYHRvdGFsIGxpdmUgYnVubmllcyA9ICR7dGhpcy5saXZlQnVubmllcy5sZW5ndGh9YCApO1xyXG4gICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYHRvdGFsIGRlYWQgYnVubmllcyA9ICR7dGhpcy5kZWFkQnVubmllcy5sZW5ndGh9YCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoaXMgbGlzdGVuZXIgaXMgY2FsbGVkIHdoZW4gYSBidW5ueSBpcyBjcmVhdGVkIGR1cmluZyBub3JtYWwgcnVubmluZyBvZiB0aGUgc2ltLCBvciByZXN0b3JlZCB2aWEgUGhFVC1pTy5cclxuICAgIC8vIHJlbW92ZUxpc3RlbmVyIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICBidW5ueUdyb3VwLmVsZW1lbnRDcmVhdGVkRW1pdHRlci5hZGRMaXN0ZW5lciggYnVubnkgPT4ge1xyXG5cclxuICAgICAgaWYgKCBidW5ueS5pc0FsaXZlICkge1xyXG5cclxuICAgICAgICAvLyBXaGVuIHRoZSBidW5ueSBkaWVzLCBjbGVhbiB1cC5cclxuICAgICAgICAvLyByZW1vdmVMaXN0ZW5lciBpcyBub3QgbmVjZXNzYXJ5IGJlY2F1c2UgQnVubnkuZGllZEVtaXR0ZXIgaXMgZGlzcG9zZWQgd2hlbiB0aGUgYnVubnkgZGllcyBvciBpcyBkaXNwb3NlZC5cclxuICAgICAgICBidW5ueS5kaWVkRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG5cclxuICAgICAgICAgIGNvbnN0IGxpdmVCdW5ueUluZGV4ID0gdGhpcy5saXZlQnVubmllcy5pbmRleE9mKCBidW5ueSApO1xyXG4gICAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbGl2ZUJ1bm55SW5kZXggIT09IC0xLCAnZXhwZWN0ZWQgYnVubnkgdG8gYmUgaW4gbGl2ZUJ1bm5pZXMnICk7XHJcbiAgICAgICAgICB0aGlzLmxpdmVCdW5uaWVzLnNwbGljZSggbGl2ZUJ1bm55SW5kZXgsIDEgKTtcclxuXHJcbiAgICAgICAgICB0aGlzLmRlYWRCdW5uaWVzLnB1c2goIGJ1bm55ICk7XHJcblxyXG4gICAgICAgICAgY29uc3QgcmVjZXNzaXZlTXV0YW50c0luZGV4ID0gdGhpcy5yZWNlc3NpdmVNdXRhbnRzLmluZGV4T2YoIGJ1bm55ICk7XHJcbiAgICAgICAgICBpZiAoIHJlY2Vzc2l2ZU11dGFudHNJbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVjZXNzaXZlTXV0YW50cy5zcGxpY2UoIHJlY2Vzc2l2ZU11dGFudHNJbmRleCwgMSApO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmICggdGhpcy5saXZlQnVubmllcy5sZW5ndGggPT09IDAgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWxsQnVubmllc0hhdmVEaWVkRW1pdHRlci5lbWl0KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG5cclxuICAgICAgICB0aGlzLmxpdmVCdW5uaWVzLnB1c2goIGJ1bm55ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggcGhldC5qb2lzdC5zaW0uaXNTZXR0aW5nUGhldGlvU3RhdGVQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgICdhIGRlYWQgYnVubnkgc2hvdWxkIG9ubHkgYmUgY3JlYXRlZCB3aGVuIHJlc3RvcmluZyBQaEVULWlPIHN0YXRlJyApO1xyXG4gICAgICAgIHRoaXMuZGVhZEJ1bm5pZXMucHVzaCggYnVubnkgKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gYSBidW5ueSBpcyBkaXNwb3NlZCwgcmVtb3ZlIGl0IGZyb20gdGhlIGFwcHJvcHJpYXRlIGFycmF5cy4gcmVtb3ZlTGlzdGVuZXIgaXMgbm90IG5lY2Vzc2FyeS5cclxuICAgIGJ1bm55R3JvdXAuZWxlbWVudERpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggYnVubnkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgbGl2ZUluZGV4ID0gdGhpcy5saXZlQnVubmllcy5pbmRleE9mKCBidW5ueSApO1xyXG4gICAgICBpZiAoIGxpdmVJbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgICAgdGhpcy5saXZlQnVubmllcy5zcGxpY2UoIGxpdmVJbmRleCwgMSApO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgYnVubnkgd2FzIGluIGxpdmVCdW5uaWVzLCBpdCBtaWdodCBhbHNvIGJlIGluIHJlY2Vzc2l2ZU11dGFudHMuXHJcbiAgICAgICAgY29uc3QgcmVjZXNzaXZlSW5kZXggPSB0aGlzLnJlY2Vzc2l2ZU11dGFudHMuaW5kZXhPZiggYnVubnkgKTtcclxuICAgICAgICAoIHJlY2Vzc2l2ZUluZGV4ICE9PSAtMSApICYmIHRoaXMucmVjZXNzaXZlTXV0YW50cy5zcGxpY2UoIHJlY2Vzc2l2ZUluZGV4LCAxICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBidW5ueSB3YXMgbm90IGluIGxpdmVCdW5uaWVzLCBpdCBtaWdodCBiZSBpbiBkZWFkQnVubmllcy5cclxuICAgICAgICBjb25zdCBkZWFkSW5kZXggPSB0aGlzLmRlYWRCdW5uaWVzLmluZGV4T2YoIGJ1bm55ICk7XHJcbiAgICAgICAgKCBkZWFkSW5kZXggIT09IC0xICkgJiYgdGhpcy5kZWFkQnVubmllcy5zcGxpY2UoIGRlYWRJbmRleCwgMSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBWZXJpZnkgdGhhdCB3ZSBkb24ndCBoYXZlIGEgbG9naWMgZXJyb3IgdGhhdCByZXN1bHRzIGluIHJldGFpbmluZyBhIHJlZmVyZW5jZSB0byBidW5ueS5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMubGl2ZUJ1bm5pZXMuaW5jbHVkZXMoIGJ1bm55ICksICdidW5ueSBpcyBzdGlsbCBpbiBsaXZlQnVubmllcycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMuZGVhZEJ1bm5pZXMuaW5jbHVkZXMoIGJ1bm55ICksICdidW5ueSBpcyBzdGlsbCBpbiBkZWFkQnVubmllcycgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIXRoaXMucmVjZXNzaXZlTXV0YW50cy5pbmNsdWRlcyggYnVubnkgKSwgJ2J1bm55IGlzIHN0aWxsIGluIHJlY2Vzc2l2ZU11dGFudHMnICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5nZW5lUG9vbCA9IGdlbmVQb29sO1xyXG4gICAgdGhpcy5idW5ueUdyb3VwID0gYnVubnlHcm91cDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmJ1bm55R3JvdXAuY2xlYXIoKTsgLy8gY2FsbHMgZGlzcG9zZSBmb3IgYWxsIEJ1bm55IGluc3RhbmNlc1xyXG4gICAgdGhpcy5zZWxlY3RlZEJ1bm55UHJvcGVydHkucmVzZXQoKTtcclxuICAgIGFzc2VydCAmJiB0aGlzLmFzc2VydFZhbGlkQ291bnRzKCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgQnVubnkuXHJcbiAgICovXHJcbiAgcHVibGljIGNyZWF0ZUJ1bm55KCBvcHRpb25zOiBCdW5ueUdyb3VwQ3JlYXRlRWxlbWVudE9wdGlvbnMgKTogQnVubnkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVubnlHcm91cC5jcmVhdGVOZXh0RWxlbWVudCggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGdlbmVyYXRpb24temVybyBCdW5ueSwgd2hpY2ggaGFzIG5vIHBhcmVudHMgc2luY2UgaXQncyB0aGUgZmlyc3QgZ2VuZXJhdGlvbiB0byBleGlzdC5cclxuICAgKi9cclxuICBwdWJsaWMgY3JlYXRlQnVubnlaZXJvKCBwcm92aWRlZE9wdGlvbnM/OiBTdHJpY3RPbWl0PEJ1bm55R3JvdXBDcmVhdGVFbGVtZW50T3B0aW9ucywgJ2ZhdGhlcicgfCAnbW90aGVyJyB8ICdnZW5lcmF0aW9uJz4gKTogQnVubnkge1xyXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlQnVubnkoIGNvbWJpbmVPcHRpb25zPEJ1bm55R3JvdXBDcmVhdGVFbGVtZW50T3B0aW9ucz4oIHtcclxuICAgICAgZmF0aGVyOiBudWxsLFxyXG4gICAgICBtb3RoZXI6IG51bGwsXHJcbiAgICAgIGdlbmVyYXRpb246IDBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNb3ZlcyBhbGwgbGl2ZSBidW5uaWVzLlxyXG4gICAqIEBwYXJhbSBkdCAtIHRpbWUgc3RlcCwgaW4gc2Vjb25kc1xyXG4gICAqL1xyXG4gIHB1YmxpYyBtb3ZlQnVubmllcyggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGR0ID49IDAsIGBpbnZhbGlkIGR0OiAke2R0fWAgKTtcclxuICAgIHRoaXMubGl2ZUJ1bm5pZXMuZm9yRWFjaCggYnVubnkgPT4gYnVubnkubW92ZSggZHQgKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWdlcyBhbGwgbGl2ZSBidW5uaWVzLiBCdW5uaWVzIHRoYXQgcmVhY2ggdGhlIG1heGltdW0gYWdlIHdpbGwgZGllLiBTZWUgYWxzbyB0aGUgJ0xpZmUgRXhwZWN0YW5jeScgc2VjdGlvbiBvZlxyXG4gICAqIG1vZGVsLm1kIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9ibG9iL21hc3Rlci9kb2MvbW9kZWwubWQjbGlmZS1leHBlY3RhbmN5LlxyXG4gICAqL1xyXG4gIHB1YmxpYyBhZ2VCdW5uaWVzKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdGhpcy5saXZlQnVubmllcywgYnVubnkgPT4gYnVubnkuaXNBbGl2ZSApLFxyXG4gICAgICAnbGl2ZUJ1bm5pZXMgY29udGFpbnMgb25lIG9yIG1vcmUgZGVhZCBidW5uaWVzJyApO1xyXG5cclxuICAgIGxldCBkaWVkQ291bnQgPSAwO1xyXG5cclxuICAgIC8vIGxpdmVCdW5uaWVzIHdpbGwgY2hhbmdlIGlmIGFueSBidW5uaWVzIGRpZSwgc28gb3BlcmF0ZSBvbiBhIGNvcHlcclxuICAgIGNvbnN0IGxpdmVCdW5uaWVzQ29weSA9IHRoaXMubGl2ZUJ1bm5pZXMuc2xpY2UoKTtcclxuICAgIGxpdmVCdW5uaWVzQ29weS5mb3JFYWNoKCBidW5ueSA9PiB7XHJcblxyXG4gICAgICAvLyBidW5ueSBpcyBvbmUgZ2VuZXJhdGlvbiBvbGRlclxyXG4gICAgICBidW5ueS5hZ2UrKztcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYnVubnkuYWdlIDw9IE5hdHVyYWxTZWxlY3Rpb25RdWVyeVBhcmFtZXRlcnMubWF4QWdlLFxyXG4gICAgICAgIGAke2J1bm55LnRhbmRlbS5uYW1lfSBhZ2U9JHtidW5ueS5hZ2V9IGV4Y2VlZHMgbWF4QWdlPSR7TmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycy5tYXhBZ2V9YCApO1xyXG5cclxuICAgICAgLy8gYnVubnkgZGllcyBpZiBpdCBleGNlZWRzIHRoZSBtYXhpbXVtIGFnZVxyXG4gICAgICBpZiAoIGJ1bm55LmFnZSA9PT0gTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycy5tYXhBZ2UgKSB7XHJcbiAgICAgICAgYnVubnkuZGllKCk7XHJcbiAgICAgICAgZGllZENvdW50Kys7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgdGhpcy5hc3NlcnRWYWxpZENvdW50cygpO1xyXG4gICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGAke2RpZWRDb3VudH0gYnVubmllcyBkaWVkIG9mIG9sZCBhZ2VgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBNYXRlcyBhbGwgbGl2ZSBidW5uaWVzIGJ5IHJhbmRvbWx5IHBhaXJpbmcgdGhlbSB1cC4gQW55IGJ1bm55IGNhbiBtYXRlIHdpdGggYW55IG90aGVyIGJ1bm55LCByZWdhcmRsZXNzIG9mIHRoZWlyXHJcbiAgICogYWdlIG9yIHByZXZpb3VzIGhlcmVkaXRhcnkgcmVsYXRpb25zaGlwLiBJZiB0aGVyZSBpcyBhbiBvZGQgbnVtYmVyIG9mIGJ1bm5pZXMsIHRoZW4gb25lIG9mIHRoZW0gd2lsbCBub3QgbWF0ZS5cclxuICAgKiBNdXRhdGlvbnMgKGlmIGFueSkgYXJlIGFwcGxpZWQgYXMgdGhlIGJ1bm5pZXMgYXJlIGJvcm4uIFNlZSBhbHNvIHRoZSAnUmVwcm9kdWN0aW9uJyBzZWN0aW9uIG9mIG1vZGVsLm1kIGF0XHJcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2Jsb2IvbWFzdGVyL2RvYy9tb2RlbC5tZCNyZXByb2R1Y3Rpb24uXHJcbiAgICovXHJcbiAgcHVibGljIG1hdGVCdW5uaWVzKCBnZW5lcmF0aW9uOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOYXR1cmFsU2VsZWN0aW9uVXRpbHMuaXNOb25OZWdhdGl2ZUludGVnZXIoIGdlbmVyYXRpb24gKSwgJ2ludmFsaWQgZ2VuZXJhdGlvbicgKTtcclxuXHJcbiAgICAvLyBUaGUgbnVtYmVyIG9mIGJ1bm5pZXMgYm9ybi5cclxuICAgIGxldCBib3JuSW5kZXggPSAwO1xyXG5cclxuICAgIC8vIFNodWZmbGUgdGhlIGNvbGxlY3Rpb24gb2YgbGl2ZSBidW5uaWVzIHNvIHRoYXQgbWF0aW5nIGlzIHJhbmRvbS4gc2h1ZmZsZSByZXR1cm5zIGEgbmV3IGFycmF5LlxyXG4gICAgY29uc3QgYnVubmllcyA9IGRvdFJhbmRvbS5zaHVmZmxlKCB0aGlzLmxpdmVCdW5uaWVzICk7XHJcbiAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYG1hdGluZyAke2J1bm5pZXMubGVuZ3RofSBidW5uaWVzYCApO1xyXG5cclxuICAgIC8vIFByaW9yaXRpemUgbWF0aW5nIG9mIGJ1bm5pZXMgdGhhdCBoYXZlIGEgcmVjZXNzaXZlIG11dGF0aW9uLCBzbyB0aGF0IHRoZSBtdXRhdGlvbiBhcHBlYXJzIGluIHRoZSBwaGVub3R5cGVcclxuICAgIC8vIGFzIHNvb24gYXMgcG9zc2libGUuIFRoaXMgaXMgcmVmZXJyZWQgdG8gYXMgJ21hdGluZyBlYWdlcmx5Jy5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzk4LlxyXG4gICAgbGV0IG51bWJlck9mUmVjZXNzaXZlTXV0YW50T2Zmc3ByaW5nID0gMDtcclxuICAgIGlmICggdGhpcy5yZWNlc3NpdmVNdXRhbnRzLmxlbmd0aCA+IDAgKSB7XHJcbiAgICAgIG51bWJlck9mUmVjZXNzaXZlTXV0YW50T2Zmc3ByaW5nID0gdGhpcy5tYXRlRWFnZXJseSggZ2VuZXJhdGlvbiwgYnVubmllcyApO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZSBudW1iZXIgb2YgYnVubmllcyB0aGF0IHdlIGV4cGVjdCB0byBiZSBib3JuLlxyXG4gICAgY29uc3QgbnVtYmVyVG9CZUJvcm4gPSBNYXRoLmZsb29yKCBidW5uaWVzLmxlbmd0aCAvIDIgKSAqIExJVFRFUl9TSVpFO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGljaCBtdXRhdGlvbnMgc2hvdWxkIGJlIGFwcGxpZWQsIHRoZW4gcmVzZXQgdGhlIGdlbmUgcG9vbC5cclxuICAgIGNvbnN0IG11dGF0ZUZ1ciA9IHRoaXMuZ2VuZVBvb2wuZnVyR2VuZS5tdXRhdGlvbkNvbWluZ1Byb3BlcnR5LnZhbHVlO1xyXG4gICAgY29uc3QgbXV0YXRlRWFycyA9IHRoaXMuZ2VuZVBvb2wuZWFyc0dlbmUubXV0YXRpb25Db21pbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IG11dGF0ZVRlZXRoID0gdGhpcy5nZW5lUG9vbC50ZWV0aEdlbmUubXV0YXRpb25Db21pbmdQcm9wZXJ0eS52YWx1ZTtcclxuICAgIHRoaXMuZ2VuZVBvb2wucmVzZXRNdXRhdGlvbkNvbWluZygpO1xyXG5cclxuICAgIC8vIEluZGljZXMgKHZhbHVlcyBvZiBib3JuSW5kZXgpIGZvciB0aGUgbmV3IGJ1bm5pZXMgdGhhdCB3aWxsIGJlIG11dGF0ZWQuXHJcbiAgICAvLyBNdXRhdGlvbnMgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZSwgYXMgYXJlIHRoZSB2YWx1ZXMgaW4gdGhlc2UgYXJyYXlzLlxyXG4gICAgbGV0IGZ1ckluZGljZXMgPSBbXTtcclxuICAgIGxldCBlYXJzSW5kaWNlcyA9IFtdO1xyXG4gICAgbGV0IHRlZXRoSW5kaWNlcyA9IFtdO1xyXG5cclxuICAgIC8vIElmIGEgbXV0YXRpb24gaXMgdG8gYmUgYXBwbGllZC4uLlxyXG4gICAgaWYgKCBtdXRhdGVGdXIgfHwgbXV0YXRlRWFycyB8fCBtdXRhdGVUZWV0aCApIHtcclxuXHJcbiAgICAgIC8vIFdoZW4gYSBtdXRhdGlvbiBpcyBhcHBsaWVkLCB0aGlzIGlzIHRoZSBudW1iZXIgb2YgYnVubmllcyB0aGF0IHdpbGwgcmVjZWl2ZSB0aGF0IG11dGF0aW9uLlxyXG4gICAgICBjb25zdCBudW1iZXJUb011dGF0ZSA9IE1hdGgubWF4KCAxLCBVdGlscy5yb3VuZFN5bW1ldHJpYyggTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycy5tdXRhdGlvblBlcmNlbnRhZ2UgKiBudW1iZXJUb0JlQm9ybiApICk7XHJcblxyXG4gICAgICAvLyBDcmVhdGUgaW5kaWNlcyBvZiB0aGUgbmV3IGJ1bm5pZXMsIGZvciB0aGUgcHVycG9zZSBvZiBhcHBseWluZyBtdXRhdGlvbnMuXHJcbiAgICAgIGxldCBpbmRpY2VzID0gW107XHJcbiAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8IG51bWJlclRvQmVCb3JuOyBpKysgKSB7XHJcbiAgICAgICAgaW5kaWNlcy5wdXNoKCBpICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJhbmRvbWx5IHNodWZmbGUgdGhlIGluZGljZXMsIHNvIHRoYXQgd2UgY2FuIGp1c3QgdGFrZSBob3cgbWFueSB3ZSBuZWVkIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXkuXHJcbiAgICAgIGluZGljZXMgPSBkb3RSYW5kb20uc2h1ZmZsZSggaW5kaWNlcyApO1xyXG5cclxuICAgICAgLy8gU2VsZWN0IGluZGljZXMgZm9yIGVhY2ggbXV0YXRpb24gdGhhdCB3aWxsIGJlIGFwcGxpZWQgYnkgdGFraW5nIGluZGljZXMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBhcnJheS5cclxuICAgICAgaWYgKCBtdXRhdGVGdXIgKSB7XHJcbiAgICAgICAgZnVySW5kaWNlcyA9IGluZGljZXMuc3BsaWNlKCAwLCBudW1iZXJUb011dGF0ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbXV0YXRlRWFycyApIHtcclxuICAgICAgICBlYXJzSW5kaWNlcyA9IGluZGljZXMuc3BsaWNlKCAwLCBudW1iZXJUb011dGF0ZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbXV0YXRlVGVldGggKSB7XHJcbiAgICAgICAgdGVldGhJbmRpY2VzID0gaW5kaWNlcy5zcGxpY2UoIDAsIG51bWJlclRvTXV0YXRlICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIEFycmF5LmlzQXJyYXkoIGZ1ckluZGljZXMgKSwgJ2V4cGVjdGVkIGFuIGFycmF5JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggZWFyc0luZGljZXMgKSwgJ2V4cGVjdGVkIGFuIGFycmF5JyApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggQXJyYXkuaXNBcnJheSggdGVldGhJbmRpY2VzICksICdleHBlY3RlZCBhbiBhcnJheScgKTtcclxuXHJcbiAgICAvLyBNYXRlIHBhaXJzIGZyb20gdGhlIGNvbGxlY3Rpb24sIGFwcGx5aW5nIG11dGF0aW9ucyB3aGVyZSBhcHByb3ByaWF0ZS5cclxuICAgIGZvciAoIGxldCBpID0gMTsgaSA8IGJ1bm5pZXMubGVuZ3RoOyBpID0gaSArIDIgKSB7XHJcblxyXG4gICAgICAvLyBNYXRlIGFkamFjZW50IGJ1bm5pZXMuIEluIHRoaXMgc2ltLCBidW5uaWVzIGFyZSBzZXhsZXNzLCBzbyB0aGVpciBzZXggaXMgaXJyZWxldmFudC5cclxuICAgICAgY29uc3QgZmF0aGVyID0gYnVubmllc1sgaSBdO1xyXG4gICAgICBjb25zdCBtb3RoZXIgPSBidW5uaWVzWyBpIC0gMSBdO1xyXG5cclxuICAgICAgLy8gR2V0IHRoZSBQdW5uZXR0IHNxdWFyZSAoZ2VuZXRpYyBjcm9zcykgZm9yIGVhY2ggZ2VuZS4gVGhlIG9yZGVyIG9mIGVhY2ggY3Jvc3MgaXMgcmFuZG9tLlxyXG4gICAgICBjb25zdCBmdXJQdW5uZXRTcXVhcmUgPSBuZXcgUHVubmV0dFNxdWFyZSggZmF0aGVyLmdlbm90eXBlLmZ1ckdlbmVQYWlyLCBtb3RoZXIuZ2Vub3R5cGUuZnVyR2VuZVBhaXIgKTtcclxuICAgICAgY29uc3QgZWFyc1B1bm5ldFNxdWFyZSA9IG5ldyBQdW5uZXR0U3F1YXJlKCBmYXRoZXIuZ2Vub3R5cGUuZWFyc0dlbmVQYWlyLCBtb3RoZXIuZ2Vub3R5cGUuZWFyc0dlbmVQYWlyICk7XHJcbiAgICAgIGNvbnN0IHRlZXRoUHVubmV0U3F1YXJlID0gbmV3IFB1bm5ldHRTcXVhcmUoIGZhdGhlci5nZW5vdHlwZS50ZWV0aEdlbmVQYWlyLCBtb3RoZXIuZ2Vub3R5cGUudGVldGhHZW5lUGFpciApO1xyXG5cclxuICAgICAgLy8gQ3JlYXRlIGEgbGl0dGVyIGZvciB0aGlzIGJ1bm55IHBhaXJcclxuICAgICAgZm9yICggbGV0IGogPSAwOyBqIDwgTElUVEVSX1NJWkU7IGorKyApIHtcclxuXHJcbiAgICAgICAgLy8gQSBidW5ueSBpcyBib3JuXHJcbiAgICAgICAgY29uc3QgYnVubnkgPSB0aGlzLmNyZWF0ZUJ1bm55KCB7XHJcbiAgICAgICAgICBmYXRoZXI6IGZhdGhlcixcclxuICAgICAgICAgIG1vdGhlcjogbW90aGVyLFxyXG4gICAgICAgICAgZ2VuZXJhdGlvbjogZ2VuZXJhdGlvbixcclxuICAgICAgICAgIGdlbm90eXBlT3B0aW9uczoge1xyXG5cclxuICAgICAgICAgICAgLy8gaW5oZXJpdGVkIGFsbGVsZXNcclxuICAgICAgICAgICAgZmF0aGVyRnVyQWxsZWxlOiBmdXJQdW5uZXRTcXVhcmUuZ2V0Q2VsbCggaiApLmZhdGhlckFsbGVsZSxcclxuICAgICAgICAgICAgbW90aGVyRnVyQWxsZWxlOiBmdXJQdW5uZXRTcXVhcmUuZ2V0Q2VsbCggaiApLm1vdGhlckFsbGVsZSxcclxuICAgICAgICAgICAgZmF0aGVyRWFyc0FsbGVsZTogZWFyc1B1bm5ldFNxdWFyZS5nZXRDZWxsKCBqICkuZmF0aGVyQWxsZWxlLFxyXG4gICAgICAgICAgICBtb3RoZXJFYXJzQWxsZWxlOiBlYXJzUHVubmV0U3F1YXJlLmdldENlbGwoIGogKS5tb3RoZXJBbGxlbGUsXHJcbiAgICAgICAgICAgIGZhdGhlclRlZXRoQWxsZWxlOiB0ZWV0aFB1bm5ldFNxdWFyZS5nZXRDZWxsKCBqICkuZmF0aGVyQWxsZWxlLFxyXG4gICAgICAgICAgICBtb3RoZXJUZWV0aEFsbGVsZTogdGVldGhQdW5uZXRTcXVhcmUuZ2V0Q2VsbCggaiApLm1vdGhlckFsbGVsZSxcclxuXHJcbiAgICAgICAgICAgIC8vIG11dGF0aW9uc1xyXG4gICAgICAgICAgICBtdXRhdGVGdXI6IGZ1ckluZGljZXMuaW5jbHVkZXMoIGJvcm5JbmRleCApLFxyXG4gICAgICAgICAgICBtdXRhdGVFYXJzOiBlYXJzSW5kaWNlcy5pbmNsdWRlcyggYm9ybkluZGV4ICksXHJcbiAgICAgICAgICAgIG11dGF0ZVRlZXRoOiB0ZWV0aEluZGljZXMuaW5jbHVkZXMoIGJvcm5JbmRleCApXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIGJvcm5JbmRleCsrO1xyXG5cclxuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHJlY2Vzc2l2ZSBtdXRhbnRzLCB0byBiZSAnbWF0ZWQgZWFnZXJseScgd2hlbiBhbm90aGVyIGJ1bm55IHdpdGggdGhlIG11dGF0aW9uIGV4aXN0cy5cclxuICAgICAgICBpZiAoIGJ1bm55LmlzT3JpZ2luYWxNdXRhbnQoKSAmJiB0aGlzLmdlbmVQb29sLmlzUmVjZXNzaXZlTXV0YXRpb24oIGJ1bm55Lmdlbm90eXBlLm11dGF0aW9uICkgKSB7XHJcbiAgICAgICAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYGFkZGluZyB0byByZWNlc3NpdmVNdXRhbnRzOiAke2J1bm55fWAgKTtcclxuICAgICAgICAgIHRoaXMucmVjZXNzaXZlTXV0YW50cy5wdXNoKCBidW5ueSApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzc2VydCAmJiB0aGlzLmFzc2VydFZhbGlkQ291bnRzKCk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBib3JuSW5kZXggPT09IG51bWJlclRvQmVCb3JuLCAndW5leHBlY3RlZCBudW1iZXIgb2YgYnVubmllcyB3ZXJlIGJvcm4nICk7XHJcbiAgICBwaGV0LmxvZyAmJiBwaGV0LmxvZyggYCR7bnVtYmVyVG9CZUJvcm4gKyBudW1iZXJPZlJlY2Vzc2l2ZU11dGFudE9mZnNwcmluZ30gYnVubmllcyB3ZXJlIGJvcm5gICk7XHJcblxyXG4gICAgLy8gTm90aWZ5IGlmIGJ1bm5pZXMgaGF2ZSB0YWtlbiBvdmVyIHRoZSB3b3JsZC5cclxuICAgIGlmICggdGhpcy5saXZlQnVubmllcy5sZW5ndGhQcm9wZXJ0eS52YWx1ZSA+PSBOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLm1heFBvcHVsYXRpb24gKSB7XHJcbiAgICAgIHRoaXMuYnVubmllc0hhdmVUYWtlbk92ZXJUaGVXb3JsZEVtaXR0ZXIuZW1pdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTWF0ZXMgZWFjaCByZWNlc3NpdmUgbXV0YW50IHdpdGggYSBidW5ueSB0aGF0IGhhcyB0aGUgc2FtZSBtdXRhdGlvbi4gVGhpcyBpcyByZWZlcnJlZCB0byBhcyAnbWF0ZSBlYWdlcmx5JywgYXNcclxuICAgKiB0aGUgcHVycG9zZSBpcyB0byBtYWtlIHRoZSBtdXRhdGlvbiBhcHBlYXIgaW4gdGhlIHBoZW5vdHlwZSBzb29uZXIuIFRoaXMgbXVzdCBiZSBkb25lIHNlcGFyYXRlbHkgZnJvbSBvdGhlciBtYXRpbmdcclxuICAgKiBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG8gYXBwbHkgYWRkaXRpb25hbCBtdXRhdGlvbnMuIEFzIGEgc2lkZS1lZmZlY3QsIGJ1bm5pZXMgdGhhdCBhcmUgc3VjY2Vzc2Z1bGx5IG1hdGVkIGFyZVxyXG4gICAqIHJlbW92ZWQgZnJvbSB0aGUgYnVubmllcyBhcnJheS4gU2VlIGFsc28gdGhlICdSZWNlc3NpdmUgTXV0YW50cycgc2VjdGlvbiBvZiBtb2RlbC5tZCBhdFxyXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9ibG9iL21hc3Rlci9kb2MvbW9kZWwubWQjcmVjZXNzaXZlLW11dGFudHMuXHJcbiAgICpcclxuICAgKiBOb3RlIHRoYXQgc29tZSBwYXJ0cyBvZiB0aGlzIG1ldGhvZCBsb29rIHNpbWlsYXIgdG8gbWV0aG9kIG1hdGVCdW5uaWVzLiBUaGVyZSBhcmUgaW4gZmFjdCBzaWduaWZpY2FudCBkaWZmZXJlbmNlcyxcclxuICAgKiB3aGljaCBtYWRlIGl0IGRpZmZpY3VsdCAoYW5kIGxlc3MgY2xlYXIpIHRvIGZhY3RvciBvdXQgY29tbW9uYWxpdGllcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBnZW5lcmF0aW9uXHJcbiAgICogQHBhcmFtIGJ1bm5pZXMgLSB0aGUgYnVubmllcyB0aGF0IGFyZSBjYW5kaWRhdGVzIGZvciBtYXRpbmcsIG1vZGlmaWVkIGFzIGEgc2lkZS1lZmZlY3RcclxuICAgKiBAcmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ1bm5pZXMgYm9yblxyXG4gICAqL1xyXG4gIHByaXZhdGUgbWF0ZUVhZ2VybHkoIGdlbmVyYXRpb246IG51bWJlciwgYnVubmllczogQnVubnlbXSApOiBudW1iZXIge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTmF0dXJhbFNlbGVjdGlvblV0aWxzLmlzTm9uTmVnYXRpdmVJbnRlZ2VyKCBnZW5lcmF0aW9uICksICdpbnZhbGlkIGdlbmVyYXRpb24nICk7XHJcblxyXG4gICAgbGV0IG51bWJlck9mUmVjZXNzaXZlTXV0YW50c01hdGVkID0gMDtcclxuICAgIGxldCBudW1iZXJCb3JuID0gMDtcclxuXHJcbiAgICAvLyBHZXQgYSBjb3B5IG9mIHRoZSBhcnJheS4gV2UnbGwgYmUgaXRlcmF0aW5nIG92ZXIgdGhpcyB1bnRpbCBpdCdzIGVtcHR5LlxyXG4gICAgY29uc3QgcmVjZXNzaXZlTXV0YW50c0NvcHkgPSB0aGlzLnJlY2Vzc2l2ZU11dGFudHMuc2xpY2UoKTtcclxuXHJcbiAgICAvLyBGb3IgZWFjaCByZWNlc3NpdmUgbXV0YW50Li4uXHJcbiAgICB3aGlsZSAoIHJlY2Vzc2l2ZU11dGFudHNDb3B5Lmxlbmd0aCA+IDAgKSB7XHJcblxyXG4gICAgICBjb25zdCBmYXRoZXJJbmRleCA9IDA7XHJcbiAgICAgIGNvbnN0IG11dGFudEZhdGhlciA9IHJlY2Vzc2l2ZU11dGFudHNDb3B5WyBmYXRoZXJJbmRleCBdO1xyXG4gICAgICByZWNlc3NpdmVNdXRhbnRzQ29weS5zcGxpY2UoIGZhdGhlckluZGV4LCAxICk7XHJcblxyXG4gICAgICAvLyBJZiB3ZSBmaW5kIGEgbWF0ZS4uLlxyXG4gICAgICBjb25zdCBtdXRhbnRNb3RoZXIgPSBnZXRNYXRlRm9yUmVjZXNzaXZlTXV0YW50KCBtdXRhbnRGYXRoZXIsIGJ1bm5pZXMgKTtcclxuICAgICAgaWYgKCBtdXRhbnRNb3RoZXIgKSB7XHJcblxyXG4gICAgICAgIHBoZXQubG9nICYmIHBoZXQubG9nKCBgcmVjZXNzaXZlIG11dGFudCBbJHttdXRhbnRGYXRoZXJ9XSBpcyBtYXRpbmcgd2l0aCBbJHttdXRhbnRNb3RoZXJ9XWAgKTtcclxuICAgICAgICBudW1iZXJPZlJlY2Vzc2l2ZU11dGFudHNNYXRlZCsrO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIFB1bm5ldHQgc3F1YXJlIChnZW5ldGljIGNyb3NzKSBmb3IgZWFjaCBnZW5lLiBUaGUgb3JkZXIgb2YgZWFjaCBjcm9zcyBpcyByYW5kb20uXHJcbiAgICAgICAgY29uc3QgZnVyUHVubmV0U3F1YXJlID0gbmV3IFB1bm5ldHRTcXVhcmUoIG11dGFudEZhdGhlci5nZW5vdHlwZS5mdXJHZW5lUGFpciwgbXV0YW50TW90aGVyLmdlbm90eXBlLmZ1ckdlbmVQYWlyICk7XHJcbiAgICAgICAgY29uc3QgZWFyc1B1bm5ldFNxdWFyZSA9IG5ldyBQdW5uZXR0U3F1YXJlKCBtdXRhbnRGYXRoZXIuZ2Vub3R5cGUuZWFyc0dlbmVQYWlyLCBtdXRhbnRNb3RoZXIuZ2Vub3R5cGUuZWFyc0dlbmVQYWlyICk7XHJcbiAgICAgICAgY29uc3QgdGVldGhQdW5uZXRTcXVhcmUgPSBuZXcgUHVubmV0dFNxdWFyZSggbXV0YW50RmF0aGVyLmdlbm90eXBlLnRlZXRoR2VuZVBhaXIsIG11dGFudE1vdGhlci5nZW5vdHlwZS50ZWV0aEdlbmVQYWlyICk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpdHRlciBmb3IgdGhpcyBidW5ueSBwYWlyXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgTElUVEVSX1NJWkU7IGkrKyApIHtcclxuXHJcbiAgICAgICAgICAvLyBpbmhlcml0ZWQgYWxsZWxlc1xyXG4gICAgICAgICAgY29uc3QgZ2Vub3R5cGVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBmYXRoZXJGdXJBbGxlbGU6IGZ1clB1bm5ldFNxdWFyZS5nZXRDZWxsKCBpICkuZmF0aGVyQWxsZWxlLFxyXG4gICAgICAgICAgICBtb3RoZXJGdXJBbGxlbGU6IGZ1clB1bm5ldFNxdWFyZS5nZXRDZWxsKCBpICkubW90aGVyQWxsZWxlLFxyXG4gICAgICAgICAgICBmYXRoZXJFYXJzQWxsZWxlOiBlYXJzUHVubmV0U3F1YXJlLmdldENlbGwoIGkgKS5mYXRoZXJBbGxlbGUsXHJcbiAgICAgICAgICAgIG1vdGhlckVhcnNBbGxlbGU6IGVhcnNQdW5uZXRTcXVhcmUuZ2V0Q2VsbCggaSApLm1vdGhlckFsbGVsZSxcclxuICAgICAgICAgICAgZmF0aGVyVGVldGhBbGxlbGU6IHRlZXRoUHVubmV0U3F1YXJlLmdldENlbGwoIGkgKS5mYXRoZXJBbGxlbGUsXHJcbiAgICAgICAgICAgIG1vdGhlclRlZXRoQWxsZWxlOiB0ZWV0aFB1bm5ldFNxdWFyZS5nZXRDZWxsKCBpICkubW90aGVyQWxsZWxlXHJcbiAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgIC8vIEEgYnVubnkgaXMgYm9yblxyXG4gICAgICAgICAgdGhpcy5jcmVhdGVCdW5ueSgge1xyXG4gICAgICAgICAgICBmYXRoZXI6IG11dGFudEZhdGhlcixcclxuICAgICAgICAgICAgbW90aGVyOiBtdXRhbnRNb3RoZXIsXHJcbiAgICAgICAgICAgIGdlbmVyYXRpb246IGdlbmVyYXRpb24sXHJcbiAgICAgICAgICAgIGdlbm90eXBlT3B0aW9uczogZ2Vub3R5cGVPcHRpb25zXHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgICBudW1iZXJCb3JuKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGUgMSBhZGRpdGlvbmFsIG9mZnNwcmluZyB0aGF0IGlzIGhvbW96eWdvdXMgcmVjZXNzaXZlLCBpbiBvcmRlciB0byBtYWtlIHRoZSByZWNlc3NpdmUgYWxsZWxlXHJcbiAgICAgICAgLy8gcHJvcGFnYXRlIHRocm91Z2ggdGhlIHBoZW5vdHlwZSBtb3JlIHF1aWNrbHkuXHJcbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvOTgjaXNzdWVjb21tZW50LTY0NjI3NTQzN1xyXG4gICAgICAgIGNvbnN0IG11dGFudEFsbGVsZSA9IG11dGFudEZhdGhlci5nZW5vdHlwZS5tdXRhdGlvbiE7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggbXV0YW50QWxsZWxlICk7XHJcbiAgICAgICAgY29uc3QgZnVyQ2VsbCA9IGZ1clB1bm5ldFNxdWFyZS5nZXRBZGRpdGlvbmFsQ2VsbCggbXV0YW50QWxsZWxlLCB0aGlzLmdlbmVQb29sLmZ1ckdlbmUuZG9taW5hbnRBbGxlbGVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgICAgIGNvbnN0IGVhcnNDZWxsID0gZWFyc1B1bm5ldFNxdWFyZS5nZXRBZGRpdGlvbmFsQ2VsbCggbXV0YW50QWxsZWxlLCB0aGlzLmdlbmVQb29sLmVhcnNHZW5lLmRvbWluYW50QWxsZWxlUHJvcGVydHkudmFsdWUgKTtcclxuICAgICAgICBjb25zdCB0ZWV0aENlbGwgPSB0ZWV0aFB1bm5ldFNxdWFyZS5nZXRBZGRpdGlvbmFsQ2VsbCggbXV0YW50QWxsZWxlLCB0aGlzLmdlbmVQb29sLnRlZXRoR2VuZS5kb21pbmFudEFsbGVsZVByb3BlcnR5LnZhbHVlICk7XHJcbiAgICAgICAgY29uc3QgZ2Vub3R5cGVPcHRpb25zID0ge1xyXG4gICAgICAgICAgZmF0aGVyRnVyQWxsZWxlOiBmdXJDZWxsLmZhdGhlckFsbGVsZSxcclxuICAgICAgICAgIG1vdGhlckZ1ckFsbGVsZTogZnVyQ2VsbC5tb3RoZXJBbGxlbGUsXHJcbiAgICAgICAgICBmYXRoZXJFYXJzQWxsZWxlOiBlYXJzQ2VsbC5mYXRoZXJBbGxlbGUsXHJcbiAgICAgICAgICBtb3RoZXJFYXJzQWxsZWxlOiBlYXJzQ2VsbC5tb3RoZXJBbGxlbGUsXHJcbiAgICAgICAgICBmYXRoZXJUZWV0aEFsbGVsZTogdGVldGhDZWxsLmZhdGhlckFsbGVsZSxcclxuICAgICAgICAgIG1vdGhlclRlZXRoQWxsZWxlOiB0ZWV0aENlbGwubW90aGVyQWxsZWxlXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmNyZWF0ZUJ1bm55KCB7XHJcbiAgICAgICAgICBmYXRoZXI6IG11dGFudEZhdGhlcixcclxuICAgICAgICAgIG1vdGhlcjogbXV0YW50TW90aGVyLFxyXG4gICAgICAgICAgZ2VuZXJhdGlvbjogZ2VuZXJhdGlvbixcclxuICAgICAgICAgIGdlbm90eXBlT3B0aW9uczogZ2Vub3R5cGVPcHRpb25zXHJcbiAgICAgICAgfSApO1xyXG4gICAgICAgIG51bWJlckJvcm4rKztcclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBtdXRhbnRzIGZyb20gZnVydGhlciBjb25zaWRlcmF0aW9uIG9mIG1hdGluZy5cclxuICAgICAgICBidW5uaWVzLnNwbGljZSggYnVubmllcy5pbmRleE9mKCBtdXRhbnRGYXRoZXIgKSwgMSApO1xyXG4gICAgICAgIGJ1bm5pZXMuc3BsaWNlKCBidW5uaWVzLmluZGV4T2YoIG11dGFudE1vdGhlciApLCAxICk7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbXV0YW50IGZhdGhlciBmcm9tIGZ1cnRoZXIgY29uc2lkZXJhdGlvbiBvZiBtYXRpbmcgZWFnZXJseS5cclxuICAgICAgICBjb25zdCBtdXRhbnRGYXRoZXJJbmRleCA9IHRoaXMucmVjZXNzaXZlTXV0YW50cy5pbmRleE9mKCBtdXRhbnRGYXRoZXIgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBtdXRhbnRGYXRoZXJJbmRleCAhPT0gLTEsICdleHBlY3RlZCBtdXRhbnRGYXRoZXIgdG8gYmUgaW4gcmVjZXNzaXZlTXV0YW50cycgKTtcclxuICAgICAgICB0aGlzLnJlY2Vzc2l2ZU11dGFudHMuc3BsaWNlKCBtdXRhbnRGYXRoZXJJbmRleCwgMSApO1xyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdGhlIG11dGFudCBtb3RoZXIgZnJvbSBmdXJ0aGVyIGNvbnNpZGVyYXRpb24gb2YgbWF0aW5nIGVhZ2VybHkuIE5vdGUgdGhhdCB0aGUgbW90aGVyIG1heSBoYXZlIGJlZW4gYVxyXG4gICAgICAgIC8vIHNpYmxpbmcgKGFub3RoZXIgb3JpZ2luYWwgbXV0YW50IGNyZWF0ZWQgaW4gdGhlIHNhbWUgZ2VuZXJhdGlvbikgb3IgYSBtZW1iZXIgb2YgYSBsYXRlciBnZW5lcmF0aW9uLlxyXG4gICAgICAgIGNvbnN0IG11dGFudE1vdGhlckluZGV4ID0gdGhpcy5yZWNlc3NpdmVNdXRhbnRzLmluZGV4T2YoIG11dGFudE1vdGhlciApO1xyXG4gICAgICAgIGlmICggbXV0YW50TW90aGVySW5kZXggIT09IC0xICkge1xyXG4gICAgICAgICAgdGhpcy5yZWNlc3NpdmVNdXRhbnRzLnNwbGljZSggbXV0YW50TW90aGVySW5kZXgsIDEgKTtcclxuICAgICAgICAgIG51bWJlck9mUmVjZXNzaXZlTXV0YW50c01hdGVkKys7XHJcblxyXG4gICAgICAgICAgY29uc3QgbXV0YW50TW90aGVyQ29weUluZGV4ID0gcmVjZXNzaXZlTXV0YW50c0NvcHkuaW5kZXhPZiggbXV0YW50TW90aGVyICk7XHJcbiAgICAgICAgICBpZiAoIG11dGFudE1vdGhlckNvcHlJbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgICAgICAgIHJlY2Vzc2l2ZU11dGFudHNDb3B5LnNwbGljZSggbXV0YW50TW90aGVyQ29weUluZGV4LCAxICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFzc2VydCAmJiBhc3NlcnQoICF0aGlzLnJlY2Vzc2l2ZU11dGFudHMuaW5jbHVkZXMoIG11dGFudE1vdGhlciApLCAnbXV0YW50TW90aGVyIHNob3VsZCBub3QgYmUgaW4gcmVjZXNzaXZlTXV0YW50cycgKTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhcmVjZXNzaXZlTXV0YW50c0NvcHkuaW5jbHVkZXMoIG11dGFudE1vdGhlciApLCAnbXV0YW50TW90aGVyIHNob3VsZCBub3QgYmUgaW4gcmVjZXNzaXZlTXV0YW50c0NvcHknICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIG51bWJlck9mUmVjZXNzaXZlTXV0YW50c01hdGVkID4gMCApIHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGAke251bWJlck9mUmVjZXNzaXZlTXV0YW50c01hdGVkfSByZWNlc3NpdmUgbXV0YW50cyBtYXRlZCBlYWdlcmx5IHRvIGJpcnRoICR7bnVtYmVyQm9ybn0gYnVubmllc2AgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbnVtYmVyQm9ybjtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIE1vdmVzIGFsbCBsaXZlIGJ1bm5pZXMgdG8gdGhlIGdyb3VuZCwgc28gdGhhdCB3ZSBkb24ndCBoYXZlIGJ1bm5pZXMgcGF1c2VkIG1pZC1ob3AuXHJcbiAgICovXHJcbiAgcHVibGljIG1vdmVCdW5uaWVzVG9Hcm91bmQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmxpdmVCdW5uaWVzLmZvckVhY2goIGJ1bm55ID0+IGJ1bm55LmludGVycnVwdEhvcCgpICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBidW5uaWVzIHRoYXQgYXJlIGNhbmRpZGF0ZXMgZm9yIG5hdHVyYWwgc2VsZWN0aW9uIGR1ZSB0byBlbnZpcm9ubWVudGFsIGZhY3RvcnMsIGluIGEgcmFuZG9tIG9yZGVyLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBnZXRTZWxlY3Rpb25DYW5kaWRhdGVzKCk6IEJ1bm55W10ge1xyXG4gICAgcmV0dXJuIGRvdFJhbmRvbS5zaHVmZmxlKCB0aGlzLmxpdmVCdW5uaWVzICk7IC8vIHNodWZmbGUgcmV0dXJucyBhIG5ldyBhcnJheVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0cyB0aGUgbGl2ZSBidW5ueSBjb3VudHMgKHRvdGFsIGFuZCBlYWNoIHBoZW5vdHlwZSkuXHJcbiAgICovXHJcbiAgcHVibGljIGdldExpdmVCdW5ueUNvdW50cygpOiBCdW5ueUNvdW50cyB7XHJcbiAgICByZXR1cm4gdGhpcy5saXZlQnVubmllcy5jb3VudHNQcm9wZXJ0eS52YWx1ZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBsaXZlIGJ1bm5pZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE51bWJlck9mTGl2ZUJ1bm5pZXMoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmxpdmVCdW5uaWVzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBkZWFkIGJ1bm5pZXMuXHJcbiAgICovXHJcbiAgcHVibGljIGdldE51bWJlck9mRGVhZEJ1bm5pZXMoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmRlYWRCdW5uaWVzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiByZWNlc3NpdmUgbXV0YW50cyB0aGF0IGFyZSB3YWl0aW5nIHRvIG1hdGUgZWFnZXJseS5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0TnVtYmVyT2ZSZWNlc3NpdmVNdXRhbnRzKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWNlc3NpdmVNdXRhbnRzLmxlbmd0aDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpc3Bvc2VzIG9mIGRlYWQgYnVubmllcyB0aGF0IGFyZSBndWFyYW50ZWVkIG5vdCB0byBiZSBuZWVkZWQgYnkgdGhlIFBlZGlncmVlIGdyYXBoLlxyXG4gICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzExMlxyXG4gICAqIEBwYXJhbSBnZW5lcmF0aW9uIC0gdGhlIGN1cnJlbnQgZ2VuZXJhdGlvbiBudW1iZXJcclxuICAgKi9cclxuICBwdWJsaWMgcHJ1bmVEZWFkQnVubmllcyggZ2VuZXJhdGlvbjogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggTmF0dXJhbFNlbGVjdGlvblV0aWxzLmlzUG9zaXRpdmVJbnRlZ2VyKCBnZW5lcmF0aW9uICksICdpbnZhbGlkIGdlbmVyYXRpb24nICk7XHJcblxyXG4gICAgbGV0IG51bWJlclBydW5lZCA9IDA7XHJcblxyXG4gICAgLy8gVGhpcyBtb2RpZmllcyB0aGUgYXJyYXkuIEl0ZXJhdGUgYmFja3dhcmRzIHRvIGF2b2lkIGhhdmluZyB0byBtYWtlIGEgY29weS5cclxuICAgIGZvciAoIGxldCBpID0gdGhpcy5kZWFkQnVubmllcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcclxuICAgICAgY29uc3QgYnVubnkgPSB0aGlzLmRlYWRCdW5uaWVzWyBpIF07XHJcbiAgICAgIGlmICggZ2VuZXJhdGlvbiAtIGJ1bm55LmdlbmVyYXRpb24gPiBNQVhfREVBRF9CVU5OWV9HRU5FUkFUSU9OUyAmJlxyXG4gICAgICAgICAgIHRoaXMuc2VsZWN0ZWRCdW5ueVByb3BlcnR5LnZhbHVlICE9PSBidW5ueSApIHtcclxuICAgICAgICB0aGlzLmJ1bm55R3JvdXAuZGlzcG9zZUVsZW1lbnQoIGJ1bm55ICk7XHJcbiAgICAgICAgYXNzZXJ0ICYmIGFzc2VydCggYnVubnkuaXNEaXNwb3NlZCwgJ2V4cGVjdCBidW5ueSB0byBiZSBkaXNwb3NlZCcgKTtcclxuICAgICAgICBudW1iZXJQcnVuZWQrKztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICggbnVtYmVyUHJ1bmVkID4gMCApIHtcclxuICAgICAgcGhldC5sb2cgJiYgcGhldC5sb2coIGAke251bWJlclBydW5lZH0gZGVhZCBidW5uaWVzIHBydW5lZGAgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFzc2VydHMgdGhhdCBjb2xsZWN0aW9uIGNvdW50cyBhcmUgaW4tc3luYyB3aXRoIHRoZSBCdW5ueUdyb3VwLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgYXNzZXJ0VmFsaWRDb3VudHMoKTogdm9pZCB7XHJcbiAgICBjb25zdCBsaXZlID0gdGhpcy5saXZlQnVubmllcy5sZW5ndGg7XHJcbiAgICBjb25zdCBkZWFkID0gdGhpcy5kZWFkQnVubmllcy5sZW5ndGg7XHJcbiAgICBjb25zdCB0b3RhbCA9IGxpdmUgKyBkZWFkO1xyXG4gICAgY29uc3QgYnVubnlHcm91cExlbmd0aCA9IHRoaXMuYnVubnlHcm91cC5jb3VudDtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGxpdmUgKyBkZWFkID09PSB0b3RhbCAmJiB0b3RhbCA9PT0gYnVubnlHcm91cExlbmd0aCxcclxuICAgICAgYGJ1bm55IGNvdW50cyBhcmUgb3V0IG9mIHN5bmMsIGxpdmU9JHtsaXZlfSwgZGVhZD0ke2RlYWR9LCB0b3RhbD0ke3RvdGFsfSBidW5ueUdyb3VwTGVuZ3RoPSR7YnVubnlHcm91cExlbmd0aH1gICk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogR2V0cyBhIHN1aXRhYmxlIG1hdGUgZm9yIGEgcmVjZXNzaXZlIG11dGFudC5cclxuICogVGhlIG1hdGUgbXVzdCBoYXZlIHRoZSBzYW1lIG11dGFudCBhbGxlbGUgdGhhdCBjYXVzZWQgdGhlIHJlY2Vzc2l2ZSBtdXRhbnQgdG8gbXV0YXRlLlxyXG4gKiBAcmV0dXJucyBudWxsIGlmIG5vIG1hdGUgaXMgZm91bmRcclxuICovXHJcbmZ1bmN0aW9uIGdldE1hdGVGb3JSZWNlc3NpdmVNdXRhbnQoIGZhdGhlcjogQnVubnksIGJ1bm5pZXM6IEJ1bm55W10gKTogQnVubnkgfCBudWxsIHtcclxuICBhc3NlcnQgJiYgYXNzZXJ0KCBmYXRoZXIuaXNPcmlnaW5hbE11dGFudCgpLCAnZmF0aGVyIG11c3QgYmUgYW4gb3JpZ2luYWwgbXV0YW50JyApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIGZhdGhlci5nZW5vdHlwZS5tdXRhdGlvbiwgJ2ZhdGhlciBtdXN0IGhhdmUgYSBtdXRhdGVkIGdlbm90eXBlJyApO1xyXG5cclxuICBsZXQgbW90aGVyID0gbnVsbDtcclxuICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBidW5uaWVzLmxlbmd0aCAmJiAhbW90aGVyOyBpKysgKSB7XHJcbiAgICBjb25zdCBidW5ueSA9IGJ1bm5pZXNbIGkgXTtcclxuICAgIGlmICggYnVubnkgIT09IGZhdGhlciAmJiBidW5ueS5nZW5vdHlwZS5oYXNBbGxlbGUoIGZhdGhlci5nZW5vdHlwZS5tdXRhdGlvbiApICkge1xyXG4gICAgICBtb3RoZXIgPSBidW5ueTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIG1vdGhlcjtcclxufVxyXG5cclxubmF0dXJhbFNlbGVjdGlvbi5yZWdpc3RlciggJ0J1bm55Q29sbGVjdGlvbicsIEJ1bm55Q29sbGVjdGlvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsT0FBTyxNQUFNLGdDQUFnQztBQUVwRCxPQUFPQyxTQUFTLE1BQU0saUNBQWlDO0FBQ3ZELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxjQUFjLFFBQVEsdUNBQXVDO0FBR3RFLE9BQU9DLGdCQUFnQixNQUFNLDJCQUEyQjtBQUN4RCxPQUFPQyx5QkFBeUIsTUFBTSxpQ0FBaUM7QUFDdkUsT0FBT0MsK0JBQStCLE1BQU0sdUNBQXVDO0FBRW5GLE9BQU9DLFVBQVUsTUFBMEMsaUJBQWlCO0FBQzVFLE9BQU9DLGdCQUFnQixNQUFzQix1QkFBdUI7QUFHcEUsT0FBT0MsYUFBYSxNQUFNLG9CQUFvQjtBQUM5QyxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsT0FBT0MscUJBQXFCLE1BQU0sNkJBQTZCOztBQUUvRDs7QUFFQSxNQUFNQyxXQUFXLEdBQUcsQ0FBQztBQUNyQkMsTUFBTSxJQUFJQSxNQUFNLENBQUVELFdBQVcsS0FBSyxDQUFDLEVBQ2pDLDJHQUE0RyxDQUFDOztBQUUvRztBQUNBO0FBQ0EsTUFBTUUsc0JBQXNCLEdBQUcsSUFBSWIsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDaEQsTUFBTWMsdUJBQXVCLEdBQUcsSUFBSWQsS0FBSyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7QUFDakQsTUFBTWUscUJBQXFCLEdBQUcsSUFBSWYsS0FBSyxDQUFFLENBQUMsRUFBRSxFQUFHLENBQUM7O0FBRWhEO0FBQ0E7QUFDQTtBQUNBLE1BQU1nQiwwQkFBMEIsR0FBR1gsK0JBQStCLENBQUNZLE1BQU0sSUFDcENiLHlCQUF5QixDQUFDYyxtQkFBbUIsR0FBRyxDQUFDLENBQUU7QUFFeEYsZUFBZSxNQUFNQyxlQUFlLENBQUM7RUFLbkM7O0VBR0E7O0VBR0E7RUFDQTtFQUNBO0VBQ0E7RUFHQTtFQUNBO0VBQ0E7RUFDQTtFQUdBO0VBR0E7RUFHQTtFQUdPQyxXQUFXQSxDQUFFQyxrQkFBaUQsRUFBRUMsUUFBa0IsRUFBRUMsTUFBYyxFQUFHO0lBRTFHLElBQUksQ0FBQ0MsV0FBVyxHQUFHakIsZ0JBQWdCLENBQUU7TUFDbkNnQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGFBQWM7SUFDN0MsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyxXQUFXLEdBQUduQixnQkFBZ0IsQ0FBRTtNQUNuQ2dCLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsYUFBYztJQUM3QyxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNFLGdCQUFnQixHQUFHcEIsZ0JBQWdCLENBQUU7TUFDeENnQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGtCQUFtQixDQUFDO01BQ2pERyxtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLHNCQUFzQixHQUFHLElBQUloQyxlQUFlLENBQy9DLENBQUUsSUFBSSxDQUFDMkIsV0FBVyxDQUFDTSxjQUFjLENBQUUsRUFDbkNDLE1BQU0sSUFBSTtNQUNSLElBQUtBLE1BQU0sR0FBRyxFQUFFLEVBQUc7UUFDakIsT0FBT2xCLHNCQUFzQjtNQUMvQixDQUFDLE1BQ0ksSUFBS2tCLE1BQU0sR0FBRyxHQUFHLEVBQUc7UUFDdkIsT0FBT2pCLHVCQUF1QjtNQUNoQyxDQUFDLE1BQ0k7UUFDSCxPQUFPQyxxQkFBcUI7TUFDOUI7SUFDRixDQUFDLEVBQUU7TUFDRFEsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSx3QkFBeUIsQ0FBQztNQUN2RE8sZUFBZSxFQUFFaEMsS0FBSyxDQUFDaUMsT0FBTztNQUM5QkwsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBRSxDQUFDOztJQUVMO0lBQ0EsTUFBTU0sVUFBVSxHQUFHLElBQUk1QixVQUFVLENBQUVnQixRQUFRLEVBQUVELGtCQUFrQixFQUFFLElBQUksQ0FBQ1Esc0JBQXNCLEVBQUU7TUFDNUZOLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsWUFBYTtJQUM1QyxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNVLHFCQUFxQixHQUFHLElBQUkxQixxQkFBcUIsQ0FBRTtNQUN0RGMsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSx1QkFBd0I7SUFDdkQsQ0FBRSxDQUFDOztJQUVIO0lBQ0FXLElBQUksQ0FBQ0MsR0FBRyxJQUFJLElBQUksQ0FBQ0YscUJBQXFCLENBQUNHLElBQUksQ0FBRUMsYUFBYSxJQUFJO01BQzVESCxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsaUJBQWdCRSxhQUFjLEVBQUUsQ0FBQztJQUMxRCxDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLHlCQUF5QixHQUFHLElBQUkxQyxPQUFPLENBQUU7TUFDNUN5QixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLDJCQUE0QixDQUFDO01BQzFEZ0IsY0FBYyxFQUFFLElBQUk7TUFDcEJiLG1CQUFtQixFQUFFO0lBQ3ZCLENBQUUsQ0FBQzs7SUFFSDtJQUNBUSxJQUFJLENBQUNDLEdBQUcsSUFBSSxJQUFJLENBQUNHLHlCQUF5QixDQUFDRSxXQUFXLENBQUUsTUFBTTtNQUM1RE4sSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFFLCtCQUFnQyxDQUFDO01BQ3ZERCxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsd0JBQXVCLElBQUksQ0FBQ2IsV0FBVyxDQUFDTyxNQUFPLEVBQUUsQ0FBQztNQUN6RUssSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFHLHdCQUF1QixJQUFJLENBQUNYLFdBQVcsQ0FBQ0ssTUFBTyxFQUFFLENBQUM7SUFDM0UsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDWSxtQ0FBbUMsR0FBRyxJQUFJN0MsT0FBTyxDQUFFO01BQ3REeUIsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSxxQ0FBc0MsQ0FBQztNQUNwRWdCLGNBQWMsRUFBRSxJQUFJO01BQ3BCYixtQkFBbUIsRUFBRTtJQUN2QixDQUFFLENBQUM7O0lBRUg7SUFDQVEsSUFBSSxDQUFDQyxHQUFHLElBQUksSUFBSSxDQUFDTSxtQ0FBbUMsQ0FBQ0QsV0FBVyxDQUFFLE1BQU07TUFDdEVOLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRSxvQ0FBcUMsQ0FBQztNQUM1REQsSUFBSSxDQUFDQyxHQUFHLElBQUlELElBQUksQ0FBQ0MsR0FBRyxDQUFHLHdCQUF1QixJQUFJLENBQUNiLFdBQVcsQ0FBQ08sTUFBTyxFQUFFLENBQUM7TUFDekVLLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRyx3QkFBdUIsSUFBSSxDQUFDWCxXQUFXLENBQUNLLE1BQU8sRUFBRSxDQUFDO0lBQzNFLENBQUUsQ0FBQzs7SUFFSDtJQUNBO0lBQ0FHLFVBQVUsQ0FBQ1UscUJBQXFCLENBQUNGLFdBQVcsQ0FBRUcsS0FBSyxJQUFJO01BRXJELElBQUtBLEtBQUssQ0FBQ0MsT0FBTyxFQUFHO1FBRW5CO1FBQ0E7UUFDQUQsS0FBSyxDQUFDRSxXQUFXLENBQUNMLFdBQVcsQ0FBRSxNQUFNO1VBRW5DLE1BQU1NLGNBQWMsR0FBRyxJQUFJLENBQUN4QixXQUFXLENBQUN5QixPQUFPLENBQUVKLEtBQU0sQ0FBQztVQUN4RGpDLE1BQU0sSUFBSUEsTUFBTSxDQUFFb0MsY0FBYyxLQUFLLENBQUMsQ0FBQyxFQUFFLHFDQUFzQyxDQUFDO1VBQ2hGLElBQUksQ0FBQ3hCLFdBQVcsQ0FBQzBCLE1BQU0sQ0FBRUYsY0FBYyxFQUFFLENBQUUsQ0FBQztVQUU1QyxJQUFJLENBQUN0QixXQUFXLENBQUN5QixJQUFJLENBQUVOLEtBQU0sQ0FBQztVQUU5QixNQUFNTyxxQkFBcUIsR0FBRyxJQUFJLENBQUN6QixnQkFBZ0IsQ0FBQ3NCLE9BQU8sQ0FBRUosS0FBTSxDQUFDO1VBQ3BFLElBQUtPLHFCQUFxQixLQUFLLENBQUMsQ0FBQyxFQUFHO1lBQ2xDLElBQUksQ0FBQ3pCLGdCQUFnQixDQUFDdUIsTUFBTSxDQUFFRSxxQkFBcUIsRUFBRSxDQUFFLENBQUM7VUFDMUQ7VUFFQSxJQUFLLElBQUksQ0FBQzVCLFdBQVcsQ0FBQ08sTUFBTSxLQUFLLENBQUMsRUFBRztZQUNuQyxJQUFJLENBQUNTLHlCQUF5QixDQUFDYSxJQUFJLENBQUMsQ0FBQztVQUN2QztRQUNGLENBQUUsQ0FBQztRQUVILElBQUksQ0FBQzdCLFdBQVcsQ0FBQzJCLElBQUksQ0FBRU4sS0FBTSxDQUFDO01BQ2hDLENBQUMsTUFDSTtRQUNIakMsTUFBTSxJQUFJQSxNQUFNLENBQUV3QixJQUFJLENBQUNrQixLQUFLLENBQUNDLEdBQUcsQ0FBQ0MsNEJBQTRCLENBQUNDLEtBQUssRUFDakUsa0VBQW1FLENBQUM7UUFDdEUsSUFBSSxDQUFDL0IsV0FBVyxDQUFDeUIsSUFBSSxDQUFFTixLQUFNLENBQUM7TUFDaEM7SUFDRixDQUFFLENBQUM7O0lBRUg7SUFDQVgsVUFBVSxDQUFDd0Isc0JBQXNCLENBQUNoQixXQUFXLENBQUVHLEtBQUssSUFBSTtNQUV0RCxNQUFNYyxTQUFTLEdBQUcsSUFBSSxDQUFDbkMsV0FBVyxDQUFDeUIsT0FBTyxDQUFFSixLQUFNLENBQUM7TUFDbkQsSUFBS2MsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFHO1FBQ3RCLElBQUksQ0FBQ25DLFdBQVcsQ0FBQzBCLE1BQU0sQ0FBRVMsU0FBUyxFQUFFLENBQUUsQ0FBQzs7UUFFdkM7UUFDQSxNQUFNQyxjQUFjLEdBQUcsSUFBSSxDQUFDakMsZ0JBQWdCLENBQUNzQixPQUFPLENBQUVKLEtBQU0sQ0FBQztRQUMzRGUsY0FBYyxLQUFLLENBQUMsQ0FBQyxJQUFNLElBQUksQ0FBQ2pDLGdCQUFnQixDQUFDdUIsTUFBTSxDQUFFVSxjQUFjLEVBQUUsQ0FBRSxDQUFDO01BQ2hGLENBQUMsTUFDSTtRQUVIO1FBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQ25DLFdBQVcsQ0FBQ3VCLE9BQU8sQ0FBRUosS0FBTSxDQUFDO1FBQ2pEZ0IsU0FBUyxLQUFLLENBQUMsQ0FBQyxJQUFNLElBQUksQ0FBQ25DLFdBQVcsQ0FBQ3dCLE1BQU0sQ0FBRVcsU0FBUyxFQUFFLENBQUUsQ0FBQztNQUNqRTs7TUFFQTtNQUNBakQsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNZLFdBQVcsQ0FBQ3NDLFFBQVEsQ0FBRWpCLEtBQU0sQ0FBQyxFQUFFLCtCQUFnQyxDQUFDO01BQ3hGakMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNjLFdBQVcsQ0FBQ29DLFFBQVEsQ0FBRWpCLEtBQU0sQ0FBQyxFQUFFLCtCQUFnQyxDQUFDO01BQ3hGakMsTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQyxJQUFJLENBQUNlLGdCQUFnQixDQUFDbUMsUUFBUSxDQUFFakIsS0FBTSxDQUFDLEVBQUUsb0NBQXFDLENBQUM7SUFDcEcsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDdkIsUUFBUSxHQUFHQSxRQUFRO0lBQ3hCLElBQUksQ0FBQ1ksVUFBVSxHQUFHQSxVQUFVO0VBQzlCO0VBRU82QixPQUFPQSxDQUFBLEVBQVM7SUFDckJuRCxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7RUFDM0Y7RUFFT29ELEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUM5QixVQUFVLENBQUMrQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsSUFBSSxDQUFDOUIscUJBQXFCLENBQUM2QixLQUFLLENBQUMsQ0FBQztJQUNsQ3BELE1BQU0sSUFBSSxJQUFJLENBQUNzRCxpQkFBaUIsQ0FBQyxDQUFDO0VBQ3BDOztFQUVBO0FBQ0Y7QUFDQTtFQUNTQyxXQUFXQSxDQUFFQyxPQUF1QyxFQUFVO0lBQ25FLE9BQU8sSUFBSSxDQUFDbEMsVUFBVSxDQUFDbUMsaUJBQWlCLENBQUVELE9BQVEsQ0FBQztFQUNyRDs7RUFFQTtBQUNGO0FBQ0E7RUFDU0UsZUFBZUEsQ0FBRUMsZUFBZ0csRUFBVTtJQUNoSSxPQUFPLElBQUksQ0FBQ0osV0FBVyxDQUFFakUsY0FBYyxDQUFrQztNQUN2RXNFLE1BQU0sRUFBRSxJQUFJO01BQ1pDLE1BQU0sRUFBRSxJQUFJO01BQ1pDLFVBQVUsRUFBRTtJQUNkLENBQUMsRUFBRUgsZUFBZ0IsQ0FBRSxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ1NJLFdBQVdBLENBQUVDLEVBQVUsRUFBUztJQUNyQ2hFLE1BQU0sSUFBSUEsTUFBTSxDQUFFZ0UsRUFBRSxJQUFJLENBQUMsRUFBRyxlQUFjQSxFQUFHLEVBQUUsQ0FBQztJQUNoRCxJQUFJLENBQUNwRCxXQUFXLENBQUNxRCxPQUFPLENBQUVoQyxLQUFLLElBQUlBLEtBQUssQ0FBQ2lDLElBQUksQ0FBRUYsRUFBRyxDQUFFLENBQUM7RUFDdkQ7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDU0csVUFBVUEsQ0FBQSxFQUFTO0lBQ3hCbkUsTUFBTSxJQUFJQSxNQUFNLENBQUVvRSxDQUFDLENBQUNDLEtBQUssQ0FBRSxJQUFJLENBQUN6RCxXQUFXLEVBQUVxQixLQUFLLElBQUlBLEtBQUssQ0FBQ0MsT0FBUSxDQUFDLEVBQ25FLCtDQUFnRCxDQUFDO0lBRW5ELElBQUlvQyxTQUFTLEdBQUcsQ0FBQzs7SUFFakI7SUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBSSxDQUFDM0QsV0FBVyxDQUFDNEQsS0FBSyxDQUFDLENBQUM7SUFDaERELGVBQWUsQ0FBQ04sT0FBTyxDQUFFaEMsS0FBSyxJQUFJO01BRWhDO01BQ0FBLEtBQUssQ0FBQ3dDLEdBQUcsRUFBRTtNQUNYekUsTUFBTSxJQUFJQSxNQUFNLENBQUVpQyxLQUFLLENBQUN3QyxHQUFHLElBQUloRiwrQkFBK0IsQ0FBQ1ksTUFBTSxFQUNsRSxHQUFFNEIsS0FBSyxDQUFDdEIsTUFBTSxDQUFDK0QsSUFBSyxRQUFPekMsS0FBSyxDQUFDd0MsR0FBSSxtQkFBa0JoRiwrQkFBK0IsQ0FBQ1ksTUFBTyxFQUFFLENBQUM7O01BRXBHO01BQ0EsSUFBSzRCLEtBQUssQ0FBQ3dDLEdBQUcsS0FBS2hGLCtCQUErQixDQUFDWSxNQUFNLEVBQUc7UUFDMUQ0QixLQUFLLENBQUMwQyxHQUFHLENBQUMsQ0FBQztRQUNYTCxTQUFTLEVBQUU7TUFDYjtJQUNGLENBQUUsQ0FBQztJQUVIdEUsTUFBTSxJQUFJLElBQUksQ0FBQ3NELGlCQUFpQixDQUFDLENBQUM7SUFDbEM5QixJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsR0FBRTZDLFNBQVUsMEJBQTBCLENBQUM7RUFDaEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NNLFdBQVdBLENBQUVkLFVBQWtCLEVBQVM7SUFDN0M5RCxNQUFNLElBQUlBLE1BQU0sQ0FBRUYscUJBQXFCLENBQUMrRSxvQkFBb0IsQ0FBRWYsVUFBVyxDQUFDLEVBQUUsb0JBQXFCLENBQUM7O0lBRWxHO0lBQ0EsSUFBSWdCLFNBQVMsR0FBRyxDQUFDOztJQUVqQjtJQUNBLE1BQU1DLE9BQU8sR0FBRzVGLFNBQVMsQ0FBQzZGLE9BQU8sQ0FBRSxJQUFJLENBQUNwRSxXQUFZLENBQUM7SUFDckRZLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRyxVQUFTc0QsT0FBTyxDQUFDNUQsTUFBTyxVQUFVLENBQUM7O0lBRTFEO0lBQ0E7SUFDQTtJQUNBLElBQUk4RCxnQ0FBZ0MsR0FBRyxDQUFDO0lBQ3hDLElBQUssSUFBSSxDQUFDbEUsZ0JBQWdCLENBQUNJLE1BQU0sR0FBRyxDQUFDLEVBQUc7TUFDdEM4RCxnQ0FBZ0MsR0FBRyxJQUFJLENBQUNDLFdBQVcsQ0FBRXBCLFVBQVUsRUFBRWlCLE9BQVEsQ0FBQztJQUM1RTs7SUFFQTtJQUNBLE1BQU1JLGNBQWMsR0FBR0MsSUFBSSxDQUFDQyxLQUFLLENBQUVOLE9BQU8sQ0FBQzVELE1BQU0sR0FBRyxDQUFFLENBQUMsR0FBR3BCLFdBQVc7O0lBRXJFO0lBQ0EsTUFBTXVGLFNBQVMsR0FBRyxJQUFJLENBQUM1RSxRQUFRLENBQUM2RSxPQUFPLENBQUNDLHNCQUFzQixDQUFDM0MsS0FBSztJQUNwRSxNQUFNNEMsVUFBVSxHQUFHLElBQUksQ0FBQy9FLFFBQVEsQ0FBQ2dGLFFBQVEsQ0FBQ0Ysc0JBQXNCLENBQUMzQyxLQUFLO0lBQ3RFLE1BQU04QyxXQUFXLEdBQUcsSUFBSSxDQUFDakYsUUFBUSxDQUFDa0YsU0FBUyxDQUFDSixzQkFBc0IsQ0FBQzNDLEtBQUs7SUFDeEUsSUFBSSxDQUFDbkMsUUFBUSxDQUFDbUYsbUJBQW1CLENBQUMsQ0FBQzs7SUFFbkM7SUFDQTtJQUNBLElBQUlDLFVBQVUsR0FBRyxFQUFFO0lBQ25CLElBQUlDLFdBQVcsR0FBRyxFQUFFO0lBQ3BCLElBQUlDLFlBQVksR0FBRyxFQUFFOztJQUVyQjtJQUNBLElBQUtWLFNBQVMsSUFBSUcsVUFBVSxJQUFJRSxXQUFXLEVBQUc7TUFFNUM7TUFDQSxNQUFNTSxjQUFjLEdBQUdiLElBQUksQ0FBQ2MsR0FBRyxDQUFFLENBQUMsRUFBRTdHLEtBQUssQ0FBQzhHLGNBQWMsQ0FBRTFHLCtCQUErQixDQUFDMkcsa0JBQWtCLEdBQUdqQixjQUFlLENBQUUsQ0FBQzs7TUFFakk7TUFDQSxJQUFJa0IsT0FBTyxHQUFHLEVBQUU7TUFDaEIsS0FBTSxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUduQixjQUFjLEVBQUVtQixDQUFDLEVBQUUsRUFBRztRQUN6Q0QsT0FBTyxDQUFDOUQsSUFBSSxDQUFFK0QsQ0FBRSxDQUFDO01BQ25COztNQUVBO01BQ0FELE9BQU8sR0FBR2xILFNBQVMsQ0FBQzZGLE9BQU8sQ0FBRXFCLE9BQVEsQ0FBQzs7TUFFdEM7TUFDQSxJQUFLZixTQUFTLEVBQUc7UUFDZlEsVUFBVSxHQUFHTyxPQUFPLENBQUMvRCxNQUFNLENBQUUsQ0FBQyxFQUFFMkQsY0FBZSxDQUFDO01BQ2xEO01BQ0EsSUFBS1IsVUFBVSxFQUFHO1FBQ2hCTSxXQUFXLEdBQUdNLE9BQU8sQ0FBQy9ELE1BQU0sQ0FBRSxDQUFDLEVBQUUyRCxjQUFlLENBQUM7TUFDbkQ7TUFDQSxJQUFLTixXQUFXLEVBQUc7UUFDakJLLFlBQVksR0FBR0ssT0FBTyxDQUFDL0QsTUFBTSxDQUFFLENBQUMsRUFBRTJELGNBQWUsQ0FBQztNQUNwRDtJQUNGO0lBQ0FqRyxNQUFNLElBQUlBLE1BQU0sQ0FBRXVHLEtBQUssQ0FBQ0MsT0FBTyxDQUFFVixVQUFXLENBQUMsRUFBRSxtQkFBb0IsQ0FBQztJQUNwRTlGLE1BQU0sSUFBSUEsTUFBTSxDQUFFdUcsS0FBSyxDQUFDQyxPQUFPLENBQUVULFdBQVksQ0FBQyxFQUFFLG1CQUFvQixDQUFDO0lBQ3JFL0YsTUFBTSxJQUFJQSxNQUFNLENBQUV1RyxLQUFLLENBQUNDLE9BQU8sQ0FBRVIsWUFBYSxDQUFDLEVBQUUsbUJBQW9CLENBQUM7O0lBRXRFO0lBQ0EsS0FBTSxJQUFJTSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd2QixPQUFPLENBQUM1RCxNQUFNLEVBQUVtRixDQUFDLEdBQUdBLENBQUMsR0FBRyxDQUFDLEVBQUc7TUFFL0M7TUFDQSxNQUFNMUMsTUFBTSxHQUFHbUIsT0FBTyxDQUFFdUIsQ0FBQyxDQUFFO01BQzNCLE1BQU16QyxNQUFNLEdBQUdrQixPQUFPLENBQUV1QixDQUFDLEdBQUcsQ0FBQyxDQUFFOztNQUUvQjtNQUNBLE1BQU1HLGVBQWUsR0FBRyxJQUFJN0csYUFBYSxDQUFFZ0UsTUFBTSxDQUFDOEMsUUFBUSxDQUFDQyxXQUFXLEVBQUU5QyxNQUFNLENBQUM2QyxRQUFRLENBQUNDLFdBQVksQ0FBQztNQUNyRyxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJaEgsYUFBYSxDQUFFZ0UsTUFBTSxDQUFDOEMsUUFBUSxDQUFDRyxZQUFZLEVBQUVoRCxNQUFNLENBQUM2QyxRQUFRLENBQUNHLFlBQWEsQ0FBQztNQUN4RyxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJbEgsYUFBYSxDQUFFZ0UsTUFBTSxDQUFDOEMsUUFBUSxDQUFDSyxhQUFhLEVBQUVsRCxNQUFNLENBQUM2QyxRQUFRLENBQUNLLGFBQWMsQ0FBQzs7TUFFM0c7TUFDQSxLQUFNLElBQUlDLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2pILFdBQVcsRUFBRWlILENBQUMsRUFBRSxFQUFHO1FBRXRDO1FBQ0EsTUFBTS9FLEtBQUssR0FBRyxJQUFJLENBQUNzQixXQUFXLENBQUU7VUFDOUJLLE1BQU0sRUFBRUEsTUFBTTtVQUNkQyxNQUFNLEVBQUVBLE1BQU07VUFDZEMsVUFBVSxFQUFFQSxVQUFVO1VBQ3RCbUQsZUFBZSxFQUFFO1lBRWY7WUFDQUMsZUFBZSxFQUFFVCxlQUFlLENBQUNVLE9BQU8sQ0FBRUgsQ0FBRSxDQUFDLENBQUNJLFlBQVk7WUFDMURDLGVBQWUsRUFBRVosZUFBZSxDQUFDVSxPQUFPLENBQUVILENBQUUsQ0FBQyxDQUFDTSxZQUFZO1lBQzFEQyxnQkFBZ0IsRUFBRVgsZ0JBQWdCLENBQUNPLE9BQU8sQ0FBRUgsQ0FBRSxDQUFDLENBQUNJLFlBQVk7WUFDNURJLGdCQUFnQixFQUFFWixnQkFBZ0IsQ0FBQ08sT0FBTyxDQUFFSCxDQUFFLENBQUMsQ0FBQ00sWUFBWTtZQUM1REcsaUJBQWlCLEVBQUVYLGlCQUFpQixDQUFDSyxPQUFPLENBQUVILENBQUUsQ0FBQyxDQUFDSSxZQUFZO1lBQzlETSxpQkFBaUIsRUFBRVosaUJBQWlCLENBQUNLLE9BQU8sQ0FBRUgsQ0FBRSxDQUFDLENBQUNNLFlBQVk7WUFFOUQ7WUFDQWhDLFNBQVMsRUFBRVEsVUFBVSxDQUFDNUMsUUFBUSxDQUFFNEIsU0FBVSxDQUFDO1lBQzNDVyxVQUFVLEVBQUVNLFdBQVcsQ0FBQzdDLFFBQVEsQ0FBRTRCLFNBQVUsQ0FBQztZQUM3Q2EsV0FBVyxFQUFFSyxZQUFZLENBQUM5QyxRQUFRLENBQUU0QixTQUFVO1VBQ2hEO1FBQ0YsQ0FBRSxDQUFDO1FBQ0hBLFNBQVMsRUFBRTs7UUFFWDtRQUNBLElBQUs3QyxLQUFLLENBQUMwRixnQkFBZ0IsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDakgsUUFBUSxDQUFDa0gsbUJBQW1CLENBQUUzRixLQUFLLENBQUN5RSxRQUFRLENBQUNtQixRQUFTLENBQUMsRUFBRztVQUM5RnJHLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRywrQkFBOEJRLEtBQU0sRUFBRSxDQUFDO1VBQzlELElBQUksQ0FBQ2xCLGdCQUFnQixDQUFDd0IsSUFBSSxDQUFFTixLQUFNLENBQUM7UUFDckM7TUFDRjtJQUNGO0lBRUFqQyxNQUFNLElBQUksSUFBSSxDQUFDc0QsaUJBQWlCLENBQUMsQ0FBQztJQUNsQ3RELE1BQU0sSUFBSUEsTUFBTSxDQUFFOEUsU0FBUyxLQUFLSyxjQUFjLEVBQUUsd0NBQXlDLENBQUM7SUFDMUYzRCxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsR0FBRTBELGNBQWMsR0FBR0YsZ0NBQWlDLG9CQUFvQixDQUFDOztJQUVoRztJQUNBLElBQUssSUFBSSxDQUFDckUsV0FBVyxDQUFDTSxjQUFjLENBQUMyQixLQUFLLElBQUlwRCwrQkFBK0IsQ0FBQ3FJLGFBQWEsRUFBRztNQUM1RixJQUFJLENBQUMvRixtQ0FBbUMsQ0FBQ1UsSUFBSSxDQUFDLENBQUM7SUFDakQ7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1V5QyxXQUFXQSxDQUFFcEIsVUFBa0IsRUFBRWlCLE9BQWdCLEVBQVc7SUFDbEUvRSxNQUFNLElBQUlBLE1BQU0sQ0FBRUYscUJBQXFCLENBQUMrRSxvQkFBb0IsQ0FBRWYsVUFBVyxDQUFDLEVBQUUsb0JBQXFCLENBQUM7SUFFbEcsSUFBSWlFLDZCQUE2QixHQUFHLENBQUM7SUFDckMsSUFBSUMsVUFBVSxHQUFHLENBQUM7O0lBRWxCO0lBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDbEgsZ0JBQWdCLENBQUN5RCxLQUFLLENBQUMsQ0FBQzs7SUFFMUQ7SUFDQSxPQUFReUQsb0JBQW9CLENBQUM5RyxNQUFNLEdBQUcsQ0FBQyxFQUFHO01BRXhDLE1BQU0rRyxXQUFXLEdBQUcsQ0FBQztNQUNyQixNQUFNQyxZQUFZLEdBQUdGLG9CQUFvQixDQUFFQyxXQUFXLENBQUU7TUFDeERELG9CQUFvQixDQUFDM0YsTUFBTSxDQUFFNEYsV0FBVyxFQUFFLENBQUUsQ0FBQzs7TUFFN0M7TUFDQSxNQUFNRSxZQUFZLEdBQUdDLHlCQUF5QixDQUFFRixZQUFZLEVBQUVwRCxPQUFRLENBQUM7TUFDdkUsSUFBS3FELFlBQVksRUFBRztRQUVsQjVHLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRyxxQkFBb0IwRyxZQUFhLHFCQUFvQkMsWUFBYSxHQUFHLENBQUM7UUFDN0ZMLDZCQUE2QixFQUFFOztRQUUvQjtRQUNBLE1BQU10QixlQUFlLEdBQUcsSUFBSTdHLGFBQWEsQ0FBRXVJLFlBQVksQ0FBQ3pCLFFBQVEsQ0FBQ0MsV0FBVyxFQUFFeUIsWUFBWSxDQUFDMUIsUUFBUSxDQUFDQyxXQUFZLENBQUM7UUFDakgsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSWhILGFBQWEsQ0FBRXVJLFlBQVksQ0FBQ3pCLFFBQVEsQ0FBQ0csWUFBWSxFQUFFdUIsWUFBWSxDQUFDMUIsUUFBUSxDQUFDRyxZQUFhLENBQUM7UUFDcEgsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSWxILGFBQWEsQ0FBRXVJLFlBQVksQ0FBQ3pCLFFBQVEsQ0FBQ0ssYUFBYSxFQUFFcUIsWUFBWSxDQUFDMUIsUUFBUSxDQUFDSyxhQUFjLENBQUM7O1FBRXZIO1FBQ0EsS0FBTSxJQUFJVCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd2RyxXQUFXLEVBQUV1RyxDQUFDLEVBQUUsRUFBRztVQUV0QztVQUNBLE1BQU1XLGVBQWUsR0FBRztZQUN0QkMsZUFBZSxFQUFFVCxlQUFlLENBQUNVLE9BQU8sQ0FBRWIsQ0FBRSxDQUFDLENBQUNjLFlBQVk7WUFDMURDLGVBQWUsRUFBRVosZUFBZSxDQUFDVSxPQUFPLENBQUViLENBQUUsQ0FBQyxDQUFDZ0IsWUFBWTtZQUMxREMsZ0JBQWdCLEVBQUVYLGdCQUFnQixDQUFDTyxPQUFPLENBQUViLENBQUUsQ0FBQyxDQUFDYyxZQUFZO1lBQzVESSxnQkFBZ0IsRUFBRVosZ0JBQWdCLENBQUNPLE9BQU8sQ0FBRWIsQ0FBRSxDQUFDLENBQUNnQixZQUFZO1lBQzVERyxpQkFBaUIsRUFBRVgsaUJBQWlCLENBQUNLLE9BQU8sQ0FBRWIsQ0FBRSxDQUFDLENBQUNjLFlBQVk7WUFDOURNLGlCQUFpQixFQUFFWixpQkFBaUIsQ0FBQ0ssT0FBTyxDQUFFYixDQUFFLENBQUMsQ0FBQ2dCO1VBQ3BELENBQUM7O1VBRUQ7VUFDQSxJQUFJLENBQUMvRCxXQUFXLENBQUU7WUFDaEJLLE1BQU0sRUFBRXVFLFlBQVk7WUFDcEJ0RSxNQUFNLEVBQUV1RSxZQUFZO1lBQ3BCdEUsVUFBVSxFQUFFQSxVQUFVO1lBQ3RCbUQsZUFBZSxFQUFFQTtVQUNuQixDQUFFLENBQUM7VUFDSGUsVUFBVSxFQUFFO1FBQ2Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsTUFBTU0sWUFBWSxHQUFHSCxZQUFZLENBQUN6QixRQUFRLENBQUNtQixRQUFTO1FBQ3BEN0gsTUFBTSxJQUFJQSxNQUFNLENBQUVzSSxZQUFhLENBQUM7UUFDaEMsTUFBTUMsT0FBTyxHQUFHOUIsZUFBZSxDQUFDK0IsaUJBQWlCLENBQUVGLFlBQVksRUFBRSxJQUFJLENBQUM1SCxRQUFRLENBQUM2RSxPQUFPLENBQUNrRCxzQkFBc0IsQ0FBQzVGLEtBQU0sQ0FBQztRQUNySCxNQUFNNkYsUUFBUSxHQUFHOUIsZ0JBQWdCLENBQUM0QixpQkFBaUIsQ0FBRUYsWUFBWSxFQUFFLElBQUksQ0FBQzVILFFBQVEsQ0FBQ2dGLFFBQVEsQ0FBQytDLHNCQUFzQixDQUFDNUYsS0FBTSxDQUFDO1FBQ3hILE1BQU04RixTQUFTLEdBQUc3QixpQkFBaUIsQ0FBQzBCLGlCQUFpQixDQUFFRixZQUFZLEVBQUUsSUFBSSxDQUFDNUgsUUFBUSxDQUFDa0YsU0FBUyxDQUFDNkMsc0JBQXNCLENBQUM1RixLQUFNLENBQUM7UUFDM0gsTUFBTW9FLGVBQWUsR0FBRztVQUN0QkMsZUFBZSxFQUFFcUIsT0FBTyxDQUFDbkIsWUFBWTtVQUNyQ0MsZUFBZSxFQUFFa0IsT0FBTyxDQUFDakIsWUFBWTtVQUNyQ0MsZ0JBQWdCLEVBQUVtQixRQUFRLENBQUN0QixZQUFZO1VBQ3ZDSSxnQkFBZ0IsRUFBRWtCLFFBQVEsQ0FBQ3BCLFlBQVk7VUFDdkNHLGlCQUFpQixFQUFFa0IsU0FBUyxDQUFDdkIsWUFBWTtVQUN6Q00saUJBQWlCLEVBQUVpQixTQUFTLENBQUNyQjtRQUMvQixDQUFDO1FBQ0QsSUFBSSxDQUFDL0QsV0FBVyxDQUFFO1VBQ2hCSyxNQUFNLEVBQUV1RSxZQUFZO1VBQ3BCdEUsTUFBTSxFQUFFdUUsWUFBWTtVQUNwQnRFLFVBQVUsRUFBRUEsVUFBVTtVQUN0Qm1ELGVBQWUsRUFBRUE7UUFDbkIsQ0FBRSxDQUFDO1FBQ0hlLFVBQVUsRUFBRTs7UUFFWjtRQUNBakQsT0FBTyxDQUFDekMsTUFBTSxDQUFFeUMsT0FBTyxDQUFDMUMsT0FBTyxDQUFFOEYsWUFBYSxDQUFDLEVBQUUsQ0FBRSxDQUFDO1FBQ3BEcEQsT0FBTyxDQUFDekMsTUFBTSxDQUFFeUMsT0FBTyxDQUFDMUMsT0FBTyxDQUFFK0YsWUFBYSxDQUFDLEVBQUUsQ0FBRSxDQUFDOztRQUVwRDtRQUNBLE1BQU1RLGlCQUFpQixHQUFHLElBQUksQ0FBQzdILGdCQUFnQixDQUFDc0IsT0FBTyxDQUFFOEYsWUFBYSxDQUFDO1FBQ3ZFbkksTUFBTSxJQUFJQSxNQUFNLENBQUU0SSxpQkFBaUIsS0FBSyxDQUFDLENBQUMsRUFBRSxpREFBa0QsQ0FBQztRQUMvRixJQUFJLENBQUM3SCxnQkFBZ0IsQ0FBQ3VCLE1BQU0sQ0FBRXNHLGlCQUFpQixFQUFFLENBQUUsQ0FBQzs7UUFFcEQ7UUFDQTtRQUNBLE1BQU1DLGlCQUFpQixHQUFHLElBQUksQ0FBQzlILGdCQUFnQixDQUFDc0IsT0FBTyxDQUFFK0YsWUFBYSxDQUFDO1FBQ3ZFLElBQUtTLGlCQUFpQixLQUFLLENBQUMsQ0FBQyxFQUFHO1VBQzlCLElBQUksQ0FBQzlILGdCQUFnQixDQUFDdUIsTUFBTSxDQUFFdUcsaUJBQWlCLEVBQUUsQ0FBRSxDQUFDO1VBQ3BEZCw2QkFBNkIsRUFBRTtVQUUvQixNQUFNZSxxQkFBcUIsR0FBR2Isb0JBQW9CLENBQUM1RixPQUFPLENBQUUrRixZQUFhLENBQUM7VUFDMUUsSUFBS1UscUJBQXFCLEtBQUssQ0FBQyxDQUFDLEVBQUc7WUFDbENiLG9CQUFvQixDQUFDM0YsTUFBTSxDQUFFd0cscUJBQXFCLEVBQUUsQ0FBRSxDQUFDO1VBQ3pEO1FBQ0Y7UUFDQTlJLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUMsSUFBSSxDQUFDZSxnQkFBZ0IsQ0FBQ21DLFFBQVEsQ0FBRWtGLFlBQWEsQ0FBQyxFQUFFLGdEQUFpRCxDQUFDO1FBQ3JIcEksTUFBTSxJQUFJQSxNQUFNLENBQUUsQ0FBQ2lJLG9CQUFvQixDQUFDL0UsUUFBUSxDQUFFa0YsWUFBYSxDQUFDLEVBQUUsb0RBQXFELENBQUM7TUFDMUg7SUFDRjtJQUVBLElBQUtMLDZCQUE2QixHQUFHLENBQUMsRUFBRztNQUN2Q3ZHLElBQUksQ0FBQ0MsR0FBRyxJQUFJRCxJQUFJLENBQUNDLEdBQUcsQ0FBRyxHQUFFc0csNkJBQThCLDZDQUE0Q0MsVUFBVyxVQUFVLENBQUM7SUFDM0g7SUFFQSxPQUFPQSxVQUFVO0VBQ25COztFQUVBO0FBQ0Y7QUFDQTtFQUNTZSxtQkFBbUJBLENBQUEsRUFBUztJQUNqQyxJQUFJLENBQUNuSSxXQUFXLENBQUNxRCxPQUFPLENBQUVoQyxLQUFLLElBQUlBLEtBQUssQ0FBQytHLFlBQVksQ0FBQyxDQUFFLENBQUM7RUFDM0Q7O0VBRUE7QUFDRjtBQUNBO0VBQ1NDLHNCQUFzQkEsQ0FBQSxFQUFZO0lBQ3ZDLE9BQU85SixTQUFTLENBQUM2RixPQUFPLENBQUUsSUFBSSxDQUFDcEUsV0FBWSxDQUFDLENBQUMsQ0FBQztFQUNoRDs7RUFFQTtBQUNGO0FBQ0E7RUFDU3NJLGtCQUFrQkEsQ0FBQSxFQUFnQjtJQUN2QyxPQUFPLElBQUksQ0FBQ3RJLFdBQVcsQ0FBQ3VJLGNBQWMsQ0FBQ3RHLEtBQUs7RUFDOUM7O0VBRUE7QUFDRjtBQUNBO0VBQ1N1RyxzQkFBc0JBLENBQUEsRUFBVztJQUN0QyxPQUFPLElBQUksQ0FBQ3hJLFdBQVcsQ0FBQ08sTUFBTTtFQUNoQzs7RUFFQTtBQUNGO0FBQ0E7RUFDU2tJLHNCQUFzQkEsQ0FBQSxFQUFXO0lBQ3RDLE9BQU8sSUFBSSxDQUFDdkksV0FBVyxDQUFDSyxNQUFNO0VBQ2hDOztFQUVBO0FBQ0Y7QUFDQTtFQUNTbUksMkJBQTJCQSxDQUFBLEVBQVc7SUFDM0MsT0FBTyxJQUFJLENBQUN2SSxnQkFBZ0IsQ0FBQ0ksTUFBTTtFQUNyQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ1NvSSxnQkFBZ0JBLENBQUV6RixVQUFrQixFQUFTO0lBQ2xEOUQsTUFBTSxJQUFJQSxNQUFNLENBQUVGLHFCQUFxQixDQUFDMEosaUJBQWlCLENBQUUxRixVQUFXLENBQUMsRUFBRSxvQkFBcUIsQ0FBQztJQUUvRixJQUFJMkYsWUFBWSxHQUFHLENBQUM7O0lBRXBCO0lBQ0EsS0FBTSxJQUFJbkQsQ0FBQyxHQUFHLElBQUksQ0FBQ3hGLFdBQVcsQ0FBQ0ssTUFBTSxHQUFHLENBQUMsRUFBRW1GLENBQUMsSUFBSSxDQUFDLEVBQUVBLENBQUMsRUFBRSxFQUFHO01BQ3ZELE1BQU1yRSxLQUFLLEdBQUcsSUFBSSxDQUFDbkIsV0FBVyxDQUFFd0YsQ0FBQyxDQUFFO01BQ25DLElBQUt4QyxVQUFVLEdBQUc3QixLQUFLLENBQUM2QixVQUFVLEdBQUcxRCwwQkFBMEIsSUFDMUQsSUFBSSxDQUFDbUIscUJBQXFCLENBQUNzQixLQUFLLEtBQUtaLEtBQUssRUFBRztRQUNoRCxJQUFJLENBQUNYLFVBQVUsQ0FBQ29JLGNBQWMsQ0FBRXpILEtBQU0sQ0FBQztRQUN2Q2pDLE1BQU0sSUFBSUEsTUFBTSxDQUFFaUMsS0FBSyxDQUFDMEgsVUFBVSxFQUFFLDZCQUE4QixDQUFDO1FBQ25FRixZQUFZLEVBQUU7TUFDaEI7SUFDRjtJQUVBLElBQUtBLFlBQVksR0FBRyxDQUFDLEVBQUc7TUFDdEJqSSxJQUFJLENBQUNDLEdBQUcsSUFBSUQsSUFBSSxDQUFDQyxHQUFHLENBQUcsR0FBRWdJLFlBQWEsc0JBQXNCLENBQUM7SUFDL0Q7RUFDRjs7RUFFQTtBQUNGO0FBQ0E7RUFDVW5HLGlCQUFpQkEsQ0FBQSxFQUFTO0lBQ2hDLE1BQU1zRyxJQUFJLEdBQUcsSUFBSSxDQUFDaEosV0FBVyxDQUFDTyxNQUFNO0lBQ3BDLE1BQU0wSSxJQUFJLEdBQUcsSUFBSSxDQUFDL0ksV0FBVyxDQUFDSyxNQUFNO0lBQ3BDLE1BQU0ySSxLQUFLLEdBQUdGLElBQUksR0FBR0MsSUFBSTtJQUN6QixNQUFNRSxnQkFBZ0IsR0FBRyxJQUFJLENBQUN6SSxVQUFVLENBQUMwSSxLQUFLO0lBQzlDaEssTUFBTSxJQUFJQSxNQUFNLENBQUU0SixJQUFJLEdBQUdDLElBQUksS0FBS0MsS0FBSyxJQUFJQSxLQUFLLEtBQUtDLGdCQUFnQixFQUNsRSxzQ0FBcUNILElBQUssVUFBU0MsSUFBSyxXQUFVQyxLQUFNLHFCQUFvQkMsZ0JBQWlCLEVBQUUsQ0FBQztFQUNySDtBQUNGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTMUIseUJBQXlCQSxDQUFFekUsTUFBYSxFQUFFbUIsT0FBZ0IsRUFBaUI7RUFDbEYvRSxNQUFNLElBQUlBLE1BQU0sQ0FBRTRELE1BQU0sQ0FBQytELGdCQUFnQixDQUFDLENBQUMsRUFBRSxtQ0FBb0MsQ0FBQztFQUNsRjNILE1BQU0sSUFBSUEsTUFBTSxDQUFFNEQsTUFBTSxDQUFDOEMsUUFBUSxDQUFDbUIsUUFBUSxFQUFFLHFDQUFzQyxDQUFDO0VBRW5GLElBQUloRSxNQUFNLEdBQUcsSUFBSTtFQUNqQixLQUFNLElBQUl5QyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd2QixPQUFPLENBQUM1RCxNQUFNLElBQUksQ0FBQzBDLE1BQU0sRUFBRXlDLENBQUMsRUFBRSxFQUFHO0lBQ3BELE1BQU1yRSxLQUFLLEdBQUc4QyxPQUFPLENBQUV1QixDQUFDLENBQUU7SUFDMUIsSUFBS3JFLEtBQUssS0FBSzJCLE1BQU0sSUFBSTNCLEtBQUssQ0FBQ3lFLFFBQVEsQ0FBQ3VELFNBQVMsQ0FBRXJHLE1BQU0sQ0FBQzhDLFFBQVEsQ0FBQ21CLFFBQVMsQ0FBQyxFQUFHO01BQzlFaEUsTUFBTSxHQUFHNUIsS0FBSztJQUNoQjtFQUNGO0VBQ0EsT0FBTzRCLE1BQU07QUFDZjtBQUVBdEUsZ0JBQWdCLENBQUMySyxRQUFRLENBQUUsaUJBQWlCLEVBQUUzSixlQUFnQixDQUFDIn0=