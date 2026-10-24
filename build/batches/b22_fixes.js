/* ---- small fixes: a way back from "About this figure" to the comparison it was opened from ---- */
const compareSheetLB = compareSheet; compareSheet = function (id, c) { compareSheetLB(id, c); S.lastSheet = () => compareSheet(id, c); };
const stateSheetLB = stateSheet; stateSheet = function (st) { stateSheetLB(st); S.lastSheet = () => stateSheet(st); };
const compareStatesLB = compareStates; compareStates = function (a, b) { compareStatesLB(a, b); S.lastSheet = () => compareStates(a, b); };
const indSheetLB = indSheet;
indSheet = function (id) { const from = !$("#overlay").hidden && $("#overlay .dialog.cmp") && S.lastSheet ? S.lastSheet : null;
  indSheetLB(id); if (!from) return;
  const row = $("#overlay .dialog .btnrow"); if (!row) return;
  row.insertAdjacentHTML("afterbegin", `<button class="btn" data-sheetback><svg class="bk" aria-hidden="true"><use href="#i-back"/></svg>Back to the comparison</button>`);
  row.querySelector("[data-sheetback]").addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); from(); }); };
