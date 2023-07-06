import { Comment, Post, Dish, User, Vote} from '@prisma/client';
export type ExtendedPost = Post & {
    dish: Dish,
    votes: Vote[],
    author: User,
    comments: Comment[]
}