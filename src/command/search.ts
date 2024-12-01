import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { generateUrlQueryForType, removeExtraSpaces, truncate } from '../utils'
import ky from 'ky'
import ApplicationCommand from '../@types/ApplicationCommand'
import { itemSearch } from '../aladin/itemSearch'

//The option names should be all lowercased,

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

    try {
      const { item, totalResults } = await itemSearch(
        count,
        query,
        queryType,
        searchTarget,
        1
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
          iconURL: 'https://image.aladin.co.kr/img/m/2018/shopping_app1.png',
        })
        .setTitle(`검색결과 : ${query}`)
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

      await interaction.reply({ embeds: [embed] })
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
