/*
 * This config is only used during development and build phase only
 * It will not be available on production
 *
 */
(function(global) {
    // ENV
    global.ENV = global.ENV || 'development';

    var map = {
        'app': 'src/tmp/app',
        'test': 'src/tmp/test'
    };

    var packages = {
        'app': {
            defaultExtension: 'js'
        },
        'test': {
            defaultExtension: 'js'
        },
        'rxjs': {
            defaultExtension: 'js'
        }
    };

    var npmPackages = [
        '@angular',
        'rxjs',
        'lodash'
    ];

    var packageNames = [
        'app/shared',
        'lodash'
    ];

    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'forms',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'router'
    ];

    npmPackages.forEach(function (pkgName) {
        map[pkgName] = 'node_modules/' + pkgName;
    });

    packageNames.forEach(function(pkgName) {
        packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
    });

    ngPackageNames.forEach(function(pkgName) {
        var main = global.ENV === 'testing' ? 'index.js' :
            'bundles/' + pkgName + '.umd.js';

        packages['@angular/'+pkgName] = { main: main, defaultExtension: 'js' };
    });

    var config = {
        map: map,
        packages: packages
    };

    if (global.filterSystemConfig) { global.filterSystemConfig(config); }

    System.config(config);

})(this);
