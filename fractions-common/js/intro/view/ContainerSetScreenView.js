// Copyright 2018-2023, University of Colorado Boulder

/**
 * ScreenView for all intro-based screens that use sets of containers.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import merge from '../../../../phet-core/js/merge.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { AlignBox, AlignGroup, Node } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import FractionsCommonConstants from '../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../fractionsCommon.js';
import IntroRepresentation from '../model/IntroRepresentation.js';
import AdjustableFractionNode from './AdjustableFractionNode.js';
import BeakerSceneNode from './beaker/BeakerSceneNode.js';
import CakeSceneNode from './cake/CakeSceneNode.js';
import CircularSceneNode from './circular/CircularSceneNode.js';
import IntroRadioButtonGroup from './IntroRadioButtonGroup.js';
import NumberLineSceneNode from './numberline/NumberLineSceneNode.js';
import RectangularSceneNode from './rectangular/RectangularSceneNode.js';
import RectangularOrientation from './RectangularOrientation.js';

// constants
const MARGIN = FractionsCommonConstants.PANEL_MARGIN;

class ContainerSetScreenView extends ScreenView {
  /**
   * @param {ContainerSetModel} model
   */
  constructor( model, options ) {
    super( {
      preventFit: true
    } );

    options = merge( {
      // {boolean} - Passed to AdjustableFractionNode
      spinnersOnRight: true
    }, options );

    // @protected {ContainerSetModel}
    this.model = model;

    // @protected {AlignGroup}
    this.topAlignGroup = new AlignGroup( { matchHorizontal: false } );

    const representationRadioButtonGroup = new IntroRadioButtonGroup( model.representationProperty, [
      {
        value: IntroRepresentation.CIRCLE,
        createNode: () => CircularSceneNode.getIcon()
      },
      {
        value: IntroRepresentation.HORIZONTAL_BAR,
        createNode: () => RectangularSceneNode.getIcon( RectangularOrientation.HORIZONTAL )
      },
      {
        value: IntroRepresentation.VERTICAL_BAR,
        createNode: () => RectangularSceneNode.getIcon( RectangularOrientation.VERTICAL )
      },
      {
        value: IntroRepresentation.BEAKER,
        createNode: () => BeakerSceneNode.getIcon()
      },
      {
        value: IntroRepresentation.CAKE,
        createNode: () => CakeSceneNode.getIcon()
      },
      {
        value: IntroRepresentation.NUMBER_LINE,
        createNode: () => NumberLineSceneNode.getIcon()
      }
    ].filter( item => _.includes( model.representations, item.value ) ) );

    // @protected {Node}
    this.representationPanel = new Panel( new AlignBox( representationRadioButtonGroup, {
      group: this.topAlignGroup
    } ), {
      fill: FractionsCommonColors.introPanelBackgroundProperty,
      xMargin: FractionsCommonConstants.PANEL_MARGIN,
      yMargin: FractionsCommonConstants.PANEL_MARGIN
    } );

    // @protected {Node}
    this.bucketContainer = new Node();
    this.viewContainer = new Node();

    // @private {Node|null} the visual representation of the container set
    this.currentView = null;

    // Returns the current bucket position
    const getBucketPosition = () => {
      assert && assert( this.currentView.bucketNode );
      return this.currentView.bucketNode.getUniqueTrail().getMatrixTo( this.currentView.getUniqueTrail() ).timesVector2( Vector2.ZERO );
    };

    // present for the lifetime of the simulation
    model.representationProperty.link( representation => {
      phet.joist.display._input.interruptPointers();

      // Finish all animations
      model.completeAllPieces();


      if ( this.currentView ) {
        this.currentView.interruptSubtreeInput();

        this.viewContainer.interruptSubtreeInput();
        this.viewContainer.removeAllChildren();

        this.bucketContainer.interruptSubtreeInput();
        this.bucketContainer.removeAllChildren();

        this.currentView.dispose();
      }

      this.currentView = null;

      switch( representation ) {
        case IntroRepresentation.CIRCLE:
          this.currentView = new CircularSceneNode( model, {
            getBucketPosition: getBucketPosition
          } );
          break;
        case IntroRepresentation.VERTICAL_BAR:
          this.currentView = new RectangularSceneNode( model, {
            getBucketPosition: getBucketPosition,
            rectangularOrientation: RectangularOrientation.VERTICAL
          } );
          break;
        case IntroRepresentation.HORIZONTAL_BAR:
          this.currentView = new RectangularSceneNode( model, {
            getBucketPosition: getBucketPosition,
            rectangularOrientation: RectangularOrientation.HORIZONTAL
          } );
          break;
        case IntroRepresentation.BEAKER:
          this.currentView = new BeakerSceneNode( model, {
            getBucketPosition: getBucketPosition
          } );
          break;
        case IntroRepresentation.CAKE:
          this.currentView = new CakeSceneNode( model, {
            getBucketPosition: getBucketPosition
          } );
          break;
        case IntroRepresentation.NUMBER_LINE:
          this.currentView = new NumberLineSceneNode( model );
          break;
        default:
        // Don't have a current view. May happen on startup
      }
      if ( this.currentView ) {
        // add the chosen visual representation to the scene graph
        this.viewContainer.addChild( this.currentView );
        if ( this.currentView.pieceLayer ) {
          this.viewContainer.addChild( this.currentView.pieceLayer );
        }
        if ( this.currentView.bucketNode ) {
          this.bucketContainer.addChild( this.currentView.bucketNode );
        }
      }
    } );

    // @protected {Node}
    this.adjustableFractionNode = new AdjustableFractionNode( model.numeratorProperty, model.denominatorProperty, model.containerCountProperty, {
      spinnersOnRight: options.spinnersOnRight
    } );

    // @protected {Node}
    this.resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: this.layoutBounds.right - MARGIN,
      bottom: this.layoutBounds.bottom - MARGIN
    } );

    this.children = [
      this.representationPanel,
      this.adjustableFractionNode,
      this.resetAllButton,
      this.bucketContainer,
      this.viewContainer
    ];
  }

  /**
   * Sets up the initial layout of the screen view. Should be done once all initialization is complete.
   * @protected
   */
  initializeLayout() {

  }

  /**
   * Steps forward in time.
   *
   * @param {number} dt - time step
   * @public
   */
  step( dt ) {
    this.currentView.step( dt );
  }
}

fractionsCommon.register( 'ContainerSetScreenView', ContainerSetScreenView );
export default ContainerSetScreenView;
