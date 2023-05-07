## Ratio and Proportion - Model description

@author Michael Kauzmann (PhET Interactive Simulations)

This document is a high-level description of the model used in PhET's Ratio and Proportion simulation.

### Overview

The main concept of this simulation centers on ratios. Specifically, the spatial relations between controllable objects
and the continuous nature of ratios for a range of values.

The basic model for this simulation is simply the formula for a two-term ratio:

    antecedent:consequent

or

    ratio = antecedent/consequent

In this model, both the antecedent and consequent values are variables controlled by the left (antecedent) and right (
consequent) objects visually represented as left and right hands, respectively. While the hands can be moved in both
vertical and horizontal directions, the model only takes into account the vertical position of the center of the hands.
The horizontal position is bounded by the width of the thick boundaries at the top and bottom of the play area.

Compared to more numerically focused models of the mathematical concept of ratio, this simulation encourages exploration
of various positions of objects in space to achieve a specific, target ratio without precise feedback on the exact,
numerical position of the objects.

A number of constraints and boundaries are implemented to encourage the user to manipulate the hands to find multiple
positions that trigger the target ratio determined by the "My Challenge" selector ("Discover" screen) or set by the
user ("Create" screen).

### Ratio Fitness feedback

The current ratio between the left and right hand is compared to a target ratio and the physical distance between the
hands is used to determine a "fitness" value; the fitness value (0-1, where 1 is perfectly "in proportion") is used to
calculate how close a user is to the target ratio.

When the user moves the hands such that the fitness approaches 1, the simulation gives feedback through color changes (
darkening green = closer to proportion) and sound (higher pitch and frequency = closer to proportion) until the hands
reach values whose ratio match the target ratio. To aid in finding the ratio, there is a small tolerance where the
simulation reports the user’s ratio matches the target ratio (i.e. fitness is close to, but not equal to 1). There the
ratio is considered to be "in proportion".

### In Proportion state

When the target ratio and the current ratio are close enough (within the small tolerance window), the ratio is "in
proportion". Success feedback (dark green color, success sound) is provided in the sim for making the ratio the same as
the target ratio.

### Moving In Proportion state

Further, dynamic success feedback (continuous green color and a unique success sound) is provided by the model when the
hands are moved vertically such that the "in proportion" state remains true. For example, if the hands are continuously
moved from the bottom to the top at values to maintain a ratio of 1:2 (i.e., the right hand moves twice as fast as the
left hand), then the model is in the "moving in proportion" state and the user receives success feedback. To aid in this
task, the model widens the tolerance to achieve the "in proportion" state while both hands are moving in the same
direction (both the antecedent and consequent are both increasing or both decreasing).

### Model Constraints and Features

The algorithm for fitness is not exclusive to mathematically comparing the two ratios, but also takes into consideration
the "physical distance" that each ratio hand is from where it would be if the ratio was at its target. To aid in the
learning goals of the simulation, which include exploration of a large range of values for each hand, there are aspects
of the mathematics of ratios that are deemphasized in the model through cases, especially at low values of the
antecedent and consequent.

#### Zero case

To simplify the simulation model and to match with learning goals of the simulation, setting either term to 0 does not
produce feedback to match the mathematical expression. For example 1:0 is undefined, yet this simulation still provides
feedback based on that current ratio's proximity to the target, indicating the ratio is "close". The same is true for 
0:0. In these cases, the fitness of the current ratio is dominated by the amount the user must move to find positions 
(term values) that match the target ratio and not the mathematical value (undefined).

#### Locked ratio case

The ratio can be "locked" such that changing either term (hand) of the ratio will update the other term to
maintain the same ratio as when the ratio became locked. This continuously triggers the "moving in proportion" state. In
order to lock the ratio, the fitness for the hand positions must be in the "in proportion" state.
