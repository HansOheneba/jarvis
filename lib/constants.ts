/** App and API configuration — JARVIS identity lives in ./jarvis.ts */

export {
  ADMIN_CONTACT_EMAIL,
  INSUFFICIENT_BALANCE_MESSAGE,
  JARVIS,
  JARVIS_CRYPTIC_PHRASES,
  JARVIS_ERROR_MESSAGES,
  JARVIS_FALLBACK_RESPONSES,
  JARVIS_METADATA,
  JARVIS_PERSONALITY_TRAITS,
  JARVIS_PROMPT_VARIANTS,
  JARVIS_SYSTEM_PROMPT,
  JARVIS_TOPICS_OF_EXPERTISE,
  JARVIS_WELCOME_MESSAGES,
  pickJarvisMessage,
} from "@/lib/jarvis";

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export const MAX_HISTORY_LENGTH = 50;
export const MAX_RESPONSE_TOKENS = 2000;
/** Financial Advisor needs room for data-heavy structured replies */
export const FINANCIAL_ADVISOR_MAX_TOKENS = 3000;
export const TEMPERATURE = 0.7;
export const FINANCIAL_ADVISOR_TEMPERATURE = 0.65;

export const USER_PREFERENCES = {
  defaultLanguage: "en",
  defaultTone: "balanced",
  enableTypingIndicator: true,
  darkMode: true,
} as const;
