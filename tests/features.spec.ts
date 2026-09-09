import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto(
    `http://127.0.0.1:${testInfo.project.name === "react18" ? 4323 : 4322}`,
  );
});

test("uses a neutral default and matching, borderless colored messages", async ({
  page,
}) => {
  const backgrounds: string[] = [];
  for (const color of ["neutral", "blue", "red"]) {
    const trigger = page.getByRole("button", {
      name: `${color} pinote`,
      exact: true,
    });
    await trigger.click();
    const card = page.getByRole("dialog", {
      name: `${color} pinote`,
      exact: true,
    });
    await expect(card).toBeVisible();
    const appearance = await trigger.evaluate((node) => {
      const style = getComputedStyle(node);
      return [
        style.backgroundColor,
        style.color,
        style.boxShadow,
        style.borderWidth,
      ];
    });
    expect(
      await card.evaluate((node) => {
        const style = getComputedStyle(node);
        return [
          style.backgroundColor,
          style.color,
          style.boxShadow,
          style.borderWidth,
        ];
      }),
    ).toEqual(appearance);
    expect(appearance[0]).not.toBe("rgb(255, 255, 255)");
    expect(appearance[0]).not.toBe("oklch(1 0 0)");
    expect(appearance[3]).toBe("0px");
    backgrounds.push(appearance[0]!);
    await page.keyboard.press("Escape");
  }
  expect(new Set(backgrounds).size).toBe(3);
});

test("fits short messages to their text and wraps long content within the width limit", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "neutral pinote", exact: true })
    .click();
  const panel = page.getByRole("dialog", {
    name: "neutral pinote",
    exact: true,
  });
  const measurements = await panel.evaluate((node) => {
    const text = document.createRange();
    text.selectNodeContents(node.querySelector('[data-slot="pinote-body"]')!);
    const style = getComputedStyle(node);
    return {
      width: node.getBoundingClientRect().width,
      textWidth: text.getBoundingClientRect().width,
      padding: parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    };
  });
  expect(measurements.width).toBeCloseTo(
    measurements.textWidth + measurements.padding,
    0,
  );
  await panel.locator('[data-slot="pinote-body"]').evaluate((node) => {
    node.textContent = "AReallyLongWordWithoutAnySpaces".repeat(10);
  });
  await expect(panel).toHaveCSS("width", "280px");
  await panel.evaluate((node) =>
    node.style.setProperty("--pinote-width", "180px"),
  );
  await expect(panel).toHaveCSS("width", "180px");
  await page.setViewportSize({ width: 160, height: 700 });
  await expect(panel).toHaveCSS("width", "136px");
  expect(
    await panel.evaluate((node) => node.scrollWidth <= node.clientWidth),
  ).toBe(true);
});

test("scales down uniformly on hover and keeps exit surfaces inert until their animation finishes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "neutral pinote",
    exact: true,
  });
  await trigger.evaluate((node) =>
    node.parentElement!.style.setProperty("--pinote-duration", "600ms"),
  );
  const finePointer = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  await trigger.hover();
  await expect(trigger).toHaveCSS("scale", finePointer ? "0.96" : "none");
  const hitArea = (await trigger.locator("..").boundingBox())!;
  await page.mouse.move(hitArea.x + 0.1, hitArea.y + hitArea.height / 2);
  await expect(trigger).toHaveCSS("scale", finePointer ? "0.96" : "none");
  await expect(trigger).toHaveCSS("background-color", "rgb(44, 44, 44)");
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "neutral pinote",
    exact: true,
  });
  await panel.evaluate((node) =>
    node.style.setProperty("--pinote-duration", "600ms"),
  );
  await panel.evaluate((node) =>
    Promise.all(node.getAnimations().map((animation) => animation.finished)),
  );
  await page.keyboard.press("Escape");
  const exiting = page.locator('[data-slot="pinote-content"][data-leaving]');
  await expect(exiting).toHaveAttribute("inert", "");
  await expect(exiting).toHaveAttribute("aria-hidden", "true");
  expect(
    await exiting.evaluate((node) => node.getAnimations().length),
  ).toBeGreaterThan(0);
  await expect(exiting).toHaveCount(0);
  await expect(trigger).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(trigger).toHaveCSS("scale", "none");
});

test("orients the pointed corner without rotating the icon or moving the attachment", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Attached pinote",
    exact: true,
  });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate((node) =>
    Promise.all(node.getAnimations().map((animation) => animation.finished)),
  );
  const initial = await trigger.boundingBox();
  for (const corner of [
    "top-left",
    "top-right",
    "bottom-right",
    "bottom-left",
  ]) {
    await page.getByLabel("Tip orientation").selectOption(corner);
    await expect(trigger).toHaveCSS(`border-${corner}-radius`, "0px");
    await expect(trigger.locator("svg")).toHaveCSS("transform", "none");
    expect(await trigger.boundingBox()).toEqual(initial);
  }
});

test("pops in by default and respects reduced motion without disabling interaction", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "neutral pinote",
    exact: true,
  });
  await expect(trigger).toHaveCSS("animation-name", "pn-enter");
  await expect(trigger).toHaveCSS("animation-delay", "0s");
  await expect(trigger).toHaveCSS("animation-fill-mode", "backwards");
  await trigger.evaluate((node) => {
    // Restart only for sampling: the zero-delay entrance may have finished
    // before the browser test gets control on a busy worker.
    node.style.animationName = "none";
    void getComputedStyle(node).animationName;
    node.style.animationName = "";
    const entrance = node
      .getAnimations()
      .find((animation) => animation instanceof CSSAnimation);
    entrance!.pause();
    const timing = entrance!.effect!.getTiming();
    entrance!.currentTime = Number(timing.delay) + Number(timing.duration) / 10;
  });
  await expect(trigger).toHaveCSS("opacity", "1");
  const scale = Number(
    await trigger.evaluate((node) => getComputedStyle(node).scale),
  );
  expect(scale).toBeGreaterThan(0);
  expect(scale).toBeLessThan(0.6);
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  await expect(
    page.getByRole("button", { name: "Draggable pinote", exact: true }),
  ).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(trigger).toHaveCSS("animation-name", "none");
  await trigger.click();
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveCSS("animation-name", "none");
  await expect(panel).toHaveCSS("transition-property", "opacity");
  await expect(panel).toHaveCSS("transition-duration", "0.2s");
  await expect(panel).toHaveCSS("transform", "none");
  await expect(panel).toHaveCSS("scale", "none");
  await expect(panel).toHaveCSS("translate", "none");
  await expect(panel).toHaveCSS("clip-path", "none");
});

test("opens and focuses a message without waiting for its transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "neutral pinote",
    exact: true,
  });
  await trigger.evaluate((node) =>
    node
      .closest('[data-slot="pinote"]')!
      .setAttribute(
        "style",
        "--pinote-duration:10s;position:absolute;left:20%;top:50%",
      ),
  );
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "neutral pinote",
    exact: true,
  });
  await expect(panel).toBeFocused({ timeout: 1500 });
  await expect(panel).toHaveCSS("visibility", "visible");
  expect(
    await panel.evaluate((node) =>
      node
        .getAnimations()
        .some((animation) => animation.playState === "running"),
    ),
  ).toBe(true);
});

test("reopens a mounted exit from its current transition value", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "neutral pinote",
    exact: true,
  });
  await trigger.click();
  const panel = page.locator(
    '[data-slot="pinote-content"][aria-label="neutral pinote"]',
  );
  await expect(panel).toHaveCSS("opacity", "1");
  await panel.evaluate((node) =>
    node.style.setProperty("--pinote-duration", "2000ms"),
  );
  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("data-leaving", "");
  const exitingOpacity = await panel.evaluate((node) => {
    const transition = node
      .getAnimations()
      .find(
        (animation) =>
          animation instanceof CSSTransition &&
          animation.transitionProperty === "opacity",
      );
    transition?.pause();
    if (transition)
      transition.currentTime =
        Number(transition.effect!.getTiming().duration) / 4;
    return Number(getComputedStyle(node).opacity);
  });
  expect(exitingOpacity).toBeGreaterThan(0.05);
  expect(exitingOpacity).toBeLessThan(1);
  await trigger.click();
  await expect(panel).not.toHaveAttribute("data-leaving", "");
  await expect(panel).toHaveCSS("animation-name", "none");
  const transitionStart = await panel.evaluate((node) => {
    const opacity = node
      .getAnimations()
      .find(
        (animation) =>
          animation instanceof CSSTransition &&
          animation.transitionProperty === "opacity",
      );
    return Number(
      (opacity?.effect as KeyframeEffect | null)?.getKeyframes()[0]?.opacity,
    );
  });
  expect(transitionStart).toBeGreaterThan(0.05);
  await panel.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  await expect(panel).toHaveCSS("opacity", "1");
});

test("uses the scale, slide and fade transition targets", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("http://127.0.0.1:4321");
  for (const [name, animation, exitTransform] of [
    [
      "Open pinote with a side author",
      "scale",
      "matrix(0.96, 0, 0, 0.96, 0, 0)",
    ],
    ["Open one-time pinote", "slide", "matrix(1, 0, 0, 1, 0, 6)"],
    ["Open anonymous pinote", "fade", "none"],
  ] as const) {
    await page.getByRole("button", { name, exact: true }).click();
    const panel = page.getByRole("dialog");
    await expect(panel).toHaveAttribute("data-animation", animation);
    await expect(panel).toHaveCSS("opacity", "1");
    await expect(panel).toHaveCSS("transform", "none");
    await expect(panel).toHaveCSS(
      "transition-timing-function",
      "cubic-bezier(0.2, 0, 0, 1)",
    );
    await page.keyboard.press("Escape");
    const exiting = page.locator('[data-slot="pinote-content"][data-leaving]');
    expect(
      await exiting.evaluate((node) => {
        node.getAnimations().forEach((animation) => {
          animation.finish();
        });
        const style = getComputedStyle(node);
        return { opacity: style.opacity, transform: style.transform };
      }),
    ).toEqual({ opacity: "0", transform: exitTransform });
    await expect(exiting).toHaveCount(0);
  }
  await page
    .getByRole("button", { name: "Open custom style pinote", exact: true })
    .click();
  const instant = page.getByRole("dialog");
  await expect(instant).toHaveAttribute("data-animation", "none");
  await expect(instant).toHaveCSS("transition-duration", "0s");
});

test("drags without jumping, emits positions, clamps to the layer and suppresses the release click", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Draggable pinote",
    exact: true,
  });
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toHaveCSS("cursor", "pointer");
  const start = (await trigger.boundingBox())!;
  await page.mouse.move(start.x + 4, start.y + 4);
  await page.mouse.down();
  await expect(trigger).toHaveCSS("cursor", "grabbing");
  await page.mouse.move(start.x + 6, start.y + 4);
  await expect(trigger).toHaveCSS("cursor", "grabbing");
  await page.mouse.move(start.x + 44, start.y + 24, { steps: 4 });
  await expect(trigger).toHaveCSS("cursor", "grabbing");
  const moved = (await trigger.boundingBox())!;
  expect(moved.x - start.x).toBeCloseTo(40, 0);
  // Visual scaling must not change the pointer's offset from the marker center.
  expect(moved.y + moved.height / 2 - start.y - start.height / 2).toBeCloseTo(
    20,
    0,
  );
  await expect(page.getByTestId("drag-ends")).toHaveText("0");
  await page.mouse.up();
  await expect(trigger).toHaveCSS("cursor", "pointer");
  await expect(page.getByTestId("drag-ends")).toHaveText("1");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.mouse.move(moved.x + 4, moved.y + 4);
  await page.mouse.down();
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await expect(page.getByTestId("drag-position")).toHaveText('{"x":0,"y":0}');
});

test("does not move or commit positions from arrow-key shortcuts", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Draggable pinote",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Shift+ArrowDown");
  await expect(page.getByTestId("drag-position")).toHaveText('{"x":50,"y":50}');
  await expect(page.getByTestId("drag-ends")).toHaveText("0");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toHaveText("Drag content");
});

test("keeps controlled positions unchanged by arrow keys", async ({ page }) => {
  const trigger = page.getByRole("button", {
    name: "Movable pinote",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("output").first()).toHaveText('{"x":50,"y":50}');
});

test("app-owned one-time pinotes ignore hover and focus, then consume on focus leaving the group", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Hiding pinote",
    exact: true,
  });
  const panel = page.getByRole("dialog", {
    name: "Hiding pinote",
    exact: true,
  });
  await trigger.hover();
  await expect(panel).toHaveCount(0);
  await trigger.focus();
  await expect(panel).toHaveCount(0);
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("button", { name: "Reply" })).toBeFocused();
  await expect(trigger).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "After hiding pinote" }),
  ).toBeFocused();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveCount(0);
});

test("closes an open message on drag start and keeps it closed through release", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Draggable pinote",
    exact: true,
  });
  const panel = page.getByRole("dialog", {
    name: "Draggable pinote",
    exact: true,
  });
  await trigger.click();
  await expect(panel).toBeVisible();
  const box = (await trigger.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(panel).toHaveCount(0);
  await page.mouse.move(box.x + 70, box.y + 40, { steps: 5 });
  await expect(panel).toHaveCount(0);
  await page.mouse.up();
  await expect(panel).toHaveCount(0);
  const released = (await trigger.boundingBox())!;
  await page.mouse.move(
    released.x + released.width / 2 + 1,
    released.y + released.height / 2,
  );
  await expect(panel).toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(panel).toHaveCount(0);
});

test("a draggable trigger still toggles on ordinary clicks", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Draggable pinote",
    exact: true,
  });
  const panel = page.getByRole("dialog", {
    name: "Draggable pinote",
    exact: true,
  });
  await trigger.click();
  await expect(panel).toBeVisible();
  await trigger.click();
  await expect(panel).toHaveCount(0);
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(page.getByTestId("drag-ends")).toHaveText("0");
});

test("aligns the expanded avatar with its author, not the entire message", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Expanding pinote",
    exact: true,
  });
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  const marker = (await trigger.boundingBox())!;
  const photo = (await trigger.locator("img").boundingBox())!;
  expect(marker.width).toBeCloseTo(marker.height, 1);
  expect(photo.x + photo.width / 2).toBeCloseTo(marker.x + marker.width / 2, 1);
  expect(photo.y + photo.height / 2).toBeCloseTo(
    marker.y + marker.height / 2,
    1,
  );
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Expanding pinote",
    exact: true,
  });
  await expect(panel.locator("bdi")).toHaveCSS("opacity", "1");
  const avatar = (await panel
    .locator('[data-slot="pinote-avatar"]')
    .boundingBox())!;
  expect(avatar.width).toBeCloseTo(21, 0);
  const author = (await panel.locator("bdi").boundingBox())!;
  expect(
    Math.abs(avatar.y + avatar.height / 2 - author.y - author.height / 2),
  ).toBeLessThan(2);
});

test("expansion moves one avatar on a stable surface and reverses without a jump", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 900, height: 2200 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "Expanding pinote",
    exact: true,
  });
  await trigger.evaluate((node) => {
    node.parentElement!.parentElement!.style.setProperty(
      "--pinote-duration",
      "2200ms",
    );
    node.getAnimations().forEach((animation) => animation.finish());
  });
  const anchor = (await trigger.boundingBox())!;
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Expanding pinote",
    exact: true,
  });
  await expect
    .poll(() =>
      panel.evaluate((node) => node.getAnimations({ subtree: true }).length),
    )
    .toBeGreaterThanOrEqual(2);
  await expect(panel).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.2, 0, 0, 1)",
  );
  await expect(trigger).toHaveCSS("opacity", "0");
  expect(
    await panel
      .locator("img")
      .evaluate((node) => (node as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  for (const progress of [0.25, 0.5, 0.75]) {
    await panel.evaluate((node, fraction) => {
      node.getAnimations({ subtree: true }).forEach((animation) => {
        animation.pause();
        animation.currentTime =
          Number(animation.effect!.getTiming().duration) * fraction;
      });
    }, progress);
    const card = (await panel.boundingBox())!;
    expect(card.x).toBeCloseTo(anchor.x, 0);
    expect(card.y + card.height).toBeCloseTo(anchor.y + anchor.height, 0);
    await page.screenshot({
      path: testInfo.outputPath(`expand-${progress}.png`),
      clip: {
        x: card.x - 8,
        y: card.y - 8,
        width: card.width + 16,
        height: card.height + 16,
      },
    });
  }
  const inset = (value: string) => {
    const values = value
      .slice(value.indexOf("(") + 1, value.indexOf(" round"))
      .split(" ")
      .map(Number.parseFloat);
    if (values.length === 1)
      return [values[0], values[0], values[0], values[0]];
    if (values.length === 2)
      return [values[0], values[1], values[0], values[1]];
    if (values.length === 3)
      return [values[0], values[1], values[2], values[1]];
    return values;
  };
  const before = inset(
    await panel.evaluate((node) => getComputedStyle(node).clipPath),
  );
  await page.keyboard.press("Escape");
  const exiting = page.locator('[data-slot="pinote-content"][data-leaving]');
  await exiting.evaluate((node) =>
    node.getAnimations({ subtree: true }).forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    }),
  );
  const after = inset(
    await exiting.evaluate((node) => getComputedStyle(node).clipPath),
  );
  expect(after).toEqual(before);
  for (const progress of [0.1, 0.5, 0.9]) {
    await exiting.evaluate((node, fraction) => {
      node.getAnimations({ subtree: true }).forEach((animation) => {
        animation.pause();
        animation.currentTime =
          Number(animation.effect!.getTiming().duration) * fraction;
      });
    }, progress);
    await expect(exiting).toHaveCSS("opacity", "1");
    await expect(exiting.locator("img")).toHaveCSS("opacity", "1");
    // The close should ease into motion, then keep moving through its midpoint.
    // An opening-style ease-out leaves almost no movement in the second half.
    const travel = await exiting.locator("img").evaluate((node) => {
      const motion = node
        .getAnimations()
        .find(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "transform",
        )!;
      const frames = (motion.effect as KeyframeEffect).getKeyframes();
      const start = new DOMMatrix(frames[0]!.transform as string);
      const end = new DOMMatrix(frames.at(-1)!.transform as string);
      const current = new DOMMatrix(getComputedStyle(node).transform);
      return (
        Math.hypot(current.m41 - start.m41, current.m42 - start.m42) /
        Math.hypot(end.m41 - start.m41, end.m42 - start.m42)
      );
    });
    if (progress === 0.1) expect(travel).toBeLessThan(0.1);
    if (progress === 0.5) expect(travel).toBeLessThan(0.85);
    if (progress === 0.9) expect(travel).toBeGreaterThan(0.95);
    const card = (await exiting.boundingBox())!;
    await page.screenshot({
      path: testInfo.outputPath(`contract-${progress}.png`),
      clip: {
        x: card.x - 8,
        y: card.y - 8,
        width: card.width + 16,
        height: card.height + 16,
      },
    });
  }
  await exiting.evaluate((node) =>
    node
      .getAnimations({ subtree: true })
      .forEach((animation) => animation.finish()),
  );
  await expect(exiting).toHaveCount(0);
  await expect(trigger).toHaveCSS("opacity", "1");
  expect(
    await trigger.evaluate((node) =>
      node
        .getAnimations()
        .some(
          (animation) =>
            animation instanceof CSSTransition &&
            animation.transitionProperty === "opacity",
        ),
    ),
  ).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Hover can replace the trigger with the panel before the click lands.
  await page.mouse.click(
    anchor.x + anchor.width / 2,
    anchor.y + anchor.height / 2,
  );
  await expect(panel).toBeVisible();
  await expect(panel).toBeFocused();
  await expect(panel).toHaveCSS("transition-property", "opacity");
  await expect(panel).toHaveCSS("transition-duration", "0.2s");
  await expect(panel).toHaveCSS("transform", "none");
  await expect(panel).toHaveCSS("scale", "none");
  await expect(panel).toHaveCSS("translate", "none");
  await expect(panel).toHaveCSS("clip-path", "none");
});

test("one-time pinotes open normally and disappear after an outside click", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Hiding pinote",
    exact: true,
  });
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Hiding pinote",
    exact: true,
  });
  await expect(panel).toBeVisible();
  await expect(trigger).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(panel).toBeVisible();
  await page
    .getByRole("button", { name: "After hiding pinote", exact: true })
    .click();
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "After hiding pinote", exact: true }),
  ).toBeFocused();
});

test("supports touch dragging and rolls back a cancelled touch gesture", async ({
  page,
  context,
}) => {
  const trigger = page.getByRole("button", {
    name: "Draggable pinote",
    exact: true,
  });
  await trigger.scrollIntoViewIfNeeded();
  const start = (await trigger.boundingBox())!;
  const client = await context.newCDPSession(page);
  const touch = async (
    type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
    x = 0,
    y = 0,
  ) => {
    await client.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" || type === "touchCancel" ? [] : [{ x, y, id: 1 }],
    });
  };
  await touch("touchStart", start.x + 12, start.y + 12);
  await touch("touchMove", start.x + 62, start.y + 32);
  await touch("touchEnd");
  await expect(page.getByTestId("drag-ends")).toHaveText("1");
  const committed = await page.getByTestId("drag-position").textContent();
  const moved = (await trigger.boundingBox())!;
  expect(moved.x - start.x).toBeCloseTo(50, 0);
  await touch("touchStart", moved.x + 12, moved.y + 12);
  await touch("touchMove", moved.x + 62, moved.y + 32);
  await touch("touchCancel");
  await expect(page.getByTestId("drag-position")).toHaveText(committed!);
  await expect(page.getByTestId("drag-ends")).toHaveText("1");
  await client.detach();
});

test("expands from the marker's pointed corner and contracts back into it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 2200 });
  const trigger = page.getByRole("button", {
    name: "Expanding pinote",
    exact: true,
  });
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Expanding pinote",
    exact: true,
  });
  await expect(panel).toHaveCSS("border-bottom-left-radius", "0px");
  const card = (await panel.boundingBox())!;
  const marker = (await trigger.boundingBox())!;
  expect(card.x).toBeCloseTo(marker.x, 0);
  expect(card.y + card.height).toBeCloseTo(marker.y + marker.height, 0);
  expect(card.width).toBeGreaterThan(marker.width * 4);
  await expect(panel).toContainText("An expanding message");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeVisible();
  await trigger.hover();
  await expect(panel).toBeVisible();
  // Activate the visible surface at the marker, even after it has expanded.
  await page.mouse.click(
    marker.x + marker.width / 2,
    marker.y + marker.height / 2,
  );
  await expect(panel).toBeVisible();
  await expect(panel).toBeFocused();
});

test("expanded keyboard focus remains visible and can leave the message", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Expanding pinote",
    exact: true,
  });
  await trigger.focus();
  const panel = page.getByRole("dialog", {
    name: "Expanding pinote",
    exact: true,
  });
  await expect(panel).toHaveCSS("outline-style", "auto");
  await trigger.press("Enter");
  await expect(panel).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(trigger).toBeFocused();
  await expect(panel).toHaveCSS("outline-style", "auto");
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveCSS("opacity", "1");
});

test("a clamped expansion stays open under the pointer and closes promptly on leave", async ({
  page,
}) => {
  test.skip(
    !(await page.evaluate(
      () => matchMedia("(hover: hover) and (pointer: fine)").matches,
    )),
    "Pointer-leave previews do not apply to coarse pointers.",
  );
  const trigger = page.getByRole("button", {
    name: "Expanding pinote",
    exact: true,
  });
  await trigger.evaluate((node) => node.scrollIntoView({ block: "start" }));
  await trigger.hover();
  const panel = page.getByRole("dialog", {
    name: "Expanding pinote",
    exact: true,
  });
  await expect(panel.locator("bdi")).toHaveCSS("opacity", "1");
  await expect(panel).toHaveCSS("transition-duration", "0.16s");
  await page.mouse.move(0, 0);
  await expect(page.locator('[data-slot="pinote-content"]')).toHaveCount(0, {
    timeout: 400,
  });
});

test("a side author overlaps the trigger and reveals three pixels on hover", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "Side author pinote",
    exact: true,
  });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  const avatar = trigger.locator("img");
  const finePointer = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  await expect(trigger.locator('[data-slot="pinote-icon"]')).toHaveText("1");
  await expect(avatar).toHaveCSS("translate", "none");
  await expect(avatar).toHaveCSS("width", "25px");
  await expect(avatar).toHaveCSS("height", "25px");
  await expect(avatar).toHaveCSS("cursor", "pointer");
  await expect(avatar).toHaveCSS("outline-color", "rgb(44, 44, 44)");
  await expect(avatar).toHaveCSS("border-radius", "50%");
  const photo = (await avatar.boundingBox())!;
  const marker = (await trigger.boundingBox())!;
  expect(marker.x + marker.width - photo.x).toBeCloseTo(16, 0);
  expect(photo.x + photo.width / 2).toBeGreaterThan(marker.x);
  expect(photo.x + photo.width / 2).toBeLessThan(marker.x + marker.width);
  expect(photo.y + photo.height / 2).toBeCloseTo(
    marker.y + marker.height / 2,
    0,
  );
  if (finePointer)
    expect(
      await page.evaluate(
        ({ coveredX, visibleX, y }) => ({
          covered: document
            .elementFromPoint(coveredX, y)
            ?.classList.contains("pn-f"),
          visible: (
            document.elementFromPoint(visibleX, y) as HTMLElement | null
          )?.dataset.slot,
        }),
        {
          coveredX: marker.x + marker.width - 2,
          visibleX: photo.x + photo.width - 2,
          y: photo.y + photo.height / 2,
        },
      ),
    ).toEqual({ covered: true, visible: "pinote-avatar" });
  await trigger.hover();
  await expect(avatar).toHaveCSS("translate", finePointer ? "3px" : "none");
  await expect(avatar).toHaveCSS("transition-duration", "0.14s");
  const revealedPhoto = (await avatar.boundingBox())!;
  expect(revealedPhoto.x - photo.x).toBeCloseTo(finePointer ? 3 : 0, 0);
  const panel = page.getByRole("dialog", {
    name: "Side author pinote",
    exact: true,
  });
  await expect(panel).toContainText("Maya");
  await expect(panel).toContainText("The author sits beside this trigger.");
  if ((await panel.getAttribute("data-side")) === "right") {
    const card = (await panel.boundingBox())!;
    const hoveredPhoto = (await avatar.boundingBox())!;
    expect(card.x - hoveredPhoto.x - hoveredPhoto.width).toBeGreaterThan(8);
  }
  await page.keyboard.press("Escape");
  await page.mouse.move(0, 0);
  await expect(avatar).toHaveCSS("translate", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(panel).toBeVisible();
  await expect(avatar).toHaveCSS("translate", "none");
  expect(await avatar.evaluate((node) => node.getAnimations().length)).toBe(0);
});

test("supports app headers, focus targets and configurable side motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = page.getByRole("button", {
    name: "Composable pinote",
    exact: true,
  });
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toHaveCSS("animation-delay", "0.3s");
  await expect(trigger).toHaveCSS("animation-duration", "0.6s");
  await trigger.evaluate((node) =>
    node.getAnimations().forEach((animation) => animation.finish()),
  );
  const aside = trigger.locator('[data-slot="pinote-trigger-aside"]');
  await expect(aside).toHaveCSS("left", "17px");
  const finePointer = await page.evaluate(
    () => matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  await trigger.hover();
  await expect(trigger).toHaveCSS("scale", finePointer ? "0.9" : "none");
  await expect(aside).toHaveCSS("translate", finePointer ? "7px" : "none");
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Composable pinote",
    exact: true,
  });
  await expect(
    panel.getByRole("textbox", { name: "App editor" }),
  ).toBeFocused();
  await expect(panel.getByText("App header")).toBeVisible();
  await expect(panel.locator('[data-slot="pinote-author"]')).toHaveCount(0);
  await expect(panel).toHaveCSS("transition-duration", "0.7s");
  await expect(panel).toHaveCSS("transition-timing-function", "linear");
  await expect(panel.locator('[data-slot="pinote-leading"]')).toHaveCSS(
    "transform",
    "none",
  );
  const before = (await panel.boundingBox())!;
  await panel.getByRole("button", { name: "Toggle context" }).click();
  await expect
    .poll(async () => (await panel.boundingBox())!.height)
    .toBeGreaterThan(before.height);
  const anchor = (await trigger.locator("..").boundingBox())!;
  await page.keyboard.press("Escape");
  const exiting = page.locator(
    '[data-slot="pinote-content"][aria-label="Composable pinote"][data-leaving]',
  );
  await expect(exiting).toHaveCSS("transition-duration", "0.9s");
  const center = await exiting.evaluate((node) => {
    node.getAnimations({ subtree: true }).forEach((animation) => {
      animation.finish();
    });
    const rect = node
      .querySelector('[data-slot="pinote-leading"]')!
      .getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });
  expect(center.x).toBeCloseTo(anchor.x + anchor.width / 2, 0);
  expect(center.y).toBeCloseTo(anchor.y + anchor.height / 2, 0);
  await expect(exiting).toHaveCount(0);
});

test("removes movement from custom leading visuals with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const trigger = page.getByRole("button", {
    name: "Composable pinote",
    exact: true,
  });
  await expect(trigger).toHaveCSS("animation-name", "none");
  await trigger.click();
  const panel = page.getByRole("dialog", {
    name: "Composable pinote",
    exact: true,
  });
  await expect(panel.locator('[data-slot="pinote-leading"]')).toHaveCSS(
    "transform",
    "none",
  );
  await page.keyboard.press("Escape");
  const exiting = page.locator(
    '[data-slot="pinote-content"][aria-label="Composable pinote"][data-leaving]',
  );
  await expect(exiting.locator('[data-slot="pinote-leading"]')).toHaveCSS(
    "transform",
    "none",
  );
  await expect(exiting).toHaveCount(0);
});

test("the app keeps an unseen one-time marker and consumes it after Escape then outside interaction", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Hiding pinote",
    exact: true,
  });
  await page
    .getByRole("button", { name: "After hiding pinote", exact: true })
    .click();
  await trigger.focus();
  await page.keyboard.press("Tab");
  await expect(trigger).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Hiding pinote", exact: true }),
  ).toHaveCount(0);
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "Hiding pinote", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeVisible();
  await page
    .getByRole("button", { name: "After hiding pinote", exact: true })
    .click();
  await expect(trigger).toHaveCount(0);
});
