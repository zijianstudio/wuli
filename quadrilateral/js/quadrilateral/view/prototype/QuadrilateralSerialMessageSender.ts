// Copyright 2023, University of Colorado Boulder

/**
 * A class that will send a representation of the model to a parent iframe that will eventually send values
 * to a tangible device over serial connection.
 *
 * This prototype was quickly thrown together based on a Medium tutorial at
 * https://medium.com/@yyyyyyyuan/tutorial-serial-communication-with-arduino-and-p5-js-cd39b3ac10ce
 *
 * Basically it works by
 * 1) The sim runs in an iframe in a parent p5.js wrapper.
 * 2) A button in the sim sends values representing the shape of the quadrilateral to parent window with `postMessage`.
 * 2) The wrapper uses p5 modules to send values to another app, which forwards to an arduino over serial communication.
 * 3) The arduino receives the values and begins to actuate to physically reproduce the quadrilateral shape.
 *
 * Exploration happened in https://github.com/phetsims/quadrilateral/issues/341.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Utils from '../../../../../dot/js/Utils.js';
import quadrilateral from '../../../quadrilateral.js';
import QuadrilateralShapeModel from '../../model/QuadrilateralShapeModel.js';
import TangibleConnectionModel from '../../model/prototype/TangibleConnectionModel.js';

export default class QuadrilateralSerialMessageSender {
  private readonly shapeModel: QuadrilateralShapeModel;

  public constructor( tangibleConnectionModel: TangibleConnectionModel ) {
    this.shapeModel = tangibleConnectionModel.shapeModel;
  }

  /**
   * Sends a message to a parent window (p5.js wrapper) with model values. The p5.js wrapper forwards
   * the data to an actuated device with a serial connection.
   *
   * '(topLength,rightLength,bottomLength,leftLength,topLeftAngle,bottomRightAngle)'
   *
   * The device then parses this string and sets values accordingly.
   */
  public sendModelValuesString(): void {
    const topLength = this.formatValue( this.shapeModel.sideAB.lengthProperty.value );
    const rightLength = this.formatValue( this.shapeModel.sideBC.lengthProperty.value );
    const bottomLength = this.formatValue( this.shapeModel.sideCD.lengthProperty.value );
    const leftLength = this.formatValue( this.shapeModel.sideDA.lengthProperty.value );

    const topLeftAngle = this.formatValue( this.shapeModel.vertexA.angleProperty.value! );
    const bottomRightAngle = this.formatValue( this.shapeModel.vertexC.angleProperty.value! );

    const valuesString = `(${topLength},${rightLength},${bottomLength},${leftLength},${topLeftAngle},${bottomRightAngle})`;

    const parent = window.parent;
    parent.postMessage( valuesString, '*' );
  }

  /**
   * Limits a model value to two decimal places to send a smaller string to the wrapper (and eventually to
   * the actuated tangible device). I don't know if this is necessary, but it seems reasonable.
   */
  private formatValue( value: number ): number {
    return Utils.toFixedNumber( value, 2 );
  }
}

quadrilateral.register( 'QuadrilateralSerialMessageSender', QuadrilateralSerialMessageSender );
