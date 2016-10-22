var nodeSpotifyWebHelper = require('node-spotify-webhelper');
var spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();

var request = require('request');
var jsdom = require("jsdom");
var Genius = require("node-genius");
var geniusClient = new Genius("uG43dODDI_4MMivGiU1wWnW0Xl5hqZxR4ZA_ET0adiTdO0kP8_UMUPuDiBAnJpEo");

var currentSong = {id: null, title: null, artistName: null, artistId: null, url: null};


// get the name of the song which is currently playing
spotify.getStatus(function (err, res) {
  if (err) {
	return console.error(err);
  }

  if (res.open_graph_state.private_Session){
	return "NOT PUBLIC LISTENING";
  
}  
  //Log info of song currently playing
  console.info('currently playing:',
	res.track.artist_resource.name, '-',
	res.track.track_resource.name);

  var query = res.track.artist_resource.name+'-'+res.track.track_resource.name;

  search(query);

  console.log(query);
});

function search(searchQuery){
	geniusClient.search(searchQuery, function (error, results) {
		if (error){
			return error;
		}
		
		results = JSON.parse(results);
		var trackList = results.response.hits;

		console.log(JSON.stringify(results, undefined, 2));

		var song = trackList[0].result;

		currentSong.title = song.title;
		currentSong.id = song.id;
		currentSong.artistName = song.primary_artist.name;
		currentSong.artistId = song.primary_artist.id;
		currentSong.lyrics = song.url;


		getLyrics(currentSong.lyrics);
	});
}

function getSong(id){
	geniusClient.getSong(id, function (error, song) {
		song = JSON.parse(song);
		

		console.log(JSON.stringify(song, undefined, 2));
	});
}

function getLyrics(lyricsUrl){
	jsdom.env(lyricsUrl,["http://code.jquery.com/jquery.js"],function (err, window) {

		if (!err){
			var lyrics = window.$(".lyrics").html();
			console.log(lyrics);
		}
		// console.log("there have been", window.$("a").length - 4, "io.js releases!");
	});
}