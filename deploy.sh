#!/usr/bin/env sh

## abort on errors
set -e

## removing dist folder
rm -rf dist

## build
npm run build

## navigate into the build output directory
cd dist

## if you are deploying to a custom domain
# echo 'simple.com' > CNAME

git init
git add -A
git commit -m 'deploy'

## if you are deploying to https://<USERNAME>.github.io
#git push -f https://github.com/<USERNAME>/<REPO> master:gh-pages

## if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f https://github.com/bagstel/lion-bank.git master:gh-pages

cd -

## removing dist folder
rm -rf dist

## https://cli.vuejs.org/guide/deployment.html#github-pages