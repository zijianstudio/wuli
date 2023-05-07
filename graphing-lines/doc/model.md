# Graphing Lines - model description

## General

The model describes a line using 2 points, (x1,y1) and (x2,y2). All tabs use this internal representation, but present the line in different forms. See Line.js for more details.

Internally, slope is computed and stored as separate rise and run values. When slope is not interactive, it is typically presented in simplified form. That is, the rise and run are reduced to their simplest terms. For example, a slope stored as 4/6 would be presented as 2/3.

Y-intercept is also stored internally as a fraction (possibly improper) with integer numerator and denominator components. This allows us to accurately display y-intercepts that are not integer values, for example when attempting to match a slope-intercept line by moving 2 arbitrary points on a graph.

The first three tabs provide 2 representations of a line: equation and graph. These representations are kept synchronized throughout all user interactions.

## Slope screen

The "Slope" screen presents a line using the standard equation for slope:

`m = (y2 - y1)/(x2 - x1)`

`x1`, `y1`, `x2` and `y2` are variable.

## Slope-Intercept screen

The "Slope-Intercept" screen presents a line in slope-intercept form:

`y = (rise/run)x + b`

`rise`, `run` and `b` (y-intercept) are variable.

## Point-Slope screen

The "Point-Slope" screen presents a line in point-slope form:

`(y - y1) = (rise/run)(x - x1)`

`rise`, `run`, `x1` and `y1` are variable.

## Line Game screen

The "Line Game" screen presents the student with a set of challenges to be solved. All of these challenges involve deriving a line or equation for a given line or equation. Throughout the source code, the given is referred to as the "answer", and the student's current solution is referred to as the "guess".

There are 3 types of challenges:

- Make the Equation: given a graphed line, derive an equation for that line
- Graph the Line: given an equation, graph the corresponding line
- Place the Points: given an equation, graph 3 points on the corresponding line

Challenges use slope-intercept and point-slope forms, sometimes combining them in the same challenge.

Challenges are quasi-randomly generated, following the specification in the design document. See the `ChallengeFactory` class hierarchy for more details on challenge generation.

