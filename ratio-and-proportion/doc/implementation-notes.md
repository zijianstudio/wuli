# Ratio and Proportion - Implementation Notes

@author Michael Kauzmann (PhET Interactive Simulations)

This document contains notes related to the implementation of Ratio and Proportion. This is not an exhaustive
description of the implementation. The intention is to provide a high-level overview, and to supplement the internal
documentation (source code comments) and external documentation (design documents).

Before reading this document, please read:

* [model.md](https://github.com/phetsims/ratio-and-proportion/blob/master/doc/model.md), a high-level description of the
  simulation model

In addition to this document, you are encouraged to read:

* [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)
* [PhET Software Design Patterns](https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md)
* [Ratio and Proportion Design Resources](https://drive.google.com/drive/u/1/folders/1XJGeZKYohYDMucdV3bYF56QG08BGjpMi)
  , (which may be out of date)

## Model

Each screen's model is a `RAPModel`, which contains a `RAPRatio` and keeps the "fitness" of that ratio as it pertains to
its target ratio value.

### Terminology

* **term** - a component number in a ratio
* **antecedent** - the first term
* **consequent** - the second term
* **current ratio** - made by dividing the current values of the ratio
* **target ratio** - goal ratio that indicates success.
* **clamped fitness** - a value clamped between 0 and 1, where 1 is a perfect ratio, and 0 is a semi-arbitrary state
  where we transition from "out of proportion" to "far from proportion" (see below for more on different model states).
* **unclamped fitness** - a value with a max of 1 (a perfect ratio, just like clamped fitness), but that can be negative
  depending on how far away from the target ratio the current ratio is. Because of the fitness algorithm, the min
  depends on what the target ratio is.

### RAPRatio.js

This type manages the antecedent and consequent that control the value of the ratio (in proportion form). These two
terms are stored as a single data type called `RAPRatioTuple`. The range of each term value is from 0 to 1, where 0 is
the min, and 1 is the max for the whole sim. `RAPRatio` also has logic to "lock" the terms together to maintain the same
ratio as one ratio term is mutated. In the view, there are different representations that can make these values look
different (like tick marks), but in the model the values are constant.

### RAPModel.js

This type takes the ratio term values associated with the `RAPRatio` and connects them to a "target ratio". The metric
of how close the current ratio is to the target ratio is called "fitness". Below explains multiple states of the sim
based on this relationship.

### Fitness

An algorithm is used to determine how accurate the current ratio is to the target ratio. We call this "fitness",
see `ratioFitnessProperty`. This algorithm went through a lot of prototyping (see
https://github.com/phetsims/ratio-and-proportion/issues/14). The algorithm that is used predominately takes into
consideration the visual/spacial distance that the consequent hand can travel from the "in proportion" state (see below)
, before being "far from proportion". When the tick marks are showing 0-10 with a targetRatio of >1, the consequent can
move two tick marks away from the "in proportion" value before the `ratioFitnessProperty` is 0. Because of the
relationship ratio terms have, the antecedent value's distance between being in-proportion and far-from proportion
varies based on the target ratio. The fitness algorithm is based on the euclidean distance between two points, the
current ratio and the target ratio. These points are calculated by using the current ratio to get a function with an
inverse slope to the function of the target ratio. When the targetRatio is `>1`, the fitness algorithm is reversed such
that the antecedent and consequent are flipped. This is to give consistent fitness relationship for `targetRatio=1/10` and
`targetRatio=10`. See `RAPModel.calculateFitness()` for details.

## Model states

Below is a list of multiple states that the model can be in. These states are mutually exclusive unless otherwise
stated. In addition to explaining how the sim can get into a state, each lists the output modalities that occur in the
specified state.

### In Proportion

This state occurs when the current ratio is close enough to the target ratio to indicate success feedback. In fitness
units this is `>=1-IN_PROPORTION_FITNESS_THRESHOLD`. This state is a range to accommodate a tolerance around the perfect
ratio. If this state was instead only a single value, it would be nearly impossible to access it using a mouse.

* Visual: dark green (`RAPScreenView.js`)
* Sound: "success ding" (`InProportionSoundGenerator.js`)

#### In-proportion values when one or more are too small for success

Even though the ratio term values are technically in proportion, the fitness will be just slightly less
than `IN_PROPORTION_FITNESS_THRESHOLD` in this mode. This is for pedagogical reasons. The output modalities are none the
wiser, and will treat this as "out of proportion" (see next state).

* Visual: a hair lighter than the dark green for normal in proportion
* No in-proportion sound ever plays
* No moving-in-proportion sound (choir)

### Out of proportion

This state occurs when the fitness is between `0` and `1-IN_PROPORTION_FITNESS_THRESHOLD`. Many feedback modalities in
the view will only produce in this range.

* Visual: green gradient (`RAPScreenView.js`)
* Sound: `StaccatoFrequencySoundGenerator.js`

### Far from proportion

When the clamped fitness (`RAPModel.ratioFitnessProperty`) is 0, there is less feedback from the sim.

* Interactive Description: some description, like the proximity to target ratio, still provides feedback in this state,
  but there is not sound or visual feedback.

### Moving in Proportion

This is a subset of the in-proportion state. When the ratio is in proportion, and both hands are moving in the same
direction, fast enough, at the same time, we call this "moving in direction."
When moving in direction, the "In Proportion" threshold is increased to allow for easier in-proportion feedback. The
model is moving in proportion when moving in direction with a fitness `>=1-MOVING_IN_PROPORTION_FITNESS_THRESHOLD`.

* Moving in Proportion Sound: choir sound (`MovingInProportionSoundGenerator.js`)
* Same output for in-proportion state:
    * Visual: dark green
    * Success Sound: "success ringing ding/chord" upon entering this state.

## Dynamic Layout

This sim is more vertically oriented than most, and as a result, a lot of the visual layout changes based on the aspect
ratio. This is chiefly centered around the ratio hands having the maximum vertical space possible. That said, the hands
and controls also scale to give a better experience on iPad and phone-like devices in "vertical mode." The right
controls scale in two Nodes, one that stays justified to the top right of the layout bounds, and one to the bottom
right. See
`RAPScreenView.js`

## Tick mark implementation

It is important to the pedagogy of this sim that altering the number of tick marks displayed in the sim doesn't feel
like zooming in or out. As a result, the implementation of these are just a skin on top of the model. None of the model
values change from altering the tick mark views.

