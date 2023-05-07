// Copyright 2019-2022, University of Colorado Boulder

/**
 * base class for all scenes in the "Explore" screen
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Range from '../../../../dot/js/Range.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import merge from '../../../../phet-core/js/merge.js';
import NLIConstants from '../../common/NLIConstants.js';
import numberLineIntegers from '../../numberLineIntegers.js';

// constants
const SCENE_BOUNDS = NLIConstants.NLI_LAYOUT_BOUNDS; // bounds for the scenes match the layout bounds

class SceneModel {

  /**
   * @param [Object] options
   * @public
   */
  constructor( options ) {

    options = merge( {

      // {number} - the number of number lines to be created and managed in this model
      numberOfNumberLines: 1,

      // {Object|null} - number line options that are common to all number lines created in this constructor
      commonNumberLineOptions: {
        initialDisplayedRange: new Range( -100, 100 ),
        initialPointSpecs: []
      },

      // {Vector[]} - zero positions for each of the number lines, length must match number of number lines
      numberLineZeroPositions: [ SCENE_BOUNDS.center ],

      // {null|Object[]} - options that are unique to the individual number lines being created, null if not needed
      uniqueNumberLineOptionsList: null

    }, options );

    // options checking
    assert && assert( options.numberOfNumberLines === options.numberLineZeroPositions.length );
    assert && assert( !options.uniqueNumberLineOptionsList ||
                      options.uniqueNumberLineOptionsList.length === options.numberOfNumberLines );

    // @public - whether or not the number lines are visible
    this.showNumberLineProperty = new BooleanProperty( true );

    // @public (read-only) {NumberLine[]} - the number line(s) for this scene
    this.numberLines = [];
    _.times( options.numberOfNumberLines, count => {
      this.numberLines.push( new SpatializedNumberLine(
        options.numberLineZeroPositions[ count ],
        merge(
          {},
          options.commonNumberLineOptions,
          options.uniqueNumberLineOptionsList ? options.uniqueNumberLineOptionsList[ count ] : {}
        )
      ) );
    } );

    // @public - controls whether the labels on the number lines are visible
    this.numberLineLabelsVisibleProperty = new BooleanProperty( true );
    this.numberLineLabelsVisibleProperty.link( visible => {
      this.numberLines.forEach( nl => { nl.showPointLabelsProperty.set( visible ); } );
    } );

    // @public - controls whether the absolute value indicators on the number lines are visible
    this.numberLineAbsoluteValueIndicatorsVisibleProperty = new BooleanProperty( false );
    this.numberLineAbsoluteValueIndicatorsVisibleProperty.link( visible => {
      this.numberLines.forEach( nl => { nl.showAbsoluteValuesProperty.set( visible ); } );
    } );
  }

  /**
   * @public
   */
  reset() {
    this.resetScene();
    this.showNumberLineProperty.reset();
    this.numberLineLabelsVisibleProperty.reset();
    this.numberLineAbsoluteValueIndicatorsVisibleProperty.reset();
  }

  /**
   * Do scene-specific reset.
   * @protected
   */
  resetScene() {
    // Override as needed in descendant classes.
  }
}

numberLineIntegers.register( 'SceneModel', SceneModel );
export default SceneModel;