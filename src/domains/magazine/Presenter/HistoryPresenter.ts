import { ArticleHistory, TaskHistory } from "..";
import { UserPresenter } from "../../user/UserPresenter";
import { ArticleComponent } from "../Article/ArticleComponent";
import { TaskComponent } from "../Task/TaskComponent";

export class HistoryPresenter {
  constructor(private userPresenter: UserPresenter, private article: ArticleComponent, private task: TaskComponent) {}

  articleHistory(history: ArticleHistory) {
    const user = history.user;
    const userRef = user ? this.userPresenter.getUserTumbanian(user) : null; 

    return Object.assign(
      history,
      userRef
    );
  }

  taskHistory(history: TaskHistory) {
    const user = history.user;
    const userRef = user ? this.userPresenter.getUserTumbanian(user) : null; 

    return Object.assign(
      history,
      userRef
    );  
  }
}

