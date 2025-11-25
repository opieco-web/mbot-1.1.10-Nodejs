import { SlashCommandBuilder } from 'discord.js';

export const musicCommands = [
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from an attached audio file')
        .addAttachmentOption(option => 
            option.setName('file')
                .setDescription('Audio file to play (.mp3, .wav, .flac, .ogg, .m4a)')
                .setRequired(true)
        )
];

export function createMusicControlPanel(track, user, volume = 100, status = "Playing") {
    return {
        content: ' ',
        components: [{
            type: 17,
            components: [
                {
                    type: 9,
                    components: [
                        {
                            type: 10,
                            content: `-# Queued by <@${user.id}>\n### [${track.name}](${track.url})\n${track.artist} ${track.length}\n-# Volume: ${volume}%`
                        }
                    ],
                    accessory: {
                        type: 11,
                        media: {
                            url: track.thumbnail
                        }
                    }
                },
                {
                    type: 14,
                    spacing: 1
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 1, label: 'View Queue', custom_id: 'music_queue' },
                        { type: 2, style: 1, label: 'Previous Song', custom_id: 'music_prev' },
                        { type: 2, style: 1, label: 'Play / Pause', custom_id: 'music_toggle' },
                        { type: 2, style: 1, label: 'Next Song', custom_id: 'music_next' },
                        { type: 2, style: 1, label: 'Loop Toggle', custom_id: 'music_loop' }
                    ]
                },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 1, label: 'Settings', custom_id: 'music_settings' },
                        { type: 2, style: 1, label: 'Lyrics', custom_id: 'music_lyrics' },
                        { type: 2, style: 4, label: 'Disconnect', custom_id: 'music_leave' },
                        { type: 2, style: 1, label: '24/7 Mode', custom_id: 'music_247' },
                        { type: 2, style: 1, label: 'Add to Queue', custom_id: 'music_addqueue' }
                    ]
                },
                {
                    type: 10,
                    content: status
                }
            ]
        }],
        flags: 32768
    };
}
