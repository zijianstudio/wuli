// Copyright 2013-2022, University of Colorado Boulder

/**
 * The horizontal number line that shows the values
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Line, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import fractionComparison from '../../fractionComparison.js';
import FractionNode from './FractionNode.js';

class NumberLineNode extends Node {
  /**
   * @param {FractionModel} leftFractionModel
   * @param {FractionModel} rightFractionModel
   * @param {Property.<boolean>} visibleProperty
   * @param {Object} [options]
   */
  constructor( leftFractionModel, rightFractionModel, visibleProperty, options ) {
    super();

    const leftFractionProperty = leftFractionModel.fractionProperty;
    const rightFractionProperty = rightFractionModel.fractionProperty;

    const width = 300;
    const line = new Line( 0, 0, width, 0, { lineWidth: 2, stroke: 'black' } );

    this.addChild( line );

    const leftFill = '#61c9e4';
    const rightFill = '#dc528d';
    const leftRectangle = new Rectangle( 0, -20, width, 20, { fill: leftFill, lineWidth: 1, stroke: 'black' } );
    this.addChild( leftRectangle );
    const rightRectangle = new Rectangle( 0, -40, width, 20, { fill: rightFill, lineWidth: 1, stroke: 'black' } );
    this.addChild( rightRectangle );

    new DerivedProperty( [ leftFractionProperty ], leftFraction => leftFraction * width ).linkAttribute( leftRectangle, 'rectWidth' );

    new DerivedProperty( [ rightFractionProperty ], rightFraction => rightFraction * width ).linkAttribute( rightRectangle, 'rectWidth' );

    const linesNode = new Node( { pickable: false } );
    this.addChild( linesNode );

    //Create the fraction nodes, and size them to be about the same size as the 0/1 labels.  Cannot use maths to get the scaling exactly right since the font bounds are wonky, so just use a heuristic scale factor
    const fractionNodeScale = 0.22;
    const fractionTop = 14;
    const leftFractionNode = new FractionNode( leftFractionModel.numeratorProperty, leftFractionModel.denominatorProperty, {
      interactive: false,
      scale: fractionNodeScale,
      fill: leftFill,
      top: fractionTop
    } );
    this.addChild( leftFractionNode );
    const coloredTickStroke = 2;
    const leftFractionNodeTickMark = new Line( 0, 0, 0, 0, { lineWidth: coloredTickStroke, stroke: leftFill } );
    this.addChild( leftFractionNodeTickMark );

    const rightFractionNode = new FractionNode( rightFractionModel.numeratorProperty, rightFractionModel.denominatorProperty, {
      interactive: false,
      scale: fractionNodeScale,
      fill: rightFill,
      top: fractionTop
    } );
    this.addChild( rightFractionNode );
    const rightFractionNodeTickMark = new Line( 0, 0, 0, 0, { lineWidth: coloredTickStroke, stroke: rightFill } );
    this.addChild( rightFractionNodeTickMark );

    //When tick spacing or labeled ticks change, update the ticks
    //TODO: Could be redesigned so that the black ticks aren't changing when the numerators change, if it is a performance problem
    Multilink.multilink( [ visibleProperty,
        leftFractionModel.numeratorProperty,
        leftFractionModel.denominatorProperty,
        rightFractionModel.numeratorProperty,
        rightFractionModel.denominatorProperty ],
      ( visible, leftNumerator, leftDenominator, rightNumerator, rightDenominator ) => {
        const lineHeight = 16;
        const leastCommonDenominator = NumberLineNode.leastCommonDenominator( leftDenominator, rightDenominator );
        const lines = [];
        const maxTickIndex = leastCommonDenominator;
        for ( let i = 0; i <= maxTickIndex; i++ ) {
          const distance = i / maxTickIndex * width;

          if ( visible || i === 0 || i === maxTickIndex ) {
            lines.push( new Line( distance, -lineHeight / 2, distance, lineHeight / 2, {
              lineWidth: 1.5,
              stroke: 'black'
            } ) );
          }
        }
        linesNode.children = lines;

        //Update the left/right fraction nodes for the fraction value and the colored tick mark
        const leftXOffset = ( leftNumerator === 0 || leftNumerator === leftDenominator ) ? lineHeight :
                            Math.abs( leftNumerator / leftDenominator - rightNumerator / rightDenominator ) < 1E-6 ? lineHeight * 0.8 :
                            0;
        const leftCenterX = width * leftNumerator / leftDenominator - leftXOffset;
        leftFractionNode.centerX = leftCenterX;
        leftFractionNodeTickMark.setLine( leftCenterX, leftFractionNode.top, width * leftNumerator / leftDenominator, leftFractionNode.top - fractionTop );

        const rightXOffset = ( rightNumerator === 0 || rightNumerator === rightDenominator ) ? lineHeight :
                             Math.abs( rightNumerator / rightDenominator - leftNumerator / leftDenominator ) < 1E-6 ? lineHeight * 0.8 :
                             0;
        const rightCenterX = width * rightNumerator / rightDenominator + rightXOffset;
        rightFractionNode.centerX = rightCenterX;
        rightFractionNodeTickMark.setLine( rightCenterX, rightFractionNode.top, width * rightNumerator / rightDenominator, rightFractionNode.top - fractionTop );

        //Handle overlapping number labels, see https://github.com/phetsims/fraction-comparison/issues/31
        if ( leftFractionNode.bounds.intersectsBounds( rightFractionNode.bounds ) && Math.abs( rightNumerator / rightDenominator - leftNumerator / leftDenominator ) > 1E-6 ) {
          const overlapAmount = ( leftFractionModel.fraction > rightFractionModel.fraction ) ?
                                leftFractionNode.bounds.minX - rightFractionNode.bounds.maxX + 2 :
                                leftFractionNode.bounds.maxX - rightFractionNode.bounds.minX + 2;

          leftFractionNode.translate( -overlapAmount / 2 / fractionNodeScale, 0 );
          rightFractionNode.translate( +overlapAmount / 2 / fractionNodeScale, 0 );
        }
      } );

    const labelTop = linesNode.children[ 0 ].bounds.maxY;

    const zeroLabel = new Text( '0', {
      centerX: linesNode.children[ 0 ].centerX,
      top: labelTop,
      font: new PhetFont( { size: 26 } )
    } );
    const oneLabel = new Text( '1', {
      centerX: linesNode.children[ linesNode.children.length - 1 ].centerX,
      top: labelTop,
      font: new PhetFont( { size: 26 } )
    } );

    this.addChild( zeroLabel );
    this.addChild( oneLabel );

    //Only show certain properties when the number line checkbox is selected
    visibleProperty.linkAttribute( leftRectangle, 'visible' );
    visibleProperty.linkAttribute( rightRectangle, 'visible' );
    visibleProperty.linkAttribute( leftFractionNode, 'visible' );
    visibleProperty.linkAttribute( rightFractionNode, 'visible' );
    visibleProperty.linkAttribute( leftFractionNodeTickMark, 'visible' );
    visibleProperty.linkAttribute( rightFractionNodeTickMark, 'visible' );

    this.mutate( options );
  }

  /**
   * Returns the least common denominator of a and b
   * @param {number} a
   * @param {number} b
   * @returns {number}
   * @public
   */
  static leastCommonDenominator( a, b ) {
    return a * b / NumberLineNode.greatestCommonDenominator( a, b );
  }

  /**
   * Returns the greatest common denominator of a and b
   * @param {number} a
   * @param {number} b
   * @returns {number}
   * @public
   */
  static greatestCommonDenominator( a, b ) {
    assert && assert( Number.isInteger( a ) && Number.isInteger( b ) );
    return b ? NumberLineNode.greatestCommonDenominator( b, a % b ) : Math.abs( a );
  }
}

fractionComparison.register( 'NumberLineNode', NumberLineNode );

export default NumberLineNode;