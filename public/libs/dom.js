const dom = {
  createCardElem: card => {
    const cardElem = document.createElement("my-card");
    cardElem.setAttribute("cardId", card.id);
    cardElem.setAttribute("title", card.title);
    cardElem.setAttribute("description", card.description);
    return cardElem;
  },
  createColumnElem: (column, storeCard) => {
    const columnElem = document.createElement("my-column");
    columnElem.setAttribute("title", column.title);
    columnElem.setAttribute("columnId", column.id);
    return columnElem;
  }
};
