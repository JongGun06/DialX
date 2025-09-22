// types/ai.ts
export type AiCharacter = {
  id: string;
  name: string;
  persona: string;
  avatarUrl?: string;
  creatorId: string;
};

export type AiMessage = {
  characterId: string;
  characterName: string;
  content: string;
  createdAt: string; // Будет в формате Date, но для state лучше string
  isOwn?: boolean; // Добавляем флаг для определения автора
};