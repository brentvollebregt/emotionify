import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import fs from "fs";
import config from "../src/config";

const rootDestinations = ["sort", "compare", "tools", "about"];

const links = rootDestinations.map((dest) => ({ url: `${dest}`, priority: 0.8 }));

const stream = new SitemapStream({ hostname: config.siteUrl });
streamToPromise(Readable.from(links).pipe(stream)).then((data) => {
  fs.writeFileSync("./public/sitemap.xml", data);
  console.log("Sitemap created.");
});
