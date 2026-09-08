import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the static demo hydrates with automatic styles and working pinotes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("react-pinote");
  await expect(page.getByRole("button")).toHaveCount(5);
  const trigger = page.getByRole("button", {
    name: "Open anonymous pinote",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("No name needed.");
  await expect(page.getByRole("dialog")).toHaveCSS("position", "fixed");
  await expect(trigger).toHaveCSS("width", "24px");
  await expect(trigger).toHaveCSS("border-width", "0px");
  await expect(page.getByRole("dialog")).toHaveCSS("border-width", "0px");
  const surface = await trigger.evaluate((node) => ({
    background: getComputedStyle(node).backgroundColor,
    shadow: getComputedStyle(node).boxShadow,
  }));
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    surface.background,
  );
  await expect(page.getByRole("dialog")).toHaveCSS(
    "box-shadow",
    surface.shadow,
  );
  expect(
    await new AxeBuilder({ page })
      .analyze()
      .then((result) => result.violations),
  ).toEqual([]);
  await page.getByRole("button", { name: "Open custom style pinote" }).click();
  await expect(page.getByRole("dialog")).toHaveCSS(
    "background-color",
    "rgb(248, 229, 164)",
  );
  expect(errors).toEqual([]);
});

test("small screens keep cards inside the viewport and reduced motion stays still", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  for (const button of await page.getByRole("button").all()) {
    await button.click();
    const panel = page.getByRole("dialog");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("animation-name", "none");
    const bounds = await panel.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(11);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(309);
    expect(bounds!.y).toBeGreaterThanOrEqual(11);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(629);
    await button.click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
});

test("shadcn class changes update an already open body portal", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Open pinote from Maya" }).click();
  const panel = page.getByRole("dialog");
  await expect(panel).toHaveAttribute("data-pinote-theme", "light");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect(panel).toHaveAttribute("data-pinote-theme", "dark");
  await expect(panel).toHaveCSS("color-scheme", "dark");
  expect(
    await new AxeBuilder({ page })
      .analyze()
      .then((result) => result.violations),
  ).toEqual([]);
});
