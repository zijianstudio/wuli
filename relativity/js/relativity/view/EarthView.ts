// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import {DragListener, Image, Node} from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import earth from '../../../images/earth_png.js';
import Matrix3 from "../../../../dot/js/Matrix3.js";

export default class EarthView extends Node {
    //private plane: Plane;
    private img
    public isRight=true;
    private mat=new Matrix3();

    public constructor() {
        super({
            //cursor: 'pointer'
        });

        this.img = new Image( earth, {
            scale: 0.3,
        })
        this.addChild(this.img);
        this.img.setCenterX(0)
        this.img.setCenterY(0)
    }

    public flip(){
        this.scale(-1,1)
        this.isRight = !this.isRight;
    }

    public move(){
        //this.
    }
}

relativity.register('EarthView', EarthView);