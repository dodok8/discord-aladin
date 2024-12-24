import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} from 'discord.js'
import ky from 'ky'
import ApplicationCommand from '../@types/ApplicationCommand'
import { extractItemId, removeExtraSpaces, truncate } from '../utils'
import { itemSearch } from '../aladin/itemSearch'
import { itemLookUp } from '../aladin/itemLookUp'

export const oldShowCommand = new ApplicationCommand({
  data: new SlashCommandBuilder()
    .setName('oldshow')
    .setDescription('상품 검색')
    .addStringOption((option) =>
      option.setName('검색어').setDescription('검색어').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('개수')
        .setDescription('몇 건의 검색을 볼지 정합니다.')
        .setRequired(false)
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
    const count = interaction.options.getInteger('개수') || 5
    const query = interaction.options.getString('검색어', true)
    const queryType = (interaction.options.getString('검색어-종류') ||
      'Keyword') as QueryType['value']
    const searchTarget = (interaction.options.getString('검색-대상') ||
      'All') as SearchTarget['value']

    try {
      const { item, totalResults } = await itemSearch(
        count,
        query,
        queryType,
        searchTarget,
        1
      )

      if (totalResults === 0) {
        throw new Error('No Search Result')
      }

      const bookInfos = item.map((i: any): [string, string, string] => [
        truncate(removeExtraSpaces(i.title), 50),
        truncate(removeExtraSpaces(i.author), 50),
        i.link,
      ])

      const select = new StringSelectMenuBuilder()
        .setCustomId('items')
        .setPlaceholder('소개할 항목을 고르세요')
        .addOptions(
          bookInfos.map((bookInfo) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(bookInfo[0])
              .setDescription(bookInfo[1])
              .setValue(bookInfo[2])
          )
        )

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        select
      )

      const response = await interaction.reply({
        components: [row],
        fetchReply: true,
      })

      try {
        const confirmation = await response.awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 15_000,
          componentType: ComponentType.StringSelect,
        })

        const itemId = extractItemId(confirmation.values[0])

        const detailData = await itemLookUp(itemId)
        const { title, link, description, author, publisher, pubDate, cover } =
          detailData.item[0]

        const embed = new EmbedBuilder()
          .setAuthor({
            name: '알라딘 상세 보기',
            iconURL: 'https://image.aladin.co.kr/img/m/2018/shopping_app1.png',
          })
          .setTitle(truncate(removeExtraSpaces(title), 50))
          .setURL(link)
          .setDescription(truncate(removeExtraSpaces(description), 240))
          .addFields(
            {
              name: '작가',
              value: truncate(removeExtraSpaces(author), 50),
              inline: false,
            },
            {
              name: '출판사',
              value: truncate(removeExtraSpaces(publisher), 50),
              inline: false,
            },
            {
              name: '출판 날짜',
              value: pubDate,
              inline: true,
            }
          )
          .setImage(cover)
          .setColor('#eb3b94')
          .setTimestamp()

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

export default oldShowCommand
