// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import {Color, DragListener, Image, Line, Node, Text} from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import ArrowNode from "../../../../scenery-phet/js/ArrowNode.js";
import MathSymbolFont from "../../../../scenery-phet/js/MathSymbolFont.js";
import LineArrowNode from "../../../../scenery-phet/js/LineArrowNode.js";
export default class XAxisView extends Node {

    /**
     * @param {Graph} graph
     * @param {Bounds2} graphViewBounds
     */
    constructor(xlabel:string, ylabel:string, xMin:number, xMax:number, yMin:number, yMax:number, unit=100) {
        const arrowX = new ArrowNode(
            xMin*unit-40, 0, xMax*unit+40, 0,
            {
                tailWidth: 1.5,
                headWidth: 10,
                headHeight: 10,
                //fill: Color.BLACK,
                stroke: null
            }
        );
        const arrowY = new ArrowNode(
            0, yMin*unit, 0, -yMax*unit,
            {
                tailWidth: 1.5,
                headWidth: 10,
                headHeight: 10,
                //fill: Color.BLACK,
                stroke: null
            }
        );

        const majorLine:Node[]=[]
        const minorLine:Node[]=[]
        for(let i = xMin; i<=xMax; i++ ){
            majorLine.push(new Line(i*unit, -unit/8, i*unit,unit/8, {
                stroke: "black", lineWidth: 1,
            }));
            if(i<xMax){
                for(let j = 1; j<=4; j++ ) {
                    minorLine.push(new Line((i+j/5)*unit, -unit/16, (i+j/5)*unit,unit/16, {
                        stroke: "rgb( 160, 160, 160 )", lineWidth: 0.8,
                    }));
                }
            }
        }
        const xLabel = new Text( xlabel, {
            font: new MathSymbolFont( 24 ),
            //maxWidth: 22,
            //fontSize: 20,
            left: arrowX.right + 6,
            centerY: arrowX.centerY
        } );

        const yLabel = new Text( ylabel, {
            font: new MathSymbolFont( 24 ),
            //maxWidth: 22,
            //fontSize: 20,
            right: arrowY.left,
            centerY: arrowY.top
        } );
        super({
            children:  [ arrowX, arrowY, xLabel, yLabel ].concat(majorLine).concat(minorLine)
        });
    }
}

relativity.register('XAxisView', XAxisView);