import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js'
import { generateUrlQueryForType, removeExtraSpaces, truncate } from '../utils'
import ApplicationCommand from '../@types/ApplicationCommand'
import { itemSearch } from '../aladin/itemSearch'

function createEmbed(
  query: string,
  totalResults: number,
  bookInfos: [string, string][],
  start: number,
  maxPages: number,
  searchTarget: string,
  queryType: QueryType['value']
): EmbedBuilder {
  return new EmbedBuilder()
    .setAuthor({
      name: '알라딘 도서검색',
      iconURL: 'https://image.aladin.co.kr/img/m/2018/shopping_app1.png',
    })
    .setTitle(`검색결과: ${query} | ${start} / ${maxPages}페이지`)
    .setURL(
      `http://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodeURIComponent(
        query
      )}&SearchTarget=${searchTarget}&${generateUrlQueryForType(queryType)}`
    )
    .setDescription(`총 ${totalResults}건 검색`)
    .addFields(
      ...bookInfos.map((bookInfo: [string, string]) => {
        return {
          name: bookInfo[0],
          value: `[자세히 보기](${bookInfo[1]})`,
          inline: false,
        }
      })
    )
    .setColor('#eb3b94')
    .setTimestamp()
}

export const searchCommand = new ApplicationCommand({
  data: new SlashCommandBuilder()
    .setName('search')
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

  execute: async (interaction) => {
    const count = interaction.options.getInteger('개수') || 5
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

      const nextButton = new ButtonBuilder()
        .setCustomId('next_page')
        .setLabel('다음 페이지')
        .setStyle(ButtonStyle.Primary)
      const previousButton = new ButtonBuilder()
        .setCustomId('previous_page')
        .setLabel('이전 페이지')
        .setStyle(ButtonStyle.Secondary)
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        previousButton,
        nextButton
      )

      const embed = createEmbed(
        query,
        totalResults,
        bookInfos,
        start,
        maxPages,
        searchTarget,
        queryType
      )

      const response = await interaction.reply({
        embeds: [],
        components: [row],
        fetchReply: true,
      })

      let continueLoop = true
      while (continueLoop) {
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

          const embed = new EmbedBuilder()
            .setAuthor({
              name: '알라딘 도서검색',
              iconURL:
                'https://image.aladin.co.kr/img/m/2018/shopping_app1.png',
            })
            .setTitle(`검색결과: ${query} |  ${start} / ${maxPages}페이지`)
            .setURL(
              `http://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodeURIComponent(
                query
              )}&SearchTarget=${searchTarget}&${generateUrlQueryForType(
                queryType
              )}`
            )
            .setDescription(`총 ${totalResults}건 검색`)
            .addFields(
              ...bookInfos.map((bookInfo: [string, string]) => {
                return {
                  name: bookInfo[0],
                  value: `[자세히 보기](${bookInfo[1]})`,
                  inline: false,
                }
              })
            )
            .setColor('#eb3b94')
            .setTimestamp()

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
    } catch (err) {
      console.error(err)
      await interaction.reply({
        content: ':x: 에러가 발생했습니다.',
        ephemeral: true,
      })
    }
  },
})

// https://embed.dan.onl/
