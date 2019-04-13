import Crawler from "../crawler"
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/links', function(req, res, next) {
  const site = req.query.site;
  res.render("index", { title: "Express", site });
});
router.get('/structure', function(req, res, next) {
  const site = req.query.site;
  res.render("structure", { title: "Express", site });
});

router.get("/api/links", async (req, res) => {
  const site = req.query.site || "http://www.elpi.com.pl";
  console.log(site);
  const crawler = new Crawler(site);
  let promises = [];
  while(crawler.hasNextSite()){
    while (crawler.hasNextSite()) {
      promises.push(crawler.crawl());
    }
    await Promise.all(promises);
  }
  res.send(crawler.exportLinkGraph());
});

router.get("/api/structure", async (req, res) => {
  const site = req.query.site || "http://www.elpi.com.pl";
  console.log(site);
  const crawler = new Crawler(site);
  let promises = [];
  while (crawler.hasNextSite()) {
    while (crawler.hasNextSite()) {
      promises.push(crawler.crawl());
    }
    await Promise.all(promises);
  }
  res.send(crawler.exportStructureGraph());
});

module.exports = router;
