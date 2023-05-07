// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for the 'Micro' screen.
 *
 * NOTE:
 * This view currently consists of a superset of the nodes in the 'My Solution' screen.
 * But some of the common nodes are configured differently, and the screen has different layering and layout requirements.
 * So I choose to duplicate some code rather than attempt a refactor that would result in an implementation that
 * was more difficult to understand and maintain.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { optionize3 } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import EyeDropperNode from '../../../../scenery-phet/js/EyeDropperNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import Water from '../../common/model/Water.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import BeakerControlPanel from '../../common/view/BeakerControlPanel.js';
import BeakerNode from '../../common/view/BeakerNode.js';
import DrainFaucetNode from '../../common/view/DrainFaucetNode.js';
import DropperFluidNode from '../../common/view/DropperFluidNode.js';
import FaucetFluidNode from '../../common/view/FaucetFluidNode.js';
import GraphNode from '../../common/view/graph/GraphNode.js';
import ParticleCountsNode from '../../common/view/ParticleCountsNode.js';
import PHDropperNode from '../../common/view/PHDropperNode.js';
import MicroPHAccordionBox from './MicroPHAccordionBox.js';
import PHScaleViewProperties from '../../common/view/PHScaleViewProperties.js';
import RatioNode from '../../common/view/RatioNode.js';
import SoluteComboBox from '../../common/view/SoluteComboBox.js';
import SolutionNode from '../../common/view/SolutionNode.js';
import VolumeIndicatorNode from '../../common/view/VolumeIndicatorNode.js';
import WaterFaucetNode from '../../common/view/WaterFaucetNode.js';
import phScale from '../../phScale.js';
export default class MicroScreenView extends ScreenView {
  constructor(model, modelViewTransform, providedOptions) {
    const options = optionize3()({}, PHScaleConstants.SCREEN_VIEW_OPTIONS, providedOptions);
    super(options);

    // view-specific properties
    const viewProperties = new PHScaleViewProperties(options.tandem.createTandem('viewProperties'));

    // beaker
    const beakerNode = new BeakerNode(model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem('beakerNode')
    });

    // solution
    const solutionNode = new SolutionNode(model.solution.totalVolumeProperty, model.solution.colorProperty, model.beaker, modelViewTransform);

    // volume indicator on right side of beaker
    const volumeIndicatorNode = new VolumeIndicatorNode(model.solution.totalVolumeProperty, model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem('volumeIndicatorNode')
    });

    // dropper
    const DROPPER_SCALE = 0.85;
    const dropperNode = new PHDropperNode(model.dropper, modelViewTransform, {
      visibleProperty: model.dropper.visibleProperty,
      tandem: options.tandem.createTandem('dropperNode')
    });
    dropperNode.setScaleMagnitude(DROPPER_SCALE);
    const dropperFluidNode = new DropperFluidNode(model.dropper, model.beaker, DROPPER_SCALE * EyeDropperNode.TIP_WIDTH, modelViewTransform, {
      visibleProperty: model.dropper.visibleProperty
    });

    // faucets
    const waterFaucetNode = new WaterFaucetNode(model.waterFaucet, modelViewTransform, {
      tandem: options.tandem.createTandem('waterFaucetNode')
    });
    const drainFaucetNode = new DrainFaucetNode(model.drainFaucet, modelViewTransform, {
      tandem: options.tandem.createTandem('drainFaucetNode')
    });
    const SOLVENT_FLUID_HEIGHT = model.beaker.position.y - model.waterFaucet.position.y;
    const DRAIN_FLUID_HEIGHT = 1000; // tall enough that resizing the play area is unlikely to show bottom of fluid
    const waterFluidNode = new FaucetFluidNode(model.waterFaucet, new Property(Water.color), SOLVENT_FLUID_HEIGHT, modelViewTransform);
    const drainFluidNode = new FaucetFluidNode(model.drainFaucet, model.solution.colorProperty, DRAIN_FLUID_HEIGHT, modelViewTransform);

    // 'H3O+/OH- ratio' representation
    const ratioNode = new RatioNode(model.beaker, model.solution.pHProperty, model.solution.totalVolumeProperty, modelViewTransform, {
      visibleProperty: viewProperties.ratioVisibleProperty,
      tandem: options.tandem.createTandem('ratioNode')
    });

    // 'Particle Counts' representation
    const particleCountsNode = new ParticleCountsNode(model.solution.derivedProperties, {
      visibleProperty: viewProperties.particleCountsVisibleProperty,
      tandem: options.tandem.createTandem('particleCountsNode')
    });

    // beaker control panel
    const beakerControlPanel = new BeakerControlPanel(viewProperties.ratioVisibleProperty, viewProperties.particleCountsVisibleProperty, {
      maxWidth: 0.85 * beakerNode.width,
      tandem: options.tandem.createTandem('beakerControlPanel')
    });

    // graph
    const graphNode = new GraphNode(model.solution.totalVolumeProperty, model.solution.derivedProperties, {
      pHProperty: model.solution.pHProperty,
      hasLinearFeature: true,
      logScaleHeight: 485,
      linearScaleHeight: 440,
      tandem: options.tandem.createTandem('graphNode')
    });

    // pH meter
    const pHMeterTop = 15;
    const pHAccordionBox = new MicroPHAccordionBox(model.solution.pHProperty, modelViewTransform.modelToViewY(model.beaker.position.y) - pHMeterTop, {
      tandem: options.tandem.createTandem('pHAccordionBox')
    });

    // solutes combo box
    const soluteListParent = new Node();
    const soluteComboBox = new SoluteComboBox(model.dropper.soluteProperty, soluteListParent, {
      maxWidth: 400,
      tandem: options.tandem.createTandem('soluteComboBox')
    });
    const resetAllButton = new ResetAllButton({
      scale: 1.32,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
        graphNode.reset();
        pHAccordionBox.reset();
      },
      tandem: options.tandem.createTandem('resetAllButton')
    });

    // Parent for all nodes added to this screen
    const screenViewRootNode = new Node({
      children: [
      // nodes are rendered in this order
      waterFluidNode, waterFaucetNode, drainFluidNode, drainFaucetNode, dropperFluidNode, dropperNode, solutionNode, pHAccordionBox, ratioNode, beakerNode, particleCountsNode, volumeIndicatorNode, beakerControlPanel, graphNode, resetAllButton, soluteComboBox, soluteListParent // last, so that combo box list is on top
      ]
    });

    this.addChild(screenViewRootNode);

    // Layout of nodes that don't have a position specified in the model
    particleCountsNode.centerX = beakerNode.centerX;
    particleCountsNode.bottom = beakerNode.bottom - 25;
    beakerControlPanel.boundsProperty.link(bounds => {
      beakerControlPanel.centerX = beakerNode.centerX;
      beakerControlPanel.top = beakerNode.bottom + 10;
    });
    pHAccordionBox.left = modelViewTransform.modelToViewX(model.beaker.left) - 0.4 * pHAccordionBox.width;
    pHAccordionBox.top = pHMeterTop;
    graphNode.right = drainFaucetNode.left - 40;
    graphNode.top = pHAccordionBox.top;
    soluteComboBox.left = pHAccordionBox.right + 35;
    soluteComboBox.top = this.layoutBounds.top + pHMeterTop;
    resetAllButton.right = this.layoutBounds.right - 40;
    resetAllButton.bottom = this.layoutBounds.bottom - 20;

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    screenViewRootNode.pdomOrder = [pHAccordionBox, soluteComboBox, dropperNode, waterFaucetNode, drainFaucetNode, beakerControlPanel, graphNode, resetAllButton];
  }
}
phScale.register('MicroScreenView', MicroScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlNjcmVlblZpZXciLCJvcHRpb25pemUzIiwiUmVzZXRBbGxCdXR0b24iLCJFeWVEcm9wcGVyTm9kZSIsIk5vZGUiLCJXYXRlciIsIlBIU2NhbGVDb25zdGFudHMiLCJCZWFrZXJDb250cm9sUGFuZWwiLCJCZWFrZXJOb2RlIiwiRHJhaW5GYXVjZXROb2RlIiwiRHJvcHBlckZsdWlkTm9kZSIsIkZhdWNldEZsdWlkTm9kZSIsIkdyYXBoTm9kZSIsIlBhcnRpY2xlQ291bnRzTm9kZSIsIlBIRHJvcHBlck5vZGUiLCJNaWNyb1BIQWNjb3JkaW9uQm94IiwiUEhTY2FsZVZpZXdQcm9wZXJ0aWVzIiwiUmF0aW9Ob2RlIiwiU29sdXRlQ29tYm9Cb3giLCJTb2x1dGlvbk5vZGUiLCJWb2x1bWVJbmRpY2F0b3JOb2RlIiwiV2F0ZXJGYXVjZXROb2RlIiwicGhTY2FsZSIsIk1pY3JvU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwibW9kZWwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiU0NSRUVOX1ZJRVdfT1BUSU9OUyIsInZpZXdQcm9wZXJ0aWVzIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYmVha2VyTm9kZSIsImJlYWtlciIsInNvbHV0aW9uTm9kZSIsInNvbHV0aW9uIiwidG90YWxWb2x1bWVQcm9wZXJ0eSIsImNvbG9yUHJvcGVydHkiLCJ2b2x1bWVJbmRpY2F0b3JOb2RlIiwiRFJPUFBFUl9TQ0FMRSIsImRyb3BwZXJOb2RlIiwiZHJvcHBlciIsInZpc2libGVQcm9wZXJ0eSIsInNldFNjYWxlTWFnbml0dWRlIiwiZHJvcHBlckZsdWlkTm9kZSIsIlRJUF9XSURUSCIsIndhdGVyRmF1Y2V0Tm9kZSIsIndhdGVyRmF1Y2V0IiwiZHJhaW5GYXVjZXROb2RlIiwiZHJhaW5GYXVjZXQiLCJTT0xWRU5UX0ZMVUlEX0hFSUdIVCIsInBvc2l0aW9uIiwieSIsIkRSQUlOX0ZMVUlEX0hFSUdIVCIsIndhdGVyRmx1aWROb2RlIiwiY29sb3IiLCJkcmFpbkZsdWlkTm9kZSIsInJhdGlvTm9kZSIsInBIUHJvcGVydHkiLCJyYXRpb1Zpc2libGVQcm9wZXJ0eSIsInBhcnRpY2xlQ291bnRzTm9kZSIsImRlcml2ZWRQcm9wZXJ0aWVzIiwicGFydGljbGVDb3VudHNWaXNpYmxlUHJvcGVydHkiLCJiZWFrZXJDb250cm9sUGFuZWwiLCJtYXhXaWR0aCIsIndpZHRoIiwiZ3JhcGhOb2RlIiwiaGFzTGluZWFyRmVhdHVyZSIsImxvZ1NjYWxlSGVpZ2h0IiwibGluZWFyU2NhbGVIZWlnaHQiLCJwSE1ldGVyVG9wIiwicEhBY2NvcmRpb25Cb3giLCJtb2RlbFRvVmlld1kiLCJzb2x1dGVMaXN0UGFyZW50Iiwic29sdXRlQ29tYm9Cb3giLCJzb2x1dGVQcm9wZXJ0eSIsInJlc2V0QWxsQnV0dG9uIiwic2NhbGUiLCJsaXN0ZW5lciIsImludGVycnVwdFN1YnRyZWVJbnB1dCIsInJlc2V0Iiwic2NyZWVuVmlld1Jvb3ROb2RlIiwiY2hpbGRyZW4iLCJhZGRDaGlsZCIsImNlbnRlclgiLCJib3R0b20iLCJib3VuZHNQcm9wZXJ0eSIsImxpbmsiLCJib3VuZHMiLCJ0b3AiLCJsZWZ0IiwibW9kZWxUb1ZpZXdYIiwicmlnaHQiLCJsYXlvdXRCb3VuZHMiLCJwZG9tT3JkZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIk1pY3JvU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ01pY3JvJyBzY3JlZW4uXHJcbiAqXHJcbiAqIE5PVEU6XHJcbiAqIFRoaXMgdmlldyBjdXJyZW50bHkgY29uc2lzdHMgb2YgYSBzdXBlcnNldCBvZiB0aGUgbm9kZXMgaW4gdGhlICdNeSBTb2x1dGlvbicgc2NyZWVuLlxyXG4gKiBCdXQgc29tZSBvZiB0aGUgY29tbW9uIG5vZGVzIGFyZSBjb25maWd1cmVkIGRpZmZlcmVudGx5LCBhbmQgdGhlIHNjcmVlbiBoYXMgZGlmZmVyZW50IGxheWVyaW5nIGFuZCBsYXlvdXQgcmVxdWlyZW1lbnRzLlxyXG4gKiBTbyBJIGNob29zZSB0byBkdXBsaWNhdGUgc29tZSBjb2RlIHJhdGhlciB0aGFuIGF0dGVtcHQgYSByZWZhY3RvciB0aGF0IHdvdWxkIHJlc3VsdCBpbiBhbiBpbXBsZW1lbnRhdGlvbiB0aGF0XHJcbiAqIHdhcyBtb3JlIGRpZmZpY3VsdCB0byB1bmRlcnN0YW5kIGFuZCBtYWludGFpbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IFNjcmVlbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW4uanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IHsgRW1wdHlTZWxmT3B0aW9ucywgb3B0aW9uaXplMyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IEV5ZURyb3BwZXJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9FeWVEcm9wcGVyTm9kZS5qcyc7XHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgV2F0ZXIgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1dhdGVyLmpzJztcclxuaW1wb3J0IFBIU2NhbGVDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1BIU2NhbGVDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQmVha2VyQ29udHJvbFBhbmVsIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0JlYWtlckNvbnRyb2xQYW5lbC5qcyc7XHJcbmltcG9ydCBCZWFrZXJOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0JlYWtlck5vZGUuanMnO1xyXG5pbXBvcnQgRHJhaW5GYXVjZXROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0RyYWluRmF1Y2V0Tm9kZS5qcyc7XHJcbmltcG9ydCBEcm9wcGVyRmx1aWROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0Ryb3BwZXJGbHVpZE5vZGUuanMnO1xyXG5pbXBvcnQgRmF1Y2V0Rmx1aWROb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0ZhdWNldEZsdWlkTm9kZS5qcyc7XHJcbmltcG9ydCBHcmFwaE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvZ3JhcGgvR3JhcGhOb2RlLmpzJztcclxuaW1wb3J0IFBhcnRpY2xlQ291bnRzTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9QYXJ0aWNsZUNvdW50c05vZGUuanMnO1xyXG5pbXBvcnQgUEhEcm9wcGVyTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9QSERyb3BwZXJOb2RlLmpzJztcclxuaW1wb3J0IE1pY3JvUEhBY2NvcmRpb25Cb3ggZnJvbSAnLi9NaWNyb1BIQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IFBIU2NhbGVWaWV3UHJvcGVydGllcyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9QSFNjYWxlVmlld1Byb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgUmF0aW9Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1JhdGlvTm9kZS5qcyc7XHJcbmltcG9ydCBTb2x1dGVDb21ib0JveCBmcm9tICcuLi8uLi9jb21tb24vdmlldy9Tb2x1dGVDb21ib0JveC5qcyc7XHJcbmltcG9ydCBTb2x1dGlvbk5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvU29sdXRpb25Ob2RlLmpzJztcclxuaW1wb3J0IFZvbHVtZUluZGljYXRvck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVm9sdW1lSW5kaWNhdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBXYXRlckZhdWNldE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvV2F0ZXJGYXVjZXROb2RlLmpzJztcclxuaW1wb3J0IHBoU2NhbGUgZnJvbSAnLi4vLi4vcGhTY2FsZS5qcyc7XHJcbmltcG9ydCBNaWNyb01vZGVsIGZyb20gJy4uL21vZGVsL01pY3JvTW9kZWwuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIE1pY3JvU2NyZWVuVmlld09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxTY3JlZW5PcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaWNyb1NjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogTWljcm9Nb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCBwcm92aWRlZE9wdGlvbnM6IE1pY3JvU2NyZWVuVmlld09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTM8TWljcm9TY3JlZW5WaWV3T3B0aW9ucywgU2VsZk9wdGlvbnMsIFN0cmljdE9taXQ8U2NyZWVuT3B0aW9ucywgJ3RhbmRlbSc+PigpKCB7fSxcclxuICAgICAgUEhTY2FsZUNvbnN0YW50cy5TQ1JFRU5fVklFV19PUFRJT05TLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHZpZXctc3BlY2lmaWMgcHJvcGVydGllc1xyXG4gICAgY29uc3Qgdmlld1Byb3BlcnRpZXMgPSBuZXcgUEhTY2FsZVZpZXdQcm9wZXJ0aWVzKCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICd2aWV3UHJvcGVydGllcycgKSApO1xyXG5cclxuICAgIC8vIGJlYWtlclxyXG4gICAgY29uc3QgYmVha2VyTm9kZSA9IG5ldyBCZWFrZXJOb2RlKCBtb2RlbC5iZWFrZXIsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2JlYWtlck5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBzb2x1dGlvblxyXG4gICAgY29uc3Qgc29sdXRpb25Ob2RlID0gbmV3IFNvbHV0aW9uTm9kZSggbW9kZWwuc29sdXRpb24udG90YWxWb2x1bWVQcm9wZXJ0eSwgbW9kZWwuc29sdXRpb24uY29sb3JQcm9wZXJ0eSxcclxuICAgICAgbW9kZWwuYmVha2VyLCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuXHJcbiAgICAvLyB2b2x1bWUgaW5kaWNhdG9yIG9uIHJpZ2h0IHNpZGUgb2YgYmVha2VyXHJcbiAgICBjb25zdCB2b2x1bWVJbmRpY2F0b3JOb2RlID0gbmV3IFZvbHVtZUluZGljYXRvck5vZGUoIG1vZGVsLnNvbHV0aW9uLnRvdGFsVm9sdW1lUHJvcGVydHksIG1vZGVsLmJlYWtlciwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdW1lSW5kaWNhdG9yTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGRyb3BwZXJcclxuICAgIGNvbnN0IERST1BQRVJfU0NBTEUgPSAwLjg1O1xyXG4gICAgY29uc3QgZHJvcHBlck5vZGUgPSBuZXcgUEhEcm9wcGVyTm9kZSggbW9kZWwuZHJvcHBlciwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbW9kZWwuZHJvcHBlci52aXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJvcHBlck5vZGUnIClcclxuICAgIH0gKTtcclxuICAgIGRyb3BwZXJOb2RlLnNldFNjYWxlTWFnbml0dWRlKCBEUk9QUEVSX1NDQUxFICk7XHJcbiAgICBjb25zdCBkcm9wcGVyRmx1aWROb2RlID0gbmV3IERyb3BwZXJGbHVpZE5vZGUoIG1vZGVsLmRyb3BwZXIsIG1vZGVsLmJlYWtlciwgRFJPUFBFUl9TQ0FMRSAqIEV5ZURyb3BwZXJOb2RlLlRJUF9XSURUSCxcclxuICAgICAgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBtb2RlbC5kcm9wcGVyLnZpc2libGVQcm9wZXJ0eVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gZmF1Y2V0c1xyXG4gICAgY29uc3Qgd2F0ZXJGYXVjZXROb2RlID0gbmV3IFdhdGVyRmF1Y2V0Tm9kZSggbW9kZWwud2F0ZXJGYXVjZXQsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3dhdGVyRmF1Y2V0Tm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZHJhaW5GYXVjZXROb2RlID0gbmV3IERyYWluRmF1Y2V0Tm9kZSggbW9kZWwuZHJhaW5GYXVjZXQsIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2RyYWluRmF1Y2V0Tm9kZScgKVxyXG4gICAgfSApO1xyXG4gICAgY29uc3QgU09MVkVOVF9GTFVJRF9IRUlHSFQgPSBtb2RlbC5iZWFrZXIucG9zaXRpb24ueSAtIG1vZGVsLndhdGVyRmF1Y2V0LnBvc2l0aW9uLnk7XHJcbiAgICBjb25zdCBEUkFJTl9GTFVJRF9IRUlHSFQgPSAxMDAwOyAvLyB0YWxsIGVub3VnaCB0aGF0IHJlc2l6aW5nIHRoZSBwbGF5IGFyZWEgaXMgdW5saWtlbHkgdG8gc2hvdyBib3R0b20gb2YgZmx1aWRcclxuICAgIGNvbnN0IHdhdGVyRmx1aWROb2RlID0gbmV3IEZhdWNldEZsdWlkTm9kZSggbW9kZWwud2F0ZXJGYXVjZXQsIG5ldyBQcm9wZXJ0eSggV2F0ZXIuY29sb3IgKSwgU09MVkVOVF9GTFVJRF9IRUlHSFQsIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG4gICAgY29uc3QgZHJhaW5GbHVpZE5vZGUgPSBuZXcgRmF1Y2V0Rmx1aWROb2RlKCBtb2RlbC5kcmFpbkZhdWNldCwgbW9kZWwuc29sdXRpb24uY29sb3JQcm9wZXJ0eSwgRFJBSU5fRkxVSURfSEVJR0hULCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuXHJcbiAgICAvLyAnSDNPKy9PSC0gcmF0aW8nIHJlcHJlc2VudGF0aW9uXHJcbiAgICBjb25zdCByYXRpb05vZGUgPSBuZXcgUmF0aW9Ob2RlKCBtb2RlbC5iZWFrZXIsIG1vZGVsLnNvbHV0aW9uLnBIUHJvcGVydHksIG1vZGVsLnNvbHV0aW9uLnRvdGFsVm9sdW1lUHJvcGVydHksIG1vZGVsVmlld1RyYW5zZm9ybSwge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHZpZXdQcm9wZXJ0aWVzLnJhdGlvVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JhdGlvTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vICdQYXJ0aWNsZSBDb3VudHMnIHJlcHJlc2VudGF0aW9uXHJcbiAgICBjb25zdCBwYXJ0aWNsZUNvdW50c05vZGUgPSBuZXcgUGFydGljbGVDb3VudHNOb2RlKCBtb2RlbC5zb2x1dGlvbi5kZXJpdmVkUHJvcGVydGllcywge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHZpZXdQcm9wZXJ0aWVzLnBhcnRpY2xlQ291bnRzVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BhcnRpY2xlQ291bnRzTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIGJlYWtlciBjb250cm9sIHBhbmVsXHJcbiAgICBjb25zdCBiZWFrZXJDb250cm9sUGFuZWwgPSBuZXcgQmVha2VyQ29udHJvbFBhbmVsKFxyXG4gICAgICB2aWV3UHJvcGVydGllcy5yYXRpb1Zpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdmlld1Byb3BlcnRpZXMucGFydGljbGVDb3VudHNWaXNpYmxlUHJvcGVydHksIHtcclxuICAgICAgICBtYXhXaWR0aDogMC44NSAqIGJlYWtlck5vZGUud2lkdGgsXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdiZWFrZXJDb250cm9sUGFuZWwnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIGdyYXBoXHJcbiAgICBjb25zdCBncmFwaE5vZGUgPSBuZXcgR3JhcGhOb2RlKCBtb2RlbC5zb2x1dGlvbi50b3RhbFZvbHVtZVByb3BlcnR5LCBtb2RlbC5zb2x1dGlvbi5kZXJpdmVkUHJvcGVydGllcywge1xyXG4gICAgICBwSFByb3BlcnR5OiBtb2RlbC5zb2x1dGlvbi5wSFByb3BlcnR5LFxyXG4gICAgICBoYXNMaW5lYXJGZWF0dXJlOiB0cnVlLFxyXG4gICAgICBsb2dTY2FsZUhlaWdodDogNDg1LFxyXG4gICAgICBsaW5lYXJTY2FsZUhlaWdodDogNDQwLFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2dyYXBoTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBIIG1ldGVyXHJcbiAgICBjb25zdCBwSE1ldGVyVG9wID0gMTU7XHJcbiAgICBjb25zdCBwSEFjY29yZGlvbkJveCA9IG5ldyBNaWNyb1BIQWNjb3JkaW9uQm94KCBtb2RlbC5zb2x1dGlvbi5wSFByb3BlcnR5LFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdZKCBtb2RlbC5iZWFrZXIucG9zaXRpb24ueSApIC0gcEhNZXRlclRvcCwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncEhBY2NvcmRpb25Cb3gnIClcclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIHNvbHV0ZXMgY29tYm8gYm94XHJcbiAgICBjb25zdCBzb2x1dGVMaXN0UGFyZW50ID0gbmV3IE5vZGUoKTtcclxuICAgIGNvbnN0IHNvbHV0ZUNvbWJvQm94ID0gbmV3IFNvbHV0ZUNvbWJvQm94KCBtb2RlbC5kcm9wcGVyLnNvbHV0ZVByb3BlcnR5LCBzb2x1dGVMaXN0UGFyZW50LCB7XHJcbiAgICAgIG1heFdpZHRoOiA0MDAsXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc29sdXRlQ29tYm9Cb3gnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCByZXNldEFsbEJ1dHRvbiA9IG5ldyBSZXNldEFsbEJ1dHRvbigge1xyXG4gICAgICBzY2FsZTogMS4zMixcclxuICAgICAgbGlzdGVuZXI6ICgpID0+IHtcclxuICAgICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgICAgIG1vZGVsLnJlc2V0KCk7XHJcbiAgICAgICAgdmlld1Byb3BlcnRpZXMucmVzZXQoKTtcclxuICAgICAgICBncmFwaE5vZGUucmVzZXQoKTtcclxuICAgICAgICBwSEFjY29yZGlvbkJveC5yZXNldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3Jlc2V0QWxsQnV0dG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFyZW50IGZvciBhbGwgbm9kZXMgYWRkZWQgdG8gdGhpcyBzY3JlZW5cclxuICAgIGNvbnN0IHNjcmVlblZpZXdSb290Tm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgLy8gbm9kZXMgYXJlIHJlbmRlcmVkIGluIHRoaXMgb3JkZXJcclxuICAgICAgICB3YXRlckZsdWlkTm9kZSxcclxuICAgICAgICB3YXRlckZhdWNldE5vZGUsXHJcbiAgICAgICAgZHJhaW5GbHVpZE5vZGUsXHJcbiAgICAgICAgZHJhaW5GYXVjZXROb2RlLFxyXG4gICAgICAgIGRyb3BwZXJGbHVpZE5vZGUsXHJcbiAgICAgICAgZHJvcHBlck5vZGUsXHJcbiAgICAgICAgc29sdXRpb25Ob2RlLFxyXG4gICAgICAgIHBIQWNjb3JkaW9uQm94LFxyXG4gICAgICAgIHJhdGlvTm9kZSxcclxuICAgICAgICBiZWFrZXJOb2RlLFxyXG4gICAgICAgIHBhcnRpY2xlQ291bnRzTm9kZSxcclxuICAgICAgICB2b2x1bWVJbmRpY2F0b3JOb2RlLFxyXG4gICAgICAgIGJlYWtlckNvbnRyb2xQYW5lbCxcclxuICAgICAgICBncmFwaE5vZGUsXHJcbiAgICAgICAgcmVzZXRBbGxCdXR0b24sXHJcbiAgICAgICAgc29sdXRlQ29tYm9Cb3gsXHJcbiAgICAgICAgc29sdXRlTGlzdFBhcmVudCAvLyBsYXN0LCBzbyB0aGF0IGNvbWJvIGJveCBsaXN0IGlzIG9uIHRvcFxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzY3JlZW5WaWV3Um9vdE5vZGUgKTtcclxuXHJcbiAgICAvLyBMYXlvdXQgb2Ygbm9kZXMgdGhhdCBkb24ndCBoYXZlIGEgcG9zaXRpb24gc3BlY2lmaWVkIGluIHRoZSBtb2RlbFxyXG4gICAgcGFydGljbGVDb3VudHNOb2RlLmNlbnRlclggPSBiZWFrZXJOb2RlLmNlbnRlclg7XHJcbiAgICBwYXJ0aWNsZUNvdW50c05vZGUuYm90dG9tID0gYmVha2VyTm9kZS5ib3R0b20gLSAyNTtcclxuXHJcbiAgICBiZWFrZXJDb250cm9sUGFuZWwuYm91bmRzUHJvcGVydHkubGluayggYm91bmRzID0+IHtcclxuICAgICAgYmVha2VyQ29udHJvbFBhbmVsLmNlbnRlclggPSBiZWFrZXJOb2RlLmNlbnRlclg7XHJcbiAgICAgIGJlYWtlckNvbnRyb2xQYW5lbC50b3AgPSBiZWFrZXJOb2RlLmJvdHRvbSArIDEwO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHBIQWNjb3JkaW9uQm94LmxlZnQgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCBtb2RlbC5iZWFrZXIubGVmdCApIC0gKCAwLjQgKiBwSEFjY29yZGlvbkJveC53aWR0aCApO1xyXG4gICAgcEhBY2NvcmRpb25Cb3gudG9wID0gcEhNZXRlclRvcDtcclxuICAgIGdyYXBoTm9kZS5yaWdodCA9IGRyYWluRmF1Y2V0Tm9kZS5sZWZ0IC0gNDA7XHJcbiAgICBncmFwaE5vZGUudG9wID0gcEhBY2NvcmRpb25Cb3gudG9wO1xyXG4gICAgc29sdXRlQ29tYm9Cb3gubGVmdCA9IHBIQWNjb3JkaW9uQm94LnJpZ2h0ICsgMzU7XHJcbiAgICBzb2x1dGVDb21ib0JveC50b3AgPSB0aGlzLmxheW91dEJvdW5kcy50b3AgKyBwSE1ldGVyVG9wO1xyXG4gICAgcmVzZXRBbGxCdXR0b24ucmlnaHQgPSB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIDQwO1xyXG4gICAgcmVzZXRBbGxCdXR0b24uYm90dG9tID0gdGhpcy5sYXlvdXRCb3VuZHMuYm90dG9tIC0gMjA7XHJcblxyXG4gICAgLy8ga2V5Ym9hcmQgdHJhdmVyc2FsIG9yZGVyLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3BoLXNjYWxlL2lzc3Vlcy8yNDlcclxuICAgIHNjcmVlblZpZXdSb290Tm9kZS5wZG9tT3JkZXIgPSBbXHJcbiAgICAgIHBIQWNjb3JkaW9uQm94LFxyXG4gICAgICBzb2x1dGVDb21ib0JveCxcclxuICAgICAgZHJvcHBlck5vZGUsXHJcbiAgICAgIHdhdGVyRmF1Y2V0Tm9kZSxcclxuICAgICAgZHJhaW5GYXVjZXROb2RlLFxyXG4gICAgICBiZWFrZXJDb250cm9sUGFuZWwsXHJcbiAgICAgIGdyYXBoTm9kZSxcclxuICAgICAgcmVzZXRBbGxCdXR0b25cclxuICAgIF07XHJcbiAgfVxyXG59XHJcblxyXG5waFNjYWxlLnJlZ2lzdGVyKCAnTWljcm9TY3JlZW5WaWV3JywgTWljcm9TY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsVUFBVSxNQUFNLG9DQUFvQztBQUMzRCxTQUEyQkMsVUFBVSxRQUFRLHVDQUF1QztBQUlwRixPQUFPQyxjQUFjLE1BQU0sdURBQXVEO0FBQ2xGLE9BQU9DLGNBQWMsTUFBTSwrQ0FBK0M7QUFDMUUsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLGdCQUFnQixNQUFNLGtDQUFrQztBQUMvRCxPQUFPQyxrQkFBa0IsTUFBTSx5Q0FBeUM7QUFDeEUsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sc0NBQXNDO0FBQ2xFLE9BQU9DLGdCQUFnQixNQUFNLHVDQUF1QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sc0NBQXNDO0FBQ2xFLE9BQU9DLFNBQVMsTUFBTSxzQ0FBc0M7QUFDNUQsT0FBT0Msa0JBQWtCLE1BQU0seUNBQXlDO0FBQ3hFLE9BQU9DLGFBQWEsTUFBTSxvQ0FBb0M7QUFDOUQsT0FBT0MsbUJBQW1CLE1BQU0s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