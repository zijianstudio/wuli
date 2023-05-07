// Copyright 2018-2023, University of Colorado Boulder

/**
 * Shows radio buttons that allow selecting between a vertical or horizontal partition
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import { AlignBox, Line, Path, Rectangle } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import OrientationPair from '../../common/model/OrientationPair.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import AreaModelCommonRadioButtonGroup from '../../common/view/AreaModelCommonRadioButtonGroup.js';
import ProportionalPartitionLineNode from './ProportionalPartitionLineNode.js';

const horizontalPartitionString = AreaModelCommonStrings.a11y.horizontalPartition;
const partitionSelectionDescriptionString = AreaModelCommonStrings.a11y.partitionSelectionDescription;
const verticalPartitionString = AreaModelCommonStrings.a11y.verticalPartition;

class PartitionRadioButtonGroup extends AreaModelCommonRadioButtonGroup {
  /**
   * @param {Property.<AreaCalculationChoice>} currentAreaOrientationProperty
   * @param {AlignGroup} selectionButtonAlignGroup
   */
  constructor( currentAreaOrientationProperty, selectionButtonAlignGroup ) {
    super( currentAreaOrientationProperty, Orientation.enumeration.values.map( orientation => {
      const icon = createPartitionOrientationIcon( orientation, currentAreaOrientationProperty );
      return {
        value: orientation,
        createNode: () => new AlignBox( icon, { group: selectionButtonAlignGroup } ),

        // pdom
        labelContent: orientation === Orientation.HORIZONTAL ? verticalPartitionString : horizontalPartitionString
      };
    } ), {
      // Less margin than others desired here
      xMargin: 7,
      yMargin: 7,

      // pdom
      descriptionContent: partitionSelectionDescriptionString
    } );
  }
}

/**
 * Creates an icon showing a switch to partition lines of a given orientation.
 * @param {Orientation} orientation
 * @param {Property.<AreaCalculationChoice>} currentAreaOrientationProperty
 * @returns {Node}
 */
function createPartitionOrientationIcon( orientation, currentAreaOrientationProperty ) {

  // The size of our rectangle
  const sizes = new OrientationPair( 36, 24 );
  const background = new Rectangle( 0, 0, sizes.horizontal, sizes.vertical, {
    stroke: AreaModelCommonColors.partitionLineIconBorderProperty,
    fill: AreaModelCommonColors.partitionLineIconBackgroundProperty
  } );

  // Expand bounds a bit, to allow room for the line-handle icon part (so we have even padding)
  background.localBounds = background.localBounds.dilated( 7 );

  const p1 = new Vector2( 0, 0 );
  const p2 = new Vector2( 0, 0 );
  p1[ orientation.coordinate ] = sizes.get( orientation ) * 2 / 3;
  p2[ orientation.coordinate ] = sizes.get( orientation ) * 2 / 3;
  p2[ orientation.opposite.coordinate ] = sizes.get( orientation.opposite ) * 1.1;

  background.children = [
    new Line( p1, p2, {
      stroke: AreaModelCommonColors.partitionLineIconLineProperty
    } ),
    new Path( ProportionalPartitionLineNode.HANDLE_ARROW_SHAPES.get( orientation ), {
      fill: new DerivedProperty(
        [
          currentAreaOrientationProperty,
          AreaModelCommonColors.proportionalColorProperties.get( orientation ),
          AreaModelCommonColors.partitionLineIconHandleProperty
        ],
        ( currentOrientation, widthColor, handleColor ) => currentOrientation === orientation ? widthColor : handleColor ),
      scale: 0.5,
      translation: p2
    } )
  ];

  return background;
}

areaModelCommon.register( 'PartitionRadioButtonGroup', PartitionRadioButtonGroup );
export default PartitionRadioButtonGroup;