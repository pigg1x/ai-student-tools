// StudyAI Hub - client-side search, drag-scroll rail, arrows, and scrollspy
(function () {
  var search = document.getElementById("search");
  var cards = document.querySelectorAll("[data-search]");
  var sections = document.querySelectorAll(".section[data-section]");
  var noResults = document.getElementById("no-results");

  function norm(s) {
    return (s || "").toLowerCase().trim();
  }

  function applySearch() {
    var q = norm(search ? search.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var text = norm(card.getAttribute("data-search"));
      var show = !q || text.indexOf(q) !== -1;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    // Hide whole sections whose every card is hidden (home page only)
    sections.forEach(function (sec) {
      var any = sec.querySelectorAll("[data-search]:not(.hidden)").length > 0;
      sec.classList.toggle("hidden", !any);
    });

    if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
  }

  if (search) {
    search.addEventListener("input", applySearch);
  }
})();

// --- Horizontal drag/swipe scroll + arrow buttons for category rail ---
(function () {
  var rail = document.querySelector(".cat-rail-track");
  if (!rail) return;

  var leftBtn = document.querySelector(".rail-arrow-left");
  var rightBtn = document.querySelector(".rail-arrow-right");
  var step = 280;

  function updateArrows() {
    var maxScroll = rail.scrollWidth - rail.clientWidth;
    if (leftBtn) leftBtn.classList.toggle("hidden", rail.scrollLeft <= 5);
    if (rightBtn) rightBtn.classList.toggle("hidden", rail.scrollLeft >= maxScroll - 5);
  }

  if (leftBtn) {
    leftBtn.addEventListener("click", function () {
      rail.scrollBy({ left: -step, behavior: "smooth" });
    });
  }
  if (rightBtn) {
    rightBtn.addEventListener("click", function () {
      rail.scrollBy({ left: step, behavior: "smooth" });
    });
  }

  rail.addEventListener("scroll", updateArrows);
  window.addEventListener("resize", updateArrows);
  updateArrows();

  var isDown = false;
  var startX, scrollLeft, moved = false;

  rail.addEventListener("mousedown", function (e) {
    isDown = true;
    moved = false;
    rail.classList.add("dragging");
    startX = e.pageX - rail.offsetLeft;
    scrollLeft = rail.scrollLeft;
  });

  rail.addEventListener("mouseleave", function () {
    isDown = false;
    rail.classList.remove("dragging");
  });

  rail.addEventListener("mouseup", function () {
    isDown = false;
    rail.classList.remove("dragging");
  });

  rail.addEventListener("mousemove", function (e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - rail.offsetLeft;
    var walk = (x - startX) * 1.2;
    if (Math.abs(walk) > 3) moved = true;
    rail.scrollLeft = scrollLeft - walk;
  });

  // Distinguish drag from click so a swipe does not trigger the link
  var startY = 0;
  rail.addEventListener("touchstart", function (e) {
    moved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    scrollLeft = rail.scrollLeft;
  }, { passive: true });

  rail.addEventListener("touchmove", function (e) {
    var dx = Math.abs(e.touches[0].clientX - startX);
    var dy = Math.abs(e.touches[0].clientY - startY);
    if (dx > 4 || dy > 4) moved = true;
    if (dx > dy) {
      rail.classList.add("dragging");
    }
  }, { passive: true });

  rail.addEventListener("touchend", function () {
    rail.classList.remove("dragging");
  });

  rail.addEventListener("click", function (e) {
    if (moved) {
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  });
})();

// --- Sticky category rail scrollspy + back-to-top ---
(function () {
  var railLinks = document.querySelectorAll(".cat-rail-track a[data-toc]");
  var rail = document.querySelector(".cat-rail-track");
  var toTop = document.getElementById("to-top");
  if (!railLinks.length && !toTop) return;

  var sectionMap = [];
  railLinks.forEach(function (a) {
    var sec = document.getElementById(a.getAttribute("data-toc"));
    if (sec) sectionMap.push({ link: a, sec: sec });
  });

  function keepActiveVisible(activeLink) {
    if (!rail || !activeLink) return;
    var railRect = rail.getBoundingClientRect();
    var linkRect = activeLink.getBoundingClientRect();
    var offset = linkRect.left - railRect.left;
    var endOffset = linkRect.right - railRect.right;
    var padding = 40;
    if (offset < padding) {
      rail.scrollBy({ left: offset - padding, behavior: "smooth" });
    } else if (endOffset > -padding) {
      rail.scrollBy({ left: endOffset + padding, behavior: "smooth" });
    }
  }

  function onScroll() {
    if (toTop) toTop.classList.toggle("show", window.scrollY > 600);

    if (railLinks.length) {
      var pos = window.scrollY + 160;
      var current = null;
      sectionMap.forEach(function (m) {
        if (m.sec.offsetTop <= pos) current = m;
      });
      railLinks.forEach(function (a) { a.classList.remove("active"); });
      if (current) {
        current.link.classList.add("active");
        keepActiveVisible(current.link);
      }
    }
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { onScroll(); ticking = false; });
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
