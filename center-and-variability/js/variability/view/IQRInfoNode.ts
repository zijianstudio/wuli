// Copyright 2023, University of Colorado Boulder

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { Node, Circle, Rectangle, Text, VBox, HBox } from '../../../../scenery/js/imports.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import VariabilityModel from '../model/VariabilityModel.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import centerAndVariability from '../../centerAndVariability.js';
import CAVConstants from '../../common/CAVConstants.js';
import IQRNode from './IQRNode.js';
import VariabilitySceneModel from '../model/VariabilitySceneModel.js';
import CAVColors from '../../common/CAVColors.js';

export default class IQRInfoNode extends VBox {
  public constructor( model: VariabilityModel, sceneModel: VariabilitySceneModel, options: PickRequired<PhetioObject, 'tandem'> ) {

    const hasAtLeastOneDataPointProperty = new DerivedProperty( [ sceneModel.numberOfDataPointsProperty ], numberOfDataPoints => numberOfDataPoints >= 1 );
    const hasEnoughDataForIQRProperty = new DerivedProperty( [ sceneModel.numberOfDataPointsProperty ], numberOfDataPoints => numberOfDataPoints >= 5 );

    const dataValuesLabel = new Text( CenterAndVariabilityStrings.iqrDataValuesStringProperty, {
      visibleProperty: hasAtLeastOneDataPointProperty,
      fontSize: 18,
      maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH
    } );

    const dataValueNode = ( distance: number, isLastValue: boolean, isMedian: boolean, isQuartile: boolean ) => {
      const distanceLabelNode = new Node();
      const dataValueText = new Text( distance, { fontSize: 18, centerX: 0, centerY: 0 } );

      if ( isMedian ) {
        const MEDIAN_UNDERLINE_RECT_WIDTH = 16;
        const underlineRect = new Rectangle( -0.5 * MEDIAN_UNDERLINE_RECT_WIDTH, 8, MEDIAN_UNDERLINE_RECT_WIDTH, 3, { fill: CAVColors.medianColorProperty } );
        distanceLabelNode.addChild( underlineRect );
      }

      if ( isQuartile ) {
        const backgroundCircle = new Circle( 14, { fill: CAVColors.quartileColorProperty } );
        distanceLabelNode.addChild( backgroundCircle );
      }

      distanceLabelNode.addChild( dataValueText );

      const dataValueNodeChildren = [ distanceLabelNode ];

      if ( !isLastValue ) {
        dataValueNodeChildren.push( new Text( ',', { fontSize: 18 } ) );
      }

      return new Node( { children: dataValueNodeChildren } );
    };

    const dataValues: Node[] = [];
    const dataValuesContainer = new HBox( {
      spacing: 5,
      children: dataValues,
      layoutOptions: { leftMargin: 5 }
    } );
    const dataValuesDisplay = new HBox( {
      visibleProperty: hasAtLeastOneDataPointProperty,
      children: [
        dataValuesLabel,
        dataValuesContainer
      ]
    } );

    super( {
      align: 'left',
      children: [
        new Text( CenterAndVariabilityStrings.interquartileRangeIQRStringProperty, {
          fontSize: 25,
          maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH,
          layoutOptions: { bottomMargin: 5 }
        } ),

        new Text( CenterAndVariabilityStrings.iqrDescriptionStringProperty, {
          fontSize: 18,
          maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH,
          layoutOptions: { bottomMargin: 15 }
        } ),

        dataValuesDisplay,

        new Text( new PatternStringProperty( CenterAndVariabilityStrings.iqrCalculationPattern1StringProperty, {
          q1: sceneModel.q1ValueProperty,
          q3: sceneModel.q3ValueProperty
        } ), {
          fontSize: 18,
          visibleProperty: hasEnoughDataForIQRProperty,
          maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH,
          layoutOptions: { topMargin: 10 }
        } ),

        new Text( new PatternStringProperty( CenterAndVariabilityStrings.iqrCalculationPattern2StringProperty, {
          iqr: sceneModel.iqrValueProperty
        } ), { fontSize: 18, visibleProperty: hasEnoughDataForIQRProperty, maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH } ),

        new IQRNode( model, sceneModel, {
          parentContext: 'info',
          tandem: options.tandem.createTandem( 'iqrNode' ),
          layoutOptions: {
            topMargin: 50
          }
        } )
      ]
    } );

    const updateIQRInfoNode = () => {
      const sortedObjects = sceneModel.getSortedLandedObjects();
      const sortedData = sortedObjects.map( object => object.valueProperty.value );

      dataValuesContainer.setChildren( sortedData.map( ( dataValue, index ) => {
        const soccerBall = sortedObjects[ index ];
        return dataValueNode( dataValue!, index === sortedData.length - 1, soccerBall.isMedianObjectProperty.value,
          soccerBall.isQ1ObjectProperty.value || soccerBall.isQ3ObjectProperty.value );
      } ) );
    };

    sceneModel.objectChangedEmitter.addListener( updateIQRInfoNode );
    sceneModel.numberOfDataPointsProperty.link( updateIQRInfoNode );
  }
}

centerAndVariability.register( 'IQRInfoNode', IQRInfoNode );