import {
  columnVisibilityFeature,
  rowSelectionFeature,
  tableFeatures,
} from "@tanstack/react-table";

// Table V9 includes only the registered features: column visibility for
// the sort dropdown (getCanHide), row selection for row.getIsSelected().
export const statsTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature,
});
