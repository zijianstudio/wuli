The physics engine is somewhat abstracted as a PhysicsEngine, it could be swapped out potentially in the future with another engine. The interface is compatible with a physics engine that is "stepped" internally, e.g. it can have multiple internal steps for every time we step it. We hook into this with a callback that handles the physics on each "internal" step (e.g. compute liquid level, then apply forces). Masses and other objects will have "step" properties that are updated/computed on every step, but also have "interpolated" values that are shown to the user (for instance, if the physics steps are longer than our animation frame steps, this is needed).

The 3D view is handled with three.js (and mobius as our support library). Instead of subtyping Node, we subtype three.js view types (with a `View` suffix), using a ThreeIsometricNode to put the 3d view into our Scenery view. This sim isn't supported without WebGL/three.js, so it won't load the main logic if that isn't supported (e.g. a headless browser without WebGL).

Masses extend the supertype `Mass` (e.g. Cuboid, Scale). Liquids are handled by their `Basin` (container), of which `Pool` and `BoatBasin` derive from.

Both masses and liquids can have a `Material`, both determining the density, viscosity (if a liquid), and other display properties. These can be custom or preset (similar to the `Gravity`).

Each model step effectively does:

- Run (potentially multiple, potentially zero) engine steps:
  - Physics is handled by p2.js
  - Compute the liquid level
  - Compute forces to be applied in the next step
- Figure out how far each mass and liquid level is between the two most recent engine steps, and interpolate those values (for smooth handling)