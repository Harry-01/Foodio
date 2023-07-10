import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DishValidator } from "@/lib/validators/dish";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json()
        const { name } = DishValidator.parse(body)

        const dishExists = await db.dish.findFirst({
            where: {
                name,
            },
        })

        if (dishExists) {
            return new Response('Dish already exists', {status: 401})
        }

        const dish = await db.dish.create({
            data: {
                name,
                creatorId: session.user.id,
            },
        })

        await db.subscription.create({
            data: {
                userId: session.user.id,
                dishId: dish.id
            }
        })

        return new Response(dish.name)
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 })
        }

        return new Response("could not create a dish", { status: 500 })
    }
}