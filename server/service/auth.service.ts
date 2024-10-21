import { prisma } from "server/utils/db";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";

interface LoginPayload {
  email: string;
  password: string;
}

export const login = async (payload: LoginPayload) => {
  // check if email exists
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email or password",
    });
  }

  // check if password is correct
  const isPasswordCorrect = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid email or password",
    });
  }

  return user;
};

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export const register = async (payload: RegisterPayload) => {
  // check if email already exists
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (user) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email already exists",
    });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // create user
  const newUser = await prisma.user.create({
    data: {
      email: payload.email,
      password: hashedPassword,
      name: payload.name,
    },
  });

  return newUser;
};
