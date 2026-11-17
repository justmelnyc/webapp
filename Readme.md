<img src="http://d324imu86q1bqn.cloudfront.net/uploads/user/avatar/641/large_Ello.1000x1000.png" width="200px" height="200px" />

# Ello Web Application

[![Build Status](https://travis-ci.org/ello/webapp.svg?branch=master)](https://travis-ci.org/ello/webapp)

The web app for [ello.co](http://ello.co).

## Running locally

The Ello API is not public, so the repo ships a mock for local development.

```bash
nvm use                 # Node 20 (see .nvmrc)
yarn install
cp .env.example .env    # set AUTH_DOMAIN=http://localhost:7770 and USE_LOCAL_EMOJI=false
yarn mock               # mock API on :7770
yarn dev                # app on http://localhost:6660
```

`yarn test` runs lint and the unit tests; `yarn build` creates a production bundle in `public/static`.

## Code of Conduct
Ello was created by idealists who believe that the essential nature of all human beings is to be kind, considerate, helpful, intelligent, responsible, and respectful of others. To that end, we will be enforcing [the Ello rules](https://ello.co/wtf/policies/rules/) within all of our open source projects. If you don’t follow the rules, you risk being ignored, banned, or reported for abuse.

## Contributing
Bug reports and pull requests are welcome on GitHub at https://github.com/ello/webapp.

## License
Ello Web Application is released under the [MIT License](/LICENSE.txt)

:metal::skull::metal:
:peace:
