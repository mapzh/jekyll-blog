#!/usr/bin/env bash
SSH_ACCOUNT="root@139.162.115.209"
BLOG_WORKSPACE_1="/Users/natural/Documents/Code/jekyll-blog"
BLOG_WORKSPACE_2="/Users/mapengzhen/Documents/main-site/jekyll-blog/"

ssh-add ~/.ssh/*rsa

if [[ -d ${BLOG_WORKSPACE_1} ]]; then
  cd ${BLOG_WORKSPACE_1}
elif [[ -d ${BLOG_WORKSPACE_2} ]]; then
  cd ${BLOG_WORKSPACE_2}
else
  exit
fi

git add -A
git add *
git commit -am 'blogs auto commit'
git push origin master
ssh -t $SSH_ACCOUNT "sh /www/wwwroot/sites/jekyll-deploy-remote.sh"
