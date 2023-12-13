import dotenv from 'dotenv';
import {Client, GatewayIntentBits} from 'discord.js';
import {createAudioPlayer, createAudioResource, joinVoiceChannel} from '@discordjs/voice';
import * as googleTTS from 'google-tts-api';

dotenv.config();

const BOT_TOKEN = process.env['BOT_TOKEN']!;
const GUILD_ID = process.env['GUILD_ID']!;
const VOICE_CHANNEL_ID = process.env['VOICE_CHANNEL_ID']!;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.login(BOT_TOKEN);

client.once('ready', (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

let voiceConnection;
const audioPlayer = createAudioPlayer();

const closeTTSUrl = googleTTS.getAudioUrl('저는 이만 가볼게요', {lang: 'ko'});
const closeAudioResource = createAudioResource(closeTTSUrl);

let ttsTimeout;
let disconnectTimeout;

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    try {
        const ttsUrl = googleTTS.getAudioUrl(msg.content, {lang: 'ko', slow: false});
        const audioResource = createAudioResource(ttsUrl);

        voiceConnection = joinVoiceChannel({
            channelId: VOICE_CHANNEL_ID,
            guildId: GUILD_ID,
            adapterCreator: msg.guild?.voiceAdapterCreator!,
        });

        voiceConnection.subscribe(audioPlayer);

        audioPlayer.play(audioResource);
    } finally {
        clearTimeout(ttsTimeout);
        clearTimeout(disconnectTimeout);

        ttsTimeout = setTimeout(() => audioPlayer.play(closeAudioResource), 12_000);
        disconnectTimeout = setTimeout(() => voiceConnection.destroy(), 15_000);
    }
});
