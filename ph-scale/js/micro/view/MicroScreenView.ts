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
import { ScreenOptions } from '../../../../joist/js/Screen.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
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
import MicroModel from '../model/MicroModel.js';

type SelfOptions = EmptySelfOptions;

type MicroScreenViewOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class MicroScreenView extends ScreenView {

  public constructor( model: MicroModel, modelViewTransform: ModelViewTransform2, providedOptions: MicroScreenViewOptions ) {

    const options = optionize3<MicroScreenViewOptions, SelfOptions, StrictOmit<ScreenOptions, 'tandem'>>()( {},
      PHScaleConstants.SCREEN_VIEW_OPTIONS, providedOptions );

    super( options );

    // view-specific properties
    const viewProperties = new PHScaleViewProperties( options.tandem.createTandem( 'viewProperties' ) );

    // beaker
    const beakerNode = new BeakerNode( model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem( 'beakerNode' )
    } );

    // solution
    const solutionNode = new SolutionNode( model.solution.totalVolumeProperty, model.solution.colorProperty,
      model.beaker, modelViewTransform );

    // volume indicator on right side of beaker
    const volumeIndicatorNode = new VolumeIndicatorNode( model.solution.totalVolumeProperty, model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem( 'volumeIndicatorNode' )
    } );

    // dropper
    const DROPPER_SCALE = 0.85;
    const dropperNode = new PHDropperNode( model.dropper, modelViewTransform, {
      visibleProperty: model.dropper.visibleProperty,
      tandem: options.tandem.createTandem( 'dropperNode' )
    } );
    dropperNode.setScaleMagnitude( DROPPER_SCALE );
    const dropperFluidNode = new DropperFluidNode( model.dropper, model.beaker, DROPPER_SCALE * EyeDropperNode.TIP_WIDTH,
      modelViewTransform, {
        visibleProperty: model.dropper.visibleProperty
      } );

    // faucets
    const waterFaucetNode = new WaterFaucetNode( model.waterFaucet, modelViewTransform, {
      tandem: options.tandem.createTandem( 'waterFaucetNode' )
    } );
    const drainFaucetNode = new DrainFaucetNode( model.drainFaucet, modelViewTransform, {
      tandem: options.tandem.createTandem( 'drainFaucetNode' )
    } );
    const SOLVENT_FLUID_HEIGHT = model.beaker.position.y - model.waterFaucet.position.y;
    const DRAIN_FLUID_HEIGHT = 1000; // tall enough that resizing the play area is unlikely to show bottom of fluid
    const waterFluidNode = new FaucetFluidNode( model.waterFaucet, new Property( Water.color ), SOLVENT_FLUID_HEIGHT, modelViewTransform );
    const drainFluidNode = new FaucetFluidNode( model.drainFaucet, model.solution.colorProperty, DRAIN_FLUID_HEIGHT, modelViewTransform );

    // 'H3O+/OH- ratio' representation
    const ratioNode = new RatioNode( model.beaker, model.solution.pHProperty, model.solution.totalVolumeProperty, modelViewTransform, {
      visibleProperty: viewProperties.ratioVisibleProperty,
      tandem: options.tandem.createTandem( 'ratioNode' )
    } );

    // 'Particle Counts' representation
    const particleCountsNode = new ParticleCountsNode( model.solution.derivedProperties, {
      visibleProperty: viewProperties.particleCountsVisibleProperty,
      tandem: options.tandem.createTandem( 'particleCountsNode' )
    } );

    // beaker control panel
    const beakerControlPanel = new BeakerControlPanel(
      viewProperties.ratioVisibleProperty,
      viewProperties.particleCountsVisibleProperty, {
        maxWidth: 0.85 * beakerNode.width,
        tandem: options.tandem.createTandem( 'beakerControlPanel' )
      } );

    // graph
    const graphNode = new GraphNode( model.solution.totalVolumeProperty, model.solution.derivedProperties, {
      pHProperty: model.solution.pHProperty,
      hasLinearFeature: true,
      logScaleHeight: 485,
      linearScaleHeight: 440,
      tandem: options.tandem.createTandem( 'graphNode' )
    } );

    // pH meter
    const pHMeterTop = 15;
    const pHAccordionBox = new MicroPHAccordionBox( model.solution.pHProperty,
      modelViewTransform.modelToViewY( model.beaker.position.y ) - pHMeterTop, {
        tandem: options.tandem.createTandem( 'pHAccordionBox' )
      } );

    // solutes combo box
    const soluteListParent = new Node();
    const soluteComboBox = new SoluteComboBox( model.dropper.soluteProperty, soluteListParent, {
      maxWidth: 400,
      tandem: options.tandem.createTandem( 'soluteComboBox' )
    } );

    const resetAllButton = new ResetAllButton( {
      scale: 1.32,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        viewProperties.reset();
        graphNode.reset();
        pHAccordionBox.reset();
      },
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );

    // Parent for all nodes added to this screen
    const screenViewRootNode = new Node( {
      children: [
        // nodes are rendered in this order
        waterFluidNode,
        waterFaucetNode,
        drainFluidNode,
        drainFaucetNode,
        dropperFluidNode,
        dropperNode,
        solutionNode,
        pHAccordionBox,
        ratioNode,
        beakerNode,
        particleCountsNode,
        volumeIndicatorNode,
        beakerControlPanel,
        graphNode,
        resetAllButton,
        soluteComboBox,
        soluteListParent // last, so that combo box list is on top
      ]
    } );
    this.addChild( screenViewRootNode );

    // Layout of nodes that don't have a position specified in the model
    particleCountsNode.centerX = beakerNode.centerX;
    particleCountsNode.bottom = beakerNode.bottom - 25;

    beakerControlPanel.boundsProperty.link( bounds => {
      beakerControlPanel.centerX = beakerNode.centerX;
      beakerControlPanel.top = beakerNode.bottom + 10;
    } );

    pHAccordionBox.left = modelViewTransform.modelToViewX( model.beaker.left ) - ( 0.4 * pHAccordionBox.width );
    pHAccordionBox.top = pHMeterTop;
    graphNode.right = drainFaucetNode.left - 40;
    graphNode.top = pHAccordionBox.top;
    soluteComboBox.left = pHAccordionBox.right + 35;
    soluteComboBox.top = this.layoutBounds.top + pHMeterTop;
    resetAllButton.right = this.layoutBounds.right - 40;
    resetAllButton.bottom = this.layoutBounds.bottom - 20;

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    screenViewRootNode.pdomOrder = [
      pHAccordionBox,
      soluteComboBox,
      dropperNode,
      waterFaucetNode,
      drainFaucetNode,
      beakerControlPanel,
      graphNode,
      resetAllButton
    ];
  }
}

phScale.register( 'MicroScreenView', MicroScreenView );