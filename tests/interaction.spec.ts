import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, info) => {
  await page.goto(
    info.project.name === "react18"
      ? "http://127.0.0.1:4323"
      : "http://127.0.0.1:4322",
  );
});

test("multiline text anchors at its top-right corner and content remains interactive", async ({
  page,
}) => {
  const text = page.locator('[data-slot="pinote-highlight"]');
  const trigger = page.getByRole("button", {
    name: "Multiline pinote",
    exact: true,
  });
  const corner = await text.boundingBox();
  const bounds = await trigger.boundingBox();
  expect(Math.abs(bounds!.x - (corner!.x + corner!.width))).toBeLessThan(1);
  expect(Math.abs(bounds!.y + bounds!.height - corner!.y)).toBeLessThan(1);
  await expect(trigger).toHaveCSS("border-bottom-left-radius", "0px");
  await trigger.click();
  await page.getByRole("button", { name: "Increase" }).click();
  await expect(page.getByRole("dialog")).toContainText("1 clicks");
  await expect(page.getByRole("dialog")).toHaveAttribute(
    "data-pinote-theme",
    "dark",
  );
  await trigger.focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Increase" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "After layer" })).toBeFocused();
});

test("pointer coordinates place the center at the requested point on a bordered surface", async ({
  page,
}) => {
  // Measure layout independently of hover and entrance animations.
  await page.emulateMedia({ reducedMotion: "reduce" });
  const surface = page.getByTestId("surface");
  const bounds = (await surface.boundingBox())!;
  const desired = { x: bounds.x + bounds.width * 0.25, y: bounds.y + 60 };
  await page.mouse.click(desired.x, desired.y);
  const pinote = (await page
    .getByRole("button", { name: "Movable pinote" })
    .boundingBox())!;
  expect(Math.abs(pinote.x + pinote.width / 2 - desired.x)).toBeLessThan(1);
  expect(Math.abs(pinote.y + pinote.height / 2 - desired.y)).toBeLessThan(1);
});

test("external state updates do not leave persistence stuck", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open externally" }).click();
  await expect(page.getByRole("dialog")).toContainText("Controlled content");
  await page.getByRole("button", { name: "Close externally" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Controlled pinote", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Controlled content");
});

test("component attachments accept named corners and percentage coordinates", async ({
  page,
}) => {
  const component = page.getByRole("button", { name: "Attached component" });
  const trigger = page.getByRole("button", {
    name: "Attached pinote",
    exact: true,
  });
  for (const [position, x, y] of [
    ["top-left", 0, 0],
    ["top-right", 160, 0],
    ["bottom-left", 0, 80],
    ["bottom-right", 160, 80],
    ["coordinates", 40, 60],
  ] as const) {
    await page.getByLabel("Attachment position").selectOption(position);
    const element = (await component.boundingBox())!;
    const marker = (await trigger.boundingBox())!;
    expect(Math.abs(marker.x + marker.width / 2 - element.x - x)).toBeLessThan(
      1,
    );
    expect(Math.abs(marker.y + marker.height / 2 - element.y - y)).toBeLessThan(
      1,
    );
  }
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("Attached content");
});

test("open messages follow position changes and attachment resizing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 1800 });
  await page.getByLabel("Keep attachment open").check();
  const panel = page.getByRole("dialog");
  const trigger = page.getByRole("button", {
    name: "Attached pinote",
    exact: true,
  });
  await expect(panel).toBeVisible();
  await page.getByLabel("Attachment position").selectOption("bottom-right");
  const aligned = async () => {
    const card = (await panel.boundingBox())!;
    const marker = (await trigger.boundingBox())!;
    return Math.abs(card.y + card.height / 2 - marker.y - marker.height / 2);
  };
  await expect.poll(aligned).toBeLessThan(1);
  await page.getByRole("button", { name: "Resize attachment" }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(aligned).toBeLessThan(1);
});

test("nested themes keep trigger and portalled message backgrounds identical", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.evaluate(() => document.body.classList.add("light"));
  const trigger = page.getByRole("button", {
    name: "Multiline pinote",
    exact: true,
  });
  await expect(trigger).toHaveCSS("color-scheme", "dark");
  await trigger.click();
  const panel = page.getByRole("dialog");
  await expect(panel).toHaveCSS("color-scheme", "dark");
  await expect(panel).toHaveCSS(
    "background-color",
    await trigger.evaluate((node) => getComputedStyle(node).backgroundColor),
  );
  await page.getByTestId("local-theme").evaluate((node) => {
    node.setAttribute("class", "light");
  });
  await expect(trigger).toHaveCSS("color-scheme", "light");
  await expect(panel).toHaveCSS(
    "background-color",
    await trigger.evaluate((node) => getComputedStyle(node).backgroundColor),
  );
});

test("sets the message transform origin on the edge facing its trigger", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "neutral pinote",
    exact: true,
  });
  const root = trigger.locator("../..");
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "neutral pinote",
    exact: true,
  });
  const cases = [
    {
      viewport: { width: 900, height: 700 },
      x: 80,
      y: 350,
      side: "right",
      origin: [0, 0.5],
    },
    {
      viewport: { width: 900, height: 700 },
      x: 820,
      y: 350,
      side: "left",
      origin: [1, 0.5],
    },
    {
      viewport: { width: 320, height: 700 },
      x: 160,
      y: 80,
      side: "bottom",
      origin: [0.5, 0],
    },
    {
      viewport: { width: 320, height: 700 },
      x: 160,
      y: 620,
      side: "top",
      origin: [0.5, 1],
    },
  ] as const;
  for (const { viewport, x, y, side, origin } of cases) {
    await page.setViewportSize(viewport);
    await root.evaluate(
      (node, position) => {
        Object.assign((node as HTMLElement).style, {
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
        });
      },
      { x, y },
    );
    await page.evaluate(() => dispatchEvent(new Event("resize")));
    await expect(panel).toHaveAttribute("data-side", side);
    const metrics = await panel.evaluate((node) => ({
      height: (node as HTMLElement).offsetHeight,
      origin: getComputedStyle(node).transformOrigin,
      width: (node as HTMLElement).offsetWidth,
    }));
    const [actualX, actualY] = metrics.origin.split(" ") as [string, string];
    expect(Number.parseFloat(actualX)).toBeCloseTo(
      metrics.width * origin[0],
      0,
    );
    expect(Number.parseFloat(actualY)).toBeCloseTo(
      metrics.height * origin[1],
      0,
    );
  }
});
