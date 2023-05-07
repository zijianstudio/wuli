// Copyright 2013-2023, University of Colorado Boulder

/**
 * A node which allows the user to scroll through the various mass kits and
 * select individual masses for putting on the balance.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { AlignGroup, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import Carousel from '../../../../sun/js/Carousel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BoyCreatorNode from '../../balancelab/view/BoyCreatorNode.js';
import BrickStackCreatorNode from '../../balancelab/view/BrickStackCreatorNode.js';
import GirlCreatorNode from '../../balancelab/view/GirlCreatorNode.js';
import ManCreatorNode from '../../balancelab/view/ManCreatorNode.js';
import MysteryMassCreatorNode from '../../balancelab/view/MysteryMassCreatorNode.js';
import WomanCreatorNode from '../../balancelab/view/WomanCreatorNode.js';
import balancingAct from '../../balancingAct.js';
import BalancingActStrings from '../../BalancingActStrings.js';
import BAQueryParameters from '../BAQueryParameters.js';

const bricksString = BalancingActStrings.bricks;
const mysteryObjectsString = BalancingActStrings.mysteryObjects;
const peopleString = BalancingActStrings.people;

// constants
const TITLE_FONT = new PhetFont( 16 );

class MassCarousel extends Carousel {

  /**
   * @param {BalanceLabModel} model
   * @param {BasicBalanceScreenView} screenView
   * @param {Object} [options]
   */
  constructor( model, screenView, options ) {

    options = merge( {

      // we do our own layout
      itemsPerPage: 1,

      // lightweight look for the buttons since the user must drag items across the buttons
      buttonOptions: {
        baseColor: null,
        stroke: null,
        disabledColor: null
      },

      tandem: Tandem.REQUIRED
    }, options );

    // Create the kit node for creating brick stacks of various sizes.
    const brickCreatorKit = new Node(
      {
        children: [
          new VBox(
            {
              children: [
                new HBox(
                  {
                    children: [
                      new BrickStackCreatorNode(
                        1,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'brickStackCreatorNode1' ) }
                      ),
                      new BrickStackCreatorNode(
                        2,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'brickStackCreatorNode2' ) }
                      )
                    ],
                    spacing: 20

                  } ),
                new HBox(
                  {
                    children: [
                      ...BAQueryParameters.stanford ?
                        [] :
                        [
                          new BrickStackCreatorNode(
                            3,
                            model,
                            screenView,
                            { tandem: options.tandem.createTandem( 'brickStackCreatorNode3' ) }
                          )
                        ],
                      new BrickStackCreatorNode(
                        4,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'brickStackCreatorNode4' ) }
                      )
                    ],
                    spacing: 20
                  } )
              ],
              spacing: 20
            } )
        ]
      }
    );

    // Create the 1st kit node for creating people.
    const peopleKit1 = new Node(
      {
        children: [
          new HBox(
            {
              children: [
                new BoyCreatorNode( model, screenView ),
                new ManCreatorNode( model, screenView )
              ],
              spacing: 5
            } )
        ]
      } );

    // Create the 2nd kit node for creating people.
    const peopleKit2 = new Node(
      {
        children: [
          new HBox(
            {
              children: [
                new GirlCreatorNode( model, screenView ),
                new WomanCreatorNode( model, screenView )
              ],
              spacing: 5
            } )
        ]
      } );

    // Create the 1st kit node for mystery masses.
    const mysteryMassesKit1 = new Node(
      {
        children: [
          new VBox(
            {
              children: [
                new HBox(
                  {
                    children: [
                      new MysteryMassCreatorNode(
                        0,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode0' ) }
                      ),
                      new MysteryMassCreatorNode(
                        1,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode1' ) }
                      )
                    ],
                    spacing: 20

                  } ),
                new HBox(
                  {
                    children: [
                      new MysteryMassCreatorNode(
                        2,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode2' ) }
                      ),
                      new MysteryMassCreatorNode(
                        3,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode3' ) }
                      )
                    ],
                    spacing: 20
                  } )
              ],
              spacing: 5
            } ) ]
      } );

    // Create the 2nd kit node for mystery masses.
    const mysteryMassesKit2 = new Node(
      {
        children: [
          new VBox(
            {
              children: [
                new HBox(
                  {
                    children: [
                      new MysteryMassCreatorNode(
                        4,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode4' ) }
                      ),
                      new MysteryMassCreatorNode(
                        5,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode5' ) }
                      )
                    ],
                    spacing: 20

                  } ),
                new HBox(
                  {
                    children: [
                      new MysteryMassCreatorNode(
                        6,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode6' ) }
                      ),
                      new MysteryMassCreatorNode(
                        7,
                        model,
                        screenView,
                        { tandem: options.tandem.createTandem( 'mysteryMassCreatorNode7' ) }
                      )
                    ],
                    spacing: 20
                  } )
              ],
              spacing: 5
            } ) ]
      } );

    const elements = [
      {
        title: new Text( bricksString, { font: TITLE_FONT } ),
        content: brickCreatorKit
      },
      ...BAQueryParameters.stanford ? [] : [ {
        title: new Text( peopleString, { font: TITLE_FONT } ),
        content: peopleKit1
      },
        {
          title: new Text( peopleString, { font: TITLE_FONT } ),
          content: peopleKit2
        } ],
      {
        title: new Text( mysteryObjectsString, { font: TITLE_FONT } ),
        content: mysteryMassesKit1
      },
      {
        title: new Text( mysteryObjectsString, { font: TITLE_FONT } ),
        content: mysteryMassesKit2
      }
    ];

    // Create the actual kit selection node.
    let maxHeight = 0;
    for ( let i = 0; i < elements.length; i++ ) {
      const element = elements[ i ];
      const height = element.title.height + element.content.height;
      if ( height > maxHeight ) {
        maxHeight = height;
      }
    }

    const pageAlignGroup = new AlignGroup(); // Align all pages to the top
    const titleAlignGroup = new AlignGroup(); // Align all titles to the top
    const contentAlignGroup = new AlignGroup(); // Align contents to the center

    const pages = elements.map( element => {
      const vbox = new VBox( {
        spacing: 5,
        children: [ titleAlignGroup.createBox( element.title ), contentAlignGroup.createBox( element.content ) ]
      } );
      return {
        createNode: tandem => pageAlignGroup.createBox( vbox, {
          yAlign: 'top'
        } )
      };
    } );

    super( pages, options );
  }
}

balancingAct.register( 'MassCarousel', MassCarousel );
export default MassCarousel;