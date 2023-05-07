// Copyright 2021, University of Colorado Boulder

/**
 * skiffle-specific grunt configuration
 *
 * @author John Blanco (PhET Interactive Simulations)
 */


// modules
const dot = require( 'dot' );
const Gruntfile = require( '../../chipper/js/grunt/Gruntfile' );
const winston = require( 'winston' );

// constants
const ACTIVE_REPOS_FILE = '../perennial/data/active-repos';

module.exports = grunt => {
  Gruntfile( grunt );

  grunt.registerTask(
    'build',
    'Build the soundboard HTML file',
    () => {

      // Configure the dot templating engine to our liking.
      dot.templateSettings.strip = false;

      // Read in the template file.
      let templateFileContents;
      try {
        templateFileContents = grunt.file.read( './html/sound-board-template.html' );
      }
      catch( err ) {
        winston.error( err.toString() );
        grunt.fail.fatal( 'Unable to open template file, aborting build.' );
      }

      // Compile the template into a function.
      const templateFunction = dot.template( templateFileContents );

      // Read in the list of active PhET repositories, splitting the lines into separate strings.
      let activeRepos = grunt.file.read( ACTIVE_REPOS_FILE ).split( '\n' );

      // On at least some systems, such as Windows, splitting the lines up this way results in there being a carriage
      // return character at the end of the string representing the repo name.  Remove it.
      activeRepos = activeRepos.map( activeRepo => activeRepo.replace( '\r', '' ) );

      // Remove any blank lines from the list of active repos.
      activeRepos = activeRepos.filter( activeRepo => activeRepo.length > 0 );

      // Make a list of all repos with sound files.
      const reposWithSoundFiles = activeRepos.filter( activeRepo => {
        const pathToCheck = `../${activeRepo}/sounds`;
        return grunt.file.exists( pathToCheck );
      } );

      // {Object[]} - an array of objects containing information about the sounds for each repo, populated below
      const repoSoundInfoArray = [];

      // Go through each repo on the list and create an object with information about the sounds it contains.  This will
      // be used to fill in the HTML template and thus create the soundboard HTML document.
      reposWithSoundFiles.forEach( ( repoName, index ) => {

        // Get a list of the sounds for this repo.
        const pathToSoundsDirectory = `../${repoName}/sounds/`;
        const patterns = [ `${pathToSoundsDirectory}*.mp3`, `${pathToSoundsDirectory}*.wav` ];
        const soundFileNames = grunt.file.expand( { filter: 'isFile' }, patterns );
        const individualSoundsInfoArray = [];

        // Create objects with the information needed in the template for each of the sounds.
        soundFileNames.forEach( soundFileName => {
          const soundFileNameOnly = soundFileName.substring( soundFileName.lastIndexOf( '/' ) + 1 );

          // If the name of the sound file is too long, create a shortened version with an ellipsis.
          const maxButtonLabelLength = 25;
          let buttonLabel;
          if ( soundFileNameOnly.length > maxButtonLabelLength ) {
            buttonLabel = `${soundFileNameOnly.substring( 0, maxButtonLabelLength - 3 )}...`;
          }
          else {
            buttonLabel = soundFileNameOnly;
          }

          individualSoundsInfoArray.push( {
            buttonTitle: soundFileNameOnly,
            soundFileFullPath: `../${soundFileName}`,
            buttonLabel: buttonLabel
          } );

        } );

        repoSoundInfoArray.push( {
          repoName: repoName,
          cardHeaderID: `heading${index}`,
          collapseID: `collapse${index}`,
          individualSoundsInfoArray: individualSoundsInfoArray
        } );
      } );

      // Create the output HTML by invoking the template functions with the values needed to fill it in.
      const soundBoardHtml = templateFunction( {
        buildMessage: '<!-- WARNING: This file was built, not hand generated, and should not be manually edited.  Use grunt to re-build. -->',
        repoSoundInfoArray: repoSoundInfoArray
      } );

      // Write the output file.
      grunt.file.write( './html/sound-board.html', soundBoardHtml );

      winston.info( 'Build complete.' );
    }
  );

  // register default task
  grunt.registerTask( 'default', [ 'build' ] );
};