import {getTaskMocks, getMainFiltersList} from './data';
import {BOARD_FILTERS} from './data/constants';

import Menu from './components/menu';
import Search from './components/search';
import MainFilters from './components/main-filters';
import Board from './components/board';
import {renderCardTasksComponents} from './components/tasks-cards';
import LoadMoreButton from './components/load-more-button';
import BoardTasks from './components/board-tasks';
import BoardNoTasks from './components/board-no-tasks';

import {render, removeComponent} from './utils/render';
import {checkFiltersEmptyOrArchived} from './utils';

const CARDS_COUNT = 21;
const CARDS_PER_PAGE = 8;
let cardsShown = 0;

let cardsCountToShow = CARDS_PER_PAGE;

const mockCards = getTaskMocks(CARDS_COUNT);
const mainFiltersList = getMainFiltersList(mockCards);

const menuComponent = new Menu();
const searchComponent = new Search();
const mainFiltersComponent = new MainFilters(mainFiltersList);
const loadMoreButtonComponent = new LoadMoreButton();
const boardTasksComponent = new BoardTasks();
const boardNoTasksComponent = new BoardNoTasks();

const boardComponent = new Board(BOARD_FILTERS);

const onLoadMoreButtonClick = () => {
  cardsCountToShow += CARDS_PER_PAGE;

  const upatedCardsList = mockCards.slice(cardsShown, cardsCountToShow);
  cardsShown += CARDS_PER_PAGE;

  const boardTasksContainer = document.querySelector(`.board__tasks`);
  const loadMoreButtonElement = document.querySelector(`.load-more`);

  removeComponent(loadMoreButtonElement);
  loadMoreButtonComponent.removeElement();

  renderCardTasksComponents(upatedCardsList, boardTasksContainer);

  if (cardsShown <= CARDS_COUNT) {
    render(boardTasksContainer, loadMoreButtonComponent.getElement());
  }
};

const mainContainer = document.querySelector(`.main`);
const controlContainer = document.querySelector(`.main__control`);

render(controlContainer, menuComponent.getElement());
render(mainContainer, searchComponent.getElement());
render(mainContainer, mainFiltersComponent.getElement());
render(mainContainer, boardComponent.getElement());

const boardContainer = document.querySelector(`.board`);

if (mockCards.length === 0 || checkFiltersEmptyOrArchived) {
  render(boardContainer, boardNoTasksComponent.getElement());
} else {
  render(boardContainer, boardTasksComponent.getElement());
  const boardTasksContainer = document.querySelector(`.board__tasks`);

  renderCardTasksComponents(mockCards.slice(0, cardsCountToShow), boardTasksContainer);

  cardsShown += cardsCountToShow;

  render(boardTasksContainer, loadMoreButtonComponent.getElement());

  const loadMoreButtonElement = document.querySelector(`.load-more`);
  loadMoreButtonElement.addEventListener(`click`, onLoadMoreButtonClick);
}


