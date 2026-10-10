import { expect, test } from "@playwright/test";

test("visible section markers use readable text at mobile, tablet and desktop", async ({ page }) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const markers = await page.locator(".section-number span").evaluateAll(elements => {
      const luminance = (color: string) => {
        const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
        if (!channels || channels.length !== 3) throw new Error(`Unsupported color ${color}`);
        const linear = channels.map(channel => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      return elements.map(element => {
        const style = getComputedStyle(element);
        const foreground = luminance(style.color);
        const background = luminance(style.backgroundColor);
        return { text: element.textContent, color: style.color, background: style.backgroundColor,
          ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) };
      });
    });
    expect(markers).toHaveLength(2);
    for (const marker of markers) expect.soft(marker.ratio, `${width}: ${JSON.stringify(marker)}`).toBeGreaterThanOrEqual(4.5);
  }
});

test("every button label stays readable while entering and leaving hover", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const button of await page.locator(".button").all()) {
    await button.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    for (const entering of [true, false]) {
      const sampling = button.evaluate(async element => {
        const luminance = (color: string) => {
          const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
          if (!channels || channels.length !== 3) throw new Error(`Unsupported color ${color}`);
          const linear = channels.map(channel => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
        };
        const labels = [element, ...element.querySelectorAll(".version")];
        const samples: { text: string | null; foreground: string; background: string; ratio: number }[] = [];
        const started = performance.now();
        while (performance.now() - started < 300) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const backgroundColor = getComputedStyle(element).backgroundColor;
          const background = luminance(backgroundColor);
          for (const label of labels) {
            const color = getComputedStyle(label).color;
            const foreground = luminance(color);
            samples.push({ text: label.textContent, foreground: color, background: backgroundColor,
              ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) });
          }
        }
        return samples;
      });
      if (entering) await button.hover();
      else await page.mouse.move(0, 0);
      const samples = await sampling;
      expect(samples.length).toBeGreaterThan(1);
      expect.soft(samples.filter(sample => sample.ratio < 4.5), `${entering ? "entering" : "leaving"}: ${JSON.stringify(samples)}`).toEqual([]);
    }
  }
});
