// Copyright 2023, University of Colorado Boulder

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { HBox, HSeparator, Text, VBox } from '../../../../scenery/js/imports.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import VariabilityModel from '../model/VariabilityModel.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import centerAndVariability from '../../centerAndVariability.js';
import Utils from '../../../../dot/js/Utils.js';
import CAVConstants from '../../common/CAVConstants.js';
import MADNode from './MADNode.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import VariabilitySceneModel from '../model/VariabilitySceneModel.js';

export default class MADInfoNode extends VBox {
  public constructor( model: VariabilityModel, sceneModel: VariabilitySceneModel, options: PickRequired<PhetioObject, 'tandem'> ) {

    // TODO: The design calls for a depiction of the mean location.  This is not yet implemented.
    const hasEnoughDataProperty = new DerivedProperty( [ sceneModel.numberOfDataPointsProperty ], numberOfDataPoints => numberOfDataPoints >= 1 );

    const numeratorText = new Text( '', { fontSize: 16 } );
    const denominatorText = new Text( '', { fontSize: 16 } );

    const resultNumeratorText = new Text( '', { fontSize: 16 } );
    const resultDenominatorText = new Text( '', { fontSize: 16 } );

    sceneModel.objectChangedEmitter.addListener( () => {
      const values = sceneModel.getSortedLandedObjects().map( landedObject => landedObject.valueProperty.value! );
      const mads = values.map( value => Math.abs( value - sceneModel.meanValueProperty.value! ) );
      const madStrings = mads.map( mad => Utils.toFixed( mad, 1 ) );
      numeratorText.string = madStrings.join( ' + ' );
      denominatorText.string = values.length.toString();

      // TODO: Due to rounding, these values could not add up correctly, see https://github.com/phetsims/center-and-variability/issues/169
      const sum = _.reduce( mads, ( sum, mad ) => sum + mad, 0 );
      resultNumeratorText.string = Utils.toFixed( sum, 1 );
      resultDenominatorText.string = values.length.toString();
    } );

    const calculationFraction = new VBox( {
      children: [ numeratorText, new HSeparator(), denominatorText ],
      align: 'center'
    } );

    const resultFraction = new VBox( {
      children: [ resultNumeratorText, new HSeparator(), resultDenominatorText ],
      align: 'center'
    } );

    super( {
      align: 'left',
      spacing: 6,
      children: [
        new Text( CenterAndVariabilityStrings.meanAbsoluteDeviationMADStringProperty, {
          fontSize: 25,
          maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH,
          layoutOptions: { bottomMargin: 10 }
        } ),
        new Text( CenterAndVariabilityStrings.madDescriptionStringProperty, {
          fontSize: 18,
          maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH,
          layoutOptions: { bottomMargin: 10 }
        } ),
        new HBox( {
          spacing: 10,
          children: [
            new Text( CenterAndVariabilityStrings.madEqualsStringProperty, { fontSize: 18 } ),
            calculationFraction,
            new Text( MathSymbols.EQUAL_TO, { fontSize: 18 } ),
            resultFraction
          ],
          visibleProperty: hasEnoughDataProperty
        } ),

        new Text( new PatternStringProperty( CenterAndVariabilityStrings.madCalculationResultPatternStringProperty, {
          mad: new DerivedProperty( [ sceneModel.madValueProperty ], madValue => madValue === null ? null : Utils.toFixed( madValue, 1 ) )
        } ), { fontSize: 18, visibleProperty: hasEnoughDataProperty, maxWidth: CAVConstants.INFO_DIALOG_MAX_TEXT_WIDTH, layoutOptions: { bottomMargin: 10 } } ),

        new MADNode( model, sceneModel, {
          parentContext: 'info',
          tandem: options.tandem.createTandem( 'madNode' )
        } )
      ]
    } );
  }
}

centerAndVariability.register( 'MADInfoNode', MADInfoNode );