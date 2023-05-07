// Copyright 2022-2023, University of Colorado Boulder

/**
 * In this design, tracks are mapped to a shape name and a sub-set of tracks will play at one time. Geometric
 * properties of the quadrilateral build-up in "layers" until the user has a square. As more geometric properties are
 * found, the sounds get more complex. Square is the most complex as it has the highest number of geometric property
 * requirements.
 *
 * See https://github.com/phetsims/quadrilateral/issues/175#issuecomment-1201643077 for more information about this
 * design.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import quadrilateral from '../../../quadrilateral.js';
import TracksSoundView from './TracksSoundView.js';
import quadTrackLowAscendingFourNotes_mp3 from '../../../../sounds/quadTrackLowAscendingFourNotes_mp3.js';
import quadTrackHighDescendingPingRepeats_mp3 from '../../../../sounds/quadTrackHighDescendingPingRepeats_mp3.js';
import quadTrackHighBellsFallAndRise_mp3 from '../../../../sounds/quadTrackHighBellsFallAndRise_mp3.js';
import quadTrackLowPunctualBoops_mp3 from '../../../../sounds/quadTrackLowPunctualBoops_mp3.js';
import quadTrackBackgroundRhythmSimple_mp3 from '../../../../sounds/quadTrackBackgroundRhythmSimple_mp3.js';
import quadTrackBackgroundRhythmInverted_mp3 from '../../../../sounds/quadTrackBackgroundRhythmInverted_mp3.js';
import quadTrackLowDistortedTonalRhythm_mp3 from '../../../../sounds/quadTrackLowDistortedTonalRhythm_mp3.js';
import quadTrackHighBellsShortLoop_mp3 from '../../../../sounds/quadTrackHighBellsShortLoop_mp3.js';
import QuadrilateralShapeModel from '../../model/QuadrilateralShapeModel.js';
import TReadOnlyProperty from '../../../../../axon/js/TReadOnlyProperty.js';
import NamedQuadrilateral from '../../model/NamedQuadrilateral.js';
import QuadrilateralSoundOptionsModel from '../../model/QuadrilateralSoundOptionsModel.js';
import QuadrilateralQueryParameters from '../../QuadrilateralQueryParameters.js';

// All the sounds played in this sound design.
const LAYER_TRACKS = [
  quadTrackBackgroundRhythmSimple_mp3,
  quadTrackBackgroundRhythmInverted_mp3,
  quadTrackLowAscendingFourNotes_mp3,
  quadTrackLowDistortedTonalRhythm_mp3,
  quadTrackHighDescendingPingRepeats_mp3,
  quadTrackHighBellsFallAndRise_mp3,
  quadTrackHighBellsShortLoop_mp3,
  quadTrackLowPunctualBoops_mp3
];

// Each NamedQuadrilateral is assigned zero or more of the above tracks to play. Values of the map are indices of the
// sound files in the above array that should play for each NamedQuadrilateral, according to the design in
// https://github.com/phetsims/quadrilateral/issues/175.
//
// Some teachers may prefer to include trapezoid shape properties for child shapes of the trapezoid. See
// https://github.com/phetsims/quadrilateral/issues/420
const NAMED_QUADRILATERAL_TO_TRACKS_MAP = QuadrilateralQueryParameters.inheritTrapezoidSound ?
                                          new Map( [ // design with trapezoid sound in the relevant child shapes
                                            [ NamedQuadrilateral.CONVEX_QUADRILATERAL, [ 0 ] ],
                                            [ NamedQuadrilateral.CONCAVE_QUADRILATERAL, [ 1 ] ],
                                            [ NamedQuadrilateral.TRIANGLE, [] ],
                                            [ NamedQuadrilateral.DART, [ 1, 2 ] ],
                                            [ NamedQuadrilateral.KITE, [ 0, 2 ] ],
                                            [ NamedQuadrilateral.TRAPEZOID, [ 0, 4 ] ],
                                            [ NamedQuadrilateral.ISOSCELES_TRAPEZOID, [ 0, 4, 3 ] ],
                                            [ NamedQuadrilateral.PARALLELOGRAM, [ 0, 4, 5 ] ],
                                            [ NamedQuadrilateral.RHOMBUS, [ 0, 2, 4, 5, 6 ] ],
                                            [ NamedQuadrilateral.RECTANGLE, [ 0, 3, 4, 5, 7 ] ],
                                            [ NamedQuadrilateral.SQUARE, [ 0, 2, 3, 4, 5, 6, 7 ] ]
                                          ] ) :
                                          new Map( [ // default sound design
                                            [ NamedQuadrilateral.CONVEX_QUADRILATERAL, [ 0 ] ],
                                            [ NamedQuadrilateral.CONCAVE_QUADRILATERAL, [ 1 ] ],
                                            [ NamedQuadrilateral.TRIANGLE, [] ],
                                            [ NamedQuadrilateral.DART, [ 1, 2 ] ],
                                            [ NamedQuadrilateral.KITE, [ 0, 2 ] ],
                                            [ NamedQuadrilateral.TRAPEZOID, [ 0, 4 ] ],
                                            [ NamedQuadrilateral.ISOSCELES_TRAPEZOID, [ 0, 4, 3 ] ],
                                            [ NamedQuadrilateral.PARALLELOGRAM, [ 0, 5 ] ],
                                            [ NamedQuadrilateral.RHOMBUS, [ 0, 2, 5, 6 ] ],
                                            [ NamedQuadrilateral.RECTANGLE, [ 0, 5, 7 ] ],
                                            [ NamedQuadrilateral.SQUARE, [ 0, 2, 5, 6, 7 ] ]
                                          ] );

export default class LayersTracksSoundView extends TracksSoundView {
  private readonly disposeLayersTracksSoundView: () => void;

  public constructor( shapeModel: QuadrilateralShapeModel, shapeSoundEnabledProperty: TReadOnlyProperty<boolean>, resetNotInProgressProperty: TReadOnlyProperty<boolean>, soundOptionsModel: QuadrilateralSoundOptionsModel ) {
    super( shapeModel, shapeSoundEnabledProperty, resetNotInProgressProperty, soundOptionsModel, LAYER_TRACKS );

    // desired output levels for each sound (as requested by design, after manually editing the gain)
    // See https://github.com/phetsims/quadrilateral/issues/175#issuecomment-1339626942
    this.indexToOutputLevelMap.set( 0, 0.6 );
    this.indexToOutputLevelMap.set( 1, 0.6 );
    this.indexToOutputLevelMap.set( 2, 1 );
    this.indexToOutputLevelMap.set( 3, 0.75 );
    this.indexToOutputLevelMap.set( 4, 0.55 );
    this.indexToOutputLevelMap.set( 5, 1 );
    this.indexToOutputLevelMap.set( 6, 0.45 );
    this.indexToOutputLevelMap.set( 7, 0.70 );

    const shapeNameListener = ( shapeName: NamedQuadrilateral ) => {

      // First set all output levels back to 0 before we start playing new sounds
      this.soundClips.forEach( soundClip => {
        soundClip.setOutputLevel( 0 );
      } );

      const soundIndicesToPlay = NAMED_QUADRILATERAL_TO_TRACKS_MAP.get( shapeName );
      assert && assert( soundIndicesToPlay, 'NamedQuadrilateral does not have a LayersTracksSoundView design' );
      soundIndicesToPlay!.forEach( index => {
        this.soundClips[ index ].setOutputLevel( this.indexToOutputLevelMap.get( index )! );
      } );
    };
    shapeModel.shapeNameProperty.link( shapeNameListener );

    this.disposeLayersTracksSoundView = () => shapeModel.shapeNameProperty.unlink( shapeNameListener );
  }

  public override dispose(): void {
    this.disposeLayersTracksSoundView();
    super.dispose();
  }
}

quadrilateral.register( 'LayersTracksSoundView', LayersTracksSoundView );