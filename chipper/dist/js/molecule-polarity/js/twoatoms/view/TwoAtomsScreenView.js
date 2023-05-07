// Copyright 2014-2022, University of Colorado Boulder

/**
 * View for the 'Two Atoms' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { HBox, Node } from '../../../../scenery/js/imports.js';
import MPConstants from '../../common/MPConstants.js';
import ElectronegativityPanel from '../../common/view/ElectronegativityPanel.js';
import PlatesNode from '../../common/view/PlatesNode.js';
import SurfaceColorKey from '../../common/view/SurfaceColorKey.js';
import moleculePolarity from '../../moleculePolarity.js';
import BondCharacterPanel from './BondCharacterPanel.js';
import DiatomicMoleculeNode from './DiatomicMoleculeNode.js';
import TwoAtomsControlPanel from './TwoAtomsControlPanel.js';
import TwoAtomsViewProperties from './TwoAtomsViewProperties.js';
export default class TwoAtomsScreenView extends ScreenView {
  constructor(model, providedOptions) {
    const options = optionize()({
      layoutBounds: MPConstants.LAYOUT_BOUNDS
    }, providedOptions);
    super(options);

    // view-specific Properties
    const viewProperties = new TwoAtomsViewProperties({
      tandem: options.tandem.createTandem('viewProperties')
    });
    const moleculeNode = new DiatomicMoleculeNode(model.diatomicMolecule, viewProperties, {
      tandem: options.tandem.createTandem('moleculeNode')
    });
    const platesNode = new PlatesNode(model.eFieldEnabledProperty);
    const electronegativityPanelsTandem = options.tandem.createTandem('electronegativityPanels');
    const atomAElectronegativityPanel = new ElectronegativityPanel(model.diatomicMolecule.atomA, model.diatomicMolecule, {
      tandem: electronegativityPanelsTandem.createTandem('atomAElectronegativityPanel')
    });
    const atomBElectronegativityPanel = new ElectronegativityPanel(model.diatomicMolecule.atomB, model.diatomicMolecule, {
      tandem: electronegativityPanelsTandem.createTandem('atomBElectronegativityPanel')
    });
    const electronegativityPanels = new HBox({
      spacing: 10,
      children: [atomAElectronegativityPanel, atomBElectronegativityPanel],
      tandem: electronegativityPanelsTandem
    });
    const bondCharacterPanel = new BondCharacterPanel(model.diatomicMolecule, {
      visibleProperty: viewProperties.bondCharacterVisibleProperty,
      tandem: options.tandem.createTandem('bondCharacterPanel')
    });

    // Group color keys under a common parent, so that PhET-iO can hide the color key.
    const colorKeysTandem = options.tandem.createTandem('colorKeys');
    const electrostaticPotentialColorKey = SurfaceColorKey.createElectrostaticPotentialRWBColorKey({
      tandem: colorKeysTandem.createTandem('electrostaticPotentialColorKey')
    });
    const electronDensityColorKey = SurfaceColorKey.createElectronDensityColorKey({
      tandem: colorKeysTandem.createTandem('electronDensityColorKey')
    });
    const colorKeysNode = new Node({
      children: [electrostaticPotentialColorKey, electronDensityColorKey]
    });
    const controlPanel = new TwoAtomsControlPanel(viewProperties, model.eFieldEnabledProperty, {
      tandem: options.tandem.createTandem('controlPanel')
    });
    const resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
        moleculeNode.reset();
      },
      scale: 1.32,
      tandem: options.tandem.createTandem('resetAllButton')
    });

    // Parent for all nodes added to this screen
    const rootNode = new Node({
      children: [
      // nodes are rendered in this order
      platesNode, electronegativityPanels, controlPanel, bondCharacterPanel, colorKeysNode, moleculeNode, resetAllButton]
    });
    this.addChild(rootNode);

    // layout, based on molecule position ---------------------------------

    const moleculeX = model.diatomicMolecule.position.x;
    const moleculeY = model.diatomicMolecule.position.y;
    platesNode.centerX = moleculeX;
    platesNode.bottom = moleculeY + platesNode.plateHeight / 2;
    Multilink.multilink([electronegativityPanels.boundsProperty, bondCharacterPanel.boundsProperty], () => {
      // centered below molecule
      electronegativityPanels.centerX = moleculeX;
      electronegativityPanels.bottom = this.layoutBounds.bottom - 25;

      // centered above EN controls
      bondCharacterPanel.centerX = moleculeX;
      bondCharacterPanel.bottom = electronegativityPanels.top - 10;
    });

    // centered above molecule
    electrostaticPotentialColorKey.boundsProperty.link(() => {
      electrostaticPotentialColorKey.centerX = electronDensityColorKey.centerX = moleculeX;
      electrostaticPotentialColorKey.top = electronDensityColorKey.top = 25;
    });

    // to right of positive plate, top aligned
    controlPanel.left = platesNode.right + 70;
    controlPanel.top = platesNode.bottom - platesNode.plateHeight;

    // bottom-right corner of the screen
    resetAllButton.right = this.layoutBounds.right - 40;
    resetAllButton.bottom = this.layoutBounds.bottom - 20;

    // synchronization with view Properties ------------------------------

    viewProperties.surfaceTypeProperty.link(surfaceType => {
      electrostaticPotentialColorKey.visible = surfaceType === 'electrostaticPotential';
      electronDensityColorKey.visible = surfaceType === 'electronDensity';
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
moleculePolarity.register('TwoAtomsScreenView', TwoAtomsScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJTY3JlZW5WaWV3Iiwib3B0aW9uaXplIiwiUmVzZXRBbGxCdXR0b24iLCJIQm94IiwiTm9kZSIsIk1QQ29uc3RhbnRzIiwiRWxlY3Ryb25lZ2F0aXZpdHlQYW5lbCIsIlBsYXRlc05vZGUiLCJTdXJmYWNlQ29sb3JLZXkiLCJtb2xlY3VsZVBvbGFyaXR5IiwiQm9uZENoYXJhY3RlclBhbmVsIiwiRGlhdG9taWNNb2xlY3VsZU5vZGUiLCJUd29BdG9tc0NvbnRyb2xQYW5lbCIsIlR3b0F0b21zVmlld1Byb3BlcnRpZXMiLCJUd29BdG9tc1NjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImxheW91dEJvdW5kcyIsIkxBWU9VVF9CT1VORFMiLCJ2aWV3UHJvcGVydGllcyIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm1vbGVjdWxlTm9kZSIsImRpYXRvbWljTW9sZWN1bGUiLCJwbGF0ZXNOb2RlIiwiZUZpZWxkRW5hYmxlZFByb3BlcnR5IiwiZWxlY3Ryb25lZ2F0aXZpdHlQYW5lbHNUYW5kZW0iLCJhdG9tQUVsZWN0cm9uZWdhdGl2aXR5UGFuZWwiLCJhdG9tQSIsImF0b21CRWxlY3Ryb25lZ2F0aXZpdHlQYW5lbCIsImF0b21CIiwiZWxlY3Ryb25lZ2F0aXZpdHlQYW5lbHMiLCJzcGFjaW5nIiwiY2hpbGRyZW4iLCJib25kQ2hhcmFjdGVyUGFuZWwiLCJ2aXNpYmxlUHJvcGVydHkiLCJib25kQ2hhcmFjdGVyVmlzaWJsZVByb3BlcnR5IiwiY29sb3JLZXlzVGFuZGVtIiwiZWxlY3Ryb3N0YXRpY1BvdGVudGlhbENvbG9yS2V5IiwiY3JlYXRlRWxlY3Ryb3N0YXRpY1BvdGVudGlhbFJXQkNvbG9yS2V5IiwiZWxlY3Ryb25EZW5zaXR5Q29sb3JLZXkiLCJjcmVhdGVFbGVjdHJvbkRlbnNpdHlDb2xvcktleSIsImNvbG9yS2V5c05vZGUiLCJjb250cm9sUGFuZWwiLCJyZXNldEFsbEJ1dHRvbiIsImxpc3RlbmVyIiwiaW50ZXJydXB0U3VidHJlZUlucHV0IiwicmVzZXQiLCJzY2FsZSIsInJvb3ROb2RlIiwiYWRkQ2hpbGQiLCJtb2xlY3VsZVgiLCJwb3NpdGlvbiIsIngiLCJtb2xlY3VsZVkiLCJ5IiwiY2VudGVyWCIsImJvdHRvbSIsInBsYXRlSGVpZ2h0IiwibXVsdGlsaW5rIiwiYm91bmRzUHJvcGVydHkiLCJ0b3AiLCJsaW5rIiwibGVmdCIsInJpZ2h0Iiwic3VyZmFjZVR5cGVQcm9wZXJ0eSIsInN1cmZhY2VUeXBlIiwidmlzaWJsZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlR3b0F0b21zU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ1R3byBBdG9tcycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldywgeyBTY3JlZW5WaWV3T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgSEJveCwgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBNUENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTVBDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRWxlY3Ryb25lZ2F0aXZpdHlQYW5lbCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FbGVjdHJvbmVnYXRpdml0eVBhbmVsLmpzJztcclxuaW1wb3J0IFBsYXRlc05vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvUGxhdGVzTm9kZS5qcyc7XHJcbmltcG9ydCBTdXJmYWNlQ29sb3JLZXkgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU3VyZmFjZUNvbG9yS2V5LmpzJztcclxuaW1wb3J0IG1vbGVjdWxlUG9sYXJpdHkgZnJvbSAnLi4vLi4vbW9sZWN1bGVQb2xhcml0eS5qcyc7XHJcbmltcG9ydCBUd29BdG9tc01vZGVsIGZyb20gJy4uL21vZGVsL1R3b0F0b21zTW9kZWwuanMnO1xyXG5pbXBvcnQgQm9uZENoYXJhY3RlclBhbmVsIGZyb20gJy4vQm9uZENoYXJhY3RlclBhbmVsLmpzJztcclxuaW1wb3J0IERpYXRvbWljTW9sZWN1bGVOb2RlIGZyb20gJy4vRGlhdG9taWNNb2xlY3VsZU5vZGUuanMnO1xyXG5pbXBvcnQgVHdvQXRvbXNDb250cm9sUGFuZWwgZnJvbSAnLi9Ud29BdG9tc0NvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBUd29BdG9tc1ZpZXdQcm9wZXJ0aWVzIGZyb20gJy4vVHdvQXRvbXNWaWV3UHJvcGVydGllcy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgVHdvQXRvbXNWaWV3Q29udHJvbHNPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8U2NyZWVuVmlldywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHdvQXRvbXNTY3JlZW5WaWV3IGV4dGVuZHMgU2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFR3b0F0b21zTW9kZWwsIHByb3ZpZGVkT3B0aW9uczogVHdvQXRvbXNWaWV3Q29udHJvbHNPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VHdvQXRvbXNWaWV3Q29udHJvbHNPcHRpb25zLCBTZWxmT3B0aW9ucywgU2NyZWVuVmlld09wdGlvbnM+KCkoIHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBNUENvbnN0YW50cy5MQVlPVVRfQk9VTkRTXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZpZXctc3BlY2lmaWMgUHJvcGVydGllc1xyXG4gICAgY29uc3Qgdmlld1Byb3BlcnRpZXMgPSBuZXcgVHdvQXRvbXNWaWV3UHJvcGVydGllcygge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZpZXdQcm9wZXJ0aWVzJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgbW9sZWN1bGVOb2RlID0gbmV3IERpYXRvbWljTW9sZWN1bGVOb2RlKCBtb2RlbC5kaWF0b21pY01vbGVjdWxlLCB2aWV3UHJvcGVydGllcywge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ21vbGVjdWxlTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHBsYXRlc05vZGUgPSBuZXcgUGxhdGVzTm9kZSggbW9kZWwuZUZpZWxkRW5hYmxlZFByb3BlcnR5ICk7XHJcblxyXG4gICAgY29uc3QgZWxlY3Ryb25lZ2F0aXZpdHlQYW5lbHNUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbmVnYXRpdml0eVBhbmVscycgKTtcclxuXHJcbiAgICBjb25zdCBhdG9tQUVsZWN0cm9uZWdhdGl2aXR5UGFuZWwgPSBuZXcgRWxlY3Ryb25lZ2F0aXZpdHlQYW5lbCggbW9kZWwuZGlhdG9taWNNb2xlY3VsZS5hdG9tQSwgbW9kZWwuZGlhdG9taWNNb2xlY3VsZSwge1xyXG4gICAgICB0YW5kZW06IGVsZWN0cm9uZWdhdGl2aXR5UGFuZWxzVGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2F0b21BRWxlY3Ryb25lZ2F0aXZpdHlQYW5lbCcgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgYXRvbUJFbGVjdHJvbmVnYXRpdml0eVBhbmVsID0gbmV3IEVsZWN0cm9uZWdhdGl2aXR5UGFuZWwoIG1vZGVsLmRpYXRvbWljTW9sZWN1bGUuYXRvbUIsIG1vZGVsLmRpYXRvbWljTW9sZWN1bGUsIHtcclxuICAgICAgdGFuZGVtOiBlbGVjdHJvbmVnYXRpdml0eVBhbmVsc1RhbmRlbS5jcmVhdGVUYW5kZW0oICdhdG9tQkVsZWN0cm9uZWdhdGl2aXR5UGFuZWwnIClcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IGVsZWN0cm9uZWdhdGl2aXR5UGFuZWxzID0gbmV3IEhCb3goIHtcclxuICAgICAgc3BhY2luZzogMTAsXHJcbiAgICAgIGNoaWxkcmVuOiBbIGF0b21BRWxlY3Ryb25lZ2F0aXZpdHlQYW5lbCwgYXRvbUJFbGVjdHJvbmVnYXRpdml0eVBhbmVsIF0sXHJcbiAgICAgIHRhbmRlbTogZWxlY3Ryb25lZ2F0aXZpdHlQYW5lbHNUYW5kZW1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBib25kQ2hhcmFjdGVyUGFuZWwgPSBuZXcgQm9uZENoYXJhY3RlclBhbmVsKCBtb2RlbC5kaWF0b21pY01vbGVjdWxlLCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlld1Byb3BlcnRpZXMuYm9uZENoYXJhY3RlclZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdib25kQ2hhcmFjdGVyUGFuZWwnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBHcm91cCBjb2xvciBrZXlzIHVuZGVyIGEgY29tbW9uIHBhcmVudCwgc28gdGhhdCBQaEVULWlPIGNhbiBoaWRlIHRoZSBjb2xvciBrZXkuXHJcbiAgICBjb25zdCBjb2xvcktleXNUYW5kZW0gPSBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb2xvcktleXMnICk7XHJcblxyXG4gICAgY29uc3QgZWxlY3Ryb3N0YXRpY1BvdGVudGlhbENvbG9yS2V5ID0gU3VyZmFjZUNvbG9yS2V5LmNyZWF0ZUVsZWN0cm9zdGF0aWNQb3RlbnRpYWxSV0JDb2xvcktleSgge1xyXG4gICAgICB0YW5kZW06IGNvbG9yS2V5c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvc3RhdGljUG90ZW50aWFsQ29sb3JLZXknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlbGVjdHJvbkRlbnNpdHlDb2xvcktleSA9IFN1cmZhY2VDb2xvcktleS5jcmVhdGVFbGVjdHJvbkRlbnNpdHlDb2xvcktleSgge1xyXG4gICAgICB0YW5kZW06IGNvbG9yS2V5c1RhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbkRlbnNpdHlDb2xvcktleScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGNvbG9yS2V5c05vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBjaGlsZHJlbjogWyBlbGVjdHJvc3RhdGljUG90ZW50aWFsQ29sb3JLZXksIGVsZWN0cm9uRGVuc2l0eUNvbG9yS2V5IF1cclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjb250cm9sUGFuZWwgPSBuZXcgVHdvQXRvbXNDb250cm9sUGFuZWwoIHZpZXdQcm9wZXJ0aWVzLCBtb2RlbC5lRmllbGRFbmFibGVkUHJvcGVydHksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdjb250cm9sUGFuZWwnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBsaXN0ZW5lcjogKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgbW9kZWwucmVzZXQoKTtcclxuICAgICAgICB2aWV3UHJvcGVydGllcy5yZXNldCgpO1xyXG4gICAgICAgIG1vbGVjdWxlTm9kZS5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBzY2FsZTogMS4zMixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyZXNldEFsbEJ1dHRvbicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFBhcmVudCBmb3IgYWxsIG5vZGVzIGFkZGVkIHRvIHRoaXMgc2NyZWVuXHJcbiAgICBjb25zdCByb290Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcblxyXG4gICAgICAgIC8vIG5vZGVzIGFyZSByZW5kZXJlZCBpbiB0aGlzIG9yZGVyXHJcbiAgICAgICAgcGxhdGVzTm9kZSxcclxuICAgICAgICBlbGVjdHJvbmVnYXRpdml0eVBhbmVscyxcclxuICAgICAgICBjb250cm9sUGFuZWwsXHJcbiAgICAgICAgYm9uZENoYXJhY3RlclBhbmVsLFxyXG4gICAgICAgIGNvbG9yS2V5c05vZGUsXHJcbiAgICAgICAgbW9sZWN1bGVOb2RlLFxyXG4gICAgICAgIHJlc2V0QWxsQnV0dG9uXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJvb3ROb2RlICk7XHJcblxyXG4gICAgLy8gbGF5b3V0LCBiYXNlZCBvbiBtb2xlY3VsZSBwb3NpdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjb25zdCBtb2xlY3VsZVggPSBtb2RlbC5kaWF0b21pY01vbGVjdWxlLnBvc2l0aW9uLng7XHJcbiAgICBjb25zdCBtb2xlY3VsZVkgPSBtb2RlbC5kaWF0b21pY01vbGVjdWxlLnBvc2l0aW9uLnk7XHJcblxyXG4gICAgcGxhdGVzTm9kZS5jZW50ZXJYID0gbW9sZWN1bGVYO1xyXG4gICAgcGxhdGVzTm9kZS5ib3R0b20gPSBtb2xlY3VsZVkgKyAoIHBsYXRlc05vZGUucGxhdGVIZWlnaHQgLyAyICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBlbGVjdHJvbmVnYXRpdml0eVBhbmVscy5ib3VuZHNQcm9wZXJ0eSwgYm9uZENoYXJhY3RlclBhbmVsLmJvdW5kc1Byb3BlcnR5IF0sICgpID0+IHtcclxuXHJcbiAgICAgIC8vIGNlbnRlcmVkIGJlbG93IG1vbGVjdWxlXHJcbiAgICAgIGVsZWN0cm9uZWdhdGl2aXR5UGFuZWxzLmNlbnRlclggPSBtb2xlY3VsZVg7XHJcbiAgICAgIGVsZWN0cm9uZWdhdGl2aXR5UGFuZWxzLmJvdHRvbSA9IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIDI1O1xyXG5cclxuICAgICAgLy8gY2VudGVyZWQgYWJvdmUgRU4gY29udHJvbHNcclxuICAgICAgYm9uZENoYXJhY3RlclBhbmVsLmNlbnRlclggPSBtb2xlY3VsZVg7XHJcbiAgICAgIGJvbmRDaGFyYWN0ZXJQYW5lbC5ib3R0b20gPSBlbGVjdHJvbmVnYXRpdml0eVBhbmVscy50b3AgLSAxMDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBjZW50ZXJlZCBhYm92ZSBtb2xlY3VsZVxyXG4gICAgZWxlY3Ryb3N0YXRpY1BvdGVudGlhbENvbG9yS2V5LmJvdW5kc1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuICAgICAgZWxlY3Ryb3N0YXRpY1BvdGVudGlhbENvbG9yS2V5LmNlbnRlclggPSBlbGVjdHJvbkRlbnNpdHlDb2xvcktleS5jZW50ZXJYID0gbW9sZWN1bGVYO1xyXG4gICAgICBlbGVjdHJvc3RhdGljUG90ZW50aWFsQ29sb3JLZXkudG9wID0gZWxlY3Ryb25EZW5zaXR5Q29sb3JLZXkudG9wID0gMjU7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdG8gcmlnaHQgb2YgcG9zaXRpdmUgcGxhdGUsIHRvcCBhbGlnbmVkXHJcbiAgICBjb250cm9sUGFuZWwubGVmdCA9IHBsYXRlc05vZGUucmlnaHQgKyA3MDtcclxuICAgIGNvbnRyb2xQYW5lbC50b3AgPSBwbGF0ZXNOb2RlLmJvdHRvbSAtIHBsYXRlc05vZGUucGxhdGVIZWlnaHQ7XHJcblxyXG4gICAgLy8gYm90dG9tLXJpZ2h0IGNvcm5lciBvZiB0aGUgc2NyZWVuXHJcbiAgICByZXNldEFsbEJ1dHRvbi5yaWdodCA9IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gNDA7XHJcbiAgICByZXNldEFsbEJ1dHRvbi5ib3R0b20gPSB0aGlzLmxheW91dEJvdW5kcy5ib3R0b20gLSAyMDtcclxuXHJcbiAgICAvLyBzeW5jaHJvbml6YXRpb24gd2l0aCB2aWV3IFByb3BlcnRpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdmlld1Byb3BlcnRpZXMuc3VyZmFjZVR5cGVQcm9wZXJ0eS5saW5rKCBzdXJmYWNlVHlwZSA9PiB7XHJcbiAgICAgIGVsZWN0cm9zdGF0aWNQb3RlbnRpYWxDb2xvcktleS52aXNpYmxlID0gKCBzdXJmYWNlVHlwZSA9PT0gJ2VsZWN0cm9zdGF0aWNQb3RlbnRpYWwnICk7XHJcbiAgICAgIGVsZWN0cm9uRGVuc2l0eUNvbG9yS2V5LnZpc2libGUgPSAoIHN1cmZhY2VUeXBlID09PSAnZWxlY3Ryb25EZW5zaXR5JyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vbGVjdWxlUG9sYXJpdHkucmVnaXN0ZXIoICdUd29BdG9t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