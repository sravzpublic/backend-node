'use strict';

module.exports = function(grunt) {
	// Unified Watch Object
	var watchFiles = {
		serverViews: ['app/views/**/*.*'],
		serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js'],
		clientViews: ['public/modules/**/views/**/*.html'],
		clientJS: ['public/js/*.js', 'public/modules/**/*.js'],
		clientCSS: ['public/modules/**/*.css'],
		mochaTests: ['app/tests/**/*.js']
	};

	// Project Configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {
			serverViews: {
				files: watchFiles.serverViews,
				options: {
					livereload: true
				}
			},
			serverJS: {
				files: watchFiles.serverJS,
				tasks: [''],
				options: {
					livereload: true
				}
			},
			clientViews: {
				files: watchFiles.clientViews,
				options: {
					livereload: true,
				}
			},
			clientJS: {
				files: watchFiles.clientJS,
				tasks: [''],
				options: {
					livereload: true
				}
			},
			clientCSS: {
				files: watchFiles.clientCSS,
				tasks: ['csslint'],
				options: {
					livereload: true
				}
			}
		},
		jshint: {
			all: {
				src: watchFiles.clientJS.concat(watchFiles.serverJS),
				options: {
					jshintrc: true
				}
			}
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc',
			},
			all: {
				src: watchFiles.clientCSS
			}
		},
		uglify: {
			production: {
				options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    preserveComments: 'some'
                },
				files: {
					'public/dist/application.min.js': 'public/dist/application.js'
				}
            },
            vendor: {
            	options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    preserveComments: 'some'
                },
                files: {
                    'public/dist/vendor.min.js': 'public/dist/vendor.js'
                }
            }
		},
		cssmin: {
			combine: {
				files: {
					'public/dist/application.min.css': '<%= applicationCSSFiles %>'
				}
            },
            vendor: {
                files: {
                    'public/dist/vendor.min.css': '<%= vendorCSSFiles %>'
                }
            }
		},
		nodemon: {
			dev: {
				script: 'server.js',
				options: {
					nodeArgs: ['--inspect'],
					ext: 'js,html',
					watch: watchFiles.serverViews.concat(watchFiles.serverJS)
				}
			}
		},
		'node-inspector': {
			custom: {
				options: {
					'web-port': 1337,
					'web-host': 'localhost',
					'debug-port': 5858,
					'save-live-edit': true,
					'no-preload': true,
					'stack-trace-limit': 50,
					'hidden': []
				}
			}
		},
		ngAnnotate: {
			production: {
				files: {
                    'public/dist/application.js': ['<%= applicationJavaScriptFiles %>', 'public/dist/template.string_replaced.js' ]
				}
            },
            vendor: {
                files: {
                    'public/dist/vendor.js': '<%= vendorJavaScriptFiles %>'
                }
            }
		},
		concurrent: {
			default: ['nodemon', 'watch'],
			debug: ['nodemon', 'watch', 'node-inspector'],
			options: {
				logConcurrentOutput: true,
				limit: 10
			}
		},
        env: {
            development: {
                NODE_ENV: 'development'
            },
			test: {
				NODE_ENV: 'test'
			},
			secure: {
				NODE_ENV: 'secure'
            },
            prod: {
                NODE_ENV: 'production'
            }
        },
        copy: {
            options: {
                force: true
            },
            vendor: {
                files: [
                    // includes files within path
                    // Angular ui-grid expects the fonts in the same dir as the css file
                    { cwd: 'public/lib/angular-ui-grid', expand: true, flatten: true, src: ['ui-grid.*', '!**.js', '!**.css'], dest: "public/dist", isFile: true }
                ]
            }
        },
		mochaTest: {
			src: watchFiles.mochaTests,
			options: {
				reporter: 'spec',
				require: 'server.js'
			}
		},
		karma: {
			unit: {
				configFile: 'karma.conf.js'
			}
        },
        clean: {
            options: {
                force: true
            },
            before: {
                files: { src: ['./public/dist/*'] }
            },
            after: {
                files: { src: ['!./public/app.all.min.*', '!./public/index.html', './public/vendor.*', './public/*/**'] }
            },
            deploy: {
                files: { src: ['C:\\deploy\\data\*'] }
            }
        },
        ngtemplates: {
            app: {
                src: 'public/modules/**/directives/**/*.htm',
                dest: 'public/dist/template.js',
                options: {
                    htmlmin: {
                        removeComments: true,
                        collapseWhitespace: true
                    },
                    module: 'templates'
                }
            }
        },
        'string-replace': {
            dist: {
                files: [{
                    'src': 'public/dist/template.js',
                    'dest': 'public/dist/template.string_replaced.js'
                }],
                options: {
                    replacements: [{
                        pattern: "angular.module('templates').run(['$templateCache', function($templateCache) {",
                        replacement: "angular.module('templates', []).run(['$templateCache', function($templateCache) {"
                    }
                    ]
                }
            }
        }
	});

	// Load NPM tasks
	require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-string-replace');
	// Making grunt default to force in order not to break the project.
	grunt.option('force', true);

	// A Task for loading the configuration object
    grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function () {
        grunt.task.run('env:development');
		var config = require('./config/config');
		grunt.config.set('applicationJavaScriptFiles', config.assets.js);
        grunt.config.set('applicationCSSFiles', config.assets.css);
	});

    /* Get the vendor files from the development config */
    grunt.task.registerTask('loadConfigVendor', 'Task that loads the vendor config into a grunt option.', function () {
        grunt.task.run('env:development');
        var config = require('./config/config');
        grunt.config.set('vendorJavaScriptFiles', config.assets.lib.js);
        grunt.config.set('vendorCSSFiles', config.assets.lib.css);
    });


	// Default task(s).
	grunt.registerTask('default', ['concurrent:default']);

	// Debug task.
	// grunt.registerTask('debug', ['lint', 'concurrent:debug']);
	// TODO: Add liniting later
	grunt.registerTask('debug', ['concurrent:debug']);
	// Secure task(s).
	grunt.registerTask('secure', ['env:secure', 'lint', 'concurrent:default']);

    // Secure task(s).
    grunt.registerTask('prod', ['env:prod', 'lint', 'concurrent:default']);

	// Lint task(s).
	grunt.registerTask('lint', ['jshint', 'csslint']);

    // Templates
    grunt.registerTask('ngtemplate_replace', ['ngtemplates', 'string-replace:dist']);

	// Build task(s).
    /* Buils vendor files for production */
    grunt.registerTask('buildVendor', ['loadConfigVendor', 'ngAnnotate:vendor', 'uglify:vendor', 'cssmin:vendor', "copy:vendor"]);
    /* Builds application */
    grunt.registerTask('build', ['clean:before', 'env:development', 'lint', 'loadConfig', 'ngtemplate_replace', 'ngAnnotate', 'uglify', 'cssmin', 'buildVendor']);
	// Test task.
    grunt.registerTask('test', ['env:test', 'mochaTest', 'karma:unit']);
};