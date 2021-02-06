const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');
const youtubedl = require('ytdl-core');
let pathToFfmpeg = require('ffmpeg-static');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");

const musicIdsFileName = './musicIds.json';
const themesFileName = './themes.json';

const {prefix,token} = require('./config.json');
const themes = require(themesFileName);

const emptyObject = {};
const client = new Discord.Client();

const mp3Extension = ".mp3";
const muteFileName = "./mute";
const musicDirectory = "./musics/"

const argErrorMessage = "File not found, please retry and with another argument";
const helpMessage = "The following commands are available : \n"
					+ "**!bardHelp** : Displays command list and usage\n"
					+ "**!listWorlds ** : List available worlds \n"
					+ "**!listSongs (world) ** : List available songs and ids for all world or specified world\n"
					+ "**!play <id>** : Plays the song corresponding to the specified id (once)\n"
					+ "**!loop <id>** : Loops the song corresponding to the specified id\n"
					+ "**!listThemes** : Displays available themes\n"
					+ "**!newTheme <theme name>** : Creates a new theme\n"
					+ "**!addTheme <song id> <theme name>** : Adds the song to the specified theme\n"
					+ "**!loopTheme <theme name>** : Loops a random song from the specified theme\n"
					+ "**!upload <world>** : upload attachments to world\n"
					+ "**!upload <world> <youtubeVideoId>** : upload youtube video as mp3 to world\n"
					+ "**!stop** : Stop playing music\n"
					+ "**!resetSongList** : met à jour la liste des musiques"
					+ "**!quit** : Disconnects the bot"
					;

client.login(token);
client.once('ready', () => {
 console.log('Ready!');
});
client.once('reconnecting', () => {
 console.log('Reconnecting!');
});
client.once('disconnect', () => {
 console.log('Disconnect!');
});

//list of worlds
let worlds = []
let musicIds = []


//read musics in directory and give each of them an id
function listMusics(){
	fs.readdir("./musics/", (err, files) => {
		let counter = 1;
		files.forEach(directory => {
			if (!directory.endsWith(".mp3")){
				fs.readdir("./musics/"+directory, (err, files) => {
					worlds.push(directory)
					files.forEach(file => {
						let directorySong = directory+"/"+file
						musicIds[counter] = directorySong;
						counter++;
					});
				});
			}
		});
	});
}

listMusics();


client.on('message', async message => {

	if (message.author.bot){
		if(message.author.username == "BardBot"){
			console.log("[BotMessageLog] " + message.author.username + " : " + message.content);
		}
		return;
	}
  	if (!message.content.startsWith(prefix)){
  		return;
  	} else {
  		console.log("[CommandsLog] " + message.author.username + " : " + message.content);
  	}

	if (message.content.startsWith(`${prefix}kobrok`)){
		message.channel.send("Kobrok is so clever and clearly not powerful! Also really small! :heart_eyes:");
	}

	if (message.content.startsWith(`${prefix}play`)){
		const arg = getArg(message);
		play(message,arg);
	}
	if (message.content.startsWith(`${prefix}stop`)){
		message.reply("Ok, I stop playing ...");
		stop(message);
	}
	if (message.content.startsWith(`${prefix}quit`)){
		message.reply("Ok, I disconnect ...");
		disconnect(message);
	}
	if (message.content.startsWith(`${prefix}bardHelp`)){
		message.reply(helpMessage);
	}
	if (message.content.startsWith(`${prefix}listWorlds`)){
		listWorlds(message);
	}
	if (message.content.startsWith(`${prefix}listSongs`)){
		const arg = getArg(message);
		listSongs(message, arg);
	}
	if (message.content.startsWith(`${prefix}resetSongList`)){
		listMusics():
	}
	if (message.content.startsWith(`${prefix}listThemes`)){
		listThemes(message);
	}
	if (message.content.startsWith(`${prefix}newTheme`)){
		const arg = getArg(message);
		newTheme(message,arg);
	}
	if (message.content.startsWith(`${prefix}addTheme`)){
		addTheme(message);
	}
	if (message.content.startsWith(`${prefix}detailTheme`)){
		const arg = getArg(message);
		detailTheme(message,arg);
	}
	if (message.content.startsWith(`${prefix}deleteTheme`)){
		const arg = getArg(message);
		deleteTheme(message,arg);
	}
	if (message.content.startsWith(`${prefix}deleteFromTheme`)){
		deleteFromTheme(message);
	}
	if (message.content.startsWith(`${prefix}loopTheme`)){
		const arg = getArg(message);
		loopTheme(message,arg);
	}
	if (message.content.startsWith(`${prefix}upload`)){
		const arg = getArg(message);
		const arg2 = getArg2(message);
		upload(message,arg, arg2);
	}
	else if (message.content.startsWith(`${prefix}loop`)){
		const arg = getArg(message);
		message.reply("Looping "+musicIds[arg]);
		loop(message,arg);
	}
})



function listSongs(message, arg){
	let messageList = "The following songs can be played : \n"

	let world = "";

	for (const [key, value] of Object.entries(musicIds)) {

		console.log(arg);

		if(!arg || (arg && value.split("/")[0] == arg)	){
			if (value.split("/")[0] != world){
				world = value.split("/")[0]
				messageList += `\n**${world} :**\n`;
			}
	
			  messageList += `**${key}** : ${value.split("/")[1]}\n`;
		}
	}

	if(messageList.length < 40){
		if(worlds.includes(arg)){
			message.reply(`the world ${arg} contains no songs`)
		} else {
			messageList = "";
			worlds.forEach(world => {
				messageList += " " + world;
			})
			message.reply(`${arg} is not a valid world (worlds :${messageList})`);
		}
		
	} else {
		message.reply(messageList);
	}
	
}

function listWorlds(message){
	let messageList = "The following world exists : \n"
	worlds.forEach(world => {
		messageList =+ world + " ";
	})
	message.reply(messageList);
}

function listThemes(message){
	let messageList = "The following themes are available : \n"
	for (const [key, value] of Object.entries(themes)) {
  		messageList += `**${key}**\n`;
	}
	message.reply(messageList);
}

function play(message,arg){
	if(musicIds.hasOwnProperty(arg)){
		let music = musicDirectory+musicIds[arg];
		message.reply("Playing "+musicIds[arg]);
		message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(music).on("finish", () => {VoiceConnection.disconnect()});
    	}).catch(e => {
			console.log(e);
			message.channel.send(argErrorMessage);
    	})
	}else{
		message.reply("This id doesn't exist :cry:");
	}

	
}

function loop(message,arg){
	let music = musicDirectory+musicIds[arg];
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(music).on("finish", () => {loop(message,arg)});
    	}).catch(e => {
			console.log(e);
			message.channel.send(argErrorMessage);
    	})
}

function stop(message){
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(muteFileName+mp3Extension).on("finish", () => {stop(message)});
    	}).catch(e => {
			console.log(e);
			message.channel.send(argErrorMessage);
    	})
}

function disconnect(message){
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.disconnect()
    	}).catch(e => console.log(e))
}

function newTheme(message,arg){
	if(themes.hasOwnProperty(arg)){
		message.reply("This theme already exists :cry:")
	}else{
		themes[arg] = [];
		fs.writeFile(themesFileName,JSON.stringify(themes, null, "\t"), (err) => {
    	if (err) {
        	throw err;
    	}
    	message.reply("New theme : "+arg)
		});
	}
}

function addTheme(message){
	const arg1 = message.content.slice(prefix.length).trim().split(' ')[1];
	const arg2 = message.content.slice(prefix.length).trim().split(' ')[2];
	if(themes.hasOwnProperty(arg2)){
		if(!themes[arg2].includes(musicIds[arg1])){
			themes[arg2].push(musicIds[arg1]);
			fs.writeFile(themesFileName,JSON.stringify(themes, null, "\t"), (err) => {
	    	if (err) {
	        	throw err;
	    	}
	    	message.reply(musicIds[arg1]+" added to theme "+arg2)
			});
		}else{
			message.reply("This song already belongs to theme :cry:")
		}
	}else{
		message.reply("This theme does not exist :cry:")
	}
}

function detailTheme(message,arg){
	if(themes.hasOwnProperty(arg)){
		let messageList = "The following songs belong to theme : "+arg+"\n"
		themes[arg].forEach(song => {
			let songId = getKeyByValue(musicIds,song);
			if(songId != null){
				messageList += `**${songId}** : ${song}\n`;
			}
		});
		message.reply(messageList);
	}else{
		message.reply("This theme does not exist :cry:")
	}
}

function deleteTheme(message,arg){
	if(themes.hasOwnProperty(arg)){
		delete themes[arg]; 
		fs.writeFile(themesFileName,JSON.stringify(themes, null, "\t"), (err) => {
	    	if (err) {
	        	throw err;
    		}
			message.reply(arg+" theme has been deleted")
		});
	}else{
		message.reply("This theme does not exist :cry:")
	}
}

function deleteFromTheme(message,arg){
	const arg1 = message.content.slice(prefix.length).trim().split(' ')[1];
	const arg2 = message.content.slice(prefix.length).trim().split(' ')[2];
	if(themes.hasOwnProperty(arg2)){
		if(themes[arg2].includes(musicIds[arg1])){
			let updatedTheme = themes[arg2].filter(e => e !== musicIds[arg1]);
			themes[arg2] = updatedTheme;
			fs.writeFile(themesFileName,JSON.stringify(themes, null, "\t"), (err) => {
		    	if (err) {
		        	throw err;
	    		}
				message.reply(musicIds[arg1]+" has been deleted from "+arg2);
			});
		}else{
			message.reply("This song doesn't belong to this theme :cry:")
		}
	}else{
		message.reply("This theme does not exist :cry:")
	}
}

function loopTheme(message,arg){
	if(themes.hasOwnProperty(arg)){
		let songs = themes[arg];
		let songIds = [];
		songs.forEach(song => {
			let songId = getKeyByValue(musicIds,song);
			if(songId != null){
				songIds.push(songId);
			}
		});
		if(songIds.length > 0){
			let random = Math.floor(Math.random() * songIds.length);
			let randomMusicId = songIds[random];
			loop(message,randomMusicId);
		}else{
			message.reply("Didn't find any music to play :cry:")
		}
	}else{
		message.reply("This theme does not exist :cry:")
	}
}


function upload(message,arg, arg2){

	if(arg){
		if(!worlds.includes(arg)){
			messageList = "";
			worlds.forEach(world => {
				messageList += " " + world;
			})
			message.reply(`${arg} is not a valid world (worlds :${messageList})`);
			return;
		}
	

		if(arg2){

			let downloader = new YoutubeMp3Downloader({
				"ffmpegPath": pathToFfmpeg,             	// FFmpeg binary location
				"outputPath": musicDirectory + arg + "/",   // Output file location (default: the home directory)
				"youtubeVideoQuality": "highestaudio",  	// Desired video quality (default: highestaudio)
				"queueParallelism": 2,                  	// Download parallelism (default: 1)
				"progressTimeout": 2000,                	// Interval in ms for the progress reports (default: 1000)
				"allowWebm": false                      	// Enable download from WebM sources (default: false)
			});

			downloader.download(arg2);
			downloader.on("finished", function(err, data){
				message.reply(data.videoTitle + " uploaded succesfully");
				listMusics();
			});
		}

		//first check attachments
		else if (message.attachments.size > 0) {

			message.attachments.forEach(function(attachment){
				let attachmentName = attachment.name
				if(attachmentName.endsWith(mp3Extension)){
					console.log("uploading file " + attachmentName);
					download(attachment.url,musicDirectory + "/" + arg  + "/" + attachmentName ,function(){
						message.reply(attachmentName + " uploaded succesfully");
						listMusics();
					});
				} else {
					message.reply("only mp3 files are supported")
				}
			})
		}

		//next check if url in args
		else {
			message.reply("attachment or video id required")
		}
	} else {
		message.reply("missing parameter <world>")
	}
}

function getArg(message){
	const arg = message.content.slice(prefix.length).trim().split(' ')[1];
	return arg;
}

function getArg2(message){
	const arg2 = message.content.slice(prefix.length).trim().split(' ')[2];
	return arg2;
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

function download(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
