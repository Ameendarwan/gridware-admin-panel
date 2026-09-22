# DST Webmanager
Gridware builds technology that efficiently addresses these challenges with products that enable utilities to monitor assets, detect and prevent hazards—like vegetation contact, downed lines, transformer overloads and pole rot. Armed with accurate knowledge, lineworkers’ valuable time is spent fixing the grid instead of searching for problems, allowing utilities to operate a grid that is more reliable, more resilient and wildfire resistant.

### Development Environment Setup
1. Clone the project and run `npm install` to install all dependencies.
2. Create a directory named `env` in the root of this project.
3. Create a file named `.env` inside `env/` and add the required secrets. Request the missing values from a coworker or manager.
```
APP_NAME='React Template (Dev)'
RELEASE_STAGE='dev'
NODE_ENV=development
VITE_REACT_APP_MAPBOX_KEY=
VITE_REACT_APP_API_URL=
VITE_REACT_APP_AUTH0_DOMAIN=
VITE_REACT_APP_AUTH0_CLIENT_ID=
E2E_BASE_URL=http://localhost:3000
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
```

4. Run `npm run dev` to start the development server.
5. Access the app at http://localhost:3000

- The project runs on port `3000` by default, but this can be changed in `./vite.config.ts`.
- All communication with backend is done through API endpoints.
- Swagger UI can be found at https://dst-v2.gridware-dev.io/admin/dashboard/docs.
- For hitting authenticated endpoints, use the Bearer token in the Authorization of Swagger UI.
- To get Bearer token, go to the login page, login with valid credentials and copy the token from network requests.

### Commit with Husky
Husky is used to enforce pre-commit hooks to ensure code quality before commits. Follow these steps to commit:

- Make your changes to the codebase.
- Stage the changes with git add ..
- Run git commit -m "Your commit message".
- Husky will trigger and run lint-staged to check for formatting issues and linting errors.
- If all checks pass, the commit will be completed.
- If any checks fail, Husky will prevent the commit and show you the issues to fix.

### Post Commit
- Create a PR from custom branch to main.
- Once approved, merge the PR.
- Pipeline will build and deploy to Dev environment.
- In order to deploy to staging, go to github actions and trigger the staging pipeline with commit hash, it'll generate a rc tag.
- In order to deploy to prod, go to github actions and trigger the prod pipeline with specific staging rc tag.

### IDE Configuration
The suggested IDE for this project is VSCode.

Install these extension for code-completion and linting in the IDE:
- **ESLint** (by Microsoft) to enforce **Code Quality Rules**
- **Prettier** (by Prettier) to enforce **JS/TS Formatting Rules**
- **Tailwind CSS IntelliSense** (by Tailwind) for **CSS tooling**

### Project Layout
```
├── dist                        # output from compilation
├── husky                       # pre-commit checks
├── config                      # public files
├── public                      # public files
├── src                         # application code
│   ├── index.html              # html file
│   ├── assets                  # static files
│   ├── components              # component files
│   └── pages                   # page files
│   └── hooks                   # general purpose hooks
│   └── mock                    # mock apis and data
│   └── providers               # manage global state
│   └── store                   # application state management
│   └── routes                  # routes and urls
│   └── lib                     # utility functions and reusable modules
│   └── utils                   # general reusabale code
│   └── App.tsx                 # includes routes, providers, etc.
│   └── main.tsx                # vite entry point
└── tests                       # tests utility and setup
└── .babelrc                    # compiler config
└── .eslintrc.json              # code quality config
└── .prettierrc                 # logic formatting config
└── .stylelint                  # style formatting config
└── jest.config.ts              # testing config
└── tsconfig.json               # typescript config file
└── vite.config.ts              # vite configuration
└── vitest.config.ts            # vitest configuration

```
