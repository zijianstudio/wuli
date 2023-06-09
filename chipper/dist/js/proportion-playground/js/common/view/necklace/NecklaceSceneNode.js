// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows the necklace scene, including controls and the necklace.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { HBox } from '../../../../../scenery/js/imports.js';
import proportionPlayground from '../../../proportionPlayground.js';
import SceneNode from '../SceneNode.js';
import NecklaceControl from './NecklaceControl.js';
import NecklaceGraphicNode from './NecklaceGraphicNode.js';
import PatternPanel from './PatternPanel.js';

// constants
const ICON_OPTIONS = {
  scale: 0.2,
  pickable: false
};
class NecklaceSceneNode extends SceneNode {
  /**
   * @param {NecklaceScene} scene - the model
   * @param {Bounds2} layoutBounds - the visible bounds of the sim
   * @param {Tandem} tandem
   */
  constructor(scene, layoutBounds, tandem) {
    // Create the left and right necklace nodes, each with their own NumberPickers
    const leftNecklaceControl = new NecklaceControl(scene.leftNecklace, tandem.createTandem('leftNecklaceControl'));
    const rightNecklaceControl = new NecklaceControl(scene.rightNecklace, tandem.createTandem('rightNecklaceControl'));
    const patternPanel = new PatternPanel(scene.leftNecklace, scene.rightNecklace, {
      tandem: tandem.createTandem('patternPanel')
    });

    // Super call
    super(scene, layoutBounds, {
      sceneIcon: NecklaceGraphicNode.createStaticNecklace(14, 7, {
        scale: 0.25,
        pickable: false
      }),
      leftControl: leftNecklaceControl,
      rightControl: rightNecklaceControl,
      canCenterControlButton: false,
      // due to the pattern panel
      leftSwitchIcon: NecklaceGraphicNode.createStaticNecklace(14, 7, ICON_OPTIONS),
      rightSwitchIcon: new HBox({
        children: [NecklaceGraphicNode.createStaticNecklace(10, 5, ICON_OPTIONS), NecklaceGraphicNode.createStaticNecklace(14, 7, ICON_OPTIONS)]
      }),
      tandem: tandem
    });

    // When 2 necklaces are selected, show both
    scene.showBothProperty.link(showBoth => {
      // Controllable necklace nodes have x=0 at their center
      if (showBoth) {
        const ratio = 2 / 7;
        leftNecklaceControl.x = layoutBounds.width * ratio;
        rightNecklaceControl.x = layoutBounds.width * (1 - ratio);
      } else {
        leftNecklaceControl.x = layoutBounds.centerX;
      }
      this.updateControlButton();
    });
    this.addChild(patternPanel);

    // Position the pattern panel
    scene.showBothProperty.link(showBoth => {
      patternPanel.top = 85;
      patternPanel.centerX = showBoth ? layoutBounds.centerX : layoutBounds.right * 0.73;
    });
  }
}
proportionPlayground.register('NecklaceSceneNode', NecklaceSceneNode);
export default NecklaceSceneNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIQm94IiwicHJvcG9ydGlvblBsYXlncm91bmQiLCJTY2VuZU5vZGUiLCJOZWNrbGFjZUNvbnRyb2wiLCJOZWNrbGFjZUdyYXBoaWNOb2RlIiwiUGF0dGVyblBhbmVsIiwiSUNPTl9PUFRJT05TIiwic2NhbGUiLCJwaWNrYWJsZSIsIk5lY2tsYWNlU2NlbmVOb2RlIiwiY29uc3RydWN0b3IiLCJzY2VuZSIsImxheW91dEJvdW5kcyIsInRhbmRlbSIsImxlZnROZWNrbGFjZUNvbnRyb2wiLCJsZWZ0TmVja2xhY2UiLCJjcmVhdGVUYW5kZW0iLCJyaWdodE5lY2tsYWNlQ29udHJvbCIsInJpZ2h0TmVja2xhY2UiLCJwYXR0ZXJuUGFuZWwiLCJzY2VuZUljb24iLCJjcmVhdGVTdGF0aWNOZWNrbGFjZSIsImxlZnRDb250cm9sIiwicmlnaHRDb250cm9sIiwiY2FuQ2VudGVyQ29udHJvbEJ1dHRvbiIsImxlZnRTd2l0Y2hJY29uIiwicmlnaHRTd2l0Y2hJY29uIiwiY2hpbGRyZW4iLCJzaG93Qm90aFByb3BlcnR5IiwibGluayIsInNob3dCb3RoIiwicmF0aW8iLCJ4Iiwid2lkdGgiLCJjZW50ZXJYIiwidXBkYXRlQ29udHJvbEJ1dHRvbiIsImFkZENoaWxkIiwidG9wIiwicmlnaHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk5lY2tsYWNlU2NlbmVOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNob3dzIHRoZSBuZWNrbGFjZSBzY2VuZSwgaW5jbHVkaW5nIGNvbnRyb2xzIGFuZCB0aGUgbmVja2xhY2UuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgSEJveCB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBwcm9wb3J0aW9uUGxheWdyb3VuZCBmcm9tICcuLi8uLi8uLi9wcm9wb3J0aW9uUGxheWdyb3VuZC5qcyc7XHJcbmltcG9ydCBTY2VuZU5vZGUgZnJvbSAnLi4vU2NlbmVOb2RlLmpzJztcclxuaW1wb3J0IE5lY2tsYWNlQ29udHJvbCBmcm9tICcuL05lY2tsYWNlQ29udHJvbC5qcyc7XHJcbmltcG9ydCBOZWNrbGFjZUdyYXBoaWNOb2RlIGZyb20gJy4vTmVja2xhY2VHcmFwaGljTm9kZS5qcyc7XHJcbmltcG9ydCBQYXR0ZXJuUGFuZWwgZnJvbSAnLi9QYXR0ZXJuUGFuZWwuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElDT05fT1BUSU9OUyA9IHtcclxuICBzY2FsZTogMC4yLFxyXG4gIHBpY2thYmxlOiBmYWxzZVxyXG59O1xyXG5cclxuY2xhc3MgTmVja2xhY2VTY2VuZU5vZGUgZXh0ZW5kcyBTY2VuZU5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7TmVja2xhY2VTY2VuZX0gc2NlbmUgLSB0aGUgbW9kZWxcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGxheW91dEJvdW5kcyAtIHRoZSB2aXNpYmxlIGJvdW5kcyBvZiB0aGUgc2ltXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBzY2VuZSwgbGF5b3V0Qm91bmRzLCB0YW5kZW0gKSB7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBsZWZ0IGFuZCByaWdodCBuZWNrbGFjZSBub2RlcywgZWFjaCB3aXRoIHRoZWlyIG93biBOdW1iZXJQaWNrZXJzXHJcbiAgICBjb25zdCBsZWZ0TmVja2xhY2VDb250cm9sID0gbmV3IE5lY2tsYWNlQ29udHJvbCggc2NlbmUubGVmdE5lY2tsYWNlLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbGVmdE5lY2tsYWNlQ29udHJvbCcgKSApO1xyXG4gICAgY29uc3QgcmlnaHROZWNrbGFjZUNvbnRyb2wgPSBuZXcgTmVja2xhY2VDb250cm9sKCBzY2VuZS5yaWdodE5lY2tsYWNlLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAncmlnaHROZWNrbGFjZUNvbnRyb2wnICkgKTtcclxuICAgIGNvbnN0IHBhdHRlcm5QYW5lbCA9IG5ldyBQYXR0ZXJuUGFuZWwoIHNjZW5lLmxlZnROZWNrbGFjZSwgc2NlbmUucmlnaHROZWNrbGFjZSwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdwYXR0ZXJuUGFuZWwnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTdXBlciBjYWxsXHJcbiAgICBzdXBlciggc2NlbmUsIGxheW91dEJvdW5kcywge1xyXG4gICAgICBzY2VuZUljb246IE5lY2tsYWNlR3JhcGhpY05vZGUuY3JlYXRlU3RhdGljTmVja2xhY2UoIDE0LCA3LCB7IHNjYWxlOiAwLjI1LCBwaWNrYWJsZTogZmFsc2UgfSApLFxyXG4gICAgICBsZWZ0Q29udHJvbDogbGVmdE5lY2tsYWNlQ29udHJvbCxcclxuICAgICAgcmlnaHRDb250cm9sOiByaWdodE5lY2tsYWNlQ29udHJvbCxcclxuICAgICAgY2FuQ2VudGVyQ29udHJvbEJ1dHRvbjogZmFsc2UsIC8vIGR1ZSB0byB0aGUgcGF0dGVybiBwYW5lbFxyXG4gICAgICBsZWZ0U3dpdGNoSWNvbjogTmVja2xhY2VHcmFwaGljTm9kZS5jcmVhdGVTdGF0aWNOZWNrbGFjZSggMTQsIDcsIElDT05fT1BUSU9OUyApLFxyXG4gICAgICByaWdodFN3aXRjaEljb246IG5ldyBIQm94KCB7XHJcbiAgICAgICAgY2hpbGRyZW46IFtcclxuICAgICAgICAgIE5lY2tsYWNlR3JhcGhpY05vZGUuY3JlYXRlU3RhdGljTmVja2xhY2UoIDEwLCA1LCBJQ09OX09QVElPTlMgKSwgTmVja2xhY2VHcmFwaGljTm9kZS5jcmVhdGVTdGF0aWNOZWNrbGFjZSggMTQsIDcsIElDT05fT1BUSU9OUyApIF1cclxuICAgICAgfSApLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gMiBuZWNrbGFjZXMgYXJlIHNlbGVjdGVkLCBzaG93IGJvdGhcclxuICAgIHNjZW5lLnNob3dCb3RoUHJvcGVydHkubGluayggc2hvd0JvdGggPT4ge1xyXG4gICAgICAvLyBDb250cm9sbGFibGUgbmVja2xhY2Ugbm9kZXMgaGF2ZSB4PTAgYXQgdGhlaXIgY2VudGVyXHJcbiAgICAgIGlmICggc2hvd0JvdGggKSB7XHJcbiAgICAgICAgY29uc3QgcmF0aW8gPSAyIC8gNztcclxuICAgICAgICBsZWZ0TmVja2xhY2VDb250cm9sLnggPSBsYXlvdXRCb3VuZHMud2lkdGggKiByYXRpbztcclxuICAgICAgICByaWdodE5lY2tsYWNlQ29udHJvbC54ID0gbGF5b3V0Qm91bmRzLndpZHRoICogKCAxIC0gcmF0aW8gKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBsZWZ0TmVja2xhY2VDb250cm9sLnggPSBsYXlvdXRCb3VuZHMuY2VudGVyWDtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLnVwZGF0ZUNvbnRyb2xCdXR0b24oKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBwYXR0ZXJuUGFuZWwgKTtcclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgcGF0dGVybiBwYW5lbFxyXG4gICAgc2NlbmUuc2hvd0JvdGhQcm9wZXJ0eS5saW5rKCBzaG93Qm90aCA9PiB7XHJcbiAgICAgIHBhdHRlcm5QYW5lbC50b3AgPSA4NTtcclxuICAgICAgcGF0dGVyblBhbmVsLmNlbnRlclggPSBzaG93Qm90aCA/IGxheW91dEJvdW5kcy5jZW50ZXJYIDogbGF5b3V0Qm91bmRzLnJpZ2h0ICogMC43MztcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbnByb3BvcnRpb25QbGF5Z3JvdW5kLnJlZ2lzdGVyKCAnTmVja2xhY2VTY2VuZU5vZGUnLCBOZWNrbGFjZVNjZW5lTm9kZSApO1xyXG5cclxuZXhwb3J0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