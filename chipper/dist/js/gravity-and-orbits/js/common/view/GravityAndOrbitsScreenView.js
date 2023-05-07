// Copyright 2014-2022, University of Colorado Boulder

/**
 * GravityAndOrbitsScreenView. This file was not in the original Java code, but was created to have the sim follow the
 * PhET HTML5 sim conventions.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import gravityAndOrbits from '../../gravityAndOrbits.js';
import GravityAndOrbitsConstants from '../GravityAndOrbitsConstants.js';
import GravityAndOrbitsControls from './GravityAndOrbitsControls.js';
import GravityAndOrbitsTimeControlNode from './GravityAndOrbitsTimeControlNode.js';
import MassControlPanel from './MassControlPanel.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';

// constants
const MARGIN = 5;
class GravityAndOrbitsScreenView extends ScreenView {
  /**
   * Constructor for GravityAndOrbitsScreenView. This is the ScreenView for both screens in this sim.
   */
  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // Control panel in the upper right of the play area.
    const controlPanelTandem = tandem.createTandem('controlPanel');
    const controlPanel = new GravityAndOrbitsControls(model, this, {
      tandem: controlPanelTandem // The outer Panel below is instrumented, this is just to pass the tandem to children
    });

    // Container so all mass control panels (for each scene) can be hidden/shown at once
    const massesControlPanelTandem = tandem.createTandem('massesControlPanel');
    const massesControlPanel = new VBox();

    // Container so all play areas (for each scene) can be hidden/shown at once
    const playAreaNodeTandem = tandem.createTandem(GravityAndOrbitsConstants.PLAY_AREA_TANDEM_NAME);
    const playAreaNode = new Node({
      tandem: playAreaNodeTandem
    });

    // Add the scene selection controls, one for each of the four modes
    model.getScenes().forEach(scene => {
      const sceneView = scene.sceneView;
      const massControlPanel = new MassControlPanel(scene.getMassSettableBodies(), {
        // Nest under massesControlPanel, see https://github.com/phetsims/gravity-and-orbits/issues/284#issuecomment-554106611
        tandem: massesControlPanelTandem.createTandem(scene.massControlPanelTandemName)
      });
      scene.massControlPanel = massControlPanel;
      playAreaNode.addChild(sceneView);
      massesControlPanel.addChild(massControlPanel);
    });
    this.addChild(playAreaNode);

    // add the control panel on top of the canvases
    this.addChild(new VBox({
      top: this.layoutBounds.top + MARGIN,
      right: this.layoutBounds.right - MARGIN,
      spacing: MARGIN,
      stretch: true,
      children: [new Panel(controlPanel, combineOptions({}, GravityAndOrbitsConstants.CONTROL_PANEL_OPTIONS, {
        tandem: controlPanelTandem,
        visiblePropertyOptions: {
          phetioReadOnly: false
        },
        align: 'left'
      })), new Panel(massesControlPanel, combineOptions({}, GravityAndOrbitsConstants.CONTROL_PANEL_OPTIONS, {
        tandem: massesControlPanelTandem,
        visiblePropertyOptions: {
          phetioReadOnly: false
        },
        align: 'left'
      }))]
    }));

    // Make sure only one scene is visible at a time
    model.sceneProperty.link(scene => {
      for (let i = 0; i < model.sceneList.scenes.length; i++) {
        const gravityAndOrbitsScene = model.sceneList.scenes[i];
        gravityAndOrbitsScene.sceneView.visible = false;
        if (gravityAndOrbitsScene.massControlPanel) {
          gravityAndOrbitsScene.massControlPanel.visible = false;
        }
      }
      scene.sceneView.visible = true;
      if (scene.massControlPanel) {
        scene.massControlPanel.visible = true;
      }
      model.updateActiveModule();
    });

    // Add play/pause, rewind, and step buttons
    const timeControlNode = new GravityAndOrbitsTimeControlNode(model, {
      tandem: tandem.createTandem('timeControlNode')
    });
    this.addChild(timeControlNode);
    timeControlNode.setPlayPauseButtonCenter(new Vector2(this.layoutBounds.centerX - 117, this.layoutBounds.bottom - timeControlNode.height / 2 - MARGIN));

    // spacing to put the SpeedRadioButtonGroup at the edge of the layout bounds - current spacing
    // plus distance from the left of the TimeControlNode to left edge of layout bounds
    timeControlNode.setButtonGroupXSpacing(timeControlNode.getButtonGroupXSpacing() + timeControlNode.left - this.layoutBounds.left - MARGIN);

    // Create and add the Reset All Button in the bottom right, which resets the model
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that are in progress
        model.reset();
      },
      right: this.layoutBounds.right - MARGIN - 4,
      bottom: this.layoutBounds.bottom - MARGIN - 4,
      // slight difference centers below panels
      tandem: tandem.createTandem('resetAllButton')
    });
    this.addChild(resetAllButton);
  }
}
gravityAndOrbits.register('GravityAndOrbitsScreenView', GravityAndOrbitsScreenView);
export default GravityAndOrbitsScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIlJlc2V0QWxsQnV0dG9uIiwiTm9kZSIsIlZCb3giLCJQYW5lbCIsImdyYXZpdHlBbmRPcmJpdHMiLCJHcmF2aXR5QW5kT3JiaXRzQ29uc3RhbnRzIiwiR3Jhdml0eUFuZE9yYml0c0NvbnRyb2xzIiwiR3Jhdml0eUFuZE9yYml0c1RpbWVDb250cm9sTm9kZSIsIk1hc3NDb250cm9sUGFuZWwiLCJjb21iaW5lT3B0aW9ucyIsIk1BUkdJTiIsIkdyYXZpdHlBbmRPcmJpdHNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImNvbnRyb2xQYW5lbFRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImNvbnRyb2xQYW5lbCIsIm1hc3Nlc0NvbnRyb2xQYW5lbFRhbmRlbSIsIm1hc3Nlc0NvbnRyb2xQYW5lbCIsInBsYXlBcmVhTm9kZVRhbmRlbSIsIlBMQVlfQVJFQV9UQU5ERU1fTkFNRSIsInBsYXlBcmVhTm9kZSIsImdldFNjZW5lcyIsImZvckVhY2giLCJzY2VuZSIsInNjZW5lVmlldyIsIm1hc3NDb250cm9sUGFuZWwiLCJnZXRNYXNzU2V0dGFibGVCb2RpZXMiLCJtYXNzQ29udHJvbFBhbmVsVGFuZGVtTmFtZSIsImFkZENoaWxkIiwidG9wIiwibGF5b3V0Qm91bmRzIiwicmlnaHQiLCJzcGFjaW5nIiwic3RyZXRjaCIsImNoaWxkcmVuIiwiQ09OVFJPTF9QQU5FTF9PUFRJT05TIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwiYWxpZ24iLCJzY2VuZVByb3BlcnR5IiwibGluayIsImkiLCJzY2VuZUxpc3QiLCJzY2VuZXMiLCJsZW5ndGgiLCJncmF2aXR5QW5kT3JiaXRzU2NlbmUiLCJ2aXNpYmxlIiwidXBkYXRlQWN0aXZlTW9kdWxlIiwidGltZUNvbnRyb2xOb2RlIiwic2V0UGxheVBhdXNlQnV0dG9uQ2VudGVyIiwiY2VudGVyWCIsImJvdHRvbSIsImhlaWdodCIsInNldEJ1dHRvbkdyb3VwWFNwYWNpbmciLCJnZXRCdXR0b25Hcm91cFhTcGFjaW5nIiwibGVmdCIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR3Jhdml0eUFuZE9yYml0c1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3Jhdml0eUFuZE9yYml0c1NjcmVlblZpZXcuIFRoaXMgZmlsZSB3YXMgbm90IGluIHRoZSBvcmlnaW5hbCBKYXZhIGNvZGUsIGJ1dCB3YXMgY3JlYXRlZCB0byBoYXZlIHRoZSBzaW0gZm9sbG93IHRoZVxyXG4gKiBQaEVUIEhUTUw1IHNpbSBjb252ZW50aW9ucy5cclxuICpcclxuICogQGF1dGhvciBBYXJvbiBEYXZpcyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgUmVzZXRBbGxCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUmVzZXRBbGxCdXR0b24uanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7IFBhbmVsT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBncmF2aXR5QW5kT3JiaXRzIGZyb20gJy4uLy4uL2dyYXZpdHlBbmRPcmJpdHMuanMnO1xyXG5pbXBvcnQgR3Jhdml0eUFuZE9yYml0c0NvbnN0YW50cyBmcm9tICcuLi9HcmF2aXR5QW5kT3JiaXRzQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEdyYXZpdHlBbmRPcmJpdHNDb250cm9scyBmcm9tICcuL0dyYXZpdHlBbmRPcmJpdHNDb250cm9scy5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzVGltZUNvbnRyb2xOb2RlIGZyb20gJy4vR3Jhdml0eUFuZE9yYml0c1RpbWVDb250cm9sTm9kZS5qcyc7XHJcbmltcG9ydCBNYXNzQ29udHJvbFBhbmVsIGZyb20gJy4vTWFzc0NvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBHcmF2aXR5QW5kT3JiaXRzTW9kZWwgZnJvbSAnLi4vbW9kZWwvR3Jhdml0eUFuZE9yYml0c01vZGVsLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVJHSU4gPSA1O1xyXG5cclxuY2xhc3MgR3Jhdml0eUFuZE9yYml0c1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIEdyYXZpdHlBbmRPcmJpdHNTY3JlZW5WaWV3LiBUaGlzIGlzIHRoZSBTY3JlZW5WaWV3IGZvciBib3RoIHNjcmVlbnMgaW4gdGhpcyBzaW0uXHJcbiAgICovXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogR3Jhdml0eUFuZE9yYml0c01vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENvbnRyb2wgcGFuZWwgaW4gdGhlIHVwcGVyIHJpZ2h0IG9mIHRoZSBwbGF5IGFyZWEuXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWxUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29udHJvbFBhbmVsJyApO1xyXG4gICAgY29uc3QgY29udHJvbFBhbmVsID0gbmV3IEdyYXZpdHlBbmRPcmJpdHNDb250cm9scyggbW9kZWwsIHRoaXMsIHtcclxuICAgICAgdGFuZGVtOiBjb250cm9sUGFuZWxUYW5kZW0gLy8gVGhlIG91dGVyIFBhbmVsIGJlbG93IGlzIGluc3RydW1lbnRlZCwgdGhpcyBpcyBqdXN0IHRvIHBhc3MgdGhlIHRhbmRlbSB0byBjaGlsZHJlblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIENvbnRhaW5lciBzbyBhbGwgbWFzcyBjb250cm9sIHBhbmVscyAoZm9yIGVhY2ggc2NlbmUpIGNhbiBiZSBoaWRkZW4vc2hvd24gYXQgb25jZVxyXG4gICAgY29uc3QgbWFzc2VzQ29udHJvbFBhbmVsVGFuZGVtID0gdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21hc3Nlc0NvbnRyb2xQYW5lbCcgKTtcclxuICAgIGNvbnN0IG1hc3Nlc0NvbnRyb2xQYW5lbCA9IG5ldyBWQm94KCk7XHJcblxyXG4gICAgLy8gQ29udGFpbmVyIHNvIGFsbCBwbGF5IGFyZWFzIChmb3IgZWFjaCBzY2VuZSkgY2FuIGJlIGhpZGRlbi9zaG93biBhdCBvbmNlXHJcbiAgICBjb25zdCBwbGF5QXJlYU5vZGVUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCBHcmF2aXR5QW5kT3JiaXRzQ29uc3RhbnRzLlBMQVlfQVJFQV9UQU5ERU1fTkFNRSApO1xyXG4gICAgY29uc3QgcGxheUFyZWFOb2RlID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFuZGVtOiBwbGF5QXJlYU5vZGVUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIHNjZW5lIHNlbGVjdGlvbiBjb250cm9scywgb25lIGZvciBlYWNoIG9mIHRoZSBmb3VyIG1vZGVzXHJcbiAgICBtb2RlbC5nZXRTY2VuZXMoKS5mb3JFYWNoKCBzY2VuZSA9PiB7XHJcbiAgICAgIGNvbnN0IHNjZW5lVmlldyA9IHNjZW5lLnNjZW5lVmlldztcclxuXHJcbiAgICAgIGNvbnN0IG1hc3NDb250cm9sUGFuZWwgPSBuZXcgTWFzc0NvbnRyb2xQYW5lbCggc2NlbmUuZ2V0TWFzc1NldHRhYmxlQm9kaWVzKCksIHtcclxuXHJcbiAgICAgICAgLy8gTmVzdCB1bmRlciBtYXNzZXNDb250cm9sUGFuZWwsIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZ3Jhdml0eS1hbmQtb3JiaXRzL2lzc3Vlcy8yODQjaXNzdWVjb21tZW50LTU1NDEwNjYxMVxyXG4gICAgICAgIHRhbmRlbTogbWFzc2VzQ29udHJvbFBhbmVsVGFuZGVtLmNyZWF0ZVRhbmRlbSggc2NlbmUubWFzc0NvbnRyb2xQYW5lbFRhbmRlbU5hbWUgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIHNjZW5lLm1hc3NDb250cm9sUGFuZWwgPSBtYXNzQ29udHJvbFBhbmVsO1xyXG5cclxuICAgICAgcGxheUFyZWFOb2RlLmFkZENoaWxkKCBzY2VuZVZpZXcgKTtcclxuICAgICAgbWFzc2VzQ29udHJvbFBhbmVsLmFkZENoaWxkKCBtYXNzQ29udHJvbFBhbmVsICk7XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwbGF5QXJlYU5vZGUgKTtcclxuXHJcbiAgICAvLyBhZGQgdGhlIGNvbnRyb2wgcGFuZWwgb24gdG9wIG9mIHRoZSBjYW52YXNlc1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IFZCb3goIHtcclxuICAgICAgdG9wOiB0aGlzLmxheW91dEJvdW5kcy50b3AgKyBNQVJHSU4sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIE1BUkdJTixcclxuICAgICAgc3BhY2luZzogTUFSR0lOLFxyXG4gICAgICBzdHJldGNoOiB0cnVlLFxyXG4gICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgIG5ldyBQYW5lbCggY29udHJvbFBhbmVsLCBjb21iaW5lT3B0aW9uczxQYW5lbE9wdGlvbnM+KCB7fSwgR3Jhdml0eUFuZE9yYml0c0NvbnN0YW50cy5DT05UUk9MX1BBTkVMX09QVElPTlMsIHtcclxuICAgICAgICAgIHRhbmRlbTogY29udHJvbFBhbmVsVGFuZGVtLFxyXG4gICAgICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgICAgICBwaGV0aW9SZWFkT25seTogZmFsc2VcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBhbGlnbjogJ2xlZnQnXHJcbiAgICAgICAgfSApICksXHJcbiAgICAgICAgbmV3IFBhbmVsKCBtYXNzZXNDb250cm9sUGFuZWwsIGNvbWJpbmVPcHRpb25zPFBhbmVsT3B0aW9ucz4oIHt9LCBHcmF2aXR5QW5kT3JiaXRzQ29uc3RhbnRzLkNPTlRST0xfUEFORUxfT1BUSU9OUywge1xyXG4gICAgICAgICAgdGFuZGVtOiBtYXNzZXNDb250cm9sUGFuZWxUYW5kZW0sXHJcbiAgICAgICAgICB2aXNpYmxlUHJvcGVydHlPcHRpb25zOiB7XHJcbiAgICAgICAgICAgIHBoZXRpb1JlYWRPbmx5OiBmYWxzZVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGFsaWduOiAnbGVmdCdcclxuICAgICAgICB9ICkgKVxyXG4gICAgICBdXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBNYWtlIHN1cmUgb25seSBvbmUgc2NlbmUgaXMgdmlzaWJsZSBhdCBhIHRpbWVcclxuICAgIG1vZGVsLnNjZW5lUHJvcGVydHkubGluayggc2NlbmUgPT4ge1xyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBtb2RlbC5zY2VuZUxpc3Quc2NlbmVzLmxlbmd0aDsgaSsrICkge1xyXG4gICAgICAgIGNvbnN0IGdyYXZpdHlBbmRPcmJpdHNTY2VuZSA9IG1vZGVsLnNjZW5lTGlzdC5zY2VuZXNbIGkgXTtcclxuICAgICAgICBncmF2aXR5QW5kT3JiaXRzU2NlbmUuc2NlbmVWaWV3LnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICBpZiAoIGdyYXZpdHlBbmRPcmJpdHNTY2VuZS5tYXNzQ29udHJvbFBhbmVsICkge1xyXG4gICAgICAgICAgZ3Jhdml0eUFuZE9yYml0c1NjZW5lLm1hc3NDb250cm9sUGFuZWwudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzY2VuZS5zY2VuZVZpZXcudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIGlmICggc2NlbmUubWFzc0NvbnRyb2xQYW5lbCApIHtcclxuICAgICAgICBzY2VuZS5tYXNzQ29udHJvbFBhbmVsLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIG1vZGVsLnVwZGF0ZUFjdGl2ZU1vZHVsZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFkZCBwbGF5L3BhdXNlLCByZXdpbmQsIGFuZCBzdGVwIGJ1dHRvbnNcclxuICAgIGNvbnN0IHRpbWVDb250cm9sTm9kZSA9IG5ldyBHcmF2aXR5QW5kT3JiaXRzVGltZUNvbnRyb2xOb2RlKCBtb2RlbCwge1xyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd0aW1lQ29udHJvbE5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRpbWVDb250cm9sTm9kZSApO1xyXG4gICAgdGltZUNvbnRyb2xOb2RlLnNldFBsYXlQYXVzZUJ1dHRvbkNlbnRlciggbmV3IFZlY3RvcjIoIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlclggLSAxMTcsIHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIHRpbWVDb250cm9sTm9kZS5oZWlnaHQgLyAyIC0gTUFSR0lOICkgKTtcclxuXHJcbiAgICAvLyBzcGFjaW5nIHRvIHB1dCB0aGUgU3BlZWRSYWRpb0J1dHRvbkdyb3VwIGF0IHRoZSBlZGdlIG9mIHRoZSBsYXlvdXQgYm91bmRzIC0gY3VycmVudCBzcGFjaW5nXHJcbiAgICAvLyBwbHVzIGRpc3RhbmNlIGZyb20gdGhlIGxlZnQgb2YgdGhlIFRpbWVDb250cm9sTm9kZSB0byBsZWZ0IGVkZ2Ugb2YgbGF5b3V0IGJvdW5kc1xyXG4gICAgdGltZUNvbnRyb2xOb2RlLnNldEJ1dHRvbkdyb3VwWFNwYWNpbmcoIHRpbWVDb250cm9sTm9kZS5nZXRCdXR0b25Hcm91cFhTcGFjaW5nKCkgKyB0aW1lQ29udHJvbE5vZGUubGVmdCAtIHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgLSBNQVJHSU4gKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYW5kIGFkZCB0aGUgUmVzZXQgQWxsIEJ1dHRvbiBpbiB0aGUgYm90dG9tIHJpZ2h0LCB3aGljaCByZXNldHMgdGhlIG1vZGVsXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7IC8vIGNhbmNlbCBpbnRlcmFjdGlvbnMgdGhhdCBhcmUgaW4gcHJvZ3Jlc3NcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICByaWdodDogdGhpcy5sYXlvdXRCb3VuZHMucmlnaHQgLSBNQVJHSU4gLSA0LFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIE1BUkdJTiAtIDQsIC8vIHNsaWdodCBkaWZmZXJlbmNlIGNlbnRlcnMgYmVsb3cgcGFuZWxzXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCByZXNldEFsbEJ1dHRvbiApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUFuZE9yYml0cy5yZWdpc3RlciggJ0dyYXZpdHlBbmRPcmJpdHNTY3JlZW5WaWV3JywgR3Jhdml0eUFuZE9yYml0c1NjcmVlblZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgR3Jhdml0eUFuZE9y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