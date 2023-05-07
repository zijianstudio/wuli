// Copyright 2023, University of Colorado Boulder

/**
 * Draws a vector for a Body, such as a force vector or velocity vector.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import Body from '../model/Body.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import ArrowNode, { ArrowNodeOptions } from '../../../scenery-phet/js/ArrowNode.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import optionize from '../../../phet-core/js/optionize.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import solarSystemCommon from '../solarSystemCommon.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';

type SelfOptions = {
  constrainSize?: boolean;
};

// Determines if the vector exceeds the min or max values, used only if constrainSize is true
class OversizeType extends EnumerationValue {
  public static readonly NONE = new OversizeType();
  public static readonly BIGGER = new OversizeType();
  public static readonly SMALLER = new OversizeType();

  public static readonly enumeration = new Enumeration( OversizeType );
}

export type VectorNodeOptions = ArrowNodeOptions & SelfOptions;

export default class VectorNode extends ArrowNode {
  protected readonly tipProperty: TReadOnlyProperty<Vector2>;
  protected readonly tailProperty: TReadOnlyProperty<Vector2>;
  private oversizeType: OversizeType = OversizeType.NONE;

  public constructor(
    body: Body,
    transformProperty: TReadOnlyProperty<ModelViewTransform2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    vectorProperty: TReadOnlyProperty<Vector2>,
    forceScaleProperty: TReadOnlyProperty<number>,
    providedOptions?: VectorNodeOptions
  ) {

    const options = optionize<VectorNodeOptions, SelfOptions, ArrowNodeOptions>()( {
      // Self options
      constrainSize: false,

      headHeight: 15,
      headWidth: 15,
      tailWidth: 5,
      stroke: '#404040',
      boundsMethod: 'none',
      isHeadDynamic: true,
      scaleTailToo: true,
      visibleProperty: visibleProperty
    }, providedOptions );

    super( 0, 0, 0, 0, options );

    this.tailProperty = new DerivedProperty( [ body.positionProperty, transformProperty ],
      ( bodyPosition, transform ) => {
        return transform.modelToViewPosition( bodyPosition );
      } );

    this.tipProperty = new DerivedProperty( [ this.tailProperty, vectorProperty, transformProperty, forceScaleProperty ],
      ( tail, vector, transform, forceScale ) => {
        // forceScale currently goes from -2 to 8, where -2 is scaling down for big vectors ~100 units of force
        // and 8 is scaling up for small vectors ~1/100000000 units of force
        const magnitudeLog = vector.magnitude ? Math.log10( vector.magnitude / 500 ) : -forceScale;
        if ( magnitudeLog > -forceScale + 1.5 ) {
          this.oversizeType = OversizeType.BIGGER;
          // body.forceOffscaleProperty.value = true;
        }
        else if ( magnitudeLog < -forceScale - 0.4 ) {
          this.oversizeType = OversizeType.SMALLER;
          body.forceOffscaleProperty.value = true;
        }
        else {
          this.oversizeType = OversizeType.NONE;
          body.forceOffscaleProperty.value = false;
        }
        const finalTip = vector.times( 0.05 * Math.pow( 10, forceScale ) );
        if ( finalTip.magnitude > 1e4 ) {
          finalTip.setMagnitude( 1e4 );
          body.forceOffscaleProperty.value = false;
        }
        const finalPosition = transform.modelToViewDelta( finalTip ).plus( tail );
        return finalPosition;
      } );

    Multilink.multilink( [ this.tailProperty, this.tipProperty ], ( tail, tip ) => {
      this.setTailAndTip( tail.x, tail.y, tip.x, tip.y );
      this.localBounds = Bounds2.point( tail ).addPoint( tip ).dilated( 10 ); // must set because boundsMethod: 'none'.
    } );
  }

  public override dispose(): void {
    this.tailProperty.dispose();
    this.tipProperty.dispose();

    super.dispose();
  }
}

solarSystemCommon.register( 'VectorNode', VectorNode );