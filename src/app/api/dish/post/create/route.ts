import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DishSubscriptionValidator } from "@/lib/validators/dish";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if(!session?.user) {
            return new Response('Unauthorized', {status: 401})
        }
        const body = await req.json()

        const {dishId, title, content} = PostValidator.parse(body)

        const subscriptionExists = await db.subscription.findFirst({
            where: {
                dishId,
                userId: session.user.id,
            }
        })

        if(!subscriptionExists) {
            return new Response('Subscribe to post', {
                status: 400,
            })
        }

        await db.post.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                dishId,
            }
        })

        return new Response(dishId)
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response('Invalid POST request data passed', { status: 422 })
        }

        return new Response("Could not post to dish at this time, please try again later.", { status: 500 })
    }
}