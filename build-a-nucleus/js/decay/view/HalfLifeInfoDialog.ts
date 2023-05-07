// Copyright 2022, University of Colorado Boulder

/**
 * HalfLifeInfoDialog shows an expanded timeline of the half-life's of the nuclide's built with meaningful points in
 * time pointed out with arrows to give more orientation on the half-life time.
 *
 * @author Luisa Vargas
 */

import Dialog from '../../../../sun/js/Dialog.js';
import buildANucleus from '../../buildANucleus.js';
import { HBox, Node, Rectangle, RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import BANColors from '../../common/BANColors.js';
import HalfLifeNumberLineNode from './HalfLifeNumberLineNode.js';
import BANTimescalePoints from '../model/BANTimescalePoints.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import BANConstants from '../../common/BANConstants.js';

// constants
const MAX_CONTENT_WIDTH = 600;
const TITLE_FONT = new PhetFont( 32 );
const LEGEND_FONT = BANConstants.REGULAR_FONT;

class HalfLifeInfoDialog extends Dialog {

  public constructor( halfLifeNumberProperty: TReadOnlyProperty<number>,
               isStableBooleanProperty: TReadOnlyProperty<boolean>,
               protonCountProperty: TReadOnlyProperty<number>,
               neutronCountProperty: TReadOnlyProperty<number>,
               doesNuclideExistBooleanProperty: TReadOnlyProperty<boolean> ) {

    const leftSideStrings = [
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS.timescaleItem,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_AN_ATOM.timescaleItem,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS.timescaleItem,
      BANTimescalePoints.TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER.timescaleItem,
      BANTimescalePoints.A_BLINK_OF_AN_EYE.timescaleItem
    ];
    const rightSideStrings = [
      BANTimescalePoints.ONE_MINUTE.timescaleItem,
      BANTimescalePoints.ONE_YEAR.timescaleItem,
      BANTimescalePoints.AVERAGE_HUMAN_LIFESPAN.timescaleItem,
      BANTimescalePoints.AGE_OF_THE_UNIVERSE.timescaleItem,
      BANTimescalePoints.LIFETIME_OF_LONGEST_LIVED_STARS.timescaleItem
    ];

    // join the strings in each array, placing one on each line
    const createTextFromStrings = ( strings: string[] ): Node => {
      return new RichText( strings.join( '<br>' ), {
        font: LEGEND_FONT,
        leading: 6
      } );
    };
    const legend = new HBox( {
      children: [
        createTextFromStrings( leftSideStrings ),
        createTextFromStrings( rightSideStrings )
      ],
      spacing: 70,
      align: 'top',
      maxWidth: 870
    } );

    // create and add the halfLifeNumberLineNode
    const halfLifeNumberLineNode = new HalfLifeNumberLineNode( halfLifeNumberProperty, isStableBooleanProperty, {
      tickMarkExtent: 24,
      numberLineLabelFont: LEGEND_FONT,
      numberLineWidth: 750,
      halfLifeArrowLength: 45,
      halfLifeDisplayScale: 0.8,
      isHalfLifeLabelFixed: false,
      protonCountProperty: protonCountProperty,
      neutronCountProperty: neutronCountProperty,
      doesNuclideExistBooleanProperty: doesNuclideExistBooleanProperty
    } );

    const numberLineNodeAndLegend = new VBox( {
      children: [ legend, halfLifeNumberLineNode ],
      spacing: 30,
      align: 'center',
      resize: false
    } );

    // surround contents with rectangle for extra padding
    const contents = new Rectangle( 0, 0, numberLineNodeAndLegend.width + 100, numberLineNodeAndLegend.height );
    contents.addChild( numberLineNodeAndLegend );
    numberLineNodeAndLegend.centerX = contents.centerX;

    // the half-life's of the strings, in respective order
    const halfLifeTime = [
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_A_NUCLEUS.numberOfSeconds,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_AN_ATOM.numberOfSeconds,
      BANTimescalePoints.TIME_FOR_LIGHT_TO_CROSS_ONE_THOUSAND_ATOMS.numberOfSeconds,
      BANTimescalePoints.TIME_FOR_SOUND_TO_TRAVEL_ONE_MILLIMETER.numberOfSeconds,
      BANTimescalePoints.A_BLINK_OF_AN_EYE.numberOfSeconds,
      BANTimescalePoints.ONE_MINUTE.numberOfSeconds,
      BANTimescalePoints.ONE_YEAR.numberOfSeconds,
      BANTimescalePoints.AVERAGE_HUMAN_LIFESPAN.numberOfSeconds,
      BANTimescalePoints.AGE_OF_THE_UNIVERSE.numberOfSeconds,
      BANTimescalePoints.LIFETIME_OF_LONGEST_LIVED_STARS.numberOfSeconds
    ];

    // the labels on the half-life's, in respective order
    const halfLifeLabels = [
      BuildANucleusStrings.A,
      BuildANucleusStrings.B,
      BuildANucleusStrings.C,
      BuildANucleusStrings.D,
      BuildANucleusStrings.E,
      BuildANucleusStrings.F,
      BuildANucleusStrings.G,
      BuildANucleusStrings.H,
      BuildANucleusStrings.I,
      BuildANucleusStrings.J
    ];

    // create and add the half-life arrow and label
    for ( let i = 0; i < halfLifeTime.length; i++ ) {
      halfLifeNumberLineNode.addArrowAndLabel( halfLifeLabels[ i ], halfLifeTime[ i ] );
    }

    const titleNode = new Text( BuildANucleusStrings.halfLifeTimescale, {
      font: TITLE_FONT,
      maxWidth: 0.75 * MAX_CONTENT_WIDTH
    } );

    super( contents, {
      title: titleNode,
      ySpacing: 20,
      xSpacing: 0,
      bottomMargin: 20,
      fill: BANColors.infoDialogBackgroundColorProperty
    } );
  }
}

buildANucleus.register( 'HalfLifeInfoDialog', HalfLifeInfoDialog );
export default HalfLifeInfoDialog;