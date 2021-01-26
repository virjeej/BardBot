const Discord = require('discord.js');
const fs = require('fs');
const {prefix,token} = require('./config.json');
const musicIds = require('./musicIds.json');

const client = new Discord.Client();

const mp3Extension = ".mp3";
const muteFileName = "./mute";
const musicDirectory = "./musics/"
const argErrorMessage = "File not found, please retry and with another argument";
const helpMessage = "The following commands are available : \n"
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

//TODO: gerer l'ajout de nouvelles musiques
//TODO: commande qui joue une musique random parmi un theme


//read musics in directory and give each of them an id
fs.readdir("./musics/", (err, files) => {
	let counter = 1;
	files.forEach(file => {
	    musicIds[counter] = file;
	    counter++;
	});
	//write songs and their ids to file
	fs.writeFile('./musicIds.json', JSON.stringify(musicIds), (err) => {
    if (err) {
        throw err;
    }
    console.log("Music's ids are saved!");
	});
});




client.on('message', async message => {

	if (message.author.bot) return;
  	if (!message.content.startsWith(prefix)) return;

	if (message.content.startsWith(`${prefix}kobrok`)){
		message.channel.send("Kobrok is so clever and powerful! Also really handsome! :heart_eyes:");
	}

	if (message.content.startsWith(`${prefix}play`)){
		message.reply("Playing ...");
		const arg = getArg(message);
		play(message,arg);
	}
	if (message.content.startsWith(`${prefix}loop`)){
		message.reply("Looping ...");
		const arg = getArg(message);
		loop(message,arg);
	}
	if (message.content.startsWith(`${prefix}stop`)){
		message.reply("Ok, I stop playing ...");
		stop(message);
	}
	if (message.content.startsWith(`${prefix}quit`)){
		message.reply("Ok, I disconnect ...");
		disconnect(message);
	}
	if (message.content.startsWith(`${prefix}help`)){
		message.reply(helpMessage);
	}
	if (message.content.startsWith(`${prefix}list`)){
		list(message);
	}
})



function list(message){
	let messageList = "The following songs can be played : \n"
	for (const [key, value] of Object.entries(musicIds)) {
  		messageList += `**${key}** : ${value}\n`;
	}
	message.reply(messageList);
}

function play(message,arg){
	let music = musicDirectory+musicIds[arg];
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(music).on("finish", () => {VoiceConnection.disconnect()});
    	}).catch(e => {
			console.log(e);
			message.channel.send(argErrorMessage);
    	})
}

function loop(message,arg){
	let music = musicDirectory+musicIds[arg];
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(title).on("finish", () => {loop(message,arg)});
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

function getArg(message){
	const arg = message.content.slice(prefix.length).trim().split(' ')[1];
	return arg;
}

