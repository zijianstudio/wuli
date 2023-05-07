# Fractions Suite implementation notes

There are a few different types of screens, identified below for each simulation:

Build a Fraction (simulation)

- "Build a Fraction" (screen) - building game (no mixed numbers)
- "Mixed Numbers" (screen) - building game (with mixed numbers)
- "Lab" (screen) - building lab (with mixed numbers)

Fraction Matcher (simulation)

- "Fractions" (screen) - matching game (no mixed numbers)
- "Mixed Numbers" (screen) - matching game (with mixed numbers)

Fractions: Equality (simulation)

- "Equality Lab" (screen) - intro-style (with equality)
- "Game" (screen) - matching game (no mixed numbers)

Fractions: Intro (simulation)

- "Intro" (screen) - intro-style (no mixed numbers, larger ranges)
- "Game" (screen) - building game (no mixed numbers)
- "Lab" (screen) - lab (no mixed numbers)

Fractions: Mixed Numbers (simulation)

- "Intro" (screen) intro-style (mixed numbers, smaller ranges)
- "Game" (screen) - building game (mixed numbers)
- "Lab" (screen) - building lab (with mixed numbers)

## Intro-style screens

Each screen has a ContainerSetModel, which has a Container for each whole, and a Cell for each section of a container.
The Piece type is only used for animating or user-dragged pieces, while the Cell is used for the static-looking
appearance in the containers. See model.md for notes on how they are added/removed.

Cells internally track whether they are filled (as far as model computations are concerned), but also whether they
should appear filled (there is no piece animating towards the cell). So when a cell is dropped or the numerator is
increased, the model of the cell is immediately filled, and it triggers animations that when complete will make the cell
"appear" to be filled.

## Building-style screens

Both the main games and the "lab" screens use the main model (BuildingModel). The core animation effects are handled in
the model (like in the intro screens), where both groups and pieces need to be animated in a number of ways. A "group"
is either a mixed/unmixed number group (with 2 or 3 spots where number pieces can go), or is a group of shape-like
containers. Unlike in the intro-style screens, there is no concept of a cell. Instead each container (for shapes) can
hold varying-size pieces, as long as they don't add up to more than 1.

For the game screens, each FractionChallenge is a BuildingModel (containing the groups/pieces/stacks), but there is only
one view for the "currently displayed" challenge, so the views need to be fully disposable.

## Matching-style screens

Locations where pieces can go are called "spots". There are "source" spots (down below, where pieces appear initially),
"scale" spots (for pieces on scales), and "target" spots (collected and in the target visually). The targets are the
regions above where completed matches go.
