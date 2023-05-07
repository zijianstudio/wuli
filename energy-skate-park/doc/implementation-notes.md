# Energy Skate Park - Implementation Notes

This document contains notes that will be helpful to developers and future maintainers of this simulation.

## IMPLEMENTATION HISTORY
HTML5 version of energy-skate-park-basics was created before energy-skate-park, and so the "basics" repo was created
before the full version as well. We decided to `git --mirror` energy-skate-park-basics into energy-skate-park, and make
energy-skate-park the repo that maintains sim implementation while energy-skate-park-basics is a "thin shell" running
full version with particular settings.

After the `git --mirror` we had to rename files and directories with `git mv`, but this made history difficult to find.
`git log` shows no history prior to the `git mv`, and history cannot be seen directly in editors or the GitHub UI.
However, it is possible to find git history a few ways:
 - Use `git log --follow ./path/to/file` to see file history prior to `git mv`
 - Check out an old SHA and browse locally.
 - Use the GitHub UI at https://github.com/phetsims/energy-skate-park/commits/master to "Browse the repository at this point in history".
 - Use IntelliJ IDEA or WebStorm UI and press Git => Show History

`git --mirror` was done on 5/2/18, which may be helpful if you need to find code prior to this set up.

See https://github.com/phetsims/energy-skate-park/issues/6 for additional details.

## Model

Much of the model runs by the physical equations described in https://github.com/phetsims/energy-skate-park/blob/master/doc/model.md. Start
by reviewing those.

There are three fundamental types for the Energy Skate Park model. EnergySkateParkModel.js is the fundamental model and
assembles most of the simulation. Skater.js provides observable Properties and state related to the skater.
Track.js is the model element for tracks.

The EnergySkateParkModel is the entry point for skater motion. It manages transitions for the skater between motion
in free fall, motion along the track, and motion along the ground. It steps the skater through each of these states.

### EnergySkateParkModel Subtypes
There are two primary subtypes of EnergySkateParkModel that are used across screens. EnergySkateParkPlaygroundModel.js
is an EnergySkateParkModel where custom tracks can be built by the user. This model provides a number of track segments that are fully
interactive (see Tracks section below). EnergySkateParkTrackSetModel is an EnergySkateParkModel with a set of premade tracks that cannot be as freely customized. Subtypes of this model
generally add a set of premade Tracks. The frequently reused tracks can be found in PremadeTracks.

EnergySkateParkSaveSampleModel is a model which saves samples of SkaterState data in EnergySkateParkDataSamples to be presented in some way to the user.

### Tracks
Tracks are composed of ControlPoint and cubic splines which create the shape between them. The algorithm for interpolation is borrowed from a library called [numericjs](http://www.numericjs.com/),
though the portions used in this sim were optimized and re-written in SplineEvaluation.js to be fast enough for this sim.

To support various levels of user customization, Tracks have fields that define their interactivity
 * Track.draggable - If true the entire Track can be dragged in the play area
 * Track.configurable - If true, the Track shape can be modified by dragging control points
 * Track.splittable - If true, the Track can be split into two Tracks at a control point
 * Track.attachable - If true, this Track can be attached and combined with another Track

Tracks in the EnergySkateParkPlayGroundModel have all of these fields set to true.

### Skater, SkaterStates, and EnergySkateParkDataSamples
The Skater is the model component for the skater with observable Properties for its state.
SkaterStates were added so that we can save collections of model data at a particular model state to support playing
back and inspecting previous energy values. SkaterStates are not mutable.

SkaterState is also used to improve performance. In a single model step, energy and state information can be re-calculated
many times. SkaterStates are created or modified in these calculations so that observable Skater Properties can be set
once after all calculations are complete. And so many SkaterStates can be created in a single model step.

A EnergySkateParkDataSample contains SkaterState information at a point in time (where the time is specified) as well as other
Properties that support visualization of this data in data plots or other. EnergySkateParkDataSample data *can* be changed,
for instance when changing the reference height the energy components of the EnergySkateParkDataSample can change.

## View
EnergySkateParkScreenView is the entry point for the view. It uses a ModelViewTransform2 with a mapped point and inverted y.
The model origin is at the ground and horizontal center of the view. EnergySkateParkScreenView employs a "floating"
layout so that on wider screens there is more space for custom tracks. Panels near the edge of the screen are shifted
to create more space when possible. EnergySkateParkScreenView has many shared UI components but not all are used in every screen. They can be added or
removed from the screen with options. Subtypes of EnergySkateParkScreenView typically specify which UI components
they require and override the `layout` function for any custom UI positioning.

