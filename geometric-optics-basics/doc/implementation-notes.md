_Geometric Optics: Basics_ is a simplified version of the _Geometric Optics_ simulation, and shares the same implementation.  Please see [geometric-optics/doc/implementation-notes.md](https://github.com/phetsims/geometric-optics/blob/master/doc/implementation-notes.md) for implementation details.

To identify modifications that are specific to _Geometric Optics: Basics_:

* Inspect [geometric-optics-basics-main.ts](https://github.com/phetsims/geometric-optics-basics/blob/master/js/geometric-optics-basics-main.ts).
* Search for occurrences of the `isBasicsVersion` flag in geometric-optics code.

From https://github.com/phetsims/geometric-optics-basics/issues/2, here's a summary of how _Geometric Optics: Basics_ differs from _Geometric Optics_. Unless specifically noted, these differences can be "undone" via PhET-iO.

Both screens:
* "Second Point" checkbox in the control panel is hidden.  It is possible to make it visible via PhET-iO.
* When the "Labels" checkbox is checked, use labels "Object" and "Real/Virtual Image" for the first object/image. If a second object is made visible, use labels "Object 1" and "Real/Virtual Image 1" for the first object/image, "Object 2" and "Real/Virtual Image 2" for the second object/image.

_Lens_ screen:
* Convex lens only. It is possible to select concave lens via PhET-iO, or via the UI if radio buttons are made visible via PhET-iO.
* Radio buttons to select the optic shape are hidden. It is possible to make them visible via PhET-iO.

_Mirror_ screen:
* Flat mirror only. It is NOT possible to add concave and convex mirror via PhET-iO.
* Since we have only a flat mirror, optical objects can be moved freely, rather than being constrained to horizontal motion.
* Since there is only one mirror shape, hide the radio button. It is not possible to make it visible via PhET-iO, because it is not instrumented.
* Since we have only a flat mirror, move the mirror to the same screen coordinates as the lens.
* Because the F and 2F points for a flat mirror are located at infinity, there are no checkboxes for “Focal Points” and "2F Points" in the control panel. It is NOT possible to add them via PhET-iO.
* Change screen icon to a flat mirror. This cannot be changed via PhET-iO.

Preferences > Simulation:
* Default `focalLengthControlTypeProperty` to 'direct'.
* Default `add2FPointsCheckboxProperty` to `true`, so that "2F Points" checkbox is visible on the _Lens_ screen. This control will not affect the _Mirror_ screen.
