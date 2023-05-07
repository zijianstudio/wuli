# Unit Rates - implementation notes

This document contains miscellaneous notes related to the implementation of Unit Rates. It
supplements the internal (source code) documentation, and (hopefully) provides insight into
"big picture" implementation issues.  The audience for this document is software developers who are familiar
with JavaScript and PhET simulation development (as described in [PhET Development Overview]
(https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)).

First, read [model.md](https://github.com/phetsims/unit-rates/blob/master/doc/model.md), which provides
a high-level description of the simulation model.

## Terminology

This section enumerates terms that you'll see used throughout the internal and external documentation.
In addition to helping you understand the code, they're useful when creating GitHub issues.

General:

* denominator - the second term in a rate, corresponds to the bottom number line
* double number line - a pair of number lines, used to diagram rates
* edit button - yellow button with a pencil icon, pressing it opens a keypad, for editing some value
* keypad - for entering numeric values
* marker - vertical line with values above and below, appears on double number line, used to indicate a rate 
* marker editor - user-interface component used to manually create markers on the double number line 
* numerator - the first term in a rate, corresponds to the top number line
* rate - a ratio where the terms are in different units 
* ratio - a comparison of 2 numbers
* term - one of the 2 numbers in a ratio
* unit rate - a rate where the denominator is 1

Shopping and Shopping Lab screens:

* bag - a bag of items (Apples, Carrots, Purple Candy, etc.)
* category - one of 3 collections of items: fruit, vegetables, candy
* category radio buttons - used to select a category
* item - the fundamental type of thing in the shopping screens (Apple, Pear, Lemon, Carrot, Red Candy,...)
* items combo box - used to select an item
* "Refresh Questions" button - button in the lower-left corner of the Questions accordion box, cycles through questions
* "Reset Shelf" button - button to the left of the shelf, resets the shelf to its initial state
* scale - place bags and items here to display their corresponding cost and (for candy) quantity 
* scene - all of the stuff specific to an item
* shelf - place below the scale where bags and items live
* spinner - user-interface control for changing one of the terms in the Rate accordion box

Racing Lab screen:

* cue arrows - green arrows that initially appear around the finish flag, indicating that the flag can be dragged
* finish flag - checkered flag that appears at the finish line, move it to change track length
* car position indicator - small rectangle that moves along the double number line to indicate car position
* timer - indicates the time for a race
* scene - 1 car or 2 cars
* scene radio buttons - used to select between 1 or 2 cars
* start/stop button - used to start and stop the race
* start flag - flag that appears at the starting line on the track
* track - car moves along this during a race
* track markers - triangles that are spaced at 50-mile intervals below the track

## General

This section describes how this simulation uses patterns that are common to most PhET simulations.

**Model-view transform**: All model-view transforms are concerned solely with the horizontal dimension,
for which we use a linear function. For the double number line, see `modelToViewNumerator` and `modelToViewDenominator` 
in `DoubleNumberLine`. For the race track, see `modelToView` in `RaceTrackNode`.

**Query parameters**: Query parameters are used to enable sim-specific features, mainly for debugging and
testing. All such query parameters are documented in
[URQueryParameters](https://github.com/phetsims/unit-rates/blob/master/js/common/URQueryParameters.js).

**Nested options**: In this simulation, I tried a new pattern for nesting options. It allows clients to specify only the nested options 
that they wish to override.  The pattern is used throughout the sim, mostly for specifying options related to a rate's numerator and denominator
(e.g. in `DoubleNumberLine`).  The general pattern is:

```js
options = _.extend( {
  nestedOptions: null, // {*} to be filled in with defaults below
  ...
}, options );

options.nestedOptions = _.extend( {
  // default values go here
}, options.nestedOptions );
```

## Common to all screens

This section highlights a few things that are common to all screens.

**Markers**: There are several ways to create markers: via the marker editor, by changing what is on the scale, by answering questions, and by running a car race.
Markers have precedence based on how they were created.  Markers with higher precedence replace markers with lower precedence. 
See `Marker.CREATOR_VALUES` for the list of marker creators and their precedence.

**Marker Editor**: The marker editor appears on all screens, and is one of the more complicated parts of the simulation. See `MarkerEditor` (model) and
`MarkerEditorNode` (view). In `DoubleNumberLineAccordionBox`, `markerObserver` has primary responsibility for observing the marker editor, 
creating corresponding markers, and animating the marker editor.

**Rounding**: Values associated with marker terms are necessarily rounded to a specific number of decimal places, as described in the table that appears
in [model.md](https://github.com/phetsims/unit-rates/blob/master/doc/model.md). Because values are rounded, it's possible to have 2 markers that
have the same value for one term, and different values for the other term. We say that these markers "conflict".  When this situation occurs, 
the older marker is replaced by the newer marker (subject to the marker precedence rules).  See `Marker.conflictsWith` for details on 
conflicting markers.

## Shopping and Shopping Lab screens

Shopping and Shopping Lab screens share a great deal of code. Since the Shopping Lab screen is generally treated as 
a specialization of the Shopping screen, code shared by these 2 screens lives in the directory for the Shopping 
screen (`js/shopping/`).

The model in these screens exists for the lifetime of the simulation. But large portions of the view are reconstructed when the selected item changes. 
So `dispose` is required throughout the view, and all function calls that register an observer have an associated comment 
indicating whether a corresponding de-register call is required. For example, here's the general pattern used in `CostNode`:

```js
var costObserver = function( cost ) {...};
costProperty.link( costObserver ); // unlink in dispose
...
this.disposeCostNode = function() {
  costProperty.unlink( costObserver );
};
```

`ShoppingItemData` contains data structures that are used to instantiate `ShoppingScene` and its subtypes (`FruitScene`, `VegetableScene` and 
`CandyScene`).  Using a data structure like this is an alternative to having a large number of constructor parameters.

`Bags` and `ShoppingItems` are subtypes of `URMovable`, which implements model-based animation, complete with a callback system.
`URMovable` is required reading.

The most complicated part of the implementation is the management of bags and items. This is especially true for Fruit, where bags "open" and become 
individual items when placed on the scale.  In the model, `Scale` and `Shelf` are both subtypes of `ShoppingContainer`.  A `ShoppingContainer`
provides 3 rows: `bagRow` (for bags), `backItemRow` and `frontItemRow` (for items).  `BaseShoppingSceneNode` 
implements the layering in Nodes `bagLayer`, `backItemLayer` and `frontItemLayer` respectively. An additional `dragLayer` is provided,
which serves as the parent for Nodes while they are being dragged.

See `RowOfMovables` for the implementation of the rows in `ShoppingContainer`. A row consists of a set of cells, each of which can 
contain at most one `URMovable`.  For some insight into cells, run the sim with query parameter `?showCells` to display the outline 
of the cells.

`BagDragHandler` and `ShoppingItemDragHandler` are also required reading. They utilize the animation callbacks provided by 
`URMovable` to "change course" when the destination becomes occupied by another object.  They also handle moving Nodes between 
the layers mentioned above.

For more insight into how the bags and items are arranged on the shelf and scale, run the simulation with the `?showCells` 
query parameter. Green cells are possible locations for bags, blue cells are possible locations for individual items.  
Animation is always to the closest cell, and (to support multi-touch) changes course if the target cell becomes occupied 
during the animation. When a bag "opens", it becomes individual items that fill the cells that were closest to the bag.

## Shopping screen

The Questions panel is unique to the Shopping screen. `ShoppingItemData` provides a data structure that describes the questions, in a 
"raw" format that matches the description in the design document. `ShoppingQuestionFactory.createQuestionSets` turns this raw data 
into sets of `ShoppingQuestion`. 

## Shopping Lab screen

When cost is not an exact number of cents (i.e., cannot be represented by exactly 2 decimal places), the scale in the Shopping Lab screen 
displays 1 additional decimal place.  The specification for computing the extra decimal place involved both truncation and rounding, and 
implementation was a bit tricky. See `CostNode.costObserver` for details.

## Racing Lab screen

Compared to the shopping screens, the Racing Lab screen is relatively simple. It uses the same double number line and Rate accordion box as
the other screens, but adds a pair of race tracks and related controls.  When a race completes, it results in the creation of a corresponding
marker on the double number line. 

The majority of the model logic resides in `RaceCar`, while `RaceTrackNode` contains most of the view components that are specific to this screen.

In the Racing Lab screen, model and view components persist for the lifetime of the simulation, so `dispose` is unnecessary.
