// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for the 'Two Variables' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import EqualityExplorerScene from '../../../../equality-explorer/js/common/model/EqualityExplorerScene.js';
import EqualityExplorerScreenView from '../../../../equality-explorer/js/common/view/EqualityExplorerScreenView.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import equalityExplorerTwoVariables from '../../equalityExplorerTwoVariables.js';
import TwoVariablesModel from '../model/TwoVariablesModel.js';
import TwoVariablesSceneNode, { TwoVariablesSceneNodeOptions } from './TwoVariablesSceneNode.js';

export default class TwoVariablesScreenView extends EqualityExplorerScreenView {

  public constructor( model: TwoVariablesModel, tandem: Tandem ) {
    super( model, tandem );
  }

  /**
   * Creates the Node for this scene.
   */
  protected override createSceneNode( scene: EqualityExplorerScene,
                                      equationAccordionBoxExpandedProperty: Property<boolean>,
                                      snapshotsAccordionBoxExpandedProperty: Property<boolean>,
                                      layoutBounds: Bounds2,
                                      providedOptions: TwoVariablesSceneNodeOptions ): TwoVariablesSceneNode {
    return new TwoVariablesSceneNode( scene, equationAccordionBoxExpandedProperty,
      snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions );
  }
}

equalityExplorerTwoVariables.register( 'TwoVariablesScreenView', TwoVariablesScreenView );