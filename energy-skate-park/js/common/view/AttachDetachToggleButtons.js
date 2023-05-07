// Copyright 2014-2023, University of Colorado Boulder

/**
 * Scenery node for the Attach/Detach toggle buttons which determine whether the skater can fly off the track or not.
 * This was formerly called "roller coaster mode"
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Panel from '../../../../sun/js/Panel.js';
import attach_png from '../../../images/attach_png.js';
import detach_png from '../../../images/detach_png.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';

// constants
const SELECTED_LINE_WIDTH = 2.3;

class AttachDetachToggleButtons extends Panel {

  /**
   * Constructor for the AttachDetachToggleButtons
   * @param {Property.<Boolean>} stickingToTrackProperty Axon property that is false if the model state allows the skater to detach
   * @param {Property.<Boolean>} enabledProperty Axon property that is true if the control is enabled
   * @param {number} contentWidth Width for the control panel, to match the layout of the rest of the controls.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( stickingToTrackProperty, enabledProperty, contentWidth, tandem, options ) {

    // Match the style of the EnergySkateParkControlPanel
    options = merge( {
      xMargin: 15,
      yMargin: 5
    }, EnergySkateParkConstants.PANEL_OPTIONS, options );

    // This is sort of hack to pass through the tandem of the radioButtonGroupMember to its child.
    const attachRadioButtonTandemName = 'attachRadioButton';
    const detachRadioButtonTandemName = 'detachRadioButton';
    const radioButtonGroupTandem = tandem.createTandem( 'radioButtonGroup' );

    // @param {image} image - data for an Image Node
    // @param {string} tandemName
    const createButtonContent = ( image, tandemName ) => {
      return new Image( image, {
        scale: 0.4,
        tandem: radioButtonGroupTandem.createTandem( attachRadioButtonTandemName ).createTandem( tandemName )
      } );
    };

    const buttonContent0 = createButtonContent( attach_png, 'attachIcon' );

    const radioButtonsContent = [
      {
        value: true,
        createNode: () => buttonContent0,
        tandemName: attachRadioButtonTandemName
      },
      {
        value: false,
        createNode: () => createButtonContent( detach_png, 'detachIcon' ),
        tandemName: detachRadioButtonTandemName
      }
    ];

    const buttonSpacing = contentWidth - ( options.xMargin * 2 ) - ( buttonContent0.width * 2 ) - SELECTED_LINE_WIDTH * 2;
    assert && assert( buttonSpacing > 0, 'buttons must have non zero spacing' );

    const radioButtonGroup = new RectangularRadioButtonGroup( stickingToTrackProperty, radioButtonsContent, {
      orientation: 'horizontal',
      spacing: buttonSpacing,
      radioButtonOptions: {
        xMargin: 0,
        yMargin: 0,
        baseColor: 'white',
        cornerRadius: 6,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: SELECTED_LINE_WIDTH,
          selectedStroke: '#3291b8',
          deselectedStroke: 'gray'
        }
      },
      tandem: radioButtonGroupTandem
    } );

    const panelOptions = merge( { tandem: tandem }, options );
    super( radioButtonGroup, panelOptions );
  }
}

energySkatePark.register( 'AttachDetachToggleButtons', AttachDetachToggleButtons );
export default AttachDetachToggleButtons;