import type {
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  SlashCommandSubcommandBuilder,
} from 'discord.js'

export default class SubCommand {
  data: SlashCommandSubcommandBuilder
  execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void

  constructor(options: {
    data: SlashCommandSubcommandBuilder
    execute: (interaction: ChatInputCommandInteraction) => Promise<void> | void
    autocomplete?: (
      interaction: AutocompleteInteraction
    ) => Promise<void> | void
  }) {
    this.data = options.data
    this.execute = options.execute
    if (options.autocomplete) {
      this.autocomplete = options.autocomplete
    }
  }

  setAutocomplete(
    autocompleteFunction: (
      interaction: AutocompleteInteraction
    ) => Promise<void> | void
  ): void {
    this.autocomplete = autocompleteFunction
  }

  setExecute(
    executeFunction: (
      interaction: ChatInputCommandInteraction
    ) => Promise<void> | void
  ): void {
    this.execute = executeFunction
  }
}
