export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type Reward = {
  id: string
  name: string
  rarity: Rarity
  weight: number
  emoji: string
  message: string
  color: string
}

export const REWARDS: Reward[] = [
  { id: 'sweet-treat', name: 'Sweet Treat', rarity: 'COMMON', weight: 20, emoji: '🧁', color: '#ff9dcf', message: 'May your days be as sweet as this little treat!' },
  { id: 'virtual-flowers', name: 'Virtual Flowers', rarity: 'COMMON', weight: 18, emoji: '💐', color: '#ff80b8', message: 'May you always bloom in your own beautiful way.' },
  { id: 'hug-token', name: 'Hug Token', rarity: 'COMMON', weight: 16, emoji: '💗', color: '#ff5caa', message: 'Sending you a big virtual hug!' },
  { id: 'happy-cloud', name: 'Happy Cloud', rarity: 'COMMON', weight: 14, emoji: '☁️', color: '#9defff', message: 'Wishing you more happy days and fewer stressful ones.' },
  { id: 'pink-energy', name: 'Pink Energy', rarity: 'COMMON', weight: 12, emoji: '🧋', color: '#ff72b6', message: 'May your energy stay high and your coffee stay strong!' },
  { id: 'magic-wish', name: 'Magic Wish', rarity: 'RARE', weight: 7, emoji: '🪄', color: '#c8a1ff', message: 'One little wish for a wonderful you. Keep shining!' },
  { id: 'mystery-gift', name: 'Mystery Gift', rarity: 'RARE', weight: 5, emoji: '🎁', color: '#ffcf70', message: 'A little mystery, a little magic, and a lot of happiness!' },
  { id: 'diamond-luck', name: 'Diamond Luck', rarity: 'RARE', weight: 4, emoji: '💎', color: '#74eaff', message: 'May good luck find you wherever you go!' },
  { id: 'queen-award', name: 'Queen Award', rarity: 'EPIC', weight: 2.5, emoji: '🏆', color: '#ffd166', message: 'Today is your reminder that you deserve to shine!' },
  { id: 'legendary-queen', name: 'Legendary Queen', rarity: 'LEGENDARY', weight: 1.5, emoji: '👑', color: '#ffe27a', message: 'LEGENDARY DROP! Keep shining, keep growing, and keep being wonderfully you!' },
]

export function validateRewardWeights(rewards: Reward[] = REWARDS): boolean {
  return rewards.length === 10 && rewards.every(r => Number.isFinite(r.weight) && r.weight >= 0)
    && Math.abs(rewards.reduce((sum, r) => sum + r.weight, 0) - 100) < 0.0001
}

export function weightedRandomReward(rewards: Reward[] = REWARDS): Reward {
  const total = rewards.reduce((sum, reward) => sum + reward.weight, 0)
  if (!rewards.length || rewards.some(r => !Number.isFinite(r.weight) || r.weight < 0) || total <= 0 || Math.abs(total - 100) > 0.0001) {
    throw new Error('Reward weights must be valid and add up to exactly 100%.')
  }
  let roll = Math.random() * total
  for (const reward of rewards) {
    roll -= reward.weight
    if (roll < 0) return reward
  }
  return rewards[rewards.length - 1]
}