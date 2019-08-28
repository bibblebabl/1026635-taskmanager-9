import Board from '../components/board';
import BoardTasks from '../components/board-tasks';
import BoardFilterList from '../components/board-filter-list';
import TaskCard from '../components/task-card';
import TaskCardEdit from '../components/task-card-edit';
import LoadMoreButton from '../components/load-more-button';
import BoardNoTasks from '../components/board-no-tasks';

import {CARDS_PER_PAGE} from '../data/constants';
import {isEscButton, checkFiltersEmptyOrArchived} from '../utils';
import {render, removeComponent} from '../utils/render';
// import {checkFiltersEmptyOrArchived} from './utils';

export default class BoardController {
  constructor({container, tasks, boardFilters, mainFilters}) {
    this._container = container;
    this._tasks = tasks;
    this._board = new Board();
    this._boardFilterList = new BoardFilterList(boardFilters);
    this._mainFilters = mainFilters;
    this._boardTasks = new BoardTasks();
    this._boardNoTasks = new BoardNoTasks();
    this._loadMoreButton = new LoadMoreButton();

    this._cardsShown = 0;
  }

  init() {
    render(this._container, this._board.getElement());
    render(this._board.getElement(), this._boardFilterList.getElement());

    if (this._tasks.length === 0 || checkFiltersEmptyOrArchived(this._mainFilters)) {
      render(this._board.getElement(), this._boardNoTasks.getElement());
    } else {
      render(this._board.getElement(), this._boardTasks.getElement());

      this._cardsShown += CARDS_PER_PAGE;
      this._renderTaskCards();

      this._renderLoadMoreButton();

      this._boardFilterList.getElement().addEventListener(`click`, (evt) => this._onSortLinkClick(evt));
    }
  }

  _renderLoadMoreButton() {
    removeComponent(this._loadMoreButton.getElement());
    this._loadMoreButton.removeElement();

    if (this._cardsShown <= this._tasks.length) {
      render(this._boardTasks.getElement(), this._loadMoreButton.getElement());
      this._loadMoreButton.getElement()
      .addEventListener(`click`, (evt) => this._onLoadMoreButtonClick(evt));
    }
  }

  _renderTaskCards() {
    this._getTasksToShow().forEach((taskMock) => this._renderTaskCard(taskMock));
  }

  _renderTaskCard(taskMock) {
    const taskComponent = new TaskCard(taskMock);
    const taskEditComponent = new TaskCardEdit(taskMock);

    const onEscKeyDown = (evt) => {
      if (isEscButton(evt.key)) {
        this._boardTasks.getElement().replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    taskComponent.getElement()
      .querySelector(`.card__btn--edit`)
      .addEventListener(`click`, () => {
        this._boardTasks.getElement().replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
      });

    taskEditComponent.getElement()
      .querySelector(`textarea`)
      .addEventListener(`focus`, () => {
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    taskEditComponent.getElement()
      .querySelector(`textarea`)
      .addEventListener(`blur`, () => {
        document.addEventListener(`keydown`, onEscKeyDown);
      });

    taskEditComponent.getElement()
      .querySelector(`.card__save`)
      .addEventListener(`click`, () => {
        this._boardTasks.getElement().replaceChild(taskComponent.getElement(), taskEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    taskEditComponent.getElement()
      .querySelector(`.card__form`)
      .addEventListener(`submit`, () => {
        this._boardTasks.getElement().replaceChild(taskEditComponent.getElement(), taskComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    render(this._boardTasks.getElement(), taskComponent.getElement());
  }

  _getTasksToShow() {
    return this._tasks.slice(0, this._cardsShown);
  }

  _onSortLinkClick(evt) {
    evt.preventDefault();

    if (evt.target.tagName !== `A`) {
      return;
    }

    this._boardTasks.getElement().innerHTML = ``;

    switch (evt.target.dataset.sortType) {
      case `date-up`:
        const sortedByDateUpTasks = this._getTasksToShow().sort((a, b) => a.dueDate - b.dueDate);
        sortedByDateUpTasks.forEach((taskMock) => this._renderTaskCard(taskMock));
        break;
      case `date-down`:
        const sortedByDateDownTasks = this._getTasksToShow().sort((a, b) => b.dueDate - a.dueDate);
        sortedByDateDownTasks.forEach((taskMock) => this._renderTaskCard(taskMock));
        break;
      case `default`:
        this._getTasksToShow().forEach((taskMock) => this._renderTaskCard(taskMock));
        break;
    }

    this._renderLoadMoreButton();
  }

  _onLoadMoreButtonClick() {
    this._cardsShown += CARDS_PER_PAGE;
    this._renderTaskCards();

    this._renderLoadMoreButton();
  }
}
