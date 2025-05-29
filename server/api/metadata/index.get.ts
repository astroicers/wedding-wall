import { streamToBuffer } from '~/server/utils/stream'

export default defineEventHandler(async () => {
  const bucket = 'wedding-wall'
  const stream = MinioClient.listObjects(bucket, 'metadata/', true)

  const all = []
  for await (const obj of stream) {
    const res = await MinioClient.getObject(bucket, obj.name)
    const buf = await streamToBuffer(res)
    all.push(JSON.parse(buf.toString()))
  }

  // 按照時間排序（最新在後）
  all.sort((a, b) => (a.photo > b.photo ? 1 : -1))
  return all
})