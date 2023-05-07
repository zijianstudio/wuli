// Copyright 2020-2023, University of Colorado Boulder

/**
 * A collection of radio buttons that controls skater image, independent of mass. Does not use RectangularRadioButtonGroup
 * because the buttons are in a layout that RectangularRadioButtonGroup does not yet support. But in the future, improvements
 * to RectangularRadioButtonGroup may make it possible to use that class, and this should be re-written accordingly.
 *
 * See https://github.com/phetsims/energy-skate-park/issues/263#issuecomment-620829413
 *
 * @author Jesse Greenberg
 */

import merge from '../../../../phet-core/js/merge.js';
import { HBox, Image, Node, VBox } from '../../../../scenery/js/imports.js';
import RectangularRadioButton from '../../../../sun/js/buttons/RectangularRadioButton.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkConstants from '../EnergySkateParkConstants.js';
import EnergySkateParkColorScheme from './EnergySkateParkColorScheme.js';
import { Shape } from '../../../../kite/js/imports.js';

const BUTTON_SPACING = 5;

class SkaterRadioButtonGroup extends Node {

  /**
   * @param {Property.<Image>} skaterImageSetProperty - Property for the skater image
   * @param {SkaterCharacterSet} skaterCharacterSet - The set of characters that this button group selects from
   * @param {Tandem} tandem
   */
  constructor( skaterImageSetProperty, skaterCharacterSet, tandem ) {
    super();

    const buttonOptions = {
      xMargin: 1,
      yMargin: 1,
      cornerRadius: EnergySkateParkConstants.RADIO_BUTTON_CORNER_RADIUS,
      baseColor: EnergySkateParkColorScheme.radioButtonBaseColor,
      buttonAppearanceStrategyOptions: {
        selectedStroke: EnergySkateParkColorScheme.radioButtonSelectedStroke
      }
    };

    const imageScale = 0.5;

    // Description of the radio buttons
    const contentArray = [
      {
        value: skaterCharacterSet.imageSet1,
        node: new Image( skaterCharacterSet.imageSet1.headshotImage, { scale: imageScale } ),
        tandemName: 'skater1RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet2,
        node: new Image( skaterCharacterSet.imageSet2.headshotImage, { scale: imageScale } ),
        tandemName: 'skater2RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet3,
        node: new Image( skaterCharacterSet.imageSet3.headshotImage, { scale: imageScale } ),
        tandemName: 'skater3RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet4,
        node: new Image( skaterCharacterSet.imageSet4.headshotImage, { scale: imageScale } ),
        tandemName: 'skater4RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet5,
        node: new Image( skaterCharacterSet.imageSet5.headshotImage, { scale: imageScale } ),
        tandemName: 'skater5RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet6,
        node: new Image( skaterCharacterSet.imageSet6.headshotImage, { scale: imageScale } ),
        tandemName: 'skater6RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet7,
        node: new Image( skaterCharacterSet.imageSet7.headshotImage, { scale: imageScale } ),
        tandemName: 'skater7RadioButton'
      },
      {
        value: skaterCharacterSet.imageSet8,
        node: new Image( skaterCharacterSet.imageSet8.headshotImage, { scale: imageScale } ),
        tandemName: 'skater8RadioButton'
      }
    ];

    const buttons = [];
    contentArray.forEach( content => {
      // Round clipping the corners to avoid pointy images in the radio buttons
      content.node.clipArea = Shape.roundRect(
        content.node.localBounds.left,
        content.node.localBounds.top,
        content.node.localBounds.width,
        content.node.localBounds.height,
        4,
        4
      );
      buttons.push( new RectangularRadioButton( skaterImageSetProperty, content.value, merge( {
        content: content.node,
        tandem: tandem.createTandem( content.tandemName )
      }, buttonOptions ) ) );
    } );

    const rows = [];
    for ( let i = 0; i < buttons.length; i += 4 ) {
      rows.push( new HBox( {
        children: buttons.slice( i, i + 4 ),
        spacing: BUTTON_SPACING,
        resize: false
      } ) );
    }

    // arrange buttons in a 2D grid
    this.addChild( new VBox( {
      children: rows,
      spacing: BUTTON_SPACING,
      resize: false
    } ) );

    // so that the selected button cannot continue to be clicked, a feature of RectangularRadioButtonGroup - this component is
    // never destroyed, no need to dispose
    skaterImageSetProperty.link( value => {
      for ( let i = 0; i < contentArray.length; i++ ) {
        if ( contentArray[ i ].value === value ) {
          buttons[ i ].pickable = false;
          buttons[ i ].cursor = null;
        }
        else {
          buttons[ i ].pickable = true;
          buttons[ i ].cursor = 'pointer';
        }
      }
    } );
  }
}

energySkatePark.register( 'SkaterRadioButtonGroup', SkaterRadioButtonGroup );

export default SkaterRadioButtonGroup;
