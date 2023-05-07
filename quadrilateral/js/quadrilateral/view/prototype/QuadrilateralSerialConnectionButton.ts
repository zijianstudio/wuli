// Copyright 2023, University of Colorado Boulder

/**
 * A button that will send values representing the model to a parent frame for the "p5 serial connection"
 * prototype.
 *
 * See QuadrilateralSerialMessageSender for more information about this prototype and how it works.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import TextPushButton from '../../../../../sun/js/buttons/TextPushButton.js';
import QuadrilateralColors from '../../../QuadrilateralColors.js';
import QuadrilateralConstants from '../../../QuadrilateralConstants.js';
import quadrilateral from '../../../quadrilateral.js';
import TangibleConnectionModel from '../../model/prototype/TangibleConnectionModel.js';
import QuadrilateralSerialMessageSender from './QuadrilateralSerialMessageSender.js';

export default class QuadrilateralSerialConnectionButton extends TextPushButton {
  public constructor( tangibleConnectionModel: TangibleConnectionModel ) {

    const sender = new QuadrilateralSerialMessageSender( tangibleConnectionModel );

    super( 'Send Values', {
      textNodeOptions: QuadrilateralConstants.SCREEN_TEXT_OPTIONS,
      baseColor: QuadrilateralColors.screenViewButtonColorProperty
    } );

    this.addListener( () => {
      sender.sendModelValuesString();
    } );
  }
}

quadrilateral.register( 'QuadrilateralSerialConnectionButton', QuadrilateralSerialConnectionButton );
