// Copyright 2018-2023, University of Colorado Boulder

/**
 * View for ProportionalArea.
 *
 * NOTE: This type is designed to be persistent, and will not need to release references to avoid memory leaks.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import merge from '../../../../phet-core/js/merge.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import areaModelCommon from '../../areaModelCommon.js';
import AreaModelCommonStrings from '../../AreaModelCommonStrings.js';
import AreaModelCommonConstants from '../../common/AreaModelCommonConstants.js';
import AreaDisplayNode from '../../common/view/AreaDisplayNode.js';
import AreaModelCommonColors from '../../common/view/AreaModelCommonColors.js';
import CountingAreaNode from './CountingAreaNode.js';
import ProportionalAreaGridLinesNode from './ProportionalAreaGridLinesNode.js';
import ProportionalDragHandle from './ProportionalDragHandle.js';
import ProportionalPartitionLineNode from './ProportionalPartitionLineNode.js';
import TiledAreaNode from './TiledAreaNode.js';
const areaGridString = AreaModelCommonStrings.a11y.areaGrid;
const areaGridRectanglePatternString = AreaModelCommonStrings.a11y.areaGridRectanglePattern;
const countingNumbersPatternString = AreaModelCommonStrings.a11y.countingNumbersPattern;
class ProportionalAreaDisplayNode extends AreaDisplayNode {
  /**
   * @param {ProportionalAreaDisplay} areaDisplay
   * @param {Property.<PartialProductsChoice>} partialProductsChoiceProperty
   * @param {Object} [options]
   * @param {Object} [nodeOptions]
   */
  constructor(areaDisplay, partialProductsChoiceProperty, options, nodeOptions) {
    options = merge({
      // Meant to be overridden
      gridLinesVisibleProperty: new BooleanProperty(false),
      tilesVisibleProperty: new BooleanProperty(false),
      countingVisibleProperty: new BooleanProperty(false),
      useTileLikeBackground: false,
      useLargeArea: false,
      // Specified for supertype
      isProportional: true
    }, options);
    nodeOptions = merge({
      // pdom
      tagName: 'div',
      labelTagName: 'h3',
      labelContent: areaGridString
    }, nodeOptions);
    super(areaDisplay, partialProductsChoiceProperty, options);
    const countingLabel = new Node({
      tagName: 'span'
    });
    this.pdomParagraphNode.insertChild(0, countingLabel);
    options.countingVisibleProperty.linkAttribute(countingLabel, 'visible');
    const areaAccessibleLabel = new Node({
      tagName: 'span'
    });
    this.pdomParagraphNode.insertChild(0, areaAccessibleLabel);
    Multilink.multilink(areaDisplay.activeTotalProperties.values, (width, height) => {
      areaAccessibleLabel.innerContent = StringUtils.fillIn(areaGridRectanglePatternString, {
        width: width,
        height: height
      });
      countingLabel.innerContent = StringUtils.fillIn(countingNumbersPatternString, {
        count: Utils.toFixedNumber(width * height, Utils.numberOfDecimalPlaces(width) + Utils.numberOfDecimalPlaces(height))
      });
    });

    // Background fill
    this.areaLayer.addChild(this.backgroundNode);

    // Grid lines
    const gridLinesNode = new ProportionalAreaGridLinesNode(areaDisplay.areaProperty, this.modelViewTransformProperty);
    this.areaLayer.addChild(gridLinesNode);
    options.gridLinesVisibleProperty.linkAttribute(gridLinesNode, 'visible');

    // Active area background
    const activeAreaBackground = new Rectangle({
      fill: options.useTileLikeBackground ? AreaModelCommonColors.semiTransparentSmallTileProperty : AreaModelCommonColors.proportionalActiveAreaBackgroundProperty,
      stroke: AreaModelCommonColors.proportionalActiveAreaBorderProperty
    });
    Multilink.multilink([areaDisplay.activeTotalProperties.horizontal, this.modelViewTransformProperty], (totalWidth, modelViewTransform) => {
      activeAreaBackground.rectWidth = modelViewTransform.modelToViewX(totalWidth);
    });
    Multilink.multilink([areaDisplay.activeTotalProperties.vertical, this.modelViewTransformProperty], (totalHeight, modelViewTransform) => {
      activeAreaBackground.rectHeight = modelViewTransform.modelToViewY(totalHeight);
    });
    this.areaLayer.addChild(activeAreaBackground);
    const tilesVisibleProperty = new DerivedProperty([areaDisplay.tilesAvailableProperty, options.tilesVisibleProperty], (tilesAvailable, tilesVisible) => tilesAvailable && tilesVisible);

    // @private {TiledAreaNode|null} - Tiles (optionally enabled)
    this.tiledAreaNode = new TiledAreaNode(areaDisplay, this.modelViewTransformProperty, tilesVisibleProperty);
    this.areaLayer.addChild(this.tiledAreaNode);

    // Background stroke
    this.areaLayer.addChild(this.borderNode);

    // Active area drag handle
    this.areaLayer.addChild(new ProportionalDragHandle(areaDisplay.areaProperty, areaDisplay.activeTotalProperties, this.modelViewTransformProperty));
    const countingVisibleProperty = new DerivedProperty([areaDisplay.countingAvailableProperty, options.countingVisibleProperty], (countingAvailable, countingVisible) => countingAvailable && countingVisible);

    // @private {CountingAreaNode|null} - Counts of numbers for squares (optionally enabled)
    this.countingAreaNode = new CountingAreaNode(areaDisplay.activeTotalProperties, this.modelViewTransformProperty, countingVisibleProperty);
    this.areaLayer.addChild(this.countingAreaNode);

    // Partition lines
    Orientation.enumeration.values.forEach(orientation => {
      this.areaLayer.addChild(new ProportionalPartitionLineNode(areaDisplay, this.modelViewTransformProperty, orientation));
    });

    // Partition labels
    Orientation.enumeration.values.forEach(orientation => {
      const partitionsProperties = areaDisplay.partitionsProperties.get(orientation);

      // because we will have at most 2
      const labels = [0, 1].map(index => {
        const partitionProperty = new DerivedProperty([partitionsProperties], partitions => partitions[index]);
        const label = this.createPartitionLabel(partitionProperty, areaDisplay.secondaryPartitionsProperty.get(orientation), index, orientation);
        this.labelLayer.addChild(label);
        return label;
      });
      const labelListener = this.positionPartitionLabels.bind(this, orientation, labels);
      partitionsProperties.link((partitions, oldPartitions) => {
        oldPartitions && oldPartitions.forEach(partition => {
          partition.coordinateRangeProperty.unlink(labelListener);
        });
        partitions.forEach(partition => {
          partition.coordinateRangeProperty.link(labelListener);
        });
        labelListener();
      });
      areaDisplay.primaryPartitionsProperty.get(orientation).link(labelListener);
      areaDisplay.secondaryPartitionsProperty.get(orientation).link(labelListener);
    });
    this.mutate(nodeOptions);
  }

  /**
   * Updates expensive-to-update things.
   * @public
   */
  update() {
    super.update();
    this.tiledAreaNode.update();
    this.countingAreaNode.update();
  }

  /**
   * Returns the partial product node at the given horizontal/vertical indices.
   * @private
   *
   * @param {number} horizontalIndex
   * @param {number} verticalIndex
   * @returns {PartialProductLabelNode}
   */
  getProductLabel(horizontalIndex, verticalIndex) {
    const horizontalPartitions = this.areaDisplay.partitionsProperties.horizontal.value;
    const verticalPartitions = this.areaDisplay.partitionsProperties.vertical.value;
    return _.find(this.productLabels, productLabel => {
      const partitions = productLabel.partitionedAreaProperty.value.partitions;
      return partitions.get(Orientation.HORIZONTAL) === horizontalPartitions[horizontalIndex] && partitions.get(Orientation.VERTICAL) === verticalPartitions[verticalIndex];
    });
  }

  /**
   * Positions all of the partial products labels.
   * @protected
   * @override
   */
  positionProductLabels() {
    // {OrientationPair.<Array.<Range|null>>} - Current view ranges (if non-null) for each orientation
    const rangesPair = this.areaDisplay.partitionsProperties.map((partitionsProperties, orientation) => partitionsProperties.value.map(partition => {
      const range = partition.coordinateRangeProperty.value;
      if (range === null) {
        return null;
      }
      return new Range(orientation.modelToView(this.modelViewTransformProperty.value, range.min), orientation.modelToView(this.modelViewTransformProperty.value, range.max));
    }));

    // First, center the labels (if they have defined ranges)
    this.productLabels.forEach(productLabel => {
      rangesPair.forEach((ranges, orientation) => {
        const partition = productLabel.partitionedAreaProperty.value.partitions.get(orientation);
        const range = ranges[_.indexOf(this.areaDisplay.partitionsProperties.get(orientation).value, partition)];
        if (range) {
          productLabel[orientation.coordinate] = range.getCenter();
        }
      });
    });

    // Handle each row separately
    [0, 1].forEach(verticalIndex => {
      const verticalRange = rangesPair.vertical[verticalIndex];

      // Bail if this row isn't shown at all.
      if (verticalRange === null) {
        return;
      }
      const leftLabel = this.getProductLabel(0, verticalIndex);
      const rightLabel = this.getProductLabel(1, verticalIndex);

      // We may not be able to access labels if we are in a partial state (some properties have changed, but others
      // have not).
      if (leftLabel && rightLabel) {
        const isRightPartitionVisible = rightLabel.partitionedAreaProperty.value.visibleProperty.value;
        const leftOverlapBump = 22;
        const labelOverlapBump = 10;
        const hasLeftOverlap = rangesPair.vertical[1] !== null && leftLabel.left < -5;
        const canAvoidLeftOverlap = leftLabel.top - leftOverlapBump >= verticalRange.min - 5;
        const hasLabelOverlap = isRightPartitionVisible && leftLabel.right > rightLabel.left;
        const canAvoidLabelOverlap = leftLabel.top - labelOverlapBump >= verticalRange.min - 3;
        let leftOffset = 0;
        let rightOffset = 0;
        if (hasLeftOverlap && canAvoidLeftOverlap) {
          leftOffset = leftOverlapBump;
        }
        if (hasLabelOverlap && canAvoidLabelOverlap) {
          const labelOverlapOffset = Math.max(labelOverlapBump, verticalRange.getLength() / 6);
          leftOffset = Math.max(leftOffset, labelOverlapOffset);
          rightOffset = labelOverlapOffset;
        }

        // Ignore Intellij inspections, we know what we are doing.
        if (leftOffset) {
          leftLabel.y -= leftOffset;
        }
        if (rightOffset && isRightPartitionVisible) {
          rightLabel.y += rightOffset;
        }
      }
    });
  }

  /**
   * Position the partition labels (along the top/side).
   * @private
   *
   * @param {Orientation} orientation
   * @param {Node} labels
   */
  positionPartitionLabels(orientation, labels) {
    const primaryRange = this.areaDisplay.primaryPartitionsProperty.get(orientation).value.coordinateRangeProperty.value;
    const secondaryRange = this.areaDisplay.secondaryPartitionsProperty.get(orientation).value.coordinateRangeProperty.value;
    const min = orientation.modelToView(this.modelViewTransformProperty.value, primaryRange.min);
    const middle = orientation.modelToView(this.modelViewTransformProperty.value, primaryRange.max);
    const max = secondaryRange ? orientation.modelToView(this.modelViewTransformProperty.value, secondaryRange.max) : 0;
    labels[0][orientation.coordinate] = (min + middle) / 2;
    labels[1][orientation.coordinate] = (middle + max) / 2;
    const pad = orientation === Orientation.HORIZONTAL ? 2 : 0;
    if (secondaryRange && labels[0][orientation.maxSide] > labels[1][orientation.minSide] - pad * 2) {
      const center = (labels[0][orientation.maxSide] + labels[1][orientation.minSide]) / 2;
      labels[0][orientation.maxSide] = center - pad;
      labels[1][orientation.minSide] = center + pad;
    }
  }

  /**
   * Creates a partition label for the given orientation.
   * @private
   *
   * @param {Property.<Partition>} partitionProperty
   * @param {Property.<Partition>} secondaryPartitionProperty - The partition that is empty if there is only one
   * @param {number} index - The index of the partition
   * @param {Orientation} orientation
   * @returns {Node}
   */
  createPartitionLabel(partitionProperty, secondaryPartitionProperty, index, orientation) {
    const text = new Text('', {
      font: AreaModelCommonConstants.PROPORTIONAL_PARTITION_READOUT_FONT,
      fill: new DynamicProperty(partitionProperty, {
        derive: 'colorProperty'
      })
    });
    const labelContainer = new Node({
      children: [text]
    });

    // Text label
    new DynamicProperty(partitionProperty, {
      derive: 'sizeProperty'
    }).link(size => {
      if (size === null) {
        text.string = '';
      } else {
        text.string = size.toRichString(false);
        text[orientation.centerCoordinate] = 0;
      }
    });

    // Secondary coordinate
    if (orientation === Orientation.HORIZONTAL) {
      labelContainer.top = AreaModelCommonConstants.PROPORTIONAL_RANGE_OFFSET.y + 4;
    } else {
      labelContainer.left = AreaModelCommonConstants.PROPORTIONAL_RANGE_OFFSET.x + 6;
    }
    const partitionVisibleProperty = new DynamicProperty(partitionProperty, {
      derive: 'visibleProperty'
    });
    const secondaryPartitionSizeProperty = new DynamicProperty(secondaryPartitionProperty, {
      derive: 'sizeProperty'
    });
    Multilink.multilink([partitionVisibleProperty, secondaryPartitionSizeProperty], (visible, secondarySize) => {
      labelContainer.visible = visible && secondarySize !== null;
    });
    return labelContainer;
  }
}
areaModelCommon.register('ProportionalAreaDisplayNode', ProportionalAreaDisplayNode);
export default ProportionalAreaDisplayNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJEeW5hbWljUHJvcGVydHkiLCJNdWx0aWxpbmsiLCJSYW5nZSIsIlV0aWxzIiwibWVyZ2UiLCJPcmllbnRhdGlvbiIsIlN0cmluZ1V0aWxzIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJhcmVhTW9kZWxDb21tb24iLCJBcmVhTW9kZWxDb21tb25TdHJpbmdzIiwiQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzIiwiQXJlYURpc3BsYXlOb2RlIiwiQXJlYU1vZGVsQ29tbW9uQ29sb3JzIiwiQ291bnRpbmdBcmVhTm9kZSIsIlByb3BvcnRpb25hbEFyZWFHcmlkTGluZXNOb2RlIiwiUHJvcG9ydGlvbmFsRHJhZ0hhbmRsZSIsIlByb3BvcnRpb25hbFBhcnRpdGlvbkxpbmVOb2RlIiwiVGlsZWRBcmVhTm9kZSIsImFyZWFHcmlkU3RyaW5nIiwiYTExeSIsImFyZWFHcmlkIiwiYXJlYUdyaWRSZWN0YW5nbGVQYXR0ZXJuU3RyaW5nIiwiYXJlYUdyaWRSZWN0YW5nbGVQYXR0ZXJuIiwiY291bnRpbmdOdW1iZXJzUGF0dGVyblN0cmluZyIsImNvdW50aW5nTnVtYmVyc1BhdHRlcm4iLCJQcm9wb3J0aW9uYWxBcmVhRGlzcGxheU5vZGUiLCJjb25zdHJ1Y3RvciIsImFyZWFEaXNwbGF5IiwicGFydGlhbFByb2R1Y3RzQ2hvaWNlUHJvcGVydHkiLCJvcHRpb25zIiwibm9kZU9wdGlvbnMiLCJncmlkTGluZXNWaXNpYmxlUHJvcGVydHkiLCJ0aWxlc1Zpc2libGVQcm9wZXJ0eSIsImNvdW50aW5nVmlzaWJsZVByb3BlcnR5IiwidXNlVGlsZUxpa2VCYWNrZ3JvdW5kIiwidXNlTGFyZ2VBcmVhIiwiaXNQcm9wb3J0aW9uYWwiLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwiY291bnRpbmdMYWJlbCIsInBkb21QYXJhZ3JhcGhOb2RlIiwiaW5zZXJ0Q2hpbGQiLCJsaW5rQXR0cmlidXRlIiwiYXJlYUFjY2Vzc2libGVMYWJlbCIsIm11bHRpbGluayIsImFjdGl2ZVRvdGFsUHJvcGVydGllcyIsInZhbHVlcyIsIndpZHRoIiwiaGVpZ2h0IiwiaW5uZXJDb250ZW50IiwiZmlsbEluIiwiY291bnQiLCJ0b0ZpeGVkTnVtYmVyIiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwiYXJlYUxheWVyIiwiYWRkQ2hpbGQiLCJiYWNrZ3JvdW5kTm9kZSIsImdyaWRMaW5lc05vZGUiLCJhcmVhUHJvcGVydHkiLCJtb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSIsImFjdGl2ZUFyZWFCYWNrZ3JvdW5kIiwiZmlsbCIsInNlbWlUcmFuc3BhcmVudFNtYWxsVGlsZVByb3BlcnR5IiwicHJvcG9ydGlvbmFsQWN0aXZlQXJlYUJhY2tncm91bmRQcm9wZXJ0eSIsInN0cm9rZSIsInByb3BvcnRpb25hbEFjdGl2ZUFyZWFCb3JkZXJQcm9wZXJ0eSIsImhvcml6b250YWwiLCJ0b3RhbFdpZHRoIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwicmVjdFdpZHRoIiwibW9kZWxUb1ZpZXdYIiwidmVydGljYWwiLCJ0b3RhbEhlaWdodCIsInJlY3RIZWlnaHQiLCJtb2RlbFRvVmlld1kiLCJ0aWxlc0F2YWlsYWJsZVByb3BlcnR5IiwidGlsZXNBdmFpbGFibGUiLCJ0aWxlc1Zpc2libGUiLCJ0aWxlZEFyZWFOb2RlIiwiYm9yZGVyTm9kZSIsImNvdW50aW5nQXZhaWxhYmxlUHJvcGVydHkiLCJjb3VudGluZ0F2YWlsYWJsZSIsImNvdW50aW5nVmlzaWJsZSIsImNvdW50aW5nQXJlYU5vZGUiLCJlbnVtZXJhdGlvbiIsImZvckVhY2giLCJvcmllbnRhdGlvbiIsInBhcnRpdGlvbnNQcm9wZXJ0aWVzIiwiZ2V0IiwibGFiZWxzIiwibWFwIiwiaW5kZXgiLCJwYXJ0aXRpb25Qcm9wZXJ0eSIsInBhcnRpdGlvbnMiLCJsYWJlbCIsImNyZWF0ZVBhcnRpdGlvbkxhYmVsIiwic2Vjb25kYXJ5UGFydGl0aW9uc1Byb3BlcnR5IiwibGFiZWxMYXllciIsImxhYmVsTGlzdGVuZXIiLCJwb3NpdGlvblBhcnRpdGlvbkxhYmVscyIsImJpbmQiLCJsaW5rIiwib2xkUGFydGl0aW9ucyIsInBhcnRpdGlvbiIsImNvb3JkaW5hdGVSYW5nZVByb3BlcnR5IiwidW5saW5rIiwicHJpbWFyeVBhcnRpdGlvbnNQcm9wZXJ0eSIsIm11dGF0ZSIsInVwZGF0ZSIsImdldFByb2R1Y3RMYWJlbCIsImhvcml6b250YWxJbmRleCIsInZlcnRpY2FsSW5kZXgiLCJob3Jpem9udGFsUGFydGl0aW9ucyIsInZhbHVlIiwidmVydGljYWxQYXJ0aXRpb25zIiwiXyIsImZpbmQiLCJwcm9kdWN0TGFiZWxzIiwicHJvZHVjdExhYmVsIiwicGFydGl0aW9uZWRBcmVhUHJvcGVydHkiLCJIT1JJWk9OVEFMIiwiVkVSVElDQUwiLCJwb3NpdGlvblByb2R1Y3RMYWJlbHMiLCJyYW5nZXNQYWlyIiwicmFuZ2UiLCJtb2RlbFRvVmlldyIsIm1pbiIsIm1heCIsInJhbmdlcyIsImluZGV4T2YiLCJjb29yZGluYXRlIiwiZ2V0Q2VudGVyIiwidmVydGljYWxSYW5nZSIsImxlZnRMYWJlbCIsInJpZ2h0TGFiZWwiLCJpc1JpZ2h0UGFydGl0aW9uVmlzaWJsZSIsInZpc2libGVQcm9wZXJ0eSIsImxlZnRPdmVybGFwQnVtcCIsImxhYmVsT3ZlcmxhcEJ1bXAiLCJoYXNMZWZ0T3ZlcmxhcCIsImxlZnQiLCJjYW5Bdm9pZExlZnRPdmVybGFwIiwidG9wIiwiaGFzTGFiZWxPdmVybGFwIiwicmlnaHQiLCJjYW5Bdm9pZExhYmVsT3ZlcmxhcCIsImxlZnRPZmZzZXQiLCJyaWdodE9mZnNldCIsImxhYmVsT3ZlcmxhcE9mZnNldCIsIk1hdGgiLCJnZXRMZW5ndGgiLCJ5IiwicHJpbWFyeVJhbmdlIiwic2Vjb25kYXJ5UmFuZ2UiLCJtaWRkbGUiLCJwYWQiLCJtYXhTaWRlIiwibWluU2lkZSIsImNlbnRlciIsInNlY29uZGFyeVBhcnRpdGlvblByb3BlcnR5IiwidGV4dCIsImZvbnQiLCJQUk9QT1JUSU9OQUxfUEFSVElUSU9OX1JFQURPVVRfRk9OVCIsImRlcml2ZSIsImxhYmVsQ29udGFpbmVyIiwiY2hpbGRyZW4iLCJzaXplIiwic3RyaW5nIiwidG9SaWNoU3RyaW5nIiwiY2VudGVyQ29vcmRpbmF0ZSIsIlBST1BPUlRJT05BTF9SQU5HRV9PRkZTRVQiLCJ4IiwicGFydGl0aW9uVmlzaWJsZVByb3BlcnR5Iiwic2Vjb25kYXJ5UGFydGl0aW9uU2l6ZVByb3BlcnR5IiwidmlzaWJsZSIsInNlY29uZGFyeVNpemUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlByb3BvcnRpb25hbEFyZWFEaXNwbGF5Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciBQcm9wb3J0aW9uYWxBcmVhLlxyXG4gKlxyXG4gKiBOT1RFOiBUaGlzIHR5cGUgaXMgZGVzaWduZWQgdG8gYmUgcGVyc2lzdGVudCwgYW5kIHdpbGwgbm90IG5lZWQgdG8gcmVsZWFzZSByZWZlcmVuY2VzIHRvIGF2b2lkIG1lbW9yeSBsZWFrcy5cclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IER5bmFtaWNQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0R5bmFtaWNQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBNdWx0aWxpbmsgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9NdWx0aWxpbmsuanMnO1xyXG5pbXBvcnQgUmFuZ2UgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1JhbmdlLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBhcmVhTW9kZWxDb21tb24gZnJvbSAnLi4vLi4vYXJlYU1vZGVsQ29tbW9uLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vblN0cmluZ3MgZnJvbSAnLi4vLi4vQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBBcmVhTW9kZWxDb21tb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL0FyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBBcmVhRGlzcGxheU5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQXJlYURpc3BsYXlOb2RlLmpzJztcclxuaW1wb3J0IEFyZWFNb2RlbENvbW1vbkNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9BcmVhTW9kZWxDb21tb25Db2xvcnMuanMnO1xyXG5pbXBvcnQgQ291bnRpbmdBcmVhTm9kZSBmcm9tICcuL0NvdW50aW5nQXJlYU5vZGUuanMnO1xyXG5pbXBvcnQgUHJvcG9ydGlvbmFsQXJlYUdyaWRMaW5lc05vZGUgZnJvbSAnLi9Qcm9wb3J0aW9uYWxBcmVhR3JpZExpbmVzTm9kZS5qcyc7XHJcbmltcG9ydCBQcm9wb3J0aW9uYWxEcmFnSGFuZGxlIGZyb20gJy4vUHJvcG9ydGlvbmFsRHJhZ0hhbmRsZS5qcyc7XHJcbmltcG9ydCBQcm9wb3J0aW9uYWxQYXJ0aXRpb25MaW5lTm9kZSBmcm9tICcuL1Byb3BvcnRpb25hbFBhcnRpdGlvbkxpbmVOb2RlLmpzJztcclxuaW1wb3J0IFRpbGVkQXJlYU5vZGUgZnJvbSAnLi9UaWxlZEFyZWFOb2RlLmpzJztcclxuXHJcbmNvbnN0IGFyZWFHcmlkU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5hMTF5LmFyZWFHcmlkO1xyXG5jb25zdCBhcmVhR3JpZFJlY3RhbmdsZVBhdHRlcm5TdHJpbmcgPSBBcmVhTW9kZWxDb21tb25TdHJpbmdzLmExMXkuYXJlYUdyaWRSZWN0YW5nbGVQYXR0ZXJuO1xyXG5jb25zdCBjb3VudGluZ051bWJlcnNQYXR0ZXJuU3RyaW5nID0gQXJlYU1vZGVsQ29tbW9uU3RyaW5ncy5hMTF5LmNvdW50aW5nTnVtYmVyc1BhdHRlcm47XHJcblxyXG5jbGFzcyBQcm9wb3J0aW9uYWxBcmVhRGlzcGxheU5vZGUgZXh0ZW5kcyBBcmVhRGlzcGxheU5vZGUge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcG9ydGlvbmFsQXJlYURpc3BsYXl9IGFyZWFEaXNwbGF5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48UGFydGlhbFByb2R1Y3RzQ2hvaWNlPn0gcGFydGlhbFByb2R1Y3RzQ2hvaWNlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtub2RlT3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggYXJlYURpc3BsYXksIHBhcnRpYWxQcm9kdWN0c0Nob2ljZVByb3BlcnR5LCBvcHRpb25zLCBub2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIE1lYW50IHRvIGJlIG92ZXJyaWRkZW5cclxuICAgICAgZ3JpZExpbmVzVmlzaWJsZVByb3BlcnR5OiBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApLFxyXG4gICAgICB0aWxlc1Zpc2libGVQcm9wZXJ0eTogbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UgKSxcclxuICAgICAgY291bnRpbmdWaXNpYmxlUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlICksXHJcbiAgICAgIHVzZVRpbGVMaWtlQmFja2dyb3VuZDogZmFsc2UsXHJcbiAgICAgIHVzZUxhcmdlQXJlYTogZmFsc2UsXHJcblxyXG4gICAgICAvLyBTcGVjaWZpZWQgZm9yIHN1cGVydHlwZVxyXG4gICAgICBpc1Byb3BvcnRpb25hbDogdHJ1ZVxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIG5vZGVPcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2RpdicsXHJcbiAgICAgIGxhYmVsVGFnTmFtZTogJ2gzJyxcclxuICAgICAgbGFiZWxDb250ZW50OiBhcmVhR3JpZFN0cmluZ1xyXG4gICAgfSwgbm9kZU9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggYXJlYURpc3BsYXksIHBhcnRpYWxQcm9kdWN0c0Nob2ljZVByb3BlcnR5LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY291bnRpbmdMYWJlbCA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIHRhZ05hbWU6ICdzcGFuJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5wZG9tUGFyYWdyYXBoTm9kZS5pbnNlcnRDaGlsZCggMCwgY291bnRpbmdMYWJlbCApO1xyXG4gICAgb3B0aW9ucy5jb3VudGluZ1Zpc2libGVQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCBjb3VudGluZ0xhYmVsLCAndmlzaWJsZScgKTtcclxuXHJcbiAgICBjb25zdCBhcmVhQWNjZXNzaWJsZUxhYmVsID0gbmV3IE5vZGUoIHtcclxuICAgICAgdGFnTmFtZTogJ3NwYW4nXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnBkb21QYXJhZ3JhcGhOb2RlLmluc2VydENoaWxkKCAwLCBhcmVhQWNjZXNzaWJsZUxhYmVsICk7XHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBhcmVhRGlzcGxheS5hY3RpdmVUb3RhbFByb3BlcnRpZXMudmFsdWVzLCAoIHdpZHRoLCBoZWlnaHQgKSA9PiB7XHJcbiAgICAgIGFyZWFBY2Nlc3NpYmxlTGFiZWwuaW5uZXJDb250ZW50ID0gU3RyaW5nVXRpbHMuZmlsbEluKCBhcmVhR3JpZFJlY3RhbmdsZVBhdHRlcm5TdHJpbmcsIHtcclxuICAgICAgICB3aWR0aDogd2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHRcclxuICAgICAgfSApO1xyXG4gICAgICBjb3VudGluZ0xhYmVsLmlubmVyQ29udGVudCA9IFN0cmluZ1V0aWxzLmZpbGxJbiggY291bnRpbmdOdW1iZXJzUGF0dGVyblN0cmluZywge1xyXG4gICAgICAgIGNvdW50OiBVdGlscy50b0ZpeGVkTnVtYmVyKCB3aWR0aCAqIGhlaWdodCwgVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCB3aWR0aCApICsgVXRpbHMubnVtYmVyT2ZEZWNpbWFsUGxhY2VzKCBoZWlnaHQgKSApXHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBCYWNrZ3JvdW5kIGZpbGxcclxuICAgIHRoaXMuYXJlYUxheWVyLmFkZENoaWxkKCB0aGlzLmJhY2tncm91bmROb2RlICk7XHJcblxyXG4gICAgLy8gR3JpZCBsaW5lc1xyXG4gICAgY29uc3QgZ3JpZExpbmVzTm9kZSA9IG5ldyBQcm9wb3J0aW9uYWxBcmVhR3JpZExpbmVzTm9kZSggYXJlYURpc3BsYXkuYXJlYVByb3BlcnR5LCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5ICk7XHJcbiAgICB0aGlzLmFyZWFMYXllci5hZGRDaGlsZCggZ3JpZExpbmVzTm9kZSApO1xyXG4gICAgb3B0aW9ucy5ncmlkTGluZXNWaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggZ3JpZExpbmVzTm9kZSwgJ3Zpc2libGUnICk7XHJcblxyXG4gICAgLy8gQWN0aXZlIGFyZWEgYmFja2dyb3VuZFxyXG4gICAgY29uc3QgYWN0aXZlQXJlYUJhY2tncm91bmQgPSBuZXcgUmVjdGFuZ2xlKCB7XHJcbiAgICAgIGZpbGw6IG9wdGlvbnMudXNlVGlsZUxpa2VCYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgID8gQXJlYU1vZGVsQ29tbW9uQ29sb3JzLnNlbWlUcmFuc3BhcmVudFNtYWxsVGlsZVByb3BlcnR5XHJcbiAgICAgICAgICAgIDogQXJlYU1vZGVsQ29tbW9uQ29sb3JzLnByb3BvcnRpb25hbEFjdGl2ZUFyZWFCYWNrZ3JvdW5kUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogQXJlYU1vZGVsQ29tbW9uQ29sb3JzLnByb3BvcnRpb25hbEFjdGl2ZUFyZWFCb3JkZXJQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBhcmVhRGlzcGxheS5hY3RpdmVUb3RhbFByb3BlcnRpZXMuaG9yaXpvbnRhbCwgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSBdLFxyXG4gICAgICAoIHRvdGFsV2lkdGgsIG1vZGVsVmlld1RyYW5zZm9ybSApID0+IHtcclxuICAgICAgICBhY3RpdmVBcmVhQmFja2dyb3VuZC5yZWN0V2lkdGggPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdYKCB0b3RhbFdpZHRoICk7XHJcbiAgICAgIH0gKTtcclxuICAgIE11bHRpbGluay5tdWx0aWxpbmsoXHJcbiAgICAgIFsgYXJlYURpc3BsYXkuYWN0aXZlVG90YWxQcm9wZXJ0aWVzLnZlcnRpY2FsLCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5IF0sXHJcbiAgICAgICggdG90YWxIZWlnaHQsIG1vZGVsVmlld1RyYW5zZm9ybSApID0+IHtcclxuICAgICAgICBhY3RpdmVBcmVhQmFja2dyb3VuZC5yZWN0SGVpZ2h0ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WSggdG90YWxIZWlnaHQgKTtcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hcmVhTGF5ZXIuYWRkQ2hpbGQoIGFjdGl2ZUFyZWFCYWNrZ3JvdW5kICk7XHJcblxyXG4gICAgY29uc3QgdGlsZXNWaXNpYmxlUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KFxyXG4gICAgICBbIGFyZWFEaXNwbGF5LnRpbGVzQXZhaWxhYmxlUHJvcGVydHksIG9wdGlvbnMudGlsZXNWaXNpYmxlUHJvcGVydHkgXSxcclxuICAgICAgKCB0aWxlc0F2YWlsYWJsZSwgdGlsZXNWaXNpYmxlICkgPT4gdGlsZXNBdmFpbGFibGUgJiYgdGlsZXNWaXNpYmxlICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge1RpbGVkQXJlYU5vZGV8bnVsbH0gLSBUaWxlcyAob3B0aW9uYWxseSBlbmFibGVkKVxyXG4gICAgdGhpcy50aWxlZEFyZWFOb2RlID0gbmV3IFRpbGVkQXJlYU5vZGUoIGFyZWFEaXNwbGF5LCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LCB0aWxlc1Zpc2libGVQcm9wZXJ0eSApO1xyXG4gICAgdGhpcy5hcmVhTGF5ZXIuYWRkQ2hpbGQoIHRoaXMudGlsZWRBcmVhTm9kZSApO1xyXG5cclxuICAgIC8vIEJhY2tncm91bmQgc3Ryb2tlXHJcbiAgICB0aGlzLmFyZWFMYXllci5hZGRDaGlsZCggdGhpcy5ib3JkZXJOb2RlICk7XHJcblxyXG4gICAgLy8gQWN0aXZlIGFyZWEgZHJhZyBoYW5kbGVcclxuICAgIHRoaXMuYXJlYUxheWVyLmFkZENoaWxkKCBuZXcgUHJvcG9ydGlvbmFsRHJhZ0hhbmRsZShcclxuICAgICAgYXJlYURpc3BsYXkuYXJlYVByb3BlcnR5LFxyXG4gICAgICBhcmVhRGlzcGxheS5hY3RpdmVUb3RhbFByb3BlcnRpZXMsXHJcbiAgICAgIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHlcclxuICAgICkgKTtcclxuXHJcbiAgICBjb25zdCBjb3VudGluZ1Zpc2libGVQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgYXJlYURpc3BsYXkuY291bnRpbmdBdmFpbGFibGVQcm9wZXJ0eSwgb3B0aW9ucy5jb3VudGluZ1Zpc2libGVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIGNvdW50aW5nQXZhaWxhYmxlLCBjb3VudGluZ1Zpc2libGUgKSA9PiBjb3VudGluZ0F2YWlsYWJsZSAmJiBjb3VudGluZ1Zpc2libGUgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Q291bnRpbmdBcmVhTm9kZXxudWxsfSAtIENvdW50cyBvZiBudW1iZXJzIGZvciBzcXVhcmVzIChvcHRpb25hbGx5IGVuYWJsZWQpXHJcbiAgICB0aGlzLmNvdW50aW5nQXJlYU5vZGUgPSBuZXcgQ291bnRpbmdBcmVhTm9kZShcclxuICAgICAgYXJlYURpc3BsYXkuYWN0aXZlVG90YWxQcm9wZXJ0aWVzLFxyXG4gICAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LFxyXG4gICAgICBjb3VudGluZ1Zpc2libGVQcm9wZXJ0eVxyXG4gICAgKTtcclxuICAgIHRoaXMuYXJlYUxheWVyLmFkZENoaWxkKCB0aGlzLmNvdW50aW5nQXJlYU5vZGUgKTtcclxuXHJcbiAgICAvLyBQYXJ0aXRpb24gbGluZXNcclxuICAgIE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcy5mb3JFYWNoKCBvcmllbnRhdGlvbiA9PiB7XHJcbiAgICAgIHRoaXMuYXJlYUxheWVyLmFkZENoaWxkKCBuZXcgUHJvcG9ydGlvbmFsUGFydGl0aW9uTGluZU5vZGUoXHJcbiAgICAgICAgYXJlYURpc3BsYXksXHJcbiAgICAgICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eSxcclxuICAgICAgICBvcmllbnRhdGlvbiApXHJcbiAgICAgICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gUGFydGl0aW9uIGxhYmVsc1xyXG4gICAgT3JpZW50YXRpb24uZW51bWVyYXRpb24udmFsdWVzLmZvckVhY2goIG9yaWVudGF0aW9uID0+IHtcclxuICAgICAgY29uc3QgcGFydGl0aW9uc1Byb3BlcnRpZXMgPSBhcmVhRGlzcGxheS5wYXJ0aXRpb25zUHJvcGVydGllcy5nZXQoIG9yaWVudGF0aW9uICk7XHJcblxyXG4gICAgICAvLyBiZWNhdXNlIHdlIHdpbGwgaGF2ZSBhdCBtb3N0IDJcclxuICAgICAgY29uc3QgbGFiZWxzID0gWyAwLCAxIF0ubWFwKCBpbmRleCA9PiB7XHJcbiAgICAgICAgY29uc3QgcGFydGl0aW9uUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHBhcnRpdGlvbnNQcm9wZXJ0aWVzIF0sIHBhcnRpdGlvbnMgPT4gcGFydGl0aW9uc1sgaW5kZXggXSApO1xyXG4gICAgICAgIGNvbnN0IGxhYmVsID0gdGhpcy5jcmVhdGVQYXJ0aXRpb25MYWJlbChcclxuICAgICAgICAgIHBhcnRpdGlvblByb3BlcnR5LFxyXG4gICAgICAgICAgYXJlYURpc3BsYXkuc2Vjb25kYXJ5UGFydGl0aW9uc1Byb3BlcnR5LmdldCggb3JpZW50YXRpb24gKSxcclxuICAgICAgICAgIGluZGV4LFxyXG4gICAgICAgICAgb3JpZW50YXRpb25cclxuICAgICAgICApO1xyXG4gICAgICAgIHRoaXMubGFiZWxMYXllci5hZGRDaGlsZCggbGFiZWwgKTtcclxuICAgICAgICByZXR1cm4gbGFiZWw7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIGNvbnN0IGxhYmVsTGlzdGVuZXIgPSB0aGlzLnBvc2l0aW9uUGFydGl0aW9uTGFiZWxzLmJpbmQoIHRoaXMsIG9yaWVudGF0aW9uLCBsYWJlbHMgKTtcclxuICAgICAgcGFydGl0aW9uc1Byb3BlcnRpZXMubGluayggKCBwYXJ0aXRpb25zLCBvbGRQYXJ0aXRpb25zICkgPT4ge1xyXG4gICAgICAgIG9sZFBhcnRpdGlvbnMgJiYgb2xkUGFydGl0aW9ucy5mb3JFYWNoKCBwYXJ0aXRpb24gPT4ge1xyXG4gICAgICAgICAgcGFydGl0aW9uLmNvb3JkaW5hdGVSYW5nZVByb3BlcnR5LnVubGluayggbGFiZWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBwYXJ0aXRpb25zLmZvckVhY2goIHBhcnRpdGlvbiA9PiB7XHJcbiAgICAgICAgICBwYXJ0aXRpb24uY29vcmRpbmF0ZVJhbmdlUHJvcGVydHkubGluayggbGFiZWxMaXN0ZW5lciApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBsYWJlbExpc3RlbmVyKCk7XHJcbiAgICAgIH0gKTtcclxuICAgICAgYXJlYURpc3BsYXkucHJpbWFyeVBhcnRpdGlvbnNQcm9wZXJ0eS5nZXQoIG9yaWVudGF0aW9uICkubGluayggbGFiZWxMaXN0ZW5lciApO1xyXG4gICAgICBhcmVhRGlzcGxheS5zZWNvbmRhcnlQYXJ0aXRpb25zUHJvcGVydHkuZ2V0KCBvcmllbnRhdGlvbiApLmxpbmsoIGxhYmVsTGlzdGVuZXIgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm11dGF0ZSggbm9kZU9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgZXhwZW5zaXZlLXRvLXVwZGF0ZSB0aGluZ3MuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZSgpIHtcclxuICAgIHN1cGVyLnVwZGF0ZSgpO1xyXG5cclxuICAgIHRoaXMudGlsZWRBcmVhTm9kZS51cGRhdGUoKTtcclxuICAgIHRoaXMuY291bnRpbmdBcmVhTm9kZS51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHBhcnRpYWwgcHJvZHVjdCBub2RlIGF0IHRoZSBnaXZlbiBob3Jpem9udGFsL3ZlcnRpY2FsIGluZGljZXMuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBob3Jpem9udGFsSW5kZXhcclxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVydGljYWxJbmRleFxyXG4gICAqIEByZXR1cm5zIHtQYXJ0aWFsUHJvZHVjdExhYmVsTm9kZX1cclxuICAgKi9cclxuICBnZXRQcm9kdWN0TGFiZWwoIGhvcml6b250YWxJbmRleCwgdmVydGljYWxJbmRleCApIHtcclxuICAgIGNvbnN0IGhvcml6b250YWxQYXJ0aXRpb25zID0gdGhpcy5hcmVhRGlzcGxheS5wYXJ0aXRpb25zUHJvcGVydGllcy5ob3Jpem9udGFsLnZhbHVlO1xyXG4gICAgY29uc3QgdmVydGljYWxQYXJ0aXRpb25zID0gdGhpcy5hcmVhRGlzcGxheS5wYXJ0aXRpb25zUHJvcGVydGllcy52ZXJ0aWNhbC52YWx1ZTtcclxuXHJcbiAgICByZXR1cm4gXy5maW5kKCB0aGlzLnByb2R1Y3RMYWJlbHMsIHByb2R1Y3RMYWJlbCA9PiB7XHJcbiAgICAgIGNvbnN0IHBhcnRpdGlvbnMgPSBwcm9kdWN0TGFiZWwucGFydGl0aW9uZWRBcmVhUHJvcGVydHkudmFsdWUucGFydGl0aW9ucztcclxuICAgICAgcmV0dXJuIHBhcnRpdGlvbnMuZ2V0KCBPcmllbnRhdGlvbi5IT1JJWk9OVEFMICkgPT09IGhvcml6b250YWxQYXJ0aXRpb25zWyBob3Jpem9udGFsSW5kZXggXSAmJlxyXG4gICAgICAgICAgICAgcGFydGl0aW9ucy5nZXQoIE9yaWVudGF0aW9uLlZFUlRJQ0FMICkgPT09IHZlcnRpY2FsUGFydGl0aW9uc1sgdmVydGljYWxJbmRleCBdO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb25zIGFsbCBvZiB0aGUgcGFydGlhbCBwcm9kdWN0cyBsYWJlbHMuXHJcbiAgICogQHByb3RlY3RlZFxyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIHBvc2l0aW9uUHJvZHVjdExhYmVscygpIHtcclxuICAgIC8vIHtPcmllbnRhdGlvblBhaXIuPEFycmF5LjxSYW5nZXxudWxsPj59IC0gQ3VycmVudCB2aWV3IHJhbmdlcyAoaWYgbm9uLW51bGwpIGZvciBlYWNoIG9yaWVudGF0aW9uXHJcbiAgICBjb25zdCByYW5nZXNQYWlyID0gdGhpcy5hcmVhRGlzcGxheS5wYXJ0aXRpb25zUHJvcGVydGllcy5tYXAoICggcGFydGl0aW9uc1Byb3BlcnRpZXMsIG9yaWVudGF0aW9uICkgPT4gcGFydGl0aW9uc1Byb3BlcnRpZXMudmFsdWUubWFwKCBwYXJ0aXRpb24gPT4ge1xyXG4gICAgICBjb25zdCByYW5nZSA9IHBhcnRpdGlvbi5jb29yZGluYXRlUmFuZ2VQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgaWYgKCByYW5nZSA9PT0gbnVsbCApIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbmV3IFJhbmdlKFxyXG4gICAgICAgIG9yaWVudGF0aW9uLm1vZGVsVG9WaWV3KCB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybVByb3BlcnR5LnZhbHVlLCByYW5nZS5taW4gKSxcclxuICAgICAgICBvcmllbnRhdGlvbi5tb2RlbFRvVmlldyggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZSwgcmFuZ2UubWF4IClcclxuICAgICAgKTtcclxuICAgIH0gKSApO1xyXG5cclxuICAgIC8vIEZpcnN0LCBjZW50ZXIgdGhlIGxhYmVscyAoaWYgdGhleSBoYXZlIGRlZmluZWQgcmFuZ2VzKVxyXG4gICAgdGhpcy5wcm9kdWN0TGFiZWxzLmZvckVhY2goIHByb2R1Y3RMYWJlbCA9PiB7XHJcbiAgICAgIHJhbmdlc1BhaXIuZm9yRWFjaCggKCByYW5nZXMsIG9yaWVudGF0aW9uICkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHBhcnRpdGlvbiA9IHByb2R1Y3RMYWJlbC5wYXJ0aXRpb25lZEFyZWFQcm9wZXJ0eS52YWx1ZS5wYXJ0aXRpb25zLmdldCggb3JpZW50YXRpb24gKTtcclxuICAgICAgICBjb25zdCByYW5nZSA9IHJhbmdlc1sgXy5pbmRleE9mKCB0aGlzLmFyZWFEaXNwbGF5LnBhcnRpdGlvbnNQcm9wZXJ0aWVzLmdldCggb3JpZW50YXRpb24gKS52YWx1ZSwgcGFydGl0aW9uICkgXTtcclxuICAgICAgICBpZiAoIHJhbmdlICkge1xyXG4gICAgICAgICAgcHJvZHVjdExhYmVsWyBvcmllbnRhdGlvbi5jb29yZGluYXRlIF0gPSByYW5nZS5nZXRDZW50ZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgZWFjaCByb3cgc2VwYXJhdGVseVxyXG4gICAgWyAwLCAxIF0uZm9yRWFjaCggdmVydGljYWxJbmRleCA9PiB7XHJcbiAgICAgIGNvbnN0IHZlcnRpY2FsUmFuZ2UgPSByYW5nZXNQYWlyLnZlcnRpY2FsWyB2ZXJ0aWNhbEluZGV4IF07XHJcblxyXG4gICAgICAvLyBCYWlsIGlmIHRoaXMgcm93IGlzbid0IHNob3duIGF0IGFsbC5cclxuICAgICAgaWYgKCB2ZXJ0aWNhbFJhbmdlID09PSBudWxsICkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgIGNvbnN0IGxlZnRMYWJlbCA9IHRoaXMuZ2V0UHJvZHVjdExhYmVsKCAwLCB2ZXJ0aWNhbEluZGV4ICk7XHJcbiAgICAgIGNvbnN0IHJpZ2h0TGFiZWwgPSB0aGlzLmdldFByb2R1Y3RMYWJlbCggMSwgdmVydGljYWxJbmRleCApO1xyXG5cclxuICAgICAgLy8gV2UgbWF5IG5vdCBiZSBhYmxlIHRvIGFjY2VzcyBsYWJlbHMgaWYgd2UgYXJlIGluIGEgcGFydGlhbCBzdGF0ZSAoc29tZSBwcm9wZXJ0aWVzIGhhdmUgY2hhbmdlZCwgYnV0IG90aGVyc1xyXG4gICAgICAvLyBoYXZlIG5vdCkuXHJcbiAgICAgIGlmICggbGVmdExhYmVsICYmIHJpZ2h0TGFiZWwgKSB7XHJcbiAgICAgICAgY29uc3QgaXNSaWdodFBhcnRpdGlvblZpc2libGUgPSByaWdodExhYmVsLnBhcnRpdGlvbmVkQXJlYVByb3BlcnR5LnZhbHVlLnZpc2libGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgICBjb25zdCBsZWZ0T3ZlcmxhcEJ1bXAgPSAyMjtcclxuICAgICAgICBjb25zdCBsYWJlbE92ZXJsYXBCdW1wID0gMTA7XHJcblxyXG4gICAgICAgIGNvbnN0IGhhc0xlZnRPdmVybGFwID0gcmFuZ2VzUGFpci52ZXJ0aWNhbFsgMSBdICE9PSBudWxsICYmIGxlZnRMYWJlbC5sZWZ0IDwgLTU7XHJcbiAgICAgICAgY29uc3QgY2FuQXZvaWRMZWZ0T3ZlcmxhcCA9IGxlZnRMYWJlbC50b3AgLSBsZWZ0T3ZlcmxhcEJ1bXAgPj0gdmVydGljYWxSYW5nZS5taW4gLSA1O1xyXG4gICAgICAgIGNvbnN0IGhhc0xhYmVsT3ZlcmxhcCA9IGlzUmlnaHRQYXJ0aXRpb25WaXNpYmxlICYmIGxlZnRMYWJlbC5yaWdodCA+IHJpZ2h0TGFiZWwubGVmdDtcclxuICAgICAgICBjb25zdCBjYW5Bdm9pZExhYmVsT3ZlcmxhcCA9IGxlZnRMYWJlbC50b3AgLSBsYWJlbE92ZXJsYXBCdW1wID49IHZlcnRpY2FsUmFuZ2UubWluIC0gMztcclxuXHJcbiAgICAgICAgbGV0IGxlZnRPZmZzZXQgPSAwO1xyXG4gICAgICAgIGxldCByaWdodE9mZnNldCA9IDA7XHJcbiAgICAgICAgaWYgKCBoYXNMZWZ0T3ZlcmxhcCAmJiBjYW5Bdm9pZExlZnRPdmVybGFwICkge1xyXG4gICAgICAgICAgbGVmdE9mZnNldCA9IGxlZnRPdmVybGFwQnVtcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCBoYXNMYWJlbE92ZXJsYXAgJiYgY2FuQXZvaWRMYWJlbE92ZXJsYXAgKSB7XHJcbiAgICAgICAgICBjb25zdCBsYWJlbE92ZXJsYXBPZmZzZXQgPSBNYXRoLm1heCggbGFiZWxPdmVybGFwQnVtcCwgdmVydGljYWxSYW5nZS5nZXRMZW5ndGgoKSAvIDYgKTtcclxuICAgICAgICAgIGxlZnRPZmZzZXQgPSBNYXRoLm1heCggbGVmdE9mZnNldCwgbGFiZWxPdmVybGFwT2Zmc2V0ICk7XHJcbiAgICAgICAgICByaWdodE9mZnNldCA9IGxhYmVsT3ZlcmxhcE9mZnNldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElnbm9yZSBJbnRlbGxpaiBpbnNwZWN0aW9ucywgd2Uga25vdyB3aGF0IHdlIGFyZSBkb2luZy5cclxuICAgICAgICBpZiAoIGxlZnRPZmZzZXQgKSB7XHJcbiAgICAgICAgICBsZWZ0TGFiZWwueSAtPSBsZWZ0T2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIHJpZ2h0T2Zmc2V0ICYmIGlzUmlnaHRQYXJ0aXRpb25WaXNpYmxlICkge1xyXG4gICAgICAgICAgcmlnaHRMYWJlbC55ICs9IHJpZ2h0T2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUG9zaXRpb24gdGhlIHBhcnRpdGlvbiBsYWJlbHMgKGFsb25nIHRoZSB0b3Avc2lkZSkuXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T3JpZW50YXRpb259IG9yaWVudGF0aW9uXHJcbiAgICogQHBhcmFtIHtOb2RlfSBsYWJlbHNcclxuICAgKi9cclxuICBwb3NpdGlvblBhcnRpdGlvbkxhYmVscyggb3JpZW50YXRpb24sIGxhYmVscyApIHtcclxuICAgIGNvbnN0IHByaW1hcnlSYW5nZSA9IHRoaXMuYXJlYURpc3BsYXkucHJpbWFyeVBhcnRpdGlvbnNQcm9wZXJ0eS5nZXQoIG9yaWVudGF0aW9uICkudmFsdWUuY29vcmRpbmF0ZVJhbmdlUHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBzZWNvbmRhcnlSYW5nZSA9IHRoaXMuYXJlYURpc3BsYXkuc2Vjb25kYXJ5UGFydGl0aW9uc1Byb3BlcnR5LmdldCggb3JpZW50YXRpb24gKS52YWx1ZS5jb29yZGluYXRlUmFuZ2VQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBjb25zdCBtaW4gPSBvcmllbnRhdGlvbi5tb2RlbFRvVmlldyggdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm1Qcm9wZXJ0eS52YWx1ZSwgcHJpbWFyeVJhbmdlLm1pbiApO1xyXG4gICAgY29uc3QgbWlkZGxlID0gb3JpZW50YXRpb24ubW9kZWxUb1ZpZXcoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUsIHByaW1hcnlSYW5nZS5tYXggKTtcclxuICAgIGNvbnN0IG1heCA9IHNlY29uZGFyeVJhbmdlID8gb3JpZW50YXRpb24ubW9kZWxUb1ZpZXcoIHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtUHJvcGVydHkudmFsdWUsIHNlY29uZGFyeVJhbmdlLm1heCApIDogMDtcclxuXHJcbiAgICBsYWJlbHNbIDAgXVsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdID0gKCBtaW4gKyBtaWRkbGUgKSAvIDI7XHJcbiAgICBsYWJlbHNbIDEgXVsgb3JpZW50YXRpb24uY29vcmRpbmF0ZSBdID0gKCBtaWRkbGUgKyBtYXggKSAvIDI7XHJcblxyXG4gICAgY29uc3QgcGFkID0gb3JpZW50YXRpb24gPT09IE9yaWVudGF0aW9uLkhPUklaT05UQUwgPyAyIDogMDtcclxuXHJcbiAgICBpZiAoIHNlY29uZGFyeVJhbmdlICYmIGxhYmVsc1sgMCBdWyBvcmllbnRhdGlvbi5tYXhTaWRlIF0gPiBsYWJlbHNbIDEgXVsgb3JpZW50YXRpb24ubWluU2lkZSBdIC0gcGFkICogMiApIHtcclxuICAgICAgY29uc3QgY2VudGVyID0gKCBsYWJlbHNbIDAgXVsgb3JpZW50YXRpb24ubWF4U2lkZSBdICsgbGFiZWxzWyAxIF1bIG9yaWVudGF0aW9uLm1pblNpZGUgXSApIC8gMjtcclxuXHJcbiAgICAgIGxhYmVsc1sgMCBdWyBvcmllbnRhdGlvbi5tYXhTaWRlIF0gPSBjZW50ZXIgLSBwYWQ7XHJcbiAgICAgIGxhYmVsc1sgMSBdWyBvcmllbnRhdGlvbi5taW5TaWRlIF0gPSBjZW50ZXIgKyBwYWQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgcGFydGl0aW9uIGxhYmVsIGZvciB0aGUgZ2l2ZW4gb3JpZW50YXRpb24uXHJcbiAgICogQHByaXZhdGVcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPFBhcnRpdGlvbj59IHBhcnRpdGlvblByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48UGFydGl0aW9uPn0gc2Vjb25kYXJ5UGFydGl0aW9uUHJvcGVydHkgLSBUaGUgcGFydGl0aW9uIHRoYXQgaXMgZW1wdHkgaWYgdGhlcmUgaXMgb25seSBvbmVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIHBhcnRpdGlvblxyXG4gICAqIEBwYXJhbSB7T3JpZW50YXRpb259IG9yaWVudGF0aW9uXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgY3JlYXRlUGFydGl0aW9uTGFiZWwoIHBhcnRpdGlvblByb3BlcnR5LCBzZWNvbmRhcnlQYXJ0aXRpb25Qcm9wZXJ0eSwgaW5kZXgsIG9yaWVudGF0aW9uICkge1xyXG4gICAgY29uc3QgdGV4dCA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICBmb250OiBBcmVhTW9kZWxDb21tb25Db25zdGFudHMuUFJPUE9SVElPTkFMX1BBUlRJVElPTl9SRUFET1VUX0ZPTlQsXHJcbiAgICAgIGZpbGw6IG5ldyBEeW5hbWljUHJvcGVydHkoIHBhcnRpdGlvblByb3BlcnR5LCB7IGRlcml2ZTogJ2NvbG9yUHJvcGVydHknIH0gKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsQ29udGFpbmVyID0gbmV3IE5vZGUoIHtcclxuICAgICAgY2hpbGRyZW46IFsgdGV4dCBdXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGV4dCBsYWJlbFxyXG4gICAgbmV3IER5bmFtaWNQcm9wZXJ0eSggcGFydGl0aW9uUHJvcGVydHksIHtcclxuICAgICAgZGVyaXZlOiAnc2l6ZVByb3BlcnR5J1xyXG4gICAgfSApLmxpbmsoIHNpemUgPT4ge1xyXG4gICAgICBpZiAoIHNpemUgPT09IG51bGwgKSB7XHJcbiAgICAgICAgdGV4dC5zdHJpbmcgPSAnJztcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0ZXh0LnN0cmluZyA9IHNpemUudG9SaWNoU3RyaW5nKCBmYWxzZSApO1xyXG4gICAgICAgIHRleHRbIG9yaWVudGF0aW9uLmNlbnRlckNvb3JkaW5hdGUgXSA9IDA7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBTZWNvbmRhcnkgY29vcmRpbmF0ZVxyXG4gICAgaWYgKCBvcmllbnRhdGlvbiA9PT0gT3JpZW50YXRpb24uSE9SSVpPTlRBTCApIHtcclxuICAgICAgbGFiZWxDb250YWluZXIudG9wID0gQXJlYU1vZGVsQ29tbW9uQ29uc3RhbnRzLlBST1BPUlRJT05BTF9SQU5HRV9PRkZTRVQueSArIDQ7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgbGFiZWxDb250YWluZXIubGVmdCA9IEFyZWFNb2RlbENvbW1vbkNvbnN0YW50cy5QUk9QT1JUSU9OQUxfUkFOR0VfT0ZGU0VULnggKyA2O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcnRpdGlvblZpc2libGVQcm9wZXJ0eSA9IG5ldyBEeW5hbWljUHJvcGVydHkoIHBhcnRpdGlvblByb3BlcnR5LCB7IGRlcml2ZTogJ3Zpc2libGVQcm9wZXJ0eScgfSApO1xyXG4gICAgY29uc3Qgc2Vjb25kYXJ5UGFydGl0aW9uU2l6ZVByb3BlcnR5ID0gbmV3IER5bmFtaWNQcm9wZXJ0eSggc2Vjb25kYXJ5UGFydGl0aW9uUHJvcGVydHksIHsgZGVyaXZlOiAnc2l6ZVByb3BlcnR5JyB9ICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayhcclxuICAgICAgWyBwYXJ0aXRpb25WaXNpYmxlUHJvcGVydHksIHNlY29uZGFyeVBhcnRpdGlvblNpemVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHZpc2libGUsIHNlY29uZGFyeVNpemUgKSA9PiB7XHJcbiAgICAgICAgbGFiZWxDb250YWluZXIudmlzaWJsZSA9IHZpc2libGUgJiYgc2Vjb25kYXJ5U2l6ZSAhPT0gbnVsbDtcclxuICAgICAgfSApO1xyXG5cclxuICAgIHJldHVybiBsYWJlbENvbnRhaW5lcjtcclxuICB9XHJcbn1cclxuXHJcbmFyZWFNb2RlbENvbW1vbi5yZWdpc3RlciggJ1Byb3BvcnRpb25hbEFyZWFEaXNwbGF5Tm9kZScsIFByb3BvcnRpb25hbEFyZWFEaXNwbGF5Tm9kZSApO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgUHJvcG9ydGlvbmFsQXJlYURpc3BsYXlOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLGVBQWUsTUFBTSx3Q0FBd0M7QUFDcEUsT0FBT0MsU0FBUyxNQUFNLGtDQUFrQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLFdBQVcsTUFBTSwrQ0FBK0M7QUFDdkUsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDekUsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxzQkFBc0IsTUFBTSxpQ0FBaUM7QUFDcEUsT0FBT0Msd0JBQXdCLE1BQU0sMENBQTBDO0FBQy9FLE9BQU9DLGVBQWUsTUFBTSxzQ0FBc0M7QUFDbEUsT0FBT0MscUJBQXFCLE1BQU0sNENBQTRDO0FBQzlFLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyw2QkFBNkIsTUFBTSxvQ0FBb0M7QUFDOUUsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLDZCQUE2QixNQUFNLG9DQUFvQztBQUM5RSxPQUFPQyxhQUFhLE1BQU0sb0JBQW9C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