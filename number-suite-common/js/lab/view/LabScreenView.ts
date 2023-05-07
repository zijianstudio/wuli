// Copyright 2019-2023, University of Colorado Boulder

/**
 * ScreenView for the 'Lab' screen.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Animation from '../../../../twixt/js/Animation.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { ManualConstraint, Node, PressListenerEvent, Rectangle } from '../../../../scenery/js/imports.js';
import NumberSuiteCommonConstants from '../../common/NumberSuiteCommonConstants.js';
import CountingAreaNode from '../../common/view/CountingAreaNode.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import TenFrame from '../model/TenFrame.js';
import DraggableTenFrameNode from './DraggableTenFrameNode.js';
import NumberCardCreatorCarousel from './NumberCardCreatorCarousel.js';
import LabModel from '../model/LabModel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CountingObjectType from '../../../../counting-common/js/common/model/CountingObjectType.js';
import SymbolCardCreatorPanel from './SymbolCardCreatorPanel.js';
import TenFrameCreatorPanel from './TenFrameCreatorPanel.js';
import Easing from '../../../../twixt/js/Easing.js';
import CountingObject from '../../../../counting-common/js/common/model/CountingObject.js';
import CountingCommonConstants from '../../../../counting-common/js/common/CountingCommonConstants.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import type SymbolType from './SymbolType.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberSuiteCommonPreferences from '../../common/model/NumberSuiteCommonPreferences.js';

const TEN_FRAME_CREATOR_PANEL_LEFT = 143;
const CREATOR_NODE_SPACING = 18;

class LabScreenView<T extends NumberSuiteCommonPreferences> extends ScreenView {
  private readonly model: LabModel;

  // node for all pieces to share
  public readonly pieceLayer: Node;
  public readonly numberCardCreatorCarousel: NumberCardCreatorCarousel;
  private readonly tenFrameNodes: DraggableTenFrameNode[];
  public readonly symbolCardCreatorPanel: SymbolCardCreatorPanel;
  private readonly tenFrameCreatorPanel: TenFrameCreatorPanel;
  private readonly onesCountingAreaNode: CountingAreaNode;
  private readonly dogCountingAreaNode: CountingAreaNode;
  private readonly appleCountingAreaNode: CountingAreaNode;
  private readonly butterflyCountingAreaNode: CountingAreaNode;
  private readonly ballCountingAreaNode: CountingAreaNode;
  private readonly countingObjectTypeToCountingAreaNode: Map<CountingObjectType, CountingAreaNode>;
  private readonly countingAreaNodes: CountingAreaNode[];
  public readonly objectCountingAreaBoundsProperty: TReadOnlyProperty<Bounds2>;
  public readonly numberCardBoundsProperty: TReadOnlyProperty<Bounds2>;
  public readonly symbolCardBoundsProperty: TReadOnlyProperty<Bounds2>;

  // return zone where any pieces from the bottom row will return to their home if they intersect when dropped
  public readonly bottomReturnZoneProperty: TProperty<Bounds2>;

  public constructor( model: LabModel, symbolTypes: SymbolType[], preferences: T, tandem: Tandem ) {

    super( {
      tandem: tandem
    } );

    this.model = model;
    this.pieceLayer = new Node();
    const backgroundDragTargetNode = new Rectangle( this.layoutBounds ); // see CountingAreaNode for doc

    this.numberCardCreatorCarousel = new NumberCardCreatorCarousel( this );
    this.numberCardCreatorCarousel.centerX = this.layoutBounds.centerX;
    this.addChild( this.numberCardCreatorCarousel );

    // create the symbolCardCreatorPanel, position later after we create the boundsProperty
    this.symbolCardCreatorPanel = new SymbolCardCreatorPanel( model, this, symbolTypes );

    this.tenFrameCreatorPanel = new TenFrameCreatorPanel( model, this );
    this.tenFrameCreatorPanel.left = TEN_FRAME_CREATOR_PANEL_LEFT;
    this.addChild( this.tenFrameCreatorPanel );

    this.numberCardBoundsProperty = new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
      return visibleBounds.withMaxY( visibleBounds.maxY - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y -
                                     this.tenFrameCreatorPanel.height )
        .withMaxX( visibleBounds.maxX - this.symbolCardCreatorPanel.width - CountingCommonConstants.COUNTING_AREA_MARGIN );
    } );
    this.symbolCardBoundsProperty = new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
      return visibleBounds.withMinY( visibleBounds.minY + NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y +
                                     this.numberCardCreatorCarousel.height ).withMaxY(
        visibleBounds.maxY - CountingCommonConstants.COUNTING_AREA_MARGIN - this.tenFrameCreatorPanel.height );
    } );
    this.objectCountingAreaBoundsProperty = new DerivedProperty( [ this.visibleBoundsProperty ], visibleBounds => {
      return visibleBounds.withMinY( visibleBounds.minY + NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y +
                                     this.numberCardCreatorCarousel.height )
        .withMaxX( visibleBounds.maxX - this.symbolCardCreatorPanel.width - CountingCommonConstants.COUNTING_AREA_MARGIN );
    } );

    this.bottomReturnZoneProperty = new Property( new Bounds2( 0, 0, 0, 0 ) );

    const countingAreaNodeOptions = {
      countingObjectCreatorPanelOptions: {
        arrowButtonsVisible: false, // see https://github.com/phetsims/number-suite-common/issues/11
        xMargin: 20 // increase a bit because we're not showing arrow buttons
      },
      countingObjectLayerNode: this.pieceLayer,
      backgroundDragTargetNode: backgroundDragTargetNode,
      returnZoneProperty: this.bottomReturnZoneProperty
    };

    // create and add the left ObjectsCountingAreaNode
    this.dogCountingAreaNode = new CountingAreaNode(
      model.dogCountingArea,
      new EnumerationProperty( CountingObjectType.DOG ),
      this.objectCountingAreaBoundsProperty,
      countingAreaNodeOptions
    );
    this.addChild( this.dogCountingAreaNode );

    // create and add the right ObjectsCountingAreaNode
    this.appleCountingAreaNode = new CountingAreaNode(
      model.appleCountingArea,
      new EnumerationProperty( CountingObjectType.APPLE ),
      this.objectCountingAreaBoundsProperty,
      countingAreaNodeOptions
    );
    this.addChild( this.appleCountingAreaNode );

    // create and add the right ObjectsCountingAreaNode
    this.butterflyCountingAreaNode = new CountingAreaNode(
      model.butterflyCountingArea,
      new EnumerationProperty( CountingObjectType.BUTTERFLY ),
      this.objectCountingAreaBoundsProperty,
      countingAreaNodeOptions
    );
    this.addChild( this.butterflyCountingAreaNode );

    // create and add the right ObjectsCountingAreaNode
    this.ballCountingAreaNode = new CountingAreaNode(
      model.ballCountingArea,
      new EnumerationProperty( CountingObjectType.BALL ),
      this.objectCountingAreaBoundsProperty,
      countingAreaNodeOptions
    );
    this.addChild( this.ballCountingAreaNode );

    // create and add the CountingAreaNode
    this.onesCountingAreaNode = new CountingAreaNode(
      model.onesCountingArea,
      new EnumerationProperty( CountingObjectType.PAPER_NUMBER ),
      this.objectCountingAreaBoundsProperty,
      countingAreaNodeOptions
    );
    this.addChild( this.onesCountingAreaNode );

    const hideOnesCountingAreaNodeAdjustment = this.onesCountingAreaNode.countingObjectCreatorPanel.width / 2;

    preferences.showLabOnesProperty.link( showLabOnes => {
      if ( showLabOnes ) {
        this.tenFrameCreatorPanel.left = TEN_FRAME_CREATOR_PANEL_LEFT;
      }
      else {
        this.model.onesCountingArea.reset();
        this.tenFrameCreatorPanel.left = TEN_FRAME_CREATOR_PANEL_LEFT + hideOnesCountingAreaNodeAdjustment;
      }
      this.onesCountingAreaNode.visible = showLabOnes;
    } );

    // Note that all CountingAreaNode instances are assumed to be positioned at (0,0) and therefore are in
    // the same coordinate frame as this ScreenView. Here we reach inside those CountingAreaNode instances
    // and position their CountingObjectCreatorPanels. This made it impossible to change the layout so that
    // all counting objects are in a single panel, so we bailed on https://github.com/phetsims/number-suite-common/issues/11.
    ManualConstraint.create( this, [ this.tenFrameCreatorPanel, this.dogCountingAreaNode.countingObjectCreatorPanel,
        this.appleCountingAreaNode.countingObjectCreatorPanel, this.butterflyCountingAreaNode.countingObjectCreatorPanel,
        this.ballCountingAreaNode.countingObjectCreatorPanel, this.onesCountingAreaNode.countingObjectCreatorPanel ],
      ( tenFrameCreatorNodeProxy, dogCreatorNodeProxy, appleCreatorNodeProxy, butterflyCreatorNodeProxy,
        ballsCreatorNodeProxy, onesCreatorNodeProxy ) => {
        dogCreatorNodeProxy.left = tenFrameCreatorNodeProxy.right + CREATOR_NODE_SPACING;
        appleCreatorNodeProxy.left = dogCreatorNodeProxy.right + CREATOR_NODE_SPACING;
        butterflyCreatorNodeProxy.left = appleCreatorNodeProxy.right + CREATOR_NODE_SPACING;
        ballsCreatorNodeProxy.left = butterflyCreatorNodeProxy.right + CREATOR_NODE_SPACING;
        onesCreatorNodeProxy.left = ballsCreatorNodeProxy.right + CREATOR_NODE_SPACING;
      } );

    this.countingObjectTypeToCountingAreaNode = new Map();
    this.countingObjectTypeToCountingAreaNode.set( CountingObjectType.DOG, this.dogCountingAreaNode );
    this.countingObjectTypeToCountingAreaNode.set( CountingObjectType.APPLE, this.appleCountingAreaNode );
    this.countingObjectTypeToCountingAreaNode.set( CountingObjectType.BUTTERFLY, this.butterflyCountingAreaNode );
    this.countingObjectTypeToCountingAreaNode.set( CountingObjectType.BALL, this.ballCountingAreaNode );
    this.countingObjectTypeToCountingAreaNode.set( CountingObjectType.PAPER_NUMBER, this.onesCountingAreaNode );

    this.countingAreaNodes = [
      this.dogCountingAreaNode,
      this.appleCountingAreaNode,
      this.butterflyCountingAreaNode,
      this.ballCountingAreaNode,
      this.onesCountingAreaNode
    ];

    // position and add the symbolCardCreatorPanel later, so we have access to its bounds Property
    this.symbolCardCreatorPanel.centerY = this.symbolCardBoundsProperty.value.centerY;
    this.addChild( this.symbolCardCreatorPanel );

    this.tenFrameNodes = [];

    model.tenFrames.addItemAddedListener( this.addTenFrameNode.bind( this ) );

    // add the piece layer
    this.addChild( this.pieceLayer );

    phet.joist.display.addInputListener( {
      down: ( event: PressListenerEvent ) => {
        const screen = phet.joist.sim.selectedScreenProperty.value;
        if ( screen && screen.view === this ) {

          let tenFrameNodeFound = false;
          event.trail.nodes.forEach( node => {
            if ( node instanceof DraggableTenFrameNode ) {
              tenFrameNodeFound = true;
            }
          } );

          if ( !tenFrameNodeFound ) {
            model.selectedTenFrameProperty.value = null;
          }
        }
      }
    } );

    // create and add the ResetAllButton
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput(); // cancel interactions that may be in progress
        model.reset();
        this.numberCardCreatorCarousel.reset();
        this.symbolCardCreatorPanel.reset();
      },
      right: this.layoutBounds.maxX - NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_X,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // Update the position of panels when the visible bounds change so everything floats to an edge of the window.
    Multilink.multilink( [ this.visibleBoundsProperty, preferences.showLabOnesProperty ],
      ( visibleBounds, showLabOnes ) => {
        this.numberCardCreatorCarousel.top = visibleBounds.top + NumberSuiteCommonConstants.SCREEN_VIEW_PADDING_Y;

        this.symbolCardCreatorPanel.right = visibleBounds.right - CountingCommonConstants.COUNTING_AREA_MARGIN;
        resetAllButton.right = visibleBounds.right - CountingCommonConstants.COUNTING_AREA_MARGIN;
        const bottomY = visibleBounds.bottom - CountingCommonConstants.COUNTING_AREA_MARGIN;
        this.tenFrameCreatorPanel.bottom = bottomY;
        resetAllButton.bottom = bottomY;

        const returnZoneRightBoundary = showLabOnes ? this.onesCountingAreaNode.right : this.ballCountingAreaNode.right;

        this.bottomReturnZoneProperty.value = new Bounds2( this.tenFrameCreatorPanel.left, this.tenFrameCreatorPanel.top,
          returnZoneRightBoundary, bottomY );
      } );

    // Constrain the position of the numberCards when the bounds change.
    this.numberCardBoundsProperty.link( numberCardBounds => {
      this.numberCardCreatorCarousel.getAllNumberCardNodes().forEach( numberCardNode => {
        numberCardNode.setConstrainedDestination( numberCardBounds, numberCardNode.positionProperty.value );
      } );
    } );

    // Constrain the position of the symbolCards when the bounds change.
    this.symbolCardBoundsProperty.link( symbolCardBounds => {
      this.symbolCardCreatorPanel.getAllSymbolNodes().forEach( symbolCardNode => {
        symbolCardNode.setConstrainedDestination( symbolCardBounds, symbolCardNode.positionProperty.value );
      } );
    } );
  }

  /**
   * Returns the counting object type of the CountingObjectNode for the given CountingObject
   */
  private getCountingObjectType( countingObject: CountingObject ): CountingObjectType {
    let countingObjectType = CountingObjectType.DOG;
    let countingObjectTypeFound = false;

    for ( let i = 0; i < this.countingAreaNodes.length; i++ ) {
      const countingAreaNode = this.countingAreaNodes[ i ];

      if ( countingAreaNode.countingArea.countingObjects.includes( countingObject ) ) {
        const countingObjectNode = countingAreaNode.getCountingObjectNode( countingObject );
        countingObjectType = countingObjectNode.countingObjectTypeProperty.value;
        countingObjectTypeFound = true;
        break;
      }
    }

    assert && assert( countingObjectTypeFound, 'countingObjectType not found!' );
    return countingObjectType;
  }

  /**
   * Called when a new Ten Frame is added to the model.
   */
  private addTenFrameNode( tenFrame: TenFrame ): void {

    // Called when DraggableTenFrameNode drag cycle ends.
    const dropListener = ( tenFrameNode: DraggableTenFrameNode ) => {

      // If a drag was interrupted by pressing the Reset All button (multitouch), then tenFrameNode will already
      // have been disposed, and this can be short-circuited. See https://github.com/phetsims/number-play/issues/195
      if ( !tenFrameNode.isDisposed && tenFrameNode.bounds.intersectsBounds( this.bottomReturnZoneProperty.value ) ) {
        tenFrameNode.inputEnabled = false;
        tenFrame.countingObjects.clear();

        // calculate icon's origin
        const trail = this.getUniqueLeafTrailTo( this.tenFrameCreatorPanel.iconNode ).slice( 1 );
        const globalOrigin = trail.localToGlobalPoint( this.tenFrameCreatorPanel.iconNode.localBounds.leftTop );

        const distance = tenFrame.positionProperty.value.distance( globalOrigin );
        const duration =
          CountingCommonConstants.ANIMATION_TIME_RANGE.constrainValue( distance / CountingCommonConstants.ANIMATION_SPEED );

        const removeAnimation = new Animation( {
          duration: duration,
          targets: [ {
            property: tenFrame.positionProperty,
            easing: Easing.CUBIC_IN_OUT,
            to: globalOrigin
          }, {
            property: tenFrame.scaleProperty,
            easing: Easing.CUBIC_IN_OUT,
            to: TenFrameCreatorPanel.ICON_SCALE
          } ]
        } );

        removeAnimation.finishEmitter.addListener( () => {
          this.model.tenFrames.includes( tenFrame ) && this.model.tenFrames.remove( tenFrame );
        } );
        removeAnimation.start();
      }
    };

    const tenFrameNode = new DraggableTenFrameNode( tenFrame, this.model.selectedTenFrameProperty,
      this.objectCountingAreaBoundsProperty, {
        dropListener: dropListener,
        removeCountingObjectListener: countingObject => {
          const countingAreaNode = this.getCorrespondingCountingAreaNode( countingObject );
          countingAreaNode.countingArea.sendCountingObjectToCreatorNode( countingObject );
        },
        getCountingObjectNode: countingObject => {
          const countingAreaNode = this.getCorrespondingCountingAreaNode( countingObject );
          return countingAreaNode.getCountingObjectNode( countingObject );
        }
      } );

    this.tenFrameNodes.push( tenFrameNode );
    this.pieceLayer.addChild( tenFrameNode );

    tenFrame.disposeEmitter.addListener( () => {
      this.removeTenFrameNode( tenFrame );
    } );
  }

  /**
   * Called when a TenFrame is removed from the model.
   */
  private removeTenFrameNode( tenFrame: TenFrame ): void {
    const tenFrameNode = this.getTenFrameNode( tenFrame );

    _.pull( this.tenFrameNodes, tenFrameNode );
    this.pieceLayer.removeChild( tenFrameNode );
    tenFrameNode.dispose();
  }

  /**
   * Returns the corresponding DraggableTenFrameNode for a given TenFrame.
   */
  public getTenFrameNode( tenFrame: TenFrame ): DraggableTenFrameNode {
    const tenFrameNode = _.find( this.tenFrameNodes, tenFrameNode => tenFrameNode.tenFrame === tenFrame );
    assert && assert( tenFrameNode, 'matching tenFrameNode not found!' );
    return tenFrameNode!;
  }

  /**
   * Each type of counting object has its own countingArea, so when working with a counting object, we need to look up
   * its corresponding countingArea in order to do an operation on it (like sending the counting object back to its origin).
   */
  private getCorrespondingCountingAreaNode( countingObject: CountingObject ): CountingAreaNode {
    const countingObjectType = this.getCountingObjectType( countingObject );
    const countingAreaNode = this.countingObjectTypeToCountingAreaNode.get( countingObjectType );
    assert && assert( countingAreaNode, 'countingAreaNode not found for counting object type: ' + countingObjectType.name );
    return countingAreaNode!;
  }
}

numberSuiteCommon.register( 'LabScreenView', LabScreenView );
export default LabScreenView;
