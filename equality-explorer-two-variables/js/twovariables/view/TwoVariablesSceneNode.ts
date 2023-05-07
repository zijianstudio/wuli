// Copyright 2018-2022, University of Colorado Boulder

/**
 * View of a scene in the 'Two Variables' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import EqualityExplorerScene from '../../../../equality-explorer/js/common/model/EqualityExplorerScene.js';
import VariablesSceneNode, { VariablesSceneNodeOptions } from '../../../../equality-explorer/js/variables/view/VariablesSceneNode.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import equalityExplorerTwoVariables from '../../equalityExplorerTwoVariables.js';

type SelfOptions = EmptySelfOptions;

export type TwoVariablesSceneNodeOptions = SelfOptions & VariablesSceneNodeOptions;

export default class TwoVariablesSceneNode extends VariablesSceneNode {

  public constructor( scene: EqualityExplorerScene,
                      equationAccordionBoxExpandedProperty: Property<boolean>,
                      snapshotsAccordionBoxExpandedProperty: Property<boolean>,
                      layoutBounds: Bounds2,
                      providedOptions: TwoVariablesSceneNodeOptions ) {

    const options = optionize<TwoVariablesSceneNodeOptions, SelfOptions, VariablesSceneNodeOptions>()( {

      // VariablesSceneNode options
      termsToolboxContentSize: new Dimension2( 270, 50 ),
      termsToolboxSpacing: 12, // horizontal spacing between terms in the toolbox
      snapshotControlOptions: {
        orientation: 'vertical', // put variable values below equations in Snapshots
        controlHeight: 70 // height of each snapshot, a bit taller than default since values are below equations
      }
    }, providedOptions );

    super( scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, options );
  }
}

equalityExplorerTwoVariables.register( 'TwoVariablesSceneNode', TwoVariablesSceneNode );