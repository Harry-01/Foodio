import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { notFound } from "next/navigation";
import MiniCreatePost from "@/components/MiniCreatePost";

interface PageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: PageProps) => {
  const { slug } = params;
  const session = await getAuthSession();

  const dish = await db.dish.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          dish: true,
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!dish) return notFound();
  return (
    <>
      <h1 className="bold-bold text-3xl md:text-4xl h-14">dish/{dish.name}</h1>
      <MiniCreatePost session={session}/>
      <PostFeed />
    </>
  );
};

export default page;
