import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js'
import ky from 'ky'
import ApplicationCommand from '../@types/ApplicationCommand'
import { extractItemId, removeExtraSpaces, truncate } from '../utils'
import { itemSearch } from '../aladin/itemSearch'
import { itemLookUp } from '../aladin/itemLookUp'
import { createListEmbed, createShowEmbed } from '../embedBuilder'

export const showCommand = new ApplicationCommand({
  data: new SlashCommandBuilder()
    .setName('show')
    .setDescription('상품 검색')
    .addStringOption((option) =>
      option.setName('검색어').setDescription('검색어').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('검색어-종류')
        .setDescription('검색어 종류')
        .setRequired(false)
        .addChoices(
          { name: '제목+저자', value: 'Keyword' },
          { name: '제목', value: 'Title' },
          { name: '저자', value: 'Author' },
          { name: '출판사', value: 'Publisher' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('검색-대상')
        .setDescription('검색 대상 Mall')
        .setRequired(false)
        .addChoices(
          { name: '도서', value: 'Book' },
          { name: '외국도서', value: 'Foreign' },
          { name: '음반', value: 'Music' },
          { name: 'dvd', value: 'DVD' },
          { name: '중고', value: 'Used' },
          { name: '전자책', value: 'eBook' },
          { name: '통합검색', value: 'All' }
        )
    ) as SlashCommandBuilder,
  execute: async (interaction: ChatInputCommandInteraction) => {
    const count = interaction.options.getInteger('개수') || 4
    const query = interaction.options.getString('검색어', true)
    const queryType = (interaction.options.getString('검색어-종류') ||
      'Keyword') as QueryType['value']
    const searchTarget = (interaction.options.getString('검색-대상') ||
      'All') as SearchTarget['value']

    let start = 1
    try {
      const { item, totalResults } = await itemSearch(
        count,
        query,
        queryType,
        searchTarget,
        start
      )

      const bookInfos = item.map((i: any): [string, string] => [
        `${truncate(removeExtraSpaces(i.title), 200)} | ${truncate(
          removeExtraSpaces(i.author),
          40
        )}`,
        i.link,
      ])

      const maxPages = Math.ceil(totalResults / count)

      const button1 = new ButtonBuilder()
        .setLabel('1')
        .setCustomId('1')
        .setStyle(ButtonStyle.Secondary)
      const button2 = new ButtonBuilder()
        .setLabel('2')
        .setCustomId('2')
        .setStyle(ButtonStyle.Secondary)
      const button3 = new ButtonBuilder()
        .setLabel('3')
        .setCustomId('3')
        .setStyle(ButtonStyle.Secondary)
      const button4 = new ButtonBuilder()
        .setLabel('4')
        .setCustomId('4')
        .setStyle(ButtonStyle.Secondary)
      const nextButton = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('다음 페이지')
        .setStyle(ButtonStyle.Primary)
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        button1,
        button2,
        button3,
        button4,
        nextButton
      )

      const embed = createListEmbed(
        query,
        totalResults,
        bookInfos,
        start,
        maxPages,
        searchTarget,
        queryType
      )

      const response = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      })

      let continueLoop = true
      let itemId = undefined
      while (continueLoop && !itemId) {
        try {
          const { item, totalResults } = await itemSearch(
            count,
            query,
            queryType,
            searchTarget,
            start
          )

          const bookInfos = item.map((i: any): [string, string] => [
            `${truncate(removeExtraSpaces(i.title), 150)} | ${truncate(
              removeExtraSpaces(i.author),
              30
            )}`,
            i.link,
          ])

          const embed = createListEmbed(
            query,
            totalResults,
            bookInfos,
            start,
            maxPages,
            searchTarget,
            queryType
          )

          const response = await interaction.editReply({
            embeds: [embed],
            components: [row],
          })

          const confirmation = await response.awaitMessageComponent({
            filter: (i) => i.user.id === interaction.user.id,
            componentType: ComponentType.Button,
          })

          if (confirmation.customId === 'next_page') {
            start += start < maxPages ? 1 : 0
          } else if (confirmation.customId === 'previous_page') {
            start -= start > 1 ? 1 : 0
          } else {
            itemId = extractItemId(
              bookInfos[parseInt(confirmation.customId) - 1][1]
            )
            break
          }

          await confirmation.deferUpdate()
        } catch (err) {
          console.error(err)
          continueLoop = false
          await interaction.followUp({
            content: ':x: 에러가 발생했습니다.',
            ephemeral: true,
          })
        }
      }

      try {
        const detailData = await itemLookUp(itemId as string)
        const { title, link, description, author, publisher, pubDate, cover } =
          detailData.item[0]

        const embed = createShowEmbed(title, link, description, author, publisher, pubDate, cover);

        await interaction.editReply({
          embeds: [embed],
          components: [],
        })
      } catch (err) {
        if (err instanceof Error) {
          if (
            err.message ===
            'Collector received no interactions before ending with reason: time'
          ) {
            await interaction.editReply({
              content: ':clock: 선택 시간이 초과되었습니다.',
              components: [],
            })
          } else {
            throw err
          }
        }
      }
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        if (err.message === 'No Search Result') {
          await interaction.reply({
            content: '😮 검색 결과가 없습니다.',
            ephemeral: true,
          })
        } else {
          await interaction.reply({
            content: ':x: 에러가 발생했습니다.',
            ephemeral: true,
          })
        }
      }
    }
  },
})

export default showCommand
