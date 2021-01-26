const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const {
	prefix,
	token,
} = require('./config.json');
const client = new Discord.Client();

const mp3Extension = ".mp3";
const muteFileName = "mute";
const argErrorMessage = "File not found, please retry and with another argument";


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

//TODO: commande qui donne des infos sur les musiques possibles
//TODO: commande qui joue une musique random parmi un theme
//TODO: help command
//TODO: bug - message d'erreur ne s'affiche pas quand la musique n'est pas trouvée
//TODO: !quit command qui fait déconnecter le bot

client.on('message', async message => {

	if (message.author.bot) return;
  	if (!message.content.startsWith(prefix)) return;

	if (message.content.startsWith(`${prefix}kobrok`)){
		message.channel.send("Kobrok is so clever and powerful! Also really handsome! :heart_eyes:");
	}

	if (message.content.startsWith(`${prefix}play`)){
		message.reply("Playing ...");
		const args = getArg(message);
		play(message,args+mp3Extension);
	}
	if (message.content.startsWith(`${prefix}loop`)){
		message.reply("Looping ...");
		const args = getArg(message);
		loop(message,args+mp3Extension);
	}
	if (message.content.startsWith(`${prefix}stop`)){
		message.reply("Ok, I stop playing ...");
		loop(message,muteFileName+mp3Extension);
	}
	if (message.content.startsWith(`${prefix}quit`)){
		message.reply("Ok, I disconnect ...");
		disconnect(message);
	}
})




function play(message,title){
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(title).on("finish", () => {VoiceConnection.disconnect()});
    	}).catch(e => {
			console.log(e);
			message.channel.send(argErrorMessage);
    	})
}

function loop(message,title){
	message.member.voice.channel.join().then(VoiceConnection => {
			VoiceConnection.play(title).on("finish", () => {loop(message,title)});
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

