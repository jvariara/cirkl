"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import { getPostDataInclude, getUserDataSelect } from "@/lib/types";
import { extractMentions } from "@/lib/utils";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content, mediaIds } = createPostSchema.parse(input);

  // extract mentions from the post
  const mentionedUsernames = extractMentions(content);

  const mentionedUsers = await prisma.user.findMany({
    where: {
      username: {
        in: mentionedUsernames,
      },
    },
  });

  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachments: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });

  // Create notifications for mentioned users
  await Promise.all(
    mentionedUsers.map((mentionedUser) =>
      prisma.notification.create({
        data: {
          issuerId: user.id,
          recipientId: mentionedUser.id,
          postId: newPost.id,
          type: "MENTION",
        },
      })
    )
  );

  return newPost;
}

export async function getMentionUsers(query: string) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) throw Error("Unauthorized");

  const users = prisma.user.findMany({
    where: {
      OR: [
        {
          displayName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    select: getUserDataSelect(loggedInUser.id),
    take: 10,
  });

  return users;
}
