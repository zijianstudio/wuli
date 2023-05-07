Fillable Bag Graphics
=====================

There is a Scenery Node in the sim that is shaped like a money bag and that can be filled with different colors.  It is
called `FillableBagNode` as of this writing, and it was created by manually copying the SVG string from
`nl-bag-background-simplified.svg`, creating a `Shape` from this string, and then using the `Shape` to create a Scenery
`Path` node.  The SVG file was itself created by exporting the outline of the bag from `nl-bag-artwork.ai`, and then
simplifying it using Adobe Illustrator to the point where it worked as an input to the `Shape` constructor.  If changes
are needed to the appearance, the best approach would likely be to edit the SVG file using some sort of graphics editor
that supports SVG format, then manually copy the SVG string into `FillableBagNode`.  Be forewarned on this: There are
things that look fine in a graphical editor but don't work as input to a `Shape` class, so it is best to make
incremental changes and test them rather than doing a lot of editing and finding out that it has become unusable in
`Shape`.
