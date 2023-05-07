// Copyright 2014-2022, University of Colorado Boulder

/**
 * PHAccordionBox is the base class for the pH accordion box (aka meter) in the 'Micro' and 'My Solution' screens.
 * - Origin is at top left.
 * - Can be expanded and collapsed.
 * - Has a probe that extends down into the solution.
 * - Subclass is responsible for how the pH value is displayed.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { Shape } from '../../../../kite/js/imports.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { LinearGradient, Node, NodeOptions, NodeTranslationOptions, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import AccordionBox, { AccordionBoxOptions } from '../../../../sun/js/AccordionBox.js';
import phScale from '../../phScale.js';
import PhScaleStrings from '../../PhScaleStrings.js';
import PHScaleColors from '../PHScaleColors.js';
import PHScaleConstants from '../PHScaleConstants.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';

// constants
const Y_MARGIN = 10;

type SelfOptions = EmptySelfOptions;

export type PHAccordionBoxOptions = SelfOptions & PickRequired<AccordionBoxOptions, 'tandem'>;

export default class PHAccordionBox extends AccordionBox {

  protected static readonly CORNER_RADIUS = 8;

  /**
   * @param contentNode - Node that displays the pH value
   * @param probeYOffset - distance from top of meter to tip of probe, in view coordinate frame
   * @param [providedOptions]
   */
  protected constructor( contentNode: Node,
                         probeYOffset: number,
                         providedOptions: PHAccordionBoxOptions ) {

    const options = optionize<PHAccordionBoxOptions, SelfOptions, AccordionBoxOptions>()( {

      // AccordionBoxOptions
      fill: PHScaleColors.PANEL_FILL,
      lineWidth: 2,
      cornerRadius: PHAccordionBox.CORNER_RADIUS,
      contentYSpacing: 10,
      titleAlignX: 'left',
      titleXMargin: 15,
      titleNode: new Text( PhScaleStrings.pHStringProperty, {
        fill: 'black',
        font: new PhetFont( { size: 28, weight: 'bold' } ),
        maxWidth: 50
      } ),
      buttonAlign: 'right',
      buttonXMargin: 14,
      buttonYMargin: Y_MARGIN,
      expandCollapseButtonOptions: PHScaleConstants.EXPAND_COLLAPSE_BUTTON_OPTIONS,
      contentYMargin: Y_MARGIN
    }, providedOptions );

    super( contentNode, options );

    // Decorate the AccordionBox with a probe, which is hidden when the AccordionBox is collapsed.
    const probeNode = new ProbeNode( probeYOffset, {
      centerX: this.left + ( 0.75 * this.width ),
      top: this.top
    } );
    this.addChild( probeNode );
    probeNode.moveToBack();

    this.expandedProperty.link( expanded => {
      probeNode.visible = expanded;
    } );
  }

  public override reset(): void {
    super.reset();
    this.expandedProperty.reset();
  }
}

/**
 * Probe that extends out the bottom of the meter.
 */
type ProbeNodeSelfOptions = EmptySelfOptions;
type ProbeNodeOptions = ProbeNodeSelfOptions & NodeTranslationOptions;

class ProbeNode extends Node {

  public constructor( probeHeight: number, providedOptions?: ProbeNodeOptions ) {

    const options = optionize<ProbeNodeOptions, ProbeNodeSelfOptions, NodeOptions>()( {
      // Empty optionize is needed because we're setting children below.
    }, providedOptions );

    const PROBE_WIDTH = 20;
    const TIP_HEIGHT = 50;
    const TIP_CORNER_RADIUS = 4;
    const OVERLAP = 10;

    const shaftWidth = 0.5 * PROBE_WIDTH;
    const shaftHeight = probeHeight - TIP_HEIGHT + OVERLAP;
    const shaftNode = new Rectangle( 0, 0, shaftWidth, shaftHeight, {
      fill: new LinearGradient( 0, 0, shaftWidth, 0 )
        .addColorStop( 0, 'rgb( 150, 150, 150 )' )
        .addColorStop( 0.35, 'rgb( 220, 220, 220 )' )
        .addColorStop( 1, 'rgb( 120, 120, 120 )' )
    } );

    // clockwise from tip of probe
    const tipNode = new Path( new Shape()
      .moveTo( PROBE_WIDTH / 2, TIP_HEIGHT )
      .lineTo( 0, 0.6 * TIP_HEIGHT )
      .lineTo( 0, TIP_CORNER_RADIUS )
      .arc( TIP_CORNER_RADIUS, TIP_CORNER_RADIUS, TIP_CORNER_RADIUS, Math.PI, 1.5 * Math.PI )
      .lineTo( TIP_CORNER_RADIUS, 0 )
      .lineTo( PROBE_WIDTH - TIP_CORNER_RADIUS, 0 )
      .arc( PROBE_WIDTH - TIP_CORNER_RADIUS, TIP_CORNER_RADIUS, TIP_CORNER_RADIUS, -0.5 * Math.PI, 0 )
      .lineTo( PROBE_WIDTH, 0.6 * TIP_HEIGHT )
      .close(), {
      fill: 'black',
      centerX: shaftNode.centerX,
      top: shaftNode.bottom - OVERLAP
    } );

    options.children = [ shaftNode, tipNode ];

    super( options );
  }
}

phScale.register( 'PHAccordionBox', PHAccordionBox );