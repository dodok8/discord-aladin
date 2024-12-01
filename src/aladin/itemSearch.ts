import ky from 'ky'

export const itemSearch = async (
  count: number,
  query: string,
  queryType: QueryType['value'],
  searchTarget: SearchTarget['value'],
  start: number
) => {
  const URL = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${
    process.env.ALADIN_TOKEN
  }&Query=${encodeURIComponent(
    query
  )}&QueryType=${queryType}&MaxResults=${count}&start=${start}&SearchTarget=${searchTarget}&output=js&Version=20131101`
  const response = await ky.get<ItemSearchResponse>(URL).json()

  return response
}
