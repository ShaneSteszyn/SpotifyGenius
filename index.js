// "use strict";
//ELECTRON STUFF
const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// MODULES
var nodeSpotifyWebHelper = require('node-spotify-webhelper');
var spotify = new nodeSpotifyWebHelper.SpotifyWebHelper();

var request = require('request');
let cheerio = require('cheerio');

var Genius = require("node-genius");
var geniusClient = new Genius("uG43dODDI_4MMivGiU1wWnW0Xl5hqZxR4ZA_ET0adiTdO0kP8_UMUPuDiBAnJpEo");

var currentSong = {id: null, originalTitle: null, title: null, artistName: null, artistId: null, lyrics:null, url: null};


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools for debugging.
  // mainWindow.webContents.openDevTools();

  // get the name of the song which is currently playing
  mainWindow.on('focus', getSpotifySong);

  function getSpotifySong(){
  	spotify.getStatus(function (err, res) {
		  if (err) {
			return console.error(err);
		  }

		  if (res.open_graph_state.private_Session){
			return "NOT PUBLIC LISTENING";
		  
		}  
		if(currentSong.originalTitle !== res.track.track_resource.name)
		  //Log info of song currently playing
		  console.info('currently playing:',
			res.track.artist_resource.name, '-',
			res.track.track_resource.name);

		  var query = res.track.artist_resource.name+'-'+res.track.track_resource.name;

		  search(query);

		  console.log(query);
		});
  }
	


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function search(searchQuery){
	geniusClient.search(searchQuery, function (error, results) {
		if (error){
			return error;
		}
		
		results = JSON.parse(results);
		

		if (results.response.hits && results.response.hits.length > 0){
			var trackList = results.response.hits;
			console.log(JSON.stringify(results, undefined, 2));

			var song = trackList[0].result;

			currentSong.title = song.title;
			currentSong.id = song.id;
			currentSong.artistName = song.primary_artist.name;
			currentSong.artistId = song.primary_artist.id;
			currentSong.url = song.url;


			getLyrics(currentSong);
		}
		else{
			currentSong.title = "No match!!!";
			currentSong.id = "No match!!!"
			currentSong.artistName = "No match!!!"
			currentSong.artistId = "No match!!!"
			currentSong.url = "No match!!!"

			mainWindow.webContents.send('lyrics', JSON.stringify(currentSong));
		}
	});
}

function getSong(id){
	geniusClient.getSong(id, function (error, song) {
		song = JSON.parse(song);
		
		console.log(JSON.stringify(song, undefined, 2));
	});
}

function getLyrics(song){
  console.log(song);
  
	request(song.url, function (error, response, html) {
		if (!error && response.statusCode == 200) {
			let $ = cheerio.load(html);
			currentSong.lyrics = $(".lyrics").html();

      mainWindow.webContents.send('lyrics', JSON.stringify(currentSong));
		}
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
