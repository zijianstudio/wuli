// Copyright 2018-2022, University of Colorado Boulder

/**
 * Displays a number line.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Multilink from '../../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Utils from '../../../../../dot/js/Utils.js';
import { Shape } from '../../../../../kite/js/imports.js';
import merge from '../../../../../phet-core/js/merge.js';
import ArrowNode from '../../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Circle, DragListener, Line, Node, Path, Text } from '../../../../../scenery/js/imports.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import fractionsCommon from '../../../fractionsCommon.js';
import NumberLineOrientation from '../NumberLineOrientation.js';

class NumberLineNode extends Node {
  /**
   * @param {NumberProperty} numeratorProperty
   * @param {NumberProperty} denominatorProperty
   * @param {NumberProperty} containerCountProperty
   * @param {Object} [options]
   */
  constructor( numeratorProperty, denominatorProperty, containerCountProperty, options ) {
    assert && assert( numeratorProperty.range );
    assert && assert( denominatorProperty.range );
    assert && assert( containerCountProperty.range );

    options = merge( {
      // {NumberLineOrientation}
      orientation: NumberLineOrientation.HORIZONTAL,

      // {boolean} - If true, an arrow will be shown next to the current value.
      showArrow: false,

      // {boolean} - If true, dragging will be able to modify the numerator.
      interactive: false,

      // {Property.<number>}
      multiplierProperty: new NumberProperty( 1 ),

      // {number} - How many view units should a single unit (0 to 1) take up?
      unitSize: 130,

      // {number}
      majorTickLength: 80,
      minorTickLength: 40,
      evenMajorLineWidth: 3,
      oddMajorLineWidth: 3,
      minorTickLineWidth: 2,
      axisLineWidth: 3,
      markerRadius: 12,
      markerLineWidth: 3,
      arrowLength: 22,
      highlightLineWidth: 8,
      highlightExtension: 8,

      // {ColorDef}
      markerFill: FractionsCommonColors.introCircleFillProperty,
      arrowFill: FractionsCommonColors.introCircleFillProperty,

      // NOTE: Should we add an isUserControlledProperty so we can properly handle lock-out with other
      // controls? AP noted that multitouch handling was not a priority based on current deadlines.

      // {PhetFont}
      tickLabelFont: new PhetFont( 40 )
    }, options );

    super();

    // @private {Property.<number>}
    this.numeratorProperty = numeratorProperty;
    this.denominatorProperty = denominatorProperty;
    this.containerCountProperty = containerCountProperty;
    this.multiplierProperty = options.multiplierProperty;

    const majorTickNodes = _.range( 0, containerCountProperty.range.max + 1 ).map( n => {
      return new Node( {
        x: n * options.unitSize,
        children: [
          new Line( 0, -options.majorTickLength / 2, 0, options.majorTickLength / 2, {
            stroke: 'black',
            lineWidth: n % 2 === 0 ? options.evenMajorLineWidth : options.oddMajorLineWidth
          } ),
          new Text( n, {
            rotation: options.orientation === NumberLineOrientation.HORIZONTAL ? 0 : Math.PI / 2,
            centerX: 0,
            top: options.majorTickLength / 2 + 4,
            font: options.tickLabelFont
          } )
        ]
      } );
    } );

    const axisNode = new Line( {
      stroke: 'black',
      lineWidth: options.axisLineWidth
    } );

    const minorTicksNode = new Path( null, {
      stroke: 'black'
    } );

    const multipliedTicksNode = new Path( null, {
      stroke: 'black'
    } );

    const markerNode = new Circle( options.markerRadius, {
      fill: options.markerFill,
      stroke: 'black',
      lineWidth: options.markerLineWidth
    } );

    const arrowNode = new ArrowNode( 0, -options.arrowLength, 0, 0, {
      fill: options.arrowFill,
      stroke: 'black',
      headWidth: 9,
      tailWidth: 4
    } );
    if ( options.showArrow ) {
      markerNode.addChild( arrowNode );
    }

    const highlightNode = new Line( {
      stroke: FractionsCommonColors.introNumberLineHighlightProperty,
      lineWidth: options.highlightLineWidth
    } );

    const hitTargetNode = new Node( {
      cursor: 'pointer'
    } );
    if ( options.interactive ) {
      const setApproximateValue = n => {
        const idealNumerator = Utils.roundSymmetric( n * denominatorProperty.value );
        const restrictedNumerator = Math.min( idealNumerator, denominatorProperty.value * containerCountProperty.value );
        numeratorProperty.value = numeratorProperty.range.constrainValue( restrictedNumerator );
      };

      // @private {DragListener}
      this.dragListener = new DragListener( {
        applyOffset: false,
        start( event, listener ) {
          setApproximateValue( listener.parentPoint.x / options.unitSize );
        },
        drag( event, listener ) {
          setApproximateValue( listener.parentPoint.x / options.unitSize );
        }
      } );
      hitTargetNode.addInputListener( this.dragListener );
    }

    // @private {function}
    this.containerCountListener = containerCount => {
      const width = containerCount * options.unitSize;
      majorTickNodes.forEach( ( node, index ) => {
        node.visible = index <= containerCount;
      } );
      axisNode.x2 = width;

      const hitBounds = new Bounds2( 0, -options.majorTickLength / 2, width, options.majorTickLength / 2 );
      hitTargetNode.mouseArea = hitBounds.dilated( 5 );
      hitTargetNode.touchArea = hitBounds.dilated( 10 );
    };
    this.containerCountProperty.link( this.containerCountListener );

    // @private {Multilink}
    this.minorTickMultilink = Multilink.multilink( [
      denominatorProperty,
      containerCountProperty
    ], ( denominator, containerCount ) => {
      const shape = new Shape();

      for ( let i = 0; i <= containerCount * denominator; i++ ) {
        // Don't draw over major ticks
        if ( i % denominator === 0 ) {
          continue;
        }

        const x = i * options.unitSize / denominator;
        shape.moveTo( x, -options.minorTickLength / 2 ).lineTo( x, 0 );
      }

      minorTicksNode.shape = shape;
    } );

    // @private {Multilink}
    this.multipliedTickMultilink = Multilink.multilink( [
      denominatorProperty,
      containerCountProperty,
      options.multiplierProperty
    ], ( denominator, containerCount, multiplier ) => {
      const shape = new Shape();
      const effectiveDenominator = denominator * multiplier;

      for ( let i = 0; i <= containerCount * effectiveDenominator; i++ ) {
        // Don't draw over major ticks
        if ( i % effectiveDenominator === 0 ) {
          continue;
        }

        const x = i * options.unitSize / effectiveDenominator;
        shape.moveTo( x, 0 ).lineTo( x, options.minorTickLength / 2 );
      }

      multipliedTicksNode.shape = shape;
    } );

    // @private {Multilink}
    this.markerMultilink = Multilink.multilink( [
      numeratorProperty,
      denominatorProperty
    ], ( numerator, denominator ) => {
      const x = options.unitSize * numerator / denominator;
      const useMajorTick = numerator % denominator === 0;
      const tickY = ( useMajorTick ? options.majorTickLength : options.minorTickLength ) / 2;
      markerNode.x = x;
      arrowNode.y = -tickY - 4;
      highlightNode.x1 = x;
      highlightNode.x2 = x;
      highlightNode.y1 = -tickY - options.highlightExtension;
      highlightNode.y2 = tickY + options.highlightExtension;
    } );

    this.children = [
      highlightNode,
      axisNode,
      minorTicksNode,
      multipliedTicksNode,
      ...majorTickNodes,
      markerNode,
      hitTargetNode
    ];

    // @public {Vector2} - The local-bounds position of the true "left" for layout purposes (so we can ignore the
    // arrow when aligning)
    this.localLayoutPoint = majorTickNodes[ 0 ].leftTop;

    if ( options.orientation === NumberLineOrientation.VERTICAL ) {
      this.rotation = -Math.PI / 2;
      this.y = containerCountProperty.range.max * options.unitSize / 2;
    }
    else {
      this.x = -containerCountProperty.range.max * options.unitSize / 2;
    }

    this.mutate( options );
  }

  /**
   * Releases references.
   * @public
   * @override
   */
  dispose() {
    this.containerCountProperty.unlink( this.containerCountListener );
    this.minorTickMultilink.dispose();
    this.multipliedTickMultilink.dispose();
    this.markerMultilink.dispose();
    this.dragListener && this.dragListener.dispose();

    super.dispose();
  }
}

fractionsCommon.register( 'NumberLineNode', NumberLineNode );
export default NumberLineNode;
