# Number Line: Operations - Model Description

@author John Blanco (PhET Interactive Simulations)

## Overview

The main concepts that are modeled in this simulation are operations and number lines.  In the context of the
simulation, an operation consists of an operator, which is limited to either addition or subtraction, and an amount,
which can be either positive or negative.  Addition or subtraction of negative values is not simplified by default.  In
fact, it is one of the primary pedagogical goals of the simulation to help users gain an understanding of the
equivalence of, say, addition of a negative to subtraction of a positive version of the same amount.  An operation is
depicted as a curved arrow that starts at an initial value and ends at the resultant value.  Points for each of these
values are shown on the number line. 

A number line is modeled as extending from negative infinity to positive infinity, but only a finite window into that
range can be presented at any given time (obviously).  In this simulation, the number lines are all presented
horizontally with the zero position in the horizontal center of the screen.

Operations are added to the number line in various ways, depending on the screen.  On the first two screens, a maximum
of one operation is visible on the number line at any given time, and the visible operation fades out once created.  On
the second two screens, up to two operations can be added and their visibility is persistent.  These persistent
operations can be manipulated to show how this changes the intermediate and final values for a sequence of operations. 

## The "Chips" Screen

On this screen, the user can add and remove chips with positive and negative values to two bags.  Adding a chip creates
an addition operation, removing a chip creates a subtraction operation, and the amount of the operation depends upon the
value shown on the chip.  The operation is shown on the number line for a few seconds or until another operation is
created.

## The "Net Worth" Screen

This screen is very similar to the "Chips" screen except that it uses monetary values and visual depictions of real-world
assets and debts, as well as the terminology associated with basic financial ideas.  As with the first screen,
operations are created by adding items to or removing them from the bags, and the operation is visual for either a fixed
amount of time or until another operation is created.

## The "Operations" Screen

On this screen, operations are explicitly created using an operation entry control.  Up to two operations are supported.
The operations remain on the number line until an erase or a reset occurs, and they can be manipulated either by using
the operation entry control or by dragging the points associated with the operation.  Either of the two operations can
be active at any given time, but there is an order dependency.  The first operation, if active, will always precede the
second.  In the depiction, the curved arrow that portrays the first operation will always have its apex above the
number line, and the apex of the arrow for the second operation will be always be below the number line. 

There is also an "initial net worth", from which the operations start.  This value can also be manipulated by the user.

There is a numerical expression indicator shown in the top center of this screen.  The expression shown here depicts
the sequence of operations, for example, 100 - 200 + 400, where the first term is the initial net worth, the second is
the first operation, and the third term represents the second operation.  When one or more operations are active, the
"evaluate" button (which has an equals sign on it) becomes active and the result of all operations is shown momentarily
when this button is pressed.  If any active operation has a negative value, the "Simplify" button becomes active, which
can be pressed to momentarily show a version of the expression that converts addition of a negative to subtraction and
subtraction of a negative to addition. 

This screen continues to use financial terms, such as "asset", "debt", and "net worth" to describe the operations.

## The "Generic" Screen

This screen is similar to the "Operations" screen in that up to two operations can be added to the number line.  The
primary differences are that a second number line can be shown to allow for comparisons, the range of the number lines
can be changed, and financial terms are not used to describe the operations.

This screen also has a numerical expression display that operates the same as on the previous screen.
