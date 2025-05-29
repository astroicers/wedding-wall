import formidable from 'formidable'
import { MinioClient } from '~/server/utils/minio'
import { readFile } from 'fs/promises'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
  const form = formidable({ keepExtensions: true, multiples: false })

  const { fields, files } = await new Promise<any>((resolve, reject) => {
    form.parse(event.req, (err, fields, files) => {
      if (err || !files.file) return reject(err || new Error('No file'))
      resolve({ fields, files })
    })
  })

  const file = files.file[0]
  const fileBuffer = await readFile(file.filepath)
  const filename = `${Date.now()}-${file.originalFilename}`
  const bucket = 'wedding-wall'

  await MinioClient.putObject(bucket, filename, fileBuffer)

  const metadata = {
    name: fields.name?.[0] || '匿名',
    text: fields.text?.[0] || '',
    photo: `/api/image/${encodeURIComponent(filename)}`
  }

  const metadataJson = Buffer.from(JSON.stringify(metadata, null, 2))
  const metadataFilename = `metadata/${Date.now()}-${randomUUID()}.json`

  await MinioClient.putObject(bucket, metadataFilename, metadataJson)

  return {
    url: metadata.photo
  }
})
