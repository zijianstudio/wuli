// Copyright 2015-2023, University of Colorado Boulder

/**
 * Explore screenview of Make a Ten. Provides a panel where 100s, 10s or 1s can be dragged out, combined, and pulled
 * apart, and displays the total in the upper-left.
 *
 * @author Sharfudeen Ashraf
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import CountingObject from '../../../../../counting-common/js/common/model/CountingObject.js';
import CountingCommonScreenView from '../../../../../counting-common/js/common/view/CountingCommonScreenView.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import MathSymbols from '../../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { HBox, Text } from '../../../../../scenery/js/imports.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import makeATen from '../../../makeATen.js';
import MakeATenStrings from '../../../MakeATenStrings.js';
import MakeATenConstants from '../../common/MakeATenConstants.js';
import ExplorePanel from './ExplorePanel.js';
import SplitCueNode from './SplitCueNode.js';

const hideTotalString = MakeATenStrings.hideTotal;

// constants
const EQUATION_FONT = new PhetFont( { size: 60, weight: 'bold' } );

class MakeATenExploreScreenView extends CountingCommonScreenView {
  /**
   * @param {MakeATenExploreModel} model
   */
  constructor( model ) {

    super( model );

    // @private {Function} - Called with function( countingObjectNode ) on number splits
    this.numberSplitListener = this.onNumberSplit.bind( this );

    // @private {Function} - Called with function( countingObjectNode ) when a number begins to be interacted with.
    this.numberInteractionListener = this.onNumberInteractionStarted.bind( this );

    // @private {Function} - Called with function( countingObject ) when a number finishes animation
    this.numberAnimationFinishedListener = this.onNumberAnimationFinished.bind( this );

    // @private {Function} - Called with function( countingObject ) when a number finishes being dragged
    this.numberDragFinishedListener = this.onNumberDragFinished.bind( this );

    this.finishInitialization();

    // @private {BooleanProperty} - Whether the total (sum) is hidden
    this.hideSumProperty = new BooleanProperty( false );

    const sumText = new Text( '0', { font: EQUATION_FONT, fill: MakeATenConstants.EQUATION_FILL } );
    model.sumProperty.linkAttribute( sumText, 'string' );

    // @private {HBox} - Displays the sum of our numbers and an equals sign, e.g. "256 ="
    this.sumNode = new HBox( {
      children: [
        sumText,
        new Text( MathSymbols.EQUAL_TO, { font: EQUATION_FONT, fill: MakeATenConstants.EQUATION_FILL } )
      ], spacing: 15
    } );

    this.addChild( this.sumNode );

    // @private {ExplorePanel} - Shows 100,10,1 that can be dragged.
    this.explorePanel = new ExplorePanel( this, model.sumProperty, model.resetEmitter );
    this.addChild( this.explorePanel );

    const hideSumText = new Text( hideTotalString, {
      maxWidth: 150,
      font: new PhetFont( {
        size: 25,
        weight: 'bold'
      } ),
      fill: 'black'
    } );

    // @private {Checkbox} - When checked, hides the sum in the upper-left
    this.hideSumCheckbox = new Checkbox( this.hideSumProperty, hideSumText, {
      spacing: 10,
      boxWidth: 30
    } );
    this.hideSumCheckbox.touchArea = this.hideSumCheckbox.localBounds.dilatedXY( 10, 4 );
    this.addChild( this.hideSumCheckbox );

    this.hideSumProperty.link( hideSum => {
      this.sumNode.visible = !hideSum;
    } );

    this.addChild( this.countingObjectLayerNode );

    this.addChild( new SplitCueNode( model.splitCue ) );

    this.layoutControls();
  }

  /**
   * @public
   * @override
   */
  layoutControls() {
    super.layoutControls();

    const visibleBounds = this.visibleBoundsProperty.value;

    this.explorePanel.centerX = visibleBounds.centerX;
    this.explorePanel.bottom = visibleBounds.bottom - 10;

    this.hideSumCheckbox.left = this.explorePanel.right + 20;
    this.hideSumCheckbox.bottom = visibleBounds.bottom - 10;

    this.sumNode.left = visibleBounds.left + 30;
    this.sumNode.top = visibleBounds.top + 30;
  }

  /**
   * Whether the counting object is predominantly over the explore panel (should be collected).
   * @private
   *
   * @param {CountingObject} countingObject
   * @returns {boolean}
   */
  isNumberInReturnZone( countingObject ) {
    // Compute the local point on the number that would need to go into the return zone.
    // This point is a bit farther down than the exact center, as it was annoying to "miss" the return zone
    // slightly by being too high (while the mouse WAS in the return zone).
    const localBounds = countingObject.localBounds;
    const localReturnPoint = localBounds.center.plus( localBounds.centerBottom ).dividedScalar( 2 );

    // And the bounds of our panel
    const panelBounds = this.explorePanel.bounds.withMaxY( this.visibleBoundsProperty.value.bottom );

    // View coordinate of our return point
    const paperCenter = countingObject.positionProperty.value.plus( localReturnPoint );

    return panelBounds.containsPoint( paperCenter );
  }

  /**
   * @public
   * @override
   */
  onCountingObjectAdded( countingObject ) {
    const countingObjectNode = super.onCountingObjectAdded( countingObject );

    // Add listeners
    countingObjectNode.splitEmitter.addListener( this.numberSplitListener );
    countingObjectNode.interactionStartedEmitter.addListener( this.numberInteractionListener );
    countingObject.endAnimationEmitter.addListener( this.numberAnimationFinishedListener );
    countingObjectNode.endDragEmitter.addListener( this.numberDragFinishedListener );
  }

  /**
   * @public
   * @override
   */
  onCountingObjectRemoved( countingObject ) {
    const countingObjectNode = this.findCountingObjectNode( countingObject );

    // Remove listeners
    countingObjectNode.endDragEmitter.removeListener( this.numberDragFinishedListener );
    countingObject.endAnimationEmitter.removeListener( this.numberAnimationFinishedListener );
    countingObjectNode.interactionStartedEmitter.removeListener( this.numberInteractionListener );
    countingObjectNode.splitEmitter.removeListener( this.numberSplitListener );

    // Detach any attached cues
    if ( this.model.splitCue.countingObjectProperty.value === countingObject ) {
      this.model.splitCue.detach();
    }

    super.onCountingObjectRemoved( countingObject );
  }

  /**
   * Called when a counting object node is split.
   * @private
   *
   * @param {CountingObjectNode} countingObjectNode
   */
  onNumberSplit( countingObjectNode ) {
    this.model.splitCue.triggerFade();
  }

  /**
   * Called when a counting object node starts being interacted with.
   * @private
   *
   * @param {CountingObjectNode} countingObjectNode
   */
  onNumberInteractionStarted( countingObjectNode ) {
    const countingObject = countingObjectNode.countingObject;
    if ( countingObject.numberValueProperty.value > 1 ) {
      this.model.splitCue.attachToNumber( countingObject );
    }
  }

  /**
   * Called when a counting object has finished animating to its destination.
   * @private
   *
   * @param {CountingObject} countingObject
   */
  onNumberAnimationFinished( countingObject ) {
    // If it animated to the return zone, it's probably split and meant to be returned.
    if ( this.isNumberInReturnZone( countingObject ) ) {
      this.model.removeCountingObject( countingObject );
    }
  }

  /**
   * Called when a counting object has finished being dragged.
   * @private
   *
   * @param {CountingObjectNode} countingObjectNode
   */
  onNumberDragFinished( countingObjectNode ) {
    const countingObject = countingObjectNode.countingObject;

    // Return it to the panel if it's been dropped in the panel.
    if ( this.isNumberInReturnZone( countingObject ) ) {
      const baseNumbers = countingObject.baseNumbers;

      // Split it into a CountingObject for each of its base numbers, and animate them to their targets in the
      // explore panel.
      for ( let i = baseNumbers.length - 1; i >= 0; i-- ) {
        const baseNumber = baseNumbers[ i ];
        const baseCountingObject = new CountingObject( baseNumber.numberValue, countingObject.positionProperty.value );

        // Set its destination to the proper target (with the offset so that it will disappear once centered).
        let targetPosition = this.explorePanel.digitLengthToTargetNode[ baseNumber.digitLength ].getOriginPosition();
        const paperCenterOffset = new CountingObject( baseNumber.numberValue, new Vector2( 0, 0 ) ).localBounds.center;
        targetPosition = targetPosition.minus( paperCenterOffset );
        baseCountingObject.setDestination( targetPosition, true );

        // Add the new base counting object
        this.model.addCountingObject( baseCountingObject );
      }

      // Remove the original counting object (as we have added its components).
      this.model.removeCountingObject( countingObject );
    }
  }

  /**
   * @public
   * @override
   */
  reset() {
    super.reset();

    this.hideSumProperty.reset();
  }
}

makeATen.register( 'MakeATenExploreScreenView', MakeATenExploreScreenView );

export default MakeATenExploreScreenView;
