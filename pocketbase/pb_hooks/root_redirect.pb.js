routerAdd("GET", "/", (e) => {
  return e.redirect(302, "/_/");
});
