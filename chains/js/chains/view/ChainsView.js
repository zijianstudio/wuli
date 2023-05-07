// Copyright 2015-2022, University of Colorado Boulder

/**
 * View for the 'Chains' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import { RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import chains from '../../chains.js';
import ChainsStrings from '../../ChainsStrings.js';

// constants
const FONT = new PhetFont( 36 );

class ChainsView extends ScreenView {

  /**
   * @param {*} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    const sizeStringProperty = new DerivedProperty(
      [ ChainsStrings.patternStringStringProperty, ChainsStrings.sizeStringProperty, SceneryPhetStrings.units_nmStringProperty ],
      ( pattern, sizeString, unitsString ) => StringUtils.format( pattern, sizeString, 8, unitsString )
    );

    this.addChild( new VBox( {
      align: 'left',
      spacing: 25,
      children: [
        new Text( ChainsStrings.plainStringStringProperty, {
          font: FONT,
          fill: 'green',
          tandem: tandem.createTandem( 'plainStringText' )
        } ),
        new RichText( ChainsStrings.multilineStringStringProperty, {
          font: FONT,
          align: 'left',
          tandem: tandem.createTandem( 'multiLineStringText' )
        } ),
        new RichText( ChainsStrings.htmlStringStringProperty, {
          font: FONT,
          tandem: tandem.createTandem( 'htmlStringText' )
        } ),
        new Text( sizeStringProperty, {
          font: FONT,
          tandem: tandem.createTandem( 'patternStringText' )
        } ),
        new Text( new PatternStringProperty( ChainsStrings.namedPlaceholdersStringStringProperty, {
          name: 'Alice',
          speed: '100'
        } ), {
          font: FONT,
          fill: '#990000',
          tandem: tandem.createTandem( 'namedPlaceholdersStringText' )
        } )
      ],
      center: this.layoutBounds.center
    } ) );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }
}

chains.register( 'ChainsView', ChainsView );
export default ChainsView;