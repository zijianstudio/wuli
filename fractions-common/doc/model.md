# Fractions Suite model

There are a few different types of screens, identified below for each simulation:

Build a Fraction (simulation)

- "Build a Fraction" (screen) - building game (no mixed numbers)
- "Mixed Numbers" (screen) - building game (with mixed numbers)
- "Lab" (screen) - building lab (with mixed numbers)

Fraction Matcher (simulation)

- "Fractions" (screen) - matching game (no mixed numbers)
- "Mixed Numbers" (screen) - matching game (with mixed numbers)

Fractions: Equality (simulation)

- "Equality Lab" (screen) - intro-style (with equality)
- "Game" (screen) - matching game (no mixed numbers)

Fractions: Intro (simulation)

- "Intro" (screen) - intro-style (no mixed numbers, larger ranges)
- "Game" (screen) - building game (no mixed numbers)
- "Lab" (screen) - lab (no mixed numbers)

Fractions: Mixed Numbers (simulation)

- "Intro" (screen) intro-style (mixed numbers, smaller ranges)
- "Game" (screen) - building game (mixed numbers)
- "Lab" (screen) - building lab (with mixed numbers)

## Intro-style screens

Intro-style screens represent an underlying fraction, and allow the user to switch between representations of that
fraction. The mixed-number variant can display the "mixed" form of the fraction, and the equality variant displays a
controllable "multiplied" variant on the right.

The underlying internal representation is thinking of each whole number "container" as a discrete set of "cells" that
can be filled or not. The "max" spinner controls the number of containers. Cells can be individually controlled in the
circular/bar/cake representations (via drag-drop). Adding/removing via changing the numerator otherwise will fill or
empty the right-most cell (for example, when dragging the number line thumb, or using the numerator spinner).

## Building-style screens

There are two main variants: the "lab" screens (standalone) or the "game" screens (with levels and targets), but they
use the same underlying controls and model.

For shapes, pieces are added in-order, and the "return" button will return the last piece in the right-most container.
Each "whole" cannot be overfilled.

For numbers, the mixed-fraction group (where there is a spot for whole numbers to go) has the restriction that the
numerator must be less than the denominator (including disallowing 1 as a denominator).

For the games, it may be necessary to return some fractions and rearrange the pieces. While all levels are solvable, it
is possible to get "stuck" with the remaining pieces (where returning fractions and rearranging can result in a solution).
