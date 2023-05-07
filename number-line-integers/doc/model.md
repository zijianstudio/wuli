# Number Line: Integers - Model Description

## General

The primary model element in this simulation's code describes an abstract number line that extends from negative
infinity to positive infinity, though of course practical considerations mean that the span that can be seen is always
limited to some finite amount.  Points can be added to and removed from the number lines that are modeled in the
simulation.  This model of a number line is depicted in various situations to the user in order to provide different
perspectives on what a number line is, what information it represents, and how it can help in understanding how numbers
can be compared and understood.

## Explore Screen

The "Explore" screen depicts three different scenes, each of which maps a numerical quantity to points on a number line.

In the "Elevation" scene, there is a direct horizontal mapping from the elevation value to the number line, with values
below sea level represented as negative numbers and those above sea level as positive numbers, and sea level being, not
surprisingly, zero.

In the "Bank" scene, there is a direct physical correspondence between the position of the piggy banks and the values in
the accounts, but the quantity be represented is more abstract, i.e. money.

In the "Temperature" scene, there is no correspondence between the physical position of the thermometers and the
corresponding values on the number line - the are now decoupled from physical position, and the value shown is that of
the temperature of the surface of the Earth at the point on the map where the point of the thermometer is touching.

## Generic Screen

In the "Generic" screen, a general-purpose number line is presented and the user can change the span, the orientation,
and a number of attributes about what is and isn't shown.  The essential underlying model of the number line is the
same as in the "Explore" screen, but the user now has much more control over how the number line is presented.  It is
"generic" in the sense that it is not coupled to any particular physical or monetary quantity. 