// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for the 'Macro' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import { ScreenOptions } from '../../../../joist/js/Screen.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import EyeDropperNode from '../../../../scenery-phet/js/EyeDropperNode.js';
import { Node } from '../../../../scenery/js/imports.js';
import Water from '../../common/model/Water.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import BeakerNode from '../../common/view/BeakerNode.js';
import DrainFaucetNode from '../../common/view/DrainFaucetNode.js';
import DropperFluidNode from '../../common/view/DropperFluidNode.js';
import FaucetFluidNode from '../../common/view/FaucetFluidNode.js';
import PHDropperNode from '../../common/view/PHDropperNode.js';
import SoluteComboBox from '../../common/view/SoluteComboBox.js';
import SolutionNode from '../../common/view/SolutionNode.js';
import VolumeIndicatorNode from '../../common/view/VolumeIndicatorNode.js';
import WaterFaucetNode from '../../common/view/WaterFaucetNode.js';
import phScale from '../../phScale.js';
import MacroPHMeterNode from './MacroPHMeterNode.js';
import NeutralIndicatorNode from './NeutralIndicatorNode.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import MacroModel from '../model/MacroModel.js';

type SelfOptions = EmptySelfOptions;

type MacroScreenViewOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class MacroScreenView extends ScreenView {

  public constructor( model: MacroModel, modelViewTransform: ModelViewTransform2, providedOptions: MacroScreenViewOptions ) {

    const options = optionize3<MacroScreenViewOptions, SelfOptions, StrictOmit<ScreenOptions, 'tandem'>>()( {},
      PHScaleConstants.SCREEN_VIEW_OPTIONS, providedOptions );

    super( options );

    // beaker
    const beakerNode = new BeakerNode( model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem( 'beakerNode' )
    } );

    // solution in the beaker
    const solutionNode = new SolutionNode( model.solution.totalVolumeProperty, model.solution.colorProperty,
      model.beaker, modelViewTransform );

    // volume indicator on the right edge of beaker
    const volumeIndicatorNode = new VolumeIndicatorNode( model.solution.totalVolumeProperty, model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem( 'volumeIndicatorNode' )
    } );

    // Neutral indicator that appears in the bottom of the beaker.
    const neutralIndicatorNode = new NeutralIndicatorNode( model.solution.pHProperty, {
      tandem: options.tandem.createTandem( 'neutralIndicatorNode' )
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

    // fluids coming out of faucets
    const WATER_FLUID_HEIGHT = model.beaker.position.y - model.waterFaucet.position.y;
    const DRAIN_FLUID_HEIGHT = 1000; // tall enough that resizing the play area is unlikely to show bottom of fluid
    const waterFluidNode = new FaucetFluidNode( model.waterFaucet, new Property( Water.color ), WATER_FLUID_HEIGHT, modelViewTransform );
    const drainFluidNode = new FaucetFluidNode( model.drainFaucet, model.solution.colorProperty, DRAIN_FLUID_HEIGHT, modelViewTransform );

    // Hide fluids when their faucets are hidden. See https://github.com/phetsims/ph-scale/issues/107
    waterFaucetNode.visibleProperty.lazyLink( () => {
      waterFluidNode.visible = waterFaucetNode.visible;
    } );
    drainFaucetNode.visibleProperty.lazyLink( () => {
      drainFluidNode.visible = drainFaucetNode.visible;
    } );

    // pH meter
    const pHMeterNode = new MacroPHMeterNode( model.pHMeter, model.solution, model.dropper,
      solutionNode, dropperFluidNode, waterFluidNode, drainFluidNode, modelViewTransform, {
        tandem: options.tandem.createTandem( 'pHMeterNode' )
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
        beakerNode,
        neutralIndicatorNode,
        volumeIndicatorNode,
        soluteComboBox,
        resetAllButton,
        pHMeterNode, // next to last so that probe doesn't get lost behind anything
        soluteListParent // last, so that combo box list is on top
      ]
    } );
    this.addChild( screenViewRootNode );

    // Layout of nodes that don't have a position specified in the model
    soluteComboBox.left = modelViewTransform.modelToViewX( model.beaker.left ) - 20; // anchor on left, so it grows to the right during i18n
    soluteComboBox.top = this.layoutBounds.top + 15;
    resetAllButton.right = this.layoutBounds.right - 40;
    resetAllButton.bottom = this.layoutBounds.bottom - 20;

    // Keep the neutral indicator centered in the bottom of the beaker.
    neutralIndicatorNode.boundsProperty.link( bounds => {
      neutralIndicatorNode.centerX = beakerNode.centerX;
      neutralIndicatorNode.bottom = beakerNode.bottom - 30;
    } );

    model.isAutofillingProperty.link( () => dropperNode.interruptSubtreeInput() );

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    screenViewRootNode.pdomOrder = [
      pHMeterNode,
      soluteComboBox,
      dropperNode,
      waterFaucetNode,
      drainFaucetNode,
      resetAllButton
    ];
  }
}

phScale.register( 'MacroScreenView', MacroScreenView );