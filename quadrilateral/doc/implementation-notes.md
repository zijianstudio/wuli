## Quadrilateral - Implementation Notes

@author Jesse Greenberg (PhET Interactive Simulations)

This document is a high-level description of the implementation for PhET's Quadrilateral simulation. It includes an overview of the class hierarchy and responsibilities, as well as some specific information about tricky parts of the implementation.

#### Model components
Here is an overview of the most important model components that determine simulation behavior.
- `QuadrilateralModel`: Entry point for the simulation model. Contains model subcomponents that manage simulation state and behavior.
- `QuadrilateralShapeModel`: Responsible for geometry and shape calculations and state. Has 4 QuadrilateralVertex and 4 QuadrilateralSide instances.
- `QuadrilateralVertex`: QuadrilateralVertex as a `positionProperty` and an `angleProperty`. Most geometric properties of the quadrilateral are calculated from these two Properties. 
- `QuadrilateralSide`: QuadrilateralSide has a `lengthProperty` which is used to calculate geometric Properties. It is defined by two Vertices.
- `ParallelSideChecker`: Calculates whether a pair of opposite sides are parallel.
- `QuadrilateralShapeDetector`: Uses shape properties to determine the name of the quadrilateral.

#### Shape name detection
Shape detection in this sim works by tracking geometric properties of the shape. If the quadrilateral has the geometric properties required for a named shape, it is a match. There are families of shapes such that as the quadrilateral gains more geometric properties, it will become a match for a name with more specific requirements. Here is a diagram that illustrates the shape families, and properties that build up to more specific shapes.
<img src="https://user-images.githubusercontent.com/6396244/221933377-fdc7d16e-9edb-4974-bf9a-eff72ce49af0.png" alt="Alt text" title="Optional title">

See QuadrilateralShapeDetector for the implementation of shape detection which matches this graphic.

#### View components
Here is an overview of the most important view components.
- QuadrilateralScreenView: Entry point for the view, containing all view subcomponents.
- QuadrilateralNode: Node for the quadrilateral shape, with QuadrilateralVertexNode and QuadrilateralSideNode instances.
- QuadrilateralSideNode: View component for a QuadrilateralSide and implements input handling specific to a side.
- QuadrilateralVertexNode: View component for a QuadrilateralVertex and implements input handling specific to a vertex.
- QuadrilateralGridNode: View component for the grid, showing allowable vertex positions and making it easier to create reproducible shapes. 
- QuadrilateralModelViewTransform: The model has +x to the right and +y up with origin at the center of the grid.

##### Sound
This simulation supports sound. Related files are in the /view/sound/ directory. The sound design in this sim uses tracks that loop continuously in the background and sound good when played at the same time. Volume of individual tracks change depending on the shape properties. See TracksSoundView.ts and its subclasses.

##### Voicing (description)
This simulation supports Voicing. Description code is one of the most complicated parts of this sim because we generate natural language that describes every possible state of the quadrilateral and simulation. Relevant classes are:
- QuadrilateralDescriber: Creates description strings that describe the overall state of the quadrilateral and the state of the simulation. Contains describer subcomponents.
- QuadrilateralAlerter: Creates description strings and requests speech synthesis for real-time feedback spoken to the user during interaction.
- QuadrilateralSideDescriber: Creates description strings that describe the state of a QuadrilateralSide.
- QuadrilateralVertexDescriber: Creates description strings that describe the state of a QuadrilateralVertex.

See https://github.com/phetsims/qa/blob/master/documentation/qa-book.md#voicing for an overview of the Voicing feature.

#### Prototypes
This sim has several prototypes for new features. These features are not going to be published to the main website, but we may share demos or links on the accessibility prototypes page. Code related to these prototypes are in /model/prototype and /view/prototype directories. These features are:
- Controlling the simulation with camera input by moving your fingers in front of the camera.
  - See /view/prototype/QuadrilateralMediaPipe.ts.
- Controlling the simulation with tangible input devices over bluetooth (BLE) connection.
  - See /prototype/view/QuadrilateralBluetoothConnectionButton.ts.
- Controlling the simulation with tangible input devices over a serial connection.
  - Code for this is checked in to https://github.com/scottlambertSLU/electronQuad, see https://github.com/phetsims/quadrilateral/issues/32.
- Controlling a physical device with input from the sim over a serial connection.
  - See /view/prototype/QuadrilateralSerialMessageSender.ts.
- Controlling the simulation with camera input by watching colored markers on a tangible device.
  - Code for this is not checked in, see https://github.com/phetsims/quadrilateral/issues/20 for history.

/model/prototype/TangibleConnectionModel.ts is also the fundamental component for modelling connections for various prototypes.

#### Dispose
Many of the model objects in the sim persist for the lifetime of the sim and do not need to be disposed. For the sound implementation, the user can switch between sound schemes in the preferences dialog, and some parts of the sound implementation do need and implement dispose.

#### Debugging
There is a debugging panel that displays quadrilateral and simulation state. Can be used with query parameter `?showModelValues`.