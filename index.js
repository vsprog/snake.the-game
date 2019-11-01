const browserSync = require('browser-sync');

browserSync({
	port: '3000',
	server : {
		baseDir : './app',
		routes : {
				'/node_modules' : './node_modules'
		}
	},
	files: [
		'./app/**/*.{html,htm,css,js}'
	]
});