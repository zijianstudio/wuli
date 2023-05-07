// Copyright 2019-2022, University of Colorado Boulder

/**
 * NaturalSelectionQueryParameters defines query parameters that are specific to this simulation.
 * Run with ?log to print these query parameters and their values to the browser console at startup.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Range from '../../../dot/js/Range.js';
import logGlobal from '../../../phet-core/js/logGlobal.js';
import naturalSelection from '../naturalSelection.js';
import NaturalSelectionUtils from './NaturalSelectionUtils.js';
const SCHEMA_MAP = {
  //------------------------------------------------------------------------------------------------------------------
  // Public facing
  //------------------------------------------------------------------------------------------------------------------

  // Determines whether allele abbreviations are visible in the UI. Setting this to false hides the Pedigree 'Alleles'
  // panel, makes the Pedigree graph wider, and allele abbreviations will not be shown in the Pedigree graph.
  allelesVisible: {
    type: 'boolean',
    defaultValue: true,
    public: true
  },
  // Specifies the mutations that appear in the initial population of bunnies for the Intro screen.
  // See documentation for labMutations.
  introMutations: {
    type: 'string',
    defaultValue: '',
    public: true
  },
  // Specifies the initial population of bunnies for the Intro screen.
  // See documentation for labPopulation.
  introPopulation: {
    type: 'array',
    elementSchema: {
      type: 'string'
    },
    defaultValue: ['1'],
    public: true
  },
  // Specifies the mutations that appear in the initial population of bunnies for the Lab screen.
  // See https://github.com/phetsims/natural-selection/issues/9 for design history and specification.
  //
  // The value determines which mutant alleles are present, whether they are dominant or recessive,
  // and which allele abbreviations can appear in the labPopulation query-parameter value.
  //
  // Valid characters for the mutations are as follows:
  //
  //   Mutation       Dominant   Recessive
  //   -----------------------------------
  //   Brown Fur         F           f
  //   Floppy Ears       E           e
  //   Long Teeth        T           t
  //
  // The value may contain characters for one or more mutations. Each mutation may appear only once.
  //
  // Valid examples:
  //   labMutations=F
  //   labMutations=f
  //   labMutations=fTe
  //
  // Invalid examples:
  //   labMutations=FfEt - fur mutation appears twice ('F' and 'f')
  //   labMutations=Fx - 'x' is not a valid character
  //
  // NOTE: PhET-iO allows you to show/hide any of the 3 genes in both screens. It is up to the user to specify
  // only the genes that are visible for the screen. For example, the sim will happily accept 'labMutations=FeT',
  // then allow you to hide Fur in the Lab screen.  Or it will accept 'introMutations=T' and assume that PhET-iO
  // will be making Teeth visible in the Intro screen.
  //
  // NOTE: Allele abbreviations are (by design) not translated in query parameters. If you are using a translated
  // version of the sim, you must use the English allele abbreviations in query parameters.
  //
  labMutations: {
    type: 'string',
    defaultValue: '',
    public: true
  },
  // Specifies the genotypes and their distribution in the initial population for the Lab screen.
  // See https://github.com/phetsims/natural-selection/issues/9 for design history and specification.
  //
  // The value of labMutations determines which allele abbreviations can appear in this query parameter's value.
  // If a mutation is present in the labMutations query parameter, then the dominant and/or recessive abbreviations
  // for that allele must appear exactly twice in labPopulation.
  //
  // Related alleles must appear in pairs. The first allele in the pair is the 'father' allele, the second allele is
  // the 'mother' allele. In the Pedigree graph, the father is on the left, the mother is on the right. So for example,
  // 'Ff' and 'fF' result in a different genotype.
  //
  // If labMutations is omitted, then labPopulation must be a positive integer that indicates how many bunnies
  // are in the initial population. Those bunnies will all have normal alleles.
  //
  // Valid examples:
  //   labMutations=F&labPopulation=5FF
  //   labMutations=F&labPopulation=5FF,5Ff,5ff
  //   labMutations=FeT&labPopulation=5FFeETt
  //   labMutations=FeT&labPopulation=5FFeETt,5ffeett
  //   labPopulation=10 - initial population of 10 bunnies with normal alleles
  //
  // Invalid examples:
  //   labMutations=FE&labPopulation=FfEe - missing count
  //   labMutations=FE&labPopulation=10FEfe - related alleles are not paired, should be 10FfEe
  //   labMutations=F&labPopulation=20FfEe - Ears ('E', 'e') does not appear in labMutations
  //   labMutations=FE&labPopulation=10Ff - Ears ('E', 'e') is missing from labPopulation
  //   labMutations=FE&labPopulation=10FEe - 'F' is invalid, fur must appear exactly twice
  //   labMutations=F&labPopulation=10FfFEe - 'FfF' is invalid, fur must appear exactly twice
  //   labMutations=F&labPopulation=10FFx - 'x' is not a valid character
  //   labMutations=F&labPopulations=10 - missing mutations in labPopulations
  //
  labPopulation: {
    type: 'array',
    elementSchema: {
      type: 'string'
    },
    defaultValue: ['1'],
    public: true
  },
  //------------------------------------------------------------------------------------------------------------------
  // For internal use only
  //------------------------------------------------------------------------------------------------------------------

  // Seconds of real time per cycle of the generation clock. This is useful for development and testing, because
  // life is too short to sit around waiting for bunnies to die or take over the world.
  secondsPerGeneration: {
    type: 'number',
    defaultValue: 10,
    isValidValue: value => value > 0
  },
  // Scale time by this much while the fast-forward button is pressed.
  // Tuned in https://github.com/phetsims/natural-selection/issues/100
  fastForwardScale: {
    type: 'number',
    defaultValue: 4,
    isValidValue: value => value >= 1
  },
  // Maximum number of generations before the sim stops and displays MemoryLimitDialog.
  // Tuned in https://github.com/phetsims/natural-selection/issues/46
  maxGenerations: {
    type: 'number',
    defaultValue: 1000,
    isValidValue: value => value > 0
  },
  // The number of bunnies required to 'take over the world'. Careful, because all bunnies are allowed to mate before
  // this value is checked, so the population could get ridiculously large.
  // Tuned in https://github.com/phetsims/natural-selection/issues/75
  maxPopulation: {
    type: 'number',
    defaultValue: 750,
    isValidValue: value => NaturalSelectionUtils.isPositiveInteger(value)
  },
  // Age at which bunnies die of old-age.
  maxAge: {
    type: 'number',
    defaultValue: 5,
    // Java version value is 5
    isValidValue: value => NaturalSelectionUtils.isPositiveInteger(value)
  },
  // Percentage of newborn bunnies that will receive a mutation.
  // Symmetric rounding is used, and at least 1 bunny will receive the mutation.
  mutationPercentage: {
    type: 'number',
    // from the Java version, see MUTATING_BUNNY_PER_BUNNIES in NaturalSelectionDefaults.java
    defaultValue: 1 / 7,
    // All 3 mutations can be applied simultaneously. Mutation is mutually-exclusive by gene. A bunny can have at
    // most 1 mutation. And we have 3 mutations, for fur, ears, and teeth. So at most 1/3 of the population can get a
    // specific mutation.
    isValidValue: value => value > 0 && value <= 1 / 3
  },
  // The random percentage of bunnies that will be eaten by wolves. See WolfCollection.eatBunnies.
  // Tuned in https://github.com/phetsims/natural-selection/issues/86
  wolvesPercentToEatRange: {
    type: 'custom',
    parse: parseRange,
    defaultValue: new Range(0.35, 0.4),
    isValidValue: range => NaturalSelectionUtils.isPercentRange(range)
  },
  // Multiplier for when the bunny's fur color does not match the environment. See WolfCollection.eatBunnies.
  // Tuned in https://github.com/phetsims/natural-selection/issues/86
  wolvesEnvironmentMultiplier: {
    type: 'number',
    defaultValue: 2.3,
    isValidValue: value => value > 1
  },
  // The random percentage of bunnies that will die of starvation when food is tough. See Food.starveBunnies.
  // Tuned in https://github.com/phetsims/natural-selection/issues/86
  toughFoodPercentToStarveRange: {
    type: 'custom',
    parse: parseRange,
    defaultValue: new Range(0.4, 0.45),
    isValidValue: range => NaturalSelectionUtils.isPercentRange(range)
  },
  // Multiplier for bunnies with short teeth when food is tough. See Food.starveBunnies.
  // Tuned in https://github.com/phetsims/natural-selection/issues/86
  shortTeethMultiplier: {
    type: 'number',
    defaultValue: 2,
    isValidValue: value => value > 1
  },
  // Range for the number of bunnies that can be sustained on limited food (carrying capacity). See Food.starveBunnies.
  limitedFoodPopulationRange: {
    type: 'custom',
    parse: parseRange,
    defaultValue: new Range(90, 110),
    isValidValue: range => range.min > 0 && range.min < range.max
  },
  // Specifies the number of shrubs to show for limited (min) and abundant (max) food.
  shrubsRange: {
    type: 'custom',
    parse: parseRange,
    defaultValue: new Range(10, 75),
    isValidValue: range => range.min > 0 && range.max > range.min
  },
  // Adds a red dot at the origin of some objects (bunnies, wolves, food)
  showOrigin: {
    type: 'flag'
  },
  // Draws a red line where the horizon is located
  showHorizon: {
    type: 'flag'
  },
  // Displays time profiling in the upper-left corner of the screen. This was used for performance profiling
  // and may be useful in the future. See https://github.com/phetsims/natural-selection/issues/60 and
  // https://github.com/phetsims/natural-selection/issues/140.
  showTimes: {
    type: 'flag'
  }
};
const NaturalSelectionQueryParameters = QueryStringMachine.getAll(SCHEMA_MAP);

/**
 * Parses a query-parameter value into a Range.
 */
function parseRange(value) {
  const tokens = value.split(',');
  assert && assert(tokens.length === 2, `range format is min,max: ${value}`);
  assert && assert(_.every(tokens, token => isFinite(Number(token))), `range must be 2 numbers: ${value}`);
  const numbers = _.map(tokens, token => Number(token));
  return new Range(numbers[0], numbers[1]);
}

// validate query parameters
assert && assert(NaturalSelectionQueryParameters.wolvesEnvironmentMultiplier * NaturalSelectionQueryParameters.wolvesPercentToEatRange.max <= 1, 'wolvesEnvironmentMultiplier * wolvesPercentToEatRange.max must be <= 1');

// Tweaking the parameters for tough food required that we clamp this computation to 1. This warning is a reminder.
// See https://github.com/phetsims/natural-selection/issues/168#issuecomment-673048314
if (NaturalSelectionQueryParameters.shortTeethMultiplier * NaturalSelectionQueryParameters.toughFoodPercentToStarveRange.max > 1) {
  phet.log && phet.log('WARNING: shortTeethMultiplier * toughFoodPercentToStarveRange.max > 1, and will be clamped to 1');
}
naturalSelection.register('NaturalSelectionQueryParameters', NaturalSelectionQueryParameters);

// Log query parameters
logGlobal('phet.chipper.queryParameters');
logGlobal('phet.preloads.phetio.queryParameters');
logGlobal('phet.naturalSelection.NaturalSelectionQueryParameters');
export default NaturalSelectionQueryParameters;
export { SCHEMA_MAP };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSYW5nZSIsImxvZ0dsb2JhbCIsIm5hdHVyYWxTZWxlY3Rpb24iLCJOYXR1cmFsU2VsZWN0aW9uVXRpbHMiLCJTQ0hFTUFfTUFQIiwiYWxsZWxlc1Zpc2libGUiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwicHVibGljIiwiaW50cm9NdXRhdGlvbnMiLCJpbnRyb1BvcHVsYXRpb24iLCJlbGVtZW50U2NoZW1hIiwibGFiTXV0YXRpb25zIiwibGFiUG9wdWxhdGlvbiIsInNlY29uZHNQZXJHZW5lcmF0aW9uIiwiaXNWYWxpZFZhbHVlIiwidmFsdWUiLCJmYXN0Rm9yd2FyZFNjYWxlIiwibWF4R2VuZXJhdGlvbnMiLCJtYXhQb3B1bGF0aW9uIiwiaXNQb3NpdGl2ZUludGVnZXIiLCJtYXhBZ2UiLCJtdXRhdGlvblBlcmNlbnRhZ2UiLCJ3b2x2ZXNQZXJjZW50VG9FYXRSYW5nZSIsInBhcnNlIiwicGFyc2VSYW5nZSIsInJhbmdlIiwiaXNQZXJjZW50UmFuZ2UiLCJ3b2x2ZXNFbnZpcm9ubWVudE11bHRpcGxpZXIiLCJ0b3VnaEZvb2RQZXJjZW50VG9TdGFydmVSYW5nZSIsInNob3J0VGVldGhNdWx0aXBsaWVyIiwibGltaXRlZEZvb2RQb3B1bGF0aW9uUmFuZ2UiLCJtaW4iLCJtYXgiLCJzaHJ1YnNSYW5nZSIsInNob3dPcmlnaW4iLCJzaG93SG9yaXpvbiIsInNob3dUaW1lcyIsIk5hdHVyYWxTZWxlY3Rpb25RdWVyeVBhcmFtZXRlcnMiLCJRdWVyeVN0cmluZ01hY2hpbmUiLCJnZXRBbGwiLCJ0b2tlbnMiLCJzcGxpdCIsImFzc2VydCIsImxlbmd0aCIsIl8iLCJldmVyeSIsInRva2VuIiwiaXNGaW5pdGUiLCJOdW1iZXIiLCJudW1iZXJzIiwibWFwIiwicGhldCIsImxvZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzIGRlZmluZXMgcXVlcnkgcGFyYW1ldGVycyB0aGF0IGFyZSBzcGVjaWZpYyB0byB0aGlzIHNpbXVsYXRpb24uXHJcbiAqIFJ1biB3aXRoID9sb2cgdG8gcHJpbnQgdGhlc2UgcXVlcnkgcGFyYW1ldGVycyBhbmQgdGhlaXIgdmFsdWVzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUgYXQgc3RhcnR1cC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IGxvZ0dsb2JhbCBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbG9nR2xvYmFsLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBOYXR1cmFsU2VsZWN0aW9uVXRpbHMgZnJvbSAnLi9OYXR1cmFsU2VsZWN0aW9uVXRpbHMuanMnO1xyXG5cclxuY29uc3QgU0NIRU1BX01BUCA9IHtcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyBQdWJsaWMgZmFjaW5nXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIGFsbGVsZSBhYmJyZXZpYXRpb25zIGFyZSB2aXNpYmxlIGluIHRoZSBVSS4gU2V0dGluZyB0aGlzIHRvIGZhbHNlIGhpZGVzIHRoZSBQZWRpZ3JlZSAnQWxsZWxlcydcclxuICAvLyBwYW5lbCwgbWFrZXMgdGhlIFBlZGlncmVlIGdyYXBoIHdpZGVyLCBhbmQgYWxsZWxlIGFiYnJldmlhdGlvbnMgd2lsbCBub3QgYmUgc2hvd24gaW4gdGhlIFBlZGlncmVlIGdyYXBoLlxyXG4gIGFsbGVsZXNWaXNpYmxlOiB7XHJcbiAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBTcGVjaWZpZXMgdGhlIG11dGF0aW9ucyB0aGF0IGFwcGVhciBpbiB0aGUgaW5pdGlhbCBwb3B1bGF0aW9uIG9mIGJ1bm5pZXMgZm9yIHRoZSBJbnRybyBzY3JlZW4uXHJcbiAgLy8gU2VlIGRvY3VtZW50YXRpb24gZm9yIGxhYk11dGF0aW9ucy5cclxuICBpbnRyb011dGF0aW9uczoge1xyXG4gICAgdHlwZTogJ3N0cmluZycsXHJcbiAgICBkZWZhdWx0VmFsdWU6ICcnLFxyXG4gICAgcHVibGljOiB0cnVlXHJcbiAgfSxcclxuXHJcbiAgLy8gU3BlY2lmaWVzIHRoZSBpbml0aWFsIHBvcHVsYXRpb24gb2YgYnVubmllcyBmb3IgdGhlIEludHJvIHNjcmVlbi5cclxuICAvLyBTZWUgZG9jdW1lbnRhdGlvbiBmb3IgbGFiUG9wdWxhdGlvbi5cclxuICBpbnRyb1BvcHVsYXRpb246IHtcclxuICAgIHR5cGU6ICdhcnJheScsXHJcbiAgICBlbGVtZW50U2NoZW1hOiB7XHJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXHJcbiAgICB9LFxyXG4gICAgZGVmYXVsdFZhbHVlOiBbICcxJyBdLFxyXG4gICAgcHVibGljOiB0cnVlXHJcbiAgfSxcclxuXHJcbiAgLy8gU3BlY2lmaWVzIHRoZSBtdXRhdGlvbnMgdGhhdCBhcHBlYXIgaW4gdGhlIGluaXRpYWwgcG9wdWxhdGlvbiBvZiBidW5uaWVzIGZvciB0aGUgTGFiIHNjcmVlbi5cclxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy85IGZvciBkZXNpZ24gaGlzdG9yeSBhbmQgc3BlY2lmaWNhdGlvbi5cclxuICAvL1xyXG4gIC8vIFRoZSB2YWx1ZSBkZXRlcm1pbmVzIHdoaWNoIG11dGFudCBhbGxlbGVzIGFyZSBwcmVzZW50LCB3aGV0aGVyIHRoZXkgYXJlIGRvbWluYW50IG9yIHJlY2Vzc2l2ZSxcclxuICAvLyBhbmQgd2hpY2ggYWxsZWxlIGFiYnJldmlhdGlvbnMgY2FuIGFwcGVhciBpbiB0aGUgbGFiUG9wdWxhdGlvbiBxdWVyeS1wYXJhbWV0ZXIgdmFsdWUuXHJcbiAgLy9cclxuICAvLyBWYWxpZCBjaGFyYWN0ZXJzIGZvciB0aGUgbXV0YXRpb25zIGFyZSBhcyBmb2xsb3dzOlxyXG4gIC8vXHJcbiAgLy8gICBNdXRhdGlvbiAgICAgICBEb21pbmFudCAgIFJlY2Vzc2l2ZVxyXG4gIC8vICAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAvLyAgIEJyb3duIEZ1ciAgICAgICAgIEYgICAgICAgICAgIGZcclxuICAvLyAgIEZsb3BweSBFYXJzICAgICAgIEUgICAgICAgICAgIGVcclxuICAvLyAgIExvbmcgVGVldGggICAgICAgIFQgICAgICAgICAgIHRcclxuICAvL1xyXG4gIC8vIFRoZSB2YWx1ZSBtYXkgY29udGFpbiBjaGFyYWN0ZXJzIGZvciBvbmUgb3IgbW9yZSBtdXRhdGlvbnMuIEVhY2ggbXV0YXRpb24gbWF5IGFwcGVhciBvbmx5IG9uY2UuXHJcbiAgLy9cclxuICAvLyBWYWxpZCBleGFtcGxlczpcclxuICAvLyAgIGxhYk11dGF0aW9ucz1GXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9ZlxyXG4gIC8vICAgbGFiTXV0YXRpb25zPWZUZVxyXG4gIC8vXHJcbiAgLy8gSW52YWxpZCBleGFtcGxlczpcclxuICAvLyAgIGxhYk11dGF0aW9ucz1GZkV0IC0gZnVyIG11dGF0aW9uIGFwcGVhcnMgdHdpY2UgKCdGJyBhbmQgJ2YnKVxyXG4gIC8vICAgbGFiTXV0YXRpb25zPUZ4IC0gJ3gnIGlzIG5vdCBhIHZhbGlkIGNoYXJhY3RlclxyXG4gIC8vXHJcbiAgLy8gTk9URTogUGhFVC1pTyBhbGxvd3MgeW91IHRvIHNob3cvaGlkZSBhbnkgb2YgdGhlIDMgZ2VuZXMgaW4gYm90aCBzY3JlZW5zLiBJdCBpcyB1cCB0byB0aGUgdXNlciB0byBzcGVjaWZ5XHJcbiAgLy8gb25seSB0aGUgZ2VuZXMgdGhhdCBhcmUgdmlzaWJsZSBmb3IgdGhlIHNjcmVlbi4gRm9yIGV4YW1wbGUsIHRoZSBzaW0gd2lsbCBoYXBwaWx5IGFjY2VwdCAnbGFiTXV0YXRpb25zPUZlVCcsXHJcbiAgLy8gdGhlbiBhbGxvdyB5b3UgdG8gaGlkZSBGdXIgaW4gdGhlIExhYiBzY3JlZW4uICBPciBpdCB3aWxsIGFjY2VwdCAnaW50cm9NdXRhdGlvbnM9VCcgYW5kIGFzc3VtZSB0aGF0IFBoRVQtaU9cclxuICAvLyB3aWxsIGJlIG1ha2luZyBUZWV0aCB2aXNpYmxlIGluIHRoZSBJbnRybyBzY3JlZW4uXHJcbiAgLy9cclxuICAvLyBOT1RFOiBBbGxlbGUgYWJicmV2aWF0aW9ucyBhcmUgKGJ5IGRlc2lnbikgbm90IHRyYW5zbGF0ZWQgaW4gcXVlcnkgcGFyYW1ldGVycy4gSWYgeW91IGFyZSB1c2luZyBhIHRyYW5zbGF0ZWRcclxuICAvLyB2ZXJzaW9uIG9mIHRoZSBzaW0sIHlvdSBtdXN0IHVzZSB0aGUgRW5nbGlzaCBhbGxlbGUgYWJicmV2aWF0aW9ucyBpbiBxdWVyeSBwYXJhbWV0ZXJzLlxyXG4gIC8vXHJcbiAgbGFiTXV0YXRpb25zOiB7XHJcbiAgICB0eXBlOiAnc3RyaW5nJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogJycsXHJcbiAgICBwdWJsaWM6IHRydWVcclxuICB9LFxyXG5cclxuICAvLyBTcGVjaWZpZXMgdGhlIGdlbm90eXBlcyBhbmQgdGhlaXIgZGlzdHJpYnV0aW9uIGluIHRoZSBpbml0aWFsIHBvcHVsYXRpb24gZm9yIHRoZSBMYWIgc2NyZWVuLlxyXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzkgZm9yIGRlc2lnbiBoaXN0b3J5IGFuZCBzcGVjaWZpY2F0aW9uLlxyXG4gIC8vXHJcbiAgLy8gVGhlIHZhbHVlIG9mIGxhYk11dGF0aW9ucyBkZXRlcm1pbmVzIHdoaWNoIGFsbGVsZSBhYmJyZXZpYXRpb25zIGNhbiBhcHBlYXIgaW4gdGhpcyBxdWVyeSBwYXJhbWV0ZXIncyB2YWx1ZS5cclxuICAvLyBJZiBhIG11dGF0aW9uIGlzIHByZXNlbnQgaW4gdGhlIGxhYk11dGF0aW9ucyBxdWVyeSBwYXJhbWV0ZXIsIHRoZW4gdGhlIGRvbWluYW50IGFuZC9vciByZWNlc3NpdmUgYWJicmV2aWF0aW9uc1xyXG4gIC8vIGZvciB0aGF0IGFsbGVsZSBtdXN0IGFwcGVhciBleGFjdGx5IHR3aWNlIGluIGxhYlBvcHVsYXRpb24uXHJcbiAgLy9cclxuICAvLyBSZWxhdGVkIGFsbGVsZXMgbXVzdCBhcHBlYXIgaW4gcGFpcnMuIFRoZSBmaXJzdCBhbGxlbGUgaW4gdGhlIHBhaXIgaXMgdGhlICdmYXRoZXInIGFsbGVsZSwgdGhlIHNlY29uZCBhbGxlbGUgaXNcclxuICAvLyB0aGUgJ21vdGhlcicgYWxsZWxlLiBJbiB0aGUgUGVkaWdyZWUgZ3JhcGgsIHRoZSBmYXRoZXIgaXMgb24gdGhlIGxlZnQsIHRoZSBtb3RoZXIgaXMgb24gdGhlIHJpZ2h0LiBTbyBmb3IgZXhhbXBsZSxcclxuICAvLyAnRmYnIGFuZCAnZkYnIHJlc3VsdCBpbiBhIGRpZmZlcmVudCBnZW5vdHlwZS5cclxuICAvL1xyXG4gIC8vIElmIGxhYk11dGF0aW9ucyBpcyBvbWl0dGVkLCB0aGVuIGxhYlBvcHVsYXRpb24gbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIgdGhhdCBpbmRpY2F0ZXMgaG93IG1hbnkgYnVubmllc1xyXG4gIC8vIGFyZSBpbiB0aGUgaW5pdGlhbCBwb3B1bGF0aW9uLiBUaG9zZSBidW5uaWVzIHdpbGwgYWxsIGhhdmUgbm9ybWFsIGFsbGVsZXMuXHJcbiAgLy9cclxuICAvLyBWYWxpZCBleGFtcGxlczpcclxuICAvLyAgIGxhYk11dGF0aW9ucz1GJmxhYlBvcHVsYXRpb249NUZGXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RiZsYWJQb3B1bGF0aW9uPTVGRiw1RmYsNWZmXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RmVUJmxhYlBvcHVsYXRpb249NUZGZUVUdFxyXG4gIC8vICAgbGFiTXV0YXRpb25zPUZlVCZsYWJQb3B1bGF0aW9uPTVGRmVFVHQsNWZmZWV0dFxyXG4gIC8vICAgbGFiUG9wdWxhdGlvbj0xMCAtIGluaXRpYWwgcG9wdWxhdGlvbiBvZiAxMCBidW5uaWVzIHdpdGggbm9ybWFsIGFsbGVsZXNcclxuICAvL1xyXG4gIC8vIEludmFsaWQgZXhhbXBsZXM6XHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RkUmbGFiUG9wdWxhdGlvbj1GZkVlIC0gbWlzc2luZyBjb3VudFxyXG4gIC8vICAgbGFiTXV0YXRpb25zPUZFJmxhYlBvcHVsYXRpb249MTBGRWZlIC0gcmVsYXRlZCBhbGxlbGVzIGFyZSBub3QgcGFpcmVkLCBzaG91bGQgYmUgMTBGZkVlXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RiZsYWJQb3B1bGF0aW9uPTIwRmZFZSAtIEVhcnMgKCdFJywgJ2UnKSBkb2VzIG5vdCBhcHBlYXIgaW4gbGFiTXV0YXRpb25zXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RkUmbGFiUG9wdWxhdGlvbj0xMEZmIC0gRWFycyAoJ0UnLCAnZScpIGlzIG1pc3NpbmcgZnJvbSBsYWJQb3B1bGF0aW9uXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RkUmbGFiUG9wdWxhdGlvbj0xMEZFZSAtICdGJyBpcyBpbnZhbGlkLCBmdXIgbXVzdCBhcHBlYXIgZXhhY3RseSB0d2ljZVxyXG4gIC8vICAgbGFiTXV0YXRpb25zPUYmbGFiUG9wdWxhdGlvbj0xMEZmRkVlIC0gJ0ZmRicgaXMgaW52YWxpZCwgZnVyIG11c3QgYXBwZWFyIGV4YWN0bHkgdHdpY2VcclxuICAvLyAgIGxhYk11dGF0aW9ucz1GJmxhYlBvcHVsYXRpb249MTBGRnggLSAneCcgaXMgbm90IGEgdmFsaWQgY2hhcmFjdGVyXHJcbiAgLy8gICBsYWJNdXRhdGlvbnM9RiZsYWJQb3B1bGF0aW9ucz0xMCAtIG1pc3NpbmcgbXV0YXRpb25zIGluIGxhYlBvcHVsYXRpb25zXHJcbiAgLy9cclxuICBsYWJQb3B1bGF0aW9uOiB7XHJcbiAgICB0eXBlOiAnYXJyYXknLFxyXG4gICAgZWxlbWVudFNjaGVtYToge1xyXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xyXG4gICAgfSxcclxuICAgIGRlZmF1bHRWYWx1ZTogWyAnMScgXSxcclxuICAgIHB1YmxpYzogdHJ1ZVxyXG4gIH0sXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgLy8gRm9yIGludGVybmFsIHVzZSBvbmx5XHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgLy8gU2Vjb25kcyBvZiByZWFsIHRpbWUgcGVyIGN5Y2xlIG9mIHRoZSBnZW5lcmF0aW9uIGNsb2NrLiBUaGlzIGlzIHVzZWZ1bCBmb3IgZGV2ZWxvcG1lbnQgYW5kIHRlc3RpbmcsIGJlY2F1c2VcclxuICAvLyBsaWZlIGlzIHRvbyBzaG9ydCB0byBzaXQgYXJvdW5kIHdhaXRpbmcgZm9yIGJ1bm5pZXMgdG8gZGllIG9yIHRha2Ugb3ZlciB0aGUgd29ybGQuXHJcbiAgc2Vjb25kc1BlckdlbmVyYXRpb246IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAxMCxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gKCB2YWx1ZSA+IDAgKVxyXG4gIH0sXHJcblxyXG4gIC8vIFNjYWxlIHRpbWUgYnkgdGhpcyBtdWNoIHdoaWxlIHRoZSBmYXN0LWZvcndhcmQgYnV0dG9uIGlzIHByZXNzZWQuXHJcbiAgLy8gVHVuZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy8xMDBcclxuICBmYXN0Rm9yd2FyZFNjYWxlOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogNCxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gKCB2YWx1ZSA+PSAxIClcclxuICB9LFxyXG5cclxuICAvLyBNYXhpbXVtIG51bWJlciBvZiBnZW5lcmF0aW9ucyBiZWZvcmUgdGhlIHNpbSBzdG9wcyBhbmQgZGlzcGxheXMgTWVtb3J5TGltaXREaWFsb2cuXHJcbiAgLy8gVHVuZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy80NlxyXG4gIG1heEdlbmVyYXRpb25zOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMTAwMCxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCB2YWx1ZTogbnVtYmVyICkgPT4gKCB2YWx1ZSA+IDAgKVxyXG4gIH0sXHJcblxyXG4gIC8vIFRoZSBudW1iZXIgb2YgYnVubmllcyByZXF1aXJlZCB0byAndGFrZSBvdmVyIHRoZSB3b3JsZCcuIENhcmVmdWwsIGJlY2F1c2UgYWxsIGJ1bm5pZXMgYXJlIGFsbG93ZWQgdG8gbWF0ZSBiZWZvcmVcclxuICAvLyB0aGlzIHZhbHVlIGlzIGNoZWNrZWQsIHNvIHRoZSBwb3B1bGF0aW9uIGNvdWxkIGdldCByaWRpY3Vsb3VzbHkgbGFyZ2UuXHJcbiAgLy8gVHVuZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL25hdHVyYWwtc2VsZWN0aW9uL2lzc3Vlcy83NVxyXG4gIG1heFBvcHVsYXRpb246IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiA3NTAsXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IE5hdHVyYWxTZWxlY3Rpb25VdGlscy5pc1Bvc2l0aXZlSW50ZWdlciggdmFsdWUgKVxyXG4gIH0sXHJcblxyXG4gIC8vIEFnZSBhdCB3aGljaCBidW5uaWVzIGRpZSBvZiBvbGQtYWdlLlxyXG4gIG1heEFnZToge1xyXG4gICAgdHlwZTogJ251bWJlcicsXHJcbiAgICBkZWZhdWx0VmFsdWU6IDUsIC8vIEphdmEgdmVyc2lvbiB2YWx1ZSBpcyA1XHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+IE5hdHVyYWxTZWxlY3Rpb25VdGlscy5pc1Bvc2l0aXZlSW50ZWdlciggdmFsdWUgKVxyXG4gIH0sXHJcblxyXG4gIC8vIFBlcmNlbnRhZ2Ugb2YgbmV3Ym9ybiBidW5uaWVzIHRoYXQgd2lsbCByZWNlaXZlIGEgbXV0YXRpb24uXHJcbiAgLy8gU3ltbWV0cmljIHJvdW5kaW5nIGlzIHVzZWQsIGFuZCBhdCBsZWFzdCAxIGJ1bm55IHdpbGwgcmVjZWl2ZSB0aGUgbXV0YXRpb24uXHJcbiAgbXV0YXRpb25QZXJjZW50YWdlOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuXHJcbiAgICAvLyBmcm9tIHRoZSBKYXZhIHZlcnNpb24sIHNlZSBNVVRBVElOR19CVU5OWV9QRVJfQlVOTklFUyBpbiBOYXR1cmFsU2VsZWN0aW9uRGVmYXVsdHMuamF2YVxyXG4gICAgZGVmYXVsdFZhbHVlOiAxIC8gNyxcclxuXHJcbiAgICAvLyBBbGwgMyBtdXRhdGlvbnMgY2FuIGJlIGFwcGxpZWQgc2ltdWx0YW5lb3VzbHkuIE11dGF0aW9uIGlzIG11dHVhbGx5LWV4Y2x1c2l2ZSBieSBnZW5lLiBBIGJ1bm55IGNhbiBoYXZlIGF0XHJcbiAgICAvLyBtb3N0IDEgbXV0YXRpb24uIEFuZCB3ZSBoYXZlIDMgbXV0YXRpb25zLCBmb3IgZnVyLCBlYXJzLCBhbmQgdGVldGguIFNvIGF0IG1vc3QgMS8zIG9mIHRoZSBwb3B1bGF0aW9uIGNhbiBnZXQgYVxyXG4gICAgLy8gc3BlY2lmaWMgbXV0YXRpb24uXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggdmFsdWU6IG51bWJlciApID0+ICggdmFsdWUgPiAwICYmIHZhbHVlIDw9IDEgLyAzIClcclxuICB9LFxyXG5cclxuICAvLyBUaGUgcmFuZG9tIHBlcmNlbnRhZ2Ugb2YgYnVubmllcyB0aGF0IHdpbGwgYmUgZWF0ZW4gYnkgd29sdmVzLiBTZWUgV29sZkNvbGxlY3Rpb24uZWF0QnVubmllcy5cclxuICAvLyBUdW5lZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzg2XHJcbiAgd29sdmVzUGVyY2VudFRvRWF0UmFuZ2U6IHtcclxuICAgIHR5cGU6ICdjdXN0b20nLFxyXG4gICAgcGFyc2U6IHBhcnNlUmFuZ2UsXHJcbiAgICBkZWZhdWx0VmFsdWU6IG5ldyBSYW5nZSggMC4zNSwgMC40ICksXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggcmFuZ2U6IFJhbmdlICkgPT4gTmF0dXJhbFNlbGVjdGlvblV0aWxzLmlzUGVyY2VudFJhbmdlKCByYW5nZSApXHJcbiAgfSxcclxuXHJcbiAgLy8gTXVsdGlwbGllciBmb3Igd2hlbiB0aGUgYnVubnkncyBmdXIgY29sb3IgZG9lcyBub3QgbWF0Y2ggdGhlIGVudmlyb25tZW50LiBTZWUgV29sZkNvbGxlY3Rpb24uZWF0QnVubmllcy5cclxuICAvLyBUdW5lZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzg2XHJcbiAgd29sdmVzRW52aXJvbm1lbnRNdWx0aXBsaWVyOiB7XHJcbiAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgIGRlZmF1bHRWYWx1ZTogMi4zLFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiAoIHZhbHVlID4gMSApXHJcbiAgfSxcclxuXHJcbiAgLy8gVGhlIHJhbmRvbSBwZXJjZW50YWdlIG9mIGJ1bm5pZXMgdGhhdCB3aWxsIGRpZSBvZiBzdGFydmF0aW9uIHdoZW4gZm9vZCBpcyB0b3VnaC4gU2VlIEZvb2Quc3RhcnZlQnVubmllcy5cclxuICAvLyBUdW5lZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzg2XHJcbiAgdG91Z2hGb29kUGVyY2VudFRvU3RhcnZlUmFuZ2U6IHtcclxuICAgIHR5cGU6ICdjdXN0b20nLFxyXG4gICAgcGFyc2U6IHBhcnNlUmFuZ2UsXHJcbiAgICBkZWZhdWx0VmFsdWU6IG5ldyBSYW5nZSggMC40LCAwLjQ1ICksXHJcbiAgICBpc1ZhbGlkVmFsdWU6ICggcmFuZ2U6IFJhbmdlICkgPT4gTmF0dXJhbFNlbGVjdGlvblV0aWxzLmlzUGVyY2VudFJhbmdlKCByYW5nZSApXHJcbiAgfSxcclxuXHJcbiAgLy8gTXVsdGlwbGllciBmb3IgYnVubmllcyB3aXRoIHNob3J0IHRlZXRoIHdoZW4gZm9vZCBpcyB0b3VnaC4gU2VlIEZvb2Quc3RhcnZlQnVubmllcy5cclxuICAvLyBUdW5lZCBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzg2XHJcbiAgc2hvcnRUZWV0aE11bHRpcGxpZXI6IHtcclxuICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgZGVmYXVsdFZhbHVlOiAyLFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHZhbHVlOiBudW1iZXIgKSA9PiAoIHZhbHVlID4gMSApXHJcbiAgfSxcclxuXHJcbiAgLy8gUmFuZ2UgZm9yIHRoZSBudW1iZXIgb2YgYnVubmllcyB0aGF0IGNhbiBiZSBzdXN0YWluZWQgb24gbGltaXRlZCBmb29kIChjYXJyeWluZyBjYXBhY2l0eSkuIFNlZSBGb29kLnN0YXJ2ZUJ1bm5pZXMuXHJcbiAgbGltaXRlZEZvb2RQb3B1bGF0aW9uUmFuZ2U6IHtcclxuICAgIHR5cGU6ICdjdXN0b20nLFxyXG4gICAgcGFyc2U6IHBhcnNlUmFuZ2UsXHJcbiAgICBkZWZhdWx0VmFsdWU6IG5ldyBSYW5nZSggOTAsIDExMCApLFxyXG4gICAgaXNWYWxpZFZhbHVlOiAoIHJhbmdlOiBSYW5nZSApID0+ICggcmFuZ2UubWluID4gMCApICYmICggcmFuZ2UubWluIDwgcmFuZ2UubWF4IClcclxuICB9LFxyXG5cclxuICAvLyBTcGVjaWZpZXMgdGhlIG51bWJlciBvZiBzaHJ1YnMgdG8gc2hvdyBmb3IgbGltaXRlZCAobWluKSBhbmQgYWJ1bmRhbnQgKG1heCkgZm9vZC5cclxuICBzaHJ1YnNSYW5nZToge1xyXG4gICAgdHlwZTogJ2N1c3RvbScsXHJcbiAgICBwYXJzZTogcGFyc2VSYW5nZSxcclxuICAgIGRlZmF1bHRWYWx1ZTogbmV3IFJhbmdlKCAxMCwgNzUgKSxcclxuICAgIGlzVmFsaWRWYWx1ZTogKCByYW5nZTogUmFuZ2UgKSA9PiAoIHJhbmdlLm1pbiA+IDAgKSAmJiAoIHJhbmdlLm1heCA+IHJhbmdlLm1pbiApXHJcbiAgfSxcclxuXHJcbiAgLy8gQWRkcyBhIHJlZCBkb3QgYXQgdGhlIG9yaWdpbiBvZiBzb21lIG9iamVjdHMgKGJ1bm5pZXMsIHdvbHZlcywgZm9vZClcclxuICBzaG93T3JpZ2luOiB7XHJcbiAgICB0eXBlOiAnZmxhZydcclxuICB9LFxyXG5cclxuICAvLyBEcmF3cyBhIHJlZCBsaW5lIHdoZXJlIHRoZSBob3Jpem9uIGlzIGxvY2F0ZWRcclxuICBzaG93SG9yaXpvbjoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfSxcclxuXHJcbiAgLy8gRGlzcGxheXMgdGltZSBwcm9maWxpbmcgaW4gdGhlIHVwcGVyLWxlZnQgY29ybmVyIG9mIHRoZSBzY3JlZW4uIFRoaXMgd2FzIHVzZWQgZm9yIHBlcmZvcm1hbmNlIHByb2ZpbGluZ1xyXG4gIC8vIGFuZCBtYXkgYmUgdXNlZnVsIGluIHRoZSBmdXR1cmUuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzYwIGFuZFxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9uYXR1cmFsLXNlbGVjdGlvbi9pc3N1ZXMvMTQwLlxyXG4gIHNob3dUaW1lczoge1xyXG4gICAgdHlwZTogJ2ZsYWcnXHJcbiAgfVxyXG59IGFzIGNvbnN0O1xyXG5cclxuY29uc3QgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycyA9IFF1ZXJ5U3RyaW5nTWFjaGluZS5nZXRBbGwoIFNDSEVNQV9NQVAgKTtcclxuXHJcbi8qKlxyXG4gKiBQYXJzZXMgYSBxdWVyeS1wYXJhbWV0ZXIgdmFsdWUgaW50byBhIFJhbmdlLlxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VSYW5nZSggdmFsdWU6IHN0cmluZyApOiBSYW5nZSB7XHJcbiAgY29uc3QgdG9rZW5zID0gdmFsdWUuc3BsaXQoICcsJyApO1xyXG4gIGFzc2VydCAmJiBhc3NlcnQoIHRva2Vucy5sZW5ndGggPT09IDIsIGByYW5nZSBmb3JtYXQgaXMgbWluLG1heDogJHt2YWx1ZX1gICk7XHJcbiAgYXNzZXJ0ICYmIGFzc2VydCggXy5ldmVyeSggdG9rZW5zLCB0b2tlbiA9PiBpc0Zpbml0ZSggTnVtYmVyKCB0b2tlbiApICkgKSwgYHJhbmdlIG11c3QgYmUgMiBudW1iZXJzOiAke3ZhbHVlfWAgKTtcclxuICBjb25zdCBudW1iZXJzID0gXy5tYXAoIHRva2VucywgdG9rZW4gPT4gTnVtYmVyKCB0b2tlbiApICk7XHJcbiAgcmV0dXJuIG5ldyBSYW5nZSggbnVtYmVyc1sgMCBdLCBudW1iZXJzWyAxIF0gKTtcclxufVxyXG5cclxuLy8gdmFsaWRhdGUgcXVlcnkgcGFyYW1ldGVyc1xyXG5hc3NlcnQgJiYgYXNzZXJ0KCBOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLndvbHZlc0Vudmlyb25tZW50TXVsdGlwbGllciAqXHJcbiAgICAgICAgICAgICAgICAgIE5hdHVyYWxTZWxlY3Rpb25RdWVyeVBhcmFtZXRlcnMud29sdmVzUGVyY2VudFRvRWF0UmFuZ2UubWF4IDw9IDEsXHJcbiAgJ3dvbHZlc0Vudmlyb25tZW50TXVsdGlwbGllciAqIHdvbHZlc1BlcmNlbnRUb0VhdFJhbmdlLm1heCBtdXN0IGJlIDw9IDEnICk7XHJcblxyXG4vLyBUd2Vha2luZyB0aGUgcGFyYW1ldGVycyBmb3IgdG91Z2ggZm9vZCByZXF1aXJlZCB0aGF0IHdlIGNsYW1wIHRoaXMgY29tcHV0YXRpb24gdG8gMS4gVGhpcyB3YXJuaW5nIGlzIGEgcmVtaW5kZXIuXHJcbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzE2OCNpc3N1ZWNvbW1lbnQtNjczMDQ4MzE0XHJcbmlmICggTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycy5zaG9ydFRlZXRoTXVsdGlwbGllciAqXHJcbiAgICAgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycy50b3VnaEZvb2RQZXJjZW50VG9TdGFydmVSYW5nZS5tYXggPiAxICkge1xyXG4gIHBoZXQubG9nICYmIHBoZXQubG9nKCAnV0FSTklORzogc2hvcnRUZWV0aE11bHRpcGxpZXIgKiB0b3VnaEZvb2RQZXJjZW50VG9TdGFydmVSYW5nZS5tYXggPiAxLCBhbmQgd2lsbCBiZSBjbGFtcGVkIHRvIDEnICk7XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzJywgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycyApO1xyXG5cclxuLy8gTG9nIHF1ZXJ5IHBhcmFtZXRlcnNcclxubG9nR2xvYmFsKCAncGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycycgKTtcclxubG9nR2xvYmFsKCAncGhldC5wcmVsb2Fkcy5waGV0aW8ucXVlcnlQYXJhbWV0ZXJzJyApO1xyXG5sb2dHbG9iYWwoICdwaGV0Lm5hdHVyYWxTZWxlY3Rpb24uTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycycgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE5hdHVyYWxTZWxlY3Rpb25RdWVyeVBhcmFtZXRlcnM7XHJcbmV4cG9ydCB7IFNDSEVNQV9NQVAgfTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLDBCQUEwQjtBQUM1QyxPQUFPQyxTQUFTLE1BQU0sb0NBQW9DO0FBQzFELE9BQU9DLGdCQUFnQixNQUFNLHdCQUF3QjtBQUNyRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFFOUQsTUFBTUMsVUFBVSxHQUFHO0VBRWpCO0VBQ0E7RUFDQTs7RUFFQTtFQUNBO0VBQ0FDLGNBQWMsRUFBRTtJQUNkQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUUsSUFBSTtJQUNsQkMsTUFBTSxFQUFFO0VBQ1YsQ0FBQztFQUVEO0VBQ0E7RUFDQUMsY0FBYyxFQUFFO0lBQ2RILElBQUksRUFBRSxRQUFRO0lBQ2RDLFlBQVksRUFBRSxFQUFFO0lBQ2hCQyxNQUFNLEVBQUU7RUFDVixDQUFDO0VBRUQ7RUFDQTtFQUNBRSxlQUFlLEVBQUU7SUFDZkosSUFBSSxFQUFFLE9BQU87SUFDYkssYUFBYSxFQUFFO01BQ2JMLElBQUksRUFBRTtJQUNSLENBQUM7SUFDREMsWUFBWSxFQUFFLENBQUUsR0FBRyxDQUFFO0lBQ3JCQyxNQUFNLEVBQUU7RUFDVixDQUFDO0VBRUQ7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7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