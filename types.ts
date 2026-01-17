
export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  isLoading: boolean;
  history: string[];
  historyIndex: number;
  pageData?: WebPageData;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface WebPageData {
  title: string;
  content: string;
  suggestedUrls: string[];
  favicon?: string;
  adBlockCount?: number;
}

export interface Download {
  id: string;
  filename: string;
  url: string;
  progress: number; // 0 to 100
  status: 'downloading' | 'paused' | 'completed' | 'cancelled' | 'failed';
  totalSize: string;
  startTime: number;
}
