export async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = []
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    return Buffer.concat(chunks)
  }

export async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    const buffer = await streamToBuffer(stream)
    return buffer.toString('utf-8')
  }