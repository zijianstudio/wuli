// Copyright 2013-2023, University of Colorado Boulder

/**
 * Radio button group for choosing one of the tracks, used in a "Track Set" screen of EnergySkatePark. This changes
 * the "scene" of the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignGroup, Node } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import EnergySkateParkTrackSetModel from '../model/EnergySkateParkTrackSetModel.js';
import PremadeTracks from '../model/PremadeTracks.js';
import BackgroundNode from './BackgroundNode.js';
import EnergySkateParkColorScheme from './EnergySkateParkColorScheme.js';
import TrackNode from './TrackNode.js';

class SceneSelectionRadioButtonGroup extends RectangularRadioButtonGroup {

  /**
   * Construct a SceneSelectionRadioButtonGroup.  Pass the entire model since it is used to create TrackNode
   *
   * @param {EnergySkateParkModel} model the main model for the entire screen
   * @param {EnergySkateParkScreenView} view the main view for the entire screen
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, view, tandem, options ) {
    assert && assert( model.sceneProperty !== undefined, 'model does not support a scene' );

    options = merge( {

      // specific and passed to RectangularRadioButtonGroup
      orientation: 'horizontal',
      radioButtonOptions: {
        xMargin: EnergySkateParkConstants.RADIO_BUTTON_CONTENT_MARGIN,
        yMargin: EnergySkateParkConstants.RADIO_BUTTON_CONTENT_MARGIN,
        cornerRadius: EnergySkateParkConstants.RADIO_BUTTON_CORNER_RADIUS,
        baseColor: EnergySkateParkColorScheme.radioButtonBaseColor,
        buttonAppearanceStrategyOptions: {
          selectedStroke: EnergySkateParkColorScheme.radioButtonSelectedStroke
        }
      },
      tandem: tandem,

      // {boolean} - should mountains, background, and sky be included in the icon for track buttons?
      includeBackground: false
    }, options );

    // produces spacing of ~5 when there are 4 premade tracks which is the usual case and looks nice, and provides
    // more spacing if there are fewer tracks
    assert && assert( options.spacing === undefined, 'SceneSelectionRadioButtonGroup sets spacing from number of premade tracks' );
    options.spacing = 20 / model.tracks.length;

    // Create a track to be used specifically for an icon - must be one of the premade tracks defined in
    // PremadeTracks.TrackType. These Tracks are a bit different from the actual tracks used in the model
    // because their sizing and dimensions need to be different to look better as icons for radio buttons
    const createIconTrack = trackType => {

      // all tracks have the same width and height so they take up the same dimensions in a radio button, so one
      // doesn't get scaled down more than another and look more thin
      const controlPointOptions = {
        trackWidth: 6,
        trackHeight: 6
      };

      let track = null;
      if ( trackType === PremadeTracks.TrackType.PARABOLA ) {
        const parabolaControlPoints = PremadeTracks.createParabolaControlPoints( model, merge( {
          trackMidHeight: 1
        }, controlPointOptions ) );
        track = EnergySkateParkTrackSetModel.createPremadeTrack( model, parabolaControlPoints, {
          tandem: tandem.createTandem( 'parabolaTrackIcon' )
        } );
      }
      else if ( trackType === PremadeTracks.TrackType.SLOPE ) {
        const slopeControlPoints = PremadeTracks.createSlopeControlPoints( model, controlPointOptions );
        track = EnergySkateParkTrackSetModel.createPremadeTrack( model, slopeControlPoints, {
          tandem: tandem.createTandem( 'slopeTrackIcon' )
        } );
      }
      else if ( trackType === PremadeTracks.TrackType.DOUBLE_WELL ) {
        const doubleWellControlPoints = PremadeTracks.createDoubleWellControlPoints( model, controlPointOptions );
        track = EnergySkateParkTrackSetModel.createPremadeTrack( model, doubleWellControlPoints, {
          tandem: tandem.createTandem( 'doubleWellTrackIcon' )
        } );
      }
      else if ( trackType === PremadeTracks.TrackType.LOOP ) {
        const loopControlPoints = PremadeTracks.createLoopControlPoints( model, merge( {
          innerLoopWidth: 2.5,
          innerLoopTop: 3.5
        }, controlPointOptions ) );
        track = EnergySkateParkTrackSetModel.createPremadeTrack( model, loopControlPoints, {
          tandem: tandem.createTandem( 'loopTrackIcon' )
        } );
      }
      else {
        throw new Error( `unsupported TrackType: ${trackType}` );
      }

      return track;
    };

    // Create a button with a scene like the track in the index
    const createNode = index => {
      const children = [];

      if ( options.includeBackground ) {
        const background = new BackgroundNode( view.layoutBounds, tandem.createTandem( `backgroundNode${index}` ) );
        background.layout( new Bounds2( 0, 0, view.layoutBounds.width, view.layoutBounds.height ), 1 );
        children.push( background );
      }

      const track = createIconTrack( model.trackTypes[ index ] );
      const trackNode = new TrackNode( track, view.modelViewTransform, new Property(), tandem.createTandem( `trackNode${index}` ), {
        isIcon: true
      } );

      // use a rasterized version of the node so that the icon doesn't change with the model for configurable tracks
      const iconNode = trackNode.rasterized();
      children.push( iconNode );

      // Fixes: Cursor turns into a hand over the track in the track selection panel, see #204
      iconNode.pickable = false;

      return new Node( {
        tandem: tandem.createTandem( `contentNode${index}` ),
        children: children
      } );
    };

    // create the contents for the radio buttons
    const contents = [];
    _.forEach( model.tracks, ( track, i ) => {
      const contentNode = createNode( i );
      contents.push( contentNode );
    } );

    const minWidth = _.minBy( contents, node => node.width ).width;

    const buttonAlignGroup = new AlignGroup();

    const radioButtonContent = [];
    _.forEach( contents, ( node, i ) => {

      // scalar chosen so that buttons are appropriately sized in the control panel
      const contentScale = ( 27 / minWidth );

      // if there isn't a background, scale the tracks so that they are all the same width
      if ( !options.includeBackground ) {
        node.setScaleMagnitude( contentScale * ( minWidth / node.width ) );
      }
      else {
        node.scale( contentScale );
      }

      // place in an align group and add margins so that the buttons are always square
      const alignedNode = buttonAlignGroup.createBox( node );
      const margin = Math.abs( alignedNode.width - alignedNode.height ) / 2;
      if ( margin !== 0 ) {
        const setterFunction = alignedNode.height < alignedNode.width ? alignedNode.setYMargin : alignedNode.setXMargin;
        setterFunction.call( alignedNode, margin );
      }

      radioButtonContent.push( {
        value: i,
        createNode: () => alignedNode,
        tandemName: `scene${i + 1}RadioButton`
      } );
    } );

    super( model.sceneProperty, radioButtonContent, options );
  }
}

energySkatePark.register( 'SceneSelectionRadioButtonGroup', SceneSelectionRadioButtonGroup );
export default SceneSelectionRadioButtonGroup;