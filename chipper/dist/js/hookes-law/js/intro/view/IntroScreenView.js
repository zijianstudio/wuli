// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the "Intro" screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node, VBox } from '../../../../scenery/js/imports.js';
import HookesLawConstants from '../../common/HookesLawConstants.js';
import hookesLaw from '../../hookesLaw.js';
import IntroAnimator from './IntroAnimator.js';
import IntroSystemNode from './IntroSystemNode.js';
import IntroViewProperties from './IntroViewProperties.js';
import IntroVisibilityPanel from './IntroVisibilityPanel.js';
import NumberOfSystemsRadioButtonGroup from './NumberOfSystemsRadioButtonGroup.js';
export default class IntroScreenView extends ScreenView {
  // Animates the transitions between 1 and 2 systems

  constructor(model, tandem) {
    super({
      tandem: tandem
    });

    // View length of 1 meter of displacement
    const unitDisplacementLength = HookesLawConstants.UNIT_DISPLACEMENT_X;

    // Properties that are specific to the view
    const viewProperties = new IntroViewProperties(tandem.createTandem('viewProperties'));

    // Visibility controls
    const visibilityPanel = new IntroVisibilityPanel(viewProperties, {
      maxWidth: 250,
      // constrain width for i18n, determining empirically
      tandem: tandem.createTandem('visibilityPanel')
    });

    // Radio buttons for switching between 1 and 2 systems
    const numberOfSystemsRadioButtonGroup = new NumberOfSystemsRadioButtonGroup(viewProperties.numberOfSystemsProperty, tandem.createTandem('numberOfSystemsRadioButtonGroup'));

    // horizontally center the controls
    const controls = new VBox({
      spacing: 10,
      children: [visibilityPanel, numberOfSystemsRadioButtonGroup],
      right: this.layoutBounds.right - 10,
      top: this.layoutBounds.top + 10
    });

    // System 1
    const system1Node = new IntroSystemNode(model.system1, viewProperties, {
      unitDisplacementLength: unitDisplacementLength,
      systemNumber: 1,
      left: this.layoutBounds.left + 15,
      //careful! position this so that max applied force vector doesn't go offscreen or overlap control panel
      // y position is handled by this.animator
      tandem: tandem.createTandem('system1Node')
    });
    assert && assert(system1Node.height <= this.layoutBounds.height / 2, 'system1Node is taller than the space available for it');

    // System 2
    const system2Node = new IntroSystemNode(model.system2, viewProperties, {
      unitDisplacementLength: unitDisplacementLength,
      systemNumber: 2,
      left: system1Node.left,
      // y position is handled by this.animator
      tandem: tandem.createTandem('system2Node')
    });
    assert && assert(system2Node.height <= this.layoutBounds.height / 2, 'system2Node is taller than the space available for it');

    // Reset All button, bottom right
    const resetAllButton = new ResetAllButton({
      listener: () => {
        model.reset();
        viewProperties.reset();
      },
      right: this.layoutBounds.maxX - 15,
      bottom: this.layoutBounds.maxY - 15,
      tandem: tandem.createTandem('resetAllButton')
    });
    const screenViewRootNode = new Node({
      children: [controls, system1Node, system2Node, resetAllButton]
    });
    this.addChild(screenViewRootNode);
    this.animator = new IntroAnimator(viewProperties.numberOfSystemsProperty, system1Node, system2Node, this.layoutBounds, tandem.createTandem('animator'));
  }

  /**
   * Advances animation.
   * @param dt - time step, in seconds
   */
  step(dt) {
    this.animator.step(dt);
    super.step(dt);
  }
}
hookesLaw.register('IntroScreenView', IntroScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTY3JlZW5WaWV3IiwiUmVzZXRBbGxCdXR0b24iLCJOb2RlIiwiVkJveCIsIkhvb2tlc0xhd0NvbnN0YW50cyIsImhvb2tlc0xhdyIsIkludHJvQW5pbWF0b3IiLCJJbnRyb1N5c3RlbU5vZGUiLCJJbnRyb1ZpZXdQcm9wZXJ0aWVzIiwiSW50cm9WaXNpYmlsaXR5UGFuZWwiLCJOdW1iZXJPZlN5c3RlbXNSYWRpb0J1dHRvbkdyb3VwIiwiSW50cm9TY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInVuaXREaXNwbGFjZW1lbnRMZW5ndGgiLCJVTklUX0RJU1BMQUNFTUVOVF9YIiwidmlld1Byb3BlcnRpZXMiLCJjcmVhdGVUYW5kZW0iLCJ2aXNpYmlsaXR5UGFuZWwiLCJtYXhXaWR0aCIsIm51bWJlck9mU3lzdGVtc1JhZGlvQnV0dG9uR3JvdXAiLCJudW1iZXJPZlN5c3RlbXNQcm9wZXJ0eSIsImNvbnRyb2xzIiwic3BhY2luZyIsImNoaWxkcmVuIiwicmlnaHQiLCJsYXlvdXRCb3VuZHMiLCJ0b3AiLCJzeXN0ZW0xTm9kZSIsInN5c3RlbTEiLCJzeXN0ZW1OdW1iZXIiLCJsZWZ0IiwiYXNzZXJ0IiwiaGVpZ2h0Iiwic3lzdGVtMk5vZGUiLCJzeXN0ZW0yIiwicmVzZXRBbGxCdXR0b24iLCJsaXN0ZW5lciIsInJlc2V0IiwibWF4WCIsImJvdHRvbSIsIm1heFkiLCJzY3JlZW5WaWV3Um9vdE5vZGUiLCJhZGRDaGlsZCIsImFuaW1hdG9yIiwic3RlcCIsImR0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb1NjcmVlblZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBmb3IgdGhlIFwiSW50cm9cIiBzY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBSZXNldEFsbEJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYnV0dG9ucy9SZXNldEFsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Ib29rZXNMYXdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcbmltcG9ydCBJbnRyb01vZGVsIGZyb20gJy4uL21vZGVsL0ludHJvTW9kZWwuanMnO1xyXG5pbXBvcnQgSW50cm9BbmltYXRvciBmcm9tICcuL0ludHJvQW5pbWF0b3IuanMnO1xyXG5pbXBvcnQgSW50cm9TeXN0ZW1Ob2RlIGZyb20gJy4vSW50cm9TeXN0ZW1Ob2RlLmpzJztcclxuaW1wb3J0IEludHJvVmlld1Byb3BlcnRpZXMgZnJvbSAnLi9JbnRyb1ZpZXdQcm9wZXJ0aWVzLmpzJztcclxuaW1wb3J0IEludHJvVmlzaWJpbGl0eVBhbmVsIGZyb20gJy4vSW50cm9WaXNpYmlsaXR5UGFuZWwuanMnO1xyXG5pbXBvcnQgTnVtYmVyT2ZTeXN0ZW1zUmFkaW9CdXR0b25Hcm91cCBmcm9tICcuL051bWJlck9mU3lzdGVtc1JhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50cm9TY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIC8vIEFuaW1hdGVzIHRoZSB0cmFuc2l0aW9ucyBiZXR3ZWVuIDEgYW5kIDIgc3lzdGVtc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgYW5pbWF0b3I6IEludHJvQW5pbWF0b3I7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IEludHJvTW9kZWwsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVmlldyBsZW5ndGggb2YgMSBtZXRlciBvZiBkaXNwbGFjZW1lbnRcclxuICAgIGNvbnN0IHVuaXREaXNwbGFjZW1lbnRMZW5ndGggPSBIb29rZXNMYXdDb25zdGFudHMuVU5JVF9ESVNQTEFDRU1FTlRfWDtcclxuXHJcbiAgICAvLyBQcm9wZXJ0aWVzIHRoYXQgYXJlIHNwZWNpZmljIHRvIHRoZSB2aWV3XHJcbiAgICBjb25zdCB2aWV3UHJvcGVydGllcyA9IG5ldyBJbnRyb1ZpZXdQcm9wZXJ0aWVzKCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlld1Byb3BlcnRpZXMnICkgKTtcclxuXHJcbiAgICAvLyBWaXNpYmlsaXR5IGNvbnRyb2xzXHJcbiAgICBjb25zdCB2aXNpYmlsaXR5UGFuZWwgPSBuZXcgSW50cm9WaXNpYmlsaXR5UGFuZWwoIHZpZXdQcm9wZXJ0aWVzLCB7XHJcbiAgICAgIG1heFdpZHRoOiAyNTAsIC8vIGNvbnN0cmFpbiB3aWR0aCBmb3IgaTE4biwgZGV0ZXJtaW5pbmcgZW1waXJpY2FsbHlcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndmlzaWJpbGl0eVBhbmVsJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUmFkaW8gYnV0dG9ucyBmb3Igc3dpdGNoaW5nIGJldHdlZW4gMSBhbmQgMiBzeXN0ZW1zXHJcbiAgICBjb25zdCBudW1iZXJPZlN5c3RlbXNSYWRpb0J1dHRvbkdyb3VwID0gbmV3IE51bWJlck9mU3lzdGVtc1JhZGlvQnV0dG9uR3JvdXAoIHZpZXdQcm9wZXJ0aWVzLm51bWJlck9mU3lzdGVtc1Byb3BlcnR5LFxyXG4gICAgICB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnbnVtYmVyT2ZTeXN0ZW1zUmFkaW9CdXR0b25Hcm91cCcgKSApO1xyXG5cclxuICAgIC8vIGhvcml6b250YWxseSBjZW50ZXIgdGhlIGNvbnRyb2xzXHJcbiAgICBjb25zdCBjb250cm9scyA9IG5ldyBWQm94KCB7XHJcbiAgICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgICBjaGlsZHJlbjogWyB2aXNpYmlsaXR5UGFuZWwsIG51bWJlck9mU3lzdGVtc1JhZGlvQnV0dG9uR3JvdXAgXSxcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gMTAsXHJcbiAgICAgIHRvcDogdGhpcy5sYXlvdXRCb3VuZHMudG9wICsgMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTeXN0ZW0gMVxyXG4gICAgY29uc3Qgc3lzdGVtMU5vZGUgPSBuZXcgSW50cm9TeXN0ZW1Ob2RlKCBtb2RlbC5zeXN0ZW0xLCB2aWV3UHJvcGVydGllcywge1xyXG4gICAgICB1bml0RGlzcGxhY2VtZW50TGVuZ3RoOiB1bml0RGlzcGxhY2VtZW50TGVuZ3RoLFxyXG4gICAgICBzeXN0ZW1OdW1iZXI6IDEsXHJcbiAgICAgIGxlZnQ6IHRoaXMubGF5b3V0Qm91bmRzLmxlZnQgKyAxNSwgLy9jYXJlZnVsISBwb3NpdGlvbiB0aGlzIHNvIHRoYXQgbWF4IGFwcGxpZWQgZm9yY2UgdmVjdG9yIGRvZXNuJ3QgZ28gb2Zmc2NyZWVuIG9yIG92ZXJsYXAgY29udHJvbCBwYW5lbFxyXG4gICAgICAvLyB5IHBvc2l0aW9uIGlzIGhhbmRsZWQgYnkgdGhpcy5hbmltYXRvclxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzeXN0ZW0xTm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3lzdGVtMU5vZGUuaGVpZ2h0IDw9IHRoaXMubGF5b3V0Qm91bmRzLmhlaWdodCAvIDIsICdzeXN0ZW0xTm9kZSBpcyB0YWxsZXIgdGhhbiB0aGUgc3BhY2UgYXZhaWxhYmxlIGZvciBpdCcgKTtcclxuXHJcbiAgICAvLyBTeXN0ZW0gMlxyXG4gICAgY29uc3Qgc3lzdGVtMk5vZGUgPSBuZXcgSW50cm9TeXN0ZW1Ob2RlKCBtb2RlbC5zeXN0ZW0yLCB2aWV3UHJvcGVydGllcywge1xyXG4gICAgICB1bml0RGlzcGxhY2VtZW50TGVuZ3RoOiB1bml0RGlzcGxhY2VtZW50TGVuZ3RoLFxyXG4gICAgICBzeXN0ZW1OdW1iZXI6IDIsXHJcbiAgICAgIGxlZnQ6IHN5c3RlbTFOb2RlLmxlZnQsXHJcbiAgICAgIC8vIHkgcG9zaXRpb24gaXMgaGFuZGxlZCBieSB0aGlzLmFuaW1hdG9yXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3N5c3RlbTJOb2RlJyApXHJcbiAgICB9ICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzeXN0ZW0yTm9kZS5oZWlnaHQgPD0gdGhpcy5sYXlvdXRCb3VuZHMuaGVpZ2h0IC8gMiwgJ3N5c3RlbTJOb2RlIGlzIHRhbGxlciB0aGFuIHRoZSBzcGFjZSBhdmFpbGFibGUgZm9yIGl0JyApO1xyXG5cclxuICAgIC8vIFJlc2V0IEFsbCBidXR0b24sIGJvdHRvbSByaWdodFxyXG4gICAgY29uc3QgcmVzZXRBbGxCdXR0b24gPSBuZXcgUmVzZXRBbGxCdXR0b24oIHtcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICBtb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIHZpZXdQcm9wZXJ0aWVzLnJlc2V0KCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5tYXhYIC0gMTUsXHJcbiAgICAgIGJvdHRvbTogdGhpcy5sYXlvdXRCb3VuZHMubWF4WSAtIDE1LFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHNjcmVlblZpZXdSb290Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgY29udHJvbHMsXHJcbiAgICAgICAgc3lzdGVtMU5vZGUsXHJcbiAgICAgICAgc3lzdGVtMk5vZGUsXHJcbiAgICAgICAgcmVzZXRBbGxCdXR0b25cclxuICAgICAgXVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2NyZWVuVmlld1Jvb3ROb2RlICk7XHJcblxyXG4gICAgdGhpcy5hbmltYXRvciA9IG5ldyBJbnRyb0FuaW1hdG9yKCB2aWV3UHJvcGVydGllcy5udW1iZXJPZlN5c3RlbXNQcm9wZXJ0eSwgc3lzdGVtMU5vZGUsIHN5c3RlbTJOb2RlLFxyXG4gICAgICB0aGlzLmxheW91dEJvdW5kcywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FuaW1hdG9yJyApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZHZhbmNlcyBhbmltYXRpb24uXHJcbiAgICogQHBhcmFtIGR0IC0gdGltZSBzdGVwLCBpbiBzZWNvbmRzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIHN0ZXAoIGR0OiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLmFuaW1hdG9yLnN0ZXAoIGR0ICk7XHJcbiAgICBzdXBlci5zdGVwKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxuaG9va2VzTGF3LnJlZ2lzdGVyKCAnSW50cm9TY3JlZW5WaWV3JywgSW50cm9TY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsT0FBT0MsY0FBYyxNQUFNLHVEQUF1RDtBQUNsRixTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFFOUQsT0FBT0Msa0JBQWtCLE1BQU0sb0NBQW9DO0FBQ25FLE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFFMUMsT0FBT0MsYUFBYSxNQUFNLG9CQUFv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