
# Normal Modes - model description

This document is a high-level description of the model used in PhET's
_Normal Modes_ simulation.

## One Dimension screen

The _One Dimension_ screen offers a variety of tools to represent oscillatory normal modes in one dimension.

To adjust the masses' movement pattern, you can both:

* manually drag them on the screen (even while moving or paused!)
* adjust each normal mode's amplitude and phase

The movement axis can be chosen through arrow buttons, which represent horizontal and vertical orientations.

To adjust each normal mode individually, you can set their amplitude and phase values using sliders
on _Normal Mode Spectrum_ panel.

Phase controls can also be shown/hidden using the _Show Phases_ checkbox in the side menu to get
some more screen space.

Note that you can see live animated curve representations through the _Normal Modes_ panel, which
represent, in fact, each mode's motion pattern.

## Two Dimensions screen

The _Two Dimensions_ screen is similar to _One Dimension_ screen, with only a few differences.

In this screen, only normal modes' amplitudes are individually adjustable, and the controls are
also a bit different.

To adjust each normal mode amplitude (_Normal Mode Amplitudes_ panel):

* select the desired axis using the arrow buttons
* choose a rectangle by their row and column, which represent the normal mode number
* click on a rectangle to turn given normal mode amplitude "on and off"

Note that the amplitude values are represented by a progress bar inside each rectangle, from the 
bottom to the top.

## Additional Controls

It's also possible to control more general simulation settings through control panel at the upper-right:

* pause, step and resume the simulation
* manage simulation speed
* change number of masses
* show/hide all the springs

To return to previous states, there are utility buttons:

* _Initial Positions_: pauses the sim and sets mass positions to where they were when the simulation started moving
* _Zero Positions_: resets mass positions to their default value
