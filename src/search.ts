import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import type { SlashCommand } from './@types/discord'
import { generateUrlQueryForType, removeExtraSpaces, truncate } from './utils'
import axios from 'axios'

//The option names should be all lowercased,
export const search: SlashCommand = {
  name: 'search',
  description: '상품 검색',
  options: [
    {
      required: true,
      name: '검색어',
      description: '검색어',
      type: ApplicationCommandOptionType.String,
    },
    {
      required: false,
      name: '개수',
      description: '몇 건의 검색을 볼지 정합니다.',
      type: ApplicationCommandOptionType.Integer,
    },
    {
      name: '검색어-종류',
      description: '검색어 종류',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: '제목+저자',
          value: 'Keyword',
        },
        {
          name: '제목',
          value: 'Title',
        },
        {
          name: '저자',
          value: 'Author',
        },
        {
          name: '출판사',
          value: 'Publisher',
        },
      ],
    },
    {
      name: '검색-대상',
      description: '검색 대상 Mall',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: '도서',
          value: 'Book',
        },
        {
          name: '외국도서',
          value: 'Foreign',
        },
        {
          name: '음반',
          value: 'Music',
        },
        {
          name: 'dvd',
          value: 'DVD',
        },
        {
          name: '중고',
          value: 'Used',
        },
        {
          name: '전자책',
          value: 'eBook',
        },
        {
          name: '통합검색',
          value: 'All',
        },
      ],
    },
  ],
  execute: async (_, interaction) => {
    const count = (interaction.options.get('개수')?.value || 5) as number
    const query = interaction.options.get('검색어')?.value as string
    const queryType = (interaction.options.get('검색어-종류')?.value ||
      'Keyword') as QueryType['value']
    const searchTarget = (interaction.options.get('검색-대상')?.value ||
      'All') as SearchTarget['value']

    const URL = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${
      process.env.ALADIN_TOKEN
    }&Query=${encodeURIComponent(
      String(query)
    )}&QueryType=${queryType}&MaxResults=${count}&start=1&SearchTarget=${searchTarget}&output=js&Version=20131101`

    try {
      console.log(URL)
      const data = await axios<ItemSearchResponse>(URL)

      const { item, totalResults } = data.data
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
            String(query)
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
      await interaction.followUp({
        embeds: [embed],
      })
    } catch (err) {
      console.error(err)
      const embed = new EmbedBuilder()
        .setAuthor({
          name: '알라딘 도서검색',
          iconURL: 'https://image.aladin.co.kr/img/m/2018/shopping_app1.png',
        })
        .setTitle(`검색오류`)
        .setDescription(`검색 중 오류 발생`)
        .setColor('#eb3b94')
        .setTimestamp()
      await interaction.followUp({
        embeds: [embed],
      })
    }
  },
}

// https://embed.dan.onl/
