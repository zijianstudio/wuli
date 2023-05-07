// Copyright 2020-2022, University of Colorado Boulder

/**
 * NormalModesIconFactory creates icons used in this simulation.
 *
 * @author Franco Barpp Gomes (UTFPR)
 * @author Thiago de Mendonça Mildemberger (UTFPR)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen from '../../../../joist/js/Screen.js';
import ScreenIcon from '../../../../joist/js/ScreenIcon.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import { Circle, Node, Path, Rectangle } from '../../../../scenery/js/imports.js';
import normalModes from '../../normalModes.js';
import NormalModesColors from '../NormalModesColors.js';

// constants
const SPRING_LINE_WIDTH = 15;
const MASS_LINE_WIDTH = 15;
const MASS_RADIUS = 42;

const NormalModesIconFactory = {

  /**
   * Creates the icon for the 'One Dimension' screen.
   * @returns {ScreenIcon}
   * @public
   */
  createOneDimensionScreenIcon() {

    const iconSize = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;

    // The spring is a horizontal line.
    const springShape = new Shape().moveTo( 0, 0 ).lineTo( iconSize.width, 0 );
    const springNode = new Path( springShape, {
      stroke: NormalModesColors.SPRING_STROKE,
      lineWidth: SPRING_LINE_WIDTH
    } );

    // The mass is a square.
    const massNode = new Rectangle( merge( {
      lineWidth: MASS_LINE_WIDTH,
      rectWidth: 2 * MASS_RADIUS,
      rectHeight: 2 * MASS_RADIUS,
      center: springNode.center
    }, NormalModesColors.MASS_COLORS ) );

    const iconNode = new Node( {
      children: [ springNode, massNode ]
    } );

    return new ScreenIcon( iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  },

  /**
   * Creates the icon for the 'Two Dimensions' screen.
   * @returns {ScreenIcon}
   * @public
   */
  createTwoDimensionsScreenIcon() {

    const iconSize = Screen.MINIMUM_HOME_SCREEN_ICON_SIZE;

    // The springs are horizontal and vertical lines.
    const horizontalSpringShape = new Shape().moveTo( 0, 0 ).lineTo( iconSize.width, 0 );
    const horizontalSpringNode = new Path( horizontalSpringShape, {
      stroke: NormalModesColors.SPRING_STROKE,
      lineWidth: SPRING_LINE_WIDTH
    } );
    const verticalSpringShape = new Shape().moveTo( 0, 0 ).lineTo( 0, iconSize.height );
    const verticalSpringNode = new Path( verticalSpringShape, {
      stroke: NormalModesColors.SPRING_STROKE,
      lineWidth: SPRING_LINE_WIDTH,
      center: horizontalSpringNode.center
    } );

    // The mass is a circle.
    const massNode = new Circle( MASS_RADIUS, merge( {
      lineWidth: MASS_LINE_WIDTH,
      center: horizontalSpringNode.center
    }, NormalModesColors.MASS_COLORS ) );

    const iconNode = new Node( {
      children: [ horizontalSpringNode, verticalSpringNode, massNode ]
    } );

    return new ScreenIcon( iconNode, {
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  }
};

normalModes.register( 'NormalModesIconFactory', NormalModesIconFactory );
export default NormalModesIconFactory;