import { AccessItem } from "../user/Role/Role";
  
 
export interface RoleChecker {
  checkUserWithThrow(userId: number, access: AccessItem): void;
}

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
  sysname: string;
  
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

  status: ArticleStatus;

  createdAt: number; 
  publishedAt?: number; 
}

export interface History {
  id?: number; 
  date: number;
  user: number;
  status: string;
  comment: string;
}
export interface TaskHistory extends History{
  task: number; 
}
export interface ArticleHistory extends History {
  article: number; 
}
export type FeeStatus = "CREATED" | "PAID" | "CANCELED";
export interface Fee {
  id: number;
  user: number;
  dateCreated: number;
  dateExecuted?: number;
  value: number;
  task: number;
  comment: string;
  status: FeeStatus;
  account?: string; 
  executeComment?: string;
}
