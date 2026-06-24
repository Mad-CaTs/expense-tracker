import { useQuery } from '@tanstack/react-query'

import { getCardBackgrounds } from '@/lib/api/cardBackgrounds'

export function useCardBackgrounds() {
  return useQuery({
    queryKey: ['card-backgrounds'],
    queryFn: getCardBackgrounds,
  })
}
