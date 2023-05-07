Most of how things work is just addition/multiplication, however there are some details:

For calculation lines, there's a list of all possible types below. If two lines would appear the same, only one is shown:

- Totals: e.g. `( -x + x^2 )( x^2 - x )`, shows the sums of the vertical and horizontal partitions multiplied together. This example value will be used for everything except for the "Expansion" line.
- Expansion: e.g. `( -5 + 2 )( 7 + 3 )`, where for proportional screens (decimals/multiply/partition/explore) where the totals line will show e.g. `-3 * 10`.
- Distribution: e.g. `(-x)(x^2) + (-x)(-x) + (x^2)(x^2) + (x^2)(-x)`, where terms are distributed.
- Multiplied: e.g. `(-x^3) + x^2 + x^4 + (-x^3)` where each term's two factors are multiplied together.
- Ordered: e.g. `x^4 + (-x^3) + (-x^3) + x^2` where terms are sorted by their power of x.
- Minuses: e.g. `x^4 - x^3 - x^3 + x^2` where negative signs are moved to terms being subtracted.
- Sum: e.g. `x^4 - 2x^3 + x^2` where terms are combined.

Additionally, for game screens, every challenge is described in https://github.com/phetsims/area-model-common/blob/master/js/game/model/AreaChallengeDescription.js, where each value is described as either:

- GIVEN: It's a constant that is determined at the start and shown to the user
- EDITABLE: It is editable by the user (starts out with no value)
- DYNAMIC: It is computed based on the given and dynamic values (when available), shown in light gray.

The VARIABLES and NUMBERS indicates which sim the challenge is for (Area Model: Algebra uses VARIABLES, and Area Model: Multiplication uses NUMBERS). If there are multiple challenges for a given level (e.g. LEVEL_5_NUMBERS_1 and LEVEL_5_NUMBERS_3), at least one of each challenge will be used in a level (and the rest will be randomly generated).

Level 6 in Area Model: Algebra is somewhat different, as there is generally no unique solution (the values can be swapped). All other challenges can have their values transposed (vertical and horizontal swapped) and shuffled (partitions of the same type swapped).