// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import {DragListener, Image, Node, NodeOptions} from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import lorentz from '../../../images/lorentz.js';
import Matrix3 from "../../../../dot/js/Matrix3.js";

export default class LorentzView extends Node {
    //private plane: Plane;
    public constructor(option:NodeOptions | undefined = undefined) {
        if(option){
            option.children = [new Image( lorentz, {
                scale: 0.3,
            })]
        }

        //this.img.setCenterX(0)
        //this.img.setCenterY(0)
        super( option );
    }
}

relativity.register('LorentzView', LorentzView);