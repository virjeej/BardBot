const Discord = require('discord.js');
const fs = require('fs');
const https = require('https');

const musicIdsFileName = './musicIds.json';
const themesFileName = './themes.json';

const {prefix,token} = require('./config.json');
const musicIds = require(musicIdsFileName);
const themes = require(themesFileName);

const emptyObject = {};
const client = new Discord.Client();

const mp3Extension = ".mp3";
const muteFileName = "./mute";
const musicDirectory = "./musics/"

const argErrorMessage = "File not found, please retry and with another argument";
const helpMessage = "The following commands are available : \n"
					+ "**!bardHelp** : Displays command list and usage\n"
					+ "**!listSongs** : Displays available songs and ids\n"
					+ "**!play <id>** : Plays the song corresponding to the specified id (once)\n"
					+ "**!loop <id>** : Loops the song corresponding to the specified id\n"
					+ "**!listThemes** : Displays available themes\n"
					+ "**!newTheme <theme name>** : Creates a new theme\n"
					+ "**!addTheme <song id> <theme name>** : Adds the song to the specified theme\n"
					+ "**!loopTheme <theme name>** : Loops a random song from the specified theme\n"
					+ "**!stop** : Stop playing music\n"
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

//TODO : lister les musiques d'un theme en particulier

//read musics in directory and give each of them an id
fs.readdir("./musics/", (err, files) => {
	let counter = 1;
	files.forEach(file => {
	    musicIds[counter] = file;
	    counter++;
	});
	//write songs and their ids to file
	fs.writeFile(musicIdsFileName, JSON.stringify(musicIds, null, "\t"), (err) => {
    if (err) {
        throw err;
    }
    console.log("Music's ids are saved!");
	});
});

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
		message.channel.send("Kobrok is not so cleaver and clearly not powerful! Also really small! :heart_eyes:");
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
	if (message.content.startsWith(`${prefix}listSongs`)){
		listSongs(message);
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
	if (message.content.startsWith(`${prefix}loopTheme`)){
		const arg = getArg(message);
		loopTheme(message,arg);
	}
	if (message.content.startsWith(`${prefix}upload`)){
		const arg = getArg(message);
		upload(message);
	}
	else if (message.content.startsWith(`${prefix}loop`)){
		const arg = getArg(message);
		message.reply("Looping "+musicIds[arg]);
		loop(message,arg);
	}
})



function listSongs(message){
	let messageList = "The following songs can be played : \n"
	for (const [key, value] of Object.entries(musicIds)) {
  		messageList += `**${key}** : ${value}\n`;
	}
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


function upload(message){
	if (message.attachments) {
		message.attachments.forEach(function(attachment){
			let attachmentName = attachment.name
			if(attachmentName.endsWith(mp3Extension)){
				console.log("uploading file " + attachmentName);
				download(attachment.url,musicDirectory + "/" + attachmentName ,function(){
            		message.reply(attachmentName + " uploaded succesfully")
            	});
			} else {
				message.reply("only mp3 files are supported")
			}
			
		})
    }
}

function getArg(message){
	const arg = message.content.slice(prefix.length).trim().split(' ')[1];
	return arg;
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
