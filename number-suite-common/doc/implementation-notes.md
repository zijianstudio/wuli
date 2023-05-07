# Number Play - implementation notes


## Game screen

Both games rely on the abstract classes
[NumberPlayGameLevel](https://github.com/phetsims/number-play/blob/master/js/game/model/NumberPlayGameLevel.ts) and
[NumberPlayGameLevelNode](https://github.com/phetsims/number-play/blob/master/js/game/view/NumberPlayGameLevelNode.ts).

The 'Counting' game builds upon the counting areas that are used in the _Ten_, _Twenty_, and _Compare_ screens, but doesn't
include the controls for changing the object type or adding/removing objects.
[Subitizer](https://github.com/phetsims/number-play/blob/master/js/game/model/Subitizer.ts) controls the game sequence
and determines the shapes to show in the 'Subitize' game.

[NumberPlayGameAnswerButtons](https://github.com/phetsims/number-play/blob/master/js/game/view/NumberPlayGameAnswerButtons.ts)
are used in both games for the user to input their answer. A smiley face is shown when the correct answer is selected. 
When an incorrect answer button is pressed, the button is disabled, and a frowny face is briefly shown. 


## Memory Management

### Allocation
The majority of the elements in the sim are statically allocated at startup, and exist for the lifetime of the sim. The exceptions to that are: `CountingObjectNode`, `DraggableTenFrameNode`, `CardNode` (and subclasses). These classes must all implement `dispose` or use `unlink`/ `removeListener` if they are storing references outside of themselves.

### Listeners
Unless otherwise noted in the code all uses of `link`, `addListener`, etc. do NOT need a corresponding `unlink` or `removeListener`

### Disposal
Sim-specific classes whose instances exist for the life of the sim are not intended to be disposed and their `dispose` implementation looks like this:

```ts
public override dispose(): void {
  assert && assert( false, 'dispose is not supported, exists for the lifetime of the sim' );
  super.dispose();
}
```