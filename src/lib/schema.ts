import { z } from 'zod'

// ── Form option sets (shared by the form UI and server validation) ──────────
export const INVESTED_OPTIONS = [
  'Yes, currently investing',
  'Yes, but not currently',
  'No, this will be my first investment',
] as const

export const INTEREST_OPTIONS = [
  'Nigerian stocks',
  'International stocks',
  'ETFs',
  'Bonds/fixed income',
  'Mutual funds',
  'Dividend investing',
  'Other',
] as const

export const MOTIVATION_OPTIONS = [
  'Easy stock buying and selling',
  'Low fees',
  'Fractional shares',
  'Access to international stocks',
  'Portfolio tracking',
  'Investment insights/research',
  'Automated investing',
  'Beginner-friendly education',
  'Fast deposits and withdrawals',
  'Other',
] as const

export const HEARD_FROM_OPTIONS = [
  'Instagram',
  'TikTok',
  'X',
  'Facebook',
  'Google',
  'Friend/referral',
  'WhatsApp',
  'Other',
] as const

// Nigerian states + FCT — the "geographical area" we collect.
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const

// Other countries for international investors (Nigeria itself is covered by the
// states above; anything missing is handled by the "Other" free-text option).
export const COUNTRIES = [
  'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Morocco', 'Ethiopia', 'Tanzania',
  'Uganda', 'Rwanda', 'Cameroon', "Côte d'Ivoire", 'Senegal', 'Zambia',
  'United States', 'Canada', 'United Kingdom', 'Ireland', 'Germany', 'France',
  'Netherlands', 'Belgium', 'Spain', 'Italy', 'Portugal', 'Switzerland',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Turkey', 'India', 'Pakistan', 'Bangladesh', 'China', 'Japan', 'South Korea',
  'Singapore', 'Malaysia', 'Indonesia', 'Philippines',
  'Australia', 'New Zealand', 'Brazil', 'Mexico', 'Argentina',
] as const

// ── Submission schema ───────────────────────────────────────────────────────
export const waitlistSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20),
  location: z.string().trim().min(2, 'Select your location'),
  investedBefore: z.enum(INVESTED_OPTIONS),
  interests: z.array(z.string()).max(INTEREST_OPTIONS.length).optional().default([]),
  motivations: z.array(z.string()).max(3, 'Choose up to 3').optional().default([]),
  heardFrom: z.string().trim().optional().default(''),
  otherNotes: z.string().trim().max(500).optional().default(''),
  consentUpdates: z.literal(true, { errorMap: () => ({ message: 'Please agree to receive launch updates' }) }),
  consentPolicy: z.literal(true, { errorMap: () => ({ message: 'Please accept the Privacy Policy and Terms' }) }),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
