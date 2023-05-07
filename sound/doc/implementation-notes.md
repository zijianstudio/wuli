# Sound - implementation notes

This document contains notes related to the implementation of Sound. The audience for this document is 
software developers who are familiar with JavaScript and PhET simulation development, as described in
[PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md).

Before reading this document, see [model.md](https://github.com/phetsims/wave-interference/blob/master/doc/model.md), 
which provides a high-level description of the simulation model.

## Overview

The Sound simulation depicts waves on a 2 dimensional surface and the interference patterns they create. It consists of five different simulations each with its own screen.  This simulation is heavily based on the implementation of the [wave-interference](https://github.com/phetsims/wave-interference/edit/master/doc/model.md) simulation.

There are no dynamically created/destroyed user interface components or model elements in the simulation, so the
simulation doesn't require dispose calls.

## Different wave behaviour from simulation wave-interference
While the code is based on that of the wave-interference simulation there are a couple of big differences:

- Instead of spreading in circles the waves will only spread in a horizontal conical shape.
- The waves will fade out linearly after a certain distance from the source.
- The waves can be reflected by an angled wall.
- If there is a second source, it can be moved while still emitting waves.
- The intensity of the waves can be dampened by decreasing the air pressure.

## The first three Screens: Waves, Interference, Slits

Each screen is split in two parts: a model and a view, this split is done according to the model-view-controller design pattern. The base classes for these are the SoundModel and SoundScreenView classes respectively. 

## SoundModel

The SoundModel class contains the data for a screen.
The base model is responsible for owning the waves lattice, the properties shared among all models (e.g.
frequencyProperty & amplitudeProperty), generating the waves and advancing the timestep.
### Lattice 
For keeping track of the wave values on the screen the [Lattice](https://github.com/phetsims/scenery-phet/blob/master/js/Lattice.ts) component from scenery-phet was used. Its dimensions and padding are kept at the same values as in wave-interference but could be changed for better resolution and to allow larger padding areas for reflection.

### TemporalMask

This component is adapted from
the [TemporalMask](https://github.com/phetsims/wave-interference/blob/master/js/common/model/TemporalMask.js) component
in wave-interference. It is responsible for clearing waves from the screen that can't belong to a source.
It is adapted so that it makes all waves that don't fall within the cone invisible, it also makes invisible all waves
behind the wall.
The ```matches``` function was modified so that it returns the distance from the original source, this is needed for the
dampening.

## SoundScreenView
This node extends the [ScreenView](https://github.com/phetsims/joist/blob/master/js/ScreenView.js) node. This screen is responsible for the creation many visual components: The LatticeCanvasNode, the reset button, the two most used control panels (sound and audio). It also generates the sinus tone when audio is enabled.

### LatticeCanvasNode

This node is based on the [LatticeCanvasNode](https://github.com/phetsims/wave-interference/blob/master/js/common/view/LatticeCanvasNode.js) from wave-interference but with a couple of adjustments for this usecase:

- The wave values are linearly dampened according to the distance value from the ```matches``` function of the
  TemporalMask component.
- A fast way to implement interference is accomplished:
  As long as the phase and frequency of the two sources is the same then the wave value of the second source at a
  coordinate in the lattice can be found by inversely applying the transform of the second source relative to the first
  to the coordinate position and retrieving the wave value there. That value can then be added to the value contributed
  directly by the first source to get the interference pattern. This allows for the second source to be movable while
  emitting.
- The interference for reflection is accomplished similarly, but now it takes the value of the wave at the coordinate
  mirrored by the wall (where it will still exist, just invisible).

## Coordinate frames

There are 3 coordinate frames:
* lattice coordinates (integer)
* Scene-specific physical coordinates (such as cm or nm)
* view coordinates

Coordinate transformations between these frames are defined in [Scene](https://github.com/phetsims/wave-interference/blob/master/js/common/model/Scene.js):
```js
// @public {ModelViewTransform2} - converts the model coordinates (in the units for this scene) to lattice
// coordinates, does not include damping regions
this.modelToLatticeTransform = ...;

// @public {ModelViewTransform2|null} - transforms from the physical units for this scene to view coordinates,
// filled in after the view area is initialized, see setViewBounds
this.modelViewTransform = ...;

// @public {ModelViewTransform2|null} - transforms from lattice coordinates to view coordinates, filled in after
// the view area is initialized, see setViewBounds
this.latticeToViewTransform = ...;
```
## Correct wave speed

We run the physics on a finite discrete lattice, but must match up with the correct values (frequency, wavelength and
wave speed) for each screen. The calibration value of the sound scenes for the wave-interference simulation is used but
adapted for the new screen size:

```const correction = 2.4187847116091334 * SoundConstants.WAVE_AREA_WIDTH / 500;```
