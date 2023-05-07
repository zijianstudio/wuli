// Copyright 2022-2023, University of Colorado Boulder

/**
 * Supports any combination of checkboxes for each of the screens for the bottom objects.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import centerAndVariability from '../../centerAndVariability.js';
import VerticalCheckboxGroup, { VerticalCheckboxGroupItem } from '../../../../sun/js/VerticalCheckboxGroup.js';
import { AlignGroup, GridBox, Node, TColor, Text } from '../../../../scenery/js/imports.js';
import CAVConstants from '../CAVConstants.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import CAVColors from '../CAVColors.js';
import NumberLineNode from './NumberLineNode.js';
import PredictionThumbNode from './PredictionThumbNode.js';
import LinkableProperty from '../../../../axon/js/LinkableProperty.js';
import VariabilityModel from '../../variability/model/VariabilityModel.js';
import CAVModel from '../model/CAVModel.js';
import MeanAndMedianModel from '../../mean-and-median/model/MeanAndMedianModel.js';

// constants
const TEXT_OPTIONS = {
  font: CAVConstants.MAIN_FONT,
  maxWidth: CAVConstants.CHECKBOX_TEXT_MAX_WIDTH
};

export default class BottomRepresentationCheckboxGroup extends VerticalCheckboxGroup {

  private static createGridBox( text: Node, icon: Node, iconGroup: AlignGroup ): GridBox {
    return new GridBox( {
      stretch: true,
      spacing: 5,
      grow: 1,
      rows: [ [
        new Node( { children: [ text ], layoutOptions: { xAlign: 'left' } } ),
        iconGroup.createBox( icon, { layoutOptions: { xAlign: 'right' }, xAlign: 'center' } )
      ] ]
    } );
  }

  public static getVariabilityCheckboxItem( alignGroup: AlignGroup, model: VariabilityModel ): VerticalCheckboxGroupItem {
    return {
      createNode: ( tandem: Tandem ) => {
        return BottomRepresentationCheckboxGroup.createGridBox(
          new Text( CenterAndVariabilityStrings.variabilityStringProperty, TEXT_OPTIONS ),
          NumberLineNode.createMeanIndicatorNode( true, true ),
          alignGroup
        );
      },
      property: model.isShowingPlayAreaVariabilityProperty,
      tandemName: 'variabilityCheckbox'
    };
  }

  public static getMedianCheckboxItem( alignGroup: AlignGroup, model: CAVModel ): VerticalCheckboxGroupItem {
    return {
      createNode: ( tandem: Tandem ) => {
        return BottomRepresentationCheckboxGroup.createGridBox(
          new Text( CenterAndVariabilityStrings.medianStringProperty, TEXT_OPTIONS ),
          new ArrowNode( 0, 0, 0, 27, {
            fill: CAVColors.medianColorProperty,
            stroke: CAVColors.arrowStrokeProperty,
            lineWidth: CAVConstants.ARROW_LINE_WIDTH,
            headHeight: 12,
            headWidth: 18,
            maxHeight: 20
          } ), alignGroup );
      },
      property: model.isShowingPlayAreaMedianProperty,
      tandemName: 'medianCheckbox'
    };
  }

  public static getMeanCheckboxItem( alignGroup: AlignGroup, model: CAVModel ): VerticalCheckboxGroupItem {
    return {
      createNode: ( tandem: Tandem ) => BottomRepresentationCheckboxGroup.createGridBox( new Text( CenterAndVariabilityStrings.meanStringProperty, TEXT_OPTIONS ),
        NumberLineNode.createMeanIndicatorNode( true, true ), alignGroup ),
      property: model.isShowingPlayAreaMeanProperty,
      tandemName: 'meanCheckbox'
    };
  }

  private static createPredictionItem( property: Property<boolean>, stringProperty: LinkableProperty<string>, color: TColor, spacing: number,
                                       tandemName: string, alignGroup: AlignGroup ): VerticalCheckboxGroupItem {
    return {
      createNode: ( tandem: Tandem ) => {
        return BottomRepresentationCheckboxGroup.createGridBox(
          new Text( stringProperty, TEXT_OPTIONS ),
          new PredictionThumbNode( { color: color, maxHeight: 20, pickable: false } ),
          alignGroup );
      },
      property: property,
      tandemName: tandemName
    };
  }

  public static getPredictMedianCheckboxItem( alignGroup: AlignGroup, model: CAVModel ): VerticalCheckboxGroupItem {
    return BottomRepresentationCheckboxGroup.createPredictionItem(
      model.isShowingMedianPredictionProperty,
      CenterAndVariabilityStrings.predictMedianStringProperty,
      CAVColors.medianColorProperty,
      8,
      'predictMedianCheckbox',
      alignGroup
    );
  }

  public static getPredictMeanCheckboxItem( alignGroup: AlignGroup, model: MeanAndMedianModel ): VerticalCheckboxGroupItem {
    return BottomRepresentationCheckboxGroup.createPredictionItem(
      model.isShowingMeanPredictionProperty,
      CenterAndVariabilityStrings.predictMeanStringProperty,
      CAVColors.meanColorProperty,
      20.3,
      'predictMeanCheckbox',
      alignGroup
    );
  }
}

centerAndVariability.register( 'BottomRepresentationCheckboxGroup', BottomRepresentationCheckboxGroup );