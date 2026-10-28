/* Ładowany w <head> przed treścią: włącza animacje i decyduje o efekcie otwarcia (raz na sesję). */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  try {
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var seen = sessionStorage.getItem("hp-intro");
    var off = d.getAttribute("data-intro") === "off" || /[?&]intro=0/.test(location.search);
    if (!reduce && !off && (!seen || /[?&]intro=1/.test(location.search))) {
      d.classList.add("hp-intro");
      sessionStorage.setItem("hp-intro", "1");
    }
  } catch (e) {}
})();
