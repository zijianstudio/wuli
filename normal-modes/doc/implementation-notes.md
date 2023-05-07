# Normal Modes - implementation notes

This document contains notes related to the implementation of Normal Modes. 
This is not an exhaustive description of the implementation.  The intention is 
to provide a high-level overview, and to supplement the internal documentation 
(source code comments) and external documentation (design documents).

The simulation itself is an adaptation of the original Normal Modes simulation
written in ActionScript (Flash), both math and design are inspired by it.

Before reading this document, please read:
* [model.md](https://github.com/phetsims/normal-modes/blob/master/doc/model.md), a high-level description of the simulation model

In addition to this document, you are encouraged to read: 
* [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)  
* [PhET Software Design Patterns](https://github.com/phetsims/phet-info/blob/master/doc/phet-software-design-patterns.md)

## Terminology
* _mode_ normally refers to a normal mode of an oscillating system.
* _visibleMasses_ are the masses visible in screen, excluding the invisible static masses that work as walls.
* _AmplitudeDirection_ is either horizontal or vertical, see [AmplitudeDirection](https://github.com/phetsims/normal-modes/blob/master/js/common/model/AmplitudeDirection.js)

## General Considerations

This section describes how this simulation addresses implementation considerations that are typically encountered in PhET simulations.
Note that, in the subsections below, there are some names written in _italic_: those are the the actual names or terms used inside the code, so it's easy to find them there through a simple text search if you need to.

### Coordinate Transforms
The transform between model and view coordinate frames can be found in the ScreenViews. This transform inverts the mapping of y-axis values; +y is down in view (scenery) coordinates, up in model coordinates.

### Memory Management

All objects, except for one, are instantiated at startup and exist for the lifetime of the simulation and thus don't need to be disposed.
The one object that does need to be disposed is a VStrut inside _NormalModeSpectrumAccordionBox_ which is properly disposed inside _phasesVisibilityProperty_ linked callback (see [#51](https://github.com/phetsims/normal-modes/issues/51)).

### Assertions

The implementation doesn't have many cases of assert, aside from the ones in PhET libraries. 
There is one case of assert to keep an eye out for, though, during velocity and acceleration computations in _OneDimensionModel_. It checks whether the direction of those Properties coincide with the selected movement axis. However, this shouldn't be something to worry about unless you're making changes in the way those Properties are computed.

### Screen Differences

Here's a more objective view on what each screen has/does. For a basic overview, [model.md](https://github.com/phetsims/normal-modes/blob/master/doc/model.md) is enough.

The _One Dimension_ screen has, basically:
* A _NormalModesControlPanel_ that allows:
    * Playing/pausing and stepping.
    * Changing the simulation speed.
    * Changing the number of masses.
    * Going back to the masses' initial or zero positions (check the [model](https://github.com/phetsims/normal-modes/blob/master/doc/model.md) to see the difference).
    * Showing/hiding the springs.
    * Showing/hiding the phase sliders on _NormalModeSpectrumAccordionBox_.
* A _NormalModeSpectrumAccordionBox_ which has:
    * Amplitude and phase sliders for each normal mode.
    * _StaticModeGraphCanvasNode_ (s) representing each normal mode graphically.
    * A button group with arrows to select which _AmplitudeDirection_ the masses are going to move.
* A _NormalModesAccordionBox_, which shows an animated graph for each mode based on the simulation data. Those are _ModeGraphCanvasNode_ (s).
* A row of _MassNode1D_, between _WallNode_ (s). These masses can be moved (only in the active _AmplitudeDirection_) even when the simulation is running.

The _Two Dimensions_ screen is a bit different from _One Dimension_:
* The _NormalModesControlPanel_ has the same options, except for the show/hide phases checkbox.
* It doesn't have amplitude and phase sliders; it has, instead, a box with a grid of _AmplitudeSelectorRectangle_ (s).
    * Each _AmplitudeSelectorRectangle_ represents a normal mode through its row and column and the respective mode amplitude by how much it's 'filled'.
    * The _AmplitudeDirection_ buttons are inside the grid panel. They now set which direction of the normal mode amplitude the _AmplitudeSelectorRectangle_ (s) represent.
    * An _AmplitudeSelectorRectangle_, when clicked, toggles its normal mode amplitude between 0 and an arbitrary value on whichever _AmplitudeDirection_ is set by the arrow buttons.
* There is no way of changing the modes' phases manually.
