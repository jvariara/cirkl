"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/db";
import streamServerClient from "@/lib/stream";
import { signUpSchema, SignUpValues } from "@/lib/validation";
import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signUp(
  credentials: SignUpValues
): Promise<{ error: string }> {
  try {
    const { email, username, password } = signUpSchema.parse(credentials);

    // input is valid, continue with signup logic
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const userId = generateIdFromEntropySize(10);

    // check if username or email is already used
    const exisitngUsername = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: "insensitive", // case insensitive
        },
      },
    });

    if (exisitngUsername) {
      return {
        error: "Username already taken.",
      };
    }

    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return {
        error: "Email already taken.",
      };
    }

    await prisma.$transaction(async (tx) => {
      // Create new user
      await tx.user.create({
        data: {
          id: userId,
          username,
          displayName: username,
          email,
          passwordHash,
        },
      });
      // create stream user
      await streamServerClient.upsertUser({
        id: userId,
        username,
        name: username,
      });
    });

    // Create session cookie so user is logged in automatically
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return {
      error: "Something went wrong. Please try again.",
    };
  }
}
