$(function() {
  return $.getJSON("http://referral.herokuapp.com/websites/9/refs?name=web&jsoncallback=?", function(refs) {
    var $referrals;
    $referrals = $(".referrals");
    return $.each(refs, function(i, ref) {
      var $img, $link, $referral, $text;
      $img = $("<img/>").attr("src", ref.image_url);
      $link = $("<a/>").attr("href", "http://referral.herokuapp.com/websites/9/refs/" + ref.id + "?name=web").text(ref.title);
      $text = $("<p/>").text(ref.description);
      $referral = $("<div/>").addClass("referral");
      return $referral.append($img).append($link).append($text).appendTo($referrals);
    });
  });
});
