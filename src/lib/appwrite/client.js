import { Client, Account } from 'appwrite';

export const APPWRITE_ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT = '6a968a44000fab10a6df';

export const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT);

export const account = new Account(client);
