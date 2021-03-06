javascript: (function() {
    if (confirm('Would you like to tag everyone or just the users without tags? OK will tag everyone, cancel will tag only people without tags.')) {
        elstring = 'a.userTagLink';
    } else {
        elstring = 'a.userTagLink:not(.hasTag)';
    }
    numChanges = $(elstring).length;
    if (numChanges > 0) {
        window.taglabel = prompt('Please enter the tag you\'d like to tag for the ' + numChanges + ' users on the page', 'CC');
        window.tagcolor = prompt('Please enter the color of the tag you\'d like', 'green');
        window.voteBool = confirm('Would you like to set the vote weights to 9001?');
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
        $(elstring).each(function() {
            $(this)[0].dispatchEvent(evt);
            $('#userTaggerTag').val(window.taglabel);
            $('#userTaggerColor').val(window.tagcolor);
            if (window.voteBool) {
                $('#userTaggerVoteWeight').val(9001);
            }
            $('#userTaggerSave')[0].dispatchEvent(evt);
        });
    } else {
        alert('Either I couldn\'t find any users on the page, or you\'ve tagged everyone on the page');
    }
})();
