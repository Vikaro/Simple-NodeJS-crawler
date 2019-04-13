import fetch from "node-fetch";
import * as cheerio from "cheerio";

interface IGraphNode {
  id: string;
  leaf?: any | undefined;
  module?: any | undefined;
  size?: any | undefined;
  level?: any | undefined;
}

interface ILinkNode {
  source: string;
  target: string;
  targetNode?: any | undefined;
}

interface IGraph {
  nodes: IGraphNode[];
  links: ILinkNode[];
}

interface ICrawlerNode {
  id: string;
  url: string;
  nodesOut: string[];
  nodesIn: string[];
}

export default class Crawler {
  private map: Map<string, ICrawlerNode> = new Map<string, ICrawlerNode>();
  private stack: any[] = [];
  private url: string;
  private counter: number = 0;
  private limit: number = 20;
  constructor(url: string) {
    this.url = url;
    this.stack.push(url);
  }

  async getSite(url: any): Promise<string> {
    try {
      const res: any = await fetch(url, {});
      return await res.text();
    } catch (rej) {
      console.log(rej);
      return "";
    }
  }

  hasNextSite() {
    return this.stack.length > 0 && this.counter < this.limit;
  }

  crawl() {
    const site = this.stack.pop();
    this.counter++;
    console.log(`${this.counter} / ${this.limit} [${this.stack.length}]`);
    return this.parseSite(site);
  }

  async parseSite(url: string): Promise<void> {
    if (!url.startsWith(this.url)) {
      return;
    }

    // const hashedUrl: string = objectHash.sha1(url).toString();
    const hashedUrl: string = url;
    const siteBody: string = await this.getSite(url);
    const $: CheerioStatic = cheerio.load(siteBody);
    const linksOnSite: string[] = [];

    $("a").each((index, el) => {
      const urlObj: URL = new URL(el.attribs.href, url);
      let link: string = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      link =
        link[link.length - 1] === "/" ? link.slice(0, link.length - 1) : link;

      if (
        link === null ||
        link === undefined ||
        link.indexOf(".jpg") >= 0 ||
        !link.startsWith("http")
      ) {
        return;
      }
      const node: ICrawlerNode = {
        // id: objectHash.sha1(link),
        id: link,
        url: link,
        nodesIn: [hashedUrl],
        nodesOut: []
      };

      linksOnSite.push(node.id);
      if (this.map.has(node.id)) {
        const listedNode: ICrawlerNode = this.map.get(node.id);
        listedNode.nodesIn.push(hashedUrl);
      } else {
        this.map.set(node.id, node);
        this.stack.push(link);
      }
    });

    const mainNode: ICrawlerNode = {
      id: hashedUrl,
      url: url,
      nodesIn: [],
      nodesOut: linksOnSite
    };

    if (this.map.has(mainNode.id)) {
      var listedNode: ICrawlerNode = this.map.get(mainNode.id);
      listedNode.nodesOut = listedNode.nodesOut.concat(linksOnSite);
    } else {
      this.map.set(mainNode.id, mainNode);
    }
  }

  exportStructureGraph(): IGraph {
    let graphObject: IGraph = {
      nodes: [],
      links: []
    };

    this.map.forEach((v, key) => {
      // const id = key.replace(/^https?:\/\//, "");
      //   const pathName = new URL(key).pathname;
      key = key[key.length - 1] === "/" ? key.slice(0, key.length - 1) : key;
      const levels = key.split("/"),
        level = levels.length - 2,
        module = level > 0 ? levels[3] : null,
        leaf = levels.pop();

      const node: IGraphNode = {
        id: key,
        leaf,
        module,
        size: level === 1 ? 200: 50 * (1/level),
        level
      };
      graphObject.nodes.push(node);

      for (let i = 0; i < level; i++) {
        let parentKey = level > 0 ? levels.join("/") : null;

        if (this.map.has(parentKey)) {
          graphObject.links.push({
            source: parentKey,
            target: key,
            targetNode: node
          });
          break;
        }
        levels.pop();
      }
    });

    return graphObject;
  }

  exportLinkGraph(): IGraph {
    let graphObject: IGraph = {
      nodes: [],
      links: []
    };

    this.map.forEach((v, k) => {
      graphObject.nodes.push({ id: v.url });
      v.nodesOut.forEach(node => {
        const source = v.url;
        const target = this.map.get(node).url;
        if (source !== target) {
          graphObject.links.push({
            source,
            target
          });
        }
      });
    });
    return graphObject;
  }
}
