
# Implementation Notes

## Model

Numbers are represented with PaperNumber, which contains (usually) multiple BaseNumbers for each digit. Thus the number
1024 would have one PaperNumber (for 1024) with three BaseNumbers (for 4, 20 and 1000). There is one paper slip visible
for each BaseNumber.

PaperNumbers origin is the left-top of the single-digit image. Multiple bounds-based methods are provided for the entire
number, or each BaseNumber.

Commonly used model terms:

- numberValue: The full value of a number, e.g. 1024
- place: The location of a digit in a number, with 0 indicating the 1's place, 1 indicating the 10s place, etc.
- digit: Single-digit numeric value. For example, for the base number 20, its digit is 2 and its place is 1, such that
         ```numberValue = digit * 10^place```.
- digitLength: Number of digits in a number (including zeros), so 1024 has a digit length of 4.
- terms: Multiple screens have numbers set on the left and right, which are part of a formula "a + b = sum". a and b
         are the terms, generally described as the leftTerm and rightTerm, such that ```leftTerm + rightTerm = sum```.

The game model tracks level-specific information in Level objects, created on startup, and the level/currentLevel/etc.
is based on an object reference (instead of integers like used in other sims). Where possible, all of the game
challenges are created on startup, and sampled uniformly when picking a random challenge.

