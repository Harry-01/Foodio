import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DishSubscriptionValidator } from "@/lib/validators/dish";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }
        const body = await req.json()

        const {dishId} = DishSubscriptionValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                dishId,
                userId: session.user.id,
            }
        })

        if(subscriptionExists) {
            return new Response('You are already subscibed to this dish', {
                status: 400,
            })
        }

        await db.subscription.create({
            data: {
                dishId,
                userId: session.user.id,
            },
        })

        return new Response(dishId)
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 })
        }

        return new Response("could not subscribe, please try again later", { status: 500 })
    }
}