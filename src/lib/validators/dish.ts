import { z } from 'zod'

export const DishValidator = z.object({
    name: z.string().min(3).max(21),
})

export const DishSubscriptionValidator = z.object({
    dishId: z.string(),
})

export type CreateDishPayload = z.infer<typeof DishValidator>
export type SubscribeToDishPayload = z.infer<typeof DishSubscriptionValidator>