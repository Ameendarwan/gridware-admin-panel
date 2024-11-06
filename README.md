# Gridware Admin Panel

This project has been bootstrapped with:

- Typescript
- React
- Redux Toolkit
- React Router
- Tailwind
- Stylelint
- Webpack
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
├── config                      # webpack config files
├── public                      # public files
├── src                         # application code
│   ├── assets                  # static files
│   ├── components              # component files
│   └── pages                   # page files
│   └── hooks                   # general purpose hooks
│   └── mock                    # mock apis and data
│   └── store                   # application state management
│   └── utils                   # general reusabale code
│   └── index.tsx               # webpack entry point
└── tests                       # tests utility and setup
└── .babelrc                    # compiler config
└── .eslintrc.json                # code quality config
└── .prettierrc                 # logic formatting config
└── .stylelint                  # style formatting config
└── jest.config.ts              # testing config
└── tsconfig.json               # typescript config file

```

## Contributing

### Development

To start the project in `development` mode, run `npm run start`.

The project runs on port `3000` by default, but this can be changed in `./config/webpack.dev.js`.

### Environment Variables

Environment variables are set for each `script` in `package.json`. To be used in the app, they must also be declared by the `WebpackDefinePlugin` in `./.config/webpack.common.js`.

| Name     | Purpose                    |
| -------- | -------------------------- |
| APP_NAME | Used to reference app name |

### Building

To build the project in `prodction` mode `npm run build`.

The build configuration can be modified in `./config/webpack.common.js` and `./config/webpack.prod.js`.

### IDE Configuration

The suggested IDE for this project is VSCode.

Install these extension for code-completion and linting in the IDE:

- **ESLint** (by Microsoft) to enforce **Code Quality Rules**
- **Prettier** (by Prettier) to enforce **JS/TS Formatting Rules**
- **Tailwind CSS IntelliSense** (by Tailwind) for **CSS tooling**
