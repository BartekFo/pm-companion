import { customProvider } from 'ai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { google } from '@ai-sdk/google';
export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': google('gemini-2.5-flash-preview-04-17'),
        // 'chat-model-reasoning': wrapLanguageModel({
        //   model: xai('grok-3-mini-beta'),
        //   middleware: extractReasoningMiddleware({ tagName: 'think' }),
        // }),
        'title-model': google('gemini-1.5-flash'),
        'artifact-model': google('gemini-2.5-flash-preview-04-17'),
      },
      // imageModels: {
      //   'small-model': xai.image('grok-2-image'),
      // },
    });
