import { EmbedBuilder } from 'discord.js'
import { generateUrlQueryForType } from './utils'

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
