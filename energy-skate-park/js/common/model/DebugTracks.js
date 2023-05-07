// Copyright 2014-2021, University of Colorado Boulder

/**
 * Debug tracks, which can be enabled using the query parameter 'testTrackIndex' with the index of the track to debug.
 * There is no automated testing, you have to launch the track and see if the behavior looks correct.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import energySkatePark from '../../energySkatePark.js';
import EnergySkateParkQueryParameters from '../EnergySkateParkQueryParameters.js';

class DebugTracks {
  constructor() {}

  /**
   * Initialize the debugging tool. Only done when debug query parameter testTrackIndex is used. Modifies the model that
   * is passed in.
   * @public
   *
   * @param {EnergySkateParkModel} model
   */
  static init( model ) {
    // Tracks to help demonstrate issues

    let controlPoints = null;
    let track = null;
    if ( EnergySkateParkQueryParameters.testTrackIndex === 1 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( -5, 8 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 3.9238282647584946, 3.1917866726296955 ), model.controlPointGroup.createNextElement( 2.043971377459748, 4.847851073345259 ), model.controlPointGroup.createNextElement( -1.116994633273702, 3.686296958855098 ), model.controlPointGroup.createNextElement( -3.5806797853309487, 1.8639512522361352 ), model.controlPointGroup.createNextElement( -5.982719141323793, 6.235364490161 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Skater stutters and slows going over the hump
    if ( EnergySkateParkQueryParameters.testTrackIndex === 2 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( -5, 7.7 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 3.9238282647584946, 3.1917866726296955 ), model.controlPointGroup.createNextElement( 2.043971377459748, 4.847851073345259 ), model.controlPointGroup.createNextElement( -1.116994633273702, 3.686296958855098 ), model.controlPointGroup.createNextElement( -3.5806797853309487, 1.8639512522361352 ), model.controlPointGroup.createNextElement( -5.982719141323793, 6.235364490161 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Tricky one--handled OK
    if ( EnergySkateParkQueryParameters.testTrackIndex === 3 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( -5, 7.7 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( -1.8031842576028616, 3.53633273703041 ), model.controlPointGroup.createNextElement( 1.7306618962432907, 2.8187991949910547 ), model.controlPointGroup.createNextElement( 1.9246153846153842, 4.3405881037567084 ), model.controlPointGroup.createNextElement( 3.834311270125223, 4.907529069767442 ), model.controlPointGroup.createNextElement( 3.491162790697672, 1.0732177996422188 ), model.controlPointGroup.createNextElement( -2.760107334525939, 1.461124776386404 ), model.controlPointGroup.createNextElement( -5.162146690518783, 5.832538014311269 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Wide loop, OK
    if ( EnergySkateParkQueryParameters.testTrackIndex === 4 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( -5, 7.7 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 4.639964221824686, 6.68294946332737 ), model.controlPointGroup.createNextElement( 1.4173524150268335, 0.938942307692308 ), model.controlPointGroup.createNextElement( -3.207692307692308, 3.997439624329159 ), model.controlPointGroup.createNextElement( 3.2524508050089445, 3.9079226296958858 ), model.controlPointGroup.createNextElement( 3.491162790697672, 1.0732177996422188 ), model.controlPointGroup.createNextElement( -2.760107334525939, 1.461124776386404 ), model.controlPointGroup.createNextElement( -5.162146690518783, 5.832538014311269 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Flickering return skater button, OK (see https://github.com/phetsims/energy-skate-park-basics/issues/121)
    if ( EnergySkateParkQueryParameters.testTrackIndex === 5 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( -5, 7.7 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 4.431091234347049, 7.9252447313977665 ), model.controlPointGroup.createNextElement( 2.4169588550983896, 7.975935759156005 ), model.controlPointGroup.createNextElement( -1.9874106197862114, 4.75700797278857 ), model.controlPointGroup.createNextElement( 0.13992761930286512, 6.207060140642635 ), model.controlPointGroup.createNextElement( 1.447191413237924, 1.0090653610430707 ), model.controlPointGroup.createNextElement( -1.7008228980322002, 1.0717102008522177 ), model.controlPointGroup.createNextElement( -5.37101967799642, 7.0748332823816655 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Passes through track, OK
    if ( EnergySkateParkQueryParameters.testTrackIndex === 6 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 5.147227191413236, 6.57851296958855 ), model.controlPointGroup.createNextElement( 0.05887058823529401, 1.0476264705882334 ), model.controlPointGroup.createNextElement( -1.9427294117647067, 2.637132352941175 ), model.controlPointGroup.createNextElement( -3.1201411764705886, 6.404849999999999 ), model.controlPointGroup.createNextElement( 0.5690823529411766, 6.071249999999999 ), model.controlPointGroup.createNextElement( -2.3940705882352944, 1.3419794117647044 ), model.controlPointGroup.createNextElement( -5.474964705882353, 6.5029676470588225 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Falls through bottom, OK
    if ( EnergySkateParkQueryParameters.testTrackIndex === 7 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 5.147227191413236, 6.57851296958855 ), model.controlPointGroup.createNextElement( -0.43896196231781204, 1.7569427657305372 ), model.controlPointGroup.createNextElement( -1.1787355229664587, 2.807585005572261 ), model.controlPointGroup.createNextElement( -3.1201411764705886, 6.404849999999999 ), model.controlPointGroup.createNextElement( 0.5690823529411766, 6.071249999999999 ), model.controlPointGroup.createNextElement( -2.3940705882352944, 1.3419794117647044 ), model.controlPointGroup.createNextElement( -5.474964705882353, 6.5029676470588225 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Falls through loop, PROBLEM
    if ( EnergySkateParkQueryParameters.testTrackIndex === 8 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );

      controlPoints = [ model.controlPointGroup.createNextElement( 5.07086859688196, 6.925682071269487 ), model.controlPointGroup.createNextElement( 2.061781737193762, 0.7625271732714408 ), model.controlPointGroup.createNextElement( 0.09287305122494338, 0.7625271732714408 ), model.controlPointGroup.createNextElement( -3.287706013363029, 3.0472042334050697 ), model.controlPointGroup.createNextElement( -2.2289532293986642, 4.399535077951003 ), model.controlPointGroup.createNextElement( -0.6129621380846331, 4.306662026726059 ), model.controlPointGroup.createNextElement( 0.7429844097995542, 3.3629726075698803 ), model.controlPointGroup.createNextElement( 0.14859688195991083, 2.3227944338505053 ), model.controlPointGroup.createNextElement( -1.4302449888641426, 1.4159674088426304 ), model.controlPointGroup.createNextElement( -4.532204899777283, 0.580109947818132 ), model.controlPointGroup.createNextElement( -6.1185746102449885, 7.75698912376468 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    // Pops upside down in loop, PROBLEM
    if ( EnergySkateParkQueryParameters.testTrackIndex === 9 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0;

      controlPoints = [ model.controlPointGroup.createNextElement( 5.516659242761692, 5.458287861915368 ), model.controlPointGroup.createNextElement( 2.061781737193762, 0.7625271732714408 ), model.controlPointGroup.createNextElement( 0.09287305122494338, 0.7625271732714408 ), model.controlPointGroup.createNextElement( -3.287706013363029, 3.0472042334050697 ), model.controlPointGroup.createNextElement( -2.2289532293986642, 4.399535077951003 ), model.controlPointGroup.createNextElement( -0.6129621380846331, 4.306662026726059 ), model.controlPointGroup.createNextElement( 0.7429844097995542, 3.3629726075698803 ), model.controlPointGroup.createNextElement( 0.14859688195991083, 2.3227944338505053 ), model.controlPointGroup.createNextElement( -1.4302449888641426, 1.4159674088426304 ), model.controlPointGroup.createNextElement( -4.532204899777283, 0.580109947818132 ), model.controlPointGroup.createNextElement( -6.1185746102449885, 7.75698912376468 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    if ( EnergySkateParkQueryParameters.testTrackIndex === 10 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0.0363651226158039;

      controlPoints = [ model.controlPointGroup.createNextElement( 5.07086859688196, 6.925682071269487 ), model.controlPointGroup.createNextElement( 2.061781737193762, 0.7625271732714408 ), model.controlPointGroup.createNextElement( 0.09287305122494338, 0.7625271732714408 ), model.controlPointGroup.createNextElement( -3.287706013363029, 3.0472042334050697 ), model.controlPointGroup.createNextElement( -2.2289532293986642, 4.399535077951003 ), model.controlPointGroup.createNextElement( -0.6129621380846331, 4.306662026726059 ), model.controlPointGroup.createNextElement( 0.7429844097995542, 3.3629726075698803 ), model.controlPointGroup.createNextElement( 0.14859688195991083, 2.3227944338505053 ), model.controlPointGroup.createNextElement( -1.4302449888641426, 1.4159674088426304 ), model.controlPointGroup.createNextElement( -4.532204899777283, 0.580109947818132 ), model.controlPointGroup.createNextElement( -6.1185746102449885, 7.75698912376468 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    if ( EnergySkateParkQueryParameters.testTrackIndex === 11 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0.0363651226158039;

      controlPoints = [ model.controlPointGroup.createNextElement( 7.049477756286265, 5.232410541586074 ), model.controlPointGroup.createNextElement( 1.8198088164974369, 1.7349575399795614 ), model.controlPointGroup.createNextElement( -0.14909986947138165, 1.7349575399795614 ), model.controlPointGroup.createNextElement( 0.5162088974854928, 1.8286581237911035 ), model.controlPointGroup.createNextElement( -0.4516827852998073, 11.657297387984716 ), model.controlPointGroup.createNextElement( 2.0970986460348158, 5.6886320108087025 ), model.controlPointGroup.createNextElement( -1.8000003436635232, 4.708138438138744 ), model.controlPointGroup.createNextElement( -0.43555125725338684, 5.914473403458605 ), model.controlPointGroup.createNextElement( -2.500386847195358, 4.849792552394775 ), model.controlPointGroup.createNextElement( -4.774177820473608, 1.5525403145262526 ), model.controlPointGroup.createNextElement( -6.339690522243714, 8.797478239845262 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    if ( EnergySkateParkQueryParameters.testTrackIndex === 12 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0.0363651226158039;

      controlPoints = [ model.controlPointGroup.createNextElement( 0.8301088646967347, 3.5809234059097967 ), model.controlPointGroup.createNextElement( 3.411228615863142, 2.4784350699844477 ), model.controlPointGroup.createNextElement( 5.29194401244168, 5.928575038880248 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    if ( EnergySkateParkQueryParameters.testTrackIndex === 13 ) {

      model.stickingToTrackProperty.value = false;
      // The skater falls through model track
      model.skater.positionProperty.set( new Vector2( 5, 7.9 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0.0363651226158039;

      controlPoints = [ model.controlPointGroup.createNextElement( 0.8301088646967347, 3.5809234059097967 ), model.controlPointGroup.createNextElement( 3.411228615863142, 2.4784350699844477 ), model.controlPointGroup.createNextElement( 5.29194401244168, 5.928575038880248 ) ];
      track = model.trackGroup.createNextElement( controlPoints, [] );
      track.physicalProperty.value = true;
      model.tracks.add( track );
    }

    if ( EnergySkateParkQueryParameters.testTrackIndex === 14 ) {
      model.stickingToTrackProperty.value = false;
      model.skater.positionProperty.set( new Vector2( -6.698445595854922, 6.5278756476683935 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0.05;

      const controlPoints1 = [
        model.controlPointGroup.createNextElement( -6.23, -0.85 ),
        model.controlPointGroup.createNextElement( -5.23, -0.85 ),
        model.controlPointGroup.createNextElement( -4.23, -0.85 )
      ];
      const track1 = model.trackGroup.createNextElement( controlPoints1, null );
      track1.physicalProperty.value = false;
      model.tracks.add( track1 );

      const controlPoints2 = [
        model.controlPointGroup.createNextElement( -6.23, -0.85 ),
        model.controlPointGroup.createNextElement( -5.23, -0.85 ),
        model.controlPointGroup.createNextElement( -4.23, -0.85 )
      ];
      const track2 = model.trackGroup.createNextElement( controlPoints2, null );
      track2.physicalProperty.value = false;
      model.tracks.add( track2 );

      const controlPoints3 = [
        model.controlPointGroup.createNextElement( -0.720977917981072, 1.6368312846731214 ),
        model.controlPointGroup.createNextElement( 0.279022082018928, 1.6368312846731214 ),
        model.controlPointGroup.createNextElement( 3.8511345589035137, 7.315696725769607 ),
        model.controlPointGroup.createNextElement( -1.1916066572392037, 2.911932992494288 ),
        model.controlPointGroup.createNextElement( -9.170190362232134, 6.469483302512781 )
      ];
      const track3 = model.trackGroup.createNextElement( controlPoints3, null );
      track3.physicalProperty.value = true;
      model.tracks.add( track3 );
    }

    //Test decrease in thermal energy, see https://github.com/phetsims/energy-skate-park-basics/issues/141#issuecomment-59395426
    if ( EnergySkateParkQueryParameters.testTrackIndex === 15 ) {
      model.stickingToTrackProperty.value = true;
      model.skater.positionProperty.set( new Vector2( -6.698445595854922, 6.5278756476683935 ) );
      model.skater.released( null, 0 );
      model.frictionProperty.value = 0;
      const track15 = model.trackGroup.createNextElement( [
        model.controlPointGroup.createNextElement( 0.9873551637279601, 7.856892317380353 ),
        model.controlPointGroup.createNextElement( -0.4621662468513845, 5.9031895465994975 ),
        model.controlPointGroup.createNextElement( -3.0250881612090676, 5.735129093198994 ),
        model.controlPointGroup.createNextElement( -4.705692695214106, 0.9454061712846356 ),
        model.controlPointGroup.createNextElement( -7.310629722921914, 7.457748740554157 )
      ], null );
      track15.physicalProperty.value = true;
      model.tracks.add( track15 );
    }

    if ( EnergySkateParkQueryParameters.testTrackIndex === 16 ) {
      model.frictionProperty.value = 0;

      const controlPoints = [
        model.controlPointGroup.createNextElement( -0.29564715581203593, 5.349320898598515 ),
        model.controlPointGroup.createNextElement( 0.5844187963726313, 5.266814715581202 ),
        model.controlPointGroup.createNextElement( 1.5469909315746087, 4.771777617477328 ),
        model.controlPointGroup.createNextElement( 2.0145259686727126, 3.1629070486397355 ),
        model.controlPointGroup.createNextElement( 1.2307172300082456, 1.7878039983511949 ),
        model.controlPointGroup.createNextElement( -1.2994723825226702, 1.7740529678483092 ),
        model.controlPointGroup.createNextElement( -2.1382852431986805, 3.575437963726298 ),
        model.controlPointGroup.createNextElement( -1.0382028029678487, 5.280565746084088 ),
        model.controlPointGroup.createNextElement( 0.6944270403957145, 6.806930131904369 ),
        model.controlPointGroup.createNextElement( -0.9831986809563062, 7.962016694146743 )
      ];

      const track16 = model.trackGroup.createNextElement( controlPoints, [], {
        configurable: true
      } );
      track16.physicalProperty.value = true;
      model.tracks.add( track16 );
    }
  }
}

energySkatePark.register( 'DebugTracks', DebugTracks );
export default DebugTracks;