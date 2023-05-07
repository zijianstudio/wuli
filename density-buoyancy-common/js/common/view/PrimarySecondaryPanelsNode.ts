// Copyright 2019-2022, University of Colorado Boulder

/**
 * A Panel with primary/secondary nodes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { FlowBox, Node, HSeparator } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import { PRIMARY_LABEL, SECONDARY_LABEL } from './MassLabelNode.js';

export default class PrimarySecondaryPanelsNode extends Panel {

  public constructor( primaryNode: Node, secondaryNode: Node ) {
    super( new FlowBox( {
      spacing: 10,
      orientation: 'vertical',
      align: 'left',
      children: [
        primaryNode,
        new HSeparator(),
        secondaryNode
      ]
    } ), DensityBuoyancyCommonConstants.PANEL_OPTIONS );
  }

  /**
   * Returns a Node that displays the "primary mass" label.
   */
  public static getPrimaryLabelNode(): Node {
    return new Node( {
      children: [ PRIMARY_LABEL ],
      scale: 0.7
    } );
  }

  /**
   * Returns a Node that displays the "secondary mass" label.
   */
  public static getSecondaryLabelNode(): Node {
    return new Node( {
      children: [ SECONDARY_LABEL ],
      scale: 0.7
    } );
  }
}

densityBuoyancyCommon.register( 'PrimarySecondaryPanelsNode', PrimarySecondaryPanelsNode );
