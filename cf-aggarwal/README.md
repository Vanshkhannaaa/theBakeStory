# cf-aggarwal — Firebase Cloud Functions & Config

Firebase project: **aggarwal-sweets-d2a16**

This folder contains cloud functions, Firestore/Storage rules, and utility scripts.

## Commands

```bash
npm install
npm run dev          # functions emulator
npm run deploy       # deploy functions
npm run deploy:rules # deploy firestore + storage rules
npm run deploy:admin # deploy admin Hosting (admin-aggarwalsweets)
npm run deploy:website # static-export website-aggarwal and deploy Hosting (aggarwalsweets)
npm run seed         # seed menu data (needs ADC / service account)
npm run create-admin # bootstrap admin Firestore doc
```

## Functions

- `optimizeVideo` — transcodes uploaded gallery videos
