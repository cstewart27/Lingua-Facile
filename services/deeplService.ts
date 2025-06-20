// DeepL API service for translation using HTTP fetch
import Constants from 'expo-constants';

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
// Use 'https://api.deepl.com/v2/translate' for paid accounts

// Language code mapping from app codes to DeepL codes
const LANGUAGE_CODE_MAPPING: { [key: string]: string } = {
  'en': 'EN',
  'es': 'ES',
  'fr': 'FR',
  'de': 'DE',
  'it': 'IT',
  'pt': 'PT',
  'ru': 'RU',
  'ja': 'JA',
  'ko': 'KO',
  'zh': 'ZH',
  'ar': 'AR',
  'hi': 'HI',
  'tr': 'TR',
  'pl': 'PL',
  'nl': 'NL',
  'sv': 'SV',
  'da': 'DA',
  'no': 'NB',
  'fi': 'FI',
  'cs': 'CS',
  'sk': 'SK',
  'sl': 'SL',
  'et': 'ET',
  'lv': 'LV',
  'lt': 'LT',
  'bg': 'BG',
  'ro': 'RO',
  'el': 'EL',
  'hu': 'HU',
  'uk': 'UK',
  'id': 'ID',
};

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  apiKey?: string;
}

export interface TranslationResponse {
  translations: Array<{
    detected_source_language?: string;
    text: string;
  }>;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export class DeepLTranslationError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'DeepLTranslationError';
  }
}

export const translateWithDeepL = async (
  request: TranslationRequest
): Promise<TranslationResult> => {
  const { text, sourceLanguage, targetLanguage, apiKey } = request;

  // Use provided API key or fallback to environment variable
  const deeplApiKey = apiKey || Constants.expoConfig?.extra?.EXPO_PUBLIC_DEEPL_API_KEY || process.env.EXPO_PUBLIC_DEEPL_API_KEY;

  if (!deeplApiKey) {
    throw new DeepLTranslationError('API key is required. Provide it in the request or set DEEPL_API_KEY environment variable.');
  }

  if (!text.trim()) {
    throw new DeepLTranslationError('Text to translate cannot be empty');
  }

  // Map language codes to DeepL format
  const sourceLang = LANGUAGE_CODE_MAPPING[sourceLanguage];
  const targetLang = LANGUAGE_CODE_MAPPING[targetLanguage];

  if (!targetLang) {
    throw new DeepLTranslationError(`Unsupported target language: ${targetLanguage}`);
  }

  try {
    // Prepare the request body as JSON
    const requestBody: any = {
      text: [text], // DeepL API expects text as an array
      target_lang: targetLang,
    };

    // Only add source_lang if it's not auto-detect and is supported
    if (sourceLanguage !== 'auto' && sourceLang) {
      requestBody.source_lang = sourceLang;
    }

    const response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `DeepL-Auth-Key ${deeplApiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      switch (response.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 403:
          errorMessage = 'Invalid API key or insufficient permissions.';
          break;
        case 413:
          errorMessage = 'Text too long for translation.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 456:
          errorMessage = 'Quota exceeded. Please check your DeepL account.';
          break;
        case 503:
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            // Keep default error message if JSON parsing fails
          }
      }

      throw new DeepLTranslationError(errorMessage, response.status);
    }

    const data: TranslationResponse = await response.json();

    if (!data.translations || data.translations.length === 0) {
      throw new DeepLTranslationError('No translation received from DeepL API');
    }

    const translation = data.translations[0];

    return {
      translatedText: translation.text,
      detectedSourceLanguage: translation.detected_source_language?.toLowerCase(),
    };

  } catch (error) {
    if (error instanceof DeepLTranslationError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new DeepLTranslationError('Network error. Please check your internet connection.');
    }

    throw new DeepLTranslationError(
      error instanceof Error ? error.message : 'Unknown error occurred during translation'
    );
  }
};

// Helper function to check if a language is supported by DeepL
export const isLanguageSupported = (languageCode: string): boolean => {
  return languageCode === 'auto' || languageCode in LANGUAGE_CODE_MAPPING;
};

// Helper function to get supported languages
export const getSupportedLanguages = (): string[] => {
  return Object.keys(LANGUAGE_CODE_MAPPING);
};
