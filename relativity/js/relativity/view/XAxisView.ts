// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import {Color, DragListener, Image, Node, Text} from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import ArrowNode from "../../../../scenery-phet/js/ArrowNode.js";
import MathSymbolFont from "../../../../scenery-phet/js/MathSymbolFont.js";
export default class XAxisView extends Node {

    /**
     * @param {Graph} graph
     * @param {Bounds2} graphViewBounds
     */
    constructor(text, tailX, tailY, topX, topY) {
        const arrowNode = new ArrowNode(
            tailX, tailY,topX,topY,
            {
                tailWidth: 1.5,
                headWidth: 10,
                headHeight: 10,
                fill: Color.BLACK,
                stroke: null
            }
        );

        const axisLabel = new Text( text, {
            font: new MathSymbolFont( 28 ),
            //maxWidth: 22,
            left: arrowNode.right + 6,
            centerY: arrowNode.centerY
        } );

        super({
            children: [ arrowNode, axisLabel ]
        });
    }
}

relativity.register('XAxisView', XAxisView);