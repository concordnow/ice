module.exports = function(grunt) {

  // ICE is GPL-2.0-or-later (see LICENSE). The built files bundle Rangy
  // (lib/rangy, MIT): uglify strips Rangy's own @license comment, so its
  // notice is repeated in the banner of every built file.
  var banner = function(title) {
    return '//\n' +
      '// ' + title + '\n' +
      '// Copyright (c) 2012 The New York Times, CMS Group, Matthew DeLambo <delambo@gmail.com>\n' +
      '// Licensed under the GNU General Public License, version 2 or (at your option)\n' +
      '// any later version (GPL-2.0-or-later). See LICENSE.\n' +
      '//\n' +
      '// Includes Rangy 1.2.3, http://code.google.com/p/rangy/\n' +
      '// Copyright 2012, Tim Down. Licensed under the MIT license:\n' +
      '// Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
      '// of this software and associated documentation files (the "Software"), to deal\n' +
      '// in the Software without restriction, including without limitation the rights\n' +
      '// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
      '// copies of the Software, and to permit persons to whom the Software is\n' +
      '// furnished to do so, subject to the following conditions:\n' +
      '// The above copyright notice and this permission notice shall be included in\n' +
      '// all copies or substantial portions of the Software.\n' +
      '// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
      '// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
      '// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
      '// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
      '// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n' +
      '// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n' +
      '// THE SOFTWARE.\n' +
      '//\n';
  };

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      src: ['src/**/*.js'],
      options: {
        browser: true,
        indent: 2,
        white: false,
        evil: true,
        regexdash: true,
        wsh: true,
        trailing: true,
        eqnull: true,
        expr: true,
        boss: true,
        node: true,
        strict: false
      }
    },

    qunit: {
      all: {
        options: {
          urls: ['http://localhost:8000/test/test.html'],
          puppeteer: {
            args: ['--no-sandbox']
          }
        }
      }
    },

    connect: {
      server: {
        options: {
          base: './'
        }
      }
    },

    concat: {
      options: {
        stripBanners: true,
        banner: banner('<%= pkg.name %> - v<%= pkg.version %>')
      },
      dist: {
        src: ['lib/rangy/rangy-core.js', 'src/polyfills.js', 'src/ice.js', 'src/dom.js', 'src/bookmark.js', 'src/selection.js', 'src/icePlugin.js', 'src/icePluginManager.js', 'src/plugins/IceAddTitlePlugin/IceAddTitlePlugin.js', 'src/plugins/IceCopyPastePlugin/IceCopyPastePlugin.js', 'src/plugins/IceSmartQuotesPlugin/IceSmartQuotesPlugin.js', 'src/plugins/IceEmdashPlugin/IceEmdashPlugin.js'],
        dest: 'dist/ice.js'
      }
    },

    uglify: {
      options: {
        beautify : {
          ascii_only: true,
          beautify: false
        },
        preserveComments: false,
        banner: banner('<%= pkg.name %> - v<%= pkg.version %>')
      },
      ice: {
        files: {
          'dist/ice.min.js': ['dist/ice.js']
        }
      },
      icemaster: {
        options: {
          banner: banner('<%= pkg.name %> - Master')
        },
        files: {
          'ice-master.min.js': ['dist/ice.js']
        }
      },
      tinyice: {
        files: {
          'dist/ice_editor_plugin.js': 'lib/tinymce/js/tinymce/plugins/ice/plugin.min.js'
        }
      },
      tinysr: {
        files: {
          'dist/sr_editor_plugin.js': 'lib/tinymce/js/tinymce/plugins/icesearchreplace/plugin.min.js'
        }
      }
    },

    compress: {
      gz: {
        options: {
          mode: 'gzip'
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['ice.min.js'],
          dest: 'dist/',
          ext: '.min.gz'
        }]
      },
      zip: {
        options: {
          archive: 'dist/ice_<%= pkg.version %>.zip'
        },
        files: [{
          expand:true,
          src: ['dist/**']
        }]
      }
    },

    clean: {
      build: ['dist']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['connect', 'qunit']);

  grunt.registerTask('build', ['clean:build', 'concat', 'uglify:ice', 'uglify:icemaster', 'compress:gz', 'cp', 'compress:zip']);

  grunt.registerTask('package', ['clean:build', 'concat', 'compress:gz', 'cp', 'compress:zip']);

  grunt.registerTask('cp', function() {
    cpTinyDir('ice');
    //grunt.file.delete('dist/ice_editor_plugin.js');

    cpTinyDir('icesearchreplace');
    //grunt.file.delete('dist/sr_editor_plugin.js');
  });

  var cpTinyDir = function(dir) {
    grunt.file.recurse('lib/tinymce/js/tinymce/plugins/' + dir + '/', function(abspath, rootdir, subdir, filename) {
      grunt.file.copy(rootdir + '/' + (subdir ? subdir + '/' : '') + filename,'dist/tinymce/plugins/' + dir + '/' + (subdir ? subdir + '/' : '') + '/' + filename);
    });
  };
};
