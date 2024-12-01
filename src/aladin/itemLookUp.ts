import ky from 'ky'

export const itemLookUp = async (itemId: string) => {
  const detailURL = `http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${process.env.ALADIN_TOKEN}&itemId=${itemId}&itemIdtype=ItemId&Cover=MidBig&output=js&Version=20131101`
  const response = await ky.get<ItemLookUpResponse>(detailURL).json()

  return response
}
