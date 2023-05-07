# Resistance in a Wire - Implementation Notes

This document contains notes that will be helpful to developers and future maintainers of this simulation.

## Model

Start by reading the model description model.md

The resistivity, length and cross section area of the wire are described as `Property`. The resistance is a 
 `DerivedProperty` of three previous properties. Changing different variables will manipulate the equation.
 
## View

Listeners to the four properties described in the model are attached to the view. 
The `FormulaNode` is a large piece of the view. It displays the main resistance equation, and will adjust the size of 
the variable letters based on the other values in the equation.

The `WireNode` is a visualization of the formula. It is similar to the `FormulaNode` in that the wire and its properties 
(length, area, resistivity) are manually updated when any of the properties of the wire change.
 
With the sliders in `ControlPanel`, you can adjust any of the variables in the equation except the resistance itself.
This will automatically adjust the view representations (`FormulaNode` and `WireNode`) of the equation.

The 'SliderUnit' describes a 'HSlider' decorated with a title label, a symbol string and a readout display.

This simulation is instrumented with PhET-IO.
