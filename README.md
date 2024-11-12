# Gridware Admin Panel

This project has been bootstrapped with:

- Typescript
- React
- Vite
- Redux Toolkit
- React Router
- Tailwind
- Husky
- Stylelint
- Babel
- ESLint
- Prettier
- assuming `uat` branch represents staging environment, should be set as default branch
- assuming `main` branch represents production environment
- assuming app is built into `build` folder

## Getting Started

Fork the project and run `npm run install`.

### Project Layout

```
├── build                       # output from compilation
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
│   └── store                   # application state management
│   └── utils                   # general reusabale code
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

### Development

To start the project in `development` mode, run `npm run dev`.

The project runs on port `5173` by default, but this can be changed in `./vite.config.ts`.

### Building

To build the project in `prodction` mode `npm run build`.

### IDE Configuration

The suggested IDE for this project is VSCode.

Install these extension for code-completion and linting in the IDE:

- **ESLint** (by Microsoft) to enforce **Code Quality Rules**
- **Prettier** (by Prettier) to enforce **JS/TS Formatting Rules**
- **Tailwind CSS IntelliSense** (by Tailwind) for **CSS tooling**
