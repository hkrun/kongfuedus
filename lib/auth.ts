import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

// 令牌有效期配置（秒）
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7天

export const config = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          });

          if (!user || !user.hashedPassword) {
            console.log('❌ 用户不存在或没有密码:', credentials.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.hashedPassword
          );

          if (!isPasswordValid) {
            console.log('❌ 密码验证失败:', credentials.email);
            return null;
          }

          console.log('✅ 用户认证成功:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || '',
            image: user.image || '',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        } catch (error) {
          console.error('❌ 认证过程出错:', error);
          return null;
        }
      }
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: TOKEN_MAX_AGE, // 7天过期
  },
  jwt: {
    maxAge: TOKEN_MAX_AGE, // 7天过期
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        console.log('🔐 JWT 令牌创建/更新:', { userId: user.id, email: user.email });
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
        console.log('👤 会话创建/更新:', { userId: token.id, email: token.email });
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // 处理重定向逻辑
      console.log('🔄 重定向回调:', { url, baseUrl });
      
      // 如果是相对URL，则使用baseUrl
      if (url.startsWith('/')) {
        console.log('✅ 重定向到相对路径:', url);
        return `${baseUrl}${url}`;
      }
      
      // 如果是外部URL，检查是否允许
      if (new URL(url).origin === baseUrl) {
        console.log('✅ 重定向到同域URL:', url);
        return url;
      }
      
      // 默认重定向到首页
      console.log('✅ 重定向到首页');
      return `${baseUrl}/`;
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
