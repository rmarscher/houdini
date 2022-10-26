import { routes } from '../../../../lib/utils/routes.js';
import {
  expectToBe,
  goto,
  navSelector,
  clientSideNavigation,
  expect_0_gql
} from '../../../../lib/utils/testsHelper.js';
import { test } from '@playwright/test';

test.describe('query preprocessor unions', () => {
  test('query arrays with unions get unmarshaled into different types', async function ({ page }) {
    await goto(page, routes.Plugin_query_union);
    await clientSideNavigation(page, routes.Home);

    // We want the query in the frontend, so we navigate to the page
    // to zoom on union test & data
    await expect_0_gql(page, navSelector(routes.Plugin_query_union));

    // Expect first type data to be set
    await expectToBe(page, 'x: 1', 'div[id=result-union-model-a]');

    // Expect second type data to be set
    await expectToBe(page, 'msg: ok', 'div[id=result-union-model-b]');
  });
});
