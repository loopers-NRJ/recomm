import { launch } from "puppeteer";

const brands = [
  //   "Apple",
  //   "Google",
  //   "Infinix",
  // "iQOO",
  // "Motorola",
  // "Nokia",
  // "Nothing",
  //   "OnePlus",
  "Oppo",
  // "Poco",
  // "Realme",
  // "Samsung",
  // "Tecno",
  // "Vivo",
  // "Xiaomi",
];
const base = "https://www.cashify.in/buy-refurbished-mobile-phones";

export async function GET() {
  const browser = await launch({ headless: true });
  try {
    const page = await browser.newPage();
    //   for (const brand of brands) {
    await page.goto(`${base}/${brands[0]}`, { waitUntil: "networkidle2" });
    const productLinks = await page.evaluate(async () => {
      /**
       * A small piece of code that will scroll to the bottom of the page until there are no more products to load.
       */
      let productAnchors = document.querySelectorAll('a[href$="sale"]');
      let previousAvailableProducts = productAnchors.length;
      let currentAvailableProducts = productAnchors.length;

      do {
        previousAvailableProducts = currentAvailableProducts;
        // go to the last load more button. it will trigger the loading of more products
        const loadMoreButtons = document.querySelectorAll("#product_load_more");
        loadMoreButtons[loadMoreButtons.length - 1]?.scrollIntoView();
        // wait for the products to load
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // get the new products
        productAnchors = document.querySelectorAll('a[href$="sale"]');
        currentAvailableProducts = productAnchors.length;
      } while (previousAvailableProducts !== currentAvailableProducts);

      const productsLinks = [...productAnchors]
        .map((anchor) => anchor.getAttribute("href")!)
        .filter(Boolean);
      return productsLinks;
    });
    //   }
    return new Response(JSON.stringify(productLinks), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  } finally {
    await browser.close();
  }
}
