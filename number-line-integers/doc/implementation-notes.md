# Number Line: Integers - Implementation Notes

This document contains notes related to the implementation of the "Number Line: Integers" simulation. This is not an
exhaustive description of the implementation.  The intention is to provide a high-level overview, and to supplement the
internal documentation (source code comments) and external documentation (design documents).

## Terminology

Where possible, the terminology used in the source code attempts to be consistent with that used by educators when
teaching about number lines, at least to the degree that such terminology is universally accepted.  There are, of
course, a number of terms that are used within the code that are unique and were invented as part of the implementation
process.  The rest of this section is devoted to such terms.  They are listed in alphabetical order.

* _absolute value span_ - a shape used to represent absolute values that is made up of three lines where two short lines
show the beginning and end of the span and a center line of varying length is used to represent the length of the span
* _controller node_ - a user interface object that is used to control some aspect of the model's behavior and is more
complex than a simple control like a checkbox or slider
* _point controller_ - a model object that can control a point on the number line, but is not necessarily always doing
so
* _Robinson Projection_ - a type of projection used for depicting maps (this term is general, not invented for the sim,
so feel free to look it up if more information is needed)
* _scene_ - a different view/interaction that is available on a single screen, also used in several other PhET sims 
* _spatialized number line_ - a number line that is mapped into a 2D space in some way

## General Considerations

There are two screens in this simulation, titled "Explore" and "Generic".  The former is more complex, since it
represents three "scenes" where the user can experiment with the relationship between real-world experiences and their
mapping onto a number line.  In the "Generic" screen, the user interacts with the number line in a situation where it
is not explicitly linked to any real-world situation, and is thus more abstract.

The source code is implemented using the guiding principal of model-view architecture.  The model is where the number
lines, points, point controllers, and many of the attributes of the number line are tracked, whereas the view is
where the visual representations of all of these elements are defined.

In this sim, there is no model-view transform used when translating between the model and the view.  This was done as a
simplification, since for the most part there are no obvious units, such as meters, that would be used in the model.    

If there ever comes a day when we need an MVT (say, if the pinch-and-zoom feature depends on there being one), probably
the best thing to do would be to assume that the number line exists in a normalized space of 1x1, and all coordinates
are transformed into this space based on the number line's orientation and displayed range value.  An MVT in the view
would then project it into the appropriate place in the view.

## Model

Since a number line has no inherent mapping into units, the essential `NumberLine` class is unitless and is not mapped
into any 2D space.  It also has no limits to the minimum or maximim values that the points it contains may hold.  There
is a subclass called `SpatialzedNumberLine` that adds the functionality of spatial mapping to the number line.  It is
this class that is used on all screens except the Temperature Scene, since that is the only one where there is no
spatial mapping to the number line.

If you're reading this because you need to make significant changes to the code, or are hoping to reuse it in some way,
probably the most important thing to make sure you understand clearly is the relationships between the point controllers
and the number lines, and how this relationship was generalized and parameterized to work in a number of different
situations.

## View

The view is where the spatialized number line and the point controllers that interact with it are presented to the user.
Number lines appear horizontally and vertically in different situations, and the view adds in the familiar attributes
like the arrows at the ends, the tick marks, the labels, and represents the points themselves as small circles on the
line.  The relationship between the point controllers and the number lines was probably one of the more tricky aspects
of the view code, since the point controllers can have images or can be represented by spheres, can optionally have
lines that connect perpendicularly between the controllers and the number line, are often draggable but sometimes are
not, and are sometimes limited in how they can be dragged (e.g. x or y direction only).

## A Final Note

This simulation is the first of several that will be centered around the concept of number lines and basic mathematical
operations.  Some - and potentially a lot - of the code that is in the number-line-integers repository will be migrated
to a shared repository over time.  As this occurs, the code will likely evolve to be more general, and any future
maintainers of this simulation will need to be aware of the shared code and will have to make sure that any changes are
compatible with all sims in which the code is used.