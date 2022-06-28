export const bettingPayout = ({ total, value }: { total: number; value: number }) => {
  const result = (total - value) / value + 1
  return result
}
