// Copyright 2018-2022, University of Colorado Boulder

/**
 * The sole scene in the 'Lab' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import sphere_png from '../../../../equality-explorer/images/sphere_png.js';
import sphereShadow_png from '../../../../equality-explorer/images/sphereShadow_png.js';
import square_png from '../../../../equality-explorer/images/square_png.js';
import squareShadow_png from '../../../../equality-explorer/images/squareShadow_png.js';
import BasicsScene from '../../../../equality-explorer/js/basics/model/BasicsScene.js';
import ObjectVariable from '../../../../equality-explorer/js/common/model/ObjectVariable.js';
import triangle_png from '../../../images/triangle_png.js';
import triangleShadow_png from '../../../images/triangleShadow_png.js';
import equalityExplorerBasics from '../../equalityExplorerBasics.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class LabScene extends BasicsScene {

  public constructor( tandem: Tandem ) {

    const variablesTandem = tandem.createTandem( 'variables' );

    const variables = [

      // sphere
      new ObjectVariable( {
        image: sphere_png,
        shadow: sphereShadow_png,
        value: 1,
        tandem: variablesTandem.createTandem( 'sphere' )
      } ),

      // square
      new ObjectVariable( {
        image: square_png,
        shadow: squareShadow_png,
        value: 2,
        tandem: variablesTandem.createTandem( 'square' )
      } ),

      // triangle
      new ObjectVariable( {
        image: triangle_png,
        shadow: triangleShadow_png,
        value: 3,
        tandem: variablesTandem.createTandem( 'triangle' )
      } )
    ];

    super( variables, {
      numberOfSnapshots: 4, // fewer snapshots in this screen because we're short on vertical space
      tandem: tandem
    } );
  }
}

equalityExplorerBasics.register( 'LabScene', LabScene );