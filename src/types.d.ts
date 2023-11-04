import {
  CommandInteraction,
  ChatInputApplicationCommandData,
  Client,
} from 'discord.js'

export type SlashCommand = ChatInputApplicationCommandData & {
  execute: (client: Client, interaction: CommandInteraction) => void
}
