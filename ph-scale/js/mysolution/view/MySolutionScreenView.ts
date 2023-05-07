// Copyright 2013-2023, University of Colorado Boulder

/**
 * View for the 'My Solution' screen.
 *
 * NOTE:
 * This view currently consists of a subset of the nodes in the 'Micro' screen.
 * But some of the common nodes are configured differently, and the screen has different layering and layout requirements.
 * So I choose to duplicate some code rather than attempt a refactor that would result in an implementation that
 * was more difficult to understand and maintain.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { ScreenOptions } from '../../../../joist/js/Screen.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { EmptySelfOptions, optionize3 } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { Node } from '../../../../scenery/js/imports.js';
import PHScaleConstants from '../../common/PHScaleConstants.js';
import BeakerControlPanel from '../../common/view/BeakerControlPanel.js';
import BeakerNode from '../../common/view/BeakerNode.js';
import GraphNode from '../../common/view/graph/GraphNode.js';
import ParticleCountsNode from '../../common/view/ParticleCountsNode.js';
import PHScaleViewProperties from '../../common/view/PHScaleViewProperties.js';
import RatioNode from '../../common/view/RatioNode.js';
import SolutionNode from '../../common/view/SolutionNode.js';
import VolumeIndicatorNode from '../../common/view/VolumeIndicatorNode.js';
import phScale from '../../phScale.js';
import MySolutionModel from '../model/MySolutionModel.js';
import MySolutionPHAccordionBox from './MySolutionPHAccordionBox.js';

type SelfOptions = EmptySelfOptions;

type MySolutionScreenViewOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class MySolutionScreenView extends ScreenView {

  public constructor( model: MySolutionModel, modelViewTransform: ModelViewTransform2, provideOptions: MySolutionScreenViewOptions ) {

    const options = optionize3<MySolutionScreenViewOptions, SelfOptions, StrictOmit<ScreenOptions, 'tandem'>>()( {},
      PHScaleConstants.SCREEN_VIEW_OPTIONS, provideOptions );

    super( options );

    // view-specific properties
    const viewProperties = new PHScaleViewProperties( options.tandem.createTandem( 'viewProperties' ) );

    // beaker
    const beakerNode = new BeakerNode( model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem( 'beakerNode' )
    } );

    // solution in the beaker
    const solutionNode = new SolutionNode( model.solution.totalVolumeProperty, model.solution.colorProperty,
      model.beaker, modelViewTransform );

    // volume indicator along the right edge of the beaker
    const volumeIndicatorNode = new VolumeIndicatorNode( model.solution.totalVolumeProperty, model.beaker, modelViewTransform, {
      tandem: options.tandem.createTandem( 'volumeIndicatorNode' )
    } );

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

    // beaker controls
    const beakerControlPanel = new BeakerControlPanel(
      viewProperties.ratioVisibleProperty,
      viewProperties.particleCountsVisibleProperty, {
        maxWidth: 0.85 * beakerNode.width,
        tandem: options.tandem.createTandem( 'beakerControlPanel' )
      } );

    // graph
    const graphNode = new GraphNode( model.solution.totalVolumeProperty, model.solution.derivedProperties, {
      pHProperty: model.solution.pHProperty,
      logScaleHeight: 565,
      tandem: options.tandem.createTandem( 'graphNode' )
    } );

    // pH meter
    const pHAccordionBoxTop = 15;
    const pHAccordionBox = new MySolutionPHAccordionBox( model.solution.pHProperty,
      modelViewTransform.modelToViewY( model.beaker.position.y ) - pHAccordionBoxTop, {
        tandem: options.tandem.createTandem( 'pHAccordionBox' )
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
        solutionNode,
        pHAccordionBox,
        ratioNode,
        beakerNode,
        particleCountsNode,
        volumeIndicatorNode,
        beakerControlPanel,
        graphNode,
        resetAllButton
      ]
    } );
    this.addChild( screenViewRootNode );

    // Layout of nodes that don't have a position specified in the model
    pHAccordionBox.left = beakerNode.left;
    pHAccordionBox.top = pHAccordionBoxTop;
    particleCountsNode.centerX = beakerNode.centerX;
    particleCountsNode.bottom = beakerNode.bottom - 25;

    beakerControlPanel.boundsProperty.link( bounds => {
      beakerControlPanel.centerX = beakerNode.centerX;
      beakerControlPanel.top = beakerNode.bottom + 10;
    } );

    graphNode.right = beakerNode.left - 70;
    graphNode.top = pHAccordionBox.top;
    resetAllButton.right = this.layoutBounds.right - 40;
    resetAllButton.bottom = this.layoutBounds.bottom - 20;

    // keyboard traversal order, see https://github.com/phetsims/ph-scale/issues/249
    screenViewRootNode.pdomOrder = [
      pHAccordionBox,
      beakerControlPanel,
      graphNode,
      resetAllButton
    ];
  }
}

phScale.register( 'MySolutionScreenView', MySolutionScreenView );