export const useAuth = () => {
    return useState<string | null>('user', () => null)
  }