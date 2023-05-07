// Copyright 2022, University of Colorado Boulder

/**
 * A node that presents a readout of the number of protons and neutrons.
 *
 * @author Luisa Vargas
 */

import Panel from '../../../../sun/js/Panel.js';
import buildANucleus from '../../buildANucleus.js';
import BANColors from '../BANColors.js';
import { HBox, Rectangle, Text } from '../../../../scenery/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ParticleNode from '../../../../shred/js/view/ParticleNode.js';
import BuildANucleusStrings from '../../BuildANucleusStrings.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import ParticleType from './ParticleType.js';
import BANConstants from '../BANConstants.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';

// types
type NucleonLabel = {
  particleNode: ParticleNode;
  numberDisplays: NumberDisplay[];
  contents: HBox;
};

// constants, empirically determined
const LABEL_FONT = new PhetFont( BANConstants.BUTTONS_AND_LEGEND_FONT_SIZE );
const MAX_TITLE_WIDTH = 90;
const MIN_VERTICAL_SPACING = 25;
const NUCLEON_PARTICLE_RADIUS = BANConstants.PARTICLE_RADIUS * 0.7;

class NucleonCountPanel extends Panel {

  public constructor( protonCountProperty: TReadOnlyProperty<number>, protonCountRange: Range,
               neutronCountProperty: TReadOnlyProperty<number>, neutronCountRange: Range ) {

    const options = {

      // options for the panel
      fill: BANColors.panelBackgroundColorProperty,
      xMargin: 10,
      stroke: BANConstants.PANEL_STROKE,
      cornerRadius: BANConstants.PANEL_CORNER_RADIUS
    };

    const panelContents = new Rectangle( 0, 0, 140, 40 ); // empirically determined

    // function to create the nucleon labels and add them to panelContents
    const nucleonLabel = ( nucleonString: string, nucleonType: ParticleType,
                           nucleonCountProperty: TReadOnlyProperty<number>, nucleonCountRange: Range ): NucleonLabel => {

      const nucleonTitle = new Text( nucleonString, { font: LABEL_FONT, maxWidth: MAX_TITLE_WIDTH } );
      const nucleonParticleNode = new ParticleNode( nucleonType.name.toLowerCase(), NUCLEON_PARTICLE_RADIUS );
      const nucleonContents = new HBox( { spacing: 5, children: [ nucleonParticleNode, nucleonTitle ] } );
      nucleonTitle.left = nucleonParticleNode.right + nucleonParticleNode.width / 2;
      nucleonTitle.top = nucleonContents.top;
      nucleonParticleNode.centerY = nucleonTitle.centerY;
      panelContents.addChild( nucleonContents );

      // shows the new value of nucleonCountProperty
      const newNucleonNumberDisplay = new NumberDisplay( nucleonCountProperty, nucleonCountRange, {
        align: 'right',
        textOptions: {
          font: LABEL_FONT
        },
        backgroundFill: null,
        backgroundStroke: null
      } );
      newNucleonNumberDisplay.right = panelContents.right;
      panelContents.addChild( newNucleonNumberDisplay );

      const oldNucleonCountProperty = new NumberProperty( nucleonCountProperty.value );

      // shows the old value of nucleonCountProperty
      const oldNucleonNumberDisplay = new NumberDisplay( oldNucleonCountProperty, nucleonCountRange, {
        align: 'right',
        textOptions: {
          font: LABEL_FONT
        },
        backgroundFill: null,
        backgroundStroke: null
      } );
      oldNucleonNumberDisplay.right = panelContents.right;
      panelContents.addChild( oldNucleonNumberDisplay );

      // start removing oldNucleonCountDisplay by making it more opaque
      const startRemovingNucleonCountDisplay = new Animation( {
        to: 0.33,
        property: oldNucleonNumberDisplay.opacityProperty,
        duration: 0.1, // seconds
        easing: Easing.LINEAR
      } );

      // 'replace' the oldNucleonNumberDisplay with the newNucleonNumberDisplay
      const addNucleonCountDisplay = new Animation( {
        targets: [ {
          to: 1,
          property: newNucleonNumberDisplay.opacityProperty
        }, {
          to: 0,
          property: oldNucleonNumberDisplay.opacityProperty
        }
        ],
        duration: 0.1,
        easing: Easing.LINEAR
      } );

      // start showing the newNucleonNumberDisplay when the oldNucleonNumberDisplay has started becoming opaque
      startRemovingNucleonCountDisplay.then( addNucleonCountDisplay );

      nucleonCountProperty.link( () => {
        startRemovingNucleonCountDisplay.start();

        // at the end of both animations, reset the values and opacities of oldNucleonNumberDisplay and newNucleonNumberDisplay
        addNucleonCountDisplay.finishEmitter.addListener( () => {
          oldNucleonCountProperty.value = nucleonCountProperty.value;
          oldNucleonNumberDisplay.opacity = 1;
          newNucleonNumberDisplay.opacity = 0;
        } );

      } );

      return {
        particleNode: nucleonParticleNode,
        numberDisplays: [ oldNucleonNumberDisplay, newNucleonNumberDisplay ],
        contents: nucleonContents
      };
    };

    // create the nucleon labels
    const protonLabel = nucleonLabel( BuildANucleusStrings.protonsColon, ParticleType.PROTON, protonCountProperty,
      protonCountRange );
    const neutronLabel = nucleonLabel( BuildANucleusStrings.neutronsColon, ParticleType.NEUTRON, neutronCountProperty,
      neutronCountRange );

    // position the protonLabel at the top and the neutronLabel at the bottom, and align their respective numberDisplay's
    protonLabel.contents.top = 0;
    protonLabel.numberDisplays.forEach( numberDisplay => {
      numberDisplay.centerY = protonLabel.contents.centerY;
    } );
    neutronLabel.contents.bottom = protonLabel.particleNode.bottom + Math.max( neutronLabel.particleNode.height, MIN_VERTICAL_SPACING );
    neutronLabel.numberDisplays.forEach( numberDisplay => {
      numberDisplay.centerY = neutronLabel.contents.centerY;
    } );

    super( panelContents, options );
  }
}

buildANucleus.register( 'NucleonCountPanel', NucleonCountPanel );
export default NucleonCountPanel;