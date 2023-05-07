// Copyright 2014-2023, University of Colorado Boulder

/**
 * View for the 'Single Bulb' screen.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import WavelengthSlider from '../../../../scenery-phet/js/WavelengthSlider.js';
import { Image, Text } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import beamViewIcon_png from '../../../images/beamViewIcon_png.js';
import filterLeft_png from '../../../images/filterLeft_png.js';
import filterRight_png from '../../../images/filterRight_png.js';
import photonViewIcon_png from '../../../images/photonViewIcon_png.js';
import singleColorLightIcon_png from '../../../images/singleColorLightIcon_png.js';
import whiteLightIcon_png from '../../../images/whiteLightIcon_png.js';
import colorVision from '../../colorVision.js';
import ColorVisionStrings from '../../ColorVisionStrings.js';
import ColorVisionConstants from '../../common/ColorVisionConstants.js';
import ColorVisionScreenView from '../../common/view/ColorVisionScreenView.js';
import HeadNode from '../../common/view/HeadNode.js';
import SingleBulbConstants from '../SingleBulbConstants.js';
import FilterHalfEllipse from './FilterHalfEllipse.js';
import FilterWireNode from './FilterWireNode.js';
import FlashlightWireNode from './FlashlightWireNode.js';
import FlashlightWithButtonNode from './FlashlightWithButtonNode.js';
import GaussianWavelengthSlider from './GaussianWavelengthSlider.js';
import SingleBulbPhotonBeamNode from './SingleBulbPhotonBeamNode.js';
import SolidBeamNode from './SolidBeamNode.js';

const bulbSliderLabelString = ColorVisionStrings.bulbSlider.label;
const filterSliderLabelString = ColorVisionStrings.filterSlider.label;

// constants
const DISTANCE_FROM_FLASHLIGHT = 20;
const SLIDER_Y_OFFSET = 21;
const SLIDER_TRACK_WIDTH = 200;
const SLIDER_TRACK_HEIGHT = 30;
const PHOTON_BEAM_START = 320;
const ICON_OPTIONS = { scale: 0.74 }; // options common to all icon images

class SingleBulbScreenView extends ColorVisionScreenView {

  /**
   * @param {SingleBulbModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( model, tandem );

    // constant for determining the distance of the wavelengthSlider from the right side of the screen
    const wavelengthSliderDistance = this.layoutBounds.maxX - 70;

    // Create flashlight node
    const flashlightNode = new FlashlightWithButtonNode( model.flashlightOnProperty, tandem.createTandem( 'flashlightNode' ), {
      centerY: this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET + 3,
      right: this.layoutBounds.maxX - 40
    } );

    // Create upper WavelengthSlider node
    const bulbColorSlider = new WavelengthSlider( model.flashlightWavelengthProperty, {
      top: this.layoutBounds.top + 40,
      right: wavelengthSliderDistance,
      tweakersVisible: false,
      valueVisible: false,
      trackWidth: SLIDER_TRACK_WIDTH,
      trackHeight: SLIDER_TRACK_HEIGHT,
      cursorStroke: 'white',
      thumbWidth: 30,
      thumbHeight: 40,
      thumbTouchAreaYDilation: 10,
      trackBorderStroke: ColorVisionConstants.SLIDER_BORDER_STROKE,
      tandem: tandem.createTandem( 'bulbColorSlider' )
    } );

    // add text above the upper slider
    const bulbColorTextNode = new Text( bulbSliderLabelString, {
      fill: 'white',
      font: new PhetFont( 20 ),
      bottom: bulbColorSlider.top - 3,
      right: bulbColorSlider.right - 18,
      maxWidth: 0.85 * bulbColorSlider.width,
      tandem: tandem.createTandem( 'bulbColorText' )
    } );
    this.pdomControlAreaNode.addChild( bulbColorTextNode );

    // Add wire from flashlight to WavelengthSlider
    const flashlightWire = new FlashlightWireNode(
      new Vector2( flashlightNode.right - 15, flashlightNode.centerY + 2 ),
      new Vector2( bulbColorSlider.right - 25, bulbColorSlider.centerY - SLIDER_Y_OFFSET ),
      25 );

    // make bulb color slider invisible when on white light mode
    model.lightTypeProperty.link( lightType => {
      const coloredLight = lightType !== 'white';
      bulbColorSlider.visible = coloredLight;
      bulbColorTextNode.visible = coloredLight;
      flashlightWire.visible = coloredLight;
    } );

    this.pdomControlAreaNode.addChild( flashlightWire );
    this.pdomControlAreaNode.addChild( bulbColorSlider );

    // options common to all RectangularRadioButtonGroups
    const radioButtonGroupOptions = merge( {
      left: flashlightNode.left,
      radioButtonOptions: {
        xMargin: 2,
        yMargin: 2
      }
    }, ColorVisionConstants.RADIO_BUTTON_GROUP_OPTIONS );

    const whiteColoredButtonsContent = [ {
      value: 'white',
      createNode: () => new Image( whiteLightIcon_png, ICON_OPTIONS ),
      tandemName: 'whiteLightRadioButton'
    }, {
      value: 'colored',
      createNode: () => new Image( singleColorLightIcon_png, ICON_OPTIONS ),
      tandemName: 'coloredLightRadioButton'
    } ];

    const whiteColoredRadioButtonGroup = new RectangularRadioButtonGroup( model.lightTypeProperty, whiteColoredButtonsContent,
      merge( {
        bottom: flashlightNode.top - DISTANCE_FROM_FLASHLIGHT,
        tandem: tandem.createTandem( 'whiteColoredRadioButtonGroup' )
      }, radioButtonGroupOptions )
    );

    const beamPhotonButtonsContent = [ {
      value: 'beam',
      createNode: () => new Image( beamViewIcon_png, ICON_OPTIONS ),
      tandemName: 'beamRadioButton'
    }, {
      value: 'photon',
      createNode: () => new Image( photonViewIcon_png, ICON_OPTIONS ),
      tandemName: 'photonRadioButton'
    } ];

    const beamPhotonRadioButtonGroup = new RectangularRadioButtonGroup( model.beamTypeProperty, beamPhotonButtonsContent,
      merge( {
        top: flashlightNode.bottom + DISTANCE_FROM_FLASHLIGHT,
        tandem: tandem.createTandem( 'beamPhotonRadioButtonGroup' )
      }, radioButtonGroupOptions )
    );

    this.pdomControlAreaNode.addChild( whiteColoredRadioButtonGroup );
    this.pdomControlAreaNode.addChild( beamPhotonRadioButtonGroup );

    // right and left filters have the same image dimensions (while only taking up half of the image each),
    // so both can use the same option parameters and can be positioned the same and will match up perfectly
    const filterOptions = {
      centerY: this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET,
      scale: 0.7,
      right: flashlightNode.left - 100
    };

    // Add the circular filter images into the scene
    // Note: In Chrome, there is a 1px wide white line that can been seen separating the two image halves,
    // seen in both Windows and OSX. So far, it has seemed minor enough to ignore.
    const filterLeftNode = new Image( filterLeft_png, filterOptions );
    const filterRightNode = new Image( filterRight_png, filterOptions );
    model.filterVisibleProperty.linkAttribute( filterLeftNode, 'visible' );
    model.filterVisibleProperty.linkAttribute( filterRightNode, 'visible' );

    // tell the photon beam model where the filter position is
    model.photonBeam.filterOffset = filterLeftNode.centerX - PHOTON_BEAM_START;

    // Create photonBeam node
    // @private
    this.photonBeamNode = new SingleBulbPhotonBeamNode( model, tandem.createTandem( 'photonBeamNode' ), {
      canvasBounds: new Bounds2( 0, 0, SingleBulbConstants.SINGLE_BEAM_LENGTH, ColorVisionConstants.BEAM_HEIGHT ),
      x: PHOTON_BEAM_START
    } );
    this.photonBeamNode.centerY = this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET;

    // Create gaussian wavelength slider for controlling the filter color
    const gaussianSlider = new GaussianWavelengthSlider( model.filterWavelengthProperty, SLIDER_TRACK_WIDTH, SLIDER_TRACK_HEIGHT,
      tandem.createTandem( 'gaussianSlider' ), {
        bottom: this.layoutBounds.bottom - 20,
        right: wavelengthSliderDistance
      } );

    // Add the text above the gaussian wavelength slider
    const filterColorText = new Text( filterSliderLabelString, {
      fill: 'white',
      font: new PhetFont( 20 ),
      bottom: gaussianSlider.top - 3,
      right: gaussianSlider.right - 18,
      maxWidth: 0.85 * gaussianSlider.width,
      tandem: tandem.createTandem( 'filterColorText' )
    } );
    this.pdomControlAreaNode.addChild( filterColorText );

    // Add the wire from the slider to the filter
    const filterWireNode = new FilterWireNode(
      model.filterVisibleProperty,
      new Vector2( filterLeftNode.centerX, filterLeftNode.bottom ),
      new Vector2( gaussianSlider.left + 16, gaussianSlider.centerY - SLIDER_Y_OFFSET ),
      tandem.createTandem( 'filterWireNode' )
    );
    this.pdomControlAreaNode.addChild( filterWireNode );

    this.pdomControlAreaNode.addChild( gaussianSlider );

    // Left half of the filter
    const filterLeft = new FilterHalfEllipse(
      model.filterWavelengthProperty,
      model.filterVisibleProperty,
      filterLeftNode.centerX + 1,
      filterLeftNode.centerY,
      filterLeftNode.width / 2 - 13,
      filterLeftNode.height / 2 - 12,
      true
    );

    // Right half of the filter
    const filterRight = new FilterHalfEllipse(
      model.filterWavelengthProperty,
      model.filterVisibleProperty,
      filterLeftNode.centerX - 1,
      filterLeftNode.centerY,
      filterLeftNode.width / 2 - 13,
      filterLeftNode.height / 2 - 12,
      false
    );

    // bounds for the solid beam view
    const beamBounds = new Bounds2(
      filterLeft.left - 130,
      this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET + 54,
      flashlightNode.left + 15,
      this.layoutBounds.centerY + ColorVisionConstants.CENTER_Y_OFFSET - 48
    );

    const solidBeam = new SolidBeamNode( model, beamBounds, filterLeftNode.centerX );

    // Add right side of filter before the solid beam and the left side
    this.pdomControlAreaNode.addChild( filterRightNode );
    this.pdomControlAreaNode.addChild( filterRight );

    // Add the head node and solid and photon beams above the right side of the filter so they show up on top
    const headNode = new HeadNode(
      model.headModeProperty,
      this.layoutBounds.bottom,
      [ solidBeam, this.photonBeamNode ],
      tandem.createTandem( 'headNode' )
    );
    this.pdomControlAreaNode.addChild( headNode );

    // Add the left side of the filter above the beams so it appears to pass behind
    this.pdomControlAreaNode.addChild( filterLeftNode );
    this.pdomControlAreaNode.addChild( filterLeft );

    // flashlight is added after the beams so it covers up the beginning of the beam
    this.pdomControlAreaNode.addChild( flashlightNode );

    // set the tab navigation order
    this.pdomControlAreaNode.pdomOrder = [
      flashlightNode,
      bulbColorSlider,
      whiteColoredRadioButtonGroup,
      beamPhotonRadioButtonGroup,
      filterWireNode,
      gaussianSlider,
      headNode,
      this.timeControlNode,
      this.resetAllButton
    ];
  }

  // @public
  step( dt ) {
    // Cap dt, see https://github.com/phetsims/color-vision/issues/115 and https://github.com/phetsims/joist/issues/130
    dt = Math.min( dt, 0.5 );
    this.photonBeamNode.step( dt );
  }
}

colorVision.register( 'SingleBulbScreenView', SingleBulbScreenView );
export default SingleBulbScreenView;
