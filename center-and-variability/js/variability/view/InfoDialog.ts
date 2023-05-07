// Copyright 2023, University of Colorado Boulder

import centerAndVariability from '../../centerAndVariability.js';
import VariabilityModel from '../model/VariabilityModel.js';
import Dialog from '../../../../sun/js/Dialog.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import VariabilityMeasure from '../model/VariabilityMeasure.js';
import RangeInfoNode from './RangeInfoNode.js';
import IQRInfoNode from './IQRInfoNode.js';
import MADInfoNode from './MADInfoNode.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import VariabilitySceneModel from '../model/VariabilitySceneModel.js';

export default class InfoDialog extends Dialog {
  public constructor( model: VariabilityModel, sceneModel: VariabilitySceneModel, options: PickRequired<PhetioObject, 'tandem'> ) {

    const content = new ToggleNode( model.selectedVariabilityProperty, [ {
      value: VariabilityMeasure.RANGE,
      createNode: tandem => new RangeInfoNode( model, sceneModel, { tandem: tandem } ),
      tandemName: 'rangeInfoNode'
    }, {
      value: VariabilityMeasure.IQR,
      createNode: tandem => new IQRInfoNode( model, sceneModel, { tandem: tandem } ),
      tandemName: 'iqrInfoNode'
    }, {
      value: VariabilityMeasure.MAD,
      createNode: tandem => new MADInfoNode( model, sceneModel, { tandem: tandem } ),
      tandemName: 'madInfoNode'
    } ], {
      tandem: options.tandem.createTandem( 'infoNode' )
    } );

    super( content, {

      // TODO: It seems there are 2 ways to hide the dialog. Is there a better way?
      hideCallback: () => model.isInfoShowingProperty.set( false )
    } );
  }
}

centerAndVariability.register( 'InfoDialog', InfoDialog );