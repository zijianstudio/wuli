// Copyright 2013-2022, University of Colorado Boulder

/**
 * Block shows R = ρL/A formula with letters scaling
 * The layout is based off of the equals sign.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Anton Ulyanov (Mlearner)
 * @author John Blanco (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import platform from '../../../../phet-core/js/platform.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetStrings from '../../../../scenery-phet/js/SceneryPhetStrings.js';
import { Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import resistanceInAWire from '../../resistanceInAWire.js';
import ResistanceInAWireStrings from '../../ResistanceInAWireStrings.js';
import ResistanceInAWireConstants from '../ResistanceInAWireConstants.js';

const areaSymbolString = ResistanceInAWireStrings.areaSymbol;
const lengthSymbolString = ResistanceInAWireStrings.lengthSymbol;
const resistanceSymbolString = ResistanceInAWireStrings.resistanceSymbol;
const symbolResistivityStringProperty = SceneryPhetStrings.symbol.resistivityStringProperty;
const equationResistanceEquationString = ResistanceInAWireStrings.a11y.equation.resistanceEquation;
const resistanceEquationDescriptionString = ResistanceInAWireStrings.a11y.equation.resistanceEquationDescription;
const rhoLAndAComparablePatternString = ResistanceInAWireStrings.a11y.equation.rhoLAndAComparablePattern;
const lAndAComparablePatternString = ResistanceInAWireStrings.a11y.equation.lAndAComparablePattern;
const noneComparablePatternString = ResistanceInAWireStrings.a11y.equation.noneComparablePattern;

// constants - rather than keep a reference to each letter node, a map from key to scale magnitude is used
// to track letter scales
const RESISTANCE_KEY = 'resistance';
const RESISTIVITY_KEY = 'resistivity';
const AREA_KEY = 'area';
const LENGTH_KEY = 'length';

class FormulaNode extends Node {
  /**
   * @param {ResistanceInAWireModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    super( {
      tandem: tandem,

      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: equationResistanceEquationString,
      descriptionContent: resistanceEquationDescriptionString
    } );

    // equals sign, hard coded
    const equalsSignText = new Text( '=', { // we never internationalize the '=' sign
      font: new PhetFont( { family: ResistanceInAWireConstants.FONT_FAMILY, size: 90 } ),
      fill: ResistanceInAWireConstants.BLACK_COLOR,
      center: new Vector2( 100, 0 ),
      tandem: tandem.createTandem( 'equalsSignText' )
    } );

    // maps identifier to scale magnitude
    this.a11yScaleMap = {};
    this.a11yScaleMap[ RESISTANCE_KEY ] = 0;
    this.a11yScaleMap[ RESISTIVITY_KEY ] = 0;
    this.a11yScaleMap[ AREA_KEY ] = 0;
    this.a11yScaleMap[ LENGTH_KEY ] = 0;

    // An array of attributes related to text
    const symbolTexts = [ {
      label: resistanceSymbolString,
      center: new Vector2( equalsSignText.centerX - 100, 0 ),
      property: model.resistanceProperty,
      color: ResistanceInAWireConstants.RED_COLOR,
      cappedSize: true, // To make sure that the 'R' doesn't get too big, see https://github.com/phetsims/resistance-in-a-wire/issues/28
      tandem: tandem.createTandem( 'resistanceSymbolText' ),
      scaleKey: RESISTANCE_KEY
    }, {
      label: symbolResistivityStringProperty,
      center: new Vector2( equalsSignText.centerX + 120, -90 ),
      property: model.resistivityProperty,
      color: ResistanceInAWireConstants.BLUE_COLOR,
      tandem: tandem.createTandem( 'resistivitySymbolText' ),
      scaleKey: RESISTIVITY_KEY
    }, {
      label: lengthSymbolString,
      center: new Vector2( equalsSignText.centerX + 220, -90 ),
      property: model.lengthProperty,
      color: ResistanceInAWireConstants.BLUE_COLOR,
      tandem: tandem.createTandem( 'lengthSymbolText' ),
      scaleKey: LENGTH_KEY
    }, {
      label: areaSymbolString,
      center: new Vector2( equalsSignText.centerX + 170, 90 ),
      property: model.areaProperty,
      color: ResistanceInAWireConstants.BLUE_COLOR,
      tandem: tandem.createTandem( 'areaSymbolText' ),
      scaleKey: AREA_KEY
    } ];

    // parent for all letters in the equation - given a 'p' tag for a11y because this node will hold the relative
    // size description, see getRelativeSizeDescription()
    const lettersNode = new Node( { tagName: 'p' } );

    // if we are on a safari platform render with canvas to prevent these issues, but only on safari because
    // canvas doesn't perform as well on other browsers
    // https://github.com/phetsims/resistance-in-a-wire/issues/108 and
    // https://github.com/phetsims/resistance-in-a-wire/issues/112
    if ( platform.safari ) { lettersNode.renderer = 'canvas'; }

    // dynamically sized text
    symbolTexts.forEach( entry => {

      const text = new Text( entry.label, {
        font: new PhetFont( { family: ResistanceInAWireConstants.FONT_FAMILY, size: 15 } ),
        fill: entry.color,
        center: entry.center,
        tandem: entry.tandem
      } );

      // Add an invisible rectangle with bounds slightly larger than the text so that artifacts aren't left on the
      // screen, see https://github.com/phetsims/ohms-law/issues/26.
      // This also serves as the rectangle surrounding the 'R' that 'caps' the scaling when it gets too big.
      const antiArtifactRectangle = Rectangle.bounds( text.bounds.dilated( 1 ), { fill: 'transparent' } );

      const letterNode = new Node( { children: [ antiArtifactRectangle, text ] } );
      lettersNode.addChild( letterNode );

      // Set the scale based on the default value of the property; normalize the scale for all letters.
      const scale = 7 / entry.property.value; // empirically determined '7'

      // The size of the formula letter will scale with the value the letter represents. The accessible description for
      // the equation will also update. This does not need an unlink because it exists for the life of the sim.
      entry.property.link( value => {
        const scaleMagnitude = scale * value + 1;
        letterNode.setScaleMagnitude( scaleMagnitude );
        letterNode.center = entry.center;

        // for lookup when describing relative letter sizes
        this.a11yScaleMap[ entry.scaleKey ] = scaleMagnitude;
      } );

      // linked lazily so that relative scales are defined
      entry.property.lazyLink( () => {
        lettersNode.setDescriptionContent( this.getRelativeSizeDescription() );
      } );
    } );

    this.addChild( lettersNode );

    // Add the dividing line and equals sign after the letters so that they are on top when resistance is too large
    this.addChild( equalsSignText );

    // dividing line, hard coded
    this.addChild( new Path( Shape.lineSegment( 150, 8, 400, 8 ), {
      stroke: 'black',
      lineWidth: 6,
      tandem: tandem.createTandem( 'dividingLine' )
    } ) );

    this.mutate( options );

    // pdom - set the initial description
    lettersNode.setDescriptionContent( this.getRelativeSizeDescription() );
  }


  /**
   * Get a description of the relative size of various letters. Size of each letter is described relative to
   * resistance R. When all or L and A letters are the same size, a simplified sentence is used to reduce verbosity,
   * so this function might return something like:
   *
   * "Size of letter R is comparable to the size of letter rho, letter L, and letter A" or
   * "Size of letter R is much larger than the size of letter rho, and slightly larger than letter L and letter A." or
   * "Size of letter R is much smaller than letter rho, comparable to letter L, and much much larger than letter A."
   *
   * @returns {string}
   * @private
   * @a11y
   */
  getRelativeSizeDescription() {
    const resistanceScale = this.a11yScaleMap[ RESISTANCE_KEY ];
    const resistivityScale = this.a11yScaleMap[ RESISTIVITY_KEY ];
    const areaScale = this.a11yScaleMap[ AREA_KEY ];
    const lengthScale = this.a11yScaleMap[ LENGTH_KEY ];

    const rToRho = resistanceScale / resistivityScale;
    const rToA = resistanceScale / areaScale;
    const rToL = resistanceScale / lengthScale;
    const lToA = lengthScale / areaScale;
    const lToRho = lengthScale / resistivityScale;

    const rToRhoDescription = getRelativeSizeDescription( rToRho );
    const roTLDescription = getRelativeSizeDescription( rToL );
    const rToADescription = getRelativeSizeDescription( rToA );

    let description;
    const comparableRange = ResistanceInAWireConstants.RELATIVE_SIZE_MAP.comparable.range;

    // even if right hand side variables are not comparable in size, if R is relatively larger or smaller than all
    // by the same amount, combine size description
    const relativeSizeKeys = Object.keys( ResistanceInAWireConstants.RELATIVE_SIZE_MAP );
    let allRelativeSizesSame = false;
    for ( let i = 0; i < relativeSizeKeys.length; i++ ) {
      const key = relativeSizeKeys[ i ];
      const sizeRange = ResistanceInAWireConstants.RELATIVE_SIZE_MAP[ key ].range;
      const containsRToRho = sizeRange.contains( rToRho );
      const containsRToA = sizeRange.contains( rToA );
      const containsRToL = sizeRange.contains( rToL );

      if ( containsRToRho && containsRToA && containsRToL ) {
        allRelativeSizesSame = true;
        break;
      }
    }

    if ( ( comparableRange.contains( lToA ) && comparableRange.contains( lToRho ) ) || allRelativeSizesSame ) {

      // all right hand side letters are comparable in size
      description = StringUtils.fillIn( rhoLAndAComparablePatternString, {
        rToAll: rToRhoDescription // any size description will work
      } );
    }
    else if ( comparableRange.contains( lToA ) ) {

      // L and A are comparable, so they are the same size relative to R
      description = StringUtils.fillIn( lAndAComparablePatternString, {
        rToRho: rToRhoDescription,
        rToLAndA: roTLDescription // either length or area relative descriptions will work
      } );
    }
    else {

      // all relative sizes could be unique
      description = StringUtils.fillIn( noneComparablePatternString, {
        rToRho: rToRhoDescription,
        rToL: roTLDescription,
        rToA: rToADescription
      } );
    }

    return description;
  }
}

resistanceInAWire.register( 'FormulaNode', FormulaNode );

/**
 * Get a relative size description from a relative scale, used to describe letters relative to each other. Will return
 * something like
 *
 * "comparable to" or
 * "much much larger than"
 *
 * @param {number} relativeScale
 * @returns {string}
 */
const getRelativeSizeDescription = relativeScale => {

  // get described ranges of each relative scale
  const keys = Object.keys( ResistanceInAWireConstants.RELATIVE_SIZE_MAP );
  for ( let i = 0; i < keys.length; i++ ) {
    const relativeEntry = ResistanceInAWireConstants.RELATIVE_SIZE_MAP[ keys[ i ] ];

    if ( relativeEntry.range.contains( relativeScale ) ) {
      return relativeEntry.description;
    }
  }
  throw new Error( `no description found for relativeScale: ${relativeScale}` );
};

export default FormulaNode;