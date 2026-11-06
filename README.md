# Seller Race Dashboard

I want to create a dashboard to display results of a live competition.

The competition will be for sellers : sellers confirm order by phone, and when it's confirm, they will write the name of the customer and the amount of the order.

to avoid data issues (GDPR), the database will not contain confidential information, just the name of the seller, the client name and the amount, nothing else. Don't build database for now.

so the dashboard will display results in the form of a race, and the highest the total amount of the seller, the higher or farther it will be displayed.

sellers will log in (without verification, like Kahoot), so application should be compatible on mobile. If the user is disconnected but reconnect with the same name, it will work and keep history (for exemple if the users logs out during a lunch break)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://televente-wolf.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/923ab4ac-b093-46ee-8d93-6f646b663000).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
