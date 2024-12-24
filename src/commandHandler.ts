import { REST } from '@discordjs/rest'
import { Routes, Client } from 'discord.js'
import { searchCommand } from './command/search'
import { showCommand } from './command/show'
import { oldShowCommand } from './command/oldShow'

const commands = [searchCommand, showCommand, oldShowCommand]

const { DISCORD_TOKEN, CLIENT_ID } = process.env

export async function registerCommands(client: Client) {
  if (!client.application) {
    console.error('Client application is not available')
    return
  }

  const commandData = commands.map((command) => command.data.toJSON())

  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN as string)

  try {
    console.log('Started refreshing application (/) commands.')

    // Clear existing commands
    await rest.put(Routes.applicationCommands(CLIENT_ID as string), {
      body: [],
    })

    // Register new commands
    await rest.put(Routes.applicationCommands(CLIENT_ID as string), {
      body: commandData,
    })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error('Error refreshing application commands:', error)
  }
}

export function setupCommandHandler(client: Client) {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const { commandName } = interaction
    const command = commands.find((cmd) => cmd.data.name === commandName)

    if (command) {
      try {
        // @ts-ignore
        await command.execute(interaction)
        console.log(`Command ${commandName} handled successfully`)
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error)
        await interaction.reply({
          content: '명령어 실행 중 오류가 발생했습니다.',
          ephemeral: true,
        })
      }
    }
  })
}
