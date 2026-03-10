import { test, expect } from "@playwright/test";

// Expo web + Metro can be slow on first load
test.use({ navigationTimeout: 60_000, actionTimeout: 15_000 });

test.describe("Home screen", () => {
  test("shows greeting and core UI elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Greeting text based on time of day
    await expect(
      page.getByText(/Good (morning|afternoon|evening)/)
    ).toBeVisible({ timeout: 15_000 });

    // Status text
    await expect(
      page.getByText(/(You sat today|Today is still open)/)
    ).toBeVisible();

    // Minimum sit hint
    await expect(page.getByText(/minutes counts/)).toBeVisible();

    // Stats row
    await expect(page.getByText("day streak")).toBeVisible();
    await expect(page.getByText("mins today")).toBeVisible();
    await expect(page.getByText("this week")).toBeVisible();
  });

  test("Custom button navigates to timer setup", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const customBtn = page.getByText("Custom", { exact: true });
    await expect(customBtn).toBeVisible({ timeout: 15_000 });
    await customBtn.click();

    await expect(page.getByText("Set up your sit")).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("Tab navigation", () => {
  test("can navigate between all tabs", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Wait for home to fully load
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    // Navigate to Calendar
    await page.getByText("Calendar", { exact: true }).last().click();
    await expect(page.getByText("current streak")).toBeVisible();
    await expect(page.getByText("longest streak")).toBeVisible();

    // Navigate to Stats
    await page.getByText("Stats", { exact: true }).last().click();
    await expect(page.getByText("total minutes")).toBeVisible();
    await expect(page.getByText("total sessions")).toBeVisible();

    // Navigate to Settings
    await page.getByText("Settings", { exact: true }).last().click();
    await expect(page.getByText("Presets")).toBeVisible();
    await expect(page.getByText("Goals")).toBeVisible();

    // Navigate back to Home
    await page.getByText("Home", { exact: true }).last().click();
    await expect(
      page.getByText(/(You sat today|Today is still open)/)
    ).toBeVisible();
  });
});

test.describe("Timer setup screen", () => {
  test("shows duration input and bell settings", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Custom", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByText("Custom", { exact: true }).click();

    await expect(page.getByText("Set up your sit")).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Duration (minutes)")).toBeVisible();
    await expect(page.getByText("Starting bell")).toBeVisible();
    await expect(page.getByText("Ending bell")).toBeVisible();
    await expect(page.getByText("Interval bells")).toBeVisible();
    await expect(page.getByText("Ambient sound")).toBeVisible();
  });

  test("has a Start button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Custom", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByText("Custom", { exact: true }).click();

    await expect(page.getByText("Set up your sit")).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText("Start", { exact: true })
    ).toBeVisible();
  });

  test("Back button returns to home", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Custom", { exact: true })).toBeVisible({
      timeout: 15_000,
    });
    await page.getByText("Custom", { exact: true }).click();
    await expect(page.getByText("Set up your sit")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByText("Back").click();
    await expect(
      page.getByText(/(You sat today|Today is still open)/)
    ).toBeVisible();
  });
});

test.describe("Settings screen", () => {
  test("shows all settings sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Settings", { exact: true }).last().click();

    await expect(page.getByText("Presets")).toBeVisible();
    await expect(page.getByText("Goals")).toBeVisible();
    await expect(page.getByText("Weekly goal")).toBeVisible();
    await expect(page.getByText("Warm-up countdown")).toBeVisible();
    await expect(page.getByText("Reminders")).toBeVisible();
    await expect(page.getByText("Morning commitment")).toBeVisible();
    await expect(page.getByText("Data", { exact: true })).toBeVisible();
    await expect(page.getByText("Reset all data")).toBeVisible();
  });

  test("shows Add preset button", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Settings", { exact: true }).last().click();
    await expect(page.getByText("Add preset")).toBeVisible();
  });

  test("shows weekly goal chips", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Settings", { exact: true }).last().click();
    await expect(page.getByText("3/wk")).toBeVisible();
    await expect(page.getByText("5/wk")).toBeVisible();
    await expect(page.getByText("7/wk")).toBeVisible();
  });
});

test.describe("Stats screen", () => {
  test("displays all stat categories", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Stats", { exact: true }).last().click();

    await expect(page.getByText("total minutes")).toBeVisible();
    await expect(page.getByText("total sessions")).toBeVisible();
    await expect(page.getByText("current streak")).toBeVisible();
    await expect(page.getByText("longest streak")).toBeVisible();
    await expect(page.getByText("morning sits")).toBeVisible();
    await expect(page.getByText("evening sits")).toBeVisible();
    await expect(page.getByText("days meditated")).toBeVisible();
    await expect(page.getByText("avg. minutes")).toBeVisible();
  });

  test("shows weekly chart and identity text", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Stats", { exact: true }).last().click();
    await expect(page.getByText("Last 7 days")).toBeVisible();
    await expect(
      page.getByText("You are becoming someone who sits")
    ).toBeVisible();
  });
});

test.describe("Calendar screen", () => {
  test("shows week headers and streak cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("day streak")).toBeVisible({
      timeout: 15_000,
    });

    await page.getByText("Calendar", { exact: true }).last().click();

    // Week day headers
    for (const day of ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]) {
      await expect(page.getByText(day, { exact: true })).toBeVisible();
    }

    // Streak cards
    await expect(page.getByText("current streak")).toBeVisible();
    await expect(page.getByText("longest streak")).toBeVisible();
  });
});
