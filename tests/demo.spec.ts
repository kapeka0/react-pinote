import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { clippedBounds } from "./expansion-geometry";

async function dragBy(page: Page, trigger: Locator, x: number, y: number) {
  await expect(trigger).toHaveAttribute("data-draggable", "");
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  const bounds = (await trigger.locator("..").boundingBox())!;
  const start = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    const client = await page.context().newCDPSession(page);
    try {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ ...start, id: 1 }],
      });
      await expect(trigger).toHaveCSS("cursor", "grabbing");
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: start.x + x, y: start.y + y, id: 1 }],
      });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await expect(trigger).toHaveCSS("cursor", "pointer");
    } finally {
      await client.detach();
    }
    return;
  }
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await expect(trigger).toHaveCSS("cursor", "grabbing");
  await page.mouse.move(start.x + x, start.y + y, { steps: 6 });
  await page.mouse.up();
  await expect(trigger).toHaveCSS("cursor", "pointer");
  await page.mouse.move(0, 0);
}

test("the five standalone markers drag while the text marker stays attached", async ({
  page,
}) => {
  await page.goto("/");
  const triggers = page.locator('[data-slot="pinote-trigger"][data-draggable]');
  await expect(triggers).toHaveCount(5);
  await expect(
    page.getByRole("button", { name: "Open pinote about highlighted text" }),
  ).not.toHaveAttribute("data-draggable");
  await triggers.evaluateAll((nodes) =>
    nodes.forEach((node) =>
      node.getAnimations().forEach((animation) => animation.finish()),
    ),
  );
  const title = (await page.locator("h1").boundingBox())!;
  const finePointer = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  for (const trigger of await triggers.all()) {
    const before = (await trigger.locator("..").boundingBox())!;
    if (
      finePointer &&
      (await trigger.getAttribute("aria-label")) === "Open pinote from Kapeka"
    ) {
      await page.mouse.move(
        before.x + before.width / 2,
        before.y + before.height / 2,
      );
      await expect(page.getByRole("dialog").locator("img")).toHaveCSS(
        "transform",
        "none",
      );
      await expect(page.getByRole("dialog")).toHaveCSS("cursor", "pointer");
    }
    await dragBy(page, trigger, -35, 22);
    const after = (await trigger.locator("..").boundingBox())!;
    expect(after.x - before.x).toBeCloseTo(-35, 0);
    expect(after.y - before.y).toBeCloseTo(22, 0);
    expect(await page.locator("h1").boundingBox()).toEqual(title);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  const relativeOffset = () =>
    page.locator('[data-slot="pinote-highlight"]').evaluate((node) => {
      const text = node.getBoundingClientRect();
      const marker = node
        .querySelector('[data-slot="pinote-anchor"]')!
        .getBoundingClientRect();
      return { x: marker.x - text.right, y: marker.bottom - text.y };
    });
  const beforeResize = await relativeOffset();
  await page.setViewportSize({ width: 320, height: 640 });
  const afterResize = await relativeOffset();
  expect(afterResize.x).toBeCloseTo(beforeResize.x, 0);
  expect(afterResize.y).toBeCloseTo(beforeResize.y, 0);
});

test("the landing stays white with an Inter heading and a short description", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const heading = page.locator("h1");
  const description = page.getByText(
    "Lightweight annotations for your React UI.",
    { exact: true },
  );
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveCSS(
    "background-color",
    "oklch(1 0 0)",
  );
  await expect(heading).toHaveCSS("color", "oklch(0 0 0)");
  await expect(heading).toHaveCSS("font-weight", "900");
  expect(
    await heading.evaluate((node) => getComputedStyle(node).fontFamily),
  ).toMatch(/^Inter/);
  expect(
    await page.evaluate(() =>
      Array.from(document.fonts).some(
        (font) => font.family === "Inter" && font.status === "loaded",
      ),
    ),
  ).toBe(true);
  await expect(description).toBeVisible();
  const titleBox = (await heading.boundingBox())!;
  const descriptionBox = (await description.boundingBox())!;
  expect(descriptionBox.y).toBeGreaterThan(titleBox.y + titleBox.height);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("the static demo hydrates with automatic styles and working pinotes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("react-pinote");
  await expect(page.locator('[data-slot="pinote-trigger"]')).toHaveCount(6);
  const trigger = page.getByRole("button", {
    name: "Open anonymous pinote",
    exact: true,
  });
  await trigger.click();
  await expect(page.getByRole("dialog")).toContainText("No name needed.");
  await expect(page.getByRole("dialog")).toHaveCSS("position", "fixed");
  await expect(trigger).toHaveCSS("width", "25px");
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

test("copies the install command and resets its confirmation after the latest copy", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.install();
  await page.goto("/");
  const copy = page.getByRole("button", { name: "Copy install command" });
  const initialBox = await page.locator(".install-command").boundingBox();
  await copy.click();
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "npm i react-pinote",
  );
  await expect(copy.locator(".copy-check")).toHaveCSS("opacity", "1");
  expect(await page.locator(".install-command").boundingBox()).toEqual(
    initialBox,
  );
  await page.clock.fastForward(1200);
  await copy.click();
  await page.clock.fastForward(1200);
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
  await page.clock.fastForward(1000);
  await expect(copy.locator(".copy-clipboard")).toHaveCSS("opacity", "1");
  await expect(page.getByRole("status")).toBeEmpty();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await copy.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
  await expect(copy.locator(".copy-check")).toHaveCSS("transform", "none");
  await expect(copy.locator(".copy-check")).toHaveCSS("filter", "none");
  await expect(copy).toBeFocused();
  await expect(page.getByRole("link", { name: "GitHub" })).toHaveAttribute(
    "target",
    "_blank",
  );
});

test("reports a clipboard failure without showing success and allows retrying", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let attempts = 0;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: () =>
          ++attempts === 1
            ? Promise.reject(
                new DOMException("Permission denied", "NotAllowedError"),
              )
            : Promise.resolve(),
      },
    });
  });
  await page.goto("/");
  const copy = page.getByRole("button", { name: "Copy install command" });
  await copy.click();
  await expect(page.getByRole("status")).toHaveText(
    "Couldn't copy. Select the command and copy it manually.",
  );
  await expect(page.getByRole("status")).toBeVisible();
  await expect(copy.locator(".copy-check")).toHaveCSS("opacity", "0");
  await expect(page.locator(".install-command code")).toHaveText(
    "npm i react-pinote",
  );
  await copy.click();
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard.");
});

test("small screens keep cards inside the viewport and reduced motion stays still", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Open anonymous pinote", exact: true }),
  ).toHaveAttribute("data-entrance", "pop");
  const labels = await page
    .locator('[data-slot="pinote-trigger"]')
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label")!),
    );
  for (const name of labels) {
    const button = page.getByRole("button", { name, exact: true });
    await button.click();
    const panel = page.getByRole("dialog");
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("animation-name", "none");
    const bounds = await panel.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(11);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(309);
    expect(bounds!.y).toBeGreaterThanOrEqual(11);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(629);
    await page.keyboard.press("Escape");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  );
});

for (const width of [320, 412, 600, 900]) {
  test(`expansions keep their pointed corner anchored on a ${width}px screen`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 839 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.locator("html").evaluate((node) => {
      node.style.setProperty("--pinote-duration", "10s");
      node.style.setProperty("--pinote-hover-scale", "1");
      return document.fonts.ready;
    });
    for (const name of [
      "Open pinote from Kapeka",
      "Open pinote about highlighted text",
    ]) {
      const trigger = page.getByRole("button", { name, exact: true });
      await trigger.evaluate((node) =>
        node.getAnimations().forEach((animation) => animation.finish()),
      );
      const marker = (await trigger.boundingBox())!;
      await trigger.click();
      const panel = page.getByRole("dialog");
      await expect
        .poll(() => panel.evaluate((node) => node.getAnimations().length))
        .toBeGreaterThan(0);
      await panel.evaluate((node) =>
        node.getAnimations({ subtree: true }).forEach((animation) => {
          animation.pause();
          animation.currentTime = 0;
        }),
      );
      const start = await clippedBounds(panel);
      expect(start.x, name).toBeCloseTo(marker.x, 0);
      expect(start.y, name).toBeCloseTo(marker.y, 0);
      expect(start.width).toBeCloseTo(marker.width, 0);
      expect(start.height).toBeCloseTo(marker.height, 0);
      const corner = await panel.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          right:
            style.borderTopRightRadius === "0px" ||
            style.borderBottomRightRadius === "0px",
          bottom:
            style.borderBottomLeftRadius === "0px" ||
            style.borderBottomRightRadius === "0px",
        };
      });
      const expectCorner = (bounds: typeof marker) => {
        expect(bounds.x + (corner.right ? bounds.width : 0), name).toBeCloseTo(
          marker.x + (corner.right ? marker.width : 0),
          0,
        );
        expect(
          bounds.y + (corner.bottom ? bounds.height : 0),
          name,
        ).toBeCloseTo(marker.y + (corner.bottom ? marker.height : 0), 0);
      };
      for (const fraction of [0.25, 0.5, 0.75]) {
        await panel.evaluate((node, progress) => {
          node.getAnimations({ subtree: true }).forEach((animation) => {
            animation.currentTime =
              Number(animation.effect!.getTiming().duration) * progress;
          });
        }, fraction);
        expectCorner(await clippedBounds(panel));
      }
      await panel.evaluate((node) =>
        node
          .getAnimations({ subtree: true })
          .forEach((animation) => animation.finish()),
      );
      const opened = (await panel.boundingBox())!;
      expectCorner(opened);
      expect(opened.x).toBeGreaterThanOrEqual(11);
      expect(opened.x + opened.width).toBeLessThanOrEqual(width - 11);
      if (testInfo.project.name === "mobile" && width <= 412) {
        await page.screenshot({
          path: testInfo.outputPath(
            `${name.includes("Kapeka") ? "kapeka" : "word"}.png`,
          ),
        });
      }
      await page.mouse.move(0, 0);
      await page.keyboard.press("Escape");
      const exiting = page.locator(
        '[data-slot="pinote-content"][data-leaving]',
      );
      await expect(exiting).toHaveAttribute("inert", "");
      for (const fraction of [0.25, 0.5, 0.75]) {
        await exiting.evaluate((node, progress) => {
          node.getAnimations({ subtree: true }).forEach((animation) => {
            animation.pause();
            animation.currentTime =
              Number(animation.effect!.getTiming().duration) * progress;
          });
        }, fraction);
        expectCorner(await clippedBounds(exiting));
      }
      await exiting.evaluate((node) =>
        node.getAnimations({ subtree: true }).forEach((animation) => {
          animation.pause();
          animation.currentTime =
            Number(animation.effect!.getTiming().duration) - 0.01;
        }),
      );
      const end = await clippedBounds(exiting);
      expect(end.x, name).toBeCloseTo(marker.x, 0);
      expect(end.y, name).toBeCloseTo(marker.y, 0);
      expect(end.width).toBeCloseTo(marker.width, 0);
      expect(end.height).toBeCloseTo(marker.height, 0);
      await exiting.evaluate((node) =>
        node
          .getAnimations({ subtree: true })
          .forEach((animation) => animation.finish()),
      );
      await expect(exiting).toHaveCount(0);
    }
  });
}

test("never paints the saved marker at its default position while hydration is delayed", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("react-pinote:demo-position:v1", '{"x":75,"y":65}');
  });
  let resumeHydration!: () => void;
  const hydration = new Promise<void>((resolve) => {
    resumeHydration = resolve;
  });
  await page.route("**/*.js", async (route) => {
    await hydration;
    await route.continue();
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const trigger = page.getByRole("button", {
    name: "Open anonymous pinote",
    exact: true,
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    await expect(page.locator("h1")).toBeVisible();
    await expect(trigger).toBeHidden();
  } finally {
    resumeHydration();
  }
  await expect(trigger).toBeVisible();
  expect(
    await trigger.evaluate((node) => ({
      left: node.parentElement!.parentElement!.style.left,
      top: node.parentElement!.parentElement!.style.top,
    })),
  ).toEqual({ left: "75%", top: "65%" });
  expect(errors).toEqual([]);
});

test("the draggable demo remembers a committed position across reloads", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Open anonymous pinote",
    exact: true,
  });
  await expect(trigger).toHaveAttribute("data-entrance", "pop");
  await dragBy(page, trigger, 40, 30);
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("react-pinote:demo-position:v1")!) as {
        x: number;
        y: number;
      },
  );
  expect(saved.x).toBeGreaterThan(25);
  expect(saved.y).toBeGreaterThan(30);
  await page.reload();
  await expect
    .poll(async () => {
      const marker = (await trigger.boundingBox())!;
      const layer = (await page
        .locator('[data-slot="pinote-layer"]')
        .boundingBox())!;
      return Math.abs(
        (marker.x + marker.width / 2 - layer.x) / layer.width - saved.x / 100,
      );
    })
    .toBeLessThan(0.001);
  await expect(trigger).toHaveCSS("scale", "none", { timeout: 2000 });
});

test("invalid or unavailable browser storage does not break the demo", async ({
  page,
}) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem(
        "react-pinote:demo-position:v1",
        '{"x":"wrong","y":999}',
      );
    } catch {
      /* Storage can be unavailable on reload. */
    }
  });
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Open anonymous pinote",
    exact: true,
  });
  await dragBy(page, trigger, 40, 0);
  const saved = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("react-pinote:demo-position:v1")!) as {
        x: number;
        y: number;
      },
  );
  expect(saved.x).toBeGreaterThan(25);
  expect(saved.y).toBeCloseTo(30, 0);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Unavailable");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Unavailable");
    };
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.reload();
  await dragBy(page, trigger, 40, 0);
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(errors).toEqual([]);
});

test("shadcn class changes update an already open body portal", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByRole("button", { name: "Open pinote from Kapeka" }).click();
  const panel = page.getByRole("dialog");
  const avatar = page
    .getByRole("button", { name: "Open pinote from Kapeka" })
    .locator("img");
  await expect(avatar).toHaveAttribute("src", /kapeka.*\.webp/);
  await expect(panel.locator("img")).toHaveAttribute(
    "src",
    (await avatar.getAttribute("src"))!,
  );
  expect(
    await avatar.evaluate((node) => (node as HTMLImageElement).naturalWidth),
  ).toBe(96);
  const codexTrigger = page.getByRole("button", {
    name: "Open pinote with a side author",
  });
  await expect(codexTrigger.locator("img").first()).toHaveAttribute(
    "src",
    /codex.*\.svg/,
  );
  await codexTrigger.click();
  await expect(page.getByRole("dialog")).toContainText("Codex");
  await expect(panel).toHaveAttribute("data-pinote-theme", "light");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect(panel).toHaveAttribute("data-pinote-theme", "dark");
  await expect(panel).toHaveCSS("color-scheme", "dark");
  await expect(panel.locator('[data-slot="pinote-body"]')).toHaveCSS(
    "opacity",
    "1",
  );
  expect(
    await new AxeBuilder({ page })
      .analyze()
      .then((result) => result.violations),
  ).toEqual([]);
});

test("the app-owned read-only conversation keeps extra avatars mostly hidden", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator('[data-slot="pinote-trigger"]')).toHaveCount(6);
  await expect(page.getByRole("toolbar")).toHaveCount(0);
  await expect(page.locator('[data-slot="pinote-trigger"] svg')).toHaveCount(0);
  await expect(page.locator('[data-slot="pinote-icon"]')).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open anonymous pinote", exact: true }),
  ).toHaveAttribute("data-orientation", "bottom-right");
  const trigger = page.getByRole("button", {
    name: "Open pinote with a side author",
    exact: true,
  });
  const images = trigger.locator("img");
  await expect(images).toHaveCount(3);
  await expect(trigger).toHaveAttribute("data-entrance", "pop");
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  const sources = await images.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("src")),
  );
  expect(new Set(sources).size).toBe(3);
  for (let index = 1; index < 3; index++) {
    const previous = (await images.nth(index - 1).boundingBox())!;
    const current = (await images.nth(index).boundingBox())!;
    expect(current.x - previous.x).toBeCloseTo(8, 0);
    expect(current.y).toBeCloseTo(previous.y, 0);
  }
  const resting = await images.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().x),
  );
  const isTriggerInFront = () =>
    trigger.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const front = document.elementFromPoint(
        bounds.right - 3,
        bounds.y + bounds.height / 2,
      );
      return front === node || Boolean(front?.closest(".demo-trigger-face"));
    });
  expect(await isTriggerInFront()).toBe(true);
  await trigger.hover();
  const finePointer = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  if (finePointer) {
    for (let index = 0; index < 3; index++) {
      await expect
        .poll(
          async () =>
            (await images.nth(index).boundingBox())!.x - resting[index]!,
        )
        .toBeGreaterThan(2 + index * 2);
    }
  }
  expect(await isTriggerInFront()).toBe(true);
  const panel = page.getByRole("dialog", {
    name: "Open pinote with a side author",
  });
  await expect(panel).toContainText("I found the last bug.");
  await expect(panel).not.toContainText("Claude");
  await expect(panel).not.toContainText("Kimi");
  await trigger.click();
  await expect(panel).toBeFocused();
  await expect(panel).toContainText("Claude");
  await expect(panel).toContainText("Kimi");
  await expect(panel.getByRole("textbox")).toHaveCount(0);
  await expect(panel.getByRole("button")).toHaveCount(0);
});
