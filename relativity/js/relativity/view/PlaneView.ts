// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import {DragListener, Image, Node} from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import space_shuttle from '../../../images/space_shuttle_png.js';
import Plane from "../model/Plane.js";
import Matrix3 from "../../../../dot/js/Matrix3.js";

export default class PlaneView extends Node {
    //private plane: Plane;
    private img
    public isRight=true;
    private mat=new Matrix3();

    public constructor() {
        super({
            //cursor: 'pointer'
        });
        //this.plane = new Plane();

        this.img = new Image( space_shuttle, {
            scale: 0.3,
        })
        this.addChild(this.img);
        this.img.setCenterX(0)
        this.img.setCenterY(0)

        //this.setCenterX(0)
        //this.setCenterY(0)
        // Move the magnet by dragging it.
        /*
        this.addInputListener(new DragListener({
            //allowTouchSnag: true, // When dragging across it on a touch device, pick it up
            positionProperty: this.plane.positionProperty,
            transform: modelViewTransform
        }));

        this.plane.positionProperty.link( position => {
            this.translation = modelViewTransform.modelToViewPosition( position );
        } );
        */
    }

    public flip(){
        this.scale(-1,1)
        this.isRight = !this.isRight;
    }

    public move(){
        //this.
    }
}

relativity.register('PlaneView', PlaneView);