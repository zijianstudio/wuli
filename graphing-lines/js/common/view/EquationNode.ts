// Copyright 2013-2023, University of Colorado Boulder

/**
 * EquationNode is the base class for all equations.
 * Dimensions and layout offsets are computed as percentages of the font's point size.
 * These multipliers were determined empirically by committee - modify at your peril!
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { Node, NodeOptions } from '../../../../scenery/js/imports.js';
import graphingLines from '../../graphingLines.js';
import SlopePicker from './picker/SlopePicker.js';
import optionize from '../../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PickOptional from '../../../../phet-core/js/types/PickOptional.js';

type SelfOptions = {
  fontSize?: number;
};

export type EquationNodeOptions = SelfOptions & PickOptional<NodeOptions, 'maxWidth'>;

export default class EquationNode extends Node {

  public readonly decimalPlaces = 0;

  // Controls the vertical offset of the slope's sign.
  // Zero is vertically centered on the equals sign, positive values move it down, negative move it up.
  // This was created because there was a great deal of discussion about where the sign should be placed.
  protected readonly slopeSignYOffset = 0;

  // Fudge factors for horizontal lines, to vertically center them with equals sign (set by visual inspection).
  // Note that these are currently all zero, and that looks good in JavaScript.
  // In Java, they were a function of fontSize.
  // We're keeping this feature in case future 'tweaks' are needed.
  protected readonly slopeSignYFudgeFactor = 0;
  protected readonly operatorYFudgeFactor = 0;
  protected readonly fractionLineYFudgeFactor = 0;
  protected readonly undefinedSlopeYFudgeFactor = 0;
  protected readonly equalsSignFudgeFactor = 0;

  // thickness of the fraction divisor line
  protected readonly fractionLineThickness: number;

  // size of the lines used to create + and - operators
  protected readonly operatorLineSize: Dimension2;

  // size of the lines used to create + and - signs
  protected readonly signLineSize: Dimension2;

  // spacing between components of an equation
  protected readonly integerSignXSpacing: number; // spacing between a sign and the integer to the right of it
  protected readonly fractionSignXSpacing: number; // spacing between a sign and the fraction to the right of it
  protected readonly integerSlopeXSpacing: number; // spacing between a fractional slope and what's to the right of it
  protected readonly fractionalSlopeXSpacing: number; // spacing between an integer slope and what's to the right of it
  protected readonly operatorXSpacing: number; // space around an operator (eg, +)
  protected readonly relationalOperatorXSpacing: number; // space around the relational operator (eg, =)
  protected readonly parenXSpacing: number; // space between a parenthesis and the thing it encloses
  protected readonly pickersYSpacing: number; // y spacing between spinners and fraction line
  protected readonly slopeYSpacing: number; // y spacing between rise and run values (with blue backgrounds) and fraction line
  protected readonly ySpacing: number; // all other y spacing

  protected constructor( providedOptions?: EquationNodeOptions ) {

    const options = optionize<EquationNodeOptions, SelfOptions, NodeOptions>()( {

      // SelfOptions
      fontSize: 18
    }, providedOptions );

    super();

    const fontSize = options.fontSize;

    // Multipliers were chosen empirically.
    this.fractionLineThickness = 0.06 * fontSize;
    this.operatorLineSize = new Dimension2( 0.54 * fontSize, 0.07 * fontSize );
    this.signLineSize = new Dimension2( 0.54 * fontSize, 0.11 * fontSize );
    this.integerSignXSpacing = 0.18 * fontSize;
    this.fractionSignXSpacing = 0.36 * fontSize;
    this.integerSlopeXSpacing = 0.04 * fontSize;
    this.fractionalSlopeXSpacing = 0.15 * fontSize;
    this.operatorXSpacing = 0.25 * fontSize;
    this.relationalOperatorXSpacing = 0.35 * fontSize;
    this.parenXSpacing = 0.07 * fontSize;
    this.pickersYSpacing = 0.2 * fontSize;
    this.slopeYSpacing = 0.4 * fontSize;
    this.ySpacing = 0.1 * fontSize;

    this.mutate( options );
  }

  /**
   * Gets the max width for the rise and run pickers used in an interactive equation.
   */
  public static computeMaxSlopePickerWidth( riseRangeProperty: TReadOnlyProperty<Range>,
                                            runRangeProperty: TReadOnlyProperty<Range>,
                                            font: PhetFont,
                                            decimalPlaces: number ): number {

    const pickerOptions = {
      font: font,
      decimalPlaces: decimalPlaces
    };

    // Create prototypical pickers.
    const maxRiseNode = new SlopePicker( new Property( riseRangeProperty.value.max ),
      new Property( runRangeProperty.value.max ), riseRangeProperty, pickerOptions );

    const minRiseNode = new SlopePicker( new Property( riseRangeProperty.value.min ),
      new Property( runRangeProperty.value.max ), riseRangeProperty, pickerOptions );

    const maxRunNode = new SlopePicker(
      new Property( runRangeProperty.value.max ),
      new Property( riseRangeProperty.value.max ), runRangeProperty, pickerOptions );

    const minRunNode = new SlopePicker( new Property( runRangeProperty.value.min ),
      new Property( riseRangeProperty.value.min ), runRangeProperty, pickerOptions );

    // Compute the max width
    const maxRiseWidth = Math.max( maxRiseNode.width, minRiseNode.width );
    const maxRunWidth = Math.max( maxRunNode.width, minRunNode.width );
    return Math.max( maxRiseWidth, maxRunWidth );
  }
}

graphingLines.register( 'EquationNode', EquationNode );