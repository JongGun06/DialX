// types/chat.ts

export type Profile = {
  id: string;
  username: string;
  avatarUrl?: string;
  subscriptionStatus?: string;
  settings?: { // <-- ДОБАВЛЕНО
    theme: { [key: string]: string }; // <-- ИЗМЕНЕНИЕ: Теперь это объект
  };
};

export type Message = {
  id: string;
  content?: string;
  fileUrl?: string;
  fileType?: string | null;
  createdAt: string;
  author: Profile;
    chatId?: string; // <-- ДОБАВИТЬ ЭТУ СТРОКУ

};

export type Chat = {
  id: string;
  name?: string;
  avatarUrl?: string;
  isGroup: boolean;
  participants: Profile[];
  lastMessage?: Message;
};