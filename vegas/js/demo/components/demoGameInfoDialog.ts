// Copyright 2022, University of Colorado Boulder

/**
 * Demo for GameInfoDialog
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import InfoButton from '../../../../scenery-phet/js/buttons/InfoButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import GameInfoDialog from '../../GameInfoDialog.js';

export default function demoGameInfoDialog( layoutBounds: Bounds2 ): Node {

  const levelDescriptions = [
    'Description of level 1',
    'Description of level 2',
    'Description of level 3',
    'Description of level 4'
  ];

  const dialog = new GameInfoDialog( levelDescriptions, {
    title: new Text( 'Your Title', {
      font: new PhetFont( { size: 30, weight: 'bold' } )
    } ),
    ySpacing: 20
  } );

  return new InfoButton( {
    listener: () => dialog.show(),
    center: layoutBounds.center
  } );
}