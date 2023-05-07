# Reactants, Products and Leftovers - implementation notes

Start by reading [model.md](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/doc/model.md).

Reactants, products and leftovers are implemented by class [Substance](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/common/model/Substance.js).

Chemical reactions are implemented by class [Reaction](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/common/model/Reaction.js). The algorithm for computing quantities (described in model.md)
is implemented in methods `getNumberOfReactions` and `updateQuantities`.

The "Sandwiches" analogy is implemented as a single-product reaction. The sandwich recipe defines the reaction equation.
Sandwich ingredients are reactants (and leftovers), and the completed sandwich is the product. See [SandwichRecipe](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/sandwiches/model/SandwichRecipe.js).

The Game screen is controlled by a state machine. There are 3 top-level "phases" of a game, as described in
[GamePhase](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/game/model/GamePhase.js). While playing a challenge, the Game will be in one of the "states" described in [PlayState](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/game/model/PlayState.js).

Generation of challenges for the Game screen is described in the documentation for [ChallengeFactory](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/game/model/ChallengeFactory.js).

Game 'level' is numbered starting from zero throughout the model, and displayed starting from 1 in the view.
Ie, model.level === 0 is displayed as 'Level 1'.

In this sim, view components typically have a lifetime that is shorter than their associated model components.
Those view components implement a dispose function, which unlinks observers from AXON properties in the model.
To prevent memory leaks, it's essential to call dispose when you're done with view components. Failure to unlink
from AXON properties tends to be the main cause of memory leaks.

Another source of memory leaks (see [GitHub issue #18](https://github.com/phetsims/reactants-products-and-leftovers/issues/18)) is `Substance.iconProperty`. This Property's value is a scenery Node
that is used to represent an instance of a `Substance`. Scenery is a DAG and allows one instance of a Node to
appear in the scenegraph in multiple places, with 2 caveats: (1) a Node cannot be a sibling of itself, and
(2) transforming a node will do so everywhere that it appears. Because a Substance's icon can appear in multiple
places in the view (equation, Before/After box,...), the icon must be wrapped in another node, so that we don't
accidentally make it a sibling of itself, or attempt to position it. VERY IMPORTANT is that when the wrapper node
is removed from the scenegraph, the Substance's icon needs to be explicitly removed from the wrapper.  This is
because scenery nodes keep a reference to their parent. If we don't explicitly remove the icon from the scene graph,
then all of its ancestors will be retained, creating a memory leak. More details can be found in [SubstanceIcon](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/common/view/SubstanceIcon.js), which
is the wrapper for Substance icons.

An aspect of performance ([GitHub issue #17](https://github.com/phetsims/reactants-products-and-leftovers/issues/17)) deserves some explanation. In the Game, switching between challenges involves
some costly operations: `removeChild` of the previous `ChallengeNode`, creation of a new `ChallengeNode` (a relatively large subtree),
and `addChild` of that new `ChallengeNode`. This made the Game feel a bit sluggish and unresponsive. The solution was
to hide these costs in the animation loop, handling them immediately after displaying a new challenge, when the
user is liable to be distracted with looking at what has just been displayed. In this interval, the previous
`ChallengeNode` is removed, and the next `ChallengeNode` is created and added (but not made visible). See [PlayNode.step](https://github.com/phetsims/reactants-products-and-leftovers/blob/master/js/game/view/PlayNode.js)
for more details.
