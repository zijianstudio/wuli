// Copyright 2018-2021, University of Colorado Boulder

/**
 * Manages all alerts for the Faradays Law sim. Creates alert strings and sends them
 * to the UtteranceQueue to be spoken.
 *
 * As of 12/2/20, all sim-specific alerts are being disabled for a publication with only
 * alternative input because the alerts are somewhat unfinished and too frequent. Interactive
 * descriptions are not supported in this release, but we don't want to publish with
 * descriptions that we know would create an unpleasant experience. See
 * https://github.com/phetsims/faradays-law/issues/109
 */

import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import faradaysLaw from '../../faradaysLaw.js';
// import MagnetDescriber from './MagnetDescriber.js';

// the alert manager
class FaradaysLawAlertManager extends Alerter {

  constructor( node, describer ) {
    super( {
      descriptionAlertNode: node
    } );

    this.describer = describer;

    // @private {Utterance} - utterance for end of a keyboard movement, single utterance
    // gets added to the utteranceQueue to prevent too many alerts with this content
    this.keyboardMovementUtterance = new Utterance();
  }

  /**
   * @public
   */
  magnetFocusAlert() {
    //const alert = this.describer.magnetFocusAlertText;
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   */
  movementEndAlert() {
    this.keyboardMovementUtterance.alert = this.describer.magnetMovedAlertText();
    // this.alertDescriptionUtterance(  this.keyboardMovementUtterance );
  }

  /**
   * @public
   * @param {OrientationEnum} orientation
   */
  flipMagnetAlert( orientation ) {
    //const alert = this.describer.getFlipMagnetAlertText( orientation );
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   * @param speed
   * @param direction
   */
  static magnetSlidingAlert( speed, direction ) {
    //const alert = MagnetDescriber.getMagnetSlidingAlertText( speed, direction );
    // this.alertDescriptionUtterance(  alert );
  }

  /**
   * @public
   * @param showVoltmeter
   */
  static voltmeterAttachmentAlert( showVoltmeter ) {
    //const alert = MagnetDescriber.getVoltmeterAttachmentAlertText( showVoltmeter );
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   * @param showLines
   */
  static fieldLinesVisibilityAlert( showLines ) {
    //const alert = MagnetDescriber.getFieldLinesVisibilityAlertText( showLines );
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   * @param showTopCoil
   */
  static coilConnectionAlert( showTopCoil ) {
    //const alert = MagnetDescriber.getCoilConnectionAlertText( showTopCoil );
    //this.alertDescriptionUtterance( alert );
  }
}

faradaysLaw.register( 'FaradaysLawAlertManager', FaradaysLawAlertManager );
export default FaradaysLawAlertManager;