// Copyright 2022-2023, University of Colorado Boulder

/**
 * ScreenView for the "Mean and Median" Screen
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import centerAndVariability from '../../centerAndVariability.js';
import MeanAndMedianModel from '../model/MeanAndMedianModel.js';
import CAVColors from '../../common/CAVColors.js';
import CenterAndVariabilityStrings from '../../CenterAndVariabilityStrings.js';
import { AlignGroup } from '../../../../scenery/js/imports.js';
import Range from '../../../../dot/js/Range.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import CAVScreenView, { CAVScreenViewOptions } from '../../common/view/CAVScreenView.js';
import MeanAndMedianAccordionBox from './MeanAndMedianAccordionBox.js';
import BottomRepresentationCheckboxGroup from '../../common/view/BottomRepresentationCheckboxGroup.js';
import CAVConstants from '../../common/CAVConstants.js';
import PredictionSlider from '../../common/view/PredictionSlider.js';
import Property from '../../../../axon/js/Property.js';

type MeanAndMedianScreenViewOptions = StrictOmit<CAVScreenViewOptions, 'questionBarOptions'>;

export default class MeanAndMedianScreenView extends CAVScreenView {

  public constructor( model: MeanAndMedianModel, providedOptions: MeanAndMedianScreenViewOptions ) {

    const options = optionize<MeanAndMedianScreenViewOptions, EmptySelfOptions, CAVScreenViewOptions>()( {
      questionBarOptions: {
        barFill: CAVColors.meanAndMedianQuestionBarFillColorProperty,
        questionString: CenterAndVariabilityStrings.meanAndMedianQuestionStringProperty
      }
    }, providedOptions );

    super( model, options );

    this.setAccordionBoxWithAlignedContent( new MeanAndMedianAccordionBox( model, this.layoutBounds, options.tandem.createTandem( 'accordionBox' ), this.questionBar.bottom + CAVConstants.SCREEN_VIEW_Y_MARGIN, this.playAreaNumberLineNode ) );

    const iconGroup = new AlignGroup();
    super.setBottomCheckboxGroup( [
      BottomRepresentationCheckboxGroup.getPredictMedianCheckboxItem( iconGroup, model ),
      BottomRepresentationCheckboxGroup.getPredictMeanCheckboxItem( iconGroup, model ),
      BottomRepresentationCheckboxGroup.getMedianCheckboxItem( iconGroup, model ),
      BottomRepresentationCheckboxGroup.getMeanCheckboxItem( iconGroup, model )
    ] );

    this.contentLayer.addChild( new PredictionSlider( model.meanPredictionProperty, this.modelViewTransform, CAVConstants.PHYSICAL_RANGE, {
      predictionThumbNodeOptions: {
        color: CAVColors.meanColorProperty
      },
      valueProperty: model.meanPredictionProperty,
      enabledRangeProperty: new Property<Range>( CAVConstants.PHYSICAL_RANGE ),
      roundToInterval: null, // continuous
      visibleProperty: model.isShowingMeanPredictionProperty,
      tandem: options.tandem.createTandem( 'meanPredictionNode' )
    } ) );
    this.contentLayer.addChild( CAVScreenView.createMedianPredictionNode(
      model,
      this.modelViewTransform,
      options.tandem.createTandem( 'medianPredictionNode' )
    ) );
  }
}

centerAndVariability.register( 'MeanAndMedianScreenView', MeanAndMedianScreenView );