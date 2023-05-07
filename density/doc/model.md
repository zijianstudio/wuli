
The density of an object is its mass (kg) divided by its volume (L). For this simulation, all of the masses are cubes.

The physics are generally handled using the following types of forces:

- Gravity: A constant accceleration downward. For this simulation, it's 9.8m/s
- Buoyancy: A force based on the different pressures on the top/bottom of masses. For this simulation, it's only upward, and is equal to the weight of the displaced fluid.
- Contact: Masses can push into each other or the ground. The ground is immovable. No restitution.
- Friction: Only horizontal friction is handled in this simulation
- Viscosity: A custom function determining a viscous force is applied, so that oscillations stabilize at an appropriate rate.

Additionally:

- Internally, the p2.js physics library is used
- Velocity is limited to 5m/s
- There are invisible walls and an invisible ceiling that keep masses within the workable area
- The liquid level always remains flat (fluid "instantly" moves out of the way)
- Air is ignored (buoyancy acts like there is a vaccuum, and there is no air friction).
- Rotations are disallowed (as if torque doesn't happen)
