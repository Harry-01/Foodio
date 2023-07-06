import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(req: Request) {
    const url = new URL(req.url)

    const session = await getAuthSession()

    let followedCommunitiesIds: string[] = []

    if (session) {
        const followedCommunities = await db.subscription.findMany({
            where :{
                userId: session.user.id,
            },
            include: {
                dish: true
            }
        })

        followedCommunitiesIds = followedCommunities.map(
            ({dish}) => dish.id
        )
    }

    try {
        const { limit, page, dishName } = z.object({
            limit: z.string(),
            page: z.string(),
            dishName: z.string().nullish().optional(),
        }).parse({
            dishName: url.searchParams.get('dishName'),
            limit: url.searchParams.get('limit'),
            page: url.searchParams.get('page')
        })

        let whereClause = {}

        if (dishName) {
            whereClause = {
                dish: {
                    name: dishName,
                }
            }
        } else if (session) {
            whereClause = {
                dish: {
                    id: {
                        in: followedCommunitiesIds,
                    },
                },
            }
        }

        const posts = await db.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                dish: true,
                votes: true,
                author: true,
                comments: true,
            },
            where: whereClause,
        })

        return new Response(JSON.stringify(posts))

    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response('Invalid request data passed', { status: 422 })
        }

        return new Response("could not fetch more posts", { status: 500 })
    }
}