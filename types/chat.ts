// types/chat.ts

export type Profile = {
  id: string;
  username: string;
  avatarUrl?: string;
  subscriptionStatus?: string;
  settings?: { // <-- ДОБАВЛЕНО
    theme: string;
  };
};

export type Message = {
  id: string;
  content?: string;
  fileUrl?: string;
  fileType?: string | null;
  createdAt: string;
  author: Profile;
};

export type Chat = {
  id: string;
  name?: string;
  avatarUrl?: string;
  isGroup: boolean;
  participants: Profile[];
  lastMessage?: Message;
};