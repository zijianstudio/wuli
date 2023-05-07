// Copyright 2018-2023, University of Colorado Boulder

/**
 * Panel that manages the visibility of reference lines.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import MassesAndSpringsConstants from '../../../../masses-and-springs/js/common/MassesAndSpringsConstants.js';
import MassesAndSpringsStrings from '../../../../masses-and-springs/js/MassesAndSpringsStrings.js';
import merge from '../../../../phet-core/js/merge.js';
import { AlignBox, AlignGroup, HBox, Node, Text, VBox } from '../../../../scenery/js/imports.js';
import VerticalCheckboxGroup from '../../../../sun/js/VerticalCheckboxGroup.js';
import massesAndSpringsBasics from '../../massesAndSpringsBasics.js';
import MassesAndSpringsBasicsStrings from '../../MassesAndSpringsBasicsStrings.js';

const movableLineString = MassesAndSpringsStrings.movableLine;
const restingPositionString = MassesAndSpringsBasicsStrings.restingPosition;
const unstretchedLengthString = MassesAndSpringsBasicsStrings.unstretchedLength;

// constants
const CONTENT_MAX_WIDTH = 122;
const DEFAULT_CONTENT_SPACING = 155;

class LineOptionsNode extends Node {

  /**
   * @param {MassesAndSpringsModel} model
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, tandem, options ) {

    options = merge( {
      fill: MassesAndSpringsConstants.PANEL_FILL,
      tandem: tandem.createTandem( 'lineOptionsPanel' ),
      minWidth: MassesAndSpringsConstants.PANEL_MIN_WIDTH + 10,
      enablePeriodTrace: false
    }, options );

    super( options );

    // Lines added for reference in panel
    const greenLine = MassesAndSpringsConstants.CREATE_LINE_ICON( 'rgb(0, 180, 0)' );
    const blueLine = MassesAndSpringsConstants.CREATE_LINE_ICON( 'rgb( 65, 66, 232 )' );
    const redLine = MassesAndSpringsConstants.CREATE_LINE_ICON( 'rgb( 255, 0, 0 )' );

    // Used for checkbox texts
    const alignGroup = new AlignGroup( { matchVertical: false } );

    // Alignbox for unstretched length line Text
    const unstretchedLengthAlignBox = new AlignBox( new Text( unstretchedLengthString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: CONTENT_MAX_WIDTH,
      tandem: tandem.createTandem( 'unstretchedLengthText' )
    } ), { xAlign: 'left', group: alignGroup } );

    // Alignbox for movable line Text
    const movableLineAlignBox = new AlignBox( new Text( movableLineString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: CONTENT_MAX_WIDTH,
      tandem: tandem.createTandem( 'movableLineText' )
    } ), { xAlign: 'left', group: alignGroup } );

    // Alignbox for resting position line  Text
    const restingPositionAlignBox = new AlignBox( new Text( restingPositionString, {
      font: MassesAndSpringsConstants.TITLE_FONT,
      maxWidth: CONTENT_MAX_WIDTH,
      tandem: tandem.createTandem( 'restingPositionText' )
    } ), { xAlign: 'left', group: alignGroup } );

    // Max width must be set to the maxWidth of the alignGroup based on its content.
    const contentSpacing = DEFAULT_CONTENT_SPACING - alignGroup.getMaxWidth();

    // Checkbox group for line options
    const lineOptionsCheckboxGroup = new VerticalCheckboxGroup( [ {
      createNode: () => new HBox( { children: [ unstretchedLengthAlignBox, blueLine ], spacing: contentSpacing } ),
      property: model.naturalLengthVisibleProperty
    }, {
      createNode: () => new HBox( { children: [ restingPositionAlignBox, greenLine ], spacing: contentSpacing } ),
      property: model.equilibriumPositionVisibleProperty
    }, {
      createNode: () => new HBox( { children: [ movableLineAlignBox, redLine ], spacing: contentSpacing } ),
      property: model.movableLineVisibleProperty
    } ], {
      checkboxOptions: {
        boxWidth: 16,
        spacing: 8
      },
      tandem: tandem.createTandem( 'lineOptionsCheckboxGroup' )
    } );

    const lineOptionsControlsVBox = new VBox( {
        children: [
          lineOptionsCheckboxGroup
        ],
        align: 'left',
        tandem: tandem.createTandem( 'lineOptionsControlsVBox' )
      }
    );
    this.addChild( lineOptionsControlsVBox );
  }
}

massesAndSpringsBasics.register( 'LineOptionsNode', LineOptionsNode );
export default LineOptionsNode;