import { EmbedBuilder, Message } from 'discord.js'
import { generateUrlQueryForType, removeExtraSpaces, truncate } from './utils'

export function createListEmbed(
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
      ...bookInfos.map((bookInfo: [string, string], idx) => {
        return {
          name: `:number_${idx + 1}: ${bookInfo[0]}`,
          value: `[자세히 보기](${bookInfo[1]})`,
          inline: false,
        }
      })
    )
    .setColor('#eb3b94')
    .setTimestamp()
}

export function createShowEmbed(
  title: string,
  link: string,
  description: string,
  author: string,
  publisher: string,
  pubDate: string,
  cover: string
): EmbedBuilder {
  return new EmbedBuilder()
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
}
