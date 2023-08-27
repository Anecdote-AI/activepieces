import { ActivepiecesError, ErrorCode, SecretTextConnectionValue, isNil } from '@activepieces/shared';
import { customBot } from './bots/custom-bot';
import { llm } from './framework/llm';
import { faissEmbedding } from './embeddings/faiss-embeddings';

const chatbots = [customBot];

export function getChatBotType({ type }: { type: string }) {
  const chatbot = chatbots.find((b) => b.name === type);
  if (isNil(chatbot)) {
    throw new ActivepiecesError({
      code: ErrorCode.ENTITY_NOT_FOUND,
      params: {
        message: `Chatbot with type ${type} not found`
      }
    });
  }
  return chatbot;
}

export const runBot = async ({
  botId,
  type,
  input,
  auth,
  settings
}: {
  botId: string;
  type: string;
  auth: SecretTextConnectionValue,
  input: string;
  settings: {
    prompt: string;
  };
}) => {
  const bot = chatbots.find((b) => b.name === type);
  if (!bot) {
    throw new Error(`Bot ${type} not found`);
  }
  const embeddings = await faissEmbedding({
    botId,
    openAIApiKey: auth.secret_text
  });
  return bot.run({
    input,
    llm: llm(auth.secret_text, 'gpt-3.5-turbo'),
    embeddings,
    settings: settings
  });
};