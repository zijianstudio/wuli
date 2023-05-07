
# Visual Glossary

## Screen types

**Proportional** screens are based on to-scale coordinates with movable partition lines, resizable area, and usually starts with a grid enabled:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional.PNG)

**Generic** screens are not-to-scale, where the partition lines are fixed visually, and the partition sizes can be edited directly:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-generic.PNG)

**Game** screens visually use the generic view, with differences where many different fields can be editable:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-game.PNG)

## Major components

### Area display

The **area display** is the main play area component (and any associated controls):

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional.PNG)

### Factors box

The **factors box** is usually in the upper-right, and has different names depending on the sim. It either has editable height/width, or displays the height/width.

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-factors-box-normal.PNG)

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-factors-box-intro.PNG)

### Product box

The **product box** is below the factors box, and displays the total product/area.

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-product-box-normal.PNG)

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-product-box-intro.PNG)

### Selection panel

The **selection panel** is below the product box, and offers some different choices depending on the screen, notably:

**partial product choices**:

The choices, from left to right, are "hidden", "products" and "factors":

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-partial-product-choices.PNG)

**calculation choices**:

The choices, from left to right, are "hidden", "line-by-line", and "show-all-lines":

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-calculation-choices.PNG)

**partition choices**

The choices, from left to right, are "horizontal partition" or "vertical partition" (only visible on the "Partition" screen)

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-partition-selection.PNG)

### Scene selection

On Proportional screens, it is possible to select between multiple scenes (usually just different sizes):

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-scene-selection.PNG)

On Generic screens, it is possible to switch between different **layouts**, which control which scene is visible (and is at the far top-right):

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-generic-layout.PNG)

### Calculation

On the bottom center/left, there is the calculation panel/box (it is an accordion box on one screen, and a panel when available on the others):

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-calculation.PNG)

When the line-by-line is selected, arrow buttons will appear that allow going through the lines.

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-line-by-line.PNG)

## Parts of the area display

### Orientations

Most things are related to either a **horizontal** or **vertical** value (and how the space is partitioned along that orientation). These are usually color-tagged, so:

- Horizontal values on proportional screens are colored Red
- Vertical values on proportional screens are colored Blue
- Horizontal values on generic screens are colored Green
- Vertical values on generic screens are colored Purple

### Partitions

Each **partition** is either a vertical or horizontal "slice" of the area, usually labeled on the top or left (its **size**):

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-partition.PNG)

Note that the vertical partitions are defined by the horizontal space being partitioned:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-generic-horizontal-partition.PNG)

and the horizontal partitions are the opposite:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-generic-vertical-partition.PNG)

Note that in the code, all partitions or partition lines are defined by "what is the space being partitioned". So for instance, a "vertical partition" above is created by splitting the "horizontal space" into two pieces. In the code, these are the horizontal partitions, and in the code, the line that separates them is a horizontal partition line (even though visually it is a "vertical" partition line).

### Partitioned areas

**Partitioned areas** are the rectangles determined by the intersection of one horizontal partition and one vertical partition. On the generic screens, these are colored by the sign of the partitioned area's partial product:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-generic-partitioned-areas.PNG)

### Partial Products

On both proportional/generic, there are **partial products**:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-partial-products.PNG)

that are in the center of the partitioned areas.

### Partition lines

There are lines between the partitions. On generic screens, these are static:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-generic-partition-lines.PNG)

but on proportional screens, these can usually be dragged with handles:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-partition-lines.PNG)

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-partition-line-drag-handle.PNG)

### Range labels

There are usually labels on the top and left that label the "total size" of all partitions, and also (when relevant) show the size of individual partitions:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-range-label.PNG)

### Tiles

Proportional screens can sometime be shown with tiles (which shows things grouped horizontally/vertically by groups of 100, 10, or 1):

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-tiles.PNG)

### Numbering

Proportional screens (depending on the screen) can have numbers shown on each grid unit that is active:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-numbers.PNG)

### Drag handle

Proportional screens usually have a drag handle that allows controlling the active area:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-proportional-drag-handle.PNG)

## Game components

The game has a **status bar** with a **prompt** shown below that lets the user know what needs to be filled in:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-prompt-status-bar.PNG)

### Editable fields

**Editable fields** show up for any value that can be edited. They are highlighted to show that they need input:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-game-editable.PNG)

Or have been filled in successfully:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-game-editable-normal.PNG)

And when a solution is checked, if they are incorrect, they will be flagged:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-game-editable-error.PNG)

There is also an editable field that shows up for polynomial editing:

![alt text](https://raw.githubusercontent.com/phetsims/area-model-common/master/doc/images/area-glossary-game-polynomial.PNG)

# Code

## General

Since we need to handle powers of x, most values that are used (such as the size of a partition) are a `Term` (a coefficient and a power of x). Arrays of these are usually handled as a `TermList`, and a `Polynomial` is one that combines by power of x and is sorted.

There is a lot of code that would be duplicated for horizontal/vertical cases (the `Orientation` enumeration). To reduce that, there is an `OrientationPair` type, which holds a value for each orientation, and provides helper methods. A good understanding of `OrientationPair` is critical to understanding a lot of the code.

We need to switch between showing different areas a lot (scenes and the game), and memory usage precluded switching between one node subtree for each area. Instead, we have `AreaDisplay` (and subtypes `ProportionalAreaDisplay`, `GenericAreaDisplay` and `GameAreaDisplay`) which allows swapping out different areas (and in `GameAreaDisplay`'s case, entire challenges). It wraps most of the values of the area types into Properties (where necessary), so it is a representation of what should be displayed on the screen. We then have `AreaDisplayNode` and others to actually display this.

Our model-view transforms vary a bit. For proportional screens, they map the actual coordinate into view space, but for generic screens the "model" space in each orientation is from 0 to 1 (so that gets mapped over).

Since almost every feature is shared between multiple area-model sims, almost all the code is in this common repository. This includes the screens (since some are shared), so those are under js/screens/ (and each sim references the screens that it uses).

Additionally, due to performance concerns, many types in area-model-common are poolable. This is helpful, even for cases where we can use the DAG nature of Scenery, since the CPU cost of creating the wrapper nodes was unacceptable. By pooling, it lowers the garbage collection and object creation overhead, and should allow for smoother animation.

For the game, internally we use the displayed level numbers (e.g. 1 for "Level 1") instead of using the 0-based VEGAS system. This was originally done because we had two level 3s in the same game (one "Variables" and one "Numbers"), although these were split into separate screens later in development.

