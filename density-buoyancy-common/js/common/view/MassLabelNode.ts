// Copyright 2019-2023, University of Colorado Boulder

/**
 * A label shown in front of a mass that shows its mass-value.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Multilink from '../../../../axon/js/Multilink.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import NodeTexture from '../../../../mobius/js/NodeTexture.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { ManualConstraint, Node, Rectangle, Text, TPaint } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import DensityBuoyancyCommonStrings from '../../DensityBuoyancyCommonStrings.js';
import DensityBuoyancyCommonConstants from '../DensityBuoyancyCommonConstants.js';
import Mass from '../model/Mass.js';
import DensityBuoyancyCommonColors from './DensityBuoyancyCommonColors.js';
import LabelTexture from './LabelTexture.js';

// constants
const MASS_LABEL_SIZE = 32;
const createMassLabel = ( string: TReadOnlyProperty<string>, fill: TPaint ) => {
  const rectangle = new Rectangle( 0, 0, MASS_LABEL_SIZE, MASS_LABEL_SIZE, {
    cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
    fill: fill
  } );
  const label = new Text( string, {
    font: new PhetFont( { size: 24, weight: 'bold' } ),
    fill: 'white',
    center: rectangle.center,
    maxWidth: 30
  } );
  label.localBoundsProperty.link( () => {
    label.center = rectangle.center;
  } );
  rectangle.addChild( label );
  return rectangle;
};

const PRIMARY_LABEL_DEPENDENCIES = [ DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, DensityBuoyancyCommonColors.labelAProperty ];
const SECONDARY_LABEL_DEPENDENCIES = [ DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, DensityBuoyancyCommonColors.labelBProperty ];

const PRIMARY_LABEL = createMassLabel( DensityBuoyancyCommonStrings.massLabel.primaryStringProperty, DensityBuoyancyCommonColors.labelAProperty );
const SECONDARY_LABEL = createMassLabel( DensityBuoyancyCommonStrings.massLabel.secondaryStringProperty, DensityBuoyancyCommonColors.labelBProperty );

export default class MassLabelNode extends Node {

  public readonly mass: Mass;
  private readonly showMassesProperty: TReadOnlyProperty<boolean>;
  private readonly showMassesListener: ( n: boolean ) => void;
  private readonly readoutStringProperty: TReadOnlyProperty<string>;

  public constructor( mass: Mass, showMassesProperty: TReadOnlyProperty<boolean> ) {
    super( {
      pickable: false
    } );

    this.readoutStringProperty = new PatternStringProperty( DensityBuoyancyCommonStrings.kilogramsPatternStringProperty, {
      kilograms: mass.massProperty
    }, {
      decimalPlaces: 2
    } );

    const readoutText = new Text( this.readoutStringProperty, {
      font: new PhetFont( {
        size: 18
      } ),
      maxWidth: 70
    } );
    const readoutPanel = new Panel( readoutText, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      xMargin: 4,
      yMargin: 4
    } );

    this.addChild( readoutPanel );

    this.mass = mass;
    this.showMassesProperty = showMassesProperty;

    // Keep it centered
    ManualConstraint.create( this, [ readoutPanel ], readoutWrapper => {
      readoutWrapper.center = Vector2.ZERO;
    } );

    this.showMassesListener = shown => {
      readoutPanel.visible = shown;
    };

    this.showMassesProperty.link( this.showMassesListener );
  }

  /**
   * Releases references.
   */
  public override dispose(): void {
    this.showMassesProperty.unlink( this.showMassesListener );
    this.readoutStringProperty.dispose();

    super.dispose();
  }

  /**
   * Returns a NodeTexture for the primary.
   */
  public static getPrimaryTexture(): NodeTexture {
    const texture = new LabelTexture( PRIMARY_LABEL );

    // @ts-expect-error
    const multilink = Multilink.multilink( PRIMARY_LABEL_DEPENDENCIES, () => texture.update() );
    texture.disposedEmitter.addListener( () => multilink.dispose() );

    return texture;
  }

  /**
   * Returns a NodeTexture for the secondary.
   */
  public static getSecondaryTexture(): NodeTexture {
    const texture = new LabelTexture( SECONDARY_LABEL );

    // @ts-expect-error
    const multilink = Multilink.multilink( SECONDARY_LABEL_DEPENDENCIES, () => texture.update() );
    texture.disposedEmitter.addListener( () => multilink.dispose() );

    return texture;
  }

  /**
   * Returns a basic texture for a given (short) string label.
   */
  public static getBasicLabelTexture( string: string ): NodeTexture {
    const label = new Text( string, {
      font: new PhetFont( { size: 24, weight: 'bold' } ),
      maxWidth: 100
    } );
    const rectangle = new Rectangle( 0, 0, label.width + 5, label.height + 3, {
      cornerRadius: DensityBuoyancyCommonConstants.CORNER_RADIUS,
      fill: 'white'
    } );
    label.center = rectangle.center;
    rectangle.addChild( label );

    return new LabelTexture( rectangle );
  }
}

densityBuoyancyCommon.register( 'MassLabelNode', MassLabelNode );
export { PRIMARY_LABEL, SECONDARY_LABEL };
