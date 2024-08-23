"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import {
  getCommentDataInclude,
  getPostDataInclude,
  PostData,
} from "@/lib/types";
import { createCommentSchema } from "@/lib/validation";

export async function submitComment({
  post,
  content,
}: {
  post: PostData;
  content: string;
}) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const { content: contentValidated } = createCommentSchema.parse({ content });

  // if the second creation fails, the first will be rolled back and the comment won't be created
  const [newComment] = await prisma.$transaction([
    // create comment in db
    prisma.comment.create({
      data: {
        content: contentValidated,
        postId: post.id,
        userId: user.id,
      },
      include: getCommentDataInclude(user.id),
    }),
    ...(post.userId !== user.id
      ? [
          prisma.notification.create({
            data: {
              issuerId: user.id,
              recipientId: post.user.id,
              postId: post.id,
              type: "COMMENT",
            },
          }),
        ]
      : []),
  ]);

  return newComment;
}

export async function deleteComment(id: string) {
  const { user } = await validateRequest();

  if (!user) throw Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  if (!comment) throw new Error("Comment not found");

  if (comment.userId !== user.id) throw new Error("Unauthorized");

  await prisma.$transaction([
    prisma.comment.delete({
      where: { id },
      include: getCommentDataInclude(user.id),
    }),
    prisma.notification.deleteMany({
      where: {
        issuerId: user.id,
        recipientId: comment.userId,
        type: "LIKE",
      },
    }),
  ]);

  const deletedComment = await prisma.comment.delete({
    where: { id },
    include: getCommentDataInclude(user.id),
  });

  return deletedComment;
}
