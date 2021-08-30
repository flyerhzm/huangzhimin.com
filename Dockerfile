FROM jekyll/builder

WORKDIR /tmp
ADD Gemfile /tmp/
ADD Gemfile.lock /tmp/
RUN bundle install

FROM jekyll/jekyll

VOLUME /src
EXPOSE 4000

WORKDIR /src
RUN mkdir .jekyll-cache
RUN mkdir _site
ENTRYPOINT ["jekyll", "serve", "-H", "0.0.0.0"]
