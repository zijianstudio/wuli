// Copyright 2014-2023, University of Colorado Boulder

/**
 * HeadNode for both screens.
 * This node has two layers of heads. The back layer is the full head image, and the front layer has the nose
 * cut out, and in between are the photon beams. This is because we want the photons to get cut off at a particular
 * place, and this was easiest to accomplish with layering, as opposed to shaping the end of the photon beams.
 * This is technically not necessary in single bulb mode because there is only one beam and it isn't at an angle, but
 * it still uses this node for consistency and simplicity, it just doesn't pass the beams to layer in.
 *
 * @author Aaron Davis
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image, Node } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import head_png from '../../../images/head_png.js';
import headFront_png from '../../../images/headFront_png.js';
import headIcon_png from '../../../images/headIcon_png.js';
import silhouette_png from '../../../images/silhouette_png.js';
import silhouetteFront_png from '../../../images/silhouetteFront_png.js';
import silhouetteIcon_png from '../../../images/silhouetteIcon_png.js';
import colorVision from '../../colorVision.js';
import ColorVisionConstants from '../ColorVisionConstants.js';

// constants
const BOTTOM_OFFSET = 15;
const SCALE = 0.96;
const IMAGE_SCALE = 0.6;

class HeadNode extends Node {

  /**
   * @param {Property.<string>} headModeProperty
   * @param {number} layoutBoundsBottom should be layoutBounds.bottom so the HeadNode can align relative to that
   * @param {Array.<RGBPhotonBeamNode>} photonBeams for layering properly, only used in RGBScreenView
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( headModeProperty, layoutBoundsBottom, photonBeams, tandem, options ) {

    super();

    const silhouetteOptions = { bottom: layoutBoundsBottom + BOTTOM_OFFSET, left: 78, scale: SCALE };
    const headOptions = { bottom: layoutBoundsBottom + BOTTOM_OFFSET, left: 75, scale: SCALE };

    // create nodes for each head image
    const silhouetteNode = new Image( silhouette_png, silhouetteOptions );
    const headNode = new Image( head_png, headOptions );
    const silhouetteFrontNode = new Image( silhouetteFront_png, silhouetteOptions );
    const headFrontNode = new Image( headFront_png, headOptions );

    // Make sure only one image is visible at at time, depending on the user's selection
    headModeProperty.link( mode => {
      silhouetteNode.visible = ( mode === 'brain' );
      headNode.visible = ( mode === 'no-brain' );
      silhouetteFrontNode.visible = ( mode === 'brain' );
      headFrontNode.visible = ( mode === 'no-brain' );
    } );

    // add full head images first so they show up in back
    this.addChild( silhouetteNode );
    this.addChild( headNode );

    // add the photon beams on top of the head images
    // this is only needed in the RGB screen. The single bulb screen takes care of its own layering to account for the filter
    if ( photonBeams ) {
      for ( let i = 0; i < photonBeams.length; i++ ) {
        this.addChild( photonBeams[ i ] );
      }
    }

    // add the front head image with the nose cut out so the photons get cut off at the right place (by going under these nodes)
    this.addChild( silhouetteFrontNode );
    this.addChild( headFrontNode );

    // Add head mode toggle
    const toggleButtonsContent = [ {
      value: 'no-brain',
      createNode: () => new Image( headIcon_png, { scale: IMAGE_SCALE } ),
      tandemName: 'hideBrainRadioButton'
    }, {
      value: 'brain',
      createNode: () => new Image( silhouetteIcon_png, { scale: IMAGE_SCALE } ),
      tandemName: 'showBrainRadioButton'
    } ];

    const radioButtonGroup = new RectangularRadioButtonGroup( headModeProperty, toggleButtonsContent, merge( {
      radioButtonOptions: {
        xMargin: 4,
        yMargin: 4
      },
      bottom: layoutBoundsBottom - 22,
      centerX: silhouetteNode.centerX - 42,
      tandem: tandem.createTandem( 'radioButtonGroup' )
    }, ColorVisionConstants.RADIO_BUTTON_GROUP_OPTIONS ) );
    this.addChild( radioButtonGroup );
  }
}

colorVision.register( 'HeadNode', HeadNode );

export default HeadNode;