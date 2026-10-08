import { expect, test } from "@playwright/test";

const contrast = (foreground: string, background: string) => {
  const luminance = (rgb: string) => {
    const [r, g, b] = rgb.match(/\d+(\.\d+)?/g)!.slice(0, 3).map(Number).map(value => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

test("renders landmarks, headings, copy and the supplied photos", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Meet landing page | Royer Adames");
  await expect(page.getByRole("banner").getByRole("img", { name: "meet" })).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Group Chat for Everyone");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Smarter meetings, all in one place", "Experience more together"]);
  await expect(page.getByText("Meet makes it easy to connect with others face-to-face virtually and collaborate across any device.")).toBeVisible();
  await expect(page.getByText("Built for modern use")).toBeVisible();
  await expect(page.getByText(/invite-only team access, data encryption, and data export\.$/)).toBeVisible();
  await expect(page.getByText("Stay connected with reliable HD meetings and unlimited one-on-one and group video sessions.")).toBeVisible();
  const photos = page.getByRole("list", { name: "People using Meet" }).getByRole("img");
  await expect(photos).toHaveCount(4);
  for (const photo of await photos.all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect(photo).not.toHaveAttribute("alt", "");
    await expect.poll(() => photo.evaluate(element => element instanceof HTMLImageElement && element.complete && element.naturalWidth === 510)).toBe(true);
  }
});

test("declares one site name in the footer, og:site_name and WebSite JSON-LD", async ({ page }) => {
  await page.goto("/");
  const name = "Meet landing page";
  await expect(page.locator(".site-name")).toHaveText(name);
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", name);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /group video chat/);
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? "{}");
  expect(jsonLd).toEqual({ "@context": "https://schema.org", "@type": "WebSite", name, url: "https://meet-landing-page-fm.royeradames.com" });
});

test("Download buttons say honestly that nothing downloads and send no requests", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") writes.push(request.url()); });
  await page.goto("/");
  const downloads = page.getByRole("button", { name: "Download v1.3" });
  await expect(downloads).toHaveCount(2);
  const note = /Demo only: Meet is a Frontend Mentor practice brand, so there’s no app to download\./;
  await expect(page.getByText(note)).toHaveCount(0);
  await downloads.first().click();
  const hero = page.getByRole("region", { name: "Group Chat for Everyone" });
  await expect(hero.getByRole("status")).toHaveText(note);
  await expect(downloads.first()).toHaveAccessibleDescription(note);
  await downloads.last().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Experience more together" }).getByRole("status")).toHaveText(note);
  expect(new URL(page.url()).pathname).toBe("/");
  expect(writes).toEqual([]);
});

test("What is it? jumps to and focuses the feature section", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "What is it?" }).click();
  await expect(page).toHaveURL(/#what-is-it$/);
  await expect(page.locator("#what-is-it")).toBeFocused();
  await expect(page.getByRole("heading", { name: "Smarter meetings, all in one place" })).toBeInViewport();
});

test("keyboard order and hover states follow the design", async ({ page }) => {
  await page.goto("/");
  const download = page.getByRole("button", { name: "Download v1.3" }).first();
  const what = page.getByRole("link", { name: "What is it?" });
  await page.keyboard.press("Tab");
  await expect(download).toBeFocused();
  await expect(download).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Tab");
  await expect(what).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Download v1.3" }).last()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Frontend Mentor", exact: true })).toBeFocused();

  await download.hover();
  await expect(download).toHaveCSS("background-color", "rgb(113, 192, 212)");
  await expect(download).toHaveCSS("color", "rgb(40, 40, 61)");
  await what.hover();
  await expect(what).toHaveCSS("background-color", "rgb(177, 139, 221)");
});

test("text and buttons meet WCAG AA contrast", async ({ page }) => {
  await page.goto("/");
  const pairs: [string, string][] = [];
  for (const selector of [".hero-copy > p", ".features-copy > p:last-child", ".eyebrow"]) {
    pairs.push([await page.locator(selector).evaluate(element => getComputedStyle(element).color), "rgb(250, 250, 250)"]);
  }
  for (const button of await page.locator(".button").all()) {
    const [color, background, version] = await button.evaluate(element => [getComputedStyle(element).color, getComputedStyle(element).backgroundColor, element.querySelector(".version") ? getComputedStyle(element.querySelector(".version")!).color : getComputedStyle(element).color]);
    pairs.push([color, background], [version, background]);
  }
  pairs.push(["rgb(250, 250, 250)", "rgb(64, 121, 135)"]); // band overlay over the lightest photo pixel
  for (const [foreground, background] of pairs) expect(contrast(foreground, background), `${foreground} on ${background}`).toBeGreaterThanOrEqual(4.5);
});

test("follows the Figma arrangement at mobile, tablet and desktop", async ({ page }) => {
  const box = async (selector: string) => (await page.locator(selector).first().boundingBox())!;
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCSS("font-size", "40px");
  const stripWidth = () => page.locator(".faces-left").evaluate(element => Math.round(parseFloat(getComputedStyle(element).backgroundSize)));
  expect(await stripWidth()).toBe(433);
  expect(Math.round((await box(".faces-left")).height)).toBe(160);
  const [blue, purple] = [await box(".actions .button-blue"), await box(".actions .button-purple")];
  expect(purple.y).toBeGreaterThan(blue.y + blue.height);
  let photos = await page.locator(".collage img").evaluateAll(images => images.map(image => image.getBoundingClientRect()).map(rect => ({ x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) })));
  expect(photos.map(photo => [photo.w, photo.h])).toEqual([[148, 144], [148, 144], [148, 144], [148, 144]]);
  expect(photos[2].y).toBeGreaterThan(photos[0].y);

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator("h1")).toHaveCSS("font-size", "48px");
  expect(await stripWidth()).toBe(820);
  expect(Math.round((await box(".faces-left")).height)).toBe(303);
  photos = await page.locator(".collage img").evaluateAll(images => images.map(image => image.getBoundingClientRect()).map(rect => ({ x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) })));
  expect(photos.map(photo => [photo.x, photo.w, photo.h])).toEqual([[44, 152, 160], [220, 152, 160], [396, 152, 160], [572, 152, 160]]);
  expect(Math.round((await box(".cta-band")).height)).toBe(320);

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("h1")).toHaveCSS("font-size", "64px");
  const copy = await box(".hero-copy");
  expect(Math.round(copy.x)).toBe(496);
  expect(Math.round(copy.width)).toBe(448);
  const left = await page.locator(".faces-left").evaluate(element => { const rect = element.getBoundingClientRect(); const style = getComputedStyle(element, "::before"); return { x: rect.right - parseFloat(style.right) - parseFloat(style.width), w: parseFloat(style.width) }; });
  expect(Math.round(left.x)).toBe(-26);
  expect(Math.round(left.w)).toBe(394);
  photos = await page.locator(".collage img").evaluateAll(images => images.map(image => image.getBoundingClientRect()).map(rect => ({ x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) })));
  expect(photos.map(photo => [photo.x, photo.w, photo.h])).toEqual([[160, 256, 256], [448, 256, 256], [736, 256, 256], [1024, 256, 256]]);
  const band = await box(".cta-band");
  expect(Math.round(band.height)).toBe(312);
  const ctaTitle = await box("#cta-title");
  expect(Math.round(ctaTitle.x)).toBe(160);
  const ctaButton = await box(".cta-band .button");
  expect(Math.round(ctaButton.x + ctaButton.width)).toBe(1280);
  const number = await box(".cta .section-number span");
  expect(Math.round(number.y + number.height - band.y)).toBe(28);
});

test("hero copy stays centred and unclipped while the face strip bleeds off both edges", async ({ page }) => {
  for (const width of [320, 375, 400, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const selector of [".hero-copy h1", ".hero-copy > p", ".actions"]) {
      const box = (await page.locator(selector).boundingBox())!;
      expect(Math.abs(box.x + box.width / 2 - width / 2), `${selector} centre at ${width}`).toBeLessThan(2);
      expect(box.x, `${selector} left edge at ${width}`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `${selector} right edge at ${width}`).toBeLessThanOrEqual(width);
    }
    if (width < 1200) {
      const faces = (await page.locator(".faces-left").boundingBox())!;
      expect(Math.abs(faces.x + faces.width / 2 - width / 2), `face strip centre at ${width}`).toBeLessThan(2);
    }
  }
});

test("fits 320 to 1440 and enlarged text with no overflow or text under 16px", async ({ page }) => {
  for (const width of [320, 375, 400, 640, 768, 1024, 1200, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`).toBe(true);
    const smallText = await page.locator("h1, h2, p, .button, .section-number span, footer, footer a").evaluateAll(elements =>
      elements.filter(element => element.getClientRects().length > 0 && parseFloat(getComputedStyle(element).fontSize) < 16).map(element => element.textContent));
    expect(smallText).toEqual([]);
    for (const control of await page.locator(".button, footer a").all()) expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect(await page.locator(".footer-part").evaluateAll(parts => parts.map(part => part.getClientRects().length))).toEqual([1, 1]);
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("content and the What is it? link work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4573/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Group Chat for Everyone");
  await page.getByRole("link", { name: "What is it?" }).click();
  await expect(page).toHaveURL(/#what-is-it$/);
  await context.close();
});

/* QA sweep October 8 (STS2, RS2): below 884 px the face strip was a box wider than the hero row, held in place by negative margins. */
test("every hero box stays inside the hero row while the face strip still bleeds to the viewport edges", async ({ page }) => {
  for (const width of [320, 375, 400, 480, 600, 768, 880, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const spill = await page.evaluate(() => {
      const row = document.querySelector(".hero-inner")!;
      const bounds = row.getBoundingClientRect();
      const outside = [...row.children].filter(child => {
        const box = child.getBoundingClientRect();
        return box.width > 0 && (box.left < bounds.left - 1 || box.right > bounds.right + 1);
      }).map(child => child.className);
      return { scroll: row.scrollWidth - row.clientWidth, outside };
    });
    expect(spill, `at ${width}`).toEqual({ scroll: 0, outside: [] });
    const strip = await page.locator(".faces-left").evaluate(element => parseFloat(getComputedStyle(element).backgroundSize));
    expect(strip, `the strip is wider than the viewport at ${width}`).toBeGreaterThan(width - 1);
  }
});
