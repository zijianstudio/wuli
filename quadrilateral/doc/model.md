## Quadrilateral - Model description

@author Jesse Greenberg and Brett Fiedler (PhET Interactive Simulations)

This document is a high-level description of the model for PhET's Quadrilateral simulation.

### Overview

Quadrilateral enables learners to explore the properties that define shapes, as well as the relationships between shapes, in the four-sided (quadrilateral) family. A learner can play with a four-sided shape to change its geometric properties and see how combinations of geometric properties create specific named quadrilaterals, while noting similarities between other named quadrilaterals.

#### Geometric properties and the shape name 
The quadrilateral has geometric properties, such as the number of parallel sides, number of equal angles, and number of equal side lengths. The name of the quadrilateral is determined by its geometric properties. There are families of shapes that share overlapping geometric properties, and within those families, properties "build-up" to create named shapes with more specific requirements. For example, one path:
- "Convex Quadrilateral" has no relevant geometric properties aside from all angles summing to 360 degrees (2*PI radians).
- "Trapezoid" has one pair of parallel sides (1 set of adjacent angles sum to 180 degrees or PI radians).
- "Isosceles Trapezoid" has the properties of "Trapezoid" plus two equal adjacent angles and one pair of equal opposite side lengths.
- "Rectangle" has the properties of "Isosceles Trapezoid" plus an additional pair of parallel sides, all equal angles, and two pairs of equal opposite side lengths.

In the simulation, we rely on the specific set of inclusive relationships between shapes.

Here is a full diagram showing the geometric properties for each quadrilateral shape. Each family of shapes is a path through this graph. Shapes with more geometric properties become a more specific shape within that shape family.
<img src="https://user-images.githubusercontent.com/47331395/229589272-f2bd44d2-a3e4-472b-9432-4c2e6df510af.png" alt="Quadrilateral shape property hierarchy for all included shapes in the simulation" title="Quadrilateral Shape Hierarchy">

Not all possible shapes are named in the simulation. We include: Convex, Concave, Dart, Kite, Trapezoid, Isosceles Trapezoid, Parallelogram, Rectangle, Rhombus, and Square. Other named shapes that may be of interest can be explored, but are not explicitly named by the simulation, such as: Right Trapezoid, Acute Trapezoid, Obtuse Trapezoid. We also include the named shape: "Triangle?". This is included as the shape that appears on screen aligns with a triangle, but does have four verticies. Teachers are encouraged to have a conversation with their students on whether it is in fact a triangle or not.

#### Tolerance Intervals and Step Sizes
This simulation uses a combination of tolerance intervals and step sizes to make it easier to find named shapes. Tolerance intervals are designed to work well with precision errors and are set relative to the step size for a vertex. The smaller the step size, the smaller the tolerance interval must be to avoid inaccuracies. 

For example, precisely placing Vertices at positions to create exact 90 degree angles is extremely difficult to impossible for certain shape orientations, especially for shapes that are rotated relative to the XY axis of the screen. The sizes of the tolerance intervals are very small as to avoid giving learners the impression that shape requirements are inexact, and the simulation provides feedback in line with the geometric requirements for the shape. Therefore, within the tolerance interval, when angles or lengths are "equal", they are equal enough for the purposes of this simulation but may be slightly different. 

The tolerance intervals are defined in code, but are modified in rare circumstances: They are made smaller by 1/4 when the `?reducedStepSize` query parameter is used to account for the decreased step size. They are made larger when the `?deviceConnection` query parameter is used to account for difficulty in producing fine movement with tangible, external devices communicating with the simulation. In the latter case, see the Input tab of the Preferences menu for multiplier adjustments to the tolerance intervals.
