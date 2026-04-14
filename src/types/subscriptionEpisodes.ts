import { CreateSubscriptionEpisodeInput, SubscriptionEpisode } from "./subscriptions"

export interface SubscriptionEpisodesStore {
  create(input: CreateSubscriptionEpisodeInput): SubscriptionEpisode

  update(input: CreateSubscriptionEpisodeInput): SubscriptionEpisode

  get(id: string): SubscriptionEpisode | null

  list(): SubscriptionEpisode[]

  listForSubscription(id: string): SubscriptionEpisode[]

  delete(id: string): void

  markListened(id: string): void
}
