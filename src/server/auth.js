import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { sendEmail } from "./emailService";
import { ADMIN_LANGUAGES, adminTranslations } from "../data/adminTranslations";

import prisma from "./prisma";

function getPasswordRecoveryLanguage(resetUrl) {
  try {
    const resetUrlObject = new URL(resetUrl);
    const callbackURL = resetUrlObject.searchParams.get("callbackURL");

    if (!callbackURL) {
      return "pt";
    }

    const callbackUrlObject = new URL(callbackURL, resetUrlObject.origin);

    const language = callbackUrlObject.searchParams.get("lang");

    return ADMIN_LANGUAGES.includes(language) ? language : "pt";
  } catch {
    return "pt";
  }
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  session: {
    expiresIn: 60 * 60, // 1 hora
    updateAge: 60 * 30, // renova após 30 min de atividade
  },

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,

    resetPasswordTokenExpiresIn: 60 * 60,

    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      const language = getPasswordRecoveryLanguage(url);
      const translations = adminTranslations[language].passwordRecovery;

      await sendEmail({
        to: user.email,
        subject: translations.emailSubject,

        text: [
          translations.emailIntro,
          "",
          `${translations.emailAction}:`,
          url,
          "",
          translations.emailExpires,
          "",
          translations.emailIgnore,
        ].join("\n"),

        html: `
      <p>${translations.emailIntro}</p>

      <p>
        <a href="${url}">
          ${translations.emailAction}
        </a>
      </p>

      <p>${translations.emailExpires}</p>

      <p>${translations.emailIgnore}</p>
    `,
      });
    },
  },

  plugins: [admin()],
});
