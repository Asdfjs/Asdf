// Karma configuration
// Generated on Mon Feb 10 2014 21:02:50 GMT+0900 (대한민국 표준시)

module.exports = function(config) {
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../../',


    // frameworks to use
    frameworks: ['qunit'],


    // list of files / patterns to load in the browser
    files: [
        'src/client/namespace.js',
        'src/common/core/Core.js',
        'src/common/datatype/Object.js',
        'src/common/datatype/Function.js',
        'src/common/datatype/Array.js',
        'src/common/datatype/String.js',
        'src/client/datatype/String.js',
        'src/common/datatype/Argument.js',
        'src/common/datatype/Number.js',
        'src/common/datatype/Prototype.js',
        'src/client/bom/bom.js',
        'src/client/event/Event.js',
        'src/client/dom/Element.js',
        'src/common/util/utils.js',
        'src/client/util/utils.js',
        'src/base/Callbacks.js',
        'src/common/util/Promise.js',
        'src/common/base/base.js',
        'src/common/base/Callbacks.js',
        'src/common/base/Events.js',
        'src/common/base/Store.js',
        'src/client/ajax/Ajax.js',
        'src/client/history/History.js',
        'src/client/dom/Template.js',
        'test/**/*Test.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress','coverage'],
    preprocessors: {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/**/*.js': ['coverage']
    },
    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome'],


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
