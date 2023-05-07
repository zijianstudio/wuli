# Graphing Lines - implementation notes

This document provides implementation notes for the "Graphing Lines" simulation. The target audience
is software developers who need to review, enhance or maintain the simulation.

Before reading this document, it's recommended that you read the model description in model.txt.

Directory structure under `graphing-lines/js/`:
- `common/` directory contains code used by >1 screen
- other directories are organized by screen. For example, `slope/` is the "Slope" screen.
- directories are further divided into model and view subdirectories, per MVC design pattern

Naming conventions:
- types with prefix "GL" (for Graphing Lines) contain constants for the entire project
- types with prefix "LineForms" are used by the 3 screens that deal with line forms:
  Slope, Slope-Intercept, and Point-Slope

Terminology:
- _manipulators_ are the spheres on the graph that the user drags to change some property of a line
- _challenges_ are the individual problems that the user tries to solve
- a _game_ is a collection of challenges

`Property<T>` is used throughout the model and view for storage of properties and notification of changes.
The sim has both model-specific properties (found throughout the model) and view-specific properties
(encapsulated in `LineFormsViewProperties`).

`Line` is the primary model type used in all modules. See JSdoc in Line.java and model.md for details.

Model-view transforms are used throughout the simulation to map between model and view coordinate
frames. The origin for model and view is at the (0,0) point on the graph.

The most complicated code in the sim deals with rendering of interactive and non-interactive
equations. The design team was very particular about the layout and look of these equations,
and the equations must dynamically change their layout based on what parts of the equation are
interactive and how the equation would simplify. See `EquationNode` and its subtypes for details.

`Challenges` are generated using the Factory pattern, with one factory for each game level.
For example, `ChallengeFactory1` handles challenge generation for game level 1. In the model,
level starts at zero; in the view they start at 1. Functions and types are named using the
view numbering.

