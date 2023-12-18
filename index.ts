import { Client, Interaction } from 'discord.js'
import commands from './src/aladin'

const client = new Client({
  intents: [],
})

const DISCORD_TOKEN = process.env.DISCORD_TOKEN

const startBot = async () => {
  await client.login(DISCORD_TOKEN)
  console.info('info: login success!')

  client.on('ready', async () => {
    if (client.application) {
      await client.application.commands.set(commands)
      console.log('info: command registered')
    }
  })

  //핸들링 로직 추가
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      //등록한 명령어를 찾아서
      const currentCommand = commands.find(
        ({ name }) => name === interaction.commandName
      )

      if (currentCommand) {
        await interaction.deferReply()
        //실행해준다.
        currentCommand.execute(client, interaction)
        console.log(`info: command ${currentCommand.name} handled correctly`)
      }
    }
  })
}
startBot()
