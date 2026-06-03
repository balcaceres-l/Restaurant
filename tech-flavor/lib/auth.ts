// lib/auth.ts
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import { db } from "../db/index";
import * as schema from "../db/schema";
import 'dotenv/config';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.RESEND_EMAIL_FROM || "no-reply@techflavor.com";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
            rateLimit: schema.rateLimit,
        }
    }),
    user: {
        additionalFields: {
            role: { 
                type: "string", 
                required: false, 
                defaultValue: "Cajero" 
            }, 
        }
    },
    plugins: [
        admin({
            defaultRole: "Cajero", 
        }),
    ],
    session: {
        expiresIn: 60 * 60 * 12, 
        updateAge: 60 * 60 * 1,   
    },
    rateLimit: {
        enabled: true,
        storage: "database", 
        window: 60,
        max: 100,
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
            if (resend) {
                await resend.emails.send({
                    from: emailFrom,
                    to: user.email,
                    subject: "Recupera tu contraseña - TechFlavor",
                    text: `Haz clic aquí para restablecer tu contraseña: ${url}`,
                }).catch(console.error);
            } else {
                console.log(`[DEV] Reset URL para ${user.email}: ${url}`);
            }
        },
    },
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
});