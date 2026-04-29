export interface Snippet {
  id: string;
  title: string;
  language: string;
  tags: string[];
  code: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface AddOptions {
  language: string;
  tag?: string | string[];
  code?: string;
  file?: string;
}

export interface ListOptions {
  language?: string;
  tag?: string;
}
