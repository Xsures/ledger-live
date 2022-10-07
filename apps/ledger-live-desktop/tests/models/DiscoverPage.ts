import { Locator, Page } from "@playwright/test";

export class DiscoverPage {
  readonly page: Page;
  readonly discoverMenuButton: Locator;
  readonly testAppCatalogItem: Locator;
  readonly disclaimerText: Locator;
  readonly getAllAccountsButton: Locator;
  readonly requestAccountButton: Locator;
  readonly selectAccountTitle: Locator;
  readonly selectBtcAsset: Locator;
  readonly selectBtcAccount: Locator;
  readonly disclaimerCheckbox: Locator;
  readonly signContinueButton: Locator;
  readonly confirmText: Locator;
  readonly topBarGoBackButton: Locator;
  readonly topBarGoForwardButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.discoverMenuButton = page.locator("data-test-id=drawer-catalog-button");
    this.testAppCatalogItem = page.locator("#platform-catalog-app-dummy-live-app");
    this.disclaimerText = page.locator("text=External Application");
    this.getAllAccountsButton = page.locator("data-test-id=get-all-accounts-button"); // TODO: make this into its own model
    this.requestAccountButton = page.locator("data-test-id=request-single-account-button");
    this.selectAccountTitle = page.locator("text=Choose a crypto asset)");
    this.selectBtcAsset = page.locator("text=Bitcoin").first();
    this.selectBtcAccount = page.locator("text=Bitcoin 1 (legacy)").first();
    this.disclaimerCheckbox = page.locator("data-test-id=dismiss-disclaimer");
    this.signContinueButton = page.locator("text=Continue");
    this.confirmText = page.locator(
      "text=Please confirm the operation on your device to finalize it",
    );
    this.topBarGoBackButton = page.locator("data-test-id=liveapp-nav-back-button");
    this.topBarGoForwardButton = page.locator("data-test-id=liveapp-nav-forward-button");
  }

  async openTestApp() {
    await this.testAppCatalogItem.click();
  }

  async navigateToHomeLink() {
    await this.clickWebviewElement("[data-test-id=home-link]");
  }

  async navigateToAboutLink() {
    await this.clickWebviewElement("[data-test-id=about-link]");
  }

  async navigateToDashboardLink() {
    await this.clickWebviewElement("[data-test-id=dashboard-link]");
  }

  async navigateToNothingHereLink() {
    await this.clickWebviewElement("[data-test-id=nothing-here-link]");
  }

  async getAccountsList() {
    await this.clickWebviewElement("[data-test-id=get-all-accounts-button]");
  }

  async requestAccount() {
    await this.clickWebviewElement("[data-test-id=request-single-account-button]");
  }

  async selectAsset() {
    await this.selectBtcAsset.click();
  }

  async selectAccount() {
    // TODO: make this dynamic with passed in variable
    await this.selectBtcAccount.click();
  }

  async verifyAddress() {
    await this.clickWebviewElement("[data-test-id=verify-address-button]");
  }

  async listCurrencies() {
    await this.clickWebviewElement("[data-test-id=list-currencies-button]");
  }

  async signTransaction() {
    await this.clickWebviewElement("[data-test-id=sign-transaction-button]");
  }

  async continueToSignTransaction() {
    await this.signContinueButton.click({ force: true });
  }

  async waitForConfirmationScreenToBeDisplayed() {
    await this.confirmText.waitFor({ state: "visible" });
  }

  async clickWebviewElement(elementName: string) {
    await this.page.evaluate(elementName => {
      const webview = document.querySelector("webview");
      (webview as any).executeJavaScript(
        `(function() {
        const element = document.querySelector('${elementName}');
        element.click();
      })();
    `,
      );
    }, elementName);
  }

  async getWebviewHeadingElementByText() {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const text = await this.page.evaluate(() => {
      const webview = document.querySelector("webview");
      const textToReturn = (webview as any)
        .executeJavaScript(
          `(function() {
        return document.querySelector('h2').innerHTML;
      })();
    `,
        )
        .then((text: string) => {
          return text;
        });
      return textToReturn;
    });

    return text;
  }

  async goBack() {
    await this.topBarGoBackButton.click({ force: true });
  }

  async getBackButtonStatus() {
    console.log("getting back attribute");
    return await this.topBarGoBackButton.getAttribute("cursor");
  }

  async goForward() {
    console.log("going forward");
    return await this.topBarGoForwardButton.click({ force: true });
  }

  async getForwardButtonStatus() {
    console.log("getting forward attribute");
    return await this.topBarGoForwardButton.getAttribute("cursor");
  }
}
