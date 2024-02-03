import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  EmbedBuilder,
  Interaction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import type { SlashCommand } from './@types/discord'
import { extractItemId, removeExtraSpaces, truncate } from './utils'
import axios from 'axios'

//The option names should be all lowercased,
export const show: SlashCommand = {
  name: 'show',
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
      const { data } = await axios<ItemSearchResponse>(URL)

      const { item, totalResults } = data
      if (totalResults == 0) {
        throw new Error('No Search Result')
      }
      const bookInfos = item.map((i: any): [string, string, string] => [
        `${truncate(removeExtraSpaces(i.title), 50)}`,
        `${truncate(removeExtraSpaces(i.author), 50)}`,
        i.link,
      ])

      const select = new StringSelectMenuBuilder()
        .setCustomId('items')
        .setPlaceholder('소개할 항목을 고르세요')
        .addOptions(
          ...bookInfos.map((bookInfo) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(bookInfo[0])
              .setDescription(bookInfo[1])
              .setValue(bookInfo[2])
          )
        )

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        select
      )

      const response = await interaction.followUp({
        components: [row],
      })

      const collectorFilter = (i: Interaction) =>
        i.user.id === interaction.user.id

      const confirmation = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 15_000,
      })
      if (confirmation.customId == 'items') {
        const itemId = extractItemId((confirmation as any).values[0])
        const URL = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${process.env.ALADIN_TOKEN}&itemId=${itemId}&itemIdtype=ItemId&output=js&Version=20131101`

        const { data } = await axios.get<ItemLookUpResponse>(URL)
        const { title, link, description, author, publisher, pubDate, cover } =
          data.item[0]

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
          .setThumbnail(cover)
          .setColor('#eb3b94')
          .setTimestamp()

        await interaction.editReply({
          embeds: [embed],
          components: [],
        })
      }
    } catch (err) {
      console.error(err)
      if (
        (err as Error).message ==
        'Collector received no interactions before ending with reason: time'
      ) {
        await interaction.editReply({
          content: ':clock: 선택 시간이 초과되었습니다.',
          components: [],
        })
      } else if ((err as Error).message == 'No Search Result') {
        await interaction.editReply({
          content: '😮 검색 결과가 없습니다.',
          components: [],
        })
      } else {
        await interaction.followUp({
          content: ':x: 에러가 발생했습니다.',
          components: [],
        })
      }
    }
  },
}

// https://embed.dan.onl/
