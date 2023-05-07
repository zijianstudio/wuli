// Copyright 2019-2022, University of Colorado Boulder

/**
 * View where you can create custom tracks which are draggable, configurable,
 * splittable, and attachable.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import { Color } from '../../../../scenery/js/imports.js';
import EnergySkateParkScreenView from '../../common/view/EnergySkateParkScreenView.js';
import TrackToolboxPanel from '../../common/view/TrackToolboxPanel.js';
import energySkatePark from '../../energySkatePark.js';

class EnergySkateParkPlaygroundScreenView extends EnergySkateParkScreenView {

  /**
   * @param {EnergySkateParkModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    options = merge( {
      controlPanelOptions: {
        showTrackButtons: false,
        visibilityControlsOptions: {
          showPieChartCheckbox: true,
          showGridCheckbox: false,
          showSpeedCheckbox: true,
          showStickToTrackCheckbox: true
        },
        gravityControlsOptions: {
          includeGravityComboBox: true
        }
      }
    }, options );

    super( model, tandem, options );

    // @private {TrackNode[]}- collection of TrackNodes added to the View
    this.trackNodes = [];

    // @protected - for layout in subtypes
    this.trackToolbox = new TrackToolboxPanel( model, this, tandem.createTandem( 'trackToolbox' ), {
      rightCenter: this.timeControlNode.leftCenter.minusXY( 15, 0 )
    } );
    this.bottomLayer.addChild( this.trackToolbox );

    model.tracks.addItemAddedListener( this.addTrackNode.bind( this ) );

    // @protected - for layout in subtypes
    this.clearButton = new EraserButton( {
      iconWidth: 30,
      baseColor: new Color( 221, 210, 32 ),
      rightCenter: this.trackToolbox.leftCenter.minusXY( 10, 0 ),
      tandem: tandem.createTandem( 'clearButton' )
    } );
    model.clearButtonEnabledProperty.linkAttribute( this.clearButton, 'enabled' );
    this.clearButton.addListener( () => { model.clearTracks(); } );
    this.addChild( this.clearButton );

    // add any other TrackNodes eagerly in case model has some initial Tracks, like when we are debugging
    model.tracks.map( this.addTrackNode.bind( this ) );

    this.timeControlNode.left = this.modelViewTransform.modelToViewX( 0.5 );
    this.trackToolbox.right = this.modelViewTransform.modelToViewX( -0.5 );
    this.clearButton.right = this.trackToolbox.left - 10;
  }

  /**
   * Add a TrackNode to this ScreenView and add listeners that will
   * handle disposal.
   * @public
   *
   * @param {Track} track
   * @returns {TrackNode}
   */
  addTrackNode( track ) {
    const trackNode = this.trackNodeGroup.createNextElement( track, this.modelViewTransform, this.availableModelBoundsProperty );
    this.trackNodes.push( trackNode );
    this.trackLayer.addChild( trackNode );

    // When track removed, remove its view
    const itemRemovedListener = removed => {
      if ( removed === track ) {
        this.trackLayer.removeChild( trackNode );

        const index = this.trackNodes.indexOf( trackNode );
        this.trackNodes.splice( index, 1 );

        // Clean up memory leak
        this.model.tracks.removeItemRemovedListener( itemRemovedListener );
        trackNode.dispose();
      }
    };
    this.model.tracks.addItemRemovedListener( itemRemovedListener );

    return trackNode;
  }
}

energySkatePark.register( 'EnergySkateParkPlaygroundScreenView', EnergySkateParkPlaygroundScreenView );
export default EnergySkateParkPlaygroundScreenView;
