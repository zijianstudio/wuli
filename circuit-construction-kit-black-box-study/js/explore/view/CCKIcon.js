// Copyright 2017-2023, University of Colorado Boulder

/**
 * Home screen/navigation bar icon that shows common circuit elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import battery_png from '../../../../circuit-construction-kit-common/images/battery_png.js';
import CCKCConstants from '../../../../circuit-construction-kit-common/js/CCKCConstants.js';
import CCKCColors from '../../../../circuit-construction-kit-common/js/view/CCKCColors.js';
import Resistor from '../../../../circuit-construction-kit-common/js/model/Resistor.js';
import Vertex from '../../../../circuit-construction-kit-common/js/model/Vertex.js';
import Wire from '../../../../circuit-construction-kit-common/js/model/Wire.js';
import CustomLightBulbNode from '../../../../circuit-construction-kit-common/js/view/CustomLightBulbNode.js';
import ResistorNode from '../../../../circuit-construction-kit-common/js/view/ResistorNode.js';
import WireNode from '../../../../circuit-construction-kit-common/js/view/WireNode.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Screen from '../../../../joist/js/Screen.js';
import merge from '../../../../phet-core/js/merge.js';
import { HBox, Image, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';

// constants
const BACKGROUND_COLOR = CCKCColors.screenBackgroundColorProperty;
const ELEMENT_WIDTH = 50;

class CCKIcon extends Rectangle {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    super( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: BACKGROUND_COLOR
    } );

    const viewProperty = new Property( 'lifelike' );

    const wire = new Wire( new Vertex( new Vector2( 0, 0 ) ), new Vertex( new Vector2( 100, 0 ) ), new Property( 0 ), tandem.createTandem( 'wire' ) );
    const wireNode = new WireNode( null, null, wire, null, viewProperty, tandem.createTandem( 'wireIcon' ) );

    // Model element used to create the node
    const resistor = new Resistor( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( CCKCConstants.RESISTOR_LENGTH, 0 ) ), tandem.createTandem( 'resistor' ) );

    const resistorNode = new ResistorNode( null, null, resistor, null, viewProperty, tandem.createTandem( 'resistorIcon' ), {
      icon: true
    } );

    const batteryNode = new Image( battery_png );

    const lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ) );

    // icons should not be discoverable by assistive technology, and should not be focusable
    const a11yIconOptions = {
      tagName: null,
      focusable: false
    };

    resistorNode.mutate( merge( a11yIconOptions, { scale: ELEMENT_WIDTH / resistorNode.width * 0.75 } ) );
    wireNode.mutate( merge( a11yIconOptions, { scale: ELEMENT_WIDTH / wireNode.width * 0.7 } ) );
    batteryNode.mutate( merge( a11yIconOptions, { scale: ELEMENT_WIDTH / batteryNode.width } ) );
    lightBulbNode.mutate( merge( a11yIconOptions, { scale: ELEMENT_WIDTH / lightBulbNode.width / 2 } ) );
    const vBox = new VBox( {
      spacing: 20,
      children: [ new HBox( { spacing: 20, children: [ wireNode, resistorNode ] } ), new HBox( {
        spacing: 20,
        children: [ batteryNode, lightBulbNode ]
      } ) ]
    } );
    vBox.mutate( {
      scale: this.height / vBox.height * 0.8,
      center: this.center
    } );
    this.addChild( vBox );
  }
}

circuitConstructionKitBlackBoxStudy.register( 'CCKIcon', CCKIcon );
export default CCKIcon;