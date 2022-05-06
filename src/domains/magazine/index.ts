export type TaskStatus =
  | 'CREATED'
  | 'PUBLISHED'
  | 'DISTRIBUTED'
  | 'PENDING_RESOLVE'
  | 'REJECTED'
  | 'FINISHED'
  | 'CANCELED'
  | 'ENDED'
  | 'ARCHIVED';

export interface Task {
  id: number;

  title: string;
  description: string;
  status?: TaskStatus;

  editor?: number;
  dateEnd?: Date;
  fee?: number;
  author?: number;
  article?: number;
}

export type ArticleStatus =  "CREATED" | "PUBLISHED" | "ARCHIVED";
export interface Article {
  id: number;
  
  title: string;
  description: string;

  text: string;
  keywords: string;

  squareImage?: string;
  horizontalLargeImage?: string;
  horizontalSmallImage?: string;
  verticalLargeImage?: string;
  verticalSmallImage?: string; 
  extraLargeImage?: string;

  category: number;
  author: number;
  editor: number;

  task?: number;

  source: string;
  nick: string;
  photographer: string;

  status: ArticleStatus
}

export interface History {
  id: number;
  task: number;
  date: number;
  user: number;
  status: string;
  comment: string;
}
export type FeeStatus = "CREATED" | "PAID" | "CANCELED";
export interface Fee {
  id: number;
  user: number;
  dateCreate: number;
  dateExecuted: number;
  value: number;
  task?: number;
  comment: string;
  status: FeeStatus;
  account?: number;
}