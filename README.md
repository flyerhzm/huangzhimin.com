huangzhimin.com
===================

Usage
-----

    docker run --rm --label=jekyll --volume=$(pwd):/srv/jekyll -it -p $(docker-machine ip `docker-machine active`):4000:4000 jekyll/jekyll jekyll serve
