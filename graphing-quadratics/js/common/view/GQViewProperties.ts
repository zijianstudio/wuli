// Copyright 2018-2023, University of Colorado Boulder

/**
 * View-specific Properties and properties that are common to more than one screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import graphingQuadratics from '../../graphingQuadratics.js';

export type EquationForm = 'standard' | 'vertex';

type SelfOptions = {

  // form of equations used to label curves on the graph
  equationForm?: EquationForm;

  // Initial values for optional boolean Properties. A null value means to omit the corresponding Property.
  // These options were added because code reviewers did not like these Properties duplicated in subclasses.
  // See https://github.com/phetsims/graphing-quadratics/issues/55
  vertexVisible?: boolean | null;
  axisOfSymmetryVisible?: boolean | null;
  coordinatesVisible?: boolean | null;
};

type GQViewPropertiesOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class GQViewProperties extends PhetioObject {

  // Form of equations used to label curves. It is not necessary to expose this via PhET-iO.
  public readonly equationForm: EquationForm;

  // Properties that are used by all screens
  public readonly graphContentsVisibleProperty: Property<boolean>;
  public readonly equationAccordionBoxExpandedProperty: Property<boolean>;
  public readonly equationsVisibleProperty: Property<boolean>;

  // Properties that are optional: used by 2 or more screens, but not all screens
  public readonly vertexVisibleProperty?: Property<boolean>;
  public readonly axisOfSymmetryVisibleProperty?: Property<boolean>;
  public readonly coordinatesVisibleProperty?: Property<boolean>;

  public constructor( providedOptions: GQViewPropertiesOptions ) {

    const options = optionize<GQViewPropertiesOptions, SelfOptions, PhetioObjectOptions>()( {

      // SelfOptions
      equationForm: 'standard',
      vertexVisible: null,
      axisOfSymmetryVisible: null,
      coordinatesVisible: null,

      // PhetioObjectOptions
      phetioDocumentation: 'Properties that are specific to the view',
      phetioState: false
    }, providedOptions );

    super( options );

    this.equationForm = options.equationForm;

    this.graphContentsVisibleProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'graphContentsVisibleProperty' ),
      phetioDocumentation: 'whether the contents of the graph (curves, plotted points, manipulators) are visible'
    } );

    this.equationAccordionBoxExpandedProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'equationAccordionBoxExpandedProperty' ),
      phetioDocumentation: 'whether the equation accordion box is expanded'
    } );

    this.equationsVisibleProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'equationsVisibleProperty' ),
      phetioDocumentation: 'whether equations are visible on graphed curves'
    } );

    if ( options.vertexVisible !== null ) {
      this.vertexVisibleProperty = new BooleanProperty( options.vertexVisible, {
        tandem: options.tandem.createTandem( 'vertexVisibleProperty' ),
        phetioDocumentation: 'whether the vertex point or manipulator is visible'
      } );
    }

    if ( options.axisOfSymmetryVisible !== null ) {
      this.axisOfSymmetryVisibleProperty = new BooleanProperty( options.axisOfSymmetryVisible, {
        tandem: options.tandem.createTandem( 'axisOfSymmetryVisibleProperty' ),
        phetioDocumentation: 'whether the axis of symmetry is visible'
      } );
    }

    if ( options.coordinatesVisible !== null ) {
      this.coordinatesVisibleProperty = new BooleanProperty( options.coordinatesVisible, {
        tandem: options.tandem.createTandem( 'coordinatesVisibleProperty' ),
        phetioDocumentation: 'whether (x,y) coordinates are visible on points that are displayed on the graph'
      } );
    }
  }

  public reset(): void {

    // Properties that are common to all screens
    this.graphContentsVisibleProperty.reset();
    this.equationAccordionBoxExpandedProperty.reset();
    this.equationsVisibleProperty.reset();

    // Properties that are optional
    this.vertexVisibleProperty && this.vertexVisibleProperty.reset();
    this.axisOfSymmetryVisibleProperty && this.axisOfSymmetryVisibleProperty.reset();
    this.coordinatesVisibleProperty && this.coordinatesVisibleProperty.reset();
  }
}

graphingQuadratics.register( 'GQViewProperties', GQViewProperties );