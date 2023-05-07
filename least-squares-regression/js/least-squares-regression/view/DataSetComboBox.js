// Copyright 2014-2023, University of Colorado Boulder

/**
 * Combo box for selecting a dataSet.
 *
 * @author Martin Veillette (Berea College)
 */

import { Text } from '../../../../scenery/js/imports.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import leastSquaresRegression from '../../leastSquaresRegression.js';
import LeastSquaresRegressionConstants from '../LeastSquaresRegressionConstants.js';

class DataSetComboBox extends ComboBox {

  /**
   * @param {Property.<DataSet>} selectedDataSetProperty
   * @param {Array.<DataSet>} dataSets
   * @param {Node} dataSetListParent
   * @param {number} maxTextWidth - max width of text in the combo box
   * @constructor
   */
  constructor( selectedDataSetProperty, dataSets, dataSetListParent, maxTextWidth ) {

    // {ComboBoxItem[]}
    const items = dataSets.map( dataSet => createItem( dataSet, maxTextWidth ) );

    super( selectedDataSetProperty, items, dataSetListParent, {
      listPosition: 'below',
      highlightFill: LeastSquaresRegressionConstants.ITEM_HIGHLIGHT_FILL,
      buttonLineWidth: 1,
      xMargin: 14,
      yMargin: 8,
      cornerRadius: LeastSquaresRegressionConstants.SMALL_PANEL_CORNER_RADIUS
    } );
  }
}

leastSquaresRegression.register( 'DataSetComboBox', DataSetComboBox );

/**
 * Creates an item for the combo box.
 * @param {DataSet} dataSet
 * @param {number} maxTextWidth
 * @returns {ComboBoxItem}
 */
function createItem( dataSet, maxTextWidth ) {
  return {
    value: dataSet,
    createNode: () => new Text( dataSet.name, {
      font: LeastSquaresRegressionConstants.TEXT_FONT,
      maxWidth: maxTextWidth
    } )
  };
}

export default DataSetComboBox;