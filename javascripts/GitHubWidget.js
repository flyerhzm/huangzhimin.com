/*
    GitHubWidget v1.0

    Kelp http://kelp.phate.org/
    MIT License

*/

var GitHubWidget = GitHubWidget || {
    init: function () {
        $('.githubwidget').each(function () {
            // github account
            var username = $(this).attr('user');
            var $panel = $(this);
            $.ajax({ url: 'https://api.github.com/users/' + username + '/repos?sort=pushed',
                type: 'get',
                dataType: 'jsonp',
                cache: false,
                async: false,
                beforeSend: function () { },
                error: function (xhr) { },
                success: function (result) {
                    if (result.meta.status == 200) {
                        // jsonp OK
                        result.data = GitHubWidget.Sort(result.data, 'pushed_at');
                        $(result.data).sort(function(a, b) {
                            return a.watchers < b.watchers ? 1 : -1;
                        }).each(function (index) {
                            var date = new Date(this.pushed_at);
                            var dateForm = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                            this.language = this.language || '';
                            this.homepage = this.homepage || '';
                            var division = $('<div class="repos"></div>');
                            division.append($('<div class="reposname">' +
                                    '<span class="mini-icon public-repo"></span> <a href="' + this.html_url + '" target="_blank">' +
                                    this.name + '</a>' +
                                    '<div class="reposstate">' +
                                        this.language +
                                        ' &nbsp;<a href="' + this.html_url + '/watchers" target="_blank" title="Watchers"><span class="mini-icon watchers"></span> ' +
                                        this.watchers +
                                        ' <a href="' + this.html_url + '/network" target="_blank" title="Forks"><span class="mini-icon fork"></span>' +
                                        this.forks +
                                        '</a>' +
                                    '</div>' +
                                '</div>'));
                            division.append($('<div class="reposbody">' +
                                                        '<a href="' + this.html_url + '/zipball/master" class="minibutton btn-download" title="Download this repository as a zip file" target="_blank">' +
                                                        '<span class="icon"></span>ZIP' +
                                                        '</a>' +

                                                        this.description +
                                                        '<div class="lastupdated">Last updated on ' + dateForm + '</div>' +
                                                        '<a href="' + this.homepage + '" target="_blank">' + this.homepage + '</a>' +
                                                    '</div>'));
                            $panel.append(division);
                        });
                    }
                }
            });
        });
    },
    Sort: function (array, target) {
        var result = [];

        while (result.length < array.length) {
            var pushitem = null;
            for (var index in array) {
                if (array[index].__sorted != true && (pushitem == null || pushitem[target] < array[index][target])) {
                    pushitem = array[index];
                }
            }
            pushitem.__sorted = true;
            result.push(pushitem);
        }
        return result;
    }
};

$(document).ready(function(){
    GitHubWidget.init();
});
