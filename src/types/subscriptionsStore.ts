import { CreateSubscriptionInput, Subscription } from "./subscriptions"

export interface SubscriptionsStore {
  create(input: CreateSubscriptionInput): Subscription
  update(input: CreateSubscriptionInput): Subscription
  get(id: string): Subscription | null
  list(): Subscription[]
  delete(id: string): void
  updateLastUpdate(sub: string): void
  updateLastListened(id: string): void
  updateLastPublished(id: string, date: number): void
}
