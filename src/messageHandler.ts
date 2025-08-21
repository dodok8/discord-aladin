import { Client, Message } from 'discord.js'
import ky from 'ky'
import { extractItemId } from './utils'
import { resolveShortUrl } from './browser'
import { createShowEmbed } from './embedBuilder'
import { itemLookUp } from './aladin/itemLookUp'
// import { createMessageContentEmbed } from './embedBuilder'

export function setupMessageHandler(client: Client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return

    try {
      let itemId = ''
      if (
        message.content.startsWith(
          'https://www.aladin.co.kr/shop/wproduct.aspx'
        )
      ) {
        itemId = extractItemId(message.content)
      } else if (message.content.startsWith('http://aladin.kr/p/')) {
        const url = await resolveShortUrl(message.content)
        if (url == null) {
          return
        }
        itemId = extractItemId(url)
      } else {
        return
      }

      const detailData = await itemLookUp(itemId)
      const { title, link, description, author, publisher, pubDate, cover } =
        detailData.item[0]

      const embed = createShowEmbed(
        title,
        link,
        description,
        author,
        publisher,
        pubDate,
        cover
      )

      await message.reply({ embeds: [embed] })
    } catch (error) {
      console.error('Error processing message:', error)
    }
  })
}
