import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import PostFeed from "./PostFeed"
import { getAuthSession } from "@/lib/auth"
import { Truculenta } from "next/font/google"

const CustomFeed = async () => {
    const session = await getAuthSession()

    const followedCommunities = await db.subscription.findMany({
        where: {
            userId: session?.user.id,
        },
        include: {
            dish: true,
        },
    })

    const posts = await db.post.findMany({
        where: {
            dish: {
                name: {
                    in: followedCommunities.map(({ dish }) => dish.id),
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            dish: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
    })
    return <PostFeed initialPosts={posts}/>
} 
export default CustomFeed