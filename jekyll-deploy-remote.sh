eval `ssh-agent`
ssh-add ~/.ssh/*rsa
cd /www/wwwroot/sites/jekyll-blog
git pull
bundler install
jekyll build --destination ../blog

sleep 2
