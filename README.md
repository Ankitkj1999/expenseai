This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



### Initial Ideas

I want to build a PWA which is AI-powered. The biggest issue in my experience with the Expense tracking app is that I am too lazy to properly format the expenses and log is the application. The idea is that people don't think in forms and schemas; they think in sentences. So I want to use AI to reduce the friction of logging expenses and just do it.  Maybe using chat or just speech. So, expenses and income tracking would be the main thing. Rest others functionalty would be around these, like analysis of both these.  Most likely, I will have to make some graphs. Accounts (Bank, Cash, else) - Source from which expense would be reduced, or income would be added. And the transfer of money from one account to another is also an important case. Other features to give more control and customisation to the user, like instead of hardcoded expense catefgories user would be able to add their own. Tags on transactions. A budget section and Import -  Export if possible. I would also think about future extensibility so that it is flexible enough to be extended further.
AI chat with the expese and income data for the Analysis and else.
Maybe image data extraction for recieepts and else.  Using a good gemini model (gemini-2.5-flash). Or something similer.
Overall, the idea is to deliver usable software, and for me, that's simplicity and elegance. 


 
I want to use Next.js since this would be a single code base, then it would be easier to iterate, and deployment on Vercel is simple. I will make use of Google Gen SDK directly and not rely on LangChain since these are straightforward use cases. I have recently tinkered with these - gemini-2.0-flash-exp (Audio interactions) and others like gemini-2.0-flash (for text interaction), so I would try to use these. 
If I have to use Node.js Express.js backend, then I would preferably deploy that on AWS EC2, preferably writing a CI/CD using GitHub Actions and Docker Hub. And then Next.js would also be deployed here on EC2.  Like what I have done for this sample project: https://github.com/Ankitkj1999/mira-ai
Since I am supposed to put more emphasis on making this interesting and incredible, I would like to go ahead with Next.js for full stack app for quicker iterations. And it has all that is required for this Expense Tracker App. 

I will look for ideas and understanding of current dominant apps, so I understand what mostly works. And some new underdogs.
So these are my thoughts. I will keep you posted on any meaningful progress, since it's good to be in a feedback loop, and whenever you think I need improvement or change, then please point it out.