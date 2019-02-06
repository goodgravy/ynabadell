# ynabadell

[YNAB](https://youneedabudget.com) don't support European banks. [Banc Sabadell](https://www.bancsabadell.com) doesn't support standard format transaction downloads.

**ynabadell** downloads a list of your Sabadell transactions, reformats the data to match YNAB's requirements, and uploads them to your YNAB account.

## Installation
```bash
npm install
```

## Running
These environment variables are required:

* `SABADELL_USER_ID` – the user ID you use to sign into Sabadell's online banking
* `SABADELL_PIN` – the secret you sign in to Sabadell online banking with
* `YNAB_ACCESS_TOKEN` – a Personal Access Token which you can get following [these instructions](https://api.youneedabudget.com/#personal-access-tokens)
* `YNAB_BUDGET_ID` –  a UUID which identifies the YNAB budget you want to import transactions into
* `YNAB_ACCOUNT_ID` – a UUID which identifies the bank account your transactions should be imported into

You can find the `YNAB_BUDGET_ID` and `YNAB_ACCOUNT_ID` values by inspecting the URL when you viewing a particular account on your YNAB dashboard. The URL is formatted as:

```
https://app.youneedabudget.com/<YNAB_BUDGET_ID>/accounts/<YNAB_ACCOUNT_ID>
```

It's recommended you put these variables in a [`.env` file](https://www.npmjs.com/package/dotenv) which will be loaded in automatically.

After you have set up the environment variables:

```bash
node index.js
```

## Running via `launchd`
A `launchd` plist is included, which you will need to customise to fit your particular environment before using.

For example, the directories won't be the same on your system. You may also want to change the schedule.
