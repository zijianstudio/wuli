// Copyright 2013-2023, University of Colorado Boulder

/**
 * Renderer for point-slope equations, with optional interactivity of point and slope.
 * General point-slope form is: (y - y1) = m(x - x1)
 *
 * Point and/or slope may be interactive.
 * Pickers are used to increment/decrement parts of the equation that are specified as being interactive.
 * Non-interactive parts of the equation are expressed in a form that is typical of how the equation
 * would normally be written. For example, if the slope is -1, then only the sign is written, not '-1'.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty, { NumberPropertyOptions } from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import MinusNode, { MinusNodeOptions } from '../../../../scenery-phet/js/MinusNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusNode, { PlusNodeOptions } from '../../../../scenery-phet/js/PlusNode.js';
import { Color, Line as SceneryLine, Node, RichText, Text } from '../../../../scenery/js/imports.js';
import NumberPicker, { NumberPickerOptions } from '../../../../sun/js/NumberPicker.js';
import GLColors from '../../common/GLColors.js';
import GLConstants from '../../common/GLConstants.js';
import GLSymbols from '../../common/GLSymbols.js';
import Line from '../../common/model/Line.js';
import DynamicValueNode, { DynamicValueNodeOptions } from '../../common/view/DynamicValueNode.js';
import EquationNode, { EquationNodeOptions } from '../../common/view/EquationNode.js';
import SlopePicker from '../../common/view/picker/SlopePicker.js';
import UndefinedSlopeIndicator from '../../common/view/UndefinedSlopeIndicator.js';
import graphingLines from '../../graphingLines.js';
import GraphingLinesStrings from '../../GraphingLinesStrings.js';
import { CreateDynamicLabelOptions } from '../../common/view/LineNode.js';

type SelfOptions = {

  // Whether to show 'slope undefined' after non-interactive equations with undefined slope, for example
  // 'x = 3' versus 'x = 3 (slope undefined)'.
  // See https://github.com/phetsims/graphing-slope-intercept/issues/7
  slopeUndefinedVisible?: boolean;

  // components that can be interactive
  interactivePoint?: boolean;
  interactiveSlope?: boolean;

  // dynamic range of components
  x1RangeProperty?: Property<Range>;
  y1RangeProperty?: Property<Range>;
  riseRangeProperty?: Property<Range>;
  runRangeProperty?: Property<Range>;

  staticColor?: Color | string;
};

type PointSlopeEquationNodeOptions = SelfOptions & EquationNodeOptions;

export default class PointSlopeEquationNode extends EquationNode {

  private readonly disposePointSlopeEquationNode: () => void;

  public constructor( lineProperty: Property<Line>, providedOptions?: PointSlopeEquationNodeOptions ) {

    const options = optionize<PointSlopeEquationNodeOptions, SelfOptions, EquationNodeOptions>()( {

      // Whether to show 'slope undefined' after non-interactive equations with undefined slope, for example
      // 'x = 3' versus 'x = 3 (slope undefined)'.
      // See https://github.com/phetsims/graphing-slope-intercept/issues/7
      slopeUndefinedVisible: true,

      // components that can be interactive
      interactivePoint: true,
      interactiveSlope: true,

      // dynamic range of components
      x1RangeProperty: new Property( GLConstants.X_AXIS_RANGE ),
      y1RangeProperty: new Property( GLConstants.Y_AXIS_RANGE ),
      riseRangeProperty: new Property( GLConstants.Y_AXIS_RANGE ),
      runRangeProperty: new Property( GLConstants.X_AXIS_RANGE ),

      // style
      fontSize: GLConstants.INTERACTIVE_EQUATION_FONT_SIZE,
      staticColor: 'black'

    }, providedOptions );

    super( options ); // call first, because super computes various layout metrics

    const fullyInteractive = ( options.interactivePoint && options.interactiveSlope );
    const interactiveFont = new PhetFont( { size: options.fontSize, weight: GLConstants.EQUATION_FONT_WEIGHT } );
    const staticFont = new PhetFont( { size: options.fontSize, weight: GLConstants.EQUATION_FONT_WEIGHT } );
    const staticOptions = { font: staticFont, fill: options.staticColor };
    const fractionLineOptions = { stroke: options.staticColor, lineWidth: this.fractionLineThickness };

    const numberPropertyOptions: NumberPropertyOptions = {
      numberType: 'Integer'
    };

    // internal properties that are connected to pickers
    const x1Property = new NumberProperty( lineProperty.value.x1, numberPropertyOptions );
    const y1Property = new NumberProperty( lineProperty.value.y1, numberPropertyOptions );
    const riseProperty = new NumberProperty( lineProperty.value.rise, numberPropertyOptions );
    const runProperty = new NumberProperty( lineProperty.value.run, numberPropertyOptions );

    /*
     * Flag that allows us to update all controls atomically when the model changes.
     * When a picker's value changes, it results in the creation of a new Line.
     * So if you don't change the pickers atomically to match a new Line instance,
     * the new Line will be inadvertently replaced with an incorrect line.
     */
    let updatingControls = false;

    // Determine the max width of the rise and run pickers.
    const maxSlopePickerWidth = EquationNode.computeMaxSlopePickerWidth( options.riseRangeProperty,
      options.runRangeProperty, interactiveFont, this.decimalPlaces );

    // Nodes that appear in all possible forms of the equation: (y-y1) = rise/run (x-x1)
    const yLeftParenNode = new Text( '(', staticOptions );
    const yNode = new RichText( GLSymbols.y, staticOptions );
    const yPlusNode = new PlusNode( combineOptions<PlusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    const yMinusNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    let y1Node: NumberPicker | DynamicValueNode;
    if ( options.interactivePoint ) {
      y1Node = new NumberPicker( y1Property, options.y1RangeProperty,
        combineOptions<NumberPickerOptions>( {}, GLConstants.NUMBER_PICKER_OPTIONS, {
          color: GLColors.POINT_X1_Y1,
          font: interactiveFont
        } ) );
    }
    else {
      y1Node = new DynamicValueNode( y1Property, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
    }
    const yRightParenNode = new Text( ')', staticOptions );
    const y1MinusSignNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.signLineSize }, staticOptions ) ); // for y=-y1 case
    const equalsNode = new Text( '=', staticOptions );
    const slopeMinusSignNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.signLineSize }, staticOptions ) );
    let riseNode: SlopePicker | DynamicValueNode;
    let runNode: SlopePicker | DynamicValueNode;
    if ( options.interactiveSlope ) {
      riseNode = new SlopePicker( riseProperty, runProperty, options.riseRangeProperty, { font: interactiveFont } );
      runNode = new SlopePicker( runProperty, riseProperty, options.runRangeProperty, { font: interactiveFont } );
    }
    else {
      riseNode = new DynamicValueNode( riseProperty, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
      runNode = new DynamicValueNode( runProperty, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
    }
    const fractionLineNode = new SceneryLine( 0, 0, maxSlopePickerWidth, 0, fractionLineOptions );
    const xLeftParenNode = new Text( '(', staticOptions );
    const xNode = new RichText( GLSymbols.x, staticOptions );
    const xPlusNode = new PlusNode( combineOptions<PlusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    const xMinusNode = new MinusNode( combineOptions<MinusNodeOptions>( { size: this.operatorLineSize }, staticOptions ) );
    let x1Node: NumberPicker | DynamicValueNode;
    if ( options.interactivePoint ) {
      x1Node = new NumberPicker( x1Property, options.x1RangeProperty,
        combineOptions<NumberPickerOptions>( {}, GLConstants.NUMBER_PICKER_OPTIONS, {
          color: GLColors.POINT_X1_Y1,
          font: interactiveFont
        } ) );
    }
    else {
      x1Node = new DynamicValueNode( x1Property, combineOptions<DynamicValueNodeOptions>( { absoluteValue: true }, staticOptions ) );
    }
    const xRightParenNode = new Text( ')', staticOptions );
    const slopeUndefinedNode = new RichText( '?', staticOptions );

    // add all nodes, we'll set which ones are visible bases on desired simplification
    this.children = [
      yLeftParenNode, yNode, yPlusNode, yMinusNode, y1Node, yRightParenNode, y1MinusSignNode, equalsNode,
      slopeMinusSignNode, riseNode, runNode, fractionLineNode, xLeftParenNode, xNode, xPlusNode, xMinusNode, x1Node, xRightParenNode,
      slopeUndefinedNode
    ];

    /*
     * Updates the layout to match the desired form of the equation.
     * This is based on which parts of the equation are interactive, and what the
     * non-interactive parts of the equation should look like when written in simplified form.
     */
    const updateLayout = ( line: Line ) => {

      const interactive = options.interactivePoint || options.interactiveSlope;
      const lineColor = line.color;

      // Start with all children invisible and at x=0.
      // See https://github.com/phetsims/graphing-lines/issues/120
      const len = this.children.length;
      for ( let i = 0; i < len; i++ ) {
        this.children[ i ].visible = false;
        this.children[ i ].x = 0;
      }
      slopeUndefinedNode.string = ''; // workaround for #114 and #117

      if ( line.undefinedSlope() && !interactive ) {
        // slope is undefined and nothing is interactive
        slopeUndefinedNode.visible = true;
        slopeUndefinedNode.fill = lineColor;
        slopeUndefinedNode.string = ( options.slopeUndefinedVisible ) ?
                                    StringUtils.format( GraphingLinesStrings.slopeUndefined, GLSymbols.x, line.x1 ) :
                                    StringUtils.fillIn( `{{x}} ${MathSymbols.EQUAL_TO} {{value}}`, {
                                      x: GLSymbols.x,
                                      value: line.x1
                                    } );
        return;
      }
      else if ( !interactive && line.same( Line.Y_EQUALS_X_LINE ) ) {
        // use slope-intercept form for y=x
        yNode.visible = equalsNode.visible = xNode.visible = true;
        yNode.fill = equalsNode.fill = xNode.fill = lineColor;
        equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
        xNode.left = equalsNode.right + this.relationalOperatorXSpacing;
        return;
      }
      else if ( !interactive && line.same( Line.Y_EQUALS_NEGATIVE_X_LINE ) ) {
        // use slope-intercept form for y=-x
        yNode.visible = equalsNode.visible = slopeMinusSignNode.visible = xNode.visible = true;
        yNode.fill = equalsNode.fill = slopeMinusSignNode.fill = xNode.fill = lineColor;
        equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
        slopeMinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
        slopeMinusSignNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
        xNode.left = slopeMinusSignNode.right + this.integerSignXSpacing;
        return;
      }

      // Select the operators based on the signs of x1 and y1.
      const xOperatorNode = ( options.interactivePoint || line.x1 >= 0 ) ? xMinusNode : xPlusNode;
      const yOperatorNode = ( options.interactivePoint || line.y1 >= 0 ) ? yMinusNode : yPlusNode;

      if ( line.rise === 0 && !options.interactiveSlope && !options.interactivePoint ) {
        // y1 is on the right side of the equation
        yNode.visible = equalsNode.visible = y1Node.visible = true;
        yNode.fill = equalsNode.fill = lineColor;
        if ( y1Node instanceof DynamicValueNode ) {
          y1Node.fill = lineColor;
        }
        equalsNode.left = yNode.right + this.relationalOperatorXSpacing;
        if ( options.interactivePoint || line.y1 >= 0 ) {
          // y = y1
          y1Node.left = equalsNode.right + this.relationalOperatorXSpacing;
          y1Node.y = yNode.y;
        }
        else {
          // y = -y1
          y1MinusSignNode.visible = true;
          y1MinusSignNode.fill = lineColor;
          y1MinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          y1MinusSignNode.centerY = equalsNode.centerY + this.operatorYFudgeFactor;
          y1Node.left = y1MinusSignNode.right + this.integerSignXSpacing;
          y1Node.y = yNode.y;
        }
      }
      else {  // y1 is on the left side of the equation

        let previousNode;

        if ( !options.interactivePoint && line.y1 === 0 ) {
          // y
          yNode.x = 0;
          yNode.y = 0;
          yNode.fill = lineColor;
          yNode.visible = true;
          previousNode = yNode;
        }
        else if ( !interactive ) {
          // y - y1
          yNode.visible = yOperatorNode.visible = y1Node.visible = true;
          yNode.fill = yOperatorNode.fill = lineColor;
          if ( y1Node instanceof DynamicValueNode ) {
            y1Node.fill = lineColor;
          }
          yNode.x = 0;
          yNode.y = 0;
          yOperatorNode.left = yNode.right + this.operatorXSpacing;
          yOperatorNode.centerY = yNode.centerY + this.operatorYFudgeFactor;
          y1Node.left = yOperatorNode.right + this.operatorXSpacing;
          y1Node.centerY = yNode.centerY;
          previousNode = y1Node;
        }
        else {
          // (y - y1)
          yLeftParenNode.visible = yNode.visible = yOperatorNode.visible = y1Node.visible = yRightParenNode.visible = true;
          yLeftParenNode.fill = yNode.fill = yOperatorNode.fill = yRightParenNode.fill = lineColor;
          if ( y1Node instanceof DynamicValueNode ) {
            y1Node.fill = lineColor;
          }
          yLeftParenNode.x = 0;
          yLeftParenNode.y = 0;
          yNode.left = yLeftParenNode.right + this.parenXSpacing;
          yNode.y = yLeftParenNode.y;
          yOperatorNode.left = yNode.right + this.operatorXSpacing;
          yOperatorNode.centerY = yNode.centerY + this.operatorYFudgeFactor;
          y1Node.left = yOperatorNode.right + this.operatorXSpacing;
          y1Node.centerY = yNode.centerY;
          yRightParenNode.left = y1Node.right + this.parenXSpacing;
          yRightParenNode.y = yNode.y;
          previousNode = yRightParenNode;
        }

        // =
        equalsNode.visible = true;
        equalsNode.fill = lineColor;
        equalsNode.left = previousNode.right + this.relationalOperatorXSpacing;
        equalsNode.y = yNode.y + this.equalsSignFudgeFactor;

        // slope
        let previousXOffset;
        if ( options.interactiveSlope ) {
          // (rise/run), where rise and run are pickers, and the sign is integrated into the pickers
          riseNode.visible = runNode.visible = fractionLineNode.visible = true;
          if ( riseNode instanceof DynamicValueNode ) {
            riseNode.fill = lineColor;
          }
          if ( runNode instanceof DynamicValueNode ) {
            runNode.fill = lineColor;
          }
          fractionLineNode.fill = lineColor;
          fractionLineNode.left = equalsNode.right + this.relationalOperatorXSpacing;
          fractionLineNode.centerY = equalsNode.centerY;
          riseNode.centerX = fractionLineNode.centerX;
          riseNode.bottom = fractionLineNode.top - this.pickersYSpacing;
          runNode.centerX = fractionLineNode.centerX;
          runNode.top = fractionLineNode.bottom + this.pickersYSpacing;
          previousNode = fractionLineNode;
          previousXOffset = this.fractionalSlopeXSpacing;
        }
        else {
          // slope is not interactive, so here we put it in the desired form

          // slope properties, used to determine correct form
          const slope = line.getSlope();
          const zeroSlope = ( slope === 0 );
          const unitySlope = ( Math.abs( slope ) === 1 );
          const integerSlope = Number.isInteger( slope );
          const positiveSlope = ( slope > 0 );
          const fractionalSlope = ( !zeroSlope && !unitySlope && !integerSlope );

          // adjust fraction line width, use max width of rise or run
          const lineWidth = Math.max( riseNode.width, runNode.width );
          fractionLineNode.setLine( 0, 0, lineWidth, 0 );

          // decide whether to include the slope minus sign
          if ( positiveSlope || zeroSlope ) {
            // no sign
            previousNode = equalsNode;
            previousXOffset = this.relationalOperatorXSpacing;
          }
          else {
            // -
            slopeMinusSignNode.visible = true;
            slopeMinusSignNode.fill = lineColor;
            slopeMinusSignNode.left = equalsNode.right + this.relationalOperatorXSpacing;
            slopeMinusSignNode.centerY = equalsNode.centerY + this.slopeSignYFudgeFactor + this.slopeSignYOffset;
            previousNode = slopeMinusSignNode;
            previousXOffset = ( fractionalSlope ? this.fractionSignXSpacing : this.integerSignXSpacing );
          }

          if ( line.undefinedSlope() || fractionalSlope ) {
            // rise/run
            riseNode.visible = runNode.visible = fractionLineNode.visible = true;
            if ( riseNode instanceof DynamicValueNode ) {
              riseNode.fill = lineColor;
            }
            if ( runNode instanceof DynamicValueNode ) {
              runNode.fill = lineColor;
            }
            fractionLineNode.stroke = lineColor;
            fractionLineNode.left = previousNode.right + previousXOffset;
            fractionLineNode.centerY = equalsNode.centerY;
            riseNode.centerX = fractionLineNode.centerX;
            riseNode.bottom = fractionLineNode.top - this.ySpacing;
            runNode.centerX = fractionLineNode.centerX;
            runNode.top = fractionLineNode.bottom + this.ySpacing;
            previousNode = fractionLineNode;
            previousXOffset = this.fractionalSlopeXSpacing;
          }
          else if ( zeroSlope ) {
            // 0
            riseNode.visible = true;
            if ( riseNode instanceof DynamicValueNode ) {
              riseNode.fill = lineColor;
            }
            riseNode.left = equalsNode.right + this.relationalOperatorXSpacing;
            riseNode.y = yNode.y;
            previousNode = riseNode;
            previousXOffset = this.integerSlopeXSpacing;
          }
          else if ( unitySlope ) {
            // no slope term
            previousXOffset = this.relationalOperatorXSpacing;
          }
          else if ( integerSlope ) {
            // N
            riseNode.visible = true;
            if ( riseNode instanceof DynamicValueNode ) {
              riseNode.fill = lineColor;
            }
            riseNode.left = previousNode.right + previousXOffset;
            riseNode.y = yNode.y;
            previousNode = riseNode;
            previousXOffset = this.integerSlopeXSpacing;
          }
          else {
            throw new Error( 'programming error, forgot to handle some slope case' );
          }
        }

        // x term
        if ( interactive || ( line.x1 !== 0 && line.getSlope() !== 0 && line.getSlope() !== 1 ) ) {
          // (x - x1)
          xLeftParenNode.visible = xNode.visible = xOperatorNode.visible = x1Node.visible = xRightParenNode.visible = true;
          xLeftParenNode.fill = xNode.fill = xOperatorNode.fill = xRightParenNode.fill = lineColor;
          if ( x1Node instanceof DynamicValueNode ) {
            x1Node.fill = lineColor;
          }
          xLeftParenNode.left = previousNode.right + previousXOffset;
          xLeftParenNode.y = yNode.y;
          xNode.left = xLeftParenNode.right + this.parenXSpacing;
          xNode.y = yNode.y;
          xOperatorNode.left = xNode.right + this.operatorXSpacing;
          xOperatorNode.centerY = xNode.centerY + this.operatorYFudgeFactor;
          x1Node.left = xOperatorNode.right + this.operatorXSpacing;
          x1Node.centerY = yNode.centerY;
          xRightParenNode.left = x1Node.right + this.parenXSpacing;
          xRightParenNode.y = yNode.y;
        }
        else if ( line.getSlope() === 1 && line.x1 !== 0 ) {
          // x - x1
          xNode.visible = xOperatorNode.visible = x1Node.visible = true;
          xNode.fill = xOperatorNode.fill = lineColor;
          if ( x1Node instanceof DynamicValueNode ) {
            x1Node.fill = lineColor;
          }
          xNode.left = previousNode.right + previousXOffset;
          xNode.y = yNode.y;
          xOperatorNode.left = xNode.right + this.operatorXSpacing;
          xOperatorNode.centerY = xNode.centerY + this.operatorYFudgeFactor;
          x1Node.left = xOperatorNode.right + this.operatorXSpacing;
          x1Node.centerY = yNode.centerY;
        }
        else if ( line.x1 === 0 ) {
          // x
          xNode.visible = true;
          xNode.fill = lineColor;
          xNode.left = previousNode.right + previousXOffset;
          xNode.centerY = yNode.centerY;
        }
        else {
          throw new Error( 'programming error, forgot to handle some x-term case' );
        }
      }
    };

    // sync the model with the controls, unmultilink in dispose
    const controlsMultilink = Multilink.lazyMultilink( [ x1Property, y1Property, riseProperty, runProperty ],
      () => {
        if ( !updatingControls ) {
          lineProperty.value = Line.createPointSlope( x1Property.value, y1Property.value,
            riseProperty.value, runProperty.value, lineProperty.value.color );
        }
      }
    );

    // sync the controls and layout with the model
    const lineObserver = ( line: Line ) => {

      // Synchronize the controls atomically.
      updatingControls = true;
      {
        x1Property.value = line.x1;
        y1Property.value = line.y1;
        riseProperty.value = options.interactiveSlope ? line.rise : line.getSimplifiedRise();
        runProperty.value = options.interactiveSlope ? line.run : line.getSimplifiedRun();
      }
      updatingControls = false;

      // Fully-interactive equations have a constant form, no need to update layout when line changes.
      if ( !fullyInteractive ) { updateLayout( line ); }
    };
    lineProperty.link( lineObserver ); // unlink in dispose

    // For fully-interactive equations ...
    let undefinedSlopeUpdater: ( line: Line ) => void;
    if ( fullyInteractive ) {

      // update layout once
      updateLayout( lineProperty.value );

      // add undefinedSlopeIndicator
      const undefinedSlopeIndicator = new UndefinedSlopeIndicator( this.width, this.height );
      this.addChild( undefinedSlopeIndicator );
      undefinedSlopeIndicator.centerX = this.centerX;
      undefinedSlopeIndicator.centerY = fractionLineNode.centerY - this.undefinedSlopeYFudgeFactor;

      undefinedSlopeUpdater = ( line: Line ) => {
        undefinedSlopeIndicator.visible = line.undefinedSlope();
      };
      lineProperty.link( undefinedSlopeUpdater ); // unlink in dispose
    }

    this.mutate( options );

    this.disposePointSlopeEquationNode = () => {
      x1Node.dispose();
      y1Node.dispose();
      riseNode.dispose();
      runNode.dispose();
      Multilink.unmultilink( controlsMultilink );
      lineProperty.unlink( lineObserver );
      undefinedSlopeUpdater && lineProperty.unlink( undefinedSlopeUpdater );
    };
  }

  public override dispose(): void {
    this.disposePointSlopeEquationNode();
    super.dispose();
  }

  /**
   * Creates a node that displays the general form of this equation: (y - y1) = m(x - x1)
   */
  public static createGeneralFormNode(): Node {

    // (y - y1) = m(x - x1)
    const string = StringUtils.fillIn(
      `({{y}} ${MathSymbols.MINUS} {{y}}<sub>1</sub>) ${MathSymbols.EQUAL_TO} {{m}}({{x}} ${MathSymbols.MINUS} {{x}}<sub>1</sub>)`, {
        y: GLSymbols.y,
        m: GLSymbols.m,
        x: GLSymbols.x
      } );

    return new RichText( string, {
      pickable: false,
      font: new PhetFont( { size: 20, weight: GLConstants.EQUATION_FONT_WEIGHT } ),
      maxWidth: 300
    } );
  }

  /**
   * Creates a non-interactive equation, used to label a dynamic line.
   */
  public static createDynamicLabel( lineProperty: Property<Line>, providedOptions?: CreateDynamicLabelOptions ): Node {

    const options = combineOptions<CreateDynamicLabelOptions>( {
      pickable: false,
      interactivePoint: false,
      interactiveSlope: false,
      fontSize: 18,
      maxWidth: 200
    }, providedOptions );

    return new PointSlopeEquationNode( lineProperty, options );
  }
}

graphingLines.register( 'PointSlopeEquationNode', PointSlopeEquationNode );