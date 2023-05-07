# Number Line: Operations - Implementation Notes

This document contains notes related to the implementation of the "Number Line: Operations" simulation.  The intended
audience is developers who need to make changes to or need to leverage the code.  Such a need may arise if new features
are added, or if bugs or usability issues are reported.  This document is intended to provide an overview of the
simulation's architecture, a sort of "forest for the trees" view.  The devil is, of course, in the details, and the code
itself should be considered the "ground truth". 

## Overview

The central concepts for the pedagogy of this simulation are numerical operations and number lines.  Each of the four
screens depicts at least one number line, and numerical operations are shown on all of them.  This has led to a lot of
the code being shared, and relatively little code associated with each of the screens.  Also, this simulation is part
of the "Number Line Suite" of sims, and as such shares code with the other sims in the suite through the
number-line-common repository.

This sharing of code is good in terms of development, and will likely be beneficial if general bugs are found or if 
other number line sims are added.  On the other hand, if and when new features are added, care must be taken not to
change any of the common code in ways that could break the existing behavior.

As with most PhET simulations, a Model-View-Controller architecture was used.  In this particular simulation, the way in
which to separate the model and view was not as clear as it is in some simulations where there is an obvious mapping to
a physical real-world situation with inherent scale and measurement units, such as there is in sims like Projectile
Motion or Balancing Act.  Because of this, the coordinate space is the same as the model space, and no
model-view-transforms were used.  The model handles the positions of points and the projection of the abstract number
lines into a 2D space, and the view handles how these are presented to the users.  This separation is probably not quite
as useful in this particular sim as it is in "Number Line: Distance" and "Number Line: Integers", but worked reasonably
well in this context nonetheless.

During the design and implementation, a conscious effort was made to keep the most essential classes very simple so that
their implementation would match the common understanding of what terms like a "number line" mean without a lot of
extra, sim-specific baggage.  Functionality that was specific to the needs of this simulation and the others in the
suite was either added in subclasses or created through composition.

## General Considerations

This section describes how this sim addresses implementation considerations that are typically encountered in PhET sims.

**Model-View Transform**

As mentioned above, model-view transforms are not used in this sim since using screen coordinates as the basis of the
two-dimensional space seemed perfectly reasonable.

**Query Parameters**

There are no sim-specific query parameters for this particular sim.

**Assertions**

The sim makes heavy use of `assert` and [AssertUtils](https://github.com/phetsims/phetcommon/blob/master/js/AssertUtils.js)
to verify pre/post assumptions and perform type checking. This sim performs type-checking for almost all function arguments via `assert` (but it's not a requirement that type-checking is done everywhere). If you are making modifications to this sim, do so with assertions enabled via the `ea` query parameter.

**Memory Management** 

* **Listeners**: This sim does not have a lot of things being allocated and then de-allocated, so most calls to `link`
and `lazyLink` don't need a corresponding `unlink` call.  There are several usages of `addListener` related to
animations where no `removeListener` is needed because the animation is short lived so it will not retain references.
All uses of `link` and`lazyLink` are documented as to whether they need a corresponding `unlink`. For example:

```js
    // Move the shadow into position and make it visible when this item is being dragged.  No unlink is needed.
    valueItem.isDraggingProperty.link( isDragging => {
      ...
```

* **dispose:**: Classes that need a dispose function have one, those that don't do not.

## Terminology

Below are some terms that are used throughout the code in places like class names, variable names, and comments, and
that were either made up for this sim or whose meaning is more specific in this context.  There are a lot of terms
whose generally accepted definitions are close enough to how they are used in the sim that they are not listed here,
such as "number line" and "point".

* _balance sheet item_ - In general, a balance sheet is a financial statement that lists a company's assets and debts.
This sim uses the terms "asset" and "debt" in some places, and the term "balance sheet item" is intended to be a
generalization of either an asset or a debt.
* _operation_ - a numerical operation that consists of an operation type - either addition or subtraction 
(multiplication and division are not supported) - and an amount, which is a numerical value that can be positive,
negative, or zero
* _operation entry control_ - a user interface control that can be used to add an operation to a number line and
subsequently manipulate its attributes
* _point controller_ - a model object that can control a point on the number line, but is not necessarily always doing
so
* _spatialized number line_ - a number line that is mapped into a 2D space in some specific way

## Key Classes, Responsibilities, and Relationships in the Common Code

### Model

`OperationTrackingNumberLine` is one of the most central model classes.  It is a subclass of `SpatializedNumberLine`,
which is the class in which the purely abstract and non-spatialized `NumberLine` class is mapped to 2D space.
`OperationTrackingNumberLine`, as the name suggests, is a number line that keeps track of one or more numerical
operations. Because of the design of the sim, `OperationTrackingNumberLine` tracks a fixed number of operations, and
that number is specified at construction.  This may seem a little counterintuitive.  Why not design it to be fully
general, and be able to add and remove operations at will?  Indeed, that was the original design, but since in all four
screens a fixed number of operations is needed and their order matters, having a fixed pre-specified number made the
code significantly simpler.

Instances of the `NumberLineOperation` class are the entities that are tracked by the `OperationTrackingNumberLine`.
These instances are quite simple, and have a property that indicates the operation type - addition or subtraction - and
the amount.  There is an additional property that tracks whether the operation is active, which means whether it should
appear on the number line.  

Instances of `NumberLineOperation` are created when an `OperationTrackingNumberLine` is created, and they are activated
and deactivated based on the user's interaction with the sim.  There is a single tracked operation for the number lines
on the first two screens and two tracked operations per number line on both the third and fourth screens.

Instances of `NumberLinePoint` are added to and removed from the number line as the user interacts with a screen.  There
is always an initial starting point present, and the operations move from there.  When an operation is added, it uses
the initial endpoint or the most recently added endpoint as its starting point, and added a new point to the number
line for its endpoint.  So, each time an operation is activated, there is a net gain of one point on the nuber line, and
when an operation is deactivated, there is a net reduction of one point.

It's important to note that operations do _not_ keep references to points.  The operation _only_ has a type and an
amount (and the aforementioned active indicator).  The responsibility of maintaining the relationships between the start
and end points of an operation when it is active on the number line rests with `OperationTrackingNumberLine`.

### View

Each of the key classes in the model section above have a peer in the view.  For some, the view classes are named the
same as their model peer with "Node" stuck on the end, i.e. `OperationTrackingNumberLineNode` and
`NumberLineOperationNode`.  `PointNode` is the view representation of `NumberLinePoint`.

The presentation of operations is animated a couple of different ways.  The operation, which is generally represented
as a curved arrow either above or below the number line, generally grows from its origin to its destination.  On the
first two screens, operations fade away over time if the user doesn't change anything.  For various reasons, it worked
out best to have the start-to-end point animation handled by `NumberLineOperationNode` and the fading of operations
handled by `OperationTrackingNumberLineNode`.

## Chips Screen and Net Worth Screen

The "Chips" and "Net Worth" screens are very similar and share a lot of code.  Both have only one instance of
`OperationTrackingNumberLine` and configure it to track a single operation.  That operation is updated each time the
user adds something to or removes something from one of the two holding bags.  When operations are created rapidly,
an operation that is on the number line will look like it disappears and is replaced by next operation.  When operations
are created more slowly, the most recent operation will fade out over time.  In both cases, there is only ever one
operation, and its active state is changing and the initial value is being updated.

## Operations Screen

The `OperationTrackingNumberLine` on the "Operations" screen tracks two operations instead of the single operation
tracked on the first two screens. On this screen, the user interacts more explicitly with the operations through the
`OperationEntryCarousel` that appears in the upper right of the view.  This carousel contains two instances of
`OperationEntryControl`, each of which allows the user to specify, add, and manipulate an operation on the number line.

## Generic Screen

The fourth screen is called "Generic" because it no longer uses any of the financial terminology (e.g. "net worth") used
in the middle two screens.  This screen has two instances of `OperationTrackingNumberLine` to allow the users to create
comparative situations, though only the first one is shown by default.  Other than that, it is very similar to the
"Operations" screen and shares much of the same code.
