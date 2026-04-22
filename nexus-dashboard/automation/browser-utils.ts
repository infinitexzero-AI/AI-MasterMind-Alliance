import { Page } from 'playwright';

/**
 * Utility functions for robust browser automation.
 */

/**
 * Robust wait for a selector with auto-retry.
 */
export async function smartWait(page: Page, selector: string, timeout = 5000) {
    try {
        await page.waitForSelector(selector, { state: 'attached', timeout });
        await page.waitForSelector(selector, { state: 'visible', timeout });
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Validates if a selector exists without throwing.
 */
export async function exists(page: Page, selector: string) {
    return await page.$(selector).then(el => !!el);
}

/**
 * Smoothly scrolls an element into view.
 */
export async function scrollIntoView(page: Page, selector: string) {
    const el = await page.$(selector);
    if (el) {
        await el.scrollIntoViewIfNeeded();
        return true;
    }
    return false;
}
