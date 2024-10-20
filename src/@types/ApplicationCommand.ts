import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js'
import type SubCommand from './SubCommand.js'

export default class ApplicationCommand {
  data:
    | SlashCommandBuilder
    | ContextMenuCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
  hasSubCommands: boolean
  subCommands: Map<string, SubCommand>
  execute?: (interaction: ChatInputCommandInteraction) => Promise<void> | void
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void> | void

  constructor(options: {
    data:
      | SlashCommandBuilder
      | ContextMenuCommandBuilder
      | SlashCommandSubcommandsOnlyBuilder
    hasSubCommands?: boolean
    subCommands?: SubCommand[]
    execute?: (interaction: ChatInputCommandInteraction) => Promise<void> | void
    autocomplete?: (
      interaction: AutocompleteInteraction
    ) => Promise<void> | void
  }) {
    this.data = options.data
    this.hasSubCommands = options.hasSubCommands ?? false
    this.subCommands = new Map()

    if (this.hasSubCommands && options.subCommands) {
      for (const subCommand of options.subCommands) {
        this.subCommands.set(subCommand.data.name, subCommand)
      }

      this.execute = async (interaction: ChatInputCommandInteraction) => {
        const subCommandGroup = interaction.options.getSubcommandGroup()
        const commandName = interaction.options.getSubcommand()

        if (!commandName) {
          await interaction.reply({
            content: "I couldn't understand that command!",
            ephemeral: true,
          })
        } else {
          const fullCommandName = subCommandGroup
            ? `${subCommandGroup}/${commandName}`
            : commandName
          const command = this.subCommands.get(fullCommandName)

          if (command) {
            try {
              await command.execute(interaction)
            } catch (error) {
              console.error(error)
              await interaction.reply({
                content:
                  'An error occurred when attempting to execute that command!',
                ephemeral: true,
              })
            }
          } else {
            await interaction.reply({
              content: 'Unknown subcommand!',
              ephemeral: true,
            })
          }
        }
      }

      this.autocomplete = async (interaction: AutocompleteInteraction) => {
        const subCommandGroup = interaction.options.getSubcommandGroup()
        const subCommandName = interaction.options.getSubcommand()

        if (subCommandGroup || subCommandName) {
          const fullCommandName = subCommandGroup
            ? `${subCommandGroup}/${subCommandName}`
            : subCommandName
          const subCommand = this.subCommands.get(fullCommandName)

          if (subCommand && subCommand.autocomplete) {
            try {
              await subCommand.autocomplete(interaction)
            } catch (error) {
              console.error(error)
              await interaction.respond([
                {
                  name: 'Failed to autocomplete',
                  value: 'error',
                },
              ])
            }
          }
        }
      }
    } else if (options.execute) {
      this.execute = options.execute
    } else {
      throw new Error('No execute function provided')
    }

    if (!this.hasSubCommands) {
      this.autocomplete = options.autocomplete
    }
  }
}
