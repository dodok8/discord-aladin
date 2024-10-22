import { Client, GatewayIntentBits } from 'discord.js'
import { registerCommands, setupCommandHandler } from './src/commandHandler'

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

const DISCORD_TOKEN = process.env.DISCORD_TOKEN

const startBot = async () => {
  await client.login(DISCORD_TOKEN)
  console.info('로그인 성공!')

  client.once('ready', async () => {
    await registerCommands(client)
    setupCommandHandler(client)
    console.log('봇이 준비되었습니다!')
  })
}

startBot()
