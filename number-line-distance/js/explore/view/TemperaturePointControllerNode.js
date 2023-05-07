// Copyright 2020-2022, University of Colorado Boulder

/**
 * A point controller that is a thermometer for use in the temperature scene
 *
 * @author Saurabh Totey
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PointControllerNode from '../../../../number-line-common/js/common/view/PointControllerNode.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ThermometerNode from '../../../../scenery-phet/js/ThermometerNode.js';
import { Color, Node, Text } from '../../../../scenery/js/imports.js';
import numberLineDistance from '../../numberLineDistance.js';
import TemperatureSceneModel from '../model/TemperatureSceneModel.js';

// constants
const DEFAULT_TEMPERATURE_VALUE = 0;
const TOUCH_DILATION = 5;
const MOUSE_DILATION = 1;

class TemperaturePointControllerNode extends PointControllerNode {

  /**
   * @param {TemperaturePointController} pointController
   * @param {string} label
   * @param {Object} [options]
   * @public
   */
  constructor( pointController, label, options ) {

    // create a node that composites the thermometer and triangle (TemperatureAndColorSensorNode) with the label
    const compositeThermometerNode = new Node();

    options = merge( {
      node: compositeThermometerNode,
      connectorLine: false,
      thermometerFluidHighlightColor: new Color( 0, 210, 0 )
    }, options );

    // a Property that reflects the value of the point controller: is needed for the ThermometerNode
    const valueProperty = new DerivedProperty( [ pointController.positionProperty ], position => {
      if ( pointController.isControllingNumberLinePoint() && pointController.playAreaBounds.containsPoint( position ) ) {
        return pointController.numberLinePoints.get( 0 ).valueProperty.value;
      }
      return DEFAULT_TEMPERATURE_VALUE;
    } );

    const thermometerNode = new ThermometerNode( valueProperty, TemperatureSceneModel.TEMPERATURE_RANGE.min, TemperatureSceneModel.TEMPERATURE_RANGE.max, {
      bulbDiameter: 30,
      tubeWidth: 18,
      lineWidth: 2,
      fluidMainColor: pointController.color,
      fluidHighlightColor: options.thermometerFluidHighlightColor,
      backgroundFill: 'rgba( 255, 255, 255, 0.9 )',
      majorTickLength: 0,
      minorTickLength: 0
    } );
    compositeThermometerNode.addChild( thermometerNode );

    // Add the textual label for this thermometer.
    // offset and maxWidth multiplier empirically determined
    const thermometerLabel = new Text( label, {
      font: new PhetFont( 16 ),
      centerX: thermometerNode.centerX,
      top: thermometerNode.top + 4,
      maxWidth: thermometerNode.width * 0.25
    } );
    compositeThermometerNode.addChild( thermometerLabel );

    // dilate the touch and mouse areas for easier grabbing
    compositeThermometerNode.touchArea = thermometerNode.bounds.dilated( TOUCH_DILATION );
    compositeThermometerNode.mouseArea = thermometerNode.bounds.dilated( MOUSE_DILATION );

    super( pointController, options );
  }
}

numberLineDistance.register( 'TemperaturePointControllerNode', TemperaturePointControllerNode );
export default TemperaturePointControllerNode;
