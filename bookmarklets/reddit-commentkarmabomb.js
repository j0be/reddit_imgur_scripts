javascript: (function () {
  window.checkNextThing = function () {
    $('#siteTable>.thing.link:visible:not(.checkedComments):visible').first().each(function () {
      $.ajax({
        url: $(this).find('a[data-event-action="comments"]').first().attr('href') + '.json',
        context: $(this)
      }).then(function (data) {
        var baseLevels = 1,
          /* customize this (recommend 1, but I wouldn't exceed 3) */ replyLevels = 9; /* customize this (max recommended 9) */
        var foundBase = 0,
          foundReply = 0,
          codeLevel = 0,
          divisions = 0,
          startHue = 100,
          endHue = 0,
          hue = 0,
          childData = true;
        if (data[1].data.children.length > 0) {
          var hasSticky = data[1].data.children[0].data.stickied;
          for (i = 0; i < baseLevels; i++) {
            try {
              childData = data[1].data.children[hasSticky ? i + 1 : i];
            } catch (err) {
              break;
            }
            for (ii = 0; ii < replyLevels; ii++) {
              try {
                if (childData.kind === 'more' || childData.collapsed === true) {
                  break;
                } else {
                  childData = childData.data.replies.data.children[0];
                }
              } catch (err) {
                childData = true;
              }
              if (childData === true) {
                foundBase = i;
                foundReply = ii;
                break;
              }
            }
          }
        }
        $(this).addClass('checkedComments').attr('style', 'border-left: 3px solid #000');
        if (childData === true) {
          codeLevel = (foundBase + 1) * (foundReply + 1) - 1;
          divisions = (baseLevels) * (replyLevels) - 1;
          hue = (Math.floor(Math.abs(startHue - endHue) / divisions) * codeLevel);
          hue = startHue > endHue ? startHue - hue : startHue + hue;
          $(this).attr('data-level', codeLevel).addClass('level level_' + codeLevel).attr('style', 'border-left: 3px solid hsl(' + hue + ',100%,50%)');
          $(this).find('.rank').append('<div style="font-size:.6em;">(' + codeLevel + ')</div>');
        } else {
          $(this).attr('data-level', replyLevels + 10);
        }

        $(this).attr('data-score', data[0].data.children[0].data.score);
        $(this).find('.midcol .score').text(prettyScore(data[0].data.children[0].data.score));
        
        if (window.settingHeat) {
          window.setHeat();
          window.sortByHeat();
        } else {
          window.sortByLevels();
        }
        window.checkNextThing();
      }, function () {
        console.error('Error retreiving comments');
        window.checkNextThing();
      });
    });
  };
  window.prettyScore = function (score) {
    return score > 10000 ? ((Math.round(score / 100) / 10) + 'k') : score;
  };
  window.setHeat = function () {
    var oldest = Number.MAX_SAFE_INTEGER,
      newest = 0,
      epoch, diff, weight, score;
    $('#siteTable>.thing.link:visible').each(function () {
      epoch = new Date($(this).find('time').first().attr('datetime')).getTime() / 1000;
      $(this).attr('data-epoch', epoch);
      oldest = Math.min(epoch, oldest);
      newest = Math.max(epoch, newest);
      if (!$(this).find('.score.unvoted').text().match(/\d/)) {
        $(this).find('.midcol .score').text(prettyScore(parseFloat($(this).attr('data-score'))));
      }
    });
    diff = (Math.log(newest - oldest)) - 10;
    $('#siteTable>.thing.link:visible').each(function () {
      epoch = parseFloat($(this).attr('data-epoch'));
      weight = Math.floor((epoch - oldest) / diff);
      score = parseFloat($(this).attr('data-score'));
      score = Math.log(score);
      $(this).attr('data-heat', window.getHeat(score, epoch + weight));
    });
  };
  window.getHeat = function (score, epoch) {
    var order = Math.log(Math.max(Math.abs(score), 1), 10),
      sign = score > 0 ? 1 : (score < 0 ? -1 : 0);
    seconds = epoch - 1134028003;
    return Math.round((sign * order + seconds / 45000) * Math.pow(10, 7)) / Math.pow(10, 7);
  };
  window.sortByHeat = function () {
    $('#siteTable>.thing.link:visible').detach().sort(function (a, b) {
      var an, bn;
      an = parseFloat($(a).attr('data-heat'));
      bn = parseFloat($(b).attr('data-heat'));
      if (an < bn) {
        return 1;
      }
      if (an > bn) {
        return -1;
      }
      return 0;
    }).appendTo('#siteTable').first();
    $('#siteTable>.thing.link:visible').each(function (i) {
      var text = '<div>' + (i + 1) + '</div>',
        orank = parseFloat($(this).attr('data-rank'));
      if (i + 1 != orank) {
        text += '<div style="font-size:10px;padding-top:5px;' + (i + 1 < orank ? 'color:#080">&#9650;' : 'color:#800">&#9660;') + Math.abs(i + 1 - orank) + '</div>';
      } else {
        text += '<div style="font-size:10px;padding-top:5px;"">-</div>';
      }
      $(this).find('.rank').html(text);
    });
    $('.NERPageMarker').remove();
  };
  window.sortByLevels = function () {
    $('#siteTable>.thing.link:visible').detach().sort(function (a, b) {
      var an, bn;
      al = parseFloat($(a).attr('data-level'));
      bl = parseFloat($(b).attr('data-level'));
      ar = parseFloat($(a).attr('data-rank'));
      br = parseFloat($(b).attr('data-rank'));

      return (al > bl ? 1 : (
        al < bl ? -1 :
        (ar > br ? 1 :
          (ar < br ? -1 : 0)
        )));
    }).appendTo('#siteTable').first();
  };
  if (typeof window.settingHeat === 'undefined') {
    window.settingHeat = window.confirm('Would you like to sort the results by my best guess at heat?');
  }
  if (window.settingHeat) {
    window.setHeat();
    window.sortByHeat();
  }
  if (window.confirm('Would you like to color code possible comment bombs?')) {
    $('#siteTable>.thing.link:visible:not([data-level])').attr('data-level', 50);
    window.checkNextThing();
  }
})();