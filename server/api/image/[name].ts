import { MinioClient } from '~/server/utils/minio'

export default defineEventHandler(async (event) => {
  try {
    const name = decodeURIComponent(event.context.params?.name || '')
    if (!name) throw createError({ statusCode: 400, message: 'Invalid image name' })

    const stream = await MinioClient.getObject('wedding-wall', name)

    const ext = name.split('.').pop()?.toLowerCase()
    const contentType = ext === 'png' ? 'image/png'
                      : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg'
                      : 'application/octet-stream'

    setHeader(event, 'Content-Type', contentType)
    return sendStream(event, stream)
  } catch (err) {
    console.error('[IMAGE]', err)
    throw createError({ statusCode: 404, message: 'Image not found' })
  }
})
