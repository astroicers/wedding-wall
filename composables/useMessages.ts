export const useMessages = () => {
    return useState<{ name: string, text: string, photo?: string }[]>('messages', () => [])
  }