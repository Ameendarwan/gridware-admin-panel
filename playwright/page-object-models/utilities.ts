import { Assertion } from './assertion';
import { BasePage } from './basePage';
import { Page } from '@playwright/test';
import * as crypto from 'crypto';
import { faker } from '@faker-js/faker';

/**
 * Library of functions for the E-Commerece Applicaiton.
 *
 */

export class Utilities extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  assert = new Assertion(this._page);

  async generateRandomEmail(): Promise<string> {
    const username = crypto.randomBytes(4).toString('hex'); // You can adjust the length as needed
    const domain = crypto.randomBytes(3).toString('hex') + '.com'; // You can change the domain as needed

    return username + '@' + domain;
  }

  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  generateRandomCustomerData() {
    const name = faker.person.firstName();
    const description = faker.lorem.sentence();
    const uuid = faker.string.uuid();
    return { name, description, uuid };
  }
}
