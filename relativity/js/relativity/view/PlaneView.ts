// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import {DragListener, Image, Node} from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import plane_png from '../../../images/plane_png.js';
import Plane from "../model/Plane.js";
export default class PlaneView extends Node {
    private plane: Plane;
    public constructor(position: Vector2, modelViewTransform) {

        super({
            cursor: 'pointer'
        });

        this.plane = new Plane(position);

        this.addChild( new Image( plane_png, {
            centerX: position.x,
            centerY: position.y
        } ) );


        const scaleX = 0.2;//modelViewTransform.modelToViewDeltaX( barMagnet.size.width ) / this.width;
        const scaleY = 0.2;//modelViewTransform.modelToViewDeltaY( barMagnet.size.height ) / this.height;
        this.scale( scaleX, scaleY );

        // Move the magnet by dragging it.
        this.addInputListener(new DragListener({
            //allowTouchSnag: true, // When dragging across it on a touch device, pick it up
            positionProperty: this.plane.positionProperty,
            transform: modelViewTransform
        }));

        this.plane.positionProperty.link( position => {
            this.translation = modelViewTransform.modelToViewPosition( position );
        } );

    }

    public move(){
        //this.
    }
}

relativity.register('PlaneView', PlaneView);