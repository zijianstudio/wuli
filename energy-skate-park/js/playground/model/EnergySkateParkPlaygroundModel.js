// Copyright 2018-2023, University of Colorado Boulder

/**
 * A model for Energy Skate Park that can have tracks that are draggable and attachable. Doesn't have a set of
 * premade tracks, but allows user to build them from scratch from a set of short tracks each with a few draggable
 * control points.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import EnergySkateParkModel from '../../common/model/EnergySkateParkModel.js';
import Track from '../../common/model/Track.js';
import energySkatePark from '../../energySkatePark.js';

class EnergySkateParkPlaygroundModel extends EnergySkateParkModel {

  /**
   * @param {EnergySkateParkPreferencesModel} preferencesModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( preferencesModel, tandem, options ) {
    if ( options ) {
      assert && assert( options.tracksDraggable === undefined, 'for playground models, tracks are draggable' );
      assert && assert( options.tracksConfigurable === undefined, 'for playground models, track control points can be dragged' );
    }

    options = merge( {
      tracksDraggable: true,
      tracksConfigurable: true
    }, options );

    super( preferencesModel, tandem, options );
  }

  /**
   * Create a new fully interactive Track which can be used to create custom Tracks. Generally  used when
   * user drags a new Track from  the toolbox.
   * @public
   *
   * @param {Object} [options] - options passed along to the Track
   * @returns {Track}
   */
  createDraggableTrack( options ) {
    options = merge( {

      // options passed along to ControlPoints of this Track
      controlPointOptions: null,

      // options passed along to the Track
      trackOptions: null
    }, options );

    const controlPoints = [
      this.controlPointGroup.createNextElement( -1, 0, options.controlPointOptions ),
      this.controlPointGroup.createNextElement( 0, 0, options.controlPointOptions ),
      this.controlPointGroup.createNextElement( 1, 0, options.controlPointOptions )
    ];

    return this.trackGroup.createNextElement( controlPoints, [], merge(
        {},
        Track.FULLY_INTERACTIVE_OPTIONS,
        options.trackOptions
      )
    );
  }

  /**
   * Clear all tracks from the model.
   * @public
   */
  clearTracks() {

    this.tracks.clear();
    this.trackGroup.clear();
    this.controlPointGroup.clear();

    // If the skater was on a track, then he should fall off, see #97
    if ( this.skater.trackProperty.value ) {
      this.skater.trackProperty.value = null;
    }
  }

  /**
   * Reset the model.
   * @public
   * @override
   */
  reset() {
    super.reset();
    this.clearTracks();
  }
}

energySkatePark.register( 'EnergySkateParkPlaygroundModel', EnergySkateParkPlaygroundModel );
export default EnergySkateParkPlaygroundModel;