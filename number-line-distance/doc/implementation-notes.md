# Number Line: Distance - Implementation Notes

This document contains notes related to the implementation of the "Number Line: Distance" simulation. The intended
audience is developers who need to make changes to or need to leverage the code. Such a need may arise if new features
are added, or if bugs or usability issues are reported. This document is intended to provide a high level overview.

## Overview

The point of this simulation is to demonstrate concepts of distance through number lines. The simulation is used to
demonstrate both absolute (unsigned) and directed (signed) distances. All scenes/screens in the simulation have only one
number line and exactly two point controllers, which allows for a lot of basic abstractions. The majority of this sim's
base functionality is derived from number-line-common.

Due to the similarity between the majority of the scenes/screens, a large amount of abstraction was able to be leveraged.
For example, the [AbstractNLDBaseModel](https://github.com/phetsims/number-line-distance/blob/master/js/common/model/AbstractNLDBaseModel.js)
class handles the majority of all models' duties. Similarly, [NLDBaseView](https://github.com/phetsims/number-line-distance/blob/master/js/common/view/NLDBaseView.js)
is the workhorse that handles the base layout and common elements in all scenes/screens.

## General Considerations

**Model-View Transform**

As is with all number-line sims, the model and view share the same coordinate system, so there is no need for model-view
transforms.

**Memory Management**

Because number-line-distance is mostly static, very few elements are ever added or removed over the lifetime of the
simulation. As such, memory, for the most part, is not a concern. One must be careful with `NumberLinePoint`s being added
and removed. There is no need to dispose anything because everything else is present over the sim's lifetime.

## Terminology

* **Scene/Screen:** The simulation is divided into two _screens_: the Explore screen and Generic screen. The Explore
  screen has 3 _scenes_: the Distance scene, Temperature scene, and Elevation scene. The naming convention matches what
  is used in number-line-integers, which leads to the unfortunately non-descriptive name of Distance for the scene that
  has the house and person.

* **DistanceReprepresentation:** The two main types of distances in this sim are absolute and directed distance.
  `DistanceRepresentation` is the enumeration that has values of `ABSOLUTE` and `DIRECTED`.

* **Play Area:** In the Explore screen, the point controllers can only interact with the number line when they are in
  some specific area. This area is called the play area. Point controllers dragged outside the play area are generally
  moved back into the box unless they are able to 'drop' into the play area.

* **DropFromDirection:** In the Explore screen, point controllers can 'drop' into the play area. `DropFromDirection`
  is the enumeration that indictes where the point controller must be in relation to the play area in order to be able
  to drop into it. For example, a `DropFromDirection` of `LEFT` means that the point controller must be left of the play
  area in order to drop into it; a point controller anywhere else is moved into the box. The `DropFromDirection` so far
  is chosen to correspond with the relation of the number line to the play area, so a number line above the play area
  will correspond with a `DropFromDirection` of `TOP`.

## Key Classes, Responsibilities, and Relationships in the Common Code

### Model

[AbstractNLDBaseModel](https://github.com/phetsims/number-line-distance/blob/master/js/common/model/AbstractNLDBaseModel.js)
is the most important model class in this simulation. It has all of the simulation's important Properties and hooks
listeners into `PointController`s.

### View

[NLDBaseView](https://github.com/phetsims/number-line-distance/blob/master/js/common/view/NLDBaseView.js) contains all
of the common view elements in a single layer. It handles the sim controls and even the distance statement and distance
description.

[DistanceStatementNode](https://github.com/phetsims/number-line-distance/blob/master/js/common/view/DistanceStatementNode.js)
is the node that displays a subtraction statement representing the state of the point controllers on the number line.
Either uses `NumberPicker` (so it can affect the point controllers' values) or `Text` to display point controller values.

[DistanceShadedNumberLineNode](https://github.com/phetsims/number-line-distance/blob/master/js/common/view/DistanceShadedNumberLineNode.js)
is a `NumberLineNode` subclass that performs all the number-line functionalities that are shared by all screens/scenes.
It handles shading the distance between the attached `NumberLinePoint`s (if there are two) with a thick line (if showing
absolute distance) or an arrow (if showing directed distance). It also handles displaying labels for the points and a
label for the distance.

## Explore Screen

The [NLDExploreScreenView](https://github.com/phetsims/number-line-distance/blob/master/js/explore/view/NLDExploreScreenView.js)
contains selectors to select the scene. The [NLDExploreModel](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/NLDExploreModel.js)
contains all the scenes' models. The [ExplorePointController](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/ExplorePointController.js)
is a `PointController` subclass for the Explore screen that adds dropping behaviour. There is also the [AreaPointController](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/AreaPointController.js)
for the Temperature and Elevation scenes where point controllers can move freely in an area and the [DistancePointController](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/DistancePointController.js)
for the Distance scene where the point controller locks on to a specific height.

### Distance Scene

The Distance scene is perhaps the meatiest scene in this sim. The point controllers cannot move freely within the play
area, but must rather lock to a specific height (much like the generic screen). The difference between the locking
behaviours between the Distance scene and Generic screen is that in the Generic screen, the locking is determined based
on whether the point controller is close enough to the number line, whereas in the Distance scene, the locking is
determined based on whether the point controller is within the play area.

### Temperature Scene

The Temperature scene's point controllers extend from [AreaPointController](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/AreaPointController.js)
to add another color Property that represents the color of the temperature that they are at. The point controllers' color
values are always either green or purple, but the added color Property to [TemperaturePointController](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/TemperaturePointController.js)
changes with the temperature value for the `TemperatureAndColorSensor` in [TemperaturePointControllerNode](https://github.com/phetsims/number-line-distance/blob/master/js/explore/view/TemperaturePointControllerNode.js).

### Elevation Scene

The Elevation scene is probably the simplest scene. There is no need to subclass [AreaPointController](https://github.com/phetsims/number-line-distance/blob/master/js/explore/model/AreaPointController.js),
and the [ElevationPointControllerNode](https://github.com/phetsims/number-line-distance/blob/master/js/explore/view/ElevationPointControllerNode.js)
just manages that the image displayed changes when the point controller is above or below zero.

## Generic Screen

There isn't much to the Generic screen, other than adding controls to change the number-line orientation and range.

