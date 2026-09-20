import { mergeQueryKeys } from "@lukemorales/query-key-factory";

import { accountSnapshots } from "_features/account-snapshot/queries/query-key";
import { accounts } from "_features/account/queries/query-key";
import { auth } from "_features/auth/queries/query-key";
import { categories } from "_features/category/queries/query-key";
import { enums } from "_features/enum/queries/query-key";
import { fixedExpenses } from "_features/fixed/queries/query-key";
import { home } from "_features/home/queries/query-key";
import { households } from "_features/household/queries/query-key";
import { portfolios } from "_features/portfolio/queries/query-key";
import { settings } from "_features/settings/queries/query-key";
import { transactions } from "_features/transaction/queries/query-key";
import { wealth } from "_features/wealth/queries/query-key";

export const queryKeys = mergeQueryKeys(
  auth,
  accounts,
  categories,
  enums,
  fixedExpenses,
  portfolios,
  transactions,
  households,
  accountSnapshots,
  home,
  wealth,
  settings,
);
