# chatbot-backend

### How to install and manage Node.js and npm versioning?

Example - for MacOS, you can use `brew`.

```bash
brew install nvm
```

Once installed, add the following to your zsh/bash profiles file

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"  # This loads nvm
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion
```

### How to set up the service account and environment for local development?


Get `firebase_service_account` and API_SECRET_KEY from the admin and follow the below steps:-

1. Create a folder `.firebase` in the project root directory.
2. Add the `firebase_service_account.json` file to `.firebase` directory.
3. Create a `.env.dev` file in the project root directory.
4. Add PORT=5001 to `.env.dev`.
5. Add GOOGLE_APPLICATION_CREDENTIALS=.firebase/backend_service_account.json to `.env.dev`.
6. Add API_SECRET_KEY=SECRET_KEY to  `.env.dev`.


### How to build and run locally?

```bash
nvm use;
npm install;
npm run local;
```

### How to run test cases?

```base
npm run test
```
In case the above command doesn't work, please run the below command to run the test cases.
```base
npx jest tests/chatbot.test.ts
```


We can make it a team practice avoid using === and only use == for null and undefined treating them as the same thing.
Ref:- [StackOverflow](https://stackoverflow.com/questions/67472808/can-someone-explain-this-simple-concept-of-null-and-undefined-more-specifically)